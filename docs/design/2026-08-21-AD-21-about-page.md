# AD-21 — the About page

**Built 21 August 2026.** `public/design/v3/about.html`, from
`scripts/build-about-page.mjs` (`npm run build:about`), on the frozen language in
`BRANDING-2026-08-21-frozen-language.md` and the shell in
`scripts/lib/situation-shell.mjs`. Seven bands. The page it replaces is the
20 August prototype of the same name, which FINAL.md §5 lists as "Prototype,
outside this work" and which was stale in four ways (below).

Measured with CDP `Emulation.setDeviceMetricsOverride`, device scale 1, at 320,
375×812, 375×635, 390, 414, 560, 768, 901, 1024, 1280, 1440×900 and 1920.

---

## 1. The concept, in one paragraph

Every other page on this site measures something in the world against the limit
somebody published for it, and where the record has a hole it leaves the hole
showing. An About page is normally where an organisation stops doing that. This
one does not get the exemption: it is the same argument turned to face inwards.
An organisation whose **name means "of one's own free will"** should be the most
legible object on its own website — so the page states what Swechha says it is
in Swechha's own words with the source named, names every person who does the
work and every person who governs it in **their** own words, and publishes what
is checkable about the institution **with the holes still in it**.

## 2. The band sequence, and the ground chain

| # | band | tier | ground | 375×635 | 1440×900 |
|---|---|---|---|---|---|
| 1 | `#top` masthead over a halftone crowd | t1 | `#0D0D0B` | 958.5 | 842.8 |
| 2 | `#says` what we say we are | t2 | `#F3F2F0` | 1,819.4 | 1,592.2 |
| 3 | `#since` the record since 2000 | t2 | `#0D0D0B` | 1,537.6 | 1,439.7 |
| 4 | `#team` who does the work | t3 | `#ECEBE8` | 1,777.5 | 3,045.1 |
| 5 | `#board` who governs it | t2 | `#F3F2F0` | 1,403.1 | 1,281.6 |
| 6 | `#legible` the boring and necessary part | t2 | `#151512` | 1,335.7 | 1,525.8 |
| 7 | `#act` turn up | t3 | `#0D0D0B` | 606.3 | 653.1 |
| — | footer | — | `#151512` | — | — |

**Zero ground clashes**, checked mechanically on the declared hex at build time
and refused-on-fail. Document **10,269px at 375×635** and **10,860px at
1440×900** — the frozen homepage is 10,125 and 10,852, so this page costs about
what the homepage costs.

**Hue.** Green is live in `#since` only, on the one rung that is not a dated
event, because green means what Swechha has done (§3.1). Mustard is on controls
only. **No red anywhere** — there is no published limit on this page to break,
and a missing governance row is a *hole*, which has its own dotted marker.

**No state chip.** LIVE / PERIODIC / OUT OF SEASON / NO SEASON describe how a
*source* delivers readings. This page has no feed, so stamping it with a cadence
word would spend the site's most load-bearing vocabulary to say nothing.

## 3. The page's four figures are counted, not typed

The situation pages earn their headline by reading it out of committed JSON so a
page cannot disagree with its own source. The institutional equivalent, in the
hero register:

| figure | where it comes from |
|---|---|
| **8** | `ABOUT.team.length` |
| **8** | `ABOUT.governing_body.length` |
| **2** | the entries carrying `also_staff` |
| **2000** | sourced, and the only year on the page that is a claim about now |

Add a ninth colleague to `data/about-people.json` and the headline moves by
itself. **This was exercised during the build**: the governing body went from
seven to eight when the owner added Naveen Joshua, and no sentence was edited —
the register, the band lead ("Eight members, and two of them…") and the
governance row ("Eight members, every one of them named on this page") all
followed the data.

**No typed year count**, per §3.5. Two gates enforce it: the killed phrasings
outright, and — the distinction that actually matters — **every remaining year
count must be traceable to a quoted bio**. "Over 14 years of experience" is a
claim Nikhil makes about his own career, attributed as his words in the band's
lead; the page is not the thing asserting it. A year count *not* inside a quoted
bio is the page speaking in its own voice, and fails.

## 4. The people, and the rules applied to them

Names, roles and descriptions come from swechha.in's own Team and Governing Body
listings plus each person's `/profile/<slug>/` page, scraped 21 August 2026 into
`data/about-people.json`. The `profile` post type is not exposed on the WP REST
API (`/wp-json/wp/v2/profile` 404s), so they are parsed from rendered HTML.

- **The descriptions are theirs.** The build does not write a bio and may not
  edit one silently. **Three corrections** were made and every one is logged in
  the dataset's `corrections` array: `alumunus`→`alumnus`, `Tata Institute of
  Social Studies`→`Social Sciences` (the same bio set spells it correctly three
  times elsewhere), `State Departement`→`State Department`.
- **Bios are collapsed** into the frozen `.dx` disclosure, in both people bands.
  Not a style choice: fifteen bios run to ~11,000 characters, and left open the
  two bands measured 4,036px and 3,750px at 375 — together more than half the
  document. Same component, same behaviour, both bands, every width.
- **Only `@swechha.in` addresses are published.** Three board members list
  personal Gmail addresses on the live site; those are held in the dataset as
  `publish:false`, a build gate refuses any non-institutional address, and a
  post-write gate re-checks that none reached the HTML. Republishing a private
  address on a new site is the owner's call, not the build's.
- **Team carries photographs, the governing body does not, and that is a
  sourcing fact.** The eight team frames exist as originals of 745–4032px,
  committed under `/images/people/` downscaled to 900px. The seven board frames
  exist **only at 338–580px** on the live site, below this site's standard, so
  they are not committed and not rendered — the reason is recorded in the
  dataset's `photo_policy` so a later session does not "fix" it by upscaling. A
  governing body reads as a register in any case.
- **The two who are both cross-link instead of repeating.** Printing Vimlendu's
  2,255 characters and Ashim's 1,198 twice would add 3,453 characters of
  duplicate reading and — in Ashim's case — **print two different job titles for
  one person on one page**, because the live site's two copies of his bio
  disagree. The cross-link is also the honest way to surface a real governance
  fact rather than let a reader discover it by noticing a name twice.
- **The photographs take the site-wide monochrome ramp** (`class="duo"`). Eight
  frames shot on eight different days in eight different lights is precisely the
  case the ramp exists to hold together, and read at 1440 it works: the band
  reads as one set. Cropped `50% 28%` — high, because these are candid frames
  and the faces sit above the centre line in most of them. Read off a contact
  sheet, not assumed.

## 5. What is checkable, and the two holes

Six rows and two holes. **Five of the six are not new claims** — they are the
sentence that already runs in the footer of every page on this site, given a
page where they can be read. The other two came from the owner on 21 August:

| row | value | from |
|---|---|---|
| Registered as | **Swechha We For Change Foundation** | the Executive Director |
| Where | Khirki Extension, New Delhi | the footer |
| Working since | 2000 | the footer |
| Tax exemption | Sections 12A and 80G | the footer |
| Foreign contributions | **FCRA held** | the Executive Director |
| Governing body | Eight members, every one named on this page | counted |

Holes, on the dotted placeholder marker (§4.1 — dotted, not dashed, which means
a shut window and is a different statement):

1. Registration number and the year it was granted.
2. Annual reports and audited accounts — *"When they are, they belong here as
   files, not on request."*

Plus a third hole in the board register: **Naveen Joshua's description**. He was
named by the owner, is not on the live site's listing at all, and has no profile
page. The row exists anyway — leaving a governing-body member off the page to
avoid an empty cell would be the worse lie — and the gap is a sentence, not a
blank. A build gate requires every board row to be in one of exactly three
states: a bio, an `also_staff` pointer, or an admitted `bio_pending` hole.

## 6. Defects found by measuring, and fixed

Every one of these was found by reading a measurement or a capture, not by
reading the code.

1. **`.dx-s` is light-on-light on `paper-2`: 1.41:1 against a 4.5:1
   requirement, on eight rows.** `SHARED_PAGE_CSS` states the disclosure
   summary's ink for dark and for `.paper` and stops there; every other paper
   component in that file is written `.paper X,.paper-2 X`. **This is a defect in
   the shared shell**, not in this page — it was simply waiting for the first
   page to put a disclosure on the second paper. Repaired locally (`.paper-2
   .dx-s`) rather than in the shell, because seven signed-off pages build off
   that string and a concurrent session owns them. **See §8.1 — the shell fix is
   one selector and somebody should make it.**
2. **Board roles were 1.51:1 on paper.** The first draft borrowed Air's
   `.p-do-r` row for its rule and padding, and `.p-do-r .lbl{color:var(--fg-2)}`
   is two classes — it beat this file's one-class `.a-b-r`. `.p-do-r` is a
   **dark-ground** component that states no paper ink; borrowing it onto paper is
   borrowing the wrong half of a component. The row now carries its own rule.
3. **A grid track 106px past the gutter that the overflow gate could not see.**
   At 768, `.a-hero` declared `grid-template-columns:1fr` and the track resolved
   to **821.80px inside a `.wrap` of 715.78px**. It did not register as document
   overflow because `section` carries `overflow-x:clip`, so `scrollWidth` still
   equalled `innerWidth` and **every width in the sweep reported clean while the
   content was quietly cut off**. `1fr` is `minmax(auto,1fr)` and auto is
   min-content. All 27 tracks are now `minmax(0,1fr)`, which is the house style
   in `situation-shell.mjs` for exactly this reason, and a build gate refuses a
   bare `1fr`. **A second browser check was added — content wider than its own
   `.wrap` — because the standard overflow check is blind to this class.**
4. **The nav lit the wrong chapter.** The history band was called `#record`, and
   the frozen active-section observer matches band ids against nav hrefs — so
   **RECORD stayed underlined while the reader was in About's history**, pointing
   at the homepage's archive. §5.10 calls that worse than lighting nothing.
   Renamed to `#since`, and a gate now refuses any band id that collides with a
   nav word (`work`, `journeys`, `impact`, `farm`, `record`).
5. **Ten touch targets under the 24px floor.** Eight standalone email addresses
   at 15.5px took AD-09's hit expander — the box the finger hits grows, the drawn
   box does not, so the 2px mustard underline stays on its baseline and no band
   moves. Two cross-links were 20px *inline in prose*, where an expander would
   steal the taps of the line above; they were **restructured into standalone
   `.act` controls** instead, which inherit the frozen 44px expander. Precedent
   would have covered leaving them (5 of 7 inline `.lk` on the signed-off Yamuna
   page measure 14–19px) — a real control is simply better.
6. **The phone budget.** The two people bands measured 4,036px and 3,750px at
   375. Fixed by the standing rule — never solve a mobile problem by making type
   bigger, solve it by **cutting the frame**: below 640 a person is a ruled
   register row with a 112px portrait, opening to 230px at 640 and a two-up 5:4
   at 1100. The bio is the same disclosure at every width; **nothing is hidden on
   the phone that is shown on the desktop.** Bands became 1,777px and 1,403px and
   the document went from 14,819px to 10,269px.
7. **Read off the 1440 captures, not the DOM:** "8 people." and "7 members. 2 of
   the 7…" read as data entry rather than prose — counts are now spelled when
   they open a sentence and stay numerals in the register, where a figure is the
   point. The fourth register label ran to three ragged lines and its caveat
   moved to the note beneath. "From stated by the Executive Director" was
   ungrammatical — the provenance strings now read after "From". And the closing
   doors capped their caption at 46ch, leaving ~500px of every row empty at 1440;
   they now use the same two-column ruled-row grammar as the legal and board rows,
   because this page has one kind of ruled row, not three.

## 7. Measurements, final

| check | result |
|---|---|
| `scrollWidth === innerWidth` | **pass at all 11 widths** |
| content wider than its own `.wrap` | **zero**, all widths |
| contrast, every element with its own text against its composited background | **236 walked at 1440, 238 at 375 — zero failures** |
| touch targets under 24px | **zero**, 375×812 · 375×635 · 1440×900 |
| anchor landing, both paths | within **±0.5px of `--nav-h`** (−0.16 to +0.20) |
| skip link is tab stop 1 | **yes** — 11 stops before content, the frozen chrome's own shape |
| section index closed | `hidden`, **zero tab stops** |
| console | **silent** |
| build gates | **17, all passing** |

**One inherited condition, quantified rather than claimed fixed.** A focused
`.navscroll` chip scrolled flush to the row's right edge puts its 1.5px ring
0.19–1.66px past the container. **The frozen homepage does the same thing** on
one chip at −1.70px, so the mechanism is inherited chrome. Long labels made this
page meet it five times instead of once, and the labels were the half this page
controls — the chips are now short noun phrases (§5.10's own grammar: "the word
the page already uses for these six things"), which cut it to four. Closing it
properly means ~2px more trailing affordance inside the frozen component: the
shell owner's call, not this page's.

## 8. Open items — things somebody else has to decide or do

1. **The shell fix for defect 6.1.** `SHARED_PAGE_CSS`'s `.paper .dx-s` should
   read `.paper .dx-s,.paper-2 .dx-s`. One selector. It cannot change any page
   where a disclosure and `paper-2` do not co-occur, but it does change the bytes
   of seven built pages, so it wants a rebuild and a `verify:final` run by
   whoever owns them.
2. **The footer carries a wrong legal name on every page of this site.**
   `home.html:4183` reads "We for Change Foundation."; the registered name is
   **"Swechha We For Change Foundation"**. This page publishes the correct one.
   Not fixed in `home.html` here — it is hand-maintained by a concurrent session,
   and a legal name is not a thing to change in two places at once.
3. **`#says` is 1,819px at 375 against a 900px band budget, and `#since` is
   1,538px.** Stated with the arithmetic rather than quietly breached, per §10.4.
   `#says` is four quoted blocks on paper and paper is for long reading; the
   whole document still lands at homepage cost. If it should come down, the cut
   is the Wheel of Change list (six lines, ~260px) — it is the least load-bearing
   of the four.
4. **Ashim Bery's title.** The live site's two copies of his bio say "Director of
   Programs" and "Chief of Operations". The Team listing says Director of
   Programs and that is what this page uses. Confirm which is current.
5. **Farhad Vania's bio opens mid-sentence on swechha.in itself** — text is
   missing at the head of the paragraph. Published from the first complete
   sentence; **the lost clause is not reconstructed.** One line restores it.
6. **The live site's Governing Body listing is now out of date by one member** —
   it shows seven and there are eight.
7. **Nikhil has no surname anywhere on the live site** while every other person
   has one. Rendered as given.
8. **Naveen Pabla (staff) and Naveen Joshua (board) are different people.** Keyed
   by slug so nothing conflates them; worth knowing before anyone edits.
9. **Not built, because nobody asked and the footer already has it:** a contact
   band. The footer carries `info@swechha.in` and, since AD-08, the four verified
   social accounts. A second copy on this page is the drift the shell pattern
   exists to prevent. Note `2026-08-21-SOURCE-FACTS.md` still says the frozen
   homepage contains no social links — that was true when written and AD-08
   superseded it.
10. **The scrolled-capture trap is real and cost time here.** On this page,
    screenshots taken after a programmatic scroll came back uniformly `#0D0D0B`
    while the DOM reported the correct band, ground and offsets at that scroll
    position — and `home.html` captured fine, so the harness was not broken. The
    reliable method is **capture at scroll 0 with the preceding bands set to
    `display:none`**. Trust the measurement over the capture when they disagree,
    and do not open a bug from a blank PNG.

## 9. Files

| file | what |
|---|---|
| `scripts/build-about-page.mjs` | the generator, 17 gates. `npm run build:about` |
| `data/about-people.json` | 15 people, provenance, `corrections`, `source_defects`, `photo_policy`, `email_policy` |
| `public/images/people/*` | 8 team portraits, 900px, 1.6MB total |
| `public/design/v3/about.html` | **build artefact — editing it is pointless, the change dies at the next build** |

The page is not in `verify:final`'s register (`scripts/verify-final.mjs`), which
covers the index and the six situations. Its 17 gates run in its own build
instead, and adding it to that register is a reasonable next step if About is
meant to be held to the same acceptance test as the finished set.
