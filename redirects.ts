import type { NextConfig } from 'next'
import { designRoutes } from './design-routes'
import { buildLegacyRedirects, readMap } from './lib/legacy-redirects'
import { buildRetiredRedirects, readBuiltRoutes } from './lib/retired-redirects'

type Redirects = NonNullable<NextConfig['redirects']>
type Redirect = Awaited<ReturnType<Redirects>>[number]

/**
 * Permanent redirects from the old WordPress site — 175 of them, GENERATED from
 * `docs/legacy/redirect-map.json`, which is the reviewed map of every URL
 * captured from swechha.in on 2026-08-23 before the domain moved, plus six
 * recovered on 2026-08-26 that the capture never saw.
 *
 * Not a hand-written literal, and not for style: 175 facts maintained in two
 * places drift, and a drifted redirect is invisible until a reader hits a dead
 * URL. `lib/legacy-redirects.ts` does the transformation and refuses to emit
 * anything it cannot verify against this site's own routes — a 308 into a 404
 * looks alive to a crawler and is worse than the 404 it replaces.
 *
 * To change a redirect, edit the map (via `docs/legacy/build-redirect-map.mjs`)
 * and not this file. `docs/legacy/README.md` records the rulings behind it, and
 * the 97 `parent` rows there are a re-point list for when the missing pages
 * get built.
 *
 * The 57 URLs deliberately given NO redirect are absent on purpose: 52 lost
 * 2014-17 press-clipping shells with zero body text, three orphans (a
 * boilerplate draft, a test page, a WordPress sample), the home-to-home loop,
 * and a departed colleague's profile. Absence is the instruction, recorded in
 * the map with a reason rather than left to inference.
 *
 * It was 167 and 59 until 2026-08-25, when /contact-us/ moved from the second
 * list to the first: it was still a live Google result, and a 404 would have
 * forfeited that. See the note on its row in build-redirect-map.mjs.
 *
 * It was 168 and 58 until 2026-08-26, and that revision was a different kind.
 * A backlink audit turned up SIX live pages that the capture never contained:
 * the inventory was built from the old sitemaps, and a WordPress sitemap lists
 * what WordPress still thinks is current, so pages already dropped from it were
 * invisible to the capture and therefore to every ruling made from it. They
 * 404'd because nobody knew they existed, not because anybody decided. Two of
 * the six — /project/yamuna-yatra-2/ and, from the `none` list, the zero-body
 * /we-for-yamuna-and-you/ — were still live Google results while they 404'd.
 *
 * The lesson worth keeping: a complete-looking inventory is only as complete as
 * the sitemap it came from. See `RECOVERED` in build-redirect-map.mjs, which
 * carries each row's Wayback evidence and is counted apart from the capture so
 * the two can never be confused.
 */
export const legacyRedirects: Redirect[] = buildLegacyRedirects(
  readMap(),
  new Set(designRoutes().map((r) => r.source)),
)

/**
 * Redirects for routes this site BUILT AND THEN RETIRED — derived, never typed.
 *
 * Kept separate from both lists below it because it is a different kind of
 * fact. The WordPress list is migration debt from another site. `movedRedirects`
 * is a decision somebody made. This one is the consequence of two sections
 * being EPHEMERAL BY CONSTRUCTION: `/now/climate-event/<slug>` exists while the
 * detector holds an event above its publication bar, `/journal/<slug>` exists
 * while an article is approved, and both sets shrink without anybody editing
 * anything. `lib/retired-redirects.ts` explains what that cost — 22 indexed
 * URLs answering a hard 404 on 2026-09-21, four of them still in Search
 * Console's top 40 while dead.
 *
 * ★ A PROBLEM HERE WARNS AND DOES NOT THROW, WHICH IS THE OPPOSITE OF THE
 * LEGACY LIST, AND THE ASYMMETRY IS DELIBERATE. `buildLegacyRedirects` throws
 * because its input is a reviewed map: a disagreement there means a human wrote
 * something the site cannot honour, and the build should stop until they fix
 * it. This input is not reviewed by anybody — it is the difference between two
 * generated files, and the generator that changes it is the hourly climate-event
 * pipeline. A retired route with no live ancestor would therefore be able to
 * fail the production build at 03:00 on a Sunday because a detector closed an
 * event, and the failure mode it would be protecting against is a route that
 * 404s — which is exactly what it already does. Breaking the site's publishing
 * to avoid leaving a 404 as a 404 is not a trade worth making.
 *
 * So: emit what can be repaired, say plainly what cannot. The warning names the
 * route, so a section that has genuinely gone away is visible in the build log
 * rather than silent.
 */
const retired = buildRetiredRedirects(readBuiltRoutes(), new Set(designRoutes().map((r) => r.source)))
if (retired.problems.length)
  console.warn(
    'retired-redirects: no redirect emitted for these retired routes —\n' +
      retired.problems.map((p) => `  ${p.route}: ${p.why}`).join('\n'),
  )
export const retiredRedirects: Redirect[] = retired.redirects

/**
 * Redirects for URLs this site itself has moved. Kept separate from the
 * WordPress list because these are our own decisions, not migration debt, and
 * they must survive whatever happens to that list.
 *
 * 2026-08-19 — WORK became the umbrella for Projects, Journeys, Campaigns and
 * Events (owner ruling), so campaigns moved from /campaigns to /work/campaigns
 * to match. The old paths shipped and may be linked, so they redirect rather
 * than 404. The slug route is listed first: Next matches in order, and a bare
 * `/campaigns` source would otherwise swallow `/campaigns/anything`.
 *
 * Both verified in dev: /campaigns and /campaigns/delhi-air-quality-2026 each
 * return 308 to their /work/campaigns equivalent.
 */
export const movedRedirects: Redirect[] = [
  /* ★ THE SLUG REDIRECT POINTS AT THE INDEX, NOT AT `/work/campaigns/:slug`,
     AND THAT IS THE FIX RATHER THAN THE COMPROMISE.
     Audited in production 23 August 2026: `/campaigns/delhi-air-quality-2026`
     answered 308 to `/work/campaigns/delhi-air-quality-2026`, which answered
     404. The destination route is `app/work/campaigns/[slug]/page.tsx`, whose
     `generateStaticParams()` reads `getAllCampaigns()` — and `content/campaign/`
     holds nothing but `.gitkeep`, so it generates NO slugs and 404s for every
     one of them. (`/work/campaigns/monsoon-wooding` answers 200 only because it
     is a static built page served by `design-routes.ts`, not by this route.)

     The comment below still says both paths were "verified in dev". They were:
     the REDIRECT fires correctly. What was never verified is that anything is
     on the other end of it. That is the failure mode the file's own header
     paragraph warns about for the legacy list — "a 308 into a 404 looks alive
     to a crawler and is worse than the 404 it replaces" — and it landed here
     because `buildLegacyRedirects()` enforces that rule against this site's
     routes while this hand-written literal is checked by nothing.

     `/work/campaigns` exists, is the umbrella the owner ruled for on 19 August,
     and is where a reader looking for a campaign should arrive. Restoring the
     campaign content file is the other way to fix this, and then the `:slug`
     destination can come back. */
  {
    source: '/campaigns/:slug',
    destination: '/work/campaigns',
    permanent: true,
  },
  {
    source: '/campaigns',
    destination: '/work/campaigns',
    permanent: true,
  },
  /* ★ RULING 27. `/healthy-cities/fellows` IS AN INTERMEDIATE SEGMENT WITH NO
     PAGE, AND THE STRUCTURED DATA NAMES IT ANYWAY.
     `assemble()` in `scripts/lib/situation-shell.mjs` derives every page's
     `BreadcrumbList` from its own canonical URL's segments, so all ten fellow
     pages emit `Swechha -> Bridge the Gap - Healthy Cities -> fellows -> <name>`
     and the middle item's `item` URL is `https://swechha.in/healthy-cities/fellows`.
     Nothing on this site LINKS there — the link census is clean and no href
     anywhere points at it — so this is crawler-facing only. It is still a
     defect: a crawler that follows a breadcrumb item to a 404 has been told by
     our own markup that a page exists.

     IT RESOLVES TO THE REGISTER, IT DOES NOT BECOME A PAGE. The spec gave the
     hub the fellows register instead of a separate fellows index deliberately —
     a section index that is only a union of registers already published one
     level down fails this site's own ruling — so the parent of the ten is the
     hub's `#fellows` band, and this redirect says so rather than minting the
     page the ruling refused.

     THE FRAGMENT IS IN THE DESTINATION BECAUSE IT SURVIVES. Verified against a
     production build rather than assumed: this source answers 308 with
     `location: /healthy-cities#fellows`. Next.js keeps a hash in a
     `redirects()` destination and puts it in the Location header; had it been
     stripped, the honest destination was the bare `/healthy-cities` and this
     note would say so.

     NO `:slug` VARIANT, deliberately. `/healthy-cities/fellows/<slug>` is a
     REAL route for all ten fellows (`fellowRoutes()` in `design-routes.ts`
     derives it from the built files), and a `/healthy-cities/fellows/:slug`
     redirect placed here would match first and swallow every one of them —
     which is the exact trap the `/campaigns/:slug`-before-`/campaigns` ordering
     note above exists to record. An eleventh fellow needs no edit here. */
  {
    source: '/healthy-cities/fellows',
    destination: '/healthy-cities#fellows',
    permanent: true,
  },
  /* ★ `/explore` IS RETIRED. It was the last page of the pre-design scaffold
     still answering 200, and it had drifted into being a second, worse site:
     the OLD navigation (a `Donate` word this site does not use), three "nothing
     published yet" empty states, a different boilerplate sentence about what
     Swechha is, and a footer reading "© 2026 Swechha. All rights reserved."

     THE COPYRIGHT LINE IS WHY THIS IS A DELETION RATHER THAN A CLEAN-UP.
     `/use-the-data` grants every reading, table and record on this site under
     CC BY 4.0. One live page asserting all rights reserved is not an
     inconsistency of tone; it is the site contradicting its own licence, and a
     re-user who found this page first would be right to believe it.

     `noindex` DID NOT CONTAIN IT. The page was excluded from the sitemap and
     carried `robots: noindex, follow`, so it was never a search problem — which
     is precisely why it survived three audits. It was reachable by typing the
     URL, by any old link, and from `components/site-nav.tsx`, which is live on
     the 404 page.

     THE DESTINATION IS `/learn`, NOT `/stories`. The scaffold's own subject
     line was "Stories, explainers, guides and films", and of those four the
     library that actually exists is the thirty explainers at `/learn`. A
     redirect should land on the page that answers the reason the reader came. */
  {
    source: '/explore',
    destination: '/learn',
    permanent: true,
  },
]
