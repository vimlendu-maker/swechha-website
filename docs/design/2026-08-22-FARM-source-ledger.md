# Swechha Farm — source ledger, 22 August 2026

Written before any layout, on the pattern of `2026-08-22-AD-22-impact-source-ledger.md`
and `2026-08-21-AD-15-air-source-ledger.md`. Nothing here is a design decision. It
records what is sourced, what is contradicted, and what the page cannot be built
without.

The page this serves is **the destination of the homepage's dead button**: band 8 of
`public/design/v3/home.html` carries `<a class="b b-1" href="#">Visits, camps and
retreats</a>`. That `href="#"` is the whole brief.

---

## 1 · What was already on record in this repo

| Fact | Source in repo | Status |
|---|---|---|
| Five acres; an hour and a half from Delhi | D-07.3, ruled by the owner | **ruled** |
| Transformation story: 5,000+ trees, 20 cows, poultry, native nursery, vermicompost, hydroponics, butterfly garden, organic farming, apiary, mud houses, permaculture prototypes | SOURCE-FACTS §197–201, owner 21 Aug | **owner-given** |
| It is a place you can come to: school camps (overnight), day visits, "an ideal place for team meetings and retreats" | SOURCE-FACTS §205–206, owner 21 Aug | **owner-given** |
| "Both are detailed further on the farm's inner page" | SOURCE-FACTS §208 | the instruction for this page |
| Nursery of twenty thousand saplings | frozen homepage band 8 | compatible with "native nursery" |
| Day visits · short courses (the 5 C's) · internships and stays; 5,000 kg leaves composted; 500 kg honey; permaculture, water harvesting in swales/bundhs/ponds, solar, dairy prototype | `data/work/projects/farm-school.json`, from SOURCE-FACTS §65–72 | **live on `/work/projects/farm-school`** |
| ~10 farm frames catalogued | `content/photo-library.json` | all Swechha originals |

**The recorded open hole (AD-17 question 6, and `farm-school.json` `holes[1]`):**
the farm and the Farm School share five acres, a nursery and an apiary, and nobody
has ruled whether they are one page or two. This ledger does not rule it.

---

## 2 · External sources checked, 22 August 2026

### 2.1 Google Maps — the listing exists and is the farm's own

Place: **Swechha Farm** / स्वेच्छा फार्म · category **Campground** · **4.9★ from 23
reviews** · `swechha.in` linked · phone **090135 22222**.

- Address as listed: **Swechha Farm, Dist, Ladpuri, Rajasthan 301707**
- Plus code **4WGH+Q3 Ladpuri** · coordinates **28.1269309, 76.927649**
- Google place id `0x390d33ec3c173de5:0x4221a1dde6ba71e3`

**What reviewers say the place is** (their words, not ours, and not quotable on the
site without permission): a stone house with "rooms [that] are a masterpiece"; "fresh
A2 milk from Gir cows"; "fresh white butter and ghee they provide produced at the farm
itself"; organic vegetables and fruit; "in the lap of Aravalli hill"; "just an hour
away from Gurgaon"; "a hidden gem for nature lovers looking for a stay around NCR".

**Photographs: 13 are visible signed-out, and they are NOT a usable set.** They are
visitor snapshots, they belong to the visitors, and the subject matter is lopsided —
roughly nine of thirteen are flowers (bougainvillea, dahlias, ixora). The four that
carry information are: a thatched-roof room interior with lattice windows and a vase;
a cattle shed with a feed trough; a bee frame drawn out of a hive; sunrise over the
fields. **None of them can go on the site.** Their value is corroboration only — they
independently confirm the apiary, the dairy shed and the thatched/mud building.

### 2.2 Airbnb — two listings, hosted by the owner, and the most concrete stay source found

Both are titled for this farm and hosted by **Vimlendu, "12 years hosting"**. They
share one description verbatim.

| | Whole farm | Yamuna House |
|---|---|---|
| id | `763424639055785815` | `763406979666649683` |
| type | Farm stay, entire place | Private room in farm stay |
| capacity | **10 guests · 4 bedrooms · 4 beds · 2 bathrooms** | **4 guests · 2 bedrooms · 2 beds · 1 private bathroom** |
| rating | 4.83 · 6 reviews | 4.83 · 6 reviews · **Guest favourite** |
| photos | **67** | **31** |

The shared description, in the owner's own words:

- "a comfortable stay in the lap of a **5 acre organic farm**… the backdrop of Aravali
  Hills. It's **less than 50 kms from Gurugram, approx 90 mins from Delhi**"
- "It's not a hotel, its natural, it's rustic. It's a **REAL farm**"
- "The landscape had **NOT A SINGLE TREE a year ago**, a barren piece of land, and now
  it boasts of **over two thousand trees**, many/most native"
- Inventory as listed there: "vegetable farms, **Amla orchard**, vermi composting lab,
  a **mini-poultry**, a butterfly garden, a dairy farm, a native nursery"
- "you can choose to stay in your **mudhouse**… or walk around the farm amidst
  **peacocks, parrots and kingfishers**"
- "You can spend time **volunteering at the farm**… sowing, harvesting, composting,
  honey keeping, or just pulling out grass from our vegetable beds"
- Conditions stated plainly: **erratic electricity with inverter backup**; **no
  television, no Wi-Fi**, "Jio network works the best"; **borewell water, filtered for
  drinking**; nearest shop "a couple of kilometers away"; **pet-friendly** at ₹500 per
  pet per night; BYOB; firepit; free parking; a fully functional kitchen guests may use
- **Meals charged extra: breakfast ₹300, lunch ₹375, dinner ₹375 per person, tea twice
  a day.** (Rate currency unknown — see §4.)
- "don't expect a 5-star safari stay… cows, bees, birds, buffalos, goats, chicken and
  more"

**Buffalos and goats appear here and nowhere in this repo.** So does the Amla orchard.

### 2.3 swechha.in — the programme pages

`/project/farm-school/` and `/project/farm-school-sustainability-program/`:

- "a **2-hectare campus** near Manesar, at **Ladpuri Village in Alwar District**"
- **Day visits are "half-day exposure visits"** — "for individuals, families, and
  school students"
- Workshops: "learning by moving, learning by doing"; vermicomposting, bee-keeping,
  permaculture, water-harvesting, farming, forestry, system thinking
- **Age range: "starting from toddlers (2.5-year-olds onwards) and their parents, to
  young adults and college students"**
- Internships "to young people, **from India and abroad**"; plus "**research students
  from various Universities, to do their action research**"
- Contact given: **011-41009320**, **swechhaindia@gmail.com**
- The site's own counters for day visits / workshops / participants / internships
  **all render `0`** — the figures are not published anywhere.

---

## 3 · Contradictions, and which way they now fall

**3.1 The acreage was already ruled, and this ledger only corroborates it.**
D-07.3 settled it on 21 August — *"swechha farm is 5 acres and 1.5 hours from delhi,
use this"* — and recorded that **neither** the frozen homepage's *"Forty acres… 60km"*
**nor** the PDF's *"2-hectare campus at Ladpuri Village, Alwar"* stands. An earlier
draft of this section claimed the acreage was resolved HERE, on the arithmetic that two
hectares is 4.94 acres. That reasoning is sound but it is not the ruling and must not be
mistaken for one.

What today's sources add is corroboration from a third, independent, owner-written
place: the Airbnb listings say **"a 5 acre organic farm"** in his own words. Forty and
twelve remain the outliers and neither has a source. AD-22's worry about a third
acreage entering the section was a unit mismatch, not a conflict.

**3.2 The distance — both "60 km" and "90 minutes" are true, of different things.**
From the coordinates, the farm is **~60 km from central Delhi in a straight line** and
**~100 km by road**. The old homepage's "60km" was a map distance; "90 minutes" and
"less than 50 kms from Gurugram" are the travelling facts. **Publish time, not
distance** — 90 minutes is the owner's number, the Airbnb's number and D-07.3.

**3.3 The trees — 2,000 vs 5,000+, and this is a date problem, not a conflict.**
Airbnb says "over two thousand trees" and dates it "a year ago" from an undated
listing. The owner said "over 5,000 trees" on 21 August 2026. A growing farm produces
exactly this. **The page needs a date against the 5,000, or it inherits an argument
with a listing that is still live and still says two thousand.**

**3.4 The location is a SEPARATE question from the acreage, and D-07.3 closed it by
accident.** The PDF sentence D-07.3 struck — *"a 2-hectare campus near Manesar, at
Ladpuri Village, Alwar District"* — carried **two** claims: a size and a place. The
ruling was about size and distance, and the place went down with it. So the site now
names no location for the farm at all.

Two independent sources say the place part was right. **Google's own listing** puts it
at *Ladpuri, Rajasthan 301707*, plus code 4WGH+Q3, coordinates 28.1269309 / 76.927649.
**The owner's Airbnb listings** are titled *Ladpuri, India*. The coordinates sit at the
Haryana–Rajasthan edge; 301707 is Rajasthan; Manesar is a landmark ~35 km north, and
"Alwar District" is the administrative frame, not the address anyone would use.

**This needs its own ruling, and it is not the same ruling as D-07.3.** Options: name
Ladpuri; name nothing and keep only "an hour and a half from Delhi", which is the status
quo and what the page will ship with absent a decision; or give the full address, which
is already public on the farm's own Google listing.

**3.5 The day visit's length.** swechha.in says **half-day**. The live
`farm-school.json` says "ninety minutes out, and back by evening" — a full day. One of
them is stale.

---

## 4 · What the page cannot be built without — the owner's calls

1. **One page or two.** The unresolved AD-17 question 6. Everything below depends on it.
2. **Where the "Visits, camps and retreats" button goes**, and what a reader does when
   they land: a phone number, an email, a form, or the Airbnb listings.
3. **School camps overnight — the numbers.** The only sleeping capacity found anywhere
   is the homestay's 10 guests and 4 beds. A school camp is not ten people. Where does
   a school group sleep, how many, in what, and with what washrooms and supervision?
4. **Whether the Airbnb listings are named on the site at all.** They are the owner's
   own, they are the only bookable thing that exists, and they are also the only place
   the farm is described as a rental rather than a school.
5. **Whether any price goes on the site**, and if so whether the ₹300/₹375/₹375 meal
   rates are current. They are undated.
6. **Retreats.** "An ideal place for team meetings and retreats" is the entire sourced
   record. No capacity, no day rate, no room, no meeting space.
7. **A participation figure with a period.** The standing ledger hole: every other
   project counts its people, this one counts its compost. Still open.
8. **When the farm is open**, and whether Aravalli summer closes it.
9. **The photographs.** The 98 frames on the two Airbnb listings are the owner's own
   and are the only substantial photographic record of the stay found anywhere. The
   repo's ~10 farm frames are of the farm, not of the stay: no mud house interior, no
   bed, no table, no group. Reuse of the Airbnb set needs his word.

---

## 5 · Corroboration table — what three independent sources agree on

Facts that appear in the repo **and** on swechha.in **and** in the owner's Airbnb text
are the safe spine of the page:

| | repo | swechha.in | Airbnb |
|---|---|---|---|
| five acres / 2 ha | ✓ D-07.3 | ✓ | ✓ |
| 90 minutes from Delhi | ✓ | — | ✓ |
| native nursery | ✓ | ✓ | ✓ |
| vermicomposting | ✓ | ✓ | ✓ |
| apiary / bee-keeping | ✓ | ✓ | ✓ (honey keeping) |
| butterfly garden | ✓ | ✓ | ✓ |
| dairy | ✓ (20 cows) | — | ✓ (dairy farm) |
| poultry | ✓ | — | ✓ (mini-poultry) |
| water harvesting | ✓ | ✓ | — |
| barren before | ✓ | — | ✓ ("NOT A SINGLE TREE") |
| mud houses | ✓ | — | ✓ (mudhouse) |
| hydroponics | ✓ | ✓ (fodder) | — |

**The transformation hook is the best-sourced sentence available.** "Nothing grew
here" is on the frozen homepage; "NOT A SINGLE TREE a year ago, a barren piece of
land" is the owner's own wording, published, and still live.

---

## 6 · The governing brief — D-07.13, 21 August

**This page was commissioned nine months' worth of decisions ago and never built.**
D-07.13 reopened homepage band 8 and required it to carry **two stories, "both detailed
further on the inner page"**:

1. **The transformation** — barren land into a flourishing **Food Forest** and farm.
   *Food Forest is the client's own proper noun and is capitalised in the ruling.*
2. **A place you can come to** — "overnight school camps and day visits for students
   **and educators**; team meetings and retreats."

Plus: *"A good hook and call to action button."* The band delivers the hook (*"Nothing
grew here"*) and the button (*"Visits, camps and retreats"*), and the button has pointed
at `href="#"` ever since. **`/farm` is the page D-07.13 promised.** The two stories are
its spine and its order, not two sections among several. "Educators" is a named audience
in the brief and must survive into the page.

---

## 7 · Rulings, owner, 22 August 2026 — F-1 to F-4

**F-1 · Two pages, place and programme.** This closes AD-17 question 6 and
`farm-school.json` `holes[1]`, both of which have been open since 21 August.
`/farm` is **the place**: the transformation, what grows there, and every way a
person can come — day visits, school camps, retreats, the farm stay.
`/work/projects/farm-school` is unchanged and remains **the programme**, in the work
register. They link across. The homepage band 8 button resolves to `/farm`.

*Consequence to apply:* `farm-school.json` `holes[1]` is now answered and must be
removed from that file rather than left standing — a hole that has been filled and
still prints is worse than no hole at all.

**F-2 · The page ends in a phone number and an email, not a form.** No enquiry form,
no route handler, no inbox to maintain. This is how the farm takes bookings today and
the page should not pretend otherwise.

**F-3 · School camps ship with the hole named, not filled.** No capacity figure, no
sleeping arrangement, no ratio is published, because none is sourced. The page says so
in its own words, on the pattern already set by `farm-school.json` `holes[]` and by
`/impact` — the section refusing the number it is named for. It fills in when the
owner supplies figures.

**F-4 · The Airbnb photographs may be used.** The 98 frames across the two listings
are Swechha originals and enter `content/photo-library.json` with alt text written
from the frame, on the same consent basis as ruling W-14. This is what makes a stay
section possible at all: the ten catalogued farm frames contain no interior, no bed
and no group.

**F-5 · The farm is at Ladpuri, and the page says so.** This is the ruling §3.4 asked
for, and it is deliberately NOT a reversal of D-07.3: that ruling struck a sentence
about *size*, and the place name went down with it as collateral. Ladpuri is
corroborated by the farm's own Google listing (*Ladpuri, Rajasthan 301707*) and by both
of the owner's Airbnb listings (*Ladpuri, India*). Owner, 22 August: "yes it's ladpuri."

The page names **Ladpuri and the Aravallis**, with the ninety minutes. It does not print
the postal address, the plus code or a map link — F-2 puts a phone number at the foot of
the page, and a person who is coming will be told the way.

---

## 8 · What was built, 22 August 2026 — AD-24

**`/farm`, nine bands, on the `/impact` architecture.** `data/farm.json` holds every
sentence and every fact; `scripts/build-farm-page.mjs` resolves them and writes
`public/design/v3/farm.html`; `npm run build:farm`. Nothing is typed in the generator.

**The two stories are the spine and the order.** Bands 2–4 are the transformation (the
ground, what grows there now, how the place keeps itself); bands 5–7 are the place you
can come to (four ways to come, it is not a hotel, what we cannot tell you yet); then
the frames and the way in.

**Two figures are resolved, not copied.** The composted leaves and the honey are read
out of `data/work/projects/farm-school.json` by label, and the build **dies** if either
is renamed or removed. F-1 splits one place across two pages, and a split is exactly
where a number drifts.

**Sixteen gates, and two of them earned their keep.** The acreage gate caught the
masthead readout on the first run — correctly, since "5" and "five" are the same ruled
figure and the gate had only been taught the word. The kilometre gate passed while the
page said "a couple of kilometres" of the nearest shop, because it was anchored on a
digit: it is now two gates, one forbidding any numeric kilometre figure and one
asserting the shop is the *only* kilometre on the page. A gate whose name overstates
what it checks is worse than no gate, because it is believed.

**The nav word, the built file and the route are one change.** `Farm` pointed at
`/#farm` in **both** shells and therefore on all 26 built pages. Repointing it means
every page was rebuilt: 15 work pages, 7 situations, About, Impact. Two further doors
were still reaching the teaser band and now reach the page — the Farm School's own
"the evidence" door (`build-work-pages.mjs`) and About's farm door
(`build-about-page.mjs`) — and `onward.json`'s route contract carries `/farm`.

**Consequences applied.** `farm-school.json` lost the hole F-1 answered (3 → 2) and its
`invite.second` and `act` now point at `/farm`. The frozen homepage's band 8 button is
no longer `href="#"`.

**Verified.** All 16 gates green; `npm run verify:final` 7/7 pages, 12/12 checks; the
work build's 32 link-contract failures cleared; `designRoutes()` resolves `/farm` →
`/design/v3/farm.html`. Rendered and read at 1280×860 across the masthead, the four
doors, the conditions band and the foot.

**Known, and NOT this work:** `npm run test` fails 6 of 52, all in `lib/brand.test.ts`,
all `ENOENT` on `public/brand/swechha-{horizontal,stacked,stacked-tagline}.svg`. Those
vector masters are absent from the working tree and were before this session;
`public/brand/` is untouched here.

**Still open after this page ships:** the school-camp capacity (F-3, named on the page),
a participation figure for the farm, and whether the ₹300/₹375/₹375 meal rates and the
two Airbnb listings are ever named on the site. None blocks the page; each is one fact.

---

## 9 · Second pass, owner, 22 August — F-6 to F-12

**F-6 · The Aravallis are named as under pressure, WITHOUT case law.** The band says
what does not go stale: oldest range in India, Delhi to Gujarat, quarried for stone,
mined and built on. It deliberately says nothing about the litigation, and here is why
the restraint is load-bearing — the definition of what legally counts as an "Aravalli
hill" is live before the Supreme Court and **moved three times in nine weeks**: accepted
20 November 2025 (*In Re: Issues relating to definition of Aravali hills and ranges*,
2025 INSC 1338), kept in abeyance 29 December 2025, stay extended 22 January 2026 with
an expert committee to be constituted. Any sentence this page wrote about it would be
wrong by the time a school read it. **The "31 hills disappeared in Rajasthan" figure was
checked in two sources and confirmed in NEITHER — it is not used.** This repo has
shipped fabricated court citations before; the cheapest defence is to write nothing that
needs one.

**F-7 · The camp activities are real and are published as such.** Owner, 22 August.

**F-8 · "Live, Learn, Lead" is the farm's own frame** and it maps onto the three lengths
of stay — Learn is a day, Live is a night, Lead is what educators and small
organisations come to do. It sits ABOVE the four doors as the frame they hang in.

**F-9 · The farm is in Mewat, and it was built by the community there.** This is the
most significant addition of the second pass, because it changes what the page is
arguing. Five restored acres in a comfortable district is landscaping; five restored
acres in Mewat is something else. **Corroborated:** the Haryana district of the region,
Nuh (formerly Mewat), ranked **last of the 112 districts in NITI Aayog's Aspirational
Districts baseline (26.02%)** and was widely reported as the country's most backward
district. **Two cautions were applied to the wording.** First, the farm is at Ladpuri in
the *Rajasthan* half of Mewat, **not in Nuh** — the page says "the district on the
Haryana side of it has ranked at the very bottom", which is true and does not relocate
the farm. Second, Nuh has since improved sharply (2nd on the 2023 Delta ranking), so no
live ranking is printed — only that the region is among the poorest, which is the
owner's own claim and is not in dispute.

**F-10 · The land had ONE tree, not none — and this supersedes the owner's own live
Airbnb listing.** That listing says "The landscape had NOT A SINGLE TREE a year ago". It
is his published text, it is the more dramatic line, and it is wrong. Owner, 22 August:
"barren land with one tree, now has over 5000 trees." **The page is gated against the
superseded wording by name**, because a future session reading the listing in good faith
will want to restore it. One tree is also the better number: the page's subject is the
distance between one and five thousand, and a page that starts at zero has no scale.

*Consequence, and it is a live tension worth the owner's eye:* the frozen homepage hook
is **"Nothing grew here"**, which one tree makes not literally true. The page does not
quietly drop the hook and does not quietly contradict it — the lead corrects it out
loud: *"One tree stood on it — which is the only reason the line above is not literally
true, and the tree has earned the correction."* That is the register `/impact` already
set. **The homepage band itself is untouched and still says "Nothing grew here".**

**F-11 · The orchard is published as counts.** 200 amla, 200 kinnow, 200 moringa, and
lemon. A count is a promise an orchard is not: it can be walked. The lemon row carries an
em dash, not a guessed number.

**F-12 · Seven activities became ten** — bird watching, a tractor ride and the sound of
crickets join the list, and each of the ten is gated by name so a later edit cannot
quietly lose one.

### What the second pass cost, measured

| | at 375 | longest band |
|---|---|---|
| `/farm` before this pass | 9,689 (at 1440) | — |
| `/farm` after | **18,704** | `visit` **5,089** |
| `/impact`, for comparison | 12,655 | `register` **3,676** |

The homepage's ~900px per-band phone cap is a HOMEPAGE rule and inner pages have never
met it: `/impact`'s register band is 3,676. `origin` at 3,662 is within a hair of that
precedent and is not an outlier. **`visit` at 5,089 is the page's one genuine outlier**
— four doors with photographs stacked one per column, then ten activities stacked one
per column. It is legible, it does not overflow, and it is the direct cost of what was
asked for. It is the first thing to look at if this page is ever trimmed.

### One defect the build caught, and one it did not

**Caught:** the acreage gate fired on "barren acres" — an adjective, not a figure. It now
matches only a quantity before the unit, and was re-tested against `forty acres`,
`12 acres` and `two hectares` (all still caught) and `barren acres` (allowed).

**NOT caught, found by looking:** the head "A story of<br>transformation" set
`TRANSFORMATION` at 102px in a 564px column. The word measures **710px and cannot wrap**,
so it painted straight across the lead beside it. **A single long word does not respect
`minmax(0,1fr)`** — the one thing the grid gate was written to guarantee, and it is not
guaranteed. Nothing showed in a diff, an overflow check on the container, or a contrast
audit. There is now a gate: no word in a band head may exceed twelve characters, which
is the measured capacity of that column at that size. The client offered both
"transformation" and "change" for this head; **the shorter word is the one that can be
set big, which is what he asked for**, and his own "story of transformation" survives as
the quotation that opens the band.

---

## 10 · Third pass, owner, 22 August — F-13 to F-15

**F-13 · A hundred students can stay over. The capacity hole is CLOSED.** The page
shipped that morning saying it could not tell you this; it now says 100, and the school
camp door is the strongest of the four rather than the one with a caveat under it. The
`waiting` band drops from two claims to one. **The gate changed with it** — it was
`>= claims + 1` (the camp counted as a hole); it is now `=== claims`, an equality, so
that if anybody re-adds the camp hole the build fails rather than quietly passing a
looser test. A gate written as `>=` cannot detect a hole coming back.

*What is still not stated, and is deliberately not printed as a hole:* where a hundred
students sleep, and at what supervision ratio. A school will ask that in the enquiry F-2
routes them to, and a formal hole for it would be pedantry next to a published capacity.

**F-14 · The meal rates are ruled OUT.** ₹300 / ₹375 / ₹375 are real and are on the
owner's own live Airbnb listing, but they are undated and he has said they do not go on
the site. **Gated by number**, not by memory: an undated price is the single easiest
thing in this build for a later session to add helpfully, and the gate refuses any `₹`
or `Rs.` figure anywhere on the page.

**F-15 · One tree, and the land was bought four years ago.** Owner: "yes we had one tree
when we bought it 4 years ago." This closes the dating problem §3.3 raised in the first
pass — the 5,000 figure now has a span, and the span is the story: **one tree to five
thousand in four years.**

**THE ELAPSED COUNT IS NEVER TYPED.** `data/farm.json` stores `acquired.year = 2022` and
writes `{{years}}` in the copy; the build computes the count and substitutes it. This is
D-09.5's standing rule ("no year count is typed anywhere, the count derives from the
founding year") applied to a second page, and it is enforced rather than stated: a gate
walks the data file's **content fields** and fails on any typed "four years" or
"4 years". The gate scans content only and skips `_` keys — the first version read the
raw file and failed on the `acquired._` note, which necessarily quotes the client's own
"4 years ago". **A gate that fails on its own documentation is a gate somebody deletes.**

*One derivation the owner should confirm:* "4 years ago", said on 22 August 2026, is
stored as **2022**. If the farm was actually bought in 2021 or 2023, change
`acquired.year` and every mention re-derives on the next build — nothing else needs
editing.

### Open after this pass
Only two things, and neither is a hole the page pretends not to have:
1. **A participation figure** for the farm, with a period. Still the one named hole.
2. Whether the **two Airbnb listings** are ever named on the site. The meal rates are
   now settled (no), the listings are not.

---

## 11 · Fourth pass, owner, 22 August — F-16, F-17

**F-16 · The span is a BOUND, not a count: "less than five years".** Owner's own
phrasing, and it is better than the precision it replaces on two counts. It is **more
robust** — 2022 is *my* arithmetic from his "4 years ago", and if the true year is 2021
or 2023 then a stated "four years" is wrong while a ceiling is not. And it is
**stronger** — the claim is about how little time this took, and a bound is the shape
that argument wants.

It is still **derived, never typed**: the build computes `LESSTHAN = elapsed + 1` from
`acquired.year`, so elapsed 4 renders "less than five years" and elapsed 5 will render
"less than six". **The sentence can never become false**, which a typed "four years"
would in about five months. A second gate now asserts the span is stated *only* as a
bound — a bare "four years" fails the build, because that is precisely the regression
this ruling exists to prevent.

**F-17 · Tents, and the farm's own camping site.** This closes the silence the third
pass left on purpose: capacity was published (100) before the arrangement was known, and
inventing a dormitory was the one thing that could not be done. A hundred students sleep
**under canvas on the farm's own camping site**, and it is stated in three places — the
camp door, the inventory (it is infrastructure, not an arrangement), and the "it is not
a hotel" band, where the mud-house/tent distinction actually matters to a reader
deciding.

**It also explains a loose end from the very first research pass.** Google Maps lists
this place as a **Campground** — not a farm stay, not a guest house — and §2.1 recorded
that without being able to say why. The camping site is why. A category on a listing was
sitting there as evidence for a fact the page did not yet know.

### Two corrections to earlier entries in this ledger
- **§4 item 3 is CLOSED.** "Where does a school group sleep, how many, in what" — a
  hundred, in tents, on the camping site. Nothing of it remains open.
- **F-2's phone half is superseded.** The owner instructed on 22 August that his phone
  number come off the site, and it has (recorded as G-4 against the `/act` work, applied
  to this page in the same tree). The page still ends in a person — an email — which was
  F-2's actual point. **Process note worth recording: that removal was made by a
  concurrent session working in the same checkout, and it was swept into this page's
  third-pass commit (1b3589a) rather than committed under its own ruling.** The content
  is right and it is the owner's instruction; the attribution is not. Two sessions
  sharing one working tree is the cause, and `git status` before staging is the only
  defence.

### Open after this pass
**One thing.** A participation figure for the farm, with a period. That is the whole of
what this page still cannot tell a reader.
