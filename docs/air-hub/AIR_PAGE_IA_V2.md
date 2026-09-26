# /now/air — Information architecture v2

## The decision in one line

**One hub, one child, and the explainers that already exist.** `/now/air` stays the canonical page; `/now/air/india`
stays its one child; depth goes to the `/learn` explainers the site already has. No new `/now/air/*` routes in this
round.

## Why not the sixteen proposed URLs

The brief proposed `/now/air/{delhi,ncr,india,forecast,health,sources,grap,history,standards,pm25,pm10,vehicles,
stubble-burning,dust,construction}`. Each was tested against search intent, depth, uniqueness, maintenance and
duplication:

| Proposed | Decision | Reason |
|---|---|---|
| `/now/air/delhi` | **No** | It *is* `/now/air`. Two URLs for one reading is duplicate content. |
| `/now/air/india` | **Exists** | Built in AD-43; keep. |
| `/now/air/ncr` | **Not yet — tab** | 34 rows off the same national snapshot. A page would be thin and would restate the India page. Promote to a page only if Search Console shows NCR-town queries landing on `/now/air`. |
| `/now/air/pm25`, `/pm10`, `/standards` | **No** | `/learn/pm25`, `/learn/pm10`, `/learn/cpcb-aqi` exist and are good. The standards table lives on the hub. |
| `/now/air/grap` | **No** | `/learn/grap` exists and rules "the schedule, not the status". A live GRAP page needs a CAQM order feed that does not exist. Revisit when it does. |
| `/now/air/sources`, `/stubble-burning` | **No** | `/learn/source-apportionment` and `/learn/stubble-burning` exist; the hub's sources band carries the studies. |
| `/now/air/history` | **No** | `/record/air` is the archive, with monthly pages and CSV downloads. |
| `/now/air/forecast` | **No** | There is no official forecast feed to publish (see `AIR_DATA_ARCHITECTURE.md`). A page of links would be thin. |
| `/now/air/health` | **No** | Health is four sourced figures plus guidance; a page would invite overclaiming. Candidate for a `/learn` explainer. |
| `/now/air/vehicles`, `/dust`, `/construction` | **No** | No live data; would be thin restatements of one study table. |

Every new route in this repo costs about fifteen registries (design-routes, verify-final census, SEO register,
lastmod, search index, sitemap, social image, nav, …) and the repo's most repeated defect is forgetting one. A route
has to earn that.

## The hub's band order

The brief's twenty-one-part order is met through bands plus tabs, so the first screen still answers "how bad is the
air right now" and nothing is a wall of cards.

| # | Band (id) | Answers | Tabs |
|---|---|---|---|
| 1 | Reading (`top`) | What is Delhi's AQI now? Which monitor? What does 100 mean? Is it fresh? Where does Delhi sit in India? | — (hero + national panel) |
| 2 | Strip (`strip`) | The four numbers at a glance | — |
| 3 | Who is in it? (`people`) | What does it do to health? | — |
| 4 | How the number is made (`measured`) | What is the AQI, PM2.5, PM10? What are today's eight sub-indexes? | What they are · Today's eight · Two scales · Every figure |
| 5 | **The rules that apply (`rules`) — new** | What are India's standards? How do they compare with WHO's? What is GRAP and when does it bite? | India and the WHO · GRAP |
| 6 | Where does it come from? (`sources`) | What causes it? Why do studies disagree? Farm fires? | The split · Two studies · Inside transport · Farm fires now · Year on year |
| 7 | Where it has been, and where it is going (`trend`) | Is it getting better? What happens next? | The record · Attention · Forecast |
| 8 | Which part of the city, and where the city sits (`geography`) | Which part of Delhi is worst? **Gurugram, Noida, NCR?** Which states? | The map · Every station · **Delhi-NCR (new)** · India |
| 9 | The cost of inaction (`money`) | What has been spent? | — |
| 10 | **Questions, answered (`questions`) — new** | Nine of the brief's AEO questions, each a standalone paragraph; includes "What does this page not know?" | — |
| 11 | What you can do (`act`) | What can I do? | Watch your ward · Do it yourself · What is being said |

Grounds alternate without a clash (the generator's ground-chain gate prints `0 clash(es)`).

## Internal links

- Hub → `/now/air/india` (panel, strip, geography), `/record/air`, `/learn/{grap,pm25,delhi-aqi,delhi-air-pollution}`,
  the five sibling situations.
- New: the GRAP tab links `/learn/grap`; the standards tab links the Gazette and the WHO guideline; the NCR tab links
  the NCR Planning Board.
- **Gap left open:** `/now/air/india` is linked from only three pages and has no `/learn` links. Adding it to the site
  footer's readings column is a shared-shell change (touches ~150 pages) and belongs in its own PR.

## Mobile

Verified at a true 375 px (iframe render, because headless Chrome will not go under 500): hero, doubt line, copy
control and national panel fit; the standards and NCR tables fit with units moved into the row header and the
monitor name stacked under its number. Tab strips scroll sideways by design.

## SEO and AEO intent

Primary intent: "Delhi AQI today", "Delhi air quality", "CPCB AQI" (the one air query with measured impressions,
position ~6). Secondary: NCR towns, India vs WHO standards, GRAP. The title now names NCR; the description names the
standards table and GRAP. The Questions band gives answer engines standalone paragraphs, and the FAQPage block is built
from the same strings, never an invisible copy. Detail in `AIR_SEO_AEO_SPEC.md`.
