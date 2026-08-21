# Resume here — Swechha website, 21 August 2026

Written at the end of the session that froze the homepage. **This is the only file a new
session needs to open first.** Everything below is either true as of commit `3ca9762` or
flagged as open.

## Where the work stands

**The homepage is APPROVED and FROZEN.** `public/design/v3/home.html` is the single source
of truth for the visual language. It is on `main` (PR #3, merge `38fe66f`) plus three
follow-up commits on `feat/homepage-hero-situation-work`.

Measured, and reproducible with the harness below: **10,282px at 375 · 10,852px at 1440**,
thirteen `<section>` bands plus footer, no two adjacent bands sharing a ground,
`scrollWidth === width` from 320 to 1920, console clean, no control under 24px, every
anchor landing within half a pixel of the header on both the cold-hash and same-page-click
paths. `record` is the one band over the 900px phone cap at 1,393.5px, **licensed by name**
(D-09.7).

## Read in this order

1. **`DECISIONS-2026-08-20-homepage.md`** — every client ruling, D-01 → D-10.4. The last
   three sections are the freeze and the situation-page phase. This file wins over any
   other document, including this one.
2. **`BRANDING-2026-08-21-frozen-language.md`** — the design language as actually built:
   tokens with measured contrast on each ground, the type scale at real widths, the grammar
   that carries meaning, the honesty vocabulary, fifteen solved components, the floors, and
   what is forbidden. **Build every new page from this.**
3. **`2026-08-21-SOURCE-FACTS.md`** — every figure and fact on the site, with its source.
   Nothing goes on a page unless it is checkable here or the owner has just said it.
4. **`2026-08-21-SITUATION-PAGE-BRIEF.md`** — the brief for the next piece of work.
5. The pass records, only if you need the reasoning: `AD-07` (work chapter), `AD-08` (why
   the deck does not auto-advance), `AD-09` (final visual pass + freeze + post-freeze
   fixes), `AD-11` (dead-code sweep), `AD-12` (liveness pass).

## The next piece of work

**The first situation page: Air.** Ruled: a **rebuilt shell** taking the frozen page's
token and chrome layer verbatim, then re-flowing the existing content (D-10.3) — not a
retrofit of `situation-air.html`, which is a pre-freeze fork with ~40 drifts and an open
drift set. Its content architecture is good and should survive: the six-question spine, the
feed inventory, the honest forecast empty state, the method table. Its `<h1>` must be a
**constant naming the subject**, not a reading (D-10.2).

## Five rulings the owner has not yet given

1. **Nine situations versus the frozen six on `intelligence.html`.** Untouched. The extras
   are that page's own demonstration material — `h-noise` exists to show DEMO DATA,
   `h-heat` to show OUT OF SEASON — so cutting to six may cost the page its vocabulary demo.
2. **The `+3` "change since yesterday" tile** on `intelligence.html` — a change figure needs
   two reads and there have been none. It now sits two tiles from "0 Live feeds".
3. **The ticker's "Today's readings"** heading and `aria-label` still date the strip to today.
4. **"Updated every hour"** on a Record door — the only eyebrow in the present tense.
5. **PERIODIC describes the mechanism, not the value.** Today's periodic values are still
   sample data. Per-reading honesty about the value would put all four slides on DEMO DATA
   until the first real bulletin entry.

## Things that will bite you

- **There is no live data anywhere in this repository.** No HTTP client, no OpenAQ, no
  FIRMS; runtime deps are `gray-matter`, `marked`, `next`, `react`, `react-dom`, `zod`.
  Live feeds were an architecture ruling on 18 August, never a build. **No reading may
  carry LIVE** (D-10.1); the only LIVE left in the project is two vocabulary specimens in
  `system.html`, which say so on the page.
- **Every page carries its own `<style>`. A fix does not propagate.** That is why
  `situation-air.html` still holds three defects the homepage cured. Each new page needs its
  own audit against the branding document.
- **Seven backend fields the design depends on do not exist** in `lib/content/schemas.ts`:
  a stored `limit`, `windowStart`/`windowEnd`/`recursAnnually`, the rotating Impact slot,
  and the situation on/off override. Listed in the situation-page brief.
- **`public/design/` is working material and is deleted before any deploy.** It is 1.4MB;
  `docs/design/img/` (144MB of review captures) is gitignored, not committed.
- **~165 legacy WordPress redirects** are still an empty array in `redirects.ts`. Launch
  blocker.
- The `journeys-*` and `project-*` detail designs look like dead prototypes but are the
  only designs for the routes the frozen homepage's buttons point at. **Do not delete them.**
  She Leads Change, Food systems and CityScapes contradict the frozen homepage; the homepage
  is authoritative (D-10.4) and CityScapes now carries a demo stamp.

## How to look at it

Dev server serves `public/` at the root. Start it from `.claude/launch.json`
(`swechha-website`, port 3000) — never with a bare shell command.

| | |
|---|---|
| Homepage (frozen) | `/design/v3/home.html` |
| Phone harness — widths, heights, fold line at 635, band stepper, live readout | `/design/v3/_mobile.html` |
| Environmental Intelligence | `/design/v3/intelligence.html` |
| Situations | `/design/v3/situation-air.html`, `-yamuna.html`, `-soon.html` |
| Component sheet / About | `/design/v3/system.html`, `/design/v3/about.html` |

**Capture method — the one that produces trustworthy numbers.** CDP
`Emulation.setDeviceMetricsOverride`. **Never bare `--window-size`**: it applies no device
emulation, lays the page out wider and crops the PNG, and it has manufactured two entire
phantom defect lists on this project. Then READ the PNG. Two further traps, both learned
expensively: **capture band comparisons back-to-back**, because the page's own "N days ago"
advances on the real clock and will show as a diff; and **lazy images below the fold do not
load in a clipped capture** unless the element is scrolled into view first.

A working harness (`cap.mjs`, `measure.mjs` and probe files) is rebuilt in the session
scratchpad each time — it is not in the repo. `cap.mjs <url> <WxH> <out.png>
[selector|viewport] ['--eval=js']` handles the scroll, the click and the viewport clip.

## Verification gate — what "done" means here

Every band's height at 375 and 1440 against the ledger above; the 900px phone cap (only
`record` is licensed); ground adjacency; `scrollWidth === width` at 320–1920; console clean;
tap targets ≥24px and preferably 44 (**measure the pseudo box, not the element rect** — the
hit areas are transparent `::after` expanders); focus visible on both grounds; and contrast
for anything new, measured from pixels rather than asserted.
