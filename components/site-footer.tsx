import Image from 'next/image'
import Link from 'next/link'
import { NewsletterForm } from '@/components/newsletter-form'

/* ── THE DESTINATIONS ARE THE FINISHED FOOTER'S, READ OFF THE BUILT PAGES. ──
   This list used to be the sitemap's PROPOSED IA, and the note here used to
   say so: "Where a label's destination does not exist yet the link still
   points at the sitemap's URL rather than being dropped, so the information
   architecture stays visible and the gap shows up as a 404 IN TESTING instead
   of silently disappearing from the design."

   That was a defensible pre-launch choice and it stopped being one at launch.
   Audited in production 23 August 2026: FOURTEEN of these links answered 404 —
   /archive, all four under /act/, all four under /about/, /contact,
   /explore/learn, /explore/media, and /privacy, /terms and /refund. This
   component is rendered by `app/layout.tsx`, so all fourteen were served on
   /explore, on /keystatic, and on EVERY 404 PAGE. A reader who mistyped a URL
   got a footer where most links were broken, which is not a visible gap in an
   IA — it is a broken website.

   SO THE LABELS AND URLS NOW COME FROM THE FOOTER THE 40 BUILT PAGES ACTUALLY
   SHIP, read out of `public/_pages/v3/about.html` rather than invented here.
   That is the owner-approved footer, every destination in it exists, and it
   settles the disagreement rather than adding a third answer: the scaffold
   routes and the finished routes now name the same places. Three consequences
   worth stating because they look like deletions:

     · PRIVACY / TERMS / REFUND ARE GONE, not repointed. The approved footer
       does not carry them and no such page exists to carry them to. If the org
       needs them — and an org taking donations generally does — they are
       pages somebody has to write, not links somebody has to restore.
     · CONTACT IS A `mailto:`, not a page. That is what the built footer does;
       there is no /contact route and inventing one here would re-create
       exactly the defect above.
     · OUR TEAM / OUR BOARD are gone as separate links. /about carries the
       team as thirteen disclosures on the page itself. */
const COLUMNS = [
  {
    heading: 'Read',
    links: [
      { label: 'About Swechha', href: '/about' },
      { label: 'Environmental Intelligence', href: '/now' },
      { label: 'Projects and campaigns', href: '/work' },
      { label: 'Stories and films', href: '/stories' },
      { label: 'Publications', href: '/publications' },
    ],
  },
  {
    heading: 'Go',
    links: [
      { label: 'Yamuna Yatra', href: '/work/journeys/yamuna-yatra' },
      { label: 'NatureScapes', href: '/work/journeys/naturescapes' },
      { label: 'CityScapes', href: '/work/journeys/cityscapes' },
      { label: 'Gram Anubhav', href: '/work/journeys/gram-anubhav' },
    ],
  },
  {
    heading: 'Reach us',
    links: [
      { label: 'swechhaindia@gmail.com', href: 'mailto:swechhaindia@gmail.com' },
      { label: 'Swechha Farm visits', href: '/farm' },
      { label: 'Work with us', href: '/act#partner' },
    ],
  },
  {
    heading: 'Elsewhere',
    links: [
      { label: 'Green the Map', href: 'https://www.greenthemap.com/', external: true },
      { label: 'Search this site', href: '/search' },
      { label: 'Swechha Now', href: '/now' },
    ],
  },
] as const

const LABEL =
  'font-caps text-[10px] font-bold uppercase tracking-[0.12em] text-fg-3'

export function SiteFooter() {
  return (
    <footer className="bg-ground text-fg">
      <div className="mx-auto max-w-[1320px] px-[clamp(18px,3.2vw,42px)] pb-6 pt-[clamp(30px,3.8vw,54px)]">
        <div className="grid gap-[clamp(26px,3.4vw,52px)] md:grid-cols-[minmax(0,1.15fr)_repeat(4,minmax(0,1fr))]">
          <div>
            <Image
              src="/brand/swechha-horizontal-white-approved.png"
              alt="Swechha"
              width={620}
              height={90}
              className="h-[23px] w-auto"
            />
            <p className="mt-4 max-w-[34ch] text-[0.8125rem] leading-[1.5] text-fg-2">
              Swechha works at the intersection of environment, education and community
              action for a just and sustainable world.
            </p>

            {/* Was a `<form action="/api/newsletter" method="post">` posting to
                a route that does not exist. See components/newsletter-form.tsx. */}
            <NewsletterForm />
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <h2 className={LABEL} style={{ fontVariationSettings: "'wdth' 82" }}>
                {col.heading}
              </h2>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      {...('external' in link && link.external
                        ? { target: '_blank', rel: 'noopener noreferrer' }
                        : {})}
                      className="text-[0.875rem] text-fg-2 transition-colors hover:text-mustard"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-[clamp(26px,3.2vw,44px)] flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-hair-2 pt-5 text-[0.75rem] text-fg-4">
          <p>© {new Date().getFullYear()} Swechha. All rights reserved.</p>
          {/* The three links that stood here — /privacy, /terms and /refund —
              were 404s on every page this layout renders, and the approved
              footer carries no equivalent. See the note above COLUMNS. */}
        </div>
      </div>
    </footer>
  )
}
