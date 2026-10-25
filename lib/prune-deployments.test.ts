import { describe, it, expect, vi } from 'vitest'
import { pickDeletable, pruneDeployments, PRUNE_KEEP } from './prune-deployments'

const mk = (n: number) => Array.from({ length: n }, (_, i) => ({ uid: `d${i}`, created: 1000 + i }))
const ok = (body: unknown) => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(body) } as Response)

describe('pickDeletable', () => {
  it('keeps the newest N and returns the rest', () => {
    const out = pickDeletable(mk(20), new Set())
    expect(out).toHaveLength(20 - PRUNE_KEEP)
    expect(out.every((d) => d.created < 1000 + 20 - PRUNE_KEEP)).toBe(true)
  })
  it('never returns a protected deployment even when old', () => {
    const out = pickDeletable(mk(20), new Set(['d0']))
    expect(out.find((d) => d.uid === 'd0')).toBeUndefined()
  })
})

describe('pruneDeployments', () => {
  const env = { token: 't', projectId: 'p', teamId: 'T', currentDeploymentId: 'd19' }
  it('does nothing without a token', async () => {
    const f = vi.fn()
    expect((await pruneDeployments({ ...env, token: undefined }, f as never)).ran).toBe(false)
    expect(f).not.toHaveBeenCalled()
  })
  it('refuses when no production deployment is identified', async () => {
    const f = vi.fn((_u: string, _i?: RequestInit) => ok({ targets: {} }))
    const r = await pruneDeployments({ ...env, currentDeploymentId: undefined }, f as never)
    expect(r.ran).toBe(false)
    expect(f.mock.calls.every((c) => !(c[1] as RequestInit | undefined)?.method)).toBe(true)
  })
  it('deletes only old unprotected deployments, capped per run', async () => {
    const calls: string[] = []
    const f = vi.fn((url: string, init?: RequestInit) => {
      if (init?.method === 'DELETE') { calls.push(url); return ok({}) }
      if (url.includes('/v9/projects')) return ok({ targets: { production: { id: 'd5' } } })
      return ok({ deployments: mk(40), pagination: { next: null } })
    })
    const r = await pruneDeployments(env, f as never)
    expect(r.ran).toBe(true)
    expect(calls).toHaveLength(8)
    expect(calls.some((u) => u.includes('/d5?') || u.includes('/d19?'))).toBe(false)
    expect(calls.some((u) => u.includes('/d0?'))).toBe(true)
  })
})
