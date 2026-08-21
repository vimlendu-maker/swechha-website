// AD-22 — impact.html, the Impact page. SEVEN bands.
//
// ★ THE CONCEPT: THIS IS THE ONE PAGE THAT REFUSES THE THING IT IS NAMED FOR.
//
// An impact page exists to print one big cumulative number. This one cannot,
// and the reason is not modesty — the number would be false. The thirty-two
// figures this section holds count OVERLAPPING populations over UNALIGNED
// periods: a volunteer who walked an eco-walk is in two of them, a girl who
// came through ME to WE and then led a Yatra is in two more, and the spans are
// annual, two-decade, since-2004 and thirteen-year. Summing them double-counts
// people across periods that share no denominator.
//
// So the page's subject is the refusal itself, and that is what earns it its
// place. AD-19 killed the first /work index for having no subject a reader
// could not get elsewhere; `intelligence.html` earns its existence by opening
// with a refusal to average six situations and explaining why. This is that
// same refusal turned institutional — and an organisation that declines to
// average micrograms and milligrams does not then get to add up children.
//
// ★ EVERY FIGURE IS READ OUT OF data/work/**, NOT TYPED HERE.
// This is the architectural decision of the page. `data/impact.json` holds the
// page's prose and names figures only by (kind, slug, label); the build
// resolves each one against the item's own data and DIES if it cannot. So
// /impact structurally cannot disagree with the item page a figure came from
// — which is the exact defect class that had the situation index showing 412
// while the Air page said 387.
//
// ★ NO TOTAL, AND IT IS GATED RATHER THAN PROMISED.
// Gate 1 computes the naive sum this page refuses to print and asserts that
// number is absent from the output in every format it could take. A future
// session that adds a hero total gets a build failure, not a review comment.
//
// ★ WHAT IS NOT HERE, AND WHY.
//   · No state chip. LIVE / PERIODIC / OUT OF SEASON / NO SEASON describe how
//     a SOURCE delivers readings. This page has no feed (AD-21 §2's reasoning,
//     applied again).
//   · No red. Red is a published limit broken (§3.1). There is no published
//     limit on this page — a figure nobody has produced is a HOLE, and dotted
//     is not a colour.
//   · No band called `impact`, `work`, `farm` or `record`. The frozen
//     active-section observer matches band ids against nav hrefs, and a band
//     named after a nav word lights the wrong one (AD-21's band-6 finding).
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import * as S from './lib/situation-shell.mjs';
const { esc, opener, hole, ARROW, kd, KIND_LEGEND } = S;

const sh = S.shell();

/* ═══ DATA ═══════════════════════════════════════════════════════════════ */
const IMPACT = JSON.parse(readFileSync(join(S.ROOT, 'data/impact.json'), 'utf8'));
const LIB = new Map(JSON.parse(readFileSync(join(S.ROOT, 'content/photo-library.json'), 'utf8'))
  .photos.map(e => [e.src, e]));

/* The register is assembled from the WORK section's own item files. Kind order
   is the frozen one the homepage and all fifteen work pages use; it is not
   alphabetical and must not become alphabetical. */
const KIND_ORDER = ['projects', 'campaigns', 'journeys', 'events'];
const KIND_LABEL = { projects: 'Projects', campaigns: 'Campaigns', journeys: 'Journeys', events: 'Events' };

function readWork() {
  const root = join(S.ROOT, 'data/work');
  const out = [];
  const walk = (d) => {
    for (const e of readdirSync(d).sort()) {
      const p = join(d, e);
      if (statSync(p).isDirectory()) { walk(p); continue; }
      if (!e.endsWith('.json') || ['kinds.json', 'onward.json'].includes(e)) continue;
      out.push(JSON.parse(readFileSync(p, 'utf8')));
    }
  };
  walk(root);
  return out;
}
const ITEMS = readWork();
const FIGS = ITEMS.flatMap(it => (it.figures || []).map(f => ({ ...f, item: it })));

/* ═══ DATA GATES — before a line of HTML is built ════════════════════════ */
let bad = 0;
const dataFail = (m) => { console.error(`DATA IS WRONG: ${m}`); bad++; };

for (const it of ITEMS) {
  if (!KIND_ORDER.includes(it.kind)) dataFail(`${it.slug} has kind "${it.kind}", which is not one of the four.`);
}
for (const f of FIGS) {
  if (!f.period) dataFail(`${f.item.slug} figure "${f.label}" has no period. A figure without a span is not a reading.`);
  if (!['counted', 'modelled'].includes(f.basis)) dataFail(`${f.item.slug} figure "${f.label}" has basis "${f.basis}".`);
  if (!f.source) dataFail(`${f.item.slug} figure "${f.label}" has no source.`);
}

/* Every figure this page's PROSE names must resolve to a real figure. A
   reference that does not resolve would render a blank where a number belongs
   — the one thing this page is about. */
const find = (ref, where) => {
  const it = ITEMS.find(i => i.kind === ref.kind && i.slug === ref.slug);
  if (!it) { dataFail(`${where} points at ${ref.kind}/${ref.slug}, which is not an item.`); return null; }
  const f = (it.figures || []).find(x => x.label === ref.label);
  if (!f) {
    dataFail(`${where} points at ${ref.kind}/${ref.slug} figure "${ref.label}", which that item does not have. `
      + `It has: ${(it.figures || []).map(x => JSON.stringify(x.label)).join(', ') || '(none)'}`);
    return null;
  }
  return { ...f, item: it };
};
const OVERLAP = IMPACT.refuse.overlap.map((r, i) => find(r, `refuse.overlap[${i}]`)).filter(Boolean);
const PAIR_A = find(IMPACT.pair.a, 'pair.a');
const PAIR_B = find(IMPACT.pair.b, 'pair.b');

/* Every frame must be in the library, must not be a bought stock frame, and
   must not appear twice on this page. All three have shipped as defects
   elsewhere in this section. */
const FRAMES = [IMPACT.masthead.frame, ...IMPACT.sheet.frames];
const seenFrame = new Set();
for (const fr of FRAMES) {
  const e = LIB.get(fr.src);
  if (!e) dataFail(`frame ${fr.src} is not in content/photo-library.json.`);
  else if (e.stock) dataFail(`frame ${fr.src} is a bought stock frame and may not be published as our work.`);
  if (seenFrame.has(fr.src)) dataFail(`frame ${fr.src} appears twice on this page.`);
  seenFrame.add(fr.src);
  if (!fr.alt) dataFail(`frame ${fr.src} has no alt text.`);
}
if (bad) { console.error(`\nREFUSING TO WRITE: ${bad} data check(s) failed.`); process.exit(1); }

/* ═══ THE SUM THIS PAGE REFUSES TO PRINT ═════════════════════════════════
   Parsed here so gate 1 can assert its absence. Only figures that count
   PEOPLE are summed, because a people-total is the number an impact page is
   tempted by; kilograms of leaf litter and percentages of green cover are not
   candidates for the same lie. A range contributes its upper bound, which is
   the most generous reading and therefore the right one to test against. */
const NOT_PEOPLE = /\b(kg|kilo|tonne|acre|%|green cover|honey|leaves|trees|editions|park|garden|school|college|placement|organisation|partner|group|yatra|walk|journey|fellowship)\b/i;
const magnitude = (v) => {
  const s = String(v).replace(/,/g, '');
  if (/%/.test(s)) return null;
  const mult = /million/i.test(s) ? 1e6 : /lakh/i.test(s) ? 1e5 : 1;
  const nums = [...s.matchAll(/\d+(?:\.\d+)?/g)].map(m => parseFloat(m[0]));
  if (!nums.length) return null;
  return Math.max(...nums) * mult;
};
const PEOPLE = FIGS.filter(f => !NOT_PEOPLE.test(f.label) && magnitude(f.value) != null);
const FORBIDDEN_SUM = PEOPLE.reduce((a, f) => a + magnitude(f.value), 0);
const OVERLAP_SUM = OVERLAP.reduce((a, f) => a + (magnitude(f.value) || 0), 0);

/* ═══ COMPONENTS ═════════════════════════════════════════════════════════ */
const num = (v) => esc(v).replace(/\+$/, '<sup>+</sup>');
const basisWord = (b) => b === 'modelled' ? 'Modelled' : 'Counted';

/** A register row: label and its provenance, the value, the basis marker. */
const figRow = (f) => `        <div class="p-nr">
          <p class="p-nr-n">${esc(f.label)}<span class="cap ip-prov">${esc(f.item.name)} &middot; ${esc(f.period)} &middot; ${esc(f.source)}</span></p>
          <p class="p-nr-v">${num(f.value)}</p>
          <p class="lbl ip-basis"><span ${kd(f.basis)}>${basisWord(f.basis)}</span></p>
        </div>`;

/** A big figure with its label under it, on the counted/modelled rule. */
const bigFig = (f) => `          <div class="ip-big">
            <p class="num ip-big-v">${num(f.value)}</p>
            <p class="lbl ip-big-l"><span ${kd(f.basis)}>${esc(f.label)}</span></p>
            <p class="cap ip-big-s">${esc(f.item.name)} &middot; ${esc(f.period)}<br>${esc(f.source)}</p>
          </div>`;

/* ═══ BANDS ══════════════════════════════════════════════════════════════
   Ground chain checked mechanically below. No two adjacent bands share a hex,
   and the last does not share one with the footer (#151512). */
const BANDS = [
  ['top',      't1',        '#0D0D0B'],
  ['refuse',   'paper t2',  '#F3F2F0'],
  ['pair',     't2',        '#151512'],
  ['register', 'paper-2 t3', '#ECEBE8'],
  ['waiting',  'paper t2',  '#F3F2F0'],
  ['sheet',    'dark-2 t2', '#151512'],
  ['act',      't3',        '#0D0D0B'],
];
const clashes = S.groundChain(BANDS);

const INDEX = [
  ['No total', '#top'], ['Why not', '#refuse'], ['Two numbers', '#pair'],
  ['Every figure', '#register'], ['Waiting', '#waiting'],
  ['The archive', '#sheet'], ['Hold us to it', '#act'],
];

const B = {};

/* ── BAND 1. THE MASTHEAD. ───────────────────────────────────────────────
   A line of walkers, because the page's subject is how many people and over
   what span — and a line is the one thing in a photograph you can actually
   count. The register under the photograph counts THIS PAGE's contents, not
   the organisation's: figures held, items carrying one, items carrying none,
   claims waiting. Every one of the four is computed. */
const M = IMPACT.masthead;
const WITH_FIGS = ITEMS.filter(i => (i.figures || []).length);
const HERO = [
  [String(FIGS.length), 'Figures, each with its source'],
  [String(WITH_FIGS.length), `Of ${ITEMS.length} entries carry one`],
  [String(FIGS.filter(f => f.basis === 'modelled').length), 'Derived, not counted'],
  [String(IMPACT.waiting.claims.length), 'Claims waiting on a number'],
];
B.top = () => `    <div class="pic ht">
      <img class="duo" src="${M.frame.src}" alt="${esc(M.frame.alt)}" style="--op:${M.frame.op}">
      <div class="pic-over"><div class="wrap">
        <p class="lbl eyebrow">${esc(M.kicker)}</p>
        <h1 class="d1">${M.h1}</h1>
      </div></div>
    </div>
    <div class="pic-body"><div class="wrap">
      <p class="lead ip-standfirst">${esc(M.lead)}</p>
      <div class="ip-rail">
${HERO.map(([v, l]) => `        <div class="ip-rail-c"><p class="num ip-rail-v">${v}</p><p class="lbl ip-rail-l">${l}</p></div>`).join('\n')}
      </div>
    </div></div>`;

/* ── BAND 2. WHY THERE IS NO TOTAL. ──────────────────────────────────────
   The argument band, and the page's reason for existing. The four overlapping
   figures are RESOLVED from the item data, so the band cannot describe an
   overlap between numbers that have since changed. */
B.refuse = () => `${opener('refuse', IMPACT.refuse.head, esc(IMPACT.refuse.lead))}
    <div class="wrap">
      <p class="body ip-intro">${esc(IMPACT.refuse.overlap_intro)}</p>
      <div class="ip-ovl">
${OVERLAP.map(f => `        <div class="ip-ovl-c">
          <p class="num ip-ovl-v">${num(f.value)}</p>
          <p class="lbl ip-ovl-l"><span ${kd(f.basis)}>${esc(f.label)}</span></p>
          <p class="cap ip-ovl-s">${esc(f.item.name)}<br>${esc(f.period)}</p>
        </div>`).join('\n')}
      </div>
      <p class="cap ip-ovl-n">Four figures, four spans, and no record anywhere of which person is in
        which. Their arithmetic sum would be a number this page will not print, and the build refuses
        to write if it ever appears.</p>
      <div class="p-rows">
${IMPACT.refuse.argument.map(r => `        <div class="p-row">
          <p class="lbl">${esc(r.h)}</p>
          <div><p class="body">${esc(r.p)}</p></div>
        </div>`).join('\n')}
      </div>
      <div class="p-method"><p class="cap">${esc(IMPACT.refuse.rule)}</p></div>
    </div>`;

/* ── BAND 3. TWO NUMBERS, ONE PROGRAMME. ─────────────────────────────────
   The worked example of the distinction the whole page rests on: reach against
   effect, and derived against counted. Both figures resolved, so the band
   cannot argue about values the data no longer holds. */
B.pair = () => `${opener('pair', IMPACT.pair.head, esc(IMPACT.pair.lead))}
    <div class="wrap">
${KIND_LEGEND}
      <div class="ip-pair">
${bigFig(PAIR_A)}
${bigFig(PAIR_B)}
      </div>
      <div class="p-rows">
${IMPACT.pair.rows.map(r => `        <div class="p-row">
          <p class="lbl">${esc(r.h)}</p>
          <div><p class="body">${esc(r.p)}</p></div>
        </div>`).join('\n')}
      </div>
    </div>`;

/* ── BAND 4. EVERY FIGURE WE CAN SOURCE. ─────────────────────────────────
   The register, tabbed by kind. A kind with no figures still gets a panel and
   states its own emptiness — that is the difference between a register and a
   selection, and eleven of the twenty-three entries are in that position. */
B.register = () => {
  const panels = KIND_ORDER.map((k) => {
    const mine = FIGS.filter(f => f.item.kind === k);
    const emptyItems = ITEMS.filter(i => i.kind === k && !(i.figures || []).length);
    const body = mine.length
      ? `<div class="ip-reg">\n${mine.map(figRow).join('\n')}\n      </div>`
      : '';
    const note = emptyItems.length
      ? hole(`${emptyItems.length === 1 ? 'One' : emptyItems.length} ${KIND_LABEL[k].toLowerCase()} `
        + `${emptyItems.length === 1 ? 'carries' : 'carry'} no figure at all: `
        + `${emptyItems.map(i => i.name).join(', ')}. Not padded, not estimated, not left out.`)
      : '';
    return [`${KIND_LABEL[k]} <span class="ip-tab-n">${mine.length}</span>`,
      `\n${body}\n${note}\n      `];
  });
  return `${opener('register', IMPACT.register.head, esc(IMPACT.register.lead))}
    <div class="wrap">
${KIND_LEGEND}
${S.tabs('Figures by kind', panels)}
      <div class="p-method"><p class="cap">${esc(IMPACT.register.note)}</p></div>
    </div>`;
};

/* ── BAND 5. FOUR CLAIMS WAITING ON ONE NUMBER EACH. ─────────────────────
   Named holes, dotted. Each says what it would take — `unlocks` is the field
   that stops a hole being an apology (SITUATION-PAGE-TEMPLATE.md §3). */
B.waiting = () => `${opener('waiting', IMPACT.waiting.head, esc(IMPACT.waiting.lead))}
    <div class="wrap">
${IMPACT.waiting.claims.map(c => `      <div class="ip-claim">
${hole(c.what)}
        <p class="cap ip-unlock">${esc(c.unlocks)}</p>
      </div>`).join('\n')}
    </div>`;

/* ── BAND 6. WHAT IT LOOKED LIKE. ────────────────────────────────────────
   W-18 is the highest-priority note on this section: six flat blocks with a
   heading and prose in each reads as a slide deck, and the measurable proxy is
   photographs per page. Nine frames here plus the masthead's ten, against the
   2–3 that drew the complaint. Each alt describes the frame and the band's
   note refuses to caption any of them to a figure. */
B.sheet = () => `${opener('sheet', IMPACT.sheet.head, esc(IMPACT.sheet.lead))}
    <div class="wrap">
      <div class="ip-sheet">
${IMPACT.sheet.frames.map(fr => `        <figure class="ht ip-sh-c"><img class="duo" src="${fr.src}" alt="${esc(fr.alt)}" loading="lazy"></figure>`).join('\n')}
      </div>
      <p class="cap p-cite-b">${esc(IMPACT.sheet.note)}</p>
    </div>`;

/* ── BAND 7. HOLD US TO IT. ──────────────────────────────────────────────
   Mustard on the middle control only, which is the one that changes the page
   (§3.1 licenses hue on controls). Canonical routes, never a /design/ path:
   public/design/ is deleted before any deploy. */
B.act = () => `${opener('act', IMPACT.act.head, esc(IMPACT.act.lead))}
    <div class="wrap">
      <div class="ip-doors">
${IMPACT.act.doors.map((d, i) => `        <a class="ip-door${i === 1 ? ' b-1' : ''}" href="${d.href}">
          <p class="lbl ip-door-h">${esc(d.h)}${ARROW}</p>
          <p class="body ip-door-p">${esc(d.p)}</p>
        </a>`).join('\n')}
      </div>
    </div>`;

/* ═══ PAGE CSS ═══════════════════════════════════════════════════════════
   Every grid track is minmax(0,1fr), never a bare 1fr: `1fr` is
   minmax(auto,1fr) and auto is min-content, so a long child blows the track
   out from the inside. `section` carries overflow-x:clip, so the damage is
   INVISIBLE to a scrollWidth sweep — it silently crops instead. That defect
   shipped once on the About page's hero and is gated below. */
const PAGE_CSS = `
/* ── the masthead's own register, under the photograph ── */
.ip-standfirst{max-width:56ch}
.ip-rail{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:var(--gap-row) clamp(14px,2vw,32px);
  border-top:1px solid var(--hair);margin-top:var(--gap-block);padding-top:var(--gap-row)}
.ip-rail-c>*{margin:0;min-width:0}
.ip-rail-v{font-size:clamp(30px,4.2vw,52px);line-height:.95}
.ip-rail-l{color:var(--fg-3);margin-top:8px;max-width:22ch}
@media (max-width:760px){.ip-rail{grid-template-columns:repeat(2,minmax(0,1fr))}}

/* ── the four overlapping populations ── */
.ip-intro{max-width:62ch}
.ip-ovl{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:var(--gap-row) clamp(14px,2vw,30px);
  margin-top:var(--gap-row)}
.ip-ovl-c>*{margin:0;min-width:0}
.ip-ovl-v{font-size:clamp(26px,3.4vw,42px);line-height:.98}
.ip-ovl-l{margin-top:10px}
.ip-ovl-s{color:var(--ink-3);margin-top:10px}
.ip-ovl-n{color:var(--ink-3);max-width:64ch;margin-top:var(--gap-row)}
@media (max-width:760px){.ip-ovl{grid-template-columns:repeat(2,minmax(0,1fr))}}

/* ── the reach/effect pair ── */
.ip-pair{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--gap-row) clamp(24px,4vw,64px);
  border-top:1px solid var(--hair);padding-top:var(--gap-row)}
.ip-big>*{margin:0;min-width:0}
.ip-big-v{font-size:clamp(38px,6vw,84px);line-height:.92}
.ip-big-l{margin-top:14px}
.ip-big-s{color:var(--fg-3);margin-top:12px}
@media (max-width:640px){.ip-pair{grid-template-columns:minmax(0,1fr)}}

/* ── the register ── */
.ip-reg{margin-top:var(--gap-row)}
.ip-prov{display:block;color:var(--ink-3);margin-top:5px}
.ip-basis{white-space:nowrap}
.ip-tab-n{font-variant-numeric:tabular-nums;opacity:.6;margin-left:6px}

/* ── the four waiting claims ── */
.ip-claim+.ip-claim{margin-top:var(--gap-block)}
.ip-unlock{color:var(--ink-3);max-width:62ch;margin:10px 0 0 16px}

/* ── the photo sheet. W-18: this band is why the page is not a slide deck. ── */
.ip-sheet{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(8px,1.2vw,16px);
  margin-top:var(--gap-row)}
.ip-sh-c{margin:0;aspect-ratio:4/3;min-width:0}
.ip-sh-c>img{width:100%;height:100%;object-fit:cover;display:block}
.ip-sh-c:nth-child(1),.ip-sh-c:nth-child(8){grid-column:span 2;aspect-ratio:8/3}
@media (max-width:760px){.ip-sheet{grid-template-columns:repeat(2,minmax(0,1fr))}
  .ip-sh-c:nth-child(1),.ip-sh-c:nth-child(8){grid-column:span 2;aspect-ratio:2/1}}

/* ── the doors ── */
.ip-doors{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(14px,2vw,28px);
  border-top:1px solid var(--hair);margin-top:var(--gap-block);padding-top:var(--gap-row)}
.ip-door{display:block;text-decoration:none;color:inherit;border:1px solid var(--hair);
  padding:clamp(16px,2vw,24px);min-width:0}
.ip-door:hover{border-color:var(--fg-2)}
.ip-door.b-1{border-color:var(--mustard)}
.ip-door.b-1 .ip-door-h{color:var(--mustard)}
.ip-door-h{display:flex;align-items:center;gap:8px;margin:0}
.ip-door-h svg{width:16px;height:16px;flex:0 0 auto}
.ip-door-p{color:var(--fg-2);margin:12px 0 0}
@media (max-width:760px){.ip-doors{grid-template-columns:minmax(0,1fr)}}
`;

/* ═══ WRITE ══════════════════════════════════════════════════════════════ */
const OUT = await S.assemble({
  file: 'impact.html',
  title: 'Impact &mdash; Swechha',
  bands: BANDS, index: INDEX, sh, clashes,
  pageCss: PAGE_CSS,
  /* AD-19 §5: `aria-current="page"` ONLY where the href equals the URL being
     built. `/impact` IS a nav word, so it takes "page" — unlike a situation
     page, which marks Now with "true" because its href is the index, not
     itself. The shell cannot derive this (the family is the six situations),
     so it is passed. */
  navMark: { current: 'Impact', url: '/impact' },
  sectionFor: (id) => (B[id] || (() => '    <div class="wrap"><p class="lead">&mdash;</p></div>'))(),
  note: `${BANDS.length} bands + footer. ${FIGS.length} figures across ${WITH_FIGS.length} of `
      + `${ITEMS.length} entries (${FIGS.filter(f => f.basis === 'modelled').length} modelled), `
      + `${IMPACT.waiting.claims.length} claims waiting, ${FRAMES.length} frames.`,
});

/* ═══ POST-WRITE GATES ═══════════════════════════════════════════════════ */
let fail = 0;
const gate = (ok, msg) => { if (!ok) { console.error(`  FAIL ${msg}`); fail++; } else console.log(`  ok   ${msg}`); };
console.log('\nGATES');

/* 1. THE PAGE DOES NOT PRINT A TOTAL. The whole point, and it is checkable
      rather than promised. Tested in every format the number could take:
      grouped Indian and Western, bare, and the compact forms. */
/* Exact formats only, plus the one-decimal million. The INTEGER million form
   ("2 million") is deliberately NOT tested: rounding a 21,76,457 sum to two
   million collides with Bridge the Gap's real published figure, so the gate
   would fire on a legitimate number. A total rounded that hard is not the
   failure mode anyway — the lie this gate exists to catch is a precise-looking
   sum, and any real figure on the page is excluded by construction below. */
const REAL = new Set(FIGS.map(f => String(f.value)));
const fmts = (n) => [
  n.toLocaleString('en-IN'), n.toLocaleString('en-US'), String(n),
  `${(n / 1e6).toFixed(1)} million`, `${(n / 1e5).toFixed(1)} lakh`,
].filter(t => !REAL.has(t));
const leaked = [...new Set([...fmts(FORBIDDEN_SUM), ...fmts(OVERLAP_SUM)])].filter(t => OUT.includes(t));
gate(leaked.length === 0,
  `no total is printed — the ${PEOPLE.length} people-figures sum to ${FORBIDDEN_SUM.toLocaleString('en-IN')} `
  + `and the four overlapping ones to ${OVERLAP_SUM.toLocaleString('en-IN')}; neither appears`
  + `${leaked.length ? `. LEAKED: ${leaked.join(', ')}` : ''}`);

/* 2. EVERY FIGURE ON THE PAGE MATCHES THE ITEM IT CAME FROM. The page is
      generated from that data, so this cannot fail by editing — it fails if
      somebody adds a typed figure, which is the thing to catch. */
const unrendered = FIGS.filter(f => !OUT.includes(num(f.value)));
gate(unrendered.length === 0,
  `all ${FIGS.length} figures render${unrendered.length ? `; MISSING: ${unrendered.map(f => f.value).join(', ')}` : ''}`);

/* 3. THE BASIS MARKER IS ON EVERY FIGURE, AND THE LEGEND IS PRESENT BECAUSE A
      MODELLED FIGURE EXISTS. An unexplained dotted rule is worse than none. */
const nMod = FIGS.filter(f => f.basis === 'modelled').length;
gate((OUT.match(/p-kd-m/g) || []).length >= nMod, `every modelled figure carries the dotted rule (${nMod})`);
gate(nMod === 0 || OUT.includes('Counted or measured'), 'the counted/modelled legend is present');

/* 4. EVERY WAITING CLAIM IS A DOTTED HOLE, NOT A BLANK. */
gate((OUT.match(/class="p-hole"/g) || []).length >= IMPACT.waiting.claims.length,
  `all ${IMPACT.waiting.claims.length} waiting claims render as named holes`);

/* 5. NO STATE CHIP. The four-word cadence vocabulary belongs to a page with a
      feed; borrowing it here would spend it for nothing. */
/* Tested on RENDERED TEXT ONLY. The first version of this gate tested the raw
   file and fired on the inherited stylesheet's own comments, which explain the
   four-word vocabulary, and on a footer comment reading "scraped from the LIVE
   SITE". A state chip is a rendered element; a word inside a CSS comment is
   not one, and a gate that cannot tell the difference gets switched off by the
   next person to see it fail. */
const RENDERED = OUT
  .replace(/<style[\s\S]*?<\/style>/gi, '')
  .replace(/<script[\s\S]*?<\/script>/gi, '')
  .replace(/<!--[\s\S]*?-->/g, '');
gate(!/\b(LIVE|PERIODIC|OUT OF SEASON|NO SEASON)\b/.test(RENDERED),
  'no source-cadence state word in the rendered page (no feed here)');

/* 6. NO RED. There is no published limit on this page to break (§3.1). */
gate(!/--red\b/.test(PAGE_CSS), 'no red in the page CSS');

/* 7. NO BAND ID COLLIDES WITH A NAV WORD. A band called `impact` would light
      the nav's Impact from the wrong place; `farm`/`record` point at the
      homepage. Reserved set is derived from the nav, not typed. */
const NAV_IDS = new Set(S.NAV.map(([, h]) => (h.match(/#([\w-]+)$/) || [])[1]).filter(Boolean));
const NAV_WORDS = new Set(S.NAV.map(([t]) => t.toLowerCase()));
const collide = BANDS.map(b => b[0]).filter(id => NAV_IDS.has(id) || NAV_WORDS.has(id));
gate(collide.length === 0, `no band id collides with a nav word${collide.length ? `; COLLIDING: ${collide.join(', ')}` : ''}`);

/* 8. NO BARE `1fr` TRACK. Invisible to an overflow sweep; see PAGE_CSS. */
const bareFr = [...PAGE_CSS.matchAll(/grid-template-columns:[^;}]*(?<![\w),])1fr\b[^;}]*/g)]
  .map(m => m[0]).filter(t => !t.includes('minmax(0,1fr)'));
gate(bareFr.length === 0, `every grid track is minmax(0,1fr)${bareFr.length ? `; BARE: ${bareFr.join(' | ')}` : ''}`);

/* 9. W-18: THE PHOTOGRAPH BUDGET. The pre-freeze prototypes ran 9–15 a page;
      the first work pages shipped 2–3 and drew "there is no use of photos". */
const imgs = (OUT.match(/<img class="duo"/g) || []).length;
gate(imgs >= 7 && imgs <= 12, `${imgs} photographs — inside W-18's 7–12 band`);

/* 10. NO /design/ PATH IN A HREF. public/design/ is deleted before deploy, so
       one of these is a 404 at the port. */
/* Scoped to THIS PAGE'S OWN CONTENT, because the inherited footer carries one
   and it is not this build's to fix. FINDING, recorded in AD-22: the frozen
   homepage's footer links "The system sheet" at /design/v3/system.html, so
   that href is in sh.FOOTER and therefore on EVERY page built through this
   shell — about.html, intelligence.html and all six situations — as well as on
   home.html itself. `public/design/` is deleted before any deploy, so it is a
   site-wide 404 waiting to happen. Reported rather than patched here: the
   footer belongs to the hand-maintained homepage. */
const OWN = OUT.split('<footer')[0];
const designHrefs = [...OWN.matchAll(/href="(\/design\/[^"]*)"/g)].map(m => m[1]);
gate(designHrefs.length === 0, `no /design/ href in this page's own bands${designHrefs.length ? `; FOUND: ${[...new Set(designHrefs)].join(', ')}` : ''}`);
const footerDesign = [...OUT.matchAll(/href="(\/design\/[^"]*)"/g)].map(m => m[1]);
if (footerDesign.length) console.log(`  note INHERITED footer carries ${footerDesign.length} /design/ href(s) — `
  + `${[...new Set(footerDesign)].join(', ')} — present on every page built on this shell. See AD-22.`);

/* 11. EVERY INDEX CHIP RESOLVES TO A BAND ON THIS PAGE. */
for (const [, href] of INDEX) gate(OUT.includes(`id="${href.slice(1)}"`), `index chip ${href} resolves`);

/* 12. THE NAV MARKS IMPACT, AND MARKS IT `page`. */
gate(/<a class="nl" href="\/impact" aria-current="page">Impact<\/a>/.test(OUT),
  'the nav marks Impact with aria-current="page"');

/* 13. EVERY BAND HAS A HEADING. W-22: a band that prints its own internal id
       to a reader is worse than a build that stops. */
const headless = BANDS.map(b => b[0]).filter(id => id !== 'top' && !OUT.includes(`id="${id}-h"`));
gate(headless.length === 0, `every band carries a heading${headless.length ? `; HEADLESS: ${headless.join(', ')}` : ''}`);

if (fail) {
  console.error(`\n${fail} gate(s) failed. The file is written — fix the generator and rebuild.`);
  process.exit(1);
}
console.log(`\n${OUT.length.toLocaleString('en-IN')} bytes. All gates pass.`);
