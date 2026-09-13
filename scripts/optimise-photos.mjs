#!/usr/bin/env node
/* OPTIMISE THE PHOTOGRAPHS THAT SHIP IN EVERY DEPLOYMENT — command line.
 *
 * The work, and the reasoning behind every decision in it, lives in
 * `scripts/lib/optimise-photos.mjs`. Read that header before changing anything
 * here: four of its behaviours are load-bearing and one of them was learned the
 * expensive way. This file is argument parsing and a report.
 *
 * Usage:
 *   node scripts/optimise-photos.mjs --check   # measure, write nothing
 *   node scripts/optimise-photos.mjs           # apply
 *
 * Running it twice in a row rewrites nothing the second time. That is a tested
 * property (`lib/optimise-photos.test.ts`), not an aspiration — it did not hold
 * until 2026-09-13, and 35 photographs were re-encoded a second time because of
 * it. "rewritten 0" is the healthy result on a tree that is already optimised.
 */
import { optimisePhotos, PHOTO_DIRS, QUALITY } from './lib/optimise-photos.mjs';

const check = process.argv.includes('--check');
const r = await optimisePhotos({ check });

const mb = (n) => (n / 1048576).toFixed(1) + 'MB';
console.log(`${check ? 'CHECK (nothing written)' : 'APPLIED'}: ${r.files.length} JPEGs in ${PHOTO_DIRS.length} directories`);
console.log(`  rewritten ${r.rewritten}`);
console.log(`  left alone ${r.skipped} — ${r.atQuality} already at or below q${QUALITY}, ${r.noGain} above it but not worth the rewrite`);
console.log(`  ${mb(r.before)} -> ${mb(r.after)}  (${(100 - 100 * r.after / r.before).toFixed(0)}% smaller, ${mb(r.before - r.after)} off every deployment)`);
if (r.failures.length) {
  console.error(`\n${r.failures.length} file(s) NOT rewritten:`);
  for (const f of r.failures) console.error('  ' + f);
  process.exit(1);
}
