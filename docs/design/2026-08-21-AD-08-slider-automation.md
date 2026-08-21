# AD-08 — Does it make sense to automate the situation slider?

**No.** Not "not yet" — no as a ruling. Auto-advance takes a measurement away
from the person reading it, and on the one device where the problem it claims to
solve is real, it is the single remedy that cannot be given a stop control.

The real problem behind the question is real and still open: **on a phone at
rest, the deck's index is below the fold.** It has a cheaper answer that does not
move the page. That answer is a separate ruling and is set out in §6.

Nothing in this document is implemented. The page is frozen.

---

## 1. What is actually there

Measured against `public/design/v3/home.html` on the running dev server, Chrome
headless with `Emulation.setDeviceMetricsOverride`, timezone Asia/Kolkata,
device scale 1.

The hero deck is **not a marketing carousel**. It is an ARIA tabs widget:
`role="tablist"` on `.rig-tabs`, `role="tab"` on each generated button,
`role="tabpanel"` on each `<article class="sit">`, inside a native horizontal
scroll container.

| property | measured |
|---|---|
| `.rig-track` overflow-x | `auto` |
| `.rig-track` scroll-snap | `x mandatory` |
| `.rig-track` scroll-behavior | **`auto`** — the advance is an instant `scrollLeft` jump, not a slide |
| panels hidden when off-screen | **no** — all four are in the DOM and in the accessibility tree at once |
| `[aria-live]` nodes on the whole page | **0** |
| `@keyframes` on the whole page | **1** — `s-hero-live`, the 9×9px state dot |
| `setInterval` / `setTimeout` / `requestAnimationFrame` in the file | **0 / 0 / 0** |
| `prefers-reduced-motion` blocks | 3 (`.rise` reveals, the LIVE dot, `.w7-jr-strip`) |

**The deck does not loop.** Six consecutive `.rn` clicks, measured at four
viewports: `scrollLeft` goes 0 → 375 → 750 → 1125 and then `next.disabled ===
true` and it stops. Same shape at 390, 412 and 1440. `mark()` sets those
disabled flags deliberately, and AD-05 R7 already tuned the focus hand-off
around them.

`root.setActive(ids)` exists — it shows/hides slides by `data-id`, rebuilds the
tab row, resets `scrollLeft` to 0 and calls `mark(0)`. It is **defined and never
called**: it is the hook waiting for the D-01.4 / D-00.1 backend.

## 2. The geometry, at both widths

| | 1440×900 | 375×812 | 375×667 |
|---|---|---|---|
| nav height | 63 | 105.8 | 105.8 |
| hero band | 825 | 716.9 | 712.6 |
| seam (nav + hero) | 888 | 822.7 | 818.4 |
| tab row | 822.5 → 851.5 | 712.7 → 756.7 | 708.4 → 752.4 |
| pager `1 of 4` | 834.8 → 853.2 | 779.5 → 797.9 | — |
| arrows | 824 → 864 | 766.7 → 810.7 | — |
| tab row visible at rest | **yes** | yes | **no** |
| pager visible at rest | **yes** | yes | **no** |
| arrows visible at rest | **yes** | yes | **no** |
| hero, in screens | 0.9 | 0.9 | 1.29 |

Two things follow, and they pull in opposite directions.

**At 1440 there is no discovery problem at all.** The four tabs, the "1 of 4"
pager and a visibly greyed-out prev arrow are all in the first screen, 36px
above the fold. A reader who cannot tell there are four situations there is not
being failed by a lack of motion.

**On a real phone the discovery problem is real.** This project costs the phone
at **~635px of actually-visible iOS Safari** (D-01.9, AD-01c). The seam is at
818.4. The deck's entire control bar — tab row, pager, both arrows — sits
**183.4px below the fold**. Confirmed at 375×667: `tabsVisible false`,
`countVisible false`, `arrowsVisible false`. This is exactly the failure D-01.5
identified and paid 96px of cut copy against; the payment was real and it was
not enough.

Two smaller measured facts, for the record: the tab row itself **clips** at
phone widths — scrollWidth 366 against a 335px client at 375, so "Forest fire"
is cut by 31px; 16px at 390; nothing clipped at 412 or 1440. And the 12–13px of
ticker showing under the hero, which D-01.7 says not to "fix", is a desktop cue
only — on a phone the seam is 183px past the fold and there is no sliver.

## 3. The reading load — the number that settles it

Words per slide, whole panel, measured:

| slide | panel | its explanatory sentence |
|---|---|---|
| Air | 81 | 27 |
| Yamuna | 96 | 33 |
| Climate Event | 90 | 32 |
| Forest fire | **105** | **42** |

Plus a numeral, a unit, a verdict, a six-band scale to parse, a limit line and a
provenance line carrying a computed age. At 200 wpm the slowest slide is **31.5
seconds**; at 150 wpm, which is the honest rate for numeric technical prose,
**42 seconds**.

Now bracket the interval:

- To **not interrupt** a reader, the interval must exceed the reading load:
  **≥ 30s**, realistically 40s.
- To be **perceived as an affordance** — to make a reader think "ah, there are
  more of these" — it must fire while they are still looking: **≤ 8s**.

**The brackets do not overlap.** There is no interval that both leaves the
reading alone and tells anyone anything.

And the long end is worse than it looks. The hero is **0.9 screens**. A reader
either stops on it — in which case they are reading, and must not be
interrupted — or scrolls, in which case they are into the ticker long before a
30-second tick. **The timer has no reader to serve.**

## 4. Why it is the wrong instrument, not just badly timed

**4.1 It contradicts what the page argues.** Every slide is a number, a
published limit, a named source and an hour. The page has spent real money on
that claim: Monsoon's LIVE was withdrawn because nothing was behind it
(D-01.11); the dates compute rather than being typed; a closed window renders
*nothing* rather than a greyed placeholder (D-00.1); the genre label was refused
because the hero was told not to be a dashboard (D-01.12). A reading that slides
away under the reader is not a fact on the record any more, it is a display.
Auto-advance re-buys the exact quality — a screen that plays at you — that those
rulings were spent removing.

**4.2 It cannot be made compliant in the frozen layout, on the device that needs
it.** WCAG 2.2.2 requires a pause, stop or hide mechanism for anything moving
automatically past five seconds. On a 635px phone the tab row, the pager and
both arrows are below the fold (§2). So the phone reader sees the panel change
and has **no visible control**. A keyboard-reachable mechanism satisfies the
letter of 2.2.2; a phone has no keyboard. Making it genuinely compliant means
bringing the deck's controls above the fold — and **if you are willing to make
that change, you have already solved the real problem without a timer.**

**4.3 It does not loop, so it demotes the lead.** Measured hard stop on slide 4
(§1). Left to run, every reader's resting state becomes **Forest fire — 118
detections, BELOW SEASON, band 2 of 6, no legal threshold** — while **Air, 412
against a limit of 100**, is retired after N seconds. The page would spend its
front door to arrive at its weakest reading. Adding a loop instead means motion
that never stops, which is the harder 2.2.2 case, and it contradicts the
disabled-at-the-ends design that `mark()` and AD-05 R7 deliberately built.

**4.4 It is not one change.** The advance is an instant `scrollLeft` jump, and
the comment at `home.html:3853–3872` already documents the trap: adding
`scroll-behavior:smooth` alone *"does not make the deck smooth; it makes it
lie"*, because every caller does `go(i); mark(idx())` and `idx()` derives the
index from `track.scrollLeft`, which is still on the old slide for the length of
a smooth scroll. So "automate the slider" is really: a timer **plus** a smoothing
rework **plus** a target-index rework of `mark()` **plus** a pause control **plus**
a live region the page does not have **plus** a reduced-motion branch **plus**
page-visibility handling **plus** touch arbitration — landing in a band that was
frozen this morning. The cheap version, which is a hard jump-cut of an
1440×825 panel every N seconds, is *more* disruptive than a slide, not less.

**4.5 Membership is variable and the timer has nothing sensible to do at the
edges.** The frozen set is six (D-00); the deck ships four; a closed window
renders nothing at all, so Heatwave is absent today, its window shut 15 July
(D-00.1). **n is genuinely 1 to 6.** At n=1 there is nothing to advance and the
timer must not exist. At n=2 it is a two-state blink. At n=6 a non-interrupting
30s interval is a three-minute cycle whose end nobody will ever see.
`setActive()` resets to slide 0 and rebuilds the tab row, so a timer has to be
torn down and rebuilt with it — and a reader returning in spring finds a
different cycle length with nothing explaining it, which is the same hazard
D-00.1's consequence 1 already logs against the ticker.

**4.6 Mobile touch is where this breaks, and it breaks unfixably.** `.rig-track`
is a native scroll container with `scroll-snap-type: x mandatory`. A timer
writing `scrollLeft` during a finger drag or its momentum fights the browser's
own scroll, and under mandatory snap can land between slides. "Pause on touch"
needs a reliable end-of-user-scroll signal; `scrollend` is recent Safari and a
material share of this audience is on older iOS. The requirement most needed on
mobile is the one least reliably implementable there.

**4.7 For screen readers it adds nothing and risks subtracting.** All four
`role="tabpanel"` slides are in the DOM with no `hidden` attribute (§1), so an
AT user already reaches all four in sequence regardless of which is scrolled
into view, and the track's own label says so: *"Situations, one at a time. Use
the arrow keys or swipe."* There is no `aria-live` region on the page. A timer
therefore either announces nothing — and the AT user's context silently desyncs
from the sighted user's — or announces every tick, which is an interruption
generator.

## 5. So: does it help a reader see there are four?

Honestly — **partially, expensively, and only for readers who already have the
tab row in view**, which is to say the readers who do not need it. At 1440 the
index is on screen. On a 635px phone it is not, and there auto-advance is the
one remedy that cannot be equipped with a control.

There is also a bound on the cost of doing nothing that should be on the record:
**the next band is the index.** The ticker names every situation in window, in
words, with links — today Air, Yamuna DO, Forest fire, Forest loss, Climate
Event, plus Swechha's own figure. A phone reader who never sees the tab row
learns the answer 180px later, in text, with no motion at all.

## 6. The real problem, and three answers that do not move the page

The problem to hand back is not "the deck should move". It is: **on a phone at
rest the deck's index is below the fold** (183.4px, §2). Three candidates, all in
vocabulary this page already owns. Each is a separate ruling; none is built.

**(a) The sliver, sideways — strongest, and the most expensive.** This page
already holds that a partial next thing is the affordance: `--s-hero-frame`'s
62px and 92px constants exist to leave 12–13px of the ticker showing under the
hero as the scroll cue, and D-01.7 says explicitly not to "fix" them. The same
move works horizontally — let the next situation's panel edge show ~12px at the
right of the track. Zero band height, zero motion, no WCAG control needed
because nothing moves by itself, and it self-scales: present at n=2 and n=6,
absent at n=1. **Cost, stated honestly:** slides become `calc(100% - 12px)`,
which touches the geometry every AD-01c measurement was taken against — a
re-measure of all four slides at fourteen widths, not a one-liner. It also
softens the deliberate "one panel at a time" cleanliness.

**(b) Raise the index, not the motion — cheapest real gain.** Move the count
alone into the panel at ≤560 rather than the bar. It is 34.5 × 18.4px. That
single move puts "1 of 4" above the 635 line, which is the whole of what the
phone reader is missing.

**(c) Accept the bound and let the ticker carry it.** If the client is content
that the phone reader learns there are four situations one band later, in words,
then the honest ruling is that there is nothing here to fix and the deck is
finished as it stands.

My preference, if asked to choose today: **(b) now, (a) only if the hero is ever
reopened for another reason, (c) is defensible and costs nothing.**

## 7. If the client overrules this and wants it anyway

Then the only form that does not damage the page. Recorded so that the
compliant version is on the table rather than reinvented:

- **Trigger:** never on load. Only after the hero has been ≥50% in view for 2
  continuous seconds, `n ≥ 3`, pointer is `fine`, and the reader has made **no**
  interaction with the deck. Any tab click, arrow click, swipe, key press or
  focus inside the deck **kills the timer permanently for the session** — it
  does not resume.
- **Interval:** 12s, and it advances **at most twice** (Air → Yamuna → Climate
  Event), then stops for good. This is not a carousel; it is a two-step
  demonstration that the deck moves. 12s is a compromise the reading load does
  not endorse (§3) and it should be understood as such.
- **Stops on:** hover anywhere in `.s-hero`, focus anywhere in `.s-hero`,
  `pointerdown`/`touchstart` on the track, any scroll of the track by the
  reader, `document.visibilityState !== 'visible'`, and
  `matchMedia('(prefers-reduced-motion: reduce)')` — in which case it never
  starts and no control is rendered.
- **Never runs on `pointer: coarse`.** Not a hedge: §2 shows the control would be
  off-screen and §4.6 shows pause-on-touch is not reliably implementable on the
  devices in question. Phones get no auto-advance under any interval.
- **The pause control, in the page's own vocabulary:** no new glyph. A `.lbl`
  micro-caps text button reading **PAUSE**, then **PLAY**, sitting immediately
  after the `1 of 4` count in `.s-hero-bar`, styled as the bar's existing text
  controls: no border, no fill, `--fg-2` at rest, `--fg` on hover, the standard
  mustard `:focus-visible` ring. It is rendered **only while the timer is
  actually live** and is removed when the timer dies, so the page carries no
  dead control. It must not be mustard as an object (the band's single mustard
  act stays single, per D-01.7) and must not be red (red means a broken limit).
  Minimum 44px tap height, though on coarse pointers it will not exist.
- **Screen readers:** the timer is decorative and must be invisible to AT. The
  correct wiring is `aria-live="off"` behaviour — i.e. no live region, no
  announcement, because §4.7 shows the AT user already has all four panels. The
  PAUSE button gets `aria-pressed` and an `.sr` label naming what it pauses
  ("Pause automatic advance through the situations"). Do **not** add an
  `aria-live` region to announce slide changes; it converts a visual nicety into
  an audible interruption.
- **Membership changes:** `setActive()` must tear the timer down before
  rebuilding and only re-arm it if the new `n ≥ 3` and the reader has still not
  interacted. At n=1 or n=2 the timer and its control must not exist at all.
  The two-advance cap is counted in advances, not in slides, so it behaves
  identically at n=3 and n=6.

Even in this form it buys little (§3, §5) and costs the changes in §4.4. It is
recorded as the compliant shape, not as a recommendation.

---

## 8. Note on the two replaced photographs — needs a decision, not changed

The client spotted that Climate Event and Forest fire carried near-identical
grass photographs. They now carry a monsoon frame and a 2016 Uttarakhand
fire-scar frame, both Wikimedia, credited in `content/photo-library.json` and
tagged `placeholder`:

- `monsoon-flooded-fields.jpg` — 1400×730 — *lensnmatter, CC BY 2.0 (cropped)*
- `uttarakhand-fire-scar-2016.jpg` — 1400×1050 — *ArmouredCyborg, CC BY-SA 4.0*

**Both `--op` values were tuned for the old images and both are now wrong. I
have not changed them.** The reason is the same in each case: D-01.3 makes the
photograph a masthead band, and the opaque `.s-hero-panel` covers the bottom
~53% of the frame at 1440 — so the *visible* picture is the top ~47%, and that
is what the focal point has to aim at.

**Climate Event — `--op:50% 44%`. The focal point is not the problem; the aspect
ratio is.** The image is 1.918:1 against a 1.929:1 frame, so cover crops away
**4.5px of 750** — object-position is effectively inert here, and no `--op`
value can change what is on screen. The photograph's horizon sits at ~48% of its
own height, which lands it exactly at the panel's top edge, so the water, the
reflection and the flooded fields — the entire subject — are **behind the
panel**. What the reader sees is grey sky, one transmission tower and a dark
line. That is defensible as a monsoon frame, but it makes the alt text false:
"flooded fields, a transmission tower reflected in the standing water" describes
something not visible. **Two ways out, client's call:** give it a `--zh`/`--zt`
zoom the way Air already does (`--zh:134%; --zt:-33%`) to lift the reflection
into the visible band, or leave the crop and rewrite the alt to describe the
sky-and-tower frame that is actually rendered. Mobile is fine either way — the
shot is a 154px relative strip with no panel over it, and 9%–88% of the image is
visible there.

**Forest fire — `--op:50% 42%`. This one wants a real change, and it is the
half of the client's original complaint that is not yet fixed.** The readable
fire content — charred standing pines and pale sky — is in the image's top ~40%
and right ~35%. At 42%, cover puts image rows 13%–82% in the frame, and the
panel then leaves only rows **13%–45%** on screen: the middle of the slope,
which is brown pine-needle texture. So the frame still reads as an
undifferentiated dry-scrub photograph at a glance, which is close to the defect
that was reported. It is worse on the phone, where there is no panel and the
whole 154px strip is image rows 19%–74% — pure texture, no trunks. **Suggested
direction: bring the vertical focal point up to roughly `50% 22%`** (which puts
the on-screen strip at image rows ~7%–39% and catches the burnt canopy), and
consider nudging x right, to around `65–70% 22%`, since the standing trunks are
in the right third. Verify against the top-right STATE badge before committing —
that corner must stay legible. **I have not applied either value.**

---

# 9. Social media on the homepage — designed and built

Separate item, same file, same session. The client is right: the strings
instagram / facebook / twitter / youtube / linkedin appeared **zero** times in
`home.html`, and the footer's only contact of any kind was
`mailto:info@swechha.in`. **Built.** Backup at
`scratchpad/home.html.bak-ad08-pre-social`.

## 9.1 The three judgements

**Where — the footer, and only the footer.** The four accounts sit in a new
`.foot-soc` sub-row between the existing link grid and the legal strip.

Not a fifth footer column: a fifth column takes the four existing ones from
352.7 / 235.1×3 to 280 / 187×4 at 1440, and at 187px "Environmental
Intelligence" wraps. Holding four words would have reflowed every link already
in the footer. As its own sub-row it costs one hairline and reflows nothing —
measured, the four columns are still 352.7 / 235.1 / 235.1 / 235.1 at 1440 and
158.5×4 at 375, unchanged to the decimal.

**Not also in Give, and not in the Turn-up tile** — the coordinator asked, so
here is the answer rather than a default. The Give band is "Three ways in":
Give / Volunteer / Partner, three commitments that each cost the reader
something. "Follow us" is not a fourth of that weight, and putting it there
flattens the band's argument to make room for the cheapest possible ask. The
page's discipline is one claim per band, and D-07.10 already established it is
comfortable having a moment with nothing to click. One place also means one
place to maintain, which matters on a page whose whole virtue is that nothing
on it over-claims.

*The one case for a second mention, if the client confirms the fact:* the
Volunteer tile says "Clean-up dates… Turn up once or turn up every month" and
its CTA is "See the dates". If the dates are in practice announced on
Instagram, then that tile is the honest second home. I have not asserted it,
because I cannot verify it. Client's call.

**Form — wordmarks, not an icon set. This is the one I would defend hardest.**
This page's entire vocabulary is type, rules and photographs; the only non-type
marks it permits anywhere are the `→` arrow, the six-band scale and the
halftone. Four platform logos would be the site's *first icon set*, and would
arrive as four foreign trademarks each carrying its own colour and geometry into
a design that has spent eleven bands refusing exactly that kind of import. The
counter-argument is that logos are instantly recognisable — but they are
recognisable *as platforms*, and this page is not selling platforms. The words
are just as recognisable and they carry the register. They are also strictly
better mechanically: real text, so they inherit the footer's contrast, need no
SVG and no alt string, and scale with the type instead of against it.

**What it says.** A bare row of platform names says nothing a reader wants, so
the row carries a label and a sentence, and the sentence does two jobs:

> **FOLLOW THE WORK**
> Journeys, clean-up dates and film go out on these four accounts — all of them
> **@swechhaindia**. Nothing on this page is pulled from them.

The handle is the same on all four, which is a true and useful fact worth one
word of weight. The closing clause is the page's own honesty grammar — it is the
same move as `.foot-b`'s "Every reading shown is a sample value standing in for
the live feed", and it pre-empts the reader who wonders why there is no
Instagram grid here. **No follower counts, no embeds, no "latest from
Instagram".** This page cut a typed "today" rather than imply a feed it does not
have.

**No LinkedIn.** None exists on the live site and none was invented. The string
"LinkedIn" appears exactly once in the file, in an HTML comment, saying that one
may not be added — deliberate, so whoever ports this to the Next.js build does
not helpfully fill the gap.

## 9.2 What shipped

`.foot-soc` → `.foot-soc-x` (flex, space-between, wrap) containing
`.foot-soc-t` (label + sentence, `max-width:62ch`) and `.foot-soc-r` (the four
links). ≥521: one line, right-aligned to the wrap's right edge, hairline
separators — `border-left`, because every division on this page is a rule. ≤520:
borders off and the row becomes the same `1fr 1fr` grid `.foot-g` already uses
at that width, on 44px rows.

All four links use the Green-the-Map convention exactly:
`rel="noopener" target="_blank"` plus `<span class="sr"> (opens in a new
tab)</span>`. Verified present on all four at every width measured.

| | Instagram | Facebook | X / Twitter | YouTube |
|---|---|---|---|---|
| href | `instagram.com/swechhaindia/` | `facebook.com/SwechhaIndia/` | `x.com/swechhaindia` | `youtube.com/@swechhaindia` |

X is labelled **"X / Twitter"**, the same way SOURCE-FACTS heads that row. A
bare "X" is a one-character tap target and an ambiguous word read aloud.

## 9.3 Measured, before and after

| | 1440×900 before | after | 375×812 before | after |
|---|---|---|---|---|
| document height | 10,733 | **10,852** (+119) | 10,033 | **10,244** (+211) |
| `.foot` | 297.6 | **417** (+119.4) | 514.9 | **725.8** (+210.9) |
| `.foot-g` | 140.8 | 140.8 | 398.5 | 398.5 |
| `.foot-g` column widths | 352.7 / 235.1×3 | **identical** | 158.5×4 | **identical** |
| new `.foot-soc` | — | 89.4 | — | 196.9 |
| `scrollWidth === width` | true | **true** | true | **true** |

`scrollWidth === innerWidth` holds at **all ten widths** tested: 320, 375, 520,
521, 560, 600, 768, 820, 1024, 1440. Every other band is unchanged to the
decimal — hero 825 / 716.9, ticker 111.2 / 116.5, give 679.2 / 861.1, say, work,
journeys, impact, record all identical. The `diff` against the backup is
**purely additive: three insertion points, zero deleted or modified lines**, so
byte-identity of the bands not touched is proven rather than asserted. Deck still
advances (next → "2 of 4"), tab row intact, **zero console errors and zero failed
requests** at 375×812.

**Tap targets:** all four links measure exactly **44.0px** tall at every width,
including 320. Widths 158.5px at 375, 131px at 320.

**Contrast:** links `#CDC7B7` on the footer's `#151512` — the `--fg-2` token,
~11:1. Sentence `#9C9585` (`--fg-3`, 6.4:1). The handle is `--fg-2` at
`'wght' 650`. Nothing new is mustard and nothing new is red.

## 9.4 One defect found and fixed on the way

The first build had the row as a flex item at ≤520, so it sized to its own
content (~160px) and the `1fr 1fr` inside resolved to **71px columns** — tidy by
accident, and **not on the same two columns as the link grid directly above it**.
On a page this strict about spine registration that is a real defect, not a nit.
`flex:1 1 100%` fixes it: the columns are now 158.5px at x 20 / 196.5 at 375, 131px
at x 20 / 169 at 320, 231px at x 20 / 269 at 520 — verified equal to `.foot-g`'s
own column origins at each. Zero height cost.

## 9.5 Cost to declare

**+210.9px on the footer at 375.** That is real and it lands on a band whose own
code comment records a fight to claw back 84px. Two things make it acceptable
rather than sloppy: it is 2% of a 10,244px document, and it is the footer — the
least contested space on the page, and the conventional and expected home for
exactly this content. If the client wants it cheaper, the available saving is the
sentence: dropping "Nothing on this page is pulled from them" takes back roughly
one line (~19px) and costs the honesty clause. I would not make that trade, but
it is the trade that exists.

---

*Measured with `Emulation.setDeviceMetricsOverride` at 320×568, 375×635,
375×667, 375×812, 390×844, 412×915, 520×800, 521×800, 560×800, 600×800,
768×1024, 820×800, 1024×800 and 1440×900, IST, device scale 1. §1–8 modified no
file. §9 modified `public/design/v3/home.html` only, additively; backup at
`scratchpad/home.html.bak-ad08-pre-social`.*
