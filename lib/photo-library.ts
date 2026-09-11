import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { z } from 'zod'
import { ContentError } from '@/lib/content/load'
import { PHOTO_SIGNALS } from '@/components/photo-signal'

/**
 * A Zod schema over `content/photo-library.json`.
 *
 * ★ WHY THIS FILE EXISTS. The catalogue is 128 hand-maintained rows and, unlike
 * `content/<type>/*.md`, nothing validated it — so it accumulated `signal`
 * values the treatment has never accepted: five `"orange"`, five `"yellow"` and
 * two `null`. That was not a cosmetic drift. `signalClass()` looked the word up
 * bare, so an unrecognised one returned `undefined`, the element got
 * `class="object-cover undefined"`, no filter resolved, and the photograph
 * would render in FULL COLOUR — the exact inverse of a site whose photography
 * is monochrome by owner decision. The lookup now fails closed (see
 * `components/photo-signal.tsx`), which stops a bad value from reaching the
 * page; this schema stops it from reaching the repository. Both halves are
 * wanted: the fallback keeps a mistake off the site, the schema keeps the
 * mistake from being made silently.
 *
 * `signal` is deliberately derived from `PHOTO_SIGNALS` rather than restating
 * the four words, because a second hand-written copy of the list is how the
 * first one fell out of step. (`lib/content/schemas.ts` still spells the tuple
 * out inline for frontmatter; `photo-library.test.ts` asserts the two agree, so
 * that copy cannot drift either.)
 *
 * `strictObject`, matching the content-frontmatter schemas: in a catalogue this
 * size a misspelled key is a likelier mistake than a missing one, and a typo
 * that silently drops a `synthetic: true` flag — the flag that keeps 25
 * unpublishable frames off the site — must be a build failure, not a shrug.
 */
export const photoEntrySchema = z.strictObject({
  src: z
    .string()
    .startsWith('/images/photos/', 'src must be a site-absolute path under /images/photos/'),
  alt: z.string().min(1, 'alt is required — every photograph needs alt text'),
  /**
   * Which hue in this frame is the subject. Today this is a record rather than
   * an instruction — rendering is monochrome site-wide and no generator reads
   * the field — but it is what the treatment would be switched back on from,
   * so a wrong word here is a latent full-colour photograph, not a dead note.
   */
  signal: z.enum(PHOTO_SIGNALS).default('none'),
  /** Read off the file itself. The generators' dimension gate is total. */
  width: z.number().int().positive('width must be a positive integer'),
  height: z.number().int().positive('height must be a positive integer'),
  credit: z.string().min(1, 'credit is required — an uncredited frame cannot be published'),
  tags: z.array(z.string().min(1)).optional(),
  note: z.string().min(1).optional(),
  /**
   * Selective colour is baked into the file. A DESCRIPTION OF THE FILE, not a
   * rendering instruction: W-26 withdrew the "baked frames take no filter
   * class" rule (the frozen homepage carried a ramp on all 12 baked frames it
   * used, and D-10.4 gives the page the win over the spec). The key is still
   * on 22 rows here, so the schema still accepts it.
   */
  baked: z.boolean().optional(),
  /** Bought, not archive — refused BY FLAG so it is distinguishable from an un-catalogued file. */
  stock: z.boolean().optional(),
  /** Not a photograph. Stays on disk, stays flagged, must not be published (W-31, AD-27.28). */
  synthetic: z.boolean().optional(),
})

export type PhotoEntry = z.infer<typeof photoEntrySchema>

export const photoLibrarySchema = z.strictObject({
  /** The catalogue's own append-only ledger note. Prose, not data. */
  _: z.string().min(1),
  photos: z.array(photoEntrySchema).min(1),
})

export type PhotoLibrary = z.infer<typeof photoLibrarySchema>

export const PHOTO_LIBRARY_PATH = 'content/photo-library.json'

/**
 * Parse the catalogue, naming the offending row and field on failure the way
 * `lib/content/load.ts` names the offending Markdown file.
 */
export function loadPhotoLibrary(root: string = process.cwd()): PhotoLibrary {
  const path = join(root, PHOTO_LIBRARY_PATH)
  const result = photoLibrarySchema.safeParse(JSON.parse(readFileSync(path, 'utf8')))

  if (!result.success) {
    const details = result.error.issues
      .map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('\n')
    throw new ContentError(`Invalid ${PHOTO_LIBRARY_PATH}:\n${details}`)
  }

  return result.data
}
