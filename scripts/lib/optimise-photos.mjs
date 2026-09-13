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
 * ★ A FILE ALREADY AT THE TARGET QUALITY IS NOT TOUCHED — and that, not the
 *   byte count, is the first question asked. Until 2026-09-13 the only guard
 *   was MIN_GAIN, which asks whether the re-encode came out smaller. It always
 *   does: a second mozjpeg q82 pass over a large photograph sheds several KB by
 *   shedding DETAIL. So the guard never fired, and a single run during the
 *   merge of PR #155 re-encoded 35 files that were already at q82 — q82 on top
 *   of q82, cumulative generation loss — for a combined 0.2MB, and printed
 *   "rewritten 35" as though it had done something useful. Those 35 were
 *   reverted by hand. `jpeg-quality.mjs` now reads the quantisation tables back
 *   out of each file and compares them against the tables our own encoder
 *   produces, so an already-optimised file is recognised as such however many
 *   bytes a rewrite would appear to save, and running this twice in a row
 *   writes nothing the second time. MIN_GAIN survives as the second question,
 *   for files that genuinely are above target but would not get smaller.
 *
 * ★ A SKIPPED FILE IS LEFT EXACTLY AS IT WAS, orientation tag included. That is
 *   correct rather than merely tolerable: every browser applies the tag, and
 *   `.rotate()` is here to stop a re-encode BREAKING such a file, not to go
 *   looking for files to normalise.
 *
 * The CLI wrapper is `scripts/optimise-photos.mjs`; the tests are
 * `lib/optimise-photos.test.ts`.
 */
import { readdirSync, statSync, readFileSync, writeFileSync } from 'node:fs';
import { join, extname } from 'node:path';
import sharp from 'sharp';
import { quantTables, targetQuantTables, atOrBelowTarget } from './jpeg-quality.mjs';

export const PHOTO_DIRS = [
  'public/images/photos',
  'public/images/posters',
  'public/images/people',
  'public/images/eo',
];

export const QUALITY = 82;   // mozjpeg; measured at ~20% off these sources
export const ENCODE = { quality: QUALITY, mozjpeg: true, chromaSubsampling: '4:2:0' };
export const MIN_GAIN = 2048; // bytes — below this a rewrite is not worth the re-encode

/* Chroma resolution is part of quality, and the tables say nothing about it: a
   4:4:4 file at q82 carries chroma detail our encode would discard, so it is
   above target even though its divisors match. These are the samplings that are
   no finer than ENCODE's — 4:2:0 itself, and 4:0:0, which is greyscale and has
   no chroma to lose. The list is written for one target, so it is asserted
   against ENCODE below rather than left to drift. */
const AT_OR_BELOW_SUBSAMPLING = new Set(['4:2:0', '4:0:0']);
if (ENCODE.chromaSubsampling !== '4:2:0') {
  throw new Error(`AT_OR_BELOW_SUBSAMPLING was written for 4:2:0, not ${ENCODE.chromaSubsampling}`);
}

/** Every JPEG under `dirs`, in directory order and sorted within each. */
export function findPhotos(dirs) {
  const files = [];
  for (const dir of dirs) {
    let entries;
    try { entries = readdirSync(dir, { recursive: true }); } catch { continue; }
    for (const rel of [...entries].sort()) {
      const p = join(dir, rel);
      if (!statSync(p).isFile()) continue;
      if (!/^\.jpe?g$/i.test(extname(p))) continue;
      files.push(p);
    }
  }
  return files;
}

/**
 * @param {{dirs?: string[], check?: boolean}} options
 * @returns {Promise<{files: string[], rewritten: number, skipped: number,
 *   atQuality: number, noGain: number, before: number, after: number,
 *   failures: string[]}>} `after` is what the tree would weigh once applied,
 *   so `--check` and a real run report the same saving.
 */
export async function optimisePhotos({ dirs = PHOTO_DIRS, check = false } = {}) {
  const files = findPhotos(dirs);
  const target = await targetQuantTables(sharp, ENCODE);

  let before = 0, after = 0, rewritten = 0, atQuality = 0, noGain = 0;
  const failures = [];

  for (const p of files) {
    const original = readFileSync(p);
    before += original.length;
    const meta = await sharp(original).metadata();

    /* ── QUESTION ONE: is it already at or below q82? ──────────────────────
       Asked BEFORE the encode, so 198 of the 213 files in this repo cost a
       header parse rather than a full mozjpeg pass. */
    if (atOrBelowTarget(quantTables(original), target)
        && AT_OR_BELOW_SUBSAMPLING.has(meta.chromaSubsampling)) {
      atQuality++;
      after += original.length;
      continue;
    }

    let out;
    try {
      out = await sharp(original)
        .rotate()                                  // see the ★ above — never remove
        .jpeg(ENCODE)
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

    /* ── QUESTION TWO: above target, but is the rewrite worth it? ──────────
       Some files above target GROW when re-encoded. Declining to write them
       leaves them above target, so they are re-measured on every run and
       declined again — which costs a little CPU and writes nothing, and is why
       leaving them alone does not cost idempotence. */
    if (original.length - out.length < MIN_GAIN) {
      noGain++;
      after += original.length;
      continue;
    }
    after += out.length;
    rewritten++;
    if (!check) writeFileSync(p, out);
  }

  return { files, rewritten, skipped: atQuality + noGain, atQuality, noGain, before, after, failures };
}
