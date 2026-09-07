# FINAL — the pages that are done

**This file is GENERATED.** It is written from the register in
`scripts/verify-final.mjs`, which is also the acceptance test. Do not edit it by
hand: run `npm run verify:final -- --doc`.

That indirection is the point. A hand-written list of "final pages" goes stale
the first time somebody edits a generator and nothing tells you. Here the list
and the test are the same object, so **the only way this document can be wrong is
if the test is failing** — and the test is what regenerates it.

```bash
npm run verify:final              # rebuild all seven, assert everything
npm run verify:final -- --no-build  # assert the pages as they sit on disk
npm run verify:final -- --doc     # regenerate this file
```

---

## 1. The shape: one index, six situations born out of it

**This is not seven peers.** `/now` is the parent. A reader arrives there, picks
a situation, and lands on its page. Every situation carries a crumb back to the
index and a rail to its five siblings, and the relationship is **asserted in both
directions** — the index must link to all six, and all six must link home. A page
that stops linking home has orphaned itself, and an index that drops a card has
orphaned a page. Neither shows up in a diff, so both are checked.

```
                    /now  ·  intelligence.html
                              │
        ┌─────────┬───────────┼───────────┬─────────┐
       Air     Yamuna       Heat    Forest fire  Forest loss  Climate event
```

## 2. The register

| page | route | bands | money | reading, from its own dataset | state |
|---|---|---|---|---|---|
| `intelligence.html` | `/now` | 3 | — | 107 · 0.3 · 2.43 · 34,562 | pass |
| `situation-air.html` | `/now/air` | 9 | yes | 107 | pass |
| `situation-yamuna.html` | `/now/yamuna` | 10 | yes | 0.3 · 5.0 mg/L | pass |
| `situation-heatwave.html` | `/now/heat` | 8 | — | 48.3 · 1,832 | pass |
| `situation-forest-fire.html` | `/now/forest-fire` | 8 | — | 34,562 | pass |
| `situation-forest-loss.html` | `/now/forest-loss` | 8 | — | 2.43 · 156.41 | pass |
| `situation-climate-event.html` | `/now/climate-event` | 9 | — | 13 · 3,594 | pass |

Every page is a **build artefact**. Editing the HTML is pointless — the change
dies at the next build. Edit the generator.

| page | generator | npm |
|---|---|---|
| `intelligence.html` | `scripts/build-intelligence.mjs` | `npm run build:index` |
| `situation-air.html` | `scripts/build-situation-air.mjs` | `npm run build:situation-air` |
| `situation-yamuna.html` | `scripts/build-situation-yamuna.mjs` | `npm run build:situation-yamuna` |
| `situation-heatwave.html` | `scripts/build-situation-heatwave.mjs` | `npm run build:situation-heatwave` |
| `situation-forest-fire.html` | `scripts/build-situation-forest-fire.mjs` | `npm run build:situation-forest-fire` |
| `situation-forest-loss.html` | `scripts/build-situation-forest-loss.mjs` | `npm run build:situation-forest-loss` |
| `situation-climate-event.html` | `scripts/build-situation-climate-event.mjs` | `npm run build:situation-climate-event` |

## 3. What each one is

- **`intelligence.html`** — The situation index. Six cards, six units, six kinds of limit, and no total.
- **`situation-air.html`** — AQI against CPCB’s own limit of 100, read from CPCB’s published sub-indexes.
- **`situation-yamuna.html`** — Dissolved oxygen at or below the detection limit, against a notified minimum of 5.0 mg/L.
- **`situation-heatwave.html`** — The hottest reading in the archive against IMD’s severe threshold, across 14 stations.
- **`situation-forest-fire.html`** — Area burnt in one season. The one situation with no legal threshold.
- **`situation-forest-loss.html`** — Two official sources pointing opposite ways, published as two.
- **`situation-climate-event.html`** — Days over IMD’s heavy-rain threshold, and the deaths from five named causes.

## 4. What the test asserts, and why each check exists

Every check earned its place by catching something in this build.

| check | why it is here |
|---|---|
| builds | the generator runs and its own five write-gates pass |
| h1 | the page is the page it claims to be |
| bands | a band did not silently vanish or duplicate |
| **reading** | **the page still says what its committed dataset says.** This is the class of bug that had the index showing 412 while the Air page said 387, and the homepage ticker showing 0.0 for a figure CPCB never published |
| states | the four-word vocabulary, and only those four words |
| money | present only on Air and Yamuna, per D-27 |
| headings in gutter | every `.im-head` inside a `.wrap`, or it renders at x=0 (D-23.2) |
| no placeholders | no unexpanded `${...}` reached the HTML — caught six pages carrying a literal `${FAMILY_CSS}` |
| links up to /now | a situation has not orphaned itself |
| links to 5 siblings | the set is navigable without going back up |
| carries its crumb | the page states that it is one of six |
| links down to all 6 | the index has not dropped a child |

**No credentials needed.** Builds read committed JSON; only the fetchers need
keys. This runs in CI.

## 5. Not in the final set

- **`home.html`** — THE HOMEPAGE, and as of AD-28 §7 a BUILD ARTEFACT — `npm run build:hero` emits it from `design/home.html`, which is where the hand-maintained source now lives and where the seven pinned CSS line ranges point. The design is still written by hand; only the shipped copy is generated, with its comments stripped. Edit `design/home.html`, never this file.
- **`about.html`** — FINISHED, and not a prototype — AD-21 built it and it serves at /about. It is outside THIS test because the twelve checks above are situation-specific (crumb, five siblings, the four-word state vocabulary); none of them describe an About page. Its own gates live in scripts/build-about-page.mjs.
- **`impact.html`** — FINISHED (AD-22), serving at /impact. Outside this test for the same reason as about.html — and worth naming, because it is the page that refuses the number it is named for, so a "reading" check would assert the opposite of its design.
- **`farm.html`** — FINISHED (AD-24), serving at /farm. Outside this test for the same reason as about.html.
- **`act.html`** — FINISHED (AD-25), serving at /act. Outside this test for the same reason as about.html.
- **`stories/`** — FINISHED — five essay pages from scripts/build-essays.mjs, one per bylined piece recovered from the legacy blog, serving at /stories/<slug>. Outside this test for the same reason as about.html. Their own gates live in that generator; the load-bearing ones are the word-count check that fails if the Brizy extraction silently drops prose, and the provenance check that refuses an essay without a byline, a date and a link to where it first appeared — which is what replaced the source requirement after the owner ruled on 22 August that unsourced data is allowed off the situation pages.
- **`air-india.html`** — FINISHED (AD-43), serving at /now/air/india — every city in data/air-india.json, which is what the "All 268 cities" link on /now/air had been promising while pointing at an anchor on its own page. Outside THIS test because the twelve checks above are situation-specific (the fam-crumb’s "N of 6 situations", the five-sibling rail, the four-word state vocabulary) and this is a child of a situation, not a seventh one. Its own gates live in scripts/build-air-india.mjs; the load-bearing ones are that every city in the dataset reaches the page as a row, that the count of rows marked above the limit equals the dataset’s own above_limit, and that no row is born hidden — the table has to read complete with JavaScript off, because the filter is the only thing the script provides.
- **`search.html`** — FINISHED, serving at /search. Outside this test for the same reason as about.html — the twelve checks above are situation-specific. Its own gates live in scripts/build-search-page.mjs; the load-bearing ones assert that every built page on disk is in the index, that all 29 rows render server-side so the page reads without JavaScript, and that it does not index itself.
- **`stories.html`** — FINISHED (AD-26), serving at /stories. Outside this test for the same reason as about.html — the twelve checks above are situation-specific. Its own gates live in scripts/build-stories-page.mjs, including the two that matter: every YouTube id resolves against data/media/youtube-index.json, and the page may not claim six films when two of R-3's six have no source on the channel.
- **`posters.html`** — FINISHED (AD-42), serving at /posters. Ten GIZ marine-plastic sheets as artefacts; the campaign that made them is at /work/campaigns/no-plastic, which shows the same set as its argument. Its own gates live in scripts/build-posters-page.mjs; the load-bearing ones are that no poster may sit in an .ht box or carry .duo (either would crop or duotone an A3 infographic), and that GIZ and the German federal environment ministry are named ONLY inside the credit quoted off the artwork.
- **`publications.html`** — FINISHED (AD-26), serving at /publications. Its own gates live in scripts/build-publications-page.mjs; the load-bearing one reads every linked PDF's size off disk rather than trusting a typed figure, and refuses anything large enough to be a print master.
- **`climate-event/`** — ONE PAGE PER PUBLISHED CLIMATE EVENT, from scripts/build-climate-disaster-pages.mjs, serving at /now/climate-event/<slug>. Outside this test because the SET IS NOT FIXED — it is whatever the detector currently has above its publication bar, which on a quiet week is nothing at all and after a regional disaster is one page. A register of fixed filenames is the wrong shape for it. Its gates live in lib/climate-events.mjs and run at build: a figure without a resolvable source, an automated event published on too little corroboration, or a published event with an empty `uncertain` list all fail the build rather than reaching a reader. Routes are derived from the same files by design-routes.ts, so a page cannot be built and left unrouted.
- **`healthy-cities.html`** — FINISHED, serving at /healthy-cities — the hub for Bridge the Gap’s 2025-26 Healthy Cities chapter, funded by the Bupa Foundation and Niva Bupa. Outside THIS test for the same reason as about.html: the twelve checks above are situation-specific (the fam-crumb’s "N of 6 situations", the five-sibling rail, the four-word state vocabulary), and a partner-facing microsite has no feed and therefore no cadence to state — which is itself a ruling on it rather than an omission, because the state mark belongs to a reading against a published legal limit and there is none on a school garden. Its own gates live in scripts/build-healthy-cities.mjs; the load-bearing ones are that the four rail figures’ SUM is computed and asserted absent from the rendered page in every format it could take (a fifth tile that totals the other four is the one number this page may not publish), that every figure rail sits inside a .wk-dark wrapper (the rail’s caption ink is the paper token, so the natural markup ships about 2.7:1 on a dark masthead and nothing but a rendered contrast check sees it), that every quote resolves against the fellow file that holds it rather than being copied onto the hub, and that all ten fellows render as rows linking to their own pages.
- **`healthy-cities/`** — FINISHED — ten fellow pages from scripts/build-healthy-cities.mjs, one per file in data/healthy-cities/fellows/, serving under /healthy-cities/fellows/<slug>. The same generator writes the hub above, deliberately: a fellow’s name, place, project or figure cannot differ between the register row and the page it opens, because both read the same two loaders. Outside THIS test for the reason the hub is — the twelve checks above are situation-specific and a person’s page has no feed and no cadence to state. Each page carries the hub’s own gates plus five that are about a person’s page: that every figure they published reaches it (figureRail takes four and slices the rest in silence, and two fellows publish five), that every quote renders verbatim because the hub POINTS at these quotes by their exact text rather than copying them, that every named hole in the report is stated, that the three fellows whose reports carry no direct speech render a named hole instead of an empty band, and that each page builds its own section index — three of the hub’s five chips name bands that do not exist here, and a borrowed index is a control strip where three of five controls do nothing.
- **`work/`** — FINISHED — 16 pages from scripts/build-work-pages.mjs, merged in PR #5 and serving under /work. It was in progress in a concurrent session when this line first read that way. It carries its own acceptance gate, the LINKS.json manifest, which fails the build on any unlisted or dead href.

## 6. Open items on the finished set

1. **Two markups for one vocabulary.** The five shell-built pages stamp state
   with the `.tag` component in caps (`PERIODIC`); Air predates the shell and
   uses the frozen homepage's `.state` component in title case (`Periodic`).
   Both are legitimate frozen components and both say the right word, so the test
   accepts both — but it is a divergence across siblings, and it should be
   resolved when Air is next touched for its own reasons.
2. **Air still owns the situation CSS.** The shell reads it out of
   `build-situation-air.mjs` as text. The intended end state is that the block
   moves into the shell and Air imports it; prove that migration with a
   byte-identical rebuild.
3. **`situation-soon.html` is dead** and nothing links to it. Safe to delete.
4. **`home.html` is hand-maintained**, which is why its ticker fallback figure
   is typed rather than injected (D-24.5).
