import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * THE RUNNER RAISES AN INCIDENT, AND AN INCIDENT IS NOT A TASK.
 *
 * A task is work somebody must do. An incident is a FAULT: deduplicated by
 * signature so a flapping service is one row with a count rather than forty,
 * dispatched ONCE to a phone, and closed only when a person says what the
 * outcome was. ADR-0010.
 *
 * ★ THE ERROR TEXT STAYS LOCAL. It is what the signature is computed from and
 *   it lands in the incident record on this machine. What reaches the phone is
 *   a closed vocabulary that CANNOT express it — department, kind, count,
 *   minutes, id — because the ntfy topic is a bearer URL. These assertions
 *   guard the runner's half of that: it must pass a KIND that is a bare
 *   identifier, never a sentence.
 */
const RUN = readFileSync(join(__dirname, '..', 'scripts', 'website-team', 'run.sh'), 'utf8')

describe('run.sh and the incident store', () => {
  it('raises one when the model call fails', () => {
    expect(RUN).toContain('spine_incident model_call_failed')
  })

  it('raises one when the run is blocked by refused tools', () => {
    expect(RUN).toContain('spine_incident tools_refused')
  })

  it('passes a bare identifier as the kind, never a sentence', () => {
    // org/notify.py refuses anything else — a kind must match ^[a-z][a-z0-9_]*$
    // or the payload cannot be built. A sentence here would mean the incident
    // is raised locally and the phone never rings, silently.
    for (const m of RUN.matchAll(/spine_incident ([^\s"]+)/g)) {
      expect(m[1], `not a bare identifier: ${m[1]}`).toMatch(/^[a-z][a-z0-9_]{1,40}$/)
    }
  })

  it('swallows its own failure like every other spine call', () => {
    // lib/website-team-spine.test.ts asserts this for every line touching $ORG.
    // A runner must not die because the incident store is unavailable.
    const i = RUN.indexOf('spine_incident() {')
    expect(i).toBeGreaterThan(-1)
    const body = RUN.slice(i, RUN.indexOf('\n}', i))
    expect(body).toContain('|| true')
    expect(body).toContain('[ -x "$ORG" ] || return 0')
  })

  it('is defined before it is called', () => {
    // Bash resolves a function at CALL time. The model-failure handler sits
    // above where the spine helpers used to live, and that ordering bug was
    // caught once already tonight by the denials test.
    const def = RUN.indexOf('spine_incident() {')
    const firstUse = RUN.indexOf('spine_incident ', def + 20)
    expect(def).toBeLessThan(firstUse)
  })

  it('dispatches, rather than filing silently', () => {
    // --notify, or the incident exists on disk and the phone never rings.
    const i = RUN.indexOf('spine_incident() {')
    expect(RUN.slice(i, RUN.indexOf('\n}', i))).toContain('--notify')
  })
})
