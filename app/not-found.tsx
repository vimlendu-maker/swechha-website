import Link from 'next/link'

/**
 * The 404 page.
 *
 * ★ WHY THIS FILE HAD TO EXIST. There was no `not-found.tsx`, so every 404 on
 * this site was Next's built-in one rendered inside `app/layout.tsx`. Audited in
 * production 23 August 2026, that produced three separate defects on the page
 * that any mistyped URL lands on:
 *
 *   1. TWO `<title>` ELEMENTS — the layout's default plus Next's hardcoded
 *      "404: This page could not be found." Verified in the served HTML.
 *   2. NO EXPLANATION AND NO WAY ON. The built-in page is a bare line of text.
 *      A reader who mistyped a URL was handed no route back into the site.
 *   3. THE SHELL'S DEAD LINKS. The header and footer around it were serving
 *      fifteen 404s of their own — see the note above COLUMNS in
 *      `components/site-footer.tsx`. Those are fixed there, not here; this file
 *      is why they mattered so much, since this is the page they all appeared
 *      on together.
 *
 * ★ WHAT THIS DOES NOT DO. It does not reproduce the finished design shell.
 * The 40 routed pages are static HTML built by `scripts/`, and this is a React
 * route rendered by `app/layout.tsx` — so a 404 still does not look like the
 * rest of the site, and making it do so is the React port that
 * `design-routes.ts` describes as outstanding, not a bug fix. What is fixed
 * here is that the page now has one title, says something true, and every link
 * on it works.
 *
 * ★ NO `metadata` EXPORT. `not-found.tsx` is not a page and cannot carry one;
 * the title comes from the layout's `title.default`. That is exactly what
 * removes the duplicate — the built-in page brought its own.
 *
 * The destinations below are the four nav words of the finished site plus
 * search, all verified 200.
 */
const WAYS = [
  { href: '/now', label: 'Now', note: 'Delhi’s air, the Yamuna, heat, fire and forest — the readings, updated.' },
  { href: '/work', label: 'Work', note: 'Projects, journeys, campaigns and events.' },
  { href: '/impact', label: 'Impact', note: 'Every figure Swechha holds, on one page.' },
  { href: '/farm', label: 'Farm', note: 'Five acres in the Aravallis. Visits, camps and stays.' },
] as const

export default function NotFound() {
  return (
    <main className="bg-ground text-fg">
      <div className="mx-auto max-w-[1320px] px-[clamp(18px,3.2vw,42px)] py-[clamp(48px,7vw,110px)]">
        <p
          className="font-caps text-[11px] font-bold uppercase tracking-[0.13em] text-fg-3"
          style={{ fontVariationSettings: "'wdth' 82" }}
        >
          404
        </p>

        <h1 className="mt-4 max-w-[24ch] text-[clamp(1.75rem,4vw,3rem)] leading-[1.08]">
          There is no page at this address.
        </h1>

        <p className="mt-5 max-w-[58ch] text-[0.9375rem] leading-[1.6] text-fg-2">
          Either the address has a typo in it, or it is a page that moved when this
          site was rebuilt. Everything that moved has a redirect, so a link from
          the old site should still work — if you followed one and reached this
          page,{' '}
          <a
            className="underline decoration-hair underline-offset-4 hover:text-mustard"
            href="mailto:swechhaindia@gmail.com?subject=Broken%20link%20on%20swechha.in"
          >
            tell us which one
          </a>
          .
        </p>

        <ul className="mt-[clamp(30px,4vw,54px)] grid gap-px border border-hair bg-hair sm:grid-cols-2">
          {WAYS.map((w) => (
            <li key={w.href} className="bg-ground">
              <Link
                href={w.href}
                className="block h-full px-5 py-5 transition-colors hover:bg-panel"
              >
                <span
                  className="font-caps text-[11px] font-bold uppercase tracking-[0.13em] text-mustard"
                  style={{ fontVariationSettings: "'wdth' 82" }}
                >
                  {w.label}
                </span>
                <span className="mt-1.5 block max-w-[42ch] text-[0.8125rem] leading-[1.5] text-fg-2">
                  {w.note}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-[0.875rem] text-fg-2">
          Or{' '}
          <Link
            href="/search"
            className="underline decoration-hair underline-offset-4 hover:text-mustard"
          >
            search every page on this site
          </Link>
          .
        </p>
      </div>
    </main>
  )
}
