import Image from 'next/image'
import Link from 'next/link'
import { SiteNav, type NavSection } from '@/components/site-nav'

export type { NavSection }

/* `current` marks the active SECTION, not the current URL. A journey or project
   page passes the section it lives under, so /journeys/naturescapes and
   /work/projects/farm-school both light up WORK.

   All the navigation itself lives in SiteNav, which owns the item list once and
   renders the desktop bar, the WORK dropdown and the mobile panel from it. */
export function SiteHeader({ current }: { current?: NavSection }) {
  return (
    /* `relative` anchors the mobile panel, which is positioned to the full width
       of the header rather than to the nav. */
    <header className="relative bg-ground text-fg">
      <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-4 px-[clamp(18px,3.2vw,42px)] py-3.5">
        <Link href="/" aria-label="Swechha — home" className="shrink-0">
          <Image
            src="/brand/swechha-horizontal-white-approved.png"
            alt="Swechha"
            width={620}
            height={90}
            className="h-[23px] w-auto"
            priority
          />
        </Link>

        <SiteNav current={current} />
      </div>
    </header>
  )
}
