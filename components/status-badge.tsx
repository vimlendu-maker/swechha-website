import { resolveStatus, type LifecycleStatus, type Severity } from '@/lib/status'

interface StatusBadgeProps {
  status: LifecycleStatus
  severity?: Severity | null
  /** True when the badge sits on the indigo/dark canvas — swaps to the -bright colour. */
  onDark?: boolean
}

export function StatusBadge({ status, severity, onDark = false }: StatusBadgeProps) {
  const visual = resolveStatus(status, severity)
  const color = onDark ? visual.colorBright : visual.color

  return (
    <span
      className="inline-block rounded-[2px] px-[0.6rem] py-[0.28rem] font-mono text-[0.7rem] font-bold uppercase tracking-[0.08em]"
      style={{ backgroundColor: color, color: onDark ? '#1a0508' : '#fff6f4' }}
    >
      {visual.label}
    </span>
  )
}
