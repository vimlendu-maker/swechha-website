# AD-01b — THE HERO: the LIVE mark, and the tagline

Two questions ruled. 20 August 2026. Measured against the build as it stands after AD-01
(D1–D13 in; D2's veil arithmetic and the ≤560 sentence cut approved but not yet built).

**Method.** Chrome DevTools Protocol with real device metrics at 1440×900, 1024×800,
768×1024, 414×736, 375×635 and 320×568, plus captures through the same session
(`adb-hero-375.png`, `adb-hero-1440.png`, `adb-plate-1440.png` in `docs/design/img/sections/`).
Every width below is a live measurement, including the candidate copy strings, which were
rendered into the page in the hero's own classes and measured rather than estimated.

**Where the band stands.** 375×635: header 105.8px (56px bar + 49.8px chip row), hero
768.3px, ticker seam at **874.1px** — 239.1px over one visible screen. 1440×900: band 825px,
seam 888px.

---

### Note on Q-A, closed by the client — recorded once, for a later pass

The client's ruling is right and the research supports it, so this is a note and not an
argument. Reading `intelligence.html` situation by situation: of the nine situations, only
**two can answer an arbitrary location today** (Air, via OpenAQ; Fire, via NASA FIRMS) and
**four ever could** (adding Monsoon and Forest loss, both needing new work). **Three can never
be answered anywhere but Delhi by definition** — the Yamuna reading is a named river reach at
Nizamuddin, the treatment figure is a Delhi regulator's plant estate, and the clean-up tonnage
is Swechha's own field log. One more (Heat) needs an observatory and one (Noise) is not wired.
Whoever builds "my location" on the situation pages should size it to two situations, not
nine, and `lib/content/schemas.ts` has no geography of any kind today — `campaign.location` is
free text — so it needs a real geo field queued behind the two backend fields already ruled
mandatory.

One finding from that work belongs to Q-B and is carried below: **the build already ships
three `Live` chips, and the project record only supports two.**

---

## Q-B. LIVE — top right of the banner, blinking

Position and motion are the client's decision and I am ruling on execution only.

### 1. The position, measured

The stamp's home is the top-right of the banner, right edge on the page spine, on the mast's
first text row. Free width in that corner, measured as spine-right minus the h1's ink-right:

| viewport | spine right | h1 ink ends | corner free | longest state string ("Out of season", 118.4px) |
|---|---|---|---|---|
| 1440 | 1294 | 676.6 | **617.4px** | fits |
| 1024 | 989.2 | 439.1 | **550.1px** | fits |
| 768 | 741.9 | 329.4 | **412.5px** | fits |
| 414 | 394 | 272.7 | **121.3px** | fits, by 2.9px |
| 375 | 355 | 272.7 | **82.3px** | **overruns by 36.1px** |
| 320 | 300 | 272.7 | **27.3px** | **even "Live" (43.8px) overruns by 16.5px** |

The corner closes because the h1's ink is a constant 252.7px below 480px (its clamp floor is
32px) while the spine narrows with the viewport. So the corner is a real place down to 414
and stops existing at 375.

**Ruled position.** At **≥561px** the stamp sits at the top-right of the slide with
`right: var(--gut)` and the same top padding token the mast already uses
(`clamp(18px,2.2vw,28px)`) — one shared token, no magic number, so it lands exactly on the
spine and exactly on the h1's first row at every width. At 1440 that is x 1250.2–1294,
y 91–109.4, sitting on sky 617px clear of the h1 and 324px above the numeral.

At **≤560px** it drops to its own right-aligned row immediately under the h1, still inside the
slide. At 375 that row is 335px wide against a 118.4px longest string, and at 320 it is 280px
— so every state fits at every width. The mast's scrim extends one row to cover it.

**It costs zero band height at every width**, because `.s-hero-mast` is
`position:absolute` (home.html:723) and the slide's own frame is already full-height. The
stamp consumes photograph, not layout — and specifically the part of the photograph the lid is
already blacking out.

### 2. The per-slide problem — and the structural guarantee

This is the real risk in the client's request and it has a clean answer.

The state is a property of the **situation**, not of the page: today's deck alone carries two
different values (Air `live`, Yamuna `delayed`/"Periodic"), and after the Q3 ruling the deck's
membership is computed from validity window × severity, so any of the nine can lead — including
Noise, which is `demo`/"Demo data", and Heat, which is `closed`/"Out of season". A fixed corner
that says LIVE while the reader is looking at an editor-entered figure is the worst failure
available to this page.

**Ruled: the corner element is not a new element. It is the slide's existing `.state` chip,
moved.** Each `.s-hero-sit` renders exactly one, positioned absolutely to its own frame's
top-right. It therefore cannot go out of sync, because there is nothing to sync — the mark
travels with the reading it describes, authored beside it, and the track moves both together.
`.s-hero-mast` is page-level and is the one place this must not go.

**Ruled: it carries the full vocabulary, always — LIVE / PERIODIC / DEMO DATA / OUT OF SEASON —
and never hides.** Two reasons, and the second is the load-bearing one:

- An element that appears only when LIVE teaches the reader to ignore the corner, and its
  absence is unreadable: "not live" and "the badge failed to render" look identical.
- "Show only when live" requires a **conditional**, and a conditional is the mechanism by
  which the wrong state gets displayed. "Always show this slide's own state" requires none.
  The failure mode the coordinator asked to make structurally impossible is eliminated by
  removing the branch, not by testing it.

The four values are already visually distinct in the existing CSS (home.html:284–287) and need
no new marks: filled square (live), hollow square (periodic), 45° hatch (demo), dashed square
(closed).

### 3. The blink

Granted by the client; specified here.

- **What animates:** the 9×9px `<i>` only. Never the word, never the box, nothing else on the
  page.
- **When:** only under `.state.live`. The keyframe is bound to the `.live` class, which is
  authored per situation — so the animation is switched by the same datum the word is.
- **Rate and duty:** 2.4s period — 0.42 Hz, 25 dips a minute. Opacity holds at 1 for the first
  70% of the cycle, dips to 0.22 at 85%, returns to 1. It is solid for ~1.7s and dips for
  ~0.7s, which reads as a pilot light at rest rather than a flashing alarm. It is **seven times
  slower than the 3-flashes-per-second threshold** in WCAG 2.3.1, so it is not a seizure risk
  and does not read as an error.
- **Colour:** `--fg` off-white. Not mustard — that is the interface layer and would make it a
  control. Not red — that means a published legal limit broken. Not green. The dot therefore
  cannot be confused with either signal hue or with anything clickable.
- **`prefers-reduced-motion: reduce`:** `animation:none`, dot renders solid at opacity 1 —
  which is its "on" appearance, so it looks correct rather than broken. **No information is
  lost**, because the word and the fill pattern already carry the state completely.
- **Why it is a status signal and not an ornament, in one line:** it is bound to a per-situation
  state value and runs on exactly the readings whose cadence is continuous, never on the others
  — an ornament would run regardless of what the page knew.

**One precondition, and it is not optional.** The page's only absolute date is in the ticker
directly beneath the hero and reads **"WEDNESDAY, 19 AUGUST 2026, 07:00 IST"** — yesterday
(today is Thursday 20 August). `home.html` contains no `new Date`, no `toLocale`, no
`setInterval` and no `fetch(`; every time string is typed. A dot that blinks LIVE above a page
dated yesterday makes an over-claim louder, which is the one outcome worse than a mark nobody
notices. So the blink ships **with** a computed relative age on the source line — "CPCB
continuous monitor. Read 07:00 IST · 41 min ago" — using local `Date` getters, never
`toISOString()`. Measured: 303.2px in the 334px measure the source is about to regain, so it
costs no extra line. The ticker's date must be computed too; that is band 2's fix and is
flagged to AD-02.

**And demote the one Live claim the record does not support.** The build ships three `Live`
chips — Air, Monsoon, Fire. `DECISIONS-2026-08-18.md:51–53` rejected IMD scraping as "brittle
+ legally grey" and states CPCB has no stable public API;
`2026-08-19-synthesis-direction.md:455–457` puts live at "two of six at launch: OpenAQ for AQI,
NASA FIRMS for fire". Monsoon is IMD. It goes to **Periodic** until IMD is genuinely wired.
Blinking a false LIVE is the specific harm this whole band exists to avoid.

### 4. The "button" problem

The client read the current chip as clickable, and the cause is visible in
`adb-plate-1440.png`: the provenance row holds the chip, the source line, a **solid-bordered**
validity tag and a mustard link, three of them the same colour and two the same type voice.
Nothing ranks, and the eye reads the row as a control strip.

In the corner that risk mostly evaporates — the stamp is alone in 617px of sky — but it is
eliminated explicitly: **no border, no background, no padding box, no hover state,
`pointer-events:none`, and never inside an `<a>`.** The only bordered element left in the band
is the validity tag; the only mustard is "The full instrument". The stamp also takes
`aria-hidden="true"`, because each slide's `.sr` span already narrates its state ("… Severe.
Live.") and would otherwise announce it twice.

### 5. Move, not addition

Confirmed: the in-slide `.state` row does **not** still earn its space, and this is a move.

With the chip out of the provenance row, `.s-hero-src` recovers its full measure: **278.2px →
334px**. The already-approved cut string inks at **299px**, which is exactly why it still
wrapped to two lines — it never fit the 278.2px the chip left it. At 334px it lands on one
line, `.s-hero-src` goes 39.1px → 19.6px, and D11 finally delivers what it was asked for.

### RULING

**RULING — Move the slide's own `.state` chip into the top-right of its own banner frame,
carrying the full four-value vocabulary at all times and never a conditional; blink the 9×9
dot alone, off-white, 2.4s with a 70% solid hold, only in the LIVE state, solid under reduced
motion; ship it together with a computed relative age on the source line and with Monsoon
demoted to Periodic, because a blinking LIVE above a page dated yesterday is worse than no mark
at all.**

**Cost — pixels.** 1440: **0px** — the stamp sits in 617.4px of empty banner corner, and the
provenance row loses an item without changing height. 375: **−19.5px** — the stamp costs no band
height, and the source line drops from two lines to one (plate 106.8 → ~87.3px).

**Cost — build.** Move one element per slide out of `.s-hero-plate` into an absolutely
positioned `.s-hero-stamp` inside `.s-hero-sit`, using the mast's existing top-padding token
and `var(--gut)`; one `@media (max-width:560px)` rule dropping it to its own row; one
`@keyframes` plus a `prefers-reduced-motion` guard; one `datetime` attribute per situation and
~10 lines of relative-time JS on local `Date` getters; one state-value change on the Monsoon
slide. No new component, no dependency, no layout reflow.

**Needs client approval.**
- The relative-age string — **"· 41 min ago"** is new copy, and at ≤560 the line reads "CPCB
  continuous monitor. 07:00 IST · 41 min ago" (303.2px in 334px), which additionally **cuts**
  the approved words "Read" and "today".
- **Monsoon demoted from Live to Periodic**, since it changes a published claim.
- The ticker's date becoming computed rather than typed.
- Confirmation that the corner mark shows PERIODIC / DEMO DATA / OUT OF SEASON as readily as
  LIVE. This is the point on which I would most want the client's explicit yes, because the
  request was for a LIVE badge and what is being built is a **state** badge that is sometimes
  live. That is the only version that cannot lie.

---

## Q-C. A tagline under "We keep the record"

### The client's Q-A ruling settles most of this

The hero is now, in the client's own words, "about the location or issue the campaign
chooses" — a single editorial selection. A tagline announcing an **environmental intelligence
dashboard** would therefore promise, in the first line of the page, the exact thing the hero
has just been told not to be: a queryable instrument. That kills the literal version of the
client's request outright, and it is not a close call.

Two further reasons stand from AD-01:

- **The job is already assigned, one screen down.** The statement band (`perSection[2]`) exists
  "to say the sentence that justifies the organisation existing at all". A tagline here gives
  the page two mission statements ~900px apart and the weaker one first.
- **There is no typographic level available.** The h1 is deliberately suppressed to 67.2px so
  the reading is the display — protected in AD-01 §4. A line between that and a 272px numeral
  either competes with the identity line or becomes a fifth caption in a band that already
  carries four.

### But the gap the client identified is real

A first-time reader meets a 272px "412" and four nouns, and nothing says what kind of
instrument this is. Refusing without answering that would be evasion. And there is exactly one
place in this band where a line of type is free: `.s-hero-mast` is `position:absolute`, so
anything inside it costs **zero band height** at every width. Measured slack below the h1
inside the mast: **26px at 1440, 16px at 375**, against a 17.25px line.

So the answer is: not a tagline announcing a genre — **a line stating the method**, which is
what actually explains the instrument.

### The line

NEW COPY — proposed, requires client approval. Widths rendered live in the hero's own `.lbl`
(11.5px Archivo caps) against the 335px measure at 375:

| # | Proposed line | width | verdict |
|---|---|---|---|
| **1** | **Every reading against its published limit** | **315.4px** | **recommended** — fits at 375 on one line |
| 2 | Environmental intelligence, Delhi and India | 335.2px | **reject** — the genre label the Q-A ruling forbids, and it overruns the 375 measure by 0.2px |
| 3 | Live readings against the legal limit | 282.5px | reject — "live" is the exact claim Q-B has just narrowed |
| 4 | Nine situations, read against the law | 285.5px | reject — the hero shows four, the ticker seven, the index nine; the number invites a count the band fails |

Line 1 is a method statement, not a slogan: it names the standard every figure on the page is
measured against, which is the thing nobody else does and the reason this is a record rather
than a dashboard. Set as `.lbl` micro-caps in `--fg-2`, left edge on the spine, `--gap-head`
under the h1 — the same voice and colour as "DELHI. SINCE 2000." in the ticker, so the two
masthead statements read as one gesture.

### Where it does not go: below 561px

At ≤560 the stamp takes the one available mast row (Q-B). The two cannot share it: at 375 the
row is 335px and the tagline alone is 315.4px, leaving 19.6px against a stamp that needs
43.8–118.4px. **Ruled: the tagline renders at ≥561 only.** The reading's own provenance
outranks the site's self-description on a 375 screen, and the page's designated
self-description is one screen below either way.

This is a compromise and I will name it as one: the first-time reader who most needs
orientation is the phone reader, and they will not get this line. If the client wants it at
375 it must fit 204.6px beside the longest state string, and the only candidate that clears
with any margin is "Read against the limit" (169.3px) — which I would reject as weaker than
silence. "Measured against the limit" is 206.7px and misses by 2.1px.

### RULING

**RULING — No tagline in the sense asked for, and nothing naming the genre, because the hero
has just been ruled a single editorial choice rather than a dashboard; instead one proposed
`.lbl` line inside the absolutely positioned mast — "Every reading against its published
limit" — at ≥561px only, stating the method rather than the category, at zero band cost.**

**Cost — pixels.** 1440: **0px** — it fits the 26px of existing mast slack. 375: **0px** — it
does not render. No effect on the band's overage at any width.

**Cost — build.** One `<p class="lbl">` inside `.s-hero-mast .wrap`, hidden below 561; plus the
amended-D2 scrim change already scheduled (bind the lid's height to the text rows it protects
rather than to `vw` — the current lid darkens 763px of frame at 1440 and 122px at 375 that
carry no type at all).

**Needs client approval.** The line itself, as new copy. And an explicit acceptance that it is
desktop-and-tablet only.

---

## Summary

| | Ruling | Band cost at 375 | Needs client sign-off |
|---|---|---|---|
| **Q-B** | The slide's own state chip moves to its own banner corner, full vocabulary always, dot blinks only when live, solid under reduced motion — shipped with a computed age and Monsoon demoted | **−19.5px** | "· 41 min ago" (new) + cutting "Read"/"today" at ≤560; Monsoon → Periodic; computed ticker date; **that the badge shows all four states, not only LIVE** |
| **Q-C** | One proposed method line in the mast, ≥561 only; no genre label | **0px** | the line itself; that it is desktop/tablet only |

Net on a band 239.1px over one screen at 375×635: **−19.5px**, to 854.6px. With the ≤560
sentence cut already approved but unbuilt (~96px), it lands near **758.6px — still ~123.6px
over**. That remainder is not solvable inside these two questions and is the next thing to
take up.

**One item carried out of Q-A because it changes a published claim, and should not wait:** the
build ships three `Live` state chips where the project record supports two. Whatever happens to
the corner badge, Monsoon should not be labelled Live while IMD is unwired.
