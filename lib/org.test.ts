import { describe, expect, it } from 'vitest'
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
