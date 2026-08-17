export const LIFECYCLE_STATUSES = ['active', 'monitoring', 'achieved', 'archived'] as const
export type LifecycleStatus = (typeof LIFECYCLE_STATUSES)[number]

export const SEVERITIES = ['critical', 'warning', 'watch', 'water'] as const
export type Severity = (typeof SEVERITIES)[number]

export interface StatusVisual {
  label: string
  color: string
  colorBright: string
}

const SEVERITY_VISUAL: Record<Severity, StatusVisual> = {
  critical: {
    label: 'Critical',
    color: 'var(--color-status-critical)',
    colorBright: 'var(--color-status-critical-bright)',
  },
  warning: {
    label: 'Warning',
    color: 'var(--color-status-warning)',
    colorBright: 'var(--color-status-warning-bright)',
  },
  watch: {
    label: 'Watch',
    color: 'var(--color-status-watch)',
    colorBright: 'var(--color-status-watch-bright)',
  },
  water: {
    label: 'Water',
    color: 'var(--color-status-water)',
    colorBright: 'var(--color-status-water-bright)',
  },
}

/**
 * The one place a Situation's lifecycle + severity becomes a colour and a
 * label. Used identically by StatusBadge and LifecycleTimeline so the two
 * can never disagree about what a given state looks like.
 *
 * - `active` shows the situation's real severity signal.
 * - `monitoring` is always the watch family, regardless of severity — a
 *   de-escalated state is visually distinct from an escalating one.
 * - `achieved` is the one place green (`nature`) is used — a verified
 *   positive outcome, never decoration.
 * - `archived` gets no signal colour at all: history is not a live signal.
 */
export function resolveStatus(
  status: LifecycleStatus,
  severity?: Severity | null,
): StatusVisual {
  if (status === 'active' && severity) return SEVERITY_VISUAL[severity]

  if (status === 'monitoring') {
    return { label: 'Monitoring', color: 'var(--color-status-watch)', colorBright: 'var(--color-status-watch-bright)' }
  }
  if (status === 'achieved') {
    return { label: 'Achieved', color: 'var(--color-status-nature)', colorBright: 'var(--color-status-nature-bright)' }
  }
  return { label: 'Archived', color: 'var(--color-ink-muted)', colorBright: 'var(--color-ink-muted)' }
}
