#!/usr/bin/env node
/**
 * fetch-forest-fire.mjs — NASA FIRMS thermal-anomaly detections over India.
 *
 *   FIRMS_MAP_KEY=... node scripts/fetch-forest-fire.mjs [out.json]
 *
 * ★★ THE MOST IMPORTANT SENTENCE IN THIS FILE ★★
 * FIRMS DOES NOT DETECT FOREST FIRES. It detects thermal anomalies — anything
 * on the ground hot enough to show in a 375 m infrared pixel. Over India in
 * March that is forest canopy, wheat and sugarcane residue, brick kilns, gas
 * flares and rubbish fires, and the satellite cannot tell them apart.
 * Separating them needs each pixel intersected with a forest mask, which this
 * build does not have.
 *
 * So this job publishes DETECTIONS, the unit says "detections", and the page
 * puts India's own Forest Survey figures beside it as the forest-specific
 * layer. Calling this number "forest fires" would be the identical error to
 * calling a computed AQI "CPCB's AQI", which D-15.8 already forbids. The hole
 * is named rather than filled, per the template's own rule.
 *
 * WHY A FIXED WINDOW AND NOT A SEASON TOTAL (D-20.1, inherited unchanged).
 * FIRMS caps every request at 5 days, archive and near-real-time alike. A
 * 5-day window over India returns ~44,000 rows and 3.4 MB, so a full
 * Feb-to-June season for fourteen years is roughly 670 MB and several hundred
 * requests. The ruling already on the record is to sample a FIXED WINDOW ONCE
 * A YEAR: comparable by construction, cheap, and honest as long as the caption
 * says "sample" and never "season". This job samples 21-30 March, ten days,
 * two requests per year.
 *
 * A SAMPLE CAN MISS A PEAK, and the page says so. Fire timing moves with the
 * dry spell; a fixed window is comparable across years precisely because it
 * does NOT chase the peak. That is the trade, stated rather than hidden.
 *
 * ONE SENSOR, ONE PROCESSING LEVEL, FOR THE SERIES. From FIRMS's own
 * data_availability on 21 August 2026:
 *
 *     VIIRS_SNPP_SP    2012-01-20 -> 2026-04-27      <- the series runs on this
 *     VIIRS_SNPP_NRT   2026-04-28 -> today
 *     MODIS_SP         2000-11-01 -> 2026-04-30
 *     VIIRS_NOAA20_SP  2018-04-01 -> 2026-05-31
 *
 * A series that switches from science-quality to near-real-time part way
 * through is not one series. March sits inside SP for every year from 2013 to
 * 2026, so the whole series is SP and the join never happens.
 *
 * DO NOT SUM THE SENSORS. S-NPP and NOAA-20 see the same fires from different
 * orbits; MODIS at 1 km mostly does not see small fires at all. The
 * cross-sensor block publishes each count separately and never a total —
 * D-13.4, and the reason almost every farm-fire figure in Indian media is
 * unreproducible.
 *
 * THE GUARD. FIRMS answers a bad request with HTTP 200 and a prose body such
 * as `Invalid day range. Expects [1..5].`, which a CSV parser reads as zero
 * rows. On a page about fires, publishing "no fires" because a request failed
 * is the worst available bug (D-16.4). So the HEADER is validated, and a
 * failure is recorded as null. Never as zero.
 */
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const KEY = process.env.FIRMS_MAP_KEY;
const OUT = resolve(process.argv[2] || 'data/forest-fire-india.json');
// west,south,east,north — mainland India plus the northeast. The islands are
// outside it and the page says so rather than pretending national coverage.
const AREA = process.env.FF_AREA || '68,6,98,37';
const AREA_LABEL = 'mainland India and the northeast (68-98 E, 6-37 N); the Andaman, Nicobar '
                 + 'and Lakshadweep islands fall outside this box';
const SAMPLE = { from: '03-21', days: 10, label: '21-30 March' };
const YEARS = (process.env.FF_YEARS || '2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024,2025,2026').split(',');
const SERIES_SENSOR = { id: 'VIIRS_SNPP_SP', label: 'VIIRS S-NPP', platform: 'Suomi NPP',
  pixel: '375 m', processing: 'science quality' };
// The cross-sensor comparison runs on the CURRENT window, whatever season it is.
const NOW_SENSORS = [
  { id: 'MODIS_NRT',        label: 'MODIS',         platform: 'Terra / Aqua', pixel: '1 km' },
  { id: 'VIIRS_SNPP_NRT',   label: 'VIIRS S-NPP',   platform: 'Suomi NPP',    pixel: '375 m' },
  { id: 'VIIRS_NOAA20_NRT', label: 'VIIRS NOAA-20', platform: 'NOAA-20',      pixel: '375 m' },
];

if (!KEY) {
  console.error('FIRMS_MAP_KEY is not set. Refusing to run.\n' +
    'Free key at https://firms.modaps.eosdis.nasa.gov/api/map_key/ — never commit it.');
  process.exit(1);
}

const MON = ['January','February','March','April','May','June','July','August','September','October','November','December'];
// Local getters only. Never toISOString.
const now = new Date();
const Y = now.getFullYear(), M = now.getMonth() + 1, D = now.getDate();
const pad = (n) => String(n).padStart(2, '0');
const TODAY = `${Y}-${pad(M)}-${pad(D)}`;

// India's forest fire season, from FSI's own framing. Used only to state
// whether the window is open — never to suppress a reading.
const SEASON = { from: '02-01', to: '06-15', label: '1 February to 15 June' };
const nowMd = `${pad(M)}-${pad(D)}`;
const inSeason = nowMd >= SEASON.from && nowMd <= SEASON.to;

/* ── ONE REQUEST. Counts only; 44,000 rows per window is not worth keeping. ── */
async function window5(sensorId, startDate, days) {
  const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${KEY}/${sensorId}/${AREA}/${days}`
    + (startDate ? `/${startDate}` : '');
  let text;
  try {
    const res = await fetch(url);
    text = await res.text();
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}`, count: null };
  } catch (e) { return { ok: false, error: `network: ${e.message}`, count: null }; }

  const first = (text.split('\n')[0] || '').trim();
  // Validate the SHAPE. FIRMS answers a bad request with prose and HTTP 200.
  if (!first.startsWith('latitude,longitude')) {
    return { ok: false, error: first.slice(0, 160) || 'empty body', count: null };
  }
  const lines = text.split('\n');
  const cols = first.split(',');
  const iDate = cols.indexOf('acq_date'), iFrp = cols.indexOf('frp');
  const iLat = cols.indexOf('latitude'), iLng = cols.indexOf('longitude');
  const iConf = cols.indexOf('confidence'), iDN = cols.indexOf('daynight');

  let count = 0, frpSum = 0, frpMax = 0;
  const byDate = {}, byConf = {}, byDN = {};
  const top = [];                       // the strongest few, for the map only
  for (let i = 1; i < lines.length; i++) {
    const l = lines[i];
    if (!l) continue;
    const v = l.split(',');
    if (v.length < cols.length) continue;
    count++;
    const dt = v[iDate];
    byDate[dt] = (byDate[dt] || 0) + 1;
    if (iConf >= 0) byConf[v[iConf]] = (byConf[v[iConf]] || 0) + 1;
    if (iDN >= 0) byDN[v[iDN]] = (byDN[v[iDN]] || 0) + 1;
    const frp = iFrp >= 0 ? Number(v[iFrp]) : NaN;
    if (Number.isFinite(frp)) {
      frpSum += frp;
      if (frp > frpMax) frpMax = frp;
      // Keep a bounded sample of the most energetic detections. A map of
      // 44,000 points is a solid rectangle and says nothing.
      if (top.length < 400) top.push({ lat: +v[iLat], lng: +v[iLng], frp, date: dt });
      else {
        let min = 0;
        for (let k = 1; k < top.length; k++) if (top[k].frp < top[min].frp) min = k;
        if (frp > top[min].frp) top[min] = { lat: +v[iLat], lng: +v[iLng], frp, date: dt };
      }
    }
  }
  return {
    ok: true, error: null, count,
    frp: { sum: +frpSum.toFixed(1), max: +frpMax.toFixed(1),
      mean: count ? +(frpSum / count).toFixed(2) : null, unit: 'MW' },
    byDate,
    // Confidence is encoded DIFFERENTLY per sensor — MODIS 0-100, VIIRS l/n/h
    // — so the two cannot share a threshold. Published as-is.
    confidence: byConf, dayNight: byDN,
    strongest: top.sort((a, b) => b.frp - a.frp),
  };
}

// Two 5-day requests make the ten-day sample. Summing two ADJACENT windows of
// the SAME sensor is legitimate: they are different days, not different eyes.
async function sample(year) {
  const [mm, dd] = SAMPLE.from.split('-').map(Number);
  const a = await window5(SERIES_SENSOR.id, `${year}-${pad(mm)}-${pad(dd)}`, 5);
  const b = await window5(SERIES_SENSOR.id, `${year}-${pad(mm)}-${pad(dd + 5)}`, 5);
  if (!a.ok || !b.ok) {
    return { year, ok: false, error: [a.error, b.error].filter(Boolean).join(' / '), count: null };
  }
  const byDate = { ...a.byDate };
  for (const [k, v] of Object.entries(b.byDate)) byDate[k] = (byDate[k] || 0) + v;
  return {
    year, ok: true, error: null,
    count: a.count + b.count,
    days: Object.keys(byDate).length,
    frp_sum: +(a.frp.sum + b.frp.sum).toFixed(1),
    frp_max: Math.max(a.frp.max, b.frp.max),
    byDate,
    strongest: [...a.strongest, ...b.strongest].sort((x, y) => y.frp - x.frp).slice(0, 400),
  };
}

/* ── A COMPLETED YEAR IS HISTORY, AND HISTORY DOES NOT MOVE — AD-48 ───────
   This job used to re-download all fourteen years on EVERY run — twenty-eight
   FIRMS requests a day for a fixed ten-day window, 21-30 March, in years that
   finished as long ago as 2013. The series runs on VIIRS S-NPP SCIENCE
   QUALITY, whose whole point is that it is the final, reprocessed product: a
   past March cannot change. So the re-download bought nothing and cost three
   things, all of which we then paid:

     · TIME. Nine-plus minutes of the daily refresh, most of the job.
     · RELIABILITY. NASA's host is unreachable from GitHub runners often
       enough to matter (measured 24, 25 and 26 August 2026: every year
       failed with `connect ETIMEDOUT 198.118.194.34:443`). One outage failed
       fourteen years of already-known data and turned the whole daily refresh
       red — which is how data-refresh.yml came to be red on three consecutive
       days for a dataset nobody had actually lost.
     · QUOTA. FIRMS rate-limits by key.

   So a year already carried in the committed file, marked `ok`, is REUSED and
   never re-requested. Only years we do not yet hold are fetched — in practice
   the current one, which is also the only one whose March can still be
   revised or arrive late.

   FF_REFETCH=1 forces the full re-download: for the day FIRMS reprocesses the
   archive, or the sample window/sensor/area constants above change. Any of
   those makes the cached years incomparable with the new ones, and that is a
   human's call to make, not an unattended job's.

   ★ THE CACHE IS KEYED ON THE THINGS THAT WOULD INVALIDATE IT. If the sensor,
   the sample window or the bounding box differs from what the committed file
   was built with, nothing is reused — a cached 2013 sampled over a different
   box is not the same measurement, and silently mixing the two would be the
   "two hours presented as one" error in another costume.
   ──────────────────────────────────────────────────────────────────────── */
const CACHE_KEY = `${SERIES_SENSOR.id}|${SAMPLE.from}|${SAMPLE.days}|${AREA}`;
const cached = new Map();
if (!process.env.FF_REFETCH && existsSync(OUT)) {
  try {
    const prev = JSON.parse(readFileSync(OUT, 'utf8'));
    if (prev?.series?.cache_key === CACHE_KEY) {
      for (const y of prev.series.years || []) {
        if (y.ok && y.count !== null) cached.set(String(y.year), y);
      }
    } else if (prev?.series?.years?.length) {
      console.log('cache: the committed file was built with a different sensor, sample window '
        + 'or area — refetching every year rather than mixing two measurements.');
    }
  } catch { /* an unreadable previous file must never block a fresh fetch */ }
}

/* THE CURRENT YEAR IS ALWAYS REFETCHED. Its March may still be arriving, being
   reprocessed, or not have happened yet; only a year strictly in the past is
   settled. */
const THIS_YEAR = new Date(Date.now() + 19800000).getUTCFullYear();

/* ── RUN ────────────────────────────────────────────────────────────────── */
console.log(`FIRMS over ${AREA}\nseries sensor: ${SERIES_SENSOR.id}, fixed sample ${SAMPLE.label} (${SAMPLE.days} days)\n`);
const series = [];
let reused = 0;
for (const y of YEARS) {
  const hit = Number(y) < THIS_YEAR ? cached.get(String(y)) : null;
  if (hit) {
    series.push(hit);
    reused++;
    console.log(`  ${y}  ${String(hit.count).padStart(7)} detections   (held — a settled year is not re-requested)`);
    continue;
  }
  const r = await sample(Number(y));
  series.push(r);
  console.log(`  ${y}  ` + (r.ok
    ? `${String(r.count).padStart(7)} detections   FRP total ${String(r.frp_sum).padStart(10)} MW   peak ${r.frp_max} MW`
    : `FAILED — ${r.error}`));
}
console.log(`\n  ${reused} of ${YEARS.length} years held from the committed file; `
  + `${YEARS.length - reused} requested. FF_REFETCH=1 forces a full re-download.`);

/* ★ A YEAR WE ALREADY HELD MUST NEVER BE LOST TO A FAILED REQUEST. The current
   year is refetched every run; if that request fails while the file already
   carries a good value for it, keep the good value rather than publishing a
   hole where a number was. */
for (let i = 0; i < series.length; i++) {
  if (series[i].ok) continue;
  const held = cached.get(String(series[i].year));
  if (held) {
    console.log(`  ${series[i].year}  request failed (${series[i].error}) — keeping the value already committed.`);
    series[i] = held;
  }
}

console.log(`\ncross-sensor, the last 5 days to ${TODAY}${inSeason ? '' : ' (OUT OF SEASON — a low count here is the season, not a fault)'}:`);
const nowCounts = {};
for (const s of NOW_SENSORS) {
  const r = await window5(s.id, null, 5);
  nowCounts[s.id] = { ...s, ...r, strongest: r.ok ? r.strongest.slice(0, 200) : [] };
  console.log(`  ${s.label.padEnd(15)} ${s.pixel.padEnd(6)} ` +
    (r.ok ? `${String(r.count).padStart(7)} detections` : `FAILED — ${r.error}`));
}

const good = series.filter(s => s.ok);
if (!good.length && !Object.values(nowCounts).some(c => c.ok)) {
  console.error('\nEvery request failed. Leaving the previous file alone rather than publishing an absence.');
  process.exit(1);
}
const peak = good.length ? good.reduce((a, b) => (b.count > a.count ? b : a)) : null;
const floor = good.length ? good.reduce((a, b) => (b.count < a.count ? b : a)) : null;
const half = (from, to) => {
  const s = good.filter(x => x.year >= from && x.year <= to);
  return s.length ? { from, to, years: s.length,
    mean: Math.round(s.reduce((a, b) => a + b.count, 0) / s.length) } : null;
};
const mid = good.length ? good[Math.floor(good.length / 2)].year : null;

const out = {
  subject: 'Thermal-anomaly detections over India in the fire season',
  // The unit is the honesty. It is repeated everywhere the number is.
  unit: 'satellite detections',
  not: 'This is NOT a count of forest fires, and not a count of fires. It is a count of '
     + 'detections: pixels hot enough to register. One fire can produce several detections on '
     + 'one pass and none on the next, and a detection can be a field, a kiln or a rubbish heap.',
  area: { bbox: AREA, label: AREA_LABEL },
  kind: 'counted',
  kind_note: 'The detections are counted, not modelled. What they are detections OF is the '
           + 'unresolved part, and that is a different kind of uncertainty from a model.',
  source: {
    name: 'NASA FIRMS',
    url: 'https://firms.modaps.eosdis.nasa.gov/',
    api: 'https://firms.modaps.eosdis.nasa.gov/api/area/csv/{key}/{sensor}/{bbox}/{days}[/{date}]',
    note: 'free map key; 5 days per request, archive and near-real-time alike',
  },
  state_label: 'PERIODIC',
  season: { ...SEASON, open: inSeason },
  limit: {
    // The frozen wording for the case where none exists. Not an omission.
    exists: false,
    label: 'No legal threshold.',
    why: 'No statute publishes a permitted number of fires or detections, so nothing here can '
       + 'be "over the limit". Every other situation on this site reads against a published '
       + 'limit; this one cannot, and says so instead of inventing a benchmark.',
  },
  method: {
    sample: { ...SAMPLE, sensor: SERIES_SENSOR },
    why_fixed: 'FIRMS caps every request at 5 days. A fixed window sampled once a year is '
             + 'comparable by construction and costs two requests per year; a full season for '
             + 'fourteen years is several hundred requests and roughly 670 MB.',
    caveat: 'A fixed window is a SAMPLE, not a season total, and it can miss a peak. It is '
          + 'comparable across years precisely because it does not chase the peak.',
    one_sensor: 'The series is VIIRS S-NPP science-quality throughout. March 2013-2026 sits '
              + 'inside that sensor\'s archive window, so the series never switches processing level.',
  },
  series: {
    /* What the cached years were measured with. A run whose constants differ
       from this refuses to reuse them — see the AD-48 note above. */
    cache_key: CACHE_KEY,
    sensor: SERIES_SENSOR,
    window: SAMPLE,
    years: series,
    peak: peak ? { year: peak.year, count: peak.count } : null,
    floor: floor ? { year: floor.year, count: floor.count } : null,
    ratio: (peak && floor && floor.count > 0) ? +(peak.count / floor.count).toFixed(1) : null,
    halves: mid ? [half(good[0].year, mid), half(mid + 1, good[good.length - 1].year)] : null,
  },
  cross_sensor: {
    device: 'Three sensors, the same five days, the same box, three different counts. Published '
          + 'separately and never summed: S-NPP and NOAA-20 see the same fires from different '
          + 'orbits, and MODIS at 1 km mostly does not see a small fire at all.',
    rule: 'DO NOT SUM THESE ROWS.',
    window: { days: 5, to: TODAY },
    sensors: nowCounts,
  },
  holes: [
    'No forest mask. Detections are not separated into forest and not-forest, so the count '
      + 'cannot be called a forest-fire count. This is the biggest hole on the page and closing '
      + 'it needs a per-pixel land-cover intersection.',
    'No burned area. A detection is an event, not an extent; FIRMS burned-area products exist '
      + 'but are a different measurement on a different cadence and are not mixed in here.',
    'No cause, and no attribution to any actor.',
    'The islands are outside the bounding box.',
    'FSI runs India\'s own forest-fire alert system and publishes its own counts. Those are the '
      + 'forest-specific figures and they are not reproduced here, because the portal has no API '
      + 'and scraping it would produce a figure with no attachable source document.',
  ],
  caveats: [
    'A detection is not a fire, and a count of detections is not an area burned.',
    'A quiet window is not a safe season. Out of season, a low count is the calendar.',
    'A failed request is recorded as null, never as zero detections.',
    'Confidence is encoded differently by each sensor and is published as the sensor reports it.',
    'The strongest-detection sample exists to make a map legible. It is a sample of 400, '
      + 'selected by fire radiative power, and is never a count.',
  ],
  fetched: { epochMs: Date.now() },
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');

if (peak && floor) {
  console.log(`\nsample series: peak ${peak.year} ${peak.count.toLocaleString('en-IN')}, ` +
    `floor ${floor.year} ${floor.count.toLocaleString('en-IN')}, ratio ${out.series.ratio}x`);
  if (out.series.halves?.[0] && out.series.halves?.[1]) {
    for (const h of out.series.halves) {
      console.log(`  ${h.from}-${h.to}: mean ${h.mean.toLocaleString('en-IN')} detections in the window`);
    }
  }
}
console.log(`wrote ${OUT}`);
