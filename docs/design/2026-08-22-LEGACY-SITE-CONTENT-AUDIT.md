# Legacy site content audit — what is on swechha.in that is not on the new site

**Date:** 2026-08-22
**Method:** full crawl of `swechha.in`. All eight content sitemaps pulled
(`page`, `post`, `project`, `profile`, `pj-categs`, `pl-categs`, `post_tag`,
`post-archive`), then all 80 page/project/profile URLs fetched as HTML and
converted to text, and all 146 posts pulled through
`/wp-json/wp/v2/posts` (the `project` and `profile` post types 404 on the REST
API, so those were scraped from rendered HTML). Every document link was
HTTP-checked. Counter figures were read out of the Brizy
`data-brz-end` attributes, because the visible numbers are animated from zero
and do not appear in the DOM text.

**The legacy inventory, exactly:** 19 pages, 45 project pages, 16 profile
pages, 146 posts. Nothing else — the remaining sitemaps are attachments,
taxonomies and one empty archive.

**The new site, for comparison:** 30 built pages under `public/_pages/v3/`,
23 work items in `data/work/**`, 148 indexed videos, 0 written stories,
2 publications.

---

## 1. THE FIVE THINGS WORTH TAKING

### 1.1 Eleven annual/activity reports — the transparency record. Nothing on the new site.

`grep -ri "Activity Report" public/_pages/v3 data` returns **nothing**. The old
About page has a `#transperancy` section listing eleven of them plus four
project reports and two statutory certificates.

Recoverable and public (HTTP-verified 2026-08-22):

| Document | URL | State |
|---|---|---|
| Activity Report 2011–2013 | `swechha.in/wp-content/uploads/2016/06/Activity-Report-2011-2013.pdf` | 200, 92 KB |
| Activity Report 2013–14 | `…/2016/06/Activity-Report-2013-14.pdf` | 200, 275 KB |
| Activity Report 2014–15 | `…/2016/06/Activity-Report-2014-15.pdf` | 200, 277 KB |
| Activity Report 2016–17 | `…/2020/04/Swechha-Annual-report-2016-17.pdf` | 200, 160 KB |
| Annual report 2020–2021 | Drive `15PV_IedTKuP8LyjLd3S4cwutIUrzsZkU` | public |
| Annual report 2022–2023 | Drive `1bToey3M9tOZaGrR4tqDrJdkPeEOJEbIV` | public |
| Annual report 2023–2024 | Drive `15l7xbkamx6rin4i3s6NUQ4Ptr3fNVYvq` | public |
| Annual report 2024–2025 | Drive `1xuuruZffmSuY6HOE0BeRJP_9LhZnZiVs` | public |
| Influence Annual Report 2012–2013 | `…/2016/06/INFLUENCE-ANNUAL-REPORT-2012-2013.pdf` | 200, 576 KB |
| Me to We Final Report 2014 | `…/2016/06/Me-to-We-_Final-Report-2014.pdf` | 200, 111 KB |
| NSN–BTG Final Report | `…/2016/06/NSN-BTG_-final-report.pdf` | 200, 1.3 MB |
| 80G certificate | `…/2020/04/Tax-Residency-Certificate-80G.pdf` | 200, 118 KB |

**Two defects in the old page, both of which must be fixed rather than
inherited.** First, *every one of those `wp-content` links on the live About
page points at `http://q7s.734.mytemp.website/…`*, a staging domain that
301s to nothing — so on swechha.in today the whole report shelf is broken, and
only the `swechha.in` rewrite of the same path resolves. Second, five of the
listed files are gone at both hosts (404): **Annual Report 2015–16, Annual
report 2017–18, Annual report 2018–2019, Me-to-We report 2015–16, and the
Registration Certificate.** There is also no 2019–20 or 2021–22 report listed
anywhere.

So the recoverable, verifiable record is 8 files on swechha.in + 4 on Drive.
Report the gap years as gaps; do not paper over them.

### 1.2 Six real publications. `/publications` currently says there are two.

`data/publications.json` opens with `"h1": "Two we<br>printed."` and the ruling
that Publications carries the KHD book only. The old **Resources** page carries
six more documents, all Drive-hosted and public, all uploaded August 2025 —
i.e. current, not archive:

- **NatureScapes Manual — Sirmaur** (`1cJD5hCL7MZk7kwf104q992i8Q_sf55Rw`)
- **NatureScapes Manual — Sariska Tiger Reserve** (`1zJSbwYdNQs5P--xlnj86L1oVI8aCnJs0`)
- **Yamuna Manual** (`1k56jWyb-qA7Sv9Ge4HbpqyZALRFVBQTu`)
- **CineGreen Manual** (`1cqmTmsGKuYpAiWr7AtV4oeDTP920AcjG`)
- **IGES New Delhi Scenario** (`1sWi-QO8Tn5fzI4dQ4yUWAWg2DuFioFz8`) — the
  co-produced low-carbon-lifestyles scenario research for New Delhi
- **New Delhi Brochure** (`1eSI4cOX4f32SeEJo3epndcSPbtbinNfx`)

These are field manuals and one research report, not marketing. The IGES
scenario in particular is the only piece of primary research the organisation
published, and it belongs next to the situation pages, not lost on a Resources
page whose own headings ("MANUALS & RESEARCH PAPERS") render as unlabelled
thumbnails.

**This is a ruling question, not a build question:** AD-26 R-1/R-2 fixed
Publications at two items on the evidence then available. Six more real files
have now been found. R-2's withdrawal of the "This Girl Can book" stands — no
file was found for it here either.

### 1.3 Six long-form bylined essays. `/stories` "Written" is empty and unpublished.

`data/stories.json` → `written.publish = false`, lead "There are none finished
yet", and the honest note that the three drafts in `content/story/` carry no
sources and one makes a fabricated claim. Meanwhile the old blog has genuine
signed long-form:

| Piece | Date | Length |
|---|---|---|
| High Time Young People Accelerate Climate Action | 2022-09-07 | 8.3 KB |
| Climate crisis in the UK and Europe | 2022-08-15 | 7.4 KB |
| Cyclone Biparjoy: Learning from the Past to Strengthen Disaster Management | 2023-08-14 | 5.7 KB |
| Rise Above the Waters: Charting a Course to Resilience | 2023-08-07 | 5.4 KB |
| Increasing Climate Migration due to Assam Floods | 2022-08-14 | 4.9 KB |
| Learning to grow with Swechha | 2018-07-24 | 2.5 KB |

These are the best single find in the crawl: they fill the one section of the
new site that is currently admitted to be empty, and they are the organisation's
own bylined writing, so republishing them is a re-host, not a claim.

**Caveat that decides how they land:** four of the six are *topical essays about
external events* (Biparjoy, Assam floods, European heat), so they carry
statistics that will need the same source treatment as the situation pages
before they go up. The build gate in `scripts/build-stories-page.mjs` already
enforces this — it fails on a published story with no source, which is the
correct place for the argument to happen.

### 1.4 Fourteen team biographies. The new About page has names and roles only.

`data/about-people.json` records 8 staff + 8 governing body as name+role, with
the note that `/wp-json/wp/v2/profile` 404s. The 16 `/profile/<slug>/` pages
carry full biographies — 200 to 2,500 characters each — and they are good:
Ashim's twenty years of Hindustani classical training and his "Music in Woods"
walks; Lopamudra's unsponsored work getting demolition slips to 170 families in
East Delhi in 2005–06; Kuriakose's practice at the Supreme Court and WTO
disputes work; Aruna's SOAS fellowship and M. K. Tata Prize; Vimlendu's 2004
India Today/Outlook and International Youth Foundation listings and the 2007
CNN *Be the Change* selection.

Two of the sixteen are duplicates (`ashim-bery` / `ashim-bery-2`, which differ
only in his title — "Director of Programs" vs "Chief of Operations" — and
`vimlendu` / `vimlendu-jha-2`). **That title conflict needs an owner ruling
before either bio is published.** Six of the fourteen publish a personal
`@swechha.in` address in the bio body; `about-people.json` already has a
`published_email_exceptions` field, so route them through that rather than
lifting the bios verbatim.

### 1.5 Twelve to sixteen substantial programmes with no page on the new site.

`data/work/**` holds 23 items. The old site has 45 project pages, of which
~35 are distinct and real. Each real one is a consistent four-part structure —
BACKGROUND & RATIONALE / key features / PROGRAM DESCRIPTION / PROGRAM OUTREACH —
that is close to a drop-in fit for the `data/work/**` schema.

**Confirmed absent** (`grep -ri` over `public/_pages/v3` and `data` returns zero
non-navigation hits): **Pagdandi**, **Green Creeps**, **Road to Leadership**,
**Circular Economy / Marine Litter & EPR**, **Green Finance**. Near-absent:
**Brake Even** (one homepage ticker mention), **US Embassy Alumni Micro Grants**
(only in the video index), **Learning Communities** (named on `/impact` but no
page of its own).

The ones with the most content behind them:

- **Remakery** — the upcycling shop/workshop space, weekly "One Night Stand"
  events. Already referenced on `/home` and `/about` with no page of its own,
  and there is a 2025-09-03 post about it reopening after eight months.
- **Pagdandi / Me to We** — began 2007 as an open-air school on the Yamuna at
  Kudsia Ghat, then a Jagdamba Camp school with Kitaab Ghar library, plus the
  Right to Education campaign that got 150+ children into formal schools.
  `/work/projects/me-to-we` exists; Pagdandi as its own 2007 origin story does not.
- **Green Finance (with IGES)** — the 93-social-enterprise study. Longest project
  page on the old site (4.1 KB), and it pairs with the IGES publication in §1.2.
- **Circular Economy / Marine Litter & EPR (GIZ + MoEFCC)** — the 10 single-use
  plastic alternatives infographics, under Indo-German bilateral cooperation.
- **Influence / CYON** — 300 youth organisations nationwide, and the 2012 VSO/DFID
  International Citizen Service exchange (65 leaders, India and UK).
- **Women and Non-Traditional Livelihoods** — Udaan, the British Council YWSEDP,
  the MOM candle enterprise, Lunchbox 17 (25,000 meals in a year) and its
  becoming Million Kitchen. This is a livelihood-outcomes story with names and
  numbers, and it is entirely missing.
- **The farm training suite** — Bee Keepers Collective, Composting &
  Micro-enterprises, Soil Regeneration, Sustainable Agriculture Training Camps,
  Women Farmers Collective. All five are farm-adjacent and would strengthen
  `/farm`, which currently stands alone.
- **Teacher Training** (700+ educators), **Green Action in Schools** /
  **Eco Action** (the B2 Vasant Kunj airshed park, 5% to 90% green cover over a
  decade), **Films & Documentaries** (Jijivisha, Wasted, Disposable — broadcast
  on CNN International, NDTV, BBC, CBC — and Sakhi, 2021, with Ford Foundation
  support).

Also worth noting: **"Dairy Cooperative and Cow Rearing"** is listed on both the
Programs page and the Sustainable Agriculture theme page but **has no project
page anywhere** — a promise the old site never kept.

---

## 2. THE FRAMING LAYER — five theme statements, currently unused

The old site organises everything under three pillars (Education, Environment,
Enterprise) resolving into five themes, each with a written statement:
**Sustainable Lifestyles and Education**, **Sustainable Agriculture and
Integrated Development**, **Sustainable Cities & Ecology**, **Resilient and
Equitable Communities**, **Green Economy and Enterprise**, plus **Building
Narratives for Sustainability**.

The new site's WORK section instead classifies by *form* — projects, campaigns,
journeys, events (`data/work/kinds.json`). That is a better spine for a reader
and should not be replaced. But the theme prose is the only place the
organisation says *why* these things belong together, and the Cities & Ecology
statement in particular ("degrading air quality, vehicular and industrial
emissions, contaminated river bodies, depleting groundwater table…") reads as a
direct ancestor of the situation pages. Worth mining as copy for `/work`'s
index statement, not worth rebuilding as a second taxonomy.

---

## 3. THE OUTREACH COUNTERS — take the prose, distrust the numbers

Every project page ends in four animated counters. They look like the impact
data the new site's `/impact` is built to carry. **Most of them cannot be used
as-is**, and the crawl proves why.

**Four project pages are unfinished templates with lorem-ipsum bodies** — the
literal text "Locals in Tokyo love Izakaya…" followed by keyboard mash — and a
duplicated Bridge The Gap headline: `solar-energy-training`,
`water-harvesting-training`, `women-and-non-traditional-livelihood-2`,
`women-farmers-collective-2`. All four share the identical counter set
**2740 / 4751 / 1260 / 9385**. `2022-project-sample` is a 71-character stub.

That placeholder set contaminates two pages that are otherwise real:
`learning-communities` ends in **9385** "Campaigns" and
`soil-regeneration-training` ends in **9385** "Rural Youth Engaged". Neither is
a real figure.

The counters also contradict their own prose on the same page:

| Page | Prose says | Counter says |
|---|---|---|
| Yamuna Yatra | "over 2000 young leaders" | 3000 participants |
| Monsoon Wooding | "planted and survived over 50000 trees" | 55,000 trees |
| Bee Keepers | "500 kilos" then "over 600 Litres" in adjacent paragraphs | 600 litres |
| Bridge The Gap | "250 schools … over 50,000 students" | 257 schools / 45,000 / 300,000 |

And `eco-action` and `green-action-in-schools` are the same programme written
twice, with different numbers: 60 schools / 5 years / 60,000 participants versus
100 schools / 10 years / 100,000 participants.

**Recommendation:** port the *prose*, which is well written and specific, and
treat every counter as an unsourced claim requiring the same gate as everything
else. `data/impact.json`'s existing rule — every figure on `/impact` resolves out
of `data/work/**` so the two can never disagree — is exactly the right defence,
and it is the reason these numbers must not be typed in directly.

---

## 4. WHAT IS NOT WORTH TAKING

- **The "In the News" archive is a mirage.** 59 of the 146 posts have a
  completely empty body, no featured image, and no attachment — verified via
  `_embed=wp:featuredmedia` (all `NONE`) and by loading
  `swechha.in/fall-of-the-yamuna/` directly, which renders a title and nothing
  else. These are the 2014–2015 entries: "Mending the gap", "The Lorax",
  "Youth power", "Fall of the Yamuna" and ~40 more. They are headline shells of
  press clippings whose scans were never uploaded or have been lost. The
  `/in-the-news` page lists four dated entries and no content.
  **Do not port. Do not redirect. Let them 404.**
- **The Resources video wall** — 29 pages of embeds — is superseded. The new
  site's `data/media/youtube-index.json` already indexes all 148 videos on the
  channel from all 18 playlists.
- **`/privacy-draft`** (11 KB, the largest page on the old site) is a boilerplate
  draft that was never linked into navigation.
- **`/6220-2`** is an orphan test page containing the word "Button".
- **`/contact-us`** has a title and a breadcrumb. The actual contact details are
  in the site footer, not on the page.

---

## 5. TWO THINGS THAT ARE OWNER RULINGS, NOT BUILD TASKS

**5.1 The donate page has live banking details that the new site deliberately
does not.** Ruling G-1 for `/act` was that no payment destination exists. The old
`/donate-mainpage` publishes two full account sets — an INDIAN account and an
FCRA account (Axis Bank, Malviya Nagar, with A/C numbers, IFSC and MICR) — plus
a cheque payee name, an 80G tax-benefit FAQ, four routes for corporate/CSR
involvement, and a `#pawjectWARMTH` stray-dog-jacket campaign at ₹400 a jacket.
I am flagging that this exists and contradicts G-1; I am not proposing to
publish it. Bank details are the owner's call, and a dormant campaign asking for
₹400 is worse than no campaign.

**5.2 The footer contact block contradicts the phone ruling.** Ruling G-4 struck
the phone number from the new site. Every page of the old site currently
publishes: **R-84, Khirki Extension, Malviya Nagar, New Delhi 110017**,
**011-41009320**, **swechhaindia@gmail.com** — and the donate page adds
**011-29544678** and **+91-9811812788**, so three different numbers are live
across the site. The address matches what `/publications` and `/act` already
carry. The numbers need one decision, not three.

---

## 6. THE MIGRATION DEBT THIS AUDIT QUANTIFIES

`redirects.ts` still reads:

> STILL EMPTY of the ~165 old-WordPress URLs (146 posts + 19 pages). That
> mapping is a launch blocker and has not been started.

The crawl sharpens that number. The real surface is **226 URLs**: 19 pages,
146 posts, 45 projects, 16 profiles. And it splits cleanly:

- **~59 posts** are empty shells → let them 404, they have no destination and no
  inbound value.
- **~35 project pages** → the ten `/work/**` detail routes that exist, plus the
  new ones §1.5 argues for; the ~10 duplicate/placeholder projects fold into
  their real twin.
- **16 profiles** → one `/about` anchor each, once §1.4 is resolved.
- **19 pages** → the five theme pages collapse onto `/work`; `/about-us`,
  `/get-involved`, `/donate-mainpage`, `/events-mainpage`, `/resources-mainpage`
  and the farm-school page map onto `/about`, `/act`, `/publications` and `/farm`
  respectively; `/privacy-draft`, `/6220-2` and `/contact-us` get nothing.

That is a tractable mapping, and it is smaller than 226 because a third of the
old site has nothing behind it.

---

## 7. SUGGESTED ORDER

1. **Annual reports onto `/about`** (§1.1). Highest value per unit of work — a
   transparency shelf is a credibility asset, the files are already public, and
   eight of them are one URL rewrite away. Name the five lost files and the two
   gap years as gaps.
2. **Six publications onto `/publications`** (§1.2), pending the AD-26 re-ruling.
   The IGES New Delhi scenario should probably be surfaced from the situation
   pages too.
3. **The six essays into `/stories` Written** (§1.3) — this closes the one
   section the site currently admits is empty, but only after each essay's
   external statistics are sourced through the existing build gate.
4. **Fourteen bios onto `/about`** (§1.4), after the Ashim title ruling and an
   email-publication decision.
5. **New `/work` items** (§1.5), prose only, counters held back until sourced.

Items 1–2 are re-hosting verified files and could land in a day. Items 3–5 each
carry a real editorial decision and should not be rushed to look complete.
