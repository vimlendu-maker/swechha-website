import { describe, it, expect } from 'vitest'
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
})
