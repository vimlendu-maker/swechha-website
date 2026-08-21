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
export const V3 = join(ROOT, 'public/design/v3');
export const DATA = join(ROOT, 'data');

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
  const home = extractor(join(V3, 'home.html'));
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
  const JS_UNDERLINE = home.iife('D-09.4. WHERE AM I? THE ACTIVE-SECTION UNDERLINE');

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
  const SCRIPT_BASE = [JS_TABS, JS_NAVIDX, JS_UNDERLINE].join('\n\n');

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

// The site's primary nav, identical on every situation page. `Now` points at
// the situation index, which is where a reader goes to find the other five.
export const NAV = [
  ['Now', '/design/v3/intelligence.html'],
  ['Work', '/design/v3/home.html#work'],
  ['Journeys', '/design/v3/home.html#journeys'],
  ['Impact', '/design/v3/home.html#impact'],
  ['Farm', '/design/v3/home.html#farm'],
  ['Record', '/design/v3/home.html#record'],
];

export const header = (index) => `<header class="nav"><div class="nav-in"><a class="mark" href="/design/v3/home.html" aria-label="Swechha"><img src="/brand/swechha-horizontal-white-approved.png" alt="Swechha"></a><nav class="navlinks" aria-label="Primary">${NAV.map(([t, h]) => `<a class="nl" href="${h}">${t}</a>`).join('')}</nav><button type="button" class="navidx-t" aria-expanded="false" aria-controls="navidx">Sections</button>
<div class="navidx" id="navidx" hidden><nav aria-label="All sections">${index.map(([t, h]) => `<a class="nl" href="${h}">${t}</a>`).join('')}</nav></div><a class="give" href="/design/v3/home.html#give">Give</a></div><nav class="navscroll" aria-label="Sections"><ul>${index.map(([t, h]) => `<li><a class="nl" href="${h}">${t}</a></li>`).join('')}</ul></nav></header>`;

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
export const INDEX_PAGE = { file: 'intelligence.html', route: '/design/v3/intelligence.html', label: 'Now' };

export const FAMILY = [
  { id: 'air',      name: 'Air',           where: 'Delhi', file: 'situation-air.html' },
  { id: 'yamuna',   name: 'Yamuna',        where: 'Delhi', file: 'situation-yamuna.html' },
  { id: 'heatwave', name: 'Heat',          where: 'India', file: 'situation-heatwave.html' },
  { id: 'fire',     name: 'Forest fire',   where: 'India', file: 'situation-forest-fire.html' },
  { id: 'loss',     name: 'Forest loss',   where: 'India', file: 'situation-forest-loss.html' },
  { id: 'climate',  name: 'Climate event', where: 'India', file: 'situation-climate-event.html' },
];
const href = (f) => `/design/v3/${f}`;
export const familyHref = (id) => {
  const m = FAMILY.find(f => f.id === id);
  if (!m) throw new Error(`"${id}" is not in FAMILY: ${FAMILY.map(f => f.id).join(', ')}`);
  return href(m.file);
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
          ${rest.map(f => `<a class="fam-sib" href="${href(f.file)}">
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
export const SHARED_PAGE_CSS = `
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

/* ═══ ASSEMBLE AND THE WRITE GATES ═══════════════════════════════════════ */

/**
 * Build the document and write it — but only if every gate passes.
 * Gates, in order: extraction assertions, ground adjacency, and `node --check`
 * on the WHOLE page script, extracted and hand-written together. Checking only
 * one half leaves the other unchecked, which is the same bug on a different
 * line (SITUATION-PAGE-TEMPLATE.md §2).
 */
export async function assemble({ file, title, bands, sectionFor, index, sh, pageCss = '', script = '', clashes, note = '' }) {
  const section = ([id, cls]) => {
    const body = sectionFor(id);
    const labelled = !['top', 'strip'].includes(id) ? ` aria-labelledby="${id}-h"` : '';
    const aria = id === 'strip' ? ' aria-label="Readings on this page"' : labelled;
    return `  <section${cls ? ` class="${cls}"` : ''} id="${id}"${aria}>\n${body}\n  </section>`;
  };

  const SCRIPT = `${sh.SCRIPT_BASE}\n${script}`;
  const OUT = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark">
<title>${title}</title>
${sh.HEAD_FONTS}
<style>
${sh.CSS}
${sh.SITUATION_CSS}
${SHARED_PAGE_CSS}
${pageCss}</style>
</head>
<body>
${sh.SVG_DEFS}
${sh.SKIP}
${header(index)}
<main id="main" tabindex="-1">
${bands.map(section).join('\n')}
</main>
${sh.FOOTER}
<script>
${SCRIPT}</script>
</body>
</html>
`;

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
