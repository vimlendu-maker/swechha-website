# Source facts for the work/about/impact chapter — and what fails a description check

Compiled 21 August 2026 from the two sources the client named:
- **`Introduction to Swechha.pdf`** (14pp, `~/Downloads/`; a 2022 copy sits at
  `~/Desktop/SWECHHA MASTER/Admin/Swechha Policy Folder/Introduction to Swechha_2022.pdf`).
  Text extracted with macOS PDFKit via JXA. Page cites below are that PDF.
- **`swechha.in`** — the live WordPress site. Its REST API is publicly readable, but
  `/wp-json/wp/v2/pages/2458` (About Us) currently **500s**; the page's HTML at
  `https://swechha.in/about-us-environment-ngo/` serves fine and is what was scraped.

Everything below is quoted or paraphrased from those two sources. **Nothing here is
invented, and nothing on the page may state a figure that is not here or in an owner
ruling.**

## Who we are — the org's own words (use these, don't improve on them)

- Founded **2000**, as the **"We for Yamuna"** campaign — "a collective response
  towards growing apathy towards one of the most polluted rivers of the world" (site,
  About; PDF p1).
- **"Be the Change"** — "an organization dedicated to enabling ourselves and others
  around us to 'Be the Change', in making a visible difference to the Environment —
  both Physical and Social" (site, About).
- **Mission, verbatim:** "to inspire, create and support — a just, equitable and
  sustainable society, for everyone and forever." (site + PDF p1.)
- Three pillars = the tagline: **Education. Environment. Enterprise.** (PDF p3; the
  site calls them "three key focus areas".)
- Under those, **five themes**: Sustainable Lifestyles & Education · Sustainable
  Agriculture & Integrated Development · Sustainable Cities & Ecology · Resilient &
  Equitable Communities · Green Economy & Enterprise — plus a cross-cutting
  **Building Narratives for Sustainability** (research, communication, advocacy).
  Each is a live page on the current site (`/sustainable-cities-and-ecology/` etc).
- Method, in their words: "the pedagogy of intensive interaction with the citizens and
  the governments to engage them in the process of Change **through Campaigns, Events
  and Programs**" (site, About). Note that phrasing is the client's four kinds minus
  *journeys* — his new IA promotes journeys to a peer of the other three.
- Named institutional history (site, About): European Commission, UNDP, UNV, UNEP,
  The American Embassy, British Council, Nokia Siemens Network, SRTT, CNN International,
  NDTV. **Swechha was one of six stories on "CNN — Be the Change", reported weekly for
  a year in 2008–2009.**
- "Change" is defined in the PDF (p1) as "a transformation in the attitude of the
  masses, in their perceptions and simultaneously in the environment — both social and
  human." The PDF's own frame for the value system is a **"Wheel of Change"** (p2):
  research and knowledge creation, media and advocacy, networking, systemic change,
  awareness and learning, individual and collective action.

## JOURNEYS — the strongest-sourced section on the page

| journey | sourced facts (PDF p4–p5) |
|---|---|
| **Yamuna Yatra** | flagship. **12 days, Yamunotri → Agra, ~1,000 km**, tracking the river "from where it originates and is pristine, down to the point where it reaches Agra and is almost a toxic body of water". **Since 2004, over 30 Yatras, over 2,000 young leaders.** Partners: Vasant Valley School, Pathways World School, The American Embassy, British Council, The European Union. Vasant Valley made it part of its **Grade XI annual curriculum**. |
| **Gram Anubhav** | **4–5 days**, purely experiential, rural India — workshops, village interactions, home visits, shramdaan, cultural events. **Over 30 conducted**, to remote villages of **Rajasthan, Himachal and Uttarakhand**; **over 100 grassroots NGO and social-movement partners** in rural communities. |
| **Eco-walks / tours to ecological hotspots** | half-day guided visits — a Yamuna walk, a landfill, the Ridge, Delhi's heritage water-harvesting sites. **Over 1,000 walks in two decades, over 100,000 individuals.** |

## PROJECTS — sourced facts

- **Bridge The Gap** — curriculum-based school programme (land, water, air, waste,
  climate change, inclusive ecology) + teacher training. **12–16 session curriculum,
  over 250 schools in Delhi NCR, over 50,000 students, 15 years.** Supported by Sri
  Ratan Tata Trust, Nokia Siemens Networks, American Express, National Geographic,
  Adobe. 2019–20: **over 200 schools** through year-long curricula and the leadership
  journeys **CineGreen** and **Ride the Van**. (PDF p3–p4.)
- **Brake Even** — short module-based outreach. **Over 200 schools, over 25 corporate
  houses and institutions** (Accenture, PwC, Nokia, Boston Consulting), **over 500,000
  individuals engaged.** (PDF p4.)
- **Farm School** — "state-of-the-art, organic, experiential, deconstructed
  'un'education Learning Lab on sustainability". **A 2-hectare campus near Manesar, at
  Ladpuri Village, Alwar District** (PDF p6). Three programme kinds: day visits,
  short-term workshops/courses (the **5 C's** — connection, creativity, confidence,
  cognition, cycle), internships and stays. Farm activity sourced on p8–p9:
  ~**5,000 kg of dead leaves** composted, an apiary that has produced **500 kg of
  honey**, a dairy prototype, permaculture/soil-regeneration training, water harvesting
  (swales, bundhs, ponds), solar.
  > **RETRACTED SITE-WIDE BY THE OWNER, 23 August 2026.** Two rulings, a day apart,
  > and the second supersedes the first.
  >
  > He first struck `/farm`'s rendering of the water-harvesting clause — "Water first,
  > before anything was planted… Swales cut across the slope, bundhs to hold the
  > runoff, ponds to keep it" — saying *"The following is not true in teh farm page,
  > delete it from the root."* That named one page, so the claim was deleted from
  > `data/farm.json`, gated in `build-farm-page.mjs`, and **flagged to him rather than
  > removed by inference** from `/work/projects/farm-school`, where it also renders.
  >
  > Asked directly, he then ruled on the rest: *"delete the water swales and bundhs
  > part."* **The claim is now retracted everywhere on the site**, including
  > `/work/projects/farm-school` and `data/work/projects/farm-school.json`.
  >
  > **This §72 line is NOT deleted, and that is deliberate.** It records what the PDF
  > says, and the PDF still says it. What changed is that the site no longer repeats
  > it: the owner, who runs the farm, says the water-harvesting infrastructure
  > described on PDF p8–p9 is not what is there. A source document saying a thing and
  > the thing being true are different facts, and this entry is the record of the
  > first. **Do not restore the claim to any page on the strength of this entry** —
  > that is the exact failure this note exists to prevent. If it is ever published
  > again it needs a new statement from the owner, not a re-reading of the PDF.
- **Eco Action** — butterfly gardens (**over 70 Butterfly Parks in Delhi NCR**,
  supported by PVR, American Express, Adobe), herb gardens (**over 20**, supported by
  Amazon and American Express), and **Airshed Park Development**: "one of our most
  prominent Airshed Development projects has been in **Vasant Kunj**, where we
  converted a public park with **5% green cover into a lush green park with 90% green
  cover, over a decade of work**" — supported by The American Embassy. (PDF p9–p10.)
- **ME to WE / Pagdandi** — began 2007 as a volunteer school on the Yamuna's banks;
  became ME to WE in **2009** with children from **Jagdamba Camp, Sheikh Sarai**.
  **Over 3,000 girls and boys over 13 years**, an alumni community of **over 200** peer
  leaders — "some of whom are now core team members at Swechha". Since 2019, **over 400
  youth** through job-exposure camps. Supported by EMpower since 2014. (PDF p10–p11.)
- **Influence / CYON** — youth leadership. Since 2010: **10,000 volunteers annually,
  50 colleges, 200 placements, 75 partner organisations**; CYON is a network of **over
  300 youth groups**. (PDF p5–p6.)
- **Green Creeps** (urban farming enterprise, **May 2015**) and **Green the Map**
  (fair-trade/upcycling retail and B2B, supplying **over 15 stores and buyers**
  worldwide) — Green the Map already has its own band further down the page. (PDF p12.)

## CAMPAIGNS + EVENTS — sourced facts

- **Monsoon Wooding** — annual volunteer-driven plantation campaign. "We Plant, Protect
  and Promote Trees during the monsoon months in Delhi, actively planting
  **approximately 5,000 trees in Delhi NCR each year** and so far have **planted and
  survived over 50,000 trees** in total." Supported by IndusInd Bank, PwC, Amazon,
  Adobe, S&P Global. (PDF p10.) **Note the verb "survived" — it is the honest word and
  it is theirs.**
- **We for Yamuna** — the founding campaign, 2000, still the org's spine.
- Youth-led city campaigns: **Right to Education**, **Oye Dilli** (political awareness),
  **Spotted — War against Waste** — run through theatre, music, films and action-research
  clubs. (PDF p5.)
- **Remakery** — barter/exchange platform, performance space, upcycling and repair lab,
  coworking events space. **Over 30 workshops, a dozen concerts and plays**, weekly
  **"One Night Stand"** events bringing artists and activists. (PDF p12.)
- Research as public narrative: **"Low Carbon Futures"** with IGES, funded by UNEP (a
  six-country study on per-capita carbon consumption and a 1.5° scenario), and
  **CYCLES for Sustainability** with the University of Surrey (six countries, children
  and youth in cities). (PDF p12–p13.)

## DESCRIPTION CHECK — where the page and the sources disagree

Each of these needs a ruling, not a guess. The first three are inside the redesign.

1. **"3M+ children and young people"** (Impact tile 1) is not supported by either
   source. The largest figure in the PDF is **"over 500,000 individuals"** (Brake Even),
   with 50,000 students on Bridge The Gap, 10,000 volunteers annually on Influence,
   3,000 on ME to WE, 100,000 on eco-walks. The owner ruled the impact numbers real and
   owner-verified, which stands — but the page should be able to name the method behind
   3M+, because a reader who has read the About page will do this arithmetic.
2. **"5% → 90% green cover"** (owner-ruled Impact tile 3) is **one park** — Vasant Kunj,
   over a decade, American Embassy supported. It must not be set so it reads as a
   city-wide or organisation-wide figure. The honest tile is the park.
3. **"78 butterfly gardens" / "67 air-detox gardens"** (the tiles the build substituted):
   butterfly gardens ARE real and the PDF says **"over 70"** — 78 is a plausible updated
   count, so the earlier note that they had no source was true only of this repo.
   **"Air-detox garden" is not a term either source uses** — the source term is
   **Airshed Park**. Either the page adopts the source's word or the owner confirms the
   new one and its number.
4. **The farm's size** (band 8, outside this chapter, flagged for the owner): the
   homepage says **"Forty acres… 60km from Delhi"**; the PDF says a **2-hectare campus
   near Manesar, at Ladpuri Village, Alwar District** — about five acres, and Alwar is
   ~120km from Delhi by road. One of the two is wrong.
5. **"Twenty-six years"** is typed in five places against the ruling that it derive from
   `foundedYear = 2000`.

## Register — what "sharp and hook-like" means here, in evidence

The lines that already work on this page are short, concrete, and refuse the NGO
register: *"A number is not a smell."* · *"The numbers are not the work."* · Monsoon
Wooding's own *"planted and survived"*. The sources give more of the same when you
quote them straight rather than paraphrase: *"from where it originates and is pristine,
down to the point where it reaches Agra and is almost a toxic body of water"*;
*"a rope is not just a rope"*; *"everything grows and everyone can grow"*. **Prefer a
sourced phrase over an invented one.** Every section's description must be checkable
against this file.

---

## Client-supplied content, 21 August 2026 — authoritative, and newer than the sources above

Given directly by the owner in chat. It supersedes the PDF where they differ (notably the
eco-walks' duration), and it is usable even though it is in neither document. Nothing here
may be inflated beyond what he wrote.

**NatureScapes** — "our school journeys programme, ranging from **2–5 days**, to various
ecological destinations." Destinations: **Sariska · Ranthambore · Mukteshwar, Sirmaur ·
Jim Corbett · Sunderbans · the desert ecosystem at Jaisalmer.** He groups them under
**four ecosystems — Forest, Himalayan, Desert, Marine.** Learning: ecosystem learning,
community interaction, shramdaan, self development. **He gave no counts. This journey
therefore carries no figure** — it is the one journey on the page without one, and that
is the truth about it, not a gap to be filled.

**CityScapes** — the eco-walks programme renamed. **"2–4 hour immersion journeys inside
the city, to various ecological hotspots"** — note this replaces the PDF's "half-day".
Named walks: **Yamuna · Landfill · Forest · Bird Watching · Heritage · Restoration Park.**
The PDF's figures carry over: over a thousand walks in two decades, over a hundred
thousand people.

**Gram Anubhav** — no new description; his instruction was "make the same design for Gram
Anubhav, use your intelligence for content", i.e. the same treatment as its neighbours
from the sourced facts (4–5 days, 30+ conducted, Rajasthan/Himachal/Uttarakhand, 100+
grassroots partners, village interactions, home visits, shramdaan).

**She Leads Change** — a current project, "run with EMpower, same detail you have
mentioned": the Learning Communities work with adolescent girls from Jagdamba — over 50
girls through the year-long journey since 2017, part of a 300-strong LC cohort, with the
2018 ELC Bright Promise Award (57 girls) behind it.

**Food systems, with UNEP** — a current project: **"to run curriculum and action projects
in government schools in Delhi NCR, around food and sustainability."** That is all of it.
**No figures, and the phrasing is forward-looking**, so it must not be set as delivered
scale under a head that reads "What is running".

### Journey figures updated by the owner, 21 August — these supersede the PDF

- **Yamuna Yatra** — over **30** Yatras, **more than 3,000 youth leaders** (the PDF's
  "over 2,000" is stale). Schools named: **Vasant Valley School, Shriram School,
  Pathways World School.**
- **NatureScapes** — **more than 60 organised**, with prominent schools including
  **Shriram Schools and Modern Schools.** (This closes the earlier gap: NatureScapes now
  has a figure and is no longer the journey without one.)
- **Gram Anubhav** — **more than 60 organised** (the PDF's "over 30" is stale), to rural
  communities of **Uttarakhand, Rajasthan, Gujarat and Himachal Pradesh** — Gujarat is
  new against the PDF's three states.

### Swechha Farm, given by the owner 21 August — two stories

**Story one, transformation:** a barren piece of land converted into a flourishing
**Food Forest** and farm — **over 5,000 trees, 20 cows, poultry, a native nursery,
vermicomposting, hydroponics, a butterfly garden, organic farming, an apiary, mud
houses** and other **permaculture prototypes**. His framing: "So its a story of
transformation."

**Story two, it is a place you can come to:** **school camps (overnight) and day visits**
for school students and educators; **"an ideal place for team meetings and retreats."**

Both are detailed further on the farm's inner page. The homepage band must carry them
with "a good hook and call to action button". Facts already ruled: **five acres, an hour
and a half from Delhi** (D-07.3). The existing band's "nursery of twenty thousand
saplings" is true and compatible with his "native nursery".

### Projects register, updated by the owner 21 August

- **Bridge the Gap** — works with **over 100–150 schools of Delhi each year**. A
  **module-based approach on land, water and air, ranging from 5 to 16 sessions**, plus
  **exposure trips and action projects**. (The PDF's "12–16 session" range is superseded
  by 5–16; its "250 schools / 50,000 students over 15 years" is a documented programme
  count, not the annual figure.)
- **Brake Even — REMOVED from the register and moved to the archive.** It no longer
  appears on the homepage. Note the consequence: the PDF's "over 500,000 individuals"
  belonged to Brake Even, so that figure leaves the live register with it.
- **Influence** — a **volunteering *and* fellowship programme, nationwide**. (Not just
  the volunteer number: the fellowship is half of what it is.)

### The 3 million, as the owner derives it
His words: "we work with over 100-150 schools of delhi each year… So we must have worked
with over 3 million kids. Thats where the number of 3 million is coming from."

**This is an extrapolation, not a count, and the page promises a method note behind every
figure.** The arithmetic: 150 schools × ~19 years of Bridge the Gap ≈ 2,850 school-years,
so 3,000,000 implies **roughly 1,000 children per school per year** — a whole-school
exposure figure, not the 5–16 session cohort. The organisation's own documented
curriculum count is **50,000+ students in 250+ schools over 15 years**. Both can be true
of different things; the label on the tile has to say which one it is counting.

### Campaigns and events, updated by the owner 21 August

- **Oye Dilli is REMOVED** from the campaigns band. Campaigns are now three: We for
  Yamuna, Monsoon Wooding, Delhi I Can't See You. (Note the march composition was built
  for four rows stepping one column right; three changes that figure. Also still
  unresolved: "Delhi I Can't See You" appears in neither source, and "Spotted. Stop It!"
  is live on swechha.in but is not on the homepage.)
- **Events become four named events: Yamunotsav · Cyclothon · Greenathon · Yamuna
  Shramdaan.** His own caveat, in his words: *"These events are from the past mostly and
  they could be in archive too, but i feel on homepage it shows depth."*
  **So the strip must read as a body of work, not a calendar.** No implied dates, nothing
  that suggests a visitor can attend next month, and no invented editions or counts —
  depth is the job, and the honest form of depth here is the names themselves.

### Social accounts — verified from the live site, 21 August

Scraped from `https://swechha.in/`'s own markup, so these are the real accounts, not
guesses. **The frozen homepage contains none of them** (the footer's only contact is
`mailto:info@swechha.in`; the strings instagram/facebook/twitter/youtube/linkedin appear
zero times in the file).

| platform | URL |
|---|---|
| Instagram | `https://www.instagram.com/swechhaindia/` |
| Facebook | `https://www.facebook.com/SwechhaIndia/` |
| X / Twitter | `https://x.com/swechhaindia` (the old site links `twitter.com/swechhaindia`) |
| YouTube | `https://www.youtube.com/@swechhaindia` (a legacy channel `youtube.com/user/MegaSwechha` also exists) |

No LinkedIn link appears on the live site. **Do not invent one**, and do not invent
follower counts, post embeds or "latest from Instagram" feeds — nothing on this page may
imply a live feed that is not wired.

---

# READINGS AND LIMITS — the environmental fact base

Added 21 August 2026. The D-11 block noted this file had **no environmental figures at
all**, so gate #11 ("every figure traced") could not be met for a single reading. This
section closes that. **Everything below is transcribed from the cited document, not from
memory**, and each row names what it is: a **STANDARD** (fixed by notification), a **STUDY**
(one-off, dated), or a **READING** (a measurement, and therefore a specimen until a feed
exists).

## S-1 · STANDARD · The CPCB AQI breakpoint table

Source: **CPCB, "About National Air Quality Index"**, cpcb.gov.in — the Board's own
methodology document. Transcribed in full because the page derives verdict, multiplier and
the six-band scale from it.

**Six categories. Eight pollutants.** *"AQ sub-index and health breakpoints are evolved for
eight pollutants (PM10, PM2.5, NO2, SO2, CO, O3, NH3, and Pb) for which short-term (upto
24-hours) National Ambient Air Quality Standards are prescribed."*

| category | AQI | PM10 | PM2.5 | NO2 | O3 | CO | SO2 | NH3 | Pb |
|---|---|---|---|---|---|---|---|---|---|
| Good | 0–50 | 0–50 | 0–30 | 0–40 | 0–50 | 0–1.0 | 0–40 | 0–200 | 0–0.5 |
| Satisfactory | 51–100 | 51–100 | 31–60 | 41–80 | 51–100 | 1.1–2.0 | 41–80 | 201–400 | 0.5–1.0 |
| Moderately Polluted | 101–200 | 101–250 | 61–90 | 81–180 | 101–168 | 2.1–10 | 81–380 | 401–800 | 1.1–2.0 |
| Poor | 201–300 | 251–350 | 91–120 | 181–280 | 169–208 | 10–17 | 381–800 | 801–1200 | 2.1–3.0 |
| Very Poor | 301–400 | 351–430 | 121–250 | 281–400 | 209–748 | 17–34 | 801–1600 | 1200–1800 | 3.1–3.5 |
| Severe | 401–500 | 430+ | 250+ | 400+ | 748+ | 34+ | 1600+ | 1800+ | 3.5+ |

**CO in mg/m³, every other pollutant in µg/m³. 24-hour averages for PM10, PM2.5, NO2, SO2,
NH3 and Pb; 8-hour values for CO and O3.**

**S-1a · The aggregation rule, verbatim: *"The worst sub-index determines the overall
AQI."*** This is CPCB's own sentence and it is the licence for band 3's whole device. Note
the correction it forces: the index is the worst of **eight**, not of six. Six is the number
of *categories*.

**S-1b · The sub-index is linear in concentration**, and CPCB gives its own worked example:
for PM2.5 the sub-index is **51 at 31 µg/m³, 75 at 45 µg/m³, and 100 at 60 µg/m³.** So the
multiplier and the breach are **derivable** and must never be typed.

**S-1c · THE FINDING THAT REFRAMES THE PAGE. AQI 100 *is* the legal limit.**
The Satisfactory/Moderately-Polluted boundary sits at **PM2.5 = 60 µg/m³ and PM10 = 100
µg/m³** — which are exactly the **NAAQS 24-hour standards** for those pollutants (S-2). So
"AQI above 100" is not a judgement or a rule of thumb: **it is arithmetically identical to
"above the standard India set for itself."** The masthead's promise — *every reading against
its published limit* — is therefore satisfied by the index itself, with no editorial
addition. Use this. It is the cleanest true thing on the page.

## S-2 · STANDARD · NAAQS 2009, the pollutants this page uses

Source: **National Ambient Air Quality Standards, CPCB notification 2009** (12 pollutants in
full; only those used here are listed). Residential/rural/industrial areas.

| pollutant | annual | 24-hour |
|---|---|---|
| PM2.5 | **40 µg/m³** | **60 µg/m³** |
| PM10 | **60 µg/m³** | **100 µg/m³** |
| NO2 | 40 µg/m³ | 80 µg/m³ |
| SO2 | 50 µg/m³ | 80 µg/m³ |

**S-2a · Averaging period must be stated with every comparison to the WHO guideline.**
The WHO 2021 guideline for PM2.5 is **5 µg/m³ annual** and **15 µg/m³ 24-hour**. So India's
standard is **8× the WHO's on the annual figure** and **4× on the 24-hour figure.** D-14.2's
device rests on the *annual* comparison, because the Lancet study models annual exposure —
so **"eight times looser" is correct there and only there.** A 24-hour reading compared to
the WHO number is a 4× gap. Getting these two crossed is the easiest error on this page.

## S-3 · STUDY · Mortality, against two limits
**Lancet Planetary Health, December 2024** — *"Estimating the effect of annual PM2·5
exposure on mortality in India: a difference-in-differences approach."*
- Against the **WHO guideline**: **~1.5 million deaths per year.**
- Against **India's own NAAQS**: **3.8 million deaths across 2009–2019 — 5.0% of total
  mortality** (95% CI 2.9–4.9m; 3.8–6.4%).
- The entire Indian population lives above the WHO guideline.

## S-4 · STUDY · Delhi adolescent lung function
**Lung Care Foundation (New Delhi) with Pulmocare Research and Education Foundation (Pune),
*Lung India*, September 2021.** 4,300+ children **aged 13–17, in Delhi.**
- **29.4% spirometry-defined asthma or airflow obstruction**; 21.7% by ISAAC questionnaire.
- **The study's own strongest association was obesity, not air pollution** (39.8% vs 16.4%
  overweight/obese). **Per D-14.3 this must be stated in the same breath as the figure.**
  The population is Delhi adolescents 13–17 — not "children", and not India.

## S-5 · STUDY · Life expectancy
**Air Quality Life Index, Energy Policy Institute at the University of Chicago (EPIC), 2025
edition.** **India 3.5 years** lost; **Delhi-NCR 8.2 years.** Nearly twice the toll of
childhood and maternal malnutrition; more than five times unsafe water and sanitation.
Measured against the WHO guideline.

## S-6 · STUDY · Economic cost
**Dalberg Advisors with Clean Air Fund and CII, 2021.** **~$95 billion a year ≈ ₹7 lakh
crore ≈ 3% of GDP** — the report's own framings: **50% of all tax collected annually** and
**150% of India's healthcare budget.** Components: 1.3bn work days lost/yr (~$6bn),
productivity loss up to $24bn, lost working years $44bn. **This figure is ANNUAL.**

## S-7 · RECORD · NCAP and XV-FC funds
Sources: PIB releases, CPCB **PRANA** funding guidelines, CREA *Tracing the Hazy Air*
progress reports.
- **₹13,415 crore released** under NCAP + XV-FC since inception; **₹9,929 crore utilised —
  74%.** *(Cumulative since FY2019-20.)*
- The **82 NCAP cities**: **₹831.42 crore utilised of ₹1,615.47 crore released — 51%**
  (to 3 May 2024).
- **These figures are CUMULATIVE. S-6 is ANNUAL.** Any comparison must say so — see D-14.8.

## S-8 · The AQI record begins in 2015
India's National AQI launched **April 2015**. Pre-2015 NAMP monitoring measured SPM / RSPM /
PM10 — **a different quantity by a different method**, and not spliced into the series
(D-13.3).

## S-9 · READINGS have no source yet, and that is the honest state
No feed is wired (D-10.1). Every *measurement* on the page — the current AQI, the eight
sub-indices, station coverage, the city ranking, farm-fire counts — is a **specimen stamped
`DEMO DATA`** until the job in D-13.1 runs. The **standards and studies above are real**, so
the page's limits, verdicts, multipliers and health figures are genuine from day one.
**That is the intended asymmetry: the argument is sourced, the reading is stamped.**
