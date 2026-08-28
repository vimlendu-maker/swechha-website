/* ═══ THE SHARE CARD, APPLIED TO EVERY BUILT PAGE ════════════════════════
 *
 *   node scripts/build-social-cards.mjs            # write
 *   node scripts/build-social-cards.mjs --check    # report, write nothing
 *
 * `scripts/lib/social-image.mjs` runs inside both shells, inside
 * `build-situation-air.mjs` and inside `build-hero.mjs`, so a page rebuilt by
 * its own generator gets its card without this script existing. This is the
 * sweep over the artefacts on disk, and it earns its place three ways:
 *
 *   1. IT IS THE MIGRATION. Every one of these pages was committed carrying
 *      `/images/og/og-default.png`, and a page whose generator cannot run
 *      right now — because its DATA is mid-edit, which is exactly the state
 *      `data/climate-events/active/himalaya-flood.json` was in when this
 *      landed — would otherwise keep the logo card until somebody noticed.
 *   2. IT IS THE REPAIR. A generator added later that assembles its own head
 *      without going through a shell gets swept up here rather than shipping
 *      the wrong card quietly.
 *   3. IT IS THE PROOF. `--check` prints what every page would get, which is
 *      how requirement 10 — inspect the rendered metadata, do not assume — is
 *      answered without opening thirty-nine files by hand.
 *
 * IT IS NOT A SECOND ANSWER. It calls the same `withSocialImage()` the
 * generators call, over the same finished markup, so it can only ever agree
 * with them. Run it twice and the second run reports nothing changed.
 *
 * THE LASTMOD STAMP MOVES WITH THE BYTES, for the same reason both shells
 * stamp after srcset: `data/seo/lastmod.json` is a hash of what ships, and a
 * page whose share card changed is a page that changed. Skipping the stamp
 * here would leave the sitemap asserting a date the file no longer matches.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { withSocialImage, FALLBACK } from './lib/social-image.mjs';
import { stampLastmod } from './lib/lastmod.mjs';
import { V3 } from './lib/situation-shell.mjs';

const CHECK = process.argv.includes('--check');

const walk = (d) => readdirSync(d).flatMap((f) => {
  const p = join(d, f);
  return statSync(p).isDirectory() ? walk(p) : (p.endsWith('.html') ? [p] : []);
});

/* The route comes from the page's own rel=canonical, never from a second copy
   of the router — the same rule verify-seo.mjs and build-search-page.mjs
   follow, and for the same reason: a file path is not a URL and a map between
   them is one more thing that can drift. */
const routeOf = (html) => {
  const m = /<link rel="canonical" href="([^"]+)"/.exec(html);
  if (!m) return null;
  try { return new URL(m[1], 'https://example.invalid').pathname; } catch { return null; }
};

const files = walk(V3).sort();
let changed = 0;
let fallbacks = 0;
let failures = 0;

for (const file of files) {
  const name = file.slice(V3.length + 1);
  const before = readFileSync(file, 'utf8');
  const route = routeOf(before);
  if (!route) {
    console.error(`! ${name}\n    no rel=canonical — cannot stamp a route for this page`);
    failures++;
    continue;
  }

  /* `label: ''` silences the per-page line social-image.mjs prints inside a
     generator run; this script prints its own, in a column, for 39 pages. */
  const { html: after, image, fallback } = withSocialImage(before, { label: '' });
  if (fallback) fallbacks++;

  const moved = after !== before;
  if (moved) changed++;
  if (moved && !CHECK) {
    stampLastmod(route, after);
    writeFileSync(file, after);
  }

  const mark = (moved ? (CHECK ? 'would set' : 'set') : 'in step').padEnd(9);
  const src = fallback ? `${FALLBACK.src}  (no photograph on this page)` : image.src;
  console.log(`  ${mark}  ${route.padEnd(42)} ${src}`);
}

console.log(`\n${files.length} built pages — ${files.length - fallbacks} carry their own photograph, `
  + `${fallbacks} fall back to the brand card.`);
console.log(CHECK
  ? `${changed} page(s) would change. Nothing written.`
  : `${changed} page(s) rewritten.`);

if (failures) {
  console.error(`\n${failures} page(s) could not be processed.\n`);
  process.exit(1);
}
