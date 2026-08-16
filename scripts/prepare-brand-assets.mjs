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

const SOURCES = [
  ['logo without tagline/pdf/without tagline-primary unit.pdf', 'swechha-primary'],
  ['logo without tagline/pdf/stacked unit without tagline.pdf', 'swechha-stacked'],
  ['logo with tagline/swechha logo with tagline.pdf', 'swechha-tagline'],
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
  console.log(`wrote ${target}`)
}
