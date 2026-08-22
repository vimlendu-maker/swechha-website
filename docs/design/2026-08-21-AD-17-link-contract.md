# The WORK section link contract — measured, not asserted

Compiled by the lead on 21 August from `public/design/v3/home.html` (the frozen
homepage) by enumerating every `href` in the file. **These are counts of actual
attributes, not an estimate.** The architecture must provide every destination in
§2 or state its redirect; the repairs in §3 are part of the build, not a later pass.

Owner's instruction that this file exists to satisfy: *"keep in mind which page is
linked to menu bar WORK, what happens when anyone clicks on Project in home page,
etc... All cross linkings need to be solid."*

---

## 1. The nav contract as it stands — the thing to resolve first

The primary nav is six links, and the **same six repeat identically in all three
nav surfaces**: `.navlinks` (the bar), `#navidx` (the phone panel) and
`.navscroll` (the chip row). Any change is a change in three places.

| label | current destination | kind |
|---|---|---|
| Now | `/design/v3/intelligence.html` | **a page** |
| Work | `#work` | an on-page anchor (band 4) |
| Journeys | `#journeys` | an on-page anchor (band 5) |
| Impact | `#impact` | an on-page anchor (band 9) |
| Farm | `#farm` | an on-page anchor |
| Record | `#record` | an on-page anchor |

**The defect this creates.** Two words each mean two different things:

- **Work** in the menu bar scrolls to homepage band 4. The `/work` page is reachable
  only from that band's "The whole list" button — so the site's primary nav does not
  link to the section this whole build is about.
- **Journeys** in the menu bar is a homepage band, while `/work/journeys` is a page.
  One word, two destinations.
- On a WORK page there is no `#work` band to anchor to, so **five of the six nav
  links have no meaning inside the section** until this is ruled on.

## 2. Destinations the frozen homepage demands, with the number of links pointing at each

Every one of these must resolve. The count is how many separate elements a reader
could click to get there — it is a measure of how visible a 404 would be.

| destination | links | exists today | note |
|---|---|---|---|
| `/work/projects` | **8** | ❌ no route | the most-linked page in the section |
| `/work/journeys` | 6 | ❌ no route | designed pre-freeze, `journeys-landing.html` |
| `/work/campaigns` | 6 | ✅ route exists | old Tailwind design, not the frozen language |
| `/work/events` | 3 | ❌ no route | designed pre-freeze, `events-landing.html` |
| `/work` | 1 | ✅ route exists | old Tailwind design |
| `/work/projects/bridge-the-gap` | 1 | ❌ no route | designed pre-freeze |
| `/work/projects/farm-school` | 1 | ❌ no route | designed pre-freeze |
| `/impact` | 1 | ✅ route exists | outside this section |
| `/about` | 1 | ✅ route exists | outside this section; `v3/about.html` is the design |

Situation pages linked from the WORK bands, **all verified present**:
`situation-air.html` (3 links), `situation-yamuna.html` (3), `situation-soon.html` (2),
and one each to `situation-forest-fire`, `situation-forest-loss`,
`situation-climate-event`, `situation-heatwave`. No dead situation link exists.

## 3. Repairs the build owes — links that resolve but point at the wrong thing

These are not 404s, which is why they are easy to miss. They are links that will be
**wrong the moment the WORK pages exist**.

| where | element | points at now | should point at |
|---|---|---|---|
| footer "Read" | Projects and campaigns | `#work` | `/work` |
| footer "Go" | Yamuna Yatra | `#journeys` | the Yamuna Yatra destination |
| footer "Go" | NatureScapes | `#journeys` | the NatureScapes destination |
| footer "Go" | CityScapes | `#journeys` | the CityScapes destination |
| footer "Go" | Gram Anubhav | `#journeys` | the Gram Anubhav destination |
| band 5, all four journeys | the whole card | `/work/journeys` | its own journey destination |
| band 6, rows 03–07 | the row | `/work/projects` | its own project destination |
| band 7, all three campaigns | the name | `/work/campaigns` | its own campaign destination |

**"Destination" is deliberate wording.** Where the architecture rules an item a row
rather than a page, its destination is an anchor on the landing page — not a dead
`<a>` and not the bare landing page for five different rows, which is what makes
band 6 feel broken today: five rows, one destination, no way to tell you have
already been there.

## 4. Out of scope, recorded so it is not mistaken for our debt

Nine `href="#"` placeholders survive under process ruling P-1, **none of them in the
WORK bands**: Farm's "Visits, camps and retreats"; Record's door and "Open the
archive"; Give's "Give monthly", "See the dates", "Work with us"; and the footer's
"Stories and films", "Publications", "Work with us". They belong to bands that are
frozen and out of this brief. Do not fix them here and do not add to them.

## 5. The gate

The build is done when, at 375 and 1440: **every `href` in every page of the section
resolves to a real destination, no `href="#"` has been added, and the four journey
footer links, the band-5 cards, the band-6 rows and the band-7 campaign names each
land somewhere that is about the thing that was clicked.** Verify by enumerating
attributes, the same way this file was compiled — not by reading the markup and
believing it.
