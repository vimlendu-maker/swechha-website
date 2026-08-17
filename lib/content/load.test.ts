import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { loadEntries, ContentError } from './load'
import { storySchema } from './schemas'

let dir: string

const VALID = `---
title: A real story
summary: Something happened.
author: Priya Sharma
date: '2024-08-12'
heroImage:
  src: /images/a.jpg
  alt: A community meeting
---

Body text here.
`

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'swechha-content-'))
  mkdirSync(join(dir, 'story'), { recursive: true })
})

afterEach(() => rmSync(dir, { recursive: true, force: true }))

describe('loadEntries', () => {
  it('loads a valid entry and derives the slug from the filename', () => {
    writeFileSync(join(dir, 'story', 'delhi-air-victory.md'), VALID)
    const entries = loadEntries('story', storySchema, dir)
    expect(entries).toHaveLength(1)
    expect(entries[0].slug).toBe('delhi-air-victory')
    expect(entries[0].type).toBe('story')
    expect(entries[0].data.title).toBe('A real story')
    expect(entries[0].body.trim()).toBe('Body text here.')
  })

  it('ignores .gitkeep and non-markdown files', () => {
    writeFileSync(join(dir, 'story', '.gitkeep'), '')
    writeFileSync(join(dir, 'story', 'notes.txt'), 'ignore me')
    expect(loadEntries('story', storySchema, dir)).toHaveLength(0)
  })

  it('sorts entries newest first', () => {
    writeFileSync(join(dir, 'story', 'older.md'), VALID.replace('2024-08-12', '2023-01-01'))
    writeFileSync(join(dir, 'story', 'newer.md'), VALID.replace('2024-08-12', '2025-06-06'))
    expect(loadEntries('story', storySchema, dir).map((e) => e.slug)).toEqual([
      'newer',
      'older',
    ])
  })

  it('throws a ContentError naming the file and the field', () => {
    writeFileSync(join(dir, 'story', 'broken.md'), VALID.replace('alt: A community meeting', 'alt: ""'))
    let message = ''
    try {
      loadEntries('story', storySchema, dir)
    } catch (e) {
      message = (e as Error).message
    }
    expect(message).toContain('story/broken.md')
    expect(message).toContain('alt')
  })

  it('returns an empty array when the directory does not exist', () => {
    expect(loadEntries('film', storySchema, dir)).toEqual([])
  })
})
