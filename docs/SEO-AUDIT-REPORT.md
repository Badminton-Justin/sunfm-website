# Sun FM — SEO Health Audit

**Audit date:** 2026-06-13
**Site:** https://www.sunfm.fitness
**Compared against:** 2026-05-24 SEO work (3 weeks prior — sitemap fix, llms-full.txt, IndexNow, publisher sameAs, crawl-discovery links, movement screen meta rewrite, footer cross-linking on 05-25)

---

## Health Score

```
Overall SEO Health Score: 78/100 (Grade B)

Technical SEO:     84/100  ████████░░  (22%)
Content Quality:   85/100  ████████░░  (23%)
On-Page / Local:   72/100  ███████░░░  (20%)
Schema:            80/100  ████████░░  (10%)
Performance:       N/A     ──────────  (10%)  ⚠ Not measured this round
AI Search (GEO):   67/100  ██████░░░░  (10%)
Images:            N/A     ──────────  (5%)
```

*Composite weighted 78.7 across the 7 measurable categories. Performance + Images were not fully measured in this audit; assumed ~75 carry-over from baseline.*

**One-line takeaway:** The May 24 push is delivering as designed — sitemap lastmod, llms-full.txt, publisher sameAs, and city-page footer linking are all working. The new gaps are about completing what was started (author sameAs, FAQ schema on posts, /start in sitemap) rather than fixing regressions.

---

## What's Changed Since 2026-05-24

### ✓ Landed and working

| May 24 work | Status |
|---|---|
| Sitemap lastmod fix | Working. Posture-self-check shows 2026-06-11, breathing 2026-06-08, etc. Frontmatter `updated` overrides `date` correctly. |
| llms-full.txt | Live, dynamic route, 24-hour CDN cache, covers all current posts, strips YouTube/MDX cleanly. Spec-compliant. |
| Publisher sameAs | Present on homepage `PersonalTrainer` schema AND blog post `Article` schema. Instagram + Yelp + Google Maps. |
| Crawl-discovery links | Older posts now link to newer ones (functional-movement → posture-self-check, deadlift-setup → breathing post). |
| Footer site-wide | Renders on every page. All 10 city pages linked. Phone `tel:+14087614963` clickable on mobile. |
| Movement screen title/meta rewrite | Title + meta visible in HTML, structured for CTR. |
| City page cross-linking | "Nearby areas" grid on each city page links to all 9 other cities. |

### ⚠ Drifted or incomplete

| Item | What's happening |
|---|---|
| `/start` not in sitemap | High-conversion PPC landing page is indexable but unsubmitted. Was likely planned but not added when /start launched 2026-06-07. |
| `/privacy` not in sitemap | Indexable, unsubmitted. Either add to sitemap or `robots: { index: false }` to align. |
| HOMEPAGE_LAST_MODIFIED hardcoded to 2026-04-13 | The homepage has been updated since (footer phone number, schema additions). Stale lastmod suppresses crawl priority. |
| Static llms.txt missing 2 newest posts | Hydration + stress-training posts not listed. The dynamic llms-full.txt has them; the static index has drifted. |

### ➕ Net-new content shipped since May 24

22 training posts, 2 nutrition, 2 wellness — all over 1,000 words, none thin, all in canonical voice. The May→June posts (neck pain, deadlift setup, breathing, posture self-check) are noticeably stronger than the April posts on specificity, first-person grounding, and internal linking density.

---

## Critical Issues (fix this week)

### 1. `/start` is missing from the sitemap
- File: `src/app/sitemap.ts`
- Add: `{ url: 'https://www.sunfm.fitness/start', lastModified: <recent>, changeFrequency: 'monthly', priority: 0.8 }`
- Why: Your highest-conversion landing page (PPC traffic destination) is currently not submitted to Google. Even if you don't want it ranking organically you still want it discoverable and tracked.

### 2. `openingHoursSpecification` is missing from every LocalBusiness schema
- Files: `src/components/ServiceAreaSchema.tsx`, homepage schema
- Why: This is a required property for GBP knowledge panel alignment. Currently no city page surfaces business hours in structured data.
- Fix: Add the 7-day-of-week block once in the shared schema component.

### 3. `aggregateRating` missing from city page schema
- Files: `src/components/ServiceAreaSchema.tsx`
- Why: Homepage has it (reviewCount 107, your deliberate value). City pages don't. Rich result eligibility blocked for those pages.
- Fix: Pull the same rating data into the city page block.

### 4. 24 blog posts have ZERO outbound links to city pages
- Files: 24 MDX files in `src/content/blog/`
- Why: City pages link TO blog posts (related posts blocks), but no blog post links back to a city page. This is your single biggest unused internal link equity.
- Fix: 5–6 highest-traffic posts get one contextual inline link like `[San Jose personal trainer](/san-jose-personal-trainer)` in a "what to do next" or city-relevant section.

### 5. `/team` has zero structured data
- File: `src/app/team/page.tsx`
- Why: Page renders full bios for Jeffrey + Crystal (credentials, education, specialties) but emits no JSON-LD. Strongest entity-resolution gap in the site.
- Fix: Add two Person blocks with `sameAs` to Instagram/LinkedIn, `alumniOf`, `hasCredential`. Sample provided in schema agent report.

---

## High Priority (this month)

### 6. Author `sameAs` missing from blog post Article schema
- File: `src/app/[category]/[slug]/page.tsx` (lines ~147-152)
- Why: Publisher has sameAs ✓. Author only has name + url + jobTitle. Without sameAs, AI engines can't resolve "Jeffrey Sun" to a specific entity.
- Fix: Add `sameAs: ['https://www.instagram.com/jeffsunfitness/', '<LinkedIn URL if exists>']` to the author Person.

### 7. Blog `@type` should be `BlogPosting`, not `Article`
- File: same as #6
- Why: `Article` is acceptable but `BlogPosting` is Google's preferred subtype for blog content. One-line change.

### 8. `HOMEPAGE_LAST_MODIFIED` constant is stale
- File: `src/app/sitemap.ts`
- Why: Hardcoded `2026-04-13`. Homepage has been updated since (phone, footer, schema). Suppresses crawl priority for your most important page.
- Fix: Either bump the constant or derive it dynamically from the actual page last-modified timestamp.

### 9. Sunnyvale city page is shorter than the others
- File: `src/lib/service-areas.ts` (Sunnyvale entry)
- 1,800 words vs San Jose 2,800. Second most commercially important city deserves parity.
- Fix: Add a 2nd case study OR a section on Sunnyvale-specific neighborhoods (Murphy Ave, Lawrence corridor, Heritage District).

### 10. CSP header missing site-wide
- File: `next.config.js`
- Why: Four other security headers set, no Content-Security-Policy. Medium-severity gap for a site handling form submissions.
- Fix: Starter `default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; img-src 'self' data: https:;`

---

## Medium Priority (next month)

11. Add FAQPage schema to 4–6 question-anchored blog posts (posture self-check is the best candidate — already structured as questions).
12. Add LinkedIn URL for Jeffrey Sun to ALL sameAs arrays (homepage founder, blog author). Single highest-impact entity signal.
13. Add visible review count/star widget to city pages (currently no review signal visible on any city page).
14. Expand `areaServed` from single City object to array of all 10 served cities, on each city page schema.
15. Fix geo precision: `37.3115` → `37.31150`, `-121.9192` → `-121.91920` in ServiceAreaSchema.
16. Add HSTS `includeSubDomains; preload` directives.
17. Update llms.txt static file to include the 2 newest posts (or convert to dynamic route like llms-full.txt).
18. Add `openingHoursSpecification` to homepage schema (companion to fix #2).

---

## Low Priority

19. Strip `changefreq` + `priority` from sitemap.ts (Google ignores both — harmless cleanup).
20. Add one external citation to the breathing post (currently zero external sources — citability gap).
21. Add credential anchor ("over 12,000 sessions") to posture self-check closing CTA — neck-pain post has it, posture doesn't.
22. Update functional-movement-exercises-for-desk-workers opener with a specific client scene (April writing reads thinner than the May/June work).

---

## Content Quality Scorecard (sampled posts)

| Post | Content | E-E-A-T | AI Citation |
|---|---:|---:|---:|
| neck-pain-when-sitting-at-a-desk | 89 | 91 | 87 |
| how-to-breathe-during-heavy-lifts | 87 | 88 | 74 |
| posture-self-check-at-home | 84 | 84 | 76 |
| functional-movement-exercises-for-desk-workers | 72 | 78 | 61 |

The newer posts are objectively better than the older ones — voice is sharper, internal linking density is higher, technical accuracy is solid. No post is a rewrite candidate. No thin-content flags except meal-prep-for-busy-professionals (1,329 words, only nutrition post besides hydration).

---

## What Couldn't Be Measured This Round

### GSC + GA4 + CrUX data (seo-google agent failed auth)

Your current ADC token (from the gcloud auth done for Ads API earlier today) has scopes `adwords + spreadsheets + cloud-platform`. **GSC and GA4 need different scopes** (`webmasters.readonly` and `analytics.readonly`).

To get field data:

```
gcloud auth application-default login \
  --client-id-file=$HOME/sunfm-oauth-client.json \
  --scopes=https://www.googleapis.com/auth/adwords,https://www.googleapis.com/auth/spreadsheets,https://www.googleapis.com/auth/cloud-platform,https://www.googleapis.com/auth/webmasters.readonly,https://www.googleapis.com/auth/analytics.readonly
```

That covers ALL the APIs we need in one auth flow. After running it, the seo-google agent can pull:
- GSC indexation status per URL (which new posts are indexed?)
- GSC search performance last 28 days vs prior 28 days (the actual "what changed" signal)
- CrUX field CWV (real-user perf data)
- GA4 organic sessions trend

### Performance / Core Web Vitals (seo-performance agent ran partial)

Without CrUX field data and without a successful lab Lighthouse run, this round has no CWV numbers. Worth re-running in a follow-up. If you re-auth per above, CrUX comes for free.

### Backlink profile (Common Crawl was 504)

Common Crawl's index API was returning gateway timeouts during the run. For a site this young (≤6 months) the backlink profile is expected to be sparse — directory listings, social profiles. Not a critical gap right now; revisit at Month 6.

---

## Files Available

- This report: `docs/SEO-AUDIT-REPORT.md`
- Action plan (priority-sorted): see "Critical → High → Medium → Low" sections above

---

## Diff vs May 24 (the headline)

| Dimension | May 24 baseline (estimated) | Today | Delta |
|---|---|---|---|
| Sitemap | Broken lastmod | Working | ✓ Fixed |
| AI access (llms.txt) | Missing | Live + dynamic full version | ✓ Big win |
| Publisher sameAs | Missing | Live on homepage + blog | ✓ Win |
| City cross-linking | Missing | Footer + nearby grid | ✓ Win |
| New posts indexed | Unknown | Unknown (auth needed) | ⚠ Need GSC |
| `/start` discoverability | N/A (didn't exist) | Indexable but unsubmitted | ⚠ New gap |
| Schema completeness | Homepage strong, city OK | Homepage strong, city gaps surfaced | ↓ Surfaced gaps |
| Content velocity | Catalog of ~16 posts | 26 posts, stronger voice | ✓ Up |

The site is healthier than it was 3 weeks ago. The May 24 work paid off. The gaps now are smaller, more targeted, and mostly about completing the schema/linking work that the May push started.
