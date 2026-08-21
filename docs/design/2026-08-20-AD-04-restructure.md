# AD-04 — The restructure: WORK is the umbrella

Page-level restructure, built and measured, per the client's order of 20 August.
Builds directly on `2026-08-20-AD-03-what-we-do.md` (its Options B and D are this
design's ancestors) and on every ruling in `DECISIONS-2026-08-20-homepage.md`.

**Built at** `public/design/v3/_ad4/home.html` — a complete homepage, not a band
swap. `public/design/v3/home.html` is untouched. **Switcher:**
`/design/v3/_ad4/_compare.html` flips current vs. restructure at 1440 and 375
with the measured table beside it. Both are working files under `public/design/`
and are deleted before any deploy, like `_ad3/`.

**Method:** CDP `Emulation.setDeviceMetricsOverride` at 375×635, 375×812,
414×736, 768×1024, 1024×800, 1440×720, 1440×900, 1920×1080 — never
`--window-size`. Captures are `docs/design/img/sections/ad4-*.png`; every claim
below was read off a PNG or measured over the wire, not off source.

**Freeze compliance, verified mechanically:** bands 01 (hero) and 02 (ticker)
are **byte-identical** to `home.html`'s — markup (16,807 bytes), the header, and
the hero+ticker CSS blocks all compare equal. Nothing on AD-02c's §9 list was
touched.

---

## 1. The running order, and its grounds

The client's order — *Situation hero → Work → About → Impact → the rest* — is
delivered **without moving a single band position**. Bands 3–4–5 stop being
three unrelated things (a statement, a promoted Journeys, a miscounted index)
and become **one WORK chapter on the same three grounds**; band 6 was already
the About section in everything but name; band 7 was already Impact. The
restructure happens inside the sequence, not to it.

| # | band | is now | ground |
|---|------|--------|--------|
| 01 | hero | *(frozen)* | `#0D0D0B` |
| 02 | ticker | *(frozen)* | `#151512` |
| 03 | **WORK — the frame** | the umbrella, titled inside a halftone frame (was: statement) | `#0D0D0B` |
| 04 | **WORK · Journeys** | the four routes, opened by the statement pair (was: Journeys, promoted) | `#F3F2F0` |
| 05 | **WORK · What is running** | projects / campaigns / events at three weights (was: the miscounted index) | `#0D0D0B` |
| 06 | **ABOUT — the timeline** | gains the "About Swechha" label; otherwise untouched. THE PAUSE | `#ECEBE8` |
| 07 | Impact / receipts | untouched | `#151512` |
| 08 | farm | untouched | `#0D0D0B` |
| 09 | green the map | untouched | `#151512` |
| 10 | record | untouched | `#F3F2F0` |
| 11 | give | untouched | `#E1A32B` |
| 12 | footer | untouched | `#151512` |

**The recost of `groundRhythm`, explicitly:** the twelve-hex sequence is
**unchanged, hex for hex** — `#0D0D0B · #151512 · #0D0D0B · #F3F2F0 · #0D0D0B ·
#ECEBE8 · #151512 · #0D0D0B · #151512 · #F3F2F0 · #E1A32B · #151512`. Verified
mechanically over CDP at 375 and 1440: **no two adjacent bands share a computed
ground at either width.** The designed alternation, the red/green five-band
distance, the 7-8-9 dark run and THE PAUSE all survive with zero re-derivation,
because the reorder the client asked for turned out to be a re-titling and
re-scoping of positions 3–5, not a shuffle. That is the cheapest honest answer
to "you are reordering it — recost it": the cost is nil, and it was checked,
not assumed.

Two rhythm facts worth recording. The halftone count stays **exactly three**
(hero, Work frame, farm — each still "a photograph edge to edge, one display
headline, nothing else in the frame"). Placement moves less than expected:
measured at 1440×900 the three sit at 0% / 10.4% / 61.4% of the document —
against 0% / 10.0% / 62.9% on the current page. The spec's "roughly 0/25/70"
was already not what the built page did; AD-04 inherits the built rhythm almost
unchanged. And paper now arrives at **1,404px** at 1440 (hero 825 + ticker 111 +
frame 468), earlier than the current 1,638px — the instrument still runs three
dark bands and then exhales.

**The spine holds.** Measured left edges at 1440: hero h1, frame headline,
journeys eyebrow, the statement line, running eyebrow, running headline,
timeline since-line — **all at x = 146.0**, to two decimals.

---

## 2. What WORK became, and why

Three sections, one chapter, four kinds at four deliberately unequal weights —
the client's own weighting made visual rather than four equal columns (the
failure AD-03's Option A carried):

**03 — The frame** (`#work`). The statement band's exact mechanism — `duo`
plate + `duo-dim` diagonal ramp + seat gradient, one display line, nothing else
in the frame — at Option D's height (468px at 1440×900, 357px at 375), carrying
the umbrella headline **"The numbers are not the work"** (a proposal — §4) over
the hand-lettered CLEAN AIR IS OUR RIGHT placard crowd. The picture changed for
three reasons: the placard crowd is *work being done*, which is what the
sentence now says; the art direction had already named this image the one that
"carries the section" for Work, and a frame at 10× the old anchor's size is
that idea kept, not spent; and the file is **2400×1600** against the foam-line
frame's 1280×591, which retires AD-03 D2 (the 3.37× upscale) outright. D1's fix
is applied as prescribed: `--crop:0`, plate exactly its frame,
`object-position` set per breakpoint (50% 8% desktop, 46% 30% phone) — the
framing is an editorial decision taken twice, not a property of the window.
Contrast was **measured, not eyeballed**, by AD-03's method (headline hidden,
ground sampled under its line boxes): worst single pixel **4.12:1** at
1440×900, 4.13 at 1440×720, 6.9 at 768, 6.1–9.5 on the phones — against the
3:1 display floor, after the ramp's diagonal was held ~8% longer for this
frame's pale sign board (it measured 3.23:1 before the tune; the mechanism's
own dial, same mask, new stops).

**04 — Work · Journeys** (`#journeys`). The four photographs and the rack
survive whole — the client's "Journeys needs to occur," honoured with the only
photographic sub-treatment in the chapter. What changes is rank: the eyebrow
reads **Work · Journeys** (Option C's move, the IA's own words), and the band
opens on the statement pair the copy was always written as — **"A number
is not a smell"** at the same serif d2 scale the timeline's own statement uses,
answered by its approved response *"So we take them to the water…"*, which
already lived in this band. The four-line display headline *"You cannot argue
someone into caring about a river"* comes off the homepage (§6) — which also
closes AD-03 D4, the hinge being out-inked by the band below it. On the phone
the cards go narrower and landscape (the re-crop licence the doctrine already
exercises), taking the band from 1,158.7px — the page's worst cap breach — to
**896.4px, inside the 900 cap for the first time**.

**05 — Work · What is running** (`#running`). The ledger splits by kind, and
the kinds get the client's weights: **Projects** are five numbered rows *with
photographs* on the wide column (cols 1–7); **Campaigns** are three thin rows
on the narrow column (cols 9–12), no photograph, each carrying its situation
hook — *Runs against Air →*, *Runs against Yamuna →*, and Monsoon Wooding an
em-dash, the site's hole grammar, with a one-line note naming what the dash
means; **Events** are a single line on the band's foot — *Plantation Drive ·
Yamunotsav · Cyclothon · DIY Workshops* — sharing its row with the approved
CTA "The whole list →". Present, and small: "not such a big 'work'", rendered
as exactly that. The lead is the approved sentence **cut, not rewritten** —
*"In the order they take up our week."* — which takes the false count ("five
projects and five campaigns" over a ledger of 5+3) out with the cut. At ≤560
the hook drops its "Runs against" prefix and the project rows drop their
thumbnails (AD-03 D's own measured ruling for the paper ledger); the band lands
at **893.7px**, also inside the cap.

**06 — About.** My reading, stated plainly: **the timeline is the About
section.** It already opens on the exact line the client named — *"Swechha
means, roughly, of one's own free will."* — which is existing approved copy
(shipped at `home.html:2530` and standing on `about.html` as its hero), not new
copy. The only change is the since-line gaining the label **"About Swechha /"**
in about.html's own label grammar. Everything that makes it THE PAUSE — no
signal hue, no full-bleed, no display headline, nothing to click — is
untouched, and Impact follows it exactly as the client ordered, because it
already did.

---

## 3. The claim the weighting rests on — verified

*"Half of the campaigns at least overlap with issues in the situations list."*
Checked against the page's own ledger (3 campaigns) and the frozen six (D-00:
Air, Yamuna, Heatwave, Forest Fires, Forest Loss, Climate Event):

| campaign | situation | overlap |
|---|---|---|
| Delhi I Can't See You | **Air** | yes — hooked to `situation-air.html` |
| Yamuna, Palla to Okhla | **Yamuna** | yes — hooked to `situation-yamuna.html` |
| Monsoon Wooding | — | **no clean match.** Forest Loss is adjacent (a plantation campaign answers a loss reading) but that is my inference, not the client's claim — so the build shows the dash, not a forced hook |

**2 of 3 = 67%, so "at least half" holds.** And the feared hole does not open:
a campaign without a situation hook is not routeless — its own row is a link to
its campaign page under `/work/campaigns`, exactly like every project row. The
situation hook is a bonus route, not the only route. The dash is rendered
honestly and explained in one line. Two caveats: AD-03's Q2 (five campaigns or
three?) is still open, and if two more campaigns exist the arithmetic changes;
and if the client rules Monsoon Wooding *is* a Forest Loss response, the dash
becomes a third hook with a one-line edit.

---

## 4. Copy — proposals awaiting approval, moves, and cuts

**The umbrella headline — NEW COPY, needs approval.** The client opened this
explicitly ("worded differently, in a more catchy way, the way the smell copy
was written"). Three candidates in that register — a sentence, not a label:

1. **"The numbers are not the work"** — *the one I built and would take.* It is
   the smell line's sibling in grammar (X is not Y), it pivots the page at
   exactly the right joint — you have just read the hero and the ticker; the
   numbers are the diagnosis, here is everything else — and the word *work*
   lands inside the sentence, so the umbrella titles itself without a label.
2. **"What we do about what we measure"** — plainer, method-voiced, safe; it
   says the relation between the instrument and the organisation in seven words.
3. **"Everything the readings set in motion"** — warmer, and it makes the
   readings the *cause* of the work, which is the page's actual argument; a
   noun phrase rather than a verdict, so it is the quietest of the three.

**Other new strings, all label-grade, all needing the same nod:** the eyebrows
"Work · Journeys" and "Work · Projects · Campaigns · Events"; the group heads
"Projects / 5", "Campaigns / 3", "Events"; the hooks "Runs against Air/Yamuna"
(shortened to "Air →" / "Yamuna →" at ≤560); the note "The dash is a campaign
with no situation behind it."; the timeline label "About Swechha /". The four
event names are the client's own samples, rendered as plain text — deliberately
not links, since nothing exists behind them.

**Moved, never rewritten:** "A number is not a smell" (band 3 display → band 4
serif d2, same break, no punctuation added); "So we take them to the water…"
(journeys tail → journeys opener, verbatim); "Four routes, run with schools…"
(stays as the tail); "What is running" and "The whole list" (stay).

**Cut:** "Five projects and five campaigns," (the false half of the approved
lead — the fix-in-passing the brief ordered, done as a cut); "You cannot argue
someone into caring about a river" — off the homepage only. It stands verbatim
on `about.html` and should title `/work/journeys`; it is the page's
second-best line and it is not destroyed, it is re-seated where Journeys is
the whole subject.

---

## 5. Measured results

All CDP, all against the built file. Whole document, `scrollWidth` = viewport
at **every** width including 375 and 768 (no horizontal overflow anywhere):

| viewport | current doc | **AD-04 doc** | Δ |
|---|---|---|---|
| 375×635 | 9,281 | **8,962** | −319 |
| 375×812 | 9,459 | **9,074** | −385 |
| 414×736 | 9,269 | **8,896** | −373 |
| 768×1024 | 9,495 | **9,389** | −106 |
| 1024×800 | 7,948 | **7,656** | −292 |
| 1440×720 | 9,004 | **8,742** | −262 |
| 1440×900 | 9,362 | **9,007** | −355 |
| 1920×1080 | 9,696 | **9,391** | −305 |

The Work chapter (top of band 3 → top of the timeline): **2,148px at 375**
against today's 2,533 (−385), **2,502 at 1440** against 2,858 (−356) — while
*adding* Events, the campaigns' situation hooks and the umbrella statement.

Per band at 375×812, against the 900 cap (licensed exceptions: heroes,
timeline):

| band | current | **AD-04** | cap |
|---|---|---|---|
| 03 work frame | 503.4 (statement) | **357.3** | hero-licensed, and under it anyway |
| 04 journeys | 1,158.7 **breach** | **896.4** | **inside, first time** |
| 05 running | 870.3 | **893.7** | inside, carrying two more kinds |
| 06 timeline | 1,551.3 | 1,551.3 | licensed |
| 10 record | 1,373.9 **breach** | 1,373.9 | pre-existing, untouched — next pass |

At 1440×900 the touched bands: frame 468.0, journeys 1,074.5 (was 1,130.9),
running 959.7 (was 1,024.5). Ground adjacency: clean at both widths, measured.
Contrast under the frame headline: §2. Spine: §1. Bands 01–02: byte-identical.

**The ≈8,200 target is not met, and here is the honest ledger.** 9,074 at
375×812 is 874 over. AD-03's Option D reached 8,183 by deleting the journey
photographs and compressing all of Work into one index — this build spends
~890px keeping the substance the client has now explicitly ordered ("Project
and Journey needs to occur", plus Events with named samples). The remaining
distance does not live in bands 3–5 any more; it lives in **record (1,373.9 —
a 474px unlicensed breach that predates this pass)**, **give (861.1, near-cap,
unreviewed)**, **footer (514.9 against its own ≤420 doctrine target)** and the
hero's own open 878px item in the handoff. Those are bands the section-by-
section process has not reached; taking ~874 out of them is plausible without
touching what shipped today.

Captures: `ad4-top-{w}x{h}.png` (all eight viewports), `ad4-band-{work,
journeys,running,timeline,impact}-{1440,375}.png` (+ `-2` continuations),
`ad4-cur-top-375x812.png` (the current page, same method, for comparison) — in
`docs/design/img/sections/`.

---

## 6. Deliberately spent, and what I would revisit

1. **The second full-viewport moment.** The statement was 78vh by design
   ("deliberately shorter than the hero so the two are not twins"); the frame
   is 52vh. The page now has one full-viewport moment. This is Option D's
   named cost, taken knowingly — the client's running order leaves no room for
   a band that delivers an aphorism and moves on.
2. **The foam-line photograph** (`yamuna-students-foam-line.jpg`) is off the
   homepage. It carried two open defects (3.37× upscale, window-governed crop)
   and its master is 1280px; it should re-enter on `/work/journeys` or the
   Yamuna situation page at a contained size its resolution can honestly hold.
3. **"You cannot argue someone into caring about a river"** at display scale.
   Would revisit first if the client mourns it: it can return as the
   `/work/journeys` page title at zero homepage cost.
4. **The anchor-image grammar** in the old work band ("one image carries the
   section"). The frame inherits the job at larger scale; the running band is
   now a pure index. I think the trade reads better; it is still a trade.
5. **Journeys' phone cards**: portrait → landscape, 320 → 239px wide. That is
   what bought the cap. If the client wants the portrait contact-print feel
   back on the phone, it costs ~230px against the 900 cap and needs a ruling.
6. **Project thumbnails at ≤560** (five 44px pictures) — cut on AD-03 D's own
   measured precedent. Cheap to restore, costs ~50px.

---

## 7. Flags outward (not mine to fix)

- **Backend:** `lib/content/types.ts` declares `project, story, knowledge,
  film, campaign` — **neither `journey` nor `event` exists.** The homepage now
  renders both kinds; the CMS cannot yet hold either. Joins the accumulated
  backend list in AD-02c §10.
- **Record at 1,373.9** breaches the mobile cap today, unlicensed, and is now
  the largest unexplained object on the page. Next section pass.
- The nav still lists JOURNEYS beside WORK — the very contradiction that
  produced this brief. Under P-1 it is corrected in the sign-off pass that
  wires the menus; noted so it is not forgotten. (In AD-04, `#work` lands on
  the frame and `#journeys` on its chapter, so the existing links stay honest.)

---

## 8. Questions only the client can answer

**Q1. Which umbrella line?** "The numbers are not the work" is built;
"What we do about what we measure" and "Everything the readings set in motion"
are the alternates. A different answer is a one-string change; everything else
stands.

**Q2 (inherited from AD-03, still open). Five campaigns or three?** The page
shows three. If two more exist, the campaigns column gains two rows (~96px at
375, inside cap headroom is ~6px — it would need the note line moved), and the
overlap arithmetic in §3 must be re-run with their names.

**Q3. Monsoon Wooding — may it hook to Forest Loss?** The build shows the
honest dash. If the client says the campaign is a response to that situation,
the dash becomes "Runs against Forest loss →" and 3 of 3 overlap.

**Q4. Are the four events real, listable things** (each eventually a page and
a date), or a category being kept warm? Plain text today. If real, they become
links at sign-off and `event` becomes a content type; if not, the line should
say fewer than four names rather than promise ones that never resolve.

Everything else — the About reading, the journeys re-seating, the weighting
treatments, the ground sequence — is decided and built, and flips at
`/design/v3/_ad4/_compare.html`.

---
---

# AD-04b — Count-independence and placeholders

Same day, after client acceptance of AD-04 and two new rulings. **"The numbers
are not the work" is approved copy** and now sits under the never-rewrite rule.
Reworked in `public/design/v3/_ad4/` only — `home.html` was under concurrent
repair and was not touched or re-baselined; "current" comparisons below use the
morning revision's numbers already in this report.

## R1 — the design must not depend on counts

The client: *"Projects, campaigns and Events cant have fixed numbers all the
time… Homepage realestate and design cant depend on TOTAL."* The ticker solved
this once (D-00.1: membership flexes, structure holds); the same thinking now
governs the running order.

**What is structurally fixed:** the frame; the opener; the three treatments —
projects are rows *with photographs* on the wide column, campaigns are thin
rows with a situation hook on the narrow column, events are one line on the
band's foot; the chapter act anchored at the events row's right. Weight is
carried entirely by treatment. **What flexes:** how many items paint.

**The mechanism.** No numeral appears anywhere in the band — the group heads
lost their counts, and the em-dash-for-zero device is gone. The CMS contract is
one line: *emit every running item plus one trailing more-row per kind.* CSS
alone does the rest, per breakpoint:

| zone | cap ≥768 | cap ≤767 | boundary |
|---|---|---|---|
| Projects | 6 rows | 4 rows | "More this week →" row |
| Campaigns | 4 rows | 3 rows | "More campaigns →" row |
| Event names | 4 names | 3 names | "and more →" inline |

Items beyond the cap do not paint (`nth-child` guards); the boundary row
paints **exactly when something is hidden**, because its own child position
reveals it (`li.s-run-more:nth-child(n+K+2)`), in the ledger's own row grammar
— a visible cap, never a silent one. The boundary deliberately carries **no
numeral**: a typed total is what the ruling forbids, and a *computed* total
would still be wrong at whichever breakpoint hides more rows. Pure CSS, no
script, no server arithmetic, correct at every width. Row ordinals (01, 02…)
are kept: they number the order the approved lead names, not the total.

**Zero case, decided:** an empty kind renders nothing — head, list and
boundary all absent — which is D-00.1's own grammar (a shut window paints no
dormant cell). The umbrella eyebrow still names all four kinds because it
states the taxonomy, not the inventory.

**Proven, not asserted.** Three synthetic-membership variants were generated
from the reworked file (`_ad4/n-max.html`, `n-low.html`, `n-zero.html` — all
placeholder content, never to ship, chip-labelled SYNTHETIC) and measured over
CDP; captures `ad4-n-{max,low,zero}-{1440,375}.png` were read:

| membership | #running @1440×900 | #running @375×812 | visible (p/c/e + boundaries) @375 |
|---|---|---|---|
| **base** — 5p / 3c / 4e (today) | 959.7 | **846.9** | 4+more / 3 / 3+more |
| **n-max** — 15p / 7c / 12e | 1,077.8 | **887.9** | 4+more / 3+more / 3+more |
| **n-low** — 5p / 3c / 2e | 959.7 | 815.3 | 4+more / 3 / 2 |
| **n-zero** — campaigns 0 | 959.7 | 664.9 | 4+more / — / 3+more |

**The band's worst possible height at 375 is 887.9px — a design constant
inside the 900 cap, for any n whatsoever.** At 1440 the ceiling is 1,077.8
(six rows + three boundaries). Desktop at today's membership shows no
boundaries because nothing is hidden; the phone shows "More this week" because
its smaller cap genuinely hides the fifth project. `scrollWidth` = viewport
throughout. Base document at 375×812 is now **9,027** (was 9,074 at AD-04
acceptance — the campaigns note deleted under R2 and the phone event cap
returned 47px); the whole-doc numbers in §5 above are superseded by: 8,916 /
9,027 / 8,849 / 9,390 / 7,656 / 8,742 / 9,007 / 9,391 across the eight
viewports, same order.

**One cascade bug found by the proof and fixed:** `.s-run-camp>li{display:flex}`
(0,1,1) out-specified the boundary's `display:none` (0,1,0), so the campaigns
boundary painted even when nothing was hidden. The hide rules now carry the
full selector. This is exactly why the ruling said prove rather than assert.

**Does R1 reach the ticker's "Five in window · one record"?** No. That field
is computed, its zone already flexes (variable situations left, fixed Impact
slot right, scroll below 1018px), and the wording holds at any n ("One in
window · one record" at the February minimum). AD-02c §11.2's unrendered-low-n
grid question stands, unchanged.

**Journeys, noted plainly:** the ruling names projects, campaigns and events —
not journeys, which are four named routes. The phone rail is count-safe by
construction (it scrolls). The desktop rack wraps at >4, adding ~420px per row
of four; if a fifth route ever exists, that band needs its own cap ruling.
Flagged, not solved.

## R2 — placeholders while the design is finalised

*"Where you dont find the content, put the placeholder image and content."*
Read as scope, not as a reversal of the through-line: holes still govern what
*ships*; a design review is not conducted through a broken content set.

**The placeholder ledger — none of these is a decision:**

| placeholder | where | needs before launch |
|---|---|---|
| "Runs against Forest loss →" on Monsoon Wooding (links `situation-soon.html`) | campaigns column | a real ruling: is this campaign genuinely a Forest-loss response (hook becomes real) or not (it ships with the hole showing, per the through-line) |
| Four event names — Plantation Drive, Yamunotsav, Cyclothon, DIY Workshops | events line | real events, pages and dates; `event` still absent from `lib/content/types.ts` (flag stands, with `journey`) |
| All content in `n-max` / `n-low` / `n-zero` | proof variants | nothing — synthetic, chip-labelled, never ships |

The dash device and its explanatory note are deleted (the note was AD-04 copy
of mine, never approved — no cut of approved copy occurred).

**New copy added this pass, proposals needing approval:** "More this week" ·
"More campaigns" · "and more" (the three boundary strings) · "Runs against
Forest loss" (placeholder hook text).

## Not solved / to carry forward

- **The fork.** `_ad4/home.html` was copied from the morning `home.html`; the
  frozen bands are being repaired in that file concurrently. At sign-off the
  repaired bands 01–02 must be re-diffed into `_ad4` (or `_ad4`'s bands 03+
  ported onto the repaired file). The morning byte-identity held; it must be
  re-verified against the repaired revision, not assumed.
- The journeys desktop rack above four routes (above).
- Record's pre-existing 1,373.9 cap breach and the ≈8,200 doc target ledger
  (§5) — unchanged by this pass.
