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

## Blog clusters (38 posts as of 2026-07-30)

### 1. Desk-worker self-check cluster (16 posts) — the biggest cluster, split into 3 sub-groups + 1 cross-cutting addition

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

### 2. Strength training fundamentals / programming (13 posts)

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

### 3. Nutrition (3 posts)

- `protein-intake-for-muscle-after-40`
- `hydration-and-electrolytes-for-strength-training-after-40`
- `meal-prep-for-busy-professionals`

Small enough that all three can reasonably reference each other; no sub-grouping needed yet.

### 4. Wellness / recovery-adjacent (3 posts)

- `sleep-and-muscle-recovery-for-strength-training-over-30`
- `when-work-stress-should-change-how-you-train`
- `personal-training-for-stress-relief-bay-area`

Overlaps meaningfully with cluster 2's "coming back from a setback" thread (deload, rest days) — these are legitimate cross-category link targets, not just same-category ones.

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
