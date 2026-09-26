#!/usr/bin/env node
/**
 * fetch-india.mjs — the national picture, on the same scale as the hero.
 *
 *   DATA_GOV_IN_KEY=... node scripts/fetch-india.mjs [out.json]
 *
 * WHY THIS IS A SEPARATE FILE FROM air-delhi.json. The hero prints one Delhi
 * reading; this prints where that reading SITS. The two must be computed the
 * same way or the comparison is meaningless, so the method here is transcribed
 * from fetch-air.mjs verbatim.
 *
 * ★★ THE FEED PUBLISHES SUB-INDEXES, NOT CONCENTRATIONS — corrected
 * 25 August 2026, along with fetch-air.mjs and lib/air.ts. `avg_value` is
 * CPCB's own index and must never be converted. Read as µg/m³ it roughly
 * doubled every city in this table.
 *
 * THE RULE, AND WHAT IT COSTS — AD-42C, owner's ruling of 25 August 2026.
 * A station's AQI is its WORST sub-index. The figure RANKED here is the city's
 * WORST MONITOR, not the mean of its monitors, because the site's headline is
 * the worst monitor and a table that ranked cities by a different statistic
 * than the hero prints would contradict it on the same screen.
 *
 * ★ THIS IS NOT CPCB'S CITY DEFINITION AND THE TABLE SAYS SO. CPCB takes the
 * worst WITHIN a station and the average ACROSS them. Measured against CPCB's
 * own published figures for 73 cities on 25 August 2026, worst-station runs
 * +15.7 biased at a ratio of 1.25, where the mean runs at 1.00 with zero bias.
 * So these numbers will sit ABOVE the city figures CPCB publishes, by about a
 * quarter, and a reader checking a row against CPCB's city ticker will find a
 * gap. That is a deliberate editorial choice — the subject is limits broken at
 * named places — and it is only defensible while every row names the monitor
 * it came from and the count it was chosen from. CPCB's mean is carried on
 * every row as `meanAqi` so the comparable number is never more than a field
 * away, and so a return of the double-conversion bug stays visible.
 *
 * ★ COMPARABILITY IS NOT ASSUMED, IT IS PUBLISHED. Cities carry wildly
 * different monitor counts — Delhi had 43 and most cities have one. A city
 * with one monitor is not measured worse or better, it is measured LESS, and
 * `stations` is carried on every row so the page can say so.
 *
 * ★ AN ERROR IS NOT A ZERO (D-16.4). data.gov.in answers a request with no
 * `offset` with HTTP 200 and an empty `records` array — a CSV-shaped lie that
 * a careless parser reads as "no pollution in India today". The shape is
 * validated, an empty result is fatal, and a failed run leaves the previous
 * file alone.
 */
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fetchUpstream } from './lib/fetch-cpcb.mjs';
import {
  fetchCaaqms, assessCaaqms, newestStamp, newerStamp,
  SERVED_BY_CAAQMS, SERVED_BY_MIRROR, parseStamp,
} from './lib/fetch-caaqms.mjs';
import { recordObservation } from './lib/air-history.mjs';
/* isStuck, with the self-check that runs on import. This file used to carry
   its own copy and NOT the test — see scripts/lib/air-rules.mjs (AD-47). */
import { isStuck, rankableFigure, gasUncorroborated, GASES } from './lib/air-rules.mjs';

const KEY = process.env.DATA_GOV_IN_KEY;
const OUT = resolve(process.argv[2] || 'data/air-india.json');
const RESOURCE = '3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69';

if (!KEY) {
  console.error('DATA_GOV_IN_KEY is not set. Refusing to run.\n' +
    'Register at https://data.gov.in/ — never commit the key.');
  process.exit(1);
}

/* ── CPCB National AQI, transcribed from scripts/fetch-air.mjs ─────────── */
const BANDS = [
  { name: 'Good', idx: [0, 50] },
  { name: 'Satisfactory', idx: [51, 100] },
  { name: 'Moderately Polluted', idx: [101, 200] },
  { name: 'Poor', idx: [201, 300] },
  { name: 'Very Poor', idx: [301, 400] },
  { name: 'Severe', idx: [401, 500] },
];
const BREAKPOINTS = {
  'PM10':  [[0,50],[51,100],[101,250],[251,350],[351,430],[431,600]],
  'PM2.5': [[0,30],[31,60],[61,90],[91,120],[121,250],[251,380]],
  'NO2':   [[0,40],[41,80],[81,180],[181,280],[281,400],[401,600]],
  'OZONE': [[0,50],[51,100],[101,168],[169,208],[209,748],[749,1000]],
  'SO2':   [[0,40],[41,80],[81,380],[381,800],[801,1600],[1601,2400]],
  'NH3':   [[0,200],[201,400],[401,800],[801,1200],[1201,1800],[1801,2400]],
};
const ALIAS = { 'PM2.5':'PM2.5','PM10':'PM10','NO2':'NO2','SO2':'SO2',
  'OZONE':'OZONE','O3':'OZONE','NH3':'NH3' };
// NOTHING IS EXCLUDED. CO and Pb were dropped on the reading that the feed
// published concentrations in an unstated unit. It publishes sub-indexes, so
// every pollutant it reports is already on one scale and belongs in the max.
const EXCLUDED = [];
const AQI_LIMIT = 100;   // AQI 100 IS the NAAQS 24-hour standard.

/** The breakpoint table, run BACKWARDS — the only direction still used here. */
function impliedConcentration(pollutant, sub) {
  const bp = BREAKPOINTS[pollutant];
  if (!bp || sub === null || Number.isNaN(sub) || sub < 0) return null;
  for (let i = 0; i < bp.length; i++) {
    const [bLo, bHi] = bp[i], [iLo, iHi] = BANDS[i].idx;
    if (sub <= iHi) {
      const lo = i === 0 ? 0 : bLo;
      return Math.round((lo + ((sub - iLo) * (bHi - lo)) / (iHi - iLo)) * 10) / 10;
    }
  }
  return bp[bp.length - 1][1];
}
const bandFor = (aqi) => BANDS.find(b => aqi >= b.idx[0] && aqi <= b.idx[1]) || BANDS[BANDS.length - 1];

/* ── SELF-CHECK, on the direction this file uses. See fetch-air.mjs. ───── */
for (const [sub, want] of [[51, 31], [100, 60], [225, 98]]) {
  const got = impliedConcentration('PM2.5', sub);
  if (got === null || Math.abs(got - want) > 0.2) {
    console.error(`BREAKPOINT TABLE IS WRONG: PM2.5 sub-index ${sub} should imply ~${want}, got ${got}. Refusing to run.`);
    process.exit(1);
  }
}

const num = (v) => {
  const s = String(v ?? '').trim();
  if (!s || s === 'NA' || s === '-') return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};

/* ── FETCH ───────────────────────────────────────────────────────────────
   ★★ THE UPSTREAM'S PAGING IS UNSTABLE, AND IT WAS SILENTLY EATING ROWS.
   This loop used to page at limit=1000. Measured 25 August 2026: it collected
   3,451 rows and `total` said 3,451 — the existing check passed — but only
   3,386 of those rows were DISTINCT (station, pollutant) pairs. Sixty-five
   rows arrived twice and sixty-five never arrived at all. The result set is
   not stably ordered, so `offset` does not mean what it looks like it means.

   The damage is invisible in aggregate and severe per station. Leh lost its
   PM10, OZONE and NO2 channels and published as 13 "Good" on the PM2.5 that
   survived — while the city-filtered query for the same station, in the same
   second, returned all seven channels and an AQI of 195.

   COUNTING ROWS CANNOT DETECT THIS. `rows.length === total` was true. The
   integrity check has to be on DISTINCT KEYS, which is what refusing below
   actually tests. Bigger pages measured clean (2,000 and 4,000 both lost
   nothing), so we ask for the whole set in one request and still verify.
   ──────────────────────────────────────────────────────────────────────── */
async function fetchPage(offset, limit) {
  const url = `https://api.data.gov.in/resource/${RESOURCE}`
    + `?api-key=${encodeURIComponent(KEY)}&format=json&limit=${limit}&offset=${offset}`;
  /* fetch-first, curl-fallback — scripts/lib/fetch-cpcb.mjs. The 60s bound
     never covered the CONNECT phase anyway: undici's own 10s connect default
     is what actually killed these runs, which is the whole reason the
     fallback exists. */
  const res = await fetchUpstream(url, { timeoutMs: 60000 });
  if (!res.ok) throw new Error(`upstream HTTP ${res.status}`);
  const body = await res.json();
  if (!Array.isArray(body?.records)) throw new Error('unexpected response shape — no `records` array');
  return body;
}
/* ★ THE OBSERVATION HOUR IS PART OF THE KEY — AD-50, 29 August 2026.
   Without it, a response spanning TWO hours (which the mirror serves while
   catching up) shows every pair twice: distinct=308 against total=616 reads as
   "half the rows were lost to unstable paging". In the Delhi fetcher that
   refused one run outright; HERE it is worse, because the paging loop RETRIES
   while distinct < total — so a two-hour response would retry through every
   backoff and then fail, at exactly the moment fresh data arrived.
   With the hour in the key a two-hour response is complete and passes, while
   duplicates of the same station, pollutant AND hour still collapse and still
   trip the guard, which is the loss this key exists to catch. */
const KEY_OF = (r) => `${r.station}|${r.pollutant_id}|${r.last_update}`;

let rows = [];
let attempt = 0;
/* ── RETRY SPACED OVER MINUTES, NOT MILLISECONDS ─────────────────────────
   The previous policy was three attempts 800ms apart — about 33 seconds end
   to end, almost all of it spent inside three identical 10-second connect
   timeouts. A source that is briefly unreachable is still unreachable 800ms
   later, so the retry was decorative: it turned one failure into three.
   The ladder then grew to ~four minutes when those connect timeouts were the
   only defence. Now that each attempt already tries TWO transports (fetch,
   then curl -4 — scripts/lib/fetch-cpcb.mjs), a failed attempt means the
   source itself was silent, not that one socket path stalled, so three
   spaced retries (~78s) are enough and stay well inside the hourly cadence. */
const BACKOFF_MS = [3000, 15000, 60000];
const ATTEMPTS = BACKOFF_MS.length + 1;
let lastError = null;
/* Did the upstream ever actually reply? A short set is OUR problem to report
   loudly; a socket that never opened is not. */
let everAnswered = false;
/* ★ REPLAY — see the same note in fetch-air.mjs. AIR_FIXTURE points at a
   captured response from this resource so that a change to HOW a city's
   figure is SELECTED can be judged against a fixed hour, and so this job can
   be re-run from a network that cannot hold a connection to data.gov.in.
   The integrity check below still runs against the capture's own `total`. */
if (process.env.AIR_FIXTURE) {
  const raw = JSON.parse(readFileSync(process.env.AIR_FIXTURE, 'utf8'));
  rows = raw.records || raw;
  const distinct = new Set(rows.map(KEY_OF)).size;
  const total = Number(raw.total);
  if (Number.isFinite(total) && distinct < total) {
    console.error(`INTEGRITY: capture holds ${distinct} distinct of ${total} expected. Refusing.`);
    process.exit(1);
  }
  console.log(`REPLAY: ${rows.length} rows (${distinct} distinct) from ${process.env.AIR_FIXTURE} (no network)`);
}

/* ── SOURCE SELECTION — CAAQMS LIVE FEED FIRST, MIRROR AS FALLBACK (AD-44) ──
   The mirror above lags CPCB's own publication by up to ten measured hours
   (02:00 IST served at 12:04 IST, 26 August 2026). CPCB's CAAQMS feed is
   keyless, national, and one observation hour behind the clock, with
   IDENTICAL semantics — see scripts/lib/fetch-caaqms.mjs. It serves this job
   when it passes its gates (≥300 stations, a parseable stamp, and the
   per-station integrity check against CPCB's own <Air_Quality_Index>).
   The mirror path below is fully intact and runs when CAAQMS fails — or when
   a one-row probe of the mirror shows a FRESHER stamp, the safety net that
   stops an odd day from making this table less current than before AD-44.
   One run is served by ONE source, named in `source.served_by`; never both. */
let SERVED = null;
let caaqms = null, caaqmsWhy = null, caaqmsIntegrityRefusal = false;
if (!process.env.AIR_FIXTURE) {
  try {
    const feed = await fetchCaaqms({ timeoutMs: 60000 });
    const verdict = assessCaaqms(feed, { minStations: 300 });
    if (!verdict.ok) {
      caaqmsWhy = verdict.why;
      caaqmsIntegrityRefusal = verdict.kind === 'integrity';
    } else {
      caaqms = { rows: feed.rows, stamp: newestStamp(feed.stamps),
        integrity: verdict.integrity, stationCount: feed.stationCount };
      console.log(`CAAQMS: ${feed.stationCount} stations, ${feed.rows.length} rows, `
        + `observed ${caaqms.stamp}; integrity ${verdict.integrity.mismatched} of `
        + `${verdict.integrity.comparable} stations disagree with CPCB's own AQI`);
    }
  } catch (e) {
    caaqmsWhy = `did not answer: ${e.cause?.message ? `${e.message} (${e.cause.message})` : e.message}`;
  }
  if (caaqmsWhy) {
    (caaqmsIntegrityRefusal ? console.error : console.warn)(
      `CAAQMS ${caaqmsIntegrityRefusal ? 'REFUSED — ' : 'unavailable — '}${caaqmsWhy}. `
      + 'Falling back to the data.gov.in mirror.');
  }
  if (caaqms) {
    /* The freshness safety net, priced honestly: ONE one-row probe of the
       mirror, not the full national set with its retry ladder. The full
       mirror fetch runs only if the probe's stamp is strictly newer — which
       the measured lag says should never happen. A silent probe is ignored:
       CAAQMS is already in hand. */
    let probeStamp = null;
    try { probeStamp = (await fetchPage(0, 1)).records?.[0]?.last_update ?? null; } catch { /* probe only */ }
    if (probeStamp && newerStamp(probeStamp, caaqms.stamp) === 'a') {
      console.warn(`mirror probe stamp ${probeStamp} is FRESHER than CAAQMS's ${caaqms.stamp} — `
        + 'fetching the full mirror set instead');
    } else {
      rows = caaqms.rows; SERVED = 'caaqms';
      if (probeStamp) console.log(`freshness: CAAQMS ${caaqms.stamp} vs mirror ${probeStamp} — CAAQMS serves`);
    }
  }
}
for (; !rows.length;) {
  attempt++;
  try {
    const probe = await fetchPage(0, 1);
    const total = Number(probe.total);
    if (!Number.isFinite(total) || total <= 0) throw new Error(`upstream reports total=${probe.total}`);
    // One request for the whole set, with headroom, so there are no page
    // boundaries for the upstream to lose rows across.
    const body = await fetchPage(0, Math.min(total + 500, 20000));
    rows = body.records;
    everAnswered = true;
    const distinct = new Set(rows.map(KEY_OF)).size;
    process.stdout.write(`fetched ${rows.length} rows, ${distinct} distinct of ${total} expected\n`);
    // ROWS LOST IS THE FAILURE. Duplicates are harmless (same values); a
    // MISSING row silently strips a station of a channel and can flip its
    // governing pollutant, which is how Leh became "Good".
    if (distinct >= total) break;
    console.warn(`  integrity: ${total - distinct} row(s) lost to unstable paging — retrying`);
  } catch (e) {
    lastError = e.cause?.message ? `${e.message} (${e.cause.message})` : e.message;
    console.warn(`  attempt ${attempt} failed: ${lastError}`);
  }
  if (attempt >= ATTEMPTS) {
    /* A CAAQMS parse already in hand outranks a mirror that will not deliver.
       This branch is reachable with `caaqms` set only when the freshness
       probe said the mirror was newer and the full fetch then failed — serve
       the data we hold rather than exiting over a source we did not need. */
    if (caaqms) {
      console.warn('the mirror probed fresher but would not deliver a full set — CAAQMS serves this run');
      rows = caaqms.rows; SERVED = 'caaqms';
      break;
    }
    /* ── AN UPSTREAM THAT WILL NOT ANSWER IS NOT A DEFECT IN THIS REPO ────
       Exit 75 (EX_TEMPFAIL), not 1. The distinction matters because of who
       reads it: exit 1 turns an hourly job red and emails a human, and this
       upstream refuses roughly half the hourly runs — measured 23–26 August
       2026. A person emailed every other hour about someone else's flaky
       server stops reading the emails, and then does not see the one that
       matters. Nothing was written, the previous reading stands with its age
       printed beside it, and that IS the designed failure mode (D-21.5).
       The caller decides what to do with 75; see air-hourly.yml. A genuinely
       WRONG answer — a short or malformed set — still exits 1 below, because
       that is a defect and it is ours.
       Since AD-44 this branch means BOTH sources failed. 75 still requires
       both to have been SILENT: if the CAAQMS refusal was the INTEGRITY gate,
       a source answered and OUR parse of it disagreed with CPCB's own
       numbers, which is potentially our defect and exits 1. */
    console.error(`no source would deliver: CAAQMS (${caaqmsWhy ?? 'not attempted'}); `
      + `mirror gave up after ${ATTEMPTS} attempts over `
      + `${Math.round(BACKOFF_MS.reduce((a, b) => a + b, 0) / 1000)}s. `
      + 'Leaving the previous file alone — a partial snapshot publishes wrong readings, '
      + 'not missing ones, which is worse.');
    console.error(`last mirror error: ${lastError ?? 'unknown'}`);
    process.exit(everAnswered || caaqmsIntegrityRefusal ? 1 : 75);
  }
  const wait = BACKOFF_MS[Math.min(attempt - 1, BACKOFF_MS.length - 1)];
  console.warn(`  retrying in ${wait / 1000}s`);
  await new Promise(r => setTimeout(r, wait));
}
if (!rows.length) { console.error('upstream returned no records at all. Refusing to publish an absence.'); process.exit(1); }
if (!SERVED) SERVED = 'mirror'; // the loop above delivered, or AIR_FIXTURE replayed mirror-shape rows

/* ── ONE SNAPSHOT MEANS ONE HOUR — AD-50 ──────────────────────────────────
   The national page states that every city in the table was read at one hour.
   Across a two-hour response the fold below would take whichever row for a
   station arrived first while later rows overwrote its pollutants, mixing
   hours inside a city. So the newest hour wins and the rest are dropped: they
   describe an hour already published, and the monotonicity guard would refuse
   them anyway. Same rule as scripts/fetch-air.mjs. */
{
  const stamps = [...new Set(rows.map((r) => r.last_update).filter(Boolean))];
  if (stamps.length > 1) {
    const newest = stamps.reduce((a, b) => (newerStamp(a, b) === 'a' ? a : b));
    const before = rows.length;
    rows = rows.filter((r) => r.last_update === newest);
    console.log(`SPANS ${stamps.length} HOURS: keeping the newest (${newest}); `
      + `${before - rows.length} row(s) from earlier hours dropped.`);
  }
}

/* ── FOLD: row -> station -> city ──────────────────────────────────────── */

const stations = new Map();
const stampCount = {};
for (const r of rows) {
  const city = String(r.city ?? '').trim();
  const st = String(r.station ?? '').trim();
  const raw = String(r.pollutant_id ?? '').trim();
  const pol = ALIAS[raw] ?? ALIAS[raw.toUpperCase()] ?? raw.toUpperCase();
  if (!city || !st) continue;
  if (r.last_update) stampCount[r.last_update] = (stampCount[r.last_update] || 0) + 1;
  if (EXCLUDED.includes(pol)) continue;
  // `avg_value` IS CPCB's published sub-index. Never convert it — see the
  // header of lib/air.ts for what converting it a second time cost.
  const sub = num(r.avg_value);
  if (sub == null || sub < 0) continue;
  /* A STUCK CHANNEL IS NOT A READING — same rule as lib/air.ts's `isStuck`.
     The exact `min === max === avg` test this replaces was too literal: Leh's
     CO read 187/188/188 and took the top of this very table. See lib/air.ts
     for why the test is relative and where the 2% line comes from. */
  const lo = num(r.min_value), hi = num(r.max_value);
  if (isStuck(lo, hi, sub)) { continue; }
  const key = `${city}|${st}`;
  if (!stations.has(key)) stations.set(key, { city, station: st, state: r.state ?? null, aqi: -1, governing: null,
    pmSub: -1, lat: num(r.latitude), lng: num(r.longitude) });
  const s = stations.get(key);
  if (pol === 'PM2.5' || pol === 'PM10') {
    if (sub > s.pmSub) { s.pmSub = sub; s.pmGoverning = pol; }
  }
  if (sub > s.aqi) { s.aqi = sub; s.governing = pol; }
}

const cities = new Map();
for (const s of stations.values()) {
  if (s.aqi < 0) continue;
  if (!cities.has(s.city)) cities.set(s.city, { city: s.city, state: s.state, aqi: -1, station: null, governing: null, stations: 0 });
  const c = cities.get(s.city);
  c.stations++;
  c.sum = (c.sum || 0) + s.aqi;
  /* The mean is kept as `meanAqi` — CPCB's own city definition, the
     comparable number, and the tripwire for the double conversion. It is the
     mean of every station's AQI AS PUBLISHED, suspect or not, because that is
     what CPCB averages. */
  c.meanAqi = Math.round(c.sum / c.stations);
  /* THE RAW WORST, kept so a set-aside gas figure can still be printed. */
  if (s.aqi > (c.worstAqi ?? -1)) { c.worstAqi = s.aqi; c.raw = s; }
  /* ★ THE RANKED FIGURE IS THE CITY'S WORST MONITOR — AD-42C, and it has to
     match the hero — taken over the figure each station can be RANKED on
     (scripts/lib/air-rules.mjs `rankableFigure`, AD-42E). Judged per station,
     not once on the city's worst station, so a suspect gas at one monitor
     hands the city to its next-worst trustworthy monitor, not to that one
     monitor's own particulate. */
  const r = rankableFigure(s);
  if (r != null && r > (c.aqi ?? -1)) {
    c.aqi = r; c.pick = s;
  }
}
/* SUSPECT, NOT SUPPRESSED. A gas standing far above clean particulates is
   either a genuine local source or an uncalibrated channel, and this feed
   cannot tell them apart. Leh ranked SECOND in India on one ozone channel
   beside a PM2.5 of 13. The row stays; the doubt travels with it.

   ★ AND A GAS-ONLY STATION CANNOT FALL BACK (AD-42E). If there is no
   particulate at all there is nothing to fall back TO, and publishing
   "clean" for a station that never measured particulates would be inventing
   a reading. Those keep the gas figure and stay flagged — an error is not a
   zero, at this level too. */
for (const c of cities.values()) {
  const p = c.pick, w = c.raw;
  const swapped = gasUncorroborated(p);   // this station is ranked on its particulate
  c.station = p.station; c.governing = swapped ? (p.pmGoverning ?? p.governing) : p.governing; c.pmSub = p.pmSub;
  c.pmGoverning = p.pmGoverning ?? null;
  /* The governing station's POSITION travels with the row, because a
     suspect reading has to be locatable: verify-air-crosscheck.mjs asks an
     independent network what it sees AT THIS POINT. */
  c.lat = p.lat; c.lng = p.lng;
  const setAside = gasUncorroborated(w) && w.aqi > c.aqi;
  const gasOnly = !swapped && GASES.has(p.governing) && p.aqi > AQI_LIMIT && !(p.pmSub >= 0);
  c.suspect = setAside || gasOnly;
  if (setAside) {
    const pickName = String(p.station).split(',')[0].trim();
    const where = w === p ? 'its own particulates' : `${pickName}`;
    const rawName = String(w.station).split(',')[0].trim();
    c.suspectReason = `The ${w.governing} channel at ${rawName} reads ${w.aqi}, but the worst particulate at the `
      + `same station reads only ${w.pmSub}, and no independent monitor is near enough to say which is right. `
      + `This city is ranked on the worst figure it can stand behind — ${where}, ${c.aqi} — and the `
      + `${w.governing} figure of ${w.aqi} is published but not ranked.`;
    c.gas = { pollutant: w.governing, aqi: w.aqi, station: w.station, ranked: false };
    c.basis = w === p
      ? 'particulate-only — the gas channel above it could not be verified'
      : 'worst corroborated monitor — a gas channel at another monitor could not be verified';
  } else if (gasOnly) {
    c.suspectReason = `The ${p.governing} channel here reads ${p.aqi} and the station reports no `
      + `particulate at all, so nothing at the station can corroborate it. The figure is `
      + `published with that doubt attached — there is no particulate to rank on instead.`;
    c.basis = 'gas channel, unverified — this station reports no particulate to fall back to';
  } else {
    c.suspectReason = null;
  }
  delete c.pick; delete c.raw;
}

const ranked = [...cities.values()]
  .filter(c => c.aqi >= 0)
  .sort((a, b) => b.aqi - a.aqi)
  .map((c, i) => ({ rank: i + 1, ...c, sum: undefined, band: bandFor(c.aqi).name,
    // The multiplier belongs to the CONCENTRATION, never the index: the AQI
    // is piecewise-linear, so 4x the index is not 4x the pollution. This is
    // published as "the index against the index limit" and labelled as such.
    index_multiple: +(c.aqi / AQI_LIMIT).toFixed(1) }));

/* ── THE TWO CLOCKS, NAMED — AD-46, same block as fetch-air.mjs ───────────
   CPCB's stamp stays IST wall-clock text as published; ours stays UTC ISO.
   `swechha_first_saw_utc` carries forward while the observation is unchanged:
   a 15-minute poll that finds the same hour is a CHECK, not an observation. */
const OBSERVED = Object.entries(stampCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
const CHECKED_UTC = new Date().toISOString();
let prevFile = null;
if (existsSync(OUT)) {
  try { prevFile = JSON.parse(readFileSync(OUT, 'utf8')); }
  catch { /* an unreadable previous file must never block a fresh write */ }
}
const FIRST_SAW_UTC =
  (prevFile?.observed && OBSERVED && prevFile.observed === OBSERVED
    && prevFile.time?.swechha_first_saw_utc)
    ? prevFile.time.swechha_first_saw_utc
    : CHECKED_UTC;
const OBS_AGE_MIN = (() => {
  const o = parseStamp(OBSERVED);
  if (!o) return null;
  // IST wall clock -> instant, timezone-independently: UTC construction minus
  // the IST offset. Same arithmetic as fetch-air.mjs's OBS_AGE_H.
  const instant = Date.UTC(o.y, o.m - 1, o.d, o.hh, o.mi) - 5.5 * 3600 * 1000;
  return Math.round((Date.now() - instant) / 60000);
})();

const delhi = ranked.find(c => c.city.toLowerCase() === 'delhi') ?? null;
/* The neighbour count: how many of the cities immediately behind Delhi are in
   the National Capital Region. ★ THIS USED TO BE FOUR WHOLE STATES —
   Haryana, Uttar Pradesh, Delhi and Rajasthan — so on 25 September 2026 the
   "neighbours in its own airshed" were Khora, Sawai Madhopur, Agra and
   Vrindavan: three of the four are not in NCR, and Sawai Madhopur is 150 km
   past its edge. NCR is a list of districts (data/ncr.json, from the NCR
   Planning Board), so the count reads that list and nothing wider. */
const NCR_CITIES = new Set(JSON.parse(readFileSync(resolve('data/ncr.json'), 'utf8'))
  .districts.flatMap((d) => d.cities));
const behind = delhi ? ranked.slice(delhi.rank, delhi.rank + 12) : [];
const neighbours = behind.filter(c => NCR_CITIES.has(c.city));

const out = {
  subject: 'Every city reporting to CPCB, ranked, on CPCB\'s own scale',
  state_label: 'LIVE',
  method: 'Read from CPCB\'s published per-pollutant sub-indexes; nothing here recomputes them. '
        + 'A station\'s AQI is its WORST sub-index, and a city is ranked here by its WORST MONITOR, '
        + 'named on every row. That is NOT CPCB\'s city definition — CPCB averages across a city\'s '
        + 'stations, and against its published figures for 73 cities this runs about 25 per cent '
        + 'higher. CPCB\'s mean is carried on every row as meanAqi so the comparable number is '
        + 'always to hand.',
  // `served_by` names the source that ACTUALLY served this run — AD-44. The
  // CAAQMS live feed is primary; the mirror is the fallback, never mixed in.
  source: SERVED === 'caaqms' ? {
    name: 'Central Pollution Control Board',
    served_by: SERVED_BY_CAAQMS,
    url: 'https://airquality.cpcb.gov.in/caaqms/rss_feed',
    integrity: {
      stations_compared: caaqms.integrity.comparable,
      disagreeing: caaqms.integrity.mismatched,
      rule: "our worst raw Avg sub-index vs CPCB's own <Air_Quality_Index> Value, ±1",
    },
    fallback: `${SERVED_BY_MIRROR} — used only when the live feed fails its gates`,
  } : {
    name: 'CPCB via data.gov.in', served_by: SERVED_BY_MIRROR, resource: RESOURCE,
    url: 'https://data.gov.in/resource/real-time-air-quality-index-various-locations',
    note: process.env.AIR_FIXTURE
      ? 'replay run — AIR_FIXTURE skips the CAAQMS attempt by design'
      : (caaqmsWhy ? `fallback run — the CAAQMS live feed did not serve: ${caaqmsWhy}`
                   : 'the mirror answered with a fresher stamp than the live feed this run'),
  },
  aqiLimit: AQI_LIMIT,
  observed: OBSERVED,
  observed_spread: Object.keys(stampCount).length,
  /* The two clocks, labelled — AD-46. `observed`/`fetched` stay for every
     existing consumer; this is the same pair with unmistakable names. */
  time: {
    cpcb_observed_ist: OBSERVED,
    cpcb_observed_parts: (() => { const o = parseStamp(OBSERVED);
      return o ? { y: o.y, m: o.m, d: o.d, hh: o.hh, mi: o.mi } : null; })(),
    swechha_checked_utc: CHECKED_UTC,
    swechha_first_saw_utc: FIRST_SAW_UTC,
    observation_age_minutes_at_check: OBS_AGE_MIN,
    note: 'cpcb_observed_ist is when the AIR was measured (CPCB’s own stamp, IST wall-clock '
      + 'text, never converted); swechha_checked_utc is when WE ASKED CPCB (UTC ISO). They are '
      + 'different clocks and different facts, and must never be swapped or mixed.',
  },
  totals: {
    rows: rows.length, stations: stations.size, cities: ranked.length,
    above_limit: ranked.filter(c => c.aqi > AQI_LIMIT).length,
    good: ranked.filter(c => c.aqi <= 50).length,
  },
  delhi,
  airshed: delhi ? {
    behind_delhi: behind.length,
    neighbours: neighbours.length,
    names: neighbours.map(c => c.city),
    reading: `Delhi is ${delhi.rank === 1 ? 'first' : 'ranked ' + delhi.rank}. `
      + `${neighbours.length} of the next ${behind.length} are in the National Capital Region.`,
  } : null,
  caveats: [
    'A city\'s figure here is its WORST MONITOR, so a city with forty monitors has forty chances to produce a high one and a city with a single monitor has one. That cuts the opposite way from the mean: a well-monitored city ranks WORSE, not better, and a city with one monitor is a single reading wearing a city\'s name. Read `stations` before reading the rank, and `meanAqi` for the figure CPCB itself publishes.',
    'The AQI is piecewise-linear, so a ratio of two index values is NOT a ratio of two concentrations. `index_multiple` compares index to index limit and nothing else.',
    'A failed fetch leaves the previous file alone. It never writes a zero.',
  ],
  cities: ranked,
  fetched: { epochMs: Date.now() },
};


/* ── THE CLOCK ONLY MOVES FORWARD — AD-45B ────────────────────────────────
   On 26 August 2026 at 20:05 IST the hourly job replaced a committed 14:00
   observation (CAAQMS, fresh) with a 02:00 one (mirror, twelve hours behind),
   because the only guard was "did the figure MOVE" — a difference test, not
   a direction test. With one source that distinction never mattered; with a
   fresh primary and a laggy fallback it fires on exactly the hours the
   fallback carries the fetch, and the site walks backward in time.

   So the guard lives HERE, where every caller passes: if the file on disk
   already holds a STRICTLY NEWER observation than the one just fetched, keep
   the file and exit 0 — the previous reading standing is a success, not a
   failure. An EQUAL stamp still writes (CPCB revises within an hour). The
   comparison is field-wise on the IST wall-clock text, never Date parsing.

   AIR_ALLOW_REGRESSION=1 bypasses it: for tests replaying old fixtures, and
   for the one legitimate manual case — CPCB retracting an hour — which is a
   human decision, not something an unattended job may decide. */
/* ── HISTORY BEFORE THE GUARD — AD-46, same reasoning as fetch-air.mjs:
   a refused current-state write is still a genuine check of a genuine
   observation, and the store must not lose it. City-level only — city, aqi,
   band, governing, station count, CPCB's mean, rank — per AD-46's sizing:
   enough for the pan-India page to grow a history, cheap enough to keep. */
try {
  if (OBSERVED) {
    const rec = recordObservation({
      dir: process.env.AIR_HISTORY_DIR || resolve(dirname(OUT), 'air-history'),
      scope: 'india',
      now: CHECKED_UTC,
      record: {
        obs: OBSERVED,
        source: SERVED,
        /* Columnar, not keyed — measured 26 August 2026: keyed objects cost
           ~20KB per observation (~170MB/year at hourly observations), rows
           under named `cols` cost less than half. Nothing is lost: `rank` is
           the row's position (the list is stored ranked) and `band` is a pure
           function of aqi via CPCB's published band table. */
        cols: ['city', 'aqi', 'governing', 'stations', 'meanAqi'],
        cities: ranked.map((c) => [c.city, c.aqi, c.governing, c.stations, c.meanAqi]),
      },
    });
    console.log(`history: ${rec.action} ${OBSERVED} in ${rec.file}`);
  }
} catch (e) {
  console.warn(`history: could not record this check (${e.message}) — the fetch continues; `
    + 'the current-state file outranks the store.');
}

if (!process.env.AIR_ALLOW_REGRESSION && existsSync(OUT)) {
  try {
    const prev = prevFile ?? JSON.parse(readFileSync(OUT, 'utf8'));
    const prevStamp = prev?.observed;
    const nextStamp = out?.observed;
    if (prevStamp && nextStamp && prevStamp !== nextStamp
        && newerStamp(prevStamp, nextStamp) === 'a') {
      console.log(`REFUSING TO WALK BACKWARD: the committed observation (${prevStamp}) is newer `
        + `than the fetched one (${nextStamp}, ${out.source.served_by}). Keeping the file as it is.`);
      process.exit(0);
    }
  } catch { /* an unreadable previous file must never block a fresh write */ }
}

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');

console.log(`${out.totals.cities} cities, ${out.totals.stations} stations, observed ${out.observed} — served by ${out.source.served_by}`);
console.log(`${out.totals.above_limit} above the limit, ${out.totals.good} "Good"`);
if (delhi) console.log(`Delhi: rank ${delhi.rank}, AQI ${delhi.aqi} (${delhi.band}) at ${delhi.station}`);
if (out.airshed) console.log(out.airshed.reading, '—', out.airshed.names.join(', '));
console.log('\ntop 10:');
for (const c of ranked.slice(0, 10)) {
  console.log(`  ${String(c.rank).padStart(3)}  ${String(c.aqi).padStart(3)}  ${c.city}, ${c.state ?? '—'}  (${c.stations} station${c.stations > 1 ? 's' : ''})`);
}
console.log(`\nwrote ${OUT}`);
