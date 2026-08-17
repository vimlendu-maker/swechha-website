import Image from 'next/image'
import Link from 'next/link'

interface ContentCardProps {
  href: string
  title: string
  summary: string
  image: { src: string; alt: string }
  meta?: string
  /**
   * Heading level for the card title. Defaults to `h3` because the primary
   * shipped usage today (the homepage's "Latest stories" section, under an
   * `h2`) needs `h3`. Pass `2` when a page uses `ContentCard` directly under
   * an `h1` with no intervening `h2` (e.g. the `/stories` archive) so
   * heading levels stay sequential for screen-reader navigation.
   */
  headingLevel?: 2 | 3
}

export function ContentCard({
  href,
  title,
  summary,
  image,
  meta,
  headingLevel = 3,
}: ContentCardProps) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3'

  // `app/globals.css` sizes h2 and h3 differently (its `h1, h2, h3, h4`
  // rule shares font-family/weight/line-height, but font-size and the
  // Fraunces `font-variation-settings` step down per level). headingLevel
  // exists purely so the *document outline* is correct in each page's
  // context (see the prop doc above) — the card's own visual size must not
  // change when the tag does, so it's pinned here to what h3 looks like
  // today regardless of which tag is actually rendered.
  //
  // The size comes from the `text-h3` utility (its token is defined once in
  // `app/globals.css`'s `@theme inline` block), not an inline style — an
  // inline style beats every cascade layer including utilities, which would
  // silently defeat a future `className="text-2xl"` on this heading exactly
  // like the site-wide bug fixed at `ab7080e`. `font-variation-settings` has
  // no Tailwind utility to collide with, so it stays a plain style prop.
  const headingStyle = {
    fontVariationSettings: "'opsz' 28, 'SOFT' 25, 'WONK' 0",
  }

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
      <Heading className="mt-2 text-h3" style={headingStyle}>
        <Link
          href={href}
          className="after:absolute after:inset-0 group-hover:text-teal-ink"
        >
          {title}
        </Link>
      </Heading>
      <p className="mt-2 text-ink-muted">{summary}</p>
    </article>
  )
}
