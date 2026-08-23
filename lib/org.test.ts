import { afterEach, describe, expect, it, vi } from 'vitest'
import { FOUNDED_YEAR, SITE_URL, organizationJsonLd, yearsSinceFounding } from './org'

describe('yearsSinceFounding', () => {
  it('counts whole years from the founding year', () => {
    expect(yearsSinceFounding(new Date('2026-08-19T00:00:00Z'))).toBe(26)
  })

  it('moves with the calendar rather than staying at whatever was typed', () => {
    expect(yearsSinceFounding(new Date('2030-01-01T00:00:00Z'))).toBe(30)
  })

  it('is zero in the founding year itself', () => {
    expect(yearsSinceFounding(new Date(`${FOUNDED_YEAR}-06-01T00:00:00Z`))).toBe(0)
  })
})

describe('organizationJsonLd', () => {
  it('derives foundingDate from FOUNDED_YEAR rather than a separate literal', () => {
    expect(organizationJsonLd().foundingDate).toBe(String(FOUNDED_YEAR))
  })

  it('builds the logo URL from SITE_URL rather than a second hardcoded domain', () => {
    expect(organizationJsonLd().logo.startsWith(SITE_URL)).toBe(true)
  })

  it('declares an NGO schema.org type', () => {
    expect(organizationJsonLd()['@type']).toBe('NGO')
    expect(organizationJsonLd()['@context']).toBe('https://schema.org')
  })
})

/**
 * THE WHITESPACE REGRESSION, WIRED SO IT CANNOT COME BACK SILENTLY.
 *
 * Audited in production on 23 August 2026: the Vercel `SITE_ORIGIN` value
 * carried a LEADING TAB, so `SITE_URL` was "\thttps://swechha.in" and every
 * consumer inherited it. What that actually shipped:
 *
 *   sitemap.xml  <loc>\thttps://swechha.in/now/air</loc>   × all 35 URLs
 *   robots.txt   Sitemap: \thttps://swechha.in/sitemap.xml
 *
 * A `<loc>` is required to be a valid absolute URL, and the sitemap is the
 * machine-readable index of the entire site — so one invisible character put
 * the whole index at risk. It was invisible in every dashboard, in every log
 * and in every rendered page, which is exactly why it needs a test rather than
 * a note: the next person to paste that value into Vercel will paste the
 * whitespace too, and nothing else in this repo would notice.
 *
 * `vi.resetModules()` + dynamic import because `SITE_URL` is evaluated once at
 * module load, which is the behaviour under test.
 */
describe('SITE_URL is whitespace-safe', () => {
  const ORIGINAL = process.env.SITE_ORIGIN
  const VERCEL = process.env.VERCEL_URL

  afterEach(() => {
    process.env.SITE_ORIGIN = ORIGINAL
    process.env.VERCEL_URL = VERCEL
    vi.resetModules()
  })

  async function siteUrlWith(origin: string | undefined) {
    vi.resetModules()
    if (origin === undefined) delete process.env.SITE_ORIGIN
    else process.env.SITE_ORIGIN = origin
    return (await import('./org')).SITE_URL
  }

  it('strips the leading tab that shipped to production', async () => {
    expect(await siteUrlWith('\thttps://swechha.in')).toBe('https://swechha.in')
  })

  it('strips surrounding whitespace of every kind a paste can carry', async () => {
    expect(await siteUrlWith('  https://swechha.in  ')).toBe('https://swechha.in')
    expect(await siteUrlWith('\nhttps://swechha.in\n')).toBe('https://swechha.in')
  })

  it('treats an all-whitespace value as unset rather than as an origin', async () => {
    delete process.env.VERCEL_URL
    expect(await siteUrlWith('   ')).toBe('https://swechha.in')
  })

  it('leaves a clean value exactly as it is', async () => {
    expect(await siteUrlWith('https://staging.example.org')).toBe('https://staging.example.org')
  })

  it('never emits a URL with whitespace in it, whatever it is given', async () => {
    for (const raw of ['\thttps://swechha.in', ' https://swechha.in', 'https://swechha.in\t']) {
      expect(await siteUrlWith(raw)).not.toMatch(/\s/)
    }
  })
})
