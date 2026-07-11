---
description: Research, draft, humanize, and save a new SunFM blog post as MDX
---

# /new-blog

Use this command to research and write a new blog post for sunfm.fitness. Posts live as MDX files in `src/content/blog/<category>/<slug>.mdx` and are rendered at `/<category>/<slug>` via the `[category]/[slug]/page.tsx` route.

Categories (already in use): `training`, `nutrition`, `wellness`.

## What to do if the user gives you a topic

If the user hands you a specific topic or keyword ("write about sleep for muscle recovery"), skip research and jump to Step 2, but still do the SERP reconnaissance in Step 2 so the outline beats what's ranking.

If the user gives you no topic ("pick the best next post"), run the full research flow from Step 1.

---

## Step 1 — Research the best next topic

Goal: pick a topic with real search intent that complements existing content and converts into the Movement Screen tool or the consultation.

### 1a. Audit what's already published

Launch an Explore subagent and ask it to:
- Read every MDX file under `src/content/blog/`
- For each, note: title, target keywords (from frontmatter + headings), primary angle, rough word count, internal linking patterns
- Identify topic gaps — areas the business's positioning (mobility, strength for longevity, desk workers 30+, Bay Area) could cover but hasn't
- Note the frontmatter format for new posts

Keep the audit under 400 words.

### 1b. SEO keyword + SERP research

Launch a general-purpose subagent with WebSearch access. Give it:
- Business positioning (San Jose personal trainer, mobility focus, Movement Screen tool at `/tools/movement-screen` is the primary conversion asset)
- The gap list from 1a
- 6–10 candidate topics to evaluate

Tell it to WebSearch each candidate and report:
- The actual top-ranking URLs
- Quality of ranking content (weak = opportunity, strong = skip)
- Search intent (informational/commercial)
- PAA / related questions if visible
- Recommend ONE topic with: title, primary keyword, 2–3 secondary keywords, why it wins on volume + competition + commercial fit + Movement Screen synergy, a 6–8 H2 outline that would genuinely outrank the current results, and internal linking plan

Evaluation criteria for the winner:
1. Search intent naturally funnels into personal training OR the Movement Screen tool
2. Current top results are weak (listicles, no scoring, no follow-up program, outdated)
3. Doesn't overlap existing posts
4. Reinforces mobility / movement / strength-for-longevity positioning
5. National reach fine; Bay Area / San Jose angle if it fits naturally

Bias toward topics where the Movement Screen is a perfect next step — e.g. anything shaped like "test your X at home" or "how to tell if your X is tight."

### 1c. Confirm with user

Present the recommended topic (title + primary keyword + why it wins + rough outline). If the user wants a different angle, iterate. Don't draft until they sign off.

---

## Step 2 — Draft the post

Match the voice of existing posts. Read `src/content/blog/training/functional-movement-exercises-for-desk-workers.mdx` as the canonical voice reference before drafting.

### Voice rules (Jeffrey Sun)

- First person, conversational, plainspoken
- Anchors in real practice: "I've trained hundreds of desk workers in San Jose", specific client anecdotes (no names), specific numbers (12,000 sessions, "two or three weeks")
- Short paragraphs (2–4 sentences)
- Specific concrete details over vague claims ("2 PM backache" not "chronic discomfort")
- Opinionated, not neutral — takes positions like "five minutes of stretching isn't going to undo this"
- **Movement-positive, not prescriptive.** Avoid framing one method, frequency, or approach as objectively better than another. Different choices fit different lives — busy professionals, retirees, hobbyists, athletes — and the post should make that visible. Specific phrasings to avoid: "X is rarely worth it," "X isn't coming back," "X is wrong," "the right answer is always Y," "the intuition is wrong." Use context-dependent framings instead: "X works well for people with Y; for people with Z, the trade-offs change." When you must compare options, frame the comparison around the reader's context, not the option's intrinsic value.
- Don't fabricate client percentages — never write "99 percent of my clients" or similar. Use plain "very few," "most," or specific known counts (12,000 sessions, 107 clients) only when grounded.
- No AI tells: no "it's worth noting", "in conclusion", "game-changer", "elevate", "navigate", "robust", "leverage", "delve", "tapestry", "landscape" (figurative), "unlock"
- Minimal em dashes — prefer commas or periods
- Vary sentence rhythm: mix short punchy with longer flowing
- No Rule-of-Three lists when a pair or a single item would do
- No "not X, but Y" negative parallelism unless it's doing real work
- No "-ing tail" phrases ("highlighting its role...", "reflecting the community's...")

### Frontmatter

```yaml
---
title: "Concrete Title With Target Keyword"
description: "1–2 sentence hook that includes a secondary keyword and ends with Bay Area / San Jose credibility when it fits naturally."
category: "training" # or nutrition, wellness
date: "YYYY-MM-DD" # today
author: "Jeffrey Sun"
image: "/images/blog/<filename>.jpg"
tags: ["primary keyword", "secondary keyword", "desk workers", "San Jose", "mobility", "..."] # 5–7 tags
---
```

### Structure

- 1,800–2,500 words typically. Go longer only if the topic demands it.
- Opening hook: a specific problem, not a generic preamble. Don't signpost ("in this post we will...").
- 6–8 H2 sections matching the outline from Step 1. Use sentence case, not title case.
- H3s only when genuinely needed inside an H2.
- Bold inline labels (**Pass**:, **Fail**:) are fine when they carry information. Avoid decorative bolding.
- Close with a section that nudges toward the Movement Screen tool AND the consultation, without it reading like an ad.

### Image embedding

Check `public/images/blog/` for the current stock inventory (run `ls public/images/blog/`). Filenames give you a hint, but they can lie or be too generic — `stretching-mobility.jpg` is a yoga lunge backbend at sunset, not a generic fitness shot. Before reusing any on-disk image as a hero or inline, **always Read the file with the Read tool and visually confirm the actual subject** matches the section you'd embed it in. Trusting prior alt text or filename alone is how off-topic images sneak in.

Rules:
- Use one image as the `image:` frontmatter field (the hero, rendered by the post page)
- Embed 1–2 additional images inline with `![alt](/images/blog/filename.jpg)` at natural section breaks
- Alt text should be specific and descriptive — describe what the image actually shows, not what the post is about (so the alt stays accurate even if the surrounding text changes)

**Subject relevance is a hard requirement.** Each image — hero or inline — must depict either the exact topic of the surrounding section, or a closely related movement pattern. A side plank section gets a side plank, plank, or bird dog photo. A core stability section never gets a hip flexor stretch image just because both involve a yoga mat. If you can't articulate in one sentence why this image matches THIS section, source a different one rather than settling. The fix is cheap: Pexels/Pixabay/Unsplash are right there.

**Avoid recycling the same "fitness vibes" photo across multiple posts.** Generic shots get reused too easily and dilute visual variety. If you're considering an image that's already been used in 2+ posts, source a fresh one instead.

Per memory, never ask the user to source images. If no existing stock photo fits, pull one from Unsplash, Pexels, or Pixabay using the workflows below.

**Pick a source by rotating** — don't default to Unsplash every time. Variety across posts matters. Look at the existing inventory in `public/images/blog/` and consciously pick a different source than the most recent few hero images. Roughly: Unsplash for clean studio/lifestyle shots, Pexels for gym/fitness scenes, Pixabay for broader generic stock when the first two come up empty.

#### Source 1: Unsplash (no auth required)

Unsplash.com has Anubis proof-of-work bot protection, so WebFetch and direct HTML scrapes return 401. But the `/download?force=true` endpoint still returns a 302 redirect to the CDN URL, and the CDN (`images.unsplash.com`) is not bot-protected. That's the gap.

1. **Find a photo page URL** via WebSearch: `site:unsplash.com/photos <your topic keywords>`. URLs look like `https://unsplash.com/photos/<slug>-<shortId>` (the 11-char short ID is the last segment, e.g., `sVH7i5A4Wh8`). Collect 3–5 candidates.

2. **Check which resolve** (some return 403):
   ```bash
   for id in "id1" "id2" "id3"; do
     curl -sI -A "Mozilla/5.0" "https://unsplash.com/photos/$id/download?force=true" | grep -iE "^location|^HTTP"
   done
   ```
   Pick the first one that returns `HTTP/2 302` with a `location:` pointing at `images.unsplash.com/photo-...`.

3. **Download** to a descriptive filename:
   ```bash
   curl -sL -A "Mozilla/5.0" \
     "https://unsplash.com/photos/<shortId>/download?force=true&w=1600" \
     -o public/images/blog/<descriptive-slug>.jpg
   ```

4. **Verify the image** by reading the file path with the Read tool — confirm the subject matter visually before committing to it.

#### Source 2: Pexels (no auth required)

Pexels HTML pages are bot-protected (Cloudflare 403), but the CDN at `images.pexels.com` is open and serves predictable URLs built from the photo ID alone. No download endpoint roundtrip needed.

1. **Find a photo page URL** via WebSearch: `site:pexels.com <your topic keywords>` (or `site:pexels.com/photo` for direct photo pages, though search-result pages are also fine). The URL looks like `https://www.pexels.com/photo/<slug>-<id>/` — the photo ID is the trailing number before the slash (all digits, e.g., `14074802`). Collect 3–5 candidate IDs.

2. **Build the CDN URL directly** — no resolution check needed, the pattern is deterministic:
   ```
   https://images.pexels.com/photos/<id>/pexels-photo-<id>.jpeg?w=1600
   ```

3. **Download** to a descriptive filename:
   ```bash
   curl -sL -A "Mozilla/5.0" \
     "https://images.pexels.com/photos/<id>/pexels-photo-<id>.jpeg?w=1600" \
     -o public/images/blog/<descriptive-slug>.jpg
   ```

4. **Verify the image** with Read. If subject matter is wrong, try the next candidate ID.

License: Pexels License — free to use, no attribution required, commercial use OK.

#### Source 3: Pixabay (requires free API key)

Pixabay's CDN URLs include date paths and hashes that can't be guessed from a photo ID, so direct CDN scraping doesn't work. The fastest path is the public API, which returns the full CDN URL in a JSON response.

**Setup (one-time)**: Register a free key at https://pixabay.com/api/docs/ (instant, no email verification needed). Set `PIXABAY_API_KEY` in your shell or in a project env file. Free tier is 100 requests / 60 seconds — plenty for finding hero images.

If `PIXABAY_API_KEY` is not set, skip Pixabay and fall back to Unsplash or Pexels. Don't ask the user to set it mid-flow — note it in the completion summary so they can opt in later.

1. **Query the API** with your topic keywords:
   ```bash
   KEY="$PIXABAY_API_KEY"
   curl -s "https://pixabay.com/api/?key=$KEY&q=plank+exercise&image_type=photo&per_page=10&safesearch=true" \
     | python3 -c "import json, sys; d=json.load(sys.stdin); [print(h['id'],'|',h['largeImageURL'],'|',h['tags']) for h in d['hits']]"
   ```

2. **Pick a candidate** by tag relevance from the printed list. The `largeImageURL` field is the direct CDN URL (typically 1280px wide, plenty for hero use).

3. **Download** to a descriptive filename:
   ```bash
   curl -sL -A "Mozilla/5.0" "<largeImageURL>" -o public/images/blog/<descriptive-slug>.jpg
   ```

4. **Verify the image** with Read.

License: Pixabay Content License — free to use, no attribution required, commercial use OK.

#### Fallback rules

If your first source comes up empty, switch sources rather than narrowing the topic — Pexels and Pixabay tag photos differently than Unsplash, so the same query often finds different candidates. If all three turn up nothing usable, fall back to an existing stock photo in `public/images/blog/` and note in the completion summary that the user can swap in a better hero later.

### YouTube embedding

The MDX renderer supports `<YouTube id="..." title="..." />`. Existing posts embed one demonstration video under each H3 exercise section.

Never invent IDs. The workflow is WebSearch → pick candidates → verify via YouTube's oEmbed endpoint before embedding.

1. **Find candidates.** For each drill, WebSearch the exact drill name + "youtube demonstration" or a descriptive variant (e.g., "banded ankle distraction youtube physical therapist"). Extract the `v=<ID>` parameter from each result URL — these are the candidate video IDs. Prefer credible channels (named PTs, rehab clinics, known fitness brands) over aggregator channels. Channels already used on the site and known credible: The Barbell Physio, [P]rehab, Mike Boyle Strength & Conditioning, AskDoctorJo, Dani Winks Flexibility, Pursuit Physical Therapy, Jeff Nippard, Jeremy Ethier, HNL Movement, The Active Life, Hinge Health, Sports Rehab Expert. **Excluded — do not use:** Squat University (Aaron Horschig) and Joel Seedman / Advanced Human Performance. Applies to YouTube embeds AND prose/external-link citations to their domains (squatuniversity.com, advancedhumanperformance.com).

2. **Verify each ID exists** via YouTube's oEmbed endpoint. This also returns the actual title and author, so you can confirm the video matches the drill:
   ```bash
   for id in "id1" "id2" "id3"; do
     http=$(curl -s -o /tmp/oembed.json -w "%{http_code}" "https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=$id&format=json")
     info=$(python3 -c "import json; d=json.load(open('/tmp/oembed.json')); print(d.get('title',''),'|',d.get('author_name',''))" 2>/dev/null)
     echo "$id  [$http]  $info"
   done
   ```
   `200` = video exists and is embeddable. `401`/`404`/`403` = drop the candidate. The returned title should clearly describe the drill; if it's off-topic, skip it even if the ID resolves.

3. **Embed** with a short, descriptive `title=` attribute (the title is the accessibility label, not marketing copy):
   ```mdx
   <YouTube id="ILSbK8RnGdI" title="Banded joint mobilization for stiff ankles" />
   ```

If you can't find a credible, verified video for a specific drill, skip the embed for that drill and note it in the completion summary so the user can add their own later.

---

## Step 3 — Humanize

Invoke the `humanizer` skill on the draft body. Apply fixes directly to the file. Per memory, the user wants /humanizer run on all customer-facing prose before committing.

The humanizer pass should include the final anti-AI audit:
1. Produce draft rewrite
2. Ask "what makes this obviously AI-generated?" and answer honestly
3. Revise once more into final form

---

## Step 4 — Internal linking (conservative)

The user's guidance: "splash one or two every now and then — don't be too crazy."

From the new post OUT:
- Link to `/tools/movement-screen` once, naturally, in a "what to do next" or conversion context
- Link to `/#apply` once in the closing paragraph for 1:1 training
- Link to 1–2 existing posts where context genuinely calls for it (use `[text](/training/<slug>)` etc.)

Into the new post (update existing posts):
- Pick the single most relevant existing post where a reader would genuinely benefit from the new post
- Add ONE inline link, in prose, at a natural anchor — not a "related posts" block
- Do not add links to existing posts that are already link-dense
- Do not link from the homepage or the movement-screen tool page — those are self-contained

Run `npx tsc --noEmit` after edits to make sure nothing broke.

---

## Step 5 — Save and report

Write the final MDX to:
```
src/content/blog/<category>/<slug>.mdx
```

Report to the user:
- File path + final URL (`https://www.sunfm.fitness/<category>/<slug>`)
- Word count
- Target primary keyword and why you picked this topic
- Which existing post(s) got a link back to the new one
- Any missing pieces the user needs to fill in (YouTube IDs, new images, etc.)
- Offer to commit and push

Do NOT commit or push unless the user asks. The user will usually want to review first.

### IndexNow ping (after the user confirms push)

Once the post is pushed to production, run `python3 scripts/indexnow-ping.py https://www.sunfm.fitness/<category>/<slug>` to push the new URL to Bing/Yandex/other IndexNow-participating engines immediately instead of waiting for the next scheduled crawl. Skip this if the post hasn't actually been deployed yet — pinging a URL that 404s wastes the submission.

---

## Notes

- The blog route is `/<category>/<slug>`, NOT `/blog/<category>/<slug>`. The `category` in frontmatter must match the directory name.
- Tags are free-form; there's no enumerated list, but reuse tags from existing posts when they apply to keep the taxonomy coherent.
- Existing post slugs are descriptive kebab-case (e.g., `strength-training-for-longevity-beginners-guide-over-30`, not `strength-training`). Match that density — lean toward full descriptive slugs over short ones because they're good for SEO.
- If a topic overlaps an existing post by more than ~30%, push back and suggest a narrower angle instead.
- Per memory: never ask the user to source images — download from Unsplash CDN yourself if needed.
