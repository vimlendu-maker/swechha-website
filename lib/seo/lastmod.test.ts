import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'

describe('sitemap lastmod', () => {
  it('gives every routed page a stored date', () => {
    const stored = JSON.parse(readFileSync('data/seo/lastmod.json', 'utf8'))
    const routes = Object.keys(JSON.parse(readFileSync('data/seo/pages.json', 'utf8')))
    for (const r of routes) expect(stored[r]?.date, `${r} has no stored date`).toBeTruthy()
  })

  it('does not claim every page changed at the same instant', () => {
    const stored = JSON.parse(readFileSync('data/seo/lastmod.json', 'utf8'))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- stored is untyped JSON
    const dates = new Set(Object.values(stored).map((v: any) => v.date))
    expect(dates.size, 'all pages share one lastmod — the mtime bug is back').toBeGreaterThan(1)
  })
})
