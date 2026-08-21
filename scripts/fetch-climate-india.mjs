#!/usr/bin/env node
/**
 * fetch-climate-india.mjs — extreme rain across INDIA, against IMD's own
 * published day-categories.
 *
 *   node scripts/fetch-climate-india.mjs [out.json]        # keyless
 *
 * Replaces the single-grid-point Delhi rainfall dataset, for the same reason
 * the heat page went national: floods, landslides and lightning kill in Kerala,
 * Himachal, Assam, Maharashtra and Odisha, and NCRB's counts are national.
 *
 * ★ THE THRESHOLD IS PUBLISHED, WHICH IS WHY THIS PAGE CAN COUNT BREACHES.
 * IMD classifies a rainfall DAY, and the boundaries are its own:
 *
 *     heavy            64.5 - 115.5 mm in 24 hours
 *     very heavy      115.6 - 204.4 mm
 *     extremely heavy      >= 204.5 mm
 *
 * So "an extremely heavy rainfall day" is a countable event against a notified
 * class, not an adjective. Same discipline as the heat page's use of IMD's
 * departure criteria.
 *
 * ★ WHAT THIS JOB DELIBERATELY DOES NOT COUNT: CLOUDBURSTS.
 * IMD defines a cloudburst as 100 mm or more in ONE HOUR. Two problems, and
 * both are fatal to counting it here:
 *   1. ERA5 is a ~9 km reanalysis. It smooths convection, so a real cloudburst
 *      appears in it as an ordinary wet hour. Counting hours over 100 mm would
 *      return approximately zero everywhere and that zero would be an artefact
 *      of the instrument, not a fact about India.
 *   2. There is no public national cloudburst register to check against.
 * So the page NAMES the hole instead. A zero produced by the wrong instrument
 * is the same class of lie as a FIRMS error body read as "no fires" (D-16.4).
 *
 * The DEATHS on this page come from NCRB, not from here: flood, landslide,
 * lightning, torrential rain and cyclone are five rows of one official table,
 * committed separately in data/deaths-ncrb-2024.json.
 *
 * REANALYSIS IS MODELLED, and rain is far more local than heat. One gauge can
 * record a cloudburst that another two kilometres away never sees. Every figure
 * here is stamped `modelled`.
 *
 * Local Date getters only, never toISOString.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const OUT = resolve(process.argv[2] || 'data/climate-india.json');
const NORM_FROM = 1991, NORM_TO = 2020;
const UA = 'SwechhaBot/1.0 (https://swechha.in; vimlendu@swechha.in)';

/* ── IMD's PUBLISHED DAY CATEGORIES. Constants, transcribed. ───────────── */
const CAT = {
  authority: 'India Meteorological Department — 24-hour rainfall day categories',
  heavy: 64.5, very_heavy: 115.6, extremely_heavy: 204.5,
  rainy_day: 2.5,
  unit: 'mm in 24 hours',
  note: 'IMD classifies a DAY, not a storm. 200 mm in three hours and 200 mm spread over a full '
      + 'day are the same category and are not the same event.',
};
const MONSOON = { from: '06-01', to: '09-30', label: '1 June to 30 September' };

/* ── THE STATIONS. Chosen for where extreme rain actually does damage:
      the Western Ghats, the Himalayan foothills, the northeast, the east
      coast, and the two megacities that flood. ─────────────────────────── */
const STATIONS = [
  { name: 'Delhi',        state: 'Delhi',            lat: 28.6139, lng: 77.2090 },
  { name: 'Mumbai',       state: 'Maharashtra',      lat: 19.0760, lng: 72.8777 },
  { name: 'Chennai',      state: 'Tamil Nadu',       lat: 13.0827, lng: 80.2707 },
  { name: 'Kolkata',      state: 'West Bengal',      lat: 22.5726, lng: 88.3639 },
  { name: 'Bengaluru',    state: 'Karnataka',        lat: 12.9716, lng: 77.5946 },
  { name: 'Kochi',        state: 'Kerala',           lat: 9.9312,  lng: 76.2673 },
  { name: 'Mangaluru',    state: 'Karnataka',        lat: 12.9141, lng: 74.8560 },
  { name: 'Shimla',       state: 'Himachal Pradesh', lat: 31.1048, lng: 77.1734 },
  { name: 'Dehradun',     state: 'Uttarakhand',      lat: 30.3165, lng: 78.0322 },
  { name: 'Guwahati',     state: 'Assam',            lat: 26.1445, lng: 91.7362 },
  { name: 'Bhubaneswar',  state: 'Odisha',           lat: 20.2961, lng: 85.8245 },
  { name: 'Patna',        state: 'Bihar',            lat: 25.5941, lng: 85.1376 },
];

// Local getters only.
const now = new Date();
const Y = now.getFullYear(), M = now.getMonth() + 1, D = now.getDate();
const pad = (n) => String(n).padStart(2, '0');
const TODAY = `${Y}-${pad(M)}-${pad(D)}`;
const nowMd = `${pad(M)}-${pad(D)}`;
const inMonsoon = nowMd >= MONSOON.from && nowMd <= MONSOON.to;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

/* Rate-limit handling, learned on the heat job: five of fourteen stations came
   back 429 when asked back to back. Pace, retry with backoff, and OMIT a
   station that still fails rather than backfilling it. */
async function pull(st) {
  const url = 'https://archive-api.open-meteo.com/v1/archive'
    + `?latitude=${st.lat}&longitude=${st.lng}`
    + `&start_date=${NORM_FROM}-01-01&end_date=${TODAY}`
    + '&daily=precipitation_sum&timezone=Asia%2FKolkata';
  let body = null, lastErr = null;
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA } });
      if (res.status === 429 || res.status === 503) { lastErr = `HTTP ${res.status}`; await sleep(attempt * 8000); continue; }
      if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
      body = await res.json(); break;
    } catch (e) { lastErr = `network: ${e.message}`; await sleep(attempt * 4000); }
  }
  if (!body) return { ok: false, error: `${lastErr} after 5 attempts` };
  const d = body?.daily;
  // Validate the SHAPE, not the status.
  if (!d || !Array.isArray(d.time) || !Array.isArray(d.precipitation_sum)
      || d.time.length !== d.precipitation_sum.length || d.time.length < 10000) {
    return { ok: false, error: 'unexpected response shape' };
  }
  return { ok: true, days: d.time.map((t, i) => ({ date: t, rain: d.precipitation_sum[i] })) };
}

const classify = (mm) => mm == null ? null
  : mm >= CAT.extremely_heavy ? 'extremely_heavy'
  : mm >= CAT.very_heavy ? 'very_heavy'
  : mm >= CAT.heavy ? 'heavy' : null;

function analyse(st, days) {
  const yrs = [];
  for (let y = NORM_FROM; y <= Y; y++) {
    // WHOLE YEAR, not just the monsoon: Chennai's extreme rain is the northeast
    // monsoon in October and November, and a June-September window would miss it
    // entirely. The monsoon total is reported separately.
    const all = days.filter(d => Number(d.date.slice(0, 4)) === y && d.rain != null);
    if (!all.length) continue;
    const mon = all.filter(d => d.date.slice(5) >= MONSOON.from && d.date.slice(5) <= MONSOON.to);
    const counts = { heavy: 0, very_heavy: 0, extremely_heavy: 0 };
    for (const d of all) { const c = classify(d.rain); if (c) counts[c]++; }
    const sorted = [...all].sort((a, b) => b.rain - a.rain);
    const total = +all.reduce((a, b) => a + b.rain, 0).toFixed(1);
    const monTotal = +mon.reduce((a, b) => a + b.rain, 0).toFixed(1);
    const top5 = sorted.slice(0, 5).reduce((a, b) => a + b.rain, 0);
    yrs.push({
      year: y,
      complete: y < Y,
      annual_mm: total,
      monsoon_mm: monTotal,
      rainy_days: all.filter(d => d.rain >= CAT.rainy_day).length,
      categories: counts,
      extreme_days: counts.heavy + counts.very_heavy + counts.extremely_heavy,
      wettest_day: sorted[0] ? { date: sorted[0].date, mm: +sorted[0].rain.toFixed(1), category: classify(sorted[0].rain) } : null,
      // THE DEVICE: what share of a year's rain falls in its five biggest days.
      top5_share_pct: total > 0 ? +(top5 / total * 100).toFixed(1) : null,
    });
  }
  const complete = yrs.filter(y => y.complete);
  const norm = complete.filter(y => y.year >= NORM_FROM && y.year <= NORM_TO);
  const mean = (s, f) => s.length ? +(s.reduce((a, b) => a + (f(b) ?? 0), 0) / s.length).toFixed(1) : null;
  const half = (from, to) => {
    const s = complete.filter(y => y.year >= from && y.year <= to);
    return s.length ? { from, to, years: s.length,
      annual_mm: mean(s, y => y.annual_mm),
      extreme_days: mean(s, y => y.extreme_days),
      very_heavy_plus: mean(s, y => y.categories.very_heavy + y.categories.extremely_heavy),
      top5_share_pct: mean(s, y => y.top5_share_pct) } : null;
  };
  const h1 = half(NORM_FROM, 2008), h2 = half(2009, complete[complete.length - 1].year);
  const dir = (a, b) => (a == null || b == null) ? null : b > a ? 'up' : b < a ? 'down' : 'flat';
  const wettest = complete.reduce((a, b) =>
    (b.wettest_day && (!a.wettest_day || b.wettest_day.mm > a.wettest_day.mm) ? b : a));

  // Season to date, against THE SAME DATES in the normal window. Comparing a
  // part-season to a whole-season normal is the commonest rainfall lie there is,
  // and it always makes the season look dry.
  const sdEnd = nowMd < MONSOON.from ? MONSOON.from : (nowMd > MONSOON.to ? MONSOON.to : nowMd);
  const toDate = (y) => {
    const s = days.filter(d => Number(d.date.slice(0, 4)) === y
      && d.date.slice(5) >= MONSOON.from && d.date.slice(5) <= sdEnd && d.rain != null);
    return s.length ? +s.reduce((a, b) => a + b.rain, 0).toFixed(1) : null;
  };
  const sdNow = toDate(Y);
  const sdSet = [];
  for (let y = NORM_FROM; y <= NORM_TO; y++) { const v = toDate(y); if (v != null) sdSet.push(v); }
  const sdNorm = sdSet.length ? +(sdSet.reduce((a, b) => a + b, 0) / sdSet.length).toFixed(1) : null;

  return {
    ...st,
    years: yrs, halves: [h1, h2],
    direction: {
      annual_mm: dir(h1?.annual_mm, h2?.annual_mm),
      extreme_days: dir(h1?.extreme_days, h2?.extreme_days),
      very_heavy_plus: dir(h1?.very_heavy_plus, h2?.very_heavy_plus),
      top5_share_pct: dir(h1?.top5_share_pct, h2?.top5_share_pct),
    },
    normal: {
      window: `${NORM_FROM}-${NORM_TO}`,
      annual_mm: mean(norm, y => y.annual_mm),
      monsoon_mm: mean(norm, y => y.monsoon_mm),
      extreme_days: mean(norm, y => y.extreme_days),
    },
    records: { wettest_day: { ...wettest.wettest_day, year: wettest.year } },
    season_to_date: {
      to: sdEnd, mm: sdNow, normal_mm: sdNorm,
      departure_mm: (sdNow != null && sdNorm != null) ? +(sdNow - sdNorm).toFixed(1) : null,
      departure_pct: (sdNow != null && sdNorm) ? +((sdNow - sdNorm) / sdNorm * 100).toFixed(1) : null,
    },
    last_complete: complete[complete.length - 1],
  };
}

/* ── RUN ────────────────────────────────────────────────────────────────── */
console.log(`Extreme rain across India — ${STATIONS.length} stations, ${NORM_FROM} to ${TODAY}`);
console.log(`monsoon ${MONSOON.label}: ${inMonsoon ? 'IN SEASON' : 'out of season'}\n`);
const stations = [], failures = [];
for (const st of STATIONS) {
  await sleep(1200);
  const r = await pull(st);
  if (!r.ok) { failures.push({ name: st.name, state: st.state, error: r.error });
    console.log(`  ${st.name.padEnd(13)} FAILED — ${r.error}`); continue; }
  const a = analyse(st, r.days);
  stations.push(a);
  const L = a.last_complete;
  console.log(`  ${st.name.padEnd(13)} ${String(L.annual_mm).padStart(7)} mm in ${L.year}  ` +
    `(normal ${String(a.normal.annual_mm).padStart(7)})  extreme days ${String(L.extreme_days).padStart(3)}  ` +
    `wettest ${String(a.records.wettest_day.mm).padStart(6)} mm (${a.records.wettest_day.year})  ` +
    `top5 = ${L.top5_share_pct}%`);
}
if (!stations.length) {
  console.error('\nEvery station failed. Leaving the previous file alone rather than publishing an absence.');
  process.exit(1);
}

const dirCount = (k) => {
  const c = { up: 0, down: 0, flat: 0 };
  for (const s of stations) { const d = s.direction[k]; if (d) c[d]++; }
  return c;
};
const DIRS = ['annual_mm', 'extreme_days', 'very_heavy_plus', 'top5_share_pct'];
const consensus = Object.fromEntries(DIRS.map(k => [k, dirCount(k)]));
const wettestEver = stations.reduce((a, b) =>
  (b.records.wettest_day.mm > a.records.wettest_day.mm ? b : a));
const mostExtreme = stations.reduce((a, b) =>
  (b.last_complete.extreme_days > a.last_complete.extreme_days ? b : a));

const out = {
  subject: 'Extreme rain in India',
  scope: 'national — 12 grid points across the Western Ghats, the Himalayan foothills, the northeast, '
       + 'the east coast and the two megacities that flood',
  kind: 'modelled',
  kind_reason: 'ERA5 reanalysis — a model constrained by observations. Rain is far more local than '
             + 'heat: one gauge can record a cloudburst another two kilometres away never sees, and '
             + 'a 9 km cell has one answer.',
  source: {
    name: 'Open-Meteo ERA5 archive',
    url: 'https://archive-api.open-meteo.com/v1/archive',
    upstream: 'ECMWF ERA5 / ERA5-Land reanalysis',
    note: 'keyless; 35 years per station in one request',
  },
  state_label: 'PERIODIC',
  season: { ...MONSOON, in_season: inMonsoon },
  categories: CAT,
  window_note: 'Extreme-rain days are counted over the WHOLE YEAR, not just the monsoon. Chennai\'s '
             + 'extreme rain is the northeast monsoon in October and November, and a June-September '
             + 'window would miss it entirely. The monsoon total is reported separately per station.',
  stations,
  national: {
    stations_reporting: stations.length,
    stations_requested: STATIONS.length,
    stations_omitted: failures,
    omitted_note: failures.length
      ? 'These stations did not answer and are OMITTED. They are not backfilled or interpolated.'
      : null,
    wettest_day_on_record: { name: wettestEver.name, state: wettestEver.state, ...wettestEver.records.wettest_day },
    most_extreme_days_last_year: { name: mostExtreme.name, state: mostExtreme.state,
      days: mostExtreme.last_complete.extreme_days, year: mostExtreme.last_complete.year },
    total_extreme_days_last_year: stations.reduce((a, s) => a + s.last_complete.extreme_days, 0),
    total_note: 'A sum of station-days, NOT a national count of extreme rainfall days. Different '
              + 'quantities, and this site does not blur them.',
    consensus,
    consensus_note: 'How many of the reporting stations move each way between the first and second '
                  + 'halves of the record. Counted as stations, never averaged into a national trend.',
  },
  holes: [
    'CLOUDBURSTS ARE NOT COUNTED. IMD defines one as 100 mm or more in a single hour. ERA5 is a '
      + '~9 km reanalysis that smooths convection, so a real cloudburst appears in it as an ordinary '
      + 'wet hour — counting them here would return roughly zero everywhere, and that zero would be '
      + 'a fact about the instrument, not about India. There is also no public national cloudburst '
      + 'register to check against.',
    'FLASH FLOODS ARE NOT COUNTED for the same reason: there is no public national register of flash '
      + 'flood events, and rainfall alone does not determine whether one happens — terrain, land use '
      + 'and drainage do.',
    'LANDSLIDE COUNTS are not published nationally either. NCRB publishes landslide DEATHS, which is '
      + 'a different quantity and is used instead, from its own table.',
    'India\'s official rainfall departures are IMD\'s, computed on its own gauge network by '
      + 'subdivision. These are computed here from a reanalysis and are not IMD\'s figures.',
  ],
  caveats: [
    CAT.note,
    'ERA5 is a reanalysis. Every figure here is modelled, and marked as modelled.',
    'A grid point is not a city, and rain is more local than any other variable on this site.',
    'A total is not a reading without its normal beside it.',
    'Season-to-date is compared with the SAME CALENDAR DATES in the normal window, never with a '
      + 'whole-season normal. The second comparison always makes a season look dry.',
    'The current year is incomplete and is excluded from every record, mean and trend.',
  ],
  fetched: { epochMs: Date.now() },
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');

console.log(`\nNATIONAL`);
console.log(`  wettest day:    ${out.national.wettest_day_on_record.name} ` +
  `${out.national.wettest_day_on_record.mm} mm on ${out.national.wettest_day_on_record.date}`);
console.log(`  most extreme:   ${out.national.most_extreme_days_last_year.name} — ` +
  `${out.national.most_extreme_days_last_year.days} days in ${out.national.most_extreme_days_last_year.year}`);
console.log(`  station-days:   ${out.national.total_extreme_days_last_year}`);
console.log('\n  direction, first half -> second half, counted across stations:');
for (const [k, v] of Object.entries(consensus)) {
  console.log(`    ${k.padEnd(16)} up ${String(v.up).padStart(2)}  down ${String(v.down).padStart(2)}  flat ${String(v.flat).padStart(2)}`);
}
console.log(`\nwrote ${OUT}`);
