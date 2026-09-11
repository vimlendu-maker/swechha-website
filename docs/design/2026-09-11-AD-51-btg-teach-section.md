# AD-51 — Bridge the Gap, published as themes

**11 September 2026.** Establishes a new section from the 321-page *Final BTG
MANUAL*. Touches nothing already shipped. Supersedes nothing.

Labelled AD-51 because **AD-48, AD-49 and AD-50 are already in use** — in code
comments rather than in `docs/design/`, which is why a search of this directory
alone reports AD-47 as the highest and is wrong (`fetch-forest-fire.mjs:180`,
`situation-shell.mjs:955`, `fetch-air.mjs:203`).

## The brief

The owner supplied `Final BTG MANUAL.docx.pdf` — 321 pages, a Google Docs
export — and asked for it published **as themes, not one book**: "modules /
chapters or something more creative", a teacher's guide, and a directory of
session modules; inside the Healthy Cities microsite and linked from `/learn`.
A design specialist and an art director were run in parallel. This record is
their joined output plus three owner decisions.

## What the source actually contains

**The unit is the SESSION, and the manual publishes its own directory.** Each
chapter opens with a `MODULE SUMMARY` table whose columns are literally *"Title
of The session | Issues/Topics Covered | Duration | Instruction, if any"*.

| # | Theme, as printed | Sessions | Activities |
|---|---|---|---|
| 01 | Sustainable Development | 6 | 11 |
| 02 | Blowing in the Wind | 2 | 3 |
| 03 | Water, Water, Everywhere, and not a drop to drink! | 7 | 8 |
| 04 | Food on my Plate | 3 | 3 |
| 05 | Future and Energy | 3 | 5 |
| 06 | Wasted! | 4 | 5 |
| 07 | Trees and Forests | 3 | 4 |
| 08 | Climate Justice & Active Citizenship | 3 | 4 |
| | | **31** | **43** |

Plus a ~900-line ESD pedagogy introduction, a bibliography, and an A–Z glossary
of **333 terms**. 171 embedded images.

**Session-level metadata is 31/31 complete. Activity-level metadata is not**, and
this is the constraint the design exists to handle. Measured across the 43:
teaching sequence 36, materials 23, description 20, objective 15, vocabulary 10,
**TIME 10**, teaching techniques 8, extension 9, closure 4, evaluation 4.
Activity bodies run 22 to 1,394 lines.

### A-51.1 — Model at the session level, never the activity level

A directory faceted on the activity template would have empty facets for
two-thirds of its contents. Facet only on what is 31/31 present: theme, session
position, session title, topics.

### A-51.2 — No duration filter, ever

The `Duration` column is filled for all 31 rows but in **two incompatible
units**: clock time in themes 01–02 ("Two sessions (1.5 hrs)", "60 minutes"),
session ordinals in 03–08 ("Session 4 and 5"). Print the manual's own string and
let the guide define what a session is. The house answer already exists on
`/work/projects/bridge-the-gap`: *"Five sessions, or sixteen. The school
decides."*

### A-51.3 — The absent row is the design

BRANDING §4.3 already rules that an unknown value's row **does not render** — no
placeholder, no em dash, no greyed row, no "Time: not stated". §4.2 attaches the
condition that when a list's length varies, something on the band must say why.
So the metadata strip carries one `.cap` line beneath it:

> *The manual states these. What it does not state is not here.*

The strip's length is then evidence, not a defect. Nothing is invented for the
sessions with no stated time. **This is the site's existing honesty grammar doing
the job, not a workaround for it.**

### A-51.4 — Do not parse the MODULE SUMMARY tables

The extracted text is column-bled — theme 01's reads `"Sustainability , Three
Students will explore the life cycle of"` and `"erstanding climate
vulnerabilities for the"`. 31 rows is a transcription job, not a parser job.

### A-51.5 — The real blocker is undocumented in the source

**The manual never states which activity belongs to which session.** Themes 03
and 04 are 1:1 and the titles even match; 01 (6/11), 02 (2/3), 05 (3/5) and 06
(4/5) are not. ~43 membership decisions must be authored once by someone who
knows the programme. That is the gaps sheet — three columns
(`session_slug`, `age_band`, `materials_summary`), not eleven.

## Owner decisions, 11 September 2026

### D-51.1 — It lives at `/teach`, top-level

Not `/healthy-cities/teach`. The Healthy Cities spec (`2026-09-07`, §2) rules
that the microsite is *"one funded chapter"* of Bridge the Gap; nesting the whole
curriculum under one grant ages badly when the grant ends. **"Teach" is the
complement of "Learn"** and sits in the register of the existing nav words.

It is still surfaced inside the microsite, structurally and without a new band:
`healthy-cities.html:1667` already names the five modules in prose inside a
`.p-do-r` labelled "What the five modules are". **Those five names become five
links to the five theme pages.** Plus one fourth `.s-record-door` in the existing
`#onward` row.

**No band may be added to `/healthy-cities`.** It has 13, and
`build-healthy-cities.mjs:1786` gates that *"the four display rows open the four
bands"*. Worse, a fifth band would claim a fifth deliverable under a grant that
funded four. The sessions are not a deliverable; they are what deliverable 01 is
made of.

### D-51.2 — Theme 02 is rewritten for India before it publishes

**The air chapter as written teaches Britain.** Verbatim from the source:

> *"The UK has suffered from air pollution since the beginning of the industrial
> revolution in the 18th century… More than 4000 people died in London in the
> great London smog in 1952!"*
> *"Today there are about 23 million vehicles on the road in Britain, and 20
> million of them are cars!"*

Two mentions of India or Delhi in the entire chapter. It also carries a paragraph
pasted from an unrelated document: *"This Proposal Letter serves as an
introduction to the themes and topics we hope to examine during this
Hackathon"* (`btg.txt:3001–3003`).

An Indian air-pollution curriculum teaching the 1952 London smog, published on
the site that runs Delhi's live CPCB reading, is the most quotable thing
available against it. 2.2 and 2.3 are rewritten against Indian sources — the
site already holds `/learn/pm25`, `/learn/cpcb-aqi`, `/learn/delhi-aqi`,
`/learn/source-apportionment` and `/learn/stubble-burning` — before theme 02
ships. The other seven are not blocked on it.

### D-51.3 — Licence is derived per session, not inherited

Every built page ships *"Reuse freely — CC BY 4.0"* (`S.LICENCE_URL`). The manual
is a **compilation**: its sources point at UNESCO, US EPA, FAO, UNCCD,
ecoschools.in, INECC and 7+ YouTube videos, and only **8 of 43** activities carry
an explicit `Source:` line. Swechha cannot license adapted third-party classroom
material under CC BY 4.0.

So the licence line on a session page is **derived from that session's own
`source` field** — "Adapted from ⟨X⟩", and no CC claim where provenance is third
party. The remaining 35 need their provenance traced. This is also the reason the
original PDF stays downloadable, once, from the guide.

## Naming

| Slot | The word |
|---|---|
| The section | **Teach** |
| Route | `/teach` |
| One of the eight | **theme** — band heading "Eight themes" |
| One of the 31 | **session** |
| The ESD introduction | **"Before you start"** — `/teach/before-you-start` |
| The 333-term glossary | **"The A to Z"** — `/teach/a-to-z` |
| Masthead | eyebrow `Bridge the Gap`, `.d1` **"Take it into the room."** |

**Not "module".** Healthy Cities already uses it for its five theme-based
modules; reusing it at either level collides. **Not "activity"** — the manual's
word, and it reads like a worksheet. **Not an invented section brand** — the site
names things plainly ("Now", "Learn", "Use the data", "Start here"); "EcoLab"
would be its first piece of marketing language.

### The printed titles are the identity. Do not normalise them.

"Blowing in the Wind", "Water, Water, Everywhere, and not a drop to drink!",
"Wasted!", "Food on my Plate" — this is the voice of the site's own best lines
(*"A number is not a smell"*; *"A plantation drive is a photograph. A garden is a
rota"*). COPY-STANDARD is explicit: do not weaken strong headlines. **Keep the
exclamation marks.** Flattening these to "Air", "Water", "Waste" would delete the
only voice the material arrived with.

One mechanical rule: a **long form** for the theme page and a **short form** for
the register row, which is only `clamp(.98rem,1.15vw,1.12rem)`. Nothing is
renamed; a row is cut early.

## Routes

| Route | Type | Count | Generated |
|---|---|---|---|
| `/teach` | landing **and** the session directory | 1 | one-off |
| `/teach/<theme>` | theme page | 8 | per-item |
| `/teach/<theme>/<session>` | session page | 31 | per-item |
| `/teach/before-you-start` | the teacher's guide | 1 | one-off |
| `/teach/a-to-z` | the glossary | 1 | one-off |

**42 routes.** Two-level session routes have precedent in `recordRoutes()`
(`design-routes.ts:212`). **No separate directory page** — `/learn` already
merges landing and directory at 30 items in 8 categories; `/teach` is 31 in 8.
Two bands on one page: `#themes` and `#directory`.

Theme slugs: `sustainable-development`, `blowing-in-the-wind`,
`water-water-everywhere`, `food-on-my-plate`, `future-and-energy`, `wasted`,
`trees-and-forests`, `climate-justice`.

### Three families on the landing page

Theme weights are lopsided (11 activities against 3) and theme 01 is a frame, not
a topic peer:

- **How to think about it** — Sustainable Development
- **Five systems of a city** — Air, Water, Food, Waste, Trees & Forests
- **What happens next** — Energy, Climate Justice & Active Citizenship

The middle family is not invented. `healthy-cities.html:1622` already states the
programme's curriculum as five links — *"Air pollution and respiratory health.
Contaminated water and disease outbreaks. Urban food systems and nutrition. Waste
infrastructure and health. Biodiversity and mental well-being."* That is themes
02, 03, 04, 06, 07 in order, which makes the attachment structural rather than
decorative.

## The session page

A teacher, on a phone, at the back of a classroom, possibly from a photocopy.

1. **Where you are** — `.lbl wk-anc` ancestor line, as the fellow pages use.
2. **What it is** — title in `.d2`, then `DESCRIPTION` as `.lead.lr-answer` at
   60ch. Under two seconds to know whether this is the one.
3. **The strip** — `.lr-st`, one row per field the manual actually filled, plus
   the A-51.3 caption. Field names in the site's voice, not the manual's:
   `TIME`→**How long**, `MATERIALS`→**What you need**,
   `OBJECTIVE`→**What it's for**, `TEACHING TECHNIQUES`→**How it's taught**,
   `VOCABULARY`→**The words** (each links into The A to Z),
   `TEACHING SEQUENCE`→**How it runs**, `CLOSURE`→**How to end it**,
   `EVALUATION`→**How you know it worked**, `EXTENSION`→**If it goes well**.
4. **How it runs** — the sequence as one `<ol>` at 62ch, ruled rows in one
   column. **Steps are never cards.** This is also what absorbs the 22-to-1,394
   line spread: a long sequence is a longer list, not an overflowing card.
5. **The tail**, on `--paper-2` — three `.lr-cannot`-shaped blocks, only the ones
   that exist. The four dangerous activities carry their SAFETY note here.
6. **Where this comes from**, on `dark-2` — per D-51.3.
7. **Onward** — `.lr-doors`: next session · the theme · **the matching `/learn`
   explainer**. That third door is the reason this belongs on swechha.in at all.

### A theme page arrives. A session page opens on paper.

All 94 served pages open with a `.pic.ht` photograph. A theme page does the same.
**A session page does not** — it starts at `--paper` and stays paper until one
`dark-2` band at the foot. That inversion is the whole at-a-glance difference, it
costs nothing new, it is *true* (a theme is an arrival, a session is a tool), and
it removes the need for 31 photographs that do not exist.

## Theme identity: no colour, no mark, no per-theme treatment

Eight theme colours would break the site's **meaning** system, not merely its
taste. BRANDING §3.1 is closed: mustard is *a human act* and the only interactive
colour; red is *a published limit broken* and never a control; green is *what
Swechha has done*. A reader who has learned that a red rule means a broken limit
would misread a red "Wasted!". Eight hues would need 16 new `-ink` tokens to
clear AA on four grounds, none of which would mean anything.

Icons are equally closed — §7.4 permits only the `→`, the six-band scale and the
halftone dot screen. Eight theme glyphs would be the site's first icon *set*.

**A theme is distinguished by three things:** its title at display scale in
condensed Archivo caps; its photograph, or the blank screen; and its ordinal
`01`–`08` in `.w7-pj-n`. This is already the answer for the six situations, which
have no per-situation colour either.

**Weight is shown, not equalised.** §5.5's three treatments: the two heaviest
themes get a lead treatment with their photograph and a `.num` count; the middle
get a plain column; the thin ones get a compact column and are **not** padded to
match.

## Imagery

Six of eight themes have an honest photograph. Two do not, and nothing is
invented to cover it.

| # | Theme | Frame |
|---|---|---|
| 01 | Sustainable Development | `bridge-the-gap-outdoor-briefing.jpg` |
| 02 | Blowing in the Wind | **none — the blank screen** |
| 03 | Water, Water, Everywhere | `yamuna-students-foam-line.jpg` |
| 04 | Food on my Plate | `langar-community-meal.jpg` — *provenance unverified, check before assigning* |
| 05 | Future and Energy | **none — the blank screen** |
| 06 | Wasted! | `bridge-the-gap-exposure-trip-landfill.jpg` |
| 07 | Trees and Forests | `bridge-the-gap-tree-planting-huddle.jpg` |
| 08 | Climate Justice | `bridge-the-gap-no-dumping-banner.jpg` |

Directory hero: `bridge-the-gap-butterfly-gardening-assembly.jpg` (4032×3024,
the largest and sharpest file in the library).

**Ten of the 16 `healthy-cities-*` frames are named fellows' own project
photographs** and must not be reassigned to head a theme — that would
misattribute them.

### The blank screen

Where no honest photograph exists: a `--paper-2` field carrying `.pic::after`
unchanged — the 6px halftone rosette — with the `.pic-over` gradient and `.d1` in
`--fg`. One class, no new token, no new geometry. It reads as *printerly absence*
rather than as a placeholder graphic, and unlike a stock photo it tells the truth.

**It may only be used where no honest photograph exists.** The moment it appears
beside a theme that had a usable frame, it becomes a style instead of a statement
— and then it is decoration.

**No generated image. No stock.** Thirteen CityScapes frames and all twelve Gram
Anubhav files in this repo were already withdrawn as synthetic. The blank screen
exists so this refusal costs nothing.

## Type

Reused verbatim: `.d1` (theme titles, Archivo `'wdth' 68,'wght' 850`,
`clamp(2.7rem,8vw,6.5rem)`), `.cap`, `.lbl`, `.lead.lr-answer`, `.body`, `.num`.

**One proposal rather than a reuse: the session title is `.d2`, not `.d1`.** `.d1`
is this site's *chapter voice* — condensed Archivo caps, what a masthead is set
in. A session title is a sentence. `.d2` (Newsreader 300,
`clamp(1.5rem,3.4vw,2.75rem)`) reads as one, and sits inside §2.1's rule that
Newsreader is "everything that reads". If rejected, the fallback is `.d1` with the
theme name as eyebrow, and theme-vs-session then rests entirely on the
paper/photograph split — which still works, less well.

**Served type is Archivo + Newsreader.** `CLAUDE.md`'s Styling section — Fraunces,
Instrument Sans, the Tailwind `@theme` tokens, the teal/coral `-ink` palette —
describes the **shadowed `app/` lane**. Counted: Fraunces **0 of 94** served
files, Instrument Sans **0**, Archivo **94**, Newsreader **94**. That section
should be corrected; it is a standing trap independent of this work.

**Selective colour is fully retired** — 0 `sig-*` filter defs and 0
`filter:url(#sig…)` across the served lane, against 219 `class="duo"`. What ships
is a warm duotone plus the halftone screen; every photograph on swechha.in is
black and white. The `signal` field is dead surface. Nothing here is built on it.

## The directory

The solve already exists on `/learn`, which renders 30 explainers across 8
categories of sizes 7/6/5/3/2/2 without reading as a dead grid: `.lx-cats` at
`repeat(auto-fit,minmax(280px,1fr))`, each group a `.d2` heading, a `.cap`
one-liner at 44ch, then hairline-ruled rows. No card, no box, no shadow, no image
per item. Uneven columns are native to it.

Three additions:

- **"If you have one period"** — the entry band, built from `.lx-s`. Four
  sessions chosen as the way in: the ones that need a room and nothing else. A
  teacher's real first question is not "which topic" but "what can I run on
  Thursday".
- **Weight by treatment, not row count** — §7.8 forbids weight expressed as row
  count, so the lopsidedness is stated deliberately rather than accidentally by
  height.
- **The eight as a display spine** — the `.w7-do-list` / `.d1 rl w7-do-t`
  component from `/healthy-cities`' "Four deliverables", ordinals `01`–`08`. The
  only place the vivid titles get full size outside their own pages.

**A closed set may state its own count.** §7.8 forbids a stated total because
membership grows and a total goes stale; this manual is a closed, published
document. "31 sessions · 8 themes" in a figure rail is fine. Deriving any layout
*height* from those numbers is not.

## Print

`@media print` count across all 94 served pages: **0**. Nothing on swechha.in
prints today, and a teacher printing a session would currently get a black
rectangle. The session page should be the first page with print CSS, **scoped to
this section's own `pageCss`** so it cannot regress 91 other pages.

Grounds to white, `--fg*` to ink; drop `.nav`, the footer, `.lr-doors` and the
skip link; `.d2` to 18pt; keep the step rules and the `.lbl` field names, because
they are the structure; force every `details.dx` open so a printed session is
complete; `break-inside:avoid` per step; `@page` prints the URL so a photocopy can
be found again. ~20 lines. The session page has no photograph, so nothing needs a
print variant of the duotone.

This is also why state is carried by shape and not only by hue throughout this
design language — BRANDING §0: *"so it survives colour blindness and a
photocopier."* **A photocopier is a real device in this audience.**

**No per-session PDF generator.** No precedent (`build:social-cards` is the only
binary-emitting generator), and it would put a headless renderer inside five cron
publishers. The original PDF goes at `public/docs/btg-manual-<year>.pdf`, linked
**once**, from the guide — never a hero button, never an embedded viewer.

## Before you start (the teacher's guide)

**One page**, `/teach/before-you-start`, navigated by the shell's own section-index
chip strip. The ~900-line ESD introduction is one argument in six movements:
background and context → principles → the four thrusts of ESD → characteristics →
teaching techniques (including a long passage on simulations) → how it sits in a
school year.

One page because that is what this site already does with a long argument —
`/learn/how-to-read-environmental-data` builds to 1,384 lines, and `/about`,
`/act` and `/farm` are each one long page. A teacher reads the guide once.
Splitting it into four routes multiplies the register cost by four for nothing.

Bands: `top` → `why` → `thrusts` → `techniques` → `running` → `sources` →
`onward`. **Reserve the split in advance:** if `techniques` outgrows a band it
becomes `/teach/before-you-start/techniques`. Naming the future route now costs
nothing and stops a reflexive one-page-per-heading explosion later.

## `/learn` attachment

- `data/learn/index.json` `onward.doors` holds three. **Add a fourth**, kicker
  "For teachers". `.lr-doors` is `repeat(auto-fit,minmax(240px,1fr))`; four fits.
- **Per-article, with zero edits to the 30 article files.** The Learn door strip
  is a row of verbs — "Live reading" / "Stand in it" / "In the Journal". **Add a
  fourth, "Teach it."** The edge is **inverted out of the session's own
  `related.learn`**, exactly as `S.journalForLearn(slug)` does
  (`situation-shell.mjs:1599`), whose header comment is already written for this
  problem: *"no link is added for SEO. An article that does not claim the
  relationship produces no edge, and there is no second list anybody can pad."*
- In reverse, the session page carries the existing `learnRail` block
  (`.cl-learn`, "Understand the data") — the same component the six situation
  pages use. **Neither side invents a component**, which is why the crossing will
  not read as two websites.

### The pairs

- **Air** → `/learn/cpcb-aqi`, `/learn/pm25`, `/learn/pm10`, `/learn/delhi-aqi`
- **Water** → `/learn/yamuna-pollution`, `/learn/yamuna-bod`,
  `/learn/yamuna-dissolved-oxygen`, `/learn/faecal-coliform`,
  `/learn/groundwater-delhi`; session 8's exposure walk also pairs with
  `/now/yamuna` and `/work/journeys/yamuna-yatra`
- **Trees & Forests** → `/learn/forest-cover-vs-tree-cover`,
  `/learn/forest-loss-india`, `/learn/tree-cover-loss`
- **Climate Justice** → `/learn/environmental-deaths-india`,
  `/learn/india-heatwave`, `/learn/extreme-rainfall`.
  `environmental-deaths-india`'s programme door **already** points at
  `/work/projects/bridge-the-gap` — it is the one explainer written toward this
  programme
- **Sustainable Development** → `/learn/how-to-read-environmental-data`,
  `/learn/measured-vs-modelled`, `/learn/reporting-floor`

**Food, Energy and Waste have no partner — zero of 30.** Omit the rail on those
three rather than reach for a loose match, per `build-learn.mjs`'s own rule:
*"Where an article has no programme to point at, it points at none."* It also
names the three explainers worth writing next.

## Structural reuse

Reused unchanged: `.wrap`, the band chain and `S.groundChain()` clash check,
`opener()`, `.pic`/`.pic-over`/`.pic-body`, `.p-do`/`.p-do-r`, `.w7-do-list`,
`.lr-st`/`.lr-st-r`, `.lr-doors`/`.lr-door`, `.lx-cats`/`.lx-c`/`.lx-l`/`.lx-s`,
`disclose()`→`.dx`, `.lr-cannot`, `.lr-ul`, `.lr-src`, `.lr-lic`, `.wk-anc`,
`.b`/`.b-1`/`.b-2`, `.lk`, `.rl`, `S.articleJsonLd`, `S.itemListJsonLd`,
`S.ask({audience:'school'})` (the `school` audience already exists).

Grounds: `--ground #0D0D0B` (theme arrival), `--paper #F3F2F0` (session body),
`--paper-2 #ECEBE8` (session tail), `--ground-2 #151512` (sources). **No two
adjacent bands share a hex. No band without a declared tier.** One `.b-1`
mustard-fill primary per band, maximum.

Genuinely new, and it is nearly nothing: **one ordered step list** (`.tc-seq`, an
`<ol>` on `.lr-st-r`'s grid with `grid-template-columns:auto minmax(0,1fr)`, ~8
lines — `.lr-ul` is unordered and `.w7-do-list` has hand-typed numbers), **the
blank-screen class**, **~20 lines of scoped `@media print`**, and `.d2` as an
`h1`.

**No `tabs()` on a session page.** It is the only shell component needing
JavaScript, and a session page must render with JS off — which also means no
client-side filter on the directory. A 31-row `.lr-st` sorts fine server-side.

## Build mechanics

### The registries are SEVEN

| # | Registry | What `/teach` must do |
|---|---|---|
| 1 | `design-routes.ts` | Map the 3 one-offs explicitly; **derive** the 8 theme and 31 session routes with a two-level walk (copy `recordRoutes()`). `app/sitemap.ts` reads `designRoutePaths()`, so the sitemap follows free. |
| 2 | `data/seo/pages.json` | **42 hand-written entries.** `lib/seo/register.test.ts` asserts `Object.keys(SEO)` **equals** `designRoutes()` exactly. No exemption is available: the two exempt sets are exempt because they *grow on their own*, and 31 sessions is a fixed set. The largest hand cost in the build. |
| 3 | `data/work/onward.json` | Only if a WORK page links a `/teach` route. |
| 4 | `data/work-links.json` | **Derived — never hand-edit.** Written by `build:work`. Editing onward.json and running only your own generator leaves this stale, everything local stays green, and `generated-current.yml` fails on someone else's PR. |
| 5 | `scripts/verify-final.mjs` | Two `{file, why}` entries: `teach.html` and `teach/`. |
| 6 | `build-all.sh` TARGETS + `package.json build:teach` | `lib/publishers.test.ts` fails if a `build:*` exists that `build-all.sh` misses. Insert **after `learn`, before `search`** — `build-search-page.mjs` reads built pages' own `rel=canonical`. |
| 7 | `build-search-page.mjs` `GROUPS` | One line. **Without it, 42 pages file under "Elsewhere" and the build only prints a soft `note`** — the most likely thing to be missed. |

Plus the footer, which is not a registry but behaves like one: it is extracted
from the frozen `design/home.html` by `home.between(...)`. An **insert-only**
diff. The footer markup sits *below* the pinned CSS ranges, so a footer insertion
is safe — but any insertion **above** line 3033 shifts every pinned range and
breaks all generators. Verify with `git diff` that only `+` lines appear.

### `build:teach` runs on five cron publishers a day

So it must be **pure-local and byte-deterministic**: no network fetch, no
timestamp, no directory-order dependence. `build-learn.mjs` is the model —
`readdirSync(...).filter(...).sort()`, where `.sort()` is load-bearing.

### Every list is derived except one

This repo's most-repeated defect is the hand-maintained parallel list that must
move in lockstep and doesn't.

- **Routes** → from built files.
- **The directory and theme cards** → from the same walk that writes the pages,
  plus a post-write gate copying `build-learn.mjs`'s *"the index lists all N"*.
  That gate is what makes the list derived **in fact** rather than in intention.
- **Theme → session membership** → from each session file's own `theme` key.
  `themes/*.json` **must not carry a session list.**
- **Session ↔ explainer edges** → declared once on the session, inverted for the
  Learn side.
- **Search group** → one prefix test, not 42 rows.
- **Social cards and the search index** → already derived; both walk
  `public/_pages/v3/`.
- **The SEO register is the one irreducible list.** Mitigated, not removed:
  `seo()` already throws on a missing route, so a built page without an entry
  stops the build rather than shipping. That is the correct failure.

## `data/` shape

Copy `data/learn/` exactly — flat directories, one file per item.

```
data/teach/index.json                      masthead, families, onward doors
data/teach/themes/<theme>.json             8 — h1, card, frame, printed_as, topics
data/teach/sessions/<theme>/<slug>.json    31 — theme, position, title, topics,
                                           duration_printed, activities[],
                                           related.learn[], source
data/teach/before-you-start.json
data/teach/a-to-z.json
```

Carry **`printed_as`** so a page can state the printed form rather than silently
correcting it: theme 07 is printed *"CHAPTER 5: TREES AND FORESTS"*, and the
contents page says "Climate Justice and Active Citizenship" where the chapter head
says "Climate Change & Active Citizenship".

## Refused

Named so nobody re-proposes them: eight theme colours; any icon or icon set; a
grid of 31 identical cards (it would assert that a 22-line and a 1,394-line
session are the same object); LMS chrome — progress bars, "Module 3 of 8",
completion ticks, enrolment (nobody is enrolled, and it would be the site's first
stateful UI); "Download the manual" as the primary action; any generated or stock
image; scroll-triggered reveals (§7.2 — `.rise` is inert, *"a new page that adds
scroll-triggered reveals is not matching this design; it is replacing it"*); an
auto-advancing carousel (§7.1, ruled no with arithmetic); a hamburger drawer or
modal (§7.11); a session's duration as a `.readout` with a `.rl` rail (the rail
means a measured value against a published limit and turns red when it breaks —
"45–60 minutes" is an author's estimate); inventing a TIME, OBJECTIVE or MATERIALS
for the sessions that lack one (§7.5 — the absent row is the design); normalising
the printed titles; a third typeface; an invented section brand.

**No eighth global nav word.** The nav is seven (Now, Learn, Work, Journeys,
Impact, Farm, About) — `design-routes.ts`'s "closed at six plus the Give chip"
comment is stale, Learn having joined. `/teach` is reached the way
`/healthy-cities`, `/schools`, `/posters` and `/record` are: from `/learn`'s
onward band, from `#workshops` on the hub, from `/schools`, and from the footer
index.

## Open before a line is built

1. **Provenance tracing for 35 activities** (D-51.3). Blocking for those sessions.
2. **The ~43 activity→session mapping** (A-51.5). Blocking for the whole section.
3. **Theme 02 rewritten for India** (D-51.2). Blocking for theme 02 only.
4. **`langar-community-meal.jpg` provenance** — unverified, and this repo has
   shipped synthetic photography by accident before.
5. **42 SEO register entries** will produce near-duplicate descriptions, and the
   register test enforces uniqueness. Budget it as authoring, not build.

## Amendments, 11 September 2026 (same day, after the owner read this record)

Two of the rulings above are superseded. The rest stands.

### D-51.4 — supersedes A-51.1 and A-51.5: the unit is the ACTIVITY

The owner: *"these are session designs etc for teachers and other ngos."* So each
of the **43 activities is one session page**, and the intermediate session layer
from the MODULE SUMMARY tables is dropped. **"31 sessions" above is superseded by
43**, and A-51.5's ~43 activity→session mapping decisions — named there as the
section's real blocker — **no longer exist**. Nothing has to be authored before
the section can be built.

The MODULE SUMMARY tables remain excluded (A-51.4 stands: the OCR is column-bled
and unusable). Route counts become 1 + 8 + 43 + 1 + 1 = **54**, and the SEO
register grows from 42 entries to 54.

### D-51.5 — supersedes D-51.3: publish everything, credit what is credited

The owner: *"dont bother about license etc… Give source credit where its
available. Dont remove anything becausse there is no license or credit etc."*

So the provenance tracing named as blocking for 35 sessions is **not** a
precondition. Every session publishes. Where the manual carries a `Source`,
`SOURCES`, `Resources`, `Online Resources`, `Link` or `Photograph Courtesy` line
it is rendered as the credit; where it carries none, the session publishes without
one. **No content is withheld for want of a credit**, and the derived-licence
mechanism in D-51.3 is not built.

D-51.1 (`/teach`, top-level) and D-51.2 (theme 02 rewritten for India) stand. Note
that D-51.2 concerns the *accuracy* of the air chapter, not its licence, so D-51.5
does not touch it — but "remove nothing" means the chapter publishes with its
British passages intact until someone rewrites them, rather than being held back.

### D-51.6 — it is a compendium, so a theme page is a chapter, not an index

The owner: *"Its a compendium of sorts for teachers, multiple session options on
each themes, along with reading material etc."*

Each chapter's background text — **51 to 134 prose blocks per theme**, sectioned on
the manual's own numbered sub-headings — is the **reading material**, and it
belongs on the theme page. So a theme page is masthead → the reading → the session
options → the `/learn` pairs → sibling themes. This is a change of substance, not
emphasis: the theme page above was specced as an index with a topic line, and it
is now the place a teacher actually reads before choosing a session.

### What was extracted, and the preservation measurement

`data/teach/**`, **54 JSON files**, committed as the source of truth the way
`data/learn/articles/*.json` are. Prose is `[{t,x}]` with `t` of `p` or `li`.

**98.3% of the source chapter text is retained** (61,141 of 62,230 words; the
shortfall is the excluded MODULE SUMMARY tables and the chapter headings). Per
theme, 96.6% to 98.6%. Every labelled block the manual used even once — SAFETY,
RULES OF THE GAME, SCENARIO, PREPARATION, ANSWERS, worksheets — is carried in each
session's `other[]` in document order rather than dropped.

**37 of 43 session titles are the manual's own** ("The Bean Game",
"Not-So-Silly Cilia Game", "Water cycle in a bag!", "Dung Power"). The **6
exceptions are chapter 1's first six**, which the manual leaves untitled; they were
named from their own DESCRIPTION and carry `title_source: "editorial"`, which the
page must disclose. Nothing else on any page is editorial.

334 glossary terms parsed (one more than the 333 first counted). The teacher's
guide resolves to **7 numbered sections**, the manual's own.

## Build state, 11 September 2026

**Done and on disk:**

- `data/teach/**` — 54 JSON files, the extracted compendium. 98.3% of source
  chapter text retained.
- `docs/design/2026-09-11-AD-51-extract-manual.py` + `-emit-data.py` — the
  extractors, committed so the parse is reproducible rather than a one-off. They
  read the PDF text dump, not the PDF; regenerate that with
  `pdftotext -layout "Final BTG MANUAL.docx.pdf" btg.txt`.
- `docs/design/2026-09-11-AD-51-seo-entries.json` — **all 54 SEO register
  entries**, validated against every rule in `lib/seo/register.test.ts`:
  titles ≤60 rendered chars (max 59), descriptions 140–158 (min 140, max 158,
  mean 149), titles/descriptions/indexNames unique, every title head ≥15 chars
  and carrying a term from `TERMS`. Generator:
  `docs/design/2026-09-11-AD-51-emit-seo.py`.

  **★ These are STAGED, not merged, and that is deliberate.**
  `register.test.ts` asserts `Object.keys(SEO)` **equals** `designRoutes()`.
  Merging them into `data/seo/pages.json` before `design-routes.ts` maps the
  routes turns the test red on `main`. **Merge them in the same commit as the
  routes**, never before.

  Three constraints that are not obvious and cost a rewrite each: every title
  head must contain one of the 30 `TERMS` words — "The Bean Game" and "Dung
  Power" both fail on their own, which is why every session title carries "a
  school session"; a description assembled by truncating source prose lands
  inside 140–158 while reading as "...placed in the school compound or.", so
  whole sentences are preferred and trailing function words stripped; and a
  composed tail ("The page lists what you need, every step and points for
  discussion.") must be used **whole or not at all**, with the prefix flexing to
  meet the 18-character window, or it truncates to "...and points."

**Not built yet:** `scripts/build-teach.mjs`, the seven registry edits, the
`/healthy-cities` and `/learn` link edits, and the build verification. The first
attempt at the generator was delegated and returned nothing — it spent its whole
turn budget reading the repo. Nothing of it survives; no branch, no worktree, no
file.

## D-51.2 RESOLVED — theme 02 rewritten for India, 11 September 2026

The air theme's reading material was replaced. What the manual printed taught the
**United Kingdom**: the industrial revolution, the 1952 London smog, *"about 23
million vehicles on the road in Britain"*, with two mentions of India or Delhi in
the whole chapter — plus a paragraph pasted in from an unrelated document
(*"This Proposal Letter serves as an introduction to the themes… during this
Hackathon"*).

The problem was **wider than the two sections first identified.** Sections 3
through 6 explained a **foreign air quality index**. India publishes its own
National AQI through CPCB, whose six band names and breakpoints are not the ones
the manual described, so a student taught from it would have read the wrong band
names off an Indian reading.

### What was replaced, and what was kept

Kept as written, because it is chemistry and true anywhere: the **main pollutants**
section (19 blocks — sulphur dioxide, carbon monoxide, nitrogen oxides, VOCs,
particulates, ozone, CFCs, unburned hydrocarbons, heavy metals) and the note on
**sensitive groups**.

Written by Swechha and marked as ours:

- **What makes the air dirty in India** — burning (transport, coal, biomass in
  kitchens without a gas connection, roadside waste) and the dust that does not
  burn; the two seasonal northern sources; and the fact that **the split between
  them is disputed**, with both government-commissioned studies quoted rather than
  one pie chart published as settled.
- **Why the same air is worse in winter** — the temperature inversion over the
  Indo-Gangetic Plain, and the teaching point that a reading reports two things at
  once: what was emitted, and what the weather did with it.
- **India's Air Quality Index** — the eight pollutants, the 0–500 sub-index per
  pollutant, that the station AQI is the **highest** sub-index and not the average,
  the minimum-three rule, the **six CPCB bands with their real names and ranges**,
  why the bands are deliberately unequal, and the NAAQS 2009 concentration limits.
- **What the index will not tell you** — the `/learn` "what this cannot tell you"
  convention applied to the index itself, ending by sending a teacher to the live
  reading at `/now/air` rather than freezing a number in a teaching document.

### Every figure is verified against committed data, not typed from memory

| Claim | Source in this repo | Checked |
|---|---|---|
| Six band names and ranges | `data/air-delhi.json` `bands` | all six match |
| PM2.5 60/40, PM10 100/60 µg/m³ | `data/air-delhi.json` `limits`, CPCB NAAQS 2009 | match |
| IIT Kanpur vehicles 6–29% of PM2.5 | `data/apportionment-delhi.json` | match |
| TERI-ARAI transport 17–28% dispersion, 18–23% receptor | same | match, both models named |
| Eight pollutants, highest sub-index, minimum-three, population-weighted city figure | `data/learn/articles/cpcb-aqi.json` | match |

**No figure was written that this repository cannot source.** Deliberately absent:
death counts, national vehicle totals, city rankings and "worst in the world"
claims — none of which are sourced in-repo, and none of which the chapter needs.

### Two mechanisms so this does not silently revert

1. **The theme page discloses it.** `themes/*.json` may carry `reading_note`; where
   it does, the generator renders it as a `.cap` under the reading band and the
   band's lead says "what this theme sets out" rather than "what the manual sets
   out". Gate 13 fails a theme that has rewritten reading and does not disclose it
   — the same rule the six editorial titles run under.
2. **The extractor refuses to overwrite it.** `2026-09-11-AD-51-emit-data.py`
   treats the presence of `reading_note` as a flag and preserves the theme file,
   printing `PRESERVED rewritten reading`. Without this, re-running the extractor
   would restore the London smog silently. Gate 12 independently fails any page
   that republishes `vehicles on the road in Britain`, `This Proposal Letter` or
   `this Hackathon` — gated on the **claims**, not the words, because the
   disclosure names the London smog in order to say what was removed.

### Still foreign, and deliberately out of scope

Found while checking; **not** part of this rewrite, and none of it is in theme 02:

- `sustainable-development/the-life-of-a-t-shirt-activity` — UK clothing-waste
  figures (*"PEOPLE IN BRITAIN SEND 11 MILLION ITEMS OF CLOTHING A WEEK TO
  LANDFILL"*).
- `water-water-everywhere/the-ocean-and-plastic-pollution` — *"microplastics in up
  to 80% of mussels taken from British"* waters. Its own source line reads
  *"Contextualized to Indian ocean from here: godinton.kent.sch.uk"*, so it is a
  Kent primary school's worksheet that was half-adapted already.
- `climate-justice/climate-game` and `themes/wasted` reference the US EPA.

`themes/trees-and-forests` calling Kipling a British author is correct and needs
nothing.
