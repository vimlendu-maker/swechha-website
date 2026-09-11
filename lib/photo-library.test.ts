import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { ContentError } from '@/lib/content/load'
import { heroImageSchema } from '@/lib/content/schemas'
import { PHOTO_SIGNALS, signalClass, type PhotoSignal } from '@/components/photo-signal'
import { loadPhotoLibrary, photoEntrySchema, PHOTO_LIBRARY_PATH } from '@/lib/photo-library'

const ROOT = fileURLToPath(new URL('..', import.meta.url))

/**
 * The catalogue had gone twelve rows out of step with the four words the
 * treatment accepts, because nothing read it against a schema. These tests are
 * the gate that stops it recurring — see `lib/photo-library.ts` for why the
 * failure mattered (an unaccepted `signal` used to publish a full-colour
 * photograph on a monochrome site).
 */
describe(PHOTO_LIBRARY_PATH, () => {
  // Read the catalogue WITHOUT the schema, and read it here rather than calling
  // loadPhotoLibrary() in the describe body. A throw during collection aborts
  // the whole file and vitest then reports "no tests" — which is a worse signal
  // than a red test, because a single bad row would hide the other 40
  // assertions instead of naming itself. So the schema gets its own test, and
  // the field assertions run over the raw rows so they can still name the
  // offending `src` on a day the schema is failing too.
  const rows = (
    JSON.parse(readFileSync(join(ROOT, PHOTO_LIBRARY_PATH), 'utf8')).photos as unknown[]
  ).map((p) => p as Record<string, unknown>)

  it('parses against the schema', () => {
    expect(() => loadPhotoLibrary(ROOT)).not.toThrow()
    expect(rows.length).toBeGreaterThan(0)
  })

  it('gives every entry a signal the treatment accepts', () => {
    const offenders = rows
      .filter((p) => !(PHOTO_SIGNALS as readonly unknown[]).includes(p.signal))
      .map((p) => `${p.src}: ${JSON.stringify(p.signal) ?? 'undefined'}`)

    expect(offenders).toEqual([])
  })

  it.each(['src', 'alt', 'credit'] as const)('gives every entry a non-empty %s', (field) => {
    const bad = rows
      .filter((p) => typeof p[field] !== 'string' || (p[field] as string).trim() === '')
      .map((p) => `${p.src}: ${JSON.stringify(p[field])}`)

    expect(bad).toEqual([])
  })

  it.each(['width', 'height'] as const)('records %s as a positive integer', (field) => {
    const bad = rows
      .filter((p) => !Number.isInteger(p[field]) || (p[field] as number) <= 0)
      .map((p) => `${p.src}: ${JSON.stringify(p[field])}`)

    expect(bad).toEqual([])
  })

  it('keys every entry by a unique src', () => {
    // The generators build a Map keyed on src, so a duplicate row would make
    // one of the two silently unreachable rather than raise anything.
    expect(new Set(rows.map((p) => p.src)).size).toBe(rows.length)
  })
})

describe('photoEntrySchema', () => {
  const valid = {
    src: '/images/photos/example.jpg',
    alt: 'A worked example',
    signal: 'mustard',
    width: 2000,
    height: 1500,
    credit: 'Swechha archive',
  }

  /** `valid` minus one field, for the "this field is required" cases. */
  const without = (field: keyof typeof valid) => {
    const copy: Record<string, unknown> = { ...valid }
    delete copy[field]
    return copy
  }

  it('accepts a well-formed entry', () => {
    expect(photoEntrySchema.parse(valid).signal).toBe('mustard')
  })

  it('defaults a missing signal to none', () => {
    expect(photoEntrySchema.parse(without('signal')).signal).toBe('none')
  })

  // The three shapes the catalogue actually carried. `null` is listed
  // separately from the unknown words because it defeats a default parameter
  // rather than a lookup, which is how it survived this long.
  it.each([['orange'], ['yellow'], [null], ['mono'], ['MUSTARD']])(
    'rejects signal %j',
    (signal) => {
      expect(photoEntrySchema.safeParse({ ...valid, signal }).success).toBe(false)
    },
  )

  it.each(['src', 'alt', 'width', 'height', 'credit'] as const)('requires %s', (field) => {
    expect(photoEntrySchema.safeParse(without(field)).success).toBe(false)
  })

  it('rejects an unknown key rather than ignoring it', () => {
    // A typo'd `synthetc: true` must fail, not silently unflag a frame that
    // may not be published.
    expect(photoEntrySchema.safeParse({ ...valid, synthetc: true }).success).toBe(false)
  })

  it('names the file and the offending field when it throws', () => {
    // `loadPhotoLibrary` on a directory with no catalogue: the point is that
    // the failure is a ContentError, not a bare JSON or fs error.
    expect(() => loadPhotoLibrary('/nonexistent-root')).toThrow()
    const error = new ContentError('x')
    expect(error.name).toBe('ContentError')
  })
})

describe('signalClass', () => {
  it.each(PHOTO_SIGNALS)('maps %s to its filter class', (signal) => {
    expect(signalClass(signal)).toMatch(/^signal-[a-z]+$/)
    expect(signalClass(signal, true)).toBe(`${signalClass(signal)}-dim`)
  })

  // ★ THE REGRESSION THIS FILE EXISTS FOR. The casts are the point: they stand
  // in for a value arriving from JSON or any other untyped source, which is
  // exactly how an unaccepted word would reach this function in production.
  // Before the fix these returned `undefined` and the class attribute read
  // "object-cover undefined" — except "toString", which found a truthy
  // inherited function and stringified it. Either way no filter resolved and
  // the frame published in full colour, which is the outcome under test.
  it.each([['orange'], ['yellow'], [null], [undefined], [''], ['none '], ['toString']])(
    'falls back to monochrome for %j, never to unfiltered colour',
    (signal) => {
      const cls = signalClass(signal as PhotoSignal)
      expect(cls).toBe('signal-mono')
      expect(signalClass(signal as PhotoSignal, true)).toBe('signal-mono-dim')
      expect(cls).not.toContain('undefined')
    },
  )

  it('never returns a class that is absent from globals.css', () => {
    // Every returned class must be one of the eight `.signal-*` rules; a
    // filter class with no rule behind it is the same silent no-op as
    // `undefined`, just harder to spot.
    const declared = new Set(
      PHOTO_SIGNALS.flatMap((s) => [signalClass(s), signalClass(s, true)]),
    )
    expect(declared.size).toBe(8)
    for (const bad of ['orange', null, undefined]) {
      expect(declared.has(signalClass(bad as PhotoSignal))).toBe(true)
      expect(declared.has(signalClass(bad as PhotoSignal, true))).toBe(true)
    }
  })
})

describe('the four accepted signals have exactly one definition', () => {
  // `lib/content/schemas.ts` spells the tuple out inline for hero-image
  // frontmatter instead of importing it. That second copy is how the catalogue
  // drifted in the first place, so assert the two agree behaviourally rather
  // than trusting them to be edited together.
  it.each(PHOTO_SIGNALS)('frontmatter accepts %s', (signal) => {
    const parsed = heroImageSchema.safeParse({ src: '/a.jpg', alt: 'a', signal })
    expect(parsed.success).toBe(true)
  })

  it.each([['orange'], ['yellow'], [null]])('frontmatter rejects %j', (signal) => {
    const parsed = heroImageSchema.safeParse({ src: '/a.jpg', alt: 'a', signal })
    expect(parsed.success).toBe(false)
  })
})
