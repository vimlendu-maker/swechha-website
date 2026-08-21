# AD-01c — THE MOBILE RAIL, THE MASTHEAD LOCKUP, AND THE AIR CUT

Three items ruled and built, 20 August 2026. All three are in
`public/design/v3/home.html`. Nothing outside the hero was touched.

**No overrule on item 1.** The client's primary instruction — shorten the rule to
the block beside it — is the right one and is what shipped. Both of their
alternatives were tested against the rail contract and both break it; the reasons
are in §1.2, stated because they offered them, not because I took them.

**Method.** Chrome DevTools Protocol, `Emulation.setDeviceMetricsOverride` at
320×568, 375×635, 375×812, 414×736, 560×760, 561×760, 768×1024, 1024×800,
1440×900 and 1920×1080 — real device metrics, never a bare `--window-size`. All
four slides measured at every width. Baselines are measured, not derived from box
edges: a zero-size `inline-block` appended to the last line reports that line's
baseline as its own `bottom`. Captures come from the same sessions, so the numbers
and the pictures agree. New files in `docs/design/img/sections/` (`adc-*.png`).

---

## 1. THE MOBILE RAIL

### RULING

**The rule ends on a baseline, not on a box: it runs from the numeral's cap line
to the last baseline of the pair it holds, and that terminal is `--rl-foot:.042em`
of the numeral's own size — the vertical twin of `--kiss` — because a box bottom
is not a terminal a mark can be measured from.**

The reason, in one line: at 375 the rule's bottom was set by two things that have
nothing to do with the mark — a flex row's content box, which on Air is itself
inflated by `.mult`'s trailing `1em` paragraph margin, plus a 12px overhang — so it
ran 30.0px past the block's last ink and 40.8px past its last baseline. That is what
the client saw.

### 1.1 What was actually wrong

The rail's *horizontal* contract is type: `--kiss` is `.06em` of the numeral's own
size, so the optical gap is identical at 99.2px and at 272px. Its *vertical*
contract was not type at all. At ≤860 `.s-hero-read` is a flex row with
`align-items:stretch`, so `.s-hero-numwrap` — which owns the rule — is stretched to
the row's content height, and the rule was then pushed 12px past even that.

Measured at 375×635, Air:

| edge | y |
|---|---|
| numeral cap line (ink top) | 267.56 |
| numeral line-box top (`rule top`) | 267.80 |
| numeral baseline | 336.80 |
| block's last baseline (`.mult`) | 356.69 |
| block's last ink box bottom | 367.48 |
| **row content box bottom** (+ `.mult`'s trailing 1em) | 385.48 |
| **rule bottom** (+ `--s-hero-drop`) | 397.49 |

Two of those three lowest edges are typographic accidents. `.mult` is the only
`.s-hero-num-side` child on any slide that is a `<p>`, so it alone inherits
`p{margin:0 0 1em}` = 18px, and the flex stretch handed that 18px straight to the
rule as length. Air is therefore the only slide whose rule was measured from
something other than type — and Air is the slide the deck opens on.

The rule's *top* was already correct and is untouched: the readout's `line-height:.74`
puts its line-box top within 0.24px of the cap line at 375. Cap line to baseline is
the numeral's own optical extent; the terminal now agrees with the origin.

### 1.2 The client's two alternatives, and why neither ships

Both were offered as ways to make the block long enough to justify the rule. Both
fail on the rail contract in §4 of AD-01, not on taste.

**"Move SEVERE under 412."** The rule is drawn as the `::after` of a
`width:max-content` wrapper around the digits. Putting the verdict inside that
wrapper widens the shrink-wrapped box to the width of "NOTHING CAN BREATHE" and
carries the rule away from the numeral with it — the one thing `left:100%` on a
max-content box exists to prevent. Putting it *outside* the wrapper, in a left
column under the numeral, leaves the rule spanning the digits only (69.3px) while
the block beside it runs to 99.7px on Air: the rule becomes *shorter* than the
thing it holds, which is the same defect inverted. The verdict would also be set in
a 116.5px measure at 375, taking "Nothing can breathe" to four lines.

**"Move SEVERE into the text block on the right."** The block's measure at 375 is
189.6px. `.verdict` is 18.4px Archivo at `.03em` tracking; "Nothing can breathe"
needs 2–3 lines there, "Below season" 2. It would add height to a band already
712.6px against ~635px of visible iOS Safari, and it would move the deck's plainest
word off the full-width line where it currently lands alone.

The client's primary instruction has neither problem and is what the mark should
have done from the start.

### 1.3 What the 12px overhang was for — asked before deleting

It was deliberate, and it was doing a real job. `--s-hero-drop` is used twice:
as `.s-hero-read`'s `padding-bottom` and, negated, as the rule's `bottom`. The two
together landed the rule's last pixel **exactly** on `.s-hero-acct`'s `border-top`
(measured at 375×635, Air: rule bottom 397.49, hairline top 397.48) — a T-junction
where the vertical mark hands over to a horizontal one that carries the same breach
tint (`.s-hero-rail.breach .s-hero-acct{border-top-color:rgba(241,72,78,.45)}`).
The old comment called it "the handover" and it is visible in
`adc-rail-375-air-before.png`.

**It is given up knowingly.** One terminal has to serve four slides, and the
handover can only be kept by measuring the rule from a neighbouring object's border
— which is what produced the 30px overhang on Air. It cannot be kept by moving the
hairline up to meet a shorter rule either: `--s-hero-drop` set to 0 would put the
hairline 3.2px under the digits of "0.0" and read as an underline on the numeral.

**Nothing below the rail moved.** The 12px is still there as `.s-hero-read`'s
`padding-bottom`; only the rule now stops short of it. Verdict, why, bands, limit,
plate and bar are at identical y on every slide at every width, except for the 18px
Air recovers from the `.mult` margin (§1.6).

### 1.4 The change

| file:line | before | after |
|---|---|---|
| `public/design/v3/home.html:1066` | `.s-hero{--s-hero-drop:12px}` | `.s-hero{--s-hero-drop:12px;--rl-foot:.042em}` |
| `public/design/v3/home.html:1072` | `.s-hero-numwrap.rl::after{bottom:calc(-1 * var(--s-hero-drop,22px))}` | `.s-hero-numwrap.rl::after{bottom:var(--rl-foot)}` |
| `public/design/v3/home.html:1092` | `.s-hero-read .mult{margin-top:10px}` | `.s-hero-read .mult{margin:10px 0 0}` |

All three are inside `@media (max-width:860px)`. Comment at `home.html:1008–1025`
rewritten to state the new terminal and to record what the overhang was for;
comment at `home.html:1059–1065` added for `--rl-foot`.

`.042em` is the readout's own **baseline drop** — the distance its `.74` line box
falls below its baseline, which is a property of the type and not of any viewport.
Measured directly: 4.40px on a 99.2px readout (.0444), 5.02px on 117.6 (.0427),
6.35px on 161.28 (.0394). One value, no breakpoint, exactly as `--kiss` is one
value.

The `.mult` margin change is scoped to ≤860 on purpose: on desktop
`.s-hero-num-side` is bottom-aligned by `margin-top:auto`, and that same trailing
margin is part of what sets the multiplier on the rail's bottom edge (AD-01 D3).
Removing it globally would move the desktop multiplier 18px down.

### 1.5 Measured, before → after

Rule bottom relative to **the deepest baseline in the row** (negative = the rule
stops above it):

| width | Air | Yamuna | Monsoon | Forest fire |
|---|---|---|---|---|
| 320 | +40.8 → **+6.6** | +17.4 → **+1.2** | +17.4 → **+1.2** | +17.4 → **+1.2** |
| 375 | +40.8 → **+6.6** | +16.4 → **+0.3** | +16.4 → **+0.3** | +17.4 → **+1.2** |
| 414 | +40.8 → **+6.6** | +16.4 → **+0.3** | +16.4 → **+0.3** | +16.4 → **+0.3** |
| 560 | +30.4 → **+0.1** | +17.0 → **+0.1** | +17.0 → **+0.1** | +17.0 → **+0.1** |
| 768 | +18.3 → **−0.4** | +18.3 → **−0.4** | +18.3 → **−0.4** | +18.3 → **−0.4** |

Rule height at 375×635: Air 129.7 → **95.5**, Yamuna 85.4 → **69.3**, Monsoon
85.4 → **69.3**, Forest fire 91.3 → **75.1**.

Which object governs the terminal changes with the content, which is the point of
deriving it: at 320 the block is deeper on all four slides (the identity and the
unit both wrap); at 375/414 the block governs Air and Forest fire and the numeral
governs Yamuna and Monsoon; at 560–860 the numeral is deeper on all four. On the
numeral-governed slides the rule now ends **within 0.3px of the numeral's own
baseline** — flush with the bottom of the digits, visible in
`adc-rail-375-monsoon-after.png`.

### 1.6 Height

Air's rail row loses the 18px `.mult` margin, so Air's natural slide height goes
550.1 → 532.1 at 375×635. **The hero's height does not change at any width**
(712.63 → 712.63 at 375×635), because Forest fire is the tallest slide at 320, 375
and 414 and it is unaffected; Air's 18px goes into its `margin-top:auto` slack
above the provenance plate, which is where AD-01 already ruled slack belongs.

### 1.7 Captures

`adc-rail-375-air-before.png` / `adc-rail-375-air-after.png` (3×, identical clip) —
the pair the ruling rests on. `adc-rail-375-yamuna-after.png`,
`adc-rail-375-monsoon-after.png`, `adc-rail-375-fire-after.png` — the other three
slides. `adc-rail-320-air-after.png` — the worst case, identity and unit both
wrapped, same mechanism, no width-specific value. `adc-rail-768-air-after.png` —
the tablet end of the rotated rail. `adc-hero-375-air-after.png` — the whole band.
Read, not just generated.

### 1.8 What it holds to at the extremes

At **320** the block is at its deepest (two-line identity, two-line unit) and the
rule ends 6.6px under "4.1× the limit"; at **768–860**, the top of the rotated
rail's range, the numeral is 161.3px and the block three centred lines, so the rule
ends on the numeral's baseline and the block floats beside it 11–31px clear. That
asymmetry is correct and unavoidable: a rule that belongs to a numeral cannot be
shorter than the numeral. Below 561 — the widths the client was looking at — the
block is always within 6.6px of the terminal.

---

## 2. THE MASTHEAD LOCKUP

### RULING

**The strapline stops borrowing `--gap-head` and takes the gap off the h1's own
size, `.22em`, exactly as `--kiss` takes the kiss off the numeral's — and this is
not a fourth internal gap, because the token already exists in this file for this
exact row and was already derived this way below 561; it now does so at every
width, so the page ends with one fewer distinct number than it had.**

### 2.1 The value, and why it read loose

`--gap-head` is defined as "headline → its lead/body". A masthead strapline is the
second half of one object, not a lead paragraph, so the token was carrying a
relationship it does not describe — which is exactly what `spaceRules` warns
against, from the other direction.

The looseness is also worse than the number says, and the brief's estimate needs
one correction. The h1 is set **uppercase** at `line-height:.86`, so its em box
overflows but its *ink* does not: measured at 1440, cap top is 2.42px **below** the
box top and the baseline is 6.78px **above** the box bottom, and the micro-caps' cap
line sits 3.69px below their own box top. The optical gap — h1 baseline to
strapline cap line — was therefore **33.5px against a 23.04px token**, 45% more air
than the value suggests. That is why it reads loose at a size where 23px should
have been fine.

`--s-hero-row2gap` already existed at `home.html:840`, already fed
`--s-hero-row2top` → `--s-hero-lid`, and already redefined itself as
`calc(var(--s-hero-h1) * .22)` below 561. It is now that at every width and the
≤560 override is deleted as redundant.

**Changing the token rather than the margin is not optional.** The mast's gradient
lid is built from `--s-hero-row2top`. Move the margin alone and the lid keeps
covering a row that is no longer there — the strapline would sit past the end of
its own scrim. Verified after the change: `lid ≥ tag box bottom` at 561, 768, 1024,
1440 and 1920, with 0.02px to spare at 1440 (117.83 vs 117.81).

### 2.2 The change

| file:line | before | after |
|---|---|---|
| `public/design/v3/home.html:840` | `--s-hero-row2gap:var(--gap-head);` | `--s-hero-row2gap:calc(var(--s-hero-h1) * .22);` |
| `public/design/v3/home.html:868` | `.s-hero-tag{margin:var(--gap-head) 0 0;…}` | `.s-hero-tag{margin:var(--s-hero-row2gap) 0 0;…}` |
| `public/design/v3/home.html` ≤560 block | `.s-hero{--s-hero-row2gap:calc(var(--s-hero-h1) * .22)}` | deleted — it is now the default |

Comment at `home.html:823–839` states the rule; the ≤560 comment is amended to say
the override moved up rather than disappeared.

### 2.3 Measured, before → after

| width | box gap | optical gap (h1 baseline → strapline cap line) | mast box height |
|---|---|---|---|
| 561 | 18.00 → **7.03** | 25.20 → **14.23** | 96.77 → 85.80 |
| 768 | 18.00 → **8.44** | 25.70 → **16.14** | 102.27 → 92.70 |
| 1024 | 18.00 → **11.25** | 26.72 → **19.97** | 122.27 → 115.52 |
| 1440 | 23.03 → **14.78** | 33.50 → **25.25** | 152.06 → 143.81 |
| 1920 | 28.00 → **14.78** | 38.47 → **25.25** | 157.03 → 143.81 |

Band height at every width: **unchanged** (825 at 1440×900, 891 at 1920×1080,
719.42 at 1024×800, 688.58 at 768×1024, 664.30 at 561×760) — `.s-hero-mast` is
`position:absolute`, so the lockup costs and refunds nothing. The lid shrinks by
the same amount the gap does, which hands 8.25px of frame back to the photograph at
1440 and 13.22px at 1920 — a small credit against D2's 40%-unveiled floor.

### 2.4 Captures

`adc-mast-1440-before.png` / `adc-mast-1440-after.png` (2×, identical clip),
`adc-mast-561-after.png`, `adc-hero-1440-after.png`.

### 2.5 What it holds to at the extremes

At **561**, where the line first appears, `--s-hero-h1` is on its 2rem floor, so the
gap is 7.03px and the optical gap 14.23px against an 8.31px cap height — tight, and
correct for a lockup; the h1 is uppercase and the strapline is uppercase, so there
are no descenders and no collision is possible at any width. At **1920** the h1 is
on its 4.2rem ceiling, so the gap stops growing at 14.78px where `--gap-head`
carried on to 28px — the old value was loosest exactly where the lockup most needed
to hold together. Below 561 nothing changed at all: the ≤560 mast box is 61.52px
before and after, and the state stamp's row is at the identical 52.55px offset,
because the deleted override and the new default are the same expression.

---

## 3. THE ≤560 CUT ON AIR

### RULING

**The cut is the arithmetic, not the second sentence: on Air the `.s-hero-cut` span
moves from sentence two to sentence one, so the phone keeps "Schools in this ward
are three kilometres from the monitor that recorded it." and drops "Four times the
limit the Central Pollution Control Board sets for a safe day."** Word for word
unchanged; ≥561 renders the whole paragraph in its original order.

Air was the only slide whose sentences run arithmetic-first, so implementing the cut
positionally inverted the principle it was granted on. It also had the phone stating
one fact three times in one screen — "4.1× the limit" beside the numeral, "CPCB SAFE
LIMIT 100. LIMIT BROKEN." under the bands, and the sentence.

`public/design/v3/home.html:2027`, with the reason recorded in a comment above it.
The `@media (max-width:560px)` comment that read "THE SECOND SENTENCE COMES OFF"
is corrected to "THE ARITHMETIC COMES OFF", since the span's position is now per
slide rather than per sentence number — the comment was the thing that made the
positional reading look authorised (`home.html:1130`).

### 3.1 Height — no cost

The two sentences are 76 and 75 characters and set to the identical line count at
every width. Air's slide height, measured with the old markup and the new in the
same session:

| width | before | after | Δ |
|---|---|---|---|
| 320×568 | 597.03 (3 lines) | 597.03 (3 lines) | **0** |
| 375×635 | 532.08 (2 lines) | 532.08 (2 lines) | **0** |
| 414×736 | 516.06 (2 lines) | 516.06 (2 lines) | **0** |
| 560×760 | 525.31 (2 lines) | 525.31 (2 lines) | **0** |
| 561×760 | 572.30 (3 lines) | 572.30 (3 lines) | **0** — full paragraph both sides |

Hero height unchanged at every width. The surviving sentence sets cleanly in the
measure with no orphan: `adc-hero-375-air-after.png`.

### 3.2 The other three, checked against the principle — no change made

| slide | survives at ≤560 | cut | verdict |
|---|---|---|---|
| Yamuna | "The river enters Delhi alive and leaves it without oxygen." | "Twenty-two kilometres of it are inside the city, under two per cent of its length, and they carry most of its pollution load." | **Passes.** Survivor names the subject; the cut is arithmetic that appears in full on the situation page. |
| Monsoon | "Above normal is not the same as illegal, so this page does not turn red for it." | "What floods the drains is a single day above 100mm, and there have been two." | **Passes**, and it is the one survivor that must never move — AD-01 §1 names this sentence as the band's through-line stated out loud. |
| Forest fire | "A detection is a thermal anomaly, not a confirmed fire, and in Punjab and Haryana in October it is very often crop residue rather than forest." | sentences two **and** three: "This situation counts detections. What was actually lost is a different situation on a different clock." | **Passes.** The span covering two sentences leaves a sensible survivor — the definitional caveat, which is the honest sentence on that slide. The cut is a scope note rather than arithmetic, and the scope note is the part that is legible only after the caveat is understood. |

One finding to hand back rather than act on: **Forest fire, not Air, is the phone
band's height driver.** Its survivor is 137 characters and sets to 4 lines at 320
and 375 and 3 at 414, and it is the slide with zero `margin-top:auto` slack at all
three widths — i.e. it alone sets the hero's 712.6px at 375×635. If the band needs
more height back later, that sentence is where it is, and its second clause ("and in
Punjab and Haryana in October it is very often crop residue rather than forest") is
a candidate. It is approved copy on the slide whose whole point is not overstating,
so it is a client decision, not mine.

---

## 4. REGRESSIONS CONFIRMED

Measured after the change at all nine widths, all four slides.

- **Desktop rail unmoved.** At 1440×900 the rule's height is 201.27 before and
  after, its bottom edge is at the identical y on all four slides, and the numeral
  box is 146.5→465.97. Identical at 1024 and 1920. Nothing in `@media (max-width:860px)`
  can reach it, and no rule outside that block was edited.
- **`--kiss` is `.06em` of the numeral at every width**: 5.95px on 99.2 (320/375/414),
  7.06 on 117.6 (560), 7.07 on 117.81 (561), 9.68 on 161.28 (768), 12.90 on 215.04
  (1024), 16.32 on 272 (1440/1920). Computed ratio 0.06 exactly in all 36 cases.
- **The numeral does not move between breach and non-breach.** Within each width,
  numeral left/right and rule x are identical on breach (Air, Yamuna) and non-breach
  (Monsoon, Forest fire) slides — at 375, all four sit at 21→137.52 with the rule at
  143.47. Only the rule's width changes (6px vs 1–3px), and it still grows rightward.
- **`document.documentElement.scrollWidth` equals the viewport** at 375 and 768 —
  and at 320, 414, 560, 561, 1024, 1440, 1920.
- **Hero height at 375×635: 712.63 → 712.63.** Unchanged, not higher. Unchanged at
  every other width too (320: 767.83, 414: 680.98, 560: 653.88, 561: 664.30,
  768: 688.58, 1024: 719.42, 1440: 825, 1920: 891).
- **The mast's lid still covers the type it protects** at every width where the
  strapline renders, and the ≤560 mast is byte-for-byte the same geometry as before.
