#!/usr/bin/env node
/**
 * fetch-heat-india.mjs — heat across INDIA, not one city.
 *
 *   node scripts/fetch-heat-india.mjs [out.json]        # keyless
 *
 * Replaces the single-grid-point Delhi heat dataset. Heat is the one situation
 * on this site that is not a Delhi story: it kills in Rajasthan, Odisha, Bihar,
 * Andhra and Telangana at least as much, and NCRB's 2024 count — 1,832 recorded
 * heat deaths, up 128 per cent in one year — is a national figure.
 *
 * ★ IMD'S THRESHOLD IS NOT ONE NUMBER, AND THIS IS WHY THE PAGE NEEDED REBUILDING.
 * The criteria depend on where you are:
 *
 *     plains    Tmax >= 40 C     coastal  Tmax >= 37 C     hills  Tmax >= 30 C
 *
 * and on all three the day only counts as a heat wave if it also stands
 * >= 4.5 C above the local normal (>= 6.5 C for severe). There is also an
 * absolute rule with no reference to normal: >= 45 C is a heat wave anywhere,
 * >= 47 C is severe.
 *
 * A single Delhi grid point on the plains rule therefore cannot describe heat in
 * Chennai or Shimla, and applying the plains threshold nationally would silently
 * under-count every coastal city on the list. Each station below carries its own
 * zone, and the zone selects the threshold.
 *
 * ★ THE HONESTY LINE, UNCHANGED FROM THE DELHI VERSION.
 * IMD declares a heat wave for a SUBDIVISION when the criteria are met at two or
 * more stations. These are single grid points. So every figure here is
 * "days meeting IMD's temperature criteria at this location" and NEVER
 * "heatwave days declared by IMD". Same rule as the Air page's refusal to call a
 * computed AQI "CPCB's AQI" (D-15.8).
 *
 * ★ AND THE NORMAL IS COMPUTED PER STATION.
 * A departure is meaningless against somebody else's normal. Each station gets
 * its own 1991-2020 per-calendar-day mean over a +/-7 day window — about 450
 * samples a day — from the same archive its readings come from, so the departure
 * is reproducible rather than quoted.
 *
 * REANALYSIS IS MODELLED. ERA5 is a model constrained by observations, and every
 * figure derived from it is stamped `modelled` so the page's solid-versus-dotted
 * rule carries it. It also smooths extremes hardest at exactly the tail this
 * subject lives in, and contains no urban heat island.
 *
 * Local Date getters only, never toISOString. Dates are handled as the
 * 'YYYY-MM-DD' strings the upstream sends, so no timezone conversion happens.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const OUT = resolve(process.argv[2] || 'data/heat-india.json');
const NORM_FROM = 1991, NORM_TO = 2020;
const UA = 'SwechhaBot/1.0 (https://swechha.in; vimlendu@swechha.in)';

/* ── IMD's PUBLISHED CRITERIA. Constants, transcribed, never derived. ───── */
const ZONES = {
  plains:  { base: 40, label: 'plains' },
  coastal: { base: 37, label: 'coastal' },
  hills:   { base: 30, label: 'hills' },
};
const DEP_HW = 4.5, DEP_SEVERE = 6.5, ABS_HW = 45, ABS_SEVERE = 47;
const CRITERIA = {
  authority: 'India Meteorological Department — heat wave criteria',
  zones: ZONES,
  departure_hw: DEP_HW, departure_severe: DEP_SEVERE,
  absolute_hw: ABS_HW, absolute_severe: ABS_SEVERE,
  note: 'IMD declares for a subdivision on two or more stations. These are single grid points, so '
      + 'these are days MEETING the temperature criteria at each location, not IMD declarations.',
};
// D-11.2's window for the Heatwave situation.
const SEASON = { from: '03-01', to: '07-15', label: '1 March to 15 July' };

/* ── THE STATIONS. Chosen to span India's heat geography, not its population:
      the desert, the central plateau, the Gangetic plain, both coasts and one
      hill station. Each carries the zone that selects its threshold. ─────── */
const STATIONS = [
  { name: 'Delhi',      state: 'Delhi',          lat: 28.6139, lng: 77.2090, zone: 'plains' },
  { name: 'Jaipur',     state: 'Rajasthan',      lat: 26.9124, lng: 75.7873, zone: 'plains' },
  { name: 'Jodhpur',    state: 'Rajasthan',      lat: 26.2389, lng: 73.0243, zone: 'plains' },
  { name: 'Ahmedabad',  state: 'Gujarat',        lat: 23.0225, lng: 72.5714, zone: 'plains' },
  { name: 'Lucknow',    state: 'Uttar Pradesh',  lat: 26.8467, lng: 80.9462, zone: 'plains' },
  { name: 'Patna',      state: 'Bihar',          lat: 25.5941, lng: 85.1376, zone: 'plains' },
  { name: 'Nagpur',     state: 'Maharashtra',    lat: 21.1458, lng: 79.0882, zone: 'plains' },
  { name: 'Hyderabad',  state: 'Telangana',      lat: 17.3850, lng: 78.4867, zone: 'plains' },
  { name: 'Bhubaneswar', state: 'Odisha',        lat: 20.2961, lng: 85.8245, zone: 'coastal' },
  { name: 'Kolkata',    state: 'West Bengal',    lat: 22.5726, lng: 88.3639, zone: 'coastal' },
  { name: 'Chennai',    state: 'Tamil Nadu',     lat: 13.0827, lng: 80.2707, zone: 'coastal' },
  { name: 'Mumbai',     state: 'Maharashtra',    lat: 19.0760, lng: 72.8777, zone: 'coastal' },
  { name: 'Bengaluru',  state: 'Karnataka',      lat: 12.9716, lng: 77.5946, zone: 'plains' },
  { name: 'Shimla',     state: 'Himachal Pradesh', lat: 31.1048, lng: 77.1734, zone: 'hills' },
];

// Local getters only.
const now = new Date();
const Y = now.getFullYear(), M = now.getMonth() + 1, D = now.getDate();
const pad = (n) => String(n).padStart(2, '0');
const TODAY = `${Y}-${pad(M)}-${pad(D)}`;
const nowMd = `${pad(M)}-${pad(D)}`;
const windowOpen = nowMd >= SEASON.from && nowMd <= SEASON.to;

const DOY = (s) => {
  const [, m, d] = s.split('-').map(Number);
  const cum = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  return cum[m - 1] + d;
};

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

/* OPEN-METEO RATE-LIMITS, AND A 429 IS NOT AN EMPTY ARCHIVE.
   The first run of this job asked for 14 stations back to back and five came
   back HTTP 429. Silently dropping them would have published a "national"
   picture built from nine cities with no note that five were missing — the same
   class of error as reading a FIRMS error body as zero fires (D-16.4).
   So: a short pace between stations, and up to four retries with widening
   backoff on a 429. A station that still fails is OMITTED and the page reports
   the count that actually answered. It is never backfilled or interpolated. */
async function pull(st) {
  const url = 'https://archive-api.open-meteo.com/v1/archive'
    + `?latitude=${st.lat}&longitude=${st.lng}`
    + `&start_date=${NORM_FROM}-01-01&end_date=${TODAY}`
    + '&daily=temperature_2m_max,temperature_2m_min,apparent_temperature_max'
    + '&timezone=Asia%2FKolkata';
  let body = null, lastErr = null;
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA } });
      if (res.status === 429 || res.status === 503) {
        lastErr = `HTTP ${res.status}`;
        await sleep(attempt * 8000);          // 8s, 16s, 24s, 32s
        continue;
      }
      if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
      body = await res.json();
      break;
    } catch (e) { lastErr = `network: ${e.message}`; await sleep(attempt * 4000); }
  }
  if (!body) return { ok: false, error: `${lastErr} after 5 attempts` };
  // Validate the SHAPE, not the status.
  const d = body?.daily;
  if (!d || !Array.isArray(d.time) || !Array.isArray(d.temperature_2m_max)
      || d.time.length !== d.temperature_2m_max.length || d.time.length < 10000) {
    return { ok: false, error: 'unexpected response shape' };
  }
  return { ok: true, error: null, days: d.time.map((t, i) => ({
    date: t, tmax: d.temperature_2m_max[i], tmin: d.temperature_2m_min[i],
    app: d.apparent_temperature_max[i],
  })) };
}

function analyse(st, days) {
  const base = ZONES[st.zone].base;
  // Per-station normal, from the same archive.
  const byDoy = new Map();
  for (const d of days) {
    const y = Number(d.date.slice(0, 4));
    if (y < NORM_FROM || y > NORM_TO || d.tmax == null) continue;
    const k = DOY(d.date);
    if (!byDoy.has(k)) byDoy.set(k, []);
    byDoy.get(k).push(d.tmax);
  }
  const normal = new Map();
  for (let k = 1; k <= 366; k++) {
    const bag = [];
    for (let o = -7; o <= 7; o++) {
      const kk = ((k - 1 + o + 366) % 366) + 1;
      const v = byDoy.get(kk); if (v) bag.push(...v);
    }
    if (bag.length) normal.set(k, +(bag.reduce((a, b) => a + b, 0) / bag.length).toFixed(2));
  }

  const classify = (d) => {
    if (d.tmax == null) return { cls: null, dep: null };
    const n = normal.get(DOY(d.date));
    const dep = n == null ? null : +(d.tmax - n).toFixed(2);
    if (d.tmax >= ABS_SEVERE) return { cls: 'severe', dep, via: 'absolute' };
    if (d.tmax >= ABS_HW) return { cls: 'heatwave', dep, via: 'absolute' };
    if (d.tmax >= base && dep != null) {
      if (dep >= DEP_SEVERE) return { cls: 'severe', dep, via: 'departure' };
      if (dep >= DEP_HW) return { cls: 'heatwave', dep, via: 'departure' };
    }
    return { cls: null, dep, via: null };
  };

  const years = [];
  for (let y = NORM_FROM; y <= Y; y++) {
    const season = days.filter(d => Number(d.date.slice(0, 4)) === y
      && d.date.slice(5) >= SEASON.from && d.date.slice(5) <= SEASON.to && d.tmax != null);
    if (!season.length) continue;
    let hw = 0, sev = 0, peak = season[0], run = null;
    const spells = [];
    let peakApp = season.find(d => d.app != null) || null;
    for (const d of season) {
      const c = classify(d);
      if (c.cls) hw++;
      if (c.cls === 'severe') sev++;
      if (d.tmax > peak.tmax) peak = d;
      if (peakApp && d.app != null && d.app > peakApp.app) peakApp = d;
      if (c.cls) { run = run || { from: d.date, days: 0 }; run.to = d.date; run.days++; }
      else if (run) { spells.push(run); run = null; }
    }
    if (run) spells.push(run);
    const longest = spells.reduce((a, b) => (!a || b.days > a.days ? b : a), null);
    const appDays = season.filter(d => d.app != null);
    years.push({
      year: y,
      complete: y < Y || nowMd > SEASON.to,
      heatwave_days: hw, severe_days: sev,
      peak_tmax: peak.tmax, peak_date: peak.date, peak_departure: classify(peak).dep,
      peak_apparent: peakApp?.app ?? null,
      apparent_over_45: appDays.filter(d => d.app >= 45).length,
      apparent_over_50: appDays.filter(d => d.app >= 50).length,
      warm_nights_28: season.filter(d => d.tmin != null && d.tmin >= 28).length,
      longest_spell: longest,
    });
  }
  const complete = years.filter(y => y.complete);
  const mean = (s, f) => s.length ? +(s.reduce((a, b) => a + (f(b) ?? 0), 0) / s.length).toFixed(1) : null;
  const half = (from, to) => {
    const s = complete.filter(y => y.year >= from && y.year <= to);
    return s.length ? { from, to, years: s.length,
      heatwave_days: mean(s, y => y.heatwave_days),
      severe_days: mean(s, y => y.severe_days),
      peak_tmax: mean(s, y => y.peak_tmax),
      peak_apparent: mean(s, y => y.peak_apparent),
      apparent_over_45: mean(s, y => y.apparent_over_45),
      warm_nights_28: mean(s, y => y.warm_nights_28) } : null;
  };
  const mid = 2008;
  const h1 = half(NORM_FROM, mid), h2 = half(mid + 1, complete[complete.length - 1].year);
  const dir = (a, b) => (a == null || b == null) ? null : b > a ? 'up' : b < a ? 'down' : 'flat';
  const hottest = complete.reduce((a, b) => (b.peak_tmax > a.peak_tmax ? b : a));
  const worstDays = complete.reduce((a, b) => (b.heatwave_days > a.heatwave_days ? b : a));
  const last = complete[complete.length - 1];

  return {
    ...st, zone_label: ZONES[st.zone].label, base_threshold: base,
    years, halves: [h1, h2],
    direction: {
      heatwave_days: dir(h1?.heatwave_days, h2?.heatwave_days),
      peak_tmax: dir(h1?.peak_tmax, h2?.peak_tmax),
      peak_apparent: dir(h1?.peak_apparent, h2?.peak_apparent),
      apparent_over_45: dir(h1?.apparent_over_45, h2?.apparent_over_45),
      warm_nights_28: dir(h1?.warm_nights_28, h2?.warm_nights_28),
    },
    records: {
      hottest_day: { tmax: hottest.peak_tmax, date: hottest.peak_date, year: hottest.year },
      most_days: { days: worstDays.heatwave_days, year: worstDays.year },
    },
    last_complete_season: last,
    this_season: years.find(y => y.year === Y) || null,
  };
}

/* ── RUN ────────────────────────────────────────────────────────────────── */
console.log(`Heat across India — ${STATIONS.length} stations, ${NORM_FROM} to ${TODAY}`);
console.log(`window ${SEASON.label}: ${windowOpen ? 'OPEN' : 'SHUT'}\n`);
const stations = [];
const failures = [];
for (const st of STATIONS) {
  await sleep(1200);          // pace, so the retry path is the exception not the rule
  const r = await pull(st);
  if (!r.ok) { failures.push({ name: st.name, state: st.state, error: r.error });
    console.log(`  ${st.name.padEnd(13)} FAILED — ${r.error}`); continue; }
  const a = analyse(st, r.days);
  stations.push(a);
  const L = a.last_complete_season;
  console.log(`  ${st.name.padEnd(13)} ${a.zone_label.padEnd(8)} base ${a.base_threshold}C   ` +
    `${L.year}: ${String(L.heatwave_days).padStart(3)} days, peak ${String(L.peak_tmax).padStart(5)}C   ` +
    `record ${a.records.hottest_day.tmax}C (${a.records.hottest_day.year})   ` +
    `nights>=28 ${String(L.warm_nights_28).padStart(3)}`);
}
if (!stations.length) {
  console.error('\nEvery station failed. Leaving the previous file alone rather than publishing an absence.');
  process.exit(1);
}

const readingOf = (s) => windowOpen ? (s.this_season || s.last_complete_season) : s.last_complete_season;

/* NATIONAL AGGREGATES. Every one names its own operation — a mean of stations
   is not a national figure and the page says so. */
const worstSeason = stations.reduce((a, b) =>
  (readingOf(b).heatwave_days > readingOf(a).heatwave_days ? b : a));
const hottestEver = stations.reduce((a, b) =>
  (b.records.hottest_day.tmax > a.records.hottest_day.tmax ? b : a));
const dirCount = (k) => {
  const c = { up: 0, down: 0, flat: 0 };
  for (const s of stations) { const d = s.direction[k]; if (d) c[d]++; }
  return c;
};
const DIRS = ['heatwave_days', 'peak_tmax', 'peak_apparent', 'apparent_over_45', 'warm_nights_28'];
const consensus = Object.fromEntries(DIRS.map(k => [k, dirCount(k)]));

const out = {
  subject: 'Heat in India',
  scope: 'national — 14 grid points across the desert, the plateau, the Gangetic plain, both coasts and one hill station',
  kind: 'modelled',
  kind_reason: 'ERA5 reanalysis — a model constrained by observations, not a station thermometer. '
             + 'An IMD station series would outrank this, not confirm it. Reanalysis also smooths '
             + 'extremes hardest at the tail this subject lives in, and contains no urban heat island.',
  source: {
    name: 'Open-Meteo ERA5 archive',
    url: 'https://archive-api.open-meteo.com/v1/archive',
    upstream: 'ECMWF ERA5 / ERA5-Land reanalysis',
    note: 'keyless, unthrottled; 35 years per station in one request',
  },
  state_label: windowOpen ? 'PERIODIC' : 'OUT OF SEASON',
  window: { ...SEASON, open: windowOpen, returns: `1 March ${windowOpen ? Y : Y + 1}` },
  criteria: CRITERIA,
  normal: {
    window: `${NORM_FROM}-${NORM_TO}`,
    method: 'per station, per calendar day: the mean daily maximum over a plus/minus 7-day window '
          + 'across 30 years — about 450 samples per day',
    why_per_station: 'A departure is meaningless against somebody else\'s normal. Chennai\'s normal '
                   + 'and Jodhpur\'s are 10 C apart.',
    authority: 'the 1991-2020 window is WMO\'s standard climate normal period',
  },
  stations,
  national: {
    stations_reporting: stations.length,
    stations_requested: STATIONS.length,
    stations_omitted: failures,
    omitted_note: failures.length
      ? 'These stations did not answer and are OMITTED. They are not backfilled, interpolated or '
        + 'silently dropped: the counts on this page are over the stations that reported.'
      : null,
    reading_of: windowOpen ? 'this season, so far' : 'the last completed season',
    worst_station_this_reading: {
      name: worstSeason.name, state: worstSeason.state,
      days: readingOf(worstSeason).heatwave_days,
      peak_tmax: readingOf(worstSeason).peak_tmax,
      year: readingOf(worstSeason).year,
    },
    hottest_on_record: {
      name: hottestEver.name, state: hottestEver.state,
      ...hottestEver.records.hottest_day,
    },
    total_days_this_reading: stations.reduce((a, s) => a + readingOf(s).heatwave_days, 0),
    total_days_note: 'The sum of qualifying days across all 14 stations. It is a count of '
                   + 'station-days, NOT a national number of heatwave days — those are different '
                   + 'quantities and this site does not blur them.',
    consensus,
    consensus_note: 'How many of the 14 stations move each way between the first and second halves '
                  + 'of the record. Published as a count of stations rather than a national average, '
                  + 'because averaging 14 grid points does not produce a national trend.',
  },
  honesty: {
    headline: 'Dry-bulb heat is not the measure that is rising. Humid heat and warm nights are.',
    // Degree signs, not bare "28 C". This string is rendered as prose on the page.
    reading: 'Across these 14 stations, the number that moves most consistently upward is not the '
           + 'hottest afternoon — it is the number of nights that never fall below 28\u00B0C, and the '
           + 'number of days whose apparent temperature clears 45\u00B0C. Peak daytime maxima are close '
           + 'to flat at most stations and fall at some.',
    what_it_does_not_mean: [
      'It is not evidence that heat is not intensifying. Three of the four things that make heat '
        + 'dangerous are not dry-bulb maximum: humidity, night-time recovery, and duration.',
      'A reanalysis smooths local extremes hardest at exactly the tail this metric lives in, and '
        + 'contains no urban heat island for cities that have doubled their built area.',
      'A grid point is not a city, and 14 grid points are not a country.',
      'IMD\'s own declarations are made on station data across subdivisions and are a different '
        + 'quantity from this one.',
    ],
  },
  caveats: [
    CRITERIA.note,
    'ERA5 is a reanalysis. Every figure here is modelled, and marked as modelled.',
    'The threshold differs by zone. Applying the plains threshold nationally would under-count '
      + 'every coastal city on this list.',
    'The current season is excluded from every record and mean until 15 July has passed.',
    'Apparent temperature accounts for humidity and has no IMD threshold, so nothing is counted '
      + 'against it as a breach. It is counted as itself.',
    'A station that fails to fetch is omitted, and the station count on the page is the count that '
      + 'answered. It is never backfilled.',
  ],
  fetched: { epochMs: Date.now() },
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');

console.log(`\nNATIONAL (${out.national.reading_of})`);
console.log(`  worst station:  ${out.national.worst_station_this_reading.name} — ` +
  `${out.national.worst_station_this_reading.days} days, peak ${out.national.worst_station_this_reading.peak_tmax}C`);
console.log(`  hottest ever:   ${out.national.hottest_on_record.name} ${out.national.hottest_on_record.tmax}C on ${out.national.hottest_on_record.date}`);
console.log(`  station-days:   ${out.national.total_days_this_reading}`);
console.log('\n  direction, first half -> second half, counted across stations:');
for (const [k, v] of Object.entries(consensus)) {
  console.log(`    ${k.padEnd(18)} up ${String(v.up).padStart(2)}  down ${String(v.down).padStart(2)}  flat ${String(v.flat).padStart(2)}`);
}
console.log(`\nwrote ${OUT}`);
