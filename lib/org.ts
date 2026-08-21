/**
 * Facts about the organisation that more than one page needs, and that must
 * never be typed as a literal in a page.
 *
 * The ledger's ruling (DECISIONS-2026-08-18, "26 years (founded 2000)") is
 * that every "years of" figure is DERIVED from the founding year. A hardcoded
 * 26 is correct for exactly one year and then quietly wrong on every page that
 * carries it — and this site says it in at least three places.
 */
export const FOUNDED_YEAR = 2000

/** Whole years since founding, as of `now` (defaults to today). */
export function yearsSinceFounding(now: Date = new Date()): number {
  return now.getFullYear() - FOUNDED_YEAR
}

/**
 * The production domain. Was previously typed as a literal independently in
 * `app/layout.tsx` (`metadataBase`), `app/sitemap.ts` and `app/robots.ts` —
 * the same "never a second literal" reasoning as `FOUNDED_YEAR` above applies
 * even more here, since a mistyped domain in structured data or a sitemap is
 * a silent SEO bug, not a build failure.
 */
export const SITE_URL = 'https://swechha.in'

/** The site-wide description used for the root `<meta name="description">`
 * and as the fallback description for share cards and structured data. */
export const SITE_DESCRIPTION =
  'Swechha is an Indian environmental organisation working across climate action, sustainability, education, youth engagement and community-led change.'

/**
 * Organization structured data (JSON-LD) for the homepage. Google surfaces
 * this in the Knowledge Panel / sitelinks search box, not in the visible
 * page — it has to be embedded as a `<script type="application/ld+json">`
 * in the page itself (the Metadata API has no first-class field for it).
 *
 * No `sameAs` (social profile URLs) — none are verified anywhere in this
 * codebase yet. Add them here, not per-page, once confirmed with the org.
 */
export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'NGO',
    name: 'Swechha',
    url: SITE_URL,
    logo: `${SITE_URL}/brand/swechha-horizontal-black-approved.png`,
    foundingDate: String(FOUNDED_YEAR),
    description: SITE_DESCRIPTION,
  }
}
