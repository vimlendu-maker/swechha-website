import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'
import { designRoutePaths } from '../design-routes'
import { legacyRedirects, movedRedirects } from '../redirects'

/**
 * A NAV WORD, A BUILT FILE AND A ROUTE ARE ONE CHANGE.
 * Any two of them without the third is a defect.
 *
 * That sentence is written out four separate times in `design-routes.ts`,
 * because it happened four separate times — `Work`, `Impact`, `Farm` and
 * `Act`. Each time a link worked perfectly and delivered the reader to a
 * placeholder, a 404, or a teaser band whose own button was `href="#"`. The
 * worst of them was `/act`: the Give chip in every nav, three homepage
 * buttons, the footer and eighteen WORK pages all pointed at it, so the
 * most-linked-to page on the site was the only one nobody had built.
 * `app/sitemap.ts`'s own comment records a fifth variant of the same thing —
 * a sitemap advertising `/explore` and `/search` while omitting `/farm` and
 * all six situations.
 *
 * Five occurrences, and nothing in the repository checks for it. This does.
 *
 * It reads the SERVED pages — `public/_pages/**` — not `app/`. The rewrite
 * table in `next.config.ts` puts `designRoutes()` in `beforeFiles`, ahead of
 * the filesystem, so those files are what a reader actually gets and the
 * `app/` routes of the same names are shadowed. A check that read `app/`
 * would be checking pages nobody sees.
 */

const ROOT = join(__dirname, '..')
const PAGES = join(ROOT, 'public/_pages')

function servedPages(): string[] {
  const out: string[] = []
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry)
      if (statSync(full).isDirectory()) walk(full)
      else if (extname(full) === '.html') out.push(full)
    }
  }
  walk(PAGES)
  return out
}

/** Every internal href on a page, fragment and query stripped, trailing slash normalised. */
function internalHrefs(html: string): string[] {
  const out = new Set<string>()
  for (const m of html.matchAll(/href="(\/[^"]*)"/g)) {
    let href = m[1].split('#')[0].split('?')[0]
    if (!href) continue
    /* Next normalises a trailing slash away before user redirects are consulted —
       see the trailing-slash ruling in lib/legacy-redirects.ts. */
    if (href.length > 1 && href.endsWith('/')) href = href.slice(0, -1)
    out.add(href)
  }
  return [...out]
}

/** Static routes the App Router serves from the filesystem. */
function appRoutes(): { staticPaths: Set<string>; dynamicPrefixes: string[]; catchAlls: string[] } {
  const staticPaths = new Set<string>()
  const dynamicPrefixes: string[] = []
  const catchAlls: string[] = []
  const walk = (dir: string, route: string) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry)
      if (!statSync(full).isDirectory()) continue
      if (entry.startsWith('[[')) catchAlls.push(route || '/')
      else if (entry.startsWith('[')) dynamicPrefixes.push(route || '/')
      else walk(full, `${route}/${entry}`)
    }
    if (readdirSync(dir).some((f) => /^page\.(tsx|ts|jsx|js)$/.test(f))) {
      staticPaths.add(route || '/')
    }
  }
  walk(join(ROOT, 'app'), '')
  return { staticPaths, dynamicPrefixes, catchAlls }
}

/** A file actually present under public/ — icons, images, fonts, data exports. */
function isPublicFile(href: string): boolean {
  const p = join(ROOT, 'public', href)
  return existsSync(p) && statSync(p).isFile()
}

describe('every internal link resolves to something that exists', () => {
  const pages = servedPages()
  const mapped = new Set(designRoutePaths())
  const { staticPaths, dynamicPrefixes, catchAlls } = appRoutes()
  const redirectSources = new Set(
    [...legacyRedirects, ...movedRedirects].map((r) => r.source.replace(/\/$/, '') || '/'),
  )

  const resolves = (href: string): boolean => {
    if (mapped.has(href)) return true
    if (staticPaths.has(href)) return true
    if (redirectSources.has(href)) return true
    if (isPublicFile(href)) return true
    /* `/stories/[slug]` serves any single segment below `/stories`, but not two. */
    for (const prefix of dynamicPrefixes) {
      if (href.startsWith(prefix + '/') && !href.slice(prefix.length + 1).includes('/')) return true
    }
    /* `/keystatic/[[...params]]` serves the prefix itself and anything below it. */
    for (const prefix of catchAlls) {
      if (href === prefix || href.startsWith(prefix + '/')) return true
    }
    return false
  }

  it('finds the served pages it is supposed to check', () => {
    expect(pages.length).toBeGreaterThan(50)
  })

  it('has a non-empty route map to check against', () => {
    expect(mapped.size).toBeGreaterThan(20)
    expect(staticPaths.size).toBeGreaterThan(0)
  })

  it('leaves no internal link pointing at nothing', () => {
    const broken: string[] = []
    for (const file of pages) {
      const rel = file.slice(ROOT.length + 1)
      for (const href of internalHrefs(readFileSync(file, 'utf8'))) {
        if (!resolves(href)) broken.push(`${rel}  →  ${href}`)
      }
    }
    expect(broken.sort()).toEqual([])
  })
})
