/* ═══════════════════════════════════════════════════════════════════════════
   THE HOMEPAGE HERO'S FOUR READINGS BECOME A BUILD ARTEFACT
   ───────────────────────────────────────────────────────────────────────────
   D-24.5 recorded that making home.html a build artefact is "a real
   architectural change nobody has taken". This takes it for the part that
   matters and no further: the hero's four READINGS are written from the
   committed datasets. The design, the bands, the prose and the layout stay
   hand-maintained. A hero slide can no longer disagree with the dataset under
   it, which is the whole defect this closes.

   WHY IT WAS NEEDED, in one line each:
     · The air slide read 412 while /now/air read 387, for a day. D-24.1 fixed
       the TICKER for exactly this reason and left the hero.
     · The fire slide read "118 thermal detections, 7 days" when the dataset
       said 24 over 5 — and FIRMS near-real-time is capped at 5 days, so the
       window had never matched any data this repo holds.
     · The yamuna slide's 0.3 is in the dataset and was typed anyway — as it
       still is in build-situation-yamuna.mjs, which this file does not fix.
     · The monsoon slide contradicted ITSELF: 501 against 512, and a normal of
       396 against 434, on one screen.

   ★ IT INJECTS ONLY WHAT IT CAN DERIVE WITHOUT INVENTING A SCALE.
   Air gets its numeral, verdict, multiplier, six-pip band and its
   screen-reader sentence, because CPCB publishes the band scale and the limit.
   Yamuna and fire get their numeral, unit and sentence — their verdicts
   ("Nothing can breathe", "Below season") and band positions are editorial
   judgements on a scale no source publishes, so they are left alone rather
   than computed from an invented one. Monsoon gets its numeral only, and its
   unresolved normal is REPORTED on every run instead of being papered over.

   ★ THE CROSS-CHECK IS THE REAL GUARANTEE.
   After injecting, each hero figure is compared with the same figure as
   rendered on its own situation page. Two independently-built answers to one
   question, compared — the pattern this repo already uses for the anchor
   registry and the situation slugs. Drift becomes a failed build rather than
   something a reader notices first.

   ★ IT REFUSES TO WRITE ON ANY MISMATCH. Every replacement must match exactly
   once inside its own slide. A hand edit that moves the markup fails this
   build instead of being silently skipped, which is how a "sync" script ends
   up doing nothing for six months.

   ★ IT NEVER TOUCHES A LINE ABOVE THE STYLESHEET'S EXTRACTED RANGES.
   shell() pins home.html's CSS by line number (situation-shell.mjs:136-139,
   last range ending at 3033) and every generator in the repo refuses to write
   if those move. This script only ever edits inside <article id="h-*"> blocks,
   which begin well below that, and it asserts the file's line count is
   unchanged before writing.

   Usage:  node scripts/build-hero.mjs [--check]
           --check reports what would change and writes nothing.
   ═══════════════════════════════════════════════════════════════════════════ */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import * as S from './lib/situation-shell.mjs';

const CHECK = process.argv.includes('--check');
const HOME = join(S.V3, 'home.html');

const J = (f) => JSON.parse(readFileSync(join(S.ROOT, 'data', f), 'utf8'));

let bad = 0;
const fail = (m) => { console.error(`  FAIL ${m}`); bad++; };
const ok = (m) => console.log(`  ok   ${m}`);

/* ═══ THE READINGS, DERIVED ══════════════════════════════════════════════ */

/* CPCB's National AQI bands, in published order — the same list air-delhi.json
   carries and the same one the runtime fetch in home.html uses. */
const AQI_BANDS = ['Good', 'Satisfactory', 'Moderately Polluted', 'Poor', 'Very Poor', 'Severe'];

const AIR = J('air-delhi.json');
const YAM = J('yamuna-cpcb-2025.json');
const RAIN = J('rainfall-delhi.json');
const FIRE = J('fires-nw-india.json');

/* ── AIR ─────────────────────────────────────────────────────────────────── */
const airAqi = AIR.city_reading?.aqi;
const airBand = AIR.city_reading?.band;
const airLimit = AIR.aqiLimit;
if (typeof airAqi !== 'number' || !airBand || typeof airLimit !== 'number') {
  fail('air-delhi.json has no city_reading.aqi / .band / aqiLimit');
}
const airBandIdx = AQI_BANDS.indexOf(airBand);
if (airBandIdx < 0) fail(`air band "${airBand}" is not on CPCB's published scale`);
const airMult = (airAqi / airLimit).toFixed(1);

/* ── YAMUNA. The station, by name, out of the source table. ──────────────── */
const nizam = (YAM.stations || []).find((s) => /nizamuddin/i.test(s.station || ''));
if (!nizam) fail('yamuna-cpcb-2025.json has no Nizamuddin station');
const yamDo = nizam?.do?.min;
const yamLimit = YAM.limits?.do?.value;
if (typeof yamDo !== 'number') fail('the Nizamuddin row has no do.min');
if (typeof yamLimit !== 'number') fail('yamuna-cpcb-2025.json has no limits.do.value');
/* The floor matters to the sentence: 0.3 is what the method reports, so the
   true value is at or below it, and the slide says so rather than asserting
   0.3 as a measurement. */
const yamAtFloor = YAM.reporting_floor?.do === yamDo;

/* ── MONSOON. Reading only; the normal is unresolved by design. ─────────── */
const rainTotal = RAIN.reading?.total_mm;
if (typeof rainTotal !== 'number') fail('rainfall-delhi.json has no reading.total_mm');
const rainNormal = RAIN.normal_mm;

/* ── FIRE. VIIRS S-NPP, the sensor the slide names. ──────────────────────── */
const viirs = (FIRE.sensors || []).find((s) => s.id === 'VIIRS_SNPP_NRT');
if (!viirs) fail('fires-nw-india.json has no VIIRS_SNPP_NRT sensor');
const fireCount = viirs?.count;
const fireDays = FIRE.window?.days;
if (typeof fireCount !== 'number') fail('the VIIRS sensor row has no count');
if (typeof fireDays !== 'number') fail('fires-nw-india.json has no window.days');

if (bad) { console.error(`\nREFUSING TO WRITE: ${bad} data check(s) failed.`); process.exit(1); }

/* A readout renders its decimal point as its own span, so a value cannot be
   injected as plain text without losing the treatment. */
const readout = (n) => String(n).includes('.')
  ? String(n).replace('.', '<span class="dp">.</span>')
  : String(n);

/* ═══ THE EDITS, SCOPED TO ONE SLIDE EACH ════════════════════════════════ */
const SLIDES = [
  {
    id: 'h-air',
    figure: airAqi,
    edits: [
      [/(<span class="readout" aria-hidden="true">)[^<]*(?:<span class="dp">\.<\/span>[^<]*)?(<\/span>)/,
        `$1${readout(airAqi)}$2`, 'readout'],
      /* SURGICAL, NOT REGENERATED. The .sr sentence is the accessible mirror
         of the whole slide and carries editorial clauses the datasets do not
         hold — "Nothing can breathe", the state word. Rebuilding it from a
         template silently deleted them the first time this ran. So only the
         figures inside it move. */
      [/(<span class="sr">Delhi-NCR \/ Air quality index\. )[\d.,]+( AQI)/,
        `$1${airAqi}$2`, 'sentence: the numeral'],
      [/(24-hour rolling\. )[A-Za-z ]+(\.)/, `$1${airBand}$2`, 'sentence: the band'],
      [/(<p class="mult"><b>)[^<]*(<\/b>)/, `$1${airMult}&#215;$2`, 'multiplier'],
      [/(<p class="verdict[^"]*">)[^<]*(<\/p>)/, `$1${airBand}$2`, 'verdict'],
      [/(<div class="bands[^"]*" role="img" aria-label=")Band \d+ of 6, [^"]*(">)((?:<i[^>]*><\/i>){6})/,
        (m, a, b) => `${a}Band ${airBandIdx + 1} of 6, ${airBand}${b}`
          + Array.from({ length: 6 }, (_, k) => k < airBandIdx ? '<i class="on"></i>'
            : k === airBandIdx ? '<i class="on tip"></i>' : '<i></i>').join(''),
        'six-pip band scale'],
    ],
    crossCheck: { file: 'situation-air.html', re: /id="air-aqi">([0-9,]+)/, label: '/now/air' },
  },
  {
    id: 'h-yamuna',
    figure: yamDo,
    edits: [
      [/(<span class="readout" aria-hidden="true">)[^<]*(?:<span class="dp">\.<\/span>[^<]*)?(<\/span>)/,
        `$1${readout(yamDo)}$2`, 'readout'],
      [/(<span class="sr">Yamuna at Nizamuddin \/ Dissolved oxygen\. )[\d.,]+( milligrams)/,
        `$1${yamDo}$2`, 'sentence: the numeral'],
      /* `\d+(?:\.\d+)?` and NOT `[\d.]+` — the greedy character class ate the
         sentence's full stop, turning "minimum of 5." into "minimum of 5
         Nothing can breathe." A number pattern must not be able to consume
         punctuation that belongs to the prose around it. */
      [/(against a legal minimum of )\d+(?:\.\d+)?/, `$1${yamLimit}`, 'sentence: the legal minimum'],
    ],
    crossCheck: null,
  },
  {
    id: 'h-monsoon',
    figure: rainTotal,
    edits: [
      [/(<span class="readout" aria-hidden="true">)[^<]*(?:<span class="dp">\.<\/span>[^<]*)?(<\/span>)/,
        `$1${readout(rainTotal)}$2`, 'readout'],
    ],
    crossCheck: null,
  },
  {
    id: 'h-fire',
    figure: fireCount,
    edits: [
      [/(<span class="readout" aria-hidden="true">)[^<]*(?:<span class="dp">\.<\/span>[^<]*)?(<\/span>)/,
        `$1${readout(fireCount)}$2`, 'readout'],
      [/(<span class="unit">)thermal detections, \d+ days(<\/span>)/,
        `$1thermal detections, ${fireDays} days$2`, 'unit and window'],
      [/(<span class="sr">North India \/ Active fire detections\. )\d+( thermal detections, )\d+( days)/,
        `$1${fireCount}$2${fireDays}$3`, 'sentence: the count and the window'],
    ],
    crossCheck: null,
  },
];

/* ═══ APPLY ══════════════════════════════════════════════════════════════ */
let src = readFileSync(HOME, 'utf8');
const linesBefore = src.split('\n').length;
let changed = 0;

console.log('HERO READINGS');
for (const slide of SLIDES) {
  const open = src.indexOf(`id="${slide.id}"`);
  if (open < 0) { fail(`${slide.id} is not in home.html`); continue; }
  const start = src.lastIndexOf('<article', open);
  const end = src.indexOf('</article>', open);
  if (start < 0 || end < 0) { fail(`${slide.id} has no enclosing <article>`); continue; }

  let block = src.slice(start, end);
  const before = block;
  for (const [re, to, label] of slide.edits) {
    const hits = block.match(new RegExp(re.source, re.flags.replace('g', '') + 'g'));
    if (!hits || hits.length !== 1) {
      fail(`${slide.id}: ${label} matched ${hits ? hits.length : 0} times, expected exactly 1 — the markup moved`);
      continue;
    }
    block = block.replace(re, to);
  }
  if (block !== before) changed++;
  src = src.slice(0, start) + block + src.slice(end);
  ok(`${slide.id.padEnd(10)} ${slide.figure}${block === before ? '  (already in step)' : '  (updated)'}`);
}

/* ── THE FLOOR CLAUSE MUST MATCH THE DATA ───────────────────────────────
   0.3 is the value CPCB's method REPORTS, not a measurement: the true figure is
   at or below it, and the slide says so. That clause is editorial and stays
   hand-written, so it is checked rather than generated — if the dataset ever
   reports a DO above its own reporting floor, an "at or below the detection
   limit" sentence becomes a false claim about a real measurement. */
{
  const i = src.indexOf('id="h-yamuna"');
  const block = i < 0 ? '' : src.slice(src.lastIndexOf('<article', i), src.indexOf('</article>', i));
  const saysFloor = /at or below the detection limit/.test(block);
  if (yamAtFloor && !saysFloor) {
    fail('h-yamuna: the reading sits at the reporting floor and the sentence does not say so');
  } else if (!yamAtFloor && saysFloor) {
    fail(`h-yamuna: the sentence says "at or below the detection limit" but ${yamDo} is above the floor of ${YAM.reporting_floor?.do}`);
  } else {
    ok(`h-yamuna   the floor clause matches the data (${yamAtFloor ? 'at the floor' : 'above the floor'})`);
  }
}

/* ── THE CROSS-CHECK ────────────────────────────────────────────────────── */
console.log('\nCROSS-CHECK AGAINST THE SITUATION PAGES');
for (const slide of SLIDES) {
  if (!slide.crossCheck) {
    console.log(`  n/a  ${slide.id.padEnd(10)} no single comparable figure on its situation page`);
    continue;
  }
  const other = readFileSync(join(S.V3, slide.crossCheck.file), 'utf8');
  const m = other.match(slide.crossCheck.re);
  if (!m) { fail(`${slide.id}: could not read the comparable figure from ${slide.crossCheck.file}`); continue; }
  const theirs = Number(String(m[1]).replace(/,/g, ''));
  if (theirs !== slide.figure) {
    fail(`${slide.id}: hero says ${slide.figure}, ${slide.crossCheck.label} says ${theirs} — one of them is stale`);
  } else {
    ok(`${slide.id.padEnd(10)} agrees with ${slide.crossCheck.label} at ${theirs}`);
  }
}

/* ── WHAT THIS BUILD DELIBERATELY DID NOT DO ────────────────────────────── */
if (rainNormal === null) {
  console.log('\nNAMED HOLE, reported every run until it is settled:');
  console.log('  The monsoon slide states its seasonal normal twice and differently — '
    + (RAIN.normal_candidates || []).map((c) => `${c.value}mm (${c.stated_in})`).join(' vs ') + '.');
  console.log('  data/rainfall-delhi.json carries normal_mm: null, so no normal is injected. '
    + 'IMD is not wired (a prior decision), so this needs the owner\'s figures.');
}

if (bad) {
  console.error(`\nREFUSING TO WRITE: ${bad} check(s) failed. The hero is unchanged.`);
  process.exit(1);
}

const linesAfter = src.split('\n').length;
if (linesAfter !== linesBefore) {
  console.error(`\nREFUSING TO WRITE: the line count moved ${linesBefore} -> ${linesAfter}. `
    + 'shell() pins this stylesheet by line range and every generator would break.');
  process.exit(1);
}

if (CHECK) {
  console.log(`\n--check: ${changed} slide(s) would change. Nothing written.`);
} else {
  writeFileSync(HOME, src);
  console.log(`\n${changed} slide(s) updated, ${linesAfter} lines, line count unchanged. All checks pass.`);
}
