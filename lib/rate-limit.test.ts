import { describe, expect, it } from 'vitest'
import { callerFrom, CALLER_LIMIT, RECIPIENT_LIMIT, WINDOW_SECONDS } from './rate-limit'

/**
 * WHAT IS AND IS NOT COVERED HERE.
 *
 * `callerFrom()` is the whole of the identification logic and needs no
 * database, so it is tested properly. `checkRateLimit()` and `countAndRecord()`
 * talk to Postgres, and there is no DATABASE_URL on the machine this was
 * written on — so the counting itself is UNTESTED and honestly declared as
 * such rather than covered by a mock that would only assert that the mock was
 * called.
 *
 * The identification is worth testing on its own account, because getting it
 * wrong fails in two opposite and equally bad directions: read the wrong entry
 * from `x-forwarded-for` and the limit keys off a proxy that every visitor
 * shares, which locks the whole site out; read nothing and every request shares
 * one bucket, same outcome.
 */
describe('callerFrom', () => {
  const req = (headers: Record<string, string>) =>
    new Request('https://swechha.in/api/ward/subscribe', { method: 'POST', headers })

  it('prefers x-real-ip, which is the value Vercel sets', () => {
    expect(callerFrom(req({ 'x-real-ip': '203.0.113.7' }))).toBe('203.0.113.7')
  })

  it('takes the LEFTMOST x-forwarded-for entry — the real peer behind a proxy', () => {
    expect(callerFrom(req({ 'x-forwarded-for': '203.0.113.7, 70.41.3.18, 150.172.238.178' })))
      .toBe('203.0.113.7')
  })

  it('trims whitespace around the entry it picks', () => {
    expect(callerFrom(req({ 'x-forwarded-for': '  203.0.113.7 , 70.41.3.18' }))).toBe('203.0.113.7')
  })

  it('handles a single-entry x-forwarded-for with no comma', () => {
    expect(callerFrom(req({ 'x-forwarded-for': '203.0.113.7' }))).toBe('203.0.113.7')
  })

  it('lets x-real-ip win when both are present', () => {
    expect(callerFrom(req({ 'x-real-ip': '198.51.100.4', 'x-forwarded-for': '203.0.113.7' })))
      .toBe('198.51.100.4')
  })

  it('returns null rather than a shared bucket when neither header is present', () => {
    /* Deliberate: lumping unidentifiable requests together would let one
       attacker spend the limit for everybody behind the same gap, turning an
       abuse control into a denial-of-service tool. The recipient limit still
       bounds a null caller. */
    expect(callerFrom(req({}))).toBeNull()
  })

  it('returns null for a header that is present but empty or whitespace', () => {
    expect(callerFrom(req({ 'x-forwarded-for': '' }))).toBeNull()
    expect(callerFrom(req({ 'x-real-ip': '   ' }))).toBeNull()
    expect(callerFrom(req({ 'x-forwarded-for': ' , 70.41.3.18' }))).toBeNull()
  })

  it('carries IPv6 through unmangled', () => {
    expect(callerFrom(req({ 'x-real-ip': '2001:db8::8a2e:370:7334' })))
      .toBe('2001:db8::8a2e:370:7334')
  })
})

describe('the limits themselves', () => {
  /* Not a tautology: these are the numbers a human has to judge, so they are
     stated once here in the form "a person doing this legitimately must not hit
     it, an attacker must". Five subscribes in fifteen minutes from one address
     is already implausible for a reader; three confirmations to one inbox is
     the point at which more mail stops being help and starts being the abuse. */
  it('leaves room for a real person and not for a flood', () => {
    expect(CALLER_LIMIT).toBeGreaterThanOrEqual(3)
    expect(CALLER_LIMIT).toBeLessThanOrEqual(10)
    expect(RECIPIENT_LIMIT).toBeLessThanOrEqual(CALLER_LIMIT)
  })

  it('counts inside a window short enough to recover from and long enough to bite', () => {
    expect(WINDOW_SECONDS).toBeGreaterThanOrEqual(5 * 60)
    expect(WINDOW_SECONDS).toBeLessThanOrEqual(60 * 60)
  })
})
