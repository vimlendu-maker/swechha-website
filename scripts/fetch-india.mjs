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
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
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
  const res = await fetch(url, { signal: AbortSignal.timeout(60000) });
  if (!res.ok) throw new Error(`upstream HTTP ${res.status}`);
  const body = await res.json();
  if (!Array.isArray(body?.records)) throw new Error('unexpected response shape — no `records` array');
  return body;
}
const KEY_OF = (r) => `${r.station}|${r.pollutant_id}`;

let rows = [];
let attempt = 0;
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
    const distinct = new Set(rows.map(KEY_OF)).size;
    process.stdout.write(`fetched ${rows.length} rows, ${distinct} distinct of ${total} expected\n`);
    // ROWS LOST IS THE FAILURE. Duplicates are harmless (same values); a
    // MISSING row silently strips a station of a channel and can flip its
    // governing pollutant, which is how Leh became "Good".
    if (distinct >= total) break;
    console.warn(`  integrity: ${total - distinct} row(s) lost to unstable paging — retrying`);
  } catch (e) {
    console.warn(`  attempt ${attempt} failed: ${e.message}`);
  }
  if (attempt >= 3) {
    console.error('upstream would not return a complete, distinct set in 3 attempts. '
      + 'Leaving the previous file alone — a partial snapshot publishes wrong readings, '
      + 'not missing ones, which is worse.');
    process.exit(1);
  }
  await new Promise(r => setTimeout(r, 800));
}
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
  // `avg_value` IS CPCB's published sub-index. Never convert it — see the
  // header of lib/air.ts for what converting it a second time cost.
  const sub = num(r.avg_value);
  if (sub == null || sub < 0) continue;
  /* A FLATLINED CHANNEL IS A STUCK INSTRUMENT, NOT A READING — same rule as
     lib/air.ts and fetch-air.mjs. Nine stations nationally were taking their
     entire AQI from a frozen channel. */
  const lo = num(r.min_value), hi = num(r.max_value);
  if (lo != null && hi != null && lo === hi && hi === sub) continue;
  const key = `${city}|${st}`;
  if (!stations.has(key)) stations.set(key, { city, station: st, state: r.state ?? null, aqi: -1, governing: null,
    pmSub: -1, lat: num(r.latitude), lng: num(r.longitude) });
  const s = stations.get(key);
  if (pol === 'PM2.5' || pol === 'PM10') s.pmSub = Math.max(s.pmSub, sub);
  if (sub > s.aqi) { s.aqi = sub; s.governing = pol; }
}

const cities = new Map();
for (const s of stations.values()) {
  if (s.aqi < 0) continue;
  if (!cities.has(s.city)) cities.set(s.city, { city: s.city, state: s.state, aqi: -1, station: null, governing: null, stations: 0 });
  const c = cities.get(s.city);
  c.stations++;
  c.sum = (c.sum || 0) + s.aqi;
  /* ★ THE RANKED FIGURE IS THE CITY'S WORST MONITOR — AD-42C, and it has to
     match the hero. Delhi's headline on the homepage is its worst monitor;
     if this table ranked Delhi by its mean, the hero and the panel under it
     would print two different numbers for the same city on the same screen,
     which is the exact defect D-21.6 was written to stop.
     The mean is kept as `meanAqi` — CPCB's own city definition, the
     comparable number, and the tripwire for the double conversion. */
  c.meanAqi = Math.round(c.sum / c.stations);
  if (s.aqi > (c.worstAqi ?? -1)) {
    c.worstAqi = s.aqi; c.station = s.station; c.governing = s.governing; c.pmSub = s.pmSub;
  }
  c.aqi = c.worstAqi;
}
/* SUSPECT, NOT SUPPRESSED. A gas standing far above clean particulates is
   either a genuine local source or an uncalibrated channel, and this feed
   cannot tell them apart. Leh ranked SECOND in India on one ozone channel
   beside a PM2.5 of 13. The row stays; the doubt travels with it. */
const GASES = new Set(['OZONE', 'CO', 'NO2', 'SO2', 'NH3']);
for (const c of cities.values()) {
  c.suspect = !!(GASES.has(c.governing) && c.worstAqi > AQI_LIMIT && c.pmSub >= 0 && c.pmSub < c.worstAqi / 2);
  c.suspectReason = c.suspect
    ? `Set by ${c.governing} alone: ${c.worstAqi} against a worst particulate of ${c.pmSub} at the same station.`
    : null;
}

const ranked = [...cities.values()]
  .filter(c => c.aqi >= 0)
  .sort((a, b) => b.aqi - a.aqi)
  .map((c, i) => ({ rank: i + 1, ...c, sum: undefined, band: bandFor(c.aqi).name,
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
  method: 'Read from CPCB\'s published per-pollutant sub-indexes; nothing here recomputes them. '
        + 'A station\'s AQI is its WORST sub-index, and a city is ranked here by its WORST MONITOR, '
        + 'named on every row. That is NOT CPCB\'s city definition — CPCB averages across a city\'s '
        + 'stations, and against its published figures for 73 cities this runs about 25 per cent '
        + 'higher. CPCB\'s mean is carried on every row as meanAqi so the comparable number is '
        + 'always to hand.',
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
    'A city\'s figure here is its WORST MONITOR, so a city with forty monitors has forty chances to produce a high one and a city with a single monitor has one. That cuts the opposite way from the mean: a well-monitored city ranks WORSE, not better, and a city with one monitor is a single reading wearing a city\'s name. Read `stations` before reading the rank, and `meanAqi` for the figure CPCB itself publishes.',
    'The AQI is piecewise-linear, so a ratio of two index values is NOT a ratio of two concentrations. `index_multiple` compares index to index limit and nothing else.',
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
