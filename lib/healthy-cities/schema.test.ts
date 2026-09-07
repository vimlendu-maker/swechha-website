import { describe, expect, it } from 'vitest'
import { readdirSync } from 'node:fs'
import { loadFellows, loadProgramme, FELLOW_DIR, WITHHELD } from './schema'

describe('healthy-cities data', () => {
  it('has exactly ten fellows, one file each', () => {
    const files = readdirSync(FELLOW_DIR).filter(f => f.endsWith('.json'))
    expect(files).toHaveLength(10)
  })

  it('validates every fellow file and matches slug to filename', () => {
    const files = readdirSync(FELLOW_DIR).filter(f => f.endsWith('.json'))
    for (const f of files) {
      const fellow = loadFellows().find(x => x.slug === f.replace(/\.json$/, ''))
      expect(fellow, `${f} slug must equal its filename`).toBeDefined()
    }
  })

  it('gives every figure a period, a basis and a source', () => {
    const all = [...loadProgramme().figures, ...loadFellows().flatMap(f => f.figures)]
    expect(all.length).toBeGreaterThan(0)
    for (const fig of all) {
      expect(fig.period, `${fig.label} needs a period`).toBeTruthy()
      expect(['counted', 'modelled']).toContain(fig.basis)
      expect(fig.source, `${fig.label} needs a source`).toBeTruthy()
    }
  })

  it('publishes no withheld figure', () => {
    const hay = JSON.stringify([loadProgramme(), loadFellows()])
    for (const banned of WITHHELD) {
      expect(hay, `${banned} is withheld by the spec`).not.toContain(banned)
    }
  })

  it('carries no internal ledger reference in any string', () => {
    const hay = JSON.stringify([loadProgramme(), loadFellows()])
    for (const re of [/SOURCE-FACTS/, /§/, /\bAD-2\d\b/, /\bD-0\d\b/, /\bW-1\d\b/]) {
      expect(hay).not.toMatch(re)
    }
  })

  it('gives the programme a 140-158 character share description', () => {
    const d = loadProgramme().description
    expect(d.length).toBeGreaterThanOrEqual(140)
    expect(d.length).toBeLessThanOrEqual(158)
  })

  it('names the parent programme and links to it', () => {
    const anc = loadProgramme().ancestor
    expect(anc.label).toBeTruthy()
    expect(anc.href).toMatch(/^\//)
  })

  it('says who Swechha is on the page itself', () => {
    expect(loadProgramme().identity.trim().length).toBeGreaterThan(0)
  })

  it('sources the funder rank and never marks more leads than there are funders', () => {
    const w = loadProgramme().with
    expect(w.funders.length).toBeGreaterThan(0)
    expect(w.funders_source, 'a rank on a published list is a claim').toBeTruthy()
    expect(w.funders_lead).toBeLessThanOrEqual(w.funders.length)
  })

  it('resolves every voice pointer to a real quote on that fellow page', () => {
    const fellows = loadFellows()
    expect(loadProgramme().quotes, 'the hub copies nothing').toHaveLength(0)
    for (const v of loadProgramme().voices) {
      const f = fellows.find(x => x.slug === v.fellow)
      expect(f, `voices points at ${v.fellow}, which is not a fellow`).toBeDefined()
      expect(f!.quotes.map(q => q.text), `${v.fellow} has no such quote`).toContain(v.quote)
    }
  })

  it('gives every frame a descriptive alt of at least six words', () => {
    const frames = [...loadProgramme().frames ?? [], ...loadFellows().flatMap(f => f.frames ?? [])]
    for (const fr of frames) {
      expect(fr.alt.trim().split(/\s+/).length, `${fr.src} alt is too short`).toBeGreaterThanOrEqual(6)
      expect(fr, `${fr.src} must not claim baked colour`).not.toHaveProperty('baked')
    }
  })

  it('spans the eight states the cohort is reported across', () => {
    const states = new Set(loadFellows().map(f => f.state))
    expect(states.size).toBe(8)
  })

  // Controller ruling 2: two positive assertions in place of the two
  // WITHHELD strings that could never appear in the data anyway. The real
  // defect they guard against is one fellow's file inheriting another's
  // location. These fail until Task 2 authors the data — that is expected.
  it('keeps Mansi Thakar Jani in Gujarat', () => {
    const m = loadFellows().find(f => f.slug === 'mansi-thakar-jani')
    expect(m?.state).toBe('Gujarat')
  })

  it('places only Tawheed Zubair in Moradabad', () => {
    for (const f of loadFellows()) {
      if (f.slug === 'tawheed-zubair') continue
      expect(f.place, `${f.slug} must not inherit Tawheed's location`).not.toMatch(/Moradabad/i)
    }
  })
})
