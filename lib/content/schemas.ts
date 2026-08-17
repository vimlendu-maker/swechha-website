import { z } from 'zod'

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

const slugList = () => z.array(z.string()).default([])

/**
 * Cross-type relations, keyed by content type, each a list of slugs.
 * Written out explicitly rather than generated from CONTENT_TYPES so the
 * inferred type stays readable and TypeScript can check it properly.
 */
export const relatedSchema = z
  .strictObject({
    project: slugList(),
    story: slugList(),
    knowledge: slugList(),
    film: slugList(),
    campaign: slugList(),
  })
  .default({
    project: [],
    story: [],
    knowledge: [],
    film: [],
    campaign: [],
  })

export const heroImageSchema = z.object({
  src: z.string().min(1, 'heroImage.src is required'),
  alt: z.string().min(1, 'heroImage.alt is required — every image needs alt text'),
})

export const storySchema = z.strictObject({
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

const LIFECYCLE_STATUSES_TUPLE = ['active', 'monitoring', 'achieved', 'archived'] as const
const SEVERITIES_TUPLE = ['critical', 'warning', 'watch', 'water'] as const

const liveDataSchema = z.strictObject({
  label: z.string().min(1),
  value: z.string().min(1),
  unit: z.string().optional(),
  sourceLabel: z.string().min(1, 'liveData.sourceLabel is required — every figure must name its source'),
  updatedAt: z.string().min(1, 'liveData.updatedAt is required'),
  // No `.default()` / `.optional()` — omitting this field must throw. Do not
  // add a default; the requirement is that "mock" is stated, not assumed.
  mock: z.boolean(),
  trendPoints: z.array(z.number()).optional(),
})

const actionSchema = z.strictObject({
  label: z.string().min(1),
  href: z.string().min(1),
  primary: z.boolean().default(false),
})

const evidenceSchema = z.strictObject({
  source: z.string().min(1),
  note: z.string().optional(),
  date: z.string().regex(ISO_DATE).optional(),
})

const timelineEntrySchema = z.strictObject({
  date: z.string().regex(ISO_DATE, 'timeline date must be YYYY-MM-DD'),
  status: z.enum(LIFECYCLE_STATUSES_TUPLE),
  severity: z.enum(SEVERITIES_TUPLE).optional(),
  note: z.string().min(1),
})

export const campaignSchema = z
  .strictObject({
    title: z.string().min(1, 'title is required'),
    summary: z.string().min(1, 'summary is required'),
    location: z.string().min(1, 'location is required'),
    status: z.enum(LIFECYCLE_STATUSES_TUPLE),
    severity: z.enum(SEVERITIES_TUPLE).optional(),
    heroImage: heroImageSchema,
    whatWeKnow: z.string().min(1),
    publicHealthImpact: z.string().min(1),
    whyItMatters: z.string().min(1),
    whatSwechhaIsDoing: z.string().min(1),
    liveData: liveDataSchema.optional(),
    actions: z.array(actionSchema).min(1, 'at least one action is required — "what you can do" cannot be empty'),
    evidence: z.array(evidenceSchema).min(1, 'at least one evidence entry is required — a situation cannot publish with zero sources'),
    timeline: z.array(timelineEntrySchema).min(1, 'at least one timeline entry is required — every situation needs an opening entry'),
    featured: z.boolean().default(false),
    related: relatedSchema,
  })
  .refine((data) => data.status !== 'active' || !!data.severity, {
    message: 'severity is required when status is "active"',
    path: ['severity'],
  })

export type Campaign = z.infer<typeof campaignSchema>
