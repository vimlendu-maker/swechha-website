/* INTRINSIC DIMENSIONS FROM THE FILE HEADER, no dependency.
   Reserving the box is what removes layout shift; a wrong number is worse than
   none, so anything this cannot parse returns null and the emitter omits the
   attributes rather than guessing. */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '../..');

export function imageSize(publicPath) {
  const file = join(ROOT, 'public', publicPath.replace(/^\//, ''));
  if (!existsSync(file)) return null;
  const b = readFileSync(file);

  // PNG: IHDR width/height are big-endian uint32 at bytes 16 and 20.
  if (b.length > 24 && b.readUInt32BE(0) === 0x89504e47) {
    return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
  }

  // JPEG: walk the segments to the first SOF marker.
  if (b.length > 4 && b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i < b.length - 9) {
      if (b[i] !== 0xff) { i++; continue; }
      const marker = b[i + 1];
      const len = b.readUInt16BE(i + 2);
      // SOF0-SOF15, excluding the non-frame markers DHT(c4), JPG(c8), DAC(cc).
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
        return { height: b.readUInt16BE(i + 5), width: b.readUInt16BE(i + 7) };
      }
      i += 2 + len;
    }
  }
  return null;
}
