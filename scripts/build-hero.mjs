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
/* ── TWO FILES, AND THE DISTINCTION IS THE WHOLE OF AD-28 §7 HERE. ────────
   HOME is the hand-maintained source, `design/home.html`. It keeps every
   comment it has ever had, its line count may not move, and this script edits
   it in place exactly as it always did.
   SHIP is `public/_pages/v3/home.html`, which is now a BUILD ARTEFACT — the
   source with its HTML and CSS comments stripped and its script's ledger ids
   redacted. D-24.5 recorded that making home.html a build artefact is "a real
   architectural change nobody has taken"; this takes the half of it that AD-28
   forces and no more. The DESIGN is still hand-maintained. What is generated is
   only the copy that ships.
   WHY IT COULD NOT BE DONE IN PLACE: seven CSS ranges in situation-shell.mjs
   and work-shell.mjs pin this file by absolute line number, all of them above
   3033, and stripping comments moves every line below the first one. */
const HOME = S.HOME_SRC;
const SHIP = join(S.V3, 'home.html');

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
/* AD-27.6 clause 1. THE COMMITTED READING'S OWN HOUR, so the first paint can
   say what it is instead of "Committed reading." — a true sentence that named
   nothing a reader could check. The honesty vocabulary is that a reading
   carries its provenance AND its hour (BRANDING §3.4). Derived here rather
   than typed, for the same reason the numeral is: a hand-typed hour is wrong
   the first time the dataset is refreshed and nothing catches it. */
const ob = AIR.observed;
if (!ob || typeof ob.hh !== 'number' || typeof ob.mi !== 'number') {
  fail('air-delhi.json has no observed.hh / observed.mi — the hero states the observation hour');
}
const pad2 = (n) => String(n).padStart(2, '0');
const airHour = ob ? `${pad2(ob.hh)}:${pad2(ob.mi)}` : '';
/* AD-27.6-A. THE STAMP CARRIES ITS DATE, NOT ONLY ITS HOUR.
   "Observed 10:00 IST." is only true on the day it was built. Measured on
   23 August: the page had been built from a 22 August observation and was
   still telling every reader "Observed 10:00 IST", which reads as this
   morning. An hour without a date is a claim the page cannot keep once the
   build is a day old — and the build going stale is precisely the failure
   this pass is hardening against, so the stamp has to survive it. Same shape
   as /api/air's own observedLabel() ("02:00 IST, 23 August 2026"), so the
   homepage, /now/air and the route all print one format. */
const AIR_MON = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
if (ob && (typeof ob.d !== 'number' || typeof ob.m !== 'number' || typeof ob.y !== 'number')) {
  fail('air-delhi.json observed has no y / m / d — the hero stamps the observation date');
}
const airStamp = ob ? `${airHour} IST, ${ob.d} ${AIR_MON[ob.m - 1]} ${ob.y}` : '';

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
      /* ONE RULE FOR BOTH, because they are one fact. data-committed is the
         attribute the runtime upgrade compares against before it touches a
         digit (AD-27.6 clause 2), so an attribute left behind by a partial
         edit would make every load look like a change and reinstate the exact
         flash this ruling removes. Writing them together makes that
         impossible. */
      [/(<span class="readout" data-committed=")[^"]*(" aria-hidden="true">)[^<]*(?:<span class="dp">\.<\/span>[^<]*)?(<\/span>)/,
        `$1${airAqi}$2${readout(airAqi)}$3`, 'readout, and the committed-value attribute beside it'],
      [/(<span class="s-hero-prov">)[^<]*(<\/span>)/,
        `$1Observed ${airStamp}.$2`, 'provenance: the committed observation stamp'],
      /* THE STATION IS PART OF THE READING, NOT DECORATION. A city's AQI is
         its WORST station, so the station moves whenever the worst one does —
         and it did within the hour this was written, Anand Vihar to
         Jahangirpuri. The runtime script used to write this line and nothing
         else did, so retiring the repaint left the homepage naming one monitor
         while /now/air, off the same dataset, named another. Measured, and
         closed here: the same value, written by the build, from the same
         file. Only the locality — the text before the first comma — as the
         script did, because "Jahangirpuri, Delhi - DPCC" in this sentence
         would repeat "Delhi" three words after "CPCB continuous monitor". */
      [/(<span class="s-hero-loc">, )[^<]*(<\/span>)/,
        `$1${String(AIR.city_reading.station).split(',')[0].trim()}$2`, 'provenance: the station'],
      /* THE PROSE CLAUSE IS THE MULTIPLIER IN WORDS, so it is written from the
         same arithmetic as .mult and not left to a hand edit. It was not, and
         it drifted: the slide shipped "3.9 times the limit" beside a .mult of
         "3.1×", two statements of one division on one screen. The runtime
         script used to paper over it by rewriting the clause on every load;
         now that nothing repaints (AD-27.6-A), the build has to be right. */
      [/(<span class="s-hero-cut">)[\d.]+( times the limit)/,
        `$1${airMult}$2`, 'prose clause: the multiplier in words'],
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
    /* `[^>]*` AND NOT `>` — AD-27.6 clause 2 puts data-committed on the
       numeral of EVERY page that runs the /api/air upgrade, /now/air included,
       so the tag this cross-check reads legitimately grew an attribute and the
       old anchored pattern stopped matching. A cross-check that fails because
       the other page gained an attribute is a cross-check that will be deleted
       by the next person; it matches the id, not the tag's exact shape. */
    crossCheck: { file: 'situation-air.html', re: /id="air-aqi"[^>]*>([0-9,]+)/, label: '/now/air' },
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
    /* THE NORMAL IS STATED ONLY WHEN IT IS SETTLED (owner, 22 August).
       The slide gave two different normals — 396 in its sentence, 434 in its
       limit line — so it stops stating one at all until `normal_mm` is filled
       in. Supplying the figure in the dataset flips both lines back
       automatically; nothing here needs editing again.

       AND IT NAMES NO HOLE (AD-28, 23 August). The limit line used to read
       "No legal threshold. The normal for these dates is not confirmed here."
       — the second sentence was an apology about our page, and the owner
       struck that style site-wide the next day (§2.3: a hole in external data
       may be stated as a fact about the data, never as an apology about the
       page). /act and the Record band lost their versions of the same device
       in the same pass. "No legal threshold." is a fact about the world and
       stands on its own; do not re-attach a second sentence to it.

       THE VERDICT SURVIVES, and that is derived rather than assumed: 501 is
       above BOTH candidate normals, so "Above normal" holds whichever turns
       out to be right. If a future reading falls between them the check below
       fails, because then the word would depend on the unsettled figure. */
    edits: [
      [/(<span class="readout" aria-hidden="true">)[^<]*(?:<span class="dp">\.<\/span>[^<]*)?(<\/span>)/,
        `$1${readout(rainTotal)}$2`, 'readout'],
      [/(<span class="sr">Delhi \/ Rainfall, season to date\. )[\d.,]+( millimetres since 1 June)(?:, against a normal of [\d.,]+ for the same dates)?/,
        rainNormal === null
          ? `$1${rainTotal}$2`
          : `$1${rainTotal}$2, against a normal of ${rainNormal} for the same dates`,
        'sentence: the reading, and the normal only if settled'],
      [/(<span class="limit">)[^<]*(<\/span>)/,
        rainNormal === null
          ? '$1No legal threshold.$2'
          : `$1Normal to ${RAIN.reading?.as_of_label || 'date'} is ${rainNormal}mm.$2`,
        'limit line: the normal, or the named hole'],
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

/* ═══ THE STATE CHIP, FROM THE REGISTER ══════════════════════════════════
   The fourth consumer of situation-shell.mjs's cadence(). Read that comment
   for why: on 23 August this deck's Air slide said Periodic while /now said
   LIVE about the same reading from the same dataset, because the word was
   typed into design/home.html by hand and nothing derived it.

   IT IS INJECTED FOR THE SAME REASON THE READINGS ARE. A hand-typed cadence
   is wrong the first time a source changes how it delivers, and nothing
   catches it — which is precisely what happened. Now the word comes from
   each situation's own dataset, so the deck cannot contradict the card on
   /now or the badge on the situation page.

   Each slide already links to exactly one situation, so the mapping is the
   href, restated. If a fifth slide is added without an entry here the build
   fails rather than shipping an unstated cadence. */
const HERO_CADENCE = {
  'h-air': 'air', 'h-yamuna': 'yamuna', 'h-monsoon': 'climate', 'h-fire': 'fire',
};
for (const slide of SLIDES) {
  const id = HERO_CADENCE[slide.id];
  if (!id) fail(`${slide.id} has no entry in HERO_CADENCE, so its state chip cannot be derived`);
  const word = S.cadence(id);
  const cls = S.STATES[word];
  /* Title Case, because that is how this deck has always set the chip — the
     shell-built pages use .tag in caps. verify-final.mjs:284 knows both. */
  const shown = word.charAt(0) + word.slice(1).toLowerCase();
  slide.edits.push([
    /(<p class="state )[a-z-]+("><i><\/i>)[^<]*(<\/p>)/,
    `$1${cls}$2${shown}$3`, 'state chip: the cadence word and its class'],
  );
}

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

/* ── "ABOVE NORMAL" MUST HOLD UNDER EVERY CANDIDATE NORMAL ──────────────
   While the normal is unsettled, the verdict may only stand if it is true of
   all the candidates. 501 is above both 396 and 434, so it stands. A reading
   that fell between them would make the word depend on the figure nobody has
   confirmed, and that is a failure rather than a judgement call. */
if (rainNormal === null) {
  const cands = (RAIN.normal_candidates || []).map((c) => c.value).filter((v) => typeof v === 'number');
  if (!cands.length) {
    fail('rainfall-delhi.json has no normal_mm and no normal_candidates to test the verdict against');
  } else if (!cands.every((v) => rainTotal > v)) {
    fail(`h-monsoon: "Above normal" does not hold for every candidate normal (${rainTotal} vs ${cands.join(', ')})`);
  } else {
    ok(`h-monsoon  "Above normal" holds under every candidate normal (${cands.join(', ')})`);
  }
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

/* ── THE TICKER'S AIR CELL IS A READING TOO (AD-27.6-A) ─────────────────
   IT WAS THE LAST HAND-TYPED AQI ON THE SITE and it was wrong: the cell read
   387 while the hero four hundred lines above it read 311 and /now/air read
   311. Nobody saw it because the D-24.1 runtime script overwrote the cell on
   every load — so the defect was invisible with JavaScript on and shipped in
   the markup with JavaScript off. AD-27.6-A retires that script (nothing on
   this page may repaint a reading), which turns an invisible defect into a
   visible one unless the build writes the cell. So the build writes the cell.

   THE ARIA LABEL MOVES WITH THE NUMBER, both or neither: it hardcodes the
   value, so updating one and not the other hands a screen reader 387 while
   the screen says 311 — the same class of bug one level down.
   THE RED IS THE BREACH, not a decoration, so `is-over` follows the reading
   rather than staying where a previous value left it.

   This is the one edit outside a slide's <article>, so it is applied to the
   whole file rather than through the SLIDES loop, and it carries the same
   matched-exactly-once rule everything else here does. */
{
  const over = airAqi > airLimit;
  const TICKER = [
    [/(id="tk-air" href="\/now\/air" aria-label="Delhi's air, )[\d.,]+( air quality index, )(?:over|within) the limit(")/,
      `$1${airAqi}$2${over ? 'over' : 'within'} the limit$3`, 'ticker: the aria-label'],
    [/(<span class="s-ticker-v)(?: is-over)?(" id="tk-air-v"><b>)[^<]*(<\/b>)/,
      `$1${over ? ' is-over' : ''}$2${airAqi}$3`, 'ticker: the figure and its breach class'],
  ];
  for (const [re, to, label] of TICKER) {
    const hits = src.match(new RegExp(re.source, 'g'));
    if (!hits || hits.length !== 1) {
      fail(`${label} matched ${hits ? hits.length : 0} times, expected exactly 1 — the markup moved`);
      continue;
    }
    src = src.replace(re, to);
    ok(`${'tk-air'.padEnd(10)} ${label}`);
  }
}

/* ── THE TICKER HEAD CARRIES NO CLOCK, AND THIS IS WHAT KEEPS IT THAT WAY
   (AD-27.6-C) ─────────────────────────────────────────────────────────
   THE DEFECT THIS CLOSES. The head shipped `data-at="07:00"` on
   `.s-ticker-stamp` and rendered "Saturday, 22 August 2026, 07:00 IST" over
   an air cell reading 307 — the 03:00 IST, 23 August observation. A day and
   four hours behind its own contents, because the hour was hard-coded and
   at() puts a clock time that has not arrived yet on yesterday. That was
   sound when the strip was rebuilt once a day at a fixed hour. AD-27.6-A
   rebuilds air HOURLY, so a fixed clock cannot follow the reading.

   WHY A GATE RATHER THAN AN INJECTION. Writing the freshest hour in here on
   every build would keep the stamp in step with the air cell, and it is what
   the obvious fix looks like — but it would keep asserting one read time over
   six cadences (hourly, monthly grab, seasonal, 2001-2025 cumulative,
   completed year, and a record that is not a reading at all). AD-05 R4 took
   the LIVE dot off this same line for exactly that reason. So the clock is
   GONE, and the only thing left to enforce is that it stays gone: an absent
   stamp cannot drift from the air cell, and a stamp that cannot be added back
   without failing the build cannot quietly return in six months.

   IT READS THE HEAD, NOT THE WHOLE FILE. The hero's two dated readings use
   data-at legitimately and are outside this block. */
{
  const open = src.indexOf('<div class="s-ticker-head">');
  /* COMMENTS STRIPPED FIRST, and that is not a loophole — it is the only way
     the removal can be documented where it happened. The note beside this head
     quotes the deleted `data-at="07:00"`, the stamp's class and the wrong date
     it rendered, because that is the evidence for why it is gone. A gate that
     fired on its own explanation would be paid off by deleting the
     explanation, which is the opposite of what it is for. Markup is what
     reaches the reader, so markup is what is tested. */
  const head = open < 0 ? ''
    : src.slice(open, src.indexOf('<div class="s-ticker-frame">')).replace(/<!--[\s\S]*?-->/g, '');
  if (!head) {
    fail('ticker head: <div class="s-ticker-head"> is not in home.html — the gate cannot run');
  } else {
    const MONTHS = /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\b/;
    const banned = [
      [/data-at\s*=/, 'a data-at attribute'],
      [/s-ticker-stamp/, 'the .s-ticker-stamp element'],
      [/s-ticker-date/, 'the .s-ticker-date element'],
      [/\b(?:[01]?\d|2[0-3]):[0-5]\d\b/, 'a clock time'],
      [MONTHS, 'a month name'],
    ].filter(([re]) => re.test(head));
    if (banned.length) {
      fail('ticker head: it carries ' + banned.map(([, what]) => what).join(' and ')
        + '. AD-27.6-C: no page-level read time may appear over this strip — it mixes six '
        + 'cadences and no single hour is true of them. Each cell links to the page that '
        + 'dates its own reading. If a date genuinely belongs here, overturn AD-27.6-C first.');
    } else {
      ok('ticker head no clock, no date, no data-at (AD-27.6-C)');
    }
  }

  /* AND THE SENTENCE THAT REPLACED THE CLOCK IS A CHECKABLE CLAIM, so it is
     checked. "Each reading is dated on its own page" is only true while every
     reading cell is a link — five of the six; the Impact slot is a record,
     not a reading, which is what the count line beside it already says. */
  const cells = [...src.matchAll(/<a class="s-ticker-cell[^"]*"[^>]*?href="([^"]+)"/g)].map((m) => m[1]);
  const readings = cells.filter((h) => h.startsWith('/now/'));
  if (readings.length < 5) {
    fail(`ticker head: the head says "Each reading is dated on its own page" but only `
      + `${readings.length} of the ${cells.length} cells link to a situation page that carries one`);
  } else {
    ok(`ticker cells  ${readings.length} reading cells link to a dated page, ${cells.length - readings.length} record cell`);
  }
}

/* ── THE ORGANIZATION JSON-LD (AD-27.50) ────────────────────────────────
   THE SAME TECHNIQUE AS THE READINGS ABOVE, for the same reason: one line
   substituted between two sentinels, so the line count cannot move and the
   structured data cannot drift from the dataset. lib/org.ts's emitter sits on
   app/page.tsx, which is rewritten to home.html before React runs — so until
   now the site shipped no structured data at all.
   MINIFIED TO ONE LINE, and the substitution is asserted to match exactly once.
   A hand edit that reformats the block across two lines fails this build rather
   than being silently skipped. */
{
  const ORG = J('org-jsonld.json');
  const jsonld = ORG.jsonld;
  if (!jsonld || jsonld['@type'] !== 'NGO') {
    fail('data/org-jsonld.json has no jsonld object of @type NGO');
  }
  /* TWO STRUCK FACTS, ASSERTED ABSENT. Both have been re-imported into this
     repository once already by a session acting in good faith, which is why
     they are checked rather than trusted. G-4 struck the phone number from the
     site; the owner replaced info@swechha.in with the general address site-wide
     on 22 August. Structured data is on the site. */
  const flat = JSON.stringify(jsonld);
  if (/telephone/i.test(flat)) fail('org-jsonld.json carries a telephone — G-4 struck the number from the site');
  if (flat.includes('info@swechha.in')) {
    fail('org-jsonld.json carries info@swechha.in, which the owner replaced site-wide on 22 August');
  }
  const line = `<script type="application/ld+json">${JSON.stringify(jsonld)}</script>`;
  const re = /(AD-27\.50 ORGANIZATION JSON-LD — START[\s\S]*?-->\n)<script type="application\/ld\+json">[\s\S]*?<\/script>/;
  const hits = src.match(new RegExp(re.source, 'g'));
  if (!hits || hits.length !== 1) {
    fail(`the Organization JSON-LD sentinel block matched ${hits ? hits.length : 0} times in home.html, `
      + 'expected exactly 1 — the sentinels moved or the script tag is no longer one line');
  } else {
    const before = src;
    src = src.replace(re, `$1${line}`);
    ok(`org JSON-LD    ${JSON.stringify(jsonld).length} chars${src === before ? '  (already in step)' : '  (updated)'}`);
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
    /* NAME WHICH ONE IS STALE, AND NAME THE FIX. This check has one predictable
       failure mode and it is not drift: it is BUILD ORDER. The hero reads the
       dataset directly and the situation page is a file on disk, so whenever
       air-delhi.json refreshes, running build:hero before build:situation-air
       compares a new figure against a page that has not been rebuilt yet and
       stops the run. The daily data-refresh workflow did exactly that — hero
       first, situations second — and went red on most days it had anything to
       report, which is how a real gate becomes a notification people mute.
       So the message says which page to rebuild rather than leaving the reader
       to work out which of two numbers is the new one. */
    fail(`${slide.id}: hero says ${slide.figure}, ${slide.crossCheck.label} says ${theirs} — one of them is stale. `
      + `If ${slide.figure} is the figure in the dataset, ${slide.crossCheck.label} has not been rebuilt yet: `
      + `run its generator first, then this one. Air's is \`npm run build:situation-air\`.`);
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

/* ── THE UNSOURCED "THREE KILOMETRES" CLAUSE IS DELETED (AD-28) ──────────
   The air slide used to end "Schools in this ward are three kilometres from
   the monitor that recorded it." This script reported it as a named hole on
   every run because it has no entry in SOURCE-FACTS against any station, and
   it got worse rather than better: a city's AQI is its WORST station, so the
   governing monitor moves with the reading — Anand Vihar to Jahangirpuri
   inside one hour on 23 August — and one distance cannot be right for both.
   It is gone from home.html rather than reported forever. The slide works
   without it: the multiple of the limit is the fact, and the clause was
   decoration on top of a number that did not need it. The check below refuses
   to let it back in.
   The reporting habit is not the fix. A build that prints "this sentence is
   unverifiable" every run for a fortnight and ships it anyway has found a
   defect and chosen not to act on it. */
{
  const UNSOURCED = /three kilometres from the monitor|kilometres from the monitor that recorded/i;
  if (UNSOURCED.test(src)) {
    console.error('\nREFUSING TO WRITE: the unsourced "three kilometres from the monitor" clause '
      + 'is back in home.html. It has no entry in SOURCE-FACTS against any station, and the '
      + 'governing monitor changes hour to hour, so no single distance can be correct. '
      + 'If a real distance is ever sourced, it has to name its station.');
    bad++;
  }
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

/* ── THE SHIPPED PAGE, STRIPPED (AD-28 §7) ──────────────────────────────
   Written on EVERY run, not only when a slide changed: the source can be
   hand-edited without this script touching a reading, and if the artefact were
   only rewritten on a change the two would drift silently — which is precisely
   the failure mode the hero cross-check above exists to stop.

   THE TAG COUNTS ARE CHECKED BECAUSE `shipDocument()` FINDS `<style>` AND
   `<script>` BODIES BY REGEX. A literal `</script>` inside a JS string would
   end a match early and the page would ship truncated. Counting the tags on
   both sides is the cheap total check for that, and it fails the build rather
   than writing the result. */
const countTags = (h) => ['<style', '</style>', '<script', '</script>', '<body', '</html>']
  .map((t) => (h.match(new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')) || []).length)
  .join('/');
const ship = S.shipDocument(src);
if (countTags(ship) !== countTags(src)) {
  console.error(`\nREFUSING TO WRITE: the strip changed the document's tag counts `
    + `(${countTags(src)} -> ${countTags(ship)}). shipDocument() finds <style> and <script> `
    + 'bodies by regex, so a literal </script> inside a JS string ends a match early and '
    + 'truncates the page. Find it and move it out of the string.');
  process.exit(1);
}
for (const [re, what] of [
  [/SOURCE-FACTS/, 'a SOURCE-FACTS citation'],
  [/§/, 'a section-mark citation'],
  [/\bAD-2\d/, 'an AD-2x ruling reference'],
  [/\bD-0\d/, 'a D-0x ruling reference'],
  [/\bW-1\d/, 'a W-1x ruling reference'],
]) {
  const m = re.exec(ship);
  if (m) {
    console.error(`\nREFUSING TO WRITE: ${what} (${JSON.stringify(m[0])}) survived the strip and `
      + `would reach the reader (AD-28 §7). Context: `
      + JSON.stringify(ship.slice(Math.max(0, m.index - 80), m.index + 80).replace(/\s+/g, ' ')));
    process.exit(1);
  }
}

if (CHECK) {
  console.log(`\n--check: ${changed} slide(s) would change. Nothing written.`);
  console.log(`  the shipped page would be ${ship.length.toLocaleString('en-IN')} bytes, `
    + `down from the source's ${src.length.toLocaleString('en-IN')}.`);
} else {
  writeFileSync(HOME, src);
  writeFileSync(SHIP, ship);
  console.log(`\n${changed} slide(s) updated, ${linesAfter} lines, line count unchanged. All checks pass.`);
  console.log(`  source  design/home.html            ${src.length.toLocaleString('en-IN')} bytes, comments intact`);
  console.log(`  shipped public/_pages/v3/home.html  ${ship.length.toLocaleString('en-IN')} bytes, AD-28 clean`);
}
