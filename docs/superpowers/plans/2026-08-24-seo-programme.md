# SEO Programme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give swechha.in one authoritative register for every page's `<head>`
metadata, make that metadata conformant and keyword-bearing, and add the
structured data and index hygiene the site is missing — without touching a
single word a reader sees.

**Architecture:** A JSON register at `data/seo/pages.json` becomes the single
source for every route's title, description and share metadata. The `.mjs`
generators read it instead of their own local literals. Two gates keep it
honest: a Vitest test that proves the register covers exactly the routes
`design-routes.ts` declares, and a new `scripts/verify-seo.mjs` that walks the
35 committed HTML files and proves the shipped `<head>` matches the register.
CI already regenerates every page and fails on drift, so no new automation is
needed.

**Tech Stack:** Node 22 ESM (`.mjs` generators), TypeScript + Vitest (tests),
Next.js 16 App Router (`app/sitemap.ts`, `app/robots.ts`), no new dependencies.

**Spec:** `docs/superpowers/specs/2026-08-24-seo-programme-design.md`

## Global Constraints

- **NO CREATIVE COPY IS TOUCHED.** Never edit an `<h1>`, body prose, card
  title, nav word or section heading. Never promote a `<p>` to a heading. All
  keyword work lands in `<head>` and JSON-LD only. This is a hard instruction
  from the repo owner, not a preference.
- **No new npm dependencies.** The repo solves problems with small local
  helpers (see `scripts/build-search-page.mjs`'s `ENT` map). Follow that.
- **`.mjs` cannot import `.ts`.** CI runs Node 22; `design-routes.ts` is
  TypeScript. A generator learns a page's route by reading that page's own
  `rel=canonical` — the idiom is documented at
  `scripts/build-search-page.mjs:19-24`. **Never restate the route map.**
- **The 35 pages under `public/_pages/v3/` are committed artefacts.** After any
  generator change you MUST regenerate and commit the HTML, or
  `.github/workflows/generated-current.yml` fails the PR.
- **Descriptions are 140–158 characters**, untensed, undated, no live values —
  the existing rule at `scripts/lib/situation-shell.mjs:1809-1815`. Keep it.
- **Titles are <= 60 rendered characters** (entity-decoded).
- **Vitest only collects `lib/**/*.test.ts`** (`vitest.config.mts`). Tests go
  under `lib/`, never under `scripts/`.
- **Owner rulings that must not be reversed:** no telephone and no street
  address in markup or structured data. The build gate at
  `scripts/build-hero.mjs:512` enforces the phone rule — leave it.

**Regenerate-everything command** (used in many tasks below):

```bash
npm run build:hero && for t in situations work about impact farm act stories publications search essays; do npm run "build:$t"; done
```

---

### Task 1: The register and its completeness gate

Creates the register seeded from **current shipped values**, so it can be wired
in later with a provably byte-identical diff.

**Files:**
- Create: `data/seo/pages.json`
- Create: `scripts/lib/seo-register.mjs`
- Create: `lib/seo/register.ts`
- Test: `lib/seo/register.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `scripts/lib/seo-register.mjs` — `export function seo(route)` returning
    `{ title, description, ogType }`, throwing `Error` on an unknown route;
    `export const ROUTES` (array of route strings).
  - `lib/seo/register.ts` — `export const SEO: Record<string, SeoEntry>` and
    `export type SeoEntry = { title: string; description: string; ogType: string }`.

- [ ] **Step 1: Extract the current shipped values into the register**

Run this to generate the seed from the committed HTML — do not hand-type 35
entries:

```bash
node - <<'EOF'
import { readFileSync, writeFileSync, readdirSync, mkdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
const V3 = 'public/_pages/v3';
const walk = (d) => readdirSync(d).flatMap((f) => {
  const p = join(d, f);
  return statSync(p).isDirectory() ? walk(p) : (p.endsWith('.html') ? [p] : []);
});
const one = (html, re) => (html.match(re) || [])[1];
const out = {};
for (const file of walk(V3)) {
  const html = readFileSync(file, 'utf8');
  const route = one(html, /<link rel="canonical" href="([^"]+)"/);
  if (!route) throw new Error(`no canonical in ${file}`);
  out[route] = {
    title: one(html, /<title>([\s\S]*?)<\/title>/),
    description: one(html, /<meta name="description" content="([^"]*)"/),
    ogType: one(html, /<meta property="og:type" content="([^"]*)"/) || 'website',
  };
}
const sorted = Object.fromEntries(Object.keys(out).sort().map((k) => [k, out[k]]));
mkdirSync('data/seo', { recursive: true });
writeFileSync('data/seo/pages.json', JSON.stringify(sorted, null, 2) + '\n');
console.log(`wrote ${Object.keys(sorted).length} routes`);
EOF
```

Expected: `wrote 35 routes`.

- [ ] **Step 2: Write the failing test**

Create `lib/seo/register.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { designRoutes } from '@/design-routes'
import { SEO } from '@/lib/seo/register'

const decode = (s: string) =>
  s.replace(/&mdash;/g, '—').replace(/&rsquo;/g, '’')
   .replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ')

describe('the SEO register', () => {
  const routes = designRoutes().map((r) => r.source)

  it('has exactly one entry per routed page', () => {
    expect([...Object.keys(SEO)].sort()).toEqual([...routes].sort())
  })

  it('gives every route a non-empty title and description', () => {
    for (const [route, e] of Object.entries(SEO)) {
      expect(e.title, `${route} title`).toBeTruthy()
      expect(e.description, `${route} description`).toBeTruthy()
    }
  })

  it('keeps every title at or under 60 rendered characters', () => {
    for (const [route, e] of Object.entries(SEO)) {
      expect(decode(e.title).length, `${route}: "${e.title}"`).toBeLessThanOrEqual(60)
    }
  })

  it('keeps every description between 140 and 158 characters', () => {
    for (const [route, e] of Object.entries(SEO)) {
      const n = decode(e.description).length
      expect(n, `${route} description is ${n} chars`).toBeGreaterThanOrEqual(140)
      expect(n, `${route} description is ${n} chars`).toBeLessThanOrEqual(158)
    }
  })

  it('never repeats a title or a description', () => {
    const titles = Object.values(SEO).map((e) => e.title)
    const descs = Object.values(SEO).map((e) => e.description)
    expect(new Set(titles).size).toBe(titles.length)
    expect(new Set(descs).size).toBe(descs.length)
  })
})
```

- [ ] **Step 3: Run it and watch it fail**

Run: `npm test -- lib/seo/register.test.ts`
Expected: FAIL — `Cannot find module '@/lib/seo/register'`.

- [ ] **Step 4: Write the two loaders**

Create `lib/seo/register.ts`:

```ts
/* THE ONE PLACE EVERY PAGE'S <head> TEXT IS WRITTEN.
   Titles and descriptions used to live as literals in each generator — two of
   them disagreed about /about, which is how a register earns its keep. JSON
   rather than TS because the generators are .mjs and cannot import TypeScript
   (scripts/build-search-page.mjs:19-24); this module is the typed view for the
   Next side and the tests. */
import pages from '@/data/seo/pages.json'

export type SeoEntry = { title: string; description: string; ogType: string }

export const SEO: Record<string, SeoEntry> = pages as Record<string, SeoEntry>
```

Create `scripts/lib/seo-register.mjs`:

```js
/* The generators' view of data/seo/pages.json. See lib/seo/register.ts for why
   the register is JSON. A route that is not in the register is a build failure,
   never a silent fallback: a page that cannot say what it is about should not
   be published (the same argument situation-shell.mjs:1804-1808 makes). */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const FILE = join(import.meta.dirname, '../../data/seo/pages.json');
const REGISTER = JSON.parse(readFileSync(FILE, 'utf8'));

export const ROUTES = Object.keys(REGISTER);

export function seo(route) {
  const entry = REGISTER[route];
  if (!entry) {
    throw new Error(
      `data/seo/pages.json has no entry for "${route}". Add one — title, ` +
      `description (140-158 chars) and ogType — then rerun this build.`,
    );
  }
  return entry;
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test -- lib/seo/register.test.ts`
Expected: PASS, 5 tests. If the length tests fail, the register faithfully
captured a value that already violates the rule — record which routes failed
and fix them in Task 5, not here.

- [ ] **Step 6: Check `resolveJsonModule` is on**

Run: `npx tsc --noEmit`
Expected: clean. If it errors on the JSON import, add
`"resolveJsonModule": true` to `tsconfig.json`'s `compilerOptions` and rerun.

- [ ] **Step 7: Commit**

```bash
git add data/seo/pages.json lib/seo/register.ts lib/seo/register.test.ts scripts/lib/seo-register.mjs tsconfig.json
git commit -m "feat(seo): one register for every page's head metadata"
```

---

### Task 2: The built-HTML gate

Proves the shipped HTML agrees with the register. Checks only what is already
true, so CI stays green; each later task adds its own check alongside its fix.

**Files:**
- Create: `scripts/verify-seo.mjs`
- Modify: `package.json` (scripts)
- Modify: `.github/workflows/generated-current.yml`

**Interfaces:**
- Consumes: `seo()` and `ROUTES` from `scripts/lib/seo-register.mjs` (Task 1).
- Produces: `npm run verify:seo`, exit code 1 on any failure. Later tasks add
  checks to the `CHECKS` array — each entry is
  `{ name: string, run: (ctx) => string | null }` returning an error string or
  `null` for pass, where `ctx` is `{ route, file, html, entry }`.

- [ ] **Step 1: Write the gate**

Create `scripts/verify-seo.mjs`:

```js
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
```

- [ ] **Step 2: Run it — it must pass on the untouched tree**

Run: `node scripts/verify-seo.mjs`
Expected: `35 pages, 3 checks each` then `Every built page matches the register.`
This is the proof the register was seeded correctly. If anything fails, the
seed in Task 1 Step 1 was wrong — fix the register, not the HTML.

- [ ] **Step 3: Add the npm script**

In `package.json`, beside `"verify:final"`, add:

```json
"verify:seo": "node scripts/verify-seo.mjs",
```

- [ ] **Step 4: Wire it into CI**

In `.github/workflows/generated-current.yml`, in the "Regenerate every page"
step, add a line after `npm run verify:final`:

```yaml
          npm run verify:seo
```

- [ ] **Step 5: Verify both gates still pass**

Run: `npm run verify:seo && npm test`
Expected: both pass.

- [ ] **Step 6: Commit**

```bash
git add scripts/verify-seo.mjs package.json .github/workflows/generated-current.yml
git commit -m "feat(seo): gate the shipped head against the register"
```

---

### Task 3: Rewire the generators — a byte-identical refactor

The acceptance criterion is **an empty diff on `public/_pages/v3/**`**. If a
single byte moves, the register and the generators disagree and the cause must
be found before going further.

**Files:**
- Modify: `scripts/lib/situation-shell.mjs` (the `DESCRIPTIONS` map, ~line 1817)
- Modify: `scripts/build-work-pages.mjs:1879,1956,2021,2194,2283`
- Modify: `scripts/build-about-page.mjs` (its local description override)

**Interfaces:**
- Consumes: `seo(route)` from `scripts/lib/seo-register.mjs`.
- Produces: no new exports. `DESCRIPTIONS` is deleted; callers that read it now
  call `seo(route).description`.

- [ ] **Step 1: Record the baseline**

```bash
git status --short public/_pages/v3 | wc -l   # expect 0
md5 -q public/_pages/v3/about.html            # note this value
```

- [ ] **Step 2: Replace `DESCRIPTIONS` in `scripts/lib/situation-shell.mjs`**

Delete the whole `export const DESCRIPTIONS = { … };` object (13 rows) and put
in its place:

```js
/* THE DESCRIPTIONS MOVED TO data/seo/pages.json. They were a register here and
   they are a register there — the difference is that /about's generator used to
   override this map with different words, so the site shipped two answers for
   one page. The rules that governed this object still govern the register and
   are enforced by lib/seo/register.test.ts: 140-158 characters, untensed,
   undated, describing the instrument and never the reading. */
export { seo } from './seo-register.mjs';
```

Then find every use of `DESCRIPTIONS[` in this file and in `scripts/*.mjs`:

```bash
grep -rn "DESCRIPTIONS" scripts/
```

Replace each `DESCRIPTIONS[route]` with `seo(route).description`, importing
`seo` where needed.

- [ ] **Step 3: Replace the WORK titles and descriptions**

In `scripts/build-work-pages.mjs`, add at the top with the other imports:

```js
import { seo } from './lib/seo-register.mjs';
```

Then:
- line ~1879 — `title: 'The work — Swechha',` becomes `title: seo('/work').title,`
- lines ~1956, ~2021, ~2283 — replace
  `title: TITLE[PATHS[k].url] || \`${def.name} — Swechha\`, desc: DESC[PATHS[k].url]`
  with `title: seo(PATHS[k].url).title, desc: seo(PATHS[k].url).description`
  (and the same shape for the literal `'campaigns'` / `'events'` keys).
- line ~2194 — replace `title: \`${it.name} — Swechha\`, desc: descFor(it),`
  with `title: seo(it.url).title, desc: seo(it.url).description,`.
  Confirm the detail item's route property is `it.url`; if it is named
  differently, use whatever field the existing canonical is built from at
  `scripts/build-work-pages.mjs:2340`.

Delete the now-unused `TITLE` and `DESC` maps and `descFor`, but **only if**
`grep -n "TITLE\[\|DESC\[\|descFor" scripts/build-work-pages.mjs` returns
nothing after the edits.

- [ ] **Step 4: Remove the `/about` override**

```bash
grep -n "description" scripts/build-about-page.mjs | head
```

Find the literal description string and replace it with
`seo('/about').description`, importing `seo`. This is the drift the register
exists to kill — the register currently holds the **shipped** wording ("what is
on record"), so this change is still byte-identical.

- [ ] **Step 5: Regenerate everything**

```bash
npm run build:hero && for t in situations work about impact farm act stories publications search essays; do npm run "build:$t"; done
```

- [ ] **Step 6: Prove the output did not move**

```bash
git diff --stat public/_pages/v3
```

Expected: **no output at all.** If files changed, run
`git diff public/_pages/v3 | head -40`, find which value differs, and correct
the register to match the previously shipped bytes. Do not "fix" the HTML.

- [ ] **Step 7: Run every gate**

```bash
npm run verify:seo && npm run verify:final && npm test && npm run lint
```

Expected: all pass.

- [ ] **Step 8: Commit**

```bash
git add scripts/ data/seo/pages.json
git commit -m "refactor(seo): generators read the register, output unchanged"
```

---

### Task 4: Conformant share and breadcrumb metadata

Fixes the relative `og:image`, the missing `og:url` and `twitter:image`, the
relative `BreadcrumbList.item`, and the `lang`/`og:locale` contradiction.

**Files:**
- Modify: `scripts/lib/situation-shell.mjs` (`headTags` ~1852, `CRUMBS` ~1943, `<html lang>` ~1968)
- Modify: `scripts/lib/work-shell.mjs` (`headSocial` ~2199, `breadcrumbJsonLd` ~2213, `<html lang>` ~2314)
- Modify: `scripts/build-situation-air.mjs:1913,1931,1956` (its own copies)
- Modify: `scripts/verify-seo.mjs` (add checks)

**Interfaces:**
- Consumes: `seo()` from Task 1.
- Produces: `scripts/lib/situation-shell.mjs` gains
  `export const ORIGIN` (string, no trailing slash) and
  `export const abs = (path) => string`. `headTags` gains a third parameter:
  `headTags(title, desc, canonical)`. `work-shell.mjs`'s `headSocial` gains the
  same third parameter. `breadcrumbJsonLd(crumbs)` keeps its signature — callers
  pass absolute `item` values.

- [ ] **Step 1: Add the origin helper to `scripts/lib/situation-shell.mjs`**

Place near the top of the file, with the other module constants:

```js
/* ABSOLUTE URLS, DERIVED — NEVER A LITERAL, and never relative.
   The old note here said an absolute value "advertises the preview host on
   every preview deploy". That hazard cannot occur: these 35 pages are
   COMMITTED artefacts and `npm run build` is `next build` alone, so generation
   never happens on a preview deploy — the same bytes ship everywhere. What the
   relative value did cost is conformance: the Open Graph protocol specifies a
   URL for og:image, and support for relative values differs between consumers.
   SITE_ORIGIN is honoured so a deliberate regeneration under another origin
   still describes itself correctly (lib/org.ts:48-50 does the same). */
export const ORIGIN = (process.env.SITE_ORIGIN?.trim() || 'https://swechha.in').replace(/\/+$/, '');
export const abs = (path) => {
  const p = String(path);
  /* Idempotent: a value that is already absolute is returned untouched, so a
     caller that passes one cannot produce "https://hosthttps://host/". */
  if (/^https?:\/\//.test(p)) return p;
  return `${ORIGIN}${p.startsWith('/') ? p : `/${p}`}`;
};
```

- [ ] **Step 2: Make `headTags` emit absolute, complete share metadata**

Replace the `headTags` export (`scripts/lib/situation-shell.mjs:1852-1864`):

```js
export const headTags = (title, desc, canonical) =>
  '<link rel="icon" href="/icons/icon-32.png" sizes="32x32">'
  + '<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">\n'
  + `<meta name="description" content="${attr(desc)}">\n`
  + '<meta property="og:type" content="website">'
  + '<meta property="og:site_name" content="Swechha">'
  + '<meta property="og:locale" content="en_IN">'
  + `<meta property="og:title" content="${attr(title)}">`
  + `<meta property="og:description" content="${attr(desc)}">`
  + `<meta property="og:url" content="${attr(abs(canonical))}">`
  + `<meta property="og:image" content="${attr(abs('/images/og/og-default.png'))}">`
  + '<meta name="twitter:card" content="summary_large_image">'
  + `<meta name="twitter:image" content="${attr(abs('/images/og/og-default.png'))}">`
  + '<meta name="twitter:site" content="@swechhaindia">';
```

Update its call site in `assemble` (`~line 1971`) to pass the canonical:
`${headTags(title, description, canonical)}`.

- [ ] **Step 3: Do the same in `scripts/lib/work-shell.mjs`**

Import the helper at the top: add `abs` to the existing destructure from
`situation-shell.mjs`. Replace `headSocial` (`~2199`):

```js
export const headSocial = (title, desc, canonical) =>
  `<meta property="og:type" content="website"><meta property="og:site_name" content="Swechha">`
  + `<meta property="og:locale" content="en_IN"><meta property="og:title" content="${esc(title)}">`
  + `<meta property="og:description" content="${esc(desc)}">`
  + `<meta property="og:url" content="${esc(abs(canonical))}">`
  + `<meta property="og:image" content="${esc(abs('/images/og/og-default.png'))}">`
  + `<meta name="twitter:card" content="summary_large_image">`
  + `<meta name="twitter:image" content="${esc(abs('/images/og/og-default.png'))}">`
  + `<meta name="twitter:site" content="@swechhaindia">`;
```

Update its call site (`~2321`) to `${headSocial(title, desc, url)}`.

- [ ] **Step 4: Make breadcrumb `item` values absolute**

In `scripts/lib/situation-shell.mjs`'s `CRUMBS` (`~1943`), wrap each `item`:
`item: abs('/')`, `item: abs(INDEX_PAGE.route)`, `item: abs(canonical)`.

In `scripts/lib/work-shell.mjs`'s `breadcrumbJsonLd` (`~2213`), change the map
to `item: abs(item)`. **`breadcrumbJsonLd` now owns the origin** — every caller
passes a relative path and this function makes it absolute. Task 8 depends on
that split; do not also call `abs()` at a call site.

Apply the same to `scripts/build-situation-air.mjs:1931-1932`.

Replace the stale comment above each with:

```js
/* `item` IS ABSOLUTE. Google's breadcrumb reference specifies a full URL; the
   previous note asserted Google resolves a relative item against the document,
   which this repo never verified. Derived from ORIGIN, so it is still not a
   literal. */
```

- [ ] **Step 5: Make the document language agree with `og:locale`**

Both shells emit `<html lang="en">` while every page emits
`og:locale="en_IN"`. Change both to `<html lang="en-IN">`
(`scripts/lib/situation-shell.mjs:1968`, `scripts/lib/work-shell.mjs:2314`,
and `scripts/build-situation-air.mjs` if it has its own copy). Also change
`app/layout.tsx:84` so the two halves of the site agree.

- [ ] **Step 6: Add the matching gates to `scripts/verify-seo.mjs`**

Append to the `CHECKS` array:

```js
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
```

- [ ] **Step 7: Regenerate, verify, and expect a real diff this time**

```bash
npm run build:hero && for t in situations work about impact farm act stories publications search essays; do npm run "build:$t"; done
node scripts/verify-seo.mjs
```

Expected: `35 pages, 7 checks each` and `Every built page matches the register.`

- [ ] **Step 8: Spot-check one page by eye**

```bash
grep -oE '<meta property="og:(image|url)" content="[^"]*"|<html lang="[^"]*"' public/_pages/v3/work/projects/eco-action.html
```

Expected: `<html lang="en-IN">`, `og:url` = `https://swechha.in/work/projects/eco-action`,
`og:image` = `https://swechha.in/images/og/og-default.png`.

- [ ] **Step 9: Run every gate and commit**

```bash
npm run verify:final && npm test && npm run lint
git add scripts/ app/layout.tsx public/_pages/v3
git commit -m "fix(seo): absolute share and breadcrumb URLs, lang matches locale"
```

---

### Task 5: Rewrite the twenty thin titles

`<head>` only. **Do not touch any `<h1>`.**

**Files:**
- Modify: `data/seo/pages.json`
- Modify: `lib/seo/register.test.ts` (add the thin-title rule)

**Interfaces:**
- Consumes: the register from Task 1. No code changes to generators.

- [ ] **Step 1: Add the failing thin-title rule to `lib/seo/register.test.ts`**

```ts
/* A LENGTH FLOOR ALONE IS NOT ENOUGH — "Publications — Swechha" clears any
   sane floor and still tells a searcher nothing. The rule is that the part
   before the brand suffix has to carry a term someone might actually type.
   Extend TERMS when a page legitimately needs a new one; never delete the
   check for a page. */
const TERMS = [
  'delhi', 'india', 'ngo', 'environmental', 'environment', 'school', 'student',
  'volunteer', 'river', 'yamuna', 'climate', 'air', 'forest', 'farm', 'donate',
  'report', 'camp', 'city', 'nature', 'waste', 'water', 'youth', 'community',
  'fellowship', 'workshop', 'garden', 'heat', 'rain', 'pollution', 'aravalli',
]

it('gives every title a term a searcher might type', () => {
  for (const [route, e] of Object.entries(SEO)) {
    const head = decode(e.title).replace(/\s*—\s*Swechha\s*$/, '')
    expect(head.length, `${route}: "${e.title}" is a bare label`).toBeGreaterThanOrEqual(15)
    const hit = TERMS.some((t) => head.toLowerCase().includes(t))
    expect(hit, `${route}: "${e.title}" carries no query term`).toBe(true)
  }
})
```

- [ ] **Step 2: Run it and list the failures**

Run: `npm test -- lib/seo/register.test.ts`
Expected: FAIL, naming roughly 20 routes. **Copy that list** — it is the work
list for the next step.

- [ ] **Step 3: Rewrite those titles in `data/seo/pages.json`**

Rules: <= 60 rendered characters including the ` — Swechha` suffix; describe
what the page is in words a searcher would use; add the place when the page is
about a place. Never restate the H1 and never invent a fact.

Suggested values — adjust to taste, but keep the shape:

| Route | New title |
|---|---|
| `/now` | `Environmental readings for Delhi and India — Swechha` |
| `/now/air` | `Delhi air quality, read against CPCB limits — Swechha` |
| `/now/yamuna` | `Yamuna pollution in Delhi, against CPCB class C — Swechha` |
| `/now/heat` | `India heatwave data, from IMD criteria — Swechha` |
| `/work` | `Environmental and education work in Delhi — Swechha` |
| `/work/projects` | `Environmental education projects in Delhi — Swechha` |
| `/work/campaigns` | `Environmental campaigns in Delhi NCR — Swechha` |
| `/work/events` | `Environmental events and workshops in Delhi — Swechha` |
| `/impact` | `Impact: every figure Swechha holds, by programme` |
| `/publications` | `Free environmental books and research — Swechha` |
| `/work/projects/eco-action` | `Eco Action — butterfly parks in Delhi schools — Swechha` |
| `/work/projects/me-to-we` | `ME to WE — environmental education for schools — Swechha` |
| `/work/projects/farm-school` | `Farm School — a working farm for students — Swechha` |
| `/work/projects/influence` | `Influence — a youth climate fellowship — Swechha` |
| `/work/projects/bridge-the-gap` | `Bridge the Gap — waste and community work — Swechha` |
| `/work/journeys/yamuna-yatra` | `Yamuna Yatra — a journey down the river — Swechha` |
| `/work/journeys/cityscapes` | `CityScapes — city nature walks for schools — Swechha` |
| `/work/journeys/naturescapes` | `NatureScapes — school nature camps — Swechha` |
| `/work/journeys/gram-anubhav` | `Gram Anubhav — a village immersion journey — Swechha` |
| `/search` | `Search every page on this environmental site — Swechha` |

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- lib/seo/register.test.ts`
Expected: PASS. If a title now exceeds 60 characters the length test catches it
— shorten it rather than removing the term.

- [ ] **Step 5: Regenerate and verify**

```bash
npm run build:hero && for t in situations work about impact farm act stories publications search essays; do npm run "build:$t"; done
npm run verify:seo && npm run verify:final
```

Expected: both pass. The HTML diff should touch only `<title>` and `og:title`.

- [ ] **Step 6: Prove no reader-facing text moved**

```bash
git diff public/_pages/v3 | grep -E '^[+-]' | grep -viE '<title>|og:title|^[+-]{3}' | head
```

Expected: **no output.** Any line here is a violation of the global no-copy
constraint — revert it.

- [ ] **Step 7: Commit**

```bash
git add data/seo/pages.json lib/seo/register.test.ts public/_pages/v3
git commit -m "feat(seo): titles that carry the terms people search for"
```

---

### Task 6: WebSite, SearchAction and Organization on /about

**Files:**
- Modify: `data/org-jsonld.json` (add a `website` node)
- Modify: `scripts/build-hero.mjs:503-525` (emit the second script)
- Modify: `scripts/build-about-page.mjs` (emit the NGO node)
- Modify: `scripts/verify-seo.mjs`

**Interfaces:**
- Consumes: `abs()` from `scripts/lib/situation-shell.mjs` (Task 4).
- Produces: no new exports.

- [ ] **Step 1: Emit `WebSite` + `SearchAction` on the homepage**

In `scripts/build-hero.mjs`, beside the existing NGO emitter, add a second
`<script type="application/ld+json">` block:

```js
/* THE SITELINKS SEARCHBOX. /search is a real, server-rendered index that works
   with JavaScript off, so this is a claim the site can actually honour. */
const websiteJsonLd = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Swechha',
  url: abs('/'),
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: `${abs('/search')}?q={search_term_string}` },
    'query-input': 'required name=search_term_string',
  },
});
```

Confirm `/search` reads a `q` parameter; if it does not, add that to the search
page's inline script in the same commit, or the markup claims something false.

- [ ] **Step 2: Put the Organization node on /about**

`/about` is the canonical page for organisation identity and carries only a
`Person` node today. In `scripts/build-about-page.mjs`, emit the same NGO
payload the homepage uses, read from `data/org-jsonld.json` — **not** a second
literal. Keep the existing `Person` block.

Do **not** add `telephone` or `streetAddress`: both are standing owner rulings
and `scripts/build-hero.mjs:512` fails the build if a phone reappears.

- [ ] **Step 3: Add the gate**

Append to `CHECKS` in `scripts/verify-seo.mjs`:

```js
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
```

- [ ] **Step 4: Regenerate and verify**

```bash
npm run build:hero && npm run build:about && npm run build:search
npm run verify:seo && npm run verify:final && npm test
```

- [ ] **Step 5: Validate the JSON-LD parses**

```bash
node -e "
const {readFileSync}=require('fs');
for (const f of ['public/_pages/v3/home.html','public/_pages/v3/about.html']) {
  const h=readFileSync(f,'utf8');
  for (const m of h.matchAll(/<script type=\"application\/ld\+json\">([\s\S]*?)<\/script>/g)) {
    const d=JSON.parse(m[1]); console.log(f, d['@type']);
  }
}"
```

Expected: `home.html NGO`, `home.html WebSite`, `about.html Person`, `about.html NGO`.

- [ ] **Step 6: Commit**

```bash
git add scripts/ data/org-jsonld.json public/_pages/v3
git commit -m "feat(seo): WebSite search action and an Organization node on /about"
```

---

### Task 7: Article markup on the five essays

The author, ISO date and word count already sit unused in
`content/essay/_index.json`.

**Files:**
- Modify: `scripts/build-essays.mjs`
- Modify: `data/seo/pages.json` (five `ogType` values)
- Modify: `scripts/verify-seo.mjs`

**Interfaces:**
- Consumes: `abs()` (Task 4); `seo()` (Task 1).
- Produces: no new exports.

- [ ] **Step 1: Set `ogType` to `article` for the five story routes**

In `data/seo/pages.json`, change `"ogType": "website"` to `"ogType": "article"`
for `/stories/cyclone-biparjoy`, `/stories/rise-above-the-waters`,
`/stories/young-people-accelerate-climate-action`,
`/stories/climate-crisis-uk-and-europe`,
`/stories/increasing-climate-migration-assam-floods`.

- [ ] **Step 2: Make the head emitters honour `ogType`**

`headTags` currently hardcodes `og:type` as `website`. Add a fourth parameter
`ogType = 'website'` and emit `<meta property="og:type" content="${ogType}">`.
Pass `seo(canonical).ogType` from `assemble`. Do the same in `work-shell.mjs`
for symmetry even though no WORK page is an article today.

- [ ] **Step 3: Emit the Article node and a machine-readable date**

In `scripts/build-essays.mjs`, for each essay, emit:

```js
const articleJsonLd = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: decodeEntities(entry.title),
  datePublished: entry.date,
  author: { '@type': 'Person', name: entry.byline },
  publisher: { '@type': 'NGO', name: 'Swechha', url: abs('/') },
  mainEntityOfPage: abs(route),
  wordCount: entry.words,
});
```

Also add `<meta property="article:published_time" content="${entry.date}">` to
the head, and wrap the existing rendered date in `<time datetime="…">`.

**The visible date text does not change** — only the element around it. If
wrapping it would alter a single rendered character, leave the prose alone and
ship the `article:published_time` meta only.

- [ ] **Step 4: Add the gate**

```js
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
```

- [ ] **Step 5: Regenerate and verify**

```bash
npm run build:essays && npm run verify:seo && npm run verify:final && npm test
```

- [ ] **Step 6: Prove no prose changed**

```bash
git diff public/_pages/v3/stories | grep -E '^[+-]' | grep -viE 'og:type|article:published_time|ld\+json|<time |</time>|^[+-]{3}' | head
```

Expected: no output.

- [ ] **Step 7: Commit**

```bash
git add scripts/ data/seo/pages.json public/_pages/v3
git commit -m "feat(seo): Article structured data on the five essays"
```

---

### Task 8: Breadcrumbs on the fourteen pages without them

**Files:**
- Modify: `scripts/lib/situation-shell.mjs` (the `CRUMBS` condition, ~1944)
- Modify: `scripts/verify-seo.mjs`

**Interfaces:**
- Consumes: `abs()` (Task 4).
- Produces: no new exports.

- [ ] **Step 1: Widen the breadcrumb condition**

Today `CRUMBS` only fires for `/^\/now\/[a-z-]+$/`. Replace that condition with
a derivation from the canonical's own segments, so any page nested one or more
levels deep gets a trail and top-level pages get a two-item one:

```js
/* DERIVED FROM THE CANONICAL'S OWN SEGMENTS, so a trail cannot disagree with
   the URL — the only reason to emit one. A page at the root emits nothing:
   a one-item breadcrumb states nothing a crawler does not already know. */
/* ★ THE PATHS HERE ARE RELATIVE ON PURPOSE. `breadcrumbJsonLd` applies abs()
   to every item itself (Task 4), so passing an absolute value in would produce
   "https://swechha.inhttps://swechha.in/". One layer owns the origin. */
const NAMES = { now: 'Now', work: 'Work', stories: 'Stories' };
const segs = canonical.split('/').filter(Boolean);
const CRUMBS = segs.length === 0 ? '' : '\n' + breadcrumbJsonLd([
  ['Swechha', '/'],
  ...segs.map((s, i) => [
    i === segs.length - 1 ? decodeEntities(crumbName) : (NAMES[s] ?? s.replace(/-/g, ' ')),
    '/' + segs.slice(0, i + 1).join('/'),
  ]),
]);
```

Confirm `breadcrumbJsonLd` is importable here; if it lives only in
`work-shell.mjs` and that file imports *from* this one, move the function into
`situation-shell.mjs` and re-export it from `work-shell.mjs` to avoid a cycle.

- [ ] **Step 2: Add the gate**

```js
  {
    name: 'every non-root page carries a breadcrumb trail',
    run: ({ route, html }) => {
      if (route === '/') return null;
      const has = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
        .some((m) => { try { return JSON.parse(m[1])['@type'] === 'BreadcrumbList'; } catch { return false; } });
      return has ? null : 'no BreadcrumbList';
    },
  },
```

- [ ] **Step 3: Regenerate, verify, commit**

```bash
npm run build:hero && for t in situations work about impact farm act stories publications search essays; do npm run "build:$t"; done
npm run verify:seo && npm run verify:final && npm test
git add scripts/ public/_pages/v3 && git commit -m "feat(seo): breadcrumb trails on every nested page"
```

---

### Task 9: Index hygiene — /search, /explore, and honest sitemap dates

**Files:**
- Modify: `scripts/build-search-page.mjs` (robots meta)
- Modify: `app/sitemap.ts:19-21,32-37`
- Modify: `app/explore/page.tsx`
- Create: `data/seo/lastmod.json`
- Create: `scripts/lib/lastmod.mjs`
- Test: `lib/seo/lastmod.test.ts`

**Interfaces:**
- Produces: `scripts/lib/lastmod.mjs` — `export function stampLastmod(route, html)`
  which hashes the head-and-body of `html`, compares it to
  `data/seo/lastmod.json`, and updates the stored `{ hash, date }` only when the
  hash changed. `app/sitemap.ts` reads that JSON.

- [ ] **Step 1: `noindex` the search page**

In `scripts/build-search-page.mjs`, add to the head:
`<meta name="robots" content="noindex, follow">`. A site-search UI is a
duplicate-content surface; `follow` keeps it useful as a crawl path to all 35
pages.

- [ ] **Step 2: Drop `/search` from the sitemap**

In `app/sitemap.ts`, extend the existing `/explore` exclusion to `/search`, and
replace the comment at `:19-21` (which currently argues for including it) with
the reason it now leaves: a `noindex` URL in a sitemap is a contradictory
instruction.

- [ ] **Step 3: `noindex` /explore**

In `app/explore/page.tsx`, add to its `metadata` export:

```ts
robots: { index: false, follow: true },
```

It renders an empty grid, has zero inbound internal links and self-canonicalises
— a thin page inviting indexation. This is reversible when content lands.

- [ ] **Step 4: Write the failing lastmod test**

Create `lib/seo/lastmod.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'

describe('sitemap lastmod', () => {
  it('gives every routed page a stored date', () => {
    const stored = JSON.parse(readFileSync('data/seo/lastmod.json', 'utf8'))
    const routes = Object.keys(JSON.parse(readFileSync('data/seo/pages.json', 'utf8')))
    for (const r of routes) expect(stored[r]?.date, `${r} has no stored date`).toBeTruthy()
  })

  it('does not claim every page changed at the same instant', () => {
    const stored = JSON.parse(readFileSync('data/seo/lastmod.json', 'utf8'))
    const dates = new Set(Object.values(stored).map((v: any) => v.date))
    expect(dates.size, 'all pages share one lastmod — the mtime bug is back').toBeGreaterThan(1)
  })
})
```

- [ ] **Step 5: Run it and watch it fail**

Run: `npm test -- lib/seo/lastmod.test.ts`
Expected: FAIL — `data/seo/lastmod.json` does not exist.

- [ ] **Step 6: Implement the hash register and call it from `assemble`**

```js
/* A DATE THAT MOVES ONLY WHEN THE PAGE MOVES.
   File mtime was the previous answer and it shipped every one of the 35 URLs
   claiming the same modification instant, because the generators rewrite every
   file on every run and CI checks out fresh. A content hash is the thing that
   actually changed, so the date is a fact rather than a build artefact. */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const FILE = new URL('../../data/seo/lastmod.json', import.meta.url);

export function stampLastmod(route, html, today = new Date().toISOString().slice(0, 10)) {
  const store = existsSync(FILE) ? JSON.parse(readFileSync(FILE, 'utf8')) : {};
  const hash = createHash('sha256').update(html).digest('hex').slice(0, 16);
  if (store[route]?.hash !== hash) store[route] = { hash, date: today };
  writeFileSync(FILE, JSON.stringify(Object.fromEntries(Object.keys(store).sort().map((k) => [k, store[k]])), null, 2) + '\n');
  return store[route].date;
}
```

Call it from both shells right after `OUT` is assembled, before writing.

**Watch out:** the hash must be taken over the page *minus* any live reading
that the daily data-refresh rewrites, or every situation page will re-date
daily — which is honest, since those pages genuinely do change daily. Leave
them hashing the whole document; only exclude something if the date starts
moving on a page whose content did not.

- [ ] **Step 7: Read the register in `app/sitemap.ts`**

Replace the `statSync(...).mtime` block with a read of `data/seo/lastmod.json`,
keyed by `source`. Keep the existing behaviour of emitting **no** date rather
than a wrong one when a route is absent.

- [ ] **Step 8: Regenerate, verify, commit**

```bash
npm run build:hero && for t in situations work about impact farm act stories publications search essays; do npm run "build:$t"; done
npm test && npm run verify:seo && npm run verify:final && npm run build
git add scripts/ app/ data/seo/ public/_pages/v3
git commit -m "feat(seo): noindex the thin routes, and sitemap dates that mean something"
```

---

### Task 10: Kill layout shift — image dimensions and LCP priority

281 of 292 images carry no `width`/`height`. This is the one Core Web Vitals
item cheap enough to belong in a metadata pass.

**Files:**
- Create: `scripts/lib/image-size.mjs`
- Modify: `scripts/lib/situation-shell.mjs`, `scripts/lib/work-shell.mjs` (image emitters)
- Test: `lib/seo/image-size.test.ts`

**Interfaces:**
- Produces: `scripts/lib/image-size.mjs` — `export function imageSize(publicPath)`
  returning `{ width, height }` or `null`, reading JPEG/PNG headers directly. No
  dependency: the repo has no image library and adding one is out of scope.

- [ ] **Step 1: Write the failing test**

Create `lib/seo/image-size.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { imageSize } from '@/scripts/lib/image-size.mjs'

describe('imageSize', () => {
  it('reads a JPEG width and height', () => {
    const s = imageSize('/images/photos/india-gate-hero.jpg')
    expect(s).not.toBeNull()
    expect(s!.width).toBeGreaterThan(0)
    expect(s!.height).toBeGreaterThan(0)
  })

  it('returns null for a path that does not exist', () => {
    expect(imageSize('/images/photos/not-a-real-file.jpg')).toBeNull()
  })
})
```

If `vitest.config.mts`'s `include` blocks importing from `scripts/`, no change
is needed — the alias `@` already maps to the repo root, so the import resolves.

- [ ] **Step 2: Run it and watch it fail**

Run: `npm test -- lib/seo/image-size.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the header reader**

```js
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
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- lib/seo/image-size.test.ts`
Expected: PASS. Cross-check one value: `sips -g pixelWidth -g pixelHeight public/images/photos/india-gate-hero.jpg`.

- [ ] **Step 5: Emit the attributes**

Find the shared `<img …>` emitters in both shells
(`grep -n '<img' scripts/lib/*.mjs`) and add `width`/`height` from
`imageSize(src)` when it returns a value. Follow the pattern already working in
`scripts/build-stories-page.mjs`, whose output is the one correctly-sized page.

**Do not add or change any `alt` text** — coverage is already 100% and the alt
strings are reader-facing copy.

- [ ] **Step 6: Give each page's LCP image priority**

For the single hero image on each page — the first `<img>` inside the hero band
— emit `fetchpriority="high"` and remove `loading="lazy"` if present. Every
other image keeps `loading="lazy"`. A lazy LCP image is the worst of both.

- [ ] **Step 7: Regenerate and verify the counts moved**

```bash
npm run build:hero && for t in situations work about impact farm act stories publications search essays; do npm run "build:$t"; done
node -e "
const {readFileSync,readdirSync,statSync}=require('fs');const {join}=require('path');
const walk=(d)=>readdirSync(d).flatMap(f=>{const p=join(d,f);return statSync(p).isDirectory()?walk(p):(p.endsWith('.html')?[p]:[])});
let imgs=0,sized=0;
for(const f of walk('public/_pages/v3')){const h=readFileSync(f,'utf8');
for(const m of h.matchAll(/<img[^>]*>/g)){imgs++;if(/width=\"\d+\"/.test(m[0])&&/height=\"\d+\"/.test(m[0]))sized++;}}
console.log(sized+' of '+imgs+' images sized');"
```

Expected: close to `292 of 292`. Any shortfall is images `imageSize` could not
parse — list them and decide, do not guess dimensions.

- [ ] **Step 8: Confirm no copy moved, then commit**

```bash
git diff public/_pages/v3 | grep -E '^[+-]' | grep -viE '<img |^[+-]{3}' | head
```

Expected: no output.

```bash
npm run verify:seo && npm run verify:final && npm test && npm run lint
git add scripts/ lib/seo/ public/_pages/v3
git commit -m "perf(seo): reserve every image box and prioritise the LCP image"
```

---

## Final verification

- [ ] `npm test` — all suites pass
- [ ] `npm run lint` — clean
- [ ] `npm run build` — clean, every route still prerendered (`○`/`●`, never `ƒ`)
- [ ] `npm run verify:final` — passes
- [ ] `npm run verify:seo` — 35 pages, all checks
- [ ] Regenerate everything, then `git diff --stat public/_pages/v3` is empty —
      proves the committed HTML is in step, which is what
      `generated-current.yml` will assert on the PR
- [ ] `git diff main...HEAD -- public/_pages/v3 | grep -E '^[+-]' | grep -viE '<title>|og:|twitter:|ld\+json|<img |article:|<time |robots|lang=|^[+-]{3}'`
      returns **nothing** — the global no-creative-copy constraint held across
      the whole branch

## Handed back to the owner

These are outside the plan and need the repo owner:

- Verify Google Search Console for `swechha.in` (DNS TXT), submit the sitemap,
  export the Pages report. Unblocks W5 (migration recovery), which is the
  highest-impact remaining work.
- Run the Facebook Sharing Debugger and LinkedIn Post Inspector on one page
  before and after Task 4, to settle whether the relative `og:image` was in fact
  costing share cards — the spec deliberately does not assert that it was.
- Rule on `/contact-us/` → `/act` (spec §5), which overrides a recorded decision.
