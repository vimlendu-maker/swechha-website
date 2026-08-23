#!/usr/bin/env node
/**
 * CUTOVER VERIFICATION — run this against the live domain after DNS moves.
 *
 *   node scripts/verify-cutover.mjs                      # https://swechha.in
 *   node scripts/verify-cutover.mjs https://example.com  # anywhere else
 *   node scripts/verify-cutover.mjs --sample 20          # 20 redirects, not all 167
 *
 * It checks the things that are cheap to get wrong and expensive to notice
 * late, and it exits non-zero if any of them are wrong.
 *
 * The EMAIL check is first and is not optional. swechha.in carries live Google
 * Workspace mail; a DNS cutover that touches more than the A and www records
 * takes the organisation's email down, and that failure is silent from a
 * browser. If MX has gone, stop and fix DNS before looking at anything else.
 */
import { readFileSync } from 'node:fs'
import { resolveMx, resolveTxt } from 'node:dns/promises'

const args = process.argv.slice(2)
const sampleAt = args.indexOf('--sample')
const SAMPLE = sampleAt === -1 ? null : Number(args[sampleAt + 1])
const ORIGIN = (args.find((a) => a.startsWith('http')) ?? 'https://swechha.in').replace(/\/$/, '')

let failed = 0
const pass = (what, detail = '') => console.log(`  ok    ${what}${detail && '  — ' + detail}`)
const fail = (what, detail = '') => { failed++; console.log(`  FAIL  ${what}${detail && '  — ' + detail}`) }
const warn = (what, detail = '') => console.log(`  warn  ${what}${detail && '  — ' + detail}`)

const head = (path, redirect = 'manual') =>
  fetch(ORIGIN + path, { method: 'GET', redirect }).catch((e) => ({ ok: false, status: 0, error: e }))

console.log(`\nCUTOVER CHECK  ${ORIGIN}\n${'='.repeat(50)}`)

/* ---------------------------------------------------------------- 1. EMAIL */
console.log('\n1. EMAIL — must survive the DNS change')
try {
  const mx = await resolveMx('swechha.in')
  const google = mx.filter((m) => /google|googlemail/i.test(m.exchange))
  if (google.length) pass('MX still points at Google Workspace', `${google.length} of ${mx.length} records`)
  else fail('NO Google MX RECORDS', 'email for @swechha.in is down — fix DNS now')
  const dangling = mx.filter((m) => m.exchange.endsWith('.swechha.in'))
  for (const d of dangling) warn(`MX ${d.priority} ${d.exchange} does not resolve`, 'pre-existing, harmless but untidy')
} catch (e) {
  fail('MX lookup failed', String(e.code ?? e))
}
try {
  const txt = (await resolveTxt('swechha.in')).flat().join(' ')
  txt.includes('v=spf1') ? pass('SPF record intact') : fail('SPF record GONE', 'mail will be marked as spam')
  txt.includes('google-site-verification') ? pass('Google verification TXT intact')
    : warn('Google verification TXT missing', 'Search Console may need re-verifying')
} catch { fail('TXT lookup failed') }

/* ★ THE APP'S OWN MAIL, WHICH IS NOT THE ORGANISATION'S MAIL.
   Ward alerts and the digest send as air@ and hello@swechha.in through Resend,
   and DMARC is p=quarantine — so an unsigned send does not bounce, it silently
   goes to spam, which is the worst failure mode a subscribe box has. Relaxed
   alignment (adkim=r) means the apex DKIM key is what earns the pass; the SPF
   record above stays Google-only on purpose. Verified 2026-08-23; asserted here
   so deleting the key shows up as a FAIL and not as an unread alert. */
try {
  await resolveTxt('resend._domainkey.swechha.in')
  pass('Resend DKIM key published', 'ward alerts and digest align under DMARC')
} catch {
  fail('Resend DKIM key GONE', 'resend._domainkey.swechha.in — app mail will be quarantined')
}
try {
  const bounce = (await resolveTxt('send.swechha.in')).flat().join(' ')
  bounce.includes('v=spf1') ? pass('Resend bounce subdomain SPF intact', 'send.swechha.in')
    : warn('send.swechha.in has no SPF', 'bounce handling degraded, DKIM still carries DMARC')
} catch { warn('send.swechha.in does not resolve', 'Resend Return-Path unconfigured') }

/* ------------------------------------------------------------ 2. THE SITE */
console.log('\n2. THE SITE')
const home = await head('/', 'follow')
home.ok ? pass('homepage 200 over HTTPS') : fail('homepage not OK', `status ${home.status}`)
if (home.url && !home.url.startsWith('https://')) fail('homepage did not end up on HTTPS', home.url)

const www = await fetch(`https://www.swechha.in/`, { redirect: 'manual' }).catch(() => null)
if (!www) warn('www.swechha.in did not resolve', 'add it in Vercel if you want it to work')
else if ([301, 307, 308].includes(www.status)) pass('www redirects to the apex', `${www.status} -> ${www.headers.get('location')}`)
else if (www.status === 200) warn('www serves 200 directly', 'two hostnames serving one site splits SEO — prefer a redirect')
else fail('www is broken', `status ${www.status}`)

for (const r of ['/about', '/work', '/farm', '/act', '/now/air', '/stories', '/publications', '/impact']) {
  const res = await head(r, 'follow')
  res.ok ? pass(`${r} 200`) : fail(`${r} not OK`, `status ${res.status}`)
}

/* ------------------------------------------------------- 3. INDEXABILITY */
console.log('\n3. INDEXABILITY — the SITE_INDEXABLE flip')
const robots = await head('/robots.txt', 'follow')
const robotsBody = robots.ok ? await robots.text() : ''
if (/Disallow:\s*\/\s*$/m.test(robotsBody) && !/Allow:/.test(robotsBody))
  fail('robots.txt still says Disallow: /', 'set SITE_INDEXABLE=true on Vercel production and redeploy')
else if (/Allow:\s*\//.test(robotsBody)) pass('robots.txt allows crawling')
else warn('robots.txt is an unexpected shape', robotsBody.replace(/\s+/g, ' ').slice(0, 90))

const xr = (await head('/', 'follow')).headers?.get('x-robots-tag')
xr ? fail('X-Robots-Tag still set on the homepage', xr) : pass('no blanket X-Robots-Tag on the homepage')

const kx = (await head('/keystatic')).headers?.get('x-robots-tag')
kx?.includes('noindex') ? pass('/keystatic still noindex') : warn('/keystatic has no noindex header', 'expected if the CMS is not deployed')

/* ------------------------------------------------------- 4. SITE_ORIGIN */
console.log('\n4. SITE_ORIGIN — set in Vercel AND as a GitHub variable')
const sm = await head('/sitemap.xml', 'follow')
if (!sm.ok) fail('sitemap.xml not served', `status ${sm.status}`)
else {
  const body = await sm.text()
  if (body.includes('vercel.app')) fail('sitemap advertises the vercel.app alias', 'SITE_ORIGIN is unset or stale on Vercel')
  else if (body.includes(ORIGIN)) pass('sitemap advertises the real domain')
  else warn('sitemap does not mention the origin', 'check SITE_ORIGIN')
}

/* --------------------------------------------------------- 5. REDIRECTS */
console.log('\n5. THE WORDPRESS REDIRECTS')
const map = JSON.parse(readFileSync('docs/legacy/redirect-map.json', 'utf8'))
let live = map.filter((r) => r.to)
/* `/` is in the map with `to: null` because home-to-home is a loop, not a
   mapping — but it obviously answers 200, so it is not a "deliberate 404". */
let dead = map.filter(
  (r) => !r.to && r.from !== '/' && !['attachment', 'soliloquy', 'post_tag', 'pj-categs', 'pl-categs'].includes(r.type),
)
if (SAMPLE) { live = live.slice(0, SAMPLE); dead = dead.slice(0, Math.ceil(SAMPLE / 3)) }

/* Old URLs carry WordPress's trailing slash, so each costs two hops: Next
   normalises the slash away, then the redirect fires. Follow, don't count. */
const check = async (row) => {
  const res = await fetch(ORIGIN + row.from, { redirect: 'follow' }).catch((e) => ({ ok: false, status: 0 }))
  const landed = res.url ? new URL(res.url).pathname : null
  return { row, ok: res.ok && landed === row.to, status: res.status, landed }
}
const results = []
for (let i = 0; i < live.length; i += 8) {
  results.push(...(await Promise.all(live.slice(i, i + 8).map(check))))
}
const bad = results.filter((r) => !r.ok)
bad.length === 0
  ? pass(`all ${results.length} redirects land on their destination with a 200`)
  : fail(`${bad.length} of ${results.length} redirects are wrong`)
for (const b of bad.slice(0, 12)) console.log(`          ${b.row.from}  ->  expected ${b.row.to}, got ${b.landed ?? '-'} (${b.status})`)
if (bad.length > 12) console.log(`          ...and ${bad.length - 12} more`)

const deadRes = []
for (let i = 0; i < dead.length; i += 8) {
  deadRes.push(...(await Promise.all(dead.slice(i, i + 8).map(async (row) => {
    const res = await fetch(ORIGIN + row.from, { redirect: 'follow' }).catch(() => ({ status: 0 }))
    return { row, is404: res.status === 404 }
  }))))
}
const notGone = deadRes.filter((r) => !r.is404)
notGone.length === 0
  ? pass(`all ${deadRes.length} deliberate 404s return 404`)
  : warn(`${notGone.length} URLs meant to 404 do not`, notGone.slice(0, 5).map((r) => r.row.from).join(', '))

/* ------------------------------------------------------------- VERDICT */
console.log('\n' + '='.repeat(50))
if (failed) { console.log(`${failed} check(s) FAILED\n`); process.exit(1) }
console.log('all checks passed\n')
