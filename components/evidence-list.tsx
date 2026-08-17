interface EvidenceItem {
  source: string
  note?: string
  date?: string
}

export function EvidenceList({ evidence }: { evidence: EvidenceItem[] }) {
  return (
    <ul className="mt-4 flex flex-col gap-[0.6rem] text-[0.92rem]">
      {evidence.map((item, i) => (
        <li key={i} className="border-l-2 border-rule pl-4">
          <span className="font-semibold">{item.source}</span>
          {item.note && <> — {item.note}</>}
          {item.date && (
            <div className="font-mono text-[0.72rem] text-ink-muted">
              {new Date(item.date).toLocaleDateString('en-IN', {
                year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
              })}
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}
