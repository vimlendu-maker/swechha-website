# AD-05 — Honesty repair, bands 01–02 (plus four found defects)

**Date:** 20 August 2026
**File:** `public/design/v3/home.html` (self-contained, no build step)
**Scope:** R1–R4 reopened on the frozen bands by client permission, for this repair only.
R5–R9 added by the coordinator mid-session.
**Method:** Chrome DevTools Protocol, `Emulation.setDeviceMetricsOverride` — never
`--window-size`. Time travel by stubbing `Date` before any page script runs, with
`Emulation.setTimezoneOverride: Asia/Kolkata`, so every getter is true IST wall clock.
Mocked instants: **21 Aug 00:30, 03:00, 06:59, 07:01, 23:30; 1 Sep 00:30; 1 Jan 2027 00:30**,
plus the real 20 Aug 17:40. Widths: **375×635, 375×812, 768×1024, 1024×800, 1440×900,
1920×1080**, plus 320/414/500/519/520/560 for the two range defects.

Nothing here is claimed that was not rendered and measured.

---

## Summary

| | defect | ruling | status |
|---|---|---|---|
| R1 | typed "today" contradicts the computed age | **cut the word** | fixed |
| R2 | ticker head dates a 07:00 reading before 07:00 exists | route through `at()` | fixed |
| R3 | flex gap orphans the comma | one flex item | fixed |
| R4 | page-level LIVE dot over a mixed-state strip | **remove it** | fixed |
| R5 | plate registration drifted 19.56px at ≤560 | reserve two lines | fixed 375–560; 320 residual stated |
| R6 | comment claims smoothing that does not exist | correct the comment, not the behaviour | fixed |
| R7 | focus evaporates when the focused arrow is disabled | move focus before disabling | fixed |
| R8 | 5-column record rule is dead | give the floor its own narrower block | fixed |
| R9 | "SEVEN CELLS / dormant, not absent" contradicts the live ruling | rewrite the comment | fixed |

**Band integrity.** Ticker height, hero height and document scrollWidth are **byte-identical
before and after at all six widths**. The strip stays inside its 96–120px ceiling
(116.45 / 116.45 / 107.67 / 107.67 / 111.16 / 111.67). `scrollWidth === innerWidth` at 375
and 768. No console output at any width.

---

## R1 — The typed word "today" contradicted the computed age

**Reproduced.** Mocked to 03:00 on 21 August, `home.html:2205` (pre-repair numbering) rendered
`Read 07:00 IST today · 20 hours ago` while its own `<time datetime>` resolved to
`2026-08-20T07:00`. The sentence said today; the machine-readable attribute beside it said
yesterday. Same at 00:30 (17 hours) and 06:59 (23 hours), on all three affected lines.

### Ruling: cut the word, do not compute it

Both options were open, and cutting wins on the degraded case, which is decisive here.

The page is served statically. **Any tensed word is a claim the markup makes before JS runs.**
Computing "today"/"yesterday" fixes the scripted path and leaves the typed fallback wrong for
seven hours a day — the same defect, moved somewhere harder to see. Cutting removes the claim
from both paths at once. Three supporting reasons: the computed age already carries recency,
so a tense can only restate it or contradict it; the `<time datetime>` attribute carries the
resolved date exactly, for anything that needs it; and D-01.11 already cut this same word at
≤560 with the client's approval, so extending that cut is a copy cut of an already-approved
kind, not a new editorial decision. This is also D-01.10's own argument — *removing the branch
removes the failure mode* — applied to a word instead of a badge.

### Fix

| file:line | before | after |
|---|---|---|
| `home.html:2264` (Air) | `07:00 IST<span class="s-hero-rd"> today</span><time …>` | `07:00 IST<time …>` |
| `home.html:2333` (Climate Event) | `Updated 05:30 IST today<time …>` | `Updated 05:30 IST<time …>` |
| `home.html:2364` (Fire) | `Fetched 03:10 IST today<time …>` | `Fetched 03:10 IST<time …>` |
| `home.html:1198` | comment: *"the verb and 'today' come off with it"* | rewritten — records that "today" is gone at every width, and why a tensed word must not be typed back in |

`.s-hero-rd` survives on the verb alone, so `#h-air .s-hero-rd{display:none}` at ≤560 still
does its job.

### Before → after, mocked

```
03:00, 21 Aug   before  Read 07:00 IST today · 20 hours ago.      (datetime 2026-08-20T07:00)
                after   Read 07:00 IST · 20 hours ago.            (datetime 2026-08-20T07:00)

00:30, 21 Aug   before  Updated 05:30 IST today · 19 hours ago.
                after   Updated 05:30 IST · 19 hours ago.

06:59, 21 Aug   before  Fetched 03:10 IST today · 3 hours ago.
                after   Fetched 03:10 IST · 3 hours ago.
```

**Degraded (JS disabled, measured):** `CPCB continuous monitor, Anand Vihar. Hourly. Read 07:00
IST.` — a cadence and a clock time, no date claimed, true at every hour of every day. The
Yamuna line is untouched: it carries an absolute date (`Last drawn 4 August 2026`), not a
tense, and absolute dates cannot drift.

---

## R2 — The ticker head claimed a 07:00 reading before 07:00 existed

**Reproduced.** Mocked to 03:00 on 21 August the head rendered **"Friday, 21 August 2026, 07:00
IST"** — a reading four hours into the future — while the hero, one screen up, resolved the
same reading to Thursday the 20th. The two frozen bands contradicted each other from midnight
to 07:00, seven hours a day.

**Cause.** `home.html:2834-2836` (pre-repair numbering) filled `.s-ticker-date` from `now`'s own getters; the
`", 07:00 IST"` beside it was static markup. There was no equivalent of the hero's roll-back.

### Fix — one code path, and the clock time stays in the markup

`home.html:2441` — the head now carries `data-at="07:00"` like any other reading, and
`home.html:2984-2990` reads it through **the same `at()`** the hero uses. There is no second
date rule and no second clock literal in the file; if the head ever names a different hour,
that is a markup change.

```html
<p class="lbl s-ticker-when"><span class="s-ticker-stamp" data-at="07:00"><span class="s-ticker-date"></span> 07:00 IST</span></p>
```

**The date span ships empty on purpose.** A typed date is precisely the defect D-01.11 fixed —
the file shipped reading 19 August on the 20th — and it becomes a lie again the moment the JS
does not run. Empty degrades to *less*, never to *wrong*. The joining comma moved into the
computed string so the fallback reads as a clean fragment rather than a dangling `", 07:00 IST"`.
That is punctuation following its clause, not a rewrite; no approved word changed.

### Hero and ticker agree at every mocked instant

| mocked IST | ticker head (after) | hero 07:00 `datetime` | |
|---|---|---|---|
| 20 Aug 17:40 | Thursday, 20 August 2026, 07:00 IST | 2026-08-20T07:00 | agree |
| 21 Aug 00:30 | Thursday, 20 August 2026, 07:00 IST | 2026-08-20T07:00 | agree |
| 21 Aug 03:00 | Thursday, 20 August 2026, 07:00 IST | 2026-08-20T07:00 | agree |
| 21 Aug 06:59 | Thursday, 20 August 2026, 07:00 IST | 2026-08-20T07:00 | agree |
| 21 Aug 07:01 | Friday, 21 August 2026, 07:00 IST | 2026-08-21T07:00 | agree |
| 21 Aug 23:30 | Friday, 21 August 2026, 07:00 IST | 2026-08-21T07:00 | agree |
| **1 Sep 00:30** | **Monday, 31 August 2026**, 07:00 IST | 2026-08-31T07:00 | agree |
| **1 Jan 2027 00:30** | **Thursday, 31 December 2026**, 07:00 IST | 2026-12-31T07:00 | agree |

Before the fix, the first four rows read *Friday, 21 August* / *Tuesday, 1 September* /
*Friday, 1 January 2027* against the same hero values — wrong on six of eight.

**Degraded:** the head renders `07:00 IST`.

### Malformed and future `data-at`, also fixed

Verified by serving a mutated copy of the real page (a local proxy on :3111) so `at()` saw the
bad values exactly as an editor typo would deliver them.

| injected | before | after |
|---|---|---|
| `garbage` | `NaN days ago` | *(empty)* + console warning |
| `--` | `NaN days ago` | *(empty)* + console warning |
| `2099-01-01T11:00` (future) | **`just now`** | *(empty)* + console warning |
| `25:99` | `21 min ago`, dated 02:39 | *(empty)* + console warning |
| `2026-02-30T11:00` | `… ago`, silently dated 2 March | *(empty)* + console warning |

`home.html:2961-2977`: a shape **and range** pattern, a calendar **round trip** (the constructed
date's fields must match the typed ones, because `new Date` rolls overflow forward silently),
and a future check. Refusal is silence on the page — the element keeps the empty state it ships
with, which is what a reader with no JS already sees — and a `console.warn` for the editor.
The last two rows are the ones that mattered most: they produced *plausible, wrong,
unremarkable* ages, where nothing looks broken.

---

## R3 — The floating comma

**Reproduced:** 7.12–7.13px of flex gap landing before the comma at every one of the six
widths. `.s-ticker-when{display:flex;gap:.62em}` (CSS `home.html:1317`) had three flex items —
the dot, `.s-ticker-date`, and the anonymous text run `", 07:00 IST"` — so the masthead read
"…2026 , 07:00 IST".

**Fixed as part of R2**, in the same edit: the whole run is one `.s-ticker-stamp` span with the
JS target nested inside it. Measured after: **one flex item, gap list empty**, rendered text
`Thursday, 20 August 2026, 07:00 IST`. Confirmed in the 3× captures at 375, 768 and 1440.

Note this was still necessary *after* R4 removed the dot: two items still gap, and the gap would
still have fallen before the comma.

`.s-ticker-stamp` deliberately takes **no `white-space` rule** — `nowrap` would make the whole
string one unbreakable run and push the document past 375. Verified: `scrollWidth === 375`.

---

## R4 — The page-level LIVE dot: **remove it**

### The ruling

D-01.10 fixed the vocabulary at LIVE / PERIODIC / DEMO DATA / OUT OF SEASON so that a mark can
never claim more than the data supports, and it made the mark travel *with the reading it
describes* precisely so it could not desync. The dot at `home.html:2340` (pre-repair numbering) broke both halves of
that. It was `.state.live` — the filled square out of that same four-value vocabulary — set at
**page** level, over a strip that aggregates situations in different states: Climate Event is
Periodic (D-01.11 demoted it), Yamuna DO is a monthly grab sample, Forest loss is a 2001–2025
cumulative total, and the Impact slot is not a reading at all. Two of six cells are wired live.
Worse, it was **wordless and `aria-hidden`**: a reader learns the key one screen up, where the
identical filled square sits beside the word "Live", then reads it here over everything, while
a screen-reader user gets nothing at all — none of the machinery (the word, the fill variant,
the `.sr` mirror) that makes the hero stamp checkable. It asserted the strongest of the four
states with the least evidence on the page. The two alternatives were weighed and rejected: an
**honest aggregate** has no word to use, because the vocabulary is frozen at four and none of
them means "some live, some periodic, one record", and inventing a fifth is exactly the
freeze D-01.10 exists to hold; **binding it to the date** would make a state mark stand for
something that is not a state, and a dot that fills or blinks for anything other than state is
decoration, which this page does not do. Removing it removes the branch — D-01.10's own
argument, applied one level up — and leaves the head carrying only what is true of it: a date
and the hour of the reading it names. The per-cell figures are untouched, the hero stamp still
ships all four values, and **the strip does not grow**: the dot sat inside an existing flex
line, so ticker height is identical at all six widths (measured, above).

### Fix

- `home.html:2441` — the `<span class="state live">` is gone from the markup.
- `home.html:1318-1326` — the two rules that sized it (`.s-ticker-when .state`,
  `.s-ticker-when .state i`) are deleted and replaced by a comment recording the ruling, so it
  is not re-added. The `gap` is kept, with a note that anything added later must go **outside**
  `.s-ticker-stamp` or it re-breaks R3.

Mustard was never involved; no red was introduced; nothing animates. Rendered and read at
375/768/1440.

---

## R5 — Plate registration had drifted (regression)

The slack-chain comment states its own acceptance test: *"all four `.s-hero-plate` tops must be
within ~7px of each other at 375."* D-02.3 recorded it achieved at **0.0px**. Measured at the
start of this session: **19.56px at 375, 414 and 560**.

**Coupled to R1, and re-measured after it as instructed — the R1 cut did not resolve it.**
Spread was still 19.56px. The cause is not slack: the plates *are* correctly bottom-aligned
(their bottoms coincide exactly, so the action link never moves). The plates are different
**heights**. D-01.11's age string pushed three source lines to two lines at ≤560, while Air —
alone in having its place name and verb cut there — stayed at one. The gap is exactly one
19.57px line box, and it is the *top* of the source line that jumps as the reader advances.

**Fix** — `home.html:1233` (inside `@media (max-width:560px)`):

```css
.s-hero-src{flex:1 1 0;min-height:39.14px;min-height:2lh}
```

Two lines are reserved on every slide, so all four plates are the same height and their tops
coincide. The px value is the fallback for engines without `lh`, at 2 × the measured 19.57px
line box. **It costs no band height** — Air's plate grows into slack its own slide already
carries.

| width | plate top spread before → after | hero band height |
|---|---|---|
| 375×635 | 19.56 → **0.00** | 712.63 → 712.63 |
| 375×812 | 19.57 → **0.00** | 716.89 → 716.89 |
| 414 | 19.56 → **0.00** | unchanged |
| 560 | 19.56 → **0.00** | unchanged |
| 768 / 1440 / 1920 | 0.00 → 0.00 | unchanged |

**Stated residual, measured not assumed:** at **320** the strings split two lines against three,
so the invariant needs `3lh` there and this rule leaves 19.56px. 320 is below the tested floor;
a new breakpoint was not worth guessing at. Recorded in the CSS comment.

---

## R6 — The smooth-scroll comment, and its index trap

`home.html:3063-3065` (was 3031-3033) claimed *"The smoothing is declarative (scroll-behavior on .rig-track)"*.
**There is no such declaration.** `.rig-track` (`home.html:438`) sets `display`, `overflow-x`
and `scroll-snap-type` only; the file's one `scroll-behavior:smooth` is on `.s-journeys-rack`
(`home.html:1613`), a different rail in band 04.

**Ruling: correct the comment, not the behaviour.** Band 01 is frozen; the instant advance is
what has shipped and what the client has seen, and an instrument face arguably should jump.
Adding smoothing would be a behaviour change to a frozen band on my own initiative — and, per
the coordinator's warning, it is a trap and not a patch: every caller does `go(i); mark(idx())`,
and `idx()` derives the index from `track.scrollLeft`, which is correct **only** because the
jump has already completed. Under smooth scrolling `scrollLeft` sits at the old slide for the
length of the animation, so `mark()` would light the tab the reader just left and set
prev/next from the wrong end of the deck. Adding `scroll-behavior:smooth` alone does not make
the deck smooth — it makes it lie.

**Fix:** `home.html:3063-3081` — the comment now states that the advance is instant, names where
the real `scroll-behavior` lives, and spells out that smoothing is **two changes or none**: the
handlers must mark the *target* index at the same time. No behaviour changed; measured
identical.

---

## R7 — Keyboard focus evaporated on the disabled arrow

`mark()` set `prev.disabled` / `next.disabled` unconditionally. Disabling the button that
currently holds focus hands focus back to `<body>`, so a keyboard reader who presses their way
to the last slide loses their place and the next Tab restarts from the top of the document.

**Fix** — `home.html:3045-3057`: both flags are computed first (the answer depends on the other
one), focus moves **before** they land, to the arrow that stays live or to the track itself
(which is focusable and carries the same Left/Right keys).

Verified by driving the deck at 1440:

```
before:  start BUTTON.rn → click → click → click → BODY        (next now disabled)
after:   start BUTTON.rn → click → click → click → BUTTON.rp   (next now disabled)
         start BUTTON.rp → click → click → click → BUTTON.rn   (prev now disabled)
```

---

## R8 — The dead 5-column record rule

`@media (min-width:376px) and (max-width:519px){.s-record-sheet{grid-template-columns:repeat(5,…)}}`
was immediately followed by `@media (max-width:519px){… .s-record-sheet{grid-template-columns:repeat(4,…)}}`
— equal specificity, later in the file, so the floor won at every width and **376–519 rendered
four columns**, not the five its own comment says the direction asks for.

**Ruling: deliver the recorded direction.** The comment states it as given (*"Four columns is
the floor, at 375 and below, exactly as directed"*), so the rule is a bug, not dead weight.

**Fix:** the column declaration was removed from the ≤519 block (`home.html:2155`, which keeps
`gap:5px`) and the floor given its own **narrower, later** block at `home.html:2163-2167`:

```css
@media (max-width:375px){ .s-record-sheet{grid-template-columns:repeat(4,minmax(0,1fr))} }
```

Rendered ladder, measured, with no cell overflow and no document overflow at any step:

| width | 360 | 375 | 376 | 414 | 500 | 519 | 520 | 768 |
|---|---|---|---|---|---|---|---|---|
| columns | 4 | 4 | **5** | **5** | **5** | **5** | 6 | 7 |
| cell width | 76.3 | 80.0 | 63.2 | 70.8 | 88.0 | 91.8 | 75.0 | 95.4 |

---

## R9 — The stale dormant-cell comment

The ticker's header comment read *"SEVEN CELLS: the frozen six (D-00) plus one cell that is NOT
a situation. Heatwave is in the six but its window is shut, so it is dormant, not absent — an
instrument face has a fixed number of dials."* That was overturned the same day by the ruling
recorded ~80 lines below in the same file — *"NO DORMANT CELLS. Client ruling, 20 August:
'Anything that is closed, shouldnt appear in the frontend.'"* — and contradicted by the markup
(six cells) and by `.s-ticker-rail`'s `repeat(5,…) minmax(0,1.3fr)`.

**Fix:** three corrections, comment-only, no rendering change.

- `home.html:1281-1290` — rewritten to SIX CELLS with the count stated as seasonal, the
  superseded dial-face argument recorded as *lost* so it is not re-derived, and a pointer to the
  live rule.
- `home.html:1259` — "Seven short rules of seven different lengths" → as many as there are
  cells, which is seasonal.
- `home.html:1268` — "the strip's first line seven NUMERALS" → numerals rather than words.

---

## Found while in there, and NOT fixed

1. **Plate spread of 36.80px at 1024×800.** Real, reproduced, and a *different* defect from R5:
   at 1024 all four source lines are single lines, but Yamuna's is 642.45px and its plate — a
   `flex-wrap:wrap` row of source + tag + action link — wraps the action link onto a second row,
   giving plateH 79.8 against 43. Not fixed because every available fix is out of scope for a
   repair brief: cutting copy at ≥861 where the full string is meant to render needs a ruling,
   and a `min-height` here would be a magic number at a width whose whole point is that nothing
   is cut. **1024 is the only width in the matrix where it occurs** (768 and 1440 are both
   0.00). Worth its own ticket.

2. **The 320px residual on R5**, stated above — needs `3lh`, i.e. a breakpoint below 375.

3. **`prefers-reduced-motion` is not honoured by `.rig-track`.** `.s-journeys-rack` has an
   explicit `scroll-behavior:auto` override under reduced motion; the deck has no
   `scroll-behavior` at all, so today it is moot. It becomes live the moment anyone acts on R6.
   Flagged inside the R6 comment.

4. **The keydown handler does not call `mark()`.** `prev.onclick` / `next.onclick` both do
   `go(); mark(idx())` — the comment above them explains why — but the Arrow-key handler
   (`home.html:3094-3097`) calls `go()` alone and relies on the IntersectionObserver, which the
   same comment calls "a frame behind". It self-corrects today, so I left shipped behaviour
   alone rather than widen a focus fix into a behaviour change. It is the same class of bug the
   click handlers were patched for, and it is one line.

5. **`.s-ticker-count` is hidden at ≤560** (`home.html:1427`), so "Five in window · one record"
   — the approved copy that exists specifically to explain the seasonal column count — never
   reaches the phone reader, who is the one most likely to notice a column appear between
   visits. Pre-existing and evidently deliberate (band 02 is frozen around it), so untouched,
   but it undercuts the reason D-02.2 gives for the line.

6. **A near miss worth recording.** Mid-repair I closed a comment badly and killed the entire
   date IIFE. The page's rendered output was **indistinguishable from correct refusal** — empty
   `<time>` elements, head reading `07:00 IST` — because silent-and-empty is exactly what the
   new guards produce. Only the missing `console.warn` lines revealed it. That is an argument
   for keeping the console warnings: with silence as the honest failure mode, they are the only
   signal that separates "refused a bad value" from "the script is dead".

---

## Verification appendix

**Unchanged across the repair, all six widths:** ticker height, ticker head height, ticker frame
height, hero band height, per-slide heights, `document.scrollWidth`, rail `scrollWidth`.

```
                ticker height        hero height        plate spread     docSW/vw
375×635      116.45 → 116.45      712.63 → 712.63     19.56 → 0.00      375/375
375×812      116.45 → 116.45      716.89 → 716.89     19.57 → 0.00      375/375
768×1024     107.67 → 107.67      688.58 → 688.58      0.00 → 0.00      768/768
1024×800     107.67 → 107.67      719.42 → 719.42     36.80 → 36.80   1024/1024
1440×900     111.16 → 111.16      825.00 → 825.00      0.00 → 0.00    1440/1440
1920×1080    111.67 → 111.67      891.00 → 891.00      0.00 → 0.00    1920/1920
```

Strip inside the 96–120px ceiling at every width. Console clean at every width.
Not touched: `--kiss`, `--rl-foot`, the blink timing and its reduced-motion fallback, the hero
stamp's four-value vocabulary, the 1018px breakpoint, the Impact slot ceilings,
"Delhi, then India.", "Five in window · one record", Monsoon = Periodic, the frozen membership.
`public/design/v3/_ad4/*` untouched.
