/* ═══════════════════════════════════════════════════════════════════════════
   TEACH  →  public/_pages/v3/teach.html  +  teach/<theme>.html
             +  teach/<theme>/<session>.html  +  before-you-start  +  a-to-z
   routed at /teach and below.  See docs/design/2026-09-11-AD-51-btg-teach-section.md
   ───────────────────────────────────────────────────────────────────────────
   SWECHHA'S BRIDGE THE GAP COMPENDIUM, PUBLISHED AS THEMES RATHER THAN A BOOK.
   Eight themes, each carrying the background READING a teacher needs and the
   SESSIONS that go with it; 43 sessions in all. The source is a 321-page
   manual, and the whole point of this section is that it is not published as
   one — a teacher arrives at a theme, reads what they need, and takes one
   session into a room.

   ★ THE ABSENT ROW IS THE DESIGN. THIS IS THE ARCHITECTURAL DECISION.
   The manual fills its own activity template unevenly: a teaching sequence in
   36 of 43 sessions, materials in 23, an objective in 15, a stated time in
   only 10. Every ed-tech pattern answers that by inventing the missing fields
   or hiding the unevenness behind a uniform card. BRANDING §4.3 already ruled
   the honest form — "a value is not known yet → the row or cell does not
   render" — so a session with three filled fields shows three rows, and the
   strip carries one line saying why its length varies (§4.2). The strip's
   length is evidence. Nothing is invented, and gate 4 fails a rendered row
   with an empty body.

   ★ A THEME ARRIVES. A SESSION OPENS ON PAPER.
   Every other served page opens with a photograph. A session page does not —
   it starts at --paper and stays on paper until one dark-2 band at the foot.
   That inversion is the whole at-a-glance difference between the two page
   types, it costs no new component, and it is true: a theme is an arrival, a
   session is a tool. It also removes any need for 43 photographs that do not
   exist.

   ★ NO PHOTOGRAPH IS BORROWED AND NONE IS GENERATED.
   Five of the eight themes have an honest frame from Swechha's own Bridge the
   Gap coverage. Three — air, food, energy — have none, and ten of the
   healthy-cities frames are named fellows' own project photographs which
   would be misattributed by reuse. Those three get the BLANK SCREEN: the
   halftone dot screen over a paper-2 field, reproducing nothing. It reads as
   printerly absence rather than a placeholder, and unlike a stock photograph
   it tells the truth. Gate 6 refuses a theme whose photo is null and which
   renders an <img> anyway.

   ★ WHAT IS NOT HERE, AND WHY.
     · No eighth nav word. NAV is closed at seven; /teach is reached from
       /learn's onward band, from #workshops on /healthy-cities, and from the
       footer index — the way /schools, /posters and /record are reached.
     · No page script, no tabs(), no client-side filter. A session page must
       render with JavaScript off and print correctly; 43 rows sort fine here.
     · No CC BY 4.0 claim on a session. The manual is a compilation of
       third-party material and only 8 of 43 activities carry an explicit
       source; a session credits what it can and claims nothing it cannot
       (D-51.5). The section's own licence line lives on the guide.
     · No per-session PDF. build:teach runs on five cron publishers a day.
   ═══════════════════════════════════════════════════════════════════════════ */
import { readFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import * as S from './lib/situation-shell.mjs';
import { seo } from './lib/seo-register.mjs';
const { esc, opener, disclose } = S;

const sh = S.shell();
const T = join(S.ROOT, 'data/teach');

/* ═══ DATA ═══════════════════════════════════════════════════════════════ */
const rd = (p) => JSON.parse(readFileSync(join(T, p), 'utf8'));
const INDEX = rd('index.json');
const GUIDE = rd('before-you-start.json');
const ATOZ = rd('a-to-z.json');

/* THE THEME ORDER IS index.json's, and the session order is each session's own
   `position`. Never readdir order: `.sort()` on filenames would put "exposure
   walks" before "how trees grow" and silently renumber a teacher's sequence. */
const THEMES = INDEX.themes.map((t) => {
  const th = rd(`themes/${t.slug}.json`);
  const dir = join(T, 'sessions', t.slug);
  const sessions = readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .map((f) => ({ ...JSON.parse(readFileSync(join(dir, f), 'utf8')), slug: f.slice(0, -5) }))
    .sort((a, b) => a.position - b.position);
  return { ...th, card: t.sub, sessions };
});
const ALL = THEMES.flatMap((t) => t.sessions.map((s) => ({ ...s, theme: t })));

let dataBad = 0;
const dataFail = (m) => { console.error(`DATA: ${m}`); dataBad += 1; };

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
for (const t of THEMES) {
  if (!SLUG_RE.test(t.slug)) dataFail(`theme slug "${t.slug}" is not kebab-case.`);
  if (!t.sessions.length) dataFail(`theme "${t.slug}" holds no session.`);
  if (!t.reading?.length) dataFail(`theme "${t.slug}" carries no reading material.`);
  for (const s of t.sessions) {
    if (!SLUG_RE.test(s.slug)) dataFail(`session slug "${t.slug}/${s.slug}" is not kebab-case.`);
    if (!s.title?.trim()) dataFail(`session ${t.slug}/${s.slug} has no title.`);
    if (!['manual', 'editorial'].includes(s.title_source)) {
      dataFail(`session ${t.slug}/${s.slug} has title_source "${s.title_source}".`);
    }
  }
  /* A THEME MAY CITE ONLY AN EXPLAINER THAT EXISTS. Same rule as learnRail:
     a section may not link an explanation it has not written. */
  for (const slug of t.learn || []) {
    if (!existsSync(join(S.ROOT, 'data/learn/articles', `${slug}.json`))) {
      dataFail(`theme "${t.slug}" cites /learn/${slug}, which has no article file.`);
    }
  }
  if (t.photo && !existsSync(join(S.ROOT, 'public/images/photos', t.photo))) {
    dataFail(`theme "${t.slug}" names photo "${t.photo}", which is not in public/images/photos.`);
  }
}

/* ═══ HREFS ══════════════════════════════════════════════════════════════ */
const themeHref = (slug) => `/teach/${slug}`;
const sessHref = (theme, slug) => `/teach/${theme}/${slug}`;
const GUIDE_HREF = '/teach/before-you-start';
const ATOZ_HREF = '/teach/a-to-z';

/* A "p" BLOCK READS AS A LABEL, NOT A SENTENCE, WHEN IT CARRIES NO
   SENTENCE-ENDING PUNCTUATION ANYWHERE AND IS SHORT: a station name
   ("Atmosphere Pre-1700"), a phase marker (ENGAGE/EXPLAIN/ELABORATE/EVALUATE),
   a duration, a section title. Checking only the LAST character would have
   let "2 or 3: a plant has taken you in through photosynthesis and built you
   into a sugar… Join Terrestrial Life." through — it ends mid-clause-looking
   but is a full instructional sentence — so a "." "!" or "?" ANYWHERE, not
   just at the end, disqualifies a block from being a label. A length ceiling
   keeps a long, terminal-punctuation-free run of manual text (the OCR
   fragments in "the-life-of-a-t-shirt-activity" among them) from being
   mistaken for a short label too. This changes only which class a block
   renders under — no text is reworded, reordered or dropped. */
const LABEL_MAX = 40;
const looksLikeLabel = (x) => {
  const t = x.trim();
  return t.length > 0 && t.length <= LABEL_MAX && !/[.!?]/.test(t);
};

/* ═══ PROSE ══════════════════════════════════════════════════════════════
   Blocks arrive as [{t,x}] with t of "p" or "li". Consecutive list items
   become ONE list; a stray bullet does not become a one-item list on its own
   line. Everything the extractor kept is rendered — the owner's instruction
   was to remove nothing, so there is no truncation and no "read more". */
const prose = (blocks, pad = '        ') => {
  if (!blocks?.length) return '';
  const out = [];
  let li = [];
  const flush = () => {
    if (li.length) {
      out.push(`${pad}<ul class="lr-ul">\n${li.map((x) => `${pad}  <li>${esc(x)}</li>`).join('\n')}\n${pad}</ul>`);
      li = [];
    }
  };
  for (const b of blocks) {
    if (b.t === 'li') li.push(b.x);
    else {
      flush();
      const cls = looksLikeLabel(b.x) ? 'lbl' : 'lr-p';
      out.push(`${pad}<p class="${cls}">${esc(b.x)}</p>`);
    }
  }
  flush();
  return out.join('\n');
};
const firstLine = (blocks) => (blocks?.length ? blocks[0].x : '');

/* ═══ THE METADATA STRIP ═════════════════════════════════════════════════
   Field names in the site's voice, not the manual's. A row renders only where
   the manual filled the field; there is no row with an empty body, no "not
   stated", no em dash and no greyed placeholder. */
const STRIP = [
  ['time', 'How long'],
  ['age', 'Who it is for'],
  ['techniques', 'How it is taught'],
  ['materials', 'What you need'],
  ['objective', 'What it is for'],
  ['vocabulary', 'The words'],
];
const strip = (s) => {
  /* ★ RENDER EVERY BLOCK OF THE FIELD, NOT JUST THE FIRST.
     This rendered `firstLine()` only, and 15 sessions carry a field split over
     several blocks — so the strip silently dropped the rest. `dung-power`
     showed ONE of its NINE materials for an activity that generates methane and
     carries a safety warning in capitals; `what-sustainability-means-to-you`
     rendered its materials as the single word "Per group:". A teacher reading
     the page would have set up the wrong equipment and never known there was
     more. A value that is a list renders as a list. */
  const rows = STRIP
    .filter(([k]) => (s.fields[k] || []).some((b) => b.x.trim()))
    .map(([k, label]) => {
      const parts = (s.fields[k] || []).filter((b) => b.x.trim());
      const body = parts.length === 1
        ? `<p class="lr-st-v tc-st-v">${esc(parts[0].x)}</p>`
        : `<ul class="lr-st-v tc-st-v tc-st-l">${parts.map((b) => `<li>${esc(b.x)}</li>`).join('')}</ul>`;
      return `          <div class="lr-st-r">
            <p class="lbl">${label}</p>
            ${body}
          </div>`;
    });
  if (!rows.length) return '';
  return `        <div class="lr-st">
${rows.join('\n')}
        </div>
        <p class="cap tc-st-m">The manual states these. What it does not state is not here.</p>`;
};

/* ═══ THE STEP LIST ══════════════════════════════════════════════════════
   The one genuinely new component. `.lr-ul` is unordered and `.w7-do-list`
   carries hand-typed numbers, so neither can hold a sequence whose length
   varies from 3 steps to 60. Ruled rows in one column, never cards — a phone
   gets one column and one scroll, and a 1,394-line activity is a longer list
   rather than an overflowing card. */
const steps = (raw) => {
  if (!raw?.length) return '';
  /* A few sequences carry a standalone fragment of their own — "OR", "VS." —
     which is real text in the manual but numbering it as a step of its own
     reads as a defect. Folded into the step above rather than dropped. */
  const blocks = [];
  for (const b of raw) {
    if (b.x.length < 6 && blocks.length) blocks[blocks.length - 1] = { ...blocks[blocks.length - 1], x: `${blocks[blocks.length - 1].x} ${b.x}` };
    else blocks.push(b);
  }
  const items = blocks.map((b, i) => `          <li class="tc-seq-r">
            <p class="lbl tc-seq-n">${String(i + 1).padStart(2, '0')}</p>
            <div class="tc-seq-b">${b.t === 'li' ? '<span class="tc-seq-d" aria-hidden="true"></span>' : ''}${esc(b.x)}</div>
          </li>`);
  return `        <ol class="tc-seq">\n${items.join('\n')}\n        </ol>`;
};

/* ═══ THE LEARN RAIL ═════════════════════════════════════════════════════
   The identical `.cl-learn` component the six situation pages use, so the
   crossing between a session and an explainer does not read as two websites.
   S.learnRail() cannot serve this — it resolves against its own hardcoded
   LEARN_FOR map of the six situations — so the rows are built here from the
   same article files, with the same markup. */
const learnRail = (slugs) => {
  if (!slugs?.length) return '';
  const rows = slugs.map((slug) => {
    const a = JSON.parse(readFileSync(join(S.ROOT, 'data/learn/articles', `${slug}.json`), 'utf8'));
    return `            <li><a href="/learn/${slug}"><b>${esc(a.h1)}</b><span class="cap">${esc(a.card)}</span></a></li>`;
  });
  return `        <div class="cl-learn">
          <p class="lbl cl-k">Understand the data</p>
          <ul class="cl-learn-l">
${rows.join('\n')}
          </ul>
          <p class="cap cl-learn-m"><a class="lk" href="/learn">The whole library</a> &middot; <a class="lk" href="${ATOZ_HREF}">the A to Z</a></p>
        </div>`;
};

/* ═══ MASTHEADS ══════════════════════════════════════════════════════════
   THE BLANK SCREEN. Where no honest photograph exists, the site's one
   licensed graphic mark — the halftone dot screen — is shown over a paper-2
   field with nothing behind it. It may ONLY be used where no honest
   photograph exists (gate 6): the moment it appears beside a theme that had a
   usable frame it becomes a style rather than a statement, and then it is
   decoration. */
const masthead = ({ photo, alt, eyebrow, h1, lead }) => {
  /* THE NESTING IS THE SITE'S, AND IT IS NOT OBVIOUS. `.pic-over` is the
     absolutely-positioned overlay that CONTAINS the eyebrow and the h1 over the
     photograph; `.pic-body` is a SEPARATE block AFTER the picture, on --ground,
     holding the lead. Building it the other way round — text inside a static
     `.pic-body` nested in `.pic` — puts cream type on a light ground below the
     photograph, where it is invisible. Copied from learn.html rather than
     reasoned about, because that is the page that works. */
  const over = `      <div class="pic-over"><div class="wrap">
        <p class="lbl eyebrow">${eyebrow}</p>
        <h1 class="d1">${h1}</h1>
      </div></div>`;
  const after = lead
    ? `\n    <div class="pic-body"><div class="wrap">\n      <p class="lead">${esc(lead)}</p>\n    </div></div>`
    : '';
  if (!photo) {
    return `    <div class="pic ht tc-blank">\n${over}\n    </div>${after}`;
  }
  const src = `/images/photos/${photo}`;
  return `    <div class="pic ht">
      <img class="duo" src="${src}" alt="${esc(alt)}"${S.imgDim(src)} fetchpriority="high">
${over}
    </div>${after}`;
};

/* Real descriptive alt text, in the register already in use on this site —
   what is in the frame, not what the section is about. */
const ALT = {
  'bridge-the-gap-outdoor-briefing.jpg': 'A facilitator in a purple scarf standing before a semicircle of schoolgirls seated on the ground against a boundary wall.',
  'yamuna-students-foam-line.jpg': 'Students standing at the edge of the Yamuna where a thick line of white foam has collected against the bank.',
  'bridge-the-gap-exposure-trip-landfill.jpg': 'Children standing at the edge of a landfill mound, a waste-picker working the slope behind them.',
  'bridge-the-gap-tree-planting-huddle.jpg': 'A tight circle of students crouched together, all their hands packing soil around a newly planted sapling.',
  'bridge-the-gap-no-dumping-banner.jpg': 'Three children holding up a hand-painted cloth banner reading NO DUMPING.',
  'bridge-the-gap-butterfly-gardening-assembly.jpg': 'A school hall filled with hundreds of seated children, many with their hands raised.',
};
const altFor = (photo) => {
  if (!photo) return '';
  if (!ALT[photo]) dataFail(`photo "${photo}" has no alt sentence in ALT.`);
  return ALT[photo] || '';
};

/* ═══ GROUNDS ════════════════════════════════════════════════════════════
   Adjacency is checked by S.groundChain(), and a session page's body bands
   are OPTIONAL — a session with no discussion and no tail drops two of them.
   So the light grounds alternate over whichever bands are actually present
   rather than being written down per band; a fixed list would put paper next
   to paper the moment a band fell out. */
const PAPER = '#F3F2F0';
const PAPER2 = '#ECEBE8';
const alternating = (ids, start = 0) =>
  ids.map((id, i) => [id, `${(i + start) % 2 ? 'paper-2' : 'paper'} t2`, (i + start) % 2 ? PAPER2 : PAPER]);

const PAGE_CSS = `
.tc-blank{background:var(--paper-2);min-height:clamp(320px,44vh,520px)}
.tc-blank .d1,.tc-blank .lbl,.tc-blank .lead{color:var(--fg)}
.lr-p{margin:0 0 clamp(12px,1.6vw,18px);max-width:64ch}
.lr-p:last-child{margin-bottom:0}
.lr-ul{margin:0 0 clamp(12px,1.6vw,18px);padding-left:1.1em;max-width:62ch}
.lr-ul li{margin:0 0 7px}
.tc-st-v{white-space:normal;font-weight:600;max-width:56ch}
.tc-st-l{margin:0;padding-left:1.05em}
.tc-st-l li{margin:0 0 4px}
.tc-st-l li:last-child{margin-bottom:0}
.tc-st-m{margin:calc(-1 * clamp(10px,1.4vw,16px)) 0 0;max-width:52ch}
.tc-seq{list-style:none;margin:clamp(18px,2.6vw,26px) 0 0;padding:0;counter-reset:none}
.tc-seq-r{display:grid;grid-template-columns:auto minmax(0,1fr);gap:clamp(12px,2vw,22px);
  border-top:1px solid var(--rule);padding:clamp(11px,1.5vw,15px) 0;align-items:baseline}
.tc-seq-r:last-child{border-bottom:1px solid var(--rule)}
.tc-seq-n{margin:0;font-variant-numeric:tabular-nums;color:var(--ink-3)}
.tc-seq-b{margin:0;max-width:62ch}
.tc-seq-d{display:inline-block;width:.42em;height:.42em;border-radius:50%;
  background:currentColor;margin:0 .55em .18em 0;opacity:.55}
.tc-ed{margin:clamp(14px,2vw,20px) 0 0;max-width:56ch}
.tc-src{margin:0;max-width:64ch}
.tc-az{display:grid;gap:clamp(22px,3.4vw,38px)}
.tc-az-g{scroll-margin-top:80px}
.tc-az-h{margin:0 0 10px}
/* Reading sub-headings use the site's OWN .h2 (Archivo 680, --t-h2, uppercase).
   There is no .d3 here and adding one would be a new step in the type scale for
   no reason; this class only supplies the rhythm around it. */
.tc-rh{margin:clamp(24px,3.2vw,34px) 0 10px;max-width:50ch}
.tc-rh:first-child{margin-top:0}
.tc-az-l{list-style:none;margin:0;padding:0;display:grid;gap:0}
.tc-az-l li{border-top:1px solid currentColor;padding:9px 0;max-width:74ch}
.tc-az-l li:last-child{border-bottom:1px solid currentColor}
.tc-az-t{font-weight:600}
.tc-jump{display:flex;flex-wrap:wrap;gap:6px 10px;margin:clamp(14px,2vw,20px) 0 0;padding:0;list-style:none}
.tc-jump a{font-variant-numeric:tabular-nums;text-decoration:none}
@media (max-width:560px){.tc-seq-r{grid-template-columns:minmax(0,1fr);gap:4px}}

/* THE "EIGHT THEMES" LIST, AND A THEME'S OWN SESSION LIST, BOTH a.d1/d2.rl.w7-do-t.
   NO BACKTICKS IN THIS BLOCK: it is inside build-teach.mjs's own PAGE_CSS
   template literal, and a pair of them here would silently truncate it, the
   same trap WORK_CSS's own comment warns about.
   work-shell.mjs (and healthy-cities, which shares it) puts .w7-do-t on a
   nested h3 and resets text-decoration on the WRAPPING .w7-do-list>li>a one
   level up — this file puts the class combination directly on the a itself,
   so that reset never reaches it and the browser's native underline renders
   through the display-scale word, over the .cap caption below it.
   .w7-do-t{--rl-top;--rl-bottom} is the same trim home.html's own rule
   carries; it is not defined anywhere this file imports, so it has to be
   stated here too. Scoped to this file's own style tag — no other generator
   reads PAGE_CSS from build-teach.mjs. */
a.w7-do-t{text-decoration:none;--rl-top:.055em;--rl-bottom:.135em}
@media (max-width:767px){a.w7-do-t{--rl-bottom:.11em}}

/* THE "NEXT" DOOR GRID. Every onward() band in this file (the /teach index,
   all 8 themes, all 43 sessions) uses .lr-doors/.lr-door, but those
   classnames are only ever defined in scripts/build-learn.mjs's own PAGE_CSS
   — this file doesn't import that constant, so without a copy here every
   "Next" band on /teach rendered in default unstyled block flow. Adapted from
   build-learn.mjs's own .lr-doors/.lr-door rule. The door title itself was
   still a bare <b>, with no .lr-door-h span to match it against — copied
   below along with the underline treatment (definition + hover/focus states)
   from build-learn.mjs:411,457-462, scoped to this file's own style tag. */
/* THE INDEX COLUMNS AND THE DIRECTORY TABLE. Same root cause as the two rules
   above, found by gate 15 on its first run rather than by a reader: .lx-cats /
   .lx-c / .lx-c-h / .lx-l (the "other themes" list on every theme page and the
   guide), .lx-s (the "If you have one period" entry band) and .lr-st /
   .lr-st-r / .lr-st-v (the 43-row session directory on /teach) are all defined
   only in build-learn.mjs's own PAGE_CSS. This file uses the markup and never
   imported the CSS, so the directory table rendered as plain stacked text and
   the theme columns had no rules, no grid and no spacing.
   Copied from build-learn.mjs. .lr-st-r's three-column grid is kept as it is
   there — session, theme, what it is for — and collapses under 720px. */
/* THE SESSION PAGE'S OWN COMPONENTS. Gate 15's third pass. Every one of the 43
   session pages opens with .wk-anc (the "back to the theme" line), leads with
   .lr-answer, carries .p-do/.p-do-r discussion rows, closes with .lr-cannot
   tail blocks and .lr-src credits, and some carry .cl-learn. Not one of those
   rules was in this file: .wk-anc lives in work-shell.mjs, .p-do-r in
   build-situation-air.mjs, the rest in build-learn.mjs. So the breadcrumb was
   plain text with no target size, the lead had no measure, and the ruled rows
   had no rules — on the page a teacher actually uses.
   .p-do is a bare container everywhere on the site (no rule of its own), so it
   is declared here as the grid its rows sit in rather than copied. */
.wk-anc{display:inline-flex;align-items:center;gap:9px;min-height:44px;margin:0;
  text-decoration:none;color:var(--ink-2)}
.wk-anc i{font-style:normal}
.p-do{display:grid;margin:clamp(16px,2.4vw,24px) 0 0}
.p-do-r{border-top:1px solid var(--rule);padding:clamp(11px,1.5vw,15px) 0}
.p-do-r:last-child{border-bottom:1px solid var(--rule)}
.lr-answer{max-width:60ch;font-weight:500}
.lr-ul{margin:10px 0 0;padding-left:1.1em;display:grid;gap:8px}
.lr-cannot{margin:clamp(22px,3vw,32px) 0 0;border-top:2px solid currentColor;
  padding-top:14px;max-width:64ch}
.lr-src{list-style:none;margin:clamp(16px,2.4vw,24px) 0 0;padding:0;display:grid;
  gap:14px;max-width:70ch}
.cl-learn{margin-top:clamp(26px,3.6vw,40px);border-top:1px solid var(--rule);
  padding-top:clamp(16px,2.2vw,22px)}
.cl-learn-l{list-style:none;margin:10px 0 0;padding:0;display:grid;gap:10px}
.cl-learn-l a{text-decoration:none;color:inherit;display:grid;gap:2px}
.lx-cats{display:grid;gap:clamp(26px,4vw,44px);margin:clamp(20px,3vw,32px) 0 0;
  grid-template-columns:repeat(auto-fit,minmax(280px,1fr))}
.lx-c{min-width:0}
.lx-c-h{margin:0 0 4px}
.lx-c-l{margin:0 0 12px;max-width:44ch}
.lx-l{list-style:none;margin:0;padding:0;display:grid;gap:9px}
.lx-l li{border-top:1px solid currentColor;padding-top:9px}
.lx-l a{text-decoration:none;color:inherit;display:grid;gap:2px}
.lx-start{display:grid;gap:clamp(20px,3vw,34px);margin:clamp(20px,3vw,32px) 0 0;
  grid-template-columns:repeat(auto-fit,minmax(260px,1fr))}
.lx-s{display:grid;gap:7px;align-content:start;min-width:0;text-decoration:none;
  color:inherit;border-top:2px solid currentColor;padding-top:14px}
.lr-st{display:grid;gap:0;margin:clamp(18px,2.6vw,26px) 0 clamp(20px,3vw,30px);
  grid-template-columns:minmax(0,1fr)}
.lr-st-r{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(0,1fr) minmax(0,1.4fr);
  gap:12px;align-items:baseline;padding:14px 0;border-top:1px solid currentColor}
.lr-st-r:last-child{border-bottom:1px solid currentColor}
.lr-st-v{margin:0}
@media (max-width:720px){.lr-st-r{grid-template-columns:minmax(0,1fr);gap:4px}}
.lr-doors{display:grid;gap:clamp(14px,2vw,20px);margin:clamp(18px,2.6vw,26px) 0 0;
  grid-template-columns:repeat(auto-fit,minmax(240px,1fr))}
.lr-door{display:grid;gap:5px;align-content:start;min-width:0;text-decoration:none;
  color:inherit;border-top:2px solid currentColor;padding-top:12px}
.lr-door-h{font-family:var(--display);font-size:clamp(19px,2.2vw,24px);line-height:1.14;
  text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:5px;
  text-decoration-color:var(--hair);transition:text-decoration-color .14s ease}
.paper .lr-door-h,.paper-2 .lr-door-h{text-decoration-color:var(--rule-2)}
.lr-door:hover .lr-door-h,.lr-door:focus-visible .lr-door-h{text-decoration-color:var(--mustard)}
@media (prefers-reduced-motion:reduce){.lr-door-h{transition:none}}

/* PRINT. A teacher prints a session and carries it into a room, and until now
   that produced a black rectangle — @media print matched nothing on any of the
   94 served pages. Scoped to this section's own pageCss so it cannot regress
   the other 91. State is carried by shape rather than only by hue throughout
   this design language for exactly this reason (BRANDING §0: "so it survives
   colour blindness and a photocopier") — a photocopier is a real device in
   this audience. */
@media print{
  .nav,.navidx,.foot,.lr-doors,.cl-learn,.skip,.tc-jump,.ask{display:none!important}
  :root{--ground:#fff;--ground-2:#fff;--paper:#fff;--paper-2:#fff}
  section,.wrap{padding:0!important;background:#fff!important;color:#111!important}
  .wrap{max-width:none!important}
  .d1{font-size:22pt!important;color:#111!important}
  .d2{font-size:18pt!important;color:#111!important}
  .dx-b{display:block!important}
  .dx-s{list-style:none}
  .tc-seq-r{break-inside:avoid;page-break-inside:avoid}
  .lr-st-r{break-inside:avoid}
  a[href]{text-decoration:none;color:#111}
  @page{margin:16mm}
}
`;

const written = [];
const V3 = S.V3;
mkdirSync(join(V3, 'teach'), { recursive: true });
for (const t of THEMES) mkdirSync(join(V3, 'teach', t.slug), { recursive: true });

if (dataBad) {
  console.error(`\nREFUSING TO WRITE: ${dataBad} data check(s) failed.`);
  process.exit(1);
}

/* ═══ WRITE — the 43 sessions ════════════════════════════════════════════ */
for (const t of THEMES) {
  for (const [i, s] of t.sessions.entries()) {
    const route = sessHref(t.slug, s.slug);
    const F = s.fields;
    const next = t.sessions[i + 1] || null;
    const prev = t.sessions[i - 1] || null;

    const tailBits = [
      ['closure', 'How to end it'],
      ['evaluation', 'How you know it worked'],
      ['extension', 'If it goes well'],
    ].filter(([k]) => (F[k] || []).length);
    const hasMore = (F.discussion || []).length || (s.other || []).length
      || (F.examples || []).length;
    const hasTail = tailBits.length > 0;

    const bodyIds = ['top', 'run', ...(hasMore ? ['more'] : []), ...(hasTail ? ['tail'] : [])];
    const BANDS = [
      ...alternating(bodyIds),
      ['credit', 'dark-2 t2', '#151512'],
      ['onward', 'paper t3', PAPER],
    ];

    const B = {
      top: () => `    <div class="wrap">
        <p class="lbl wk-anc"><a class="lk" href="${themeHref(t.slug)}">&larr;&nbsp;${esc(t.name)}</a></p>
        <h1 class="d2" id="top-h">${esc(s.title)}</h1>
${(F.description || []).length ? `        <p class="lead lr-answer">${esc(firstLine(F.description))}</p>\n` : ''}${strip(s)}
${s.title_source === 'editorial' ? `        <p class="cap tc-ed">The manual leaves this session untitled. The name is ours, taken from what the session says it is for; everything below is the manual's.</p>` : ''}${s.content_note ? `\n        <p class="cap tc-ed">${esc(s.content_note)}</p>` : ''}
      </div>`,
      run: () => `${opener('run', 'How it runs', (F.sequence || []).length
        ? 'The teaching sequence as the manual gives it.'
        : 'The manual gives this session no step list. What it does give is below.')}
      <div class="wrap">
${(F.sequence || []).length ? steps(F.sequence) : prose(F.objective || s.other?.[0]?.body || [])}
${(F.safety || []).length ? `        <div class="lr-cannot">
          <p class="lbl">Safety</p>
          <ul class="lr-ul">${(F.safety || []).map((b) => `<li>${esc(b.x)}</li>`).join('')}</ul>
        </div>` : ''}
      </div>`,
      more: () => `${opener('more', 'Talking about it', 'Discussion points, worked examples and the handouts the manual prints with this session.')}
      <div class="wrap">
${(F.discussion || []).length ? `        <div class="p-do"><div class="p-do-r">
          <p class="lbl">Points for discussion</p>
${prose(F.discussion, '          ')}
        </div></div>` : ''}
${(F.examples || []).length ? disclose('Worked examples', prose(F.examples, '          ')) : ''}
${(s.other || []).map((o) => (o.label
        ? disclose(esc(o.label.charAt(0) + o.label.slice(1).toLowerCase()), prose(o.body, '          '))
        : disclose('More from the manual', prose(o.body, '          ')))).join('\n')}
      </div>`,
      tail: () => `${opener('tail', 'Ending it', 'How the manual closes this session, and where it can go next.')}
      <div class="wrap">
${tailBits.map(([k, label]) => `        <div class="lr-cannot">
          <p class="lbl">${label}</p>
${prose(F[k], '          ')}
        </div>`).join('\n')}
      </div>`,
      /* THE CREDIT BAND CLAIMS NOTHING IT CANNOT. Where the manual names a
         source it is printed; where it does not, the band says so plainly
         rather than asserting a licence Swechha does not hold (D-51.5). */
      credit: () => `${opener('credit', 'Where this comes from', 'Bridge the Gap is a compilation. This is what the manual records for this session.')}
      <div class="wrap">
${(F.source || []).length
        ? `        <div class="lr-src">${prose(F.source, '          ')}</div>`
        : `        <p class="lr-p tc-src">The manual prints no source for this session. It is published here as Swechha has used it, adapted over years of classroom work; if you recognise its origin, <a class="lk" href="mailto:${S.ASK_EMAIL}">tell us</a> and we will credit it.</p>`}
        <p class="cap"><a class="lk" href="${GUIDE_HREF}">Before you start</a> sets out where the compendium as a whole comes from.</p>
      </div>`,
      onward: () => `${opener('onward', 'Next', 'Where to go from here.')}
      <div class="wrap"><div class="lr-doors">
${next ? `        <a class="lr-door" href="${sessHref(t.slug, next.slug)}"><p class="lbl">Next session</p><span class="lr-door-h">${esc(next.title)}</span><span class="cap">${esc(t.name)}, ${next.position} of ${t.sessions.length}</span></a>` : ''}
${prev && !next ? `        <a class="lr-door" href="${sessHref(t.slug, prev.slug)}"><p class="lbl">Previous session</p><span class="lr-door-h">${esc(prev.title)}</span><span class="cap">${esc(t.name)}, ${prev.position} of ${t.sessions.length}</span></a>` : ''}
        <a class="lr-door" href="${themeHref(t.slug)}"><p class="lbl">The theme</p><span class="lr-door-h">${esc(t.name)}</span><span class="cap">${t.sessions.length} sessions and the background reading</span></a>
        <a class="lr-door" href="/teach"><p class="lbl">All eight themes</p><span class="lr-door-h">Teach</span><span class="cap">${ALL.length} sessions across ${THEMES.length} themes</span></a>
      </div>
${learnRail(t.learn)}
      </div>`,
    };

    const IX = [
      ['How it runs', '#run'],
      ...(hasMore ? [['Talking about it', '#more']] : []),
      ...(hasTail ? [['Ending it', '#tail']] : []),
      ['Sources', '#credit'],
      ['Next', '#onward'],
    ];

    const OUT = await S.assemble({
      file: `teach/${t.slug}/${s.slug}.html`,
      route,
      title: seo(route).title,
      /* A SESSION IS AN ARTICLE AND CARRIES NO DATE. An evergreen lesson plan
         with a datePublished would be a date invented to chase a rich result. */
      headExtra: S.articleJsonLd({
        headline: s.title,
        description: seo(route).description,
        url: route,
        image: t.photo ? `/images/photos/${t.photo}` : null,
        section: t.name,
        about: [t.name, 'Education for Sustainable Development'],
      }),
      bands: BANDS, index: IX, sh, clashes: S.groundChain(BANDS),
      pageCss: PAGE_CSS,
      sectionFor: (id) => B[id](),
      note: `teach/${t.slug}/${s.slug} — ${Object.keys(F).length} field(s), ${(s.other || []).length} extra block(s), title from ${s.title_source}.`,
    });
    written.push({ route, OUT, kind: 'session', s, t });
  }
}

/* ═══ WRITE — the 8 themes ═══════════════════════════════════════════════ */
for (const [ti, t] of THEMES.entries()) {
  const route = themeHref(t.slug);
  const sib = THEMES.filter((x) => x.slug !== t.slug);
  const hasLearn = (t.learn || []).length > 0;
  const BANDS = [
    ['top', 't1', '#0D0D0B'],
    ['reading', 'paper t2', PAPER],
    ['sessions', 't2', '#0D0D0B'],
    ...(hasLearn ? [['live', 'paper-2 t2', PAPER2]] : []),
    ['onward', 'paper t3', PAPER],
  ];
  const B = {
    top: () => masthead({
      photo: t.photo, alt: altFor(t.photo),
      eyebrow: `Teach &middot; ${ti + 1} of ${THEMES.length}`,
      h1: esc(t.name), lead: t.card,
    }),
    /* THE READING MATERIAL. This is what makes the section a compendium rather
       than an index: the chapter's own background text, sectioned on the
       manual's own numbered sub-headings, on the page a teacher reads before
       choosing a session. */
    reading: () => `${opener('reading', 'The background', t.reading_note
      ? `What this theme sets out on ${t.card.toLowerCase()}, before any session.`
      : `What the manual sets out on ${t.card.toLowerCase()}, before any session.`)}
      <div class="wrap">${t.reading_note ? `\n        <p class="cap tc-ed">${esc(t.reading_note)}</p>` : ''}
${t.reading.map((sec) => `${sec.h ? `        <h3 class="h2 tc-rh">${esc(sec.h)}</h3>\n` : ''}${prose(sec.body)}`).join('\n')}
      </div>`,
    sessions: () => `${opener('sessions', 'The sessions', `${t.sessions.length} ${t.sessions.length === 1 ? 'session' : 'sessions'} for this theme. Take one, take all of them, or change them for your own room.`)}
      <div class="wrap">
        <ol class="w7-do-list">
${t.sessions.map((s) => `          <li>
            <p class="lbl">${String(s.position).padStart(2, '0')}</p>
            <a class="d2 rl w7-do-t" href="${sessHref(t.slug, s.slug)}">${esc(s.title)}</a>
            <p class="cap">${esc(sessionCard(s))}</p>
          </li>`).join('\n')}
        </ol>
      </div>`,
    live: () => `${opener('live', 'Understand the data', 'The numbers behind this theme, as this site publishes them.')}
      <div class="wrap">
${learnRail(t.learn)}
      </div>`,
    onward: () => `${opener('onward', 'Next', 'The other themes, and what to read first.')}
      <div class="wrap"><div class="lr-doors">
        <a class="lr-door" href="${GUIDE_HREF}"><p class="lbl">Start here</p><span class="lr-door-h">Before you start</span><span class="cap">How to teach this, and why it is taught this way</span></a>
        <a class="lr-door" href="/teach"><p class="lbl">All eight</p><span class="lr-door-h">Teach</span><span class="cap">${ALL.length} sessions across ${THEMES.length} themes</span></a>
        <a class="lr-door" href="${ATOZ_HREF}"><p class="lbl">Look a word up</p><span class="lr-door-h">The A to Z</span><span class="cap">${ATOZ.terms.length} environmental terms, defined plainly</span></a>
      </div>
      <div class="lx-cats">
        <div class="lx-c"><h3 class="d2 lx-c-h">The other themes</h3>
          <ul class="lx-l">
${sib.map((x) => `            <li><a href="${themeHref(x.slug)}"><span>${esc(x.name)}</span><span class="cap">${esc(x.card)} &middot; ${x.sessions.length} sessions</span></a></li>`).join('\n')}
          </ul>
        </div>
      </div>
      </div>`,
  };
  const IX = [
    ['The background', '#reading'],
    ['The sessions', '#sessions'],
    ...(hasLearn ? [['Understand the data', '#live']] : []),
    ['Next', '#onward'],
  ];
  const OUT = await S.assemble({
    file: `teach/${t.slug}.html`,
    route,
    title: seo(route).title,
    headExtra: S.itemListJsonLd({
      name: `${t.name} — teaching sessions`,
      items: t.sessions.map((s) => ({
        name: s.title, url: sessHref(t.slug, s.slug), description: sessionCard(s),
      })),
    }),
    bands: BANDS, index: IX, sh, clashes: S.groundChain(BANDS),
    pageCss: PAGE_CSS,
    sectionFor: (id) => B[id](),
    note: `teach/${t.slug} — ${t.sessions.length} sessions, ${t.reading.length} reading section(s), photo ${t.photo || 'NONE (blank screen)'}.`,
  });
  written.push({ route, OUT, kind: 'theme', t });
}

/* A ONE-LINE CARD FOR A SESSION, derived from the session's own words — its
   objective if it has one, else its description, else what the manual does
   give. Never a restatement of the title, and never invented. */
function sessionCard(s) {
  const src = (s.fields.objective || []).length ? s.fields.objective
    : (s.fields.description || []).length ? s.fields.description
      : (s.fields.time || []).length ? s.fields.time
        : (s.other || [])[0]?.body || [];
  let x = (firstLine(src) || '').replace(/\s+/g, ' ').trim();
  x = x.replace(/^(To|to)\s/, 'To ');
  if (x.length > 118) {
    x = x.slice(0, 118);
    x = x.slice(0, Math.max(x.lastIndexOf(' '), 60)).replace(/[,;:]$/, '') + '…';
  }
  return x || `Session ${s.position} of this theme.`;
}

/* ═══ WRITE — Before you start (the teacher's guide) ═════════════════════
   ONE PAGE, navigated by the shell's own section-index chip strip, because
   that is what this site already does with a long argument: /about, /act and
   /farm are each one long page, and /learn/how-to-read-environmental-data
   builds to 1,384 lines. A teacher reads the guide once and then never again;
   splitting it into seven routes would multiply the register cost by seven and
   gain nothing. If `techniques` ever outgrows a band it becomes
   /teach/before-you-start/techniques — naming the future route costs nothing
   and stops a reflexive one-page-per-heading split later. */
{
  const secs = GUIDE.sections;
  const bodyIds = secs.map((_, i) => `s${i + 1}`);
  /* The guide has one band per section, so how many there are decides which
     ground the onward band may take. Hardcoding `paper t3` here put paper next
     to paper the moment the section count was odd, which it is (7). */
  const lastPaper = (bodyIds.length - 1) % 2 === 0;
  const BANDS = [
    ['top', 't1', '#0D0D0B'],
    ...alternating(bodyIds),
    ['onward', lastPaper ? 'paper-2 t3' : 'paper t3', lastPaper ? PAPER2 : PAPER],
  ];
  const B = {
    top: () => masthead({
      photo: null, alt: '', eyebrow: 'Teach &middot; start here',
      h1: 'Before you<br>start.',
      lead: 'Why this is taught the way it is taught — and how to run a session so it does something.',
    }),
    onward: () => `${opener('onward', 'Next', 'The eight themes, and the words.')}
      <div class="wrap">
      <div class="lx-cats">
${CHUNK(THEMES, 3).map((col) => `        <div class="lx-c">
          <ul class="lx-l">
${col.map((t) => `            <li><a href="${themeHref(t.slug)}"><span>${esc(t.name)}</span><span class="cap">${esc(t.card)} &middot; ${t.sessions.length} sessions</span></a></li>`).join('\n')}
          </ul>
        </div>`).join('\n')}
      </div>
      <div class="lr-doors">
        <a class="lr-door" href="${ATOZ_HREF}"><p class="lbl">Look a word up</p><span class="lr-door-h">The A to Z</span><span class="cap">${ATOZ.terms.length} environmental terms, defined plainly</span></a>
        <a class="lr-door" href="/schools"><p class="lbl">Bring us in</p><span class="lr-door-h">Work with a school</span><span class="cap">Swechha runs these sessions with schools directly</span></a>
        <a class="lr-door" href="/learn"><p class="lbl">The data</p><span class="lr-door-h">Learn</span><span class="cap">What the numbers behind these themes actually mean</span></a>
      </div>
      </div>`,
  };
  for (const [i, sec] of secs.entries()) {
    B[`s${i + 1}`] = () => `${opener(`s${i + 1}`, esc(TITLECASE(sec.h)), `Section ${sec.n} of the introduction to Education for Sustainable Development.`)}
      <div class="wrap">
${sec.subs.map((sub) => `${sub.h ? `        <h3 class="h2 tc-rh">${esc(sub.h)}</h3>\n` : ''}${prose(sub.body)}`).join('\n')}
      </div>`;
  }
  const OUT = await S.assemble({
    file: 'teach/before-you-start.html',
    route: GUIDE_HREF,
    title: seo(GUIDE_HREF).title,
    headExtra: S.articleJsonLd({
      headline: 'Before you start — teaching Education for Sustainable Development',
      description: seo(GUIDE_HREF).description,
      url: GUIDE_HREF,
      image: null,
      section: 'Teach',
      about: ['Education for Sustainable Development', 'Environmental education', 'Teaching'],
    }),
    bands: BANDS,
    index: secs.map((sec, i) => [TITLECASE(sec.h), `#s${i + 1}`]),
    sh, clashes: S.groundChain(BANDS),
    pageCss: PAGE_CSS,
    sectionFor: (id) => B[id](),
    note: `teach/before-you-start — ${secs.length} sections, ${secs.reduce((n, s) => n + s.subs.length, 0)} subsections.`,
  });
  written.push({ route: GUIDE_HREF, OUT, kind: 'guide' });
}

/* ═══ WRITE — The A to Z ═════════════════════════════════════════════════ */
{
  const groups = [...new Set(ATOZ.terms.map((t) => t.term[0].toUpperCase()))].sort();
  const BANDS = [
    ['top', 't1', '#0D0D0B'],
    ['az', 'paper t2', PAPER],
    ['onward', 'paper-2 t3', PAPER2],
  ];
  const B = {
    top: () => masthead({
      photo: null, alt: '', eyebrow: 'Teach &middot; the glossary',
      h1: 'The A to Z.',
      lead: `${ATOZ.terms.length} environmental terms, defined plainly, as the compendium defines them.`,
    }),
    az: () => `${opener('az', 'Every word', 'The glossary printed at the back of the manual, in full.')}
      <div class="wrap">
        <ul class="tc-jump">
${groups.map((g) => `          <li><a class="lk" href="#az-${g}">${g}</a></li>`).join('\n')}
        </ul>
        <div class="tc-az">
${groups.map((g) => `          <div class="tc-az-g" id="az-${g}">
            <h3 class="d1 tc-az-h">${g}</h3>
            <ul class="tc-az-l">
${ATOZ.terms.filter((t) => t.term[0].toUpperCase() === g).map((t) => `              <li><span class="tc-az-t">${esc(t.term)}</span> &mdash; ${esc(t.def)}</li>`).join('\n')}
            </ul>
          </div>`).join('\n')}
        </div>
      </div>`,
    onward: () => `${opener('onward', 'Next', 'Where these words are used.')}
      <div class="wrap"><div class="lr-doors">
        <a class="lr-door" href="/teach"><p class="lbl">The compendium</p><span class="lr-door-h">Teach</span><span class="cap">${ALL.length} sessions across ${THEMES.length} themes</span></a>
        <a class="lr-door" href="/learn"><p class="lbl">The data</p><span class="lr-door-h">Learn</span><span class="cap">What India's own environmental figures mean, with their sources</span></a>
        <a class="lr-door" href="${GUIDE_HREF}"><p class="lbl">Start here</p><span class="lr-door-h">Before you start</span><span class="cap">How to teach this, and why it is taught this way</span></a>
      </div></div>`,
  };
  const OUT = await S.assemble({
    file: 'teach/a-to-z.html',
    route: ATOZ_HREF,
    title: seo(ATOZ_HREF).title,
    headExtra: S.articleJsonLd({
      headline: 'The A to Z — an environmental glossary',
      description: seo(ATOZ_HREF).description,
      url: ATOZ_HREF, image: null, section: 'Teach',
      about: ['Environmental glossary', 'Environmental education'],
    }),
    bands: BANDS,
    index: [['Every word', '#az'], ['Next', '#onward']],
    sh, clashes: S.groundChain(BANDS),
    pageCss: PAGE_CSS,
    sectionFor: (id) => B[id](),
    note: `teach/a-to-z — ${ATOZ.terms.length} terms in ${groups.length} groups.`,
  });
  written.push({ route: ATOZ_HREF, OUT, kind: 'atoz' });
}

/* ═══ WRITE — the landing page, which IS the directory ═══════════════════
   /learn already merges a landing and a directory at 30 items in 8 categories;
   this is 43 in 8. A second index page would be a second list of the same
   sessions, and a hand-maintained parallel list is this repo's most repeated
   defect — so there is one page, and both of its reading modes are derived
   from the same walk that wrote the session pages. */
{
  const BANDS = [
    ['top', 't1', '#0D0D0B'],
    ['start', 'paper t2', PAPER],
    ['themes', 't2', '#0D0D0B'],
    ['directory', 'paper-2 t2', PAPER2],
    ['onward', 'paper t3', PAPER],
  ];
  /* "IF YOU HAVE ONE PERIOD" — four sessions chosen as the way in: the ones
     that need a room and nothing else. A teacher's first question is not which
     topic but what can be run on Thursday. Chosen because they carry no
     MATERIALS requirement, derived rather than listed by hand. */
  const oneP = ALL.filter((s) => !(s.fields.materials || []).length
    && (s.fields.sequence || []).length).slice(0, 4);

  const B = {
    top: () => masthead({
      photo: 'bridge-the-gap-butterfly-gardening-assembly.jpg',
      alt: altFor('bridge-the-gap-butterfly-gardening-assembly.jpg'),
      eyebrow: esc(INDEX.eyebrow),
      h1: 'Take it into<br>the room.',
      lead: INDEX.lead,
    }),
    start: () => `${opener('start', 'If you have one period', 'Four sessions that need a room and nothing else.')}
      <div class="wrap">
        <div class="lx-s"><ul class="lx-l">
${oneP.map((s) => `          <li><a href="${sessHref(s.theme.slug, s.slug)}"><span>${esc(s.title)}</span><span class="cap">${esc(s.theme.name)} &middot; ${esc(sessionCard(s))}</span></a></li>`).join('\n')}
        </ul></div>
        <p class="cap"><a class="lk" href="${GUIDE_HREF}">Before you start</a> sets out how to run one of these so it does something.</p>
      </div>`,
    themes: () => `${opener('themes', 'Eight themes', 'Each one carries the background a teacher needs, and the sessions that go with it.')}
      <div class="wrap">
${INDEX.families.map((fam) => `        <p class="lbl">${esc(fam.h)}</p>
        <ol class="w7-do-list">
${fam.themes.map((slug) => {
      const t = THEMES.find((x) => x.slug === slug);
      const n = THEMES.indexOf(t) + 1;
      return `          <li>
            <p class="lbl">${String(n).padStart(2, '0')}</p>
            <a class="d1 rl w7-do-t" href="${themeHref(t.slug)}">${esc(t.name)}</a>
            <p class="cap">${esc(t.card)} &middot; ${t.sessions.length} sessions, ${t.reading.length} sections of reading</p>
          </li>`;
    }).join('\n')}
        </ol>`).join('\n')}
      </div>`,
    /* THE DIRECTORY. `.lr-st` verbatim — session, theme, what it is for — and
       no duration column: the manual states a time for only 10 of the 43, and
       in two incompatible units (clock time in themes 01-02, session ordinals
       in 03-08). A column two-thirds empty, or a filter that cannot be filled,
       would be worse than none. */
    directory: () => `${opener('directory', 'All ${n} sessions'.replace('${n}', ALL.length), 'Every session in the compendium, by theme.')}
      <div class="wrap">
        <div class="lr-st">
${ALL.map((s) => `          <div class="lr-st-r">
            <p class="lr-st-v tc-st-v"><a class="lk" href="${sessHref(s.theme.slug, s.slug)}">${esc(s.title)}</a></p>
            <p class="lbl">${esc(s.theme.name)}</p>
            <p class="cap">${esc(sessionCard(s))}</p>
          </div>`).join('\n')}
        </div>
      </div>`,
    onward: () => `${opener('onward', 'Next', 'The guide, the words, and the people who run these sessions.')}
      <div class="wrap"><div class="lr-doors">
        <a class="lr-door" href="${GUIDE_HREF}"><p class="lbl">Start here</p><span class="lr-door-h">Before you start</span><span class="cap">How to teach this, and why it is taught this way</span></a>
        <a class="lr-door" href="${ATOZ_HREF}"><p class="lbl">Look a word up</p><span class="lr-door-h">The A to Z</span><span class="cap">${ATOZ.terms.length} environmental terms, defined plainly</span></a>
        <a class="lr-door" href="/schools"><p class="lbl">Bring us in</p><span class="lr-door-h">Work with a school</span><span class="cap">Swechha runs these sessions with schools directly</span></a>
        <a class="lr-door" href="/healthy-cities"><p class="lbl">In the field</p><span class="lr-door-h">Healthy Cities</span><span class="cap">The funded chapter delivering this curriculum now</span></a>
      </div></div>`,
  };
  const OUT = await S.assemble({
    file: 'teach.html',
    route: '/teach',
    title: seo('/teach').title,
    /* AN INDEX IS AN ItemList AND NOTHING MORE. The list is the RENDERED list,
       in the rendered order, from the same walk the directory band renders —
       so the markup and the structured data cannot name different sets. */
    headExtra: S.itemListJsonLd({
      name: 'Swechha Bridge the Gap — teaching sessions',
      items: ALL.map((s) => ({
        name: s.title, url: sessHref(s.theme.slug, s.slug), description: sessionCard(s),
      })),
    }),
    bands: BANDS,
    index: [['If you have one period', '#start'], ['Eight themes', '#themes'],
      ['All sessions', '#directory'], ['Next', '#onward']],
    sh, clashes: S.groundChain(BANDS),
    pageCss: PAGE_CSS,
    sectionFor: (id) => B[id](),
    note: `${ALL.length} sessions in ${THEMES.length} themes; ${oneP.length} one-period picks.`,
  });
  written.push({ route: '/teach', OUT, kind: 'index' });
}

function CHUNK(xs, n) {
  const out = [];
  const per = Math.ceil(xs.length / n);
  for (let i = 0; i < xs.length; i += per) out.push(xs.slice(i, i + per));
  return out;
}
function TITLECASE(s) {
  const t = String(s).trim();
  if (!/[a-z]/.test(t)) {
    return t.toLowerCase().replace(/\b([a-z])/g, (m) => m.toUpperCase())
      .replace(/\bAnd\b/g, 'and').replace(/\bOf\b/g, 'of').replace(/\bFor\b/g, 'for')
      .replace(/\bIn\b/g, 'in').replace(/\bEsd\b/g, 'ESD');
  }
  return t;
}

/* ═══ POST-WRITE GATES ═══════════════════════════════════════════════════ */
console.log('\nGATES');
let bad = 0;
const fail = (m) => { console.error(`  ✗ ${m}`); bad += 1; };
const pass = (m) => console.log(`  ✓ ${m}`);
const strip0 = (h) => h.replace(/<style[\s\S]*?<\/style>/g, ' ')
  .replace(/<script[\s\S]*?<\/script>/g, ' ');

const IXPAGE = written.find((w) => w.kind === 'index').OUT;

/* 1. THE INDEX LISTS EVERY SESSION. This is what makes the directory DERIVED
      in fact rather than in intention — the list cannot drift from the pages
      because a missing row fails the build. */
{
  const missing = ALL.filter((s) => !IXPAGE.includes(`href="${sessHref(s.theme.slug, s.slug)}"`));
  if (missing.length) {
    fail(`the index omits ${missing.length} session(s): ${missing.slice(0, 3).map((s) => s.slug).join(', ')}`);
  } else {
    pass(`the index lists all ${ALL.length} sessions`);
  }
  const mt = THEMES.filter((t) => !IXPAGE.includes(`href="${themeHref(t.slug)}"`));
  if (mt.length) {
    fail(`the index omits theme(s): ${mt.map((t) => t.slug).join(', ')}`);
  } else {
    pass(`the index lists all ${THEMES.length} themes`);
  }
}

/* 2. EVERY THEME PAGE LISTS ITS OWN SESSIONS, and no other theme's. */
for (const w of written.filter((x) => x.kind === 'theme')) {
  const own = w.t.sessions.filter((s) => !w.OUT.includes(`href="${sessHref(w.t.slug, s.slug)}"`));
  if (own.length) fail(`${w.route} omits ${own.length} of its own sessions`);
}
if (!bad) pass('every theme page lists its own sessions');

/* 3. NO EMPTY METADATA ROW. A label with no value is the one thing the
      absent-row grammar must never produce. */
{
  let n = 0;
  for (const w of written) {
    if (/<p class="lr-st-v[^"]*">\s*<\/p>/.test(w.OUT)) { fail(`${w.route} renders an empty strip value`); n += 1; }
    if (/<p class="lbl">\s*<\/p>/.test(w.OUT)) { fail(`${w.route} renders an empty label`); n += 1; }
  }
  if (!n) pass('no rendered row has an empty body');
}

/* 4. THE SIX EDITORIAL TITLES SAY SO. A title of ours passed off as the
      manual's is the only place this section could mislead. */
{
  const ed = ALL.filter((s) => s.title_source === 'editorial');
  const silent = ed.filter((s) => {
    const w = written.find((x) => x.route === sessHref(s.theme.slug, s.slug));
    return !w.OUT.includes('The manual leaves this session untitled');
  });
  if (silent.length) {
    fail(`${silent.length} editorial title(s) do not disclose it`);
  } else {
    pass(`all ${ed.length} editorial titles disclose that the name is ours`);
  }
}

/* 5. THE BLANK SCREEN IS ONLY WHERE THERE IS NO PHOTOGRAPH, and a theme with
      a photograph actually renders it. */
{
  let n = 0;
  for (const w of written.filter((x) => x.kind === 'theme')) {
    const blank = w.OUT.includes('pic ht tc-blank');
    if (w.t.photo && blank) { fail(`${w.route} has a photograph but renders the blank screen`); n += 1; }
    if (!w.t.photo && !blank) { fail(`${w.route} has no photograph and renders no blank screen`); n += 1; }
    if (w.t.photo && !w.OUT.includes(`/images/photos/${w.t.photo}`)) { fail(`${w.route} does not render its photograph`); n += 1; }
  }
  if (!n) pass('the blank screen appears on exactly the themes with no photograph');
}

/* 6. EVERY SESSION PAGE PRINTS, and none carries a page script. A teacher with
      JavaScript off, or a photocopy, must get the whole session. */
{
  const noPrint = written.filter((w) => !w.OUT.includes('@media print'));
  if (noPrint.length) {
    fail(`${noPrint.length} page(s) carry no print rules`);
  } else {
    pass(`all ${written.length} pages carry print rules`);
  }
  const tabbed = written.filter((w) => /class="tabs?-/.test(strip0(w.OUT)));
  if (tabbed.length) {
    fail(`${tabbed.length} page(s) use tabs(), which needs JavaScript`);
  } else {
    pass('no page depends on JavaScript');
  }
}

/* 7. EVERY PHOTOGRAPH THIS GENERATOR EMITS HAS A REAL ALT SENTENCE.
      Scoped to /images/photos/ deliberately: the shell's own brand mark is
      alt="Swechha", which is correct for a logo and would fail a sentence
      test. A gate that flags the shell is a gate nobody will keep. */
{
  let n = 0;
  for (const w of written) {
    for (const m of w.OUT.matchAll(/<img\b[^>]*>/g)) {
      if (!m[0].includes('/images/photos/')) continue;
      if (!/\salt="[^"]{30,}"/.test(m[0])) {
        fail(`${w.route} renders a photograph with no descriptive alt sentence`); n += 1;
      }
    }
  }
  if (!n) pass('every photograph carries a descriptive alt sentence');
}

/* 8. NO SESSION ASSERTS A LICENCE OVER THIRD-PARTY MATERIAL.
      The assertion is `rel="license"`, which assemble() attaches only to the
      six situation pages — NOT the footer's site-wide CC line, which every one
      of the 94 served pages already carries and which is Swechha's statement
      about its own site rather than a claim over this compilation. Gating on
      the URL flagged all 43 sessions for markup they share with /learn/pm25,
      so the gate is on the assertion itself (D-51.5). */
{
  const claiming = written.filter((w) => w.kind === 'session'
    && /rel="license"/.test(w.OUT));
  if (claiming.length) {
    fail(`${claiming.length} session(s) carry rel="license" over third-party material`);
  } else {
    pass('no session asserts a licence over the compilation');
  }
  const credited = ALL.filter((s) => (s.fields.source || []).length).length;
  pass(`${credited} of ${ALL.length} sessions carry a source the manual named; the rest say so plainly`);
}

/* 9. THE REPLACED FOREIGN CONTENT DOES NOT COME BACK.
      The air theme as printed taught the 1952 London smog and British vehicle
      counts, and carried a paragraph pasted in from a hackathon proposal
      letter. Re-running the extractor over the original text would restore all
      of it silently, so the claims themselves are gated. The disclosure on the
      theme page NAMES the London smog in order to say what was removed, which
      is why the gate is on the claims and not on the words. */
{
  const STALE = ['vehicles on the road in Britain', 'This Proposal Letter', 'this Hackathon'];
  let n = 0;
  for (const w of written) {
    for (const claim of STALE) {
      if (w.OUT.includes(claim)) { fail(`${w.route} republishes "${claim}"`); n += 1; }
    }
  }
  if (!n) pass('the replaced foreign content has not returned');
  const rewritten = THEMES.filter((t) => t.reading_note);
  for (const t of rewritten) {
    const w = written.find((x) => x.route === themeHref(t.slug));
    if (!w.OUT.includes(t.reading_note.slice(0, 60))) {
      fail(`${w.route} has rewritten reading but does not disclose it`);
    }
  }
  if (rewritten.length) pass(`${rewritten.length} theme(s) with rewritten reading disclose it`);
  /* The same rule for a SESSION Swechha has annotated — a foreign figure
     re-attributed, or a table that did not survive extraction. An edit the
     page does not admit to is the failure mode. */
  const annotated = ALL.filter((s) => s.content_note);
  for (const s of annotated) {
    const w = written.find((x) => x.route === sessHref(s.theme.slug, s.slug));
    if (!w.OUT.includes(s.content_note.slice(0, 60))) {
      fail(`${w.route} carries a content note but does not render it`);
    }
  }
  if (annotated.length) pass(`${annotated.length} annotated session(s) disclose the annotation`);
}

/* 15. EVERY CLASS THE MARKUP USES IS DEFINED IN THE PAGE'S OWN CSS.
      ★ THIS IS THE GATE THAT SHOULD HAVE EXISTED FROM THE START.
      This section shipped using `.w7-do-t`, `.lr-doors` and `.lr-door` — class
      names that exist elsewhere on the site but whose RULES live in
      work-shell.mjs, design/home.html and build-learn.mjs's own PAGE_CSS, none
      of which this generator imports. Every page carries its own <style>, so
      reusing a class name is not reusing a class. The result was live for a
      day: the "Eight themes" headings struck through by the browser's native
      underline, and every "Next" band on all 54 pages in unstyled block flow.
      The other fourteen gates all passed, because they check structure,
      content and disclosure — not whether a thing a reader looks at has any
      styling at all.

      A class is EXEMPT only if it is a behaviour hook or a semantic marker
      that is deliberately unstyled. Anything else that is used and never
      defined fails the build. */
{
  const EXEMPT = new Set([
    'duo', 'duo-dim',            /* the photo treatment, defined in the shell's defs */
    'skip', 'visually-hidden',   /* accessibility hooks */
    'tc-blank',                  /* defined; matched by the .tc-blank rule below */
  ]);
  let n = 0;
  for (const w of written) {
    const css = [...w.OUT.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join('\n');
    const defined = new Set([...css.matchAll(/\.([a-zA-Z][\w-]*)/g)].map((m) => m[1]));
    const used = new Set();
    for (const m of w.OUT.matchAll(/class="([^"]+)"/g)) {
      for (const c of m[1].trim().split(/\s+/)) used.add(c);
    }
    const orphan = [...used].filter((c) => !defined.has(c) && !EXEMPT.has(c)).sort();
    if (orphan.length) {
      fail(`${w.route} uses ${orphan.length} class(es) its own CSS never defines: ${orphan.slice(0, 6).join(', ')}`);
      n += 1;
    }
  }
  if (!n) pass('every class the markup uses is defined in the page\'s own CSS');
}

console.log(`\nteach — ${written.length} pages written `
  + `(1 index + ${THEMES.length} themes + ${ALL.length} sessions + guide + A to Z).`);
if (bad) { console.error(`\n${bad} gate(s) failed.`); process.exit(1); }
