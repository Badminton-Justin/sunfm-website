# Sun FM — Paid Advertising Strategy

**Business:** Sun Functional Movement (Sun FM)
**Industry:** Personal Training (Local Service — Health & Fitness)
**Generated:** 2026-06-07
**Template:** `local-service` (adapted for personal training)

---

## 1. Strategic Summary

Sun FM is a local high-trust, high-ticket service business in the South Bay Area. The right starting strategy is **single-platform Search-first** with disciplined budget and strong tracking, not multi-platform from day one.

The core thesis: someone searching "personal trainer San Jose" is high-intent and ready to convert. Capturing that demand profitably is worth far more than spraying brand awareness across Meta or YouTube before the unit economics are proven.

**Primary KPI:** Cost Per Booked Consultation (CPC*L, where L = consultation)
**Starting target:** $100-150 per booked consultation
**Goal by month 6:** $50-80 per booked consultation

---

## 2. Discovery Summary

### Business
- **Type:** Local service (personal training studio + mobile coaching)
- **Founded:** 2020 by Jeffrey Sun
- **Structure:** Team of trainers (recently transitioned from solo)
- **Location:** 1401 Parkmoor Ave, Suite 100, San Jose, CA 95126
- **Phone:** (408) 761-4963
- **Service mode:** Studio + at-home/at-office sessions + online

### Services
- 1:1 Personal Training (primary)
- Strength Training (over 30 focus)
- Mobility Coaching
- Posture & Neck Mobility Training
- Hip Mobility Training
- Weight Loss Training
- Functional Strength
- Online Personal Training
- Return-to-Training Coaching

### Target Audience
- **Primary:** Busy professionals over 30 in tech (engineers, PMs, founders)
- **Secondary:** Parents fitting training into packed weeks
- **Tertiary:** Adults 40-60 dealing with desk-job-related mobility/pain issues
- **Excluded:** College students, casual fitness enthusiasts, bodybuilders

### Trust signals
- ACE-certified
- 12,000+ one-on-one sessions logged
- 107 reviews (5.0 avg) on-site
- 20 Yelp reviews (5.0 avg)
- 12 Google Business Profile reviews (5.0 avg)
- Founded 2020 (6-year track record)

### Current Advertising Status
- **No active paid advertising**
- All current traffic from organic (SEO, blog, GBP, Yelp, referrals)
- About to launch first Google Ads campaign

### Goals
- Lead generation (free consultations booked)
- Sustainable CAC under $150 per consultation
- Scale to 10-15 incremental consultations/month from paid

### Budget Range
- **Starting:** $900-1,500/month ($30-50/day)
- **Scaling target:** $2,500-4,000/month by month 6 if unit economics work
- **Quarterly review:** scale or pull back based on CAC trend

### Timeline
- Google Ads Developer Token application: in flight (3-7 day wait)
- Foundation already complete (GA4, PostHog, /start landing page, conversion tracking, GBP optimized)
- Target launch: 2-3 weeks from today

### Team Capacity
- Solo founder driving (Jeff)
- No in-house marketing team
- No agency — running self-managed with Claude Code + claude-ads skill
- ~3-5 hours/week available for ad management

---

## 3. Competitive Analysis

### Top Local Competitors

| Competitor | Positioning | Estimated Spend | Threat Level |
|------------|-------------|----------------|--------------|
| **WESTCA Gym** | Downtown SJ boutique, 184 reviews, 400-member cap | Medium | High — overlap on "busy professionals" positioning |
| **Holly Roser Fitness** | Bay Area + NYC, 17+ years, in-home, women's wellness | Low-Med | Medium — different positioning (women's, in-home) |
| **Grant Kennedy PT** | Science-based, Bascom Ave location | Low | Medium — closest brand match (calm, technical) |
| **Willow Glen Workout Garage** | Private studio, group + 1:1 | Low | Low — different vibe (community-focused) |
| **AVAC** | Country club gym with PT | Medium | Low — different audience (members) |
| **The Perfect Workout** | 20-minute sessions, "less time" angle | Medium-High | Medium — different value prop |
| **24 Hour Fitness Willow Glen** | Big-box | High (national budget) | Low — different price tier |
| **GYMGUYZ Santa Clara Valley** | Mobile trainers come to you | Low-Med | Medium — direct competitor on convenience |

### Competitive Gaps (Sun FM Opportunities)

1. **No competitor owns "mobility for desk workers"** — Sun FM's blog content already dominates this; ads should reinforce
2. **No competitor leads with "strength for longevity"** angle — clean differentiator vs. transformation/bootcamp competitors
3. **Few competitors run Search ads** in San Jose for "personal trainer" (verify via Google Ads Transparency Center) — likely low impression share competition
4. **Holly Roser dominates women-specific terms** — avoid that battle; target tech-professional terms instead

### Estimated Competitor Ad Activity

Use `/ads-competitor` (separate skill) to verify, but initial reconnaissance suggests:
- **Top spenders:** 24 Hour Fitness (national), WESTCA, The Perfect Workout
- **Lighter spenders:** Grant Kennedy, AVAC, Method3
- **Likely not advertising:** Willow Glen Workout Garage, BODIED SJ, most solo trainers

This is a beatable competitive landscape with smart Search bidding.

---

## 4. Platform Selection

### Recommended Platform Mix (Month 1-3)

| Platform | Allocation | Role | Why |
|----------|-----------|------|-----|
| **Google Search** | 80% | Primary | High-intent local queries, predictable, controllable |
| **Microsoft/Bing** | 10% | Cheap learning | Google import, older demo, San Jose Bing users |
| **Meta retargeting** | 10% | Warm audience | Site visitors who didn't convert (small budget, low CPM) |

### Why NOT these platforms (yet)

- **Google Local Services Ads (LSA)** — Personal training is **not currently in Google's LSA eligible categories** (LSA covers HVAC, plumbing, electricians, lawyers, etc., not personal trainers). Verify via [ads.google.com/local-services-ads](https://ads.google.com/local-services-ads/) but assume unavailable.
- **Google Performance Max** — Black-box bidding without proven Search baselines wastes spend. Add only after Search has 30+ conversions of history.
- **Google Display / YouTube** — Awareness plays burn cash for a service business this small. Defer to month 6+.
- **TikTok** — Wrong audience (Sun FM targets busy professionals 30+, not Gen Z)
- **LinkedIn** — Tempting because audience matches (engineers, founders), but LinkedIn CPCs ($15+) destroy unit economics for $100-150 target CAC.
- **Apple Ads** — App-only platform; Sun FM doesn't have an app.
- **Amazon Ads** — E-commerce platform; not applicable.

### Platform Mix Evolution

- **Months 1-3 (Foundation):** 80% Search / 10% Bing / 10% Meta Retargeting
- **Months 4-6 (Scaling):** 60% Search / 20% PMax / 10% Bing / 10% Meta (if Search profitable)
- **Months 7-12 (Diversification):** Layer in YouTube Demand Gen + LinkedIn if pipeline justifies

---

## 5. Strategic Decisions Made

### Conversion as primary, not phone calls
The local-service template assumes phone calls are 60%+ of leads. For Sun FM, **form submissions (consultation requests) are the primary conversion** because:
1. The /start landing page funnels into form-first booking
2. GA4 tracks `form_submit_success` as the verified conversion event
3. Google Ads imports this from GA4 directly
4. Call tracking adds complexity without significant value at this scale (set up Phase 2 if needed)

### Studio-anchored, not service-area
Despite the team-of-trainers pivot, the studio at Parkmoor Ave is the strongest geographic anchor. Use **location extensions linked to GBP** and **10-mile radius from the studio** as the primary geo, with additional radii around the 9 service area cities as a secondary layer.

### Cold + Movement Screen as soft conversion
For Search ads to scale, we need to capture more than just consultation-ready leads. The **Movement Screen** is the soft conversion that catches mid-funnel intent:
- Primary conversion (Google Ads optimization target): `form_submit_success`
- Secondary conversion (counted but not optimized): `movement_screen_completed`

### Quiet on weekends (Phase 1)
Despite GBP showing weekend hours, **paid ads should run weekdays only** in Month 1 to concentrate budget on highest-intent windows. Weekend searches are often casual research, not booking-ready. Expand to weekends in Month 3 if data supports it.

---

## 6. Expected Outcomes by Month

| Month | Spend | Clicks | Conversions | CAC | Notes |
|-------|-------|--------|-------------|-----|-------|
| 1 | $900-1,500 | 200-300 | 4-8 | $150-250 | Learning phase, high CAC expected |
| 2 | $1,200-1,800 | 300-450 | 8-12 | $100-180 | Optimization phase, CAC trending down |
| 3 | $1,500-2,000 | 400-550 | 12-16 | $80-130 | Stable, ready to scale |
| 6 | $2,500-3,500 | 700-900 | 25-35 | $70-100 | Scaling with proven structure |
| 12 | $4,000-6,000 | 1,200-1,800 | 50-70 | $60-90 | Diversified across 2-3 platforms |

These are realistic, not aggressive. A $50 CAC by month 12 would be excellent for a personal trainer in a competitive metro market.

---

## 7. Risk Factors

1. **Conversion rate on /start unknown** — modeled at 3-4% but untested. First 2-3 weeks of data may force a CAC re-baseline.
2. **Competition intensifies** — if WESTCA or others ramp paid spend, CPCs rise. Monitor monthly.
3. **Consultation → paid client rate unknown** — if conversion to paying client is below 30%, true CAC math worsens. Track via Sheets.
4. **Seasonal dips** — December and mid-summer typically slow for personal training; pre-set budget pacing to account for this.

---

## 8. Decision Gates

**Do NOT scale beyond $1,500/month spend until:**
- 2 consecutive weeks of CAC under $150
- At least 30 total conversions in account history
- Click-through rate above 3%
- /start landing page conversion rate above 2.5%

**Pause and reassess if:**
- 4 consecutive weeks with CAC above $300
- Conversion rate on /start below 1.5% for 3+ weeks
- Conversation rate from consultation → paid client below 25%

See `CAMPAIGN-ARCHITECTURE.md` for campaign structure, `BUDGET-PLAN.md` for week-by-week budget pacing, `CREATIVE-BRIEF.md` for ad copy, `TRACKING-SETUP.md` for conversion configuration, and `IMPLEMENTATION-ROADMAP.md` for the rollout timeline.
