/* ═══════════════════════════════════════════════════════════════════════════
   THE FIVE ESSAYS  →  public/_pages/v3/stories/<slug>.html, at /stories/<slug>
   ───────────────────────────────────────────────────────────────────────────
   OWNER'S RULING, 22 August 2026: "publish them. Unsourced data is allowed
   other than on situation pages." That reverses a gate added earlier the same
   day which refused any story carrying no source — and the reversal is right,
   because the two things are not the same claim. A situation page is the
   organisation measuring something, and every figure on one is asserted against
   a committed dataset. An essay is a named person's argument on a date. So this
   build does not ask for sources. It asks for PROVENANCE, and refuses without
   it: a byline, a date, and a link to where the piece first appeared.

   ★ THE PROSE IS EXTRACTED, NOT INLINED.
   The WordPress export is Brizy page-builder markup — 502 divs, 204 spans,
   inline <style> blocks, data-brz-* attributes. Inlining it would drag another
   site's layout engine into this one. So the paragraphs, headings and lists are
   read out in document order and re-emitted as clean semantic HTML.
   AND THE EXTRACTION IS CHECKED: gate 2 compares the words that survive
   against the words in the source file, and fails if prose went missing. An
   extractor that silently drops half an essay is worse than no extractor,
   because the page still looks finished.

   ★ THE TITLE AND BYLINE ARE STRIPPED FROM THE BODY.
   Both originals put them in the first two <h2>s. Left in, every page would
   print its own title twice — once as the h1 this design gives it and once as
   the first line of the prose.

   ★ NO ILLUSTRATIONS, AND THAT IS NOT A DESIGN CHOICE.
   Every <img> in the export points at http://q7s.734.mytemp.website/, the
   staging domain the legacy audit found across the old site; it 301s to
   nothing and the swechha.in rewrite 404s. They also carry empty alt text. The
   Written band on /stories names this rather than leaving a reader to wonder.
   ═══════════════════════════════════════════════════════════════════════════ */
import { readFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import * as S from './lib/situation-shell.mjs';
const { esc, opener, hole, ARROW } = S;

const sh = S.shell();

const D = JSON.parse(readFileSync(join(S.ROOT, 'data/essays.json'), 'utf8'));
const INDEX = JSON.parse(readFileSync(join(S.ROOT, 'content/essay/_index.json'), 'utf8'));

let bad = 0;
const dataFail = (m) => { console.error(`DATA IS WRONG: ${m}`); bad++; };

/* ── PROVENANCE, NOT SOURCING. Refused without all three. ────────────────── */
for (const e of INDEX) {
  if (!e.byline) dataFail(`essay "${e.slug}" has no byline; an essay is published under a name or not at all.`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(e.date || '')) dataFail(`essay "${e.slug}" has no usable date.`);
  if (!/^https?:\/\//.test(e.original || '')) dataFail(`essay "${e.slug}" has no link to where it first appeared.`);
  if (!existsSync(join(S.ROOT, 'content/essay', `${e.slug}.html`))) dataFail(`essay "${e.slug}" has no prose file.`);
}
if (bad) { console.error(`\nREFUSING TO WRITE: ${bad} data check(s) failed.`); process.exit(1); }

/* ═══ EXTRACTION ═════════════════════════════════════════════════════════ */
const ENT = { '&nbsp;': ' ', '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"' };
const plainOf = (h) => String(h ?? '')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&[a-z]+;|&#\d+;/gi, (m) => ENT[m] ?? ' ')
  .replace(/\s+/g, ' ').trim();

/* Inline markup that may survive into the page. Anything else is stripped:
   the export's spans and divs carry Brizy classes and nothing semantic. */
const keepInline = (s) => s
  .replace(/<\/?(span|div|section|picture|source|figure|figcaption)\b[^>]*>/gi, '')
  .replace(/<(?!\/?(strong|em|b|i|sup|sub|a|br)\b)[^>]*>/gi, '')
  /* AND STRIP THEIR ATTRIBUTES. The whitelist above admits the tag, and the
     first version admitted its attributes with it — so <strong
     class="brz-cp-color2"> walked straight through and the page-builder gate
     caught page-builder markup on all five pages. Only <a> keeps anything, and
     only its href, rebuilt below. */
  .replace(/<(strong|em|b|i|sup|sub|br)\b[^>]*>/gi, '<$1>')
  /* Links out of an essay are kept but made safe and explicit. */
  .replace(/<a\b([^>]*)>/gi, (m, attrs) => {
    const href = (attrs.match(/href="([^"]*)"/i) || [])[1];
    return href && /^https?:\/\//.test(href)
      ? `<a href="${esc(href)}" rel="noopener">` : '<a>';
  })
  .replace(/\s+/g, ' ').trim();

function extract(src) {
  let s = src.replace(/<style[\s\S]*?<\/style>/gi, ' ')
             .replace(/<(script|noscript)[\s\S]*?<\/\1>/gi, ' ');
  const out = [];
  for (const m of s.matchAll(/<(p|h2|h3|li|blockquote)\b[^>]*>([\s\S]*?)<\/\1>/gi)) {
    const tag = m[1].toLowerCase();
    const inner = keepInline(m[2]);
    const text = plainOf(inner);
    if (text.length < 2) continue;
    out.push({ tag, inner, text });
  }
  return out;
}

const ESSAYS = INDEX.map((e) => {
  const src = readFileSync(join(S.ROOT, 'content/essay', `${e.slug}.html`), 'utf8');
  let blocks = extract(src);
  /* The first two headings are the title and the "– by Name" line. Dropped by
     MATCHING them rather than by taking the first two, so a piece formatted
     differently does not silently lose its opening paragraph. */
  blocks = blocks.filter((b) => {
    const t = b.text.toLowerCase();
    if (b.tag !== 'h2') return true;
    if (t.startsWith('– by') || t.startsWith('- by') || /^by\s/.test(t)) return false;
    const title = e.title.toLowerCase().replace(/[^a-z ]/g, '');
    return !(t.replace(/[^a-z ]/g, '').includes(title.slice(0, 24)));
  });
  return { ...e, blocks, sourceWords: plainOf(src).split(' ').length };
});

/* ═══ ONE PAGE PER ESSAY ═════════════════════════════════════════════════ */
mkdirSync(join(S.V3, 'stories'), { recursive: true });

const MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December'];
const longDate = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MON[m - 1]} ${y}`;
};

const BANDS = [
  ['top',  't1',       '#0D0D0B'],
  ['read', 'paper t2', '#F3F2F0'],
  ['act',  't3',       '#0D0D0B'],
];

let written = 0, fail = 0;
const gate = (ok, msg) => { if (!ok) { console.error(`  FAIL ${msg}`); fail++; } else console.log(`  ok   ${msg}`); };

console.log('ESSAYS');
for (const e of ESSAYS) {
  const clashes = S.groundChain(BANDS);
  const INDEX_CHIPS = [['The essay', '#top'], ['Read', '#read'], ['Write for us', '#act']];
  const B = {};

  B.top = () => `    <div class="wrap es-mast">
      <p class="lbl eyebrow">${esc(D.masthead.kicker)}</p>
      <h1 class="d1">${esc(e.title)}</h1>
      <p class="lead es-by">By ${esc(e.byline)}</p>
      <p class="cap es-prov">${esc(D.masthead.provenance_prefix)} on ${longDate(e.date)}. `
      + `<a class="act" href="${esc(e.original)}" rel="noopener">The original${ARROW}</a></p>
      <p class="cap es-note">${esc(D.masthead.figures_note)}</p>
    </div>`;

  B.read = () => `    <div class="wrap es-body">
${e.blocks.map((b) => b.tag === 'li' ? null : `      <${b.tag}>${b.inner}</${b.tag}>`)
    .filter(Boolean).join('\n')}
${(() => {
    /* List items are re-wrapped in a single ul: the export emits <li> without
       a surviving parent once the Brizy divs are stripped, and a bare <li> is
       invalid and reads as an unindented paragraph. */
    const lis = e.blocks.filter((b) => b.tag === 'li');
    return lis.length ? `      <ul class="es-list">\n${lis.map((b) => `        <li>${b.inner}</li>`).join('\n')}\n      </ul>` : '';
  })()}
    </div>`;

  B.act = () => `${opener('act', D.act.head, D.act.lead)}
    <div class="wrap">
      <p><a class="b b-1" href="${esc(D.act.href)}">${esc(D.act.cta)}${ARROW}</a>
         <a class="act es-back" href="${esc(D.back.href)}">${esc(D.back.label)}${ARROW}</a></p>
    </div>`;

  const PAGE_CSS = `
.es-mast{padding-top:clamp(28px,6vw,72px);padding-bottom:clamp(20px,3vw,40px);max-width:52rem}
.es-by{margin:clamp(14px,2vw,20px) 0 0}
.es-prov{margin:10px 0 0;color:var(--fg-2)}
.es-note{margin:6px 0 0;color:var(--fg-2);max-width:52ch}
.es-body{max-width:38rem;padding-top:clamp(24px,4vw,56px);padding-bottom:clamp(24px,4vw,56px)}
.es-body p{margin:0 0 1.1em}
.es-body h2,.es-body h3{margin:1.8em 0 .5em}
.es-list{margin:0 0 1.1em;padding-left:1.2em}
.es-list li{margin:0 0 .5em}
.es-back{margin-left:clamp(12px,2vw,24px)}
`;

  const OUT = await S.assemble({
    file: join('stories', `${e.slug}.html`),
    route: `/stories/${e.slug}`,
    title: `${e.title} &mdash; Swechha`,
    bands: BANDS, index: INDEX_CHIPS, sh, clashes,
    pageCss: PAGE_CSS,
    sectionFor: (id) => (B[id] || (() => '    <div class="wrap"><p class="lead">&mdash;</p></div>'))(),
    note: `${e.blocks.length} blocks, ${e.words} words, by ${e.byline}, ${e.date}.`,
  });

  /* ── PER-PAGE GATES ───────────────────────────────────────────────────── */
  const kept = e.blocks.reduce((n, b) => n + b.text.split(' ').length, 0);
  /* 2. NO PROSE LOST. The title and byline headings are removed on purpose, so
        a small shortfall is expected; anything past 8% means the extractor ate
        real writing. */
  const ratio = kept / e.words;
  gate(ratio > 0.92, `${e.slug}: ${kept} of ${e.words} words survived extraction (${(ratio * 100).toFixed(1)}%)`);
  /* 3. THE BYLINE AND THE DATE REACH THE PAGE. */
  gate(OUT.includes(`By ${e.byline}`), `${e.slug}: the byline is on the page`);
  gate(OUT.includes(longDate(e.date)), `${e.slug}: the publication date is on the page`);
  gate(OUT.includes(e.original), `${e.slug}: links to where it first appeared`);
  /* 4. NO BRIZY MARKUP SURVIVED. */
  gate(!/brz-|data-brz|data-uniq-id/.test(OUT), `${e.slug}: no page-builder markup survived`);
  /* 5. NO IMAGE POINTING AT THE DEAD STAGING HOST. */
  gate(!/mytemp\.website/.test(OUT), `${e.slug}: nothing points at the dead staging domain`);
  /* 6. NO DEAD HREF. */
  const dead = [...OUT.matchAll(/href="([^"]+)"/g)].map((m) => m[1])
    .filter((h) => h === '#' || h.startsWith('/design/') || h.startsWith('/_pages/'));
  gate(dead.length === 0, `${e.slug}: no dead or prototype href`);
  written++;
}

console.log(`\n${written} essay page(s). ${fail ? `${fail} gate(s) failed.` : 'All gates pass.'}`);
if (fail) process.exit(1);
