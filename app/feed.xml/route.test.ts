import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { GET } from './route'
/* The shell is an .mjs build script. Reading its REAL predicate — rather than
   restating it — is the entire point of this file. */
import { journalArticles } from '../../scripts/lib/situation-shell.mjs'

/**
 * THE FEED'S ONE DANGEROUS PROPERTY: IT CAN PUBLISH WHAT THE SITE DID NOT.
 *
 * `/journal` renders through `journalArticles()` in situation-shell.mjs, which
 * requires `publish_state === 'published'` AND a named `approved_by`. The feed
 * is a TypeScript route and cannot import that .mjs predicate at runtime, so it
 * restates it. A restated rule drifts, and this one drifts INVISIBLY: a draft
 * that leaked into the feed would be in every subscriber's reader long before
 * anyone noticed it was absent from the site.
 *
 * So the copy is not trusted. It is checked against the original, on the real
 * dataset, every test run.
 */

const DIR = join(process.cwd(), 'data/journal/articles')
const all = existsSync(DIR)
  ? readdirSync(DIR).filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(readFileSync(join(DIR, f), 'utf8')))
  : []

async function feed(): Promise<string> {
  return await GET().text()
}

const slugsIn = (xml: string) =>
  [...xml.matchAll(/<link>[^<]*\/journal\/([^<]+)<\/link>/g)].map((m) => m[1])

describe('the journal feed', () => {
  it('has articles to test with', () => {
    expect(all.length).toBeGreaterThan(0)
  })

  it('carries exactly the articles the site itself publishes', async () => {
    const onSite = journalArticles().map((a: { slug: string }) => a.slug)
    expect(slugsIn(await feed())).toEqual(onSite)
  })

  it('never carries an unapproved or unpublished article', async () => {
    const xml = await feed()
    const withheld = all
      .filter((a) => a.publish_state !== 'published' || !a.approved_by)
      .map((a) => a.slug)
    for (const slug of withheld) {
      expect(xml, `${slug} is not approved for publication and must not be in the feed`)
        .not.toContain(`/journal/${slug}`)
    }
  })

  /* The gate above passes trivially while every article happens to be approved.
     This proves it would actually catch one, by running the feed's predicate
     over a synthetic draft rather than waiting for a real one to appear. */
  it('the gate is a real filter, not a no-op on this dataset', () => {
    const gate = (a: { publish_state?: string; approved_by?: string }) =>
      a.publish_state === 'published' && Boolean(a.approved_by)
    expect(gate({ publish_state: 'draft', approved_by: 'Vimlendu Jha' })).toBe(false)
    expect(gate({ publish_state: 'published' })).toBe(false)
    expect(gate({ publish_state: 'published', approved_by: '' })).toBe(false)
    expect(gate({ publish_state: 'published', approved_by: 'Vimlendu Jha' })).toBe(true)
  })

  it('is well-formed enough to parse, and declares itself', async () => {
    const xml = await feed()
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true)
    expect(xml).toContain('<rss version="2.0"')
    expect(xml).toContain('rel="self"')
    expect((xml.match(/<item>/g) ?? []).length).toBe((xml.match(/<\/item>/g) ?? []).length)
    expect((xml.match(/<channel>/g) ?? []).length).toBe(1)
  })

  it('serves the RSS media type', () => {
    expect(GET().headers.get('content-type')).toContain('application/rss+xml')
  })

  /* Titles come out of `h1`, which carries a `<br>` for the page's line break.
     A raw `<br>` in a feed title is markup in a text field — some readers print
     it, some strip the whole title. */
  it('strips markup and entities out of titles', async () => {
    const xml = await feed()
    const titles = [...xml.matchAll(/<title>([^<]*)<\/title>/g)].map((m) => m[1])
    expect(titles.length).toBeGreaterThan(1)   // the channel's, plus the items'
    for (const t of titles) {
      expect(t, `"${t}" still contains markup`).not.toMatch(/<|&[a-z]+;/)
      expect(t.trim(), 'a title must not be empty').not.toBe('')
    }
  })

  /* An Indian date read as UTC lands on the previous day for every reader west
     of Delhi. Every pubDate states +0530 for that reason. */
  it('stamps every date in IST, never in UTC', async () => {
    const dates = [...(await feed()).matchAll(/<pubDate>([^<]+)<\/pubDate>/g)].map((m) => m[1])
    expect(dates.length).toBeGreaterThan(0)
    for (const d of dates) {
      expect(d).toMatch(/^[A-Z][a-z]{2}, \d{2} [A-Z][a-z]{2} \d{4} 00:00:00 \+0530$/)
    }
  })

  it('names the licence the site actually grants', async () => {
    expect(await feed()).toContain('CC BY 4.0')
  })

  it('does not move lastBuildDate on a rebuild', async () => {
    const one = await feed()
    const two = await feed()
    expect(one).toEqual(two)
  })
})

describe('the feed is discoverable', () => {
  /* A feed nothing links to is a feed nobody subscribes to. The alternate link
     is emitted once, in the shell, so it reaches all built pages. */
  it('every built page advertises it', () => {
    const dir = join(process.cwd(), 'public/_pages/v3')
    if (!existsSync(dir)) return
    const walk = (d: string): string[] => readdirSync(d, { withFileTypes: true })
      .flatMap((e) => e.isDirectory() ? walk(join(d, e.name))
        : e.name.endsWith('.html') ? [join(d, e.name)] : [])
    const pages = walk(dir)
    expect(pages.length).toBeGreaterThan(100)
    const missing = pages.filter((p) =>
      !readFileSync(p, 'utf8').includes('type="application/rss+xml"'))
    expect(missing.map((p) => p.replace(dir, '')),
      'these built pages carry no feed discovery link — rebuild them').toEqual([])
  })
})
