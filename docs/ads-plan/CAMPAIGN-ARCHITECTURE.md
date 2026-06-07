# Sun FM — Campaign Architecture

**Naming Convention:**
```
[Platform]_[Objective]_[Type]_[Geo]_[Date]
```
Example: `GOOG_CONV_Search-NonBrand-Geo_SJ_2026Q3`

---

## Google Search (Primary — 80% of budget)

### Campaign 1: Brand Defense
**Name:** `GOOG_CONV_Search-Brand_SJ_2026Q3`

**Purpose:** Protect "Sun FM" / "Jeffrey Sun trainer" / "Sun Functional Movement" terms from competitor poaching. Cheap clicks, high CTR, near-zero CPCs.

**Budget:** $5-10/day ($150-300/month) — small but always-on

**Bid strategy:** Maximize Conversions, $1.50 max CPC manual bid

**Geo:** US (cheap brand defense isn't worth geo-restricting)

**Ad Groups:**
- `AG_Brand_Exact` — exact match: `[Sun FM]`, `[Sun Functional Movement]`, `[Jeffrey Sun trainer]`, `[Jeff Sun personal trainer]`
- `AG_Brand_Phrase` — phrase: `"Sun FM San Jose"`, `"Jeffrey Sun fitness"`, `"sunfm fitness"`

**Negative keywords (campaign-level):**
- "yelp", "reviews", "instagram", "facebook" (intent to research, not click ad)
- Common typos that misfire

---

### Campaign 2: Non-Brand — Location + Service
**Name:** `GOOG_CONV_Search-NonBrand-Geo_SJ_2026Q3`

**Purpose:** Capture high-intent "[service] [city]" searches across the 10 South Bay cities.

**Budget:** $20-35/day ($600-1,050/month) — largest single campaign

**Bid strategy:**
- Months 1-2: Maximize Conversions
- Month 3+ (once 30 conversions accumulated): Target CPA at $100-150

**Geo:**
- Primary: 10-mile radius around 1401 Parkmoor Ave, San Jose
- Secondary: 5-mile radius around: Sunnyvale, Santa Clara, Cupertino, Mountain View, Campbell, Los Gatos
- Excluded: Outside the South Bay (we don't serve clients in San Francisco proper, Oakland, Hayward, etc.)

**Ad Groups:**

#### `AG_PT_San_Jose`
Keywords (exact + phrase):
- [personal trainer san jose]
- "personal trainer in san jose"
- [personal trainer near me] (when search location is San Jose)
- "personal training san jose"
- [private personal trainer san jose]

#### `AG_PT_Sunnyvale`
- [personal trainer sunnyvale]
- "personal trainer in sunnyvale"
- "personal training sunnyvale"

#### `AG_PT_Cupertino`
- [personal trainer cupertino]
- "personal trainer cupertino"
- [personal trainer apple park] (geo-tactical)

#### `AG_PT_Santa_Clara`
- [personal trainer santa clara]
- "personal trainer santa clara"

#### `AG_PT_Mountain_View`
- [personal trainer mountain view]
- [personal trainer google campus] (geo-tactical)

#### `AG_PT_Other_Cities` (consolidated for low-volume cities)
- Campbell, Los Gatos, Los Altos, Saratoga, Milpitas combinations

---

### Campaign 3: Non-Brand — Intent + Specialty
**Name:** `GOOG_CONV_Search-NonBrand-Intent_SJ_2026Q3`

**Purpose:** Capture searches by people looking for specific specialty Sun FM offers (mobility, over-40, strength longevity).

**Budget:** $10-15/day ($300-450/month)

**Bid strategy:** Maximize Conversions (lower volume, harder to hit tCPA early)

**Geo:** Same as Campaign 2

**Ad Groups:**

#### `AG_Mobility`
- "mobility trainer bay area"
- "mobility coach san jose"
- "mobility specialist south bay"

#### `AG_Over_40`
- "personal trainer over 40"
- "strength training for adults over 40"
- "fitness coach for older adults"
- "strength training for longevity"

#### `AG_Busy_Professionals`
- "personal trainer for busy professionals"
- "trainer for tech workers"
- "private personal training silicon valley"

#### `AG_Desk_Worker_Fix`
- "trainer for desk workers"
- "fix back pain from sitting"
- "posture trainer san jose"

#### `AG_Return_to_Training`
- "getting back into shape after 40"
- "return to lifting after a break"
- "starting strength training after 30"

---

### Campaign 4 (Optional, Phase 2): Competitor Conquesting
**Name:** `GOOG_CONV_Search-Competitor_SJ_2026Q3`

**Purpose:** Bid on competitor brand terms (WESTCA, Holly Roser, etc.) when prospects are comparison-shopping.

**Status:** **Do NOT launch in Phase 1.** Add only after months 2-3 of brand/non-brand performance to evaluate viability.

**Risk:** Competitors retaliate by bidding on "Sun FM" — escalating CPC war. Only worth it if you have unique value to communicate vs. them.

---

## Microsoft/Bing (Secondary — 10% of budget)

### Campaign 5: Bing Import
**Name:** `MSFT_CONV_Search-Import_SJ_2026Q3`

**Purpose:** Replicate Google Search structure on Bing for cheaper clicks (Bing CPCs run 20-40% lower) and older demographic alignment (Bing skews 35+).

**Budget:** $3-5/day ($90-150/month)

**Setup:** Use Microsoft Ads' Google Import feature. Replicates Brand + Non-Brand-Geo + Non-Brand-Intent campaigns.

**Watch out for:** Match-type translation issues — verify after import. Bing handles broad match differently than Google.

---

## Meta Retargeting (Secondary — 10% of budget)

### Campaign 6: Retargeting Website Visitors
**Name:** `META_CONV_Retarget-7d_SJ_2026Q3`

**Purpose:** Re-engage visitors who landed on Sun FM but didn't convert. Small budget, high relevance.

**Budget:** $3-5/day ($90-150/month)

**Audience:** Website visitors in past 30 days, excluding those tagged `consultation_warm` in Kit (already converted)

**Targeting:** South Bay (10-mile radius from studio + cities)

**Creative:** Single image + carousel format featuring:
- Marshall testimonial quote
- Sun FM logo + brand colors
- CTA: "Book your free consultation"

**Landing page:** `/start` (same as Google Ads)

---

## Visual Diagram

```
Sun FM Ad Account Structure
│
├── Google Ads (80% of budget)
│   ├── Brand Defense ($150-300/mo)
│   │   ├── AG_Brand_Exact
│   │   └── AG_Brand_Phrase
│   │
│   ├── Non-Brand — Location + Service ($600-1,050/mo) ← PRIMARY DRIVER
│   │   ├── AG_PT_San_Jose
│   │   ├── AG_PT_Sunnyvale
│   │   ├── AG_PT_Cupertino
│   │   ├── AG_PT_Santa_Clara
│   │   ├── AG_PT_Mountain_View
│   │   └── AG_PT_Other_Cities
│   │
│   └── Non-Brand — Intent + Specialty ($300-450/mo)
│       ├── AG_Mobility
│       ├── AG_Over_40
│       ├── AG_Busy_Professionals
│       ├── AG_Desk_Worker_Fix
│       └── AG_Return_to_Training
│
├── Microsoft Ads (10%)
│   └── Bing Import campaign mirror ($90-150/mo)
│
└── Meta Ads (10%)
    └── Retargeting site visitors ($90-150/mo)
```

---

## Negative Keywords (Account-Level, Apply Everywhere)

Add these as a shared negative keyword list applied to all Google campaigns:

**Job seekers:**
- jobs, job, hiring, careers, salary, employment, "personal trainer salary"

**Education/certification:**
- certification, certified, become, school, course, training program, NASM, ACE certification, online certification

**DIY/free:**
- free, cheap, diy, "how to be a personal trainer", "personal trainer near me free"

**Wrong audience:**
- crossfit, orange theory, gym membership, planet fitness, 24 hour fitness reviews, soulcycle

**Wrong format:**
- online courses, video courses, app, mobile app, "personal trainer app"

**Wrong intent:**
- jobs near me, certification near me, "personal trainer reviews" (research intent)

---

## Ad Extensions (Apply to All Google Campaigns)

### Call Extension
- Number: (408) 761-4963
- Schedule: Mon-Fri 6am-9pm, Sat 7am-5pm (match GBP hours)
- Call reporting: enabled

### Location Extension
- Linked to: Sun Functional Movement GBP listing
- Format: distance + address shown on mobile

### Sitelink Extensions (4-6 active)
1. **Free Consultation** → `/start`
2. **About Jeffrey Sun** → `/team`
3. **Movement Screen** → `/tools/movement-screen`
4. **Reviews** → `/#testimonials`
5. **Strength for Longevity** → `/training/strength-training-for-longevity-beginners-guide-over-30`
6. **All Service Areas** → `/san-jose-personal-trainer` (or whichever city matches search)

### Callout Extensions (8-10)
- ACE-Certified
- 12,000+ Sessions
- 107+ 5-Star Reviews
- Free First Consultation
- Studio in San Jose
- South Bay Service Area
- Mobility & Strength Specialist
- Online Sessions Available
- 6+ Years in Business
- Founded by Jeffrey Sun

### Structured Snippets
- **Services:** Personal Training, Strength Training, Mobility Coaching, Posture Training, Online Training
- **Service catalog:** Beginners, Adults 40+, Desk Workers, Return-to-Training

### Image Extensions
- Hero shot of Jeff training a client at the studio (high contrast, recognizable face)
- Studio interior shot

---

## Schedule

**Ad Schedule (campaign-level):**
- Mon-Fri: 6am-9pm
- Sat: 7am-5pm
- Sun: pause (low-intent day for personal training searches)

**Bid Adjustments by Time:**
- 7am-9am: +15% (peak commute / "I need to start training" search window)
- 12pm-1pm: +10% (lunch break searching)
- 5pm-7pm: +15% (post-work search peak)
- 9pm-10pm: -25% (low conversion intent)

**Device Bid Adjustments:**
- Mobile: 0% (default)
- Desktop: 0% (default)
- Tablet: -30% (low conversion, low intent)

Revisit after 30 days when conversion data clarifies which devices convert best.
