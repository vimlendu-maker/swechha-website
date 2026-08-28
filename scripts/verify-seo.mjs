/* THE SHIPPED <head> IS WHAT IS CHECKED, not the register in isolation.
   The 35 pages are committed artefacts, so a register edit with no rebuild
   would otherwise pass every gate in the repo while readers got the old text.
   Each page states its own route via rel=canonical — never a second copy of
   the router (scripts/build-search-page.mjs:19-24). */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { seo, ROUTES } from './lib/seo-register.mjs';
import { primaryImage, FALLBACK } from './lib/social-image.mjs';

const V3 = 'public/_pages/v3';
/* Same file the generators read (situation-shell.mjs's TRACKER) and the same
   one lib/analytics.ts reads, so the id cannot drift between what is emitted
   and what is checked. */
const A = JSON.parse(readFileSync('data/analytics.json', 'utf8'));
const walk = (d) => readdirSync(d).flatMap((f) => {
  const p = join(d, f);
  return statSync(p).isDirectory() ? walk(p) : (p.endsWith('.html') ? [p] : []);
});
const one = (html, re) => (html.match(re) || [])[1] ?? null;

/* THE CANONICAL IS ABSOLUTE ON EVERY PAGE (situation-shell.mjs:1931-1953), so
   the route this file keys everything on — the register lookup, the orphan
   sweep — is its PATH. Parsed with `new URL`, not a prefix strip, so a canonical
   built against a different SITE_ORIGIN still yields the right route instead of
   silently failing the register lookup for a reason that reads like a missing
   page. A still-relative canonical (the hand-maintained home.html is the one
   file a generator does not write) resolves against a dummy base and keeps its
   path, so it reaches the absolute check below rather than crashing here. */
const routeOf = (canonical) => {
  try { return new URL(canonical, 'https://example.invalid').pathname; }
  catch { return null; }
};

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
    /* THE SHARE CARD IS THE PAGE'S OWN PHOTOGRAPH, RE-DERIVED HERE.
       Before this, all 39 built pages shipped the same `og:image` — the black
       wordmark card — so every link to this site previewed identically in
       WhatsApp, on X and on LinkedIn: the publisher, never the story.
       `scripts/lib/social-image.mjs` fixed that inside the generators, and this
       check is what stops it coming back. It does NOT merely assert that
       og:image is "not the default": it RE-RUNS the derivation over the
       committed page and demands the head agree, so a page whose hero
       photograph was swapped and whose head was not rebuilt fails here rather
       than shipping yesterday's card. The ten pages that genuinely carry no
       photograph derive null and are held to the fallback — the same rule, not
       an exemption. `npm run build:social-cards` is the fix when this fails. */
    name: "og:image is the page's own primary image",
    run: ({ html }) => {
      const want = primaryImage(html) ?? FALLBACK;
      const got = one(html, /<meta property="og:image" content="([^"]*)"/);
      const tw = one(html, /<meta name="twitter:image" content="([^"]*)"/);
      if (!got?.endsWith(want.src)) {
        return `og:image is ${got} — the page's primary image is ${want.src}. `
          + 'Run `npm run build:social-cards`, or rebuild this page.';
      }
      if (got !== tw) return `twitter:image (${tw}) differs from og:image (${got})`;
      const w = one(html, /<meta property="og:image:width" content="([^"]*)"/);
      const h = one(html, /<meta property="og:image:height" content="([^"]*)"/);
      if (Number(w) !== want.width || Number(h) !== want.height) {
        return `og:image:width/height say ${w}x${h}, the image is ${want.width}x${want.height}`;
      }
      /* A card whose image 404s previews as no card at all, and that failure is
         invisible until somebody shares the link — so the path is checked
         against the shipped file, not merely against the markup. */
      if (!existsSync(join('public', want.src.replace(/^\//, '')))) {
        return `og:image points at ${want.src}, which is not in public/`;
      }
      return null;
    },
  },
  {
    /* Without `summary_large_image` X renders the small square card, which
       crops a landscape hero to a thumbnail beside the text — the photograph
       reduced to the size the logo used to occupy. */
    name: 'twitter:card is summary_large_image',
    run: ({ html }) => {
      const v = one(html, /<meta name="twitter:card" content="([^"]*)"/);
      return v === 'summary_large_image' ? null : `twitter:card is ${JSON.stringify(v)}`;
    },
  },
  {
    /* Lighthouse's `canonical` audit fails a relative href outright — "Is not
       an absolute URL (/)" — and it was the ONLY failing SEO audit on the live
       site on 24 August 2026, on all 35 pages, holding every one of them at
       SEO 92. It sits beside the og:url check on purpose: those two tags carry
       the same URL and there is no reading under which one should be absolute
       and the other not. */
    name: 'the canonical is absolute',
    run: ({ canonical }) => (/^https?:\/\//.test(canonical)
      ? null
      : `rel=canonical is relative: ${canonical} — Lighthouse fails this audit`),
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
  /* TASK 8. Every page one or more levels below the root now carries a
     BreadcrumbList (situation-shell.mjs's widened CRUMBS). The root itself is
     exempt: a one-item breadcrumb states nothing a crawler does not already
     know, so `/` must NOT be required to carry one. */
  {
    name: 'every non-root page carries a breadcrumb trail',
    run: ({ route, html }) => {
      if (route === '/') return null;
      const has = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
        .some((m) => { try { return JSON.parse(m[1])['@type'] === 'BreadcrumbList'; } catch { return false; } });
      return has ? null : 'no BreadcrumbList';
    },
  },
  {
    /* PHASE 1 ANALYTICS. The tag is the only thing that makes a page
       countable, and a page that loses it is INVISIBLE rather than broken —
       the dashboard just shows a number that is quietly too low, with nothing
       anywhere saying why. That is why this is a build failure and not a
       warning, and why it asserts the exact string rather than merely the
       presence of a script: a stale website id would sail through a looser
       check and send every pageview into a website record that does not
       exist. */
    name: 'carries the analytics tracker',
    run: ({ html }) => {
      const want = `<script defer src="${A.scriptPath}" data-website-id="${A.websiteId}"></script>`;
      if (html.includes(want)) return null;
      return html.includes(A.scriptPath)
        ? 'tracker present but does not match data/analytics.json exactly (stale website id?)'
        : 'no tracker tag — this page would be uncounted';
    },
  },
];

const files = walk(V3);
const seen = new Set();
let failures = 0;

for (const file of files) {
  const html = readFileSync(file, 'utf8');
  const canonical = one(html, /<link rel="canonical" href="([^"]+)"/);
  if (!canonical) {
    console.error(`! ${file}\n    no rel=canonical — this page cannot state its route`);
    failures++;
    continue;
  }
  const route = routeOf(canonical);
  if (!route) {
    console.error(`! ${file}\n    rel=canonical is not a parseable URL: ${canonical}`);
    failures++;
    continue;
  }
  seen.add(route);
  let entry;
  /* ── DERIVED EVENT PAGES ARE NOT IN THE REGISTER, BY DESIGN ────────────
     `/now/climate-event/<slug>` is emitted per PUBLISHED climate event and
     expires with it, so data/seo/pages.json cannot hold an entry per page
     without either predicting disasters or keeping stale ones. Those pages
     pass `title` and `desc` straight to assemble(), which enforces the same
     140-158 character description rule this verifier does.

     They are still CHECKED — the entry is reconstructed from the page's own
     markup, so every rule below still runs against it. What is skipped is
     the register lookup, not the checks. */
  const isDerivedEvent = /^\/now\/climate-event\/.+/.test(route);
  if (isDerivedEvent) {
    const t = /<title[^>]*>([\s\S]*?)<\/title>/.exec(html);
    const d = /<meta name="description" content="([^"]*)"/.exec(html);
    entry = {
      title: t ? t[1].trim() : '',
      description: d ? d[1].trim() : '',
      ogType: 'article',
      indexName: t ? t[1].replace(/\s*—\s*Swechha\s*$/, '').trim() : '',
    };
  } else {
    try {
      entry = seo(route);
    } catch (e) {
      console.error(`! ${file}\n    ${e.message}`);
      failures++;
      continue;
    }
  }
  const bad = CHECKS.map((c) => {
    const detail = c.run({ route, canonical, file, html, entry });
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
