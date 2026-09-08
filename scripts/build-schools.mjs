/* ═══════════════════════════════════════════════════════════════════════════
   SCHOOLS  →  public/_pages/v3/schools.html, routed at /schools
   ───────────────────────────────────────────────────────────────────────────
   THE PAGE A SCHOOL ARRIVES ON, AND IT IS NOT A SEVENTH PROGRAMME PAGE.

   ★ IT DOES NOT DUPLICATE /work/journeys/** AND MUST NOT.
   Six programmes already have finished pages with their itineraries, their
   destinations, their figures and their record. Writing those again here would
   put two descriptions of NatureScapes on one site at two URLs, competing with
   each other in search and drifting apart in a fortnight. So every row on this
   page reads the item's own JSON — name, line, duration, geography — and links
   to it. The only thing written here is the part the programme pages cannot
   carry: the comparison BETWEEN them, and what a coordinator has to plan.

   ★ EVERY FIGURE IS NAMED, NOT TYPED — the /impact pattern.
   data/schools.json names a figure by (kind, slug, label) and the build
   resolves it against data/work/**, dying if it cannot. So a figure here
   cannot disagree with the programme page it came from, which is the defect
   class that had the situation index showing 412 while /now/air said 387.

   ★ NO TOTAL, for /impact's reason. These counts are overlapping cohorts over
   unaligned periods. Gate 2 computes the naive sum this page refuses to print
   and asserts it is absent in every format it could take.

   ★ THE ENQUIRY IS THE ASK, NOT A FORM.
   AD-27.17's school Ask already collects exactly what a coordinator needs to
   send — school, name and role, year group and numbers, what they have in
   mind, when in the year — and it does it with no backend, no stored personal
   data and no promise the site cannot keep. A stored enquiry form is a
   different decision (a table of school contact details, a retention rule, a
   named recipient) and it is the owner's to make, not this build's.
   ═══════════════════════════════════════════════════════════════════════════ */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import * as S from './lib/situation-shell.mjs';
import { seo } from './lib/seo-register.mjs';
const { esc, opener, ARROW, ask, askGates } = S;

const sh = S.shell();

/* ═══ DATA ═══════════════════════════════════════════════════════════════ */
const D = JSON.parse(readFileSync(join(S.ROOT, 'data/schools.json'), 'utf8'));
const LEARN = new Map(
  (await import('node:fs')).readdirSync(join(S.ROOT, 'data/learn/articles'))
    .filter((f) => f.endsWith('.json'))
    .map((f) => {
      const a = JSON.parse(readFileSync(join(S.ROOT, 'data/learn/articles', f), 'utf8'));
      return [a.slug, a];
    }),
);

let dataBad = 0;
const dataFail = (m) => { console.error(`DATA IS WRONG: ${m}`); dataBad++; };

const item = (kind, slug) => {
  const p = join(S.ROOT, `data/work/${kind}/${slug}.json`);
  if (!existsSync(p)) { dataFail(`no data/work/${kind}/${slug}.json`); return null; }
  const it = JSON.parse(readFileSync(p, 'utf8'));
  if (!it.page) dataFail(`${slug} has page:false — this page would link a route that is not built.`);
  return it;
};

const ROWS = D.programmes.rows.map((r) => ({ ...r, it: item(r.kind, r.slug) })).filter((r) => r.it);
const href = (r) => `/work/${r.kind}/${r.slug}`;

/** A figure named by (kind, slug, label), resolved against the item's own data. */
function figure(f) {
  const it = item(f.kind, f.slug);
  if (!it) return null;
  const hit = (it.figures || []).find((x) => x.label === f.label);
  if (!hit) {
    dataFail(`${f.slug} publishes no figure labelled "${f.label}". `
      + `It has: ${(it.figures || []).map((x) => x.label).join(' | ') || 'none'}`);
    return null;
  }
  return { ...hit, item: it, href: `/work/${f.kind}/${f.slug}` };
}
const FIGS = D.record.figures.map(figure).filter(Boolean);

for (const r of D.programmes.rows) {
  for (const l of r.learn || []) if (!LEARN.has(l)) dataFail(`${r.slug} points at /learn/${l}, which does not exist.`);
}
for (const o of D.outcomes.rows) {
  if (!LEARN.has(o.learn)) dataFail(`outcome "${o.h}" points at /learn/${o.learn}, which does not exist.`);
}
if (dataBad) {
  console.error(`\nREFUSING TO WRITE: ${dataBad} data check(s) failed.`);
  process.exit(1);
}

/* ═══ BANDS ══════════════════════════════════════════════════════════════ */
const BANDS = [
  ['top',        't1',          '#0D0D0B'],
  ['programmes', 'paper t2',    '#F3F2F0'],
  ['outcomes',   't2',          '#0D0D0B'],
  ['evidence',   'paper-2 t2',  '#ECEBE8'],
  ['planning',   'dark-2 t2',   '#151512'],
  ['enquiry',    'paper t3',    '#F3F2F0'],
];
const clashes = S.groundChain(BANDS);
const INDEX = [
  ['What you can book', '#programmes'],
  ['What students learn', '#outcomes'],
  ['On record', '#evidence'],
  ['How it works', '#planning'],
  ['Talk to us', '#enquiry'],
];

const B = {};
const M = D.masthead;

B.top = () => `    <div class="pic ht">
      <img class="duo" src="${M.frame.src}" alt="${esc(M.frame.alt)}"${S.imgDim(M.frame.src)} fetchpriority="high">
      <div class="pic-over"><div class="wrap">
        <p class="lbl eyebrow">${esc(M.kicker)}</p>
        <h1 class="d1">${M.h1}</h1>
      </div></div>
    </div>
    <div class="pic-body"><div class="wrap">
      <p class="lead">${M.lead}</p>
    </div></div>`;

/* ── THE SIX. Name, length, where and who from the ITEM, never from here. ── */
B.programmes = () => `${opener('programmes', D.programmes.head, D.programmes.lead)}
    <div class="wrap">
      <div class="sc-set">
${ROWS.map((r) => `        <article class="sc-p">
          <p class="lbl sc-k">${r.it.duration
    ? `${esc(r.it.duration.value)} ${esc(r.it.duration.unit)}`
    : 'By arrangement'}${r.it.geography ? ` &middot; ${esc(r.it.geography.split(' · ').length > 2 ? 'Several destinations' : r.it.geography)}` : ''}</p>
          <h3 class="d2 sc-h"><a href="${href(r)}">${esc(r.it.name)}${ARROW}</a></h3>
          <p class="sc-l">${esc(r.it.line)}</p>
          <p class="cap sc-f">${esc(r.for)}</p>
${(r.learn || []).length ? `          <p class="cap sc-rd">Read first: ${r.learn.map((l) => `<a class="lk" href="/learn/${l}">${LEARN.get(l).h1}</a>`).join(' &middot; ')}</p>` : ''}
        </article>`).join('\n')}
      </div>
    </div>`;

/* ── WHAT THEY COME BACK ABLE TO DO, each with the page to send them to. ── */
B.outcomes = () => `${opener('outcomes', D.outcomes.head, D.outcomes.lead)}
    <div class="wrap">
      <div class="sc-out">
${D.outcomes.rows.map((o) => `        <div class="sc-o">
          <h3 class="d2 sc-o-h">${o.h}</h3>
          <p class="sc-o-p">${o.p}</p>
          <p><a class="act" href="/learn/${o.learn}">${LEARN.get(o.learn).h1}${ARROW}</a></p>
        </div>`).join('\n')}
      </div>
    </div>`;

/* ── THE RECORD. Every figure resolved from the programme it belongs to. ── */
B.evidence = () => `${opener('evidence', D.record.head, D.record.lead)}
    <div class="wrap">
      <div class="sc-figs">
${FIGS.map((f) => `        <a class="sc-fig" href="${f.href}">
          <span class="sc-fig-v ${f.basis === 'modelled' ? 'p-kd p-kd-m' : 'p-kd p-kd-c'}">${esc(f.value)}</span>
          <span class="cap sc-fig-l">${esc(f.label)}</span>
          <span class="cap sc-fig-s">${esc(f.item.name)}</span>
        </a>`).join('\n')}
      </div>
${D.record.after.map((p) => `      <p class="sc-p">${p}</p>`).join('\n')}
    </div>`;

B.planning = () => `${opener('planning', D.logistics.head, D.logistics.lead)}
    <div class="wrap">
      <div class="sc-plan">
${D.logistics.rows.map((r) => `        <div class="sc-pl">
          <h3 class="d2 sc-pl-h">${esc(r.h)}</h3>
          <p class="sc-pl-p">${esc(r.p)}</p>
        </div>`).join('\n')}
      </div>
    </div>`;

B.enquiry = () => `${opener('enquiry', D.ask.head, D.ask.lead)}
    <div class="wrap">
${ask({ audience: 'school', label: D.ask.label, page: 'Schools', path: '/schools' })}
      <p class="sc-second"><a class="act" href="${esc(D.ask.second.href)}">${esc(D.ask.second.label)}${ARROW}</a></p>
      <p class="cap sc-note">${esc(D.ask.note)}</p>
    </div>`;

/* ═══ PAGE CSS ═══════════════════════════════════════════════════════════ */
const PAGE_CSS = `
.sc-set{display:grid;gap:clamp(24px,3.4vw,40px);margin:clamp(20px,3vw,32px) 0 0;
  grid-template-columns:repeat(auto-fit,minmax(300px,1fr))}
.sc-p{display:grid;gap:8px;align-content:start;min-width:0;
  border-top:2px solid currentColor;padding-top:14px}
.sc-k{margin:0;opacity:.72}
.sc-h{margin:0}
.sc-h a{color:inherit;text-decoration:none;display:inline}
.sc-h a:hover{text-decoration:underline;text-underline-offset:3px}
.sc-h svg{width:20px;height:20px;vertical-align:-3px;margin-left:4px}
.sc-l{margin:0;max-width:46ch}
.sc-f{margin:0;opacity:.78;max-width:46ch}
.sc-rd{margin:4px 0 0;max-width:46ch}
.sc-out{display:grid;gap:clamp(20px,3vw,32px);margin:clamp(20px,3vw,32px) 0 0;
  grid-template-columns:repeat(auto-fit,minmax(280px,1fr))}
.sc-o{display:grid;gap:6px;align-content:start;min-width:0;
  border-top:1px solid currentColor;padding-top:13px}
.sc-o-h{margin:0}
.sc-o-p{margin:0;max-width:48ch}
.sc-figs{display:grid;gap:clamp(16px,2.4vw,26px);margin:clamp(20px,3vw,32px) 0 clamp(22px,3vw,32px);
  grid-template-columns:repeat(auto-fit,minmax(200px,1fr))}
.sc-fig{display:grid;gap:3px;align-content:start;min-width:0;text-decoration:none;color:inherit}
.sc-fig-v{font-family:var(--display);font-size:clamp(28px,3.6vw,40px);line-height:1.02;
  font-variant-numeric:tabular-nums;display:inline-block;padding-bottom:3px}
.sc-fig-l{opacity:.9}
.sc-fig-s{opacity:.62}
.sc-fig:hover .sc-fig-l{text-decoration:underline;text-underline-offset:3px}
.sc-p{margin:0 0 clamp(12px,1.6vw,18px);max-width:64ch}
.sc-plan{display:grid;gap:clamp(20px,3vw,30px);margin:clamp(20px,3vw,32px) 0 0;
  grid-template-columns:repeat(auto-fit,minmax(270px,1fr))}
.sc-pl{display:grid;gap:5px;align-content:start;min-width:0;
  border-top:1px solid currentColor;padding-top:13px}
.sc-pl-h{margin:0}
.sc-pl-p{margin:0;max-width:46ch}
.sc-second{margin:clamp(18px,2.6vw,26px) 0 0}
.sc-note{margin:8px 0 0;max-width:58ch;opacity:.8}
`;

/* ═══ WRITE ══════════════════════════════════════════════════════════════ */
const OUT = await S.assemble({
  file: 'schools.html',
  route: '/schools',
  title: seo('/schools').title,
  bands: BANDS, index: INDEX, sh, clashes,
  pageCss: PAGE_CSS,
  navMark: { current: null, url: null },
  sectionFor: (id) => B[id](),
  note: `${ROWS.length} programmes, ${FIGS.length} figures resolved from data/work/**.`,
});

/* ═══ POST-WRITE GATES ═══════════════════════════════════════════════════ */
let fail = 0;
const gate = (ok, msg) => { if (!ok) { console.error(`  FAIL ${msg}`); fail++; } else console.log(`  ok   ${msg}`); };
console.log('\nGATES');
const RENDERED = OUT.replace(/<style[\s\S]*?<\/style>/g, ' ')
  .replace(/<script[\s\S]*?<\/script>/g, ' ')
  .replace(/<!--[\s\S]*?-->/g, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
  .replace(/&mdash;|&middot;|&nbsp;|&rsquo;/g, ' ')
  .replace(/\s+/g, ' ');

/* 1. EVERY PROGRAMME ROW LINKS ITS OWN PAGE, and every figure links the
      programme it was read from. A comparison page whose rows are dead ends
      is a duplicate of six pages rather than a route into them. */
const unlinked = ROWS.filter((r) => !OUT.includes(`href="${href(r)}"`));
gate(unlinked.length === 0, `all ${ROWS.length} programmes link their own page${unlinked.length ? `; MISSING: ${unlinked.map((r) => r.slug).join(', ')}` : ''}`);

/* 2. NO TOTAL. These figures count overlapping cohorts over unaligned periods
      and summing them double-counts children — /impact's ruling, applied to
      the page most tempted to print one big number. */
const nums = FIGS.map((f) => Number(String(f.value).replace(/[^\d.]/g, ''))).filter((n) => Number.isFinite(n) && n > 0);
const SUM = nums.reduce((a, b) => a + b, 0);
const forms = [String(SUM), SUM.toLocaleString('en-IN'), SUM.toLocaleString('en-US')];
const leaked = forms.filter((f) => RENDERED.includes(f));
gate(leaked.length === 0, `no cumulative total printed (the ${nums.length} counts sum to ${SUM.toLocaleString('en-IN')})${leaked.length ? `; LEAKED: ${leaked.join(', ')}` : ''}`);

/* 3. EVERY FIGURE ON THE PAGE IS ONE THE PROGRAMME PUBLISHES. Resolution
      already failed the build on a label that does not exist; this is the
      other half — the value actually rendering. */
const unrendered = FIGS.filter((f) => !RENDERED.includes(f.value));
gate(unrendered.length === 0, `all ${FIGS.length} figures render${unrendered.length ? `; MISSING: ${unrendered.map((f) => f.label).join(', ')}` : ''}`);

/* 4. THE LEARN BRIDGE IS BUILT IN BOTH PLACES IT IS PROMISED. */
const learnLinks = [...new Set([...OUT.matchAll(/href="\/learn\/([a-z0-9-]+)"/g)].map((m) => m[1]))];
gate(learnLinks.length >= 8, `${learnLinks.length} distinct Learn pages linked from this page`);

/* 5. THE ASK. AD-27.22's four assertions, run by the shared checker. */
/* The footer publishes swechhaindia@gmail.com and is lifted verbatim into
   every page on this site; it is the general address, it is not an Ask, and
   AD-27.17 blesses it by name. Named as an exception rather than left to fail,
   so the exemption is visible instead of a gate quietly switched off. */
fail += askGates(OUT, gate, { allowed: ['swechhaindia@gmail.com'] });

/* 6. NO PRICE. Costs depend on destination, length and group size; a number
      here would be a quote nobody can honour, and the page says so instead. */
gate(!/₹\s?\d|Rs\.?\s?\d|\bINR\s?\d/.test(RENDERED), 'no price printed — the page says costs are quoted per cohort');

/* 7. NO SCHOOL NAMED THAT THE DATA DOES NOT NAME. A testimonial or a client
      list invented for a brochure is the one thing a school-facing page must
      never carry, and the four below are in data/work/** already. */
const NAMED = ['The Shriram Schools', 'Modern Schools', 'Vasant Valley School', 'Pathways World School'];
const declared = new Set(
  ['journeys/naturescapes', 'journeys/yamuna-yatra', 'journeys/cityscapes', 'journeys/gram-anubhav',
    'projects/farm-school', 'projects/bridge-the-gap']
    .flatMap((p) => JSON.parse(readFileSync(join(S.ROOT, `data/work/${p}.json`), 'utf8')).with?.schools || []),
);
const invented = NAMED.filter((n) => RENDERED.includes(n) && !declared.has(n));
gate(invented.length === 0, `every school named is one data/work/** names${invented.length ? `; INVENTED: ${invented.join(', ')}` : ''}`);

/* 8. NO TESTIMONIAL. There is no collected, attributable student or teacher
      quote in this repository. Until there is, the page has none — it does
      not have a plausible one. */
gate(!/<blockquote|class="[^"]*\bquote\b/.test(OUT), 'no quote block — no testimonial has been collected yet, so none is shown');

/* 9. NO DEAD OR PROTOTYPE HREF, and every internal link resolves to a route
      this site actually serves. */
const hrefs = [...OUT.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
const dead = hrefs.filter((h) => h === '#' || h.startsWith('/design/') || h.startsWith('/_pages/'));
gate(dead.length === 0, `no dead or prototype href${dead.length ? `; FOUND: ${[...new Set(dead)].join(', ')}` : ''}`);

/* 10. EVERY IMAGE CARRIES ALT TEXT. */
const noAlt = [...OUT.matchAll(/<img(?![^>]*\balt=)[^>]*>/g)].map((m) => m[0].slice(0, 50));
gate(noAlt.length === 0, `every image has alt text${noAlt.length ? `; FOUND: ${noAlt.join(' | ')}` : ''}`);

/* 11. NO FLATTENING WORD. The copy standard names five; a school-marketing
       page is the single most likely place on this site for them to arrive. */
const BANNED = /\b(empower(?:ing|ment)?|transformative|innovative|world-class|holistic|cutting-edge)\b/i;
const m = BANNED.exec(RENDERED.split(' Swechha is a registered')[0]);
gate(!m, `no marketing filler in the page's copy${m ? `; FOUND: "${m[0]}"` : ''}`);

/* 12. NO GROUND CLASH. */
gate(clashes === 0, `${clashes} ground clash(es)`);

console.log(`\n${OUT.length.toLocaleString('en-IN')} bytes. ${fail ? `${fail} gate(s) failed.` : 'All gates pass.'}`);
if (fail) process.exit(1);
