#!/usr/bin/env node
/**
 * air-history-report.mjs — proof that the observation time-series answers the
 * questions it was built for (AD-46): 24-hour trends, daily comparisons,
 * records. Read-only, dependency-free, no page changes — this is the seam any
 * future chart builds on, exercised from the command line.
 *
 *   node scripts/air-history-report.mjs [data/air-history]
 *
 * Everything printed is derived from the store alone. The hour labels are
 * CPCB's own IST wall-clock stamps, printed as stored — never Date-parsed,
 * never converted; the standing two-clock rule applies to reports too.
 */
import { readHistory } from './lib/air-history.mjs';
import { resolve } from 'node:path';

const DIR = resolve(process.argv[2] || 'data/air-history');
const entries = readHistory({ dir: DIR, scope: 'delhi' });
if (!entries.length) {
  console.error(`no delhi history under ${DIR} — run the fetch first`);
  process.exit(1);
}

const parse = (s) => {
  const m = /^(\d{2})-(\d{2})-(\d{4})\s+(\d{2}):(\d{2})/.exec(s);
  return { d: +m[3] * 10000 + +m[2] * 100 + +m[1], day: `${m[1]}-${m[2]}-${m[3]}`, hh: m[4], mi: m[5] };
};
const latest = entries[entries.length - 1];
const latestP = parse(latest.obs);

console.log(`Delhi observation history — ${entries.length} genuine observation(s) in ${DIR}`);
console.log(`latest: ${latest.obs} IST — AQI ${latest.city.aqi} (${latest.city.band}), `
  + `${latest.city.governing} at ${latest.city.station}`);
console.log(`        first seen ${latest.first_seen}, last checked ${latest.last_checked}, checks ${latest.checks}\n`);

// 24-hour trend: every observation within 24h of the newest, by IST hour.
const dayMs = (p) => Date.UTC(Math.floor(p.d / 10000), Math.floor((p.d % 10000) / 100) - 1, p.d % 100, +p.hh, +p.mi);
const cutoff = dayMs(latestP) - 24 * 3600 * 1000;
const last24 = entries.filter((e) => dayMs(parse(e.obs)) > cutoff);
console.log('24-hour trend (hour IST — AQI, band):');
for (const e of last24) {
  const p = parse(e.obs);
  console.log(`  ${p.day} ${p.hh}:${p.mi}  ${String(e.city.aqi).padStart(4)}  ${e.city.band}`
    + (e.revised ? `  (revised x${e.revised})` : ''));
}

// The latest day's max and min, with their hours.
const today = entries.filter((e) => parse(e.obs).day === latestP.day);
const max = today.reduce((a, b) => (b.city.aqi > a.city.aqi ? b : a));
const min = today.reduce((a, b) => (b.city.aqi < a.city.aqi ? b : a));
console.log(`\n${latestP.day} (IST day, ${today.length} observation(s)):`);
console.log(`  max  ${max.city.aqi} (${max.city.band}) at ${parse(max.obs).hh}:${parse(max.obs).mi} IST — ${max.city.station}`);
console.log(`  min  ${min.city.aqi} (${min.city.band}) at ${parse(min.obs).hh}:${parse(min.obs).mi} IST — ${min.city.station}`);

// The current month's record high.
const month = latest.obs.slice(3, 10); // 'MM-YYYY'
const inMonth = entries.filter((e) => e.obs.slice(3, 10) === month);
const rec = inMonth.reduce((a, b) => (b.city.aqi > a.city.aqi ? b : a));
console.log(`\nmonth ${month}: record high ${rec.city.aqi} (${rec.city.band}) at ${rec.obs} IST — ${rec.city.station}`);
console.log(`(${inMonth.length} observation(s) held for the month; every figure above is a CPCB observation, none interpolated)`);
