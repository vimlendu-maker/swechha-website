export const LIFECYCLE_STATUSES = ['active', 'monitoring', 'achieved', 'archived'] as const
export type LifecycleStatus = (typeof LIFECYCLE_STATUSES)[number]

export const SEVERITIES = ['critical', 'warning', 'watch', 'water'] as const
export type Severity = (typeof SEVERITIES)[number]

export interface StatusVisual {
  label: string
  color: string
  colorBright: string
  /** Foreground text colour for use ON `color` (the light-canvas fill). */
  fg: string
  /** Foreground text colour for use ON `colorBright` (the dark-canvas fill). */
  fgBright: string
}

// Foreground pairs below are WCAG 2.1 relative-luminance verified against
// each signal's actual fill colour (see the final whole-branch review,
// 2026-08-17) — do not swap these for a blanket white/near-black guess.
// warning/watch fail contrast with white text on their light-canvas fill,
// so those two use pure black instead; everything else already passed.
const SEVERITY_VISUAL: Record<Severity, StatusVisual> = {
  critical: {
    label: 'Critical',
    color: 'var(--color-status-critical)',
    colorBright: 'var(--color-status-critical-bright)',
    fg: '#FFF6F4',
    fgBright: '#1A0508',
  },
  warning: {
    label: 'Warning',
    color: 'var(--color-status-warning)',
    colorBright: 'var(--color-status-warning-bright)',
    fg: '#000000',
    fgBright: '#1A0508',
  },
  watch: {
    label: 'Watch',
    color: 'var(--color-status-watch)',
    colorBright: 'var(--color-status-watch-bright)',
    fg: '#000000',
    fgBright: '#1A0508',
  },
  water: {
    label: 'Water',
    color: 'var(--color-status-water)',
    colorBright: 'var(--color-status-water-bright)',
    fg: '#FFF6F4',
    fgBright: '#1A0508',
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
    return { ...SEVERITY_VISUAL.watch, label: 'Monitoring' }
  }
  if (status === 'achieved') {
    return {
      label: 'Achieved',
      color: 'var(--color-status-nature)',
      colorBright: 'var(--color-status-nature-bright)',
      fg: '#FFF6F4',
      fgBright: '#1A0508',
    }
  }
  // Archived has no live signal colour, so both canvases use the same
  // ink-muted fill — but unlike every other state, near-black fails badly
  // here on the dark-canvas variant (2.77:1), so both fg and fgBright use
  // white (6.66:1 on ink-muted either way).
  return {
    label: 'Archived',
    color: 'var(--color-ink-muted)',
    colorBright: 'var(--color-ink-muted)',
    fg: '#FFF6F4',
    fgBright: '#FFF6F4',
  }
}
