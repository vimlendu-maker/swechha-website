import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// minPaths is a floor, not an exact count — a truncated/broken re-conversion
// would lose paths and drop below it. viewBox is the exact expected value
// (the source PDF's page size); this also locks in which lockup each
// filename actually contains, since that mapping was wrong once already.
const FILES = [
  { name: 'swechha-horizontal', minPaths: 9, viewBox: '0 0 154.887 44.6309' },
  { name: 'swechha-stacked', minPaths: 9, viewBox: '0 0 144.667 96' },
  { name: 'swechha-stacked-tagline', minPaths: 42, viewBox: '0 0 158.646 116.538' },
]

describe('brand SVGs', () => {
  for (const { name, minPaths, viewBox } of FILES) {
    it(`${name} uses the exact brand palette and no raster data`, () => {
      const svg = readFileSync(join(process.cwd(), 'public', 'brand', `${name}.svg`), 'utf8')
      expect(svg).not.toMatch(/rgb\(/)
      expect(svg).not.toContain('<image')
      expect(svg).toMatch(/#4BA1A5/i)
      expect(svg).toMatch(/#F05A66/i)
      expect(svg).toMatch(/#D2C662/i)
    })

    it(`${name} has intact geometry (path count and viewBox)`, () => {
      const svg = readFileSync(join(process.cwd(), 'public', 'brand', `${name}.svg`), 'utf8')
      const pathCount = (svg.match(/<path/g) ?? []).length
      expect(pathCount).toBeGreaterThanOrEqual(minPaths)
      expect(svg).toContain(`viewBox="${viewBox}"`)
    })
  }
})
