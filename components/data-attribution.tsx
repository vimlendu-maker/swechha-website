interface DataAttributionProps {
  sourceLabel: string
  /** ISO 8601 datetime string. */
  updatedAt: string
  mock: boolean
}

/**
 * Every live-data figure on the site renders through this component. If
 * `mock` is true it must show a DEMO DATA tag — separate from any
 * StatusBadge — so a visitor can never mistake a placeholder number for a
 * real reading. Remove nothing here without wiring a real data source first.
 */
export function DataAttribution({ sourceLabel, updatedAt, mock }: DataAttributionProps) {
  const formatted = new Date(updatedAt).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
  })

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2 font-mono text-[0.68rem] text-ink-muted">
      <span>SOURCE: {sourceLabel.toUpperCase()} — UPDATED {formatted}</span>
      {mock && (
        <span className="rounded-[2px] border border-dashed border-ink-muted px-[0.4rem] py-[0.1rem] text-ink-muted">
          DEMO DATA — NOT LIVE
        </span>
      )}
    </div>
  )
}
