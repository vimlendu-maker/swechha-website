# AD-01 — THE HERO, implemented

20 August 2026. Against `docs/design/2026-08-20-AD-01-hero.md`, plus the two
mid-flight rulings (D1 restored to scope; D9 keeps its box).
One file changed: `public/design/v3/home.html`. Nothing below the ticker seam
was touched — verified, see "Below the seam" at the end.

**How this was measured.** Same method as the AD: headless Chrome driven over
the DevTools Protocol with `Emulation.setDeviceMetricsOverride` (real device
metrics, `mobile:true` + `deviceScaleFactor:3` on the phone sizes), never
`--window-size`. Geometry and screenshots come from the same session, so the
numbers and the pictures agree. Baseline numbers were re-derived from the live
page before any edit and reproduce the AD's exactly (clippedAbove 14.0, void
726.1, hero 825 at 1440×900, 806.9 at 375×635), which confirms the two runs are
comparable. Viewports swept: 1440×900, 1440×720, 1920×1080, 1024×800, 768×1024,
767×900, 414×736, 375×812, 375×635, plus 640×900 for the crop boundary. Every
slide of the deck was measured at every width, not just Air.

---

## One line per defect

### D1 — no navigation below 768. FIXED.
`home.html:387` (the `@media (max-width:767px){.navscroll{display:none!important}}`
kill) deleted; `home.html:414–415` invert the stick; `home.html:417–421` restore
the row and add the 8px mask copied from the hero's own tab strip;
`home.html:381–405` the comment rewritten to record the decision instead of the
superseded one.

- Links reachable on a phone: **0 → 6**, all present at 375×812, 375×635,
  414×736 and 767×900.
- The row scrolls: `navscroll.scrollWidth 416` vs `clientWidth 375`, and the
  document does **not** widen — `document.documentElement.scrollWidth === 375`.
- Only the bar stays: at 375, scrollY 400 → `.nav-in` top **0**, bottom 56, width
  375 (full bleed); `.navscroll` bottom **−294**, off screen.
- Desktop untouched: at 1024/1440/1920 `.nav` is still `sticky`, `.nav-in` still
  `static`, `padding-top` still `0px`, header still **63px**.
- Height cost: header **57px → 105.8px** at 375 (+48.8), so the hero's top offset
  moves 57 → 105.8. See the D10 note at the end.
- Captures: `m-375x812`, `m-375x635`, `m-sticky-375` (scrolled), `m-768x1024`.

**Correction to the prescribed mechanism — please read.** `.nav-in{position:sticky}`
does not work and I did not ship it. A sticky box is constrained to its own
containing block; `.nav` is only 105.8px tall, so the "sticky" bar leaves the
screen with the header. Measured with the prescription applied verbatim: at 375,
scrollY 400 put `.nav-in` at top **−350**. Shipped instead:
`.nav{position:static;border-bottom:0;padding-top:56px}` +
`.nav-in{position:fixed;top:0;left:0;right:0;z-index:60;…}`. Same intent, same
height, same full-bleed reasoning (`max-width:1580px` is inert below 940), and it
actually leaves one row on screen. Still confined to the existing
`@media (max-width:940px)` block, as instructed.

### D3 — the 11.8px baseline near-miss. FIXED.
`home.html:848–849` (`.s-hero-read` becomes a flex column), `:877`
(`.s-hero-num-side{margin-top:auto}`), `:878`
(`.s-hero-scale{margin-top:auto;padding-top:var(--gap-block)}`), with
`:957` and `:961` and `:982` neutralising all three at ≤860.

`.unit` → `.limit` baseline delta at 1440×900, per slide:

| slide | before | after |
|---|---|---|
| Air | 11.8 | **46.8** (three descending levels: unit / multiplier / limit) |
| Yamuna | 36.6 | **0.0** (shared exactly) |
| Monsoon | 11.8 | **0.0** |
| Forest fire | 61.3 | **0.0** |

Same at 1024 (was 20.4 / 45.2 / 20.4 / 69.9) and 1920.

Both lines kept. Neither was rewritten. The mechanism is the point: the two
stacks previously fell out of two independent origins, so the gap was whatever
that slide's copy happened to leave — which is why it was 11.8 on two slides and
61.3 on another. Both now terminate on one line, the rail's bottom edge, so on
the three slides that have no multiplier `.unit` and `.limit` share a baseline
exactly, and on Air, where a multiplier exists, it takes the numeral's last slot
and the limit line sits one full line (28.4px) below it — a level, not a
near-miss. The scale keeps its `--gap-block`, so no rail top and no hero height
moved: 825 / 707 / 719.4 / 891 before and after.
Captures: `v-d3-1440` (2× on the strip), `v-slide2-1440`, `v-slide3-1440`.

### D4 — the active-tab marker never painted, and it was red. FIXED.
`home.html:454–455` (the −14px moves from the button to the container),
`:456–458` (button loses `margin-top`), `:379` (the ≤940 copy loses it too),
`:463–471` (the red variant deleted, comment recording why).

- `clippedAbove`: **14.0px → 0.0px** at every width (1440, 1024, 768, 767, 414,
  375×812, 375×635, 1920).
- Selected marker: **`3px rgb(241,72,78)` → `3px rgb(251,248,240)`** — `--fg`
  off-white, not mustard. Red is off the control.
- Nothing else moved: the strip's margin box is the same height it was
  (32 − 14 = 18 on desktop, 44 − 14 = 30 at ≤940, both unchanged), so the bar's
  layout is identical.
- The base `.rig-tabs` rule was fixed, not forked into a `.s-hero-bar` override.
- Captures: `v-bar-1440` (3× on the strip — the white bar over AIR is visible),
  `v-slide2-1440`, `v-slide3-1440`, `m-375x812`, `m-768x1024`.

**The "shared rule" premise does not hold in this repo — flagging it.**
`public/design/v3/*.html` are self-contained pages, each with its own `<style>`
block; there is no stylesheet shared with `intelligence.html`. I verified after
the change: `intelligence.html` still computes `clippedAbove 14`,
`btnMarginTop -14px`, selected border `3px rgb(241,72,78)` and
`.tag-season` `dashed` — unaffected by anything I did, and still carrying D4 and
D9 in its own copy. The journeys rail in `home.html` is `.s-journeys-*`, not
`.rig-tabs` at all, and renders unchanged (`reg-journeys-1440`,
`reg-journeys-375`). **`intelligence.html` and `about.html` need the same three
edits when their sections come up.** I did not make them: target was home.html.

### D5 — the 726px void. FIXED.
`home.html:906–907`.

- Void between the last tab's ink and "1 of 4": **726.1px → 32.0px** at 1440,
  **726.1 → 32.0** at 1920, **532.5 → 32.0** at 1024, **251.3 → 16.0** at 768
  (which is `--s-hero-clear` at that step). Unchanged at ≤560, where the count
  keeps its own row (`:1021` resets the margin).
- Arrows stay flush right and stay on the column: arrows right edge **1294.0**,
  "THE FULL INSTRUMENT →" right edge **1294.5**, before and after.
- Implemented as `margin-left:calc(var(--s-hero-clear) - 12px)` rather than the
  one-liner's `margin-left:var(--s-hero-clear)`: `.rig-bar` already has
  `gap:12px`, so the literal version measures 44px, not the band's own clear
  distance. The calc makes the measured gap exactly 32.
- Capture: `v-bar-1440`, `v-1440x900`, `m-1024x800`.

### D6 — the 59.2px sideways jump. FIXED.
`home.html:1891` (markup: `0<span class="dp">.</span>0`) and `:336` (+ its
comment at `:320–335`).

- `.s-hero-acct` left edge across the four slides at 1440: was
  520.3 / **461.1** / 520.3 / 520.3 → now **520.3 / 520.3 / 520.3 / 520.3**.
  Jump **59.2px → 0.0px**.
- Readout box width: 319.5 / **260.3** / 319.5 / 319.5 → **319.5 ×4**.
  Rule x: 482.3 / **423.1** / 482.3 / 482.3 → **482.3 ×4**. Identical at 1024,
  768, 414 and 375.
- The account was **not** pinned to a grid line; only the glyph is padded.
- One thing the prescribed `width:1ch` gets wrong, corrected in the code and in a
  comment: `1ch` alone overshoots by 9.5px (it made "0.0" 329.0 against "412"'s
  319.5). Two real corrections are needed — a tabular digit here occupies
  .3915em (advance .4295em plus the readout's −.038em tracking) while `1ch`
  reports .42665em, and an inline-block is not given the letter-spacing a glyph
  gets. Shipped `width:calc(1ch - .0351em)`; every term scales with font-size, so
  it is exact at 272px and at the 99.2px floor alike.
- Capture: `v-slide2-1440`.

### D7 — the resting rail was not a mark. FIXED.
`home.html:851–862`.

- Non-breach rule: **`1px rgba(251,248,240,.20)` (≈1.74:1) → `3px rgb(156,149,133)`**
  (`--fg-3`, 6.4:1) at 1440 and 1920; 2px at 1024; 1px at 768 and below.
- Breach untouched: still `6px rgb(241,72,78)`, still grows rightward, and the
  numeral does not move — numeral left edge and rule x are identical across all
  four slides at every width (checked as a set-of-one at each viewport).
- Set on `.s-hero .rl`, not on `.s-hero .rl::after`, so `.breach .rl::after`'s
  direct declaration still wins on the pseudo-element.
- Capture: `v-slide3-1440`, `z-rail-slide3` (8× — a solid warm-grey bar with the
  kiss gap intact).

**Two deviations, both deliberate.** (1) Scoped to `.s-hero` rather than changed
on the global `.rl::after` default, because the global default is also the farm
ledger's rule and "anything below the ticker seam" is out of scope. The ratio is
ready to be promoted to the global default when sections 2–12 are worked — the
farm ledger is the only other consumer of the default and still shows
`1px rgba(251,248,240,.20)`. (2) Chrome floors border-width to whole CSS pixels,
so the AD's predicted 3.3 / 2.6 / 1.2px render as 3 / 2 / 1px. The colour change
is doing most of the work at the small end; at 768 the rule is still 1px, though
now at 6.4:1 instead of 1.74:1.

### D8 — the paragraph was the smallest running text in the band. FIXED.
`home.html:879–882`; the `font-size:16px` override at ≤860 deleted.

- **16.5px/58ch (538.3px) → 18px (`--t-body`)/62ch (613.8px)** at every width;
  at ≤860 **16px → 18px**.
- Cost at 1440×900: hero height **825 → 825**. It absorbed into the rail's
  existing slack; the AD's ~12px estimate turned out to be 0.
- Capture: `v-1440x900`, `m-375x812`.

### D9 — dashed meant "closed window". FIXED.
`home.html:595–602`.

- `.tag-season` border-style **dashed → solid** at every width. Colour, geometry
  and the box itself are unchanged, per the client's ruling that the validity
  window is load-bearing and must stay a discrete object. Dashed is now used only
  by `.closed .rl::after` and `.state.closed i`, both of which mean a shut window.
- Applies to all four instances in this file through the one class rule.
- Capture: `v-1440x900` ("YEAR ROUND"), `v-slide3-1440` ("IN WINDOW").

**One thing to confirm.** The instruction said "Solid hairline, `--fg-3`, same
geometry as now — the only change is `border-style: dashed` → `solid`". Those
two halves conflict: the tag currently inherits `--fg-2` (`rgb(205,199,183)`) from
`.tag`, so holding "the only change is border-style" means the colour stays
`--fg-2`. I took the explicit scoping clause and left the colour alone —
`--fg-3` came from the "no box" variant that was dropped, and demoting a
load-bearing tag seemed the wrong way to resolve it. **Say the word and it is a
one-token change.**

### D11 — the 144px provenance plate. IMPROVED, not to the projected figure.
`home.html:1879` (`, Anand Vihar` wrapped), `:1000–1013` (`.s-hero-loc` dropped,
`.s-hero-src{flex:1 1 0}`, a 12px column gap so the chip can sit beside it).

- Plate height at 375×812: Air **144 → 106.8**, Monsoon **144 → 106.8**,
  Forest fire **144 → 106.8**, Yamuna **144 → 126.4**.
- Rows: **3 → 2** on every slide (the LIVE chip now shares the source's row; the
  action link keeps its own).
- Copy cut, not rewritten: at ≤560 the Air source reads
  "CPCB continuous monitor. Read 07:00 IST today." — 45 characters, exactly as
  specified. Above 560 the place name is still there.
- Capture: `m-375x812`, `m-375x635`, `m-768x1024` (place name intact at 768).

**The AD's "2 rows, ~46px" is not reachable and the arithmetic does not close.**
Two independent measurements say so. (a) The cut source renders **299px**, and
with the LIVE chip on the same row the measure is 278px — so it takes two lines
beside the chip no matter what; the AD's own 302px figure was computed against
the full 334px measure, which the chip then takes 56px of. (b) Even at one line,
2 rows cannot be 46px: the action link alone carries a 44px min-height from the
thumb-target rule, so the floor is ~85px. The realistic saving is the 37.2px
delivered, and it only reaches the band because the same row-sharing also cuts a
row off Yamuna, Monsoon and Forest fire, whose sources are 435–504px and were
never going to fit one line. **D10's budget should be re-planned around ~37px
here, not ~98px.**

### D12 — the reading was unidentified for its first 90px. FIXED.
`home.html:908–912` (hidden in the num-side by default), `:963–971` (swapped at
≤860), markup `:1862`, `:1894`, `:1925`, `:1956`.

- At 375, the identity is now the **first** thing right of the rule, at the
  numeral's own top: `.s-hero-num-side .s-hero-id` top **166.3**, level with the
  numeral (166.3), above the unit (208.8) and the multiplier (237.2). It was at
  **267.5**, fourth, below the hairline — 101px into the reading.
- Desktop unchanged: at 1440/1920 the account-column identity still sits at the
  rail top (370.3) and the num-side copy computes `display:none`.
- Capture: `m-375x812`, `m-375x635`, `m-768x1024`.

**It is a duplicated element, not a moved one, and that was unavoidable.**
`order` cannot move a node between parents, and the two positions have different
parents (`.s-hero-acct` on desktop, `.s-hero-num-side` at ≤860). The alternatives
all cost more than they save: `display:contents` on `.s-hero-acct` deletes the
full-width hairline that carries the breach state — the thing D14 singles out as
better than the doctrine — and a grid restructure of `.s-hero-rail` breaks the
rule's `bottom:calc(-1 * var(--s-hero-drop))` termination on that hairline. So
the string appears twice per slide with exactly one displayed at any width. The
file already renders the identity twice (the `.sr` span) and a third time in the
article's `aria-label`, so this is consistent with what is there; no copy was
altered.

### D13 — the halftone did not scale with the frame. FIXED, both halves.
`home.html:800–802` (`--shot-h` published), `:944–945` (re-declared at ≤860 and
consumed by the frame's own height), `:820–835` (pitch derived, the
`@media (max-width:700px)` override deleted), `:987–995` (the mobile re-crop).

Pitch, and dot rows across the frame:

| viewport | frame | pitch before → after | rows before → after |
|---|---|---|---|
| 1920×1080 | 812 | 6px → **6.55px** | 135 → **124** |
| 1440×900 | 746 | 6px → **6.02px** | 124 → **124** |
| 1024×800 | 646 | 6px → **5.21px** | 108 → **124** |
| 1440×720 | 628 | 6px → **5.06px** | 105 → **124** |
| 768×1024 | 194.5 | 6px → **2px** (floor) | 32 → **97** |
| 375×812 | 154.3 | 4px → **2px** (floor) | 39 → **77** |
| 375×635 | 150 | 4px → **2px** (floor) | 38 → **75** |

124 rows held exactly wherever the floor is not in play. The dot radius is
derived as pitch/4, which is what 1.5px on a 6px tile already was, so ink
coverage is unchanged at 1440.

**Re-crop** (`#h-air` only, ≤700 only): `height:220%;top:-50%;object-position:62% 50%`.
The box is now taller than 374/1.499 = 250px, so `object-fit:cover` crops
horizontally instead of vertically, and the window is placed over the arch. India
Gate goes from **~30% of the frame width with empty plaza either side** to
**~36%, full height, with the flanking lamps and the plinth legible**. I tried
three zooms and read all three: 300%/−80% and 250%/−62% both cut the monument's
crenellated top off, 220% keeps the whole silhouette with sky headroom. It
degrades gracefully at 640 (checked: still a subject, `crop-640`) and is inert at
768+, where the frame is wide enough that the original framing is right.
Captures: `crop-375` (before), `cropA`/`cropB`/`cropC` (the three tries),
`m-375x812`, `m-375x635`, `crop-640`.

---

## Regression checks

| check | result |
|---|---|
| `document.documentElement.scrollWidth === innerWidth` | **OK** at all 9 viewports, including 375 and 768 |
| kiss = `.06em` of the numeral | **OK** — 16.3px at 1440/1920, 12.9 at 1024, 9.7 at 768/767, 6.0 at 414/375; every slide, every width |
| numeral left edge identical breach vs non-breach | **OK** — one value per viewport across all four slides |
| rule x identical breach vs non-breach | **OK** — 482.3 at 1440, 301.3 at 1024, 226.2 at 768, 143.5 at 375 |
| account column left identical across slides | **OK** (was the D6 defect) |
| desktop hero height | **unchanged**: 825 / 707 / 719.4 / 891 at 1440×900 / 1440×720 / 1024×800 / 1920×1080 |
| desktop header height | **unchanged**: 63px at 1024, 1440, 1920 |
| ticker reveal under the hero | **12.0px** at 1440×900, unchanged — the `62`/`92` constants are untouched and now carry a comment at `home.html:786–797` saying exactly why they must stay wrong |
| journeys rail | unchanged at 1440 and 375; it is `.s-journeys-*`, not `.rig-tabs` |
| `.rl` below the seam | untouched — timeline (`--rl-w:3px`) and impact (`--rl-w:2px`) set their own; only the farm ledger uses the default and still computes `1px rgba(251,248,240,.20)` |

## Below the seam

Nothing was changed below the ticker seam. Two rules that live in the shared
component block were edited and are worth naming, because both are used by the
hero only: `.rig-tabs` (D4 — `home.html` has exactly one `.rig`, the hero deck)
and `.readout .dp` (D6 — new, used only by the Yamuna readout). `.tag-season`
(D9) is a shared rule and its four instances are all in the hero.

## Out of scope, untouched

D2 (the three gradient veils), D10 beyond what D11 and D12 returned, everything
below the seam, and the `62`/`92` constants — commented, not corrected.

**D10 note, since the numbers moved.** At 375×812 the hero band itself went
**811.2 → 772.6px** (−38.6, from D11 and D12 net of D8's larger paragraph), but
D1's chip row added 48.8px to the header, so nav + hero is **868.2 → 878.4px**
(+10.2). At 375×635 the band is 768.3 against 635 of visible Safari. The deck's
controls are still below the fold on a phone, as before. Q4 still needs an
answer, and it now needs to find ~175px rather than the ~75px the AD projected
after D11.
