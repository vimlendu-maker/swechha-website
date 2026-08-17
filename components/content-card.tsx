import Image from 'next/image'
import Link from 'next/link'

interface ContentCardProps {
  href: string
  title: string
  summary: string
  image: { src: string; alt: string }
  meta?: string
}

export function ContentCard({ href, title, summary, image, meta }: ContentCardProps) {
  return (
    // `group` + `relative` here, not on the Link: the accessible name of a
    // link is its text content, so wrapping image/eyebrow/title/summary in
    // one <Link> (as this used to) made a screen reader announce the whole
    // card — summary included — as the link name. Only the title is a real
    // link now; the title Link's `after:absolute after:inset-0` overlay
    // stretches to fill this `relative` article, so the whole card is still
    // one click/tap target with one accessible name: the title.
    <article className="group relative">
      <div className="relative aspect-[4/3] overflow-hidden bg-rule">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
      {meta && (
        <p className="mt-4 text-xs uppercase tracking-widest text-ink-muted">{meta}</p>
      )}
      <h3 className="mt-2">
        <Link
          href={href}
          className="after:absolute after:inset-0 group-hover:text-teal-ink"
        >
          {title}
        </Link>
      </h3>
      <p className="mt-2 text-ink-muted">{summary}</p>
    </article>
  )
}
