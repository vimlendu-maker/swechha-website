#!/usr/bin/env node
/**
 * fetch-bhuvan-heat.mjs — what India's OWN satellite heat product covers.
 *
 *   node scripts/fetch-bhuvan-heat.mjs [out.json]        # keyless
 *
 * WHY THIS EXISTS, AND WHAT IT IS NOT.
 * ISRO/NRSC runs a heat outlook on Bhuvan at bhuvan-app1.nrsc.gov.in/heatwave/.
 * It serves MAP IMAGES over WMS — pixels, not values. So this job does not and
 * cannot read a temperature out of it. What it CAN read is the product's own
 * date index, which the application fetches to build its time slider:
 *
 *     usrtasks/heatwave/get/getheat.php   ->  date||date||date...
 *
 * That gives two things worth publishing:
 *
 *   1. COVERAGE, verified rather than described. How many days the official
 *      product actually holds, and the first and last of them. A portal that
 *      stopped publishing two years ago and a portal that is current look
 *      identical from the outside, and the difference matters on a page whose
 *      subject is whether anyone is watching.
 *
 *   2. ITS LAYER SET, which is an argument. The application offers four
 *      layers: Temperature Based Heat, MOISTURE AND Temperature Based Heat,
 *      and each one's deviation from climatology. That is the Government of
 *      India's own instrument saying, in its choice of layers, that dry-bulb
 *      temperature alone is not enough and that a departure needs a normal.
 *      This page's own data reached the same conclusion independently, and a
 *      convergence with the official product is worth more than either alone.
 *
 * THE RULE THIS OBEYS — AD-15's band-10 ruling on SAFAR, applied unchanged:
 * "Link it, do not scrape it." A portal with no documented public API gets
 * named and linked. Scraping a value out of a map tile would produce a figure
 * with no attachable source, which is the one thing this site exists not to do.
 * The date index is metadata about the product, not a reading from it.
 *
 * AN ERROR IS NOT AN EMPTY ARCHIVE. The endpoint answers with a plain-text
 * body, so a failure is indistinguishable from "no dates" unless the SHAPE is
 * validated. A failed fetch is recorded as null, never as zero coverage.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const OUT = resolve(process.argv[2] || 'data/bhuvan-heat.json');
const APP = 'https://bhuvan-app1.nrsc.gov.in/heatwave/';
const INDEX = `${APP}usrtasks/heatwave/get/getheat.php`;
const UA = 'Mozilla/5.0 (compatible; SwechhaBot/1.0; +https://swechha.in)';

// Read out of the application's own layer selector, not invented.
const LAYERS = [
  { value: 'temp_forecast',  label: 'Temperature Based Heat',
    note: 'daily maximum temperature' },
  { value: 'theta_forecast', label: 'Moisture and Temperature Based Heat',
    note: 'temperature with humidity — what a body experiences' },
  { value: 'temp_anomaly',   label: 'Temperature Based Heat, deviation from climatology',
    note: 'the departure, which is what IMD\'s own heatwave criteria are built on' },
  { value: 'theta_anomaly',  label: 'Moisture and Temperature Based Heat, deviation from climatology',
    note: 'both at once' },
];

async function coverage() {
  let text;
  try {
    const res = await fetch(INDEX, { headers: { 'User-Agent': UA, Referer: APP } });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}`, dates: null };
    text = await res.text();
  } catch (e) { return { ok: false, error: `network: ${e.message}`, dates: null }; }

  // Validate the SHAPE. The body is 'YYYY-MM-DD__YYYY-MM-DD||...' and anything
  // else — an error page, a redirect, a login form — must not read as zero.
  if (!/^\s*\d{4}-\d{2}-\d{2}__/.test(text)) {
    return { ok: false, error: 'response is not the expected date index', dates: null };
  }
  const dates = [...new Set(
    text.split('||').map(p => p.split('__')[0].trim()).filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d))
  )].sort();
  if (dates.length < 2) return { ok: false, error: `only ${dates.length} date(s) parsed`, dates: null };

  const byYear = {};
  for (const d of dates) byYear[d.slice(0, 4)] = (byYear[d.slice(0, 4)] || 0) + 1;
  return { ok: true, error: null, dates_count: dates.length,
    first: dates[0], last: dates[dates.length - 1], by_year: byYear,
    // Kept out of the output: 1,000+ date strings the page has no use for.
    dates: null };
}

const cov = await coverage();
if (!cov.ok) {
  console.error(`Bhuvan heat index unavailable (${cov.error}). ` +
    'Leaving the previous file alone rather than publishing an absence.');
  process.exit(1);
}

const out = {
  subject: 'India\'s own satellite heat outlook — what it covers',
  role: 'a named official instrument, linked and never scraped. This file records the product\'s '
      + 'COVERAGE and its LAYER SET. It contains no temperature, because the product serves map '
      + 'images and a value read off a tile would have no attachable source.',
  source: {
    name: 'Bhuvan, National Remote Sensing Centre, ISRO',
    application: 'Heatwave / Hot Weather Outlook',
    url: APP,
    index_endpoint: INDEX,
    serves: 'WMS map images over a date slider',
    api: 'none documented',
  },
  state_label: 'PERIODIC',
  coverage: cov,
  layers: LAYERS,
  the_argument: {
    headline: 'India\'s own heat product does not measure heat with temperature alone.',
    reading: 'Two of its four layers add MOISTURE, and two express the result as a DEPARTURE FROM '
           + 'CLIMATOLOGY rather than as a number of degrees. That is the official instrument '
           + 'agreeing, in its design, with the two things this page had to compute for itself: '
           + 'that a body experiences humidity as well as temperature, and that heat is only '
           + 'meaningful against a normal.',
    why_it_matters_here: 'This page found that dry-bulb maximum temperature at a Delhi grid point is '
           + 'not rising over 1991-2026. That finding is easy to misread as "heat is not getting '
           + 'worse". The existence of a moisture layer in the national product is independent '
           + 'evidence that dry-bulb maximum was never the right single measure.',
  },
  caveats: [
    'This is a FORECAST product, not an observational record. It is not the source of any reading on this page.',
    'It serves images. No value on this site comes from it.',
    'The date index is the application\'s own slider metadata. It says what days exist, not what they contained.',
    'A failed fetch is recorded as null and never as an empty archive.',
  ],
  fetched: { epochMs: Date.now() },
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');

console.log(`Bhuvan heat outlook: ${cov.dates_count} dates, ${cov.first} to ${cov.last}`);
for (const [y, n] of Object.entries(cov.by_year)) console.log(`  ${y}  ${String(n).padStart(4)} days`);
console.log(`layers: ${LAYERS.length} (${LAYERS.filter(l => /theta/.test(l.value)).length} of them include moisture)`);
console.log(`wrote ${OUT}`);
