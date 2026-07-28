# Sun FM — Google Ads Health Audit

**Audit date:** 2026-07-27
**Account ID:** 950-229-6068
**Data window:** 2026-06-01 → 2026-07-27 (57 days, all-time) + last-30-day cut for freshness
**Total spend (all-time):** $1,822.04
**Total spend (last 30d):** $1,216.10
**Total conversions (all-time, Google's blended metric):** 5 — but only **4 are `form_submit_success`** (real booked consultations); the 5th is a phone call conversion, which per `ADS-STRATEGY.md` is explicitly not the tracked primary metric.

> **Previous audit:** 2026-06-13, at day 12 ($100 spend, 0 conversions). Findings were split into structural (evaluable then) vs. performance-dependent (flagged "TOO EARLY"). This audit is 57 days in — the account has crossed the 30-day/30-click thresholds needed to score Quality Score and wasted spend honestly. **The headline: several structural quick wins from the last audit got done, but the real performance data that's now available reveals a serious problem the last audit couldn't see.**

---

## Health Score

```
Google Ads Health Score: 60/100 (Grade: C, down from 70)

Conversion Tracking: 72/100  ███████░░░  (25%)
Wasted Spend:        45/100  ████░░░░░░  (20%)  ← NEW, was N/A
Account Structure:   78/100  ████████░░  (15%)
Keywords:            25/100  ██░░░░░░░░  (15%)  ← NEW, was N/A — BIGGEST DRAG
Ads:                 72/100  ███████░░░  (15%)
Settings:            70/100  ███████░░░  (10%)
```

The score dropped from 70 to 60 not because the account got structurally worse — it actually got better in several ways — but because the last audit's "TOO EARLY" placeholders for Wasted Spend and Keywords have now resolved into real numbers, and those numbers are bad. Structural fixes don't matter yet if the account isn't converting economically.

---

## The headline number: true CAC is ~$455, not $100-150

Filtering Google's blended "conversions" metric down to the actual target (`form_submit_success`, the booked-consultation event): **4 conversions on $1,822.04 spent = $455.51 per booked consultation.**

Your own `ADS-STRATEGY.md` decision gates say: *"Pause and reassess if 4 consecutive weeks with CAC above $300."* You're at 57 days with a CAC roughly 50% above even that reassessment trigger, and 3-4.5x the stated $100-150 target. All 4 form-submit conversions landed inside the last 30 days — the first ~4 weeks produced zero — so the trend is improving, but not fast enough to be on track for the month-3 target ($80-130 CAC).

This isn't a tracking problem — the pipeline works end-to-end (4 real leads did get captured and attributed correctly). It's a Quality Score and landing page problem, detailed below, which is inflating CPCs and depressing conversion rate at the same time.

---

## What got fixed since the last audit (real progress)

- **Extensions added.** Zero before, now: 4 sitelinks + 5-9 callouts + 1 structured snippet per campaign, plus an account-level call extension. This was the single biggest recommendation from June 13 and it's done.
- **2nd RSA per ad group added.** Most ad groups now run 2-3 RSAs (old single RSA paused, replaced). This enables the variant testing that was structurally impossible before.
- **RSA ad strength improved.** `AG_Mobility` and `AG_Over_40` both moved from POOR to GOOD. Account-wide: 6 GOOD, 18 AVERAGE, 3 POOR (was 0 GOOD / 8 AVERAGE / 4 POOR).
- **Orphaned negative list deleted.** The duplicate 159-member "Sun FM Account Negatives" list is now REMOVED; only the 163-member active one remains.
- **`movement_screen_completed` secondary conversion — still NOT done.** This was flagged as a 5-minute quick win on June 13 and is unchanged 6 weeks later: still `primary: False, include_in_conversions_metric: False`. Smart Bidding is still getting zero signal from your mid-funnel asset. This is the single easiest fix left on the list.

---

## NEW: Keywords — 25/100 (biggest problem, wasn't visible before)

**Impression-weighted average Quality Score: 1.5** (out of 10). Of 35 keywords with any impressions in the last 30 days, 29 sit at QS 1-2, only 3 are at QS 5-6, none at 7+.

Breaking down the QS components across those 35 keywords tells you exactly why:

| Component | Below Average | Average | Above Average |
|---|---|---|---|
| Landing page experience | **33 (94%)** | 2 | 0 |
| Expected CTR | 32 (91%) | 3 | 0 |
| Ad relevance | 19 (54%) | 12 | 4 |

**Root cause, confirmed:** every single ad group across all 13 active groups — every city, every intent theme, brand and non-brand alike — points to the exact same final URL: `https://www.sunfm.fitness/start`. A search for "personal trainer sunnyvale" and a search for "chair exercises for seniors" land on an identical, generic page. Google's landing-page-experience signal explicitly penalizes this kind of one-size-fits-all mismatch, and it shows: 94% of your active keywords are marked Below Average on that exact component.

This is very likely the single biggest lever in the account right now. Low QS directly inflates CPC (you're paying a premium for the same ad rank a well-matched page would get cheaper) and a generic page converts worse than one that mirrors the search intent back to the visitor.

**Recommendation:** this needs a real fix, not a quick one — either dynamic city/intent insertion on `/start` (headline or subhead that echoes the ad group theme) or a small set of themed landing variants (e.g. one for city-based groups, one for "over 40," one for "return to training") that all still funnel into the same booking form. Worth scoping as its own task rather than bolting on today.

---

## NEW: Wasted Spend — 45/100 (was N/A, now real data)

**61.2% of the last 30 days' search-term spend ($372.34 of $608.76) sits on terms with $10+ cost and zero conversions.** Well above the 20% FAIL threshold.

Important nuance: most of this isn't junk traffic, it's low-sample-size noise on your actual target terms. `personal trainer san jose` (EXACT), `personal trainer santa clara` (EXACT), `personal training santa clara` (EXACT) — these are exactly the high-intent terms you want, just with too few clicks yet (2-7 clicks each) to expect a conversion by chance. Don't touch these.

**What's worth acting on:**

- **`sun functional movement` (EXACT, your own brand name)** — $27.97, 4 clicks, 0 conversions. Branded search should convert at your highest rate, not zero. With only 4 clicks this could be noise, but it's worth a manual check: does the `/start` page load correctly and fast for someone who already knows the business and just wants to book?
- **`beast fitness san jose` (NEAR_PHRASE)** — $58.71, your single biggest wasted-spend line item. This reads like a competitor gym name (possibly "Beast Mode Fitness" or similar) bleeding into your Non-Brand Location / San Jose ad group via close-variant matching. Worth an exact-match negative if it's confirmed to be a different business.
- **`chair exercises for seniors`, `senior exercise classes near me`** ($14.14, $14.06) — these describe group/seated fitness classes, a different service than 1:1 personal training. Candidates for phrase-match negatives on `AG_Senior_Strength` if you don't want to compete for that intent.
- **`how can i build muscle after age 75 male`** ($14.00) — long informational query, low commercial intent. Low-severity, but a pattern worth watching if similar informational long-tail terms keep showing up.

---

## Account Structure — 78/100 (up from 70)

**Solid, confirmed unchanged:**
- Brand/Non-Brand/Location split still clean, no keyword cannibalization
- No Broad Match anywhere — still 100% Phrase/Exact
- Search Partners + Display still OFF

**New since last audit:**
- `AG_Senior_Strength` ad group added under Non-Brand Intent (6th intent theme, was 5) — reasonable thematic expansion, not scope creep
- 2nd/3rd RSA per ad group now standard (see Ads section)

**Open question — needs your input:**
- **`Non-Brand Intent` campaign is currently PAUSED.** It spent $402.90 over the last 30 days with **zero conversions** before going inactive. I couldn't pull change history via the API to confirm exactly when or why it was paused (a GAQL field/date-range issue on my end, not something I could resolve in this pass). If you paused it intentionally because of the zero-conversion run, that's a defensible call — but it's also your Over 40 / Mobility / Senior Strength / Desk Worker Fix / Busy Professionals / Return to Training themes all going dark at once, which is a lot of your non-brand intent coverage to lose. Worth deciding deliberately rather than leaving it paused by default.

---

## Ads — 72/100 (up from 40)

RSA counts are solid across the board (12-15 headlines, 4 descriptions — both within Google's recommended range). Ad strength distribution improved meaningfully (see "what got fixed" above).

**One lingering issue:** `AG_Desk_Worker_Fix` still has a POOR-strength RSA actively enabled (alongside an AVERAGE one). This was one of the 4 POOR ad groups flagged in June and is the only one of the four that didn't get fixed.

---

## Settings — 70/100

**Confirmed via this pass:**
- Sitelinks (4), callouts (5-9), structured snippet (1), call extension (1) — all now present, both at campaign and account level (see "what got fixed")
- Bid strategy: MAXIMIZE_CONVERSIONS on all 3 campaigns — appropriate now that there's real conversion history, though with only 4-5 total conversions the algorithm is likely still deep in learning
- Optimization scores: Brand 79.6%, Non-Brand Location 78.5% (Non-Brand Intent shows no score while paused)

**Still missing:**
- Image extensions — genuinely not found anywhere, including the raw `asset` table (no `MARKETING_IMAGE` type assets exist).
- Location extension — **uncertain, not confirmed either way.** A "Business Profile" asset set (`type: LOCATION_SYNC`, `status: ENABLED`) exists at the account level, meaning GBP is linked — a real prerequisite. But `campaign_asset_set` (which would confirm it's applied to specific campaigns) returns zero rows, and unlike the Business Logo I have no UI screenshot confirming it's actually serving. **Worth a 10-second check: Google Ads → Assets → filter to "Location" → see if it shows Eligible/serving like Business Logo did.**
- **Correction, 2026-07-27 (later same day):** Business Logo (`SunFM-Character.png`, added 2026-06-13, actively serving — 44 clicks / 681 impressions / $374.11 through this audit window) and Business Name **are already live**, confirmed by the user from the Ads UI after this report initially said they were missing. They're invisible to every GAQL resource that normally exposes asset links (`customer_asset`, `campaign_asset`, `asset_set_asset` all return nothing for this asset) — the raw asset exists (`asset.type = IMAGE`, `asset.name = SunFM-Character.png`) but whatever links it to "Business logo" at the account level isn't exposed through the API surface used in this audit. Likely tied to Google's newer Advertiser Identity system rather than classic extensions. **Lesson for future audits of this account: check the raw `asset` table for IMAGE-type assets before concluding logo/business-name are missing — the link tables can't be trusted for this specific asset type.**
- Geo targeting type (PRESENCE vs. PRESENCE_OR_INTEREST) — I wasn't able to re-verify this cleanly this pass (a query scoping issue on my end); worth a manual spot-check in Settings → Locations if you want it reconfirmed rather than assumed unchanged from June.

---

## Priority-ordered action plan

### Update, 2026-07-27 (same day, post-audit follow-through)

- **DONE — Landing page personalization (#5 below) shipped and wired up.** `/start` now has an 11-variant theme map keyed by `?t=`; every non-brand ad group's Final URL was updated via the Ads API to point at its matching variant (verified via read-back). `AG_Brand_Exact` and `AG_PT_Other_Cities` intentionally left on the default page. See `src/app/start/StartLanding.tsx`.
- **DONE — Negative keyword added.** Confirmed via web search that "Beast Fitness" is a real, separate personal training gym (4640 Meridian Ave, San Jose) — added `[beast fitness san jose]` (exact match) to the shared negative list.
- **DONE — Paused the `AG_Desk_Worker_Fix` POOR ad.** Its headlines leaned generic rather than desk-worker-specific compared to the AVERAGE ad still running in the same group. Paused rather than rewritten, since new ad copy is a voice/content decision that should get human review before going live, not something to push through the API unreviewed.
- **BLOCKED, needs manual action — `movement_screen_completed` secondary conversion.** The API returns `IMMUTABLE_FIELD` on `includeInConversionsMetric` for this conversion action (likely locked because it's GA4-imported). Do it manually: **Google Ads → Goals → Conversions → Summary → `movement_screen_completed` → Settings → "Include in 'Conversions'" → Secondary.**
- **DECIDED — `Non-Brand Intent` stays paused for now.** Revisit once there's a read on how the personalized pages affect `Non-Brand Location` first.

### Still open

1. ~~Mark `movement_screen_completed` as a secondary conversion~~ — blocked on the API, needs the manual UI step above.
2. ~~Decide on `Non-Brand Intent`~~ — decided, staying paused.
3. ~~Add exact-match negative for `beast fitness san jose`~~ — done.
4. ~~Fix the `AG_Desk_Worker_Fix` POOR ad~~ — done (paused).
5. ~~Stop sending every ad group to the same generic `/start` page~~ — done, live.
6. **Business logo/name — correction, not actually needed.** Both are already live and serving (see correction note above). The landscape logo I uploaded to the asset library (`public/images/logo-landscape-ads-4x1.png`, asset `customers/9502296068/assets/399472246842`) is unnecessary — it's sitting unlinked and harmless, safe to ignore or delete from Assets in the UI. **Image extensions** (marketing images, a separate thing from the logo) are still genuinely untouched — would need new photography/creative, not just a resize, and remain open if you want them.
7. **Spot-check the `sun functional movement` branded search experience.** Still open, low effort, low urgency.

### Ongoing

8. **Re-run this audit again once `form_submit_success` count crosses ~15-20**, and specifically re-check the keyword Quality Score numbers no sooner than ~1-2 weeks after 2026-07-27 — QS needs real post-change traffic to recompute, there's no faster way to verify whether the landing page fix actually worked.

---

## What I'm NOT recommending yet (and why)

- **Don't panic-pause Non-Brand Location.** It's the only campaign producing real conversions ($778/4 = $194.51 CAC in the last 30 days alone — better than the blended all-time number, and trending toward target).
- **Don't add PMax or AI Max yet.** Per `ADS-STRATEGY.md`, both are gated on 30+ conversions of Search history. You have 4-5. Not close.
- **Don't switch off Maximize Conversions.** With volume this low, Manual CPC wouldn't meaningfully outperform, and switching resets whatever learning has accumulated.
- **Don't read too much into the individual high-intent zero-conversion search terms** (`personal trainer san jose`, `personal trainer santa clara`, etc). 2-7 clicks each is too small a sample to judge; these are your correct target terms.
