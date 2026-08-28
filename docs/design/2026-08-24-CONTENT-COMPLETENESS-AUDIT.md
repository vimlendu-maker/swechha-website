# Content completeness audit — swechha.in

**Date:** 2026-08-24
**Scope:** all 35 canonical routes on the live site, the 23 work items in
`data/work/**`, the photo catalogue, the legacy URL map, and the eight
documents committed to `public/docs/`.
**Method:** every route enumerated from `design-routes.ts` and cross-checked
against the live sitemap and live HTTP; text and heading structure extracted
from all 35 built pages; every `figures` and `holes` block in `data/` harvested
programmatically; the photo catalogue counted by flag; live HTTP checks against
`swechha.in` for routing, robots and document reachability.

**This audit does not restate `docs/design/2026-08-22-LEGACY-SITE-CONTENT-AUDIT.md`.**
That document crawled the *old WordPress site* and said what was worth taking.
This one audits the *new live site* and says what is missing from it — including
several things that audit recommended, which were then done, and several that
were half-done in a way that is worse than not doing them.

**Companion sheets:** `docs/design/content-collection-2026-08-24/` — seven CSVs,
319 rows, openable directly in Google Sheets.

---

## A. Executive summary

### What is already strong

**The six situation pages and `/now` are the best thing on this site and are not
thin.** Air, Yamuna, heat, forest fire, forest loss and extreme rain each carry
one measurement against one published limit, with the source named, the cadence
stated, the observation time printed, and the limit's legal basis cited. `/now`
goes further and refuses to total them, on the stated grounds that six units do
not average. A daily job re-reads every source and a document watcher checksums
the source PDFs. **Nothing in the Indian environmental NGO sector looks like
this**, and no recommendation in this audit should be read as asking for less of
it.

**The refusal architecture on `/impact` is a genuine institutional asset.** Every
figure resolves out of `data/work/**`, so the page cannot disagree with the item
page a number came from; the page explains why there is no grand total; and it
labels each figure `counted` or `modelled`. Most NGO impact pages are a row of
animated counters. This one argues.

**The site already keeps a register of its own gaps.** 73 `holes` entries across
`data/`, each with an `unlocks` line saying what single fact would close it.
Roughly 45 of those are content-collection tasks, already written by people who
know the work. **A large part of this audit is simply that register, promoted
into a collection sheet.** That is a compliment to the previous work, not a
criticism of it.

**The migration is closed.** 167 generated redirects, verified against the site's
own route map so a 308 cannot land on a 404. 16 team biographies recovered. Five
bylined essays republished. Three real publications with real PDFs. The 148-video
channel indexed.

### What is visibly missing

1. **Nine annual/activity reports and the 80G certificate are live on the site
   and linked from nowhere.** They answer HTTP 200 today. No page references
   them. The organisation's entire published transparency record is invisible,
   while the footer asserts "80G, 12A, FCRA Powered" with no numbers and no
   certificate. This is the highest-value, lowest-effort item in the audit and
   it requires no collection at all.

2. **Thirteen of the 23 work items have no page** — seven of eight campaigns,
   all four events, and two of seven projects. The four events carry 42 to 161
   words of data *in total*. Seven campaigns have zero published figures between
   them. The founding campaign, We for Yamuna, running since 2000, is a card.

3. **Twenty-five further programmes redirect to a parent index with nothing
   behind them** — The Remakery (named on two pages, staffed, and 404 at its own
   URL), Teacher Training (700+ educators), Green Finance with IGES (93 social
   enterprises), Circular Economy / Marine Litter with GIZ *and a government
   ministry*, Women & Non-Traditional Livelihoods (Udaan, Lunchbox 17, Million
   Kitchen), Pagdandi, the five farm training programmes, Films & Documentaries.

4. **There is no record anywhere on the site that Swechha has ever been covered
   by anyone.** The six `coverage-*.json` files measure press attention to the
   *issues*, explicitly never to Swechha. CNN International's *Be the Change*,
   the 2004 India Today and Outlook features, the 2011 UN General Assembly
   address, and broadcasts on NDTV, BBC and CBC exist on this site only as
   clauses inside one biography.

5. **The first eighteen years of the organisation have no photograph.** The
   homepage's archive strip has 27 year-cells; 20 are placeholder frames; every
   year from 2000 to 2017 is one of them. The strip honestly labels itself
   "7/27 years scanned", which is to the site's credit and does not make the
   hole smaller.

6. **250+ schools claimed; five named.** 100+ grassroots host organisations
   counted; none named. 50 colleges and 75 partner organisations counted; none
   named. ~150 fellows since 2010; none named. Twenty funders and partners named
   in total, all buried inside five item pages, with no partner page, no logos,
   no years and no permission record.

7. **No student, teacher, fellow, villager, volunteer or partner is quoted
   anywhere on 35 pages.** The only quoted voice on the entire site is the
   Executive Director, twice, on `/farm`. Beyond the staff biographies, nobody
   Swechha has worked with speaks in their own words.

### What feels under-documented

- **The timeline.** `/about`'s "The record since 2000" has four entries: 2000,
  2004, 2016, Now. The homepage has five. Twenty-two years of a twenty-six-year
  organisation are blank — and the raw material to fill them is sitting in the
  nine annual reports already in the repo.
- **`/publications`** carries three items and is titled "Three we put out." Six
  more real, public, Drive-hosted documents exist — four field manuals, a
  brochure, and the Green Finance research — none of them on the site.
- **`/farm`** describes a place beautifully and describes no programme. Five
  farm training programmes redirect *to it* and are named nowhere on it. A
  section titled "Built by Mewat" names nobody from Mewat.
- **`/stories`** has published nothing since August 2023. All five essays are
  2022–23. 148 videos are indexed; roughly eight are used.
- **The situation pages prove Swechha can measure. Nothing on them proves
  Swechha has ever acted on a measurement** — no RTI, no consultation response,
  no submission, no representation, on any of the six issues.

### The biggest credibility opportunities

| # | Opportunity | Effort |
|---|---|---|
| 1 | Publish the nine reports and the 80G certificate on `/about` | **Zero collection** — a publishing decision |
| 2 | Build the real timeline from the nine reports | Low — read what is already in the repo |
| 3 | Vasant Kunj park, 5% → 90% green cover, photographed **then and now** | One afternoon, one park, one archive search |
| 4 | Open the Yamunotsav Drive folder | One access request — nine Junes of a river festival |
| 5 | Name two ME to WE alumni who are now staff, with portraits | Two conversations and two consents |
| 6 | One partner school's roll for one year | One email — it converts the site's largest number (3M+) from a derivation into a count |
| 7 | Six field manuals onto `/publications` | Re-hosting files that are already public |

### The most urgent content gaps

Ranked by *damage done while unfixed*, not by size:

1. Two of the four numbers on the homepage's "Swechha's own record" band —
   **6,890t "Out of the Yamuna"** and **"100+ green infrastructures across 100+
   schools"** — are not in `data/work`, not in `/impact`'s register, and not
   anywhere else on the site. The band links to "**The whole record →**".
2. The transparency shelf (above).
3. `/explore` is live, crawlable, and serves the pre-design scaffold with the
   *old* navigation and three "nothing published yet" empty states.
4. "Delhi I Can't See You" is cross-linked from the air situation page as
   Swechha's air campaign and is, in the site's own words, "a name and nothing
   else".
5. "Food systems, with UNEP" sits under a heading reading **What is running**
   while the site's own sentence about it is in the future tense.

---

## B. Page-by-page content audit

Ratings: **Strong** / **Adequate** / **Thin** / **Incomplete**.

---

### `/` — Homepage
**Current content strength:** Adequate (structurally strong, evidentially uneven)

**What is working.** The live reading band is the best first screen any Indian
environmental NGO has. The four-kinds-of-work spine is right. The "record" band's
framing — four things that accumulate whether or not anybody writes a post — is
the site's thesis in one sentence.

**What is missing.**
- The **"Do it yourself"** door has no `href` and nothing behind it. It describes
  four evergreen guides (compost, balcony air-detox garden, school waste audit,
  self-guided river walk) that do not exist.
- Two of the three "record" doors both point at `/now`.
- The **archive strip**: 20 of 27 year-cells are placeholders; 2000–2017 entirely.
- **Two of four impact figures do not exist anywhere else on the site.**

**Specific content to collect.** One datable image per year for 2000–2017, 2021
and 2024 (20 items). Sources for 6,890t and for "100+ green infrastructures". The
four DIY guides, or a decision to remove the door.

**Photos/assets required.** See sheet 06, rows for the archive strip.
**Evidence/numbers required.** The two unsourced figures, urgently.
**Priority:** CRITICAL

---

### `/about` — About Swechha
**Current content strength:** Thin on institution, Strong on people

**What is working.** Sixteen real biographies, recovered and republished — Ashim's
twenty years of Hindustani classical training, Lopamudra's unsponsored demolition-
slip work for 170 families in 2005–06, Kuriakose's Supreme Court and WTO practice,
Aruna's SOAS fellowship and M. K. Tata Prize. The etymology opening ("of one's own
free will") is the best paragraph on the site. The three pillars, five themes and
Wheel of Change are recovered from the old site and stated clearly.

**What is missing.**
- **No transparency section.** Nine reports and the 80G certificate are on the
  server, unlinked.
- **No registration numbers**, while the footer claims 80G / 12A / FCRA.
- **No financial figure of any kind.**
- **The timeline is four entries.**
- **No governance statement** — three of eight board members are also staff,
  which the page notes and does not explain.
- **No policies** — no safeguarding, no POSH, no privacy — on the site of an
  organisation that takes minors on residential journeys.
- **No awards section**; every award is inside one biography.
- Naveen Joshua has no biography.
- The five themes are stated and never attached to any work.

**Specific content to collect.** Registration numbers; three years of income and
expenditure headline figures; 15–25 timeline entries; the governance statement;
existing policy documents; a verified award list separating personal from
organisational.

**Photos/assets required.** Eight board portraits (existing sources are 338×232,
too small). Founding-era photographs, 2000–2004.

**Evidence/numbers required.** Everything financial. Everything statutory.

**Potential history to add.** The whole 2004–2016 period, which the nine annual
reports already document.

**Priority:** CRITICAL

---

### `/work` and the four kind landings
**Current content strength:** Strong as a structure, Incomplete as a record

**What is working.** Classifying by *form* — projects, campaigns, journeys, events
— rather than by theme is the right spine and reads better than the old site's
five themes. The frame lines ("A campaign pushes. An event invites.") are good.
The full list shows all 23 items.

**What is missing.** **Thirteen of the 23 items on those lists have no page.** A
reader clicking through the "full list" hits a detail page ten times and an
anchor thirteen times.

| Kind | Items | With a page |
|---|---|---|
| Projects | 7 | 5 |
| Campaigns | 8 | **1** |
| Journeys | 4 | 4 |
| Events | 4 | **0** |

**Priority:** CRITICAL (campaigns and events)

---

### `/work/campaigns` — Campaigns
**Current content strength:** Incomplete

Seven of eight campaigns are index cards averaging 137 words of underlying data,
with **zero published figures between them**. Each carries the site's own
declared holes, which are unusually candid and are the collection brief:

- **We for Yamuna** — the founding campaign, 2000. No dated action, no demand.
- **Delhi I Can't See You** — "a name and nothing else", while the air situation
  page tells readers it is Swechha's air campaign.
- **This Girl Can** — a name and a subject; indistinguishable from She Leads
  Change and ME to WE.
- **No more Waste Hills** — no year, no landfill, no demand.
- **No Plastic** — could be a ban, a substitution or a shop; three different
  campaigns.
- **Park Restoration** — Eco Action holds all the park figures; this holds none.
- **Sustainable Shopping** — no audience, no demand, and an unaddressed
  assumption that it is connected to Green the Map.

**Specific content to collect.** Per campaign: start year, the demand, one dated
action, one outcome (a refusal counts), one photograph. That is five facts each
— thirty-five facts closes the whole section.

**Priority:** CRITICAL

---

### `/work/events` — Events
**Current content strength:** Incomplete

Four events, 42–161 words of data each, **no photographs at all**, and no dates
except Yamunotsav's nine editions (2006–2014). Meanwhile `/act` asks visitors to
turn up to clean-ups and deliberately publishes no calendar *because* all four
formats carry this hole.

**Specific content to collect.** Access to the Yamunotsav Drive folder — the
site's own note calls nine Junes of a river festival "the best unshown material
Swechha has". Whether Yamuna Shramdaan still runs, which unblocks the volunteer
ask on `/act`. One line each on Cyclothon and Greenathon.

**Priority:** CRITICAL

---

### `/work/projects/*` — the five built project pages
**Current content strength:** Strong (Bridge the Gap, Eco Action, ME to WE),
Adequate (Farm School, Influence)

These are the best-written pages on the site. Their gaps are precise:

| Page | The gap |
|---|---|
| Bridge the Gap | 3M+ is a derivation whose middle term is unrecorded; no evidence of *effect* in any one school; CineGreen and Ride the Van named and described nowhere |
| Eco Action | No photograph of any of 70+ butterfly parks, 20+ herb gardens, or the 5%→90% park; the park is unnamed and the decade undated |
| ME to WE | Names no alumnus despite the claim that alumni are now staff; no photograph of the programme; no stated boundary with She Leads Change |
| Influence | ~150 fellows, none named, no project, no film; 50 colleges and 75 partners, none named; fellowship length unstated |
| Farm School | No partner or funder named at all |

**Priority:** HIGH (CRITICAL for the Eco Action before/after and the ME to WE
alumni)

---

### `/work/journeys/*` — the four journey pages
**Current content strength:** Adequate — **and the worst-illustrated section**

- **Gram Anubhav:** sixty journeys, **zero genuine photographs**. Twelve filed
  frames were found to be synthetic and withdrawn.
- **NatureScapes:** every frame is real Swechha work and **not one is of the six
  destinations**; the only destination pictures were bought stock and are refused
  by the build.
- **CityScapes:** thirteen frames withdrawn as synthetic; two of the six walks
  have no frame; surviving frames are not labelled by walk.
- **Yamuna Yatra:** the page is named after a route it cannot draw — the stops
  between Yamunotri and Agra are published nowhere checkable.

**Priority:** CRITICAL (photography)

---

### `/now` and the six situation pages
**Current content strength:** **Strong** — the site's flagship

**What is missing.** One thing only, and it is significant: each page carries a
"What we do about it" section that links Swechha's *programmes*, and **not one
documents an advocacy action** — no RTI, no consultation response, no submission,
no representation, on any of the six issues.

**Specific content to collect.** Any advocacy document per situation: date,
addressee, what was asked, what happened.

**Priority:** HIGH

---

### `/impact`
**Current content strength:** Strong in method, Thin in evidence

The register carries 33 figures. All 33 are **reach** counts — no cost-per-
participant, no retention, no completion, no survival rate, no demographic split.
**Nine carry the period "cumulative, no start year sourced"**, which makes each a
total rather than a rate; nine start years would upgrade nine figures.

And the two homepage figures noted above are absent from "the whole record".

**Priority:** CRITICAL (the homepage mismatch), HIGH (the nine start years)

---

### `/farm`
**Current content strength:** Adequate — a place, not yet an institution

Well written. Names 5 acres, 90 minutes, 5,000+ trees, 20 cows, 20,000 saplings,
100 students' sleeping capacity, fourteen running systems.

**What is missing.** The five farm training programmes that redirect *to this
page*. Any person from Mewat in the section titled "Built by Mewat". Any named
visiting school or visit account, despite 30 school groups a year. Costs, seasons,
capacity, accessibility, and — for a site offering overnight stays to minors —
safeguarding. A map or an address.

**Priority:** HIGH

---

### `/act`
**Current content strength:** Adequate — honest, and structurally blocked

The architecture is admirable: eighteen asks are read out of `data/work` so a new
ask cannot be added without a landing place. But **Give ends in an email because
no payment destination exists** (owner ruling G-1), **Volunteer cannot name a date
because all four event formats carry holes** (G-2), and the ₹500 figure is design
copy awaiting confirmation (G-3).

Two of those three unblock from elsewhere on this list: fix the events (W-08 to
W-11) and Volunteer gets a calendar.

**Priority:** CRITICAL (the giving decision is the owner's)

---

### `/publications`
**Current content strength:** Thin — 356 words, the shortest page on the site

Three real items with real PDFs, honestly framed. **Six further real, public,
Drive-hosted documents exist and are absent**: four field manuals (NatureScapes
Sirmaur, NatureScapes Sariska, Yamuna, CineGreen), the New Delhi brochure, and
the Green Finance material. Plus nine annual reports and three project reports
already in the repo.

**Priority:** HIGH

---

### `/stories`
**Current content strength:** Adequate

Five bylined essays, five film entries, eleven posters credited to Sandip Paul.

**What is missing.** Nothing published since **August 2023**. The sixth recovered
essay (2018) was not republished. Two ruled films have no source — *Disposable*
returns zero hits across all 148 indexed videos, and *Yatra* is not a film.
*Tatva* and *Sakhi* are named in a biography and appear nowhere. **140 of 148
indexed videos are unused.**

**Priority:** HIGH

---

### `/explore` — **live orphan**
**Current content strength:** Incomplete — should not be reachable

Returns 200. Serves the pre-design Tailwind scaffold: the **old** navigation
(with "Donate", "Projects", "Campaigns" as nav words that no longer exist on this
site), an old newsletter form, and three empty states reading *"Explainers and DIY
guides are being written — nothing published yet"* and *"No films published yet"*.
Not in the sitemap, **not disallowed in `robots.txt`** — so it is crawlable.

**Specific content to collect.** None. Redirect it to `/stories` or delete the
route.

**Priority:** CRITICAL (and a five-minute fix)

---

### `/search`
**Current content strength:** Adequate. Indexes the 29 built pages from each
page's own canonical. It will improve automatically as pages are added.

---

## C. Top 25 highest-priority content collection tasks

Ordered so that the first seven need no fieldwork at all.

| # | Task | Who | Sheet ref |
|---|---|---|---|
| 1 | **Decide how the nine annual/activity reports and the 80G certificate appear on `/about`.** The files are already in the repo and live. Name the five lost reports and the two gap years as gaps. | Vimlendu | T-01 |
| 2 | **Get the statutory registration numbers** — Societies Act, 12A, 80G, FCRA — and the exact registered legal name. The footer claims all four with none of them. | Neeraj | T-03 |
| 3 | **Source or withdraw the two homepage figures** — 6,890t "Out of the Yamuna" and "100+ green infrastructures across 100+ schools". They are under the words "Swechha's own record" and are in no record. | Ashim / Vimlendu | N-01 |
| 4 | **Build the real timeline from the nine annual reports.** 15–25 dated entries with one anchor each. The material is already on disk. | Vimlendu (+ a reader) | H-01 |
| 5 | **Extract three years of income/expenditure headline figures from the reports.** Transcription, not disclosure. | Neeraj | T-04 |
| 6 | **Extract the year-by-year funder list from the nine reports** and reconcile into one register. | Neeraj | P-02 |
| 7 | **Redirect or delete `/explore`.** | Engineering | X-01 |
| 8 | **Open the Yamunotsav Drive folder.** Nine Junes of a river festival, 2006–2014, currently zero photographs. | Vimlendu | W-08 / F-05 |
| 9 | **Photograph the Vasant Kunj park now, and find one frame of it before.** 5% → 90% green cover over a decade is the strongest claim on the site and has no picture. Also: name the park and date the decade. | Ashim / Naveen | D-04 / F-03 |
| 10 | **Get one partner school's roll for one year.** It converts 3M+ from a derivation into a count. | Ashim | D-01 |
| 11 | **Name two ME to WE alumni who are now staff**, with written permission, 60–100 words each and a portrait. | Ashim | D-08 |
| 12 | **Five facts for each of the seven pageless campaigns**: start year, demand, one dated action, one outcome, one photograph. | Ashim | W-01 to W-07 |
| 13 | **Confirm whether Yamuna Shramdaan still runs**, and get the archive folder. It unblocks the volunteer ask on `/act`. | Ashim | W-11 |
| 14 | **Settle "Food systems, with UNEP"** — has it started, what is UNEP's role in one word, and one dated deliverable. | Ashim | W-13 |
| 15 | **Get four real Gram Anubhav photographs.** Sixty journeys have run; the twelve on file are synthetic. | Facilitators | F-01 |
| 16 | **Get one Swechha frame per NatureScapes destination** (six). Stock is refused by the build. | Journey leads | F-02 |
| 17 | **Add the six Drive-hosted field manuals to `/publications`** and link each from the journey page it belongs to. | Ashim | K-01 |
| 18 | **Build the media archive from zero.** Start with CNN *Be the Change*, the 2004 India Today and Outlook features, the 2011 UN General Assembly address, and the NDTV/BBC/CBC broadcast dates. | Vimlendu | J-01 |
| 19 | **Nine start years** for the nine figures published as "cumulative, no start year sourced". | Ashim | N-02 |
| 20 | **Give The Remakery a page.** It is named on two pages, staffed by a named team member, and 404s at its own URL. | Nikhil / Ashim | M-01 |
| 21 | **Name five Gram Anubhav host organisations and five Influence partner organisations**, with permission. | Ashim | D-16 / D-07 |
| 22 | **Collect 20–30 named partner schools** with permission — not 250. | Ashim | P-03 |
| 23 | **Scan one item per year for 2000–2017** to fill the homepage archive strip. | Office archive | F-06 / H-03 |
| 24 | **Collect 8–12 attributed quotes** — students, teachers, fellows, village hosts, a volunteer, a funder. There is no first-person voice on the site. | Programme team | P-05 |
| 25 | **Find any advocacy document** — an RTI, a consultation response, a submission — for any of the six situations. | Vimlendu / Kuriakose | J-04 |

---

## D. Master content collection sheet

`docs/design/content-collection-2026-08-24/` — seven CSVs, 319 rows:

| File | Rows | What it is |
|---|---|---|
| `01-master-content-collection.csv` | 98 | The master sheet, 16 columns as specified. 28 CRITICAL, 43 HIGH, 27 MEDIUM. |
| `02-project-master-list.csv` | 49 | All 23 live work items (generated from `data/work/**`, so the "what we have" columns cannot drift) plus 26 legacy programmes with no presence. |
| `03-partner-master-list.csv` | 36 | Every organisation named anywhere, with a **"Should this be publicly featured?"** column. |
| `04-school-institution-master-list.csv` | 11 | The five schools actually named, plus seven collection templates for the categories the site counts but cannot name. |
| `05-impact-numbers-master-list.csv` | 47 | Every published figure with its stated basis and source, plus the unsourced and the not-yet-published. |
| `06-photo-visual-asset-list.csv` | 40 | Specific frames, not "add more photos". Orientation, minimum resolution, who holds it, consent status. |
| `07-publication-media-archive.csv` | 38 | Everything published, everything recoverable, everything missing. |

Sheets 02, 03, 05 and 07 are **generated from the repo's own data files**, so
re-running `_gen_lists.py` refreshes them against whatever the site currently
says.

---

## E. Recommended new content structures

Only where the material justifies it.

### S-01 — Transparency & accountability shelf on `/about` — **BUILD NOW**
**Content available:** 9 reports + the 80G certificate, already in the repo, plus
3 project reports in `docs/legacy/documents/`. **Volume needed:** none — it
exists. **Why current structure is insufficient:** there is no structure at all;
the files are unreachable from any page. **Phase:** immediate.

### S-02 — Partner & funder register — **PHASE 2, gated on permission**
**Content available:** 20 organisations named; the nine annual reports will yield
many more. **Volume needed:** ~25–40 entries with logo, years, relationship and
written permission. **Why insufficient today:** organisations are named only
inside item pages, so a reader cannot see who has backed this work or for how
long — the single question an institutional funder asks. **Phase:** after P-01
and P-02 collection. Do not design it before the permissions exist.

### S-03 — Media & public voice archive — **PHASE 2**
**Content available:** currently nothing. The anchors are real and checkable.
**Volume needed:** 15–25 items to be worth a section; fewer than 10 belongs on
`/about` instead. **Why insufficient:** twenty-six years and zero press evidence.
**Phase:** after J-01 collection. **If the collection yields fewer than ten
items, do not build the section** — put them on `/about` and stop.

### S-04 — Expanded "The record since 2000" timeline — **BUILD SOON**
**Content available:** nine annual reports already on disk. **Volume needed:**
15–25 entries. **Why insufficient:** four entries for twenty-six years reads as
an organisation with no middle. **Phase:** immediately after S-01, from the same
reading pass.

### S-05 — School network — **PHASE 3**
**Volume needed:** 20–30 named schools with permission. **Why insufficient:**
"250+ schools" with five names is the weakest evidence-to-claim ratio on the
site. **Phase:** later. Permission is the constraint, not design. **A named list
of twenty beats a map of two hundred and fifty.**

### S-06 — "Do it yourself" evergreen guides — **DECIDE NOW, BUILD LATER**
The homepage already advertises this section in full sentences and links
nowhere. Either build four guides or remove the door. **Leaving a described
section unlinked is the exact defect pattern the AD-24/AD-25 rulings were written
to stop.**

### Explicitly NOT recommended

- **A separate "Impact Archive"** — `/impact` already does this, better than most.
- **A separate "Campaign Archive"** — `/work/campaigns` is the right home. Those
  campaigns need content, not a new container.
- **"Photo stories"** — there is not enough photography to sustain it; F-01
  through F-12 must land first.
- **"People of Swechha"** — `/about` already carries sixteen biographies.
- **A second theme-based taxonomy** — classifying by form is better. Attach the
  five themes to existing work or drop them.

---

## F. Three rules for this collection exercise

1. **A named gap beats a tidy list.** The site already does this well — 73
   declared holes, "7/27 years scanned", "no start year sourced". Do not let a
   content push quietly close a hole by removing the admission instead of the
   gap.
2. **Port prose, never legacy counters.** Four old project pages were unfinished
   lorem-ipsum templates sharing one counter set (2740/4751/1260/9385), and that
   set contaminated two otherwise real pages. The old site's counters also
   contradict their own prose on at least four pages. Details in the master
   sheet, row N-04.
3. **Twenty named beats two hundred and fifty counted.** For schools, fellows,
   host organisations and partners alike: the collection target is a small
   verified list with permission, not completeness.
