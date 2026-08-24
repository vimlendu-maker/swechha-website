import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { readFileSync, mkdtempSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { stampLastmod } from '../../scripts/lib/lastmod.mjs'

/* THIS FILE TESTS THE FUNCTION, NOT TODAY'S DATA. An earlier version of this
   suite asserted `new Set(dates).size > 1` against the real
   `data/seo/lastmod.json` — a fact about the repository's history (whether
   more than one page has changed since the register was created), not a
   property `stampLastmod` can guarantee. On the day the register is first
   populated, every route is new to it and every route legitimately gets the
   same date; that is not a bug, and no implementation could make the old
   assertion pass on that day without fabricating dates. The property that
   actually distinguishes this from the old file-mtime bug is IDEMPOTENCE —
   unchanged content keeps its stored date no matter how many times it is
   rebuilt — which is what every test below actually exercises, against a
   throwaway register in a temp dir so no tracked file is touched and no
   assertion depends on the real clock. */

let dir: string
let reg: string

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'lastmod-test-'))
  reg = join(dir, 'lastmod.json')
})

afterEach(() => {
  rmSync(dir, { recursive: true, force: true })
})

describe('stampLastmod', () => {
  it('records both a hash and the given date on first stamp', () => {
    stampLastmod('/x', '<html>a</html>', '2026-01-01', reg)
    const store = JSON.parse(readFileSync(reg, 'utf8'))
    expect(store['/x'].date).toBe('2026-01-01')
    expect(store['/x'].hash).toBeTruthy()
  })

  it('IDEMPOTENCE — re-stamping identical content with a later date leaves the stored date unchanged', () => {
    stampLastmod('/x', '<html>a</html>', '2026-01-01', reg)
    stampLastmod('/x', '<html>a</html>', '2026-01-15', reg)
    const store = JSON.parse(readFileSync(reg, 'utf8'))
    expect(store['/x'].date).toBe('2026-01-01')
  })

  it('a changed page body with a later date moves the date, and the hash changes with it', () => {
    stampLastmod('/x', '<html>a</html>', '2026-01-01', reg)
    const before = JSON.parse(readFileSync(reg, 'utf8'))['/x'].hash
    stampLastmod('/x', '<html>b</html>', '2026-01-15', reg)
    const after = JSON.parse(readFileSync(reg, 'utf8'))['/x']
    expect(after.date).toBe('2026-01-15')
    expect(after.hash).not.toBe(before)
  })

  it('is byte-stable: stamping the same unchanged content twice produces an identical file', () => {
    stampLastmod('/x', '<html>a</html>', '2026-01-01', reg)
    const first = readFileSync(reg, 'utf8')
    stampLastmod('/x', '<html>a</html>', '2026-01-15', reg)
    const second = readFileSync(reg, 'utf8')
    expect(second).toBe(first)
  })
})

describe('sitemap lastmod register', () => {
  it('gives every routed page a stored date', () => {
    const stored = JSON.parse(readFileSync('data/seo/lastmod.json', 'utf8'))
    const routes = Object.keys(JSON.parse(readFileSync('data/seo/pages.json', 'utf8')))
    for (const r of routes) expect(stored[r]?.date, `${r} has no stored date`).toBeTruthy()
  })
})
