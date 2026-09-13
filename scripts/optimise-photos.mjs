#!/usr/bin/env node
/* OPTIMISE THE PHOTOGRAPHS THAT SHIP IN EVERY DEPLOYMENT.
 *
 * ★ WHY THIS EXISTS. `public/` is copied whole into the build output of every
 *   deployment, and Vercel keeps that output for every RETAINED deployment. On
 *   2026-09-12 the account hit 100% of Hobby's 10GB Deployment Storage with 418
 *   deployments retained and ~104MB of `public/` in each. Bytes here are not
 *   paid once; they are paid once per deployment.
 *
 * ★ IT RE-ENCODES IN PLACE AND CHANGES NOTHING ELSE. Same filename, same
 *   format, same pixel dimensions. Not one of the 148 generated pages refers to
 *   an image by anything but its path, so there is nothing to regenerate and
 *   nothing to keep in step — which is the whole reason it was built this way
 *   rather than as a conversion to AVIF/WebP.
 *
 * ★ `.rotate()` IS NOT OPTIONAL AND IS NOT DECORATION. sharp drops EXIF
 *   orientation on write, so a re-encode WITHOUT it renders a rotated original
 *   sideways. That has already shipped here once: a performance pass put seven
 *   photographs on the live site rotated 90°, and the dimension check was blind
 *   to it because the dimensions were right. `.rotate()` with no argument bakes
 *   the EXIF orientation into the pixels, after which orientation=1 is honest.
 *
 * ★ METADATA IS KEPT. A quarter of these files carry EXIF/IPTC/XMP, and some of
 *   that is attribution. A few KB per file is the wrong thing to win by losing
 *   provenance on someone's photograph.
 *
 * ★ A FILE THAT DOES NOT GET SMALLER IS LEFT ALONE. Re-encoding an already-
 *   optimal JPEG costs quality and saves nothing, so the result is discarded
 *   unless it beats the original by at least MIN_GAIN bytes.
 *
 * Usage:
 *   node scripts/optimise-photos.mjs --check   # measure, write nothing
 *   node scripts/optimise-photos.mjs           # apply
 */
import { readdirSync, statSync, readFileSync, writeFileSync } from 'node:fs';
import { join, extname } from 'node:path';
import sharp from 'sharp';

const DIRS = ['public/images/photos', 'public/images/posters', 'public/images/people', 'public/images/eo'];
const QUALITY = 82;          // mozjpeg; measured at ~20% off these sources
const MIN_GAIN = 2048;       // bytes — below this the rewrite is not worth the re-encode
const check = process.argv.includes('--check');

const files = [];
for (const dir of DIRS) {
  let entries;
  try { entries = readdirSync(dir, { recursive: true }); } catch { continue; }
  for (const rel of entries) {
    const p = join(dir, rel);
    if (!statSync(p).isFile()) continue;
    if (!/^\.jpe?g$/i.test(extname(p))) continue;
    files.push(p);
  }
}

let before = 0, after = 0, rewritten = 0, skipped = 0;
const failures = [];

for (const p of files) {
  const original = readFileSync(p);
  before += original.length;
  const meta = await sharp(original).metadata();
  let out;
  try {
    out = await sharp(original)
      .rotate()                                  // see the ★ above — never remove
      .jpeg({ quality: QUALITY, mozjpeg: true, chromaSubsampling: '4:2:0' })
      .withMetadata()
      .toBuffer();
  } catch (e) {
    failures.push(`${p}: ${e.message}`);
    after += original.length;
    continue;
  }

  // The re-encode must not have changed what the page lays out. An orientation
  // >4 swaps width and height once baked in, which is correct, so compare
  // against the rotated expectation rather than the raw header.
  const outMeta = await sharp(out).metadata();
  const swapped = (meta.orientation || 1) >= 5;
  const expectW = swapped ? meta.height : meta.width;
  const expectH = swapped ? meta.width : meta.height;
  if (outMeta.width !== expectW || outMeta.height !== expectH) {
    failures.push(`${p}: dimensions changed ${expectW}x${expectH} -> ${outMeta.width}x${outMeta.height}`);
    after += original.length;
    continue;
  }

  if (original.length - out.length < MIN_GAIN) {
    skipped++;
    after += original.length;
    continue;
  }
  after += out.length;
  rewritten++;
  if (!check) writeFileSync(p, out);
}

const mb = (n) => (n / 1048576).toFixed(1) + 'MB';
console.log(`${check ? 'CHECK (nothing written)' : 'APPLIED'}: ${files.length} JPEGs in ${DIRS.length} directories`);
console.log(`  rewritten ${rewritten}, left alone ${skipped} (already at or below q${QUALITY})`);
console.log(`  ${mb(before)} -> ${mb(after)}  (${(100 - 100 * after / before).toFixed(0)}% smaller, ${mb(before - after)} off every deployment)`);
if (failures.length) {
  console.error(`\n${failures.length} file(s) NOT rewritten:`);
  for (const f of failures) console.error('  ' + f);
  process.exit(1);
}
