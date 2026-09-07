# Editorial pass: the account of our own plumbing

**Date** 7 September 2026 · **Branch** `edit/plumbing-voice-pass`
**Standard applied** `docs/design/2026-08-23-COPY-STANDARD.md`, rows 139–140
(the two "Removed" rulings on empty-state confessions and on the page narrating
its own construction), read with §5–6 which make that file win on voice.
**Scope** the whole site except `/healthy-cities`, which is being reworked on
`feat/healthy-cities-microsite`. Not one file under `public/_pages/v3/healthy-cities*`
appears in this diff.

---

## What the owner caught, and where it actually was

The band he read — **"WHAT WE CANNOT SAY YET"**, with *"not one of them records
who is speaking"* and *"survive only as broken text encoding"* — is **not in
`main`**. `git log --all -S` puts both strings on
`feat/healthy-cities-microsite`, and `cd6564da` ("a page that describes the
programme, not the paperwork") has already fixed them there. So this pass is
the second half of his instruction: the same voice **everywhere else**.

It was there in quantity. Two of the finds are worse than the band he saw.

---

## The three-way test

Every instance was classified as:

- **(a) KEEP** — a fact about *external* data, or a methodology note that stops
  a real misreading. The copy standard protects both on situation pages.
- **(b) RE-VOICE** — a true fact wearing an auditor's voice. The fact stays;
  the clause about *our* handling comes off. Subtraction only — no replacement
  clause invented, no new heading.
- **(c) DELETE** — our own plumbing. Gone, with nothing put in its place.

**Counts: 14 kept · 15 re-voiced · 6 deleted.**
`hole()` / `.p-hole` instances went 28 → 26; the mechanism is untouched, only
its content was judged.

---

## The two findings worth reading first

### 1. Developer setup instructions were live on `/now/forest-loss`

> **What cannot be computed, and is therefore not published.** *Create a Global
> Forest Watch API key and set `GFW_API_KEY`. One account, free. It was
> deliberately not created during this build.* A single national figure for
> "forest lost to legal diversion" would need the Ministry's own approval data,
> which this build did not obtain.

`data/forest-loss-india.json`'s `sources.c_satellite.how_to_close` — a field
written for whoever next runs the fetcher — was being printed to the public
page. Alongside it, a second paragraph headed **"How source C was obtained,
stated plainly"** explained that we use a web client's proxy rather than the
documented API, that it "can change or close without notice and it is not a
licence", and that "obtaining a key remains the right long-term answer."

Both deleted. The dataset and version citations they claimed to justify are
already carried by the source lines in the same band.

### 2. `/posters` was rendering `[object Object]` twice

`scripts/build-posters-page.mjs:144` does `D.waiting.claims.map((c) => hole(c))`,
but `data/posters.json`'s claims are `{what, unlocks}` objects, not strings — so
the two dotted holes on the live page read literally **`[object Object]`**.

Both claims were plumbing anyway ("almost none of it has been catalogued",
"their reach is not recorded"), so emptying `claims` to `[]` removes the band,
its nav entry *and* the rendering bug in one edit. `LIVE = { waiting:
claims.length > 0 }` already handles the disappearance — this is exactly what
`data/publications.json` did at AD-28 and never got applied to its twin.

---

## Classification table

### (c) DELETED — our own plumbing

| # | Page | The sentence | Where it lived | Why |
|---|---|---|---|---|
| D1 | `/now/air/india` | "A failed fetch leaves the previous hour in place rather than writing a zero, so a stale hour is possible and is printed on the page. The hour above is the only claim about freshness this page makes." | `build-air-india.mjs:276` | Our fetch pipeline's failure mode. The reader has the observation hour two inches above. |
| D2 | `/now/forest-loss` | "**How source C was obtained, stated plainly.** The documented API … requires a key, which this build did not create. This proxy … NOT a documented API contract … Obtaining a key remains the right long-term answer." | `build-situation-forest-loss.mjs:161` (from `data/gfw-india.json`) | Our credentials, our proxy, our roadmap. |
| D3 | `/now/forest-loss` | "**What cannot be computed, and is therefore not published.** Create a Global Forest Watch API key and set `GFW_API_KEY` … not created during this build … which this build did not obtain." | `build-situation-forest-loss.mjs:319` | An env-var instruction on a public page. |
| D4 | `/now/forest-fire` | "So the band is short, and that is the honest version. Naming the hole is content; filling it with a proxy about another continent would not be." | `build-situation-forest-fire.mjs:366` | The page grading its own editorial decision. |
| D5 | `/now/air` | "This page does not yet track those windows for Delhi-NCR. It is named here because it is the highest-leverage thing on the list, not because it is built." | `build-situation-air.mjs:1232` | A roadmap item. The action above it stands on its own. |
| D6 | `/now/climate-event/*` | "**Some of these are named but not linked.** Where a figure came from Swechha's own briefing, the originating publication is named and this site has not opened the primary document — so no link is given and none is invented." | `lib/situation-render.mjs:1081` | Internal verification note. A figure with no link simply has no link. |
| D7–D8 | `/posters` | The two `waiting` claims (rendering as `[object Object]`) + their lead | `data/posters.json` | Our uncatalogued archive, our unrecorded print runs. Band and nav entry now gone. |
| D9 | `/stories` | "Eight of the sixteen do not record which programme carried them. The segment is real and the recording is ours; the attribution is the part we cannot yet make." | `data/stories.json` `news.hole` | Our records. The eight rows still say "Not recorded" — absence shows, it does not explain itself. (The build gate on this is `!D.news.hole || …`, so it passes when the key is absent.) |
| D10 | `/` (homepage hero, fire slide) | "Committed reading." | `design/home.html:3628` | An internal repo reference where the other four slides carry a real observation date. Edited in place — **line count unchanged**, because seven CSS ranges in that file are pinned by absolute line number. |

*(D7/D8 counted as one deletion of a two-instance band in the headline count; the
line-item numbering above is per sentence.)*

### (b) RE-VOICED — the fact kept, the auditor's voice subtracted

| # | Page | Was | Now |
|---|---|---|---|
| R1 | `/now/air/india` | "There is no state figure **here and there will not be one**. CPCB measures cities; averaging…" | "CPCB measures cities, not states. Averaging a state's cities would invent a reading for the land between them, so there is no state figure." |
| R2 | `/now/air` | "These nine figures **were read together, and none of them moves while you are here**… the national table is **a much larger read and runs on its own schedule; it is kept separate so that a slow national fetch can never hold back Delhi's live figure**." | "**One snapshot, one hour.** …one national reading taken at 20:00 IST… and why the order is an hour's reading rather than a standing claim." The two-hour case now reads "two hours, each labelled with its own, and they need not agree." |
| R3 | `/now/air` | DSS "has no public API **and its host was unreachable from the machine that built this page**" | "It has no public API, so it is named and linked rather than restated." |
| R4 | `/now/air` | "…**so this page cannot tell you** what fixing the air would cost… **No inference is drawn beyond the arithmetic.**" | "**nobody has published a costed abatement plan for Delhi-NCR**, so what fixing the air would cost is not a published figure." Source list kept in full. |
| R5 | `/now/air` | "**The alternative was a third-party centroid file of unknown provenance — on this page, of all pages.**" | Removed. India Post's missing lat/long column — the external fact — is untouched. |
| R6 | `/now/air` | "…a gadget on a windowsill, **and it is why this page will not accept a crowd-sourced reading as equivalent**." | Ends at "a gadget on a windowsill." |
| R7 | `/now/climate-event` | "**So this page can tell you** how many people a landslide killed and not how many landslides there were." | "A landslide's death toll is counted. The landslide is not." |
| R8 | `/now/forest-fire` | "…needs an attribution layer **this build does not have**" | "…needs an attribution layer **the dataset does not carry**" |
| R9 | `/now/forest-fire` | "**The other four situations on this site carry an attention series… This one does not, and the reason is worth stating.**" | Leads with the fact: "There is no English Wikipedia article about forest fires in India with enough traffic to plot." |
| R10 | `/now/forest-fire` | Band lead: "The register, and **one measurement this page could not make**." | "The register — what was published about India's forest fires, and by whom." |
| R11 | `/now/forest-loss` | "Diversion approvals … **were not obtained for this build. Until they are, the page states the requirement and not a quantity.**" | "…are not in ISFR. FSI measures the cover; the Ministry keeps the approvals, and the two are not published together." (fixed in `fetch-forest-loss.mjs` **and** the committed JSON, so a refresh cannot reinstate it) |
| R12 | `/now/forest-loss` | "**So this page cannot say** 'the limit was exceeded' — it can only say how much was approved…" ×2 (`why_it_is_not_a_number` and the band's own note) | "There is no exceedance to report — only how much was approved, and that figure is published by the Ministry rather than by FSI." / "What is on the record is how much was approved, by whom, and whether the forest came back." |
| R13 | `/now/yamuna` | "…**is not on this page**. CPCB … publishes the results in a separate annual document **that was not parsed for this build. Until it is, the page can show…**" | "CPCB monitors Delhi's drains, but publishes them in a separate annual document from the river series above… and nobody publishes the two together." |
| R14 | `/now/yamuna` | "**One division this page will not do.**" … "**The national figure is therefore not published here, and this note exists so nobody computes it later by mistake.**" | "**One division the release does not support.**" The numerator/denominator argument — the real content — is kept verbatim. |
| R15 | `/now/yamuna` | "**The page states the money and the reading side by side and draws no line between them.** Completed is not the same word as working, **and this page will not use one to mean the other**." | "**Completed is not the same word as working.** What is on the record is…" |
| R16 | `/now/yamuna` | "The total ever spent … **is not on this page**… **Under this site's rules**… it belongs in the coverage list below, **never in this band. Closing this properly needs the panel report itself, and that is the largest single piece of work still outstanding on this page.**" | "The widely circulated totals … trace to newspapers reporting a parliamentary panel, not to the panel's own report. A figure reported by a newspaper is reporting, not data." |
| R17 | `/now/climate-event/nepal-glof` | Heading: "**Figures deliberately not published here**" | "**Figures in circulation that do not hold up**" — the five corrections under it are strong external-data facts and are untouched. |
| R18 | `/now/climate-event/*` | "No Indian casualty or evacuation figure has been reported **in a form this page can attribute**." | "**No named source** has reported an Indian casualty or evacuation figure." |
| R19 | `/now/climate-event/*` (map fallback, latent) | "**This page holds no coordinate** for the place the reporting names, so no map is drawn." | "**The reporting does not name a place precise enough** to put on a map." |
| R20 | `/stories` | Band lead: "…**Where the recording names the programme it ran on, we name it; where it does not, we have left it blank rather than guess.**" | "Broadcast segments and interviews, as uploaded to our own channel." |

### (a) KEPT — facts about the world, or notes that stop a misreading

These are the ones a reader might expect to be gone and which deliberately are
not. **Bias was towards keeping**: the site's credibility rests on naming real
gaps in official data.

| Page | The keeper | Why |
|---|---|---|
| `/now/air/india` | "These are the cities CPCB measures, not the cities of India… an absent row is an absent instrument — never clean air." | The shape of the national monitoring network. The single most important caveat on the page. |
| `/now/air` | "Four things the study says about itself" (October never monitored, 82–87% mass closure, industry an overestimate) | The study's own limitations, quoted. |
| `/now/air` | "And the categories do not line up" — fuel signature vs sector | Stops a reader averaging two incommensurable studies. |
| `/now/air` | "Both periods are stated because the comparison only holds if they are" | Methodology note; annual vs cumulative is a real trap. |
| `/now/air` | India Post publishes 562 Delhi post offices and no lat/long column | External data gap, and the reason the form asks what it asks. |
| `/now/yamuna` | "Blank cells are blank in the source… left empty rather than carried forward or interpolated" | Hole in CPCB's own series + a no-interpolation note. |
| `/now/yamuna` | "This is deliberately not drawn as a trend line. Two points are not a trend." | Reads as our decision, but it is a statement about what the *data* can support. Kept. |
| `/now/yamuna` | "A quiet month is not a clean month… The current month is incomplete and is excluded." | Methodology; also the band's argument. |
| `/now/forest-fire` | "There is no published count of people displaced, livelihoods lost or livestock killed by forest fire in India." | Textbook external-data gap. |
| `/now/forest-fire` | "A fixed window is a SAMPLE, not a season total… the series never switches processing level." | Detections-≠-fires class of note; explicitly protected. |
| `/now/forest-loss` | "ISFR publishes no national gross gain or gross loss — only a net." | The story of the page. |
| `/now/forest-loss` | "'Forest cover' includes plantations and orchards. There is no natural-forest-only series in the report." | The story of the page. |
| `/now/heatwave` | "Nobody publishes heat-related hospital admissions, lost work or school days missed in India." | External-data gap. Both heatwave holes kept; that page is unchanged. |
| `/now/climate-event` | "There is no national count of landslide EVENTS… NCRB counts deaths by cause." | External-data gap (tail re-voiced, R7). |
| `/search` | "Nothing here matches that word." | A search box's empty state, not an editorial confession. |
| `/now/climate-event/nepal-glof` | ICIMOD's "higher hazard has not yet produced a higher rate of floods" | The source's own caveat. |

---

## Calls for the owner

1. **R17 — the nepal-glof heading.** The five items under it are corrections of
   figures that circulate widely and do not survive checking ("'178 dead at
   South Lhonak' — contradicted by every readable source"). That is content
   about the world and I kept all of it; I only changed the frame from
   *"Figures deliberately not published here"* to *"Figures in circulation that
   do not hold up"*. If you would rather the whole disclosure went, it is one
   `ctx.withheld` array in `data/climate-events/context/glof.json`.
2. **R18 — "No named source has reported…"** The old wording hedged with "in a
   form this page can attribute." Subtracting alone would have asserted more
   than we know, so this is the one place I wrote three words rather than
   deleting some. Say the word if you want it blunter.
3. **Yamuna, kept but arguable.** "This is deliberately not drawn as a trend
   line" reads as our decision even though its substance is about the data. I
   kept it under the bias-to-keep rule. It is a one-line deletion if you disagree.
4. **A separate defect I did not fix.** `/now/yamuna` band 1 reads *"at Okhla
   **okhla**, after the **shahdara** drain"* — `shortName()` in
   `build-situation-yamuna.mjs` mangles `RIVER YAMUNA AT OKHLA AFTER MEETING OF
   SHAHDARA DRAIN` into a duplicated word and two lowercase proper nouns. Real,
   visible, and nothing to do with this pass, so it is left alone and flagged.
5. **Two internal fields left in place**, because they no longer reach any page:
   `data/forest-loss-india.json` `sources.c_satellite.how_to_close` (the
   `GFW_API_KEY` instruction) and the five per-figure `note`s in
   `data/climate-events/context/glof.json` that say "this repository has not read
   the primary document". They are working notes now. If either is ever printed
   again it will read as plumbing, so they are worth rewording at some point.

---

## Verification

Baseline first: `npm run verify:final` passes on `main` **before** any change
(exit 0), so nothing here is masking a pre-existing failure.

| Command | Result |
|---|---|
| `npm run build:hero` | All checks pass · 5286 lines, **line count unchanged** |
| `build:situations` (7 situation pages + climate-disasters + index) | all gates pass |
| `build:work` · `build:about` · `build:impact` · `build:farm` · `build:act` | all gates pass |
| `build:stories` · `build:publications` · `build:posters` · `build:search` · `build:essays` | all gates pass |
| `build:climate-disasters` · `build:social-cards` | 49 pages, 0 rewritten |
| `npm run verify:final` | exit 0 — census: all 20 pages accounted for |
| `npm run verify:seo` | exit 0 — 49 pages × 14 checks, every page matches the register |
| `npm test` | 433 passed, 12 skipped (26 files passed, 1 skipped) |
| `npx tsc --noEmit` | exit 0 |
| `git status --porcelain` | 25 files, **no `healthy-cities*`** |

`public/_pages/v3/search.html` corrected itself on rebuild, as expected — the
`/posters` index entry lost "what is not here". It was never edited directly.

Note: `npm run build` (`next build`) cannot run in this worktree at all —
Turbopack cannot resolve `next/package.json` because the worktree has no
`node_modules` of its own. It is an environment limitation, unrelated to these
edits, and it does not affect the committed artefacts, which are all produced by
the `scripts/*.mjs` generators above.

---

## Where the strings live, for the next pass

Nothing was edited in `public/_pages/v3/`. Every change is in the data or in the
generator's own authored strings, and the built pages in the diff are
regenerated output:

- `data/posters.json` · `data/stories.json` · `data/forest-loss-india.json` ·
  `data/ganga-parliament-2026.json`
- `scripts/build-air-india.mjs` · `build-situation-air.mjs` ·
  `build-situation-yamuna.mjs` · `build-situation-forest-fire.mjs` ·
  `build-situation-forest-loss.mjs` · `build-situation-climate-event.mjs` ·
  `scripts/lib/situation-render.mjs`
- `scripts/fetch-forest-loss.mjs` — the *fetcher*, so a data refresh cannot
  reinstate the two strings it authors
- `design/home.html` — the hand-maintained homepage source, edited within one
  line
