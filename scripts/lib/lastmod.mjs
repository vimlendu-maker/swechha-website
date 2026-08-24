/* A DATE THAT MOVES ONLY WHEN THE PAGE MOVES.
   File mtime was the previous answer and it shipped every one of the 35 URLs
   claiming the same modification instant, because the generators rewrite every
   file on every run and CI checks out fresh. A content hash is the thing that
   actually changed, so the date is a fact rather than a build artefact.

   IDEMPOTENT ON PURPOSE. `.github/workflows/generated-current.yml` rebuilds
   every page and fails if the working tree moves, so regenerating a page
   whose content is unchanged must not rewrite this file in any way — not the
   stored date, not key order, not whitespace. The store is re-sorted by key
   and re-serialised with a trailing newline on every call, whether or not a
   hash changed, so two runs over the same content produce byte-identical
   output rather than merely "no date changed".

   `file` IS AN OPTIONAL SEAM FOR TESTS, defaulting to the real register.
   `lib/seo/lastmod.test.ts` points it at a temp-dir copy so the behavioural
   tests (idempotence, a changed hash moving the date, byte-stable rewrites)
   never touch the tracked `data/seo/lastmod.json` — a function that can only
   be tested by mutating the repo's real data file is worth this small seam
   for. Every real caller in this repo (both shells, build-hero.mjs,
   build-situation-air.mjs) calls with two arguments and gets the default. */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const FILE = new URL('../../data/seo/lastmod.json', import.meta.url);

/** @param {string | URL} [file] */
export function stampLastmod(route, html, today = new Date().toISOString().slice(0, 10), file = FILE) {
  const store = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {};
  const hash = createHash('sha256').update(html).digest('hex').slice(0, 16);
  if (store[route]?.hash !== hash) store[route] = { hash, date: today };
  writeFileSync(file, JSON.stringify(Object.fromEntries(Object.keys(store).sort().map((k) => [k, store[k]])), null, 2) + '\n');
  return store[route].date;
}
