# AD-09 — Final visual pass before the freeze

**Date:** 21 August 2026
**File:** `public/design/v3/home.html` (single source of truth)
**Backup taken before any edit:** `home.html.bak-ad09-pre` in the session scratchpad, 252,480 bytes
**Method:** Chrome CDP with `Emulation.setDeviceMetricsOverride` at every width. No
capture in this document was taken with a bare `--window-size`. Every number below
was measured on the built file and re-measured after each change; every visual claim
was made from a PNG that was opened and looked at, not from reading the source.
Widths exercised: 320, 375, 390, 414, 560, 768, 901, 940, 941, 1024, 1280, 1440, 1920.
Phone heights: 635 and 812.

**Remit.** Padding and dead space, mobile alignment against the real screen, scroll
behaviour and rhythm, and the small errors that survive a build. Not a redesign.
Everything under "settled" in the brief was read first — `DECISIONS-2026-08-20-homepage.md`
D-07.0 … D-07.14, `AD-07-work-chapter.md`, `AD-08-slider-automation.md`,
`SOURCE-FACTS.md` — and nothing settled is reopened here except where it is
*visually* broken, which is stated as such with numbers.

**Verdict in one line.** The page is in better shape than a final pass usually finds:
band padding is exactly symmetric at every width, there is no horizontal overflow
anywhere, the ground alternation is clean across all fourteen bands, and the console
is silent. The defects that survived the build are concentrated in one place — the
layer where the reader's *finger and keyboard* meet the page, not the layer where the
eye meets it — plus one navigation problem that is a genuine design question rather
than a bug.

---

## A. DEFECTS FIXED

### A-1 · CRITICAL · Every in-page nav link landed with the band's title under the header

**Reported by the client**, on `#farm`: *"If you click on FARM in the header, it doesn't
land properly in the section — it crops the section title SWECHHA FARM."* He is right,
and it was systemic rather than specific to Farm.

**Where.** `header.nav` / `.nav-in`, affecting every `href="#…"` on the page: the six
header links, the six mobile chip-row links, the footer's in-page links and the
journeys tab chips.

**The measurement that proves it.** No element on the page carried `scroll-margin-top`
and neither `html` nor `body` carried `scroll-padding-top` (computed `auto`). So an
anchor jump put the band's top border edge at viewport y=0, and the header then
painted over the first 56px (≤940, where `.nav-in` is `position:fixed`) or 63px
(>940, where `.nav` is `position:sticky` and its 1px border paints too). Measured at
the resting position **after** the jump, not in passing:

| band | 375 | 768 | 1024 | 1440 |
|---|---|---|---|---|
| `#farm` — masthead headline hidden | **34.0px of 37.1px (92%)** | 33.2px | 31.8px | **20.0px of 89.4px (22%)** |
| `#give` — heading hidden | 11.9px | — | — | — |
| `#record` | 0.4px | — | — | — |
| band's whole top tier padding eaten | 55.8px | 56.2px | 62.9px | 63.3px |

At 375 the Farm masthead was effectively *gone*: 3.1px of a 37.1px headline left on
screen. The FARM nav link delivered a band with no title on it.

**Widths.** All of them. The occluding strip is 56px at ≤940 and 63px above it.

**The fix.** The two header-height literals (`62px` in `.nav-in`, `56px` in the mobile
block) became one pair of tokens, and the scroll offset is set from them:

```css
:root{--bar-h:62px;--nav-h:63px}
html,body{scroll-padding-top:var(--nav-h)}
@media (max-width:940px){ :root{--bar-h:56px;--nav-h:56px} }
```

`scroll-padding-top` is a *scroll* offset, so it adds no layout height, costs no
document height, changes nothing until an anchor is used, and covers anchors added
later. It is set on both `html` and `body` because `body{overflow-x:hidden}` makes
body a scroll container too, and whichever of the two the UA scrolls has to carry it.
It also removed a latent inconsistency: there was no single number in the file
describing how tall the header is, which is why this went unnoticed.

**Verified by arriving, not by inspecting.** Both paths — cold load with the hash, and
a same-page click on the real link — at 375, 414, 768, 1024 and 1440:

- Every band's top now lands at the bar's bottom edge, ±0.5px sub-pixel.
- `#farm` at 375: scroll lands at y 6012 against a band top of 6068 — exactly 56px.
  Same-page click lands at the identical 6012.
- `#farm` at 1440: y 7115 against a band top of 7178 — exactly 63px.
- **Read the PNGs:** `SWECHHA FARM` is fully visible with the header above it at 375
  and at 1440; `THE RECORD` sits on 56px of clean paper; `#impact` fits its whole
  strip in one 635px screen. Nothing is pushed off the bottom.
- The fixed mobile bar does **not** double-count: `--nav-h` at ≤940 is the 56px fixed
  `.nav-in` only, and the `.navscroll` chip row is in `.nav`'s static flow, so it is
  not added twice. Confirmed empirically — landing error 0.0–0.5px, never 93px.
- **Hero deck still works** after the change: arrows step `scrollLeft` 0 → 375 → 750
  → 1125 at 375 and 0 → 1440 → 2880 → 4320 at 1440, the pager reads `1 of 4` … `4 of 4`,
  `next.disabled` becomes true at the end (still no loop, per AD-08), tab clicks sync,
  and a tab click causes **no vertical page jump** (scrollY stays 0), so the new scroll
  offset does not interfere with the deck.
- **Document height identical:** 10,244px at 375×812 and 10,724px at 1440×812, before
  and after. Zero cost.

### A-2 · Six touch targets under the page's own 44px floor; five under the 24px AA floor

**Where.** `.navscroll a.nl` (the six mobile nav destinations), `.act` ×6 (each band's
one CTA), `.w7-ce-lk` ×3 (campaign names), `.w7-ce-pre a` ×2 (the "Runs against …" hooks).

**The measurement.** The page already states a 44px floor and already enforces it in
four places — `.give` and `.mark` at ≤940, `.s-hero-plate .act` at ≤560,
`.w7-im-foot .act` at ≤767, `.rig-tabs button` at ≤940. Six other controls never got
it. Heights at 375:

| control | height | note |
|---|---|---|
| `.navscroll a.nl` ×6 | **26.0px** | sitting in a 48.8px row — 11.4px above and below each chip was not tappable |
| `.act` ×6 | **27.0px** | work, journeys, projects, campaigns ×2, about |
| `.w7-ce-lk` ×3 | **23.0px** | also under WCAG 2.5.8's 24px AA floor |
| `.w7-ce-pre a` ×2 | **17.3px** | smallest targets on the page, under 24px at *every* width including 1440 |

**Widths.** 320/375/414 for all of them; the two hooks fail at every width up to 1920.

**The fix, and why it is shaped this way.** Every one of these carries a 2px mustard
underline or an optical baseline that is part of the composition, so raising
`min-height` would drop the rule 8–17px and add roughly 136px of document height
across the page. Instead each gets a transparent, absolutely positioned `::after`
centred on the link: the hit box grows, the drawn box does not, and no band height
changes. Clearances were measured **first** so no expander can steal a neighbour's
taps — nearest interactive neighbour to each `.act` at 375: work 37.0, journeys 32.0,
projects 27.0, campaigns 35.8, events 267.0, about 562.2, all clear of the 8.5px per
side that 27→44 costs.

**Result, measured before → after:**

| width | hit boxes <44px | hit boxes <24px | new control overlaps | document |
|---|---|---|---|---|
| 320 | 17 → **4** | 5 → **0** | 0 | 10,788 → 10,788 |
| 375 | 17 → **4** | 5 → **0** | 0 | 10,244 → 10,244 |
| 414 | 17 → **4** | 5 → **0** | 0 | 10,033 → 10,033 |
| 768 | 35 → **17** | 5 → **0** | 0 | 10,239 → 10,239 |
| 1440 | 38 → **27** | 2 → **0** | 0 | 10,724 → 10,724 |

Zero band-height changes at any width. `scrollWidth === width` still holds everywhere.
The four remaining sub-44 targets at phone widths are the campaigns stack, which is
arithmetically capped — see B-1.

**One regression I introduced and then fixed, recorded because it is instructive.**
My first version capped `.w7-ce-lk` at ≤767. At exactly 768 the name is 23.6px tall,
so it still took the 44px expander and **overlapped the hook above it by 5.6px** —
two links fighting for the same pixels, worse than the small target it replaced. The
rule is now structural rather than breakpoint-based, and it is two rules on purpose:
`.w7-ce-pre + .w7-ce-lk{--hit:24px}` as a safe base, then
`.w7-ce-pre:not(:has(a)) + .w7-ce-lk{--hit:44px}` to give the 44 back to
"Monsoon Wooding", whose eyebrow is a plain figure line (*"50,000+ trees planted and
survived"*) and not a link, and which has 53.0px of clearance. Written in that order
so an engine without `:has()` keeps the conservative base rather than dropping the
constraint and bringing the overlap back.

### A-3 · The journeys cards' focus ring was clipped top and bottom at phone widths

**Where.** `.w7-jr-strip` at ≤767, containing the four `.w7-jr-r` journey cards.

**The measurement.** `.w7-jr-r:focus-visible` draws `outline:2px solid var(--mustard);
outline-offset:6px` — 8px outside its border box. The strip is `overflow-y:hidden`, so
the ring's top and bottom 8px were discarded on **all four cards**. A keyboard reader
tabbing the journeys got a ring with no top or bottom edge. Measured overhang: 8.0px
top, 8.0px bottom, at 320, 375 and 414.

This is the same failure mode the file's own `.rig-tabs` comment documents for the
selected-tab marker ("*overflow-x:auto forces overflow-y to auto as well — a scroll
container clips BOTH axes*"). That fix moved the negative margin to the container and
cured the marker; it did not cure the focus ring.

**The fix.** The 8px becomes padding *inside* the scroll box, cancelled by an equal
negative margin, so the strip's margin box and every card's position are unchanged:
`margin:-8px calc(-1*var(--gut));padding:8px var(--gut)`.

**Verified.** Ring overhang 8.0 → **0.0** top and bottom at 320, 375, 414. Strip margin
box 385.5px, unchanged. Document unchanged. At 768 and above the strip is
`overflow-y:visible`, so nothing was ever clipped there.

### A-4 · The last mobile nav destination sat inside its own fade

**Where.** `.navscroll ul` — the horizontally scrolling chip row at ≤940.

**The measurement.** The row carries `padding:10px var(--gut)`, but a flex container's
trailing padding is not honoured as scrollable overflow. At full scroll-right the last
destination, **"Record", ended at x 320.2 in a 320px strip** — flush to the edge, with
8.2px of the word under the 8px mask, i.e. a clearance of **−8.2px**. Identical at 320,
375 and 414. The reader who scrolls the row to its end finds the last item faded out.

**The fix.** A real trailing flex item, `.navscroll ul::after{width:8px}` — the row's
own 20px flex gap already supplies the gutter, so the spacer only has to cover the 8px
the mask eats.

**Verified.** Clearance −8.2px → **+19.8px** at 320, 375 and 414. Strip `scrollWidth`
416 → 444. Document unchanged at every width: a scroll container's own overflow costs
no page height.

### A-5 · "in" set alone on a line at 104px — the worst orphan on the page

**Where.** `#give .d1`, "Three ways in".

**The measurement.** At 1440 and 1920 the headline broke to two lines with **"in"
alone on the second — 14.1% of the measure, two letters at 104px**. It is not curable
by width: `.wrap`'s 1240px cap freezes this column at 562px while `.d1` keeps growing
to its clamp ceiling, so the box is actually *narrower* at 1440 (562px) than at 1280
(564.5px), and the headline wraps from 1440 upward.

Line fills by width: 375 one line 83.4% · 1024 one line 96.3% · 1280 one line 99.2% ·
**1440 "Three ways" 85.4% / "in" 14.1%** · 1920 identical.

**The fix.** A non-breaking space binding the last two words. No word changed. Result:
one line to 1280 as before, "Three" / "ways in" at 1440 and above — verified.

I did **not** touch `#projects` "What is / running", which also breaks to two lines
from 1024 up. Its last line is a whole seven-letter word at 62.9% fill, which is a
normal rag, not an orphan. Noted so it is clear the choice was deliberate.

---

## B. RECOMMENDED, BUT NEEDS YOUR RULING

### B-1 · The campaigns pair cannot both reach 44px without opening the composition

`"Runs against the Yamuna"` (a link to the situation page) sits **8.0px** above
`"We for Yamuna"` (a link to /work/campaigns) — two different destinations inside a
48.3px envelope. Two 44px targets need 88px. I brought both to the **24px WCAG 2.5.8
AA floor**, which fits (3.35 + 0.5 of the 8px gap, leaving 4.15px between them), so
the page now has **zero** controls under 24px at any width. Getting to the page's own
44px doctrine needs either the gap opened by ~15px per campaign row (roughly +45px of
band height) or the hook and the name merged into one link, which changes where the
reader goes. Both are composition. **Your call — it is already AA-compliant as it stands.**

### B-2 · The accessibility layer around the header — three things, one ruling

None of these are visual, and two of them sit inside the frozen hero, which is why I
have not touched them:

1. **No skip link and no `<main>` element.** Landmarks are `header`, three `nav`s and
   `footer` — there is no `main`. There are **8 tab stops** before the first piece of
   content at every width. WCAG 2.4.1 (Bypass Blocks) is not met on a 10,244px page
   with a repeated header. A skip link is invisible until focused, so it costs nothing
   visually; `#top` already exists as a target and now lands correctly thanks to A-1.
2. **The hero deck's tab focus ring is invisible.** `.rig-tabs` is `overflow-x:auto`,
   which forces `overflow-y:auto`, and the buttons fill the container, so the 2px ring
   at 3px offset is clipped **5px top and 5px bottom at every width, 375 and 1440
   alike**. The four situation tabs are the hero's primary control and a keyboard
   reader cannot see which one has focus. The cure is the same padding-plus-negative-
   margin move used in A-3, but it is inside the frozen band.
3. **Four identical "The full instrument" links are in the tab order at once**, three
   of them on off-screen slides. Tabbing forward moves focus into an invisible panel
   and scrolls the deck to it. Also frozen.

**Ruling needed: may the frozen hero be opened for these three, and may a skip link
and a `<main>` wrapper be added?**

### B-3 · Where am I? There is no active-section indication at all

`aria-current` is present on **zero** elements at every width tested — yet the CSS for
it already exists and is fully specified: `.nav a.nl:hover, .nav a.nl[aria-current]
{color:var(--fg);border-bottom-color:var(--mustard)}`. The vocabulary is built and
nothing ever sets it. Seven nav items over fourteen bands and 10,244px: a reader
8,000px down has no indication of where they are. The cheapest honest fix is an
IntersectionObserver setting `aria-current` on the matching link — roughly a dozen
lines, no new visual language, no new colour, and it lights the underline the design
already drew. **Recommend doing it. It is new behaviour, so it is your ruling.**

### B-4 · Mobile navigation is absent for 92% of the phone document

This is the one I would most want you to look at. D-01.1 ruled the chip row
non-sticky, and that ruling was taken when the page was shorter.

**The measurement, at 375×812.** The chip row's bottom edge is at y=105.8. The footer's
link grid begins at y=9,518 of a 10,244px document — **92.9% of the way down**. Between
those two points, a phone reader has navigation to exactly **one** destination: the
GIVE button in the 56px bar. That is **9,412px, or 91.9% of the document**, with one
link on screen.

The three options and their measured costs:
- **Make the chip row sticky.** +37px of permanent chrome on top of the 56px bar = 93px,
  which is 14.6% of a 635px iOS Safari viewport. This is close to the 107px the row was
  criticised for in the first place, so it is the option the earlier ruling already rejected.
- **Leave it.** Defensible only if you accept that the phone reader's route back is
  scrolling up or reaching the footer.
- **A third path not yet costed:** the bar already has room — the wordmark is 120px and
  GIVE is 70.4px in a 375px bar, leaving roughly 165px unused. A single compact control
  in that gap (an index, not a hamburger drawer, which the file's own comment rejects as
  the site's only modal pattern) would restore the whole index for zero extra height.

**Your ruling. I have not changed it — it is yours.**

### B-5 · "twenty-six years of paper" contradicts the page's own stated rule

`#record`'s lead reads: *"…the things you can do about them, and twenty-six years of
paper."* The file's own comments, in two places, say **"NO YEAR COUNT IS TYPED
ANYWHERE. The ruling is that twenty-six years derive…"**, and the settled position is
*cut, not computed* — the page says "Since 2000" and no count of years appears. This is
the one surviving live instance; the other three hits in the file are comments. It goes
stale in January 2027. Copy, so I have not touched it. Recommend a "since 2000" phrasing.

Two neighbours in the same band, flagged not fixed, both sourced nowhere in
`SOURCE-FACTS.md`: **"9,400 days on file since 2000"** (a figure that drifts daily —
2000-01-01 to today is nearer 9,729) and **"34 guides"**. And **"air-detox garden"**
survives in the DIY door's copy, which is the term D-07.5 killed as one neither source
uses — though here it names something a reader might build on a balcony rather than a
count of Swechha's gardens, which may be why it was left.

### B-6 · The `cityscapes-*` frames may not be from the approved archive

Raised as a question, not an assertion. Seven files in that family have pixel
dimensions that are neither camera ratios nor crops of the 2000px assets — 660×777,
684×780, 663×780, 642×777, 684×777 — and carry no EXIF block, whereas the archive
photographs (`india-gate-hero.jpg`, `yamuna-floodplain-crowd.jpg`,
`cityscapes-hero-riverside-walk.jpg`) all carry Photoshop/Exif markers. Given that
`gram-anubhav-hero.jpg` is already logged as a screenshot of a website mockup, this is
worth one check before the freeze. **Do these come from the Drive archive?**

### B-7 · Smaller items, listed rather than argued

- **Footer links are 27.9px tall at 768 and 1440** (12 of them). They clear the 24px AA
  floor and are ≥44px at phone widths, but 768 is a touch device. Extending the phone
  treatment to ≤940 would close it. The footer sits in the byte-identical range, so I
  left it.
- **The hero deck's arrows are 40×40 at 768** — the 44×44 rule lives inside
  `@media (max-width:560px)`. Frozen band; one line if opened.
- **At 320, four bands breach the 900px phone cap** — about 1,023.41, farm 905.44,
  record 1,456.42, give 935.38 — and the document is 10,788px. 320 is below the tested
  floor by prior ruling, recorded here as data rather than as a defect.
- **The GIVE button in the bar goes mustard-on-mustard over the Give band.** When the
  reader is *in* `#give`, the bar's mustard chip sits directly above the mustard ground,
  separated only by the bar's black, and the one persistent CTA both loses its figure/
  ground separation and becomes redundant. Cosmetic; a taste call.
- **`record` is still 1,393.48px at 375**, 493.48px over the cap, and the only band over
  it at 375. AD-07 named it "first item next pass". D-07.11 ruled the page ships at full
  length. Unchanged here, and re-confirmed rather than rediscovered.

---

## C. CHECKED AND FOUND CLEAN

So it is clear the pass was real, and where it found nothing:

- **Band padding is exactly symmetric, top and bottom, in every band at both widths.**
  I measured the slack inside each band's padding box against its first and last laid-out
  child: **0.0px top and 0.0px bottom on all fourteen bands at 375 and at 1440.** No
  trailing paragraph margin leaks through a `.wrap` to inflate a band's bottom edge —
  the commonest form of this defect, and it is absent. An earlier probe of mine appeared
  to show 30–80px of bottom slack; that was an artifact of my own leaf-node filter, and
  is recorded here so nobody re-finds it.
- **No horizontal overflow at any width.** `document.scrollWidth === innerWidth` at 320,
  375, 390, 414, 560, 768, 901, 1024, 1280, 1440 and 1920. Body scrollWidth matches too.
- **Console silent** at every width, before and after every change: no errors, no
  warnings, no exceptions.
- **Ground adjacency is clean.** No two consecutive bands share a ground, across all
  fourteen, at 375×812, 375×635 and 1440×900. The two darks that meet (`impact` #151512 →
  `farm` #0D0D0B) are the intended alternate-dark pattern, not a clash.
- **The spine holds.** Every band's first head sits on one left edge: 20.00px at 375,
  34.81 at 1024, 63.52 at 1280, **146.00 at 1440**, 386.00 at 1920 — thirteen bands,
  one number each. `#gtm` sits off it by design (its wordmark is centred), and the
  ticker runs on the wider `.wide` measure, as documented.
- **The header runs on `.wide` (1580) while bands run on `.wrap` (1240)**, so the logo at
  46px does not align with the 146px content spine at 1440. Checked against the
  documented two-measure system and found intended, not a drift.
- **The heavy image crops land on their subject.** Three frames discard 57–69% of the
  photograph and I captured all three at 1:1 rather than trusting the percentage: the
  projects lead photograph at 375 (66.7% discarded) has every child's face in frame; the
  CityScapes journey card at 1440 (66.8% discarded) reads cleanly as a riverside walk with
  the skyline behind. **The crop percentage is not a defect signal** — worth recording,
  because it is exactly the kind of number that manufactures a phantom defect list.
- **`uttarakhand-fire-scar-2016.jpg` has been moved** — it is now at `--op:50% 8%`, not
  the 42% AD-08 measured, so that recommendation was actioned (past the 22% suggested).
  Not reopened.
- **`monsoon-flooded-fields.jpg` remains at `50% 44%`** and is still tagged placeholder.
  AD-08's finding that object-position is inert on it is frame-height dependent (12.3%
  of the image height is cropped at a 658px frame, so the value is not inert there).
  Carried forward as AD-08 left it, not re-litigated.
- **The ticker cells' focus ring is not clipped.** My first probe flagged it; the ring is
  drawn at `outline-offset:-3px`, i.e. inset, so it sits inside the rail. Probe error,
  corrected here rather than reported as a defect.
- **The mobile chip row's overflow is otherwise sound.** 96px of scroll at 320, 41px at
  375, 0 at 940; nothing is unreachable, and after A-4 nothing is hidden by the fade.
- **The bar over every ground.** Captured at real scroll offsets crossing dark → paper →
  paper-2 → dark → mustard, at 1440×900 and 375×635, and read. A black bar with off-white
  type reads as a deliberate instrument rule over paper and over mustard, not as a
  foreign object parked on the page — it is consistent with the "dark leads" grammar the
  whole design rests on. Its 1px light hairline is invisible against paper but is
  redundant there, because the black-to-paper edge does the work; over the dark bands,
  where it is needed, it paints. **My answer is that a bar which never changes is the
  honest choice for this page** — a shrink-on-scroll or hide-on-scroll-down bar would add
  a motion language the page deliberately does not have (AD-08 ruled out even
  auto-advancing the hero), and hiding it would take the one persistent CTA off screen.
  No change recommended.
- **Transient overlap while free-scrolling is not a defect** and is left alone: display
  type passing under a sticky header is what a sticky header is. The distinction that
  matters, and the one that was broken, is overlap on *arrival* — see A-1.
- **Keyboard order is correct** and there is no duplicate nav in the tab order: only one
  of `.navlinks` / `.navscroll` is focusable at a time. (An earlier probe of mine
  suggested 14 stops before content by testing the elements' own computed display instead
  of their ancestors'; the real figure is 8.)
- **The hero deck is intact** after every change — arrows, pager, tab sync, the
  deliberate no-loop at slide 4, and no vertical jump on a tab click.
- **Settled items confirmed present and correct, not reopened:** `.w7-jr-meta`'s
  `min-height:3em`; the journeys 768–1279 two-row fold and its `min-width:38%`; the
  projects register's dormant seventh rung; the campaigns march at 12% with a cap of 3;
  the archive sheet's twenty marked placeholders (two treatments, no third variant, and
  no placeholder `alt` claiming a year); the smell banner with nothing to click; the four
  impact tiles; the four journeys and their duration-drives-width ratios.

---

## D. THE FINAL MEASURED PAGE

### Every band at 375×812

| band | tier | height | top | pad-top | ground |
|---|---|---|---|---|---|
| top | t1 | 716.89 | 106 | 0 | #0D0D0B ground |
| ticker | — | 116.45 | 823 | 0 | #151512 ground-2 |
| say | t1 | 417.05 | 939 | 0 | #0D0D0B ground |
| work | t2 | 741.28 | 1,356 | 56 | #F3F2F0 paper |
| journeys | t2 | 833.20 | 2,097 | 56 | #0D0D0B ground |
| projects | t2 | 893.48 | 2,931 | 56 | #ECEBE8 paper-2 |
| campaigns | t3 | 784.11 | 3,824 | 44 | #151512 ground-2 |
| about | t2 | 890.33 | 4,608 | 56 | #F3F2F0 paper |
| impact | t3 | 598.19 | 5,499 | 44 | #151512 ground-2 |
| farm | t1 | 841.25 | 6,097 | 0 | #0D0D0B ground |
| gtm | t4 | 325.58 | 6,938 | 22 | #151512 ground-2 |
| **record** | t2 | **1,393.48** | 7,264 | 56 | #F3F2F0 paper |
| give | t3 | 861.13 | 8,657 | 44 | #E1A32B mustard |
| footer | — | 725.83 | 9,518 | 12 | #151512 ground-2 |

### Every band at 1440×900

| band | tier | height | top | pad-top | ground |
|---|---|---|---|---|---|
| top | t1 | 825.00 | 63 | 0 | #0D0D0B ground |
| ticker | — | 111.16 | 888 | 0 | #151512 ground-2 |
| say | t1 | 488.55 | 999 | 0 | #0D0D0B ground |
| work | t2 | 1,013.83 | 1,488 | 129.6 | #F3F2F0 paper |
| journeys | t2 | 1,058.08 | 2,502 | 129.6 | #0D0D0B ground |
| projects | t2 | 1,112.66 | 3,560 | 129.6 | #ECEBE8 paper-2 |
| campaigns | t3 | 1,009.78 | 4,672 | 93.6 | #151512 ground-2 |
| about | t2 | 944.89 | 5,682 | 129.6 | #F3F2F0 paper |
| impact | t3 | 550.97 | 6,627 | 93.6 | #151512 ground-2 |
| farm | t1 | 1,006.09 | 7,178 | 0 | #0D0D0B ground |
| gtm | t4 | 336.09 | 8,184 | 43.2 | #151512 ground-2 |
| record | t2 | 1,236.17 | 8,520 | 129.6 | #F3F2F0 paper |
| give | t3 | 679.16 | 9,756 | 93.6 | #E1A32B mustard |
| footer | — | 416.97 | 10,435 | 43.2 | #151512 ground-2 |

### Document totals

| viewport | document | vs the ~8,200 target |
|---|---|---|
| 375×812 | **10,244** | +2,044 |
| 375×635 | **10,125** | +1,925 |
| 1440×900 | **10,852** | — |
| 320×812 | 10,788 | — |
| 1920×812 | 10,948 | — |

10,244 at 375×812 and 10,852 at 1440×900 match the AD-08 record exactly. The ~8,200
target was formally ruled unreachable and the page ships at full length (D-07.11);
nothing in this pass added or removed a pixel of it.

### The checks

- **Phone cap (900px), at 375:** one breach — `record` at **1,393.48px**, 493.48px over.
  Every other band is inside it. At 320, four bands breach (about 1,023.41, farm 905.44,
  record 1,456.42, give 935.38); 320 is below the tested floor.
- **Ground adjacency:** no clashes across all fourteen bands, at 375×812, 375×635 and
  1440×900.
- **`scrollWidth === width`:** holds at 320, 375, 390, 414, 560, 768, 901, 1024, 1280,
  1440, 1920.
- **Console:** clean at every width, no errors or warnings.
- **Touch targets:** zero controls under 24px at any width. Four remain under 44px at
  phone widths, all in the arithmetically capped campaigns stack (B-1).

---

## E. QUESTIONS, IN ORDER OF CONSEQUENCE

1. **Mobile navigation.** For 91.9% of the phone document (y 106 → 9,518 of 10,244) the
   reader has exactly one link on screen: GIVE. D-01.1 ruled the chip row non-sticky when
   the page was shorter. Keep that ruling, make the row sticky (+37px, 14.6% of a 635px
   screen), or put a single compact index control in the ~165px of unused space already in
   the bar?
2. **`record` is still 1,393.48px at 375** — 493px over the cap, the only band over it,
   and 1,456px at 320. AD-07 called it "first item next pass". Is this the pass, or does
   it ship as it is?
3. **May the frozen hero be opened for three keyboard-layer fixes,** and may a skip link
   and a `<main>` wrapper be added? Today: no skip link, no `main` landmark, 8 tab stops
   before content, the deck's tab focus ring clipped 5px top and bottom at every width,
   and four identical "The full instrument" links in the tab order with three of them
   off-screen.
4. **Wire the active-section underline?** The CSS for it is already written and
   `aria-current` is never set on anything. About a dozen lines of JavaScript, no new
   visual language.
5. **"twenty-six years of paper"** in the record lead contradicts the file's own stated
   rule that no year count is typed, and goes stale in January. Replace with a "since
   2000" phrasing?
6. **Are the `cityscapes-*` frames from the approved Drive archive?** Seven of them have
   non-camera dimensions and no EXIF, unlike every archive photograph on the page.

---

## F. WHAT CHANGED IN THE FILE

Five edits, all in `public/design/v3/home.html`, each commented in place with the
measurement behind it:

1. `:root{--bar-h;--nav-h}` + `html,body{scroll-padding-top:var(--nav-h)}`, and the two
   header-height literals replaced by the tokens. (A-1)
2. `.w7-jr-strip` — 8px vertical padding cancelled by 8px negative margin, at ≤767. (A-3)
3. An AD-09 block before `</style>`: `::after` hit expanders on `.act`, `.w7-ce-lk`,
   `.w7-ce-pre a` and `.navscroll a.nl`, with the two-rule campaigns exception. (A-2)
4. `.navscroll ul::after` — an 8px trailing flex spacer. (A-4)
5. `#give .d1` — a non-breaking space between the last two words. No word changed. (A-5)

Composition, copy and everything under "settled" are untouched. Document height, band
heights and horizontal overflow are unchanged at every width tested.

---

# FROZEN — the six rulings implemented, 21 August 2026

**Ruling set:** `DECISIONS-2026-08-20-homepage.md`, "21 August, final" — D-09.1 … D-09.6.
**File:** `public/design/v3/home.html` (unchanged in scope; nothing outside
`public/design/` and `docs/design/` was touched).
**Backup before the first edit:** `home.html.bak-ad10-pre` in the session
scratchpad, 261,175 bytes.
**Method:** Chrome CDP with `Emulation.setDeviceMetricsOverride` at every width,
timezone Asia/Kolkata, device scale 1. No capture in this section was taken with
a bare `--window-size`. Widths exercised: 320, 375, 390, 414, 519, 560, 768, 901,
1024, 1280, 1440, 1920. Phone heights: 635 and 812. Every PNG cited was opened
and looked at.

**Change footprint, measured against the backup rather than asserted:**
261,175 → 286,965 bytes, and the diff is **four modified lines** — the `<header>`
line, the Record lead, and the two lines of `mark()`'s scroll-into-view — with
everything else inserted. **Five of the six rulings are implemented; D-09.2 is
reported and not acted on, for the reasons and numbers in §D-09.2 below.**

**The headline number: the drawn page did not move.** All fourteen bands, at both
widths, are identical to this document's own §D ledger **to 0.00px**, and so is
every band's `top`. Document height 10,244px at 375×812 and 10,852px at 1440×900,
before and after. The accessibility layer, an index control and a copy line were
added for **zero pixels of layout**.

> **A correction to this document's own baseline, for the record.** The brief for
> this pass quoted the document height at 375 as 10,282px. It is **10,244px**,
> measured before any edit and again after, and that agrees with §D above and with
> AD-08 §9.3. 10,282 appears to be a transcription slip and nothing was built
> against it.

---

## D-09.3 — the hero opens for the keyboard, and only for the keyboard

Four items, all four done. Nothing that is drawn moved.

**1 · The deck's tab focus ring is unclipped, on all four sides.** `.rig-tabs` is
`overflow-x:auto`, which forces `overflow-y:auto`, and a scroll container clips
both axes — so the ring (2px at `outline-offset:3px`, i.e. 5px outside the border
box) lost its top and bottom edges at every width, and its left edge on the first
tab. The fix is the A-3 move made symmetric: `margin:-19px -5px -5px;padding:5px`,
so the content box lands on the pixel it landed on before —

```
margin box left  = L          (unchanged)
border box left  = L − 5
content box left = L − 5 + 5 = L      ← the first tab, unmoved
```

— and vertically the existing `margin-top:-14px` becomes −19px against +10px of
padding, so the strip's margin box height is unchanged. `.rig-tabs` is `flex:1`
inside `.rig-bar`, so it absorbs the 10px the two negative margins give back and
`1 of 4` and the arrows keep their own pixels.

| | overhang top / bottom / left, before → after |
|---|---|
| 320 · 375 · 390 · 414 · 768 · 901 · 1024 · 1280 · 1440 · 1920 | **5.0 / 5.0 / 5.0 → 0.00 / 0.00 / 0.00** |

Proved by A/B in a single page load — the rule reverted in place and re-measured —
at 375, 390, 414, 768 and 1440: **every tab's x and y, every tab's height, the
pager's x/y, the arrows' x/y, the bar height, the hero height and the document
are byte-identical.** The measured values also match AD-08 §2's table exactly
(1440: tab row 822.5 → 851.5, pager 834.8, arrows 824; 375: tab row 712.7 →
756.7, pager 779.5, arrows 766.7). **Read the PNGs:** the ring is a closed
rounded rectangle around AIR at 375 and 1440, with the white selected-tab marker
still painting above it.

**One residual found by measuring the ring after scrolling, not just at rest.**
The tab row is a real scroll container at phone widths (scrollWidth 376 against a
345px client at 375, 376 against 360 at 390), so padding alone only guarantees the
ring at `scrollLeft 0`. Clicking out to Forest fire and back to Air left the row
resting at **scrollLeft 5 — exactly the ring allowance scrolled off** — so Air's
ring lost its left edge again in that state. Fixed on both paths, and the two
numbers must stay equal: `scroll-padding-inline:5px` for the browser's own
scroll-into-view on Tab, and a `RING=5` allowance in `mark()`'s reveal
arithmetic. After: round-trip rests at **scrollLeft 0, left overhang 0.00** at
375, 390, 414 and 1440, and clicking the last tab now scrolls to 31 rather than
26, i.e. it reveals the tab *plus* its ring.

**2 · The three off-screen duplicate "The full instrument" links are out of the
tab order.** Four identical links were focusable at once, three on off-screen
slides, so a Tab from the deck moved focus into an invisible panel and scrolled
the track to it. `mark()` now sets `tabindex="-1"` on every focusable in a
non-selected panel — **not** `hidden` and **not** `inert`, because the panels stay
in the accessibility tree on purpose (AD-08 §4.7: an AT user having all four
readings at once is a feature of this deck). Only *sequential* focus is withdrawn.

| | before | after |
|---|---|---|
| "The full instrument" links in the tab order | 4 | **1**, at all 12 widths |

It runs from `mark()`, which `build()` calls as `mark(0)`, so the state is right
on the first paint. Verified to track the active slide through arrows, tab clicks
and Arrow keys: `['0','-1','-1','-1']` → `['-1','0','-1','-1']` → … at 375 and
1440. **Without JS nothing applies and all four stay tabbable, which is the right
degradation** — there are no tabs and no arrows either, so sequential focus is the
only way through the deck.

**The deck is intact.** Re-verified after every edit: `scrollLeft` steps 0 → 375 →
750 → 1125 at 375 and 0 → 1440 → 2880 → 4320 at 1440; pager `1 of 4` … `4 of 4`;
`next.disabled` true at slide 4 and **still no loop** (AD-08); prev/next and tab
clicks sync; Arrow keys work; and **`scrollY` stays 0 throughout — no vertical
page jump.** Console silent.

**3 · A skip link.** `<a class="skip" href="#main">Skip to the content</a>`, first
in the DOM, off-screen at `top:-200px` and arriving at `top:0` on focus. Mustard
chip, on-mustard micro-caps, 195.4 × 44.0px at every width. The ring is **inset**
(`outline-offset:-3px`, off-white) rather than the `.give` halo, because that
treatment puts 7px of ring above y=0 and off the screen on the one control that
lives in the corner — the same reasoning `.s-ticker-cell:focus-visible` already
uses. Measured: focusing it **does not scroll the page** (scrollY 0 → 0, and 5000
→ 5000 from mid-page); activating it moves focus to `MAIN#main` and lands it at
**55.8px at 375 against `--nav-h` 56, and 63.0px at 1440 against 63** — the A-1
anchor offset applies to it for free.

**4 · A `<main>` landmark.** One `<main id="main" tabindex="-1">` wrapping the
thirteen sections from `#top` to `#give`, stopping before `<footer>`. `tabindex="-1"`
so the skip link's focus actually lands rather than only moving the sequential
start point. No rule in this file selects a direct child of `body`, and `main` is
`display:block` with margin and padding stated as 0, so it carries no box —
document height identical at all 12 widths. Landmarks are now header, four
labelled navs, main, footer; no duplicate ids.

**Tab stops before the content: 8 → 9 at >940, 8 → 10 at ≤940.** That is the right
reading of the ruling rather than a regression: the eight header stops are
unchanged, and **stop 1 now bypasses all of them.** The extra phone stop is the
D-09.1 control.

---

## D-09.5 — "twenty-six years of paper" → "the paper since 2000"

The one surviving live breach of a rule this file states in its own comments in two
places — *"NO YEAR COUNT IS TYPED ANYWHERE"* — and a line that goes stale in
January 2027 with nobody touching the file, which is the failure mode AD-05 cut a
typed "today" to avoid. The other three hits in the file are comments; this was the
only live one, confirmed by grep.

> Four things accumulate here whether or not anybody writes a post: the daily
> readings, the orders that follow them, the things you can do about them, and
> **the paper since 2000.**

**Four words for four words, and the register is held.** The other three items in
the list are noun phrases, so the fourth stays one. "Since 2000" is the page's own
existing phrasing for this depth — it is already on impact tile 1 ("…reached since
2000", D-07.6) and on the door 200px below ("9,400 days on file since 2000").
Founded 2000 is sourced: `SOURCE-FACTS.md` line 17, *"Founded 2000, as the We for
Yamuna campaign"*.

**Cost: 0.00px.** `.im-head` is 155.45px at 375 and 128.44px at 1440, before and
after; `record` is 1,393.48 / 1,236.17, unchanged. Read in the PNG at 375 and at 320.

---

## D-09.4 — the active-section underline, wired, with `aria-current`

The vocabulary was already drawn and nothing ever set it:
`.nav a.nl:hover, .nav a.nl[aria-current]{color:var(--fg);border-bottom-color:var(--mustard)}`.
`aria-current` was on **zero** elements at every width. **No new colour, no new
mark, no new breakpoint** — the code adds and removes one attribute.

**It is not a reveal system.** Nothing observes anything in order to animate it,
nothing adds a class that transitions, and **no rule in this file puts a
transition on `.nav a.nl`** (checked: 18 transitions in the file, none matching,
and no universal transition). The underline appears on the frame it is set. The
file's inert `.rise` observer still matches **0 nodes** and was not touched.

**A reading line, driven by the same token as the anchor offset — which is why the
two cannot fight.** The observer root is shrunk to a 1px row sitting at exactly
`--nav-h`, read from the custom property so the 56/63 split across the 940
breakpoint is inherited rather than re-typed. `html,body{scroll-padding-top:var(--nav-h)}`
lands an anchor jump with the band's top at exactly `--nav-h`; the reading line is
at exactly `--nav-h`. The band a reader jumped to is the band that lights, **by
construction**.

**One real defect found and fixed, recorded because a desktop-only check would
have shipped it.** A first version read the answer straight off `isIntersecting`.
A same-page click on JOURNEYS lands the band top at 56.47 against a line at 56.0,
so the boundary itself crosses the line and **both** bands intersect — `work` over
[56, 56.47] and `journeys` over [56.47, 57] — and whichever went live first won.
Measured: **clicking JOURNEYS at 375 and 375×635 underlined WORK**, while 1440,
where the landing fell 0.47px the other side of the line, was correct. Each
callback now recomputes from the rects with an explicit containment test,
`top <= line+0.5 < bottom`. Bands are contiguous and non-overlapping so exactly
one can satisfy it, and the half-pixel bias points at the band being *arrived* in
— the same slack the anchor landing itself has (−0.48 to +0.47px across five
widths). Both document edges fall out of the same one test.

**It lights the band the reader is actually in, and nothing otherwise.** The nav
is a **selection** of five bands, not a partition of fourteen, so the underline is
dark in the hero, ticker, statement, Projects, Campaigns, About, Green the Map,
Give and the footer. Considered and refused: holding the last-lit item until the
next arrives, which leaves JOURNEYS underlined through Projects, Campaigns and
About — three bands that are Work's children, not Journeys'. `aria-current` is
announced as the current location, and pointing it at the wrong section is worse
than pointing it nowhere. `location`, not `true`: these are positions within one
page. The CSS matches on attribute presence, so the value is free to be right.

**Verified two ways, at 375×812, 375×635, 390, 768 and 1440.** A scroll walk
parking the line inside all fourteen bands lights exactly the right item and
nothing at either end of the document; and **both anchor paths** —

| | cold load with the hash | same-page click |
|---|---|---|
| `#work` `#journeys` `#impact` `#farm` `#record` | correct at all three heights, landing error −0.48 … +0.47px | correct at all five widths, same error band |
| `#give` `#main` `#top` | land correctly, light nothing (no `.nl` points at them) | — |

**Silent where `IntersectionObserver` is unavailable** — the guard is the whole
degradation: no observer, no attribute, no error, and a nav that behaves exactly as
before. The two older observers in this file are unguarded; this one is guarded
because it is the only one whose absence a reader would never notice.

---

## D-09.1 — one compact index control, in the bar's own unused space

**The measurement that bought it:** at 375 the bar carries a 120px wordmark and a
70.4px GIVE chip inside 335px of content width — **144.6px already paid for and
empty** (AD-09 §B-4 estimated ~165; the measured figure is 144.6). The control is
70.0 × 44.0px and sits at x 202.5, between them.

**It costs the page nothing, open or closed.** Document height at 375×812 is
**10,244 closed and 10,244 open**; 10,125 / 10,125 at 375×635; 10,788 / 10,788 at
320; 10,426 / 10,426 at 768. `scrollWidth === innerWidth` in both states. That is
what makes it not the rejected option: a sticky chip row is +37px of permanent
chrome on top of the 56px bar = 93px, **14.6% of a 635px iOS Safari viewport.**

**Form: no new iconography, which is the ruling and not an oversight.** No
hamburger, no caret, no chevron — this page's only non-type marks anywhere are the
arrow, the six-band scale and the halftone, and a disclosure glyph would be its
first icon. The control is the word the page already uses for these six things
(`.navscroll` is `aria-label="Sections"`), set in the nav's own micro-caps. **Its
open state is the page's own mark:** `.nav a.nl` already carries a 2px transparent
bottom border that goes mustard on hover and on `[aria-current]`; the button
borrows exactly that declaration for `[aria-expanded=true]`, so a sighted reader
gets a state marker without a glyph being invented. The panel is six full-width
44px rows, hairline-ruled — the same ruled-rows grammar as the footer grid and the
Record doors — 265px tall, fixed at `top:var(--bar-h)`, at **z-index 59 against
the bar's 60**, so the wordmark, the control and GIVE stay visible above it.

**The rows carry `class="nl"` and live inside `.nav` on purpose:** they inherit the
nav's type, colour and `[aria-current]` underline with no new rule, so opening the
index also shows the reader which band they are standing in. Verified — choosing
FARM sets `aria-current` on all three copies of that destination, and the PNG at
375 in the Record band shows RECORD brighter with its mustard rule.

**Not modal, and that is the point.** The file's own comment rejects a hamburger
drawer as "this site's only modal pattern". No scrim, no focus trap, no
`aria-modal`, no scroll lock. Four ways out: press it again, Escape, choose a
destination, or touch anything else.

| behaviour | measured, at 320 / 375×812 / 375×635 / 414 / 768 |
|---|---|
| Escape | closes, `aria-expanded` → false, **focus returns to the button** |
| choose a destination | closes; `#farm` lands at 55.5–56.1 against `--nav-h` 56 (63.0 at 1440) — the A-1 offset untouched, nothing calls `scrollTo` or `preventDefault` |
| touch outside | closes |
| Tab past the last row | closes; **focus is never blocked** |
| ≥941 | button `display:none`, panel cannot paint, **zero extra tab stops on desktop**, and the JS closes it on resize |
| no JS | `hidden` is in the markup, so the reader gets the status quo and never sees a button that cannot open |

**Two real defects found and fixed during the build, both by measuring rather than
by reading the code.**

1. **The panel was unreachable from the keyboard.** Placed after `.navscroll` (its
   first home) the tab order ran SECTIONS → GIVE → panel, so the first Tab out of
   the button *left* the panel, the `focusin` handler correctly closed it, and a
   keyboard reader could open the index but never enter it. Fixed by moving the
   markup to sit immediately after its button inside `.nav-in` — not by
   special-casing GIVE in the handler. Being `position:fixed` it is out of flow
   and is not a flex item, so the bar's one-row 56px layout is untouched: mark,
   button and GIVE measured on the same pixels before and after.
2. **Tab ran into the covered chip row.** With the panel open, the six
   `.navscroll` chips were still in the tab order between the bar and the panel.
   At the top of the page they sit *underneath* the open panel, so focus went
   somewhere the reader cannot see; and anywhere further down the row has scrolled
   away, so **focusing a chip scrolls the page back to the top** — the reader
   opens an index to keep their place and loses it to the second Tab. The chips
   are withdrawn from sequential focus while the panel is open, the same move and
   the same reason as D-09.3 on the deck's off-screen panels.

**Result: exactly 10 tab stops before the content, open or closed** —
skip · wordmark · SECTIONS · [six rows | six chips] · GIVE — so AD-09's recorded
property that only one index is focusable at a time now holds in **both** states.
The chips' `tabindex` round-trips to `null` on close. Verified at 320, 375×812,
375×635, 414 and 768, with the scroll offset held at 5000 throughout: **it never
moved.**

---

## D-09.2 — Record's cap breach: it cannot be closed. Reporting, not breaking

**Record is unchanged: 1,393.48px at 375, 1,236.17 at 1440, 1,456.42 at 320.** Only
its lead was rewritten (D-09.5), at zero cost. Per the instruction for this
ruling — *"if you conclude it cannot be done without breaking D-07.14, stop and
tell me rather than quietly breaking it"* — here is the arithmetic that concludes it.

**The band, measured, at 375:**

| part | height | share |
|---|---|---|
| tier padding (t2, 56 + 56) | 112.00 | 8% |
| masthead + lead (`.im-head`) | 155.45 | 11% |
| the three doors | 421.14 | 30% |
| the archive block (`.s-record-sheetblock` + its 26px margin) | 668.89 | **48%** |
| — of which the 27-cell field itself | 403.30 | 29% |
| **total** | **1,393.48** | vs a 900 cap: **493.48 over** |

**Every route to 900, costed on the live page rather than estimated:**

| route | 375 | 320 | verdict |
|---|---|---|---|
| shipped, 4 columns | 1,393.48 | 1,456.42 | 493 over |
| densify the field to 5 columns | 1,267.19 | 1,350.27 | 367 over |
| …to 6 columns | 1,182.38 | 1,278.97 | 282 over |
| …to 7 columns | 1,121.38 | 1,227.58 | 221 over |
| …to 9 columns | 1,065.72 | 1,180.67 | 166 over |
| …to 14 columns (cells 19.3 × 12.8px) | 1,020.91 | 1,142.80 | **still 121 over** |
| delete all three doors, field untouched | **946.34** | **944.03** | **still 46 over** |
| delete the whole archive block | 724.59 | 814.92 | under — and this is what D-07.14 forbids |
| delete the doors **and** densify to 5 columns | 820.05 | 837.88 | under |

**Three findings follow, and they are the whole answer.**

**1 · The field cannot close it at any density.** Not at 7 columns, not at 9, not
at 14. The best case that keeps the cells recognisable as photographs leaves
Record at 1,121px. There is no column count that reaches 900.

**2 · Densifying breaks D-07.14 before it gets close, and the reason is
measurable.** The inverted year chip — one of the four marks the client's ruling
specifies, and the one that makes a placeholder *unmistakable* — is absolutely
positioned type at a **fixed 37.7 × 21.5px**, so it does not shrink with the cell.
Its share of the cell it is supposed to be marking:

| columns | cell at 375 | chip / cell height | cell at 320 | chip / cell height |
|---|---|---|---|---|
| **4 (shipped)** | 80.0 × 53.3 | **40.3%** | 66.3 × 44.2 | 48.7% |
| 5 | 63.0 × 42.0 | 51.2% | 52.0 × 34.7 | 62.0% |
| 6 | 51.7 × 34.4 | 62.4% | 42.5 × 28.3 | 75.9% |
| 7 | 43.6 × 29.0 | 74.1% | 35.7 × 23.8 | **90.3%, and the chip is 37.7px wide in a 35.7px cell — it overflows** |

At 4 columns the chip already takes 40% of the frame. Past that the mark eats the
thing it marks, and by 7 columns at 320 it is wider than the cell. **The archive
sheet is at its practical floor as shipped.** Confirmed by reading the PNG at 375:
the seven scanned years and the twenty hatched, dotted, pale-chipped placeholders
are distinguishable at a glance, and the `7/27 YEARS SCANNED` tally is true.

**3 · The band has no single removable element that closes it.** **Delete all
three doors and Record is still 946.34px at 375 and 944.03 at 320.** Tier padding
plus masthead plus the archive block alone is 936. So the breach is not
attributable to the archive, or to the doors, or to any one thing — it is the sum
of four subjects in a band where every other band on the page carries one. The
only routes under 900 either delete the archive block (forbidden by D-07.14) or
delete the band's entire living-record half — *Today's readings*, *Orders and
policy*, *Do it yourself*, each with a real destination — **and** degrade the
placeholder marking. That is a composition the client endorsed in the same
session, and it is not mine to take at the freeze.

### Two facts that reframe the ruling, offered because the ruling rests on them

**The premise "the archive sheet the client filled is what makes it so tall" is
right about the block and wrong about the act.** Filling it cost **+19.56px**:
Record was **1,373.92px** before, and AD-07's own table labels the row that
becomes 1,393.48 *"(sheet filled)"*. The band was already 474px over the cap **two
passes before** the archive was filled — AD-04 recorded it as "a 474px unlicensed
breach that predates this pass". Twenty photographs did not create this breach;
they added 1.4% to it.

**The cap is art-director doctrine, and one of its two standing licences is now
vacant.** The ~900px per-band figure originates in `2026-08-20-art-direction.json`
and is repeated as a brief convention in `AD-07-brief.md`; it is **never a numbered
client decision**, and the doctrine's own premise ("375 today is 12,296px") is
already recorded as stale in `HANDOFF-2026-08-20`, as is its companion ≈8,200
document target (formally ruled unreachable, D-07.11). Its wording carries an
exception list: *"no section may exceed 900px at 375 **except the three heroes (one
viewport each) and the timeline**"*, carried into AD-04 as "licensed exceptions:
heroes, timeline", where band 06 timeline sat at **1,551.3px, licensed**. **The
timeline band was deleted in the AD-07 restructure** and its PAUSE role reassigned
to the smell banner, so that licence is unused, and the heroes now come in under
the cap anyway (716.89 and 841.25 at 375).

**So the cheapest honest close is a ruling, not a redesign: license Record.** It is
the page's register band — the same kind of object, an extent whose meaning *is*
its extent, that the timeline licence existed to cover — and taking the vacant
licence keeps the count of exceptions at two rather than raising it to three.
**That is the client's call and I have not taken it.** The alternative that
actually reaches 900 is on the table above, priced: the three doors come off the
phone.

---

## D-09.6 — the `cityscapes-*` frames are Swechha's own

**§B-6 of this document is withdrawn.** It asked whether seven frames in that
family come from the approved Drive archive, on the evidence of non-camera pixel
dimensions (660×777, 684×780, 663×780, 642×777, 684×777) and a missing EXIF block.
**The client has ruled: they are Swechha's own photographs, resized somewhere along
the way, which is why they carry no EXIF. They keep the archive credit and are not
tagged placeholder.** Absent dimensions and absent EXIF are evidence of a resize,
not of provenance, and B-6 should not have read them as a provenance question.

**The page already complies, and nothing was changed for this ruling.** No
`cityscapes-*` frame anywhere in `home.html` is tagged as a library placeholder.

**One trap to name, because the word "placeholder" is doing two jobs.** Five
`cityscapes-*` frames do sit in cells carrying `.s-record-ph`:
`cityscapes-yamuna-walk` (2017), `-landfill-walk` (2014), `-heritage-walk` (2010),
`-riverbank-restoration` (2006), `-group-learning` (2002). **That class marks the
archive cell, not the photograph** — it says "this *year* has not been scanned
yet", which is exactly D-07.14, and their alt text reads "Placeholder frame: …"
and deliberately claims no year. Two more of the family sit in *scanned* cells and
are not marked at all (`cityscapes-butterfly` 2025, `cityscapes-forest-walk` 2020),
plus `cityscapes-hero-riverside-walk` in the journeys band. **D-09.6 and D-07.14 do
not conflict** — but a future session must not "tidy" `.s-record-ph` off these
cells on the strength of D-09.6, because that would unmark five unscanned years.

**One thing D-09.6 does leave open, and it is outside this pass's permitted
scope.** `content/photo-library.json` has **53 entries and not one of them is a
`cityscapes-*` file.** So the "archive credit" the ruling says these frames keep is
not actually recorded anywhere in the repo. `content/` was out of scope for this
pass and was not touched. **Flagged for whoever owns the photo library.**

---

## The final measured page

### Every band at 375×812 — and its delta against §D of this document

| band | tier | height | Δ vs §D | top | pad-top | ground |
|---|---|---|---|---|---|---|
| top | t1 | 716.89 | **+0.00** | 106 | 0 | #0D0D0B ground |
| ticker | — | 116.45 | **+0.00** | 823 | 0 | #151512 ground-2 |
| say | t1 | 417.05 | **+0.00** | 939 | 0 | #0D0D0B ground |
| work | t2 | 741.28 | **+0.00** | 1,356 | 56 | #F3F2F0 paper |
| journeys | t2 | 833.20 | **+0.00** | 2,097 | 56 | #0D0D0B ground |
| projects | t2 | 893.48 | **+0.00** | 2,931 | 56 | #ECEBE8 paper-2 |
| campaigns | t3 | 784.11 | **+0.00** | 3,824 | 44 | #151512 ground-2 |
| about | t2 | 890.33 | **+0.00** | 4,608 | 56 | #F3F2F0 paper |
| impact | t3 | 598.19 | **+0.00** | 5,499 | 44 | #151512 ground-2 |
| farm | t1 | 841.25 | **+0.00** | 6,097 | 0 | #0D0D0B ground |
| gtm | t4 | 325.58 | **+0.00** | 6,938 | 22 | #151512 ground-2 |
| **record** | t2 | **1,393.48** | **+0.00** | 7,264 | 56 | #F3F2F0 paper |
| give | t3 | 861.13 | **+0.00** | 8,657 | 44 | #E1A32B mustard |
| footer | — | 725.83 | **+0.00** | 9,518 | 12 | #151512 ground-2 |

### Every band at 1440×900

| band | tier | height | Δ vs §D | top | pad-top | ground |
|---|---|---|---|---|---|---|
| top | t1 | 825.00 | **+0.00** | 63 | 0 | #0D0D0B ground |
| ticker | — | 111.16 | **+0.00** | 888 | 0 | #151512 ground-2 |
| say | t1 | 488.55 | **+0.00** | 999 | 0 | #0D0D0B ground |
| work | t2 | 1,013.83 | **+0.00** | 1,488 | 129.6 | #F3F2F0 paper |
| journeys | t2 | 1,058.08 | **+0.00** | 2,502 | 129.6 | #0D0D0B ground |
| projects | t2 | 1,112.66 | **+0.00** | 3,560 | 129.6 | #ECEBE8 paper-2 |
| campaigns | t3 | 1,009.78 | **+0.00** | 4,672 | 93.6 | #151512 ground-2 |
| about | t2 | 944.89 | **+0.00** | 5,682 | 129.6 | #F3F2F0 paper |
| impact | t3 | 550.97 | **+0.00** | 6,627 | 93.6 | #151512 ground-2 |
| farm | t1 | 1,006.09 | **+0.00** | 7,178 | 0 | #0D0D0B ground |
| gtm | t4 | 336.09 | **+0.00** | 8,184 | 43.2 | #151512 ground-2 |
| record | t2 | 1,236.17 | **+0.00** | 8,520 | 129.6 | #F3F2F0 paper |
| give | t3 | 679.16 | **+0.00** | 9,756 | 93.6 | #E1A32B mustard |
| footer | — | 416.97 | **+0.00** | 10,435 | 43.2 | #151512 ground-2 |

### Document totals

| viewport | document | vs before this pass |
|---|---|---|
| 375×812 | **10,244** | **+0** |
| 375×635 | **10,125** | **+0** |
| 1440×900 | **10,852** | **+0** |
| 320×812 | 10,788 | +0 |
| 390×812 | 10,131 | +0 |
| 414×812 | 10,033 | +0 |
| 560×812 | 9,469 | +0 |
| 768×1024 | 10,426 | +0 |
| 901×900 | 10,193 | +0 |
| 1024×800 | 9,522 | +0 |
| 1280×800 | 10,016 | +0 |
| 1920×1080 | 11,159 | +0 |

### The checks, at all twelve widths

- **`scrollWidth === innerWidth`:** holds at 320, 375, 390, 414, 560, 768, 901,
  1024, 1280, 1440 and 1920 — and **also with the index panel open**. Body matches.
- **Console:** silent at every width, before and after every change, and with the
  panel open. No errors, no warnings, no exceptions, no failed requests.
- **Ground adjacency:** zero clashes across all fourteen bands at every width and
  at 375×635.
- **Phone cap (900):** one breach at 375 — `record` at 1,393.48 — and the same
  four at 320 (about 1,023.41, farm 905.44, record 1,456.42, give 935.38),
  identical to §D. Record also breaches at 390 (1,280.03), 414 (1,283.05) and 560
  (1,249.06); §D reported only 375 and 320. Nothing here moved it.
- **Touch targets:** **zero controls under 24px at any width**, unchanged. Four
  remain under 44px at phone widths, all in the arithmetically capped campaigns
  stack (§B-1), unchanged. The new control is 70.0 × 44.0 and every panel row is
  full-width × 44.0.
- **Keyboard order:** 10 stops before the content at ≤940 (open or closed), 9 at
  >940, with stop 1 bypassing all of them. One "The full instrument" link in the
  tab order, down from four. One index focusable at a time in both states.
- **Focus visibility:** deck tab ring overhang 0.00 on all four sides at all
  twelve widths, at rest and after scrolling; skip link and index control both
  ring visibly and were read in PNGs at 375 and 1440.
- **Anchor landing, re-verified on both paths after the nav change:** cold load
  with the hash and same-page click, for `#work` `#journeys` `#impact` `#farm`
  `#record` `#give` `#main` `#top`, at 375×812, 375×635 and 1440×900 — every
  landing within **±0.48px** of `--nav-h`, and `aria-current` correct on arrival.

---

## Found and NOT fixed — one defect, reported rather than acted on

**At 320 only, two of the three Record doors have their eyebrow label colliding
with the figure beside it.** `.s-record-door-lbl` and `.s-record-door-n` both carry
`white-space:nowrap` at ≤519, and at 320 the label's text overflows its grid track
while the two boxes stay a clean 16px apart — so `getBoundingClientRect` reports no
overlap and only the glyphs collide. **This is the kind of defect that is invisible
to a box measurement and obvious in a PNG**, which is where it was found.

| width | door 1 label | door 2 label | door 3 |
|---|---|---|---|
| **320** | client 95 / scroll 128 → **33px overflow, collides** | client 86 / scroll 107 → **21px overflow, collides** | clean |
| 375 · 390 · 414 · 519 | 0 overflow | 0 overflow | clean |

It renders as *"UPDATED EVERY HOU9,400 DAYS ON FILE SINCE 2000"*. **It is
pre-existing** — the `.s-record-door*` CSS is byte-identical to the pre-pass
backup and nothing in the doors was touched — and 320 is below the tested floor by
prior ruling, which is why it survived AD-09. Probably a one-line fix (drop the
label's `nowrap` below 375), but it touches Record's doors, and Record is the band
this pass was told to report on rather than reshape. **Needs a ruling.**

---

## What a future session must not silently undo

1. **`.rig-tabs{margin:-19px -5px -5px;padding:5px;scroll-padding-inline:5px}` is
   four numbers that must move together.** Do not put the −14px back on the
   button — that kills the selected-tab marker, which this file's own comment
   records as a bug it has already had. Do not drop the horizontal half — it
   re-clips the first tab's ring, the one a keyboard reader meets first. Do not
   drop `scroll-padding-inline` or the matching `RING=5` in `mark()` — either
   alone leaves the ring unclipped only at `scrollLeft 0`. **Keep the CSS 5 and
   the JS 5 equal.**
2. **The deck's `tabindex="-1"` on non-selected panels is `tabindex`, not `hidden`
   and not `inert`, on purpose.** The panels must stay in the accessibility tree
   (AD-08 §4.7). Only sequential focus is withdrawn.
3. **D-09.4's reading line is driven by `--nav-h`, read from the custom
   property.** Never re-type 56 or 63 into that code; the anchor offset and the
   underline must move together or a same-page click will light the wrong band.
   And **do not simplify the containment test back to `isIntersecting`** — that is
   the bug that underlined WORK on a JOURNEYS click at every phone width.
4. **The underline going dark in Projects, Campaigns, About, Green the Map and
   Give is deliberate**, not an unfinished state. Do not "fix" it by holding the
   last-lit item; that makes `aria-current` announce the wrong section.
5. **The index panel must stay `hidden` in the markup and must stay immediately
   after its button inside `.nav-in`.** Move it and the keyboard reader can open
   it but not enter it. Give it a `display` value outside the `[hidden]` guard and
   it costs page height on every load.
6. **The panel is non-modal by ruling.** Do not add a focus trap, `aria-modal`, a
   scrim or a scroll lock, and do not add an icon to the control — no hamburger,
   no caret. The mustard `[aria-expanded=true]` underline is the state marker.
7. **The chip row's `tabindex="-1"` while the panel is open is load-bearing**, not
   tidying: without it a Tab inside the open index scrolls the page back to the
   top from anywhere below the fold.
8. **Record is 1,393.48px at 375 by client ruling on both halves of the band**
   (D-07.14 on the archive, D-07.11 on the length). Do not densify the archive
   field past four columns at ≤375 — the year chip is fixed at 37.7 × 21.5px and
   overflows the cell entirely by 7 columns at 320, which unmarks the
   placeholders. Do not delete the doors to hit the cap without a ruling; and note
   that deleting all three **still** leaves the band 46px over.
9. **The `cityscapes-*` frames are Swechha's own (D-09.6), but the five that sit in
   `.s-record-ph` cells must keep that class** — it marks an unscanned *year*, not
   a doubtful photograph.
10. **`.rise` matches zero nodes and its observer is inert. Leave it inert.** This
    file has no reveal or motion system and nothing added in this pass gives it
    one: no transition touches `.nav a.nl`, `.skip` or `.navidx`.
11. **The measurement method.** `Emulation.setDeviceMetricsOverride` only. A bare
    `--window-size` has manufactured phantom defect lists on this project twice.
    Add to that: **`Page.captureScreenshot` with a clip and
    `captureBeyondViewport:true` renders `position:fixed` elements against the
    document origin, so the fixed mobile bar and the index panel vanish from every
    scrolled capture.** That cost time in this pass. Viewport shots must be taken
    with `captureBeyondViewport:false` — see `cap10.mjs` in the scratchpad. And
    `sips --cropOffset` is unreliable; crop with PIL.

---

## Post-freeze fix — the 320 collision in the Record doors (client-reported)

Reported by the client after the AD-10 pass, and listed as open item 2 in that pass's
own report. **Fixed.**

At `≤519px` the doors' eyebrow takes `white-space:nowrap`. At 320 "Updated every hour"
needs **128px inside a 95px track**, so 33px of glyphs ran into the figure beside it and
the row rendered as *"UPDATED EVERY HOU9,400 DAYS ON FILE SINCE 2000"*. Door 2 overflowed
by 21px (*"COMPILED WEEKLYAST COMPILED 18 AUGUST 2026"*); door 3, whose eyebrow is one
short word, was clean. **The two boxes stayed 16px apart throughout**, which is why a
`getBoundingClientRect` check saw nothing — the defect only exists in `scrollWidth` vs
`clientWidth`, and in the PNG.

Measured before: overflow **33 / 21 / 0** at 320. Zero at 375, 390, 414 and 519.

**The fix is one declaration in a new `@media (max-width:374px)` block** — the eyebrow is
allowed to wrap — placed after the `≤519` block so it wins, and stopping at 374 so it
cannot reach the tested widths. Truncating either reading was rejected: both the label and
the figure carry meaning.

Verified after: overflow **0 / 0 / 0** at 320, 360 and 374, PNG read at 320 with both
readings intact and legible on two lines. **Zero movement at the tested widths** —
document 10,282px at 375 and 10,852px at 1440, `record` 1,393.5px at 375 and 1,236.2px at
1440, all identical to the pre-fix ledger. At 320 only, `record` grows 1,456 → 1,487.9px
as the two eyebrows take a second line; 320 remains below the project's tested floor.

Backup: `scratchpad/home.html.bak-pre-320fix`.
