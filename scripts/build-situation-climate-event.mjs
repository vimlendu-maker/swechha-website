// AD-16 — situation-climate-event.html. EIGHT bands. PAN-INDIA. Crisp.
//
// ★ THE READING IS A RECORD, NOT A FORECAST.
// Same decision as the heat page: a record is true on every day of the year,
// where "this season so far" is only interesting for four months. So the hero is
// the wettest 24 hours in the archive, measured against IMD's own top rainfall
// class — a real value against a published boundary.
//
// ★ AND IT COUNTS DEATHS FROM FIVE ROWS OF ONE OFFICIAL TABLE.
// The client asked for landslides, cloudbursts, flash floods and deaths. Four of
// those five things have a national number and one does not:
//   deaths        — NCRB, five named causes, 3,594 in 2024
//   landslides    — NCRB publishes landslide DEATHS, not landslide COUNTS
//   extreme rain  — countable here, against IMD's published day-classes
//   cloudbursts   — NOT COUNTED, and the reason is on the page: IMD's definition
//                   is 100 mm in one hour, and a 9 km reanalysis cannot resolve
//                   it. A zero from the wrong instrument is not a zero.
//   flash floods  — no public national register exists
import * as S from './lib/situation-shell.mjs';
import { seo } from './lib/seo-register.mjs';
import { loadEvents, currentEvent } from './lib/climate-events.mjs';
import { renderBanner, renderQuiet, CE_CSS, CE_BANNER_CSS, CE_TIME_JS } from './lib/climate-event-render.mjs';
const { esc, n0, n1, compact, opener, tabs, hole, kd, KIND_LEGEND, ARROW, MON, MON3,
  stateChip, measureRow, measureHead, disclose, crumb, siblings } = S;

const sh = S.shell();

/* ═══ DATA ═══════════════════════════════════════════════════════════════ */
const CL = S.J('climate-india.json');
const DTH = S.J('deaths-ncrb-2024.json');
const ATTN = S.J('attention-climate-event.json');
const NEWS = S.J('coverage-climate-event.json');

/* What the event detector saw last time it looked. Written on EVERY run,
   including runs that found nothing — see the note in B.situation. Absent
   until the detector has run at least once, so every read of it falls back. */
const CHECKED = (() => {
  try { return S.J('climate-events/checked.json'); } catch { return null; }
})();
const CHECKED_MS = CHECKED?.fetched?.epochMs || NEWS.fetched?.epochMs || Date.now();

const CAT = CL.categories;
const NAT = CL.national;
const ST = CL.stations;
const REC = NAT.wettest_day_on_record;
const CE = DTH.per_situation.climate_event;
const CONS = NAT.consensus;
// The five causes this page owns, from the one table, biggest first.
const CAUSES = CE.causes.map(c => DTH.causes.find(x => x.cause === c))
  .filter(Boolean).sort((a, b) => b.y2024 - a.y2024);

if (!ST.length) { console.error('No stations in climate-india.json. Refusing to build.'); sh.bad++; }

const recMult = +(REC.mm / CAT.extremely_heavy).toFixed(1);

/* ★ THE HERO IS THE MOST RECENT COMPLETE YEAR, NOT THE ALL-TIME RECORD.
   The first build led on the wettest 24 hours in the archive — 336 mm at Patna
   on 30 June 1996. It was the true maximum and it read as stale, which the
   client caught immediately: a page about a worsening climate cannot open on a
   thirty-year-old number.
   The heat page could lead on its record because that record is 2024. This one
   cannot. So the reading is the LAST COMPLETE YEAR's worst city, measured as
   DAYS OVER IMD'S PUBLISHED THRESHOLD — recent, countable, and against a
   notified boundary rather than against a normal. The archive record stays on
   the page, in the panel beside it, with its date in plain sight. */
const LASTYR = ST[0].last_complete.year;
const worstCity = ST.reduce((a, b) =>
  (b.last_complete.extreme_days > a.last_complete.extreme_days ? b : a));
const WC = worstCity.last_complete;
const wcDep = worstCity.normal?.annual_mm
  ? +((WC.annual_mm - worstCity.normal.annual_mm) / worstCity.normal.annual_mm * 100).toFixed(0) : null;
// The wettest single day anywhere in that same recent year.
const recentWettest = ST
  .map(s => ({ name: s.name, state: s.state, ...(s.last_complete.wettest_day || {}) }))
  .filter(w => w.mm != null)
  .reduce((a, b) => (b.mm > a.mm ? b : a));
const fmtDate = (d) => {
  if (!d) return '—';
  const [y, m, dd] = String(d).split('-').map(Number);
  return `${dd} ${MON[m - 1]} ${y}`;
};
// Stations whose season so far is above their own normal. Computed, never typed.
const wetNow = ST.filter(s => (s.season_to_date?.departure_pct ?? 0) > 0);

/* ── AD-36. "SEASON SO FAR" NAMES ITS CUTOFF. This page is built ahead of
   time, so "so far" is read by somebody whose so-far is later than the
   build's, with nothing on screen saying how much later. The cutoff is in
   the data -- every station carries season_to_date.to -- and it was never
   rendered.
   ONE DATE OR NONE. The short form goes on each of the twelve rows and the
   full form, with the year, once in the standfirst, because twelve repeats
   of a year is noise. If the stations ever disagree about their cutoff there
   is no single honest date to print, so this falls back to the old wording
   rather than picking one station's and implying it covers the rest. */
const SEASON_TO = (() => {
  const tos = [...new Set(ST.map(s => s.season_to_date?.to).filter(Boolean))];
  if (tos.length !== 1) return null;
  const [m, dd] = tos[0].split('-').map(Number);
  if (!m || !dd) return null;
  const y = CL.fetched?.epochMs
    ? new Date(CL.fetched.epochMs + 19800000).getUTCFullYear() : null;
  return { short: `${dd} ${MON[m - 1].slice(0, 3)}`, full: y ? `${dd} ${MON[m - 1]} ${y}` : null };
})();

/* ═══ THE CURRENT EVENT, IF THERE IS ONE ══════════════════════════════════
   Loaded and VALIDATED before anything renders — lib/climate-events.mjs
   throws on a dossier carrying a figure without a source, so a malformed
   event fails this build rather than reaching the page. That is the same
   contract the rest of this repo's data has: malformed content is a build
   failure, not a silently-degraded page.

   currentEvent() also applies the shelf life. An event stops holding the top
   of the page fourteen days after its last verified update, without anybody
   having to remember to take it down — a hero still shouting about last
   month's flood is its own kind of stale. */
const EVENTS = loadEvents();
const CURRENT = currentEvent(EVENTS);
/* This page shows only the COMPACT banner; the full board, and the hazard
   context pack behind it, live on /now/climate-event/<slug>. Keeping the two
   apart is the whole point of the split — this page's clock is annual and the
   board's is half-hourly, and they were fighting for the same screen. */

/* ═══ BAND SEQUENCE — id, tier class, ground hex ══════════════════════════
   ★ ONE BAND INSERTED, NOTHING REORDERED, AND THAT IS DELIBERATE.
   The obvious move was to haul the news band up next to the hero. It cannot
   be done: only three grounds exist on this page and groundChain() forbids
   two adjacent bands sharing one, so promoting `said` forces a clash that can
   only be resolved by repainting three other bands. The news instead reaches
   the top THROUGH the situation band, which carries the three most recent
   register items in its quiet state and is built out of headlines in its
   active state. Same goal, no repaint, and the register below is untouched. */
const BANDS = [
  ['situation', 'dark-2 t2', '#151512'],
  ['top',      't1',        '#0D0D0B'],
  ['strip',    '',          '#151512'],
  ['people',   't2',        '#0D0D0B'],
  ['measured', 'paper t2',  '#F3F2F0'],
  ['cities',   'dark-2 t3', '#151512'],
  ['trend',    't2',        '#0D0D0B'],
  ['said',     'dark-2 t2', '#151512'],
  ['act',      't3',        '#0D0D0B'],
];
const clashes = S.groundChain(BANDS);

const INDEX = [
  ['Right now', '#situation'],
  ['The record', '#top'], ['Who it kills', '#people'],
  ['What counts as extreme', '#measured'], ['Twelve cities', '#cities'],
  ['What is changing', '#trend'], ['What is being said', '#said'],
  ['What you can do', '#act'],
];

/* ═══ BANDS ══════════════════════════════════════════════════════════════ */
const B = {};

/* RIGHT NOW. The band this page was missing.
   Two states and no third: an event holds the slot, or the freshest thing the
   archive genuinely knows does. There is deliberately no "nothing to report"
   empty state — a blank box reads as a broken page, and this one is never
   blank because the season is always doing something. */
B.situation = () => (CURRENT
  ? renderBanner(CURRENT)
  : renderQuiet({
    wetNow: wetNow.length,
    total: ST.length,
    seasonTo: SEASON_TO?.full || null,
    /* WHEN THE FEEDS WERE LAST READ, not when this file was written. The
       detector stamps data/climate-events/checked.json on every run whether
       or not it found anything, because "we looked and there was nothing" and
       "we have not looked since Tuesday" are different statements and the
       page must not conflate them. Falling back to the news register's own
       fetch stamp keeps this honest if the detector has never run. */
    checkedMs: CHECKED_MS,
    /* ★ SORTED BY DATE, BECAUSE THE LABEL SAYS "LATEST".
       Google News returns its register by its own relevance model, not by
       recency, so the first three items are routinely weeks apart — the first
       build of this band printed items from 20 August, 20 July and 29 June
       under the word "Latest". Anything with an unparseable date sorts last
       rather than being dropped: an item is still evidence, it just cannot
       claim to be the newest one. */
    headlines: (NEWS.register.items || [])
      .map((i) => ({ ...i, ms: i.published ? Date.parse(i.published) || 0 : 0 }))
      .sort((a, b) => b.ms - a.ms)
      .slice(0, 3)
      .map((i) => ({
        title: i.title, link: i.link, publisher: i.publisher, published: shortDate(i.published),
      })),
  }));

B.top = () => `    <div class="pic ht p2-pic">
      <img class="duo" src="/images/photos/monsoon-flooded-fields.jpg" alt="Flooded fields under monsoon cloud"${S.imgDim('/images/photos/monsoon-flooded-fields.jpg')} fetchpriority="high" style="--op:70% 45%">
      <div class="pic-over"><div class="wrap">
        <h1 class="d1">India&rsquo;s extreme rain</h1>
      </div></div>
    </div>
    <div class="pic-body"><div class="wrap p2-hero">
${crumb('climate')}
      <div class="p2-top">
        <p class="lbl p2-method">Every reading against its published limit. Every gap named.</p>
        <p style="margin:0"><span class="tag tag-season">Year round</span></p>
      </div>
      <div class="p2-cols">
      <div class="p2-read breach">
        <p class="state p2-state">${stateChip(S.cadence('climate'))}<span class="sr"> &mdash; an archive, not a live gauge</span></p>
        <p class="readout rl">${WC.extreme_days}<span class="c-u">days</span></p>
        <p ${kd(CL.kind)}>over IMD&rsquo;s heavy-rain threshold in ${LASTYR} &middot; ${esc(worstCity.name)}, ${esc(worstCity.state)}</p>
        <p class="verdict bad">${n0(Math.round(WC.annual_mm))} mm in the year${wcDep != null ? `, ${wcDep > 0 ? '+' : ''}${wcDep}% on its normal` : ''}</p>
        <p class="limit">IMD calls <b>${n1(CAT.heavy)} mm</b> in 24 hours heavy rain.
          <b>Crossed ${WC.extreme_days} times in one year</b> &mdash; and no rule caps how often.</p>
        <p class="cap p2-src">${ST.length} grid points, ${esc(CL.source.upstream)}.
          <a class="lk" href="#measured">What counts as extreme</a>.</p>
      </div>
      <div class="p2-nat">
        <p class="lbl p2-nat-h">A year&rsquo;s rain in an afternoon</p>
        <p class="c-plain">Across these ${ST.length} cities there is <b>more rain, and more days
          heavy enough to cross IMD&rsquo;s threshold</b>. What this data does <i>not</i> show is rain
          getting more concentrated &mdash; that is on the page too.</p>
        <p class="c-plain">A flood is not a weather event. It is rainfall meeting a decision about
          where to build.</p>
        <p class="cap p-hole"><b>Annual rainfall rose at ${CONS.annual_mm.up} of these
          ${ST.length} cities, and extreme-rain days at ${CONS.extreme_days.up}.</b>
          ${wetNow.length} of ${ST.length} are already above their own normal this season.</p>
        <p class="cap c-rec"><b>The heaviest 24 hours in the whole archive</b> is
          ${n0(Math.round(REC.mm))} mm at ${esc(REC.name)} on ${esc(fmtDate(REC.date))} &mdash;
          ${recMult}&times; IMD&rsquo;s top class, and <b>thirty years ago</b>. The record is not the
          story here; the frequency is. ${LASTYR}&rsquo;s heaviest day anywhere on this list was
          ${n0(Math.round(recentWettest.mm))} mm at ${esc(recentWettest.name)}.</p>
        <p style="margin:0"><a class="act" href="#cities">All ${ST.length} cities ${ARROW}</a></p>
      </div>
      </div>
      <p style="margin:0"><a class="act" href="#people">Who it kills ${ARROW}</a></p>
    </div></div>`;

B.strip = () => {
  const cells = [
    ['Deaths', n0(CE.deaths), `India, ${DTH.year}`, 'people', true],
    ['Lightning alone', n0(DTH.causes.find(c => c.cause === 'Lightning').y2024), 'the biggest killer', 'people', true],
    ['Landslide deaths', `+${n1(DTH.causes.find(c => c.cause === 'Landslide').change_pct)}%`, `on ${DTH.compare_year}`, 'people', true],
    ['Wetter cities', `${CONS.annual_mm.up}/${ST.length}`, `rainfall rose since ${ST[0].halves[0].from}`, 'trend', false],
  ];
  return `    <div class="wide p-strip-in">
      ${cells.map(([l, v, s, href, red]) => `<a class="p-cell" href="#${href}">
        <span class="p-cell-v${red ? ' is-red' : ''}">${v}</span>
        <span class="lbl p-cell-l">${l}</span><span class="cap p-cell-s">${s}</span></a>`).join('\n      ')}
      <p class="cap p-strip-note">One reading, one label. <a class="lk" href="#measured">What is behind them</a>.</p>
    </div>`;
};

/* WHO IT KILLS. Five rows of one table, and lightning is the surprise. */
B.people = () => {
  const maxC = Math.max(...CAUSES.map(c => c.y2024));
  const rows = CAUSES.map(c => measureRow({
    name: `${esc(c.cause)}<i>${c.change_pct > 0 ? 'up' : c.change_pct < 0 ? 'down' : 'flat'} on ${DTH.compare_year}</i>`,
    valuePct: c.y2024 / maxC * 100,
    value: n0(c.y2024),
    times: c.change_pct == null ? '' : `${c.change_pct > 0 ? '+' : ''}${n1(c.change_pct)}%`,
    over: c.change_pct > 0,
    aria: `${c.cause}, ${c.y2024} recorded deaths in ${DTH.year}`,
  })).join('\n        ');
  const light = DTH.causes.find(c => c.cause === 'Lightning');
  const other = CAUSES.filter(c => c.cause !== 'Lightning').reduce((a, c) => a + c.y2024, 0);

  return `${opener('people', 'Who it kills', `${n0(CE.deaths)} people in ${DTH.year}, from five named causes in one official table. Four of the five rose.`)}
    <div class="wrap">
      <div class="c-two">
        <div class="c-two-c">
          <p class="num c-big is-red">${n0(CE.deaths)}</p>
          <p ${kd('counted')}>deaths from flood, landslide, lightning, torrential rain and cyclone, ${DTH.year}</p>
          <p class="cap">${esc(CE.derivation)}</p>
        </div>
        <div class="c-two-c">
          <p class="num c-big is-red">${n0(light.y2024)}</p>
          <p ${kd('counted')}>of them from lightning alone</p>
          <p class="cap"><b>More than the other four causes put together</b> (${n0(other)}). Lightning
            is the largest single killer in India&rsquo;s whole table of deaths from forces of nature,
            and it is almost never the subject of a climate story.</p>
        </div>
      </div>
${KIND_LEGEND}
      <p class="lbl c-lbl">The five causes, ${DTH.year}</p>
      ${measureHead(['Cause', 'Recorded deaths', 'Deaths', `vs ${DTH.compare_year}`])}
      <div class="c-rows">
        ${rows}
      </div>
      <p class="c-note"><b>Landslide deaths rose
        ${n1(DTH.causes.find(c => c.cause === 'Landslide').change_pct)}% and flood deaths
        ${n1(DTH.causes.find(c => c.cause === 'Flood').change_pct)}% in one year.</b> Cyclone deaths
        went from ${n0(DTH.causes.find(c => c.cause === 'Cyclone').y2023)} to
        ${n0(DTH.causes.find(c => c.cause === 'Cyclone').y2024)} &mdash; a small number moving a long
        way, which is what a single landfall looks like in an annual table.</p>
      <p class="cap c-cap"><b>These are recorded deaths, and they are a floor.</b> A death enters
        this table only if an authority attributed it to a named cause and filed it. And
        ${n0(DTH.causes.find(c => /other than above/i.test(c.cause)).y2024)} deaths in the same table
        &mdash; ${DTH.causes.find(c => /other than above/i.test(c.cause)).pct}% &mdash; have no named
        cause at all.</p>
${hole('There is no national count of landslide EVENTS, flash floods or cloudbursts. NCRB counts deaths by cause; nobody publishes how many times the ground moved. So this page can tell you how many people a landslide killed and not how many landslides there were.')}
      <p style="margin:0"><a class="act" href="#measured">What counts as extreme ${ARROW}</a></p>
    </div>`;
};

/* WHAT COUNTS AS EXTREME. On paper. The cloudburst hole lives here. */
B.measured = () => `${opener('measured', 'What counts as extreme', 'IMD classifies a rainfall day, and the boundaries are its own. So an extreme rainfall day is a countable event, not an adjective.')}
    <div class="wrap">
      ${tabs('What counts as extreme', [
  ['The three classes', `<div class="c-panel">
          <div class="c-cats">
            <div class="c-cat"><span class="c-cat-v">${n1(CAT.heavy)}</span><span class="lbl c-cat-l">heavy</span><span class="cap c-cat-x">mm in 24 hours</span></div>
            <div class="c-cat"><span class="c-cat-v">${n1(CAT.very_heavy)}</span><span class="lbl c-cat-l">very heavy</span><span class="cap c-cat-x">mm in 24 hours</span></div>
            <div class="c-cat is-top"><span class="c-cat-v">${n1(CAT.extremely_heavy)}</span><span class="lbl c-cat-l">extremely heavy</span><span class="cap c-cat-x">mm and above</span></div>
          </div>
          <p>Every &ldquo;extreme rain day&rdquo; on this page is a day that crossed
            ${n1(CAT.heavy)} mm at that grid point. Nothing here is a judgement about whether the
            rain was unusual &mdash; it is a comparison against a notified boundary.</p>
          <p class="c-warn"><b>${esc(CAT.note)}</b> That distinction is why a day-class cannot tell
            you whether a street flooded.</p>
        </div>`],
  ['Why the whole year', `<div class="c-panel">
          <p class="c-def-h">Not just the monsoon</p>
          <p>${esc(CL.window_note)}</p>
          <p>The monsoon total is still reported for every city, and the season-to-date figure is
            compared with <b>the same calendar dates</b> in the ${esc(ST[0].normal.window)} normal
            &mdash; never with a whole-season normal, which always makes a season look dry.</p>
        </div>`],
  ['What is not counted', `<div class="c-panel">
          <p class="c-def-h">Three things, named rather than estimated</p>
          <ol class="c-ol">
            ${CL.holes.map(h => `<li>${esc(h)}</li>`).join('\n            ')}
          </ol>
          <p class="c-warn"><b>A zero from the wrong instrument is not a zero.</b> A 9&nbsp;km
            reanalysis asked how many 100&nbsp;mm hours India had would answer &ldquo;almost
            none&rdquo;, and that answer would be about the model, not the country.</p>
        </div>`],
])}
      <p class="cap c-src-p"><b>Sources.</b> Categories: ${esc(CAT.authority)}. Readings:
        <a class="lk" href="${esc(CL.source.url)}">${esc(CL.source.name)}</a>. Deaths:
        <a class="lk" href="${esc(DTH.source.url)}">${esc(DTH.source.publication)}</a>, ${esc(DTH.source.table)}.</p>
      <p style="margin:0"><a class="act" href="#cities">Twelve cities ${ARROW}</a></p>
    </div>`;

/* TWELVE CITIES. */
B.cities = () => {
  const byExtreme = [...ST].sort((a, b) => b.last_complete.extreme_days - a.last_complete.extreme_days);
  const maxD = Math.max(...ST.map(s => s.last_complete.extreme_days), 1);
  const rows = byExtreme.map(s => {
    const L = s.last_complete;
    const dep = s.season_to_date?.departure_pct;
    return measureRow({
      name: `${esc(s.name)}<i>${esc(s.state)}${dep != null ? ` &middot; season to ${SEASON_TO ? SEASON_TO.short : 'date'} ${dep > 0 ? '+' : ''}${n1(dep)}% on normal` : ''}</i>`,
      valuePct: L.extreme_days / maxD * 100,
      value: String(L.extreme_days),
      times: `${n0(Math.round(L.annual_mm))}mm`,
      over: L.extreme_days > 0,
      aria: `${s.name}, ${L.extreme_days} extreme rain days in ${L.year}, ${L.annual_mm} millimetres`,
    });
  }).join('\n        ');
  const L0 = ST[0].last_complete;
  return `${opener('cities', 'Twelve cities', `Days over IMD's heavy-rain threshold in ${L0.year}, and the year's total beside it.${SEASON_TO?.full ? ` Season-to-date figures beside each city run to ${SEASON_TO.full}.` : ''}`)}
    <div class="wrap">
      ${measureHead(['City', `Days over ${n1(CAT.heavy)} mm`, 'Days', `${L0.year} total`])}
      <div class="c-rows">
        ${rows}
      </div>
      <p class="cap c-cap"><b>${esc(NAT.total_note)}</b>
        ${NAT.total_extreme_days_last_year} station-days across ${ST.length} cities in ${L0.year}.
        ${NAT.stations_omitted?.length
      ? `${NAT.stations_omitted.length} requested station(s) did not answer and are omitted, not backfilled.`
      : 'All requested stations answered.'}</p>
      ${disclose('Every city against its own normal',
    `<div class="c-tbl">
            <div class="c-tr is-head"><span class="lbl">City</span><span class="lbl">${L0.year}</span>
              <span class="lbl">Normal</span><span class="lbl">Rainy days</span>
              <span class="lbl">Top 5 days</span><span class="lbl">Wettest ever</span></div>
            ${[...ST].sort((a, b) => b.last_complete.annual_mm - a.last_complete.annual_mm).map(s => {
      const L = s.last_complete;
      return `<div class="c-tr"><span class="c-td-y">${esc(s.name)}</span>
              <span>${n0(Math.round(L.annual_mm))}</span><span>${n0(Math.round(s.normal.annual_mm))}</span>
              <span>${L.rainy_days}</span><span>${L.top5_share_pct == null ? '—' : n1(L.top5_share_pct) + '%'}</span>
              <span>${n0(Math.round(s.records.wettest_day.mm))}</span></div>`;
    }).join('\n            ')}
          </div>
          <p class="cap c-cap">All figures in millimetres unless marked. &ldquo;Top 5 days&rdquo; is
            the share of the year&rsquo;s rain that fell on its five wettest days &mdash; one
            division on two measured numbers, and the closest this page gets to describing how
            concentrated the rain is.</p>`)}
      <p style="margin:0"><a class="act" href="#trend">What is changing ${ARROW}</a></p>
    </div>`;
};

/* WHAT IS CHANGING. Consensus across stations. */
B.trend = () => {
  const labels = {
    annual_mm: 'Total rainfall',
    extreme_days: 'Days over the heavy threshold',
    very_heavy_plus: 'Very heavy days and above',
    top5_share_pct: 'Share falling in the five wettest days',
  };
  const rows = Object.entries(CONS).map(([k, c]) => {
    const total = c.up + c.down + c.flat;
    const w = c.up > c.down ? 'up' : c.down > c.up ? 'down' : 'flat';
    return `<div class="c-cons${w === 'up' ? ' is-up' : w === 'down' ? ' is-down' : ''}">
          <span class="c-cons-n">${labels[k] || k}</span>
          <span class="c-cons-b" role="img" aria-label="up at ${c.up} cities, down at ${c.down}, flat at ${c.flat}">
            <i class="is-up" style="--w:${c.up / total * 100}%"></i><i class="is-flat" style="--w:${c.flat / total * 100}%"></i><i class="is-down" style="--w:${c.down / total * 100}%"></i></span>
          <span class="c-cons-v">${c.up}<i>&uarr;</i></span>
          <span class="c-cons-x">${c.down}<i>&darr;</i></span></div>`;
  }).join('\n        ');
  const h = ST[0].halves;
  return `${opener('trend', 'What is changing', 'More rain, in more extreme days. The concentration is the part that is not moving.')}
    <div class="wrap">
      <p class="c-lead">Four measures, the first eighteen years against the last, counted across all
        ${ST.length} cities. <b>The pale bar is cities where it rose</b>, the grey where it did not
        move, the dark where it fell.</p>
      <div class="c-conss">
        ${rows}
      </div>
      <p class="c-note"><b>Rainfall is up at ${CONS.annual_mm.up} of ${ST.length} cities and extreme
        days at ${CONS.extreme_days.up}.</b> But the share arriving in the five wettest days is
        <b>down</b> at ${CONS.top5_share_pct.down} of them &mdash; so this dataset shows more rain
        and more extreme days without showing rain getting more concentrated. Both things are on the
        page because both are what it measured.</p>
      <p class="cap c-cap"><b>Counted as cities, never averaged.</b> ${esc(NAT.consensus_note)}
        And ${esc(CL.kind_reason)}</p>
      <p class="lbl c-lbl">And who is looking</p>
      ${(() => {
    const mm = ATTN.months.filter(m => !m.partial);
    const peakV = Math.max(...mm.map(m => m.views));
    const bars = mm.slice(-36).map(m => {
      const mo = Number(m.month.slice(4, 6));
      return `<i class="c-ab${m.views === ATTN.peak.views ? ' is-peak' : ''}${mo >= 6 && mo <= 9 ? ' is-season' : ''}" style="--h:${Math.max(1, Math.round(m.views / peakV * 100))}%" title="${MON3[mo - 1]} ${m.month.slice(0, 4)}: ${n0(m.views)} views"></i>`;
    }).join('');
    return `<div class="c-att" role="img" aria-label="Monthly attention over three years, peaking at ${n0(ATTN.peak.views)} views">${bars}</div>
      <p class="cap c-cap">Views of the English Wikipedia article on climate change in India. Lighter
        bars are monsoon months. Peak <b>${n0(ATTN.peak.views)}</b> in
        ${esc(monthName(ATTN.peak.month))}, floor <b>${n0(ATTN.floor.views)}</b> in
        ${esc(monthName(ATTN.floor.month))} &mdash; <b>${ATTN.swing}&times;</b>. It measures
        attention, never rainfall.</p>`;
  })()}
      <p style="margin:0"><a class="act" href="#said">What is being said ${ARROW}</a></p>
    </div>`;
};

B.said = () => `${opener('said', 'What is being said', 'The register. Reporting is tagged as reporting.')}
    <div class="wrap">
      <p class="c-lead">${n0(NEWS.register.count)} items from
        ${n0(Object.keys(NEWS.register.publishers || {}).length)} publishers. A headline is evidence
        that something was said, never that it is true.</p>
      ${disclose(`Read the ${n0(Math.min(40, NEWS.register.count || 0))} most recent items`,
  `<ol class="p-news-ol c-reg">
            ${(NEWS.register.items || []).slice(0, 40).map(i => `<li class="p-news-r"><a class="p-news-o" href="${esc(i.link)}">${esc(i.title)}</a><span class="cap p-news-m">${esc(i.publisher || 'unattributed')}${i.published ? ` &middot; ${esc(shortDate(i.published))}` : ''}</span></li>`).join('\n            ')}
          </ol>
          <p class="cap c-pub"><b>Publishers:</b> ${Object.entries(NEWS.register.publishers || {}).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${esc(k)} (${v})`).join(' &middot; ')}</p>`)}
      <p class="c-note"><b>Coverage follows the flood, not the rainfall.</b> A 300&nbsp;mm day in a
        place with drainage is a wet afternoon. The same day where a lake was built over is a
        disaster. The rain is the same; only one of them gets a headline &mdash; and it is the
        second one that tells you something about a city.</p>
      <p style="margin:0"><a class="act" href="#act">What you can do ${ARROW}</a></p>
    </div>`;

B.act = () => `${opener('act', 'What you can do', 'Rainfall is weather. A flood is a decision.')}
    <div class="wrap">
      <div class="p-act">
        <div class="p-act-c">
          <p class="lbl">Find out what was there before</p>
          <p>Most urban flooding happens where water used to go &mdash; a lake, a nala, a
            floodplain. City master plans and old survey maps are public. If your street floods,
            something was built on the way out.</p>
          <p style="margin:0"><a class="act" href="/now/yamuna">The Yamuna floodplain ${ARROW}</a></p>
        </div>
        <div class="p-act-c">
          <p class="lbl">Lightning is the one you can act on today</p>
          <p>${n0(DTH.causes.find(c => c.cause === 'Lightning').y2024)} deaths a year, mostly
            outdoors, mostly avoidable with thirty minutes of shelter. It is the largest killer on
            this page and the cheapest to reduce.</p>
          <p style="margin:0"><a class="act" href="/work">What we work on ${ARROW}</a></p>
        </div>
        <div class="p-act-c">
          <p class="lbl">Ask who signed it off</p>
          <p>Every building on a floodplain has an approval with a name on it. That is a public
            record, and it is a more useful question than how much it rained.</p>
          <p style="margin:0"><a class="act" href="/act">Support the work ${ARROW}</a></p>
        </div>
      </div>
      <p class="cap c-close">Every figure here is public, dated and reproducible from the source
        named beside it &mdash; and the three things that could not be counted are named where they
        would have gone.</p>
${S.citeBlock('climate')}
${S.closing('climate')}
${siblings('climate')}
${S.newsletter('climate')}
    </div>`;

/* ═══ HELPERS ════════════════════════════════════════════════════════════ */
function monthName(m) { return `${MON3[Number(String(m).slice(4, 6)) - 1]} ${String(m).slice(0, 4)}`; }
function shortDate(s) {
  const m = /(\d{1,2})\s+(\w{3})\w*\s+(\d{4})/.exec(String(s));
  return m ? `${m[1]} ${m[2]} ${m[3]}` : String(s).slice(0, 16);
}

/* ═══ PAGE CSS — layout only ═════════════════════════════════════════════ */
const PAGE_CSS = `
/* ══ AD-16 — THE CLIMATE EVENT PAGE'S OWN BLOCK ═══════════════════════════
   Tokens, chrome, tabs, disclosure and measure row all inherited. Every
   component states its colour for its own ground rather than inheriting.
   ═══════════════════════════════════════════════════════════════════════ */
.c-u{font-size:.3em;vertical-align:.6em;color:var(--fg-3);font-weight:500;margin-left:.08em}
.c-plain{font-size:clamp(15px,1.05vw,17px);line-height:1.6;color:var(--fg-2);max-width:46ch;margin:0 0 .7em}
.c-lead{font-size:clamp(16px,1.15vw,18.5px);line-height:1.55;max-width:60ch;margin:0 0 1.1em;color:var(--fg-2)}
.paper .c-lead{color:var(--ink-2)}
.c-note{border-left:2px solid var(--hair);padding:2px 0 2px 16px;margin:clamp(20px,2.2vw,30px) 0;
  font-size:clamp(15px,1.05vw,17px);line-height:1.58;color:var(--fg-2);max-width:60ch}
.paper .c-note{border-left-color:var(--rule-2);color:var(--ink-2)}
.c-cap{color:var(--fg-3);max-width:60ch;margin:.8em 0 0}
.c-rec{color:var(--fg-3);max-width:46ch;margin:.9em 0 0;border-top:1px solid var(--hair-2);padding-top:.8em}
.paper .c-cap{color:var(--ink-3)}
.c-lbl{display:block;color:var(--fg-3);margin:clamp(22px,2.4vw,32px) 0 .6em}
.paper .c-lbl{color:var(--ink-3)}
.c-big{font-size:clamp(40px,4.6vw,64px);line-height:.94;margin:0 0 .16em;font-variant-numeric:tabular-nums}
.c-src-p{max-width:62ch;color:var(--fg-3);margin:clamp(18px,2vw,26px) 0 clamp(20px,2.2vw,28px)}
.paper .c-src-p{color:var(--ink-3)}
.c-close{max-width:60ch;color:var(--fg-3);margin:clamp(22px,2.4vw,32px) 0 0}
.c-two{display:grid;grid-template-columns:1fr;gap:clamp(18px,2vw,30px)}
.c-two-c{border-top:2px solid var(--hair);padding-top:14px}
.c-two-c .cap{color:var(--fg-3);max-width:46ch}
.c-rows{margin:0 0 2px}
.is-red{color:var(--red)}
.paper .is-red{color:var(--red-ink)}

/* ON PAPER: the panels. */
.c-panel{max-width:64ch}
.c-panel>p{font-size:clamp(14.5px,1vw,16.5px);line-height:1.58;color:var(--ink-2);margin:0 0 .85em}
.c-def-h{font-size:clamp(15px,1.1vw,17.5px);color:var(--ink);margin:0 0 .6em}
.c-warn{border-left:2px solid var(--rule-2);padding-left:14px}
.c-ol{margin:.2em 0 .8em;padding-left:1.3em}
.c-ol li{font-size:clamp(13.5px,.95vw,15px);line-height:1.52;color:var(--ink-2);margin:0 0 .6em}

/* THE THREE CLASSES. */
.c-cats{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--rule);margin:.2em 0 1em}
.c-cat{background:var(--paper);padding:12px}
.c-cat.is-top{background:var(--paper-2)}
.c-cat-v{display:block;font-size:clamp(20px,1.9vw,28px);line-height:1;color:var(--ink);font-variant-numeric:tabular-nums}
.c-cat.is-top .c-cat-v{color:var(--red-ink)}
.c-cat-l{display:block;font-size:10px;color:var(--ink-2);margin-top:4px}
.c-cat-x{display:block;color:var(--ink-3);margin-top:1px}

/* THE CONSENSUS BARS. No hue: "more cities got wetter" is not a broken limit. */
.c-conss{margin:.2em 0 .2em}
.c-cons{display:grid;grid-template-columns:minmax(0,1fr) minmax(90px,1.1fr) 3.2em 3.2em;
  gap:0 clamp(7px,.9vw,13px);align-items:center;padding:10px 0;border-bottom:1px solid var(--hair-2)}
.c-cons-n{font-size:clamp(13px,.93vw,15px);color:var(--fg)}
.c-cons-b{display:flex;height:10px;background:var(--hair-2);overflow:hidden}
.c-cons-b>i{display:block;width:var(--w);height:100%}
.c-cons-b>i.is-up{background:var(--fg)}
.c-cons-b>i.is-flat{background:var(--fg-3)}
.c-cons-b>i.is-down{background:var(--hair)}
.c-cons-v,.c-cons-x{font-variant-numeric:tabular-nums;text-align:right;font-size:clamp(13px,.95vw,15px)}
.c-cons-v{color:var(--fg)}
.c-cons-x{color:var(--fg-3)}
.c-cons-v i,.c-cons-x i{font-style:normal;font-size:.72em;margin-left:.15em}

/* THE CITY TABLE. */
.c-tbl{margin:.2em 0 0}
.c-tr{display:grid;grid-template-columns:minmax(0,1.5fr) repeat(5,minmax(0,1fr));gap:0 6px;
  align-items:baseline;padding:8px 0;border-bottom:1px solid var(--hair-2);font-variant-numeric:tabular-nums}
.c-tr.is-head{border-bottom:1px solid var(--hair)}
.c-tr.is-head .lbl{font-size:9.5px;color:var(--fg-3)}
.c-tr>span{font-size:12px;color:var(--fg-2);text-align:right}
.c-tr>span:first-child{text-align:left}
.c-td-y{color:var(--fg)!important}

/* ATTENTION. */
.c-att{display:flex;align-items:flex-end;gap:2px;height:86px;margin:.3em 0 .2em}
.c-ab{flex:1 1 0;min-width:2px;height:var(--h);background:var(--fg-3);border-radius:1px 1px 0 0}
.c-ab.is-season{background:var(--fg-2)}
.c-ab.is-peak{background:var(--mustard)}
.c-reg{margin:.5em 0 .4em}
.c-pub{max-width:62ch;color:var(--fg-3)}

${CE_CSS}
${CE_BANNER_CSS}
@media (min-width:760px){ .c-two{grid-template-columns:1fr 1fr} }
@media (max-width:639px){
  .c-cats{grid-template-columns:1fr}
  .c-cons{grid-template-columns:minmax(0,1fr) 3em 3em;grid-template-areas:'n v x' 'b b b';gap:5px 8px}
  .c-cons-n{grid-area:n}.c-cons-v{grid-area:v}.c-cons-x{grid-area:x}.c-cons-b{grid-area:b}
  .c-tr{grid-template-columns:minmax(0,1.4fr) repeat(3,minmax(0,1fr));font-size:11.5px}
  .c-tr>span:nth-child(5),.c-tr>span:nth-child(6){display:none}
  .c-tr.is-head .lbl:nth-child(5),.c-tr.is-head .lbl:nth-child(6){display:none}
  .c-att{height:72px}
}
`;

/* ═══ WRITE ══════════════════════════════════════════════════════════════ */
/* THE TITLE COMES FROM data/seo/pages.json now, not a literal here —
   see scripts/build-farm-page.mjs and scripts/build-situation-air.mjs for
   the same pattern. This generator used to keep its own copy; it happened
   to already agree with the register, but a second copy that merely agrees
   today is drift waiting to happen, which is exactly why the register
   exists (spec section 3.1). */
const TITLE = seo('/now/climate-event').title;

await S.assemble({
  file: 'situation-climate-event.html',
  title: TITLE,
  bands: BANDS, index: INDEX, sh, clashes,
  pageCss: PAGE_CSS, script: S.NEWSLETTER_JS + CE_TIME_JS,
  sectionFor: (id) => (B[id] || (() => '    <div class="wrap"><p class="lead">&mdash;</p></div>'))(),
  note: `9 bands + footer. ${CURRENT ? `TOP: ${CURRENT.hazard} @ ${CURRENT.location.text} `
      + `(score ${CURRENT.significance_score}, ${CURRENT.origin}, ${CURRENT.corroboration.independent_publishers} publishers). `
      : `TOP: quiet state, ${wetNow.length}/${ST.length} cities above normal. `}`
      + `PAN-INDIA, ${ST.length} stations. Record: ${WC.extreme_days} days over `
      + `${CAT.heavy}mm at ${worstCity.name} in ${LASTYR} (${WC.annual_mm}mm, ${wcDep}% on normal). `
      + `Archive record ${REC.mm}mm at ${REC.name} ${REC.date} moved to context. `
      + `Deaths ${CE.deaths} from 5 causes. `
      + `Rain up at ${CONS.annual_mm.up}/${ST.length}, extreme days up at ${CONS.extreme_days.up}/${ST.length}.`,
});
