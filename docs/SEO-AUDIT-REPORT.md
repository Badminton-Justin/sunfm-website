# Sun FM — SEO Health Audit

**Audit date:** 2026-09-13
**Site:** https://www.sunfm.fitness
**Compared against:** 2026-07-11 audit (superseded by this version — ~9 weeks prior; previous text recoverable from git history)

---

## Health Score

```
Overall SEO Health Score: 83/100 (Grade B) — ▲ +5 vs July 11

Technical SEO:     90/100  █████████░  (22%)  ▲ +2
Content Quality:   85/100  ████████░░  (23%)  ▲ +1
On-Page / Local:   82/100  ████████░░  (20%)  ▲ +17  ← July's headline problem, resolved
Schema:            80/100  ████████░░  (10%)  ▲ +5   (9 fixes held; 1 new regression)
Performance (CWV): 70/100  ███████░░░  (10%)  ★ FIRST MEASUREMENT (lab)
AI Search (GEO):   86/100  ████████░░  (10%)  ▲ +8
Images:            72/100  ███████░░░  (5%)   ★ FIRST MEASUREMENT
```

**Read the headline number carefully.** 78 → 83 understates the progress. July's 78 was computed across only five categories, because Performance and Images were unmeasurable. Those two have now been measured and are the site's two *lowest* scores, so they drag the composite down even as everything else improved.

On a like-for-like basis — the same five categories scored both times — the site went **78 → 85**. The composite is 83 because we can finally see the parts that were previously invisible.

**One-line takeaway:** the July local-SEO crisis was real, was fixed, and has held for nine weeks. The new headline finding is a homepage LCP of 5.0 seconds caused by six unoptimized testimonial images, plus one schema regression where a later commit chose to fabricate video upload dates that the July audit had deliberately left blank.

---

## What's Changed Since 2026-07-11

### Shipping velocity

18 new posts (32 → 50) across 102 commits in nine weeks. Monthly cadence: July 9, August 8, September 4-and-counting. No month below 8. This is the most consistent input the site has.

### Confirmed fixed and holding (verified in live rendered HTML, not source)

| July item | Status |
|---|---|
| Homepage `@type` → `ExerciseGym` | Holding |
| City-page `@type` → `ExerciseGym` | Holding (spot-checked 5 of 10) |
| Geo coordinates unified at `37.3115, -121.9192` | Holding — identical homepage and all sampled city pages |
| City-page schema `name` → "Sun Functional Movement" | Holding |
| `priceRange` `$$` everywhere | Holding |
| Homepage `areaServed` all 10 cities | Holding |
| `openingHoursSpecification` | Holding |
| `aggregateRating` / reviewCount 107 | Holding (owner's deliberate value, not re-flagged) |
| Blog `BlogPosting`, `/team` Person schema | Holding |
| CSP + HSTS `max-age=63072000; includeSubDomains; preload` | Holding |
| `/privacy` noindex,follow | Holding |
| `/start` noindex + correctly absent from sitemap | Holding |

### The llms.txt fix worked

This is the one worth calling out. `public/llms.txt` drifted twice (June, July), each time silently missing posts. July replaced the static file with a dynamic route at `src/app/llms.txt/route.ts` sourced from `getAllPosts()`.

Nine weeks and 18 posts later, both `llms.txt` and `llms-full.txt` serve all 50 posts with zero drift. Converting a recurring manual chore into a derived value permanently closed a problem that two prior audits had only patched. That pattern is worth reusing (see Medium #9).

### Blog growth absorbed cleanly

All 50 posts are in the live sitemap (67 URLs: 4 static + 10 service areas + 3 categories + 50 posts), server-rendered in initial HTML, canonical-correct, none accidentally noindexed.

### Internal link graph — genuinely strong

Across all 50 posts: **zero orphans, zero dead ends**, averaging 3.4 inbound and 3.4 outbound contextual links each. Every post is reachable from another post and passes equity onward. This is the conservative one-link-at-a-time discipline in `/new-blog` Step 4 and `docs/CONTENT-MAP.md` actually compounding, and it beats what most 50-post sites get from automated related-post widgets.

---

## Critical (fix this week)

### 0. Google has not downloaded the sitemap since 2026-05-30. Most new posts have never been crawled.

*Added after GSC auth was restored later the same day. This supersedes everything below it in priority.*

- **Evidence (GSC Sitemaps API):** `https://www.sunfm.fitness/sitemap.xml` — `lastSubmitted: 2026-05-25`, **`lastDownloaded: 2026-05-30`**, 0 errors, 0 warnings, `submitted=36`. The live sitemap now contains **67** URLs. Google's copy is 3.5 months and 31 URLs out of date.
- **Evidence (GSC URL Inspection API):** seven posts published since July all return `coverageState: "URL is unknown to Google"`, `lastCrawlTime: never`:
  - `strength-training-with-knee-osteoarthritis-after-50`, `alcohol-and-muscle-recovery-after-40`, `creatine-after-40-*`, `sitting-rising-test-at-home`, `cardio-fitness-test-at-home-after-40`, `balance-test-at-home-*`, `exercises-for-bone-density-after-40`
  - By contrast `/` and `/tools/movement-screen` both return `PASS / Submitted and indexed`. The site is indexed; the new posts specifically are not.
- **Corroborating:** of the 18 posts published since 2026-07-11, only 2 have any impressions at all (15 impressions, 0 clicks combined).

**The sitemap itself is healthy.** It returns 200, contains all 67 URLs, has zero errors, and its `lastmod` values are accurate and current (newest 2026-09-09, derived per-post from frontmatter in `src/app/sitemap.ts:56`). Nothing is wrong with the file. Google has simply not re-fetched it, and nothing in the publishing pipeline forces it to.

This is also why the site may look healthier on Bing: `/new-blog` pings IndexNow after publish, which notifies Bing and Yandex. **Google does not participate in IndexNow.** For Google, the sitemap is the only announcement channel, and it has been stale since May.

**Fix, in order:**
1. In Search Console → Sitemaps, re-enter `sitemap.xml` and Submit. This forces a re-fetch. (Cannot be done from here — the current ADC token holds `webmasters.readonly`; submitting needs the read-write `webmasters` scope.)
2. Use URL Inspection → Request Indexing on the highest-value recent posts. Roughly 10/day.
3. Add a post-deploy sitemap ping to the publish workflow alongside the IndexNow call, so this can't silently rot again.
4. Re-inspect a sample in ~2 weeks to confirm crawling resumed.

### 1. Homepage LCP is 5.0 seconds — six unoptimized testimonial posters

- **Files:** `src/components/VideoTestimonials.tsx`, `src/components/Testimonials.tsx`
- **Measurement:** Lighthouse 12.8.2, production build, lab. Homepage perf score 73, LCP 5.0s (poor), page weight 4,053 KiB.
- **Cause:** six `<video poster>` JPGs load raw from the Cloudflare R2 bucket (`pub-46d372e7b4b84eaf8efe9f21cab9b2ba.r2.dev`), bypassing `next/image` entirely. Sizes: `Sneha_Edited_Poster.jpg` 836KB, `Kanth_Edited_Poster.jpg` 577KB, `Josh_Edited_Poster.jpg` 396KB, `Karson_Edited_Poster.jpg` 367KB, `Chen_Edited_Poster.jpg` 309KB, `Marshall_Edited_Poster.jpg` 289KB. Roughly 2.8MB of the 4MB homepage.
- **Why it matters most:** this is the page that converts. Every other page tested is 635-802 KiB.
- **Fix:** proxy the posters through `next/image`, or pre-resize at R2 to ~800px WebP/AVIF at ≤80KB each. Lazy-load posters below the fold; only the first visible one should be eager with `fetchpriority="high"`. Expected to bring LCP from 5.0s to sub-2.5s.

### 2. Regression — VideoObject now fabricates `uploadDate`

- **File:** `src/app/[category]/[slug]/page.tsx:113` — `uploadDate: post.date`
- **Introduced:** commit `1d86eaa` (2026-07-26), "Fix missing uploadDate in VideoObject schema"
- **What happened:** July deliberately omitted `uploadDate` rather than invent one, because these are third-party YouTube embeds and no YouTube Data API is configured. A later commit closed the "missing field" warning by substituting the blog post's publish date.
- **Why it's wrong, concretely:** a blog post's publish date is not the video's upload date, and videos are reused across posts. Video `VBobkldqqvk` is embedded in three posts and now declares three different upload dates to Google:
  - `functional-movement-exercises-for-desk-workers` → 2026-04-04
  - `strength-training-for-longevity-beginners-guide-over-30` → 2026-04-12
  - `grip-strength-test-at-home-build-after-40` → 2026-05-27
- **Fix:** revert to omitting the field, or wire up the YouTube Data API for real dates. Satisfying a rich-result requirement with a value that isn't true is worse than forgoing the rich result.

---

## High Priority (this week)

### 3. LinkedIn `sameAs` — unblocked since July, still not added

July listed this as blocked for lack of a URL. The company page now exists: `https://www.linkedin.com/company/sun-functional-movement`. Confirmed absent from every `sameAs` array in live HTML (no `linkedin.com` string anywhere in `src/`).

Add to: `src/app/page.tsx`, `src/components/service-area/ServiceAreaSchema.tsx`, `src/app/team/page.tsx`, `src/app/[category]/[slug]/page.tsx` (author + publisher), and the visible links in `src/components/Footer.tsx`.

### 4. External citation links have disappeared from new posts

The prose citations got *better* over these nine weeks — named journals, sample sizes, stated limitations — but the hyperlinks stopped.

| Window | Posts | External citation links |
|---|---|---|
| Before 2026-07-11 | 32 | 21 |
| Since 2026-07-11 | 18 | 5 (all in the first four posts) |

Every post since 2026-08-04 names its studies precisely and links none of them. Fourteen consecutive posts, zero outbound source links. July's audit item #9 specifically fixed 6 posts by adding verified PMC/PubMed links; the practice then lapsed.

This is a process gap in the `/new-blog` workflow, not a writing problem. Fix: add a step that links each named study to its PubMed/DOI URL, verified 200 before insertion. Worth backfilling the 14 recent posts, since they're the most heavily cited on the site.

---

## Medium Priority (this month)

### 5. FAQ frontmatter covers only 21 of 50 posts (42%)

FAQPage schema is confirmed rendering correctly and is the single heaviest extraction signal for Google AI Overviews and Bing Copilot. The 29 posts without it are leaving the site's best-performing GEO asset on the table. Template is proven; roughly 2-3 posts per sitting.

### 6. `updated` frontmatter: 1 of 50 posts

Unchanged in ratio from July's 1 of 32 (`hip-mobility-test-at-home.mdx` remains the only one). **Do not batch-stamp** — fabricating revision dates is the same integrity error as Critical #2 above. This is a going-forward discipline item: stamp it whenever a post gets a genuine substantive edit.

### 7. Images — the pipeline is fine, the bypass is not

Contrary to two audits' worth of assumption, `public/images/blog/` (99 JPGs, 23MB) **is** correctly optimized on blog pages via `src/components/blog/MDXImage.tsx` using `next/image` with explicit dimensions. Verified in the network trace: a source JPG served as a resized `_next/image` request at 29KB. CLS is 0.001-0.02 across all pages tested, so dimensions are being set correctly everywhere.

The problem is only where the pipeline is bypassed (Critical #1). Largest on-disk originals if anything ever bypasses it again: `red-week-outdoor-walking-path.jpg` 1.16MB, `protein-eggs-skillet-breakfast.jpg` 588KB, `goblet-squat-plate-full-depth-gym.jpg` 536KB.

### 8. Bare-HTTP redirect chain — still 2 hops

Re-measured: `http://sunfm.fitness/` → 308 → `https://sunfm.fitness/` → 301 → `https://www.sunfm.fitness/`. Unchanged since June. Needs a DNS/host console change outside the repo. Low impact, but it's now been carried across three audits.

### 9. Sitemap date constants still hardcoded

`HOMEPAGE_LAST_MODIFIED` / `SERVICE_AREAS_LAST_MODIFIED` (`src/app/sitemap.ts:9,12`) did not drift this round — but only because those source files happened not to change. The risk is dormant, not fixed. Derive them from git mtime or file stat, the same way `llms.txt` was fixed.

---

## Low Priority

10. **Stray IndexNow key file.** `public/cf24bdc6ff229de3c09f8bfc0f48c697.txt` (commit `a9ed936`, 2026-05-24) is unreferenced but still served at the site root. The active key is `0e90bd4ba68b258605def64e9af5bfb9.txt`. Harmless; delete for cleanliness.
11. **AI crawler permissions are now implicit.** `robots.txt` is just `User-Agent: * / Allow: /`. Functionally every named AI crawler is still allowed, so this is not a regression, but the explicit named blocks are gone. Adding them back signals intent and hedges against future default changes.
12. **Campbell city page still thinnest** at 727 words of page-specific copy (San Jose is highest at 918). All 10 are comfortably above the 500-600 floor. Not urgent.
13. **`aggregateRating` duplicated identically on all 10 city pages** with no visible rating UI on those pages. Cosmetic schema-without-corroboration risk; consider a small visible rating cue or trimming to the homepage.

---

## Noted, No Action Recommended

Per the owner's standing decisions (2026-05-25), recorded here factually rather than as findings:

- **reviewCount 107** stays as-is.
- **The San Jose schema vs Sunnyvale GBP split** remains intentionally deferred until the GBP is claimed and reconciled, including the homepage FAQ copy that says in-person sessions are held in Sunnyvale while the address block says San Jose. Current factual state: the `sameAs` Google Maps link (`maps.app.goo.gl/XyrnsHXu9K1xYqXw5`, used in `page.tsx`, `ServiceAreaSchema.tsx`, and `Footer.tsx`) resolves to a listing named **"Jeff Sun Fitness"** at `37.3939, -122.0283`, while the footer contact link (`maps.app.goo.gl/19dXxEMB8WddyoyJ6`) resolves to 1401 Parkmoor Ave, San Jose. Unchanged from the known state. No recommendation made.

**New information that may affect that deferred decision:** the company is currently recruiting for a role advertised as full-time on-site in **Cupertino**. No file in the repo claims Cupertino as the studio location — `/cupertino-personal-trainer` is correctly a service-area page with no address override — so this is not a site bug. But if the physical studio has moved or is moving, that changes the calculus on the deferred GBP reconciliation, and it's worth deciding deliberately rather than by drift. Flagging for the owner, not recommending a change.

---

## Content Quality Detail

- **Citation integrity: clean.** Spot-checked the six most heavily-cited recent posts. Every numeric and clinical claim carries attribution with sample size, dose, or comparator stated alongside the source.
- **E-E-A-T: load-bearing, not decorative.** The distinguishing pattern is that posts state each study's *limits* (LIFTMOR's 101 postmenopausal women not generalizing to a 44-year-old; the push-up cohort's wide CI and non-monotonic dose-response). That requires reading the paper rather than the abstract, and it's what separates this from citation-stuffing. Caveat: nothing in the repo enforces it structurally — it's a discipline strength today, not a guaranteed one.
- **No cannibalization** across the 18-post self-test cluster. Titles and target queries are cleanly segmented by body part and test type. `docs/CONTENT-MAP.md`'s overlap-checking is holding in practice.
- **City pages are not doorway pages.** `src/lib/service-areas.ts` gives each city unique intro, sections, client anecdotes, and 1-2 extra FAQs; only the 4 service cards and 5 shared FAQs are byte-identical, which is normal local-business pattern.

---

## Search Performance — first field data in three audits

ADC was re-authenticated with the `webmasters.readonly` scope on 2026-09-13. Two matched 61-day windows, `sc-domain:sunfm.fitness`:

| | Prior (May 12 – Jul 11) | Current (Jul 12 – Sep 10) | Change |
|---|---|---|---|
| Clicks | 42 | 78 | **+86%** |
| Impressions | 5,895 | 15,792 | **+168%** |
| CTR | 0.71% | 0.49% | −0.22pp |
| Avg position | 18.4 | 10.3 | **+8.1 places** |

Growth is real and the position gain is substantial. CTR fell because impressions grew faster than clicks, which is the expected shape when a site starts surfacing for many more mid-position queries.

**Where the traffic sits (current window):**

| Section | Clicks | Impressions |
|---|---|---|
| Blog posts | 32 | 10,155 |
| City pages | 16 | 6,021 |
| Homepage | 26 | 296 |
| Movement screen | 0 | 10 |

Three things fall out of that:

**The www / non-www split is costing real visibility.** The homepage exists as two entities in Google's index:

| URL | Clicks | Impressions | Avg position |
|---|---|---|---|
| `https://sunfm.fitness/` (non-www) | 23 | 8,756 | **1.4** |
| `https://www.sunfm.fitness/` (www) | 26 | 296 | 13.4 |

Non-www is a single URL carrying more impressions than all 40 www URLs combined, and it ranks at position 1.4 while the canonical www version sits at 13.4. This is the two-hop redirect chain (Medium #8) showing its actual cost. It has been carried as "low priority" across three audits; this data says otherwise and it should be reclassified.

**`/tools/movement-screen` is effectively invisible in search** — 10 impressions, 0 clicks, position 21.9 over 61 days. The primary conversion asset gets its traffic entirely from internal links. Worth deciding whether that's acceptable (it's a tool, not a content page) or whether it deserves its own query targeting.

**The Los Gatos page is ranking broadly but shallowly** — 2,512 impressions, 1 click. Its queries are "athletic training los gatos," "boutique fitness los gatos," "cardio classes los gatos," "beginner fitness classes los gatos," at positions 13-35. It surfaces for a wide net of local fitness terms the page doesn't actually answer. High impressions here are a vanity signal, not an opportunity.

**Brand vs non-brand:** "sun functional movement" alone is 16 of 78 clicks (21%) at position 1.5. The commercial head term "personal trainer san jose" sits at position 46.8.

---

## What Still Couldn't Be Measured

**GA4 / CrUX field data.** GSC is now working (see above); GA4 organic and CrUX field CWV were not pulled this round.

Re-auth is scripted at `scripts/auth-google-apis.sh` — it builds the scope string internally, then test-queries GSC and reports pass or fail. Google expires refresh tokens on unverified OAuth clients roughly weekly, which is why this died before all three prior audits. A service account would not expire: create one in project `focal-elf-497403-c0`, add its email as a Full user in Search Console and a Viewer in GA4, then point the scripts at the key file.

The current token is `webmasters.readonly`. It can read everything but cannot submit a sitemap, so Critical #0 needs either the read-write `webmasters` scope or a manual submit in the GSC UI.

**Core Web Vitals are lab, not field.** PageSpeed/CrUX need a `GOOGLE_API_KEY` that isn't configured. Lab numbers are directionally reliable for the homepage LCP finding (a 4MB payload is slow for everyone) but real-user INP in particular remains unconfirmed.

**Backlink profile:** skipped again. Tier 0 (Common Crawl only, 0 cached domains), no Moz or Bing Webmaster keys. Site is ~5 months old; the June note to revisit at month 6 is nearly due.

**LinkedIn and Yelp NAP:** both bot-blocked to automated fetch. Needs a manual eyeball.

---

## Recommended Order of Work

1. **Resubmit the sitemap in GSC (Critical #0)** — nothing else here matters while 31 URLs are unknown to Google. Then Request Indexing on the strongest recent posts.
2. ~~Homepage testimonial posters (Critical #1)~~ — **done 2026-09-13**, commit `15e3b0d`. Posters 3,280KB → 254KB, homepage 4,053 → 1,030 KiB, perf 73 → 82, LCP 5.0s → 4.1s. The remaining LCP is render delay from the `.hero-enter` staggered fade, a design decision left untouched.
3. ~~Revert the fabricated `uploadDate` (Critical #2)~~ — **done 2026-09-13**, same commit.
4. Fix the www/non-www redirect chain — reclassified upward from Medium; the GSC split is real and costly.
5. Add a sitemap ping to the publish workflow so Critical #0 can't recur silently.
6. LinkedIn `sameAs` (High #3) — one line, five files.
7. Add source links to `/new-blog`, then backfill the 14 recent posts (High #4).
8. FAQ frontmatter for the 29 posts missing it (Medium #5) — steady background work.
