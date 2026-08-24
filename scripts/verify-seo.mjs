/* THE SHIPPED <head> IS WHAT IS CHECKED, not the register in isolation.
   The 35 pages are committed artefacts, so a register edit with no rebuild
   would otherwise pass every gate in the repo while readers got the old text.
   Each page states its own route via rel=canonical — never a second copy of
   the router (scripts/build-search-page.mjs:19-24). */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { seo, ROUTES } from './lib/seo-register.mjs';

const V3 = 'public/_pages/v3';
const walk = (d) => readdirSync(d).flatMap((f) => {
  const p = join(d, f);
  return statSync(p).isDirectory() ? walk(p) : (p.endsWith('.html') ? [p] : []);
});
const one = (html, re) => (html.match(re) || [])[1] ?? null;

/* Add a check here in the same commit as the fix that makes it pass. */
const CHECKS = [
  {
    name: 'title matches the register',
    run: ({ html, entry }) => {
      const got = one(html, /<title>([\s\S]*?)<\/title>/);
      return got === entry.title ? null : `got ${JSON.stringify(got)}, register says ${JSON.stringify(entry.title)}`;
    },
  },
  {
    name: 'description matches the register',
    run: ({ html, entry }) => {
      const got = one(html, /<meta name="description" content="([^"]*)"/);
      return got === entry.description ? null : `got ${JSON.stringify(got)}`;
    },
  },
  {
    name: 'og:title and og:description echo the register',
    run: ({ html, entry }) => {
      const t = one(html, /<meta property="og:title" content="([^"]*)"/);
      const d = one(html, /<meta property="og:description" content="([^"]*)"/);
      if (t !== entry.title) return `og:title is ${JSON.stringify(t)}`;
      if (d !== entry.description) return `og:description is ${JSON.stringify(d)}`;
      return null;
    },
  },
];

const files = walk(V3);
const seen = new Set();
let failures = 0;

for (const file of files) {
  const html = readFileSync(file, 'utf8');
  const route = one(html, /<link rel="canonical" href="([^"]+)"/);
  if (!route) {
    console.error(`! ${file}\n    no rel=canonical — this page cannot state its route`);
    failures++;
    continue;
  }
  seen.add(route);
  let entry;
  try {
    entry = seo(route);
  } catch (e) {
    console.error(`! ${file}\n    ${e.message}`);
    failures++;
    continue;
  }
  const bad = CHECKS.map((c) => {
    const detail = c.run({ route, file, html, entry });
    return detail ? `${c.name}: ${detail}` : null;
  }).filter(Boolean);
  if (bad.length) {
    failures += bad.length;
    console.error(`! ${route}  (${file})`);
    for (const b of bad) console.error(`    ${b}`);
  }
}

const orphans = ROUTES.filter((r) => !seen.has(r));
if (orphans.length) {
  failures += orphans.length;
  console.error(`! register lists ${orphans.length} route(s) no built page claims:`);
  for (const o of orphans) console.error(`    ${o}`);
}

console.log(`\nverify:seo — ${files.length} pages, ${CHECKS.length} checks each`);
if (failures) {
  console.error(`\n${failures} FAILURE(S). Fix data/seo/pages.json or rerun the generators and commit the HTML.\n`);
  process.exit(1);
}
console.log('Every built page matches the register.\n');
