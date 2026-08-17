import { describe, it, expect } from 'vitest'
import { storySchema, campaignSchema } from './schemas'

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

  it('rejects an unknown key inside related (e.g. `stories` typo for `story`)', () => {
    expect(() =>
      storySchema.parse({ ...valid, related: { stories: ['ghost-slug'] } }),
    ).toThrow()
  })

  it('rejects a wrong-case key inside related (e.g. `Story` for `story`)', () => {
    expect(() =>
      storySchema.parse({ ...valid, related: { Story: ['another-ghost'] } }),
    ).toThrow()
  })

  it('rejects an unknown top-level frontmatter key (e.g. `titel` typo for `title`)', () => {
    expect(() => storySchema.parse({ ...valid, titel: 'Typo' })).toThrow()
  })

  it('rejects a briefing relation key — the type no longer exists', () => {
    expect(() =>
      storySchema.parse({ ...valid, related: { briefing: ['x'] } }),
    ).toThrow()
  })
})

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
