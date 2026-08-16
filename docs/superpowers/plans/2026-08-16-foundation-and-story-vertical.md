# Swechha Website — Foundation + STORY Vertical Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the content pipeline, brand design system, and layout shell, then ship the STORY content type end-to-end (archive, detail, real content, SEO) as proof of the whole vertical.

**Architecture:** Markdown files in `content/<type>/<slug>.md` are read, validated against Zod schemas, and cross-linked by slug at build time — a dead relation or missing image alt text fails the build. Page components consume a single typed accessor module and never touch the filesystem. Every route is statically generated.

**Tech Stack:** Next.js 16.3.1 (App Router), React 19.2.8, TypeScript, Tailwind CSS v4 (CSS-first, no JS config), Zod, gray-matter, marked, Vitest.

**Spec:** [`docs/superpowers/specs/2026-08-16-swechha-website-technical-design.md`](../specs/2026-08-16-swechha-website-technical-design.md)

## Global Constraints

- **Next.js 16 — `params` is a `Promise`.** Always `const { slug } = await params`.
- **`PageProps<'/route'>` and `LayoutProps<'/'>` are globally available generated types.** Never import them; never hand-write a props interface.
- **Tailwind v4 is CSS-first.** All tokens go in `app/globals.css` under `@theme inline`. Never create `tailwind.config.ts`.
- **No unnecessary dependencies** (project principle #9). Runtime deps added by this plan are exactly: `zod`, `gray-matter`, `marked`. Dev: `vitest`.
- **Brand palette — exact values, never approximated:** teal `#4BA1A5` (primary), coral `#F05A66`, ochre `#D2C662`, deep indigo `#2B2D46` (preferred background).
- **Logo rules:** ships as artwork; never retyped from a font, never restyled, skewed, re-proportioned, enclosed in a shape, or stripped of elements. White single-colour on backgrounds ≥50% K and on logo colours; black below.
- **Body text 18–20px minimum, line-height 1.6; headings line-height 1.3.**
- **Mobile-first.** Design at 375px first; breakpoints 375 / 768 / 1024 / 1440.
- **`heroImage.alt` is schema-required.** Accessibility is enforced by the build, not by discipline.
- **Always quote dates in frontmatter — `date: '2024-08-12'`, never `date: 2024-08-12`.** YAML parses an unquoted date into a JavaScript `Date`, which fails the string schema with a confusing message. This will bite on the first content file written without it.
- **Never assert "accessible" or "fast" without the measured number.**

---

## File Structure

| File | Responsibility |
|---|---|
| `lib/content/types.ts` | Shared types: `ContentType`, `Entry`, `Related` |
| `lib/content/schemas.ts` | Zod schemas per content type; single source of truth for frontmatter |
| `lib/content/load.ts` | Read + parse + validate files from disk into `Entry[]` |
| `lib/content/relations.ts` | Resolve and validate cross-type slug references |
| `lib/content/index.ts` | Public API — the only module pages import |
| `lib/markdown.ts` | Markdown body → HTML |
| `scripts/prepare-brand-assets.mjs` | One-off: PDF → SVG, normalise fills to brand hex |
| `scripts/make-placeholders.mjs` | One-off: dependency-free PNG placeholders at real slot size |
| `redirects.ts` | Legacy 301 map from the old WordPress site, consumed by `next.config.ts` |
| `app/globals.css` | Design tokens via `@theme inline` |
| `app/layout.tsx` | Root shell: fonts, `<SiteHeader>`, `<SiteFooter>`, base metadata |
| `components/site-header.tsx` | Navigation, incl. mobile treatment |
| `components/site-footer.tsx` | Footer, logo, newsletter |
| `components/content-card.tsx` | Archive grid card |
| `components/prose.tsx` | Rendered-Markdown wrapper |
| `components/related-content.tsx` | Related-entry block |
| `app/stories/page.tsx` | STORY archive |
| `app/stories/[slug]/page.tsx` | STORY detail |
| `app/sitemap.ts`, `app/robots.ts` | SEO, derived from content accessors |
| `content/<type>/` | Six content directories |

---

## Task 1: Dependencies, Vitest, and scaffold cleanup

**Files:**
- Modify: `package.json`
- Create: `vitest.config.mts`
- Modify: `app/page.tsx`
- Delete: `public/next.svg`, `public/vercel.svg`, `public/file.svg`, `public/globe.svg`, `public/window.svg`

**Interfaces:**
- Consumes: nothing
- Produces: `npm test` runs Vitest; `npm run build` still succeeds

- [ ] **Step 1: Install dependencies**

```bash
cd /Users/administrator/swechha-website
npm install zod gray-matter marked
npm install -D vitest
```

- [ ] **Step 2: Add the test script**

In `package.json`, add to `"scripts"`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Create `vitest.config.mts`**

```ts
import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['lib/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('.', import.meta.url)),
    },
  },
})
```

- [ ] **Step 4: Remove scaffold placeholder assets**

```bash
rm public/next.svg public/vercel.svg public/file.svg public/globe.svg public/window.svg
```

- [ ] **Step 5: Replace the starter homepage with a minimal placeholder**

Replace the entire contents of `app/page.tsx`:

```tsx
export default function Home() {
  return (
    <main>
      <h1>Swechha</h1>
    </main>
  )
}
```

- [ ] **Step 6: Verify the build still passes**

Run: `npm run build`
Expected: build succeeds with no errors. (It will warn about nothing; if it errors on a missing image import, a scaffold file still references a deleted SVG — remove that reference.)

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: add content/test dependencies and clear scaffold placeholders"
```

---

## Task 2: Content types and Zod schemas

**Files:**
- Create: `lib/content/types.ts`
- Create: `lib/content/schemas.ts`
- Test: `lib/content/schemas.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces:
  - `type ContentType = 'project' | 'story' | 'knowledge' | 'film' | 'campaign' | 'briefing'`
  - `CONTENT_TYPES: readonly ContentType[]`
  - `interface Entry<T> { type: ContentType; slug: string; data: T; body: string }`
  - `type Related = Record<ContentType, string[]>`
  - `relatedSchema`, `heroImageSchema` (Zod)
  - `storySchema` (Zod), `type Story = z.infer<typeof storySchema>`

- [ ] **Step 1: Write the failing test**

Create `lib/content/schemas.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { storySchema } from './schemas'

const valid = {
  title: 'How Delhi won a partial ban on construction emissions',
  summary: 'After 18 months of advocacy, a partial ban was secured.',
  author: 'Priya Sharma',
  date: '2024-08-12',
  heroImage: { src: '/images/stories/delhi-air.jpg', alt: 'Community members at an anti-pollution event' },
}

describe('storySchema', () => {
  it('accepts a valid story and applies defaults', () => {
    const parsed = storySchema.parse(valid)
    expect(parsed.title).toBe(valid.title)
    expect(parsed.tags).toEqual([])
    expect(parsed.featured).toBe(false)
    expect(parsed.related.story).toEqual([])
  })

  it('rejects a story with no title', () => {
    expect(() => storySchema.parse({ ...valid, title: '' })).toThrow()
  })

  it('rejects a hero image with no alt text', () => {
    expect(() =>
      storySchema.parse({ ...valid, heroImage: { src: '/a.jpg', alt: '' } }),
    ).toThrow()
  })

  it('rejects a malformed date', () => {
    expect(() => storySchema.parse({ ...valid, date: '12-08-2024' })).toThrow()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- lib/content/schemas.test.ts`
Expected: FAIL — cannot resolve `./schemas`.

- [ ] **Step 3: Write `lib/content/types.ts`**

```ts
export const CONTENT_TYPES = [
  'project',
  'story',
  'knowledge',
  'film',
  'campaign',
  'briefing',
] as const

export type ContentType = (typeof CONTENT_TYPES)[number]

export type Related = Record<ContentType, string[]>

export interface Entry<T = unknown> {
  type: ContentType
  slug: string
  data: T
  body: string
}
```

- [ ] **Step 4: Write `lib/content/schemas.ts`**

```ts
import { z } from 'zod'

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

const slugList = () => z.array(z.string()).default([])

/**
 * Cross-type relations, keyed by content type, each a list of slugs.
 * Written out explicitly rather than generated from CONTENT_TYPES so the
 * inferred type stays readable and TypeScript can check it properly.
 */
export const relatedSchema = z
  .object({
    project: slugList(),
    story: slugList(),
    knowledge: slugList(),
    film: slugList(),
    campaign: slugList(),
    briefing: slugList(),
  })
  .default({
    project: [],
    story: [],
    knowledge: [],
    film: [],
    campaign: [],
    briefing: [],
  })

export const heroImageSchema = z.object({
  src: z.string().min(1, 'heroImage.src is required'),
  alt: z.string().min(1, 'heroImage.alt is required — every image needs alt text'),
})

export const storySchema = z.object({
  title: z.string().min(1, 'title is required'),
  summary: z.string().min(1, 'summary is required'),
  author: z.string().min(1, 'author is required'),
  date: z.string().regex(ISO_DATE, 'date must be YYYY-MM-DD'),
  heroImage: heroImageSchema,
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  related: relatedSchema,
})

export type Story = z.infer<typeof storySchema>
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test -- lib/content/schemas.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 6: Commit**

```bash
git add lib/content/types.ts lib/content/schemas.ts lib/content/schemas.test.ts
git commit -m "feat(content): add content types and the STORY frontmatter schema"
```

---

## Task 3: Content loader

**Files:**
- Create: `lib/content/load.ts`
- Test: `lib/content/load.test.ts`
- Create: `content/project/.gitkeep`, `content/story/.gitkeep`, `content/knowledge/.gitkeep`, `content/film/.gitkeep`, `content/campaign/.gitkeep`, `content/briefing/.gitkeep`

**Interfaces:**
- Consumes: `Entry`, `ContentType` from `./types`; `storySchema` from `./schemas`
- Produces:
  - `CONTENT_DIR: string` — absolute path to `content/`
  - `loadEntries<T>(type: ContentType, schema: ZodType<T>, baseDir?: string): Entry<T>[]` — throws `ContentError` on invalid frontmatter, sorted newest-first where a `date` field exists
  - `class ContentError extends Error`

- [ ] **Step 1: Create the six content directories**

```bash
cd /Users/administrator/swechha-website
for t in project story knowledge film campaign briefing; do
  mkdir -p "content/$t" && touch "content/$t/.gitkeep"
done
```

- [ ] **Step 2: Write the failing test**

Create `lib/content/load.test.ts`:

```ts
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
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npm test -- lib/content/load.test.ts`
Expected: FAIL — cannot resolve `./load`.

- [ ] **Step 4: Write `lib/content/load.ts`**

```ts
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import matter from 'gray-matter'
import type { ZodType } from 'zod'
import type { ContentType, Entry } from './types'

export const CONTENT_DIR = join(process.cwd(), 'content')

/**
 * Thrown when a content file is malformed. The message is written for a
 * human author, not a developer: it names the file and the failing field.
 */
export class ContentError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ContentError'
  }
}

function hasDate(value: unknown): value is { date: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { date?: unknown }).date === 'string'
  )
}

export function loadEntries<T>(
  type: ContentType,
  schema: ZodType<T>,
  baseDir: string = CONTENT_DIR,
): Entry<T>[] {
  const dir = join(baseDir, type)
  if (!existsSync(dir)) return []

  const entries = readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((file) => {
      const slug = file.replace(/\.md$/, '')
      const raw = readFileSync(join(dir, file), 'utf8')
      const { data, content } = matter(raw)

      const result = schema.safeParse(data)
      if (!result.success) {
        const details = result.error.issues
          .map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`)
          .join('\n')
        throw new ContentError(
          `Invalid frontmatter in ${type}/${file}:\n${details}`,
        )
      }

      return { type, slug, data: result.data, body: content }
    })

  return entries.sort((a, b) => {
    if (!hasDate(a.data) || !hasDate(b.data)) return 0
    return b.data.date.localeCompare(a.data.date)
  })
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test -- lib/content/load.test.ts`
Expected: PASS, 5 tests.

- [ ] **Step 6: Commit**

```bash
git add lib/content/load.ts lib/content/load.test.ts content/
git commit -m "feat(content): add the validating content loader"
```

---

## Task 4: Relation resolution

**Files:**
- Create: `lib/content/relations.ts`
- Test: `lib/content/relations.test.ts`

**Interfaces:**
- Consumes: `Entry`, `ContentType`, `Related` from `./types`; `ContentError` from `./load`
- Produces:
  - `type EntryIndex = Map<ContentType, Map<string, Entry>>`
  - `buildIndex(entriesByType: Partial<Record<ContentType, Entry[]>>): EntryIndex`
  - `validateRelations(entries: Entry[], index: EntryIndex): void` — throws `ContentError` naming both files
  - `resolveRelated(entry: Entry, index: EntryIndex): Entry[]`

- [ ] **Step 1: Write the failing test**

Create `lib/content/relations.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { buildIndex, validateRelations, resolveRelated } from './relations'
import type { Entry, ContentType, Related } from './types'
import { CONTENT_TYPES } from './types'

const emptyRelated = (): Related =>
  Object.fromEntries(CONTENT_TYPES.map((t) => [t, []])) as Related

function story(slug: string, related: Partial<Related> = {}): Entry {
  return {
    type: 'story' as ContentType,
    slug,
    body: '',
    data: { title: slug, related: { ...emptyRelated(), ...related } },
  }
}

describe('relations', () => {
  it('resolves a valid relation to the real entry', () => {
    const a = story('alpha', { story: ['beta'] })
    const b = story('beta')
    const index = buildIndex({ story: [a, b] })
    expect(resolveRelated(a, index).map((e) => e.slug)).toEqual(['beta'])
  })

  it('throws naming both files when a slug does not resolve', () => {
    const a = story('alpha', { story: ['ghost'] })
    const index = buildIndex({ story: [a] })
    let message = ''
    try {
      validateRelations([a], index)
    } catch (e) {
      message = (e as Error).message
    }
    expect(message).toContain('story/alpha.md')
    expect(message).toContain('ghost')
  })

  it('throws when the related entry is of the wrong type', () => {
    const a = story('alpha', { project: ['beta'] })
    const b = story('beta')
    const index = buildIndex({ story: [a, b] })
    expect(() => validateRelations([a], index)).toThrow(/project\/beta/)
  })

  it('passes silently when every relation resolves', () => {
    const a = story('alpha', { story: ['beta'] })
    const b = story('beta')
    const index = buildIndex({ story: [a, b] })
    expect(() => validateRelations([a, b], index)).not.toThrow()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- lib/content/relations.test.ts`
Expected: FAIL — cannot resolve `./relations`.

- [ ] **Step 3: Write `lib/content/relations.ts`**

```ts
import { ContentError } from './load'
import { CONTENT_TYPES, type ContentType, type Entry, type Related } from './types'

export type EntryIndex = Map<ContentType, Map<string, Entry>>

function relationsOf(entry: Entry): Partial<Related> {
  const data = entry.data as { related?: Partial<Related> }
  return data.related ?? {}
}

export function buildIndex(
  entriesByType: Partial<Record<ContentType, Entry[]>>,
): EntryIndex {
  const index: EntryIndex = new Map()
  for (const type of CONTENT_TYPES) {
    const bySlug = new Map<string, Entry>()
    for (const entry of entriesByType[type] ?? []) bySlug.set(entry.slug, entry)
    index.set(type, bySlug)
  }
  return index
}

/**
 * Fails the build if any entry points at a slug that does not exist as the
 * declared type. Runs once, after every type has been loaded.
 */
export function validateRelations(entries: Entry[], index: EntryIndex): void {
  const errors: string[] = []

  for (const entry of entries) {
    const related = relationsOf(entry)
    for (const type of CONTENT_TYPES) {
      for (const slug of related[type] ?? []) {
        if (!index.get(type)?.has(slug)) {
          errors.push(
            `  - ${entry.type}/${entry.slug}.md refers to ${type}/${slug}, ` +
              `but content/${type}/${slug}.md does not exist`,
          )
        }
      }
    }
  }

  if (errors.length > 0) {
    throw new ContentError(`Unresolved content relations:\n${errors.join('\n')}`)
  }
}

export function resolveRelated(entry: Entry, index: EntryIndex): Entry[] {
  const related = relationsOf(entry)
  const out: Entry[] = []
  for (const type of CONTENT_TYPES) {
    for (const slug of related[type] ?? []) {
      const found = index.get(type)?.get(slug)
      if (found) out.push(found)
    }
  }
  return out
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- lib/content/relations.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/content/relations.ts lib/content/relations.test.ts
git commit -m "feat(content): validate cross-type relations at build time"
```

---

## Task 5: Public content API and Markdown rendering

**Files:**
- Create: `lib/content/index.ts`
- Create: `lib/markdown.ts`
- Test: `lib/content/index.test.ts`

**Interfaces:**
- Consumes: everything from Tasks 2–4
- Produces:
  - `getAllStories(): Entry<Story>[]`
  - `getStoryBySlug(slug: string): Entry<Story> | null`
  - `getRelated(entry: Entry): Entry[]`
  - `getAllEntries(): Entry[]`
  - `renderMarkdown(body: string): string`

- [ ] **Step 1: Write `lib/markdown.ts`**

```ts
import { marked } from 'marked'

/**
 * Content is authored by the Swechha team in this repository and is trusted;
 * it is not user-submitted. GFM (tables, strikethrough) is on by default.
 */
export function renderMarkdown(body: string): string {
  return marked.parse(body, { async: false })
}
```

- [ ] **Step 2: Write the failing test**

Create `lib/content/index.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { getAllStories, getStoryBySlug, getAllEntries } from './index'
import { renderMarkdown } from '../markdown'

describe('content API', () => {
  it('loads every story without throwing', () => {
    expect(() => getAllStories()).not.toThrow()
  })

  it('returns null for an unknown slug', () => {
    expect(getStoryBySlug('definitely-not-a-real-story')).toBeNull()
  })

  it('includes stories in getAllEntries', () => {
    const slugs = getAllEntries().map((e) => `${e.type}/${e.slug}`)
    const stories = getAllStories().map((e) => `story/${e.slug}`)
    for (const s of stories) expect(slugs).toContain(s)
  })
})

describe('renderMarkdown', () => {
  it('renders a heading and a paragraph', () => {
    const html = renderMarkdown('# Title\n\nSome text.')
    expect(html).toContain('<h1>Title</h1>')
    expect(html).toContain('<p>Some text.</p>')
  })
})
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npm test -- lib/content/index.test.ts`
Expected: FAIL — cannot resolve `./index`.

- [ ] **Step 4: Write `lib/content/index.ts`**

```ts
import { loadEntries } from './load'
import { storySchema, type Story } from './schemas'
import { buildIndex, resolveRelated, validateRelations, type EntryIndex } from './relations'
import type { Entry } from './types'

export type { Entry } from './types'
export type { Story } from './schemas'
export { ContentError } from './load'

interface Content {
  stories: Entry<Story>[]
  all: Entry[]
  index: EntryIndex
}

let cache: Content | null = null

/**
 * Loads and validates all content once per process. Called lazily by every
 * accessor, so a build failure surfaces on first access with a message
 * naming the offending file.
 */
function content(): Content {
  if (cache) return cache

  const stories = loadEntries('story', storySchema)
  const all: Entry[] = [...stories]
  const index = buildIndex({ story: stories })

  validateRelations(all, index)

  cache = { stories, all, index }
  return cache
}

export function getAllStories(): Entry<Story>[] {
  return content().stories
}

export function getStoryBySlug(slug: string): Entry<Story> | null {
  return content().stories.find((e) => e.slug === slug) ?? null
}

export function getAllEntries(): Entry[] {
  return content().all
}

export function getRelated(entry: Entry): Entry[] {
  return resolveRelated(entry, content().index)
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test -- lib/content/index.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 6: Commit**

```bash
git add lib/content/index.ts lib/content/index.test.ts lib/markdown.ts
git commit -m "feat(content): add the public content API and Markdown rendering"
```

---

## Task 6: Brand assets — SVG conversion with exact palette

**Files:**
- Create: `scripts/prepare-brand-assets.mjs`
- Create: `public/brand/*.svg` (script output, committed)
- Test: `lib/brand.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `public/brand/swechha-primary.svg`, `public/brand/swechha-stacked.svg`, `public/brand/swechha-tagline.svg`, each using exactly `#4BA1A5`, `#F05A66`, `#D2C662`

**Context:** `pdftocairo` (poppler, already installed) converts the vector PDFs to true SVG, but renders CMYK-origin colours to RGB values that drift from the documented palette — coral came out 29 points off in green. The guidelines' first improper-usage rule is "never stray from the colour palette", so fills are normalised to the documented hex values.

- [ ] **Step 1: Write the conversion script**

Create `scripts/prepare-brand-assets.mjs`:

```js
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
```

- [ ] **Step 2: Run the script**

```bash
cd /Users/administrator/swechha-website
node scripts/prepare-brand-assets.mjs
```

Expected: three `wrote …` lines, no error.

- [ ] **Step 3: Write the failing test**

Create `lib/brand.test.ts`:

```ts
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
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- lib/brand.test.ts`
Expected: PASS, 3 tests. If any fails on a missing hex, the source PDF used a different lockup — inspect the SVG's remaining `rgb(` values before changing the guard.

- [ ] **Step 5: Visually verify the logos are intact**

Open `public/brand/swechha-primary.svg` in a browser. Confirm: coral circle, ochre heart-leaf, teal wordmark, nothing clipped or distorted. **The mark must not have been altered in shape** — only fills were touched.

- [ ] **Step 6: Commit**

```bash
git add scripts/prepare-brand-assets.mjs public/brand lib/brand.test.ts
git commit -m "feat(brand): convert logos to SVG with the exact guideline palette"
```

---

## Task 7: Design tokens and fonts

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: nothing
- Produces: CSS variables `--color-ink`, `--color-paper`, `--color-teal`, `--color-coral`, `--color-ochre`, `--color-indigo`, `--font-display`, `--font-body`; `<SiteHeader>`/`<SiteFooter>` slots filled in Task 8.

**Typeface decision:** **Fraunces** (display — variable, warm, editorial, with `SOFT`/`WONK` axes) and **Instrument Sans** (body — contemporary neo-grotesque, excellent at 18–20px). Both are open, on Google Fonts, and **`next/font/google` downloads them at build time and self-hosts them — no browser request reaches Google.** This supersedes the spec's `next/font/local` note; the privacy and performance properties are identical and there are no font files to manage. Each face is bound to one CSS variable, so swapping either is a one-line change.

- [ ] **Step 1: Replace `app/globals.css` entirely**

```css
@import "tailwindcss";

:root {
  /* Brand — exact values from the May 2025 guidelines. Never approximate. */
  --swechha-teal: #4ba1a5;
  --swechha-coral: #f05a66;
  --swechha-ochre: #d2c662;
  --swechha-indigo: #2b2d46;

  /* Surfaces — derived to sit with the brand hues, not chosen independently. */
  --paper: #fbf9f5;
  --ink: #1c1d2b;
  --ink-muted: #55576b;
  --rule: #e4e0d8;
}

@theme inline {
  --color-paper: var(--paper);
  --color-ink: var(--ink);
  --color-ink-muted: var(--ink-muted);
  --color-rule: var(--rule);
  --color-teal: var(--swechha-teal);
  --color-coral: var(--swechha-coral);
  --color-ochre: var(--swechha-ochre);
  --color-indigo: var(--swechha-indigo);

  --font-display: var(--font-fraunces);
  --font-body: var(--font-instrument-sans);
}

body {
  background: var(--paper);
  color: var(--ink);
  font-family: var(--font-body), system-ui, sans-serif;
  font-size: 1.125rem;   /* 18px floor, per the brief */
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3 {
  font-family: var(--font-display), Georgia, serif;
  line-height: 1.3;
  text-wrap: balance;
}

/* Fluid type — 375px and 1440px both resolve sensibly without a breakpoint stack. */
h1 { font-size: clamp(2.25rem, 1.4rem + 3.6vw, 3.5rem); }
h2 { font-size: clamp(1.75rem, 1.3rem + 1.9vw, 2.25rem); }
h3 { font-size: clamp(1.25rem, 1.1rem + 0.7vw, 1.5rem); }

a { color: inherit; }

::selection {
  background: var(--swechha-ochre);
  color: var(--ink);
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 2: Replace `app/layout.tsx` entirely**

```tsx
import type { Metadata } from 'next'
import { Fraunces, Instrument_Sans } from 'next/font/google'
import './globals.css'

const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
  axes: ['SOFT', 'WONK', 'opsz'],
})

const instrumentSans = Instrument_Sans({
  variable: '--font-instrument-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://swechha.in'),
  title: {
    default: 'Swechha — Education. Environment. Enterprise.',
    template: '%s — Swechha',
  },
  description:
    'Swechha is an Indian environmental organisation working across climate action, sustainability, education, youth engagement and community-led change.',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${instrumentSans.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
```

- [ ] **Step 3: Verify the build succeeds and fonts resolve**

Run: `npm run build`
Expected: PASS. If `axes` is rejected, the axis list is wrong for this version of Fraunces — remove the `axes` line and rebuild; the variable weight axis is included by default.

- [ ] **Step 4: Commit**

```bash
git add app/globals.css app/layout.tsx
git commit -m "feat(design): add brand design tokens and the typeface pairing"
```

---

## Task 8: Layout shell — header and footer

**Files:**
- Create: `components/site-header.tsx`
- Create: `components/site-footer.tsx`
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: `public/brand/swechha-primary.svg` from Task 6
- Produces: `<SiteHeader />`, `<SiteFooter />`

- [ ] **Step 1: Create `components/site-header.tsx`**

```tsx
import Image from 'next/image'
import Link from 'next/link'

const NAV = [
  { href: '/now', label: 'Now' },
  { href: '/explore', label: 'Explore' },
  { href: '/work', label: 'Work' },
  { href: '/act', label: 'Act' },
  { href: '/about', label: 'About' },
]

export function SiteHeader() {
  return (
    <header className="border-b border-rule">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-4 md:px-8">
        <Link href="/" aria-label="Swechha — home">
          <Image
            src="/brand/swechha-primary.svg"
            alt="Swechha"
            width={145}
            height={96}
            className="h-10 w-auto md:h-12"
            priority
          />
        </Link>
        <nav aria-label="Primary">
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm uppercase tracking-widest md:gap-x-8">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-block py-2 transition-colors hover:text-teal"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}
```

- [ ] **Step 2: Create `components/site-footer.tsx`**

```tsx
import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-indigo text-paper">
      <div className="mx-auto max-w-6xl px-5 py-16 md:px-8">
        <p className="max-w-xl font-display text-2xl">
          Education. Environment. Enterprise.
        </p>
        <nav aria-label="Footer" className="mt-8">
          <ul className="flex flex-wrap gap-x-8 gap-y-2 text-sm uppercase tracking-widest">
            <li><Link href="/stories" className="hover:text-ochre">Stories</Link></li>
            <li><Link href="/work" className="hover:text-ochre">Work</Link></li>
            <li><Link href="/act" className="hover:text-ochre">Act</Link></li>
            <li><Link href="/about" className="hover:text-ochre">About</Link></li>
          </ul>
        </nav>
        <p className="mt-12 text-sm opacity-70">
          © {new Date().getFullYear()} Swechha
        </p>
      </div>
    </footer>
  )
}
```

- [ ] **Step 3: Wire them into `app/layout.tsx`**

Add the imports below `import './globals.css'`:

```tsx
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
```

Replace the `<body>` element with:

```tsx
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
```

- [ ] **Step 4: Verify in the browser at both widths**

Run `npm run dev`, open `http://localhost:3000`.
Check: logo renders crisply, nav wraps rather than overflowing at 375px, footer indigo matches `#2B2D46`, and the white-on-indigo footer text is legible. Record the observation — do not assert it without looking.

- [ ] **Step 5: Commit**

```bash
git add components/site-header.tsx components/site-footer.tsx app/layout.tsx
git commit -m "feat(ui): add the site header and footer shell"
```

---

## Task 9: Content card and prose components

**Files:**
- Create: `components/content-card.tsx`
- Create: `components/prose.tsx`
- Create: `components/related-content.tsx`

**Interfaces:**
- Consumes: `Entry` from `@/lib/content`; `renderMarkdown` from `@/lib/markdown`
- Produces:
  - `<ContentCard entry={...} href={...} />`
  - `<Prose html={...} />`
  - `<RelatedContent entries={...} />`

- [ ] **Step 1: Create `components/content-card.tsx`**

```tsx
import Image from 'next/image'
import Link from 'next/link'

interface ContentCardProps {
  href: string
  title: string
  summary: string
  image: { src: string; alt: string }
  meta?: string
}

export function ContentCard({ href, title, summary, image, meta }: ContentCardProps) {
  return (
    <article>
      <Link href={href} className="group block">
        <div className="relative aspect-[4/3] overflow-hidden bg-rule">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
        {meta && (
          <p className="mt-4 text-xs uppercase tracking-widest text-ink-muted">{meta}</p>
        )}
        <h3 className="mt-2 group-hover:text-teal">{title}</h3>
        <p className="mt-2 text-ink-muted">{summary}</p>
      </Link>
    </article>
  )
}
```

- [ ] **Step 2: Create `components/prose.tsx`**

```tsx
/**
 * Wrapper for rendered Markdown. Content is authored in this repository and
 * is trusted — see lib/markdown.ts.
 */
export function Prose({ html }: { html: string }) {
  return (
    <div
      className="prose-swechha max-w-[68ch] [&>h2]:mt-12 [&>h3]:mt-8 [&>p]:mt-6 [&>ul]:mt-6 [&>ul]:list-disc [&>ul]:pl-6 [&_a]:text-teal [&_a]:underline [&_a]:underline-offset-4"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
```

- [ ] **Step 3: Create `components/related-content.tsx`**

```tsx
import Link from 'next/link'
import type { Entry } from '@/lib/content'

const PATHS: Record<string, string> = {
  story: '/stories',
  project: '/work',
  knowledge: '/explore',
  film: '/films',
  campaign: '/campaigns',
  briefing: '/now',
}

export function RelatedContent({ entries }: { entries: Entry[] }) {
  if (entries.length === 0) return null

  return (
    <aside className="mt-16 border-t border-rule pt-8">
      <h2 className="text-xs uppercase tracking-widest text-ink-muted">Related</h2>
      <ul className="mt-4 space-y-3">
        {entries.map((entry) => {
          const title = (entry.data as { title?: string }).title ?? entry.slug
          return (
            <li key={`${entry.type}/${entry.slug}`}>
              <Link
                href={`${PATHS[entry.type]}/${entry.slug}`}
                className="font-display text-xl hover:text-teal"
              >
                {title}
              </Link>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
```

- [ ] **Step 4: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add components/content-card.tsx components/prose.tsx components/related-content.tsx
git commit -m "feat(ui): add card, prose and related-content components"
```

---

## Task 10: Sample STORY content

**Files:**
- Create: `content/story/delhi-air-victory.md`
- Create: `content/story/rooftop-sanctuary.md`
- Create: `content/story/monsoon-wooding-2021.md`
- Create: `public/images/stories/` (three placeholder images)

**Interfaces:**
- Consumes: `storySchema` from Task 2
- Produces: three entries that exercise the pipeline, including one relation between stories

**Note:** Real Swechha photography is available at `~/Desktop/SWECHHA MASTER/` and in the WordPress media library. Until specific images are chosen, use neutral placeholders **sized to the real layout slots (1600×1200)** so swapping in real photography needs no layout change.

- [ ] **Step 1: Create placeholder images**

`next/image` refuses SVG sources unless `dangerouslyAllowSVG` is enabled, which we will not enable. Placeholders are therefore PNG, written by a dependency-free generator (Node's built-in `zlib` provides both deflate and CRC32).

Create `scripts/make-placeholders.mjs`:

```js
#!/usr/bin/env node
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { deflateSync, crc32 } from 'node:zlib'

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const typed = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(typed) >>> 0)
  return Buffer.concat([len, typed, crc])
}

function solidPng(width, height, [r, g, b]) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8   // bit depth
  ihdr[9] = 2   // colour type: truecolour RGB
  const row = Buffer.alloc(1 + width * 3)
  for (let x = 0; x < width; x++) {
    row[1 + x * 3] = r
    row[2 + x * 3] = g
    row[3 + x * 3] = b
  }
  const raw = Buffer.concat(Array.from({ length: height }, () => row))
  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

const OUT = join(process.cwd(), 'public', 'images', 'stories')
mkdirSync(OUT, { recursive: true })

// --rule #E4E0D8, sized to the real layout slot so real photography drops in
// without any layout change.
for (const name of ['delhi-air', 'rooftop-sanctuary', 'monsoon-wooding']) {
  writeFileSync(join(OUT, `${name}.png`), solidPng(1600, 1200, [0xe4, 0xe0, 0xd8]))
  console.log(`wrote ${name}.png`)
}
```

Run it:

```bash
cd /Users/administrator/swechha-website
node scripts/make-placeholders.mjs
```

Expected: three `wrote …` lines. Confirm each file opens as a 1600×1200 image:

```bash
sips -g pixelWidth -g pixelHeight public/images/stories/delhi-air.png
```

- [ ] **Step 2: Create `content/story/delhi-air-victory.md`**

```markdown
---
title: How Delhi's communities won a partial ban on construction emissions
summary: After eighteen months of documentation and advocacy, a partial ban on construction-related emissions was secured. What changed, who made it happen, and what comes next.
author: Swechha
date: '2024-08-14'
heroImage:
  src: /images/stories/delhi-air.png
  alt: PLACEHOLDER — community members gathered at an anti-pollution event
tags:
  - air
  - delhi
  - advocacy
featured: true
related:
  story:
    - rooftop-sanctuary
---

## The problem

Delhi's winter air routinely reaches levels the World Health Organization
classifies as hazardous. Construction dust is one contributor among many, and
one of the few that can be regulated locally.

## What Swechha did

Field documentation across thirteen sites, sustained evidence-gathering, and
eighteen months of advocacy with the municipal corporation.

## What changed

A partial ban on construction-related emissions during high-pollution days,
with monitoring obligations placed on site operators.
```

- [ ] **Step 3: Create `content/story/rooftop-sanctuary.md`**

```markdown
---
title: How one rooftop became a sanctuary
summary: A terrace in East Delhi now hosts eleven bird species and a resident population of butterflies. It began with six containers and a species list.
author: Swechha
date: '2024-05-02'
heroImage:
  src: /images/stories/rooftop-sanctuary.png
  alt: PLACEHOLDER — a terrace garden with native flowering plants
tags:
  - biodiversity
  - urban
---

## Six containers

The project started with native species chosen for a specific latitude and a
specific amount of afternoon sun.

## What arrived

Eleven bird species over two seasons, and a butterfly population that now
overwinters on the terrace.
```

- [ ] **Step 4: Create `content/story/monsoon-wooding-2021.md`**

```markdown
---
title: Monsoon Wooding, 2021
summary: A season of planting across sites in and around Delhi, and what the following three years taught us about survival rates.
author: Swechha
date: '2023-11-20'
heroImage:
  src: /images/stories/monsoon-wooding.png
  alt: PLACEHOLDER — volunteers planting saplings during monsoon
tags:
  - trees
  - restoration
---

## The season

Planting during the monsoon gives saplings their best chance. Counting how
many survive three years later is the harder and more useful measurement.
```

- [ ] **Step 5: Verify the content loads and relations resolve**

Run: `npm test`
Expected: all tests PASS, including `getAllStories()` returning three entries.

- [ ] **Step 6: Prove the guardrail actually works**

Temporarily change `related.story` in `delhi-air-victory.md` to `- does-not-exist`, then run `npm test`.
Expected: FAIL with a message containing `story/delhi-air-victory.md refers to story/does-not-exist`.
**Revert the change** and re-run to confirm PASS.

- [ ] **Step 7: Commit**

```bash
git add content/story public/images/stories
git commit -m "content: add three sample stories exercising the pipeline"
```

---

## Task 11: STORY archive and detail pages

**Files:**
- Create: `app/stories/page.tsx`
- Create: `app/stories/[slug]/page.tsx`

**Interfaces:**
- Consumes: `getAllStories`, `getStoryBySlug`, `getRelated` from `@/lib/content`; `renderMarkdown` from `@/lib/markdown`; components from Task 9
- Produces: statically generated `/stories` and `/stories/[slug]`

- [ ] **Step 1: Create `app/stories/page.tsx`**

```tsx
import type { Metadata } from 'next'
import { ContentCard } from '@/components/content-card'
import { getAllStories } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Stories',
  description: 'Impact narratives and testimonies from Swechha’s work.',
}

export default function StoriesPage() {
  const stories = getAllStories()

  return (
    <main className="mx-auto max-w-6xl px-5 py-16 md:px-8">
      <h1>Stories</h1>
      <p className="mt-4 max-w-[60ch] text-ink-muted">
        Narratives of change from the field — what happened, who made it
        happen, and what it changed.
      </p>

      <div className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {stories.map((story) => (
          <ContentCard
            key={story.slug}
            href={`/stories/${story.slug}`}
            title={story.data.title}
            summary={story.data.summary}
            image={story.data.heroImage}
            meta={new Date(story.data.date).toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'long',
            })}
          />
        ))}
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Create `app/stories/[slug]/page.tsx`**

```tsx
import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Prose } from '@/components/prose'
import { RelatedContent } from '@/components/related-content'
import { getAllStories, getStoryBySlug, getRelated } from '@/lib/content'
import { renderMarkdown } from '@/lib/markdown'

export function generateStaticParams() {
  return getAllStories().map((story) => ({ slug: story.slug }))
}

export async function generateMetadata(
  props: PageProps<'/stories/[slug]'>,
): Promise<Metadata> {
  const { slug } = await props.params
  const story = getStoryBySlug(slug)
  if (!story) return {}

  return {
    title: story.data.title,
    description: story.data.summary,
    openGraph: {
      title: story.data.title,
      description: story.data.summary,
      type: 'article',
      publishedTime: story.data.date,
      images: [story.data.heroImage.src],
    },
  }
}

export default async function StoryPage(props: PageProps<'/stories/[slug]'>) {
  const { slug } = await props.params
  const story = getStoryBySlug(slug)
  if (!story) notFound()

  const { title, summary, author, date, heroImage } = story.data

  return (
    <main className="mx-auto max-w-6xl px-5 py-16 md:px-8">
      <article>
        <header className="max-w-[68ch]">
          <p className="text-xs uppercase tracking-widest text-ink-muted">Story</p>
          <h1 className="mt-3">{title}</h1>
          <p className="mt-6 font-display text-xl text-ink-muted">{summary}</p>
          <p className="mt-6 text-sm text-ink-muted">
            By {author} ·{' '}
            <time dateTime={date}>
              {new Date(date).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          </p>
        </header>

        <div className="relative mt-10 aspect-[16/9] overflow-hidden bg-rule">
          <Image
            src={heroImage.src}
            alt={heroImage.alt}
            fill
            sizes="(max-width: 1152px) 100vw, 1152px"
            className="object-cover"
            priority
          />
        </div>

        <div className="mt-12">
          <Prose html={renderMarkdown(story.body)} />
        </div>

        <RelatedContent entries={getRelated(story)} />
      </article>
    </main>
  )
}
```

- [ ] **Step 3: Verify the pages build statically**

Run: `npm run build`
Expected: the build output lists `/stories` and three `/stories/[slug]` routes as static (`○` or `●`), not dynamic (`ƒ`). If they are dynamic, a page is reading `params` outside `generateStaticParams` — fix before continuing.

- [ ] **Step 4: Verify in the browser at 375px and 1440px**

Run `npm run dev`. Visit `/stories` and `/stories/delhi-air-victory`.
Check: the card grid is single-column at 375px and three-column at 1440px; body text is at least 18px; the related-content block shows "How one rooftop became a sanctuary"; hero images are not distorted. Record what you observe.

- [ ] **Step 5: Commit**

```bash
git add app/stories
git commit -m "feat(stories): add the STORY archive and detail pages"
```

---

## Task 12: SEO — sitemap, robots, and homepage

**Files:**
- Create: `app/sitemap.ts`
- Create: `app/robots.ts`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `getAllStories` from `@/lib/content`
- Produces: `/sitemap.xml`, `/robots.txt`

- [ ] **Step 1: Create `app/sitemap.ts`**

```ts
import type { MetadataRoute } from 'next'
import { getAllStories } from '@/lib/content'

const BASE = 'https://swechha.in'

export default function sitemap(): MetadataRoute.Sitemap {
  const stories = getAllStories().map((story) => ({
    url: `${BASE}/stories/${story.slug}`,
    lastModified: story.data.date,
  }))

  return [
    { url: BASE },
    { url: `${BASE}/stories` },
    ...stories,
  ]
}
```

- [ ] **Step 2: Create `app/robots.ts`**

```ts
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: 'https://swechha.in/sitemap.xml',
  }
}
```

- [ ] **Step 3: Replace `app/page.tsx` with a homepage that lists stories**

```tsx
import Link from 'next/link'
import { ContentCard } from '@/components/content-card'
import { getAllStories } from '@/lib/content'

export default function Home() {
  const stories = getAllStories().slice(0, 3)

  return (
    <main className="mx-auto max-w-6xl px-5 py-20 md:px-8">
      <h1 className="max-w-[18ch]">
        Environmental action, and the people making it happen.
      </h1>
      <p className="mt-6 max-w-[55ch] font-display text-xl text-ink-muted">
        Swechha works across climate action, sustainability, education, youth
        engagement and community-led change in India.
      </p>

      <section className="mt-20">
        <h2 className="text-xs uppercase tracking-widest text-ink-muted">
          Latest stories
        </h2>
        <div className="mt-8 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {stories.map((story) => (
            <ContentCard
              key={story.slug}
              href={`/stories/${story.slug}`}
              title={story.data.title}
              summary={story.data.summary}
              image={story.data.heroImage}
            />
          ))}
        </div>
        <Link
          href="/stories"
          className="mt-10 inline-block border-b-2 border-teal pb-1 text-sm uppercase tracking-widest hover:text-teal"
        >
          All stories
        </Link>
      </section>
    </main>
  )
}
```

- [ ] **Step 4: Verify the sitemap contains every story**

Run: `npm run build && npm run start`, then in another terminal:

```bash
curl -s localhost:3000/sitemap.xml
```

Expected: five `<url>` entries — root, `/stories`, and three story URLs.

- [ ] **Step 5: Create the redirect mechanism**

The old site has 165 URLs that must not break (success criterion #9). Build the mechanism now, empty — once it exists, migrating 165 URLs is data entry rather than engineering.

Create `redirects.ts` at the repo root:

```ts
import type { NextConfig } from 'next'

type Redirects = NonNullable<NextConfig['redirects']>
type Redirect = Awaited<ReturnType<Redirects>>[number]

/**
 * 301 redirects from the old WordPress site. Populated during content
 * migration — one entry per old URL. Permanent (301) so SEO equity transfers.
 */
export const legacyRedirects: Redirect[] = []
```

Modify `next.config.ts`:

```ts
import type { NextConfig } from 'next'
import { legacyRedirects } from './redirects'

const nextConfig: NextConfig = {
  async redirects() {
    return legacyRedirects
  },
}

export default nextConfig
```

- [ ] **Step 6: Verify the build still passes with the redirect mechanism in place**

Run: `npm run build`
Expected: PASS. An empty redirect list is valid.

- [ ] **Step 7: Commit**

```bash
git add app/sitemap.ts app/robots.ts app/page.tsx redirects.ts next.config.ts
git commit -m "feat(seo): add sitemap, robots, redirect mechanism and homepage"
```

---

## Task 13: Measure and report

**Files:**
- Create: `docs/superpowers/reports/2026-08-16-foundation-baseline.md`

**Interfaces:**
- Consumes: the running production build
- Produces: a recorded baseline of measured numbers

**Rule:** every figure in this task is a number you read off a tool. No claim of "fast" or "accessible" without it.

- [ ] **Step 1: Measure contrast ratios**

For each pair below, compute the WCAG contrast ratio (any calculator, or the formula in WCAG 2.1):

| Foreground | Background | Required |
|---|---|---|
| `#1C1D2B` ink | `#FBF9F5` paper | ≥ 4.5:1 body |
| `#55576B` ink-muted | `#FBF9F5` paper | ≥ 4.5:1 body |
| `#FBF9F5` paper | `#2B2D46` indigo | ≥ 4.5:1 body |
| `#4BA1A5` teal | `#FBF9F5` paper | ≥ 4.5:1 for link text |

Record every ratio. **Any pair below 4.5:1 must be corrected in `globals.css` before this task is complete** — darken the token rather than removing the rule.

- [ ] **Step 2: Run Lighthouse against the production build**

```bash
npm run build && npm run start
```

In Chrome DevTools, run Lighthouse (Mobile) against `http://localhost:3000/stories/delhi-air-victory`. Record Performance, Accessibility, Best Practices and SEO scores.

- [ ] **Step 3: Confirm no third-party requests**

In DevTools → Network, reload the page and confirm **zero** requests to `fonts.googleapis.com` or `fonts.gstatic.com` — `next/font/google` self-hosts at build time. Record the result.

- [ ] **Step 4: Write the baseline report**

Create `docs/superpowers/reports/2026-08-16-foundation-baseline.md` recording: the four contrast ratios, the four Lighthouse scores, the third-party request count, and the total page weight from the Network tab.

- [ ] **Step 5: Commit**

```bash
git add docs/superpowers/reports
git commit -m "docs: record the measured foundation baseline"
```

---

## Out of scope for this plan

Deliberately excluded; each becomes its own plan:

- The remaining five content types (BRIEFING is next — it is a core pillar)
- Search (static index + `/search`)
- The `/now`, `/work`, `/explore`, `/campaigns`, `/films`, `/act`, `/about`, `/impact` routes — the header links to them and they will 404 until built
- WordPress content migration and the 165-URL redirect map
- Newsletter form integration
- Real photography selection
