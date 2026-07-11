# Sun FM — SEO Health Audit

**Audit date:** 2026-07-11
**Site:** https://www.sunfm.fitness
**Compared against:** 2026-06-13 audit (docs/SEO-AUDIT-REPORT.md, superseded by this version — ~4 weeks prior)

---

## Health Score

```
Overall SEO Health Score: 78/100 (Grade B) — flat vs June 13, but the composition shifted

Technical SEO:     88/100  ████████░░  (22%)  ▲ +4
Content Quality:   84/100  ████████░░  (23%)  ▼ -1 (in line, citation gap opened)
On-Page / Local:   65/100  ██████░░░░  (20%)  ▼ -7 (NAP/schema-type issues newly surfaced)
Schema:            75/100  ███████░░░  (10%)  ▼ -5 (one real validation error found)
Performance:       N/A     ──────────  (10%)  ⚠ Still not measured — 2nd audit in a row
AI Search (GEO):   78/100  ████████░░  (10%)  ▲ +11 (llms-full.txt paying off)
Images:            N/A     ──────────  (5%)   ⚠ Still not measured
```

**One-line takeaway:** the June 13 fixes held — technical debt is genuinely down and AI-search readiness jumped 11 points. But this round surfaced a real local-SEO integrity problem that predates both audits: the homepage and the 10 city pages disagree with each other on the studio's exact coordinates, legal/display name, and price tier, all inside structured data Google reads for local-pack ranking. That's the headline finding, not a regression, a gap that was there all along and just hadn't been checked before.

---

## What's Changed Since 2026-06-13

### Confirmed fixed and holding

| June 13 item | Status |
|---|---|
| `openingHoursSpecification` (homepage + city pages) | Live, valid |
| `aggregateRating` on city pages | Live, valid (reviewCount 107 — your deliberate value, unchanged) |
| `/team` Person schema (Jeffrey + Crystal) | Live, valid |
| Blog `Article` → `BlogPosting` | Live |
| Author `sameAs` (Instagram) | Live, though narrower than homepage's set (see #12 below) |
| CSP + upgraded HSTS headers | Live: `max-age=63072000; includeSubDomains; preload` |
| `/privacy` noindex | Correct, `noindex, follow` |
| Inline city-page links from top posts | Live on 4-5 posts as planned |
| Sunnyvale/San Jose content parity | Gap narrowed from ~1,000 words to ~150 words. No longer worth flagging. |
| Posture self-check FAQ + credential anchor | Live |

### Walked back — not actually a bug

**`/start` missing from sitemap.ts** was flagged Critical #1 last time. On closer check, `/start` is intentionally `noindex, nofollow` (it's a PPC-only landing page with no internal links pointing to it). Leaving it out of the sitemap is correct behavior, not a gap. Closing this one.

### Recurred — same issue, came back

- **`public/llms.txt` drift.** Fixed June 13 (was missing 6 posts), now missing 7 again (25 of 32 posts listed). This is the second time this has happened, which means it's a process gap, not a one-off. It needs to stop being a manual step.
- **`HOMEPAGE_LAST_MODIFIED` staleness.** Bumped to `2026-05-25` on June 13, but `src/app/page.tsx` was edited in that same commit (added `openingHoursSpecification`). The constant should have been bumped to `2026-06-13` and wasn't.

---

## New Critical Findings (fix this week)

### 1. Homepage and city pages disagree on the studio's GPS coordinates
- **Files:** `src/app/page.tsx:43-44` (`37.3175, -121.9108`) vs `src/components/service-area/ServiceAreaSchema.tsx:26-27` (`37.31150, -121.91920`), used identically across all 10 city pages
- **Why it matters:** these are two different points roughly 700m apart for the *same physical address*. Google cross-references geo data across your schema, GBP listing, and citations for local-pack ranking. A silent mismatch like this is exactly the kind of thing that suppresses local-pack visibility without ever showing up as an error anywhere.
- **Fix:** pick whichever coordinate actually matches your GBP listing (city-page value looks more precise — 5 decimal places vs homepage's 4) and make the homepage match it.

### 2. Business name is inconsistent across 10+ schema blocks
- **Files:** `src/app/page.tsx`, `src/components/Footer.tsx`, `/team`, `/privacy` all say **"Sun Functional Movement"** (alternateName "SunFM"). Every one of the 10 city pages instead declares `name: "SunFM — Personal Trainer in {City}"` in `src/components/service-area/ServiceAreaSchema.tsx:11`.
- **Why it matters:** that's 10 different literal entity-name strings for one location. NAP (Name/Address/Phone) consistency is one of the more load-bearing local-ranking signals, and city pages inventing a per-page business name is the classic pattern Google's local algorithm is built to distrust (it looks like manufactured location pages even when the underlying business is completely real).
- **Fix:** city pages should use the same `name` as everywhere else ("Sun Functional Movement"), with the city context carried in the page title/H1/description instead of the schema `name` field.

### 3. Homepage LocalBusiness `@type` is not a valid schema.org type
- **File:** `src/app/page.tsx:16` — `"@type": "PersonalTrainer"` does not exist in schema.org's vocabulary (confirmed: `schema.org/PersonalTrainer` 404s, `schema.org/ExerciseGym` resolves).
- **Fix:** change to `"ExerciseGym"`. This is also the type to standardize on for the city pages (see High #4).

---

## High Priority (this week — all mechanical, low-risk)

### 4. City pages use a different (also non-ideal) LocalBusiness type
- **File:** `src/components/service-area/ServiceAreaSchema.tsx:9` uses `"HealthAndBeautyBusiness"`, which is schema.org's salon/spa vertical, not fitness.
- **Fix:** unify with the homepage fix above — `"ExerciseGym"` everywhere.

### 5. `priceRange` mismatch: `$$` on homepage vs `$$$` on all 10 city pages
- **Files:** `src/app/page.tsx:64` vs `src/components/service-area/ServiceAreaSchema.tsx:15`
- **Fix:** pick one value that reflects actual pricing and apply it everywhere.

### 6. `areaServed` mismatch: homepage lists 6 cities, city pages list all 10
- **Files:** `src/app/page.tsx:56-62` (missing Los Gatos, Saratoga, Los Altos, Milpitas) vs `ServiceAreaSchema.tsx:43-53` (has all 10, including Campbell)
- **Fix:** expand the homepage array to match. Two-minute fix, meaningful consistency win.

### 7. `public/llms.txt` needs to stop being manually maintained
- **Fix:** either regenerate it from the same `getAllPosts()` source `llms-full.txt`'s route already uses, or delete the static file and let `robots.ts` / the site's own links point crawlers straight at the dynamic `llms-full.txt` route. Given it's drifted twice now, automate it rather than fix it a third time.

### 8. `HOMEPAGE_LAST_MODIFIED` in `src/app/sitemap.ts` is stale again
- **Fix:** bump to today's date whenever `src/app/page.tsx` actually changes, or derive it programmatically instead of hardcoding.

### 9. ✓ Done — 6 posts with uncited numeric/clinical claims now cite a real source
- **Posts fixed:** `personal-trainer-for-injury-recovery-bridge-from-physical-therapy` (reinjury rates after rushed vs. graded return to training), `shoulder-impingement-for-desk-workers-self-check` (painful arc test reliability), `how-long-to-see-results-strength-training-after-40` (neural adaptation vs. hypertrophy timeline), `frozen-shoulder-vs-shoulder-impingement-self-check` (diabetes/frozen-shoulder prevalence — the "5x more common" claim now backed by the actual meta-analysis it came from), `resistance-band-routine-desk-workers-no-equipment` (elastic vs. conventional resistance training outcomes), `protein-intake-for-muscle-after-40` (protein requirements for older adults, with a note on why this post's target runs a bit higher than the general geriatric recommendation)
- Every link was fetched and confirmed to return HTTP 200 before insertion, all PMC/PubMed.

---

## Medium Priority (this month)

10. ✓ Done — `resistance-band-routine-desk-workers-no-equipment.mdx` FAQ frontmatter added (part of the initial quick-wins pass).
11. ✓ Done — VideoObject schema added for all 75 YouTube embeds across 15 posts, generated straight from the MDX source. **Caveat:** Google requires `uploadDate` for full video rich-result eligibility, and there's no reliable way to get accurate upload dates for third-party YouTube videos without the YouTube Data API (which isn't configured). I left `uploadDate` out rather than fabricate it — the schema is valid and helps AI/general structured understanding, but may not qualify for Google's video rich results until that field is added with real data.
12. ✓ Done — author `Person` schema now includes Instagram + Yelp + Google Maps, matching the homepage.
13. **Only 1 of 32 posts sets an `updated` frontmatter date.** Still open — didn't batch-stamp this since fabricating "updated" dates on posts that weren't actually revised would be its own integrity problem. Add it going forward whenever a post gets a genuine substantive edit.
14. ✓ Done — the three shoulder posts (mobility test, impingement, frozen shoulder) are now cross-linked in both directions.
15. **Bare-HTTP redirect chain** — still open, needs a DNS/hosting-provider change outside the repo.
16. **LinkedIn `sameAs` still missing everywhere** — still blocked, no URL found in the repo to add.

---

## Low Priority

17. ✓ Done — IndexNow key file live at the site root, `scripts/indexnow-ping.py` added for one-off or full-sitemap submission, and wired into the `/new-blog` skill so future posts get pinged automatically after publish.
18. ✓ Done — `BreadcrumbList` added to `/blog`; the shared `Breadcrumbs` component (used by category pages) now includes a "Home" crumb it was previously missing.
19. Campbell city page still the thinnest of the 10 at ~663 words. Not urgent, just the one to grow next if adding city-page content.

---

## AI Search Readiness — the real win this round

Scored 67/100 on June 13, now **78/100**. This is the one category where the May/June investment clearly paid off:

- `llms-full.txt` is live, dynamic, and confirmed to include all 32 current posts (fetched live to verify, not just checked the code).
- No AI crawlers are blocked in `robots.txt` — GPTBot, ClaudeBot, PerplexityBot, Google-Extended, and CCBot all pass.
- The newest posts (protein, SI joint) have strong, self-contained, quotable passages with specific attributed numbers, exactly the shape AI answer engines lift from.
- NAP (address, phone) is consistent everywhere it's checked outside of the geo-coordinate issue above.

The remaining drag is almost entirely the `llms.txt` drift (#7 above) and the missing `updated` frontmatter dates (#13). Both are cheap fixes that would likely push this into the mid-80s.

---

## What Couldn't Be Measured This Round

**GSC / GA4 / CrUX field data:** same gap as June 13. The ADC token needs re-authentication (`gcloud auth application-default login --client-id-file=$HOME/sunfm-oauth-client.json --scopes=...`, full command in project memory) before indexation status, search performance deltas, or real-user Core Web Vitals can be pulled. This is the second audit in a row without this data — worth doing once, since the token keeps expiring between sessions anyway.

**Performance (Core Web Vitals) and Images:** not measured this round either. Two audits in a row without numbers here is the biggest blind spot in this report. Worth a dedicated pass next time rather than folding it into a broader audit.

**Backlink profile:** skipped this round. Site is still young; low expected value per the June 13 note to revisit at month 6.

---

## Quick Wins — Implemented 2026-07-11

All 9 in-repo items were implemented same-day as this audit and verified live on the dev server (tsc clean, schema fields confirmed in rendered HTML, llms.txt confirmed serving all 32 posts):

| # | Fix | File(s) | Status |
|---|---|---|---|
| 1 | Fix homepage `@type` → `ExerciseGym` | `src/app/page.tsx` | ✓ Done |
| 2 | Fix city-page `@type` → `ExerciseGym` | `ServiceAreaSchema.tsx` | ✓ Done |
| 3 | Align homepage geo coordinates to the city-page value | `src/app/page.tsx` | ✓ Done (37.3115, -121.9192 everywhere) |
| 4 | Fix city-page schema `name` to match the real business name | `ServiceAreaSchema.tsx` | ✓ Done ("Sun Functional Movement" everywhere, city context stays in description/title) |
| 5 | Align `priceRange` (picked `$$`, the homepage's existing value) | both files | ✓ Done — **flagging for your review**: I defaulted to `$$` since that was already the more prominent page's value, not because I know your actual pricing tier. Correct me if `$$$` is more accurate. |
| 6 | Expand homepage `areaServed` to all 10 cities | `src/app/page.tsx` | ✓ Done |
| 7 | Bump `HOMEPAGE_LAST_MODIFIED` + `SERVICE_AREAS_LAST_MODIFIED` to today | `src/app/sitemap.ts` | ✓ Done |
| 8 | Convert `llms.txt` from a static file to a dynamic route sourced from `getAllPosts()` | New `src/app/llms.txt/route.ts`, deleted `public/llms.txt` | ✓ Done — this closes the drift permanently instead of re-fixing it a third time next month |
| 9 | Add FAQ frontmatter to the resistance-band post | `resistance-band-routine-desk-workers-no-equipment.mdx` | ✓ Done, 4 Q&As, FAQPage schema confirmed rendering |
| 10 | Collapse the bare-HTTP redirect chain | DNS/host config | Not done — outside the repo, needs a hosting/DNS console change |

Items 1-9 are reversible with `git revert`. Item 10 is still open.
