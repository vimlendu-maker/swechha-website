// /healthy-cities — the hub for Bridge the Gap's 2025-26 Healthy Cities
// chapter, funded by the Bupa Foundation and Niva Bupa Health Insurance, AND
// the ten fellow pages under /healthy-cities/fellows/<slug> that its register
// band links to. ELEVEN PAGES, ONE GENERATOR, deliberately: the hub's rows and
// a fellow's own masthead read the same two loaders, so a fellow's name, place,
// project or figure cannot differ between the register and the page it opens.
//
// ★ IT IS AN INTERIOR PAGE WHOSE MASTHEAD DOES THE LANDING-PAGE WORK.
// The obvious brief for a page a partner is handed by link is "make it look
// like the homepage". That was ruled out on evidence rather than taste: the
// homepage's hero CSS is deliberately outside every range the shell lifts, so
// no page inherits it; `build-hero.mjs` is an in-place patcher of readings and
// not a component anybody can call; and the first `/work` index was DELETED for
// being homepage bands with the photographs taken out — "the shape was copied;
// the reason for the shape was not". So the pattern followed here is
// `about.html`, which is the site's one deliberate cold-arrival page: a frame,
// the h1 on it, and everything else on solid ground beneath.
//
// ★ EVERY FIGURE IS READ OUT OF data/healthy-cities/**, NOT TYPED HERE, for the
// same reason /impact reads data/work/**: a number typed into a generator can
// disagree with the JSON a verifier checks it against, and then there are two
// answers to one question. The rail, the range endpoints, the eight states, the
// fellow count and the forbidden sum below are all derived.
//
// ★ WHAT IS DELIBERATELY NOT HERE.
//   · NO STATE CHIP. LIVE / PERIODIC / OUT OF SEASON / NO SEASON describe how a
//     SOURCE delivers readings, and the mark belongs to the reading rather than
//     to the page. This page has no feed; a corner badge reading PERIODIC over
//     an editor-entered figure would be the worst thing on the site. Nothing is
//     passed to masthead()'s chip slot, and a gate below proves it.
//   · NO `.readout`. That is masthead scale, licensed by a live reading against
//     a PUBLISHED LEGAL LIMIT. It appears five times on the homepage, once per
//     situation page and zero times on about/impact/act/farm and all twenty WORK
//     pages. There is no published limit on a school garden.
//   · NO SECOND `@keyframes`. The homepage's live pulse is the only one on the
//     whole site.
//   · NO FUNDER LOGOS. This design has refused every foreign trademark on every
//     page; the credit is type, in the highest place a non-display element may
//     sit, and again in its own band in the same grammar bridge-the-gap uses.
//   · NO CUMULATIVE FIGURE. Gate 1 computes the sum the rail is tempted by and
//     asserts its absence from the rendered page in every format it could take.
import { readFileSync, readdirSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import * as S from './lib/situation-shell.mjs';
import * as W from './lib/work-shell.mjs';
import { seo } from './lib/seo-register.mjs';

const { esc, hole, ARROW } = S;

/* workShell(), not shell(): every WORK component used below — the register
   rows, the split, the figure rail, the named list, the panels, the doors —
   lives in the COMPONENT_CSS ranges lifted out of the frozen homepage, and
   shell() alone carries none of them. A page that used them off the plain shell
   would render structurally correct markup with no rules attached to it. */
const sh = W.workShell();

/* ═══ DATA ═══════════════════════════════════════════════════════════════
   Exported: the fellow pages read the same two loaders, so a fellow's name,
   place or figure cannot differ between its row here and its own page. */
const DIR = join(S.ROOT, 'data/healthy-cities');
export const PROG = JSON.parse(readFileSync(join(DIR, 'programme.json'), 'utf8'));
export const FELLOWS = readdirSync(join(DIR, 'fellows'))
  .filter(f => f.endsWith('.json')).sort()
  .map(f => JSON.parse(readFileSync(join(DIR, 'fellows', f), 'utf8')));

const BD = PROG.bands;

/* THE DATA IN THIS DIRECTORY IS WRITTEN WITH HTML ENTITIES — "2025&ndash;26",
   "fellows&rsquo; testimonials" — because most of it is set straight into markup
   by the components below, which is the same convention the page copy uses.
   Three shared components esc() their arguments (figureRail, hole, rangeRow),
   and esc() turns "&" into "&amp;", so passing an entity-bearing string into one
   of them ships the literal text "&ndash;" to a reader. `plain()` turns the
   entities back into their characters first; gate 3 asserts no double-escaped
   entity reached the output, which catches the whole class rather than the four
   instances known today. */
const ENT = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: '\'',
  rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”',
  mdash: '—', ndash: '–', nbsp: ' ', middot: '·',
  hellip: '…', deg: '°',
};
const plain = (s) => String(s ?? '').replace(/&(\w+);/g, (m, k) => (k in ENT ? ENT[k] : m));

/* ═══ DATA GATES — before a line of HTML is built ════════════════════════ */
let bad = 0;
const dataFail = (m) => { console.error(`DATA IS WRONG: ${m}`); bad++; };

/* Every band this page renders reads its prose out of `bands`, which is a
   `z.record` in the schema and therefore satisfied by `{}`. A dropped key would
   render a heading with nothing under it, so the keys are required here as well
   as in the test suite — the test catches a commit nobody rebuilt, this catches
   the build that is running. */
const BAND_PROSE = ['top', 'what', 'fellows', 'statement', 'schools', 'green',
  'voices', 'watch', 'gaps', 'with', 'onward'];
for (const k of BAND_PROSE) {
  if (!BD[k] || !Object.keys(BD[k]).length) {
    dataFail(`bands.${k} is missing from programme.json. Every band reads its prose from there.`);
  }
}

for (const f of PROG.figures) {
  if (!f.period) dataFail(`rail figure "${f.label}" has no period. A figure without a span is not a reading.`);
  if (!['counted', 'modelled'].includes(f.basis)) dataFail(`rail figure "${f.label}" has basis "${f.basis}".`);
  if (!f.source) dataFail(`rail figure "${f.label}" has no source.`);
}
if (PROG.figures.length !== W.FIGURE_RAIL_MAX) {
  dataFail(`the rail takes exactly ${W.FIGURE_RAIL_MAX} tiles and programme.figures has ${PROG.figures.length}. `
    + 'figureRail() silently slices the rest, so a fifth figure would be authored and never shown.');
}

const slugs = new Set();
for (const f of FELLOWS) {
  if (slugs.has(f.slug)) dataFail(`two fellow files claim the slug "${f.slug}".`);
  slugs.add(f.slug);
  if (!f.aims || !f.aims.length) dataFail(`${f.slug} has no aims.`);
}

/* ★ THE VOICES BAND RESOLVES POINTERS. It does NOT read programme.quotes, which
   is permanently empty: the hub points at a quote by (fellow, text) and the
   fellow's own file holds it, so the hub and the fellow page structurally cannot
   show different words for the same speaker — the pattern /impact uses for
   figures. A reference that does not resolve is a BUILD FAILURE, not a blank,
   because reading programme.quotes instead renders a silent empty band and that
   is the exact failure this arrangement exists to prevent.
   The key is the full text and not the speaker, because a speaker is not unique
   within a file: taniya-gill has two "A workshop participant" and
   s-vineeth-kumar two "A farmer on the pilot plots". */
if (PROG.quotes && PROG.quotes.length) {
  dataFail(`programme.quotes holds ${PROG.quotes.length} quote(s). The hub points at quotes, it does not copy them — `
    + 'move them into the fellow\'s own file and name them in `voices`.');
}
const VOICES = PROG.voices.map((v, i) => {
  const f = FELLOWS.find(x => x.slug === v.fellow);
  if (!f) { dataFail(`voices[${i}] points at "${v.fellow}", which is not a fellow.`); return null; }
  const q = (f.quotes || []).find(x => x.text === v.quote);
  if (!q) {
    dataFail(`voices[${i}] points at a quote ${f.slug} does not have. That file's quotes are by: `
      + `${(f.quotes || []).map(x => JSON.stringify(x.speaker)).join(', ') || '(none)'}`);
    return null;
  }
  return { ...q, fellow: f };
}).filter(Boolean);

if (bad) { console.error(`\nREFUSING TO WRITE: ${bad} data check(s) failed.`); process.exit(1); }

/* ═══ DERIVED NUMBERS ════════════════════════════════════════════════════ */
/* A published value parsed to a magnitude, for two jobs only: the sum this page
   refuses to print, and picking the two ends of the engagement range out of the
   fellows' own figures. A range contributes its upper bound. NOTHING derived
   here is ever printed as a number — only compared, or used to place a bar. */
const magnitude = (v) => {
  const s = String(v).replace(/,/g, '');
  if (/%/.test(s)) return null;
  const mult = /million/i.test(s) ? 1e6 : /lakh/i.test(s) ? 1e5 : 1;
  const nums = [...s.matchAll(/\d+(?:\.\d+)?/g)].map(m => parseFloat(m[0]));
  if (!nums.length) return null;
  return Math.max(...nums) * mult;
};

/* ★ THE SUM THIS PAGE REFUSES TO PRINT.
   /impact's refusal is about SUMMING figures that count overlapping populations
   over unaligned periods. These four are disjoint units over one shared period,
   so the rail itself is honest. What is forbidden is a FIFTH number that is
   their sum: it would add students to schools to saplings to fellows and call
   the result people. The synopsis's own "5,000+ community members" is withheld
   for the neighbouring reason — ten reports counting different things do not
   reconcile to it, and one fellow's own ~6,000 exceeds it on its own. */
const RAIL_SUM = PROG.figures.reduce((a, f) => a + (magnitude(f.value) || 0), 0);

/* THE COHORT'S ENGAGEMENT AS A PUBLISHED RANGE, not a fake single number. The
   definitions of "engaged" and "reached" differ from report to report and the
   spread is two orders of magnitude, so the honest object is the span.
   THE ENDPOINTS CANNOT BE INVENTED: both are a fellow figure's own `value`
   string, printed verbatim, and the filter is the figures that say in their own
   label that they count PEOPLE. Households, workshops, villages, acres, kilos
   and self-help groups are excluded because they are not the same unit. */
const PEOPLE = FELLOWS.flatMap(f => (f.figures || [])
  .filter(x => /^People\b/.test(x.label) && magnitude(x.value) != null)
  .map(x => ({ ...x, fellow: f })));
const byMag = [...PEOPLE].sort((a, b) => magnitude(a.value) - magnitude(b.value));
const LOW = byMag[0];
const HIGH = byMag[byMag.length - 1];
if (PEOPLE.length < 2) {
  console.error('REFUSING TO WRITE: fewer than two fellow figures count people, so there is no range to draw.');
  process.exit(1);
}

/* The eight states, in the order the register puts them, deduplicated. Read out
   of the fellow files so the statement band cannot name a state the cohort
   stopped working in. */
const STATES = [...new Set(FELLOWS.map(f => f.state))];

/* ═══ BANDS ══════════════════════════════════════════════════════════════
   The ids are declared in work-shell's TIER and the grounds are ASSIGNED by
   bandChain rather than typed, then checked mechanically: papers never meet,
   the close is paper-2 and the footer's #151512 does not repeat the last band.
   The tier is joined into the class here because situation-shell's assemble()
   reads only [id, class] — work-shell's own buildPage composes the same two
   values, and a band with no tier class would take `section`'s zero padding. */
const IDS = ['top', 'what', 'fellows',
  /* `statement` renders only with a photograph: the band IS a display line
     against a frame that runs to the seam, and statementBand has no frameless
     variant because a statement with nothing behind it is a heading. The prose
     is authored and waiting in programme.json; the frame arrives with the
     photography pass, and the band appears with it. Band omission is the
     section's own mechanism — bandChain re-derives the whole ground chain from
     whatever is on, which is why no chain is written down anywhere. */
  ...(PROG.frames && PROG.frames.find(f => f.slot === 'statement') ? ['statement'] : []),
  'schools', 'green', 'voices', 'watch', 'gaps', 'with', 'onward'];
/* Derived rather than hardcoded: any required band this build did not render —
   not just `statement` by name — is a gap the omission note must keep naming.
   If a second band ever becomes frame-conditional, this line does not need
   editing to keep reporting it. */
const OMITTED = Object.keys(BD).filter(id => !IDS.includes(id));

const BANDS = W.bandChain(IDS).map(([id, cls, hex, tier]) => [id, [cls, tier].filter(Boolean).join(' '), hex, tier]);
const clashes = S.groundChain(BANDS);
for (const [id, cls, hex] of BANDS) {
  const real = W.compositedHex(cls);
  if (real === null) dataFail(`band ${id} declares two ground classes ("${cls}") — which one paints is undefined`);
  else if (real !== hex) dataFail(`band ${id} declares ${hex} but class "${cls}" composites to ${real}`);
}
if (bad) { console.error(`\nREFUSING TO WRITE: ${bad} check(s) failed.`); process.exit(1); }

const frameFor = (slot) => (PROG.frames || []).find(f => f.slot === slot) || null;

const INDEX = [
  ['The programme', '#top'],
  ['In the schools', '#schools'],
  ['The fellows', '#fellows'],
  ['Voices', '#voices'],
  ['What we cannot say yet', '#gaps'],
];

/* ── THE CANVAS IS CHOSEN FROM THE BAND'S DECLARED GROUND, never by hand.
      The register rows, the named list, the figure rail and the panel heading
      are all frozen on PAPER tokens, so on a dark band they need the .wk-dark
      statement or they render near-invisible ink on near-black — 1.02:1 when
      that shipped once on /work/campaigns. Deriving the wrapper from the hex the
      band already declares means it cannot be got wrong once per band per page.
      A band body may be an ARRAY whose first element is its opener: opener()
      carries its own .wrap (that is the fix for every heading sitting at x=0),
      and wrapping it again would put the heading 20px right of the content
      under it. So the opener passes through and only what follows takes the
      canvas. Copied from build-work-pages.mjs, which is where both defects were
      found. */
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

const body = {};

/* ── BAND 1. THE MASTHEAD, AND THE RAIL INSIDE IT. ───────────────────────
   Four things sit under the headline, in this order, and each is there for a
   reason a funder's programme officer would recognise:
     the ANCESTOR line, because it says in one line that this is the 2025-26
       chapter of a programme that has been running since 2000 rather than a
       microsite that appeared from nowhere — and it discharges the requirement
       that the page not be reachable from nowhere;
     the PARTNERSHIP, first thing under the h1, which is the strongest credit
       this design language can give anyone without importing a logo;
     the IDENTITY sentence, because it exists on exactly one other page in the
       site and this is the page a cold visitor arrives at from an email;
     the DECK.
   ★ AND THE RAIL SITS IN A SECOND .pic-body RATHER THAN IN A BAND OF ITS OWN,
   mirroring /impact — "immediately after the hero, mirroring the homepage's
   hero -> ticker; a returning reader should recognise the gesture". It costs no
   band id, no ground re-derivation, and it lands all four figures on the first
   screen.
   ★ .wk-dark IS MANDATORY HERE AND IT IS THE CALLER'S JOB. .ip-ovl-s is the
   PAPER caption ink (#615B50) because /impact's rail sits on a light masthead;
   the dark correction is a separate caller-supplied selector. The natural
   `<div class="wrap">` around the rail would ship #615B50 on #0D0D0B — about
   2.7:1 on the four period captions, directly under the four headline numbers,
   on the first screen of a page distributed by link. Nothing catches it:
   figureRail returns valid markup, the schema passes and the source reads
   correctly. Gate 2 is the only thing that sees it. */
body.top = () => `${W.masthead({
  h1: BD.top.h1,
  deck: PROG.deck,
  frame: frameFor('top'),
  ancestor: W.anc(PROG.ancestor.label, PROG.ancestor.href),
  lines: [
    `<p class="lbl hc-credit">${PROG.partnership}</p>`,
    `<p class="lbl hc-eye">${PROG.identity}</p>`,
  ],
})}
    <div class="pic-body hc-rail">${dark(W.figureRail(PROG.figures.map(f => ({
  ...f, label: plain(f.label), period: plain(f.period),
}))))}</div>`;

/* ── BAND 2. WHAT THE YEAR WAS. ──────────────────────────────────────────
   Two halves and what came back, as ruled prose rows. openBand rather than
   opener because it omits its lead paragraph instead of emptying it. */
body.what = [
  W.openBand('what', BD.what.head, BD.what.lead),
  W.doRows(BD.what.rows),
];

/* ── BAND 3. THE REGISTER, AND THE BAND THIS PAGE EXISTS FOR. ────────────
   Ten rows, one per fellow, each carrying `id="<slug>"` so an inbound link
   lands on itself, and each linking to that fellow's own page. The one licensed
   `.lbl` pre-line names where they worked, which is the fact that tells ten
   rows of a person's name apart.
   Then the engagement RANGE, drawn from the two ends of the fellows' own
   people-figures. No derived number is printed: the bar is a length, and both
   end labels are a published `value` string quoted verbatim. */
body.fellows = [
  W.openBand('fellows', BD.fellows.head, BD.fellows.lead),
  W.regRows(FELLOWS.map(f => ({
    anchor: f.slug,
    href: `/healthy-cities/fellows/${f.slug}`,
    /* Delhi is its own state, so the naive place-then-state pre-line reads
       "Delhi &middot; Delhi" on one of the ten. A place that IS its state is
       named once. */
    pre: f.place === f.state ? f.state : `${f.place} &middot; ${f.state}`,
    name: f.name,
    line: f.project,
  }))),
  W.rangeRow({
    rows: [{
      name: BD.fellows.range.name,
      loPct: (magnitude(LOW.value) / magnitude(HIGH.value)) * 100,
      hiPct: 100,
      aria: plain(`${BD.fellows.range.name}: ${LOW.value} to ${HIGH.value}`),
      value: plain(`${LOW.value} &ndash; ${HIGH.value}`),
    }],
    axis: [BD.fellows.range.axis_low, plain(HIGH.value)],
  }),
];

/* ── THE STATEMENT. One display line over a frame, and no figure: a figure
      without its period, its basis and its source is not a reading, and this
      band has room for none of them. The line under it is the eight states,
      read off the register rather than typed. */
body.statement = () => W.statementBand({
  line: BD.statement.line,
  under: STATES.join(' &nbsp;/&nbsp; '),
  frame: frameFor('statement'),
});

/* ── BANDS: THE SCHOOLS HALF, IN TWO. ────────────────────────────────────
   The split puts a short ruled register beside running prose, and `flip`
   alternates between the two so five stacked bands do not read as five stacked
   rectangles. `green` takes the frame where there is one; both bands compose
   without one, which is splitBand's own second branch rather than a special
   case here. */
const split = (b, slot, flip) => W.splitBand({
  left: W.doRows(b.rows),
  frame: frameFor(slot),
  right: b.prose.map(p => `<p class="body hc-prose">${p}</p>`).join('\n        '),
  flip,
});
body.schools = [W.openBand('schools', BD.schools.head, BD.schools.lead), split(BD.schools, 'schools', false)];
body.green = [W.openBand('green', BD.green.head, BD.green.lead), split(BD.green, 'green', true)];

/* ── THE VOICES. Every quote is RESOLVED out of the fellow's own file, so this
      band cannot quote somebody the fellow page does not. The panel is the
      component the frame will land in: above 900 it sets a photograph beside
      the words, which is what the photography pass fills. */
body.voices = [
  W.openBand('voices', BD.voices.head, BD.voices.lead),
  `      <div class="hc-voices">\n${VOICES.map(q => `        ${W.panel({
    name: q.speaker,
    p: `&ldquo;${q.text}&rdquo;`,
    cap: [q.role, q.place, q.fellow.name].filter(Boolean).join(' &middot; '),
    frame: q.frame || null,
  })}`).join('\n')}\n      </div>`,
];

/* ── WHAT WAS FILMED. A LINK OUT, NOT A YOUTUBE IFRAME — and the premise this
      was decided on turned out to be false, so the reasoning is restated rather
      than inherited. `grep -rl '<iframe' public/_pages/v3/` returns ONE file:
      stories.html carries eight youtube-nocookie players built by
      build-stories-page.mjs's own `player()`. So an embed would not be a new
      pattern on this site.
      It would still be a new pattern HERE, for a reason specific to this data:
      three of these four series are PLAYLISTS and one is a single video, while
      `player()` takes a bare video id and the stories build's own gate extracts
      `/embed/([\\w-]+)` to check it. Following the pattern therefore means
      authoring a playlist variant of it plus a second copy of the .st-p CSS —
      a new component either way — and four players on a page a partner opens
      buys third-party requests on a page that otherwise makes none.
      The still frame lands with the photography pass; today each series is its
      name, what is in it, and the link. If the controller prefers the embed,
      the honest move is to EXPORT `player()` out of build-stories-page.mjs and
      widen it to playlists, so the site has one video component and not two. */
body.watch = [
  W.openBand('watch', BD.watch.head, BD.watch.lead),
  W.doRows(PROG.videos.map(v => ({
    h: v.name,
    p: v.blurb,
    cap: `<a class="act" href="${v.href}" rel="noopener" target="_blank">Watch on YouTube ${ARROW}</a>`,
  }))),
];

/* ── WHAT WE CANNOT SAY YET. Four named holes, each a real sentence.
      These are holes in the SOURCE RECORD — thirty-one videos with no speaker
      named, a 20-against-26 count that was never re-counted, three testimonials
      surviving only as broken encoding, a plantation report with no year — and
      that is the story rather than an apology about this page. A hole about our
      own filing or about why a metric is unavailable does NOT belong here and
      goes to the owner instead. */
body.gaps = [
  W.openBand('gaps', BD.gaps.head, BD.gaps.lead),
  PROG.holes.map(h => hole(plain(h))).join('\n'),
];

/* ── WHO IT IS WITH. The same grammar as bridge-the-gap's own `#with` band, to
      the class: an opener, then `.wk-names wk-names-1` with a `.lbl` over a
      plain `<ul>`, and ONE WEIGHT STEP on the leading entries. No size change,
      no colour change, no rule change, and no logo — the two pages must not
      look like they credit differently.
      `funders_lead` is a rank on a published list, which is a claim, so the
      data carries a source for it and the check that it does is below. */
const w = PROG.with;
if (w.funders_lead > w.funders.length) {
  dataFail(`with.funders_lead is ${w.funders_lead} but there are ${w.funders.length} funders.`);
}
if (w.funders_lead > 0 && !w.funders_source) {
  dataFail('with.funders_lead is set with no with.funders_source. A rank on a published list carries a source.');
}
body.with = [
  W.openBand('with', BD.with.head, BD.with.lead),
  `      <div class="wk-names wk-names-1" style="--n:1">
        <div><span class="lbl">Funders</span><ul>${w.funders
  .map((n, i) => `<li${i < w.funders_lead ? ' class="wk-lead"' : ''}>${esc(n)}</li>`).join('')}</ul></div>
      </div>`,
];

/* ── THE CLOSE. Three doors and one ask. The doors are the three pages this
      microsite must not re-tell: the programme it is a chapter of, the
      fellowship it is a cohort of, and the trip format it used. Each is a real
      route, and the act is the only slot on the page that asks for anything. */
body.onward = () => W.onwardBand({
  doors: BD.onward.doors,
  act: BD.onward.act,
  actNote: BD.onward.act_note,
});

if (bad) { console.error(`\nREFUSING TO WRITE: ${bad} check(s) failed.`); process.exit(1); }

const B = applyCanvas(BANDS, body);

/* ═══ PAGE CSS ═══════════════════════════════════════════════════════════
   Six rules, and every one of them is spacing or a colour statement for the
   ground the element actually lands on. Nothing here invents a component.
   NO BACKTICK MAY APPEAR IN THIS BLOCK: it is one template literal, and a
   stray pair inside a comment closes and reopens it, deleting everything
   between the two from the emitted stylesheet with no error anywhere. That has
   broken three builds on this project and once emptied the whole WORK layer
   while the build printed every gate green.
   Every grid track is minmax(0,1fr), never a bare 1fr: 1fr is minmax(auto,1fr)
   and auto is min-content, so a long child blows the track out from inside —
   and `section` carries overflow-x:clip, which crops the damage instead of
   showing it. Gate 7 checks it mechanically. */
const PAGE_CSS = `
/* ── the two micro-caps lines under the headline. --fg-3 is the masthead's own
      caption ink and the band is #0D0D0B; stated for paper as well because the
      masthead is the one band whose ground is pinned and a page that ever moves
      it must not silently lose the colour. Every paper rule in this project is
      written .paper X,.paper-2 X: a rule authored for .paper alone leaves
      .paper-2 uncovered and the element keeps its dark-ground ink on a light
      band, which has shipped as a real defect more than once. ── */
.hc-credit{color:var(--fg-2);margin:0 0 8px;max-width:52ch}
.hc-eye{color:var(--fg-3);margin:0 0 clamp(14px,1.8vw,22px);max-width:60ch}
.paper .hc-credit,.paper-2 .hc-credit{color:var(--ink-2)}
.paper .hc-eye,.paper-2 .hc-eye{color:var(--ink-3)}

/* ── the rail's own .pic-body. It follows the masthead's, so it carries the top
      padding of a body block and none of the bottom: the band's tier supplies
      that, and doubling them put 84px of nothing between the numbers and the
      seam. ── */
.hc-rail{padding-bottom:0}

/* ── the register's pre-line. .w7-pj-rows is frozen on paper tokens and the
      .wk-dark statement is what carries it onto a dark band, exactly as the
      row's own title and footnote do. And the ordinal spans THREE rows here,
      not two: a row with a pre-line has three items in its content column, and
      the frozen rule spans two. ── */
.w7-pj-pre{margin:0;color:var(--ink-3)}
.wk-dark .w7-pj-pre{color:var(--fg-3)}
#fellows .w7-pj-rows .w7-pj-n{grid-row:1/span 3}

/* ── the prose column of a split, and the quote panels. A panel is a block
      here rather than a tab, so the stack needs the block rhythm the tab group
      would otherwise have given it. ── */
.hc-prose{max-width:56ch}
.hc-prose+.hc-prose{margin-top:var(--gap-row)}
.hc-voices{display:grid;grid-template-columns:minmax(0,1fr);gap:var(--gap-block);
  margin-top:var(--gap-row)}
`;

/* ═══ WRITE ══════════════════════════════════════════════════════════════ */
const REG = seo('/healthy-cities');

const OUT = await S.assemble({
  file: 'healthy-cities.html',
  route: '/healthy-cities',
  title: REG.title,
  bands: BANDS, index: INDEX, sh, clashes,
  /* COMPONENT_CSS and WORK_CSS both, in the order work-shell's own buildPage
     emits them: the extracted homepage components first, then the layer that
     re-scopes them and states them for the other ground. */
  pageCss: [sh.COMPONENT_CSS, W.WORK_CSS, PAGE_CSS].join('\n'),
  sectionFor: (id) => {
    const v = B[id];
    return typeof v === 'function' ? v() : (v ?? '    <div class="wrap"><p class="lead">&mdash;</p></div>');
  },
  note: `${BANDS.length} bands + footer. ${FELLOWS.length} fellows in ${STATES.length} states, `
      + `${PROG.figures.length} rail figures, ${VOICES.length} resolved voices, `
      + `${PROG.videos.length} video series, ${PROG.holes.length} holes.`
      + (OMITTED.length ? ` OMITTED (no frame yet): ${OMITTED.join(', ')}.` : ''),
});

/* ═══ POST-WRITE GATES ═══════════════════════════════════════════════════
   Each one is here because the thing it checks cannot be seen in a diff of this
   file, and several of them cannot be seen in the rendered page either. */
let fail = 0;
const gate = (ok, msg) => { if (!ok) { console.error(`  FAIL ${msg}`); fail++; } else console.log(`  ok   ${msg}`); };
console.log('\nGATES');

/* Rendered text only, for the gates that are about what a reader sees: a word
   inside a CSS comment is not an element, and a gate that cannot tell the
   difference is a gate the next person switches off when it fires. */
const RENDERED = OUT
  .replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<!--[\s\S]*?-->/g, ' ');
const TEXT = RENDERED.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
/* This page's own bands, without the inherited header and footer: two of the
   gates below are about what THIS build wrote and the chrome is not its to fix. */
const OWN = OUT.split('<footer')[0].split('<main')[1] || '';

/* 1. NO CUMULATIVE FIGURE, AND IT IS COMPUTED RATHER THAN BANNED.
      A banned string is not a gate: it protects against the number somebody
      already thought of. This adds the four rail figures — students, schools,
      saplings, fellows — and asserts the result is absent from the page in
      every format it could take, so a future session that puts a hero total on
      the masthead gets a build failure instead of a review comment.
      NO EXCLUSION LIST, deliberately, and this differs from /impact's version:
      that one excludes any string that is itself a published figure, which
      would silently exempt exactly the fifth tile this gate exists to refuse.
      Instead, a legitimate figure that happens to EQUAL the sum stops the build
      with an instruction, because that coincidence needs a person. */
const fmts = (n) => [...new Set([
  n.toLocaleString('en-IN'), n.toLocaleString('en-US'), String(n), S.compact(n),
  `${(n / 1e5).toFixed(1)} lakh`, `${(n / 1e6).toFixed(1)} million`,
])];
const SUM_FORMS = fmts(RAIL_SUM);
const alsoReal = PROG.figures.concat(...FELLOWS.map(f => f.figures || []))
  .filter(f => SUM_FORMS.includes(String(f.value)));
if (alsoReal.length) {
  console.error(`REFUSING TO PASS: "${alsoReal[0].label}" is published as ${alsoReal[0].value}, which is also the `
    + 'sum of the four rail figures. One of the two has to change — this gate cannot tell them apart.');
  fail++;
}
const leaked = SUM_FORMS.filter(t => TEXT.includes(t));
gate(leaked.length === 0,
  `no cumulative total is printed — the ${PROG.figures.length} rail figures sum to `
  + `${RAIL_SUM.toLocaleString('en-IN')} and it appears in no format`
  + `${leaked.length ? `. LEAKED: ${leaked.join(', ')}` : ''}`);

/* 2. THE FIGURE RAIL IS INSIDE A .wk-dark ANCESTOR.
      .ip-ovl-s is #615B50, the paper caption ink, because /impact's rail sits
      on a light masthead. This one sits on #0D0D0B. Written the natural way it
      ships about 2.7:1 on the four period captions and NOTHING else notices:
      the markup is valid, the schema passes, a source read looks right and so
      does the accessibility tree. Only a rendered contrast check sees it, and
      only if somebody runs one. So the structure is asserted instead — every
      .ip-ovl on this page opens inside a .wk-dark. */
const rails = [...OUT.matchAll(/<div class="ip-ovl"/g)];
const railsInDark = rails.filter((m) => {
  const before = OUT.slice(0, m.index);
  const open = before.lastIndexOf('wk-dark');
  /* The wrapper must still be OPEN: no closing tag may sit between it and the
     rail, or the .wk-dark it found is a previous band's. */
  return open !== -1 && !before.slice(open).includes('</div>');
});
gate(rails.length > 0 && railsInDark.length === rails.length,
  `all ${rails.length} figure rail(s) sit inside a .wk-dark wrapper`);
gate(/<div class="wrap wk-dark">/.test(OUT), 'the page states .wk-dark for its paper-authored components on dark ground');

/* 3. NO DOUBLE-ESCAPED ENTITY. This data is authored with HTML entities and
      three shared components esc() their arguments, so one wrong call ships the
      literal text "&ndash;" to a reader. Cheap to check, invisible to read. */
const dbl = [...new Set([...OUT.matchAll(/&amp;(?:mdash|ndash|rsquo|lsquo|ldquo|rdquo|nbsp|middot|hellip);/g)].map(m => m[0]))];
gate(dbl.length === 0, `no double-escaped entity${dbl.length ? `; FOUND: ${dbl.join(', ')}` : ''}`);

/* 4. NO STATE CHIP AND NO SOURCE-CADENCE WORD. The four-word vocabulary
      describes how a FEED delivers readings and the mark belongs to the
      reading, not to the page. Borrowing it over an editor-entered figure would
      be the single worst thing on the site. */
gate(!/\b(LIVE|PERIODIC|OUT OF SEASON|NO SEASON)\b/.test(RENDERED),
  'no source-cadence state word in the rendered page (there is no feed here)');

/* 5. NO .readout, NO SECOND @keyframes, NO RED. Masthead-scale readout type is
      licensed by a live reading against a published legal limit; there is none
      here. The homepage's live pulse is the only @keyframes on the site. Red is
      a published limit broken. */
/* Tested as an ELEMENT and as an override, not as a string: `--t-readout` and
   the `.readout` rules arrive in the inherited stylesheet on every page built
   through this shell — grep counts 8 on about.html, impact.html and farm.html
   as well — so a raw string search cannot tell a declaration from a use, and a
   gate that cannot tell them apart is one somebody switches off. */
const readoutEls = [...OUT.matchAll(/class="[^"]*\breadout\b[^"]*"/g)].map(m => m[0]);
gate(readoutEls.length === 0,
  `no .readout element on this page — the rail uses .num${readoutEls.length ? `; FOUND: ${readoutEls.join(', ')}` : ''}`);
gate(!/--t-readout/.test(PAGE_CSS), 'this page does not restate the readout scale');
gate(!/@keyframes/.test(PAGE_CSS), 'this page adds no second @keyframes');
gate(!/--red\b/.test(PAGE_CSS), 'no red in the page CSS');

/* 6. NO BORROWED LOGO. The site carries zero foreign trademarks on zero pages
      and the only image treated as a logo anywhere is Swechha's own mark in the
      chrome. A funder credited in type cannot regress into a logo wall without
      tripping this. */
const brandRefs = [...new Set([...OWN.matchAll(/\/brand\/[^"']+/g)].map(m => m[0]))];
gate(brandRefs.length === 0, `no logo file in this page's own bands${brandRefs.length ? `; FOUND: ${brandRefs.join(', ')}` : ''}`);

/* 7. NO BARE 1fr TRACK. Invisible to an overflow sweep; see PAGE_CSS. */
const bareFr = [...PAGE_CSS.matchAll(/grid-template-columns:[^;}]*(?<![\w),])1fr\b[^;}]*/g)]
  .map(m => m[0]).filter(t => !t.includes('minmax(0,1fr)'));
gate(bareFr.length === 0, `every grid track is minmax(0,1fr)${bareFr.length ? `; BARE: ${bareFr.join(' | ')}` : ''}`);

/* 8. EVERY FELLOW IS A ROW, WITH ITS OWN ANCHOR AND ITS OWN PAGE'S HREF.
      This is the band the page exists for, and a fellow silently missing from
      it is the failure that matters most. */
const missingRow = FELLOWS.filter(f => !OUT.includes(`<li id="${f.slug}"><a href="/healthy-cities/fellows/${f.slug}">`));
gate(missingRow.length === 0,
  `all ${FELLOWS.length} fellows are rows linking to their own page${missingRow.length ? `; MISSING: ${missingRow.map(f => f.slug).join(', ')}` : ''}`);
const noState = FELLOWS.filter(f => !OUT.includes(f.place === f.state ? `w7-pj-pre">${f.state}<` : `${f.place} &middot; ${f.state}`));
gate(noState.length === 0, `every row names its place and state${noState.length ? `; MISSING: ${noState.map(f => f.slug).join(', ')}` : ''}`);

/* 9. EVERY RAIL FIGURE RENDERS, AND SO DOES EVERY RESOLVED QUOTE. The page is
      generated from that data, so neither can fail by editing the data — they
      fail if somebody types a figure or copies a quote in here, which is the
      thing to catch. */
const unrendered = PROG.figures.filter(f => !OUT.includes(plain(f.value).replace(/\+$/, '<sup>+</sup>')));
gate(unrendered.length === 0,
  `all ${PROG.figures.length} rail figures render${unrendered.length ? `; MISSING: ${unrendered.map(f => f.value).join(', ')}` : ''}`);
const unquoted = VOICES.filter(q => !OUT.includes(q.text));
gate(unquoted.length === 0,
  `all ${VOICES.length} resolved quotes render${unquoted.length ? `; MISSING: ${unquoted.map(q => q.speaker).join(', ')}` : ''}`);
gate(OUT.includes(plain(LOW.value)) && OUT.includes(plain(HIGH.value)),
  `the engagement range prints its two published endpoints (${LOW.value} from ${LOW.fellow.slug}, ${HIGH.value} from ${HIGH.fellow.slug})`);

/* 10. THE COUNTED/MODELLED LEGEND IS PRESENT IF AND ONLY IF SOMETHING IS
       MODELLED. An unexplained dotted rule is worse than no rule; a legend for
       a distinction the page never draws spends a band's height on nothing. */
const nMod = PROG.figures.filter(f => f.basis === 'modelled').length;
gate(nMod === 0 ? !OUT.includes('Counted or measured') : OUT.includes('Counted or measured'),
  `the counted/modelled legend matches the data (${nMod} modelled figure(s))`);

/* 11. THE MASTHEAD OWNS THE SHARE CARD. The card is derived from the first
       candidate carrying fetchpriority="high", and masthead() writes that onto
       its own frame; where no candidate carries it the derivation falls back to
       the first photograph in document order, which on this page would be a
       fellow's portrait — and no gate objects, because it found A candidate. On
       a page distributed by link that preview IS the first contact, so the rule
       is asserted rather than assumed. With no frames yet the page correctly
       takes the neutral publisher card. */
const firstPhoto = /<img[^>]*src="\/images\/[^"]*"[^>]*>/.exec(OWN);
gate(!firstPhoto || /fetchpriority="high"/.test(firstPhoto[0]),
  firstPhoto ? 'the first photograph in document order is the masthead frame (fetchpriority="high")'
    : 'no photograph on the page yet, so the share card is the publisher card');

/* 12. NO BAND ID COLLIDES WITH A NAV WORD. The frozen active-section observer
       matches band ids against nav hrefs, so a band named after a nav word
       lights the wrong one. The reserved set is derived from the nav. */
const NAV_IDS = new Set(S.NAV.map(([, h]) => (h.match(/#([\w-]+)$/) || [])[1]).filter(Boolean));
const NAV_WORDS = new Set(S.NAV.map(([t]) => t.toLowerCase()));
const collide = IDS.filter(id => NAV_IDS.has(id) || NAV_WORDS.has(id));
gate(collide.length === 0, `no band id collides with a nav word${collide.length ? `; COLLIDING: ${collide.join(', ')}` : ''}`);

/* 13. EVERY BAND HAS A HEADING, AND EVERY INDEX CHIP RESOLVES TO A BAND ON THIS
       PAGE. A band that prints its own internal id to a reader is worse than a
       build that stops, and a chip pointing at a band that was omitted is a
       control that does nothing. */
const headless = IDS.filter(id => id !== 'top' && !OUT.includes(`id="${id}-h"`));
gate(headless.length === 0, `every band carries a heading${headless.length ? `; HEADLESS: ${headless.join(', ')}` : ''}`);
for (const [, href] of INDEX) gate(OUT.includes(`id="${href.slice(1)}"`), `index chip ${href} resolves`);

/* 14. NO /design/ PATH IN THIS PAGE'S OWN HREFS. public/design/ is deleted, so
       one of those is a 404 at a URL that looks routed. Scoped to this build's
       own bands: the inherited footer carries one and it is not this build's to
       fix. And NO UNEXPANDED TEMPLATE HOLE, which is the one class of defect
       that ships as visible source code. */
const designHrefs = [...new Set([...OWN.matchAll(/href="(\/design\/[^"]*)"/g)].map(m => m[1]))];
gate(designHrefs.length === 0, `no /design/ href in this page's own bands${designHrefs.length ? `; FOUND: ${designHrefs.join(', ')}` : ''}`);
gate(!/\$\{/.test(OUT), 'no unexpanded template hole in the output');
gate(!/undefined|\[object Object\]/.test(TEXT), 'no undefined or stringified object in the rendered text');

if (fail) {
  console.error(`\n${fail} gate(s) failed. The file is written — fix the generator and rebuild.`);
  process.exit(1);
}
console.log(`\n${OUT.length.toLocaleString('en-IN')} bytes. All hub gates pass.`);

/* ═══ THE TEN FELLOW PAGES ═══════════════════════════════════════════════
   One page per file in data/healthy-cities/fellows/, five bands each, and the
   spine stays five because most fellows have five things: who they are and what
   they counted, what they did, who spoke, what the report does not settle, and
   the way on to the other nine.

   ★ EACH PAGE BUILDS ITS OWN INDEX. The hub's five chips are #top, #schools,
   #fellows, #voices and #gaps; three of those bands do not exist here. An
   in-page href to a missing id is `FAIL:no-such-id` to the WORK section's link
   census, and the frozen section strip silently drops the chip — so the visible
   result of borrowing the hub's index is a control strip where three of five
   controls do nothing. The chips are derived from the bands this page actually
   rendered, and a gate below asserts every one of them resolves.

   ★ AND EACH PAGE BUILDS ITS OWN BAND CHAIN, because `gaps` is conditional:
   a fellow whose report settles everything gets no named-hole band rather than
   a heading over nothing. bandChain re-derives the whole ground rhythm from
   whatever is on, which is why no chain is written down here either.

   ★ WHAT IS DELIBERATELY NOT HERE is what is not on the hub, for the same
   reasons and checked by the same gates: no state chip, no `.readout`, no
   second `@keyframes`, no borrowed logo. Ruling 6's own words — a corner badge
   reading PERIODIC over an editor-entered figure would be the worst thing on
   the site — apply harder here, because these ten pages are a person's name
   over their own report. */
mkdirSync(join(S.V3, 'healthy-cities', 'fellows'), { recursive: true });

/* THE HEADINGS ARE PAGE FURNITURE, NOT DATA, and this is the one place these
   pages differ from the hub. The hub reads every heading out of
   programme.json's `bands` because those headings ARE that page's content, and
   an editor renaming "The ten" should not need a generator. A fellow page's
   four headings are identical on all ten pages — they are the template, the way
   onwardBand's own "Get involved" is — and moving them into programme.json
   would put them inside `bands`, where the hub's OMITTED line reads every key
   the hub did not render and would start reporting them as bands it dropped. */
const F_HEAD = {
  did: 'The work',
  voices: 'What people said',
  gaps: 'What we cannot say yet',
  onward: 'The rest of the cohort',
};
/* The section strip's own words. Shorter than the heads where the head is long:
   the strip is a horizontally scrolling control at 940 and below, and it is the
   one place on the page where a label is competing for width. */
const F_CHIP = {
  top: 'The fellow', did: 'The work', voices: 'What people said',
  gaps: 'What we cannot say yet', onward: 'The cohort',
};

/* NO TESTIMONIAL, SAID AS A SENTENCE. Three of the ten reports carry no direct
   speech at all — miyawaki-forests records what was planted and where,
   swapnil-chaurasiya puts two fathers' account in the report's own words rather
   than theirs, and tawheed-zubair's three Hindi testimonials survive only as
   broken text. So this band would be a heading over nothing on three pages, and
   `hole()` is the site's device for exactly that: a named absence in the SOURCE
   RECORD, set as a real sentence rather than a dash or a zero. It is one
   sentence for all three because it is the one thing true of all three; each
   file's own `holes` then says which of the three cases it is, in its own
   words, one band down. */
const NO_VOICE = 'The report on this project sets down nothing in anybody&rsquo;s own words.';

/* ── THE NAMED LIST, one group per column, `--n` from the membership.
      This is the component AD-17's band 5 built for "schools, partners and
      funders BY NAME" — the register's own hairline used across instead of
      down — and it is what the hub's own funder credit is set in. Two things
      about the call below are deliberate:
        · NO `wk-names-1`. That class flows a single group's list into three
          columns, and the frozen note says why: at --n:1 a list of NAMES would
          each take a 1,148px ruled row for fifteen characters of ink. What was
          done is a sentence, not a name — 40 to 100 characters — so the
          full-width ruled row is the right shape for it and the three-column
          remedy would break sentences across column boundaries.
        · THE ITEMS GO IN RAW, not through esc(). The `did` lines are authored
          prose carrying HTML entities ("planted 3,000 native saplings &mdash;
          arjuna, simolu and elephant apple"), exactly as the prose the hub
          hands doRows does; esc() would ship the literal text "&mdash;" and
          gate 3 below is what proves it did not. */
const namedList = (groups) => `      <div class="wk-names" style="--n:${groups.length}">
${groups.map(g => `        <div><span class="lbl">${g.label}</span><ul>${
  g.items.map(i => `<li>${i}</li>`).join('')}</ul></div>`).join('\n')}
      </div>`;

/* A fellow's frames are a contact sheet where order is the only thing that
   matters, so `slot` is optional on them (schema note on frameSchema). Read the
   same way the hub reads its own, so the photography pass has one convention. */
const fellowFrame = (f, slot) => (f.frames || []).find(x => x.slot === slot) || null;

/* The hub's applyCanvas passes `onward` through untouched because onwardBand
   carries its own .wrap. A fellow page's closing band does not use that
   component — it is an opener, a register and one link out — so only `top` is
   exempt here. Everything else takes the canvas its own declared ground asks
   for, which is what puts .wk-dark round the paper-frozen components on the
   two dark bands. */
function applyFellowCanvas(bands, body) {
  const out = {};
  for (const [id, , hex] of bands) {
    const v = body[id];
    if (id === 'top') { out[id] = v; continue; }
    if (!Array.isArray(v)) { out[id] = canvasFor(hex)(v); continue; }
    const rest = v.slice(1).filter(Boolean).join('\n');
    out[id] = rest ? `${v[0]}\n${canvasFor(hex)(rest)}` : v[0];
  }
  return out;
}

/* ── THE PAGE CSS THESE TEN NEED AND THE HUB DOES NOT. One rule, and it is the
      same correction the hub states for its own register: a row carrying a
      pre-line has THREE items in its content column and the frozen rule spans
      the ordinal over two. Kept out of PAGE_CSS so the hub's stylesheet is
      byte-identical to what it shipped. */
const FELLOW_CSS = `
#onward .w7-pj-rows .w7-pj-n{grid-row:1/span 3}
`;

const fellowPages = [];
let fbad = 0;

console.log('\nFELLOW PAGES');
for (const f of FELLOWS) {
  const route = `/healthy-cities/fellows/${f.slug}`;
  const REGF = seo(route);
  /* THE REGISTER AND THE DATA MUST AGREE, AND IT IS CHECKED RATHER THAN HOPED.
     `desc` is passed from the fellow's own file so the page's description is a
     fact about the fellow and not a second copy of one; verify-seo.mjs then
     asserts the SHIPPED head matches data/seo/pages.json exactly. Two writable
     places, one string — so the drift is caught here, at the build that made
     it, instead of by a verifier two commands later. */
  if (REGF.description !== f.description) {
    dataFail(`data/seo/pages.json's description for ${route} is not ${f.slug}.json's own. `
      + 'The page ships the fellow file\'s, so verify:seo would fail on the register.');
  }

  const figs = (f.figures || []).map(x => ({ ...x, label: plain(x.label), period: plain(x.period) }));
  /* ★ A SINGLE FIGURE DOES NOT GET A RAIL — one tile in a four-column grid is
     the documented mistake, and figureRail returns '' below FIGURE_RAIL_MIN, so
     the natural call would silently print NOTHING rather than the figure. Every
     fellow has three or more today; this is coded because "today" is not a
     guarantee, and the reading pair is the component that renders one honestly.
     ★ AND THE RAIL TAKES FOUR. Two fellows publish five figures and figureRail
     slices the rest away in silence — the same trap the hub's data gate 3
     refuses for the programme. The four land on the first screen and the
     remainder is set as reading pairs with the record of the work in `did`,
     rather than being lost to a slice; the gate below asserts every published
     figure reaches the page. */
  const rail = figs.slice(0, W.FIGURE_RAIL_MAX);
  const spill = figs.slice(W.FIGURE_RAIL_MAX);
  const railBlock = rail.length >= W.FIGURE_RAIL_MIN ? W.figureRail(rail) : W.figures(rail);

  const fb = {};

  /* ── BAND 1. WHO, WHERE, WHEN — AND WHAT THEY COUNTED.
        The h1 is the person. Under it, in the order a reader needs them: the
        crumb back to the register row this page was opened from, the project's
        own title, where and when, then the fellow's own deck. Display type may
        sit on a photograph and nothing else may, so every one of those lines
        lands in .pic-body on solid ground and only the h1 goes over the frame.
        THE RAIL SITS IN A SECOND .pic-body, as the hub's does and as /impact's
        does, and .wk-dark IS THE CALLER'S JOB: .ip-ovl-s is the PAPER caption
        ink, so the natural <div class="wrap"> ships about 2.7:1 on the period
        captions under the headline numbers and nothing but a rendered contrast
        check would ever see it. */
  fb.top = () => `${W.masthead({
    h1: f.name,
    deck: f.deck,
    frame: fellowFrame(f, 'top'),
    ancestor: W.anc(plain(PROG.title), '/healthy-cities#fellows'),
    lines: [
      `<p class="lbl hc-credit">${f.project}</p>`,
      /* Delhi is its own state, so the naive place-then-state line reads
         "Delhi &middot; Delhi" on one of the ten — the same case the hub's
         register pre-line has. A place that IS its state is named once. */
      `<p class="lbl hc-eye">${[f.place === f.state ? f.state : `${f.place} &middot; ${f.state}`,
    f.period].join(' &middot; ')}</p>`,
    ],
  })}
    <div class="pic-body hc-rail">${dark(railBlock)}</div>`;

  /* ── BAND 2. THE WORK: WHAT IT SET OUT TO DO, THEN WHAT WAS DONE.
        The aims are a heading over a sentence each, which is exactly the ruled
        prose row's shape and the same component the hub's own `what` band uses.
        s-vineeth-kumar HAS EXACTLY ONE AIM — two of his three objectives were
        left blank in the report — so nothing here may assume a pair: doRows
        renders one row as one row, and the schema's `.min(1)` plus the hub's
        data gate are what guarantee there is at least that. */
  fb.did = [
    W.openBand('did', F_HEAD.did),
    W.doRows(f.aims.map(a => ({ h: a.h, p: a.p }))),
    namedList([
      { label: 'What was done', items: f.did },
      ...(f.partners.length ? [{ label: 'Partners', items: f.partners.map(esc) }] : []),
    ]),
    spill.length ? W.figures(spill) : '',
    /* A fellow's own links out. NONE of the ten carries one today, so this
       renders on no page — written because the schema offers the field and a
       page that silently drops data is the failure this whole file is arranged
       against, not because a link is expected. */
    (f.links || []).length
      ? `      <p style="margin:var(--gap-row) 0 0;display:flex;flex-wrap:wrap;gap:clamp(14px,1.6vw,24px)">${
        (f.links || []).map(l => `<a class="act" href="${esc(l.href)}" rel="noopener" target="_blank">${esc(l.label)} ${ARROW}</a>`).join('')}</p>`
      : '',
  ];

  /* ── BAND 3. THE VOICES, out of this fellow's own file and nowhere else.
        The hub POINTS at these quotes rather than copying them, so the two
        pages structurally cannot show different words for one speaker. The text
        is a verbatim transcription and doubles as the hub's lookup key: it is
        set with raw glyphs, never entity-encoded, and not one character of it
        is altered here. The hub's caption names the fellow because ten
        projects' quotes sit in one band there; on this page that would be the
        page's own h1 repeated under every panel, so it is dropped. */
  fb.voices = [
    W.openBand('voices', F_HEAD.voices),
    (f.quotes || []).length
      ? `      <div class="hc-voices">\n${f.quotes.map(q => `        ${W.panel({
        name: q.speaker,
        p: `&ldquo;${q.text}&rdquo;`,
        cap: [q.role, q.place].filter(Boolean).join(' &middot; '),
        frame: q.frame || null,
      })}`).join('\n')}\n      </div>`
      : hole(plain(NO_VOICE)),
  ];

  /* ── BAND 4. WHAT THE REPORT DOES NOT SETTLE. Named holes in the SOURCE
        RECORD — a headcount that does not settle, a plantation with four dates
        and no year, testimonials that survive only as broken encoding — which
        is the story rather than an apology about this page. The band is omitted
        where a file has none, rather than opening a heading over nothing. */
  fb.gaps = [
    W.openBand('gaps', F_HEAD.gaps),
    (f.holes || []).map(h => hole(plain(h))).join('\n'),
  ];

  /* ── BAND 5. THE WAY ON. The other nine, in the register the hub uses, each
        row carrying the pre-line that tells nine rows of a person's name apart,
        and one link back to the page this one was opened from. No ask: the
        cohort is what a reader of one fellow's page wants next, and the
        programme's own three doors and its single ask are one click up on the
        hub rather than restated ten times. */
  const others = FELLOWS.filter(x => x.slug !== f.slug);
  fb.onward = [
    W.openBand('onward', F_HEAD.onward),
    W.regRows(others.map(x => ({
      anchor: x.slug,
      href: `/healthy-cities/fellows/${x.slug}`,
      pre: x.place === x.state ? x.state : `${x.place} &middot; ${x.state}`,
      name: x.name,
      line: x.project,
    }))),
    `      <p style="margin:var(--gap-row) 0 0"><a class="act" href="/healthy-cities">${
      plain(PROG.title)} ${ARROW}</a></p>`,
  ];

  const F_IDS = ['top', 'did', 'voices',
    ...((f.holes || []).length ? ['gaps'] : []),
    'onward'];
  const F_BANDS = W.bandChain(F_IDS)
    .map(([id, cls, hex, tier]) => [id, [cls, tier].filter(Boolean).join(' '), hex, tier]);
  for (const [id, cls, hex] of F_BANDS) {
    const real = W.compositedHex(cls);
    if (real === null) dataFail(`${f.slug}: band ${id} declares two ground classes ("${cls}")`);
    else if (real !== hex) dataFail(`${f.slug}: band ${id} declares ${hex} but "${cls}" composites to ${real}`);
  }
  const F_INDEX = F_IDS.map(id => [F_CHIP[id], `#${id}`]);
  const FBODY = applyFellowCanvas(F_BANDS, fb);

  if (bad) { console.error(`\nREFUSING TO WRITE: ${bad} check(s) failed.`); process.exit(1); }

  const FOUT = await S.assemble({
    file: `healthy-cities/fellows/${f.slug}.html`,
    route,
    title: REGF.title,
    desc: f.description,
    bands: F_BANDS, index: F_INDEX, sh, clashes: S.groundChain(F_BANDS),
    pageCss: [sh.COMPONENT_CSS, W.WORK_CSS, PAGE_CSS, FELLOW_CSS].join('\n'),
    sectionFor: (id) => {
      const v = FBODY[id];
      return typeof v === 'function' ? v() : (v ?? '    <div class="wrap"><p class="lead">&mdash;</p></div>');
    },
    note: `${F_BANDS.length} bands + footer. ${figs.length} figures`
      + `${spill.length ? ` (${rail.length} on the rail, ${spill.length} with the work: `
        + `${spill.map(x => `"${x.label}"`).join(', ')})` : ''}, `
      + `${f.aims.length} aim(s), ${f.did.length} done, ${(f.quotes || []).length} quote(s), `
      + `${(f.holes || []).length} hole(s), ${f.partners.length} partner(s), ${others.length} onward.`,
  });
  fellowPages.push({ slug: f.slug, bytes: FOUT.length });
  fbad += fellowGates({ f, OUT: FOUT, ids: F_IDS, index: F_INDEX, figs, others });
}

/* ═══ THE FELLOW PAGES' GATES ════════════════════════════════════════════
   The hub's, minus the four that are about the programme's own rail and its
   resolved-pointer voices band, plus the five that are about a person's page:
   every figure they published reaches it, every quote is verbatim, every named
   hole is stated, a page with no quote states that instead of nothing, and the
   crumb back to the register row this page was opened from is present.
   Declared as a function below the loop and hoisted, so the loop above reads as
   the page and not as the checking. */
function fellowGates({ f, OUT: HTML, ids, index, figs, others }) {
  let n = 0;
  const bad2 = [];
  const g = (ok, msg) => { if (!ok) { bad2.push(msg); } n++; };

  const RENDERED2 = HTML
    .replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ');
  const TEXT2 = RENDERED2.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  const OWN2 = HTML.split('<footer')[0].split('<main')[1] || '';

  /* 1. THE RAIL IS INSIDE A STILL-OPEN .wk-dark. The one defect on this page
        that only a rendered contrast check can see. */
  const rails2 = [...HTML.matchAll(/<div class="ip-ovl"/g)];
  const inDark = rails2.filter((m) => {
    const before = HTML.slice(0, m.index);
    const open = before.lastIndexOf('wk-dark');
    return open !== -1 && !before.slice(open).includes('</div>');
  });
  g(rails2.length > 0 && inDark.length === rails2.length,
    `figure rail(s) inside .wk-dark: ${inDark.length} of ${rails2.length}`);

  /* 2. NO DOUBLE-ESCAPED ENTITY. This page is made almost entirely of the three
        components that esc() their arguments, over data authored with entities. */
  const dbl2 = [...new Set([...HTML.matchAll(/&amp;(?:mdash|ndash|rsquo|lsquo|ldquo|rdquo|nbsp|middot|hellip);/g)].map(m => m[0]))];
  g(dbl2.length === 0, `double-escaped entity: ${dbl2.join(', ')}`);

  /* 3. NO STATE CHIP, NO .readout ELEMENT, NO BORROWED LOGO, NO /design/ PATH,
        NO UNEXPANDED TEMPLATE HOLE. Tested as elements and paths rather than as
        strings: --t-readout and the .readout rules arrive in the inherited
        stylesheet on every page built through this shell. */
  g(!/\b(LIVE|PERIODIC|OUT OF SEASON|NO SEASON)\b/.test(RENDERED2), 'a source-cadence state word is in the rendered page');
  const ro = [...HTML.matchAll(/class="[^"]*\breadout\b[^"]*"/g)].map(m => m[0]);
  g(ro.length === 0, `.readout element: ${ro.join(', ')}`);
  const brand2 = [...new Set([...OWN2.matchAll(/\/brand\/[^"']+/g)].map(m => m[0]))];
  g(brand2.length === 0, `logo file in this page's own bands: ${brand2.join(', ')}`);
  const dz = [...new Set([...OWN2.matchAll(/href="(\/design\/[^"]*)"/g)].map(m => m[1]))];
  g(dz.length === 0, `/design/ href: ${dz.join(', ')}`);
  g(!/\$\{/.test(HTML), 'unexpanded template hole in the output');
  g(!/undefined|\[object Object\]/.test(TEXT2), 'undefined or stringified object in the rendered text');

  /* 4. EVERY BAND HAS A HEADING AND EVERY CHIP RESOLVES TO A BAND ON THIS PAGE.
        The whole reason these pages build their own index. */
  const headless2 = ids.filter(id => id !== 'top' && !HTML.includes(`id="${id}-h"`));
  g(headless2.length === 0, `band(s) with no heading: ${headless2.join(', ')}`);
  const deadChip = index.filter(([, href]) => !HTML.includes(`id="${href.slice(1)}"`));
  g(deadChip.length === 0, `index chip(s) resolving to nothing: ${deadChip.map(c => c[1]).join(', ')}`);
  /* KEEP IN STEP WITH THE HUB'S OWN GATE 12 (~line 681-684): both halves,
     NAV_IDS (fragment ids parsed out of S.NAV's hrefs) and NAV_WORDS (the nav
     labels), or a band id that collides with a nav href's #fragment reaches
     this page silently while the hub would have caught it. It is inert today
     — no S.NAV href carries a #fragment, so NAV_IDS is empty — but it must
     not stay a weaker copy of the hub's check. */
  const NAV_IDS2 = new Set(S.NAV.map(([, h]) => (h.match(/#([\w-]+)$/) || [])[1]).filter(Boolean));
  const NAV_WORDS2 = new Set(S.NAV.map(([t]) => t.toLowerCase()));
  const collide2 = ids.filter(id => NAV_IDS2.has(id) || NAV_WORDS2.has(id));
  g(collide2.length === 0, `band id(s) colliding with a nav word: ${collide2.join(', ')}`);

  /* 5. EVERY FIGURE THIS FELLOW PUBLISHED REACHES THE PAGE. figureRail takes
        four and slices the rest in silence, so a fifth figure would be authored
        and never shown — the failure this asserts against by value rather than
        by count, which also catches a figure typed into the generator. */
  const lost = figs.filter(x => !HTML.includes(plain(x.value).replace(/\+$/, '<sup>+</sup>')));
  g(lost.length === 0, `published figure(s) that do not render: ${lost.map(x => x.value).join(', ')}`);

  /* 6. EVERY QUOTE IS VERBATIM AND EVERY HOLE IS STATED — and a page with no
        quote states THAT, in a sentence, rather than opening an empty band. */
  const unsaid = (f.quotes || []).filter(q => !HTML.includes(q.text));
  g(unsaid.length === 0, `quote(s) not rendered verbatim: ${unsaid.map(q => q.speaker).join(', ')}`);
  const voicesBand = (HTML.split('id="voices"')[1] || '').split('</section>')[0];
  g((f.quotes || []).length
    ? /class="wk-panel"/.test(voicesBand)
    : /class="p-hole"/.test(voicesBand) && voicesBand.includes(plain(NO_VOICE)),
  (f.quotes || []).length ? 'the voices band renders no panel' : 'the voices band is empty where it should state a named hole');
  const unheld = (f.holes || []).filter(h => !HTML.includes(esc(plain(h))));
  g(unheld.length === 0, `named hole(s) that do not render: ${unheld.length}`);

  /* 7. EVERY AIM RENDERS. s-vineeth-kumar has exactly one, so a block that
        assumed a pair would drop his only one or print an empty slot beside it. */
  const noAim = f.aims.filter(a => !HTML.includes(a.h));
  g(noAim.length === 0, `aim(s) that do not render: ${noAim.map(a => a.h).join(' | ')}`);
  g(!/<p class="lbl"><\/p>|<li><\/li>/.test(HTML), 'an empty label or list slot was rendered');

  /* 8. THE PAGE IS REACHABLE BOTH WAYS: the crumb back to the register row this
        page was opened from, and a row for each of the other nine. */
  g(HTML.includes('href="/healthy-cities#fellows"'), 'no crumb back to the register');
  const missingSib = others.filter(x => !HTML.includes(`<li id="${x.slug}"><a href="/healthy-cities/fellows/${x.slug}">`));
  g(missingSib.length === 0, `sibling(s) missing from the onward register: ${missingSib.map(x => x.slug).join(', ')}`);
  g(!HTML.includes(`href="/healthy-cities/fellows/${f.slug}"`), 'the page links to itself');

  /* 9. THE MASTHEAD OWNS THE SHARE CARD. With no frame yet the page takes the
        neutral publisher card; once Task 6 lands, the first photograph in
        document order must be the masthead's and not a quote panel's. */
  const first2 = /<img[^>]*src="\/images\/[^"]*"[^>]*>/.exec(OWN2);
  g(!first2 || /fetchpriority="high"/.test(first2[0]),
    'the first photograph in document order is not the masthead frame');

  if (bad2.length) {
    console.error(`  FAIL ${f.slug}: ${bad2.length} of ${n}`);
    for (const m of bad2) console.error(`       ${m}`);
  } else {
    console.log(`  ok   ${f.slug} — all ${n} checks pass`);
  }
  return bad2.length;
}

if (fbad) {
  console.error(`\n${fbad} fellow-page gate(s) failed. The files are written — fix the generator and rebuild.`);
  process.exit(1);
}
const total = OUT.length + fellowPages.reduce((a, p) => a + p.bytes, 0);
console.log(`\n${1 + fellowPages.length} pages, ${total.toLocaleString('en-IN')} bytes. All gates pass.`);
