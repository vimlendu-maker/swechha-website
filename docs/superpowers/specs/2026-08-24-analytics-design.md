# Analytics — design

**Date:** 2026-08-24
**Status:** approved in chat, pending written review
**Revised:** 2026-08-26 — stale file references corrected, §5.4 resolved (see §10)
**Scope owner rulings:** all four questions in play (reach, conversion, search
visibility, publishable reader numbers); Umami over GA4; dashboard at
`analytics.swechha.in`; phased delivery, pageviews first. **GA4 is wanted
eventually as a second system, but deferred until Umami has real traffic to
judge it against (§6, Phase 4).**

---

## 0. The governing constraints

Three properties of this repo decide the whole shape of this design. None of
them is negotiable, and each one has killed an otherwise-reasonable option.

1. **The CSP is an inventory, not a default.** `next.config.ts:87` states, as a
   promise: *"There is no analytics, no tag manager and no CDN script. If one is
   added, it is added here too."* Any tracker that loads from a third-party host
   costs an allow-list entry and breaks that promise.
2. **35 of the servable URLs are not React pages.** They are pre-built static
   HTML under `public/_pages/v3/`, mapped onto canonical routes by a
   `beforeFiles` rewrite. `app/layout.tsx` never executes for them, so anything
   installed there alone would miss almost the entire site.
3. **Published figures are gated against their sources.** `verify-data-fidelity`
   and the per-page source ledgers mean a number on `/impact` has to be
   defensible. A reader count we cannot query, or know to be systematically
   undercounted, cannot be published under that standard.

## 1. The starting position, measured

**The live site carries no analytics of any kind.** Scanned 2026-08-24: no
Google Analytics, no Tag Manager, no Clarity, no Hotjar, no Facebook pixel.

**The old WordPress site carried two, and both are dead.** The 2025-01-12
Wayback snapshot shows two hand-pasted `gtag` snippets — no plugin, no Site Kit:

- `UA-62058753-1`
- `UA-118748317-1`

Both are **Universal Analytics**, and there is **no GA4 property** — zero `G-`
IDs in the snapshot. Universal Analytics stopped processing data on 1 July 2023
and Google began deleting UA data on 1 July 2024. Those tags therefore spent
their final ~18 months calling out to Google on every page load while collecting
nothing, and the history behind them is gone.

**Consequence: there is no analytics asset to inherit.** Collection starts from
zero whatever we choose. This removes the one argument that would have favoured
GA4 — continuity with existing history.

*Unverified from outside:* whether a GA4 property was ever created but never
installed. Worth one look at analytics.google.com under the Google account that
holds the `google-site-verification` TXT record checked by
`scripts/verify-cutover.mjs:50`.

## 2. Why Umami, and where GA4 genuinely wins

GA4 is free and beats Umami on four things we actually asked for: automatic
scroll tracking via Enhanced Measurement, better engagement-time measurement,
demographics (age/sex), and near-zero setup. That is a real list and it is not
dismissed lightly.

It loses on two that outrank them:

- **Retention.** GA4's free tier caps user- and event-scoped data at **14
  months**. A year-on-year reader figure on `/impact` cannot be sourced from data
  Google deletes at 14 months. The workaround, BigQuery export, is more
  infrastructure than self-hosting Umami.
- **Undercount.** GA4 is blocked by uBlock Origin, Brave and Firefox ETP. On a
  privacy-aware environmental audience that plausibly means a 20–40% undercount
  that is *systematically biased*, not merely noisy. Publishing such a number
  under this repo's fidelity standard is not defensible.

Umami Cloud's free tier was also evaluated and rejected: **100K events/month,
1 website, 6-month retention, and no API access**. The missing API alone
disqualifies it — a figure that cannot be queried from CI cannot be gated.
(A widely-cited "1 million events free" figure is wrong; that is the $20/mo Pro
tier.)

**Self-hosted Umami** gives unlimited events, unlimited retention, full API
access, and puts the data in a Postgres we own — free, on infrastructure that
already exists.

**What it does not give: age and sex.** Nothing free and cookieless does. GA4
with Google Signals remains the only route. The owner's ruling is to run GA4 too,
**but not yet** — deferred to Phase 4 with an explicit trigger, rather than
allowed to dictate this architecture.

## 3. Architecture

Two new free services, both in accounts that already exist.

- **Compute:** a fork of `umami-software/umami` deployed as a second Vercel
  project in the existing team (`team_f8cil…`). Umami is itself a Next.js app,
  so it deploys onto this stack with no adaptation.
- **Database:** **its own Neon project**, deliberately *not* the database that
  holds ward and newsletter subscriptions.

### 3.1 Why the database is isolated

Neon's free plan allows 100 projects per organisation, so a second project is
free. It also caps compute at **100 CU-hours per project per month and suspends
compute when that cap is hit**, with scale-to-zero only after 5 idle minutes.

Umami writes on every pageview, so traffic is exactly what burns compute hours —
and traffic growing is the point of the project. If Umami shared the
subscriptions database, exhausting that ceiling would suspend the compute that
newsletter confirmation and ward alert emails depend on. **On its own project,
analytics fails alone.** Storage is a non-issue: 0.5 GB holds years of events.

**The math, so nobody has to redo it.** 100 CU-hours at the 0.25 CU floor is 400
hours of wake time against a 730-hour month. With a 5-minute idle timeout an
isolated visit costs 5 minutes, so the worst case — traffic evenly spread, every
visit alone — is roughly **4,800 visits/month, about 160 a day**. Bursty traffic
is far cheaper: thousands of pageviews clustered into a few hours cost only those
hours. Reality sits between, and drifts toward the worst case exactly as traffic
grows and spreads, which is the point of the project.

**Browsing the dashboard wakes the same database.** Leaving Umami open in a tab
burns the allowance faster than readers do. This is the likeliest way to hit the
cap in month one.

This is the design's principal operational risk and it is monitored, not solved:
see §3.4 and §8.

### 3.2 Environment

Set on the Umami project (values generated per install, never committed):

| Variable | Value | Why |
|---|---|---|
| `DATABASE_URL` | Neon **pooled** connection string | Serverless needs pgbouncer |
| `APP_SECRET` | `openssl rand -hex 32` | Signs auth tokens |
| `TRACKER_SCRIPT_NAME` | `record` | §4 — value is used VERBATIM in v3; it is NOT given a `.js` suffix |
| `COLLECT_API_ENDPOINT` | `/api/ledger` | §4 — `/api/record` COLLIDES with a built-in v3 endpoint; see §4.3 |
| `DISABLE_TELEMETRY` | `1` | No outbound call to Umami |
| `PRIVATE_MODE` | `1` | Disables all external network calls |

`DISABLE_TELEMETRY` and `PRIVATE_MODE` are set because a self-hosted analytics
install that phones home would undercut the entire reason for choosing it.

### 3.3 Dashboard

`analytics.swechha.in`, a CNAME onto the Umami Vercel project. Protected by
Umami's own login; the default password is changed on first boot.

### 3.4 What this actually costs

**Nothing, and it cannot generate a surprise bill.** Verified 2026-08-24.

| Surface | Position | Headroom |
|---|---|---|
| Vercel — second project | $0. Vercel bills per seat, not per project (Hobby allows 200, Pro unlimited) | n/a |
| Vercel — usage | Hobby includes 1M function invocations + 1M edge requests/month; ~1 of each per pageview | ~33,000 pageviews/day before it matters |
| Neon — storage | 0.5 GB/project | Millions of events |
| Neon — compute | **100 CU-hours/project/month — the binding constraint** | See §3.1 |

**The failure mode is suspension, not billing.** Neon's documentation: *"your
compute is suspended until the next billing period or until you upgrade."* So
the risk being managed is **a silent gap in the data**, which for the §6 Phase 3
figures is worse than a charge would be.

**Escalation path if the cap is hit, in cost order:**

1. **Neon Launch** — pay-as-you-go, documented as carrying *no minimum monthly
   fee*, at $0.106/CU-hour. 100 CU-hours of overage ≈ **$10.60/month**. Confirm
   at signup; most people expect a fixed fee here.
2. **Move the database to Supabase free** — 500 MB, **no compute-hour cap**,
   pauses only after a full week of inactivity, which daily traffic never
   triggers. Better-shaped free tier for a steady write workload; costs one
   provider boundary.
3. Umami Cloud Hobby — rejected in §2 (no API), and still rejected here.

**Budget for moving the database, not for a Neon invoice.**

### 3.5 RESOLVED 2026-08-26 — the team is on Hobby (ruling: stay; see §3.6)

The draft flagged this as "worth one look." The answer is **Hobby**, and the
consequence is more serious than this spec anticipated. **It is a whole-site
risk that this analytics work must not front-run.**

Vercel's [fair use guidelines](https://vercel.com/docs/limits/fair-use-guidelines)
state plainly:

> **Hobby teams** are restricted to non-commercial personal use only. All
> commercial usage of the platform requires either a Pro or Enterprise plan.
>
> Commercial usage is defined as any Deployment that is used for the purpose of
> financial gain of **anyone** involved in **any part of the production** of the
> project, **including a paid employee or consultant writing the code**.
>
> […] **Asking for Donations fall under commercial usage.**

swechha.in meets that definition on **two independent prongs**:

1. **The fundraising prong.** `/act` carries fundraising language throughout —
   "give" ×18, "fund" ×19, a `₹500` figure, and "donated". Donation solicitation
   is called out by name in the guidelines. This holds even though ruling G-1
   records that no payment destination is wired yet: the guideline addresses
   *requesting*, not only *processing*.
2. **The paid-labour prong, which is the decisive one.** Any paid employee or
   consultant working on the site makes the deployment commercial *by
   definition*, regardless of what the site asks its readers for. For a
   registered, FCRA-holding organisation with staff, this prong is not arguable.

**The enforcement mechanism is pausing, not billing.** Vercel's KB documents
account and deployment pausing for policy violations. The exposure is therefore
**swechha.in going dark**, not an unexpected invoice.

**This predates and is independent of the analytics work** — but deploying a
*second* project onto the same Hobby team adds usage and a second
organisation-facing surface to the same account. **The owner has weighed this
and ruled to stay on Hobby (§3.6); the risk is accepted, not unresolved.**

### 3.6 The fork this creates

| Option | Cost | Consequence |
|---|---|---|
| **Upgrade to Vercel Pro** | **$20/user/month** | Compliant. Unblocks this spec unchanged, and every Hobby ceiling in §3.4 becomes usage-based rather than a hard pause. Viewer seats are free, so one developer seat may be the whole bill. |
| **Move hosting off Vercel** | $0 | Cloudflare Pages and Netlify free tiers do not carry Vercel's non-commercial restriction. Removes the risk without a subscription, but it is a hosting migration, and it would relocate the proxy design in §4. |
| **Stay on Hobby** | $0 | Not recommended. Accepts an ongoing risk of the production site being paused, and this work would add to the exposure. |

**OWNER RULING, 2026-08-26: stay on Hobby.** The risk in §3.5 was put to the
owner with the guideline text quoted in full and the recommendation to upgrade.
The decision is to remain on the Hobby plan and proceed. **This is a knowingly
accepted risk, not an oversight**, and it is recorded here so that nobody
re-opens it as though it were an unexamined gap.

Consequences that follow from the ruling, and are now design constraints:

1. **Umami deploys as a second project on the same Hobby team**, as §3 describes.
   Splitting projects across separate accounts to spread usage is **explicitly
   forbidden** — *"circumventing or otherwise misusing Vercel's limits or usage
   guidelines is a violation of our fair use guidelines"* — and must not be
   proposed as a workaround.
2. **Hobby ceilings are shared across the whole team, not per project**, and
   exceeding one pauses the feature for 30 days. The three that this work
   consumes:

   | Ceiling | Hobby | What analytics adds |
   |---|---|---|
   | Function invocations | 1M/month | ~1 proxy hop + 1 collect per pageview |
   | Active CPU | **4 CPU-hrs/month** | ~30ms per collect ≈ 400K collects before it binds |
   | Fast data transfer | 100 GB/month | Negligible — the tracker is ~2 KB |

   None binds at this site's current scale. **Neon's 100 CU-hour cap (§3.1)
   remains the tighter constraint**, and it binds first.
3. **The migration path in §3.6 stays documented and stays ready.** If Vercel
   ever acts on the policy, the answer is the Cloudflare Pages / Netlify move,
   already scoped above. Nothing in this design becomes harder to move because
   of it — §4.2 confirms Umami's geolocation does not depend on Vercel headers,
   so the proxy is the only Vercel-shaped piece.

*For the record, the recommendation this ruling overrides:* Pro at $20/user/month
would have made the existing site compliant and lifted every ceiling in the table
above. The stated goal for analytics was "free," and self-hosted Umami delivers
that either way — the $20 would have bought compliance for the site that already
exists, not the analytics.

*Note on the §3.4 figures above:* the Hobby column is now confirmed exact —
1M function invocations, 1M edge requests, 200 projects, 50 domains/project,
**4 CPU-hours Active CPU**, 100 GB fast data transfer. Active CPU is the one
ceiling the draft did not list; at roughly 30ms of CPU per collect request it
allows on the order of 400,000 requests/month, so it is not binding at this
site's scale.

## 4. The proxy, and why the CSP is untouched

Umami serves its tracker under a configurable name and accepts collection at a
configurable path. Setting `TRACKER_SCRIPT_NAME=record` and
`COLLECT_API_ENDPOINT=/api/record`, two entries are added to the existing
`beforeFiles` array in `next.config.ts`:

- `/record` → the Umami deployment at `/record`
- `/api/ledger` → the Umami deployment at **`/api/send`** (note the asymmetry — §4.3)

**Measured on the live instance, 2026-08-26.** Umami v3.3.1 uses
`TRACKER_SCRIPT_NAME` **verbatim** — it does not append `.js`. With the value
`record`, the tracker is served at `/record` (`200`,
`application/javascript`) and `/record.js` is a `404`. `/record` is free on
swechha.in: no app route, no design-route mapping, no built page claims it.

Both the script and the beacon are then **same-origin**. `script-src 'self'` and
`connect-src 'self'` stay exactly as written — no allow-list entry, no
third-party host, no change to the policy at all.

Three reasons for these specific names:

- `/api/ledger` cannot collide with the existing `app/api/{air,ward,newsletter,keystatic}` routes, and `ledger` is already this repo's word — the source ledgers and content ledger.
- Neither name appears on keyword-based blocker lists, so the undercount that
  disqualified GA4 does not reappear here by the back door.
- `record` is the site's own word. The homepage title is *"We keep the record."*

### 4.3 The public path and the upstream path are allowed to differ

**Discovered by measurement, 2026-08-26, after the first end-to-end test failed.**

`/api/record` was the draft's choice for the collector. It is **already a
built-in Umami v3 endpoint** — session recording, which validates a
discriminator of `'record' | 'heatmap'`. Setting `COLLECT_API_ENDPOINT` to it
did not rename the collector; the built-in route won, and every pageview
returned `400 Bad request: Invalid discriminator value` while the dashboard,
the env vars and the proxy all looked perfectly correct. **Nothing would have
been recorded, and nothing would have said so.**

The fix generalises the design rather than just picking another name. Two paths
are now tracked separately:

| | Public (what the browser requests) | Upstream (what Umami serves) |
|---|---|---|
| Tracker | `/record` | `/record` |
| Collector | `/api/ledger` | **`/api/send`** |

- The **public** path is chosen to survive ad blockers. Umami's defaults
  `/script.js` and `/api/send` are on keyword blocker lists, and a systematic
  undercount is what disqualified GA4 in §2.
- The **upstream** path is whatever that Umami build actually serves. It is not
  ours to choose and it has changed between major versions.

Routing `/api/ledger` → `/api/send` keeps the public name blocker-proof while
targeting the endpoint Umami guarantees. `lib/analytics.ts` carries a
regression test asserting `upstreamCollectPath` is `/api/send` and **not**
`/api/record`, because the two names look interchangeable and are not.

**Verified working end to end:** a browser loading a page fires
`POST /api/ledger` against this origin and receives a signed Umami session
token (`websiteId`/`sessionId`/`visitId`) — a real pageview recorded through
the proxy, with no third-party request and no CSP change.

**THE TRACKER IS CACHED FOR 24 HOURS.** Umami serves `/record` with
`cache-control: public, max-age=86400, must-revalidate` plus an ETag, and
Vercel's CDN honours it (`x-vercel-cache: HIT`). Two consequences:

1. `COLLECT_API_ENDPOINT` is compiled INTO the tracker at build time. Changing
   it does not take effect for a returning reader until their cached copy
   revalidates — up to a day. If that variable is ever changed again, the proxy
   must accept **both** the old and new collector paths for at least 24 hours,
   or returning readers silently stop being counted.
2. A Vercel redeploy that reuses the build cache does **not** rebuild the
   tracker. When changing any `TRACKER_*` or `COLLECT_*` variable, redeploy
   with "Use existing Build Cache" **unticked**, then confirm the change landed
   by reading the served script rather than trusting the dashboard:
   `curl -s https://analytics.swechha.in/record | grep -o '/api/[a-z-]*'`

### 4.1 The comment at `next.config.ts:87` must be rewritten

That comment asserts the site has no analytics. It becomes false the day this
ships. It is an inventory, and an inventory that lies is worse than none — so it
is rewritten in the same commit to state what is now present and why it still
requires no allow-list entry. **This is a required deliverable, not a nicety.**

### 4.2 No consent banner

Umami sets no cookies and collects no personally identifiable information, so no
consent banner is required under GDPR, CCPA or the DPDP Act.

**Verified 2026-08-26 — how "region" is obtained, and why it costs nothing.**
Self-hosted Umami resolves location *server-side* against a local MaxMind
GeoLite2 database (`@maxmind/geoip2-node`, downloaded at build; overridable via
`GEO_DATABASE_URL`). Two consequences, both good:

- **It does not depend on the Vercel plan.** Country, region and city work the
  same on Hobby or Pro — no dependence on `x-vercel-ip-*` headers, and no
  exposure if the site later moves off Vercel (§3.6).
- **No IP is ever stored.** Umami's schema has no IP column; only the derived
  location is written. The privacy claim in §7 is therefore structural, not a
  policy promise.

Accuracy, so the §6 Phase 3 figures are not overstated: GeoLite2 country
accuracy exceeds 99% for IPv4, region is reliable, **city is a rough estimate**
and should not be published as precise. This preserves the
site's existing posture of stating its promise inline — the pattern
`situation-shell.mjs` describes for the newsletter field (the `THE PROMISE IS STATED
IN FULL` comment, currently ~:1286) — rather than
burying it in a policy nobody reads.

## 5. Coverage, and the gate that keeps it

### 5.1 Insertion points — there are exactly four

**Cite anchors, not line numbers.** The line numbers in the 2026-08-24 draft of
this table were all stale within two days — `situation-shell.mjs` alone drifted
by ~350 lines. Every reference below names a function or a marker comment, and
gives a line only as a *hint* prefixed `~`.

| Path | Anchor | Covers |
|---|---|---|
| Static | `scripts/lib/situation-shell.mjs` — `export const headTags` (~:2187), invoked from `assemble()` (~:2209) at its call site (~:2368) | The large majority of the 35 pages |
| Static | `scripts/lib/work-shell.mjs` — the `<head>`…`</head>` block in the page template (~:2365–2377) | The WORK pages |
| Static | `scripts/build-situation-air.mjs` — its hand-rolled `<head>`…`</head>` (~:2049–2062); the comment at ~:1987 explains why this page does not go through the shell | `/situation/air` |
| React | `app/layout.tsx` (95 lines) | `/stories`, `/keystatic`, and the remaining React routes |

**Pages built through the shell inherit the tag for free.** The untracked
`scripts/build-air-india.mjs` — which did not exist when this spec was drafted —
calls `S.assemble({…})` (~:442) and therefore needs no separate insertion point.
That is evidence for the shell-based approach, not a fifth site to patch.

`build-about-page.mjs` and `build-work-pages.mjs` mention `<head>` only in
comments and need no change.

### 5.2 The gate

`scripts/verify-seo.mjs` already walks every built page. It gains one assertion:
**every page carries the tracker tag**. A page that does not is a build failure,
not a silent hole — the same discipline the SEO register already enforces, and
the only thing that stops a future page being added without the tag.

### 5.3 The regenerate-and-commit constraint

`.github/workflows/generated-current.yml` regenerates every page on every PR and
`exit 1`s if the working tree moved (`:51`). The built pages are **committed
artefacts**, not build output. Therefore editing the shells and committing the
35 regenerated HTML files must happen in the **same** commit. A shell change
without regenerated pages cannot merge.

### 5.4 Branch coordination

**RESOLVED 2026-08-26 — this constraint no longer applies.** The SEO programme
has landed: `git merge-base --is-ancestor e765d4b HEAD` succeeds, so its commits
are already ancestors of the working branch. `feat/seo-programme` survives only
as `remotes/origin/feat/seo-programme`; there is no local branch and no pending
`headTags()` conflict. Branch this work off `main` as normal.

*Original constraint, retained for the record:* `feat/seo-programme` was 9
commits ahead of `main`, unmerged, and modified `headTags()` in
`situation-shell.mjs` — the same function this work touches.

## 6. Phasing

Delivery is phased so that traffic starts accumulating on day one rather than
after the whole programme is built.

### Phase 1 — collection (this spec's deliverable)

Deploy Umami; wire the proxy; tag all four insertion points; regenerate and
commit the pages; add the `verify-seo.mjs` assertion; rewrite the
`next.config.ts:60` comment; point `analytics.swechha.in`.

Answers immediately: most-viewed pages, entry pages, referrers, UTM
attribution, region and city, device and browser, and visit counts.

**Done when:** a real visit from a phone on mobile data appears in the dashboard,
`npm run verify:seo` fails if the tag is removed from any one page, and the
production CSP header is byte-identical to today's.

### Phase 2 — instrumentation

Custom events, once Phase 1 proves collection works:

- **Scroll milestones** (25/50/75/100) — answers *where do people abandon* on the
  long situation pages. This is the one thing GA4 gives free and we must build.
- **Outbound clicks** on the government source links in the situation ledgers.
- **`/act` asks** — which of the three ways in actually gets used.
- **Newsletter subscribe success**, joined to entry page.
- A **UTM convention** for shared links, documented so it is used consistently.

### Phase 3 — publishable numbers

Umami's API → a script shaped like the existing `scripts/fetch-*.mjs` → JSON
under `data/` → the existing fidelity gate → figures on `/impact`.

**Deliberately last.** Which figures are honest to publish is a question to
settle against real traffic, not against a guess. `data/**` changes already
trigger `content-rebuild.yml`, so no new automation is needed.

### Phase 4 — GA4 alongside, if and only if the numbers justify it

**Ruling, 2026-08-24:** both systems are wanted. GA4 is nevertheless deferred
until Phase 1 has produced real traffic figures, because those figures decide
whether GA4 can deliver the one thing it is being added for.

**The trigger.** Revisit when Umami shows monthly visitors plausibly above
Google's demographic reporting threshold, or when a funder or grant application
actually asks for audience demographics. Not before.

**Why the delay is not foot-dragging.** The only thing GA4 uniquely provides is
age/sex, and the chain that produces it is multiplicative: visitors who accept
the consent banner, times those signed into Google with ads personalisation
enabled, times Google's suppression of demographic rows below a traffic
threshold. On a site collecting from zero as of August 2026, that panel may
simply stay empty — paying the banner, the CSP entries and the double
instrumentation for a box with nothing in it.

**What it will cost when it happens**, so the decision is made with open eyes:

- A **consent banner** across all four insertion points of §5.1. No consent
  infrastructure exists in this repo today, and this would be the site's first
  banner — on a site whose newsletter field deliberately states its promise
  inline rather than in a policy (the `THE PROMISE IS STATED IN FULL` comment in
  `situation-shell.mjs`).
- **Real CSP allow-list entries**: `googletagmanager.com` in `script-src`,
  `google-analytics.com` in `connect-src`. §4.1's comment gets rewritten a second
  time, and its claim that no script loads from a foreign host stops being true.
- **Phase 2 doubles** — every custom event fires into both systems, or conversion
  analysis lives in only one.

**The two systems will disagree, and that is expected.** Umami will report
meaningfully higher pageviews because GA4 is blocked by uBlock, Brave and Firefox
ETP. The rule, fixed now to prevent an argument later:

> **`/impact` publishes the Umami number, always.** GA4 is supplementary; its
> figures inform internal decisions and are never published, precisely because
> the undercount that ruled it out in §2 does not stop being true just because
> GA4 is also installed.

## 7. What this design does not do

- **No age or sex in Phase 1.** Wanted, and deferred to Phase 4 behind a defined
  trigger — not abandoned.
- **No session replay or heatmaps.** Self-hosted Umami does not include them,
  and they are a different privacy proposition that has not been argued for.
- **No consent banner**, because none is required (§4.2).
- **No change to Search Console**, which is free, already verified, and answers
  the search-visibility question without any code.

## 8. Risks

| Risk | Severity | Handling |
|---|---|---|
| **Vercel Hobby forbids commercial use; swechha.in meets their definition on two prongs. Enforcement is pausing — the site goes dark.** | **High — accepted** | **Owner ruling §3.6: stay on Hobby.** Risk pre-exists this work and is knowingly carried. Migration path scoped in §3.6 and kept ready; no part of this design deepens the lock-in. |
| Exceeding a shared Hobby ceiling pauses the feature for 30 days — a data gap | Low | §3.6's table: none binds at current scale; Neon's cap binds first. |
| Neon free tier's 100 CU-hour/month cap suspends the analytics DB — **a data gap, not a bill** | Medium | Isolated project (§3.1) so nothing else fails with it. Worst case ~160 visits/day; dashboard browsing burns the same budget. Watch CU-hours in the Neon console for two months. Escalation path in §3.4. |
| Self-hosting means owning updates | Low | Vercel auto-deploys on push to the fork; syncing the fork is a periodic chore, and a stale Umami still collects. |
| Proxy adds Vercel function invocations on the main project | Low | One rewrite per pageview; well inside the team's allowance. |
| `feat/seo-programme` conflict in `headTags()` | Medium | §5.4 — sequence the branches. |
| A future page ships without the tag | Low | §5.2 — the gate makes it a build failure. |

## 9. Open questions

1. Does a GA4 property already exist, unused, in the Google account holding the
   Search Console verification? (§1) Does not block Phase 1.
0. ~~Is the Vercel team on Hobby or Pro?~~ **Closed 2026-08-26: Hobby, and the
   owner has ruled to stay there (§3.6).** No longer a blocker. Phase 1 may
   proceed; the accepted risk is recorded in §3.5, §3.6 and §8.
2. Which reader figures are honest to publish on `/impact`? Deliberately
   deferred to Phase 3.

---

## 10. Revision log

### 2026-08-26 — re-verification before review

The design's conclusions were re-derived independently and **converged on the
same answer**: self-hosted Umami, its own Neon project, proxied to preserve the
CSP. Umami Cloud's tier was re-checked live at `umami.is/pricing` and §2 is
confirmed accurate — Hobby is 100K events/month, 1 website, 6-month retention,
**no API access**; the widely-cited "1 million events free" belongs to the $20/mo
Pro tier. Umami's own Vercel guide confirms the §4 proxy is an officially
documented feature, not an improvisation.

Nothing in the architecture changed. What changed is that **every file reference
in the draft had gone stale within 48 hours**:

| Reference | Was | Now |
|---|---|---|
| CSP inventory comment | `next.config.ts:60` | `next.config.ts:87`, reworded |
| `headTags()` | `situation-shell.mjs:1841` | ~:2187 |
| `assemble()` | `situation-shell.mjs:1856` | ~:2209 |
| Newsletter promise comment | `situation-shell.mjs:952` | ~:1286 |
| WORK `<head>` | `work-shell.mjs:2325` | ~:2365–2377 |
| Air `<head>` | `build-situation-air.mjs:1959` | ~:2049–2062 |
| §5.4 branch conflict | Blocking | Resolved — SEO programme landed |

§5.1 now cites **function and comment anchors** rather than line numbers,
because line numbers in this repo have a demonstrated shelf life of about two
days.

### Hazard noted during re-verification

`next.config.ts` was observed with **different content at two points within a
single session**, while absent from `git status` — and the `git log` tip moved
between two reads. The repo is being modified by more than one agent
concurrently. Consequences for whoever implements this:

1. **Re-verify every anchor in §5.1 immediately before editing.** Do not trust
   this table; trust `grep`.
2. §5.3's regenerate-and-commit constraint is sharper than it looks under
   concurrent edits — `scripts/lib/situation-shell.mjs` was already dirty in the
   working tree during this review. Start from a clean tree on a fresh branch
   off `main`, or the 35 regenerated pages will carry someone else's work.

### Still open

§9's remaining question — whether an unused GA4 property already exists — stands
and does not block Phase 1.

**The Vercel plan question is closed.** The team is on Hobby; the fair-use
conflict is real and documented in §3.5; the owner's ruling on 2026-08-26 is to
stay on Hobby and proceed (§3.6). It is carried as an accepted risk in §8, with
the migration path scoped and ready. Do not re-open it as an oversight.
