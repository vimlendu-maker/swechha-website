interface Action {
  label: string
  href: string
  primary: boolean
}

interface ActionListProps {
  actions: Action[]
  /**
   * Only an urgent situation (active + critical) may render its primary
   * action filled in the critical signal colour — this is enforced here,
   * not left to content authors, so a colourful CTA can never appear on a
   * situation that isn't genuinely critical. Every other action, primary
   * or not, renders as a plain underlined link.
   */
  urgent: boolean
}

export function ActionList({ actions, urgent }: ActionListProps) {
  return (
    <ul className="mt-4 flex flex-col gap-3">
      {actions.map((action) => {
        const filled = action.primary && urgent
        return (
          <li key={action.href} className={filled ? '' : 'border-b border-rule pb-3 last:border-none last:pb-0'}>
            <a
              href={action.href}
              className={
                filled
                  ? 'inline-block rounded-[2px] bg-status-critical px-5 py-[0.65rem] font-semibold text-[#fff6f4] no-underline'
                  : 'text-[1rem] underline underline-offset-[3px]'
              }
            >
              {action.label}
            </a>
          </li>
        )
      })}
    </ul>
  )
}
