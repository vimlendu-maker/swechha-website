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
