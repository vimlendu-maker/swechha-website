# Homepage decisions — section-by-section pass, 20 August 2026

Client rulings taken live during the section-by-section finalisation. Additive to
`DECISIONS-2026-08-18.md`; where the two disagree, this file is later and wins.

Process: one section at a time, top to bottom, desktop (1440) and mobile (375)
side by side. Section order: hero → ticker → statement → journeys → work →
timeline → impact → farm → green the map → record → give → footer.

Review harness: `public/design/v3/_review.html` — both viewports in one pane with
a section jump and zoom. Added this session, along with the missing `#ticker` and
`#footer` anchors that the jump needs.

---

## Section 01 — HERO

### D-01.1 Mobile navigation: non-sticky chip row
**Asked twice.** The first answer was a hamburger drawer; the art director then
proposed an option that had not been offered — restore the six-link chip row but
make it **non-sticky**, so it sits under the header on arrival and scrolls away
with the page while only the 56px bar stays fixed. **The client switched to that.**

Why it wins: the mobile doctrine's objection was never to the row existing. It was
to a row that was permanently sticky (13% of an 812px viewport), clipped mid-word,
and had no affordance. Non-sticky answers all three and costs nothing at rest. The
drawer would have been the site's only modal pattern, and it buries the index
behind an icon on a page meant to read as an instrument rather than an app.

Accepted cost: once scrolled past, nav is reachable only by scrolling up or via the
footer. Give it the same 8px right-edge mask the hero's own tab row already uses.

Supersedes `mobileDoctrine`'s "The sticky nav loses its second row… One 56px row:
wordmark left, GIVE right." The 56px row stands; losing navigation with it does not.

### D-01.2 Halftone pitch scales with the frame
The dot pitch was fixed at 6px (4px below 700), while the frame runs from 746px at
1440×900 down to 154px at 375 — 124 dot rows against 38. At phone size the India
Gate dissolved into texture.

**Ruled: the pitch scales with the frame.** A halftone is a reproduction metaphor;
screen ruling is chosen for the reproduction size, and the dots read against the
subject, not against the screen. Dropping the treatment below a breakpoint was
rejected — the hero would be the one halftoned band that is not halftoned on the
platform most readers meet it on, and halftone-on-exactly-three-heroes is on the
closed list. The mobile frame is re-cropped at the same time: 38 dot rows can
describe a monument that fills the frame, not a plaza either side of one.

### D-01.3 The photograph is a masthead band, not a ground for the reading
The art direction's `hook` promised "a three-digit numeral standing over a
halftoned India Gate in the haze". The page has never done that, and the veil
arithmetic was quietly failing: three gradient layers scale off `vw` while the
frame scales off `svh`, leaving 176px of clean picture at a tall window, 110px at
1440×900, and **negative below a 790px window** — so a 13" laptop showed no
photograph at all.

**Ruled: keep the reading on solid ground and fix the arithmetic** — derive both
veils from the frame, hold a floor of 40% unveiled at every viewport. The
separation is why the reading survives a phone screen in daylight and why the
halftone can be as coarse as it is.

**Consequence: the `hook` line in `2026-08-20-art-direction.json` must be rewritten**
to describe the masthead band. The through-line does not permit the spec to
describe something the page is not doing.

### D-01.4 The deck is governed by validity window + severity, not by rank or by hardcoding
The spec said the deck's job was "today's worst broken legal limit". The build
hardcodes Air first — and Air is not the worst reading in it (412 against a limit
of 100 is 4.1×; Yamuna's dissolved oxygen is 0.0 against a minimum of 5.0, which
is not a multiple at all, it is an absence).

**Ruled, and it is neither option offered:** every situation carries a **default
date range**. That range governs two things — whether the situation appears on the
front end at all, and whether it leads — **combined with severity**. There is no
special preference for Air; Air simply holds the widest window, being the principal
landing situation, so in practice it usually leads.

This confirms **both** outstanding backend requirements at once (handoff open item
5), and neither is optional any more:
- a stored `limit`, so a breach is derived and never typed, and the multiplier
  comes free;
- a validity window — `windowStart`, `windowEnd`, `recursAnnually` — so the active
  situation list computes itself seasonally.

Neither exists in `lib/content/schemas.ts` today.

Consequences: the `job` line in `perSection[0]` must be rewritten to this. The
`YEAR ROUND` / `IN WINDOW` tags become **load-bearing** — they are the visible face
of the window, so the tag keeps a container (the dashed border becomes solid, since
dashed already means *a closed window* elsewhere in the file; it does not become
borderless). Ordering itself stays out of the static design file: `mark(0)` and the
fixed slide order are left alone, because this is a backend concern. Open question
not yet put to the client: how an absence (0.0 of 5.0) ranks against a multiple
(4.1×).

### D-01.5 One sentence may be cut below 560px
At 375 the hero was 806–811px against roughly 635px of actually-visible iOS Safari,
so the deck's controls sat below the fold on every real phone and a reader at rest
got no signal that Yamuna, Monsoon and Forest Fire exist.

**Ruled: cut the second sentence of the situation paragraph at ≤560 only.** ~96px
off every slide, bringing the hero to ~617px + 57px nav — one visible screen. The
clause that survives names the river; the clause that goes is arithmetic that
already appears in full on the situation page. Desktop and tablet keep the whole
paragraph.

This is a deliberate exception to the doctrine's "cutting copy is not the mobile
strategy — changing shape is". It is granted because no change of shape is left
here, and it is a **cut, not a rewrite** — the copy's voice is untouched.

### D-01.6 The mobile rail beats the doctrine that describes it
The written doctrine said the account column "drops below and is indented to the
rule's exact x-position". The build keeps the unit and multiplier beside the
vertical rule and drops the account block full-width beneath a hairline that itself
carries the breach state.

**Client deferred to the art director, which ruled for the build.** Indenting to the
rule's x would leave a 211px measure at 375 — about 26 characters a line — taking
Yamuna's paragraph from 4 lines to 9 on a band already over budget, and reducing the
six-band scale to six 32px cells. **Amend `mobileDoctrine`, not the code.**

### D-01.7 Open item 3 is signed off
The rail kiss is correct and the item is closed. Measured: 16.32px at 1440 on a
272px numeral, 5.95px at 375 on a 99.2px numeral — both exactly `.06 ×` the
numeral's own size, across a 2.7× scale range, and verified at 1024 and 768 too.
Because the rule starts at `left:100%` of a shrink-wrapped box it is geometrically
incapable of crossing a digit.

Three further handoff items were found already fixed and are struck: the hero is
825px not 1,029px; there is no 500px dead space left of the readout; the rail does
not evaporate at 375.

### Decided by the art director, no client input needed
Tab marker un-clipped **and de-reddened** (red on a control is forbidden by the
closed list; the marker becomes off-white, not mustard — the band's single mustard
act stays single) · decimal point given a digit slot so the account column stops
jumping 59.2px between slides · resting rail weight derived from the numeral as a
ratio rather than a 1.74:1 constant · `.s-hero-why` raised to body size at 62ch ·
season tags de-dashed · mobile provenance collapsed toward one line by dropping
", Anand Vihar" below 560 · situation identity moved above the unit at ≤860 · the
`1 of 4` counter moved to meet the tabs, closing a 726px void.

### Not to be "fixed"
`--s-hero-frame`'s 62px and 92px constants look like off-by-one errors against a
63px nav and a 79px bar. They are not. They produce the 12–13px of ticker visible
under the hero, which is the scroll cue. Leave them; a comment now says so.

---

## Process rulings

### P-1 Menu destinations are populated last
**Client, 20 August:** the nav links are wired only **after the entire homepage is
built and signed off.** Until then the chip row and desktop nav exist to be
designed and measured, not to be routed. Do not treat a link that goes nowhere as
a defect during the section passes, and do not spend a pass making them resolve.

Consequence: `intelligence.html` is currently the only real destination from the
header; the rest are in-page anchors. The dead `#h-waste` link the ticker review
found is a separate matter — it is a link that *looks* live and lands on the wrong
panel, which is a defect now, not a deferred wiring task.

### D-01.8 No location control in the hero — it moves to the situation page
**Client, 20 August:** *"We can keep my location etc features in the inner page of
the issue. Lets keep homepage hero about the location or issue the campaign
chooses."*

The hero stays a **single editorial choice** — the location or issue the campaign
has selected — not a queryable surface. Anything location-aware lives on the
situation page, where the reader has already opted into depth.

This kills the proposed three-tier cut (Delhi-NCR / India's hotspots / my
location) outright; it is not to be carried into the ticker or any other band. Two
arguments that had been raised against the hero version and no longer need
settling: the tiers mixed two different kinds of thing (the first two are editorial
selections, the third is a query), and a national tier sat awkwardly against a
masthead that reads DELHI. SINCE 2000.

Open, for the situation-page pass rather than now: how many of the nine situations
could actually answer a location query. Air and fire come from feeds with coverage
well beyond Delhi; the Yamuna reading is Delhi-specific and editor-entered; monsoon
and forest-loss are national or editorial. A control that answers two situations in
nine needs a deliberate design for the other seven, and the through-line requires
that a location with no data shows the hole rather than falling back to Delhi's
number.

### D-01.9 LIVE moves to the top right of the hero banner, and blinks
**Client, 20 August:** *"can it be kept on top right of Hero banner and blinking?"*

Granted in principle; the art director specifies the execution. The client also
described it as a **"button"**, which is a second finding: today it reads as
clickable as well as too quiet. Whatever replaces it must not.

The structural catch, which the client has not seen: the state chip currently sits
**inside** the slide because liveness is a property of the situation, not of the
page. Not every situation is live — some readings are editor-entered and carry
RECENT or DELAYED, and a closed window has its own dashed grammar. A fixed corner
now has to display a variable state as the deck advances. **A corner badge reading
LIVE over an editor-entered figure would be the single worst thing on the page**,
because the site's whole claim is that it never overstates what it knows; that
failure mode must be made structurally impossible rather than merely avoided.

Motion constraints: the dot animates, never the word; it must degrade under
`prefers-reduced-motion: reduce` to something still legible as live rather than
looking broken; it may not read as the mustard interface layer or as an error. And
it should be a **move, not an addition** — the band is 878px at 375 against ~635px
of visible Safari and cannot afford the state in two places.

### D-01.10 The corner mark is a STATE badge, not a LIVE badge
**Client, 20 August, explicitly and knowing it is not what they first asked for.**
The request was a LIVE badge top-right of the hero banner, blinking. The art
director's ruling, accepted: the only version that cannot lie is a **state** badge
that is sometimes live.

It carries **LIVE / PERIODIC / DEMO DATA / OUT OF SEASON at all times, never
conditionally.** The reason is structural, not stylistic — after D-01.4 the deck's
membership computes from validity window × severity, so any of the nine situations
can lead, including editor-entered, demo and out-of-season ones. A badge that
appears only when live needs a conditional, and the conditional *is* the mechanism
by which a wrong state gets displayed. Removing the branch removes the failure mode.
Absence is also unreadable: "not live" and "failed to render" look identical.

Implementation is a **move, not an addition** — each slide's existing `.state` chip
is repositioned to the top-right of *its own* frame, so the mark travels with the
reading it describes and cannot desync. It must never live in the page-level
`.s-hero-mast`. Zero band height (the mast is already absolutely positioned);
−19.5px at 375, because the provenance row loses an item and `.s-hero-src` recovers
278.2 → 334px — which is why the already-approved cut string still wrapped, at 299px
against a 278.2px measure.

Blink: the 9×9 dot only, never the word; only under `.state.live`; 2.4s, holding
solid for 70% of the cycle — 0.42Hz, seven times slower than WCAG 2.3.1's
three-per-second threshold. Off-white, since mustard is the interface layer and red
is a broken limit. Solid at full opacity under `prefers-reduced-motion: reduce`, so
it reads as *on* rather than broken; no information is lost, because the word and
the fill pattern carry the state completely. And it must not read as a button —
no border, background, padding box or hover, `pointer-events:none`, never inside an
`<a>`, `aria-hidden="true"` since each slide's `.sr` span already narrates it.

### D-01.11 Dates are computed, and Monsoon's Live claim is withdrawn
**Both client-approved, 20 August.** Two separate honesty fixes that the art
director made preconditions of shipping the blink.

**Dates compute.** The file contained no `new Date`, no `toLocale`, no `setInterval`
— every time string typed by hand, and the ticker's only absolute date read
19 August when the day was the 20th. A dot blinking LIVE above a page dated
yesterday makes the over-claim louder. The ticker date now computes, and the source
line gains a relative age — "Read 07:00 IST · 41 min ago", 303.2px against the
334px the line regains, so no extra row. **Local `Date` getters only, never
`toISOString()` or `toLocaleDateString()`** — this project runs IST and that exact
pattern has corrupted data before in the owner's other codebase. At ≤560 the line
cuts the approved words "Read" and "today" to fit; the client approved that cut.

**Monsoon goes from Live to Periodic.** The build shipped three `Live` chips where
the record supports two. Air is OpenAQ and Fire is NASA FIRMS — both genuinely
wired. Monsoon is IMD, which `DECISIONS-2026-08-18.md` rejected as brittle and
legally grey, so nothing is behind it.

The client's first answer was that a fixed date range would make the Live label
make sense, "same will apply with forest fires". Two corrections were put to them
and they revised: **a validity window governs whether a situation appears and
whether it leads — it does not connect a data source**, so an unwired feed in season
is still unwired; and **fire is already live**, so it was never waiting on anything.
Flip Monsoon back to `Live` the day a feed exists — it must remain a one-token
change.

### D-01.12 A method line, not a genre label
**Client-approved, 20 August.** The question was whether a tagline should explain
that this is an environmental intelligence dashboard. Ruled: **no genre label** —
D-01.8 had just made the hero a single editorial choice, so naming it a dashboard
would promise in the page's first line exactly what the hero was told not to be.
Two further reasons: the statement band one screen down already owns that job, and
two mission statements 900px apart means the weaker one arrives first; and there is
no typographic level available between a deliberately suppressed 67.2px h1 and a
272px numeral.

But the gap was real, and the masthead is absolutely positioned, so a line there
costs nothing. Shipped instead — **NEW COPY, approved this session**:

> **Every reading against its published limit**

315.4px measured, `.lbl` micro-caps in `--fg-2`, left edge on the spine,
`--gap-head` under the h1 — the same voice and colour as "DELHI. SINCE 2000." in the
ticker, so the two masthead statements read as one gesture. It states the *method*
rather than the category, which is what actually explains an instrument.

**≥561px only**, accepted as a compromise: at ≤560 the state badge takes the one
available mast row and they cannot share it (row 335px, line 315.4px, leaving
19.6px against a badge needing up to 118.4px). The phone reader who most needs the
orientation does not get this line. Rejected alternatives, all measured:
"Environmental intelligence, Delhi and India" (the forbidden genre label, and it
overruns 375 by 0.2px); "Live readings against the legal limit" (over-claims, per
D-01.11); "Nine situations, read against the law" (the hero shows four and the
ticker seven, so the number invites a count the band fails); "Read against the
limit" at 169.3px, the only line fitting beside the badge at 375 and rejected as
weaker than silence.

---

## D-00 THE SITUATION LIST IS FROZEN
**Client, 20 August: "Lets freeze this now."** This supersedes every earlier list.
Nine situations become **six**. Nothing may be added without a new ruling.

| # | Situation | was | notes from the client |
|---|---|---|---|
| 1 | **Delhi's Air** | `h-air` | inner page carries India-wide data too |
| 2 | **Yamuna** | `h-yamuna` | inner page carries all-India river data as well as deeper Yamuna data |
| 3 | **Heatwave** | `h-heat` | |
| 4 | **Forest Fires** | `h-fire` | |
| 5 | **Forest Loss** | `h-forestloss` | |
| 6 | **Climate Event** | `h-monsoon` | renamed — carries monsoon, rain and flood data during monsoons |

**Removed as separate situations:** `h-stp` (Treatment, 14/18) and `h-waste`
(Out of river, 6,890t) — the client's words: *"doesnt make sense to ahve STP
separately, or Out of river."* `h-noise` (Noise) is **not on the keep list and is
therefore also out**; it was never wired. Flagged to the client as an inference
rather than an instruction, since they did not name it.

Visibility remains **backend-controlled** per D-01.4 — a situation is frozen into
the *set*, but whether it shows, and when, is still governed by its validity date
range and severity.

### Consequences that do not follow automatically — handle these deliberately

**1. "Out of river" is the only green figure on the ticker, and it is the only
number the organisation actually owns** (Swechha's own field log; AD-02 called it
exactly that). Deleting it outright would remove green from the strip entirely.
The right reading is that it was never a *situation* — a situation is a thing going
wrong, and 6,890t recovered is an outcome. **It belongs in the Impact band, which
is where the art direction already puts green** ("green lives in band 7"). Move it;
do not delete it.

**2. Treatment (14/18 STP) should fold into Yamuna's inner page**, not vanish. The
client has just said that page carries deeper Yamuna data, and how many of Delhi's
sewage plants meet standard is exactly that. It is context for the river reading,
not a headline of its own.

**3. The ticker's red/green exemption may no longer be needed.** `groundRhythm`
grants the ticker the page's only exemption from the red/green adjacency rule
*because* it summarises every situation at once and carries both hues. With green
moving to Impact, the strip may carry red only — in which case the exemption is
moot and the "visually caged" conditions attached to it should be re-examined
rather than inherited.

**4. AD-02's ticker arithmetic is superseded.** It costed nine cells with dormant
states, pushing the seven-across floor from 900px to ~1,180px and to ~1,360px with
honest labels. **Six cells changes that materially** — recost before implementing
anything from AD-02 that depends on cell count. Its argument for showing every
situation *always*, with dormant ones marked, still stands and is now cheaper.

**5. AD-01b's location research is partly obsolete.** It found only two of nine
situations could answer an arbitrary location, and that Yamuna could *never* be
answered outside Delhi by definition. The client has now said Yamuna's inner page
carries all-India river data — which changes that conclusion. Re-scope before
building anything location-aware on the situation pages (D-01.8).

**6. `situation-soon.html` shrinks.** Air and Yamuna have pages; four situations
now need them, not seven.

**7. The dead `#h-waste` link** AD-02 found resolves by relocation rather than by
repair — but only once Impact actually holds that figure. Until then it is still a
link that looks live and lands nowhere.

**8. The hero deck's fourth slide is renamed** Monsoon → Climate Event
(`data-tab`, `.s-hero-id`, ticker label). Deliberately NOT folded into the hero
build in progress, to avoid destabilising six items already under verification.

### D-01.13 The ≤560 cut is by principle, not by position — Air inverted
**Client, 20 August.** D-01.5 approved cutting "the second sentence" at ≤560, on
the principle that **the clause that survives names the subject and the clause that
goes is arithmetic already in full on the situation page.** Implemented
positionally, that principle inverts on Air, whose sentences run the other way:

1. *"Four times the limit the Central Pollution Control Board sets for a safe day."* — arithmetic
2. *"Schools in this ward are three kilometres from the monitor that recorded it."* — the human fact

So the phone was keeping the arithmetic and dropping the schools — the clause AD-01
D8 named as the one sentence that turns the number into a fact about children — and
stating the same arithmetic three times in one screen (the multiplier beside the
numeral, the limit line under the bands, and the sentence).

**Ruled: on Air, keep the schools sentence and cut the arithmetic one.** The span
moves; no word changes; the full paragraph still renders at ≥561. The other three
slides keep the positional cut for now and are being checked against the principle
rather than re-decided — anything that fails the same way comes back to the client.

**The general rule for any situation added later: the survivor is chosen by what it
says, not by where it sits.**

### Amendment owed — the 40% unveiled floor is arithmetically impossible on desktop
AD-01 D2 prescribed a floor of "at least 40% of `shotH` unveiled at every viewport".
Implementation measured that it cannot hold above 860px: the opaque panel alone
covers 395.5px, which is **63% of a 628px frame**, so the ceiling at 1440×720 is
**37.0% with both veils set to zero**. AD-01's worked example (88 + 100 leaving
251px clean) omitted the panel — 628 − 88 − 100 is 440, not 251.

The floor holds at 41.5–43.7% at every viewport ≤860. Against the photograph's
*uncovered* region rather than the whole frame it is 48.0% at 1440×900 and 21.7% at
1440×720. **The floor needs restating against a named denominator before it is
quoted again**; as written it is unachievable and will be read as a failure.
Shipped values give clean picture of 50.4px at 1440×720 (was −7.5px), 168.4px at
1440×900 (was 110.5px), 62.2px at 375×635 (was 21.0px) — the zero-crossing below a
790px window is gone at every height.

### D-00.1 A closed situation does not render — anywhere
**Client, 20 August, restating D-01.4 after an art director argued against it:**

> *"Anything that is closed, shouldnt appear in the frontend. Thats why had asked to
> give admin access to enable/disable a situation periodically, or through a date
> formula"*

A situation whose validity window is shut is **absent from the front end**. No
dormant cell, no CLOSED word, no dashed rule, no placeholder, no greyed row.

**This kills the dormant-cell mechanism** (AD-02b's H1) that had been chosen for
Heatwave, and with it the question of what word a dormant cell should carry.
AD-02b's **H2 — "in neither row" — is the ruling**: the option it costed at zero,
said it would not take, but conceded was "defensible if the client's view is that
the homepage should only ever show live things." That is the client's view, and it
was already on record as D-01.4.

**Heatwave is therefore absent from the strip today** — its window shut on 15 July.
It remains one of the frozen six and renders when its window opens. Today's ticker
membership is Air, Yamuna, Climate Event, Forest fire, Forest loss, plus Waste.

### Consequences that must be designed, not inherited
The art director's two objections to H2 do not disappear with the ruling; they
become the work:

1. **The strip's length now varies with the season.** `repeat(6,1fr)` becomes
   `repeat(n,1fr)`, and a reader returning in spring finds a column that was not
   there before with nothing explaining it. The seven-across floor of 1,048px may
   not be bought today at six cells — but it will be crossed in a season when more
   windows are open, so the grid must degrade honestly at whatever n it reaches.
2. **The strip's `aria-label` — "Today's readings, every situation" — is now false**
   and must change.
3. **The state vocabulary may have shrunk.** D-01.10 fixed it at LIVE / PERIODIC /
   DEMO DATA / OUT OF SEASON and the hero stamp ships all four. If a closed
   situation never renders, **OUT OF SEASON is unreachable** and the vocabulary
   drops to three. To be verified and confirmed with the client before the shipped
   stamp is changed.
4. **Whether Waste is subject to windows at all** — it is an Impact figure, not a
   situation, so presumably always present. To be confirmed.

### Backend requirement added
Beyond `windowStart` / `windowEnd` / `recursAnnually` (D-01.4), the client's stated
mechanism requires an **admin override**: the ability to enable or disable a
situation periodically or by date formula — switching one off inside its window and
on outside it. Neither the window fields nor the override exist in
`lib/content/schemas.ts`.

### D-00.2 THE IMPACT SLOT — FROZEN
**Client, 20 August: "Freeze this bit."**

> *"waste is constant right hand side design in that strip, remains always. In short,
> its a static Impact button, it can be switched/changed from the back, for example
> today it is waste out of Yamuna, next month it can be trees planted, later it can
> be 6 million youth reached, 25 yamuna yatra etc. Admin will have power to enable
> any one of them. Clicking on this takes the visitor to the Impact page."*

The ticker is now **two zones under different rules**:

| | left | right |
|---|---|---|
| what | the situations | one Impact slot |
| count | variable — only open windows render (D-00.1) | always exactly one |
| absent ever? | yes, seasonally | **never** |
| content | fixed per situation | **rotates**, one active at a time, admin-selected |
| destination | that situation's page | the **Impact page** |

**Why this is better than what the art director had built.** AD-02b measured that
D's "different in kind" mark was invisible at working size — the heavier divider and
14px gap did nothing under 5× enlargement, and green was doing all the work.
**Position now carries that job instead of a mark:** the rightmost cell is always
the Impact slot, so its identity is structural and constant rather than something a
reader decodes from a divider weight. It also stabilises the strip's right terminus
while n varies on the left, which answers part of the seasonal-length problem
D-00.1 created.

### Open, and flagged to the art director rather than assumed
- **The hue.** The figure is green today because green means *what has been
  recovered* — a closed-list rule. The rotation breaks it: "trees planted" is
  arguably recovery, **"6 million youth reached" is not**, "25 Yamuna Yatra" is a
  count of events. Either green's job widens from *recovered* to *what Swechha has
  done* — a change to a closed-list rule, which needs the client — or the slot is
  not always green and something else must govern it. **Not to be quietly widened.**
- **Whether the flipped cell still reads.** C+D worked because the odd cell's first
  line was a green numeral among red ones. If green is no longer guaranteed, that
  mark may not hold; position may now be enough alone.
- **The content ceiling.** The examples vary wildly — "6,890t" is short, "6 million
  youth reached" is long, "25" needs its noun. The longest value+label the slot can
  hold before it truncates or forces a scroll must be **stated now**, because an
  admin will choose these from a panel with no sense of that limit.
- **Naming.** The head, the cell label and the `aria-label` all currently assume
  every cell is a situation. One never will be.

### Backend requirement added
An **Impact slot**: a set of candidate figures with exactly one active,
admin-selectable, independent of the situation windows. Joins the window fields and
the situation on/off override from D-00.1. None of the three exist in
`lib/content/schemas.ts`.

---

## Section 02 — TICKER

### D-02.1 The situation row exists twice, in different shapes (option C+D)
**Client, 20 August, having seen six rendered variants:** *"i am fine with whatever
art director decides, i like all"*, with the constraint that Heatwave and Waste must
both be cells.

Chosen: **C+D** — the ticker cell flips so the **value leads and the label sits under
the rule**, and the strip carries the situations plus the anchored Impact slot. The
deck's tab row survives.

Why this and not the alternatives, all of which were built and captured:
- **A (delete the deck's tabs)** freed 40px on a phone but removed the ability to
  jump to a named situation and reopened the 726px hero-bar void closed that morning.
  Its own weakness: it left the *ticker* looking like the deck's control — trading a
  visible duplication for an invisible mis-affordance.
- **B (ticker becomes the deck's selector)** made duplication structurally
  impossible, but put the control below the panel it drives and contradicted two
  standing rulings — the ticker is chrome, and no controls in the strip.
- **D alone did not solve the complaint.** Its own capture showed AIR still sitting
  under AIR at 768. It explains the duplication without removing it.

**Result at 768:** deck reads `AIR YAMUNA CLIMATE EVENT FOREST FIRE`, strip reads
`412 · 0.0 · 118 · 1.65M ha · 512mm · 6,890t`. **The strip came in shorter**
— 112.8 → 111.2px at 1440, 119.5 → 116.5px at 375 — because the 19px of bottom
padding existed only to stop the value rule reading as the section border, a job the
flip removes.

### D-02.2 Head line, count field, green
- **"Delhi. Since 2000." → "Delhi, then India."** Approved. It states the structure
  the client described — Delhi as the hook, the national frame opening on the inner
  page — rather than a location, and is true of the Delhi readings, the national ones
  and the Swechha figure alike. 1.1px wider; nothing reflows.
- **"Five in window · one record"** — new copy, approved, now under the
  never-rewrite rule. It exists to answer the problem D-00.1 created: with closed
  situations absent, the strip's length changes with the season, and a reader
  returning in spring would otherwise find columns that were not there before.
- **Green belongs to the figure, not the slot.** A recovery figure renders green;
  "6 million youth reached" renders off-white, because green means *what has been
  recovered* and reach is not recovery. The closed-list rule is **not** widened.
  Client took this knowing the cost. **Mitigation, now a backend requirement:** the
  Impact-slot admin panel must state at the point of selection that the colour
  follows the kind of figure, or the first admin to pick a reach figure will file the
  off-white numeral as a bug.

### D-02.3 OUT OF SEASON is not a dead value — correction
It was asserted (by me) that D-00.1 made `OUT OF SEASON` unreachable, since a closed
situation never renders. **That was wrong.** The admin override the client specified
can switch a situation **on outside its window**, which is exactly a rendered
out-of-season situation. The four-word vocabulary from D-01.10 stands and no shipped
element was changed. Related finding worth keeping: `closed` / `demo` / `delayed` are
**class names and must never become copy.**

### Measured, and fixed on the way past
- The mobile hole under LIMIT BROKEN the client reported: **71.5 / 78.3 / 78.3 / 0 →
  0 / 0 / 0 / 0** across the four slides. It was never padding — the deck equalises
  slide heights and Forest fire's 137-character sentence sets to 4 lines where the
  others set to 2. The plate now lands at the same y on every slide (spread 0.0px),
  which is *more* faithful to "only the reading changes" than pinning it was.
- **Rotation ceiling for the Impact slot: label ≤ 125px (~13–14 caps), value ≤ 125px
  (~12 digits)**, binding at 375. All four of the client's example figures fit; the
  slot was widened to make that true.
- **Scroll breakpoint 1018px** — set from the worst case the freeze permits (7 cells),
  not today's 6. Floors: **876 / 1018 / 1195** for 6 / 7 / 8 cells.

### Backend requirements accumulated (none exist in `lib/content/schemas.ts`)
1. `windowStart` / `windowEnd` / `recursAnnually` per situation (D-01.4).
2. A stored `limit` per situation, so a breach is derived and never typed (D-01.4).
3. An admin on/off override, able to switch a situation off inside its window and on
   outside it (D-00.1).
4. An Impact slot: a set of candidate figures, exactly one active, admin-selected,
   independent of the situation windows (D-00.2).
5. The green-follows-figure note in the Impact-slot admin panel (D-02.2).

### D-02.4 SECTION 02 IS FROZEN — with three named exceptions
Head line shipped (`home.html:2338`), ink 129.1 → 130.2px as predicted; head row and
strip heights identical at all 14 widths, spine registration intact, nothing
reflowed. Full frozen list is §9 of `2026-08-20-AD-02c-ticker-built.md` (19 items).

**NOT frozen — three soft spots, recorded so the freeze does not imply a confidence
nobody has:**

1. **The 1018px breakpoint has never been rendered for real.** It is the n=7 floor,
   but Heatwave's window is shut, so seven cells have only ever existed as an
   injected simulation. **Re-measure the first time a seventh window genuinely
   opens.**
2. **The count wording has never been seen at a low n.** n=1 is arithmetically
   possible in February. A two-cell grid at 1440 gives each cell ~700px and will stop
   reading as an instrument. Whether it can occur at all depends on window dates that
   do not exist yet — so this is blocked behind backend requirement 1, not solvable
   now.
3. **The Impact slot's lower bound is unmeasured.** The ceiling is established (label
   ≤125px, value ≤125px at 375); the floor is not. A one-character value leaves the
   flat rail ~12px wide, and there is a length below which the site's signature mark
   stops being a rule and becomes a dash. Not established.

---

## Sections 03–05 — THE WORK CHAPTER

### D-03.1 WORK is the umbrella, delivered without moving a band
**Client-approved, 20 August.** Positions 3–5 become one WORK chapter on their
existing grounds, so the twelve-hex `groundRhythm` sequence is **unchanged
hex-for-hex**. Band 3 is the umbrella frame, band 4 is Work · Journeys, band 5 is
the running order split by kind; band 6 (the timeline) is read as the About section
— it already opens on *"Swechha means, roughly, of one's own free will"*, existing
approved copy — and Impact already followed it. That is the client's stated running
order: situation hero → Work → About → Impact/Receipts.

**Umbrella line, NEW COPY, APPROVED:** **"The numbers are not the work."** It now
falls under the never-rewrite rule. Alternates rejected: *"What we do about what we
measure"* (explains rather than lands) and *"Everything the readings set in motion"*.

**The best outcome was not asked for:** *"A number is not a smell"* is **moved, not
cut** — it opens the Journeys band, immediately answered by its own approved lead
(*"So we take them to the water…"*). The approved pair had been separated; they are
reunited and the aphorism stops floating.

**Measured:** document 9,459 → **9,074px** at 375. Journeys **896.4** and the
running order **893.7**, both inside the 900 cap, where Journeys had been the page's
worst breach at 1,158.7. Frozen bands 01–02 and the header verified byte-identical.
The ≈8,200 target is **not** met — 874px over, ledgered rather than hidden (record's
pre-existing 1,373.9 breach, give, footer, hero).

### D-03.2 THE HOMEPAGE MAY NOT DEPEND ON COUNTS
**Client, 20 August — a design principle, not an answer:**

> *"Projects, campaigns and Events cant have fixed numbers all the time. We can have
> 3 campaign today and 7 tomorrow. Similarly number of events can change too.
> Therefore Homepage realestate and design cant depend on TOTAL."*

The count is **a variable, not a fact to look up**. The homepage must render
correctly at 3 campaigns or 7, 2 events or 12, 5 projects or 15, with no designer
intervening. This retires the standing "five campaigns or three?" question
permanently — it has no answer.

**What it invalidates:**
- **Stated numerals.** "5 Projects · 4 Journeys · 3 Campaigns" and the
  em-dash-for-zero device. A number printed on the page *is* a design depending on a
  total.
- **Any layout whose height is a function of n.** The observation that five
  campaigns would add ~96px against ~6px of cap headroom is exactly the fragility
  being rejected: a design that breaks when the organisation does more work is the
  wrong design.
- **Weighting expressed as row count.** "5 project rows · 3 campaign rows · events
  as one line" reads as deliberate weighting only because those happen to be today's
  numbers. Weight must come from **treatment** — size, ground, whether a row carries
  a photograph — never from how many items exist.

**Precedent to follow:** D-00.1 made ticker membership seasonal and variable, and
the strip absorbed it by anchoring the Impact slot right and letting the situations
flex. Same thinking applies: name what is structurally fixed and what flexes, state
the n at which each zone caps, pages, scrolls or truncates, and **make that boundary
legible — a silent cap is worse than a visible one.**

Under review: whether this reaches the ticker's approved **"Five in window · one
record"** head. It is computed rather than typed, so it is not the same defect, but
it must be confirmed honest at low and high n.

### D-03.3 Placeholders while the design is being finalised
**Client, 20 August:** *"where you dont find the content, put the placeholder image
and content. We are only finalising the homepage design right now"*

Missing content must not distort the design under review. Where a row, image or hook
has no real content, a placeholder goes in so the design can be judged at full
strength — the Monsoon Wooding dash becomes placeholder content rather than a
designed absence.

**This is scope, not a reversal of the through-line.** "Where the record is missing,
the page leaves the hole showing" still governs **what ships**. Every placeholder
must be marked as such, and each one still needs a launch-time ruling on whether it
resolves to real content or to a visible hole.

The four events — Plantation Drive, Yamunotsav, Cyclothon, DIY Workshops — stand as
placeholder samples. `event` and `journey` still do not exist in
`lib/content/types.ts`.

### D-03.4 Count-independence — built and PROVEN
D-03.2 implemented. Mechanism: **structure fixed, membership flexes** — the ticker's
own thinking generalised.

**Fixed:** the frame, the opener, and the three *treatments* that carry the weight —
projects are rows with photographs on the wide column, campaigns thin rows with a
situation hook on the narrow column, events one line at the band's foot. Weight is
now expressed by treatment, so it holds at any n.
**Flexing:** how many items paint. Caps **6/4 projects, 4/3 campaigns, 4/3 event
names** (desktop/phone), each with an **unnumbered** boundary row ("More this week /
More campaigns / and more →") that reveals itself by its own child position exactly
when something is hidden. No silent cap.

**Every stated numeral is gone** — the "Projects / 5"-style heads and the
em-dash-for-zero device. The boundary row carries no numeral either, deliberately: a
computed total would still lie at whichever breakpoint hides more rows. **Row
ordinals (01, 02…) stay** — they number the approved *"the order they take up our
week"*, a sequence, not a total. **Zero case:** an empty kind renders nothing,
reusing D-00.1's grammar.

CMS contract is one line: *emit every item plus one trailing more-row per kind*;
pure CSS does the rest per breakpoint.

**Proof, independently re-measured — `#running` at 375×812:**

| membership | height |
|---|---|
| 0 campaigns | 664.9 |
| 5p / 3c / 2e | 815.3 |
| base (today) | 846.9 |
| **15p / 7c / 12e** | **887.9 — the worst the design permits, inside the 900 cap** |

No horizontal overflow and **no stated total present at any membership**. Base doc
at 375 now **9,027** (was 9,459). Desktop ceiling 1,077.8 at max.

**The proof caught a real bug** that assertion would have shipped: the campaigns
boundary row out-specified its own `display:none` and painted when nothing was
hidden — "and more →" pointing at nothing.

**Not reached by the ruling:** the ticker's computed *"Five in window · one record"*
(computed, in a zone that already flexes). **Flagged:** journeys has four fixed
routes and its phone rail is count-safe by scrolling, but **a fifth route would need
a desktop-rack cap ruling.**

### D-03.5 Placeholders placed this pass — each needs a launch ruling
Per D-03.3, marked as placeholders and not decisions:
- **Monsoon Wooding** now carries a placeholder hook *"Runs against Forest loss →"*
  (to `situation-soon.html`). **Launch ruling needed:** is it a real hook, or does it
  ship as a visible hole per the through-line?
- **The four event names** remain client-supplied placeholder samples. Need real
  events, plus the still-missing `event` and `journey` content types in
  `lib/content/types.ts`.
- Membership variants (`n-max`, `n-low`, `n-zero`) are synthetic, chip-labelled, and
  never ship.
- New copy proposed this pass, awaiting approval: the three boundary strings and the
  placeholder hook text.

### INTEGRATION RISK — the fork
`public/design/v3/_ad4/home.html` was forked from the morning `home.html` **while a
repair agent is editing the frozen bands in the original**. At sign-off, bands 01–02
must be **re-diffed against the repaired revision, not assumed identical** — that
assumption was made once today and was wrong. Also unchanged and still open:
record's pre-existing 1,373.9 cap breach, and the ≈8,200 document ledger.

---

## MERGED TO THE LIVE FILE — 20 August

`public/design/v3/home.html` now carries the repaired frozen bands **and** the WORK
chapter. Backup of the pre-merge state:
`public/design/v3/home.html.bak-20260820-premerge`.
Full record: `2026-08-20-AD-05-honesty-repair.md`, `2026-08-20-AD-06-merge.md`.

**Bands 03–06 replaced** marker-to-marker (221 lines out, 268 in). `#statement` →
`#work`, old `#work` → `#running`. Bands 01–02 and 07–12 verified **byte-identical**
by exact string comparison. Twelve band ids present and in order.

**Nine repairs shipped** (AD-05). Two rulings worth remembering:
- **The typed "today" was CUT, not computed.** The page is served statically, so a
  tensed word is a claim the markup makes *before JS runs* — computing it would fix
  the scripted path and leave the typed fallback wrong seven hours a day. Cutting
  kills both.
- **The page-level LIVE dot was REMOVED.** It was the frozen vocabulary's filled
  square, wordless and `aria-hidden`, over a strip where only two of six cells are
  wired live. No honest aggregate word exists (vocabulary frozen at four) and binding
  it to the date would be decoration. Removing the branch removes the failure mode —
  D-01.10's own argument one level up.

Hero and ticker now **agree at all eight mocked instants**, including 1 Sep 00:30 →
"31 August" and 1 Jan 2027 00:30 → "31 December 2026". Six of eight disagreed before.

**Measured:** document 9,459 → **9,027** at 375×812 and 9,362 → **9,007** at
1440×900; journeys 1,158.7 → **896.4**; every band outside 3–6 unmoved to the
hundredth of a pixel. Count-independence re-proved on the merged file: `#running` =
664.9 / 815.3 / 846.9 / **887.9**, no stated total at any membership.

**Dead CSS removed on merge:** `.s-journeys-h`, `.s-work-idx`, `.s-work-lead`,
`.s-work-k`, `.s-work-foot` (43 declarations across 24 rules) plus a stale
`#work{background:var(--ground)}` which, after the rename, had silently landed on
band 3. Unmatched-selector count unchanged: 29 pre-existing, **zero new**.

### Open, carried forward
1. **`.s-ticker-count` is hidden at ≤560**, so *"Five in window · one record"* never
   reaches a phone reader — the very reader most likely to meet the page, and the one
   the line was written for (it explains why the strip's length changes with the
   season). Pre-existing and apparently deliberate; needs a decision, not inheritance.
2. **36.80px plate spread at 1024 only** — a *different* defect from the fixed R5
   (the plate's flex row wraps the action link on the Yamuna slide). Every candidate
   fix needs a ruling or a magic number.
3. **320px residual on R5** — needs a breakpoint below the tested floor.
4. **The arrow-key handler does not call `mark()`** — same class as the patched click
   handlers, one line, self-correcting. Deliberately not widened into a behaviour
   change during a focus fix.
5. **Footer's "Projects and campaigns" link** still targets `#work` (the chapter
   opener) rather than `#running` (the ledger). Left alone because bands 07–12 were
   required byte-identical, and covered anyway by P-1: menu destinations are wired
   after homepage sign-off.
6. **Record still breaches the mobile cap at 1,286–1,374px**, and the document is
   ~827px over the ≈8,200 target. Ledgered, not hidden.

### Process note worth keeping
Mid-repair the agent broke a comment and killed the entire date IIFE — and **the page
looked identical to correct behaviour**, because silent-and-empty is the honest
failure mode the new guards produce. Only the `console.warn` lines caught it. That is
the argument for keeping those warnings in the shipped file.

---

## 21 August — the work chapter is rejected and re-briefed

### D-07.0 THE PASS ON BANDS 3–6 IS REJECTED. NEW IA, NEW COMPOSITIONS.
**Client, 21 August:** *"Am not happy with the homepage design update i had asked for.
I wanted the sections under situation - the smell banner, the journeys, work we do and
about us to be redesigned, with a fresh take. It hasnt happened."*

The 20 August restructure (D-03.1 … D-03.5, AD-04 → AD-06) satisfied the *constraints*
and never delivered a *composition*: bands were renamed and re-plumbed, count-
independence was proved, and the reader saw the same stack with different labels. The
constraints from that pass stay live. **Its compositions are void.**

**The sequence the client set, in his order** — replacing everything from BAND 3 up to
BAND 8 (Swechha Farm):

| # | band | note |
|---|---|---|
| 3 | the smell banner | "A number is not a smell", back as its own designed band |
| 4 | WHAT WE DO | **must open with the four kinds of work: projects, campaigns, journeys, events** |
| 5 | JOURNEYS | its own section |
| 6 | PROJECTS | its own section |
| 7 | CAMPAIGNS + EVENTS | one combined section |
| 8 | ABOUT US | keeps the journey-of-Swechha timeline **and** adds a short "Who we are" para |
| 9 | IMPACT | "a nice strip" |

**Every one of these sections carries a button to its own detail page.** This overrides
the working-file `href="#"` habit for body CTAs; P-1 still governs header/menu links.
Hero and ticker stay frozen; Farm → Footer stay byte-identical. Copy stays "as smart as
it was kept earlier"; the brand language is the one already finalised in hero/situation.

Brief: `2026-08-21-AD-07-brief.md`. Direction doc owed at
`2026-08-21-AD-07-work-chapter.md`, prototype at `public/design/v3/_ad7/home.html`.

### D-07.1 "AUDITED" COMES OFF THE PAGE — the figures are verified, not audited
**Client, 21 August: "Verified, not audited."**
The Impact lead's *"Audited to 31 March 2026"* claimed an external audit of programme
figures that the 18 August ruling records as **owner-verified** (it overrode the
workbook's "verification needed" flags). The audit word is withdrawn from the strip and
from its method note; no auditor may be implied anywhere in the band. Swechha's accounts
being audited is a separate claim and belongs on About/Reports, not on a programme
ledger.

### D-07.2 GREEN'S MEANING IS OFFICIALLY WIDENED — "what Swechha has done"
**Client, 21 August: "Green = what Swechha has done."**
Green was a closed list meaning *what has been recovered*. The Impact strip broke it in
the build — the band was tagged RECOVERED with four green labels while "3M+ children and
young people" is reach, not recovery. Rather than de-greening the reach figures, the
client widened the rule: **green = the organisation's own outcomes.** Red is unchanged
and still means only a broken limit.

**This also settles the question left open at D-00.2** for the ticker's rotating Impact
slot: "6 million youth reached" and "25 Yamuna Yatra" may be green, because the slot
carries what Swechha has done. The ticker itself is frozen and is not to be edited on
the strength of this ruling — the ruling simply removes the blocker.

### Carried into the redesign — measured on the band being replaced
Band 7 as built was geometrically sound (no overflow 320–1920, `scrollWidth === width`
throughout, green 8.01:1 on #151512, 675.5px at 375, 662px at 1440). Its faults were
content and two optical items: a ~17px wrap ledge under the short labels between 901 and
~1023 where labels 1–2 wrap and 3–4 do not, and a ~197px void between the last figure
and the ledger rule's right terminus at ≥1280 (internal gaps are ~81px), so the row
stops short of the rule it sits under.

**Open, and now the art director's to answer:** the build's tiles 3 and 4 — "78 butterfly
gardens" and "67 air-detox gardens" — are **not** the four the owner ruled on 18 August
(3M+ children · 6,890 t Yamuna waste · 5%→90% green cover · 100+ green infrastructures
across 100+ schools) and appear in no decision doc or content source in the repo. The
redesign builds on the owner-ruled four; the substitution needs a ruling, not inheritance.

### D-07.3 THE FARM IS FIVE ACRES, AN HOUR AND A HALF FROM DELHI
**Client, 21 August: "swechha farm is 5 acres and 1.5 hours from delhi, use this."**

This settles the conflict the description check turned up: the homepage said *"Forty
acres… 60km from Delhi"*, the Introduction to Swechha PDF said a *2-hectare campus at
Ladpuri Village, Alwar*. Neither stands. Applied in band 8 of `home.html` — the lead now
opens "Five acres running as a working farm…", the eyebrow reads "A real place, an hour
and a half from Delhi", and the two readouts are **5 / ACRES** and **90 / MINUTES FROM
DELHI** (the numeral takes minutes because "1.5" is a weak figure at display size; the
prose keeps the hour and a half). Also corrected in `about.html`'s "Who turns up" card —
the only other page in `v3` that carried the old numbers.

### D-07.4 GREEN THE MAP IS SET IN THE PAGE'S DISPLAY BOLD
**Client, 21 August: "make Green The Map in the bold you have used everywhere."**

Band 9's wordmark was the only section head on the page in `.d2` (Newsreader serif
light). It is now `.d1` — Archivo, wdth 68 / wght 850, uppercase — like every other
section head, **capped at `clamp(2rem,4.4vw,3.4rem)`** rather than taking the full
`--t-d1`. The band's own copy says it is deliberately the quieter one, so the quiet is
now carried by scale and by the T4 ground, not by a different typeface. Verified
rendered at 1440 and 375.

**Capture note worth keeping:** the first capture of band 9 came back with the tote
photograph missing. Not a defect — `loading="lazy"` images below the fold never load for
a clipped CDP capture unless the element is scrolled through first. The harness now
scrolls the target into view and flips every image to `eager` before shooting.

## 21 August, later — the freeze rulings

The client's verdict on the AD-07 chapter: *"I somewhat like what you have designed,
will tweak it later if need be… lets freeze the homepage, so that we can delete the
unnecessary files."* Nine questions were put to him; these are the answers.

| # | ruling |
|---|---|
| **D-07.5** | **Gardens keep the sourced wording** — "Over 70 butterfly parks and over 20 herb gardens across Delhi NCR". "78 butterfly gardens" and "67 air-detox gardens" are dead; *air-detox garden* was never a term either source used. |
| **D-07.6** | **3M+ is cumulative reach since 2000** — every programme added up over 26 years. The method note must say exactly that, and tile 1's label becomes **"Children and young people reached since 2000"** so the cumulative frame is on the page rather than only in the note. |
| **D-07.7** | **Journeys are FOUR, not three.** **CityScapes is the eco-walks programme renamed**, and **NatureScapes** joins as a fourth. The client supplies NatureScapes' description and figures; the band's duration-drives-width logic must survive the fourth column. |
| **D-07.8** | **"She Leads Change" and "Food systems, with UNEP" are current projects** and join the register (eight rows, not six). The client supplies a one-line description and a figure for each. |
| **D-07.9** | **All new copy approved as written** — the four lines and five CTA labels in §4 of the AD-07 doc, plus the "since 2000" addition above. |
| **D-07.10** | **The smell banner takes no button.** It stays the page's one moment with nothing to click. |
| **D-07.11** | **Page length: the art director takes the final call and freezes it.** The client declined to choose between spending the 918px and trimming the chapter. Standing context: the chapter is 14% cheaper per section but there are seven sections where there were five; `record` is 1,374px on a phone, 474px over its own cap, and is the page's worst offender but sits outside this chapter. |
| **D-07.12** | **Cleanup on freeze: delete the superseded, keep v3.** Old prototypes (`v2/`, `explore/`, `homepage-final.html`, `situation.html`, the pre-merge backups) and the review harnesses go. The frozen `v3` pages stay — they are the only spec the real Next.js build has to work from, and they are deleted before the first deploy, per the standing rule. |

**Note on process:** the art director who built AD-07 could not be resumed (no transcript
survived the session), so D-07.11 and the content additions go to a fresh art director
working from the AD-07 doc, this ledger and `2026-08-21-SOURCE-FACTS.md`.

### D-07.13 BAND 8 REOPENS — the farm carries two stories
**Client, 21 August.** The Swechha Farm band is no longer frozen for this pass. It must
carry **two** stories, both detailed further on the inner page: the **transformation** of
barren land into a flourishing Food Forest and farm (5,000+ trees, 20 cows, poultry, a
native nursery, vermicomposting, hydroponics, a butterfly garden, organic farming, an
apiary, mud houses — permaculture prototypes), and the fact that it is a **place you can
come to** (overnight school camps and day visits for students and educators; team
meetings and retreats). "A good hook and call to action button."

Byte-identity for the merge therefore covers bands 1–2 and Green the Map → Footer only.
The ruled facts stand: five acres, an hour and a half from Delhi (D-07.3).

### Photo defect fixed on the way past
`gram-anubhav-shramdaan.jpg` was **not a photograph** — it was a crop of a printed page,
carrying a vertical white gutter 205px in, a sliver of the neighbouring frame, and a
mustard band along the bottom. The client saw the white line on the homepage. Cropped in
place to 1785×1750 (offset 215,0), same filename so no markup moved; original kept in the
session scratchpad. **The same fault is already logged against `gram-anubhav-hero.jpg`,
which is a screenshot of a website mockup** — the photo library needs a pass of its own,
because a frame that is really a page scan will keep surfacing as a "rendering bug".

### D-07.14 THE ARCHIVE SHEET IS FILLED WITH *MARKED* PLACEHOLDERS
**Client, 21 August: "put placeholder photos in archive boxes"**, then, when the trade was
put to him — filled-and-marked versus filled-and-clean — **"keep archive boxes as yo
suggested"**, i.e. marked.

So the 20 hatched `.s-record-off` cells (2000–2026, 7 real) carry photographs, and every
placeholder is **visibly a placeholder at a glance, at both widths**, in the vocabulary the
page already owns for this (`.tag-demo`'s dotted treatment, the DEMO-DATA grammar). The
`7/27 years scanned` tally stays true, the note that promised holes gets rewritten now that
there are none, and **no placeholder frame is given alt text claiming a year it is not
from**. Consequence to watch: `record` was already 1,373.9px at 375, 474px over its cap,
and twenty images do not shrink it — this is inside the height ruling, not beside it.

## 21 August, final — the freeze rulings on AD-09's six questions

| # | ruling |
|---|---|
| **D-09.1** | **Mobile nav: one compact index control**, built into the ~165px already unused in the mobile bar. Not a sticky chip row (+37px on a 635px screen is too expensive) and not the status quo — 91.9% of the phone page currently offers a reader exactly one link, GIVE. This supersedes the non-sticky part of D-01.1: the row itself stays non-sticky, but the reader keeps a way out. |
| **D-09.2** | **Record's breach is fixed BEFORE the freeze, not after.** 1,393px at 375 (1,456 at 320) against the 900 cap is the page's one remaining structural breach, and the archive sheet the client filled is what makes it so tall. The freeze is to be clean. |
| **D-09.3** | **The hero is opened for the keyboard, all four items.** Unclip the deck's tab focus ring (5px top and bottom at every width), take the three off-screen duplicate "The full instrument" links out of the tab order, and add a skip link and a `<main>` landmark. Today keyboard and screen-reader users reach the content only by tabbing the whole header (8 stops). |
| **D-09.4** | **Wire the active-section underline**, including `aria-current`. The CSS already exists and is unused; no new visual language is introduced. |
| **D-09.5** | **"twenty-six years of paper" is rephrased around "since 2000".** Consistent with the rule that no year count is typed into a static page, and it stops going stale every January. |
| **D-09.6** | **The `cityscapes-*` frames are Swechha's own.** They were resized somewhere along the way, which is why they carry no EXIF; they keep the archive credit and are NOT tagged placeholder. |

### D-09.7 THE 900px PHONE CAP LICENSES `record`
**Client, 21 August: license the band.**

Record measures **1,393.5px at 375** against the 900px per-band phone cap, and cannot reach
it. The arithmetic AD-10 put on the table: the archive field closes nothing at any density
(even 19×13px cells leave the band 121px over), densifying breaks D-07.14 because the
placeholder's year chip is a fixed 37.7×21.5px and would end up **wider than the cell it
marks** at 320, and **deleting all three doors still leaves the band at 946px**. The only
routes under 900 destroy either the filled archive sheet or the band's living-record half.

The cap was always art-director doctrine, never a client ruling, and its own exception list
read "the three heroes and the timeline" — **the timeline band was deleted in AD-07, so that
exception was vacant.** Record takes it. Nothing changes visually; the doctrine is amended to
match the page (`2026-08-20-art-direction.json`, `mobileDoctrine`).

**The homepage is now frozen with every ruling closed.** Remaining open items are not
homepage-visual: `content/photo-library.json` has no `cityscapes-*` entries, so D-09.6's
archive credit has nowhere to live; the campaigns pair stays capped at the 24px AA floor
(44px is arithmetically impossible in a 48.3px envelope); and "9,400 days on file" and
"34 guides" are still unsourced in `2026-08-21-SOURCE-FACTS.md`.

## 21 August — rulings for the situation-page phase

### D-10.1 NO READING MAY CARRY "LIVE" UNTIL A FEED EXISTS
**Client: label them DEMO DATA until a feed exists.**

Verified before ruling: the repository has **no live data of any kind** — runtime
dependencies are `gray-matter`, `marked`, `next`, `react`, `react-dom`, `zod`; there is no
HTTP client and no OpenAQ or NASA FIRMS integration. Live feeds were an architecture ruling
on 18 August and were never built. The frozen homepage discloses this at document level in
its footer ("Not the live site… every reading shown is a sample value standing in for the
live feed") but still carries **five per-reading LIVE badges**, and a badge is a claim about
that reading.

So: every reading takes the honest label from the frozen four-word vocabulary — **LIVE /
PERIODIC / DEMO DATA / OUT OF SEASON**. An unwired feed reads **DEMO DATA**; an
editor-entered bulletin figure reads **PERIODIC**, not LIVE. LIVE returns per-reading on the
day that reading's feed is actually wired, which is also the moment the badge starts to mean
something. The footer disclosure stays.

### D-10.2 A SITUATION PAGE'S HEADLINE IS A CONSTANT, NOT A READING
**Client: a constant.** The existing `situation-air.html` sets its `<h1>` to "Four times the
limit" — a reading, typed into static markup, in the largest type on the page, false on the
first clean-air day. The page's `<h1>` now names its subject and the reading lives in the
instrument below it, where it changes. This is what the homepage hero already does with "WE
KEEP THE RECORD".

### D-10.3 THE AIR PAGE IS A REBUILT SHELL, NOT A RETROFIT
**Client: rebuild the shell, keep the content.** The existing file is a pre-freeze fork with
~40 distinct drifts, and that set is open — it cannot be proven closed from outside the file.
Starting from the frozen page's token and chrome layer verbatim closes the drift set *by
construction*, and leaves a reusable shell for the five sibling situations. The existing
page's content architecture survives: its six-question spine, its feed inventory, its honest
forecast empty state, its method table.

### D-10.4 THE FROZEN HOMEPAGE IS AUTHORITATIVE OVER EVERY DETAIL PAGE
**Client: homepage is authoritative; stamp CityScapes now.** Where a detail page contradicts
the frozen homepage — She Leads Change, Food systems, CityScapes — the homepage wins and the
detail page is corrected when its turn comes. **`journeys-cityscapes.html` gets the "demo
content" stamp immediately**: it is the only one of the three carrying none, so a reader
cannot currently tell a template from finished work.

---

## 21 August — rulings for the SITUATION INDEX page (the "Now" destination)

Context. The frozen homepage's `Now` link points at `public/design/v3/intelligence.html`
in all three of its nav surfaces, so that file *is* the situation index. It is a pre-freeze
prototype: 887 lines, 84.8% of it its own `<style>`, roughly a fifth of that CSS dead, and
structurally unintegrated with the freeze — no tier system, no `.im-head` (zero
occurrences), 17 `.wide` against 0 `.wrap`, no `--nav-h`, no `scroll-padding-top`, no
`--hit`, no skip link, no `<main>`, no SECTIONS panel, and `.navscroll` set to
`display:none!important` below 767px so a phone gets the wordmark and GIVE for the page's
entire length. Its colour tokens and type scale are byte-identical to the frozen page; its
rail is a parallel mechanism (`.rail-l`/`.rail-r`/`--lw`) to the frozen `.rl` contract.
Audited 21 August; ~20–25% survives a rebuild.

### D-11.1 THE ORDERS BAND COMES OFF THE PAGE
**Client: cut it for now.**

The band presented six court and tribunal filings as record — National Green Tribunal
`Order, OA 412/2026`, Supreme Court `Record of proceedings`, MoEFCC
`Gazette draft, S.O. 3118(E)`, NGT `Order, OA 88/2024`, CPCB
`Direction under section 18(1)(b)`, Delhi High Court `Order, WP(C) 2201/2026` — each with a
holding sentence. **None is checkable anywhere in the repository**, and `OA 412/2026` reuses
the AQI figure 412 as a case number, which is how it can be identified as invented rather
than mis-transcribed. The same fabrications are live in `situation-air.html`.

Nothing is public — `public/design/` is deleted before deploy — but an orders tracker was
becoming a *designed feature* demonstrated with invented citations of named Indian courts
against a real NGO. That is a different class of risk from a wrong number.

The band is cut from the index. **The idea is kept in the spec as a named future section so
the composition reserves its place.** It returns when real filings exist with attached
documents, which needs an order content type and the source-URL field the schema lacks (§4
of the situation brief, items 5 and "an order/direction content type entirely").

### D-11.2 THE INDEX RENDERS THE FROZEN SIX, WITH WINDOWS ENFORCED
**Client: the frozen six, windows enforced.**

Air · Yamuna · Heatwave · Forest Fires · Forest Loss · Climate Event. STP, Night noise and
Out of River leave the page — STP folds into Yamuna's inner page, Out of River is an
outcome and lives in the Impact slot (D-00.2), Noise was never on the keep list.

**Heatwave's window is shut, so per §4.2 it does not render at all** — no dormant cell, no
OUT OF SEASON row, no toggle to reveal it. The index therefore shows **five situations
today and six in season**, and the page must be composed so a changing count is not a
defect. This retires the prototype's reader-facing "All 9, in and out" control: a dormant
situation is reachable only through the admin override, which does not exist yet.

**Consequence for the vocabulary.** The nine-slide deck was doing double duty — `h-noise`
existed to demonstrate DEMO DATA, `h-heat` to demonstrate OUT OF SEASON. With both gone the
deck can no longer teach the four state words. **The teaching moves to the legend band,
where specimens belong and where they can be labelled as specimens** rather than
impersonating situations.

### D-11.3 THE INSTRUMENT REPLACES `/now`, AT `/now`
**Client: replace it, same path.**

Two different pages were called "Now": the shipped route `app/now/page.tsx` (a light Tailwind
two-section card list — one situation card and three story cards, none of the frozen
language) and this prototype, which is what the homepage actually links to. They are
different products, not two versions of one page.

The prototype's architecture becomes `/now`. The card list is retired. This keeps the
existing sitemap entry, the existing `title`/`description`, and needs no redirect; the nav
label stays **Now** as frozen, and **Environmental Intelligence** survives as the footer's
destination label, which is already how the frozen homepage names it there. The prototype's
`<title>` hyphen is corrected to the site template's em dash.

### D-11.4 THIS PAGE CARRIES THE SITE'S FIRST FULL SEO LAYER
**Client: full — metadata, structured data and a share card.**

Today the whole repository has one JSON-LD block (`NGO`, homepage only), no canonical on any
route except `/`, no `twitter` on any route, and no OG image infrastructure of any kind.

This page gets: a canonical; `openGraph` **restated in full** (layout's object is replaced,
not merged, per the comment at `app/layout.tsx:37`); the repo's first `opengraph-image`; and
JSON-LD — `ItemList` of the rendering situations, `Dataset`/`Observation` per reading,
`BreadcrumbList`, and `WebSite`+`SearchAction` since `/search` exists. The builders go beside
`organizationJsonLd()` in `lib/org.ts`, which is the established home and is unit-tested.

**This adds a backend requirement:** `Dataset` markup needs a source URL per reading, and
neither `liveDataSchema` nor `evidenceSchema` has a URL field. Structured data that names a
source it cannot link is the machine-readable version of the honesty problem this site
exists to avoid.

### Flagged, not ruled — the fact base does not cover readings

`2026-08-21-SOURCE-FACTS.md` is *"Source facts for the work/about/impact chapter"* and
contains **no environmental figures at all**. So `412`, `0.0`, `118`, `1.65M ha` and `512mm`
trace only to this ledger, where they appear as *design examples in the frozen homepage's
ticker* — which is circular, because the homepage took them from these prototypes. Gate #11
of the situation brief ("every figure traced to SOURCE-FACTS or a named owner ruling")
cannot currently be met for a single reading on this page.

**This is a constraint, not a blocker, and it should be designed to rather than papered
over: no figure on this page may need to be true.** Every reading is a stamped specimen
until its feed exists (D-10.1). SOURCE-FACTS needs a readings section that says exactly
that. Noted here so the next pass does not mistake ledger mentions for provenance.

One convenience: with D-11.2's windows enforced, Heatwave does not render — and `47.8` was
the one headline figure with no ledger mention at all. The five situations that do render
are exactly the five whose headline figures have a ruling behind them.

---

## 21 August — rulings for the AIR PAGE LAYOUT (AD-14, Stage 1)

Stage 1 closed. Composition, band ledger and wireframes are in
`docs/design/2026-08-21-AD-14-situation-air-layout.md`. Twelve bands plus the frozen
footer, ~9,710px estimated at 375×812 against the homepage's measured 10,244 at the same
viewport. Adjacency proven zero-clash across all twelve boundaries on declared hexes;
to be re-proven on *rendered* colour before Phase 3 closes.

### D-12.1 THE PAGE'S THESIS IS THE READING BESIDE THE HOLE
**Client: approved.** The reference the client supplied (`vayu-gamma.vercel.app`) was read
at the network layer: every figure is served from its own Vercel API routes off seeded
fixtures, identical JSON returns minutes apart, a nonsense city returns Delhi's
coordinates, its attribution is labelled in its own UI as a *"Spatial Noise Model"*, its
pipeline telemetry is invented milliseconds, and its court dockets do not exist — all under
a `LIVE` chip.

Swechha's page takes the inverse position, and it is the only one available: **"Every
reading against its published limit. Every gap named."** That is the method line under the
`<h1>` and it is also the architecture — **four of the twelve bands are direct inversions
of a VAYU feature** (`measured`, `watched`, `sources`, `next`). This is forced rather than
chosen: `2026-08-21-SOURCE-FACTS.md` carries no environmental figures at all, so per the
note at the end of the D-11 block **no figure on this page may need to be true.** The
composition is required to read *better* when every value is stamped, not worse.

### D-12.2 h1 IS "DELHI'S AIR"; THE HUMAN BAND COUNTS NAMED POPULATIONS
**Client: DELHI'S AIR · named exposed populations.** The `<h1>` is the constant naming the
subject, per D-10.2, and it is the shortest of the three candidates — it sets cleanly at
the `--t-d1` phone ceiling of 43.2px at 375 without wrapping.

The human-impact band (`people`, band 2) counts **named exposed populations**, each label
stating which population it counts (§5.16), **not** Swechha's own school footprint. Note
the consequence: this band's figures are unsourced slots, where the footprint option would
have been sourced. It is the more instrument-like choice and the client took it knowingly.
**No total, and no row summing the others** — a stated total is forbidden.

### D-12.3 THE SPATIAL DEVICE IS A COVERAGE MAP, DRAWN IN EXISTING MARKS
**Client: coverage map.** Not a pollution surface. It shows **where the monitors are** and
hatches everything nobody measures — the direct inversion of the reference's ward-level
plume and its per-facility "enforcement registry", neither of which it has data for.

**Constraint that shapes it:** §9.4 permits only three non-type marks site-wide — the `→`
arrow, the six-band scale and the halftone dot screen. A conventional map (basemap, tiles,
pins, legend icons) would be the site's first icon set, on the page meant to read as an
instrument rather than an app. So the map is drawn **entirely in marks the language already
owns**: 1px `--hair` boundaries, the `.state i` 9×9 square filled for a wired monitor and
hatched for an unwired one, and the 45° hatch as an area fill for unmonitored ground. No
basemap, no tiles, no colour, no third-party library. **It can only draw what is measured**,
which is the point of it.

### D-12.4 THE FIVE SIBLING SITUATIONS ARE NAMED AND NOT LINKED
**Client: name five, link none.** Band 11 (`situations`, t4) lists Yamuna · Heatwave ·
Forest Fires · Forest Loss · Climate Event as plain names in `--fg-2`, unlinked, with one
`.act` to `/now`. Show the hole rather than fake the door — consistent with D-12.1, and it
avoids sending a reader to `situation-soon.html` five times out of six.

**No count is stated on the band**, because per §5.8 the set that renders varies with the
season and an `aria-label` claiming completeness would be false.

### D-12.5 THE SECOND MUSTARD FIELD COMES OFF
**Ruled by the branding document, not by preference.** `--mustard` is a ground **exactly
once on the whole site**, at `#give`, *"and that single field is what licenses it as a
control colour everywhere else."* The prototype's `.sub` "Watch your ward" band is a second
mustard field. It comes off; the band (now band 12, `ward`, t3 on `--paper-2`) keeps one
`.b-1` primary button in mustard, which is the grammar it should have had.

**This closes the open question at §1.7 of the situation brief.** Note also: `--mustard-ink`
on `--paper-2` measures **4.50:1**, exactly on the AA line — legal as a 2px focus outline
on this band, and forbidden as body colour.

### D-12.6 THE STATE CHIP BELONGS TO THE READING, NOT THE MASTHEAD
**Ruled by §5.3.** The `DEMO DATA` chip sits top-right of **the reading's own frame** inside
the hero, travelling with the reading. It may not sit under the `<h1>` as a page-level
badge: *"a corner badge reading LIVE over an editor-entered figure would be the single
worst thing on the site."* There is no page-level state badge anywhere on this page.

### D-12.7 R-1 — THE 45° HATCH MAY MEAN "NOTHING IS MEASURED HERE"
**Client: approved as recommended.** The hatch's meaning widens from *a placeholder or demo
value* (`.state.demo`, `.tag-demo`, the archive's placeholder frames) to include **an area
nobody is measuring**, as an area fill on the coverage map.

Reasoning on the record, because §5.7 makes a fill style a semantic and widening one needs
a ruling: it is arguably not a widening at all. Both cases say *there is no real
measurement behind this*. The map is substantially weaker without it — the alternative was
bare ground with a labelled boundary, which reads as "no data drawn" rather than "no data
exists."

### D-12.8 R-2 — `watched` BECOMES A WARD LIST AT ≤560 RATHER THAN TAKING A LICENCE
**Client: the list, as recommended.** The band estimates 880–950px at 375, at or over the
900px phone cap. The frozen page has exactly **two** licensed exceptions (the heroes, and
`record` by name) and the branding document is explicit that you *"do not quietly breach and
do not damage a component to hit the number."*

So at ≤560 the map becomes a **ward list** — the same hairline-ruled rows, the same filled
and hatched squares, no plan geometry — and the map renders from 561 up. **This is not a
degradation:** the list carries identical information and is the honest form on a 335px
measure. **The exception count stays at two and this page needs no licence.**

### D-12.9 R-3 — THE YEAR STRIP IS 52 WEEKS ON PHONE, 365 DAYS ON DESKTOP
**Client: 52/365, as recommended.** Measured: at 375 the `.wrap` measure is 335px after the
20px gutters, so 365 ticks is **0.92px per tick with zero gap** — sub-pixel aliasing that
renders as meaningless stripes, not a strip.

Rejected: 12 months everywhere (throws away the desktop's real resolution) and 365
everywhere with a phone scroller (the site permits **exactly two** horizontal scrollers and
both are spoken for). 52/365 follows the standing mobile rule — *never solve a mobile
problem by making type bigger; solve it by cutting the frame* — and a week is an honest unit
on a phone.

**Binding consequence: the label changes with the unit.** *"{n} days above {threshold}"* at
desktop, *"{n} weeks with a day above {threshold}"* at phone. A label that survives the
breakpoint unchanged is a false claim at one of the two widths.

### D-12.10 R-4 — GREEN IN BAND 9 AGAINST RED IN BAND 6 IS ACCEPTABLE
**Client: approved as recommended.** Red lives in bands 1 and 6, green in band 9 — **three
bands apart**, where the homepage's own separation is eight. Accepted because **bands 7 and
8 carry no hue at all**, so the separation is real rather than nominal. Red and green are
never in the same band and never in adjacent bands, which is the actual rule.

### Carried into Phase 1 — the two named build-order departures

`watched` and `record` are the two expensive bands and the two most likely to be cut for
budget, so they are built **last** within their phase and **the page must read without
them.** Band 8 (`next`) is built **early** rather than late: it is type only, the cheapest
band on the page, and the one that proves D-12.1. If it does not read, the thesis is wrong
and that is worth knowing before six data objects are built.

### D-11.5 THE OWNER SUPPLIES THE SIX VALIDITY WINDOWS
**Client: I'll supply them now.**

`#windows` is the band that teaches why the page's length changes — why five situations
render in August and six in season. Every cell in it is currently a slot: the windows exist
in neither `lib/content/schemas.ts` nor `2026-08-21-SOURCE-FACTS.md`, and
`getActiveSituations()` (`lib/content/index.ts:103`) filters on `status` with **no date logic
at all**, so "a closed window does not render" is enforced today by an editor remembering.

The band ships with real windows rather than as an explainer over an empty table. Awaiting
the owner's six answers; until they land, `#windows` is specified and unbuildable, and it is
the only band in AD-13 in that state.

### D-11.6 THE FROZEN HOMEPAGE IS AMENDED FOR THE TWO LINK DEFECTS
**Client: amend it for both.**

The freeze is not a licence to leave a link pointing at nothing. Two defects, both found on
21 August while briefing the index:

1. **A Record door links into the band D-11.1 cut** — `s-record-door` →
   `intelligence.html#orders`. See the flag below: this is not only an href.
2. **Five ticker links point at anchors nothing generates.** The homepage hardcodes
   `intelligence.html#h-air`, `#h-yamuna`, `#h-fire`, `#h-forestloss`, `#h-monsoon`; the only
   situation record in the repo has the slug `delhi-air-quality-2026`, and no field maps a
   situation to an anchor. **The five would break silently the day `/now` becomes a real
   route** — the page would load and simply not scroll. Not previously spotted.

The anchor reconciliation happens when the route is built, because it must match what the
route actually generates; it adds an `anchorId` (or a ruled slug-to-anchor derivation) to the
backend requirements. The homepage's five hrefs are then corrected in the same pass. Recorded
now so the route cannot be built without closing it.

One thing already agreed: `h-heat` appears **zero** times in `home.html`, so the inbound-link
set and D-11.2's render set already agree. That is luck, not design, and it will stop being
true the first time a situation with a shut window is linked from the homepage.

### Flagged for a ruling — the Orders and policy door is a promise, not just a link

Amending the href is not enough. The door reads, on the frozen page:

> `Compiled weekly` · **Orders and policy** · *"Every environmental order from the courts,
> the tribunal and the pollution boards, dated, tagged, with the source document attached."*
> · *"Last compiled 18 August 2026"*

With the band cut, that promises a weekly-compiled order tracker with attached documents,
where: no order content type exists, no source-URL field exists (§4 item 5 of the situation
brief), and the only implementation was the six fabricated citations D-11.1 removed. The
door also carries a typed date the branding doc already ledgers as a live residue (§9.1).

**A ruling is needed on the door itself** — re-point and rewrite it to promise what the page
delivers, keep it pointing at the reserved band with honest copy, or drop to a two-door
Record row. Not taken unilaterally: the door's copy is the owner's and the file is frozen.

Noted while reading it: the neighbouring doors carry two of the handoff's own open items —
`Updated every hour` is the only present-tense eyebrow on the site, and `9,400 days on file
since 2000` is a stated total on a page whose rule forbids them. Out of scope for the index
pass; logged so they are not lost.

### D-12.11 A TICKER CELL POINTS AT ITS OWN SITUATION PAGE IF ONE EXISTS
**Client: set the rule.** Raised by the owner, who found two different Air destinations on
the frozen homepage and asked whether they should be one page. They should.

Verified in `public/design/v3/home.html`:

| entry point | line | destination as frozen |
|---|---|---|
| hero deck, Air slide, *"The full instrument →"* | 3155 | `situation-air.html` |
| campaigns band, *"Runs against Delhi's air"* | 3782 | `situation-air.html` |
| **ticker, AIR cell (412)** | 3391 | **`intelligence.html#h-air`** |

Two of three went to the instrument; the ticker alone went to the situation **index** and
landed the reader on a row in a list. Systematic rather than a typo — every ticker cell did
it (`#h-yamuna`, `#h-fire`, `#h-forestloss`, `#h-monsoon`); only the rightmost Impact cell
differed, pointing in-page at `#impact`.

**Why the ticker loses.** (1) The cell shows two of the six parts of a reading — the numeral
and its rule — and the homepage's own promise for that click is *the full instrument*: the
apparatus behind a number the reader has already seen. A list of siblings completes nothing.
(2) Otherwise the site holds two answers to "where does Delhi's air live?", which is the
contradiction D-10.4 exists to kill. (3) The index already has **four** entry points — all
three nav surfaces plus the footer — before the ticker spends a click on it. (4) `#h-air` is
one of nine ids on a pre-freeze page that D-11.2 cuts to six and D-11.3 rebuilds at `/now`;
an anchor into it is a link with a short life, where a link to the situation page is stable.

**In fairness it was a sensible interim, not a blunder:** five of the six situations have no
page, so the index anchor is the only thing four of those cells can currently point at.

**THE RULE.** *A ticker cell points at its own situation page if one exists, and at the
index otherwise.* No special cases, and it degrades honestly — the same logic as D-12.4's
name-five-link-none.

**Applied now,** link-only, zero layout or console impact, band ledger untouched:
- Air cell → `/design/v3/situation-air.html`
- Yamuna cell → `/design/v3/situation-yamuna.html`
- Forest fire, Forest loss, Climate Event → **unchanged**, index anchors, by the rule
- Impact cell → **unchanged** (`#impact` is in-page and correct; its destination is the
  Impact page once that exists, per D-00.2)

**The rebuilt Air page takes the canonical path.** Phase 1 builds at
`situation-air-v2.html` so the pre-freeze fork stays readable side by side during the
content re-flow, and **it replaces `situation-air.html` when the build closes.** So this
link is correct both before and after the rebuild, and no `-v2` filename ever reaches a
link.

### Flagged by the same check, NOT ruled — two rotting links on the frozen homepage

Both need a ruling because the homepage is frozen; neither is in the Air page's scope.

1. **The record door points at `intelligence.html#orders`** (line 4069). **D-11.1 cut the
   orders band off that page.** The link is dead on arrival.
2. **The Climate Event ticker cell's anchor is `#h-monsoon`** (line 3395) — the frozen six
   name it *Climate Event*; the id is a stale name carried from the nine-situation set. It
   still resolves today and stops resolving when the index is rebuilt.

Note the general hazard this exposes: **`#h-noise`, `#h-stp` and `#h-waste` stop existing
when the index is cut from nine to six**, so any anchor into `intelligence.html` is a link
with an expiry date. Worth a sweep of every `intelligence.html#` anchor at the point the
index is rebuilt.

---

## 21 August — rulings on DATA SOURCES for the air page (AD-15)

Prompted by the owner asking whether the art direction had settled on infographics and
whether the data sources could be finalised. Infographics were already settled (D-12.3).
The source research invalidated **two** things in AD-14, one of them badly, and added a
band.

### D-13.1 THE FEED REACHES THE PAGE AS COMMITTED JSON, NOT AS A RUNTIME FETCH
**Client: scheduled job commits JSON.**

The constraint: this repository has **no HTTP client**, and every route is prerendered —
`CLAUDE.md` states no route may be `ƒ`. So "link an API" is a decision about what the site
is, and each option earns a different state word. Rejected: build-time fetch (freshness
becomes a deploy-cadence question), ISR (the route stops being purely prerendered and the
architecture rule would have to be reopened), client-side fetch (the only option that can
carry LIVE, but it puts a key in the client and the reading arrives after paint).

**Chosen: a scheduled job fetches, validates and writes JSON into the repository; the build
reads it as content.** The site stays 100% static with zero new runtime dependencies, and
nothing about the rendering model changes.

**The honesty consequence, stated plainly: this earns `PERIODIC`, and never `LIVE`.** That
is not a compromise — it is the correct label anyway. Per §3 of the situation brief, **CPCB
has no stable public API and a CPCB bulletin is a published bulletin rather than a feed**, so
`PERIODIC` is the honest word for a CPCB-sourced figure even after something is wired.
`LIVE` remains unreachable on this page by construction, which means D-10.1 is satisfied
structurally rather than by remembering.

### D-13.2 BAND 8's HOOK WAS FALSE AND THE BAND IS REBUILT
**Client: name SAFAR, link it, and say why we do not restate it.**

**SAFAR** (IITM Pune, operationalised by IMD) publishes a **72-hour advance AQI forecast for
Delhi**, and CPCB republishes it on its own site. So AD-14's specified hook — *"Nobody is
forecasting this for you"* — **is false**, and the prototype's empty state (*"Last checked
for a forecast feed…"*) is misleading in the same way, because it implies no forecast
exists.

This was caught by source research and not by review. **It would have shipped.** It is on the
record because it is precisely the failure the fact-checking gates exist to catch, and
because the same class of error — a hook asserted rather than checked — is the cheapest one
to make on a page whose whole claim is honesty.

The band now names the real forecaster, links the official portal, and states Swechha's own
position: **it will not republish a forecast it cannot attach a source document to.** Rejected:
reproducing SAFAR's forecast visually under their name (it means publishing a figure this
page cannot source per-figure, against its own rule) and cutting the band (leaves the
reader's most natural question unanswered on a page that promises to name its gaps).

It still inverts the reference, more sharply than before: VAYU fabricates a 72-hour forecast
while a real one sits two clicks away.

### D-13.3 THE YEAR SERIES IS AQI SINCE 2015, AND THE PAGE SAYS SO
**Client: AQI since 2015, and say so.**

India's National AQI launched **April 2015**; the AQI record runs from 2015 — about eleven
years. Before that, NAMP monitored SPM / RSPM / PM10: **a different quantity by a different
method.** So the prototype's 2001→2026 scrubber claims a series that was never measured,
on top of typing 2026 as "now" in four places.

Rejected: a longer PM10 series with a drawn method break (a different quantity either side
of 2015, and the break needs more explaining than it earns) and both series stacked (the
most expensive band on the page).

**The short series is the hook.** *India has only had an air quality index since 2015* is
news to most readers and it is this page's thesis in one line — the gap is the story. This
also shrinks the band: eleven bars rather than twenty-six.

### D-13.4 STUBBLE BURNING GETS ITS OWN SEASONAL BAND
**Client: its own band, seasonal.**

Source: **NASA FIRMS** (free `MAP_KEY`, near-real-time within ~3 hours), with **CREAMS /
IARI** as the Indian institutional counterpart to cite alongside.

**The device is "the same fires, counted two ways", and the reason is the finding:** a fire
of 1 km² is reported as **one** hotspot by MODIS and **nine** by VIIRS, and NRT counts are
indicative by design and run hot, with science-quality data lagging months. Every headline
farm-fire count depends on which sensor produced it and **almost none of them say which.**
A dashboard cannot run this device because it undermines its own number; this page can,
because naming the uncertainty *is* the product.

**The band is shut outside the burning season**, which makes it this page's live test of
`OUT OF SEASON` and of D-11.2's rule that a closed window does not render at all. Two
consequences inherited from §5.8: **the page's band count varies with the season**, so no
composition may depend on thirteen; and **the band carries no hue.** Fire begs for red and
red is reserved for a published limit broken — there is no published limit on a fire count.

### D-13.5 THE COMPOSITION IS NOW THIRTEEN BANDS, AND IT NEEDS NO LICENCE
Stubble enters at position 5, beside `sources`, because biomass burning is one of the
contributors and stubble is its seasonal spike. The chain was re-derived rather than patched.

| # | id | tier | ground | hue |
|---|---|---|---|---|
| 1 | `top` | t1 | `#0D0D0B` | red |
| 2 | `people` | t2 | `#151512` | none |
| 3 | `measured` | t2 | `#F3F2F0` | none |
| 4 | `sources` | t3 | `#151512` | none |
| 5 | `stubble` | t3 | `#0D0D0B` | none |
| 6 | `watched` | t2 | `#151512` | none |
| 7 | `record` | t2 | `#0D0D0B` | red |
| 8 | `india` | t3 | `#151512` | none |
| 9 | `next` | t3 | `#0D0D0B` | none |
| 10 | `doing` | t2 | `#F3F2F0` | green |
| 11 | `method` | t2 | `#0D0D0B` | none |
| 12 | `situations` | t4 | `#151512` | none |
| 13 | `ward` | t3 | `#ECEBE8` | mustard (control only) |
| — | `footer` | — | `#151512` | none |

**Adjacency: zero clashes across all thirteen boundaries.** Red in 1 and 7, green in 10;
nearest red-to-green approach is 7→10, three bands apart, with 8 and 9 carrying no hue —
the same reasoning that carried D-12.10.

**Phone budget ≈ 9,466px at 375×812** against the homepage's measured 10,244 at the same
viewport, **with every band inside the 900px cap.** Note the reason: D-12.8 turned `watched`
into a ward list at ≤560, which took it from ~880 to ~660 at 375. **So this page's only
licensed exception is the hero, which every page gets.** The exception count does not rise.

### D-13.6 A SEVENTH QUESTION: WHAT HAS BEEN SPENT ON IT?
**Owner: add funds allocated and utilised, nationally and state-wise.**

This is the money version of D-12.1, and it is the strongest addition to the page since the
spine was set. **Allocated is the claim; utilised is the reality; the difference is the
hole** — which is the page's thesis applied to a budget instead of a sensor.

**It is genuinely sourced, unlike the band D-11.1 had to cut.** Candidate sources, all
public and all attributable: the **National Clean Air Programme (NCAP)** allocation and
release figures for the non-attainment cities; the **15th Finance Commission air-quality
grants** to million-plus cities; **CPCB's PRANA portal**, which tracks NCAP implementation
and city action plans; **CAQM** for NCR specifically; **CAG** performance audits; and — the
most citable of all — **Lok Sabha and Rajya Sabha question answers**, which publish
state-wise allocated-versus-utilised tables with a question number and a date.

Note the contrast worth keeping in view: the orders band was cut because its dockets were
invented. **Parliament answers are real dockets** — numbered, dated, downloadable — so this
band can do what that one could not, provided the document is attached.

**Placement: its own band at position 9, beside `india`.** It is a substantial data object
(a national pair plus a state-wise breakdown) and it carries a distinct question, so it does
not fold into another band. It must **not** go inside `doing`: that band is green because
green means *what Swechha has done*, and government expenditure is not Swechha's doing.

**Hue: none, and the gap is carried by form.** Red means *a published limit broken* and an
underspend is not that; green is spoken for. So the device uses the rail contract instead —
**allocated is the full rule, utilised is the filled portion, and the shortfall is the
unfilled remainder.** The gap does the work with no colour at all, and it scales to a
state-wise list on the register-row grammar, which is already solved (§5.5).

**Scope:** the NCR states named individually (Delhi, Haryana, Uttar Pradesh, Rajasthan,
Punjab) plus the national pair, with an `.act` to the full table. Not all twenty-eight
states inside the band.

**Label: `PERIODIC`.** These are annual, PDF-and-Parliament figures, so this is an
editor-entered published figure, which is exactly what `PERIODIC` names. No feed exists and
none is expected.

**The discipline this band needs, stated before it is built.** It is the one band that makes
an accountability claim about named state governments, and that is a different register from
the rest of the page. It is squarely within Swechha's remit and the data is the government's
own — but: **the figure is quoted, the document is attached, and no inference is drawn beyond
the arithmetic.** No "wasted", no "failed", no "diverted". The gap speaks; the page does not
editorialise over it. Same rule that governs every other reading here.

### D-13.7 THE COMPOSITION IS FOURTEEN BANDS — the same count as the frozen homepage

| # | id | tier | ground | hue | question |
|---|---|---|---|---|---|
| 1 | `top` | t1 | `#0D0D0B` | red | the instrument |
| 2 | `people` | t2 | `#151512` | none | Who is in it? |
| 3 | `measured` | t2 | `#F3F2F0` | none | What is actually being measured? |
| 4 | `sources` | t3 | `#151512` | none | Where is it coming from? |
| 5 | `stubble` | t3 | `#0D0D0B` | none | *(seasonal)* the fires, counted two ways |
| 6 | `watched` | t2 | `#151512` | none | Which part of the city is watched? |
| 7 | `record` | t2 | `#0D0D0B` | red | Is it getting better? |
| 8 | `india` | t3 | `#151512` | none | And where does Delhi stand? |
| 9 | `money` | t2 | `#0D0D0B` | none | **What has been spent on it?** |
| 10 | `next` | t3 | `#151512` | none | What happens next? |
| 11 | `doing` | t2 | `#F3F2F0` | green | What is being done about it? |
| 12 | `method` | t2 | `#0D0D0B` | none | What is measured and what is not |
| 13 | `situations` | t4 | `#151512` | none | the other five, named |
| 14 | `ward` | t3 | `#ECEBE8` | mustard (control only) | the one ask |
| — | `footer` | — | `#151512` | none | frozen footer, whole |

**Adjacency: zero clashes across all fourteen boundaries**, re-derived rather than patched.
Red in 1 and 7, green in 11; **nearest red-to-green approach is 7→11, four bands apart**,
with 8, 9 and 10 carrying no hue — wider separation than before the money band was added.

**Phone budget ≈ 10,226px at 375×812** against the homepage's measured 10,244 at the same
viewport. **Every band inside the 900px cap; the hero is the only licensed exception**, which
every page gets. Quoted with its viewport height per §2 of the branding document.

**Two counts that must not become dependencies.** The band count is **fourteen in season and
thirteen out of it** (D-13.4), and the question spine is now **seven**. Nothing in the
composition may be a function of either number — no stated total, no `repeat(14,1fr)`, no
"seven questions" typed anywhere.

### D-11.7 THE INDEX CARRIES THE ARGUMENT, NOT A SECOND COPY OF THE INNER PAGES
**Client, challenging AD-13's own ledger:** *"Do we need to put what is in season, what is
ordered, and what cadence blocks on this page? Anyway we have situation specific info in
respective situation page… we ofcourse can have the methodology used, purpose of having this
or doing this, work in progress, how data should inform action, data should inform policy."*

Put to the art director rather than answered from the spec. **Two of the three challenged
bands go.**

- **`#orders` — CUT.** D-11.1 kept the idea *"in the spec as a named future section"*, and
  the spec is the document, not the page. With D-11.6 re-pointing the Record door away, the
  band was a section with no inbound link, no contents, and therefore no button — which §5.8
  requires of every section. `BRANDING §4.3`: an absent thing renders nothing. The
  reservation and the conditions for its return are held in the AD-13 document, at zero
  pixels on the page.
- **`#windows` — THE TABLE IS CUT, THE RULE SURVIVES** as one row of `#rules`. The client is
  right that the table is per-situation reference data, and every situation page carries its
  own window **by construction** — the window tag is a component of the six-part reading
  (`home.html:643`), so a situation page cannot render its reading without it. But a reader
  on an inner page never experiences a *changing set*, so the rule — why five situations
  render in August and six in March — belongs to the index alone. **~780px saved. This page
  now needs zero window values** (see D-11.5, which is unaffected).
- **`#sources` — KEPT.** The art director pushed back and the client accepted the pushback.
  Its rows are **sources, not situations**: IMD's cadence appears on Climate Event's page and
  again on Heatwave's, and nowhere on any inner page can a reader see that both readings rest
  on the same unwired source. Five PERIODIC chips across five pages teach five small things;
  one table with seven rows and no LIVE in its state column teaches the one big thing. It is
  also, already, **the client's "work in progress" in its honest form** — a receipt rather
  than a mission statement; moving it to prose would swap evidence for a claim. Link audit
  on the record: `#windows` 0 inbound, `#orders` 0, provenance band 1 — the page's only one.

**In their place, two bands, because the five things the client named are two arguments.**
*Work in progress* is a status, not an argument, and its honest form is `#sources`. *Purpose*,
*data→action* and *data→policy* are one argument; *methodology* is the other.

- **`#rules`** — the methodology as a **register of five rules, not an essay**, on the frozen
  ledger-row component. Every row is a rule the rest of the page is the visible evidence for.
- **`#why`** — the argument as three door cards, **READ / ACT / POLICY**, last band. The
  card's figure row carries a **destination phrase, not a figure**, which also corrects the
  two frozen doors that put an unsourced total there.

**Accepted knowing the direction: this makes the page ~825px LONGER** (−971 cut, +1,774
added), and the band count stays 6 → 6. What changed is not volume but that all six bands now
pass the client's own test. Recorded because "this seems unnecessary" normally means a
shorter page is wanted, and this is not that.

### D-11.8 THE POLICY ARGUMENT IS CONDITIONAL, AND STAYS CONDITIONAL
**Client: correct — keep it conditional.**

Checked against the record before drafting: `2026-08-21-SOURCE-FACTS.md` supports Swechha's
**method** (the "Wheel of Change" naming media and advocacy and systemic change; two named
research programmes) and contains **not one instance of Swechha's data changing a rule, a
limit, an order or an official decision.**

So the POLICY door argues what a record is *for*, not what it has achieved — **licensed by
the client's own word**, who wrote that data *should* inform policy, not *has*. Standing
prohibition on that door and anything descended from it: no *"led to"*, *"influenced"*,
*"cited in"*, *"resulted in"*; no named authority or docket; **no figure of any kind**; and no
past tense a reader could take as achieved influence. Precedent: D-07.1 withdrew "audited"
for claiming one word more than the record supported.

It flips to the past tense on the day a real instance exists and is sourced — and that must
remain a copy change, not a redesign.

### Measured, and recorded against D-11.6 — the amended Record door costs height

The approved door copy was measured in place, CDP `Emulation.setDeviceMetricsOverride`, four
states swapped in one document so the delta is the copy and nothing else:

| state | `#record` @375 | Δ | `#record` @1440 | Δ | h3 lines @1440 |
|---|---|---|---|---|---|
| as frozen (the fabricated promise) | **1,393.5** | — | **1,236.2** | — | 1 |
| **as approved** | **1,415.2** | **+21.7** | **1,289.5** | **+53.3** | **2** |
| approved, h3 → "The sources on file" | 1,415.2 | +21.7 | 1,260.2 | +24.0 | 1 |
| that, plus a one-sentence body | 1,393.5 | 0.0 | 1,236.2 | 0.0 | 1 |

Zero horizontal overflow in all eight measurements. Method validated on the way past: the
as-frozen state reproduces the published ledger exactly — **1,393.5 at 375** and a document
height of **10,852.4 at 1440** against the ledger's 10,852.

**So `record`'s licensed figure (D-09.7) moves from 1,393.5 to 1,415.2 at 375.** It deepens
an existing licensed breach rather than creating a new one, and it is recorded here rather
than absorbed silently. 29.3px of the 1440 cost is nothing but the `<h3>` wrapping to a
second line, and a zero-cost variant exists — both are on the table whenever the client wants
them. **The approved copy stands as approved; it was not trimmed unilaterally.**

---

## 21 August — rulings on HEALTH EVIDENCE and the overview device (AD-16)

Owner supplied three research figures — Lancet on deaths, Lung Care Foundation on children,
University of Chicago on life expectancy — with the requirement that the page be *"360
degrees, easy visually, with a clear pan-India perspective… can't have clutter."* All three
were verified before being specified. Two differ materially from their headline versions.

### D-14.1 THE THREE FIGURES REBUILD BAND 2. THEY DO NOT ADD A BAND.
The anti-clutter ruling, and it is the reason no band was added. Band 2 `people` was
specified as *"named exposed populations"* with **unsourced specimen slots** — D-12.2
accepted that knowingly. These three figures replace those slots, and band 2 goes from the
thinnest band on the page to the second-best-sourced after `doing`.

They also carry **three different units**, which is why the band does not read as a list:

| | figure | scale | unit |
|---|---|---|---|
| a **count** | deaths per year | India | lives |
| a **proportion** | share of adolescents | Delhi | share |
| a **duration** | years of life expectancy | Delhi **and** India | time |

**One idea unifies them: every one of these figures is measured against a limit India has
not adopted.** That is the Delhi-NCR focus and the pan-India perspective inside a single
band, which is what the owner asked for.

### D-14.2 DEATHS: THE SAME HARM, COUNTED AGAINST TWO LIMITS
**Owner: both, as the band's device.**

Verified. *Lancet Planetary Health*, December 2024 — *"Estimating the effect of annual PM2·5
exposure on mortality in India: a difference-in-differences approach."* The study yields
**two** tolls:

| measured against | limit | toll |
|---|---|---|
| **WHO guideline** | 5 µg/m³ | **~1.5 million deaths per year** |
| **India's own NAAQS** | 40 µg/m³ | **3.8 million deaths, 2009–2019 — 5.0% of all mortality** |

**India's standard is eight times looser than the WHO's**, and that is the whole device: the
same harm, counted against two limits. It is the deaths equivalent of D-13.4's
MODIS/VIIRS device, and it makes the masthead's promise — *"Every reading against its
published limit"* — do real work on the most serious number the page carries.

**On the record because the owner should own it knowingly:** this is implicitly an advocacy
position, because it shows India's standard as the looser of the two. It is defensible,
sourced and arithmetically plain, and the page draws no conclusion beyond the comparison —
same discipline as D-13.6.

### D-14.3 CHILDREN: THE FIGURE CARRIES ITS OWN CONFOUND
**Owner: include with the BMI finding stated.**

Verified, and **the attribution is looser than the headline.** Lung Care Foundation (New
Delhi) with Pulmocare Research and Education Foundation (Pune), published in **Lung India,
September 2021**; 4,300+ children **aged 13–17, in Delhi**. Asthma or airflow obstruction:
**29.4% on spirometry** (21.7% by ISAAC questionnaire). So "one in three" is sound.

**But the study's own conclusion is that obesity was the risk factor strongly associated with
asthma** (39.8% vs 16.4% overweight or obese). So *"every third child has asthma because of
air pollution"* is **not what the paper found**, and stating it that way would be the same
class of error as D-13.2's forecast hook — a causal claim the source does not carry.

The band therefore states the figure **and the confound in the same breath.** It costs a
line of copy and some of the punch, and it is the only version that survives a reader who
opens the paper. Label per §5.16: the population is **Delhi adolescents aged 13–17**, not
"children", and not India.

### D-14.4 YEARS OF LIFE: AQLI, BOTH SCALES
Verified. **Air Quality Life Index**, Energy Policy Institute at the University of Chicago
(EPIC), 2025 edition: **India 3.5 years** of life expectancy lost, **Delhi-NCR 8.2 years** —
nearly twice the toll of childhood and maternal malnutrition and more than five times that
of unsafe water and sanitation. Also measured against the WHO guideline, which is what makes
it consistent with D-14.2's device.

This is the figure that converts pollution into **time**, which is the most human unit on
the page, and it is the one figure that carries Delhi and India in the same breath.

### D-14.5 BAND 2 IS ONE LEAD DEVICE AND TWO SUPPORTING ROWS
Measured, not asserted: three figures at equal weight plus the dual-limit device plus the
caveat plus the unifying line estimates **~920px at 375 — over the cap.**

So the band takes a hierarchy instead: **the dual-limit deaths device is the lead, at full
scale; children and years-of-life are two supporting register rows.** The unifying line
moves into the `.im-head` lead rather than standing alone. Estimate **~740px.**

This is better composition as well as cheaper — **one thing dominates the band**, which is
the operative answer to "can't have clutter" and is the same hierarchy the register rows
already solve (§5.5).

### D-14.6 THE OVERVIEW IS A CAGED SUMMARY STRIP — RED ONLY
**Owner: "whatever design permits."** So, ruled from the language rather than from
preference.

**Permitted, with precedent.** §5.1 licenses a *"visually caged"* strip — its own hex, a
hairline top and bottom, micro-scale type throughout, never any mustard — and the homepage's
ticker is exactly that. It is **not a band**: it is a rule between bands, on chrome padding
rather than a tier, so it does not count against the 900px cap. At the homepage's measured
**116.45px at 375** it is the cheapest possible way to deliver 360°.

**Red only, and that is what keeps it legal.** §5.1's exemption exists so the homepage
ticker can hold red *and* green, and it is described as **the site's only exemption.** This
strip does not need it: it summarises **the situation's readings**, which are red or
neutral. **Swechha's own outcomes stay in band 11, where green lives.** So no second
exemption is created.

Four constraints, each with a reason:
1. **Cells link down to their own band.** A strip cell shows two of the six parts of a
   reading (§5.6), so it is an *index* of readings, not a set of them. The full six parts
   live in the band, and the cell must reach them — the same mechanism D-12.11 just fixed on
   the homepage.
2. **One state label for the whole strip, not one per cell.** Per D-13.1 every figure on this
   page shares a provenance class, so six chips would be six copies of one fact.
3. **No mustard, no green, no total.**
4. **It sits immediately after the hero**, mirroring the homepage's hero → ticker. A
   returning reader should recognise the gesture.

### D-14.7 GROUND CHAIN CORRECTED — AND THE SEASONAL FLIP MOVES
Adding the strip forces a re-derivation, and it also **corrects an error in AD-14 as first
issued.**

The strip takes `#151512` after the hero's `#0D0D0B`, so **band 2 `people` flips to
`#0D0D0B`** — mirroring the homepage's own hero → ticker → `#0D0D0B` opening.

**The seasonal flip was wrong and is reassigned.** AD-14 said `watched` flips ground when
`stubble` does not render. Re-checked: that produces `watched` `#0D0D0B` meeting `record`
`#0D0D0B` — **it moves the clash rather than fixing it.** Correct answer: **`sources` is
`#151512` in season and `#0D0D0B` out of season.** One band flips, and nothing downstream
cascades.

| | in season | out of season |
|---|---|---|
| 3 `measured` | `#F3F2F0` | `#F3F2F0` |
| 4 `sources` | `#151512` | **`#0D0D0B`** |
| 5 `stubble` | `#0D0D0B` | *absent* |
| 6 `watched` | `#151512` | `#151512` |

**Both chains verified adjacency-clean end to end.** Estimate now **~10,342px at 375×812**
against the homepage's measured 10,244 — **98px, about 1%, over.** Named rather than hidden,
per the standing habit of ledgering overage. To be measured, not trusted.

### Measured — the register-row title size, which `BRANDING §2.2` does not state

AD-13 rev 2 flagged its own top risk honestly: `§2.2` gives the register row title as Archivo
74/800 with **no font-size**, so "each rule title holds one line at 375" was an assumption
resting on a guessed ~20px, and a wrap would add ~115px and breach `#rules` at ~987px.

Measured on the frozen page's own register row (`.w7-pj-rt`, the `#projects` band), CDP
`Emulation.setDeviceMetricsOverride`, titles substituted in place:

| | 375 | 1440 |
|---|---|---|
| font-size | **15.68px** | 16.56px |
| line-height | 16.464px | 17.388px |
| variation | `"wdth" 78, "wght" 800` | same |
| box width | 293px | 415.8px |

**So the component is 15.68px at 375, not ~20px, and `wdth` is 78.**

**CORRECTION, entered the same day. My first version of this entry logged a defect against
`BRANDING §2.2` and the defect was not real.** The art director caught it. There are **two**
classes, not one:

| class | declared | variation | size at 375 | instances |
|---|---|---|---|---|
| `.w7-pj-t` | `home.html:2391–2394` | **74**/800 | **20.8px** | **1** — the register's lead row, the one carrying the photograph |
| `.w7-pj-rt` | `home.html:2424–2427` | **78**/800 | **15.68px** | **6** — the ledger rows proper |

`§2.2` (line 336) names *"`.w7-pj-t` 74/800"* and that is **accurate for the class it names.**
The class measured above, `.w7-pj-rt`, `§2.2` **does not list at all**. So the branding-doc gap
is an **omission, not an error**: it omits `.w7-pj-rt`, and gives no font-size for either
class. Recorded this way rather than leaving a false defect standing against a document that
is right — **this is the phantom-defect trap this project has hit three times now, and it
nearly went into the ledger as fact.**

**And the omission explains the original error, which is the part worth keeping.** 20.8px is
*exactly* `.w7-pj-t`'s size at 375 — the art director had costed the **lead** row's type for
the **ledger** rows, having quoted the one class the branding document actually documents. The
assumption was not arbitrary; it was precisely wrong, which is the more dangerous kind. **The
fix for the branding doc is to add `.w7-pj-rt` and a font-size for both** — flagged for
whoever next edits it, not done here.

**All five proposed rule titles hold ONE line at 375** — 16.5px each, no overflow. The test is
not a false pass: a 46-character control wraps to two lines at 375 (32.9px) while holding one
line at 1440. Bisecting up from the titles, **34 characters still holds one line at 375**, so
the real budget is 35–46 and AD-13's self-imposed ≤30 is conservative by at least four
characters. The longest proposed title is 27.

**`#rules`' budget risk is therefore retired, with headroom**, and the constraint in the spec
becomes measured rather than assumed: **a register-row title of ≤34 characters holds one line
at 375.** Any rule added later is checked against that number, not against a guess.

### D-11.9 THE INDEX'S COPY IS APPROVED; THE POLICY DOOR POINTS AT `/about`
**Client: approved as drafted, and `/about`.**

`#rules`' five rule titles and fact lines, `#why`'s head, lead and three door texts, and the
two work-in-progress clauses are approved as drafted in AD-13 rev 2. Four of the five rules
recover approved or ported strings rather than new prose — rule 01 opens on the frozen
masthead's method line verbatim.

**The POLICY door points at `/about`.** There is no advocacy or narratives route in this
project: `app/sitemap.ts` carries `now, explore, work, work/campaigns, impact, act, about,
search`, and SOURCE-FACTS names *"Building Narratives for Sustainability"* as a page on the
**current WordPress site**, not this one. `/about` is where the method and the Wheel of Change
already live. This is structural rather than cosmetic — the door cards are `<a>` elements, so a
door with no destination is not a door, and dropping to two breaks the `repeat(3,…)` grid.

**Two strings are deliberately NOT approved, because they are not yet true or not yet
written:**

1. **The window rule's mechanism sentence is a SLOT.** *"Nobody has to remember to switch
   anything on in March"* is the line that makes rule 03 read as a mechanism instead of a
   promise, and it is **currently false**: `getActiveSituations()` (`lib/content/index.ts:103`)
   has no date logic, so somebody does have to remember. It ships the day D-11.5's windows are
   wired (+19.6px, inside the band's measured headroom). Caught by the art director in
   drafting, and worth recording as the pattern: **an approved ported string can still be
   false on the page that ports it.**
2. **`#legend`'s teaching copy and `#top`'s masthead slots are not drafted**, deliberately.
   `#legend`'s specimen clause must be written against AD-12 §2.3's exact wording **in the same
   pass as `system.html`**, so the two vocabulary sheets agree word for word rather than
   nearly.

Three lines were drafted and cut on the D-11.8 test, recorded because each names a trap: *"A
record kept every day…"* (true in general, false on a page where nothing is wired — the same
failure mode as the frozen *"Updated every hour"*); *"A limit broken in your ward"* (the
location control was deferred off this page, D-01.8); and *"Five rules…"* (a stated total that
goes false the day a sixth is added).

### D-14.8 THE MONEY BAND GAINS A THIRD FIGURE — AND THE FRAMING IS CORRECTED
**Owner: add economic loss / GDP, linked to allocated and utilised; "cost of inaction is
higher than cost of action."** The figure is added. **The framing does not survive
checking**, and the supported version is narrower and stronger.

**Verified — the loss.** Dalberg Advisors with **Clean Air Fund** and **CII** (2021): air
pollution costs Indian business **~$95 billion a year ≈ ₹7 lakh crore ≈ 3% of GDP.** The
report's own comparisons are better than any we would invent: **equal to 50% of all tax
collected annually**, and **150% of India's healthcare budget.** Components: 1.3 billion
work days lost a year (~$6bn), productivity loss up to $24bn, lost working years $44bn.

**Verified — the spend.** ₹13,415 crore **released** under NCAP + XV-FC since inception,
of which **₹9,929 crore utilised — 74%.** Worse at the NCAP-only end: the 82 NCAP cities
had used **₹831.42 crore of ₹1,615.47 crore released — 51%** (to 3 May 2024). Sources: PIB
releases, CPCB's PRANA funding guidelines, and CREA's *Tracing the Hazy Air* progress
reports.

**THE PERIOD TRAP, AND WHY IT MATTERS.** The loss is **annual**; the spend is **cumulative
since FY2019-20**. Comparing them without saying so is exactly the apples-to-oranges error
this page exists not to make. Labelled correctly, the comparison is **more** damning, not
less:

> **One year of damage costs roughly fifty times everything released for it since 2019, and
> about seventy times what has actually been spent.**

That is arithmetic from two sourced figures with both periods named. It is the band's hook.

**WHAT IS NOT SUPPORTED: "the cost of inaction is higher than the cost of action."** That is
a claim about a **counterfactual** — what fixing it would cost — and **none of these sources
contains a costed abatement estimate.** "Money currently allocated" is not "the cost of
action"; it is the cost of the current programme, which is by common agreement insufficient.
So the phrase is an inference the evidence does not carry, and it is withdrawn from the copy
under the same rule as D-13.2's forecast hook and D-14.3's asthma attribution.

**It can be earned later.** It needs a third source — a costed abatement or
cost-effectiveness study for Indian air quality. If one is found and attached, the claim
becomes checkable and may return. Until then the band states the two figures and their
periods, and **draws no conclusion beyond the arithmetic** (D-13.6).

**Pattern worth naming, because this is the third time.** Source-checking has now narrowed
three hooks written before the sources were read: the forecast ("nobody is forecasting
this" — false, SAFAR does), the asthma figure (the study's own strongest association was
BMI, not air pollution), and now cost-of-inaction. **In all three cases the checked version
was stronger than the draft.** That is the method working, and it is the argument for
keeping the fact-check gate ahead of the copy pass rather than after it.

**Composition consequence.** Band 9 now carries three quantities at wildly different scales
— the loss is ~52× the cumulative spend, so drawn to true scale the spend bars become
slivers. **That invisibility IS the information**, so the band takes the same hierarchy as
band 2 (D-14.5): **lead device = the loss against the spend at true scale**; supporting rows
= released vs utilised at their own scale, where 74% and 51% are legible; then the NCR
states. Estimated **~880px at 375 — the second band at the cap after `method`.** Named now
so it is not a surprise: if it breaches, the state rows are the cut.

---

## 21 August — PHASE 2, bands 1–3 populated with real data

`situation-air-v2.html` is now **87,928 bytes / 1,503 lines**. Bands 1 (`top`), 2 (`people`)
and 3 (`measured`) carry real content. The fact base is `2026-08-21-SOURCE-FACTS.md`
§ READINGS AND LIMITS (S-1 … S-9), added the same day because the D-11 block recorded that
gate #11 could not be met for a single reading.

### D-15.1 THE INTENDED ASYMMETRY: the argument is sourced, the reading is stamped
The page now demonstrates the thing D-12.1 claimed. In the hero, **the limit, the authority,
the category boundaries and the six-band scale are all real** (CPCB), and **only the
measurement is a specimen.** The provenance line says exactly that: *"No station feed is
wired. This is a specimen value, not a reading. The limit beside it is real: CPCB, NAAQS
2009."*

This is the shape to hold for every remaining band. It is also why the page does not need a
feed to be worth shipping.

### D-15.2 AQI 100 *IS* THE LEGAL LIMIT — the best find of the build
S-1c. The Satisfactory/Moderately-Polluted boundary sits at **PM2.5 = 60 µg/m³ and PM10 =
100 µg/m³**, which are **exactly the NAAQS 24-hour standards**. So *"above AQI 100"* is not
a rule of thumb, a convention, or an editorial judgement — **it is arithmetically identical
to "above the standard India set for itself."**

The masthead's promise — *every reading against its published limit* — is therefore satisfied
**by the index itself**, with nothing added. Band 3 states it plainly and it is the strongest
true sentence on the page.

### D-15.3 THE MULTIPLIER BELONGS TO THE CONCENTRATION, NOT THE INDEX
**A quiet falsehood in the prototype, now corrected.** `situation-air.html` headlined *"Four
times the limit"* from AQI 412 against AQI 100. **AQI is a piecewise-linear index, so 4.1×
the index is not 4.1× the pollution** — the two only look alike by coincidence.

The multiplier is now derived from **the governing pollutant against its own published
24-hour standard**: PM2.5 258 µg/m³ ÷ 60 µg/m³ = **4.3×**, and the page names which
pollutant decided it. This is also the reason band 3 is load-bearing rather than decorative:
**you cannot state the multiplier without knowing which sub-index governs.**

### D-15.4 EIGHT POLLUTANTS, NOT SIX
S-1. CPCB's AQI is the worst of **eight** sub-indices — PM10, PM2.5, NO2, SO2, CO, O3, NH3,
Pb. **Six is the number of categories**, and AD-14 had conflated the two in band 3's copy
and in its wireframe. Corrected. CPCB's own sentence is quoted on the band: *"The worst
sub-index determines the overall AQI."*

Better still, the two pollutants the specimen station does not report (NH3, Pb) are **named
as absent** rather than dropped — which is the page's thesis operating at the level of a
single row, and it is cheaper than drawing them: two empty cells cost 111.2px at 375 to say
nothing.

### D-15.5 Two build defects, both found by measuring the render
1. **The six-band scale collapsed to 27px wide — cells 2px each.** The frozen generic
   `.bands` supplies `display:flex`, `gap:3px`, `max-width:340px` and a 12px-tall bordered
   cell, but **not the cell width**: `flex:1` lived in the hero CSS this build deliberately
   excludes. The band owns the width. Fixed to `flex:1 1 0`; the scale now runs the account's
   full **335px** measure with 53.3px cells.
   **This is the general hazard of the extraction approach and it will recur:** a generic
   component may depend on a band-specific rule that was left behind. Measure every frozen
   component the first time it is used on this page.
2. The unit line wrapped and orphaned "indices". Shortened to *"AQI · 24-hour · worst of
   eight"* — one line at 18.4px.

### D-15.6 PHONE BUDGET — one band breaches, and it needs a ruling
Measured at 375, after two rounds of layout-only densification that deleted no content:

| band | first build | now | vs 900 cap |
|---|---|---|---|
| `top` | 761.8 | **743.4** | inside (and heroes are licensed anyway) |
| `measured` | 1080.9 | **899.9** | **inside, by 0.1px** |
| `people` | 1144.9 | **1014.0** | **114 over** |

`measured` was closed by two moves, both of which improved it: collapsing the two
unreported pollutants to one line (−111.2px of cells that said nothing) and a two-up grid
for the six reported at ≤560 (−118px). **It passes with no margin, so any copy edit to that
band re-breaches it. Treat 899.9 as a constraint, not a result.**

`people` was reduced 131px by making the dual-limit device **not stack at 375** — the
numerals were deliberately shortened to `1.5` and `5.0%` so two counts hold a 158.5px column,
because stacking cost 130px and turned one comparison into two unrelated figures.

**The residual 114px cannot be closed without deleting ruled content.** The band carries
three sourced figures (D-14.1), a two-limit device (D-14.2), a **required** confound sentence
(D-14.3) and three citations. Further shaving would be *"damaging a component to hit the
number"*, which §6.4 forbids as explicitly as it forbids breaching.

> **RULING NEEDED (R-5).** License `people` at ~1,014px at 375, by name. Precedent and
> proportion: the frozen homepage licensed `record` at **1,393.48px** on exactly this
> argument, and `people` is **379px shorter than that**. The alternative is splitting the
> health evidence across two bands, which raises the band count the owner asked to hold and
> breaks the one idea that unifies the three figures.

**At 320** both `people` (1,052) and `measured` (1,010.5) exceed 900. Recorded as data, not
a defect list: 320 is below the tested floor by prior ruling, and the frozen page has **four**
bands breaching there.

### D-11.10 "WHAT IS IN SEASON" IS ONE LINE, NOT A BAND — AND NOT A CHART
**Client: the one-line rule, as decided.** D-11.7 stands unamended.

Recorded because the client asked *"Will What is in season remain, with the chart? Am
confused"*, and the confusion is worth closing in the ledger rather than in a conversation.

**For the record: the cut band never contained a chart.** `#windows` in
`intelligence.html` was a plain five-column HTML table — Situation · Window · Shape · Clock ·
On 19 August — nine rows, no visual device of any kind.

**What survives is rule 03 of `#rules`:** *A WINDOW DECIDES MEMBERSHIP — A season repeats and
says when it returns. A one-off window ends for good. A shut window leaves the page.* Plus the
mechanism sentence held as a slot until the windows are wired (see D-11.9).

**A seasonality strip was offered and declined.** The argument for it was real and is worth
preserving so the reasoning is not lost if it ever comes back: a situation page can only show
*its own* window, so **only the index can show six windows against one year at once** — the
same argument that saved `#sources` under D-11.7. It would also have been the cheapest chart
on the site: no data beyond the windows themselves, no readings, nothing invented. It was
declined on scope — it is a component the frozen language does not have, so it would need
designing and justifying rather than assembling from solved parts, and it is blocked on
D-11.5's six windows either way.

**Do not re-propose the table.** Do not re-propose the chart without a client ruling. The page
stays at six bands and `#rules` stays at five rows.

### D-15.7 THE FIRST REAL READING ON THE SITE
The owner supplied a data.gov.in key and `scripts/fetch-air.mjs` now runs. **The hero no
longer carries a specimen.** Delhi, observed 10:00 IST, 21 August 2026:

| | |
|---|---|
| city reading | **AQI 392, Very Poor**, governed by PM2.5 at 240 µg/m³ |
| station | **Anand Vihar, Delhi – DPCC** (the city's worst of 43) |
| multiplier | **4.0×** the 24-hour standard, derived |
| spread | **76 (Shadipur) to 392 (Anand Vihar)** |
| **above the limit** | **36 of 43 stations** |
| state word | **PERIODIC**, and the badge is the frozen default hollow square |

**`DEMO DATA` → `PERIODIC` is D-10.1 working as designed**, not an exception to it: the word
follows the mechanism. The upstream stamps roughly hourly, but D-13.1 delivers by committing
a file, so the page's freshness is the job's cadence. **`LIVE` remains unreachable and that
stays correct.**

**The key is not in the repository.** It lives in an environment variable, `.gitignore`
already covers `.env*`, and a grep for it across the tree returns nothing. It was pasted in
chat, so it should be rotated if that transcript is ever shared.

### D-15.8 THE FEED RETURNS CONCENTRATIONS, NOT AN AQI — so band 3 is mandatory
The resource has no AQI field at all: it returns per-station, per-pollutant concentrations.
**Every AQI on this site is therefore computed here**, from the CPCB breakpoint table in
S-1, with the station AQI as the worst sub-index and the city figure as the worst station.

Three consequences, all of them improvements:
1. **Band 3 stops being explanatory and becomes structural.** The page cannot show a number
   without computing sub-indices, so showing them is simply showing its work.
2. **The page must never say "CPCB's AQI".** It says *"computed from Anand Vihar's own
   concentrations using CPCB's breakpoint table"*, which is what the derivation rule
   requires. The hero states this in full.
3. **The job self-checks the table before it fetches** — CPCB's own worked example (PM2.5
   sub-index 51 at 31 µg/m³, 75 at 45, 100 at 60). A mistyped breakpoint fails the job
   instead of silently shifting every reading on the site.

### D-15.9 CO IS EXCLUDED FROM THE INDEX, AND THE EXCLUSION IS PUBLISHED
**The first run returned "Severe, governed by CO" for all 43 stations.** Investigated rather
than accepted: CO `avg_value` ran **10 to 108, median 32**, and **the feed states no unit
anywhere in its field metadata.**

- Read as **mg/m³** — the unit CPCB's CO breakpoints use, where 34+ is Severe — a median of
  32 puts nearly every station in the top band on CO alone. Not credible in monsoon.
- Read as **µg/m³** it is implausibly low for urban CO.
- Every other pollutant in the feed is µg/m³ and matches its breakpoints. CO is the one
  CPCB defines in mg/m³.

**The unit is unresolved, so CO is left out of the computed index and the concentration is
still shown.** A guess either way would silently move every AQI on the site — and would have
published "Severe" across Delhi on a monsoon day.

This is the page's own thesis applied to its own pipeline, with a live example: **name the
gap rather than fill it with an assumption.** To include CO, confirm its unit against a CPCB
bulletin for the same station and hour first.

### D-15.10 THE GAP NOTES MOVE TO `method` — architecture, not budget
The CO reasoning and the absent-pollutant note are **method notes**, and band 12 is *"What is
measured and what is not."* Band 3 keeps a one-line pointer so a reader looking at the eight
sees the gap immediately; the argument lives where derivations live. This would be the right
home irrespective of height. **Band 12's content is now specified by this and is owed.**

### D-15.11 PHONE BUDGET after the real data landed
Real content is longer than specimen content. Measured at 375, after moving the gap notes
and two layout-only gap corrections that deleted nothing:

| band | vs 900 cap |
|---|---|
| `top` | **890.4** — inside, and heroes are licensed regardless |
| `measured` | **895.5** — inside (it was 1,050.9 before the notes moved) |
| `people` | **1,014.0 — 114 over** |

`overflow 0`, **zero ground clashes on composited colour**, console silent.

**R-5 still stands and is now the only outstanding breach.** Note what changed under it: the
hero grew from 743 to 890 purely from stating its own provenance and derivation honestly.
That is the cost of the page's thesis and it is worth paying, but it means **`top` and
`measured` now both sit within ~10px of the cap and will breach on the next copy edit.**
Treat both as constraints, not results.

---

## 21 August — all three feeds wired. Three jobs, three committed files.

`scripts/fetch-air.mjs` (CPCB, the reading) · `scripts/fetch-crosscheck.mjs` (WAQI, the
cross-check and the forecast) · `scripts/fetch-fires.mjs` (NASA FIRMS, per sensor). Three
separate jobs on purpose: **each source must be able to fail without the others publishing a
hole.** All three keys live in the environment; a grep for them across the whole tree returns
nothing, and `.gitignore` already covers `.env*`. **All three were pasted in chat and should
be rotated if that transcript is ever shared.**

### D-16.1 WAQI IS A CROSS-CHECK, NEVER THE READING — it is a different scale
**WAQI publishes on the US EPA 2016 AQI scale** — its own scale page states it. CPCB's
National AQI is a different scale. Measured, same station, same hour, 21 August 2026:

| | Anand Vihar |
|---|---|
| WAQI, US EPA scale | **212** |
| computed from CPCB, India's scale | **392** |
| difference | **180 points** |

**And it is not purely the scale.** US EPA 212 back-solves to PM2.5 ≈ **162 µg/m³**, while
CPCB reported **240 µg/m³** at that station in that hour. So the two publishers are not
working from the same concentration either — different averaging windows, different
pipelines (WAQI credits dpccairdata.com).

**WAQI exposes index values only, never concentrations, so the scale effect cannot be
separated from the data effect.** The job therefore publishes both numbers and refuses to
reconcile them, and the only claim the data supports is the careful one:

> *Two organisations publish an index for this station. One says 212, the other 392. Part of
> that is a different scale, part is a different averaging window, and neither number tells
> you which you are seeing.*

Written into the script as a prohibition: **do not convert between the scales, do not average
them, do not present either as a correction of the other, and never put a WAQI number in the
hero.**

**This is the third instance of the page's core device** — deaths against two limits, fires
by two sensors, air on two scales — and it lands in band 12 `method` per the owner's ruling,
which makes that band the payoff rather than housekeeping.

### D-16.2 A FORECAST IS WIREABLE AFTER ALL — D-13.2 is amended
**D-13.2 concluded a forecast could not be attached because SAFAR has no public API. That
conclusion was wrong.** WAQI returns a daily PM2.5 / PM10 forecast — **7 days ahead** from
today, with min/avg/max per day.

**Owner's ruling: show WAQI's, attributed, and still name SAFAR.** So band 10 gets real
content instead of a pointer, on three conditions the job enforces:
- it is labelled **WAQI's own model**, not CPCB's and not SAFAR's;
- **SAFAR remains named** as the official Indian forecaster, linked, never scraped or
  restated (its 72-hour Delhi forecast has no documented API);
- past days are **dropped** — the upstream array runs backwards as well as forwards, and
  publishing a "forecast" that includes the day before yesterday would be its own small lie.

### D-16.3 FIRMS PUBLISHES PER SENSOR AND NEVER A TOTAL
Measured over Punjab, Haryana and Delhi-NCR, the five days to 20 August 2026:

| sensor | pixel | detections |
|---|---|---|
| MODIS (Terra/Aqua) | 1 km | **1** |
| VIIRS S-NPP | 375 m | **24** |
| VIIRS NOAA-20 | 375 m | **14** |

**Better than the device AD-14 specified.** The brief argued a 1 km² fire is one MODIS
hotspot and nine VIIRS hotspots — a scaling factor. The real data is starker: **at these fire
sizes MODIS mostly does not detect at all.** One against twenty-four is not a ratio, it is
the difference between "nothing is happening" and "something is happening", decided by which
satellite you asked.

Two further findings, both published as caveats:
- **The two VIIRS instruments are identical and still disagree** — 24 against 14 — because
  they pass overhead at different times. **Their counts must never be added**, which the
  script says in capitals.
- **Confidence is encoded differently per sensor** (MODIS 0–100, VIIRS low/nominal/high), so
  a single threshold cannot filter both.

So the job publishes a count **per sensor** and no total, because **a single total would be a
choice disguised as a measurement.**

Note also: these counts are late-August background fires, not stubble. Peak season is
October–November. **The seasonal band (D-13.4) therefore has real data showing why it is
shut**, which is a better demonstration of the closed-window rule than an assertion.

### D-16.4 THE GUARD THAT NEARLY DIDN'T EXIST — an error is not a zero
The first 7-day FIRMS request returned **HTTP 200 with the plain-text body `Invalid day range.
Expects [1..5].`** The CSV parser read that as **zero rows**, and the job would have published
**"no fires detected"** when the truth was **"the request failed."**

On a page whose entire subject is the difference between those two statements, that is the
worst bug available, and it produced a rule now enforced in all three jobs:

1. **Validate the shape of the response, not the status code.** FIRMS answers bad requests
   with prose and 200; WAQI signals failure inside the body.
2. **A failed source is recorded as `null`, never as `0`.**
3. **If every source fails, leave the previous file alone** rather than overwrite good data
   with an empty one — a stale reading with a visible age is honest; a fresh-looking zero is
   not.

This is the same failure class as the Phase 1 `<script>` truncation, which also rendered a
page that looked entirely fine. **Both were found by checking the shape of the output rather
than trusting a success signal.**

---

## 21 August — the page is consolidated to NINE bands, and liveness is redefined

Owner review of the populated page: *"Do we need so much text after the reading of 392?
… isn't it better to club some information in one section, and show things as infographic,
rather than having so many sections and such a long page?"* Both are right.

### D-17.1 FOURTEEN BANDS BECOME NINE — merged by argument, not by budget
**Reverses D-13.7 and D-13.4.** Five merges, each joining two halves of one argument:

| merged | into | why |
|---|---|---|
| `measured` + `method` | **How the number is made** | The eight sub-indices, the CO exclusion and the two-scale disagreement are one story: what this number is and what it leaves out |
| `record` + `next` | **Where it has been, where it is going** | One time axis, one chart, a divider at today. Two bands for one line was always odd |
| `sources` + `stubble` | **Where it comes from** | Biomass *is* a source and stubble is its seasonal spike |
| `watched` + `india` | **The geography** | The station spread and the 266-city ranking are the same question at two zooms |
| `situations` + `ward` | **What you can do** | The sibling list and the one ask are one closing gesture |

**The seasonal problem dissolves.** With stubble inside `sources`, no band appears or
disappears, so **D-14.7's seasonal ground flip is retired** — `sources` keeps one ground in
both states and nothing cascades. A seasonal *register inside* a band is strictly easier than
a seasonal band.

**New order and chain.** Time before space, deliberately, because it buys the hue separation:

| # | id | tier | ground | hue |
|---|---|---|---|---|
| 1 | `top` | t1 | `#0D0D0B` | red |
| — | `strip` | chrome | `#151512` | red |
| 2 | `people` | t2 | `#0D0D0B` | none |
| 3 | `measured` | t2 | `#F3F2F0` | none |
| 4 | `sources` | t3 | `#151512` | none |
| 5 | `trend` | t2 | `#0D0D0B` | **red** |
| 6 | `geography` | t2 | `#151512` | none |
| 7 | `money` | t2 | `#F3F2F0` | none |
| 8 | `doing` | t2 | `#0D0D0B` | **green** |
| 9 | `close` | t3 | `#ECEBE8` | mustard (control only) |
| — | `footer` | — | `#151512` | none |

**Zero adjacency clashes.** Red at 5, green at 8 — **three apart with two hueless bands
between**, which is the same separation D-12.10 accepted and the reason `trend` precedes
`geography` rather than following it.

### D-17.2 THE HERO LOSES TWO PARAGRAPHS
The frozen homepage's reading is numeral → unit → verdict → limit + scale → **one** source
line. The populated hero had grown two extra paragraphs and reached 890 of the 900 cap.

- **the derivation** ("not CPCB's published AQI… computed from…") moves to *How the number
  is made*, which is its designed home;
- **"36 of 43 stations above the limit"** moves to *The geography*, where the spread belongs.

The hero keeps the six parts (§5.6) and one `.src` line. Nothing is deleted from the page —
both facts are load-bearing — they are moved to the band that is about them.

### D-17.3 HIDE THE CONTAINER, NAME THE HOLE
Owner: *"We should hide sections for which we don't have data pulled, as a rule."*

**This is already the frozen rule** — §5.8 *"A closed window does not render. Anywhere"* and
§5.9 *"Value not known yet → the row or cell does not render. Absence is the honest form."*
Confirmed and now enforced at build time.

**But one distinction is held, because it protects the page's whole point:**
- **No data at all for a subject** → the register or band **does not render.** No stubble
  detections out of season → nothing about stubble appears.
- **A gap we can name and explain** → **it is said out loud.** CO excluded for a stated
  reason, Pb not reported at this station, no forecast we can attach a document to.

Without that line, "hide what is missing" would quietly delete the thesis (D-12.1). The rule
is: **hide what we have nothing to say about; publish what we know we don't know.**

### D-17.4 LIVENESS IS DEFINED BY DELIVERY — build the proxy, badge reads LIVE
**Owner: delivery-based.** The question was what separates LIVE from PERIODIC — hourly,
daily, weekly?

**Ruled: it is not the upstream cadence, it is whether the value can change between two page
views.** So: a server route proxies CPCB with the key **server-side**, the page stays
prerendered, and the reading hydrates client-side. The badge reads **LIVE**.

**The recorded reservation, and how it is resolved.** CPCB updates hourly, so a blinking
LIVE dot over a number that moves once an hour risks over-claiming. The resolution is that
the two things describe *different* facts and both are true at once:

> **LIVE describes the fetch. The age describes the observation.**

So the badge says the page is not stale, and the `.src` line still says *"observed 10:00, an
hour ago."* The badge is never allowed to replace the age.

**Two conditions this ships with:**
1. **The committed JSON stays as the fallback.** The page renders a reading statically and
   upgrades. No blank state, and a failed proxy shows the last good reading with its age
   growing visibly — which is the honest failure mode.
2. **The badge reports which source rendered** — `LIVE` on a successful fetch, `PERIODIC` on
   the fallback. This is a conditional badge, which §6 warns about; it is licensed here
   because the badge is **always displayed** and the conditional selects the correct word
   rather than deciding whether to appear at all.

**The key never reaches the client.** That is the whole reason for the proxy rather than a
browser-side fetch.

### D-17.5 THE NATIONAL PICTURE — and a hook withdrawn
Computed from the full resource: **3,514 rows, 266 cities, 502 stations, 31 states.**

| rank | city | AQI |
|---|---|---|
| **1** | **Delhi** | **391** |
| 2 | Sasaram, Bihar | 389 |
| 3 | Gurugram | 375 |
| 4 | Charkhi Dadri | 362 |
| 5 | Faridabad | 359 |

**AD-14's hook *"Delhi is the loudest. It is not always the worst"* is false today** —
Delhi is first of 266. Withdrawn, and replaced by something stronger and true:

> **Delhi is first. Nine of the next twelve are its neighbours.**

Gurugram, Charkhi Dadri, Faridabad, Manesar, Noida, Khora, Panipat, Baraut and Meerut. That
reframes the subject from a city to an **airshed**, which is Swechha's own advocacy ground and
the thing Airshed Parks exist for.

Also on the record: **87 of 266 cities are above the limit India set for itself**, and **51
are "Good"** — so the country is not uniformly polluted, which is what makes the NCR cluster
legible rather than ambient. This is the fourth hook that source-checking has replaced with a
better one.

### D-17.6 THE OLD PAGE'S DATA POINTS AND DEVICES ARE RETAINED — full inventory
**Owner: *"retain all the data points … I liked the kind of data, its linkages and also the
visual graphics of this version."*** `situation-air.html` was extracted in full reading order
(331 content runs) and inventoried. **Nothing below may be dropped in the nine-band
rebuild.** Two of its devices are better than anything AD-14 specified.

**★ THE TWO STANDOUTS, reinstated as first-class:**

1. **MEASURED vs MODELLED IS CARRIED BY THE RULE ITSELF.** The old page states it out loud:
   *"Everything below is either measured or modelled, and the two are set differently on
   purpose. If it is on a solid rule … "* — a **solid** rule means measured, a **dashed** one
   means modelled. This is a semantic use of the `.rl` contract and it is the single best
   idea on the page: **the reader can see which numbers are real without reading a word.**
   Note the collision to resolve: §5.7 already assigns dashed to *a shut window*. These are
   different objects (a rule under a numeral vs a window tag), but the overlap must be
   deliberate and named, not accidental.
2. **THE DAY GRID.** *"A year of Delhi air in one grid. Each square is a day, filled lighter
   to darker as the index climbs through the six official bands."* With month labels Aug→Jul
   and the six-band legend. **This is the answer to the owner's "be space wise"** — 365 data
   points in one block, and it carries a finding no bar chart can: *"the pale band running
   through the middle is the monsoon. It is the best the air gets all year, and it is still
   above what the World Health Organization calls safe."* It also retires AD-14's 52-week
   phone compromise (D-13.9): a grid reflows where a strip cannot.

**Retention list, mapped to the nine bands:**

| from the old page | goes to |
|---|---|
| *"A monitor reading is not an exposure"* — the index describes one instrument at one hour | `top` |
| Byline: first published / last revised · **Cite this page · Reuse freely CC BY 4.0 · Past versions** | `close` |
| **1,441 schools** within 5 km of a monitor above 400 — *counted*, from the Directorate of Education register joined to the CPCB station list by distance | `people` |
| **1.93 million people** likely exposed — *modelled*, Census 2011 projected × ward share of plume | `people` |
| the deliberate pairing of **one counted figure beside one modelled one**, each labelled | `people` |
| three plain-English explainers — **AQI** *"one number for six poisons"*, **PM2.5** *"small enough to enter blood"*, **PM10** *"dust you can feel"* — each with its value and its standard | `measured` |
| source apportionment **traffic / biomass / industry / construction**, TERI + SAFAR, *modelled*, with the caveat that percentages move ten points or more between runs | `sources` |
| the schematic map with **monitors / ward labels / plume** as separate layers, and *"schematic geometry, not a boundary claim"* | `geography` |
| the **station ranking**, highest and lowest, red above the limit | `geography` |
| **26-year bars of days above 200 on a true zero baseline** — *"the flatness of it is the finding"* — now 2015→ per D-13.3 | `trend` |
| **the station-count caveat**: six monitors in 2001, thirty-six today, and **Swechha does not adjust, because any adjustment would be a model and would have to be marked as one** | `trend` |
| **the day grid** + month labels + six-band legend + the monsoon observation | `trend` |
| the **forecast slot with two states** — *"As it ships today"* / *"With a forecast wired"* — and *"would carry: issuing system, issuing time, and the skill score of the last thirty days"* | `trend` |
| **India ranking with a "times the limit" column** | `geography` |
| **★ the "Swechha record" column** — *"11 years of school sampling"* vs *"not sampled by us"*, with a **mustard rule marking stations Swechha samples independently**. A linkage device: it ties the national table to Swechha's own instruments | `geography` + `doing` |
| **the method table** — Figure · Kind · Source · Cadence — and *"four figures are measured and three are modelled; the reference dashboards set both at the same weight"* | `measured` |
| *"Every reading, kept"* — each day's reading keeps its own address, with source, hour and the limit it was judged against | `close` |
| **Coverage** — press reporting, listed and dated, *"tagged as reporting; never presented as Swechha's finding"* | `close` |
| **Do something / the DIY bank** — a classroom monitor build, how to file an objection | `doing` |
| **Watch your ward** — pin code, one message on a limit crossing, one digest a month, no address shared | `close` |

**WHAT IS NOT RETAINED, and why — this is not a reversal of the owner's instruction.**
- **The four court/tribunal/gazette orders** (`OA 412/2026`, `S.O. 3118(E)`, `Direction 91 of
  2026`, the NGT holding). **D-11.1 cut these because they are invented** — `OA 412/2026`
  reuses the AQI figure as a docket number. The *device* is kept as a named future section;
  the citations cannot be.
- **Every typed date and tensed claim** — `07:00 IST, 19 August 2026`, `2025 list`,
  `Last compiled 18 August 2026`, and the nine typed `today`s. The **facts** they carry are
  retained; the values now come from the feed or compute.
- **"Air-detox garden"** — the gardens ruling killed the term; the source's own word is
  **Airshed Park**.
- **The specific figures** 412 / 218 / 392 / 1,441 / 1.93m / 37-31-17-15 / 237 days / 256
  cities are **superseded by the live feed** where one exists (the live count is 266 cities,
  502 stations, and Delhi at 391). Where no feed exists, the figure needs its source attached
  or it does not render.

**The design consequence, stated plainly.** The old page carried this much material in
fourteen-plus sections, largely as *prose per figure*. Nine bands can only hold it as
**graphics per figure** — the day grid instead of a paragraph, the rule style instead of a
label, a ranked strip instead of a sentence. **That is the whole reason the consolidation and
the "be space wise" instruction arrived together, and it is the design brief for the
rebuild.**

---

## 21 August — owner review: contrast defect, no Swechha projects, no subpages

### D-18.1 CONTRAST DEFECT IN THE OLD PAGE — measured at 1.31:1
Owner: *"white text is not readable/legible on mustard band AQI, PM 2.5, PM 10."* Measured on
`situation-air.html`:

**`--fg-2` (#CDC7B7) on `--mustard` (#E1A32B) = 1.31:1.** The bar is 4.5:1, so it **fails by a
factor of 3.4** and is effectively invisible. Three of the page's best lines are lost to it:
*"One number for six poisons"*, *"Small enough to enter blood"*, *"Dust you can feel."*

**Cause: a class-name collision.** `.sub` is declared twice for different objects —
`section.sub` is the mustard "Watch your ward" band (correctly `--on-mustard`, **8.51:1**),
and `p.sub` is the explainer *subtitle*, which inherits the band's `background:var(--mustard)`
while taking `--fg-2` for its colour.

**This is exactly the failure the frozen language's one-component-per-name rule exists to
prevent**, and it is an argument for the extraction build: **the new page cannot inherit it,
because `.sub` does not exist there.** In the rebuild those subtitles sit on the band's own
ground.

**Rule restated, since it was breached in a shipped file: nothing but `--on-mustard` may sit
on a mustard fill, and mustard is a ground exactly once on the whole site.**

### D-18.2 SWECHHA'S PROJECTS COME OFF THIS PAGE
**Owner: *"Keep Swechha projects out of this page, just link to Swechha's Delhi I Can't See
You campaign page. That campaign page also links back to this page, for WHY the campaign."***

So **band `doing` is deleted** — Airshed Park, Monsoon Wooding and Bridge the Gap leave, and
the page carries **one link** to the campaign instead. The reciprocal link is the point: the
campaign page answers *what we are doing*, this page answers *why*, and neither repeats the
other.

**Consequence for the hue system: green disappears from this page entirely.** Green means
*what Swechha has done* (D-07.2), and with the projects gone there is nothing on the page for
it to mean. The page now carries **red only**, plus mustard as the interface. **This retires
the red-versus-green adjacency constraint here** — the tightest composition rule the page had
— which is a real simplification, not a loss.

**Also withdrawn: the "Swechha record" column** in the national table (*"11 years of school
sampling"*), retained at D-17.6. It is Swechha's own instruments and therefore a project
claim, and it goes with the rest. If the sampling record should live anywhere it is on the
campaign page.

### D-18.3 NO SUBPAGES — the whole subject sits on this page
**Owner: *"Rest all air pollution related things should be here, we don't need how to measure
etc, in another page. Idea is to keep the website as lean as possible, not add layers and
subpages."***

So the old page's outbound links — *"All 256 cities"*, *"All 256 reporting cities"*, *"The
daily record"*, *"Recent coverage"*, *"The DIY bank"* — **do not become routes.** Everything
resolves **in page**, with progressive disclosure where a full table is too long to sit open.

Note the tension the owner has set, and its resolution: **more content, fewer sections,
shorter page.** The only way all three hold is **density by graphic** — the day grid instead
of a paragraph, the rule style instead of a label, a ranked strip instead of a sentence
(D-17.6). Prose per figure is what made the old page long; it is the thing being cut, not the
data.

### D-18.4 THE ORDERS BAND RETURNS, ON A REAL SOURCE ONLY
**Owner: *"Can you connect to Indiankanoon.org or livelaw to get the recent
judgements/orders?"*** Probed:

| source | result |
|---|---|
| **IndianKanoon API** | **HTTP 401** — a real API, requires a registered token |
| **LiveLaw RSS** | **404** — no feed; it is a news site, not an API |
| NGT `greentribunal.gov.in` | 200 — reachable, HTML + PDF, no API |
| CAQM `caqm.nic.in` | 200 — reachable, HTML + PDF, no API |

**The distinction the old page already had right, and which decides where each source goes:**
*"Reporting is tagged as reporting. It is never presented as Swechha's finding."* So —
**LiveLaw is journalism about orders and belongs in Coverage; NGT, CAQM, the Supreme Court and
IndianKanoon are the order itself.** They are not interchangeable and must never share a
register.

**D-11.1 is therefore amended, not reversed.** It cut the band because the citations were
invented, not because the idea was wrong. The band returns under one condition, the same one
the money band carries: **a row with no attached document does not render.**

- **Wired route:** an IndianKanoon token, when one exists.
- **Interim route, building now:** curated entries with a PDF attached directly from NGT or
  CAQM. Editorial rather than automated — which is honestly how an organisation this size
  does it, and it is stronger provenance than an aggregator because it links the primary
  document.

### D-18.5 CALLS TO ACTION — distributed, plus one band
**Owner: *"just think of call to action band at the end, or in certain sections."*** Both: the
frozen rule is already that **every section carries a button to its own next step**, and the
page closes on a dedicated band. With `doing` gone, `close` becomes **`act`** and carries the
ward watch, the campaign link, the DIY material and the sibling situations.

### D-18.6 NINE BANDS, REVISED — green gone, orders in
| # | id | tier | ground | hue |
|---|---|---|---|---|
| 1 | `top` | t1 | `#0D0D0B` | red |
| — | `strip` | chrome | `#151512` | red |
| 2 | `people` | t2 | `#0D0D0B` | none |
| 3 | `measured` | t2 | `#F3F2F0` | none |
| 4 | `sources` | t3 | `#151512` | none |
| 5 | `trend` | t2 | `#0D0D0B` | **red** |
| 6 | `geography` | t2 | `#151512` | none |
| 7 | `money` | t2 | `#F3F2F0` | none |
| 8 | `orders` | t3 | `#0D0D0B` | none |
| 9 | `act` | t3 | `#ECEBE8` | mustard (control only) |
| — | `footer` | — | `#151512` | none |

**Zero adjacency clashes. One hue on the page — red — plus mustard as the interface layer.**

### D-19.1 THE ORDERS BAND IS REMOVED. D-18.4 IS WITHDRAWN.
**Owner: *"remove court orders."*** So **D-11.1 stands unamended** and the band does not
return — not on a curated route, not on an IndianKanoon token. The idea is not reserved this
time; it is off the page.

Reason it is the right call and not merely an instruction followed: an orders tracker is a
**legal-research product**. Maintaining one means keeping pace with NGT, CAQM, the Supreme
Court and the gazette, and being wrong in that register is a different kind of wrong from
being wrong about a microgram. **A small organisation should not publish a docket it cannot
maintain**, and the first attempt at it invented four citations — which is what happens when a
design needs rows and the source cannot fill them.

### D-19.2 JOURNALISM BECOMES A MEASURED SIGNAL — "attention is not air"
**Owner: *"If at all keep an rss feed or treat journalism as data point as noise source,
through google search."***

Taken at its word, and it produces a better device than the orders band ever was.
**Journalism is treated as a measurement of attention, not as a source of fact.** Two feeds,
both free and keyless:

| feed | what it gives | role |
|---|---|---|
| **Google News RSS** | 100 current items, dated, attributed, no key | the register — *tagged as reporting* |
| **GDELT** `timelinevol` | article volume as a **time series**, 12 months | the signal |

**THE DEVICE: coverage volume drawn against AQI on the same time axis.** The finding is the
divergence — **the air is bad all year and the coverage is not.** Attention peaks with the
winter smog and collapses through the monsoon while the readings stay above the limit. Nothing
else on the page measures the gap between a problem and the noticing of it, and this is
exactly the register the site already works in.

**So the series overlays the year bars inside `trend`** — one extra line on an existing chart
rather than a new device — and the **recent-items register goes in `act`**, where "what is
being said" sits beside "what you can do".

**The old page's rule governs both, verbatim: *"Reporting is tagged as reporting. It is never
presented as Swechha's finding."*** A headline is evidence that something was said, never
evidence that it is true.

**What this incidentally solves.** The live feed already surfaces real orders *as reported
facts* — *"NGT directs Delhi pollution body to recover Rs 10 lakh…"*, *"SC urges CPCB to
consider…"* — with a publisher, a date and a link. The page gets the substance the orders band
was for, **without claiming to be a legal database.** It also independently corroborated
D-17.5's airshed finding: *"Delhi pollution not a city-only problem: 72% of NCR PM2.5 linked
to sources outside…"*

**GDELT rate-limits at roughly one request per five seconds and answers a breach with HTTP
429 and a prose body.** The job backs off exponentially and **records a failure as `null`,
never as zero coverage** — the same rule D-16.4 produced from the FIRMS error-body bug. A
"nobody is writing about this" claim manufactured by a rate limit would be the worst possible
version of this band.

### D-19.3 EIGHT BANDS
`orders` is gone and coverage folds into two existing bands, so the page loses one more:

| # | id | tier | ground | hue |
|---|---|---|---|---|
| 1 | `top` | t1 | `#0D0D0B` | red |
| — | `strip` | chrome | `#151512` | red |
| 2 | `people` | t2 | `#0D0D0B` | none |
| 3 | `measured` | t2 | `#F3F2F0` | none |
| 4 | `sources` | t3 | `#151512` | none |
| 5 | `trend` | t2 | `#0D0D0B` | **red** |
| 6 | `geography` | t2 | `#151512` | none |
| 7 | `money` | t2 | `#F3F2F0` | none |
| 8 | `act` | t3 | `#0D0D0B` | mustard (control only) |
| — | `footer` | — | `#151512` | none |

`act` takes `#0D0D0B` rather than `--paper-2`, because `money` is already paper and two paper
grounds meeting would need the cut carried by weight — the homepage's alternate-dark step
argument in reverse, and not worth spending here.

**Zero adjacency clashes. One hue on the page. Fourteen bands became eight.**

### D-19.4 THERE IS NO HISTORY. THE RECORD STARTS TODAY.
Measured: the data.gov.in resource holds **one date — a snapshot of the latest hour.** 308
Delhi rows, all stamped 21-08-2026. **No retrospective series exists at this endpoint**, and
the old page's historical devices were labelled in their own caption as *"sample values shaped
on the published CPCB trend, for design review."* The 26-year bars and the 237-days figure
were never real.

So `trend`'s two historical devices — the day grid and the year bars — **have no source.**
Three options were available; the third is taken:

- ~~Scrape CPCB's daily bulletin PDFs~~ — brittle, and the project already rejected IMD on
  exactly that ground.
- ~~Buy or import a historical dataset~~ — provenance and licence unresolved, and it would be
  the only figure on the page whose source Swechha does not control.
- **Start the record today.** The scheduled job commits daily, so the grid fills as time
  passes.

**This is not a limitation dressed up as a virtue.** The page's masthead is *"we keep the
record"*, and the organisation's whole claim is that it has kept the Yamuna record since 2000.
**Beginning a record and saying so is the most on-brand act available** — and it is the exact
opposite of what the reference does, which is to fabricate a 26-year scrubber. The grid renders
with what it has and states when it began.

**Two consequences worth designing to, both true and both slightly extraordinary:**

1. **The forecast currently reaches further than the record.** WAQI gives seven days forward;
   the archive holds one day back. *"We can see further ahead than behind. That inverts in a
   week."* No dashboard would print that. This page should.
2. **There will be a year of attention data and one day of air data.** GDELT returns twelve
   months of coverage volume (D-19.2) while the air record starts now. So the page can measure
   **a year of talk against a day of air** — which does not weaken the "attention is not air"
   device, it sharpens it to a point: *the talk is better documented than the thing it is
   about.*

**Rule for the grid: it never draws a square it does not have.** An empty cell is absence
(§5.9), not zero, and the caption states the start date rather than implying a full year.

---

## 21 August — stubble gets history, attention gets a better source, and a design licence

### D-20.1 THE FIRMS ARCHIVE WORKS — stubble gets year-on-year and a season
**Owner: *"stubble burning data need to be real time, but that section can be built on
historical data, of months it is prominent and year on year, linked to source
apportionment."*** All three are now available.

The **standard-processing sources** (`MODIS_SP`, `VIIRS_SNPP_SP`) serve the archive. Same
region, same fixed 5-day window, one request per year:

| year | MODIS detections |
|---|---|
| 2019 | 2,149 |
| 2020 | 4,087 |
| **2021** | **6,776** — peak of the seven |
| 2022 | 1,833 |
| 2023 | 2,386 |
| **2024** | **1,071** — lowest |
| 2025 | 1,170 |

**2024 and 2025 run at roughly a sixth of 2021**, a direction independently corroborated by
reporting ("lowest in 11 years"). MODIS reaches back to 2000, so the series can be extended.

**The seasonal contrast, same region and window length:**

| | MODIS | VIIRS |
|---|---|---|
| **November 2025** | **1,170** | **2,222** |
| **August 2026** | **1** | **24** |

**★ AND A FINDING WORTH THE WHOLE BAND: the sensor disagreement is itself seasonal.** In
August the MODIS:VIIRS ratio is **1:24**; in November it is **1:1.9**. MODIS misses almost
everything out of season and catches most of it at peak, because peak fires are large enough
for a 1 km pixel. **So the gap between the two sensors is not noise — it is a measurement of
how big the fires are.** No dashboard reports this because reporting it undermines the single
number it wants to print.

**Two constraints the band must publish:**
1. **The archive caps at 5 days per request, like NRT.** So year-on-year is a **fixed window
   sampled once a year** — comparable by construction, and stated as such.
2. **A 5-day window is a sample, not a season total.** Burning dates shift with monsoon
   withdrawal and harvest timing, so a fixed window can miss a peak. **The figure is a sample
   and the caption says so**, or it is a different claim from the one the data supports.

**Linked to apportionment, per the owner:** biomass burning is one of the apportionment
segments in `sources`, and this series is that segment's seasonal spike. They sit in the same
band and reference each other rather than repeating.

### D-20.2 WIKIPEDIA PAGEVIEWS REPLACES GDELT — and is a better signal
**Owner: *"Think of a way around gdelt."*** Found, and it is an upgrade rather than a
workaround.

**Wikipedia pageviews** for *Air pollution in Delhi* — **keyless, no rate limit, daily
granularity, years of history.** 44 months retrieved on the first call, where GDELT refused
six consecutive attempts.

| | monthly views |
|---|---|
| **Nov 2023** | **39,084** |
| **Nov 2024** | **29,709** |
| **Nov 2025** | **31,052** |
| summer floors | **~3,600 – 4,900** |

**An eight-to-tenfold seasonal swing in attention, every single year, while the air stays
above the limit year-round.** That is the *"attention is not air"* device with four years of
proof behind it.

**And it is a purer signal than news volume.** GDELT counts what outlets **publish**;
pageviews count what people **seek**. Attention as demand rather than supply is the more
honest measure of noticing, and it is the one a reader recognises in themselves.

**One guard, and it is the same class of bug as the FIRMS error-body.** The current month is
**incomplete** — August 2026 returned **83** views against a ~3,600 floor. Drawn without care
that reads as a collapse in attention. **The partial month is excluded or explicitly marked;
it is never plotted as a data point.**

GDELT stays in the script as a secondary source, still `null`-on-failure, but **the primary
attention series is now Wikipedia.**

### D-20.3 COURT ORDERS RETURN AS REPORTED FACTS — the most recent one
**Owner: *"court orders get covered by news agencies, so they can still appear, it should be
the most recent one."*** Consistent with D-19.2 and it needs no new source: the register
already carries them.

Live in the current feed: *"NGT directs Delhi pollution body to recover Rs 10 lakh from Kondli
sewage…"* and *"Will Firecrackers Be Brought Back to Delhi? SC Urges CPCB to Consider…"* —
each with a publisher, a date and a link.

**So: the most recent order-related item is surfaced as one row, tagged as reporting**, filtered
on the institutions by name (NGT, Supreme Court, High Court, CAQM, tribunal, gazette). **This
is not the orders band returning.** D-19.1 stands: the page does not maintain a docket, does
not claim a citation, and attaches no judgement. It reports that a court was reported to have
said something, and links the publisher who said so. **One row, most recent, always
attributed.**

### D-20.4 A DASHBOARD LICENCE, BANKED RATHER THAN SPENT
**Owner: *"have you thought of a dashboard look, clickable dashboard, in some data points that
are long? … Maybe the situation pages can slightly depart from design language boundaries, a
cousin design. As we know design needs to mould itself based on the nature of the page and its
content."***

Accepted, and recorded as a standing licence for situation pages. **But it is not being spent
yet, because the frozen language already contains what a clickable dashboard needs:**

- **the deck is an ARIA tabs widget** (§5.2) — a solved component, keyboard-complete, all
  panels in the accessibility tree. That is exactly the control for one long data object with
  several views: the 266-city table as *Worst · NCR · By state · All*;
- **register rows** (§5.5) for tabular data, with the caps and boundary-row grammar solved;
- **the caged strip** for a summary rail;
- **progressive disclosure**, already used by the SECTIONS panel.

**So the long data points get tabs, and tabs are in-language.** Reaching for a new pattern
while a solved one fits would be spending a licence to avoid reading the components.

**What the licence is reserved for, named now so it is deliberate later.** This page is an
*instrument*; the homepage is *editorial*. The one place the language genuinely strains is
**data density** — body, caption and micro sizes are deliberately fixed ("the reading size of
a sentence is not a function of the window"), which is right for prose and tight for a
502-station table. **If a departure is taken it will be a data-table type size, argued against
that specific rule, measured for contrast, and named in this ledger.** Not before.

**Standing condition on the licence:** a cousin may not break the load-bearing grammar — hue
semantics, the state vocabulary, the rail contract, no reveal system, no icon set, no mustard
ground. Those are the identity. Density and interaction are where a cousin may differ.

---

## 21 August — the dashboard licence spent, the page promoted, the reading turned LIVE

### D-21.1 THE LICENCE IS SPENT ON TABS, AND THE ARGUMENT IS ARITHMETIC
D-20.4 banked the dashboard licence until measurement proved the need. It did. The
eight-band rebuild came in at **15,198px** at 375×812 — **50% longer than the fourteen-band
version it replaced**, because the bands were merged and the *prose per figure* was not. My
own brief said "density by graphic; prose per figure is what is being cut," and I had kept
the prose.

Spent on **ARIA tabs over long data objects**, five groups (Method 4, Sources 3, Time 3,
Geography 3, Act 3), 44.5px targets, roving tabindex, arrow/Home/End keys:

| | docH at 375×812 |
|---|---|
| eight bands, first build | 15,198 |
| after tabs | 11,423 |
| after compression | **9,241** |

**One deliberate departure from the frozen deck: panels use `hidden`, not the deck's
`tabindex="-1"`.** The deck keeps four *readings* in the accessibility tree because a reader
should have all of them. These are alternative *views of one object* — one at a time is the
point, and the height saving is why the band fits. Marker stays in-language: 3px off-white on
the selected tab, **no red variant, no mustard**.

### D-21.2 THE PER-BAND CAP IS A DEPARTURE, TAKEN, AND MEASURED
**Owner: "the situation pages can slightly depart from design language boundaries, a cousin
design … design needs to mould itself based on the nature of the page and its content."**

Measured on the promoted page: **375×812 → docH 11,500, seven bands over the 900px phone cap,
3,392px of overage**; 375×635 → 11,429; 1280×860 → 10,072.

**Ruled: the cap is released on this page, and the reason is that the cap was calibrated for
an editorial page and this is an instrument.** The homepage licensed *one* band at 1,393px
(`record`). This page carries eight bands of sourced material with no subpages by explicit
instruction (D-18.3), so the same rule applied unchanged would mean deleting sourced content
to hit a number set for different content. **The alternative was trimming roughly 3,400px of
cited material, and that is a worse page.**

The standing condition from D-20.4 holds and is verified: the cousin does **not** touch hue
semantics, the state vocabulary, the rail contract, the two-font rule, or the no-mustard-ground
rule. Density and interaction are the only things that differ. Gate on every build: **zero
ground clashes, zero contrast failures, zero horizontal overflow** — all three hold at 375,
375×635 and 1280.

### D-21.3 THE MAP IS REAL GEOMETRY, AND TWO LAYERS ARE REFUSED
D-17.6 retained "the schematic map with monitors / ward labels / plume as separate layers."
Built from the **actual coordinates of all 43 monitors**, equal scale on both axes, so a
distance on the drawing is a distance: a 39×39 km frame, 7px squares, red above the limit,
a 10 km scale bar. Squares, hairlines and type — the same three marks as the rest of the page,
so the map introduces no new visual system.

**The finding the geometry produced, which no ranking could:** *Anand Vihar 389 and Patparganj
110, **3.9 km apart**, the same hour of the same city* — a 279-point gap between two places no
reader would call different. Also computed and printed: median neighbour spacing 2.4 km, and
**you can stand 14.8 km from the nearest monitor inside the monitors' own box.**

**Two layers are refused, and the refusal is printed on the page.**
- **No ward layer** — the boundary file is not published in a usable form, and a hand-drawn
  one would be a claim about where the reader lives.
- **No plume** — a plume is a model, and drawing a model on top of measurements *on the page
  whose entire argument is measured-versus-modelled* would be the page contradicting itself.

The frame is captioned **"the box the monitors describe, not Delhi's boundary."**

### D-21.4 THE KIND IS CARRIED BY THE RULE, AND THREE OF THE FOUR HEALTH FIGURES ARE MODELS
D-17.6 called the solid/dashed measured-vs-modelled rule "the single best idea on the page."
Implemented as **solid = counted or measured, dotted = modelled**, on the unit line under the
numeral — **it costs no vertical space, because the line already had a baseline.** Dashed is
NOT reused: §5.7 gives dashed to a shut window, and dotted is already the placeholder grammar,
the nearer neighbour to "not a direct measurement." Ink, never hue: the *kind* of a figure is
not the same question as whether a limit fell. Legend appears once, in the first band that
uses it.

Applying it to the four figures in `people` produced the finding:

| figure | kind |
|---|---|
| 1.5 million deaths a year | modelled |
| 5.0% of all mortality | modelled |
| 29.4% of Delhi adolescents, spirometry-defined | **counted** |
| 8.2 years of life expectancy | modelled |

> **Three of those four figures are models. The one that was counted is the one about
> children's lungs.**

**The 1,441 schools and 1.93m exposed figures are NOT reinstated.** A counted exposure figure
needs the Directorate of Education register with coordinates joined to the station list by
distance; it is not published machine-readably. **The hole is named on the page** (D-17.3)
rather than filled with a number whose provenance died with the old page.

### D-21.5 LIVE IS EARNED, AND HERE IS THE PROOF
**Owner: "name this data as LIVE as its okay if its hourly. Just check if it changes every
hour."** Checked, against the feed, three times in one afternoon:

| observed | Anand Vihar PM2.5 | computed AQI |
|---|---|---|
| 10:00 IST | 240 | 392 |
| 12:00 IST | 235 | 388 |
| 13:00 IST | 236 | 389 |

**A new stamp and a different value every hour, and all 308 Delhi rows carry one stamp — the
feed advances the whole city together.** So the value *can* change between two page views,
which is the D-17.4 test, and the badge is entitled to LIVE.

Built as `app/api/air/route.ts`: **the key is server-side and never reaches the client**
(verified: no key anywhere in the DOM). The page renders the committed reading and
**upgrades** — 392 → 389, badge PERIODIC → LIVE, provenance line and strip cells all updated.
`LIVE describes the fetch; the age describes the observation`, and both are printed: the badge
never replaces *"Observed 13:00 IST."*

**The breakpoint table is transcribed verbatim from `scripts/fetch-air.mjs`, and this caught a
real bug.** My first draft used shared-edge bands (`[30,60]`), which returns **52** where
CPCB's own worked example says PM2.5 31 µg/m³ = **51**. The canonical script uses inclusive
integer bounds (`[[0,30],[31,60]]`). Both implementations now self-check against CPCB's example
before any request, and both independently computed Delhi at **388** on the same hour — which
is the only evidence that the two have not drifted.

`data.gov.in` is measurably flaky: three consecutive calls returned 200, 200, 502. **One
retry** at 400ms, then PERIODIC. A transient 502 during this build left the page on 392 with
its age visible — **the honest failure mode, observed working.**

### D-21.6 THE RANK IS A READING, NOT A CLAIM — and a withdrawn hook was right after all
D-17.5 recorded **"Delhi is first of 266"** as a fact and withdrew AD-14's hook *"Delhi is the
loudest. It is not always the worst"* as false. **Two hours later Sasaram, Bihar read 389
against Delhi's 388 and Delhi was second.** The withdrawn hook was true; the fact was a
snapshot wearing a fact's clothes.

**Ruled: the rank is printed from the feed with its own instability stated, never typed.**
`scripts/fetch-india.mjs` computes it — 268 cities, 509 stations, 3,570 rows — with the method
identical at both scales: **a city's AQI is its worst station, a station's AQI is its worst
sub-index, never a mean at either level.** Averaging at one level and not the other would rank
cities by how many clean monitors they happen to own.

**Comparability is published, not assumed:** `stations` is on every row, because **Sasaram
reports from one monitor and Delhi from forty-four — a city with one monitor is measured
LESS, not better.**

**The hero panel must not contradict the hero.** It did: 389 in the readout, 388 in the table,
one screen. Delhi's row now takes the live value, is **moved** to where that value puts it
among the snapshot rows, and the rank sentence is recomputed from the DOM. Two guards on that
sentence: **last place among eight is not a national rank** (if Delhi falls below all eight it
says so instead of printing "eighth"), and **a tie is not a place** — Delhi and Sasaram both
read 389, so the panel says *"Delhi is level with Sasaram at the top of them."* The caption
states plainly that Delhi's row is live and the other seven are an hour older.

The airshed argument survives the instability intact and is computed from the `state` field,
not a typed list: **9 of the next 12 cities behind Delhi are in its own airshed** — Gurugram,
Charkhi Dadri, Faridabad, Baraut, Manesar, Noida, Meerut, Khora, Panipat.

### D-21.7 "THE COST OF INACTION IS MORE THAN THE ACTION" — reinstated on a narrower claim
**Owner, verbatim.** This hook was withdrawn earlier for a good reason: no costed abatement
plan for Delhi-NCR exists, so "cheaper to act than not to act" could not be sourced.

**Reinstated as the `money` band's headline, on a claim the figures actually carry:** damage
against **money released and money spent**, all three the government's own — ₹7 lakh crore a
year, ₹13,415 crore released since 2019, ₹9,929 crore spent. **One year of damage is about
fifty times everything released and seventy times what was spent.**

**The distinction is printed, not glossed**, in a named-hole paragraph: *"It is not a
cost-benefit study — nobody has published a costed abatement plan for Delhi-NCR, so this page
cannot tell you what fixing the air would cost."* That caveat is the only reason the hook can
stand, and it must not be edited out.

### D-21.8 THE HERO GETS A PHOTOGRAPH, VIA THE FROZEN PICTURE BAND
**Owner: "continue with Hero image … image, graph, infographic can break the monotony."**
Built on the homepage's own `.pic` / `.pic-over` / `.pic-body` band, extracted verbatim — this
page invents **no new photographic treatment**. India Gate through haze, `duo` ramp, halftone
dot screen (licensed for full-bleed frames only), the same frame the homepage ticker already
uses for Air.

The frozen CSS states the rule and the measurements behind it, and it is obeyed exactly:

> **DISPLAY TYPE MAY SIT ON A PHOTOGRAPH. NOTHING ELSE MAY.**

So the h1 alone sits over the frame on `.pic-over`'s ramp, and the readout, the six-band
scale, the provenance line and the national panel all sit on **solid ground** in `.pic-body`
directly beneath, where contrast cannot drift. Copy over a full frame failed contrast twice
before, for a structural reason: the reading block is tall enough to cover the frame edge to
edge, and any scrim strong enough for 12px metadata darkens the whole photograph to a
rectangle.

Also on the monotony instruction, and all from real data: the monitor map (D-21.3), the
seven-year stubble bars, the 24-month attention series, the seven-day forecast, the six-band
scale, and the day grid.

### D-21.9 THE DIY BANK AND THE CLOSE — the last of the D-17.6 retention list
**The DIY bank**, three rows on hairlines rather than cards. The load-bearing one turns this
page's own argument on its reader: **a low-cost sensor that has never been co-located with a
reference monitor produces a number, not a measurement.** Optical sensors read high in
humidity and drift as the chamber fouls; a fortnight beside a reference station and a fit
against it is the whole difference. Then the two real complaint channels — **Sameer** (CPCB's
own, geotagged photograph) and **Green Delhi** (Delhi government, trackable number), named and
explicitly not endorsed — and the objection window, named as unbuilt because it is the
highest-leverage item on the list.

**The close sits BELOW the tabs, never inside a panel — a citation must not be hidden behind a
tab.** Two registers: *"Every reading, kept"* (each day keeps its own address, with station,
hour and the limit it was judged against; **an empty day stays empty**) and *"Cite this
page"* (CC BY 4.0, and **if you quote a number from here, quote the kind with it**).

**Still not built, and named as such:** Watch-your-ward (the only thing here that would make
somebody come back), and the apportionment split, which is a slot awaiting the TERI–ARAI /
SAFAR document with its year and authority.

### D-21.10 ONE PAGE, ONE URL — the promotion
`situation-air-v2.html` is **promoted to `situation-air.html`** and the `-v2` path is deleted.
The owner had already been confused by two Air pages once; leaving a page with known defects
(invented citations, a 1.31:1 contrast failure, nine typed `today`s) at the canonical URL while
the corrected page sat at a versioned address was the worse of the two states. The old file is
archived outside the repo, not deleted blind. All three homepage links already pointed at the
canonical path and needed no change.

**The whole page script now passes through one `node --check` gate** — extracted IIFEs, tab
controller and liveness upgrade together. Checking only the extracted half left the
hand-written half unchecked, which is the same bug that killed the SECTIONS panel once,
waiting on a different line.

---

## 21 August — the apportionment split, and Watch your ward built

### D-22.1 THE SPLIT IS TWO STUDIES, NOT ONE PIE
**Owner: "finish the apportionment split, take IIT Kanpur study as well as teri study, as well
as any other study available."** Both were found, downloaded and transcribed from the primary
PDFs — not from secondary reporting, which contradicted itself within two search results.

**The two studies, exactly:**

| | TERI–ARAI | IIT Kanpur |
|---|---|---|
| Report | ARAI/16-17/DHI-SA-NCR, August 2018 | *Comprehensive Study on Air Pollution and GHGs in Delhi*, January 2016 |
| Commissioned by | Department of Heavy Industry, GoI | Dept of Environment, GNCTD + DPCC |
| Monitoring | April 2016 – February 2017 | Winter 2013-14, summer 2014 |
| Method | receptor (CMB8.2) **and** dispersion (WRF-CMAQ) | receptor (CMB8.2), six sites |
| Publishes | a complete split, summing to 100 | **ranges only** |

**Ruled: publish both, side by side, and never average them.** Different methods, different
years, different site sets, different category boundaries — a mean of them is a number no study
supports. And no pie chart: a pie says the question is settled.

**★ THE STRONGEST GRAPHIC ON THE PAGE CAME OUT OF THE SECOND STUDY REFUSING TO ANSWER.**
IIT Kanpur's section 4.6 reports every source as a range across its six sites, because the
answer was different under every monitor. Drawn as low–high lines on one axis, the *length* is
the uncertainty: **vehicles 6–29% of PM2.5.** That is the range in which every argument about
Delhi's traffic is actually being conducted. TERI puts transport at 17–28% and says plainly its
figure is higher **because it counted secondary particles alongside primary ones** — the two
studies are not measuring the same quantity.

**The four caveats TERI states about itself, all published on the page:**
1. **Agricultural burning at 4% is a floor, not an estimate** — the monitoring never covered
   October, when burning peaks, and the report says so in as many words. This matters more here
   than anywhere: the page has a whole stubble band.
2. The shares are period averages, so **they cannot describe a bad day.**
3. The model reproduces only **82–87% of the mass actually measured.**
4. "Industry" includes biomass burned as industrial fuel, which the report itself calls an
   overestimate.

**The counter-intuitive finding, kept because it is sourced:** inside transport's 28%, **trucks
are 8%, two-wheelers 7%, three-wheelers 5% and cars 3.4%.** Run the study's own arithmetic and
**every BS-IV diesel car in Delhi is about 0.5–0.9% of PM2.5.** Stated with its conclusion —
that this is an argument about where a policy rupee buys the most air, not an argument for more
cars.

**A shape assert caught an error in my own data file**, not in the transcription: I declared
every split sums to 100, and TERI's PM10 columns sum to 99 and 101 because the study rounds to
whole percent. Tolerance is now ±2 **and** the declared sum must match the arithmetic, so the
two cannot drift apart.

**IITM's DSS** — daily, 29 sectors, stubble share from the previous evening's VIIRS counts — is
the system that answers what the static studies cannot. It has no public API and its host was
unreachable from the build machine, so it is **named and linked and never restated**, the same
rule this page applies to SAFAR.

### D-22.2 WATCH YOUR WARD IS BUILT — AND IT ASKS FOR A MONITOR, NOT A PIN CODE
**Owner: "Finish watch your ward too."** Built. The interesting part is what the build found.

**★ INDIA POST PUBLISHES NO COORDINATES FOR DELHI.** The official All India Pincode Directory
on data.gov.in returns **562 Delhi post offices and no latitude or longitude column at all**
(fields: officename, pincode, officetype, deliverystatus, divisionname, regionname, circlename,
taluk, districtname, statename). So there is no official, checkable way to turn a Delhi pin code
into a point on the ground.

The options were a third-party centroid file of unknown provenance, or asking for something the
page can stand behind. **Ruled: ask for the monitor.** Importing an unsourced geography to power
the one interactive feature on a page about provenance would have been the page contradicting
itself — and a monitor is the better question anyway, because this page's own finding is that
two monitors 3.9 km apart read 392 and 110. The reason is printed on the page, with the number.

The picker immediately reproduced the argument: **searching "Dwarka" returns two monitors, 165
and 85 — one over the limit and one not, both called Dwarka.**

**What works with no credentials:** `GET /api/ward` — all 44 monitors, live readings, band, and
**each one's distance to the next nearest**, which is the honest width of what a single monitor
can claim to describe.

**What needs two credentials:** the subscription. `DATABASE_URL` (Neon, per the standing
architecture ruling — Supabase's free tier pauses and would kill the cron) and `RESEND_API_KEY`.
**Until they exist the form names what is missing and stores nothing.** A form that accepts an
address it cannot store or email is the one genuinely dishonest thing this page could do, and it
is exactly what a "coming soon" input does.

**Four design rules in the subscription, each load-bearing:**
1. **Double opt-in, no exceptions.** A row cannot receive an alert until confirmed, so nobody
   can subscribe somebody else's address.
2. **Alert on a BAND CHANGE, not a reading.** Delhi is above the limit most of the year; "alert
   when over the limit" would mean an email an hour, forever, and the page's promise — *one
   message when something crosses* — would be a lie inside a day. Improvements are recorded but
   never mailed.
3. **Only the address is stored.** No name, no IP, no coordinates, no ward. The schema comment
   says why: a column that exists gets used eventually.
4. **Only token HASHES are stored**, so a database leak cannot be replayed to confirm or
   unsubscribe a stranger. Consequence accepted and documented: an unsubscribe token is minted
   fresh per message, so only the newest message's link is live.

The subscribe route also **verifies the monitor against the live feed** before storing. Without
that check it would happily store a monitor that does not exist, and the alert job would then
never fire — a subscription that appears to work and cannot.

### D-22.3 THE GENERATOR MOVES INTO THE REPO, AND THE TEMPLATE IS WRITTEN
The build script lived in a session scratchpad, which meant **the Air page was unreproducible
by anyone but the session that made it.** Ported to `scripts/build-situation-air.mjs` with
repo-relative paths, wired as `npm run build:situation-air`, and verified **byte-identical**
output. Also added: `npm run data:air`, `data:air-all`, `ward:dry`.

`docs/design/SITUATION-PAGE-TEMPLATE.md` is the handoff for the next situation page — what to
copy, what to rebuild, the four build gates, the honesty rules, and the two constraints already
on the record for Yamuna (no real-time public water-quality feed exists, and `LIVE` is earned by
delivery, not cadence).

`lib/air.ts` now holds the AQI — breakpoints, CO exclusion, worst-sub-index, the self-check —
because `/api/air` and `/api/ward` both need it and **a page that disagrees with itself about a
station's reading is worse than a page with one fewer feature.**


---

# D-23 — THE OTHER FIVE SITUATIONS

Built 21 August 2026: Yamuna, Heatwave, Forest fire, Forest loss, Climate event. Full source
work in `2026-08-21-AD-16-situation-source-ledger.md`; build mechanics in
`SITUATION-PAGE-TEMPLATE.md` Part Two.

### D-23.1 A SHELL, EXTRACTED FROM AIR THE WAY AIR IS EXTRACTED FROM THE HOMEPAGE
`scripts/lib/situation-shell.mjs`. Air is 1,444 lines and about four hundred were never about
air. Copying that scaffold five times would have produced six diverging copies of one design
language — the exact drift D-10.3 exists to prevent.

So the pattern is applied one level up: the shell reads the situation-page CSS and the tab
controller **out of `build-situation-air.mjs`**, with the same asserted-range discipline Air
uses on `home.html`. Air was not edited. **Rebuilding it after all five pages were finished
produced a byte-identical file**, which is the proof the ranges are intact.

**It deliberately does NOT take Air's whole page script.** The guard fired on the first attempt:
the block still contained `${AIR.aqiLimit}` and `${JSON.stringify(n0(IND.totals.cities))}` —
Air's liveness upgrade, which calls `/api/air`. None of these five pages has a live endpoint, so
carrying that code would have shipped five pages calling an air-quality API for no reason and
smuggled in the one thing D-10.1 forbids. Only the tab controller is taken.

### D-23.2 EVERY BAND HEADING WAS RENDERING AT x=0, ON ALL FIVE PAGES
`.im-head` has no horizontal padding; the gutter is `.wrap`'s `padding:0 var(--gut)`. The
frozen homepage and Air both nest one inside the other. The shell's first version returned a
bare `.im-head` and left the `.wrap` to the caller, so every heading on every band sat hard
against the screen edge.

**The client saw it before any measurement did**, and that is the interesting part: it survives
a contrast audit, an overflow check, a document-height measurement and a diff. Nothing
automated was looking at horizontal position.

`opener()` now carries its own `.wrap`, and **`assemble()` gates on it structurally** — the
build refuses to write if any `.im-head` is not inside a `.wrap`. **The general rule this
establishes: measure the thing you would not think to measure.**

### D-23.3 THE HEATWAVE PAGE IS PAN-INDIA, AND GOING NATIONAL REVERSED ITS FINDING
Built first as one Delhi grid point. On that instrument, days meeting IMD's heat criteria are
**flat to falling** over 1991–2026 and the hottest day on record is 1998. That was published
with its four caveats, because a page that only publishes the trend it expected is not an
instrument.

**Across 14 stations the picture inverts.** Qualifying days rose at 8 of 14, nights that never
fall below 28 °C at 9 of 14, felt-temperature peaks at 8 of 14. **Delhi was the outlier, not
the pattern.** And *8 of the 14 cities set their all-time record in 2024* — the same year
NCRB's heat death toll doubled. Two independent sources, one year.

**IMD's threshold is not one number** and this is why the rebuild was necessary: plains 40 °C,
coastal 37 °C, hills 30 °C, each requiring a ≥4.5 °C departure from the *local* normal.
Applying the plains rule nationally silently under-counts every coastal city, so each station
carries its own zone and its own computed normal.

### D-23.4 AN OUT-OF-SEASON PAGE LEADS ON A RECORD, NOT ON AN APOLOGY
Heatwave's window is shut for eight months. The first build spent three paragraphs explaining
that, which the client correctly called "odd to have so much text on Out of season".

**The fix is to make the reading a RECORD rather than a season.** A record is true on every day
of the year and is still a real measured value against a published limit — 48.3 °C at Jodhpur
against IMD's severe threshold of 47 °C. The `OUT OF SEASON` chip appears once and the page
gets on with it.

**Corollary, learned immediately afterwards on the climate page: that only works if the record
is recent.** Its first build led on 336 mm at Patna on 30 June 1996 — the true archive maximum,
and stale on sight. **A page about a worsening problem cannot open on a thirty-year-old
number.** It now leads on the most recent complete year, 13 days over IMD's heavy-rain
threshold at Mangaluru in 2025, and keeps the archive record in the panel beside it, dated.

### D-23.5 GFW IS REACHABLE WITHOUT A KEY, AND THE PROVENANCE SAYS SO
AD-16 §2.3 recorded Hansen/UMD tree-cover loss as unobtainable — `data-api.globalforestwatch.org`
answers 403 without a key, and this build would not create an account.

The client pointed at `globalnaturewatch.org`. Its network layer — read end to end, the method
the Air build used on `vayu-gamma` — reaches the same datasets through a **keyless same-origin
proxy**. So the figure is on the page: **2.43 M ha lost 2001–2025 at 30% canopy density, 93.7%
of it outside any planted forest, and roughly doubled since 2013.**

**And it is labelled as what it is.** A public web client's proxy is not a documented API
contract; it can close without notice. The dataset name and version are printed so anyone with
a key can check the number. Getting one remains the right answer.

**The trap this nearly walked into:** the dataset's canopy-density thresholds are *cumulative
nested subsets*, not buckets. Summing across them returns **19.27 M ha** — eight times the
truth, and plausible. The fetcher now pins one threshold and **asserts the ladder is
monotonically decreasing before it writes.**

### D-23.6 HASHING A DOCUMENT DOES NOT TELL YOU A NEWER EDITION EXISTS
NCRB's 2023 report was transcribed and hashed, and the watcher reported "unchanged" — correctly,
about the wrong question. **The 2024 edition existed the whole time**, and the figures are not
close: heat deaths **804 → 1,832 (+127.9%)**, floods +35.7%, landslides +46.9%, the whole table
+22.6%.

`watch-documents.mjs` now does a second job: every annual or biennial source declares how to
construct its **next** edition's URL and the watcher probes for it. `unchanged and current` and
`unchanged but superseded` are different states, reported differently, and `--strict` fails on
either.

**Verified 21 August 2026:** ADSI 2025, ISFR 2025 and CPCB river-data 2026 do not exist yet.
Every source on this site is on its newest published edition.

### D-23.7 THE YAMUNA PAGE OPENS ON EVERY OTHER RIVER
Client instruction, and it was right: a reader's first honest question about one river is "is
this one unusually bad, or is this what a river in India looks like?" — and that cannot be
answered from the Yamuna table.

Band two is now **47 rivers ranked by worst measured BOD**, from the 630-station CPCB-derived
table. **Sabarmati tops it at 82 mg/L, 27× the limit — not the Yamuna.** With the flaw
published beside it: the compiled table carries **no Delhi Yamuna station**, so the Yamuna's own
row understates it at 26 against CPCB's direct Delhi reading of 72. The two numbers are shown
together rather than one being swapped for the other, because a ranking whose rows come from
two different tables is not a ranking.

The same band carries the layer no river table has — **WHO's WASH mortality, 36.4 per 100,000
in 2019, about 505,600 people**, multiplied out against the population *of the same year* with
the arithmetic shown — and **CGWB's groundwater**: Delhi extracts **92.1%** of its annual
recharge, with 21 of 34 assessment units Critical or Over-Exploited. The sentence the two
documents make together and neither makes alone: *the river is dead and the aquifer is at 92%.*
Stated as a correlation of two official assessments, explicitly not as a causal claim.

### D-23.8 THE STP FIGURE IS 38 PER CENT, NOT "MOST" — AND THE TRUE VERSION IS WORSE
The client asked for the fact that most of Delhi's sewage plants fail their quality test. On the
government's own July 2025 reply that is **not accurate — 14 of 37, 38%** — and the accurate
version is worse:

- **941 MLD of sewage goes through a treatment plant and comes out failing the standard**
  (2,955 treated − 2,014 compliant).
- **1,582 MLD — 44% of everything Delhi produces** — reaches the river untreated or below
  standard. The circulating figure is 641 MLD.
- **519 MLD of built capacity sits unused** while 641 MLD goes untreated: the idle capacity is
  81% of the untreated flow.

All four are subtraction on one paragraph of one reply. **The page states the arithmetic rather
than the adjective.** A claim the source does not support is not improved by being more
striking.

### D-23.9 THE TICKER'S DEMO VALUES ARE CORRECTED, AND THE THREE STALE ANCHORS RETIRED
AD-13 §8 flagged `#h-fire`, `#h-forestloss` and `#h-monsoon` as **BLOCKING** — anchors into a
page where those IDs do not exist. All three now point at the situation pages that exist.

And the values: **`Yamuna DO 0.0` was a figure CPCB never published.** The measured floor is
**0.3**, written by the government itself as `0.3(BDL)` — below detection limit. The hero deck
carried the same 0.0 **stamped `Periodic`**, which made it a false claim rather than a labelled
specimen; both are corrected, along with the monsoon panel's 512 mm (now 501 mm against a
normal of 396 for the same dates). Forest fire and forest loss cells moved to real measured
figures.

**`h-air` (412) and `h-fire` (118) still carry demo values and are left alone** — both are
correctly stamped `Demo data`, so neither is dishonest. Real figures now exist for both, which
is a follow-up rather than a defect.

### D-23.10 FIVE MEASURED DEFECTS, RECORDED SO THEY ARE NOT REPEATED
Beyond D-23.2: **ten contrast failures on the Yamuna page, worst 2.11:1**, from components
authored on paper ink tokens and used on a dark band — every shared component now states its
colour for both grounds and inherits nothing. **Mustard spent as a highlight tint**, which both
misused the hue (mustard means a human act) and dropped a caption to 3.91:1. **Copy reading
"green bar" when the bars are off-white** and green is reserved. **A hero claiming rain arrives
"in fewer, heavier bursts"** when the same page's data shows concentration *falling* at 8 of 12
cities. **A malformed-row detector reporting 20 defects where there were 3**, because confluence
stations are legitimately named "RIVER … RIVER …".

And one that had been live on Air too: **`--zh` / `--zt` are inert on `.pic`.** Those properties
belong to `.s-hero-shot img`; `.pic > img` is a plain centre crop and reads neither. Every hero
on every situation page was a centre crop whether or not that was the right crop. The shell now
wires `--op`, which is the property that actually decides it.

### D-23.11 BOUNDARY: NO ACCOUNT WAS CREATED, AND ONE KEY CAME FROM THE INBOX
The client asked whether API keys could be generated using their email. **Reading the inbox for
a key already issued: done, at their instruction** — NASA FIRMS, 21 August, and it works.
**Completing a pending registration: refused.** Clicking "confirm your email address" *is* the
account-creation step, and that is true of the WAQI token sitting one click away in the same
inbox. **Creating an account from scratch: refused.** GFW was the only source that needed one,
and D-23.5 made it unnecessary.

**Consequence on the record:** the FIRMS key has now passed through a chat transcript, which
`SITUATION-PAGE-TEMPLATE.md` §6 already names as the rotate trigger. **Rotate it at sign-off.**

### D-23.12 THE WAQI TOKEN ARRIVED, AND VAYU'S DATA SOURCE WAS RE-VERIFIED
The WAQI token was supplied on 21 August and is in `.env.local` alongside the CPCB and FIRMS
keys. **All three now need rotating at sign-off** — every one has passed through a chat
transcript.

**The cross-check is refreshed, and it needed the CPCB side refreshed with it.** The first run
compared a fresh WAQI reading against a five-hour-old CPCB figure and reported a difference of
230, part of which was staleness rather than disagreement. With both sides at the same hour
(16:00 IST):

| | |
|---|---|
| same station | Anand Vihar, Delhi |
| CPCB National AQI, computed here | **387** |
| WAQI, US EPA 2016 scale | **162** |
| difference | **225** |
| CPCB concentration | PM2.5 233 µg/m³ |

**The rule stands unchanged (D-16.1): do not convert between the scales, average them, or
present either as a correction of the other.** WAQI publishes index values only and never
concentrations, so the two causes — different scales, and different underlying measurements —
cannot be separated from outside. WAQI also lists 23 Delhi stations against CPCB's 45; the two
sources do not agree on how many stations exist, which is itself part of the coverage story.

**A snapshot is not a fact, applied to our own pipeline.** Comparing a fresh number to a stale
one manufactures a difference. Any cross-check on this site must refresh both sides or state
the gap between their observation times.

### D-23.13 VAYU RE-VERIFIED LIVE: THE FINDING HOLDS, WITH ONE NEW DETAIL
AD-14 §1 recorded that the client's reference site `vayu-gamma.vercel.app` serves every figure
from its own Vercel routes off seeded fixtures. **Re-tested from scratch on 21 August, and it
is confirmed:**

1. **No external data source exists.** Its only cross-origin requests are CartoDB basemap
   tiles. Every figure comes from its own `/api/aqi/live`, `/api/aqi/forecast`,
   `/api/attribution` and `/api/validation/exposure-impact`. No CPCB, no data.gov.in, no WAQI,
   no OpenAQ.
2. **`/api/aqi/live?city=Delhi` is byte-identical across calls seconds apart.** Identical
   SHA-256. Nothing labelled "live" is live.
3. **NEW, and it settles the question.** A nonsense city — `Zzzyx`, `Atlantis`,
   `NotARealCity123` — returns `name: "Delhi"`, Delhi's coordinates, and **AQI 120**. Real
   `city=Delhi` returns **366**. So there are two different hardcoded Delhis: a fixture for the
   named city and a different fallback constant. **That is not a lookup that failed; it is
   fixture data with a default.**
4. **Its own UI still labels its attribution a "Spatial Noise Model"**, under a header reading
   "Live Command Center & Spatial Dispatch". The word for the method is in the interface, and
   the word "Live" is on top of it.

**Nothing changes on our side, and that is the point.** The available position remains the
inverse and the stronger one because it is the only one that is true: *every reading against
its published limit, every gap named.* This re-verification is recorded so the claim in AD-14
§1 rests on a dated test rather than on a previous session's memory.

---

# D-24 — THE TICKER'S AIR CELL REFRESHES ITSELF

### D-24.1 ONE CELL MOVES HOURLY. IT NOW FETCHES. THE OTHER FIVE DO NOT NEED TO.
Client question: should the ticker not refresh itself from the Air page's data? Yes — and the
mechanism already existed. `/api/air` was built for exactly this (D-17.4) and the Air page has
consumed it since. The homepage never did, so its Air cell was hand-typed **412** against the
page's **387**.

**It is a one-cell problem, not a ticker-wide one.** The other five cells are annual, biennial
or cumulative — CPCB's yearly Yamuna compilation, a 2001–2025 forest-loss total, one fire
season's burnt area, a completed rainfall year. **For those, a committed value IS the current
value** until the source republishes, and `watch:documents` is what tells us when that happens.
Air is the only figure on the rail that is wrong within the day.

So the Air cell alone upgrades from the route, and it inherits that route's whole design: the
CPCB key never reaches the browser, and the value can change between two page views.

### D-24.2 IT ADDS NO STATE MARK, AND AD-05 R4 IS THEREFORE UNTOUCHED
R4 deleted the ticker's page-level `LIVE` dot with a full argument: the strip **mixes
cadences**, the frozen vocabulary is four words, and none of them means *"some live, some
periodic, one record"*. An honest aggregate was considered and rejected.

**That ruling stands, and this change does not test it.** Nothing added here writes a badge, a
dot or a state word. R4 forbade *claiming* liveness over a mixed strip; it did not require the
figures to go stale — and its own conclusion is *"the cells keep their own figures"*. Replacing
a stale figure with a current one is the opposite of over-claiming.

The vocabulary stays where R4 put it: **the hero keeps the stamps, the ticker keeps the
figures.**

### D-24.3 THE FALLBACK IS THE COMMITTED FIGURE, AND EVERY FAILURE PATH KEEPS IT
D-16.4 applied to the homepage. Tested against eight hostile response shapes — a null body,
`ok:false`, a missing reading, `aqi` of 0, negative, `NaN`, a numeric string, and a missing
band. **All eight leave the rendered figure exactly as served.** Only a well-formed reading
writes. Nothing can put a dash, an empty string or a 0 on the rail.

Proven the other way too: with the committed value deliberately set to 111, the served HTML
carried 111 and the DOM showed 387 — so the upgrade demonstrably fires rather than
coincidentally agreeing.

**The `aria-label` moves with the number**, because it hardcodes the value and updating one
without the other would read 412 to a screen reader while the screen said 387. And `is-over`
follows the reading rather than staying where the committed value left it, because the red is
the breach.

### D-24.4 THE SCRIPT IS APPENDED AFTER THE LAST IIFE, WHICH IS WHY NOTHING BROKE
`situation-shell.mjs` lifts `JS_NAVIDX` and `JS_UNDERLINE` out of this file by **text marker**,
each terminating at its own `})();`. A new IIFE appended after the last one cannot move either.
**Verified: all six situation pages rebuild, and `situation-air.html` is byte-identical.**

### D-24.5 WHAT IS STILL HAND-TYPED, AND THE ONE REAL FIX FOR IT
The fallback figure in the markup is still typed by hand. It is now only visible if the route
fails, so the exposure is small — but the root cause is that **`home.html` is not generated**.
It is the frozen design source every situation page extracts *from*, so making it a build
artefact is a real architectural change and is not taken here.

Also unchanged, and both correctly stamped `Demo data` so neither is dishonest: the hero deck's
`h-air` (412) and `h-fire` (118). Making `h-air` live would mean changing a **stamp** on the
frozen hero from `Demo data` to `LIVE` — and R4 is explicit that the hero is where the
vocabulary lives. **That is a vocabulary decision on a signed-off component and it is the
client's to make, not a side effect of this one.**

---

# D-25 — THE SITUATION INDEX, REBUILT LEAN

Client instruction, 21 August: *"I want the NOW button page which is situation index page, to be
lean and small. Make a Hero banner that explains what is situation/environmental intelligence,
be creative. And then creatively list all the situation blocks. Remove orders, cadence etc. At
most use a section of campaigns."*

### D-25.1 THREE BANDS. THE PAGE IS 24 PER CENT SHORTER AND CARRIES TWICE THE DOORS.
`top` · `set` · `campaigns`. Measured at 375, both pages, same viewport:

| | old | new |
|---|---|---|
| document height | 8,538px | **6,464px** |
| `<section>` elements | 7 | **3** |
| tables | 2 | **0** |
| situations shown | 9 slides, 0 with a page | **6 cards, all 6 with a page** |
| phone section index | `display:none` | **works** (inherited chrome) |

The two bands the client cut are gone: `#orders` (already ruled out at D-11.1) and `#method`,
the source-and-cadence table. `#windows` and `#colour` are gone too, absorbed — the window
grammar is one line on the Heat card, and the colour legend became the vocabulary strip in the
hero, where it can teach all four words instead of describing three.

**The file is LARGER in bytes — 89 KB to 123 KB — and that is the trade, not a regression.** The
old page carried a 44 KB private stylesheet, 49.5% of its own bytes, including a `.rail`
mechanism that exists nowhere on the frozen homepage. The new one inherits the frozen token and
chrome layer through `situation-shell.mjs` and has no private design language at all.

### D-25.2 THE CONCEPT CAME OUT OF THE DATA: THE SIX ARE NOT COMMENSURABLE
Put the six readings side by side and the striking thing is not any one number. It is that they
share nothing — **six different units, and six different KINDS of limit:**

| situation | kind of limit | the limit |
|---|---|---|
| Air | **a ceiling** | AQI 100 — and it is above it |
| Yamuna | **a floor** | > 5.0 mg/L — and it is below it |
| Heat | **an absolute** | 47 °C, with no reference to normal |
| Forest fire | **none** | no statute publishes a permitted area |
| Forest loss | **a requirement** | approval, naming no quantity |
| Climate event | **a class, crossed** | 64.5 mm, thirteen times in one year |

**No two share a kind.** That is checked at build time rather than asserted — if a seventh
situation ever duplicated one, the page's central claim would weaken and the copy adapts instead
of lying.

So the index does the inverse of a dashboard. VAYU reduces this to one score under a `LIVE` chip
and serves it from seeded fixtures (D-23.13). This page says the thing a single score has to
hide: **anything that averages six units is inventing a number nobody published.** The hero
carries three computed sixes — situations, units, kinds of limit — and then refuses the total
outright. That refusal *is* the creative device, and it is also why the page is short: there is
no aggregate to build and no gauge to fill.

### D-25.3 THE `h1` IS AD-13's CONSTANT, AND THE OLD ONE FAILED THREE FROZEN RULES
**"Every situation we read."** AD-13 Q1's recommendation, adopted unchanged. The old h1 — *"Six
situations, four of them illegal"* — was two stated totals in the largest type on the page (§7.8),
near-identical to a string already on record as rejected, false in March when Heatwave returns,
and internally contradictory: it claimed four illegal over a rendered set of three.

### D-25.4 ALL SIX RENDER. D-11.2 IS AMENDED, AND THE PREMISE IS WHY.
D-11.2 ruled that Heatwave's shut window means it **does not render at all** — no dormant cell,
no `OUT OF SEASON` row, no toggle.

**That ruling was right for the page it was written for and its premise no longer holds.** It was
made when one situation had a page and five did not, so a Heatwave cell would have been a cell
with nothing behind it — scaffolding, which §4.3 forbids. Now every situation has a page, and the
Heatwave page is *specifically built* to be true out of season: its reading is a record, which is
true on every day of the year (D-23.4).

So the card renders, stamped `OUT OF SEASON`, carrying one line — *the season is shut until
1 March 2027; the record is true either way*. **This is the vocabulary working, not a dormant
slot.** The fourth state word had never been exercised by a real situation before; now it is, on
a card with a live door behind it.

### D-25.5 THE AIR CARD SHIPS `PERIODIC` AND EARNS `LIVE`
The first build stamped it `LIVE` outright, which was false — the card renders a **committed**
value, and a chip cannot claim liveness for a number that cannot move. Caught before it shipped.

It now behaves exactly as the Air page and the homepage ticker do: ships `PERIODIC`, fetches
`/api/air`, and **only a well-formed reading may write** — at which point the value, the verdict,
the breach colour and the chip all move together, because by then the number genuinely can change
between two views. Every failure path leaves the card as rendered (D-16.4). Verified in the
browser: the chip reads `LIVE` after the fetch lands.

### D-25.6 THE VOCABULARY IS TAUGHT BY SPECIMEN, WHICH WAS AD-13's HARDEST PROBLEM
AD-13 §4 called it *"the most interesting design problem on the page: teach four words when the
live set only exercises two, without faking a third."*

The hero shows **all four chips with a one-line definition each**, marking which the set uses
today. `DEMO DATA` is present as a labelled specimen with the note that there are none in the set
below. Nothing is faked and nothing is hidden, and after the Air upgrade the page genuinely
exercises three of the four.

### D-25.7 CAMPAIGNS: THREE, AND ONE OF THEM DELIBERATELY HAS NO DESCRIPTION
The client's ceiling was *"at most a section of campaigns"*, so this is the only band after the
set. Three, per SOURCE-FACTS as updated 21 August: **We for Yamuna**, **Monsoon Wooding**,
**Delhi I Can't See You**.

Only sourced detail appears. Monsoon Wooding carries ~5,000 trees a year and over 50,000
*planted and survived* — **"survived" is the organisation's own word and the page keeps it**,
because planting and living are different measurements. **"Delhi I Can't See You" is named with no
description**, because SOURCE-FACTS records that it appears in neither source document. The card
says so. Writing copy for a campaign this site cannot cite would be the same failure as inventing
a limit.

And the band closes on the gap rather than hiding it: **fifty thousand surviving trees is a real
number and it is not a reply to 2.43 million hectares.** Both are on the site, in their own
units, and neither cancels the other — which is D-25.2 applied to Swechha's own record.

### D-25.8 THE INDEX CANNOT DISAGREE WITH A SITUATION PAGE, BY CONSTRUCTION
Every figure is read at build time from the same committed dataset behind the page it points at.
Nothing is typed. That closes a real defect class rather than a hypothetical one: the old page's
h1 claimed four illegal over a set of three, and its `#h-*` anchors pointed at IDs that did not
exist on their target.
