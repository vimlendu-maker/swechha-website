# The Record, warm

**The synthesis direction for swechha.in. 19 August 2026.**

Three designers produced the current approved design, Direction A ("The Record")
and Directions B ("Instrument") and C ("Ink"). The client has reacted to all of
it. This is the resolution: one direction, with the arguments for each decision
and the places I have overruled the work that came before.

Boards:

| | |
|---|---|
| Homepage | `public/design/v2/home.html` |
| Environmental Intelligence, the index of active situations | `public/design/v2/intelligence.html` |
| One situation in full, the template for the rest | `public/design/v2/situation-air.html` |
| The system sheet, which is what the studio builds from | `public/design/v2/system.html` |

All four are self-contained HTML with an inline `<style>`, no framework, no
build step, local images only. Checked in a browser at 1280 and 375, with
`scrollWidth === clientWidth` at both widths on all four. Zero em-dashes and
zero en-dashes anywhere in any of them.

---

## 1. The one idea

> **Swechha has kept a record of India's environment for twenty-six years. The
> site should be that record, warm enough that a fifteen-year-old will walk into
> it, and honest enough that a journalist will cite it.**

Direction A got the first half right and threw away the warmth. The current
design got the warmth right and never raised its voice. Neither of those is a
compromise position: the reason the record has any moral weight is that people
walked to get it, and the reason the people matter is that they came back with
numbers. The site has to hold both, and the way it holds both is that the
instrument sits on warm cream paper rather than on black.

Four rules follow, and they are the whole design.

1. **The readings are the hero.** Environmental Intelligence is not a widget on
   the homepage, it is the top of the homepage, and the number is the largest
   object on the page by a factor of fifteen.
2. **Every figure names its source, its hour and its cadence.** There is no
   global LIVE badge anywhere on this site, because on any given morning two
   feeds are live and four are last month's bulletin, and saying so is the
   product.
3. **Colour is applied by the data, by the act, or by the past.** One job per
   hue, argued in section 4, and no exceptions anywhere.
4. **Warm paper is the ground.** Once per page, at most, it inverts.

---

## 2. What I took, from where

### From Direction A ("The Record")

- **The premise.** The site is a record, not a brochure about the people who
  keep it. This is the strongest single idea any of the three directions
  produced and it is now the whole architecture.
- **Archivo, and the condensed broadsheet headline.** Kept, including the width
  axis, for exactly A's reason: one variable file gives a condensed-black
  masthead and a technical micro-label, and that matters on a 4G budget.
- **Newsreader.** Kept. A twenty-six-year publication archive needs a
  comfortable reading face, and Newsreader has real optical sizing.
- **Dropping Fraunces.** Agreed and executed. A's argument is correct and I have
  nothing to add to it.
- **Red as a condition, not a brand asset.** The single best decision in A. Red
  is switched on by a threshold comparison, not by a designer.
- **The one inversion per page**, and A's diagnosis that the current
  section-rhythm rule alternates so regularly that the inversions stop meaning
  anything. Correct. On the homepage the ground goes dark exactly once.
- **No hamburger on mobile.** A horizontally scrolling index strip under the
  masthead, which is what the front page of a newspaper does and needs no
  JavaScript.

### From Direction C ("Ink")

- **Poster scale.** C was the only board with the nerve to set type at a size
  the client would notice. The readout at 269px and the display at 104px are
  C's contribution, moved onto A's paper.
- **The archive as a contact sheet with the holes left in it**, and the line
  that goes with it: "the holes stay in the sheet until they are filled".
- **The condensed all-caps index row** for Journeys and for the record doors.
- **Its energy.** C is the only one of the three a seventeen-year-old would
  share. Some of that survives in the scale and in the mustard closing band.

### From the current approved design

This is the source the earlier boards treated as the thing being replaced. It is
not. It is a third source and quite a lot of it survives unchanged.

- **The warm paper.** `#F7F4ED` and `#F1EBDD` are carried forward untouched.
  This is the warmth the client refused to lose, and it is also, as it turns
  out, the cream ground of their own illustration reference.
- **Mustard.** Kept as a live accent with a real job, not demoted to a legacy
  token.
- **The one-situation-at-a-time slider.** Kept as the pattern, rebuilt as a
  native scroll-snap track so it swipes with no script and every situation is in
  the DOM whether or not JavaScript runs.
- **The selective-colour photography.** Brought back, filter code unchanged,
  with one change to who decides. See section 5.
- **The per-theme freshness thinking** that the current board already had in its
  notes ("the honest state here is per-theme freshness, not one global claim").
  That instinct was right and is now the spine of the whole EI design.
- **The mustard closing band**, the impact figures, the Farm and Green the Map
  split, the timeline. All kept, re-set.

### From Direction B (copy only)

B's layout is out on the client's instruction. Its writing is the best of the
three and is all over these boards:

- "Measured, dated, sourced."
- "The river enters Delhi alive and leaves it without oxygen."
- "You cannot argue someone into caring about a river."
- "If a reading is stale, this page says so rather than showing you the last
  good value as though it were current."
- "Every source, its cadence and its date."
- B's monsoon observation, reframed so it stays true on a severe day: the white
  band through the year grid "is the best the air gets all year, and it is still
  above what the World Health Organization considers safe to breathe."

The three named favourites are placed where they do the most work. **"We keep
the record"** is the homepage masthead line. **"A number is not a smell"** is
the one dark inversion on the homepage. **"Delhi, I can't see you"** is the
headline of the Environmental Intelligence page.

---

## 3. What I overruled, and why

**A's newsprint ground, and B and C's zero-colour position.** Overruled. The
client likes the warmth and has said so, and their own references are cream and
white with a coloured spine, not newsprint grey. More importantly, B's argument
for no colour was that severity must survive colour blindness, sunlight and a
photocopier, and that argument is right about the requirement and wrong about
the conclusion. This design meets the requirement without giving up the hue: a
six-cell filled counter, a six-step grey ramp, weight, and a printed multiplier
carry severity achromatically, and the red sits on top of all four as a
redundant fifth channel. Nothing on this site depends on red alone.

**A's proposal to kill selective colour.** Overruled, but its objection is
answered rather than ignored. A was right that a hand-tuned per-image choice
will decay across a several-thousand-image archive maintained by whoever is on
shift. The fix is not to delete the treatment, it is to remove the human from
the loop: the hue a frame is allowed to keep is now the hue of the band it sits
in, which is derivable from the page rather than curated per image.

**A's "if the feed is not live, do not build this direction."** Overruled, and
this is the most consequential disagreement. The decision ledger says two feeds
are live and three are editor-entered, and there is no real-time public Yamuna
data to be had. A's position would mean never shipping the best idea in the
brief. The correct answer is to design the periodic state as carefully as the
live one, so that a monthly DPCC bulletin looks like a cadence rather than a
fault. At launch four of six situations will wear it, so it is the common case,
and a design where the common case looks broken is a broken design.

**Making the hero go dark on a breach.** Considered and rejected, and the
client agreed. In Delhi winter a breach is the normal state, so a hero that
inverts on breach would be dark for months and the warmth would be the thing
nobody ever sees. Severity therefore has to land on a warm ground, which puts
the whole weight on the red rail, on scale, and on the word. It does land: at
269px with a six-pixel red band running the full height of the block, "412"
is not a quiet object.

**Hindi.** Dropped from every decision on the client's instruction. Archivo and
Newsreader are Latin only, and the tracking values here are set for Latin. If
Devanagari returns it is a per-script override on display sizes, not a redesign,
and it should be quoted as its own piece of work.

**Three equal columns of anything.** The current site is `repeat(N, minmax(0,
1fr))` from top to bottom and that is why nothing on it dominates. The work
index on the new homepage runs on a twelve-column grid where no two frames share
a span, an aspect ratio or a baseline, and the captions sit beside the frame
aligned to its top edge rather than under it.

---

## 4. The colour system

This was the hard problem in the brief. Here is the solution, and the reason it
holds.

**The three hues cannot compete because they are not the same part of speech.**

- **Mustard is the second person.** You: do this.
- **Red is the third person present.** The city is failing, right now.
- **Green is the past perfect.** This was brought back.

A sentence can only be in one of those at a time, and so can a section. That is
not a metaphor, it is the enforcement mechanism.

### One rule per hue

**Mustard marks a human act.**
Anything Swechha does, or anything the reader is being asked to do: give,
volunteer, join a journey, open the archive, file an objection, subscribe to a
ward. It is the warm register the current site already has and it stays exactly
there.
*Never* on a reading, a value, a band, a chart or a source line. *Never* as a
general brand tint on a page where nobody is being asked to do anything. Mustard
on a measurement would read as "this is fine", and the site is not allowed to
say that.
`#8A6410` as text on paper (4.89:1); brand `#E1A32B` as a fill with `#16150F` on
it (8.25:1).

**Red means a published legal limit has been broken.**
Applied by a comparison, not by a designer: the stored value against the stored
limit. It appears in exactly four places and nowhere else. The rail beside a
reading. The verdict word. The top band of a scale. The multiplier. Plus the one
object inside a photograph that sits in a reading band, through the
selective-colour filter.
*Never* a button, a link, the logo, or a section background. *Never* because a
number is high, only because a number is illegal. Rainfall at 512mm against a
434mm normal is above normal and is **not** red, and the page says why.
`#B41C25` on paper (6.10:1); paper on `#B41C25` (6.10:1); `#FF5A50` on the dark
ground (6.14:1).

**Green counts what came back.**
Past-tense recovery and only that: tonnes out of the river, gardens established,
saplings standing. It is the only hue allowed next to a number that is good
news, which is why it can never be read as a forecast or a target.
*Never* a projection, a goal or an aspiration. *Never* on a live reading, even a
good one, because a good reading today is not a recovery.
`#1F6B45` on paper (5.89:1); `#5FBE85` on the dark ground (8.26:1).

### The band rule, which is what actually stops them competing

**One hue is active per section band, never two. Red and green may not appear in
the same band or in adjacent bands. Mustard is the only hue permitted to travel
between bands, and it is never permitted inside a data component.**

On the homepage that resolves as: hero red, statement red (inside a photograph),
journeys mustard, work index none, twenty-six years mustard, impact green, farm
none, record none, give mustard. Red and green are three bands apart and never
share a screen.

### The fourth rule: severity is never carried by colour alone

Every red statement is redundant with at least two achromatic ones: the filled
band counter, the weight of the verdict word, and the multiplier. **The
multiplier is the best device on this board** and it came from the client's own
RiverWatch reference: not "412", but "412, **4.1×** the safe limit". It converts
a number nobody can interpret into a number nobody can misinterpret, it works
for a reader who cannot see the red at all, it survives a photocopied school
handout, and it is free once the limit is stored.

### Feed state is a separate axis, and it is carried by shape

Live is a filled square, periodic a hollow one, demo data a hatched one. Never a
colour, precisely so that state cannot borrow red's meaning. This matters: the
Noise situation on the `/now` board is **in breach and is demo data at the same
time**, and those are two independent facts the page has to be able to state
without one contradicting the other.

---

## 5. Selective colour, and who decides

Every photograph is warm monochrome through one duotone ramp, with a second
bounded ramp for any frame under text. The filter code is lifted verbatim from
the current design. What changes is the decision procedure.

**The hue a frame may keep is the hue of the band the frame sits in.** A
photograph in a reading band may keep red. A photograph in an action band may
keep mustard. A photograph in the impact band may keep green. Nowhere else. It
is derived, not curated, so it cannot decay across an archive, which was A's
only real objection and it was a good one.

`none` remains a real answer rather than a fallback. A frame that is warm all
over or green all over has no single element to isolate, and those stay fully
monochrome. The filters are never animated and never applied to a moving
element: they re-rasterise the entire frame every tick, and on a mid-range
Android that is the difference between a site that works and one that does not.

The system sheet shows the same photograph in both states side by side, so the
argument is visible rather than asserted.

---

## 6. Type

Display to body is **269 to 18, or 14.9 to 1**. The current site is 3.95 to 1,
and that single number is why nothing on it has ever looked composed. Headline
to body is 5.8 to 1.

Two families, four voices, and nothing else. Archivo carries the condensed
broadsheet headline, the tabular readout, and the wide-tracked caps section
heading from the client's reference. Newsreader carries every sentence anyone is
expected to read. There is no monospace: adding a third family for timestamps
would be a family for one job.

At a 1280px viewport the scale is 269 / 104 / 74 / 44 / 23 / 20 / 18 / 13.5 /
11.5. **Three deliberate voids: nothing between 23 and 44, nothing between 44
and 74, nothing between 104 and 269.** The empty octaves are most of what makes
a page look composed rather than interpolated, and the first instinct of whoever
builds this will be to fill them. Do not.

Both families are SIL Open Font Licence, zero cost at any traffic volume. These
boards link Google Fonts for convenience; production self-hosts and preloads the
two variable files so first paint does not wait on a third-party handshake.

Small-text colour: `--ink-3` is `#635D52`, which measures 5.94:1 on paper. The
ledger records repeated failures from using decorative tokens as small-text
colours, so this one is set at a value that passes AA body contrast, and there
is nothing lighter than it anywhere that carries text.

---

## 7. The rail

The site's structural signature, and it came straight from the client's own
reference images rather than from me: a full-height vertical rule with a giant
numeral crossing it.

The numeral sits left and is pulled past the column boundary by its own right
padding plus a quarter of an em, so **every** value crosses the rule whether
it reads "68" or "6,890" or "14 of 18". That last case matters: the schema
stores `value` as a string today and "14 of 18" and "5% to 90%" are both valid,
so a layout that only works for three digits is a layout that will break in
week two.

- **Quiet state:** a 1px rule painted *over* the numeral, so the rule cuts the
  number. This is the client's reference 2/3.
- **Breach state:** the same rule swells to a 6px red band painted *under* the
  numeral, so the number stands on it. This is the client's reference 4/5, the
  red spine running the height of a long scroll.

It is one component in two states, not two components, and the swelling is the
only way red is allowed to enter a layout. The impact figures use the identical
component with a green label, so the eye reads them as the same kind of
statement, and the only thing that differs is the hue of the label beside it.
That is the entire colour argument compressed into one component.

---

## 8. The hand-drawing: where, and why there

**One continuous hand-drawn path with people walking it, plants and a river
along it, and three patches of real monochrome photography set into the ground
as terrain.** Illustration and photography share one picture. That is the point:
the drawing is not decoration beside the archive, it is the archive with a route
drawn through it.

**It lives in three places and no more**, per the client's ruling: Journeys, the
twenty-six-year timeline, and the How Change Happens narrative. Journeys owns it
because a journey literally is a path with people on it. The timeline gets it
because so is that. Between the three, the line's character never changes; the
terrain under it does. That is what stops it wearing out.

Why it does not read as stock line-art: it is drawn as paths rather than
assembled from an icon set; strokes run 1.9 to 3.4 and are deliberately uneven;
no two figures share a height, a posture or a stride; and the terrain is real
photography from the library, clipped to rough drawn shapes and run through the
same warm monochrome ramp as every other image on the site. It is under 9KB of
inline SVG with no runtime cost.

It is also the one place on the site where mustard and green appear together, on
the walkers' garments, because nobody is being measured in it. That exception is
deliberate and it is the only one.

---

## 9. How the EI dashboard maps to the backend

### Three levels, not two

1. **Homepage.** The sneak view. One situation at a time, four switched on, the
   headline reading, enough to make someone click.
2. **`/now`.** The index of active situations. Whatever the backend has on.
3. **`/now/<situation>`.** The deep page, where the national dataset that the
   local reading sits inside actually lives. `situation-air.html` is the
   template for all of them.

The client gave three references and all three describe the same shape: local
reading on the homepage, national dataset inside. Delhi on the homepage, 256
reporting cities on the Air page; the Yamuna at Nizamuddin on the homepage,
every monitored river station in India on the Yamuna page.

### The situation record

`lib/content/schemas.ts` already gives most of it: `liveData` with `label`,
`value` (a string), `unit`, `sourceLabel` (required, enforced), `updatedAt`,
`mock` (required, no default), `trendPoints`; plus `status`, `severity`,
`evidence[]` and `timeline[]`.

**Two fields do not exist and this design requires them.** There is no stored
legal `limit` and no `limitUnit`, and there is no breach flag. Today an editor
types `severity: critical` by hand.

**Add the limit; never store the breach.** Breach is derived at render time by
comparing value to limit. A stored flag drifts the moment a limit is revised,
and the whole authority of the red rule rests on it being a comparison rather
than an opinion. Once the limit is stored the multiplier is free, which is the
second reason to do it.

`severity` should then be derived too, or at minimum validated against the
comparison, so that an editor cannot mark a within-limit reading critical.

### Variable count

The slider renders whatever the active array contains. `/now` carries a
**visible configuration control** on the board, switching between 3, 6 (the
realistic launch state) and 8 active situations, and the slides, the tab strip,
the counter and the prev/next disabled states all re-derive. That control is
there so the client and the studio can review every count the backend can
produce; in production it is the backend's active list and the control is gone.

The tab strip scrolls horizontally past about six, so eight is a scroll rather
than a wrap. Below 860px each situation stacks and the rail becomes a horizontal
rule above the second column.

### The validity window, which is what actually controls the list

Every situation carries a window: a start, an end, and a flag for whether it
recurs annually. This is a schema addition and it is the second-most valuable
one after the limit, because it removes a human from a monthly loop.

Two shapes, and the design distinguishes them:

- **Recurring seasonal.** Heat runs 1 March to 15 July, every year. Monsoon runs
  1 June to 30 September. Stubble smoke peaks late October to November. The
  page says when it returns.
- **One-off event.** A specific monitoring exercise, a specific cloudburst, a
  specific court-ordered clean-up. Real start, real end, never comes back. The
  Noise situation on the `/now` board is one of these, running 12 to 26 August
  2026.

**The active list is not curated, it is computed:** every situation whose window
contains today. Six on 19 August. That is the backend control the client asked
for in their original point 6, arriving through data rather than through
switches, and it means nobody has to remember to turn the heatwave on in March.

`status` (`active | monitoring | achieved | archived`) can then be derived from
the window in most cases rather than typed, exactly as `breach` is derived from
the limit. Same principle twice: **the editor states the facts, the site works
out the state.**

### Out of window is a designed state, not a 404

When a window closes the situation does not vanish. It becomes the record of the
season just gone. On the `/now` board, switch the control to "All 9" and step to
Heatwave: the rail turns dashed, the value drops to `--ink-2`, the verdict reads
"Season closed", and the number on show is no longer today's temperature but the
peak of the season that ended, with the count of days that crossed the alert
threshold and **the date it comes back**.

A heatwave page in December is one of the most useful pages on this site and
almost nobody builds one. It is also, incidentally, the answer to "what do we
keep and for how long": everything, and the window tells you which shelf it
goes on.

### Live, periodic, demo

- **Live** (filled square): a fetch inside the stated cadence. Two of six at
  launch: OpenAQ for AQI, NASA FIRMS for fire.
- **Periodic** (hollow square): the most recent published bulletin with its own
  date and its own cadence. Four of six at launch. **Designed as carefully as
  live, and named for its cadence rather than its lateness**, because it is the
  common case. The word on the chip is "Periodic", not "Stale".
- **Demo data** (hatched square): switched on in the backend, wired to nothing.

`mock: boolean` already carries the demo state; `updatedAt` plus `sourceLabel`
already carry freshness. The data model already supports the no-global-LIVE-claim
position. Build to it.

### Degradation

Every situation is real markup inside a native scroll-snap track. With
JavaScript removed the page still shows all situations and still swipes. The
script only lights the tabs, moves the track and applies the backend's active
list.

---

## 9a. Forest fire and loss of forest are two situations, on two clocks

The client's instruction, and it is a better answer than the caveat line I was
going to write.

- **Forest fire** is near-real-time thermal detections from NASA FIRMS. Twice
  daily. Event-shaped, urgent, read over a week.
- **Loss of forest** is annual satellite analysis of tree cover loss. One new
  figure a year, each April. Structural, cumulative, read over decades.

Stacking them on one page implies a causal link neither dataset establishes.
Worse, a FIRMS detection is a thermal anomaly rather than a confirmed fire, and
in Punjab and Haryana in October it is very often crop residue burning, which is
a different story again and arguably a third situation later. The fire slide on
the `/now` board says exactly that, in the interface.

**The real argument for splitting them is the clock**, and it is also the test of
the template: one situation moves in days and the other in years. Both are on the
`/now` index and both render through the same component without modification. The
scrubable year series on the Air page is the same component the forest loss page
would use for its 2001-to-2025 series; the fire page uses the same rail and band
counter that the hourly air reading does. If one page shape holds a weekly clock
and an annual one, the template is right, and it does.

## 10. Measured against modelled

The reference dashboards the client sent both fail the same test: a modelled
figure ("Rs 3.9 crores economic impact", a source apportionment, an AI narrative)
is set at the same visual weight as a measured one. That is how a guess acquires
authority, and Swechha's own schema already forbids it in principle by requiring
every figure to name its source.

The design solves it with four independent signals, none of them colour:

| | Measured | Modelled |
|---|---|---|
| Family | Archivo, tabular | Newsreader **italic** |
| Rule | solid | dashed |
| Mark | square | circle |
| Ink | `--ink` | `--ink-2` |

The word "Modelled" is never abbreviated away. On the Air page the two sit side
by side under the heading "Who is in it?": 1,441 schools within five kilometres
of a monitor above 400 (a count, from two published registers) against 1.93
million people likely exposed (a Census projection multiplied by a plume
estimate). A reader can tell which is which without reading a word.

The same treatment covers the source apportionment (37 / 31 / 17 / 15) and the
72-hour forecast.

**The forecast slot ships empty.** Swechha does not forecast air quality and the
page says so, with the date it last checked for a feed. The board carries a
toggle showing the populated design beside the empty one, so the studio can
build both, but the default is the honest state.

---

## 11. Caveats in the interface

Global Nature Watch puts "Tree cover loss is not always deforestation" in the
legend panel rather than in a methodology page. That is the same discipline as
marking a modelled figure differently, and this design has an equivalent:

> **A monitor reading is not an exposure.** The index describes the air at one
> instrument at one hour. What a person actually breathes depends on where they
> are, how long they are outside and how high off the road they sleep.

It sits above the reading, in mustard, because a caveat is Swechha speaking and
not an instrument reporting. Every situation page needs one. **The fire page's
caveat is already written and it is the important one:** a FIRMS detection is a
thermal anomaly, not a confirmed fire, and in Punjab and Haryana it is very
often crop residue rather than forest. Active fire detections and annual tree
cover loss are two different datasets on two different cadences, and a page that
stacks them implies a causal link neither establishes. On the Air page the
equivalent trap is handled the same way: the year grid's provenance box states
that the station network grew from six monitors to thirty-six, so a rise in the
count can be a rise in coverage, and Swechha publishes the unadjusted number
with its caveat rather than an adjusted number that would itself be a model.

---

## 12. Permanent record pages

Every reading currently disappears when it updates. It should not.

**Each day's reading keeps its own address.** `/now/air/2026-08-19` renders the
same rail component, frozen: value, unit, band, the limit it was judged against,
the multiplier, the source, the hour, the state it was in. Plus a single line of
context ("sixth consecutive morning above 300") and links to the day before and
the day after. It is one template and it is the template already on the boards.

That gives roughly nine thousand four hundred pages per situation, each of them
a specific, citable, linkable fact. `/now/air/2026-08` is the month, which is
the year grid at one month's scale. `/now/air` is the live page.

The relationship to the slider is simple: **the slider is the present tense of
the same object.** The homepage shows today, `/now` shows today across all
situations, the situation page shows today plus the dataset around it, and the
record page shows any other day in exactly the same component. Nothing new gets
designed.

---

## 13. SEO, specifically for this design

Not generic advice. What this design implies:

- **The record pages are the asset.** Thousands of pages each answering a
  specific dated question with a source attached. That is what "Delhi AQI on 3
  January 2026" looks like as a URL, and it is the only kind of page an
  environmental journalist links to.
- **Structured data on the readings.** Mark each reading as a `Dataset` /
  `Observation` with `variableMeasured`, `unitText`, `temporalCoverage` and
  `creditText` naming the source. Indexed as data rather than as decoration.
  `Article` with `dateModified` and `citation` on the situation pages.
- **Per-situation pages rank for what people type.** "Yamuna pollution today",
  "Delhi AQI now", "is it safe to go outside Delhi". The situation page with an
  explainer block per measure ("What AQI actually is", with a real number
  against the limit) is the page that answers those, and explainers are
  evergreen where a reading is not.
- **The Our World in Data credibility cluster, which is cheap and works.** Every
  situation page carries a first-published date, a last-revised date, a "past
  versions" link, a "cite this page" link and an explicit reuse licence. That is
  on the Air board already. It is the front door to being linked, which is worth
  more than any keyword work.
- **Next.js static generation already gives you the mechanics.** Record pages
  are `generateStaticParams` over the archive; the live pages revalidate on the
  feed cadence.
- **The launch blocker.** Roughly 165 legacy WordPress addresses still have no
  redirects. Ship without a redirect map and the existing ranking goes to zero
  on day one, and no amount of new structured data recovers it inside six
  months. This is the highest-priority item in the whole plan and it is not a
  design task.

---

## 14. The thing nobody costs: an automated tracker is an editorial commitment

The court and policy tracker on the Air board is compiled weekly. If it stops
for three months it damages trust more than never having built it, because a
list with a stale "last compiled" date is a public statement that the
organisation lost interest.

**Minimum sustainable cadence: weekly for orders, monthly for policy.** Two to
four hours a month of somebody's time, which is a real line in a budget and not
a rounding error.

**What happens when a source goes quiet** is a design question and it is
answered on the board: the compilation date is printed at the top of the
section, in the interface, not in a footer. If a week is missed the line says
so rather than showing older entries as current. The filter's empty state reads
"No order under this theme since the tracker opened. That is a finding, not a
gap, and it stays on the page." A design that shows "last updated" honestly is
the one that survives its own neglect.

The same applies to the DPCC Yamuna figures. If nobody is going to type six rows
a month, cut the Yamuna to a quarterly figure rather than shipping a dead live
number.

---

## 15. Watch your ward

The highest-value recurring-visit feature on the table, and it is not designed
as a feature anywhere in the current plan.

Nobody visits a record every morning. **Send it to them.** A person picks the
ward they live in and gets one message when the monitor nearest it crosses the
limit, when an order lands about it, or when a draft notification they objected
to is closing. That converts a passive archive into a service, and a subscriber
is a returning user forever.

It has a designed slot on the Air board, in the mustard band, marked as not
built. It should be the first thing built after the situation pages.

---

## 16. What I would build first

In order, and the order is the argument.

1. **The redirect map for the 165 legacy addresses.** Not design. Blocks
   launch. Everything else is worthless if organic traffic goes to zero.
2. **The token swap and the type scale.** Ten colour values and nine type
   classes in `app/globals.css`, self-host Archivo and Newsreader. Half a week,
   and it is the change the client will see first.
3. **The rail component and the situation component.** Everything else on the
   site is assembled from these two. Build them once, properly, including the
   measured-versus-modelled variants and all three feed states.
4. **The schema changes, both small.** `limit` and `limitUnit`, with breach
   derived, which unlocks the red rule and the multiplier at the same time. And
   the validity window (`windowStart`, `windowEnd`, `recursAnnually`), which
   makes the active list compute itself and lets `status` be derived too.
5. **The homepage.** Hero, statement, journeys, work index, timeline, impact,
   farm, record, give.
6. **`/now`, wired to the two live feeds and the four periodic ones.** With the
   configuration coming from the backend rather than a control.
7. **The Air situation page**, as the template. Then Yamuna, which has the
   strongest national dataset and Swechha's own twenty-six-year record to lay
   over it. Then Forest Fire and Loss of Forest, which are two situations and
   which between them prove the template holds a weekly clock and an annual one.
8. **Record pages and the archive of readings.** The SEO asset, and it costs
   almost nothing once 3 and 4 exist.
9. **Watch your ward.**
10. The court and policy tracker, only once somebody has agreed in writing to
    compile it weekly.

The drawn line, the archive contact sheet and the DIY bank are all worth doing
and none of them is on the critical path.

---

## 17. What I most want argued with

**One.** The instrument sits on cream even when a reading is severe. It keeps
the warmth the client asked for and it matches their own references, and the
cost is real: a severe day is less frightening than it would be on black. I
think the multiplier and the 269px numeral carry it, and I would rather be told
now than discover it in November.

**Two.** Green is restricted to past-tense recovery and is therefore absent from
almost the whole site. There will be pressure to use it for "hope", for the
Farm, for the nursery, for anything living. Every one of those uses would be
defensible on its own and collectively they would destroy the rule, and once
green means "nature" it can no longer sit next to a number.

**Three.** There is no global LIVE badge anywhere, and four of six situations
will be labelled "Periodic" at launch. That is honest and it is less impressive
than a dashboard that says LIVE at the top. I think the honesty is the product
and the moment it is traded away the site is just another dashboard, but it is a
genuine trade and the board should make it with its eyes open.

---

*All readings on all four boards are sample values standing in for the live
feed, and each board says so on the page. Photographs are placeholders from the
existing library; several files in `public/images/photos/` have known rotation
and provenance problems flagged in the 19 August direction document, and none of
those is used here.*

---

# Revision note, v3

**19 August 2026, later the same day.** The client saw the four v2 boards and
rejected them: *"I had liked Option A and Option C, primarily for it to be black
and white website, bold copy. This current design looks too blank. I like the
copy and data architecture, but not the visual design."*

That is a rejection of the printing, not of the thinking. v2 stays in
`public/design/v2/` for comparison. v3 is the same site printed on a
different ground:

| | |
|---|---|
| Homepage | `public/design/v3/home.html` |
| Environmental Intelligence | `public/design/v3/intelligence.html` |
| One situation in full | `public/design/v3/situation-air.html` |
| The system sheet, now with a components panel | `public/design/v3/system.html` |

## What did not change, because the client signed it off

Their words: *"I had liked most of the things mentioned in the system document
with regard to fonts, colours/hues and photographs. Also had liked the copy all
through."*

So all of this is carried across untouched: the type scale and its 14.9:1
display-to-body ratio and three empty octaves; the three hues and the
three-tense grammar; the band rule; the rail and its two states; the multiplier;
the six-cell band counter; the selective-colour treatment and the
band-derives-the-hue rule; the validity window and its out-of-season state; the
slider and the 3 / 6 / 9 configuration control; measured versus modelled; the
caveat line; the byline and citation block; both backend requirements; and every
line of copy.

## What changed: the ground

1. **Dark leads and alternates.** The page ground is `#0D0D0B`, with `#151512`
   as the alternate band. Paper is now reserved for long reading: journeys,
   explainers, the timeline, the orders index. This reverses the v2 ruling, and
   it reverses it for a good reason the client found by looking at a built page.

   It also removes a problem I had flagged. In v2 the ground never went dark on
   a breach, because in Delhi winter a breach is the normal state and the hero
   would have been dark for months. **Now dark is the default, so severity is
   not signalled by the ground at all.** The rail, the multiplier, the band
   counter and the verdict word carry it. That is a cleaner system than the one
   I argued for, and the client got there first.

2. **The hero is a full-bleed photograph with the reading set over it.** Not a
   giant number on flat ground. Every situation now carries a frame, which
   answers "photographs too small or absent" in the same move that fixes the
   hero. Text over photography uses the **bounded** dim ramp that already exists
   in the filter set, never the open one, plus a two-axis scrim.

3. **Texture is everywhere.** Grain on one fixed pointer-events-none layer over
   the whole document from a single 140px tile at 5.5% opacity. Halftone on
   photography as a radial-gradient dot screen composited **normally**, which is
   Direction C's solution: for a pure black pattern `mix-blend-mode` is visually
   identical, materially more expensive, and stops compositing reliably once
   several halftoned frames are on screen.

4. **Density.** Section padding drops from `clamp(58px, 8vw, 124px)` to
   `clamp(44px, 5.6vw, 88px)`. A situation ticker carrying all seven current
   readings sits directly under the hero. The work index frames are larger and
   closer together. Type did not get bigger: 14.9:1 was already right, and
   blankness was never going to be solved by enlarging it.

## The hues, held exactly

The client then said: *"Keep the mustard, red and green intact."* Every value in
v3 is lifted from `app/globals.css` rather than re-picked for the dark ground:
mustard `#E1A32B` (8.78:1), the severity red `--sev #F1484E` (5.35:1), green
`--signal-nature-bright #5FBE85` (8.51:1). On paper: `--mustard-ink #8A6410`,
`--signal-critical #c81e3a`, and green darkened to `#1F6B45` because the base
`#2e7d4f` measures 4.43:1 and fails AA, which follows the file's own
`-ink` convention. `--paper-2` was tuned to `#F1ECDE` precisely so that every
hue still clears AA on it.

**Green now actually appears**, which was a fair criticism of v2, where it was
so tightly restricted it was nearly absent. On a dark ground it has room: the
Recovered tag, the impact figures and their labels, the sup on `6,890`, the
recovery button, and the one restoration entry in the timeline.

## The hues in the interface

Then: *"use of these colours for buttons etc"*. Mustard was always the
interactive colour, because "second person, a human act" is the definition of a
button. v2 simply failed to show it. v3 states it and builds it: primary
buttons, links, hover, active, focus rings, the Give chip, filter chips, form
submits and the configuration control are all mustard.

**Red stays out of controls.** A red Give button teaches a reader that red means
"click me", and three screens later red has to mean the river is dead. The one
exception is a form field in an error state, which is not a control being
coloured but a reading of one: the field is out of limit.

**Green reaches the interface where the interface is about recovery**: the
Recovered tag, the impact labels, and a secondary button that leads to what came
back. Still past perfect, so the rule holds.

The system sheet now carries a **components panel rendered twice, once on each
ground**, with the token named beside every item: buttons (primary, secondary,
ghost, recovery, disabled), inline and standalone links, tags, feed-state marks,
form fields including search and an error state, focus rings, and the slider
controls as components rather than only in situ. Feed state stays carried by
**shape**, never hue. The primary button inverts its focus ring, because a
mustard ring on a mustard button is invisible.

## The drawn line is cut

*"remove the handdrawn sketch in journeys, its abrupt, at best you can use the
one attached."* Removed from all three homes, not reduced. If it read as abrupt
where it was most justified it would read worse elsewhere.

**What replaces it: the cut-out spine.** The attached reference is the engine
timeline, and it is not an illustration: it is archive photography with the
backgrounds removed, floating on the ground, arranged down a vertical spine with
giant slab numerals for the years and condensed-caps headings beside each entry,
with selected duplicates repeated larger as flat single-colour silhouettes
bleeding off the edges.

We already owned most of it. **The spine is the rail. The years are the readout
role.** Nothing new was invented; two existing components were pointed at a
third job. It is the connective device across Journeys, the twenty-six-year
timeline and How Change Happens, and it is a strictly better answer than a
drawing for an organisation whose whole claim is that it keeps evidence.

**Named colour rule: mustard silhouettes on an ink spine.** The reference uses
red for both and we cannot. Red means a published legal limit has been broken,
so a red silhouette behind a history section is decorative red, which the
grammar forbids outright. A timeline of what Swechha and its people did is
second person made past, a record of human acts, and mustard is the hue for a
human act. It also puts mustard back into the site at scale, which the client
separately said was missing. Green is used only where an entry is genuinely
restoration. Red never appears in this device at all.

**Production requirement, stated because it is a real cost.** Cut-outs need
frames whose subject separates cleanly from its background: a tractor, a single
figure, a sapling, an animal, a tool. They are delivered as transparent PNGs
from the archive, not produced in CSS. These boards stand in with `clip-path`,
which is honest about the silhouette but cannot cut around an arm.

**When no clean cut-out exists** (a crowd, a landscape, a scanned poster, and in
twenty-six years there will be many) the entry is never skipped and never gets a
bad cut-out. It keeps a plain halftoned square frame and is meant to read as
different. The 2007 row on the homepage is that case, deliberately.

Journeys, which lost the line, gets a rack of four large halftoned frames
instead: the same fix as the hero, applied again.

## Build order, unchanged except for two entries

The order in section 16 stands. Two changes: the token swap now includes the
dark-led ground and the grain and halftone layers, which is still half a week;
and "the drawn line" comes off the list entirely, replaced by **cut-out
production**, which is an archive and retouching task rather than a front-end
one and should be quoted as such.

## What I most want argued with, revised

The three questions from section 17 are settled: the client chose the dark
ground, chose to keep all three hues, and asked for them in the chrome. What is
left to push back on is narrower.

1. **The halftone is on every photograph.** It is the strongest single move in
   v3 and it is also the most destructive one: a busy mid-tone frame turns to
   mud under a dot screen, and roughly half the current library will need a
   bespoke crop or a per-image contrast override. The hook exists
   (`--ht-contrast`, `--ht-bright`). Budget a day with the library.
2. **Mustard silhouettes are a large amount of one hue on a page about
   history.** It is defensible under the grammar and it is loud. The safest
   alternative is flat black or flat paper silhouettes with no hue at all, and
   it is a one-line change if the board hates it.
3. **Paper survives only as a long-reading ground.** Four bands out of eleven on
   the homepage. If the client reads that as having lost the warmth entirely,
   the fix is to promote Journeys and the timeline to full-width paper sections
   rather than to lighten the dark.

---

# Revision note, v3.1

**19 August 2026, later still.** Client verdict on v3: *"Much better, needs a lot
of improvement,"* and *"of course design language is fine."* Everything below is
correction inside the approved language. Revised in place in
`public/design/v3/`; there is no fourth folder.

Seven boards now:

| | |
|---|---|
| Homepage | `public/design/v3/home.html` |
| Environmental Intelligence, the index | `public/design/v3/intelligence.html` |
| Air, a full situation page | `public/design/v3/situation-air.html` |
| Yamuna, a full situation page | `public/design/v3/situation-yamuna.html` |
| Situation with no page yet | `public/design/v3/situation-soon.html` |
| About | `public/design/v3/about.html` |
| The system sheet | `public/design/v3/system.html` |

## The two bugs

**The rail was responsively broken and the client's diagnosis was right.** The
red sat on `.rail-r` as a `border-left` while the left column was pinned to
`--lw:56%` of the container and the numeral scaled on `clamp(6.2rem, 21vw,
17rem)`. Two independent systems, so they drifted; below the breakpoint the
border became a `border-top`, which is why mobile looked correct.

I tried the shrink-wrap fix first and **it could not be made deterministic.**
Taking every non-numeral child out of intrinsic sizing with `width:0` +
`min-width:100%` still leaves the percentage min-width contributing, and
measurement showed the overlap swinging from `-0.114em` at 900px to `-0.140em`
at 1920px: a gap, and a drifting one.

So the mechanism is inverted. The column is a fixed share, the **numeral** is
positioned against the rule rather than the rule against the numeral: the
readout is right-aligned in the column and pulled back over the rule by its own
right padding plus `.28em`. **Measured overlap is now exactly 0.280em at 900,
1024, 1280, 1440 and 1920 on all three pages that carry a rail**, and the layout
stacks below 860 as before. 375, 430, 600 and 768 were checked too and stack
correctly. No horizontal overflow at 375, 768, 1280 or 1920 on any of the seven
boards.

The cost, stated plainly: the left column is now right-aligned against the
spine. It matches the references, which hang everything off the rule, and it is
the only version of this that is exact at every width.

**Stale v2 hrefs.** Swept. The air slide's link, two of the three record doors
and the whole air page were pointing at `/design/v2/`. Zero `design/v2` strings
remain in v3, and every internal link resolves to a file that exists.

## The structural fault, which was worse than a duplicated hero

The index was carrying **per-situation deep content**: air's year grid and the
Yamuna's station table both lived on `intelligence.html`, and the homepage sent
people to `intelligence.html#h-air`, an anchor on a *slide*. So a reader landed
on the air slide, scrolled, got air's year grid, and walked into the Yamuna
section. "Yamuna section is in air section" is a fair description of what the
page did.

Fixed structurally, not cosmetically:

- **`/now` is an index and nothing else.** It opens on the state of the board,
  not on Delhi air: *"Six situations, four of them illegal"*, with counts for in
  window, in breach, live feeds and what changed overnight. Then the slider, the
  seasonal window table, and only the genuinely cross-cutting sections: the
  orders feed, the sources-and-cadence table, and why the page goes red. **No
  deep per-situation sections remain.**
- **The air year grid moved to the air page.** **The river's oxygen section
  moved to a new Yamuna page**, which also carries its own persistent side panel
  of stations north to south, its own caveat, its own byline and citation block.
- **Every situation has its own address.** The slider's per-situation link now
  goes to `/design/v3/situation-<id>.html`. Air and Yamuna are built; the other
  seven point at `situation-soon.html`, a designed not-built-yet board that says
  what a situation page carries and lists all nine with their state. Nothing
  outside a page links to a slide anchor any more; the `#h-` anchors survive
  only as the slider's internal state.

## The air page's depth

Added, all inside our own language rather than VAYU's:

- **A persistent side panel of national data**, sticky beside every analytical
  band rather than sitting in one section, so the local reading is always
  legible against the country it sits in. Eight cities ranked, red for
  over-limit values, a mustard rule marking the two stations Swechha samples
  independently. The Yamuna page has the same component pointed at river
  stations.
- The year grid, moved here from the index.
- Consequence before measurement, source attribution as a modelled contributor
  breakdown, the forecast with its uncertainty band and its empty state, the
  ward map with layer control, the year scrubber, explainers per measure, and
  the measured-versus-modelled distinction: all already built in v2 and all
  retained.

## The seven changes

**3. Photographs are black and white, full stop.** `sig-r`, `sig-g` and their
`-dim` variants are gone from every image on the site. The photo system is now
two ramps: `duo` on open ground, `duo-dim` under type. This is a real
simplification, and it is worth naming what it costs and what it buys. It ends
the per-image decision at ingest, which was the one thing that would have decayed
across a twenty-six-year archive. It does not weaken the three-hue grammar,
because that grammar never depended on the photographs: hue now lives only in
type, data, marks and controls.

**4. Halftone on heroes only; grain deleted.** The dot screen is scoped to
`.ht.scrim`, which is the full-bleed heroes and nothing else. Every other frame
is clean monochrome. The page-wide grain layer is removed entirely, which also
removes the only fixed compositing layer on the site.

**5. Cream is now off-white and used sparingly.** `--paper` is `#F3F2F0` and
`--paper-2` is `#ECEBE8`, tuned so mustard-ink, the paper red and green-ink all
still clear AA on both. Off-white is reserved for long reads and for breaking a
long dark scroll. It is relief, not a second ground.

**6. Journeys is one section.** The statement and the four-card rack were
reading as two unrelated things. They are now a single full-bleed band: one
photograph, "A number is not a smell" as the headline, the argument beside it,
and the four routes as a rack inside the same frame. The separate paper band is
gone.

**7. Impact is a strip.** Four full-height rail rows became one horizontal strip
of four numerals, still at `clamp(2.3rem, 5.2vw, 4rem)`. The type does the work;
the height does not.

**8. Farm and Green the Map are separate sections.** Farm is full-bleed
photography with the reading-room voice. Green the Map is a contained, lighter
off-white section that says in its own copy that it is a different organisation
with its own site and accounts. This builds the 18 August ledger ruling that had
been sitting unbuilt.

**9. About is rebuilt** as `about.html`, in this language throughout: full-bleed
photographic hero, "Of one's own free will" at display scale, a full-bleed
statement band, the cut-out spine for the twenty-six years, a people band, the
impact strip, and a governance section that is deliberately plain because an
organisation asking people to trust its numbers has to be legible about itself.

## What I deliberately did not change

- **The type scale.** 14.9:1 and the three empty octaves are untouched. The
  blankness complaint was answered with ground, photography, texture and density,
  never with more size.
- **The three hues, their grammar and their values.** Still lifted from
  `app/globals.css`, still one job each, still the band rule, still red out of
  every control except a field in an error state.
- **The rail's meaning, the multiplier, the band counter, the validity window
  and its out-of-season state, the slider and the 3 / 6 / 9 control, feed state
  as shape, measured versus modelled, the caveat line, the byline block, both
  backend requirements, and every line of copy.**
- **The cut-out spine**, including its mustard-silhouettes-on-an-ink-spine rule
  and the no-clean-cut-out fallback. It now appears on the homepage timeline and
  on About.
- **`situation-soon.html` is not a stub with fake data.** Filling eight
  templates with invented readings would have looked like eight finished pages
  and would have been a lie about what exists. One honest board is better.

## What I would still argue about

1. **The right-aligned reading column.** It is the price of an exact rail and I
   think it is worth paying, but it is the most visible change in this revision
   and the board should look at it directly.
2. **Only two of nine situations have pages.** That is the honest state, and the
   not-built-yet board makes it explicit rather than hiding it. If the client
   would rather ship nine thin pages than two deep ones plus a placeholder, that
   is a legitimate call and it is theirs.
3. **Off-white is now four bands out of eleven on the homepage.** If that reads
   as having lost the warmth, promote Journeys and the timeline to full-width
   off-white rather than lightening the dark.

---

## The logo is a permanent asset (20 August 2026)

The approved horizontal lockup — the circular leaf mark plus the SWECHHA
wordmark, 2048×512 — is the project's permanent brand asset. Client instruction,
20 August: bring it back and make it permanent.

| Ground | File |
|---|---|
| Dark | `public/brand/swechha-horizontal-white-approved.png` |
| Paper | `public/brand/swechha-horizontal-black-approved.png` |
| Large print / retina | `public/brand/swechha-horizontal-white-approved-6667.png` |

**Rules.** It is never re-set as live type, never redrawn, never substituted, and
never recoloured beyond choosing the white or black cut for the ground it sits
on. Header renders it at 30px tall, footer at 42px; width is always auto. It
carries `alt="Swechha"`, and where the link wrapping it has no other text the
link takes `aria-label="Swechha"`.

The v3 boards had been setting the wordmark as Archivo type in the `.mark`
class, which is what this replaces. The Next.js app already used the correct
asset in `components/site-header.tsx` and `components/site-footer.tsx`.
