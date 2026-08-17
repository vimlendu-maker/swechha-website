import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Prose } from '@/components/prose'
import { RelatedContent } from '@/components/related-content'
import { getAllStories, getStoryBySlug, getRelated } from '@/lib/content'
import { renderMarkdown } from '@/lib/markdown'

export function generateStaticParams() {
  return getAllStories().map((story) => ({ slug: story.slug }))
}

export async function generateMetadata(
  props: PageProps<'/stories/[slug]'>,
): Promise<Metadata> {
  const { slug } = await props.params
  const story = getStoryBySlug(slug)
  if (!story) return {}

  return {
    title: story.data.title,
    description: story.data.summary,
    openGraph: {
      title: story.data.title,
      description: story.data.summary,
      type: 'article',
      publishedTime: story.data.date,
      images: [story.data.heroImage.src],
    },
  }
}

export default async function StoryPage(props: PageProps<'/stories/[slug]'>) {
  const { slug } = await props.params
  const story = getStoryBySlug(slug)
  if (!story) notFound()

  const { title, summary, author, date, heroImage } = story.data

  return (
    <main className="mx-auto max-w-6xl px-5 py-16 md:px-8">
      <article>
        <header className="mx-auto max-w-[68ch]">
          <p className="text-xs uppercase tracking-widest text-ink-muted">Story</p>
          <h1 className="mt-3">{title}</h1>
          <p className="mt-6 font-display text-xl text-ink-muted">{summary}</p>
          <p className="mt-6 text-sm text-ink-muted">
            By {author} ·{' '}
            <time dateTime={date}>
              {new Date(date).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                timeZone: 'UTC',
              })}
            </time>
          </p>
        </header>

        <div className="relative mt-10 aspect-[16/9] overflow-hidden bg-rule">
          <Image
            src={heroImage.src}
            alt={heroImage.alt}
            fill
            sizes="(max-width: 1152px) 100vw, 1152px"
            className="object-cover"
            priority
          />
        </div>

        <div className="mx-auto mt-12 max-w-[68ch]">
          <Prose html={renderMarkdown(story.body)} />
        </div>

        <div className="mx-auto max-w-[68ch]">
          <RelatedContent entries={getRelated(story)} />
        </div>
      </article>
    </main>
  )
}
