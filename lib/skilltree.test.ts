import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'

/**
 * THE CAPABILITY CATALOGUE MUST NOT BE ABLE TO CLAIM SOMETHING THAT DOES NOT
 * EXIST.
 *
 * The visual map the owner asked for is ladder-led: each node shows how much of
 * a capability is automated and how much a human still owns. The samples that
 * inspired it are mostly aspirational — one says "just a concept" on screen and
 * most of its nodes read NOT STARTED. That is exactly the failure to avoid
 * here: a map where the real and the imagined look alike is worse than no map.
 *
 * So every capability names the file that implements it, and this asserts the
 * file is there. A capability whose implementation cannot be found is a claim.
 */

const VAULT = join(homedir(), 'swechha-vault')
const CATALOGUE = join(VAULT, 'swechha/ai/capabilities.json')
const ROOTS = [join(homedir()), join(homedir(), '..')]

type Cap = {
  id: string; name: string; department: string; ladder: string; status: string
  implemented_by: string; builds_on: string[]; the_human: string; what: string
}

const load = () => JSON.parse(readFileSync(CATALOGUE, 'utf8')) as {
  ladder: Record<string, string>; status_values: Record<string, string>; capabilities: Cap[]
}

describe('capability catalogue', () => {
  it('exists and is not empty', () => {
    if (!existsSync(CATALOGUE)) return  // vault absent on another machine
    expect(load().capabilities.length).toBeGreaterThan(10)
  })

  it('EVERY capability points at a file that actually exists', () => {
    if (!existsSync(CATALOGUE)) return
    const missing: string[] = []
    for (const c of load().capabilities) {
      // Paths are <repo>/<path>; repos sit beside each other in $HOME.
      const found = ROOTS.some((r) => existsSync(join(r, c.implemented_by)))
      if (!found) missing.push(`${c.id} → ${c.implemented_by}`)
    }
    expect(missing, 'a capability claims an implementation that is not there').toEqual([])
  })

  it('uses only the declared ladder rungs and statuses', () => {
    if (!existsSync(CATALOGUE)) return
    const d = load()
    const rungs = Object.keys(d.ladder)
    const states = Object.keys(d.status_values)
    for (const c of d.capabilities) {
      expect(rungs, `${c.id} has an undeclared ladder rung: ${c.ladder}`).toContain(c.ladder)
      expect(states, `${c.id} has an undeclared status: ${c.status}`).toContain(c.status)
    }
  })

  it('says what the human still owns, for every single one', () => {
    if (!existsSync(CATALOGUE)) return
    for (const c of load().capabilities) {
      expect(c.the_human?.length, `${c.id} does not say what the human owns`).toBeGreaterThan(3)
      expect(c.what?.length, `${c.id} does not say what it does`).toBeGreaterThan(20)
    }
  })

  it('every builds_on names a capability that exists in the catalogue', () => {
    if (!existsSync(CATALOGUE)) return
    const caps = load().capabilities
    const ids = new Set(caps.map((c) => c.id))
    for (const c of caps) {
      for (const dep of c.builds_on ?? []) {
        expect(ids.has(dep), `${c.id} builds_on "${dep}", which is not in the catalogue`).toBe(true)
      }
    }
  })

  it('every department named is in the registry', () => {
    if (!existsSync(CATALOGUE)) return
    const reg = JSON.parse(readFileSync(join(VAULT, 'swechha/ai/departments.json'), 'utf8')) as
      { departments: { id: string }[] }
    const known = new Set(reg.departments.map((d) => d.id))
    for (const c of load().capabilities) {
      expect(known.has(c.department), `${c.id} belongs to unknown department ${c.department}`).toBe(true)
    }
  })

  it('contains nothing merely intended — no aspirational rows', () => {
    /* An intended capability belongs in the department's `planned` field, never
       here. The moment this file mixes them, a reader cannot tell which nodes
       on the map are real. */
    if (!existsSync(CATALOGUE)) return
    for (const c of load().capabilities) {
      expect(c.status, `${c.id} is aspirational and must not be in the catalogue`)
        .not.toMatch(/not_started|planned|proposed|future/i)
    }
  })
})
