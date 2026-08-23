/**
 * situation-shell.mjs — the shared scaffold for every situation page after Air.
 *
 * THE PROBLEM THIS SOLVES. `build-situation-air.mjs` is 1,444 lines, and about
 * four hundred of them are not about air at all: the token and chrome
 * extraction out of `home.html`, the ground-adjacency check, the tab component
 * and its controller, the opener, the measured/modelled rule, the hole marker,
 * and the write gates. Copying that block into five more generators would
 * create exactly the drift the extraction pattern exists to prevent — six
 * copies of one design language, diverging one commit at a time.
 *
 * SO THE PATTERN IS APPLIED ONE LEVEL UP. D-10.3 rules that a situation page
 * copies the token layer out of the frozen `home.html` line by line rather
 * than restating it, with `R(a, b, first, last)` asserting that each range
 * still says what it said. This file does the same thing to
 * `build-situation-air.mjs`:
 *
 *     home.html  ──extracted, asserted──▶  build-situation-air.mjs
 *                                              │
 *                                    extracted, asserted
 *                                              ▼
 *                                     situation-shell.mjs
 *                                              │
 *                              ┌───────┬───────┼───────┬───────┐
 *                           yamuna  heatwave  fire   loss   climate
 *
 * AIR REMAINS THE SINGLE SOURCE OF THE SITUATION-PAGE CSS. It is not edited by
 * this work and its output is unchanged. If someone improves the tab component
 * on the Air page, the other five inherit it at their next build. If someone
 * moves the block this file reads, the assertion fires and the build refuses
 * to write rather than shipping five pages with no tab styling.
 *
 * WHY NOT JUST MOVE THE CSS INTO THIS FILE. Because then Air would have to be
 * edited to import it, and Air is finished, signed off and measured. The
 * cheapest safe move is to leave the working page alone and read from it. When
 * Air is next touched for its own reasons, the block should move here and Air
 * should import it — that is the intended end state and it is recorded in
 * §4 of SITUATION-PAGE-TEMPLATE.md rather than done opportunistically now.
 *
 * EVERY ASSERTION FAILURE IS FATAL AND SAYS WHAT MOVED. The one thing this
 * must never do is degrade quietly: a page that builds without its CSS looks
 * like a page, and the console reads clean. That already happened once on the
 * Air build (a concurrent edit shifted a range by ten lines and an extracted
 * IIFE began mid-function), which is why the assertions exist at all.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
export const V3 = join(ROOT, 'public/_pages/v3');
export const DATA = join(ROOT, 'data');

/** ── THE HAND-MAINTAINED HOMEPAGE SOURCE ────────────────────────────────
 *  `design/home.html`, and it is NOT the page the reader gets. AD-28 §7 moved
 *  it out of `public/_pages/v3/` because the acceptance test is over the file
 *  and this one carried 39 `AD-2`, 84 `D-0` and 3 `SOURCE-FACTS` in its
 *  comments — and those comments could not simply be deleted, because seven CSS
 *  ranges below are pinned to this file BY ABSOLUTE LINE NUMBER and deleting a
 *  comment moves every line under it.
 *
 *  So the source keeps its record and stops shipping: `build-hero.mjs` writes
 *  the source back in place with its line count unchanged, then emits
 *  `public/_pages/v3/home.html` through `shipDocument()`. Everything that reads
 *  the homepage for its footer, its nav names or its Give buttons reads THIS
 *  file — the maintained one — not the artefact. `design/README.md` has the
 *  whole argument. */
export const HOME_SRC = join(ROOT, 'design/home.html');

/** Read a committed dataset. */
export const J = (f) => JSON.parse(readFileSync(join(DATA, f), 'utf8'));

/* ═══ THE EXTRACTOR ══════════════════════════════════════════════════════ */

export function extractor(sourcePath) {
  const src = readFileSync(sourcePath, 'utf8').split('\n');
  const state = { bad: 0, file: sourcePath };

  /** An asserted line range. Checks the range still BEGINS and ENDS with the
      text it did when the range was written. Not paranoia — see the header. */
  function R(a, b, expectFirst, expectLast) {
    const head = src.slice(a - 1, a + 2).join('\n');
    const tail = src.slice(Math.max(0, b - 3), b).join('\n');
    if (expectFirst && !head.includes(expectFirst)) {
      console.error(`RANGE ${a}-${b} of ${sourcePath}: want "${expectFirst}" near the top`); state.bad++;
    }
    if (expectLast && !tail.includes(expectLast)) {
      console.error(`RANGE ${a}-${b} of ${sourcePath}: want "${expectLast}" near the end`); state.bad++;
    }
    return src.slice(a - 1, b).join('\n');
  }
  const findLine = (n, from = 0) => {
    const i = src.findIndex((l, k) => k >= from && l.includes(n));
    if (i < 0) { console.error(`MARKER MISSING in ${sourcePath}: ${n}`); state.bad++; }
    return i;
  };
  const between = (s1, s2) => {
    const a = findLine(s1); if (a < 0) return '';
    const b = findLine(s2, a); return b < 0 ? '' : src.slice(a, b + 1).join('\n');
  };
  function iife(comment) {
    const i = findLine(comment); if (i < 0) return '';
    const o = src.findIndex((l, k) => k >= i && l === '(function(){');
    const z = src.findIndex((l, k) => k >= o && l === '})();');
    if (o < 0 || z < 0) { console.error(`IIFE unterminated in ${sourcePath}: ${comment}`); state.bad++; return ''; }
    const lines = src.slice(i, z + 1);
    /* In build-situation-air.mjs the tab controller's opening comment shares
       its line with `const SCRIPT = \``, because the whole page script is one
       template literal. Taken literally that prefix arrives in the output and
       `node --check` fails on it — which is exactly what happened the first
       time this ran. So a leading template-literal declaration is trimmed off,
       keeping the comment that follows it. Only the FIRST line is touched, and
       only when it actually opens a template. */
    const m = /^const\s+\w+\s*=\s*`/.exec(lines[0]);
    if (m) lines[0] = lines[0].slice(m[0].length);
    return lines.join('\n');
  }
  /** A template literal assigned to `name`, returned WITHOUT its backticks.
      Used to lift the Air page's PAGE_CSS and SCRIPT blocks whole. The closing
      delimiter is found by scanning for a line that is exactly '`;', which is
      this repo's own formatting convention for these two blocks. */
  function templateLiteral(name) {
    const open = src.findIndex(l => l.startsWith(`const ${name} = \``));
    if (open < 0) { console.error(`TEMPLATE MISSING in ${sourcePath}: const ${name} = \``); state.bad++; return ''; }
    const close = src.findIndex((l, k) => k > open && l.trim() === '`;');
    if (close < 0) { console.error(`TEMPLATE UNTERMINATED in ${sourcePath}: ${name}`); state.bad++; return ''; }
    const first = src[open].slice(`const ${name} = \``.length);
    return [first, ...src.slice(open + 1, close)].join('\n');
  }
  return { src, state, R, findLine, between, iife, templateLiteral };
}

/* ═══ THE SHELL ══════════════════════════════════════════════════════════ */

/**
 * Everything a situation page needs that is not about its subject.
 * Returns the extracted strings plus a running `bad` count; the caller must
 * pass that count to `assemble`, which refuses to write on any failure.
 */
export function shell() {
  const home = extractor(HOME_SRC);
  const air = extractor(join(ROOT, 'scripts/build-situation-air.mjs'));

  /* ── FROM THE FROZEN HOMEPAGE. The same six ranges the Air build takes,
        with the same assertions. Six sub-blocks are deliberately left
        behind; they are named in build-situation-air.mjs. ────────────── */
  const CSS = [
    home.R(10, 414, "SWECHHA v3. C's intensity, A's structure.", '.mark{min-height:44px'),
    home.R(422, 467, 'THE THUMB, AND THE INDEX', '}'),
    home.R(529, 840, 'AD-11: a duplicate', '}'),
    home.R(2810, 2855, 'AD-09 FINAL PASS. TOUCH TARGETS', 'height:var(--hit,44px)}'),
    home.R(2878, 2895, '@media (max-width:940px)', '}'),
    home.R(2897, 2927, 'D-09.3. THE HERO OPENS FOR THE KEYBOARD', ''),
    home.R(2971, 3033, 'D-09.1. ONE COMPACT INDEX CONTROL', '}'),
  ].join('\n\n');

  const HEAD_FONTS = home.R(8, 8, 'fonts.googleapis.com', 'display=swap');
  const SVG_DEFS = home.between('<filter id="duo"', '</svg>');
  const SKIP = home.between('D-09.3. BYPASS BLOCKS', 'class="skip"');
  const FOOTER = home.between('<footer class="foot"', '</footer>');
  const JS_NAVIDX = home.iife('D-09.1. THE MOBILE INDEX CONTROL');
  /* D-09.4's ACTIVE-SECTION UNDERLINE IS NO LONGER LIFTED. AD-27.2 deleted it
     from home.html and from here in the same change. It selected
     `.nav a.nl[href*="#"]`, which has matched zero elements on all 35 built
     pages since AD-23 rewrote every nav href to a canonical route — so every
     page built on this shell was carrying ~50 lines of script that could not
     fire, described in its own comment as working. The CSS it existed to
     trigger (`.nav a.nl[aria-current]`) is untouched and is now driven by the
     static `aria-current` attributes `header()` writes, which cannot drift.
     AD-27.1 retires the scroll-spy; it is not pending and must not come back. */

  /* ── FROM THE AIR GENERATOR. The situation-page CSS layer: what Air added
        on top of the homepage's tokens — the tab component, the
        measured/modelled rule, the hole marker, the picture band. Read whole,
        asserted, never retyped. ─────────────────────────────────────────── */
  const SITUATION_CSS = air.templateLiteral('PAGE_CSS');

  /* ── THE SCRIPT IS *NOT* TAKEN WHOLE, AND THIS IS THE INTERESTING PART.
        The first version of this file lifted Air's entire `SCRIPT` template.
        The guard below fired immediately: the block still contained
        `${AIR.aqiLimit}` and `${JSON.stringify(n0(IND.totals.cities))}`.
        Those belong to Air's LIVENESS UPGRADE — the code that calls
        `/api/air` and re-renders the reading in the browser (D-21.5).

        None of the five pages built on this shell has a live endpoint. Air
        earned `LIVE` by proving its CPCB feed advanced hourly and putting a
        server route in front of it; there is no equivalent for a river
        sampled monthly by hand or a forest report published every two years.
        So carrying Air's fetch code here would ship five pages that call an
        air-quality API for no reason, and it would smuggle in the one thing
        D-10.1 forbids.

        Therefore only the TAB CONTROLLER is taken — the genuinely generic
        component — and the two homepage IIFEs are appended as themselves.
        The `${` guard stays, because it is what found this. ─────────────── */
  const JS_TABS = air.iife('── TABS. Canonical ARIA tabs with a roving tabindex');
  const SCRIPT_BASE = [JS_TABS, JS_NAVIDX].join('\n\n');

  // Prove the blocks are the ones we think they are. A range that still parses
  // but no longer contains the tab component would ship five pages whose tabs
  // silently do nothing while the console reads clean.
  const must = [
    [SITUATION_CSS, '.p-tabs', 'the tab component CSS', 'PAGE_CSS'],
    [SITUATION_CSS, '.p-hole', 'the named-hole marker CSS', 'PAGE_CSS'],
    [SITUATION_CSS, '.p-kd', 'the measured-versus-modelled rule CSS', 'PAGE_CSS'],
    // .im-head is the frozen homepage's own component, so it must arrive in
    // the homepage CSS and NOT in Air's block. Checked on the right block —
    // the first version of this list checked it on the wrong one and failed.
    [CSS, '.im-head', 'the band opener CSS', 'home.html'],
    [SCRIPT_BASE, 'data-tabs', 'the tab controller', 'the Air tab IIFE'],
    [SCRIPT_BASE, 'role=tab', 'the tab controller ARIA wiring', 'the Air tab IIFE'],
    [SCRIPT_BASE, 'navidx', 'the mobile section index', 'home.html'],
  ];
  for (const [block, needle, what, where] of must) {
    if (!block.includes(needle)) {
      console.error(`EXTRACTION IS WRONG: ${what} (${needle}) is not in the block taken from ` +
        `${where}. The block moved or was renamed — re-find it, do not delete this check.`);
      air.state.bad++;
    }
  }
  if (SCRIPT_BASE.includes('${')) {
    console.error('EXTRACTION IS WRONG: the extracted page script contains an unexpanded ' +
      '${...} placeholder, which means subject-specific code was pulled in with it. ' +
      'Narrow the extraction — do not substitute the value.');
    air.state.bad++;
  }
  /* ── THE SAME GUARD ON THE CSS, ADDED AFTER IT BIT. ──────────────────
     SITUATION_CSS is Air's PAGE_CSS lifted as raw TEXT, so any ${...} in it
     arrives here as literal characters and then ships to five pages. That is
     exactly what happened when ${FAMILY_CSS} was added to Air's block: six
     pages carried the literal string and only `verify:final` noticed.
     The script half had this guard from the start; the CSS half did not, which
     is the same bug on a different line — the phrase already in this file's
     header, earned twice now. */
  if (SITUATION_CSS.includes('${')) {
    const found = [...new Set(SITUATION_CSS.match(/\$\{[A-Za-z_][\w.]*\}/g) || [])];
    console.error('EXTRACTION IS WRONG: the CSS lifted from build-situation-air.mjs contains ' +
      `unexpanded placeholder(s): ${found.join(', ')}. That block is read as TEXT, so an ` +
      'interpolation in it ships to every page built on this shell as literal characters. ' +
      'Move it out of PAGE_CSS and into Air\'s own document assembly.');
    air.state.bad++;
  }

  return {
    CSS, HEAD_FONTS, SVG_DEFS, SKIP, FOOTER,
    SITUATION_CSS, SCRIPT_BASE,
    bad: home.state.bad + air.state.bad,
  };
}

/* ═══ CHROME ═════════════════════════════════════════════════════════════ */

/* The site's primary nav, identical on every situation page and on /about.
 *
 * THE SIX DESTINATIONS ARE THE RULED CONTRACT, NOT THIS FILE'S CHOICE:
 * AD-17 §2 ("one word, one absolute destination, from every page on the
 * site"), as amended by W-16, which reinstated `/work` as a page. `Now`
 * points at the situation index because that is where a reader goes to
 * find the other five.
 *
 * WHY THESE ARE CANONICAL ROUTES AND NOT `/design/` PATHS. Every href in
 * this build used to be written as the prototype path it resolves to
 * today — `/design/v3/intelligence.html` for Now, `/design/v3/home.html#work`
 * for Work. That is the one thing the contract forbids: `public/design/` is
 * deleted before any deploy (AD-17 §6.4), so a `/design/` path is a link
 * that cannot survive the port, and W-2 records the homepage's own six being
 * corrected off exactly these values. The WORK section's link gate rejects
 * the class outright. So the pages carry the destination they will have,
 * and the prototype is browsed knowing the chrome links forward.
 *
 * Four of the six resolve to a page and two to a homepage band written
 * ABSOLUTELY — `/#farm` is a same-page jump from the homepage and a
 * navigate-plus-jump from here, and it is the SAME destination either way.
 */
/* AD-24, 22 August: `Farm` was `/#farm` — a homepage anchor — for as long as
 * there was no farm page. `/farm` now exists (the page D-07.13 promised on
 * 21 August and nobody built), so the nav word points at the page. Leaving it
 * on the anchor would repeat the `/impact` defect exactly: the nav says a word
 * on every page of this site, and for as long as the route is unmapped or the
 * href is stale, clicking it opens something other than the page. `Record` is
 * still an anchor because there is still no record page. */
/* RECORD IS REMOVED FROM THE NAV (owner, 22 August), so the set is five.
   AD-19 settled six and AD-26 §5 Q4 recorded that the count is the owner's
   call; this is that call being made. The word was the weakest of the six by
   the design audit's own test — it pointed at `/#record`, a homepage band whose
   two live doors both went to `/now`, duplicating the first nav word, and whose
   other two were dead until they were changed to name their holes.
   THE BAND ITSELF STAYS. It is real content — where the readings come from, and
   what of the paper archive is scanned — and `onward.json`'s `evidence.default`
   still sends WORK pages to it, which works because the anchor is still there.
   Only the nav word goes.
   ONE CONSEQUENCE, HARMLESS: Record was the only nav word with a `#` href, so
   home.html's active-band observer now finds no band-linked nav link, and its
   own guard (`if(!ids.length) return`) makes it a no-op. It is left in place
   rather than deleted, because it comes back the moment a band-linked word
   does. */
export const NAV = [
  ['Now', '/now'],
  ['Work', '/work'],
  ['Journeys', '/work/journeys'],
  ['Impact', '/impact'],
  ['Farm', '/farm'],
];

/* THE HOMEPAGE, AND THE GIVE CHIP. The wordmark is the site root, matching
 * all fifteen WORK pages. The chip is `/act` per the nav contract's Give
 * row — the chip is a nav control, so it takes the nav's destination, not
 * the homepage's `#give` band that body copy still points at. */
export const HOME_HREF = '/';
export const GIVE_HREF = '/act';

/* `aria-current` on the nav, per AD-19 §5: `"page"` ONLY where the href
 * equals the URL being built, `"true"` where the label is the right
 * location but the href is its parent. So the index carries `"page"` on
 * Now, and a situation page carries `"true"` on Now — its href is `/now`,
 * which is not this page, and `"page"` there would be a lie. Pass
 * `current` as the nav label to mark, and `url` as this page's own route.
 * Pages outside the six (about) pass neither and mark nothing. */
/* AD-27.3 completes the table for the two controls that are not nav WORDS.
   The GIVE chip's href is `/act`, so on /act it takes `aria-current="page"` —
   marked just above, where the chip is written. The search control already
   took it. `/about`, `/stories` and `/publications` mark NOTHING and that is
   deliberate: none of them is a nav word, so lighting the nearest word would
   be false, and BRANDING §5.10 is explicit that pointing `aria-current` at the
   wrong section is worse than pointing it nowhere. A page that marks nothing
   is a legitimate state and must not be "fixed". */
const navCurrent = (label, href, current, url) => label !== current ? ''
  : (href === url ? ' aria-current="page"' : ' aria-current="true"');

export const header = (index, { current = null, url = null, page = null } = {}) => `<header class="nav"><div class="nav-in"><a class="mark" href="${HOME_HREF}" aria-label="Swechha"><img src="/brand/swechha-horizontal-white-approved.png" alt="Swechha"></a><nav class="navlinks" aria-label="Primary">${NAV.map(([t, h]) => `<a class="nl" href="${h}"${navCurrent(t, h, current, url)}>${t}</a>`).join('')}</nav><button type="button" class="navidx-t" aria-expanded="false" aria-controls="navidx">Menu</button>
<div class="navidx" id="navidx" hidden><nav aria-label="Pages">${NAV.map(([t, h]) => `<a class="nl" href="${h}"${navCurrent(t, h, current, url)}>${t}</a>`).join('')}</nav></div><a class="nl navsearch" href="/search"${page === '/search' ? ' aria-current="page"' : ''}><svg class="navsearch-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/></svg><span class="navsearch-t">Search</span></a><a class="give" href="${GIVE_HREF}"${page === GIVE_HREF ? ' aria-current="page"' : ''}>Give</a></div><nav class="navscroll" aria-label="Sections"><ul>${index.map(([t, h]) => `<li><a class="nl" href="${h}">${t}</a></li>`).join('')}</ul></nav></header>`;

/* ═══ GROUND ADJACENCY ═══════════════════════════════════════════════════ */

/**
 * No two adjacent bands may share a background. Checked on the COMPOSITED
 * rendered colour rather than on class names, because a section with no class
 * is transparent and inherits its neighbour — that bug shipped once
 * (SITUATION-PAGE-TEMPLATE.md §2, gate 2). Every entry here therefore states
 * its ground hex explicitly, including the ones whose class implies it.
 */
export function groundChain(bands, footerHex = '#151512') {
  const chain = [...bands.map(b => [b[0], b[2]]), ['footer', footerHex]];
  let clashes = 0;
  console.log('GROUND CHAIN');
  for (let i = 0; i < chain.length - 1; i++) {
    const ok = chain[i][1] !== chain[i + 1][1];
    if (!ok) clashes++;
    console.log(`  ${chain[i][0].padEnd(12)} ${chain[i][1]} -> ${chain[i + 1][0].padEnd(12)} ${chain[i + 1][1]}  ${ok ? 'ok' : '*** CLASH ***'}`);
  }
  console.log(`  => ${clashes} clash(es)`);
  return clashes;
}

/* ═══ COMPONENTS ═════════════════════════════════════════════════════════ */

export const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

export const MON = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
export const MON3 = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Indian digit grouping. `null` renders an em dash, never a zero. */
export const n0 = (v) => v == null ? '—' : Number(v).toLocaleString('en-IN');
export const n1 = (v) => v == null ? '—' : Number(v).toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** A big count, shortened only where the exact digits are not the point. */
export const compact = (v) => {
  if (v == null) return '—';
  const n = Number(v);
  if (n >= 10000000) return `${+(n / 10000000).toFixed(n >= 100000000 ? 0 : 1)} crore`;
  if (n >= 100000) return `${+(n / 100000).toFixed(n >= 1000000 ? 0 : 1)} lakh`;
  return n.toLocaleString('en-IN');
};

/**
 * MEASURED vs MODELLED, carried by the rule under the numeral (D-21.4).
 * Solid = counted. Dotted = modelled. Costs no height, and applying it to the
 * Air page's health figures produced the finding that three of four were models.
 * Dashed is NOT reused: it already means a shut window.
 */
export const kindTag = (kind) => kind === 'modelled'
  ? '<span class="p-kind p-kind-m">Modelled, not measured</span>'
  : '<span class="p-kind">Measured</span>';

export const kd = (kind) => `class="unit p-kd ${kind === 'modelled' ? 'p-kd-m' : 'p-kd-c'}"`;

export const KIND_LEGEND = '      <p class="p-legend"><span class="lbl p-kd p-kd-c">Counted or measured</span><span class="lbl p-kd p-kd-m">Modelled</span></p>';

/**
 * The band opener.
 *
 * ★ IT CARRIES ITS OWN `.wrap`, AND THAT IS THE FIX FOR A REAL BUG.
 * `.im-head` has no horizontal padding of its own — the gutter lives on
 * `.wrap` (`padding:0 var(--gut)`). The frozen homepage always nests
 * `.im-head` inside a `.wrap`, and so does the Air build, whose bands open
 * `<div class="wrap">` before calling their opener.
 *
 * The first version of this shell returned the bare `.im-head` and left the
 * `.wrap` to the caller, which put every band heading at x=0 — hard against
 * the screen edge, on every band of every page. The client spotted it on the
 * Yamuna page before any measurement did.
 *
 * Self-wrapping is the right shape because it cannot be got wrong once per
 * band per page. The extra `.wrap` around the content that follows is
 * harmless: same max-width, same padding, and two stacked blocks. The gate in
 * `assemble` now checks every `.im-head` in the output is inside a `.wrap`,
 * so this cannot come back.
 */
export const opener = (id, head, lead) => `    <div class="wrap"><div class="im-head">
        <h2 class="d1" id="${id}-h">${head}</h2>
        <p class="lead">${lead}</p>
      </div></div>`;

/**
 * A NAMED HOLE. The container is hidden and the gap is STATED. Naming a hole
 * is content, not an apology (SITUATION-PAGE-TEMPLATE.md §3) — so this renders
 * a real sentence, never a blank, a dash, a zero or a greyed placeholder.
 */
export const hole = (what) => `      <p class="p-hole">${esc(what)}</p>`;

/** ARIA tabs. Panels use `hidden`, deliberately, unlike the frozen deck (D-21.1). */
let tabSeq = 0;
export const tabs = (group, panels) => {
  const id = `tb${++tabSeq}`;
  /* THE LABEL IS NOT ESCAPED, AND THAT IS DELIBERATE.
     Tab labels are author-written markup in the same way `opener()`'s heading
     and lead are — they carry the site's typographic entities (&rsquo;, &mdash;).
     Escaping them renders "India&rsquo;s rivers" literally on the tab, which is
     what the first build did and what the client saw in the screenshot. The
     GROUP name below is still escaped, because it lands in an attribute. */
  const list = panels.map(([label], i) =>
    `<button type="button" role="tab" id="${id}-t${i}" aria-controls="${id}-p${i}"`
    + ` aria-selected="${i === 0}"${i ? ' tabindex="-1"' : ''}>${label}</button>`).join('');
  const body = panels.map(([, html], i) =>
    `<div role="tabpanel" id="${id}-p${i}" aria-labelledby="${id}-t${i}"${i ? ' hidden' : ''}>${html}</div>`).join('\n');
  return `      <div class="p-tabs" data-tabs>
        <div class="p-tabs-l" role="tablist" aria-label="${esc(group)}">${list}</div>
${body}
      </div>`;
};

/**
 * The state chip. The vocabulary is exactly four words and it is shown at all
 * times, never conditionally (D-10.1). The class names never become copy.
 */
export const STATES = {
  LIVE: 'live', PERIODIC: 'periodic', 'DEMO DATA': 'demo', 'OUT OF SEASON': 'closed',
};
export const stateChip = (word) => {
  const cls = STATES[word];
  if (!cls) throw new Error(`"${word}" is not one of the four state words: ${Object.keys(STATES).join(' / ')}`);
  return `<span class="lbl tag tag-${cls}">${word}</span>`;
};

/* ═══ THE FAMILY ═════════════════════════════════════════════════════════
   ONE definition of the set, with THREE consumers: the situation pages (for
   their parent crumb and sibling rail), build-intelligence.mjs (for its cards)
   and verify-final.mjs (for the link-graph assertion).

   Before this existed the index kept its own list and the verifier kept
   another, which is two places for the same truth to drift apart — the exact
   problem the extraction pattern exists to solve, one level further up.

   THE WORKFLOW THIS ENCODES. The index is the parent: a reader arrives at /now,
   picks a situation, and lands on its page. So every page carries a crumb back
   to the index and a rail to its five siblings, and the relationship is
   asserted in both directions by `npm run verify:final`. A page that stops
   linking home, or an index that drops a card, fails the build rather than
   quietly orphaning itself.
   ═══════════════════════════════════════════════════════════════════════ */
export const INDEX_PAGE = { file: 'intelligence.html', route: '/now', label: 'Now' };

/* EACH MEMBER CARRIES BOTH ITS FILE AND ITS ROUTE, and they are different
 * things: `file` is where the generator writes today, `route` is the URL every
 * href in the built page points at. Keeping the pair here is what makes the
 * port a table lookup instead of a re-derivation — and it is why no generator
 * anywhere writes a `/design/` path any more (see NAV above for the reasoning).
 *
 * THE ROUTES NEST UNDER THE PARENT ON PURPOSE. `/now` is the index and the six
 * are its children, so they are `/now/<slug>` — the shape FINAL.md has declared
 * since the set was finished. An earlier flat guess at `/situations/<slug>`
 * survived in the WORK section's link gate (work-shell.mjs) and disagreed with
 * this on both the parent AND heat's slug; that map now defers to this one,
 * because a child route that does not sit under the index it belongs to orphans
 * the page from its own parent.
 *
 * `id` is the internal key and does NOT track the slug: `heatwave`/`heat`,
 * `fire`/`forest-fire`, `loss`/`forest-loss`, `climate`/`climate-event`. The
 * ids are load-bearing across six generators, so they stay as they are and the
 * route is stated rather than derived from them. */
export const FAMILY = [
  { id: 'air',      name: 'Air',           where: 'Delhi', file: 'situation-air.html',           route: '/now/air' },
  { id: 'yamuna',   name: 'Yamuna',        where: 'Delhi', file: 'situation-yamuna.html',        route: '/now/yamuna' },
  { id: 'heatwave', name: 'Heat',          where: 'India', file: 'situation-heatwave.html',       route: '/now/heat' },
  { id: 'fire',     name: 'Forest fire',   where: 'India', file: 'situation-forest-fire.html',    route: '/now/forest-fire' },
  { id: 'loss',     name: 'Forest loss',   where: 'India', file: 'situation-forest-loss.html',    route: '/now/forest-loss' },
  { id: 'climate',  name: 'Climate event', where: 'India', file: 'situation-climate-event.html',  route: '/now/climate-event' },
];
export const familyHref = (id) => {
  const m = FAMILY.find(f => f.id === id);
  if (!m) throw new Error(`"${id}" is not in FAMILY: ${FAMILY.map(f => f.id).join(', ')}`);
  return m.route;
};

/**
 * THE PARENT CRUMB. Sits directly under the hero, above the reading, and says
 * where the reader is in the set. Two links, not a decoration: the index, and
 * the position. It is the only place a situation page states that it is one of
 * six rather than a standalone document.
 */
export const crumb = (id) => {
  const i = FAMILY.findIndex(f => f.id === id);
  if (i < 0) throw new Error(`crumb: "${id}" is not in FAMILY`);
  return `      <nav class="fam-crumb" aria-label="Where this page sits">
        <a class="fam-crumb-up" href="${INDEX_PAGE.route}">${INDEX_PAGE.label}</a>
        <i class="fam-crumb-sep" aria-hidden="true">/</i>
        <span class="fam-crumb-here">${esc(FAMILY[i].name)}</span>
        <span class="cap fam-crumb-n">${i + 1} of ${FAMILY.length} situations</span>
      </nav>`;
};

/**
 * THE SIBLING RAIL. The other five, at the foot of the page, so the set is
 * navigable without going back up. Reads the family, so adding a seventh
 * situation adds it to five rails automatically.
 */
export const siblings = (id) => {
  const rest = FAMILY.filter(f => f.id !== id);
  return `      <nav class="fam-sibs" aria-label="The other situations">
        <p class="lbl fam-sibs-h">The other ${rest.length}</p>
        <div class="fam-sibs-r">
          ${rest.map(f => `<a class="fam-sib" href="${f.route}">
            <span class="fam-sib-n">${esc(f.name)}</span>
            <span class="cap fam-sib-w">${esc(f.where)}</span></a>`).join('\n          ')}
        </div>
        <p style="margin:0"><a class="act" href="${INDEX_PAGE.route}">All ${FAMILY.length}, side by side ${ARROW}</a></p>
      </nav>`;
};

/* THE FAMILY'S OWN CSS, exported separately because build-situation-air.mjs
   assembles its own document and needs the crumb and rail without the
   disclosure and measure-row rules it does not use. */
export const FAMILY_CSS = `
/* ── THE FAMILY: PARENT CRUMB AND SIBLING RAIL. Both work on either ground. ── */
.fam-crumb{display:flex;flex-wrap:wrap;align-items:baseline;gap:0 8px;
  margin:0 0 clamp(16px,1.8vw,24px)}
.fam-crumb-up{font-size:11px;letter-spacing:.09em;text-transform:uppercase;
  color:var(--mustard);text-decoration:none;min-height:var(--hit,44px);display:inline-flex;align-items:center}
.fam-crumb-up:hover,.fam-crumb-up:focus-visible{color:var(--mustard-2);text-decoration:underline}
.fam-crumb-sep{color:var(--fg-3);font-style:normal;font-size:11px}
.paper .fam-crumb-sep{color:var(--ink-3)}
.fam-crumb-here{font-size:11px;letter-spacing:.09em;text-transform:uppercase;color:var(--fg-2)}
.paper .fam-crumb-here{color:var(--ink-2)}
.fam-crumb-n{margin-left:auto;color:var(--fg-3)}
.paper .fam-crumb-n{color:var(--ink-3)}

.fam-sibs{margin:clamp(28px,3.2vw,44px) 0 0;border-top:1px solid var(--hair);padding-top:clamp(16px,1.8vw,24px)}
.paper .fam-sibs{border-top-color:var(--rule-2)}
.fam-sibs-h{display:block;color:var(--fg-3);margin:0 0 clamp(12px,1.4vw,18px)}
.paper .fam-sibs-h{color:var(--ink-3)}
.fam-sibs-r{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--hair-2);
  margin:0 0 clamp(16px,1.8vw,24px)}
.paper .fam-sibs-r{background:var(--rule)}
.fam-sib{display:block;background:var(--ground);padding:12px 14px;text-decoration:none;
  transition:background .14s}
.paper .fam-sib{background:var(--paper)}
.dark-2 .fam-sib{background:var(--ground-2)}
.fam-sib:hover,.fam-sib:focus-visible{background:rgba(251,248,240,.05)}
.paper .fam-sib:hover,.paper .fam-sib:focus-visible{background:var(--paper-2)}
.fam-sib:focus-visible{outline:2px solid var(--fg);outline-offset:-3px}
.paper .fam-sib:focus-visible{outline-color:var(--ink)}
.fam-sib-n{display:block;font-size:clamp(13.5px,.98vw,15.5px);color:var(--fg)}
.paper .fam-sib-n{color:var(--ink)}
.fam-sib-w{display:block;color:var(--fg-3);margin-top:1px}
.paper .fam-sib-w{color:var(--ink-3)}
@media (min-width:760px){ .fam-sibs-r{grid-template-columns:repeat(5,1fr)} }
`;

/* ═══ SHARED PAGE CSS ════════════════════════════════════════════════════
   Two components that every situation page after Air needs and that Air did
   not have. They live here rather than in each page's own block because five
   copies of one component is the drift this whole file exists to prevent.

   Both are written to work on EITHER ground. The Yamuna build learned that the
   hard way: components authored on paper ink tokens and then used on a dark
   band measured 2.11:1. So every colour below is stated for the dark ground
   and overridden under `.paper`, and neither is left to inherit.
   ═══════════════════════════════════════════════════════════════════════ */
/* ═══ THE HEADER'S SEARCH CONTROL ════════════════════════════════════════
   ITS OWN EXPORT, because two generated surfaces need it and only one of them
   gets SHARED_PAGE_CSS. build-situation-air.mjs builds its own head out of
   CSS + PAGE_CSS + FAMILY_CSS and has never included the shared block — so the
   first version of this shipped a bar control that was display:none everywhere
   except /now/air, where at 375px it crowded the bar with a fourth item.
   One definition, included in both places. home.html keeps a hand-maintained
   copy because it is not generated and its stylesheet is extracted by line
   range; those two are kept byte-identical. */
export const NAV_SEARCH_CSS = `
/* ── SEARCH IN THE HEADER, AT EVERY WIDTH. ───────────────────────────────
   A WORD ON DESKTOP, A GLASS ON THE PHONE (owner, 22 August). Above 940 the
   bar has room for a label and the label is unambiguous, so it reads "Search",
   separated from the five section words and lighter, because it is a utility
   and not a sixth section. Below 940 the bar holds the wordmark, MENU and GIVE
   with 81px free at 375px — measured, not assumed — which is a 44px target and
   a gap, so the glass fits and the word would not.
   THE LABEL NEVER LEAVES THE ACCESSIBILITY TREE. On the phone the text is
   moved off-screen with the same treatment the site's own ".sr" class uses
   rather than display:none, so the control is still "Search" to a screen
   reader and the icon carries aria-hidden. An icon-only control with no name
   is the usual way this goes wrong.
   The glass matches ARROW's drawing conventions exactly — 24x24, no fill,
   currentColor, 2.2 stroke, round caps — so it is the same hand as the one
   other icon in the site rather than a second style. */
/* 44x44, NOT 19x44. AD-09's touch-target pass gave every control in this bar a
   44px minimum and an icon-only link is 19px wide without a min-width — the one
   place in the bar where the visual size and the target size come apart. The
   measurement said 81px free at 375px, so this costs nothing. */
.navsearch{display:inline-flex;align-items:center;justify-content:center;gap:8px;
  min-height:44px;min-width:44px;opacity:.66}
.navsearch:hover,.navsearch[aria-current]{opacity:1}
.navsearch-i{width:19px;height:19px;flex:none}
.navsearch-t{position:absolute;width:1px;height:1px;overflow:hidden;
  clip:rect(0 0 0 0);white-space:nowrap}
@media (min-width:941px){
  .navsearch{margin-left:clamp(10px,1.6vw,22px);min-width:0}
  .navsearch-i{display:none}
  .navsearch-t{position:static;width:auto;height:auto;overflow:visible;clip:auto}
}
`;

export const SHARED_PAGE_CSS = `
${NAV_SEARCH_CSS}

/* ── THE MENU PANEL IS THE MOBILE NAV, AND IT IS SIX ROWS. ───────────────
   Below 940 the six nav words are display:none, so this panel is the only way
   to reach another page on a phone. It used to hold the page's own bands and
   nothing else, which made it a duplicate of the chip row already visible
   under the bar — and the first attempt at fixing that stacked the six pages
   ON TOP of the bands, producing a fourteen-row panel that filled the entire
   viewport. Both versions were wrong in the same way: two answers on one
   surface.
   So the panel is the six pages, flat, unlabelled. The page's own sections
   stay where they already were, in the .navscroll chip row under the bar. One
   surface per question, and nothing is listed twice.
   NO CSS IS NEEDED FOR IT, which is the point — home.html's own
   "navidx a.nl" rows and its "first-child" border reset both apply again now
   that the links are direct children of a single nav. The group and heading
   rules that used to sit here are deleted rather than left matching nothing.
   (And the backticks that first version of this note used broke the build in
   exactly the way the warning at the top of this block predicts.)
   The button says Menu, not Sections: it opens pages, and the sections are the
   chip row. */

/* NO BACKTICKS ANYWHERE BELOW — this whole block is one template literal and a
   backtick in a comment silently terminates it. Three separate builds were
   broken this way. Quote CSS selectors in prose without them. */
/* ── THE HERO CROP, AND A FINDING ABOUT IT.
      The situation pages all carry style="--zh:...;--zt:..." on their hero
      image, copied from the Air build. Those three custom properties belong to
      .s-hero-shot img on the frozen homepage, which reads them as height,
      top and object-position. .pic > img reads NONE of them: its rule is a
      plain width:100%;height:100%;object-fit:cover. So the zoom values are
      INERT on every situation page including Air's, and every hero is a
      centre crop whether or not that is the right crop.
      Rather than delete the attributes (they are harmless, and the Air page is
      signed off), the one property that actually decides the crop is wired up
      here. A wide photograph cropped to a portrait band loses its subject if
      the subject is not dead centre — which is exactly what happened to the
      flooded-field hero, whose pylon sits at 70% across. ─────────────────── */
.pic>img{object-position:var(--op,50% 50%)}

/* ── THE DISCLOSURE. Native details/summary: no JS, keyboard and
      screen-reader support for free, and it is what keeps a long table off a
      phone's critical path. The summary is held at var(--hit) so it meets the
      44px touch target the frozen page sets for every control. ─────────── */
.dx{margin:clamp(14px,1.6vw,20px) 0 0;border-top:1px solid var(--hair-2)}
.paper .dx{border-top-color:var(--rule-2)}
.dx-s{cursor:pointer;list-style:none;display:flex;align-items:center;gap:9px;
  min-height:var(--hit,44px);font-size:12px;letter-spacing:.06em;text-transform:uppercase;
  color:var(--fg-2)}
.paper .dx-s{color:var(--ink-2)}
.dx-s::-webkit-details-marker{display:none}
.dx-s::before{content:'';flex:none;width:9px;height:9px;border-right:2px solid currentColor;
  border-bottom:2px solid currentColor;transform:rotate(45deg) translateY(-2px);transition:transform .16s}
.dx[open]>.dx-s::before{transform:rotate(-135deg) translateY(-2px)}
.dx-s:hover,.dx-s:focus-visible{color:var(--mustard)}
.paper .dx-s:hover,.paper .dx-s:focus-visible{color:var(--ink)}
.dx-b{padding:2px 0 clamp(12px,1.4vw,18px)}

/* ── THE MEASURE ROW. A label, a bar, its value, and A TICK WHERE THE
      PUBLISHED LIMIT SITS. The tick is the whole point: a bar on its own is a
      quantity, and this site only publishes a quantity against its limit.
      Bar ink is neutral by default — weight, not red — because a large value
      is not automatically a breach. .is-over is the opt-in for a row that
      genuinely crosses a published threshold. ─────────────────────────── */
.mr-h,.mr{display:grid;grid-template-columns:minmax(0,1fr) minmax(70px,1.2fr) 4.2em 3.2em;
  gap:0 clamp(7px,.9vw,13px);align-items:center}
.mr-h{padding:0 0 7px;border-bottom:1px solid var(--hair)}
.paper .mr-h{border-bottom-color:var(--rule-2)}
.mr-h .lbl{font-size:10px;color:var(--fg-3)}
.paper .mr-h .lbl{color:var(--ink-3)}
.mr{padding:9px 0;border-bottom:1px solid var(--hair-2)}
.paper .mr{border-bottom-color:var(--rule)}
.mr-n{font-size:clamp(13px,.93vw,15px);color:var(--fg);min-width:0;overflow-wrap:break-word}
.paper .mr-n{color:var(--ink)}
.mr-n i{display:block;font-size:9.5px;font-style:normal;letter-spacing:.05em;color:var(--fg-3);line-height:1.2}
.paper .mr-n i{color:var(--ink-3)}
.mr-b{position:relative;display:block;height:8px;background:var(--hair-2)}
.paper .mr-b{background:var(--rule)}
.mr-f{position:absolute;inset:0 auto 0 0;width:var(--w);background:var(--fg-2)}
.paper .mr-f{background:var(--ink-2)}
.mr.is-over .mr-f{background:var(--red)}
.paper .mr.is-over .mr-f{background:var(--red-ink)}
.mr.is-me .mr-f{background:var(--mustard)}
.mr-l{position:absolute;top:-3px;bottom:-3px;left:var(--x);width:2px;background:var(--fg)}
.paper .mr-l{background:var(--red-ink)}
.mr-v,.mr-x{font-variant-numeric:tabular-nums;text-align:right}
.mr-v{font-size:clamp(12.5px,.9vw,14px);color:var(--fg)}
.paper .mr-v{color:var(--ink)}
.mr-x{font-size:11px;color:var(--fg-3)}
.paper .mr-x{color:var(--ink-3)}
.mr.is-over .mr-x{color:var(--red)}
.paper .mr.is-over .mr-x{color:var(--red-ink)}
@media (max-width:639px){
  .mr-h{display:none}
  .mr{grid-template-columns:minmax(0,1fr) 4em 3em;grid-template-areas:'n v x' 'b b b';
    gap:5px 8px;padding:11px 0}
  .mr-n{grid-area:n}.mr-v{grid-area:v}.mr-x{grid-area:x}.mr-b{grid-area:b}
}

/* ── AD-27.16 THE ASK. Do not edit one copy. Both shells carry this verbatim. ──
   TWO RULES BELOW ARE AN AMENDMENT TO AD-27.16 AS PUBLISHED, made once, here,
   and mirrored into work-shell.mjs: .ask-a .lk gets a 24px hit expander. Lane 4
   measured the inline fallback address at 136.63x15px and lane 3 measured the
   same 137x16 across six instances, on two different pages — under BRANDING
   §10's 24px floor on about twenty pages. AD-09 does exclude inline-in-prose
   links from the expander, and the signed-off situation pages ship 14-19px
   inline links, so precedent would forgive it; it is allowed here anyway
   because THIS link is not decoration in a sentence, it is the component's
   whole fallback path — the reader who reaches it is the one whose mail app
   did not open, on a phone, and the address is the only thing left that works.
   24px AND NOT 44: the link sits mid-paragraph in a .cap, and a 44px box
   centred on a 15px line would overlap the line above it. 24 is the floor and
   the floor is what an inline target can carry. ── */
.ask{margin:var(--gap-row) 0 0}
.ask>.ask-s{cursor:pointer;list-style:none;display:inline-flex;align-items:center;gap:9px}
.ask>.ask-s::-webkit-details-marker{display:none}
.ask-ar{flex:none;transition:transform .16s}
.ask[open]>.ask-s .ask-ar{transform:rotate(90deg)}
.ask-p{margin-top:var(--gap-row);padding-top:var(--gap-row);
  border-top:1px solid var(--hair);max-width:52ch}
.paper .ask-p,.paper-2 .ask-p{border-top-color:var(--rule-2)}
.ask-p>*{margin:0 0 14px}
.ask-p>*:last-child{margin-bottom:0}
.ask-k{color:var(--fg-2)}
.paper .ask-k,.paper-2 .ask-k{color:var(--ink-2)}
.ask-l{max-width:52ch}
.ask-a{color:var(--fg-3);max-width:56ch}
.paper .ask-a,.paper-2 .ask-a{color:var(--ink-3)}
.ask-a .lk{position:relative;display:inline-block}
.ask-a .lk::after{content:'';position:absolute;left:0;right:0;top:50%;
  transform:translateY(-50%);height:24px}
@media (prefers-reduced-motion:reduce){.ask-ar{transition:none}}
${FAMILY_CSS}

`;

/**
 * One measure row. `limitPct` places the tick; omit it when no limit exists —
 * and when none exists the page must say "No legal threshold." in words rather
 * than draw a bar with no tick and let the reader assume one.
 */
export const measureRow = ({ name, sub, valuePct, limitPct, value, times, over, mine, aria }) =>
  `<div class="mr${over ? ' is-over' : ''}${mine ? ' is-me' : ''}">
          <span class="mr-n">${name}${sub ? `<i>${sub}</i>` : ''}</span>
          <span class="mr-b"${aria ? ` role="img" aria-label="${esc(aria)}"` : ''}><i class="mr-f" style="--w:${Math.max(2, Math.round(valuePct))}%"></i>${limitPct != null ? `<i class="mr-l" style="--x:${Math.round(limitPct)}%"></i>` : ''}</span>
          <span class="mr-v">${value}</span>
          <span class="mr-x">${times ?? ''}</span>
        </div>`;

export const measureHead = (cols) =>
  `<div class="mr-h">${cols.map(c => `<span class="lbl">${c}</span>`).join('')}</div>`;

/** A native disclosure. Collapsed by default; the summary states what is inside. */
export const disclose = (summary, body) => `      <details class="dx">
        <summary class="dx-s">${summary}</summary>
        <div class="dx-b">${body}</div>
      </details>`;

/* ═══ THE ASK — AD-27.14 → AD-27.22 ══════════════════════════════════════
   ONE CONTACT COMPONENT, and it resolves the ask IN PLACE. A reader who has
   decided to work with Swechha is handed a 10,072px page today; the Ask
   answers them where they asked, with no navigation and no JavaScript.

   THE COPY BELOW IS FIXED TEXT FROM AD-27.17 AND IS NOT AN IMPLEMENTATION
   CHOICE. Four audiences, one address, one subject-line pattern, four bodies.
   Nobody invents a fifth audience, a second address, or a turnaround promise —
   naming the person IS the honest form of "short turnaround".

   LANES 3 AND 4 BUILD THROUGH THIS FILE AND SHOULD CALL `ask()` RATHER THAN
   RETYPE AD-27.15's MARKUP. Lane 2 owns work-shell.mjs, which has no access to
   this module, so it carries its own copy of the CSS (AD-27.16's sentinel
   comment is how the two are proved identical) and of this markup.

   THE HREF IS BUILT AT BUILD TIME, encodeURIComponent'd, and then `&` is
   escaped to `&amp;` because it lands in an HTML attribute (AD-27.15). The
   newlines become %0A through encodeURIComponent; they are never hand-written.
   ═══════════════════════════════════════════════════════════════════════ */

/** The four audiences. Subject word + body template, verbatim from AD-27.17. */
export const ASK_AUDIENCES = {
  school: {
    subject: 'School enquiry',
    body: [
      'School, organisation, or just yourself:',
      'Your name and role:',
      'Year group, and roughly how many people:',
      'What you have in mind (a walk, a day at the farm, a journey, a year of the curriculum):',
      'When in the year:',
    ],
  },
  funder: {
    subject: 'Funding enquiry',
    body: [
      'Organisation:',
      'Your name and role:',
      'What you are considering supporting:',
      'Rough scale, if you have one:',
    ],
  },
  institution: {
    subject: 'Partnership enquiry',
    body: [
      'Organisation:',
      'Your name and role:',
      'What you would like to do together:',
      'Where, and roughly when:',
    ],
  },
  media: {
    subject: 'Media enquiry',
    body: [
      'Publication or programme:',
      'Your name:',
      'What you are working on:',
      'Your deadline:',
    ],
  },
};

/** The one address, for all four. AD-27.17: it satisfies about-people.json's
    email_policy, which /act's gate 10 enforces. swechhaindia@gmail.com is the
    footer's general address and may never carry an Ask. */
export const ASK_EMAIL = 'vimlendu@swechha.in';

/** The one sentence, identical on all four. It promises a PERSON, not an
    interval — see AD-27.17 on why no turnaround time is printed anywhere.

    AD-28 CUT THE SECOND HALF. It used to continue: "One person reads it, and
    the subject line already says which programme you are writing about." That
    is this component's own mailto plumbing, narrated to the reader — the
    subject line is routing WE chose, and how our inbox sorts is not the
    visitor's business (COPY-STANDARD: "internal data provenance · internal
    verification notes"; AD-28 category 5, the page describing its own
    construction). WHO RECEIVES THE MAIL STAYS: a named person is what makes
    this an Ask rather than a contact form, and it is the honest form of the
    turnaround promise AD-27.17 forbids. */
export const ASK_LINE = 'This goes to Vimlendu Jha, Swechha&rsquo;s Executive Director.';

/** THE PLAIN ADDRESS, UNDER THE BUTTON. AD-28 rewrote it, and did NOT delete
    it: a device with no mail client is a real case, this line is the only way
    to the address without JavaScript, and it is the whole reason the Ask works
    with scripting off.

    What changed is the voice. It read: "If that button does nothing, your
    device has no email app set up. The address is … — copy it into whatever
    you use." Two sentences of apology and a troubleshooting instruction, to
    explain a `mailto:` — the exact "unnecessary disclaimer" the copy standard
    strikes, and it made the button look unreliable before the reader had
    pressed it. An offer does the same work in four words: the address is right
    there, and a reader who wants it takes it. */
export const ASK_FALLBACK = `Or write to <a class="lk" href="mailto:${ASK_EMAIL}">${ASK_EMAIL}</a>.`;

/** AD-27.15's arrow: the site's own drawing at 16px, rotating 90° on open.
    It is the component's only motion. */
export const ASK_ARROW = '<svg class="ask-ar" width="16" height="16" viewBox="0 0 16 16" '
  + 'aria-hidden="true" focusable="false"><path d="M2 8h11M9 4l4 4-4 4" fill="none" '
  + 'stroke="currentColor" stroke-width="2"/></svg>';

/**
 * One Ask.
 *   audience  one of ASK_AUDIENCES' four keys — it decides the subject and body
 *   label     the visible ask, e.g. "Bring your school". An ask, not a page name
 *   page      the page name that goes in the subject line, e.g. "Bridge the Gap"
 *   path      this page's own route, appended to the body as the provenance line
 *   level     1 or 2 — .b-1 is the primary and there is ONE per band (BRANDING §5.8)
 *   tertiary  the quiet link onward for the reader who DOES want to read more.
 *             Defaults per audience (see ASK_ONWARD). Pass null only where the
 *             default would point at the page the reader is already standing
 *             on — /act#partner's own two Asks do exactly that.
 */
/* ── THE TERTIARY LINK IS PER AUDIENCE. An amendment to AD-27.15, and it is a
      defect lane 4 found by building the thing: AD-27.15 hard-codes
      "How partnerships work -> /act#partner" on every Ask, and on the MEDIA
      door that is the wrong sentence AND the wrong destination. A journalist
      asking for an interview is not considering a partnership; what they want
      next is the checkable record, which is the page that carries every figure
      with the span it counts and where it came from.
      The other three audiences keep AD-27.15's link exactly as ruled — for a
      school, a funder or an institution, /act#partner IS the long version of
      the ask they just made. One variant, not four. */
export const ASK_ONWARD = {
  school: ['/act#partner', 'How partnerships work'],
  funder: ['/act#partner', 'How partnerships work'],
  institution: ['/act#partner', 'How partnerships work'],
  media: ['/impact', 'Every figure Swechha holds'],
};
export const ask = ({ audience, label, page, path, level = 1, tertiary }) => {
  const a = ASK_AUDIENCES[audience];
  if (!a) {
    console.error(`REFUSING TO BUILD: "${audience}" is not one of the four Ask audiences `
      + `(${Object.keys(ASK_AUDIENCES).join(', ')}). AD-27.56: nobody invents a fifth.`);
    process.exit(1);
  }
  /* `tertiary` undefined -> the audience's own default; `null` -> no link at
     all, which is what /act's two Asks pass because the default would point at
     the band the reader is standing in. */
  const onward = tertiary === undefined ? ASK_ONWARD[audience]
    : (tertiary ? [tertiary, 'How partnerships work'] : null);
  const subject = `${a.subject} — ${page}`;
  const body = `${a.body.join('\n')}\n\nSent from swechha.in${path}`;
  const href = `mailto:${ASK_EMAIL}?subject=${encodeURIComponent(subject)}`
    + `&body=${encodeURIComponent(body)}`;
  if (href.length > 900) {
    console.error(`REFUSING TO BUILD: the ${audience} mailto for "${page}" is ${href.length} `
      + 'characters. AD-27.17 caps an encoded href at 900 to stay well inside Outlook\'s ceiling.');
    process.exit(1);
  }
  return `      <details class="ask" data-ask="${audience}">
        <summary class="b b-${level} ask-s">${esc(label)}${ASK_ARROW}</summary>
        <div class="ask-p">
          <p class="lbl ask-k">Straight to a person</p>
          <p class="body ask-l">${ASK_LINE}</p>
          <p><a class="b b-2 ask-go" href="${href.replace(/&/g, '&amp;')}">Open an email${ASK_ARROW}</a></p>
          <p class="cap ask-a">${ASK_FALLBACK}</p>${onward
    ? `\n          <p><a class="act ask-t" href="${onward[0]}">${onward[1]} &rarr;</a></p>` : ''}
        </div>
      </details>`;
};

/**
 * AD-27.22's four assertions, run by every generator that emits an Ask.
 * Returns the number of failures; the caller decides how to fail, because each
 * generator already has its own gate reporter.
 */
export function askGates(html, report, { allowed = [] } = {}) {
  let bad = 0;
  const say = (ok, msg) => { if (report) report(ok, msg); if (!ok) bad++; };
  /* Each Ask is read as a WHOLE BLOCK, not as two parallel lists of matches.
     A page legitimately carries other mailto: links (act.html's own contact
     band does), so pairing the Nth data-ask with the Nth subject on the page
     would compare an Ask against somebody else's href and pass or fail by
     accident. */
  const blocks = [...html.matchAll(/<details class="ask" data-ask="([^"]*)"[\s\S]*?<\/details>/g)];
  const asks = blocks.map(b => b[1]);

  // 1 — the audience is one of the four, and the subject starts with its word.
  const unknown = asks.filter(a => !Object.prototype.hasOwnProperty.call(ASK_AUDIENCES, a));
  say(unknown.length === 0,
    `every .ask names one of the four audiences${unknown.length ? `; FOUND: ${unknown.join(', ')}` : ''} (${asks.join(', ') || 'none'})`);
  const mismatched = blocks.filter(([block, a]) => {
    const m = /mailto:[^"?]*\?subject=([^&"]*)/.exec(block);
    const subject = m ? decodeURIComponent(m[1].replace(/&amp;/g, '&')) : '';
    return !ASK_AUDIENCES[a] || !subject.startsWith(ASK_AUDIENCES[a].subject);
  }).map(b => b[1]);
  say(mismatched.length === 0,
    `every Ask subject line starts with its audience's word${mismatched.length ? `; WRONG: ${mismatched.join(', ')}` : ''}`);

  // 2 — no address is published that the email policy does not allow. The
  //     caller passes about-people.json's published_email_exceptions; with no
  //     exceptions this is the plain @swechha.in rule AD-27.22 states.
  const ok2 = new Set(allowed);
  const mailtos = [...new Set([...html.matchAll(/href="mailto:([^"?]+)/g)].map(m => m[1]))];
  const offsite = mailtos.filter(m => !m.endsWith('@swechha.in') && !ok2.has(m));
  say(offsite.length === 0,
    `every mailto: resolves to @swechha.in or a named exception${offsite.length ? `; FOUND: ${offsite.join(', ')}` : ''} (${mailtos.join(', ') || 'none'})`);

  // 3 — at most two Asks, never two of the same audience.
  say(asks.length <= 2, `no more than two Asks on the page (found ${asks.length})`);
  say(new Set(asks).size === asks.length, 'no two Asks on the page share an audience');

  // 4 — nothing unexpanded reaches the HTML. A mailto: with the literal string
  //     SUBJECT in it looks exactly like a working button.
  say(!/mailto:[^"]*(SUBJECT|BODY)/.test(html) && !/\{\{[A-Za-z_]+\}\}/.test(html),
    'no unexpanded {{token}}, SUBJECT or BODY literal reaches the HTML');
  return bad;
}

/**
 * AD-28 §7. THE DESIGN RATIONALE STAYS IN THE SOURCE AND STOPS SHIPPING TO THE
 * READER.
 *
 * The stylesheets these pages emit carried about 50KB of CSS comments per page,
 * and those comments are where the ledger references live: 26 `AD-2x`, 11
 * `D-0x` and 37 `§` on every one of the fifteen. AD-28's mechanical test is
 * over the FILE, not over the visible text, and it is right to be — a reader
 * who views source is still a reader, and a grep that has to special-case the
 * rule's own documentation proves nothing.
 *
 * WRITTEN FOR THE WORK PAGES, NOW THE WHOLE SITE'S. These three functions
 * lived in `work-shell.mjs` and only the fifteen WORK pages got them; the
 * other twenty shipped 15–39 `AD-2` hits apiece, and `home.html` shipped three
 * `SOURCE-FACTS` on top of that. Reader-visible text was clean on every one of
 * them and the page source was not, so AD-28 §7's acceptance test failed
 * site-wide while reading as if it passed. They moved here because `assemble()`
 * below is where everything that is not a WORK page is built — one mechanism,
 * one layer, nine generators that get it for free and cannot forget it.
 *
 * Hand-editing five hundred comments would have destroyed the engineering
 * record and would have had to be redone by whoever writes the next one. So the
 * comments stay in the .mjs — which is developer documentation, the same
 * category as `docs/design/**`, explicitly out of AD-28's scope — and the
 * emitted stylesheet is stripped of them at build time. The pages get smaller,
 * the record survives intact, and nothing has to be remembered.
 *
 * The stripper is deliberately literal: it walks the string and only treats
 * a slash-star as a comment opener when it is NOT inside a quoted value, so a
 * `content:"/*"` or a url() containing the sequence survives. The AD-28 gate
 * below then asserts the result is clean, so if this ever mis-fires the build
 * says so rather than shipping a half-stripped sheet.
 */
export function stripCssComments(css) {
  let out = '', i = 0, quote = null;
  while (i < css.length) {
    const c = css[i];
    if (quote) {
      out += c;
      if (c === '\\') { out += css[i + 1] || ''; i += 2; continue; }
      if (c === quote) quote = null;
      i++; continue;
    }
    if (c === '"' || c === "'") { quote = c; out += c; i++; continue; }
    if (c === '/' && css[i + 1] === '*') {
      const end = css.indexOf('*/', i + 2);
      i = end === -1 ? css.length : end + 2;
      continue;
    }
    out += c; i++;
  }
  /* Collapse the blank lines the comments leave behind. Nothing else is
     touched: this is not a minifier and must not become one. */
  return out.replace(/[ \t]+$/gm, '').replace(/\n{2,}/g, '\n').trim();
}

/**
 * AD-28 §7, the same rule applied to HTML comments.
 *
 * These pages lift the footer, the SVG filter defs and the skip link VERBATIM
 * out of `home.html`, and that frozen markup carries its own commentary — "See
 * §9 of that document", "AD-11: duo-m and five sig-* selective-colour filters
 * were defined here". Extracting it verbatim is deliberate and stays; shipping
 * the annotations is not, and they are not this file's to edit at source.
 *
 * `<script>` and `<style>` bodies are stepped over rather than scanned: a
 * `<!--` inside a script string is not a comment, and cutting from there to the
 * next `-->` would silently delete working code. The AD-28 gate runs after
 * this, and `node --check` runs on the page script after that, so a mistake
 * here stops the build instead of shipping.
 */
export function stripHtmlComments(html) {
  let out = '', i = 0;
  while (i < html.length) {
    const lower = html.slice(i, i + 8).toLowerCase();
    if (lower.startsWith('<script') || lower.startsWith('<style')) {
      const tag = lower.startsWith('<script') ? 'script' : 'style';
      const end = html.toLowerCase().indexOf(`</${tag}>`, i);
      const stop = end === -1 ? html.length : end + tag.length + 3;
      out += html.slice(i, stop); i = stop; continue;
    }
    if (html.startsWith('<!--', i)) {
      const end = html.indexOf('-->', i + 4);
      i = end === -1 ? html.length : end + 3;
      continue;
    }
    out += html[i]; i++;
  }
  return out.replace(/[ \t]+$/gm, '').replace(/\n{3,}/g, '\n\n');
}

/**
 * AD-28 §7 in the page script, and the ONE place this pass redacts rather than
 * strips.
 *
 * The behaviours these pages run — the mobile index control, the tab
 * controller — are lifted out of `home.html` by comment marker
 * (`situation-shell.mjs`'s `iife()`), and the marker is a ruling id: "D-09.1.
 * THE MOBILE INDEX CONTROL". The extraction is the right design and stays; the
 * id must not ship.
 *
 * DELETING WHOLE JS COMMENTS WAS REJECTED. Doing it safely means correctly
 * identifying regex literals, template literals and nested quotes, and getting
 * that wrong deletes working code. Redacting only the struck substrings INSIDE
 * a span the scanner believes is a comment has the same scanning risk and a
 * blast radius of nothing: if the scanner is ever wrong about a span, the worst
 * it can do is rewrite a ledger id that no code contains anyway.
 *
 * `node --check` runs on the result, and the AD-28 gate runs after that.
 */
export function redactScriptLedgerRefs(js) {
  const LEDGER = /\bSOURCE-FACTS[^\s.,;)]*|\bAD-\d\d(\.\d+)?|\bD-\d\d?\.\d+|\bW-\d\d\b|§\s*\d*/g;
  let out = '', i = 0;
  const isRegexStart = () => {
    for (let k = out.length - 1; k >= 0; k--) {
      const c = out[k];
      if (/\s/.test(c)) continue;
      return '(,=:[!&|?{};+-*%~^'.includes(c);
    }
    return true;
  };
  while (i < js.length) {
    const two = js.slice(i, i + 2);
    if (two === '//') {
      const end = js.indexOf('\n', i); const stop = end === -1 ? js.length : end;
      out += js.slice(i, stop).replace(LEDGER, 'note'); i = stop; continue;
    }
    if (two === '/*') {
      const end = js.indexOf('*/', i + 2); const stop = end === -1 ? js.length : end + 2;
      out += js.slice(i, stop).replace(LEDGER, 'note'); i = stop; continue;
    }
    const c = js[i];
    if (c === '"' || c === "'" || c === '`') {
      out += c; i++;
      while (i < js.length) {
        if (js[i] === '\\') { out += js.slice(i, i + 2); i += 2; continue; }
        out += js[i];
        if (js[i] === c) { i++; break; }
        i++;
      }
      continue;
    }
    if (c === '/' && isRegexStart()) {
      out += c; i++;
      let inClass = false;
      while (i < js.length) {
        if (js[i] === '\\') { out += js.slice(i, i + 2); i += 2; continue; }
        if (js[i] === '[') inClass = true;
        else if (js[i] === ']') inClass = false;
        else if (js[i] === '/' && !inClass) { out += js[i]; i++; break; }
        else if (js[i] === '\n') break;
        out += js[i]; i++;
      }
      continue;
    }
    out += c; i++;
  }
  return out;
}

/**
 * AD-28 §7 FOR A DOCUMENT NOBODY GENERATED.
 *
 * `assemble()` below calls the three strippers on the pieces it is holding —
 * the stylesheet as a string, the script as a string, the document as a string.
 * `design/home.html` arrives as one finished document instead, so the pieces
 * have to be found inside it first. That is all this function is: locate every
 * `<style>` body and strip its CSS comments, locate every `<script>` body and
 * redact the ledger ids in its comments, then strip the HTML comments out of
 * everything that is left.
 *
 * ORDER MATTERS AND IS NOT ARBITRARY. `stripHtmlComments` deliberately STEPS
 * OVER `<script>` and `<style>` — a `<!--` inside a script string is not a
 * comment, and cutting from there to the next `-->` deletes working code. So
 * the two embedded languages are handled in their own terms first, and the
 * HTML pass runs last over the result.
 *
 * THE BODIES ARE FOUND BY REGEX, WHICH IS THE ONE THING HERE THAT COULD BE
 * WRONG: a literal `</script>` inside a JS string would end the match early.
 * `build-hero.mjs` counts the tags before and after and refuses to write if
 * either count moves, so that mistake stops the build instead of shipping half
 * a page.
 *
 * WHY REDACT THE SCRIPT RATHER THAN CUT ITS COMMENTS: unchanged from the
 * argument at `redactScriptLedgerRefs` — deleting JS comments safely means
 * correctly parsing regex and template literals, and getting it wrong deletes
 * working code. Rewriting a ledger id inside a span the scanner believes is a
 * comment has the same scanning risk and a blast radius of nothing.
 */
export function shipDocument(html) {
  const withStyles = html.replace(/(<style\b[^>]*>)([\s\S]*?)(<\/style>)/gi,
    (_, open, body, close) => open + stripCssComments(body) + close);
  const withScripts = withStyles.replace(/(<script\b[^>]*>)([\s\S]*?)(<\/script>)/gi,
    (_, open, body, close) => open + redactScriptLedgerRefs(body) + close);
  return stripHtmlComments(withScripts);
}

/* ═══ ASSEMBLE AND THE WRITE GATES ═══════════════════════════════════════ */

/**
 * Build the document and write it — but only if every gate passes.
 * Gates, in order: extraction assertions, ground adjacency, and `node --check`
 * on the WHOLE page script, extracted and hand-written together. Checking only
 * one half leaves the other unchecked, which is the same bug on a different
 * line (SITUATION-PAGE-TEMPLATE.md §2).
 */
/* ═══ THE HEAD TAGS EVERY BUILT PAGE OWES (AD-27.48, .49, .13) ═══════════
   THE STATE THIS FIXES, MEASURED: 20 of 35 built pages carried no
   `<meta name="description">` AT ALL — including the homepage, /about, /act,
   /farm, /impact, /now and all six situations — and ZERO of 35 carried
   `og:*`, `twitter:*` or `<link rel="icon">`. The mechanical reason for the
   first was this file: `assemble()` had no `desc` parameter, so no caller
   could have passed one.

   ★ THE DESCRIPTIONS LIVE HERE, KEYED BY THE PAGE'S OWN CANONICAL ROUTE.
   AD-27.48 asks for "one parameter", and `desc` is that parameter — a caller
   may always pass its own and it wins. The register below is the default for
   the pages that already existed when the parameter was added, so that the
   twenty missing descriptions land in ONE change rather than in six
   generators owned by four people working in parallel. A generator that
   wants its description beside its own copy should pass `desc:` and delete
   its row here; the two paths cannot both apply.

   ★ REQUIRED, AND THE BUILD STOPS WITHOUT ONE. Same argument the canonical
   check above makes about the URL: a page that cannot say what it is about
   should not be published. A NEW page therefore has to write one — which is
   the whole point, and is why the register is a default and not a fallback
   string.

   ★ EVERY DESCRIPTION IS 140-158 CHARACTERS, states the page's subject in the
   reader's words, and carries one verifiable fact. NOTHING HERE IS TENSED,
   DATED OR A SPECIMEN (BRANDING §3.5 applies to <head> exactly as it applies
   to <body> — Google caches this text): no reading, no elapsed-years count,
   no "today", no "currently", no DEMO DATA. Note how the situation rows are
   written — they describe the INSTRUMENT, never the value, because the value
   moves and the description does not. */
export const DESCRIPTIONS = {
  '/now': "Six environmental readings Swechha keeps: Delhi's air, the Yamuna, heat, forest fire, forest loss and extreme rain, each against the standard that governs it.",
  '/now/yamuna': "The Yamuna through Delhi, read against CPCB's own class C standard, with the monitoring station, the sampling method and the date on every figure.",
  '/now/heat': "India's heat, read from IMD's own heat-wave criteria and NCRB's death table, with the source, the year and the limits of the count on every figure.",
  '/now/forest-fire': "India's forest fires, read from the Forest Survey of India's burnt-area record and NASA FIRMS detections, with what each source can and cannot count.",
  '/now/forest-loss': "India's forest loss, read from three sources that disagree — and two of them are not independent, which matters more than the disagreement does.",
  '/now/climate-event': "India's extreme rain, read against IMD's own 24-hour rainfall categories, with the official table behind every figure and what it leaves out.",
  '/impact': 'Every figure Swechha holds, on one page, by programme and by the span it counts. No single total: the figures count overlapping groups of people.',
  '/publications': "Three things Swechha has published, free and whole, with no address asked for: a book about a neighbourhood, a shopper's guide, and one piece of research.",
  '/search': 'Search every page on swechha.in by title, section heading and opening line — or read the whole list below, in the order the site is arranged.',
  '/stories': 'Films made with the people in them, and a poster series that said the same things on paper, in a city that reads walls before it reads reports.',
  '/about': 'Founded in 2000 as We for Yamuna. Swechha is an environmental organisation in Delhi — who does the work, who governs it, and what it has done since.',
  '/act': 'Three ways in: give to an NGO with 80G and 12A, turn up and volunteer, or bring us a ward, a river stretch or a cohort. Every ask on this site lands here.',
  '/farm': 'Five acres in the Aravallis, ninety minutes from Delhi. Day visits, overnight school camps for a hundred students, retreats and stays. One tree became 5,000.',
};

/* THE SHARE CARD AND THE ICONS ARE RELATIVE, DELIBERATELY, and for the same
   reason the canonical is: the origin is only known at request time, so an
   absolute value baked in at build time advertises the preview host on every
   preview deploy. Scrapers resolve a relative og:image against the document
   URL. `og:url` is omitted for the same reason. If a later pass wants absolute
   values they come from SITE_ORIGIN at build time, never from a literal. */
/* ATTRIBUTE-SAFE, BUT NOT esc(). Titles arrive already carrying HTML entities
   (`&mdash;`, `&rsquo;`), so esc()'s `&` -> `&amp;` would render the literal
   text "&mdash;" in a share card. Only the two characters that can break an
   attribute are touched, and an existing entity is left standing. */
const attr = (s) => String(s ?? '').replace(/"/g, '&quot;').replace(/</g, '&lt;');
/* JSON-LD is DATA, not markup: an entity inside a JSON string ships as the
   literal characters "&rsquo;" to a machine reader. The four the titles on this
   site actually use are turned back into their characters, and nothing else is
   — an unknown entity should be visible in the output, not silently dropped. */
const decodeEntities = (s) => String(s ?? '')
  .replace(/&mdash;/g, '—').replace(/&rsquo;/g, '’')
  .replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ');
export const headTags = (title, desc) =>
  '<link rel="icon" href="/icons/icon-32.png" sizes="32x32">'
  + '<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">\n'
  + `<meta name="description" content="${attr(desc)}">\n`
  + '<meta property="og:type" content="website">'
  + '<meta property="og:site_name" content="Swechha">'
  + '<meta property="og:locale" content="en_IN">'
  + `<meta property="og:title" content="${attr(title)}">`
  + `<meta property="og:description" content="${attr(desc)}">`
  + '<meta property="og:image" content="/images/og/og-default.png">'
  + '<meta name="twitter:card" content="summary_large_image">'
  + '<meta name="twitter:site" content="@swechhaindia">';

export async function assemble({ file, title, desc = null, bands, sectionFor, index, sh, pageCss = '', script = '', clashes, note = '', navMark = null, route = null }) {
  /* WHICH NAV WORD THIS PAGE IS STANDING UNDER, derived from the file being
     written rather than passed in, so a generator cannot mark the wrong one.
     The index and all six situations live under `Now`; anything else built
     through this shell (about.html) is not a nav word and marks nothing. */
  const own = file === INDEX_PAGE.file ? INDEX_PAGE.route
    : (FAMILY.find(f => f.file === file)?.route ?? null);
  /* A page that IS a nav word cannot be derived from the family list, because
     the family is the six situations. `impact.html` is `/impact`, which is a
     nav word in its own right, and AD-19 §5 requires `aria-current="page"`
     exactly where the href equals the URL being built. So a generator may
     pass its own mark; passing nothing keeps the derived behaviour, which is
     what the index, the six situations and about.html all rely on. */
  const mark = navMark ?? { current: own ? INDEX_PAGE.label : null, url: own };

  /* ── THE PAGE CARRIES ITS OWN CANONICAL ROUTE. ──────────────────────────
     Two things needed this and neither could have it before. The design audit
     found rel=canonical on 0 of 29 pages while `/` and the raw built path
     answered byte-identically — duplicate content at two indexable URLs. And
     the search generator needs to know which route each built file serves,
     which it cannot ask design-routes.ts because that is TypeScript and CI
     runs Node 22, where a .mjs cannot import it. A second copy of the route
     map is the wrong answer to both; the page stating its own route is the
     right one.

     RELATIVE, NOT ABSOLUTE, and that is deliberate: the origin is only known
     at request time (SITE_ORIGIN, or Vercel's VERCEL_URL), so an absolute
     canonical baked in at build time would advertise the wrong host on every
     preview deploy — the exact defect lib/org.ts was just fixed for.

     DERIVED WHERE IT CAN BE, REQUIRED WHERE IT CANNOT. The index and the six
     situations are in the family register; /impact and /farm pass their own
     nav mark. Anything else has to say so, and the build stops rather than
     emitting a page that cannot say what URL it is. */
  const canonical = route ?? own ?? mark?.url ?? null;
  if (!canonical) {
    console.error(`REFUSING TO WRITE: ${file} has no canonical route. Pass `
      + `route: '/its-path' to assemble() — a page that cannot state its own URL `
      + `cannot be indexed correctly and cannot be found by the search index.`);
    process.exit(1);
  }

  /* AD-27.48. REQUIRED, for the same reason the canonical is. */
  const description = desc ?? DESCRIPTIONS[canonical] ?? null;
  if (!description) {
    console.error(`REFUSING TO WRITE: ${file} (${canonical}) has no meta description. `
      + `Pass desc: '…' to assemble(), or add a row to DESCRIPTIONS in this file.\n`
      + '  140-158 characters, the page\'s subject in the reader\'s words plus one\n'
      + '  verifiable fact. Not tensed, not dated, no reading, no specimen — a\n'
      + '  description is static markup that Google caches (BRANDING §3.5).');
    process.exit(1);
  }
  if (description.length < 140 || description.length > 158) {
    console.error(`REFUSING TO WRITE: ${file}'s description is ${description.length} characters; `
      + 'AD-27.48 sets 140-158. Too short wastes the snippet, too long is truncated mid-clause.');
    process.exit(1);
  }

  const section = ([id, cls]) => {
    const body = sectionFor(id);
    const labelled = !['top', 'strip'].includes(id) ? ` aria-labelledby="${id}-h"` : '';
    const aria = id === 'strip' ? ' aria-label="Readings on this page"' : labelled;
    return `  <section${cls ? ` class="${cls}"` : ''} id="${id}"${aria}>\n${body}\n  </section>`;
  };

  /* ── BREADCRUMBLIST, ON THE SIX SITUATION PAGES ONLY (AD-27.50). ───────
     DERIVED FROM THE CANONICAL ROUTE THIS PAGE ALREADY COMPUTES, so a
     breadcrumb cannot come to disagree with the URL it describes — which is
     the only failure mode this markup has. Three levels: Swechha -> Now ->
     the page. The leaf's name is the page's own <title> with the site suffix
     removed, so it is the same words the reader sees in the tab.
     ONLY /now/* GETS ONE. A breadcrumb on a top-level page would be a
     one-item trail, and the WORK section's is lane 2's, emitted by
     work-shell.mjs from its own route. Nothing else on this site has a
     hierarchy to state.
     THE URLS ARE RELATIVE for the same reason the canonical is: a preview
     deploy must not advertise the production host. JSON-LD resolves a
     relative `item` against the document. */
  const crumbName = String(title).replace(/\s*&mdash;\s*Swechha\s*$/, '').replace(/\s*—\s*Swechha\s*$/, '');
  const CRUMBS = /^\/now\/[a-z-]+$/.test(canonical)
    ? '\n<script type="application/ld+json">' + JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Swechha', item: '/' },
        { '@type': 'ListItem', position: 2, name: 'Now', item: INDEX_PAGE.route },
        { '@type': 'ListItem', position: 3, name: decodeEntities(crumbName), item: canonical },
      ],
    }) + '</script>'
    : '';

  /* AD-28 §7. The extracted behaviours keep their comments; the ledger ids
     inside them do not. `node --check` runs on the redacted text below, so a
     scanner mistake stops the build rather than shipping broken script. */
  const SCRIPT = redactScriptLedgerRefs(`${sh.SCRIPT_BASE}\n${script}`);
  /* AD-28 §7. The document is assembled, then stripped of HTML comments, and
     its stylesheet of CSS comments. The frozen chrome's annotations and this
     shell's own design record are developer documentation; they are not the
     reader's business and they are not what the acceptance test is over. Every
     gate below runs on the STRIPPED text, so what is checked is exactly what is
     written. */
  const OUT = stripHtmlComments(`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark">
<title>${title}</title>
<link rel="canonical" href="${canonical}">
${headTags(title, description)}
${sh.HEAD_FONTS}
<style>
${stripCssComments([sh.CSS, sh.SITUATION_CSS, SHARED_PAGE_CSS, pageCss].join('\n'))}</style>
</head>
<body>
${sh.SVG_DEFS}
${sh.SKIP}
${header(index, { ...mark, page: canonical })}
<main id="main" tabindex="-1">
${bands.map(section).join('\n')}
</main>
${sh.FOOTER}${CRUMBS}
<script>
${SCRIPT}</script>
</body>
</html>
`);

  if (sh.bad > 0) {
    console.error(`\nREFUSING TO WRITE: ${sh.bad} extraction assertion(s) failed. The ranges moved — re-find them, do not delete the assertion.`);
    process.exit(1);
  }
  if (clashes > 0) { console.error('\nREFUSING TO WRITE: ground adjacency fails.'); process.exit(1); }

  /* ── GATE: EVERY BAND HEADING IS INSIDE A GUTTER ──────────────────────
     `.im-head` has no padding of its own; the gutter is on `.wrap`. An
     `.im-head` that is a direct child of `<section>` therefore renders hard
     against the screen edge — a defect that is invisible in a diff, survives
     a contrast audit and an overflow check, and shipped once on this page.
     Checked structurally rather than by eye, because by eye is how it got
     through. */
  const stray = [];
  const re = /<div class="im-head[^"]*"/g;
  let m;
  while ((m = re.exec(OUT)) !== null) {
    // Walk back to the nearest opening div and confirm it is a .wrap.
    const before = OUT.slice(Math.max(0, m.index - 400), m.index);
    const opens = [...before.matchAll(/<div class="([^"]*)"|<(section)\b/g)];
    const last = opens[opens.length - 1];
    if (!last || !(last[1] || '').split(/\s+/).includes('wrap')) {
      const line = OUT.slice(0, m.index).split('\n').length;
      stray.push(line);
    }
  }
  if (stray.length) {
    console.error(`\nREFUSING TO WRITE: ${stray.length} band heading(s) are not inside a .wrap, ` +
      `so they would render with no left gutter. Lines: ${stray.join(', ')}.\n` +
      `  .im-head has no padding of its own — the gutter is .wrap's padding:0 var(--gut).\n` +
      `  Use opener(), which carries its own .wrap.`);
    process.exit(1);
  }

  /* ═══ GATE — AD-28 §7. THE LEDGER MAY NOT COME BACK ═══════════════════
     The mechanical acceptance test, applied to this page before it is written.
     `lib/provenance.test.ts` runs the same five patterns over all thirty-five
     built files on disk, which catches a page nobody rebuilt; this catches the
     page being built RIGHT NOW and names the generator that did it, which is
     the difference between a red suite and a fixable error.

     IT RUNS ON THE STRIPPED TEXT, deliberately. The three strippers above are
     the mechanism; this is the proof they fired. If a stripper ever mis-scans
     and leaves half a comment behind, the build stops here instead of shipping
     a page that reads clean and greps dirty.

     INVERTED, NOT DELETED (AD-28 §6). Several gates in this repo used to
     REQUIRE this material — build-about-page.mjs's Ask-CSS gate asserted the
     presence of the sentinel comment "AD-27.16 THE ASK" and went red the moment
     the strip landed. That gate now asserts the opposite. This is the same move
     made once, centrally, for every page built through this shell. */
  const AD28 = [
    [/SOURCE-FACTS/, 'a citation into a working file in this repository. A reader cannot follow one, cannot check one, and was never meant to see one.'],
    [/§/, 'a section-mark citation into a repository ledger. The line numbers behind them drift the moment the ledger is edited.'],
    [/\bAD-2\d/, 'an internal design-ruling id.'],
    [/\bD-0\d/, 'an internal decision id.'],
    [/\bW-1\d/, 'an internal WORK-pass ruling id.'],
  ];
  const struck = [];
  for (const [re, why] of AD28) {
    const m = re.exec(OUT);
    if (m) {
      struck.push(`  ${JSON.stringify(m[0])} — ${why}\n    Context: `
        + JSON.stringify(OUT.slice(Math.max(0, m.index - 80), m.index + 80).replace(/\s+/g, ' ')));
    }
  }
  if (struck.length) {
    console.error(`\nREFUSING TO WRITE: ${file} carries ${struck.length} internal ledger `
      + `reference(s) that would ship to a reader (AD-28 §7).\n${struck.join('\n')}\n`
      + '  These are normally stripped: HTML comments by stripHtmlComments(), CSS comments by\n'
      + '  stripCssComments(), script comments redacted by redactScriptLedgerRefs(). One reaching\n'
      + '  here means it is in reader-visible text, or a stripper mis-scanned. Do NOT delete the\n'
      + '  comment in the .mjs — that is the design record and it is out of AD-28\'s scope.');
    process.exit(1);
  }

  const jsPath = join(tmpdir(), `swechha-${file.replace(/\W+/g, '-')}-check.js`);
  writeFileSync(jsPath, SCRIPT);
  const { execFileSync } = await import('node:child_process');
  try {
    execFileSync(process.execPath, ['--check', jsPath], { stdio: 'pipe' });
    console.log('page script (all of it): node --check PASSED');
  } catch (e) {
    console.error('\nREFUSING TO WRITE: page script is not valid JS.\n' + e.stderr.toString());
    process.exit(1);
  }

  writeFileSync(join(V3, file), OUT);
  console.log(`WROTE ${file} — ${OUT.length.toLocaleString('en-IN')} bytes, ${OUT.split('\n').length.toLocaleString('en-IN')} lines`);
  if (note) console.log(`  ${note}`);
  return OUT;
}
