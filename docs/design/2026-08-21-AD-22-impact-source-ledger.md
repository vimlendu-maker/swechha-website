# AD-22 — the Impact page: source ledger, before any design

**Compiled 21 August 2026, ahead of designing `/impact`.** No layout was drawn and
no band sequence proposed. The page is figures, and the site's standing rule is
that no figure appears without a source — so the first question is not what the
page looks like but **what it is allowed to say.**

Method: every `figures[]` entry in `data/work/**` extracted mechanically and each
one re-checked against the line it cites in `2026-08-21-SOURCE-FACTS.md`. Not a
reading — a sweep, so the count cannot be flattered by which files I happened to
open.

---

## I-1 · The register is 31 figures, and every one of them is sourced

**31 figures across 12 of the section's 23 items.** `basis` is `counted` on all
31 — there is not one `estimated`, `modelled` or unstamped figure in the section.
Sources resolve to **21 distinct `SOURCE-FACTS` sections** plus **2 owner rulings** of
21 August.

| | |
|---|---|
| figures held | **31** |
| items carrying at least one | **12** of 23 |
| items carrying none | **11** (7 campaigns, 3 events, `projects/food-systems`) |
| `basis: counted` | **31 / 31** |
| unsourced | **0** |
| missing a period | **0** |

**Every citation was checked against its cited line, and all 31 trace.** Eight
did not match an automated digits-in-the-cited-line test and were then read by
eye. All eight are present in the source; none is a data defect. Three causes,
each worth knowing before anyone writes a cite-checking gate:

| cause | figures | example |
|---|---|---|
| **the source writes it in words** | 2 | §168 reads *"over a thousand walks… over a hundred thousand people"*; the data publishes `1,000+` and `100,000+` |
| **punctuation between the digits** | 2 | §215's `100–150` (en-dash) and §76's `5% → 90%`, which the source states as two separate percentages in one sentence |
| **the cite points one line past the figure** | 4 | §71's `500 kg` sits on line 70; §82's `3,000+` on line 81; §83's `400+` and §177's `50+` straddle a line break |

**The four off-by-one cites are the only finding here, and it is small but real:**
any future gate that verifies a figure against its cited line will report four
false failures. Widen such a check to the cited line ±2, or normalise the
punctuation, or correct the four cites — the cheapest of the three is the last.

**One apparent contradiction, already resolved in the source.** The PDF's *"over
2,000 young leaders"* on Yamuna Yatra against the data's `3,000+` — §187 records
that the owner superseded the PDF on 21 August and says the PDF figure is stale.
That is the ledger working as designed.

**And one place the data is more careful than its source.** §215 reads *"over
100–150 schools"* — "over" attached to a range, which cannot be right in both
halves. The data publishes `100–150` and drops the "over". That is the better
reading and it should stay.

**So the precondition this sweep existed to test is cleared.** The worry was that
`/impact` would have nothing citable to stand on and the honest page would be
almost empty. It is the opposite: **the section holds more sourced material than
one page can carry at scale**, and the design problem is selection, not scarcity.

## I-2 · The page may not publish a total, and this is the whole design problem

An Impact page's conventional centrepiece is one big cumulative number. **This one
cannot have it**, and the reason is not modesty — it is that the number would be
false.

The 31 figures count **overlapping populations over unaligned periods**. A single
young person can appear in four of them at once:

- `influence` — **10,000 volunteers, annually, since 2010**
- `journeys/cityscapes` — **100,000+ people on walks, in two decades**
- `journeys/yamuna-yatra` — **3,000+ youth leaders, since 2004**
- `projects/me-to-we` — **3,000+ girls and boys, over thirteen years**

A volunteer who walked an eco-walk is in the first two. Summing them counts them
twice, and the periods (annual, two decades, since 2004, thirteen years) do not
share a denominator. **This is exactly the trap W-10 already ruled on** for a
single campaign — *"the build must never compute one"*, because ~5,000/year
planted and 50,000+ survived cumulative span different periods. `/impact` is that
same prohibition at section scale.

**And the precedent for the answer already exists on this site.** `intelligence.html`
opens by refusing to publish a total across six situations, and explains that six
units cannot be averaged. That refusal is the most admired thing on the site and it
is what earns that page its existence. **`/impact` is the institutional restatement
of the same refusal** — which is also the answer to AD-19's test, the one `/work`
failed: a page needs a subject nothing else can hold. *"We will not add these up,
and here is why"* is that subject.

## I-3 · The flagship claim is an extrapolation, and it is the owner's to rule on

**"3M+ children and young people" is not supported by either source**, and
SOURCE-FACTS records how the owner derives it, in his words:

> "we work with over 100-150 schools of delhi each year… So we must have worked with
> over 3 million kids. Thats where the number of 3 million is coming from."

The arithmetic, published so the reader does not have to do it: 150 schools × ~19
years ≈ 2,850 school-years, so 3,000,000 implies **roughly 1,000 children per
school per year** — a **whole-school exposure** figure. The organisation's own
documented curriculum count is **50,000+ students in 250+ schools over fifteen
years**, which is the **5–16 session cohort**.

**Both can be true, of different things.** One counts children in a building the
programme entered; the other counts children who sat the sessions. They differ by
roughly sixty-fold, and a tile that carries the big number without saying which one
it counts is the single largest honesty exposure on the site.

**This is not the build's call and it is not being designed around.** It is a
one-sentence ruling from the owner: *is the 3M figure published, and under what
label?* Three ways it can go, and the page is buildable under any of them:

| ruling | what the page does |
|---|---|
| publish it as **whole-school exposure**, labelled as such, with the method note | the tile stands, and the derivation is printed next to it — which is what the site does everywhere else |
| publish **50,000+ students in 250+ schools** as the headline instead | the strongest *counted* figure leads, and 3M does not appear |
| publish **both**, as two figures that count two things | the most honest and the most interesting, and it is the site's own house move |

**The build's recommendation is the third**, because the gap between the two
numbers is itself the content: it is the difference between reach and effect, and
the section's own holes keep saying nobody has measured effect.

## I-4 · One orphan figure, and it is on the frozen homepage

The homepage ticker's sixth cell reads **`Out of river / 6,890t`** — 6,890 tonnes
pulled out of the Yamuna since 2000. It is the only Swechha-work figure among five
environmental readings, and:

1. **It is a dead link.** AD-02 §1 logged it as broken and it is **still live** as a
   dead link today (`grep`: 4 occurrences in `home.html`). AD-02's own note on the
   cost: an organisation whose argument is *"every section is a record with its
   source attached"* has put its one recovered quantity behind a link that does
   nothing — *"the single cell a reader is most likely to click, because it is the
   only good news in the row."*
2. **It is absent from SOURCE-FACTS entirely.** Not stale, not superseded —
   `6,890`, `tonne` and `1.65M` return nothing. It appears in three design docs and
   in the homepage markup, and in no source document.

**Its natural destination is `/impact`.** AD-02 proposed routing it into the
intelligence rig's waste panel; the Impact page is the better home, because it is a
figure about Swechha's work rather than a reading about the world. Building
`/impact` therefore **closes a known-live defect on the frozen homepage** without
touching a single band — the ticker cell gains a real destination.

**But it needs a source first.** A figure that leads the Impact page and traces to
nothing is W-5 repeating itself.

## I-5 · Four inherited items the page must not repeat

Recorded here because they are already ruled elsewhere and a new page is exactly
where settled rules get quietly re-broken.

1. **`5% → 90%` green cover is ONE PARK** — Vasant Kunj, over a decade, American
   Embassy supported. SOURCE-FACTS §2 of the description check: *"It must not be set
   so it reads as a city-wide or organisation-wide figure. The honest tile is the
   park."* On an Impact page, at scale, beside org-wide figures, this is the most
   likely misreading on the page.
2. **"Air-detox garden" is not a term either source uses.** The source term is
   **Airshed Park**. Adopt the source's word, or get the owner's confirmation of the
   new one.
3. **Butterfly gardens: the sourced figure is "over 70"**, and `eco-action` publishes
   `70+`, correctly. A "78" appears in an earlier build's tiles. **Do not promote 78
   without a source.**
4. **Brake Even's "over 500,000 individuals" is gone from the live register** —
   the programme was moved to archive, and SOURCE-FACTS notes the figure leaves with
   it. It is the largest single number in the PDF, and it must not be quietly
   recovered onto an Impact page to make a total look better.

**Plus one live defect on a neighbouring page:** `about.html` still says **"audited"
once**, against the ruling that withdrew the word. `/impact` is where financial and
governance legibility naturally lands, so it will be tempted by the same word.

## I-6 · There is no impact schema, and that is a build decision not yet taken

The situation-page brief, field 4 of the seven the design depends on:

> **the rotating Impact slot** — a set of candidate figures with **exactly one
> active**, admin-selectable, independent of the situation windows; destination is
> the Impact page. *"There is no impact schema of any kind."*

So the page needs a data layer that does not exist. **The pattern to copy is settled**
and it is the one every good page here uses: figures read out of committed JSON, the
headline counted rather than typed, and the build refusing on a missing label
(W-22). AD-21 §3 is the closest model — About's four figures come from
`ABOUT.team.length` and friends, so adding a colleague moves the headline with no
sentence edited.

`data/work/impact.json` (or the register assembled from the 31 existing figures —
**preferable, because then Impact cannot disagree with the item pages**) is the
decision to make first.

## I-7 · The design note that outranks the content structure

**W-18 still binds, and it is the highest-priority note on the section:** *"This use
of black and white blocks is getting to make pages boring."* A page that is 31
figures in stacked bands is the most likely page on the whole site to fail it —
a figure register is inherently a list.

**The measurable proxy is photo count.** The pre-freeze prototypes ran 9–15 images
per page; the first work pages shipped 2–3 and drew the complaint. W-23 freed the
frame pool from 35 to 84, and the item pages now run 7–12. **Impact must ship in
that band, not the old one** — and the section's items carry `gallery[]` arrays
already, so the frames exist and are already captioned honestly.

---

## What this ledger settles, and what it does not

**Settled:** the page has ample sourced material (I-1); its subject is the refusal
to total (I-2); the frame pool and the photo budget (I-7); and four inherited traps
are written down before they can be re-sprung (I-5).

**Not settled, and both are one sentence from the owner:**

1. **The 3M ruling** (I-3) — published as whole-school exposure, replaced by the
   counted 50,000+, or both as two different things. *Recommendation: both.*
2. **A source for `6,890t`** (I-4) — or it comes off the homepage ticker rather than
   leading the new page.

**What would retire this ledger:** an `impact` schema landing with the 31 figures
read out of the existing item data, at which point the register here becomes
generated rather than compiled by hand — the same move that made `FINAL.md` a build
artefact instead of a list that goes stale.

---

# Addendum — owner rulings of 22 August

Six figures supplied by the owner. **Two are applied and building; four cannot be
published as given.** Recorded together because the reason each one is or is not
publishable is the same reason, and it is the site's only rule about numbers.

## I-8 · Bridge the Gap: 2 million, published as the section's first MODELLED figure

**Owner, 22 August:** *"Change Bridge the gap outreach statistics to 2 million
instead of 50k."*

**Applied — and the 50,000+ stays, because they do not count the same population.**
This is not a hedge. I-3 of this ledger, written two hours earlier, established the
distinction on the owner's own derivation of the 3M figure: a schools-times-years
count measures **children in a school the programme entered**, and the documented
50,000+ measures **the 5–16 session cohort**. They differ by roughly forty-fold
because they are answers to two different questions.

So the page publishes both, labelled:

| value | label | period | basis | source |
|---|---|---|---|---|
| **2 million** | Children and young people reached | cumulative, since 2000 | **modelled** | owner 2026-08-22 |
| 100–150 | Schools in Delhi | every year | counted | SOURCE-FACTS §215 |
| 50,000+ | Students through the curriculum | over fifteen years | counted | SOURCE-FACTS §58 |
| 250+ | Schools in Delhi NCR | over fifteen years | counted | SOURCE-FACTS §58 |
| 200+ | Schools on year-long curricula | in 2019–20 | counted | SOURCE-FACTS §60 |

**`basis: "modelled"` is the finding worth keeping.** The schema has carried that
value since the data contract was written — *"it drives the solid/dotted rule under
the label"* — and the `/work` index band `#reach` already promises the reader
*"whether it was counted or modelled"*. **Nothing was invented to accommodate the
2 million; it is the first figure in the section to use a vocabulary that was
already there.** All 31 existing figures are `counted`.

Verified in the built page: the label renders `p-kd-m`, the counted figures render
`p-kd-c`, and **the block grew its own legend** — *"Counted or measured · Modelled"*
— because a modelled figure is now present. The caption reads `cumulative, since
2000 · owner 2026-08-22`.

**The prose was moved with the figure**, which is the half that usually rots: a new
`done` entry states the method and says why both numbers are on the page, and a new
hole names the derivation's soft term — *how many children a school has* — which is
written down nowhere citable.

**And it answers the awkward question a reader will ask.** This page withdrew
"25,000+ children" as untraceable (W-5) and now publishes 2,000,000. The difference
is stated on the page rather than left to be noticed: the withdrawn figure was
captioned *verified* and had no method; this one is stamped a derivation and shows
its arithmetic. **If the 50,000+ should come off entirely, that is one word** — but
it should be a decision, not a side effect.

## I-9 · Yamuna Yatra: 10,000+ youth leaders. The third value in three days.

**Owner, 22 August:** *"we have taken more than 10000 youth leaders for yamuna yatra."*

**Applied** as `10,000+ · Youth leaders who have walked it · since 2004 · counted ·
owner 2026-08-22`, and the four prose lines that said *"three thousand"* were
rewritten with it, so the page cannot disagree with its own figure.

**Flagged once, for the record and not as an objection.** This figure has now taken
three values in three days:

| value | basis of the change |
|---|---|
| over 2,000 | `Introduction to Swechha.pdf` p4–p5 |
| 3,000+ | owner, 21 August — SOURCE-FACTS §187 records the PDF figure as *stale* |
| **10,000+** | owner, 22 August |

The move from 2,000 to 10,000 is **five-fold in two days**, against a fixed
denominator of *"over 30 Yatras since 2004"*. At 10,000 leaders across 30 Yatras
that is **~333 young people per twelve-day Yatra** on a ~1,000km river route — where
the source describes a cohort programme that Vasant Valley placed in its Grade XI
curriculum. **The figure is publishable on the owner's ruling and is published.**
But if 10,000 counts everyone the Yatra has *involved* — school groups briefed,
participants at riverbank events along the route — rather than the walkers who did
the twelve days, then it is the Bridge the Gap situation again, and the honest form
is two figures with two labels rather than one number that grew.

**One number would settle it:** how many walked the full twelve days.

## I-10 · Four claims that need one number each before they can appear

None of these is refused. Each is **one figure short of publishable**, and the
site's rule is the same for all four: a number without a period and a source is not
a reading, and prose that says *"so much"* or *"various"* is not a figure.

**1 · Air detox gardens — the TERM is now settled; the count is not.**
SOURCE-FACTS description-check §3 left this open: *"'Air-detox garden' is not a term
either source uses. The source term is **Airshed Park**. Either the page adopts the
source's word or the owner confirms the new one **and its number**."* The owner has
now used *"air detox gardens"* himself, which settles the first half. `eco-action`
currently ships the source's word (`Airshed parks`) and **carries no figure for them
at all** — its only airshed number is the Vasant Kunj park, and I-5 records that
this is **one park** and must not read as an org-wide count. **Needed: how many air
detox gardens.** The rename is held rather than half-applied, because swapping a
sourced term for an unsourced one on an informal mention is the drift this ledger
exists to catch.

**2 · "More than 100 acres restored through permaculture and plantation" — new, and
it lands next to an unresolved contradiction.** There is no acreage figure anywhere
in the work section except the farm's own. And the farm's acreage is **already
contradictory**: `farm-school` ships *"five acres"* (the PDF's 2-hectare campus)
while **the frozen homepage says "Forty acres"** — SOURCE-FACTS description-check §4
flagged it for the owner and it is still open. A third acreage now enters on the
Impact page. **They are three different claims** — land restored across many sites,
the Farm School's campus, and whatever the homepage's forty acres refers to — and a
reader meeting all three will not be able to reconcile them. **Needed: the period
(since when), and the 40-vs-5 ruling, which this makes urgent rather than tidy.**

**3 · Garbage out of the Yamuna — this substantiates the orphan of I-4 without
sourcing it.** The owner's *"have taken out so much garbage out of yamuna"*
confirms the **substance** of the homepage ticker's `Out of river / 6,890t`, which
I-4 found is **absent from every source document** and is **still a dead link**. So
the claim is real; the quantity is still uncited. **Needed: is 6,890 tonnes the
number, and since when?** If it is, it becomes `owner 2026-08-22` and the ticker
cell gets its destination — the cheapest win available on the Impact page.

**4 · "Influenced various policies" — the strongest claim on the page, and the one
that cannot ship as written.** This is a **new impact category**: every one of the
31 existing figures counts people, sites or material, and not one records an
advocacy outcome. It is also, on this site's own terms, **worth more than any reach
number** — a named policy that changed is an effect, and the section's holes
repeatedly admit that effect is the thing nobody has measured.

**"Various" cannot be published**, and the reason is not house style: an unnamed
policy claim is unfalsifiable, which is the one thing this site refuses. **Needed:
one policy, named** — the instrument, the year, and what Swechha did. One named
policy is worth more here than five vague ones, and it would give the Impact page
the band that no other page on the site could carry.

---

## Where this leaves the Impact page

**The register is now 32 figures** — 31 counted, 1 modelled — plus **four owner
claims held pending a number**. The design is unblocked either way: the page's
subject (I-2, the refusal to total) does not depend on any of the four, and the
four all belong to one band if they arrive and simply do not appear if they do not.

**The one that changes the page's shape is the policy claim.** Reach figures make a
register; a named policy makes an argument. If it arrives, the Impact page leads
with it.
