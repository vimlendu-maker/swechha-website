#!/usr/bin/env node
/**
 * verify-air-crosscheck.mjs — the tier AD-42 said did not exist. (AD-42D)
 *
 *   WAQI_TOKEN=... node scripts/verify-air-crosscheck.mjs
 *
 * WHY THIS EXISTS. For eleven weeks this site published every air figure at
 * roughly DOUBLE, because it ran CPCB's already-computed sub-indexes through
 * the breakpoint table a second time. Every gate in the repo passed the whole
 * time. `selfCheck()` proved the table was correct; nothing asked whether the
 * table should be consulted at all. AD-42.9: *"the cross-check tier that would
 * have caught this on day one does not exist yet."* This is it.
 *
 * ★ IT WOULD HAVE CAUGHT IT ON DAY ONE. During the bug our city figure ran at
 * ratio ~2.00 against CPCB's own published bulletin. The gate below trips at
 * 1.15.
 *
 * TWO TIERS, DOING DIFFERENT JOBS
 * ───────────────────────────────
 * 1. CPCB'S OWN BULLETIN — the hard gate. Same publisher, same scale, same
 *    definition, so there is NO legitimate reason for a gap. Any drift is our
 *    bug. Compared against `city_mean`, which exists for exactly this and is
 *    never the page's headline (AD-42C).
 *
 * 2. WAQI — adjudication of SUSPECT readings only, never a gate. WAQI is the
 *    US EPA scale on a different pipeline; `fetch-crosscheck.mjs` measured the
 *    same station 180 points apart and is right to refuse to reconcile. A 2x
 *    error hides inside noise that large, which is why WAQI could not have
 *    caught the double conversion and why it is not the gate here. What it CAN
 *    do is answer a narrower question about one station: when our reading rests
 *    on a single gas channel above clean particulates, does an independent
 *    network see anything like it?
 *
 * ★ THE DISTANCE GUARD IS THE WHOLE TRICK, AND IT IS NOT OPTIONAL. WAQI's feed
 * endpoint ALWAYS returns a station. Asked for Leh (34.15, 77.58) it returns
 * Ngari, Tibet — 330km away, across an international border. Asked for "leh" by
 * name it returns Rue Lafaurie, Le Havre, FRANCE. Either would have "confirmed"
 * or "refuted" Leh with a monitor that has never seen Ladakh. So every WAQI
 * answer is checked against the coordinates it actually came from, and anything
 * beyond MAX_KM is NO COVERAGE — which is a real verdict, not a failure.
 *
 *   A cross-check that cannot say "I don't know" is not a cross-check.
 *
 * EXIT CODES: 0 all gates pass · 1 a gate failed · 2 could not run at all.
 */
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';

/** Great-circle distance in km. Transcribed from lib/air.ts — the other
    generators transcribe rather than import across the .mjs/.ts boundary. */
function km(aLat, aLng, bLat, bLng) {
  const R = 6371, rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(bLat - aLat), dLng = rad(bLng - aLng);
  const x = Math.sin(dLat / 2) ** 2
    + Math.cos(rad(aLat)) * Math.cos(rad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

const OUT = resolve(process.env.CROSSCHECK_OUT || 'data/air-crosscheck-verdicts.json');
const INDIA = resolve('data/air-india.json');
const DELHI = resolve('data/air-delhi.json');
const TOKEN = process.env.WAQI_TOKEN;

/* ── THRESHOLDS, AND WHY EACH NUMBER ─────────────────────────────────────
   RATIO_MAX / RATIO_MIN. Measured 25 August 2026 against CPCB's bulletin
   across 245 matched cities: MAE 1.7, mean ratio 1.00. The double conversion
   would have shown 2.00. A band of ±15% is far outside the observed spread
   and far inside the failure it exists to catch. It is deliberately not
   tighter: CPCB weights its city mean by 2km-grid population and we cannot,
   and the bulletin's hour need not be ours.

   MIN_MATCHED. A gate computed over four cities is not a gate. If the parse
   degrades — CPCB changes the PDF layout — the run must FAIL rather than
   quietly pass on a handful of rows.

   MAX_KM. WAQI stations are urban. 25km keeps a Delhi query inside Delhi.
   ──────────────────────────────────────────────────────────────────────── */
const RATIO_MAX = 1.15;
const RATIO_MIN = 0.85;
const MIN_MATCHED = 100;
const MAX_KM = 25;

const fail = (m) => { console.error(m); process.exit(2); };
const J = (p) => JSON.parse(readFileSync(p, 'utf8'));

/* ── TIER 1: CPCB'S OWN DAILY BULLETIN ───────────────────────────────────
   cpcb.nic.in/aqi_report.php 302s to the current day's PDF at a dated,
   predictable path. Text is extracted with pdftotext -layout (poppler), which
   this repo already depends on for the brand assets. The layout mode matters:
   the table is column-aligned, and without it the columns interleave.
   ──────────────────────────────────────────────────────────────────────── */
const BULLETIN = 'https://cpcb.nic.in/aqi_report.php';

async function fetchBulletin() {
  const res = await fetch(BULLETIN, { redirect: 'follow', signal: AbortSignal.timeout(60000) });
  if (!res.ok) throw new Error(`bulletin HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.subarray(0, 4).toString() !== '%PDF') throw new Error('bulletin is not a PDF');
  const tmp = resolve(process.env.TMPDIR || '/tmp', `cpcb-bulletin-${buf.length}.pdf`);
  writeFileSync(tmp, buf);
  let text;
  try {
    text = execFileSync('pdftotext', ['-layout', tmp, '-'], { encoding: 'utf8', maxBuffer: 32 << 20 });
  } catch (e) {
    throw new Error(`pdftotext failed (${e.message}). Install poppler-utils.`);
  }
  return { text, url: res.url, bytes: buf.length };
}

/* One row: "  73    Delhi    Moderate    101    PM2.5    44/46".
   The band names are the anchor — they are the only closed vocabulary on the
   line, so matching on them rather than on whitespace keeps two-word cities
   ("Sri Ganganagar") and multi-pollutant cells ("PM2.5, PM10, SO2") intact. */
const ROW = /^\s*(\d+)\s+(.+?)\s{2,}(Good|Satisfactory|Moderate|Poor|Very Poor|Severe)\s+(\d+)\s+(.+?)\s{2,}(\d+)\s*\/\s*(\d+)\s*$/;

function parseBulletin(text) {
  const cities = new Map();
  for (const line of text.split('\n')) {
    const m = ROW.exec(line.replace(/\s+$/, ''));
    if (!m) continue;
    cities.set(m[2].trim().toLowerCase(), {
      city: m[2].trim(), band: m[3], aqi: Number(m[4]),
      pollutant: m[5].trim(), participated: Number(m[6]), total: Number(m[7]),
    });
  }
  const head = /Air Quality Index on (.+?)\s*$/m.exec(text);
  return { cities, heading: head ? head[1].trim() : null };
}

/* ── TIER 2: WAQI, FOR SUSPECT READINGS ONLY ─────────────────────────────── */
async function waqiAt(lat, lng) {
  const url = `https://api.waqi.info/feed/geo:${lat};${lng}/?token=${encodeURIComponent(TOKEN)}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!res.ok) return { ok: false, why: `HTTP ${res.status}` };
  const b = await res.json();
  if (b.status !== 'ok' || !b.data || typeof b.data === 'string') {
    return { ok: false, why: typeof b.data === 'string' ? b.data : b.status };
  }
  const g = b.data.city?.geo;
  if (!Array.isArray(g) || g.length !== 2) return { ok: false, why: 'no coordinates on the answer' };
  /* ★ THE GUARD. Without this the next four lines are a lie. */
  const away = Math.round(km(lat, lng, g[0], g[1]));
  if (away > MAX_KM) {
    return { ok: false, why: `nearest WAQI station is ${away}km away (${b.data.city?.name})`,
      noCoverage: true, km: away, name: b.data.city?.name ?? null };
  }
  const iaqi = Object.fromEntries(Object.entries(b.data.iaqi || {}).map(([k, v]) => [k, v.v]));
  return { ok: true, km: away, name: b.data.city?.name ?? null, aqi: b.data.aqi,
    dominant: b.data.dominentpol ?? null, iaqi, observed: b.data.time?.s ?? null };
}

/* WAQI's keys are lowercase and its ozone is `o3`. Ours is CPCB's spelling. */
const TO_WAQI = { 'PM2.5': 'pm25', 'PM10': 'pm10', 'NO2': 'no2', 'SO2': 'so2', 'OZONE': 'o3', 'NH3': 'nh3', 'CO': 'co' };

/**
 * Adjudicate one suspect city.
 *
 * ★ WHAT IS AND IS NOT COMPARABLE. The two scales differ, so the MAGNITUDES
 * cannot be compared and this does not try to. What survives the scale
 * difference is ORDERING: which pollutant is worst at that station, and
 * whether the station is dirty at all. Those are the two questions a stuck or
 * miscalibrated channel gets wrong, so those are the two asked.
 */
function adjudicate(ours, waqi) {
  if (!waqi.ok) {
    return { verdict: 'NO COVERAGE', detail: waqi.why,
      note: 'No independent monitor is near enough to speak to this reading. '
        + 'The doubt stands, unresolved — which is the honest outcome, not a pass.' };
  }
  const key = TO_WAQI[ours.governing];
  const theirSub = key ? waqi.iaqi[key] : undefined;
  const theirDominant = waqi.dominant;
  const agreesOnPollutant = key && theirDominant === key;

  if (agreesOnPollutant) {
    return { verdict: 'CORROBORATED', detail:
      `WAQI's nearest station (${waqi.km}km) also puts ${ours.governing} worst.`,
      theirAqi: waqi.aqi, theirSub: theirSub ?? null, theirDominant };
  }
  /* Their whole reading sits below where our single channel does, on a scale
     that generally runs HIGHER than CPCB's in this range. That is evidence. */
  if (typeof waqi.aqi === 'number' && waqi.aqi < ours.aqi / 2) {
    return { verdict: 'CONTRADICTED', detail:
      `WAQI's nearest station (${waqi.km}km) reads ${waqi.aqi} overall, worst on `
      + `${theirDominant ?? 'nothing stated'}, against our ${ours.aqi} on ${ours.governing}.`,
      theirAqi: waqi.aqi, theirSub: theirSub ?? null, theirDominant };
  }
  return { verdict: 'INCONCLUSIVE', detail:
    `WAQI's nearest station (${waqi.km}km) reads ${waqi.aqi} worst on `
    + `${theirDominant ?? 'nothing stated'}; we read ${ours.aqi} on ${ours.governing}. `
    + 'Different scales, so the gap alone settles nothing.',
    theirAqi: waqi.aqi, theirSub: theirSub ?? null, theirDominant };
}

/* ── RUN ─────────────────────────────────────────────────────────────────── */
if (!existsSync(INDIA)) fail(`${INDIA} is missing. Run fetch-india first.`);
const india = J(INDIA);
const delhi = existsSync(DELHI) ? J(DELHI) : null;

let bulletin;
try {
  const raw = await fetchBulletin();
  bulletin = { ...parseBulletin(raw.text), url: raw.url };
  console.log(`bulletin: ${bulletin.cities.size} cities — ${bulletin.heading ?? 'no heading found'}`);
  console.log(`          ${bulletin.url}`);
} catch (e) {
  fail(`CANNOT RUN: the CPCB bulletin could not be read — ${e.message}\n`
    + 'This is the gate that catches a repeat of the double conversion. '
    + 'A run that cannot perform it has not passed it.');
}
if (bulletin.cities.size < MIN_MATCHED) {
  fail(`CANNOT RUN: parsed only ${bulletin.cities.size} cities from the bulletin. `
    + 'The PDF layout has probably changed; fix the parser rather than lowering the bar.');
}

/* TIER 1 */
const rows = [];
for (const c of india.cities) {
  const b = bulletin.cities.get(c.city.trim().toLowerCase());
  if (!b) continue;
  const ours = c.meanAqi;                      // CPCB's definition, ours computed
  if (typeof ours !== 'number' || !b.aqi) continue;
  rows.push({ city: c.city, cpcb: b.aqi, ours, ratio: ours / b.aqi,
    cpcbStations: `${b.participated}/${b.total}`, ourStations: c.stations,
    cpcbPollutant: b.pollutant, ourPollutant: c.governing });
}
if (rows.length < MIN_MATCHED) {
  fail(`CANNOT RUN: only ${rows.length} cities matched the bulletin by name (need ${MIN_MATCHED}).`);
}
const mae = rows.reduce((s, r) => s + Math.abs(r.ours - r.cpcb), 0) / rows.length;
const ratio = rows.reduce((s, r) => s + r.ratio, 0) / rows.length;
const bias = rows.reduce((s, r) => s + (r.ours - r.cpcb), 0) / rows.length;

console.log(`\nTIER 1 — our city_mean vs CPCB's own bulletin, ${rows.length} cities matched`);
console.log(`  MAE ${mae.toFixed(1)}   bias ${bias >= 0 ? '+' : ''}${bias.toFixed(1)}   mean ratio ${ratio.toFixed(2)}`);

let bad = 0;
if (ratio > RATIO_MAX || ratio < RATIO_MIN) {
  console.error(`\n  FAIL: mean ratio ${ratio.toFixed(2)} is outside ${RATIO_MIN}–${RATIO_MAX}.`);
  console.error('  Our city figure and CPCB\'s are the same statistic from the same rows.');
  console.error('  There is no legitimate reason for a gap this size — this is a parser bug.');
  console.error(`  A ratio near 2.00 means the sub-indexes are being converted a second time.`);
  bad++;
}
const worst = [...rows].sort((a, b) => Math.abs(b.ours - b.cpcb) - Math.abs(a.ours - a.cpcb)).slice(0, 5);
console.log('  widest gaps (informational — station coverage differs city to city):');
for (const r of worst) {
  console.log(`    ${r.city.padEnd(18)} CPCB ${String(r.cpcb).padStart(3)} (${r.cpcbStations})`
    + `   ours ${String(r.ours).padStart(3)} (${r.ourStations})`);
}

/* Delhi is named separately: it is the figure on the homepage. */
const dRow = rows.find(r => r.city.toLowerCase() === 'delhi');
if (dRow && delhi) {
  console.log(`\n  DELHI  CPCB bulletin ${dRow.cpcb} · our city_mean ${dRow.ours} `
    + `· our published headline ${delhi.city_reading.aqi} (${delhi.city_reading.station})`);
}

/* TIER 2 */
const suspects = india.cities.filter(c => c.suspect);
const verdicts = [];
console.log(`\nTIER 2 — WAQI adjudication of ${suspects.length} suspect reading(s)`);
if (!TOKEN) {
  console.log('  SKIPPED: WAQI_TOKEN is not set. Tier 1 still ran; tier 2 is advisory.');
} else {
  for (const c of suspects) {
    const st = (india.stations_index || []).find?.(s => s.station === c.station);
    const lat = c.lat ?? st?.lat, lng = c.lng ?? st?.lng;
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      verdicts.push({ city: c.city, station: c.station, ours: c.aqi, governing: c.governing,
        verdict: 'NO COVERAGE', detail: 'no coordinates on our own row' });
      continue;
    }
    const w = await waqiAt(lat, lng);
    const v = adjudicate(c, w);
    verdicts.push({ city: c.city, station: c.station, ours: c.aqi, governing: c.governing,
      pmSub: c.pmSub, waqiStation: w.name ?? null, waqiKm: w.km ?? null, ...v });
    console.log(`  ${v.verdict.padEnd(13)} ${c.city} — ours ${c.aqi} on ${c.governing}`);
    console.log(`                ${v.detail}`);
  }
}

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify({
  role: 'cross-check of the published air figures. Tier 1 is a gate; tier 2 is adjudication.',
  ran: { epochMs: Date.now() },
  tier1: {
    source: { name: 'CPCB daily AQI bulletin', url: bulletin.url, heading: bulletin.heading,
      note: 'CPCB\'s own published city figures — same publisher, same scale, same definition '
        + 'as our city_mean, so any gap is our bug and not a methodology difference.' },
    compared: 'our city_mean (NOT the published headline, which is the worst monitor)',
    matched: rows.length, mae: +mae.toFixed(2), bias: +bias.toFixed(2), ratio: +ratio.toFixed(3),
    thresholds: { ratioMin: RATIO_MIN, ratioMax: RATIO_MAX, minMatched: MIN_MATCHED },
    passed: !bad, cities: rows.map(r => ({ ...r, ratio: +r.ratio.toFixed(3) })),
  },
  tier2: {
    source: { name: 'World Air Quality Index project (WAQI)', scale: 'US EPA 2016',
      note: 'Advisory only, never a gate: a different scale on a different pipeline cannot '
        + 'detect a factor-of-two error. Used to ask whether an independent network sees the '
        + 'same pollutant worst at a station whose reading rests on one channel.' },
    guard: { maxKm: MAX_KM,
      why: 'WAQI always returns a station. For Leh it returns Ngari, Tibet, 330km away; by '
        + 'name it returns Le Havre, France. Unguarded, either would have settled the question '
        + 'with a monitor that has never seen the place.' },
    verdicts,
  },
}, null, 2) + '\n');
console.log(`\nwrote ${OUT}`);

if (bad) {
  console.error(`\nREFUSING: ${bad} gate(s) failed. The published figures disagree with CPCB's own.`);
  process.exit(1);
}
console.log('all gates pass.');
