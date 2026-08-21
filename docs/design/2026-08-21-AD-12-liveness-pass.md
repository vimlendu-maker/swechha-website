# AD-12 — the liveness-honesty pass, 21 August 2026

Extends **D-10.1** ("no reading may claim LIVE until a feed exists"; the vocabulary
is **LIVE / PERIODIC / DEMO DATA / OUT OF SEASON** and nothing else) from the badges
to everything else on the page that asserts a freshness, and from the homepage to the
three prototypes it links to.

Three things AD-09 reported rather than changed are closed here. One thing it reported
is confirmed correct and deliberately not touched.

**The verified fact all of it rests on, re-checked today:** the repository has no live
data of any kind. Runtime dependencies are `gray-matter`, `marked`, `next`, `react`,
`react-dom`, `zod`. There is no HTTP client, no OpenAQ, no NASA FIRMS.

Files changed: `public/design/v3/home.html`, `intelligence.html`, `system.html`,
`situation-air.html`, plus one stale line in `BRANDING-2026-08-21-frozen-language.md`.
**Not committed.**

---

## 1. `home.html` — liveness asserted outside the vocabulary

### 1.1 The four provenance lines, before and after

The badges were already honest. The prose under them was not: a verb naming a machine
operation that never runs, and a computed age re-asserting a fresh read on **every**
page load, on all four slides — including the two labelled DEMO DATA.

The distinction held: **PERIODIC legitimately has an as-of time** — that is what
periodic means — and it keeps saying when the reading is from. **DEMO DATA has no read
time at all**, because there was no read; a sample value cannot be 43 minutes old.

| slide | badge | was | now |
|---|---|---|---|
| `#h-air` | DEMO DATA | CPCB continuous monitor, Anand Vihar. Hourly. **Read 07:00 IST · 43 min ago.** | CPCB continuous monitor, Anand Vihar. Hourly. **Sample value, not a reading.** |
| `#h-yamuna` | PERIODIC | DPCC monthly grab sample, Yamuna monitoring round. Monthly. **Last drawn 4 August 2026 · 16 days ago.** | **unchanged** |
| `#h-monsoon` | PERIODIC | India Meteorological Department, season accumulation. Daily. **Updated 05:30 IST · 3 hours ago.** | India Meteorological Department, season accumulation. Daily. **Updated 19 August 2026 · 2 days ago.** |
| `#h-fire` | DEMO DATA | NASA FIRMS, VIIRS 375m active fire product. Twice daily. **Fetched 03:10 IST · 5 hours ago.** | NASA FIRMS, VIIRS 375m active fire product. Twice daily. **Sample value, not a reading.** |

**The words, and why they are these words.** *"Sample value"* is the footer's own noun,
already approved at document level ("every reading shown is a sample value standing in
for the live feed") — so the slide now says per-reading what the page already said once,
which is exactly the move D-10.1 made with the badge. *"…, not a reading"* is the
house contrast construction, the same shape as **"Verified, not audited"** (§4.6) and
as the fire slide's own *"A detection is a thermal anomaly, not a confirmed fire"*. It
promises nothing about a future feed, and it does not repeat the badge word above it.

**Parallel constructions, checked as instructed.** All four lines are three sentences in
one order — **[source, station or product]. [cadence]. [as-of, or the reason there is
no as-of].** Two say when the reading is from; two say why there is no when. Read
back-to-back at 1440 from the captures, not from the markup:

1. CPCB continuous monitor, Anand Vihar. Hourly. Sample value, not a reading.
2. DPCC monthly grab sample, Yamuna monitoring round. Monthly. Last drawn 4 August 2026 · 16 days ago.
3. India Meteorological Department, season accumulation. Daily. Updated 19 August 2026 · 2 days ago.
4. NASA FIRMS, VIIRS 375m active fire product. Twice daily. Sample value, not a reading.

### 1.2 Why Monsoon's as-of had to change too, and it is not a rewrite for its own sake

`data-at="05:30"` is a bare clock time, and `at()` resolves a bare clock against
**today** on every load. So a figure typed into a static file announced itself as three
hours old at breakfast and 43 minutes old an hour later, for ever — the same
manufactured freshness the demo slides just lost, and a PERIODIC badge does not license
it. **The page also already contradicted itself:** this slide's own limit line reads
*"Normal to 19 August is 434mm"*, so the 512mm accumulation was pinned to 19 August by
the page while the source line dated it to this morning.

The date is therefore not invented — it is the slide's own. With the instant absolute in
the markup the age becomes true **and stays true**: it grows a day at each midnight
instead of resetting. Yamuna's as-of has always been built this way; the two PERIODIC
slides now carry one construction rather than two.

**The 05:30 clock came off, and that was measured rather than preferred.** The first
build said *"Updated 19 August 2026, 05:30 IST"* and it cost real layout:

| | with the clock | date only (shipped) |
|---|---|---|
| 375, monsoon source | **3 lines**, plate 105.13 → **124.69** | 2 lines, plate **105.13** ✓ |
| 375, plate-top spread (AD-05 R5 invariant) | 0 → **19.57px** ✗ | **0** ✓ |
| 768, hero band `top` | 665.03 → **665.59px** ✗ | **665.03** ✓ |
| 1440, source width | 671.6px | 605.2px |

A date-only as-of is 96px narrower at desktop, restores both invariants, and is the
better line anyway: for a season accumulation the instant that means anything is the
**day**, the cadence span already says "Daily", and a clock time to the minute was
fabricated precision on a figure nobody read off a wire. The clock survives where it is
free — `data-at` keeps `2026-08-19T05:30`, so the `<time datetime>` attribute still
carries it for a machine, exactly as Yamuna's has always been more precise than its
visible text.

### 1.3 The code, not just the output

- The two `<time class="s-hero-age">` elements on Air and Fire are **deleted from the
  markup**, not emptied and not hidden. `document.querySelectorAll('.s-hero-age')`
  returns **2**, not 4, so nothing computes an age the page does not show.
- `<span class="s-hero-rd">Read </span>` is gone, and with it the rule
  `#h-air .s-hero-rd{display:none}` — deleted rather than left matching nothing, the
  same discipline as the AD-11 sweep. Verified: `.s-hero-rd` matches **0** elements and
  the selector no longer exists.
- **The `console.warn` guards are untouched.** `SHAPE`, the calendar round-trip, the
  future check and `warn()` all stand, and Monsoon's new `2026-08-19T05:30` passes them
  (shape ✓, real calendar date ✓, in the past ✓).
- **`ago()`'s four rungs stay, deliberately.** They are selected by the *data*, not by a
  state: both surviving readings are dated days back, so only "days ago" fires today.
  Cutting the other three would make the function print *"0 days ago"* for the first
  reading less than a day old — a new wrong-output failure mode, which is the opposite
  of what removing a conditional is for. It is a range ladder, not a dead branch, and
  the file now says so at the function.

### 1.4 The class name that lied — `state delayed` → `state periodic`

Both PERIODIC badges were marked `class="state delayed"`, a survivor of the abandoned
RECENT/DELAYED vocabulary, rendering the word "Periodic". Renamed on both.

**Proved a pure rename three ways:**

1. **No rule anywhere selects it.** Walking every `CSSRule` in the document, including
   inside `@media` blocks: rules matching `.delayed` = **0**; rules matching
   `.periodic` = **0**. PERIODIC's hollow 9×9 square is the `.state i` *default* — it
   never had a rule of its own, which is precisely why the wrong name survived a freeze
   and two sweeps unnoticed.
2. **Computed styles are identical.** For each badge, all **1,058** computed properties
   plus the bounding box were snapshotted as `periodic`, re-snapshotted as `delayed`,
   and restored — on the badge and on its `<i>` dot, at 375 and 1440. **Zero
   differences**, and the restore is clean.
3. **The pixels are byte-identical.** Same crop of each stamp captured with each class
   name, back-to-back in the same session, `deviceScaleFactor` 2:

   | crop | `periodic` md5 | `delayed` md5 |
   |---|---|---|
   | `#h-yamuna .s-hero-stamp` @375 | `2ef87ba7…` | `2ef87ba7…` **identical** |
   | `#h-yamuna .s-hero-stamp` @1440 | `89f7586d…` | `89f7586d…` **identical** |
   | `#h-monsoon .s-hero-stamp` @375 | `559bf6b8…` | `559bf6b8…` **identical** |
   | `#h-monsoon .s-hero-stamp` @1440 | `d156b083…` | `d156b083…` **identical** |

No JS touches either token. `BRANDING-…-frozen-language.md` §3.3 said "`closed` /
`demo` / `delayed` are class names" — corrected there to `live / periodic / demo /
closed`, with the reason and the do-not-complete-the-set warning, because that file is
what the next page gets built from.

### 1.5 Measurements — the frozen ledger held exactly

Method: CDP `Emulation.setDeviceMetricsOverride` only, `Asia/Kolkata`,
`deviceScaleFactor` 1 for measurement and 2 for capture. Before and after on the same
harness in the same session; band comparisons taken back-to-back.

| | 375 | 1440 |
|---|---|---|
| document | **10,282** ✓ frozen ledger | **10,852** ✓ frozen ledger |
| `record` | **1,393.48** ✓ | **1,236.17** ✓ |
| `top` (hero) | 733.63 → 733.63 | 825 → 825 |
| `ticker` | 116.45 → 116.45 | 111.16 → 111.16 |

**Not one band height moved at any width.** All **13** band heights identical, to the
tenth of a pixel, at **320 / 375 / 414 / 768 / 1024 / 1440**. Document height identical
at all six. `record` identical at all six.

**The plate-top registration is intact** (AD-05 R5 — all four plates bottom-aligned, so
their tops agree only while their heights do). Spread after = spread before at every
width: **0** at 375 / 414 / 768 / 1440, **19.56px** at 320 and **36.8px** at 1024 —
both pre-existing and both documented before this pass.

**What did change, which is licensed** ("removing text may legitimately change a
provenance line's width"): source-line widths only — Air 466.8 → **464.5**, Fire 552.7
→ **526.7**, Monsoon 576.2 → **605.2** at 1440; Yamuna unchanged. Wrap counts stay
inside the two reserved lines at every width, which is what absorbed the change; that
reservation is now documented as load-bearing for copy edits, not only for the original
cut.

**`scrollWidth === innerWidth`** at 320, 360, 375, 414, 480, 560, 640, 768, 900, 1024,
1280, 1440, 1600, **1920**.

**Console clean** at 375×812 and 1440×900 after a full scroll: zero messages, zero
failed requests, zero ≥400 responses.

**The deck still works.** All four tabs at 375 and 1440: each selects its slide, the
pager reads `1 of 4` … `4 of 4`, next ×4 advances and clamps, prev ×2 walks back, and
each slide's stamp travels with it — Air → DEMO DATA, Yamuna → PERIODIC, Climate Event
→ PERIODIC, Forest fire → DEMO DATA at every step.

**Captures read, not just taken** (`scratchpad/d12/`): every provenance plate at 320,
375 and 1440 on all four slides, plus per-badge crops. Both demo lines wrap cleanly to
two lines at 320 and 375 with nothing clipped; the four lines read as parallel
constructions at 1440.

---

## 2. The same ruling on the pages the homepage links to

Nine LIVE badges sat on three linked prototypes. **All nine are resolved.** Each was
judged by its stated source, the way the homepage pass did, and every badge's
screen-reader mirror moved with it.

**No CSS had to be added anywhere.** Each of these files carries its own `<style>`, and
each already defines `.state i`, `.state.live i`, `.state.demo i` and `.state.closed i`
at the same lines — so the hatched DEMO DATA chip renders locally, and PERIODIC needs
no rule because the hollow square is the default. Verified by capture on each page, not
assumed.

### 2.1 `intelligence.html` — six LIVE badges, and the two counts behind them

The most visible surface after the homepage: all six ticker cells and the Record band's
"Today's readings" door point here.

**The deck (9 situation cards):**

| card | source it states | was | now |
|---|---|---|---|
| `h-air` | CPCB continuous monitor, Anand Vihar. Hourly. | LIVE | **DEMO DATA** — nothing fetches it |
| `h-monsoon` | IMD, season accumulation. Daily. | LIVE | **PERIODIC** — published bulletin, editor-entered |
| `h-fire` | NASA FIRMS, VIIRS 375m. Twice daily. | LIVE | **DEMO DATA** — no FIRMS integration |
| `h-yamuna`, `h-forestloss`, `h-stp`, `h-waste` | grab sample / annual analysis / compliance report / own field log | PERIODIC | **PERIODIC** — unchanged, correct |
| `h-heat` | IMD Safdarjung, daily in season | OUT OF SEASON | **OUT OF SEASON** — keeps its meaning |
| `h-noise` | "Not yet wired. Shown to prove the state." | DEMO DATA | unchanged — already the honest pattern |

Their provenance lines took the same treatment as the homepage, and the same words:

- air: *"Hourly. **Read 07:00 IST today.**"* → *"Hourly. **Sample value, not a reading.**"*
- fire: *"Twice daily. **Fetched 03:10 IST today.**"* → *"Twice daily. **Sample value, not a reading.**"*
- monsoon: *"Daily. **Updated 05:30 IST today.**"* → *"Daily. **Updated 19 August 2026.**"* (the homepage is authoritative — D-10.4)

That also removes three typed `"today"`s, which AD-05 R1 had already cut from all four
homepage sources and which §3.5 forbids in static markup.

**The three screen-reader mirrors moved with their badges:** *"…Severe. **Demo
data.**"*, *"…Above normal. **Periodic.**"*, *"…Below season. **Demo data.**"*. All nine
`.sr` sentences now agree with the badge above them.

**The source table** — header and three rows. The column header **"Last fetch" → "As
of"**, because nothing on this page is fetched at all and the remaining cells are
publication dates, not fetches:

| source | cadence | as of, was | as of, now | state |
|---|---|---|---|---|
| Central Pollution Control Board | Hourly | 07:00 today | **No reading** | LIVE → **DEMO DATA** |
| India Meteorological Department | Daily | 05:30 today | **19 August 2026** | LIVE → **PERIODIC** |
| NASA FIRMS | Twice daily | 03:10 today | **No reading** | LIVE → **DEMO DATA** |
| DPCC Yamuna / DPCC STP / Swechha field record | — | dates | unchanged | PERIODIC ✓ |
| Not yet wired (night noise) | Not fetching | No observation | unchanged | DEMO DATA ✓ |

`"No reading"` deliberately echoes the slides' *"not a reading"* — one vocabulary for
one absence.

**Two page-level counts that were verifiably false, and are the loudest claims on the
page because they are set as figures:**

1. The index tile read **`2` / "Live feeds" / "CPCB hourly and NASA FIRMS twice
   daily."** → **`0` / "Live feeds" / "None are wired yet. Every reading here is a
   bulletin figure or a sample value."**
2. The table intro read *"**Three of the seven feeds below are genuinely live.** The
   rest are the most recent published bulletin…"* → *"**None of the seven feeds below
   is wired yet.** Four are the most recent published bulletin or our own field log,
   typed in by hand; three are read by nothing at all. They are labelled that way
   rather than as live data."* (Counted against the table as it now stands: 4 PERIODIC,
   3 DEMO DATA.)
3. The paragraph under the tiles read *"Two feeds are live and four are the most recent
   published bulletin. There is no single LIVE badge on this page…"* — self-contradictory
   while six LIVE badges were on it → *"No feed is wired yet: five readings are the most
   recent published bulletin or our own field log, three are sample values, and one is
   out of season. There is no LIVE badge anywhere on this page, because that would be a
   claim the data cannot support."* (Counted against the deck: 5 PERIODIC, 3 DEMO DATA,
   1 OUT OF SEASON, nine cards.)

`class="state delayed"` ×7 renamed to `state periodic` here too — same lie, same word,
same zero cost (no rule selects it on this page either).

**Measurements** (this page has never been through a pass, so before **and** after):

| width | doc before → after | band changes | `scrollWidth === innerWidth` | console |
|---|---|---|---|---|
| 320 | 8,947 → **9,063** (+116) | index band 841.61 → 900.30; `method` 1,230.22 → 1,287.81 | ✓ | — |
| 375 | 8,499 → **8,569** (+70) | index 777.41 → 818.84; `method` 1,201.42 → 1,230.22 | ✓ | clean |
| 768 | 6,848 → **6,899** (+51) | index 606.70 → 628.58; `method` 1,110.81 → 1,139.61 | ✓ | — |
| 1024 | 5,903 → **5,943** (+40) | index 629.17 → 668.30 | ✓ | — |
| 1440 | 6,045 → **6,084** (+39) | index 643.92 → 683.05 | ✓ | clean |

Every pixel of that growth is prose: the honest tile caption wraps to two lines, and the
corrected table intro is one clause longer. The other five bands are identical at all
five widths. Overflowing-element counts are unchanged at every width (267 / 263 / 183 /
160 / 160 — all inside `overflow-x` containers, pre-existing).

**Interactions verified after the change**, at 375 and 1440: the `3 on` / `6 in window
today` / `All 9, in and out` switcher rebuilds the tablist correctly (3, 6 and 9 tabs);
every tab selects its own card; the pager reads `1 of 3`…`3 of 3`, `1 of 6`…`6 of 6`,
`1 of 9`…`9 of 9`; and each card's badge travels with it in all three sets — including
`h-heat → OUT OF SEASON` and `h-noise → DEMO DATA`, which only appear in the 9-set.

**Contrast, measured from rendered pixels.** Dark-ground card chips: ink
`rgb(205,199,183)` on a flat `rgb(13,13,11)` ground (the chip sits on the panel, not on
the photograph — confirmed by walking to the first opaque ancestor) = **11.5:1**.
Paper-ground table chips: `rgb(76,71,63)` on `rgb(243,242,240)` = **8.2:1**. Both are
the same ink and ground the LIVE chips used, so nothing about the contrast changed with
the word — and both are far above the 4.5:1 floor for the 9.5px micro type.

### 2.2 `situation-air.html` — one LIVE badge, and a deliberately narrow touch

This file is **scheduled to be rebuilt, not retrofitted** (D-10.3: a pre-freeze fork
with ~40 drifts, to be restarted from the frozen page's token and chrome layer). So it
gets D-10.1 and nothing else, and the rest of its residues are listed for the rebuild
rather than half-fixed here.

| | was | now |
|---|---|---|
| hero badge | `state live` / **LIVE** | `state demo` / **DEMO DATA** |
| its `.sr` mirror | "…24-hour rolling. Severe. **Live.**" | "…Severe. **Demo data.**" |
| its provenance line | "CPCB continuous monitor, Anand Vihar. Hourly. **Read 07:00 IST today.**" | "…Hourly. **Sample value, not a reading.**" |
| the feed count in prose | "**Two of the feeds behind this page are live** and three are a published bulletin." | "**None of the feeds behind this page is wired yet:** three readings are the most recent published bulletin and the rest are sample values." |

That last one is included because it is the same class of verifiable falsehood as
intelligence's tile — a stated count of live infrastructure that is zero — and because
it contradicted intelligence's own table on the same claim.

**Measurements** (first ever pass on this file):

| width | doc before → after | band changes | `scrollWidth === innerWidth` | console |
|---|---|---|---|---|
| 320 | 14,775 → **14,833** (+58) | feed-inventory band 941.81 → 999.41 | ✓ | — |
| 375 | 14,077 → **14,134** (+57) | 828.55 → 886.14 | ✓ | clean |
| 768 | 12,382 → **12,410** (+28) | 672.73 → 701.53 | ✓ | — |
| 1024 | 11,612 → **11,641** (+29) | 677.11 → 705.91 | ✓ | — |
| 1440 | 12,598 → **12,627** (+29) | 724.84 → 753.64 | ✓ | clean |

One band moves, by one line of the corrected sentence; the other thirteen are identical
at all five widths. Badge geometry 43.8 → 88.9px, contrast **11.5:1** on the same flat
ground as intelligence. Overflow counts unchanged (460 / 427 / 116 / 0 / 0 — a
pre-existing 320–768 problem on this page, inside scroll containers, not introduced or
worsened here).

### 2.3 `system.html` — the two LIVE chips are SPECIMENS, and they stay

**This is a judgment call and it is the one that most deserves a look.** The two LIVE
chips on this page are not readings. They are the four-word vocabulary displayed as a
row of specimens in the component sheet — `LIVE □ PERIODIC ▨ DEMO DATA ⬚ OUT OF SEASON`,
under the label *"Feed state · carried by SHAPE, never by hue"* — rendered twice, once
on the dark ground and once on paper. **No numeral, no label, no source line and no date
accompanies any of them.**

A badge is a claim about a reading. With no reading attached there is no claim, and
D-10.1's own last sentence keeps LIVE alive as a word ("LIVE returns per-reading on the
day that reading's feed is actually wired"). Deleting it from the sheet that *defines*
the vocabulary would delete one of the four words from the spec — and the branding spec
§3.3 requires all four to exist. This is the same reasoning AD-09 §1.5 used to leave the
Record band's door eyebrows alone: judged descriptions, not state claims.

Two things were done instead, both zero-visual-risk:

1. **The specimen now names its own class.** The PERIODIC chip was marked bare
   `class="state"` — the only place in the site using no modifier at all, which would
   teach the next page to build PERIODIC without a class. It is now
   `class="state periodic"`, matching the homepage and intelligence. No rule selects it,
   so nothing moved.
2. **The sheet now says it is a sheet.** The label reads *"Feed state ·
   **`.state.live .periodic .demo .closed`** · carried by SHAPE, never by hue, so it
   cannot borrow red's meaning. **Specimens: no reading on this site carries LIVE
   yet**"* — so a reader cannot mistake the row for evidence that a feed exists.

**Measurements:** the label wraps one line further, and that is the entire change.
`components` band 3,859.34 → **3,926.53** at 320 and 3,810.98 → **3,878.17** at 375
(+67.19, i.e. 2 × 33.6 because the row renders twice), +33.59 at 768, +16.80 at 1024 and
1440. Document +67 / +67 / +33 / +17 / +17. **The other nine bands are identical at all
five widths.** `scrollWidth === innerWidth` at all five. Console clean at 375 and 1440.

One thing checked rather than assumed: the overflowing-element count at 320 went 76 →
**78**. Both new members are my `<p class="tok">` and its `<b>`, and neither overflows
its own container — the `<b>` measures 232.8px wide ending at x=347.1 inside a column
whose own right edge is 349.5. **That column is 349.5px wide at every width**, so at 320
the whole component sheet already overflows the viewport and is clipped by
`overflow:hidden` on `body`; 76 elements were already in that state, including the
neighbouring `<b>-breach / -recovered / -act / -season / -demo</b>` at 331.3. **A
pre-existing 320 defect on this page, inherited not caused.** Nothing new overflows at
375 or above (count 0 at 375 and 768).

---

## 3. Not mine, confirmed correct: the blink

**The blink is gone from the homepage and it should be.** It was bound to `.state.live`
and no reading carries that class, so the page's one `@keyframes` animates nothing. It
returns by itself, on the reading that earns it, the day a feed is wired — a one-token
flip per slide. **It was not reinstated on DEMO DATA:** a hatched demo chip must not
pulse like a live one. The four dormant rules keep their DO NOT SWEEP comments, and this
pass did not touch them.

Worth knowing for the linked pages: none of `intelligence.html`, `system.html` or
`situation-air.html` has ever had a `@keyframes` at all, so their filled LIVE squares
never blinked. Only the homepage owns that mechanism.

---

## 4. Deliberately left — every one of these needs a ruling, not a fix

### 4.1 The nine-versus-six question on `intelligence.html` — untouched, as instructed

`intelligence.html` renders **nine** situations where the frozen homepage carries four
and the ticker six: `air`, `yamuna`, `monsoon`, `fire`, **`forestloss`**, **`heat`**,
`stp`, **`noise`**, **`waste`**. Six show by default; a `3 on / 6 in window today / All
9, in and out` switcher reveals the rest. **Nothing was cut, moved or deleted.** All
nine kept their badges, their sources and their positions, and all nine were re-verified
working in all three sets after the change. The extras are the page's own demonstration
material — `h-noise` exists precisely to show DEMO DATA, `h-heat` to show OUT OF
SEASON, and the page's copy points at them ("Switch the control above to **All 9** and
step to Heatwave to see that state"). **Whether the index shrinks to the frozen set is a
live client question and not the art director's call.**

### 4.2 On `home.html` — the three AD-09 items outside this brief

1. **The ticker head's computed date + `"07:00 IST"`.** Same mechanism as the slide ages,
   one level up: it dates the whole strip to today. Left because it is the ticker's, not
   a slide's, and because the strip asserts no per-reading state (AD-09 §1.4). One
   `data-at` change would date it absolutely, exactly as Monsoon's was.
2. **`#ticker`'s `aria-label`: "Today's readings: every situation in window, and one
   Swechha record."** Two claims in one string — *"Today's"*, and a completeness claim
   that goes false with the season. The visible heading *"Today's readings"* is the same
   claim in the same words.
3. **The Record door's `"Last compiled 18 August 2026"`**, already on the ledger as a
   live residue, and its neighbour eyebrow **"Updated every hour"** — the only one of the
   three door eyebrows in the present tense, which AD-09 §1.5 flagged as the one that
   reads as a promise about a live page. `"Hourly"` is a one-word change matching
   `.s-hero-cad` exactly.

### 4.3 On `intelligence.html` — the tile I did not touch, and it now has a neighbour

**`+3` / "Change since yesterday" / "Air up 3 points. Nothing else moved."** A change
figure requires two reads; there have been none. I left it because every honest version
is a content decision — delete the tile, or change what it counts — and because it
carries no state mark. **But it now sits two tiles from `0` / "Live feeds", so the
contradiction is on one screen and is easy to see.** Same family: the page's lead
sentence promises the reader *"what changed overnight"*, and the tiles' own
*"6 in window today"* (a window statement, not a freshness claim — left as correct).
The page dateline *"Wednesday, 19 August 2026, 07:00 IST"* is a typed compile stamp of
the same kind as the footer's "Design synthesis v3, 19 August 2026"; dated, not tensed,
so left.

### 4.4 On `situation-air.html` — the residues that belong to the D-10.3 rebuild

Listed so the rebuild inherits them rather than rediscovering them: the byline's
**"Readings update hourly."**; the heading **"India, right now"**; a screen-reader-only
table caption asserting **"07:00 IST today"**; three captions reading **"Read 07:00
IST"**; **"…likely to be exposed above the limit today"**; **"run against this
morning's meteorology"**; **"Last compiled 18 August 2026"** and **"Last checked for a
forecast feed: 18 August 2026"** (both honest as written); and the page's own dateline
**"07:00 IST, 19 August 2026"**. Also still there, and separate from this ruling: the
five dead `sig-*` selective-colour filters (§7.3) and the pre-existing 320–768 overflow.

### 4.5 The residue in D-10.1 itself, restated because it has not gone away

PERIODIC describes the **mechanism** (a person typing a published bulletin figure, which
needs nothing built), not the **value**. The values shown for Yamuna and Monsoon are
sample values like every other figure on these pages, and PERIODIC does not say so —
what says so is the footer, at document level, unchanged and verbatim on all four files.
**If the client wants per-reading honesty about the value as well as the mechanism, all
four homepage slides go to DEMO DATA and PERIODIC returns with the first real bulletin
entry.** One token per slide, and it is his call.

---

## 5. Where the proof lives

`scratchpad/`: `p12-home.js` (bands, plates, provenance lines, badge geometry),
`p12-gen.js`, `p12-rename.js` (the 1,058-property comparison and the stylesheet-rule
walk), `p12-intdeck.js` (the 3/6/9 switcher walk), `p12-ovf.js`, `p12-tok.js`,
`p12-chipctx.js`, `p12-ovfwho.js`; before/after JSON as `d12-*-before.json` /
`d12-*-after.json` / `d12-home-final.json`; captures in `d12/`; pre-edit copies of the
three linked files as `*.bak-ad12`.
