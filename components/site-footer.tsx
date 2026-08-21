import Image from 'next/image'
import Link from 'next/link'

/* Per DECISIONS-2026-08-18: footer LABELS come from workbook sheet 16, footer
   URLS come from the sitemap. Where a label's destination does not exist yet the
   link still points at the sitemap's URL rather than being dropped, so the
   information architecture stays visible and the gap shows up as a 404 in
   testing instead of silently disappearing from the design.

   Corrected 2026-08-19 against sitemap Rev A §17: Farm is `/farm` (a standalone
   destination, deliberately NOT a child of WORK), Contact is `/contact`,
   Archive is `/archive` (it was pointing at `/explore`, which is a different
   page, not a missing one), and Knowledge is `/explore/learn`. The approved
   design boards already used all four.

   Stories is the one link still pointing where the app actually is (`/stories`)
   rather than where the sitemap says it belongs (`/explore/stories`): that page
   EXISTS, so pointing at the sitemap URL would break a working link instead of
   documenting a gap. It moves when the route moves — sitemap Rev A §17 item 1. */
const COLUMNS = [
  {
    heading: 'Explore',
    links: [
      { label: 'Work', href: '/work' },
      { label: 'Stories & media', href: '/stories' },
      { label: 'Impact', href: '/impact' },
      { label: 'Swechha Farm', href: '/farm' },
      { label: 'Green the Map', href: 'https://www.greenthemap.com/', external: true },
      { label: 'Archive', href: '/archive' },
    ],
  },
  {
    heading: 'Act',
    links: [
      { label: 'Volunteer', href: '/act/volunteer' },
      { label: 'Donate', href: '/act/donate' },
      { label: 'Participate', href: '/act/participate' },
      { label: 'Partner', href: '/act/partner' },
    ],
  },
  {
    heading: 'About',
    links: [
      { label: 'About Swechha', href: '/about' },
      { label: 'Our team', href: '/about/team' },
      { label: 'Our board', href: '/about/board' },
      { label: 'Annual reports', href: '/about/reports' },
      { label: 'Compliances', href: '/about/compliances' },
    ],
  },
  {
    heading: 'Connect',
    links: [
      { label: 'Contact', href: '/contact' },
      { label: 'Swechha Now', href: '/now' },
      { label: 'Knowledge & DIY', href: '/explore/learn' },
      { label: 'Media & research', href: '/explore/media' },
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

            {/* Embedded and global, per the sitemap — there is no dedicated
                newsletter page. Inert until a provider is wired up. */}
            <form
              className="mt-5 flex items-stretch"
              action="/api/newsletter"
              method="post"
            >
              <label className="sr-only" htmlFor="nl-email">
                Email address
              </label>
              <input
                id="nl-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Your email"
                className="min-w-0 flex-1 rounded-l-[2px] border border-r-0 border-hair bg-transparent px-3.5 py-3 text-[0.875rem] text-fg placeholder:text-fg-4"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="flex items-center rounded-r-[2px] bg-mustard px-4 text-on-mustard"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.2}
                  aria-hidden="true"
                  className="h-4 w-4"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
            </form>
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
          <ul className="flex flex-wrap gap-x-5 gap-y-1">
            <li>
              <Link href="/privacy" className="hover:text-fg-2">
                Privacy policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-fg-2">
                Terms of use
              </Link>
            </li>
            <li>
              <Link href="/refund" className="hover:text-fg-2">
                Refund policy
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
