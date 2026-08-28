/* ═══════════════════════════════════════════════════════════════════════════
   SEARCH  →  public/_pages/v3/search.html, routed at /search
   ───────────────────────────────────────────────────────────────────────────
   WHAT IT INDEXES, AND WHY NOT THE OTHER THING.
   `lib/search.ts` builds an index from `content/` — three stories and one
   campaign, four entries, because five of the six content directories are
   empty `.gitkeep`s. A search over four things is not a search. What a reader
   is actually looking for is one of the 29 BUILT PAGES: the six situations,
   the fifteen WORK pages, /farm, /impact, /about, /act, /stories,
   /publications. So the index is built from those, out of the pages
   themselves.

   That leaves `lib/search.ts` and `app/search/page.tsx` serving nothing once
   this route is mapped, since a `beforeFiles` rewrite shadows the app route.
   They are NOT deleted here — `lib/search.test.ts` covers that function and
   removing tested code is its own decision — but they are superseded, and this
   is the note that says so.

   ★ EACH PAGE STATES ITS OWN ROUTE.
   The route for each file comes from that file's own `rel=canonical`, not from
   a second copy of the router. `design-routes.ts` is TypeScript and CI runs
   Node 22, where a .mjs cannot import it, so the alternative was restating the
   map — and a route map that disagrees with the router is worse than no
   search. A page with no canonical fails this build.

   ★ IT WORKS WITHOUT JAVASCRIPT, AND THAT IS THE POINT.
   The list of every page renders server-side, grouped, as an ordinary index.
   Typing filters it. So a reader with no JS gets a complete site index rather
   than a search box that does nothing, which is what an empty input over a
   client-side index degrades to everywhere else.

   ★ NO NETWORK, NO ENDPOINT, NO DEPENDENCY. The index is inlined. At this
   size that is smaller than the request that would fetch it, and it cannot
   fail at request time. Revisit if the page count grows an order of magnitude.
   ═══════════════════════════════════════════════════════════════════════════ */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import * as S from './lib/situation-shell.mjs';
import { seo } from './lib/seo-register.mjs';
const { esc, opener } = S;

const sh = S.shell();

const OUT_FILE = 'search.html';

let bad = 0;
const dataFail = (m) => { console.error(`DATA IS WRONG: ${m}`); bad++; };

/* ═══ THE INDEX, READ OUT OF THE BUILT PAGES ═════════════════════════════ */

/* Only the entities these pages actually use. A general HTML decoder is a
   dependency and a liability; this list is checked by gate 6, which fails if a
   raw entity survives into the index. */
const ENT = {
  '&mdash;': '—', '&ndash;': '–', '&nbsp;': ' ', '&amp;': '&',
  '&lt;': '<', '&gt;': '>', '&quot;': '"', '&rsquo;': '’', '&lsquo;': '‘',
  '&ldquo;': '“', '&rdquo;': '”', '&middot;': '·', '&hellip;': '…',
  '&thinsp;': ' ', '&deg;': '°', '&sup2;': '²', '&times;': '×', '&#215;': '×',
};
const text = (html) => String(html ?? '')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&[a-z]+;|&#\d+;/gi, (m) => ENT[m] ?? m)
  .replace(/\s+/g, ' ')
  .trim();

const one = (src, re) => { const m = src.match(re); return m ? m[1] : null; };
const all = (src, re) => [...src.matchAll(re)].map((m) => m[1]);

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (e.endsWith('.html')) out.push(p);
  }
  return out;
}

const files = walk(S.V3).sort();
const entries = [];

for (const abs of files) {
  const name = relative(S.V3, abs);
  if (name === OUT_FILE) continue;              // never index itself
  const src = readFileSync(abs, 'utf8');

  /* THE CANONICAL IS ABSOLUTE (situation-shell.mjs:1931-1953) and the index
     needs the PATH — a search result href of "https://swechha.in/work" would
     send every in-site click out through the public origin and back. Parsed
     rather than prefix-stripped so a page built under a different SITE_ORIGIN
     still indexes at the right route; a relative canonical resolves against the
     dummy base and keeps its path, so this handles both forms. */
  const canonical = one(src, /<link rel="canonical" href="([^"]*)"/);
  if (!canonical) { dataFail(`${name} has no rel=canonical, so its route is unknown.`); continue; }
  let route;
  try { route = new URL(canonical, 'https://example.invalid').pathname; }
  catch { dataFail(`${name} has an unparseable rel=canonical: ${canonical}`); continue; }

  const rawTitle = one(src, /<title>([\s\S]*?)<\/title>/);
  /* THE ORG NAME COMES OFF EITHER END. In a list of Swechha pages it is on
     every row and distinguishes nothing. Every generated page suffixes it
     ("Publications — Swechha"), but the frozen homepage PREFIXES it
     ("Swechha - We keep the record"), so stripping only the suffix left one
     row reading the org name first. Both ends, and if that empties the string
     the untouched title is kept rather than an empty row shipped. */
  const stripped = text(rawTitle)
    .replace(/\s*[—–-]\s*Swechha\s*$/, '')
    .replace(/^\s*Swechha\s*[—–-]\s*/, '')
    .trim();
  const pageTitleTag = stripped || text(rawTitle);
  const h1 = text(one(src, /<h1[^>]*>([\s\S]*?)<\/h1>/));
  const lead = text(one(src, /<p class="lead[^"]*">([\s\S]*?)<\/p>/));
  /* HEADINGS ARE THE SEARCH TERMS, h2 AND h3 BOTH. They are how each page
     names its own parts, in the site's own words — and h3 is where the names a
     reader actually types live: the film titles on /stories, the publication
     titles, each WORK item's own heading, the doors in the Record band. An
     h2-only index could not find "Jijivisha" or "Khirki Extension".
     NOT the body text. Inlining 29 pages of prose would be megabytes for a
     site this size, and the honest fix is to say what is searched — which the
     masthead does — rather than to imply full text and not have it. */
  const heads = [
    ...all(src, /<h2[^>]*>([\s\S]*?)<\/h2>/g),
    ...all(src, /<h3[^>]*>([\s\S]*?)<\/h3>/g),
  ].map(text).filter(Boolean);

  if (!pageTitleTag) dataFail(`${name} has no usable <title>.`);

  /* THE VISIBLE NAME AND THE SEARCH-ENGINE TITLE ARE TWO DIFFERENT JOBS.
     Before Task 5's SEO pass, one field (<title>, minus the brand suffix)
     did both: it was what Google shows AND what this index shows a reader.
     Once titles became SERP strings ("Delhi air quality against CPCB
     limits — Swechha"), reusing that field here would have printed SEO
     copy on the page as though it were the site's own editorial voice —
     which the no-creative-copy rule this programme runs under forbids.
     So the register carries a second field, `indexName`: the short
     editorial name this index has always shown ("Now", "Delhi's air",
     "Campaigns"), seeded from each route's PRE-Task-5 title. The SEO
     title still makes the page findable — it goes into the search-token
     blob below, never onto the row itself. */
  /* ── DERIVED EVENT PAGES CARRY THEIR OWN NAMES ────────────────────────
     `/now/climate-event/<slug>` exists only while an event is above the
     detector's publication bar. Those pages are deliberately absent from
     data/seo/pages.json — a static register cannot hold an entry per page
     when the set changes on its own, and committing one for an event that
     has since expired would be worse than having none.

     They are still INDEXED, because a live disaster is exactly the thing a
     reader arrives searching for. The name and title come from the page's
     own <h1> and <title>, which build-climate-disaster-pages.mjs wrote from
     the dossier — so the index stays complete without the register having to
     predict what will happen. */
  const isDerivedEvent = /^\/now\/climate-event\/.+/.test(route);
  const indexName = isDerivedEvent
    ? text(h1 || pageTitleTag.replace(/\s*—\s*Swechha\s*$/, ''))
    : text(seo(route).indexName);
  const seoTitle = isDerivedEvent
    ? text(pageTitleTag)
    : text(seo(route).title);

  entries.push({
    route,
    title: indexName || h1 || route,
    seoTitle,
    h1: h1 && h1 !== indexName ? h1 : '',
    lead: lead ? lead.slice(0, 220) : '',
    heads,
  });
}

/* ── ONE ROUTE, ONE PAGE ─────────────────────────────────────────────────── */
const seen = new Map();
for (const e of entries) {
  if (seen.has(e.route)) dataFail(`${e.route} is claimed by two pages: ${seen.get(e.route)} and ${e.title}.`);
  else seen.set(e.route, e.title);
}

if (bad) { console.error(`\nREFUSING TO WRITE: ${bad} data check(s) failed.`); process.exit(1); }

/* ── GROUPED THE WAY THE SITE IS, not alphabetically. A reader scanning an
      index is looking for a section, and the nav words are the sections. ──── */
const GROUPS = [
  { name: 'The record', test: (r) => r === '/' },
  { name: 'Now', test: (r) => r === '/now' || r.startsWith('/now/') },
  { name: 'Work', test: (r) => r === '/work' || r.startsWith('/work/') },
  /* The five essay pages are AT /stories/<slug> and belong with the section
     they sit in. Matching only the index route filed them under "Elsewhere",
     which told a reader that five pieces written by the team were somewhere
     other than this site. */
  { name: 'Stories and films', test: (r) => r === '/stories' || r.startsWith('/stories/') },
  { name: 'Publications', test: (r) => r === '/publications' },
  { name: 'Impact', test: (r) => r === '/impact' },
  { name: 'Farm', test: (r) => r === '/farm' },
  { name: 'Get involved', test: (r) => r === '/act' },
  { name: 'About', test: (r) => r === '/about' },
];
const grouped = GROUPS.map((g) => ({ name: g.name, items: entries.filter((e) => g.test(e.route)) }))
  .filter((g) => g.items.length);
const ungrouped = entries.filter((e) => !GROUPS.some((g) => g.test(e.route)));
if (ungrouped.length) {
  /* Reported, not silently appended: a route nobody grouped is usually a new
     section whose group nobody added. */
  console.log(`  note  ${ungrouped.length} route(s) in no group: ${ungrouped.map((e) => e.route).join(', ')}`);
  grouped.push({ name: 'Elsewhere', items: ungrouped });
}

/* ═══ BANDS ══════════════════════════════════════════════════════════════ */
const BANDS = [
  ['top',   't1',       '#0D0D0B'],
  ['index', 'paper t2', '#F3F2F0'],
];
const clashes = S.groundChain(BANDS);
const INDEX = [['Search', '#top'], ['Everything on this site', '#index']];

const B = {};

B.top = () => `    <div class="wrap sr-mast">
      <p class="lbl eyebrow">Search</p>
      <h1 class="d1">What are you<br>looking for?</h1>
      <p class="lead">${entries.length} pages. Typing matches their titles, their section headings and their opening lines. Or read the whole list below.</p>
      <div class="sr-field">
        <label class="lbl sr-lbl" for="sr-q">Filter by word</label>
        <input id="sr-q" class="sr-in" type="search" autocomplete="off" spellcheck="false"
               placeholder="air, yamuna, farm, school, film&hellip;">
      </div>
      <p class="lbl sr-count" id="sr-count" role="status" aria-live="polite">${entries.length} pages</p>
    </div>`;

const row = (e) => `          <li class="sr-row" data-t="${esc([e.title, e.seoTitle, e.h1, e.lead, ...e.heads].join(' ').toLowerCase())}">
            <a href="${esc(e.route)}">
              <span class="sr-t">${esc(e.title)}</span>
              <span class="cap sr-r">${esc(e.route)}</span>
              ${e.lead ? `<span class="sr-l">${esc(e.lead)}</span>` : ''}
            </a>
          </li>`;

B.index = () => `${opener('index', 'Everything on this site', 'Grouped as the site is, not alphabetically.')}
    <div class="wrap">
      <div id="sr-none" class="sr-none" hidden><p class="p-hole">Nothing here matches that word.</p></div>
${grouped.map((g) => `      <section class="sr-g" data-g="${esc(g.name.toLowerCase())}">
        <h3 class="lbl sr-gh">${esc(g.name)}</h3>
        <ul class="sr-list">
${g.items.map(row).join('\n')}
        </ul>
      </section>`).join('\n')}
    </div>`;

/* ═══ THE FILTER ═════════════════════════════════════════════════════════ */
const SCRIPT = `
/* THE PAGE IS AN INDEX FIRST AND A SEARCH SECOND. Every row is already in the
   document, so this only hides rows — there is no index to fetch, nothing to
   fail at request time, and no JavaScript needed to read the site's contents.
   A group with no visible row hides its own heading, or the page shows a
   heading over nothing. */
(function(){
  var q=document.getElementById('sr-q'), count=document.getElementById('sr-count'),
      none=document.getElementById('sr-none');
  if(!q||!count) return;
  var rows=[].slice.call(document.querySelectorAll('.sr-row')),
      groups=[].slice.call(document.querySelectorAll('.sr-g'));
  var total=rows.length;
  function apply(){
    var v=q.value.trim().toLowerCase();
    var shown=0;
    for(var i=0;i<rows.length;i++){
      var hit = !v || rows[i].getAttribute('data-t').indexOf(v)!==-1;
      rows[i].hidden=!hit;
      if(hit) shown++;
    }
    for(var g=0;g<groups.length;g++){
      var any=groups[g].querySelector('.sr-row:not([hidden])');
      groups[g].hidden=!any;
    }
    if(none) none.hidden = shown!==0;
    count.textContent = v
      ? shown+' of '+total+(shown===1?' page matches':' pages match')
      : total+' pages';
  }
  q.addEventListener('input',apply);
  /* A word in the address bar, so a filtered list can be linked. Read once on
     load; not written back on every keystroke, which would fill the history. */
  var pre=new URLSearchParams(location.search).get('q');
  if(pre){ q.value=pre; apply(); }
  q.addEventListener('change',function(){
    var u=new URL(location.href);
    if(q.value.trim()) u.searchParams.set('q',q.value.trim()); else u.searchParams.delete('q');
    history.replaceState(null,'',u);
  });
})();`;

const PAGE_CSS = `
.sr-mast{padding-top:clamp(28px,6vw,72px);padding-bottom:clamp(24px,4vw,48px)}
.sr-field{margin:clamp(20px,3vw,32px) 0 0;display:grid;gap:8px;max-width:34rem}
.sr-lbl{color:var(--fg-2)}
.sr-in{width:100%;min-height:52px;padding:0 14px;background:transparent;color:var(--fg);
  border:1px solid var(--rule);border-radius:0;font:inherit;font-size:clamp(15px,2vw,17px)}
.sr-in:focus{outline:2px solid var(--mustard);outline-offset:2px;border-color:var(--mustard)}
.sr-count{margin:12px 0 0;color:var(--fg-2)}
.sr-g{margin-top:clamp(24px,3vw,40px)}
.sr-gh{margin:0 0 8px;color:var(--ink-2)}
.sr-list{list-style:none;margin:0;padding:0;display:grid;gap:2px}
.sr-row{border-top:1px solid var(--rule)}
.sr-row a{display:grid;gap:4px;padding:clamp(12px,1.6vw,18px) 0;text-decoration:none;color:inherit}
.sr-row a:hover .sr-t{color:var(--mustard)}
.sr-t{font-weight:600}
.sr-r{color:var(--ink-2);font-variant-numeric:tabular-nums}
.sr-l{color:var(--ink-2);max-width:74ch}
.sr-none{margin-top:clamp(20px,3vw,32px)}
`;

/* ═══ WRITE ══════════════════════════════════════════════════════════════ */
/* THE TITLE COMES FROM data/seo/pages.json now, not a literal here —
   see scripts/build-farm-page.mjs and scripts/build-situation-air.mjs for
   the same pattern. This generator used to keep its own copy; it happened
   to already agree with the register, but a second copy that merely agrees
   today is drift waiting to happen, which is exactly why the register
   exists (spec section 3.1). */
const TITLE = seo('/search').title;

/* `noindex, follow` (Task 9). A site-search UI is a duplicate-content surface
   — every result it renders is a page already indexed at its own canonical
   URL — so this one should not compete with those in search results.
   `follow` keeps it useful as a crawl path: it links every one of the 35
   built pages from one place, and a crawler that never indexes this page can
   still walk its links to reach all of them. */
const ROBOTS_META = '<meta name="robots" content="noindex, follow">';

const OUT = await S.assemble({
  file: OUT_FILE,
  route: '/search',
  title: TITLE,
  bands: BANDS, index: INDEX, sh, clashes,
  pageCss: PAGE_CSS,
  script: SCRIPT,
  headExtra: ROBOTS_META,
  sectionFor: (id) => (B[id] || (() => '    <div class="wrap"><p class="lead">&mdash;</p></div>'))(),
  note: `${BANDS.length} bands + footer. ${entries.length} pages indexed in ${grouped.length} groups, `
      + `${entries.reduce((n, e) => n + e.heads.length, 0)} band headings as search terms.`,
});

/* ═══ POST-WRITE GATES ═══════════════════════════════════════════════════ */
let fail = 0;
const gate = (ok, msg) => { if (!ok) { console.error(`  FAIL ${msg}`); fail++; } else console.log(`  ok   ${msg}`); };
console.log('\nGATES');

/* 1. EVERY BUILT PAGE IS IN THE INDEX. The count is derived from disk, so a
      new page that nobody added to a group still appears. */
const onDisk = files.filter((f) => relative(S.V3, f) !== OUT_FILE).length;
gate(entries.length === onDisk, `all ${onDisk} built pages are indexed (${entries.length} entries)`);

/* 2. IT DOES NOT INDEX ITSELF. A search page in its own results is a loop. */
gate(!OUT.includes('href="/search"') || !entries.some((e) => e.route === '/search'),
  'the search page is not in its own index');

/* 3. EVERY ROUTE IN THE INDEX IS A REAL ROUTE, taken from a page's canonical
      rather than composed here. */
const badRoutes = entries.filter((e) => !e.route.startsWith('/'));
gate(badRoutes.length === 0, `every indexed route is absolute${badRoutes.length ? `; FOUND: ${badRoutes.map((e) => e.route).join(', ')}` : ''}`);

/* 4. NO DEAD OR PROTOTYPE HREF. */
const hrefs = [...OUT.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
const dead = hrefs.filter((h) => h === '#' || h.startsWith('/design/') || h.startsWith('/_pages/'));
gate(dead.length === 0, `no dead or prototype href${dead.length ? `; FOUND: ${[...new Set(dead)].join(', ')}` : ''}`);

/* 5. IT READS WITHOUT JAVASCRIPT. Every row is in the served HTML, so the
      filter is an enhancement and not the feature. */
const rowsInHtml = (OUT.match(/class="sr-row"/g) || []).length;
gate(rowsInHtml === entries.length, `all ${entries.length} rows render server-side (${rowsInHtml} in the HTML)`);

/* 6. NO RAW ENTITY SURVIVED INTO THE INDEX. The decoder is a fixed list, so
      an entity the pages start using would otherwise reach a reader as
      "&rsquo;" in a search row. */
const raw = entries.flatMap((e) => [e.title, e.seoTitle, e.h1, e.lead, ...e.heads])
  .filter((t) => /&[a-z]+;|&#\d+;/i.test(t));
gate(raw.length === 0, `no undecoded entity in the index${raw.length ? `; FOUND: ${raw.slice(0, 3).join(' | ')}` : ''}`);

/* 7. THE GROUND CHAIN DOES NOT CLASH. */
gate(clashes === 0, `${clashes} ground clash(es)`);

console.log(`\n${OUT.length.toLocaleString('en-IN')} bytes. ${fail ? `${fail} gate(s) failed. The file is written — fix the generator and rebuild.` : 'All gates pass.'}`);
if (fail) process.exit(1);
