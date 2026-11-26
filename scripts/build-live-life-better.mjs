// /live-life-better — a one-page project microsite, sibling of /healthy-cities
// and built the same way: out of data/live-life-better/programme.json through
// the shared WORK shell, with no number typed into this file. Derived from
// scripts/build-healthy-cities.mjs; everything that concerned fellows, reach,
// horizon, voices or staff is gone, and the generic gates are kept.
//
// Decisions worth knowing before editing:
//  - Band ids are top, what, kinds, workshops, gardens, statement, zero-waste,
//    films, schools, learned, watch, with, onward. Grounds are derived by
//    bandChain, never typed.
//  - The schools band is a register of rows that do NOT link anywhere: there
//    are no sub-pages, so the row is a div and a link to itself would be a
//    control that does nothing.
//  - There is no voices band, because no student or teacher quote has been
//    supplied. A band with no content is omitted, not stubbed.
//  - The One Planet Network logo is a partner mark: it renders in colour, lives
//    under /images/partners/, sits in the with band only, and is not in the
//    photograph library. UNEP is credited in type; no UNEP emblem is used.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import * as S from './lib/situation-shell.mjs';
import * as W from './lib/work-shell.mjs';
import { seo } from './lib/seo-register.mjs';
import { imageSize } from './lib/jpeg-size.mjs';

const { esc, ARROW } = S;
const sh = W.workShell();

const DIR = join(S.ROOT, 'data/live-life-better');
const PROG = JSON.parse(readFileSync(join(DIR, 'programme.json'), 'utf8'));
const BD = PROG.bands;

const ENT = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: '\'', rsquo: '’', lsquo: '‘',
  ldquo: '“', rdquo: '”', mdash: '—', ndash: '–', nbsp: ' ', middot: '·', hellip: '…', deg: '°',
};
const plain = (s) => String(s ?? '').replace(/&(\w+);/g, (m, k) => (k in ENT ? ENT[k] : m));

let bad = 0;
const dataFail = (m) => { console.error(`DATA IS WRONG: ${m}`); bad++; };

/* ═══ DATA GATES — before a line of HTML is built ═══════════════════════ */
const IDS = ['top', 'what', 'kinds', 'workshops', 'gardens', 'statement', 'zero-waste',
  'films', 'schools', 'learned', 'watch', 'with', 'onward'];
const DELIVERABLES = ['workshops', 'gardens', 'zero-waste', 'films'];
for (const k of IDS) {
  if (!BD[k] || !Object.keys(BD[k]).length) dataFail(`bands.${k} is missing from programme.json.`);
}

const FIG_BANDS = Object.keys(BD).filter(id => Array.isArray(BD[id] && BD[id].figures) && BD[id].figures.length);
const BAND_FIG = FIG_BANDS.flatMap(id => BD[id].figures.map(f => ({ ...f, where: `bands.${id}` })));
const ALL_FIG = [...PROG.figures.map(f => ({ ...f, where: 'the masthead rail' })), ...BAND_FIG];
for (const f of ALL_FIG) {
  if (!f.period) dataFail(`${f.where}: figure "${f.label}" has no period.`);
  if (!['counted', 'modelled', 'planned'].includes(f.basis)) dataFail(`${f.where}: figure "${f.label}" has basis "${f.basis}".`);
  if (!f.source) dataFail(`${f.where}: figure "${f.label}" has no source.`);
  if (f.basis === 'planned' && !/proposal/i.test(f.source)) dataFail(`${f.where}: a planned figure is sourced to the proposal.`);
}
if (PROG.figures.length !== W.FIGURE_RAIL_MAX) dataFail(`the masthead rail is authored at ${W.FIGURE_RAIL_MAX} cells.`);
for (const id of FIG_BANDS) {
  if (BD[id].figures.length < W.FIGURE_RAIL_MIN) dataFail(`bands.${id} has one figure; a group is two or more.`);
}
/* The sentence in the head and the sentence in the data are one string. */
if (seo('/live-life-better').description !== plain(PROG.description)) {
  dataFail('data/seo/pages.json description for /live-life-better is not programme.json\'s own.');
}
if (PROG.schools.length !== PROG.figures.find(f => /Partner schools/.test(f.label)).value * 1) {
  dataFail(`programme.schools lists ${PROG.schools.length} schools and the rail says otherwise.`);
}
const nGov = PROG.schools.filter(s => s.kind !== 'Private').length;
const nPriv = PROG.schools.length - nGov;
const sf = BD.schools.figures;
if (String(nGov) !== sf[0].value || String(nPriv) !== sf[1].value) {
  dataFail(`the school list has ${nGov} government/municipal and ${nPriv} private; the figures say ${sf[0].value} and ${sf[1].value}.`);
}

const LIB = new Map(JSON.parse(readFileSync(join(S.ROOT, 'content/photo-library.json'), 'utf8')).photos.map(e => [e.src, e]));
for (const fr of PROG.frames) {
  const e = LIB.get(fr.src);
  if (!e) { dataFail(`frame ${fr.src} is not in content/photo-library.json.`); continue; }
  if (e.stock) dataFail(`frame ${fr.src} is flagged stock.`);
  if (e.synthetic) dataFail(`frame ${fr.src} is flagged synthetic.`);
  let real;
  try { real = imageSize(join(S.ROOT, 'public' + fr.src)); } catch (err) { dataFail(`frame ${fr.src} could not be measured: ${err.message}`); continue; }
  if (e.width !== real.width || e.height !== real.height) {
    dataFail(`frame ${fr.src}: library says ${e.width}x${e.height}, file renders ${real.width}x${real.height}. THE FILE WINS.`);
  }
}
const MARK = PROG.with.mark;
const MARK_DIM = S.imgDim(MARK.src);
if (!MARK_DIM) dataFail(`nothing at public${MARK.src} could be measured.`);
if (LIB.has(MARK.src)) dataFail('the partner mark must not be in the photograph library.');
if (!MARK.trademark.includes(MARK.holder)) dataFail('with.mark.trademark must name with.mark.holder.');
if (bad) { console.error(`\nREFUSING TO WRITE: ${bad} data check(s) failed.`); process.exit(1); }

/* ═══ BANDS ═════════════════════════════════════════════════════════════ */
const BANDS = W.bandChain(IDS).map(([id, cls, hex, tier]) => [id, [cls, tier].filter(Boolean).join(' '), hex, tier]);
const clashes = S.groundChain(BANDS);
for (const [id, cls, hex] of BANDS) {
  const real = W.compositedHex(cls);
  if (real === null) dataFail(`band ${id} declares two ground classes ("${cls}")`);
  else if (real !== hex) dataFail(`band ${id} declares ${hex} but class "${cls}" composites to ${real}`);
}
if (bad) { console.error(`\nREFUSING TO WRITE: ${bad} check(s) failed.`); process.exit(1); }

const frameFor = (slot) => PROG.frames.find(f => f.slot === slot) || null;
const INDEX = [['The project', '#top'], ['What it built', '#kinds'], ['The schools', '#schools'], ['The films', '#films']];

const wrap = (s) => `    <div class="wrap">\n${s}\n    </div>`;
const dark = (s) => `    <div class="wrap wk-dark">\n${s}\n    </div>`;
const canvasFor = (hex) => (hex === '#0D0D0B' || hex === '#151512') ? dark : wrap;
function applyCanvas(bands, body) {
  const out = {};
  for (const [id, , hex] of bands) {
    const v = body[id];
    if (id === 'top' || id === 'onward' || id === 'statement') { out[id] = v; continue; }
    if (!Array.isArray(v)) { out[id] = canvasFor(hex)(v); continue; }
    const rest = v.slice(1).filter(Boolean).join('\n');
    out[id] = rest ? `${v[0]}\n${canvasFor(hex)(rest)}` : v[0];
  }
  return out;
}

const figGroup = (list) => W.figures((list || []).map(f => ({ ...f, value: plain(f.value), label: plain(f.label), period: plain(f.period) })));

const body = {};
body.top = () => `${W.masthead({
  h1: BD.top.h1,
  deck: PROG.deck,
  frame: frameFor('top'),
  ancestor: W.anc(PROG.ancestor.label, PROG.ancestor.href),
  lines: [
    `<p class="lbl hc-credit">${esc(PROG.partnership)}</p>`,
    `<p class="cap hc-eye">${PROG.identity}</p>`,
  ],
})}
    <div class="pic-body hc-rail-body"><div class="wrap">
      <div class="hc-rail" style="--n:${PROG.figures.length}">
${PROG.figures.map(f => `        <div class="hc-rail-c"><p class="num hc-rail-v">${
  plain(f.value).replace(/\+$/, '<sup>+</sup>')}</p><p class="lbl hc-rail-l">${
  esc(plain(f.label))}</p><p class="cap hc-rail-s">${esc(plain(f.period))}</p></div>`).join('\n')}
      </div>
    </div></div>`;

body.what = [
  W.openBand('what', BD.what.head, BD.what.lead),
  `      <p class="d2 hc-say">${BD.what.line}</p>`,
  W.doRows(BD.what.rows),
];
body.kinds = [W.openBand('kinds', BD.kinds.head, BD.kinds.lead), W.displayRows(BD.kinds.rows)];

const deliverable = (id, flip) => {
  const b = BD[id];
  const frame = frameFor(id);
  const prose = (b.prose || []).map(p => `<p class="body hc-prose">${p}</p>`);
  return [
    W.openBand(id, b.head, b.lead),
    frame && prose.length ? `      ${prose.join('\n      ')}` : '',
    W.splitBand({ left: W.doRows(b.rows), frame, right: frame ? '' : prose.join('\n        '), flip }),
    figGroup(b.figures),
  ];
};
body.workshops = deliverable('workshops', false);
body.gardens = deliverable('gardens', true);
body['zero-waste'] = deliverable('zero-waste', false);
body.films = deliverable('films', true);

const LOCALITIES = [...new Set(PROG.schools.map(s => s.place).filter(Boolean))];
body.statement = () => W.statementBand({
  line: BD.statement.line,
  under: LOCALITIES.join(' &nbsp;/&nbsp; '),
  frame: frameFor('statement'),
});

const schoolRows = PROG.schools.map((s, i) => {
  const n = String(i + 1).padStart(2, '0');
  const pre = [s.place, s.state, s.kind].filter(Boolean).join(' &middot; ');
  return `        <li id="school-${n}"><div class="llb-sch">
          <span class="lbl w7-pj-n" aria-hidden="true">${n}</span>
          <p class="lbl w7-pj-pre">${pre}</p>
          <h3 class="w7-pj-rt">${esc(s.name)}</h3>
        </div></li>`;
}).join('\n');
body.schools = [
  W.openBand('schools', BD.schools.head, BD.schools.lead),
  `      <ol class="w7-pj-rows" role="list">\n${schoolRows}\n      </ol>`,
  figGroup(BD.schools.figures),
];
body.learned = [W.openBand('learned', BD.learned.head, null), W.doRows(BD.learned.rows)];
body.watch = [
  W.openBand('watch', BD.watch.head, BD.watch.lead),
  W.doRows(BD.watch.rows.map(r => ({
    h: r.h, p: r.p,
    cap: `<a class="act" href="${r.href}" rel="noopener" target="_blank">${r.link} ${ARROW}</a>`,
  }))),
];

const w = PROG.with;
body.with = [
  W.openBand('with', BD.with.head, null),
  `      <div class="wk-names wk-names-1" style="--n:1">
        <div><span class="lbl">${esc(w.label)}</span><ul>${w.funders
  .map((n, i) => `<li${i < w.funders_lead ? ' class="wk-lead"' : ''}>${esc(n)}</li>`).join('')}</ul></div>
      </div>`,
  `      <figure class="hc-mark">
        <span class="hc-mark-p"><img class="hc-mark-i" src="${MARK.src}" alt="${esc(MARK.alt)}"${MARK_DIM} loading="lazy"></span>
        <figcaption class="cap hc-mark-tm">${esc(w.credit)} ${MARK.trademark}</figcaption>
      </figure>`,
];
body.onward = () => W.onwardBand({ doors: BD.onward.doors, act: BD.onward.act, actNote: BD.onward.act_note });

if (bad) { console.error(`\nREFUSING TO WRITE: ${bad} check(s) failed.`); process.exit(1); }
const B = applyCanvas(BANDS, body);

/* ═══ CSS ═══════════════════════════════════════════════════════════════
   The same rules /healthy-cities states for the same components, restated for
   this page's band ids. No backtick may appear in these strings. */
const PAGE_CSS = `
.hc-credit{color:var(--fg-2);margin:0 0 8px;max-width:60ch}
.hc-eye{color:var(--fg-3);margin:0 0 clamp(14px,1.8vw,22px);max-width:60ch}
.paper .hc-credit,.paper-2 .hc-credit{color:var(--ink-2)}
.paper .hc-eye,.paper-2 .hc-eye{color:var(--ink-3)}
.hc-rail-body{padding-bottom:0}
.w7-pj-pre{margin:0;color:var(--ink-3)}
.wk-dark .w7-pj-pre{color:var(--fg-3)}
.w7-pj-fig>img{object-position:var(--op,50% 50%)}
.hc-prose{max-width:56ch}
.hc-prose+.hc-prose{margin-top:var(--gap-row)}
`;

const HUB_CSS = `
.hc-rail{display:grid;grid-template-columns:repeat(var(--n,4),minmax(0,1fr));
  gap:clamp(14px,2.2vw,40px);border-top:1px solid var(--hair);
  margin-top:var(--gap-row);padding-top:var(--gap-row)}
.hc-rail-c>*{margin:0;min-width:0}
.hc-rail-v{font-size:clamp(34px,4.8vw,72px);line-height:.9;color:var(--fg)}
.hc-rail-v sup{font-size:.3em;font-variation-settings:'wdth' 88,'wght' 700;
  letter-spacing:.02em;vertical-align:baseline;position:relative;top:-.66em;color:var(--fg-2)}
.hc-rail-l{margin-top:10px;color:var(--fg-2)}
.hc-rail-s{margin-top:8px;color:var(--fg-3)}
.paper .hc-rail,.paper-2 .hc-rail{border-top-color:var(--rule)}
.paper .hc-rail-v,.paper-2 .hc-rail-v{color:var(--ink)}
.paper .hc-rail-v sup,.paper-2 .hc-rail-v sup{color:var(--ink-2)}
.paper .hc-rail-l,.paper-2 .hc-rail-l{color:var(--ink-2)}
.paper .hc-rail-s,.paper-2 .hc-rail-s{color:var(--ink-3)}
@media (max-width:900px){.hc-rail{grid-template-columns:repeat(2,minmax(0,1fr));gap:24px}}
@media (max-width:420px){.hc-rail{grid-template-columns:minmax(0,1fr);gap:18px}}
.hc-say{margin:var(--gap-row) 0 0;max-width:24ch;color:var(--fg)}
.paper .hc-say,.paper-2 .hc-say{color:var(--ink)}
.im-head+.hc-prose{margin-top:var(--gap-row)}
.hc-prose+.w7-pj-split{margin-top:var(--gap-row)}
#workshops .w7-pj-nums,#gardens .w7-pj-nums,#schools .w7-pj-nums{
  margin-top:var(--gap-row);padding-top:var(--gap-row);border-top:1px solid var(--hair)}
#workshops.paper .w7-pj-nums,#workshops.paper-2 .w7-pj-nums,
#gardens.paper .w7-pj-nums,#gardens.paper-2 .w7-pj-nums,
#schools.paper .w7-pj-nums,#schools.paper-2 .w7-pj-nums{border-top-color:var(--rule)}
.hc-mark{margin:var(--gap-row) 0 0}
.hc-mark-p{display:block;width:max-content;max-width:100%;background:#FFF;padding:24px}
.hc-mark-i{display:block;width:280px;max-width:100%;height:auto}
.hc-mark-tm{margin:12px 0 0;max-width:62ch}
.llb-sch{display:grid;grid-template-columns:clamp(28px,2.4vw,38px) minmax(0,1fr);
  column-gap:14px;row-gap:2px;align-items:baseline;padding:10px 0 12px;min-height:48px}
#schools .w7-pj-rows .w7-pj-n{grid-row:1/span 2}
#kinds .wk-dark .w7-do-t.rl::after{--rl-c:var(--fg-3)}
#workshops .wk-dark .w7-pj-num.rl::after,#gardens .wk-dark .w7-pj-num.rl::after,
#schools .wk-dark .w7-pj-num.rl::after{--rl-c:var(--fg-3)}
#gardens .w7-pj-num.rl::after,#schools .w7-pj-num.rl::after{--rl-w:2px;--rl-c:var(--ink-2)}
`;

/* ═══ WRITE ═════════════════════════════════════════════════════════════ */
const REG = seo('/live-life-better');
const OUT = await S.assemble({
  file: 'live-life-better.html',
  route: '/live-life-better',
  title: REG.title,
  bands: BANDS, index: INDEX, sh, clashes,
  pageCss: [sh.COMPONENT_CSS, W.WORK_CSS, PAGE_CSS, HUB_CSS].join('\n'),
  sectionFor: (id) => { const v = B[id]; return typeof v === 'function' ? v() : (v ?? '    <div class="wrap"><p class="lead">&mdash;</p></div>'); },
  note: `${BANDS.length} bands + footer. ${PROG.schools.length} schools, ${PROG.figures.length} rail figures, `
    + `${BAND_FIG.length} band figures in ${FIG_BANDS.length} group(s). ${PROG.frames.length} frames. `
    + `PARTNER MARK: ${plain(MARK.src)} — ${plain(MARK.source)}; ${plain(MARK.holder)}.`,
});

let fail = 0;
const gate = (ok, msg) => { if (!ok) { console.error(`  FAIL ${msg}`); fail++; } else console.log(`  ok   ${msg}`); };
console.log('\nGATES');
const RENDERED = OUT.replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<!--[\s\S]*?-->/g, ' ');
const TEXT = RENDERED.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
const OWN = OUT.split('<footer')[0].split('<main')[1] || '';
const bandHtml = (id) => { const s = OUT.indexOf(`id="${id}"`); return s === -1 ? '' : OUT.slice(s, OUT.indexOf('</section>', s)); };

const DARK_HEX = new Set(['#0D0D0B', '#151512']);
const PAPER_FROZEN = ['ip-ovl', 'w7-pj-nums', 'w7-pj-rows', 'w7-do-list', 'wk-names'];
const wkDarkRanges = (html) => {
  const out = [];
  const open = /<div class="wrap wk-dark">/g;
  let m;
  while ((m = open.exec(html))) {
    let depth = 0;
    const tag = /<(\/?)div\b/g;
    tag.lastIndex = m.index;
    let t;
    while ((t = tag.exec(html))) { depth += t[1] ? -1 : 1; if (depth === 0) { out.push([m.index, t.index]); break; } }
  }
  return out;
};
const RANGES = wkDarkRanges(OUT);
const unlit = [];
let litBands = 0;
for (const [id, , hex] of BANDS) {
  if (!DARK_HEX.has(hex)) continue;
  const start = OUT.indexOf(`id="${id}"`);
  if (start === -1) continue;
  const html = bandHtml(id);
  const present = PAPER_FROZEN.filter(c => new RegExp(`class="(?:[^"]*\\s)?${c}\\b`).test(html));
  if (!present.length) continue;
  litBands++;
  for (const c of present) {
    const re = new RegExp(`class="(?:[^"]*\\s)?${c}\\b`, 'g');
    let m;
    while ((m = re.exec(html))) {
      const at = start + m.index;
      if (!RANGES.some(([a, b]) => at > a && at < b)) { unlit.push(`${id}/.${c}`); break; }
    }
  }
}
gate(litBands > 0 && unlit.length === 0, `every paper-frozen component on a dark band sits inside an open .wk-dark (${litBands} band(s))${unlit.length ? `; UNLIT: ${unlit.join(', ')}` : ''}`);
gate(/\.hc-rail-l\{[^}]*color:var\(--fg-2\)/.test(HUB_CSS) && /\.hc-rail-s\{[^}]*color:var\(--fg-3\)/.test(HUB_CSS), 'the masthead rail states the dark-ground label and caption inks itself');
const dbl = [...new Set([...OUT.matchAll(/&amp;(?:mdash|ndash|rsquo|lsquo|ldquo|rdquo|nbsp|middot|hellip);/g)].map(m => m[0]))];
gate(dbl.length === 0, `no double-escaped entity${dbl.length ? `; FOUND: ${dbl.join(', ')}` : ''}`);
gate(!/\b(LIVE|PERIODIC|OUT OF SEASON|NO SEASON)\b/.test(RENDERED), 'no source-cadence state word in the rendered page');
gate(![...OUT.matchAll(/class="[^"]*\breadout\b[^"]*"/g)].length, 'no .readout element on this page');
const OWN_CSS = PAGE_CSS + HUB_CSS;
gate(!/--t-readout/.test(OWN_CSS) && !/@keyframes/.test(OWN_CSS) && !/\bfilter:/.test(OWN_CSS) && !/--red\b/.test(OWN_CSS), 'page CSS restates no readout scale, keyframes, filter or red');
gate(![...OWN.matchAll(/\/brand\/[^"']+/g)].length, 'no Swechha brand file in this page\'s own bands');

const imgTags = [...OWN.matchAll(/<img\b[^>]*>/g)].map(m => m[0]);
const srcOf = (t) => (t.match(/\ssrc="([^"]+)"/) || [])[1] || '';
const photoTags = imgTags.filter(t => srcOf(t).startsWith('/images/photos/'));
const markTags = imgTags.filter(t => srcOf(t).startsWith('/images/partners/'));
const strayTags = imgTags.filter(t => !photoTags.includes(t) && !markTags.includes(t));
gate(markTags.length === 1 && srcOf(markTags[0]) === MARK.src, `exactly one partner mark, the registered path (${MARK.src})`);
gate(strayTags.length === 0, `every image is a photograph or the partner mark${strayTags.length ? `; STRAY: ${strayTags.map(srcOf).join(', ')}` : ''}`);
gate(markTags.every(t => !/\bduo(-dim)?\b/.test(t)), 'the partner mark carries no duo/duo-dim');
gate(markTags.every(t => /\swidth="\d+"/.test(t) && /\sheight="\d+"/.test(t)), 'the partner mark reserves its box from imgDim');
const unramped = photoTags.filter(t => !/\bduo(-dim)?\b/.test(t));
gate(photoTags.length === PROG.frames.length && unramped.length === 0, `all ${photoTags.length} of ${PROG.frames.length} photographs render and carry the monochrome ramp${unramped.length ? `; UNRAMPED: ${unramped.map(srcOf).join(', ')}` : ''}`);
const WITH_BAND = OUT.slice(OUT.indexOf('id="with"'), OUT.indexOf('id="onward"'));
gate(WITH_BAND.includes(MARK.src), 'the mark sits inside the #with band, not the masthead');
const stillTyped = w.funders.filter(n => !WITH_BAND.includes(`>${esc(n)}</li>`));
gate(stillTyped.length === 0, 'the funder is credited as type in #with, the logo adds and does not replace');
gate(/UN Environment Programme \(UNEP\)/.test(WITH_BAND) && /UN Environment Programme \(UNEP\)/.test(OWN.split('id="what"')[0]), 'UNEP is credited in the masthead and in #with');
gate(!/UNEP.{0,40}(logo|emblem)/i.test(TEXT.replace(/The One Planet Network logo/g, '')), 'no UNEP logo or emblem is used');
gate(TEXT.includes(plain(MARK.holder)) && WITH_BAND.includes('hc-mark-tm'), 'the trademark acknowledgement renders with the mark and names the holder');
const bareFr = [...OWN_CSS.matchAll(/grid-template-columns:[^;}]*(?<![\w),])1fr\b[^;}]*/g)].map(m => m[0]).filter(t => !t.includes('minmax(0,1fr)'));
gate(bareFr.length === 0, `every grid track is minmax(0,1fr)${bareFr.length ? `; BARE: ${bareFr.join(' | ')}` : ''}`);

const unrendered = PROG.figures.filter(f => !OUT.includes(plain(f.value).replace(/\+$/, '<sup>+</sup>')));
gate(unrendered.length === 0, `all ${PROG.figures.length} rail figures render`);
const lostFig = [];
for (const id of FIG_BANDS) for (const f of BD[id].figures) if (!bandHtml(id).includes(plain(f.value).replace(/\+$/, '<sup>+</sup>'))) lostFig.push(`${id}/${f.value}`);
gate(lostFig.length === 0, `all ${BAND_FIG.length} band figures render in their own band${lostFig.length ? `; MISSING: ${lostFig.join(', ')}` : ''}`);
const lostProse = [];
for (const id of IDS) for (const p of ((BD[id] && BD[id].prose) || [])) if (!bandHtml(id).includes(p)) lostProse.push(`${id}: ${p.slice(0, 40)}`);
gate(lostProse.length === 0, `every authored prose paragraph renders in its own band${lostProse.length ? `; DROPPED: ${lostProse.join(' | ')}` : ''}`);
const lostSchools = PROG.schools.filter((s, i) => !OUT.includes(`<li id="school-${String(i + 1).padStart(2, '0')}">`) || !OUT.includes(esc(s.name)));
gate(lostSchools.length === 0, `all ${PROG.schools.length} schools render as register rows`);
gate(!/<li id="school-\d+"><a\b/.test(OUT), 'school rows link nowhere (no sub-pages exist)');

for (const [what, re, n] of [
  ['the four deliverables at display scale', /class="d1 rl w7-do-t"/, 4],
  ['the masthead rail', /class="num hc-rail-v"/, PROG.figures.length],
  ['the reading pairs', /class="w7-pj-num rl"/, BAND_FIG.length],
]) {
  const found = (OUT.match(new RegExp(re.source, 'g')) || []).length;
  gate(found === n, `${what}: ${found} of ${n} expected`);
}
const d2s = [...OUT.matchAll(/class="[^"]*\bd2\b[^"]*"/g)].map(m => m[0]);
gate(d2s.length === 1 && d2s[0] === 'class="d2 hc-say"', 'exactly one .d2 on the page');
gate(BD.kinds.rows.length === DELIVERABLES.length && BD.kinds.rows.every((r, i) => r.href === `#${DELIVERABLES[i]}` && OUT.includes(`id="${DELIVERABLES[i]}"`)),
  'the display rows are the four deliverables, in render order, and each opens a band on this page');
gate(!/id="voices"/.test(OUT), 'no voices band: no student or teacher quote has been supplied');

const NAV_IDS = new Set(S.NAV.map(([, h]) => (h.match(/#([\w-]+)$/) || [])[1]).filter(Boolean));
const NAV_WORDS = new Set(S.NAV.map(([t]) => t.toLowerCase()));
const collide = IDS.filter(id => NAV_IDS.has(id) || NAV_WORDS.has(id));
gate(collide.length === 0, `no band id collides with a nav word${collide.length ? `; COLLIDING: ${collide.join(', ')}` : ''}`);
const headless = IDS.filter(id => id !== 'top' && !OUT.includes(`id="${id}-h"`));
gate(headless.length === 0, `every band carries a heading${headless.length ? `; HEADLESS: ${headless.join(', ')}` : ''}`);
for (const [, href] of INDEX) gate(OUT.includes(`id="${href.slice(1)}"`), `index chip ${href} resolves`);
gate(![...OWN.matchAll(/href="(\/design\/[^"]*)"/g)].length, 'no /design/ href in this page\'s own bands');
gate(!/\$\{/.test(OUT), 'no unexpanded template hole in the output');
gate(!/cannot say yet|do not settle|Coming soon|Lorem/i.test(TEXT), 'no placeholder or confession copy');
const firstPhoto = /<img[^>]*src="\/images\/[^"]*"[^>]*>/.exec(OWN);
gate(!firstPhoto || /fetchpriority="high"/.test(firstPhoto[0]), 'the first photograph in document order is the masthead frame (fetchpriority="high")');

const STYLE_SRC = [...OUT.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n')
  .replace(/\/\*[\s\S]*?\*\//g, '');
const MEDIA_BLOCKS = [];
const CSS_FLAT = STYLE_SRC.replace(/@(?:media|supports|container)[^{]*\{/g, (m, i) => {
  /* balance the block from this point so its body can be lifted whole */
  let depth = 0, j = i;
  for (; j < STYLE_SRC.length; j++) {
    if (STYLE_SRC[j] === '{') depth++;
    else if (STYLE_SRC[j] === '}' && --depth === 0) break;
  }
  MEDIA_BLOCKS.push(STYLE_SRC.slice(i, j + 1));
  return m;
});
const MEDIA_TEXT = MEDIA_BLOCKS.join('\n');

const TOKENS = {};
for (const m of STYLE_SRC.matchAll(/--([a-z0-9-]+)\s*:\s*(#[0-9A-Fa-f]{3,8}|rgba?\([^)]*\))\s*(?=[;}])/g)) {
  TOKENS[m[1]] = m[2];                                   // last definition wins, as the cascade does
}
const rgba = (v) => {
  const s = String(v).trim();
  let m = s.match(/^#([0-9A-Fa-f]{6})$/);
  if (m) return [0, 2, 4].map(i => parseInt(m[1].slice(i, i + 2), 16)).concat(1);
  m = s.match(/^#([0-9A-Fa-f]{3})$/);
  if (m) return [...m[1]].map(c => parseInt(c + c, 16)).concat(1);
  m = s.match(/^rgba?\(([^)]*)\)$/i);
  if (m) {
    const p = m[1].split(/[,\s/]+/).filter(Boolean).map(Number);
    if (p.slice(0, 3).some(Number.isNaN)) return null;
    return [p[0], p[1], p[2], p.length > 3 && !Number.isNaN(p[3]) ? p[3] : 1];
  }
  return null;
};
/* var() with a fallback, to any depth — .rl::after's own border-left names
   var(--rl-c,var(--hair)), so the no-override case is a two-deep chain. */
const resolveColour = (v, d = 0) => {
  if (d > 8) return null;
  const s = String(v).trim();
  const m = s.match(/^var\(\s*--([a-z0-9-]+)\s*(?:,([\s\S]*))?\)$/);
  if (!m) return rgba(s);
  if (TOKENS[m[1]] !== undefined) return resolveColour(TOKENS[m[1]], d + 1);
  return m[2] ? resolveColour(m[2], d + 1) : null;
};
const over = (fg, bg) => [0, 1, 2].map(i => Math.round(fg[i] * fg[3] + bg[i] * (1 - fg[3]))).concat(1);
const relLum = (c) => {
  const f = c.slice(0, 3).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * f[0] + 0.7152 * f[1] + 0.0722 * f[2];
};
const ratio = (a, b) => {
  const l1 = relLum(a), l2 = relLum(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
};
const hex = (c) => '#' + c.slice(0, 3).map(v => v.toString(16).padStart(2, '0').toUpperCase()).join('');

/* ── THE DOM WALK. Script, style and comment bodies are cut first: they hold
      `<` in strings and would corrupt the ancestor stack. */
const VOID_TAGS = new Set(['img', 'br', 'hr', 'meta', 'link', 'input', 'source', 'path', 'use',
  'circle', 'rect', 'line', 'polygon', 'area', 'col', 'embed', 'track', 'wbr', 'base', 'stop']);
const MARKUP = OUT
  .replace(/<script\b[\s\S]*?<\/script>/gi, '')
  .replace(/<style\b[\s\S]*?<\/style>/gi, '')
  .replace(/<!--[\s\S]*?-->/g, '');
function walk(html, want) {
  const found = [], stack = [];
  const tagRe = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:"[^"]*"|'[^']*'|[^>"'])*?)(\/?)>/g;
  let m;
  while ((m = tagRe.exec(html))) {
    const closing = m[1] === '/', tag = m[2].toLowerCase(), attrs = m[3], selfClose = m[4] === '/';
    if (closing) {
      for (let i = stack.length - 1; i >= 0; i--) if (stack[i].tag === tag) { stack.length = i; break; }
      continue;
    }
    const node = {
      tag,
      id: (attrs.match(/\bid="([^"]*)"/) || [])[1] || '',
      classes: ((attrs.match(/\bclass="([^"]*)"/) || [])[1] || '').split(/\s+/).filter(Boolean),
    };
    if (want(node)) found.push({ ...node, chain: stack.slice() });
    if (!selfClose && !VOID_TAGS.has(tag)) stack.push(node);
  }
  return found;
}

/* ── SELECTOR MATCHING AND SPECIFICITY. Only the descendant combinator is
      supported, which is every selector that touches either property here; a
      selector this cannot reason about is REPORTED rather than skipped
      quietly, because a resolver that silently ignores the rule that wins is
      the failure mode this whole gate exists to close. */
const compound = (c) => ({
  ids: [...c.matchAll(/#([A-Za-z][\w-]*)/g)].map(x => x[1]),
  cls: [...c.matchAll(/\.([A-Za-z][\w-]*)/g)].map(x => x[1]),
  tag: (c.match(/^([a-zA-Z][\w-]*)/) || [])[1] || '',
  pseudoEl: /::[a-z-]+/.test(c),
  pseudoCl: [...c.replace(/::[a-z-]+/g, '').matchAll(/:([a-z-]+)(?:\([^)]*\))?/g)].map(x => x[1]),
});
const UNREASONABLE = /[>+~[]|:hover|:focus|:active|:not\(/;
const nodeHas = (n, c) => (!c.tag || n.tag === c.tag)
  && c.ids.every(i => n.id === i) && c.cls.every(k => n.classes.includes(k));
const selMatches = (sel, el) => {
  const comps = sel.trim().split(/\s+/).map(compound);
  if (!nodeHas(el, comps[comps.length - 1])) return false;
  let ci = comps.length - 2, ai = el.chain.length - 1;
  while (ci >= 0) {
    while (ai >= 0 && !nodeHas(el.chain[ai], comps[ci])) ai--;
    if (ai < 0) return false;
    ai--; ci--;
  }
  return true;
};
const specificity = (sel) => sel.trim().split(/\s+/).map(compound).reduce(
  (a, x) => a + x.ids.length * 1e6 + (x.cls.length + x.pseudoCl.length) * 1e3 + (x.pseudoEl ? 1 : 0) + (x.tag ? 1 : 0), 0);

/* Every declaration of the named properties, in source order. */
const declsFor = (props) => {
  const out = [], unreasoned = [];
  let n = 0;
  for (const r of CSS_FLAT.matchAll(/([^{}@]+)\{([^{}]*)\}/g)) {
    const body = r[2];
    const hits = props.filter(p => new RegExp(`(?:^|;)\\s*${p}\\s*:`).test(body));
    if (!hits.length) continue;
    for (const sel of r[1].split(',')) {
      const s = sel.trim().replace(/\s+/g, ' ');
      if (!s) continue;
      if (UNREASONABLE.test(s)) { unreasoned.push(s); continue; }
      for (const p of hits) {
        const v = body.match(new RegExp(`(?:^|;)\\s*${p}\\s*:\\s*([^;]+)`))[1].trim();
        out.push({ sel: s, prop: p, value: v, spec: specificity(s), order: n++ });
      }
    }
  }
  return { out, unreasoned };
};
/* The declaration that wins, over ONE OR MORE competing property names ranked
   TOGETHER by specificity then source order. Ranking them together is the whole
   point and the first draft of this got it wrong: a longhand
   (border-top-color) and a shorthand carrying the same component
   (border-top:1px solid …) compete on specificity like any other pair of
   declarations, and preferring the longhand because it is more specific AS A
   PROPERTY made the gate answer "--rule" for a paper band whose real hairline
   was --hair. It passed the reverted-fix perturbation, which is how it was
   caught: a gate has to fail when the defect is put back or it is decoration. */
const winner = (decls, el, ...props) => decls
  .filter(d => props.includes(d.prop) && selMatches(d.sel, el))
  .sort((a, b) => (a.spec - b.spec) || (a.order - b.order)).pop() || null;

const GROUND_OF = new Map(BANDS.map(([id, , h]) => [id, h]));
const bandOf = (el) => {
  for (let i = el.chain.length - 1; i >= 0; i--) if (el.chain[i].tag === 'section' && el.chain[i].id) return el.chain[i].id;
  return null;
};

/* ── (a) EVERY .rl ELEMENT'S RESOLVED STROKE COLOUR, AT 3:1. */
const RL_DECLS = declsFor(['--rl-c']);
const RL_ELS = walk(MARKUP, (n) => n.classes.includes('rl'));
const rlRows = [], rlBad = [];
for (const el of RL_ELS) {
  const band = bandOf(el);
  const ground = resolveColour(GROUND_OF.get(band) || '#0D0D0B');
  /* A ground class between the band and the element would move the canvas out
     from under this reading, and there is none on this page — asserted, not
     assumed, because the reading is worthless if it is against the wrong ground. */
  const restated = el.chain.some(n => n.classes.some(c => c === 'paper' || c === 'paper-2' || c === 'dark-2') && n.tag !== 'section');
  const w = winner(RL_DECLS.out, el, '--rl-c');
  const col = resolveColour(w ? w.value : 'var(--hair)');
  if (!col || restated) { rlBad.push(`${band}/.${el.classes.join('.')} — colour unresolvable`); continue; }
  const r = ratio(over(col, ground), ground);
  rlRows.push({ band, cls: el.classes.filter(c => c !== 'rl').join('.') || '(bare)', from: w ? w.sel : '.rl::after fallback', colour: hex(over(col, ground)), on: hex(ground), r: +r.toFixed(2) });
  if (r < 3) rlBad.push(`${band} .${el.classes.join('.')} — ${hex(over(col, ground))} on ${hex(ground)} = ${r.toFixed(2)}:1 (wins: ${w ? w.sel : 'the component default'})`);
}
gate(RL_ELS.length > 0 && rlBad.length === 0 && MEDIA_BLOCKS.every(b => !/--rl-c/.test(b)),
  `every kissing rule resolves to 3:1 or better against its own band — ${RL_ELS.length} .rl element(s) `
  + `in ${new Set(rlRows.map(x => x.band)).size} band(s), ${RL_DECLS.out.length} --rl-c declaration(s) ranked, `
  + `worst ${rlRows.length ? Math.min(...rlRows.map(x => x.r)).toFixed(2) : 'n/a'}:1`
  + (RL_DECLS.unreasoned.length ? `; state-only selectors not resolved: ${[...new Set(RL_DECLS.unreasoned)].join(', ')}` : '')
  + (rlBad.length ? `\n       BELOW 3:1 -> ${rlBad.join('\n                    ')}` : '')
  + (MEDIA_TEXT.includes('--rl-c') ? '; A MEDIA QUERY SETS --rl-c, which this resolver has no width for' : ''));

/* ── (b) THE FIGURE GROUP'S HAIRLINE, BY TOKEN FAMILY. Same resolver, different
      instrument: --hair on a paper band is white on white (1.01:1 measured) and
      --rule on a dark band is the mirror, and neither can be caught by a ratio
      floor because a correct hairline on this site is 1.1:1. */
const HAIR_DECLS = declsFor(['border-top-color', 'border-top']);
const NUMS_ELS = walk(MARKUP, (n) => n.classes.includes('w7-pj-nums'));
const hairBad = [], hairRows = [];
for (const el of NUMS_ELS) {
  const band = bandOf(el);
  const g = GROUND_OF.get(band) || '#0D0D0B';
  const ground = resolveColour(g);
  const isDark = DARK_HEX.has(g);
  const w = winner(HAIR_DECLS.out, el, 'border-top-color', 'border-top');
  const raw = w ? (w.prop === 'border-top' ? (w.value.match(/(var\([^)]*\)|#[0-9A-Fa-f]{3,8}|rgba?\([^)]*\))\s*$/) || [])[1] : w.value) : null;
  const want = (isDark ? ['--hair', '--hair-2'] : ['--rule', '--rule-2']).map(t => hex(over(resolveColour(`var(${t})`), ground)));
  const col = raw ? resolveColour(raw) : null;
  const got = col ? hex(over(col, ground)) : null;
  hairRows.push({ band, ground: g, from: w ? `${w.sel} {${w.prop}}` : '(none)', got, r: col ? +ratio(over(col, ground), ground).toFixed(2) : null });
  if (!got || !want.includes(got)) {
    hairBad.push(`${band} (${g}) resolves to ${got || 'nothing'} via "${w ? w.sel : 'no rule'}" — a `
      + `${isDark ? 'dark' : 'paper'} band's hairline must be ${isDark ? '--hair/--hair-2' : '--rule/--rule-2'} (${want.join(' or ')})`);
  }
}
gate(NUMS_ELS.length > 0 && hairBad.length === 0,
  `every figure group's hairline resolves to its own ground's token family — ${NUMS_ELS.length} group(s): `
  + hairRows.map(x => `${x.band} ${x.got}@${x.r}:1`).join(', ')
  + (hairBad.length ? `\n       WRONG FAMILY -> ${hairBad.join('\n                       ')}` : ''));

if (process.env.HC_CONTRAST_TABLE) {
  console.log('\n  RESOLVED STROKE COLOURS');
  for (const x of rlRows) console.log(`    ${x.band.padEnd(12)} .${x.cls.padEnd(14)} ${x.colour} on ${x.on} = ${String(x.r).padStart(5)}:1   <- ${x.from}`);
}

if (fail) {
  console.error(`\n${fail} gate(s) failed. The file is written — fix the generator and rebuild.`);
  process.exit(1);
}
console.log(`\n${OUT.length.toLocaleString('en-IN')} bytes. All hub gates pass.`);
