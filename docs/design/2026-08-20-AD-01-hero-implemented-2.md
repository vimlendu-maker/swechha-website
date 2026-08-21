# AD-01 — THE HERO, second implementation pass

20 August 2026. Against the two items left outstanding by
`2026-08-20-AD-01-hero-implemented.md` (D2's veil arithmetic, the ≤560
sentence cut) plus the three AD-01b/client additions that arrived mid-pass
(the state stamp, computed time, the masthead line) and the Monsoon
demotion. One file changed: `public/design/v3/home.html`.

**How this was measured.** Headless Chrome over the DevTools Protocol,
`Emulation.setDeviceMetricsOverride` with real device metrics
(`mobile:true`, `deviceScaleFactor:3` on the phones), never
`--window-size`. Geometry and screenshots come out of the same session.
Baseline was re-derived from the live page before any edit and reproduces
the AD exactly — clean picture 110.5px at 1440×900, **−7.5px** at 1440×720,
25.3px at 375×812, 176.5px at 1920×1080, seam 874.1px at 375×635 — which is
the proof the two runs are comparable. Sixteen viewports swept: 320×568,
375×812, 375×635, 414×736, 561×800, 600×900, 768×1024, 1024×800, 1280×700,
1440×720, 1440×900, 1920×1080 (plus per-slide passes). Every slide of the
deck was measured at every width. Captures in `docs/design/img/sections/`
as `v2-before-*.png` / `v2-after-*.png`.

---

## Task 1 — D2, the veil arithmetic

### What changed

| what | where | before | after |
|---|---|---|---|
| lid painted to the type rows, not the mast box | `home.html:821–826`, `:833`, `:844` | box height, vw-padded both ends | `background-size:100% var(--s-hero-lid)`, `--s-hero-lid` = mast pad + `.86em` of the h1 + gap + one micro row |
| h1 size published as a token | `home.html:822`, `:846` | `clamp(2rem,5vw,4.2rem)` inline | `var(--s-hero-h1)` — one source, the lid reads it |
| dissolve derived from the frame | `home.html:827–831` | `clamp(88px,10vw,124px)` | `clamp(18px,calc(var(--shot-h) * .12),56px)` |
| the ≤860 dissolve override deleted | `home.html:1025–1027` | `.s-hero-panel::before{height:clamp(64px,18vw,96px)}` | gone — `--shot-h` is already re-declared there and the fade reads it |
| gradient re-profiled | `home.html:838–843` | `.80 0% / .50 54% / .14 86% / 0 100%` | `.82 0% / .66 50% / .44 84% / 0 100%` |

Nothing else about the photograph moved: the frame's `62`/`92` constants,
the `628`/`812` clamp, `--shot-h`, the halftone pitch, the ≤700 re-crop and
the `.duo` ramp are all untouched. `.duo-dim` is still used zero times.

### Measured — clean picture, Air slide, every viewport

`clean = shotH − panel cover − lid − dissolve`, the AD's own formula.

| viewport | frame | panel covers | picture region | lid | fade | **clean before** | **clean after** | % of frame | % of picture |
|---|---|---|---|---|---|---|---|---|---|
| 320×568 | 150 | 0 | 150 | 69.8 | 18 | 24.5 (16.3%) | **62.2** | **41.5%** | 41.5% |
| 375×635 | 150 | 0 | 150 | 69.8 | 18 | 21.0 (14.0%) | **62.2** | **41.5%** | 41.5% |
| 375×812 | 154.3 | 0 | 154.3 | 69.8 | 18.5 | 25.3 (16.4%) | **66.0** | **42.8%** | 42.8% |
| 414×736 | 150 | 0 | 150 | 69.8 | 18 | 14.0 (9.3%) | **62.2** | **41.5%** | 41.5% |
| 768×1024 | 194.5 | 0 | 194.5 | 86.3 | 23.3 | 31.5 (16.2%) | **84.9** | **43.7%** | 43.7% |
| 1024×800 | 646 | 340.7 | 305.3 | 101.8 | 56 | 111.7 (17.3%) | **147.5** | 22.8% | **48.3%** |
| **1280×700** | 628 | 392.7 | 235.3 | 120.8 | 56 | **−1.5 (−0.2%)** | **58.5** | 9.3% | **24.9%** |
| **1440×720** | 628 | 395.5 | 232.5 | 126.1 | 56 | **−7.5 (−1.2%)** | **50.4** | 8.0% | **21.7%** |
| 1440×900 | 746 | 395.5 | 350.5 | 126.1 | 56 | 110.5 (14.8%) | **168.4** | 22.6% | **48.0%** |
| 1920×1080 | 812 | 395.5 | 416.5 | 131.0 | 56 | 176.5 (21.7%) | **229.5** | 28.3% | **55.1%** |

Per slide (they differ because each panel is content-sized), clean picture
after, as % of the photograph's uncovered region:

| viewport | Air | Yamuna | Monsoon | Forest fire |
|---|---|---|---|---|
| 375×635 | 62.2 / 41.5% | 62.2 / 41.5% | 62.2 / 41.5% | 62.2 / 41.5% |
| 768×1024 | 84.9 / 43.7% | 84.9 / 43.7% | 84.9 / 43.7% | 84.9 / 43.7% |
| 1024×800 | 147.5 / 48.3% | 105.6 / 40.1% | 169.4 / 51.8% | 142.4 / 47.4% |
| 1280×700 | 58.5 / 24.9% | 69.3 / 28.2% | 96.3 / 35.3% | 69.3 / 28.2% |
| 1440×720 | 50.4 / 21.7% | 53.9 / 22.8% | 80.9 / 30.8% | 53.9 / 22.8% |
| 1440×900 | 168.4 / 48.0% | 171.9 / 48.6% | 198.9 / 52.2% | 171.9 / 48.6% |
| 1920×1080 | 229.5 / 55.1% | 226.0 / 54.7% | 253.0 / 57.5% | 226.0 / 54.7% |

**The zero-crossing is gone.** Clean picture is now positive at every window
height: above 782px it is `windowH − 731.6`, below 782 the frame pins at 628
and it holds at 50.4px. It used to go negative below 790.

**Confirms:** `v2-after-1440x720.png` (the frame that was a black rectangle
— the arch, the plinth, both flanking lamps and the sky gradient are all
legible), `v2-after-1440x900.png`, `v2-after-375x635.png`,
`v2-after-320x568.png`, `v2-before-*.png` for the same widths.

### The 40% floor — **it holds below 861 and is arithmetically impossible above it**

This is the one prescription that turned out wrong when I tried it, and the
number is not close.

- At ≤860 the panel does not overlap the frame, and the floor holds
  everywhere: **41.5% – 43.7%**, on all four slides, at 320, 375 (both
  heights), 414 and 768.
- On desktop the opaque `.s-hero-panel` covers the bottom of the frame. At
  the 628px frame floor it covers **395.5px = 63.0% of the frame**. The
  most clean picture that can exist at 1440×720 is therefore **232.5px =
  37.0% of the frame — with both veils set to zero.** No arrangement of a
  lid and a dissolve reaches 40% there. Same at 1280×700 (37.5% ceiling).

AD-01's own worked example does not close either: "On the 628px floor that
yields 88 + 100 and leaves 251px clean" — 628 − 88 − 100 is 440, not 251,
and the sum omits the ~400px panel entirely. 251 is 40% × 628 restated, not
a computation.

**What I did instead of pretending:** asserted the floor against the frame
where the frame *is* the photograph (≤860, met), and reported the desktop
figures against both denominators. Against the photograph's actual
uncovered region the floor is met at 1024×800 (48.3%), 1440×900 (48.0%) and
1920×1080 (55.1%), and missed at 1280×700 (24.9%) and 1440×720 (21.7%).

**The remaining shortfall is a height budget, not a veil.** At a 700px
window the band spends 395.5px on the panel and 79 on the bar, leaving
232.5px of frame; 126.1px of that is masthead type. Closing it needs one of:
a shorter panel, a frame floor above 628, or an h1 that is height-aware as
well as width-aware. All three are outside this brief and all three are
decisions, not tuning.

---

## Task 2 — the ≤560 sentence cut

`.s-hero-cut{display:none}` at `home.html:1091`, inside the existing
`@media (max-width:560px)` block — the same mechanism as `.s-hero-cad` and
`.s-hero-loc`, no JS. The spans are at `:1969` (Air), `:2000` (Yamuna),
`:2038` (Monsoon), `:2069` (Forest fire). **Not one word of copy was
changed, added or reordered** — each span wraps existing text including its
leading space, so desktop renders byte-identical prose.

`.s-hero-why` height at 375, per slide:

| slide | before | after |
|---|---|---|
| Air | 108 (4 lines) | **54** (2) |
| Yamuna | 135 (5) | **54** (2) |
| Monsoon | 108 (4) | **54** (2) |
| Forest fire | 162 (6) | **108** (4) |

Hero height at 375×635 with everything else in place: **766.6px with the
cut off → 712.6px with it on, −54.0px.** −54.0 at 375×812 and 414×736,
−81.0 at 320×568. The AD projected ~96px; it does not arrive, because the
slides stretch to the tallest of the four and after the cut the tallest is
Forest fire's surviving first sentence (4 lines at 375), not Yamuna's.

Desktop and tablet keep the whole paragraph — verified at 561, 600, 768,
1024, 1280, 1440 and 1920: `.s-hero-cut` computes `display:inline` and the
paragraph measures 54/81/81px on Air/Yamuna/Fire at 1440.

**Confirms:** `v2-after-375x635.png`, `v2-after-375x635-s1/s2/s3.png`,
`v2-after-320x568.png`, `v2-after-1440x900.png` (full paragraph intact).

### Two flags on this one — both editorial, both one span away from fixed

1. **On Air the literal rule inverts the stated principle.** The
   instruction is "cut the second sentence", and the principle given with
   it is "the clause that survives names the subject; the clause that goes
   is arithmetic". On Yamuna, Monsoon and Forest fire those agree. On Air
   they are opposites: sentence one *is* the arithmetic ("Four times the
   limit the Central Pollution Control Board sets for a safe day") and
   sentence two is "Schools in this ward are three kilometres from the
   monitor that recorded it" — the clause AD-01 D8 called "the one sentence
   that turns the number into a fact about schoolchildren". I applied the
   rule as written rather than making an editorial judgement on approved
   copy. Moving the span to the other sentence on Air is a one-line change;
   it needs the AD's word, not mine.
2. **Forest fire has three sentences.** "Cut the second" would save nothing
   there (sentence two is six words), so I read it as "keep the first
   sentence" and the span covers sentences two and three. That is the
   reading that saves height and that matches the other three slides. Flag
   if the AD meant literally sentence two only.

---

## Addition 1 — the state stamp

**A move, not an addition.** Each slide's existing `.state` chip left
`.s-hero-plate` and became `.s-hero-stamp` inside its own `.s-hero-sit`:
markup `:1954` (Air), `:1986` (Yamuna), `:2024` (Monsoon), `:2055` (Fire);
CSS `:857–869`; keyframe `:870–877`; reduced-motion guard `:878–883`; the
≤560 drop at `:1083`. The dead `.s-hero-plate .state{flex:none}` rule went
with it (`:964–968`).

- **Position, ≥561:** `top:var(--s-hero-mast-pad)` — literally the same
  token the mast uses — and the right edge on the spine. Measured right
  edge vs. spine right, all twelve widths: **0.0px of overshoot**, every
  time. At 1440 the chip occupies x 1250.7–1294.5, y 91. AD-01b predicted
  "x 1250.2–1294, y 91–109.4".
- **Position, ≤560:** its own right-aligned row under the h1, still inside
  the slide, at `--s-hero-row2top`. The mast lid extends exactly one row to
  cover it — the lid formula and the stamp's top read the *same* token, so
  they cannot drift apart.
- **The whole vocabulary fits at every width.** I swapped all four strings
  into the live stamp and measured: Live 43.8px, Periodic 77.6, Demo data
  88.9, Out of season 118.4. Every one lands on the spine with zero
  overshoot and clears the left gutter by ≥160px at 320. At ≥561 the
  longest string still clears the h1's ink by 149.9px (at 561) to 604.2px
  (at 1280). At ≤560 there is no collision to have — different rows.
- **The four marks are the existing ones** (`:284–287`): live = filled,
  periodic = hollow, demo = 45° hatch, closed = dashed. Verified computed,
  per string, per width.
- **Blink:** `@keyframes s-hero-live{0%,70%{opacity:1}85%{opacity:.22}100%{opacity:1}}`,
  2.4s, on the 9×9 `<i>` only, only under `.live`. Measured across all four
  slides at all twelve widths: **Air `s-hero-live/2.4s`, Forest fire
  `s-hero-live/2.4s`, Yamuna `none/0s`, Monsoon `none/0s`. Exactly two dots
  animate.** Dot colour `rgb(251,248,240)` = `--fg`; the word stays
  `--fg-2`. Nothing else on the page animates.
- **Reduced motion:** emulated `prefers-reduced-motion: reduce` →
  `animationName:none`, `opacity:1`, `background:rgb(251,248,240)`. Solid,
  which is the dot's "on" appearance.
- **Not a button:** computed `pointer-events:none`, `border-width:0px`,
  `background-color:rgba(0,0,0,0)`, no hover rule, `closest('a') === null`,
  `aria-hidden="true"` on the wrapper. The `.sr` sentence still narrates
  the state.
- **Zero band height, verified not assumed:** hero height with the stamp
  and the tagline rendering, against the same page with both forced to
  `display:none` — **712.6 / 712.6 at 375×635, 767.8 / 767.8 at 320×568,
  825.0 / 825.0 at 1440×900, 707.0 / 707.0 at 1440×720. Delta 0.0px at
  every one.**
- **The measure it gives back:** `.s-hero-src` 278.2px → **334px** at 375,
  exactly AD-01b's figure, and Air's cut string now lands on **one line
  (39.1px → 19.6px)**. Plate height at 375: Air 106.8 → **85.6**, Yamuna
  126.4 → **105.1**, Monsoon 106.8 → **105.1**, Fire 106.8 → **105.1**.

**Confirms:** `v2-stamp-1440.png` (4× on the corner), `v2-stamp-375.png`
(4× on the ≤560 row), `v2-after-1440x900-s2.png` (the hollow PERIODIC mark
on Monsoon), `v2-after-320x568.png`.

### Flag — `right: var(--gut)` does not land on the spine

The prescription says to place the stamp with `right: var(--gut)`. On this
page that is wrong by 100px at 1440: `--gut` computes to 46px, but the
spine is at 146px from the edge, because `.wrap` is `max-width:1240px` with
a `var(--gut)` gutter, so its content box runs 146 → 1294. `right:46px`
would put the chip 100px outside the page's own right rule.

Shipped instead: `.s-hero-stamp` is a full-bleed absolute strip containing
the band's own `.wrap`, flex-end. Same token, same intent, no magic number,
and it lands *on* the spine at every width — measured overshoot 0.0px at
320/375/414/561/600/768/1024/1280/1440/1920.

---

## Addition 2 — computed date and relative age

`home.html:2567–2617`. Forty lines including the comment; no dependency, no
`setInterval`, no fetch.

- **Ticker date computed** (`:2103` markup, `:2584–2586` script): the typed
  "Wednesday, 19 August 2026" is now `<span class="s-ticker-date">` filled
  from `getDay()/getDate()/getMonth()/getFullYear()`. Renders **"Thursday,
  20 August 2026, 07:00 IST"** — today. Still one line at 375 and at 1440
  (`.s-ticker-when` 15.5px both).
- **Relative age** on all four source lines: `<time class="s-hero-age"
  data-at="…">` at `:1977`, `:2008`, `:2046`, `:2077`. `data-at` is either
  `HH:MM` (that clock time today, and yesterday if the instant has not
  arrived yet) or a full `YYYY-MM-DDTHH:MM`. Rendered at run time:
  Air ` · 2 hours ago`, Yamuna ` · 15 days ago`, Monsoon ` · 3 hours ago`,
  Fire ` · 6 hours ago` — and they moved between two runs an hour apart,
  which is the point. The script also stamps a valid `datetime` attribute
  (`2026-08-20T07:00`) built from the same getters.
- **`toISOString()`/`toLocaleDateString()` appear nowhere.** Only
  `getFullYear/getMonth/getDate/getDay/getHours/getMinutes` and a
  `new Date(y,m,d,h,mi)` constructor, which is wall-clock by definition.
- **It does not add a row.** Air's source at ≤560 is one line, 19.6px, in
  the 334px measure — the age is inside it. Nothing wrapped anywhere: src
  heights at 1440 are 19.6 on all four slides.
- **The ≤560 word cut is scoped to Air** (`#h-air .s-hero-rd`, `:1105`),
  because "Read" and "today" is the string the client approved. At ≤560 Air
  reads "CPCB continuous monitor. 07:00 IST · 2 hours ago". Monsoon's
  "Updated … today" and Fire's "Fetched … today" were left alone and still
  wrap to two lines at 375 — the equivalent cut on those two is copy that
  has not been approved, and I did not make it. **Needs a word.**
- **Flag:** the age is computed on the *browser's* local clock, per the
  project's local-getters rule. For a reader outside IST the line will say
  "07:00 IST" while the instant used is their local 07:00. Correct for the
  audience; worth knowing before this pattern is copied to a page with a
  global readership.
- Zero console errors and zero uncaught exceptions at 375×635 and 1440×900.

**Note on scope:** the ticker's date is below the ticker seam. It was
changed only because the coordinator asked for it explicitly. Nothing else
below the seam was touched. Document height at 375 is now 9,284px; it moved
only because the hero above it got shorter.

---

## Addition 3 — the masthead line

`<p class="lbl s-hero-tag">Every reading against its published limit</p>`
inside `.s-hero-mast .wrap` (`:1946`); CSS `:847–852`; hidden at ≤560
(`:1084`).

- `--fg-2` micro-caps, left edge on the spine, `--gap-head` under the h1 —
  the same voice and colour as "Delhi. Since 2000." in the ticker.
- Renders at 561, 600, 768, 1024, 1280, 1440, 1920 (`display:block`);
  `display:none` at 320, 375, 414. Verified computed at every width.
- **Zero band height:** the mast is absolute. Measured directly against the
  same page with the line forced to `display:none` — delta **0.0px** at
  1440×900 and 1440×720 — and hero heights at every desktop width are
  unchanged from the previous pass: 825 at 1440×900, 707 at 1440×720,
  719.4 at 1024×800, 891 at 1920×1080.

### Flag — the line was illegible as first built, and the fix is a second finding

Painting the lid to the type rows (Task 1) puts the tagline in the last
14% of the gradient, where the old profile is `.14 → 0`. Over the bright
haze on the right of the India Gate frame, "PUBLISHED LIMIT" simply
disappeared — see `v2-tagline-before.png` (2×). Two changes, both minimal:

1. the ramp re-profiled to `.82 / .66 at 50% / .44 at 84% / 0` so it still
   holds .44 into the second row;
2. `.s-hero-tag` and `.s-hero-stamp .state` carry a text-shadow of their
   own — which is exactly the AD's own argument for the h1
   (`text-shadow:0 2px 30px`, `home.html:846`), applied to the two small
   rows that need it more.

Result in `v2-tagline-after.png`. **This is not free:** a taller lid would
have been the other fix and would have cost 17–23px of photograph at every
width, and at 375 it would have taken the floor from 41.5% to 34.1%.

### Flag — AD-01b's "763px / 122px" is a horizontal measurement

For the record, because it changes what the sentence means: 1440 − 676.6
(the h1's ink right) = 763.4, and 375 − 252.7 (the h1's ink width) = 122.3.
Both numbers describe frame *width* the lid darkens beside the type, not
frame height below it. I implemented the height instruction as the
coordinator stated it ("as tall as the type it makes legible and no
taller"). If the AD meant the lid should also stop short of the right edge,
that is a different change and it interacts with the ≤560 stamp row, which
needs the scrim to reach the spine.

### Flag — binding the lid to the type does not, by itself, save anything

Worth recording because the AD's framing implies otherwise. The mast box
was *already* padding + one line: 28 + 57.8 + 26 = 111.8 at 1440. Painting
the lid to the type rows returns 26px there. Adding the tagline then costs
40.3px, so with Addition 3 in place the lid is **taller** than it was:
111.8 → 126.1 at 1440, 87 → 101.8 at 1024, 61.5 → 69.8 at 375 (where the
extra row is the stamp, not the tagline). **Every pixel of picture that came
back came back from the dissolve** (124 → 56 desktop, 67.5 → 18 at 375).
The tagline is the single largest consumer of the 1440×720 shortfall: it
costs 40.3px of a 232.5px picture region there.

---

## Monsoon → Periodic

`home.html:2017–2024` (comment + stamp) and `:2029` (the `.sr` sentence).
`class="state live"` → `class="state delayed"`, `Live` → `Periodic`, and
"Above normal. Live." → "Above normal. Periodic." Air and Forest fire keep
`Live`. The build now ships two Live claims, matching the record.

**Authored in one place, verified:** the class is the only visual token —
the word is its content, the hollow-square fill comes from the absence of
`.live` (`:285`), and the blink is bound to `.live` (`:877`). Flipping
`delayed` → `live` the day IMD is wired changes all three at once. Its one
mirror is the `.sr` sentence, which exists because the stamp is
`aria-hidden` and a screen reader would otherwise not hear the state at all;
that is two places by design, and the comment at `:2017–2023` says so.

Confirmed by measurement, all twelve widths: **two dots animate, not
three.** `v2-after-1440x900-s2.png` shows the hollow PERIODIC mark and no
red anywhere on the slide.

---

## Regression checks

| check | result |
|---|---|
| `document.documentElement.scrollWidth === innerWidth` | **OK** at 320, 375, 414, 561, 600, 768, 1024, 1280, 1440, 1920 |
| kiss = `.06em` of the numeral | **OK, unchanged** — 5.95 at 320/375/414, 7.07 at 561, 9.68 at 768, 12.9 at 1024, 16.13 at 1280, 16.32 at 1440/1920; every slide |
| numeral left edge identical breach vs non-breach | **OK** — one value per viewport across all four slides |
| rule x identical breach vs non-breach | **OK** — 482.3 at 1440, 395.8 at 1280, 301.3 at 1024, 226.2 at 768, 143.5 at 375 |
| account column left identical across slides | **OK** — 520.3 ×4 at 1440 (D6 holds) |
| resting rail weight | **OK, unchanged** — 6px red on breach, 3px `--fg-3` at 1280/1440/1920, 2px at 1024, 1px at ≤768 |
| tab marker clipping | **OK** — `clippedAbove 0.0` at every width; marker `3px rgb(251,248,240)`, still not red |
| `1 of 4` void | **OK** — 32.0px at 1440, unchanged |
| **12px ticker reveal at 1440×900** | **OK — 12.0px**, unchanged. The `62`/`92` constants were not touched |
| desktop hero height | **unchanged**: 825 / 707 / 719.4 / 891 at 1440×900 / 1440×720 / 1024×800 / 1920×1080 |
| desktop header height | **unchanged**: 63px |
| console errors / uncaught exceptions | **0 / 0** at 375×635 and 1440×900 |
| below the seam | untouched apart from the ticker's date span, which was asked for |

---

## The 375 budget

| | before this pass | after |
|---|---|---|
| header (56px bar + 49.8px chip row) | 105.8 | **105.8** |
| hero band at 375×635 | 768.3 | **712.6** |
| **seam at 375×635** | **874.1** | **818.4** |
| hero band at 375×812 | 772.6 | 716.9 |
| seam at 375×812 | 878.4 | 822.7 |
| seam at 414×736 | 842.5 | 786.8 |
| seam at 320×568 | 956.3 | 873.6 |

**−55.7px at 375×635.** Of that, the sentence cut is −54.0 and the stamp's
move out of the provenance row is the rest; the veil work and the tagline
cost nothing in band height at any width.

Against ~635px of visible iOS Safari the band is now **183.4px over**, down
from 239.1. AD-01b projected 758.6px for the same set of changes; the
outturn is 818.4, because the ≤560 cut returns 54px rather than the ~96
projected (the deck stretches to Forest fire, not Yamuna) and because the
≤560 stamp row is a new consumer the projection did not carry.

The remainder is not solvable inside this brief. It is the same decision
the handoff already names: whether the hero must fit one phone screen at
all. What is left to cut, measured at 375×635: the provenance plate
(85.6–105.1px), the photograph (150px), the control bar, and the numeral —
which is an approved floor and should not be one of them.
