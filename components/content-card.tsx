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
    <article>
      <Link href={href} className="group block">
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
        <h3 className="mt-2 group-hover:text-teal-ink">{title}</h3>
        <p className="mt-2 text-ink-muted">{summary}</p>
      </Link>
    </article>
  )
}
