#!/usr/bin/env node
/**
 * fetch-crosscheck.mjs — WAQI, as a CROSS-CHECK and a forecast. Never as
 * the page's reading.
 *
 *   WAQI_TOKEN=... node scripts/fetch-crosscheck.mjs [out.json]
 *
 * WHY THIS IS NOT THE READING (the finding that produced this file).
 * WAQI publishes on the **US EPA 2016 AQI scale** — its own scale page says
 * so. CPCB's National AQI is a different scale. Measured on 21 August 2026
 * for the same station in the same hour:
 *
 *     Anand Vihar, WAQI (US EPA scale)      212
 *     Anand Vihar, computed from CPCB       392
 *
 * 180 points apart. And it is NOT purely the scale: US EPA 212 back-solves
 * to PM2.5 ~162 µg/m³, while CPCB reported 240 µg/m³ at that station in
 * that hour. So the two publishers are not even working from the same
 * concentration — different averaging windows, different pipelines (WAQI
 * credits dpccairdata.com).
 *
 * WAQI exposes index values only, never concentrations, so **the scale
 * effect cannot be separated from the data effect**. This file therefore
 * publishes both numbers and refuses to reconcile them. The honest claim,
 * and the only one this data supports, is:
 *
 *   "Two organisations publish an index for this station. One says 212, the
 *    other 392. Part of that is a different scale, part is a different
 *    averaging window, and neither number tells you which you are seeing."
 *
 * Do not convert one scale to the other. Do not average them. Do not put a
 * WAQI number in the hero.
 */
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const TOKEN = process.env.WAQI_TOKEN;
const OUT = resolve(process.argv[2] || 'data/air-crosscheck.json');
const PRIMARY = resolve(process.env.AIR_PRIMARY || 'data/air-delhi.json');
// Delhi-NCR bounding box: lat1,lng1,lat2,lng2
const BOUNDS = process.env.WAQI_BOUNDS || '28.40,76.84,28.88,77.35';

if (!TOKEN) {
  console.error('WAQI_TOKEN is not set. Refusing to run.\n' +
    'Get a free token at https://aqicn.org/data-platform/token/ — never commit it.');
  process.exit(1);
}

async function waqi(path) {
  const url = `https://api.waqi.info${path}${path.includes('?') ? '&' : '?'}token=${encodeURIComponent(TOKEN)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`WAQI HTTP ${res.status}`);
  const body = await res.json();
  // WAQI signals failure in the body, not the status code.
  if (body.status !== 'ok') throw new Error(`WAQI status "${body.status}": ${JSON.stringify(body.data).slice(0, 120)}`);
  return body.data;
}

/* ── STATIONS IN THE BOX ─────────────────────────────────────────────── */
const map = await waqi(`/map/bounds/?latlng=${BOUNDS}`);
const stations = map
  .filter(s => /^\d+$/.test(String(s.aqi)))
  .map(s => ({
    name: s.station?.name ?? null, uid: s.uid,
    lat: Number(s.lat), lng: Number(s.lon),
    aqi_us_epa: Number(s.aqi), stamp: s.station?.time ?? null,
  }))
  .sort((a, b) => b.aqi_us_epa - a.aqi_us_epa);

/* ── THE FORECAST. Real, attributable, and NOT the Indian government's. ─
   D-13.2 concluded a forecast was not wireable because SAFAR has no public
   API. That conclusion was wrong: WAQI returns a daily PM2.5/PM10 forecast.
   It is WAQI's own model. SAFAR (IITM Pune, operationalised by IMD) remains
   the official Indian forecaster and the page still names it.
   Past days are dropped — the array spans backwards as well as forwards.  */
const feed = await waqi('/feed/delhi/');
const today = (() => { const d = new Date(); // local getters only
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })();
const daily = feed.forecast?.daily ?? {};
const forecast = Object.fromEntries(Object.entries(daily).map(([pol, days]) => [
  pol, days.filter(d => d.day >= today).map(d => ({ day: d.day, min: d.min, avg: d.avg, max: d.max })),
]));

/* ── THE COMPARISON, against our own primary reading ─────────────────── */
let comparison = null;
if (existsSync(PRIMARY)) {
  const primary = JSON.parse(readFileSync(PRIMARY, 'utf8'));
  const ours = primary.city_reading;
  if (ours) {
    // Match on the station's own name; CPCB writes "Anand Vihar, Delhi - DPCC",
    // WAQI writes "Anand Vihar, Delhi, Delhi, India". Compare the first part.
    const key = String(ours.station).split(',')[0].trim().toLowerCase();
    const theirs = stations.find(s => String(s.name).toLowerCase().startsWith(key));
    if (theirs) {
      const gov = ours.pollutants?.[ours.governing];
      comparison = {
        station: { cpcb: ours.station, waqi: theirs.name },
        cpcb_scale_aqi: ours.aqi,
        waqi_us_epa_aqi: theirs.aqi_us_epa,
        difference: ours.aqi - theirs.aqi_us_epa,
        cpcb_concentration: gov ? { pollutant: ours.governing, conc: gov.conc, unit: gov.unit } : null,
        why: 'Two causes, and this data cannot separate them: (1) different scales — '
           + 'WAQI publishes on the US EPA 2016 standard, this site computes on CPCB\'s '
           + 'National AQI; (2) different underlying concentrations and averaging windows. '
           + 'WAQI exposes index values only, never concentrations, so the two effects '
           + 'cannot be told apart from the outside.',
        forbidden: 'Do not convert between the scales, average the two numbers, or present '
           + 'either as a correction of the other.',
      };
    }
  }
}

const out = {
  role: 'cross-check and forecast only — never the page reading',
  source: {
    name: 'World Air Quality Index project (WAQI / aqicn.org)',
    url: 'https://waqi.info/',
    scale: 'US EPA 2016 AQI',
    scale_url: 'https://aqicn.org/scale/',
    attributions: feed.attributions ?? [],
  },
  state_label: 'PERIODIC',
  observed: feed.time ?? null,
  coverage: {
    waqi_stations_in_box: stations.length,
    note: 'CPCB via data.gov.in returned 43 Delhi stations for the same city; '
        + 'WAQI lists fewer. The two sources do not agree on how many stations exist, '
        + 'which is itself part of the coverage story.',
  },
  stations,
  comparison,
  forecast: {
    model: 'WAQI\'s own model, not CPCB\'s and not SAFAR\'s',
    official_indian_forecaster: {
      name: 'SAFAR — System of Air Quality and Weather Forecasting And Research',
      by: 'IITM Pune, operationalised by IMD',
      url: 'https://safar.tropmet.res.in/',
      note: 'Publishes a 72-hour Delhi forecast. No documented public API, so it is '
          + 'linked and named, never scraped or restated.',
    },
    from: today,
    daily: forecast,
  },
  fetched: { epochMs: Date.now() },
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');

console.log(`WAQI stations in box: ${stations.length}  (worst ${stations[0]?.aqi_us_epa} ${stations[0]?.name})`);
if (comparison) {
  console.log(`CROSS-CHECK  ${comparison.station.cpcb}`);
  console.log(`  CPCB scale (ours): ${comparison.cpcb_scale_aqi}   WAQI US-EPA scale: ${comparison.waqi_us_epa_aqi}   difference: ${comparison.difference}`);
  if (comparison.cpcb_concentration) console.log(`  CPCB concentration: ${comparison.cpcb_concentration.pollutant} ${comparison.cpcb_concentration.conc} ${comparison.cpcb_concentration.unit}`);
}
for (const [pol, days] of Object.entries(forecast)) console.log(`forecast ${pol}: ${days.length} days from ${today}`);
console.log(`wrote ${OUT}`);
