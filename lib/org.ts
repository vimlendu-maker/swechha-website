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
/* ENV-DRIVEN, because the literal was wrong on every deploy that is not the
 * production domain. A preview or staging deploy that hardcodes this puts
 * `https://swechha.in` in its own sitemap, robots.txt and structured data —
 * advertising the OLD WordPress site from the new one, which is the silent SEO
 * bug this comment block was already worried about, one layer up.
 *
 * `SITE_ORIGIN` is the override, named to match `lib/subscriptions.ts`'s
 * existing use of the same variable rather than inventing a second name for
 * one idea. `VERCEL_URL` is filled in automatically on every Vercel
 * deployment, so preview builds describe themselves correctly with no config
 * at all. The literal stays as the last fallback: production is still
 * swechha.in, and a missing env var must not produce a relative-URL sitemap.
 */
/* TRIMMED, AND NOT DEFENSIVELY. Measured in production 23 August: the Vercel
   value carried a leading TAB, so every one of the 35 `<loc>` values in
   sitemap.xml read `<loc>\thttps://swechha.in…</loc>` and robots.txt advertised
   `Sitemap: \thttps://swechha.in/sitemap.xml`. A `<loc>` is required to be a
   valid absolute URL and a sitemap is the machine-readable index of the whole
   site, so the cost of one invisible whitespace character was the entire index.
   The env var was corrected too, but a value pasted from a dashboard will pick
   up whitespace again and nothing here would notice, so the trim is the fix and
   the dashboard is the housekeeping. Same reasoning, same line, in
   `lib/subscriptions.ts` — which builds the confirm and unsubscribe links that
   go out in email. */
export const SITE_URL =
  process.env.SITE_ORIGIN?.trim() ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL.trim()}` : 'https://swechha.in')

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

/* ONE PLACE ASKS THE QUESTION. `robots.ts` and `next.config.ts`'s headers both
   need to know whether this deploy may be indexed, and two independent reads of
   an env var is how a site ends up serving `Disallow: /` alongside an
   indexable header. Anything other than the exact string `true` means no. */
export function isIndexable(): boolean {
  return process.env.SITE_INDEXABLE === 'true'
}
