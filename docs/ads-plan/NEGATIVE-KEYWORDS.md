# Sun FM — Negative Keyword List (Paste-Ready)

**Use:** Account-level shared list, attached to Non-Brand Location + Non-Brand Intent campaigns.
**Skip for:** Brand Defense (brand searchers are pre-qualified).
**Match type:** Phrase match (the `"quotes"` in each line below tell Google Ads to treat it as phrase match — no separate dropdown selection needed).

---

## ⚡ Quick paste block — copy everything below the line

Copy/paste this entire block into the Google Ads negative keyword list bulk input. Google reads `"quoted keywords"` as phrase match automatically — no need to set match type manually.

```
"jobs"
"job"
"hiring"
"careers"
"career"
"salary"
"employment"
"how to become"
"how to be a personal trainer"
"certification"
"certified"
"become a trainer"
"trainer school"
"school"
"course"
"courses"
"training program"
"online course"
"online courses"
"NASM"
"ACE certification"
"online certification"
"jobs near me"
"certification near me"
"certification online"
"diploma"
"degree"
"study"
"study guide"
"free"
"cheap"
"discount"
"deal"
"diy"
"do it yourself"
"youtube"
"tiktok"
"free workout"
"free program"
"free plan"
"workout app"
"app"
"mobile app"
"personal trainer app"
"workout video"
"video"
"videos"
"download"
"pdf"
"ebook"
"e-book"
"free guide"
"template"
"crossfit"
"orangetheory"
"orange theory"
"soulcycle"
"spin"
"spin class"
"group class"
"group classes"
"group fitness"
"bootcamp"
"boot camp"
"zumba"
"pilates"
"yoga"
"barre"
"dance"
"dance class"
"hiit class"
"f45"
"pure barre"
"equinox"
"24 hour fitness"
"planet fitness"
"in shape"
"la fitness"
"gold's gym"
"ymca"
"24 hour"
"physical therapist"
"physiotherapist"
"chiropractor"
"sports medicine"
"osteopath"
"physical therapy"
"physical therapy near me"
"sports massage"
"massage"
"nutritionist"
"dietitian"
"meal plan"
"meal prep"
"acupuncture"
"recovery clinic"
"kids"
"youth"
"teen"
"teens"
"teenager"
"junior"
"high school"
"college sports"
"college recruit"
"bodybuilding"
"bodybuilding coach"
"contest prep"
"ifbb"
"figure competition"
"competition"
"powerlifting meet prep"
"olympic lifting"
"strongman training"
"prenatal"
"postpartum"
"pre natal"
"postnatal"
"pickleball"
"tennis"
"golf"
"golf coach"
"tennis coach"
"running"
"running coach"
"marathon"
"triathlon"
"boxing"
"boxing coach"
"martial arts"
"jiu jitsu"
"mma"
"swimming"
"swim coach"
"basketball"
"near me reviews"
"review"
"reviews"
"vs"
"versus"
"comparison"
"best home gym"
"equipment"
"dumbbells"
"kettlebells"
"home gym"
"treadmill"
"workout clothes"
"gym wear"
"shaker"
"supplement"
"supplements"
"protein"
"creatine"
"adult"
"webcam"
"escort"
"happy ending"
"massage parlor"
```

**Total: ~150 negative keywords, all phrase match.**

---

## Setup steps in Google Ads UI

1. **Left nav → Tools (wrench icon) → Shared library → Negative keyword lists**
2. Click **"+ New list"**
3. Name: **`Sun FM Account Negatives`**
4. Paste the block above (each keyword is pre-wrapped in `"quotes"` → Google auto-detects as phrase match)
5. Save
7. Click **"Apply to campaigns"** → select:
   - ✅ Non-Brand Location | Search
   - ✅ Non-Brand Intent | Search (once built)
   - ❌ Brand Defense | Search (skip — no negatives needed for brand)

---

## Categorized reference (for understanding what each negative blocks)

### Employment / education / certification (30 keywords)
Filters out people researching how to BECOME a personal trainer, salary searches, certification programs, schools. Sun FM trains clients — doesn't train trainers.

```
jobs, job, hiring, careers, career, salary, employment, how to become,
how to be a personal trainer, certification, certified, become a trainer,
trainer school, school, course, courses, training program, online course,
online courses, NASM, ACE certification, online certification, jobs near me,
certification near me, certification online, diploma, degree, study, study guide
```

### Free / cheap / DIY (24 keywords)
Filters out lowest-intent traffic: free workouts, YouTube searches, downloadable PDFs, fitness apps.

```
free, cheap, discount, deal, diy, do it yourself, youtube, tiktok,
free workout, free program, free plan, workout app, app, mobile app,
personal trainer app, workout video, video, videos, download, pdf,
ebook, e-book, free guide, template
```

### Different fitness modality (26 keywords)
Sun FM is 1:1 personal training. Filter out group classes, bootcamps, yoga studios, gym chains. Different products entirely.

```
crossfit, orangetheory, orange theory, soulcycle, spin, spin class,
group class, group classes, group fitness, bootcamp, boot camp, zumba,
pilates, yoga, barre, dance, dance class, hiit class, f45, pure barre,
equinox, 24 hour fitness, planet fitness, in shape, la fitness, gold's gym,
ymca, 24 hour
```

### Medical / different profession (14 keywords)
PT, chiropractor, sports med — adjacent fields but different professionals. Sun FM is fitness, not medical treatment.

```
physical therapist, physiotherapist, chiropractor, sports medicine,
osteopath, physical therapy, physical therapy near me, sports massage,
massage, nutritionist, dietitian, meal plan, meal prep, acupuncture, recovery clinic
```

### Wrong demographic / specialty (20 keywords)
Sun FM trains adults 30-60. Filter out kids, youth sports, bodybuilding competitors, prenatal coaching, etc.

```
kids, youth, teen, teens, teenager, junior, high school, college sports,
college recruit, bodybuilding, bodybuilding coach, contest prep, ifbb,
figure competition, competition, powerlifting meet prep, olympic lifting,
strongman training, prenatal, postpartum, pre natal, postnatal
```

### Wrong sport / activity (15 keywords)
Sport-specific coaching is a different product. Sun FM does general strength + mobility.

```
pickleball, tennis, golf, golf coach, tennis coach, running, running coach,
marathon, triathlon, boxing, boxing coach, martial arts, jiu jitsu, mma,
swimming, swim coach, basketball
```

### Research-only / equipment / products (16 keywords)
Filters out comparison shoppers ("vs", "best"), equipment buyers, supplement seekers.

```
near me reviews, review, reviews, vs, versus, comparison, best home gym,
equipment, dumbbells, kettlebells, home gym, treadmill, workout clothes,
gym wear, shaker, supplement, supplements, protein, creatine
```

### Adult content false positives (5 keywords)
Rare but worth blocking. "Personal trainer" + adult-content query terms occasionally trigger ads on the wrong audience.

```
adult, webcam, escort, happy ending, massage parlor
```

---

## Maintenance — adding new negatives over time

Once campaigns are running:

1. **Weekly:** Google Ads → Campaign → Insights → Search terms report
2. Scan for queries that triggered your ads but shouldn't have
3. Click the search term → "Add as negative keyword" → select the shared list "Sun FM Account Negatives"
4. The list will grow over time as Google's machine learning finds edge cases

After 60-90 days, expect to have added another 50-100 negatives based on real search term data.
