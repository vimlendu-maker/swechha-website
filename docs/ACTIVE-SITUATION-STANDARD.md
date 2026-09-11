# The Active Situation page — content wireframe and standard

**Read this before building, editing or reviewing any `/now/climate-event/<slug>`
page.** It is the settled layout and content contract, derived from the Nepal
GLOF page of 28 August 2026, which is the reference implementation. A new event
should need **no design or layout instruction at all** — only its data.

**The builder already enforces most of this.** `scripts/build-climate-disaster-pages.mjs`
fixes the band order and the ground chain; `scripts/lib/situation-render.mjs`
renders each band and returns `null` when it has nothing to say. Nothing in this
document is a suggestion you implement by hand — it is a description of what the
generator does and of the rules you must not break when extending it.

---

## 1. The band stack

Thirteen bands, in this order. **The order is not negotiable per event**; only
which bands survive is.

```
┌─ top ─────────────── dark ─┐  HERO
│  Kicker: ACTIVE SITUATION · <hazard name>
│  Status dot + one line: what "active" means for this page
│  H1 headline · location_detail · occurred_detail
│  mechanism_stated — the one-line reading of what happened
│  Owner figures, right: the 2–4 numbers a reader must leave with
└────────────────────────────┘
┌─ strip ───────────── dark ─┐  THE READINGS
│  4 live/near-live readings, each with its unit and its source,
│  + "where each one is explained" + a link to every source
└────────────────────────────┘
┌─ explain ─────────── dark ─┐  WHAT IT IS          ← definition before argument
│  H2 "What is a <TERM>"  ·  plain-language explainer, then the technical
│  term, then what it is NOT
└────────────────────────────┘
┌─ climate ─────────── dark ─┐  THE NUMBERS WE CANNOT IGNORE
│  The counted scale of the risk. `band: 'scale'` figures as cards, each
│  with a CLAIM_STATUS word and a named source. Withheld figures listed.
└────────────────────────────┘
┌─ where ───────────── dark ─┐  WHERE
│  Inline SVG map from real coordinates + the downstream chain as an <ol>
│  Caption: what the marked point is, and what it is not
└────────────────────────────┘
┌─ cause ───────────── dark ─┐  WHAT CAUSED IT
│  ≤5 candidate mechanisms, each with the evidence word it has EARNED
│  and, where one exists, the counted figure that makes it plausible
│  <details> "How would we know?" — evidence table + mechanism table
└────────────────────────────┘
┌─ eo ──────────────── dark ─┐  WHAT THE SATELLITE SEES
│  Supplied frames (permission on file) above the public NASA pair
│  Tabs: Before and after | What the frame shows
│  Frame coords · higher-res at its publisher (linked, not reproduced)
│  → Open the live comparison (new tab)
└────────────────────────────┘
┌─ developing ──────── dark ─┐  HOW IT DEVELOPED       ← ≥2 dated entries or absent
└────────────────────────────┘
┌─ pattern ────────── PAPER ─┐  IT HAS HAPPENED BEFORE
│  Precedent cards, authored titles, each with a toll and a date
└────────────────────────────┘
┌─ india ───────────── dark ─┐  THE ALARM FOR INDIA
│  Confirmed impact figures, corridors, and what is being watched
└────────────────────────────┘
┌─ next ────────────── dark ─┐  WHAT HAPPENS NEXT
│  Two horizons. A LEVEL only where a published threshold and a number
│  both exist; everything else is a named watch, ungraded.
└────────────────────────────┘
┌─ sources ────────── PAPER ─┐  DATA AND SOURCES
│  Counted by kind, then listed behind a click. Last changed, and
│  what is not established.
└────────────────────────────┘
┌─ back ────────────── dark ─┐  THIS IS ONE EVENT → the standing situation page
├─ act ─────────────── dark ─┤  Cite · closing · siblings · newsletter   ← PINNED
└────────────────────────────┘
```

**`climate` is third on purpose.** It was tenth. It is the band that answers why
a Nepal event is on an Indian site, so a reader who leaves after two screens has
still had the argument.

**`back` and `act` are pinned last** because of the footer — see the comment at
`build-climate-disaster-pages.mjs:247`.

---


### The detector does not appear on the page (10 September 2026)

The sources band used to print the detector's own name, the score it gave the
event and the publication threshold it was scored against — `assembled …
by scripts/detect-climate-events.mjs, which scored this event 22 against a
publication threshold of 14`. It no longer does, and must not again.

The score and the threshold are still computed, still stored on the event, and
still the basis on which an event is promoted or demoted. They are *how the page
gets decided*, not *what the page says*. A reader cannot open the script, cannot
check the score, and did not ask how the site works; publishing our own
publication gate reads as a machine explaining itself rather than as an
organisation reporting a flood.

`What this page does not know` was renamed `What is not established` in the same
pass, for the same reason: the uncertainty is a property of the evidence, not a
confession about us. The items under it are unchanged and are required.

This is enforced, not merely written down: `scripts/lib/ledger-patterns.mjs`
carries a pattern that refuses to build any page whose reader-visible text names
a `scripts/*.mjs` file, and `lib/provenance.test.ts` re-checks every built page
on disk against the same list.

## 2. Rules that hold for every event

These are load-bearing. Each is enforced in code and each was written after
something went wrong.

| # | Rule | Where |
|---|---|---|
| R1 | **A band with nothing in it does not appear.** Every renderer returns `null` when empty; the band list, the contents index and the ground chain are all derived *after* the filter, so an absent band cannot leave a dead anchor or two identical grounds adjacent. | builder |
| R2 | **The ground chain is computed, not chosen.** The table's ground is a *preference*; what ships is an alternation proved by `groundChain()`. A build printing a clash is a failed build. | builder |
| R3 | **Every figure carries its source and its status word.** No number appears in this site's own voice. `CLAIM_STATUS` is exactly four words: `preliminary` → `media_report` → `official_estimate` → `confirmed`. | `climate-events.mjs:66` |
| R4 | **A card only exists when a number exists.** Never a card with a dash in it. | `situation-render.mjs:112` |
| R5 | **Four evidence words for causes, and "Confirmed" is almost never one of them.** `confirmed` / `likely` / `under_investigation` / `not_established`. | `:555` |
| R6 | **Climate change is not on the cause list and cannot be put on it.** Attribution of a single event is a research programme, not a page section. The larger signal has its own band, which speaks about the *class* of event. | `:561` |
| R7 | **The imagery is on the page or the reason is on the page.** There is no third option, and in particular there is no stock mountain. | `:624` |
| R8 | **A credit line is not a licence.** Commercial high-resolution imagery is linked at its publisher, never reproduced. What is published is imagery whose terms permit it. | `:636` |
| R9 | **A wipe is a claim that the two frames are the same place.** `registered: true` gates the slider; an unregistered pair is shown as two captioned views instead. | `:662` |
| R10 | **Every image on the page is black and white.** One selector — banner, supplied frames, both halves of the wipe. Anything describing colour has to move with it. | `:1358` |
| R11 | **The map plots `downstream`, not the hazard pack's generic `india_path`.** The generic chain once contradicted the map's own caption. | `:369` |
| R12 | **It is explicitly not a map of the event, and the frame says so.** Positions are real coordinates; the extent of the event is not known. | `:351` |
| R13 | **One entry is not a timeline.** Two dated, attributed developments or the band does not exist. | `:831` |
| R14 | **A level is printed only where a published threshold and a number both exist.** Everything else is named as a watch, not graded. | `:937` |
| R15 | **Only published events get a page.** A draft the detector scored is not a route. | builder |

---

## 3. Where the content comes from

Two files per event plus one per hazard. **Prose lives in data, not in the
renderer** — that is what makes a second event free.

| File | Scope | Holds |
|---|---|---|
| `data/climate-events/active/<slug>.json` | **this event** | headline, location, occurred, impact, figures, timeline, sources, coords, downstream, reported_imagery, owner_images, owner_figures |
| `data/climate-events/context/<hazard>.json` | **the hazard**, shared by every event of it | explainer, causes + evidence, mechanism, precedents, figures, what_to_watch, india_corridors, withheld |
| `data/climate-events/imagery/<slug>.json` | **this event** | the chosen NASA frames, the frame box, attribution — written by `fetch-event-imagery.mjs`, not by hand |

**Hazard-level or event-level is a real decision, not a filing preference.** The
explainer, the causes and the mechanism are hazard-level: they are true of every
GLOF, so writing them into one event's dossier means the next event ships
without them. `cause_status` is event-level, because which mechanism is *likely
here* is a fact about this flood.

### Per-band data contract

| Band | Event keys | Hazard-pack keys | Absent when |
|---|---|---|---|
| `top` | `hazard`, `headline`, `location(_detail)`, `occurred(_detail)`, `mechanism_stated`, `impact`, `owner_figures` | — | never |
| `strip` | `corroboration`, `live_conditions` | `figures` | never (empty slots are rendered) |
| `explain` | — | `explainer.{term,heading,hook,plain,technical,not,expands}` | no `plain` |
| `climate` | — | `figures` (`band:'scale'`), `summary`, `cascade`, `withheld` | no figures |
| `where` | `coords`, `coords_note`, `downstream`, `downstream_note`, `india_relevance(_note)` | `downstream` | never — without coords the **map** is dropped, the band stays |
| `cause` | `cause_status` | `causes[].{id,label,short,evidence}`, `mechanism`, `figures` (`supports`) | no causes |
| `eo` | `reported_imagery`, `owner_images` | — | never — with no frames it renders the *reason* instead (R7) |
| `developing` | `timeline` | — | fewer than 2 real entries |
| `pattern` | — | `precedents[].{card,when,what,toll}`, `not_counted` | no precedents |
| `india` | `impact` | `figures` (`band:'india'`), `india_corridors`, `india_watch` | nothing confirmed |
| `next` | `live_conditions` | `what_to_watch[].{what,why}`, `what_later` | no rain, watch or later |
| `sources` | `detector`, `sources`, `corroboration`, `uncertain`, `significance_score`, `last_checked` | — | never |

**A figure's `supports` names a cause id.** That is how a counted thing gets
attached to the mechanism it makes plausible, and why neither side can drift.

---

## 4. The copy standard on these pages

Follows the site-wide copy brief, with three additions the Situations sections
have earned:

- **Attribution stays.** Who holds the imagery, who published the report, which
  agency counted the number. This is the one place the copy brief says to keep
  it rather than cut it.
- **Provenance of *permission* does not go under the picture.** Who granted it
  and on what date is recorded in the dossier for a reviewer; the caption
  carries the credit and nothing more.
- **Subtract before you rewrite, and prefer a structural fix to a paragraph.**
  The "these are not a before and after" paragraph was deleted by relabelling
  the two frames "The valley" and "The debris field" — the page then makes no
  claim that needs explaining away. Captions are capped hard: the EO band's
  running prose is **under fifty words in total**.
- **No paragraph about the page.** Corrections belong in git history. A note
  saying the page previously had something wrong is a paragraph about the page
  rather than about the river.

---

## 5. Adding a new active situation

1. The detector writes `data/climate-events/active/<slug>.json`. Set
   `publish_state` — nothing renders until it is published.
2. If the hazard is new, write `data/climate-events/context/<hazard>.json`
   **first**. Every band except the hero degrades without it, and it is written
   once for all future events of that kind. Check the hazard is inside the scope
   boundary at `climate-events.mjs:73`.
3. `npm run data:event-imagery` — the NASA ladder. If it finds nothing it writes
   the *reason*, and the reason is what renders (R7).
4. Supplied imagery: commit the files, then name them in `owner_images`. A file
   named but not committed renders nothing rather than a broken tag. Set
   `registered: true` only if the two frames are genuinely the same box (R9).
5. `npm run build:climate-disasters`.
6. Lifecycle is one field, `situation_status`: `developing` → `stabilising` →
   `demoted` / `archived`. The build prints the ladder every time.

### Gates that must be green before it ships

```bash
npm test && npm run build:situations
```

- `0 ground clash(es)` on every page — R2.
- `page script (all of it): node --check PASSED` — a stray backtick in a comment
  inside `AS_CSS`/`AS_JS` closes the template literal and turns the next
  selector into a function call.
- The **data fidelity gate** in CI is fatal only for commits that do not touch
  `scripts/`. A deliberate schema change needs the script change in the same
  commit, and a reorder has been misread as a deletion before — check the
  committed file before believing it.
- `swechha.in` is behind a Vercel security checkpoint and returns 403 to `curl`;
  preview URLs are SSO-gated. Verify a deploy by the commit status
  (`gh api repos/<owner>/<repo>/commits/<sha>/status`), and say what was and was
  not checked.

## 6. Taking one down

These pages **publish themselves**. The detector runs ten times a day and
`publishable()` is purely mechanical — the score clears the threshold AND the
event is corroborated, by eight independent publishers or by four plus a
matching official alert. Nobody approves a page before it goes live. That is
the design: a disaster reported at noon reaches the site the same afternoon,
and waiting for a person would have meant waiting for a person.

The counterweight is **withdrawal**, and it is yours alone:

```bash
node scripts/situation.mjs list
node scripts/situation.mjs withdraw <slug> --why "your reason"
npm run build:all && git add -A && git commit -m "data(climate-event): withdraw <slug>" && git push
```

Four things worth knowing before you use it.

**It is permanent.** `withdrawn` outranks the detector and no later run can
overturn it. Setting a page back to `draft` would NOT hold — the next run that
found it publishable would publish it again, which is exactly why the state
exists. This was learned on 9 September 2026, when eight published events
needed taking down: places read off a publisher's masthead, one flood filed as
a landslide, and two stories that were an explainer and an opinion piece.

**The reason is required, and it is the point.** `withdrawn_why` is the only
record of why a public page about a disaster came down. The tool refuses
without it.

**It is not deletion.** The dossier, its sources and its score all stay on
disk. A page that vanished without trace would leave the next reader — and the
next run — unable to tell a considered decision from a bug.

**There is no restore command.** Undoing a human judgement is a person editing
the file back, which is the correct amount of friction.

Publication also **latches**: an event that ever cleared the bar stays
published even as coverage decays, so a quiet news day cannot 404 a live
disaster page. `situation.mjs list` flags any published page now scoring below
the threshold. That is not a bug, and it is the most likely reason you would
reach for this tool.

**No agent can do any of this.** `situation.mjs` writes `data/**`, which is
`never_touch` in `docs/website-team/policy.json` and refused outright by
`guard-paths.sh`; it appears in no allowlist. The department publishes these
pages, so it is the thing being overruled — an agent that could withdraw a page
could withdraw the evidence of its own mistake.
