import Image from 'next/image'
import Link from 'next/link'

const NAV = [
  { href: '/now', label: 'Now' },
  { href: '/explore', label: 'Explore' },
  { href: '/work', label: 'Work' },
  { href: '/campaigns', label: 'Campaigns' },
  { href: '/impact', label: 'Impact' },
  { href: '/act', label: 'Act' },
  { href: '/about', label: 'About' },
  { href: '/search', label: 'Search' },
]

export function SiteHeader() {
  return (
    <header className="border-b border-rule">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-4 md:px-8">
        <Link href="/" aria-label="Swechha — home">
          <Image
            src="/brand/swechha-horizontal.svg"
            alt="Swechha"
            width={155}
            height={45}
            className="h-10 w-auto md:h-12"
            priority
          />
        </Link>
        <nav aria-label="Primary">
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm uppercase tracking-widest md:gap-x-8">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-block py-2 transition-colors hover:text-teal-ink"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}
