import { resolveStatus, type LifecycleStatus, type Severity } from '@/lib/status'

interface TimelineEntry {
  date: string
  status: LifecycleStatus
  severity?: Severity
  note: string
}

export function LifecycleTimeline({ entries }: { entries: TimelineEntry[] }) {
  return (
    <ol className="relative ml-1 border-l border-rule pl-6">
      {entries.map((entry, i) => {
        const visual = resolveStatus(entry.status, entry.severity)
        return (
          <li key={i} className="relative pb-6 last:pb-0">
            <span
              className="absolute -left-[1.65rem] top-1 h-[9px] w-[9px] rounded-[2px]"
              style={{ backgroundColor: visual.color }}
              aria-hidden="true"
            />
            <time
              dateTime={entry.date}
              className="font-mono text-[0.68rem] uppercase tracking-wide text-ink-muted"
            >
              {new Date(entry.date).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                timeZone: 'UTC',
              })}
            </time>
            <p className="mt-1 text-[0.94rem]">
              <span className="mr-1 font-mono text-[0.72rem] uppercase text-ink">
                {visual.label}
              </span>
              {entry.note}
            </p>
          </li>
        )
      })}
    </ol>
  )
}
