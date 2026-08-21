# The WORK section data contract

Fixed by the lead so the content and the generator can be built in parallel without
either guessing at the other. **This file is the interface. Neither side changes it
unilaterally** — a field that turns out to be wrong gets raised, not quietly renamed.

One file per item: **`data/work/<kind>/<slug>.json`**, where `<kind>` is `projects`,
`campaigns`, `journeys` or `events`. Plus **`data/work/kinds.json`** for the four kind
definitions and **`data/work/onward.json`** for the cross-sell resolution table.

The generator asserts the shape of every file it reads and **refuses to write on a
failure** — a missing `source` on a figure is a build error, not a warning.

---

## 1. Every item

```json
{
  "slug": "eco-action",
  "kind": "projects",
  "name": "Eco Action",
  "page": true,
  "anchor": "eco-action",

  "line": "Over 70 butterfly parks and over 20 herb gardens across Delhi NCR.",
  "deck": "Written. One or two sentences. The register, not a summary.",

  "figures": [
    { "value": "70+", "label": "Butterfly parks across Delhi NCR",
      "period": "since 2010", "basis": "counted", "source": "SOURCE-FACTS §54" }
  ],

  "how":   [ { "h": "Written heading", "p": "Written body. Sourced facts only." } ],
  "done":  [ { "h": "Written heading", "p": "..." } ],
  "with":  { "schools": [], "partners": [], "funders": [] },

  "holes": [
    { "what": "No photograph of a butterfly park exists in the library.",
      "unlocks": "Three frames would let this page open on its own work." }
  ],

  "frame": null,
  "situation": null,
  "act":   { "label": "Bring your school", "href": "/act" }
}
```

**`page`** — `true` means an item page is generated at `/work/<kind>/<slug>`; `false`
means it is a row on the kind landing page and `anchor` is where it lives. This is the
AD-17 §3 ruling, encoded, and it is the **single switch** that decides it. Nothing else
in the build branches on page-versus-row.

**`anchor`** — required on every item, `page` or not. A row's inbound links use
`/work/<kind>#<anchor>`; a page's anchor is still registered so band-level deep links
resolve. Anchor ids are globally unique across the section, checked at build.

**`figures[]`** — the honesty core, and every field is required:
- `value` is a string, never a number — `"70+"`, `"100–150"`, `"3,000+"` — so no locale
  formatter can silently change it.
- `period` names the span the figure counts. **A figure with no period is a build
  error.** This is the defect the frozen homepage fixed by hand on Bridge the Gap.
- `basis` is `"counted"` or `"modelled"`, and it drives the rule under the numeral —
  solid for counted, dotted for modelled (BRANDING §4.3, costs no height).
- `source` cites the authority: `"SOURCE-FACTS §NN"`, `"owner 2026-08-21"`, or
  `"DECISIONS D-NN.N"`. **No other value is accepted.** A figure whose source is a
  pre-freeze prototype does not exist.

**`holes[]`** — named holes are content (BRANDING §4.4). `what` is stated on the page in
the frozen grammar; `unlocks` is for the owner's list and is **not rendered**.

**`frame`** — `null` where there is no usable photograph, which selects the type-only
masthead (AD-17 §5D). Otherwise:
```json
{ "src": "/images/photos/x.jpg", "alt": "From the library entry, never invented",
  "baked": false, "placeholder": false }
```
Gates, all three enforced at build: the file must exist on disk; it must have an entry in
`content/photo-library.json`; and it must not be one of the four consent-unresolved
frames of identifiable children. **`baked: true` frames take no filter class.**
`placeholder: true` applies the full AD-17 §8 placeholder treatment — `.duo-dim`, hatch,
dotted outline, `PLACEHOLDER` chip, and the ~60px floor below which the frame does not
render and the gap is stated in words.

**`situation`** — a slug from the verified list only: `air`, `yamuna`, `forest-loss`.
`null` where no situation names this subject. **An absent relationship renders no slot and
is not a hole.**

**`act`** — slot 4 of the cross-sell band. `href` must resolve; `/act` is the fallback.

## 2. Journeys carry three more fields

```json
{ "duration": { "value": "12", "unit": "days", "rank": 34 },
  "geography": "Yamunotri to Agra · 1,000 km",
  "route": [ { "stop": "Yamunotri", "note": "" } ]
}
```
`rank` is the flex-grow width factor from frozen band 5 — 34 / 25 / 22 / 19, narrowest
0.56 of widest. Reuse those four values; do not re-derive them. **`route` is optional and
currently unsourced for Yamuna Yatra** (ledger hole 12) — if it is absent the page must
not draw a route, and the band that would have held it is not rendered.

## 3. Events are deliberately thinner

```json
{ "slug": "yamunotsav", "kind": "events", "name": "Yamunotsav", "page": false,
  "anchor": "yamunotsav",
  "gathering": "One written line saying what kind of gathering this is.",
  "figures": [], "holes": [] }
```
**No `date`, `edition`, `year` or `count` field exists in this schema for events, on
purpose.** All four events are name-only in the ledger; a field for a date invites one to
be invented. `gathering` is written copy under the AD-17 §8 licence and must not imply a
schedule. Events never have `page: true` — the generator rejects it.

## 4. `kinds.json` and `onward.json`

`kinds.json` — the four kinds in the frozen homepage's order (projects, campaigns,
journeys, events), each with `name`, `line` (the frozen band 4 copy, reused verbatim),
`frame_line` (written: what this kind is and what distinguishes it from the other three),
and `act`.

`onward.json` — the resolution table for the cross-sell band: the route map every `href`
is checked against, the anchor registry, and the three permitted situation pairings. The
generator emits `LINKS.json` — every href it wrote — and **fails if any href is absent
from the route map or the anchor registry, or is `#`.**

## 5. What the generator must reject, not warn about

1. A figure with no `period`, or a `source` outside the three accepted forms.
2. `page: true` on an event, or on any item AD-17 §3 ruled a row.
3. A `frame` whose file is missing, unentered in the photo library, or consent-flagged.
4. A `situation` outside `air` / `yamuna` / `forest-loss`.
5. Any href that is `#`, a `/design/` path, or absent from the route map.
6. A duplicate `anchor` anywhere in the section.
7. Two adjacent bands sharing a ground, **checked on composited rendered colour.**
8. `node --check` failure on the assembled page script.

Numbers 1 and 5 are the two that would otherwise ship a lie. They are the reason this is
a generator and not thirteen hand-written files.

---

# Addendum — eight rulings by the lead, 21 August

Raised by the content author on delivery. Each one either blocks the generator or would
otherwise be resolved differently by two people. **These amend the contract above.**

### 1. AD-17 §8.3 stays HARD. The type-only masthead stands.

The refusal — *no frame the homepage is simultaneously presenting as an empty archive
box* — removes twelve further frames, leaving **35 of 89 usable**, and it costs ME to WE
and Monsoon Wooding their only candidate photographs.

**Kept as written anyway**, for two reasons. The type-only masthead is not a fallback: it
is a designed component (§5D) that reads deliberately, so the cost of the refusal is
close to zero. And the specific frames it would license are not neutral —
`children-certificates-field` shows identifiable children, and the consent flags in
`photo-library.json` cover four named frames rather than a cleared policy for the rest.
Reaching for a frame of children to fill a masthead, on a page about children, while a
consent question is open on four sibling frames, is the wrong trade.

**ME to WE takes a photograph the moment a Jagdamba frame exists with a library entry.**
Recorded as a hole, not a refusal.

### 2. Situation links: seven enumerated exemptions, plus a canonical mapping.

The conflict is real and I created it. §5 clause 5 rejects `/design/` paths; the only
situation pages that exist are `public/design/v3/situation-*.html`, and **the frozen
homepage already links to exactly those paths**.

**Ruling:** the gate keeps rejecting `/design/` paths, with a closed exemption list of
**seven filenames** — `situation-{air,yamuna,heatwave,forest-fire,forest-loss,
climate-event,soon}.html`. Nothing else is exempt, and the list is enumerated in the
generator rather than pattern-matched, so an eighth cannot be added by accident.

`LINKS.json` records the **canonical** destination beside the working one —
`/situations/<slug>` — so the port is a table lookup and not a re-derivation. The
canonical route does not exist yet; that is stated, not hidden.

### 3. Two contract additions, both accepted.

- **`onward.json` gains an `evidence` map.** Slot 3 is `/#farm` for items whose work
  happens at the farm — `farm-school` is the only one — and `/#record` for the rest. It is
  a content fact and no item field carried it.
- **`kinds.json` gains an optional `frame`**, same three gates, `null` permitted. With the
  gates applied, expect most kind landings to take the type-only masthead. That is the
  same ruling as §1 and it is consistent: no kind landing gets a stock or unentered frame
  to avoid a bare band.

### 4. A figure whose source carries no span states the absence. Rendering tightened.

Eight figures carry `"cumulative, no start year sourced"` and one `"period not sourced"`.
The author's choice is right — the schema forbids a *missing* period precisely so that an
unknown span is stated rather than invented.

**But it renders eight times, so it renders short.** The generator sets it in the
absence grammar, not as a period label: `cumulative · start year not sourced`. Same
meaning, and it stops a long apologetic clause repeating down the page.

### 5. An empty `with` does not render its band.

Three of the eight pages name nobody — `gram-anubhav`, `cityscapes`, `farm-school`.
**Band 5 is omitted entirely when `with` is empty**, per the standing rule that a
container with nothing in it is hidden and the gap is stated in words. Two of the three
already name it as a hole in `done`; the third should.

### 6. NatureScapes keeps its page, and its route band stops inferring.

The author put honest evidence against `page: true` — one figure, one `done` entry, no
photograph, two school names — and what carries the page is the six-destination route
band. **Which is also the band whose content is partly inferred:** §159 names four
ecosystems and six destinations but pairs only two of them explicitly.

**A band that carries a page may not be the band that guesses.** So: the route band lists
**the six destinations plainly and the four ecosystems as a separate sourced set, with no
pairing between them.** Sariska/Ranthambore/Corbett → Forest and Sunderbans → Marine come
out — they were a reading, not a source statement.

The page survives, the inference does not, and the pairing becomes a one-line question for
the owner. If he pairs them, the band gets richer with no rebuild.

### 7. Events may carry an optional `situation`.

Permitted where the §4 pairing table allows it — `yamuna-shramdaan → yamuna`. §3's key set
is a minimum, not an exact match. The generator must not assert an exact key set on
events.

### 8. What the author refused to invent is the model, not an exception.

Recorded because it will come up again: empty `figures`, empty `how` and empty `done` on
`delhi-i-cant-see-you` is **correct output**, not incomplete work. The file is two holes
and a deck because that is what the sources support. A generator that treats an empty
array as an error would have forced a fabrication.

---

# Amendment — AD-18, 21 August

**Why this amendment exists.** The client rejected the fifteen built pages on design and
content depth, and one sentence of his note is a schema problem rather than a design one:

> "each program looks incomplete. It should have — What we do (desription of the
> project/campaign/journey), What we tend to achieve (Objectives), Strategy/Activities, For
> Who, Impact, Come Partner/Volunteer/Contact Us."

The contract above can express **what we do** (`line`, `deck`, `figures`), **strategy**
(`how`) and **impact** (`done`, `holes`). It has no field for **objectives**, none for **for
who**, none for the named activities inside a strategy, and none for a photograph anywhere
except the masthead. Six of his six parts cannot be authored, so the pages could not carry
them, so each programme did look incomplete.

Two further notes of his are also schema problems: *"There is no use of photos, hardly"*
(there is exactly one frame field per item, and it is the masthead) and *"this use of blck
abnd white blocks is getting to make pages boring"* (nothing in the contract can produce
the frozen homepage's one non-rectangular band).

**Everything below is additive.** No existing field changes meaning, no existing file
becomes invalid, and every new field is optional. **An absent field omits its band and the
build names the gap in its report** — it never renders an empty band, because an empty band
is exactly how a page comes to look incomplete.

---

## A1. `aims[]` — what it sets out to achieve

```json
"aims": [
  { "h": "Written heading", "p": "Written body.", "cap": "optional source line" }
]
```

The client's second part, and it is **objectives, not outcomes** — what the programme sets
out to do, stated the way it would be stated to a school or a funder. Outcomes are `done`,
three bands further down, and the two must not be written as each other.

- `h` and `p` are both **required** on every entry. An objective with a heading and no body
  is a slogan.
- `cap` is optional and carries a source **where the objective is quoted rather than
  written** — a funder's own wording, a proposal, an owner ruling. An objective we wrote
  ourselves needs no source and must not be given a fake one.
- Prose is scanned for tense and month names, like every other narrative field.
- **Absent → band `aim` is omitted and the gap is named.**

Renders as Air's `.p-do-r` ruled row (heading, body, caption), on the ground the assigner
gives the band. Budget at 375: 88px tier + 130.4px opener + about 160px a row. **Three rows
is 866.8px measured. Four does not fit and the fourth goes into the disclosure.**

## A2. `who[]` — who it is for

```json
"who": [ { "h": "Written heading", "p": "Written body.", "cap": "optional" } ]
```

Identical shape to `aims`, deliberately: one field validator, one component, one budget.
The client's fourth part.

**The rule that makes this field worth having rather than decorative:** *named, not
described as a category.* "Schools" is not an audience; "Class 8 to 12 in Delhi
government schools, where the module has to fit a 40-minute period" is. And where a group is
on the list **because they asked** rather than because we chose them, say so — that is the
most interesting thing a for-who band can carry and it cannot be inferred from anything else
in the data.

**Absent → band `who` is omitted and the gap is named.**

## A3. `activities[]` — the named things that actually happen

```json
"activities": [
  { "name": "Yamuna walk", "p": "Written body.", "cap": "optional",
    "frame": { "src": "...", "alt": "..." } }
]
```

The client's third part is *Strategy/Activities* — two things, and the contract only had the
first. `how` is the **method**; `activities` are the **named items** inside it: the six
CityScapes walks, the five Gram Anubhav regions, the four things that happen on every
NatureScapes journey. The pre-freeze prototypes carried exactly this set under the heading
*"What we do."* and it is the strongest unused content in the section.

- `name` and `p` required. `cap` optional.
- **`frame` is optional and this is where most of the section's photography now lives.** It
  runs the same three gates as any other frame (see A6).
- **A set of one is rejected.** The band renders the set as an ARIA tab group and a tab
  group of one is a control with nothing to choose, which costs 44px to say. One activity is
  prose and belongs in `how`.
- **Absent → the `how` band renders `how` alone**, as it does today. Both absent → the band
  is omitted and the gap is named.

**Why it is tabs, and why that is the photography budget.** A tab group is only as tall as
its tallest panel, so six destination frames enter the document for the height of one.
Measured: `journeys/naturescapes`'s `how` band was **1,302.2px** at 375 carrying prose and a
six-row route register stacked; folding both into panels of one group, **plus six
photographs**, brings it to **1,047.5px**. CityScapes: **1,285.9 → 959.8**. The photograph
count goes up and the band gets shorter.

## A4. `gallery[]` — the contact sheet

```json
"gallery": [ { "src": "...", "alt": "...", "op": "50% 40%", "dim": false } ]
```

An array of frames, rendered as the frozen archive contact sheet (BRANDING §4.4) re-scoped
to three columns, two below 520. **This is the single field that answers "There is no use of
photos, hardly"**: measured counts per page were 0 or 1 real photograph against the
prototypes' 9 to 15, and a six-frame sheet costs about **340px at 375** and about **636px at
1440**.

- **Floor of three.** Below three it is not a sheet, it is a thumbnail somebody forgot to
  caption, so the band does not render and the gap is named. A gallery of one or two is
  **rejected**, not silently dropped — it means somebody meant to add more.
- **Prefer multiples of three.** Four frames make a row of three and a row of one.
- `op` sets `object-position` per frame where the subject is not centred.
- `dim: true` takes the `.duo-dim` ramp instead of `.duo`.
- **No frame appears twice on one page** — rejected, across `frame`, `statement.frame`,
  `activities[].frame` and `gallery[]` together.
- **There is no year chip and no date anywhere in this component.** The frozen sheet's chip
  marks *an unscanned year* (§4.4) and no WORK frame has a sourced date. The frame's `alt`
  carries what it shows; nothing claims when.

`gallery_note` (optional, string) overrides the sheet's note. **The note is not decorative
and is never empty:** a sheet with no note is a mood board. Where the frames are ours but
are *not of this programme*, the note says so — W-9's rule, that alt describes what a frame
shows and never claims what it stands in for.

## A5. `statement` — one display line beside a photograph

```json
"statement": {
  "line": "One river taught us<br>every thing else.",
  "under": "Optional micro-caps line.",
  "frame": { "src": "...", "alt": "..." }
}
```

**This is the field that answers the owner's sharpest note** — *"this use of blck abnd white
blocks is getting to make pages boring."* It renders the frozen homepage's own band 3
(`#say`): a photograph running to the seam on the right half, one display line on the left,
no opener, no rule, no list and no CTA. It is the only band shape in the language whose
whole job is to stop the scroll, and it is the one thing in the chain that does not read as a
rectangle of ground with content inside it.

- **`line` and `frame` are both required, or the field is rejected.** The band without its
  photograph is a heading on an empty ground, which is the flat block it exists to break.
- **No digits in `line`.** A statement band has room for no unit, no period, no basis and no
  source, so a figure in it could not be a reading (BRANDING §3.4) — and a numeral that is
  not a reading is the one thing this site does not print. **Rejected**, because this is the
  most tempting place on the page to put one.
- **64 characters maximum**, and **no single word over 11.** The second limit is
  arithmetic, not taste: the band's type column measures **558.0px at 1440 and at 1920**,
  `--t-d1` caps at 104px, and Archivo 68/850 uppercase measures **49px a character** there —
  so 11.4 characters is the ceiling and a longer word **crosses the seam into the
  photograph**. A single word cannot wrap and the band clips its own overflow, so no
  contrast, height, overflow or adjacency check can see it. It was found by reading a PNG.
- `<br>` is permitted and encouraged: the frozen band hand-breaks its three lines.
- **The copy makes no new claim.** It is written from what the item already publishes — the
  source's own phrase, its X-is-not-Y grammar, or a named hole.
- **Absent → band `statement` is omitted and the gap is named.**

## A6. Every frame field runs the same three gates

`frame`, `statement.frame`, `activities[].frame` and `gallery[]` are all checked identically:

1. the file exists on disk;
2. it has an entry in `content/photo-library.json`;
3. its library entry is not `stock: true` (W-11 — stock is refused **by flag** now, so an
   un-catalogued Swechha original and a bought frame are no longer indistinguishable);
4. `alt` is present, and it describes **what the frame shows**, never what it stands in for.

`CONSENT_FLAGGED` is permanently `[]` (W-14, owner's express instruction) and the gate stays
wired so re-imposing a bar costs one line.

**`baked` IS WITHDRAWN (W-19).** The field claimed a frame arrived with colour baked in and
must therefore take no ramp; the generator obeyed it, and three pages shipped selective
colour — `/work/projects/farm-school` ran a full-colour field of yellow amaltas blossom
1440×370 directly under the mustard GIVE chip, against BRANDING §7.3 (*"selective colour …
retired … hue lives only in type, data, marks and controls"*) and §1.1's one-mustard-field
rule. **The frozen homepage settles it: it applies `.duo` or `.duo-dim` to eleven frames the
library marks `baked: true`.** BRANDING's own preamble — where a spec and the built page
disagree, the page wins and the spec is flagged. So `baked` is a note about the source file,
not a licence for the page. **The renderer ignores it entirely; a stale `baked: true` cannot
change a pixel, and the build reports it once per frame as a field to delete.**

## A7. `scale[]` — a published span, set as a span

```json
"scale": [ { "figure": 0, "low": 100, "high": 150, "label": "optional" } ]
```

The "play with numbers" field, and **it is structurally incapable of introducing one.**
Several of this section's figures are already spans — `"100–150"`, `"2–5"`, `"5 to 16"` —
and every one was being set as a single string, so the span did nothing.

- `figure` is the **index of one of this item's own figures**. Not a value, an index.
- `low` and `high` are numbers, and **both must appear verbatim inside that figure's own
  `value` string** — `"100–150"` yields 100 and 150 and nothing else. **Rejected otherwise.**
  So a scale can only ever redraw a number the page already publishes with a period, a basis
  and a source.
- `high` must exceed `low`.
- The bar's geometry is derived from the two endpoints against the set's own maximum. **No
  derived number is printed** — only a length.

Renders as Air's `.p-rg` range row with end caps and an axis.

## A8. `invite` — the third route

```json
"invite": { "second": { "label": "Partner with us", "href": "/about" }, "note": "..." }
```

The client's sixth part is *Come Partner / Volunteer / Contact Us* — three routes, where
AD-17 §4 slot 4 gave the band one act. Optional; both defaults are sensible.

**Three routes descend through the CTA family rather than repeating one level of it**
(BRANDING §5.8): one `.b-1` (the `act`, and the band's only primary), one `.act` standalone
action link (`invite.second`), and the third as an inline `.lk` inside the note — because the
third route is an email address and an email address set as a button pretends a form exists.
The address is **read out of the frozen footer**, never typed.

`/act`'s volunteer sign-up is "not connected yet" and its newsletter input is disabled by
design (W-7), so **nothing in this band may imply a mechanism.** The mailto is the only route
on this site that reaches a person, and the note says so.

## A9. Events: `when` and `belongs_to`

`when` is specified at W-15 and implemented; `belongs_to` is new here.

```json
"belongs_to": "we-for-yamuna"
```

Owner: *"Event can be part of campaigns as well as Projects."* The four kinds are not four
silos.

- **Events only.** `belongs_to` on a project or a campaign is rejected — making a project a
  child of a campaign is a change to AD-17 §3's architecture, not a data field.
- The value must be the slug of a **real campaign or project** in `data/work/`. **Rejected
  otherwise**: a parent is named or it is absent, never guessed.
- **No event gets an invented parent.** An absent relationship renders no slot and is not a
  hole — the same rule the contract already sets for `situation`.

Where it renders: the event's row on `/work/events` takes the licensed inline cross-sell
hook (*"Part of We for Yamuna →"*), and on the parent's own item page the event takes **slot
1 of the cross-sell band**, ahead of a same-kind sibling — because an event under this work
is nearer than another project.

**A parent outranks a situation and only one hook renders.** "This happens under We for
Yamuna" is a fact about our own work; "runs against the Yamuna" is a fact about the world.
The nearer relationship goes first, which is the ordering rule the whole cross-sell band
already uses, and two hooks above one name is the duplication AD-02 spent a review removing.

## A10. `kinds.json` and `onward.json`

`kinds.json` entries gain the optional **`statement`** and **`gallery`**, same shapes and
same gates. (`frame` was already permitted by addendum §3.)

`onward.json` gains an optional **`index`** block carrying `/work`'s own three:

```json
"index": { "frame": {...}, "statement": {...}, "gallery": [...] }
```

`/work` is not an item, so its frames cannot live in an item file. **This block is validated
exactly like any other subject** — and the first build of this amendment validated the item
files and the kinds and skipped it, which is precisely how the index shipped a ten-character
statement word that overran its photograph by 2.9px at 1440 and 31.7px at 1920.

## A11. What the generator rejects, added to §5's eight

9. A frame in `activities[]` or `gallery[]` failing any of A6's gates, or repeated within one
   page.
10. A `gallery` of one or two frames (floor of three).
11. A `scale` whose `low` or `high` does not appear inside the named figure's own `value`,
    or whose `figure` is not an index into this item's `figures`.
12. A `statement` missing `line` or `frame`; a `statement.line` containing a digit; over 64
    characters; or containing a word of more than 11.
13. `belongs_to` on a non-event, or naming a slug that is not a real campaign or project.
14. An `activities` set of exactly one.

**Numbers 11 and 12 are the two that would otherwise ship a lie or a broken frame**, and
both are the reason these are gates rather than guidance.

---

## A12. Where the content stands, and what each field unlocks

Read off the build's own report, not asserted. **Landings are populated; item pages are
not.** Every one of these is a named hole, printed by `npm run build:work` on every run.

| field | populated | what it unlocks |
|---|---|---|
| `frame` (masthead) | 4 kinds + 5 items | — |
| `statement` | **4 kinds + `/work`** | the band that breaks the block stack |
| `gallery` | **4 kinds + `/work`** | 5–7 photographs a landing page |
| `aims` | **none** | the `aim` band on ten item pages |
| `who` | **none** | the `who` band on ten item pages |
| `activities` | **none** | 4–6 photographs and a tab group per item page |
| `gallery` on items | **none** | 3–6 photographs per item page |
| `scale` | **none** | the range row; `bridge-the-gap` figure 0 is `"100–150"` and ready |
| `belongs_to` | **none** | Yamuna Shramdaan → `we-for-yamuna` is the obvious first one |

**The frame allocation is art direction and it is already decided** — see
`2026-08-21-AD-18-work-redesign.md` §6 for the exact file list per page, so populating
`gallery` and `activities[].frame` is transcription rather than judgement.
