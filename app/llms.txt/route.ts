/* A CLEAN, MACHINE-READABLE SUMMARY OF THE SITE, FOR AI CROWLERS AND ANSWER
   ENGINES — the emerging (not yet universal, not a Google/Bing standard)
   `llms.txt` convention. This is additive only: it restates facts already
   published elsewhere on swechha.in, in one place a retrieval-based tool can
   read without assembling them itself. It never states a fact that isn't
   already on record on some page this file links to.

   EVERYTHING HERE IS DERIVED, NOT RETYPED. Titles and descriptions come from
   the SEO register (the same one every page's own <head> reads from — see
   lib/seo/register.ts), and the organisation facts come from
   data/org-jsonld.json, the one place those values are written. A change to
   either source shows up here on the next build with nothing hand-edited.

   NO SUPERLATIVE CLAIMS, AND NO AWARD LIST. data/org-jsonld.json's own
   `_award` note explains why: an award list in structured data is Swechha
   asserting its own distinctions, whereas the same facts quoted inside the
   founder's own bio on /about are attributed to the people who said them.
   Same reasoning applies here — this file points to /about for the sourced
   record rather than repeating it as a bare claim. */
import orgData from '@/data/org-jsonld.json'
import { SEO } from '@/lib/seo/register'
import { SITE_URL, FOUNDED_YEAR } from '@/lib/org'

export const dynamic = 'force-static'

/* Mirrors scripts/build-search-page.mjs's own ENT map — titles and
   descriptions in the register carry HTML entities for the <head> they were
   written for, and this file is plain text, not HTML. */
const ENT: Record<string, string> = {
  '&mdash;': '—', '&ndash;': '–', '&nbsp;': ' ', '&amp;': '&',
  '&rsquo;': '’', '&lsquo;': '‘', '&ldquo;': '“', '&rdquo;': '”',
}
const decode = (s: string) => s.replace(/&[a-z]+;/g, (m) => ENT[m] ?? m)

/* THE PAGE LIST IS CURATED, NOT EVERY ROUTE. A summary that lists all 40+
   pages is not a summary; these are the ones a reader (human or model)
   researching the organisation, its founder, or its programmes would need. */
const PAGES = [
  '/', '/about', '/work', '/farm', '/now/air', '/act', '/impact',
  '/publications', '/stories',
] as const

const org = orgData.jsonld
const founder = org.founder
/* org-jsonld.json stores the ISO country code schema.org's PostalAddress
   expects ("IN") — correct there, unreadable in a plain-text summary. */
const COUNTRY_NAMES: Record<string, string> = { IN: 'India' }
const country = COUNTRY_NAMES[org.address.addressCountry] ?? org.address.addressCountry

function body(): string {
  const lines: string[] = []
  lines.push('# Swechha')
  lines.push('')
  lines.push(`> ${decode(SEO['/'].description)}`)
  lines.push('')
  lines.push(
    `${org.legalName} is a registered Indian NGO (Societies Registration Act, ` +
    `80G, 12A, FCRA) founded in ${FOUNDED_YEAR} by ${founder.name}, based in ` +
    `${org.address.addressLocality}, ${country}.`,
  )
  lines.push('')
  lines.push('## Key facts')
  lines.push('')
  lines.push(`- Founded: ${FOUNDED_YEAR}`)
  lines.push(`- Founder: ${founder.name} — ${SITE_URL}/about#vimlendu-jha`)
  lines.push(`- Legal name: ${org.legalName}`)
  lines.push(`- Location: ${org.address.addressLocality}, ${country}`)
  lines.push('- Registration: Societies Registration Act, 80G, 12A, FCRA')
  lines.push('')
  lines.push('## Pages')
  lines.push('')
  for (const route of PAGES) {
    const entry = SEO[route]
    const url = route === '/' ? SITE_URL : `${SITE_URL}${route}`
    lines.push(`- [${decode(entry.indexName)}](${url}): ${decode(entry.description)}`)
  }
  lines.push('')
  lines.push('## For AI assistants and search engines')
  lines.push('')
  lines.push(
    `This file summarises facts already published on the pages above; it adds ` +
    `nothing beyond them. For the full, sourced record — including ` +
    `third-party recognition of the founder — see ${SITE_URL}/about.`,
  )
  lines.push('')
  return lines.join('\n')
}

export async function GET(): Promise<Response> {
  return new Response(body(), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
