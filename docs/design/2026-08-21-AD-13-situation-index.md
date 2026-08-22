# AD-13 — THE SITUATION INDEX (`/now`): layout and section architecture

**Date:** 21 August 2026
**Deliverable:** the design layout and defined sections for one page, per the client's
21 August instruction. **Not finished editorial copy, and not a build.** Nothing in
`public/design/`, `app/`, `components/` or `lib/` was written or edited; this file is the
only output.
**Brief:** `docs/design/2026-08-21-AD-13-situation-index-brief.md`.
**Outranked by:** `DECISIONS-2026-08-20-homepage.md` (D-11.1 → D-11.4),
`BRANDING-2026-08-21-frozen-language.md`.

**Method note, and it bounds every number below.** No browser was run and no pixel was
measured. Every height in this document is a **budget estimate arithmetic'd from the
frozen page's own token values**, with the arithmetic shown and the source cited, and it
is labelled as an estimate everywhere it appears. Where I state a value of the frozen
page I cite `home.html:<line>`.

**Citation convention for the prototype.** `intelligence.html` is 887 lines but its
markup is **minified onto a single line — line 765, 31,402 characters.** `file:line` is
therefore useless for its markup, so prototype markup is cited as
`intelligence.html:765:col<N>` (zero-based character offset within line 765, which is
stable and greppable). Its CSS (lines 9–760), footer (767–791) and JS (793–885) are cited
as normal line numbers.

---

# REVISION 1 — 21 August, later. Three bands challenged; two cut, one defended.

## R.0 The challenge, verbatim

> *"Do we need to put what is in season, what is ordered, and what cadence blocks on this
> page? Anyway we have situation specific info in respective situation page. Ask the art
> director, this seems unnecessary, we ofcourse can have the methodology used, purpose of
> having this or doing this, work in progress, how data should inform action, data should
> inform policy."*

**The client's instinct is better than my spec, and the test they applied is the right
test.** An index whose bands are each a second copy of what six inner pages will say is a
redundant page, and the one thing an index can do that no inner page can is state the
*why*. I had built a register and called it an instrument. Conceded.

But the test gives **different answers for the three bands**, and applying it honestly is
more useful than accepting or rejecting the challenge wholesale. Two of the three fail it.
One passes, for a reason that is invisible from outside the file.

## R.1 Verdict on each band

### `#orders` — CUT. The client is straightforwardly right, and I over-read the ruling.

D-11.1 says *"The idea is kept **in the spec** as a named future section so the composition
reserves its place."* **In the spec** — not on the page. A specification can reserve a
place without the page rendering 152px of apology for it, and this document is where the
reservation belongs. §5 band 5 of the original is replaced by §R.6 below, which keeps every
constraint on the band's eventual return and renders nothing.

Two further reasons, both now decisive:

1. **The only thing that earned it pixels is gone.** D-11.6 re-pointed the Record door away
   from `#orders` onto the provenance band (`home.html:4079`), on the client's own
   instruction. With no inbound link and nothing to link out to, the band would be a
   **section nobody can reach that goes nowhere** — and §5.8 requires every section to carry
   a button, which one with no contents cannot.
2. **The site's own grammar forbids it.** `BRANDING §4.3`: *"A value is not known yet → the
   row or cell **does not render**, reusing the closed-window grammar. Its absence is the
   honest form."* A section whose entire content is a statement that it has no content is a
   designed absence, and the through-line licenses that only for *marked placeholders under
   review* (D-03.3), which is about judging a design at full strength, not about shipping.

### `#windows` — the RULE survives, the TABLE is cut. The client is right about the half I would have defended least.

The band held two different things and only one of them is situation-specific.

- **The table** — six rows of window ranges — **is** per-situation reference data, and it
  **will** be on every situation page by construction: the `.tag-season` window tag is one
  of the components of the six-part reading itself (`home.html:643`, `BRANDING §4.1`), so a
  situation page cannot render its reading without rendering its own window. The client is
  right. **Cut.**
- **The rule** — why the page's length changes, why a shut situation is absent rather than
  greyed — is a property of the index and of nothing else. **No situation page can state
  it**, because a situation page renders only when its own window is open, so a reader on
  the Air page never experiences a changing set. It survives.

**The rule does not need a band.** It is already in the masthead — `#top`'s `.lead` slot was
specified as *"the window rule as a sentence, carrying no count"* (§6.1), costed at 118px —
and the full two-shapes explanation ports whole into the new `#rules` band as one row (H18,
§6.2). **Net: ~780px saved and nothing lost that the index uniquely owed.**

**Two things the client's instinct resolved that I had to flag as open.** First, my own Q-C
asked whether `#windows` may name a situation whose window is shut, since D-11.2 forbids
rendering it — the table was always in tension with the ruling, and cutting it **dissolves
the question entirely**. Second, D-11.5 does *not* become moot: the six windows are still
needed, because `getActiveSituations()` (`lib/content/index.ts:103`) filters on `status`
with no date logic at all, so "a closed window does not render" is still enforced by an
editor remembering. **The windows move from being a table's contents to being a mechanism's
inputs. The request stands; only its destination changed.** Flagged because cutting the
table could easily be read as cancelling D-11.5, and it does not.

### `#sources` — KEPT, and I have to disagree with the client here, for three reasons.

**This is the one place I am not conceding, and the strongest evidence is a link audit.**

**Reason 1 — it is the only band on the page anything links to.** Grepped across
`public/design/v3/*.html` and `app/`:

| anchor | inbound links |
|---|---|
| `#method` — the provenance band's id on the prototype, which this document renames `#sources` | **1** — `home.html:4079` |
| `#windows` | **0** |
| `#orders` | **0** |
| `#colour` | **0** |

**The two bands I am cutting have no inbound link. The band I am keeping has the page's
only one** — and it is the door D-11.6 amended *hours ago, on the client's instruction*.
Its new copy (`home.html:4082`) promises: *"Every source behind the readings, with its
cadence, the date it was last drawn, and whether it is running."* That is a four-part
promise and it is **verbatim the four data columns of the cadence table**. If `#sources`
goes, that door has nowhere honest to land, and we would have traded one broken-promise
door for another inside a single day. **Stated plainly, as asked: cutting `#sources`
requires going back to the client about a door they have just approved.**

**Reason 2 — and this is the better argument, because it does not depend on a link: the
cadence table is not situation-specific information.** Its rows are **sources, not
situations.** One source feeds several situations and several situations share a source —
the original document already noted this in passing (*"Heatwave's absence removes no row,
because IMD still feeds Climate Event"*). So:

- On Climate Event's page, IMD's cadence appears once, in Climate Event's context.
- On Heatwave's page, IMD's cadence appears again, in Heatwave's context.
- **Nowhere on any inner page can a reader see that both readings rest on the same unwired
  source.**

That is a fact about the *instrument*, not about any situation, and only the index can
state it. And it is the fact this page most needs to state, because `AD-12 §2.1` established
the honest count: **none of the seven feeds is wired.** A reader who visits five situation
pages and reads PERIODIC five times learns five small things. A reader who sees one table
with seven rows and no LIVE anywhere in the state column learns the one big thing. That
difference *is* the difference between per-situation data and a property of the whole.

**Reason 3 — it is the client's own "work in progress", in the only form this site
accepts.** The client asked for a work-in-progress statement. **The most honest one this
project can make is a table with seven rows and not one LIVE chip in it.** That is not a
mission statement, it is a receipt. So the band the client asked to cut is already one of
the four things they asked for, mislabelled — and the fix is to stop calling it a cadence
block and reframe its head and its lead accordingly (§R.5). Moving level-two provenance
into prose would replace evidence with a claim: a sentence saying *"none of our feeds is
wired"* is an assertion; seven named rows with seven state chips is checkable. On a site
whose whole argument is *we show you the source*, that is the wrong direction.

`BRANDING §4.5` also requires two levels of provenance and defines level two as the
page-level table; the brief for this page lists it as a deliverable in those words. Level
one travels with the reading wherever the reading is. Level two has exactly one possible
home.

## R.2 What replaces them — two bands, and the honest cost

The client named five things: methodology, purpose, work in progress, data→action,
data→policy. They are not five bands.

- **Work in progress** is not an argument, it is a status, and its honest form is the
  `#sources` table (R.1, reason 3). It needs no band of its own.
- **Purpose**, **data→action** and **data→policy** are one argument — *a record exists in
  order to be acted on* — and splitting them makes three weak bands.
- **Methodology** is its own thing, and it is the band that absorbs the window rule.

So: **`#rules`** and **`#why`**. Compositions in §R.4 and §R.7.

**The uncomfortable finding, stated first rather than buried: this change makes the page
longer, not shorter.**

| | 375 est. |
|---|---|
| cut — `#windows` 819 + `#orders` 152 | **−971** |
| added — `#rules` ~880 + `#why` ~894 | **+1,774** |
| `#sources` reframed (a longer lead) | +21 |
| **net** | **≈ +825px** |

Estimated document **~5,546px at 375×812**, against ~4,720 in the original — still about
half the frozen homepage's 10,244 (`BRANDING §1.1`).

**I think it is the right trade and I would take it, but the client should take it knowing
the direction.** The 971px removed was a second copy of six inner pages. The 1,774px added
is the only place on this site where the *why* is stated at all. The problem was never
volume; it was redundancy, and the fix for redundancy is not always a shorter page.

**One cost that is not pixels, and it is the real risk this revision introduces: four of the
six bands now have under 100px of headroom against the 900px cap** — `#why` ~6, `#rules`
~20, `#legend` ~36, `#sources` ~100 — where the original had two. §R.10 names what gives if
one breaches, and it is copy length, which is all slots. Not the composition, not the type
size, and not a damaged component (`BRANDING §6.4`).

## R.3 The band ledger, revised

| # | id | tier | ground token | hex | single hue | purpose | 375 est. | v1 |
|---|---|---|---|---|---|---|---|---|
| 1 | `#top` | t2 | `--ground` | `#0D0D0B` | mustard (interface) | the masthead — unchanged | ~526 | = |
| 2 | `#readings` | t2 | `--ground-2` | `#151512` | **red** | the set, as readings — unchanged | ~800 | = |
| 3 | **`#rules`** | t2 | `--paper` | `#F3F2F0` | none | **NEW** — the methodology, as five rules the rest of the page is the evidence for. Absorbs the window rule | ~880 | new |
| 4 | `#sources` | t3 | `--ground` | `#0D0D0B` | none | **REFRAMED** — what is wired and what is not. The work-in-progress receipt | ~800 | 779 |
| 5 | `#legend` | t2 | `--paper-2` | `#ECEBE8` | red + mustard, as specimens | the vocabulary — unchanged, and not challenged | ~864 | = |
| 6 | **`#why`** | t2 | `--ground` | `#0D0D0B` | mustard (interface) | **NEW** — the argument: what a record is for, in three doors | ~894 | new |
| — | `footer` | (t4 padding) | `--ground-2` | `#151512` | none | verbatim from `home.html:4168–4213` | ~726 | = |

**`#windows` and `#orders` are gone.** Six content bands before, six after — the count is
unchanged and I am not pretending otherwise. What changed is that **every one of the six now
passes the client's own test.** Applied band by band, "could a situation page do this
instead?":

| band | could an inner page do it? |
|---|---|
| `#top` | no — it is this page's identity |
| `#readings` | no — an inner page shows one reading; only the index shows the set |
| `#rules` | no — the rules govern the instrument, not a situation |
| `#sources` | no — its rows are sources, and sources cross situations (R.1, reason 2) |
| `#legend` | no — D-11.2 assigned the vocabulary here explicitly |
| `#why` | no — this is the argument, and no inner page is the right place for it |

The two that failed are the two that went.

### Naming — and a near-miss worth recording

**The methodology band is `#rules`, not `#method`, and that is deliberate.** The prototype's
*source* table is `id="method"` (`intelligence.html:765:col27007`), and D-11.6's comment on
the frozen page states the mapping: *"Anchor is #method because that is the band's id in the
pre-freeze prototype; AD-13 renames it #sources, and BOTH become /now#sources in the route
pass."* Naming a **new** band `#method` would make that documented mapping ambiguous and
land the door on the methodology band rather than the provenance band it promises. This
project has been bitten by exactly that: the `#statement` → `#work` rename left a stale
`#work{background:var(--ground)}` rule that *"after the rename, had silently landed on band
3"* (`DECISIONS:778–781`).

### R.3.1 Adjacency, re-checked mechanically

```
#0D0D0B → #151512 → #F3F2F0 → #0D0D0B → #ECEBE8 → #0D0D0B → #151512
   1         2         3         4         5         6       footer
 #top    #readings   #rules   #sources  #legend    #why     footer
```

| pair | hexes | same? |
|---|---|---|
| 1 → 2 | `#0D0D0B` → `#151512` | no |
| 2 → 3 | `#151512` → `#F3F2F0` | no |
| 3 → 4 | `#F3F2F0` → `#0D0D0B` | no |
| 4 → 5 | `#0D0D0B` → `#ECEBE8` | no |
| 5 → 6 | `#ECEBE8` → `#0D0D0B` | no |
| 6 → footer | `#0D0D0B` → `#151512` | no |

**Zero clashes — and the revision is cleaner than the original here.** The alternate-dark
step drops from **two occurrences to one that needs a weight argument**:

- **1 → 2** — a picture-free type wall gives way to the page's only instrument object, a
  41.6px numeral with a 6px red rail. Weight cut present, unchanged from v1.
- **6 → footer** — the second dark-to-alt-dark meeting, and it needs no weight argument
  because **the footer draws its own boundary**: `border-top:1px solid var(--hair)`
  (`home.html:948–949`, `BRANDING §5.9`). It is the one band on the site that declares its
  own seam with a rule rather than a colour change, which is why the frozen page never has
  to solve this pair.
- The v1 sequence's weaker step — `#sources` t3 → `#orders` t4, carried only by a padding
  ratio — **is gone with the band.**

**Two adjacent papers still rejected.** `#F3F2F0` against `#ECEBE8` is ~1.03:1 apart and
would read as one band; bands 3 and 5 are separated by band 4 on purpose.

**Bands 1 and 6 share `#0D0D0B` as bookends**, which is now intentional: the page opens and
closes on the same ground, the way `BRANDING §5.9` describes the footer wordmark — *"the
page closing the way it opened."*

### R.3.2 Hue, re-checked

| band | hue live |
|---|---|
| `#top` | mustard only, interface |
| `#readings` | **red** — the only band carrying readings |
| `#rules` | none. It *describes* red's job in words; a rule is not a reading |
| `#sources` | none. `.state` chips are `currentColor` and never red, green or mustard (`home.html:295`) |
| `#legend` | red (paper face, `--red-ink`) + mustard, both as labelled specimens |
| `#why` | mustard only — three door arrows and one CTA. Mustard is the interface layer, not a band hue (`BRANDING §3.2`) |

**Red now appears in exactly one band. Green appears nowhere. No exemption is invoked
anywhere on the page.** Cleaner than v1, which had red in two.

### R.3.3 Phone budget, revised

| band | 375 est. | headroom | basis |
|---|---|---|---|
| `#top` | ~526 | 374 | unchanged, §5 band 1 |
| `#readings` | ~800 | 100 | unchanged, §5 band 2 |
| `#rules` | ~~~880~~ → **~839** | ~~20~~ → **60.7** | **§R.16.4** — re-derived on the measured `.w7-pj-rt` title size |
| `#sources` | ~800 | 100 | §R.5 |
| `#legend` | ~864 | 36 | unchanged, §5 band 6 |
| `#why` | ~~~894~~ → **~869** | ~~6~~ → **30** | §R.12.4, on the measured three-door figure |

**No band asks for a 900px licence.** The exception list stays at two (the heroes, and
`record` by name — D-09.7). But see §R.10: two of these have twenty-pixel-or-less headroom
and both estimates rest on a line count no document can settle.

## R.4 NEW BAND 3 — `#rules`: the methodology · t2 · `#F3F2F0` · no hue

**The trap named in the challenge: this site does not do mission-statement prose.** So what
does it do instead? The evidence is consistent. `#say` is one aphorism with **no button at
all** (D-07.10). `#work` opens on *"The numbers are not the work."* The Record band's lead
is *"Four things accumulate here whether or not anybody writes a post: the daily readings,
the orders that follow them, the things you can do about them, and the paper since 2000"*
(`home.html:4058`) — a list of **kinds**, stated as a plain sentence, with no count
attached. **The site's grammar for "why" is a short declarative sentence followed by a
structure of named parts.** Never a paragraph of intentions.

**So the methodology is a register of rules, not an essay — and every row is a rule the rest
of the page is the visible evidence for.** That is the composition, and it is what makes
this band an argument rather than a claim: a reader can check row 02 against every `.src`
line on the page, row 04 against every `.state` chip, and row 03 against the fact that
there are five situations and not six. **The band states a rule; the page keeps it in front
of them.** That is how this site earns a "purpose" section.

**Component: the register / ledger rows** (`BRANDING §5.5`, the `.w7-pj-*` family) — ruled
rows, `border-bottom:1px solid var(--rule)` with the last on `--rule-2`, each row an
**ordinal** (`--ink-3`, `tabular-nums`) · **title** · **fact line** (`--ink-2`, 13.5px).
Nothing new is invented.

> **CORRECTED BY §R.16.2.** The title is **`.w7-pj-rt`** (`home.html:2424–2427`) —
> `'wdth' 78,'wght' 800`, `clamp(.98rem,1.15vw,1.12rem)` = **15.68px at 375**,
> `line-height:1.05`. It is **not** `.w7-pj-t` 74/800, which `BRANDING §2.2` documents and
> which is the register's single **lead** row at 20.8px. Copy the rule; never retype the
> numbers.

**Ordinals are safe here and this is why.** `BRANDING §5.5`: *"Row ordinals stay. Stated
totals do not. An ordinal numbers a sequence… a total is a number the design depends on."*
These five rows are the page's own rules — a fixed set, not data — so the band is
count-independent by construction and no boundary row is needed.

```
1440, .wrap = 1148                                375, .wrap = 335
┌────────────────────┬──────────────────┐        ┌───────────────────────────────────┐
│ .im-head  .d1 head │ .lead  the claim │        │ .im-head   .d1 + .lead      228   │
├────────────────────┴──────────────────┤        ├───────────────────────────────────┤
│ 01 │ EVERY READING AGAINST ITS LIMIT  │        │ 01  EVERY READING AGAINST ITS     │
│    │ fact line, --ink-2, 13.5px       │        │     LIMIT                         │
│────┼──────────────────────────────────│        │     fact line                     │
│ 02 │ EVERY READING NAMES ITS SOURCE   │        │ ───────────────────────────────── │
│────┼──────────────────────────────────│        │ 02 … 03 … 04 … 05 …               │
│ 03 │ A SITUATION IS HERE WHILE ITS    │        │     five rows, ruled, stacked     │
│    │ WINDOW IS OPEN   ← the window    │        │     ≈ 600 for all five            │
│────┼─────────────────── rule lands here│       ├───────────────────────────────────┤
│ 04 │ NOTHING CLAIMS LIVE UNTIL WIRED  │        │ .cap  closing clause         78   │
│────┼──────────────────────────────────│        │ .act  one CTA                48   │
│ 05 │ WHERE THE RECORD IS MISSING, THE │        └───────────────────────────────────┘
│    │ PAGE LEAVES THE HOLE SHOWING     │              t2 pad 112  →  ≈ 880px
│    │ last row on --rule-2             │
├───────────────────────────────────────┤
│ .cap   closing clause                 │
│ .act   one CTA → a rule kept          │
└───────────────────────────────────────┘
```

**The five rows, as copy slots** — titles are **NEW COPY needing approval**; the fact lines
are slots. Rows 01, 03 and 05 recover approved or ported strings.

| # | rule | where its text comes from | verifiable on this page against |
|---|---|---|---|
| 01 | Every reading against its published limit | **the frozen method line, reused** (D-01.12, approved, never-rewrite). Its fact line explains that a breach is derived from a stored limit and never typed, and that where no limit exists the page says so in words | every `.limit` line |
| 02 | Every reading names its source, its scope and its hour | **NEW.** Fact line = level-one provenance | every `.src` line |
| 03 | A situation is here while its window is open | **NEW title; the fact line is H18, ported whole** — *"Two shapes of window… A recurring season repeats every year and says when it returns. A one-off window has a real end and never comes back."* **This row is what `#windows` becomes** | there being five situations and not six |
| 04 | Nothing here claims to be live until a feed is wired | **NEW.** Fact line = the four-word vocabulary and why it is never conditional | every `.state` chip |
| 05 | Where the record is missing, the page leaves the hole showing | **the through-line, verbatim** (`BRANDING §4.3`, D-03.3) | the door row's second fill (§6.4) |

**Budget basis, and it is a comparison rather than a per-element sum, deliberately.** I
cannot measure a register row's height from a document, and a per-element arithmetic here
would be a guess dressed as a measurement. The citable anchor: the frozen `#projects` band
is **893.48px at 375×812** (`BRANDING §1.1`) and contains an `.im-head` plus up to four
project rows **carrying photographs** plus a boundary row. Five text-only rows plus an
opener, a caption and a CTA is of that order and probably slightly under it, so **~880 is
the estimate and 893.48 is the reason to believe it.** It is the tightest band on the page
after `#why`.

**Two trims held in reserve**, if measurement puts it over: drop the closing `.cap` to two
lines (−39), or merge rows 01 and 02 into four rows (−~120). I would take the `.cap` trim
first — merging weakens the register, and the rows are the band.

**Populates.** **Nothing here is a function of any count**, at any of the three growth
moments. The five rules are fixed. Row 03's fact line is the one thing that changes if the
window mechanism changes; nothing else moves, ever. This is the most stable band on the
page.

## R.5 BAND 4 — `#sources`, reframed · t3 · `#0D0D0B` · no hue

**The composition does not change. The framing does.** It stops being a neutral cadence
block and becomes **the work-in-progress statement the client asked for**, in evidential
form. Structure, columns, ground and budget are as specified in §5 band 4 of the original,
which stands — including the argument for keeping it on dark so its `.state` chips look
identical to the ones the reader has just seen in the deck.

What changes:

1. **The `.d1` head slot** stops describing provenance and starts describing state — the
   band's job is now *what is wired and what is not*, and its head should say that. Slot.
2. **The `.lead` gains the work-in-progress clause.** The honest one is not a sentence of
   intent, it is a pointer at the table: the instrument is not finished, and the state
   column below is how far it has got. **New copy, one or two lines, +21px on the estimate.**
3. **H23 stays exactly where it was** as the band's `.body` (§6.2) — *"…None of the seven
   feeds below is wired yet…"* — and it keeps its own denominator of **seven sources**, which
   must not be reconciled with any situation count.
4. **The inbound door is honoured.** `home.html:4079` → this band, and the door's four
   promises map to the table's four data columns one for one: *"with its cadence"* → Cadence,
   *"the date it was last drawn"* → As of, *"whether it is running"* → State, *"every source
   behind the readings"* → Source. **The band must keep all four columns for the door to stay
   honest**, which is a constraint the original document did not have.

## R.6 THE ORDERS RESERVATION — held here, rendering nothing

D-11.1's reservation, kept in the spec as the ruling asks. **No band, no id, no strip, no
pixels.** When real filings exist with attached documents the section returns, and these are
its constraints:

- It needs an **order content type** and the **source-URL field** the schema lacks (situation
  brief §4 item 5). A door that names a document it cannot attach is the same defect in a
  different output.
- Nothing from the prototype's orders band survives — not one string, and **not its empty
  state**, however good H22's sentence is (*"No order under this theme since the tracker
  opened. That is a finding, not a gap, and it stays on the page."*). An empty state for a
  tracker that does not exist is a tracker. Recover the sentence when the tracker is real.
- **Not a citation, not a docket, not an authority, not a holding, not a compile date** — the
  band's only implementation was six fabrications, one of which reused the AQI figure 412 as
  a case number (D-11.1).
- **Its ground and tier must be re-picked when it returns**, not inherited from this
  document: the sequence in §R.3.1 has no slot reserved for it, and inserting a band anywhere
  in it re-opens the adjacency check.
- **The frozen Record door is no longer waiting for it** (D-11.6), so the band returns on its
  own schedule with no link rotting in the meantime. That is the one thing that got easier.

## R.7 NEW BAND 6 — `#why`: the argument · t2 · `#0D0D0B` · mustard (interface)

**Purpose, data→action and data→policy, as one argument in three parts.** And it is the last
content band on the page, which is where the page's real ask belongs.

**It comes after the readings, not before them, and this is the site's own rhetoric rather
than a defence of my ledger.** The frozen homepage opens on a reading and puts the argument
third: `#say` — *"A number is not a smell"* — is band 3, and the work chapter's umbrella
line is **"The numbers are not the work"**, a line that only lands *after* you have seen the
numbers. **This site's move is: show the reading, then say what it isn't.** D-01.12 is
directly on point — a tagline explaining what the site *is* was proposed and refused, partly
because *"the statement band one screen down already owns that job, and two mission
statements 900px apart means the weaker one arrives first."* An argument arriving before its
evidence is a mission statement, which is the trap.

**Which is also why `#top` does not change.** The obvious concession to the challenge would
be to move the purpose into the masthead. D-01.12 forbids exactly that: the masthead may
state **method**, not category or purpose — *"It states the method rather than the category,
which is what actually explains an instrument."* The masthead keeps the method line and the
window sentence, unchanged.

**Component: the door cards** (`BRANDING §5.6`, the `.s-record-door` family) —
`grid-template-columns:repeat(3,minmax(0,1fr))`, divided by `border-right` with the last
cleared, `padding-left:clamp(18px,2vw,32px)` on each subsequent door, and row structure
`auto auto 1fr auto` **so the figure row bottom-aligns across all three regardless of copy
length**. That last property is why this component and not a three-column grid: three
arguments of unequal length still land their arrows on one line.

**The figure row carries a destination phrase, not a figure — and that is the corrected
pattern, not a compromise.** Both frozen doors that put a figure there carry one of the
handoff's own unsourced totals: *"9,400 days on file since 2000"*, which `BRANDING §9.1`
records as **unsourced and drifting daily** (2000-01-01 to today is nearer 9,729), and *"34
guides"*, also unsourced. §7.8 forbids a stated total. **No figure goes in that slot.**

**Inherit the 320px fix.** `BRANDING §5.6` records a pre-existing defect: both the eyebrow
and the figure carry `white-space:nowrap` at ≤519, and at 320 the eyebrow needed 128px
inside a 95px track, rendering as *"UPDATED EVERY HOU9,400 DAYS ON FILE SINCE 2000"* while
`getBoundingClientRect` saw two boxes a clean 16px apart. It was fixed post-freeze with a
`@media (max-width:374px)` letting the eyebrow wrap. **Copy that fix, and keep every eyebrow
short.**

```
1440, .wrap = 1148                                        375, .wrap = 335
┌────────────────────┬──────────────────┐                ┌────────────────────────────┐
│ .im-head  .d1      │ .lead  the claim │                │ .im-head             228   │
├──────────┬─────────┴───┬──────────────┤                ├────────────────────────────┤
│ .lbl     │ .lbl        │ .lbl         │                │ door 1  READ               │
│ READ     │ ACT         │ POLICY       │                │ ─────────────────────      │
│          │             │              │                │ door 2  ACT          447   │
│ head     │ head        │ head         │ Archivo 74/820 │ ─────────────────────  (3) │
│          │             │              │                │ door 3  POLICY             │
│ body     │ body        │ body         │ 16px / 1.5     │  stacked; border-right      │
│          │             │              │                │  becomes border-bottom     │
│ ─────────┴─────────────┴───────────── │ 1fr pushes the │                            │
│ dest ▸   │ dest ▸      │ dest ▸       │ row to the foot├────────────────────────────┤
└──────────┴─────────────┴──────────────┘                │ .cap  work-in-progress 78  │
   border-right divides; last cleared                    │ .b-1  the page's one   48  │
   NO FIGURE in the figure row — a destination phrase     └────────────────────────────┘
                                                              t2 pad 112 → ≈ 894px
```

**The three doors, as slots. All copy is NEW and needs approval.**

| door | what it contains | destination |
|---|---|---|
| **READ** | what a reading is worth, and that it is worth what its source is worth. The door that sends a reader back into the instrument | `#rules`, or a situation page |
| **ACT** | data → action. What a reader can actually do with a reading. **`/act` is a real route** (`app/sitemap.ts:14`), so this door has somewhere to go today | `/act` |
| **POLICY** | data → policy, **in the conditional** — see the prohibition below | **`/about`** — closed by D-11.9, §R.16.1 |

### The POLICY door — the prohibition, in full, because this is where an unsourced claim would enter

**There is no evidence base for policy impact anywhere in the record, and I checked.** What
`2026-08-21-SOURCE-FACTS.md` supports is **method**, in the organisation's own words: the
*"Wheel of Change"* (PDF p2) names *research and knowledge creation, media and advocacy,
networking, systemic change*; **Building Narratives for Sustainability** is a cross-cutting
theme covering *research, communication, advocacy*; and the method line is *"the pedagogy of
intensive interaction with the citizens and the governments to engage them in the process of
Change through Campaigns, Events and Programs"*. Two research programmes are named — *Low
Carbon Futures* with IGES funded by UNEP, and *CYCLES for Sustainability* with the
University of Surrey.

**None of that is a policy outcome.** There is not one sourced instance of Swechha's data
changing a rule, a limit, an order or a decision.

**So the door is written in the future and the conditional — and the client's own wording
licenses exactly that: they said *"how data should inform action, data should inform
policy"*. "Should", not "has".** That is the correct tense and it is theirs.

**The door MAY argue:** that a published limit is itself a policy instrument; that a reading
set against a published limit is the unit a regulator, a court or a citizen can act on; and
that a record kept every day is what makes a pattern arguable rather than anecdotal.

**The door MAY NOT contain**, and this is a hard list: any form of *"our data has led to"*,
*"we have influenced"*, *"cited in"*, *"resulted in"*, *"contributed to"*; any named
authority, court, order, docket or ruling (D-11.1 reaches this door too); **any figure of
any kind**; and any past-tense construction a reader could take as a claim of achieved
influence. The precedent for why this matters is D-07.1: *"Audited to 31 March 2026"*
claimed one word more than the record supported, and the word was withdrawn from the site. A
policy-influence claim would be the same failure with more at stake, on a page whose entire
argument is that it never overstates what it knows.

**Budget basis — derived from two published measurements, not estimated.** `BRANDING §6.4`
records `#record` at **1,393.48px at 375** and, in its licensing arithmetic, that *"deleting
all three doors still leaves the band at 946.34px"*. So **three frozen door cards cost
1,393.48 − 946.34 = 447.14px at 375**, gaps included. Therefore: 228 (`.im-head`) + 447
(three doors) + 78 (`.cap`, 4 lines) + 48 (`.b-1`) + 112 (t2 pad) = **913px** — 13 over the
cap. **At a three-line `.cap` it is ~894px and inside.** The band ships with a three-line
closing clause, and that is a copy constraint, not a composition one.

**The closing `.cap` is the work-in-progress statement at argument level**, and it points at
`#sources` for the evidence. Two honest sentences, no figure.

**Populates.** Three doors, fixed — this band is independent of every count on the page.
Growth path: **the ACT door's destination gets richer as `/act` is built; nothing else moves
at any of the three growth moments.** The POLICY door is the one place on the page that
could ever gain a real claim, and it may only do so when a sourced instance exists.

## R.8 Does the deck's role change? No — and the tab-row promotion survives on the same arithmetic

The page's job broadened from *register* to *register plus argument*, so the fair question is
whether `#readings` is still the core.

**It is, and the argument now depends on it.** `#rules`' five rows are rules the deck is the
visible evidence for, and `#why`'s claim only lands after five readings. Both new bands are
*downstream* of the deck. Its job is unchanged and arguably strengthened.

**The tab-row promotion (§5 band 2) survives, and the arithmetic behind it did not move.** It
was justified by the fold, not by the deck's importance: leaving `.rig-tabs` in `.rig-bar`
starts the row at 56 + 228 + 360 = **~644px** into the band against **~635px of
actually-visible iOS Safari** (`BRANDING §6.5`). None of those three inputs changed. And it
matters *more* now: with `#windows` cut, **the tab row is the only object on the page that
shows the whole set at once.** A reader who never discovers four of five readings has missed
more of the page than before.

**Is the `border-bottom` marker flip still worth the risk? Yes — and here is the thing I
should have said the first time.** The flip **does not touch the ring arithmetic at all**:
`padding:5px`, `scroll-padding-inline:5px` and the JS `RING=5` are all unchanged, and only
which edge carries the `-14px` marker pull moves (`margin:-19px -5px -5px` →
`margin:-5px -5px -19px`). **Both historic bugs in this component were about the ring** — 5px
clipped on all four sides, and a row resting at `scrollLeft 5` with the allowance scrolled
off (`BRANDING §5.2`, §6.2) — **not about the marker.** So the flip touches the one number
the bugs were not about. That materially lowers the risk I flagged; the gate stays as
written — ring overhang 0.00 at rest **and after scrolling**, at every width, with the PNG
read.

### One correction the revision forces: it is now THREE inbound anchors, not five, and the number is decaying

**D-12.11 re-pointed two of them while I was writing.** `home.html:3391–3392` now go to
`situation-air.html` and `situation-yamuna.html`; the rule is *"a ticker cell points at its
own situation page if one exists, and at the index otherwise."* Verified at
`home.html:3391–3396`:

| cell | destination now |
|---|---|
| Air | `situation-air.html` |
| Yamuna | `situation-yamuna.html` |
| Forest fire | `intelligence.html#h-fire` |
| Forest loss | `intelligence.html#h-forestloss` |
| Climate Event | `intelligence.html#h-monsoon` |
| Impact slot | `#impact`, in-page |

**Three consequences.**

1. **Every "five inbound anchors" in §3.1 and §7 below is superseded by three.**
2. **The requirement is decaying to zero.** By D-12.11's rule each of the three leaves the
   index the day its situation gets a page. So the hash-selects-panel handler should be built
   **cheaply and guarded**, not engineered — it is scaffolding for a transitional state, and
   it must not become the reason the deck is hard to change later.
3. **A coherence the original document could not see, and it is a better justification for
   the door row than the one I gave.** The three situations whose ticker cells still point at
   the index are *exactly* the three whose door row will read "no page for this one yet." The
   ticker sends a reader to the index **because** the depth does not exist, and the index
   then says so at reading scale. One rule, two surfaces, no contradiction.

Also from D-12.11, reinforcing §11 item 8: the Climate Event cell's anchor is `#h-monsoon` —
a stale name from the nine-situation set — and *"`#h-noise`, `#h-stp` and `#h-waste` stop
existing when the index is cut from nine to six, so any anchor into `intelligence.html` is a
link with an expiry date."* The `anchorId` requirement now carries two defects, not one.

## R.9 What this revision needs from the client

Superseding §9. **Q-A and Q-C are closed** — D-11.6 answered the orders door, and cutting the
windows table dissolves the question of whether it may name an absent situation.

> **ALL CLOSED AS OF D-11.7 → D-11.9. Kept for the reasoning; nothing here is still open.**
> **R-1** `#sources` stays (D-11.7, the pushback accepted) · **R-2** both compositions
> confirmed (D-11.7) · **R-3** no policy-impact claim exists; the door stays conditional and
> the prohibition is now a standing ruling (D-11.8) · **R-4** copy drafted and **approved as
> drafted** (D-11.9, §R.16.5) · **R-5** D-11.5 stands, destination changed · **R-6** the
> +825px accepted knowingly — delivered at **+758** (§R.16.4) · **R-7** the six carried
> questions stand, and are the only open items on the page.

| # | question |
|---|---|
| **R-1** | **`#sources` stays — confirm, or a door you have just approved has to be reopened.** My recommendation is that it stays, for the three reasons in §R.1. If you still want it cut, **D-11.6's amended Record door (`home.html:4079–4082`) has nowhere honest to land**, because its four promises are that table's four columns. That door would have to be rewritten or dropped a second time in one day, and it is your copy on a frozen page. |
| **R-2** | **Confirm the two replacement compositions.** `#rules` = five rules as register rows, each one checkable against the page (§R.4). `#why` = one argument in three doors, READ / ACT / POLICY (§R.7). If "purpose" means something other than *what a record is for*, say so now — it changes both bands. |
| **R-3** | **The POLICY door: confirm there is no policy-impact claim to be made.** SOURCE-FACTS contains none, so I have written the door in the conditional using your own word — "should", not "has". **If you believe there is a real instance of Swechha's data changing a rule, an order or a decision, supply it and I will design for it.** I will not write one. |
| **R-4** | **New copy for approval:** `#rules`' five rule titles and five fact lines; `#why`'s head, lead, three door heads and three door bodies; the work-in-progress clause in both `#sources`' lead and `#why`'s closing `.cap`. Three of these recover approved or ported strings (§R.4); the rest are new. |
| **R-5** | **D-11.5 stands and only its destination changed.** Cutting the windows table does **not** cancel the six windows. `getActiveSituations()` (`lib/content/index.ts:103`) still filters on `status` with no date logic, so "a closed window does not render" is still enforced by an editor remembering. The windows are now needed for the **mechanism and the situation pages**, not for a table on this page. |
| **R-6** | **The page gets ~825px longer, not shorter** (§R.2). I recommend the trade; you should take it knowing the direction. |
| **R-7** | Carried unchanged from §9: **Q-B** (Record door 1 names *"Air, river, heat, fire and rainfall"* — the wrong five), **Q-E** (green taught in words, no swatch), **Q-F** (four of five readings visibly say they have no page), **Q-G** (`<title>` is "Now — Swechha"), **Q-H** (the `description` still promises the retired card list), **Q-I** (Forest loss has no band scale and I will not invent one). |

## R.10 What is now the riskiest thing in this document

Not the tab-row flip — §R.8 downgraded that. It is the **budget**. Four of six bands have
under 100px of headroom, and two of them (`#why` ~6, `#rules` ~20) rest on a line count no
document can settle: how many lines the door bodies and the rule fact lines actually set to
at 335px.

**If a band breaches, the fix is copy length.** Every string in both new bands is a slot, so
there is real room. **Do not solve it by making the type smaller, by dropping a rule from
`#rules`, or by damaging a component** (`BRANDING §6.4`: *"do not quietly breach, and do not
damage a component to hit the number"*). The named reserves, in the order I would spend
them: `#why`'s closing `.cap` to three lines (−26, already assumed in the estimate),
`#rules`' closing `.cap` to two lines (−39), the door bodies to two lines (−48).

**Measure `#why` and `#rules` first, at 375×635 as well as 375×812.**

> **Updated by REVISION 2 (§R.12.4): both bands now sit at ~872 and ~869 with 28px and 30px
> of headroom, bought entirely with copy length. The reserve list above is superseded by
> §R.12.4's, and the top risk is no longer the budget — it is one unverified type size.**

## R.12 REVISION 2 — the copy, drafted. 21 August, later still.

**Authority:** D-11.7 and D-11.8. All three R-questions answered; the pushback on `#sources`
accepted; the +825px accepted knowingly. **This section drafts every string the two new bands
need. It is a draft for approval, not approved copy** — nothing here goes under the
never-rewrite rule until the client says so.

**Written to the budget, not costed afterwards.** §R.10 named the risk and this is where it
was spent: **every line below was length-checked against the band it sits in before it was
kept**, and four of my first drafts were cut for pixels or for honesty rather than for sense.
The arithmetic is in §R.12.4.

### R.12.0 What the `record` measurement changed, since my estimates cited it

D-11.8 records `record` moving **1,393.5 → 1,415.2 at 375** with the approved door copy, and
that the as-frozen state reproduces the published ledger exactly. Two of my estimates cited
the old figure. Checked, as asked:

- **`#rules` does not move.** Its basis is `#projects` at **893.48 at 375** (`BRANDING §1.1`),
  which is untouched.
- **`#why` moves, and the new number is a *better* basis than the old one.** The three-door
  cost was derived as 1,393.48 − 946.34 = **447.14**. The +21.7 delta is one door's body
  gaining a line, so the measurement hands me the thing I actually needed: **one extra line
  of door body costs ~21.7px at 375.** That is now the unit I wrote the door bodies against,
  and the 447.14 basis still holds, because my three bodies total 419 characters against the
  as-frozen doors' 413 — within one line of each other by design, not by luck.

**So: one estimate moves, in my favour, because it replaced a guess with a measured
per-line cost.**

### R.12.1 `#rules` — five rule titles and five fact lines

**D-11.7 says five rules, so five it is.** My first draft blew the band by ~250px and my first
instinct was to merge rows 01 and 02. **I did not do that** — the ruling says five, and the
budget closes if the *titles* are short instead. Re-titling to a one-line ledger register is
also better writing: five terse rules read as a set, where five long ones read as five
headings.

**Titles — `.w7-pj-rt`, Archivo 78/800 uppercase at 15.68px (§R.16.2). All ≤ 30 characters,
one line at 375 — since measured to hold at up to 34 (§R.16.3), so the set has slack it is
deliberately not spending.**

| # | title | chars |
|---|---|---|
| 01 | **AGAINST A PUBLISHED LIMIT** | 25 |
| 02 | **SOURCE AND HOUR ATTACHED** | 24 |
| 03 | **A WINDOW DECIDES MEMBERSHIP** | 28 |
| 04 | **NO LIVE UNTIL IT IS WIRED** | 25 |
| 05 | **THE HOLE STAYS SHOWING** | 22 |

**Fact lines — Newsreader, `--ink-2`, 13.5px, 60ch ceiling. All ≤ 110 characters, two lines at
375.** Each is listed with the thing on this page a reader checks it against, because that
property *is* the composition (D-11.7: *"every row is a rule the rest of the page is the
visible evidence for"*).

| # | fact line | chars | checkable against |
|---|---|---|---|
| 01 | *"Every reading against its published limit. Where no legal threshold exists, the line says so in words."* | 102 | every `.limit` line |
| 02 | *"Source, scope, cadence and hour, on the reading's own line. A figure missing them is not a reading."* | 98 | every `.src` line |
| 03 | *"A season repeats and says when it returns. A one-off window ends for good. A shut window leaves the page."* | 104 | there being five situations and not six |
| 04 | *"Four words, one per reading, always shown. A label that appears only sometimes is how a wrong one shows."* | 103 | every `.state` chip |
| 05 | *"Nothing is invented to fill a gap. A value we do not have renders as no row, not a dash or a zero."* | 97 | the door row's second fill (§6.4) |

**What is recovered rather than written, per constraint 5:**

- **01 opens on the frozen method line verbatim** — *"Every reading against its published
  limit"* (D-01.12, approved, never-rewrite) — and closes on the frozen absence wording, *"no
  legal threshold"* (`BRANDING §4.3`). The repetition with the masthead is deliberate: the
  masthead **states** the method, this row **explains** it, which is the same one-gesture
  logic D-01.12 used for the two masthead statements.
- **02 closes on `BRANDING §3.4`'s own sentence** — *"a figure missing any of them is not a
  reading."*
- **03 is H18's substance** — both shapes plus the consequence — compressed from 166
  characters to 104. What went is H18's framing clause (*"Two shapes of window, and they
  behave differently"*); what stayed is both shapes and what happens when one shuts.
- **04's second sentence is `BRANDING §3.3`'s own argument** — *"a badge that appears only
  when live needs a conditional, and the conditional is the mechanism by which a wrong state
  gets displayed"* — at a third of the length.
- **05 is the through-line**, restated at row length; the title carries its approved shape.

**Two numerals ship in this copy and both are ruled constants, not stated totals.** *"Four
words"* in 04 is frozen by D-01.10 and `BRANDING §3.3` (*"The state vocabulary is four
words"*), a constant in the same class as *"since 2000"*, which `BRANDING §10.6` explicitly
permits. Row 03 implies two window shapes, also ruled (`BRANDING §4.1`). **Neither is a number
the design depends on**, which is §7.8's actual test. Noted so a later sweep does not remove
them as totals.

**And one numeral cut for exactly that reason.** My first `#rules` lead read *"Five rules, and
the page is the evidence for each of them."* **"Five rules" is a stated total** — add a sixth
and it goes false, which is precisely §5.5's distinction between an ordinal and a total. Cut.

### R.12.1a `#rules` — head, lead, caption and CTA

Not on the task list, but the band cannot render without them, so they are drafted here and
marked. **All new copy.**

| slot | draft | chars / lines at 375 |
|---|---|---|
| `.d1` head | **THE RULES THIS PAGE KEEPS** | 26 / 2 |
| `.lead` (46ch) | *"Rules the page keeps, and the page is the evidence for each of them. You can check every one against what is above and below this band."* | 134 / 3 |
| `.cap` (60ch) | *"A rule you cannot check is a promise. These five are checkable, and that is the difference."* | 90 / 2 |
| `.act` | **A READING IN FULL →** — to `situation-air.html`, the one situation page that exists | — |

The `.cap`'s *"These five"* refers to the rows immediately above it, not to a set that could
change — the same construction as a row ordinal. If a later pass adds a sixth rule the word
changes with it, which is what makes it safe.

### R.12.2 `#why` — head, lead, three doors, destinations, closing clause

| slot | draft | chars / lines at 375 |
|---|---|---|
| `.d1` head | **WHAT A RECORD IS FOR** | 20 / 2 |
| `.lead` (46ch) | *"A reading on its own changes nothing. It is worth what its source is worth, what somebody does with it, and what it makes arguable."* | 130 / 3 |

**The lead does structural work, which is why it earns three lines: its three clauses are the
three doors, in order** — *what its source is worth* → READ, *what somebody does with it* →
ACT, *what it makes arguable* → POLICY. A reader meets the band's structure in its first
sentence.

**Runner-up head, and why it loses:** *"KEEPING IT IS NOT THE POINT"* has the site's exact
rhetorical shape, but it is close enough to the frozen umbrella line *"The numbers are not the
work"* to read as a knock-off of it. **WHAT A RECORD IS FOR** names the subject instead,
which is what D-10.2's reasoning asks of a head.

**The three doors.** Eyebrows are `.lbl` and must stay short — `BRANDING §5.6`'s 320px defect
was an eyebrow needing 128px inside a 95px track. One word each.

| | eyebrow | head (Archivo 74/820) | body (16px/1.5) | chars |
|---|---|---|---|---|
| **1** | **READ** | **A READING IS WORTH ITS SOURCE** | *"The number is the smallest part. What measured it, how often, and against which published limit — that is what lets you argue with it."* | 132 |
| **2** | **ACT** | **SOMETHING TO DO WITH IT** | *"A broken limit is something you can raise, and a reading with its source attached is what you raise it with. The record is here to be quoted."* | 140 |
| **3** | **POLICY** | **A LIMIT IS ALREADY A POLICY** | *"Every limit here is published by somebody who can be asked to enforce it, or to explain it. Readings against a limit turn a complaint into a pattern."* | 147 |

Door 2 is in the **second person** on purpose — *you can raise*, *you raise it with*. Mustard
is the second person and the colour of a human act (`BRANDING §3.1`), and this is the mustard
door in the band's only mustard family.

**Destination phrases — the figure row. No figure in any of them** (D-11.7, which also
corrects the two frozen doors that put an unsourced total there).

| door | phrase | destination | exists? |
|---|---|---|---|
| READ | *"How a reading is put together"* | `#rules`, in-page | ✓ |
| ACT | *"What you can do"* | `/act` | ✓ a real route (`app/sitemap.ts:14`) |
| POLICY | *"Where this fits in the work"* | **`/about`** | ✓ **closed by D-11.9** — §R.16.1 |

**Closing `.cap` — the work-in-progress clause, argument version.**

> *"None of this is finished, and the honest place to check how far it has got is the source
> table above: every feed named, with whether it is running."*

146 characters, three lines at 375. **No count** — it points at the column rather than
summarising it, which is the whole argument for keeping `#sources` as a table (§R.1).

### R.12.2a Door 3, audited line by line against D-11.8

The band's one dangerous door, checked against the standing prohibition rather than assumed
clean.

| prohibition | door 3 as drafted |
|---|---|
| no *"led to"* / *"influenced"* / *"cited in"* / *"resulted in"* / *"contributed to"* | none present |
| no named authority, court, order, docket or ruling | *"somebody"* — deliberately unnamed |
| **no figure of any kind** | none |
| no past tense a reader could take as achieved influence | the only non-present verb is *"is published"*, a passive present about **the limit's own author**, not about Swechha. Everything else is present-habitual: *"can be asked"*, *"turn"* |
| argues what a record is *for*, not what it achieved | the head — **A LIMIT IS ALREADY A POLICY** — is **true by definition** and needs no source at all. A published limit *is* a policy instrument. That is the hinge, and it is why this door can be written at full strength while the record holds no policy-impact instance |

**One line I drafted and cut on this test.** *"A record kept every day is what turns a
complaint into a pattern"* reads as a general proposition, but on this page a reader takes it
as describing this page — and **nothing here is kept every day, because nothing is wired.** It
became *"Readings against a limit turn a complaint into a pattern"*: same argument, no
implied cadence. This is the same failure mode as the frozen Record door's *"Updated every
hour"*, which is on the handoff as open item 4.

**Two more cut for the same class of reason.** *"A limit broken in your ward"* implies the page
can answer a ward, and the location control was deferred off this page entirely (D-01.8); it
became *"A broken limit"*. And door 1's *"how often"* survived only because it names a **field
that exists on every reading** — cadence — rather than a frequency this page achieves.

### R.12.3 The two work-in-progress clauses

D-11.7 makes `#sources` the client's *"work in progress"* in evidential form, so the clause
appears twice: once as that band's lead, once as the argument's closing note.

| where | draft | chars / lines |
|---|---|---|
| `#sources` `.lead` (46ch) | *"This is an instrument being built. The state column below is how far it has got."* | 79 / 2 |
| `#why` `.cap` (60ch) | *"None of this is finished, and the honest place to check how far it has got is the source table above: every feed named, with whether it is running."* | 146 / 3 |

**Neither states a count**, and that is deliberate even though a count was available and
already approved: H23 ships *"None of the seven feeds below is wired yet"* as the band's
`.body`, so the denominator is on the page **once**, in the sentence AD-12 earned it in.
Saying it twice more would make the page's least flattering number its most repeated one —
and it would go stale the day one feed is wired, turning a one-token change into three.

**`#sources` head, reframed per §R.5:** **WHAT IS WIRED AND WHAT IS NOT** (30 chars). New copy.

### R.12.4 The budget, recomputed against the copy actually written

**`#rules` — target ≤ 900:**

| element | px | derivation |
|---|---|---|
| t2 pad, top + bottom | 112 | `--pad-t2` flat 56 at ≤767 (`home.html:796`) |
| `.im-head` — `.d1` 2 lines + `--gap-head` + `.lead` 3 lines + `--gap-block` | 203.6 | 74.3 + 18 + 75.3 + 36; `.lead` = 16.96 × 1.48 (`BRANDING §1.4`, `home.html:124`) |
| 5 rows × (title 1 line ~23 + fact 2 lines 39.2 + padding ~33 + 1px rule) | 481.0 | fact line = 13.5 × 1.45 × 2 |
| `.cap` 2 lines | 39.2 | |
| `.act` + gap | 36 | `home.html:611–618` |
| **total** | **~871.8** | **28px headroom** |

> **SUPERSEDED BY §R.16.4.** The title was assumed at ~23px (a ~20px face); it is **measured
> at 16.5px** (`.w7-pj-rt`, 15.68 × 1.05). The band is **~839.3 with 60.7px of headroom**, and
> the 32.5px is left as headroom rather than spent on copy (D-11.9).

**`#why` — target ≤ 900:**

| element | px | derivation |
|---|---|---|
| t2 pad | 112 | as above |
| `.im-head` — 2-line head, 3-line lead | 203.6 | as above |
| three door cards | 447.1 | **measured**: `record` 1,393.48 − 946.34 (`BRANDING §6.4`). Valid because my bodies total 419 chars against the as-frozen doors' 413 |
| `.cap` 3 lines | 58.8 | |
| `.b-1` + gap | 48 | |
| **total** | **~869.5** | **30px headroom** |

**Both bands are now inside the cap with room, where §R.3.3 had them at 20px and 6px.** The
headroom was bought entirely with copy length and **nothing was trimmed from the argument** —
all three doors keep their full body, all five rules survive, and the POLICY door lost only a
false cadence implication. D-11.7's *"do not trim the argument to win pixels back"* is
honoured.

**Revised document estimate ~5,527px at 375×812** (526 + 800 + 872 + 800 + 864 + 869 = 4,731
content, + footer 726 + nav 56), against §R.2's ~5,546. **The net-versus-v1 figure of ≈ +825px
stands within rounding, so D-11.7's accepted number does not need revisiting.**

**The single riskiest unverified input, named rather than buried:** the register row title's
rendered size. `BRANDING §2.2` gives it as Archivo **74/800** and states **no font-size**, so
my one-line-at-375 assumption rests on ~20px and ~33 characters a line. **If the titles wrap
to two lines the band gains ~115px and breaches at ~987.** Measure that before anything else.
Reserve, in order: `.cap` to one line (−19.6), then re-title 01 and 03 shorter. **Not** a
merge to four rows, which would contradict D-11.7.

> **CLOSED, AND I WAS WRONG ABOUT WHICH CLASS — §R.16.2.** The register rows are
> **`.w7-pj-rt`** at **15.68px**, not the `.w7-pj-t` 74/800 that §2.2 documents (which is the
> register's single lead row, and *is* ~20.8px — so the assumption above was precisely wrong
> rather than arbitrary). All five titles hold one line at 375; the measured ceiling is **34
> characters**. The band lands at **~839 with 60.7px of headroom**, the wrap risk is retired,
> and this reserve list is not needed. **The band's last unverified input is now the row's
> vertical padding (~33px × 5 = 165px), which M2 settles.**

### R.12.5 The grep audit, per constraint 3

Run over every string drafted in §R.12. **Every hit accounted for.**

| term | hits in the drafted copy | disposition |
|---|---|---|
| `today` | 0 | — |
| `now` | 0 | — |
| `currently` | **1, cut.** My first `#why` `.cap` read *"which is currently none"* | cut — it was both a forbidden tensed word **and** a stated total |
| `this year` | 0 | — |
| `since` | 0 | — |
| `as of` | 0 in copy; **1 as a column header** in `#sources` | accounted for: *"Last fetch" → "As of"* is AD-12's own earned rename (`AD-12 §2.1`) — a field label, not a claim |
| month names | **1, cut.** H17's *"Nobody has to remember to switch anything on in March"* | cut, and for a second reason too — §R.14 item 2 |
| `20\d\d` | 0 | — |
| present continuous | *"being built"*, `#sources` lead | **kept.** §3.5 forbids a *tensed or dated* claim; a statement of present state with no date attached is neither, and the alternative (*"is unfinished"*) says less |

**Stated-total audit.** Two numerals ship: *"Four words"* (ruled constant, D-01.10) and *"These
five"* in the `#rules` `.cap` (a reference to the rows above, like an ordinal). **Two were
cut:** *"Five rules"* from the lead, and *"currently none"* from the closing clause.

### R.12.6 Specimen marking, per constraint 6

**Nothing in §R.12 is a specimen, and that is worth stating explicitly**, because §6.1 of this
document does contain specimens and the two must not be confused. Every string above is
**intended production copy awaiting approval**; it contains no figure, no station, no cadence,
no date and no derivation, so there is nothing in it that could need a specimen stamp. The
page's specimens are all elsewhere — the four `.state` chips and three rail states in
`#legend` (§5 band 6), each labelled as a specimen under `AD-12 §2.3`'s ruled wording.

**Measure ceilings held throughout:** leads at 46ch (`#rules` 134 chars → 3 lines, `#why` 130
→ 3), captions at 60ch (`#rules` 90 → 2, `#why` 146 → 3). The three door bodies are 16px/1.5
inside a door column rather than `.body`, so they are costed by the measured door figure
instead of by a character ceiling — which is why the ~140-character cap in §R.13 item 2
exists.

## R.13 What the copy forced in the layout

Three changes, all small, all recorded so the document stays consistent.

1. **`#rules`' row titles are now one-line register labels, not sentences.** This is a
   *composition* change and not only a copy one: it fixes the row at title + two-line fact,
   which is what makes five rows fit. **The row rhythm is now a constraint on any rule added
   later** — a sixth rule must also be **≤34** characters titled (measured, §R.16.3 —
   supersedes the ≤30 I imposed on myself) and ≤110 explained, or the band re-opens.
2. **`#why`'s door bodies are capped at ~140 characters each**, from the measured +21.7px per
   extra line. That cap belongs in the spec rather than in this drafting note, because the
   next person to edit a door body needs to know what a line costs.
3. **`#sources` gains a two-line `.lead`** it did not have in §5 band 4 — already carried in
   §R.3.3's ~800 figure, so nothing moves.

**Nothing in §4 (the reading component), §5 bands 1, 2 and 6, or §7's four answers is touched
by this revision.**

## R.14 The lines I could not write without a fact I do not have

Three, and only the first blocks anything.

1. **~~The POLICY door's destination.~~ RESOLVED by D-11.9 — it points at `/about`, the
   recommendation below, taken for the reasoning below.** Kept for the record.

   The other two resolve — `#rules` is in-page and `/act`
   is a real route. POLICY has no obvious home: `app/sitemap.ts`'s static pages are `now`,
   `explore`, `work`, `work/campaigns`, `impact`, `act`, `about`, `search`, and **there is no
   advocacy or narratives route.** SOURCE-FACTS names *"Building Narratives for Sustainability
   (research, communication, advocacy)"* as a live page on the **current WordPress site**, not
   on this one. **I recommend `/about`**, and have drafted *"Where this fits in the work"*
   against it. This is structural rather than cosmetic: the door cards are `<a>` elements
   (`home.html:4063` onward), so **a door with no destination is not a door**, and dropping to
   two breaks the component's `repeat(3,…)` grid. **This is the one item in §R.12 I would not
   ship without the client's word.**
2. **H17's best clause, blocked by the codebase rather than by the record.** *"Nobody has to
   remember to switch anything on in March"* is the sentence that makes the window rule feel
   like a mechanism instead of a policy — and it is **currently false**:
   `getActiveSituations()` (`lib/content/index.ts:103`) filters on `status` with no date logic,
   so somebody **does** have to remember. Held as a slot; it ships the day D-11.5's six
   windows are wired, at which point it becomes true and row 03 gains a third sentence
   (+19.6px, inside the band's 28px headroom). **Recorded because it would have been very easy
   to ship it as approved ported copy and be wrong.**
3. **Every cell of the `#sources` table**, unchanged from §6.5 — source name, what it feeds,
   cadence, as-of, state; four of five have no schema field (§11 items 5, 6, 7). The band's
   *prose* is now fully drafted. Its **data** is not, and cannot be from this document.

**And one thing I deliberately did not draft:** `#legend`'s teaching copy and `#top`'s
masthead slots. Neither was on the task list, both are specified as slots in §6.1, and
`#legend`'s specimen clause in particular should be written against `AD-12 §2.3`'s exact
wording **in the same pass as `system.html`**, so the two sheets agree word for word rather
than nearly.

## R.16 REVISION 3 — FINALISED. 21 August, close of phase.

**Authority: D-11.9.** The copy is approved as drafted and the POLICY door points at
`/about`. This section is bookkeeping: it closes the open destination, replaces my assumed
type numbers with measured ones, republishes the one budget that moves, and states the build
order. **Nothing is redesigned and no copy is added.**

### R.16.1 The POLICY door is closed — `/about`

D-11.9 takes the recommendation for the reasoning given: there is no advocacy or narratives
route in this project, and `/about` is where the method and the Wheel of Change already live.
**Every "needs confirming" on this door is now closed.** Checked for agreement in all three
places the document states it:

| where | now reads |
|---|---|
| §R.7's door table | POLICY → `/about` ✓ |
| §R.12.2's destination table | *"Where this fits in the work"* → `/about` ✓ |
| §R.14 item 1 | **closed** — marked resolved in place |

The `#why` wireframe in §R.7 needed no change: it draws the figure row as `dest ▸` without
naming a target, so it was already correct.

### R.16.2 The register row title — measured, and the branding doc is NOT wrong

**Correction to the finalisation brief, and it matters because recording a false defect
against the frozen language is exactly the trap this project keeps hitting.** I was told
`BRANDING §2.2` *"is wrong on the one axis it does give"* — stating `wdth` 74 where 78 was
measured. **It is not wrong. It documents a different class.**

Read out of the frozen file:

| class | rule | variation | font-size | line-height | markup instances |
|---|---|---|---|---|---|
| `.w7-pj-t` | `home.html:2391–2394` | **`'wdth' 74,'wght' 800`** | `clamp(1.3rem,2.1vw,1.85rem)` → **20.8px at 375** | `1` | **1** |
| `.w7-pj-rt` | `home.html:2424–2427` | **`'wdth' 78,'wght' 800`** | `clamp(.98rem,1.15vw,1.12rem)` → **15.68px at 375**, 16.56 at 1440 | `1.05` → **16.46px** | **6** |

So `BRANDING §2.2`'s *"`.w7-pj-t` 74/800"* is **accurate for the class it names** — and that
class is the register's single **lead row**, the one carrying a photograph and two `.num`
readouts (`BRANDING §5.5`). The class that renders the other six rows, `.w7-pj-rt`, **§2.2
does not list at all.**

**The real documentation gap, for whoever next touches the branding doc — an omission, not an
error:** §2.2 omits `.w7-pj-rt` entirely, and it gives **no font-size for either class**. Not
mine to fix here.

**And this explains how my own error happened, which is worth recording so nobody re-makes
it.** I specified the register rows as *"title (Archivo 74/800, uppercase)"* in §R.4, quoting
§2.2, and assumed ~20px. **20.8px is exactly `.w7-pj-t`'s size at 375** — I had unknowingly
costed the *lead* row's type for the *register* rows. The assumption was not arbitrary; it was
precisely wrong, which is the more dangerous kind.

**§R.4's specification is corrected: the register rows take `.w7-pj-rt` — `'wdth' 78,'wght'
800`, `clamp(.98rem,1.15vw,1.12rem)`, `line-height:1.05`** — copied as a token'd rule, never
retyped.

### R.16.3 The measured constraint, replacing my self-imposed one

**A register-row title of ≤34 characters holds one line at 375.** Measured, not assumed:
`.w7-pj-rt` at 15.68px in a 293px box, with my five titles substituted in place; all five hold
one line at 16.5px with zero overflow, and bisecting upward, 34 characters still holds. The
test is not a false pass — a 46-character control wraps to two lines at 375 (32.9px) while
holding one line at 1440.

**My ≤30 was conservative by at least four characters against a longest title of 27.** The copy
is approved as drafted and **is not being lengthened to spend the slack** (D-11.9). The
measured number is recorded as the constraint for any rule added later, superseding §R.13 item
1's ≤30:

> **A sixth rule's title must hold ≤34 characters and its fact line ≤110, or the band
> re-opens.**

### R.16.4 `#rules` re-derived at 15.68px — and the headroom stays headroom

| element | px | was | derivation |
|---|---|---|---|
| t2 pad, top + bottom | 112 | 112 | `--pad-t2` flat 56 at ≤767 (`home.html:796`) |
| `.im-head` | 203.6 | 203.6 | unchanged |
| 5 rows × (title **16.5** + fact 39.2 + padding ~33 + 1px rule) | **448.5** | 481.0 | title measured at `.w7-pj-rt` 15.68 × 1.05, **not** the assumed ~23 |
| `.cap` 2 lines | 39.2 | 39.2 | |
| `.act` + gap | 36 | 36 | |
| **total** | **~839.3** | ~871.8 | **−32.5** |

**`#rules` headroom: 60.7px, up from 28.** `#why` does not move — its basis is the measured
three-door figure, not a type assumption — so it stays **~869.5 with 30px**.

**The 32.5px is left as headroom and not spent.** It is the reserve for the build, where this
band's one remaining unverified input lives: the row's **vertical padding**, carried at ~33px
and worth **5 × 33 = 165px of the band** — by far the largest un-measured quantity left in
this document.

**Revised document estimate: ~5,480px at 375×812** (526 + 800 + 839 + 800 + 864 + 869 = 4,698
content, + footer 726 + nav 56).

**Net against the original six-band version: +758px**, where D-11.7 accepted **+825**. The page
came in **67px under what was accepted**, in the client's favour, so the accepted figure does
not need revisiting.

### R.16.5 The copy is APPROVED — and the two exceptions are not

**APPROVED, authority D-11.9. Do not reopen in a later session.**

| band | strings | status |
|---|---|---|
| `#rules` | five titles, five fact lines, head, lead, cap, CTA (§R.12.1, §R.12.1a) | **APPROVED** |
| `#why` | head, lead, three eyebrows, three heads, three bodies, three destination phrases, closing cap (§R.12.2) | **APPROVED**, with POLICY → `/about` (§R.16.1) |
| `#sources` | reframed head, work-in-progress lead (§R.12.3) | **APPROVED** |

**NOT APPROVED — because not yet true, or not yet written.** Both are slots, not omissions:

| # | what | why it is not approved | what unblocks it |
|---|---|---|---|
| 1 | Rule 03's **mechanism sentence** — *"Nobody has to remember to switch anything on in March"* | **It is currently false.** `getActiveSituations()` (`lib/content/index.ts:103`) filters on `status` with no date logic, so somebody does have to remember. D-11.9 records the general pattern: **an approved ported string can still be false on the page that ports it** | D-11.5's six windows wired. It then ships as rule 03's third sentence, +19.6px, inside the 60.7px headroom |
| 2 | **`#legend`'s teaching copy and `#top`'s masthead slots** | not drafted, deliberately — `#legend`'s specimen clause must be written against `AD-12 §2.3`'s exact wording **in the same pass as `system.html`**, so the two vocabulary sheets agree word for word rather than nearly | a later pass, tied to `system.html` |

**So three of six bands are copy-complete and three are not** — `#rules`, `#why` and `#sources`
are approved; `#top`, `#readings`' head and door strings, and `#legend` are slots. That split
drives the build order, because **a band measured with placeholder copy is a band not
measured.**

### R.16.6 Build order

Each step ends in a measurement, and no step starts before the one above it is measured.

| phase | what | gate |
|---|---|---|
| **0** | **The shell, measured empty.** Copy the frozen `:root`, voices, grounds/tier block, the `.rl` contract, state marks, buttons/links/tags, `.im-head`, nav + SECTIONS + underline, the hit expanders, the skip link and `<main>`, the footer, and the swept `duo`/`duo-dim` defs — **verbatim** (`BRANDING §10`). Declare the six-band sequence: id, tier class, ground hex (§R.3) | adjacency zero clashes at 375×812, 375×635 and 1440×900; `scrollWidth === innerWidth` at all eleven widths; console silent; anchors within ±0.5px of `--nav-h` on **both** paths |
| **1** | **`#readings` — the deck, tab row promoted above the panel.** First content band because it carries the one modification this spec makes to a solved component, and if the flip fails the fallback changes this band and nothing else | **M1.** Plus the hash-selects-panel handler on both paths, guarded |
| **2** | **`#rules` and `#why`** — the two copy-complete new bands. Approved copy goes in, so these measure for real | **M2 and M3** |
| **3** | **`#sources`** — the five-column table, its `.tbwrap` scroller with the 8px mask, and the inbound anchor from `home.html:4079`. Prose approved; **cell values still slots** (§R.14 item 3) | the door's four promises map to four surviving columns (§R.5); scroller ring not clipped after scrolling |
| **4** | **`#top` and `#legend`** — blocked on copy, so built last. `#legend` in the same pass as `system.html` | per-band 900px cap at 375×812 **and** 375×635 |
| **5** | **The SEO layer** (§8). `BreadcrumbList`, `ItemList` and `WebSite` ship; `SearchAction` waits on `/search` reading a query param; `Dataset` ships gated on `mock === false`, emitting zero blocks | no JSON-LD naming a source it cannot link |
| **6** | **The floors, then the published band ledger** — touch, focus, keyboard, 320–1920 overflow, the contrast walk, then the ledger at three viewports | `BRANDING §10` items 9–17, in full |

**One dependency that is easy to get backwards:** `#sources` can be *built* before its data
exists — the table renders its columns and state chips from whatever rows are there — but it
cannot be *signed off*, because its height depends on cell content. Same for `#readings`,
whose panels depend on the reading slots in §6.5.

### R.16.7 The first three measurements, in order

**The ordering has changed, and the register-title measurement is why.** My standing advice was
to measure `#rules` and `#why` first, because they sat at 20px and 6px of headroom. They now
sit at **60.7 and 30**, so the budget is no longer the top risk — **the tab-row promotion is**,
and it moves to first.

**M1 — the promoted tab row's focus ring and selected-tab marker.** Ring overhang **0.00 on
all four sides at every width, at rest AND after scrolling the track**; the 3px
`border-bottom` marker read in a PNG at 375 and 1440. Highest risk left in the spec: the one
place this page modifies a solved component, and `BRANDING §6.2` records that *"padding alone
only guarantees the ring at `scrollLeft 0`"* — a click out and back left the frozen row
resting at `scrollLeft 5`, exactly the allowance scrolled off. §R.8 downgraded the risk (the
flip leaves `padding:5px`, `scroll-padding-inline:5px` and `RING=5` untouched, and both
historic bugs were about the ring rather than the marker), but downgraded is not retired. **If
it fails, take §5 band 2's named fallback rather than inventing a third option.**

**M2 — `#rules` at 375×812 and 375×635, approved copy in place.** Settles the **last
unverified input in the band**: the row's vertical padding, carried at ~33px and worth 165px
across five rows. Everything else is now measured or token'd. Expected ~839; the 60.7px
headroom is the allowance for exactly this unknown.

**M3 — `#why` at 375×812 and 375×635, approved copy in place.** Validates the 447.1px
three-door figure against **my** bodies rather than the frozen ones. The check that matters: my
three bodies total 419 characters against the as-frozen doors' 413, so **any door wrapping one
line further than expected costs 21.7px** (D-11.8's measured unit) and eats most of the 30px
headroom. Read the PNG as well as the box — `BRANDING §5.6`'s 320px eyebrow collision existed
**only** in `scrollWidth` vs `clientWidth` and in the picture.

**Measure at 375×635 as well as 375×812 throughout.** 635 is the real iOS Safari height
(`BRANDING §6.5`) and it is the number that decides mobile arguments on this project.

### R.16.8 Nothing was left open by this pass

No inconsistency surfaced that bookkeeping could not close. The one thing the pass **did** turn
up — that the branding doc documents `.w7-pj-t` where `.w7-pj-rt` was measured (§R.16.2) — is a
correction to my own spec plus a documentation gap in the frozen language, and both are
recorded rather than designed around.

**This document is finalised.** What remains before a build is not design: two copy slots
(§R.16.5), the `#sources` cell values, and the seven backend fields in §11.

## R.15 What changed in this document

### Revision 3 (finalisation)

| section | change |
|---|---|
| **§R.16** | **NEW** — POLICY→`/about` closed; register-title numbers measured; `#rules` re-derived; copy marked APPROVED; build order and first three measurements |
| §R.4 register row spec | **corrected** — `.w7-pj-rt` 78/800 at `clamp(.98rem,1.15vw,1.12rem)`, not `.w7-pj-t` 74/800 at ~20px (§R.16.2) |
| §R.12.2 POLICY destination | **closed** — `/about`, per D-11.9 |
| §R.12.4 / §R.3.3 budget | `#rules` ~872 → **~839** (60.7px headroom); `#why` unchanged at ~869; document ~5,527 → **~5,480**; net vs v1 **+758** against the +825 accepted |
| §R.13 item 1 | title constraint ≤30 → **≤34, measured** |
| §R.14 item 1 | **resolved** |
| §R.10 / §R.12.4 "riskiest thing" | **superseded** — the top risk is now M1, the tab-row ring, not the budget |

### Revision 2 (the copy pass)

| section | change |
|---|---|
| **§R.12** | **NEW** — every string the two new bands need, drafted for approval, with the length check that kept each one |
| §R.3.3 phone budget | **updated by §R.12.4** — `#rules` ~880 → **~872**, `#why` ~894 → **~869**. Both bought their headroom with copy length |
| §R.10 riskiest thing | **superseded.** The budget is no longer the top risk; **one unverified type size** is (the register row title, §R.12.4) |
| §R.9 R-4 | **discharged** — the copy is drafted. R-1, R-3 and R-6 are answered by D-11.7/D-11.8. **R-2 and R-5 stand**, and §R.14 item 1 adds one new question: the POLICY door's destination |
| §6.1 copy-slot table | slots for `#rules`, `#why` and `#sources`' lead **now drafted** in §R.12; the table's entries point there |
| §6.2 H17 | **re-homed and split.** Its opening clause is row 03's fact line; its best closing clause is **held as a slot**, blocked on D-11.5 (§R.14 item 2) |
| §5 band 4 `#sources` | gains a two-line `.lead` and a reframed head (§R.12.3), already carried in §R.3.3's figure |
| §4, §5 bands 1/2/6, §7 | **untouched by Revision 2** |

### Revision 1 (the band challenge)

| section | change |
|---|---|
| §1 verdict | superseded in part — see the note under it |
| §2 band ledger, adjacency, hue, budget | **superseded by §R.3–R.3.3** |
| §3.1 inbound-link table | **corrected** — five ticker anchors became three (D-12.11), and the orders door became the provenance door (D-11.6). Corrections marked in place |
| §4 the reading component | **unchanged.** Nothing in the challenge touches it |
| §5 band 1 `#top` | unchanged (§R.7 explains why the purpose does **not** move here) |
| §5 band 2 `#readings` | unchanged; the tab-row promotion re-justified and its risk downgraded in §R.8 |
| §5 band 3 `#windows` | **CUT.** The rule survives in `#top`'s lead and `#rules` row 03 |
| §5 band 4 `#sources` | **kept and reframed** — §R.5 |
| §5 band 5 `#orders` | **CUT.** The reservation is held in §R.6 |
| §5 band 6 `#legend` | **unchanged**, and not challenged |
| new bands | **§R.4 `#rules`**, **§R.7 `#why`** |
| §6 copy slots | `#windows` and `#orders` slots void; new slots in §R.4, §R.5 and §R.7. H17, H18 and H22 re-homed — see §6.2's note |
| §7 Q1–Q4 | **unchanged.** All four answers survive the challenge intact |
| §9 client questions | **superseded by §R.9** |
| §10 not-designed / will-move | **amended** — see the note at §10 |
| §11 backend table | **unchanged**, except that item 2's blocking status moves: the windows now block the *mechanism*, not a band on this page |

---

## 1. Verdict, and the composition rationale

> **Superseded in part by REVISION 1.** The verdict and rationale below stand for `#top`,
> `#readings`, `#legend` and the reading component. Where they describe `#windows`,
> `#orders`, the six-band sequence or "five inbound anchors", **§R.3 and §R.8 govern.**

**Verdict in one line: six bands, no photograph, no stated total, no green, every band
inside the 900px phone cap, and the deck stays — but its tab row moves above the panel it
drives, because at 375 the alternative puts the only evidence that five readings exist
below the fold.**

The rationale. This page is not a shorter homepage and it is not a longer situation page;
it is the **register between them**, and the thing it owes a reader is *breadth with its
provenance attached*. So the composition splits that job in two rather than trying to do
it in one object. **Depth is carried by the deck** — one reading at a time, all six parts
of §3.4 present, at `.num` scale rather than `.readout` scale, because five hero-scale
readouts on one page is five mastheads. **Breadth is carried twice over, in the two places
a reader actually looks for it**: the deck's own tab row, promoted to the top of its band
so it names every member of the set above the fold, and the `#windows` table, which is the
one place the whole set can be compared side by side. That split is what lets the four
stat tiles die without the page losing what they were doing (§7, Q2).

Three structural facts drove everything else. First, **the page has no aggregate reading
and must not pretend to have one** — the homepage already removed its page-level LIVE dot
for exactly this reason (`DECISIONS:766–768`), and every candidate summary figure on this
page is a stated total, which §7.8 forbids. So the masthead carries a *method line* and a
*rule*, not a number. Second, **there is no green on this page at all**: Out of River left
the situation set by D-11.2 and green means "what Swechha has done" (§3.1), of which there
is none here. That retires the red/green adjacency problem before it starts and it is why
no band needs the ticker's exemption. Third, **the honesty grammar in the prototype is
better than anything I would write**, so the composition is built to hold those thirty
sentences rather than to replace them; §6 lists which ones and where they land.

**The layout is tentative by instruction, and §10.2 names the seven decisions I expect to
move** once the first situation pages are populated. One of them is a designed defect I am
declaring rather than hiding: the reserved `#orders` band **will** need re-composing the
day real filings exist (§5, band 5).

---

## 2. The band ledger

> **SUPERSEDED BY §R.3–R.3.3.** `#windows` and `#orders` are cut, `#rules` and `#why` are
> added. **§2 is kept because its reasoning is still load-bearing** — the ground logic, the
> two-adjacent-papers rejection, the containers, and the arithmetic that killed the stack —
> and every one of those arguments carries into the revised sequence unchanged. Read §R.3
> for the live ledger and §2.2–§2.4 for why the grounds are what they are.

`--pad-t2` / `--pad-t3` / `--pad-t4` resolve to flat **56 / 44 / 22** at ≤767
(`home.html:796–797`); tier classes at `home.html:787–790`; `section` itself carries no
padding (`home.html:136`).

| # | id | tier | ground token | hex | single hue | purpose | 375 est. |
|---|---|---|---|---|---|---|---|
| 1 | `#top` | **t2** | `--ground` | `#0D0D0B` | mustard only (interface) | the masthead: what this page is, the method it holds itself to, and why its length changes | **~526** |
| 2 | `#readings` | **t2** | `--ground-2` | `#151512` | **red** | the set, as readings — one deck, all six parts of §3.4 per panel, one door per panel | **~800** |
| 3 | `#windows` | **t2** | `--paper` | `#F3F2F0` | none | the window grammar, taught: what puts a situation here and what takes it away | **~819** |
| 4 | `#sources` | **t3** | `--ground` | `#0D0D0B` | none | page-level provenance — every source, its cadence, its as-of and its state | **~779** |
| 5 | `#orders` | **t4** | `--ground-2` | `#151512` | none | **reserved** (D-11.1). Named, contentless, and it says so | **~152** |
| 6 | `#legend` | **t2** | `--paper-2` | `#ECEBE8` | red + mustard, **as labelled specimens** | the vocabulary: four state words, three rail states, three hue rules | **~864** |
| — | `footer` | (t4 padding, no class) | `--ground-2` | `#151512` | none | copied verbatim from `home.html:4168–4213` | ~726 |

Ground classes to use, verbatim: `.paper` `home.html:137`, `.paper-2` `home.html:138`,
`.dark-2` `home.html:139`. Band 1 and band 4 take `--ground` by **stating it**, not by
inheriting `body{background:var(--ground)}` (`home.html:99`) — `#journeys` on the frozen
page is the only band that inherits and it is the minority pattern (there is no
`.w7-jr{}` background rule anywhere in the file).

### 2.1 Adjacency, checked mechanically

Sequence of rendered hexes, header → footer:

```
#0D0D0B → #151512 → #F3F2F0 → #0D0D0B → #151512 → #ECEBE8 → #151512
   1         2         3         4         5         6       footer
```

| pair | hexes | same? |
|---|---|---|
| 1 → 2 | `#0D0D0B` → `#151512` | no |
| 2 → 3 | `#151512` → `#F3F2F0` | no |
| 3 → 4 | `#F3F2F0` → `#0D0D0B` | no |
| 4 → 5 | `#0D0D0B` → `#151512` | no |
| 5 → 6 | `#151512` → `#ECEBE8` | no |
| 6 → footer | `#ECEBE8` → `#151512` | no |

**Zero clashes.** Two of the six cuts are the alternate-dark step, which
`BRANDING §1.1` licenses only when "the cut there is carried by weight". Both are:

- **1 → 2** — a picture-free type wall gives way to the page's only instrument object, a
  41.6px numeral with a 6px red rail. Weight cut present.
- **4 → 5** — a seven-row source table at **t3** gives way to a three-line strip at
  **t4**. That is a 2:1 padding step (44 → 22 at 375) on top of a full change of object.
  Weight cut present.

**Two adjacent papers were considered and rejected.** `#F3F2F0` against `#ECEBE8` passes
the "no two adjacent bands share a hex" test mechanically but the two grounds are ~1.03:1
apart; with no weight cut available between an explainer and a table they would read as
one band. The homepage never puts them adjacent either.

### 2.2 Hue, per band

| band | hue live | why |
|---|---|---|
| `#top` | mustard only, and only on the interface | no reading in the masthead, therefore no red. This is `#top`'s pattern on the frozen page minus the deck (`BRANDING §3.2` records `#top` as red ×30 + mustard ×4) |
| `#readings` | **red** — the breach rail (`--rl-w:6px`/`--rl-c:--red`, `home.html:273`), `.verdict.bad` (`home.html:302`), `.limit b` (`home.html:318`), `.bands.bad i.tip` (`home.html:313`) | it is the only band carrying readings |
| `#windows` | none | it teaches a rule; a rule is not a reading |
| `#sources` | none | `.state` chips are `currentColor` and are never red, green or mustard (`home.html:295`, `BRANDING §3.3`) |
| `#orders` | none | nothing to colour |
| `#legend` | red (paper face, `--red-ink`) + mustard, both as labelled specimens | §7, Q-extra below |

**Red and green never meet, and never sit in adjacent bands, trivially: there is no green
on this page.** Out of River is an outcome, not a situation, and it left for the Impact
slot (D-00.2, D-11.2). No band needs the ticker's exemption and the exemption is not
invoked anywhere.

**No mustard field.** `#give`'s single mustard ground "is what licenses mustard as the
control colour everywhere else" (`BRANDING §1.1`), and `home.html:4129` names it "The one
mustard field on the site". A second mustard band on the index would spend that. The
situation-page brief flags the same question for `situation-air.html`'s `.sub` band
(§1.7); this page declines it.

### 2.3 Containers

**Every band on `.wrap`** (`home.html:106`, `max-width:1240px`). **Zero `.wide` on this
page** outside the header and footer chrome copied verbatim. The prototype is **17
`.wide` / 0 `.wrap`** (`intelligence.html`, counted across lines 763–791), which puts
every band of prose on a 1,580px container; that is the defect being corrected, not a
style to inherit.

The two tables go on `.wrap` too, not `.wide`. At 1440 a five-column table on `.wide`
gives 302px columns, and a cell like *"A published bulletin, typed in by hand"* then sets
above the **60ch caption ceiling** (`BRANDING §1.5`). On `.wrap` at 1440 the same table
runs 1,148px of content — five columns at ~229px, inside the ceiling.

### 2.4 Phone budget — all six bands inside 900px at 375

The arithmetic is in §5 per band. Summary, with the token source for every input:

| band | 375 est. | inside 900? |
|---|---|---|
| `#top` | ~526 | ✓ |
| `#readings` | ~800 | ✓ (100px headroom) |
| `#windows` | ~819 | ✓ (81px headroom) — **requires the table to scroll at ≤767; see §5 band 3** |
| `#sources` | ~779 | ✓ |
| `#orders` | ~152 | ✓ |
| `#legend` | ~864 | ✓ (36px headroom) — **requires the specimen grids to go 2-up at ≤767** |

**No band asks for a 900px licence.** The exception list stays at two (the heroes, and
`record` by name — D-09.7). Estimated document ≈ **4,720px at 375×812** against the
frozen homepage's 10,244 (`BRANDING §1.1`) — quoted with its viewport height, per the
rule that a bare figure is meaningless. Two bands have less than 100px of headroom and
are the two to measure first.

**One composition was costed and rejected on this arithmetic, and the arithmetic is the
reason the deck survives.** A stack that renders all five readings in one band, rather
than a deck showing one, costs **~352px per reading** at 375 (the per-row breakdown is in
§5 band 2). Five rows plus the opener plus t2 padding is **~2,197px** — 2.4× the cap, and
1.6× `record`, which is the worst breach the site has ever licensed. There is no honest
trim: dropping the six-band scale saves 42px a row and breaks §3.4 part 5; dropping the
`.src` line saves 48px a row and breaks the two-level provenance promise this page exists
to keep. A third argument closes it independently — see §5 band 2, "why not a stack".

---

## 3. What I inherit, and the four corrections I owe the brief

Read the brief's §3 first; this section only records where I found the record different.
Each of these changes work, so none is silent.

### 3.1 "The full instrument →" does not point at this page

The brief's §0 and §4.1 have this page inheriting the homepage's *"The full instrument
→"* promise. **It does not.** All four instances of that link on the frozen page point at
a **situation detail page**, not at the index:

- `home.html:3155` → `/design/v3/situation-air.html`
- `home.html:3186` → `/design/v3/situation-yamuna.html`
- `home.html:3254` → `/design/v3/situation-soon.html`
- `home.html:3297` → `/design/v3/situation-soon.html`

**What the frozen homepage actually promises on this page's behalf — verified, and updated
for the two amendments that landed after the first draft (D-11.6 and D-12.11):**

| what | where | what it commits me to |
|---|---|---|
| nav label **Now**, three surfaces | `home.html:3049` (header `.navlinks`), `3074` (the `#navidx` panel **and** the `.navscroll` chip rail — both on that line) | the label is frozen; D-11.3 keeps it |
| **three** situation anchors — *was five* | `home.html:3393` `#h-fire` · `3394` `#h-forestloss` · `3395` `#h-monsoon` | three real addresses that must land within ±0.5px of `--nav-h`, **and the number decays to zero** — §R.8 |
| Record door 1, bare | `home.html:4063` | eyebrow *"Updated every hour"*, head *"Today's readings"*, and the body *"Air, river, heat, fire and rainfall, each with its monitor and its hour. Every day's readings keep their own address after they stop being today's."* |
| Record door 2 — **subject changed by D-11.6** | `home.html:4079` → `intelligence.html#method`, i.e. **`#sources`** | *"Every source behind the readings, with its cadence, the date it was last drawn, and whether it is running. Nothing on this site carries a reading without its source beside it."* — **four promises, four columns.** §R.1 and §R.5 |
| footer link | `home.html:4177` | labelled **Environmental Intelligence**, exactly as D-11.3 preserves |

**Correction #1, and it has since been overtaken twice.** As first drafted: it is five
ticker cells and not six, the sixth being the Impact slot pointing in-page at `#impact`
(`home.html:3396`, `class="s-ticker-cell s-ticker-own"`). **D-12.11 then re-pointed Air and
Yamuna at their own situation pages, so it is now three** (§R.8). What survives of the
original point, and it is still load-bearing: **`grep -c "h-heat" home.html` returns 0** —
the frozen homepage contains no link to the shut window at all, so the inbound-anchor set
has never contradicted D-11.2's render set. D-12.11 records that as *"luck, not design"*,
which is fair, and it is why §11 item 8 exists.

**Correction #2 is now closed by ruling.** As first drafted, Record door 2 was a live link
into the band D-11.1 cut, and that was my strongest argument for reserving `#orders` as a
band. **D-11.6 re-pointed the door onto the provenance band instead**, which removes that
argument entirely — and with it the band (§R.1). The revision *inverts* this finding: the
door is now the reason `#sources` must stay, not the reason `#orders` must exist.

**Correction #3 — Record door 1's body names the wrong five.** *"Air, river, heat, fire
and rainfall"* (`home.html:4066`) names Heatwave, which does not render, and omits Forest
Loss, which does. The door also promises *"Every day's readings keep their own address"* —
a per-day permalink archive that exists nowhere and that nothing in this spec builds. Both
are the frozen page's copy and I may not edit it; both are logged for the client (§9,
Q-B).

**Correction #4 — the register the word *instrument* sets is still mine, even though the
link is not.** D-11.3 and the brief's §0 both frame this page as "the apparatus behind the
whole set", and `home.html:509` names the hero's mustard act as *"The full instrument"*.
So I keep the register and I do not reuse the string: **the deck's per-panel door on this
page says something different from the homepage's, so the two links do not read as the
same destination.** Copy slot in §6.

### 3.2 What ports for free, and what the audit missed

The brief's §3 is right that the prototype's content architecture is the asset. Two
additions from the inventory:

**Three frozen components exist and have never been used, and two of them are exactly
what this page needs.**

| component | rule | markup instances in `home.html` |
|---|---|---|
| `.src` — hairline-topped provenance line | `home.html:320–321` | **0.** The hero uses `class="cap s-hero-src"` (`3153`, `3184`, `3252`, `3295`), a band-scoped class |
| `.win` — hairline-topped window block, micro-caps `b` label, 15px/1.5, `max-width:46ch` | `home.html:322–330` | **0** |
| `.chip` | **does not exist** — no rule, no markup | the things prose calls chips are `.give` (`397–399`), `.b-1` (`557`) and `.navscroll ul>li>a.nl` |

So this page becomes the first consumer of `.src` and `.win`. That is better than it
sounds: `BRANDING §4.5` requires two levels of provenance and `.src` *is* level one,
already token'd and already ground-aware; the window band's per-situation block *is*
`.win`. Neither has to be invented and neither becomes a private copy.

**One latent defect in that unused CSS, flagged not fixed.** `home.html:330` is
`.win.closed b{color:var(--mustard)}` — **mustard carrying state**, which §3.1 and §7.7
forbid outright. I do not consume `.win.closed`. The page is frozen so this is for the
record, and it is a live trap for the next page that reaches for `.win`.

**The prototype's rail must NOT be ported, and the audit's own summary gets this
backwards.** `intelligence.html`'s `.rail`/`.rail-l`/`.rail-r` block (CSS 232–317, ~120
lines, with a 37-line rationale at 195–231) is the **superseded** mechanism. The frozen
page replaced it with the eleven-line `.rl` contract at `home.html:267–277` and names the
retirement explicitly at `home.html:249–250`:

> "`--ovh` is gone. `--lw` as a positioning input is gone. The negative margins are gone.
> `.rail-r` draws no border."

The prototype also declares `--lw:56%` **nine times, inline, identically**
(`intelligence.html:765:col2233` … `col17291`) against a CSS fallback of `52%` at its line
240 that is never reached. **Use `.rl`. Do not carry a single line of the prototype's rail
CSS forward.** The two-column *layout* is kept; the mechanism under it is not.

**`.mult` has no base rule on the frozen page.** Its only two declarations are
band-scoped: `home.html:1033` and `1231`, both `.s-hero-read .mult`. So a `.mult` on this
page is a **new declaration** and must be named as one (§4.7). It is set in `--fg`, not
red (`BRANDING §3.4`); the prototype colours it red and that is one of its defects.

**`.verdict.good` does not exist** (`home.html:301–304` has only `.verdict` and
`.verdict.bad`), which is why the prototype's one green verdict is a hardcoded
`style="color:var(--green)"` at `intelligence.html:765:col17931`. Not my problem — there
is no green on this page — but it is the missing token whoever builds the Impact page will
hit.

---

## 4. The reading component, specified once

Every panel in `#readings` is one instance of this. Named against the frozen components,
because a private copy of any of them is the failure mode `BRANDING §5` exists to prevent.

### 4.1 The six parts, mapped to frozen rules

| § | part | class | frozen rule | notes |
|---|---|---|---|---|
| 1 | numeral | `.num` inside `.rl` | `home.html:120–121`, `267` | `.num`, **not `.readout`** — see §4.3 |
| 2 | its rule, in its state | `.rl::after` | `home.html:268–270`; breach `273`; paper `271`, `274` | breach = 6px `--red`, grows **rightward**, kiss unchanged |
| 3 | unit | `.unit` | `home.html:305–308` | micro-caps, `--fg-2`, `margin-top:14px` |
| 4 | verdict | `.verdict` / `.verdict.bad` | `home.html:301–304` | red only when bad |
| 5 | published limit + band scale | `.limit`, `.limit b`, `.bands` / `.bands.bad i.tip` | `home.html:315–319`, `309–314` | where no limit exists the line says so **in words**: *"No legal threshold."* (`BRANDING §4.3`) |
| 6 | provenance and hour | `.src` | `home.html:320–321` | **first consumer.** Source, scope, cadence, as-of |

Plus three things that are not parts of the reading but belong to the panel:

| | class | frozen rule | notes |
|---|---|---|---|
| state mark | `.state` + `.live`/`.demo`/`.closed` (PERIODIC = no modifier's rule, the hollow square is the `.state i` default) | `home.html:291–298` | top-right of **its own** frame, never page-level (`BRANDING §3.3`, D-01.10) |
| window tag | `.tag .tag-season` | `home.html:624–627`, **`643` `{border-style:solid}`** | keeps its box. **Solid.** `home.html:636–642` states why: dashed already means a shut window |
| multiplier | `.mult` | **no base rule — new (§4.7)** | in `--fg`. Renders only where a ratio to a numeric limit exists |

**Screen-reader pattern, ported deliberately.** The prototype puts `aria-hidden="true"`
on the visual numeral and carries the whole reading as one spoken sentence in a
`span.sr` (`intelligence.html:765:col2386`, `col2420`). That is the right pattern and it
must be ported *with* the state word inside it — AD-12 moved all nine mirrors when it
moved the badges (`AD-12 §2.1`). `.sr` is `home.html:531`.

### 4.2 Why `.num` and not `.readout`

`--t-readout` resolves to **99.2px at 375 and 272px at 1440**; `--t-num` to **41.6 and
73.6** (`BRANDING §1.4`). At 375 a 99.2px readout is 33% taller than a 41.6px numeral
before any of its account rows, and the readout floor is a floor — *"do not go below
it"* — so a smaller readout is not available. More to the point: `.readout` is the
**masthead** scale. Five of them on one page is five mastheads, and this page has no
masthead reading at all (§7, Q1). `.num` is the register scale, which is what an index
is. The frozen page's own precedent for a `.num`-scale rail with a right-hand account
column is the farm band, `home.html:1612–1614`.

### 4.3 The two-column geometry, taken from the farm band rather than invented

`home.html:1612–1613`:

```css
section.s-farm{--s-farm-kisspx:calc(.06 * var(--t-num));--s-farm-clear:32px}
```
`home.html:1614`: `@media(max-width:1023px){section.s-farm{--s-farm-clear:24px}}`

The hero does the same at `.readout` scale (`home.html:870–872`), deriving its column gap
as `calc(kisspx + 6px + clear)`. **Copy that arithmetic at `--t-num`.** `--kiss` stays
`.06em` of the numeral's own size (`home.html:95`), which is why it scales for free —
16.32px beside a 272px readout, 5.95px at the 99.2px floor, both exactly `.06×`
(`BRANDING §1.6`).

### 4.4 Wireframe — one panel at 1440

`.wrap` = 1240 − 2×46 gutter = **1148px of content** (`--gut` caps at 46 from 1353px,
`BRANDING §1.5`).

```
 .wrap  ─────────────────────────────────────────────────────────────────────────────── 1148 ──
┌──────────────────────────────────────────┬─┬──────────────────────────────────────────────┐
│  identity ▸ .lbl                         │ │  ◂ .state  [▨ DEMO DATA]        top-right of │
│  "DELHI-NCR / AIR QUALITY INDEX"    ⇥right│ │            the panel's own frame             │
│                                          │ │                                              │
│              .num inside .rl        ⇥right│▌│  .limit                                      │
│                        4 1 2             │▌│  "CPCB SAFE LIMIT 100. LIMIT BROKEN."         │
│              (span.sr, off-screen)       │▌│           └ .limit b, red                     │
│                                     6px ─┘▌│                                              │
│  .unit  "AQI, 24-HOUR ROLLING"      ⇥right│ │  .bands  ▦▦▦▦▦▦   ← 6 cells, tip red         │
│                                          │ │          max-width:340px (home.html:311)     │
│  .verdict.bad   "SEVERE"            ⇥right│ │                                              │
│                                          │ │  .tag.tag-season  [ YEAR ROUND ]  solid box   │
│  .mult   "4.1× the limit"  in --fg  ⇥right│ │                                              │
│                                          │ │  ──────────────────────────  .src hairline    │
│                                          │ │  source · scope · cadence · as-of            │
│                                          │ │                                              │
│                                          │ │  .act  "…"  ▸  or the no-page line (§6.4)    │
└──────────────────────────────────────────┴─┴──────────────────────────────────────────────┘
   grid-template-columns: minmax(0,.52fr) [gap] minmax(0,.48fr)
   gap = calc(.06*var(--t-num) + 6px + 32px)     ← home.html:870-872 pattern at --t-num
   left column text-align:right, so every element registers on the rule
   ▌ = .rl::after, drawn by the NUMERAL's own ::after at left:100% + --kiss. Grows rightward.
     The right column draws NO border (home.html:250).
```

Left column is right-aligned so that the numeral, the unit, the verdict and the
multiplier all register on the same vertical — the rail. That is the frozen hero's own
arrangement (`home.html:3110` numeral wrapper, and the `.s-hero` right-align block).

### 4.5 Wireframe — one panel at 375

`.wrap` = 375 − 2×20 = **335px**. `--gut` floors at **20px**, not 16 (`BRANDING §1.5`;
`situation-air.html` is on the 16px app margin and that is named as a defect).

The rail **rotates, it does not vanish** (`BRANDING §3.4`): the numeral goes full-width,
the rule stays vertical at its right still kissing the last digit, and the account block
drops full-width beneath a hairline that itself carries the breach state. Indenting the
account block to the rule's x was measured and rejected (D-01.6 — it leaves a 211px
measure, ~26 characters a line).

```
 .wrap ──────────────────────────────── 335 ────────────────────────────────
┌───────────────────────────────────────────────────────────────────────────┐
│ .lbl  DELHI-NCR / AIR QUALITY INDEX          ▨ DEMO DATA   ◂ .state        │  17.3 + 10
├───────────────────────────────────────────────────────────────────────────┤
│  4 1 2 ▌   ← .num in .rl, 41.6px, rule still kisses the last digit        │  33.3
│  AQI, 24-HOUR ROLLING                                     ◂ .unit         │  31.3
│  SEVERE                                                   ◂ .verdict.bad  │  32.4
│  4.1× the limit                                           ◂ .mult, --fg   │  29  (1 of 5)
├═══════════════════════════════════════════════════════════════════════════┤  1 + 12
│    ↑ this hairline carries the breach state — 6px --red under a breach     │
│  CPCB SAFE LIMIT 100. LIMIT BROKEN.                       ◂ .limit        │  34.5 (2 lines)
│  ▦▦▦▦▦▦                                                   ◂ .bands       │  42
│  [ YEAR ROUND ]                                           ◂ .tag-season   │  29
│  ─────────────────────────────────────────────────────    ◂ .src hairline │  48.3
│  CPCB continuous monitor. Hourly. Sample value, not a reading.            │
│  ─────────────                                            ◂ .act / no-page│  36
└───────────────────────────────────────────────────────────────────────────┘
                                                          panel total ≈ 352
```

Two things are cut at ≤560, both by existing precedent (`BRANDING §4.5`): the `.src` line
drops the station name and the words "Read" and "today" to hold **one** line, and the
station name lives in full on the situation page. That is the homepage's own cut and it is
why 48.3px and not ~65px.

### 4.6 The 352px, itemised — every input is a frozen token

| element | px | derivation |
|---|---|---|
| `.lbl` identity | 17.3 | `--t-micro` 11.5 × `line-height:1.5` (`home.html:122–123`) |
| gap | 10 | matches the prototype's `margin:0 0 10px` on the same element |
| `.num` | 33.3 | `--t-num` @375 = **41.6** (`BRANDING §1.4`) × `line-height:.8` (`home.html:120`) |
| `.unit` | 31.3 | `margin-top:14px` (`home.html:307`) + 17.3 |
| `.verdict` | 32.4 | `margin:14px 0 0` (`home.html:302`) + `clamp(1.15rem,2.4vw,1.85rem)` @375 = **18.4** |
| `.mult` | 29 | `--t-body` 18 × 1.6 (`BRANDING §2.1`). **1 of 5 panels only** |
| breach hairline + half `--gap-row` | 13 | `--gap-row` @375 = **24** (`BRANDING §1.5`) |
| `.limit`, 2 lines | 34.5 | 11.5 × ~1.5 × 2 |
| `.bands` | 42 | `margin:20px 0 10px` + `i{height:12px}` (`home.html:309–310`) |
| `.tag.tag-season` | 29 | 10.5px + `padding:5px 10px` (`home.html:624–627`) + 8 gap |
| `.src` cut form, 1 line | 48.3 | `margin-top:18px` + 1px border + `padding-top:12px` (`home.html:320`) + 17.3 |
| door row | 36 | `.act` drawn ~22 (`home.html:611–618`) + 14 gap; **hit box 44 via the `::after` expander** (`home.html:2855`) |
| **panel** | **~352** | tallest panel governs — the deck equalises slide heights (D-02.x) |

### 4.7 The one new component, named and justified

**`.mult`, base rule.** Displaces nothing: `home.html` has no base `.mult`, only
`.s-hero-read .mult` at `1033` and `1231`, so there is nothing to reuse and a band-scoped
copy on this page would be the private-copy failure. Specification: Newsreader at
`--t-body`, `<b>` in Archivo, colour `--fg` (`--ink` on paper) — **not red**, because
`BRANDING §3.4` states the breach is already said three ways and a fourth is shouting, and
because the prototype colours it red and that is on its defect list. Rendered only where a
ratio to a numeric limit exists: of the prototype's nine readings only two carry one
(`intelligence.html:765:col2612` air, `col15708` noise), and of my five, one does.

**No other new components.** Everything else in this spec is a §5 component or a token.

---

## 5. Band by band — composition, wireframe, budget

Each band opens with `.im-head` (`home.html:812–817`, collapsing to one column at ≤1023
via `834–839`) — the 12-column opener, head on `1/span 6`, lead on `8/span 5` with
`padding-top:.4em` and `align-self:end`, `margin:0 0 var(--gap-block)`. **Use it for every
band.** The prototype's `.det-head` (4 uses, `intelligence.html:765:col20165`, `col22789`,
`col27065`, `col29557`) is a private near-copy and is deleted; `home.html:800–811` names
the five private copies `.im-head` already replaced.

`.im-head` cost at 375, used in every estimate below:

| | px | derivation |
|---|---|---|
| `.d1` head, 2 lines | 74.3 | `--t-d1` @375 = **43.2** (a *ceiling* on the phone — `BRANDING §1.4`) × `line-height:.86` (`home.html:111`) |
| `--gap-head` | 18 | @375 (`BRANDING §1.5`) |
| `.lead`, 4 lines | 100 | `--t-lead` @375 = **16.96** × `1.48` (`home.html:124`, `BRANDING §2.2`), 46ch ceiling |
| `--gap-block` | 36 | @375 |
| **total** | **~228** | |

---

### Band 1 · `#top` — the masthead · t2 · `#0D0D0B` · mustard only

**Purpose.** Say what the page is, state the method it holds itself to, and — before the
reader meets a set whose size changes — say why it changes. It carries **no reading and no
figure of any kind.**

**No photograph, deliberately.** `BRANDING §5.4` defines a full-bleed hero as "a
photograph that runs edge to edge, carries a display headline inside its frame, and has no
other content in that frame", and the rule for type on a photograph is absolute:
**display type may sit on a photograph, nothing else may.** This masthead carries an
eyebrow, an h1, a micro-caps method line, a lead and a caption — four of those five are
below display. A scrim strong enough to carry 11.5px micro-caps over a bright pixel
"darkens the whole photograph to a rectangle" (same section, and it records that the
attempt failed contrast twice). So: a type wall on solid ground, t2 rather than t1,
because t1's `padding:0` exists for a picture running to the seam and there is no picture.

```
375, .wrap = 335                                1440, .wrap = 1148
┌─────────────────────────────────┐             ┌──────────────────────┬──────────────────┐
│ .lbl  eyebrow                   │ 17.3+18     │ .lbl eyebrow         │                  │
│                                 │             │                      │  .lead           │
│ .d1                             │             │ .d1  ────────────    │  the window       │
│ EVERY                           │             │  EVERY SITUATION     │  rule, as a      │
│ SITUATION                       │ 111.5       │  WE READ             │  sentence        │
│ WE READ                         │             │  (1 / span 6)        │  (8 / span 5)    │
│                                 │ 18          │ .lbl method line     │  align-self:end  │
│ .lbl  method line               │ 17.3        │                      │                  │
│                                 │             ├──────────────────────┴──────────────────┤
│ .lead  the window rule          │ 118         │ .cap  the honesty clause, max 74ch      │
│                                 │             └─────────────────────────────────────────┘
│ .cap  the honesty clause        │ 114           = .im-head with a third row hung under it
└─────────────────────────────────┘
              t2 pad 56 × 2 = 112     →  ≈ 526px at 375
```

At 1440 this is `.im-head` exactly: h1 on `1/span 6`, the window sentence as the `.lead`
on `8/span 5`. The method line sits under the h1 inside the first grid cell at
`--gap-head`, which is where the frozen masthead puts it (`BRANDING §2.3b`: `.lbl`
micro-caps, `--fg-2`, left edge on the spine, `--gap-head` under the h1). The honesty
clause hangs under the whole opener as a `.cap`.

**Populates:** nothing here is a function of n. The window sentence is a *rule*, so it
reads identically at n=1 and n=6, which is the point (§7, Q2). Growth path: unchanged at
all three growth moments.

---

### Band 2 · `#readings` — the deck · t2 · `#151512` · **red**

**Purpose.** The set, as readings. One panel visible, all six parts of §3.4 present,
every panel carrying its own door.

**Component: the frozen deck** (`BRANDING §5.2`) — `.rig` `home.html:471`, `.rig-clip`
`472`/`476–478`, `.rig-track` `479–481`, `.sit` `482–483`, `.rig-bar` `484–486`,
`.rig-tabs` `495–504`, selected-tab `511–512`, `.rig-arrows` `513–519`, `.count`
`520–522`, and the 44px floor at ≤940 at `420–421`. `role="tablist"` / `role="tab"` /
`role="tabpanel"`; **all panels stay in the DOM and in the accessibility tree**;
non-selected panels' focusables take **`tabindex="-1"`, not `hidden` and not `inert`**; it
does not loop.

#### Why not a stack — three independent arguments

1. **Phone budget.** ~352 × 5 + 29 + 228 + 112 = **~2,197px at 375**. 2.4× the cap and
   1.6× `record`'s licensed 1,393.5 (`BRANDING §6.4`). No trim reaches 900 without
   breaking §3.4.
2. **CTA doctrine.** `.act` is *"the band's one CTA"* (`home.html:611–618`, `BRANDING
   §5.8`) and §5.8 puts one primary per band. Five `.act`s in one band breaks that. In a
   deck exactly one is visible, and exactly one is in the sequential tab order.
3. **It is a solved component**, and §7 of the brief requires any displacement to be
   argued against the solved thing it displaces. Once (1) and (2) hold, the argument
   doesn't exist.

#### The one modification: the tab row moves above the panel

**This is the riskiest structural move in the spec and it is forced by arithmetic, not
preference.** On the frozen page `.rig-tabs` lives in `.rig-bar`, *after* the panels
(`home.html:3304–3312`). Costed on this band at 375, the tab row would start at
56 + 228 + 360 = **644px into the band**, against **~635px of actually-visible iOS
Safari** (`BRANDING §6.5`). That is precisely the defect D-01.5 spent 96px of cut copy and
a −19.5px structural move to fix on the hero — *"the deck's whole control bar sat below
the fold on every real phone and a reader at rest got no signal that Yamuna, Monsoon and
Forest Fire exist."* On the index, a reader at rest with no signal that four other
readings exist is not a shortcoming, it is the page failing its only job.

So: **`.rig-tabs` is placed before `.rig-clip`.** Two consequences, both stated:

- The selected-tab marker moves from `border-top` to `border-bottom`, so it still points
  at the panel it selects. With tabs above a panel this is the *conventional* direction,
  so the move is arguably more correct rather than merely different.
- The four numbers that `BRANDING §5.2` says "must move together" —
  `margin:-19px -5px -5px; padding:5px; scroll-padding-inline:5px`, plus `RING=5` in the
  JS — become `margin:-5px -5px -19px; padding:5px; scroll-padding-inline:5px`, `RING=5`
  **unchanged**. The `-19` is `-14` (the marker pull toward the panel) plus `-5` (the ring
  allowance); flipping the row flips which edge carries the `-14`.

**Gate it, because this component has been bitten twice.** `BRANDING §6.2`: a scroll
container clips both axes, and *"padding alone only guarantees the ring at `scrollLeft
0`"* — a click out and back left the frozen row resting at `scrollLeft 5`, exactly the
allowance scrolled off. So: ring overhang **0.00 on all four sides at every width, at rest
and after scrolling**, and the marker read in a PNG at 375 and 1440. **Fallback if it does
not clear:** leave `.rig-tabs` verbatim in `.rig-bar` and put a names-plus-state-chip
index rail above the panel instead, accepting the duplication under D-02.1's
"different in shape" licence. I do not recommend the fallback — it is two objects doing one
job, which is exactly the complaint D-02.1 was resolving.

**The prototype's `setActive`/`hidden` machinery is retired, not ported.**
`intelligence.html`'s JS hides panels with the `hidden` attribute at runtime (lines
849–854, `slides()` filtering on `!hasAttribute('hidden')` at 806, sets declared at 860,
`apply('6')` at 868) to serve the reader-facing `3 on` / `6 in window today` /
`All 9, in and out` control at `765:col19881`–`col20031`. **D-11.2 retires that control**,
and membership is a *server* concern: a situation whose window is shut is not emitted at
all (`BRANDING §4.2`). Selection is the only thing left for JS, and selection uses
`tabindex`, not `hidden`.

#### The anchor problem, and how it is solved

> **Corrected by §R.8: it is three inbound anchors, not five, and the number decays to zero
> as each situation gets its own page (D-12.11). The mechanism below is still needed for
> those three, but it should be built cheaply and guarded rather than engineered.**

Three inbound anchors point at panel ids inside a horizontal scroll-snap track. Native
anchor navigation would try to scroll the track horizontally *and* the document
vertically, and `BRANDING §10`'s gate 14 requires both paths — cold load with the hash and
a same-page click — to land within **±0.5px of `--nav-h`**.

Specification: **panel ids stay on the panels** — all five, because a reader may still
arrive at `#h-air` from a bookmark or an external link even though the ticker no longer
sends them there, and `h-air`/`h-yamuna`/`h-fire`/`h-forestloss`/`h-monsoon` are the ids the
frozen page has used all along — and a guarded
handler reads `location.hash`, selects that panel through the existing `mark()`, and
scrolls **the band**, never the panel. `html,body{scroll-padding-top:var(--nav-h)}`
(`home.html:379`, set on both because `body{overflow-x:hidden}` makes body a scroll
container too) then does the offset for free. Guard it the way the underline observer is
guarded (`BRANDING §5.10`: no feature, no attribute, no error) — with no JS the hash still
lands on the band, which is the right degradation.

`situation-soon.html:629` carries the line *"Nothing outside a page links to an anchor on
the slider."* The frozen homepage does exactly that, three times. This is the mechanism that
makes it true — and D-12.11's rule is the mechanism that eventually makes it unnecessary.

```
375, .wrap = 335                                          budget
┌───────────────────────────────────────────────┐
│ .im-head   .d1 head  +  .lead                 │  228
├───────────────────────────────────────────────┤
│ .rig-tabs  role=tablist   ← MOVED ABOVE       │   50   44px hit floor at ≤940
│  AIR │ YAMUNA │ FOREST FIRE │ FOREST LOSS │…  │        (home.html:420-421)
│  ▔▔▔▔  3px border-bottom marker, --fg         │        overflow-x:auto + 8px mask
├───────────────────────────────────────────────┤
│                                               │
│   ONE PANEL  ·  the §4.5 wireframe            │  360   tallest panel governs
│                                               │
├───────────────────────────────────────────────┤
│ .rig-bar   "1 of 5"        ◂ .count   [◂][▸]  │   50   arrows 44×44 at ≤560
└───────────────────────────────────────────────┘
                          t2 pad 56 × 2 = 112   →  ≈ 800px at 375
```

At 1440: identical structure, the panel taking the §4.4 two-column geometry. `.rig-tabs`
does not need to scroll at 1440 for six tabs; it scrolls on a phone, with the same 8px
hard ground-coloured fade the hero's tab row and `.navscroll` use (`home.html:462–463`,
plus the real 8px trailing flex item at `2894`, because a flex container's trailing padding
is not honoured as scrollable overflow).

**Populates.**

| | minimum (n=1) | maximum (n=6) |
|---|---|---|
| tab row | **hidden**, with `.rig-arrows` and `.count`. A tablist of one tab and a pager reading "1 of 1" are noise. The band then reads as one reading under an opener — composed, not broken | six tabs, scrolling at 375 with the mask; no scroll at 1440 |
| panel | unchanged | unchanged |
| band height at 375 | ~700 (loses the 50px tab row and the 50px bar) | ~800 |

This is the fix for the ticker's own unsolved soft spot — `BRANDING §9.1` records that
*"the count wording has never been seen at a low n. n=1 is arithmetically possible in
February"* and that it is blocked behind the window fields. A deck answers n=1 by
withdrawing its controls; a strip cannot.

**Growth path.** Air's page ships → one panel's door row changes fill, no re-composition.
A second page ships → same. The first feed is wired → one `.state` chip changes word and
fill pattern, one `.src` clause changes; `BRANDING §3.3` guarantees the chip's box is
identical across all four words, so nothing reflows. **No re-composition at any of the
three moments.**

---

### Band 3 · `#windows` — the window grammar · t2 · `#F3F2F0` · no hue

> **CUT BY REVISION 1 (§R.1).** The client is right that the table is per-situation
> reference data that every situation page carries anyway. **The rule survives** — in
> `#top`'s `.lead` and as `#rules` row 03 (§R.4). Two things below are still live and worth
> keeping: the ruling on **not naming the shut situation**, which is why cutting the table
> dissolved my own Q-C; and the **third-licensed-scroller** argument, which does **not** go
> away — it transfers to `#sources`, whose five-column table needs it for the same reason at
> the same widths, with the same 8px mask. **The request is now for one new scroller, not
> two.** §R.3 is the live ledger.

**Purpose.** Make a changing count legible. This is the band that has to stop a reader who
returns in March from reading a sixth situation as a defect — the consequence `BRANDING
§4.2` assigns to every page that inherits the ruling.

**On paper, and it earns it.** `--paper` is *"long reading and section breaks only"*
(`home.html:21`). This band and `#legend` are the only two bands on the page carrying
actual paragraphs, and they are the two paper bands. The source table stays on dark —
see band 4.

**It does not name the situation that is absent.** The prototype's `#windows` table has
nine rows, one of them Heatwave, reading *"Out of window. Returns 1 March 2027"*
(`intelligence.html:765:col22004`). **Rendering that row renders the situation**, and
D-11.2 is absolute: no dormant cell, no OUT OF SEASON row, no toggle. So the table carries
**only the rendering situations**, and the *rule* about closed windows is carried by the
prose, which names no situation. This is the one place the ruling and the band's own
purpose pull against each other, and I have resolved it toward the ruling; it is a client
question (§9, Q-C) because a different answer changes the table.

**Component: `.win`** (`home.html:322–330`), first consumer. `.win.closed` is **not**
consumed (§3.2).

```
1440, .wrap = 1148                              375, .wrap = 335
┌────────────────────┬──────────────────┐      ┌──────────────────────────────────┐
│ .im-head           │  .lead           │      │ .im-head  .d1 + .lead        228 │
│  .d1 head          │                  │      ├──────────────────────────────────┤
│  (1/span 6)        │  (8/span 5)      │      │ .body   the window rule      115 │
├────────────────────┴──────────────────┤      │ .cap    the two shapes        78 │
│ .body   the window rule, 62ch         │      ├──────────────────────────────────┤
│ .cap    the two shapes of window, 60ch│      │ ┌──── .tbwrap ─────────┐ scroll→ │
├───────────────────────────────────────┤      │ │ SITUATION │ WINDOW │ …│    250 │
│ table.tb — 4 columns, n rows          │      │ │───────────┼────────┼──│        │
│  SITUATION │ WINDOW │ SHAPE │ CLOCK   │      │ │ Air       │ …      │  │  8px ▓ │
│  ──────────┼────────┼───────┼───────  │      │ └──────────────────────┘  mask   │
│  n rows, one per RENDERING situation  │      ├──────────────────────────────────┤
├───────────────────────────────────────┤      │ .act   one CTA                36 │
│ .act   one CTA                        │      └──────────────────────────────────┘
└───────────────────────────────────────┘              t2 pad 112  →  ≈ 819px
```

**The table's fifth column is deleted.** The prototype's header is
`Situation | Window | Shape | Clock | On 19 August` (`intelligence.html:765:col20741`),
and *"On 19 August"* is a typed date in a table header — a dated claim in static markup
(§7.9), and the page's "now" is hardcoded to 19 August 2026 in **eight** places. Four
columns, and whether a window is open is already visible: the situation is on the page.

**The table scrolls at ≤767 — the site's third licensed horizontal scroller, and I am
asking for it explicitly.** `BRANDING §6.6` licenses exactly two (the ticker and the
journeys rail, plus the nav chip row and the deck track as chrome). Four columns at 335px
is 84px a column, which cannot hold *"1 June to 30 September"*; the alternatives are both
worse. Costed: hiding columns to two leaves the band at ~934px (**over the cap**) and
takes information away from the reader who has least of it; scrolling costs ~250px against
~580px for stacked per-situation `.win` blocks and keeps every cell. It takes the same
8px hard mask and the same trailing flex item as the other two.

**Populates.**

| | minimum (n=1) | maximum (n=6) |
|---|---|---|
| the prose | identical — it states a rule, not a set | identical |
| the table | one row. A one-row table under a header still reads as a table; it does not read as a grid missing cells | six rows |
| band at 375 | ~700 | ~819 |

**Growth path.** No change when a page ships. **Changes when the window fields land**: the
cells stop being slots and start being data. Until then every cell in this table is a slot
(§6.5) and **the band cannot ship** — see §9, Q-D.

---

### Band 4 · `#sources` — provenance, level two · t3 · `#0D0D0B` · no hue

> **KEPT, AND REFRAMED — see §R.1 and §R.5.** The client asked whether this band was
> necessary; my answer is that it is the only band on the page anything links to, its rows
> are **sources rather than situations** so no inner page can carry it, and it is already the
> work-in-progress statement they asked for. Everything below stands. What changes is the
> head, the lead, and the constraint that **all four data columns must survive** because
> D-11.6's amended Record door promises them one for one.

**Purpose.** The second of the two provenance levels `BRANDING §4.5` requires: the
reading's own `.src` line is level one, and this is the page-level table of every feed with
its cadence, its as-of and its state. The homepage cannot carry this and this is the page
that owes it.

**On dark, and against the prototype's precedent.** The prototype puts this table on
`.paper` (`intelligence.html:765:col27007`, `section class="paper" id="method"`). I am
moving it to dark for one substantive reason: **the `.state` chip is `currentColor`, so it
renders `--fg-2` on dark and `--ink-2` on paper** (`home.html:293–294`). On the page that
*teaches* the chip, the chip should look the same in the table as it does in the deck. On
dark it does — the same ink, the same 11.5:1-class contrast, one mark with one appearance.
The prototype's ground choice is not evidence either way: it has no tier system and no
ground rhythm at all (`--pad` on every band, zero `.t1`–`.t4`).

The table's cells are labels, cadences and short noun phrases, not sentences — *"Hourly"*,
*"No reading"*, *"Air quality index, PM2.5, PM10"* — so a dark ground does not violate
paper's long-reading contract. The band's one paragraph of prose is its intro, which is
short.

**Keep the prototype's five columns as they stand:**
`Source | Feeds | Cadence | As of | State` (`intelligence.html:765:col27575`). AD-12
already earned the fourth column's header — *"Last fetch" → "As of"*, because nothing on
this page is fetched at all (`AD-12 §2.1`) — and the fifth column holds a live `.state`
chip, the only non-`.st` cell in either table. Keyed by **source** (7 rows), where
`#windows` is keyed by **situation** (n rows). **The two denominators are different on
purpose and must not be reconciled**: the prototype states both and both are correct
(`AD-12 §2.1` counted them independently).

```
375, .wrap = 335                                budget
┌───────────────────────────────────────┐
│ .im-head   .d1 + .lead                │  228
│ .body   the feed inventory sentence   │  115   ← H23, ported (§6.2)
├───────────────────────────────────────┤
│ ┌──── .tbwrap ──────────────┐ scroll→ │
│ │ SOURCE │ FEEDS │ CADENCE …│         │  348   7 rows × 44 + 40 header
│ │────────┼───────┼──────────│         │        5 cols → scrolls at ≤767
│ │ CPCB   │ …     │ Hourly   │  ▓ 8px  │        same mask
│ └───────────────────────────┘         │
└───────────────────────────────────────┘
                     t3 pad 44 × 2 = 88  →  ≈ 779px at 375
```

**No CTA on this band, and it is a deliberate exception to §5.8.** The prototype's is
*"Download the readings as CSV"* (`intelligence.html:765:col29241`) on a dead `href="#"`.
A CSV of specimen values is a downloadable claim that leaves the page entirely, where no
honesty chip can reach it — the same argument as the share card (§7, Q4). It returns the
day a reading is not a specimen. Named here rather than quietly omitted.

**Populates.** Rows are sources, not situations, so this band is **already independent of
the situation count** — Heatwave's absence removes no row, because IMD still feeds Climate
Event. Minimum is one row; maximum is however many sources exist. Growth path: no change
when a page ships; **one cell changes per row when a feed is wired** — the state word and
its fill pattern, and the as-of stops saying *"No reading"*. No re-composition.

---

### Band 5 · `#orders` — reserved · t4 · `#151512` · no hue

> **CUT BY REVISION 1 (§R.1).** D-11.1 reserved the idea *"in the spec"*, and this document
> is the spec — the page did not need to render 152px of apology. D-11.6 also removed the
> inbound door that was half my reason for it. **The reservation and every constraint on the
> band's return are held in §R.6**, including the part below that survives verbatim: nothing
> from the prototype's orders band is carried forward, not even its empty state. What the
> section below got right and §R.6 keeps is that this band would need re-composing on
> return; what it got wrong is shipping it at all.

**Purpose.** Hold the place D-11.1 told me to reserve, and honour the inbound link from
`home.html:4069`. **It has no contents and it says so.**

D-11.1: *"Keep the idea as a named future section so the composition reserves its place.
Do not design its contents."* So this band has an `id`, an `.h2` section label and one
paragraph. It has **no `.im-head`** (an opener with a lead promises a section), **no
numeral, no table, no CTA** — §5.8's "every section carries a button" cannot be met by a
section with nothing behind it, and that is the second named exception on this page.

**t4 is the point.** `--pad-t4` is 22px at 375 against t2's 56 — the site's quietest tier,
which `home.html:778` assigns to strips. A reserved slot should be the smallest thing on
the page.

```
375 and 1440, .wrap                             budget
┌───────────────────────────────────────┐
│ .h2   ORDERS AND POLICY               │  21.6
│ .body   one paragraph: what this will │  86    3 lines
│         be, and that it is not here   │
└───────────────────────────────────────┘
                     t4 pad 22 × 2 = 44  →  ≈ 152px at 375
```

**Nothing from the prototype's orders band survives.** Six order cards with docket
numbers, six `<time datetime>` attributes, a six-chip theme filter, an `#ordcount`, an
`#ordempty` and a *"The full order index, 2004 onward"* CTA — all of it goes
(`intelligence.html:765:col22730`–`col27007`). Every docket was invented; `OA 412/2026`
reuses the AQI figure as a case number, which is how D-11.1 identified it. **Do not carry
one string of it forward, including the empty state**, however good its sentence is (H22,
§6.2) — an empty state for a tracker that does not exist is a tracker.

**Populates — and this is the one band that WILL need re-composing.** Declared as a
deliberate, dated exception per the brief's §4.1: the day real filings exist with attached
documents, this band goes from a t4 strip to a t2 or t3 section with an `.im-head`, a
ruled-row register (`BRANDING §5.5`) and a CTA. **Its ground must be re-picked at that
moment** — a t2 band at position 5 between `#0D0D0B` and `#ECEBE8` still passes adjacency
on `#151512`, so the *hex* survives; the *weight cut* at 4 → 5 does not, because it is
currently carried by the t3 → t4 padding step. Whoever restores this band re-checks
§2.1's fourth row, and nothing else on the page moves. Blocked on: an order content type,
and the source-URL field the schema lacks (D-11.1, situation brief §4 item 5).

---

### Band 6 · `#legend` — the vocabulary · t2 · `#ECEBE8` · red + mustard as specimens

**Purpose.** Teach the four state words, the three rail states and the three hue rules.
D-11.2 moved this job here: *"the teaching moves to the legend band, where specimens
belong and where they can be labelled as specimens rather than impersonating
situations."*

**This is the most interesting problem on the page and the brief says so: teach four words
when the live set exercises two, without faking a third.** Today's five readings carry
**DEMO DATA** (Air, Forest fire) and **PERIODIC** (Yamuna, Forest loss, Climate Event) —
per `AD-12 §2.1`, which set every one of them. LIVE and OUT OF SEASON go unexercised.

**The answer already exists on this site and it is ruled.** `system.html` carries the four
words as a specimen row — *"Feed state · carried by SHAPE, never by hue"* — and AD-12
examined it, kept it, and wrote down why:

> "A badge is a claim about a reading. With no reading attached there is no claim…
> Deleting it from the sheet that *defines* the vocabulary would delete one of the four
> words from the spec." (`AD-12 §2.3`)

and it added the disclosure that makes it safe: *"Specimens: no reading on this site
carries LIVE yet."* **So the legend renders all four state chips, with no numeral, no
label, no source line and no date beside any of them, under a clause saying they are
specimens.** LIVE and OUT OF SEASON are taught without a situation impersonating them.
That is the resolution, and it needs no new device.

**On green, and I am recommending against a swatch.** The prototype's legend has three
hue cells with three filled swatches — `--mustard`, `--red`, `--green`
(`intelligence.html:765:col29821` onward). A green swatch beside a red one puts both hues
in one band, which `BRANDING §3.2` forbids outside a "visually caged ticker-class summary
strip", and this band cannot take the ticker's caging because it must show mustard, which
the ticker exemption forbids. My recommendation: **green's rule is stated in words and
gets no mark.** There is no green anywhere on this page, so a swatch would be teaching a
vocabulary item with no referent — and the site's own grammar for exactly that case is a
sentence, not a device (`BRANDING §4.3`: no limit exists → *"No legal threshold."*, in
words, never a blank or a dash). Red and mustard, which the page does use, get marks. Cost
of the alternative is in §9, Q-E: a green swatch needs the site's **second** red/green
exemption, and that is a client ruling, not mine.

**Red is taught by the rail, not by a swatch.** Three bare `.rl` rules side by side —
1px `--rule-2` at rest, 6px `--red-ink` in breach, 1px dashed for a shut window — under
three micro-caps labels, with **no numeral attached**. That is the site's own vocabulary
(rules and type), it carries no figure and therefore no claim, and it demonstrates the
shape-carries-state principle in the same gesture. Rules: `home.html:267–277`, paper
recolour at `271`/`274`, dashed at the `.closed` variant.

**Paper faces only, and the band says so.** On `--paper-2` the state chips render
`--ink-2` (`home.html:294`) and red renders `--red-ink` (`302`, `319`, `274`). One line
notes that the same marks render `--fg-2` and `--red` on dark, and the band's one CTA is
`.b-1` → `system.html`, which is where both faces are shown twice over. That is the
prototype's own CTA and destination (`intelligence.html:765:col31129`, *"The full system
sheet"*) and it is the one live link in its legend.

**On paper because a legend is a reference object**, and reference objects on this site are
paper — `home.html:4038` names `#record`'s ground with *"The archive is paper."*

```
1440, .wrap = 1148                                    375, .wrap = 335
┌────────────────────┬──────────────────┐            ┌───────────────────────────────┐
│ .im-head  .d1      │  .lead           │            │ .im-head              228     │
├────────────────────┴──────────────────┤            ├───────────────────────────────┤
│ FEED STATE — four specimens, one row  │            │ FEED STATE   2 × 2 grid   64  │
│  ■ LIVE   □ PERIODIC  ▨ DEMO DATA     │            │  ■ LIVE      □ PERIODIC       │
│  ⬚ OUT OF SEASON                      │            │  ▨ DEMO DATA ⬚ OUT OF SEASON  │
│  + the specimen clause                │            ├───────────────────────────────┤
├───────────────────────────────────────┤            │ THE RULE     2 × 2 grid  100  │
│ THE RULE — three states, one row      │            │  │ at rest   ▌ breach         │
│  │ AT REST   ▌ BREACH   ┊ SHUT WINDOW │            │  ┊ shut window                │
├───────────────────────────────────────┤            ├───────────────────────────────┤
│ THE THREE HUES — three cells          │            │ THE HUES  stacked         234 │
│  ▬ MUSTARD  ▬ RED   GREEN (words only)│            │  ▬ mustard / ▬ red / green    │
├───────────────────────────────────────┤            ├───────────────────────────────┤
│ .cap  shape-not-colour clause, 60ch   │            │ .cap  shape-not-colour     78 │
│ .b-1  → system.html                   │            │ .b-1  → system.html        48 │
└───────────────────────────────────────┘            └───────────────────────────────┘
                                                        t2 pad 112  →  ≈ 864px at 375
```

**The 2×2 collapse at ≤767 is load-bearing for the budget.** One-per-row costs 117 + 190
= 307px; 2-up costs 64 + 100 = 164px, and the band lands at ~864 instead of ~1,007. Two
columns at 335px is 157px each, which holds a 9×9 mark and a micro-caps word comfortably.

**Populates.** **Nothing in this band is a function of any count** — four state words, three
rail states, three hues, all fixed by `BRANDING §3.1`/§3.3. Minimum and maximum are the
same band. Growth path: **one clause changes when the first feed is wired** — the specimen
clause stops saying *no reading on this site carries LIVE yet* and starts saying which one
does. That is a one-sentence edit, not a re-composition, and it is the only line on the
page that has to be touched on feed day.

---

## 6. Copy — slots, labels and structural strings

Per the client's instruction: **the labels and structural strings needed to read the
layout, plus specimen text where the composition cannot be judged without it, clearly
marked.** No finished editorial prose for five situations whose pages do not exist.

### 6.1 New copy proposed — needs approval, and I have marked what is a specimen

| slot | proposed / specimen | status |
|---|---|---|
| `#top` `.lbl` eyebrow | `Now / the index` — no date, no hour. The prototype's is *"Environmental Intelligence  /  the index  /  Wednesday, 19 August 2026, 07:00 IST"* (`intelligence.html:765:col22`), and the tail is a typed dated claim (§7.9) | **NEW, needs approval** |
| `#top` `.d1` h1 | **EVERY SITUATION WE READ** | **NEW, needs approval.** Reasoning in §7, Q1 |
| `#top` `.lbl` method line | **Every reading against its published limit** | **REUSED VERBATIM** from the frozen masthead. Approved copy under the never-rewrite rule (D-01.12, measured 315.4px, `BRANDING §2.3b`). Not new |
| `#top` `.lead` window rule | *specimen:* "A situation is on this page while its window is open. When the window shuts it leaves the page, and the page gets shorter." | **SPECIMEN.** The slot is "the window rule as a sentence, carrying no count". Costed at 4 lines / 118px at 375 |
| `#readings` `.d1` head | slot: names the object, not the day. **Not** *"Today's readings"* — the frozen Record door already uses that string (`home.html:4065`) and it is tensed | **SLOT** |
| `#readings` tab labels | one short word or phrase per situation — `Air` · `Yamuna` · `Forest fire` · `Forest loss` · `Climate Event` (+ `Heatwave` in season). These are the frozen ticker's own cell labels (`home.html:3391–3395`) | **REUSED**, and it needs a backend field (§8, item 13) |
| `#readings` door, page exists | slot: a phrase that is **not** *"The full instrument"* — §3.1, correction #4 | **SLOT** |
| `#readings` door, no page | *specimen:* "No page for this one yet." Rendered as `.lbl` in `--fg-3`, in the same row and at the same y as the `.act` | **SPECIMEN.** §7, Q3 |
| ~~`#windows` `.d1` head~~ | — | **VOID — band cut (§R.1)** |
| `#sources` `.d1` head | slot — and **reframed**: it names *what is wired and what is not*, not "provenance" (§R.5) | **SLOT** |
| `#sources` `.lead` | slot — **NEW**: the work-in-progress clause, pointing at the state column below rather than stating an intention (§R.5) | **SLOT, new** |
| ~~`#orders` `.h2`~~ | — | **VOID — band cut (§R.1).** The head string *"Orders and policy"* is no longer needed for door agreement either: D-11.6 changed that door's subject |
| ~~`#orders` `.body`~~ | — | **VOID — band cut.** The prohibition it carried now lives in §R.6 and, for the POLICY door, in §R.7 |
| `#rules` — five rule titles + five fact lines, head, lead, cap, CTA | **DRAFTED — §R.12.1 and §R.12.1a** | **awaiting approval** |
| `#why` — head, lead, three door eyebrows/heads/bodies, three destination phrases, closing `.cap` | **DRAFTED — §R.12.2.** Door 3 audited against D-11.8 in §R.12.2a | **awaiting approval.** POLICY's destination is the one open item — §R.14 item 1 |
| `#sources` — reframed head + work-in-progress lead | **DRAFTED — §R.12.3** | **awaiting approval** |
| `#legend` `.d1` head | slot. **Not** the prototype's *"Why this page goes red"* (`intelligence.html:765:col29650`) — the band now teaches four state words and three rail states as well as three hues, so a head about red under-describes it | **SLOT** |
| `#legend` specimen clause | *specimen:* "Specimens. No reading on this site carries LIVE yet, and nothing on this page is a situation." | **SPECIMEN**, built from `AD-12 §2.3`'s ruled wording |
| `#legend` green rule | slot: green's rule **in words, with no swatch** — and it must be the **current** rule, *what Swechha has done* (D-07.2), not the retired *past-tense recovery* | **SLOT.** §6.3 |

### 6.2 Ported verbatim from the prototype — the honesty grammar

Thirty sentences were inventoried. These land in this composition, at these addresses.
The brief is right that they port for free; I would not improve on any of them.

| # | prototype | lands in | note |
|---|---|---|---|
| **H4** | `765:col1443` — *"…There is no LIVE badge anywhere on this page, because that would be a claim the data cannot support."* | `#top` `.cap` | **The thesis sentence.** Its leading arithmetic (*five readings… three sample values… one out of season*) counts nine and **must be recounted or cut** — the set is five. Recommend cutting the count and keeping the clause from *"There is no LIVE badge"* |
| **H23** | `765:col27228` — *"Where every number on this page comes from. If a reading is stale, this page says so rather than showing you the last good value as though it were current. None of the seven feeds below is wired yet…"* | `#sources` `.body` | keeps its own denominator (7 **sources**, not 5 situations). Do not reconcile it with H4 |
| **H28** | `765:col30846` — *"Feed state is a separate question from severity and uses shape, not colour: a filled square is live, a hollow one is periodic, a hatched one is demo data, a dashed one is out of season. A situation can be in breach and be demo data at the same time."* | `#legend` `.cap` | the page's best line, and it is also the spec for `.state i` (`home.html:295–298`) |
| **H17** | `765:col20334` — *"Every situation carries a validity window, and the window is what puts it in the list… Nobody has to remember to switch anything on in March."* | **re-homed by §R.1** — its opening clause becomes `#rules` **row 03's fact line**, and its closing clause (*"Nobody has to remember to switch anything on in March"*) is the honest half worth keeping | **the middle clauses still must go**: *"Heat runs March to mid-July"* names a situation that does not render, and its dates are invented. Note the irony: that sentence is currently **false of the codebase** — `getActiveSituations()` has no date logic, so somebody *does* have to remember. It becomes true when D-11.5's windows are wired |
| **H18** | `765:col20552` — *"Two shapes of window, and they behave differently. A recurring season repeats every year and says when it returns. A one-off window has a real end and never comes back."* | **re-homed by §R.1** — `#rules` row 03's fact line, with H17 | ports whole |
| **H25** | `765:col30070` — *"It never touches a reading and it never means anything is fine."* | `#legend`, mustard | ports whole |
| **H26** | `765:col30340` — *"Applied by comparing the reading to the limit, never by a designer."* | `#legend`, red | ports whole |
| **H13** | `765:col16419` — *"Not yet wired. Shown to prove the state."* | available for `#sources` | its own reading (Noise) is gone; the phrase is the bluntest on the site and worth keeping in the table |
| **H15** | `765:col18012` — *"Swechha's own record, not a public feed."* | not used | its reading left the page with Out of River |
| **H19** | `765:col22440` — *"When a window closes the situation does not disappear and it does not 404…"* | **rejected** | its second half instructs the reader to *"Switch the control above to All 9"* — the control D-11.2 retires — and its first half contradicts D-11.2's own ruling, since on the front end a closed situation **does** disappear. This is the sentence the brief means when it says "the copy argues the opposite of the ruling" |
| **H22** | `765:col26572` — *"No order under this theme since the tracker opened. That is a finding, not a gap, and it stays on the page."* | **rejected** | excellent, and it is an empty state for a tracker that does not exist. Recover it when `#orders` returns |
| H1, H3, H16 | index lead, tile caption, `.cfg` label | **rejected** | H1 promises *"what changed overnight"* (no second reading exists) and *"the link is on the situation"* (four of five have no page). H3 names Heatwave. H16 describes the retired control |
| H5–H12, H14 | the nine `.hwhy` paragraphs | **not ported** | these are per-situation editorial copy and they are exactly what the client said not to write yet. Every one contains an uncheckable figure (§6.5). They are derived from the situation pages when those exist |

### 6.3 One sentence that must be rewritten, not ported

The prototype's green rule reads *"Green only ever labels a past-tense recovery"*
(`intelligence.html:765:col30681`). **D-07.2 widened green on 21 August to "what Swechha
has done"**, explicitly so that reach figures — *"3M+ children and young people"*, *"6
million youth reached"* — may be green. `BRANDING §3.1` records the widening. The
prototype's sentence is the pre-widening rule, and **this is the page that defines the
vocabulary for every page after it**, so it is the worst place on the site to ship the
stale version. New copy needed.

### 6.4 The door row, both fills

The row is **one structure with two fills, at the same height and the same y in every
panel.** This matters mechanically: the deck equalises slide heights, so a panel with an
`.act` and a panel without would put ~44px of hole in four panels — the exact defect the
ticker pass measured and fixed (*"71.5 / 78.3 / 78.3 / 0 → 0 / 0 / 0 / 0 across the four
slides… the plate now lands at the same y on every slide"*, `DECISIONS:559–564`).

| fill | element | when |
|---|---|---|
| a door | `.act` (`home.html:611–618`) + the frozen 16px arrow SVG, hit box 44 via the `::after` expander (`home.html:2855`) | that situation's page exists |
| the hole | `.lbl` in `--fg-3` (12px floor — `BRANDING §1.2`), no border, no arrow, not a link | it does not |

**Disabled carries no hue at all** (`BRANDING §5.8`) — so the hole is not a greyed
button, it is a line of type. A greyed control would be a door that cannot be opened,
which is the fake door the through-line forbids.

### 6.5 Every figure the layout wants — named as a slot

**No figure on this page may need to be true** (brief §6), and `2026-08-21-SOURCE-FACTS.md`
contains **no environmental figures at all**. So: every value below is a slot. Nothing in
this document invents one.

**Per reading — 16 slots × n:**

| slot | fills from | today |
|---|---|---|
| the value | `liveData.value` ✓ exists | specimen (`mock: true`) |
| the unit | `liveData.unit` ✓ (optional — should not be) | — |
| the verdict word | **no field** | — |
| the published limit value | **no field** (situation brief §4 item 1) | prose only |
| the authority that publishes it | **no field** | prose only |
| the six band boundaries | **no field** (§8 item 9) | — |
| which band the value sits in | **no field** | — |
| whether the tip is red | derived from limit + value once `limit` exists | hand-typed today |
| the multiplier | derived from limit + value | hand-typed today |
| source name | `liveData.sourceLabel` ✓ | — |
| source URL | **no field** (situation brief §4 item 5, and D-11.4 names it) | — |
| scope / station | **no field** | prose only |
| cadence | **no field** | prose only |
| observed timestamp | `liveData.updatedAt` ✓ but `min(1)`, no ISO validation | — |
| the state word | **no field** — only the binary `mock` (§4 item 7) | — |
| the window tag word | derived from the window fields (§4 item 2) | — |
| the derivation sentence | **no field** (§8 item 10) | — |

**`#windows` — VOID, band cut (§R.1).** It was 4 slots × n — window start, window end, shape,
clock — all from fields that do not exist, with the prototype's values invented (*"1 March to
15 July"*, *"1 June to 30 September"*, *"day 80 of 122"*). **Cutting the table removes four
slot-columns from this page, and that is the single largest honesty gain in the revision:
this page now needs zero window values.** D-11.5's six windows are still required, for the
mechanism and the situation pages (§R.9, R-5).

**`#rules` — zero figure slots.** Five rule titles and five fact lines, all prose, no value.
**`#why` — zero figure slots**, and the POLICY door is prohibited from carrying one at all
(§R.7).

**`#sources` — 5 slots × rows**: source name, what it feeds, cadence, as-of, state. Four of
five have no field. The prototype's seven rows name **CPCB, DPCC, IMD, NASA FIRMS, Swechha
field record**; the situation brief §3 warns that CPCB has no stable public API, a CPCB
daily bulletin is PERIODIC and not a feed, there is no real-time public Yamuna feed, and
IMD was rejected as brittle. So the *cadence* and *state* cells are slots too, not
transcriptions.

**Page-level figures: zero.** No count, no total, no change figure, no aggregate. That is
§7, Q2's answer and it is also why this table has no page-level section.

**One slot I cannot fill honestly, and I disagree with the brief about it.** The brief's §4
says *"Three of the prototype's nine readings were missing their band scale — none of
yours may be."* Of the five that render, the prototype gives four a `.bands` scale and
**Forest loss none** (`intelligence.html:765:col9463`, no `.bands`). Its own copy explains
why (H9: *"Tree cover loss is not always deforestation and it is never a weekly number"*).
A six-band severity scale for cumulative tree-cover loss is a derivation, and inventing
one is exactly what §6 forbids. So either the owner supplies bands for Forest loss, or
that reading renders without a scale and its `.limit` line says *"No legal threshold."* in
words — which is the site's own grammar for the case (`BRANDING §4.3`) and which the
right-hand column already survives (the prototype's does, three times). I have specified
the second, and named it here rather than silently failing the brief's requirement.

---

## 7. The four open questions

### Q1 — The index's `<h1>`: a constant, and it is *EVERY SITUATION WE READ*

**Recommendation: a constant, and my proposed string is "EVERY SITUATION WE READ".**

D-10.2 binds a *situation page's* headline and this is not one, so the ruling does not
reach it by its own terms. The reasoning does, twice over. The prototype's h1 is *"Six
situations, four of them illegal"* (`intelligence.html:765:col232`) and it fails on three
separate frozen rules: it is **two stated totals** (§7.8) in the largest type on the page;
the near-identical *"Nine situations, read against the law"* is **already on record as
rejected** (`BRANDING §2.3b`) for the precise reason that *"the number invites a count the
band fails"*; and *"six"* goes false in March when Heatwave returns, in static markup,
which is §7.9. There is also an internal contradiction the brief names: the h1 says four
illegal, the rendered set contains three.

Why this string. **"Every"** is the word that makes a changing count a feature: it is true
at n=1 and at n=6, so the headline never needs recomposing and never invites the count. It
**names the subject** (the situations, and the act of reading them), which is what D-10.2's
reasoning asks for. And it is the `.d1` companion to the method line directly beneath it —
*"Every reading against its published limit"* — so the two lines read as one gesture,
which is exactly what the frozen masthead does with "WE KEEP THE RECORD" over the same
method line. Register-wise it sits with *"THE NUMBERS ARE NOT THE WORK"* and *"A NUMBER IS
NOT A SMELL"*: short, declarative, slightly aphoristic. It sets to three lines at 43.2px
on 335px, costed at 111.5px in §5.

Runner-up, and why it loses: **"THE WHOLE INSTRUMENT"** picks up the homepage's own word
and names the page as the apparatus. It loses because it names the *page*, not the
*subject* — D-10.2's reasoning is that a headline names what the page is about, not what
the page is — and because it invites a reader arriving from the hero to expect the same
destination the hero's own link goes to (§3.1, correction #1).

**What carries the reading of the set instead? Nothing does, and that is the answer.**
There is no honest aggregate. The vocabulary is frozen at four words and none of them
describes a set (`BRANDING §3.3`); the homepage's page-level LIVE dot was **removed** for
exactly this reason — *"No honest aggregate word exists… binding it to the date would be
decoration. Removing the branch removes the failure mode"* (`DECISIONS:766–768`); and every
candidate figure ("n breaching", "n in window") is a stated total. What sits under the h1
is the **method line**, reused verbatim, which states what the page does rather than what
it currently reads. On the homepage that line is hidden at ≤560 because the state badge
takes the row (D-01.12); on the index there is no competing badge, so **it renders at
every width** — a strict improvement, and the phone reader who most needs the orientation
finally gets it.

**Cost of the alternative** (a computed h1 carrying the reading of the set): the whole
composition must work at every setting, including a day when nothing breaches and the
largest type on the page says something like "nothing over the limit today" — which is
both a tensed claim in the h1 slot and a sentence that will be wrong within hours. And it
needs a stored `limit` per reading to compute at all, which does not exist.

### Q2 — What replaces the four stat tiles: the deck's own tab row, moved up

**Recommendation: nothing is added. The tab row does the job, and moving it above the
panel (§5, band 2) is what makes it do the job.**

The tiles were `6 in window` / `4 breaking a legal limit` / `0 live feeds` /
`+3 change since yesterday` (`intelligence.html:765:col582`, `col777`, `col984`,
`col1212`). The brief is right that they were doing real work — *"they told a reader the
shape of the set before they scrolled through it"* — and my answer is that **naming the
members does that job better than counting them, and the tab row already names them.**
Six tabs reading `AIR · YAMUNA · FOREST FIRE · FOREST LOSS · CLIMATE EVENT` tell a reader
the shape of the set *and* which situations are in it *and* give them a way in, in one
44px row, with no stated total anywhere. Adding a second member rail above it would be
D-02.1's duplication complaint reintroduced 400px apart.

Each tile, disposed of individually:

- **`6 in window`** — a stated total (§7.8), and false in March. Replaced by the members
  themselves.
- **`4 breaking a legal limit`** — a stated total, and it needs a stored `limit` to be
  computable at all, so today it is hand-typed. It also puts **`--red` on a label**
  (`intelligence.html:765:col777` sets `color:var(--red)` on a `.lbl`), which is red on
  something that is not a reading, not a rail, not a verdict, not a limit's breach words
  and not a band tip — a fourth defect this composition drops.
- **`0 live feeds`** — AD-12 already rewrote its caption honestly, but a zero set as a
  `.num` is still a stated total, and `BRANDING §4.3` is explicit that there is no
  em-dash-for-zero device because *"a printed total is a design depending on a total"*.
  **This becomes a sentence, not a figure** — the surviving clause of H4 in `#top`
  (*"There is no LIVE badge anywhere on this page, because that would be a claim the data
  cannot support"*) and H23 in `#sources`. Two sentences, both approved, both already
  written.
- **`+3 change since yesterday`** — dead, and not merely because it is a total. **A change
  figure needs two readings and there has been one.** The handoff has it as open item 2 and
  the ledger flags it. It returns when a stored previous observation exists (§8, item 11),
  which is also what the `Observation` JSON-LD would need.

**Cost of the alternative** (keep a summary object of some kind): every version of it is
either a stated total, or a computed total that must be *"confirmed honest at low and high
n"* (D-03.4's own caveat about the ticker's computed head line, still unresolved at
`BRANDING §9.1`), or a strip of five values without their six parts — and a figure missing
any of the six parts is not a reading (`BRANDING §3.4`), so the third option would ship
five non-readings on the page that teaches what a reading is.

### Q3 — Yes, the index carries all five doors, and four of them are visibly holes

**Recommendation: every reading's panel carries the door row; the row's fill is a door
where the page exists and a plain line of type where it does not.** Specified in §6.4.

The three options the brief names, costed:

| option | cost |
|---|---|
| **link all five to a stub** | `situation-soon.html` exists and is pre-freeze: it renders *"The nine"* with LIVE chips, "Monsoon" rather than Climate Event, and seven `href="#"` links of its own (`situation-soon.html:629`). Sending four of five readings to it makes the index's most repeated gesture a link to a page that contradicts the freeze. And a door that opens onto "this has no page yet" is a fake door with an extra click |
| **render the five as unlinked names** | loses Air's real door too, or makes Air the only panel with a footer row — which is the 44px hole across four panels (§6.4) |
| **carry only Air's door** | same hole, plus four panels that say nothing at all about whether there is more behind them. Silence and failure look identical, which is the argument `BRANDING §3.3` makes about absent state marks |

The through-line is *show the hole rather than fake the door*, and the version of that
which costs no pixels and breaks no component is **one row, two fills**. A reader learns
in one glance which of the set has depth behind it and which does not, and the admission is
made at reading scale rather than as a page-level apology.

Precedent for the shape: `situation-soon.html:629` already pairs each situation with a
`Page built` / `No page yet` chip and says *"Each situation has its own address whether or
not the page behind it exists."* That is the right thought; this composition puts it where
a reader is already looking rather than on a stub they have to reach.

**It is a visible admission on the site's most-linked inner page, and it should be.** Four
of five is the true state; a page that hid it would be the one thing this site is built not
to be. **This is also the decision I most expect the client to push back on** (§9, Q-F),
and if they do, the fallback that costs least is to keep the row and change only its
wording.

### Q4 — The share card: static, and it carries no reading

**Recommendation: a static `app/now/opengraph-image.png`, 1200×630, using Next's file
convention — so D-11.4's "the repo's first `opengraph-image`" is satisfied literally
without anything being generated.** Plus `app/now/opengraph-image.alt.txt`.

**Composition:**

```
1200 × 630                            --ground #0D0D0B, full bleed
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│   [ wordmark asset, white, at rest ]                                     │  ← /brand/swechha-
│                                                                          │    horizontal-white-
│                                                                          │    approved.png
│   EVERY SITUATION                                                        │  ← .d1, Archivo
│   WE READ                                                                │    wdth 68 / wght 850
│                                                                          │
│   EVERY READING AGAINST ITS PUBLISHED LIMIT                              │  ← .lbl, --fg-2
│                                                                          │
│   │           ▌            ┊                                             │  ← the rail, three
│   AT REST     BREACH       SHUT WINDOW                                   │    states, no numeral
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

One graphic element and it is the site's own signature mark, carrying **no value**. The
logo is the approved asset and never live type (`BRANDING §2.2`). No photograph — the card
would be the site's fourth halftone or its first un-halftoned frame, and neither is a
decision a share card should be making.

**Why static, three reasons:**

1. **A generated card would have to read a value to be worth generating, and every value
   is a specimen.** The brief's own warning is exact: *"a generated card carrying a stamped
   specimen value is a claim in a place no honesty chip can reach."* A card cannot carry a
   `.state` chip that anyone will read, cannot carry a `.src` line, and is cached and
   reshared long after the value moves. It would be the one surface on this site that
   states a figure with none of its six parts.
2. **The typography is at risk in a generated card.** The repo loads Archivo through
   `next/font/google` for the DOM (`app/layout.tsx:22–27`, with the `wdth` axis loaded
   because the whole condensed-caps voice depends on it). An `opengraph-image.tsx`
   rendering through Satori does not get that; it needs the font fetched and registered
   separately, and if it silently falls back the wordmark's voice — the thing the card
   exists to carry — renders at normal width.
3. **It is the repo's first, so it sets the pattern.** A static PNG is inspectable,
   reviewable and diffable. A generator sets a precedent that twelve later pages will
   copy.

**Cost of the alternative:** a generated card could stay current with the set — but
"current" is the one property this page cannot honestly claim until a feed exists, so the
upside is illusory today. **Revisit on the day a reading is genuinely LIVE**, which is the
same trigger as the `Dataset` JSON-LD (§8.2) and the CSV export (§5, band 4). Three
deferrals, one gate.

---

## 8. The SEO surface (D-11.4)

Today, verified: the whole repository has **one** JSON-LD block (`NGO`, homepage only —
`app/page.tsx:26–28` calling `organizationJsonLd()` at `lib/org.ts:40–50`); **one**
canonical on any route (`app/page.tsx:13`, `alternates: { canonical: '/' }` — the only
`alternates` in `app/` or `lib/`); `twitter` on **no** route (only the layout default at
`app/layout.tsx:55–57`); and **no** `opengraph-image` or `twitter-image` file anywhere.

### 8.1 Metadata

```ts
// app/now/page.tsx
export const metadata: Metadata = {
  title: 'Now',                       // → "Now — Swechha" via layout's '%s — Swechha'
                                      //   template (app/layout.tsx:34). D-11.3 keeps the
                                      //   existing title; the em dash comes from there.
                                      //   SEE §9 Q-G — I think this is too thin.
  description: '<SLOT>',              // the current one names "the latest stories",
                                      //   which is the RETIRED card list. Must change.
  alternates: { canonical: '/now' },

  // RESTATED IN FULL, not merged. app/layout.tsx:37-41 states the reason in the file:
  // Next.js metadata merging is shallow per top-level key, so a route's openGraph
  // REPLACES the layout's object wholesale.
  openGraph: {
    type: 'website',
    siteName: 'Swechha',
    locale: 'en_IN',
    url: '/now',
    title: '<SLOT — see below>',
    description: '<SLOT>',
    images: [{ url: '/now/opengraph-image.png', width: 1200, height: 630,
               alt: '<SLOT — from opengraph-image.alt.txt>' }],
  },

  // ALSO restated in full, for the same shallow-merge reason. The layout sets only
  // `card`, so without this the card ships with no title/description/image of its own.
  twitter: {
    card: 'summary_large_image',
    title: '<SLOT>', description: '<SLOT>',
    images: ['/now/opengraph-image.png'],
  },
}
```

**One note on the OG title.** `openGraph.title` is not passed through the layout's
template, so it must be written out in full — and it should not be the bare word "Now",
which is meaningless in a Slack unfurl. Slot.

### 8.2 JSON-LD — four types, two of which ship today

Builders go beside `organizationJsonLd()` in `lib/org.ts`, which D-11.4 names as the
established home and which is unit-tested (`lib/org.test.ts`).

| type | ships now? | fields it needs | schema has it? |
|---|---|---|---|
| **`BreadcrumbList`** | **YES** | `itemListElement[] = {@type:'ListItem', position, name, item}` | needs nothing from the content schema — `SITE_URL` (`lib/org.ts:24`) and two literals. A two-item list (Home → Now) is valid and renders |
| **`ItemList`** | **YES** | `name`, `itemListOrder`, `numberOfItems`, `itemListElement[] = {position, name, url?}` | `campaignSchema.title` ✓ (`schemas.ts:94`), slug ✓ for `url`. `url` omitted where no page exists — which mirrors the visible door row exactly |
| **`WebSite`** | **YES**, but not here | `@id`, `url`, `name`, `inLanguage`, `publisher` → the `NGO`'s `@id` | needs `organizationJsonLd()` to gain an `@id` so `publisher` can reference it rather than duplicating the org. **Recommend it moves to `app/page.tsx` beside the `NGO`** — `WebSite` is a site-level entity and emitting it on `/now` invites a crawler to attribute the site to this page |
| **`SearchAction`** | **NO** | `target: {@type:'EntryPoint', urlTemplate: '…/search?q={search_term_string}'}`, `query-input` | **`/search` does not read a query parameter.** `components/search-client.tsx:8` is `useState('')` with no `useSearchParams`, no `URLSearchParams` and no `searchParams` prop on `app/search/page.tsx`. The template would advertise a URL the route ignores — the machine-readable version of the honesty problem D-11.4 itself names. Unblocked by ~5 lines: read the param, seed the state |
| **`Dataset` / `Observation`** | **NO — and this is the important one** | `Dataset`: `name`, `description`, `creator`, `url`, `temporalCoverage`, `variableMeasured`, `distribution`, `isBasedOn`. `Observation`: `observationDate`, `observationAbout`, `measuredProperty`, `measuredValue`, `marginOfError` | **Two independent blockers.** (1) **No source URL** — `liveDataSchema` has `sourceLabel` and no URL (`schemas.ts:56–66`); `evidenceSchema` has `source`, `note`, `date` and no URL (`74–78`). D-11.4 states it: *"Structured data that names a source it cannot link is the machine-readable version of the honesty problem this site exists to avoid."* (2) **Every value is a specimen.** `content/campaign/delhi-air-quality-2026.md` carries `mock: true` and `value: '347'`, and **schema.org has no field for "this observation is demo data"**. A `Dataset` block would put a specimen into Google's dataset index as a real observation, in a place no chip can reach |

**The honest pattern for `Dataset`, and it is the same shape as D-10.1's badge: build the
code path and gate it per reading on `mock === false`.** The builder ships; today it emits
zero blocks; each reading's block lights up on the day that reading's feed is wired and
its source URL exists. Same one-token-change discipline the state chip already has, and it
means nobody has to remember to add structured data on feed day.

**One thing to be careful of.** `ItemList.numberOfItems` is a count. It is computed from
the array at build time, never typed, and it is not a visible claim — so it does not
breach §7.8, which governs *"a stated total on the page"*. But **`ItemList` must not list a
situation whose window is shut.** D-11.2's "absent from the front end" includes the
machine-readable front end; a crawler reading six members while the page renders five is
the same defect in a different output.

---

## 9. Open questions for the client

> **SUPERSEDED BY §R.9.** **Q-A is closed** by D-11.6 (the door was re-pointed) and **Q-C is
> dissolved** by cutting the windows table. **Q-D changes destination** rather than going
> away — the six windows are still needed, for the mechanism, not for a band on this page.
> **Q-B, Q-E, Q-F, Q-G, Q-H and Q-I all still stand as written** and are carried into §R.9
> as R-7. Kept below for the reasoning.

Only where a different answer changes the work.

**Q-A — Record door 2 points at `#orders`, the band D-11.1 cut.** `home.html:4069` is a
live link to `intelligence.html#orders`; its copy promises court orders *"with the source
document attached"* and *"Last compiled 18 August 2026"*. Three answers, and they are
different jobs: **(a)** `/now` reserves a named `#orders` section so the door lands
somewhere and reads honestly — my recommendation, and it is what D-11.1's own wording asks
for; **(b)** the frozen homepage takes a one-link amendment and the door is repointed —
cheapest, but it edits a frozen page; **(c)** nothing, and the door silently lands at the
top of `/now` — the failure mode `BRANDING §5.10` spent a whole pass eliminating for
in-page anchors. I have built (a).

**Q-B — Record door 1's body names the wrong set.** *"Air, river, heat, fire and
rainfall"* (`home.html:4066`) names Heatwave, which does not render, and omits Forest
Loss, which does. The same door promises *"Every day's readings keep their own address
after they stop being today's"* — a per-day permalink archive that exists nowhere and that
this spec does not build. Both are frozen copy. Amend, or accept?

**Q-C — May `#windows` name the situations that are currently out?** The band's job is to
make a changing count legible, and the most direct way to do that is a row saying
*"Heatwave · 1 March to 15 July · returns 1 March"*. **My reading of D-11.2 is that this
renders the situation and is therefore forbidden**, so I have built a table of the
rendering situations only, with the rule carried by prose that names nobody. If the client
intends the window *rule* to be nameable even where the situation is not renderable, the
table gains a section and the band grows ~90px a row.

**Q-D — Six validity windows are needed and none exists.** `#windows`' every cell is a
slot; the prototype's dates are invented; the schema has no `windowStart` /
`windowEnd` / `recursAnnually`. **The band cannot ship without them**, and D-01.4 already
made these fields non-optional. Who supplies the six windows, and by when?

**Q-E — The legend teaches green in words, with no swatch.** Recommended, because there is
no green on this page and `BRANDING §3.2` bars red and green from one band outside a caged
ticker-class strip — which this band cannot be, since it must show mustard. **The
alternative is the site's second red/green exemption, and §3 says widening a closed rule
needs a client ruling.** If a green swatch is wanted, it needs that ruling and the band
needs its caging conditions written.

**Q-F — Four of five readings will visibly say they have no page yet.** §7, Q3. This is a
deliberate admission on the site's most-linked inner page and I recommend it. If the client
would rather not ship it, the cheapest alternative is the same row with different wording;
the expensive alternative is five stub pages.

**Q-G — `<title>` is "Now — Swechha", which is thirteen characters and no query term.**
D-11.3 keeps the existing `title: 'Now'` and I have built to it. Flagged because this is
the site's first page with a full SEO layer, and the page is about Delhi air, the Yamuna
and forest fires while its title says none of that. A one-line change (`title.absolute`)
would fix it, and the nav label stays "Now" either way — the two are independent.

**Q-H — The `description` must change.** The shipped one
(`app/now/page.tsx:10`) ends *"and the latest stories"*, which describes the retired card
list. New copy needed.

**Q-I — Forest loss has no six-band scale and I will not invent one.** §6.5. Either the
owner supplies bands, or that reading renders without a scale and says *"No legal
threshold."* in words. I have specified the second.

---

## 10. What I deliberately did not design — and what I expect to move

> **AMENDED BY REVISION 1.** Two additions to 10.1: **the policy-impact claim** — I did not
> design one and will not write one, because SOURCE-FACTS contains no instance of Swechha's
> data changing a rule, an order or a decision (§R.7); and **the orders band itself**, which
> is no longer even a reserved strip (§R.6). Two additions to 10.2, both about the new bands:
> **`#rules`' five rows are the page's most stable object and I expect none of them to move** —
> they are the page's own rules, not data; and **the POLICY door is the one element on the
> page that could legitimately change in kind**, on the day a sourced instance of influence
> exists. Item 2 of 10.2 below — *"`#orders` re-composes"* — is no longer a band on the page,
> so it becomes a re-composition *on return* rather than an in-place change; §R.6 carries it.

### 10.1 Not designed, with the reason

| | why |
|---|---|
| **The orders band's contents** | D-11.1 forbids it by name. Not a citation, not a docket, not an authority, not a holding, not a compile date |
| **The five situation detail pages** | out of scope, and four of five have no brief. This page's job is to route to them honestly, not to preview them |
| **The location control** | deferred to the situation page by D-01.8 and assigned to that pass (situation brief §2.2 item 6). An index is the wrong place for a query |
| **A CSV export** | the prototype's button is dead and a CSV of specimen values is a downloadable claim outside the page's honesty layer. Returns with the share card and the `Dataset` block, on the same gate |
| **The admin on/off override UI** | backend, and it does not exist (situation brief §4 item 3) |
| **A photograph anywhere on the page** | §5, band 1 |
| **Any per-situation editorial prose** | the client's instruction, explicitly. The prototype's nine `.hwhy` paragraphs are the best writing on the page and every one contains an uncheckable figure; they are derived from the situation pages when those exist |
| **The frozen page's copy** | it is frozen. Three of its strings are wrong about this page (§3.1) and they are logged, not edited |

### 10.2 The seven decisions I expect to move

Per the brief's header. Ranked by how likely.

1. **The door row's second fill becomes dead code.** The day all six situations have pages,
   the "no page yet" branch matches nothing. **It must be deleted, not left inert** —
   `home.html:1806–1812` records that a live rule matching nothing is the stale-selector
   bug the file has been bitten by twice, and `1291–1298` records the same discipline for a
   cut string.
2. **`#orders` re-composes** from a t4 strip to a t2/t3 section. Declared as a designed
   exception in §5, band 5, with the one thing that must be re-checked (the 4 → 5 weight
   cut, not the hex).
3. **`#readings`' tab labels** are `data-tab`-style short strings today and need a
   `shortLabel` field; the prototype proves the failure — one situation carried three
   different names (*"Our clean-up record"* in `#windows`, *"Our record"* as its tab,
   *"Swechha field record"* on its rail).
4. **Every cell in `#windows` and four of five in `#sources`** stop being slots and become
   data. The *layout* should survive that unchanged; the *heights* will move, and both
   bands have under 100px of headroom.
5. **The `Dataset` JSON-LD** lights up per reading, gated on `mock`. Nothing visible moves.
6. **`#legend`'s specimen clause** is the one sentence on the page that has to be rewritten
   on feed day.
7. **The share card** is revisited when a reading is genuinely LIVE — and I expect the
   answer to stay "static", because a card outlives the value on it.

### 10.3 The one thing I would measure first

`#windows` at 375 (~819 est.) and `#legend` at 375 (~864 est.) have 81px and 36px of
headroom against the cap, and both estimates depend on a line count I could not measure —
how many lines the explainer prose and the hue rules actually set to at 335px. If either
breaches, the fix is in the copy length, not in the composition, and it is available: both
bands' prose is a slot, not approved copy. **Do not solve it by making the type smaller or
by damaging a component** (`BRANDING §6.4`), and do not solve `#legend` by dropping a
specimen — the four state words are the reason the band exists.

---

## 11. The backend requirements table

Items 1–7 are the situation brief's §4, restated because this page depends on the same
seven. Items 8–15 are what this composition adds. All confirmed absent by reading
`lib/content/schemas.ts`.

| # | field | what this page needs it for | blocking? |
|---|---|---|---|
| 1 | **`limit`** — value + publishing authority, per reading | the `.limit` line, `.limit b`'s breach words, the red rail, the red band tip, and the multiplier — all hand-typed today, so the page can say a limit is broken when it is not. **The method line's promise rests on this field** | **BLOCKING** |
| 2 | **`windowStart` / `windowEnd` / `recursAnnually`** | **Amended by §R.1.** With `#windows` cut, this no longer blocks a band on *this* page — it blocks the **mechanism**: membership of `#readings`, the `.tag-season` word on every reading, and `#rules` row 03 being a true statement rather than an aspiration. `getActiveSituations()` (`lib/content/index.ts:103`) filters on `status` with no date logic, so today "a closed window does not render" is enforced by an editor remembering | **BLOCKING** for correct membership. D-11.5 stands (§R.9, R-5) |
| 3 | **admin on/off override** | the only route to a legitimately rendered `OUT OF SEASON`, which is one of the four words `#legend` teaches | degrades — the legend teaches it as a specimen either way |
| 4 | **the rotating Impact slot** | nothing on this page. Listed for completeness; Out of River left by D-11.2 | not blocking here |
| 5 | **a source URL** per reading and per evidence entry | the `.src` line's checkability, and **the `Dataset` JSON-LD outright** (D-11.4 names this) | **BLOCKING** for `Dataset` |
| 6 | **a validated ISO observed timestamp** | the `.src` line's as-of. `updatedAt` is `min(1)` with no ISO validation (`schemas.ts:61`), and `components/data-attribution.tsx` formats it with `toLocaleString('en-IN',{timeZone:'UTC'})` — **UTC on an IST project, and `toLocaleString` is the same class of call §7.12 forbids.** Whatever renders this page must not reuse that component as-is | **BLOCKING** for a correct hour |
| 7 | **a freshness enum** | the `.state` chip. The only signal today is the binary `mock`, so LIVE / PERIODIC / DEMO DATA / OUT OF SEASON cannot be expressed — and the chip's whole design is that it is never conditional | **BLOCKING** |
| 8 | **`anchorId` per situation** — or a ruled slug-to-anchor derivation | **Amended: three live anchors, not five, and the field now carries two defects.** D-12.11 re-pointed Air and Yamuna at their own pages, leaving `#h-fire`, `#h-forestloss`, `#h-monsoon` (`home.html:3393–3395`). **(a)** The repo's only situation record is `content/campaign/delhi-air-quality-2026.md`, slug `delhi-air-quality-2026`, and **no slug corresponds to any anchor** — so the three break silently the day `/now` becomes a real route (D-11.6 records this as *"not previously spotted"*). **(b)** `#h-monsoon` is a **stale name** from the nine-situation set; the frozen six call it *Climate Event*. D-12.11's general warning applies: *"any anchor into `intelligence.html` is a link with an expiry date"* | **BLOCKING**, and it must be closed in the route pass — the homepage's three hrefs are corrected in the same commit |
| 9 | **band-scale boundaries** — six boundaries, plus which band the value falls in | `.bands` and `.bands.bad i.tip`, i.e. §3.4 part 5. Nothing in the schema carries them | **BLOCKING** for the band scale |
| 10 | **`derivation`** — a sentence per derived figure | the situation brief §3 requires every derived figure to name its derivation, not just its source | degrades — the line does not render |
| 11 | **a previous observation** | any change figure, and `Observation`'s comparability. Its absence is why the `+3` tile dies (§7, Q2) | degrades — nothing renders |
| 12 | **`pageBuilt`** — or build-time route resolution | the door row's fill (§6.4). Default must be *no door*, so the honest state is the fallback | degrades correctly |
| 13 | **`shortLabel`** | the deck's tab word. `campaignSchema.title` is a sentence (*"Air quality crosses hazardous threshold across Delhi-NCR"*) and will overflow a tab | degrades badly — flag it |
| 14 | **an `order` content type + its source URL** | `#orders` when it returns. Not needed while the band is reserved | not blocking |
| 15 | **`unit` should not be optional** | `liveData.unit` is `.optional()` (`schemas.ts:59`), but §3.4 makes the unit one of the six parts, so a reading without one is not a reading | degrades — and it should not be allowed to |

**Two dead surfaces to remove rather than build against**, both restated from the situation
brief and both still live: **`heroImageSchema.signal: 'none'|'red'|'mustard'|'green'`**
(`schemas.ts:37`) is the selective-colour field, and selective colour is retired
(`BRANDING §7.3`); and **`severity: 'water'`** (`schemas.ts:54`) is a legal enum value that
means nothing and must not survive into a page that derives a red rail from severity.

**One CSS gap, not backend:** there is no `.verdict.good` (`home.html:301–304`), which is
why the prototype's one green verdict is an inline `style="color:var(--green)"`
(`intelligence.html:765:col17931`). Not needed here — no green on this page — but it is the
missing token the Impact page will hit.
