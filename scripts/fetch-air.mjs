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
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fetchUpstream } from './lib/fetch-cpcb.mjs';
import {
  fetchCaaqms, assessCaaqms, newestStamp, newerStamp,
  SERVED_BY_CAAQMS, SERVED_BY_MIRROR,
} from './lib/fetch-caaqms.mjs';
import { recordObservation } from './lib/air-history.mjs';
/* isStuck and the 0-500 scale bound, with the self-check that runs on import —
   see scripts/lib/air-rules.mjs for why they are no longer transcribed here. */
import { isStuck, isOffScale, AQI_SCALE_MAX } from './lib/air-rules.mjs';

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

/* ── AN INDEX OFF CPCB'S OWN SCALE IS NOT A READING — AD-47 ──────────────
   Everything above this point validates the SHAPE of a value — is it a
   number, is the channel stuck at one point across 24 hours, did paging drop
   a row — and nothing validated its MAGNITUDE. CPCB's National AQI runs
   0-500 and the band table stops at Severe/500, but `bandFor` falls back to
   the last band for anything above it, so a sub-index of 4000 off one
   mis-parsed field would have become the worst monitor in Delhi, banded
   "Severe", and gone out as the headline.

   THIS IS NOT A "LARGE CHANGE = REJECT" RULE, which the brief rightly
   forbids: the bound is CPCB's own published scale, not the previous
   reading, so a genuine 500 on a genuinely severe day still publishes
   untouched. Only a number that cannot be an index on the scale it claims to
   be on is dropped — recorded like a stuck channel, never silently.

   IT RUNS BEFORE THE AQI LOOP BELOW, so the station's AQI, governing
   pollutant, band and `suspect` flag are all computed once from clean
   channels. Dropping a channel afterwards would mean unpicking each of them
   by hand, which is the kind of second pass that drifts. */
for (const st of stations.values()) {
  for (const [pid, pol] of Object.entries(st.pollutants)) {
    if (isOffScale(pol.sub)) {
      (st.offScale ||= []).push(`${pid}=${pol.sub}`);
      delete st.pollutants[pid];
    }
  }
  if (st.offScale) {
    console.warn(`OFF-SCALE: ${st.station} reported ${st.offScale.join(', ')} — above CPCB's `
      + `0-${AQI_SCALE_MAX} index scale, so it is not an index. Dropped and recorded.`);
  }
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
    flatlined: st.flatlined || [], missing: st.missing || [], offScale: st.offScale || [],
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

/* ── THE TWO CLOCKS, NAMED SO THEY CANNOT BE CONFUSED — AD-46 ─────────────
   The owner's brief of 26 August 2026, verbatim intent: for every reading,
   keep CPCB's OBSERVATION time and Swechha's FETCH time apart — "AQI: 183 /
   Source observation: 5:00 PM / Last checked by Swechha: 5:15 PM". Both
   already existed here (`observed`, `fetched`) but nothing labelled them as
   two different facts, and nothing carried when an observation was FIRST
   seen. The `time` block below is the self-documenting form; `observed` and
   `fetched` are kept unchanged so no consumer breaks.
   THE FORMATS ARE THE FENCE: CPCB's clock stays IST wall-clock TEXT exactly
   as published (never converted), ours stays UTC ISO. A UTC string in the
   IST field or vice-versa is a bug the test suite checks for.
   `swechha_first_saw_utc` is carried forward from the previous file when the
   observation has not changed — a 15-minute poll that finds the same hour is
   a CHECK, not a new observation. */
const CHECKED_UTC = new Date().toISOString();
let prevFile = null;
if (existsSync(OUT)) {
  try { prevFile = JSON.parse(readFileSync(OUT, 'utf8')); }
  catch { /* an unreadable previous file must never block a fresh write */ }
}
const FIRST_SAW_UTC =
  (prevFile?.observed?.raw && worst?.stamp?.raw && prevFile.observed.raw === worst.stamp.raw
    && prevFile.time?.swechha_first_saw_utc)
    ? prevFile.time.swechha_first_saw_utc
    : CHECKED_UTC;

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
  /* The two clocks, labelled — AD-46. `observed`/`fetched` above stay for
     every existing consumer; this block is the same facts with names that
     make confusion impossible, plus the first-sighting time. */
  time: {
    cpcb_observed_ist: worst?.stamp?.raw ?? null,
    cpcb_observed_parts: worst?.stamp
      ? { y: worst.stamp.y, m: worst.stamp.m, d: worst.stamp.d, hh: worst.stamp.hh, mi: worst.stamp.mi }
      : null,
    swechha_checked_utc: CHECKED_UTC,
    swechha_first_saw_utc: FIRST_SAW_UTC,
    observation_age_minutes_at_check: OBS_AGE_H === null ? null : Math.round(OBS_AGE_H * 60),
    note: 'cpcb_observed_ist is when the AIR was measured (CPCB’s own stamp, IST wall-clock '
      + 'text, never converted); swechha_checked_utc is when WE ASKED CPCB (UTC ISO). They are '
      + 'different clocks and different facts, and must never be swapped or mixed.',
  },
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
/* ── THE HISTORY IS RECORDED BEFORE THE GUARD BELOW CAN EXIT — AD-46 ──────
   Every successful fetch is a genuine sighting of a genuine CPCB observation,
   INCLUDING the ones the monotonicity guard refuses to write into the
   current-state file (an older observation off the laggy mirror is still
   real data about that older hour, and a poll that re-sees a known hour
   still legitimately updates its last_checked/checks). So the store is
   written first, and never crashes the fetch — the current-state file
   outranks it. The store lives beside OUT so tests writing to a temp OUT
   get a temp store, and the real run gets data/air-history/. */
try {
  if (worst?.stamp?.raw) {
    const rec = recordObservation({
      dir: process.env.AIR_HISTORY_DIR || resolve(dirname(OUT), 'air-history'),
      scope: 'delhi',
      now: CHECKED_UTC,
      record: {
        obs: worst.stamp.raw,
        source: SERVED,
        city: { aqi: worst.aqi, band: worst.band, governing: worst.governing, station: worst.station },
        mean: cityMean,
        above_limit: out.spread?.above_limit ?? null,
        stations: withAqi.map((s) => ({ s: s.station, a: s.aqi, g: s.governing })),
      },
    });
    console.log(`history: ${rec.action} ${worst.stamp.raw} in ${rec.file}`);
  }
} catch (e) {
  console.warn(`history: could not record this check (${e.message}) — the fetch continues; `
    + 'the current-state file outranks the store.');
}

/* ── WHAT KIND OF CHECK WAS THIS? — AD-47 ─────────────────────────────────
   A poll has more than two outcomes, and collapsing them is how this pipeline
   kept lying in both directions: a run that genuinely checked and found the
   same hour used to look identical to a run that never reached CPCB, and a
   run that correctly REFUSED an older observation used to look like a
   failure. So every run now states which of these it was, in the file:

     new_observation   CPCB has moved on; the reading here is new.
     same_observation  We asked, CPCB is publishing the same hour. A CHECK,
                       not a measurement. The reading does not move; the
                       check clock does.
     stale_refused     The source served an observation OLDER than the one on
                       disk (the laggy mirror behind a fresher earlier read).
                       Last known good is preserved untouched — but we DID
                       ask, and successfully, so the check clock still moves
                       and the reason is recorded where a reader can see it.
     source_unavailable / pipeline failure never reach this point: they exit
                       75 and 1 respectively, above, and write NOTHING.

   THE RULE THIS ENCODES (owner's brief, requirement 6): a successful check
   updates "last checked" even when the observation has not changed — and a
   FAILED source must never be dressed up as a successful check. Those are the
   same rule seen from its two sides, and the enum is what keeps them apart.
   ──────────────────────────────────────────────────────────────────────── */
const prevStamp = prevFile?.observed?.raw ?? null;
const nextStamp = out?.observed?.raw ?? null;
const REGRESSED = !process.env.AIR_ALLOW_REGRESSION
  && !!(prevStamp && nextStamp && prevStamp !== nextStamp && newerStamp(prevStamp, nextStamp) === 'a');

if (REGRESSED) {
  /* ── LAST KNOWN GOOD IS PRESERVED, AND THE REASON IS VISIBLE ────────────
     On 26 August the hourly job replaced a committed 14:00 observation with
     an 02:00 one because the only guard was "did the figure MOVE" — a
     difference test, not a direction test. The guard that fixed that used to
     `process.exit(0)` WITHOUT writing, which fixed the reading and broke the
     clock: the site then showed a check timestamp hours older than the last
     time it had actually, successfully asked CPCB. Requirement 7 says
     preserve the trusted data; requirement 6 says do not freeze the clock
     with it; and "do not permanently freeze data without making the reason
     visible" says the refusal has to be written down. All three are the same
     write: the previous OBSERVATION, verbatim, with a new check block. */
  const kept = { ...prevFile };
  kept.time = {
    ...(prevFile.time || {}),
    swechha_checked_utc: CHECKED_UTC,
    observation_age_minutes_at_check: OBS_AGE_H === null ? null : Math.round(OBS_AGE_H * 60),
  };
  kept.check = {
    status: 'stale_refused',
    at: CHECKED_UTC,
    served_by: out.source.served_by,
    kept_observation: prevStamp,
    refused_observation: nextStamp,
    reason: `The source served ${nextStamp}, which is OLDER than the observation already `
      + `published here (${prevStamp}). An unattended job may not walk the site backward in `
      + `time, so the earlier, fresher reading stands. This check itself succeeded.`,
  };
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(kept, null, 2) + '\n');
  console.log(`REFUSING TO WALK BACKWARD: the committed observation (${prevStamp}) is newer `
    + `than the fetched one (${nextStamp}, ${out.source.served_by}). The reading is kept; `
    + `last-checked advances to ${CHECKED_UTC}; the refusal is recorded in check.status.`);
  console.log(`wrote ${OUT} (check.status=stale_refused)`);
  process.exit(0);
}

out.check = {
  status: (prevStamp && nextStamp && prevStamp === nextStamp) ? 'same_observation' : 'new_observation',
  at: CHECKED_UTC,
  served_by: out.source.served_by,
  previous_observation: prevStamp,
  reason: null,
};

/* ── THE CROSS-CHECK VERDICT IS CARRIED, NOT RECOMPUTED — AD-47 ───────────
   verify-air-crosscheck.mjs compares our city_mean against CPCB's OWN daily
   bulletin and stamps its verdict into this file. That bulletin is published
   once a day, so the gate runs a few times a day, not on every 15-minute
   poll — but this file is rewritten by EVERY poll, so without this line the
   verdict would survive exactly one fetch and then vanish.
   It is carried with its own `at` timestamp attached, so a stale verdict
   reads as a stale verdict rather than as a fresh pass. */
out.crosscheck = prevFile?.crosscheck ?? null;

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
