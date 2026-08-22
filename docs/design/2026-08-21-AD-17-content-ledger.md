# CONTENT LEDGER — every project, journey, campaign and event, and whether it can fill a page

Compiled 21 August 2026 for the AD-17 WORK architecture decision (`2026-08-21-AD-17-work-section-brief.md`,
question 2: *own page / row / not yet*). This is a factual audit of what the repository
actually holds. **No figure in this file is new** — every one is quoted from a named file
and line, and where two files disagree both are published with the winner named by the
authority order below.

## Method and authority order

Applied in this order, top wins:

1. `docs/design/2026-08-21-SOURCE-FACTS.md` — figures with sources. Its §150 block
   ("Client-supplied content, 21 August 2026 — authoritative, and newer than the sources
   above") supersedes the earlier sections; §185 supersedes the PDF on three journey
   figures. Every supersession found is listed in **§4 Superseded figures** below.
2. `public/design/v3/home.html` — the FROZEN homepage, bands 4–7 (lines 3426–3830), plus
   band 8 Farm (3965) and band 9 Green the Map (4021). **Where a pre-freeze design page
   contradicts it, the homepage wins (D-10.4)** and the contradiction is recorded, not
   resolved.
3. `docs/design/DECISIONS-2026-08-20-homepage.md` — the ruling ledger (D-07.5 … D-10.4).
4. `content/` — the real Next.js content files.
5. The pre-freeze prototypes in `public/design/` — **evidence of what was once written,
   never authority**.

**Correction to the brief, verified by grep.** The brief says "two of those five [project
pages] are stamped *Demo content — not verified*". **Four of the five are stamped**, and a
fifth stamped page is a journey:

| file | line of the stamp |
|---|---|
| `public/design/project-farm-school.html` | 690 |
| `public/design/project-influence-fellowship.html` | 688 |
| `public/design/project-she-leads-change.html` | 687 |
| `public/design/project-food-systems.html` | 688 |
| `public/design/journeys-cityscapes.html` | 714 (stamped on the D-10.4 ruling) |

Each also repeats the stamp on its impact row ("Placeholder figures · not verified by
Swechha"), and `projects-landing.html:779–819` puts a dashed `Demo` pill on four of its
five cards. The only project prototype with **no** stamp is
`project-bridge-the-gap.html` — and that is the most dangerous page in the set, because
it carries four unsourced figures over the line *"Figures verified by Swechha · period to
be stated"* (line 791). See §2.5.

---

## 1. THE VERDICT TABLE

`RICH` = could carry a real page today. `THIN` = a strong row; a page would be padding.
`NAME ONLY` = we have a name and nothing else.

| item | kind | what is SOURCED (source) | what exists as DESIGN | demo/unverified stamp | photographs | contradictions | page-fillability |
|---|---|---|---|---|---|---|---|
| **Yamuna Yatra** | journey | 12 days, Yamunotri→Agra, ~1,000 km; 30+ Yatras since 2004; **3,000+** youth leaders; Vasant Valley Grade XI curriculum; Shriram, Pathways; American Embassy / British Council / EU (SOURCE-FACTS:50, superseded on the count by :187) | frozen band 5 row 01 (home.html:3548–3553) + full prototype `journeys-yamuna-yatra.html` (10-stop route, 7 experience themes) | none | 9 own frames incl. `river-valley-hillside-climb`, `yamuna-source-rapids`, `yamuna-students-foam-line` | prototype's 10 named stops are in **no** source; PDF's "2,000 young leaders" superseded | **RICH** |
| **Gram Anubhav** | journey | 4–5 days; **60+** organised; Uttarakhand, Rajasthan, **Gujarat**, Himachal; 100+ grassroots partners; workshops/home visits/shramdaan/cultural events (SOURCE-FACTS:51, superseded by :193) | frozen band 5 row 02 (3556–3561) + prototype `journeys-gram-anubhav.html` | none | 12 `gram-anubhav-*` frames — **but two are page scans, not photographs** (D-07.13 note) | prototype says **2–5 days** and five regions incl. MP, Karnataka/TN, Meghalaya/Assam — unsourced; homepage wins | **RICH** |
| **NatureScapes** | journey | 2–5 days; Sariska, Ranthambore, Mukteshwar (Sirmaur), Corbett, Sunderbans, Jaisalmer; four ecosystems; **60+** organised; Shriram and Modern schools (SOURCE-FACTS:156 + :190) | frozen band 5 row 03 (3574–3579) + prototype `journeys-naturescapes.html` | none | **5 destination frames are Unsplash stock** (image-credits.json), rest are generic Swechha landscape frames. No Sariska frame | prototype omits **Sariska**; SOURCE-FACTS §162 ("carries no figure") is itself superseded by §190 | **RICH** on text, **THIN** on pictures |
| **CityScapes** | journey | 2–4 hours (replaces PDF "half-day"); six named walks; 1,000+ walks in two decades; 100,000+ people (SOURCE-FACTS:164) | frozen band 5 row 04 (3586–3591) + prototype `journeys-cityscapes.html` | **STAMPED** (line 714, per D-10.4) | 13 `cityscapes-*` frames, ruled Swechha's own (D-09.6) but **absent from `content/photo-library.json`** | the stamped page's walk names and 2–4 h duration in fact **match** the owner's own §164 list — the stamp is over-broad | **RICH** |
| **Bridge the Gap** | project | 5–16 session modules on land/water/air + exposure trips + action projects; **100–150 Delhi schools every year**; 250+ schools / 50,000+ students / 15 yrs (cumulative); SRTT, Nokia Siemens, AmEx, NatGeo, Adobe; 2019–20: 200+ schools, CineGreen, Ride the Van (SOURCE-FACTS:56–61, superseded by :214) | frozen band 6 row 01 with photograph + two readings (3654–3671); prototype `project-bridge-the-gap.html` | **no stamp — and that is the defect** | `school-children-group` (homepage), plus 6 school/planting frames on the prototype | prototype's **25,000+ children / 85+ schools / 1,200+ mentors / 12 cities** (lines 786–789) are in no source and are captioned "verified by Swechha"; prototype's subject is *learning poverty and dropout*, every source's subject is *environment curriculum* | **RICH** (from source only — the prototype must be rebuilt, not corrected) |
| **Farm School** | project | "un'education Learning Lab"; day visits / short courses (the 5 C's) / internships and stays; ~5,000 kg leaves composted; apiary 500 kg honey; dairy prototype; permaculture, water harvesting, solar (SOURCE-FACTS:65–72); **5 acres, 90 min from Delhi** (D-07.3) | frozen band 6 rung 02 (3686–3687); prototype `project-farm-school.html` | **STAMPED** (690, 785) | ~10 farm frames + `children-beekeeping-veils`, `farm-plot-children-facilitator`, `microgreens-trays`, `turmeric-plot-workers` | PDF's "2-hectare campus, Ladpuri, Alwar" **and** the old homepage's "40 acres / 60 km" are both dead (D-07.3); prototype says **12 acres**, "Near Delhi", "Since 2016" | **RICH** |
| **Eco Action** | project | 70+ butterfly parks (PVR, AmEx, Adobe); 20+ herb gardens (Amazon, AmEx); Airshed Park Development — **Vasant Kunj, 5%→90% green cover over a decade**, American Embassy (SOURCE-FACTS:73–78) | frozen band 6 rung 03 (3691–3692) + impact tile 3 (3947). **No detail page designed** | none (no page) | **none specific.** `cityscapes-butterfly.jpg` is the only candidate frame | `about.html` still carries the **dead** "78 butterfly gardens" and "67 air-detox gardens" (killed by D-07.5) and "Seventy-eight butterfly gardens follow" in its 2016 timeline row | **RICH** on text, **NAME ONLY** on photography |
| **ME to WE** | project | volunteer school on the Yamuna's banks from 2007, ME to WE from 2009; children of Jagdamba Camp, Sheikh Sarai; **3,000+** over 13 years; **200+** alumni peer leaders, some now core team; since 2019, 400+ youth in job-exposure camps; EMpower since 2014 (SOURCE-FACTS:79–83) | frozen band 6 rung 04 (3696–3697). **No detail page designed** | none (no page) | **none specific** | none found; but the Jagdamba + EMpower spine is shared with She Leads Change and the two will read as one story unless separated | **RICH** on text, **NAME ONLY** on photography |
| **Influence** (CYON) | project | since 2010: 10,000 volunteers annually, 50 colleges, 200 placements, 75 partner orgs; CYON = 300+ youth groups (SOURCE-FACTS:84–86); **volunteering *and* fellowship, nationwide** (:224) | frozen band 6 rung 05 (3701–3702); prototype `project-influence-fellowship.html` | **STAMPED** (688, 783) | none specific; prototype borrows journey/protest frames | homepage says **Influence**, prototype invents the name **"Influence Fellowship"**; prototype's 180+ fellows / 24 districts / 7 cohorts / 60% are unusable | **THIN** — five counts and no description of what the fellowship year *is* |
| **She Leads Change** | project | with EMpower; Learning Communities; adolescent girls from Jagdamba; **50+** girls through the year-long journey since 2017; part of a 300-strong LC cohort; 2018 ELC Bright Promise Award (57 girls) (SOURCE-FACTS:175–178) | frozen band 6 rung 06 (3721–3722); prototype `project-she-leads-change.html` | **STAMPED** (687, 782) | **none specific**; prototype borrows meal/crop frames | prototype is about **rural women's collectives, 48 villages, 120+ elected to local bodies** — a different programme from adolescent girls in a Delhi camp. Homepage wins (D-10.4) | **THIN** |
| **Food systems, with UNEP** | project | one sentence, forward-looking: *"to run curriculum and action projects in government schools in Delhi NCR, around food and sustainability."* **No figures** (SOURCE-FACTS:180–183) | frozen band 6 rung 07 (3726–3727), deliberately with no figure and no achievement verb; prototype `project-food-systems.html` | **STAMPED** (688, 783) | **none specific**; prototype borrows farm/food frames | prototype claims 3 studies published / 18 partner institutions / 1,400 t mapped / 2 cities — all unusable. Also unresolved on the homepage: a not-yet-delivered project under a head reading "What is running" | **NAME ONLY** (a name, a partner, a scope sentence) |
| **Brake Even** | project — **ARCHIVED** | 200+ schools; 25+ corporate houses (Accenture, PwC, Nokia, BCG); **500,000+ individuals** (SOURCE-FACTS:62–64) | **removed from the homepage** on the owner's 21 Aug ruling; survives only as the explanatory comment at home.html:3676–3681 | n/a | none specific | none — the removal is explicit (SOURCE-FACTS:220–222); note the 500,000 figure leaves the live register with it | **archive row only** — do not build |
| **We for Yamuna** | campaign | founded **2000**; *"a collective response towards growing apathy towards one of the most polluted rivers of the world"*; still the org's spine (SOURCE-FACTS:19, :99) | frozen band 7 campaign 01 (3775) with a hook to the Yamuna situation page; also the About band's 2000 row (3873–3876) | none | 9 `yamuna-*` / river frames | none. But the campaign's whole content is already spent in the About band and the hero | **THIN** — no dated action, no demand, no outcome of its own; the 6,890 t tile is not attributed to it anywhere |
| **Monsoon Wooding** | campaign | ~5,000 trees in Delhi NCR **each year**; **50,000+ planted and survived**; IndusInd Bank, PwC, Amazon, Adobe, S&P Global. The verb "survived" is theirs (SOURCE-FACTS:93–98) | frozen band 7 campaign 02 (3778–3779). One real content file: `content/story/monsoon-wooding-2021.md` | none — but see the story-file caveat in §6 | `children-certificates-field`, `children-hats-red-jackets`, `children-seedling-boxes-field`, `youth-site-visit` | D-03.5's placeholder hook *"Runs against Forest loss →"* is gone from the frozen band; the story file's survival-rate prose traces to no source | **THIN**, closest of the three campaigns to RICH |
| **Delhi I Can't See You** | campaign | **NOTHING.** In neither source document (SOURCE-FACTS:242). Owner-supplied name only, 21 Aug (:239–240) | frozen band 7 campaign 03 (3783), hooked to the air situation page; `situation-air.html:1849` asserts *"Delhi I Can't See You is Swechha's campaign on this"* | none — and it carries no figure, so nothing to stamp | **none named for it.** `clean-air-protest.jpg` is the only candidate and it is already the About hero and a 2021 archive placeholder | the name originates in a **designer's poster line**, `2026-08-19-three-directions-client.md:126` and `2026-08-19-synthesis-direction.md:126`, before the owner adopted it | **NAME ONLY** |
| **Spotted. Stop It!** | campaign | the PDF has **"Spotted — War against Waste"**, a youth-led city campaign run through theatre, music, film and action-research clubs (SOURCE-FACTS:100–102) | **absent from every design file.** The string "Spotted. Stop It!" appears nowhere in the repo except the notes recording its absence | n/a | none | live-site name vs source name differ, and the campaign is on neither the homepage nor any prototype | **NAME ONLY** |
| **Oye Dilli** | campaign — **REMOVED** | political-awareness city campaign (SOURCE-FACTS:100) | removed 21 Aug; survives only in the home.html comment at 3785–3795 explaining the march re-step | n/a | none | none | **removed — do not build** |
| **Right to Education** | campaign | named in the PDF's youth-led city campaigns (SOURCE-FACTS:100) | **named in no design file** | n/a | none | not on the owner's 21 Aug list of three | **NAME ONLY** |
| **Yamunotsav** | event | **name only** (SOURCE-FACTS:244) | frozen band 7 strip (3816); `events-landing.html:783` card with *"Description, dates and documentation to come"* | none | a Yamuna gathering frame stands in — `events-landing.html:22–24` says outright it is **not** a confirmed photograph of the event | none | **NAME ONLY** |
| **Cyclothon** | event | **name only** (:244) | frozen strip (3817); **absent from `events-landing.html`'s past-events list** | none | none. Real frames are in the Drive archive, sign-in blocked (`events-landing.html:25–26`) | on the homepage, not on the events prototype | **NAME ONLY** |
| **Greenathon** | event | **name only** (:244) | frozen strip (3818); **absent from `events-landing.html`** | none | none | on the homepage, not on the events prototype | **NAME ONLY** |
| **Yamuna Shramdaan** | event | **name only** (:244) | frozen strip (3819); `events-landing.html:793` card, "to come" | none | a stand-in Yamuna frame, explicitly not confirmed as this event | none | **NAME ONLY** |
| **Townhalls** | event | not in either source | `events-landing.html:802`, "Frame to come" | none | **none** — the prototype shows a pending state | **not among the owner's four events.** Homepage wins | **NAME ONLY**, and not a live item |
| **Remakery Workshops** | event | Remakery itself is sourced: 30+ workshops, a dozen concerts and plays, weekly "One Night Stand" (SOURCE-FACTS:103–105) | `events-landing.html:811`, "Frame to come". The Remakery sentence was **deliberately cut** from the frozen strip (home.html:3800–3812) | none | **none** | not among the owner's four; its real figures were removed rather than reattached to the wrong names | **THIN** as a Remakery item; **not a live event** |
| **Swechha Farm** (the place) | place / band | transformation story: 5,000+ trees, 20 cows, poultry, native nursery, vermicompost, hydroponics, butterfly garden, organic farming, apiary, mud houses; camps, day visits, retreats (SOURCE-FACTS:197–211); **5 acres, 90 min** (D-07.3); nursery of 20,000 saplings | frozen band 8 (3965–4019), rebuilt under D-07.13, with a CTA to an inner page | none | ~10 farm frames; hero is `farm-plot-children-facilitator.jpg` — **consent unresolved** (see §5) | its scope overlaps Farm School's almost entirely; nobody has ruled whether they are one page or two | **RICH** |
| **Green the Map** | separate enterprise | fair-trade/upcycling retail and B2B, **15+ stores and buyers** worldwide (SOURCE-FACTS:87–89) | frozen band 9 (4021–4036), whose own copy says *"It is not a Swechha programme"* and links out to `greenthemap.com` | none | one frame, `green-the-map-tote.jpg` (colour baked in, not in the photo library) | none | **THIN — and out of scope by its own band copy.** Do not give it a Swechha detail page |
| **Green Creeps** | enterprise | urban farming enterprise, **May 2015** (SOURCE-FACTS:87) | **named in no design file** | n/a | none | none | **NAME ONLY** |
| **Low Carbon Futures** | research | with IGES, funded by UNEP; six-country study on per-capita carbon consumption and a 1.5° scenario (SOURCE-FACTS:106–108) | **named in no design file** | n/a | none | none | **THIN** — real partner, real subject, no page anywhere yet |
| **CYCLES for Sustainability** | research | with the University of Surrey; six countries; children and youth in cities (SOURCE-FACTS:108–109) | **named in no design file** | n/a | none | none | **THIN** |
| **CineGreen** / **Ride the Van** | sub-programmes | Bridge the Gap's 2019–20 leadership journeys, alongside 200+ schools (SOURCE-FACTS:60–61) | **named in no design file** | n/a | none | none | **NAME ONLY** — but they are the best unused material for the Bridge the Gap page |

**Tally: 4 journeys (3 RICH + 1 RICH-on-text), 7 live projects (4 RICH, 2 THIN, 1 NAME
ONLY), 3 live campaigns (0 RICH, 2 THIN, 1 NAME ONLY), 4 live events (4 NAME ONLY).**
Plus 2 removed items, 2 out-of-register campaign names, 2 events that exist only on the
pre-freeze prototype, and 6 sourced items named in no design at all.

---

## 2. WHERE THE EVIDENCE IS THIN OR BROKEN — the cases that decide the architecture

### 2.1 Events are four names and nothing else. All four.

There is no date, no edition, no count, no location and no description for Yamunotsav,
Cyclothon, Greenathon or Yamuna Shramdaan **anywhere on disk**. The frozen strip says so
by construction (home.html:3800–3812: *"There are NO dates, no editions, no years and no
counts anywhere in it, because he gave four names and nothing else"*), and the pre-freeze
prototype says it in prose (`events-landing.html:14–17`: *"NONE of the four events has a
description, a date or a location anywhere on disk"*). The owner's own caveat is
recorded verbatim at SOURCE-FACTS:246. **The one-page ruling is already correct; four
event detail pages would be four empty templates.**

### 2.2 Campaigns are the weakest kind on the site, not the strongest.

Three campaigns; between them, exactly **two** sourced figures (50,000+ trees survived,
~5,000/yr) and both belong to one of them. `content/campaign/` holds one file,
`delhi-air-quality-2026.md`, and it is a **situation bulletin** ("Air quality crosses
hazardous threshold across Delhi-NCR", `status: active`, `liveData.mock: true`) — not a
campaign profile, and not about any of the three named campaigns. `app/work/campaigns/`
renders that file under a heading that reads "Situations". So the live route for
campaigns currently publishes zero of the three campaigns the homepage names.

### 2.3 Two of the eight-row register are effectively unwritten.

She Leads Change has **four sourced facts**, all in one sentence of §175, and Food
systems has **one sentence of scope with no figures**. The frozen homepage already
handles this honestly — rung 07 carries no figure and no achievement verb — and its own
comment (3703–3719) flags the open question: whether a not-yet-delivered project belongs
under a head reading "What is running". A detail page for either one today would be the
row, re-set larger.

### 2.4 The best-sourced material on the site has no page designed for it.

**Eco Action** and **ME to WE** are, on the evidence, the two richest untold items in the
register — Eco Action has three sub-programmes, five funders and a one-park decade-long
before/after; ME to WE has an origin, a place, a dated arc (2007 → 2009 → 2019), a
3,000-person count and the "alumni became staff" line. Neither has a prototype page and
neither has a single photograph named for it. Meanwhile four prototype pages exist for
items with less content.

### 2.5 The unstamped prototype is the one to distrust.

`project-bridge-the-gap.html` carries no demo band. Its header comment (lines 11–14)
claims: *"CONTENT IS REAL. Every line here … comes from the Bridge the Gap template in
internal.html, which was built from the workbook and whose numbers the owner verified.
Nothing on this page is invented."* On the page itself:

- lines 786–789: **25,000+ children reached · 85+ schools · 1,200+ young mentors · 12 cities**
- line 791, under them: *"Figures verified by Swechha · period to be stated"*

None of those four figures appears in SOURCE-FACTS, in any owner ruling, or on the frozen
homepage — which instead carries **100–150 schools every year** and **50,000+ students
over fifteen years** (home.html:3663–3671), each with its period stated. `internal.html`
does not exist in the repository. The page also frames Bridge the Gap as *"Learning
poverty is real. Dropout is high"* with pillars "School support / Mentorship / Life
skills / Community" (712, 735–760) — while every source frames it as a curriculum on
land, water, air, waste, climate change and inclusive ecology. **Treat all four figures
as unusable and the page's subject framing as wrong.** It is worse than the stamped pages
because it reads finished.

### 2.6 Two prototypes contradict D-03.2 (the homepage may not depend on counts).

- `projects-landing.html` heads its register **"Five projects. One direction."** The
  frozen homepage carries seven rungs plus a boundary row and states no total anywhere.
- `events-landing.html` heads its lead **"Four kinds of gathering"** and then lists past
  events as Yamunotsav, Yamuna Shramdaan, **Townhalls, Remakery Workshops** — two names
  that are not the owner's four, while Cyclothon and Greenathon are missing.

Both are pre-freeze; the homepage and D-03.2 win.

### 2.7 `about.html` still carries three figures that rulings killed.

Not a WORK page, but it will be linked from every WORK page, so it is in scope for the
contradiction record: `public/design/v3/about.html` still shows **"78 / Butterfly
gardens"** and **"67 / Air-detox gardens"** (dead under D-07.5, and "air-detox garden" is
a term neither source uses), **"Audited to 31 March 2026"** on the impact strip (withdrawn
by D-07.1 — the frozen homepage says *"Our own count, verified to 31 March 2026"*),
**"Twenty-six years"** typed three times (against the derive-from-2000 rule and D-09.5),
and a timeline row putting **Bridge the Gap at 2007** where the frozen About band's
five-row register has no 2007 entry at all.

### 2.8 The content layer cannot model two of the four kinds.

`lib/content/types.ts:1–8` defines exactly five content types: `project`, `story`,
`knowledge`, `film`, `campaign`. **There is no `journey` type and no `event` type.**
`content/project/` contains only `.gitkeep` — zero project files for seven named
projects. `content/campaign/` contains one file, and it is a situation bulletin. So of
the ~25 items in this ledger, **the number with a real content file is one, and it is
arguably mis-typed.**

---

## 3. SUPERSEDED FIGURES — where §150/§185 overrides the PDF

Every one of these is a case where an earlier number is still true of the document it
came from and must not be published as current.

| item | superseded figure (PDF) | figure that stands | authority |
|---|---|---|---|
| Yamuna Yatra | "over 2,000 young leaders" (SOURCE-FACTS:50) | **more than 3,000 youth leaders** | :187 (owner, 21 Aug) — on the homepage at 3552 |
| Gram Anubhav | "over 30 conducted" (:51) | **more than 60 organised** | :193 |
| Gram Anubhav | three states: Rajasthan, Himachal, Uttarakhand (:51) | **four states, adding Gujarat** | :193 — homepage 3559 |
| NatureScapes | "no counts … carries no figure" (:162) | **more than 60 organised**, Shriram and Modern schools | :190, which explicitly closes :162 |
| CityScapes / eco-walks | "half-day guided visits" (:52) | **2–4 hour immersion journeys** | :164 — homepage 3586 |
| Bridge the Gap | "12–16 session curriculum" (:56) | **5 to 16 sessions** | :214 |
| Bridge the Gap | "over 250 schools … 15 years" as the headline | **100–150 Delhi schools every year**; the 250/50,000 figure is retained but relabelled as a cumulative programme count | :214–219; both periods stated on the homepage at 3666 and 3670 |
| Farm School / Swechha Farm | "2-hectare campus near Manesar, Ladpuri, Alwar" (:66) **and** the old homepage's "Forty acres… 60 km" | **five acres, an hour and a half from Delhi** | D-07.3 — neither prior version stands |
| Eco Action | "78 butterfly gardens", "67 air-detox gardens" (build substitutions) | **over 70 butterfly parks, over 20 herb gardens** | D-07.5 |
| Impact tile 1 | "3M+ children and young people" unqualified | **"Children and young people reached since 2000"**, cumulative, method note required | D-07.6; the owner's own derivation is at SOURCE-FACTS:226–235 and is an **extrapolation, not a count** |
| Impact tile 3 | 5%→90% read as organisation-wide | **one Vasant Kunj park, over a decade** | SOURCE-FACTS:121–123; label on the homepage at 3947 |
| Brake Even's 500,000+ | live register figure | **leaves the live register with the item** | :220–222 |

---

## 4. THE TWO KNOWN OPEN MISMATCHES — verified against the repo

### 4.1 "Delhi I Can't See You" — confirmed: in neither source document

`SOURCE-FACTS:242` states it, and the repo bears it out. Full inventory of every
occurrence:

| file:line | what it is |
|---|---|
| `docs/design/2026-08-19-three-directions-client.md:126` | a **designer's poster line** — "`DELHI, I CAN'T SEE YOU` knocked out beneath it" |
| `docs/design/2026-08-19-synthesis-direction.md:126` | the same device, restated |
| `docs/design/2026-08-19-directions-b-and-c.md:351` | listed as a hypothetical campaign page |
| `docs/design/2026-08-19-section-audit-salvage.json` (5 rows) | a tile in the rejected work grid, audited for typography and layout |
| `docs/design/2026-08-20-AD-04-restructure.md:152` | tabulated as the Air campaign, hooked to `situation-air.html` |
| `public/design/v3/home.html:3783` | **campaign 03 on the frozen homepage** |
| `public/design/v3/situation-air.html:1849, 1851` + `scripts/build-situation-air.mjs:668` | the assertion *"Delhi I Can't See You is Swechha's campaign on this"*, with a link |
| `docs/design/2026-08-21-SOURCE-FACTS.md:240, 242` | the owner's 21 Aug list of three campaigns, and the note that it is unsourced |

**What the repo shows:** the name entered the project as a hero device on 19 August, was
promoted to a campaign row on 20 August, and the owner then named it as one of the three
live campaigns on 21 August — so it *has* owner authority as a name. What it does not
have is a description, a date, a figure, a partner, a photograph or a source document.
The `situation-air.html` sentence is currently the strongest claim on the site about a
campaign nobody has described.

### 4.2 "Spotted. Stop It!" — confirmed absent, and the name differs from the source

The exact string appears in **no** design file, content file, script or image. Grep across
the repo returns only the two notes recording the mismatch
(`SOURCE-FACTS:242`, `AD-17-work-section-brief.md:86, 145`) plus an unrelated hit on
`corbett-spotted-deer-forest.jpg`. What the sources do carry is a **different name**:
*"**Spotted — War against Waste**"*, one of the PDF's youth-led city campaigns run
through theatre, music, films and action-research clubs (SOURCE-FACTS:100–102, PDF p5).

**What the repo shows:** the campaign is absent from the frozen homepage's three, absent
from every prototype, and the live-site name and the PDF name do not match. This is two
questions for the owner, not one: *is it live?* and *what is it called?*

---

## 5. PHOTOGRAPHY

`public/images/photos/` holds **89** files. `content/photo-library.json` describes **53**
of them, all but two credited "Swechha archive". `docs/design/image-credits.json` (14
entries) credits the nine Wikimedia `wm-*.jpg` frames — which live in
`public/design/img/`, i.e. design-board material, deleted before deploy — and five
Unsplash frames which are **in** `public/images/photos/`.

### 5.1 Per-item frames (by filename plus the alt text in `home.html` and the prototypes)

| item | frames that plausibly belong to it |
|---|---|
| Yamuna Yatra | `yamuna-source-rapids` (homepage row 01), `river-valley-hillside-climb` (prototype hero), `hillside-journaling-group`, `snow-trek-group`, `langar-community-meal`, `yamuna-students-line-skyline`, `yamuna-students-foam-line`, `india-gate-dusk`, `trekkers-hillside` |
| Gram Anubhav | 12 × `gram-anubhav-*` (`hero`, `shramdaan`, `village-walk`, `group-learning`, `rural-community`, `local-food`, `community-circle`, plus five named for regions) |
| NatureScapes | `journeys-hero`, `snow-trek-group`, `hillside-gathering`, `pine-forest-path`, `grasses-dusk`, `ridge-road-dusk`, `langurs-resting`, `langurs-branch-family`, `langur-golden-portrait` — **plus 5 stock destination frames** |
| CityScapes | 13 × `cityscapes-*` (`hero-riverside-walk`, `yamuna-walk`, `landfill-walk`, `forest-walk`, `bird-watching-walk`/`birdwatching`, `heritage-walk`, `restoration-park-walk`, `group-learning`, `butterfly`, `riverbank-restoration`, `urban-wetland`, `community-restoration`) |
| Bridge the Gap | `school-children-group` (homepage row 01), `school-selfie-uniform`, `children-certificates-field`, `children-hats-red-jackets`, `youth-site-visit`, `nursery-plants`, `forest-group-walk`, `hillside-gathering` |
| Farm School / Swechha Farm | `farm-plot-children-facilitator` (farm band hero), `farm-thatch-amaltas`, `farm-building-yellow-trees`, `farm-cow-closeup`, `farm-cows-shed`, `farm-cows-sunrise`, `farm-tractor-ploughing`, `bamboo-net-plot`, `microgreens-trays`, `turmeric-plot-workers`, `leafy-greens-crop`, `nursery-plants`, `oranges-*` (4), `children-beekeeping-veils`, `bee-on-mustard-flower`, `kans-grass-yellow-flower` |
| Monsoon Wooding | `children-certificates-field`, `children-hats-red-jackets`, `children-seedling-boxes-field`, `youth-site-visit` (all tagged `planting`) |
| We for Yamuna | `yamuna-barrage-crowd`, `yamuna-floodplain-crowd`, `yamuna-students-line-skyline`, `yamuna-students-foam-line`, `yamuna-source-rapids` |
| Green the Map | `green-the-map-tote` (the only one) |
| Events (Yamunotsav, Yamuna Shramdaan) | Yamuna gathering frames used **as stand-ins**, explicitly not confirmed as these events |

### 5.2 Items with NO usable photograph — flagged

- **Eco Action** — no butterfly-park, herb-garden or Vasant Kunj airshed frame exists.
  `cityscapes-butterfly.jpg` is a butterfly, not a park. The one before/after story on the
  whole site (5% → 90% over a decade) has no picture of either state.
- **ME to WE** — nothing named for Jagdamba, the Yamuna-bank school, or the alumni.
- **She Leads Change** — nothing. The prototype uses community-meal and crop frames.
- **Influence** — nothing. The prototype borrows journey and protest frames.
- **Food systems, with UNEP** — nothing. The prototype borrows farm/food frames.
- **Delhi I Can't See You** — nothing. `clean-air-protest.jpg` is the only candidate and
  it is already spent twice (About hero, and the record sheet's 2021 placeholder).
- **Cyclothon, Greenathon** — nothing, and `events-landing.html:25–26` records that the
  real frames sit in a sign-in-blocked Drive archive (`Campaigns/Yamunotsav`, `Cyclothon`,
  `Shramdaan`).
- **Townhalls, Remakery Workshops** — nothing; the prototype draws a "Frame to come" state.
- **Sariska** (NatureScapes destination) — no frame, and the destination is missing from
  the prototype too.

### 5.3 Stock and Wikimedia used where the item must look like Swechha's own work

**NatureScapes is the live problem.** All five of its destination frames are **Unsplash
stock** (`docs/design/image-credits.json`): `ranthambore-tiger-grass` (Bob Brewer),
`corbett-spotted-deer-forest` (Sandy Millar), `mukteshwar-pines-snow-peak` (Renzo
D'souza), `jaisalmer-camel-dunes` (Jakub Jacobsky), `sunderbans-mangrove-roots` (Jimmy
Blackwell). A NatureScapes page built from the existing prototype is illustrated
end-to-end with stock wildlife and dunes — it will read as a tour operator's brochure,
which is the opposite of what a "60+ journeys organised" claim needs beside it. Every
other frame on that page is a generic Swechha landscape, not a NatureScapes journey.

Two frames in the photo library are Wikimedia and **already self-tagged
`placeholder`**: `uttarakhand-fire-scar-2016.jpg` (ArmouredCyborg, CC BY-SA 4.0) and
`monsoon-flooded-fields.jpg` (lensnmatter, CC BY 2.0, cropped). Both are situation
frames, neither is attached to a work item — fine as is, but they must not migrate onto a
project or journey page.

### 5.4 Frames that are not photographs, and frames with no record

- **`gram-anubhav-hero.jpg` is a screenshot of a website mockup** and
  `gram-anubhav-shramdaan.jpg` was a crop of a printed page (white gutter, neighbouring
  frame, mustard band), cropped in place on 21 August. Both faults are recorded in
  `DECISIONS-2026-08-20-homepage.md` under D-07.13 ("Photo defect fixed on the way past"),
  which also says outright that the photo library needs a pass of its own. The repaired
  `gram-anubhav-shramdaan.jpg` is the frame the frozen homepage uses at 3549.
- **36 of the 89 files have no `content/photo-library.json` entry** — therefore no `alt`,
  no credit, no `signal`, no consent note. They include **all 13 `cityscapes-*`** (D-09.7
  logs this: *"`content/photo-library.json` has no `cityscapes-*` entries, so D-09.6's
  archive credit has nowhere to live"*), **all 12 `gram-anubhav-*`**, the five Unsplash
  destination frames, `green-the-map-tote`, `journeys-hero`, `india-gate-hero`,
  `clean-air-protest`, `farm-tractor-ploughing`, `yellow-flower-closeup`. That is the
  photography for two of the four journeys with no provenance record at all.
- **Consent is unresolved for four frames showing identifiable children** —
  `children-seedling-boxes-field`, `farm-plot-children-facilitator`,
  `children-beekeeping-veils`, `school-selfie-uniform` — per the library's own header
  note: *"unresolved for publication at hero scale; consent has not been confirmed."*
  Two of them are already running at hero scale on the frozen homepage
  (`farm-plot-children-facilitator` is the Farm band's full-bleed picture at 3969–3971;
  `school-selfie-uniform` is the About triptych frame at 3855). Bridge the Gap's own
  prototype refuses a schools photograph in its hero for exactly this reason
  (`project-bridge-the-gap.html:26–32`). **Every WORK page that wants a school photograph
  runs into this, so it is an architecture-blocking question, not a picture-choice one.**
- The homepage's record sheet carries **25 `s-record-ph` placeholder frames** under
  hatching (D-07.14), several of them journey and project frames reused as archive
  stand-ins (`cityscapes-yamuna-walk` as 2017, `turmeric-plot-workers` as 2013,
  `gram-anubhav-community-circle` as 2015 …). Any WORK page reusing those frames will be
  reusing a picture the homepage is simultaneously presenting as an unfilled archive box.

---

## 6. ONE MORE CAVEAT ON `content/` — the story files

Three story files exist and none of them traces to `SOURCE-FACTS`:

- `content/story/monsoon-wooding-2021.md` — the only content file attached to a named
  campaign. Its subject (three-year survival rates) is consistent with the sourced verb
  "planted and survived", but the prose itself is unsourced.
- `content/story/delhi-air-victory.md` — titled *"How Delhi's communities won a partial
  ban on construction emissions"*, claiming eighteen months of documentation and advocacy
  producing a policy outcome. **No source document supports this**, and it is the same
  class of claim as the fabricated court citations D-11.1 cut from the air page. Do not
  cite it as campaign evidence until the owner confirms it.
- `content/story/rooftop-sanctuary.md` — "eleven bird species", unsourced.

---

## 7. THE HOLES — per item, what three sentences from the owner would change

Ordered by how much the answer moves the architecture.

1. **Food systems, with UNEP** — NAME ONLY → THIN/RICH. *Has it started, and if so when
   and in how many schools? What is UNEP's actual role — funder, technical partner, or
   co-designer? What is the first deliverable and its date?* Without the first answer the
   row cannot honestly sit under "What is running".
2. **She Leads Change** — THIN → RICH. *What does a girl actually do across the year-long
   Learning Communities journey — how many sessions, on what?* *How many girls are in it
   right now, in 2026?* *What did the 2018 ELC Bright Promise Award recognise?* Also
   needed: whether it is a distinct programme from ME to WE or its continuation, because
   both sit on Jagdamba and EMpower.
3. **Influence** — THIN → RICH. *What is the fellowship: how long, how many fellows per
   cohort, doing what?* *Is CYON still active, and are the 300+ youth groups current or
   cumulative?* *Are the 10,000 volunteers a year and the 200 placements still true in
   2026, and since when?* Today the item is five numbers from 2010 and no description.
4. **The three campaigns** — THIN/NAME ONLY → RICH, and this is the largest single hole.
   For **Delhi I Can't See You**: *when did it start, what does it demand, and what has it
   done that can be named?* For **We for Yamuna**: *one dated action and one demand* —
   anything that is not the founding story the About band already tells. For **Monsoon
   Wooding**: *where are the sites, and how is "survived" counted?* — the honesty of that
   verb is the best thing on the campaigns band and nobody can currently explain it.
5. **Spotted. Stop It!** — *Is it live, and is it the PDF's "Spotted — War against
   Waste"?* One answer either adds a fourth campaign or closes the question. It cannot be
   built on either way until he answers, because the two names are not the same name.
6. **Eco Action** — RICH text, no pictures. *One photograph of a butterfly park, one of a
   herb garden, and the Vasant Kunj park before and after.* The text is already the
   strongest unbuilt page on the site; it needs frames, not facts. Also: *what is the
   current butterfly-park count* — the register says "over 70" and the dead tiles said 78.
7. **ME to WE** — RICH text, no pictures. *Any photograph of the Jagdamba group or the
   Yamuna-bank school, and permission to name one or two alumni who became core team.*
   That single line — "some of whom are now core team members" — is the best sentence in
   the entire source document and it currently has no face on it.
8. **The four events** — NAME ONLY, and unlocked by access rather than by prose. *Open
   the Drive folders `Campaigns/Yamunotsav`, `Cyclothon` and `Shramdaan`* (recorded as
   sign-in blocked), *and for each event give one line: what happens, and roughly how many
   editions have run.* One line each turns a strip of four names into four rows on one
   page. Without it the one-page ruling is the only honest option.
9. **NatureScapes** — RICH text, stock pictures. *Any Swechha photographs from the 60+
   journeys, at any of the six destinations.* Also: *is Sariska still a destination?* It is
   in the owner's own list and in no design page or photograph.
10. **Bridge the Gap** — RICH, but needs one deletion and one number. *Confirm the
    prototype's 25,000+/85+/1,200+/12-cities figures are withdrawn*, and *say what
    CineGreen and Ride the Van are* — two named leadership journeys with no description
    anywhere, sitting inside the best-sourced project on the register.
11. **Farm School vs Swechha Farm** — both RICH, and that is the problem. *Are they one
    page or two?* If two: *what does a Farm School programme include that a farm visit does
    not?* The two items currently share five acres, a nursery, an apiary and a school
    audience.
12. **Yamuna Yatra** — RICH, one confirmation. *Are the ten stops (Mussoorie, Lakhamandal,
    Janki Chatti, Yamunotri, Gangnani, Paonta Sahib, Kurukshetra, Delhi, Vrindavan, Agra)
    the real route?* They are the spine of the existing prototype and they appear in no
    source; the prototype's own comment admits it has no photograph for six of them.
13. **Gram Anubhav** — RICH, one correction to make. *4–5 days and four states (with
    Gujarat) per the homepage, or the prototype's 2–5 days and five regions including MP,
    Karnataka/Tamil Nadu and Meghalaya/Assam?* The homepage wins under D-10.4, but five
    photographs are named after the losing set and will need renaming or retiring.
14. **The content model** — not an owner question but a build one, and it gates
    everything above: `lib/content/types.ts` has no `journey` and no `event` type, and
    `content/project/` is empty. Seven projects, four journeys and four events currently
    have exactly zero content files between them.
