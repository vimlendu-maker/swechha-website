#!/usr/bin/env node
/**
 * fetch-fires.mjs — NASA FIRMS active-fire detections, per sensor.
 *
 *   FIRMS_MAP_KEY=... node scripts/fetch-fires.mjs [out.json]
 *
 * WHY THIS COUNTS THE SAME FIRES MORE THAN ONCE, ON PURPOSE (D-13.4).
 * The number of "farm fires" reported in Indian media depends entirely on
 * which satellite produced it, and almost no report says which. Measured
 * over Punjab + Haryana + NCR for the five days to 20 August 2026:
 *
 *     MODIS        (1 km pixel)    1 detection
 *     VIIRS S-NPP  (375 m pixel)  24 detections
 *     VIIRS NOAA-20(375 m pixel)  14 detections
 *
 * That is not a scaling factor — at these fire sizes MODIS mostly does not
 * detect at all. And the two VIIRS instruments are identical: they differ
 * because they pass overhead at different times. So this job publishes a
 * count PER SENSOR and never a single total, because a single total would
 * be a choice disguised as a measurement.
 *
 * DO NOT SUM THE VIIRS ROWS. S-NPP and NOAA-20 see the same fires.
 *
 * THE GUARD THAT MATTERS. FIRMS answers a bad request with a plain-text
 * message and HTTP 200 — `Invalid day range. Expects [1..5].` A CSV parser
 * reads that as zero rows, and this job would then publish "no fires" when
 * the truth is "the request failed". On a page whose subject is the
 * difference between those two statements, that is the worst bug available.
 * So: the header is validated, and a failed source is recorded as `null`,
 * never as 0.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const KEY = process.env.FIRMS_MAP_KEY;
const OUT = resolve(process.argv[2] || 'data/fires-nw-india.json');
const DAYS = Number(process.env.FIRMS_DAYS || 5);   // NRT is capped at 5
// Punjab + Haryana + Delhi-NCR + north Rajasthan: west,south,east,north
const AREA = process.env.FIRMS_AREA || '73.5,27.5,78.5,32.5';
const AREA_LABEL = 'Punjab, Haryana and Delhi-NCR';

const SENSORS = [
  { id: 'MODIS_NRT',        label: 'MODIS',         platform: 'Terra / Aqua', pixel: '1 km' },
  { id: 'VIIRS_SNPP_NRT',   label: 'VIIRS S-NPP',   platform: 'Suomi NPP',    pixel: '375 m' },
  { id: 'VIIRS_NOAA20_NRT', label: 'VIIRS NOAA-20', platform: 'NOAA-20',      pixel: '375 m' },
];

if (!KEY) {
  console.error('FIRMS_MAP_KEY is not set. Refusing to run.\n' +
    'Get a free key at https://firms.modaps.eosdis.nasa.gov/api/map_key/ — never commit it.');
  process.exit(1);
}
if (!(DAYS >= 1 && DAYS <= 5)) {
  console.error(`FIRMS_DAYS must be 1..5 for the NRT endpoint; got ${DAYS}.`);
  process.exit(1);
}

async function pull(sensor) {
  const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${KEY}/${sensor.id}/${AREA}/${DAYS}`;
  const res = await fetch(url);
  const text = await res.text();
  const firstLine = (text.split('\n')[0] || '').trim();

  // FIRMS returns 200 with a prose error. Validate the header, not the status.
  if (!res.ok || !firstLine.startsWith('latitude,longitude')) {
    return { ok: false, error: res.ok ? firstLine.slice(0, 160) : `HTTP ${res.status}`, count: null, detections: [] };
  }

  const lines = text.trim().split('\n');
  const cols = lines[0].split(',');
  const rows = lines.slice(1).filter(Boolean).map(l => {
    const v = l.split(',');
    return Object.fromEntries(cols.map((c, i) => [c, v[i]]));
  });
  const byDate = {};
  for (const r of rows) byDate[r.acq_date] = (byDate[r.acq_date] || 0) + 1;
  return {
    ok: true, error: null, count: rows.length, byDate,
    // Confidence is encoded DIFFERENTLY per sensor — MODIS gives 0-100,
    // VIIRS gives l/n/h — so the two cannot be filtered on one threshold.
    // Published as-is rather than normalised into a false equivalence.
    confidence: rows.reduce((a, r) => (a[r.confidence] = (a[r.confidence] || 0) + 1, a), {}),
    detections: rows.map(r => ({
      lat: Number(r.latitude), lng: Number(r.longitude),
      date: r.acq_date, time: r.acq_time,
      confidence: r.confidence, frp: r.frp ? Number(r.frp) : null,
      dayNight: r.daynight,
    })),
  };
}

/* ── THE ARCHIVE (D-20.1) ─────────────────────────────────────────────────
   `MODIS_SP` / `VIIRS_SNPP_SP` serve standard-processing history; MODIS
   reaches back to 2000. The archive caps at 5 days per request exactly like
   NRT, so year-on-year is a FIXED WINDOW SAMPLED ONCE A YEAR — comparable by
   construction, and the caption must say so.
   A 5-DAY WINDOW IS A SAMPLE, NOT A SEASON TOTAL. Burning dates shift with
   monsoon withdrawal and harvest timing, so a fixed window can miss a peak.
   Published as a sample or it is a different claim from the one the data
   supports. */
const PEAK_WINDOW = process.env.FIRMS_PEAK_WINDOW || '11-05';   // 5-9 November
const YEARS = (process.env.FIRMS_YEARS || '2019,2020,2021,2022,2023,2024,2025').split(',');

async function archive(sensorId, date) {
  const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${KEY}/${sensorId}/${AREA}/5/${date}`;
  const res = await fetch(url);
  const text = await res.text();
  if (!res.ok || !(text.split('\n')[0] || '').trim().startsWith('latitude,longitude')) {
    return { ok: false, error: res.ok ? text.slice(0, 120).trim() : `HTTP ${res.status}`, count: null };
  }
  return { ok: true, error: null, count: text.trim().split('\n').length - 1 };
}

const results = {};
for (const s of SENSORS) {
  results[s.id] = { ...s, ...(await pull(s)) };
  const r = results[s.id];
  console.log(`${s.label.padEnd(14)} ${s.pixel.padEnd(6)} ` +
    (r.ok ? `${String(r.count).padStart(4)} detections` : `FAILED — ${r.error}`));
}

const okOnes = Object.values(results).filter(r => r.ok);
if (!okOnes.length) {
  console.error('Every sensor failed. Leaving the previous file alone rather than writing zeroes.');
  process.exit(1);
}

// Year on year, one fixed window per year, MODIS for the long reach.
const yearOnYear = [];
for (const y of YEARS) {
  const r = await archive('MODIS_SP', `${y}-${PEAK_WINDOW}`);
  yearOnYear.push({ year: y, window: `${y}-${PEAK_WINDOW} +5d`, ...r });
  console.log(`  archive ${y}-${PEAK_WINDOW}  ` + (r.ok ? `${String(r.count).padStart(5)} detections` : `FAILED — ${r.error}`));
}
// The season, both sensors, so the sensor gap can be compared across seasons.
const peakYear = YEARS[YEARS.length - 1];
const season = {
  window: `${peakYear}-${PEAK_WINDOW} +5d`,
  modis: await archive('MODIS_SP', `${peakYear}-${PEAK_WINDOW}`),
  viirs: await archive('VIIRS_SNPP_SP', `${peakYear}-${PEAK_WINDOW}`),
};

const modis = results['MODIS_NRT'];
const viirs = results['VIIRS_SNPP_NRT'];

const out = {
  region: AREA_LABEL,
  bbox: AREA,
  window: { days: DAYS, note: 'FIRMS near-real-time is capped at 5 days by the API.' },
  source: {
    name: 'NASA FIRMS — Fire Information for Resource Management System',
    url: 'https://firms.modaps.eosdis.nasa.gov/',
    product: 'active fire / thermal anomaly detections, near real-time',
  },
  state_label: 'PERIODIC',
  // The whole point of the file.
  caveats: [
    'A detection is a thermal anomaly, not a confirmed crop fire.',
    'Counts are PER SENSOR and are not comparable across sensors: MODIS has a 1 km pixel and VIIRS 375 m, so VIIRS detects smaller fires that MODIS misses entirely.',
    'VIIRS S-NPP and VIIRS NOAA-20 observe the same fires at different overpass times. Their counts must not be added.',
    'Near-real-time counts are indicative; NASA publishes science-quality data months later and the two differ.',
    'Confidence is encoded differently per sensor (MODIS 0–100, VIIRS low/nominal/high), so one threshold cannot filter both.',
  ],
  comparison: (modis.ok && viirs.ok) ? {
    modis: modis.count, viirs_snpp: viirs.count,
    statement: `Same region, same ${DAYS} days: MODIS detected ${modis.count}, VIIRS S-NPP detected ${viirs.count}.`,
  } : null,
  // ★ THE SENSOR GAP IS ITSELF SEASONAL, and that is a finding rather than
  // a caveat. Out of season MODIS:VIIRS ran 1:24; at peak it runs about
  // 1:1.9. MODIS misses almost everything when the fires are small and
  // catches most of it when they are large — so the gap between the two
  // sensors is a measurement of FIRE SIZE, not of instrument error.
  sensor_gap: (modis.ok && viirs.ok && season.modis.ok && season.viirs.ok) ? {
    off_season: { modis: modis.count, viirs: viirs.count,
      ratio: modis.count > 0 ? +(viirs.count / modis.count).toFixed(1) : null },
    peak_season: { window: season.window, modis: season.modis.count, viirs: season.viirs.count,
      ratio: season.modis.count > 0 ? +(season.viirs.count / season.modis.count).toFixed(1) : null },
    reading: 'The disagreement between the two sensors narrows at peak season, because peak '
           + 'fires are large enough for a 1 km MODIS pixel to see. The gap measures fire size.',
  } : null,
  year_on_year: {
    sensor: 'MODIS_SP', window: `5 days from ${PEAK_WINDOW} each year`,
    caveat: 'A fixed 5-day window is a SAMPLE, not a season total. Burning dates shift with '
          + 'monsoon withdrawal and harvest timing, so a fixed window can miss a peak.',
    series: yearOnYear,
  },
  season,
  sensors: Object.values(results).map(r => ({
    id: r.id, label: r.label, platform: r.platform, pixel: r.pixel,
    ok: r.ok, error: r.error, count: r.count,
    byDate: r.byDate ?? null, confidence: r.confidence ?? null,
    detections: r.detections,
  })),
  fetched: { epochMs: Date.now() },
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');
console.log(`\nwrote ${OUT}`);
if (out.comparison) console.log(out.comparison.statement);
