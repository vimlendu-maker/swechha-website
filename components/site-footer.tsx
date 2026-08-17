import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-indigo text-paper">
      <div className="mx-auto max-w-6xl px-5 py-16 md:px-8">
        <p className="max-w-xl font-display text-2xl">
          Education. Environment. Enterprise.
        </p>
        <nav aria-label="Footer" className="mt-8">
          <ul className="flex flex-wrap gap-x-8 gap-y-2 text-sm uppercase tracking-widest">
            <li><Link href="/stories" className="hover:text-ochre">Stories</Link></li>
            <li><Link href="/work" className="hover:text-ochre">Work</Link></li>
            <li><Link href="/act" className="hover:text-ochre">Act</Link></li>
            <li><Link href="/about" className="hover:text-ochre">About</Link></li>
          </ul>
        </nav>
        <p className="mt-12 text-sm opacity-70">
          © {new Date().getFullYear()} Swechha
        </p>
      </div>
    </footer>
  )
}
