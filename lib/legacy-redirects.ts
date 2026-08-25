/**
 * THE WORDPRESS REDIRECTS, GENERATED FROM THE REVIEWED MAP.
 *
 * `docs/legacy/redirect-map.json` is the source of truth: one row per URL
 * captured from the old site on 2026-08-23, each with a destination (or a
 * deliberate `null`), a reason, and a confidence. See `docs/legacy/README.md`
 * for how it was built and which rulings shaped it.
 *
 * Generated at build time rather than committed as a literal, for the same
 * reason the WORK pages are generated: two hand-maintained copies of the same
 * 175 facts drift, and the drift is invisible until a reader hits a dead URL.
 * The map is reviewable; this file is the transformation.
 *
 * TRAILING SLASHES, and the two hops they cost. Every captured URL ends in `/`
 * — WordPress's default — but every source here is emitted WITHOUT one, which
 * was verified in dev rather than reasoned about (2026-08-23):
 *
 *   /campaigns                    308 -> /work/campaigns
 *   /campaigns/                   308 -> /campaigns
 *   /campaigns/  followed         2 hops, final 200 at /work/campaigns
 *
 * So: `trailingSlash` is unset, and Next normalises `/foo/` to `/foo` on its
 * own, independently of user redirects — the second line above happens even
 * though no user redirect matches `/campaigns/`. A slash-free literal source
 * then fires normally (first line). An old URL therefore resolves in TWO hops,
 * and that is accepted rather than worked around: search engines follow short
 * chains and pass link equity through them, and emitting both slashed and
 * unslashed sources would double the table to save one redirect.
 *
 * This is the shape `movedRedirects` already uses, which is why the mechanism
 * could be proved against the running server without deploying anything.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { NextConfig } from 'next'

type Redirects = NonNullable<NextConfig['redirects']>
export type Redirect = Awaited<ReturnType<Redirects>>[number]

export type MapRow = {
  type: string
  from: string
  to: string | null
  why: string
  confidence: string
  title?: string
}

/* `process.cwd()`, not `__dirname`: this module is bundled by both next.config
   and vitest, and a bundled module's `__dirname` is not the project root. Next
   and vitest both run from the root. Same reasoning as design-routes.ts. */
const ROOT = process.cwd()

export function readMap(): MapRow[] {
  return JSON.parse(readFileSync(join(ROOT, 'docs/legacy/redirect-map.json'), 'utf8')) as MapRow[]
}

/** Strip the trailing slash WordPress put on every URL. Root stays `/`. */
export const noSlash = (p: string): string => (p.length > 1 ? p.replace(/\/$/, '') : p)

/**
 * Build the redirect list, refusing rather than emitting something subtly
 * wrong — the same posture as every other generator here.
 *
 * `siteRoutes` is the set of routes that actually exist, passed in rather than
 * imported so the test can exercise the gates without needing built pages.
 */
export function buildLegacyRedirects(rows: MapRow[], siteRoutes: Set<string>): Redirect[] {
  const problems: string[] = []
  const out: Redirect[] = []
  const sources = new Set<string>()

  for (const row of rows) {
    if (!row.to) continue // a deliberate 404; absence is the instruction
    const source = noSlash(row.from)
    const destination = row.to

    /* A 308 to a route that does not exist launders a dead end into a
       live-looking one, which is worse than the 404 it replaces. */
    if (!siteRoutes.has(destination)) {
      problems.push(`${source} -> ${destination} is not a route on this site`)
      continue
    }
    /* An old URL that happens to equal a live route would SHADOW that page —
       the redirect wins and the real page becomes unreachable. */
    if (siteRoutes.has(source)) {
      problems.push(`${source} is a live route; redirecting it would shadow the real page`)
      continue
    }
    if (source === destination) {
      problems.push(`${source} redirects to itself`)
      continue
    }
    if (sources.has(source)) {
      problems.push(`${source} appears twice; the second would be dead weight`)
      continue
    }

    sources.add(source)
    /* `permanent: true` emits a 308, not a 301: it preserves the request
       method, and search engines treat the two as equivalent for transferring
       link equity. */
    out.push({ source, destination, permanent: true })
  }

  /* No chains: a destination that is itself a source costs the reader a second
     round trip, and search engines discount the hop. */
  for (const r of out) {
    if (sources.has(r.destination)) problems.push(`${r.source} -> ${r.destination}, which is itself a source`)
  }

  if (problems.length) {
    throw new Error(
      'legacy-redirects: the reviewed map does not agree with this site:\n' +
        problems.map((p) => `  ${p}`).join('\n') +
        '\nFix docs/legacy/redirect-map.json (via build-redirect-map.mjs), not this file.',
    )
  }
  return out
}
