#!/usr/bin/env node
/**
 * fetch-air.mjs — the scheduled job of D-13.1.
 *
 * Pulls CPCB station concentrations from data.gov.in, computes the AQI
 * sub-indices with CPCB's OWN published breakpoints, and writes committed
 * JSON. The site stays fully static; nothing is fetched at request time.
 *
 *   DATA_GOV_IN_KEY=... node scripts/fetch-air.mjs
 *
 * THE KEY IS NEVER COMMITTED. It comes from the environment only. Do not
 * add it to this file, to the JSON output, or to anything under public/.
 *
 * WHAT THE UPSTREAM ACTUALLY GIVES US, and why it matters:
 *   The resource returns per-station, per-pollutant CONCENTRATIONS
 *   (min/max/avg in µg/m³, CO in mg/m³). **It does not return an AQI.**
 *   So every AQI on this site is DERIVED here, and the page must say so:
 *   it is "computed from CPCB station concentrations using CPCB's own
 *   breakpoints", never "CPCB's AQI". That is a real distinction and the
 *   honesty rules require it to be stated (every derived figure names its
 *   derivation).
 *
 * THE LABEL IS `PERIODIC`, NOT `LIVE`. The upstream stamps roughly hourly,
 * but this job delivers by committing a file, so the page's freshness is
 * the job's cadence, not the station's. D-10.1 / D-13.1.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

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

/* ── CO IS EXCLUDED, AND THIS IS THE REASON ──────────────────────────────
   Measured against the live feed on 21 August 2026: CO `avg_value` across
   the 43 Delhi stations ran 10 to 108 with a median of 32, and the feed
   states no unit anywhere in its field metadata.
     - Read as mg/m³ (the unit CPCB's CO breakpoints use, where 34+ is
       Severe) a median of 32 would put nearly every station in the top
       band on CO alone. Not credible in monsoon, and it is exactly what
       happened on the first run: every one of 43 stations came back
       "Severe, governed by CO".
     - Read as µg/m³ it is implausibly low for urban CO.
   Every other pollutant in this feed is µg/m³ and matches its breakpoints;
   CO is the single one CPCB defines in mg/m³. So the unit is unresolved,
   and a guess either way silently moves every AQI on the site.
   THEREFORE: CO is excluded from the computed AQI and the exclusion is
   published with its reason. This is the page's own thesis applied to its
   own pipeline — name the gap rather than fill it with an assumption.
   To include CO, first confirm its unit against a CPCB bulletin for the
   same station and hour, then delete it from this list.
   ──────────────────────────────────────────────────────────────────────── */
const EXCLUDED = {
  CO: 'The feed states no unit for CO. CPCB\'s CO breakpoints are in mg/m³ while '
    + 'every other pollutant here is µg/m³, and the values returned are not credible '
    + 'as either. Including it on an assumption would put almost every station in the '
    + 'top band on CO alone.',
};

/** Linear sub-index inside the CPCB band. Returns null outside the table. */
function subIndex(pollutant, conc) {
  const bp = BREAKPOINTS[pollutant];
  if (!bp || conc === null || Number.isNaN(conc)) return null;
  for (let i = 0; i < bp.length; i++) {
    const [bLo, bHi] = bp[i], [iLo, iHi] = BANDS[i].idx;
    if (conc <= bHi) {
      const lo = i === 0 ? 0 : bLo;
      return Math.round(((iHi - iLo) / (bHi - lo)) * (conc - lo) + iLo);
    }
  }
  return 500; // above the top band; CPCB caps the index at 500
}
const bandFor = (aqi) => aqi === null ? null
  : BANDS.find(b => aqi >= b.idx[0] && aqi <= b.idx[1]) || BANDS[BANDS.length - 1];

/* ── SELF-CHECK. CPCB's own worked example, before any network call. ──── */
for (const [conc, want] of [[31, 51], [45, 75], [60, 100]]) {
  const got = subIndex('PM2.5', conc);
  if (got !== want) {
    console.error(`BREAKPOINT TABLE IS WRONG: PM2.5 at ${conc} µg/m³ should be ` +
      `sub-index ${want} (CPCB's own example), got ${got}. Refusing to run.`);
    process.exit(1);
  }
}

/* ── FETCH ───────────────────────────────────────────────────────────────
   Paged. `total` came back as 301 rows for Delhi (station x pollutant), so
   one page of 1000 is enough today — but it is paged anyway, because a
   silent truncation would drop stations and quietly lower the city figure.
   ──────────────────────────────────────────────────────────────────────── */
async function fetchAll(city) {
  const rows = [];
  const LIMIT = 1000;
  for (let offset = 0; ; offset += LIMIT) {
    const url = `https://api.data.gov.in/resource/${RESOURCE}` +
      `?api-key=${encodeURIComponent(KEY)}&format=json&limit=${LIMIT}` +
      `&offset=${offset}&filters%5Bcity%5D=${encodeURIComponent(city)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`upstream HTTP ${res.status}`);
    const body = await res.json();
    const batch = body.records || [];
    rows.push(...batch);
    if (batch.length < LIMIT) {
      if (rows.length !== Number(body.total)) {
        console.warn(`NOTE: upstream reports total=${body.total}, collected ${rows.length}.`);
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

const rows = await fetchAll(CITY);
if (!rows.length) { console.error(`No rows for ${CITY}. Leaving previous file alone.`); process.exit(1); }

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
  if (!BREAKPOINTS[pid]) continue;
  const avg = num(r.avg_value);
  const excluded = EXCLUDED[pid] || null;
  st.pollutants[pid] = {
    conc: avg, min: num(r.min_value), max: num(r.max_value),
    unit: excluded ? 'unstated' : 'µg/m³',
    averaging: AVERAGING[pid] || '24-hour',
    // A pollutant whose unit cannot be verified gets NO sub-index. The
    // concentration is still published, so the hole is visible.
    sub: excluded ? null : subIndex(pid, avg),
    excluded, excludedReason: excluded,
  };
}

// Station AQI = the WORST sub-index. CPCB: "The worst sub-index determines
// the overall AQI." The governing pollutant is recorded by name, because the
// multiplier is meaningless without it (D-15.3).
for (const st of stations.values()) {
  let best = null;
  for (const [pid, p] of Object.entries(st.pollutants)) {
    if (p.sub === null) continue;
    if (!best || p.sub > best.sub) best = { pid, sub: p.sub };
  }
  st.aqi = best ? best.sub : null;
  st.governing = best ? best.pid : null;
  st.band = bandFor(st.aqi)?.name || null;
  st.reported = Object.keys(st.pollutants).filter(k => st.pollutants[k].sub !== null);
  st.notReported = Object.keys(BREAKPOINTS).filter(k => !st.reported.includes(k));
}

const list = [...stations.values()].sort((a, b) => (b.aqi ?? -1) - (a.aqi ?? -1));
const withAqi = list.filter(s => s.aqi !== null);
// The city figure is the WORST STATION, NAMED. Taking a maximum across
// stations is the same gesture the index already makes across pollutants,
// and it is the only choice that matches a page about limits being broken.
// An average would hide exactly the station that matters.
const worst = withAqi[0] || null;

const out = {
  city: CITY,
  state: rows[0]?.state ?? null,
  // PROVENANCE. Written so the page can state its derivation, not just its source.
  source: {
    name: 'Central Pollution Control Board',
    via: 'data.gov.in — Real time Air Quality Index from various locations',
    resource: RESOURCE,
    url: `https://api.data.gov.in/resource/${RESOURCE}`,
    returns: 'per-station pollutant concentrations, NOT an AQI',
  },
  derivation: 'AQI computed from station concentrations using the CPCB breakpoint '
    + 'table in "About National Air Quality Index"; the station AQI is the worst '
    + 'sub-index, and the city figure is the worst station.',
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
  state_label: 'LIVE',
  observed: worst?.stamp ?? null,     // the station's own stamp
  fetched: { epochMs: Date.now() },   // when this job ran — a different thing
  limits: {
    'PM2.5': { h24: 60, annual: 40, unit: 'µg/m³', authority: 'CPCB, NAAQS 2009' },
    'PM10':  { h24: 100, annual: 60, unit: 'µg/m³', authority: 'CPCB, NAAQS 2009' },
  },
  aqiLimit: 100,
  bands: BANDS,
  // Published, not hidden: what the index here does NOT include, and why.
  excluded: Object.entries(EXCLUDED).map(([pollutant, reason]) => ({ pollutant, reason })),
  city_reading: worst && {
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

console.log(`${CITY}: ${rows.length} rows, ${list.length} stations, ${withAqi.length} with a computable AQI`);
if (worst) {
  console.log(`worst station: ${worst.station} — AQI ${worst.aqi} (${worst.band}), governed by ${worst.governing}`);
  console.log(`spread: ${out.spread.best.aqi} to ${out.spread.worst.aqi}; ${out.spread.above_limit} of ${withAqi.length} above 100`);
  console.log(`observed: ${worst.stamp?.raw}`);
}
console.log(`wrote ${OUT}`);
