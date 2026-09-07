import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { z } from 'zod'

export const DATA_DIR = join(process.cwd(), 'data/healthy-cities')
export const FELLOW_DIR = join(DATA_DIR, 'fellows')

/* The spec's withheld list, as literal strings that must not appear anywhere in
   the published data. Each is a figure the sources do not reconcile on.

   'Moradabad, Uttar Pradesh, India' and '40 schools' were removed here (see
   controller ruling 2) — neither string would ever appear in the data as
   authored, so asserting their absence proved nothing. The real defect they
   were meant to guard against — one fellow's file inheriting another's
   location — is covered instead by two positive assertions in
   schema.test.ts. */
export const WITHHELD = [
  '5,000+',
  'Swachha Foundation',
] as const

export const figureSchema = z.strictObject({
  value: z.string().min(1),
  label: z.string().min(1),
  period: z.string().min(1),
  basis: z.enum(['counted', 'modelled']),
  source: z.string().min(1),
  note: z.string().optional(),
})

export const frameSchema = z.strictObject({
  src: z.string().startsWith('/images/photos/'),
  alt: z.string().min(1),
  ramp: z.enum(['duo', 'duo-dim']),
  op: z.string().optional(),
})

export const quoteSchema = z.strictObject({
  text: z.string().min(1),
  speaker: z.string().min(1),
  role: z.string().optional(),
  place: z.string().optional(),
  language: z.enum(['en', 'hi']).default('en'),
})

export const fellowSchema = z.strictObject({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  project: z.string().min(1),
  place: z.string().min(1),
  state: z.string().min(1),
  rural: z.string().min(1),
  period: z.string().min(1),
  deck: z.string().min(1),
  description: z.string().min(140).max(158),
  aims: z.array(z.strictObject({ h: z.string(), p: z.string() })).min(1),
  did: z.array(z.string()).min(1),
  figures: z.array(figureSchema).min(1),
  partners: z.array(z.string()),
  quotes: z.array(quoteSchema),
  frames: z.array(frameSchema).optional(),
  holes: z.array(z.string()).optional(),
  links: z.array(z.strictObject({ label: z.string(), href: z.string().url() })).optional(),
})

export const programmeSchema = z.strictObject({
  title: z.string().min(1),
  description: z.string().min(140).max(158),
  deck: z.string().min(1),
  partnership: z.string().min(1),
  figures: z.array(figureSchema).min(4),
  bands: z.record(z.string(), z.unknown()),
  quotes: z.array(quoteSchema),
  holes: z.array(z.string()).min(1),
  videos: z.array(z.strictObject({
    name: z.string(), blurb: z.string(), href: z.string().url(),
    frame: frameSchema.optional(),
  })).min(1),
  frames: z.array(frameSchema).optional(),
})

export type Figure = z.infer<typeof figureSchema>
export type Fellow = z.infer<typeof fellowSchema>
export type Programme = z.infer<typeof programmeSchema>

const read = (p: string) => JSON.parse(readFileSync(p, 'utf8'))

export function loadFellows(): Fellow[] {
  return readdirSync(FELLOW_DIR)
    .filter(f => f.endsWith('.json'))
    .sort()
    .map(f => fellowSchema.parse(read(join(FELLOW_DIR, f))))
}

export function loadProgramme(): Programme {
  return programmeSchema.parse(read(join(DATA_DIR, 'programme.json')))
}
