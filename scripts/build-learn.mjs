/* ═══════════════════════════════════════════════════════════════════════════
   LEARN  →  public/_pages/v3/learn.html  +  learn/<slug>.html
   routed at /learn and /learn/<slug>
   ───────────────────────────────────────────────────────────────────────────
   THE KNOWLEDGE LIBRARY BEHIND THE READINGS. /now publishes what a number is
   today; /learn publishes what the number MEANS, what it is measured against,
   and what it cannot tell you. One page per concept, and every one of them
   opens the live page for the same subject.

   ★ NO FIGURE ON A LEARN PAGE IS TYPED. THIS IS THE ARCHITECTURAL DECISION.
   An article names a figure by REFERENCE — `{"file":"air-delhi.json",
   "path":"limits.PM2.5.h24"}` — and the build resolves it against the same
   committed dataset the situation page reads. So "60 µg/m³" cannot say one
   thing here and another at /now/air, and a standard that is revised is
   revised in one place. A ref that does not resolve fails the build (gate 1),
   and a resolved value that does not reach the rendered page fails it too
   (gate 2). This is the /impact pattern — figures read out of the data rather
   than restated — applied to prose.

   ★ LEARN IS IN THE SITUATIONS REGIME, NOT THE EVERYWHERE-ELSE ONE.
   `docs/design/2026-08-23-COPY-STANDARD.md` splits the site in two: the
   data-driven pages keep their source links, observation dates and
   methodology notes because those are the substance; everywhere else the
   figure stands clean. A section whose entire subject is how environmental
   data is made and how it misleads belongs on the first side of that line.
   Every article therefore carries its primary sources, its authority for a
   limit, and a "what this cannot tell you" list — and gate 5 refuses an
   article that has no source at all.

   ★ WHAT IS NOT HERE, AND WHY.
     · No reading date in a `<meta description>` and no live value in a title.
       A description is static markup Google caches (BRANDING §3.5).
     · No band named after a nav word. The frozen active-section observer
       matches band ids against nav hrefs (the /impact band-6 finding).
     · No named holes, no gap counters, no page narrating its own build
       (AD-28). Where an article has no programme to point at, it points at
       none.
   ═══════════════════════════════════════════════════════════════════════════ */
import { readFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import * as S from './lib/situation-shell.mjs';
import { seo } from './lib/seo-register.mjs';
const { esc, opener, ARROW, disclose } = S;
/* The Journal's own date format, the same one journalRail renders in the shell.
   Kept here rather than exported because a Learn door shows one date and the
   rail shows a list; two callers, one format, no third copy. */
const jDate = (iso) => {
  const [y, m, d] = String(iso).split('-').map(Number);
  return `${d} ${S.MON[m - 1]} ${y}`;
};

const sh = S.shell();
const LEARN = join(S.ROOT, 'data/learn');

/* ═══ DATA ═══════════════════════════════════════════════════════════════ */
const INDEX_DATA = JSON.parse(readFileSync(join(LEARN, 'index.json'), 'utf8'));
const ARTICLES = readdirSync(join(LEARN, 'articles'))
  .filter((f) => f.endsWith('.json'))
  .sort()
  .map((f) => JSON.parse(readFileSync(join(LEARN, 'articles', f), 'utf8')));

const BY_SLUG = new Map(ARTICLES.map((a) => [a.slug, a]));
const CATS = INDEX_DATA.categories;
const CAT_BY_ID = new Map(CATS.map((c) => [c.id, c]));

let dataBad = 0;
const dataFail = (m) => { console.error(`DATA IS WRONG: ${m}`); dataBad++; };

/* ── THE RESOLVER. A dotted path into a committed dataset. ──────────────── */
const DATASETS = new Map();
const dataset = (file) => {
  if (!DATASETS.has(file)) {
    const p = join(S.ROOT, 'data', file);
    if (!existsSync(p)) return null;
    DATASETS.set(file, JSON.parse(readFileSync(p, 'utf8')));
  }
  return DATASETS.get(file);
};
/* A path is either a dotted string or an ARRAY of segments. The array form
   exists because "limits.PM2.5.h24" cannot be split on dots — the pollutant's
   own name contains one, and splitting it addressed `limits.PM2` and found
   nothing. A key with a dot in it takes the array. */
const dig = (obj, path) => (Array.isArray(path) ? path : path.split('.')).reduce(
  (o, k) => (o == null ? undefined : o[/^\d+$/.test(k) ? Number(k) : k]), obj);

/* ── A LEARN PAGE MAY NOT REFERENCE A LIVE READING. ─────────────────────
   These pages are rebuilt when their prose changes, not when the air changes.
   A ref into an hourly-refreshed field would either go stale on the page or
   force the whole section to regenerate every hour — and it would put a dated
   claim inside an evergreen explainer, which is the thing gate 9 refuses in
   the description and should equally refuse in the body.
   Stated per file, because "stations" is an hourly array in the air feed and
   an annual published table in the river one. Only the volatile file needs a
   list; the rest are report snapshots and definitions. */
const VOLATILE = {
  'air-delhi.json': ['city_reading', 'city_mean', 'worst_station', 'spread',
    'stations', 'observed', 'fetched', 'time', 'observation_age_hours',
    'check', 'crosscheck', 'state_label', 'excluded'],
  /* THE CROSS-CHECK FILES REFRESH WITH THE AIR. `source.scale` and
     `source.name` are properties of the upstream project and hold still; the
     station list, the observation, the comparison and every verdict number
     move on the hourly job. An explainer may cite WHICH SCALE another
     publisher uses and may not cite how many stations it happened to list at
     4pm. Added when /learn/air-quality-apps-disagree was written, before it
     could reach for one. */
  'air-crosscheck.json': ['observed', 'coverage', 'stations', 'comparison', 'forecast', 'fetched', 'state_label'],
  'air-crosscheck-verdicts.json': ['ran', 'tier1', 'tier2'],
};

/** Resolve one ref to a printable string, or null with a recorded failure. */
function resolve(ref, where) {
  const head = String(Array.isArray(ref.path) ? ref.path[0] : ref.path).split('.')[0];
  if ((VOLATILE[ref.file] || []).includes(head)) {
    dataFail(`${where}: "${head}" in data/${ref.file} is a live reading. `
      + 'A Learn page states the standard, not the hour — link the situation page for the reading.');
    return null;
  }
  const d = dataset(ref.file);
  if (!d) { dataFail(`${where}: no dataset data/${ref.file}`); return null; }
  const v = dig(d, ref.path);
  if (v === undefined || v === null) {
    dataFail(`${where}: data/${ref.file} has nothing at "${ref.path}"`);
    return null;
  }
  if (typeof v === 'object') {
    dataFail(`${where}: data/${ref.file} "${ref.path}" is an object, not a value`);
    return null;
  }
  return typeof v === 'number' ? S.n0(v) : String(v);
}

/** A figure row: value resolved from data, unit and label written by hand. */
function figureText(f, where) {
  /* `refs` + `join` renders a RANGE from two addresses in the same dataset —
     an AQI band is "101 – 200" in CPCB's own table and printing one number
     would be a different claim. */
  if (f.refs) {
    const vs = f.refs.map((r) => resolve(r, where));
    if (vs.some((v) => v === null)) return null;
    return `${vs.join(f.join || ' – ')}${f.unit ? ` ${f.unit}` : ''}`;
  }
  if (f.ref) {
    const v = resolve(f.ref, where);
    return v === null ? null : `${v}${f.unit ? ` ${f.unit}` : ''}`;
  }
  if (f.value == null) { dataFail(`${where}: a figure has neither ref nor value`); return null; }
  return `${f.value}${f.unit ? ` ${f.unit}` : ''}`;
}

/* ═══ DATA GATES — before a line of HTML is built ════════════════════════ */
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
for (const a of ARTICLES) {
  const w = `learn/${a.slug}`;
  if (!SLUG_RE.test(a.slug || '')) dataFail(`"${a.slug}" is not a kebab-case slug.`);
  if (!CAT_BY_ID.has(a.category)) dataFail(`${w}: category "${a.category}" is not in index.json.`);
  if (!a.answer || a.answer.length < 80) dataFail(`${w}: the direct answer is missing or too short to be one.`);
  if (!Array.isArray(a.explain) || !a.explain.length) dataFail(`${w}: no explanation.`);
  if (!Array.isArray(a.sources) || !a.sources.length) dataFail(`${w}: no primary source.`);
  for (const s of a.sources || []) {
    if (!s.url || !/^https?:\/\//.test(s.url)) dataFail(`${w}: source "${s.name}" has no absolute URL.`);
    if (!s.publisher) dataFail(`${w}: source "${s.name}" does not say who published it.`);
  }
  if (!Array.isArray(a.cannot) || !a.cannot.length) {
    dataFail(`${w}: no "what this cannot tell you" list. Every article states the limits of its own subject.`);
  }
  for (const r of a.related || []) {
    if (!BY_SLUG.has(r)) dataFail(`${w}: related article "${r}" does not exist.`);
    if (r === a.slug) dataFail(`${w}: relates to itself.`);
  }
  if (!a.frame?.src) dataFail(`${w}: no lead photograph — the share card is derived from it.`);
  else if (!existsSync(join(S.ROOT, 'public', a.frame.src.replace(/^\//, '')))) {
    dataFail(`${w}: lead photograph ${a.frame.src} is not on disk.`);
  }
  if (a.frame && !a.frame.alt) dataFail(`${w}: the lead photograph has no alt text.`);
}
/* ── AN HTML ENTITY MAY NOT REACH A FIELD THIS GENERATOR ESCAPES. ────────
   `esc()` turns `&` into `&amp;`, so `&deg;C` written in a row's unit ships to
   the reader as the literal text "&deg;C". It is invisible in the JSON, it is
   invisible in a diff, and it is invisible in every gate that reads the
   rendered text — because the rendered text is exactly what is wrong. Five
   articles shipped it before a figure rail was read by eye.

   The fields below are the ones passed through `esc()`; everything else on an
   article (the answer, the explanation, the after-notes, a definition's body)
   is rendered raw and may use entities freely, which is why this is a list
   rather than a sweep. Write the literal character: — ° ’ · … */
const ESCAPED_FIELDS = (a) => [
  ['card', a.card],
  ['frame.alt', a.frame?.alt],
  ['standard.chip', a.standard?.chip],
  ...(a.standard?.rows || []).flatMap((r, i) => [
    [`standard.rows[${i}].name`, r.name], [`standard.rows[${i}].authority`, r.authority],
    [`standard.rows[${i}].unit`, r.unit], [`standard.rows[${i}].value`, r.value],
  ]),
  ...(a.defs || []).map((d, i) => [`defs[${i}].term`, d.term]),
  ...(a.sources || []).flatMap((x, i) => [
    [`sources[${i}].name`, x.name], [`sources[${i}].publisher`, x.publisher], [`sources[${i}].note`, x.note],
  ]),
  ['live.label', a.live?.label], ['live.note', a.live?.note],
  ['programme.label', a.programme?.label], ['programme.why', a.programme?.why],
  ['act.label', a.act?.label],
];
for (const a of ARTICLES) {
  for (const [field, value] of ESCAPED_FIELDS(a)) {
    const m = typeof value === 'string' && /&[a-z]+;|&#\d+;/.exec(value);
    if (m) {
      dataFail(`learn/${a.slug}: ${field} contains ${JSON.stringify(m[0])}. `
        + 'That field is escaped, so the entity reaches the reader as literal text. Write the character itself.');
    }
  }
}

/* Every category must hold at least one article, or the index prints an empty
   column that reads as a section still being written. */
for (const c of CATS) {
  if (!ARTICLES.some((a) => a.category === c.id)) dataFail(`category "${c.id}" holds no article.`);
}
/* The relation graph runs both ways or it is a dead end. An article nothing
   relates to is reachable only from the index. */
for (const a of ARTICLES) {
  const inbound = ARTICLES.filter((o) => (o.related || []).includes(a.slug));
  if (!inbound.length) dataFail(`learn/${a.slug}: nothing relates to it — it is an orphan inside the section.`);
}

/* ═══ SHARED PIECES ══════════════════════════════════════════════════════ */
const catOf = (a) => CAT_BY_ID.get(a.category);
const artHref = (slug) => `/learn/${slug}`;

const ANCESTOR = `      <p class="lbl lr-anc"><a class="lk" href="/learn">Learn</a></p>`;

/** The masthead every article opens on. */
const masthead = (a) => `    <div class="pic ht">
      <img class="duo" src="${a.frame.src}" alt="${esc(a.frame.alt)}"${S.imgDim(a.frame.src)} fetchpriority="high">
      <div class="pic-over"><div class="wrap">
        <p class="lbl eyebrow">${esc(catOf(a).name)}</p>
        <h1 class="d1">${a.h1}</h1>
      </div></div>
    </div>
    <div class="pic-body"><div class="wrap">
${ANCESTOR}
      <p class="lead lr-answer">${a.answer}</p>
    </div></div>`;

/** The limit/standard band — the one that carries the house philosophy. */
const standardBand = (a) => {
  const st = a.standard;
  const rows = (st.rows || []).map((r) => {
    const v = figureText(r, `learn/${a.slug} standard "${r.name}"`);
    return `          <div class="lr-st-r">
            <p class="lr-st-n">${esc(r.name)}</p>
            <p class="lr-st-v">${v === null ? '&mdash;' : esc(v)}</p>
            <p class="cap lr-st-a">${esc(r.authority)}</p>
          </div>`;
  }).join('\n');
  return `${opener('standard', st.head, st.lead)}
    <div class="wrap">
${rows ? `      <div class="lr-st">\n${rows}\n      </div>` : ''}
${(st.after || []).map((p) => `      <p class="lr-p">${p}</p>`).join('\n')}
${a.live ? `      <p class="lr-cta"><a class="b b-1" href="${esc(a.live.href)}">${esc(a.live.label)}${ARROW}</a></p>` : ''}
    </div>`;
};

/** The explanation band: prose, then the definitions a reader needs. */
const explainBand = (a) => `${opener('explain', a.explainHead, a.explainLead)}
    <div class="wrap">
${a.explain.map((p) => `      <p class="lr-p">${p}</p>`).join('\n')}
${(a.defs || []).length ? `      <dl class="lr-defs">
${a.defs.map((d) => `        <dt>${esc(d.term)}</dt>\n        <dd>${d.d}</dd>`).join('\n')}
      </dl>` : ''}
    </div>`;

/** How the number is made, and what it cannot say. */
const readBand = (a) => `${opener('reading', a.readHead, a.readLead)}
    <div class="wrap">
${(a.measure || []).map((p) => `      <p class="lr-p">${p}</p>`).join('\n')}
      <div class="lr-cannot">
        <p class="lbl">What it does not measure</p>
        <ul class="lr-ul">
${a.cannot.map((c) => `          <li>${c}</li>`).join('\n')}
        </ul>
      </div>
${a.history ? disclose(esc(a.history.summary), a.history.body.map((p) => `<p class="lr-p">${p}</p>`).join('')) : ''}
    </div>`;

/** Primary sources, and the licence under which this page may be reused. */
const sourcesBand = (a) => `${opener('sources', 'Where this comes from', a.sourcesLead
  || 'Every figure above comes from one of these.')}
    <div class="wrap">
      <ul class="lr-src">
${a.sources.map((s) => `        <li><a class="lk" href="${esc(s.url)}" rel="noopener">${esc(s.name)}</a>
          <span class="cap">${esc(s.publisher)}${s.note ? ` &middot; ${esc(s.note)}` : ''}</span></li>`).join('\n')}
      </ul>
${/* ── HISTORICAL. The citation block and its provenance note below were cut in
      the 2026-09-10 copy pass; nothing here renders any more. Kept as the
      record of why the block read the way it did, should it ever come back.

      ★ THE SUGGESTED CITATION, AND IT DELIBERATELY CARRIES NO DATE.
      A Learn page is evergreen: it addresses the LIVE dataset by reference and
      is rebuilt when its prose changes, never when the air changes. That is the
      one rule separating this section from the Journal — a Journal figure is a
      snapshot with an observation stamp on it and must never move; a Learn
      figure is a reference and must never go stale. Putting a date on this
      citation would invite somebody to cite a version of the page, which is
      exactly what an evergreen explainer is not.

      /use-the-data publishes this shape as its third citation form —
      `Swechha. "What is PM2.5?" https://swechha.in/learn/pm25` — and it was
      one navigation away from every page it applies to. This is that form,
      filled in, on the page.

      THE PROVENANCE SENTENCE NAMES THE FIRST SOURCE, not all of them: the list
      is directly above it and repeating it would be a second copy of the same
      register. The claim it makes is the one a citation needs and the one an
      explainer is most likely to be quoted wrongly on — that the standards and
      figures here are somebody else's, and the explanation is ours. */''}
      <p class="cap lr-lic">Reuse freely &mdash; <a class="lk" href="${S.LICENCE_URL}" rel="license noopener">${S.LICENCE_NAME}</a>.
        Each source above keeps its own terms.</p>
    </div>`;

/** Onward: the live page, the sibling explainers, the programme, the ask. */
const onwardBand = (a) => {
  const rel = (a.related || []).map((r) => BY_SLUG.get(r));
  return `${opener('onward', a.onwardHead || 'Next', a.onwardLead || '')}
    <div class="wrap">
      <div class="lr-doors">
${a.live ? `        <a class="lr-door" href="${esc(a.live.href)}">
          <span class="lbl">Live reading</span>
          <span class="lr-door-h">${esc(a.live.label)}</span>
          <span class="cap">${esc(a.live.note)}</span>
        </a>` : ''}
${rel.map((r) => `        <a class="lr-door" href="${artHref(r.slug)}">
          <span class="lbl">${esc(catOf(r).name)}</span>
          <span class="lr-door-h">${r.h1}</span>
          <span class="cap">${esc(r.card)}</span>
        </a>`).join('\n')}
${a.programme ? `        <a class="lr-door" href="${esc(a.programme.href)}">
          <span class="lbl">Stand in it</span>
          <span class="lr-door-h">${esc(a.programme.label)}</span>
          <span class="cap">${esc(a.programme.why)}</span>
        </a>` : ''}
${/* ── THE JOURNAL DOOR, AND IT IS NOT A DOOR THIS FILE CHOOSES. ────────────
      Every article already carried the live reading, its sibling explainers,
      a programme and an ask. What it never carried was the dated writing that
      USED it: a link census on 9 September 2026 found /journal in the body of
      three of 93 pages, and none of the twenty-six explainers was one of them.

      The edge is inverted out of the ARTICLE's own `related.learn`, so it
      exists only where a Journal piece has said in its own file that it was
      written against this explanation — and only where a named person has
      approved that piece, because journalForLearn() filters on the same
      publish gate the Journal generator builds pages from. Nothing here can
      add a link, and retracting the claim in the article removes it.

      ONE DOOR, NOT ONE PER ARTICLE. The door leads to the newest piece and the
      caption counts the rest, because `.lr-doors` is a three-to-four card grid
      and an explainer that six pieces happen to cite would otherwise push the
      live reading and the programme off the first row of it. */''}
${(() => {
    const arts = S.journalForLearn(a.slug);
    if (!arts.length) return '';
    const [first] = arts;
    const more = arts.length - 1;
    return `        <a class="lr-door" href="/journal/${first.slug}">
          <span class="lbl">In the Journal</span>
          <span class="lr-door-h">${first.h1.replace(/<br>/g, ' ')}</span>
          <span class="cap">${esc(jDate(first.date))} &middot; ${more ? `${more} more written against this explanation.` : 'Written against this explanation.'}</span>
        </a>`;
  })()}
      </div>
${a.act ? `      <p class="lr-cta"><a class="b b-1" href="${esc(a.act.href)}">${esc(a.act.label)}${ARROW}</a></p>` : ''}
    </div>`;
};

/* ═══ PAGE CSS ═══════════════════════════════════════════════════════════ */
const PAGE_CSS = `
.lr-anc{margin:0 0 10px}
.lr-answer{max-width:60ch;font-weight:500}
.lr-p{margin:0 0 clamp(12px,1.6vw,18px);max-width:64ch}
.lr-p:last-child{margin-bottom:0}
.lr-defs{margin:clamp(20px,3vw,30px) 0 0;display:grid;gap:14px;max-width:64ch}
.lr-defs dt{font-weight:600;margin:0}
.lr-defs dd{margin:4px 0 0;color:var(--ink-2)}
.dark-2 .lr-defs dd,.lr-defs dd{color:inherit}
.paper .lr-defs dd,.paper-2 .lr-defs dd{opacity:1;color:var(--ink-2)}
.lr-st{display:grid;gap:0;margin:clamp(18px,2.6vw,26px) 0 clamp(20px,3vw,30px);
  grid-template-columns:minmax(0,1fr)}
.lr-st-r{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(0,1fr) minmax(0,1.4fr);
  gap:12px;align-items:baseline;padding:14px 0;border-top:1px solid currentColor}
.lr-st-r:last-child{border-bottom:1px solid currentColor}
.lr-st-n{margin:0}
.lr-st-v{margin:0;font-variant-numeric:tabular-nums;font-weight:600;white-space:nowrap}
.lr-st-a{margin:0}
.lr-cta{margin:clamp(18px,2.6vw,26px) 0 0}
.lr-cannot{margin:clamp(22px,3vw,32px) 0 0;border-top:2px solid currentColor;padding-top:14px;max-width:64ch}
.lr-ul{margin:10px 0 0;padding-left:1.1em;display:grid;gap:8px}
.lr-ul li{max-width:60ch}
.lr-src{list-style:none;margin:clamp(16px,2.4vw,24px) 0 0;padding:0;display:grid;gap:14px;max-width:70ch}
/* THE SUGGESTED CITATION BLOCK'S CSS WENT WITH THE BLOCK, 10 September 2026.
   The rules styled a ruled box carrying a citation in mono and a provenance
   note under it, on all thirty explainers. The owner's copy pass struck the
   block: an explainer is not a dataset, the source list above it already names
   what it is built from, and /use-the-data publishes the citation forms once
   for the whole site. The rules are deleted rather than left dead — they were
   shipping on thirty pages with nothing to select. */
.lr-src li{display:grid;gap:3px;border-top:1px solid currentColor;padding-top:12px}
.lr-lic{margin:clamp(20px,3vw,28px) 0 0;max-width:70ch}
.lr-doors{display:grid;gap:clamp(14px,2vw,20px);margin:clamp(18px,2.6vw,26px) 0 0;
  grid-template-columns:repeat(auto-fit,minmax(240px,1fr))}
.lr-door{display:grid;gap:5px;align-content:start;min-width:0;text-decoration:none;color:inherit;
  border-top:2px solid currentColor;padding-top:12px}
.lr-door-h{font-family:var(--display);font-size:clamp(19px,2.2vw,24px);line-height:1.14}
/* ── THE INDEX ────────────────────────────────────────────────────────── */
.lx-start{display:grid;gap:clamp(20px,3vw,34px);margin:clamp(20px,3vw,32px) 0 0;
  grid-template-columns:repeat(auto-fit,minmax(260px,1fr))}
.lx-s{display:grid;gap:7px;align-content:start;min-width:0;text-decoration:none;color:inherit;
  border-top:2px solid currentColor;padding-top:14px}
.lx-s-h{font-family:var(--display);font-size:clamp(21px,2.6vw,28px);line-height:1.12}
.lx-cats{display:grid;gap:clamp(26px,4vw,44px);margin:clamp(20px,3vw,32px) 0 0;
  grid-template-columns:repeat(auto-fit,minmax(280px,1fr))}
.lx-c{min-width:0}
.lx-c-h{margin:0 0 4px}
.lx-c-l{margin:0 0 12px;max-width:44ch}
.lx-l{list-style:none;margin:0;padding:0;display:grid;gap:9px}
.lx-l li{border-top:1px solid currentColor;padding-top:9px}
.lx-l a{text-decoration:none;color:inherit;display:grid;gap:2px}
.lx-l .cap{}
.lx-live{display:grid;gap:clamp(14px,2vw,20px);margin:clamp(20px,3vw,32px) 0 0;
  grid-template-columns:repeat(auto-fit,minmax(210px,1fr))}
@media (max-width:720px){
  .lr-st-r{grid-template-columns:minmax(0,1fr);gap:2px}
  .lr-st-v{font-size:1.15em}
}
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
.lr-door-h,.lx-s-h,.lx-l a span:first-child{text-decoration:underline;text-decoration-thickness:1px;
  text-underline-offset:5px;text-decoration-color:var(--hair);
  transition:text-decoration-color .14s ease}
.paper .lr-door-h,.paper-2 .lr-door-h,.paper .lx-s-h,.paper-2 .lx-s-h,.paper .lx-l a span:first-child,.paper-2 .lx-l a span:first-child{text-decoration-color:var(--rule-2)}
.lr-door:hover .lr-door-h,.lr-door:focus-visible .lr-door-h,.lx-s:hover .lx-s-h,.lx-s:focus-visible .lx-s-h,.lx-l a:hover span:first-child,.lx-l a:focus-visible span:first-child{text-decoration-color:var(--mustard)}
@media (prefers-reduced-motion:reduce){.lr-door-h,.lx-s-h,.lx-l a span:first-child{transition:none}}

`;

/* ═══ BANDS — one fixed chain, so the ground rhythm cannot drift ═════════
   top #0D0D0B -> explain #F3F2F0 -> standard #0D0D0B -> reading #ECEBE8
   -> sources #151512 -> onward #F3F2F0 -> footer #151512.
   Zero paper-to-paper steps, zero clashes. Every article carries all six:
   an explainer with no standard, no method or no source is not publishable,
   which is a content rule the fixed chain makes structural. */
const ARTICLE_BANDS = [
  ['top',      't1',          '#0D0D0B'],
  ['explain',  'paper t2',    '#F3F2F0'],
  ['standard', 't2',          '#0D0D0B'],
  ['reading',  'paper-2 t2',  '#ECEBE8'],
  ['sources',  'dark-2 t2',   '#151512'],
  ['onward',   'paper t3',    '#F3F2F0'],
];

if (dataBad) {
  console.error(`\nREFUSING TO WRITE: ${dataBad} data check(s) failed.`);
  process.exit(1);
}

/* Every ref is resolved BEFORE a page is written, not while one is rendered.
   A ref that fails mid-render printed its complaint and then carried on to
   write the page with an em dash where the figure should have been — a
   silent hole, which is the one outcome every gate in this repo exists to
   prevent. Resolving up front turns it back into a refusal to write. */
for (const a of ARTICLES) {
  for (const r of a.standard.rows || []) figureText(r, `learn/${a.slug} standard "${r.name}"`);
}
if (dataBad) {
  console.error(`\nREFUSING TO WRITE: ${dataBad} figure reference(s) did not resolve.`);
  process.exit(1);
}

mkdirSync(join(S.V3, 'learn'), { recursive: true });

/* ═══ WRITE — the articles ═══════════════════════════════════════════════ */
let fail = 0;
const gate = (ok, msg) => { if (!ok) { console.error(`  FAIL ${msg}`); fail++; } else console.log(`  ok   ${msg}`); };
const written = [];

for (const a of ARTICLES) {
  const route = artHref(a.slug);
  const B = {
    top: () => masthead(a),
    explain: () => explainBand(a),
    standard: () => standardBand(a),
    reading: () => readBand(a),
    sources: () => sourcesBand(a),
    onward: () => onwardBand(a),
  };
  const clashes = S.groundChain(ARTICLE_BANDS);
  const INDEX = [
    ['What it means', '#explain'],
    [a.standard.chip, '#standard'],
    ['How to read it', '#reading'],
    ['Sources', '#sources'],
    ['Next', '#onward'],
  ];
  const OUT = await S.assemble({
    file: `learn/${a.slug}.html`,
    route,
    title: seo(route).title,
    /* AN EXPLAINER IS AN ARTICLE AND CARRIES NO DATE. Every other field here is
       something the page can stand behind; a `datePublished` on an evergreen
       page would be a date invented to chase a rich result, so there is none.
       `about` names the subject in the reader's own words, which is what makes
       the markup worth emitting at all. */
    headExtra: S.articleJsonLd({
      headline: a.h1.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
      description: seo(route).description,
      url: route,
      image: a.frame.src,
      section: catOf(a).name,
      about: [catOf(a).name, ...(a.defs || []).slice(0, 3).map((d) => d.term)],
    }),
    bands: ARTICLE_BANDS, index: INDEX, sh, clashes,
    pageCss: PAGE_CSS,
    /* THE SEVENTH NAV WORD IS THIS SECTION'S, so these pages mark it. An
       article gets aria-current="true" (under Learn, not at it) and the index
       gets "page", which is what navCurrent() derives from href === url. */
    navMark: { current: 'Learn', url: route },
    sectionFor: (id) => B[id](),
    note: `learn/${a.slug} — ${a.sources.length} source(s), ${(a.related || []).length} related.`,
  });
  written.push({ a, OUT, route });
}

/* ═══ WRITE — the index ══════════════════════════════════════════════════ */
const M = INDEX_DATA.masthead;
const start = INDEX_DATA.start_here.map((slug) => BY_SLUG.get(slug));
for (const [i, s] of start.entries()) {
  if (!s) dataFail(`index.json start_here[${i}] names an article that does not exist.`);
}

const IB = {
  top: () => `    <div class="pic ht">
      <img class="duo" src="${M.frame.src}" alt="${esc(M.frame.alt)}"${S.imgDim(M.frame.src)} fetchpriority="high">
      <div class="pic-over"><div class="wrap">
        <p class="lbl eyebrow">${esc(M.kicker)}</p>
        <h1 class="d1">${M.h1}</h1>
      </div></div>
    </div>
    <div class="pic-body"><div class="wrap">
      <p class="lead">${M.lead}</p>
    </div></div>`,

  start: () => `${opener('start', INDEX_DATA.start.head, INDEX_DATA.start.lead)}
    <div class="wrap">
      <div class="lx-start">
${start.map((s) => `        <a class="lx-s" href="${artHref(s.slug)}">
          <span class="lbl">${esc(catOf(s).name)}</span>
          <span class="lx-s-h">${s.h1}</span>
          <span class="cap">${esc(s.card)}</span>
        </a>`).join('\n')}
      </div>
    </div>`,

  library: () => `${opener('library', INDEX_DATA.library.head, INDEX_DATA.library.lead)}
    <div class="wrap">
      <div class="lx-cats">
${CATS.map((c) => `        <div class="lx-c">
          <h3 class="d2 lx-c-h">${esc(c.name)}</h3>
          <p class="cap lx-c-l">${esc(c.lead)}</p>
          <ul class="lx-l">
${ARTICLES.filter((a) => a.category === c.id).map((a) => `            <li><a href="${artHref(a.slug)}"><span>${a.h1}</span><span class="cap">${esc(a.card)}</span></a></li>`).join('\n')}
          </ul>
        </div>`).join('\n')}
      </div>
    </div>`,

  live: () => `${opener('live', INDEX_DATA.live.head, INDEX_DATA.live.lead)}
    <div class="wrap">
      <div class="lx-live">
${INDEX_DATA.live.doors.map((d) => `        <a class="lr-door" href="${esc(d.href)}">
          <span class="lbl">Live</span>
          <span class="lr-door-h">${esc(d.label)}</span>
          <span class="cap">${esc(d.note)}</span>
        </a>`).join('\n')}
      </div>
    </div>`,

  onward: () => `${opener('onward', INDEX_DATA.onward.head, INDEX_DATA.onward.lead)}
    <div class="wrap">
      <div class="lr-doors">
${INDEX_DATA.onward.doors.map((d) => `        <a class="lr-door" href="${esc(d.href)}">
          <span class="lbl">${esc(d.kicker)}</span>
          <span class="lr-door-h">${esc(d.label)}</span>
          <span class="cap">${esc(d.note)}</span>
        </a>`).join('\n')}
      </div>
    </div>`,
};

const INDEX_BANDS = [
  ['top',     't1',          '#0D0D0B'],
  ['start',   'paper t2',    '#F3F2F0'],
  ['library', 't2',          '#0D0D0B'],
  ['live',    'paper-2 t2',  '#ECEBE8'],
  ['onward',  'paper t3',    '#F3F2F0'],
];

if (dataBad) {
  console.error(`\nREFUSING TO WRITE: ${dataBad} data check(s) failed.`);
  process.exit(1);
}

const IX = await S.assemble({
  file: 'learn.html',
  route: '/learn',
  title: seo('/learn').title,
  /* ★ AN INDEX IS AN `ItemList`, NOT AN `Article` AND NOT A `Dataset`. This
     page publishes no explanation of its own and no reading of its own — it
     names every explainer and orders them by category. `ItemList` claims
     exactly that and nothing more.

     THE LIST IS THE RENDERED LIST, in the rendered order, derived from the same
     CATS/ARTICLES walk the library band renders — so the markup and the page
     cannot name different sets. An index whose structured data lists articles
     it does not link is the one failure this type can have. */
  headExtra: S.itemListJsonLd({
    name: 'Swechha environmental knowledge library',
    items: CATS.flatMap((c) => ARTICLES.filter((a) => a.category === c.id)
      .map((a) => ({
        name: a.h1.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
        url: artHref(a.slug),
        description: a.card,
      }))),
  }),
  bands: INDEX_BANDS,
  index: [
    ['Start here', '#start'], ['The library', '#library'],
    ['Live readings', '#live'], ['Next', '#onward'],
  ],
  sh, clashes: S.groundChain(INDEX_BANDS),
  pageCss: PAGE_CSS,
  navMark: { current: 'Learn', url: '/learn' },
  sectionFor: (id) => IB[id](),
  note: `${ARTICLES.length} articles in ${CATS.length} categories.`,
});

/* ═══ POST-WRITE GATES ═══════════════════════════════════════════════════ */
console.log('\nGATES');
const strip = (h) => h.replace(/<style[\s\S]*?<\/style>/g, ' ')
  .replace(/<script[\s\S]*?<\/script>/g, ' ')
  .replace(/<!--[\s\S]*?-->/g, ' ')
  .replace(/<[^>]+>/g, ' ')
  /* DECODED, NOT BLANKED. A criterion reads "> 5.0 mg/L" and reaches the page
     as "&gt; 5.0 mg/L"; replacing the entity with a space made gate 1 report
     seven correct figures as missing. Entities that stand for punctuation are
     decoded to that punctuation; only the spacing ones become a space. */
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&rsquo;/g, '\u2019')
  .replace(/&mdash;/g, '\u2014').replace(/&middot;/g, '\u00b7').replace(/&amp;/g, '&')
  .replace(/&nbsp;/g, ' ')
  .replace(/\s+/g, ' ');

/* 1 + 2. EVERY RESOLVED FIGURE REACHES ITS PAGE. `resolve()` already failed
   the build on an unresolvable ref; this is the other half — a value that
   resolved but never rendered, which is what a template typo produces. */
let figs = 0, missing = [];
for (const { a, OUT } of written) {
  const txt = strip(OUT);
  for (const r of a.standard.rows || []) {
    const v = figureText(r, `gate learn/${a.slug}`);
    if (v === null) continue;
    figs++;
    /* NORMALISED BOTH SIDES. `figureText` sets a THIN SPACE between a value
       and its unit, and `strip()` collapses every run of whitespace to one
       ordinary space — so an un-normalised comparison failed on all 97
       figures while every one of them was correctly on the page. A gate that
       fails on its own formatting teaches people to switch gates off. */
    if (!txt.includes(v.replace(/\s+/g, ' '))) missing.push(`${a.slug}: "${v}"`);
  }
}
gate(missing.length === 0, `all ${figs} resolved figures reach their page${missing.length ? `; MISSING: ${missing.join(', ')}` : ''}`);

/* 3. EVERY ARTICLE OPENS ITS LIVE PAGE, where it has one. An explainer that
      does not hand the reader the reading is half a page. */
const noLive = written.filter(({ a, OUT }) => a.live && !OUT.includes(`href="${a.live.href}"`));
gate(noLive.length === 0, `every article links its live reading${noLive.length ? `; MISSING: ${noLive.map((w) => w.a.slug).join(', ')}` : ''}`);

/* 4. THE INDEX LISTS EVERY ARTICLE. A page built and left off the index is
      reachable only from a sibling, which is how a section grows orphans. */
const offIndex = ARTICLES.filter((a) => !IX.includes(`href="${artHref(a.slug)}"`));
gate(offIndex.length === 0, `the index lists all ${ARTICLES.length} articles${offIndex.length ? `; OFF: ${offIndex.map((a) => a.slug).join(', ')}` : ''}`);

/* 5. EVERY ARTICLE NAMES ITS SOURCES ON THE PAGE, with a followable link. */
const unsourced = written.filter(({ a, OUT }) => a.sources.some((s) => !OUT.includes(`href="${s.url}"`)));
gate(unsourced.length === 0, `every source is a live link on its page${unsourced.length ? `; BROKEN: ${unsourced.map((w) => w.a.slug).join(', ')}` : ''}`);

/* 6. NO DEAD OR PROTOTYPE HREF anywhere in the section. */
const allOut = [...written.map((w) => w.OUT), IX];
const dead = allOut.flatMap((h) => [...h.matchAll(/href="([^"]+)"/g)].map((m) => m[1]))
  .filter((h) => h === '#' || h.startsWith('/design/') || h.startsWith('/_pages/'));
gate(dead.length === 0, `no dead or prototype href${dead.length ? `; FOUND: ${[...new Set(dead)].join(', ')}` : ''}`);

/* 7. EVERY IMAGE CARRIES ALT TEXT. */
const noAlt = allOut.flatMap((h) => [...h.matchAll(/<img(?![^>]*\balt=)[^>]*>/g)].map((m) => m[0].slice(0, 50)));
gate(noAlt.length === 0, `every image has alt text${noAlt.length ? `; FOUND: ${noAlt.join(' | ')}` : ''}`);

/* 8. NO BANNED WORD IN THIS SECTION'S OWN COPY. The copy standard names five
      that flatten the voice; "sustainable" is the one a school-programme
      keyword list keeps trying to reintroduce. Scoped to the page's own bands,
      because the inherited footer is not this build's to police, and matched
      on rendered text so a CSS token cannot fire it. */
const BANNED = /\b(empower(?:ing|ment)?|transformative|innovative)\b/i;
const flat = written.map(({ a, OUT }) => [a.slug, BANNED.exec(strip(OUT.split('<footer')[0]))])
  .filter(([, m]) => m);
gate(flat.length === 0, `no flattening word in the section's copy${flat.length ? `; FOUND: ${flat.map(([s, m]) => `${s}:"${m[0]}"`).join(', ')}` : ''}`);

/* 9. NO ARTICLE CLAIMS A READING IN ITS TITLE OR DESCRIPTION. A description is
      static markup Google caches; a number in it is wrong within the hour. */
const tensed = written.filter(({ route }) => /\b(today|now|current|latest)\b/i.test(seo(route).description));
gate(tensed.length === 0, `no description makes a dated claim${tensed.length ? `; FOUND: ${tensed.map((w) => w.route).join(', ')}` : ''}`);

/* 10. THE SECTION IS A GRAPH, NOT A LIST. Every article reaches at least two
       others, so a reader who arrives on one from search has somewhere to go. */
const thin = written.filter(({ a }) => (a.related || []).length < 2);
gate(thin.length === 0, `every article relates to two or more${thin.length ? `; THIN: ${thin.map((w) => w.a.slug).join(', ')}` : ''}`);

console.log(`\n${ARTICLES.length + 1} pages. ${fail ? `${fail} gate(s) failed.` : 'All gates pass.'}`);
if (fail) process.exit(1);
