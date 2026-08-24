import { describe, it, expect, afterEach } from 'vitest'
import { mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { imageSize } from '@/scripts/lib/image-size.mjs'

describe('imageSize', () => {
  it('reads a JPEG width and height', () => {
    const s = imageSize('/images/photos/india-gate-hero.jpg')
    expect(s).not.toBeNull()
    expect(s!.width).toBeGreaterThan(0)
    expect(s!.height).toBeGreaterThan(0)
  })

  it('returns null for a path that does not exist', () => {
    expect(imageSize('/images/photos/not-a-real-file.jpg')).toBeNull()
  })

  /* ★ THE EXIF CASE. jpeg-size.mjs exists because seven real photos in this
     repo were recorded at their RAW pixel dimensions (e.g. 2000x1500) while
     carrying EXIF Orientation 6, which every browser renders transposed
     (1500x2000 portrait) — see jpeg-size.mjs's header comment. image-size.mjs
     used to parse SOF headers itself, which is blind to orientation and would
     have reported the raw, wrong numbers. None of the 155 JPEGs currently in
     public/ carry a non-1 orientation (all seven were corrected), so this
     test constructs a minimal fixture under a throwaway directory inside
     public/ (required by image-size.mjs's publicPath contract) and removes
     it immediately after. */
  const FIXTURE_DIR = '__tmp_exif_fixture__'
  const FIXTURE_PUBLIC_PATH = `/${FIXTURE_DIR}/oriented-6.jpg`

  afterEach(() => {
    rmSync(join(process.cwd(), 'public', FIXTURE_DIR), { recursive: true, force: true })
  })

  function u16be(n: number) { return Buffer.from([(n >> 8) & 0xff, n & 0xff]) }
  function u16le(n: number) { return Buffer.from([n & 0xff, (n >> 8) & 0xff]) }
  function u32le(n: number) { return Buffer.from([n & 0xff, (n >> 8) & 0xff, (n >> 16) & 0xff, (n >> 24) & 0xff]) }

  /** Builds a minimal JPEG carrying a single EXIF Orientation tag and a bare
   *  SOF0 frame header — just enough for jpeg-size.mjs (and, through it,
   *  image-size.mjs) to read, with no real image data. */
  function buildOrientedJpegFixture({ orientation, rawWidth, rawHeight }: { orientation: number, rawWidth: number, rawHeight: number }) {
    const entry = Buffer.concat([
      u16le(0x0112), // tag: Orientation
      u16le(3),      // type: SHORT
      u32le(1),      // count
      Buffer.concat([u16le(orientation), Buffer.from([0, 0])]), // value, padded to 4 bytes
    ])
    const ifd0 = Buffer.concat([u16le(1), entry, u32le(0)]) // 1 entry, no next IFD
    const tiff = Buffer.concat([Buffer.from('II', 'ascii'), u16le(42), u32le(8), ifd0])
    const exifBody = Buffer.concat([Buffer.from('Exif\0\0', 'ascii'), tiff])
    const app1 = Buffer.concat([Buffer.from([0xff, 0xe1]), u16be(exifBody.length + 2), exifBody])

    const sof0Body = Buffer.concat([
      Buffer.from([8]),          // precision
      u16be(rawHeight),
      u16be(rawWidth),
      Buffer.from([1]),          // 1 component
      Buffer.from([1, 0x11, 0]), // component id, sampling, qtable
    ])
    const sof0 = Buffer.concat([Buffer.from([0xff, 0xc0]), u16be(sof0Body.length + 2), sof0Body])

    return Buffer.concat([Buffer.from([0xff, 0xd8]), app1, sof0, Buffer.from([0xff, 0xd9])])
  }

  it('reports POST-orientation dimensions for a JPEG with EXIF Orientation 6, not its raw ones', () => {
    const fixture = buildOrientedJpegFixture({ orientation: 6, rawWidth: 2000, rawHeight: 1500 })
    const dir = join(process.cwd(), 'public', FIXTURE_DIR)
    mkdirSync(dir, { recursive: true })
    writeFileSync(join(dir, 'oriented-6.jpg'), fixture)

    const s = imageSize(FIXTURE_PUBLIC_PATH)
    expect(s).not.toBeNull()
    // Orientation 6 transposes the axes: recorded raw as 2000x1500 landscape,
    // a browser lays it out as 1500x2000 portrait. Reporting the raw numbers
    // here is the exact bug jpeg-size.mjs was written to cure.
    expect(s).toEqual({ width: 1500, height: 2000 })
  })
})
