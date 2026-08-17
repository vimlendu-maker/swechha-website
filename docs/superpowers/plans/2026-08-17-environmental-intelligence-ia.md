# Environmental Intelligence IA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the revised Environmental Intelligence architecture (CAMPAIGN/SITUATION content type replacing the dead BRIEFING model), Design System v1's signal-colour system, Swechha NOW, and honest minimal pages for every item in the 8-item revised nav — so nothing 404s and nothing on the site claims to be real that isn't.

**Architecture:** `CAMPAIGN` (existing content type, unchanged key) gains a lifecycle (`active`/`monitoring`/`achieved`/`archived`) and, when active, a severity (`critical`/`warning`/`watch`/`water`) that together resolve to one of the five signal colours through a single shared helper (`lib/status.ts`), used identically by the badge, the timeline, and (later) NOW. Live-data fields carry a mandatory `mock` boolean so a demo figure can never silently look real, and `evidence`/`timeline` are schema-required (min 1 entry each) — a Situation with no sources or no history cannot pass the build, extending this codebase's existing "bad content cannot reach production" guarantee to the new type.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind v4 (CSS-first), Zod, Vitest — all already installed, no new dependencies.

**Spec:** [`docs/superpowers/specs/2026-08-17-swechha-design-system-v1.md`](../specs/2026-08-17-swechha-design-system-v1.md) (design system) and `~/Desktop/Swechha Website/Swechha-Website-IA-Environmental-Intelligence-Revised.md` (authoritative IA — not in this repo, read from Desktop).

## Global Constraints

- **No `BRIEFING` content type exists.** It is being removed by Task 1, not merely left unused.
- **Dates in frontmatter must be quoted strings** (`date: '2026-08-12'`). Unquoted, YAML yields a `Date` object and fails the schema.
- **Any date rendered with `toLocaleDateString` must pass `timeZone: 'UTC'`.** Omitting it shifts the displayed date backward for any viewer/build west of UTC — this exact bug was found and fixed once already in this codebase (commit `dd2b91e`); do not reintroduce it.
- **`text-teal` and `text-coral` must never appear** — both fail WCAG AA as text at every size. Use `text-teal-ink` / `text-coral-ink`, or the new signal tokens from Task 2.
- **Relation keys are singular**, matching content types exactly: `project`, `story`, `knowledge`, `film`, `campaign`.
- **Tailwind v4 is CSS-first.** All tokens live in `app/globals.css` under `@theme inline`. Never create `tailwind.config.ts`.
- **Element styles (bare `h1`, `body`, etc.) must live inside `@layer base`.** Unlayered CSS beats every Tailwind utility regardless of specificity — this exact bug was found and fixed once already (commit `ab7080e`). Token additions in this plan don't add new element selectors, but if any task does, it must go in `@layer base`.
- **No inline `style={{ fontSize: ... }}` on headings** — an inline style beats every cascade layer including utilities. Use a `text-h*` token/utility instead (see `ContentCard` for the established pattern).
- **`params` is a `Promise` in Next.js 16** — always `const { slug } = await props.params`. `PageProps<'/route'>` is a generated global type — never imported, never hand-written.
- **Every live-data figure must render a mock/demo indicator when `mock: true`.** No figure may look real when it isn't.
- **No invented facts.** No fabricated impact statistics, no fabricated contact email/phone/donation link. Where real content doesn't exist yet, the page states that plainly rather than inventing a placeholder that reads as fact.
- **All routes must remain static** (`○`/`●`, never `ƒ`).

---

## File Structure

| File | Responsibility |
|---|---|
| `lib/content/types.ts` | `CONTENT_TYPES` — drop `briefing` |
| `lib/content/schemas.ts` | Drop `briefing` from `relatedSchema`; add `campaignSchema` |
| `lib/content/index.ts` | Wire `campaign` into `TYPES`; add `getAllCampaigns`, `getCampaignBySlug`, `getActiveSituations` |
| `lib/status.ts` | `resolveStatus(status, severity)` — the one place lifecycle+severity becomes a colour+label |
| `app/globals.css` | Add signal-colour tokens (primitive + semantic + component) |
| `components/status-badge.tsx` | Renders `resolveStatus()`'s output as the near-square badge |
| `components/data-attribution.tsx` | Source + UTC-safe timestamp line; renders a DEMO DATA tag when `mock` |
| `components/lifecycle-timeline.tsx` | Ordered list of dated status entries, dot coloured via `resolveStatus()` |
| `components/action-list.tsx` | CTA list; one action may render filled-urgent, gated on the situation's real severity |
| `components/evidence-list.tsx` | Plain citation list |
| `components/now-module.tsx` | Homepage-embeddable NOW summary: hero situation + up to 2 secondary |
| `content/campaign/delhi-air-quality-2026.md` | The one real demo Situation |
| `app/campaigns/page.tsx`, `app/campaigns/[slug]/page.tsx` | Situation archive + detail |
| `app/now/page.tsx` | Full NOW page: all active situations + latest stories |
| `app/explore/page.tsx`, `app/work/page.tsx`, `app/about/page.tsx`, `app/impact/page.tsx`, `app/act/page.tsx` | Honest minimal pages, no invented content |
| `lib/search.ts` | `getSearchIndex()` — pure, testable |
| `app/search/page.tsx`, `components/search-client.tsx` | Real client-side search over existing content |
| `components/site-header.tsx` | 8-item nav |
| `app/sitemap.ts` | Add campaign routes + new static pages |

---

## Task 1: Remove the dead BRIEFING type

**Files:**
- Modify: `lib/content/types.ts`
- Modify: `lib/content/schemas.ts`
- Delete: `content/briefing/.gitkeep`, then the empty `content/briefing/` directory
- Test: `lib/content/schemas.test.ts` (existing file)

**Interfaces:**
- Consumes: nothing
- Produces: `CONTENT_TYPES` without `'briefing'`; `relatedSchema` without a `briefing` key

- [ ] **Step 1: Write the failing test**

Add to `lib/content/schemas.test.ts`:

```ts
it('rejects a briefing relation key — the type no longer exists', () => {
  expect(() =>
    storySchema.parse({ ...valid, related: { briefing: ['x'] } }),
  ).toThrow()
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- lib/content/schemas.test.ts`
Expected: FAIL — `briefing` is currently accepted (it's a valid key today).

- [ ] **Step 3: Remove `briefing` everywhere**

In `lib/content/types.ts`, remove `'briefing'` from the `CONTENT_TYPES` array.

In `lib/content/schemas.ts`, remove the `briefing: slugList()` line from both the `.strictObject({...})` and the `.default({...})` in `relatedSchema`.

- [ ] **Step 4: Delete the dead directory**

```bash
rm -rf content/briefing
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- lib/content/schemas.test.ts`
Expected: PASS. Run the full suite too: `npm test` — all prior tests must still pass (nothing referenced `briefing` outside these two files).

- [ ] **Step 6: Commit**

```bash
git add lib/content/types.ts lib/content/schemas.ts content/briefing
git commit -m "chore(content): remove the dead BRIEFING type"
```

---

## Task 2: Signal-colour design tokens

**Files:**
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: nothing
- Produces: CSS variables `--signal-critical`, `--signal-critical-bright`, `--signal-warning`, `--signal-warning-bright`, `--signal-watch`, `--signal-watch-bright`, `--signal-water`, `--signal-water-bright`, `--signal-nature`, `--signal-nature-bright`; matching `--color-status-*` theme tokens; `--badge-radius`

- [ ] **Step 1: Add the primitive + semantic tokens**

In `app/globals.css`, inside the existing bare `:root { ... }` block (alongside `--swechha-teal` etc.), add:

```css
  /* Signal — verified WCAG 2.1 relative-luminance ratios, see
     docs/superpowers/specs/2026-08-17-swechha-design-system-v1.md §2.1.
     Base variants are for light-canvas (paper) text/fills; -bright variants
     are for badges/numerals on the indigo/dark canvas. Never used for brand
     chrome — these mean a lifecycle/severity state, nothing else. */
  --signal-critical: #c81e3a;
  --signal-critical-bright: #ff5c6c;
  --signal-warning: #c15a1e;
  --signal-warning-bright: #f0924a;
  --signal-watch: #a8781a;
  --signal-watch-bright: #e8b93f;
  --signal-water: #2860c4;
  --signal-water-bright: #5b9bef;
  --signal-nature: #2e7d4f;
  --signal-nature-bright: #5fbe85;
```

- [ ] **Step 2: Add the theme (component-facing) tokens**

In the existing `@theme inline { ... }` block, alongside `--color-teal` etc., add:

```css
  --color-status-critical: var(--signal-critical);
  --color-status-critical-bright: var(--signal-critical-bright);
  --color-status-warning: var(--signal-warning);
  --color-status-warning-bright: var(--signal-warning-bright);
  --color-status-watch: var(--signal-watch);
  --color-status-watch-bright: var(--signal-watch-bright);
  --color-status-water: var(--signal-water);
  --color-status-water-bright: var(--signal-water-bright);
  --color-status-nature: var(--signal-nature);
  --color-status-nature-bright: var(--signal-nature-bright);
```

This makes `bg-status-critical`, `text-status-critical-bright`, etc. real Tailwind utilities (in the `utilities` layer, so they correctly override `@layer base` — see the Global Constraints note on cascade layers).

- [ ] **Step 3: Verify no cascade-layer regression**

Run: `npm run build`
Expected: PASS. This step adds no new element selectors, so there is nothing to move into `@layer base` — this check simply confirms the addition didn't break anything.

- [ ] **Step 4: Commit**

```bash
git add app/globals.css
git commit -m "feat(design): add the signal-colour token system"
```

---

## Task 3: `lib/status.ts` and the CAMPAIGN schema

**Files:**
- Create: `lib/status.ts`
- Create: `lib/status.test.ts`
- Modify: `lib/content/schemas.ts`
- Test: `lib/content/schemas.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces:
  - `LIFECYCLE_STATUSES: readonly ['active','monitoring','achieved','archived']`, `type LifecycleStatus`
  - `SEVERITIES: readonly ['critical','warning','watch','water']`, `type Severity`
  - `interface StatusVisual { label: string; color: string; colorBright: string }`
  - `resolveStatus(status: LifecycleStatus, severity?: Severity | null): StatusVisual`
  - `campaignSchema` (Zod), `type Campaign = z.infer<typeof campaignSchema>`

- [ ] **Step 1: Write the failing test for `resolveStatus`**

Create `lib/status.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { resolveStatus } from './status'

describe('resolveStatus', () => {
  it('resolves active+critical to the critical signal', () => {
    const v = resolveStatus('active', 'critical')
    expect(v.label).toBe('Critical')
    expect(v.color).toBe('var(--color-status-critical)')
    expect(v.colorBright).toBe('var(--color-status-critical-bright)')
  })

  it('resolves active+water to the water signal', () => {
    expect(resolveStatus('active', 'water').label).toBe('Water')
  })

  it('resolves monitoring to the watch family regardless of severity', () => {
    const v = resolveStatus('monitoring', 'critical')
    expect(v.label).toBe('Monitoring')
    expect(v.color).toBe('var(--color-status-watch)')
  })

  it('resolves achieved to the nature signal', () => {
    expect(resolveStatus('achieved').label).toBe('Achieved')
    expect(resolveStatus('achieved').color).toBe('var(--color-status-nature)')
  })

  it('resolves archived to monochrome, not a signal colour', () => {
    const v = resolveStatus('archived')
    expect(v.label).toBe('Archived')
    expect(v.color).toBe('var(--color-ink-muted)')
    expect(v.colorBright).toBe('var(--color-ink-muted)')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- lib/status.test.ts`
Expected: FAIL — cannot resolve `./status`.

- [ ] **Step 3: Write `lib/status.ts`**

```ts
export const LIFECYCLE_STATUSES = ['active', 'monitoring', 'achieved', 'archived'] as const
export type LifecycleStatus = (typeof LIFECYCLE_STATUSES)[number]

export const SEVERITIES = ['critical', 'warning', 'watch', 'water'] as const
export type Severity = (typeof SEVERITIES)[number]

export interface StatusVisual {
  label: string
  color: string
  colorBright: string
}

const SEVERITY_VISUAL: Record<Severity, StatusVisual> = {
  critical: {
    label: 'Critical',
    color: 'var(--color-status-critical)',
    colorBright: 'var(--color-status-critical-bright)',
  },
  warning: {
    label: 'Warning',
    color: 'var(--color-status-warning)',
    colorBright: 'var(--color-status-warning-bright)',
  },
  watch: {
    label: 'Watch',
    color: 'var(--color-status-watch)',
    colorBright: 'var(--color-status-watch-bright)',
  },
  water: {
    label: 'Water',
    color: 'var(--color-status-water)',
    colorBright: 'var(--color-status-water-bright)',
  },
}

/**
 * The one place a Situation's lifecycle + severity becomes a colour and a
 * label. Used identically by StatusBadge and LifecycleTimeline so the two
 * can never disagree about what a given state looks like.
 *
 * - `active` shows the situation's real severity signal.
 * - `monitoring` is always the watch family, regardless of severity — a
 *   de-escalated state is visually distinct from an escalating one.
 * - `achieved` is the one place green (`nature`) is used — a verified
 *   positive outcome, never decoration.
 * - `archived` gets no signal colour at all: history is not a live signal.
 */
export function resolveStatus(
  status: LifecycleStatus,
  severity?: Severity | null,
): StatusVisual {
  if (status === 'active' && severity) return SEVERITY_VISUAL[severity]

  if (status === 'monitoring') {
    return { label: 'Monitoring', color: 'var(--color-status-watch)', colorBright: 'var(--color-status-watch-bright)' }
  }
  if (status === 'achieved') {
    return { label: 'Achieved', color: 'var(--color-status-nature)', colorBright: 'var(--color-status-nature-bright)' }
  }
  return { label: 'Archived', color: 'var(--color-ink-muted)', colorBright: 'var(--color-ink-muted)' }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- lib/status.test.ts`
Expected: PASS, 5 tests.

- [ ] **Step 5: Write the failing schema test**

Add to `lib/content/schemas.test.ts`:

```ts
import { campaignSchema } from './schemas'

const validCampaign = {
  title: 'Delhi Air Quality Crisis',
  summary: 'AQI has crossed the Hazardous threshold across Delhi-NCR.',
  location: 'Delhi',
  status: 'active',
  severity: 'critical',
  heroImage: { src: '/images/campaigns/delhi-air.png', alt: 'PLACEHOLDER — a hazy Delhi skyline' },
  whatWeKnow: 'AQI has remained above 300 for six consecutive days.',
  publicHealthImpact: 'Vulnerable groups face elevated respiratory risk.',
  whyItMatters: 'This is a recurring, largely preventable seasonal crisis.',
  whatSwechhaIsDoing: 'Field documentation and municipal advocacy.',
  actions: [{ label: 'Join the campaign', href: '/act', primary: true }],
  evidence: [{ source: 'CPCB National Air Quality Index', date: '2026-08-17' }],
  timeline: [{ date: '2026-08-12', status: 'active', severity: 'watch', note: 'Situation opened.' }],
}

describe('campaignSchema', () => {
  it('accepts a valid active+critical situation', () => {
    const parsed = campaignSchema.parse(validCampaign)
    expect(parsed.status).toBe('active')
    expect(parsed.severity).toBe('critical')
  })

  it('rejects active status with no severity', () => {
    const { severity, ...noSeverity } = validCampaign
    expect(() => campaignSchema.parse(noSeverity)).toThrow()
  })

  it('rejects a situation with zero evidence entries', () => {
    expect(() => campaignSchema.parse({ ...validCampaign, evidence: [] })).toThrow()
  })

  it('rejects a situation with zero timeline entries', () => {
    expect(() => campaignSchema.parse({ ...validCampaign, timeline: [] })).toThrow()
  })

  it('defaults liveData to absent, not a fabricated figure', () => {
    const parsed = campaignSchema.parse(validCampaign)
    expect(parsed.liveData).toBeUndefined()
  })

  it('requires mock to be set explicitly when liveData is present', () => {
    expect(() =>
      campaignSchema.parse({
        ...validCampaign,
        liveData: { label: 'AQI', value: '347', sourceLabel: 'CPCB', updatedAt: '2026-08-17T10:00:00Z' },
      }),
    ).toThrow()
  })

  it('accepts liveData with mock explicitly true', () => {
    const parsed = campaignSchema.parse({
      ...validCampaign,
      liveData: {
        label: 'AQI', value: '347', sourceLabel: 'CPCB DELHI STATION NETWORK',
        updatedAt: '2026-08-17T10:00:00Z', mock: true,
      },
    })
    expect(parsed.liveData?.mock).toBe(true)
  })
})
```

- [ ] **Step 6: Run test to verify it fails**

Run: `npm test -- lib/content/schemas.test.ts`
Expected: FAIL — `campaignSchema` doesn't exist yet.

- [ ] **Step 7: Write `campaignSchema`**

Add to `lib/content/schemas.ts` (below `storySchema`):

```ts
const LIFECYCLE_STATUSES_TUPLE = ['active', 'monitoring', 'achieved', 'archived'] as const
const SEVERITIES_TUPLE = ['critical', 'warning', 'watch', 'water'] as const

const liveDataSchema = z.strictObject({
  label: z.string().min(1),
  value: z.string().min(1),
  unit: z.string().optional(),
  sourceLabel: z.string().min(1, 'liveData.sourceLabel is required — every figure must name its source'),
  updatedAt: z.string().min(1, 'liveData.updatedAt is required'),
  // No `.default()` / `.optional()` — omitting this field must throw. Do not
  // add a default; the requirement is that "mock" is stated, not assumed.
  mock: z.boolean(),
  trendPoints: z.array(z.number()).optional(),
})

const actionSchema = z.strictObject({
  label: z.string().min(1),
  href: z.string().min(1),
  primary: z.boolean().default(false),
})

const evidenceSchema = z.strictObject({
  source: z.string().min(1),
  note: z.string().optional(),
  date: z.string().regex(ISO_DATE).optional(),
})

const timelineEntrySchema = z.strictObject({
  date: z.string().regex(ISO_DATE, 'timeline date must be YYYY-MM-DD'),
  status: z.enum(LIFECYCLE_STATUSES_TUPLE),
  severity: z.enum(SEVERITIES_TUPLE).optional(),
  note: z.string().min(1),
})

export const campaignSchema = z
  .strictObject({
    title: z.string().min(1, 'title is required'),
    summary: z.string().min(1, 'summary is required'),
    location: z.string().min(1, 'location is required'),
    status: z.enum(LIFECYCLE_STATUSES_TUPLE),
    severity: z.enum(SEVERITIES_TUPLE).optional(),
    heroImage: heroImageSchema,
    whatWeKnow: z.string().min(1),
    publicHealthImpact: z.string().min(1),
    whyItMatters: z.string().min(1),
    whatSwechhaIsDoing: z.string().min(1),
    liveData: liveDataSchema.optional(),
    actions: z.array(actionSchema).min(1, 'at least one action is required — "what you can do" cannot be empty'),
    evidence: z.array(evidenceSchema).min(1, 'at least one evidence entry is required — a situation cannot publish with zero sources'),
    timeline: z.array(timelineEntrySchema).min(1, 'at least one timeline entry is required — every situation needs an opening entry'),
    featured: z.boolean().default(false),
    related: relatedSchema,
  })
  .refine((data) => data.status !== 'active' || !!data.severity, {
    message: 'severity is required when status is "active"',
    path: ['severity'],
  })

export type Campaign = z.infer<typeof campaignSchema>
```

- [ ] **Step 8: Run test to verify it passes**

Run: `npm test -- lib/content/schemas.test.ts`
Expected: PASS, all cases including the 6 new ones.

- [ ] **Step 9: Commit**

```bash
git add lib/status.ts lib/status.test.ts lib/content/schemas.ts lib/content/schemas.test.ts
git commit -m "feat(content): add lib/status.ts and the CAMPAIGN/SITUATION schema"
```

---

## Task 4: Wire `campaign` into the content loader

**Files:**
- Modify: `lib/content/index.ts`
- Test: `lib/content/index.test.ts`

**Interfaces:**
- Consumes: `campaignSchema`, `Campaign` from `./schemas`
- Produces:
  - `getAllCampaigns(): Entry<Campaign>[]`
  - `getCampaignBySlug(slug: string): Entry<Campaign> | null`
  - `getActiveSituations(): Entry<Campaign>[]` — `status === 'active'`, sorted by severity priority `critical > warning > watch > water`

- [ ] **Step 1: Write the failing test**

Add to `lib/content/index.test.ts` (create the file with the `renderMarkdown` tests it already has, per the file's existing history — read it first to preserve those):

```ts
import { getAllCampaigns, getCampaignBySlug, getActiveSituations } from './index'

describe('campaign accessors', () => {
  it('does not throw when loading campaigns', () => {
    expect(() => getAllCampaigns()).not.toThrow()
  })

  it('returns null for an unknown slug', () => {
    expect(getCampaignBySlug('not-a-real-situation')).toBeNull()
  })

  it('sorts active situations by severity priority', () => {
    const active = getActiveSituations()
    const order = ['critical', 'warning', 'watch', 'water']
    for (let i = 1; i < active.length; i++) {
      const prev = order.indexOf(active[i - 1].data.severity!)
      const curr = order.indexOf(active[i].data.severity!)
      expect(prev).toBeLessThanOrEqual(curr)
    }
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- lib/content/index.test.ts`
Expected: FAIL — the three functions don't exist yet.

- [ ] **Step 3: Implement**

In `lib/content/index.ts`:

```ts
import { campaignSchema, storySchema, type Campaign, type Story } from './schemas'
import { SEVERITIES, type Severity } from '../status'

const TYPES = {
  story: storySchema,
  campaign: campaignSchema,
} satisfies Partial<Record<ContentType, ZodType>>
```

(This replaces the existing single-line `TYPES` object — the `story` line stays, `campaign` is added.)

Update the `Content` interface and `content()` function to also carry `campaigns`:

```ts
interface Content {
  stories: Entry<Story>[]
  campaigns: Entry<Campaign>[]
  all: Entry[]
  index: EntryIndex
}
```

```ts
function content(): Content {
  if (cache && process.env.NODE_ENV !== 'development') return cache

  const loaded = Object.fromEntries(
    (Object.entries(TYPES) as [ContentType, ZodType][]).map(([type, schema]) => [
      type,
      loadEntries(type, schema),
    ]),
  ) as Record<keyof typeof TYPES, Entry[]>

  const stories = loaded.story as Entry<Story>[]
  const campaigns = loaded.campaign as Entry<Campaign>[]
  const all: Entry[] = Object.values(loaded).flat()
  const index = buildIndex(loaded)

  validateRelations(all, index)

  cache = { stories, campaigns, all, index }
  return cache
}
```

Add the three new exports:

```ts
export function getAllCampaigns(): Entry<Campaign>[] {
  return content().campaigns
}

export function getCampaignBySlug(slug: string): Entry<Campaign> | null {
  return content().campaigns.find((e) => e.slug === slug) ?? null
}

export function getActiveSituations(): Entry<Campaign>[] {
  const priority: Severity[] = ['critical', 'warning', 'watch', 'water']
  return content()
    .campaigns.filter((e) => e.data.status === 'active')
    .sort((a, b) => {
      const ai = priority.indexOf(a.data.severity as Severity)
      const bi = priority.indexOf(b.data.severity as Severity)
      return ai - bi
    })
}
```

Also export the type: `export type { Campaign } from './schemas'` alongside the existing `Story` export.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- lib/content/index.test.ts`
Expected: PASS. Then `npm test` for the full suite — must stay green (this touches shared loader plumbing).

- [ ] **Step 5: Commit**

```bash
git add lib/content/index.ts lib/content/index.test.ts
git commit -m "feat(content): wire the campaign type into the content loader"
```

---

## Task 5: `StatusBadge`, `DataAttribution` components

**Files:**
- Create: `components/status-badge.tsx`
- Create: `components/data-attribution.tsx`

**Interfaces:**
- Consumes: `resolveStatus`, `LifecycleStatus`, `Severity` from `@/lib/status`
- Produces: `<StatusBadge status={...} severity={...} onDark={...} />`, `<DataAttribution sourceLabel={...} updatedAt={...} mock={...} />`

- [ ] **Step 1: Write `components/status-badge.tsx`**

```tsx
import { resolveStatus, type LifecycleStatus, type Severity } from '@/lib/status'

interface StatusBadgeProps {
  status: LifecycleStatus
  severity?: Severity | null
  /** True when the badge sits on the indigo/dark canvas — swaps to the -bright colour. */
  onDark?: boolean
}

export function StatusBadge({ status, severity, onDark = false }: StatusBadgeProps) {
  const visual = resolveStatus(status, severity)
  const color = onDark ? visual.colorBright : visual.color

  return (
    <span
      className="inline-block rounded-[2px] px-[0.6rem] py-[0.28rem] font-mono text-[0.7rem] font-bold uppercase tracking-[0.08em]"
      style={{ backgroundColor: color, color: onDark ? '#1a0508' : '#fff6f4' }}
    >
      {visual.label}
    </span>
  )
}
```

- [ ] **Step 2: Write `components/data-attribution.tsx`**

```tsx
interface DataAttributionProps {
  sourceLabel: string
  /** ISO 8601 datetime string. */
  updatedAt: string
  mock: boolean
}

/**
 * Every live-data figure on the site renders through this component. If
 * `mock` is true it must show a DEMO DATA tag — separate from any
 * StatusBadge — so a visitor can never mistake a placeholder number for a
 * real reading. Remove nothing here without wiring a real data source first.
 */
export function DataAttribution({ sourceLabel, updatedAt, mock }: DataAttributionProps) {
  const formatted = new Date(updatedAt).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
  })

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2 font-mono text-[0.68rem] text-ink-muted">
      <span>SOURCE: {sourceLabel.toUpperCase()} — UPDATED {formatted}</span>
      {mock && (
        <span className="rounded-[2px] border border-dashed border-ink-muted px-[0.4rem] py-[0.1rem] text-ink-muted">
          DEMO DATA — NOT LIVE
        </span>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/status-badge.tsx components/data-attribution.tsx
git commit -m "feat(ui): add StatusBadge and DataAttribution"
```

---

## Task 6: `LifecycleTimeline`, `ActionList`, `EvidenceList`

**Files:**
- Create: `components/lifecycle-timeline.tsx`
- Create: `components/action-list.tsx`
- Create: `components/evidence-list.tsx`

**Interfaces:**
- Consumes: `resolveStatus` from `@/lib/status`; `Campaign` type from `@/lib/content`
- Produces: `<LifecycleTimeline entries={...} />`, `<ActionList actions={...} urgent={...} />`, `<EvidenceList evidence={...} />`

- [ ] **Step 1: Write `components/lifecycle-timeline.tsx`**

```tsx
import { resolveStatus, type LifecycleStatus, type Severity } from '@/lib/status'

interface TimelineEntry {
  date: string
  status: LifecycleStatus
  severity?: Severity
  note: string
}

export function LifecycleTimeline({ entries }: { entries: TimelineEntry[] }) {
  return (
    <ol className="relative ml-1 border-l border-rule pl-6">
      {entries.map((entry, i) => {
        const visual = resolveStatus(entry.status, entry.severity)
        return (
          <li key={i} className="relative pb-6 last:pb-0">
            <span
              className="absolute -left-[1.65rem] top-1 h-[9px] w-[9px] rounded-[2px]"
              style={{ backgroundColor: visual.color }}
              aria-hidden="true"
            />
            <time
              dateTime={entry.date}
              className="font-mono text-[0.68rem] uppercase tracking-wide text-ink-muted"
            >
              {new Date(entry.date).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                timeZone: 'UTC',
              })}
            </time>
            <p className="mt-1 text-[0.94rem]">
              <span className="mr-1 font-mono text-[0.72rem] uppercase" style={{ color: visual.color }}>
                {visual.label}
              </span>
              {entry.note}
            </p>
          </li>
        )
      })}
    </ol>
  )
}
```

- [ ] **Step 2: Write `components/action-list.tsx`**

```tsx
interface Action {
  label: string
  href: string
  primary: boolean
}

interface ActionListProps {
  actions: Action[]
  /**
   * Only an urgent situation (active + critical) may render its primary
   * action filled in the critical signal colour — this is enforced here,
   * not left to content authors, so a colourful CTA can never appear on a
   * situation that isn't genuinely critical. Every other action, primary
   * or not, renders as a plain underlined link.
   */
  urgent: boolean
}

export function ActionList({ actions, urgent }: ActionListProps) {
  return (
    <ul className="mt-4 flex flex-col gap-3">
      {actions.map((action) => {
        const filled = action.primary && urgent
        return (
          <li key={action.href} className={filled ? '' : 'border-b border-rule pb-3 last:border-none last:pb-0'}>
            <a
              href={action.href}
              className={
                filled
                  ? 'inline-block rounded-[2px] bg-status-critical px-5 py-[0.65rem] font-semibold text-[#fff6f4] no-underline'
                  : 'text-[1rem] underline underline-offset-[3px]'
              }
            >
              {action.label}
            </a>
          </li>
        )
      })}
    </ul>
  )
}
```

- [ ] **Step 3: Write `components/evidence-list.tsx`**

```tsx
interface EvidenceItem {
  source: string
  note?: string
  date?: string
}

export function EvidenceList({ evidence }: { evidence: EvidenceItem[] }) {
  return (
    <ul className="mt-4 flex flex-col gap-[0.6rem] text-[0.92rem]">
      {evidence.map((item, i) => (
        <li key={i} className="border-l-2 border-rule pl-4">
          <span className="font-semibold">{item.source}</span>
          {item.note && <> — {item.note}</>}
          {item.date && (
            <div className="font-mono text-[0.72rem] text-ink-muted">
              {new Date(item.date).toLocaleDateString('en-IN', {
                year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
              })}
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}
```

- [ ] **Step 4: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add components/lifecycle-timeline.tsx components/action-list.tsx components/evidence-list.tsx
git commit -m "feat(ui): add LifecycleTimeline, ActionList and EvidenceList"
```

---

## Task 7: The one real demo Situation

**Files:**
- Create: `content/campaign/delhi-air-quality-2026.md`
- Create: `public/images/campaigns/delhi-air.png` (placeholder, same generator pattern as Task 10 of the earlier plan)
- Create: `scripts/make-placeholders.mjs` — modify if it already exists to add this image; otherwise create it following the earlier plan's dependency-free PNG generator

**Interfaces:**
- Consumes: `campaignSchema`
- Produces: one real, schema-valid Situation content file, related to the existing `delhi-air-victory` story

- [ ] **Step 1: Check whether `scripts/make-placeholders.mjs` already exists**

```bash
ls scripts/make-placeholders.mjs 2>/dev/null && echo EXISTS || echo MISSING
```

If it exists (it should, from the earlier foundation plan), add one more line to its loop generating `delhi-air.png` at `public/images/campaigns/` instead of `public/images/stories/`. If it is missing, write it fresh:

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
  ihdr[8] = 8
  ihdr[9] = 2
  const row = Buffer.alloc(1 + width * 3)
  for (let x = 0; x < width; x++) {
    row[1 + x * 3] = r; row[2 + x * 3] = g; row[3 + x * 3] = b
  }
  const raw = Buffer.concat(Array.from({ length: height }, () => row))
  return Buffer.concat([signature, chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))])
}

const OUT = join(process.cwd(), 'public', 'images', 'campaigns')
mkdirSync(OUT, { recursive: true })
writeFileSync(join(OUT, 'delhi-air.png'), solidPng(1600, 1200, [0xe4, 0xe0, 0xd8]))
console.log('wrote delhi-air.png')
```

- [ ] **Step 2: Run it**

```bash
node scripts/make-placeholders.mjs
```

- [ ] **Step 3: Write `content/campaign/delhi-air-quality-2026.md`**

```markdown
---
title: Air quality crosses hazardous threshold across Delhi-NCR
summary: AQI has remained above 300 for six consecutive days across Delhi-NCR, with CPCB reporting Hazardous readings at thirteen stations.
location: Delhi
status: active
severity: critical
heroImage:
  src: /images/campaigns/delhi-air.png
  alt: PLACEHOLDER — a hazy Delhi skyline under heavy particulate pollution
whatWeKnow: AQI has remained above 300 for six consecutive days across Delhi-NCR. CPCB attributes the spike to a seasonal inversion trapping vehicular and construction particulate matter. Thirteen monitoring stations are reporting Hazardous or Severe readings.
publicHealthImpact: Prolonged exposure at this level significantly increases respiratory and cardiovascular strain, particularly for children, older adults and people with pre-existing conditions. CPCB advises limiting outdoor activity and using certified air filtration indoors where possible.
whyItMatters: Delhi's winter inversion pattern is a recurring, largely preventable crisis tied to construction-dust regulation, crop-residue burning policy and vehicular emissions standards — not an unavoidable seasonal event.
whatSwechhaIsDoing: Field documentation across thirteen monitoring sites. Sustained advocacy with the municipal corporation on construction-site compliance. Public health communication in affected wards.
liveData:
  label: AQI
  value: '347'
  unit: ''
  sourceLabel: CPCB Delhi Station Network
  updatedAt: '2026-08-17T10:00:00+05:30'
  mock: true
  trendPoints: [210, 218, 225, 231, 240, 252, 261, 270, 279, 288, 297, 305, 312, 318, 324, 330, 335, 338, 341, 343, 345, 346, 347, 347]
actions:
  - label: Join the Delhi Air Campaign
    href: /act
    primary: true
  - label: Measure your local air quality — DIY guide
    href: /explore
    primary: false
  - label: Read the health guidance for vulnerable groups
    href: '#public-health'
    primary: false
evidence:
  - source: CPCB National Air Quality Index
    note: live data, accessed 17 August 2026
    date: '2026-08-17'
  - source: WHO Air Quality Guidelines
    note: 2021 update, health threshold reference
  - source: Swechha field documentation report — Delhi Air Campaign
    date: '2026-08-01'
timeline:
  - date: '2026-08-12'
    status: active
    severity: watch
    note: AQI crossed 200 across four stations. Situation opened.
  - date: '2026-08-15'
    status: active
    severity: warning
    note: AQI sustained above 250 for three consecutive days.
  - date: '2026-08-17'
    status: active
    severity: critical
    note: AQI reaches 347. CPCB issues Hazardous classification.
featured: true
related:
  story:
    - delhi-air-victory
---

Field teams are documenting conditions across the affected wards. This page
updates as the situation develops.
```

**Note the `related.story` entry.** `delhi-air-victory` already exists (from the earlier STORY plan) — this Situation and that Story are now cross-linked, and the build-time relation guarantee (already proven in this codebase) will fail loudly if that slug is ever wrong.

- [ ] **Step 4: Verify it loads**

Run: `npm test`
Expected: all tests still pass — nothing in the suite reads real content files by exact count (Task 4's test only checks sort order and null-safety), so this should be a no-op for tests, but confirms nothing broke.

Run: `npm run build`
Expected: PASS. If it fails, read the `ContentError` message — it names the file and field.

- [ ] **Step 5: Commit**

```bash
git add content/campaign scripts/make-placeholders.mjs public/images/campaigns
git commit -m "content: add the Delhi Air Quality demo Situation"
```

---

## Task 8: Campaign/Situation pages

**Files:**
- Create: `app/campaigns/page.tsx`
- Create: `app/campaigns/[slug]/page.tsx`

**Interfaces:**
- Consumes: `getAllCampaigns`, `getCampaignBySlug`, `getRelated` from `@/lib/content`; `StatusBadge`, `DataAttribution`, `LifecycleTimeline`, `ActionList`, `EvidenceList`, `ContentCard`, `RelatedContent` components
- Produces: static `/campaigns` and `/campaigns/[slug]`

- [ ] **Step 1: Write `app/campaigns/page.tsx`**

```tsx
import type { Metadata } from 'next'
import { ContentCard } from '@/components/content-card'
import { StatusBadge } from '@/components/status-badge'
import { getAllCampaigns } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Campaigns',
  description: 'Environmental situations Swechha is monitoring, campaigning on, or has resolved.',
}

export default function CampaignsPage() {
  const campaigns = getAllCampaigns()

  return (
    <main className="mx-auto max-w-6xl px-5 py-16 md:px-8">
      <h1>Campaigns</h1>
      <p className="mt-4 max-w-[60ch] text-ink-muted">
        Every significant environmental situation Swechha tracks — what&rsquo;s
        active, what&rsquo;s being monitored, and what&rsquo;s been resolved.
      </p>

      <div className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {campaigns.map((c) => (
          <div key={c.slug}>
            <ContentCard
              href={`/campaigns/${c.slug}`}
              title={c.data.title}
              summary={c.data.summary}
              image={c.data.heroImage}
              headingLevel={2}
              meta={c.data.location}
            />
            <div className="mt-2">
              <StatusBadge status={c.data.status} severity={c.data.severity} />
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Write `app/campaigns/[slug]/page.tsx`**

```tsx
import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { StatusBadge } from '@/components/status-badge'
import { DataAttribution } from '@/components/data-attribution'
import { LifecycleTimeline } from '@/components/lifecycle-timeline'
import { ActionList } from '@/components/action-list'
import { EvidenceList } from '@/components/evidence-list'
import { RelatedContent } from '@/components/related-content'
import { getAllCampaigns, getCampaignBySlug, getRelated } from '@/lib/content'

export function generateStaticParams() {
  return getAllCampaigns().map((c) => ({ slug: c.slug }))
}

export async function generateMetadata(
  props: PageProps<'/campaigns/[slug]'>,
): Promise<Metadata> {
  const { slug } = await props.params
  const campaign = getCampaignBySlug(slug)
  if (!campaign) return {}
  return {
    title: campaign.data.title,
    description: campaign.data.summary,
    openGraph: {
      title: campaign.data.title,
      description: campaign.data.summary,
      images: [campaign.data.heroImage.src],
    },
  }
}

export default async function CampaignPage(props: PageProps<'/campaigns/[slug]'>) {
  const { slug } = await props.params
  const campaign = getCampaignBySlug(slug)
  if (!campaign) notFound()

  const { data } = campaign
  const urgent = data.status === 'active' && data.severity === 'critical'

  return (
    <main>
      <header className="bg-indigo py-14 text-paper md:py-20">
        <div className="mx-auto max-w-3xl px-5 md:px-8">
          <p className="font-mono text-xs uppercase tracking-widest opacity-70">{data.location}</p>
          <h1 className="mt-3 max-w-[16ch]">{data.title}</h1>
          <div className="mt-4">
            <StatusBadge status={data.status} severity={data.severity} onDark />
          </div>
          {data.liveData && (
            <>
              <div className="mt-4 font-mono text-5xl font-bold leading-none md:text-6xl">
                {data.liveData.value}
                {data.liveData.unit}
              </div>
              <DataAttribution
                sourceLabel={data.liveData.sourceLabel}
                updatedAt={data.liveData.updatedAt}
                mock={data.liveData.mock}
              />
            </>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <div className="relative mt-10 aspect-[16/9] overflow-hidden bg-rule">
          <Image src={data.heroImage.src} alt={data.heroImage.alt} fill sizes="(max-width: 1152px) 100vw, 1152px" className="object-cover" priority />
        </div>

        <section className="mt-12 border-t border-rule pt-10">
          <h2>What we know</h2>
          <p className="mt-4 max-w-[64ch]">{data.whatWeKnow}</p>
        </section>

        <section className="mt-12 border-t border-rule pt-10">
          <h2>Public health impact</h2>
          <p className="mt-4 max-w-[64ch]">{data.publicHealthImpact}</p>
        </section>

        <section className="mt-12 border-t border-rule pt-10">
          <h2>Why it matters</h2>
          <p className="mt-4 max-w-[64ch]">{data.whyItMatters}</p>
        </section>

        <section className="mt-12 border-t border-rule pt-10">
          <h2>What Swechha is doing</h2>
          <p className="mt-4 max-w-[64ch]">{data.whatSwechhaIsDoing}</p>
        </section>

        <section className="mt-12 border-t border-rule pt-10">
          <h2>What you can do</h2>
          <ActionList actions={data.actions} urgent={urgent} />
        </section>

        <section className="mt-12 border-t border-rule pt-10">
          <h2>Evidence &amp; sources</h2>
          <EvidenceList evidence={data.evidence} />
        </section>

        <section className="mt-12 border-t border-rule pt-10">
          <h2>How this situation has evolved</h2>
          <div className="mt-6">
            <LifecycleTimeline entries={data.timeline} />
          </div>
        </section>

        <RelatedContent entries={getRelated(campaign)} />
      </div>
    </main>
  )
}
```

- [ ] **Step 3: Verify static generation and the build-time guarantee**

Run: `npm run build`
Expected: `/campaigns` and `/campaigns/delhi-air-quality-2026` appear as static (`○`/`●`), not `ƒ`.

Then repeat the proof already established for stories: temporarily break the one campaign file three ways — an unresolvable `related.story` slug, empty `evidence: []`, a missing `severity` while `status: active` — confirm `npm run build` **fails** each time naming the file, then **restore exactly** and confirm a clean tree (`git status --porcelain` empty) and a passing build.

- [ ] **Step 4: Commit**

```bash
git add app/campaigns
git commit -m "feat(campaigns): add the Situation archive and detail page"
```

---

## Task 9: `NowModule` and the homepage

**Files:**
- Create: `components/now-module.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `getActiveSituations` from `@/lib/content`; `StatusBadge`, `DataAttribution`
- Produces: `<NowModule situations={...} />`

- [ ] **Step 1: Write `components/now-module.tsx`**

```tsx
import Link from 'next/link'
import { StatusBadge } from '@/components/status-badge'
import { DataAttribution } from '@/components/data-attribution'
import type { Entry, Campaign } from '@/lib/content'

/**
 * The homepage's compact view into Swechha NOW. One hero situation gets the
 * full treatment; up to two more render as a single quiet line each. This
 * is intentionally not the full /now page — see app/now/page.tsx for that.
 * Renders nothing if there is currently no active situation, rather than an
 * empty or broken-looking module.
 */
export function NowModule({ situations }: { situations: Entry<Campaign>[] }) {
  if (situations.length === 0) return null
  const [hero, ...rest] = situations
  const secondary = rest.slice(0, 2)

  return (
    <section className="mt-20">
      <h2 className="text-xs uppercase tracking-widest text-ink-muted">Swechha now</h2>

      <div className="mt-6 bg-indigo p-6 text-paper md:p-9">
        <p className="font-mono text-xs uppercase tracking-widest opacity-70">{hero.data.location}</p>
        {hero.data.liveData ? (
          <>
            <div className="mt-2 font-mono text-4xl font-bold leading-none md:text-6xl">
              {hero.data.liveData.value}{hero.data.liveData.unit}
            </div>
            <DataAttribution
              sourceLabel={hero.data.liveData.sourceLabel}
              updatedAt={hero.data.liveData.updatedAt}
              mock={hero.data.liveData.mock}
            />
          </>
        ) : (
          <h3 className="mt-2 max-w-[20ch] text-2xl">{hero.data.title}</h3>
        )}
        <div className="mt-3">
          <StatusBadge status={hero.data.status} severity={hero.data.severity} onDark />
        </div>
        <div className="mt-5 flex flex-wrap gap-6">
          <Link href={`/campaigns/${hero.slug}#public-health`} className="text-sm underline underline-offset-[3px] opacity-85">
            What this means
          </Link>
          <Link href={`/campaigns/${hero.slug}`} className="text-sm underline underline-offset-[3px] opacity-85">
            What you can do
          </Link>
        </div>
      </div>

      {secondary.length > 0 && (
        <div className="mt-[1px] grid gap-[1px] bg-rule sm:grid-cols-2">
          {secondary.map((s) => (
            <Link
              key={s.slug}
              href={`/campaigns/${s.slug}`}
              className="flex flex-wrap items-baseline gap-2 bg-paper p-4"
            >
              <span className="font-mono text-[0.66rem] uppercase tracking-wide text-ink-muted">
                {s.data.location}
              </span>
              <StatusBadge status={s.data.status} severity={s.data.severity} />
              <span className="text-sm text-ink-muted">{s.data.summary}</span>
            </Link>
          ))}
        </div>
      )}

      <Link href="/now" className="mt-6 inline-block border-b-2 border-teal pb-1 text-sm uppercase tracking-widest hover:text-teal-ink">
        All active situations
      </Link>
    </section>
  )
}
```

- [ ] **Step 2: Wire it into `app/page.tsx`**

Add the import and call `getActiveSituations()`, rendering `<NowModule>` between the hero and the "Latest stories" section:

```tsx
import { NowModule } from '@/components/now-module'
import { getAllStories, getActiveSituations } from '@/lib/content'
```

```tsx
export default function Home() {
  const stories = getAllStories().slice(0, 3)
  const situations = getActiveSituations()

  return (
    <main className="mx-auto max-w-6xl px-5 py-20 md:px-8">
      <h1 className="max-w-[18ch]">
        Environmental action, and the people making it happen.
      </h1>
      <p className="mt-6 max-w-[55ch] font-display text-xl text-ink-muted">
        Swechha works across climate action, sustainability, education, youth
        engagement and community-led change in India.
      </p>

      <NowModule situations={situations} />

      <section className="mt-20">
        {/* ...existing "Latest stories" section, unchanged... */}
```

(Leave the existing "Latest stories" `<section>` exactly as it is — only the import line and the `<NowModule>` call are new.)

- [ ] **Step 3: Verify**

Run: `npm run build`
Expected: PASS, homepage still static.

Start `npm run dev`, view `/` at 375px and 1440px. Confirm: the NOW module renders the Delhi Air situation with the DEMO DATA tag visible, the badge reads CRITICAL, and clicking through reaches `/campaigns/delhi-air-quality-2026`.

- [ ] **Step 4: Commit**

```bash
git add components/now-module.tsx app/page.tsx
git commit -m "feat(homepage): add the Swechha NOW module"
```

---

## Task 10: The full `/now` page

**Files:**
- Create: `app/now/page.tsx`

**Interfaces:**
- Consumes: `getActiveSituations`, `getAllStories` from `@/lib/content`; `StatusBadge`, `DataAttribution`, `ContentCard`

- [ ] **Step 1: Write `app/now/page.tsx`**

```tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { ContentCard } from '@/components/content-card'
import { StatusBadge } from '@/components/status-badge'
import { DataAttribution } from '@/components/data-attribution'
import { getActiveSituations, getAllStories } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Now',
  description: 'The environmental situations Swechha is tracking right now, and the latest stories.',
}

export default function NowPage() {
  const situations = getActiveSituations()
  const stories = getAllStories().slice(0, 3)

  return (
    <main className="mx-auto max-w-6xl px-5 py-16 md:px-8">
      <h1>Now</h1>
      <p className="mt-4 max-w-[60ch] text-ink-muted">
        What&rsquo;s active, and what Swechha is doing about it.
      </p>

      <section className="mt-14">
        <h2 className="text-xs uppercase tracking-widest text-ink-muted">Current situations</h2>
        {situations.length === 0 ? (
          <p className="mt-6 max-w-[52ch] text-ink-muted">
            Nothing is currently active. Resolved and monitored situations are on the{' '}
            <Link href="/campaigns" className="underline underline-offset-[3px]">Campaigns</Link> page.
          </p>
        ) : (
          <div className="mt-6 flex flex-col gap-[1px] bg-rule">
            {situations.map((s) => (
              <Link key={s.slug} href={`/campaigns/${s.slug}`} className="block bg-indigo p-6 text-paper md:p-8">
                <p className="font-mono text-xs uppercase tracking-widest opacity-70">{s.data.location}</p>
                {s.data.liveData && (
                  <>
                    <div className="mt-2 font-mono text-3xl font-bold md:text-5xl">
                      {s.data.liveData.value}{s.data.liveData.unit}
                    </div>
                    <DataAttribution sourceLabel={s.data.liveData.sourceLabel} updatedAt={s.data.liveData.updatedAt} mock={s.data.liveData.mock} />
                  </>
                )}
                <div className="mt-3">
                  <StatusBadge status={s.data.status} severity={s.data.severity} onDark />
                </div>
                <h3 className="mt-3 max-w-[24ch] text-2xl">{s.data.title}</h3>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mt-16">
        <h2 className="text-xs uppercase tracking-widest text-ink-muted">Latest stories</h2>
        <div className="mt-6 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
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
      </section>
    </main>
  )
}
```

- [ ] **Step 2: Verify**

Run: `npm run build`
Expected: PASS, `/now` static.

- [ ] **Step 3: Commit**

```bash
git add app/now
git commit -m "feat: add the full /now page"
```

---

## Task 11: Nav update and sitemap

**Files:**
- Modify: `components/site-header.tsx`
- Modify: `app/sitemap.ts`

**Interfaces:**
- Consumes: `getAllCampaigns` from `@/lib/content`

- [ ] **Step 1: Update the nav array**

In `components/site-header.tsx`, replace the `NAV` array:

```tsx
const NAV = [
  { href: '/now', label: 'Now' },
  { href: '/explore', label: 'Explore' },
  { href: '/work', label: 'Work' },
  { href: '/campaigns', label: 'Campaigns' },
  { href: '/impact', label: 'Impact' },
  { href: '/act', label: 'Act' },
  { href: '/about', label: 'About' },
  { href: '/search', label: 'Search' },
]
```

Nothing else in the file changes — the existing `<nav>`/`<ul>` markup already maps over `NAV` generically.

- [ ] **Step 2: Update `app/sitemap.ts`**

```ts
import type { MetadataRoute } from 'next'
import { getAllStories, getAllCampaigns } from '@/lib/content'

const BASE = 'https://swechha.in'
const STATIC_PAGES = ['now', 'explore', 'work', 'campaigns', 'impact', 'act', 'about', 'search']

export default function sitemap(): MetadataRoute.Sitemap {
  const stories = getAllStories().map((story) => ({
    url: `${BASE}/stories/${story.slug}`,
    lastModified: story.data.date,
  }))
  const campaigns = getAllCampaigns().map((c) => ({
    url: `${BASE}/campaigns/${c.slug}`,
  }))

  return [
    { url: BASE },
    { url: `${BASE}/stories` },
    ...STATIC_PAGES.map((p) => ({ url: `${BASE}/${p}` })),
    ...stories,
    ...campaigns,
  ]
}
```

- [ ] **Step 3: Verify**

Run: `npm run build`
Expected: PASS (the new static pages don't exist as routes yet until Tasks 12–16 land, so `next build` will 404 on internal `<Link>` prefetches — that's expected and matches the plan's sequencing; the *sitemap* itself doesn't require the routes to exist to build correctly). Confirm `curl`/read the built `sitemap.xml` output contains all 8 static-page URLs plus the campaign route.

Visually verify the nav renders sensibly at 375px — 8 items is more than the 5 the header was designed against. If it wraps awkwardly, that's a real finding to report, not something to silently fix by dropping an item — the 8-item nav is explicit instruction.

- [ ] **Step 4: Commit**

```bash
git add components/site-header.tsx app/sitemap.ts
git commit -m "feat(nav): update to the revised 8-item navigation"
```

---

## Task 12: `/explore` and `/work`

**Files:**
- Create: `app/explore/page.tsx`
- Create: `app/work/page.tsx`

**Interfaces:**
- Consumes: `getAllStories`, `getAllCampaigns` from `@/lib/content`; `ContentCard`

- [ ] **Step 1: Write `app/explore/page.tsx`**

```tsx
import type { Metadata } from 'next'
import { ContentCard } from '@/components/content-card'
import { getAllStories } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Explore',
  description: 'Stories, knowledge and films from Swechha.',
}

export default function ExplorePage() {
  const stories = getAllStories()

  return (
    <main className="mx-auto max-w-6xl px-5 py-16 md:px-8">
      <h1>Explore</h1>
      <p className="mt-4 max-w-[60ch] text-ink-muted">
        Stories, explainers, guides and films — understand what&rsquo;s happening
        and why it matters.
      </p>

      <section className="mt-14">
        <h2 className="text-xs uppercase tracking-widest text-ink-muted">Stories</h2>
        <div className="mt-6 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
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
      </section>

      <section className="mt-16 border-t border-rule pt-10">
        <h2 className="text-xs uppercase tracking-widest text-ink-muted">Knowledge &amp; DIY</h2>
        <p className="mt-4 max-w-[52ch] text-ink-muted">
          Explainers and DIY guides are being written — nothing published yet.
        </p>
      </section>

      <section className="mt-16 border-t border-rule pt-10">
        <h2 className="text-xs uppercase tracking-widest text-ink-muted">Films</h2>
        <p className="mt-4 max-w-[52ch] text-ink-muted">
          No films published yet.
        </p>
      </section>
    </main>
  )
}
```

- [ ] **Step 2: Write `app/work/page.tsx`**

```tsx
import type { Metadata } from 'next'
import { ContentCard } from '@/components/content-card'
import { StatusBadge } from '@/components/status-badge'
import { getAllCampaigns } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Work',
  description: 'What Swechha is working on — active situations and programmes.',
}

export default function WorkPage() {
  const campaigns = getAllCampaigns()

  return (
    <main className="mx-auto max-w-6xl px-5 py-16 md:px-8">
      <h1>Work</h1>
      <p className="mt-4 max-w-[60ch] text-ink-muted">
        Situations Swechha is actively responding to, and the programmes behind them.
      </p>

      <section className="mt-14">
        <h2 className="text-xs uppercase tracking-widest text-ink-muted">Situations</h2>
        <div className="mt-6 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((c) => (
            <div key={c.slug}>
              <ContentCard
                href={`/campaigns/${c.slug}`}
                title={c.data.title}
                summary={c.data.summary}
                image={c.data.heroImage}
                meta={c.data.location}
              />
              <div className="mt-2">
                <StatusBadge status={c.data.status} severity={c.data.severity} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16 border-t border-rule pt-10">
        <h2 className="text-xs uppercase tracking-widest text-ink-muted">Projects</h2>
        <p className="mt-4 max-w-[52ch] text-ink-muted">
          Project profiles are being written — nothing published yet.
        </p>
      </section>
    </main>
  )
}
```

- [ ] **Step 3: Verify**

Run: `npm run build`
Expected: PASS, both routes static.

- [ ] **Step 4: Commit**

```bash
git add app/explore app/work
git commit -m "feat: add /explore and /work"
```

---

## Task 13: `/about`, `/impact`, `/act`

**Files:**
- Create: `app/about/page.tsx`
- Create: `app/impact/page.tsx`
- Create: `app/act/page.tsx`

- [ ] **Step 1: Write `app/about/page.tsx`**

Only verified facts: the tagline from the brand guidelines, and the three mission areas it names. No invented history, headcount, or founding date.

```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About',
  description: 'Who Swechha is.',
}

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-16 md:px-8">
      <h1>About Swechha</h1>
      <p className="mt-6 font-display text-xl text-ink-muted">
        Education. Environment. Enterprise.
      </p>
      <p className="mt-8 max-w-[60ch]">
        Swechha works across environmental education, direct environmental
        action, and community enterprise — connecting people to the
        environmental situations that affect them, and to concrete ways to
        respond.
      </p>
      <p className="mt-6 max-w-[60ch] text-ink-muted">
        A fuller account of Swechha&rsquo;s history, team and partners will be
        added here — this section intentionally states only what has been
        confirmed rather than filling the space with unverified detail.
      </p>
    </main>
  )
}
```

- [ ] **Step 2: Write `app/impact/page.tsx`**

No invented statistics. The page states plainly that verified figures are pending, rather than inventing placeholder numbers that would read as fact.

```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Impact',
  description: 'The change Swechha’s work has created.',
}

export default function ImpactPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-16 md:px-8">
      <h1>Impact</h1>
      <p className="mt-6 max-w-[60ch] text-ink-muted">
        Verified impact figures — years active, people reached, situations
        resolved — are being compiled and will appear here. Nothing on this
        page is a placeholder number: rather than invent statistics, this
        page states plainly that the real ones aren&rsquo;t in yet.
      </p>
      <p className="mt-6 max-w-[60ch] text-ink-muted">
        In the meantime, individual outcomes are visible on resolved{' '}
        <a href="/campaigns" className="underline underline-offset-[3px]">campaign pages</a>.
      </p>
    </main>
  )
}
```

- [ ] **Step 3: Write `app/act/page.tsx`**

Static, honest, non-functional where no real destination exists — per the confirmed decision, no invented email address or donation link.

```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Act',
  description: 'Ways to participate in Swechha’s work.',
}

export default function ActPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-16 md:px-8">
      <h1>Act</h1>
      <p className="mt-6 max-w-[60ch] text-ink-muted">
        What Swechha needs most right now.
      </p>

      <div className="mt-12 flex flex-col gap-10">
        <section>
          <h2 className="text-xl">Volunteer</h2>
          <p className="mt-3 max-w-[52ch] text-ink-muted">
            Volunteer sign-up isn&rsquo;t connected yet. Check back soon, or
            follow a specific <a href="/campaigns" className="underline underline-offset-[3px]">campaign</a>{' '}
            for situation-specific ways to help.
          </p>
        </section>

        <section className="border-t border-rule pt-10">
          <h2 className="text-xl">Donate</h2>
          <p className="mt-3 max-w-[52ch] text-ink-muted">
            Donation processing isn&rsquo;t connected yet.
          </p>
        </section>

        <section className="border-t border-rule pt-10">
          <h2 className="text-xl">Newsletter</h2>
          <div className="mt-3 flex max-w-md gap-2">
            <input
              type="email"
              placeholder="you@example.com"
              disabled
              aria-describedby="newsletter-note"
              className="flex-1 border border-rule bg-surface px-3 py-2 text-ink-muted"
            />
            <button
              disabled
              className="border border-rule px-4 py-2 text-sm uppercase tracking-widest text-ink-muted"
            >
              Notify me
            </button>
          </div>
          <p id="newsletter-note" className="mt-2 text-sm text-ink-muted">
            Not connected yet — this field is intentionally disabled rather
            than pretending to submit.
          </p>
        </section>
      </div>
    </main>
  )
}
```

- [ ] **Step 4: Verify**

Run: `npm run build`
Expected: PASS, all three static. `npx tsc --noEmit` clean.

- [ ] **Step 5: Commit**

```bash
git add app/about app/impact app/act
git commit -m "feat: add /about, /impact and /act — honest content, nothing invented"
```

---

## Task 14: Real search

**Files:**
- Create: `lib/search.ts`
- Create: `lib/search.test.ts`
- Create: `components/search-client.tsx`
- Create: `app/search/page.tsx`

**Interfaces:**
- Consumes: `getAllEntries` from `@/lib/content`
- Produces: `interface SearchDoc { type: string; slug: string; title: string; summary: string; href: string }`, `getSearchIndex(): SearchDoc[]`

- [ ] **Step 1: Write the failing test**

Create `lib/search.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { getSearchIndex } from './search'

describe('getSearchIndex', () => {
  it('includes every loaded entry with a title and a resolvable href', () => {
    const index = getSearchIndex()
    expect(index.length).toBeGreaterThan(0)
    for (const doc of index) {
      expect(doc.title.length).toBeGreaterThan(0)
      expect(doc.href.startsWith('/')).toBe(true)
    }
  })

  it('routes stories to /stories and campaigns to /campaigns', () => {
    const index = getSearchIndex()
    const story = index.find((d) => d.type === 'story')
    const campaign = index.find((d) => d.type === 'campaign')
    if (story) expect(story.href).toBe(`/stories/${story.slug}`)
    if (campaign) expect(campaign.href).toBe(`/campaigns/${campaign.slug}`)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- lib/search.test.ts`
Expected: FAIL — cannot resolve `./search`.

- [ ] **Step 3: Write `lib/search.ts`**

```ts
import { getAllEntries } from './content'
import type { ContentType } from './content/types'

export interface SearchDoc {
  type: ContentType
  slug: string
  title: string
  summary: string
  href: string
}

const PATHS: Record<ContentType, string> = {
  story: '/stories',
  project: '/work',
  knowledge: '/explore',
  film: '/explore',
  campaign: '/campaigns',
}

function titleOf(data: unknown): string {
  return (data as { title?: string }).title ?? ''
}

function summaryOf(data: unknown): string {
  return (data as { summary?: string }).summary ?? ''
}

/**
 * A pure, testable function — the search page reads this at build time and
 * ships it as data for the client component to filter. No index
 * infrastructure: content volume is small enough that shipping the whole
 * index is the honest, simplest option. Revisit if that stops being true.
 */
export function getSearchIndex(): SearchDoc[] {
  return getAllEntries().map((entry) => ({
    type: entry.type,
    slug: entry.slug,
    title: titleOf(entry.data),
    summary: summaryOf(entry.data),
    href: `${PATHS[entry.type]}/${entry.slug}`,
  }))
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- lib/search.test.ts`
Expected: PASS.

- [ ] **Step 5: Write `components/search-client.tsx`**

```tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { SearchDoc } from '@/lib/search'

export function SearchClient({ index }: { index: SearchDoc[] }) {
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const results = q === ''
    ? []
    : index.filter((doc) => doc.title.toLowerCase().includes(q) || doc.summary.toLowerCase().includes(q))

  return (
    <div>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search stories, campaigns and more"
        aria-label="Search"
        className="w-full border border-rule bg-surface px-4 py-3 text-lg"
      />
      {q !== '' && (
        <p className="mt-4 text-sm text-ink-muted">
          {results.length} result{results.length === 1 ? '' : 's'}
        </p>
      )}
      <ul className="mt-4 flex flex-col gap-4">
        {results.map((doc) => (
          <li key={`${doc.type}/${doc.slug}`} className="border-b border-rule pb-4">
            <Link href={doc.href} className="font-display text-xl hover:text-teal-ink">
              {doc.title}
            </Link>
            <p className="mt-1 text-sm text-ink-muted">{doc.summary}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

- [ ] **Step 6: Write `app/search/page.tsx`**

```tsx
import type { Metadata } from 'next'
import { SearchClient } from '@/components/search-client'
import { getSearchIndex } from '@/lib/search'

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search Swechha stories, campaigns and more.',
}

export default function SearchPage() {
  const index = getSearchIndex()

  return (
    <main className="mx-auto max-w-3xl px-5 py-16 md:px-8">
      <h1>Search</h1>
      <div className="mt-8">
        <SearchClient index={index} />
      </div>
    </main>
  )
}
```

- [ ] **Step 7: Verify**

Run: `npm run build`
Expected: PASS, `/search` static (the client component hydrates but the page itself is prerendered — confirm it's `○` not `ƒ`). `npx tsc --noEmit` clean.

Start `npm run dev`, visit `/search`, type "delhi" — confirm both the story and the campaign appear.

- [ ] **Step 8: Commit**

```bash
git add lib/search.ts lib/search.test.ts components/search-client.tsx app/search
git commit -m "feat: add real client-side search"
```

---

## Task 15: Final verification

**Files:**
- None created — verification only.

- [ ] **Step 1: Full build and route check**

```bash
rm -rf .next && npm run build
```

Expected: every route static (`○`/`●`), zero `ƒ`. List them explicitly in the report.

- [ ] **Step 2: Full test suite**

```bash
npm test
```

Expected: all pass. Report the count.

- [ ] **Step 3: Nav check at 375px**

Start `npm run dev`, view every page in the nav at 375px and 1440px. Specifically check whether the 8-item nav wraps acceptably or crowds — report what you see, don't silently alter the nav to fix it.

- [ ] **Step 4: Re-verify the build-time guarantee on the new type**

Confirm (or re-confirm from Task 8) that breaking `content/campaign/delhi-air-quality-2026.md` three ways — dead relation, empty `evidence`, missing `severity` on `status: active` — fails `npm run build` each time, and restores clean.

- [ ] **Step 5: Confirm no invented content shipped**

Read `/about`, `/impact`, `/act` once more against the Global Constraints — confirm no fabricated statistic, contact detail, or link exists anywhere in the three files.

- [ ] **Step 6: Report**

Summarise: routes added, tests passing, the nav-at-375px finding, and anything that deviated from this plan and why.

---

## Deliberately out of scope, with reason

**Selective-colour photography is not implemented in this plan.** Every image in this codebase today — the three Story heroes and the new Situation hero — is a solid-colour placeholder PNG generated by `scripts/make-placeholders.mjs`, not a real photograph. Selective colour (grayscale photo + one meaningful coloured element) is a per-image editorial choice a human makes about a *specific real photograph* — there is no real photograph anywhere in this repo to apply it to, and building a masking/filter mechanism to demonstrate on a placeholder rectangle would be decoration with nothing real underneath it, which is precisely what the design system document rules out.

**What exists instead, ready for the moment real photography arrives:** `docs/superpowers/specs/2026-08-17-swechha-design-language-exploration.md` §3 has the disciplined rule (never bulk, never more than one colour, always captioned, earned not applied) and the published "Signal & Situation" artifact demonstrates the CSS/canvas technique concretely. When real photography is available, applying this is a small, well-specified follow-up — not a redesign.

**Also out of scope, and why:** the recurring-agent pipeline itself (source registry, ingestion, event detection, editorial decision engine) — the IA document's own §8 specifies this as backend infrastructure the frontend must be able to receive from later, not something this plan builds. This plan's job was to make sure nothing in the frontend would need to change shape when that pipeline exists — the `liveData.mock` field and the `DataAttribution` component are that seam.

