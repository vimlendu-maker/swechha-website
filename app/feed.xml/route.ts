/* THE JOURNAL AS AN RSS FEED — the site's first machine-readable "what's new".
 *
 * WHY IT EXISTS. Audited 14 September 2026: this site had no feed of any kind,
 * on any route, while every comparable publication in its field has one. The
 * monthly digest asks a reader for an address; a feed asks for nothing and
 * works for the readers who will never hand one over — and for the aggregators,
 * readers and answer engines that are how a small publication gets found at all.
 *
 * ★ IT CARRIES THE JOURNAL AND NOTHING ELSE.
 * The Journal is the only thing on this site that is a dated, authored stream.
 * The obvious second candidate is /record, and it is deliberately not here: the
 * record is a dataset, its "items" are observations rather than documents, and
 * a feed emitting one entry per hourly air reading would be a denial-of-service
 * on anybody's reader. The record already has the right machine surface —
 * the CSV and JSON files listed at /use-the-data.
 *
 * ★ IT INHERITS THE APPROVAL GATE AND DOES NOT RESTATE IT.
 * `publishedArticles()` filters exactly as `journalArticles()` does in
 * scripts/lib/situation-shell.mjs: `publish_state === 'published'` AND a named
 * `approved_by`. A feed that published a draft would be the approval gate's one
 * hole, and it would be an invisible one — the article would be out in a
 * thousand readers before anybody noticed it was not on the site.
 *
 * The duplication of that predicate is deliberate and narrow: the shell is an
 * .mjs build script and this is a TypeScript route, so there is no import to
 * share. `app/feed.test.ts` asserts the two agree on the same dataset, which is
 * the check that makes the copy safe rather than a comment saying it is.
 *
 * ★ DATES ARE RFC 822, AND THE ARTICLE'S DATE IS A DAY, NOT AN INSTANT.
 * Journal dates are YYYY-MM-DD with no time — the stamp is the day it was
 * published, and that is all the dataset knows. They are emitted at 00:00:00
 * +0530 rather than at UTC midnight, because reading a bare Indian date as UTC
 * is what shifts a 8 September article into 7 September for every reader west
 * of us. The same class of bug the Farm App's date module exists to prevent.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { SITE_URL } from '@/lib/org'

export const dynamic = 'force-static'

type Article = {
  slug: string
  date: string
  type: string
  h1: string
  standfirst: string
  publish_state?: string
  approved_by?: string
}

const DIR = join(process.cwd(), 'data/journal/articles')

/** The approval gate, and the same sort the site's own index uses. */
function publishedArticles(): Article[] {
  if (!existsSync(DIR)) return []
  return readdirSync(DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(readFileSync(join(DIR, f), 'utf8')) as Article)
    .filter((a) => a.publish_state === 'published' && Boolean(a.approved_by))
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
}

/* The five entities the Journal's own fields use. `h1` carries a `<br>` for the
   page's line break and the entities are written for HTML; a feed title is text,
   so both are undone here rather than shipped into somebody's reader raw. */
const ENT: Record<string, string> = {
  '&mdash;': '—', '&ndash;': '–', '&nbsp;': ' ', '&amp;': '&',
  '&rsquo;': '’', '&lsquo;': '‘', '&ldquo;': '“', '&rdquo;': '”', '&hellip;': '…',
}
const plain = (s: string) =>
  String(s ?? '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&[a-z]+;/g, (m) => ENT[m] ?? m)
    .replace(/\s+/g, ' ')
    .trim()

/** XML text escaping. Applied AFTER `plain`, so an `&` that came out of an
    entity is re-escaped rather than left to break the document. */
const xml = (s: string) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

const DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** `2026-09-08` -> `Tue, 08 Sep 2026 00:00:00 +0530`.
 *
 *  The weekday is taken from the date's own Y/M/D through `Date.UTC`, which is
 *  the one construction that cannot drift: it never applies the runner's local
 *  offset to a date that already has one stated in the output. */
function rfc822(date: string): string {
  const [y, m, d] = date.split('-').map(Number)
  const dow = DAY[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]
  return `${dow}, ${String(d).padStart(2, '0')} ${MON[m - 1]} ${y} 00:00:00 +0530`
}

export function GET(): Response {
  const articles = publishedArticles()
  const self = `${SITE_URL}/feed.xml`

  const items = articles.map((a) => {
    const url = `${SITE_URL}/journal/${a.slug}`
    return [
      '    <item>',
      `      <title>${xml(plain(a.h1))}</title>`,
      `      <link>${xml(url)}</link>`,
      `      <guid isPermaLink="true">${xml(url)}</guid>`,
      `      <pubDate>${rfc822(a.date)}</pubDate>`,
      a.type ? `      <category>${xml(a.type)}</category>` : '',
      `      <description>${xml(plain(a.standfirst))}</description>`,
      '    </item>',
    ].filter(Boolean).join('\n')
  })

  /* `lastBuildDate` is the newest ARTICLE's date, not the build's clock. A feed
     whose lastBuildDate moves on every deploy tells every reader the content
     changed when it did not, which is how a publication teaches people to stop
     checking it. */
  const newest = articles[0]?.date

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>The Swechha Journal</title>
    <link>${xml(`${SITE_URL}/journal`)}</link>
    <atom:link href="${xml(self)}" rel="self" type="application/rss+xml"/>
    <description>Analysis and reporting on India's environment, from Swechha. Every figure carries the date it was observed.</description>
    <language>en-IN</language>
    <copyright>CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/</copyright>${
  newest ? `\n    <lastBuildDate>${rfc822(newest)}</lastBuildDate>` : ''}
${items.join('\n')}
  </channel>
</rss>
`

  return new Response(body, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
