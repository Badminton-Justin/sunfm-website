# Sun FM — SEO Health Audit

**Audit date:** 2026-11-18
**Site:** https://www.sunfm.fitness
**Compared against:** 2026-09-13 audit (superseded by this version; previous text recoverable from git history, commit `7066955`)
**Search window:** GSC Sep 11 – Nov 10, 2026 vs Jul 12 – Sep 10, 2026 (the exact window the September audit reported as "current", so the two reports line up)

---

## Health Score

```
Overall SEO Health Score: 82/100 (Grade B) — ▼ −1 vs Sep 13

Technical SEO:     80/100  ████████░░  (22%)  ▼ −10  ← indexing, see Critical #1
Content Quality:   86/100  █████████░  (23%)  ▲ +1
On-Page / Local:   80/100  ████████░░  (20%)  ▼ −2   (titles; city rankings up)
Schema:            88/100  █████████░  (10%)  ▲ +8   (uploadDate fixed, LinkedIn added)
Performance (CWV): 70/100  ███████░░░  (10%)  — not re-measured (carried)
AI Search (GEO):   92/100  █████████░  (10%)  ▲ +6   (FAQ on 67/67, explicit AI bots)
Images:            72/100  ███████░░░  (5%)   — carried
```

**One-line takeaway:** search traffic doubled and almost every September fix shipped and held, but **Google has chosen not to index 42 of the 89 URLs in the sitemap.** Most of them are the "self-test at home" posts. Publishing more posts in that format will not help until Google indexes the ones already live.

---

## Search Performance

| | Jul 12 – Sep 10 | Sep 11 – Nov 10 | Change |
|---|---|---|---|
| Clicks | 78 | **165** | **+112%** |
| Impressions | 15,792 | 11,700 | −26% |
| CTR | 0.49% | **1.4%** | +0.9pp |
| Avg position | 10.3 | **8.3** | +2.0 places |

**Where the click growth came from:**

| Segment | Clicks (prior → now) | Impressions (prior → now) |
|---|---|---|
| Brand queries ("sun functional movement", "sunfm", …) | 17 → **64** | 74 → 132 |
| Non-brand queries (named) | 12 → 7 | 12,445 → 8,993 |
| City pages | 16 → **46** | 6,023 → 4,633 |
| Blog posts | 9 → 17 | 1,397 → 1,657 |
| `/team` | — → 16 | — → 278 |

Brand demand nearly quadrupled. That's the Meta and Google Ads spend and word of mouth showing up as people searching the name, so this growth comes from the ads, not from SEO. Named non-brand query clicks went *down*. (GSC hides low-volume queries, so roughly half of all clicks have no query attached; the direction still holds.)

**City pages are the SEO win of this period.** The Oct 24 commit `7ee283c` (answering weight-loss / online / gym searches on city pages) lines up with large position gains:

| Page | Position (prior → now) | Clicks |
|---|---|---|
| San Jose | 36.0 → **5.7** | 3 → 17 |
| Sunnyvale | 34.8 → **8.1** | 2 → 6 |
| Saratoga | 37.4 → 19.7 | 1 → 4 |
| Campbell | 22.5 → **7.8** | 3 → 2 |
| Milpitas | 18.5 → 9.5 | 1 → 2 |
| Cupertino | 21.5 → 14.8 | 2 → 2 |
| Los Gatos | 16.6 → 13.7 | 1 → 4 (still 1,427 impressions, mostly unrelated "boutique fitness / classes" queries) |
| Willow Glen (new) | — | no impressions; **not indexed** |

"personal trainer san jose" itself moved 46.8 → 21. That's still page 3, but it's moving.

**Blog posts are still not earning search traffic.** 17 clicks across 67 posts in two months. Informational (non-local, non-brand) queries total 235 impressions and **0 clicks**. Of the 17 posts published since the last audit, 6 have any impressions (93 combined) and none has a click. The one post with real traction is `how-long-to-see-results-strength-training-after-40` (406 impressions, 6 clicks, pos 6.5).

### The www / non-www "split" was misdiagnosed in September

September blamed the two-hop redirect chain for `https://sunfm.fitness/` (non-www) carrying most of the site's impressions. The query data says otherwise. That URL's impressions come almost entirely from **"personal trainer near me" — 5,716 impressions at position 1.2 with 1 click.** A desktop organic result at position 1.2 does not get a 0.02% CTR. These are **Google Business Profile / local-pack impressions**, and they're attributed to `https://sunfm.fitness/` because **the GBP "Website" field points at the non-www URL.** The ~27 `/?rwg_token=…` rows in the Pages report (Reserve with Google links from the same profile) support this.

**Fix:** in the Google Business Profile, set Website to `https://www.sunfm.fitness/` (optionally with `?utm_source=google&utm_medium=organic&utm_campaign=gbp` so GA4 can separate profile visits). This is a 30-second change in the GBP dashboard. It consolidates the reporting, and it's the fix for the problem September attributed to the redirect chain.

### GA4 (first pull in any audit)

GA4 only started recording around Sep 10 (18 sessions in the prior window), so there's no comparison yet. Current window:

| Channel | Sessions | Engagement rate | Key events |
|---|---|---|---|
| Paid Social | 789 | 50% | 32 |
| Direct | 736 | 25% | 15 |
| **Organic Search** | **354** | **58%** | **12** |
| Organic Social | 335 | 79% | 16 |
| Paid Other | 126 | 29% | 0 |
| AI Assistant | 19 | 89% | 1 |

Organic search is 15% of sessions and 15% of key events. AI assistants (ChatGPT/Perplexity/etc.) now send a small but highly engaged trickle and already produced a conversion. The GEO work (llms.txt, FAQ schema, explicit AI-bot rules) has begun to pay off.

---

## What's Changed Since 2026-09-13

17 new posts (50 → 67), 88 commits. Every one of the 17 is in `/training`; nutrition and wellness got nothing. New pages: `/team/*` bios (4) and `/willow-glen-personal-trainer`.

### September items — status

| Sept item | Status |
|---|---|
| Critical #0 — sitemap not read since May | **Fixed.** Submitted Sep 30, last read **Nov 15**, 89/89 discovered. `scripts/submit-sitemap.py` is in `/new-blog`. |
| Critical #1 — homepage posters / LCP | Fixed Sep 13 (`15e3b0d`); hero fade dropped (`4b8192f`). Not re-measured (see below). |
| Critical #2 — fabricated video `uploadDate` | **Fixed and holding** (`page.tsx:113` comment explains why). |
| High #3 — LinkedIn `sameAs` | **Done** (`88a4c2f`). |
| High #4 — citation hyperlinks stopped | **Fixed, and the strongest change of the period.** All 17 new posts link sources (119 links, 7 per post on average). All 148 PubMed IDs on the site were checked against NCBI's E-utilities and every one resolves to a real paper on the claimed topic. |
| Medium #5 — FAQ on 21/50 posts | **Done: 67/67** (`8a8f698`). |
| Medium #6 — `updated` frontmatter | Still 1/67. Going-forward discipline, not a batch job. |
| Medium #8 — bare-HTTP 2-hop redirect | **Still 2 hops** (`http://sunfm.fitness` → 308 → `https://sunfm.fitness` → 301 → www). Downgraded back to Low (see non-www section above). |
| Medium #9 — hardcoded sitemap dates | **The risk materialized.** See High #3. |
| Low #10 — stray IndexNow key | Done. |
| Low #11 — explicit AI crawler rules | Done, 12 named agents in `robots.txt`. |

---

## Critical

### 1. 42 of 89 sitemap URLs are not indexed — and the list is mostly self-test posts

GSC → Pages: **45 indexed, 58 not indexed.** Excluding Next.js CSS files (harmless) and expected exclusions (redirects, `noindex` on `/privacy` and `/start`), that leaves **42 real pages Google has declined to index**:

**Crawled – currently not indexed (14):** Google fetched these, judged them, and dropped them.
`shoulder-mobility-test-at-home`, `hip-mobility-test-at-home`, `hamstring-flexibility-test-at-home`, `ankle-mobility-test-at-home`, `thoracic-spine-mobility-test-at-home`, `push-up-test-at-home-…`, `grip-strength-test-at-home-…`, `frozen-shoulder-vs-shoulder-impingement-self-check`, `knee-pain-when-sitting-at-a-desk`, `neck-pain-when-sitting-at-a-desk`, `what-to-do-on-rest-days-strength-training`, and the category hubs `/training`, `/nutrition`, `/wellness`.

Several of these *were* indexed and ranking in the prior window and have since been dropped: `hamstring-flexibility-test-at-home` went 746 → 326 impressions and `shoulder-mobility-test-at-home` 154 → 27.

**Discovered – currently not indexed (28):** Google knows the URL and hasn't bothered to crawl it.
All four `/team/*` bios, `/willow-glen-personal-trainer`, the three nutrition posts (`protein-intake-…`, `lose-fat-without-losing-muscle-…`, `hydration-and-electrolytes-…`), and 20 training posts, including 9 of the 17 new ones (achilles, buttock, glute activation, hip pain lying on side, hip OA, hypermobility, knee pain hiking, plantar fasciitis, standing desk).

**Why this is most likely happening.** It is a quality/similarity judgement, not a technical block. Every one of these pages returns 200, is self-canonical, server-rendered, in the sitemap, and not noindexed. The pattern:

- **About 30 posts share one template**: "[body part / symptom] self-test at home after 40", with a near-identical intro → test → scoring → what-it-means → FAQ structure. Each post is individually good. Seen together they look like scaled content to Google's systems, which index a few representatives and skip the rest. The posts being dropped are almost all from this cluster. The posts that hold are the ones that break the pattern (`how-long-to-see-results…`, `functional-movement-exercises-for-desk-workers`, `strength-training-for-longevity…`).
- **New posts get almost no internal links.** Of the 17 new posts, 10 have exactly one inbound link from another post. September's "zero orphans" is technically still true, but one link from a post that is itself unindexed passes almost nothing.
- **The hub pages that should distribute authority are themselves unindexed.** `/training`, `/nutrition`, `/wellness` are thin listing pages with "Crawled – not indexed" status, so the category layer gives Google no reason to crawl deeper.
- The domain is ~6 months old with no measured backlink profile, so Google's crawl budget for it is small. It will not crawl 3 near-identical posts a week.

**Fix, in order:**
1. **Pause new self-test posts.** Publishing a 31st in the format adds to the problem.
2. **Make the category hubs real pages.** Give `/training` (and the other two) 300–500 words of genuine intro plus *grouped* links: e.g., "Self-tests by body part", "Desk-worker pain", "Programming". This turns a list into a hub Google wants to index, and gives every post a strong inbound link.
3. **Build one "at-home self-test" pillar page** that explains the battery, links every test, and gets linked from the homepage/nav. Then cross-link the tests to each other by body region (hip ↔ glute ↔ buttock ↔ SI joint; foot arch ↔ plantar ↔ achilles; etc.).
4. **Consider merging the weakest overlaps.** E.g., `knee-pain-when-sitting-at-a-desk` / `neck-pain-when-sitting-at-a-desk` / `si-joint-pain-when-sitting-…` / `standing-desk-back-pain-…` could become one strong "desk pain self-check" with 301s. Fewer, stronger URLs beat many skipped ones.
5. After 1–3 ship, use URL Inspection → Request Indexing on ~10/day starting with the dropped pages that previously ranked (hamstring, shoulder, hip mobility).
6. Re-check GSC → Pages in 3–4 weeks. Success is "Crawled – not indexed" shrinking, not the sitemap count growing.

---

## High Priority

### 2. Two broken internal links (and they explain GSC's 404s)

GSC reports 2 "Not found (404)" pages. They are links from posts to slugs that never existed:

- `src/content/blog/training/injury-vs-soreness-when-to-train-through-pain-over-30.mdx:136` → `/training/what-to-do-on-rest-days` (should be `…-strength-training`)
- `src/content/blog/nutrition/hydration-and-electrolytes-for-strength-training-after-40.mdx:63` → `/training/warm-up-before-lifting` (should be `how-to-warm-up-before-lifting`)

Both date from May/June and were missed by the previous two audits, which counted links but didn't resolve them. Fix the two slugs. The `/new-blog` link step should also check that each internal link target exists.

### 3. Sitemap `lastmod` is now wrong for the pages that changed most

`src/app/sitemap.ts:10-13` still hardcodes `HOMEPAGE_LAST_MODIFIED = 2026-07-11` and `SERVICE_AREAS_LAST_MODIFIED = 2026-07-11`. Since then the homepage changed on Oct 18 and Nov 3, and every city page was rewritten on **Oct 24** (`7ee283c`), which is the change that drove the ranking gains above. Google is being told those pages haven't changed since July. Derive these from git history at build time (or from the data files' mtimes), the same way `llms.txt` was fixed.

### 4. Post titles are too long for search results

Every post published since mid-July has a `<title>` over 65 characters, and recent ones run 95–121 (e.g., *"Test your muscle power at home after 40: three leg power tests you can score, and why power fades before strength - SunFM"*). Google cuts these at roughly 60 characters, so most of the title, including " - SunFM", never shows. Meta descriptions are similarly 200–270 chars against a ~160 display limit.

The H1 can stay long and conversational. Add an optional `seoTitle` (≤60 chars) and `seoDescription` (≤155) frontmatter field, use them in `generateMetadata` at `src/app/[category]/[slug]/page.tsx:48`, and have `/new-blog` write them. Backfill the posts that have impressions first. A tighter title is the cheapest CTR lever for pages already sitting at position 6–9.

### 5. Team bio pages: thin and unindexed

The four `/team/*` pages are 163–289 words and sit in "Discovered – not indexed". `/team` itself got 16 clicks, which shows people search for the coaches. Each bio should carry real substance: credentials, specialties, a client story, the posts that coach wrote. Person schema on a page Google won't crawl does nothing for E-E-A-T.

---

## Medium Priority

6. **Category balance.** All 17 recent posts are `/training`. Nutrition (3 posts) and wellness (4) are each unindexed or near it. If writing resumes after the pause in Critical #1, the next few posts should be outside the self-test format and outside `/training`.
7. **Willow Glen city page** is unindexed with no impressions. Link it from the San Jose page (Willow Glen is a San Jose neighborhood, so that's the natural parent) and from the homepage service-area list if it isn't there already.
8. **Verify the GBP phone number.** The site phone changed twice in three weeks (to (620) 407-2893 on Oct 17, then to (408) 539-1682 on Nov 3). The site and schema are now consistent on `+1-408-539-1682`. Confirm the Google Business Profile, Yelp and other citations match, since NAP mismatch is a local-ranking signal. (Not checkable from here.)
9. **One dead citation link:** `core-stability-test-at-home.mdx` links `https://pmc.ncbi.nlm.nih.gov/articles/PMC5468830/`, which now returns 410 Gone. Swap it for the PubMed or DOI URL of the same paper. Five other citations return 403 to scripts (JAMA, OUP, two DOIs, thebarbellphysio.com). That's bot-blocking, and they almost certainly work in a browser.
10. **`updated` frontmatter: 1 of 67.** Unchanged. Stamp it on genuine rewrites only. Several posts will get substantive edits if Critical #1 is acted on, and those edits should be stamped.

## Low Priority

11. **Bare-HTTP 2-hop redirect** — still `http://sunfm.fitness` → 308 → https non-www → 301 → www. Now that the non-www impressions are explained by GBP, this goes back to cosmetic. It needs a host/DNS change outside the repo.
12. **Los Gatos** still surfaces for broad "classes / boutique fitness" queries it doesn't answer (1,427 impressions, 4 clicks). Low value, no action needed.
13. **`aggregateRating` on city pages without visible rating UI** — unchanged from September.

---

## Content Quality Detail

- **Citations: best they've been.** 17/17 new posts link sources; 148/148 PubMed IDs verified real and on-topic via NCBI. Prose still states each study's limits, so the E-E-A-T strength September noted has held.
- **FAQ schema: 67/67.** Renders correctly in live HTML on every post checked.
- **Length:** new posts average ~2,700 words. Length isn't the problem. Sameness of format is (Critical #1).
- **City pages:** 1,072–1,303 words, distinct per city, now with answers to the weight-loss/online/gym query variants. Clearly working.

---

## What Couldn't Be Measured

- **Core Web Vitals.** Node isn't installed on this Mac (no local Lighthouse), and the keyless PageSpeed Insights API quota was exhausted. Homepage performance after the Sep 13 poster fix and hero-fade removal is therefore unconfirmed. A `GOOGLE_API_KEY` for PageSpeed would make this repeatable.
- **API access to GSC/GA4.** `scripts/auth-google-apis.sh` fails because `~/sunfm-oauth-client.json` no longer exists. This audit read GSC and GA4 through the web UI in Chrome (signed in as the GBP/GSC account) instead. `/seo-analytics` weekly updates will also be broken until the client file is restored (re-download it from GCP project `focal-elf-497403-c0` → APIs & Services → Credentials).
- **Backlinks** — still no tool. At ~6 months this is now worth a look, since low authority compounds the indexing problem.
- **GBP insights / NAP on Yelp & LinkedIn** — manual check needed (see Medium #8).

---

## Recommended Order of Work

1. **Change the GBP Website URL to `https://www.sunfm.fitness/`** — 30 seconds, dashboard only.
2. ~~Fix the two broken internal links (High #2)~~ — **done 2026-11-18.**
3. ~~Derive sitemap `lastmod` for homepage and city pages from git (High #3)~~ — **done 2026-11-18.** `scripts/update-sitemap-dates.py` writes `src/lib/sitemap-dates.json` from git history; `.githooks/pre-commit` runs it on every commit (enabled locally with `git config core.hooksPath .githooks`, which needs re-running on any fresh clone). City pages now report 2026-11-03 instead of 2026-07-11.
4. **Pause self-test posts; rebuild `/training` (and siblings) as real hubs, plus a self-test pillar page** (Critical #1, steps 1–3).
5. **Short `seoTitle` / `seoDescription` fields**, backfill posts with impressions first (High #4).
6. **Request indexing on the dropped pages**, re-check GSC Pages in 3–4 weeks.
7. Flesh out team bios; link Willow Glen; swap the dead PMC link.
8. Restore the OAuth client file so `/seo-analytics` and API-based audits work again.
