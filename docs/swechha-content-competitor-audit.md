# Swechha — competitor, content and brand authority audit

**Date:** 2026-09-14
**Scope:** all 147 built pages under `public/_pages/v3/`, the 24 work items in
`data/work/**`, the 76-entry gap register in `data/**`, the committed copy and
branding standards, the live site at `swechha.in`, and twelve benchmark
organisations checked against their live sites on this date.
**Status:** strategy only. No page, template, navigation item or line of copy
was changed in producing this. Implementation waits for approval.

**Relationship to prior work.** This document does **not** restate
`docs/design/2026-08-24-CONTENT-COMPLETENESS-AUDIT.md`, which enumerated what
was missing from the site page by page three weeks ago. Where that audit's
findings are still open, this one says so in one line and moves on. What is new
here is the **outside view** — what twelve comparable organisations do, what
that reveals about Swechha's position, and the editorial architecture that
would let the site compound rather than sit still.

---

## 1. Executive summary

### The finding in one paragraph

Swechha's website is already better than its peers at the thing that is hardest
to fake, and worse than its peers at the things that are easiest to fix. The
six situation pages, the 30-explainer Learn library, the open CC BY 4.0 data
grant and the refusal architecture on `/impact` add up to a position — *we keep
the record* — that **no other Indian environmental organisation currently
occupies**. That position was not inherited; it was built, and it is defensible.
But the site applies a far higher evidential standard to CPCB than it applies to
Swechha. It publishes an hourly-updating record of Delhi's air and has nine
annual reports sitting unlinked on its own server. It carries 30 pages
explaining what a number means and two pages of its own analysis. It promises a
monthly digest it has no machinery to send. The gap between the rigour of the
environmental record and the rigour of the organisational record is now the
single largest credibility risk on the site — precisely because the site's whole
argument is that claims should be checkable.

### The three structural gaps

**1. The record proves measurement, not consequence.** Six situations are read,
sourced and dated. Nothing anywhere on 147 pages shows Swechha *acting* on a
measurement — no RTI, no consultation objection, no written submission, no
representation, on any of the six issues. The site currently reads as an
instrument. An instrument is trusted; it is not followed. (Flagged in the
August audit; still open.)

**2. The organisation keeps the environment's record better than its own.**
Nine annual/activity reports and the 80G certificate answer HTTP 200 at
`/docs/reports/` and `/docs/compliance/` and are linked from **no page on the
site**. The footer asserts "80G, 12A, FCRA Powered" with no numbers and no
certificate. Twenty-two of twenty-six years have no photograph. Two of the four
figures in the homepage's own record band are not in `/impact`'s register. This
was named the highest-value, zero-collection item three weeks ago and has not
moved.

**3. Nothing recurs.** `/journal` has two entries, both published 8 September
2026. `/stories` has published nothing since August 2023. The digest subscribe
form appears on eleven pages promising "once a month, what these numbers did" —
and `lib/newsletter.ts` has `subscribe`, `confirm`, `unsubscribe` and `send`,
**no digest composer, and no workflow that sends one**. There is no RSS feed.
So the only reason to return is the readings themselves, which is a reason to
bookmark, not a reason to read.

### What the benchmark work actually showed

Twelve organisations were checked. The pattern across all of them is that
authority is not built by having a position; it is built by **having a cadence
attached to a method**. Carbon Brief runs six named newsletters and a fixed set
of formats (Analysis, Q&A, Factcheck, Guest post, Media reaction). Bellingcat
turned its verification method into the product — guides, workshops, a public
toolkit, a Discord. Land Conflict Watch publishes its methodology and attributes
every case to a named researcher. The Ocean Cleanup runs a live impact dashboard
alongside a dated update feed. Our World in Data pairs 126 topic pages with
"Data Insights" every few days.

Swechha has the method. It does not yet have the cadence, and it does not yet
put a name on the work.

### The single highest-leverage move

**Publish the transparency shelf and start the monthly digest.** Together these
are perhaps two days of work, require no new content collection, and close the
two gaps most visible to a funder, a journalist and a school. Everything else in
this document is downstream of those two.

---

## 2. Current Swechha assessment

### The measured inventory

| Section | Built pages | State |
|---|---|---|
| `/now` + six situations + `/now/air/india` | 8 | **Strongest asset on the site** |
| `/now/climate-event/<slug>` | 4 | Live, event-driven, auto-detected |
| `/learn` explainers | 30 | Real topical authority; evergreen |
| `/teach` (Bridge the Gap manual) | 53 (43 sessions) | Largest single body of useful content |
| `/record` archive | 3 | Thin but structurally right |
| `/work` (5 indexes + 11 items) | 16 | **11 of 24 work items have a page** |
| `/healthy-cities` + 10 fellows | 11 | Newest and best human-voice work |
| `/stories` + 5 essays | 6 | **Dormant since Aug 2023** |
| `/journal` + 2 entries | 3 | **Two posts, one day** |
| `/about`, `/act`, `/impact`, `/farm` | 4 | Strong prose, weak institutional record |
| `/publications`, `/posters`, `/use-the-data`, `/schools`, `/search` | 5 | Small, honest, well made |
| **Total** | **147** | 146 in sitemap, all returning 200 |

### The journey the site currently supports

The brief asked whether the site answers: *Who is Swechha → What does it believe
→ What does it do → Why does it matter → What evidence exists → Why trust it →
Why engage → Why return.* Measured against the built pages:

| Step | Verdict | Evidence |
|---|---|---|
| Who is Swechha | **Strong** | `/about`'s etymology opening ("of one's own free will") is the best paragraph on the site; 16 real biographies |
| What it believes | **Adequate, in two voices** | The new copy says it beautifully; the recovered WordPress copy says it in NGO-ese (see §10) |
| What it does | **Strong where built, absent where not** | Four-kinds spine is right; 13 of 24 work items have no page, including the founding campaign |
| Why it matters | **Strong** | The situation pages are the argument; `/farm`'s "Five restored acres in a comfortable place is landscaping. Here it is an argument." |
| What evidence exists | **Split** | Environmental evidence: exemplary. Organisational evidence: two homepage figures exist nowhere else on the site |
| Why trust Swechha | **Weak at the institutional layer** | No linked reports, no registration numbers, no financial figure, no policies, no governance explanation |
| Why engage | **Strong** | `/act`'s "Three ways in" is the best-written donation page in this benchmark set |
| Why return | **Weak** | Two journal posts; no digest ever sent; no feed |

### What is genuinely world-class here

Three things, stated plainly because the rest of this document is critical and
none of the criticism should be read as asking for less of them.

**The refusal architecture.** `/now` declines to total six readings, and says
why: "No two of the 6 share a kind of limit, and 6 units do not average. One
figure for the environment decides something on your behalf without saying
what." `/impact` publishes a modelled 3M+ and a counted 50,000+ side by side and
explains that "Reach is what an organisation can claim; effect is what it can be
held to." Nothing in the benchmark set does this. GiveDirectly comes closest,
and it is a research organisation with a 24-study library. This is an
institutional asset and it should be protected as one.

**The limit discipline.** Every reading is judged against a published limit,
with the limit's legal basis named, and where no limit exists the site says so
rather than inventing one. The four state words (LIVE / PERIODIC / OUT OF SEASON
/ DEMO DATA) are a small, hard-won piece of information design.

**`/use-the-data`.** A CC BY 4.0 grant, three citation shapes, an explicit
statement of what the grant *cannot* cover (upstream terms, photographs), and
"Quote the observation time, not the time you read it." Mongabay and Dialogue
Earth both operate republication programmes; neither explains to a re-user how
to cite a *reading* as opposed to an article. This page is ahead of the field.

### The defects worth naming

**`/explore` is a second organisation.** It returns 200, carries the *old*
navigation, three "nothing published yet" empty states, a different boilerplate
sentence ("Swechha works at the intersection of environment, education and
community action for a just and sustainable world"), and a footer reading
**"© 2026 Swechha. All rights reserved."** — which directly contradicts
`/use-the-data`'s CC BY 4.0 grant. It is `noindex`, so this is not a search
problem; it is a *contradiction* problem. Anyone arriving from an old link sees
a different organisation with a different licence.

**The digest is a promise with nothing behind it.** The subscribe form is on
eleven pages. `app/api/newsletter/subscribe/route.ts` carries an admirable
comment: *"A subscribe box that accepts an address it cannot store and cannot
email is the single most dishonest thing this site could ship."* The route
honours that. But there is no composer and no sender — `.github/workflows/`
contains `ward-alerts.yml` and no digest job. The form is honest about storage
and silent about cadence.

**Two voices, and the weaker one sits where trust is decided.** See §10.

**Two blockquotes across 147 pages.** The Healthy Cities fellow pages added
participant voices ("What people said") since August, which is real progress —
but they are anonymised ("A workshop participant"), and outside that microsite
nobody Swechha has worked with speaks in their own words.

---

## 3. Competitor and peer landscape

Twelve organisations, checked against their live sites on 2026-09-14. Selected
for what each *teaches*, not for similarity of mission.

### Direct and adjacent Indian peers

**Centre for Science and Environment** (cseindia.org). The Indian benchmark for
authority-through-publishing. Fifteen topic sections, each a standing beat (Air,
Water & Wastewater, Habitat, Waste, Industry, REnergy, Climate Change,
Sustainable Food Systems, Biodiversity). Owns *Down To Earth* in English and
Hindi plus *Gobar Times* for young readers, runs its own accredited environment
lab, a training institute, media fellowships and podcasts, and publishes a
flagship annual — *State of India's Environment*. **The lesson:** CSE's
authority comes from owning both the instrument (the lab) and the channel (the
magazine). Swechha owns an instrument and has no channel.

**Chintan Environmental Research and Action Group** (chintan-india.org). The
closest direct peer — Delhi, waste, air, livelihoods, youth. Nav is
Who We Are / Our Concerns / 101 / Resources / Stories / ON AIR. Runs a monthly
bilingual webzine (*ON AIR*) and a podcast (*The Chintan Chats*), leads with
"9 Policies Impacted. 8 Awards Won," and links Financials in the footer.
**The lesson:** Chintan publishes *consequence* — policies moved — as its
headline metric. Swechha publishes measurement and never publishes consequence.
Also: Chintan has a monthly publication and Swechha does not.

**ATREE** (atree.org). Research institution model: Who we are / What we do /
Insights, with Insights containing Impacts, Publications, Press Coverage,
Bulletin, Annual Reports, Events, Resources. Leads with "100+ species
discoveries, 44+ scientific papers." **The lesson:** the *Insights* grouping —
putting Publications, Press Coverage and Annual Reports in one shelf — is
exactly the structure Swechha is missing.

**Mongabay India** (india.mongabay.com). Nav by format (Features, Videos,
Podcasts, Specials, Articles, Shorts) plus **named recurring series**: *Species
File*, *Beyond the Hype*, *Decoding Heat*, *Climate Innovations*, *Environomy*.
CC-licensed, open access, RSS and newsletter. **The lesson:** a named series is
a promise a reader can subscribe to; a category is not. *Beyond the Hype* —
evidence-based assessment of promoted solutions — is a format Swechha could run
better than Mongabay, because Swechha holds the measurements.

**Dialogue Earth** (dialogue.earth). Topics × Regions × Formats, with Formats as
a first-class axis: Opinion, Explainers, Photo stories, Podcasts, Reports, News
Digests. Five regional newsletters including a South Asia edition; a formal
republication programme. **The lesson:** format as a navigable axis lets one
subject carry several treatments without repetition.

**People's Archive of Rural India** (ruralindiaonline.org). Publishes in 15
languages, treats all equally, runs a free PARI Library of reports and
out-of-print books, and a Student Articles stream. Positions itself as "a
national knowledge repository." **The lesson:** PARI's authority is that it
*is* the archive — the same claim Swechha is making with "we keep the record,"
executed at scale and in many languages. Also the strongest argument in this set
for Hindi.

**Land Conflict Watch** (landconflictwatch.org). Nav: All Conflicts / RE
Conflicts / Publications / About / a named flagship (*Holding Ground 2022*).
Leads with four counted figures (1,100 conflicts, 14.2m people affected, ₹3.45
trillion of investment, 42 researchers), publishes its methodology, and
attributes every case to a named researcher. **The lesson:** this is the closest
structural analogue to Swechha's situation architecture — a public,
methodologically-documented database of specific cases — and it does two things
Swechha does not: it names the researcher, and it publishes a flagship annual
built from the database.

**Goonj** (goonj.org). Included as the Indian brand/storytelling benchmark. Owns
a single distinctive idea (dignity, not charity), names its initiatives rather
than describing them (*Cloth for Work*, *Not Just A Piece of Cloth*, *School to
School*, *Rahat*), runs *100 Stories of Change* and *Dignity Diaries*, and
publishes annual reports, state reports and financials. **The lesson:** every
Goonj programme has a *name* that carries the argument. Swechha half-does this
(*We for Yamuna*, *Delhi I Can't See You*, *ME to WE* are excellent; *Food
systems, with UNEP* and *Influence* are not).

### Global benchmarks

**Carbon Brief** (carbonbrief.org). The single most instructive site in this
set. Navigable by Topic, Region *and* Format. A fixed, named format vocabulary —
**Analysis, Q&A, Explainer, Factcheck, Guest post, Media reaction** — and six
named newsletters: *Daily Briefing*, *DeBriefed*, *China Briefing*, *Cropped*,
*Cited*, *Selected*. **The lesson:** a small team looks like an institution
because its output is *typed*. A reader knows what a Carbon Brief Factcheck is
before opening it. This is the model Swechha should study hardest.

**Our World in Data** (ourworldindata.org). 126 topic pages, 14,095 charts, 29
data explorers, a searchable data catalog, everything openly licensed and
embeddable, every chart source-cited, named researchers on the work, and
"Data Insights" published every few days alongside a biweekly brief.
**The lesson:** the pairing of a slow evergreen layer (topic pages) with a fast
layer (Data Insights) off the *same* dataset. Swechha has the evergreen layer
(`/learn`) and the dataset (`/record`) and nothing fast between them.

**Bellingcat** (bellingcat.com). Method as the product: Investigations /
Resources / Workshops / Donate, plus published guides, a public toolkit, paid
workshops, a Discord for volunteer researchers, and *Open Source in Short* —
bite-sized pieces teaching technique. **The lesson:** Bellingcat monetises and
propagates its *method*, not just its findings. Swechha's method — one
measurement, one published limit, the gap named — is teachable, distinctive, and
currently taught nowhere.

**The Ocean Cleanup** (theoceancleanup.com). Knowledge section (Research,
Scientific Publications, Ocean Plastic Facts, Top 1000 Polluting Rivers) sitting
beside a live **Impact Dashboard** and a dated Updates feed, with a monthly
newsletter. 100 scientific publications treated as a milestone.
**The lesson:** a live counter is credible only when a dated update feed runs
beside it. Swechha has the counter and not the feed.

**charity: water** (charitywater.org). The trust benchmark. The 100% model, GPS
coordinates and photographs for every funded project ("Give water. Get proof.
Every single time"), and four third-party seals displayed (Candid Platinum,
Charity Navigator, CharityWatch, BBB). **The lesson:** proof is designed as a
*product feature*, not filed as a document. Swechha has better raw proof than
charity: water and files it as PDFs nobody links to.

**GiveDirectly** (givedirectly.org). Radical transparency taken furthest: a
dedicated Evidence section, an own-research library, ">87% of funds delivered,"
a live 2,172,393-people-reached counter filterable by country, named individual
recipients with outcomes — and, unusually, **annual reports on fraud, harm and
safety incidents**. **The lesson:** publishing what went wrong is the strongest
available trust signal, and it is the one Swechha's own culture is best equipped
to adopt. The site already publishes a register of its own gaps; publishing what
did not work is the same instinct applied to the programmes.

---

## 4. Competitive content matrix

Qualitative judgement, scored **1–5**, each score traceable to an observation in
§2 or §3. Not precision — ranking.

| Dimension | Swechha | Carbon Brief | CSE | Chintan | Land Conflict Watch | GiveDirectly | Best practice in this set |
|---|:--:|:--:|:--:|:--:|:--:|:--:|---|
| Brand clarity | **4** | 5 | 4 | 4 | 5 | 5 | One sentence that is also a method — "we keep the record" is nearly there |
| Authority | **3** | 5 | 5 | 4 | 4 | 5 | Own the instrument *and* the channel (CSE: lab + magazine) |
| Trust | **2** | 4 | 4 | 4 | 4 | 5 | Proof as product feature, plus what went wrong (GiveDirectly) |
| Thought leadership | **1** | 5 | 5 | 3 | 3 | 4 | A stated position, repeatedly, in a named format |
| Storytelling | **3** | 2 | 3 | 4 | 4 | 5 | Named people in their own words (PARI, Goonj, GiveDirectly) |
| Evidence | **5** | 5 | 5 | 3 | 5 | 5 | Source, cadence, limit, observation time — Swechha is at the top here |
| Impact communication | **4** | n/a | 3 | 4 | 3 | 5 | Counted vs modelled, labelled — Swechha's `/impact` is best-in-set on honesty |
| Content depth | **4** | 5 | 5 | 3 | 3 | 4 | Evergreen library + fast layer off one dataset (OWID) |
| Return visits | **1** | 5 | 4 | 4 | 3 | 3 | Named newsletters on a kept cadence (Carbon Brief) |
| Community | **2** | 2 | 3 | 3 | 4 | 2 | Contributors with names and a place to gather (Bellingcat) |
| Visual identity | **5** | 3 | 2 | 3 | 3 | 4 | Swechha's B&W duotone system is the most distinctive in this set |
| Editorial quality | **4** | 5 | 4 | 3 | 4 | 4 | Consistent voice across every page, including inherited copy |
| Discoverability | **2** | 5 | 5 | 3 | 3 | 4 | Topical authority + backlinks; Swechha has the first, not the second |
| Calls to action | **4** | 3 | 3 | 3 | 3 | 5 | Specific, costed, honest — `/act` is genuinely strong |
| Distinctiveness | **5** | 4 | 3 | 3 | 4 | 4 | Nobody else in India runs a limit-referenced public record |

**Reading the matrix.** Swechha scores 5 on Evidence, Visual identity and
Distinctiveness — three of the hardest things to build — and 1 on Thought
leadership and Return visits, two of the easiest. The shape of the gap is
unusual and it is good news: the expensive work is done.

The two 1s are the same problem seen twice. Thought leadership means having said
something; return visits mean having said it on a schedule. Both are solved by
publishing regularly in a named format — which is what §6 and §7 propose.

---

## 5. Best practices worth adopting

Drawn from the benchmarks, filtered to what fits Swechha. Techniques, not copies.

1. **Type the output.** (Carbon Brief) A fixed, small vocabulary of formats, each
   with a stated contract, makes a small team read as an institution and makes
   an agentic system safe to build.
2. **Name the series, not the category.** (Mongabay, Carbon Brief) *Beyond the
   Hype* is subscribable; "Articles" is not.
3. **Pair a slow evergreen layer with a fast layer off the same data.** (OWID)
   `/learn` is the slow layer; the fast layer does not exist.
4. **Publish the method as a product.** (Bellingcat) Swechha's limit discipline
   is teachable and unclaimed.
5. **Attribute to a named person.** (Land Conflict Watch, OWID, PARI) Every
   reading, explainer and analysis should carry a byline or a "kept by."
6. **Put proof in the interface, not in a filing cabinet.** (charity: water)
7. **Publish what went wrong.** (GiveDirectly) The strongest trust signal
   available, and the one most consonant with this site's existing culture.
8. **Group the institutional record into one shelf.** (ATREE's *Insights*)
   Publications + Press + Annual Reports + Financials in one place.
9. **Let format be a navigable axis.** (Dialogue Earth) One subject, several
   treatments, no repetition.
10. **Give every programme a name that carries the argument.** (Goonj)
11. **Run a live counter only with a dated feed beside it.** (Ocean Cleanup)
12. **Treat language as equity, not as a translation chore.** (PARI) Hindi is
    not a nice-to-have for an organisation whose subject is Delhi's air.

---

## 6. Swechha's gaps — KEEP / IMPROVE / REMOVE / CREATE / EXPERIMENT

### KEEP — working, protect it

- The six situation pages and `/now`'s refusal to total them.
- `/impact`'s counted-vs-modelled labelling and its refusal of a grand total.
- `/use-the-data` — licence, three citation shapes, and the limits of the grant.
- The 30-explainer `/learn` library and its "start here" four.
- `/teach` — 53 pages of the Bridge the Gap manual, openly published, no form.
- The B&W duotone photographic treatment and the Archivo + Newsreader system.
- `/act`'s "Three ways in" and the costed ₹500 breakdown.
- `/farm`'s "Five restored acres in a comfortable place is landscaping."
- The 76-entry `holes` register in `data/**` — it is the content backlog.
- The owner's copy standard (`2026-08-23-COPY-STANDARD.md`). It is correct and
  this audit is written to it.

### IMPROVE — right idea, under-built

- **`/journal`** — the format is right (five kinds, kept apart; every figure
  dated). It has two entries. It needs a cadence, not a redesign.
- **`/stories`** — the films, podcasts and "In the news" shelf are good; the
  written essays stopped in 2023 and are unlabelled as archive.
- **`/about`** — 16 excellent biographies wrapped around an institutional record
  that is four timeline entries, no reports, no numbers, no policies.
- **`/work`** — 11 of 24 items have a page. The founding campaign, *We for
  Yamuna*, running since 2000, is a card.
- **Programme naming** — *Influence* and *Food systems, with UNEP* do not carry
  their own argument the way *ME to WE* and *Delhi I Can't See You* do.
- **Digest distribution** — the form is on eleven pages and absent from the
  homepage, `/learn`, `/teach`, `/journal` and `/impact`, which are where the
  readers who would want it actually are.
- **Named attribution** — the situation pages and explainers carry no byline.

### REMOVE — weak, redundant or actively damaging

- **`/explore`.** Old navigation, empty states, a contradictory copyright line.
  Redirect it to `/learn` or `/stories` and delete the page. This is the only
  unambiguous *remove* in the audit.
- **The dead `signal` field** on `heroImageSchema` — selective colour is retired
  and `CLAUDE.md` already records that nothing should be built on it.
- **The homepage "Do it yourself" door** — it has no `href` and nothing behind
  it. Either build the four guides (§7 Level 3) or remove the door. A door that
  opens onto nothing is worse than no door on a site arguing for checkability.
- **The unsourced homepage figures** — 6,890t "Out of the Yamuna" and "100+
  green infrastructures" appear in no register and the band links to "The whole
  record →". Source them or take them off the homepage.

### CREATE — missing, and the gap is doing damage

- **The transparency shelf.** Nine reports + 80G certificate + registration
  numbers + one financial figure, on `/about` or a `/record`-style institutional
  page. Zero collection required.
- **The monthly digest, actually sent.** A composer and a scheduled job.
- **A feed.** RSS/Atom for the journal and the record. Every benchmark has one.
- **A Method page.** How Swechha decides what counts as a reading, what a limit
  is, why six numbers are not totalled. Currently distributed across `/now` and
  `/use-the-data` and owned by neither.
- **A consequence trail.** What Swechha *did* with a measurement — objections
  filed, RTIs, consultation responses, submissions — dated and linked.
- **Named voices.** Students, teachers, fellows, villagers, volunteers,
  partners. The Healthy Cities pattern, extended and de-anonymised with consent.
- **Hindi.** At minimum the four "start here" explainers and the air situation.

### EXPERIMENT — test, do not assume

- **A named recurring series.** One. See §7 Level 4.
- **The method taught as a workshop** (Bellingcat's model) — does anyone want it?
- **A school-facing data pack** — `/record` CSVs plus a `/teach` session.
- **An annual flagship** built from the record, not from the programmes.

---

## 7. White space — what Swechha could own

### The territory, stated precisely

> **Swechha is the organisation that keeps India's environmental record and is
> also standing in the river.**

That conjunction is the white space. Test it against the field:

- **CSE** has the instrument and the channel, and does not do the fieldwork with
  schoolchildren.
- **Mongabay India** and **Dialogue Earth** report on the environment; they do
  not hold a measurement and they run no programmes.
- **Land Conflict Watch** holds a database and is not an operating NGO.
- **Our World in Data** aggregates globally and has no ground.
- **Chintan** works the ground and publishes advocacy, not measurement.
- **PARI** is the archive, and it is not environmental measurement.

Nobody else combines: a continuously-updated, limit-referenced, openly-licensed
public record **plus** twenty-six years of walking the river, teaching in
schools, and building a farm on barren ground. The measurement earns the right
to speak; the fieldwork stops the measurement being abstract. Each half is
common; the combination is not.

### Four content territories that follow from it

**1. The gap between a number and a body.**
Swechha's own homepage already writes this: *"A number is not a smell. So we
take them to the water."* This is the strongest line on the site and it names
the territory. The content: what 143 AQI is on a body, what 0.3 mg/L is to a
fish, what a heatwave is to someone working outside. Nobody in the benchmark set
owns the translation from instrument to experience, because almost nobody has
both. **Uniquely Swechha. Highest priority.**

**2. How to read an environmental number.**
`/learn` already contains *Measured or modelled?*, *Why do two air apps show
different numbers?*, *What is a reporting floor?*. This is a coherent,
unclaimed, high-search-value body of work about *epistemics*, not about
pollution. Carbon Brief does this for climate science globally; nobody does it
for Indian environmental data. **Extend, do not re-found.**

**3. The classroom as the unit of change.**
53 published `/teach` pages, given away with no form, is already India's most
usable open environmental curriculum. Twenty-six years of Bridge the Gap is the
evidence base. **Own "environmental education that actually runs in an Indian
classroom."**

**4. Restoration as argument, not as landscaping.**
The farm is a twenty-six-year proof that barren ground can be made to grow — in
Mewat, among the poorest districts in India, built by local labour. `/farm`
already argues this. The content: what it cost, what failed, what year three
looked like. **This is where "publish what went wrong" naturally lives.**

### What Swechha should *not* try to own

- **General climate news.** Mongabay, Dialogue Earth and Down To Earth have
  newsrooms. Swechha does not, and should not pretend to.
- **Global data.** OWID exists. Link to it.
- **Policy analysis as a standing beat.** CSE has the lab and the lawyers.
  Swechha can publish a *consequence trail* — what it filed, what happened —
  which is narrower, truer and unoccupied.
- **Generic "youth empowerment" content.** It is the most crowded phrase in the
  Indian NGO sector and Swechha's actual work is far more specific than it.

---

## 8. Recommended content architecture

Not a redesign. Four standing sections already exist and are right. The proposal
is to **name what is already there**, add two things, and let format become a
visible axis.

### The architecture

```
THE RECORD          the readings, and everything that keeps them honest
  /now              six situations, live                 [exists, strong]
  /record           the archive, dated                   [exists, thin]
  /learn            what the numbers mean                [exists, strong]
  /use-the-data     licence, files, citation             [exists, strong]
  /method           how we decide what counts            [CREATE]

THE JOURNAL         what we make of the record
  /journal          five kinds, dated, bylined           [exists, dormant]
    - Reading       a finding derived from the record    [the fast layer]
    - Field note    something seen, short                [CREATE]
    - Perspective   Swechha's position, argued           [CREATE]
    - Consequence   what we filed and what happened      [CREATE]
    - From the record  drawn out of the archive          [exists as a kind]

THE WORK            what we do, and what it produced
  /work             projects, campaigns, journeys, events [exists, 11/24 built]
  /farm             the place                             [exists, strong]
  /impact           the register                          [exists, strong]
  /teach            the curriculum, given away            [exists, strong]

THE ORGANISATION    who is behind it and how to check
  /about            people, history, mission              [exists, strong on people]
  /ledger           reports, financials, registration,
                    press, policies, what went wrong      [CREATE]
  /act              three ways in                         [exists, strong]

VOICES              cross-cutting, not a section
  people quoted by name, wherever they belong
```

### Per category

| | Why it exists | Who it serves | What belongs | Cadence | Uniquely Swechha because | Type | Contributes |
|---|---|---|---|---|---|---|---|
| **The Record** | The organisation's claim to authority rests on it | Journalists, teachers, researchers, residents | Readings, limits, sources, archives, explainers, the method | Continuous (automated) + explainers as needed | Nobody else in India runs one against published limits | Evergreen | Authority, discoverability, trust |
| **Reading** (Journal) | Turns a dataset into a finding | Journalists, informed public | One derivation, shown, off data already held | **Monthly, one** | The data is ours and the derivation is public | Topical | Thought leadership, return visits |
| **Field note** | Proof the organisation is outdoors | Everyone; especially funders | 200–400 words, one photograph, one date | **Fortnightly** | Nobody else is standing in the river *and* holding the number | Topical | Emotional connection, return visits |
| **Perspective** | The site currently has no position | Policy, press, partners | An argument Swechha will be held to | **Quarterly** | Earned by the record, not asserted | Topical | Thought leadership |
| **Consequence** | Proves measurement leads somewhere | Funders, press, regulators | What was filed, when, what happened, including nothing | **As it happens** | The only organisation that can link a filing to its own reading | Recurring | Trust, authority |
| **The Work** | What the organisation actually does | Schools, funders, volunteers | Programme pages with figures and named people | Rolling — close 13 open items | Twenty-six years, and the figures resolve from one register | Evergreen | Trust, impact, CTAs |
| **Teach** | The curriculum is the widest door | Teachers, parents, students | Sessions, background, no form | Rolling | Given away; 26 years of running it | Evergreen | Discoverability, usefulness |
| **The Ledger** | Trust decided here, currently absent | Funders, press, regulators, partners | Reports, financials, registration, press, policies, failures | Annual + as filed | Same honesty standard the readings get | Evergreen | Trust |
| **Voices** | Only the ED speaks on 147 pages | Everyone | Named people, own words, consented | Rolling | Twenty-six years of participants | Evergreen | Emotional connection, trust |

### What this deliberately does *not* add

No "News". No "Blog". No "Insights". No "Resources". Each would be a container
with no contract, and containers with no contract are how NGO sites become
undifferentiated. Every proposed category above has a stated contract — what
belongs, what does not, and how often.

---

## 9. The Swechha content ladder

Designed so **the evidence layer feeds the editorial layer automatically**, and
so the cheapest rung is genuinely cheap. Six rungs, each defined by what it
costs and what it must contain.

**Level 0 — The reading** *(automated, continuous, no human)*
One measurement, one limit, one observation time. Already running: hourly air,
daily FIRMS, monthly Yamuna, the climate-event detector.
*Contains:* value, unit, limit, source, cadence, observation stamp.
*Never contains:* interpretation.
This rung exists and works. Everything above it is built from it.

**Level 1 — Field note** *(1 photo + 150–400 words, ~30 min)*
Something seen on a journey, at the farm, in a school, at the river. Dated,
located, signed. Not an achievement post.
*Must contain:* a date, a place, a person or a thing observed.
*Must not contain:* a call to action, a statistic that is not on the page for a
reason, the word "impact".
*Source material:* every journey, workshop, planting day and farm week already
happening. Roughly 40 field days a year produce this rung for free.

**Level 2 — Reading** *(one derivation, ~half a day)*
A finding pulled out of data the site already holds, with the derivation shown.
The two existing journal entries are exactly this and are the template:
*"one Delhi monitor read 35 and another read 211… both describing the same city
at the same hour."*
*Must contain:* the query, the numbers, the limit, the caveat that kills the
naive reading.
*Must not contain:* a policy recommendation.
*This is the fast layer OWID calls Data Insights, and it is nearly free because
the dataset is already in the repo.*

**Level 3 — Explainer** *(1–2 days, evergreen)*
A `/learn` page. Thirty exist. The remaining obvious ones: the four homepage DIY
guides (compost, balcony air-detox garden, school waste audit, self-guided river
walk), which are currently a door with nothing behind it.
*Must contain:* the definition, who set it, how it is measured, what it cannot
tell you.

**Level 4 — Perspective** *(1 week, quarterly)*
Swechha's position on something contested, argued from the record and signed by
a person. The site currently has none. First candidates, all supported by
evidence already on the site:
- *Delhi is not one city* — the airshed argument, already half-written.
- *A number is not a smell* — why measurement without exposure fails.
- *What a limit is for* — on the difference between over the limit and unsafe.
*Must contain:* a claim Swechha can be held to, and the evidence for it.

**Level 5 — Consequence** *(as it happens)*
What Swechha filed, submitted or objected to, what came back, and what did not.
Short, dated, linked to the reading that prompted it. The rung that converts the
site from instrument to actor.

**Level 6 — Flagship** *(annual)*
One publication a year built **from the record**, not from the programmes — a
year of Delhi's air, the Yamuna's oxygen, the fire season, with what changed and
what Swechha did. Land Conflict Watch's *Holding Ground* and CSE's *State of
India's Environment* are the models. The archive to build it already accumulates
automatically.

### How the rungs feed each other

```
Level 0 (automatic)  →  anomaly in the data
         ↓
Level 2 Reading      →  the finding, derived and shown
         ↓
Level 3 Explainer    →  the concept the finding needed        [evergreen, search]
         ↓
Level 4 Perspective  →  the argument three findings support   [quarterly]
         ↓
Level 5 Consequence  →  what we filed because of it
         ↓
Level 6 Flagship     →  the year, assembled                   [annual]

Level 1 Field notes run alongside all of it and are what stops the
ladder reading as a data company rather than an organisation.
```

The important property: **a year of disciplined Level 1 and Level 2 output
produces Level 6 as a by-product.** Nothing at the top has to be started from
nothing.

---

## 10. Editorial voice guide

### The starting point: the site already has a voice, and a second one it inherited

This is the most important editorial finding in the audit. Swechha's site
contains **two distinguishable registers**, and the weaker one is concentrated
exactly where trust is decided.

**The written voice** — homepage, `/act`, `/farm`, `/journal`, `/learn`,
`/now`, `/use-the-data`. Short declaratives. Concrete nouns. Arguments that
arrive by the second sentence. Confident enough to refuse: *"There is no total,
and there never will be."*

**The inherited voice** — `/about`'s "What we say we are", the five themes, the
Wheel of Change, most of the team biographies, `/explore`'s footer. Recovered
from the old WordPress site during migration and never re-edited. Capitalised
abstract nouns, passive constructions, sentences that describe commitment rather
than work.

These sit within one scroll of each other on `/about`. A reader who arrives at
the homepage meets an organisation with a distinctive mind; a funder who scrolls
`/about` meets a familiar NGO. **The inherited layer should be brought up to the
written layer — under the owner's own rule, subtract before you rewrite.**

### Swechha sounds like

- **Declarative.** The claim first; the qualification after, if at all.
- **Concrete.** A number, a place, a date, a thing. "Twenty-two kilometres."
  "Ninety minutes from Delhi." "One tree."
- **Willing to refuse.** The site's most distinctive move is saying what it will
  not do, and why. Keep it.
- **Dry rather than warm.** The emotion comes from the fact, not from the
  adjective placed in front of it.
- **Occasionally funny, never jokey.** "Tea bags are on it, which surprises most
  people." "which costs more than the planting day and photographs worse."
- **Unhurried where it matters.** The copy standard is explicit: not shorter at
  all costs. A paragraph doing real work may run.

### Swechha does not sound like

Corporate. Bureaucratic. Self-congratulatory. Inspirational-for-its-own-sake.
Academic. Repetitive. SEO-shaped. And — the specific risk of an agentic system —
**structurally identical from page to page**.

### The rules

**Sentences.** Vary the length deliberately. The site's best paragraphs run
short-short-long or long-short. Never three same-length sentences in a row —
that is the clearest tell of generated prose.

**Vocabulary.**

| Prefer | Avoid |
|---|---|
| what it is | *impactful, transformative, innovative, holistic* |
| the number, then the unit | *significant, substantial, considerable* |
| walked, planted, filed, measured, carried | *engaged, empowered, leveraged, facilitated, curated* |
| people, students, teachers, residents, farmers | *beneficiaries, stakeholders, target groups* |
| what we did | *our journey, our commitment, our ethos* |
| the Yamuna, Delhi, Mewat, Ladpuri | *the region, the community, the ecosystem* |

**Headlines.** Two registers only, both already in use: the flat statement
(*"Nothing grew here."*, *"We keep the record"*) and the turn (*"A number is not
a smell"*, *"Dated, and it stays dated."*). Never a question headline. Never a
colon-subtitle construction. Never a number-listicle.

**Openings.** Start at the fact. The site's best openings do this already:
*"On the evening of 8 September, one Delhi monitor read 35 and another read
211."* Banned openings: "In today's world…", "As climate change accelerates…",
"Have you ever wondered…", any sentence whose first clause could open a piece
about anything.

**Statistics.** Name the source when the number is environmental. Do not name it
when the number is Swechha's own and the page is not a data page — that is the
owner's ruling and it holds. Always distinguish counted from modelled.

**Quotes.** Use them for what only that person can say. Never to restate the
paragraph above. Name the speaker and their relation to the work; where consent
limits that, say *"a teacher at a Delhi government school"*, not
*"a beneficiary"*.

**First person.** "We" for the organisation, sparingly. "I" only in a signed
Perspective or Field note. The record itself never uses either.

**Emotion.** Earned by specificity. *"The river enters Delhi alive and leaves it
without oxygen"* is the model — no adjective, and it lands harder than any.

**Calls to action.** Specific, costed, honest about what it buys. `/act` is the
standard: *"A garden is cheap to plant and expensive to keep. The second year is
the one nobody funds and the only one that proves anything."* Never "Join us in
making a difference."

### Before → after

Real copy from the live site. Each keeps the fact and drops the padding; each
applies *subtract before you rewrite*.

**1. `/explore` footer — pure boilerplate**
> **Before:** Swechha works at the intersection of environment, education and
> community action for a just and sustainable world.

> **After:** Swechha has worked on the Yamuna, in Delhi's schools and on five
> acres in Mewat since 2000.

*Why: "intersection of", "just and sustainable world" and "community action"
could describe four hundred organisations. Three places and a year could not.*

**2. `/about` — the inherited mission line**
> **Before:** An organisation dedicated to enabling ourselves and others around
> us to Be the Change, in making a visible difference to the Environment both
> Physical and Social.

> **After:** Be the Change — in the environment, physical and social.

*Why: the phrase is Swechha's and worth keeping. The scaffolding around it —
"dedicated to enabling", "making a visible difference" — is the 2009 web.
Capitalised abstract nouns are the tell.*

**3. `/about` — the five themes**
> **Before:** Sustainable Lifestyles & Education · Sustainable Agriculture &
> Integrated Development · Sustainable Cities & Ecology · Resilient & Equitable
> Communities · Green Economy & Enterprise

> **After:** Schools and how people live · Farming and the land around it ·
> Cities and what grows in them · Communities that can take a shock ·
> Work made from what was thrown away

*Why: the first list is a funder taxonomy; "Sustainable" appears three times and
does no work. The second says the same five things in words a parent reads once.
The taxonomy can stay as a subtitle for the funders who need it.*

**4. Team biography — generic praise**
> **Before:** His commitment to fostering positive change in communities has
> earned him recognition and respect among peers and beneficiaries alike.

> **After:** *(delete)*

*Why: the surrounding sentences already say he has run school programmes for
over a decade and trained for twenty years in Hindustani classical music. This
sentence asserts what those facts demonstrate. Subtract.*

**5. Team biography — abstraction over detail**
> **Before:** With a knack for turning ideas into actionable projects, she
> enjoys curating campaigns that create real-world impact.

> **After:** She has run campaigns from idea to street. *(then name one)*

*Why: "actionable", "curating", "real-world impact" are three hedges in one
sentence. One named campaign beats all of them — and the gap register already
knows which campaigns need naming.*

**6. Homepage — a door with nothing behind it**
> **Before:** Do it yourself *(no href, no destination)*

> **After:** *(remove until the guides exist; then)* Four things you can do
> without us — compost, a balcony garden that scrubs air, a school waste audit,
> a river walk you lead yourself.

*Why: on a site whose entire argument is checkability, an empty door is the most
expensive defect available.*

**7. `/journal` — already right, shown as the standard**
> On the evening of 8 September, one Delhi monitor read 35 and another read 211.
> Both were CPCB stations, both were reporting normally, and both were
> describing the same city at the same hour.

*No change. Fact, tension, no adjective, no throat-clearing. Every Reading
should open like this, and this sentence is the exemplar an agentic system
should be measured against.*

**8. A hypothetical generated Field note — the AI failure mode to catch**
> **Before:** Today marked another meaningful step in our ongoing journey to
> create lasting environmental change. Our dedicated team engaged with students
> to foster awareness about the importance of sustainable practices.

> **After:** Forty-one students from a government school in Khirki stood on the
> Yamuna bank at Kalindi Kunj for two hours on Tuesday. The foam was high enough
> to photograph. Nobody had seen the river before.

*Why: the first has no date, no place, no number, no person, and could have been
written without leaving the office. The second has four checkable facts and one
observation. This is the test every generated draft must pass.*

---

## 11. Page archetypes

Nine. Each has a contract. An agentic system may draft any of them; the contract
is what stops nine archetypes collapsing into one template.

**A note on visual distinctiveness.** The single biggest risk in systematising
pages is that all nine end up with the same band order. The served lane's
existing generators already avoid this — `/farm`, `/act`, `/posters` and a
situation page have visibly different rhythms. Every archetype below therefore
specifies **one structural element unique to it**.

---

### 1. Situation *(exists — do not change)*
**Purpose:** one measurement against one published limit.
**Structure:** governed by `docs/ACTIVE-SITUATION-STANDARD.md`. Generator-enforced.
**Distinctive element:** the four state words and the limit's legal basis.
**Do not redesign. This is the site's crown.**

### 2. Explainer *(`/learn` — exists, extend)*
**Purpose:** what a number means, who set the limit, what it cannot tell you.
**Structure:** definition → who set it → how it is measured → what it cannot
tell you → the live reading for the same subject.
**Evidence:** the standard, cited to the instrument that sets it.
**Images:** one, optional.
**CTA:** the live reading. Never a donation.
**Related:** the situation, plus two adjacent explainers.
**Metadata:** subject, concept, limit-setter, last reviewed.
**Distinctive element:** the "what it cannot tell you" section — it is what
makes these pages trustworthy, and it must never be dropped for brevity.

### 3. Reading *(`/journal` — the fast layer)*
**Purpose:** a finding derived from data the site already holds.
**Structure:** the observation, stated flat → the numbers, in a table → the
derivation, shown → the caveat that kills the naive reading → the data file.
**Evidence:** must resolve entirely to data in `data/**` or a cited source. A
Reading that needs a fact the site does not hold is not a Reading.
**Images:** a chart, not a photograph.
**CTA:** the CSV.
**Metadata:** subject, observation window, author, published date, data file.
**Distinctive element:** the derivation is *shown*, not summarised — the
distinguishing feature versus every other NGO "insight".

### 4. Field note *(CREATE)*
**Purpose:** proof the organisation is outdoors.
**Structure:** one photograph, full bleed → 150–400 words → a date and a place →
a signature.
**Evidence:** none required beyond the observation. **This is deliberate** — a
field note that carries a statistic is a Reading wearing the wrong clothes.
**Images:** exactly one. Black and white, `class="duo"`, like everything else.
**CTA:** none. The absence is the point.
**Metadata:** date, place, author, related work item.
**Distinctive element:** the only archetype with no call to action and no number.

### 5. Perspective *(CREATE)*
**Purpose:** a position Swechha will be held to.
**Structure:** the claim → what the record shows → what the counter-argument is,
stated fairly → what follows → signature and date.
**Evidence:** at least two readings or explainers already on the site. A
Perspective that cites nothing the site holds is an opinion, and should not run.
**Images:** one, or none.
**CTA:** the readings it rests on.
**Metadata:** subject, author, date, claims made.
**Distinctive element:** a named human signature at the top, not the bottom, and
a stated counter-argument. **Human-written only. Never agent-drafted.**

### 6. Consequence *(CREATE)*
**Purpose:** what was filed and what came back.
**Structure:** what prompted it (link the reading) → what was filed, when, to
whom → what came back, or that nothing did → what happens next.
**Evidence:** the document. Scanned, linked, dated.
**Images:** the document itself.
**CTA:** none, or "read the objection window".
**Metadata:** filed date, body, reference number, outcome, status.
**Distinctive element:** must be publishable when the answer is *nothing
happened*. A Consequence page that only runs on wins is advertising.

### 7. Work item *(`/work/**` — exists, 13 unbuilt)*
**Purpose:** what a programme is, what it produced, how to join.
**Structure:** what it is → where and since when → the figures, counted or
modelled → named people → what it needs → how to join.
**Evidence:** every figure resolves from `data/work/**`. Already enforced.
**Images:** 3–8, at least one of people doing the thing.
**CTA:** the specific one for that item (bring your school / walk it with us).
**Related:** siblings of the same kind, plus the situation it touches.
**Distinctive element:** the figures carry their span ("cumulative, since 2000")
— which is why `/impact` can never disagree with the item page.

### 8. Person / voice *(CREATE as a pattern, not a section)*
**Purpose:** someone in their own words.
**Structure:** portrait → who they are and their relation to the work → 100–300
words in their own voice, minimally edited → what they are doing now.
**Evidence:** consent, recorded.
**Images:** one portrait, named.
**CTA:** the programme they came through.
**Distinctive element:** the subject's words set in the body face at lead size,
with Swechha's framing in small caps around them — the visual inversion of every
other page, where Swechha speaks and the photograph illustrates.

### 9. Ledger entry *(CREATE — the transparency shelf)*
**Purpose:** an institutional fact a reader can verify without asking.
**Structure:** the document → what it covers → the period → where to verify
independently.
**Evidence:** the PDF.
**CTA:** none.
**Distinctive element:** the *independent verification* line — the registrar,
the certificate number, the portal. It is what separates a ledger from a brochure.

---

## 12. Trust architecture

### Current state, audited

| Question a sceptic asks | Answered? | Where |
|---|---|---|
| Who is behind Swechha? | **Yes, well** | `/about` — 16 biographies, 8 board members |
| What has it accomplished? | **Yes** | `/impact` — a register with spans |
| Are the numbers honest? | **Yes, exceptionally** | counted vs modelled, labelled |
| What evidence exists? | **For the environment, yes. For Swechha, thinly** | 76 open holes in the register |
| Where does money go? | **No** | No financial figure anywhere on 147 pages |
| Is it registered? | **Asserted, not shown** | Footer claims 80G/12A/FCRA; no numbers, certificate unlinked |
| Who are the partners? | **Partly** | 20 named inside 5 item pages; no partner page |
| What do communities say? | **Barely** | 2 blockquotes site-wide; fellows' quotes anonymised |
| What measurable outcomes? | **Yes** | `/impact` |
| What has been learned? | **No** | Nothing anywhere |
| What has not worked? | **No** | Nothing anywhere |
| What is it working on now? | **Partly** | `/now` is live; `/work` is 11 of 24 |
| Can I verify a claim independently? | **For readings, yes. For Swechha, no** | Every reading names its source; no organisational claim does |

### The proposed Trust Layer

**Tier 1 — the shelf** *(zero collection; publish this month)*
Nine annual/activity reports (2011–2025) and the 80G certificate, already on the
server at `/docs/reports/` and `/docs/compliance/`. Add registration numbers,
the FCRA number, and one financial figure — total income and the programme share
for the most recent year, which is in the most recent report. Put it on `/about`
or a new `/ledger`.

**Tier 2 — the timeline made real** *(low effort; the source is in the repo)*
`/about`'s record has four entries for twenty-six years. The nine reports
contain the missing twenty-two. Reading files already committed closes this.

**Tier 3 — independent verification**
Beside each claim, where to check it without asking Swechha: the Societies
registrar, the 80G/12A certificate numbers, the FCRA portal, the IGES page for
the research publication, the GIZ attribution already printed on the posters.
This is the `/use-the-data` principle turned on the organisation itself.

**Tier 4 — voices, named**
Extend the Healthy Cities "What people said" pattern site-wide and, with
consent, replace "a workshop participant" with a name and a school. One named
ME to WE alumnus who is now staff is worth more than any counter on the page.

**Tier 5 — what did not work** *(the differentiator)*
GiveDirectly publishes annual fraud, harm and safety reports. No Indian
environmental NGO in this benchmark set publishes failure. Swechha already keeps
a public register of its own gaps — the instinct is present. Candidates that are
true and safe to publish: plantings that did not survive their second year;
a campaign that did not move anything; the eighteen years with no photograph and
why. **This is the item most likely to make the site talked about, and it costs
nothing but nerve.**

**Tier 6 — policies**
Safeguarding, POSH and privacy, on the site of an organisation that takes
children on twelve-day journeys. Currently absent. Schools will eventually ask;
better to be the organisation that published them first.

### The principle

> Transparency here is not defensive. It is the same discipline the readings
> already get, applied to the organisation that publishes them. The site's
> credibility rests on a standard it has been applying outward and not inward.

---

## 13. Return-visit strategy

### Evergreen — found by search, returned to as reference

`/learn` (30 pages), `/teach` (53), `/use-the-data`, `/record`. These already
work and need extension, not reinvention. The four missing DIY guides are the
obvious additions. **No new cadence required.**

### Recurring — the promise a reader can subscribe to

**The monthly digest, actually sent.** The form exists on eleven pages, the
promise is written ("Once a month, what these numbers did"), and the machinery to
send it does not exist. Build the composer and the workflow; it can be assembled
from `data/**` largely automatically, with one human paragraph. **This is the
highest-value recurring item and it is mostly already built.**

Then, on the ladder's cadence:
- **One Reading a month** — derived from data already held.
- **A Field note a fortnight** — from journeys and farm weeks already happening.
- **A Perspective a quarter** — human-written.

That is roughly **38 pieces a year**, of which perhaps four need a week of
anyone's time. It is a realistic rhythm for an organisation this size, and it is
deliberately below what a media site would publish. Volume is not the goal;
*keeping the promise* is.

**Add a feed.** RSS/Atom for `/journal` and `/record`. Every benchmark has one.
Swechha has none. This is an afternoon.

### Timely — events, campaigns, seasons

The site already has the strongest timely infrastructure in the set: the climate
event detector, the fire season, the Yamuna sampling round, the air winter. The
missing piece is that **nothing tells a reader a season has opened.** The air
situation page already knows that "Stubble season opens in October". A digest
and a feed turn that knowledge into a reason to come back.

### Relationship — people and places followed over time

- **Ward alerts** already exist and work — "one message when your monitor's band
  changes for the worse." This is the best relationship mechanism on the site and
  it is confined to the air page.
- **Follow a fellow, a school, a plot.** The Healthy Cities cohort is ten named
  people doing datable work. A reader who met Taniya Gill's nature journals has a
  reason to come back for what happened next.
- **The farm across a year.** Twelve field notes from one place is a series
  without needing to be called one.

### Recommended publishing rhythm

| Cadence | Output | Effort |
|---|---|---|
| Continuous | Readings (automated) | None |
| Fortnightly | One field note | ~30 min |
| Monthly | One Reading + the digest | ~1 day |
| Quarterly | One Perspective | ~1 week |
| As it happens | Consequence, climate events | Variable |
| Annually | The flagship, from the record | ~3 weeks |

**Do not publish to a volume target.** The site's authority comes from restraint;
a Reading with nothing in it would cost more credibility than a missed month.

---

## 14. Content repurposing framework

The site's advantage is that one field day generates evidence at several rungs
of the ladder *natively* — not by rewriting the same piece in five shapes.

### From one Yamuna Yatra

| Output | Rung | What it contains that the others do not |
|---|---|---|
| Twelve field notes, one per day | 1 | A place and a date each — the river changing under one group |
| One Reading | 2 | The water-quality readings along the route against the limit |
| One explainer, if a concept came up | 3 | Evergreen, search-facing, no trip in it |
| Updated work-item figures | 7 | The count, with its span |
| Two named voices | 8 | A student and a host, in their own words |
| One photo set → `/record` and share cards | — | Fills the archive strip's empty years |
| Digest item | — | Two sentences and a link |
| A `/teach` session, if a exercise emerged | 3 | Reusable by a teacher who was not there |

**Eight legitimate assets, zero repetition** — because each is defined by what it
*uniquely* contains, not by reformatting a single source text.

### The anti-repetition rules

1. **One fact, one home.** A figure lives in `data/work/**` and is *referenced*
   elsewhere. This is already how `/impact` works and it is why the register
   cannot disagree with an item page. Extend the rule to prose.
2. **Each asset must contain something none of the others contains.** If a Field
   note and a Reading say the same thing, one of them should not exist.
3. **Never republish across rungs.** A Field note is not a shorter Reading.
4. **The digest links, it does not restate.** Two sentences, then the link.
5. **Cap the derivatives.** No more than four public assets from one field day,
   plus the data. Beyond that it reads as content marketing.

---

## 15. SEO and discoverability principles

### Current position

`docs/SEARCH-VISIBILITY-ACTION-PLAN.md` (2026-08-30) checked eleven commercial
phrases and found two winnable on-site; the rest are dominated by third-party
listicles and donation platforms. The prior SEO baseline found the site ranks on
brand terms and dead WordPress URLs, and that **non-brand visibility is a
backlinks problem, not a content problem**. 146 URLs are in the sitemap, robots
allows everything relevant, IndexNow is wired.

### The principle

> **Swechha should rank because it holds the answer, not because it wrote a page
> about the question.**

The site is already structurally right for this. Thirty `/learn` pages answering
"what is PM2.5", "what is dissolved oxygen", "how does India define a heatwave"
form genuine topical authority around Indian environmental measurement. The
53-page `/teach` manual is the kind of resource that earns links from teachers
without being asked. `/use-the-data`'s CC BY 4.0 grant plus citation guidance is
a link-generating asset that almost no NGO has.

### What to do

1. **Extend `/learn` only where Swechha holds the data.** An explainer about a
   number the site does not measure is a generic SEO page. This constraint is
   also the quality control.
2. **Make the record citable and it will be cited.** `/use-the-data` already
   tells a journalist exactly how to cite a reading. Promote it: link it from
   every situation page and the footer's Read-and-reach column.
3. **Fix the dead inbound links.** Existing press coverage points at
   pre-migration WordPress URLs. Each fix is both a working referral and a
   canonical signal. This remains the single highest-value off-site lever and it
   needs emails, not code.
4. **Get into the listicles.** Seven Indian "top environmental NGO" lists are
   enumerated in the action plan, and AQI.IN already lists Swechha first. Send
   what is checkable — founding year, focus, registration, `/about` — not a
   superlative.
5. **Name the authors.** Bylines are both an E-E-A-T signal and simply true.
6. **Publish in Hindi.** Search volume for Delhi air in Hindi is not small, and
   PARI's model says language is equity, not a translation chore. Start with the
   four "start here" explainers.
7. **Let the Journal carry the freshness.** Search rewards a site that changes.
   The record changes hourly but the pages do not; monthly Readings do.

### What not to do

No keyword-targeted page for a number Swechha does not hold. No location pages
("air quality in Noida") without a reading behind them. No FAQ schema on prose.
No publishing to a volume target. **Every one of these would work, briefly, and
each would cost the thing the whole site is built on.**

---

## 16. Visual and editorial direction

### What is already settled and should not be reopened

`docs/design/BRANDING-2026-08-21-frozen-language.md` and the served lane's
system: Archivo (variable, narrowed width) for display, Newsreader for body,
grounds-and-ink rather than a brand palette, `--mustard` as the one interactive
hue, and **every photograph black and white** via the `duo` treatment, which
appears 225 times across 147 files. Selective colour is retired.

This is, on the evidence of the benchmark set, **the most distinctive visual
identity of any organisation reviewed**. CSE and ATREE look like institutions;
Chintan and Goonj look like NGOs; Carbon Brief and Mongabay look like
publications. Swechha looks like nothing else in the sector and the restraint is
the reason.

### What "modern Swechha" should mean going forward

**Editorial, not campaigning.** The page should read like a well-set book about
a river, not like a fundraising appeal. It already does.

**The number is the image.** The strongest visual moments are the readings —
143, 0.3, 1,377 — set large in the numeric face against a ground. This is a
*typographic* identity built on measurement, and it is the element that should
carry into any new archetype. A Reading's chart should be set with the same
restraint: one series, labelled, no decoration.

**Black and white is an evidential claim, not a style.** Colour would make the
foam on the Yamuna look designed. The monochrome says: this is what was there.
Hold it absolutely — including for any new archetype.

**Whitespace as pacing, not as fashion.** The site's bands already vary in
density: `/now` is dense and instrument-like, `/farm` is open and slow. This
variance is what stops 147 pages feeling generated. **Any new archetype must
declare its own rhythm** (see §11), and a template that makes nine archetypes
share a band order would be a regression, however clean it looked.

**Motion: almost none.** The homepage's ticker and the archive strip are enough.
A site whose argument is sobriety should not animate its numbers.

**The human detail.** The site's warmest moments are small and textual — "Tea
bags are on it, which surprises most people"; "photographs worse"; the archive
strip labelling itself *7/27 years scanned*. Protect these in every editing
pass. They are the strongest available evidence that a person wrote the page,
and they are exactly what a generated pass would smooth away.

### What to add

- **A chart style**, defined once, for the Reading archetype. One series, direct
  labels, the limit drawn as a rule, the same ink palette. No library defaults.
- **A voice treatment** — the inversion described in archetype 8, so that a page
  where someone else speaks *looks* different from a page where Swechha speaks.
- **Portraits.** The team portraits are good; participants have none.

---

## 17. Recommended publishing model

**One editor, part-time, with a standing agenda.** Not a content team.

| Rhythm | Who | What happens |
|---|---|---|
| Weekly, 30 min | Editor | Review what the record threw up; queue one Reading candidate |
| Fortnightly | Field staff | One photograph and 200 words from wherever they were |
| Monthly, half a day | Editor | Publish one Reading; assemble and send the digest |
| Quarterly, one week | ED or a named author | One Perspective |
| Annually | Whole team | The flagship, assembled from the year's record |

**The gap register is the backlog.** 76 `holes` entries across `data/**`, each
with an `unlocks` line stating the single fact that would close it. This is
already a prioritised, machine-readable editorial queue written by people who
know the work. It should be the standing agenda of the weekly review, and the
primary input to any agentic system.

**Governance.** Readings and Field notes: editor publishes. Perspectives and
Consequences: ED approves. Anything naming a person: consent recorded first.
Anything in the protected data sections: the existing `verify:seo` and
`generated-current.yml` gates already apply.

---

## 18. Agentic content-system principles

The eventual system's purpose is to make the editor's half-day a half-day, not
to produce pages while nobody is looking.

### The division of labour

**AI may:**
- Watch `data/**` for anomalies and propose Reading candidates with the query
  pre-run. *(The strongest use: the data is already structured and the
  derivation is mechanical.)*
- Work the 76-entry gap register — say which fact is missing, draft the question
  to ask, and prepare the page for when the fact arrives.
- Draft Explainers from cited standards, with every claim linked.
- Structure a Field note from a photograph and a voice memo.
- Check consistency: does this figure match `data/work/**`? Does this page
  contradict `/impact`? Is this citation live?
- Propose related content and internal links.
- Prepare the digest from the month's record, leaving the human paragraph blank.
- Flag voice drift: three same-length sentences, a banned word, a generic
  opening.

**AI must never:**
- Invent a fact, a figure, a quote, a person, a partnership, a date or an event.
  **Absolutely, with no exception and no "reasonable inference".**
- Write a Perspective. It is the one archetype whose value *is* that a named
  human will be held to it.
- Publish anything naming a living person without recorded consent.
- Alter a number, a source citation, an observation stamp or a limit in the
  protected data sections.
- Fill a hole in the register with an estimate. A hole is a fact about what
  Swechha does not know, and it is more valuable than a guess.
- Publish anything without a human in the loop.

### The four gates

1. **Provenance gate.** Every factual claim resolves to `data/**`, a cited
   external source, or a recorded human statement. Unresolvable claim → the
   draft does not build. This is the same discipline `lib/content/schemas.ts`
   already applies to frontmatter, extended to prose.
2. **Archetype gate.** A draft declares its archetype and satisfies that
   archetype's contract (§11). A Field note carrying a statistic fails. A
   Reading without a shown derivation fails.
3. **Voice gate.** Mechanical checks first — banned vocabulary, sentence-length
   variance, banned openings, heading density, CTA repetition across recent
   pages. Then a human read.
4. **Sameness gate.** *The most important and the one nobody builds.* Compare
   each draft against the last ten published pieces of its archetype: opening
   construction, paragraph count, heading pattern, closing move. Too similar →
   it does not ship. **This is the specific mechanism that prevents the site
   drifting into looking AI-generated**, and it should be built before, not
   after, the drafting machinery.

### The governing principle

> AI is the researcher, the fact-checker and the typesetter. It is never the
> author and never the publisher. The reader should never be able to tell it was
> used — not because it is hidden, but because a human decided every sentence
> that mattered.

The corollary is uncomfortable and worth stating: **the site's voice is its
scarcest asset, and an agentic content system is the largest single threat to
it.** Everything in this section exists to hold that risk down. If only one
thing from §18 is built, build the sameness gate.

---

## 19. Priority roadmap

Impact / Effort / Strategic importance, all High / Medium / Low.

### NOW — weeks 1–4

| # | Action | Impact | Effort | Strategic |
|---|---|---|---|---|
| 1 | **Publish the transparency shelf** — 9 reports + 80G cert + registration numbers + one financial figure | **High** | **Low** | **High** |
| 2 | **Build and send the monthly digest** — composer + workflow; the promise is already public on 11 pages | **High** | Medium | **High** |
| 3 | **Retire `/explore`** — redirect to `/learn`; it contradicts the site's own licence | Medium | **Low** | Medium |
| 4 | **Fix or remove the "Do it yourself" door** and the two unsourced homepage figures | Medium | **Low** | **High** |
| 5 | **Add RSS/Atom** for `/journal` and `/record` | Medium | **Low** | Medium |
| 6 | **Put the digest form on the homepage, `/learn`, `/teach`, `/journal`, `/impact`** | Medium | **Low** | Medium |
| 7 | **Publish one Reading** — prove the monthly cadence exists | Medium | **Low** | **High** |

*Rationale: every item is either zero-collection or nearly so, and items 1, 2 and
4 each close a gap between what the site promises and what it delivers — which
is the only kind of defect that damages a site built on checkability.*

### NEXT — months 2–4

| # | Action | Impact | Effort | Strategic |
|---|---|---|---|---|
| 8 | **Build the real timeline** from the nine reports | **High** | Medium | **High** |
| 9 | **Close the 13 unbuilt work items**, starting with *We for Yamuna* | **High** | **High** | **High** |
| 10 | **Start Field notes** — fortnightly, from journeys already running | **High** | **Low** | **High** |
| 11 | **Named voices** — extend the Healthy Cities pattern, de-anonymised with consent | **High** | Medium | **High** |
| 12 | **Write the Method page** | Medium | **Low** | **High** |
| 13 | **First Perspective**, signed | **High** | Medium | **High** |
| 14 | **Four DIY guides** into `/learn` | Medium | Medium | Medium |
| 15 | **Off-site SEO** — fix dead press links, submit to the seven listicles | **High** | Medium | Medium |
| 16 | **Policies** — safeguarding, POSH, privacy | Medium | **Low** | **High** |

### LATER — months 5–12

| # | Action | Impact | Effort | Strategic |
|---|---|---|---|---|
| 17 | **The Consequence trail** — file something, publish what came back | **High** | **High** | **High** |
| 18 | **What did not work** — the differentiator nobody in the sector publishes | **High** | Medium | **High** |
| 19 | **Hindi** — four explainers and the air situation | **High** | **High** | **High** |
| 20 | **The annual flagship**, built from the record | **High** | **High** | **High** |
| 21 | **The agentic system** — provenance, archetype, voice and sameness gates first | Medium | **High** | Medium |
| 22 | **Method as a workshop** (experiment) | Medium | Medium | Low |
| 23 | **Fill the archive strip** — 20 placeholder years | Medium | **High** | Medium |

### The sequence argument

The roadmap is deliberately ordered so that **the automation comes twenty-first**.
Items 1–20 establish what excellent Swechha content is — the cadence, the
archetypes, the voice gates, and a body of published work to measure a draft
against. An agentic system built before that has nothing to imitate but the
average of the internet, which is precisely the outcome the brief rules out.

---

## Appendix A — measured facts underlying this audit

All counted on this commit, 2026-09-14. Nothing here is asserted from memory.

| Fact | Value | How counted |
|---|---|---|
| Built HTML pages | 147 | `find public/_pages -name '*.html'` |
| URLs in live sitemap | 146 | `curl swechha.in/sitemap.xml \| grep -c '<loc>'` |
| `/learn` explainers | 30 | `ls public/_pages/v3/learn/*.html` |
| `/teach` pages (sessions) | 53 (43) | `find public/_pages/v3/teach` |
| `/stories` essays | 5, last dated 2023-08-14 | `datePublished` in built pages |
| `/journal` entries | 2, both 2026-09-08 | same |
| Work items in `data/work` | 24 | `find data/work -name '*.json'` |
| Work item pages built | 11 (+5 indexes) | `find public/_pages/v3/work` |
| Open `holes` entries | 76, across 29 files | recursive count of `holes` arrays in `data/**` |
| Annual/activity reports on server | 9 | `ls public/docs/reports` |
| Pages linking to those reports | **0** | `grep -r '/docs/reports' public/_pages` |
| 80G certificate on server | 1, unlinked | `ls public/docs/compliance` |
| Blockquotes site-wide | 2 | `grep -c '<blockquote'` |
| Pages carrying the digest form | 11 | `grep -rl 'api/newsletter' public/_pages` |
| Digest sender workflows | **0** | `ls .github/workflows` |
| RSS/Atom feeds | **0** | no feed route, no `application/rss` link |
| `duo` (B&W) photo treatment uses | 225 | per `CLAUDE.md`, verified on this commit |
| `/explore` status | HTTP 200, `noindex`, old nav, "All rights reserved" | live fetch |

## Appendix B — benchmarks checked

Each fetched live on 2026-09-14. Claims in §3 are drawn from these fetches, not
from recall.

cseindia.org · chintan-india.org · atree.org · india.mongabay.com ·
dialogue.earth · ruralindiaonline.org · landconflictwatch.org · goonj.org ·
carbonbrief.org · ourworldindata.org · bellingcat.com · theoceancleanup.com ·
charitywater.org · givedirectly.org

*Not reached:* welllabs.org (HTTP 403), patagonia.com/stories (HTTP 404),
indiaspend.com (301 → isignal.in, rebranded; not pursued).

---

*Prepared as a strategic audit only. No page, template, navigation item or line
of copy was changed. Implementation awaits approval.*
