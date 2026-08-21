# AD-02b — THE SITUATION ROW, TWICE: FOUR OPTIONS

Art direction, 20 August 2026. Answering the client's question directly:

> *"I see the band with situation option twice. The idea was to retain the earlier
> design (what still exists as the edge to edge design), and have Options i had
> mentioned. The lower tabs still has data on STP and Out of river etc. Ask the
> director the logic of having the band twice. We will keep it if its justified."*

**Nothing has been changed in `home.html`.** It is byte-identical to the file this
review opened against — sha1 `ec43a420b088f6e7484cac44d5b47d2d84c088b5`, 175,667 bytes,
mtime 20 Aug 10:02:21. Every option below is a **separate rendered file**, live now:

| | open it | what it is |
|---|---|---|
| **A** | `/design/v3/_ad2b/A.html` | one row, by subtraction |
| **B** | `/design/v3/_ad2b/B.html` | one row, by merger |
| **C** | `/design/v3/_ad2b/C.html` | two rows, different **shape** |
| **D** | `/design/v3/_ad2b/D.html` | two rows, different **kind** |
| **C+D** | `/design/v3/_ad2b/CD.html` | both differentiators together |
| *(Dover)* | `/design/v3/_ad2b/Dover.html` | D plus a per-cell authorship overline — costed, not recommended |

Method: Chrome DevTools Protocol, `Emulation.setDeviceMetricsOverride` with real device
metrics and touch emulation on the phone widths. Never `--window-size`. Every figure
below was measured, not estimated. Baseline reproduces AD-02 exactly: **80.27px** gap at
1440, **68.26px** at 768, hero **712.6px** at 375×635, strip **119.5px** at 375.

---

## 0. Two things the client said that decide more than they look like

**0.1 "The lower tabs" — the client called the ticker cells *tabs*.** That is not an art
director inferring a resemblance from a contrast ratio. That is the client, reading the
page, naming a strip of links after the control it sits under. AD-01 and AD-02 both
argued the two rows *look* alike on six typographic axes; this sentence is the proof
that the resemblance has already cost something. Whatever is chosen below has to survive
that sentence.

**0.2 "Retain the earlier design (what still exists as the edge to edge design)" — I
checked this against the page rather than taking it on trust, and it holds.** In this
region exactly one thing is edge to edge: the ticker. `groundRhythm`'s own list of what
earns full bleed names it — *"2. The ticker strip and its two hairlines."* The hero's tab
row is inside `.wrap` (1240 max) and sits at x=146 at 1440 while the ticker's ink starts
at x=46. So the thing the client asked to **retain** is the ticker, and the "Options" are
the deck's selector. **Any option that deletes the ticker is against the client's own
sentence, and none of the four below does it.**

**0.3 What the freeze does to the question, which is the part nobody has said yet.**
Today the ticker carries two things the deck does not: Treatment and Out of river. D-00
removes both as situations. If nothing else changes, the freeze leaves a ticker whose
entire membership is the frozen six and a deck whose membership is a subset of the same
six — **the same set, drawn twice, 80px apart, in the same type.** The client is not
complaining about a duplication that exists; they are complaining about one the freeze
is about to make total. That is why "they are different things" is not an answer on its
own. The page has to *show* the difference.

---

## 1. Common baseline — applied identically to all four options

So the comparison is about the duplication mechanism and nothing else.

- **Treatment (14/18) out of the strip.** Folds into Yamuna's inner page per D-00 §2.
  This also retires AD-02's D5 (the label stated the opposite of the instrument) for free.
- **Monsoon → Climate Event**, in the ticker label **and** in the deck's `data-tab`
  (D-00 §8). The deck tab row now reads AIR · YAMUNA · CLIMATE EVENT · FOREST FIRE.
- **`1.65M` → `1.65M ha`** (AD-02 D9 — the only value in the row with no unit). Measured
  fit at every width; nothing ellipsises.
- **Heatwave added, dormant** — see §4 for the alternatives and why this is the baseline.
- **Order = D-00's frozen order**: Air · Yamuna DO · Heatwave · Forest fire · Forest loss
  · Climate Event. Note the side-effect, which is deliberate: the deck orders by validity
  window × severity (D-01.4) while the ticker is fixed, so the two rows will *visibly* not
  agree — one is an instrument face, one is a selection.

**Out of river is out of the strip in A, B and C, and back in D and C+D** wired to
`#impact`. That is the live question the client raised and then withdrew (*"Dont yet go
by what i said"*), so it is carried as the thing that separates the option pairs rather
than as a decision.

Nothing in the do-not-break list is touched by any option: `--kiss` / `--rl-foot` are
untouched, the ticker's rule is still the numeral's own `::after` on its `width:max-content`
wrapper drawn `left:0;right:0`, breach still changes colour and weight only and still
grows **downward, away from** the numeral, no mustard enters the strip, and no red lands
on a control. Checked mechanically at every viewport: `scrollWidth === innerWidth` at 375
and 768 in all six files, and **no two adjacent bands share a ground hex** in any of them.

---

## 2. THE FOUR OPTIONS

Numbers are the whole strip, ticker top hairline to bottom hairline. Spec is 96–120px
(`perSection[1].height`, *"do not grow it"*). Today: 112.8 at 1440, 119.5 at 375.

### Option A — ONE ROW, BY SUBTRACTION
**The hero deck loses its tab row. The ticker survives unchanged in shape.**
The deck is driven by swipe, the arrows and the counter. The ticker becomes the page's
only list of situation names, edge to edge — literally what the client asked to retain.

*Capture:* `ad2b-optA-1440.png`, `ad2b-A-bar-1440.png`, `ad2b-optA-768.png`, `ad2b-optA-375.png`

| | |
|---|---|
| **Reader gains** | The repetition is gone by subtraction, at every width, with no new vocabulary to learn. The hero band gets 40px shorter on a phone — the single largest gain in this document against the 635px fold. |
| **Reader loses** | You can no longer jump to a named situation; four slides are now n arrow-presses apart, and the deck stops telling you what the other three *are*. And it opens a new confusion in place of the old one: the only row of situation names left on the screen is the ticker, which looks more like the deck's control than ever — and tapping it leaves the page. See `ad2b-A-bar-1440.png`: the hero bar is now `1 of 4` at the far left and two arrows at the far right with ~1,100px of nothing between them. That is the 726px void AD-01 closed by moving the counter to meet the tabs. A reopens it. |
| **1440** | strip 112.8 (unchanged) · hero 825 (unchanged — the arrows are the tallest thing in the bar, so removing the tabs frees width, not height) · gap: n/a |
| **375** | strip 119.5 (unchanged) · **hero 712.6 → 672.6 at 375×635 (−40.0px)** · rail scrollWidth 964 → 832 |
| **Build** | Small. Delete one `<div>`; add three null-guards in `rig()`. ~30 min. |
| **Honest weakness** | It answers the client's question by removing the thing that made the page navigable, and it leaves the *ticker* looking like the control. It trades a visible duplication for an invisible mis-affordance, which is the worse of the two. |

---

### Option B — ONE ROW, BY MERGER
**The hero deck loses its tab row and the ticker becomes the deck's selector.**
One row, doing both jobs: it reports six readings *and* clicking a live cell drives the
deck above it. Leaving the page is handed to the per-slide "The full instrument" link,
which already exists on every slide. The selected cell carries the same 3px off-white
marker the hero tabs carried, on the cell's top edge — ink, because red is forbidden on a
control and mustard is forbidden in this strip.

*Capture:* `ad2b-optB-768.png`, `ad2b-B-sel-375.png`

| | |
|---|---|
| **Reader gains** | The duplication is not merely reduced, it is structurally impossible — there is one row and it is the control. And it is a better control than the tabs were: each choice now carries its reading, so you can see *why* you would want slide 2 before you go there. |
| **Reader loses** | The selector sits **below** the panel it drives and scrolls away from it; on a phone the deck and its control cannot be on screen together. And it breaks on the two cells that are not ordinary situations: Heatwave is dormant and has no slide, so its cell has to fall back to being a link — one row, two behaviours, indistinguishable before the click. |
| **1440** | strip 112.8 (unchanged) · hero 825 (unchanged) |
| **375** | strip 119.5 (unchanged) · **hero 672.6 at 375×635 (−40.0px)** |
| **Build** | Medium. Delete the tab row, null-guard `rig()`, add ~30 lines wiring the cells to the track with a scroll-sync. But the real cost is doctrinal, not code: the ticker stops being chrome, which contradicts `groundRhythm`'s *"THE TICKER IS NOT A BAND… it is chrome, like the nav"*, and it acquires a control, which AD-02 §4 rules out (*"No controls in the strip, ever"*). Both are re-openable, but they are rulings, not preferences. |
| **Honest weakness** | It needs a client ruling that does not exist yet: D-01.4 says an out-of-window situation *does not appear on the front end*, so a merged row can only select what is in window — which means the dormant cells behave differently from their neighbours in the one row that is supposed to be uniform. |

---

### Option C — TWO ROWS, DIFFERENT SHAPE
**The ticker cell flips: the value leads, the rail sits under it, the label goes beneath
the rail.** The strip's first line stops being six words and becomes six numerals.

*Capture:* `ad2b-optC-768.png` (the decisive one), `ad2b-optC-1440.png`, `ad2b-optC-375.png`, `ad2b-C-strip-1440.png`

| | |
|---|---|
| **Reader gains** | At 768 — the worst case, where the two rows are 66px apart *and share a left edge* — the deck reads `AIR YAMUNA CLIMATE EVENT FOREST FIRE` and the strip beneath reads `412 0.0 CLOSED 118 1.65M ha`. There is nothing left to confuse. It also puts the ticker into the hero's own grammar (numeral → rail → identity beneath), so the strip becomes a small hero rather than a second tab bar, and it retires two other defects on the way past: nothing sits under "Delhi. Since 2000." but a numeral (AD-02 D4's column-head stack), and the seven value rules move into the middle of the strip instead of sitting 0.6px from equidistant between their numeral and the section edge (AD-02 D6 — the rules currently read as the strip's bottom border). |
| **Reader loses** | The labels stop forming a scanning row. A reader asking "which one is this?" now reads second, not first. Against a row of six that is a small price; against a row of twelve it would not be. |
| **1440** | **strip 112.8 → 109.7 (−3.1px)** · gap 80.27 → 78.27 · hero unchanged |
| **375** | **strip 119.5 → 116.5 (−3.0px)** · hero 712.6 at 375×635 (unchanged) |
| **Build** | Medium. Swap two spans per cell; three CSS lines. The 19px of cell bottom padding existed only to stop the rule reading as the section border — the flip removes that job, so the padding pays for the label's new gap and the strip comes out *shorter* than it is today. The rail contract is untouched: the `::after` is absolutely positioned, so a 1px → 3px breach still cannot move anything. ~1 h. |
| **Bonus, measured** | With the frozen six and the flip, the last visible ink at 375 now stops **6.1px** from the viewport edge (today: 10.2px), so the licensed 8px fade finally paints on ink instead of on empty ground. At 414 it is 31.5px (today 49.2), so a 40px fade at ≤560 would now bite at **both** — which supersedes AD-02's finding that no single width could. Worth a look before shipping: a 40px gradient across a numeral can read as a rendering fault. |
| **Honest weakness** | It changes a read the client has already approved. It is the right change *because* the client asked this question, not in spite of it — but it is a change, and they should see `ad2b-optC-768.png` before agreeing. |

---

### Option D — TWO ROWS, DIFFERENT KIND
**Keep the current read. Make the two rows carry provably different things.** The ticker
becomes the frozen six *plus* Out of river as a seventh cell of a different kind — the
only figure on the page the organisation owns — wired to `#impact` rather than to a
situation page. It is set apart by position (last), by a divider at full `--hair` weight
instead of `--hair-2`, by 14px of extra gap, and the head states the split in words:
**"Six situations · one record."** No mustard, no second hue: green is already carrying
"this is a recovery, not a situation."

*Capture:* `ad2b-optD-768.png`, `ad2b-optD-1440.png`, `ad2b-CD-own-zoom-1440.png`, `ad2b-CD-floor-1024.png`

| | |
|---|---|
| **Reader gains** | The two rows stop being the same set: the deck is situations in window, the strip is every situation plus the organisation's own outcome. The head says so in the page's own voice. And it keeps 6,890 tonnes on the homepage instead of leaving the site's one recovered quantity nowhere until Impact is rebuilt. |
| **Reader loses** | **It does not touch the thing the client complained about.** `ad2b-optD-768.png` is the evidence: AIR still sits under AIR, YAMUNA DO under YAMUNA, in the same face at the same size 69.75px apart. D explains the duplication; it does not remove it. |
| **1440** | strip 112.8 → 114.3 (+1.5px, inside spec) · gap 80.27 → 81.75 |
| **375** | strip 119.5 (unchanged) — **but only because the head count is suppressed below 561px.** With it on, the head takes a third line and the strip goes to **137.8px, 17.8px over its own ceiling.** So D's differentiator is a desktop-only mechanism, and the phone reader — who can see 2.7 of the 7 cells — is exactly the reader who does not get it. |
| **Seven-across floor, recosted** | AD-02 costed nine cells at ~1,180px, and ~1,360px with honest labels. **Six cells cost nothing** — they fit all the way down to the existing 900px scroll breakpoint. **Seven cells cost 1,048px.** Measured by binary search: at 1,047px "Out of river" ellipsises to `OUT OF RIV…` and at 1,048px it does not. That is a 147px band of real laptop widths where the one cell the whole mechanism depends on is the one that truncates — see `ad2b-CD-floor-1024.png`, captured at 1024. Fixing it means moving the scroll breakpoint from 900 to 1048, i.e. the strip scrolls on a 1024px laptop. |
| **Build** | Small-to-medium: one cell, one grid column, one head field, ~15 CSS lines. ~1 h, plus the breakpoint move. |
| **Honest weakness, and it is the serious one** | **The "different in kind" mark does not read.** `ad2b-CD-own-zoom-1440.png` is a 5× enlargement of the seventh cell: the heavier divider and the 14px gap are, at working size, invisible. Green is doing all the work, and green means *recovered*, not *goes somewhere else*. So a reader still cannot tell, before clicking, that this cell leaves for a section of the page they are already on. The only version that actually reads is D-with-an-overline (`Dover.html`, a one-word "SWECHHA" cut from the instrument page's own *"Swechha field record"*) — and that costs **+19px on every cell**, because grid rows take the tallest, taking the strip to **133.5px at 1440 and 138.8px at 375**: 13.5 and 18.8px over the ceiling on a strip the direction says twice not to grow. I would not spend that, and I would not ship the quiet version pretending it marks anything. |

---

### C + D together — `/design/v3/_ad2b/CD.html`
The two differentiators compose cleanly, and this is the only combination where the odd
cell reads without an overline: flipped, the seventh cell's *first* line is a green
numeral in a row of red and neutral ones, which is a stronger mark than any divider.

**1440:** strip 111.2 (−1.6 vs today), gap 79.75. **375:** strip 116.5 (−3.0).
Same 1,048px seven-across floor as D. *Capture:* `ad2b-optCD-1440.png`, `ad2b-optCD-768.png`.

---

## 3. The four side by side

| | duplication removed? | strip @1440 | strip @375 | hero @375×635 | across-floor | build |
|---|---|---|---|---|---|---|
| today | — | 112.8 | 119.5 | 712.6 | 901 | — |
| **A** | yes, by deletion | 112.8 | 119.5 | **672.6** | 901 | small |
| **B** | yes, structurally | 112.8 | 119.5 | **672.6** | 901 | medium + 2 rulings |
| **C** | yes, visually | **109.7** | **116.5** | 712.6 | 901 | medium |
| **D** | **no** | 114.3 | 119.5¹ | 712.6 | **1048** | small |
| **C+D** | yes, visually | 111.2 | 116.5 | 712.6 | **1048** | medium |

¹ only with the head count suppressed below 561px; 137.8px with it on.

Verified in all six files at 375×635, 375×812, 414×736, 768×1024, 901×800, 1024×800,
1200×800, 1440×720, 1440×900, 1920×1080: `scrollWidth` equals the viewport at 375 and
768; the hero at 375×635 is never above today's 712.6; no two adjacent bands share a
ground hex; no ticker label or value is ellipsised at any width in A, B or C.

---

## 4. HEATWAVE — four options

D-00 puts Heatwave in the frozen six. It is in neither row today, and its window is shut
(`intelligence.html`: *"Heat closed on 15 July"*).

**H1 — dormant cell in the ticker, absent from the deck.** *(what the four builds above use)*
The value slot carries the word **CLOSED** at the value's size but on the **label's** axes
(`wdth 88, wght 650`, not the numerals' 800) so it reads as chrome and never as a reading;
the rail beneath it becomes 1px **dashed** `--fg-3`. Dashed already means *a window that
is shut* twice in this file (`.closed .rl::after`, `.state.closed i`), and AD-01's D9
deliberately de-dashed the season tags to reserve it. No hue, no number, no stale value.
Explicitly **not** `.win.closed`, which paints mustard.
*Cost: zero.* "CLOSED" is 74–85px of ink and fits every cell at every width; the strip's
height is unchanged. *Gain:* the instrument has a fixed number of dials, so a reader in
August and a reader in May see the same six, and only the readings differ. That is also
the thing that makes the ticker structurally unlike the deck, which varies.
*Loss:* one of six cells carries no number.

**H2 — in neither row.** The strip shows what is in window; its length changes with the
season, `repeat(6,1fr)` becomes `repeat(n,1fr)`, and a reader returning in spring finds a
column that was not there before with nothing explaining it. It also makes the strip's
own `aria-label` ("Today's readings, every situation") false again. *Cost: zero.*
*I would not take it,* but it is the cheapest and it is defensible if the client's view is
that the homepage should only ever show live things.

**H3 — in both rows.** The deck gains a fifth slide that has no reading. A reader arrows
into it and finds a full-viewport band saying "closed". *Cost: needs a client ruling
against D-01.4, which says the window governs whether a situation appears at all.*
I would not take it.

**H4 — in the ticker with its last summer reading, dated.** Rejected outright: a stale
number presented as current is the one thing this page exists not to do.

**Flag either way:** `#h-heat` **exists in `intelligence.html`'s DOM but computes
`display:none`** — the rig renders six panels and Heatwave is not one of them. So a
Heatwave cell is a dead link today, exactly like `#h-waste` (AD-02 D2). Adding the cell
without adding the panel ships a second one.

---

## 5. What I would pick, and why — last, as asked

**C, and C alone for now.**

C is the only option that answers the sentence the client actually wrote. They did not
ask why the ticker contains what it contains; they said they see the row *twice*. That is
a complaint about a picture, and only C changes the picture — at 1440, at 768 where the
two rows share a left edge, and at 375. A and B change it too, but by removing the thing
that made the page navigable and by putting the mis-affordance somewhere worse; D does not
change it at all, and its own capture proves that.

C is also the only one that comes in **under** today's height (109.7 vs 112.8 at 1440,
116.5 vs 119.5 at 375) while retiring three separately-diagnosed defects — the
column-head stack, the value rules reading as the strip's bottom border, and the phone
overflow fade painting on empty ground. And it costs the client nothing they have
approved: no copy is rewritten, no colour is added, the rail contract is untouched, and
the edge-to-edge strip they asked to retain is retained.

**On Out of river, I would not decide it in this pass.** D-00 §1 is right that it belongs
in the Impact band, where the direction already puts green. Keeping it in the strip
wired to `#impact` (D) is a real option and I have built it — but the seventh cell costs
a 1,048px floor, and the mark that says *this one is different* either does not read or
costs 19px of strip height. Both of those are prices paid to avoid a move that section 7
has to make anyway. **My recommendation: take C now; hold Out of river until Impact is
reviewed, and move it there.** If the client wants it on the strip in the meantime, take
**C+D**, not D — flipped, its green numeral leading a row of red ones is the only mark
that reads without buying height.

---

## 6. Deferred, and why

- **Moving Out of river into the Impact band** — section 7, not reviewed. Structural, out
  of this pass's scope by instruction. **Schedule it**; until it lands the figure has no
  home, and D-00 §7's resolution of the dead `#h-waste` link depends on it.
- **Folding Treatment into Yamuna's inner page** — `intelligence.html`, not this section.
- **`#h-heat` and `#h-waste` panels on `intelligence.html`** — both hidden, both dead
  link targets. Needed before any option ships a Heatwave cell.
- **The 1,048px breakpoint move** — only if D or C+D is chosen.

## 7. Still needs the client

1. **Which option.** A, B, C, D or C+D.
2. **Heatwave.** H1, H2 or H3.
3. **Out of river** — the withdrawn idea, restated as a real choice: on the strip wired to
   Impact (costs the 1,048px floor and a mark that barely reads), or moved into Impact
   (costs nothing here, needs section 7).
4. **"Delhi. Since 2000."** — approved copy, and **false for two of the six cells**:
   Forest loss is India and Forest fire is North India. It may be moved or cut, never
   rewritten, so this is a client call. AD-02's Q3 measured three cuts; cutting "Delhi."
   is the only one that makes the head accurate rather than merely shorter.
5. **The live dot in the ticker head.** `<span class="state live">` is a bare 7px dot with
   no word. Under D-01.10's own rule a state mark carries the **full** vocabulary at all
   times and never conditionally — a mark that can only say *live* is precisely the shape
   that can lie, and after the freeze it sits above a cell reading CLOSED. It is not in
   any of the four options because removing it is a separate ruling; I would remove it and
   let the timestamp stand as a plain statement of when the strip was read. State belongs
   to a reading, and the strip is six readings.
6. **The overflow count.** AD-02's D1 fix — a count in the head so a strip showing 2.7 of
   6 cells on a phone says so — is not in any option, because it is orthogonal to the
   duplication and would have muddied the comparison. It is still owed, and under C it
   becomes cheaper: the flip already moves the phone cut onto ink.

---

## 8. Captures

All in `docs/design/img/sections/`.

**Before:** `ad2b-before-seam-1440.png`, `-seam-1440-3x`, `-seam-768.png`, `-seam-768-3x`,
`-seam-375.png`, `-tk-375-2x`, `-tk-414-2x`, `-tk-375-edge.png`, `-tk-414-edge.png`,
`-tk-1440.png`, `-tk-1440-3x`, `-tk-1920.png`, `-tk-1024.png`, `-fold-375x635.png`.

**Options**, all three viewports, same slide, same scroll offset, so they compare
directly — including `ad2b-optCURRENT-{1440,768,375}.png` as the unchanged control:
`ad2b-optA-{1440,768,375}.png` · `ad2b-optB-{1440,768,375}.png` ·
`ad2b-optC-{1440,768,375}.png` · `ad2b-optD-{1440,768,375}.png` ·
`ad2b-optCD-{1440,768,375}.png` · `ad2b-optDover-{1440,768,375}.png`.

**Detail:** `ad2b-A-bar-1440.png` (the reopened void) · `ad2b-B-sel-375.png` (the merged
row's selection marker) · `ad2b-C-strip-1440.png` · `ad2b-C-edge-{375,414}.png` (the fade
zone at 6×) · `ad2b-C-botseam-1440.png` · `ad2b-CD-own-zoom-1440.png` (the seventh cell at
5× — the mark that does not read) · `ad2b-CD-floor-1024.png` (`OUT OF RIV…`, the 1,048px
floor) · `ad2b-CD-strip-375.png` · `ad2b-D-own-zoom-1440.png`.
