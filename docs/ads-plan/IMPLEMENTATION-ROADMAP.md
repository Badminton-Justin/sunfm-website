# Sun FM — Implementation Roadmap

**Status as of 2026-06-07:** Phase 1 (Foundation) is ~80% complete. Most of today's work was the foundation. Remaining steps are configuration + launch.

---

## Phase 1: Foundation — Weeks 1-2 (mostly DONE)

### ✅ Already Complete (from today's session)
- [x] GA4 installed and firing
- [x] PostHog installed (product analytics, A/B testing, session recording)
- [x] PII masking configured on form inputs
- [x] Conversion events firing (`form_submit_success`, `movement_screen_completed`)
- [x] GBP optimized (description, services, photos, NAP, hours, attributes)
- [x] NAP consistency across GBP, site footer, schema markup, Yelp
- [x] Dedicated PPC landing page built at `/start`
- [x] Short 4-field form on `/start` submitting to same backend
- [x] Leads from `/start` auto-tagged as `google-ads` in Sheets + Kit
- [x] Phone number added to footer + schema
- [x] `/seo-analytics` slash command for weekly SEO data
- [x] `/ads-analytics` slash command scaffolded for Google Ads weekly data
- [x] claude-ads skill installed (`/ads`, `/ads-plan`, `/ads-google`, etc.)
- [x] Strategic plan written (this set of docs)

### 🔲 Remaining Phase 1 Items
- [ ] Apply for Google Ads Developer Token (3-7 day Google approval)
- [ ] Mark `form_submit_success` and `movement_screen_completed` as Key Events in GA4
- [ ] Link Google Ads account to GA4
- [ ] Import `form_submit_success` as Primary Conversion in Google Ads
- [ ] Enable Enhanced Conversions in Google Ads
- [ ] Build PostHog funnels (consultation funnel + Movement Screen funnel)
- [ ] Watch 5-10 session recordings to understand baseline user behavior
- [ ] Set up `/ads-audit` first-run after dev token approved (audit empty account = sanity check)

### Time estimate for remaining
- Configuration tasks: ~1 hour total
- Google Ads dev token: 3-7 days waiting time

---

## Phase 2: Launch — Weeks 3-4

### Week 3: Account Setup
- [ ] Create Google Ads account if not yet (use jeff@sunfm.fitness)
- [ ] Set account-level negative keyword list (from CAMPAIGN-ARCHITECTURE.md)
- [ ] Build Brand Defense campaign + ad groups
- [ ] Build Non-Brand — Location campaign + 6 ad groups
- [ ] Build Non-Brand — Intent campaign + 5 ad groups
- [ ] Write RSAs per CREATIVE-BRIEF.md (1-3 RSAs per ad group)
- [ ] Apply ad extensions (call, location, sitelink, callout, structured snippets, image)
- [ ] Set ad schedule per CAMPAIGN-ARCHITECTURE.md
- [ ] Set geo targeting (radius around studio + cities)
- [ ] Set bid strategy: Maximize Conversions (Months 1-2)
- [ ] Set daily budget: $40/day total split per BUDGET-PLAN.md
- [ ] **Keep campaigns PAUSED** at this stage — final QA before activation

### Week 3 (Mid): Bing + Meta Setup
- [ ] Microsoft Ads: import Google campaigns via the Import tool
- [ ] Verify match types and ad copy after import
- [ ] Adjust budget to $3/day on Bing
- [ ] Meta Ads: create retargeting campaign for past-30-day visitors
- [ ] Build 1-2 image ads with brand colors + testimonial quote

### Week 3 (End): Pre-Launch QA
Run the verification checklist from TRACKING-SETUP.md before activating anything. Key checks:
- [ ] Test form submission lands in all 4 destinations (email, Sheets, Kit, GA4)
- [ ] PostHog session recording captures the test session with masked PII
- [ ] `form_submit_success` event flows to Google Ads as imported conversion
- [ ] Google Ads tag check passes

### Week 4: Soft Launch
- [ ] **Day 1 (Monday):** Activate Brand Defense + Non-Brand Location only ($25/day)
- [ ] **Day 2-3:** Monitor closely. Pause anything broken.
- [ ] **Day 4 (Thursday):** If clean, add Non-Brand Intent ($5/day)
- [ ] **Day 7 (Sunday):** End of week 1 review — record first weekly row in Google Ads sheet via `/ads-analytics`
- [ ] **Day 8 (Monday):** Add Bing + Meta retargeting ($5/day total)
- [ ] **Day 14:** Run `/ads-google` for first deep-dive audit
- [ ] **Day 14:** Review weekly performance, decide on Week 3 budget

---

## Phase 3: Optimize — Weeks 5-8

### Optimization Cadence
- **Daily check (5 min):** Spend pacing, anything broken
- **Weekly review (30 min):** Run `/ads-analytics 2026-MM-DD`, watch 3-5 session recordings on PostHog
- **Bi-weekly audit (1 hour):** Run `/ads-google` deep dive

### Week 5-6: Performance Triage
- [ ] Identify keywords with >$50 spend and 0 conversions → pause
- [ ] Identify ad groups with CTR < 2% → revise ad copy
- [ ] Identify ad groups with conversion rate > 5% → consider Search volume expansion
- [ ] Pull search terms report → add negative keywords for irrelevant queries
- [ ] Pull search terms report → add new positive keywords from converting queries

### Week 7-8: Bid Strategy Evolution
- [ ] Check: do any campaigns have 30+ conversions in last 30 days?
  - [ ] If yes → switch from Maximize Conversions to Target CPA at $100-130
  - [ ] If no → stay on Maximize Conversions, give it more time
- [ ] Adjust ad scheduling bid modifiers based on day-of-week / hour-of-day data
- [ ] Adjust device bids based on actual conversion rate (often: cut tablet harder)
- [ ] Identify worst 2-3 RSA combinations → replace with new headlines from creative bank
- [ ] Plan first A/B test (RSA outcome vs. pain-point opener — see CREATIVE-BRIEF.md)

### End of Phase 3 Decision Gate
At end of week 8, evaluate:
- Is CAC trending down month over month? (Required to scale)
- Is CAC under $150? (Required to scale)
- Is consultation → paid client rate above 30%? (Required to scale)
- Do you have enough team capacity to onboard 2-3 more clients per month?

**If yes to all:** Proceed to Phase 4 scaling.
**If no:** Stay in Phase 3, continue optimization for 4 more weeks.

---

## Phase 4: Scale — Weeks 9-12

### Week 9-10: Vertical Scaling (More $ on what works)
- [ ] Apply 20% Scaling Rule: increase daily budget on Proven campaigns by 20%
- [ ] Wait 5-7 days between increases (auto-bidding re-learning)
- [ ] Total monthly budget target: $1,800-2,200 by end of week 10
- [ ] Maintain 70/20/10 split: 70% Proven Search, 20% Promising (intent/Bing), 10% Testing (Meta)

### Week 11-12: Horizontal Expansion
- [ ] Launch Google Performance Max as Testing campaign (10% of new budget)
  - Goal: leverage Search conversion data for better PMax signals
  - Risk: PMax black-box can waste spend; monitor closely
- [ ] Consider expanding ad scheduling to weekends (was excluded in Phase 1)
- [ ] Consider adding a 4th city radius if Search shows strong demand
- [ ] Build email follow-up sequence in Kit for `consultation_warm` tag (separate workstream)

### End of Phase 4 Decision Gate
At end of week 12, evaluate:
- Is total monthly spend $2,500+? (Required for full scaling)
- Has CAC stabilized under $100? (Indicates mature account)
- Is consultation volume reaching team capacity?

**If at capacity:** Stop scaling spend, focus on increasing average client value (longer retention, premium packages)
**If room to grow:** Continue to Phase 5

---

## Phase 5: Diversification — Months 4-6

### Layer in Meta Cold Prospecting
- Budget: 15-20% of total
- Audience: Lookalikes of `consultation_warm` Kit subscribers
- Creative: testimonial videos (already have 4 — Marshall, Sneha, Cristina, Kanth)
- Landing page: `/start` (same destination)

### Layer in YouTube Demand Gen (if cash-flow positive)
- Budget: 5-10% of total
- Creative: requires new ~30s educational video (Jeff on camera)
- Audience: YouTube viewers in San Jose interested in fitness/wellness
- Defer until creative budget supports a real video shoot

### Layer in Local Service Ads (if eligible)
- Re-check eligibility quarterly at ads.google.com/local-services-ads/
- If/when personal training becomes eligible: shift 30% of Search budget to LSA

---

## Phase 6: Maintenance — Months 7-12

### Monthly Cadence (Permanent)
- Weekly `/ads-analytics` to update tracking sheet
- Bi-weekly `/ads-audit` for ongoing performance review
- Quarterly `/ads-plan` re-run to validate strategy
- Quarterly `/ads-competitor` to monitor competitive landscape

### Seasonal Adjustments (apply each quarter)
- See BUDGET-PLAN.md seasonal adjustments table
- Pre-set budget multipliers a month in advance for January (+30%), May (+15%), September (+20%), December (-30%)

### Continuous Improvement
- A/B tests via PostHog at all times (RSA copy, landing page variants, form length)
- Quarterly bid strategy review (tCPA target downward as account matures)
- Annual full audit + strategic re-plan in December/January

---

## Critical Decision Points

### When to expand to Performance Max
**Triggers:**
- Search account has 30+ conversions in last 30 days
- Search CAC stable for 8+ weeks
- Budget can absorb 10-15% allocation for testing

### When to add Meta cold prospecting
**Triggers:**
- Search reaching impression share ceiling (>80% on top keywords)
- Need higher volume than Search can deliver
- Have 2+ video testimonials ready as creative

### When to apply for LSA
**Triggers:**
- Google opens personal training category for LSA (check quarterly)
- Have 50+ Google Business reviews (Google's threshold for LSA verification)
- Can absorb $25-75 per LSA lead

### When to consider an agency
**Triggers:**
- Total monthly spend exceeds $5,000
- Account has 8+ campaigns to manage
- Jeff's time on ads exceeds 5 hours/week
- Want to add LinkedIn or YouTube which require deeper expertise

---

## Risk Mitigations

### Risk: First week pulls disastrous CAC ($300+)
**Response:** Pause Non-Brand Intent and Bing immediately. Keep Brand + Non-Brand Location running at reduced budget ($20/day total) for 1 more week to gather more data. Run `/ads-google` to identify issues.

### Risk: Conversion tracking fails
**Response:** PostHog will still capture events as a backup. Compare GA4 vs PostHog event counts daily for first 2 weeks. Discrepancy >10% = investigate.

### Risk: Studio capacity becomes the bottleneck
**Response:** Pause non-brand campaigns; keep Brand Defense + Bing only. Re-launch when capacity opens.

### Risk: Competitor starts aggressive bidding on Sun FM brand
**Response:** Activate Brand Defense at higher budget ($15/day temporarily). File complaint with Google if they bid on registered trademark.

---

## Today's Next Actions

1. **Apply for Google Ads Developer Token** at ads.google.com/aw/apicenter (3-7 day Google approval — do this NOW to start the clock)
2. **Mark Key Events in GA4** (`form_submit_success`, `movement_screen_completed`) — 5 min
3. **Schedule 30 minutes next week** to build the Google Ads account structure per CAMPAIGN-ARCHITECTURE.md
4. **Watch 5-10 PostHog session recordings** of organic traffic to understand baseline behavior before paid traffic muddies the data

By end of week 2 from today, you should be ready to soft-launch.
