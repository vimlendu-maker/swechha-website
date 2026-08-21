# AD-02c — THE TICKER, BUILT

Art direction, 20 August 2026. Section 2 of 12. Implements AD-02b option **C+D** as
amended by seven client rulings taken during the build. **This section is frozen** —
see §9 for what that covers, §10 for what the backend still owes, §11 for what is not
safe to freeze.

**Shipped into** `public/design/v3/home.html` — 175,667 → 187,578 bytes,
sha1 `ec43a420…` → `e2a80162…`. The six AD-02b variants stay at
`public/design/v3/_ad2b/` for reference; they are now historical, not live.

Method: Chrome DevTools Protocol, `Emulation.setDeviceMetricsOverride`, real device
metrics with touch emulation on the phone widths. Never `--window-size`.

---

## 0. The seven rulings, and what each one changed

| ruling | effect on the build |
|---|---|
| **Both cells must exist** — Heatwave to its situation page, Waste to Impact | drove the option to C+D |
| **"Anything that is closed, shouldnt appear in the frontend"** | killed the dormant cell; Heatwave is absent; ~20 lines of `.is-shut` CSS deleted; the column count became seasonal |
| **"also CLOSED wil not be visible right to the visitor?"** | correct, and moot for the strip once dormant cells died — but it exposed a real vocabulary leak, §5 |
| **The Impact slot is constant, rightmost, rotating, admin-chosen** | replaced D's invisible "different in kind" mark with position; forced the column to be sized for content it does not yet hold |
| **Head line "Delhi, then India."** approved | shipped, §3 |
| **Count field approved as shipped** | "Five in window · one record" stands, now under the never-rewrite rule |
| **Green stays bound to the figure** | ruling upheld; the mitigation became backend item 5 |

The net is a strip of **two zones with different rules**: a variable set of in-window
situations on the left, one constant Impact slot on the right.

---

## 1. What shipped, with `file:line`

All line numbers are `public/design/v3/home.html` at the sha above.

### The flip — the answer to the client's original question
**1233** the ruling and its reasoning · **1311** `.s-ticker-name{align-self:stretch;
margin-top:calc(var(--s-tick-kiss) + 10px)}` · **1316** `.s-ticker-v{order:-1;margin-top:0}`

The value leads and the label sits under the rule. **The flip is done with `order`, not by
reordering the markup**, so the link still announces "Air, 412" and not "412, Air".

| | before | after |
|---|---|---|
| strip @1440×900 | 112.8px | **111.2px** |
| strip @1920 | 113.3px | 111.7px |
| strip @375 | 119.5px | **116.5px** |
| deck-tabs → strip gap @1440 | 80.27px | 79.75px |
| gap @768 (the worst case) | 68.26px | 67.75px |

It is height-**negative** because the 19px of cell bottom padding existed only to stop the
flat rule reading as the section's own border (AD-02 D6). The flip retires that job, so the
padding pays for the label's new gap. The rail contract is untouched: same `::after` on the
same `width:max-content` box, still absolutely positioned, so a 1px→3px breach cannot move
the label.

*Evidence:* `ad2c-final-seam-1440.png`, `ad2c-final-seam-768.png`. At 768 the deck reads
`AIR YAMUNA CLIMATE EVENT FOREST FIRE` and the strip beneath reads `412 0.0 118 1.65M ha
512mm 6,890t`. There is nothing left to confuse.

### Membership — the frozen six, minus what is out of window
**2327** section `aria-label` · **2331** head count · **2333–2356** the cells ·
**2243** deck tab `Monsoon → Climate Event`

Shipped: Air 412 · Yamuna DO 0.0 · Forest fire 118 · Forest loss **1.65M ha** · Climate
Event 512mm · **Out of river 6,890t**. Treatment gone. Heatwave **absent** (window shut
15 July). `1.65M` gained its unit (AD-02 D9).

`aria-label` now reads *"Today's readings: every situation in window, and one Swechha
record"* — true, where the old one claimed "every situation" for seven of nine. Every cell
carries its own `aria-label` so "1.65M ha" no longer announces as "one point six five M H A".

### No dormant cells
**1328** the ruling, and a note that the dashed rail still means *a window that is shut*
elsewhere in the file — it just never appears here. `.is-shut` is deleted, not commented out.

### The Impact slot
**1344** the frozen contract · **1294** `repeat(5,minmax(0,1fr)) minmax(0,1.3fr)` ·
**1370** the wider slot in scroll mode · **2356** the cell, `href="#impact"`

Position is the mark. AD-02b measured D's heavier divider and 14px gap **invisible at 5×**
(`ad2b-CD-own-zoom-1440.png`); they are kept because they cost nothing, but what a reader
can rely on is that the last cell is always this cell while the count to its left changes
with the season. It also gives the strip a fixed right terminus while n varies.

### The mobile slack (the client's "extra padding")
**1054** the diagnosis and fix · **1094–1097** the chain · **1101** the removed shadow rule

| | before | after |
|---|---|---|
| hole under LIMIT BROKEN @375, per slide | 71.5 / 78.3 / 78.3 / 0 px | **0 / 0 / 0 / 0** |
| @414 | 55.9 / 45.4 / 45.4 / 0 | **0 / 0 / 0 / 0** |
| @768 | 27 / 0 / 27 / 0 | **0 / 0 / 0 / 0** |
| hero @375×635 | 712.6 | **712.6** (unchanged) |
| plate bottom spread across slides | — | **0.0px at every width** |

---

## 2. The ruling on the mobile slack

**It is not padding, and it is not fixable by moving the plate.** The deck equalises its
four slides to the tallest — all four are exactly 607.9px at 375×812 — and the equaliser is
Forest fire, whose surviving sentence sets to **four** lines at 375 and three at 414 where
the other three set to two. The difference had nowhere to go but `.s-hero-plate
{margin-top:auto}`, so it pooled in one 71.5–78.3px void immediately under the band's most
conclusive line. An earlier pass had already moved that void up from under THE FULL
INSTRUMENT for the same reason; the comment recording that decision is still at **1040**.

Of the three moves offered: letting slides take their natural height makes the deck jump as
the reader advances, which is worse than a hole; cutting Forest fire's sentence is approved
copy and needs the client (§3); redistributing the slack moves the plate between slides.

**The fourth answer, and what shipped: the slack lands directly after the sentence.**
`margin-bottom:auto` on `.s-hero-why`, with the flex chain completed up through
`.s-hero-rail` and `.s-hero-acct` so the free space can reach it. Empty space after a
paragraph reads as a short paragraph; empty space under LIMIT BROKEN reads as a missing
element.

**The gain is larger than moving a hole.** The bands, the limit line and the plate now land
at the same y on all four slides — measured plate-bottom spread **0.0px** — which is *more*
faithful to "only the reading changes" than the pinned plate ever was. It uses
`margin-bottom:auto`, not a `min-height`, so the reserve is exactly what the tallest slide
needs at that width and cannot go stale when copy changes. Scoped to **≤860**, the whole
range in which the rail is stacked, because the same defect was 27px at 768.

Two traps, both recorded in the file because both cost me a false pass:
- **`gap:0` is load-bearing.** `.s-hero-rail` is a flex row at base with
  `gap:var(--s-hero-gap)`, inert while ≤860 set `display:block`. Re-flexing it turned that
  into a 27.9px row gap and grew the hero **712.6 → 740.6** at 375×635.
- **A stale `.s-hero-rail{display:block}` sat *after* the new declaration** and silently
  won, putting the slack back — not under the verdict this time but *below the action link*,
  which is the position an earlier pass had already rejected. Deleted, with a note not to
  reinstate it.

---

## 3. Head line — SHIPPED AND APPROVED

**`"Delhi. Since 2000."` → `"Delhi, then India."`** (home.html:2338). Client-approved
20 August; the old line was false for two cells in the row — Forest loss is India, Forest
fire is North India — and the new one states the editorial rule the client gave instead:
Delhi is the homepage hook, the national frame opens on the inner page. It is true of the
Delhi readings, the national readings and the Swechha figure alike.

**Measured before → after, and the prediction held exactly:**

| | before | after |
|---|---|---|
| head-line ink | 129.1px | **130.2px** (+1.1px) |
| head row height @1440 / 768 / 375 | 31.3 / 31.3 / 46 | **31.3 / 31.3 / 46** — unchanged |
| strip height @1440 / 768 / 375 | 111.2 / 107.7 / 116.5 | **111.2 / 107.7 / 116.5** — unchanged |
| head ink x vs first cell ink x | equal | **equal at all 14 widths** |

**Nothing on the strip reflows at any width.** Verified at 375×635, 375×812, 414×736,
560×900, 768×1024, 901×800, 1017/1018/1019×800, 1024×800, 1200×800, 1440×720, 1440×900,
1920×1080: identical head height, identical strip height, no ellipsis, and the head's ink
still starts on exactly the same x as the first cell's ink at every width (20/20 at 375,
26.1/26.1 at 768, 46/46 at 1440, 216/216 at 1920) — the spine registration AD-02 verified
is intact.

*Captures:* `ad2c-frozen-seam-1440.png`, `ad2c-frozen-head-1440.png` (4×),
`ad2c-frozen-seam-768.png`, `ad2c-frozen-strip-375.png`, `ad2c-frozen-strip-1024.png`,
`ad2c-frozen-fold-375.png`.

**The count field — approved as shipped.** *"Five in window · one record"* stands unchanged.
It is now approved copy and falls under the never-rewrite rule with the rest: it may be
moved or cut, never reworded. Its number is computed and changes with the season; that is
the field's job, not a rewrite.

## 4. The seasonal column count — solved, and the numbers

The client's ruling makes n vary. Two consequences, both handled.

**(a) A returning reader finds a column that was not there before.** The head states the
count — *"Five in window · one record"* — so the variation is reported by the instrument
rather than left to be noticed. That is the same field that serves as the overflow
affordance (AD-02 D1).

**(b) The scroll breakpoint could no longer be a constant fitted to today.** Measured by
binary search with the grid forced, so the number is independent of the media query itself.
Narrowest width at which nothing ellipsises:

| membership | cells | floor |
|---|---|---|
| 5 situations + Impact slot — **today** | 6 | **876px** |
| 6 situations + Impact slot — Heatwave open | 7 | **1018px** |
| 7 situations + Impact slot | 8 | 1195px |

D-00 freezes the list at six situations, so **7 cells is the most this strip can ever hold
and the breakpoint is 1018** — safe for every membership the freeze permits, verified at
1017 (flex) / 1018 (flex) / 1019 (grid). Above it the strip is a grid; below it it scrolls.
At 1017 the label that would go first is "Climate Event".

It was 900 in the shipped file, then 1048, then 981 during this build — each of those was
correct for a membership that had just changed underneath it. **If a seventh situation is
ever added, 1018 is wrong by 177px and must be re-measured, not guessed**; the same is true
if the Impact column's `1.3fr` share moves, which shifted these floors by 37px when it went
from `1.06fr`. That is written at **1382**.

---

## 5. Rulings you asked for

### 5.1 The hue on the Impact slot — **it belongs to the figure, not to the slot**
`groundRhythm` closes green as *"what has been recovered"*. Waste out of the river is a
recovery. "Trees planted" probably is. **"6 million youth reached" and "25 Yamuna Yatras"
are not — they are counts of work done.** So green is applied **per candidate** (`.is-good`
on the cell) and the slot renders plain `--fg` otherwise. **Green was not widened to
"anything Swechha did"** — that is a closed-list rule. **Client-confirmed 20 August: the
ruling stands, taken knowing the practical cost.**

The cost is that an admin selecting "6 million youth reached" gets an off-white numeral
where they may have expected green, and files it as a bug. The mitigation is not code, it
is the panel: **the Impact-slot admin UI must state, at the point of selection, that the
colour follows the kind of figure — a recovery renders green, reach and counts do not.**
Carried into the backend requirements as item 5 so the person building that panel finds it.
Mustard stays banned in the strip; red is impossible here by definition.

### 5.2 Does the flip still earn its place — **yes, and for its original reason**
The flip was never justified by the odd cell. It was justified by the client's actual
question: the strip's first line was six words that were also the deck's tab labels, in the
same face, 68.3px below them at 768. That is fixed at every width regardless of hue. What
carries the Impact slot's identity is now **position** — always rightmost, always present,
while n varies on the left — which is stronger than the green numeral was, because it holds
when the figure is not green. The heavier divider and the wider column reinforce it; they do
not have to carry it.

### 5.3 The rotation ceiling — **state this to whoever fills the admin panel**
The binding width is **375**, where the slot holds **125.0px** of content. Measured against
the client's own examples:

| | value | label | fits at 375 |
|---|---|---|---|
| Out of river | 6,890t (50.3) | 93.0px | ✓ |
| Trees planted | 1.2M (39.9) | 108.3px | ✓ |
| Youth reached | 6 million (65.0) | 112.6px | ✓ |
| Yamuna Yatra | 25 (19.8) | 101.7px | ✓ |
| Students taught | 12,400 (54.3) | 127.3px | **✗** |
| Yamuna Yatras run | 25 | 141.8px | **✗** |

**Ceiling: label ≤ 125px, about 13–14 uppercase characters; value ≤ 125px, about 12 digits.**
All four of the client's examples fit; the slot was widened to make that true — `1.06fr →
1.3fr` in grid, and a fixed 152px at ≤560 / 176px at ≤1018 against the situations' 132/152.
Longer labels **ellipsise**; they do not wrap and they do not push the strip wider. Recorded
at **1344**.

### 5.4 The state vocabulary — **it does not drop to three, and do not simplify the stamp**
You asked me to verify that OUT OF SEASON is now unreachable. **It is not.** The client's own
reason for the ruling names the mechanism: *"admin access to enable/disable a situation
periodically, or through a date formula"* — an editor who switches a situation **on outside
its window** produces exactly a rendered, out-of-season situation. So D-01.10's four words
stand and the hero's corner stamp is unchanged. **No shipped element was touched.**

What the CLOSED question did expose is real and is now a standing rule, written at **1328**:
`closed`, `demo` and `delayed` are **class names**; the public words are Live / Periodic /
Demo data / Out of season. My dormant cell had leaked a class name into copy and put two
names for one state ~80px apart. It generalises as a rule even though the specific cell is
gone — and note one live instance of the same family: Climate Event is `Periodic` in the
hero (D-01.11) while its ticker cell shows 512mm with no cadence mark at all. Flagged, not
fixed; it is a strip-wide provenance question, not this pass's.

### 5.5 Is the Impact slot subject to windows — **no, confirmed**
It is not a situation. It never renders conditionally, so the strip can never be empty: its
floor is one cell. In practice n ≥ 4, since three situations carry `Year round` tags (Air,
Yamuna, Forest fire) and only Climate Event is `In window`.

---

## 6. Verification

Twelve viewports plus the two either side of the breakpoint cliff, all against the shipped
file: **375×635, 375×812, 414×736, 768×1024, 901×800, 1017×800, 1018×800, 1019×800,
1024×800, 1200×800, 1440×720, 1440×900, 1920×1080.**

- `scrollWidth` **equals the viewport at every width**, 375 and 768 included.
- hero at 375×635 is **712.6px** — equal to, not above, the stated ceiling.
- **no ticker label or value ellipsises at any width.**
- **no two adjacent bands share a ground hex** at any width.
- strip height 107.7–116.5px everywhere, inside the 96–120 spec, and below its previous
  value at every width.
- rail contract intact; the flip touches no `--kiss`, `--rl-foot` or numeral geometry.
- mobile slack 0.0px on all four slides at 375, 414 and 768; plate-bottom spread 0.0px.
- mode flips flex→grid exactly between 1018 and 1019.

*Captures:* `ad2c-final-seam-1440.png`, `ad2c-final-seam-768.png`,
`ad2c-final-strip-1024.png`, `ad2c-final-strip-375.png`, `ad2c-final-fold-375.png`.
Before-state: `ad2b-before-*.png`. Option comparison: `ad2b-opt*.png`.

---

## 7. Backend requirements

Consolidated in **§10**, so there is one list rather than two drifting copies.

## 8. Deferred

- **Moving Out of river into the Impact band proper** — superseded. The client has made the
  strip's rightmost cell a permanent pointer *to* Impact, which is better than relocating
  the figure. Impact (section 7) still has to be able to receive the click.
- **Folding Treatment into Yamuna's inner page** — `intelligence.html`, not this section.
- **`#h-heat` and `#h-waste` panels on `intelligence.html`** — both exist in the DOM and
  compute `display:none`. Explicitly accepted for now (*"We will work on populating these at
  next stage"*). No shipped ticker link is dead: Heatwave is absent, and Out of river points
  at `#impact`, which exists on this page.
- **The overflow fade.** Licensed at 8px; AD-02 found it painted on empty ground. With the
  frozen membership and the flip the phone cut now lands **on ink** — 48.3px of clearance at
  375 falls inside cell 4's ink, and 15.6px at 768 — so it bites where it did not. I did not
  widen it, because the count in the head is the affordance that works at every width and a
  40px gradient across a numeral can read as a rendering fault. Worth one look before freeze.
- **Cadence marks in the strip** (§5.4) — Climate Event is Periodic in the hero and unmarked
  in the strip.

---

## 9. FROZEN — the complete list

**Section 2 is frozen as of this pass.** Everything below is settled and measured. Reopening
any of it means re-measuring, not re-deciding from memory — the numbers moved three times
during this build and each move invalidated a constant somewhere else.

**Structure**
1. **Two zones, different rules.** Left: situations, variable count, window-governed. Right:
   one Impact slot, constant, never window-governed. Nothing else goes in this strip.
2. **The flip.** Value leads, rail beneath it, label under the rail. Done with `order`, so
   the DOM keeps label-then-value and links announce "Air, 412". Do not flip it back — the
   label row is what the strip and the deck's tab row had in common, and it is the whole
   answer to the client's question.
3. **The Impact slot is always the rightmost cell**, always present, and position — not the
   divider, not the hue — is what marks it.
4. **No dormant cells.** A shut window renders nothing. The dashed rail still means *a shut
   window* elsewhere in the file; it never appears here.
5. **The rail contract**, untouched: the rule is the numeral's own `::after` on a
   `width:max-content` box, absolutely positioned, breach changes colour and weight only and
   grows downward away from the numeral.

**Numbers**
6. **Scroll breakpoint 1018px** — the worst case the frozen list permits (7 cells), not
   today's 6. Floors: 876 / 1018 / 1195 for 6 / 7 / 8 cells.
7. **Grid `repeat(n,minmax(0,1fr)) minmax(0,1.3fr)`** — the Impact column's 1.3fr share is
   load-bearing; it moved the floors 37px when it went from 1.06fr.
8. **Rotation ceiling: label ≤ 125px, value ≤ 125px** (~13–14 caps, ~12 digits), binding at
   375.
9. **Strip height 107.7–116.5px**, inside the 96–120 spec and below its previous value at
   every width. Do not grow it.

**Copy** — all of the following are approved and may be **moved or cut, never rewritten**
10. Head line **"Delhi, then India."**
11. Count field **"Five in window · one record"**
12. Cell labels: Air · Yamuna DO · Forest fire · Forest loss · Climate Event · Out of river
13. `1.65M ha` carries its unit; every cell carries its own `aria-label`

**Prohibitions**
14. **No mustard in this strip**, including hover and focus. **No red on a control.**
15. **Green means recovered**, and is applied per figure, not per slot.
16. **No controls in the strip** — no tabs, arrows or scrollbar. The head's count is a
    readout, not a control.
17. **Class names never become copy**: `closed` / `demo` / `delayed` are internal; the public
    words are Live / Periodic / Demo data / Out of season.

**Adjacent, and fixed as part of this pass**
18. The mobile slack lands after the sentence, via `margin-bottom:auto` on `.s-hero-why` with
    the flex chain complete through `.s-hero-rail` and `.s-hero-acct`, scoped ≤860.
    `gap:0` on the re-flexed rail is load-bearing. Do not reinstate
    `.s-hero-rail{display:block}`.
19. The deck's fourth tab is **Climate Event**.

---

## 10. Backend requirements — all of them, in one place

Nothing here is mine to build. It is written here because this is the document the next
person will have.

1. **Validity window per situation** — `windowStart`, `windowEnd`, `recursAnnually`
   (D-01.4). Not in `lib/content/schemas.ts` today. This is what makes the situation zone's
   column count seasonal, which the whole left half of the strip now assumes.
2. **A stored `limit` per situation**, so a breach is derived and never typed, and the
   multiplier comes free (D-01.4).
3. **An admin on/off override on the window** — the client's words: *"admin access to
   enable/disable a situation periodically, or through a date formula."* An editor must be
   able to switch a situation **off inside** its window and **on outside** it. This is in
   addition to (1), and it is what keeps OUT OF SEASON a reachable state (§5.4).
4. **The Impact slot** — a set of candidate figures with **exactly one active**,
   admin-selectable, independent of the situation windows. Each candidate carries its own
   value, label, `aria-label` and a **recovery / not-recovery flag that governs the green**.
   Label and value must be validated against the 125px ceiling (§5.3) **at entry**, because
   an over-long label ellipsises silently and nobody will see it on a desktop admin screen.
5. **The Impact-slot panel must explain the green rule where it is used** — *a recovery
   figure renders green; reach figures and counts render off-white* (§5.1). Agreed
   mitigation for the client's ruling; it is admin copy, not behaviour, which is exactly why
   it goes missing if it is not written down.
6. **The head's count is computed**, not typed — "Five in window" must follow (1) and (3),
   or it becomes the strip's own lie the first time a window turns over.

---

## 11. What should NOT be frozen

Three things in this band are soft. I would rather name them than let the freeze imply a
confidence I do not have.

**11.1 The 1018px breakpoint under a membership I have not seen.**
I measured 6, 7 and 8 cells with today's label strings. 1018 is the n=7 floor and it is
correct for every membership D-00 permits. But **I have never rendered the n=7 case for
real** — Heatwave's window is shut, so the seven-cell strip exists only as an injected
simulation. When Heatwave first opens, that width should be re-measured against the actual
cell before anyone trusts it. And if a seventh situation is ever added, 1018 is wrong by
177px; it is not a number to adjust by eye.

**11.2 The seasonal count wording at an unusual n.**
"Five in window · one record" reads correctly at five and will at six. It has not been seen
at **one** — the degenerate case where every window but Air's is shut, which is arithmetically
possible in, say, February. At n=1 the line reads "One in window · one record" over a strip
of two cells, and a two-cell grid at 1440 gives each cell ~700px, which will look nothing
like an instrument. I did not design for it because I do not know whether it can occur — that
depends on the window dates, which do not exist yet (backend item 1). **Flag: once the windows
are entered, render the narrowest real membership and look at it.** If n can drop below about
three, the grid needs a minimum column count or a maximum column width, and that is a change
to a frozen rule.

**11.3 The Impact slot with a very short figure.**
The ceiling is measured; the floor is not. Every candidate I tested was 19.8–68.9px of value.
A one-character value — "9", or a figure like "3" Yatras — sits in a 214px column at 1440
with its flat rail only ~12px wide, and that rail is the site's signature mark. It will read
as a dash rather than as a rule. The strip's texture comes from rules of different lengths,
but there is a length below which a rule stops being one, and I have not established it. It
cannot arise today (6,890t is 50.3px) and it is cheap to check when the rotation is first
used in anger.

**Also still open, and not blocking the freeze:** the overflow fade (§8) — it now lands on
ink where it did not before, so it works by accident rather than by design and deserves one
look; and Climate Event is `Periodic` in the hero while its ticker cell carries no cadence
mark at all, which is a strip-wide provenance question rather than a defect in this pass.

---

## 12. Correction to the record

The instruction that OUT OF SEASON was dead — that the client's "closed situations do not
appear" ruling had made the value unreachable and the stamp's vocabulary could drop to three
— **was wrong, and it was right to check it against the page rather than act on it.** The
client's own reason for the ruling names the mechanism that keeps it alive: an admin override
that can switch a situation **on outside its window** renders exactly a situation that is
out of season. Acting on the instruction would have removed a working state from a shipped
element, in the one band whose entire argument is that it never overstates what it knows.
D-01.10's four-word vocabulary stands and the hero's corner stamp was not touched.
