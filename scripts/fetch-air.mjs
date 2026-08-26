#!/usr/bin/env node
/**
 * fetch-air.mjs — the scheduled job of D-13.1.
 *
 * Pulls CPCB's published per-pollutant SUB-INDEXES from data.gov.in and
 * writes committed JSON. The site stays fully static; nothing is fetched at
 * request time.
 *
 *   DATA_GOV_IN_KEY=... node scripts/fetch-air.mjs
 *
 * THE KEY IS NEVER COMMITTED. It comes from the environment only. Do not
 * add it to this file, to the JSON output, or to anything under public/.
 *
 * ★★ WHAT THE UPSTREAM ACTUALLY GIVES US — CORRECTED 25 AUGUST 2026.
 *   The resource is titled "Real time AIR QUALITY INDEX from various
 *   locations", and that is literally what it returns: `min_value`,
 *   `max_value` and `avg_value` are CPCB's own 24-hour SUB-INDEXES per
 *   pollutant per station. They are NOT concentrations.
 *
 *   This file used to assert the opposite and ran every value through the
 *   breakpoint table a second time, roughly doubling the whole site. On
 *   25 August it had Delhi at 381 "Very Poor" and Anand Vihar at 381, on a
 *   day CPCB published 97 and 177 for the same city and station and hour.
 *   Checked field by field against CPCB's Central Control Room panel: the
 *   feed's PM2.5 MIN of 67 is CPCB's PM2.5 sub-index MIN of 67, exactly.
 *
 *   So the AQI here is READ, not derived, and the page must say THAT:
 *   "CPCB's published sub-indexes", and any µg/m³ figure beside it is
 *   IMPLIED back out of the index, never measured.
 *
 * ★ THE LABEL IS EARNED, NOT ASSERTED. It was hardcoded 'LIVE' on the
 * argument that the word names CPCB's hourly publishing cadence rather than
 * this job's (D-26.1). Measured 25 August 2026 at 15:22 IST, data.gov.in was
 * still serving the 05:00 IST observation — a ten-hour lag, while CPCB's own
 * portal was current to 14:00. A chip reading LIVE over a ten-hour-old number
 * is the same species of error as the one this file was just corrected for:
 * a label that does not describe the figure beside it. The label now
 * DOWNGRADES to PERIODIC when the observation is more than STALE_HOURS old.
 *
 * ★ THE MIRROR IS NOW THE FALLBACK, NOT THE SOURCE — AD-44, 26 August 2026.
 * The ten-hour lag above was the mirror's, not CPCB's: at 12:04 IST the
 * mirror served 02:00 while CPCB's own CAAQMS feed served 12:00. So this
 * script now reads CPCB's live feed FIRST (scripts/lib/fetch-caaqms.mjs —
 * identical semantics, one hour old, keyless) and uses the data.gov.in
 * mirror only when the live feed fails its gates. One run is served entirely
 * by ONE source, named in `source.served_by`; the two are never mixed.
 */
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fetchUpstream } from './lib/fetch-cpcb.mjs';
import {
  fetchCaaqms, assessCaaqms, newestStamp, newerStamp,
  SERVED_BY_CAAQMS, SERVED_BY_MIRROR,
} from './lib/fetch-caaqms.mjs';

const RESOURCE = '3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69';
const KEY = process.env.DATA_GOV_IN_KEY;
const CITY = process.env.AIR_CITY || 'Delhi';
const OUT = resolve(process.argv[2] || 'data/air-delhi.json');

if (!KEY) {
  console.error('DATA_GOV_IN_KEY is not set. Refusing to run.\n' +
    'Get a key at https://data.gov.in and export it — never commit it.');
  process.exit(1);
}

/* ── CPCB AQI BREAKPOINTS ────────────────────────────────────────────────
   Transcribed from CPCB, "About National Air Quality Index" (SOURCE-FACTS
   S-1). Eight pollutants; six categories. Concentration band -> index band.
   CO is mg/m³; everything else µg/m³. 24-hour averages except CO and O3,
   which are 8-hour.
   The sub-index is LINEAR inside its band — CPCB's own worked example is
   PM2.5: 51 at 31, 75 at 45, 100 at 60. The assertions at the bottom of
   this file check exactly that, so a mistyped breakpoint fails the job
   rather than quietly shifting every reading on the site.
   ──────────────────────────────────────────────────────────────────────── */
const BANDS = [
  { name: 'Good',                idx: [0, 50] },
  { name: 'Satisfactory',        idx: [51, 100] },
  { name: 'Moderately Polluted', idx: [101, 200] },
  { name: 'Poor',                idx: [201, 300] },
  { name: 'Very Poor',           idx: [301, 400] },
  { name: 'Severe',              idx: [401, 500] },
];
const BREAKPOINTS = {
  'PM10':  [[0,50],[51,100],[101,250],[251,350],[351,430],[431,600]],
  'PM2.5': [[0,30],[31,60],[61,90],[91,120],[121,250],[251,380]],
  'NO2':   [[0,40],[41,80],[81,180],[181,280],[281,400],[401,600]],
  'OZONE': [[0,50],[51,100],[101,168],[169,208],[209,748],[749,1000]],
  'CO':    [[0,1],[1.1,2],[2.1,10],[10.1,17],[17.1,34],[34.1,50]],
  'SO2':   [[0,40],[41,80],[81,380],[381,800],[801,1600],[1601,2400]],
  'NH3':   [[0,200],[201,400],[401,800],[801,1200],[1201,1800],[1801,2400]],
  'PB':    [[0,0.5],[0.6,1],[1.1,2],[2.1,3],[3.1,3.5],[3.6,5]],
};
// The upstream's own spellings, mapped to ours.
const ALIAS = { 'PM2.5': 'PM2.5', 'PM10': 'PM10', 'NO2': 'NO2', 'SO2': 'SO2',
  'CO': 'CO', 'OZONE': 'OZONE', 'O3': 'OZONE', 'NH3': 'NH3', 'PB': 'PB', 'Pb': 'PB' };
const AVERAGING = { 'CO': '8-hour', 'OZONE': '8-hour' };

/* ── CO IS INCLUDED, AND THE OLD EXCLUSION WAS A SYMPTOM ─────────────────
   CO used to be dropped here on the reasoning that its values were "not
   credible" as mg/m³ OR as µg/m³, and that the feed stated no unit. All
   true, and all explained by the same misreading: they were never
   concentrations. The note recorded CO running 10 to 108 with a median of
   32 across the Delhi stations — as SUB-INDEXES those are unremarkable
   numbers, and the median station is simply "Good" on CO.
   CPCB lists CO among the "24 Hr Subindexes" it publishes, and on
   25 August 2026 CO was the worst sub-index at six of Delhi's 44 stations.
   Excluding it suppressed six real station readings.
   ──────────────────────────────────────────────────────────────────────── */

/**
 * The concentration implied by a published sub-index — the breakpoint table
 * run BACKWARDS, which is the only direction this file now uses. The mapping
 * is piecewise-linear and exactly invertible; the only loss is CPCB's
 * rounding of the index to a whole number. IMPLIED, never measured.
 */
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
const bandFor = (aqi) => aqi === null ? null
  : BANDS.find(b => aqi >= b.idx[0] && aqi <= b.idx[1]) || BANDS[BANDS.length - 1];

/* ── SELF-CHECK, ON THE DIRECTION THIS FILE ACTUALLY USES ────────────────
   The previous self-check verified the FORWARD conversion against CPCB's
   worked example. It was correct, it passed on every run, and it sat green
   for eleven weeks while the forward conversion was itself the bug. A check
   can only ever prove the table is right, never that the table should be
   consulted — so this one at least checks the direction we depend on.
   ──────────────────────────────────────────────────────────────────────── */
for (const [sub, want] of [[51, 31], [100, 60], [225, 98]]) {
  const got = impliedConcentration('PM2.5', sub);
  if (got === null || Math.abs(got - want) > 0.2) {
    console.error(`BREAKPOINT TABLE IS WRONG: PM2.5 sub-index ${sub} should imply ` +
      `about ${want} µg/m³, got ${got}. Refusing to run.`);
    process.exit(1);
  }
}


/**
 * A stuck instrument, by the same test as lib/air.ts's `isStuck`. The two are
 * transcribed and must not drift; `selfCheckStuck()` below pins the cases that
 * matter with real numbers off the feed.
 */
function isStuck(min, max, avg) {
  if (min === null || max === null || avg === null) return false;
  if (max < min) return false;
  if (max === 0) return min === 0;
  return (max - min) / max < 0.02;
}

/* The two readings that made this rule, and the one that must survive it. */
for (const [mn, mx, av, want, why] of [
  [187, 188, 188, true,  'Leh CO — one point across 24h, ranked Leh 1st in India'],
  [101, 103, 102, true,  'Navi Mumbai CO — the analyser that was frozen at 101 hours earlier'],
  [5, 6, 5, false,       'Madurai ozone — LOW, not stuck; an absolute test would wrongly drop it'],
  [94, 248, 158, false,  'Leh ozone — a live channel at the same station'],
]) {
  if (isStuck(mn, mx, av) !== want) {
    console.error(`STUCK-CHANNEL TEST IS WRONG: ${mn}/${mx}/${av} should be ` +
      `${want ? 'stuck' : 'live'} (${why}). Refusing to run.`);
    process.exit(1);
  }
}

/* ── FETCH ───────────────────────────────────────────────────────────────
   Paged. `total` came back as 301 rows for Delhi (station x pollutant), so
   one page of 1000 is enough today — but it is paged anyway, because a
   silent truncation would drop stations and quietly lower the city figure.
   ──────────────────────────────────────────────────────────────────────── */
async function fetchAll(city) {
  /* ★ REPLAY, FOR REVIEWING A METHOD CHANGE WITHOUT THE NUMBER MOVING.
     AIR_FIXTURE points at a captured response from this same resource. It
     exists because a change to HOW the reading is selected has to be judged
     against a FIXED hour — if the feed advances mid-review, the before and
     after differ for two reasons at once and neither is legible. It is also
     the only way to re-run this job from a network that cannot hold a
     connection to data.gov.in long enough for its 12s timeout.
     Nothing about the output is faked: the rows are CPCB's, and the
     observation stamp inside them says which hour they are. The daily job
     sets no such variable and is unaffected. */
  if (process.env.AIR_FIXTURE) {
    const raw = JSON.parse(readFileSync(process.env.AIR_FIXTURE, 'utf8'));
    // A city-filtered capture carries no `city` field on its rows; only filter
    // when the capture is the unfiltered all-India shape.
    const all = raw.records || raw;
    const rows = all.some(r => r.city) ? all.filter(r => r.city === city) : all;
    console.log(`REPLAY: ${rows.length} rows from ${process.env.AIR_FIXTURE} (no network)`);
    return rows;
  }
  const rows = [];
  const LIMIT = 1000;
  for (let offset = 0; ; offset += LIMIT) {
    const url = `https://api.data.gov.in/resource/${RESOURCE}` +
      `?api-key=${encodeURIComponent(KEY)}&format=json&limit=${LIMIT}` +
      `&offset=${offset}&filters%5Bcity%5D=${encodeURIComponent(city)}`;
    /* fetch-first, curl-fallback — see scripts/lib/fetch-cpcb.mjs for the
       measured reason native fetch alone lost ~half the hourly runs. A
       transport that fails BOTH ways throws and lands in the exit-75 path
       below, same as a thrown fetch always did. */
    const res = await fetchUpstream(url, { timeoutMs: 60000 });
    if (!res.ok) throw new Error(`upstream HTTP ${res.status}`);
    const body = await res.json();
    const batch = body.records || [];
    rows.push(...batch);
    if (batch.length < LIMIT) {
      /* ★ INTEGRITY IS ON DISTINCT KEYS, NOT ON THE COUNT. The all-India job
         collected exactly `total` rows while sixty-five of them were
         duplicates masking sixty-five losses — this same check, written as a
         count, passed straight through it. A lost row strips a station of a
         channel and can flip its governing pollutant, publishing a WRONG
         reading rather than a missing one. Delhi is one page today, so this
         should never fire; it exists because the version that could not fire
         is the version that let it happen elsewhere. */
      const total = Number(body.total);
      const distinct = new Set(rows.map(r => `${r.station}|${r.pollutant_id}`)).size;
      if (Number.isFinite(total) && distinct < total) {
        console.error(`INTEGRITY: upstream reports total=${total} but only ${distinct} distinct `
          + `(station, pollutant) rows arrived — ${total - distinct} lost to unstable paging. `
          + `Refusing to write; the previous file is left alone.`);
        process.exit(1);
      }
      break;
    }
  }
  return rows;
}

const num = (v) => {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  if (s === '' || s === 'NA' || s === '-') return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};

/** '21-08-2026 10:00:00' -> parts. Local getters only; never toISOString. */
function parseStamp(s) {
  const m = /^(\d{2})-(\d{2})-(\d{4})\s+(\d{2}):(\d{2})/.exec(String(s || '').trim());
  if (!m) return null;
  const [, dd, mm, yyyy, hh, mi] = m;
  return { y: +yyyy, m: +mm, d: +dd, hh: +hh, mi: +mi, raw: s };
}

/* ── SOURCE SELECTION — CAAQMS LIVE FEED FIRST, MIRROR AS FALLBACK (AD-44) ──
   Try CPCB's own feed; trust it only past its gates (≥300 stations parsed
   nationally, ≥35 in the city, a parseable stamp, and the per-station
   integrity check against CPCB's own <Air_Quality_Index>). The mirror is
   still fetched — its path, replay, paging integrity and backoff are intact —
   and if BOTH answer, the FRESHER stamp serves. In practice CAAQMS is always
   fresher (the mirror lags it by up to ten measured hours); the comparison is
   the safety net that stops an odd day from making the site LESS current.
   AIR_FIXTURE skips the CAAQMS attempt entirely: replay is deterministic
   mirror-shape rows and must stay that way. */
let caaqms = null;                    // { rows: city rows, stamp, integrity }
let caaqmsWhy = null;                 // why CAAQMS is not serving this run
let caaqmsIntegrityRefusal = false;   // gate tripped -> potentially OUR bug
if (!process.env.AIR_FIXTURE) {
  try {
    const feed = await fetchCaaqms({ timeoutMs: 60000 });
    const verdict = assessCaaqms(feed, { minStations: 300 });
    if (!verdict.ok) {
      caaqmsWhy = verdict.why;
      caaqmsIntegrityRefusal = verdict.kind === 'integrity';
    } else {
      const cityRows = feed.rows.filter((r) => r.city === CITY);
      const cityStations = new Set(cityRows.map((r) => r.station)).size;
      if (cityStations < 35) {
        caaqmsWhy = `only ${cityStations} ${CITY} station(s) in the feed (needs ≥35)`;
      } else {
        caaqms = { rows: cityRows, stamp: newestStamp(feed.stamps), integrity: verdict.integrity };
        console.log(`CAAQMS: ${feed.stationCount} stations nationally, ${cityStations} in ${CITY}, `
          + `observed ${caaqms.stamp}; integrity ${verdict.integrity.mismatched} of `
          + `${verdict.integrity.comparable} stations disagree with CPCB's own AQI`);
      }
    }
  } catch (e) {
    caaqmsWhy = `did not answer: ${e.cause?.message ? `${e.message} (${e.cause.message})` : e.message}`;
  }
  if (caaqmsWhy) {
    (caaqmsIntegrityRefusal ? console.error : console.warn)(
      `CAAQMS ${caaqmsIntegrityRefusal ? 'REFUSED — ' : 'unavailable — '}${caaqmsWhy}. `
      + 'Falling back to the data.gov.in mirror.');
  }
}

/* The mirror leg. When CAAQMS is already in hand this is only the freshness
   safety net, so its failure is logged and ignored; when CAAQMS failed it is
   the fallback and its failure decides the exit code. */
let mirrorRows = null;
let mirrorErr = null;
let mirrorAnsweredEmpty = false;
try {
  mirrorRows = await fetchAll(CITY);
  if (!mirrorRows.length) { mirrorAnsweredEmpty = true; mirrorRows = null; }
} catch (e) {
  mirrorErr = e.cause?.message ? `${e.message} (${e.cause.message})` : e.message;
  if (caaqms) console.warn(`mirror unavailable (${mirrorErr}) — CAAQMS is serving this run anyway`);
}

const mirrorStamp = mirrorRows
  ? (Object.entries(mirrorRows.reduce((m, r) => {
      if (r.last_update) m[r.last_update] = (m[r.last_update] || 0) + 1;
      return m;
    }, {})).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null)
  : null;

let rows;
let SERVED; // 'caaqms' | 'mirror'
if (caaqms && mirrorRows && newerStamp(mirrorStamp, caaqms.stamp) === 'a') {
  // The day that should never come: the mirror is FRESHER than the feed it
  // mirrors. Serve the fresher observation and say so — never mix the two.
  console.warn(`mirror stamp ${mirrorStamp} is FRESHER than CAAQMS's ${caaqms.stamp} — `
    + 'the mirror serves this run');
  rows = mirrorRows; SERVED = 'mirror';
} else if (caaqms) {
  rows = caaqms.rows; SERVED = 'caaqms';
  if (mirrorRows) console.log(`freshness: CAAQMS ${caaqms.stamp} vs mirror ${mirrorStamp} — CAAQMS serves`);
} else if (mirrorRows) {
  rows = mirrorRows; SERVED = 'mirror';
} else if (mirrorAnsweredEmpty) {
  // The mirror ANSWERED and the answer was empty — that is a wrong answer,
  // not silence, same as before AD-44.
  console.error(`No rows for ${CITY}. Leaving previous file alone.`);
  process.exit(1);
} else if (caaqmsIntegrityRefusal) {
  /* The one both-sources-down case that is OURS: CAAQMS answered, our parse
     of it disagreed with CPCB's own per-station AQI, and the mirror could not
     step in. A drifted parser is this repository's defect — exit 1, loudly. */
  console.error(`BOTH sources unusable, and the CAAQMS refusal was the INTEGRITY gate — `
    + `the parser may have drifted (${caaqmsWhy}). Mirror: ${mirrorErr ?? 'unavailable'}. `
    + 'Leaving the previous file alone.');
  process.exit(1);
} else {
  /* ── NEITHER SOURCE ANSWERED — EXIT 75, NOT 1 ──────────────────────────
     Same rule as before AD-44, now requiring BOTH sources to be silent:
     EX_TEMPFAIL for "no source replied", exit 1 for "a source replied and
     the answer was wrong". Only the second is a defect in this repository.
     See air-hourly.yml for what the caller does with 75. */
  console.error(`no source would answer for ${CITY}: CAAQMS (${caaqmsWhy ?? 'not attempted'}); `
    + `mirror (${mirrorErr ?? 'unknown'})`);
  console.error('Leaving the previous file alone. The page keeps its committed reading '
    + 'and prints the age of the observation, which is the designed failure mode.');
  process.exit(75);
}

/* ── GROUP BY STATION, COMPUTE SUB-INDICES ───────────────────────────── */
const stations = new Map();
for (const r of rows) {
  const key = r.station;
  if (!stations.has(key)) stations.set(key, {
    station: key, lat: num(r.latitude), lng: num(r.longitude),
    stamp: parseStamp(r.last_update), pollutants: {},
  });
  const st = stations.get(key);
  const pid = ALIAS[r.pollutant_id] || String(r.pollutant_id || '').toUpperCase();
  const sub = num(r.avg_value);
  if (sub === null) { (st.missing ||= []).push(pid); continue; }
  /* A STUCK CHANNEL IS NOT A READING. Transcribed from lib/air.ts's
     `isStuck` — see the note there for why the test is RELATIVE (2% of the
     channel's own value over 24 hours) rather than an absolute range, and
     for the measured gap in the data that puts the line at 2%. The exact
     `min === max === avg` test this replaces missed Leh's CO at 187–188 and
     ranked it first in India. Recorded, not silently dropped. */
  const lo = num(r.min_value), hi = num(r.max_value);
  if (isStuck(lo, hi, sub)) {
    (st.flatlined ||= []).push(pid);
    continue;
  }
  // `avg_value` IS the sub-index. `min_value`/`max_value` are the sub-index's
  // own 24-hour extremes, not concentrations either.
  st.pollutants[pid] = {
    sub,
    subMin: num(r.min_value), subMax: num(r.max_value),
    averaging: AVERAGING[pid] || '24-hour',
    impliedConc: impliedConcentration(pid, sub),
    impliedUnit: pid === 'CO' ? 'mg/m³' : 'µg/m³',
    concBasis: 'implied-from-subindex',
  };
}

// Station AQI = the WORST sub-index. CPCB: "The worst sub-index determines
// the overall AQI." The governing pollutant is recorded by name, because the
// multiplier is meaningless without it (D-15.3).
const GASES = new Set(['OZONE', 'CO', 'NO2', 'SO2', 'NH3']);
for (const st of stations.values()) {
  let best = null;
  for (const [pid, p] of Object.entries(st.pollutants)) {
    if (p.sub === null) continue;
    if (!best || p.sub > best.sub) best = { pid, sub: p.sub };
  }
  st.aqi = best ? best.sub : null;
  // FLAGGED, NOT DELETED — see lib/air.ts. A gas standing far above clean
  // particulates is either a local source or an uncalibrated channel.
  const pmSub = Math.max(st.pollutants['PM2.5']?.sub ?? -1, st.pollutants['PM10']?.sub ?? -1);
  st.quality = {
    flatlined: st.flatlined || [], missing: st.missing || [],
    suspect: !!(best && GASES.has(best.pid) && best.sub > 100 && pmSub >= 0 && pmSub < best.sub / 2),
  };
  st.quality.suspectReason = st.quality.suspect
    ? `Set by ${best.pid} alone: its sub-index is ${best.sub} while the worst particulate here `
      + `reads ${pmSub}. This feed cannot say whether that is a local source or an `
      + `uncalibrated channel.` + (st.quality.flatlined.length
        ? ` The ${st.quality.flatlined.join(', ')} channel here is flatlined.` : '')
    : null;
  st.governing = best ? best.pid : null;
  st.band = bandFor(st.aqi)?.name || null;
  st.reported = Object.keys(st.pollutants).filter(k => st.pollutants[k].sub !== null);
  st.notReported = Object.keys(BREAKPOINTS).filter(k => !st.reported.includes(k));
}

const list = [...stations.values()].sort((a, b) => (b.aqi ?? -1) - (a.aqi ?? -1));
const withAqi = list.filter(s => s.aqi !== null);
const worst = withAqi[0] || null;

/* ── THE HEADLINE IS THE WORST MONITOR, LABELLED AS ONE ──────────────────
   AD-42C, owner's ruling of 25 August 2026, reversing A-42.3.

   Keep two corrections apart, because they arrived together and only one of
   them is being reversed:
     1. THE ARITHMETIC. This feed publishes CPCB's sub-indexes, not µg/m³, and
        this script used to run them through the breakpoint table a second
        time. That is fixed and STAYS fixed — it is why the worst monitor now
        reads 225 and not 381.
     2. THE SELECTION. A-42.3 replaced the worst station with the mean of the
        44, because the mean is what CPCB calls "Delhi". The owner reversed
        that: this site's subject is limits being broken at named places, and
        the mean is the number that averages away the place where the limit is
        broken worst.

   The mislabelling A-42.3 was right about is fixed a different way — by the
   LABEL, not by changing the number. `scope: 'worst-monitor'`, the station
   name, and the count it was chosen from all travel with the figure, and
   nothing in this file calls it "Delhi's AQI".

   THE MEAN IS STILL COMPUTED, as `city_mean`. It is not the headline and the
   page does not lead with it, but it is the one cheap check that catches the
   double conversion coming back: read correctly it tracks CPCB's own city
   figure at a ratio of 1.00 across 73 cities, so a sudden divergence means the
   parser has drifted again.
   ──────────────────────────────────────────────────────────────────────── */
const cityMean = withAqi.length
  ? Math.round(withAqi.reduce((sum, s) => sum + s.aqi, 0) / withAqi.length)
  : null;
const headlineAqi = worst?.aqi ?? null;

/* ── HOW OLD IS THE OBSERVATION, REALLY ──────────────────────────────────
   The stamp is IST wall-clock text. Comparing it to Date.now() with local
   getters would be wrong by 5:30 whenever this job runs in CI on UTC — the
   exact class of bug the date rules in this repo exist to prevent. So the
   stamp is converted to a real instant by SUBTRACTING the IST offset from a
   UTC construction, which is timezone-independent and correct everywhere.
   ──────────────────────────────────────────────────────────────────────── */
const STALE_HOURS = 3;   // the feed claims hourly; three hours is generous
const IST_OFFSET_MS = 5.5 * 3600 * 1000;
const OBS_AGE_H = (() => {
  const o = worst?.stamp;
  if (!o) return null;
  const instant = Date.UTC(o.y, o.m - 1, o.d, o.hh, o.mi) - IST_OFFSET_MS;
  return Math.round(((Date.now() - instant) / 3600000) * 10) / 10;
})();
const STATE_LABEL = (OBS_AGE_H === null || OBS_AGE_H > STALE_HOURS) ? 'PERIODIC' : 'LIVE';

const out = {
  city: CITY,
  state: rows[0]?.state ?? null,
  // PROVENANCE. Written so the page can state its derivation, not just its
  // source — and, since AD-44, WHICH source actually served this run.
  // `served_by` names it; anything printing provenance must read it from here
  // rather than asserting the mirror.
  source: SERVED === 'caaqms' ? {
    name: 'Central Pollution Control Board',
    served_by: SERVED_BY_CAAQMS,
    via: 'CPCB CAAQMS live feed — airquality.cpcb.gov.in/caaqms/rss_feed (keyless XML, hourly)',
    url: 'https://airquality.cpcb.gov.in/caaqms/rss_feed',
    returns: 'per-station, per-pollutant CPCB sub-indexes — the index itself, not concentrations',
    integrity: {
      stations_compared: caaqms.integrity.comparable,
      disagreeing: caaqms.integrity.mismatched,
      rule: "our worst raw Avg sub-index vs CPCB's own <Air_Quality_Index> Value, ±1",
    },
    fallback: `${SERVED_BY_MIRROR} — used only when this feed fails its gates; never mixed`,
  } : {
    name: 'Central Pollution Control Board',
    served_by: SERVED_BY_MIRROR,
    via: 'data.gov.in — Real time Air Quality Index from various locations',
    resource: RESOURCE,
    url: `https://api.data.gov.in/resource/${RESOURCE}`,
    returns: 'per-station, per-pollutant CPCB sub-indexes — the index itself, not concentrations',
    note: process.env.AIR_FIXTURE
      ? 'replay run — AIR_FIXTURE skips the CAAQMS attempt by design'
      : (caaqmsWhy ? `fallback run — the CAAQMS live feed did not serve: ${caaqmsWhy}`
                   : 'the mirror answered with a fresher stamp than the live feed this run'),
  },
  derivation: 'AQI read from CPCB\'s own published per-pollutant sub-indexes — this feed '
    + 'carries the index, not concentrations, and nothing here recomputes it. A station\'s '
    + 'AQI is its worst sub-index, and the headline reading is the WORST MONITOR of those '
    + 'reporting, named, not a city average. CPCB\'s own city figure is the mean of the '
    + 'stations and is carried separately as city_mean. Concentrations shown are implied '
    + 'back from the sub-index using the breakpoint table in "About National Air Quality '
    + 'Index", never measured.',
  /* LIVE, PER D-26.1 — AND THE WORD DESCRIBES CPCB, NOT THIS SCRIPT.
     The state chip names how the source delivers. CPCB publishes this
     feed hourly, which is what earned Air the badge at D-21.5, so the
     word is LIVE for the same reason Yamuna's is PERIODIC: that is the
     cadence of the publisher, and it does not change between runs.

     This field is now read by situation-shell.mjs's cadence('air'), which
     is the single source the situation page, the /now card and the
     homepage hero deck all render from. It said PERIODIC until 23 August,
     while /now hardcoded LIVE — the contradiction the cadence register
     was extracted to make impossible. */
  state_label: STATE_LABEL,
  observation_age_hours: OBS_AGE_H,
  observed: worst?.stamp ?? null,     // the station's own stamp
  fetched: { epochMs: Date.now() },   // when this job ran — a different thing
  limits: {
    'PM2.5': { h24: 60, annual: 40, unit: 'µg/m³', authority: 'CPCB, NAAQS 2009' },
    'PM10':  { h24: 100, annual: 60, unit: 'µg/m³', authority: 'CPCB, NAAQS 2009' },
  },
  aqiLimit: 100,
  bands: BANDS,
  // Nothing is excluded any more. CO was, on a misreading of the feed's units;
  // see the note above the breakpoint table. Kept as an empty list rather than
  // deleted so the page's "what this leaves out" slot stays wired.
  excluded: [],
  city_reading: worst === null ? null : {
    scope: 'worst-monitor',
    aqi: worst.aqi,
    band: worst.band,
    governing: worst.governing,
    station: worst.station,
    lat: worst.lat,
    lng: worst.lng,
    method: 'worst monitor of those reporting, named — NOT a city average',
    selectedFrom: withAqi.length,
    stations: withAqi.length,
    pollutants: worst.pollutants,
  },
  /* CPCB's own city definition. Carried, not led with — see the note above. */
  city_mean: cityMean === null ? null : {
    scope: 'city',
    aqi: cityMean,
    band: bandFor(cityMean)?.name || null,
    method: 'mean of station AQIs (unweighted; CPCB weights by 2km-grid population)',
    stations: withAqi.length,
    role: 'cross-check against CPCB\'s published city figure — not the page reading',
  },
  worst_station: worst && {
    aqi: worst.aqi, band: worst.band, governing: worst.governing,
    station: worst.station, lat: worst.lat, lng: worst.lng,
    pollutants: worst.pollutants,
  },
  spread: withAqi.length ? {
    stations: withAqi.length,
    best: { aqi: withAqi[withAqi.length - 1].aqi, station: withAqi[withAqi.length - 1].station },
    worst: { aqi: worst.aqi, station: worst.station },
    above_limit: withAqi.filter(s => s.aqi > 100).length,
  } : null,
  stations: list.map(s => ({
    station: s.station, lat: s.lat, lng: s.lng, aqi: s.aqi, band: s.band,
    governing: s.governing, reported: s.reported, notReported: s.notReported,
    pollutants: s.pollutants, stamp: s.stamp,
  })),
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');

console.log(`${CITY}: ${rows.length} rows, ${list.length} stations, ${withAqi.length} reporting — served by ${out.source.served_by}`);
if (worst) {
  console.log(`${CITY} headline: ${headlineAqi} (${worst.band}) — WORST MONITOR of ${withAqi.length}: ${worst.station}, governed by ${worst.governing}`);
  console.log(`city mean (cross-check, not published as the reading): ${cityMean} (${bandFor(cityMean)?.name})`);
  console.log(`spread: ${out.spread.best.aqi} to ${out.spread.worst.aqi}; ${out.spread.above_limit} of ${withAqi.length} above 100`);
  console.log(`observed: ${worst.stamp?.raw} (${OBS_AGE_H}h old) -> chip ${STATE_LABEL}`);
}
console.log(`wrote ${OUT}`);
