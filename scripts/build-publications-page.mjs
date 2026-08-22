/* ═══════════════════════════════════════════════════════════════════════════
   PUBLICATIONS  →  public/_pages/v3/publications.html, routed at /publications
   ───────────────────────────────────────────────────────────────────────────
   AD-26 R-1: Publications carries the KHD book.
   AD-26 R-2: the "This Girl Can book" is WITHDRAWN — named, then struck, and
              no book file was ever found for it. Gate 3 keeps it withdrawn,
              because the earlier instruction is still in the ledger and a
              future session reading only that would re-add it.
   AD-26 R-5: the poster series belongs in Stories, NOT here. Gate 4.

   ★ EVERY FILE SIZE IS READ OFF DISK, NEVER TYPED.
   The page tells a reader how large a download is before they start it — on a
   phone in Delhi that is the difference between a considered click and a
   wasted 10 MB. A typed figure drifts the first time a PDF is re-exported, so
   the number is computed and the build dies if the file is not there. Gate 1.

   ★ THE PRINT MASTERS ARE NOT IN THIS REPO AND MUST NOT BE ADDED.
   `All posters final.pdf` is 102 MB — over GitHub's hard 100 MB per-file limit
   — and `cover print pdf.pdf` is 30 MB. Both are print-production artefacts
   whose content is already on the site as the individual poster JPEGs in
   Stories. What ships is the reading copy of each publication. Gate 2 fails if
   a linked file is large enough to suggest a print master crept in.
   ═══════════════════════════════════════════════════════════════════════════ */
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import * as S from './lib/situation-shell.mjs';
const { esc, opener, hole, ARROW } = S;

const sh = S.shell();

/* ═══ DATA ═══════════════════════════════════════════════════════════════ */
const D = JSON.parse(readFileSync(join(S.ROOT, 'data/publications.json'), 'utf8'));

/* A reading copy is a few megabytes. Anything past this is a print master and
   does not belong on a web page, whatever it is called. */
const MAX_MB = 24;

let dataBad = 0;
const dataFail = (m) => { console.error(`DATA IS WRONG: ${m}`); dataBad++; };

const mb = (bytes) => {
  const v = bytes / (1024 * 1024);
  return v < 10 ? v.toFixed(1) : String(Math.round(v));
};

const ITEMS = D.items.entries.map((e) => {
  const abs = join(S.ROOT, 'public', e.file.replace(/^\//, ''));
  if (!existsSync(abs)) {
    dataFail(`"${e.slug}" links ${e.file}, which is not on disk at public${e.file}.`);
    return { ...e, bytes: 0, mb: '0' };
  }
  const bytes = statSync(abs).size;
  if (bytes / (1024 * 1024) > MAX_MB) {
    dataFail(`"${e.slug}" links ${e.file} at ${mb(bytes)} MB, past the ${MAX_MB} MB reading-copy limit — that looks like a print master.`);
  }
  return { ...e, bytes, mb: mb(bytes) };
});

if (dataBad) {
  console.error(`\nREFUSING TO WRITE: ${dataBad} data check(s) failed.`);
  process.exit(1);
}

/* ═══ BANDS ══════════════════════════════════════════════════════════════ */
const ALL_BANDS = [
  ['top',     't1',        '#0D0D0B'],
  ['items',   'paper t2',  '#F3F2F0'],
  ['waiting', 'dark-2 t2', '#151512'],
  ['act',     't3',        '#0D0D0B'],
];
const LIVE = { waiting: D.waiting.claims.length > 0 };
const BANDS = ALL_BANDS.filter(([id]) => LIVE[id] !== false);
const clashes = S.groundChain(BANDS);

const INDEX_ALL = [
  ['Two we printed', '#top'], ['The publications', '#items'],
  ['What is not here', '#waiting'], ['Print with us', '#act'],
];
const BAND_IDS = new Set(BANDS.map((b) => b[0]));
const INDEX = INDEX_ALL.filter(([, href]) => BAND_IDS.has(href.slice(1)));

const B = {};

/* ── BAND 1. MASTHEAD. ───────────────────────────────────────────────────── */
const M = D.masthead;
B.top = () => `    <div class="pic ht">
      <img class="duo" src="${M.frame.src}" alt="${esc(M.frame.alt)}" style="--op:${M.frame.op}">
      <div class="pic-over"><div class="wrap">
        <p class="lbl eyebrow">${esc(M.kicker)}</p>
        <h1 class="d1">${M.h1}</h1>
      </div></div>
    </div>
    <div class="pic-body"><div class="wrap">
      <p class="lead">${esc(M.lead)}</p>
    </div></div>`;

/* ── BAND 2. THE PUBLICATIONS. ────────────────────────────────────────────
   The size and the file type sit ON the button, not in small print beside it.
   A reader on a metered connection is entitled to know what a click costs
   before they spend it.

   NO `download` ATTRIBUTE, DELIBERATELY. The button says "Read the book", and
   `download` forces a save dialogue instead of opening the browser's own PDF
   viewer — which makes the button do something other than what it promises,
   and on a phone drops a 10 MB file into a downloads folder the reader then
   has to go find. Gate 10 keeps it off. */
B.items = () => `${opener('items', D.items.head, D.items.lead)}
    <div class="wrap">
      <div class="pb-set">
${ITEMS.map((it) => `        <article class="pb-i" id="pub-${esc(it.slug)}">
          <p class="lbl pb-k">${esc(it.kind)} &middot; ${esc(it.year)}</p>
          <h3 class="d2 pb-h">${esc(it.title)}</h3>
          <p class="pb-l">${esc(it.lead)}</p>
          <p><a class="b b-1" href="${esc(it.file)}">${esc(it.cta)} <span class="pb-sz">PDF, ${it.mb} MB</span>${ARROW}</a></p>
        </article>`).join('\n')}
      </div>
    </div>`;

/* ── BAND 3. WHAT IS NOT HERE. ───────────────────────────────────────────── */
B.waiting = () => `${opener('waiting', D.waiting.head, D.waiting.lead)}
    <div class="wrap">
${D.waiting.claims.map((c) => hole(c)).join('\n')}
    </div>`;

/* ── BAND 4. ACT. ────────────────────────────────────────────────────────── */
B.act = () => `${opener('act', D.act.head, D.act.lead)}
    <div class="wrap">
      <p><a class="b b-1" href="${esc(D.act.href)}">${esc(D.act.cta)}${ARROW}</a></p>
    </div>`;

/* ═══ PAGE CSS ═══════════════════════════════════════════════════════════ */
const PAGE_CSS = `
.pb-set{display:grid;gap:clamp(28px,4vw,52px);margin-top:clamp(20px,3vw,32px);
  grid-template-columns:repeat(auto-fit,minmax(320px,1fr))}
.pb-i{display:grid;gap:10px;align-content:start;min-width:0;
  border-top:2px solid currentColor;padding-top:clamp(14px,2vw,20px)}
.pb-k{color:var(--fg-2);margin:0}
.pb-h{margin:0}
.pb-l{margin:0;max-width:56ch}
.pb-sz{opacity:.72;font-variant-numeric:tabular-nums}
@media (max-width:640px){.pb-set{grid-template-columns:minmax(0,1fr)}}
`;

/* ═══ WRITE ══════════════════════════════════════════════════════════════ */
const OUT = await S.assemble({
  file: 'publications.html',
  title: 'Publications &mdash; Swechha',
  bands: BANDS, index: INDEX, sh, clashes,
  pageCss: PAGE_CSS,
  sectionFor: (id) => (B[id] || (() => '    <div class="wrap"><p class="lead">&mdash;</p></div>'))(),
  note: `${BANDS.length} bands + footer. ${ITEMS.length} publications `
      + `(${ITEMS.map((i) => `${i.mb} MB`).join(', ')}), ${D.waiting.claims.length} named holes.`,
});

/* ═══ POST-WRITE GATES ═══════════════════════════════════════════════════ */
let fail = 0;
const gate = (ok, msg) => { if (!ok) { console.error(`  FAIL ${msg}`); fail++; } else console.log(`  ok   ${msg}`); };
console.log('\nGATES');

const RENDERED = OUT.replace(/<style[\s\S]*?<\/style>/g, ' ')
  .replace(/<script[\s\S]*?<\/script>/g, ' ')
  .replace(/<!--[\s\S]*?-->/g, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&mdash;|&middot;|&nbsp;/g, ' ')
  .replace(/\s+/g, ' ');

/* 1. EVERY LINKED DOCUMENT EXISTS, AND ITS SIZE ON THE PAGE IS ITS SIZE ON
      DISK. Re-derived from the rendered HTML, so a template that prints the
      wrong item's figure fails here. */
const docs = [...OUT.matchAll(/href="(\/docs\/[^"]+)"/g)].map((m) => m[1]);
const gone = docs.filter((d) => !existsSync(join(S.ROOT, 'public', d.slice(1))));
gate(gone.length === 0, `all ${docs.length} linked documents exist${gone.length ? `; MISSING: ${gone.join(', ')}` : ''}`);
const sizeWrong = ITEMS.filter((it) => !RENDERED.includes(`PDF, ${it.mb} MB`));
gate(sizeWrong.length === 0, `every download states its real size${sizeWrong.length ? `; WRONG: ${sizeWrong.map((i) => i.slug).join(', ')}` : ''}`);

/* 2. NO PRINT MASTER. Belt and braces over the data check, on the rendered
      output: nothing linked here may be large enough to be one. */
const big = docs.filter((d) => statSync(join(S.ROOT, 'public', d.slice(1))).size / (1024 * 1024) > MAX_MB);
gate(big.length === 0, `nothing linked is past the ${MAX_MB} MB reading-copy limit${big.length ? `; FOUND: ${big.join(', ')}` : ''}`);

/* 3. THE WITHDRAWAL HOLDS (R-2). The earlier instruction naming a "This Girl
      Can book" is still in the ledger; this page may not act on it. */
gate(!/this\s*girl\s*can\b/i.test(RENDERED) || /withdrawn/i.test(RENDERED),
  'the This Girl Can book is not published as a publication (R-2 withdrawal)');

/* 4. THE POSTERS ARE NOT HERE (R-5). They belong in Stories, and the one way
      this page goes wrong is by becoming a dumping ground for everything in
      the same source folder. */
const posterImgs = [...OUT.matchAll(/src="(\/images\/posters\/[^"]+)"/g)].map((m) => m[1]);
gate(posterImgs.length === 0, `the poster series is not on this page (R-5)${posterImgs.length ? `; FOUND: ${posterImgs.length}` : ''}`);

/* 5. NO DEAD OR PROTOTYPE HREF. */
const hrefs = [...OUT.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
const dead = hrefs.filter((h) => h === '#' || h.startsWith('/design/') || h.startsWith('/_pages/'));
gate(dead.length === 0, `no dead or prototype href${dead.length ? `; FOUND: ${[...new Set(dead)].join(', ')}` : ''}`);

/* 6. EVERY IMAGE CARRIES ALT TEXT. */
const noAlt = [...OUT.matchAll(/<img(?![^>]*\balt=)[^>]*>/g)].map((m) => m[0].slice(0, 60));
gate(noAlt.length === 0, `every image has alt text${noAlt.length ? `; FOUND: ${noAlt.join(' | ')}` : ''}`);

/* 7. NO tel: LINK. */
gate(!/href="tel:/i.test(OUT), 'no tel: link (the struck number does not return)');

/* 8. NOTHING ASKS WHO THE READER IS. The masthead promises "no address asked
      for"; a form on this page would make that a lie. */
gate(!/<form/i.test(OUT) && !/type="email"/i.test(OUT),
  'no form and no email field — the downloads ask nothing of the reader');

/* 10. THE BUTTONS DO WHAT THEY SAY. "Read" must not force a save. */
gate(!/<a[^>]+\/docs\/[^>]*\sdownload[\s>]/.test(OUT),
  'no download attribute — "Read the book" opens the reader, it does not force a save');

/* 9. THE GROUND CHAIN DOES NOT CLASH. */
gate(clashes === 0, `${clashes} ground clash(es)`);

console.log(`\n${OUT.length.toLocaleString('en-IN')} bytes. ${fail ? `${fail} gate(s) failed. The file is written — fix the generator and rebuild.` : 'All gates pass.'}`);
if (fail) process.exit(1);
