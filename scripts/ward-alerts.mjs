#!/usr/bin/env node
/**
 * ward-alerts.mjs — the job that actually keeps the promise.
 *
 *   DATA_GOV_IN_KEY=... DATABASE_URL=... RESEND_API_KEY=... \
 *     node scripts/ward-alerts.mjs [--dry-run]
 *
 * Run hourly by .github/workflows/ward-alerts.yml. GitHub Actions rather than
 * Vercel cron because Vercel's Hobby plan caps scheduled functions at one a day.
 *
 * ★ THE RULE THAT DEFINES THIS FILE: ALERT ON A BAND CHANGE, NOT ON A READING.
 * Delhi's air is above the limit most of the year. A job that emailed whenever
 * a monitor was over the limit would send an email an hour, forever, and the
 * page's promise — "one message when something crosses" — would be a lie within
 * a day. So each subscriber carries the band they were last told about, and mail
 * goes out only when the band moves UP from that. Improvements are not mailed:
 * nobody asked to be told the air got better, and every message spent on good
 * news is a message they will not read when it matters.
 *
 * ★ AN ERROR IS NOT A ZERO, AND HERE THAT MATTERS MOST ON THE PAGE.
 * If the feed fails, this job exits without sending anything and without
 * touching `last_alert_band`. It never treats a missing reading as clean air,
 * and it never "catches up" by sending a backlog: a crossing nobody was told
 * about in time is not worth telling them about late.
 *
 * ★ ONE FAILED SEND MUST NOT STOP THE REST. Each recipient is sent
 * independently and a failure is logged and counted, not thrown.
 */
import { neon } from '@neondatabase/serverless';
import { randomBytes, createHash } from 'node:crypto';

const DRY = process.argv.includes('--dry-run');
const KEY = process.env.DATA_GOV_IN_KEY;
const DB = process.env.DATABASE_URL;
const RESEND = process.env.RESEND_API_KEY;
const FROM = process.env.WARD_MAIL_FROM || 'Swechha air <air@swechha.in>';
const SITE = process.env.SITE_ORIGIN || 'https://swechha.in';
const RESOURCE = '3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69';

const miss = [['DATA_GOV_IN_KEY', KEY], ['DATABASE_URL', DB]]
  .concat(DRY ? [] : [['RESEND_API_KEY', RESEND]])
  .filter(([, v]) => !v).map(([k]) => k);
if (miss.length) { console.error(`missing: ${miss.join(', ')}. Refusing to run.`); process.exit(1); }

/* ── CPCB's AQI, transcribed from lib/air.ts and scripts/fetch-air.mjs.
   Inclusive integer bounds — a shared-edge table returns 52 where CPCB's own
   worked example says 51. Self-checked before any network call. ─────────── */
const BANDS = [
  { name: 'Good', idx: [0, 50] }, { name: 'Satisfactory', idx: [51, 100] },
  { name: 'Moderately Polluted', idx: [101, 200] }, { name: 'Poor', idx: [201, 300] },
  { name: 'Very Poor', idx: [301, 400] }, { name: 'Severe', idx: [401, 500] },
];
const BP = {
  'PM10': [[0,50],[51,100],[101,250],[251,350],[351,430],[431,600]],
  'PM2.5': [[0,30],[31,60],[61,90],[91,120],[121,250],[251,380]],
  'NO2': [[0,40],[41,80],[81,180],[181,280],[281,400],[401,600]],
  'OZONE': [[0,50],[51,100],[101,168],[169,208],[209,748],[749,1000]],
  'SO2': [[0,40],[41,80],[81,380],[381,800],[801,1600],[1601,2400]],
  'NH3': [[0,200],[201,400],[401,800],[801,1200],[1201,1800],[1801,2400]],
};
const ALIAS = { 'PM2.5':'PM2.5','PM10':'PM10','NO2':'NO2','SO2':'SO2','OZONE':'OZONE','O3':'OZONE','NH3':'NH3' };
const RANK = new Map(BANDS.map((b, i) => [b.name, i]));

function subIndex(pol, conc) {
  const bp = BP[pol];
  if (!bp || !Number.isFinite(conc) || conc < 0) return null;
  for (let i = 0; i < bp.length; i++) {
    const [bLo, bHi] = bp[i], [iLo, iHi] = BANDS[i].idx;
    if (conc <= bHi) { const lo = i === 0 ? 0 : bLo;
      return Math.round(((iHi - iLo) / (bHi - lo)) * (conc - lo) + iLo); }
  }
  return 500;
}
for (const [c, want] of [[31, 51], [45, 75], [60, 100]]) {
  if (subIndex('PM2.5', c) !== want) {
    console.error(`BREAKPOINT TABLE IS WRONG: PM2.5 ${c} should be ${want}. Refusing to run.`);
    process.exit(1);
  }
}
const bandFor = (a) => (BANDS.find(b => a >= b.idx[0] && a <= b.idx[1]) ?? BANDS[BANDS.length-1]).name;
const MON = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const observedLabel = (raw) => {
  const m = /^(\d{2})-(\d{2})-(\d{4})\s+(\d{2}):(\d{2})/.exec(String(raw ?? '').trim());
  if (!m) return null;
  const n = MON[Number(m[2]) - 1];
  return n ? `${m[4]}:${m[5]} IST, ${Number(m[1])} ${n} ${m[3]}` : null;
};

/* ── THE READING ──────────────────────────────────────────────────────── */
async function readings() {
  const url = `https://api.data.gov.in/resource/${RESOURCE}`
    + `?api-key=${encodeURIComponent(KEY)}&format=json&limit=1000&offset=0`
    + '&filters%5Bcity%5D=Delhi';
  let last = 'not attempted';
  for (let a = 1; a <= 3; a++) {
    if (a > 1) await new Promise(r => setTimeout(r, a * 800));
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
      if (!res.ok) { last = `HTTP ${res.status}`; continue; }
      const b = await res.json();
      if (!Array.isArray(b?.records) || !b.records.length) { last = 'no records'; continue; }
      const by = new Map();
      for (const r of b.records) {
        const st = String(r.station ?? '').trim(); if (!st) continue;
        const raw = String(r.pollutant_id ?? '').trim();
        const pol = ALIAS[raw] ?? ALIAS[raw.toUpperCase()] ?? raw.toUpperCase();
        const v = Number(String(r.avg_value ?? '').trim());
        const sub = Number.isFinite(v) ? subIndex(pol, v) : null;
        if (!by.has(st)) by.set(st, { aqi: -1, stamp: r.last_update ?? null });
        if (sub !== null && sub > by.get(st).aqi) by.get(st).aqi = sub;
      }
      const out = new Map();
      for (const [st, v] of by) if (v.aqi >= 0) {
        out.set(st, { aqi: v.aqi, band: bandFor(v.aqi), observed: observedLabel(v.stamp) });
      }
      if (!out.size) { last = 'no computable station'; continue; }
      return out;
    } catch (e) { last = e.message; }
  }
  // EXIT, do not proceed with a partial or empty map.
  console.error(`Feed unavailable (${last}). Sending nothing and changing nothing.`);
  process.exit(1);
}

/* ── SEND ─────────────────────────────────────────────────────────────── */
async function send(to, subject, text) {
  if (DRY) { console.log(`  [dry-run] would mail ${to}: ${subject}`); return; }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM, to, subject, text }),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`Resend HTTP ${res.status}: ${(await res.text()).slice(0, 160)}`);
}

const alertText = (station, aqi, band, prev, observed, unsubToken) => [
  `${station} is reading ${aqi} — ${band}.`,
  prev ? `It was ${prev} when you were last told.` : `This is the first reading since you subscribed.`,
  observed ? `Observed ${observed}.` : null,
  ``,
  `India's own 24-hour standard is AQI 100. This reading is ${(aqi/100).toFixed(1)} times that on`,
  `the index scale — which is not ${(aqi/100).toFixed(1)} times the pollution, because the index is`,
  `piecewise-linear. The concentration behind it is on the page.`,
  ``,
  `${SITE}/now/air`,
  ``,
  `You will not hear from us again until the band changes again.`,
  unsubToken ? `Stop these: ${SITE}/api/ward/unsubscribe?t=${encodeURIComponent(unsubToken)}` : null,
].filter(l => l !== null).join('\n');

/* ── MAIN ─────────────────────────────────────────────────────────────── */
const now = await readings();
const q = neon(DB);

// Expire unconfirmed rows first. An address somebody typed and never confirmed
// is not a lead, and keeping it is the thing double opt-in exists to prevent.
const expired = await q`DELETE FROM ward_subscriptions
  WHERE status = 'pending' AND created_at < now() - INTERVAL '7 days' RETURNING id`;
if (expired.length) console.log(`expired ${expired.length} unconfirmed subscription(s)`);

const subs = await q`SELECT id, email, station, last_alert_band, unsub_token_hash
  FROM ward_subscriptions WHERE status = 'confirmed'`;
console.log(`${subs.length} confirmed subscription(s); ${now.size} monitors reporting`);

let sent = 0, failed = 0, skippedNoRead = 0, unchanged = 0, improved = 0;

for (const s of subs) {
  const r = now.get(s.station);
  if (!r) { skippedNoRead++; continue; }          // silence, never a zero

  const nowRank = RANK.get(r.band) ?? -1;
  const wasRank = s.last_alert_band ? (RANK.get(s.last_alert_band) ?? -1) : -1;

  if (nowRank <= wasRank) {
    if (nowRank < wasRank) improved++; else unchanged++;
    // Record improvement WITHOUT mailing, so the next worsening alerts again.
    if (nowRank < wasRank && !DRY) {
      await q`UPDATE ward_subscriptions SET last_alert_band = ${r.band} WHERE id = ${s.id}`;
    }
    continue;
  }

  /* ★ EVERY MESSAGE CARRIES A WORKING UNSUBSCRIBE LINK, so a fresh token is
     issued and stored immediately before sending. It has to be minted here
     rather than read from the row because only the HASH is ever stored — the
     token itself is unrecoverable by design, which is the point of hashing it.
     The cost is that an older unsubscribe link stops working once a newer
     message is sent; the newest message always has a live one. */
  let unsubToken = null;
  if (!DRY) {
    unsubToken = randomBytes(32).toString('base64url');
    const h = createHash('sha256').update(unsubToken).digest('hex');
    await q`UPDATE ward_subscriptions SET unsub_token_hash = ${h} WHERE id = ${s.id}`;
  }

  try {
    await send(s.email, `${s.station.replace(/,\s*Delhi\s*-\s*/, ' · ')}: ${r.band.toLowerCase()} (${r.aqi})`,
      alertText(s.station, r.aqi, r.band, s.last_alert_band, r.observed, unsubToken));
    if (!DRY) {
      await q`UPDATE ward_subscriptions
        SET last_alert_band = ${r.band}, last_alert_at = now() WHERE id = ${s.id}`;
    }
    sent++;
  } catch (e) {
    // ONE BAD ADDRESS MUST NOT STOP THE QUEUE. Not recorded as sent, so the
    // next run retries this crossing.
    failed++;
    console.error(`  send failed for subscription ${s.id}: ${e.message}`);
  }
}

console.log(`sent ${sent}, failed ${failed}, unchanged ${unchanged}, improved ${improved}, no reading ${skippedNoRead}`);
if (DRY) console.log('dry run — nothing was mailed and nothing was written.');
