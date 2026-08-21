# Building the next situation page

**Read this first if you are starting a fresh session to build Yamuna, Heatwave,
Forest fires, Forest loss or Climate event.** Air is finished and is the
template. This document is how to reuse it without re-deriving it.

Authority order, unchanged: **the frozen `public/design/v3/home.html` is the
design language**, `docs/design/DECISIONS-2026-08-20-homepage.md` is the ruling
ledger (read its tail first — rulings run D-07.0 → D-22.x), and
`docs/design/2026-08-21-SOURCE-FACTS.md` holds every figure with its source.

---

## 1. What Air actually is, mechanically

| | |
|---|---|
| Page | `public/design/v3/situation-air.html` — **generated, never hand-edited** |
| Generator | `scripts/build-situation-air.mjs` → `npm run build:situation-air` |
| Data | `data/*.json`, committed, refreshed by `scripts/fetch-*.mjs` |
| Live routes | `app/api/air`, `app/api/ward/*` — server-side keys only |
| Shared logic | `lib/air.ts` (the AQI), `lib/subscriptions.ts` (the alerts) |

**The page is a build artefact. If you edit the HTML directly your change dies
at the next build.** Edit the generator.

### Why a generator at all

The design language is frozen in `home.html`. The generator **copies the token
and chrome layer out of `home.html` line by line** rather than restating it, so
the drift set is closed by construction (D-10.3). A hand-written situation page
starts drifting the day the homepage changes; this one cannot.

The extraction is asserted, not trusted. `R(a, b, expectFirst, expectLast)`
checks that each line range still begins and ends with the text it did when the
range was written. **This is not paranoia — it has already fired.** A concurrent
session added ten lines to `home.html` mid-build and the extracted `<script>`
began mid-function: a parse error that silently killed a whole panel while the
console read clean. If an assertion fails, **the ranges moved; re-find them, do
not delete the assertion.**

---

## 2. The gates. Do not ship a situation page that fails one.

Every build runs these and refuses to write on failure:

1. **Extraction assertions** — the ranges still say what they said.
2. **Ground adjacency** — no two adjacent bands share a background hex,
   **checked on composited rendered colour, not class names.** A section with no
   class is transparent and inherits its neighbour: that bug shipped once.
3. **`node --check` on the whole page script** — extracted IIFEs *and*
   hand-written code together. Checking only the extracted half leaves the other
   half unchecked, which is the same bug on a different line.
4. **Data shape asserts** — for Air, the hand-transcribed apportionment split
   must sum to its declared total (±2 for the study's own rounding).

Then measure in a browser before calling it done:

- **Contrast**, computed against the *composited* ground. Zero failures. Two
  real defects were found this way: `--fg-3` used on a paper ground (2.66:1) and
  white on mustard (1.31:1).
- **Horizontal overflow** must be 0 at 375, 375×635 and 1280.
- **Document height**, quoted with the viewport. Air is ~11.6k at 375 and ~10k
  at 1280.

---

## 3. The rules that are about honesty, not looks

These are the reason the page is worth anything. Carry all of them.

- **An error is not a zero.** A failed source is `null`. FIRMS returns HTTP 200
  with the prose body `Invalid day range. Expects [1..5].`, which a CSV parser
  reads as zero rows — and the page would have published "no fires". Validate
  the *shape*, never the status. If every source fails, **leave the previous
  file alone** rather than write an absence.
- **Name the hole.** If a figure has no source, the container is hidden and the
  gap is *stated*. Air does this for the schools count, the ward map layer, the
  plume, and the pincode geography. **Naming a hole is content, not an apology.**
- **Measured vs modelled is carried by the rule under the numeral** — solid =
  counted, dotted = modelled. Costs no height. Applying it to Air's four health
  figures produced the finding that three of them are models.
- **A snapshot is not a fact.** The ledger recorded "Delhi is first of 266"; two
  hours later Sasaram read 389 against Delhi's 388. Anything that can move
  between two page loads must be *computed*, with its instability printed.
- **Two sources that disagree get published as two sources.** Never averaged.
  Air's apportionment shows TERI-ARAI beside IIT Kanpur, and IIT Kanpur's
  refusal to give a single number is the strongest graphic on the page.
- **A quiet month is not a clean month.** Attention data is attention, never
  the thing itself.
- **Hue is semantic and scarce.** Red = a published limit was broken. Green =
  what Swechha has done. Mustard = a human act or interface, and it is a ground
  **exactly once site-wide** (`#give`). A sector holding a large share is not a
  broken limit — that gets weight and ink, never red.

---

## 4. What to copy for the next page, and what to rebuild

**Copy nearly as-is:**
- the generator's whole scaffold — extraction, `R()`, ground chain, `section()`,
  the assemble block, the `node --check` gate;
- the tab component (`tabs()`), CSS block and controller. Panels use `hidden`,
  deliberately, unlike the frozen deck — see D-21.1;
- `opener()`, `kindTag()`, the kind-rule CSS, `.p-hole`;
- the picture band usage (`.pic` / `.pic-over` / `.pic-body`). The frozen rule
  is **display type may sit on a photograph, nothing else may** — headline over
  the frame, every number on solid ground beneath;
- the guard pattern in every `fetch-*.mjs`.

**Rebuild per subject:**
- the band sequence and their grounds (Air is 8 + a strip; keep no two adjacent
  grounds equal);
- the hero reading and its limit — every situation needs *a number against a
  published limit*, or it is an essay, not an instrument;
- the sources. **This is the real work.** Air took a full day of source-checking
  and it withdrew four hooks that were wrong.

---

## 5. Yamuna specifically — read before promising anything

`public/design/v3/situation-yamuna.html` predates the freeze. Two constraints
already on the record:

- **There is no real-time public Yamuna water-quality feed, and CPCB has no
  stable public API for it.** Do not design a hero around a live reading until
  a feed is proven to exist. The state vocabulary has `PERIODIC` for exactly
  this, and D-10.1 forbids `LIVE` before a feed exists.
- `LIVE` is earned by **delivery**, not cadence: the value must be able to
  change between two page views. Air earned it by verifying the CPCB feed
  advanced hourly (10:00 → 12:00 → 13:00, three different values) and then
  putting a server route in front of it.

---

## 6. Keys and secrets

`.env.example` lists every variable. `.env*` is gitignored; **no key has ever
been committed and none may be.** The reason `/api/air` and `/api/ward` exist as
server routes is so the CPCB key never reaches the browser — if you are reaching
for `NEXT_PUBLIC_`, the answer is a route.

The three keys used to build Air were pasted into a chat transcript. **If that
transcript is ever shared, rotate all three** (data.gov.in, WAQI, FIRMS).

---

## 7. Watch your ward — the state it is in

Built, and honest about what works:

- **Works with no credentials:** the monitor picker at `/api/ward` — all 44
  monitors, live readings, and each one's distance to the next nearest.
- **Needs two credentials:** the subscription itself. `DATABASE_URL` (Neon —
  chosen because Supabase's free tier *pauses* and would kill the cron) and
  `RESEND_API_KEY`. Schema: `db/001-ward-subscriptions.sql`. Job:
  `scripts/ward-alerts.mjs`, hourly via `.github/workflows/ward-alerts.yml`.
- Until then the form **says what is missing and stores nothing.** A form that
  accepts an address it cannot email is the one genuinely dishonest thing this
  page could do, and it is exactly what a "coming soon" input does.

Design notes worth keeping for other pages: **double opt-in always**; alert on a
**band change, not a reading** (Delhi is over the limit most of the year, so
"alert when over" means an email an hour forever); store the address and nothing
else; unsubscribe is one click with no second question.

---

# PART TWO — after the other five were built (21 August 2026)

**Everything above still applies to Air.** This part is what changed once Yamuna, Heatwave,
Forest fire, Forest loss and Climate event existed. **Start here if you are building the
seventh page.**

## 8. There is a shell now. Use it.

`scripts/lib/situation-shell.mjs`. Air is still 1,444 lines, and roughly four hundred of them
were never about air: the extraction, the ground check, the tab component, the opener, the
write gates. Copying that into five more generators would have created six diverging copies of
one design language.

**So the extraction pattern is applied one level up:**

```
home.html  ──extracted, asserted──▶  build-situation-air.mjs
                                          │
                                extracted, asserted
                                          ▼
                                 situation-shell.mjs
                                          │
                          ┌───────┬───────┼───────┬───────┐
                       yamuna  heatwave  fire   loss   climate
```

Air remains the single source of the situation-page CSS and the tab controller. **It was not
edited, and rebuilding it after all this work produced a byte-identical file** — which is the
proof that the extraction ranges are intact.

### 8.1 What the shell gives you

| export | what it is |
|---|---|
| `shell()` | the whole token + chrome layer, extracted and asserted. Returns `bad` — pass it to `assemble` |
| `assemble({...})` | builds the document and runs every write gate |
| `groundChain(BANDS)` | adjacency on declared hexes; returns the clash count |
| `opener(id, head, lead)` | the band opener, **carrying its own `.wrap`** — see §9.1 |
| `tabs(group, panels)` | ARIA tabs. Labels are **not** escaped (they carry entities); the group name is |
| `disclose(summary, body)` | native `<details>`. No JS, 44px target, works on both grounds |
| `measureRow({...})` / `measureHead([...])` | a label, a bar, a value, and **a tick where the published limit sits** |
| `hole(text)` | a named hole. Renders a sentence, never a blank |
| `stateChip(word)` | one of exactly four words, and **throws** on anything else |
| `kd(kind)` / `kindTag` / `KIND_LEGEND` | solid = counted, dotted = modelled |
| `SHARED_PAGE_CSS` | the disclosure and the measure row, stated for **both** grounds |
| `n0` `n1` `compact` `esc` `MON` `MON3` `ARROW` | formatting |

### 8.2 The write gates, now five

Air had three. Two were added because two things shipped broken:

1. Extraction assertions — the ranges still say what they said.
2. Ground adjacency, on declared hexes.
3. `node --check` on the **whole** page script.
4. **NEW — every `.im-head` is inside a `.wrap`.** §9.1.
5. Data-shape asserts, per page (the Yamuna build asserts 7 Delhi stations; the GFW fetcher
   asserts the threshold ladder is cumulative).

## 9. The five things that broke, so you do not repeat them

### 9.1 Band headings rendered at x=0 on all five pages

`.im-head` has no horizontal padding. The gutter is `.wrap`'s `padding:0 var(--gut)`. The
frozen homepage and Air both nest `.im-head` inside a `.wrap`; the first version of the shell
returned a bare `.im-head` and left the `.wrap` to the caller. Every heading on every band of
every page sat hard against the screen edge.

**The client saw it before any measurement did** — and it is worth understanding why. It
survives a contrast audit, an overflow check and a diff. Nothing automated was looking at
horizontal position. So `opener()` self-wraps and `assemble()` now gates on it structurally.

**The general lesson: measure the thing you would not think to measure.** Contrast, overflow
and document height were all being checked. Left edge was not.

### 9.2 Backticks inside a CSS template literal, three times

Every page's `PAGE_CSS` and the shell's `SHARED_PAGE_CSS` are template literals. A backtick in
a *comment* inside one silently terminates the string, and the parse error surfaces dozens of
lines away. This broke three builds. **Quote CSS selectors in prose without backticks.** The
shell now carries a reminder at the top of the block.

### 9.3 Components written for the wrong ground

Ten contrast failures on the Yamuna page, worst **2.11:1** — `.y-panel` and friends authored
alongside the paper-ground `.y-def` definitions and then used in a band on `--ground`. Same
defect, opposite direction, on Air's `.p-news-o` (`--fg-3` on paper, 2.66:1).

**Every shared component now states its colour for the dark ground and overrides under
`.paper`.** Nothing inherits. And the audit runs with **every disclosure open and every tab
panel revealed**, because a hidden panel is not audited.

### 9.4 Hue spent where it has no meaning

A mustard tint at 10% used to mark two rows of a source's layer list. Two things wrong: mustard
means *a human act*, and the tint lightened the ground until the caption measured 3.91:1. Also
caught: copy reading "green bar left is cities where it rose" when the bars are off-white —
**and green is reserved for what Swechha has done.**

**A quantity gets weight and ink. Red is a broken published limit. Nothing else.**

### 9.5 `--zh` / `--zt` are inert on `.pic`

Every situation page carries `style="--zh:...;--zt:..."` on its hero image, copied from Air.
Those properties belong to `.s-hero-shot img` on the homepage. `.pic > img` reads none of them —
it is a plain `object-fit:cover` centre crop. **So every hero was a centre crop whether or not
that was the right crop**, on Air too. The shell now wires `--op` (object-position), which is
the property that actually decides it. A wide photograph in a portrait band loses its subject
if the subject is not dead centre.

## 10. The four data lessons, which matter more than the CSS ones

### 10.1 Hashing a document does not tell you a newer edition exists

The site was briefly built on NCRB's 2023 death toll while the 2024 edition sat at a
predictable URL. Heat deaths went **804 → 1,832**. The watcher said "unchanged" the whole time,
and it was right — about the wrong question.

**`watch-documents.mjs` now probes for the next edition.** Every annual or biennial source
declares how to build its successor's URL. `unchanged and current` and `unchanged but
superseded` are different states.

### 10.2 A nested threshold is not a bucket

GFW's tree-cover-loss dataset is keyed by canopy-density threshold, and the thresholds are
**cumulative nested subsets**. Summing across them returns eight times the real figure — 19.27
against 2.43 million hectares — and looks plausible. The fetcher now pins one threshold and
**asserts the ladder is monotonically decreasing before it writes**.

**Generalise it: before aggregating over a dimension you did not choose, check what the
dimension means.**

### 10.3 A rate limit is not an empty dataset

Open-Meteo returned HTTP 429 for five of fourteen stations on the first national run. Dropping
them silently would have published a "national" picture from nine cities. Both weather fetchers
now pace, retry with backoff, and **omit** a failed station — recording which, never
backfilling. Same shape as the FIRMS error-body bug (D-16.4), which is now the third time this
class of error has appeared on this site.

### 10.4 Going national can reverse your finding

The heat page, built on one Delhi grid point, found dry-bulb heat extremes **flat to falling**
and the record day in 1998. It published that, with caveats, and it was true. Across 14
stations the picture inverts: qualifying days up at 8, warm nights up at 9, and **8 of 14
cities set their all-time record in 2024**.

**Delhi was the outlier, not the pattern.** A single grid point is a defensible instrument and
a bad sample. If a page's subject is national, sample nationally before you write the
conclusion — and if the two disagree, that disagreement is itself worth publishing.

## 11. Per-page shape, as built

| page | bands | reading | limit | state |
|---|---|---|---|---|
| `situation-yamuna.html` | 10 | dissolved oxygen **0.3 mg/L (BDL)** at 5 of 7 Delhi stations | > 5.0 mg/L, E(P) Rules 1986 | PERIODIC |
| `situation-heatwave.html` | 8 | **48.3 °C**, Jodhpur, 27 May 2024 | IMD severe, 47 °C | OUT OF SEASON |
| `situation-forest-fire.html` | 8 | **34,562 km²** burnt, 2023–24 season | **none — "No legal threshold."** | PERIODIC |
| `situation-forest-loss.html` | 8 | **2.43 M ha** lost 2001–2025, against ISFR's **+156 km²** | Forest (Conservation) Act — a requirement, not a quantity | PERIODIC |
| `situation-climate-event.html` | 8 | **13 days** over 64.5 mm, Mangaluru 2025 | IMD heavy-rain class | PERIODIC |

All five: **0 contrast failures, 0 ground clashes, 0 horizontal overflow at 375, 20px gutter.**

### 11.1 Two situations have no live season, and both say so once

Heatwave's window is shut for eight months and Forest fire's for six. The first heatwave build
spent three paragraphs apologising for that. **The fix was to make the reading a RECORD rather
than a season** — a record is true on every day of the year, and it is still a real measured
value against a published limit. The state chip says `OUT OF SEASON` once and the page gets on
with it.

**Corollary, learned on the climate page:** that only works if the record is recent. Its first
build led on 336 mm at Patna on 30 June 1996 — the true archive maximum, and it read as stale
immediately. A page about a worsening problem cannot open on a thirty-year-old number. It now
leads on the most recent complete year and keeps the archive record in the panel beside it,
dated.

## 12. Commands

```bash
npm run build:situations          # all six pages
npm run build:situation-yamuna    # or one
npm run data:situations           # refresh every dataset
npm run data:heat                 # or one subject
npm run watch:documents           # are the transcribed sources still current?
npm run watch:documents:strict    # exit 1 if anything changed or was superseded
```

`data:forest-fire` needs `FIRMS_MAP_KEY`. **Everything else is keyless.**

## 13. What is still open

1. **The money bands are the weakest thing on these pages.** Yamuna has two primary
   parliamentary documents; heat, fire and forest loss have none. Every lifetime spending
   figure in circulation traces to journalism reporting a parliamentary panel rather than to
   the panel's own document, and under D-13.6 those belong in the coverage band. **Closing this
   is document work, not API work, and it is the largest remaining task.**
2. **The GFW key.** The figures come through a public web client's keyless proxy, which can
   close without notice. One free account fixes it.
3. **The WAQI token** is one click away in the 21 August email.
4. **Air's hero deck cells on the homepage** still carry demo values for air (412) and forest
   fire (118). Both are correctly stamped `Demo data`, so neither is dishonest — but real
   figures now exist for both.
5. **Move Air onto the shell.** The intended end state: the situation CSS and tab controller
   live in `situation-shell.mjs` and Air imports them, instead of the shell reading them out of
   Air. Do it when Air is next touched for its own reasons, and prove it with a byte-identical
   rebuild.
