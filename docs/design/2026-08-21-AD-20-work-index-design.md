# AD-20 — `/work`, the Work index

**One page, designed. 21 August 2026.**

**Prototype:** `public/design/v3/work/_index-proposal.html` — self-contained, in
the frozen language, served at `/design/v3/work/_index-proposal.html`. It does
not touch `scripts/build-work-pages.mjs`, `public/design/v3/work/index.html`, or
anything in `data/`. If it is approved, the generator folds it in.

**Method.** Chrome CDP, `Emulation.setDeviceMetricsOverride` only, IST, device
scale 1. Twelve viewports: 320×635, 375×635, 375×812, 390×844, 414×896, 560×800,
768×1024, 901×900, 1024×800, 1280×800, 1440×900, 1920×1080. Every number in this
document was measured on the built file, and every band was read as a PNG at 375
and at 1440. **635px is the phone height that decides arguments**, not 812; both
are quoted.

---

## 1. What the page is for, and what killed the old one

The client's brief: *"Sometimes people want to see Swechha's entire work in one
view. Design it nicely, aesthetically, minimally, it needs to be attractive."*
And the complaint: *"design language is too bland, Play with numbers, copy, some
data points, make it interesting. […] Too much empty space […] This use of black
and white blocks is getting to make pages boring."*

The old page failed for a reason that is checkable, not a matter of taste: **it
was a thinner copy of homepage bands 4–7.** All four of band 4's copy lines
appear on it verbatim; the rest was band 6's head with seven rows instead of
three, band 7's head, and band 5's head with the photographs taken out. It
carried **no figure at scale, no photograph except its masthead, and zero ARIA
tab groups** against `situation-air.html`'s five. Measured on the version I
captured: 1,022px spent on four ruled rows of kind names, with the right-hand
half of the band empty at every one of them.

So the page's job is not "the four kinds, again, denser." The whole-org view has
its own subject, and the subject is **the axes**. Four kinds is one way to sort
the register. It is the way the front page already sorts it. The interesting
ways are the ones no kind page and no item page can show, because they only
exist when you can see all of the work at once.

**The page's argument, in one line:** *Four kinds is one way to sort it. The
three below are the ones you cannot get anywhere else.*

The three:

| axis | the finding it makes possible | where else you could get it |
|---|---|---|
| **What a number can carry** — rate / total-with-a-start-year / total-with-no-start-year | Every figure Swechha publishes was **counted, never modelled**, so every rail on the page is the same weight — and the largest of the three groups cannot be turned into a rate at all | nowhere |
| **Who paid** — named more than once / named once / nobody named | Adobe is on three different kinds of work. EMpower is on two and dated. And the longest of the three lists is the one that names nobody | nowhere |
| **What one fact would buy** — the register's own `holes[]`, collected | Six gaps, each with the single fact that closes it; plus the one entry that is closed by deletion | the item pages, one at a time |

---

## 2. Directions explored, and why two of them lost

### Direction A — **THE DURATION SPINE.** Rejected on a hard constraint.

A logarithmic ladder running from two hours to fifteen years, with every piece of
work plotted on it; the four kinds become a *texture* along the ladder rather
than the primary partition. It draws the one sentence the old page merely stated
(*"a different size of commitment, from two hours to fifteen years"*), and of the
three it is the most beautiful.

It lost because **only the four journeys carry a `duration` field.** Plotting the
projects, campaigns and events would mean inventing a duration for fourteen of
eighteen items, and *no new number* is not negotiable. A variant plotted on the
sourced *start years* survives the figures rule — 2000, 2004, 2006, 2010, 2014,
2017, 2019 are all published — but only seven items have one, so the spine would
be missing more than half its plot points and would need a printed count of who
is on it and who is not, which breaks count-independence (D-03.2). The idea is
worth keeping for `/work/journeys`, where every item does carry `duration.rank`.

### Direction B — **THE CONTACT SHEET AS THE PAGE.** Rejected on honesty.

Open with twelve to fifteen frames, one per piece of work, each captioned with
its item and its lead figure, and put the ruled index underneath. It answers
"bland" in one move and it is the only direction where the body of work is
literally *seen*.

It lost because the register's own `holes[]` say, repeatedly, that the frame is
not of the thing: *"The photograph above is one of ours and it is of
schoolchildren, but it is not of this"* (ME to WE); *"a planting site of ours,
not one of these gardens"* (Eco Action); NatureScapes' only frames of its six
destinations were bought from a stock library and are refused by flag. A sheet
that pairs a frame with an item **implies the frame is of the item**, which is
exactly the claim the honesty grammar exists to stop. It survives as one band —
`#sheet` — where each caption says what the frame is a picture of and nothing
more, and the note says so out loud.

### Direction C — **THREE WAYS TO READ ONE REGISTER.** Chosen.

Demote the four kinds to a strip, and spend the page on the axes. Two axes were
cut from an earlier five:

- **BY KIND** was cut because band 2 already *is* by kind, and a tab that
  repeats the strip above it teaches nothing. Cutting it is what made the strip
  load-bearing instead of a duty discharged.
- **BY WHICH SITUATION** was cut last, and it was the closest call. Four items
  point at the Yamuna, one at the air, one at forest loss, twelve at nothing we
  publish readings for — a genuine cross-kind fact. It lost because
  `onward.json` already exists to carry situation cross-sell on every item page,
  and because it is the one axis with a home elsewhere. If the client wants a
  fourth tab, this is it.

---

## 3. The band sequence, with the adjacency check

Nine bands and the frozen footer. **`section` carries no padding; every band
declares its tier.**

| # | id | tier | ground | hue live | subject |
|---|---|---|---|---|---|
| 1 | `#top` | **t1** | `#0D0D0B` | mustard (0) — none | masthead over a halftoned frame |
| 2 | `#kinds` | **t4** | `#151512` | mustard (4 links) | the four kinds, as a strip |
| 3 | `#counts` | **t2** | `#F3F2F0` | mustard (links) | what a number can carry — 3 tabs |
| 4 | `#sheet` | **t1** | `#151512` | **none** | eight frames, seam to seam |
| 5 | `#numbers` | **t3** | `#0D0D0B` | **none** | four readings — 4 tabs |
| 6 | `#paid` | **t2** | `#F3F2F0` | mustard (links) | who paid — 3 tabs |
| 7 | `#holes` | **t3** | `#ECEBE8` | **none** | what one fact would buy |
| 8 | `#withdrawn` | **t4** | `#151512` | **none** | the one entry closed by deletion |
| 9 | `#act` | **t3** | `#0D0D0B` | mustard (4 buttons) | four sentences, one door |
| — | `footer` | — | `#151512` | none | frozen, verbatim |

**Ground adjacency, checked mechanically on the composited colour at 375×635,
375×812 and 1440×900: zero clashes across all nine bands and the footer.**
`0D0D0B → 151512 → F3F2F0 → 151512 → 0D0D0B → F3F2F0 → ECEBE8 → 151512 →
0D0D0B → 151512`. All four grounds are used; the two darks alternate. The one
dark-to-dark step (`#sheet` `151512` → `#numbers` `0D0D0B`) is the licensed
alternate-dark move and the cut is carried by weight, not colour: a wall of
photographs giving way to a wall of numerals, which is a harder cut than any hue
change. It is the same move the homepage makes at `#impact → #farm`.

**Tier adjacency: no two adjacent bands share a tier.** t1·t4·t2·t1·t3·t2·t3·t4·t3.
This is the direct answer to *"black and white blocks getting boring."* Four
grounds are frozen and a fifth is not available, so the rhythm has to come from
**tier and treatment**, which is what §1.1 says weight is carried by. Two bands
run at t1 — zero padding, the picture to the seam — and the old page had none.

**Hue.** Three bands carry no hue at all; the frozen page gives two of fourteen
that treatment and both are deliberate. **Red and green appear nowhere on this
page.** Red is unavailable because no published limit is broken here. Green is
argued down in §6 with the arithmetic. Mustard is the only hue and only where
there is an act.

---

## 4. The composition at 1440, band by band

`.wrap` 1240 (everything with sentences) and `.wide` 1580 (indexes). `--gut` 46
at 1440. Every measurement below is measured, not intended.

### 1 · `#top` — t1, `#0D0D0B`, 595.3px

`.pic` at `clamp(268px, 44vh, 470px)` → **396.0px** at 1440×900, carrying
`yamuna-floodplain-crowd.jpg` (2000×923) at `object-fit:cover`, `.duo`, with the
frozen halftone at a **6px pitch** (`.pic::after`, 1.5px dot). The `.d1` sits
inside the frame on `.pic-over`, whose gradient belongs to the **text block**,
not the frame — so it scales to one line and leaves the lower frame untouched.
h1 at **104px** (`--t-d1` capped), 1,148.0px wide, one line.

`.pic-body` beneath, on solid `--ground`. `.wx-mast-b` is a 12-column grid: the
`.lead` on `1 / span 5`, and a group on `7 / span 6` holding the `.lbl` method
line and the `.cap` credit. **The lead does not run alone across a 1,148px
measure with 600px of nothing beside it** — that stranded right half is the
client's "too much empty space", and it is fixed by giving the right half a job.

**Nothing but the h1 is on the photograph.** Display type may sit on a
photograph; nothing else may.

### 2 · `#kinds` — t4, `#151512`, 256.0px

On `.wide`. A `.lbl` label, then `.wx-kinds`: four cells in
`repeat(4, minmax(0,1fr))`, divided by 1px `--hair` `border-right` with the last
cleared, each cell **336.0 × 137.4px**. Each cell: the kind name (Archivo
**74/800**, `clamp(1.06rem,1.5vw,1.34rem)`, uppercase) · the kind's own
`statement.line` in Newsreader 300 · the four-word definition at 13.5px in
`--fg-2`. The whole cell is the target via `a::before{inset:0}`, the frozen
register-row device.

**Why the four kinds get a strip and not a band.** They are the one thing the
front page already links by name. Giving them the *least* room on this page
rather than the most is what stops the page being a second homepage — 256px
against the old page's 1,022px for the same content.

### 3 · `#counts` — t2, `#F3F2F0`, 1,075.9px (worst panel 1,079.9)

`.im-head` (frozen: `.d1` on `1/span 6`, `.lead` on `8/span 5`, bottom-set).
Then `.wx-tabs` wrapping the frozen `.p-tabs-l` — `role="tablist"`, three
`role="tab"` buttons, a 3px `border-top` marker in `--ink` on the selected one,
**no red variant and no mustard variant**.

Each panel: a `.wx-def` definition line at 62ch, then `.wx-rows` — the frozen
register rung with its **ordinal column replaced by the figure**, because on
this page the figure *is* the ordinal. Above 900 the row is three columns:

```
clamp(104px,9.2vw,152px)   minmax(0,1.02fr)   minmax(0,1fr)
      the figure                the label          period · basis · source
```

The value column is a **fixed width so every label starts at the same x**; the
rail still shrink-wraps inside it, so the rules stay ragged — which is the
contract — while the type does not. A first build let the value column
shrink-wrap too and the four labels started at x 245, 247, 248 and 256: an
11px rag that reads as a rendering fault.

Three visible rows per group; the remainder in a frozen `<details class="dx">`.
Then a `.p-hole` note in the frozen dotted-left grammar.

### 4 · `#sheet` — t1, `#151512`, 787.1px

`.wx-sheet` runs **full bleed, outside any container**: `repeat(4,minmax(0,1fr))`
with a 2px gap, cells **358.5 × 268.9px** at `aspect-ratio:4/3`. Eight frames,
all `.duo`, **no halftone** — the dot screen is for full-bleed frames only and
turns a 358px thumbnail to mud.

The label, the honesty clause and the reading-order index sit **below** the
plate, on solid ground, the way a plate section in a book carries its index at
the foot. Arriving at a wall of photographs and *then* being told what it is, is
the intent: it is the one band on the page whose top edge is a picture rather
than a colour boundary.

### 5 · `#numbers` — t3, `#0D0D0B`, 691.0px

`.im-head` with a **capped `.d1`** (see §7). Then `.wx-tabs` + `.p-tabs-l`, four
tabs, one reading each. Each panel is `.wx-read`:

```
minmax(0,1.04fr)                      minmax(0,1fr)
the numeral set + its eyebrow          the prose, the hole, the source
```

The numeral set is a grid whose column count follows the reading: `is-one`
(50,000+) at **105.6px**, `is-pair` (100,000+ / 1,000+) at 56px, `is-quad`
(12 / 1,000 / 30+ / 3,000+) forced to `repeat(2,1fr)` so a quartet is a 2×2
block and not three-and-an-orphan. Each numeral carries the frozen rail, and the
label sits **under the rule** at `calc(var(--kiss) + 11px)`.

### 6 · `#paid` — t2, `#F3F2F0`, 969.0px

`.im-head` with a capped `.d1`. Then the pull quote (`.wx-pull q` in Newsreader
300 at `clamp(1.34rem,2.5vw,2.05rem)`, 26ch, with its `cite` free to run wider),
then three tabs. Panel 1 is `.wx-nlist`: above 900 each row is
`minmax(0,.62fr) minmax(0,1fr)` so the supporter's name takes its own column and
the works line starts at one x — the same alignment logic as the figure row.
Panels 2 and 3 are run-in prose, because a list of fourteen names is prose.

### 7 · `#holes` — t3, `#ECEBE8`, 1,064.2px

`.im-head`, the second pull quote, then `.wx-holes`: **two columns above 900**
(`1fr 1fr`, `gap: var(--gap-row) clamp(30px,3.6vw,60px)`). Seven single-column
gaps stranded the whole right half of the band and doubled its height for
nothing. Each gap is the frozen `.p-hole` — **2px dotted**, which means a
placeholder, a thing not yet known — carrying a `.lbl` category, the item name
in Archivo 78/800, the gap in one or two lines, and *what it would buy*.

### 8 · `#withdrawn` — t4, `#151512`, 204.3px

One block, `.wx-closed`, on its own ground with nothing else on it. **A solid 2px
rule, not dotted**, and the copy says why: dotted means a placeholder and this
entry is finished. Dashed is unavailable — it means a window that is shut.

This was the seventh cell of `#holes` and it does not belong there: every other
entry on that list is a gap that is still open. Giving the page's most serious
admission its own ground and nothing else on it is the strongest beat available
for it.

### 9 · `#act` — t3, `#0D0D0B`, 339.7px

A `.lbl`, a `.d2` standfirst at 22ch, then `.wx-act`: one `.b-1` and three
`.b-3` ghosts. **Exactly one `.b-1` per band** (§5.8). All four labels are the
four kinds' own `act.label` from the register and all four resolve to `/act` —
which is the honest shape of it: one door, entered for four reasons.

---

## 5. The composition at 375, and the height budget

`--gut` 20, `.wrap` content width **335.0px**, tier tokens flat at
`t2 56 / t3 44 / t4 22`. `--nav-h` 56.

| # | band | tier | 375×635 | 375×812 | worst panel | budget |
|---|---|---|---|---|---|---|
| 1 | `#top` | t1 | 573.7 | 651.5 | — | licensed (hero) |
| 2 | `#kinds` | t4 | 551.9 | 551.9 | — | ✓ −348 |
| 3 | `#counts` | t2 | 881.8 | 881.8 | **914.6** | **+14.6 on one of three panels** |
| 4 | `#sheet` | t1 | 852.9 | 852.9 | — | ✓ −47 |
| 5 | `#numbers` | t3 | 849.1 | 849.1 | 849.1 | ✓ −51 |
| 6 | `#paid` | t2 | 874.0 | 874.0 | 874.0 | ✓ −26 |
| 7 | `#holes` | t3 | 898.2 | 898.2 | — | ✓ −1.8 |
| 8 | `#withdrawn` | t4 | 265.0 | 265.0 | — | ✓ −635 |
| 9 | `#act` | t3 | 404.1 | 404.1 | — | ✓ −496 |
| | **document** | | **6,982** | **7,060** | | homepage is 10,244 at 375×812 |

**One band exceeds the budget and it exceeds it by 14.6px on one of its three
panels.** The `#counts` band is 881.8px on the panel it opens with; selecting
*A total, undated* takes it to 914.6. That is 1.6% over a target the frozen
document itself writes as "~900px", and the frozen page's own compliant bands
run to 893.5. It is stated rather than hidden, and no component was damaged to
get there. If it must come down, the cheapest 20px is the third panel's
`.p-hole`, which is the best sentence in the band.

### How the four breaches were closed, with the arithmetic

The first build breached in four bands. None of it was closed by shrinking type
— **never solve a mobile problem by making type bigger, and never by making it
smaller either; cut the frame.**

| band | was | is | how |
|---|---|---|---|
| `#numbers` | 1,689.1 (+789) | 849.1 | 2×2 wall → a **four-tab group**. A tab group is only as tall as its tallest panel. The overage was not attributable to any one cell: four subjects in a band where every other band carries one. |
| `#paid` | 1,416.3 (+516) | 874.0 | three stacked columns (744px of names alone) → a **three-tab group**, plus 175px of copy cut |
| `#holes` | 1,728.0 (+828) | 898.2 | the closed entry left for `#withdrawn` (−270); the visible count capped at three below 900 with a boundary row (−280); 200px of copy cut |
| `#counts` | 1,151.3 (+251) | 881.8 | rows capped at three per group with a disclosure for the rest; the group's **period taken off every row** (the group heading is where "no start year sourced" belongs, not on all five of its members); the three redundant group-head rows deleted, one of which printed a row count |

**What the tab groups cost, stated.** The reader can no longer compare all four
readings, or the three list lengths, at a glance. Two things pay for it: each
reading gets the full 1,240 measure instead of half of it, so `50,000+` goes
from 53px to **105.6px** at 1440; and the comparison the three columns used to
make in `#paid` is now stated in the lead, in words — *"Three lists, and the
longest names nobody"* — which the generator can compute and verify.

**One phone cut, and it is content with a better home.** `.wx-src` (the
`SOURCE-FACTS §nnn` citation on each register row) is `display:none` below 900.
The citation belongs on the item's own page; the basis word — **COUNTED** —
stays at every width, because that is the claim.

### Two rotations, and one rotation withdrawn

- The register row rotates to a single column **below 400**, not below 520. A
  first build rotated at 520 on the reasoning that a 104px value column leaves
  the label 217px. It cost 26px a row. Once the group's period came out of the
  row the label line is 18 to 26 characters and fits at 375, so the rotation was
  buying a measure the copy no longer needs. **The rail stays vertical at 375.**
- `.wx-holes` goes one column below 900; `.wx-nlist` rows stack below 900;
  `.wx-read` stacks below 900 with the numerals first, which is the reading order
  a phone wants.
- The contact sheet goes `repeat(2,1fr)` below 900: cells **186.5 × 139.9px**,
  four rows. The halftone is absent here at every width, so there is no
  marking to break.

---

## 6. The one accent moment, argued and declined

`#numbers` renders four readings and every one of them qualifies for **green**
under the widened ruling of 21 August — green is *what Swechha has done*, past
perfect, and it now covers reach as well as recovery. "50,000+ trees planted and
survived" is the purest case of it on the site.

**It is declined, and the arithmetic is the reason.** Green earns its meaning on
the homepage because it is 25 elements in **one** band out of fourteen, eight
bands away from the only red. Putting it on four readings out of four in this
band does not mark anything *in* the band — it makes the band's ground green.
And a second all-green band halves what the first one means: the reader who has
learnt that green is Swechha's own outcome now sees it on 100% of two bands and
0% of twelve, which is a background, not a signal.

`#numbers` therefore carries **no hue at all**, like `#say` and the footer on the
frozen page. The numerals are `--fg` at 18.33:1 and the rails are `--hair`. If
the client overrules this, the non-damaging form is **one** green numeral — the
survival figure, which is the only one of the four that is a recovery — and the
other three off-white; that is exactly the ticker's rule, where green belongs to
the figure and not to the slot.

---

## 7. What is borrowed, what is new, and what was fixed

### Frozen components used verbatim

`:root` tokens · the four grounds and the tier classes · `.d1 .d2 .lead .lbl
.cap .num` · **the rail contract** (`.rl` / `.rl::after` / `--kiss`) · `.im-head`
· `.p-tabs-l` (ARIA tabs) and its JS · `.dx` disclosure · `.p-hole` · `.pic`
`.pic-over` `.pic-body` and the halftone · `.duo` · `.b .b-1 .b-3 .act .lk` ·
`.state` marks (unused — nothing on this page has a feed state) · the skip link,
`main`, the nav, the SECTIONS index, the active-section underline, the footer,
the `duo`/`duo-dim` defs block from the swept `home.html`.

Nothing in the AD-20 block re-declares a token, a tier, a voice, `.im-head`, the
rail, the buttons, the tabs, `.p-hole`, the nav or the footer. **Zero unmatched
`wx-*` selectors** — checked mechanically at 1440.

### New, and only where a band needed something true of that band alone

`.wx-mast-b` (the masthead's two-up body) · `.wx-kinds` `.wx-kt` `.wx-ks`
`.wx-kd` (the strip) · `.wx-def` `.wx-rows` `.wx-fr` `.wx-fv` `.wx-fn` `.wx-fm`
`.wx-src` (the figure register) · `.wx-sheet` (the plate) · `.wx-read`
`.wx-n-set` `.wx-n-v` `.wx-n-l` `.wx-n-o` `.wx-n-p` `.wx-n-s` (the reading
panel) · `.wx-nlist` `.wx-nm` `.wx-nw` `.wx-run` `.wx-pull` (the names) ·
`.wx-holes` `.wx-hole` `.wx-hk` `.wx-hw` `.wx-hp` `.wx-hu` `.wx-more`
`.wx-closed` (the gaps) · `.wx-act` · `.wx-tabs` (the scroller wrapper).

**A long head is capped, not re-faced.** `#paid` and `#numbers` take
`clamp(2.5rem,5.4vw,4.3rem)` on their `.d1`. The rule is stated so it can be
applied: **a head that runs to four lines in its six columns at 1440 takes the
capped `.d1`.** Three lines is this page's normal and is left alone (`#counts`,
`#holes`). The precedent is `#gtm`, whose head is a `.d1` held at
`clamp(2rem,4.4vw,3.4rem)` rather than being set in a second display face
(§2.3a — a second display face for heads is closed). Uncapped, *"Numbers that do
more than one job"* is 416px of headline against a two-line lead, which is *"too
much empty space"* wearing a headline.

### Three defects found and fixed, two of them inherited

1. **The kiss gap had stopped scaling.** `--kiss` is `.06em` of the numeral's own
   font-size, applied as `margin-left` on `.rl::after`, so it resolves against
   the font-size of the element **carrying `.rl`**. A first build put the clamp
   on the child `.num` and left `.rl` at the inherited 18px body size: measured,
   the gap came out **1.08px beside a 105.6px numeral at 1440 and 1.08px beside a
   43.2px numeral at 375** — identical at both, i.e. the rail had stopped
   scaling and was touching the digits. It should be 6.34 and 2.59. Fixed by
   putting the size on the `.rl` box and letting `.num` inherit, which is what
   the frozen flat-rail figure already does. **After: every rail on the page is
   exactly 0.0600em of its own numeral, across a 5.2× scale range.**

2. **`.p-tabs-l` clips its tabs' focus rings.** *(Inherited — present on
   `#reach` in the current generated page too.)* It ships as
   `margin:-5px -5px 0` / `padding:5px 5px 0`. **The pair has no bottom half**,
   and `overflow-x:auto` forces `overflow-y:auto`, so a scroll container exists
   and **5.00px of every tab's focus ring is discarded** at the scrollport's
   bottom edge — measured on all ten tab buttons at all twelve widths. The cure
   is the frozen one (§6.2): padding inside the scroll box cancelled by an equal
   negative margin, so the margin box and every child's position are unchanged.
   The 1px rule has to move to a **wrapper** (`.wx-tabs`), because a border drawn
   on the scroll box itself travels with the padding — which is presumably why
   the shipped component left the bottom half out. **After: ring overhang 0.00 on
   all four sides, at rest and after scrolling, at every width. Document height
   unchanged.**

3. **No edge mask on three new horizontal scrollers.** §6.6 requires a licensed
   scroller to show a hard 8px ground-coloured fade at its right edge. At 375 the
   `#counts` tab row read *"A TOTAL, UNDATE"* with no affordance. Added on
   `.wx-tabs::after`, band-coloured, `pointer-events:none` — **plus a real 10px
   trailing flex item inside the scroller**, because a flex container's trailing
   padding is not honoured as scrollable overflow. At 8px the last tab still
   ended **0.30px inside the mask** at full scroll-right; at 10 it clears by
   +2.39 / +2.28 / +1.70px at 320 and 375.

### One inherited item flagged, not touched

`.dx-s::before` draws its disclosure marker as a rotated bordered square — a
chevron. The component's own comment reads *"THE DISCLOSURE MARKER IS THE ARROW,
NOT A CHEVRON, AND §7.4 IS EXPLICIT."* The comment and the CSS disagree. It is
the other agent's component and they hold a written position on it, so this page
uses it as shipped and raises the discrepancy rather than resolving it.

---

## 8. The photographs — nine frames, and which file

The pre-freeze prototypes ran 9–15 images a page; the WORK pages ran 2–3, and
that is a large part of "bland". This page runs **nine**, and every one of them
is a Swechha original from `content/photo-library.json` with `stock` unset.

| where | file | native | treatment |
|---|---|---|---|
| `#top` masthead, full bleed | `/images/photos/yamuna-floodplain-crowd.jpg` | 2000×923 | `.duo` + halftone, 6px pitch ≥701 / 4px ≤700 |
| `#sheet` 1 | `/images/photos/school-children-group.jpg` | 1499×2000 | `.duo` |
| `#sheet` 2 | `/images/photos/children-hats-red-jackets.jpg` | 2000×2000 | `.duo` |
| `#sheet` 3 | `/images/photos/farm-building-yellow-trees.jpg` | 2000×1500 | `.duo` |
| `#sheet` 4 | `/images/photos/cityscapes-landfill-walk.jpg` | 663×780 | `.duo` |
| `#sheet` 5 | `/images/photos/gram-anubhav-shramdaan.jpg` | 1785×1750 | `.duo` |
| `#sheet` 6 | `/images/photos/yamuna-source-rapids.jpg` | 2000×1500 | `.duo` |
| `#sheet` 7 | `/images/photos/yamuna-barrage-crowd.jpg` | 2000×1500 | `.duo` |
| `#sheet` 8 | `/images/photos/clean-air-protest.jpg` | 2400×1600 | `.duo` |

**Every frame in the sheet is non-baked, and that is a selection rule, not an
accident.** A baked frame carries its selective colour inside the file and must
take no ramp; one of those in a grid of eight would render in colour beside seven
monochromes. So `river-valley-hillside-climb.jpg` (Yamuna Yatra's own declared
frame) and `farm-thatch-amaltas.jpg` (Farm School's) are **not** in the sheet
even though the register assigns them; `yamuna-source-rapids.jpg` and
`farm-building-yellow-trees.jpg` stand in their place, and the caption names what
they show rather than which programme they belong to. A future all-baked band
could carry the baked frames properly.

**The masthead is `.duo`, not `.duo-dim`.** `.duo-dim` is for a frame where type
sits on an *unveiled* area; here the h1 sits on `.pic-over`'s scrim, so the scrim
is doing the contrast work and the darker ramp only buries the crowd. A first
build used `.duo-dim` and the frame read as a black rectangle with figures in it.

**No caption claims a frame is *of* a programme.** The alt text is the library's
own, the note says *"Each frame says what it is a picture of, and nothing more
than that. Where a piece of work has no photograph of its own, none is implied
here — the item's page says so instead"*, and the reading-order index names
subjects, not items: *a Delhi school group · a planting site of ours · the farm ·
the landfill walk · a shramdaan day on Gram Anubhav · the Yamuna at its source ·
the same river inside the city · hand-lettered placards on the air.*

---

## 9. What makes it interrogable rather than merely listed

The measurable gap the brief names: `situation-air.html` carries five ARIA tab
groups; the WORK pages carried zero. **This page carries three, with ten
panels**, and each one re-sorts the *same* material rather than paging through
different material — which is the difference between interrogation and a
carousel.

- **Three tablists, ten tabpanels.** Canonical ARIA with a roving tabindex, the
  frozen keyboard model (Arrow / Home / End), and panels hidden with the
  `hidden` attribute — because these are alternative *views* of one object, where
  one at a time is the point and the height saving is why the bands fit at all.
- **The axes are the content.** `A rate` / `A total, dated` / `A total, undated`
  is not a filter; it is a claim about what each figure can be used for, and
  clicking between them is how the reader discovers that the largest group
  cannot be divided.
- **The register argues with itself in public.** Two `60+` figures for two
  different programmes sit adjacent in the same panel, each carrying its own
  name, with a note saying they look like a copy-paste and are not. That
  comparison exists nowhere else on the site.
- **Every row is a link to its item page.** Twenty-two numerals, each one a way
  in.
- **Four disclosures** (`<details>`) hold the remainder of each group, so
  "everything in one view" is complete without a 1,700px band.
- **No auto-advance anywhere.** Ruled *no*, not "not yet". No reveal system, no
  `IntersectionObserver` animation, **zero `@keyframes` in the AD-20 block.**

---

## 10. The measurements

| check | result |
|---|---|
| `document.scrollWidth === innerWidth` at 320, 375, 390, 414, 560, 768, 901, 1024, 1280, 1440, 1920 (12 viewports) | **all pass**; `body.scrollWidth ≤ innerWidth` at all twelve |
| Contrast, every element with its own text, against its **composited** background, 4.5:1 / 3:1 | **1,814 nodes, zero failures, zero within 0.6 of the threshold** |
| Ground adjacency on composited colour, 375×635 / 375×812 / 1440×900 | **zero clashes**, nine bands + footer |
| Tier adjacency | **zero adjacent pairs share a tier** |
| Touch targets under **24px** | **zero, at every width** |
| Touch targets under 44px in this page's own bands | **zero, at every width.** The 20 sub-44 controls at ≥1024 are all in the frozen shared chrome (nav links 31.2, wordmark 30.0, GIVE 37.2, footer links 27.9) and are the frozen page's own known items (§9.1) |
| Focus ring overhang inside scroll containers | **0.00 on all four sides**, at rest and after scrolling, at every width. Before the `.wx-tabs` fix: 5.00px bottom on all ten tab buttons |
| Console — errors, warnings, exceptions, failed requests | **zero entries** at 320×635, 375×812 and 1440×900, with every tab clicked, the SECTIONS panel opened and closed, and every disclosure opened |
| Anchor landing, cold load with the hash **and** same-page click, nine ids | worst \|offset from `--nav-h`\| **0.39px at 375×812, 0.48px at 375×635** |
| Anchor landing at 1440×900 | eight of nine within ±0.5px. `#act` lands 80.22px short, and it is **scroll exhaustion, not an offset bug**: `#act` top is 5,705.8, document 6,462, viewport 900, so `maxScrollY` is 5,562 and `5,705.8 − 5,562 = 143.8`, minus `--nav-h` 63 = **80.8**. The page cannot scroll further because `#act` (339.7) plus the footer (417.0) is 756.7 < 900. Same on the frozen homepage for its last anchor |
| Rail geometry | every `.rl` on the page draws its kiss at **exactly 0.0600em** of its own numeral: 1.21px at fs 20.2, 1.73px at 28.8, 2.59px at 43.2, 6.34px at 105.6 |
| Scroller edge masks | 8px hard, band-coloured, on three tab rows; last tab clears the mask by **+2.39 / +2.28 / +1.70px** at 320 and 375 |
| Unmatched `wx-*` selectors | **zero** |
| `<svg>` in the page body, icon sets, borrowed logos | **zero** |
| `--red`, `--green`, `sig-*`, `.duo-dim`, `mix-blend-mode`, `@keyframes`, `.rise` in the AD-20 block | **zero of each** |
| Tensed or dated words in static markup (`today`, `now`, `currently`, `this year`, `as of`, `latest`, `recent`) | **zero** |
| Numerals rendered | **22**, every one traceable to `data/work/**` — see §11 |
| Photographs | **9** |
| Document height | 6,982 at 375×635 · **7,060 at 375×812** · 6,462 at 1440×900 |

### Count-independence — proved by accident, mid-build

While this page was being designed, **five campaigns were added to
`data/work/campaigns/`** (`this-girl-can`, `no-plastic`, `sustainable-shopping`,
`park-restoration`, `no-more-waste-hills`) — an 18 → 23 membership change, live,
under the file. **Not one line of this design needed changing.** The strip is
four kinds at any membership; the figure groups take whatever figures exist; the
five new campaigns publish no figures and name no funders, so under the
generator they land in *Nobody named*, where the only effect is that the list the
lead already calls the longest gets longer, and the lead stays true.

No integer describing the register's membership is printed anywhere on the page.
The three deleted candidates are on the record: a group head reading *"Per year ·
four figures below"*, a column tally, and *"ten of eighteen name nobody"*.

---

## 11. Every numeral on the page, and where it comes from

| value | label | period | source |
|---|---|---|---|
| 100–150 | Schools in Delhi | every year | SOURCE-FACTS §215 |
| ~5,000 | Trees planted in Delhi NCR | each year | SOURCE-FACTS §95 |
| 10,000 | Volunteers | annually, since 2010 | SOURCE-FACTS §84 |
| 10 | Fellowships | each year | owner, 21 August 2026 |
| 3,000+ | Youth leaders down the whole river | since 2004 | SOURCE-FACTS §187 |
| 30+ | Yatras run | since 2004 | SOURCE-FACTS §187 |
| 300+ | Youth groups in the CYON network | since 2010 | SOURCE-FACTS §86 |
| 400+ | Young people through job-exposure camps | since 2019 | SOURCE-FACTS §83 |
| 50+ | Adolescent girls through the year-long journey | since 2017 | SOURCE-FACTS §177 |
| 9 | Editions, one every June | 2006–2014 | owner, 21 August 2026 |
| 57 | Girls recognised by the ELC Bright Promise Award | in 2018 | SOURCE-FACTS §178 |
| 50,000+ | Trees planted **and survived** | no start year sourced | SOURCE-FACTS §95 |
| 70+ | Butterfly parks across Delhi NCR | no start year sourced | SOURCE-FACTS §73 |
| 20+ | Herb gardens across Delhi NCR | no start year sourced | SOURCE-FACTS §74 |
| 60+ | Journeys organised (Gram Anubhav) | no start year sourced | SOURCE-FACTS §193 |
| 60+ | Journeys organised (NatureScapes) | no start year sourced | SOURCE-FACTS §190 |
| 100+ | Grassroots partners in the villages themselves | no start year sourced | SOURCE-FACTS §51 |
| 5,000 kg | Dead leaves composted into soil on site | no start year sourced | SOURCE-FACTS §70 |
| 500 kg | Honey from the apiary | no start year sourced | SOURCE-FACTS §71 |
| 12 · 1,000 | Days · kilometres, Yamunotri to Agra | since 2004 | the journey's own `duration` and `geography` |
| 100,000+ · 1,000+ | People on them · walks run | in two decades | SOURCE-FACTS §168 |
| 5% → 90% | Green cover, in **one** Vasant Kunj park | over a decade | SOURCE-FACTS §76 |

**No figure is invented, and no figure is derived by arithmetic.** CityScapes'
100,000+ and 1,000+ sit **beside each other, undivided** — a numerator with its
denominator, and the page says why it does not divide them: both are published as
"over", and dividing two floors gives a floor of nothing. The register's own copy
says the count was built *"two dozen people at a time"*, which 100,000 ÷ 1,000 =
100 would contradict.

**Every scope is named on the tile, not only in the note.** *"Green cover, in one
Vasant Kunj park, over a decade"* — the eyebrow carries it, so the figure cannot
read as city-wide. **"Audited" appears nowhere.** The basis word on every row is
**COUNTED**, and the one universal claim the page makes about the whole register
is that nothing on it is modelled.

---

## 12. The copy, in final words

### 1 · `#top`

> # THE WHOLE OF IT
>
> Everything Swechha runs, on one page. Four kinds of work is one way to sort it,
> and it is the way the front page already sorts it. The three ways below are the
> ones you cannot get anywhere else.
>
> **EVERY FIGURE COUNTED, NEVER MODELLED · EVERY PERIOD ON THE NUMERAL · EVERY
> GAP NAMED**
>
> *Above: a crowd on the Yamuna floodplain looking out over the river. Swechha
> archive.*

The `.lbl` line states the **method**, not the category — the level between the
h1 and a readout does not exist and the gap gets filled at the bottom of the
scale (§2.3b).

### 2 · `#kinds`

> **THE FOUR KINDS · EACH ONE HAS ITS OWN PAGE**
>
> **PROJECTS** — *Fifteen years is not a pilot.* — A project runs for years, and
> the honest measure of it is what was still standing after the funding ended.
>
> **CAMPAIGNS** — *Nobody hands a river back.* — A campaign pushes. It picks one
> thing and refuses to be finished with it.
>
> **JOURNEYS** — *You cannot brief someone into caring.* — A journey goes. You
> leave the city, and the place makes the argument instead of us.
>
> **EVENTS** — *It happened, or it did not.* — An event invites. It happens in
> public, and then it is over.

The four italic lines are each kind's own `statement.line` from `kinds.json`,
verbatim. **They are on no other page**, and they are the X-is-not-Y grammar in
the house voice. The four-word definitions are the `frame_line`'s opening verb —
*"A campaign pushes. An event invites."* The old page carried each kind's `line`
field, which is the string the front page already prints; that is the duplication
that killed it, and it is gone.

### 3 · `#counts`

> ## WHAT A NUMBER CAN CARRY
>
> Counted, never modelled, so every rule is identical. What differs is what each
> figure can *carry*.

> **A RATE** · A period of one year. Still true without anybody checking.
>
> *Influence's figures are dated to the year it started. We cannot say which are
> still true.*

> **A TOTAL, DATED** · A total with a start year. Divide it yourself.
>
> *Yamunotsav is the only closed span here. It stopped in 2014 and nobody has
> told us why.*

> **A TOTAL, UNDATED** · A total with no start year we can cite, so it cannot
> become a rate.
>
> *Two 60+ figures, two programmes. Both true, neither divisible, and side by
> side they read like a copy-paste — hence the names.*

### 4 · `#sheet`

> **FRAMES FROM THE REGISTER**
>
> Each frame says what it is a picture of, and nothing more than that. Where a
> piece of work has no photograph of its own, none is implied here — the item's
> page says so instead.
>
> **IN READING ORDER** A Delhi school group · a planting site of ours · the farm
> · the landfill walk · a shramdaan day on Gram Anubhav · the Yamuna at its
> source · the same river inside the city · hand-lettered placards on the air.
> Swechha archive throughout.

### 5 · `#numbers`

> ## NUMBERS THAT DO MORE THAN ONE JOB
>
> Each of these is measured more than one way, or has its own denominator openly
> missing.

> **MONSOON WOODING · DELHI NCR · ABOUT 5,000 A YEAR**
> **50,000+** — TREES PLANTED AND SURVIVED
>
> *Planted and survived* is the verb, and it is the whole campaign. Anybody can
> plant. A sapling in Delhi has a fence, a summer and a road crew to survive:
> planting day is the photograph, and the two years after it are the campaign.
>
> ⋮ A survival rate exists — we go back and count what is still standing against
> what went into the ground. The planted total is not written down anywhere we
> can cite, so this page publishes the method instead of the percentage.

> **YAMUNA YATRA · YAMUNOTRI TO AGRA · SINCE 2004**
> **12** DAYS · **1,000** KILOMETRES · **30+** YATRAS · **3,000+** WALKERS
>
> One journey, measured four ways, and every one of the four is on the record.
> The same twelve days, the same direction, a different set of young people each
> time — one river, described by three thousand people who have seen all of it.

> **CITYSCAPES · INSIDE DELHI · IN TWO DECADES**
> **100,000+** PEOPLE ON THEM · **1,000+** WALKS RUN
>
> A numerator with its own denominator beside it, undivided, because both are
> published as "over" and dividing two floors gives a floor of nothing. Two to
> four hours at a time, at the six places the city would rather you did not look
> at. The largest count on this register, and it was built two dozen people at a
> time.

> **ECO ACTION · IN ONE VASANT KUNJ PARK · OVER A DECADE**
> **5% → 90%** — GREEN COVER
>
> One park. It is not a city figure and it is not an organisation figure, and we
> will not set it as either. Ten years is the honest unit for this kind of work,
> and ten years is why almost nobody does it.
>
> ⋮ We do not name which park, or say when its decade started. A name would make
> it visitable and a start year would make the decade checkable.

### 6 · `#paid`

> ## WHO PAID
>
> Fifteen years of a school programme is fifteen years of somebody paying for the
> unglamorous middle. Three lists, and the longest names nobody.
>
> ### Long money is rarer than large money.
> **ME TO WE, ON EMPOWER · SINCE 2014**

> **NAMED MORE THAN ONCE** · The same name on more than one kind of work —
> visible on no other page.
>
> **ADOBE** Bridge the Gap · Eco Action · Monsoon Wooding — a curriculum, a
> garden and a planting season
> **EMPOWER** ME to WE · She Leads Change — the same settlement, the same age
> group, since 2014
> **AMERICAN EXPRESS** Bridge the Gap · Eco Action
> **AMAZON** Eco Action · Monsoon Wooding
> **THE AMERICAN EMBASSY** Eco Action · Yamuna Yatra

> **NAMED ONCE** · Named on one piece of work, as funder, partner or the school
> that brought the cohort.

> **NOBODY NAMED** · Work that names no funder, no partner and no school. It is
> the longest of the three lists.
>
> ⋮ Gram Anubhav runs with over a hundred grassroots hosts in the villages
> themselves and names none of them. Every event on this register names nobody at
> all. Both are written down as holes on the item pages rather than left here to
> be noticed.

### 7 · `#holes`

> ## WHAT ONE FACT WOULD BUY
>
> Every gap is already on the item's own page. Collected, they read less like a
> defect list than a shopping list.
>
> ### Every other project on this register counts its participants. This one
> ### counts its compost.
> **FARM SCHOOL, ON ITSELF**

> **ONE NUMBER · MONSOON WOODING** — We count survivors against what was
> planted, so a rate exists. The planted total is not written down.
> **BUYS** A survival rate, instead of a method.
>
> **ONE YEAR, TWICE · GRAM ANUBHAV AND NATURESCAPES** — Over sixty journeys
> each, and no start year published for either. A total that cannot become a
> rate.
> **BUYS** Two divisible figures, and two identical numerals that stop reading as
> one.
>
> **ONE FOLDER · YAMUNOTSAV** — Nine editions, not one photograph. The frames sit
> in a Drive folder that will not open for us.
> **BUYS** Nine Junes of a river festival — the best unshown material we have.
>
> **FIVE NAMES · GRAM ANUBHAV** — More than a hundred grassroots organisations
> host these journeys in their own communities. Not one of them is named.
> **BUYS** Collaborators instead of a count. Their programme as much as ours.
>
> **ONE COUNT · FARM SCHOOL** — We cannot tell you how many people have been
> through the farm. Every other project on this register counts its participants.
> **BUYS** One participation figure with a period. A page about people, not
> inputs.
>
> **ONE LINE · SHE LEADS CHANGE** — We hold the 2018 ELC Bright Promise Award and
> the number of girls in it. We do not hold the citation.
> **BUYS** What the award was for — the only part of an award that means
> anything.
>
> *More gaps, and each one is on the item's own page.*

The last line is the boundary row and it **reveals itself by its own child
position** — three gaps show below 900 and the row is child four or later exactly
when a fourth gap exists. An arrow pointing at nothing is a real bug that a
membership proof caught once already on this project.

### 8 · `#withdrawn`

> **CLOSED BY DELETION**
> ## FOUR FIGURES WE WITHDREW
>
> Twenty-five thousand children, eighty-five schools, twelve hundred mentors,
> twelve cities. Not one could be traced to any record we hold, and every one was
> captioned as verified by us.
>
> **BUYS** Nothing. This entry takes a solid rule rather than a dotted one
> because it is the only one on the page that is finished. It is written here so
> that nobody puts them back.

### 9 · `#act`

> **FOUR WAYS IN**
> ### Four sentences, one door.
>
> **[ BRING YOUR SCHOOL ]** · [ PLANT WITH US ] · [ BOOK A JOURNEY ] ·
> [ VOLUNTEER WITH US ]

---

## 13. Open, and what I would change with another day

1. **`#counts` is 14.6px over the phone budget on one of three panels.** Stated,
   not hidden. The cheapest 20px is the third panel's `.p-hole`, and it is the
   best sentence in the band, so I have left it.
2. **The fourth axis, BY WHICH SITUATION, is designed and not built.** Four items
   point at the Yamuna — a campaign, a journey and two festivals — one at the
   air, one at forest loss. It is the sharpest cross-kind fact on the register
   and it is the one I would add first if the band budget could take it. It needs
   a canonical situation route: the only destinations that resolve today are
   `public/design/v3/situation-*.html`, which the link contract forbids.
3. **The two baked frames the register actually assigns are not in the sheet.**
   `river-valley-hillside-climb.jpg` is Yamuna Yatra's own declared photograph
   and `farm-thatch-amaltas.jpg` is Farm School's, and both are excluded because
   a baked frame cannot share a grid with seven `.duo` ones. **With another day I
   would give the sheet a second row of baked frames under its own label** —
   *"These four carry their colour in the file"* — which would take the page from
   nine photographs to twelve or thirteen and put the register's own assigned
   frames on the register's own page. That is the single biggest improvement
   still available.
4. **`.dx-s`'s marker is a chevron and its own comment says it is not.** Flagged,
   not touched.
5. **The `#paid` lead states a comparison the layout used to show.** *"The
   longest names nobody"* has to be computed by the generator, not typed, or it
   goes stale. Named in the band's comment. The three-column version showed it
   without a sentence and cost 542px at 375; if the budget ever opens, the
   columns are the better design.
6. **`--ink-3` at 11.5px.** Every `.lbl` in a paper band uses it, which is the
   frozen page's own pattern (`.paper .lbl{color:var(--ink-3)}` against
   `--t-micro`), and it clears AA at 6.01:1 — but §1.2 writes a 13.5px floor for
   the token. The floor plainly means *caption* use. Worth one line in BRANDING
   to say so, because the next page will ask.
7. **A concurrent agent is redesigning this same page.** Their current version is
   `#top` / `#everything` / `#reach` / `#onward`, with the figures tabbed **by
   kind**. That axis is the same one the strip and the front page already use, so
   the two proposals are genuinely different and not two drafts of one thing;
   the parts of theirs I would keep are the item-level register in `#everything`
   and the per-kind galleries they added to `kinds.json` while I was building.
