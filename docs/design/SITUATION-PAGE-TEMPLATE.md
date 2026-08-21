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
