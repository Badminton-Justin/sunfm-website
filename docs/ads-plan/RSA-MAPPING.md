# Sun FM — RSA-to-Ad-Group Mapping (Paste-Ready)

**Generated:** 2026-06-07
**Maps:** 5 concepts × 2 frameworks (10 unique RSAs) → 13 ad groups across 3 campaigns
**Sources:**
- RSAs: `campaign-brief.md`
- Ad groups: `docs/ads-plan/CAMPAIGN-ARCHITECTURE.md`
- Keywords: `docs/ads-plan/CAMPAIGN-KEYWORDS.md`

---

## Master Mapping Table

| Campaign | Ad Group | Primary RSA (PAS) | Secondary RSA (BAB) | Customization |
|---|---|---|---|---|
| Brand Defense | AG_Brand_Exact | Concept 1 PAS | Concept 1 BAB | Add a 16th "Sun FM Official Studio" pinned headline |
| Brand Defense | AG_Brand_Phrase | Concept 1 PAS | Concept 1 BAB | Same as above |
| Non-Brand Location | AG_PT_San_Jose | Concept 3 PAS | Concept 3 BAB | Use `{LOCATION(City)}` insertion in 1-2 headlines |
| Non-Brand Location | AG_PT_Sunnyvale | Concept 3 PAS | Concept 3 BAB | Use `{LOCATION(City)}` insertion |
| Non-Brand Location | AG_PT_Cupertino | Concept 3 PAS | Concept 3 BAB | Use `{LOCATION(City)}` insertion |
| Non-Brand Location | AG_PT_Santa_Clara | Concept 3 PAS | Concept 3 BAB | Use `{LOCATION(City)}` insertion |
| Non-Brand Location | AG_PT_Mountain_View | Concept 3 PAS | Concept 3 BAB | Use `{LOCATION(City)}` insertion |
| Non-Brand Location | AG_PT_Other_Cities | Concept 3 PAS | Concept 3 BAB | Use `{LOCATION(City)}` insertion |
| Non-Brand Intent | AG_Mobility | Concept 5 PAS | Concept 5 BAB | No customization |
| Non-Brand Intent | AG_Over_40 | Concept 3 PAS | Concept 3 BAB | No customization |
| Non-Brand Intent | AG_Busy_Professionals | Concept 4 PAS | Concept 4 BAB | No customization |
| Non-Brand Intent | AG_Desk_Worker_Fix | Concept 2 PAS | Concept 2 BAB | No customization |
| Non-Brand Intent | AG_Return_to_Training | Concept 3 PAS | Concept 3 BAB | No customization |

**13 ad groups × 2 RSAs each = 26 RSA placements built from 10 unique RSAs (efficient reuse).**

---

## Why this mapping

### Concept 1 (Free Home Workout Set) → Brand only, not Location
Brand searchers know who you are; the offer + "Free home workout set" closes them this week instead of "I'll come back later." For Location ad groups, we use Concept 3 (Train For The Long Run) which leads with the durable promise — fits the higher-intent non-brand searcher better than offer-first messaging.

### Concept 3 (Train For The Long Run) → All 6 Location ad groups + Over 40 + Return to Training
"Long run" framing works across all city ad groups because location ad groups capture generic high-intent searches like `personal trainer san jose`. These users haven't told us a specific specialty need, so the durable longevity promise + credibility signals (12,000 sessions, 107 reviews) does the heavy lifting. We add Location Insertion for city personalization (details below).

### Concept 2 (Fix What Sitting Did) → Desk Worker only (was 3 ad groups)
Originally mapped to Desk + Mobility + Busy Pros. Trimmed to Desk only because:
- AG_Mobility now has Concept 5 (technical specialist framing) which converts better for mobility-specific intent
- AG_Busy_Professionals now has Concept 4 (precision/time-respect framing) which fits tech-worker intent better than pain framing

### Concept 4 (Built For Busy Pros) → Busy Professionals only [NEW]
Tech execs and engineers respond to "your time isn't being wasted" framing more than pain framing. Concept 4 leads with precision and respect for their schedule.

### Concept 5 (Real Mobility Coaching) → Mobility only [NEW]
Mobility intent searches are highly educated (people know what they're looking for). They need technical credibility — "I read bodies, I find root cause, I'm a specialist." Concept 5 lands harder than general longevity framing here.

---

## Location Insertion — how to use `{LOCATION(City)}`

Google Ads provides an ad customizer that dynamically inserts the user's location into RSA headlines. Use this to make ONE Concept 3 RSA pair feel city-personalized across all 6 Location ad groups.

### Syntax in Google Ads UI

When typing a headline, type `{` and Google's UI suggests inserters:
- `{LOCATION(City)}` → renders the searcher's city (e.g., "Sunnyvale")
- `{LOCATION(City):San Jose}` → renders the searcher's city, with "San Jose" as a fallback if Google can't detect location
- `{LOCATION(Country):USA}` → renders country with fallback

### Recommended Concept 3 PAS headlines updated with Location Insertion

Take the existing Concept 3 PAS headlines and modify these specific ones for use in Location ad groups (do NOT modify the master Concept 3 in campaign-brief.md — apply the change at the per-ad-group level):

| # | Original Concept 3 PAS headline | Location-personalized version | Use when |
|---|---|---|---|
| 6 | Mobility Coach in San Jose (26) | Personal Trainer {LOCATION(City):San Jose} (28) | All 6 Location ad groups |
| 13 | 1:1 Coaching, San Jose Studio (29) | 1:1 Coaching in {LOCATION(City):San Jose} (28) | All 6 Location ad groups |

Keep all other Concept 3 headlines unchanged. The headlines that already include "San Jose" (#5 ACE-Certified Trainer SJ, #11 Studio at 1401 Parkmoor Ave) remain accurate regardless of which city the searcher is in, since your studio physically IS in San Jose. Location personalization is for the "where you serve" framing, not "where you're located."

### Character count gotcha

`{LOCATION(City):San Jose}` is 25 chars as RAW text but renders as ~10-15 chars (the city name). Google measures the RAW count against the 30-char limit. So:
- ✅ "Personal Trainer {LOCATION(City):San Jose}" = 41 chars raw → ❌ exceeds 30 char limit
- ✅ "Coach in {LOCATION(City):San Jose}" = 33 chars raw → ❌ still exceeds

**Fix:** use shorter fallback or shorter pre-text:
- ✅ "PT in {LOCATION(City):SJ}" = 24 chars raw (renders as "PT in Sunnyvale" etc.) — ❌ but "PT" reads as physical therapy in this context, bad
- ✅ "Train in {LOCATION(City):SJ}" = 27 chars raw — better
- ✅ "Coach in {LOCATION(City):SJ}" = 27 chars raw — works

Simplest safe approach for Location ad groups: ADD 1-2 new headlines with `{LOCATION(City)}` in slots 16-17 (Google supports up to 15 headlines per RSA — actually adding more isn't possible, so substitute):

**Replace headline #6 and #13 in Concept 3 PAS as used in Location ad groups:**

| # | Replacement |
|---|---|
| 6 | "Coach in {LOCATION(City):SJ}" (27 chars raw) |
| 13 | "Train in {LOCATION(City):SJ}" (27 chars raw) |

Both render naturally for any South Bay city Google detects.

For ad groups outside Location (Intent + Brand), use the original Concept 3 headlines unchanged.

---

## Custom Brand Headline for AG_Brand_Exact + AG_Brand_Phrase

For Brand campaigns, add ONE pinned position-1 headline to the Concept 1 RSA to defend against competitors bidding on your brand:

**Pinned headline (Position 1, AG_Brand_Exact + AG_Brand_Phrase only):**
- "Sun FM Official Studio" (22 chars)
- Pin this to position 1 so it ALWAYS shows first when your brand search triggers the ad
- Tells brand searchers "you're at the right place, not a competitor running brand-jacking ads"

How to pin in Google Ads UI:
1. Inside the RSA editor, click the pin icon next to the headline
2. Choose Position 1 (or Position 1 + 2 for double-defense)
3. Pinning slightly reduces Smart Bidding flexibility, which is acceptable for Brand only (volume is small, defense matters)

**Do NOT pin headlines on Non-Brand ad groups.** Pinning anywhere outside Brand kills Smart Bidding's ability to optimize headline combinations.

---

## Per-Ad-Group Implementation Checklist

For each of the 13 ad groups:

1. ☐ Create ad group in Google Ads UI
2. ☐ Add keywords from `CAMPAIGN-KEYWORDS.md` (paste block per ad group)
3. ☐ Create Primary RSA — paste from `campaign-brief.md` (mapping above)
4. ☐ Apply customizations (Location Insertion for Location ad groups; Pin headline for Brand)
5. ☐ Create Secondary RSA — paste from `campaign-brief.md` (BAB variant)
6. ☐ Attach campaign-level negatives (if Camp 2 or Camp 3)
7. ☐ Verify ad strength shows "Excellent" or "Good" (Google's automated review)
8. ☐ Mark as DRAFT, do not activate

---

## Attaching account-wide assets

These apply to all 3 campaigns, set at the campaign level (not ad group):

### Sitelinks (from `campaign-brief.md` Sitelink section)
1. Free Movement Screen → /tools/movement-screen
2. About Jeffrey Sun → /team
3. Client Stories → /#testimonials
4. Strength for Longevity → /training/strength-training-for-longevity-beginners-guide-over-30
5. Studio Location & Hours → /#studio (or homepage anchor)
6. Free Consultation → /start

### Callouts (from `campaign-brief.md` Callout section — 10 of these)
Paste all 10 into the campaign-level Callouts asset. Google rotates them automatically.

### Structured Snippets (from `campaign-brief.md` Services section)
Header: **Services**
Values: Personal training, Mobility coaching, Posture correction, Strength training, Movement screens, Hip mobility, Online coaching

### Call Extension
- Number: (408) 761-4963
- Schedule: Mon-Fri 6am-9pm, Sat 7am-5pm (match GBP hours)
- Call reporting: enable

### Location Extension
- Auto-pulled from your linked GBP profile (Tools → Linked accounts → confirm)
- Renders as "1401 Parkmoor Ave • 0.8 mi" with map pin on mobile

### Image Extensions (optional, Phase 2 polish)
3 images from `campaign-brief.md` Image Briefs (1, 2, 3) — generate via `/ads-generate` or manual photoshoot. Defer if launching this week; add in week 2.

---

## Summary

| Asset | Count | Source |
|---|---|---|
| Unique RSAs | 10 | campaign-brief.md (Concepts 1-5, PAS + BAB) |
| RSA placements across ad groups | 26 | This mapping doc |
| Customizations | 2 types | Location Insertion (Loc) + Pinned headline (Brand) |
| Sitelinks | 6 | campaign-brief.md |
| Callouts | 10 | campaign-brief.md |
| Structured Snippets | 7 | campaign-brief.md |
| Image Extensions | 5 briefs ready | campaign-brief.md (optional Phase 2 polish) |

All Phase 2 creative work is now complete. The next step is Phase 3 — campaign build in Google Ads UI, which is mostly mechanical paste-from-doc work.
