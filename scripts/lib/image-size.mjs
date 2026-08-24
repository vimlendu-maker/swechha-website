/* INTRINSIC DIMENSIONS FROM THE FILE HEADER, no dependency.
   Reserving the box is what removes layout shift; a wrong number is worse than
   none, so anything this cannot parse returns null and the emitter omits the
   attributes rather than guessing.

   JPEG measurement is DELEGATED to jpeg-size.mjs, which is EXIF-orientation
   aware (read its header comment). This file used to walk JPEG SOF headers
   itself, which reports a photo's raw pixel dimensions even when EXIF
   Orientation 5-8 means a browser transposes them before painting — exactly
   the blindness jpeg-size.mjs was written to cure for seven rotated frames in
   this repo. There is exactly one answer to "how big is this JPEG" now. */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { imageSize as jpegSize } from './jpeg-size.mjs';

const ROOT = join(import.meta.dirname, '../..');

export function imageSize(publicPath) {
  const file = join(ROOT, 'public', publicPath.replace(/^\//, ''));
  if (!existsSync(file)) return null;
  const b = readFileSync(file);

  // PNG: IHDR width/height are big-endian uint32 at bytes 16 and 20.
  if (b.length > 24 && b.readUInt32BE(0) === 0x89504e47) {
    return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
  }

  // JPEG: hand off to jpeg-size.mjs for the EXIF-aware (post-orientation)
  // width/height. It throws on anything it cannot parse — this contract
  // never throws, so anything unparseable becomes null like every other
  // unrecognised file here.
  if (b.length > 4 && b[0] === 0xff && b[1] === 0xd8) {
    try {
      const { width, height } = jpegSize(file);
      return { width, height };
    } catch {
      return null;
    }
  }
  return null;
}
