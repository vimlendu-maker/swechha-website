/**
 * HOW COARSELY IS THIS JPEG ALREADY QUANTISED?
 *
 * ★ WHY THIS FILE EXISTS. `optimise-photos.mjs` re-encodes in place, and its
 * only guard against a pointless rewrite used to be "did the output come out
 * at least 2KB smaller". That is the wrong question. A second mozjpeg q82 pass
 * over a large photograph reliably shaves several KB — it is shedding detail,
 * not fat — so the threshold never fired. On 13 September 2026 a single run
 * re-encoded 35 files that were already at q82, reported "rewritten 35" as
 * though that were work, and banked 0.2MB in exchange for a second generation
 * of loss on every one of them.
 *
 * The right question is about QUALITY, and a JPEG answers it itself. Every
 * JPEG carries, in its DQT segments, the quantisation tables it was written
 * with: 64 divisors per table, in zig-zag order, larger meaning coarser. A
 * file whose divisors are all at least as large as the ones our encoder would
 * use is already at or below our target, and re-encoding it can only cost.
 *
 * ★ THE TARGET IS MEASURED, NOT TABULATED. The obvious implementation is to
 * hard-code libjpeg's Annex K table and scale it by quality. Do not: mozjpeg
 * ships its own tuned tables, sharp picks one, and the numbers would be a
 * guess about somebody else's build. Instead `targetQuantTables()` encodes a
 * throwaway 64x64 swatch through the SAME sharp options the script is about to
 * use and reads the tables back out. The reference is then whatever this
 * machine's encoder actually does, and it stays correct across a sharp,
 * libvips or mozjpeg upgrade — an upgrade that changes the tables simply makes
 * the existing files "above target" once, which is the honest answer.
 */

/**
 * Read the quantisation tables out of a JPEG.
 *
 * @param {Buffer} buf
 * @returns {Record<number, number[]>|null} destination id -> 64 divisors in
 *          zig-zag order, or null if this is not a JPEG we can read. Null means
 *          "unknown", and callers must treat unknown as "not proven to be at or
 *          below target" rather than assuming either answer.
 */
export function quantTables(buf) {
  if (!buf || buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  const tables = {};
  let o = 2;
  while (o < buf.length - 1) {
    if (buf[o] !== 0xff) { o++; continue; }
    const marker = buf[o + 1];
    /* Standalone markers carry no length word: padding fill bytes, TEM, and
       the eight RSTn. SOI cannot appear here but costs nothing to tolerate. */
    if (marker === 0xff || marker === 0x01 || marker === 0xd8 || (marker >= 0xd0 && marker <= 0xd7)) { o += 2; continue; }
    /* SOS begins entropy-coded data, which is not marker-structured and must
       not be walked. Every DQT in a baseline or progressive JPEG is written
       before the first scan, so stopping here loses nothing. */
    if (marker === 0xda || marker === 0xd9) break;
    if (o + 4 > buf.length) return null;
    const len = buf.readUInt16BE(o + 2);
    if (len < 2 || o + 2 + len > buf.length) return null;
    if (marker === 0xdb) {
      let p = o + 4;
      const end = o + 2 + len;
      /* One DQT segment may define SEVERAL tables back to back. */
      while (p < end) {
        const precision = buf[p] >> 4;   // 0 = 8-bit divisors, 1 = 16-bit
        const id = buf[p] & 0x0f;
        p++;
        const width = precision ? 2 : 1;
        if (p + 64 * width > end) return null;
        const t = new Array(64);
        for (let k = 0; k < 64; k++) t[k] = precision ? buf.readUInt16BE(p + k * 2) : buf[p + k];
        p += 64 * width;
        tables[id] = t;
      }
    }
    o += 2 + len;
  }
  return Object.keys(tables).length ? tables : null;
}

/* One swatch encode per distinct set of options, not one per photograph. */
const targetCache = new Map();

/**
 * The tables OUR encoder produces, read back from a throwaway swatch.
 *
 * @param {import('sharp')} sharp the module itself, passed in rather than
 *        imported so that the PARSER above stays dependency-free — the same
 *        rule `jpeg-size.mjs` and `image-size.mjs` keep, and what lets the
 *        reading half of this file be exercised on a byte buffer alone.
 * @param {object} encode the exact `.jpeg()` options the caller will use.
 * @returns {Promise<Record<number, number[]>>}
 */
export async function targetQuantTables(sharp, encode) {
  const key = JSON.stringify(encode);
  if (!targetCache.has(key)) {
    const swatch = await sharp({
      create: { width: 64, height: 64, channels: 3, background: { r: 120, g: 90, b: 60 } },
    }).jpeg(encode).toBuffer();
    const tables = quantTables(swatch);
    if (!tables) throw new Error('could not read quantisation tables back from our own encoder');
    targetCache.set(key, tables);
  }
  return targetCache.get(key);
}

/**
 * Is this file already quantised at least as coarsely as our target everywhere?
 *
 * Every divisor must be >= the target's. A file that is coarser in some bands
 * and finer in others is NOT at or below target — it holds detail our encode
 * would throw away — so it is reported above and left for the byte check to
 * rule on. Whatever the verdict, a file we do rewrite comes back carrying our
 * exact tables, so the next run recognises it and the script settles.
 *
 * Tables are matched by destination id, which is how a decoder pairs them with
 * the components in the frame header. A file that assigned luma to id 1 would
 * be compared against the wrong reference; the cost of that is one needless
 * re-encode of a file no encoder in the wild writes, so the frame header is
 * deliberately not parsed.
 *
 * @param {Record<number, number[]>|null} tables from `quantTables`
 * @param {Record<number, number[]>} target from `targetQuantTables`
 */
export function atOrBelowTarget(tables, target) {
  if (!tables) return false;                       // unknown is not proof
  for (const [id, table] of Object.entries(tables)) {
    const reference = target[id];
    if (!reference) return false;                  // a table we cannot compare
    for (let k = 0; k < 64; k++) if (table[k] < reference[k]) return false;
  }
  return true;
}
