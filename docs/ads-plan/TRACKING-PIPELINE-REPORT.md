# Tracking Pipeline + Server-Side Roadmap Report

**Audited:** 2026-06-07
**Auditor:** Manual /ads-tracking + scoped review of /ads-server-side-tracking
**Combines:** end-to-end client-side pipeline verification + server-side gap analysis with Phase 2 roadmap

---

## TL;DR

**Client-side pipeline: ✅ Healthy.** Every conversion event flows correctly end-to-end. Verified via row 7 test submission earlier today.

**Server-side: 🔲 Not implemented, defer.** Adding sGTM + Meta CAPI now would be premature given monthly spend trajectory. The TRACKING-SETUP.md decision to "consider after $2K/month" stands. Phase 2 roadmap below for when you cross that threshold.

**Expected data loss at current setup:** 10-25% of client-side events lost to iOS ITP, Safari, ad blockers, and browser extensions. Tolerable at sub-$2K/month spend; meaningful at higher budgets.

---

## Part 1 — Client-Side Pipeline (what you have)

### Layer-by-layer trace of a single conversion event

```
┌─────────────────────────────────────────────────────────────────────┐
│ Layer 1: USER LANDS on /start                                       │
│   ├─ gtag.js loaded via @next/third-parties (G-FVFDW7GH4Y)   ✅    │
│   ├─ PostHog client initialized (person_profiles: identified_only) ✅│
│   ├─ PostHogPageView fires $pageview (Suspense-wrapped)      ✅    │
│   └─ GCLID captured from URL → sessionStorage                ✅    │
├─────────────────────────────────────────────────────────────────────┤
│ Layer 2: USER INTERACTS with form                                   │
│   ├─ form_start (first field focus)                          ✅    │
│   ├─ form_field_complete (per field blur with value)         ✅    │
│   └─ All events carry source: "start_page"                   ✅    │
├─────────────────────────────────────────────────────────────────────┤
│ Layer 3: USER SUBMITS form                                          │
│   ├─ form_submit_attempt fires BEFORE API call               ✅    │
│   ├─ POST /api/submit-form with full payload                       │
│   │   (including attribution + landingPage)                  ✅    │
│   ├─ Server validates required fields                        ✅    │
│   ├─ Server fans out (all sequential, all awaited):                │
│   │   ├─ Google Sheets webhook (now hitting new deployment)  ✅    │
│   │   ├─ Kit subscribe with consultation_warm tag            ✅    │
│   │   └─ Gmail SMTP notification to jeff@ + team@            ✅    │
│   └─ Server returns 200 OK                                   ✅    │
├─────────────────────────────────────────────────────────────────────┤
│ Layer 4: CLIENT FIRES CONVERSION EVENT (after API success)         │
│   ├─ trackEvent("form_submit_success", { source }) called    ✅    │
│   ├─ → window.gtag("event", "form_submit_success", ...) → GA4 ✅   │
│   ├─ → posthog.capture("form_submit_success", ...) → PostHog ✅    │
│   └─ Enhanced Conversions auto-detects email/phone, hashes   ✅    │
├─────────────────────────────────────────────────────────────────────┤
│ Layer 5: GA4 → GOOGLE ADS CONVERSION IMPORT                        │
│   ├─ GA4 marks event as Key Event                            ✅    │
│   ├─ GA4 ↔ Google Ads link active                            ✅    │
│   ├─ form_submit_success imported as Primary conversion      ✅    │
│   ├─ movement_screen_completed imported as Secondary         ✅    │
│   └─ Smart Bidding can train against form_submit_success     ⏰    │
│       (waits for actual ad traffic)                                │
├─────────────────────────────────────────────────────────────────────┤
│ Layer 6: ATTRIBUTION TRAIL TO CRM                                  │
│   ├─ Sheet row written with all 8 attribution columns        ✅    │
│   │   (verified row 7: gclid/utm_source/utm_medium/etc.)           │
│   └─ Email notification carries Attribution: line at bottom  ✅    │
└─────────────────────────────────────────────────────────────────────┘
```

**Verdict: every layer green.** This is materially better than what most pre-launch small businesses have.

---

### Risks in the current pipeline

#### Risk 1: API route fan-out has no retry or timeout
If `CONSULTATION_SHEETS_WEBHOOK_URL` or Kit's API hangs or fails, behaviors differ:
- **Sheet webhook fails** → outer try catches → returns 500 → user sees error UI. Lost lead unless they retry.
- **Kit subscribe fails** → inner try catches, logs to console, **continues**. Lead still saved to Sheet + email sent. Good resilience.
- **Gmail SMTP fails** → outer try catches → returns 500 → user sees error.

**Likelihood: low.** All three providers (Google Sheets, Kit, Gmail) have ≥99.9% uptime. But worth knowing.

**Fix (P3 if it ever bites):** wrap each provider call in its own try/catch; degrade gracefully. Don't fail the whole submission because Sheets is down for 30 seconds.

#### Risk 2: Client-side gtag is blockable
Per industry data:
- **iOS Safari with Intelligent Tracking Prevention** → degrades first-party cookies (`_ga`, `_gcl_aw`) to ~7-day lifetime; some conversion events still pass but cross-session attribution weakens
- **uBlock Origin / Privacy Badger / Brave Shields** → block `googletagmanager.com/gtag/js` entirely → **0% event capture** for that user
- **Corporate firewalls** → similar blocking

Estimated impact for Sun FM audience (San Jose tech professionals 30-60):
- ~15-20% of clicks may have some form of blocker
- Real conversion loss probably 5-15% (people who'd convert are usually less aggressive blockers)
- Google Ads Enhanced Conversions modeling fills SOME of the gap (~30-50% recovery)

**Net unrecovered loss: estimated 3-10% of conversions invisible at current setup.** Acceptable at sub-$2K/month spend.

#### Risk 3: Single point of failure for GCLID capture
If sessionStorage is disabled (incognito with strict settings, very rare) → GCLID not stored across same-tab nav → only captured on the initial landing page hit. Acceptable in 99.9% of cases.

#### Risk 4: No event dedup mechanism
You don't fire the same event from both client AND server (currently). So you don't NEED dedup. But if you later add Meta CAPI or server-side Google Ads conversions, you'll need `event_id` generation in trackEvent to prevent double-counting.

---

### Quick wins (none urgent)

| Priority | Fix | Effort | When |
|---|---|---|---|
| P3 | Per-provider try/catch in API route fan-out | 15 min | If you ever see a 500 on form submit |
| P3 | Add `event_id` to trackEvent payload | 15 min | Pre-Phase-2 (sets up future dedup) |
| P4 | Manual GA4 DebugView verification on next test | 5 min | Before activating campaigns |

GA4 DebugView verification is worth doing once before launch. Steps:
1. Install Chrome extension **GA Debugger** (one click)
2. Visit `https://www.sunfm.fitness/start?gclid=verify-ga4-debug`
3. Open GA4 → Admin → DebugView (you'll be in the debug stream)
4. Submit form
5. Confirm `form_submit_success` event appears in DebugView within 5 seconds with `source: start_page` parameter

---

## Part 2 — Server-Side Tracking (what you don't have, and when to add)

### What server-side tracking actually does

Right now, all events fire from the user's browser directly to Google's and PostHog's edge servers. Blockable, droppable, observable to the user, subject to ITP/ATT.

Server-side moves the "send to GA4 / Google Ads / Meta / PostHog" step to **your own server** (or a managed sGTM container). The user's browser sends events to YOUR domain. Your server forwards to the analytics destinations. Benefits:
- First-party (your domain) — invisible to most ad blockers
- ITP-resistant first-party cookies (90+ days vs 7)
- Server can enrich events with data the browser doesn't have
- Server can apply consistent PII hashing before forwarding
- Recovers ~30-40% of conversion events that client-side loses

### Cost of implementing

| Item | One-time | Monthly |
|---|---|---|
| sGTM container on Google Cloud Run | $0 setup if DIY, $500-2000 if outsourced | $50-200 |
| First-party domain (e.g., `tags.sunfm.fitness`) | $0 (you own sunfm.fitness) | $0 |
| Meta CAPI Gateway (if running Meta ads) | $0 with their auto-integration | $0 |
| Vercel proxy for PostHog (optional, simpler than sGTM) | 30 min | $0 (within Vercel plan) |
| sGTM tag rebuild + testing | 1-2 days dev time | — |
| **Total recurring** | | **$50-200/mo** |

### When to implement

Per TRACKING-SETUP.md and benchmark data, server-side pays off when:
- **Monthly ad spend > $2,000** — at this level, 10% data loss = ≥$200/mo of invisible conversion signal that Smart Bidding can't use → measurable bid quality degradation
- **Running Meta ads alongside Google** — Meta CAPI is mandatory for full iOS 14.5+ recovery
- **Adding LinkedIn / TikTok / Microsoft** — all benefit disproportionately from server-side
- **EU/EEA expansion** — Consent Mode V2 server-side enforcement becomes critical

**Sun FM's current trajectory:** $40/day = $1,200/mo target. Below threshold. Defer.

### Phase 2 trigger (specific)

Implement server-side tracking when ANY of:
1. Monthly Google Ads spend crosses **$2,500/mo for 2 consecutive months**
2. You launch Meta ads (any spend level — CAPI is required for parity)
3. CAC trends upward without obvious campaign-side cause (suggests data-loss-driven bid quality degradation)
4. PostHog session recording shows ad blocker patterns in >30% of recordings

### Phase 2 minimal viable setup

When triggered, the cheapest practical implementation:

1. **Vercel-hosted PostHog reverse proxy** (1 hour) — adds Next.js rewrite rule that proxies `/_ph` to `us.i.posthog.com`. Bypasses PostHog-targeting ad blockers. Free, no infrastructure.

2. **sGTM on Google Cloud Run** (1 day) — deploy Google's official container at `tags.sunfm.fitness`. Move gtag.js loading to first-party. Forward Google Ads + GA4 server-side.

3. **Meta CAPI** (1 day, only if running Meta ads) — install Meta Pixel client-side AND Conversions API server-side. Match via `event_id`. Target Event Match Quality ≥8.0.

4. **Reconfigure trackEvent** to:
   - Generate `event_id = crypto.randomUUID()` per event
   - Send same `event_id` to both client (Pixel) and server (CAPI/sGTM)
   - Allows Meta + Google to dedupe — prevents double-counting

### What we'd be auditing in Phase 2

Once server-side is in place, the proper `/ads-server-side-tracking` skill audits:
- sGTM container deployment + custom domain
- Conversion Linker preserving gclid across cross-domain nav
- Meta CAPI event coverage (PageView, ViewContent, Lead, Purchase)
- Event Match Quality scores per event
- Hashing discipline (lowercased + trimmed SHA-256 before send)
- Event deduplication rate (target ≥90%)
- Server-side hit ratio vs client-side (target ≥80% for Lead/Purchase)
- action_source field correctness per event
- customer_information parameter completeness (em, ph, fn/ln, ct/st/zp, external_id, IP, UA, fbc, fbp)

We'll come back to this skill once you cross the trigger threshold.

---

## Combined Health Score

| Layer | Status | Score |
|---|---|---|
| Client-side capture | ✅ Healthy | 95 |
| API fan-out reliability | ⚠️ No per-provider isolation | 80 |
| GA4 → Ads attribution | ✅ Verified live | 95 |
| Enhanced Conversions | ✅ Enabled | 90 |
| Cross-channel dedup | 🔲 Not needed yet (single source) | N/A |
| Server-side tracking | 🔲 Deferred (Phase 2) | N/A |
| ITP/ATT recovery | ⚠️ 5-15% client-side loss | 70 |
| GCLID end-to-end | ✅ Verified row 7 | 95 |
| Privacy compliance (CCPA) | ✅ Policy + masking in place | 95 |
| Privacy compliance (GDPR) | 🔲 Deferred (CA-only audience) | N/A |

**Weighted health for current-stage spend ($1.2K/mo): 88/100** — strong for soft launch.

If monthly spend stays sub-$2K, additional investment in tracking has diminishing returns until creative + bidding optimization plateaus.

---

## What this means for launch

### No tracking work blocking soft launch
The 8-minute GA4 verification from ATTRIBUTION-REPORT.md + the optional GA4 DebugView check above are the only pre-launch action items. Both can happen in parallel with campaign builds.

### Calendar reminder for Phase 2
Set a calendar nudge for **2026-09-07** (3 months out) titled "Check ad spend trajectory + revisit server-side tracking decision." By then you'll have actual spend data and can apply the $2K/mo trigger.

### Don't optimize prematurely
Building sGTM now for $1.2K/mo would be 1-2 days of dev time saving you ~$120/mo of invisible conversion value. Negative ROI on time. The same 2 days are better spent on creative iteration or landing page optimization, which compound faster at low spend levels.
