# Sun FM — Google Ads Health Audit

**Audit date:** 2026-06-13
**Account ID:** 950-229-6068
**Data window:** 2026-06-01 → 2026-06-13 (12 days)
**Total spend:** $100.17
**Total clicks:** 16
**Total conversions:** 0

> **Data limitation caveat.** Standard Google Ads audits expect ≥30 days of data + a non-zero conversion baseline. This account has 12 days and zero paid conversions. Findings below are split into two buckets:
>
> - **Structurally evaluable** — settings, ad config, tracking setup, negatives, match types. These are reliable now.
> - **Performance-dependent** — Quality Score, CVR, CPA, real wasted spend. These need at least 30 days + 30 conversions to score honestly. Flagged as "TOO EARLY" rather than guessed.

---

## Health Score

```
Google Ads Health Score: 70/100 (Grade: C)

Conversion Tracking: 70/100  ████████░░  (25%)
Wasted Spend:        85/100  ██████████  (20%)
Account Structure:   70/100  ███████░░░  (15%)
Keywords:            75/100  █████░░░░░  (15%)
Ads:                 40/100  ████░░░░░░  (15%)  ← BIGGEST DRAG
Settings:            75/100  ██████████  (10%)
```

The structural foundation is solid. The two areas pulling the score down are **ad assets/extensions** (zero extensions account-wide, all ad strength Poor or Average) and **conversion measurement granularity** (only 1 of 5 conversion actions feeds Smart Bidding).

---

## Conversion Tracking — 70/100

**What's set up:**
- 5 conversion actions defined ✓
- `sunfm-website (web) form_submit_success` — ENABLED, PRIMARY, included in conversions metric ✓
- `sunfm-website (web) movement_screen_completed` — ENABLED, **NOT primary, NOT included** ⚠
- `sunfm-website (web) close_convert_lead`, `qualify_lead`, `purchase` — all HIDDEN, not active ⚠
- Attribution model: data-driven (all actions) ✓
- gtag.js fires on form submissions (verified in code) ✓

**Gaps:**
- **Movement screen completion isn't counted as a conversion.** Movement screen is your secondary funnel asset, but Smart Bidding gets no signal from it. Mark it as a **secondary conversion** (include in "All conversions" but not primary) so bidding can use it as a stronger lead signal without diluting the primary metric.
- **Enhanced Conversions not verified.** Requires checking the gtag config — can't be confirmed via API alone.
- **Consent Mode v2** — not in scope (US-only audience).
- **Server-side tagging** — not implemented. Optional at this scale; nice-to-have when scaling past $5K/month spend.

**Score reasoning:** Foundation is correct, but only one signal is feeding bidding. With 0 conversions in the first 12 days, every additional valid signal type matters.

---

## Wasted Spend — 85/100

**Strong:**
- All keywords are PHRASE or EXACT match (no untargeted BROAD) ✓
- Account-level negative keyword shared list with **163 members** attached to both non-brand campaigns ✓
- Brand and Non-Brand campaigns separated ✓
- Geo targeting: PRESENCE (positive + negative) — only serves to people physically in target areas ✓
- Search Partners + Display Network both OFF ✓
- Search Terms Report reviewed; 4 competitor negatives added today (`2b fit cupertino`, `westca gym`, `evolution trainers`, `exercise coach willow glen`)

**Gaps:**
- **Duplicate orphaned shared negative list** — there are TWO lists both named "Sun FM Account Negatives" (159 members vs. 163 members). The 159-member one isn't attached to any campaign. Delete it to avoid future confusion.
- **TOO EARLY:** real wasted-spend dollar value. With $100 spent and 0 conversions there's no profitability denominator yet.

---

## Account Structure — 70/100

**Solid:**
- 3 campaigns split by intent: Brand Defense / Non-Brand Location / Non-Brand Intent ✓
- Non-Brand Location split into 6 ad groups by city (San Jose, Sunnyvale, Cupertino, Santa Clara, Mountain View, Other Cities) ✓
- Non-Brand Intent split into 5 themed ad groups (Desk Worker Fix, Mobility, Return to Training, Over 40, Busy Professionals) ✓
- Naming convention consistent: `AG_<Theme>` ✓
- Each ad group has 5-10 keywords — tight thematic grouping ✓

**Gaps:**
- **Only 1 RSA per ad group.** Google's published guidance is **2-3 RSAs per ad group** for split testing. With one RSA, you have no way to test alternate messaging variants — and Smart Bidding can't pick a winner. Adding a 2nd RSA per ad group is the single highest-leverage structural change.

---

## Keywords — 75/100

**Working:**
- Match type strategy: PHRASE for most, EXACT for highest-intent. No BROAD. ✓
- Impression share on the active campaign: 44% (room to grow but healthy for week 2) ✓
- No cannibalization between campaigns (Brand vs Non-Brand vs Intent split is clean) ✓

**TOO EARLY:**
- Quality Score distribution — Google requires ~50 clicks per keyword before assigning a meaningful QS. Most keywords here have 0-2 clicks.
- Per-keyword CVR — same reason.

**One specific observation worth keeping:** `private personal trainer san jose` is showing a **17.4% CTR on 23 impressions** in the Non-Brand Location → San Jose ad group. That's well above the 6.66% PASS threshold. Don't change anything — just note that this keyword is a leading indicator of which messaging is resonating.

---

## Ads — 40/100  ← BIGGEST PROBLEM

**The bad:**

| Campaign | Ad Group | Ad Strength |
|---|---|---|
| Brand Defense | AG_Brand_Exact | **POOR** |
| Non-Brand Intent | AG_Desk_Worker_Fix | **POOR** |
| Non-Brand Intent | AG_Mobility | **POOR** |
| Non-Brand Intent | AG_Over_40 | **POOR** |
| Non-Brand Intent | AG_Busy_Professionals | AVERAGE |
| Non-Brand Intent | AG_Return_to_Training | AVERAGE |
| Non-Brand Location | All 6 city ad groups | AVERAGE |

**Zero Good or Excellent ad strength across all 12 ad groups.** This directly affects ad rank and CPC.

Headlines (14-15) and descriptions (4) are at recommended counts, so the issue isn't volume — it's likely:
- Headlines too similar to each other (not enough variation in messaging angles)
- Headlines don't include enough keyword themes from the ad group
- Descriptions could use stronger CTAs and value props

**The worse:**

**Zero extensions configured account-wide.** Confirmed via API: no sitelinks, no callouts, no structured snippets, no call extensions, no business name/logo, no image extensions, no location extension.

Extensions are free real estate — they typically lift CTR by 10-30% and significantly improve ad rank. This is the single biggest CTR-lift opportunity in the entire account.

**Minimum extension targets:**

| Type | Min count | Why |
|---|---|---|
| Sitelinks | 4-6 | Drive users to /tools/movement-screen, /start, /training, /about, /reviews |
| Callouts | 4-6 | "12,000+ Sessions Coached", "San Jose Studio", "1-on-1 Personal Training", "Free Movement Screen" |
| Structured Snippets | 1 | Header: "Services" → "Personal Training, Mobility Coaching, Strength Training, Movement Assessment" |
| Call extension | 1 | Phone number (mobile lifts CTR sharply) |
| Business name/logo | 1 each | Required by Google to get the "verified business" badge on ads |
| Location extension | 1 | If GBP is verified, this surfaces the studio address |

---

## Settings — 75/100

**Solid:**
- Bid strategy: MAXIMIZE_CONVERSIONS on all 3 ✓ (in principle)
- Geo: PRESENCE ✓
- Network: Google Search only — no Display, no Search Partners ✓
- Budgets: $5 / $20 / $15 daily for Brand / Location / Intent — appropriate test sizes
- Optimization scores: 75.9% (Brand), 53.2% (Location), 78.9% (Intent) — Google's own grades

**Concern:**
- **Maximize Conversions on a 0-conversion account doesn't work.** This is exactly why Non-Brand Intent has had 0 impressions in 36 hours. The algorithm has nothing to optimize toward. For the first 2-4 weeks of any new account, **Maximize Clicks** is structurally better — it gives Smart Bidding click-data to start learning on, and once you accumulate 15-30 paid conversions, you switch back to Maximize Conversions.
- Decision point on Non-Brand Intent: switch to Maximize Clicks with $4 CPC cap if still 0 impressions tomorrow morning.

---

## Quick Wins (priority-ordered by CTR/conversion impact)

### Today (45 min total)

1. **Add account-level extensions** (single biggest lift). Tools → Assets → +Asset:
   - 6 sitelinks
   - 6 callouts (specific number anchors are best — "12,000+ Sessions", "San Jose Studio", etc.)
   - 1 structured snippet (Services header)
   - Business name + logo
   - Call extension (phone number)
   - Location extension (link to verified GBP)
2. **Mark `movement_screen_completed` as a secondary conversion** so Smart Bidding can use it. Goals → Conversions → edit action → "Include in 'Conversions'" → Secondary.
3. **Delete the orphaned 159-member shared negative list.** Tools → Shared Library → Negative Keyword Lists → delete the unattached one.

### Tomorrow morning (15 min)

4. **Decision on Non-Brand Intent:** if still 0 impressions, switch bid strategy to **Maximize Clicks** with $4 CPC cap.
5. **Submit a test consultation** to verify `form_submit_success` actually fires the Google Ads conversion event. If it doesn't, every future conversion is invisible to bidding.

### This week (1-2 hr)

6. **Add a 2nd RSA per ad group.** Different angle / different CTA. This enables variant testing and gives Smart Bidding room to optimize.
7. **Improve the POOR ad strength ad groups.** Focus on the 4 POOR ones first (Brand Defense, AG_Mobility, AG_Desk_Worker_Fix, AG_Over_40). Add 3-5 headlines per ad that lean harder into the specific ad group theme (e.g., AG_Mobility headlines should literally include the word "mobility" multiple times).

### Day 14 — Saturday 2026-06-20

8. **Real performance review.** ~$200 spent, hopefully a few conversions, enough data to start judging keywords on more than CTR.

### Day 30 — Sunday 2026-07-05

9. **Smart Bidding exits learning.** Bid strategy decisions become meaningful here, not before.

---

## What I'm NOT recommending yet (and why)

- **Don't pause `best personal trainer san jose` despite the $18 CPC.** High-intent commercial query, sample size of 1 click too small to act on.
- **Don't add new keywords.** Existing keyword set hasn't gathered enough data yet.
- **Don't change daily budget by more than 20%.** Resets Smart Bidding learning.
- **Don't add device/audience bid adjustments.** No performance data to base them on.
- **Don't enable Search Partners or Display.** Lower-intent traffic; revisit at Month 3.
- **Don't experiment with AI Max for Search.** Account is too new — needs the negative list scaled 3x and a working conversion baseline before AI Max is safe. Revisit after 60 days.
