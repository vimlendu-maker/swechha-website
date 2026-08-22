# AD-17 — The WORK section: page architecture

**Phase 1, and written as a build contract rather than a discussion document.** Every
destination below is a row the build gets checked against.

Nothing here is asserted. Every number was measured this session with CDP
`Emulation.setDeviceMetricsOverride`, and every page I describe I captured and read as a
PNG. Authority order: frozen `public/design/v3/home.html` is the design language ·
`DECISIONS-2026-08-20-homepage.md` is the ruling ledger · `2026-08-21-SOURCE-FACTS.md`
holds every figure with its source · `2026-08-21-AD-17-content-ledger.md` decides
page-or-row · `2026-08-21-AD-17-link-contract.md` holds the href census. I cite the last
two rather than rebuild them.

---

## 0. The answer in one screen

**13 pages: 5 landings + 8 item pages. Eleven pre-freeze design files exist at these
URLs. Zero of them are in the frozen design language.**

That last sentence is the finding of this pass and it changes the shape of the work.
The eleven `journeys-*` / `project-*` / `*-landing` files do not save build time.
**Measured, not asserted:**

| | the eleven pre-freeze pages | frozen `v3/home.html` |
|---|---|---|
| typefaces loaded | Archivo + **Fraunces** + **Instrument Sans** | Archivo + Newsreader |
| grounds | `#0F0F0E` · `#F7F4ED` · `#F1EBDD` | `#0D0D0B` · `#151512` · `#F3F2F0` · `#ECEBE8` |
| `url(#sig-*)` selective-colour refs | **6 each** | **0** |
| halftone dot screen | none | three frames |
| icon sets | 13+ drawn icons on `journeys-landing` alone | forbidden (BRANDING §7.4) |
| mustard as a ground | **one flood band per page** | once site-wide, `#give` |
| footer | platform-logo circles + an email form that stores nothing | words, no form |

Three typefaces against two, a warm paper against a cool one, and selective colour live
on all eleven — a treatment the frozen language explicitly retired. They are a different
product wearing the same wordmark. **What survives is content architecture, not a line of
CSS**, and where their content contradicts the frozen homepage the homepage wins (D-10.4).

Two consequences worth stating before the map:

- **The verdicts are mixed and mixed is the honest answer.** Journeys carry four pages;
  projects carry four; **campaigns carry none**; events carry one page for all four names.
- **The section's weakest kind is the one with the most inbound links.** `/work/campaigns`
  takes six links from the frozen homepage and holds three items with two sourced figures
  between them, both belonging to one of the three. That is a composition problem, and §5C
  solves it rather than padding it.

---

## 1. The map

| # | URL | purpose in one sentence | why a page and not a section |
|---|---|---|---|
| 1 | `/work` | The whole inventory: every project, campaign, journey and event by name with one fact line each. | The section's front door. Once the menu's **Work** resolves here (§2) it is the most-entered page in the section, and it is the only place all four kinds appear together at full membership. |
| 2 | `/work/projects` | The seven live projects at register density. | **8 separate links point at it** — the most-linked destination in the section and today the most visible 404. |
| 3 | `/work/campaigns` | The three campaigns and, for each, the situation it pushes against. | The reciprocal half of D-18.2: the situation page answers *why*, this page answers *what we are doing*, neither repeats the other. |
| 4 | `/work/journeys` | The four routes, duration-first. | Four items each carrying a duration, a geography and a figure — the best-sourced material on the site. |
| 5 | `/work/events` | The record of what Swechha does in public. | Owner ruling: all events on one page. No event detail pages and no event subpages, at any count. |
| 6 | `/work/projects/bridge-the-gap` | The curriculum programme, on the sourced figures only. | Deep-linked from the frozen homepage; two readings each carrying its period, five named funders, a 15-year documented count, plus CineGreen and Ride the Van. |
| 7 | `/work/projects/farm-school` | The learning-lab **programme** on the farm. | Deep-linked from the frozen homepage; three programme kinds and the 5 C's are sourced. **Question 6: the place stays `/#farm`.** |
| 8 | `/work/projects/eco-action` | Butterfly parks, herb gardens, and one park taken from 5% to 90% green cover. | The ledger's own finding: the strongest unbuilt page on the site. Three sub-programmes, five funders, a decade-long before/after. **Ships with no photograph and the hole named — see §8.** |
| 9 | `/work/projects/me-to-we` | Fourteen years with one community. | An origin, a place, a dated arc (2007 → 2009 → 2019), 3,000+ children, 200+ alumni peer leaders, some now staff. **Also ships with no photograph.** |
| 10 | `/work/journeys/yamuna-yatra` | Twelve days, Yamunotri to Agra. | 1,000 km, 30+ Yatras since 2004, 3,000+ youth leaders, three named schools, a Grade XI curriculum, five named partners, nine of its own frames. |
| 11 | `/work/journeys/gram-anubhav` | Four to five days in rural India. | 60+ organised, four states, 100+ grassroots partners, four named activity kinds. |
| 12 | `/work/journeys/naturescapes` | School journeys, two to five days. | 60+ organised, seven named destinations in four ecosystems, named schools. **Its five destination frames are stock and are refused — see §8.** |
| 13 | `/work/journeys/cityscapes` | Two to four hours inside the city. | Six named walks, 1,000+ walks in two decades, 100,000+ people, thirteen of its own frames, and the lowest-friction thing on the site to join. |

**Slug rule**, stated once: lowercase, drop apostrophes, hyphenate spaces —
`Delhi I Can't See You` → `delhi-i-cant-see-you`. **URL convention** from AD-07 §5, already
in use by the frozen homepage's buttons: `/work/<kind>` and `/work/<kind>/<slug>`. Journey
detail URLs are not on the homepage; they take the same shape.

### Design coverage of the thirteen

| pre-freeze design exists at this URL | nothing exists |
|---|---|
| 2 `projects-landing` *(demo content)* · 4 `journeys-landing` *(LOCKED 2026-08-19 — question 4)* · 5 `events-landing` · 6 `project-bridge-the-gap` *(unstamped and the most dangerous — §3)* · 7 `project-farm-school` *(stamped)* · 10–13 the four `journeys-*` details *(cityscapes stamped)* | **1 `/work`** · **3 `/work/campaigns`** · **8 `/work/projects/eco-action`** · **9 `/work/projects/me-to-we`** |

Three pre-freeze pages exist for items this architecture rules **rows**, not pages —
`project-influence-fellowship`, `project-she-leads-change`, `project-food-systems`. All
three are demo-stamped. They are not built.

---

## 2. The nav contract — ruled, because this is what the owner is pointing at

Process ruling **P-1** said the menu is wired *after the homepage is built and signed
off*. The homepage is frozen with every ruling closed. **P-1 has matured; this pass wires
the menu.**

### The defect, measured

Six links, and the identical six repeat in all three surfaces — `.navlinks`, `#navidx`,
`.navscroll`. Five of the six are on-page anchors. So **Work** in the menu bar scrolls to
homepage band 4, while `/work` is a page reachable only from that band's single button;
and **Journeys** is a band while `/work/journeys` is a page. One word, two destinations,
twice over. Standing on `/work/projects`, five of the six links mean nothing at all.

### The ruling: one word, one absolute destination, from every page on the site

| label | destination | kind | exists today |
|---|---|---|---|
| Now | `/now` | page | ✅ route |
| **Work** | **`/work`** | page | ✅ route |
| **Journeys** | **`/work/journeys`** | page | ❌ built by this brief |
| Impact | `/impact` | page | ✅ route |
| Farm | **`/#farm`** | homepage anchor, written absolutely | ✅ band |
| Record | **`/#record`** | homepage anchor, written absolutely | ✅ band |
| Give *(the chip, not one of the six)* | `/act` | page | ✅ route |

Two of the six stay homepage anchors, **written absolutely**, and that is the whole trick:
`/#farm` is a same-page jump from the homepage and a navigate-plus-jump from
`/work/projects`, and it is the *same destination* either way. No word means two things
anywhere, and no page is invented to satisfy the nav.

**The `SECTIONS` control keeps the anchors, and that is not a contradiction.** It is a
different control with a different name — `aria-label="All sections"` — and its job is
in-page. On the homepage it lists the homepage's bands; **on every WORK page it lists that
page's own bands.** So: *the nav goes to pages, SECTIONS goes to bands on the page you are
standing on.* Both sentences become true for the first time, and the phone keeps a way out
of every page in the section at zero pixel cost (BRANDING §5.10).

**`aria-current`** — one location, so one item, most-specific-wins:

| standing on | carries `aria-current="page"` |
|---|---|
| `/work` | Work |
| `/work/projects`, `/work/campaigns`, `/work/events`, and any item page under them | Work |
| `/work/journeys` and the four journey pages | **Journeys**, not Work |
| the homepage | unchanged — whichever band the reading line is in, by the existing observer |

Journeys sitting in the nav as a peer of Work while being Work's child is the owner's own
IA (SOURCE-FACTS §35: *"his new IA promotes journeys to a peer of the other three"*), and
BRANDING §5.10 already licenses the shape — *"the nav is a selection of five destinations,
not a partition"*. Pointing `aria-current` at the parent when the child owns a nav word
would announce the wrong location.

**Cost, exactly: 15 `href` values in the frozen homepage** — five labels × three nav
surfaces — plus the Give chip. Nothing visual moves and no band changes height. It is the
one frozen-file edit this architecture requires, and it needs the owner's word
(question 9).

---

## 3. The per-item ruling — own page / row / not yet

**The rule I applied, stated once so it can be argued with.** An item earns a page when
the sourced material answers all four of: *what it is · who it is for · what it has done,
with a figure carrying its period · what a reader can do next.* Three of four is a row. A
stub page is worse than a rich row — but **a row's link is still specific**: every row
carries its own anchor and lands on itself.

The "what would change the answer" column cites the content ledger's §7 holes by number
rather than restating them.

| item | verdict | the sourced content that decides it | what changes it |
|---|---|---|---|
| **Yamuna Yatra** | **own page** | 12 days · Yamunotri→Agra · 1,000 km · 30+ since 2004 · 3,000+ youth leaders · 3 named schools · Grade XI curriculum · 5 named partners · 9 own frames | ledger hole 12 — confirm the ten route stops, which appear in no source |
| **Gram Anubhav** | **own page** | 4–5 days · 60+ organised · Uttarakhand, Rajasthan, Gujarat, Himachal · 100+ grassroots partners · 12 own frames | ledger hole 13 — the prototype's five regions lose to the homepage's four states; five frames are named after the losing set |
| **NatureScapes** | **own page** | 2–5 days · 60+ organised · 7 named destinations · 4 ecosystems · Shriram and Modern Schools | ledger hole 9 — **all five destination frames are Unsplash stock and are refused (§8).** Needs Swechha's own frames or it ships type-only |
| **CityScapes** | **own page** | 2–4 hours · 6 named walks · 1,000+ walks in two decades · 100,000+ people · 13 own frames | its demo stamp is over-broad: the stamped walk names and duration in fact *match* the owner's own §164 list. Confirm the stamp is lifted |
| **Bridge the Gap** | **own page** | 5–16 sessions on land/water/air · exposure trips and action projects · 100–150 Delhi schools every year · 50,000+ students over fifteen years · 5 named funders · CineGreen and Ride the Van | ledger hole 10 — **the prototype's 25,000+ / 85+ / 1,200+ / 12 cities are withdrawn** and its learning-poverty framing is wrong. The page is rich without them |
| **Farm School** | **own page** | day visits / short courses (the 5 C's) / internships and stays · 5,000 kg leaves composted · 500 kg honey · water harvesting, solar · five acres, 90 minutes | ledger hole 11 — **a participation figure**, and the Farm-overlap ruling (question 6). Ships with the hole named, not filled |
| **Eco Action** | **own page** | 70+ butterfly parks (PVR, AmEx, Adobe) · 20+ herb gardens (Amazon, AmEx) · Airshed Park, Vasant Kunj, **5%→90% green cover over a decade**, American Embassy | ledger hole 6 — **it needs frames, not facts.** One butterfly park, one herb garden, Vasant Kunj before and after. Ships type-only until then |
| **ME to WE** | **own page** | 2007 volunteer school on the Yamuna's banks → ME to WE 2009 · Jagdamba Camp, Sheikh Sarai · 3,000+ over 13 years · 200+ alumni peer leaders, some now staff · 400+ youth since 2019 · EMpower since 2014 | ledger hole 7 — **any photograph, and permission to name one or two alumni.** "Some of whom are now core team members" is the best sentence in the source document and has no face on it |
| **Influence** | **row** → `/work/projects#influence` | since 2010 · 10,000 volunteers annually · 50 colleges · 200 placements · 75 partner orgs · CYON 300+ groups · volunteering *and* a fellowship, nationwide | ledger hole 3 — **five counts from 2010 and no description of what the fellowship year is.** Answer that and it is a page tomorrow. Its prototype invents the name "Influence Fellowship"; the homepage says Influence |
| **She Leads Change** | **row** → `/work/projects#she-leads-change` | with EMpower · 50+ adolescent girls from Jagdamba since 2017 · 300-strong LC cohort · 2018 ELC Bright Promise Award, 57 girls | ledger hole 2 — and first, **whether it is distinct from ME to WE**: same community, same partner, same age group. Its prototype is about rural women's collectives in 48 villages, a different programme entirely |
| **Food systems, with UNEP** | **row** → `/work/projects#food-systems`, **not yet** | one forward-looking sentence, **no figures** | ledger hole 1 — *has it started?* Until that is answered the row cannot honestly sit under a head reading "What is running", which the frozen homepage already handles by giving it no figure and no achievement verb |
| **We for Yamuna** | **row** → `/work/campaigns#we-for-yamuna`, **not yet** | founded 2000, the org's spine. **No figures of its own**, and its content is already spent in the About band and the hero | ledger hole 4 — one dated action and one demand that is not the founding story `/about` already tells |
| **Monsoon Wooding** | **row** → `/work/campaigns#monsoon-wooding`, and the row nearest to a page | ~5,000 trees a year in Delhi NCR · **50,000+ planted and survived** · 5 named funders · 4 planting frames | ledger hole 4 — *where are the sites, and how is "survived" counted?* The honesty of that verb is the best thing on the campaigns band and nobody can currently explain it. Answered, this is a page |
| **Delhi I Can't See You** | **row** → `/work/campaigns#delhi-i-cant-see-you`, **not yet** | **Nothing.** The name entered the project as a designer's poster line on 19 August and the owner adopted it on 21 August, so it has authority as a *name* and nothing else | ledger hole 4 — start date, demand, one nameable action. Note D-18.2 already promises this page and `situation-air.html` already asserts *"Delhi I Can't See You is Swechha's campaign on this"* — the strongest claim on the site about a campaign nobody has described (question 1) |
| **Events — all four** | **one page, no detail pages** | four names. No date, edition, count, location or description anywhere on disk, for any of the four | ledger hole 8 — one line each, plus access to three sign-in-blocked Drive folders. **Until then the one-page ruling is not an economy, it is the only honest option** |

**Count: 8 own pages · 6 rows · 4 events on one page. Zero campaign detail pages.**

That last number is the honest reading of the evidence and it should not be softened.
Three campaigns hold two sourced figures between them, both belonging to Monsoon Wooding;
`content/campaign/` holds one file and it is a situation bulletin, so the live campaigns
route today publishes none of the three. §5C composes a landing page that is *about* that
rather than hiding it.

**One deletion the build must honour, from the ledger's §2.5.** `project-bridge-the-gap.html`
carries **25,000+ children · 85+ schools · 1,200+ young mentors · 12 cities** under the
caption *"Figures verified by Swechha"*. None of the four exists in any source or ruling,
the file it cites is not in the repository, and the page frames the programme as
learning-poverty work where every source says environment curriculum. **Those four figures
may not appear on any page in this section**, and the unstamped prototype is evidence of
past work, never a content source. Same rule for `content/story/delhi-air-victory.md`,
whose claimed policy victory is unsupported and is the same class of claim as the
fabricated court citations D-11.1 cut from the air page.

---

## 4. The cross-sell system — ONE component, specified once

The owner's phrase is *"upselling and crossselling other things on each page"*. Specified
once here; **every page in the section instantiates it identically.** Per-page
improvisation is out of contract.

**It is one band, `#onward`, the last band before the footer on all thirteen pages, and it
adds no new component** — it is the door cards (BRANDING §5.6) plus the CTA family (§5.8),
arranged.

### The four slots, in a fixed order

| # | slot | on a landing page | on an item page |
|---|---|---|---|
| 1 | **Same kind** | the other **three kinds** | up to **3 sibling items**, each with its fact line |
| 2 | **The situation it answers** | the kind's situation, if one applies | that item's situation |
| 3 | **The evidence** | `/#record` | `/#farm` if the work happens at the farm, else `/#record` |
| 4 | **One act** | the kind's own next step | Book a walk · Bring your school · Plant with us — falling back to `/act` |

### The ordering rule

**Nearest first: same kind → the situation → the evidence → the act.** The act is always
last because it is the only slot that asks the reader for something. The order never
changes, so a reader who has seen one WORK page knows where the doors are on all of them.

### The honesty rule, in four clauses

1. **A slot renders only if its destination exists.** No slot may point at a URL that does
   not resolve at build time. A door to a page that does not exist yet is a defect, not a
   placeholder — checked by the §7.4 manifest gate, not by reading markup.
2. **A row's door uses the row's anchor**, never the bare landing page. Five rows sharing
   one destination is what makes homepage band 6 feel broken today.
3. **A situation door may only be used where the situation page names the same subject.**
   Verified this session — all seven situation pages present, in the frozen font pair, with
   constant `<h1>`s and **zero** selective-colour refs: `air`, `yamuna`, `heatwave`,
   `forest-fire`, `forest-loss`, `climate-event`, plus `situation-soon.html` as the honest
   not-built-yet page. The claims permitted: **Air ↔ Delhi I Can't See You** ·
   **Yamuna ↔ We for Yamuna, Yamuna Yatra, Yamuna Shramdaan** · **Forest loss ↔ Monsoon
   Wooding**. Nothing else is claimed, and an item with no situation renders no slot 2 — an
   absent relationship is not a hole to name.
4. **Slot 1's count flexes and no numeral names the set** (D-03.2). One, two or three
   siblings paint; at zero the slot does not render. No "3 more projects".

### Shape

- **1440:** slots 1–3 as three `.door` columns, `repeat(3,minmax(0,1fr))`, divided by
  `border-right` with the last cleared, rows `auto auto 1fr auto` so the figure rows
  bottom-align across all three regardless of copy length — the §5.6 contract unchanged.
  Slot 4 sits beneath a hairline as the band's one `.b-1`.
- **375:** the three doors become three full-width hairline-ruled rows, ≥44px each, then
  the `.b-1` full width. Same order, same content, no disclosure control, no accordion.
- **Ground `#ECEBE8` (paper-2), tier T3**, with one rule attached: **the band above
  `#onward` must be dark.** One rule, no branch; it keeps the `#onward` → `#151512` footer
  boundary clean and it makes the section's close read as *doors on paper* rather than a
  fifth dark band.
- **Mustard appears only as the `.b-1` fill.** No WORK page gets a mustard ground — mustard
  is a ground exactly once site-wide, `#give` on the homepage. **This kills the mustard
  flood `.close` band that all eleven pre-freeze pages carry.**

### The one licensed inline cross-sell

Beyond `#onward`, exactly one, and it already exists on the frozen homepage: the **`.lbl`
pre-line hook above an item's name** — *"Runs against Delhi's air →"* sitting above
`Delhi I Can't See You` in band 7. An item may carry one. No other inline cross-sell is
licensed, and no page gets a mid-page "you might also like".

---

## 5. Band sequence per page type — adjacency checked mechanically

Four grounds: `#0D0D0B` T1 · `#151512` T3/T4 · `#F3F2F0` paper T2 · `#ECEBE8` paper-2 T2.
Footer `#151512`. The adjacent-pair check was run on every chain below.

### A. `/work` — the front door · 6 bands + footer

| # | id | ground | tier | job |
|---|---|---|---|---|
| 1 | `top` | `#0D0D0B` | T1 | masthead over a halftone photograph — display type only on the frame |
| 2 | `kinds` | `#F3F2F0` | T2 | the four kinds, one line each, four ragged rule-ends — extends band 4's device |
| 3 | `projects` | `#151512` | T3 | the seven projects at register density |
| 4 | `public` | `#ECEBE8` | T2 | campaigns and events together, as on the homepage |
| 5 | `journeys` | `#0D0D0B` | T2 | the four routes, duration-first |
| 6 | `onward` | `#ECEBE8` | T3 | the cross-sell system |
| — | footer | `#151512` | — | frozen, verbatim |

**`/work` carries no photograph except its masthead, and register rows only** — no
readings, no reading pairs. That is what stops it becoming a second homepage, and it is
what gives the four kind pages something to be for: same items, different density.

### B. Kind landing — `/work/projects`, `/work/journeys` · 5 bands + footer

| # | id | ground | tier | job |
|---|---|---|---|---|
| 1 | `top` | `#0D0D0B` | T1 | masthead over a halftone photograph, plus the `← WORK` ancestor line |
| 2 | `frame` | `#F3F2F0` | T2 | what this kind *is*, and what distinguishes it from the other three |
| 3 | `list` | `#151512` | T3 | the register — every item, its anchor `id`, its fact line, its destination |
| 4 | `weight` | `#0D0D0B` | T2 | the kind's figures, each with its period and its measured/modelled rule |
| 5 | `onward` | `#ECEBE8` | T3 | the cross-sell system |
| — | footer | `#151512` | — | frozen, verbatim |

Pairs: 0D/F3 ✓ · F3/15 ✓ · 15/0D ✓ · 0D/EC ✓ · EC/15 ✓. **Zero clashes.**
*(The first draft of this chain put `weight` on `#ECEBE8` and clashed with `onward`. Fired
on the mechanical check, recorded rather than silently fixed — the check earns its place.)*

### C. `/work/campaigns` — the weakest kind, composed honestly · 5 bands + footer

Three items, two figures, no detail pages. The page's subject is therefore not *our three
campaigns* but **what each campaign pushes against** — which turns the section's thinnest
content into the site's clearest statement of the work↔situation reciprocity D-18.2 asked
for.

| # | id | ground | tier | job |
|---|---|---|---|---|
| 1 | `top` | `#0D0D0B` | T1 | masthead over a halftone photograph + `← WORK` |
| 2 | `frame` | `#F3F2F0` | T2 | what a campaign is here — the frozen band 7 line *"A campaign pushes. An event invites."* is the register to extend |
| 3 | `against` | `#151512` | T3 | **the three campaigns, each paired with its situation door.** The march composition from frozen band 7, at page scale: the mark above the name, the name as the band's ink, one door out to `situation-yamuna` / `situation-air` / `situation-forest-loss` |
| 4 | `holes` | `#0D0D0B` | T2 | **what we cannot yet say**, as content: Monsoon Wooding's survival method, We for Yamuna's own record, and what Delhi I Can't See You is. Named holes, in the frozen grammar |
| 5 | `onward` | `#ECEBE8` | T3 | the cross-sell system |
| — | footer | `#151512` | — | frozen, verbatim |

Band 4 is the page's strongest band and it is the one nobody would have designed on
purpose. It is also the fastest thing on the site to retire: three sentences from the owner
(ledger hole 4) turn it into three campaign pages.

### D. Item detail · 6 bands + footer

| # | id | ground | tier | job |
|---|---|---|---|---|
| 1 | `top` | `#0D0D0B` | T1 | masthead. `<h1>` is a **constant naming the item** (D-10.2), never a reading |
| 2 | `what` | `#F3F2F0` | T2 | what it is, and the reading pair — every figure with its period |
| 3 | `how` | `#151512` | T3 | how it actually runs: the days, the sessions, the route, the season |
| 4 | `done` | `#ECEBE8` | T2 | what it has done, with the named holes stated as content |
| 5 | `with` | `#0D0D0B` | T2 | who it is with — schools, partners, funders, by name |
| 6 | `onward` | `#ECEBE8` | T3 | the cross-sell system |
| — | footer | `#151512` | — | frozen, verbatim |

Pairs: 0D/F3 ✓ · F3/15 ✓ · 15/EC ✓ · EC/0D ✓ · 0D/EC ✓ · EC/15 ✓. **Zero clashes.**

**The type-only masthead variant.** Eco Action, ME to WE and — until Swechha frames exist
— NatureScapes have no usable photograph (§8). Band 1 on those pages is the same
`#0D0D0B` T1 band with **no frame at all**: display `<h1>`, deck, ancestor line, and the
missing picture stated in band 4 rather than faked in band 1. It is not a new component,
it is `.im-head` at T1 scale. **A page without a photograph is honest; a page with a stock
photograph is not.**

### E. `/work/events` — the hardest brief in the section · 4 bands + footer

Four names and nothing else, for all four. **Solved by changing what the page is about**:
not four events, but what happens when Swechha goes public. The thinnest content on the
site becomes the most honest page on it.

| # | id | ground | tier | job |
|---|---|---|---|---|
| 1 | `top` | `#0D0D0B` | T1 | masthead over a crowd photograph. `<h1>` **EVENTS**; the deck states the record framing |
| 2 | `record` | `#F3F2F0` | T2 | the four names, each a ruled row at display scale carrying one written line saying what kind of gathering it is. **No dates, editions, years or counts** |
| 3 | `nodates` | `#151512` | T3 | **the named hole as content**: why there are no dates here, and exactly what appears when there are — an edition, a place, a way to turn up |
| 4 | `onward` | `#ECEBE8` | T3 | the cross-sell system |
| — | footer | `#151512` | — | frozen, verbatim |

Pairs: 0D/F3 ✓ · F3/15 ✓ · 15/EC ✓ · EC/15 ✓. **Zero clashes.**

Three things this page must **not** do, all of which `events-landing.html` does today —
captured at 1440 and read:

- an **"Upcoming."** band reading *"Nothing scheduled right now"* — a calendar frame around
  a set the owner ruled is a record;
- an **email capture form**, twice. A form that accepts an address it cannot store or email
  is the one genuinely dishonest thing a page can do (D-22.2);
- **"Description, dates and documentation to come"** under two empty *FRAME TO COME* boxes,
  promising dates that must not exist — and its names are wrong anyway: **Townhalls** and
  **Remakery Workshops** instead of **Cyclothon** and **Greenathon**.

**Count-independence:** ruled rows hold four names or twelve with no designer intervening,
and band 2 states no total (D-03.2, §7.8 of the forbidden list).

### Per-band budget

The 900px-at-375 per-band cap applies to every band above; only the homepage's `record`
holds a licence (D-09.7) and no WORK band inherits it. Measured this session at 1440×900
for reference: the frozen homepage is **10,906px**, and its four WORK bands are `work`
**1,013.83** · `journeys` **1,058.08** · `projects` **1,112.66** · `campaigns` **1,009.78**
— **4,194.35px for the chapter**. A kind landing is one of those bands at depth plus four
more. Budget it; do not assume it.

---

## 6. The build vehicle — prototype-first, and generated

The Next.js app and the frozen language are two different products today: the frozen
language exists only in `public/design/v3/*.html`, and `/work` is 49 lines of Tailwind
whose Projects section reads *"Project profiles are being written — nothing published
yet."* Verified over HTTP this session: `/work` 200 · `/work/campaigns` 200 ·
**`/work/projects` 404 · `/work/journeys` 404 · `/work/events` 404 ·
`/work/projects/bridge-the-gap` 404.**

**Recommendation: build the thirteen pages as frozen-language prototypes, from a
generator, and treat the Next.js port as the next named job.**

1. **Generated, not hand-written — the part I would argue hardest for.** The branding
   document is explicit that every page carries its own `<style>` and a fix does not
   propagate; that is why `situation-air.html` still held three defects the homepage had
   already cured. Thirteen hand-copied pages is that mistake at thirteen times the scale.
   Air already solved it: `scripts/build-situation-air.mjs` extracts the token and chrome
   layer out of `home.html` **line by line, with `R()` assertions**, so the drift set is
   closed by construction (D-10.3, D-22.3). One `scripts/build-work-pages.mjs`, one data
   file per item, thirteen outputs, four gates — extraction assertions · ground adjacency
   **on composited rendered colour, not class names** · `node --check` on the whole page
   script · data-shape asserts. A page in this section should be impossible to drift, not
   merely audited for drift.
2. **Cross-linking is still verifiable now.** The prototypes carry the **canonical**
   `/work/...` hrefs — never `#`, never a `/design/` path — and the generator emits a
   `LINKS.json` manifest of every href it wrote, checked against the route map and the
   anchor registry. So the links are already correct on the day the routes exist and the
   port needs no link rewriting.
3. **What option 2 costs.** Going straight into Next.js means answering, for the first
   time, *what carries the design language across pages* — a real shared stylesheet plus a
   layout component — **and simultaneously** deciding the fate of the Tailwind system on
   the nine routes that use it (`/work`, `/work/campaigns`, `/impact`, `/about`, `/act`,
   `/now`, `/explore`, `/stories`, `/search`). **And it hits a third thing:** the content
   layer cannot model two of the four kinds. `lib/content/types.ts` defines `project`,
   `story`, `knowledge`, `film`, `campaign` — **no `journey`, no `event`** — `content/project/`
   is empty for seven named projects, and the single `content/campaign/` file is a
   situation bulletin. So the routes option is a platform migration plus a content-model
   change plus a design build. Run inside this brief, all three fail together and none can
   be signed off without the others.
4. **The consequence, stated plainly.** `public/design/` is deleted before any deploy, so
   **the section is not live until the port**, and the four 404s stay 404 until then. I
   recommend **no interim redirects**: `/work/projects` → `/work` is a lie about where
   projects live.
5. **If the owner wants it live sooner**, the honest sequence is: prototypes → approve →
   port the **five landing pages**, which closes every 404 and every nav destination in §2
   → port the eight item pages. The landings are the half the homepage is already pointing
   at; the item pages are the half that can wait.

---

## 7. The link contract — the table the build is checked against

From `2026-08-21-AD-17-link-contract.md` §2–§3, with this architecture's destination
filled in. **No `href="#"` appears in this table and none may be added** — the nine
existing ones belong to P-1 and are out of scope.

### 7.1 The frozen homepage

| # | source | element clicked | destination | exists today |
|---|---|---|---|---|
| 1 | nav ×3 | Now | `/now` | ✅ |
| 2 | nav ×3 | **Work** | **`/work`** | ✅ |
| 3 | nav ×3 | **Journeys** | **`/work/journeys`** | ❌ build |
| 4 | nav ×3 | Impact | `/impact` | ✅ |
| 5 | nav ×3 | **Farm** | **`/#farm`** | ✅ |
| 6 | nav ×3 | **Record** | **`/#record`** | ✅ |
| 7 | nav | Give chip | `/act` | ✅ |
| 8 | band 4 | Projects | `/work/projects` | ❌ build |
| 9 | band 4 | Campaigns | `/work/campaigns` | ✅ route, wrong content — Q5 |
| 10 | band 4 | Journeys | `/work/journeys` | ❌ build |
| 11 | band 4 | Events | `/work/events` | ❌ build |
| 12 | band 4 | "The whole list" | `/work` | ✅ |
| 13 | band 5 | card 01 Yamuna Yatra | **`/work/journeys/yamuna-yatra`** | ❌ build |
| 14 | band 5 | card 02 Gram Anubhav | **`/work/journeys/gram-anubhav`** | ❌ build |
| 15 | band 5 | card 03 NatureScapes | **`/work/journeys/naturescapes`** | ❌ build |
| 16 | band 5 | card 04 CityScapes | **`/work/journeys/cityscapes`** | ❌ build |
| 17 | band 5 | tabs 01–04 | `#w7-jr-1…4` — in-page, unchanged | ✅ |
| 18 | band 5 | "Every route" | `/work/journeys` | ❌ build |
| 19 | band 6 | 01 Bridge the Gap *(the photograph)* | `/work/projects/bridge-the-gap` | ❌ build |
| 20 | band 6 | 02 Farm School | `/work/projects/farm-school` | ❌ build |
| 21 | band 6 | **03 Eco Action** | **`/work/projects/eco-action`** | ❌ build |
| 22 | band 6 | **04 ME to WE** | **`/work/projects/me-to-we`** | ❌ build |
| 23 | band 6 | **05 Influence** | **`/work/projects#influence`** | ❌ build |
| 24 | band 6 | **06 She Leads Change** | **`/work/projects#she-leads-change`** | ❌ build |
| 25 | band 6 | **07 Food systems, with UNEP** | **`/work/projects#food-systems`** | ❌ build |
| 26 | band 6 | "More projects" · "All the projects" | `/work/projects` — bare is correct, it means the whole list | ❌ build |
| 27 | band 7 | **We for Yamuna** | **`/work/campaigns#we-for-yamuna`** | ✅ route |
| 28 | band 7 | **Monsoon Wooding** | **`/work/campaigns#monsoon-wooding`** | ✅ route |
| 29 | band 7 | **Delhi I Can't See You** | **`/work/campaigns#delhi-i-cant-see-you`** | ✅ route |
| 30 | band 7 | "Runs against the Yamuna →" | `situation-yamuna.html` | ✅ |
| 31 | band 7 | "Runs against Delhi's air →" | `situation-air.html` | ✅ |
| 32 | band 7 | "More campaigns" · "All the campaigns" | `/work/campaigns` | ✅ |
| 33 | band 7 | "and more →" · "All the events" | `/work/events` | ❌ build |
| 34 | footer *Read* | "Projects and campaigns" | **`/work`** *(was `#work`)* | ✅ |
| 35 | footer *Go* | Yamuna Yatra | **`/work/journeys/yamuna-yatra`** *(was `#journeys`)* | ❌ build |
| 36 | footer *Go* | NatureScapes | **`/work/journeys/naturescapes`** | ❌ build |
| 37 | footer *Go* | CityScapes | **`/work/journeys/cityscapes`** | ❌ build |
| 38 | footer *Go* | Gram Anubhav | **`/work/journeys/gram-anubhav`** | ❌ build |
| 39 | footer *Reach us* | "Swechha Farm visits" | **`/#farm`** *(was `#farm`; absolute, so it works from every page)* | ✅ |

**Also owed, and outside the homepage:** `situation-air.html`'s campaign link — the page
asserts *"Delhi I Can't See You is Swechha's campaign on this"* — must land on
`/work/campaigns#delhi-i-cant-see-you`, not on a stub page. It is generated, so the change
is in `scripts/build-situation-air.mjs`, not in the HTML.

### 7.2 The anchor registry — every row that is not a page

These `id`s must exist in the built markup or rows 23, 24, 25, 27, 28, 29 are dead links.

| anchor | on page |
|---|---|
| `#influence` · `#she-leads-change` · `#food-systems` | `/work/projects` |
| `#we-for-yamuna` · `#monsoon-wooding` · `#delhi-i-cant-see-you` | `/work/campaigns` |
| `#yamunotsav` · `#cyclothon` · `#greenathon` · `#yamuna-shramdaan` | `/work/events` |

**Every register row on every landing page carries `id="<slug>"`, whether or not it has a
detail page.** So a row link always lands on itself and the reader can tell.

**The arrival mark introduces no colour.** `:target` on a register row takes its own
hairline from `--rule` to `--rule-2` weight and its title to full `--ink` / `--fg`. **No
hue** — the hue system is closed and a row is not a control. The existing
`html,body{scroll-padding-top:var(--nav-h)}` token already lands the row correctly under
the header on both paths, cold hash and same-page click.

### 7.3 Every new page's outbound links, by page type

| on | element | destination |
|---|---|---|
| all 13 | nav ×3 surfaces | the six §2 destinations |
| all 13 | `SECTIONS` panel | that page's own band anchors |
| all 13 | Give chip | `/act` |
| all 13 | footer | verbatim from `home.html`, with rows 34–39 applied |
| all 13 | `#onward` slot 1 | sibling items, or the other three kinds |
| all 13 | `#onward` slot 2 | a situation page per §4 clause 3, or nothing |
| all 13 | `#onward` slot 3 | `/#farm` or `/#record` |
| all 13 | `#onward` slot 4 | the page's act, or `/act` |
| landings 2–5 | ancestor line `← WORK` | `/work` |
| landings 2–5 | each register row | its item page, or its own `#slug` |
| items 6–13 | ancestor line `← <KIND>` | that kind's landing |

### 7.4 The gate

Done means: **enumerate every `href` attribute in all thirteen files and resolve each one**
against the route map and the anchor registry, at 375 and 1440, in every open and closed
state of the `SECTIONS` panel. Not by reading markup and believing it. Zero `href="#"`
added. Every one of rows 13–16, 21–25 and 27–29 lands somewhere that is *about the thing
that was clicked*.

---

## 8. Copy, photography and placeholders

### Copy — licensed, with a hard edge

**Licensed:** headlines, ledes, section titles, connective lines, and fact lines where no
document supplies one. Written in the register the homepage established — plain, concrete,
unsentimental, the X-is-not-Y grammar (*"A number is not a smell"*, *"Four kinds of work.
Not four departments."*, *"A campaign pushes. An event invites."*), young without
performing youth. **Prefer a sourced phrase to an invented one**: *"planted and survived"*,
*"from where it originates and is pristine, down to the point where it reaches Agra and is
almost a toxic body of water"*.

**Not licensed, unchanged:** figures, dates, editions, counts, partners, claims. An
unsourced number is a named hole. Grep every built file for `today`, `now`, `currently`,
`this year`, `as of`, month names and `20\d\d` — every hit is cut, computed from local
`Date` getters, or a sourced constant like "since 2000".

### Photography — three refusals and a gate

1. **No stock and no Wikimedia frame on any WORK page.** NatureScapes' five destination
   frames are Unsplash (Ranthambore, Corbett, Mukteshwar, Jaisalmer, Sunderbans); built
   from them, the page reads as a tour operator's brochure, which is the opposite of what a
   "60+ journeys organised" claim needs beside it. The two Wikimedia frames already
   self-tagged `placeholder` are situation frames and stay there.
2. **No frame without a library entry.** 36 of 89 files have no `content/photo-library.json`
   entry — including **all 13 `cityscapes-*` and all 12 `gram-anubhav-*`** — so no alt, no
   credit, no consent note. **Treat an unentered frame as unavailable** until it is entered.
   That is a gate on two of the four journey pages and it is cheap to clear.
3. **No frame the homepage is simultaneously presenting as an empty archive box.** The
   record sheet's 25 hatched placeholder cells reuse journey and project frames; a WORK
   page reusing one would contradict the homepage on the same scroll.
4. **The four consent-unresolved frames of identifiable children are not used, and I am not
   designing around them.** The lead is raising it with the owner. Note only that Bridge the
   Gap's own prototype already refuses a schools photograph in its hero for this reason, so
   any WORK page wanting a school frame meets the same question.

**Where an item has no usable frame, the page takes the type-only masthead (§5D) and states
the missing picture as content.** Naming a hole is content, not an apology.

### A placeholder photograph, specified so it can never be mistaken for a real one

The frozen grammar exists (D-07.14, BRANDING §4.1 and §4.4) and is reused verbatim:

- the frame takes **`.duo-dim`** — the flatter, sepia ramp — never `.duo`;
- the **hatch stays over the photograph**;
- a **dotted** 1px outline on the frame. **Dotted means placeholder; dashed means a shut
  window, and dashed may never be used here**;
- a chip reading **`PLACEHOLDER`**, inverted against the frame — paper ground, ink type,
  dotted border, in `.tag-demo`'s vocabulary;
- **alt text describes what the frame actually shows and never claims what it stands in
  for.** No placeholder gets a year, a place or an event it is not from;
- **a floor.** The chip is ~37.7 × 21.5px, so it may only mark a frame wide enough to hold
  it. Below ~60px the frame does not render at all and the gap is stated **in words**. This
  is the arithmetic that licensed `record` at D-09.7 — a marker wider than the thing it
  marks is worse than no image.

---

## 9. What I deliberately refused

1. **One page for the whole section** — `/work` absorbing all four kinds as anchors, 9
   pages instead of 13. Genuinely more minimal, and it is what D-18.3's *"keep the website
   as lean as possible, not add layers and subpages"* points at. Refused on three
   measurements: the frozen homepage points **8 links at `/work/projects`** and 6, 6 and 3
   at the others, so twenty-three links would collapse onto one page; the owner's own URL
   convention names four kind pages; and four kinds at landing depth exceeds the homepage's
   entire WORK chapter, measured at **4,194px at 1440** for four bands. Recorded so it is a
   refusal, not an oversight.
2. **Detail pages for the three thin projects and all three campaigns.** A stub is worse
   than a rich row, and §3 names per item exactly what earns each one. **Zero campaign
   detail pages is the honest count today** and §5C composes a landing page that says so.
3. **Any event detail page**, at any count. Closed ruling, and the ledger confirms it is
   also the only honest option: four names, no date, edition, count or description anywhere
   on disk.
4. **The mustard close band** all eleven pre-freeze pages carry. Mustard is a ground exactly
   once site-wide.
5. **Every email capture form** on the pre-freeze pages — the footer's and the events
   "Upcoming" band's. A form that accepts an address it cannot store or email is the one
   genuinely dishonest thing these pages could do.
6. **The pre-freeze icon sets** — 13+ on `journeys-landing` alone, plus four platform-logo
   circles in its footer. The only non-type marks the site permits are the `→`, the
   six-band scale and the halftone.
7. **Selective colour**, live on all eleven at six filter references each.
8. **A new component for the cross-sell.** It is `.door` + `.b-1`, arranged.
9. **A reveal / IntersectionObserver system**, and `.rise` on any WORK band. This section
   carries what the organisation does; it cannot be one observer failure away from
   invisible, and the shared script still has no `setTimeout` net.
10. **A detail page for Green the Map**, whose own frozen band says *"It is not a Swechha
    programme"* and links out to `greenthemap.com`. Same for **Low Carbon Futures** and
    **CYCLES for Sustainability** — real partners and real subjects, but research is not
    one of the four kinds; they belong to Explore, not Work. **CineGreen** and **Ride the
    Van** are not pages either — they are the best unused material *inside* the Bridge the
    Gap page.
11. **Temporary redirects for the four 404 routes.** `/work/projects` → `/work` is a lie
    about where projects live. The port is the fix.
12. **Designing a band composition in detail.** Out of scope for phase 1; §5 stops at
    id / ground / tier / job deliberately.

---

## 10. Client questions — only where a different answer changes the work

1. **"Delhi I Can't See You" is in neither source document.** The repo shows the name
   entered as a designer's poster line on 19 August, became a campaign row on 20 August,
   and you named it as one of three live campaigns on 21 August — so it has authority as a
   name and nothing else: no description, date, figure, partner or photograph. Meanwhile
   D-18.2 promises a campaign page and `situation-air.html` already tells readers *"Delhi I
   Can't See You is Swechha's campaign on this"*. **What is it?** Until you say, it is a row
   with a named hole and the situation page's link lands on that row.
2. **"Spotted. Stop It!" is live on swechha.in and appears nowhere in this repository** —
   and the sources carry a *different* name, **"Spotted — War against Waste"**. Two
   questions: is it live, and what is it called? Same for **Right to Education**, sourced
   and on no page.
3. **Four of the five project prototypes are demo-stamped, not two** — and the unstamped
   one is the dangerous one. `project-bridge-the-gap.html` carries **25,000+ children · 85+
   schools · 1,200+ young mentors · 12 cities** under *"Figures verified by Swechha"*, none
   of which exists in any source, and frames the programme as learning-poverty work.
   **Confirm those four figures are withdrawn.** Bridge the Gap is rich without them.
4. **`journeys-landing.html` is LOCKED (2026-08-19) in a superseded language.** Measured:
   Fraunces + Instrument Sans against the frozen Archivo + Newsreader; grounds
   `#0F0F0E`/`#F7F4ED`/`#F1EBDD` against the frozen four; selective colour live; an icon
   set; a mustard flood band; an email form; and **not one figure on any of its four journey
   cards** — the frozen homepage's journeys band carries more sourced fact than the locked
   landing page does. D-10.4 says the homepage wins. Confirm the lock is superseded and the
   page is rebuilt in the frozen language, keeping its content architecture, which is good.
5. **`/work/campaigns` is occupied by the wrong content type.** The only campaign content
   file, `content/campaign/delhi-air-quality-2026.md`, is an *environmental situation* — AQI
   347, `liveData.mock: true`, "thirteen stations" — and the route's own copy reads *"every
   significant environmental situation Swechha tracks"*. Its subject is already covered by
   `situation-air.html`, on real data. Confirm: **campaigns means Swechha's campaigns**,
   situations live on the Situations track, and that file is retired. Related:
   `content/story/delhi-air-victory.md` claims a policy victory no source supports — confirm
   it is not campaign evidence.
6. **Farm School and Swechha Farm are one place.** Confirm the split:
   `/work/projects/farm-school` is the **programme** (day visits, short courses, the 5 C's,
   internships) and the **place** stays `/#farm` with its own inner page. Otherwise two
   pages describe the same five acres, the same nursery and the same apiary.
7. **How is "planted and survived" counted, and where are the sites?** It is the best verb
   on the site and the 50,000+ figure is Monsoon Wooding's only reading. Answered, that row
   becomes the section's fourteenth page immediately.
8. **Events: one line each, and the Drive folders.** *What happens at it, and roughly how
   many editions have run* — for Yamunotsav, Cyclothon, Greenathon and Yamuna Shramdaan.
   Plus access to `Campaigns/Yamunotsav`, `Cyclothon` and `Shramdaan`, recorded as sign-in
   blocked. One line each turns a strip of four names into four rows with content. Without
   it, the page ships as §5E — which I recommend either way.
9. **The nav change.** Confirm §2: six words, six absolute destinations, `Work → /work` and
   `Journeys → /work/journeys`. **Cost is 15 `href` values in the frozen homepage** — five
   labels × three nav surfaces — plus the Give chip. Nothing visual moves. This is the one
   frozen-file edit the architecture requires, and it is exactly the thing you asked about.

**Two answers that would upgrade a row to a page the same day**, if you would rather answer
one thing than nine: **Influence** — *what is the fellowship year?* (ledger hole 3) — and
**Monsoon Wooding** — question 7. Each is one paragraph and each buys a real page.

---

## 11. Method — what was measured, and how

- Dev server: the existing one on port 3000, already running from another session. **A
  second was not started.**
- Captures: CDP `Emulation.setDeviceMetricsOverride` only, `deviceScaleFactor 1`, every
  image flipped to `eager` and decoded, target scrolled through before the shot. **Never a
  bare `--window-size`.** Harness in the session scratchpad, not the repo.
- **Read as PNGs at 1440×900:** `journeys-landing.html` (3,249px), `projects-landing.html`
  (2,808px), `events-landing.html` (3,116px), and the frozen homepage's `#work`, `#projects`
  and `#campaigns` bands.
- Route existence: HTTP status over the running server (§6).
- Typefaces, grounds, filter references, demo stamps and nav hrefs: attribute and
  computed-style enumeration, not reading markup and believing it.
- **Nothing in this repository was modified except this file.**
