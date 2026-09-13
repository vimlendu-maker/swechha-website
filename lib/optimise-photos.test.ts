import { describe, it, expect, afterEach } from 'vitest'
import { mkdtempSync, rmSync, writeFileSync, readFileSync, statSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import sharp from 'sharp'
import { optimisePhotos, PHOTO_DIRS, MIN_GAIN, QUALITY, ENCODE } from '@/scripts/lib/optimise-photos.mjs'

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * THE OPTIMISER MUST BE IDEMPOTENT.
 * ───────────────────────────────────────────────────────────────────────────
 * On 13 September 2026, while PR #155 was being merged, a plain
 * `node scripts/optimise-photos.mjs` rewrote 39 JPEGs. Four of them had
 * actually changed. The other 35 had ALREADY been optimised by this same
 * script on that branch and were re-encoded a second time — mozjpeg q82 laid
 * on top of mozjpeg q82, which is cumulative generation loss — for a combined
 * 0.2MB. The 35 were reverted by hand before the merge.
 *
 * The guard that should have stopped it was `MIN_GAIN`, and it could not,
 * because it asks the wrong question. A second q82 pass over a large
 * photograph reliably shaves more than 2KB (the fixture below sheds tens of
 * KB), so a byte threshold never fires, and the run then reports
 * "rewritten 35" as if it were work done. The damage looked like success.
 *
 * The answer is to skip on measured QUALITY: a JPEG carries the quantisation
 * tables it was written with, so a file already at or below q82 can be
 * recognised and left alone no matter how many bytes a re-encode would save.
 *
 * These tests hold that line, and hold the four things the script already got
 * right that a rewrite of its skip logic could easily have dropped:
 * `.rotate()`, `.withMetadata()`, same dimensions, same path.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const W = 1200
const H = 900

/** Deterministic pseudo-random RGB — noisy enough that a JPEG of it is large
 *  and, crucially, that a SECOND q82 pass over it saves far more than
 *  MIN_GAIN. A smooth gradient does not: it sheds ~300 bytes on the second
 *  pass and would pass the test below by accident rather than on the merit of
 *  the quality check. */
function noisePixels(seed = 1) {
  const px = Buffer.alloc(W * H * 3)
  let s = seed
  for (let i = 0; i < px.length; i++) {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    px[i] = (s >>> 16) & 0xff
  }
  return sharp(px, { raw: { width: W, height: H, channels: 3 } })
}

/* A directory PER TEST. A shared one would let each test see the files the
   previous one left behind, and `rewritten` is a count — the assertions would
   drift with the order the tests happen to run in. */
const scratches: string[] = []
function scratch() {
  const d = mkdtempSync(join(tmpdir(), 'optimise-photos-'))
  scratches.push(d)
  return d
}
function place(dir: string, name: string, buf: Buffer) {
  const p = join(dir, name)
  writeFileSync(p, buf)
  return p
}

afterEach(() => {
  while (scratches.length) rmSync(scratches.pop()!, { recursive: true, force: true })
})

describe('optimisePhotos', () => {
  it('points at four directories that exist', () => {
    /* Not a restatement of the constant: a renamed or mistyped directory is
       skipped silently by `readdirSync`, and the run then reports a cheerful
       "0 JPEGs" instead of failing. */
    expect(PHOTO_DIRS.length).toBe(4)
    expect(PHOTO_DIRS).toContain('public/images/photos')
    for (const d of PHOTO_DIRS) expect(existsSync(d), `${d} is missing`).toBe(true)
  })

  /* ── THE DEFECT ────────────────────────────────────────────────────────── */

  it('leaves a file already at the target quality alone, however many bytes a re-encode would save', async () => {
    const dir = scratch()
    const atTarget = await noisePixels().jpeg(ENCODE).withMetadata().toBuffer()
    const p = place(dir, 'already-at-target.jpg', atTarget)

    /* The premise, asserted rather than assumed: a second q82 pass over this
       file really does clear the old byte threshold, by a wide margin. Without
       this line the test could go green because the fixture is incompressible,
       which would prove nothing at all. */
    const secondPass = await sharp(atTarget).rotate().jpeg(ENCODE).withMetadata().toBuffer()
    expect(atTarget.length - secondPass.length).toBeGreaterThan(MIN_GAIN)

    const result = await optimisePhotos({ dirs: [dir] })

    expect(result.rewritten).toBe(0)
    expect(result.skipped).toBe(1)
    expect(readFileSync(p).equals(atTarget)).toBe(true)
  })

  /* ── THE REQUIREMENT ───────────────────────────────────────────────────── */

  it('rewrites nothing on a second consecutive run', async () => {
    const dir = scratch()
    place(dir, 'above-target.jpg', await noisePixels(7).jpeg({ ...ENCODE, quality: 95 }).withMetadata().toBuffer())

    const first = await optimisePhotos({ dirs: [dir] })
    expect(first.rewritten).toBeGreaterThan(0)

    const second = await optimisePhotos({ dirs: [dir] })
    expect(second.rewritten).toBe(0)
    expect(second.failures).toEqual([])

    /* And a third, because "settles after two runs" and "settles" are
       different claims and only the second one is worth having. */
    expect((await optimisePhotos({ dirs: [dir] })).rewritten).toBe(0)
  })

  it('still optimises a file encoded above the target quality', async () => {
    const dir = scratch()
    const above = await noisePixels(11).jpeg({ ...ENCODE, quality: 96 }).withMetadata().toBuffer()
    const p = place(dir, 'needs-work.jpg', above)

    const result = await optimisePhotos({ dirs: [dir] })

    expect(result.rewritten).toBe(1)
    expect(statSync(p).size).toBeLessThan(above.length)
  })

  /* ── WHAT THE SCRIPT ALREADY GOT RIGHT ─────────────────────────────────── */

  it('bakes EXIF orientation into the pixels rather than dropping it', async () => {
    /* sharp drops EXIF orientation on write, so a re-encode without `.rotate()`
       renders a rotated original sideways. That shipped here once: a
       performance pass put seven photographs on the live site rotated 90°, and
       the dimension check was blind to it because the dimensions were right. */
    const dir = scratch()
    const p = place(dir, 'orientation-6.jpg', await noisePixels(13)
      .withMetadata({ orientation: 6 })
      .jpeg({ ...ENCODE, quality: 95 })
      .toBuffer())

    expect((await optimisePhotos({ dirs: [dir] })).rewritten).toBe(1)

    const out = await sharp(readFileSync(p)).metadata()
    /* Orientation 6 transposes the axes, so the honest output is portrait at
       orientation 1 — the same picture, no longer leaning on a tag. */
    expect(out.width).toBe(H)
    expect(out.height).toBe(W)
    expect(out.orientation ?? 1).toBe(1)
  })

  it('keeps the EXIF that carries attribution', async () => {
    const dir = scratch()
    const p = place(dir, 'credited.jpg', await noisePixels(17)
      .withExif({ IFD0: { Copyright: 'Swechha Foundation', Artist: 'A Photographer' } })
      .jpeg({ ...ENCODE, quality: 95 })
      .toBuffer())

    expect((await optimisePhotos({ dirs: [dir] })).rewritten).toBe(1)

    const out = readFileSync(p)
    expect((await sharp(out).metadata()).exif).toBeTruthy()
    expect(out.includes(Buffer.from('Swechha Foundation'))).toBe(true)
    expect(out.includes(Buffer.from('A Photographer'))).toBe(true)
  })

  it('rewrites in place: same path, same format, same pixel dimensions', async () => {
    const dir = scratch()
    const p = place(dir, 'in-place.jpg', await noisePixels(19).jpeg({ ...ENCODE, quality: 95 }).withMetadata().toBuffer())

    const result = await optimisePhotos({ dirs: [dir] })
    expect(result.files).toEqual([p])
    expect(result.rewritten).toBe(1)

    const out = await sharp(readFileSync(p)).metadata()
    expect(out.format).toBe('jpeg')
    expect(out.width).toBe(W)
    expect(out.height).toBe(H)
  })

  it('writes nothing at all in --check mode', async () => {
    const dir = scratch()
    const above = await noisePixels(23).jpeg({ ...ENCODE, quality: 95 }).withMetadata().toBuffer()
    const p = place(dir, 'check-mode.jpg', above)

    const result = await optimisePhotos({ dirs: [dir], check: true })

    expect(result.rewritten).toBe(1)
    expect(readFileSync(p).equals(above)).toBe(true)
  })

  it('encodes at the quality the header documents', () => {
    expect(QUALITY).toBe(82)
    expect(ENCODE).toMatchObject({ quality: 82, mozjpeg: true, chromaSubsampling: '4:2:0' })
  })
})
