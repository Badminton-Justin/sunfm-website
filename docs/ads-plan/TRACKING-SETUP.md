# Sun FM — Tracking Setup Checklist

**Status of existing infrastructure:** Strong. Most of the foundation is already in place from today's work.

---

## ✅ Already Live (Verified This Session)

| Item | Status | Notes |
|------|--------|-------|
| GA4 property | ✅ Active | ID 530996908, measurement ID G-FVFDW7GH4Y |
| `gtag.js` on every page | ✅ Firing | Via @next/third-parties/google in layout.tsx |
| GA4 events: `movement_screen_completed` | ✅ Firing | Verified in PostHog Live events |
| GA4 events: `form_submit_success` | ✅ Firing | Verified in PostHog Live events |
| GA4 events: `form_submit_attempt` | ✅ Firing | For funnel diagnostics |
| Section view + scroll tracking | ✅ Firing | Via TrackedSection components |
| PostHog client SDK | ✅ Active | With PII masking on all form inputs |
| PostHog session recording | ✅ Active | Form inputs masked, recording works |
| PostHog autocapture | ✅ Active | Tracking clicks, form interactions automatically |
| Custom trackEvent() helper | ✅ Live | Fires to BOTH GA4 and PostHog from same call |
| Site phone in tel: link | ✅ Live | Footer + GBP-matched format |
| Telephone in PersonalTrainer schema | ✅ Live | All schema layers consistent |
| Kit subscription on form submit | ✅ Active | `consultation_warm` tag, API key set |
| Email notification on form submit | ✅ Active | Via Gmail SMTP to jeff@sunfm.fitness + team@badmintonjustin.com |
| Google Sheets webhook on form submit | ✅ Active | Logs every consultation request |
| /start landing page with referral tagged `google-ads` | ✅ Live | Distinguishes paid leads from organic in sheet + email |

---

## ⚠️ Still To Do Before Launch

### 1. Mark GA4 events as Key Events (5 min)
- Go to **analytics.google.com** → Admin → Events (under Data display)
- Toggle "Mark as key event" for:
  - `form_submit_success` ← **primary conversion**
  - `movement_screen_completed` ← secondary conversion

### 2. Link Google Ads ↔ GA4 (10 min)
- In Google Ads: **Tools → Linked accounts → Google Analytics 4** → link the sunfm-website property
- In GA4: **Admin → Linked accounts → Google Ads** → confirm Sun FM account
- Wait 24 hours for full sync

### 3. Import GA4 conversions into Google Ads (10 min)
- Google Ads: **Tools → Conversions → New conversion action → Import from Google Analytics 4**
- Select `form_submit_success` → **mark as Primary conversion** (for Smart Bidding)
- Select `movement_screen_completed` → mark as Secondary (counted, not optimized for)

### 4. Verify Google Ads tag installation
- Google Ads: **Tools → Tags → Google Ads tag** → confirm sourced from GA4 (since we use gtag, the GA4 tag handles Google Ads conversions natively — no separate Google Ads tag install needed)

### 5. Set up Enhanced Conversions for Web (15 min)
- Google Ads: **Tools → Conversions → Customer data** → enable Enhanced Conversions
- Method: **Tag-based** (uses gtag, no code change needed)
- Specify: hash user-provided email/phone from `form_submit_success` event
- Verify: send a test form submission → Google Ads should report email hash within 48 hours

### 6. Apply for Google Ads Developer Token (in flight, 3-7 days)
- Application URL: https://ads.google.com/aw/apicenter
- Required for `/ads-analytics` and `/ads-audit` to pull live data
- Not required for launching campaigns

---

## 🔲 Optional / Phase 2 Setup

### Server-Side Tracking (consider after $2,000/month spend)
- **sGTM (server-side Google Tag Manager)** — improves attribution from iOS users and ad blockers
- **Vercel proxy for PostHog ingest** — reduces ad blocker drop-off (~10-25%)
- Run `/ads-server-side-tracking` skill for full setup guide when budget justifies

### Call Tracking
- Currently: just the static (408) 761-4963 displayed in ads and on site
- Phase 2: integrate Google Forwarding Numbers for per-campaign call attribution
- Set up: Google Ads → Tools → Call extensions → enable Call reporting
- Threshold: 30-second minimum call counts as qualified lead

### Meta Pixel + CAPI (if running Meta ads in Phase 2)
- Install Meta Pixel via @next/third-parties or direct script tag in layout.tsx
- Set up CAPI (Conversions API) for server-side dedup
- Verify with Meta's Test Events tool

### Microsoft UET Tag (when launching Bing import)
- Microsoft Ads → Tools → UET Tag → create tag
- Install in layout.tsx alongside GA4 + PostHog
- Define conversion goals matching GA4 events

---

## Attribution Setup

### GA4 Attribution Model
- Currently: **Data-Driven Attribution (default)** — good
- Verify: Admin → Attribution settings → Reporting attribution model = "Data-driven"
- DO NOT switch to Last-click unless Search starts under-reporting (rare)

### Conversion Window
- GA4 default: 30-day click + 1-day view
- Match in Google Ads: Tools → Conversions → form_submit_success → Conversion window = 30 days

### Cross-Device Tracking
- Auto-enabled via gtag + Enhanced Conversions
- Requires Signed-in Google users for full cross-device attribution
- Don't worry about it — default behavior is fine

### Consent Mode V2
- Currently: NOT implemented (no cookie banner)
- Risk level: low (Sun FM is California-based, CCPA-compliant via clear privacy policy; not subject to GDPR)
- Phase 2: add Consent Mode V2 + cookie banner if expanding to EU clients
- For now: skip

---

## Verification Checklist Before Launch

Run through this checklist 24 hours before launching campaigns:

- [ ] Visit `/start` from incognito → submit test form → verify:
  - [ ] Email arrives at jeff@sunfm.fitness within 1 minute
  - [ ] Row appears in consultation Google Sheet
  - [ ] Kit subscriber added with `consultation_warm` tag
  - [ ] PostHog Live events shows `form_submit_success` with `source: start_page`
  - [ ] GA4 DebugView shows `form_submit_success` event
- [ ] In Google Ads → Tools → Conversions:
  - [ ] `form_submit_success` is imported and marked Primary
  - [ ] Status shows "Recording conversions" (not "No recent conversions")
- [ ] In Google Ads → Reports → Conversion Window:
  - [ ] Set to 30-day click, 1-day view
- [ ] In GA4 Admin → Attribution:
  - [ ] Reporting model = Data-driven
- [ ] PostHog Funnel set up: Pageview → form_submit_attempt → form_submit_success
- [ ] PostHog Funnel set up: Pageview → movement_screen_start → movement_screen_completed
- [ ] GBP linked to Google Ads (Tools → Linked accounts) for location extensions

---

## Tracking Stack Diagram

```
User lands on /start
   ↓
PostHog autocapture fires → us.i.posthog.com
   ↓
gtag.js fires → google-analytics.com/g/collect
   ↓
User submits form
   ↓
Client-side: trackEvent("form_submit_success") fires to BOTH:
   ├── GA4 (via gtag)
   └── PostHog (via posthog.capture)
   ↓
POST /api/submit-form (Next.js API route)
   ↓
Server-side fan-out:
   ├── Google Sheets webhook → consultation log row
   ├── Kit API → subscribe email + tag consultation_warm
   └── Gmail SMTP → email notification to jeff@ + team@
   ↓
GA4 conversion → Google Ads (linked accounts pull this in for ad optimization)
```

---

## Conversion Events Reference

| Event Name | Fires When | GA4 Type | Use For |
|------------|-----------|----------|---------|
| `$pageview` | Every page load | Automatic | Funnel analysis |
| `form_start` | First form input focus | Custom | Funnel diagnostic |
| `form_field_complete` | Each field blur with value | Custom | Drop-off analysis |
| `form_submit_attempt` | Submit button clicked | Custom | Form error rate |
| **`form_submit_success`** | API returns 200 | **Key Event** | **Primary conversion** |
| `form_submit_error` | API returns non-200 | Custom | Error monitoring |
| `movement_screen_start` | Quiz started | Custom | Movement Screen funnel |
| `movement_screen_question_answered` | Each question | Custom | Drop-off analysis |
| **`movement_screen_completed`** | Quiz finished | **Key Event** | **Secondary conversion** |
| `movement_screen_pdf_download` | PDF download button clicked | Custom | Lead magnet engagement |
| `cta_click` | Generic CTA button clicks | Custom | A/B test signals |
| `section_view` | Page section scrolled into view | Custom | Engagement |

---

## Data Hygiene

### Filter out internal traffic
- GA4: Admin → Data filters → add IP range for Jeff's home/office IPs (excludes from reports)
- PostHog: Settings → Project → Filter out internal users — add Jeff's emails

### UTM Tagging (Google Ads handles automatically)
- Google Ads auto-tagging is **ON by default** (verified in `gclid` URL params)
- DO NOT add manual UTM parameters to ad URLs — Google's auto-tag handles attribution
- For Meta/Bing: use UTM parameters manually

### Privacy Compliance
- Privacy policy mentions analytics + session recording (verify on site or add in next month)
- PII masking confirmed working in PostHog (form inputs masked in session replays)
- No cookie banner needed for CCPA compliance (California-only audience)
