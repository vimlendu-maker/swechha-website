import { describe, it, expect } from 'vitest'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

/**
 * verify-data-fidelity.mjs GUARDS THE CMS ROUND-TRIP: Keystatic writes
 * data/**.json by serialising its schema, so anything the schema does not
 * declare is not written back, and a dropped `source` or `basis` turns a
 * sourced figure into an unsourced one with nothing else noticing.
 *
 * ★ IT CALLED A REORDER A DELETION, ON A REAL COMMIT.
 * `figures[]` in data/climate-events/context/glof.json were re-sorted into
 * editorial order — which figure appears in which band on the page — and
 * nothing was removed. Compared positionally, every shifted element read as an
 * edit and two read as losses: "value emptied figures[5].unit" and "key removed
 * figures[5].supports", when figures[5] before and figures[5] after were simply
 * different figures. The figure in question still carried its unit throughout.
 *
 * That is worse than a nuisance: a reorder in the same commit as a genuine
 * deletion buries the deletion in false positives, which is the failure mode of
 * a guard nobody can read. So arrays of records are paired by identity now, and
 * these tests hold both halves of that — the reorder is forgiven, the deletion
 * is still caught.
 */
const SCRIPT = join(__dirname, '..', 'scripts', 'verify-data-fidelity.mjs')

function run(before: unknown, after: unknown) {
  const dir = mkdtempSync(join(tmpdir(), 'fidelity-'))
  try {
    for (const [name, val] of [['before', before], ['after', after]] as const) {
      mkdirSync(join(dir, name), { recursive: true })
      writeFileSync(join(dir, name, 'f.json'), JSON.stringify(val, null, 1))
    }
    try {
      const out = execFileSync(process.execPath, [SCRIPT, join(dir, 'before'), join(dir, 'after')],
        { encoding: 'utf8' })
      return { ok: true, out }
    } catch (e) {
      const err = e as { stdout?: string }
      return { ok: false, out: err.stdout ?? '' }
    }
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

const FIGS = (order: string[]) => ({
  figures: order.map((label) => ({
    label,
    value: label === 'B' ? '766' : '1',
    ...(label === 'B' ? { unit: 'events, 1533-2025' } : {}),
    source: 's1',
  })),
})

describe('an array of records is compared by identity, not by position', () => {
  it('forgives a pure reorder', () => {
    const r = run(FIGS(['A', 'B', 'C']), FIGS(['C', 'A', 'B']))
    // NOT /key removed/ — the tool's own SUCCESS line reads "No key removed,
    // nulled or emptied", so that pattern matches a clean run too. The thing
    // that means a loss was found is the refusal.
    expect(r.out).not.toMatch(/REFUSING/)
    expect(r.out).toMatch(/No key removed, nulled or emptied/)
    expect(r.ok, `a reorder is not a loss:\n${r.out}`).toBe(true)
  })

  it('still catches a record that actually disappeared', () => {
    const r = run(FIGS(['A', 'B', 'C']), FIGS(['C', 'A']))
    expect(r.ok).toBe(false)
    expect(r.out).toMatch(/record removed/)
    expect(r.out).toMatch(/label=B/)
  })

  it('still catches a key removed from a record that moved', () => {
    const before = FIGS(['A', 'B'])
    const after = FIGS(['B', 'A'])
    delete (after.figures.find((f) => f.label === 'B') as Record<string, unknown>).unit
    const r = run(before, after)
    expect(r.ok).toBe(false)
    // Named by identity, so the message points at the figure a person can find.
    expect(r.out).toMatch(/label=B\]\.unit/)
  })

  it('names the loss by identity rather than by index', () => {
    const r = run(FIGS(['A', 'B']), FIGS(['A']))
    expect(r.out).toMatch(/label=B/)
    expect(r.out).not.toMatch(/figures\[1\]/)
  })

  it('falls back to position for an array of plain strings', () => {
    expect(run({ a: ['x', 'y'] }, { a: ['x', 'y'] }).ok).toBe(true)
    const r = run({ a: ['x', 'y'] }, { a: ['x'] })
    expect(r.ok).toBe(false)
    expect(r.out).toMatch(/array shortened/)
  })

  it('does not pair on a field that is not unique', () => {
    // Two records sharing an id cannot be matched by it; positional is correct.
    const before = { r: [{ id: 'same', v: 1 }, { id: 'same', v: 2 }] }
    const after = { r: [{ id: 'same', v: 1 }, { id: 'same', v: 2 }] }
    expect(run(before, after).ok).toBe(true)
  })
})
