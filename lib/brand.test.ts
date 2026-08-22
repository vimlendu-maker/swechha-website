import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'

/**
 * WHAT THIS GUARDS, AND WHY IT CHANGED.
 *
 * It used to assert three SVG lockups — `swechha-horizontal.svg`,
 * `swechha-stacked.svg`, `swechha-stacked-tagline.svg`. Commit `1149b6d` (the
 * homepage freeze) deleted all three, and this file was not updated with them,
 * so the suite has been red ever since and nobody could tell a real brand
 * regression from the standing failure. A test that always fails guards
 * nothing.
 *
 * The SVGs are NOT coming back as-is. The mark-to-wordmark spacing was
 * corrected on 21 August and the corrected lockup was applied to the PNGs
 * below; the vector masters in git history predate that correction, so
 * restoring one would put the rejected proportions back on the site. Cutting a
 * true vector master from the corrected artwork is still an open task — until
 * it happens the PNGs are the brand assets, and they are what every surface of
 * the site actually loads.
 *
 * So the original intent is ported rather than dropped. Those tests existed to
 * catch three specific ways a re-export goes wrong: the wrong lockup landing
 * under a filename (which happened once — see `384ecd1`), raster data smuggled
 * into something meant to be clean, and geometry silently lost. The PNG
 * equivalents are below, plus the check the SVG tests could not make — that
 * every `/brand/...` href on the site resolves to a file that exists.
 */

const BRAND = join(process.cwd(), 'public', 'brand')

/* The four production lockups and their exact canvas. The dimensions are the
   approved artboard, so a re-export at a different size fails here rather than
   reflowing 42 headers. */
const PRODUCTION = [
  { name: 'swechha-horizontal-white-approved', width: 2048, height: 512 },
  { name: 'swechha-horizontal-black-approved', width: 2048, height: 512 },
  { name: 'swechha-white', width: 3786, height: 646 },
  { name: 'swechha-black', width: 3786, height: 646 },
]

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

/* PNG dimensions live in the IHDR chunk at a fixed offset — 8 bytes of magic,
   then a 4-byte length and the 4-byte 'IHDR' tag, then width and height as
   big-endian uint32. No dependency needed to read them. */
function pngSize(buf: Buffer) {
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) }
}

describe('brand lockups', () => {
  for (const { name, width, height } of PRODUCTION) {
    const file = join(BRAND, `${name}.png`)

    it(`${name} is a real PNG at the approved canvas`, () => {
      expect(existsSync(file)).toBe(true)
      const buf = readFileSync(file)
      expect(buf.subarray(0, 8).equals(PNG_MAGIC)).toBe(true)
      expect(pngSize(buf)).toEqual({ width, height })
    })

    /* The correction was made INSIDE the same canvas — the spacing between the
       mark and the wordmark changed, the artboard did not. So dimensions alone
       cannot tell the corrected file from the one it replaced, and the way this
       regresses is someone copying an archived original back over production.
       Comparing against the archived original catches exactly that. */
    it(`${name} is the corrected lockup, not the archived original`, () => {
      const original = join(BRAND, 'archive', `${name}-original.png`)
      expect(existsSync(original)).toBe(true)
      expect(readFileSync(file).equals(readFileSync(original))).toBe(false)
    })
  }

  it('ships no stale vector master alongside the corrected PNGs', () => {
    /* If an SVG reappears in this folder it is almost certainly one of the
       deleted masters restored out of history, which carries the rejected
       proportions. A genuine new master is welcome — it just has to arrive with
       a decision record and an update to this test. */
    const svgs = readdirSync(BRAND).filter((f) => extname(f) === '.svg')
    expect(svgs).toEqual([])
  })

  it('every /brand/ reference on the site resolves to a file that exists', () => {
    /* The check the SVG tests could not make. The built pages, both React shell
       components, the page generators and the JSON-LD in lib/org.ts all name a
       brand file by path; renaming an asset without updating them is a broken
       image on every page, and nothing else in the repo would notice. */
    const roots = ['public/design/v3', 'components', 'lib/org.ts', 'scripts/lib']
    const files: string[] = []
    const walk = (p: string) => {
      const full = join(process.cwd(), p)
      if (!existsSync(full)) return
      if (statSync(full).isDirectory()) {
        for (const e of readdirSync(full)) walk(join(p, e))
      } else if (/\.(html|tsx|ts|mjs)$/.test(p) && !p.endsWith('.test.ts')) {
        files.push(full)
      }
    }
    for (const r of roots) walk(r)
    expect(files.length).toBeGreaterThan(0)

    const missing = new Set<string>()
    for (const f of files) {
      const refs = readFileSync(f, 'utf8').matchAll(
        /\/brand\/([A-Za-z0-9._/-]+\.(?:png|svg|jpg|webp))/g,
      )
      for (const m of refs) {
        if (!existsSync(join(BRAND, m[1]))) {
          missing.add(`${m[0]} (in ${f.replace(process.cwd() + '/', '')})`)
        }
      }
    }
    expect([...missing]).toEqual([])
  })
})
