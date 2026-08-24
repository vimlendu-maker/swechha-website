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
  {
    name: 'og:image, twitter:image and og:url are absolute',
    run: ({ html }) => {
      for (const prop of ['og:image', 'og:url']) {
        const v = one(html, new RegExp(`<meta property="${prop}" content="([^"]*)"`));
        if (!v) return `${prop} is missing`;
        if (!/^https?:\/\//.test(v)) return `${prop} is relative: ${v}`;
      }
      const tw = one(html, /<meta name="twitter:image" content="([^"]*)"/);
      if (!tw) return 'twitter:image is missing';
      if (!/^https?:\/\//.test(tw)) return `twitter:image is relative: ${tw}`;
      return null;
    },
  },
  {
    name: 'og:url agrees with the canonical',
    run: ({ html, route }) => {
      const v = one(html, /<meta property="og:url" content="([^"]*)"/);
      return v && v.endsWith(route === '/' ? '/' : route) ? null : `og:url ${v} vs canonical ${route}`;
    },
  },
  {
    name: 'every BreadcrumbList item is absolute',
    run: ({ html }) => {
      for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
        let data;
        try { data = JSON.parse(m[1]); } catch { return 'unparseable JSON-LD'; }
        if (data['@type'] !== 'BreadcrumbList') continue;
        for (const li of data.itemListElement ?? []) {
          if (!/^https?:\/\//.test(String(li.item))) return `relative item: ${li.item}`;
        }
      }
      return null;
    },
  },
  {
    name: 'html lang agrees with og:locale',
    run: ({ html }) => {
      const lang = one(html, /<html lang="([^"]+)"/);
      const loc = one(html, /<meta property="og:locale" content="([^"]*)"/);
      if (lang !== 'en-IN') return `lang is ${lang}`;
      if (loc !== 'en_IN') return `og:locale is ${loc}`;
      return null;
    },
  },
  /* TASK 6. The homepage sitelinks searchbox (WebSite + SearchAction) and the
     Organization identity node (NGO) both live in home.html's structured
     data; this is the register-level gate that a future edit cannot drop
     either without failing the build, same as every other check in this
     file. */
  {
    name: 'the homepage carries WebSite and NGO structured data',
    run: ({ route, html }) => {
      if (route !== '/') return null;
      const types = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
        .map((m) => { try { return JSON.parse(m[1])['@type']; } catch { return null; } });
      for (const want of ['NGO', 'WebSite']) {
        if (!types.includes(want)) return `no ${want} node (found: ${types.join(', ') || 'none'})`;
      }
      return null;
    },
  },
  /* TASK 7. The five essays are the only pages on this site that are
     articles rather than reference pages, so this check is scoped to
     `/stories/*` rather than every route — a situation page or a WORK page
     asserting Article data would be the wrong claim, not a missing one. */
  {
    name: 'essays carry Article data and an article og:type',
    run: ({ route, html, entry }) => {
      if (!/^\/stories\/.+/.test(route)) return null;
      if (entry.ogType !== 'article') return 'register ogType is not "article"';
      const t = one(html, /<meta property="og:type" content="([^"]*)"/);
      if (t !== 'article') return `og:type is ${t}`;
      const types = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
        .map((m) => { try { return JSON.parse(m[1])['@type']; } catch { return null; } });
      return types.includes('Article') ? null : 'no Article node';
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
