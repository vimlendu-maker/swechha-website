import { describe, it, expect } from 'vitest'
// A plain .mjs with no declaration file, inferred through `allowJs` — the same
// arrangement lib/scripts-parse.test.ts uses for scripts/check-parse.mjs.
import { istDay, statValue, fillDaily, suspectedGaps } from '../scripts/lib/umami-shape.mjs'

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * THE UMAMI PULL'S FOUR SILENT FAILURES.
 * ───────────────────────────────────────────────────────────────────────────
 * scripts/umami.mjs is mostly a credential, four HTTP calls and a file write,
 * and all of those fail loudly. These four do not: each one's failure mode is
 * a file full of plausible numbers. That is the only kind this repository
 * treats as dangerous, because a wrong number nobody can see is a number that
 * gets quoted.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/** Midnight IST on the given date, as epoch ms. */
const ist = (d: string) => Date.parse(`${d}T00:00:00+05:30`)

describe('statValue — the version difference that would zero every figure', () => {
  it('reads Umami v3\'s { value, prev } envelope', () => {
    expect(statValue({ value: 1234, prev: 900 })).toBe(1234)
  })

  it('reads an older version\'s bare number', () => {
    /* ★ THE REGRESSION THIS EXISTS FOR. `.value` on a number is `undefined`,
       so a version change would have written 0 for every total while the run
       reported success and the JSON looked structurally perfect. */
    expect(statValue(4321)).toBe(4321)
  })

  it('turns anything else into 0, never NaN', () => {
    /* NaN survives JSON.stringify as `null`, which reads later as "no data"
       rather than "this script could not parse the response". */
    for (const bad of [undefined, null, 'twelve', {}, { prev: 3 }]) {
      expect(statValue(bad as never)).toBe(0)
    }
  })
})

describe('istDay — the boundary that files an Indian evening under tomorrow', () => {
  it('keeps 23:30 IST on its own date', () => {
    expect(istDay(Date.parse('2026-09-17T23:30:00+05:30'))).toBe('2026-09-17')
  })

  it('does not roll a late-evening IST reading into the next UTC day', () => {
    /* 19:00 IST is 13:30 UTC — same day either way. 23:30 IST is 18:00 UTC,
       also the same day. The one that matters is the reverse direction: a UTC
       reading at 20:00 is already the next day in IST. */
    expect(istDay(Date.parse('2026-09-17T20:00:00Z'))).toBe('2026-09-18')
  })
})

describe('fillDaily — an absent bucket is a zero, not a missing row', () => {
  const w = { startAt: ist('2026-09-01'), endAt: ist('2026-09-05') }

  it('emits one row per day in the window even when Umami returns none', () => {
    const out = fillDaily(w, [], [])
    expect(out.map((r: { date: string }) => r.date)).toEqual([
      '2026-09-01', '2026-09-02', '2026-09-03', '2026-09-04',
    ])
    expect(out.every((r: { pageviews: number }) => r.pageviews === 0)).toBe(true)
  })

  it('places each returned bucket on its own date and zeroes the rest', () => {
    const out = fillDaily(
      w,
      [{ x: '2026-09-02', y: 40 }, { x: '2026-09-04', y: 7 }],
      [{ x: '2026-09-02', y: 12 }],
    )
    expect(out).toEqual([
      { date: '2026-09-01', pageviews: 0, sessions: 0 },
      { date: '2026-09-02', pageviews: 40, sessions: 12 },
      { date: '2026-09-03', pageviews: 0, sessions: 0 },
      { date: '2026-09-04', pageviews: 7, sessions: 0 },
    ])
  })

  it('accepts a full timestamp as the bucket key, not just a date', () => {
    /* Umami has returned both `2026-09-02` and `2026-09-02T00:00:00.000Z` for
       the same bucket across versions; the slice(0,10) is what makes those the
       same key rather than two rows that never match. */
    const out = fillDaily(w, [{ x: '2026-09-03T00:00:00.000Z', y: 9 }], [])
    expect(out.find((r: { date: string }) => r.date === '2026-09-03')?.pageviews).toBe(9)
  })
})

describe('suspectedGaps — a hole with traffic on both sides', () => {
  const day = (date: string, pageviews: number) => ({ date, pageviews, sessions: 0 })

  it('flags a zero day between two days that had traffic', () => {
    expect(suspectedGaps([
      day('2026-09-01', 10), day('2026-09-02', 0), day('2026-09-03', 12),
    ])).toEqual(['2026-09-02'])
  })

  it('does NOT flag the first or last day of the window', () => {
    /* ★ The window starts and ends on an hour, not at midnight IST, so its
       edge days are partial and a zero there is ordinary. Flagging them would
       fire on a large share of runs and the warning would stop being read —
       the "notification people mute" this repo warns about elsewhere. */
    expect(suspectedGaps([
      day('2026-09-01', 0), day('2026-09-02', 10), day('2026-09-03', 0),
    ])).toEqual([])
  })

  it('does not flag a genuinely quiet stretch', () => {
    /* Consecutive zeros are what a site with no readers looks like. Only a
       hole bounded by traffic distinguishes a collection gap from quiet. */
    expect(suspectedGaps([
      day('2026-09-01', 5), day('2026-09-02', 0), day('2026-09-03', 0), day('2026-09-04', 0),
    ])).toEqual([])
  })

  it('finds every separate gap, not just the first', () => {
    expect(suspectedGaps([
      day('2026-09-01', 5), day('2026-09-02', 0), day('2026-09-03', 5),
      day('2026-09-04', 0), day('2026-09-05', 5),
    ])).toEqual(['2026-09-02', '2026-09-04'])
  })

  it('returns nothing for a window too short to have a middle', () => {
    expect(suspectedGaps([])).toEqual([])
    expect(suspectedGaps([day('2026-09-01', 0)])).toEqual([])
    expect(suspectedGaps([day('2026-09-01', 5), day('2026-09-02', 0)])).toEqual([])
  })
})
