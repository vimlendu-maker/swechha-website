#!/usr/bin/env node
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const SRC =
  '/Users/administrator/Desktop/SWECHHA MASTER/from Documents/Branding & Creative/Swechha logos/Swechha/Swechha logo files/Swechha'
const OUT = join(process.cwd(), 'public', 'brand')

const BRAND = {
  teal: '#4BA1A5',
  coral: '#F05A66',
  ochre: '#D2C662',
}

// NOTE: the source PDF filenames (2018 vintage) are misleading — verified by
// rendering each one and comparing viewBox/layout, not by trusting the name:
//   - "without tagline-primary unit.pdf" is actually the STACKED lockup
//     (mark above wordmark).
//   - "stacked unit without tagline.pdf" is actually the HORIZONTAL lockup
//     (mark beside wordmark).
// Output names below describe what each file actually contains. Do not
// "correct" this mapping back to match the source filenames.
const SOURCES = [
  ['logo without tagline/pdf/without tagline-primary unit.pdf', 'swechha-stacked'],
  ['logo without tagline/pdf/stacked unit without tagline.pdf', 'swechha-horizontal'],
  ['logo with tagline/swechha logo with tagline.pdf', 'swechha-stacked-tagline'],
]

/** Nearest brand colour for an rgb(a%, b%, c%) triple from pdftocairo. */
function nearestBrand(r, g, b) {
  const targets = Object.values(BRAND).map((hex) => ({
    hex,
    rgb: [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)),
  }))
  let best = null
  let bestDist = Infinity
  for (const t of targets) {
    const d =
      (t.rgb[0] - r) ** 2 + (t.rgb[1] - g) ** 2 + (t.rgb[2] - b) ** 2
    if (d < bestDist) {
      bestDist = d
      best = t.hex
    }
  }
  // Guard: refuse to snap a colour that is nowhere near the palette.
  if (bestDist > 40 ** 2 * 3) {
    throw new Error(
      `Colour rgb(${r},${g},${b}) is not close to any brand colour — ` +
        `check the source file before normalising.`,
    )
  }
  return best
}

mkdirSync(OUT, { recursive: true })

/**
 * IMPORTANT — these SVGs are the 2018 LEGACY lockup, not the current logo.
 *
 * Measured 2026-08-18 against the approved black/white PNGs supplied by the
 * brand owner (`swechha-*-approved.png`, 4:1). Both were normalised to 200px
 * height and their ink columns profiled:
 *
 *   - the MARK is pixel-identical in both (126px wide) — same artwork
 *   - every wordmark LETTER is 1.232x larger in the approved lockup
 *   - but inter-letter GAPS are only 1.170x larger
 *
 * Letter scale and tracking therefore moved independently, so the approved
 * lockup CANNOT be reproduced from this vector by any uniform transform —
 * matching it would mean re-setting each letter's position, i.e. recreating the
 * wordmark, which the brand rules forbid.
 *
 * There is no readable true-vector source for the approved lockup:
 *   - `black and white logo.eps` / `black-logoswechharectangle.eps` are
 *     Illustrator-16 EPS carrying ASCII85 %AI9_PrivateData — unconvertible
 *     without Ghostscript (not installed).
 *   - `high-res rectangle logo swechha-white.ai` IS %PDF-1.5 and converts, but
 *     its 9 vector paths are clip/mask geometry only (they render empty); the
 *     actual artwork is an embedded 5001x1452 raster. It is a placed image.
 *
 * So the PNGs are canonical and are what the site uses. Keep this script for
 * provenance of the legacy colour lockup; do not wire its output into the UI.
 * To get real vector, ask the brand owner's designer for the May-2021 rectangle
 * lockup as SVG or PDF.
 */

for (const [rel, name] of SOURCES) {
  const target = join(OUT, `${name}.svg`)
  execFileSync('pdftocairo', ['-svg', join(SRC, rel), target])

  let svg = readFileSync(target, 'utf8')
  svg = svg.replace(
    /rgb\(([\d.]+)%,\s*([\d.]+)%,\s*([\d.]+)%\)/g,
    (_m, a, b, c) =>
      nearestBrand(
        Math.round((parseFloat(a) / 100) * 255),
        Math.round((parseFloat(b) / 100) * 255),
        Math.round((parseFloat(c) / 100) * 255),
      ),
  )
  writeFileSync(target, svg)
  console.log(`wrote ${target}  (legacy 2018 lockup — see note above)`)
}
