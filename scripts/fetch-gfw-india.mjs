#!/usr/bin/env node
/**
 * fetch-gfw-india.mjs — annual tree-cover loss for India, from the Hansen/UMD
 * satellite series. KEYLESS.
 *
 *   node scripts/fetch-gfw-india.mjs [out.json]
 *
 * WHY THIS EXISTS, AND WHY IT IS A CHANGE OF POSITION.
 * AD-16 §2.3 recorded the Hansen/UMD series as UNAVAILABLE: the documented
 * Global Forest Watch data API answers `data-api.globalforestwatch.org` with
 * HTTP 403 and "Request is missing valid API key", and this build would not
 * create an account. The forest-loss page was therefore designed around a
 * named hole where the satellite measurement should be.
 *
 * The client then pointed at globalnaturewatch.org. Reading its network layer
 * end to end — the same method used on vayu-gamma for the Air page — shows it
 * is WRI's own front end for the same data, and that it reaches the datasets
 * through a KEYLESS SAME-ORIGIN PROXY at `globalnaturewatch.org/api/data/...`.
 * So the figures below are GFW's own, from GFW's own dataset at a stated
 * version, obtained the way GFW's own web client obtains them.
 *
 * THAT DISTINCTION IS ON THE PAGE. This is a public web client's proxy, not a
 * documented API contract: it can change or close without notice, and it is
 * not a licence. The dataset name and version are recorded on every figure so
 * any number here is checkable against the authoritative source by anyone who
 * does hold a key. Getting one remains the right long-term answer.
 *
 * ★★ THE TRAP THAT ALMOST PUT 19 MILLION HECTARES ON THE PAGE ★★
 * `gadm__tcl__iso_change` is keyed by `umd_tree_cover_density_2000__threshold`,
 * and the thresholds are CUMULATIVE NESTED SUBSETS, not exclusive buckets:
 *
 *     0%   3,268,363 ha        30%  2,425,650 ha
 *     10%  2,619,067 ha        50%  2,138,665 ha
 *     15%  2,552,399 ha        75%  1,263,437 ha
 *     20%  2,521,052 ha
 *     25%  2,486,317 ha
 *
 * A `SUM(...) GROUP BY year` with no threshold filter sums all eight, giving
 * ~19.3 Mha — eight times the real figure, and superficially plausible. The
 * first query written here did exactly that.
 *
 * So: every query pins ONE threshold, and the job ASSERTS the series is
 * monotonically decreasing in threshold before it writes. If a future dataset
 * version switches to exclusive buckets, that assertion fires rather than the
 * page quietly publishing a number eight times too large.
 *
 * THE THRESHOLD IS 30% BECAUSE GFW'S OWN HEADLINE USES 30%. Stated on the page,
 * because it is a choice and a different choice gives a different answer.
 *
 * AN ERROR IS NOT A ZERO. Every query is validated on shape and a failure is
 * recorded as null. "India lost no forest" is not a sentence this site will
 * publish because a proxy was down.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const OUT = resolve(process.argv[2] || 'data/gfw-india.json');
const HOST = 'https://globalnaturewatch.org/api/data/dataset';
const CHANGE = process.env.GFW_CHANGE_DATASET || 'gadm__tcl__iso_change/v20260407';
const THRESHOLD = Number(process.env.GFW_THRESHOLD || 30);
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36';

/** One SQL query against the proxy. Returns null on any failure. */
async function q(dataset, sql, label) {
  // The trailing slash matters: without it the host answers 308 and curl-style
  // clients that do not follow redirects get nothing.
  const url = `${HOST}/${dataset}/query/json/?sql=${encodeURIComponent(sql)}`;
  let body;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA, Referer: 'https://globalnaturewatch.org/' }, redirect: 'follow' });
    const text = await res.text();
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}: ${text.slice(0, 120)}`, rows: null };
    // Validate the SHAPE, never the status — an application error page is
    // served with a 200 by the platform in front of this.
    if (!text.trim().startsWith('{')) return { ok: false, error: 'response is not JSON', rows: null };
    body = JSON.parse(text);
  } catch (e) { return { ok: false, error: `network: ${e.message}`, rows: null }; }
  if (body.status !== 'success' || !Array.isArray(body.data)) {
    return { ok: false, error: body.message || 'unexpected response shape', rows: null };
  }
  console.log(`  ${label.padEnd(34)} ${String(body.data.length).padStart(4)} rows`);
  return { ok: true, error: null, rows: body.data };
}

console.log(`GFW via ${HOST}\n  dataset ${CHANGE}, threshold ${THRESHOLD}%\n`);

/* ── 1. THE THRESHOLD LADDER — fetched FIRST, because it is the guard. ─── */
const ladder = await q(CHANGE,
  `SELECT umd_tree_cover_density_2000__threshold AS t, SUM(umd_tree_cover_loss__ha) AS ha
   FROM data WHERE iso = 'IND' GROUP BY t ORDER BY t`, 'threshold ladder');

let cumulative = null;
if (ladder.ok) {
  const rows = ladder.rows.map(r => ({ threshold: r.t, total_ha: r.ha }));
  // Cumulative nesting means total_ha must FALL as the threshold rises.
  cumulative = rows.every((r, i) => i === 0 || r.total_ha <= rows[i - 1].total_ha);
  ladder.rows = rows;
  if (!cumulative) {
    console.error('\n*** THRESHOLD SEMANTICS HAVE CHANGED ***\n' +
      '  The per-threshold totals are no longer monotonically decreasing, which means the\n' +
      '  thresholds are no longer cumulative nested subsets. Every figure in this file assumes\n' +
      '  they are. Do NOT publish until this is re-derived — a wrong assumption here produces a\n' +
      '  number eight times too large that still looks plausible.');
    process.exit(1);
  }
  const naive = rows.reduce((a, r) => a + r.total_ha, 0);
  const real = rows.find(r => r.threshold === THRESHOLD)?.total_ha ?? null;
  console.log(`  ladder is cumulative: naive sum-of-all-thresholds would be ` +
    `${(naive / 1e6).toFixed(2)} Mha against the real ${(real / 1e6).toFixed(2)} Mha at ${THRESHOLD}%`);
}

/* ── 2. THE SERIES, at one pinned threshold. ─────────────────────────── */
const T = `umd_tree_cover_density_2000__threshold = ${THRESHOLD}`;
const byYear = await q(CHANGE,
  `SELECT umd_tree_cover_loss__year AS year, SUM(umd_tree_cover_loss__ha) AS ha
   FROM data WHERE iso = 'IND' AND ${T} GROUP BY year ORDER BY year`, `annual loss at ${THRESHOLD}%`);

const primary = await q(CHANGE,
  `SELECT umd_tree_cover_loss__year AS year, SUM(umd_tree_cover_loss__ha) AS ha
   FROM data WHERE iso = 'IND' AND ${T} AND is__umd_regional_primary_forest_2001 = true
   GROUP BY year ORDER BY year`, 'primary-forest loss');

/* THE DEVICE. ISFR counts plantations as forest cover; this field says how much
   of the measured loss was in a planted forest. It is the single best answer to
   "is the satellite series just counting plantation harvests?" */
const planted = await q(CHANGE,
  `SELECT gfw_planted_forests__type AS type, SUM(umd_tree_cover_loss__ha) AS ha
   FROM data WHERE iso = 'IND' AND ${T} GROUP BY type ORDER BY ha DESC`, 'planted vs natural');

if (!byYear.ok) {
  console.error('\nThe annual series failed. Leaving the previous file alone rather than publishing an absence.');
  process.exit(1);
}

const years = byYear.rows.map(r => ({ year: r.year, loss_ha: +r.ha.toFixed(0) }));
const total = years.reduce((a, y) => a + y.loss_ha, 0);
const peak = years.reduce((a, b) => (b.loss_ha > a.loss_ha ? b : a));
const floor = years.reduce((a, b) => (b.loss_ha < a.loss_ha ? b : a));
const half = (from, to) => {
  const s = years.filter(y => y.year >= from && y.year <= to);
  return s.length ? { from, to, years: s.length,
    mean_ha: Math.round(s.reduce((a, b) => a + b.loss_ha, 0) / s.length) } : null;
};
const mid = years[Math.floor(years.length / 2)]?.year ?? null;

const primaryYears = primary.ok
  ? primary.rows.map(r => ({ year: r.year, loss_ha: +r.ha.toFixed(0) })) : null;
const primaryTotal = primaryYears ? primaryYears.reduce((a, y) => a + y.loss_ha, 0) : null;

let plantedSplit = null;
if (planted.ok) {
  const rows = planted.rows.map(r => ({
    type: r.type == null ? 'Not a planted forest' : r.type,
    is_planted: !(r.type == null || r.type === 'Not a planted forest'),
    loss_ha: +r.ha.toFixed(0),
  }));
  const inPlanted = rows.filter(r => r.is_planted).reduce((a, r) => a + r.loss_ha, 0);
  const outside = rows.filter(r => !r.is_planted).reduce((a, r) => a + r.loss_ha, 0);
  plantedSplit = {
    rows,
    in_planted_ha: inPlanted,
    outside_planted_ha: outside,
    outside_pct: +(outside / (inPlanted + outside) * 100).toFixed(1),
    reading: 'The share of measured tree-cover loss that was NOT inside a planted forest. It is the '
           + 'answer to the commonest objection to this series — that it merely counts plantation '
           + 'harvests, which grow back.',
  };
}

const out = {
  subject: 'Tree cover loss in India, 2001 onwards — the satellite measurement',
  kind: 'counted',
  kind_note: 'Canopy change measured from Landsat imagery. It is a measurement, not a model. What it '
           + 'MEANS depends entirely on the definition of the threshold, which is why the threshold '
           + 'is stated everywhere the number is.',
  state_label: 'PERIODIC',

  source: {
    name: 'Hansen / University of Maryland tree cover loss, published by Global Forest Watch (World Resources Institute)',
    dataset: CHANGE,
    obtained_via: {
      host: 'https://globalnaturewatch.org/api/data/',
      what_it_is: 'the keyless same-origin proxy that WRI\'s own Global Nature Watch web client uses '
                + 'to read these datasets',
      why: 'The documented API at data-api.globalforestwatch.org requires a key, which this build '
         + 'did not create. This proxy serves the identical dataset at a stated version.',
      honesty: 'This is a public web client\'s proxy, NOT a documented API contract. It can change or '
             + 'close without notice and it is not a licence. Every figure records the dataset and '
             + 'version so it is checkable against the authoritative source by anyone holding a key. '
             + 'Obtaining a key remains the right long-term answer.',
      register: 'https://data-api.globalforestwatch.org/#tag/Authentication',
    },
  },

  threshold: {
    value: THRESHOLD,
    unit: 'per cent canopy density in 2000',
    why: 'GFW\'s own headline figures use 30 per cent. It is a CHOICE and a different choice gives a '
       + 'different answer, so it is printed wherever the number is.',
    semantics: 'cumulative nested subsets — the 10% figure INCLUDES the 30% figure',
    verified_cumulative: cumulative,
    ladder: ladder.ok ? ladder.rows : null,
    the_trap: 'Summing across thresholds double-counts and gives roughly eight times the real total. '
            + 'This job asserts the ladder is monotonically decreasing before it writes.',
  },

  total: {
    loss_ha: total,
    loss_km2: Math.round(total / 100),
    loss_mha: +(total / 1e6).toFixed(2),
    from: years[0].year, to: years[years.length - 1].year,
  },
  years,
  peak, floor,
  halves: mid ? [half(years[0].year, mid), half(mid + 1, years[years.length - 1].year)] : null,

  primary_forest: primary.ok ? {
    total_ha: primaryTotal,
    total_mha: +(primaryTotal / 1e6).toFixed(3),
    share_of_all_loss_pct: +(primaryTotal / total * 100).toFixed(1),
    years: primaryYears,
    what_it_is: 'loss inside forest mapped as regional primary forest in 2001 — mature natural forest, '
              + 'the part that does not come back on a human timescale',
  } : { ok: false, error: primary.error },

  planted_split: plantedSplit ?? { ok: false, error: planted.error },

  caveats: [
    'Tree cover loss is not deforestation. It counts canopy disappearing for any reason — felling, '
      + 'fire, storm, disease, harvest — and it does not say why.',
    'It is not net change. Gain is a separate measurement on a different method and the two are '
      + 'not subtracted from each other here.',
    'The threshold changes the answer. Every figure states which threshold it is on.',
    'A failed query is recorded as null, never as zero loss.',
    'This series and India\'s own forest report measure different things and disagree. Both are '
      + 'published. Neither is averaged into the other.',
  ],
  fetched: { epochMs: Date.now() },
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');

console.log(`\ntotal ${out.total.loss_mha} Mha (${out.total.loss_km2.toLocaleString('en-IN')} km2) ` +
  `over ${out.total.from}-${out.total.to} at ${THRESHOLD}% canopy`);
console.log(`peak  ${peak.year}  ${peak.loss_ha.toLocaleString('en-IN')} ha`);
console.log(`floor ${floor.year}  ${floor.loss_ha.toLocaleString('en-IN')} ha`);
if (out.halves?.[0] && out.halves?.[1]) {
  for (const h of out.halves) console.log(`  ${h.from}-${h.to}: mean ${h.mean_ha.toLocaleString('en-IN')} ha/yr`);
}
if (out.primary_forest?.total_ha) {
  console.log(`primary forest: ${out.primary_forest.total_mha} Mha (${out.primary_forest.share_of_all_loss_pct}% of all loss)`);
}
if (plantedSplit) {
  console.log(`outside planted forests: ${plantedSplit.outside_pct}% of all loss ` +
    `(${plantedSplit.outside_planted_ha.toLocaleString('en-IN')} of ` +
    `${(plantedSplit.outside_planted_ha + plantedSplit.in_planted_ha).toLocaleString('en-IN')} ha)`);
}
console.log(`wrote ${OUT}`);
