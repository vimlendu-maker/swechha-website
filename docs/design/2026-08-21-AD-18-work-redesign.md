# AD-18 — The WORK section, second pass

**Status:** built and verified. 15 pages, every gate green.
`npm run build:work` → `public/design/v3/work/`.

**What this replaces:** AD-17 §5's five band sequences and their two hand-typed ground
chains. AD-17's link contract, cross-sell system and per-item rulings are unchanged.

---

## 0. The brief, and what each sentence turned out to be

The client rejected the first fifteen pages. Four sentences, and each one is a different
kind of problem:

| his words | what it actually was |
|---|---|
| *"There is no use of photos, hardly"* | **A data-model problem.** One frame field existed and it was the masthead. Measured: the pre-freeze prototypes carry 14 / 15 / 14 / 9 / 9 `<img>`; the pages we shipped carried 2 or 3, of which 2 are the wordmark. Most pages had **zero or one** real photograph. |
| *"each program looks incomplete. It should have — What we do, Objectives, Strategy/Activities, For Who, Impact, Come Partner/Volunteer/Contact Us"* | **A data-model problem.** `how` / `done` / `with` cannot express objectives, for-who, or the named activities inside a strategy. Six of his six parts were unauthorable. |
| *"design language is too bland … Play with numbers, some data points, make it intresting"* | **A markup problem, and the surprise of this pass.** Every component needed was already compiled into every page's `<style>` and unused — see §2. |
| *"this use of blck abnd white blocks is getting to make pages boring"* | **A composition problem.** The alternation is not the fault; he approved the homepage, which alternates harder. Our pages took the alternation and none of what carries it. |

`/work` was deleted by an IA review and reinstated by the owner (W-16) with a purpose it
never had: *"Sometimes people want to see Swechha's entire work in one view."* The IA's
diagnosis still binds and §5A is written against it.

---

## 1. The section as it now stands, measured

Read off `verify-work.json` — 165 runs, 15 pages × 11 widths (320 → 1920).

| page | bands | photographs before | after | prototype | doc @375 | before | doc @1440 |
|---|---|---|---|---|---|---|---|
| `/work` | 6 | 0 | **7** | — | 6,263 | 5,224 | 5,915 |
| `/work/projects` | 7 | 0 | **7** | — | 5,838 | 4,551 | 5,878 |
| `/work/campaigns` | 7 | 0 | **7** | — | 8,138 | 4,959 | 8,246 |
| `/work/journeys` | 7 | 0 | **6** | — | 5,390 | 4,165 | 5,728 |
| `/work/events` | 6 | 0 | **5** | — | 5,127 | 3,683 | 5,209 |
| `projects/bridge-the-gap` | 10 | 1 | **9** | 7 | 9,245 | 5,508 | 10,382 |
| `projects/eco-action` | 10 | 1 | **10** | — | 8,363 | 5,180 | 9,367 |
| `projects/farm-school` | 9 | 1 | **10** | — | 8,164 | 4,646 | 8,793 |
| `projects/influence` | 9 | 0 | **7** | — | 7,895 | 4,766 | 8,124 |
| `projects/me-to-we` | 10 | 1 | **6** | — | 8,700 | 5,054 | 9,766 |
| `campaigns/monsoon-wooding` | 10 | 0 | **6** | — | 7,706 | — | 8,534 |
| `journeys/cityscapes` | 9 | 0 | **8** | 13 | 7,635 | 4,544 | 8,094 |
| `journeys/gram-anubhav` | 9 | 0 | **9** | 12 | 7,499 | 4,294 | 7,651 |
| `journeys/naturescapes` | 10 | 0 | **9** | 12 | 7,887 | 4,917 | 8,521 |
| `journeys/yamuna-yatra` | 10 | 1 | **7** | 7 | 8,648 | 5,098 | 8,988 |

**Photographs: 5 → 113 across the section.** Prototype counts exclude their two chrome
images, so the comparison is like for like: Yamuna Yatra and Bridge the Gap are at or above
their prototype, the three remaining journeys are at 62–75% of theirs, and every page that
had none now has five or more.

**Verified to BRANDING §10, at 320 · 375 · 390 · 414 · 560 · 768 · 901 · 1024 · 1280 · 1440
· 1920:**

- `scrollWidth === innerWidth` — **0 failures / 165 runs**
- contrast against composited grounds, every element with its own text — **0 failures**,
  minimum ratio seen **5.64** against a 4.5 floor
- touch targets, measured on the **pseudo hit box** not the element rect — **0 under 24px**
- console — **silent on every page at every width**
- photographs without a ramp — **0** (see W-19)
- ground adjacency and rhythm — **0 identical pairs, 0 paper-to-paper**, all 15 chains

---

## 2. The finding this pass turns on: the vocabulary was already loaded

`work-shell.mjs` imports `situation-shell.mjs`'s `SITUATION_CSS` and `SHARED_PAGE_CSS`
wholesale, and its `SCRIPT_BASE` already carries Air's tab controller. Measured on the
**first** build's `/work/index.html`:

| already in every page's `<style>` | rules | instances in the markup |
|---|---|---|
| `.p-tabs` — the ARIA tab component | 8 | **0** |
| `.p-nr` — a figure as a ruled row | 7 | **0** |
| `.p-rg` — a **range** row with end caps | 11 | **0** |
| `.p-do-r` — a ruled row: label, body, caption | 7 | **0** |
| `.p-two` — two figures side by side | 7 | **0** |
| `.p-expl` `.p-sub` `.p-rank` `.p-yy` `.p-fc` `.mr` | 40+ | **0** |
| the tab controller IIFE, in `<script>` | — | never invoked |

`situation-air.html` carries **five** ARIA tab groups. The first build of this section
carried **zero** — and not for want of the component. **So "the ethos is missing" was a
markup gap, and closing it adds no CSS weight and no script.** Every device in §4 is markup
over rules that were already compiled in.

What each one needed was **its other ground**. Air's `.p-*` family is authored on dark
tokens; `.p-expl` and `.p-sub` on paper tokens. This is the fourth time this exact defect
class has cost a session here (ten Yamuna contrast failures, worst 2.11:1; `.w7-ce-pre` at
1.51:1; the campaigns figure block at 1.02:1; and this pass found `.dx-s` at **1.41:1** on
`#ECEBE8`, shipping on ten pages at eleven widths because `SHARED_PAGE_CSS` states
`.paper .dx-s` and no `.paper-2`). Every component used below now states both grounds.

The six still unused are deliberate: `.p-rank`, `.p-yy`, `.p-fc`, `.p-attn`, `.mr` and
`.p-cell` all carry an axis or a published limit, and no programme figure in this section has
either. A bar with no tick is a quantity, and this site only publishes a quantity against its
limit.

---

## 3. The four compositional moves — the answer to "boring"

Six flat blocks with a heading and prose in each reads as a slide deck. The frozen homepage
alternates the same four grounds and does not, because of what sits inside the bands. Four
moves, all extracted from `home.html`, none a new component and none a new colour.

### 3.1 The statement band — `#say`, extracted whole

Frozen homepage band 3. A photograph occupying half the band and running to the seam on
three sides, one display line beside it, one micro-caps line under that. **No opener, no
rule, no list, no CTA.** It is the only band shape in the language whose whole job is to stop
the scroll, and it is the one thing in the chain that does not read as a rectangle of ground
with content inside it.

**Every page in the section now has one**, band 4 on an item page and band 4 on a landing.
Cost at 375: **371–657px**, which makes it the cheapest band on most pages.

Two re-scopes, both with arithmetic:
- **The split goes 56/44 → 50/50.** The frozen 56% was chosen for one hand-broken statement
  whose longest word is six characters. A WORK statement is written per item, and 56% leaves
  **442.8px at 1920**, which at `--t-d1`'s 104px cap (Archivo 68/850 uppercase = **49px a
  character**) is nine characters. Nine is not a vocabulary. At 50% the column is **558.0px
  at 1440 and at 1920** — 11.4 characters. `.w7-say-fig`'s width and `.w7-say-in`'s right
  padding are the same measurement stated twice and move together. Scoped `#statement`.
- **The crop moves onto a custom property.** The frozen `object-position` values are one
  photograph's crop; each frame now sets its own at both widths, with the frozen values as
  the default. The homepage is untouched.

### 3.2 The asymmetric split — `.w7-pj-split`, extracted

Frozen homepage band 6 puts the register in columns 1–5 and a photograph with two readings in
7–12. Its own comment says why: *weight is carried by treatment.* A 5/6 split across twelve
columns gives a band a vertical axis instead of being a centred block the same width as every
other band.

`what` takes it un-flipped (prose left, readings right); `done` takes it **flipped**, so two
consecutive type bands do not share an axis. Below 900 both collapse to one column and the
picture, where there is one, goes first — a photograph after 500px of prose on a phone is a
photograph nobody reaches. **This move needs no frame at all**, so it lands on a page whose
photography has not been assigned yet.

### 3.3 Photography inside bands, not only in mastheads

- **The panel figure** (`.w7-jr-fig`, the journeys card's picture) — one per activity tab.
- **The contact sheet** (`.s-record-sheet`, homepage band 12) — a field of frames, re-scoped
  from a 9-column archive to a 3-column gallery so each frame is ~392px at 1440 rather than
  125px. Its own band, `sheet`.

### 3.4 Scale contrast

`--t-d1` at 104px in the statement band, `--t-num` readings in `what`, `.p-nr` at 19px in the
ledger, `.lbl` at 11.5px in the kind column of `/work`'s register: a 9:1 range inside one
page. The frozen ratio is 14.9:1 and it is the other thing that stops a block reading flat.

---

## 4. Band sequences, per page type

**Grounds are no longer typed.** AD-17 §5 published one chain per page type and the build
carried two as literals; AD-18 makes five bands optional on an item page, which is 32 literal
chains. So a page declares the **order** of its possible bands and the **condition** each is
present under, and `assignGrounds()` derives the chain (`work-shell.mjs`).

**The rhythm rule, read off the frozen page rather than off the spec.** BRANDING §1.1 says
*"the two darks that meet (`#impact` → `#farm`) are the intended alternate-dark step"*, which
reads as a licence for exactly one. **It is not what the page does.** Measured on
`home.html`'s own chain — `0D 15 0D F3 0D EC 15 F3 15 0D 15 F3 E1 15` — there are **four**
dark-to-dark steps. What the frozen chain has **zero** of is **paper-to-paper**. So that is
the rule the build enforces and gates: two off-whites never meet, because they read as one
band with a seam in it, while two darks are a step the page takes freely. **§1.1's sentence
is flagged, not obeyed.**

Invariants, all gated on the **composited** colour and all green on 15 chains: no identical
pair · no paper-to-paper · `top` is `#0D0D0B` · `onward` is `#ECEBE8` · the band above
`onward` is dark · every `t1` band is `#0D0D0B` (its component hardcodes `var(--ground)`).

### A. `/work` — everything Swechha does, in one view · 6 bands

The IA was right that the old page was homepage band 4 verbatim, plus band 6's head with
seven rows instead of three, plus band 5's head with the photographs removed. It indexed four
pages the homepage already links by name. **This is not that page.**

| # | id | ground | tier | job | frozen component | photographs |
|---|---|---|---|---|---|---|
| 1 | `top` | `#0D0D0B` | T1 | masthead, `h1` **THE WORK** | `.pic` / `.wk-mast` | 0–1 |
| 2 | `everything` | `#F3F2F0` | T2 | **the one register** — every project, campaign, journey and event, one ordinal sequence, the kind as a column | `.w7-pj-rows`, re-scoped to 3 columns | 0 |
| 3 | `statement` | `#0D0D0B` | T1 | one display line over a photograph | `.w7-say` | **1** |
| 4 | `reach` | `#ECEBE8` | T2 | **every sourced figure in the section**, four tab panels by kind | `.p-tabs` + the flat-rail figure | 0 |
| 5 | `sheet` | `#151512` | T3 | the contact sheet, across all four kinds | `.s-record-sheet` | **6** |
| 6 | `onward` | `#ECEBE8` | T3 | get involved — three routes, then three doors | `.s-record-door` + CTA family | 0 |

Chain `0D F3 0D EC 15 EC` + footer `15`. 0 clashes, 0 paper-paper.

**What makes it one view rather than four lists**, and it is one decision: band 2 is a
**single** register with the ordinal running `01…23` through all four kinds and the kind
carried as a *column* rather than as a heading over a group. **And the rows carry no fact
line.** Every one of those lines is on its kind page one click away; repeating twenty-three of
them here is exactly what the IA diagnosed. What this page is for is the *shape* of the whole.
It is also the only way the band closes on arithmetic — measured at 375, a row with its fact
line is **103.7px** and 23 of them is 2,179px; a row with the kind column alone is **69px**,
and 23 is **1,754.9px**. The design decision saves 424px and reads stronger.

Band 4 is the same move applied to the numbers: every published figure in the section in one
auditable place, so a journey's count can be held against a project's. No other page permits
that. **Minimal is spare, not sparse** — two registers, one statement, one sheet, and no band
that repeats another page's argument.

### B. Item detail — the client's six-part spine · up to 10 bands

Order is his order.

| # | id | ground | tier | his part | frozen component | interrogable device | photographs |
|---|---|---|---|---|---|---|---|
| 1 | `top` | `#0D0D0B` | T1 | — | `.pic` / `.wk-mast` | — | 0–1 |
| 2 | `what` | `#F3F2F0` | T2 | **What we do** | `.w7-pj-split` + flat-rail figures | **`.p-rg` range row** — a published span drawn as a span | 0 |
| 3 | `aim` | `#151512` | T3 | **Objectives** | `.p-do-r` | — | 0 |
| 4 | `statement` | `#0D0D0B` | T1 | — | `.w7-say` | — | **1** |
| 5 | `how` | `#ECEBE8` | T2 | **Strategy / Activities** | `.p-tabs` + `.w7-jr-fig` + `.p-rows` | **the tab group** — method, then each named activity, then the route | **1 per activity** |
| 6 | `who` | `#151512` | T3 | **For Who** | `.p-do-r` | — | 0 |
| 7 | `done` | `#F3F2F0` | T2 | **Impact** | `.w7-pj-split` flipped + `.p-hole` | **the reading ledger** — every figure with its span, basis and source, in a disclosure | 0 |
| 8 | `sheet` | `#0D0D0B` | T3 | — | `.s-record-sheet` | — | **3–6** |
| 9 | `with` | `#151512` | T2 | — | `.wk-names` | — | 0 |
| 10 | `onward` | `#ECEBE8` | T3 | **Come Partner / Volunteer / Contact** | `.s-record-door` + CTA family | — | 0 |

Chain at 10 bands: `0D F3 15 0D EC 15 F3 0D 15 EC` + footer `15`. At 9: `0D F3 15 0D EC 15
F3 0D EC`. Both 0 clashes, 0 paper-paper, band above `onward` dark.

**Bands 3, 5, 6, 7, 8 and 9 are conditional.** A band with no data is **omitted and the gap
is named in the build report** — never rendered empty, because an empty band is precisely how
a page comes to look incomplete. The report prints the field to populate and what it unlocks.

### C. Kind landing — `/work/projects`, `/work/journeys` · up to 7 bands

| # | id | ground | tier | job | device |
|---|---|---|---|---|---|
| 1 | `top` | `#0D0D0B` | T1 | masthead + `← WORK` | — |
| 2 | `frame` | `#F3F2F0` | T2 | what a *project* / *journey* is here | **`.p-tabs` — the four kinds side by side**, one panel each |
| 3 | `list` | `#151512` | T3 | the register at full membership | — |
| 4 | `statement` | `#0D0D0B` | T1 | one display line over a photograph | — |
| 5 | `weight` | `#ECEBE8` | T2 | the figures, allocation rule stated | the reading ledger, disclosed |
| 6 | `sheet` | `#151512` | T3 | the contact sheet | — |
| 7 | `onward` | `#ECEBE8` | T3 | get involved | — |

Chain `0D F3 15 0D EC 15 EC`. Band 2 replaces the first build's *"the other three kinds"*
register: a list of three reads as a menu, four panels under one head let a reader **compare**
the distinction, which is the only thing that band is for.

### D. `/work/campaigns` · 7 bands

As C, with `against` (the march, opponent-first, one situation hook per row) in place of
`list` and `holes` in place of `weight`. Chain `0D F3 15 0D EC 15 EC`.

### E. `/work/events` · 6 bands

`top · record · statement · nodates · sheet · onward`, chain `0D F3 0D EC 15 EC`.

**Yamunotsav changes this page and the change is the design.** It was four bare names and
read as an omission. It now has one event with **nine editions at the India Habitat Centre,
every 5 June from 2006 to 2014** — a date that is itself the argument, since 5 June is World
Environment Day — and three that have a name and a line. **The contrast between them is the
page.** The dated row carries its span, its venue, its note and its source in a `.wk-when`
block under the name; the other three carry nothing and say so. Far stronger than four
uniform blanks, and the no-date rule is scoped rather than repealed: a date lives only inside
`when`, and `when` cannot exist without a source (W-15).

`belongs_to` (W-17) puts the licensed inline hook above a row — *"Part of We for Yamuna →"* —
and **a parent outranks a situation**, because "this happens under We for Yamuna" is a fact
about our own work and "runs against the Yamuna" is a fact about the world. Only one hook
renders.

---

## 5. Height budget, with the arithmetic

**Fixed cost per band at 375:** opener `130.4` + T2 padding `112` = **242.4**; T3 padding
`88` = **218.4**. Leaves 658–682 of a 900 cap. A written prose row is 187–216 (mean 202); a
named hole ~120; a reading ~140; a `.p-do-r` row ~160; a tablist 44; a 6-frame sheet ~340; a
statement band 371–657 all in.

**36 bands exceed 900 at 375, against W-1's 20.** The accounting, honestly:

**(a) Thirteen are new bands, and eleven of those are the client's own asks.**
`aim` 943–1,030 · `who` 935–1,038 (three `.p-do-r` rows each: 218 + 130 + 3×160 = 828, plus
content) · `index · everything` 1,754.9 · `index · reach` 1,127.1 ·
`campaigns/monsoon-wooding · done` 1,138. The two `/work` bands are the page's reason to
exist; `aim` and `who` are two of the six parts he named.

**(b) Six grew because the CONTENT grew, not the design.** `campaigns` went from three
campaigns to eight: `holes` 1,194.8 → 2,639.5 and `against` 1,120.2 → 1,672.5. `events ·
record` 733.6 → 947.4 and `nodates` 885.3 → 995.7 are Yamunotsav's `when` and its two holes.
W-1's clause 1 protects the holes and clause 2 protects full membership, and **W-1's own
retirement condition applies unchanged: shorter prose, which is editing rather than
engineering.**

**(c) The design added +119 to each `done` and +36 to each `how`.** `done`: the ledger's
disclosure summary (44 + 1px rule + 32 padding) plus the flipped split's stacked row-gap
(24) plus margins. `how`: the tablist (44), less a recovered margin.

**(d) And it took 580.8 off the two worst bands in the section.**

| | before | after |
|---|---|---|
| `journeys/naturescapes · how` | **1,302.2** | **981.3** |
| `journeys/cityscapes · how` | **1,285.9** | **923.8** |

Both were W-1 licensed breaches carrying prose *and* a six-row route register stacked. Folded
into panels of one tab group — **plus six photographs each** — the band is shorter than it
was. That is the arithmetic that makes the photography affordable: **a tab group is only as
tall as its tallest panel.**

**Net of (c) and (d): +622px across fifteen pages, about 41px a page.**

**Four cuts made in this pass, each measured:**

| cut | saving | why it was there |
|---|---|---|
| the deck no longer repeats in `what`'s split | **−175** on bridge-the-gap | `masthead()` already sets it 200px above — the W-8 defect again |
| the ledger goes into the disclosure | **−898** on `projects · weight`, −500 on `done` | an audit of figures already published is not the honesty content; W-1's refusal covers holes, not restatements |
| the second invite route is an `.act`, not a `.b-2`; the note is one clause | **−73** per page | two stacked full-width buttons cost 110 and took `onward` to 978 against a cap it has no licence for |
| a tab panel's first child adds no top margin | **−60** at 375, −95 at 1440, per tab group | Air's `.p-rows` block margin stacked on the panel's own padding — **60px of dead ground, visible in the PNG and in nothing else** |
| `/work`'s register row loses its fact line and takes a kind column | **−424** on `everything` | 23 fact lines that are each one click away on a kind page — the union-of-registers defect |

**Where the arithmetic does not close, and it is coming back to you rather than being
shipped quietly:** items (a) and (b) are 19 of the 36. **Thirteen are content the client
asked for by name and six are content the owner supplied this week.** I am not proposing to
hide any of it, and W-1's reasoning applies with more force than it did — the document-level
number is what governs, and the tallest band anywhere in this section (2,639.5 on
`/work/campaigns`, eight campaigns' named holes) sits in an 8,138px document against the
approved homepage's 1,415px band in a 10,266px one. **Item (c), +155px a page, is mine and I
will cut it further on instruction.**

---

## 6. Where every photograph goes, and which file

All 113 frames are Swechha originals with a catalogue row and `stock: false`. Five NatureScapes
destination frames (`ranthambore-tiger-grass`, `corbett-spotted-deer-forest`,
`mukteshwar-pines-snow-peak`, `jaisalmer-camel-dunes`, `sunderbans-mangrove-roots`) are
refused by flag and appear nowhere — the page's own hole says why.

| page | masthead | statement | activity panels | contact sheet |
|---|---|---|---|---|
| `/work` | — | `yamuna-students-line-skyline` | — | `journeys-hero` · `clean-air-protest` · `gram-anubhav-community-circle` · `cityscapes-yamuna-walk` · `children-beekeeping-veils` · `turmeric-plot-workers` |
| `/work/projects` | `school-children-group` | `farm-plot-children-facilitator` | — | `children-seedling-boxes-field` · `children-beekeeping-veils` · `turmeric-plot-workers` · `nursery-plants` · `microgreens-trays` |
| `/work/campaigns` | `clean-air-protest` | `yamuna-students-foam-line` | — | `yamuna-students-line-skyline` · `yamuna-barrage-crowd` · `children-hats-red-jackets` · `cityscapes-landfill-walk` · `delhi-smog-skyline` |
| `/work/journeys` | `journeys-hero` | `river-valley-hillside-climb` | — | `gram-anubhav-village-walk` · `cityscapes-yamuna-walk` · `trekkers-hillside` · `gram-anubhav-community-circle` |
| `/work/events` | `yamuna-floodplain-crowd` | `yamuna-barrage-crowd` | — | `community-meal` · `langar-community-meal` · `india-gate-dusk` |
| `projects/bridge-the-gap` | `school-children-group` | `cityscapes-group-learning` | `cityscapes-landfill-walk` · `cityscapes-community-restoration` | `forest-group-walk` · `hillside-gathering` · `youth-site-visit` · `cityscapes-forest-walk` · `children-certificates-field` |
| `projects/eco-action` | `children-hats-red-jackets` | `red-trumpet-flowers` | `cityscapes-butterfly` · `leafy-greens-crop` · `cityscapes-restoration-park-walk` | `magenta-flowers` · `kans-grass-yellow-flower` · `pink-flower-bud` · `bee-on-mustard-flower` · `red-flower-cluster` |
| `projects/farm-school` | `farm-thatch-amaltas` | `farm-cows-sunrise` | `bamboo-net-plot` · `microgreens-trays` · `turmeric-plot-workers` | `farm-building-yellow-trees` · `oranges-tree-cluster` · `farm-cow-closeup` · `farm-tractor-ploughing` · `nursery-plants` |
| `projects/influence` | — *(type-only, no fellowship frame exists)* | `hillside-gathering` | `youth-site-visit` · `cityscapes-riverbank-restoration` | `cityscapes-community-restoration` · `clean-air-protest` · `hillside-journaling-group` · `children-seedling-boxes-field` |
| `projects/me-to-we` | `school-selfie-uniform` | `yamuna-floodplain-crowd` | — | `school-children-group` · `children-hats-red-jackets` · `youth-site-visit` · `community-meal` |
| `campaigns/monsoon-wooding` | — | `children-seedling-boxes-field` | `children-hats-red-jackets` · `nursery-plants` | `children-certificates-field` · `cityscapes-community-restoration` · `youth-site-visit` |
| `journeys/cityscapes` | `cityscapes-hero-riverside-walk` | `cityscapes-urban-wetland` | — | all six walks: `yamuna` · `landfill` · `forest` · `bird-watching` · `heritage` · `restoration-park` |
| `journeys/gram-anubhav` | `gram-anubhav-group-learning` | `gram-anubhav-himalayan-villages` | `shramdaan` · `rural-community` · `local-food` · `community-circle` | `village-walk` · `desert-villages` · `hillside-gathering` |
| `journeys/naturescapes` | `pine-forest-path` | `ridge-road-dusk` | `langurs-branch-family` · `hillside-gathering` · `hillside-journaling-group` | `forest-group-walk` · `grasses-dusk` · `langur-golden-portrait` · `langurs-resting` |
| `journeys/yamuna-yatra` | `river-valley-hillside-climb` | `yamuna-source-rapids` | — | `yamuna-students-foam-line` · `trekkers-hillside` · `langar-community-meal` · `yamuna-students-line-skyline` · `snow-trek-group` |

**Two allocations are worth a second look from the content author, not from a gate.**
`projects/eco-action` is butterfly parks and herb gardens and its masthead is
`children-hats-red-jackets` — a planting-site frame of children on a page about gardens;
`cityscapes-butterfly` is on the same page as an activity panel and may be the stronger
masthead. And `journeys/cityscapes` puts all six walk frames in the contact sheet while its
`activities` array is empty — those six are one-per-walk and would carry the tab group.

**No frame appears twice on one page** — gated, across all four frame fields together.

---

## 7. New rulings

### W-19 · Every frame takes a ramp. `baked` is withdrawn.

`baked: true` meant "this file arrived with selective colour baked in, so give it no ramp",
and the generator obeyed it. **Three pages shipped selective colour.**
`/work/projects/farm-school` ran a full-colour field of yellow amaltas blossom, 1440 × 370,
directly under the mustard GIVE chip — against BRANDING §7.3 (*"selective colour … retired …
hue lives only in type, data, marks and controls"*) and against §1.1's rule that a second
mustard-scale field spends what licenses mustard as the control colour everywhere else.

**The frozen page settles it.** `home.html` applies `.duo` or `.duo-dim` to **eleven** frames
the library marks `baked: true` — `cityscapes-hero-riverside-walk`, `school-selfie-uniform`,
`green-the-map-tote`, `langar-community-meal`, `hillside-journaling-group`,
`turmeric-plot-workers`, `yamuna-students-line-skyline`, `yamuna-students-foam-line`,
`farm-plot-children-facilitator`, `children-seedling-boxes-field`, `children-beekeeping-veils`.
BRANDING's own preamble: **where a written spec and the built page disagree, the page wins and
the spec is flagged.**

So `baked` is a fact about the source file, not a licence for the page. The renderer ignores
it entirely — a stale `baked: true` cannot change a pixel — and the build reports it once per
frame as a field to delete. **Verified: 0 unramped photographs on 165 runs.** The photo
library's own note is now stale on this point and is reported, not rewritten.

### W-20 · The paper-to-paper rule, and BRANDING §1.1 is flagged

§1.1 names one dark-to-dark step as "the intended alternate-dark step". The frozen chain has
**four**. It has **zero** paper-to-paper. The build gates the true invariant and reports the
other. *(§4 above carries the measurement.)*

### W-21 · The statement band's copy is gated on arithmetic, not taste

A word longer than 11 characters crosses the seam into the photograph: the type column is
558.0px, `--t-d1` caps at 104px, Archivo 68/850 uppercase measures 49px a character. **A
single word cannot wrap and the band clips its own overflow, so no contrast, height, overflow
or adjacency check can see it.** `/work`'s statement overran by **2.9px at 1440 and 31.7px at
1920** and every gate was green. Found by reading a PNG, then confirmed by a purpose-built
seam probe at six widths. Now: a build rejection, plus `overflow-wrap:break-word` as a net
that should never fire.

**Four defects in this pass existed only in the picture**, and every gate was green through
all four:

| defect | measured | why nothing caught it |
|---|---|---|
| the statement head crossing into its photograph | +2.9px at 1440, +31.7px at 1920 | the band clips its own overflow |
| a 60px hole under every tab row | 60.0 at 375, 95.0 at 1440 | Air's `.p-rows` block margin stacked on the panel's padding — the band merely got taller |
| `/work`'s kind chip on a second line under every name | 23 rows × 2 lines | the frozen register is a two-column grid; nothing was broken, just wrong |
| **the statement frame at 50% width on a phone**, floating in a 375px band with 173px of empty ground beside it | 202px wide instead of 375 | an id-scoped re-scope (1,0,1,0) out-specified the frozen phone rotation in its `max-width:767` block (0,0,1,0). **The re-scope now lives inside `min-width:768`.** |

BRANDING §8.5 is right and it is cheap to forget: *box measurement and image reading find
different bugs and you need both.* Two of these four are the same lesson twice — a component
extracted verbatim and then re-scoped needs the re-scope checked **at both ends of its own
breakpoint range**, not only where the change was intended.

---

## 8. Gates, all kept, six added

Kept: the extraction assertions (now 23, up from 10) · ground adjacency on the composited
colour · `node --check` on the whole assembled page script · every `.im-head` inside a
`.wrap` · the eight data rejections · the link gate against the route map and the anchor
registry, with the `href="#"` count asserted per page.

Added:

1. **no paper-to-paper step**, and dark-to-dark counted with a ceiling of three
2. **`top` is the arrival ground · `onward` is paper-2 · the band above `onward` is dark** —
   previously typed per chain, now proven per page
3. **a `scale` endpoint must appear inside the named figure's own published `value`** — so
   the range row is structurally incapable of introducing a number
4. **a `statement.line` may carry no digit, no more than 64 characters, and no word over 11**
5. **the frame gates run on every frame field**, not only the masthead — and no frame twice
   on one page
6. **the extraction refuses the year chip** if it is ever pulled in with the contact sheet;
   no WORK frame has a sourced date, so a date chip here would be an invented one

`onward.json`'s `index` block is now validated like any other subject. The first build of
this amendment validated the item files and the kinds and skipped it — which is exactly how
the ten-character statement word reached the page.

---

## 9. What I could not do

1. **`/work` is also assigned to a dedicated UI designer (AD-20)**, per the ledger. §5A is a
   working redesign against the owner's stated purpose and the IA's diagnosis; treat it as the
   baseline to beat, not as a claim on the brief.
2. **`campaigns · holes` at 2,639.5px** needs a ruling. Eight campaigns' named holes, and
   both of W-1's protections apply. The honest fix is editing.
3. **Two frame allocations are art direction I would revisit** — §6.
5. **`.p-tabs-l` had no scroll affordance** and an eight-tab row clips its last label
   mid-word at 375. Fixed here with the frozen 8px mask and trailing flex item (§5.10's own
   device, no new mark) — **scoped to this section's CSS, so the five situation pages that
   share `.p-tabs` still have the defect.** Theirs to fix; flagged, not reached into.
4. **`journeys/cityscapes` has an empty `activities` array** while six subject-specific walk
   frames sit in its sheet. One data edit turns that page's tab group on.
