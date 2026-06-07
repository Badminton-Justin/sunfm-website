# GA4 + Google Ads — Attribution Health Report

**Audited:** 2026-06-07
**Auditor:** Manual /ads-attribution framework (skill not loaded)
**Verified against:** Live deployed homepage + source code + TRACKING-SETUP.md decisions

---

## Overall Verdict: ✅ Healthy for soft launch — 2 verifications needed in GA4 UI

You're in much better shape than most small businesses launching paid ads. The infrastructure is right; only thing missing is verifying a few GA4 admin settings haven't drifted from defaults and one strategic decision (Consent Mode V2).

---

## 1. Attribution Model — likely Data-driven, verify

### What it should be
**Data-driven attribution** (DDA). Default since September 2023 for new GA4 properties. Uses ML to distribute credit across all touchpoints in the conversion path based on actual user behavior.

Alternatives:
| Model | When to use | Why not for Sun FM |
|---|---|---|
| Cross-channel last-click | Simple, conservative | Under-credits awareness channels (e.g., your blog content that warms leads) |
| Cross-channel first-click | Awareness-heavy strategies | You're optimizing for direct response, not branding |
| Cross-channel linear | Even distribution | Naive, no behavioral weighting |
| Cross-channel position-based | First + last weighted more | Reasonable, but DDA is better when data is sufficient |
| Cross-channel time decay | Recent touches weighted more | Reasonable, but DDA is better |
| Ads-preferred last-click | Legacy | Deprecated for new properties |

### Caveat for low-volume periods
DDA requires **400+ conversions in the past 28 days** for full activation. Sun FM will be well below that for the first 3-6 months. During low-volume periods, GA4 falls back to **position-based** model behind the scenes — still better than last-click, and switches to true DDA automatically once volume crosses threshold.

### Verify (2 min)
1. GA4 → ⚙️ Admin → **Attribution settings** (under "Property settings → Attribution settings")
2. **Reporting attribution model**: should say **"Data-driven"**
3. If it says anything else (e.g., "Last click"), switch it. Note: changing this re-attributes historical data, which is fine before launch but disruptive after.

---

## 2. Conversion Window — verify match between GA4 and Google Ads

### What it should be
Match across both systems so the same click → conversion path is counted consistently:
- **Click-through window:** 30 days
- **Engaged-view window:** 3 days
- **Acquisition vs re-engagement:** 30 days

### Why match matters
If GA4 attributes a conversion to a click from 25 days ago but Google Ads only counts clicks from the past 7 days, the same conversion looks present in GA4 but missing in Google Ads. Smart Bidding then under-counts which campaigns deserve more budget.

### Verify (3 min)
**In GA4:**
1. Admin → Attribution settings
2. Acquisition conversion event lookback window: **30 days** (default)
3. Re-engagement conversion event lookback window: **30 days** (default)

**In Google Ads:**
1. Tools → Conversions → click `form_submit_success`
2. Click-through conversion window: **30 days** (default)
3. View-through conversion window: **1 day** (default)
4. Repeat for `movement_screen_completed`

Defaults match in both → no action needed if neither has been manually changed.

---

## 3. GCLID Capture & Persistence — ✅ working

### What we verified
- `next.config.js` has no middleware or rewrites that strip URL params → GCLID survives to the page ✅
- `@next/third-parties/google` loads gtag.js → gtag stores GCLID in `_gcl_aw` cookie (90-day default lifetime) ✅
- New attribution capture in `src/lib/attribution.ts` → GCLID also lands in Google Sheet log + email notification ✅
- End-to-end test row 7 (Justin test 5) confirmed working ✅

### What this gives you
- **Google Ads conversion attribution:** automatic via gtag (Google reads `_gcl_aw` cookie at conversion time)
- **CRM/Sheet attribution:** manual via our new `attribution` payload field
- **Cross-device attribution:** automatic for signed-in Google users via Enhanced Conversions

### Edge cases handled
- User clicks ad → lands on /start → leaves → comes back via direct or bookmark within 24 hours: GCLID still attributed (90-day cookie)
- User clicks ad → /start → navigates to /team → returns to /start → fills form: GCLID preserved (sessionStorage survives same-tab nav)
- User clicks ad → /start → closes browser → returns next day from email link: GCLID lost from sessionStorage but Google Ads still attributes via `_gcl_aw` cookie

### One residual gap (acceptable)
If a user clicks an ad, doesn't convert, returns weeks later via organic search and fills the form: your Sheet's GCLID column will be blank (sessionStorage gone), but Google Ads will still attribute the conversion to the original paid click via cookie. You lose Sheet-level attribution but not Google Ads optimization. Acceptable.

---

## 4. Cross-Device Tracking — enabled, verify Google Signals

### What's enabled
- ✅ Enhanced Conversions (tag-based) — confirmed in earlier setup
- ✅ Tag-based hashing of email/phone from form fields
- ⚠️ Google Signals: **needs verification** in GA4 admin

### Why Google Signals matters
Google Signals lets GA4 unify users across devices when they're signed into Google. Without it, a user who researches on mobile but converts on desktop appears as two separate users → attribution looks worse than reality.

### Verify (2 min)
1. GA4 → Admin → **Data collection and modification** → **Data collection**
2. **Google signals data collection** → should be **ON**
3. If OFF: toggle ON, accept Google's terms

### Caveat
- Only impacts users who are signed into Google on both devices
- Adds approximate cross-device attribution, not exact
- Requires US/CA traffic only — no GDPR overlay needed for California audience

---

## 5. Consent Mode V2 — defer recommendation stands

### Current state
- ❌ No `gtag('consent', 'default', ...)` call before gtag.js loads
- ❌ No cookie banner
- ❌ No CMP (Consent Management Platform) integrated

### Risk assessment for Sun FM

| Audience segment | Risk without Consent Mode V2 |
|---|---|
| **California only** (your target) | Low. CCPA doesn't require granular opt-in like GDPR. No conversion data loss. |
| **Stray EU/EEA traveler clicks ad** | Their conversion data is dropped (no consent → no tracking → no modeled conversion). |
| **Future EU/EEA expansion** | Required from day 1 of EU targeting. |

### Realistic ad targeting
Per CAMPAIGN-ARCHITECTURE.md, your geo-targeting is San Jose, Sunnyvale, Santa Clara, Campbell, Los Gatos, Cupertino — California only. EU/EEA exposure: essentially zero from paid ads (Google Ads geo-targeting filters those audiences out).

### Recommendation
**Defer Consent Mode V2 implementation** until any of:
- You decide to expand ads to EU markets (unlikely for a brick-and-mortar San Jose studio)
- California passes stronger consent legislation (CCPA 2.0 / CPRA strengthening)
- You start running Meta or LinkedIn ads where geo-targeting precision is weaker

If you ever decide to implement: the lift is 1-2 hours — drop a `<Script id="consent-default" strategy="beforeInteractive">` in `layout.tsx` before the GA4 component, with `gtag('consent','default', {ad_storage: 'denied', analytics_storage: 'granted', ...})`. Add a cookie banner that updates consent on accept. Google has a Consent Mode V2 helper integration for Next.js via `@next/third-parties` in 2026.

For now, the gap is **acceptable** for soft launch.

---

## 6. Identity Resolution — verify Blended

### What it should be
**Blended** identity (default in GA4). Combines:
1. User ID (you don't have one — visitors aren't logged in)
2. Google Signals (cross-device for signed-in Google users)
3. Device ID (cookies, anonymous identifiers)
4. Modeling (statistical extrapolation when data is missing)

### Alternatives
| Setting | What it does | Why not |
|---|---|---|
| Observed | User ID + Device + Google Signals only | Loses modeling fill for gaps |
| Device-based | Just cookies | Significantly under-counts cross-device users |

### Verify (1 min)
1. GA4 → Admin → **Reporting identity**
2. Should say **"Blended"**
3. If different: switch to Blended

---

## 7. GA4 ↔ Google Ads Link — ✅ verified live

Confirmed earlier this session via the "1 link request pending → View → Approve" flow. Link is active. Conversions importing successfully (form_submit_success Primary, movement_screen_completed Secondary).

No action needed unless you create a second Google Ads account, in which case re-link.

---

## What you need to verify in GA4 (combined checklist)

5 settings to confirm in one Admin session — **estimated time: 8 minutes**:

| # | Setting | Path | Expected value |
|---|---|---|---|
| 1 | Attribution model | Admin → Attribution settings | Data-driven |
| 2 | Acquisition lookback | Admin → Attribution settings | 30 days |
| 3 | Re-engagement lookback | Admin → Attribution settings | 30 days |
| 4 | Google Signals | Admin → Data collection | ON |
| 5 | Reporting identity | Admin → Reporting identity | Blended |

Plus 2 in Google Ads:

| # | Setting | Path | Expected value |
|---|---|---|---|
| 6 | Click-through window (form_submit_success) | Tools → Conversions → click action | 30 days |
| 7 | View-through window (form_submit_success) | Tools → Conversions → click action | 1 day |

---

## Attribution Posture Summary

| Layer | Status | Notes |
|---|---|---|
| URL → page (GCLID preservation) | ✅ Verified | No middleware strips params |
| Client-side capture (gtag) | ✅ Verified | `_gcl_aw` cookie set 90-day |
| Form → CRM (Sheet/email) | ✅ Verified live | Row 7 test passed |
| Ad click → GA4 conversion | ✅ Verified | Pipeline live |
| GA4 → Google Ads conversion import | ✅ Verified | Primary + Secondary active |
| Cross-device | ⚠️ Verify Google Signals | Almost certainly ON, but confirm |
| Identity resolution | ⚠️ Verify Blended | Default but worth confirming |
| Attribution model | ⚠️ Verify Data-driven | Default since 2023 but worth confirming |
| Conversion windows | ⚠️ Verify 30d/1d | Should match across systems |
| Consent Mode V2 | 🔲 Deferred | Acceptable for CA-only audience |
| Server-side tagging | 🔲 Deferred | Phase 2 once spend > $2K/mo |

---

## What this means for launch

You're ready. Run the 8-minute GA4 settings verification above, then nothing else is blocking from an attribution standpoint. The most likely outcome is all 5 GA4 settings are already at their defaults (which are the right values) — verifying is just confirming nothing has drifted from a prior owner action or a Google update.

If anything's off-default: change it now BEFORE traffic starts flowing. Changing attribution settings mid-campaign creates analytical noise (you'd see step-changes in attribution that aren't real performance changes).
