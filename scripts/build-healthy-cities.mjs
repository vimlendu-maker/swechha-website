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
//     ★ THAT RULING WAS NEVER A CAP ON NUMERAL SIZE, and reading it as one is
//     what made this page fail its review. The owner said it does not convey
//     scale; the grounds were measured and were not the fault (60 per cent dark
//     against the homepage's 64, no paper touching paper) and the page already
//     carried MORE running prose than the homepage. What it had was a hole in
//     the middle of the type ladder — 104px display heads, then nothing until
//     42px, then nothing until 20.5px — and the largest numeral on it was
//     `.ip-ovl-v`, the SMALLEST numeral treatment on this site, smaller on a
//     phone than a `.d2` sentence. The 2026-09-07 restructure fills the missing
//     rungs with treatments that already exist and are already measured: the
//     four deliverables as `.d1` display rows (43.2 -> 104px), /farm's masthead
//     rail in place of /impact's (34 -> 69.1px), a `figures()` group at the foot
//     of each deliverable band (32 -> 46.1px), and ONE `.d2` sentence carrying
//     the health argument (24 -> 44px). `.readout` stays refused, and three
//     gates still prove it.
//   · NO SECOND `@keyframes`. The homepage's live pulse is the only one on the
//     whole site.
//   · ONE FUNDER LOGO, IN THE `#with` BAND, AND IT IS THE ONLY THIRD-PARTY MARK
//     ON THE SITE. Ruling 10 refused every foreign trademark on every page and
//     ruling 42 reversed it: the owner asked for Niva Bupa's mark. Three things
//     travel with that. (a) IT ADDS TO THE TYPE CREDIT AND REPLACES NOTHING —
//     both funders are still named in the masthead's `.pic-body` line and still
//     listed in `#with` in bridge-the-gap's own grammar, weight step and all;
//     the logo sits alongside, and a gate below proves both `<li>`s survived.
//     (b) IT IS NOT IN THE MASTHEAD, so the page still opens on the work rather
//     than on somebody's brand. (c) A LOGO IS A MARK, NOT A PHOTOGRAPH: the
//     site's black-and-white-without-exception rule is about photography, and
//     the design language's own sentence is "hue lives only in type, data, marks
//     and controls" — so it renders IN COLOUR, carries no `duo`/`duo-dim`, lives
//     in its own pool under /images/partners/ rather than the photograph pool,
//     and is NOT registered in content/photo-library.json. Gate 6 now polices
//     that partition in both directions instead of banning logos outright.
//     THE BUPA FOUNDATION STAYS TYPE-ONLY. It is a separate legal entity (a UK
//     charity) with no published asset and no published brand policy, so there
//     is nothing to place; approximating one would be inventing a trademark.
//   · NO CUMULATIVE FIGURE, AND NOW NOT PER GROUP EITHER. Gate 1 computes the
//     sum of EVERY figure group on the page — the masthead rail and each of the
//     four deliverables' own — plus the grand total, and asserts each is absent
//     from the rendered page in every format it could take. The four
//     deliverables SHARE THEIR PEOPLE BY CONSTRUCTION: the 2,000+ students in
//     the workshops are drawn from the same twenty-six schools whose students
//     took the twenty trips and built the twenty gardens, so a "young people
//     reached" aggregate would be a real arithmetic result about nobody. The
//     sums are derived from the groups rather than listed, so a fifth group is
//     covered the day somebody authors it.
import { readFileSync, readdirSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import * as S from './lib/situation-shell.mjs';
import * as W from './lib/work-shell.mjs';
import { seo } from './lib/seo-register.mjs';
import { imageSize } from './lib/jpeg-size.mjs';

/* `hole()` IS DELIBERATELY NOT IMPORTED. These eleven pages used to render a
   "What we cannot say yet" band out of it, and on 7 September 2026 the owner
   struck the whole band: the copy standard's Removed column already covered it
   ("what this page cannot say yet", gap counters, empty-state confessions, and
   the page narrating its own construction), and what those holes actually
   described was the state of the Word documents we were handed rather than
   anything about the programme. The nine pages that still call `hole()` —
   the six situation pages, /now/air/india, /posters and the Nepal GLOF page —
   are naming holes in an EXTERNAL record (an absent monitor, an official figure
   nobody published), which the standard permits and this page never had. */
const { esc, ARROW } = S;

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
const BAND_PROSE = ['top', 'what', 'kinds', 'workshops', 'cityscapes', 'statement',
  'actions', 'fellows', 'voices', 'watch', 'with', 'onward'];
/* THE FOUR DELIVERABLES, IN THE ORDER THEY APPEAR, and the list is what the
   `kinds` band's display rows, the four bands themselves and the figure-group
   gates below all read. Naming them once means the display row that opens a
   deliverable and the band it opens cannot get out of step. */
const DELIVERABLES = ['workshops', 'cityscapes', 'actions', 'fellows'];
for (const k of BAND_PROSE) {
  if (!BD[k] || !Object.keys(BD[k]).length) {
    dataFail(`bands.${k} is missing from programme.json. Every band reads its prose from there.`);
  }
}

/* ★ EVERY FIGURE ON THIS PAGE GOES THROUGH ONE CHECK, wherever it is authored.
   The rail is `programme.figures`; each of the four deliverable bands closes on
   its own `figures` array inside `bands`, and `bands` is a z.record of unknown
   in the schema, so nothing there validates them. Collected once, checked once,
   and used again by the sum gates after the write. */
const BAND_FIG = DELIVERABLES.flatMap(id => ((BD[id] && BD[id].figures) || [])
  .map(f => ({ ...f, where: `bands.${id}` })));
const ALL_FIG = [...PROG.figures.map(f => ({ ...f, where: 'the masthead rail' })), ...BAND_FIG];
for (const f of ALL_FIG) {
  if (!f.period) dataFail(`${f.where}: figure "${f.label}" has no period. A figure without a span is not a reading.`);
  if (!['counted', 'modelled', 'planned'].includes(f.basis)) dataFail(`${f.where}: figure "${f.label}" has basis "${f.basis}".`);
  if (!f.source) dataFail(`${f.where}: figure "${f.label}" has no source.`);
  /* A TARGET NAMES THE DOCUMENT THAT SET IT. The only source for either of the
     two `planned` figures is the funding proposal; sourcing a target to an
     impact report would say the report reported it, and neither report does. */
  if (f.basis === 'planned' && !/proposal/i.test(f.source)) {
    dataFail(`${f.where}: figure "${f.label}" is basis "planned" but its source is "${f.source}". `
      + 'A target is sourced to the document that set it, which for this programme is the proposal.');
  }
}
/* ★ NO TARGET ON THE MASTHEAD RAIL. The rail is four numerals on the first
   screen of a page a funder is handed by link, with a label and a span and no
   room to qualify itself; what belongs there is what the year achieved. The two
   `planned` figures the owner asked for — the proposal's 100 classroom
   workshops and its five curriculum modules — sit in the `workshops` band with
   the prose that says what a module is. */
for (const f of PROG.figures) {
  if (f.basis === 'planned') {
    dataFail(`rail figure "${f.label}" is basis "planned". The rail publishes what the year achieved; `
      + 'a target belongs in the deliverable band it was set for, beside the prose that explains it.');
  }
}
/* THE RAIL IS FOUR CELLS WIDE. It is no longer figureRail() — see the masthead
   note below — so nothing slices a fifth figure away in silence any more; the
   grid takes its column count from the membership. Four is still what is
   authored and still what the /farm pattern was measured at, so a change to it
   is a change somebody should have to make here on purpose. */
if (PROG.figures.length !== W.FIGURE_RAIL_MAX) {
  dataFail(`the masthead rail is authored at ${W.FIGURE_RAIL_MAX} cells and programme.figures has `
    + `${PROG.figures.length}. The /farm rail pattern this page uses was measured at four across; `
    + 'widen .hc-rail\'s breakpoints in the same change if that is really the intent.');
}
/* Every band that carries figures carries at least two of them. ONE FIGURE IS
   NOT A GROUP: `figures()` renders a single reading pair in a flex row, which
   at 46px beside a two-line label reads as an orphan rather than as a set. */
for (const id of DELIVERABLES) {
  const n = ((BD[id] && BD[id].figures) || []).length;
  if (n && n < W.FIGURE_RAIL_MIN) {
    dataFail(`bands.${id} has ${n} figure. A group is two or more — one numeral beside a heading reads as an orphan.`);
  }
}
/* THE HUB'S SHARE DESCRIPTION IS WRITTEN IN TWO PLACES AND HAS TO BE ONE
   STRING. The fellow pages already check this (they pass their own `desc` into
   assemble and verify-seo asserts the shipped head matches the register); the
   hub takes the register's copy, so the drift shows up as data/seo/pages.json
   and programme.json disagreeing about the same sentence with nothing to catch
   it. Checked here, at the build that would make it. */
if (seo('/healthy-cities').description !== plain(PROG.description)) {
  dataFail('data/seo/pages.json\'s description for /healthy-cities is not programme.json\'s own. '
    + 'The register is what ships in the head; the data is what the schema length-checks. They are one sentence.');
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

/* ★ THE PHOTO-LIBRARY GATE, and this generator shipped eight photographs
   without one. `alt` is served out of data/healthy-cities/**, so the library
   row beside each file — its dimensions, its credit, its provenance note — was
   hand-verified and nothing but a person re-reading both files would ever see
   them disagree again. The other two generators that publish photography both
   gate: build-work-pages.mjs refuses a frame with no library entry (AD-17
   §8.2), and build-impact-page.mjs additionally checks the library's recorded
   size against the file. This is that second check, copied rather than
   reinvented, down to the rule it turns on: THE FILE WINS OVER THE LIBRARY.
   The drift it exists to catch is not hypothetical. scripts/lib/jpeg-size.mjs's
   own header records that seven frames were recorded 2000x1500 while every
   browser renders them 1500x2000, because the numbers were raw pixels and the
   files carry EXIF Orientation 6 — and that a portrait frame in a letterbox
   cell renders as an unreadable sliver, reported as "the image is not visible".
   WHAT IS DELIBERATELY NOT COPIED is /impact's CREDIT_OK allow-list, which
   accepts only "Swechha archive" or a named Wikimedia licence. Four of this
   microsite's frames are credited "Influence India Fellowship final reports" —
   correct, and ruled so (ruling 34) — so that list would refuse them. It is
   /impact's own decision about /impact's own frames and is not a fact about
   photographs in general; the flags below are. */
const LIB = new Map(JSON.parse(readFileSync(join(S.ROOT, 'content/photo-library.json'), 'utf8'))
  .photos.map(e => [e.src, e]));
/* Every frame this generator can RENDER, from both loaders — the hub's four
   slots and each fellow's own contact sheet — so a frame added to a fellow file
   is gated by the same line as one added to programme.json. */
const ALL_FRAMES = [
  ...(PROG.frames || []).map(fr => ['programme.json', fr]),
  ...FELLOWS.flatMap(f => (f.frames || []).map(fr => [`fellows/${f.slug}.json`, fr])),
];
for (const [where, fr] of ALL_FRAMES) {
  const e = LIB.get(fr.src);
  if (!e) {
    dataFail(`${where}: frame ${fr.src} is not in content/photo-library.json. An unregistered frame `
      + 'has no recorded credit and no recorded provenance, so it counts as unavailable (AD-17 §8.2).');
    continue;
  }
  /* Both flags refuse outright, as they do on every WORK page (AD-17 §8.1,
     W-31): a bought frame is somebody else's real photograph and a synthetic
     one is nobody's, and neither may be published as evidence of this work.
     Neither fires today — all eight are camera originals or report embeds. */
  if (e.stock) dataFail(`${where}: frame ${fr.src} is flagged stock:true and may not be published as our work.`);
  if (e.synthetic) dataFail(`${where}: frame ${fr.src} is flagged synthetic:true — it is not a photograph `
    + 'of this work and may never be published as one. A named hole is the answer, not this frame.');
  let real;
  try { real = imageSize(join(S.ROOT, 'public' + fr.src)); }
  catch (err) { dataFail(`${where}: frame ${fr.src} could not be measured: ${err.message}`); continue; }
  if (e.width !== real.width || e.height !== real.height) {
    dataFail(`${where}: frame ${fr.src} — the library says ${e.width}x${e.height}, the file renders `
      + `${real.width}x${real.height} (EXIF orientation ${real.orientation}). THE FILE WINS — correct `
      + 'content/photo-library.json. Every <img> on this page takes its width/height from the file via '
      + 'imgDim(), so a wrong library row is a wrong credit and a wrong provenance note, not a wrong layout.');
  }
}

/* ★ THE PARTNER MARK IS CHECKED HERE AND DELIBERATELY NOT ABOVE. It goes through
   NONE of the frame machinery: it is not in `frames`, so it never reaches
   ALL_FRAMES, and it is not in content/photo-library.json, so the gate above
   would refuse it as "unregistered" if it did. That is the correct outcome for a
   photograph and the wrong question to ask about a trademark — the library
   records a credit, a provenance note and a stock/synthetic flag, and a logo has
   no photographer, cannot be stock in that sense and cannot be synthetic in that
   sense. Its provenance is `with.mark.source` in the data instead, which the
   build note below prints, and the schema pins its path to /images/partners/ so
   it can never drift into the photograph pool the gate above owns.
   WHAT STILL HAS TO BE TRUE IS THE GEOMETRY. `imgDim()` returns the empty string
   for a file it cannot find or parse, so a moved or renamed mark ships an <img>
   with no width and no height and no build error anywhere — an unreserved box on
   the one band a funder looks at. Measured here, asserted in gate 6. */
const MARK = PROG.with.mark;
const MARK_DIM = S.imgDim(MARK.src);
if (!MARK_DIM) {
  dataFail(`with.mark.src is ${MARK.src} and nothing at public${MARK.src} could be measured. `
    + 'imgDim() omits width/height rather than guessing, so this would ship an unreserved box.');
}
if (LIB.has(MARK.src)) {
  dataFail(`with.mark.src ${MARK.src} is registered in content/photo-library.json. That file is the `
    + 'PHOTOGRAPH pool and its rows carry a credit and a provenance note for a photograph; a partner '
    + 'trademark is neither, and putting it there would put a logo into every check that reads the library.');
}
if (!MARK.trademark.includes(MARK.holder)) {
  dataFail('with.mark.trademark must name with.mark.holder. Reproducing a registered mark without naming '
    + 'the licensee is the acknowledgement missing the only fact it exists to carry.');
}

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
/* ★ THE SPINE, AFTER THE 2026-09-07 RECUT. The programme is now the four things
   it delivered, in the order it delivered them, and `kinds` names all four at
   display scale before any of them opens. `schools` and `green` are gone: they
   were the schools half in two bands, and their content is now inside
   `workshops` and `actions` where the deliverable it belongs to can carry it.
   The `statement` sits between the third and fourth school-side deliverable so
   the four do not run as four consecutive rectangles. */
const IDS = ['top', 'what', 'kinds', 'workshops', 'cityscapes',
  /* `statement` renders only with a photograph: the band IS a display line
     against a frame that runs to the seam, and statementBand has no frameless
     variant because a statement with nothing behind it is a heading. The prose
     is authored and waiting in programme.json; the frame arrives with the
     photography pass, and the band appears with it. Band omission is the
     section's own mechanism — bandChain re-derives the whole ground chain from
     whatever is on, which is why no chain is written down anywhere. */
  ...(PROG.frames && PROG.frames.find(f => f.slot === 'statement') ? ['statement'] : []),
  'actions', 'fellows', 'voices', 'watch', 'with', 'onward'];
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

/* The section strip's own words, and every one has to resolve to a band this
   build actually rendered (gate 13). Short forms: the strip scrolls
   horizontally at 940 and below and is the one place a label competes for
   width. `#kinds` is the door to all four deliverables, so it stands for them
   rather than the strip carrying four chips of its own. */
const INDEX = [
  ['The programme', '#top'],
  ['What it built', '#kinds'],
  ['The fellowship', '#fellows'],
  ['Voices', '#voices'],
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
       site and this is the page a cold visitor arrives at from an email —
       AT `.cap` AND NOT AT `.lbl`, which is the one difference between this
       call and the fellow pages'. `.lbl` is uppercase at .15em tracking, and
       the site's own footer exempts its one explanatory sentence from caps
       because "twenty words of caps is a shout, not a label". The identity line
       is twenty-two words. Stacked under the eleven-word partnership credit it
       was thirty-three words of micro-caps between the h1 and the deck, and
       measured at 375x635 it pushed the whole figure rail off the first screen
       — which is the one thing ruling 8 put the rail inside `#top` to achieve.
       `.cap` is the site's own caption class: 13.5px Newsreader, sentence case,
       the same ink. The fellow pages keep `.lbl` on their `.hc-eye`, because
       there it carries a place and a period and that IS a label;
     the DECK.
   ★ AND THE RAIL SITS IN A SECOND .pic-body RATHER THAN IN A BAND OF ITS OWN,
   mirroring /impact — "immediately after the hero, mirroring the homepage's
   hero -> ticker; a returning reader should recognise the gesture". It costs no
   band id, no ground re-derivation, and it lands all four figures on the first
   screen.

   ★ THE RAIL IS NOW /farm's, NOT figureRail(). MEASURED, AND THAT IS WHY.
   The owner reviewed this page and said it does not convey scale. The grounds
   were not the fault — the alternation here is 60 per cent dark against the
   homepage's 64, with no paper touching paper — and the page already carries
   MORE running prose than the homepage (about 630 words to 518). What it had
   was a hole in the middle of the type ladder, and the rail was the largest
   part of it: figureRail's `.ip-ovl-v` is clamp(26px,3.4vw,42px), which is the
   SMALLEST numeral treatment anywhere on this site — smaller on a phone than
   `.d2`. Four figures on the first screen of a page a funder opens, set smaller
   than a sentence.
   `/farm`'s masthead rail is the same object one size class up:
   clamp(34px,4.8vw,72px) at build-farm-page.mjs:322-326 and :546-552, which is
   34px against 26 at 375 and 69.1 against 42 at 1440. It is the right structural
   precedent and not a borrowed one — `/farm`'s rail sits on RULED FACTS with no
   live reading anywhere on the page, which is exactly this rail's situation, and
   it is a masthead rail in a `.pic-body` under an h1 on #0D0D0B like this one.
   `.readout` (99.2 -> 272px) is still refused and three gates still prove it:
   that scale is licensed by a live reading against a PUBLISHED LEGAL LIMIT, and
   there is no legal limit on a school garden. What was never true is that the
   ruling capped numeral size at 42px.

   ★ SO THE RAIL NO LONGER NEEDS .wk-dark, AND THAT IS A REAL DIFFERENCE.
   figureRail's caption is `.ip-ovl-s`, the PAPER caption ink (#615B50), because
   /impact's rail sits on a light masthead — so the natural `<div class="wrap">`
   round it shipped about 2.7:1 on the four period captions, and only a rendered
   contrast check could see it. The /farm pattern states its own ink for the dark
   ground (`.hc-rail-l{color:var(--fg-2)}`), the way `.fm-rail-l` does, so the
   colour is a property of the component instead of a duty of the caller.
   Gate 2 was rewritten to match: it no longer looks for `.ip-ovl` in a
   `.wk-dark`, it checks that EVERY paper-frozen component this page renders on
   a dark band is inside one — which now covers the four deliverables' figure
   groups and the ten register rows as well, and would have caught the original
   defect too. */
body.top = () => `${W.masthead({
  h1: BD.top.h1,
  deck: PROG.deck,
  frame: frameFor('top'),
  ancestor: W.anc(PROG.ancestor.label, PROG.ancestor.href),
  lines: [
    `<p class="lbl hc-credit">${PROG.partnership}</p>`,
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

/* ── BAND 2. THE HEALTH ARGUMENT, AND THE GAP THE PROGRAMME IS NAMED AFTER.
   ★ ONE `.d2` SENTENCE, AND HEALTH NEVER GETS A NUMERAL.
   There are ZERO health statistics and zero citations in the proposal, the
   impact deck, the synopsis and the fellowship criteria — no AQI figure, no
   morbidity rate, no WHO or CPCB reference, no disease-burden claim. The
   programme's health case is entirely a case, and it is a good one. So it is
   carried by prose and by ONE promoted sentence, and by nothing that looks like
   a measurement. If a health figure is ever supplied it goes in the data with a
   period, a basis and a source like every other figure on the page, and it will
   be a figure about the programme rather than about the country.
   `.d2` is 24px at 375 and 44px at 1440, Newsreader 300 — the rung that was
   missing between the display heads and the reading pairs, and it appears
   exactly ONCE on this page. It is a SENTENCE CARRYING AN ARGUMENT and never a
   section head: the heading above it is `.d1` and does the heading's work, and
   using `.d2` for a title is refused by the design language by name. Capped at
   about 24ch so it breaks as a promoted line rather than as a paragraph.
   The rows under it are the four things the title actually means: the five
   environment-to-health links that ARE the curriculum, the 60/40 government-to-
   private split and the programme's own gloss on "bridge the gap", the theory of
   change, and the fact that there are two strands and not one strand in two
   stages. */
body.what = [
  W.openBand('what', BD.what.head, BD.what.lead),
  `      <p class="d2 hc-say">${BD.what.line}</p>`,
  W.doRows(BD.what.rows),
];

/* ── BAND 3. THE FOUR DELIVERABLES, AT DISPLAY SCALE. ────────────────────
   ★ THIS IS THE LARGEST TYPE MOVE ON THE PAGE AND IT IS ONE FUNCTION CALL.
   `displayRows` sets each row's name as `.d1 rl` — clamp(2.7rem,8vw,6.5rem),
   so 43.2px at 375 and 104px at 1440 — with the 2px rule kissing the word and
   the written line under it. Four of those in a column is a wall of display
   type where the page previously had one heading, which is the answer to "it
   does not convey scale" that re-cutting the grounds could not be.
   THE BAND IS `kinds` AND NOT `deliverables`, deliberately: `kinds` is already
   declared in work-shell's TIER, already ground-scoped in WORK_CSS (its
   `--w7-do-def` track and its `.rl` rule), and its precedent is the homepage's
   own band 4, whose comment says the four kinds ARE the headline. A new id would
   have needed both of those restated for one page.
   IT STILL TAKES AN openBand, and that is not a hedge against the precedent.
   `assemble()` writes `aria-labelledby="kinds-h"` on every section and gate 13
   asserts the id exists; `displayRows` emits `<h3>`s and no band heading, so a
   band composed of it alone is a section labelled by nothing. /work's own kinds
   band makes the same call for the same reason. The head and lead are two short
   lines above four 104px rows — they are not competing with them.
   Each row links to the band it opens, so the display type is also the index. */
body.kinds = [
  W.openBand('kinds', BD.kinds.head, BD.kinds.lead),
  W.displayRows(BD.kinds.rows),
];

/* ── THE FOUR DELIVERABLE BANDS, COMPOSED ONCE. ──────────────────────────
   Each one is the same four things in the same order, so a reader who has read
   `workshops` knows where to look in `actions`: the heading and its lead, the
   argument in running prose, the ruled rows that say what the thing is made of,
   and then the band's own figures at the foot.

   ★ THE FIGURES RECUR DOWN THE PAGE INSTEAD OF APPEARING ONCE ABOVE THE FOLD,
   and that is the second half of the scale answer. `figures()` is the reading
   pair at clamp(2rem,3.2vw,3.1rem) — 32px at 375, 46.1 at 1440 — with no cap on
   how many it takes, and it is already the component ten WORK pages use. Three
   or four per band across four bands means a numeral is never more than a screen
   away, which is what the masthead rail alone could not do however large it was
   set. WORK_CSS's 2px rule for `.w7-pj-num.rl` is scoped by band id and the four
   ids were added to that selector list in the same change; without it these
   groups would silently take the 1px light default.

   ★ AND THE PROSE RENDERS, WHICH IT DID NOT BEFORE. `splitBand` takes its
   `right` column ONLY when it has no frame (the `if (!frame && right)` branch),
   so on the two old bands that had a photograph the authored `prose` was dropped
   in silence — the previous pass found that and recorded it rather than fixing
   it, because fixing it was a composition change and that was a copy pass. This
   is the composition change. Where a band has a frame the prose is emitted above
   the split, in the measure it was written for; where it has none it rides in
   the split's own second column as the component intends. Either way it is on
   the page, and a gate below asserts every authored sentence reached it. */
const deliverable = (id, flip) => {
  const b = BD[id];
  const frame = frameFor(id);
  const prose = (b.prose || []).map(p => `<p class="body hc-prose">${p}</p>`);
  return [
    W.openBand(id, b.head, b.lead),
    frame && prose.length ? `      ${prose.join('\n      ')}` : '',
    W.splitBand({
      left: W.doRows(b.rows),
      frame,
      right: frame ? '' : prose.join('\n        '),
      flip,
    }),
    (b.figures || []).length ? W.figures(b.figures.map(f => ({
      ...f, label: plain(f.label), period: plain(f.period),
    }))) : '',
  ];
};
body.workshops = deliverable('workshops', false);
body.cityscapes = deliverable('cityscapes', true);
body.actions = deliverable('actions', false);

/* ── BAND 8. THE GREEN FELLOWSHIP, FRAMED CORRECTLY. ─────────────────────
   ★ THIS IS THE CORRECTION THAT PROMPTED THE REBUILD, IN THE OWNER'S OWN
   WORDS: "10 fellowship are different from school work participants. They are
   not the ones who went to their respective areas. These were 10 heroes
   selected from across the country and were granted resource and mentorship
   (in some situations) to pilot their climate and health solution."
   The documents confirm it completely. It is a NATIONAL OPEN CALL — ninety-five
   applications against a target of fifty, eligibility 18 to 35, open to
   students, early-career professionals, community leaders, social entrepreneurs
   and grassroots innovators; a grant, mentorship, implementation support and
   certification as a Green Fellow; five selection criteria at twenty per cent
   each. NO pathway, referral, pipeline or eligibility link between a school
   participant and a fellow exists in any source, and not one fellow worked in a
   Delhi partner school — the ten projects are in Moradabad, Majuli, Delhi,
   Chikkaballapura, Bilaspur, Unnao, Bharuch, Uttarkashi and Sangli. Two strands
   under one grant, not one strand with two stages, and the band's own rows say
   so in the fellowship's own terms rather than by denying the other reading.
   ★ WHO SELECTED THEM IS NEVER STATED in any of the four documents — the
   criteria say only that applications "will be evaluated" — so no jury, panel or
   committee is named here. Inventing one would be the easiest sentence on the
   page to write and there is nothing behind it.
   ★ AND IT IS THE "GREEN FELLOWSHIP" (owner's ruling, 7 September 2026,
   reversing an earlier call). That is the name in the grant documents the funder
   signed, and it is what the proposal, the criteria and the synopsis all call
   it. The operational Drive artefacts for the same cohort are branded "Influence
   India Fellowship", which is why the figure sources below still name those
   reports — a source citation names the document that exists, not the name we
   publish. The page's own name for the programme is Green Fellowship
   everywhere, and the closing door reconciles the two by saying Swechha runs it
   as Influence, which is a fact about the programme rather than about our
   filing.

   Ten rows, one per fellow, each carrying `id="<slug>"` so an inbound link
   lands on itself, and each linking to that fellow's own page. The one licensed
   `.lbl` pre-line names where they worked, which is the fact that tells ten
   rows of a person's name apart.
   Then the engagement RANGE, drawn from the two ends of the fellows' own
   people-figures. No derived number is printed: the bar is a length, and both
   end labels are a published `value` string quoted verbatim. */
body.fellows = [
  W.openBand('fellows', BD.fellows.head, BD.fellows.lead),
  W.doRows(BD.fellows.rows),
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
  /* The fellowship's own four figures, at the same weight as the other three
     deliverables'. The grant is published because the criteria document states
     it per fellow; the TOTAL is not, because no document states that total and
     ten times a published number is arithmetic somebody did, not a figure
     anybody reported. */
  W.figures(BD.fellows.figures.map(f => ({
    ...f, label: plain(f.label), period: plain(f.period),
  }))),
];

/* ── THE STATEMENT. One display line over a frame, and no figure: a figure
      without its period, its basis and its source is not a reading, and this
      band has room for none of them. The line under it is the eight states,
      read off the register rather than typed.
      ★ AND THE STATES NOW CARRY A SUBJECT, because the band moved. It used to
      follow `#fellows`, where an unlabelled list of eight states could only
      have been the cohort's. The recut puts it between two SCHOOLS-side
      deliverables, and there an unlabelled "ASSAM / CHHATTISGARH / DELHI …"
      under "Twenty-six schools gave it a place in the year" reads as the
      schools' own states — which would be false, since every partner school is
      in Delhi-NCR. Four words fix it, and they are in the data rather than
      here because they are the caption a reader sees. */
body.statement = () => W.statementBand({
  line: BD.statement.line,
  under: `${BD.statement.under_label} &nbsp;&middot;&nbsp; ${STATES.join(' &nbsp;/&nbsp; ')}`,
  frame: frameFor('statement'),
});

/* ── THERE IS NO `schools` BAND AND NO `green` BAND, AND NOTHING WAS LOST.
      They were the schools half of the programme in two bands — "In the
      schools" and "What is still in the ground" — written before the owner
      asked for the programme to be cut into its four deliverables. Every
      sentence in them is now inside the deliverable it belongs to, where the
      figures for that deliverable sit with it: the one-subject-not-three row and
      the school-year prose went to `workshops`, the exposure-trip row became the
      `cityscapes` band in full, and the twenty gardens, the three thousand
      saplings and the plantation-drive-is-a-photograph prose went to `actions`.
      Their tier rows were deleted from work-shell's TIER in the same change, so
      re-adding either id throws rather than silently defaulting to a weight
      nobody chose. */

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

/* ── THERE IS NO `gaps` BAND, AND THE TWO FACTS IT HELD ARE NOW CONTENT.
      It ran under "What we cannot say yet" over five sentences, and four of the
      five were about the documents rather than about the year: thirty-one
      videos that do not caption their speakers, three testimonials surviving as
      broken encoding, a plantation report with no year on it, two names nobody
      could confirm. That is our filing, and a reader has no use for it.
      The two facts worth keeping moved into the bands they belong to, in the
      programme's own voice: the THIRTY-ONE FILMED ACCOUNTS are content and now
      open `bands.watch`, and TWENTY GARDENS ACROSS TWENTY-SIX SCHOOLS is
      `bands.green`'s own lead. That second move corrected an overclaim in the
      same stroke — the lead read "Every school built something it has to keep
      alive", which is the sentence the struck hole was contradicting two bands
      further down. Nothing was deleted that was true about the work; what went
      was the account of the paperwork.
      ★ AND IT WENT IN THE LEAD RATHER THAN IN `bands.green.prose`, BECAUSE THE
      PROSE DOES NOT RENDER. splitBand takes `right` only when it has NO frame
      (work-shell.mjs, the `if (!frame && right)` branch); `schools` and `green`
      both have one, so the second column is the photograph and both bands'
      authored `prose` has been dropped in silence since this page was built.
      That is a defect in this generator's call and not in the component, but
      fixing it is a composition change and this was a copy pass — so the fact
      was put where it renders today, and the dead `prose` key is reported.
      The band's id, its prose key, its index chip and `programme.holes` all
      went with it — bandChain re-derives the ground rhythm from whatever is
      left, so no chain needed editing, and gate 15 asserts the band cannot
      come back by data alone. */

/* ── WHO IT IS WITH. The same grammar as bridge-the-gap's own `#with` band, to
      the class: an opener, then `.wk-names wk-names-1` with a `.lbl` over a
      plain `<ul>`, and ONE WEIGHT STEP on the leading entries. No size change,
      no colour change, no rule change — the two pages must not look like they
      credit differently.
      `funders_lead` is a rank on a published list, which is a claim, so the
      data carries a source for it and the check that it does is below.

      ★ AND THEN THE ONE LOGO ON THE SITE, UNDERNEATH THAT LIST AND NOT INSTEAD
      OF IT (ruling 42; see the head of this file). Both funders stay named as
      type in the block above, unchanged; the mark is an addition below it, so
      the credit the other twenty WORK pages give is still the credit this page
      gives. Only Niva Bupa gets one — the Bupa Foundation is a separate legal
      entity with no published asset.

      ★ THE WHITE PANEL IS THE ASSET'S REQUIREMENT, NOT A STYLING CHOICE. The
      file has an OPAQUE white background and this band is #0D0D0B, so without a
      light panel the reader gets a white rectangle floating on black. Niva Bupa
      publish no brand guidelines at all — no clear-space rule, no minimum size,
      nothing — so the margin is conservative by construction rather than quoted:
      the panel's 24px padding alone exceeds HALF THE HEIGHT OF THE "niva"
      WORDMARK at the rendered size (the wordmark is 95px of the 668x388 file, so
      at a 280px display width it is 39.8px tall and half of it is 19.9px), and
      the file's own built-in margin adds another 18.9px on top, for about 43px
      of clear space on every side — a shade over one full wordmark height.
      Nothing is cropped, recoloured, rotated, stretched, filtered or separated:
      `width:280px;height:auto` on the whole 668x388 file, `imgDim()` for the box.

      ★ AND THE TRADEMARK ACKNOWLEDGEMENT, at `.cap`, from the data. Niva Bupa
      carry it site-wide on their own pages; reproducing their marks — this file
      contains the HEARTBEAT logo as well as the wordmark — without it would be
      worse than not showing them at all. `.cap` is already `--fg-3`, the
      dark-ground caption ink, so it needs no `.wk-dark` restatement the way
      `.w7-pj-pre` did.
      THE IRDAI REGISTRATION NUMBER IS DELIBERATELY NOT HERE. Registration 145
      (Category: Health) is a disclosure that belongs on the insurer's own
      solicitation material, where it exists so that somebody about to buy a
      policy can verify the seller. This page sells nothing, offers nothing and
      names Niva Bupa only as a funder; printing a regulatory registration number
      beside their mark on an NGO's project page would dress the band up as
      insurance marketing, which is the one thing it must not look like. The
      trademark line is required because we reproduce their marks; the
      registration number is not, because we distribute nothing of theirs. */
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
  /* NO esc() ON `trademark`: it is authored with entities like every other
     string in this data file, and esc() would ship the reader "&ldquo;". alt IS
     esc()'d — it is an attribute, and the mark's alt is a bare organisation name
     with no entity in it either way. */
  `      <figure class="hc-mark">
        <span class="hc-mark-p"><img class="hc-mark-i" src="${MARK.src}" alt="${esc(MARK.alt)}"${MARK_DIM} loading="lazy"></span>
        <figcaption class="cap hc-mark-tm">${MARK.trademark}</figcaption>
      </figure>`,
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
/* ── the two lines under the headline. --fg-3 is the masthead's own caption ink
      and the band is #0D0D0B; stated for paper as well because the masthead is
      the one band whose ground is pinned and a page that ever moves it must not
      silently lose the colour. Every paper rule in this project is
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
.hc-rail-body{padding-bottom:0}

/* ── the register's pre-line. .w7-pj-rows is frozen on paper tokens and the
      .wk-dark statement is what carries it onto a dark band, exactly as the
      row's own title and footnote do. And the ordinal spans THREE rows here,
      not two: a row with a pre-line has three items in its content column, and
      the frozen rule spans two. ── */
.w7-pj-pre{margin:0;color:var(--ink-3)}
.wk-dark .w7-pj-pre{color:var(--fg-3)}
#fellows .w7-pj-rows .w7-pj-n{grid-row:1/span 3}

/* ── THE SPLIT BAND'S PHOTOGRAPH HONOURS ITS OWN CROP, and until this rule
      existed it could not. .ht>img is frozen in home.html as
      width:100%;height:100%;object-fit:cover and states NO object-position, so
      .w7-pj-fig — height clamp(176px,22vw,320px), about 560x315 inside a
      1240px wrap — centre-crops whatever it is handed. Meanwhile splitBand has
      emitted style="--op:VALUE" on that image since it was written and NOTHING
      read the property: the crop could not be steered even deliberately.
      THIS IS THE SAME DEFECT THE SHARED SHELL ALREADY RECORDS ONE COMPONENT
      ALONG. See the note above .pic>img in situation-shell: the situation heroes
      carried --zh/--zt copied from the Air page, .pic>img read none of them, and
      every hero was a centre crop whether or not that was the right crop. One
      property, wired the same way, with the centre crop as the default — so the
      two split frames that ask for no crop render byte-identically.
      IT IS STATED HERE RATHER THAN IN work-shell's WORK_CSS DELIBERATELY. That
      stylesheet is shared by twenty WORK pages plus every other page built on
      the WORK shell, and no frame on any of them asks for a split crop today:
      putting it there would rewrite two dozen built files for a crop only this
      page needs. The day a second caller wants it, it moves up one layer and
      this rule is deleted. ── */
.w7-pj-fig>img{object-position:var(--op,50% 50%)}

/* ── the prose column of a split, and the quote panels. A panel is a block
      here rather than a tab, so the stack needs the block rhythm the tab group
      would otherwise have given it. ── */
.hc-prose{max-width:56ch}
.hc-prose+.hc-prose{margin-top:var(--gap-row)}
.hc-voices{display:grid;grid-template-columns:minmax(0,1fr);gap:var(--gap-block);
  margin-top:var(--gap-row)}

/* ── A QUOTE PANEL WITH NO PHOTOGRAPH IS ONE COLUMN, and until this rule
      existed not one of the nineteen was. WORK_CSS's .wk-panel becomes
      minmax(0,1.15fr) minmax(0,1fr) above 900px so a panel can set its frame
      beside its words — which is right for the six journeys panels that
      component was written for, and wrong for every panel here, because no
      quote carries a frame. Measured at 1440: the panel is 1148px wide, the
      computed tracks are 590.938px and 513.859px, and there is ONE child. So
      45 per cent of the most-read band on all eleven pages was empty ground,
      and the words were reading at 590px in a 1148px measure.
      :not(:has(...)) RATHER THAN A MODIFIER CLASS, because the class would
      have to be added in work-shell's own panel(), and that component is
      shared by every WORK page — the same reason the crop rule above lives
      here. The precedent is situation-render.mjs's .as-cards:has() rule and its
      note: a browser without :has() simply keeps the old behaviour, which is
      the layout that ships today. Scoped to .hc-voices so it cannot reach a
      panel some later band on these pages puts a frame in.
      The rule survives a quote that DOES get a photograph: the panel then has
      a .wk-panel-fig, :not(:has()) stops matching, and the two-column
      composition comes back on that panel alone. ── */
@media (min-width:900px){
  .hc-voices .wk-panel:not(:has(.wk-panel-fig)){grid-template-columns:minmax(0,1fr)}
}
`;

/* ═══ THE HUB'S OWN CSS ══════════════════════════════════════════════════
   The rules the hub needs and the ten fellow pages do not, kept out of PAGE_CSS
   for exactly the reason FELLOW_CSS further down is kept out of it: PAGE_CSS
   ships to all eleven pages, and four rules for an element that exists on one
   of them would rewrite ten files, restamp ten sitemap entries and leave dead
   selectors on every one. The CSS-string gates below run over PAGE_CSS AND
   this, so nothing moved out of the gated string by being moved here.
   THE NO-BACKTICK RULE APPLIES HERE TOO — see the head of PAGE_CSS. */
const HUB_CSS = `
/* ── THE MASTHEAD RAIL, ONE SIZE CLASS UP. This is /farm's own rail
      (build-farm-page.mjs:546-552) restated for this page rather than imported,
      because it lives in that generator's PAGE_CSS and neither the shared shell
      nor WORK_CSS carries it — the same reason /impact's .ip-pair is restated
      wherever it is wanted. Every declaration below is /farm's, with three
      differences and no invented values:
        · THE COLUMN COUNT COMES FROM THE MEMBERSHIP (--n), written by the
          caller from programme.figures.length, so nothing slices a fifth figure
          away in silence the way figureRail did.
        · THERE IS A THIRD LINE PER CELL. /farm's cells are a numeral and a unit;
          these are a numeral, the population it counts and the span it counts
          over, because a figure without its span is not a reading on this site
          and /impact's rail — the thing this replaces — carried all three.
        · THE INK IS STATED FOR BOTH GROUNDS. --fg-2/--fg-3 are the dark-ground
          label and caption inks and this band's ground is pinned to #0D0D0B,
          but the paper statement is written anyway: the one defect the old rail
          shipped was a paper caption ink on a dark band, and a component that
          states its own colour cannot have it got wrong by a caller again.
      34px at 375 and 69.1 at 1440, against the 26 and 42 this page had. ── */
.hc-rail{display:grid;grid-template-columns:repeat(var(--n,4),minmax(0,1fr));
  gap:clamp(14px,2.2vw,40px);border-top:1px solid var(--hair);
  margin-top:var(--gap-row);padding-top:var(--gap-row)}
.hc-rail-c>*{margin:0;min-width:0}
.hc-rail-v{font-size:clamp(34px,4.8vw,72px);line-height:.9;color:var(--fg)}
/* The plus sign on "2,000+" and "3,000+", set exactly as the frozen
   .w7-pj-num sup sets it (home.html:2403-2405) rather than left to the
   browser's default superscript, which at 69px would be a 57px plus sign. ── */
.hc-rail-v sup{font-size:.3em;font-variation-settings:'wdth' 88,'wght' 700;
  letter-spacing:.02em;vertical-align:baseline;position:relative;top:-.66em;
  color:var(--fg-2)}
.hc-rail-l{margin-top:10px;color:var(--fg-2)}
.hc-rail-s{margin-top:8px;color:var(--fg-3)}
.paper .hc-rail,.paper-2 .hc-rail{border-top-color:var(--rule)}
.paper .hc-rail-v,.paper-2 .hc-rail-v{color:var(--ink)}
.paper .hc-rail-v sup,.paper-2 .hc-rail-v sup{color:var(--ink-2)}
.paper .hc-rail-l,.paper-2 .hc-rail-l{color:var(--ink-2)}
.paper .hc-rail-s,.paper-2 .hc-rail-s{color:var(--ink-3)}
/* /farm's own two breakpoints, unchanged: four cells become two under 900 and
   one under 420, because a 34px numeral over a two-line label needs about 150px
   of column and a 375px screen minus the gutters gives 335px for the row. ── */
@media (max-width:900px){.hc-rail{grid-template-columns:repeat(2,minmax(0,1fr));gap:24px}}
@media (max-width:420px){.hc-rail{grid-template-columns:minmax(0,1fr);gap:18px}}

/* ── THE PROMOTED HEALTH SENTENCE. One on the page, and .d2's own declarations
      (Newsreader 300, var(--t-d2), line-height 1.12) arrive in the inherited
      stylesheet — so this rule is only its measure, its space and its ink on
      the two grounds it can land on. 24ch is what makes it break as a promoted
      line rather than as a paragraph; the same reason the display heads above it
      carry a max-width in ch and not in pixels. ── */
.hc-say{margin:var(--gap-row) 0 0;max-width:24ch;color:var(--fg)}
.paper .hc-say,.paper-2 .hc-say{color:var(--ink)}

/* ── THE ARGUMENT WHERE IT SITS ABOVE THE SPLIT RATHER THAN INSIDE IT.
      splitBand takes its right column ONLY when it has no frame, so on a band
      that HAS a photograph the prose is emitted between the opener and the
      split — which is the fix for the two paragraphs this page dropped in
      silence from the day it was built. It needs the row gap the split's own
      grid would otherwise have given it. Written as a sibling relationship
      rather than a second class, because it is the same paragraph either way. ── */
.im-head+.hc-prose{margin-top:var(--gap-row)}
.hc-prose+.w7-pj-split{margin-top:var(--gap-row)}

/* ── A FIGURE GROUP AT THE FOOT OF A DELIVERABLE BAND. .w7-pj-nums is frozen as
      a flex row with no margin of its own, because on the homepage it sits
      inside a project card whose padding supplies the space. Here it closes a
      band, under a split or under a register, so it has to state its own — on a
      hairline, because the group is a separate object from the rows above it and
      without one the numerals read as one more row.
      Scoped by band id and not written on the class: .w7-pj-nums also appears on
      the ten fellow pages, in the spill group beside the record of the work,
      where it must keep the spacing that composition was measured at. ── */
#workshops .w7-pj-nums,#cityscapes .w7-pj-nums,#actions .w7-pj-nums,#fellows .w7-pj-nums{
  margin-top:var(--gap-row);padding-top:var(--gap-row);border-top:1px solid var(--hair)}
/* ★ AND THE PAPER STATEMENT IS QUALIFIED BY THE SAME IDS, because the comment
   that used to sit here was WRONG and a measurement caught it. It said the
   paper statement "is safe on the class", reasoning that the colour is only
   recoloured where the rule above has drawn one. True — and irrelevant: the
   rule above is "#workshops .w7-pj-nums", one id plus one class, and
   ".paper .w7-pj-nums" is two classes. The id wins, so on the two deliverable
   bands this page puts on paper the hairline kept --hair, which is
   rgba(251,248,240,.20) — the DARK-ground hairline, white at a fifth opacity,
   composited to #EFEEEA on #ECEBE8 and #F5F3F0 on #F3F2F0. Measured 1.03:1 and
   1.01:1: white on white, no hairline at all, on the band that closes two of
   the four deliverables. --rule (#DEDDD9) is what was intended and gives 1.10
   and 1.13:1, which is this site's hairline everywhere.
   Same shape of miss as the kissing rule above and the same fix: the ground
   statement is qualified with the ids so it matches the rule it is correcting,
   and it is written for all four bands rather than the two that are paper
   today, because bandChain re-derives which is which. Gate 16 resolves the
   winning declaration per element and checks the token family against the
   band's ground, so a hairline this low cannot be argued past a contrast
   floor. ── */
#workshops.paper .w7-pj-nums,#workshops.paper-2 .w7-pj-nums,
#cityscapes.paper .w7-pj-nums,#cityscapes.paper-2 .w7-pj-nums,
#actions.paper .w7-pj-nums,#actions.paper-2 .w7-pj-nums,
#fellows.paper .w7-pj-nums,#fellows.paper-2 .w7-pj-nums{border-top-color:var(--rule)}

/* ── THE FUNDER'S MARK, AND THE PANEL IS LOAD-BEARING. The asset is an opaque
      white PNG and this band is #0D0D0B, so the panel is what makes the mark
      legible instead of a white rectangle on black. background is a literal
      #FFF and not a token on purpose: every ground token on this site moves with
      the theme, and the mark's own background does not — it is baked into the
      file, so the panel has to match the file rather than the page.
      280px IS THE MEASURED DISPLAY WIDTH and the number in IMG_SIZES under
      hc-mark-p depends on it; change one and change both, or the srcset asks the
      optimizer for the wrong variant. max-width:100% on both is what lets the
      pair shrink together under about 375px instead of pushing the band wide.
      24px OF PADDING IS THE CLEAR SPACE, derived rather than quoted: no Niva
      Bupa clear-space rule is published, the "niva" wordmark is 95px of the
      668x388 file and therefore 39.8px at a 280px render, and half of that is
      19.9px. The file's own margin adds about 19px more on each side. As the
      panel shrinks the requirement shrinks with it and the padding does not, so
      this stays conservative at every width.
      NO duo, NO duo-dim, NO filter OF ANY KIND, and gate 6 asserts it: those
      classes are the site-wide monochrome ramp for PHOTOGRAPHS, and a duotoned
      trademark is an altered trademark. ── */
.hc-mark{margin:var(--gap-row) 0 0}
.hc-mark-p{display:block;width:max-content;max-width:100%;background:#FFF;padding:24px}
.hc-mark-i{display:block;width:280px;max-width:100%;height:auto}
.hc-mark-tm{margin:12px 0 0;max-width:62ch}

/* ── THE KISSING RULE, ON THIS PAGE'S DARK BANDS. AN ID BEATS THREE CLASSES,
      AND THAT IS THE WHOLE DEFECT.
      WORK_CSS gives the 2px kissing rule its paper ink under a list of BAND
      IDS — "#kinds .w7-do-t.rl::after" and "#what,#weight,…,#fellows
      .w7-pj-num.rl::after", both "--rl-c:var(--ink-2)" — because on the
      homepage and on /work every one of those bands is paper. It also carries
      the dark statement, but on the CLASS: ".wk-dark .w7-do-t.rl::after". One
      id plus two classes beats three classes, so on a dark band the paper ink
      WINS and the dark override never fires. Measured on the built page before
      this rule existed: #4C473F on #151512, 1.99:1, on the four display rows of
      "#kinds" and on six of the twelve figure numerals.
      This page's ground chain puts "kinds", "cityscapes" and "fellows" on
      #151512 and "what", "workshops" and "actions" on paper — and the chain is
      DERIVED, so which is which changes the moment a band is added or omitted.
      So the override is not written for the three that happen to be dark today:
      it is written for all six, hung off the ".wk-dark" wrapper that
      canvasFor() opens ONLY on a dark band. Whichever of the six lands dark
      gets the dark ink; the others have no ".wk-dark" and the rule never
      matches them. One id + three classes, so it wins by one class.
      IT LIVES HERE AND NOT IN WORK_CSS on purpose: those two lines are shared
      with the homepage and /work/index.html, where the paper ink is correct and
      editing them would restamp built pages this branch does not own.
      --fg-3 is the token the dark statement already names (#9C9585, 6.4:1 on
      #151512) — nothing new is introduced. Gate 16 computes the resolved colour
      of every .rl::after against its band's ground and refuses below 3:1. ── */
#kinds .wk-dark .w7-do-t.rl::after{--rl-c:var(--fg-3)}
#what .wk-dark .w7-pj-num.rl::after,#workshops .wk-dark .w7-pj-num.rl::after,
#cityscapes .wk-dark .w7-pj-num.rl::after,#actions .wk-dark .w7-pj-num.rl::after,
#fellows .wk-dark .w7-pj-num.rl::after{--rl-c:var(--fg-3)}
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
  pageCss: [sh.COMPONENT_CSS, W.WORK_CSS, PAGE_CSS, HUB_CSS].join('\n'),
  sectionFor: (id) => {
    const v = B[id];
    return typeof v === 'function' ? v() : (v ?? '    <div class="wrap"><p class="lead">&mdash;</p></div>');
  },
  note: `${BANDS.length} bands + footer. ${DELIVERABLES.length} deliverables `
      + `(${DELIVERABLES.map(id => `${id}: ${((BD[id] && BD[id].figures) || []).length} fig`).join(', ')}), `
      + `${FELLOWS.length} fellows in ${STATES.length} states, `
      + `${PROG.figures.length} rail figures at 34-69px, ${BAND_FIG.length} band figures at 32-46px, `
      + `${VOICES.length} resolved voices, ${PROG.videos.length} video series, `
      + `${(PROG.frames || []).length} frames (${(PROG.frames || []).map(f => f.slot).join(', ')}).`
      + (OMITTED.length ? ` OMITTED (no frame yet): ${OMITTED.join(', ')}.` : '')
      /* THE MARK'S PROVENANCE, in the one place a mark can carry it. A
         photograph's provenance is its content/photo-library.json row and a
         trademark has no row there by design (see the data gate above), so it
         travels here — where the next person reading this page's source finds
         it, and where a person cannot ship the file without also shipping the
         sentence saying whose it is and where it came from. */
      + ` PARTNER MARK: ${plain(MARK.src)} — ${plain(MARK.source)}; ${plain(MARK.holder)}.`,
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
/* ★ AND IT IS EVERY GROUP NOW, NOT JUST THE RAIL. The restructure gave four
   more bands a figures() group of their own, and each of those is a fresh
   temptation to print a subtotal under it — "2,105 workshop touchpoints" out of
   100 workshops, 5 modules and 2,000+ students would be a number about nothing.
   So the gate runs over every group this page renders plus the grand total of
   all of them, and it is DERIVED from the groups rather than listing them, so a
   fifth group is covered the day it is authored. */
const GROUPS = [
  ['the masthead rail', PROG.figures],
  ...DELIVERABLES.filter(id => ((BD[id] && BD[id].figures) || []).length)
    .map(id => [`the ${id} band`, BD[id].figures]),
];
const SUMS = [
  ...GROUPS.map(([where, figs]) => [where, figs.reduce((a, f) => a + (magnitude(f.value) || 0), 0)]),
  ['every figure group together', ALL_FIG.reduce((a, f) => a + (magnitude(f.value) || 0), 0)],
];
const ALL_PUBLISHED = PROG.figures.concat(BAND_FIG, ...FELLOWS.map(f => f.figures || []));
let sumOk = true;
for (const [where, n] of SUMS) {
  const forms = fmts(n);
  const alsoReal = ALL_PUBLISHED.filter(f => forms.includes(String(plain(f.value))));
  if (alsoReal.length) {
    console.error(`REFUSING TO PASS: "${alsoReal[0].label}" is published as ${alsoReal[0].value}, which is also `
      + `the sum of ${where}. One of the two has to change — this gate cannot tell them apart.`);
    fail++; sumOk = false;
  }
  const leaked = forms.filter(t => TEXT.includes(t));
  if (leaked.length) {
    console.error(`  the sum of ${where} is ${n.toLocaleString('en-IN')} and it LEAKED as: ${leaked.join(', ')}`);
    sumOk = false;
  }
}
gate(sumOk,
  `no cumulative total is printed — ${SUMS.length} sums (${GROUPS.length} figure group(s) and the grand `
  + 'total) appear in no format the page could take. The four deliverables SHARE THEIR PEOPLE by '
  + 'construction: the 2,000+ students in the workshops are drawn from the same schools whose students '
  + 'took the twenty trips and built the twenty gardens, so an aggregate would be a real number about '
  + 'nobody. RAIL_SUM = ' + RAIL_SUM.toLocaleString('en-IN'));

/* 2. EVERY PAPER-FROZEN COMPONENT ON A DARK BAND IS INSIDE A .wk-dark, AND THIS
      GATE IS WIDER THAN THE ONE IT REPLACES.
      It used to assert that every `.ip-ovl` opened inside a `.wk-dark`, because
      `.ip-ovl-s` is #615B50 — the PAPER caption ink, since /impact's rail sits
      on a light masthead — and written the natural way it shipped about 2.7:1 on
      the four period captions under the four headline numbers, on the first
      screen of a page distributed by link. Nothing else noticed: the markup was
      valid, the schema passed, the source read correctly and so did the
      accessibility tree. Only a rendered contrast check sees it, and only if
      somebody runs one.
      The masthead rail is no longer `.ip-ovl` — it states its own ink for both
      grounds — so an unchanged gate would have passed on an empty set, which is
      the worst outcome available. What replaced it checks the CLASS OF DEFECT
      instead of the one instance: the register rows, the reading pairs and the
      four-kinds rows are ALL frozen on paper tokens (--ink, --ink-2, --ink-3,
      --rule), the restructure put reading pairs on three more bands and
      four-kinds rows on a fourth, and any of those landing on #0D0D0B or
      #151512 without the wrapper is the same 1-to-3:1 failure. Asserted per
      BAND, from the ground the band itself declares. */
const DARK_HEX = new Set(['#0D0D0B', '#151512']);
const PAPER_FROZEN = ['ip-ovl', 'w7-pj-nums', 'w7-pj-rows', 'w7-do-list', 'wk-names'];
/* THE RANGES IN WHICH A .wk-dark <div> IS ACTUALLY OPEN, by counting div depth
   rather than by looking for the next closing tag. The old version of this gate
   asked whether any `</div>` sat between the wrapper and the component, which
   was true of the one case it was written for (the rail was the wrapper's first
   child) and false the moment a component followed a nested block — the split's
   own two columns close before the figure group opens. A gate that is right
   about one arrangement and wrong about the next is worse than none. */
const wkDarkRanges = (html) => {
  const out = [];
  const open = /<div class="wrap wk-dark">/g;
  let m;
  while ((m = open.exec(html))) {
    let depth = 0, i = m.index;
    const tag = /<(\/?)div\b/g;
    tag.lastIndex = i;
    let t;
    while ((t = tag.exec(html))) {
      depth += t[1] ? -1 : 1;
      if (depth === 0) { out.push([m.index, t.index]); break; }
    }
  }
  return out;
};
const RANGES = wkDarkRanges(OUT);
const inDarkWrap = (i) => RANGES.some(([a, b]) => i > a && i < b);
const unlit = [];
let litBands = 0;
for (const [id, , hex] of BANDS) {
  if (!DARK_HEX.has(hex)) continue;
  const start = OUT.indexOf(`id="${id}"`);
  if (start === -1) continue;
  const end = OUT.indexOf('</section>', start);
  const bandHtml = OUT.slice(start, end);
  const present = PAPER_FROZEN.filter(c => new RegExp(`class="(?:[^"]*\\s)?${c}\\b`).test(bandHtml));
  if (!present.length) continue;
  litBands++;
  for (const c of present) {
    const re = new RegExp(`class="(?:[^"]*\\s)?${c}\\b`, 'g');
    let m;
    while ((m = re.exec(bandHtml))) {
      if (!inDarkWrap(start + m.index)) { unlit.push(`${id}/.${c}`); break; }
    }
  }
}
gate(litBands > 0 && unlit.length === 0,
  `every paper-frozen component on a dark band sits inside an open .wk-dark `
  + `(${litBands} band(s), ${RANGES.length} wrapper(s))`
  + `${unlit.length ? `; UNLIT: ${unlit.join(', ')}` : ''}`);
gate(/<div class="wrap wk-dark">/.test(OUT), 'the page states .wk-dark for its paper-authored components on dark ground');
/* AND THE MASTHEAD RAIL STATES ITS OWN INK RATHER THAN INHERITING A CALLER'S.
   The whole reason the /farm pattern is safe where figureRail was not. */
gate(/\.hc-rail-l\{[^}]*color:var\(--fg-2\)/.test(HUB_CSS) && /\.hc-rail-s\{[^}]*color:var\(--fg-3\)/.test(HUB_CSS),
  'the masthead rail states the dark-ground label and caption inks itself');

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
/* PAGE_CSS + HUB_CSS, never either alone: the hub's stylesheet is the two
   concatenated, and gating one of them would leave the other unread. */
const OWN_CSS = PAGE_CSS + HUB_CSS;
gate(!/--t-readout/.test(OWN_CSS), 'this page does not restate the readout scale');
gate(!/@keyframes/.test(OWN_CSS), 'this page adds no second @keyframes');
gate(!/--red\b/.test(OWN_CSS), 'no red in the page CSS');
gate(!/\bfilter:/.test(OWN_CSS), 'this page filters nothing — the partner mark renders as its own file');

/* 6. EXACTLY ONE THIRD-PARTY MARK, IN EXACTLY ONE BAND, IN COLOUR, AND THE
      PHOTOGRAPHS ARE STILL ALL MONOCHROME.
      This gate used to read "no logo file in this page's own bands" and it was
      right until ruling 42, when the owner asked for Niva Bupa's mark. What
      replaces it is not a weaker gate — it is a partition, and it is stricter in
      every direction the old one covered plus three it did not:

        · Swechha's own /brand/ files still may not appear in a band. The chrome
          carries the site mark; a band restating it is the logo wall the old
          gate was written against, and that half is unchanged.
        · There is ONE image on this page that is not a photograph, it is the
          exact path the data registers, and there is exactly one of it. A second
          partner logo — the Bupa Foundation mark somebody sources next year, a
          school's crest — fails here rather than in review.
        · It renders IN COLOUR. `duo`/`duo-dim` are the site's monochrome ramp
          for photography; on a trademark they are an alteration of somebody
          else's registered mark, and they would also flatten the cyan and amber
          that are the only reason the mark is recognisable.
        · Every photograph STILL carries the ramp. That is the half of the old
          rule that mattered and nothing above weakens it, so it is now asserted
          positively instead of being implied by "there are no other images".
        · The box is reserved. imgDim() returns '' for a file it cannot measure,
          so a renamed mark would otherwise ship silently without width/height.
        · And it is NOT IN THE MASTHEAD. The page opens on the work; the credit
          sits where the site already credits people. */
const brandRefs = [...new Set([...OWN.matchAll(/\/brand\/[^"']+/g)].map(m => m[0]))];
gate(brandRefs.length === 0,
  `no Swechha brand file in this page's own bands${brandRefs.length ? `; FOUND: ${brandRefs.join(', ')}` : ''}`);

const imgTags = [...OWN.matchAll(/<img\b[^>]*>/g)].map(m => m[0]);
const srcOf = (t) => (t.match(/\ssrc="([^"]+)"/) || [])[1] || '';
const photoTags = imgTags.filter(t => srcOf(t).startsWith('/images/photos/'));
const markTags = imgTags.filter(t => srcOf(t).startsWith('/images/partners/'));
const strayTags = imgTags.filter(t => !photoTags.includes(t) && !markTags.includes(t));

gate(markTags.length === 1 && srcOf(markTags[0]) === MARK.src,
  `exactly one partner mark on the page, and it is the path the data registers (${MARK.src})`
  + `${markTags.length === 1 ? '' : `; FOUND ${markTags.length}`}`);
gate(strayTags.length === 0,
  'every image on this page is either a photograph or the registered partner mark'
  + `${strayTags.length ? `; STRAY: ${strayTags.map(srcOf).join(', ')}` : ''}`);
gate(markTags.every(t => !/\bduo(-dim)?\b/.test(t)),
  'the partner mark carries no duo/duo-dim — a mark is not a photograph and renders in colour');
gate(markTags.every(t => /\swidth="\d+"/.test(t) && /\sheight="\d+"/.test(t)),
  'the partner mark reserves its box (width and height from imgDim, not hand-written)');
const unramped = photoTags.filter(t => !/\bduo(-dim)?\b/.test(t));
gate(photoTags.length > 0 && unramped.length === 0,
  `all ${photoTags.length} photographs still carry the monochrome ramp`
  + `${unramped.length ? `; UNRAMPED: ${unramped.map(srcOf).join(', ')}` : ''}`);

/* The mark's band, and the two type credits it was added to rather than
   substituted for. Sliced between the two band ids so "in #with" is a fact
   about position and not about the string appearing somewhere on the page. */
const WITH_BAND = OUT.slice(OUT.indexOf('id="with"'), OUT.indexOf('id="onward"'));
gate(WITH_BAND.includes(MARK.src), 'the mark sits inside the #with band, not the masthead');
const stillTyped = w.funders.filter(n => !WITH_BAND.includes(`>${esc(n)}</li>`));
gate(stillTyped.length === 0,
  `all ${w.funders.length} funders are still credited as type in #with — the logo adds, it does not replace`
  + `${stillTyped.length ? `; MISSING: ${stillTyped.join(', ')}` : ''}`);
gate(TEXT.includes(plain(MARK.holder)),
  `the trademark acknowledgement renders and names the licensee (${plain(MARK.holder)})`);
gate(WITH_BAND.includes('hc-mark-tm'), 'the acknowledgement sits with the mark, at .cap scale');

/* 7. NO BARE 1fr TRACK. Invisible to an overflow sweep; see PAGE_CSS. */
const bareFr = [...OWN_CSS.matchAll(/grid-template-columns:[^;}]*(?<![\w),])1fr\b[^;}]*/g)]
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

/* 9b. EVERY DELIVERABLE BAND'S OWN FIGURES REACH THE PAGE, IN THE BAND THAT
       AUTHORED THEM. Asserted by position and not just by presence: a figure
       group emitted into the wrong band would still be "on the page", and the
       whole reason these exist is that the numeral recurs beside the argument it
       belongs to. */
const lostFig = [];
for (const id of DELIVERABLES) {
  const figs = (BD[id] && BD[id].figures) || [];
  if (!figs.length) continue;
  const start = OUT.indexOf(`id="${id}"`);
  const bandHtml = start === -1 ? '' : OUT.slice(start, OUT.indexOf('</section>', start));
  for (const f of figs) {
    if (!bandHtml.includes(plain(f.value).replace(/\+$/, '<sup>+</sup>'))) lostFig.push(`${id}/${f.value}`);
  }
}
gate(lostFig.length === 0,
  `all ${BAND_FIG.length} deliverable-band figures render in their own band`
  + `${lostFig.length ? `; MISSING: ${lostFig.join(', ')}` : ''}`);

/* 9c. EVERY AUTHORED SENTENCE OF PROSE RENDERS — AND THIS GATE EXISTS BECAUSE
       IT DID NOT. `splitBand` takes its `right` column only when it has no
       frame, so both bands that carried a photograph dropped their authored
       `prose` in silence from the day this page was built: valid markup, passing
       schema, and two of the best paragraphs on the page never shipped. The
       composition was changed (see `deliverable()`), and this is what stops it
       silently reverting. Checked per band, by the sentence. */
const lostProse = [];
for (const id of DELIVERABLES) {
  const prose = (BD[id] && BD[id].prose) || [];
  const start = OUT.indexOf(`id="${id}"`);
  const bandHtml = start === -1 ? '' : OUT.slice(start, OUT.indexOf('</section>', start));
  for (const p of prose) if (!bandHtml.includes(p)) lostProse.push(`${id}: ${p.slice(0, 48)}...`);
}
gate(lostProse.length === 0,
  `every authored prose paragraph renders in its own band`
  + `${lostProse.length ? `; DROPPED: ${lostProse.join(' | ')}` : ''}`);

/* 9d. THE TYPE LADDER HAS NO HOLE IN THE MIDDLE OF IT, AND THAT IS THE WHOLE
       POINT OF THE RESTRUCTURE. The owner said the page does not convey scale.
       It was not the grounds — the alternation measured 60 per cent dark against
       the homepage's 64 with no paper touching paper, and the page already
       carried more running prose than the homepage. It was that the page ran
       104px display heads, then nothing until 42px, then nothing until 20.5px:
       the rungs at 69, 46 and 44 were all missing, and the largest numeral on it
       was the SMALLEST numeral treatment on the site. Four rungs are asserted
       here as elements, because a page can lose one of them to a data edit and
       nothing else would say so:
         · `.d1 rl w7-do-t` — the four deliverables at 43.2 -> 104px;
         · `.num hc-rail-v`  — the masthead rail at 34 -> 69.1px;
         · `.w7-pj-num`      — the reading pairs at 32 -> 46.1px;
         · `.d2`             — the one promoted health sentence at 24 -> 44px.
       `.readout` (99.2 -> 272px) stays refused and gate 5 still proves it. */
const LADDER = [
  ['the four deliverables at display scale', /class="d1 rl w7-do-t"/, 4],
  ['the masthead rail', /class="num hc-rail-v"/, PROG.figures.length],
  ['the reading pairs', /class="w7-pj-num rl"/, BAND_FIG.length],
  ['the promoted health sentence', /class="d2 hc-say"/, 1],
];
for (const [what, re, n] of LADDER) {
  const found = (OUT.match(new RegExp(re.source, 'g')) || []).length;
  gate(found === n, `${what}: ${found} of ${n} expected`);
}
/* AND THE HEALTH SENTENCE IS THE ONLY `.d2` ON THE PAGE. Used more than once it
   stops being a promotion, and used as a heading it is refused by the design
   language by name — the heading above it is the `.d1` that does that work. */
const d2s = [...OUT.matchAll(/class="[^"]*\bd2\b[^"]*"/g)].map(m => m[0]);
gate(d2s.length === 1 && d2s[0] === 'class="d2 hc-say"',
  `exactly one .d2 on the page and it is the health sentence${d2s.length === 1 ? '' : `; FOUND: ${d2s.join(', ')}`}`);

/* 9e. HEALTH CARRIES NO NUMERAL, AND IT IS THE OWNER'S SECOND INSTRUCTION.
       There are ZERO health statistics and zero citations in the proposal, the
       impact deck, the synopsis and the fellowship criteria — no AQI figure, no
       morbidity rate, no disease-burden claim, no WHO or CPCB reference. So no
       figure on this page may be labelled as a health measurement: every one of
       them counts students, schools, saplings, trips, gardens, modules,
       applications, fellows, states or rupees, and a figure whose label reached
       for a health outcome would be a number this programme never measured. */
const healthy = ALL_PUBLISHED.filter(f => /\b(health|respiratory|asthma|morbidity|disease|AQI|PM2\.?5|PM10)\b/i
  .test(plain(f.label)));
gate(healthy.length === 0,
  'no figure claims a health measurement — the sources carry none, so the argument is prose and one sentence'
  + `${healthy.length ? `; FOUND: ${healthy.map(f => `"${f.label}"`).join(', ')}` : ''}`);

/* 9f. THE FOUR DISPLAY ROWS OPEN THE FOUR BANDS. `kinds` is the page's index at
       display scale, so a row pointing at a band this build did not render is a
       104px control that does nothing — the same defect the section strip's own
       chips are gated against, one size class louder. */
const deadKind = BD.kinds.rows.filter(r => !r.href.startsWith('#') || !IDS.includes(r.href.slice(1)));
gate(deadKind.length === 0,
  `all ${BD.kinds.rows.length} display rows open a band on this page`
  + `${deadKind.length ? `; DEAD: ${deadKind.map(r => r.href).join(', ')}` : ''}`);
gate(BD.kinds.rows.length === DELIVERABLES.length
  && BD.kinds.rows.every((r, i) => r.href === `#${DELIVERABLES[i]}`),
  `the display rows are the four deliverables, in the order the page renders them`);

/* 9g. THE FELLOWSHIP IS NAMED THE GREEN FELLOWSHIP AND IS NOT DESCRIBED AS THE
       SCHOOLS' NEXT STAGE. This is the correction that prompted the rebuild: the
       ten were selected nationally by open call and were never school
       participants, and no source describes any pathway between the two. The
       page may say the word "Influence" once, because Swechha runs the
       fellowship under that name and the closing door reconciles the two names
       with it; what it may not do is imply continuity. */
gate(/\bGreen Fellowship\b/.test(TEXT), 'the page calls it the Green Fellowship');
const continuity = [
  /students?\s+(?:who\s+)?(?:then\s+)?(?:went|returned|go)\s+(?:back\s+)?(?:home|to their)/i,
  /graduat\w+\s+(?:in)?to\s+(?:the\s+)?fellow/i,
  /from (?:the )?(?:school|classroom)s? (?:in)?to (?:the )?fellow/i,
  /fellows?\s+(?:were|was)\s+(?:chosen|selected|drawn)\s+from\s+(?:the\s+)?(?:school|student)/i,
];
const implied = continuity.filter(re => re.test(TEXT));
gate(implied.length === 0,
  'nothing implies the fellows came out of the partner schools — two strands under one grant, not two stages'
  + `${implied.length ? `; MATCHED: ${implied.map(r => r.source).join(' | ')}` : ''}`);
const influences = (TEXT.match(/\bInfluence\b/g) || []).length;
gate(influences <= 1,
  `the operational name appears at most once (found ${influences}) — the page's own name for it is Green Fellowship`);

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
/* 15. NO GAP BAND, NO NAMED HOLE, NO CONFESSION — ASSERTED, BECAUSE THE OLD
       GATES ASSERTED THE OPPOSITE. Until 7 September 2026 this build proved
       that five holes rendered; the band is struck, so the assertion has to be
       inverted rather than deleted, or the next session that adds a `holes`
       array to programme.json gets a silent pass. Three checks, because there
       are three ways it comes back: the band id, `hole()`'s own markup, and
       the heading as prose. This is the same shape as build-stories-page.mjs's
       own reversal, which had asserted two named holes and now asserts none. */
gate(!/id="gaps"/.test(OUT), 'no gaps band on the page');
gate(!/class="p-hole"/.test(OWN), 'no named hole in this page\'s own bands');
gate(!/cannot say yet|do not settle/i.test(TEXT),
  'the page does not narrate what it cannot say — a hole in an external record is a fact, ours is not');

/* 16. THE RENDERED COLOUR OF EVERY KISSING RULE, RESOLVED THROUGH THE CASCADE
       AND MEASURED AGAINST ITS BAND'S GROUND. REFUSES BELOW 3:1.
       ─────────────────────────────────────────────────────────────────────
       THIS IS THE THIRD TIME THIS EXACT DEFECT HAS SHIPPED ON THIS PAGE. The
       figure rail's caption ink was the paper caption on a dark masthead
       (2.7:1). The split band's prose drop was the same shape. And on
       2026-09-07 the four display rows of `#kinds` measured 1.99:1 because
       WORK_CSS scopes their paper ink under a BAND ID and its dark override
       under three CLASSES — an id beats three classes, so the override that
       exists to prevent this never fired. Every one of the three read
       CORRECTLY in the source: the token named in the rule you find by grep is
       the right token, and the rule that loses is the one you do not think to
       look for. Gate 2 above cannot see any of them either, because in all
       three cases the component WAS inside its .wk-dark wrapper — the wrapper
       was there and lost the cascade.
       So this gate does not assert that a rule exists. It RESOLVES, for every
       .rl element the page actually wrote, which --rl-c declaration wins:
       it reads the stylesheet the page ships, matches every selector against
       that element's real ancestor chain, ranks by specificity then source
       order, follows the var() chain to a literal, composites any alpha over
       the band's declared ground and computes WCAG contrast. Below 3:1 is a
       failure. 3:1 is the non-text contrast minimum, which is the right floor:
       these are 2px strokes carrying no glyph.
       AND IT DOES THE SAME FOR THE FIGURE GROUP'S HAIRLINE, by token family
       rather than by ratio — this site's hairlines are 1.1:1 on paper and
       1.8:1 on dark BY DESIGN, so a ratio floor is the wrong instrument for
       them, but a dark-ground hairline token on a paper band (which is what
       #workshops and #actions shipped: 1.01:1, white on white) is a defect the
       same cascade resolver catches for free. */

/* The stylesheet this page actually ships, comments out, media blocks held
   aside. A media-scoped colour would be a colour that is right at one width
   and wrong at another, and the resolver below has no width — so rather than
   silently treating such a rule as unconditional, the media blocks are checked
   separately for the two properties this gate resolves, and finding one there
   is itself a failure. */
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

/* ═══ THE TEN FELLOW PAGES ═══════════════════════════════════════════════
   One page per file in data/healthy-cities/fellows/, up to four bands each: who
   they are and what they counted, what they did, who spoke, and the way on to
   the other nine. ONE OF THOSE FOUR IS CONDITIONAL — `voices`, where the report
   carries publishable direct speech — so seven pages run to four bands and
   three to three. A band with nothing in it is omitted rather than opened over
   a sentence saying so.

   ★ THERE IS NO `gaps` BAND. Each of these ten pages had one, headed "What we
   cannot say yet", and it was struck on 7 September 2026 with the hub's — see
   the note where the hub's band used to be. What those twenty-one sentences
   mostly described was the state of a Word document (broken Devanagari, blank
   objective fields, unticked urban/rural boxes, a spelling nobody could check),
   which is our filing rather than anybody's work. The programme facts wearing
   that voice were moved into the band they belong to and re-voiced: the
   orphanage unit into Anjali Choudhary's `did`, the wheat harvest that decided
   the Miyawaki planting days into that project's `aims`, the year's head start
   into S Vineeth Kumar's deck, the two Bilaspur fathers into Swapnil
   Chaurasiya's `did`, the zine's due date into Taniya Gill's, the youth
   implementers into Tanuz Kalita's, and Zaid, Ansh and Somya into Tawheed
   Zubair's, as three of the fourteen who ran it.

   ★ EACH PAGE BUILDS ITS OWN INDEX. The hub's four chips are #top, #schools,
   #fellows and #voices; two of those bands do not exist here. An in-page href
   to a missing id is `FAIL:no-such-id` to the WORK section's link census, and
   the frozen section strip silently drops the chip — so the visible result of
   borrowing the hub's index is a control strip where half the controls do
   nothing. The chips are derived from the bands this page actually rendered,
   and a gate below asserts every one of them resolves.

   ★ AND EACH PAGE BUILDS ITS OWN BAND CHAIN, because `voices` is conditional:
   a fellow whose report carries no publishable speech gets no quote band rather
   than a heading over nothing. bandChain re-derives the whole ground rhythm
   from whatever is on, which is why no chain is written down here either.

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
   three headings are identical on all ten pages — they are the template, the way
   onwardBand's own "Get involved" is — and moving them into programme.json
   would put them inside `bands`, where the hub's OMITTED line reads every key
   the hub did not render and would start reporting them as bands it dropped. */
const F_HEAD = {
  did: 'The work',
  voices: 'What people said',
  onward: 'The rest of the cohort',
};
/* The section strip's own words. Shorter than the heads where the head is long:
   the strip is a horizontally scrolling control at 940 and below, and it is the
   one place on the page where a label is competing for width. */
const F_CHIP = {
  top: 'The fellow', did: 'The work', voices: 'What people said',
  onward: 'The cohort',
};

/* ★ NO QUOTES MEANS NO BAND, AND THIS REPLACED A SENTENCE.
   Three of the ten reports carry no publishable direct speech, and those three
   pages used to open a `voices` band anyway and fill it with one shared
   sentence saying there was nothing to put in it. The copy standard strikes
   "empty-state confessions" outright: a hole in an external record may be
   stated as a fact about the record, never as an apology about our own page.
   So the band is OMITTED, which is the mechanism this generator already uses
   for the hub's `statement` band: bandChain re-derives the whole ground rhythm
   from whatever is on, the index chips are built from the same list, and the
   omission is PRINTED in the build note so it can never be silent.
   NOTHING ON THE PAGE SAYS SO, and that is the second half of the ruling. The
   one sentence went to the build log, not to the reader — a reader arriving on
   Swapnil Chaurasiya's page reads what he did and what changed in twenty-six
   households, and is owed no note about which fields of a report were filled
   in. Where somebody's own account IS the missing thing, the answer is to go
   and ask them again, not to print that we have not. */

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
    <div class="pic-body hc-rail-body">${dark(railBlock)}</div>`;

  /* ── BAND 2. THE WORK: WHAT IT SET OUT TO DO, THEN WHAT WAS DONE.
        The aims are a heading over a sentence each, which is exactly the ruled
        prose row's shape and the same component the hub's own `what` band uses.
        s-vineeth-kumar HAS EXACTLY ONE AIM, so nothing here may assume a pair:
        doRows renders one row as one row, and the schema's `.min(1)` plus the
        hub's data gate are what guarantee there is at least that. */
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
        page's own h1 repeated under every panel, so it is dropped.
        THE BAND IS BUILT ONLY WHERE THERE IS SOMETHING TO PUT IN IT — see the
        note above F_HEAD. Three of the ten fellows have no publishable quote,
        and on those pages `voices` never joins F_IDS, so this value is never
        read; guarded anyway rather than left to render an empty container. */
  fb.voices = (f.quotes || []).length ? [
    W.openBand('voices', F_HEAD.voices),
    `      <div class="hc-voices">\n${f.quotes.map(q => `        ${W.panel({
      name: q.speaker,
      p: `&ldquo;${q.text}&rdquo;`,
      cap: [q.role, q.place].filter(Boolean).join(' &middot; '),
      frame: q.frame || null,
    })}`).join('\n')}\n      </div>`,
  ] : null;

  /* ── BAND 4. THE WAY ON. The other nine, in the register the hub uses, each
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

  /* ONE OF THE FOUR BANDS IS CONDITIONAL, on the rule the whole file follows:
     a band opens where there is something to put in it and is omitted where
     there is not. `voices` needs a publishable quote. Derived rather than
     declared, so the omission note below cannot drift from the spine. */
  const F_IDS = ['top', 'did',
    ...((f.quotes || []).length ? ['voices'] : []),
    'onward'];
  const F_OMITTED = [
    ...((f.quotes || []).length ? [] : ['voices (no publishable quote in the report)']),
  ];
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
      + `${f.partners.length} partner(s), ${others.length} onward.`
      + (F_OMITTED.length ? ` OMITTED: ${F_OMITTED.join('; ')}.` : ''),
  });
  fellowPages.push({ slug: f.slug, bytes: FOUT.length });
  fbad += fellowGates({ f, OUT: FOUT, ids: F_IDS, index: F_INDEX, figs, others });
}

/* ═══ THE FELLOW PAGES' GATES ════════════════════════════════════════════
   The hub's, minus the four that are about the programme's own rail and its
   resolved-pointer voices band, plus the five that are about a person's page:
   every figure they published reaches it, every quote is verbatim, a page with
   no quote omits the band rather than confessing, nothing on the page narrates
   what our own record does not say, and the crumb back to the register row this
   page was opened from is present.
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
  /* AND NO PARTNER MARK ON A PERSON'S PAGE. Ruling 42 put Niva Bupa's logo in
     the HUB's `#with` band and nowhere else: a fellow's page is about a fellow,
     these ten pages have no `#with` band at all, and a mark reaching one could
     only be a copy-paste. Ten assertions cost nothing and the alternative is a
     grep somebody has to remember to run. */
  const partner2 = [...new Set([...OWN2.matchAll(/\/images\/partners\/[^"']+/g)].map(m => m[0]))];
  g(partner2.length === 0, `partner mark on a fellow's page (it belongs to the hub's #with band only): ${partner2.join(', ')}`);
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

  /* 6. EVERY QUOTE IS VERBATIM — AND A PAGE WITH NO QUOTE HAS NO VOICES BAND
        AT ALL. That second half is asserted in BOTH directions, because "the
        band is gone" and "the band is there with panels in it" are the only two
        correct states and a heading over nothing is what sits between them. */
  const unsaid = (f.quotes || []).filter(q => !HTML.includes(q.text));
  g(unsaid.length === 0, `quote(s) not rendered verbatim: ${unsaid.map(q => q.speaker).join(', ')}`);
  const hasVoices = (f.quotes || []).length > 0;
  g(HTML.includes('id="voices"') === hasVoices,
    hasVoices ? 'the voices band is missing on a fellow who has quotes'
      : 'a voices band was rendered for a fellow with no publishable quote — it must be omitted, not confessed');
  if (hasVoices) {
    const voicesBand = (HTML.split('id="voices"')[1] || '').split('</section>')[0];
    g(/class="wk-panel"/.test(voicesBand), 'the voices band renders no panel');
  }
  /* 6b. NO GAP BAND, NO NAMED HOLE, NO CONFESSION — AND THIS IS THE INVERSE OF
         WHAT USED TO BE CHECKED HERE. The old assertion was that every string
         in `holes` rendered; the band is struck, so the assertion is turned
         round rather than dropped, and a `holes` array re-added to a fellow
         file fails the schema AND this. Three ways it comes back: the band id,
         `hole()`'s markup, the heading as prose. */
  g(!/id="gaps"/.test(HTML), 'a gaps band was rendered');
  g(!/class="p-hole"/.test(OWN2), 'a named hole was rendered in this page\'s own bands');
  g(!/cannot say yet|does not settle|do not settle/i.test(TEXT2),
    'the page narrates what it cannot say — that is our record, not a fact about the work');

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
