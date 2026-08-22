/**
 * EXIF-APPLIED IMAGE DIMENSIONS, with no dependency.
 *
 * ★ WHY THIS FILE EXISTS. `content/photo-library.json` recorded SEVEN frames
 * as 2000x1500 landscape which every browser renders as 1500x2000 PORTRAIT,
 * because they carry EXIF Orientation 6 (rotate 90° CW) and the recorded
 * numbers are the raw pixel dimensions. Nothing checked, so nothing caught it
 * — and the first build of the Impact page put two of them into wide
 * letterbox cells, where a portrait photograph renders as an unreadable
 * horizontal sliver of a tall image. That is what "the image is not visible"
 * turned out to be: not tonality, not the halftone, geometry.
 *
 * So the size a layout needs is the size AFTER orientation, and it has to come
 * from the file rather than from a number somebody typed beside it.
 *
 * Orientations 5-8 are the four that transpose the axes.
 */
import { readFileSync } from 'node:fs';

const TRANSPOSED = new Set([5, 6, 7, 8]);

/**
 * Read the EXIF Orientation tag (0x0112) out of an APP1/Exif segment.
 * Returns null when this APP1 is not an Exif segment — NOT 1.
 *
 * That distinction is the whole bug this function shipped with. A JPEG may
 * carry SEVERAL APP1 segments: these files have Exif followed by XMP
 * ("http://ns.adobe.com/..."). Returning a default of 1 for the XMP segment
 * OVERWROTE the 6 already read from the Exif one, so every rotated frame
 * reported upright and the sizer silently agreed with the wrong numbers in
 * the library it was written to check.
 */
function orientationFrom(buf, start, len) {
  if (buf.toString('ascii', start, start + 4) !== 'Exif') return null;
  const tiff = start + 6;
  const le = buf.toString('ascii', tiff, tiff + 2) === 'II';
  const u16 = (o) => le ? buf.readUInt16LE(o) : buf.readUInt16BE(o);
  const u32 = (o) => le ? buf.readUInt32LE(o) : buf.readUInt32BE(o);
  const ifd0 = tiff + u32(tiff + 4);
  if (ifd0 + 2 > start + len) return null;
  const n = u16(ifd0);
  for (let i = 0; i < n; i++) {
    const e = ifd0 + 2 + i * 12;
    if (e + 12 > start + len) break;
    if (u16(e) === 0x0112) return u16(e + 8) || 1;
  }
  return null;
}

/**
 * @returns {{width:number,height:number,raw:[number,number],orientation:number}}
 *          `width`/`height` are as a browser lays the image out.
 */
export function imageSize(path) {
  const buf = readFileSync(path);
  if (buf[0] !== 0xFF || buf[1] !== 0xD8) throw new Error(`${path}: not a JPEG`);
  let o = 2, orientation = 1, raw = null;
  while (o < buf.length - 1) {
    if (buf[o] !== 0xFF) { o++; continue; }
    const marker = buf[o + 1];
    if (marker === 0xD8 || marker === 0x01 || (marker >= 0xD0 && marker <= 0xD7)) { o += 2; continue; }
    if (marker === 0xD9) break;
    const len = buf.readUInt16BE(o + 2);
    /* Take the FIRST answer and never let a later APP1 overwrite it. */
    if (marker === 0xE1 && orientation === 1) {
      orientation = orientationFrom(buf, o + 4, len) ?? 1;
    }
    /* SOFn carries the frame size. C4/C8/CC are DHT/JPG/DAC, not frames. */
    if (marker >= 0xC0 && marker <= 0xCF && ![0xC4, 0xC8, 0xCC].includes(marker)) {
      raw = [buf.readUInt16BE(o + 7), buf.readUInt16BE(o + 5)]; // width, height
      if (orientation !== 1) { /* keep scanning only if EXIF not yet seen */ }
      break;
    }
    o += 2 + len;
  }
  if (!raw) throw new Error(`${path}: no SOF marker`);
  const [w, h] = raw;
  return TRANSPOSED.has(orientation)
    ? { width: h, height: w, raw, orientation }
    : { width: w, height: h, raw, orientation };
}
