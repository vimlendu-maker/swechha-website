# AD-03 — Band 03, THE STATEMENT

Band-level review of `<section class="s-statement t1" id="statement">`.

**Measured against `public/design/v3/home.html` at sha1
`77e5079925bd2822f01931738d50558bc093c049`.** The file moved twice under me
while the ticker was being built in it; it is `7079e79c…` as I write. I diffed
the bands 03–05 block across both revisions: **identical apart from one blank
line**, so every number below still stands against the current file.

Captures: `docs/design/img/sections/ad3-*.png`. All taken with CDP
`Emulation.setDeviceMetricsOverride` at 375×635, 375×812, 414×736, 768×1024,
1024×800, 1440×720, 1440×900 and 1920×1080. Every finding below was read off a
PNG, not off source.

**This band is now also the subject of a larger structural question** the client
opened mid-review — whether 03/04/05 should become a WHAT WE DO band. That is
answered separately in `2026-08-20-AD-03-what-we-do.md`, with four built
variants. **Read that first if the structure is still open**, because two of its
options change what this band is. Everything below is true of the band as it
stands and stays true in options B and C.

---

## 0. Corrections to the brief

**Three of the brief's premises are already out of date. The band has moved on.**

1. **"Split it out of `#journeys`" — DONE.** The statement is its own
   `<section class="s-statement t1" id="statement">` and `#journeys` is a
   separate paper band. The salvage file's entire statement audit is addressed
   to `#journeys, home.html:768; CSS at home.html:167–191, 632` — a file layout
   that no longer exists. Nothing in it can be applied by line number.

2. **"`.duo-dim` is defined in the file and used zero times" — STALE, and
   pleasingly so.** This band is already the first and only user of it, as a
   second copy of the frame on `duo-dim`, mask-faded on a diagonal so the
   bounded ramp exists only where the type lands. **And it holds.** I rendered
   it, hid the headline, and sampled the ground it sits on at eight viewports.
   Worst single background pixel anywhere under the sentence, at any viewport:
   **4.75:1** (1440×720, first line). Against a 3:1 requirement for display type.
   The CSS comment claims "~#6E6659, 4.9:1"; measured it is 4.75–9.26 depending
   on viewport, so the comment is honest to within 0.15. The `text-shadow`
   contributes **nothing** — I measured with and without and the numbers are
   identical to four decimal places, because the shadow falls under the glyphs,
   not around them. The ramp is carrying it, exactly as the comment claims.
   **This is the first honest photograph-under-type on the page, and the farm
   band should be rebuilt on it rather than on `.pic-over`'s slab.**

3. **"The two approved paragraphs move down into journeys" — DONE.** Both are in
   `.s-journeys-tail`, moved verbatim, and *"You cannot argue someone into caring
   about a river"* has been lifted out of the body and set as that band's
   headline. No word was rewritten. Nothing is owed here.

4. **The brief's heights are right.** 702px at 1440×900 and 503.44px at 375
   confirmed. Adding the rest: 561.59 (1440×720), 720 (1920×1080), 720
   (768×1024), 624 (1024×800), 456.31 (414×736), 420 (375×635).

### The 2026-08-19 salvage audit — seven statement defects, adjudicated

| # | salvage claim | verdict |
|---|---|---|
| 1 | Scrim covers the whole photograph; spills 8px past the frame past 1367px | **DEAD.** There is no `.pic-over` in this band and `.pic` is not used. The seat gradient is 32% of the frame *by construction* and cannot outlive it. Checked at 1440×720, where the old bug was worst: no overflow, 561.59px band, seat 179.7px. |
| 2 | The scrim erases the foam and blacks out the right two-thirds | **DEAD as stated** — the mask now opens *toward* the upper right, and the crowd is the most legible thing in the frame there. **But its diagnosis has re-emerged in a new mechanism** — see D1. Note also that its own prescribed fix, a second `95deg` horizontal gradient, is now **forbidden**: it would add a fourth veil to a band that carries its contrast in the ramp, which is the thing that finally works. Its *other* prescription — "switch this one image to `.duo-dim`" — has been done. |
| 3 | No `scroll-margin-top`; landing from the nav hides the statement | **OVERTAKEN.** The six links that pointed at `#journeys` now land on the journeys band. Nothing links to `#statement`. `scroll-margin-top` is still `0px` on every section (measured) — a live page-wide defect for other bands, and not one to log here under P-1. |
| 4 | The two copy columns align to nothing; 16px near-miss | **DEAD.** There are no copy columns in this band. |
| 5 | Drawn at 2.25× native and then halftoned, so the students are mush | **LIVE — and understated by half.** See D2. |
| 6 | On the phone the lead stops leading | **DEAD.** No body copy at any width. |
| 7 | Head columns box-top-aligned, not baseline-aligned | **DEAD.** One element in the band. |

**Four dead, two overtaken, one live.** One of its prescribed fixes is now
forbidden and one has already been applied.

### One phantom I nearly filed, recorded so nobody re-files it

At 768×1024, sampling the ground under the second line returned a **pure white
pixel and a 0.94:1 contrast** — a catastrophic-looking failure. It is a capture
artifact: `Page.captureScreenshot` with a `clip` and `captureBeyondViewport`
re-renders the page and paints the **sticky header** into the middle of the
clip. The white pixel was the SWECHHA wordmark; the mustard either side of it
was the GIVE button. Viewport-only captures show the band clean and the same
line at **8.66:1**. If you see a sticky element in the middle of a band capture,
that is what happened. Second capture-method trap in two days.

---

## 1. What the band is doing right — protect these

- **The ramp, and only the ramp, carries the type.** Two plates of the same
  frame — `duo` open, `duo-dim` masked to a wide soft diagonal — so the dark
  exists only where the sentence is and the photograph is completely untouched
  everywhere else. No box, no slab, no gradient rectangle. Measured 4.75:1 at
  its worst and 9.26:1 at its best. This is the pattern; do not let anyone
  "simplify" it back to a scrim.
- **The mobile version is better than the desktop one and knows why.** The mask
  goes vertical below 700 (a diagonal reads as a corner wash at a 0.75 aspect),
  the halftone pitch halves to 4px so dot rows stay 105–126 across the frame at
  every viewport, and the sentence lands in the lower third exactly as specced.
  The comments in the CSS explain both. Leave them.
- **"Not twins" holds, measured.** Hero 825 : statement 702 at 1440×900 (0.85×);
  716.9 : 503.4 at 375×812 (0.70×). The band is legibly shorter than the hero at
  every viewport.
- **The spine.** Statement headline left edge = **146px at 1440**, identical to
  the hero's and the journeys eyebrow's; only the ticker steps out to 46 as
  chrome. Verified at 1024 (34.81) and 768 (26.11) too. Three bands, one left
  edge. Do not let a fix introduce a second one.
- **Adjacency is mechanically clean.** ticker `rgb(21,21,18)` → statement
  `rgb(13,13,11)` → journeys `rgb(243,242,240)`. No signal hue anywhere in the
  band. T1 padding, photograph to both seams.

---

## 2. Defects, most damaging first

### D1 — The crop is governed by the browser window's height, not by the picture · **both** · `ad3-1440x720.png` vs `ad3-1440x900.png` vs `ad3-375x812.png`

`.s-statement-frame{--crop:18%}` with
`.s-statement-plate img{top:calc(-1*var(--crop));height:calc(100% + var(--crop));object-fit:cover}`,
against `.s-statement{height:clamp(560px,78vh,720px)}`. (Lines 1394/1398/1400–1401
at the measured revision; the ticker build has since pushed them to 1441/1446/1448.
**Grep the selector, not the line number — this file is moving hourly.**) The plate is taller than its frame by a fixed percentage, so
as the window gets taller `cover` buys that height by throwing away width.

Measured proportion of the source photograph actually visible:

| viewport | band height | **visible source width** | visible source rows |
|---|---|---|---|
| 1440×720 | 561.59 | **100%** | 91–590 |
| 1920×1080 | 720 | **100%** | 99–579 |
| 1440×900 | 702 | **80.3%** | 90–591 |
| 1024×800 | 624 | **64.2%** | 90–591 |
| 768×1024 | 720 | **41.7%** | 90–591 |
| 414×736 | 456.31 | **31.7%** | 143–591 |
| 375×812 | 503.44 | **26.1%** | 143–591 |

Same file, seven different photographs. Drag a 1440 window from 720 to 900 tall
and the picture zooms 25%. That is not a crop, it is an accident.

**What it costs.** The source frame (`public/images/photos/yamuna-students-foam-line.jpg`)
contains one detail worth the whole band: a **buffalo standing in the foam at
the water's edge, drinking**, at source x ≈ 1050–1150. It survives at 1440×720
and 1920. It is half-gone at 1440×900. It is **cropped out entirely at 1024 and
every width below it** — which is to say, gone on every phone and tablet. At 375
the reader sees twelve of the forty students and almost none of the foam field:
`ad3-375x812.png` shows foam only as a pale streak along the top edge. The
band's stated hook is *"a halftoned crowd on the foam line"*; below 1024 there
is no foam line in the frame, only foam-coloured texture at the top edge, and
the sentence *"A number is not a smell"* loses the thing it refers to.

**Fix.** Stop letting `cover` choose the framing. Make the plate exactly its
frame — `inset:0; width:100%; height:100%; object-fit:cover` — and move the
crop to `object-position`, set once per breakpoint (three values, ≥1024 / 768 /
≤700). The framing then becomes an editorial decision taken three times, instead
of an emergent property of the reader's window. Pick each value so the buffalo
and at least one foam edge are inside the frame.

### D2 — The photograph is painted at up to 3.37× its native resolution · **both** · `ad3-zoom-1440-buffalo.png`, `ad3-zoom-1440-faces.png`

`yamuna-students-foam-line.jpg` is **1280 × 591**. Measured device-pixel upscale
across the visible region:

| 1440×720 | 1440×900 | 1920×1080 | 1024×800 | 768×1024 | 414×736 | **375×812** |
|---|---|---|---|---|---|---|
| 2.25× | 2.80× | 3.00× | 2.49× | 2.88× | 3.06× | **3.37×** |

The salvage file called this at 2.25× and it is now half again worse, because
D1's crop magnifies as well as trims. In `ad3-zoom-1440-buffalo.png` the animal
is an undifferentiated dark mass; in `ad3-zoom-1440-faces.png` the crowd behind
the sentence has no limb separation at all. This is the page's second of three
halftone heroes and its only full-bleed photograph of people.

**Fix.** Re-export from the archive master at **≥3,200px wide** (3,840 to cover
1920 at 2×). If no larger master exists, this frame cannot honestly carry a
full-bleed hero above 1280 CSS px and either the frame changes or the band
stops being full-bleed — which is a real decision, not a tuning problem, so it
is Q1 below.

### D3 — The band names no source, no place, no date and no person · **both** · every capture

The through-line is unambiguous: *"Every section is a record with its source
attached… where the record is missing the page leaves the hole showing."* Every
other band obeys it — the ticker names its monitors and hours, the archive sheet
hatches the years nobody has scanned, the farm band carries *"We for Change
Foundation. Khirki Extension"*. This band is a full-bleed photograph of
identifiable Delhi students at an identifiable place on the Yamuna, and the page
credits nobody, dates nothing and names no location. It is the one band on the
page that asserts without evidence, and it is the band whose entire argument is
that assertions need evidence.

**Ruling, mine, per the brief.** The spec's *"absolutely nothing else in the
frame"* stands — nothing goes **inside** the photograph. But the frame is not
the band. A single micro-caps provenance line in `--fg-3` on the band's bottom
seam, below the sentence and outside the picture, costs ~18px and settles it.
In options B and D of the structural review the index strip already provides
that line's home at **zero** additional height.

### D4 — The hinge is the quieter of two adjacent headlines, and worst on the phone · **both, worst mobile** · `ad3-375x635.png`

At 375 the statement headline is two lines of 43.2px occupying **200.2px and
203.5px** of a 335px measure. The journeys headline immediately below it is the
*same* 43.2px but wraps to four lines at full measure. In `ad3-375x635.png` the
band that the art direction calls *"the hinge of the whole page"* is followed,
across one hard seam, by a T2 supporting band whose headline carries roughly
2.4× the ink area. The eye reads the second one as the more important of the two.

At 1440 the same relationship is milder but present: 104px over two lines of
481.9/490px ink, against a four-line 65.6px headline running the full six-column
measure.

**Fix.** Not by enlarging the sentence — `mobileDoctrine` forbids solving a
mobile problem with type size, and 43.2px is the correct `d1` floor. The fix is
to stop the two competing: either the journeys headline drops a size step at
≤560 (it is already a size-only modifier, `.s-journeys-h`), or — better — the
structural options in `AD-03-what-we-do.md` remove the collision entirely by
making what follows the sentence an index rather than a second display headline.
**Options B and D fix this for free; A fixes it partly; C leaves it.**

### D5 — The dim plate rasterises the whole frame to serve a quarter of it · **both, mobile matters most** · selector `.s-statement-dim`

`.s-statement-dim` is a full-size absolutely positioned copy of the frame,
SVG-filtered and then mask-faded. At 1920×1080 each plate composites to roughly
3,840 × 1,773 device pixels — on the order of 27 MB of raster apiece, ~54 MB for
the pair, plus the mask layer, for one band. The mask reaches full transparency
by 84% of a diagonal, so most of that second raster is thrown away.

I am not filing this as a rendering bug because I did not observe jank, and the
two-plate technique is *why* the ramp works. But it is free to fix: constrain
`.s-statement-dim` to the lower-left region the mask actually keeps (roughly 62%
× 62% of the frame, with the gradient ending inside that box) and the second
raster drops by about 70% with no visible change. Worth doing before this
pattern is copied to the farm band.

### D6 — `max-width:13ch` on the headline is inert · **desktop** · selector `.s-statement-h`

The line break is a hard `<br>`. At ≥701px, 13ch resolves to **633.53px** against
measured line ink of 481.9 and 490px, so it never binds; below 701 it is set to
`none`. It reads like a measure control and controls nothing, and it leaves the
`h2` box 143px wider than its ink, which will mislead the first person who tries
to align anything to it. Delete it, or replace the `<br>` with a real measure so
the constraint does something.

---

## 3. Questions for the client

**Q1. Is there a master of `yamuna-students-foam-line` above 3,200px wide?**
The file on disk is 1280×591 and the band paints it at up to 3.37×. *Yes* →
re-export and D2 closes. *No* → the band cannot stay full-bleed above ~1280 CSS
px on this frame, and we either substitute a frame that has a master or accept
visible softness at 1440 and above. It changes the fix, not the design.

**Q2. Who took this photograph, where exactly, and when?** D3 needs a provenance
line and I will not invent one. The bank under the bridge is presumably Kalindi
Kunj or Okhla; the year is unknown to me. One line: place, month, year,
photographer.

---

## 4. What I would not change

- **The halftone mechanism.** It is a fixed-pitch, fixed-density dot screen, not
  an amplitude-modulated one, so it is technically a texture rather than a
  reproduction screen. It is also the hero's, and the hero is frozen. Two
  halftones that behave differently would be worse than one that is
  theoretically impure. Closed.
- **The warm cast.** The `duo` ramp runs R > G > B and reads brown at large
  areas, which is not literally "black and white". It is the approved ramp, it
  is on every photograph on the site, and re-picking it here would break the
  whole page to fix one band. Closed.
- **The dark bottom third.** The seat gradient crushes what is, in the source, a
  bright sandy foreground. It looks at first like the students are standing on
  nothing. It is doing real work — it seats the sentence and it makes the cut to
  paper at the seam land — and the alternative is a slab. Leave it.
- **Cutting the sentence to one line at ≤560, or shrinking the band below 420px.**
  Both would be tempting for the mobile budget. The band is already the
  smallest full-viewport moment on the page and it is 420px at 375×635 — the
  budget has to be found in `journeys` (1,158.7) and `record` (1,373.9), not
  here.
- **Adding a button, a link or a caption inside the frame.** The spec is right:
  one screen, one sentence, nothing else in the picture. Everything D3 asks for
  goes on the seam, not in the frame.
