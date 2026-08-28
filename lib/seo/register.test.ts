import { describe, it, expect } from 'vitest'
import { designRoutes } from '@/design-routes'
import { SEO } from '@/lib/seo/register'

const decode = (s: string) =>
  s.replace(/&mdash;/g, '—').replace(/&rsquo;/g, '’')
   .replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ')

describe('the SEO register', () => {
  /* DISASTER PAGES ARE EXCLUDED FROM THE REGISTER, DELIBERATELY.
     `/now/climate-event/<slug>` is derived from whatever the event detector
     currently has above its publication bar — a set that is empty most weeks
     and changes without a human editing anything. A static register cannot
     hold an entry per page when the pages appear and expire on their own, and
     requiring one would mean either committing an entry for an event that no
     longer exists or failing this test every time a disaster is detected.

     They are not exempt from the RULES, only from the register: those pages
     pass `title` and `desc` straight to assemble(), which applies the same
     140-158 character description gate and refuses to write a page that
     misses it. See scripts/build-climate-disaster-pages.mjs. */
  const isDerivedEventPage = (r: string) => /^\/now\/climate-event\/.+/.test(r)
  const routes = designRoutes().map((r) => r.source).filter((r) => !isDerivedEventPage(r))

  it('has exactly one entry per routed page', () => {
    expect([...Object.keys(SEO)].sort()).toEqual([...routes].sort())
  })

  it('gives every route a non-empty title and description', () => {
    for (const [route, e] of Object.entries(SEO)) {
      expect(e.title, `${route} title`).toBeTruthy()
      expect(e.description, `${route} description`).toBeTruthy()
    }
  })

  /* indexName IS A SEPARATE JOB FROM title. It is the short editorial name
     /search has always shown as visible, reader-facing text ("Now", "Delhi's
     air", "Campaigns") — never a SERP string, which is what `title` became in
     Task 5. No length or TERMS rule applies here on purpose: an editorial name
     is not written to be typed into Google, so judging it by that rule would
     be judging it by the wrong standard. */
  it('gives every route a non-empty, unique indexName', () => {
    for (const [route, e] of Object.entries(SEO)) {
      expect(e.indexName, `${route} indexName`).toBeTruthy()
    }
    const names = Object.values(SEO).map((e) => e.indexName)
    expect(new Set(names).size).toBe(names.length)
  })

  it('keeps every title at or under 60 rendered characters', () => {
    for (const [route, e] of Object.entries(SEO)) {
      expect(decode(e.title).length, `${route}: "${e.title}"`).toBeLessThanOrEqual(60)
    }
  })

  it('keeps every description between 140 and 158 characters', () => {
    for (const [route, e] of Object.entries(SEO)) {
      const n = decode(e.description).length
      expect(n, `${route} description is ${n} chars`).toBeGreaterThanOrEqual(140)
      expect(n, `${route} description is ${n} chars`).toBeLessThanOrEqual(158)
    }
  })

  it('never repeats a title or a description', () => {
    const titles = Object.values(SEO).map((e) => e.title)
    const descs = Object.values(SEO).map((e) => e.description)
    expect(new Set(titles).size).toBe(titles.length)
    expect(new Set(descs).size).toBe(descs.length)
  })

  /* A LENGTH FLOOR ALONE IS NOT ENOUGH — "Publications — Swechha" clears any
     sane floor and still tells a searcher nothing. The rule is that the part
     before the brand suffix has to carry a term someone might actually type.
     Extend TERMS when a page legitimately needs a new one; never delete the
     check for a page. */
  const TERMS = [
    'delhi', 'india', 'ngo', 'environmental', 'environment', 'school', 'student',
    'volunteer', 'river', 'yamuna', 'climate', 'air', 'forest', 'farm', 'donate',
    'report', 'camp', 'city', 'nature', 'waste', 'water', 'youth', 'community',
    'fellowship', 'workshop', 'garden', 'heat', 'rain', 'pollution', 'aravalli',
  ]

  it('gives every title a term a searcher might type', () => {
    for (const [route, e] of Object.entries(SEO)) {
      const head = decode(e.title).replace(/\s*—\s*Swechha\s*$/, '')
      expect(head.length, `${route}: "${e.title}" is a bare label`).toBeGreaterThanOrEqual(15)
      const hit = TERMS.some((t) => head.toLowerCase().includes(t))
      expect(hit, `${route}: "${e.title}" carries no query term`).toBe(true)
    }
  })
})
