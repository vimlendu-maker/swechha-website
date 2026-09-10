/* ═══════════════════════════════════════════════════════════════════════════
   JOURNAL  →  public/_pages/v3/journal.html + journal/<slug>.html
   routed at /journal and /journal/<slug>
   ───────────────────────────────────────────────────────────────────────────
   THE DATED SECTION. Everything else on this site is either a live reading, an
   evergreen explanation or an archive; this is the one place that says "on this
   date, this happened, and here is what our own data showed".

   ★ NOTHING IS PUBLISHED THAT A PERSON HAS NOT APPROVED.
   An article file carries `publish_state` and `approved_by`. This generator
   builds a page for an article only when the state is `published` AND a named
   person has approved it. A draft has no page, no route and no URL — which is
   the same rule `data/climate-events/` already runs on, and it is deliberate
   reuse rather than a second mechanism: an event the detector scored below its
   bar has nowhere to be found, and neither does an unreviewed article.

   ★ A JOURNAL FIGURE IS SNAPSHOTTED, NOT REFERENCED — THE OPPOSITE OF /learn.
   A Learn page addresses the live dataset, because an explainer must never go
   stale. A Journal article must never MOVE: it is dated, it made a claim on a
   day, and a figure that silently updates under a published date is a
   falsified record. So every figure here is typed WITH the observation stamp
   it was true at and the source that published it, and gate 3 refuses one
   without either. This is the single most important rule in the file.

   ★ EVERY ARTICLE STATES WHAT IS UNCERTAIN.
   Not as a disclaimer — as content. `known` and `uncertain` are separate
   required lists, and an article with an empty `uncertain` does not build.
   The same gate lib/climate-events.mjs applies to a published event.

   ★ THE FIVE TYPES ARE NOT BLURRED.
   Reporting, analysis, news, education and record are declared per article and
   shown to the reader as a chip, because "what kind of thing am I reading" is
   the question a mixed feed usually refuses to answer.
   ═══════════════════════════════════════════════════════════════════════════ */
import { readFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import * as S from './lib/situation-shell.mjs';
import { seo } from './lib/seo-register.mjs';
const { esc, opener, ARROW } = S;

const sh = S.shell();
const DIR = join(S.ROOT, 'data/journal/articles');

/* The five, and what each one is FOR. A chip a reader can act on. */
const TYPES = {
  reporting: { label: 'Original reporting', note: 'Work Swechha did, first published here.' },
  analysis:  { label: 'Data analysis', note: 'A finding derived from published data, with the derivation shown.' },
  news:      { label: 'Current events', note: 'Something that happened, with what is known and what is not.' },
  education: { label: 'Education', note: 'Written for a classroom as much as for a reader.' },
  record:    { label: 'From the record', note: 'Drawn out of the archive this site keeps.' },
};

let dataBad = 0;
const dataFail = (m) => { console.error(`DATA IS WRONG: ${m}`); dataBad++; };

const LEARN = new Set(existsSync(join(S.ROOT, 'data/learn/articles'))
  ? readdirSync(join(S.ROOT, 'data/learn/articles')).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5))
  : []);

const ALL = readdirSync(DIR).filter((f) => f.endsWith('.json'))
  .map((f) => ({ file: f, ...JSON.parse(readFileSync(join(DIR, f), 'utf8')) }));

/* ═══ THE APPROVAL GATE, BEFORE ANYTHING ELSE ════════════════════════════ */
const DRAFTS = ALL.filter((a) => a.publish_state !== 'published' || !a.approved_by);
const ARTICLES = ALL.filter((a) => a.publish_state === 'published' && a.approved_by)
  .sort((a, b) => String(b.date).localeCompare(String(a.date)));

for (const d of DRAFTS) {
  console.log(`  held  ${d.file} — ${d.publish_state !== 'published' ? `state "${d.publish_state}"` : 'no approver named'}. No page, no route.`);
}

/* ═══ DATA GATES ═════════════════════════════════════════════════════════ */
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;
for (const a of ARTICLES) {
  const w = `journal/${a.slug}`;
  if (!SLUG_RE.test(a.slug || '')) dataFail(`${a.file}: "${a.slug}" is not a kebab-case slug.`);
  if (!TYPES[a.type]) dataFail(`${w}: type "${a.type}" is not one of ${Object.keys(TYPES).join(', ')}.`);
  if (!ISO_RE.test(a.date || '')) dataFail(`${w}: date must be YYYY-MM-DD, got ${JSON.stringify(a.date)}.`);
  if (!a.standfirst || a.standfirst.length < 60) dataFail(`${w}: no standfirst, or too short to be one.`);
  for (const k of ['happened', 'matters', 'known', 'uncertain', 'watch', 'sources']) {
    if (!Array.isArray(a[k]) || !a[k].length) dataFail(`${w}: "${k}" is required and must not be empty.`);
  }
  /* ★ THE SNAPSHOT RULE. */
  for (const f of a.figures || []) {
    if (f.ref) dataFail(`${w}: figure "${f.label}" carries a ref. A dated article snapshots its numbers — `
      + 'a figure that updates under a published date falsifies the record. Type the value and its observation stamp.');
    if (f.value == null) dataFail(`${w}: figure "${f.label}" has no value.`);
    if (!f.observed) dataFail(`${w}: figure "${f.label}" has no observation stamp.`);
    if (!f.source) dataFail(`${w}: figure "${f.label}" does not name a source.`);
    if (!['counted', 'measured', 'modelled'].includes(f.basis)) {
      dataFail(`${w}: figure "${f.label}" has basis ${JSON.stringify(f.basis)} — must be counted, measured or modelled.`);
    }
  }
  for (const s of a.sources) {
    if (!s.url || !/^https?:\/\//.test(s.url)) dataFail(`${w}: source "${s.name}" has no absolute URL.`);
    if (!s.publisher) dataFail(`${w}: source "${s.name}" does not say who published it.`);
  }
  for (const l of a.related?.learn || []) if (!LEARN.has(l)) dataFail(`${w}: related Learn page "${l}" does not exist.`);
  if (!a.frame?.src) dataFail(`${w}: no lead photograph — the share card is derived from it.`);
  else if (!existsSync(join(S.ROOT, 'public', a.frame.src.replace(/^\//, '')))) dataFail(`${w}: ${a.frame.src} is not on disk.`);
  if (a.frame && !a.frame.alt) dataFail(`${w}: the lead photograph has no alt text.`);
  if (!a.approved_at || !ISO_RE.test(a.approved_at)) dataFail(`${w}: approved_at must be YYYY-MM-DD.`);
}
const slugs = ARTICLES.map((a) => a.slug);
for (const s of slugs.filter((v, i) => slugs.indexOf(v) !== i)) dataFail(`two articles claim slug "${s}".`);

if (dataBad) {
  console.error(`\nREFUSING TO WRITE: ${dataBad} data check(s) failed.`);
  process.exit(1);
}

/* ═══ PIECES ═════════════════════════════════════════════════════════════ */
const dateLabel = (iso) => {
  const [y, m, d] = iso.split('-');
  return `${Number(d)} ${S.MON[Number(m) - 1]} ${y}`;
};
const artHref = (slug) => `/journal/${slug}`;
/* A BAND OPENER THAT CAN HAVE NO LEAD. The copy pass cut several band leads
   outright; `opener()` always emits <p class="lead">, and an emptied one is
   still a grid row, still a margin and still a thing a screen reader walks
   into. Identical output to `opener()` when a lead is supplied. */
const openerNL = (id, head, lead) => (lead
  ? opener(id, head, lead)
  : opener(id, head, '').replace(/\s*<p class="lead"><\/p>/, ''));
const paras = (list, cls = 'jr-p') => list.map((p) => `      <p class="${cls}">${p}</p>`).join('\n');
const bullets = (list) => `        <ul class="jr-ul">\n${list.map((x) => `          <li>${x}</li>`).join('\n')}\n        </ul>`;

const figureRail = (figs) => !figs?.length ? '' : `      <div class="jr-figs">
${figs.map((f) => `        <div class="jr-fig">
          <p class="jr-fig-v ${f.basis === 'modelled' ? 'p-kd p-kd-m' : 'p-kd p-kd-c'}">${esc(String(f.value))}${f.unit ? ` <span class="jr-fig-u">${esc(f.unit)}</span>` : ''}</p>
          <p class="cap jr-fig-l">${esc(f.label)}</p>
          <p class="cap jr-fig-s">${esc(f.source)} &middot; observed ${esc(f.observed)}</p>
        </div>`).join('\n')}
      </div>
      <p class="p-legend"><span class="lbl p-kd p-kd-c">Counted or measured</span><span class="lbl p-kd p-kd-m">Modelled</span></p>`;

/* ═══ PAGE CSS ═══════════════════════════════════════════════════════════ */
const PAGE_CSS = `
.jr-meta{margin:0 0 10px;display:flex;flex-wrap:wrap;gap:10px 16px;align-items:baseline}
.jr-type{border:1px solid currentColor;padding:2px 9px;border-radius:2px}
.jr-p{margin:0 0 clamp(12px,1.6vw,18px);max-width:64ch}
.jr-p:last-child{margin-bottom:0}
.jr-stand{max-width:60ch;font-weight:500}
.jr-figs{display:grid;gap:clamp(16px,2.4vw,26px);margin:clamp(20px,3vw,30px) 0 14px;
  grid-template-columns:repeat(auto-fit,minmax(210px,1fr))}
.jr-fig{min-width:0}
.jr-fig-v{font-family:var(--display);font-size:clamp(28px,3.6vw,40px);line-height:1.02;margin:0 0 4px;
  font-variant-numeric:tabular-nums;display:inline-block;padding-bottom:3px}
.jr-fig-u{font-size:.5em;letter-spacing:.01em}
.jr-fig-l{margin:0}
.jr-fig-s{margin:2px 0 0}
.jr-split{display:grid;gap:clamp(22px,3.2vw,38px);margin:clamp(22px,3vw,32px) 0 0;
  grid-template-columns:repeat(auto-fit,minmax(280px,1fr))}
.jr-col{min-width:0;border-top:2px solid currentColor;padding-top:13px}
.jr-col h3{margin:0 0 8px}
.jr-ul{margin:0;padding-left:1.1em;display:grid;gap:8px}
.jr-ul li{max-width:52ch}
.jr-src{list-style:none;margin:clamp(16px,2.4vw,24px) 0 0;padding:0;display:grid;gap:13px;max-width:70ch}
/* NOTE: .jr-cite — the ruled "Suggested citation" block that used to sit on the
   sources band — was cut in the copy pass, and its rules went with it. */
.jr-src li{display:grid;gap:3px;border-top:1px solid currentColor;padding-top:11px}
.jr-doors{display:grid;gap:clamp(14px,2vw,20px);margin:clamp(18px,2.6vw,26px) 0 0;
  grid-template-columns:repeat(auto-fit,minmax(230px,1fr))}
.jr-door{display:grid;gap:5px;align-content:start;min-width:0;text-decoration:none;color:inherit;
  border-top:2px solid currentColor;padding-top:12px}
.jr-door-h{font-family:var(--display);font-size:clamp(19px,2.2vw,24px);line-height:1.14}
.jr-list{display:grid;gap:clamp(24px,3.4vw,40px);margin:clamp(20px,3vw,32px) 0 0}
.jr-i{display:grid;gap:7px;border-top:2px solid currentColor;padding-top:15px;max-width:74ch}
.jr-i-h{margin:0;font-family:var(--display);font-size:clamp(24px,3.2vw,34px);line-height:1.08}
.jr-i-h a{color:inherit;text-decoration:none}
.jr-i-s{margin:0;max-width:60ch}
.jr-kinds{display:grid;gap:clamp(16px,2.4vw,24px);margin:clamp(20px,3vw,32px) 0 0;
  grid-template-columns:repeat(auto-fit,minmax(230px,1fr))}
.jr-k{border-top:1px solid currentColor;padding-top:12px;min-width:0}
.jr-k h3{margin:0 0 4px}
.jr-k p{margin:0;max-width:40ch}
/* ── AD-50. THE AFFORDANCE IS TYPOGRAPHIC, NOT AN ICON. ──────────────────
   Every card, door and row in this section carried the shell's ARROW glyph.
   ARROW is a bare <svg viewBox="0 0 24 24"> with NO width or height of its
   own, and AD-40 had already recorded what that does — "as the third flex
   item in a stretch column the arrow took the card's full width and its 1:1
   viewBox made it that tall as well: measured 314x314 at 390px". This build
   read that note and then reproduced the bug in four new generators: thirty-
   two unsized arrows, and two of the generators had no sizing rule at all.

   Sizing them was the small fix. The owner asked for the arrow to stop being
   the device, and the site already has a better one: the footer's directory
   treatment, whose own note argues for it — "the underline is drawn in the
   HAIRLINE colour rather than the text colour ... so the column still reads
   as a directory rather than as twenty-four emphasised phrases; hover and
   focus take it to mustard along with the ink."

   So the cue is a hairline underline at rest, mustard on hover and focus. It
   satisfies AD-38's refusal of zero-cue blocks without an icon, it costs no
   vertical space — which is the space the cards get back as air — and it is
   already the language of the bottom of every page on this site.

   GROUND-AWARE, because --hair is rgba(251,248,240,.20): a light hairline
   for a dark ground, and invisible on paper. Paper takes --rule-2, the same
   split build-act-page.mjs makes for its own five classes. */
.jr-door-h,.jr-i-h a{text-decoration:underline;text-decoration-thickness:1px;
  text-underline-offset:5px;text-decoration-color:var(--hair);
  transition:text-decoration-color .14s ease}
.paper .jr-door-h,.paper-2 .jr-door-h,.paper .jr-i-h a,.paper-2 .jr-i-h a{text-decoration-color:var(--rule-2)}
.jr-door:hover .jr-door-h,.jr-door:focus-visible .jr-door-h,.jr-i-h a:hover,.jr-i-h a:focus-visible{text-decoration-color:var(--mustard)}
@media (prefers-reduced-motion:reduce){.jr-door-h,.jr-i-h a{transition:none}}

`;

const BANDS = [
  ['top',     't1',          '#0D0D0B'],
  ['account', 'paper t2',    '#F3F2F0'],
  ['data',    't2',          '#0D0D0B'],
  ['ours',    'paper-2 t2',  '#ECEBE8'],
  ['sources', 'dark-2 t2',   '#151512'],
  ['onward',  'paper t3',    '#F3F2F0'],
];

/* ═══ ARTICLES ═══════════════════════════════════════════════════════════ */
mkdirSync(join(S.V3, 'journal'), { recursive: true });
const written = [];

for (const a of ARTICLES) {
  const route = artHref(a.slug);
  const T = TYPES[a.type];
  const B = {
    top: () => `    <div class="pic ht">
      <img class="duo" src="${a.frame.src}" alt="${esc(a.frame.alt)}"${S.imgDim(a.frame.src)} fetchpriority="high">
      <div class="pic-over"><div class="wrap">
        <p class="lbl eyebrow">${esc(T.label)}</p>
        <h1 class="d1">${a.h1}</h1>
      </div></div>
    </div>
    <div class="pic-body"><div class="wrap">
      <p class="lbl jr-meta"><span class="jr-type">${esc(T.label)}</span>
        <span><time datetime="${a.date}">${dateLabel(a.date)}</time></span>
        <span>Swechha</span>
        <span><a class="lk" href="/journal">The Journal</a></span></p>
      <p class="lead jr-stand">${a.standfirst}</p>
    </div></div>`,

    account: () => `${opener('account', a.headings?.happened || 'What happened', a.leads?.happened || '')}
    <div class="wrap">
${paras(a.happened)}
      <h3 class="d2" style="margin:clamp(22px,3vw,30px) 0 10px">${esc(a.headings?.matters || 'Why it matters')}</h3>
${paras(a.matters)}
    </div>`,

    data: () => `${openerNL('data', a.headings?.data || 'What the data says', a.leads?.data)}
    <div class="wrap">
${figureRail(a.figures)}
${paras(a.data || [])}
    </div>`,

    ours: () => `${openerNL('ours', a.headings?.ours || 'What is known, and what is not', a.leads?.ours)}
    <div class="wrap">
${paras(a.ours || [])}
      <div class="jr-split">
        <div class="jr-col">
          <h3 class="d2">Known</h3>
${bullets(a.known)}
        </div>
        <div class="jr-col">
          <h3 class="d2">Uncertain</h3>
${bullets(a.uncertain)}
        </div>
      </div>
    </div>`,

    sources: () => `${opener('sources', 'Sources, and what to watch next',
      'Everything above is traceable to one of these.')}
    <div class="wrap">
      <ul class="jr-src">
${a.sources.map((s) => `        <li><a class="lk" href="${esc(s.url)}" rel="noopener">${esc(s.name)}</a>
          <span class="cap">${esc(s.publisher)}${s.note ? ` &middot; ${esc(s.note)}` : ''}</span></li>`).join('\n')}
      </ul>
      <div class="jr-split">
        <div class="jr-col">
          <h3 class="d2">What to watch</h3>
${bullets(a.watch)}
        </div>
      </div>
${/* ★ THE SOURCE LINE. NOTE: the "Suggested citation" box this comment used to
      describe — the derived <code> block and the "What you are citing" /
      four-layers paragraph — was cut in the copy pass. What survives is the one
      thing it was for: the piece names the body that measured and published its
      readings, and the licence to reuse them.

      THE PRIMARY SOURCE IS THE FIRST ONE LISTED, which is the convention the
      data already follows: `sources[0]` on both published articles is the feed
      the figures came from and the rest are the standards they were judged
      against. Stated in the markup so it is not an accident of ordering. */''}
      <p class="cap jr-p" style="margin-top:22px">Based on ${esc(a.sources[0].publisher)}.
        Reuse freely &mdash; <a class="lk" href="${S.LICENCE_URL}" rel="license noopener">${S.LICENCE_NAME}</a>.
        <a class="lk" href="/use-the-data">Terms, method and limitations</a>.</p>
    </div>`,

    onward: () => `${opener('onward', 'Next', 'The explanation behind it, the live reading, and the archive.')}
    <div class="wrap">
      <div class="jr-doors">
${(a.related?.learn || []).map((l) => `        <a class="jr-door" href="/learn/${l}"><span class="lbl">Learn</span><span class="jr-door-h">${esc(LEARN_TITLE(l))}</span><span class="cap">The concept behind the figures above.</span></a>`).join('\n')}
${(a.related?.now || []).map((d) => `        <a class="jr-door" href="${esc(d.href)}"><span class="lbl">Live</span><span class="jr-door-h">${esc(d.label)}</span><span class="cap">${esc(d.note)}</span></a>`).join('\n')}
${(a.related?.record || []).map((d) => `        <a class="jr-door" href="${esc(d.href)}"><span class="lbl">Record</span><span class="jr-door-h">${esc(d.label)}</span><span class="cap">${esc(d.note)}</span></a>`).join('\n')}
      </div>
${a.act ? `      <p style="margin:clamp(20px,3vw,28px) 0 0"><a class="b b-1" href="${esc(a.act.href)}">${esc(a.act.label)}${ARROW}</a></p>` : ''}
    </div>`,
  };

  const OUT = await S.assemble({
    file: `journal/${a.slug}.html`,
    route,
    title: seo(route).title,
    /* THE DATE IS REAL HERE, which is the whole difference from /learn's
       markup: a Journal piece was published on a day and says so in its own
       masthead, so datePublished states the same fact the reader is shown.
       `dateModified` is the approval date rather than a build timestamp — the
       page is regenerated on every run and a modified date that moved with the
       build would claim an edit that never happened. */
    headExtra: S.articleJsonLd({
      headline: a.h1.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
      description: seo(route).description,
      url: route,
      image: a.frame.src,
      datePublished: a.date,
      dateModified: a.approved_at,
      section: TYPES[a.type].label,
      about: (a.related?.learn || []).map((l) => LEARN_TITLE(l)),
    }),
    bands: BANDS,
    index: [['What happened', '#account'], ['The data', '#data'], ['Known and uncertain', '#ours'], ['Sources', '#sources'], ['Next', '#onward']],
    sh, clashes: S.groundChain(BANDS),
    pageCss: PAGE_CSS,
    navMark: { current: null, url: null },
    sectionFor: (id) => B[id](),
    note: `${a.type} — ${(a.figures || []).length} snapshot figures, ${a.sources.length} sources, approved by ${a.approved_by}.`,
  });
  written.push({ a, OUT, route });
}

function LEARN_TITLE(slug) {
  const p = join(S.ROOT, 'data/learn/articles', `${slug}.json`);
  return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')).h1 : slug;
}

/* ═══ THE INDEX ══════════════════════════════════════════════════════════ */
const IB = {
  top: () => `    <div class="pic ht">
      <img class="duo" src="/images/photos/clean-air-protest.jpg" alt="Students holding hand-lettered clean-air placards"${S.imgDim('/images/photos/clean-air-protest.jpg')} fetchpriority="high">
      <div class="pic-over"><div class="wrap">
        <p class="lbl eyebrow">The Journal</p>
        <h1 class="d1">Dated, and<br>it stays dated.</h1>
      </div></div>
    </div>
    <div class="pic-body"><div class="wrap">
      <p class="lead">Analysis and reporting on India&rsquo;s environment.</p>
    </div></div>`,

  latest: () => `${opener('latest', 'Latest', ARTICLES.length
    ? 'Newest first.'
    : 'Nothing here yet.')}
    <div class="wrap">
${ARTICLES.length ? `      <div class="jr-list">
${ARTICLES.map((a) => `        <article class="jr-i">
          <p class="lbl jr-meta"><span class="jr-type">${esc(TYPES[a.type].label)}</span>
            <span><time datetime="${a.date}">${dateLabel(a.date)}</time></span></p>
          <h2 class="jr-i-h"><a href="${artHref(a.slug)}">${a.h1}</a></h2>
          <p class="jr-i-s">${a.standfirst}</p>
        </article>`).join('\n')}
      </div>` : ''}
    </div>`,

  kinds: () => `${openerNL('kinds', 'Five kinds, kept apart')}
    <div class="wrap">
      <div class="jr-kinds">
${Object.values(TYPES).map((t) => `        <div class="jr-k">
          <h3 class="d2">${esc(t.label)}</h3>
          <p class="cap">${esc(t.note)}</p>
        </div>`).join('\n')}
      </div>
    </div>`,

  onward: () => `${opener('onward', 'Next', 'The readings these are written against.')}
    <div class="wrap">
      <div class="jr-doors">
        <a class="jr-door" href="/now"><span class="lbl">Live</span><span class="jr-door-h">Every situation</span><span class="cap">Six readings, each against its published limit.</span></a>
        <a class="jr-door" href="/learn"><span class="lbl">Learn</span><span class="jr-door-h">What the numbers mean</span><span class="cap">Twenty explainers behind the readings.</span></a>
        <a class="jr-door" href="/record"><span class="lbl">Record</span><span class="jr-door-h">The archive</span><span class="cap">Every reading, kept and dated.</span></a>
      </div>
    </div>`,
};

/* THE CHAIN IS NOT THE ARTICLE'S. The first attempt closed on dark-2 and the
   footer is dark-2, so the page ended in a seamless #151512 block — the
   adjacency gate refused it, correctly. Closing on paper keeps the alternation;
   two papers meeting is the step the frozen homepage never takes.
   NOTE: the `how` band this comment used to describe (dark-2, between `kinds`
   and `onward`) was cut in the copy pass, so there is no dark-to-dark step left. */
const IX_BANDS = [
  ['top',     't1',          '#0D0D0B'],
  ['latest',  'paper t2',    '#F3F2F0'],
  ['kinds',   't2',          '#0D0D0B'],
  ['onward',  'paper t3',    '#F3F2F0'],
];
const IX = await S.assemble({
  file: 'journal.html',
  route: '/journal',
  title: seo('/journal').title,
  /* ★ `ItemList` OF THE PUBLISHED ARTICLES, newest first, which is the order
     the page renders them in. It is derived from ARTICLES — the set that has
     already passed the approval gate at the top of this file — so a held draft
     cannot appear in the markup any more than it can appear on the page or at a
     URL. That is the same property the reverse-link index in situation-shell
     relies on, stated here as a consequence rather than a rule: the gate is the
     filesystem, and everything downstream inherits it.

     `articleSection` is on each ARTICLE's own page as part of its `Article`
     data. It is not repeated here: an ItemList entry claims a name, a position
     and a URL, and the page it points at is where the piece describes itself. */
  headExtra: S.itemListJsonLd({
    name: 'The Swechha Journal',
    items: ARTICLES.map((a) => ({
      name: a.h1.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
      url: `/journal/${a.slug}`,
      description: String(a.standfirst || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
    })),
  }),
  bands: IX_BANDS,
  index: [['Latest', '#latest'], ['Five kinds', '#kinds'], ['Next', '#onward']],
  sh, clashes: S.groundChain(IX_BANDS),
  pageCss: PAGE_CSS,
  navMark: { current: null, url: null },
  sectionFor: (id) => IB[id](),
  note: `${ARTICLES.length} published, ${DRAFTS.length} held.`,
});

/* ═══ GATES ══════════════════════════════════════════════════════════════ */
let fail = 0;
const gate = (ok, msg) => { if (!ok) { console.error(`  FAIL ${msg}`); fail++; } else console.log(`  ok   ${msg}`); };
console.log('\nGATES');
const strip = (h) => h.replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<script[\s\S]*?<\/script>/g, ' ')
  .replace(/<!--[\s\S]*?-->/g, ' ').replace(/<[^>]+>/g, ' ')
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
  .replace(/&mdash;|&middot;|&nbsp;|&rsquo;|&lsquo;/g, ' ').replace(/\s+/g, ' ');

/* 1. NO DRAFT REACHED A PAGE. The whole point of the section's discipline. */
const leaked = DRAFTS.filter((d) => existsSync(join(S.V3, `journal/${d.slug}.html`)));
gate(leaked.length === 0, `no held draft has a page (${DRAFTS.length} held)${leaked.length ? `; LEAKED: ${leaked.map((d) => d.slug).join(', ')}` : ''}`);

/* 2. EVERY PUBLISHED ARTICLE NAMES ITS APPROVER IN THE FILE (not on the page —
      a reader does not need our workflow, but the build does). */
gate(ARTICLES.every((a) => a.approved_by && a.approved_at), 'every published article names an approver and a date');

/* 3. EVERY FIGURE ON A PAGE CARRIES ITS OBSERVATION STAMP AND ITS SOURCE.
      A dated claim without a stamp is the thing this section exists to avoid. */
let stampless = [];
for (const { a, OUT } of written) {
  const t = strip(OUT);
  for (const f of a.figures || []) {
    if (!t.includes(String(f.value))) stampless.push(`${a.slug}: value "${f.value}" absent`);
    if (!t.includes(f.observed)) stampless.push(`${a.slug}: stamp "${f.observed}" absent`);
  }
}
gate(stampless.length === 0, `every figure renders with its observation stamp${stampless.length ? `; MISSING: ${stampless.join(', ')}` : ''}`);

/* 4. THE UNCERTAIN LIST IS ON THE PAGE. Required, and required to be visible. */
const noUnc = written.filter(({ OUT }) => !/>Uncertain</.test(OUT));
gate(noUnc.length === 0, 'every article shows its uncertain list');

/* 5. THE INDEX LISTS EVERY PUBLISHED ARTICLE AND NO DRAFT. */
const off = ARTICLES.filter((a) => !IX.includes(`href="${artHref(a.slug)}"`));
const draftOnIndex = DRAFTS.filter((d) => d.slug && IX.includes(`href="${artHref(d.slug)}"`));
gate(off.length === 0 && draftOnIndex.length === 0,
  `the index lists all ${ARTICLES.length} published and no draft${off.length ? `; OFF: ${off.map((a) => a.slug).join(', ')}` : ''}${draftOnIndex.length ? `; DRAFT SHOWN: ${draftOnIndex.map((d) => d.slug).join(', ')}` : ''}`);

/* 6. EVERY SOURCE IS A FOLLOWABLE LINK. */
const badSrc = written.filter(({ a, OUT }) => a.sources.some((s) => !OUT.includes(`href="${s.url}"`)));
gate(badSrc.length === 0, `every source is a live link${badSrc.length ? `; BROKEN: ${badSrc.map((w) => w.a.slug).join(', ')}` : ''}`);

/* 7. NO DEAD OR PROTOTYPE HREF, NO MISSING ALT. */
const pages = [IX, ...written.map((w) => w.OUT)];
const dead = pages.flatMap((h) => [...h.matchAll(/href="([^"]+)"/g)].map((m) => m[1]))
  .filter((h) => h === '#' || h.startsWith('/design/') || h.startsWith('/_pages/'));
gate(dead.length === 0, `no dead or prototype href${dead.length ? `; FOUND: ${[...new Set(dead)].join(', ')}` : ''}`);
const noAlt = pages.flatMap((h) => [...h.matchAll(/<img(?![^>]*\balt=)[^>]*>/g)].map((m) => m[0].slice(0, 50)));
gate(noAlt.length === 0, `every image has alt text${noAlt.length ? `; FOUND: ${noAlt.join(' | ')}` : ''}`);

/* 8. THE DATE IS MACHINE-READABLE. A dated section whose dates are only prose
      cannot be sorted, cited or marked up. */
const noTime = written.filter(({ a, OUT }) => !OUT.includes(`<time datetime="${a.date}">`));
gate(noTime.length === 0, 'every article carries a machine-readable date');

console.log(`\n${pages.length} pages, ${DRAFTS.length} held. ${fail ? `${fail} gate(s) failed.` : 'All gates pass.'}`);
if (fail) process.exit(1);
