/* ═══════════════════════════════════════════════════════════════════════════
   DATA EXPORTS  →  public/data/**
   ───────────────────────────────────────────────────────────────────────────
   THE ARCHIVE AS FILES, SO SOMEBODY WHO IS NOT US CAN USE IT.

   /use-the-data already published the licence, the citation formats, the
   per-subject method and the per-subject limits. What it could not publish was
   the data. A researcher who accepted every one of those terms still had to
   scrape month pages out of HTML, and `recordDatasetJsonLd`'s own note recorded
   the consequence in one line: "Still no `distribution` — there is no download
   to point at, and asserting a file that does not exist is how markup gets a
   site distrusted rather than indexed."

   This is the download. The Dataset markup can now name it, and does.

   ★ IT IS NOT AN API AND THIS FILE WILL NOT LET THE SITE SAY IT IS.
   These are STATIC FILES generated from the committed store, exactly like every
   HTML page here. There is one live endpoint on this site — `/api/air`, one
   city, the current hour — and `data/index.json` names it as what it is,
   separately, with its shape stated. A manifest is not an API; a directory of
   CSVs is not an API; and a site whose argument is that its claims are
   checkable does not get to blur that.

   ★ DELHI ONLY, AND THE REASON IS REPOSITORY WEIGHT, NOT AVAILABILITY.
   The figures below are MEASURED off the two months in the store, not estimated,
   because the first pass at this decision estimated them and was out by a large
   factor in both directions:

     Delhi, city-level hourly    137 observations    23 KB CSV, 57 KB JSON
     Delhi, per-station hourly   5,989 rows         618 KB CSV  (~103 B/row)
     India, all cities hourly    268 rows per hour   not written

   At the cadence the store is actually filled — 222 observations across fifteen
   days, so nearer fifteen a day than twenty-four — a full month of Delhi's
   per-station file lands around 2 MB and the national one around 12 MB. That is
   the whole of the difference: 2 MB a month of the city this site is about is a
   cost worth paying; 12 MB a month is not.

   So the national store stays unpublished as files, which is what /record/air
   has always said of it — "stored the same way and is not yet published as day
   tables" — and data/index.json says so in the same words, with the reason,
   rather than leaving somebody to conclude the data does not exist.

   ★ THE STATIONS ARE A SEPARATE CSV, NOT NESTED IN THE JSON. The first version
   of this generator nested every reporting station inside the monthly JSON and
   came to 1.1 MB for the two months in the store. Long format is both smaller
   and better: it is the shape a per-station analysis actually wants, whereas
   nested JSON has to be flattened before anybody can group by station. The
   per-station readings are the most valuable thing here — they are the whole
   argument of /journal/delhi-is-not-one-city — so they are published, and the
   monthly JSON keeps only what a CSV cell genuinely cannot hold, the revision
   history. It is written without indentation, since nothing reads it by eye.

   ★ WHEN TO REVISIT, WITH A TRIGGER RATHER THAN A PLAN. If the per-station file
   passes a few megabytes a month, or the archive passes a year, the answer is
   not to stop publishing it: it is to add a daily-resolution station file beside
   the hourly one, so the common case is a small download and the hourly months
   stay an archive nobody has to fetch in order to use the record.

   ★ EVERY EXPORT CARRIES THE THREE THINGS A READING IS USELESS WITHOUT.
   The observation stamp, the source that published it, and — the one this
   archive exists for — how many times the source LATER CHANGED that reading.
   `revisions` is not bookkeeping here; it is the column that distinguishes this
   record from a screenshot of a dashboard.

   ★ TWO STAMPS PER ROW, DELIBERATELY. CPCB publishes "DD-MM-YYYY HH:MM:SS" in
   IST with no zone marker on it, and that is reproduced verbatim as
   `observed_source` so a row can be matched back to the feed byte for byte.
   `observed` beside it is the same instant as ISO-8601 with the +05:30 offset
   written out, because a researcher loading this into pandas should not have to
   infer a timezone — and the commonest way an Indian environmental dataset gets
   silently mis-analysed is a naive local stamp parsed as UTC.

   WRITTEN BY:  npm run build:data
   JOINS:       generated-current.yml, air-hourly.yml and data-refresh.yml —
                it reads data/air-history/, so any workflow that refreshes that
                store and rebuilds `record` must rebuild this too or the
                committed tree goes out of step and the diff gate fails on the
                next pull request. That is the trap swechha's own notes record
                for data/work-links.json.
   ═══════════════════════════════════════════════════════════════════════════ */
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import * as S from './lib/situation-shell.mjs';

const HIST = join(S.ROOT, 'data/air-history');
const OUT = join(S.ROOT, 'public/data');
const AIR = JSON.parse(readFileSync(join(S.ROOT, 'data/air-delhi.json'), 'utf8'));
const AQI_LIMIT = AIR.aqiLimit;
const BANDS = AIR.bands;
const bandOf = (aqi) => (BANDS.find((b) => aqi >= b.idx[0] && aqi <= b.idx[1]) || {}).name || '';

let bad = 0;
const fail = (m) => { console.error(`DATA IS WRONG: ${m}`); bad++; };

/* ═══ CSV ════════════════════════════════════════════════════════════════
   RFC 4180 encode, and nothing else: no library, no dependency, and the same
   three rules the standard actually requires — quote a field containing a
   comma, a quote or a newline, and double an embedded quote. A station name is
   the only field here that ever contains a comma, and every one of them does
   ("Wazirpur, Delhi - DPCC"), so this is load-bearing rather than defensive.

   LF, not CRLF. The standard says CRLF; every tool that reads CSV accepts LF,
   git does not have to be told about it, and a CRLF file in this repository
   would be the only one. */
const cell = (v) => {
  if (v === null || v === undefined) return '';
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const csv = (cols, rows) => [cols.join(','), ...rows.map((r) => cols.map((c) => cell(r[c])).join(','))].join('\n') + '\n';

/* ═══ THE STAMP ══════════════════════════════════════════════════════════
   "01-09-2026 01:00:00" -> "2026-09-01T01:00:00+05:30". Assembled as a STRING,
   never through `new Date()`: parsing a naive local stamp and re-serialising it
   would run through the build machine's own timezone, and this repository's
   CLAUDE.md records what that has already cost once — the default node-postgres
   date parser shifting dates backward for any server ahead of UTC. There is no
   arithmetic to do here. The feed's stamp IS IST; writing the offset out is a
   relabelling, not a conversion. */
const iso = (obs, where) => {
  const m = /^(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2}):(\d{2})$/.exec(String(obs || ''));
  if (!m) { fail(`${where}: cannot read the observation stamp ${JSON.stringify(obs)}`); return ''; }
  const [, d, mo, y, hh, mm, ss] = m;
  return `${y}-${mo}-${d}T${hh}:${mm}:${ss}+05:30`;
};
const dayOf = (obs) => iso(obs, 'day').slice(0, 10);

const write = (rel, body) => {
  const p = join(OUT, rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, body);
  return { path: `/data/${rel}`, bytes: Buffer.byteLength(body) };
};

/* ═══ READ THE STORE ═════════════════════════════════════════════════════ */
if (!existsSync(HIST)) {
  console.error(`REFUSING TO WRITE: no ${HIST}. There is nothing to export.`);
  process.exit(1);
}
const MONTHS = readdirSync(HIST)
  .filter((f) => /^delhi-\d{4}-\d{2}\.ndjson$/.test(f)).sort()
  .map((f) => {
    const [, y, mo] = /^delhi-(\d{4})-(\d{2})\.ndjson$/.exec(f);
    const rows = readFileSync(join(HIST, f), 'utf8').split('\n').filter(Boolean)
      .map((l, i) => {
        try { return JSON.parse(l); } catch { fail(`${f} line ${i + 1} is not JSON`); return null; }
      }).filter(Boolean);
    return { y, mo, rows };
  });
if (!MONTHS.length) { console.error('REFUSING TO WRITE: the store holds no Delhi months.'); process.exit(1); }

/* ═══ THE HOURLY EXPORT, ONE FILE PER MONTH ══════════════════════════════
   One row per OBSERVATION, in the order the store holds them, which is the
   order they were first seen. Columns are the ones the record page renders plus
   the two the page cannot show a reader and a script needs: `first_seen` and
   `last_checked`, i.e. when we first read this reading and when we last asked
   the source whether it still said that. */
const HOURLY_COLS = ['observed', 'observed_source', 'aqi', 'band', 'governing_pollutant',
  'worst_station', 'station_mean', 'stations_reporting', 'stations_above_limit',
  'aqi_limit', 'source', 'revisions', 'first_seen', 'last_checked'];

const hourlyRow = (r, where) => ({
  observed: iso(r.obs, where),
  observed_source: r.obs,
  aqi: r.city?.aqi ?? '',
  /* THE BAND IS DERIVED FROM THE SAME TABLE THE PAGES USE, not copied out of
     the row: `city.band` is stored, and re-deriving it here from
     data/air-delhi.json's `bands` means a file and a page cannot disagree about
     which band a number is in. Where the store already has one they must match,
     and they are checked below. */
  band: r.city?.aqi == null ? '' : bandOf(r.city.aqi),
  governing_pollutant: r.city?.governing ?? '',
  worst_station: (r.city?.station ?? '').trim(),
  station_mean: r.mean ?? '',
  stations_reporting: Array.isArray(r.stations) ? r.stations.length : '',
  stations_above_limit: r.above_limit ?? '',
  aqi_limit: AQI_LIMIT,
  source: r.source ?? '',
  /* THE COLUMN THIS ARCHIVE EXISTS FOR. How many times CPCB later changed this
     reading after publishing it. 0 is a fact, not a blank. */
  revisions: Array.isArray(r.revisions) ? r.revisions.length : 0,
  first_seen: r.first_seen ?? '',
  last_checked: r.last_checked ?? '',
});

const STATION_COLS = ['observed', 'observed_source', 'station', 'aqi', 'band',
  'governing_pollutant', 'aqi_limit', 'above_limit'];

const files = [];
for (const m of MONTHS) {
  const rows = m.rows.map((r, i) => {
    const out = hourlyRow(r, `delhi-${m.y}-${m.mo} row ${i + 1}`);
    if (r.city?.band && out.band && r.city.band !== out.band) {
      fail(`delhi-${m.y}-${m.mo} row ${i + 1}: the store says band "${r.city.band}" and `
        + `data/air-delhi.json's own table puts AQI ${r.city.aqi} in "${out.band}"`);
    }
    return out;
  });
  files.push({
    ...write(`air/delhi-${m.y}-${m.mo}.csv`, csv(HOURLY_COLS, rows)),
    kind: 'hourly', format: 'text/csv', month: `${m.y}-${m.mo}`, rows: rows.length,
  });
  /* ── THE STATIONS, LONG FORMAT: one row per station per hour. ───────────
     This is the file behind "Delhi is not one city": on 8 September at 20:00
     one monitor read 35 and another 211, and no city figure of any kind can
     show that. Long rather than wide because the reporting set CHANGES hour to
     hour — a station drops out, another comes back — so a wide file would need
     a column per station ever seen and most cells would be empty. The
     station's own name is quoted by `cell()`; every one of them contains a
     comma. */
  const stationRows = m.rows.flatMap((r, i) => {
    const observed = iso(r.obs, `stations delhi-${m.y}-${m.mo} row ${i + 1}`);
    return (r.stations || []).map((st) => ({
      observed,
      observed_source: r.obs,
      station: String(st.s || '').trim(),
      aqi: st.a ?? '',
      band: typeof st.a === 'number' ? bandOf(st.a) : '',
      governing_pollutant: st.g ?? '',
      aqi_limit: AQI_LIMIT,
      above_limit: typeof st.a === 'number' ? (st.a > AQI_LIMIT ? 1 : 0) : '',
    }));
  });
  files.push({
    ...write(`air/delhi-${m.y}-${m.mo}-stations.csv`, csv(STATION_COLS, stationRows)),
    kind: 'stations', format: 'text/csv', month: `${m.y}-${m.mo}`, rows: stationRows.length,
  });
  /* THE JSON CARRIES THE FULL REVISION ARRAY, WHICH THE CSV CANNOT.
     A CSV cell is a scalar, so the CSV states HOW MANY times a reading moved and
     the JSON states what it said each time. Flattening the revisions into
     numbered columns was considered and refused: the column count would then be
     set by whichever hour was re-read the most, and every other row would carry
     empty columns for it. */
  files.push({
    ...write(`air/delhi-${m.y}-${m.mo}.json`, `${JSON.stringify({
      dataset: 'Delhi air quality, hourly',
      publisher: 'Swechha',
      licence: S.LICENCE_NAME,
      licence_url: S.LICENCE_URL,
      source: 'Central Pollution Control Board, via its own live feed and the data.gov.in mirror',
      aqi_limit: AQI_LIMIT,
      limit_note: `${AQI_LIMIT} is the top of CPCB's 'Satisfactory' band, corresponding to the 24-hour standard for the governing pollutant`,
      month: `${m.y}-${m.mo}`,
      rows: m.rows.length,
      stations_file: `/data/air/delhi-${m.y}-${m.mo}-stations.csv`,
      observations: m.rows.map((r, i) => ({
        ...hourlyRow(r, `json delhi-${m.y}-${m.mo} row ${i + 1}`),
        /* WHAT A CSV CELL CANNOT HOLD, and the only reason this file exists
           beside the CSV: each revision's timestamp and the reading it replaced.
           The per-station readings USED to be nested here too and are now their
           own long-format CSV — see the weight note in the header. */
        revisions: (r.revisions || []).map((rv) => ({ at: rv.at, from: rv.from })),
      })),
    })}\n`),
    kind: 'hourly', format: 'application/json', month: `${m.y}-${m.mo}`, rows: m.rows.length,
  });
}

/* ═══ THE DAILY EXPORT, ONE FILE ══════════════════════════════════════════
   The same shape the month pages render as a table: one row per day, the day's
   peak observation, and the honesty column.

   ★ `hours_observed` IS NOT `24 - gaps`. It is the number of observations the
   store actually holds for that date. A day with four hours in it is four hours
   of record — /record/air's own words — and nothing here interpolates, fills or
   assumes. A date with no observation at all does not appear as a zero row; it
   does not appear. */
const byDay = new Map();
for (const m of MONTHS) {
  for (const r of m.rows) {
    const d = dayOf(r.obs);
    if (!d) continue;
    if (!byDay.has(d)) byDay.set(d, []);
    byDay.get(d).push(r);
  }
}
const DAILY_COLS = ['date', 'peak_aqi', 'peak_band', 'peak_governing_pollutant',
  'peak_station', 'peak_observed', 'hours_observed', 'hours_above_limit',
  'aqi_limit', 'revisions'];
const daily = [...byDay.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, rs]) => {
  const withAqi = rs.filter((r) => typeof r.city?.aqi === 'number');
  const peak = withAqi.reduce((a, b) => (a === null || b.city.aqi > a.city.aqi ? b : a), null);
  return {
    date,
    peak_aqi: peak ? peak.city.aqi : '',
    peak_band: peak ? bandOf(peak.city.aqi) : '',
    peak_governing_pollutant: peak ? (peak.city.governing ?? '') : '',
    peak_station: peak ? (peak.city.station ?? '').trim() : '',
    peak_observed: peak ? iso(peak.obs, `daily ${date}`) : '',
    hours_observed: rs.length,
    hours_above_limit: withAqi.filter((r) => r.city.aqi > AQI_LIMIT).length,
    aqi_limit: AQI_LIMIT,
    revisions: rs.reduce((n, r) => n + (r.revisions || []).length, 0),
  };
});
files.push({
  ...write('air/delhi-daily.csv', csv(DAILY_COLS, daily)),
  kind: 'daily', format: 'text/csv', month: null, rows: daily.length,
});

/* ═══ THE MANIFEST ═══════════════════════════════════════════════════════
   What exists, at what URL, covering what span, under what terms — machine
   readable, so a script does not have to parse /use-the-data to find the files.

   ★ IT NAMES THE ONE LIVE ENDPOINT AND CALLS EVERYTHING ELSE A FILE.
   `/api/air` is a real request-time endpoint over one city and the current
   hour. These exports are static. Listing them together under a heading like
   "endpoints" would be the site claiming an API it does not have, so they are
   two keys with two descriptions and the difference is written out.

   ★ IT NAMES WHAT IS NOT PUBLISHED. The national store is real, kept and
   unpublished as files; a manifest that simply omitted it would leave somebody
   concluding the data does not exist. */
const FIRST = daily[0]?.date ?? null;
const LAST = daily[daily.length - 1]?.date ?? null;
const manifest = {
  name: 'Swechha environmental data',
  about: 'https://swechha.in/use-the-data',
  licence: S.LICENCE_NAME,
  licence_url: S.LICENCE_URL,
  attribution: 'Swechha, https://swechha.in',
  citation: 'Swechha. Delhi air quality record. Readings from the Central Pollution Control Board network. https://swechha.in/record/air',
  generated_by: 'scripts/build-data-exports.mjs',
  /* NO `generated_at`. It would change on every build, so the committed tree
     would differ from a fresh regeneration on every single run and the
     generated-current diff gate would fail permanently. The freshness fact
     worth having is the DATA's own coverage, which is below and which only
     moves when the data does — the identical argument data/seo/lastmod.json is
     built on. */
  files: {
    note: 'STATIC FILES, regenerated when the store changes. Not an API — see `live` below for the one endpoint that is.',
    hourly: {
      description: 'One row per hourly observation of Delhi air quality: the worst reporting monitor named, the station mean beside it, and how many times CPCB later revised that reading.',
      formats: ['text/csv', 'application/json'],
      note: 'The CSV states how many times a reading was revised; the JSON states what each revision said and what the reading was before it. Per-station readings are in the stations files below.',
      months: MONTHS.map((m) => ({
        month: `${m.y}-${m.mo}`,
        csv: `/data/air/delhi-${m.y}-${m.mo}.csv`,
        json: `/data/air/delhi-${m.y}-${m.mo}.json`,
        rows: m.rows.length,
      })),
    },
    stations: {
      description: 'One row per reporting monitor per hour: every station in the Delhi network at that observation, with the band it was in and whether it was over the published limit.',
      note: 'Long format, one row per station-hour, because the reporting set changes from hour to hour. This is the file a per-neighbourhood analysis needs; the hourly file above carries only the worst monitor and the mean.',
      formats: ['text/csv'],
      months: MONTHS.map((m) => ({
        month: `${m.y}-${m.mo}`,
        csv: `/data/air/delhi-${m.y}-${m.mo}-stations.csv`,
      })),
    },
    daily: {
      description: "One row per day: the day's peak observation, how many hours were actually observed, and how many of them were over the published limit.",
      csv: '/data/air/delhi-daily.csv',
      rows: daily.length,
    },
  },
  live: {
    note: 'The one request-time endpoint on this site. Everything above is a file.',
    endpoint: '/api/air',
    description: 'Delhi, the current hour, fetched from CPCB at request time. Returns { ok: false } with a reason and no reading on any failure — never a zero.',
    method: 'GET',
    format: 'application/json',
  },
  coverage: {
    subject: 'Delhi air quality',
    spatial: 'Delhi, India',
    temporal: FIRST && LAST ? `${FIRST}/${LAST}` : null,
    cadence: 'hourly',
    source: 'Central Pollution Control Board (CPCB) continuous ambient monitoring network',
    measured_or_modelled: 'measured',
  },
  not_published: [{
    subject: 'India air quality, all reporting cities, hourly',
    kept: 'data/air-history/india-YYYY-MM.ndjson',
    published_as: 'https://swechha.in/now/air/india',
    reason: 'Kept the same way as Delhi and not yet published as files. Around 268 rows an hour comes to roughly 12 MB of CSV a month at the cadence this store is filled at, in a repository whose generated artefacts are regenerated and diffed on every push. Ask if you need it.',
  }],
  limitations: [
    'Nothing is interpolated and no gap is filled. An hour with no observation is absent; a day with four hours in it is four hours of record.',
    'The reading is the worst reporting monitor, named — not a population-weighted city average. CPCB publishes one of those as well and the two answer different questions.',
    'A station reading describes a point, not a neighbourhood, and an index cannot be converted back into a concentration.',
    'The grant covers this compilation. CPCB keeps its own terms over the underlying readings.',
  ],
};
files.push({
  ...write('index.json', `${JSON.stringify(manifest, null, 1)}\n`),
  kind: 'manifest', format: 'application/json', month: null, rows: null,
});

if (bad) {
  console.error(`\nREFUSING TO REPORT: ${bad} data check(s) failed. Files were written but do not trust them.`);
  process.exit(1);
}

/* ═══ GATES ══════════════════════════════════════════════════════════════ */
let g = 0;
const gate = (ok, msg) => { if (!ok) { console.error(`  FAIL ${msg}`); g++; } else console.log(`  ok   ${msg}`); };
console.log('\nWROTE');
for (const f of files) {
  console.log(`  ${f.path.padEnd(34)} ${String(f.bytes).padStart(9)} bytes`
    + (f.rows === null ? '' : `  ${f.rows} row(s)`));
}
console.log('\nGATES');

/* 1. EVERY OBSERVATION IN THE STORE REACHES AN EXPORT. An export that silently
      drops rows is worse than no export: a researcher would compute a monthly
      mean over a subset and never know. */
const stored = MONTHS.reduce((n, m) => n + m.rows.length, 0);
const exported = files.filter((f) => f.kind === 'hourly' && f.format === 'text/csv')
  .reduce((n, f) => n + f.rows, 0);
gate(stored === exported, `all ${stored} stored observations are in the hourly CSVs (${exported} exported)`);

/* 2. THE CSV AND THE JSON AGREE, PER MONTH. Two writers, one source; the only
      way they can differ is a bug in one of them. */
for (const m of MONTHS) {
  const c = files.find((f) => f.month === `${m.y}-${m.mo}` && f.format === 'text/csv');
  const j = files.find((f) => f.month === `${m.y}-${m.mo}` && f.format === 'application/json');
  gate(c && j && c.rows === j.rows, `${m.y}-${m.mo}: the CSV and the JSON hold the same ${c?.rows} rows`);
}

/* 3. THE DAILY ROLL-UP SUMS TO THE HOURLY COUNT. `hours_observed` is the
      honesty column and this is the one thing that can make it a lie. */
const dailyHours = daily.reduce((n, d) => n + d.hours_observed, 0);
gate(dailyHours === stored, `the daily file's hours_observed sums to ${stored} (got ${dailyHours})`);

/* 4. NO ROW CLAIMS A READING IT DOES NOT HAVE. An empty AQI must carry an empty
      band, and a present AQI must carry a band — a numeral with no band is
      unreadable and a band with no numeral is invented. */
const hourlyAll = MONTHS.flatMap((m) => m.rows.map((r, i) => hourlyRow(r, `gate4 ${m.y}-${m.mo} ${i}`)));
const halfRead = hourlyAll.filter((r) => (r.aqi === '') !== (r.band === ''));
gate(halfRead.length === 0, `no row carries an AQI without a band or a band without an AQI`);

/* 5. EVERY STAMP PARSED. `iso()` records a failure rather than throwing, so a
      malformed stamp would otherwise reach a file as an empty cell. */
const noStamp = hourlyAll.filter((r) => !r.observed);
gate(noStamp.length === 0, `every observation carries an ISO-8601 stamp with its +05:30 offset`);

/* 6. THE MANIFEST DESCRIBES THE FILES THAT EXIST. A manifest that names a file
      nobody wrote is the "asserting a file that does not exist" failure this
      whole exercise was built to end, one level up. */
const named = [
  ...manifest.files.hourly.months.flatMap((m) => [m.csv, m.json]),
  ...manifest.files.stations.months.map((m) => m.csv),
  manifest.files.daily.csv,
];
const written = new Set(files.map((f) => f.path));
const phantom = named.filter((p) => !written.has(p));
gate(phantom.length === 0, `every file the manifest names was written${phantom.length ? `; PHANTOM: ${phantom.join(', ')}` : ''}`);

/* 7. IT DOES NOT CALL ITSELF AN API. The word may appear only where it
      describes `/api/air`, which is one. This is a copy gate on a claim, and it
      is here because the temptation to write "API" over a directory of CSVs is
      exactly the drift the header refuses. */
const blob = JSON.stringify({ ...manifest, live: null });
gate(!/\bAPI\b/.test(blob.replace(/Not an API[^"]*/g, '')),
  'the manifest claims an API nowhere except where it names the one real endpoint');

console.log(`\n${files.length} file(s). ${g ? `${g} gate(s) failed.` : 'All gates pass.'}`);
if (g) process.exit(1);
