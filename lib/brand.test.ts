import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const FILES = ['swechha-primary', 'swechha-stacked', 'swechha-tagline']

describe('brand SVGs', () => {
  for (const name of FILES) {
    it(`${name} uses the exact brand palette and no raster data`, () => {
      const svg = readFileSync(join(process.cwd(), 'public', 'brand', `${name}.svg`), 'utf8')
      expect(svg).not.toMatch(/rgb\(/)
      expect(svg).not.toContain('<image')
      expect(svg).toMatch(/#4BA1A5/i)
      expect(svg).toMatch(/#F05A66/i)
      expect(svg).toMatch(/#D2C662/i)
    })
  }
})
