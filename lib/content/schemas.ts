import { z } from 'zod'

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

const slugList = () => z.array(z.string()).default([])

/**
 * Cross-type relations, keyed by content type, each a list of slugs.
 * Written out explicitly rather than generated from CONTENT_TYPES so the
 * inferred type stays readable and TypeScript can check it properly.
 */
export const relatedSchema = z
  .object({
    project: slugList(),
    story: slugList(),
    knowledge: slugList(),
    film: slugList(),
    campaign: slugList(),
    briefing: slugList(),
  })
  .default({
    project: [],
    story: [],
    knowledge: [],
    film: [],
    campaign: [],
    briefing: [],
  })

export const heroImageSchema = z.object({
  src: z.string().min(1, 'heroImage.src is required'),
  alt: z.string().min(1, 'heroImage.alt is required — every image needs alt text'),
})

export const storySchema = z.object({
  title: z.string().min(1, 'title is required'),
  summary: z.string().min(1, 'summary is required'),
  author: z.string().min(1, 'author is required'),
  date: z.string().regex(ISO_DATE, 'date must be YYYY-MM-DD'),
  heroImage: heroImageSchema,
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  related: relatedSchema,
})

export type Story = z.infer<typeof storySchema>
