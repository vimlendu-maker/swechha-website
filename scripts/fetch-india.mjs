#!/usr/bin/env node
/**
 * fetch-india.mjs — the national picture, on the same scale as the hero.
 *
 *   DATA_GOV_IN_KEY=... node scripts/fetch-india.mjs [out.json]
 *
 * WHY THIS IS A SEPARATE FILE FROM air-delhi.json. The hero prints one Delhi
 * reading; this prints where that reading SITS. The two must be computed the
 * same way or the comparison is meaningless, so the breakpoint table, the CO
 * exclusion and the worst-sub-index rule are all transcribed from
 * fetch-air.mjs verbatim and self-checked against CPCB's worked example before
 * a single request goes out.
 *
 * THE RULE THAT MAKES THE RANKING HONEST. A city's AQI here is its WORST
 * STATION, not the mean of its stations — because that is what CPCB's own
 * definition does one level down (a station's AQI is its worst sub-index, not
 * the mean of its pollutants). Averaging at the city level and not at the
 * station level would be a different method at each scale, and the resulting
 * table would rank cities by how many clean monitors they happen to own.
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
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const KEY = process.env.DATA_GOV_IN_KEY;
const OUT = resolve(process.argv[2] || 'data/air-india.json');
const RESOURCE = '3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69';
const LIMIT = 1000;

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
// CO and Pb excluded for the reason published on the page (D-15.9): the feed
// states no unit for CO, and CPCB defines CO in mg/m³ where all else is µg/m³.
const EXCLUDED = ['CO', 'PB'];
const AQI_LIMIT = 100;   // AQI 100 IS the NAAQS 24-hour standard.

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
  return 500;
}
const bandFor = (aqi) => BANDS.find(b => aqi >= b.idx[0] && aqi <= b.idx[1]) || BANDS[BANDS.length - 1];

/* ── SELF-CHECK, before any network call. CPCB's own worked example. ───── */
for (const [conc, want] of [[31, 51], [45, 75], [60, 100]]) {
  if (subIndex('PM2.5', conc) !== want) {
    console.error(`BREAKPOINT TABLE IS WRONG: PM2.5 ${conc} should be ${want}. Refusing to run.`);
    process.exit(1);
  }
}

const num = (v) => {
  const s = String(v ?? '').trim();
  if (!s || s === 'NA' || s === '-') return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};

/* ── FETCH. Paged, and `offset` is NOT optional. ───────────────────────── */
const rows = [];
for (let offset = 0; ; offset += LIMIT) {
  const url = `https://api.data.gov.in/resource/${RESOURCE}`
    + `?api-key=${encodeURIComponent(KEY)}&format=json&limit=${LIMIT}&offset=${offset}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!res.ok) { console.error(`upstream HTTP ${res.status}. Leaving the previous file alone.`); process.exit(1); }
  const body = await res.json();
  if (!Array.isArray(body?.records)) {
    console.error('unexpected response shape — no `records` array. Leaving the previous file alone.');
    process.exit(1);
  }
  rows.push(...body.records);
  process.stdout.write(`\rfetched ${rows.length} rows`);
  if (body.records.length < LIMIT) break;
  if (offset > 50000) { console.error('\nrunaway paging guard tripped.'); process.exit(1); }
}
process.stdout.write('\n');
if (!rows.length) { console.error('upstream returned no records at all. Refusing to publish an absence.'); process.exit(1); }

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
  const sub = subIndex(pol, num(r.avg_value));
  if (sub == null) continue;
  const key = `${city}|${st}`;
  if (!stations.has(key)) stations.set(key, { city, station: st, state: r.state ?? null, aqi: -1, governing: null,
    lat: num(r.latitude), lng: num(r.longitude) });
  const s = stations.get(key);
  if (sub > s.aqi) { s.aqi = sub; s.governing = pol; }
}

const cities = new Map();
for (const s of stations.values()) {
  if (s.aqi < 0) continue;
  if (!cities.has(s.city)) cities.set(s.city, { city: s.city, state: s.state, aqi: -1, station: null, governing: null, stations: 0 });
  const c = cities.get(s.city);
  c.stations++;
  if (s.aqi > c.aqi) { c.aqi = s.aqi; c.station = s.station; c.governing = s.governing; }
}

const ranked = [...cities.values()]
  .filter(c => c.aqi >= 0)
  .sort((a, b) => b.aqi - a.aqi)
  .map((c, i) => ({ rank: i + 1, ...c, band: bandFor(c.aqi).name,
    // The multiplier belongs to the CONCENTRATION, never the index: the AQI
    // is piecewise-linear, so 4x the index is not 4x the pollution. This is
    // published as "the index against the index limit" and labelled as such.
    index_multiple: +(c.aqi / AQI_LIMIT).toFixed(1) }));

const delhi = ranked.find(c => c.city.toLowerCase() === 'delhi') ?? null;
// The airshed argument: how many of the cities immediately behind Delhi are
// its own neighbours. Computed from the state field, not from a typed list.
const NCR_STATES = ['Haryana', 'Uttar Pradesh', 'Delhi', 'Rajasthan'];
const behind = delhi ? ranked.slice(delhi.rank, delhi.rank + 12) : [];
const neighbours = behind.filter(c => NCR_STATES.includes(String(c.state)));

const out = {
  subject: 'Every city reporting to CPCB, ranked, on CPCB\'s own scale',
  state_label: 'LIVE',
  method: 'A city\'s AQI is its WORST STATION; a station\'s AQI is its WORST SUB-INDEX. '
        + 'Never a mean, at either level — that is CPCB\'s own definition. CO and Pb excluded.',
  source: { name: 'CPCB via data.gov.in', resource: RESOURCE,
    url: 'https://data.gov.in/resource/real-time-air-quality-index-various-locations' },
  aqiLimit: AQI_LIMIT,
  observed: Object.entries(stampCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null,
  observed_spread: Object.keys(stampCount).length,
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
      + `${neighbours.length} of the next ${behind.length} are in its own airshed.`,
  } : null,
  caveats: [
    'A city with one monitor is not measured better than a city with forty. It is measured less. `stations` is on every row.',
    'The AQI is piecewise-linear, so a ratio of two index values is NOT a ratio of two concentrations. `index_multiple` compares index to index limit and nothing else.',
    'CO and Pb are excluded from every figure here, for the reason published on the page.',
    'A failed fetch leaves the previous file alone. It never writes a zero.',
  ],
  cities: ranked,
  fetched: { epochMs: Date.now() },
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');

console.log(`${out.totals.cities} cities, ${out.totals.stations} stations, observed ${out.observed}`);
console.log(`${out.totals.above_limit} above the limit, ${out.totals.good} "Good"`);
if (delhi) console.log(`Delhi: rank ${delhi.rank}, AQI ${delhi.aqi} (${delhi.band}) at ${delhi.station}`);
if (out.airshed) console.log(out.airshed.reading, '—', out.airshed.names.join(', '));
console.log('\ntop 10:');
for (const c of ranked.slice(0, 10)) {
  console.log(`  ${String(c.rank).padStart(3)}  ${String(c.aqi).padStart(3)}  ${c.city}, ${c.state ?? '—'}  (${c.stations} station${c.stations > 1 ? 's' : ''})`);
}
console.log(`\nwrote ${OUT}`);
