# AD-07 — The WORK / ABOUT / IMPACT chapter

Art direction for bands 3 to 9 of the homepage, in the IA the client specified on
21 August. Replaces the AD-04/AD-06 chapter (bands 3–7) marker to marker.

**Built at** `public/design/v3/_ad7/home.html` — a fork. `public/design/v3/home.html`
is untouched. Bands 1–2 and Farm→Footer are byte-identical to the **current** live
file, re-diffed after the client's D-07.3 (farm = five acres, ninety minutes) and
D-07.4 (Green the Map head → `.d1`) landed in it. Verification in §7.

**Method.** Chrome DevTools Protocol, `Emulation.setDeviceMetricsOverride` only,
never `--window-size`. Widths 375×812, 375×635, 414×736, 768×1024, 901×900,
1024×800, 1280×800, 1440×900, 1920×1080. Every number below was measured over the
wire or read off a PNG. Screenshot paths in §7.6.

**One correction to the brief, stated up front, because two numbers in it are wrong
and the budget depends on them.** The brief says "Bands 3–6 currently cost ~2,090px
at 375". Measured, bands 3–5 cost **2,100.60** and bands 3–6 cost **3,651.91**. The
scope I was actually given — `BAND 3` to `BAND 8`, which is five bands, `#work`
through `#impact` — costs **4,327.38px at 375** and **4,596.34px at 1440**. Those
are the figures this chapter is measured against, and they are the ones used
throughout. The brief also says "No reveal/IntersectionObserver system exists in
this file. Do not introduce one." One does exist (`home.html:3106`, the `.rise`
class). See §8.1 — I did not use it, and there is a reason.

---

## 1. The through-line

Band 1 reads the city against a published limit. **This chapter reads Swechha the
same way, in the same hand** — every section states what it is, what it has
actually done and where to go next, and wherever the organisation's own record
carries a number that the band is *about*, that number is set as a reading with the
rule that belongs to it. Nothing here is described where it can be counted.

What makes the seven bands read as one chapter is a single inherited mark: `.rl`,
the rule that belongs to its numeral and kisses it at `.06em` of the numeral's own
size. **What makes them read as seven different compositions is that the rule does
something different in every one of them.** That is the whole design in one line:

| band | what the rule does |
|---|---|
| 3 the smell banner | nothing — no rule and no numeral. The chapter's silence |
| 4 what we do | it kisses a **word** for the first time on this site; four ragged rule-ends are the band's vertical structure |
| 5 journeys | it becomes a **route line** — one continuous hairline the durations hang off |
| 6 projects | it becomes the **register's rung**, thin and repeated; the photograph is the one object without one |
| 7 campaigns + events | **none on the campaigns** — a marching indent carries it instead; the ticker's cell divider returns for the events |
| 8 about us | it becomes a **year's rung** in a narrow register, the smallest it appears anywhere |
| 9 impact | it is laid **flat under each figure** — the ticker's own rotation, at six times the scale |

**One heading voice.** Every display line in this chapter is `.d1` — Archivo
condensed caps, 104px at 1440, 43.2px at 375 — including the statement in band 3.
The serif appears exactly once, on the About band's approved statement line, which
is a statement and not a head. That is a direct read of the client's D-07.4 ruling
on Green the Map: section heads in one voice across the page.

---

## 2. The ground sequence, re-derived for fourteen bands

The chapter turns five bands into seven, so the twelve-hex sequence had to be
re-derived rather than inherited. It was, and the result is better than what it
replaces: **paper now arrives at band 4 instead of band 6**, and the chapter then
alternates dark/paper strictly with no dark run at all.

| # | band | ground | tier |
|---|---|---|---|
| 1 | hero *(frozen)* | `#0D0D0B` | T1 |
| 2 | ticker *(frozen, chrome)* | `#151512` | — |
| **3** | **the smell banner** | `#0D0D0B` | **T1** |
| **4** | **what we do** | `#F3F2F0` | **T2** |
| **5** | **journeys** | `#0D0D0B` | **T2** |
| **6** | **projects** | `#ECEBE8` | **T2** |
| **7** | **campaigns + events** | `#151512` | **T3** |
| **8** | **about us** | `#F3F2F0` | **T2** |
| **9** | **impact** | `#151512` | **T3** |
| 10 | farm *(frozen)* | `#0D0D0B` | T1 |
| 11 | green the map *(frozen)* | `#151512` | T4 |
| 12 | record *(frozen)* | `#F3F2F0` | T2 |
| 13 | give *(frozen)* | `#E1A32B` | T3 |
| 14 | footer *(frozen)* | `#151512` | T4 |

**Adjacency check, run mechanically at all nine widths: zero clashes.** No two
adjacent bands share a computed ground anywhere on the page. Measured grounds at
1440 are in §7.3.

- **Halftone stays at exactly three** frames: hero, the smell banner, farm. What
  moved is one incidental clause of the definition, not the count — see §3.1.
- **Red stays in band 1, green in band 9. Eight bands apart**, up from five.
- **Mustard is one act per band and never a ground.** Band 7 is the one band with
  two acts, because it is two kinds of work, each with its own detail page.
- **Three tiers, not one padding.** T1 / T2×4 / T3×2. The tier repetition on the
  four T2 bands is deliberate and it is not what carries the rhythm here — the
  ground alternation and the seven compositions do, and the bands run from 417 to
  893px at 375, which is a 2.1:1 spread inside one tier.

---

## 3. The seven sections

### 3.1 Band 3 — THE SMELL BANNER · `#say` · `#0D0D0B` · T1 · halftone 2 of 3

**Composition at 1440.** A seam, not an overlay. The photograph is full-bleed on
three sides and occupies the right **56%**; the left 44% is solid black. The
statement sits on that black at **18.33:1**, three lines of `.d1` at 104px, left
edge on the page's x=146 spine, vertically centred. Under it, at `--gap-head`, one
micro-caps line in `--fg-2` (11.20:1). Nothing else. Band height **488.55px**.

**Why a seam.** Every previous version of this band set the sentence *on* the
photograph and paid for it with a veil; the file's own note explains why that is
structural rather than a tuning problem. Here the type needs no ramp, no seat and
no text-shadow, and the photograph is left **completely unveiled** — the only
full-bleed frame on the page a reader sees at full tonal strength. The picture is
`yamuna-floodplain-crowd.jpg`, 2000×923: a school group on the sand looking at a
river surface covered in white foam. It is the frame the art direction always
wanted for this band and it needs no upscaling at any tested width.

The type is bounded **by the seam, not by a magic max-width**: `padding-right` is
`calc(56% + 16px)`, so the sentence is geometrically incapable of reaching the
photograph. Measured ink clearance: 91.8px at 1440, 62.9px at 1920, 77.9px at 768.

**Composition at 375.** The frame becomes a letterbox at 25vh with a **different
crop**, closing on the group and dropping the empty sand; the statement and its
answer sit on solid black beneath. One screen, one sentence. **417.05px.**

**Ground, tier, type.** `#0D0D0B`, T1, `.d1` at 104/43.2px, answer in `.lbl` at
12.5px `--fg-2`.

**CTA: none, deliberately. This band is the chapter's PAUSE.** The direction put the
page's rest on the timeline and enforced it by subtraction — "the only section with
nothing to click". The client has now asked for a button on every section of this
chapter, so the timeline cannot hold that job. It moves here, where it is free: a
statement is not an "aspect" with a detail page. **This needs a ruling — question 6.**

**Copy — both strings approved, and reunited as the pair they were written as:**
> A number / is not / a smell
> So we take them to the water.

**What I refused.** The dot screen. Its definition required "a display headline
inside its frame", and here the headline is beside the frame. I kept the screen and
moved the clause: the halftone marks the three photographs that carry a band's whole
meaning rather than illustrating it, and a high-contrast foam field is the subject
it serves best. The count stays at three, which is what the rhythm depends on.

### 3.2 Band 4 — WHAT WE DO · `#work` · `#F3F2F0` paper · T2

**Composition at 1440.** The client's instruction was that WHAT WE DO must *begin*
with the four kinds, so **the four kinds are the headline**. There is no separate
display head: this is the one band on the page whose title and whose index are the
same object. Four full-measure rows, hairline separated, each carrying the kind in
`.d1` at 104px on the spine, with the rule kissing the last letter, and its
definition in a 420px column to the right, **all three sizes on one baseline**.
Ordinal leads the definition rather than the word, so the display column starts at
x=146 like every other headline on the page. Band height **1,013.83px**.

**The rule kisses a word.** First time on this site. Because `.rl` is drawn from a
`max-content` box it works on PROJECTS exactly as it works on 412 — and because the
four words are 8, 9, 8 and 6 characters long, the four rule-ends land at four
different x-positions. **That rag is the band's vertical structure**, which is the
argument the impact ledger makes with four numerals, made here with four words.

**Composition at 375.** The definition drops under its word; the rule stays, because
at 43.2px it is still the mark that says this is a reading and not a menu item.
**741.28px.**

**Type.** `.d1` 104/43.2px `--ink` (16.60:1) · definitions 15.5px `--ink-2` (8.24:1)
· ordinals `.lbl` 11.5px `--ink-2` (8.24:1) · rule 2px `--ink-2` (**8.23:1**),
mustard at 4px on hover.

**CTA:** *The whole list →* (approved copy) → **`/work`**

**Copy.** Lead — NEW, awaiting approval: *"Four kinds of work. Not four
departments."* Definitions, all checkable against
`2026-08-21-SOURCE-FACTS.md`:
> **Projects** — Curriculum, campus and garden. The work that runs for years.
> **Campaigns** — Public pressure with a name on it, since We for Yamuna in 2000.
> **Journeys** — A thousand kilometres on one river, or five days in a village.
> **Events** — Workshops, concerts and plays. One night at a time.

**What I refused.** Four cells across. An N-across row of equal items is the
pattern the design language caps at two, and it is what the rejected pass reached
for. Also: treating the four kinds as a fixed set is **not** a count-dependence —
D-03.2 forbids depending on how many projects or events exist, and this band states
no count of either.

### 3.3 Band 5 — JOURNEYS · `#journeys` · `#0D0D0B` · T2

**Composition at 1440.** One continuous hairline runs the full width of the index —
the route line — and the journeys hang off it **duration first**: a numeral with its
rule laid flat beneath it, then the frame, then the name. That is the flip band 2
took in D-02.1 (value leads, label under the rule), at ten times the size, so a
reader who has just met the strip recognises the grammar.

**The column's width is the journey's length.** Twelve days is the widest measure,
half a day the narrowest (flex ratios 44 / 32 / 24). All frames share one height, so
the crop of each — landscape, near-square, portrait-ish — is a *consequence* of how
long the journey is rather than a decision made per card. It is one photographic band
of constant height cut into unequal measures, not a card deck. The index runs on
`.wide` (1580) while the head and the act stay on `.wrap` (1240), so the index is
visibly wider than the reading. Band height **1,019.81px**.

**Count-safety.** The ratios are flex grow factors carried per item (`--w`), so a
fourth or fifth route re-divides the row with no designer in the loop, and the band's
height does not move.

**Composition at 375.** The route line becomes the rail the doctrine asks for: one
card per screen minus a 52px peek, snapped, durations still leading, three tab chips
at 48px in the thumb zone of the rail's own frame, and the licensed 8px ground fade
at the viewport edge. **815.95px.**

**Type.** `.d1` head · durations 44.6px `.num` `--fg` (18.33:1) with a 2px `--fg-3`
flat rule (**6.53:1**) · names Archivo 23px `--fg` · places `.lbl` `--fg-3` (6.53:1)
· reach lines 14.5px `--fg-2` (11.20:1).

**CTA:** *Every route →* → **`/work/journeys`**

**Copy.** The lead is the organisation's own sentence, quoted straight:
> From where it originates and is pristine, down to the point where it reaches Agra
> and is almost a toxic body of water. Twelve days. A thousand kilometres. Since 2004.

Head — NEW, awaiting approval: *"Go and see"*, taken from the approved
`/work/journeys` page's own first verb (GO → EXPERIENCE → QUESTION → UNDERSTAND →
ACT). Every figure in the strip is sourced (PDF p4–p5).

**What I refused.** Four routes. The sources name three; the approved
`/work/journeys` page carries four, of which NatureScapes has no source and
CityScapes appears to be the eco-walks programme under another name. I show the
three that are sourced rather than attaching real figures to an unsourced name.
**Question 4.**

### 3.4 Band 6 — PROJECTS · `#projects` · `#ECEBE8` paper-2 · T2

**Composition at 1440.** The inverted split. Every other two-column band on this
page reads display-left / quiet-right — `.im-head` does it, the farm does it, the
rejected ledger did it. **This band runs the other way:** the register on columns
1–5, and the photograph, the largest object in the band, on columns 7–12. So the eye
lands on the picture and then reads leftward and down, which is the opposite path to
every band above and below it. Band height **1,112.66px**.

**Row 01 is the photograph**, so the register opens at 02. That is deliberate and it
is also a fix: giving 01 both a picture and a rung would put the same link on the
page twice, which is the duplication AD-02 spent a review removing from band 2. The
lead carries two readings — `250+` schools, `50,000+` students — in the page's own
numeral voice with their own rails. The register's rungs are thin and dense on
purpose: **it is the density opposite of band 4's index rows**, which is what stops
two ruled lists two bands apart reading as the same object.

**Weight is carried by treatment, never by n.** One project has a photograph and two
readings; the rest have a rung and a fact. That holds at three projects or fifteen.

**Composition at 375.** Stacks picture-first, so the reading order is 01, 02, 03…
The register caps at **two rungs at ≤560** and three at 561–767; the boundary row
reveals itself by its own child position exactly when something is hidden.
**893.48px.**

**Type.** `.d1` head · lead name Archivo 29.6px `--ink` · sentence 16.5px `--ink-2`
(7.72:1) · readings 46.1px `.num` `--ink` with a 2px `--ink-2` rule (**7.72:1**) ·
rung titles Archivo 17.9px `--ink` · facts 13.5px `--ink-2` (7.72:1).

**CTA:** *All the projects →* → **`/work/projects`**

**Copy.** Head and lead are approved copy, moved: *"What is running"* and *"In the
order they take up our week."* Every project fact is sourced (PDF p3–p6, p9–p11).
"She Leads Change" and "Food systems, with UNEP" were on the page and appear in
neither source; they are not in the register and are **question 5**, not a silent cut.

**What I refused.** 44px thumbnails. The rejected pass gave five projects a
44px picture each; one project at 320px and five rungs says more about weight than
six equal thumbnails ever could, and it survives any n.

### 3.5 Band 7 — CAMPAIGNS + EVENTS · `#campaigns` · `#151512` · T3

**Composition at 1440.** One band, two shapes, and they are not variants of each
other. A campaign has something to push against, so it is read **opponent-first**:
the mark sits above the name and the name is the band's ink. And the campaigns
**march** — each steps right by one grid column (0 / 8 / 16 / 24%). It is the one
composition in the chapter that carries movement, which is what a campaign is; it
costs nothing, it is positional rather than count-dependent, and with one campaign
it simply reads as one entry at zero indent. **There is no rule on the campaigns at
all** — the indent is the mark here.

An event happens once and is open to anyone, so the events are a **strip**, drawn
with the ticker's own cell divider, because that is already this page's grammar for a
set of small things read across. At ≤767 the divider rotates from vertical to
horizontal rather than disappearing. Band height **1,147.83px**.

**Composition at 375.** The march survives at 0 / 12 / 24 / 36px. **851.67px.**

**Type.** `.d1` head · marks `.lbl` `--fg-3` (**6.14:1**, the same value and ground
as the frozen ticker's own cell labels) · names Archivo 46.4px `--fg` (18.33:1) ·
event names Archivo 19.2px `--fg` · note 16px `--fg-2` (11.20:1).

**CTAs — two, and this is the chapter's one exception to one act per band:**
*All the campaigns →* → **`/work/campaigns`** · *All the events →* →
**`/work/events`**. Granted because the client combined two kinds here and each has
its own detail page. They are the same component at the same weight, one at the foot
of each zone, so they read as two destinations rather than as a hierarchy.

**Copy.** Head and sub — NEW, awaiting approval: *"In public"* and *"A campaign
pushes. An event invites."* "In public" is what actually distinguishes these two
kinds from projects (which run inside schools) and journeys (which go away), so it
earns the client's combination rather than just accepting it. Campaign marks:
*Runs against the Yamuna →* (live, `situation-yamuna.html`) · *50,000+ trees planted
and survived* (the organisation's own verb) · *Runs against Delhi's air →* (live,
`situation-air.html`) · *Youth-led, on political awareness*.

**What I refused.** The speculative "Runs against Forest loss" hook on Monsoon
Wooding, which AD-04b shipped as a placeholder. The sources give that campaign a far
better mark than a guessed situation — its own number, in its own word. The
placeholder is gone rather than inherited.

Also refused: the four earlier event names (Plantation Drive, Yamunotsav, Cyclothon,
DIY Workshops). None is in either source. The strip carries the three that are.
**Question 8.**

### 3.6 Band 8 — ABOUT US · `#about` · `#F3F2F0` paper · T2

**Composition at 1440.** A **triptych** — one photograph on columns 1–3, one
paragraph on 5–8, one register on 10–12 — three columns at three completely
different densities, which is a shape no other band in the chapter uses. It answers
both halves of the client's ask at once: the Who-we-are paragraph gets the largest
reading measure in the chapter, and the journey of Swechha comes down from four
illustrated rows to a narrow year register that costs a third of the height. Above
the triptych, the band opens on the approved serif statement — the chapter's one
serif line. Band height **944.89px**, against the timeline's 1,432.06 at the same
width.

**Composition at 375.** The photograph is cut at ≤560 and the band becomes what it
actually is on a phone: a paragraph and a register. That is the licence the direction
already exercises on Green the Map's tote. Measured saving 234px. **890.33px**,
against the timeline's 1,551.31 — **a 660.98px reduction on the page's largest band.**

**Type.** Eyebrow `.lbl` `--ink-2` (8.24:1) · statement `.d2` Newsreader 300 at 44px
`--ink` · sub-label `.lbl` `--ink-2` · paragraph 16.5px `--ink` (16.60:1) at 46ch ·
years Archivo 18.6px `--ink` with a 3px `--ink` rung (**16.61:1**) · notes 14.5px
`--ink-2`.

**CTA:** *Who we are, in full →* → **`/about`**

**Copy.** The statement is approved verbatim. The paragraph is the organisation's own
wording from the live About page and the Introduction PDF (p1, p3), ~80 words:

> Swechha started in 2000 as We for Yamuna — a collective response towards growing
> apathy towards one of the most polluted rivers of the world. Since then it has been
> an organisation dedicated to enabling ourselves and others around us to Be the
> Change, in making a visible difference to the environment, both physical and social.
> The mission is one sentence: to inspire, create and support a just, equitable and
> sustainable society, for everyone and forever. Three words hold the work —
> Education. Environment. Enterprise.

Register: 2000 (approved copy, plus the sourced campaign name) · 2004 · 2008 · 2016
(approved) · Now (approved).

**No year count is typed anywhere in this chapter.** The ruling is that twenty-six
years derive from `foundedYear = 2000`. This file's own precedent (AD-05 R1) is that
a claim which goes stale is **cut, not computed**, because computing it leaves the
static fallback wrong. So the band says **"Since 2000"** — a fact that never ages —
and no numeral of years appears in the chapter at all. That removes the branch
instead of maintaining it, which is D-01.10's argument applied to a number.

**What I refused.** The four illustrated timeline rows. They cost 1,551px at 375 to
say five things, and a photograph attached to a year is a provenance claim I cannot
support: several frames in the library are approved stand-ins, so captioning one
"2000" would be the page asserting something it does not know. One uncaptioned
photograph makes no claim at all.

### 3.7 Band 9 — IMPACT · `#impact` · `#151512` · T3 · GREEN

**Composition at 1440.** The client asked for "a nice strip", so it is a strip —
and **the only band in the chapter with no display head at all. The figures are the
head.** What names the section is a micro-caps key at the left end of the top rule;
what closes it is one act at the right end of the bottom rule. That is the ticker's
own anatomy — a caged register with its identity in the margin — at six times the
size. Band height **550.97px**, against 662.00 for the band it replaces.

**The rail laid flat.** The rule sits *under* each figure, drawn from a `max-content`
box so it is the numeral's own width. Four figures of four different lengths
therefore carry four rules of four different lengths, and that is the strip's
rhythm — derived, not chosen. It is the one licensed rotation of the rail contract
and the rotation band 2 already uses.

**Cells are sized by content, not by a fraction**, because one of the four honest
labels is three times the length of the others. That is the point: the composition
carries the honesty rather than fighting it.

**Composition at 375.** At 561–900 the approved 2×2. **At ≤560 the 2×2 fails,
measured**: the honest label for the range is 48 characters, which is a five-line
label under a one-line one, and the grid stops reading as a register. So the strip
becomes a single-column **ledger** — numeral left, label right, one rung each — and
the rail rotates back to vertical, because a flat rule under a numeral in a narrow
left column would point at nothing. Same mark, re-shaped; exactly what the hero does
at this width. **598.19px.**

**Green, under the widened ruling (client, 21 August).** Green now means *what
Swechha has done* rather than only *what has been recovered*, so all four figures
carry it, including reach — which under the old closed list would have broken it.
**The key states the widened meaning in words, in place** (`IMPACT / WHAT SWECHHA
HAS DONE`, in green micro-caps at 6.14:1), so nothing here is carried by hue alone.
Red is untouched and still means one thing, eight bands away. The one clickable
thing in the band is mustard: a green control would teach a reader that green means
"click me" and spend the distinction the four figures rest on. **This ruling also
settles the open hue question on the ticker's rotating Impact slot (D-00.2) — logged
here for the ledger; band 2 was not touched.**

**No auditor is implied, anywhere.** The lead said *"Twenty-six years, counted.
Audited to 31 March 2026."* The record is that these are the owner's own verified
figures, so the word is gone from the band and from its method note.

**The four figures are the owner-ruled four** (DECISIONS-2026-08-18). The build's
silent substitutions — "78 butterfly gardens" and "67 air-detox gardens" — are both
removed.

| figure | label |
|---|---|
| `3M+` | Children and young people reached |
| `6,890t` | Out of the Yamuna |
| `90%`, with `FROM 5%` above it | Green cover, in one Vasant Kunj park, over a decade |
| `100+` | Green infrastructures, across 100+ schools |

**The range is one park and the label says so.** 5% → 90% green cover is a single
Vasant Kunj park over a decade of work, not a city and not the organisation. The
range renders as one green numeral with a micro-caps *from* line above it, so all
four figures stay on one baseline — the alternative, two stacked numerals, doubles
the cell and breaks the strip.

**Type.** Key `.lbl` `--green` (6.14:1) · verified line 15.5px `--fg-2` (11.20:1) ·
figures 92.2px `.num` `--green` (**8.01:1**) with a 3px `--green` rule (8.01:1) ·
labels `.lbl` `--fg-2` at 20ch · note 16px `--fg-2`.

**CTA:** *The whole record →* → **`/impact`**

**Copy.** *"Our own count, verified to 31 March 2026."* — NEW, awaiting approval,
replacing the audited line. *"Every figure has a method note behind it."* — approved.

**What I refused.** A display headline. "The receipts" is good copy but a headline
above these figures competes with them, and a strip is a strip because nothing above
the numbers is louder than the numbers.

---

## 4. Copy ledger

**Approved copy, reused or moved, not rewritten:** "A number is not a smell" · "So we
take them to the water." · "The whole list" · "What is running" · "In the order they
take up our week." · "Swechha means, roughly, of one's own free will." · "We for
Yamuna. No funding, no office, one stretch of bank." · "City to countryside. Land,
water, livelihoods and the farm." · "Still showing up. A monitoring feed, and the
records nobody else has." · "Every figure has a method note behind it."

**New copy needing approval — four lines and five CTA labels:**
1. *"Four kinds of work. Not four departments."*
2. *"Go and see"*
3. *"In public"* + *"A campaign pushes. An event invites."*
4. *"Our own count, verified to 31 March 2026."*
5. CTAs: *Every route* · *All the projects* · *All the campaigns* · *All the events* ·
   *Who we are, in full*

**Cut:** "Audited to 31 March 2026" (no auditor exists) · "Twenty-six years" (every
instance in this chapter; the page says "Since 2000") · "The receipts" (the strip has
no head) · "Runs against Forest loss" on Monsoon Wooding (a placeholder hook,
replaced by the campaign's own sourced figure) · the four unsourced event names.

Everything else — every definition, every journey figure, every project fact, every
campaign mark, the whole About paragraph — is checkable line by line against
`docs/design/2026-08-21-SOURCE-FACTS.md`.

---

## 5. Destinations

Every section has a real button to a real page. URLs from the sitemap and the
existing designed pages (`projects-landing.html`, `journeys-landing.html`,
`app/sitemap.ts`); process ruling P-1 covers header and menu links only.

| band | act | destination |
|---|---|---|
| 3 the smell banner | **none** — the chapter's pause | — |
| 4 what we do | The whole list | `/work` |
| 4 | the four kinds, each a link | `/work/projects` `/work/campaigns` `/work/journeys` `/work/events` |
| 5 journeys | Every route | `/work/journeys` |
| 6 projects | All the projects | `/work/projects`, lead row to `/work/projects/bridge-the-gap` |
| 7 campaigns | All the campaigns | `/work/campaigns` |
| 7 events | All the events | `/work/events` |
| 7 | two campaign marks | `situation-yamuna.html`, `situation-air.html` |
| 8 about us | Who we are, in full | `/about` |
| 9 impact | The whole record | `/impact` |

---

## 6. What I deliberately refused, at chapter level

1. **`.rise`.** The chapter paints unconditionally. See §8.1.
2. **A second heading face.** One display voice, `.d1`, in all six bands that have a
   display line. The serif appears once.
3. **A typed or computed count of years.** "Since 2000" instead.
4. **Any stated total of projects, campaigns or events.** No numeral anywhere names
   an inventory; per-item figures (250+ schools, 50,000+ trees) are facts about an
   item, not counts of the set.
5. **A statement band at its own type size.** It was 73.6px, which sat 10% above the
   hero's deliberately suppressed 67.2px h1 — close enough to read as an accident. It
   is plain `.d1` now.
6. **`--ink-3` for micro-caps on paper.** The shared sheet's
   `.paper .lbl{color:var(--ink-3)}` measures 6.01:1 on `#F3F2F0` and **5.64:1** on
   `#ECEBE8` at 11.5px. This project's own token rule names that as the single most
   repeated defect in the build, so the chapter's three paper bands override it to
   `--ink-2`. Measured after: 7.72 and 8.24:1.

---

## 7. Verification

All CDP, `Emulation.setDeviceMetricsOverride`, nine viewports. Nothing below is
asserted.

### 7.1 Per-band heights

At **375×812** (~900 cap; every band inside it):

| band | height | | band | height |
|---|---|---|---|---|
| say | **417.05** | | campaigns | **851.67** |
| what we do | **741.28** | | about us | **890.33** |
| journeys | **815.95** | | impact | **598.19** |
| projects | **893.48** | | **chapter** | **5,207.95** |

At **1440×900**: say 488.55 · what we do 1,013.83 · journeys 1,019.81 · projects
1,112.66 · campaigns 1,147.83 · about 944.89 · impact 550.97 — **chapter 6,278.54**.

### 7.2 Chapter total against what it replaces

The scope replaced is `#work` + `#journeys` + `#running` + `#timeline` + `#impact`,
measured on the live file with the identical harness.

| viewport | AD-07 chapter | live chapter | delta | AD-07 doc | live doc |
|---|---|---|---|---|---|
| **375×812** | **5,208** | **4,327** | **+881** | **9,910** | 9,030 |
| 375×635 | 5,183 | 4,310 | +873 | 9,791 | 8,918 |
| 414×736 | 5,130 | 4,223 | +907 | 9,618 | 8,711 |
| 768×1024 | 5,490 | 5,149 | +341 | 9,733 | 9,392 |
| 901×900 | 5,411 | 5,102 | +309 | 9,531 | 9,221 |
| 1024×800 | 5,084 | 3,940 | +1,143 | 8,801 | 7,658 |
| 1280×800 | 5,870 | 4,365 | +1,505 | 9,884 | 8,379 |
| **1440×900** | **6,279** | **4,596** | **+1,683** | **10,689** | 9,006 |
| 1920×1080 | 6,434 | 4,842 | +1,592 | 10,982 | 9,391 |

**Document height at 375×812: 9,910px, against 9,030 for the live page — +880.**

**The honest reading of that number.** The chapter delivers **seven** sections where
the old one delivered **five**: a designed statement band, a four-kind index,
journeys, projects and campaigns+events as three separate sections instead of one
merged ledger, and an About band with a real Who-we-are paragraph. **Per section it
is 14% cheaper** — 744.0px against 865.5 at 375 — and the single largest band on the
page came down 661px (timeline 1,551.31 → about 890.33). The total is up because the
client asked for more sections, and there is no arrangement of seven sections with a
head, a body and a button each that costs less than about five thousand pixels at
375. The ≈8,200 document target is not met and was not met before this pass; the
page was 830 over on arrival and is 1,710 over now. §9 lists the measured trades.

### 7.3 Ground adjacency

Run mechanically at all nine widths: **zero clashes at every width.** Computed
grounds at 1440:

```
hero 13,13,11   ticker 21,21,18   say 13,13,11   work 243,242,240
journeys 13,13,11   projects 236,235,232   campaigns 21,21,18
about 243,242,240   impact 21,21,18   farm 13,13,11   gtm 21,21,18
record 243,242,240   give 225,163,43   (footer 21,21,18)
```

### 7.4 Horizontal overflow

`document.scrollWidth === window.innerWidth` at **all nine widths**: 375, 375×635,
414, 768, 901, 1024, 1280, 1440, 1920. The eight elements that sit outside the
viewport at 375 and 414 are the journeys rail's off-screen cards, inside their own
scroll container — the doctrine's licensed horizontal overflow, with its 8px
ground fade present at the specified width.

### 7.5 Contrast, spine, marks, count-independence

- **43 distinct text pairings measured.** Minimum **6.14:1** (`--fg-3` micro-caps on
  `#151512` — the same token, size and ground as the frozen ticker's own cell
  labels). Maximum 18.33:1. Every pairing clears AA 4.5:1 by at least 36%.
- **All five rails clear the 3:1 non-text floor:** index word rule 8.23:1 · journeys
  duration rule 6.53:1 · projects reading rule 7.72:1 · about year rung 16.61:1 ·
  impact figure rule 8.01:1. Three of these measured **1.46–1.56:1** on the first
  build: `.paper .rl::after{--rl-c:var(--rule-2)}` in the shared sheet sets the
  custom property *on the pseudo-element*, so a value set on the element never
  reaches it. Fixed by targeting `::after`.
- **The spine holds.** Measured left edges at 1440, to two decimals: hero h1
  **146.00** · say head **146.00** · index eyebrow **146.00** · index word 01
  **146.00** · journeys head **146.00** · projects head **146.00** · campaigns head
  **146.00** · about eyebrow **146.00** · impact key **146.00**.
- **Type ladder at 1440:** 272 readout · 104 every display head including the
  statement · 92.2 impact figures · 67.2 hero h1 · 46.1 projects readings · 44.6
  journeys durations · 44.0 About serif statement.
- **Count-independence, verified at 375, 560, 700, 768 and 1440.** Every boundary
  row's visibility matches whether anything is actually hidden, at every width:
  projects 2/5 → 3/5 → 5/5, campaigns 3/4 → 4/4, events 3/3 throughout. **The check
  caught a real bug**: listing `.w7-ce-evmore` beside `.w7-ce-evn` in one `≤767`
  selector set `display:block` unconditionally, so "and more" painted on every phone
  width with nothing behind it. That is the same cascade failure AD-04b caught on the
  campaigns boundary, reproduced and now fixed.
- **Frozen regions, byte-identical by exact string comparison against the current
  live file** (re-diffed after D-07.3 and D-07.4 landed in it):

```
IDENTICAL  markup: header + band 1 hero + band 2 ticker          20,344 bytes
IDENTICAL  markup: band 8 farm -> </html>                        22,263 bytes
IDENTICAL  css: :root tokens -> end of the band 2 ticker block    86,640 bytes
IDENTICAL  css: band 8 farm -> end of the band 11 give block      16,752 bytes
```

  The farm's five acres, "an hour and a half from Delhi", "Minutes from Delhi", the
  `.d1` Green the Map head and its `clamp(2rem,4.4vw,3.4rem)` cap are all carried
  through. Nothing in this chapter describes the farm.

### 7.6 Screenshots read

All under
`/private/tmp/claude-502/-Users-administrator-Farm-App/7a16e2f1-fab6-4755-87f0-82c83bc74723/scratchpad/ad7/`:

- `final/{say,work,journeys,projects,campaigns,about,impact}-1440.png` — every band at 1440×900
- `final/{say,work,journeys,projects,campaigns,about,impact}-375.png` — every band at 375×812
- `final/continuity-hero-to-index-1440.png` — hero → ticker → smell banner → index, one image
- `final/continuity-journeys-to-impact-1440.png` — the remaining five bands, one image
- `final/continuity-chapter-375.png` — the whole chapter on a phone
- `cur-hero-1440.png`, `cur-ticker-1440.png` — the frozen reference, read before designing
- `cur-band{3,4,5b,6,7b}-1440.png` — the rejected pass, read before designing
- `v1-*.png`, `v2-*-375.png` — intermediate states, including the two bugs in §7.5

**Continuity check.** `continuity-hero-to-index-1440.png` puts the frozen hero and
ticker directly above the new bands 3 and 4 at the same width. Reading down: halftone
masthead, Archivo caps display, a giant tabular numeral with its rule, micro-caps
provenance — then a strip of value/rule/label — then the same Archivo caps display
and the same halftone on a seam — then the same caps at the same 104px with the rule
now on words, and the same micro-caps ordinals. Nine head elements on one 146.00px
spine. It reads as one site.

---

## 8. Found while in here, and not fixed

1. **The reveal system has no safety net, and the brief says it does not exist.**
   `home.html:3104-3110` adds `js` to `<html>` and observes `.rise`; `.js .rise` is
   `opacity:0` until the observer fires, and **there is no `setTimeout` fallback** —
   the one `DECISIONS-2026-08-18` explicitly required ("a 1.2s setTimeout safety net
   so content can never be stuck invisible if IO never fires"). Any `.rise` element
   is one observer failure away from invisible, and today `#running`'s two columns
   are `.rise`. It is also why a clipped CDP capture of that band photographs an
   empty page. **This chapter uses no `.rise` at all** — it carries the whole of what
   the organisation does and cannot be conditional. The missing net is in the shared
   script, after the footer, and is out of scope.
2. **Record still costs 1,373.92px at 375**, an unlicensed 474px breach that predates
   this pass and is now the largest single object on the page. Closing it and give
   would more than absorb this chapter's +880.
3. **Projects and campaigns run 1,080–1,148px at 768–1920.** No cap applies above
   375; recorded so it is not read as a breach.
4. **The journeys rail's 8px fade** is present at the doctrine's specified width and
   is, as AD-02 already found, hard to see at 375. The three 48px tab chips are the
   real affordance.

---

## 9. Questions only the client can answer

Each one changes the work.

**1. "Air-detox gardens" is not a term either source uses.** The source term is
**Airshed Park**. Butterfly gardens are real — the PDF says "over 70", so the
build's **78** is a plausible updated count and my earlier note that it had no
source was true only of this repo. So: does the page adopt "Airshed Park", and is
there a confirmed number behind the **67**? Neither figure is on the page now.

**2. What method stands behind "3M+ children and young people"?** It is owner-ruled
and it is on the page. Neither source supports it: the largest figure in the
Introduction PDF is 500,000+ (Brake Even), with 50,000 students on Bridge The Gap,
10,000 volunteers a year on Influence, 3,000 on ME to WE and 100,000 on eco-walks. A
reader who has read the About page will do that arithmetic. The band promises "every
figure has a method note behind it", so this one needs to be nameable.

**3. Is the green-cover tile scoped correctly?** It now reads *"Green cover, in one
Vasant Kunj park, over a decade"* — because that is what it is. Confirm, or give me
the organisation-wide figure if one exists. Related: tile 4 reads *"Green
infrastructures, across 100+ schools"*, but the sources put the butterfly parks and
herb gardens in Delhi NCR rather than specifically in schools, and they sum to 90+
rather than 100+. Confirm both halves of that label.

**4. Three journeys or four?** The sources name Yamuna Yatra, Gram Anubhav and
eco-walks. The approved `/work/journeys` page carries four — Yamuna Yatra,
NatureScapes, CityScapes, Gram Anubhav. Is **CityScapes the eco-walks programme**
under another name (1,000+ walks, 100,000+ people)? And does **NatureScapes** have a
source and any figures? The strip shows the three that are sourced; a fourth costs
nothing structurally, but it needs a duration and a reach line or it will be the one
route with no reading.

**5. Are "She Leads Change" and "Food systems, with UNEP" current projects?** They
were on the page and are in neither source, so they are not in the register. The six
that are shown are all sourced. If they are live, what are their figures?

**6. Does the smell banner take a button?** The instruction was that all these
sections should have one. This band has none, because a statement is not an aspect
with a detail page — and because the page's one moment with nothing to click used to
be the timeline, which now has a button. If the smell banner gets one too, the
homepage has no rest anywhere in it.

**7. Approve the four new lines and the five CTA labels** in §4. A different answer
on any of them is a one-string change; nothing else moves.

**8. Events: names and dates.** The strip shows One Night Stand, Remakery Workshops
and Concerts and Plays — all sourced. The four earlier placeholder names (Plantation
Drive, Yamunotsav, Cyclothon, DIY Workshops) are in neither source and are off.
Confirm the swap, and confirm that events are **not** datable yet — the design
deliberately promises no dates, because none are sourced, and adding them later is a
markup change rather than a redesign.

**9. Which height trade, if any?** The chapter costs +881px at 375. Each of these is
measured, on the built file:

| trade | saving at 375 |
|---|---|
| Remove the smell banner entirely | **−417** |
| Drop the four definitions from the WHAT WE DO index | **−202** |
| Remove the lead project's photograph | **−168** |
| Remove the events note (the Remakery sentence) | **−104** |
| Drop the journeys tab chips | **−66** |
| Set the About paragraph at 14.5px | **−30** |
| Return Impact to a 2×2 at 375 instead of the ledger | **−5** |

My recommendation is to take none of them and to close **record** instead, which is
474px over its own cap, unlicensed, and outside this chapter.

---

## Verification pass by the lead, 21 August — two defects found and fixed

The fork was re-measured independently after delivery (CDP device emulation, my own
harness, 375 and 1440). The chapter's claims reproduce: chapter 5,229px at 375 (my
harness runs a 900px viewport, hence the small delta from 5,208), every chapter band
inside the 900 cap with `projects` the tallest at 893.5, zero ground-adjacency clashes,
`scrollWidth === viewport`, and the frozen bands byte-identical including the farm and
Green the Map edits that landed mid-flight. Two things did not hold.

**1. The About register's year rails struck through their own descriptions.**
`.w7-ab-yr` set `--rl-h:clamp(34px,2.8vw,44px)`, which resolves to **40.3px at 1440
against an 18.6px year box**, so every rail hung ~21px into the description line 7px
below it — a black bar through "We for Yamuna", "The first Yamuna Yatra", "City to
countryside" and "Still showing up". Changed to `--rl-h:1.05em` (19.48px at 1440,
17.63px at 375). Re-measured: every year now clears its description at 1440, and the
phone's two-column form is unaffected.

**2. §7's claim that "all four figures stay on one baseline" was false as built.**
Measured `.num` tops at 1440: **6903.9 / 6903.9 / 6931.1 / 6903.9** — the `90%` numeral
sat 27.2px below the other three, and its label with it, because `.w7-im-from` was
`display:block` in flow inside a `display:contents` wrapper, so the FROM 5% line pushed
only that cell down. Three rails aligned and one dropped.

Fixed by **reserving** the from-line's exact height (`1.5 × --t-micro + 10px` =
27.25px, which is the measured offset) on every `.w7-im-v`, and releasing it on the one
cell that really carries the line via `.w7-im-from + .w7-im-v`. Released again on the
phone, where each cell is its own rung and there is nothing to align across. Now:
**four numeral tops identical at 1440**; at 768 the 2-up rows align within each row
(5924.5 / 5924.5, then 6093.3 / 6093.3); at 375 the ledger is unchanged. **The band did
not grow** — 551px at 1440 and 598.2px at 375, and the document total is unchanged at
9,948 / 10,689 — because the range cell was already setting that row's height.

Process note: the assertion in §7 was the kind a measurement would have caught, and the
doc's own standard is that nothing is claimed unrendered. Both fixes carry a comment in
the CSS recording the measured numbers that motivated them.

---

# FROZEN — 21 August 2026, merged into the live page

The chapter is merged, the client's late content is in, and two bands outside the
original scope (Farm, Record) came in on his instruction while the merge was in
flight. `public/design/v3/home.html` is now the single source of truth. **The fork
at `public/design/v3/_ad7/home.html` is stale** — it stops at the merge point and
270 lines behind; do not read it for current copy.

Every number below was rendered and measured (CDP `Emulation.setDeviceMetricsOverride`,
widths 375, 414, 560, 768, 901, 1024, 1440, 1920). Nothing here is asserted.

## 1. What changed, in the order it happened

**A — Impact tile 1 (D-07.6).** Label is now *"Children and young people reached
since 2000"*, so the cumulative frame is on the page rather than only in the method
note. Nothing else in the §4 copy ledger moved.

**B — Journeys became four (D-07.7).** CityScapes is the eco-walks programme
renamed and keeps every sourced eco-walk figure; **its duration is the client's
correction, 2–4 hours, not the half-day the first build showed.** NatureScapes joins
at 2–5 days with his four ecosystems as its sub-label. Ratios `--w` 34 / 25 / 22 / 19.

- **The ordering rule had to be decided, because the durations now overlap.**
  NatureScapes (2–5 days) and Gram Anubhav (4–5) tie on their ceiling, so duration
  alone no longer orders the band. The rule is **the floor of each range — the
  shortest version you can actually book**, which is the commitment a reader is
  being asked for: 12 days, 4 days, 2 days, 2 hours. Strict, and it leaves the two
  middle columns near-equal in width, which is honest because those two journeys
  genuinely are near-equal in length.
- **The band's own claim is restated, because it overclaimed.** "The column's width
  IS the journey's length" was never a proportion — half a day already held 55% of
  the twelve-day column's width for 4% of its duration. With 2 hours at one end and
  12 days at the other the true range is 144:1 and no proportional mapping survives
  it at a legible width. So: **the columns are ordered and ranked by length, and the
  width carries the rank, compressed so the shortest journey stays legible.** The
  compression is what is held constant — narrowest is 0.56 of widest (19/34), the
  same character the three-column band had at 24/44 = 0.545.
- **How four columns survive every width.** One row of four at **≥1280**, where the
  narrowest column still measures 216px — wider than the 166px this band already ran
  at 768 with three columns. From **768 to 1279** four in one row would drive that
  column under 140px, so the row folds to **two rows of two** (longer journey wider
  within each row, rows descending in length) and the continuous hairline becomes
  one hairline per journey — the exact rotation the phone rail already performs, same
  declaration. **Under 768 the rail is unchanged and a fourth card is horizontal,
  not vertical, so the fourth journey costs the phone nothing.**
- **One defect found and fixed.** The owner's fourth state (Gujarat) makes
  "UTTARAKHAND, RAJASTHAN, GUJARAT, HIMACHAL" wrap at *every* width including 1440
  in a 320.8px column. Left natural, the four sub-labels ran 1/2/1/2 lines and every
  card's caption started at a different height. `.w7-jr-meta{min-height:3em}` (exactly
  two lines of `.lbl`) reserves the slot on all four. **It costs no band height at any
  width** — the band is sized by its tallest card and that card already carried a
  two-line sub-label.
- Two adjacent columns now both count past sixty. They are differentiated by
  construction and by object, not by fudging either figure: 02 is *"More than sixty
  of them… over a hundred grassroots partners"*, 03 is *"Over sixty organised, for
  schools including Shriram and Modern"*.

**C — the Projects register.** She Leads Change and Food systems joined (D-07.8);
**Brake Even was then removed to the archive** on the client's later ruling, so the
register is **seven rows, not eight**: 01 the photograph, then six rungs. Bridge the
Gap carries his current figures — a module-based curriculum on land, water and air,
**five to sixteen sessions** (superseding the PDF's 12–16), plus exposure trips and
action projects — and its two readouts became **100–150 schools in Delhi, every year**
and **50,000+ students, over fifteen years**, so both readings now state their span.
The historical "250+ schools" is gone: showing a cumulative total beside an annual one
with no period on either was the real defect. Influence now says what it is —
*volunteering and a fellowship, nationwide*.

The desktop cap went 6 → 7 rungs and stays there with six present, so the boundary
row is dormant rather than lying. **The register cost nothing at 375 or 1440**: the
lead column runs taller than the register at both, so the new rungs fit inside its
headroom.

**Band 7 — Campaigns + Events.** Oye Dilli removed, so the campaigns are three.
**The march's stride widened from 8% to 12% to hold the same 24% terminus** — what
makes a march a march is the distance it travels, not the size of its stride, and a
three-step diagonal stopping at 16% reads as one that was cut off. The displayed cap
came down 4 → 3 at the same time, so a fourth campaign trips the boundary row instead
of landing at the third's indent and flattening the march. Phone march likewise 0/18/36px
for the same reason, and the two now-duplicate phone cap rules were removed.

The events strip is the client's four names — Yamunotsav · Cyclothon · Greenathon ·
Yamuna Shramdaan. His caveat governs the framing (*"these events are from the past
mostly… on homepage it shows depth"*), so **it is a record, not a calendar**: the label
reads *"Events, on the record"* before the reader meets a name, and the note says
outright *"Every one of these has been run. It is a record of what we do in public, not
a calendar of what is next."* There are **no dates, editions, years or counts** anywhere
in it. **The Remakery sentence is gone** — its figures are genuinely sourced but they
describe events no longer named in the strip, so under these four names they would have
attached real numbers to the wrong things.

**Band 8 — Swechha Farm, re-copied (in scope from mid-session).** Two stories, one
band, one button.
- **The hook is an absence:** *"Nothing grew here. Five acres of barren ground is now a
  food forest and a working farm — and a classroom that school groups come to for a
  day, or stay in overnight."* That is band 3's rhetorical shape (a negative the band
  then answers) and it deliberately avoids the numeric-range form, because the Impact
  strip already runs 5%→90% on the Vasant Kunj park and two range sentences on one page
  would read as one sentence told twice.
- **The inventory is the answer**, as one continuous run at caption size under the
  label *"What grows there now"* — not cells, not icons, not eleven equal boxes. The
  density is the argument; a barren field does not have a manifest.
- **It sits inside the lede column, and that is measured, not tidy.** Three placements
  at 1440: own full-measure row with the act stacked under it **1,131.72px**; same row
  with the act in the right margin **1,024.13**; inside the lede column **1,006.09**.
  The third won on the void rather than the 18px — as a separate row it left **396px of
  dead left column** under a three-line lead, which is the same defect this band's CSS
  comment was written to close, only mirrored.
- **It is not in the readout panel** because the panel is `display:none` at ≤759, and
  the transformation's evidence cannot be the one thing that disappears on a phone.
  **The panel is byte-for-byte what it was**: 5 ACRES and 90 MINUTES FROM DELHI, D-07.3
  untouched.
- CTA relabelled *"Visits, camps and retreats"* — "Visit the farm" undersold a band
  that now offers day visits, overnight camps, team meetings and retreats.
- Cost: **687.56 → 841.25 at 375** (inside the ~900 cap) and **870.56 → 1,006.09 at 1440**.

**Band 10 — the archive sheet filled (D-07.14).** All 27 cells carry photographs.
The sheet is a truth device under a tally reading `7/27 YEARS SCANNED`, so **four marks
keep a placeholder unmistakable**, verified programmatically as exactly two treatments
across 27 cells with no third variant:

| | scanned (7) | placeholder (20) |
|---|---|---|
| frame | `duo`, ramp to 0.77 | `duo-dim`, ramp to 0.43 — flatter, sepia |
| hatch | none | **retained**, now over the photograph |
| outline | solid | **dotted** (`.tag-demo` grammar) |
| year chip | dark ground, paper type | **inverted** — paper ground, ink type, dotted border |

The chip inversion is doing the most work: a date chip is a record's claim and a
placeholder makes none, and inverting keeps the year legible over any frame where
dimming it would not. Read at 1:1 at 1440 and at 375 — the distinction is
unambiguous at both. **The tally is untouched and still true**, and the note is
rewritten in the same plain register: *"Seven of the twenty-seven years are scanned.
The other twenty are placeholder frames under hatching — a box nobody has opened yet.
The hatch comes off when a real scan goes in."* **No placeholder alt text claims a
year** — verified: only the seven real scans carry a year in `alt`. Cost: **+19.56px
at 375** (the note went from two lines to four), which is the whole price of the change.

## 2. The height ruling (D-07.11) — take nothing, and say why

**Ruling: the page ships at full length. No trade from §9 is taken, and Record is not
redesigned.**

The decisive number is that **the ~8,200 phone target is unreachable even if every
available cut is made.** At 375×812 the document is **10,033px**. Taking all seven §9
trades (−991) lands at 9,042. Closing Record's entire 493.48px breach as well lands at
**8,548.52 — still 348.52px over** — and that is with the smell banner gone, the WHAT
WE DO definitions gone, the lead project's photograph gone, and a band outside this
chapter redesigned. Every one of those trades spends something the client asked for by
name or approved on 21 August, to buy a target that still is not met. That is a losing
exchange at any price.

**The chapter is not where the excess lives, and it got cheaper this session.** At 375
it now costs **5,157.64px against 5,207.95 on arrival — 50.31px less** while absorbing
a fourth journey, two new projects and the client's fuller Bridge the Gap copy. At 1440
it is 6,178.76 against 6,278.54, **99.78px less**. Per section it runs **736.8px against
the 865.5 the five-section version it replaced cost — 14.9% cheaper.** That per-section
figure is the honest budget to hold going forward; 8,200 was set when the page had five
body sections and it was never restated when the client asked for seven.

**Where the +123px since arrival actually went** (9,910 → 10,033 at 375×812):

| | change |
|---|---|
| the chapter | **−50.31** |
| band 8 farm, second story added | **+153.69** |
| band 10 record, rewritten note | **+19.56** |

**Record is documented, not touched beyond what the client asked.** It is 1,393.48px at
375, **493.48px over its own ~900 cap, and the only band on the page over it.** Measured
breakdown: head 155.5 + doors 421.1 + archive block ~643 + tier padding 174. Closing 493
means removing a third of the band — the three doors or the archive sheet — and both are
compositions the client endorsed *this session*. Redesigning a frozen band unreviewed, at
the moment he asked to stop moving, is the wrong trade against a provable byte-identity
guarantee. **It is the first item of the next pass, with the breakdown above.**

## 3. The merge, and what was removed

Located marker to marker, never by line number, from a byte backup at
`public/design/v3/home.html.bak-20260821-pre-ad7-merge`.

The splice was verified by reconstructing it independently and asserting
`merged == fork` **byte for byte — true**, which validated both the fork and the method
before anything was written.

**CSS removed** — 33,636 bytes, six blocks: `3. STATEMENT`, `4. JOURNEYS`, `5. WORK`,
`6. TIMELINE — THE PAUSE`, `7. IMPACT`, and the whole `AD-04. THE RESTRUCTURE` block.
**CSS added** — 44,634 bytes, the seven AD-07 blocks. Later in the session two more rules
were removed as dead: `.s-record-cell.s-record-off` and `.s-record-off .s-record-yr`,
orphaned when the archive holes became placeholder frames, plus the two duplicate phone
campaign-cap rules.

**Stale-selector check, run as a before/after control.** Classes used in markup with no
CSS rule: before the merge `delayed, im, rn, rp, s-impact, s-journeys, s-run-more-t,
s-ticker-date`; after, `delayed, rn, rp, s-ticker-date` plus the five `w7-ab, w7-ce,
w7-do, w7-im, w7-jr` section hooks. **The four survivors are pre-existing, in the frozen
ticker markup, and are not this pass's.** The five new ones are section-level hook
classes with no rule of their own — sections are styled through their id in this file
(`#journeys{background:…}`), which is the established pattern. Not defects.

**Frozen regions, byte-identical by exact string comparison against the pre-merge
backup.** Bands 8 and 10 are deliberately excluded, having come into scope:

```
IDENTICAL  markup: <body> -> band 3   (header + hero + ticker)     26,716 bytes
IDENTICAL  markup: band 9 Green the Map                             1,034 bytes
IDENTICAL  markup: band 11 give -> </html>                         13,193 bytes
IDENTICAL  css:    :root tokens -> end of band 2 ticker block      86,640 bytes
IDENTICAL  css:    band 9 green the map block                       1,495 bytes
IDENTICAL  css:    band 11 give block                               2,512 bytes
```

The farm's ruled facts survived the rewrite and were checked as strings: "Five acres",
"an hour and a half from Delhi", "Minutes from Delhi", the `5` and `90` readouts. Green
the Map's wordmark is `.d1` with its `clamp(2rem,4.4vw,3.4rem)` cap.

## 4. The final measured state

**Document height:** 375×812 **10,033** · 414 9,762 · 560 9,328 · 768 10,246 ·
901 10,014 · 1024 9,342 · 1440×900 **10,733** · 1920 11,040.

| band | 375×812 | 1440×900 |
|---|---|---|
| hero *(frozen)* | 716.89 | 825.00 |
| ticker *(frozen)* | 116.45 | 111.16 |
| say | 417.05 | 488.55 |
| what we do | 741.28 | 1,013.83 |
| journeys | 833.20 | 1,058.08 |
| projects | 893.48 | 1,112.66 |
| campaigns + events | 784.11 | 1,009.78 |
| about | 890.33 | 944.89 |
| impact | 598.19 | 550.97 |
| **chapter** | **5,157.64** | **6,178.76** |
| farm *(re-copied)* | 841.25 | 1,006.09 |
| green the map *(frozen)* | 325.58 | 336.09 |
| record *(sheet filled)* | 1,393.48 | 1,236.17 |
| give *(frozen)* | 861.13 | 679.16 |

- **Phone cap: every chapter band is inside ~900 at 375.** Tallest is projects at
  893.48, then about 890.33 and journeys 833.20. Farm is 841.25 despite gaining a whole
  second story. **Record at 1,393.48 is the only band over the cap on the page.**
- **Ground adjacency: zero clashes at all eight widths.** No two adjacent bands share a
  computed ground anywhere.
- **`document.scrollWidth === window.innerWidth` at all eight widths.** The archive sheet
  was checked separately after being filled — `overflowsBlock: 0` and
  `scrollWidth === clientWidth` at 375, 414, 768 and 1440; an apparent clipping in a 2×
  capture was a misread of the downscaled render, not geometry.
- **Console clean and no failed or ≥400 responses** at 375 and 1440.
- **Contrast, everything new: minimum 6.01:1**, on `.s-record-note` — a pre-existing
  `--ink-3`-on-paper pairing in the record band whose text I changed but whose token I
  did not. Next lowest 6.14:1 (`Events, on the record`, the same token, size and ground
  as the frozen ticker's own cell labels) and 6.53:1 (journeys sub-labels, the band's
  existing pairing). Placeholder year chip 7.69:1, scanned chip 10.60:1, farm inventory
  11.53:1, farm hook 18.33:1. Every pairing clears AA by at least 33%.
- The journeys route line's hairline is `--hair` at 1.72:1 against `#0D0D0B` in the
  768–1279 fold. That is **the identical declaration the phone rail already shipped**,
  applied in a second place — a compositional hairline, not a boundary carrying meaning
  alone. Recorded so it is not read as new.

## 5. Do not silently "fix" these

1. **`.w7-jr-meta{min-height:3em}`** — looks like dead space on the two cards whose
   sub-label is one line. It is deliberate and it costs nothing; removing it returns the
   1/2/1/2 caption rag.
2. **The journeys 768–1279 two-row fold**, and `min-width:38%` in particular. That value
   is what forces exactly two per line at every width in the range; a smaller one gives
   a 3+1 break.
3. **The projects register cap at 7 rungs with 6 present.** The boundary row is dormant
   by design, not misconfigured.
4. **The campaigns march at 12%, cap 3.** Reverting to an 8% step truncates the diagonal.
5. **`.s-record-ph`'s four marks.** Do not tidy the hatch away, do not let placeholders
   match the scans, and **if a placeholder ever becomes a real scan, the `7/27` tally and
   the note must change in the same commit.** Placeholder `alt` must never claim a year.
6. **The farm inventory lives inside `.s-farm-lede`**, not as its own grid row. Moving it
   out costs 396px of void, measured.
7. **The About year rails at `--rl-h:1.05em`** and **the Impact from-line height
   reservation** — both are the lead's post-delivery fixes and both had a measured defect
   behind them.
8. The five `w7-*` section hook classes have no CSS rule. Intentional.

## 6. Still open

1. **Impact tile 1's wording — the one open copy item.** The client has **parked** it and
   the already-approved *"Children and young people reached since 2000"* stands; it is not
   to be re-raised in this pass. For whoever picks it up: `2026-08-21-SOURCE-FACTS.md`
   records that he derives 3 million from **100–150 schools a year**, i.e. a whole-school
   exposure extrapolation of roughly 1,000 children per school per year — not the
   documented 50,000-students-in-250-schools curriculum count. Any rewording should make
   the reach frame explicit, since the band promises a method note behind every figure.
2. **Record's 493.48px phone breach**, with the measured breakdown in §2. First item next
   pass.
3. **"A campaign pushes. An event invites."** is approved copy describing the two *kinds*,
   but the events are now framed explicitly as past. Mild tension, flagged not fixed.
4. **The detail pages now contradict the homepage.** `project-she-leads-change.html` and
   `project-food-systems.html` are both stamped "Demo content — not verified" while the
   homepage now carries the client's real lines for both; `journeys-cityscapes.html` still
   shows the half-day duration, not 2–4 hours; `journeys-naturescapes.html` has no 60+
   figure. These need a pass before anything ships.
5. Carried from `SOURCE-FACTS`, not for this pass: "Delhi I Can't See You" is in neither
   source, and "Spotted. Stop It!" is live on swechha.in but absent from the homepage.
6. **The `.rise` reveal system still has no `setTimeout` safety net** (§8.1). Unchanged,
   still out of scope, still one observer failure from invisible content.
7. `gram-anubhav-hero.jpg` carries the same "screenshot of a printed page" fault that was
   just fixed in `gram-anubhav-shramdaan.jpg`. Not used on the homepage.

## 7. Files under `public/design/` now superseded — safe to delete

The live homepage is `public/design/v3/home.html`. Per D-07.12 the frozen `v3` pages stay.
**I have deleted nothing.**

**Safe to delete — old prototypes and dead option sets (~3.6MB):**
```
public/design/v2/                     (4 files)   320K
public/design/explore/                (6 files)   208K
public/design/v3/_ad2b/               (6 files)   1.0M
public/design/v3/_ad3/                (6 files)   944K
public/design/v3/_ad4/                (5 files)   808K
public/design/v3/_ad7/                (1 file)    232K   the fork — merged, and now stale
public/design/homepage-final.html                 108K
public/design/situation.html                      112K
public/design/home.html                            50K   superseded by v3/home.html
public/design/index.html · options.html · v3.html        superseded design boards
public/design/internal.html · about.html                 superseded by v3/about.html
public/design/_options-journey.html
public/design/_options-journeys-landing.html
```

**Safe to delete — review harnesses and backups:**
```
public/design/v3/_review.html · _options.html · _mobile.html
public/design/v3/_ad3/_compare.html · v3/_ad4/_compare.html   (inside the dirs above)
public/design/v3/home.html.bak-20260820-premerge   196K
public/design/v3/home.html.bak-20260821-pre-ad7-merge         delete after this freeze is accepted
```

**Do NOT delete — keep:**
```
public/design/v3/{home,about,intelligence,situation-air,situation-yamuna,situation-soon,system}.html
public/design/img/ · tokens.css · credits.json
public/design/journeys-*.html · projects-landing.html · project-*.html · events-landing.html
```
The journey and project detail pages are outside `v3` and read like old prototypes, **but
they are the only designs that exist for the routes this homepage's buttons point at**, and
open item 4 above is a live instruction to correct them. Deleting them destroys design work
with no replacement. They should be brought into `v3` and corrected, not removed.
