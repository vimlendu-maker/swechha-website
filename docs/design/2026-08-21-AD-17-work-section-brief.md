# BRIEF — Art director, the WORK section: page architecture, then population

**Phase 1 of this brief is ARCHITECTURE ONLY. Do not build pages yet.** The owner
(Vimlendu — he owns every design, copy and brand decision) has asked, verbatim:

> "Start work on WORK section and populate all the pages. Ask art director to first
> create a minimal number of pages architecture. How will information flow, how will
> someone navigate, how many pages and subpages needed, do we need individual pages for
> each project, each journey, each campaign? Upselling and crossselling other things on
> each page. All events can be on one page. Follow the design language finalised, as per
> the home page finalised."

So the deliverable of this brief is **a page architecture document he can rule on in one
sitting**, not a set of pages. He will read it. Be exact, be brief where brevity is
honest, and show the work.

## The four questions he actually asked

Answer each one directly, with a recommendation — not a survey of options.

1. **How many pages and subpages does WORK need?** He said "minimal number". Treat that
   as a constraint with teeth: every page you propose must justify its own existence
   against being a section of a page that already exists. A page that would be three
   paragraphs and a photograph is an anchor, not a page.
2. **Do we need individual pages for each project, each journey, each campaign?** This is
   the load-bearing question. It is **not** a taste question — it is answerable from the
   content ledger. A project with two sourced figures and no story cannot fill a page
   honestly, and a stub detail page is worse than a rich row on a landing page. Go item
   by item through the real inventory (below) and say, per item: **own page / row on the
   landing page / not yet**. Where the answer is "not yet", say what content would earn
   it. Expect the answer to be mixed, and say so plainly if it is.
3. **Information flow and navigation.** How does someone arriving at `/work` from the
   homepage move; how do they move *between* kinds (a journey reader who should be
   looking at a project); how do they get back. Name the components that carry this, and
   whether any of them already exist in the frozen language.
4. **Upselling and cross-selling on each page.** This is his phrase and it means: no page
   is a dead end — every page carries onward doors to the other kinds of work, to
   Situations, to the Farm, to Give, to Act. Design this as **one system**, specified
   once, that every page in the section instantiates — not as a per-page decision. Say
   what goes in it, what the ordering rule is, and how it stays honest (a door to a page
   that does not exist yet is a defect, not a placeholder).

## Rulings already made — these are settled, do not re-open

- **All events on one page.** The owner's words. `/work/events` is a single page; there
  are no event detail pages and no event subpages. Design that page to hold the whole
  set at any count.
- **The four kinds are `projects`, `campaigns`, `journeys`, `events`** and the URL
  convention is already in use by the frozen homepage's buttons: `/work`,
  `/work/projects`, `/work/campaigns`, `/work/journeys`, `/work/events`,
  `/work/projects/<slug>`, `/work/campaigns/<slug>`. **Every one of those destinations
  is currently reachable from the frozen homepage**, so your architecture must either
  provide the page or state the redirect. Nothing may 404.
- **The design language is frozen.** `public/design/v3/home.html` is the reference and
  `docs/design/BRANDING-2026-08-21-frozen-language.md` is it written down. You extend it;
  you do not restate it and you do not improve on it. §10 of that document is the
  build checklist and §7 is the forbidden list.
- **The honesty rules are the spine of the project.** No invented figures, no invented
  facts, no tensed claim typed into static markup. If a figure has no source it does not
  go on a page — it becomes a named hole or a question. Naming a hole is content.

## The real inventory you are architecting for

**Journeys — four, and the best-sourced material on the site.** Yamuna Yatra (12 days,
Yamunotri→Agra, 1,000 km, 30+ Yatras since 2004, 3,000+ youth leaders), Gram Anubhav
(4–5 days, four states, 60+ run with 100+ grassroots partners), NatureScapes (2–5 days,
forest/Himalayan/desert/marine, 60+ organised), CityScapes (2–4 hours, 1,000+ walks in
two decades, 100,000+ people). **Designs already exist** for the landing page and all
four details, outside `v3` and pre-freeze: `public/design/journeys-landing.html` (LOCKED
2026-08-19, see the ruling in `DECISIONS-2026-08-18.md`) and `journeys-{yamuna-yatra,
gram-anubhav,naturescapes,cityscapes}.html`.

**Projects — eight named on the frozen homepage,** with very unequal content: Bridge the
Gap (the lead, two sourced readings), Farm School, Eco Action, ME to WE, Influence, She
Leads Change, Food systems with UNEP, and Brake Even (**removed to the archive on the
owner's 21 Aug ruling — it is not on the homepage**). Designs exist for five:
`projects-landing.html`, `project-{bridge-the-gap,farm-school,influence-fellowship,
she-leads-change,food-systems}.html`. **Two of those five are stamped "Demo content — not
verified" and the frozen homepage now contradicts them** — the homepage wins (D-10.4).

**Campaigns — three on the frozen homepage:** We for Yamuna (since 2000), Monsoon
Wooding (50,000+ trees planted and survived), Delhi I Can't See You. **No campaign
landing or detail design exists.** There is one real content file,
`content/campaign/delhi-air-quality-2026.md`, and a live Next.js route pair at
`app/work/campaigns/`. Note from the record: "Delhi I Can't See You" is in neither source
document, and "Spotted. Stop It!" is live on swechha.in but absent from the homepage —
both are questions for the owner, not things to invent around.

**Events — four named, and nothing else:** Yamunotsav, Cyclothon, Greenathon, Yamuna
Shramdaan. The owner's own caveat governs the framing: *"These events are from the past
mostly and they could be in archive too, but i feel on homepage it shows depth."* The
homepage therefore frames them as a **record, not a calendar**, with no dates, editions,
years or counts, because he gave four names and nothing else. `events-landing.html` exists
as a pre-freeze design. **A single page holding four names is the hardest brief in this
section — solve it, don't pad it.**

**The cross-sell targets that actually exist and are built:** the frozen homepage and its
bands, `/design/v3/situation-air.html` (finished, on real data), `intelligence.html`,
`about.html`, `system.html`, the Farm band, Green the Map, Record, Give. Situations for
Yamuna/heatwave/forest-fire/climate-event exist as pre-freeze or scaffold pages —
check their state before you point a door at one.

## Read before you design, in this order

1. `docs/design/HANDOFF-2026-08-21-resume-here.md` — where the project stands.
2. `docs/design/BRANDING-2026-08-21-frozen-language.md` — the language as built. §3 the
   grammar, §4 the honesty devices, §5 the fifteen solved components (reuse these; a new
   component needs a reason), §7 forbidden, §10 the checklist.
3. `docs/design/2026-08-21-SOURCE-FACTS.md` — every figure with its source. §46 journeys,
   §54 projects, §91 campaigns+events, §150 the owner's authoritative 21 Aug additions.
4. `docs/design/DECISIONS-2026-08-20-homepage.md` — the ruling ledger, D-07.0 → D-22.x.
   **Read the tail first.** D-03.2 count-independence and D-10.4 homepage-wins bind you.
5. `docs/design/2026-08-21-AD-07-work-chapter.md` — the homepage's WORK chapter. Its §5
   Destinations table is the contract your architecture must satisfy. Its §6 open item 4
   is a live instruction about the detail pages.
6. `docs/design/SITUATION-PAGE-TEMPLATE.md` — **the generator pattern.** Situation pages
   are build artefacts: a script copies the frozen token and chrome layer out of
   `home.html` line by line, with assertions, so drift is closed by construction. Say in
   your doc whether the WORK pages should be built the same way. The alternative — each
   page carrying its own hand-copied `<style>` — is what left `situation-air.html` with
   three defects the homepage had already cured.
7. The frozen homepage's WORK bands rendered, not just as source: `home.html` bands 4–7.
   That is the language you are extending.

## Deliverable — phase 1

**One document: `docs/design/2026-08-21-AD-17-work-architecture.md`.**

1. **The map.** Every page and subpage, its URL, its one-sentence purpose, and the
   reason it is a page rather than a section. A count at the top: *N pages, M of them
   already designed.*
2. **The flow.** How a reader moves — homepage → `/work` → a kind → an item → onward.
   Include the reverse paths and the between-kinds paths. A diagram in plain text or a
   table is fine; prose that describes a diagram is not.
3. **The per-item ruling table** for question 2: every project, journey and campaign, with
   own-page / row / not-yet, the sourced content that decides it, and what would change
   the answer.
4. **The cross-sell system**, specified once: its component, its slots, its ordering rule,
   its honesty rule, and what it looks like at 375 and 1440.
5. **Per page type, the band sequence** — id, ground hex, tier — with the adjacency check
   done mechanically. Enough detail to build from, not a full compositional spec for
   every page yet.
6. **What you deliberately refused, and why.**
7. **Client questions** — only questions where a different answer changes the work. The
   "Delhi I Can't See You" / "Spotted. Stop It!" mismatch and the two demo-stamped
   project designs start that list.

**Do not write page HTML in phase 1.** Phase 2 (build and populate) starts once the owner
rules on the map. If you find yourself designing a band composition in detail, you have
drifted out of scope — note it in one line and move on.

## Method

The dev server serves `public/` at the root; start it from `.claude/launch.json`
(`swechha-website`, port 3000) — **never with a bare shell command**. Capture with CDP
`Emulation.setDeviceMetricsOverride` only; **never bare `--window-size`**, which applies
no device emulation, lays the page out wider and crops the PNG, and has manufactured two
entire phantom defect lists on this project. **Then read the PNG** — never report on a
page you have only read as source.

`public/design/` is working material and is deleted before any deploy.
