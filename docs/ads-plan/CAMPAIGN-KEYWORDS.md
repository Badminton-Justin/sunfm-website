# Sun FM — Campaign Keywords (Paste-Ready)

**Generated:** 2026-06-07
**For:** Google Search campaigns per CAMPAIGN-ARCHITECTURE.md
**Match-type convention:** `[brackets]` = exact match · `"quotes"` = phrase match · no broad match (too risky at $40/day budget)

---

## Match Type Strategy

| Campaign | Exact | Phrase | Broad |
|---|---|---|---|
| Brand Defense | 80% | 20% | ❌ never |
| Non-Brand Location | 50% | 50% | ❌ never |
| Non-Brand Intent | 30% | 70% | ❌ never |

Broad match wastes spend at small budgets — modern phrase match already handles close variants and synonyms via "close variant matching." Save broad for accounts with >$5K/mo and rich conversion data.

---

## CAMPAIGN 1: Brand Defense

**Budget:** $5/day · **Bid strategy:** Maximize Conversions · **Daily budget protection rationale:** brand searchers are already buying; you just need to not lose them to competitors bidding on your name.

### Ad Group: AG_Brand_Exact (highest priority)

```
[Sun FM]
[Sun FM personal trainer]
[Sun FM San Jose]
[Sun Functional Movement]
[Sun Functional Movement San Jose]
[Jeffrey Sun trainer]
[Jeffrey Sun personal trainer]
[Jeff Sun trainer]
[Jeff Sun fitness]
[sunfm fitness]
[sunfm trainer]
```

### Ad Group: AG_Brand_Phrase (catches misspellings + variations)

```
"Sun FM training"
"Sun FM consultation"
"Jeffrey Sun San Jose"
"Jeffry Sun trainer"
"Jeffery Sun personal trainer"
"Jeff Sun San Jose"
"sun functional movement reviews"
"sunfm.fitness"
"sun functional movement Parkmoor"
```

**Brand campaign negatives:** none. Capture every brand search, even research-intent ("reviews"), because brand searchers convert at 5-10× non-brand rate.

---

## CAMPAIGN 2: Non-Brand — Location + Service

**Budget:** $20/day · **Bid strategy:** Maximize Conversions (Months 1-2) → Target CPA at $100-150 (Month 3+ after 30 conversions) · **Geo-targeting:** 10-mile radius around 1401 Parkmoor Ave + 5-mile radius around each secondary city.

### Ad Group: AG_PT_San_Jose

```
[personal trainer san jose]
[personal training san jose]
[private personal trainer san jose]
[best personal trainer san jose]
[1 on 1 personal trainer san jose]
[personal trainer near me]
"personal trainer in san jose"
"personal training in san jose"
"private personal trainer san jose"
"san jose personal trainer"
"personal trainer south san jose"
"personal trainer downtown san jose"
"personal trainer willow glen"
"personal trainer rose garden san jose"
```

### Ad Group: AG_PT_Sunnyvale

```
[personal trainer sunnyvale]
[personal training sunnyvale]
[private personal trainer sunnyvale]
"personal trainer in sunnyvale"
"personal training in sunnyvale"
"sunnyvale personal trainer"
"best personal trainer sunnyvale"
"personal trainer near sunnyvale"
"private trainer sunnyvale"
```

### Ad Group: AG_PT_Cupertino

```
[personal trainer cupertino]
[personal training cupertino]
[personal trainer apple park]
"personal trainer in cupertino"
"personal trainer cupertino ca"
"cupertino personal trainer"
"best personal trainer cupertino"
"private personal trainer cupertino"
"personal trainer near apple"
```

### Ad Group: AG_PT_Santa_Clara

```
[personal trainer santa clara]
[personal training santa clara]
"personal trainer in santa clara"
"santa clara personal trainer"
"best personal trainer santa clara"
"private trainer santa clara"
"personal trainer santa clara university"
"personal trainer near nvidia"
```

### Ad Group: AG_PT_Mountain_View

```
[personal trainer mountain view]
[personal training mountain view]
[personal trainer google campus]
"personal trainer in mountain view"
"mountain view personal trainer"
"best personal trainer mountain view"
"personal trainer near google"
"private trainer mountain view"
```

### Ad Group: AG_PT_Other_Cities (consolidated low-volume)

```
[personal trainer campbell]
[personal trainer los gatos]
[personal trainer los altos]
[personal trainer saratoga]
[personal trainer milpitas]
"personal trainer campbell"
"personal trainer los gatos"
"personal trainer los altos"
"personal trainer saratoga"
"personal trainer milpitas"
"personal trainer south bay"
"personal trainer silicon valley"
"personal trainer west san jose"
```

**Campaign 2 negatives (campaign-level):**

```
-mobility
-posture
-back pain
-hip mobility
-over 40
-tech workers
-desk workers
```

Why: these searches go to Campaign 3 (Intent) for cleaner attribution. Prevents bidding against yourself across two campaigns for the same auction.

---

## CAMPAIGN 3: Non-Brand — Intent + Specialty

**Budget:** $15/day · **Bid strategy:** Maximize Conversions · **Activate Day 4** (after Brand + Location prove conversion tracking works).

### Ad Group: AG_Mobility

```
[mobility trainer san jose]
[mobility coach san jose]
[hip mobility coach]
"mobility trainer bay area"
"mobility coach south bay"
"mobility specialist san jose"
"mobility training san jose"
"private mobility coaching"
"hip mobility trainer"
"shoulder mobility coach"
"functional mobility training"
"thoracic mobility trainer"
```

### Ad Group: AG_Over_40

```
[personal trainer over 40]
[personal trainer over 50]
[strength coach over 40]
"strength training for adults over 40"
"personal trainer for women over 40"
"personal trainer for men over 40"
"fitness coach for older adults"
"strength training for longevity"
"longevity strength training san jose"
"midlife fitness coach"
"active adult personal trainer"
"trainer for boomers"
```

### Ad Group: AG_Busy_Professionals

```
[personal trainer for busy professionals]
[private personal trainer silicon valley]
"trainer for tech workers"
"private personal training silicon valley"
"executive fitness coach bay area"
"personal trainer for engineers"
"trainer for software engineers"
"1 on 1 trainer for professionals"
"high performer personal trainer"
"private fitness coach silicon valley"
```

### Ad Group: AG_Desk_Worker_Fix

```
[trainer for desk workers]
[posture trainer san jose]
[fix back pain from sitting]
"back pain from desk job trainer"
"neck pain personal trainer"
"hip flexor pain coach"
"tech neck rehab trainer"
"posture coaching san jose"
"deskbound back recovery"
"sit all day fitness coach"
"fix bad posture trainer"
"low back pain personal trainer"
```

### Ad Group: AG_Return_to_Training

```
[getting back into shape after 40]
[return to lifting after a break]
[starting strength training after 30]
"return to fitness after kids"
"back to lifting after injury"
"starting over with fitness"
"beginner strength coach san jose"
"ease back into training"
"return to gym after years off"
"first time personal trainer over 40"
"fitness restart coaching"
"trainer for getting back in shape"
```

**Campaign 3 negatives (campaign-level):**

```
-san jose -[as keyword] (only exclude as exact since cities are valid intent context too)
-sunnyvale
-cupertino
-santa clara
-mountain view
```

Why: clean attribution split with Campaign 2. People who search "personal trainer san jose" go to Campaign 2; people who search "mobility coach" go to Campaign 3 even if they're in San Jose (Google geo-targets them anyway).

---

## Account-Level Negative Keywords (apply to ALL campaigns)

Add these as a **negative keyword list** in Tools → Negative keyword lists → "Sun FM Account Negatives", then attach to all 3 campaigns. Way easier to manage than per-campaign duplication.

### Employment / education / certification (people NOT buying training)

```
jobs
job
hiring
careers
career
salary
employment
"how to become"
"how to be a personal trainer"
certification
certified
become a trainer
trainer school
school
course
courses
training program
"online course"
"online courses"
NASM
ACE certification
"online certification"
"jobs near me"
"certification near me"
"certification online"
diploma
degree
study
"study guide"
```

### Free / cheap / DIY (lowest-intent traffic)

```
free
cheap
discount
deal
diy
"do it yourself"
youtube
tiktok
"free workout"
"free program"
"free plan"
"workout app"
app
"mobile app"
"personal trainer app"
"workout video"
video
videos
download
pdf
ebook
"e-book"
"free guide"
template
```

### Different fitness modality (not Sun FM's offering)

```
crossfit
orangetheory
"orange theory"
soulcycle
spin
"spin class"
"group class"
"group classes"
"group fitness"
bootcamp
"boot camp"
zumba
pilates
yoga
barre
dance
"dance class"
hiit class
f45
pure barre
equinox
24 hour fitness
"planet fitness"
"in shape"
"la fitness"
"gold's gym"
ymca
"24 hour"
```

### Medical / different profession

```
physical therapist
physiotherapist
chiropractor
"sports medicine"
osteopath
"physical therapy"
"physical therapy near me"
"sports massage"
massage
nutritionist
dietitian
"meal plan"
"meal prep"
acupuncture
recovery clinic
```

### Wrong demographic / specialty

```
kids
youth
teen
teens
teenager
junior
high school
"high school"
college sports
"college recruit"
bodybuilding
"bodybuilding coach"
"contest prep"
ifbb
"figure competition"
competition
"powerlifting meet prep"
"olympic lifting"
"strongman training"
prenatal
postpartum
"pre natal"
postnatal
```

### Wrong sport / activity

```
pickleball
tennis
golf
"golf coach"
"tennis coach"
running
"running coach"
marathon
triathlon
boxing
"boxing coach"
"martial arts"
"jiu jitsu"
mma
swimming
"swim coach"
basketball
```

### Research-only / equipment / products

```
"near me reviews"
review
reviews
"vs"
versus
comparison
"best home gym"
equipment
dumbbells
kettlebells
"home gym"
treadmill
"workout clothes"
"gym wear"
shaker
supplement
supplements
protein
creatine
```

### Adult content false positives (rare but worth blocking)

```
adult
webcam
escort
"happy ending"
massage parlor
```

---

## Summary Counts

| Category | Count |
|---|---|
| Brand Defense keywords | 20 |
| Non-Brand Location keywords | 71 across 6 ad groups |
| Non-Brand Intent keywords | 60 across 5 ad groups |
| **Total positive keywords** | **151** |
| Account-level negatives | ~150 |
| Campaign-level negatives (Camp 2 + Camp 3) | 11 |

---

## What this gives you

- **Brand Defense** captures every brand search with exact + phrase coverage including common misspellings (Jeffrey/Jeffry/Jeffery)
- **Non-Brand Location** covers every meaningful South Bay city with 8-14 keywords per ad group — enough volume per ad group for Smart Bidding to learn from
- **Non-Brand Intent** covers all 5 specialty angles with 10-12 keywords each
- **Cross-campaign negatives** prevent self-bidding (where Campaign 2 and Campaign 3 fight in the same auction)
- **Account-level negatives** strip out ~150 wasted-spend traps: job seekers, students, free-content seekers, different modalities, kids, sports, adult content
- **No broad match anywhere** — keeps spend efficient at $40/day

---

## Implementation order in Google Ads UI

1. **Tools → Negative keyword lists** → create "Sun FM Account Negatives" → paste all account-level negatives
2. **Build Brand Defense campaign first** → add ad groups → paste keywords → attach negative list → save as draft
3. **Build Non-Brand Location** → 6 ad groups → paste keywords + campaign negatives → attach account negative list → save as draft
4. **Build Non-Brand Intent** → 5 ad groups → paste keywords + campaign negatives → attach account negative list → save as draft
5. **Map RSAs from campaign-brief.md** to each ad group:
   - Brand campaigns: use Concept 1 (Free Home Workout Set) RSA + brand-specific custom variant
   - Location ad groups: use Concept 3 (Train For The Long Run) — geo-anchored
   - Intent ad groups: use Concept 2 (Fix What Sitting Did To You) for desk/pain themes; Concept 3 for over-40/longevity themes
6. **Add sitelinks, callouts, structured snippets** at the campaign level (apply to all 3)
7. **Apply ad schedule + geo-targeting** per CAMPAIGN-ARCHITECTURE.md
8. **Save everything as DRAFTS — do not activate**

---

## Quick paste tip

Google Ads UI accepts pasted lists where one keyword per line. Click into the keyword field of any ad group, paste the block (including the `[brackets]` and `"quotes"` which Google recognizes as match-type indicators), then save. Saves 20× the time of manual entry.
