'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

/* All navigation lives here — desktop bar, the WORK dropdown, and the mobile
   panel — so the item list has exactly one definition. Splitting it across a
   server header and two client islands is what let the design boards ship two
   active nav items at once.

   Owner ruling, 19 Aug: WORK is the umbrella and its dropdown holds Projects,
   Journeys, Campaigns and Events. That also settles the conflict between the
   ledger's flat seven-item nav and the journey mockups, which drew JOURNEYS as
   its own top-level item.

   MEDIA & RESEARCH is deliberately absent: the sitemap's §5 tree lists it under
   WORK, but the ledger routes it to /explore/media and the owner named four
   items. It stays reachable from the footer. */
const NAV = [
  { href: '/now', label: 'Now' },
  { href: '/work', label: 'Work', children: true },
  { href: '/explore', label: 'Explore' },
  { href: '/impact', label: 'Impact' },
  { href: '/act', label: 'Act' },
  { href: '/about', label: 'About' },
] as const

const WORK_ITEMS = [
  { href: '/work/projects', label: 'Projects' },
  { href: '/work/journeys', label: 'Journeys' },
  { href: '/work/campaigns', label: 'Campaigns' },
  { href: '/work/events', label: 'Events' },
] as const

export type NavSection = (typeof NAV)[number]['href']

/* No `display` in here on purpose. It used to carry `inline-block`, which
   collides with the `flex` on the mobile Search row — two display utilities in
   the same Tailwind layer, so which one wins depends on their order in the
   generated stylesheet, not on the order they appear in the className. Each
   call site now states its own display. */
const CAPS = 'font-caps text-[11px] font-bold uppercase tracking-[0.13em]'
const WDTH = { fontVariationSettings: "'wdth' 82" } as const

function Chevron({ open, className = '' }: { open: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      aria-hidden="true"
      className={`transition-transform duration-200 ${open ? 'rotate-180' : ''} ${className}`}
    >
      <path d="M5 9l7 7 7-7" />
    </svg>
  )
}

function SearchIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
      className={className}
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-4.3-4.3" />
    </svg>
  )
}

/* Escape closes and returns focus to whatever opened it; a pointer press
   outside closes without moving focus. Neither is free, and a disclosure that
   traps you inside it is worse than no disclosure. */
function useDismiss(
  open: boolean,
  close: () => void,
  wrap: React.RefObject<HTMLElement | null>,
  restoreTo?: React.RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        close()
        restoreTo?.current?.focus()
      }
    }
    function onDown(e: PointerEvent) {
      if (!wrap.current?.contains(e.target as Node)) close()
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onDown)
    }
  }, [open, close, wrap, restoreTo])
}

function WorkMenu({ active }: { active: boolean }) {
  const [open, setOpen] = useState(false)
  const wrap = useRef<HTMLLIElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  useDismiss(open, () => setOpen(false), wrap, trigger)

  return (
    <li
      ref={wrap}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false)
      }}
    >
      <span className="flex items-center gap-1.5">
        {/* WORK keeps its own page, so the trigger must not swallow the link.
            The chevron is the separate focusable control. */}
        <Link
          href="/work"
          aria-current={active ? 'page' : undefined}
          className={`${CAPS} inline-block border-b-2 py-1 transition-colors hover:border-mustard ${
            active ? 'border-mustard' : 'border-transparent'
          }`}
          style={WDTH}
        >
          Work
        </Link>
        <button
          ref={trigger}
          type="button"
          aria-expanded={open}
          aria-controls="work-menu"
          aria-label={open ? 'Close Work menu' : 'Open Work menu'}
          onClick={() => setOpen((v) => !v)}
          className="flex items-center p-1 text-fg-3 transition-colors hover:text-mustard"
        >
          <Chevron open={open} className="h-2.5 w-2.5" />
        </button>
      </span>

      <ul
        id="work-menu"
        hidden={!open}
        className="absolute left-0 top-full z-50 mt-2 min-w-[190px] rounded-[2px] border border-hair bg-panel py-1.5"
      >
        {WORK_ITEMS.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={() => setOpen(false)}
              className={`${CAPS} block px-4 py-2.5 text-fg-2 transition-colors hover:bg-panel-2 hover:text-mustard`}
              style={WDTH}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </li>
  )
}

/* Below md the bar cannot hold seven items, a search icon and Donate — it
   overflows and pushes the logo off screen. The design boards solved that by
   hiding the items outright, which left phones with no navigation at all. This
   is the panel that was missing. */
function MobileNav({ current }: { current?: NavSection }) {
  const [open, setOpen] = useState(false)
  const wrap = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  useDismiss(open, () => setOpen(false), wrap, trigger)

  return (
    <div ref={wrap} className="md:hidden">
      <button
        ref={trigger}
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? 'Close menu' : 'Open menu'}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center p-1.5 text-fg"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
          className="h-[19px] w-[19px]"
        >
          {open ? (
            <path d="M6 6l12 12M18 6L6 18" />
          ) : (
            <path d="M3.5 7h17M3.5 12h17M3.5 17h17" />
          )}
        </svg>
      </button>

      <div
        id="mobile-nav"
        hidden={!open}
        className="absolute left-0 right-0 top-full z-50 border-t border-hair-2 bg-ground px-[clamp(18px,3.2vw,42px)] pb-6 pt-2"
      >
        <ul>
          {NAV.map((item) => (
            <li key={item.href} className="border-b border-hair-2 last:border-b-0">
              <Link
                href={item.href}
                aria-current={current === item.href ? 'page' : undefined}
                onClick={() => setOpen(false)}
                className={`${CAPS} block py-3.5 ${
                  current === item.href ? 'text-mustard' : 'text-fg'
                }`}
                style={WDTH}
              >
                {item.label}
              </Link>

              {/* WORK's children are listed inline rather than behind a second
                  disclosure — four items do not justify another tap. */}
              {'children' in item && item.children && (
                <ul className="pb-2 pl-4">
                  {WORK_ITEMS.map((sub) => (
                    <li key={sub.href}>
                      <Link
                        href={sub.href}
                        onClick={() => setOpen(false)}
                        className={`${CAPS} block py-2.5 text-fg-2`}
                        style={WDTH}
                      >
                        {sub.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>

        <Link
          href="/search"
          onClick={() => setOpen(false)}
          className={`${CAPS} mt-4 flex items-center gap-2.5 text-fg`}
          style={WDTH}
        >
          <SearchIcon className="h-[15px] w-[15px]" />
          Search
        </Link>
      </div>
    </div>
  )
}

export function SiteNav({ current }: { current?: NavSection }) {
  return (
    <>
      <nav aria-label="Primary" className="hidden md:block">
        <ul className="flex items-center gap-[clamp(11px,1.5vw,25px)]">
          {NAV.map((item) =>
            'children' in item && item.children ? (
              <WorkMenu key={item.href} active={current === item.href} />
            ) : (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={current === item.href ? 'page' : undefined}
                  className={`${CAPS} inline-block border-b-2 py-1 transition-colors hover:border-mustard ${
                    current === item.href ? 'border-mustard' : 'border-transparent'
                  }`}
                  style={WDTH}
                >
                  {item.label}
                </Link>
              </li>
            ),
          )}

          <li>
            <Link href="/search" aria-label="Search" className="block">
              <SearchIcon className="h-[15px] w-[15px]" />
            </Link>
          </li>
        </ul>
      </nav>

      <div className="flex items-center gap-2">
        {/* `/act/donate` until 23 August 2026, which was a 404 — the fifteenth
            and most expensive of the dead links this shell was serving, because
            it is the one the header puts a button around. `/act` is the page
            that exists and is the page the finished shell's GIVE chip has
            always pointed at; its three ways in are #give, #hands and
            #partner. */}
        <Link
          href="/act"
          className={`${CAPS} inline-block rounded-[2px] bg-mustard px-3 py-[7px] text-on-mustard`}
          style={WDTH}
        >
          Donate
        </Link>
        <MobileNav current={current} />
      </div>
    </>
  )
}
