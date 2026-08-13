# Sun FM — Content Map

**Purpose:** this is the information-architecture reference for the blog. Read it before writing a new post, so topic placement and interlinking are a deliberate decision instead of something an audit discovers later. Update it after publishing anything that changes the picture below (new post, new cluster, a cluster that's outgrown its shape).

This is not a substitute for the SERP/gap research in `/new-blog` Step 1 — it's the *internal* map (what exists, how it's grouped, how it should link) that complements the *external* research (what's ranking, what's missing).

---

## Route structure

- `/<category>/<slug>` — blog posts. Categories: `training`, `nutrition`, `wellness`.
- `/blog` — full post index (all categories, `Related Articles`-free, just the grid).
- `/<category>` — per-category index page.
- `/<city>-personal-trainer` — 10 city landing pages (San Jose, Sunnyvale, Cupertino, Santa Clara, Mountain View, Los Gatos, Saratoga, Los Altos, Milpitas, Campbell), driven by `src/lib/service-areas.ts`.
- `/tools/movement-screen` — the primary conversion asset. Nearly every blog post should route toward this or `/#apply` in its closing section.
- `/team`, `/start` (PPC-only, noindexed), `/#apply`.

---

## Blog clusters (43 posts as of 2026-08-13)

### 1. Desk-worker self-check cluster (17 posts) — the biggest cluster, split into 3 sub-groups + 1 cross-cutting addition

This is the "at-home test, pass/borderline/fail, then drills" format. It's the site's signature content type and the one most likely to keep growing, so sub-grouping matters more here than anywhere else.

**1a. Pure mobility/ROM tests** (no pain framing, just "how much range do you have"):
- `ankle-mobility-test-at-home`
- `hip-mobility-test-at-home`
- `thoracic-spine-mobility-test-at-home`
- `hamstring-flexibility-test-at-home`
- `core-stability-test-at-home`
- `grip-strength-test-at-home-build-after-40`
- `lumbar-spine-mobility-test-at-home` (2026-07-17) — fills the gap between hip-mobility (ball-and-socket ROM), thoracic-spine (upper-back rotation/extension), and SI-joint (pelvis pain-triage). Tests hip-lumbar dissociation and segmental control rather than pure range. Cross-links with `hip-mobility-test-at-home`, `thoracic-spine-mobility-test-at-home`, and `si-joint-pain-when-sitting-at-a-desk-self-test` in its differential section; the SI-joint post's own differential section now points here instead of to `posture-self-check-at-home` for "pain that's central and moves with spinal bending," since this is the more precise match.
- `balance-test-at-home-single-leg-checks-over-40` — uses the same 3-test format, but the topic (single-leg balance, tied to longevity/mortality research) sits closer to the strength-for-longevity pillar than to desk-worker pain specifically. Linked bidirectionally with the `strength-training-for-longevity-beginners-guide-over-30` pillar post (2026-07-14), alongside the usual self-check cluster placement.
- `foot-arch-test-at-home-flat-feet-or-high-arches` (2026-07-20) — the one joint in the kinetic chain the cluster hadn't covered yet (ankle, hip, thoracic spine, hamstring, core, grip, lumbar spine, balance, shoulder were all already claimed). 3 tests (wet footprint, navicular drop, single-leg arch check), plus the short-foot/toe-splay/towel-scrunch drills. Cross-links with `ankle-mobility-test-at-home` (added a reciprocal outbound link there) and `hip-mobility-test-at-home` in its kinetic-chain section.
- `sitting-rising-test-at-home` (2026-08-04) — the composite self-test the cluster was missing. Sits with `balance-test-at-home-single-leg-checks-over-40` in the longevity-marker sub-thread rather than with the joint-by-joint ROM tests around it in 1a: one score bundles ankle range, hip rotation, deep-range leg strength, and balance, and the post's job is decomposing that score into which of the four owns the deduction. Anchored on the June 2025 European Journal of Preventive Cardiology mortality study (4,282 adults, 46-75, median 12.3 years), which the whole SERP covers as news and abandons at "your score was 6." Links out to `ankle-mobility-test-at-home`, `hip-mobility-test-at-home`, and `balance-test-at-home-single-leg-checks-over-40`, each attached to a distinct follow-up check rather than dropped in as related reading; added a reciprocal inbound link from `strength-training-for-longevity-beginners-guide-over-30` in its grip-and-balance paragraph, which already framed at-home longevity markers. Note for future audits: this post and the balance-test post were the two "longevity marker" self-tests, and the cardio-capacity gap flagged here was filled on 2026-08-07 by `cardio-fitness-test-at-home-after-40` (see cluster 5). The longevity-marker sub-thread is now three posts deep and measures mobility, balance, and aerobic capacity, so a fourth needs a genuinely new axis. Strength relative to bodyweight was the remaining open candidate, and it was filled on 2026-08-13 by `push-up-test-at-home-what-your-number-means-after-40` (below). The longevity-marker sub-thread is now four posts and covers mobility, balance, aerobic capacity, and upper-body strength endurance. A fifth needs a measurement none of those touch; nothing obvious is left, so treat this sub-thread as closed unless new research opens an axis.
- `push-up-test-at-home-what-your-number-means-after-40` (2026-08-13) — fills the strength-relative-to-bodyweight axis. The decomposition is the point: a push-up count is pressing strength plus trunk stability plus shoulder position, and the post sorts a low number into which of the three ran out (via an incline push-up check, a plank hold, and a slow-negative elbow/scapular check), then gives a six-week plan per cause. Anchored on Yang et al., JAMA Netw Open 2019 (1,104 male career firefighters, mean age 39.6, 37 CVD events over 8,601 person-years), and the post spends real space on why the headline "96 percent" is shakier than it reads: wide CI on the top band, a non-monotonic dose-response (21-30 beat 31-40), and the authors' own statement that it may not generalize to women, older adults, or non-active people. Norms are the standard full push-up tables, collapsed from seven bands to three. Links out to `core-stability-test-at-home` and `shoulder-mobility-test-at-home`, each attached to a specific failure cause rather than dropped in as related reading. Inbound link from `grip-strength-test-at-home-build-after-40` at its "where to start" close, framed as the second upper-body number to sit next to the dead hang.

**1b. Shoulder micro-cluster** (3 posts, tightly related, cross-linked in both directions as of 2026-07-11):
- `shoulder-mobility-test-at-home` — general tightness, no pain
- `shoulder-impingement-for-desk-workers-self-check` — pain in the 60-120° arc specifically
- `frozen-shoulder-vs-shoulder-impingement-self-check` — differentiates the above from adhesive capsulitis

**1c. Pain-triage / differential-diagnosis posts** (symptom-driven, "is this X or Y", desk-sitting-specific):
- `knee-pain-when-sitting-at-a-desk`
- `neck-pain-when-sitting-at-a-desk`
- `posture-self-check-at-home`
- `si-joint-pain-when-sitting-at-a-desk-self-test`

**Rule for this cluster:** a new post here needs a genuinely distinct joint/pattern AND a genuinely distinct angle (test vs. pain-triage vs. differential-diagnosis vs. pure-ROM) from all 15 existing ones, or it's a rewrite candidate, not a new post. Check sub-group 1b's pattern (2-3 tightly related posts, explicitly cross-linked) before adding a 4th shoulder-adjacent post — that's the size where a micro-cluster should get its cross-links written in, not discovered later. Ruled out as too overlapping in 2026-07 research: hip flexor tightness (already in hip-mobility-test), glute activation (already in knee-pain post), calf mobility (already in ankle-mobility-test), jaw/TMJ (wrong authority — dentist territory, not a trainer's lane), wrist mobility, postural breathing reset, desk ergonomics checklist, rowing habit, return to running, overhead press guide, pelvic floor + breathing, supplements for over-40 lifters. This cluster is now close to saturated across the whole kinetic chain (ankle, hip, thoracic spine, hamstring, core, grip, lumbar spine, balance, foot arch, shoulder x3, knee, neck, posture, SI-joint) — new posts are more likely to belong in cluster 2, 3, or 4 going forward.

### 2. Strength training fundamentals / programming (17 posts — subheading count was stale at "13" until 2026-08-01, corrected)

- `strength-training-for-longevity-beginners-guide-over-30` — the entry point/pillar for this group
- `how-often-should-you-strength-train-after-30`
- `how-to-warm-up-before-lifting`
- `how-to-breathe-during-heavy-lifts`
- `deadlift-setup-for-over-30`
- `functional-movement-exercises-for-desk-workers`
- `resistance-band-routine-desk-workers-no-equipment`
- `what-to-do-on-rest-days-strength-training`
- `when-to-take-a-deload-week`
- `injury-vs-soreness-when-to-train-through-pain-over-30`
- `how-to-return-to-strength-training-after-a-break`
- `personal-trainer-for-injury-recovery-bridge-from-physical-therapy`
- `how-long-to-see-results-strength-training-after-40`

No formal sub-clusters yet, but there's a natural "program design" thread (frequency, warm-up, breathing, deadlift) and a "coming back from a setback" thread (deload, injury vs soreness, return-after-break, post-PT bridge) worth linking within, not just to the pillar post.

- `mobility-vs-strength-training-why-you-need-both` (2026-07-23) — the connective-tissue post between this cluster and cluster 1 (the 16-post mobility-test cluster). Explains why mobility work and strength training are complementary, not competing, and how to run both without a separate mobility day. Added an inbound link from `functional-movement-exercises-for-desk-workers`; links out to `hip-mobility-test-at-home`, `ankle-mobility-test-at-home`, and `strength-training-for-longevity-beginners-guide-over-30`.
- `pickleball-tennis-golf-injury-prevention-return-to-sport-after-40` (2026-07-26) — return-to-sport bridge for desk workers getting back into racquet sports and golf after years away. Distinct from cluster 1: sport-specific and pre-emptive (a rotational hip-shoulder-separation self-test) rather than symptom-driven pain-triage. Links out to `balance-test-at-home-single-leg-checks-over-40` and `hip-mobility-test-at-home`; added a reciprocal inbound link from the balance-test post's closing section.
- `how-hard-should-you-be-training-rpe-self-test-after-30` (2026-07-30) — the programming-lever gap this cluster hadn't covered: how to self-regulate training intensity (reps in reserve / RPE) instead of guessing. A 4-question self-test scores recent workouts as too light, dialed in, or too hot, and ties misjudged effort directly to the injury patterns covered elsewhere in the cluster. Links out to `when-to-take-a-deload-week` and `injury-vs-soreness-when-to-train-through-pain-over-30`; added a reciprocal inbound link from `how-to-breathe-during-heavy-lifts`'s week-three progression step. Note for future audits: this cluster's posts have accumulated 5-10 internal links each by this point — when picking a reciprocal-link target, "least link-dense among thematically relevant options" is the realistic bar now, not an absolute low count.
- `training-around-a-chronic-injury-that-never-fully-healed` (2026-08-01) — fills the gap between `injury-vs-soreness-when-to-train-through-pain-over-30` (week-one triage) and `personal-trainer-for-injury-recovery-bridge-from-physical-therapy` (formal PT discharge): the population that had neither, just an old ache that quietly stuck around for years. Covers compensation-pattern mechanics, a flare-up/compensation/new-problem self-check, a "load map" framework (load directly / load around / leave alone), and a 4-week reintroduction template. Links out to `injury-vs-soreness-when-to-train-through-pain-over-30` and `personal-trainer-for-injury-recovery-bridge-from-physical-therapy`; added a reciprocal inbound link from the PT-bridge post's closing section, alongside its existing branches to the injury-vs-soreness and return-after-a-break posts.

### 3. Nutrition (3 posts)

- `protein-intake-for-muscle-after-40`
- `hydration-and-electrolytes-for-strength-training-after-40`
- `meal-prep-for-busy-professionals`

Small enough that all three can reasonably reference each other; no sub-grouping needed yet.

### 4. Wellness / recovery-adjacent (3 posts)

- `sleep-and-muscle-recovery-for-strength-training-over-30`
- `when-work-stress-should-change-how-you-train`
- `personal-training-for-stress-relief-bay-area`
- `recovery-tools-cold-plunge-sauna-massage-gun-after-40` (2026-08-10) — evidence-graded read on cold water immersion, sauna, and percussive devices. The sorting principle is whether a tool acts on how you feel, on what you adapt, or both, which puts cold plunge in a different category from the other two. Anchors: Roberts et al. 2015 (J Physiol, 21 men, 12 weeks, strength and mass both higher in the active-recovery arm), Fyfe et al. 2019 (J Appl Physiol, 16 men, 7 weeks, fiber hypertrophy blunted but maximal strength intact), a Bayesian meta-analysis on post-resistance heat, and a 39-study review on percussive devices. The SERP differentiator is that nearly every ranking page is published by someone selling the equipment. Links out to `sleep-and-muscle-recovery-for-strength-training-over-30` and `when-to-take-a-deload-week`; inbound link added from the sleep post's supplements-hierarchy passage, which already framed purchases as downstream of sleep.

Overlaps meaningfully with cluster 2's "coming back from a setback" thread (deload, rest days) — these are legitimate cross-category link targets, not just same-category ones. Note that the recovery-tools post deliberately routes readers *toward* the deload post rather than competing with it: its position is that most perceived recovery problems are programming problems.

### 5. Conditioning / aerobic fitness (1 post — new cluster as of 2026-08-07)

- `cardio-fitness-test-at-home-after-40` (2026-08-07) — the seed post for a pillar the site had zero coverage of across its first 40 posts. Uses cluster 1's self-test format (test, score, decompose, fix) but measures conditioning rather than mobility or pain, which is why it sits here instead of in cluster 1. Three tests: a timed four-flight stair climb (ESC/EACVI 2020, Peteiro, 165 patients), one-minute heart rate recovery taken off that same climb (Cole et al., NEJM 1999, 2,468 adults, ≤12 bpm cutoff), and the YMCA three-minute step test scored against age/sex norms. The differentiator against the SERP is decomposition plus honesty about the research cohorts, since the ranking pages are split between VO2-max calculators that stop at a number and listicles with no scoring. Links out to `sitting-rising-test-at-home` (the other composite-score-needs-decomposing post), `sleep-and-muscle-recovery-for-strength-training-over-30` (heart rate recovery is sleep-sensitive), and `how-often-should-you-strength-train-after-30` (the fit-it-around-lifting section). Inbound link added from `what-to-do-on-rest-days-strength-training` at its 60-minute rest-day section, framed to preserve that post's distinction between easy recovery walks and actual aerobic training.

Where this cluster should grow next: **retired the earlier "zone 2 programming for lifters" suggestion on 2026-08-10.** The SERP is genuinely weak there, but the seed post already covers talk-test pacing, two 30-40 minute easy sessions, the 4x4 protocol, a week-by-week build, and a full section on lifting order and same-day vs separate-day scheduling. A dedicated zone-2 post would clear 30% overlap, and a weak SERP doesn't rescue a rewrite. Cardio-versus-lifting scheduling has the same problem for the same reason. This cluster needs either a genuinely new measurement (cardio drift, resting heart rate trends) or a distinct population (returning runners, people cleared after a cardiac event) before it earns a second post.

---

## Linking philosophy

- **No blanket sibling links.** The automated "Related Articles" block (`getRelatedPosts` in `src/lib/blog.ts`) scores candidates by shared *words* (not whole tag phrases — tags here are unique long-tail keyword strings per post, so exact-tag matching finds almost nothing between clearly related posts) weighted by inverse document frequency, so specific overlap (e.g. "shoulder" + "impingement") counts far more than near-universal words ("desk", "San Jose"). It's automatic and doesn't need per-post maintenance, but it's a relevance signal, not a substitute for judgment — a hand-picked contextual link in prose is always stronger than an algorithmic card grid.
- **Manual inline links stay conservative:** one link where it earns its place, in prose, at a natural anchor. Not a "related posts" dump inside the body. (This is already the `/new-blog` Step 4 rule — this map is what tells you *which* post is the right one to link, before you get there.)
- **Every post should route toward `/tools/movement-screen` and `/#apply`** in its closing section regardless of cluster.

## Before writing a new post

1. Check which cluster (if any) the topic belongs to above.
2. If it's cluster 1 (desk-worker self-check), check the 30%-overlap rule against all 16 existing posts, not just the obvious neighbor.
3. Decide the 1-2 existing posts that should get an inbound link, and which existing post(s) the new one should link out to — based on the cluster map above, not a fresh search each time.
4. After publishing, add the new post to the relevant cluster list in this file (or start a new cluster section if it doesn't fit an existing one).
