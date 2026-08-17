import { describe, it, expect } from 'vitest'
import { resolveStatus } from './status'

describe('resolveStatus', () => {
  it('resolves active+critical to the critical signal', () => {
    const v = resolveStatus('active', 'critical')
    expect(v.label).toBe('Critical')
    expect(v.color).toBe('var(--color-status-critical)')
    expect(v.colorBright).toBe('var(--color-status-critical-bright)')
  })

  it('resolves active+water to the water signal', () => {
    expect(resolveStatus('active', 'water').label).toBe('Water')
  })

  it('resolves monitoring to the watch family regardless of severity', () => {
    const v = resolveStatus('monitoring', 'critical')
    expect(v.label).toBe('Monitoring')
    expect(v.color).toBe('var(--color-status-watch)')
  })

  it('resolves achieved to the nature signal', () => {
    expect(resolveStatus('achieved').label).toBe('Achieved')
    expect(resolveStatus('achieved').color).toBe('var(--color-status-nature)')
  })

  it('resolves archived to monochrome, not a signal colour', () => {
    const v = resolveStatus('archived')
    expect(v.label).toBe('Archived')
    expect(v.color).toBe('var(--color-ink-muted)')
    expect(v.colorBright).toBe('var(--color-ink-muted)')
  })
})
