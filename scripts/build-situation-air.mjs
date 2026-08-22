// AD-14 / D-19.3 — situation-air.html, EIGHT bands, real data.
// Token + chrome layer EXTRACTED from the frozen home.html, never retyped
// (D-10.3). Content from the five committed feeds. Nothing invented.
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
/* THE FAMILY. Air is one of six situations born out of /now, so it carries the
   same parent crumb and sibling rail as the other five. Imported rather than
   restated — FAMILY lives once, in the shell.
   NOT A CYCLE: situation-shell.mjs reads THIS file as text via readFileSync to
   extract PAGE_CSS and the tab controller. It never imports it, and Air never
   calls shell(). */
import { crumb, siblings, FAMILY_CSS, NAV as SHELL_NAV, HOME_HREF, GIVE_HREF, INDEX_PAGE } from './lib/situation-shell.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const V3 = join(ROOT, 'public/_pages/v3');
const DATA = join(ROOT, 'data');
const src = readFileSync(`${V3}/home.html`, 'utf8').split('\n');
const J = (f) => JSON.parse(readFileSync(`${DATA}/${f}`, 'utf8'));

let bad = 0;
function R(a, b, expectFirst, expectLast) {
  const head = src.slice(a - 1, a + 2).join('\n'), tail = src.slice(Math.max(0, b - 3), b).join('\n');
  if (expectFirst && !head.includes(expectFirst)) { console.error(`RANGE ${a}-${b}: want "${expectFirst}" near the top`); bad++; }
  if (expectLast && !tail.includes(expectLast)) { console.error(`RANGE ${a}-${b}: want "${expectLast}" near the end`); bad++; }
  return src.slice(a - 1, b).join('\n');
}
const findLine = (n, from = 0) => { const i = src.findIndex((l, k) => k >= from && l.includes(n)); if (i < 0) { console.error(`MARKER MISSING: ${n}`); bad++; } return i; };
const between = (s1, s2) => { const a = findLine(s1); if (a < 0) return ''; const b = findLine(s2, a); return b < 0 ? '' : src.slice(a, b + 1).join('\n'); };
function iife(c) {
  const i = findLine(c); if (i < 0) return '';
  const o = src.findIndex((l, k) => k >= i && l === '(function(){');
  const z = src.findIndex((l, k) => k >= o && l === '})();');
  if (o < 0 || z < 0) { console.error(`IIFE unterminated: ${c}`); bad++; return ''; }
  return src.slice(i, z + 1).join('\n');
}

// Six exclusions, all named. See the previous build log for the reasoning.
const CSS = [
  R(10, 414, "SWECHHA v3. C's intensity, A's structure.", '.mark{min-height:44px'),
  R(422, 467, 'THE THUMB, AND THE INDEX', '}'),
  R(529, 840, 'AD-11: a duplicate', '}'),
  R(2810, 2855, 'AD-09 FINAL PASS. TOUCH TARGETS', 'height:var(--hit,44px)}'),
  R(2878, 2895, '@media (max-width:940px)', '}'),
  R(2897, 2927, 'D-09.3. THE HERO OPENS FOR THE KEYBOARD', ''),
  R(2971, 3033, 'D-09.1. ONE COMPACT INDEX CONTROL', '}'),
].join('\n\n');
const HEAD_FONTS = R(8, 8, 'fonts.googleapis.com', 'display=swap');
const SVG_DEFS = between('<filter id="duo"', '</svg>');
const SKIP = between('D-09.3. BYPASS BLOCKS', 'class="skip"');
const FOOTER = between('<footer class="foot"', '</footer>');
const JS_NAVIDX = iife('D-09.1. THE MOBILE INDEX CONTROL');
const JS_UNDERLINE = iife('D-09.4. WHERE AM I? THE ACTIVE-SECTION UNDERLINE');

/* ═══ DATA ═══════════════════════════════════════════════════════════════ */
const AIR = J('air-delhi.json');
const XC = J('air-crosscheck.json');
const FIRE = J('fires-nw-india.json');
const NEWS = J('coverage-delhi-air.json');
const ATTN = J('attention-delhi-air.json');
const IND = J('air-india.json');
const AP = J('apportionment-delhi.json');
/* The split is the one dataset transcribed BY HAND from a PDF rather than
   fetched, so its shape is asserted here — a dropped segment would silently
   under-report a sector and nothing else would notice.
   TOLERANCE IS ±2, NOT 0, and that is not laziness: the study's own PM10
   columns sum to 99 and 101 because it rounds to whole percent. The declared
   sum in the data file must match the arithmetic, so a future edit to either
   one cannot drift from the other. */
for (const [frac, seasons] of Object.entries(AP.studies.find(s => s.id === 'teri-arai-2018').splits)) {
  for (const [season, rows] of Object.entries(seasons)) {
    const t = rows.reduce((a, r) => a + r.pct, 0);
    const declared = AP.studies.find(s => s.id === 'teri-arai-2018').sums_to_100[`${frac}_${season}`];
    if (Math.abs(t - 100) > 2) { console.error(`APPORTIONMENT ${frac}/${season} sums to ${t} — outside the ±2 rounding tolerance. A segment is probably missing.`); bad++; }
    else if (declared !== t) { console.error(`APPORTIONMENT ${frac}/${season} sums to ${t} but the data file declares ${declared}.`); bad++; }
  }
}

const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const MON = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const PRETTY = { 'PM2.5':'PM2.5','PM10':'PM10','NO2':'NO₂','SO2':'SO₂','CO':'CO','OZONE':'O₃','NH3':'NH₃','PB':'Pb' };
const n0 = (v) => v == null ? '—' : Number(v).toLocaleString('en-IN');
const esc = (s) => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

const rd = AIR.city_reading;
const gov = rd.pollutants[rd.governing];
const govLimit = AIR.limits[rd.governing];
const mult = govLimit ? (gov.conc / govLimit.h24).toFixed(1) : null;
const catIdx = AIR.bands.findIndex(b => b.name === rd.band);
const OBS = (() => { const o = AIR.observed; return o ? `${String(o.hh).padStart(2,'0')}:${String(o.mi).padStart(2,'0')} IST, ${o.d} ${MON[o.m-1]} ${o.y}` : 'time not stated'; })();

/* ═══ BAND SEQUENCE — id, tier, ground hex (D-19.3) ══════════════════════ */
const BANDS = [
  ['top',       't1',         '#0D0D0B'],
  ['strip',     '',           '#151512'],
  ['people',    't2',         '#0D0D0B'],
  ['measured',  'paper t2',   '#F3F2F0'],
  ['sources',   'dark-2 t3',  '#151512'],
  ['trend',     't2',         '#0D0D0B'],
  ['geography', 'dark-2 t2',  '#151512'],
  ['money',     'paper t2',   '#F3F2F0'],
  ['act',       't3',         '#0D0D0B'],
];
const chain = [...BANDS.map(b => [b[0], b[2]]), ['footer', '#151512']];
let clashes = 0;
console.log('GROUND CHAIN');
for (let i = 0; i < chain.length - 1; i++) {
  const ok = chain[i][1] !== chain[i+1][1]; if (!ok) clashes++;
  console.log(`  ${chain[i][0].padEnd(10)} ${chain[i][1]} -> ${chain[i+1][0].padEnd(10)} ${chain[i+1][1]}  ${ok ? 'ok' : '*** CLASH ***'}`);
}
console.log(`  => ${clashes} clash(es)`);

/* ═══ NAV ════════════════════════════════════════════════════════════════ */
/* THE SIX ARE THE RULED CONTRACT (AD-17 §2, as amended by W-16), and they are
   canonical routes rather than the `/design/` paths this file used to write —
   `public/design/` is deleted before any deploy, so a prototype path is a link
   that cannot survive the port. Air predates the shell and still owns its own
   copy of the nav; the values are IMPORTED from the shell so the two cannot
   drift, which is the whole reason FINAL.md §6.2 wants this block migrated. */
const NAV = SHELL_NAV;
// Seven rows for eight bands — the index carries the argument, not the DOM.
const INDEX = [['The reading','#top'],['Who is in it','#people'],['How the number is made','#measured'],
  ['Where it comes from','#sources'],['Where it is going','#trend'],['The geography','#geography'],
  ['What it costs','#money'],['What you can do','#act']];
const HEADER = `<header class="nav"><div class="nav-in"><a class="mark" href="${HOME_HREF}" aria-label="Swechha"><img src="/brand/swechha-horizontal-white-approved.png" alt="Swechha"></a><nav class="navlinks" aria-label="Primary">${NAV.map(([t,h])=>`<a class="nl" href="${h}"${t===INDEX_PAGE.label?' aria-current="true"':''}>${t}</a>`).join('')}</nav><button type="button" class="navidx-t" aria-expanded="false" aria-controls="navidx">Menu</button>
<div class="navidx" id="navidx" hidden><nav aria-label="Pages">${NAV.map(([t,h])=>`<a class="nl" href="${h}"${t===INDEX_PAGE.label?' aria-current="true"':''}>${t}</a>`).join('')}</nav></div><a class="give" href="${GIVE_HREF}">Give</a></div><nav class="navscroll" aria-label="Sections"><ul>${INDEX.map(([t,h])=>`<li><a class="nl" href="${h}">${t}</a></li>`).join('')}</ul></nav></header>`;

/* ═══ SHARED FRAGMENTS ═══════════════════════════════════════════════════ */
// MEASURED vs MODELLED, carried by the rule itself (D-17.6). Solid = a
// measurement. DOTTED = a model. Dashed is NOT reused here: §5.7 already
// assigns dashed to a shut window, and dotted is already the placeholder
// grammar, which is the nearer neighbour to "not a direct measurement".
const kindTag = (kind) => kind === 'modelled'
  ? `<span class="p-kind p-kind-m">Modelled, not measured</span>`
  : `<span class="p-kind">Measured</span>`;

// ── TABS. ARIA tabs over one long data object, so a band shows one view at
// a time instead of stacking all of them. Marker is 3px off-white on the
// selected tab — no red variant, no mustard, per §5.2. The negative margin
// and matching padding are the frozen deck's own fix for a clipped focus
// ring and must move together.
let tabSeq = 0;
const tabs = (group, panels) => {
  const id = `tb${++tabSeq}`;
  const list = panels.map(([label], i) =>
    `<button type="button" role="tab" id="${id}-t${i}" aria-controls="${id}-p${i}"`
    + ` aria-selected="${i === 0}"${i ? ' tabindex="-1"' : ''}>${label}</button>`).join('');
  const body = panels.map(([, html], i) =>
    `<div role="tabpanel" id="${id}-p${i}" aria-labelledby="${id}-t${i}"${i ? ' hidden' : ''}>${html}</div>`).join('\n');
  return `      <div class="p-tabs" data-tabs>
        <div class="p-tabs-l" role="tablist" aria-label="${group}">${list}</div>
${body}
      </div>`;
};

const opener = (id, head, lead) => `      <div class="im-head">
        <h2 class="d1" id="${id}-h">${head}</h2>
        <p class="lead">${lead}</p>
      </div>`;

/* ═══ BANDS ══════════════════════════════════════════════════════════════ */
const B = {};

B.top = () => {
  const bands = AIR.bands.map((b,i) => `<i class="${i<=catIdx?'on':''}${i===catIdx?' tip':''}" title="${b.name}"></i>`).join('');
  /* ── THE NATIONAL PANEL, beside the reading (owner's reference view).
     THE RANK IS NOT A CLAIM, IT IS A READING. The ledger recorded "Delhi is
     first of 266" as a fact. Two hours later Sasaram, Bihar read 389 against
     Delhi's 388 and Delhi was second. So the rank is printed from the feed
     with the movement stated, and the withdrawn hook — "Delhi is the loudest,
     not always the worst" — turns out to have been true after all.
     Sasaram reports from ONE station and Delhi from forty-four; that is on
     the row, because a city with one monitor is measured less, not better. */
  const top = IND.cities.slice(0, 8);
  const dr = IND.delhi;
  const natRows = top.map(c => {
    const isD = c.city.toLowerCase() === 'delhi';
    // data-aqi so the live upgrade can re-rank Delhi against the snapshot
    // without re-fetching the other 267 cities.
    return `<div class="p-nr${isD?' is-me':''}"${isD?' id="air-nr-delhi"':''} data-aqi="${c.aqi}"><span class="p-nr-n">${esc(c.city)}${c.state&&!isD?`, ${esc(c.state)}`:''}</span>
          <span class="p-nr-v${c.aqi>IND.aqiLimit?' is-red':''}"${isD?' id="air-nr-delhi-v"':''}>${c.aqi}</span>
          <span class="cap p-nr-s">${c.stations}&thinsp;st</span></div>`;
  }).join('\n        ');
  return `    <div class="pic ht">
      <img class="duo" src="/images/photos/india-gate-hero.jpg" alt="India Gate seen through Delhi haze" style="--zh:150%;--zt:-30%">
      <div class="pic-over"><div class="wrap">
        <h1 class="d1">Delhi&rsquo;s air</h1>
      </div></div>
    </div>
    <div class="pic-body"><div class="wrap p2-hero">
${crumb('air')}
      <div class="p2-top">
        <p class="lbl p2-method">Every reading against its published limit. Every gap named.</p>
        <p style="margin:0"><span class="tag tag-season">Year round</span></p>
      </div>
      <div class="p2-cols">
      <div class="p2-read breach">
        <p class="state p2-state" id="air-state"><i aria-hidden="true"></i><span id="air-state-w">Periodic</span><span class="sr" id="air-state-x"> &mdash; updated on a cadence, not continuously</span></p>
        <p class="readout rl" id="air-aqi">${rd.aqi}</p>
        <p class="unit">AQI &middot; 24-hour &middot; worst of eight</p>
        <p class="verdict bad" id="air-band">${rd.band}</p>
        <div class="bands bad" id="air-bands" role="img" aria-label="${rd.band}, band ${catIdx+1} of ${AIR.bands.length}">${bands}</div>
        <p class="limit" id="air-limit">CPCB safe limit ${AIR.aqiLimit}. <b>Limit broken.</b></p>
        <p class="cap p2-src" id="air-src"><span id="air-src-w">${esc(rd.station)}. Observed ${OBS}.</span>
          <a class="lk" href="#measured">How this number is made</a>.</p>
      </div>
      <div class="p2-nat">
        <p class="lbl p2-nat-h">India, right now</p>
        <p class="cap p2-nat-l"><span id="air-nat-rank">${n0(IND.totals.cities)} cities report to CPCB. Delhi is
          <b>${dr?`${dr.rank===1?'first':dr.rank===2?'second':'ranked '+dr.rank} of them`:'in the table'}</b>,
          and that changes between hours.</span></p>
        ${natRows}
        <p class="cap p2-nat-c"><b>${IND.totals.above_limit} of ${IND.totals.cities} above the limit
          India set for itself.</b> ${IND.totals.good} read &ldquo;Good&rdquo;. Sasaram reports from one
          station and Delhi from ${dr?dr.stations:AIR.spread.stations} &mdash; a city with one monitor is
          measured <b>less</b>, not better.</p>
        <p class="cap p-hole p2-nat-t"><b>Delhi&rsquo;s row is live. The others are not.</b> The eight
          cities above were read together at ${esc(IND.observed || 'the snapshot hour')}; Delhi&rsquo;s
          figure updates when this page loads. So the order can be an hour out of date even when
          Delhi&rsquo;s number is not &mdash; which is the honest version of a ranking, and the reason the
          rank is printed as a reading rather than as a claim.</p>
        <p style="margin:0"><a class="act" href="#geography">All ${n0(IND.totals.cities)} cities ${ARROW}</a></p>
      </div>
      </div>
      <p style="margin:0"><a class="act" href="#people">Who is in it ${ARROW}</a></p>
    </div></div>`;
};

B.strip = () => {
  const cells = [
    ['AQI', rd.aqi, rd.band, true],
    ['Above the limit', `${AIR.spread.above_limit} of ${AIR.spread.stations}`, 'Delhi stations', true],
    ['In India', '1st', `of ${NAT.cities} cities`, true],
    ['Attention', `${ATTN.swing}×`, 'winter against summer', false],
  ];
  const cellId = { 'AQI': 'air-c-aqi', 'Above the limit': 'air-c-above' };
  return `    <div class="wide p-strip-in">
      ${cells.map(([l,v,s,red]) => `<a class="p-cell" href="#${l==='Attention'?'trend':l==='In India'?'geography':'top'}">
        <span class="p-cell-v${red?' is-red':''}"${cellId[l]?` id="${cellId[l]}"`:''}>${v}</span>
        <span class="lbl p-cell-l">${l}</span><span class="cap p-cell-s"${l==='AQI'?' id="air-c-band"':''}>${s}</span></a>`).join('\n      ')}
      <p class="cap p-strip-note">One reading, one label. <a class="lk" href="#measured">What is behind them</a>.</p>
    </div>`;
};

/* THE KIND IS CARRIED BY THE RULE UNDER THE NUMERAL (D-17.6, standout 1).
   Solid = counted or measured. Dotted = modelled. It costs no vertical space
   because the unit line already had a baseline — the border replaces nothing
   and adds nothing. The legend appears once, in the first band that uses it. */
const kd = (kind) => `class="unit p-kd ${kind === 'modelled' ? 'p-kd-m' : 'p-kd-c'}"`;
const KIND_LEGEND = `      <p class="p-legend"><span class="lbl p-kd p-kd-c">Counted or measured</span><span class="lbl p-kd p-kd-m">Modelled</span></p>`;

B.people = () => `    <div class="wrap">
${opener('people','Who is in it?','The consequence comes before the measurement, because the measurement is not the point. Every figure here is measured against a limit India has not adopted.')}
${KIND_LEGEND}
      <div class="p-two">
        <div class="p-two-c"><p class="num rl">1.5</p><p ${kd('modelled')}>million deaths a year</p>
          <p class="cap">about 1.5 million, against <b>the WHO guideline</b> &mdash; 5 µg/m³ annual.
          <span class="p-cite">Lancet Planetary Health, December 2024.</span></p></div>
        <div class="p-two-c"><p class="num rl">5.0%</p><p ${kd('modelled')}>of all mortality</p>
          <p class="cap">against <b>India&rsquo;s own standard</b> &mdash; 40 µg/m³ annual. Same study, same deaths.</p></div>
      </div>
      <p class="body p-ratio">India&rsquo;s standard is eight times the WHO guideline, so the same harm counts twice over.</p>
      <div class="p-rows">
        <div class="p-row"><p class="num rl">29.4%</p>
          <div><p class="body">of <b>Delhi adolescents aged 13&ndash;17</b> showed spirometry-defined asthma or airflow obstruction. <span class="lbl p-kd p-kd-c">Counted</span></p>
          <p class="cap">The study&rsquo;s own strongest association was obesity, not air pollution &mdash; 39.8% overweight against 16.4%.
          <span class="p-cite">Lung Care Foundation with Pulmocare Research, Lung India, September 2021.</span></p></div></div>
        <div class="p-row"><p class="num rl">8.2 years</p>
          <div><p class="body">of life expectancy lost in <b>Delhi-NCR</b>. 3.5 years across India. <span class="lbl p-kd p-kd-m">Modelled</span></p>
          <p class="cap">Nearly twice the toll of childhood and maternal malnutrition.
          <span class="p-cite">Air Quality Life Index, EPIC, University of Chicago, 2025.</span></p></div></div>
      </div>
      <p class="body p-key"><b>Three of those four figures are models.</b> The one that was counted is the one
        about children&rsquo;s lungs, because somebody put real adolescents in front of a spirometer. A model
        is not a lesser thing than a count, but it is a different thing, and a dashboard that sets them at
        the same weight is telling you they are the same.</p>
      <p class="cap p-hole">A counted figure for <b>exposure</b> would need the Directorate of Education
        school register with coordinates, joined to the station list by distance. It is not published in a
        machine-readable form, so this page does not carry one.</p>
      <p style="margin:var(--gap-row) 0 0"><a class="act" href="#measured">What is actually being measured ${ARROW}</a></p>
    </div>`;

B.measured = () => {
  const shown = ['PM2.5','PM10','NO2','OZONE','SO2','NH3'].filter(k => rd.pollutants[k]?.sub != null)
    .map(k => ({ k, ...rd.pollutants[k] })).sort((a,b) => b.sub - a.sub);
  const cmp = XC.comparison;
  const expl = [
    ['AQI','One number for eight poisons',`Eight pollutants folded into one 0&ndash;500 figure that reports <b>whichever is worst</b>. It is not a concentration. ${rd.aqi} today; the limit is ${AIR.aqiLimit}.`],
    ['PM2.5','Small enough to enter blood',`Particles under two and a half microns pass the lung wall into the bloodstream. <b>${gov.conc} µg/m³</b> today. The Indian daily standard is ${AIR.limits['PM2.5'].h24}.`],
    ['PM10','Dust you can feel',`Coarser particles from roads, construction and soil, stopping in the upper airway. <b>${rd.pollutants['PM10'].conc} µg/m³</b> today. The standard is ${AIR.limits['PM10'].h24}.`],
  ];
  const pWhat = `<div class="p-expl">${expl.map(([h,sb,b]) => `<div><h3 class="p-expl-h">${h}</h3><p class="p-expl-s">${sb}</p><p class="p-expl-b">${b}</p></div>`).join('')}</div>`;
  const pEight = `<p class="body p-quote">&ldquo;The worst sub-index determines the overall AQI.&rdquo;
          <span class="p-cite">CPCB, <i>About National Air Quality Index</i>.</span></p>
        <div class="p-subs">${shown.map(x => `<div class="p-sub${x.k===rd.governing?' is-gov':''}">
            <p class="lbl p-sub-n">${PRETTY[x.k]}</p><p class="p-sub-v">${x.sub}</p>
            <p class="cap p-sub-c">${x.conc} ${x.unit}</p>${x.k===rd.governing?'<p class="lbl p-sub-g">governing</p>':''}</div>`).join('')}</div>
        <p class="cap p-miss">Eight pollutants, ${shown.length} in this number. <b>Pb</b> is not reported at this
          station. <b>CO</b> is reported &mdash; ${rd.pollutants['CO']?.conc ?? '—'} &mdash; but left out: the feed
          states no unit for it, CPCB&rsquo;s CO breakpoints are in mg/m³ where everything else here is µg/m³, and
          on either reading the value is not credible. Read as mg/m³ it alone would put almost every station in
          the top band.</p>
        <p class="body p-key"><b>AQI 100 is not a rule of thumb.</b> The boundary sits at PM2.5
          ${AIR.limits['PM2.5'].h24} µg/m³ and PM10 ${AIR.limits['PM10'].h24} µg/m³ &mdash; exactly the 24-hour
          standards India set for itself. <b>Above 100 is above the law.</b></p>`;
  const pScales = cmp ? `<div class="p-scales">
        <div class="p-scales-r">
          <div><p class="num rl">${cmp.waqi_us_epa_aqi}</p><p class="unit">US EPA scale &middot; WAQI</p></div>
          <div><p class="num rl">${cmp.cpcb_scale_aqi}</p><p class="unit">India&rsquo;s scale &middot; computed here</p></div>
        </div>
        <p class="body">${cmp.difference} points apart, for the same air at ${esc(cmp.station.cpcb)} in the same
          hour. Part of that is a different scale; part is a different averaging window.</p>
        <p class="cap">WAQI publishes index values only, never concentrations, so <b>the two cannot be told
          apart from outside</b> &mdash; and neither number tells you which you are looking at.</p></div>` : '';
  const pMethod = `<div class="p-method">
        <table class="p-tbl"><thead><tr><th>Figure</th><th>Kind</th><th>Source</th><th>Cadence</th></tr></thead><tbody>
          <tr><td>AQI, ${rd.aqi}</td><td>Derived</td><td>computed from CPCB concentrations</td><td>Hourly</td></tr>
          <tr><td>Station concentrations</td><td>Measured</td><td>CPCB, ${AIR.spread.stations} Delhi stations</td><td>Hourly</td></tr>
          <tr><td>Published limit, ${AIR.aqiLimit}</td><td>Standard</td><td>${esc(govLimit.authority)}</td><td>Fixed</td></tr>
          <tr><td>Source split</td><td>Modelled</td><td>published apportionment study</td><td>Per study</td></tr>
          <tr><td>Farm-fire counts</td><td>Measured</td><td>NASA FIRMS, per sensor</td><td>Daily</td></tr>
          <tr><td>Attention</td><td>Measured</td><td>Wikipedia pageviews</td><td>Daily</td></tr>
          <tr><td>Forecast</td><td>Modelled</td><td>WAQI&rsquo;s model, not CPCB&rsquo;s</td><td>Daily</td></tr>
        </tbody></table>
        <p class="cap"><b>Not CPCB&rsquo;s published AQI.</b> The feed returns concentrations and no index, so the
          number at the top of this page is computed here using CPCB&rsquo;s own breakpoint table.</p></div>`;
  return `    <div class="wrap">
${opener('measured','How the number is made','One number stands in for eight, and it is not their average &mdash; it is the worst of them. Everything on this page is either measured or modelled, and the two are set differently on purpose.')}
${tabs('Method', [['What they are', pWhat], ['Today\'s eight', pEight], ['Two scales', pScales], ['Every figure', pMethod]].filter(x => x[1]))}
    </div>`;
};

B.sources = () => {
  const g = FIRE.sensor_gap, yy = FIRE.year_on_year;
  const mx = Math.max(...yy.series.filter(x=>x.ok).map(x=>x.count));
  /* ── THE SPLIT (D-22.1). Two government-commissioned studies, side by side,
     because they disagree and the disagreement is the finding. No blended
     average: different methods, different years, different site sets and
     different category boundaries, so a mean of them is a number no study
     supports. No pie chart either — a pie says "this is settled".
     Bars carry width and ink only. HUE IS NOT AVAILABLE HERE: red means a
     published limit was broken, and a sector having a large share is not that. */
  const T = AP.studies.find(s => s.id === 'teri-arai-2018');
  const K = AP.studies.find(s => s.id === 'iitk-2016');
  const tw = T.splits.pm25.winter, ts = T.splits.pm25.summer;

  const bar = (p) => `<span class="p-ap-b" style="width:${p}%"></span>`;
  const apRows = tw.map(w => {
    const s = ts.find(x => x.sector === w.sector);
    const d = s ? +(s.pct - w.pct).toFixed(0) : null;
    return `<div class="p-ap-r"><span class="p-ap-n">${esc(w.sector)}</span>
            <span class="p-ap-w">${bar(w.pct)}<i class="p-ap-v">${w.pct}%</i></span>
            <span class="p-ap-w p-ap-s">${bar(s ? s.pct : 0)}<i class="p-ap-v">${s ? s.pct : '—'}%</i></span>
            <span class="cap p-ap-d">${d === null ? '' : (d > 0 ? '+' : '') + d}</span></div>`;
  }).join('\n          ');
  const pSplit = `<div class="p-ap">
          <p>${kindTag('modelled')}</p>
          <p class="body p-ap-k"><b>This is the only complete split anyone has published for Delhi, and its
            newest measurement is from February 2017.</b> Six sectors, summing to a hundred, from the study
            the Government of India commissioned to settle the question.</p>
          <div class="p-ap-h"><span></span><span class="lbl">Winter</span><span class="lbl">Summer</span><span class="lbl p-ap-d">&Delta;</span></div>
          ${apRows}
          <p class="body p-ap-f"><b>Dust more than doubles in summer and industry stays put.</b> The season
            does not just change how much there is &mdash; it changes what it is. A control measure aimed at
            the winter split is aimed at a different problem in June.</p>
          <p class="cap">${esc(T.short)}, ${esc(T.published)} &mdash; PM2.5, Delhi, dispersion model
            (WRF&ndash;CMAQ), monitoring ${esc(T.monitoring_period)}. Commissioned by the
            ${esc(T.commissioned_by.replace(/, Government of India$/, ''))}.
            <a class="lk" href="${esc(T.url)}" rel="noopener" target="_blank">The report</a>, ${esc(T.table)}.</p>
          <p class="cap p-hole"><b>Four things the study says about itself.</b>
            Agricultural burning at 4% is <b>a floor, not an estimate</b> &mdash; the monitoring never covered
            October, when burning peaks, and the report says so in as many words. The shares are averaged
            across the whole period, so <b>they cannot describe a bad day</b>. The model reproduces only
            <b>82&ndash;87% of the mass actually measured</b>. And &ldquo;industry&rdquo; includes biomass
            burned as industrial fuel, which the report itself calls an overestimate.</p>
        </div>`;
  const rmax = Math.max(...K.ranges.pm25.map(r => r.hi));
  const pRanges = `<div class="p-ap">
          <p>${kindTag('modelled')}</p>
          <p class="body p-ap-k"><b>The other government study will not give you a single number.</b>
            ${esc(K.short)} sampled six sites across Delhi and reported every source as a <b>range</b>,
            because the answer was different under every monitor. The width of each line below is how much
            the two studies, and the six sites, fail to agree.</p>
          <div class="p-rg">
            ${K.ranges.pm25.map(r => `<div class="p-rg-r"><span class="p-rg-n">${esc(r.sector)}</span>
              <span class="p-rg-t"><i class="p-rg-l" style="left:${(r.lo/rmax*100).toFixed(1)}%;right:${(100-r.hi/rmax*100).toFixed(1)}%"></i></span>
              <span class="p-rg-v">${r.lo}&ndash;${r.hi}%</span></div>`).join('\n            ')}
            <div class="p-rg-ax"><span>0</span><span>${rmax}% of PM2.5</span></div>
          </div>
          <p class="body p-ap-f"><b>Vehicles are somewhere between 6% and 29%.</b> That is the range in
            which every argument about Delhi&rsquo;s cars, buses and trucks is actually being conducted.
            ${esc(T.short)} puts transport at 17&ndash;28% and says plainly that its figure is higher than
            ${esc(K.short)}&rsquo;s <b>because it counted secondary particles alongside primary ones</b> &mdash;
            the two studies are not quite measuring the same thing.</p>
          <p class="cap">${esc(K.short)}, ${esc(K.published)} &mdash; PM2.5, receptor modelling (chemical mass
            balance) at six Delhi sites, monitoring ${esc(K.monitoring_period)}. Commissioned by the
            ${esc(K.commissioned_by.replace(/^Department of Environment, /, ''))}.
            <a class="lk" href="${esc(K.url)}" rel="noopener" target="_blank">The report</a>, ${esc(K.table)}.</p>
          <p class="cap p-hole"><b>And the categories do not line up.</b> ${esc(K.short)}&rsquo;s
            &ldquo;coal and flyash&rdquo; is a fuel signature; ${esc(T.short)}&rsquo;s &ldquo;industry&rdquo;
            is a sector that bundles power plants, brick kilns and stone crushers. They are not two
            estimates of one quantity. <b>This page will not average them</b>, and it will not attach either
            to today&rsquo;s reading &mdash; neither is a measurement of today.</p>
        </div>`;
  const sub = T.sub_sectors_pm25_winter_delhi;
  const smax = Math.max(...sub.transport.map(x => x.pct));
  const pWho = `<div class="p-ap">
          <p>${kindTag('modelled')}</p>
          <p class="body p-ap-k"><b>Inside the 28% that transport contributes, cars are 3.4.</b>
            Trucks are more than twice that and two-wheelers twice that. Winter PM2.5, Delhi.</p>
          <div class="p-ap-sub">
            ${sub.transport.map(x => `<div class="p-ap-r p-ap-r2"><span class="p-ap-n">${esc(x.item)}</span>
              <span class="p-ap-w"><span class="p-ap-b" style="width:${(x.pct/smax*100).toFixed(1)}%"></span><i class="p-ap-v">${x.pct}%</i></span></div>`).join('\n            ')}
          </div>
          <p class="body p-ap-f">Of the car share, <b>diesel is 67&ndash;74%</b> and the oldest cars dominate
            &mdash; BS-II and earlier account for 31&ndash;50% of it. Run the study&rsquo;s own arithmetic and
            <b>every BS-IV diesel car in Delhi comes to about 0.5&ndash;0.9% of PM2.5.</b> That is not an
            argument for more cars. It is an argument about <b>where a policy rupee buys the most air</b>,
            and the answer in this table is trucks, brick kilns and generators, not hatchbacks.</p>
          <p class="cap">Also inside the totals: within industry&rsquo;s 30%, <b>brick kilns 8%</b>, power
            stations 6%, stone crushers 2%, and 14% from other industries burning coal, biomass, pet-coke
            and furnace oil. Within &ldquo;others&rdquo;, <b>diesel generators 5%</b> and refuse burning 3%.
            And within dust&rsquo;s 17%, road dust is 4 and construction 1 &mdash; the report attributes much
            of the remainder to <b>dust that did not originate in Delhi at all</b>.
            <span class="p-cite">${esc(T.short)}, section E7.3.</span></p>
          <p class="cap p-hole"><b>The question neither study answers.</b> What is in the air <i>today</i>.
            Both are seasonal averages whose last measurement is eight years old. There is a system that does
            answer it &mdash; <a class="lk" href="${esc(AP.live_system.url)}" rel="noopener" target="_blank">${esc(AP.live_system.name)}</a>,
            run by the ${esc(AP.live_system.by.replace(/, Ministry of Earth Sciences$/, ''))}, which publishes
            a daily split across 29 sectors with the stubble share taken from the previous evening&rsquo;s
            satellite fire counts. <b>It has no public API and its host was unreachable from the machine that
            built this page</b>, so it is named and linked and never restated.</p>
        </div>`;
  const pNow = `<div class="p-two">
          <div class="p-two-c"><p class="num rl">${n0(g.off_season.modis)}</p><p class="unit">MODIS &middot; 1 km</p>
            <p class="cap">last ${FIRE.window.days} days</p></div>
          <div class="p-two-c"><p class="num rl">${n0(g.off_season.viirs)}</p><p class="unit">VIIRS &middot; 375 m</p>
            <p class="cap"><b>${g.off_season.ratio}&times; MODIS</b>, same fires</p></div>
        </div>
        <p class="body p-gapkey"><b>The disagreement is itself a measurement.</b> Out of season the sensors run
          ${g.off_season.ratio}:1 apart. At peak &mdash; ${esc(g.peak_season.window)} &mdash;
          ${n0(g.peak_season.modis)} against ${n0(g.peak_season.viirs)}, only ${g.peak_season.ratio}:1. MODIS
          misses almost everything when fires are small and catches most of it when they are large, so
          <b>the gap measures fire size</b>, not instrument error.</p>
        <p class="cap">A detection is a thermal anomaly, not a confirmed crop fire. The two VIIRS satellites see
          the same fires at different overpass times and <b>must not be added</b>.</p>`;
  const pYY = `<div class="p-yy">${yy.series.filter(x=>x.ok).map(x=>`<div class="p-yy-c"><span class="p-yy-bar" style="height:${Math.round(x.count/mx*100)}%"></span><span class="p-yy-v">${n0(x.count)}</span><span class="lbl p-yy-y">${x.year}</span></div>`).join('')}</div>
        <p class="cap">MODIS, five days from 5 November each year, same region. <b>A fixed five-day window is a
          sample, not a season total</b> &mdash; burning dates shift with monsoon withdrawal and harvest timing,
          so a fixed window can miss a peak. 2024 and 2025 run at roughly a sixth of 2021.</p>`;
  return `    <div class="wrap">
${opener('sources','Where does it come from?','A source apportionment is a model: it takes measured concentrations, wind and an emissions inventory and works backwards to a plausible split. Biomass burning is one segment, and it has a season.')}
${tabs('Sources', [['The split', pSplit], ['Two studies', pRanges], ['Inside transport', pWho], ['Farm fires now', pNow], ['Year on year', pYY]])}
    </div>`;
};

B.trend = () => {
  const fc = XC.forecast, days = fc.daily?.pm25 ?? [];
  const complete = ATTN.months.filter(m => !m.partial);
  const recent = complete.slice(-24);
  const amx = Math.max(...recent.map(m => m.views));
  const fmx = days.length ? Math.max(...days.map(d => d.max)) : 1;
  const pRecord = `<div class="p-grid-wrap">
          <div class="p-grid" role="img" aria-label="Daily record, one square per day, beginning today">
            ${Array.from({length:365},(_,i)=>`<i class="${i===0?'p-g-on':''}"></i>`).join('')}
          </div>
          <p class="cap"><b>One square.</b> The record begins today and fills as the job runs. It draws no
            square it does not have &mdash; an empty cell is absence, not zero. There is no retrospective
            series: the CPCB feed publishes the latest hour only.</p></div>`;
  const pAttn = `<div class="p-attn">
          <div class="p-attn-c">${recent.map(m=>`<span class="p-attn-b" style="height:${Math.round(m.views/amx*100)}%" title="${m.month}: ${n0(m.views)}"></span>`).join('')}</div>
          <div class="p-attn-x"><span>${recent[0].month.slice(0,4)}</span><span>${recent[recent.length-1].month.slice(0,4)}</span></div>
          <p class="body"><b>Attention is not air.</b> Searches peak every November at ${n0(ATTN.peak.views)}
            and fall to ${n0(ATTN.floor.views)} in summer &mdash; a <b>${ATTN.swing}&times; swing</b> &mdash;
            while the readings stay above the limit all twelve months. And the swing is <b>widening</b>:
            ${ATTN.seasons.filter(s=>s.ratio).map(s=>`${s.year} ${s.ratio}×`).join(', ')}.</p>
          <p class="cap">Wikipedia pageviews, ${ATTN.complete_months} complete months. It measures what people
            <b>seek</b>, not what outlets publish. A quiet month is not a clean month. The current month is
            incomplete and excluded, never plotted.</p></div>`;
  const pFc = `<div class="p-fc">
          ${days.length ? `<div class="p-fc-c">${days.map(d=>`<div class="p-fc-d"><span class="p-fc-bar" style="height:${Math.round(d.avg/fmx*100)}%"></span><span class="p-fc-v">${d.avg}</span><span class="lbl p-fc-x">${d.day.slice(8)}</span></div>`).join('')}</div>
          <p class="cap">PM2.5 daily mean, ${days.length} days.</p>` : ''}
          <p>${kindTag('modelled')}</p>
          <p class="body"><b>Somebody is forecasting this. Not us, and not the government.</b> The curve is
            <b>WAQI&rsquo;s own model</b>. India&rsquo;s official forecaster is
            <a class="lk" href="${esc(fc.official_indian_forecaster.url)}" rel="noopener" target="_blank">SAFAR</a>,
            which publishes a 72-hour Delhi forecast with <b>no public API</b> &mdash; so it is named and linked,
            never restated.</p></div>`;
  return `    <div class="wrap">
${opener('trend','Where it has been, and where it is going','The record starts today; the forecast reaches seven days ahead. For now this page sees further forward than back &mdash; that inverts in a week.')}
${tabs('Time', [['The record', pRecord], ['Attention', pAttn], ['Forecast', pFc]])}
    </div>`;
};

const NAT = { cities: 266, stations: 502, above: 87, good: 51 };
B.geography = () => {
  const st = AIR.stations.filter(s => s.aqi != null);
  const rows = (arr) => arr.map(s=>`<div class="p-rank-r"><span class="p-rank-v${s.aqi>AIR.aqiLimit?' is-red':''}">${s.aqi}</span><span class="p-rank-n">${esc(s.station.replace(/, Delhi.*/,''))}</span><span class="cap p-rank-g">${PRETTY[s.governing]||s.governing}</span></div>`).join('');
  const pDelhi = `<div class="p-rank">
          ${rows(st.slice(0,5))}
          <p class="cap p-rank-more">&hellip; ${st.length-8} more &hellip;</p>
          ${rows(st.slice(-3))}
          <p class="cap">${AIR.spread.stations} stations, <b>${AIR.spread.above_limit} above the limit</b>.
            The quietest reads ${AIR.spread.best.aqi}, the loudest ${AIR.spread.worst.aqi} &mdash;
            <b>one city, a fivefold spread</b>. A city average hides it. Red is above the limit.</p></div>`;
  const pIndia = `<div class="p-nat">
          <p class="body"><b>Delhi is first of ${NAT.cities} cities. Nine of the next twelve are its
            neighbours</b> &mdash; Gurugram, Charkhi Dadri, Faridabad, Manesar, Noida, Khora, Panipat, Baraut,
            Meerut. This is not a city problem. It is an airshed.</p>
          <p class="cap">${NAT.above} of ${NAT.cities} cities are above the limit India set for itself, and
            ${NAT.good} are &ldquo;Good&rdquo; &mdash; the country is not uniformly polluted, which is what makes
            the cluster around Delhi legible. Computed from ${NAT.stations} stations on CPCB&rsquo;s scale,
            CO excluded.</p></div>`;
  /* ── THE MAP (D-17.6: "monitors / ward labels / plume as separate layers").
     Real coordinates, real distances, computed here — not a traced outline.
     THE MONITOR LAYER IS THE ONLY ONE DRAWN. A ward layer needs a boundary
     file that is not published in a usable form; a plume layer is a model, and
     drawing one on a page whose whole argument is measured-vs-modelled would
     be the page contradicting itself. Both absences are named, not hidden. */
  const R = 6371, rad = (d) => d * Math.PI / 180;
  const km = (a1,o1,a2,o2) => { const dl=rad(a2-a1), dm=rad(o2-o1);
    const x = Math.sin(dl/2)**2 + Math.cos(rad(a1))*Math.cos(rad(a2))*Math.sin(dm/2)**2;
    return 2*R*Math.asin(Math.sqrt(x)); };
  const geo = st.filter(s => s.lat && s.lng);
  const LA0=Math.min(...geo.map(s=>s.lat)), LA1=Math.max(...geo.map(s=>s.lat));
  const LN0=Math.min(...geo.map(s=>s.lng)), LN1=Math.max(...geo.map(s=>s.lng));
  const wKm = km(LA0,LN0,LA0,LN1), hKm = km(LA0,LN0,LA1,LN0);
  const PAD = 26, W = 420, H = Math.round((W - PAD*2) * (hKm/wKm)) + PAD*2;
  // Equal scale on both axes, so a distance on the drawing is a distance.
  const sc = (W - PAD*2) / wKm;
  const X = (lng) => PAD + km(LA0,LN0,LA0,lng) * sc;
  const Y = (lat) => H - PAD - km(LA0,LN0,lat,LN0) * sc;
  // The pair that carries the finding: the biggest disagreement between two
  // monitors close enough that no reader would call them different places.
  let pair = [0, null];
  for (const a of geo) for (const b of geo) if (a !== b && km(a.lat,a.lng,b.lat,b.lng) <= 6) {
    const g = Math.abs(a.aqi - b.aqi); if (g > pair[0]) pair = [g, [a, b, km(a.lat,a.lng,b.lat,b.lng)]]; }
  const [gapAqi, [pA, pB, pKm]] = pair;
  // Median nearest-neighbour spacing, and the worst coverage hole INSIDE the
  // monitors' own box — both computed, so neither can go stale in the file.
  const nn = geo.map(s => Math.min(...geo.filter(t => t !== s).map(t => km(s.lat,s.lng,t.lat,t.lng)))).sort((a,b)=>a-b);
  const nnMed = nn[Math.floor(nn.length/2)];
  let hole = 0;
  for (let i = 0; i <= 240; i++) for (let j = 0; j <= 240; j++) {
    const p = LA0 + (LA1-LA0)*i/240, q = LN0 + (LN1-LN0)*j/240;
    const d = Math.min(...geo.map(s => km(p,q,s.lat,s.lng)));
    if (d > hole) hole = d;
  }
  const short = (s) => esc(String(s.station).replace(/, Delhi.*/, ''));
  const dots = geo.map(s => {
    const red = s.aqi > AIR.aqiLimit, x = X(s.lng), y = Y(s.lat);
    return `<rect x="${(x-3.5).toFixed(1)}" y="${(y-3.5).toFixed(1)}" width="7" height="7"`
      + ` class="${red?'p-m-hi':'p-m-lo'}"><title>${short(s)} — ${s.aqi}</title></rect>`;
  }).join('');
  const barKm = 10, barPx = (barKm * sc).toFixed(1);
  const pMap = `<div class="p-map">
          <div class="p-map-f">
          <svg viewBox="0 0 ${W} ${H}" class="p-map-s" role="img"
            aria-label="${geo.length} Delhi monitors at their true positions. ${AIR.spread.above_limit} read above the limit.">
            <rect x="${PAD}" y="${PAD}" width="${W-PAD*2}" height="${H-PAD*2}" class="p-m-fr"/>
            <line x1="${X(pA.lng).toFixed(1)}" y1="${Y(pA.lat).toFixed(1)}" x2="${X(pB.lng).toFixed(1)}" y2="${Y(pB.lat).toFixed(1)}" class="p-m-ln"/>
            ${dots}
            <g class="p-m-lb">
              ${[[pA,-6],[pB,14]].map(([p,dy]) => {
                // A label in the right quarter of the frame is set to the LEFT
                // of its point, or it hangs off the panel edge on overflow.
                const x = X(p.lng), right = x > W * 0.76;
                return `<text x="${(right ? x-9 : x+9).toFixed(1)}" y="${(Y(p.lat)+dy).toFixed(1)}"`
                  + `${right ? ' text-anchor="end"' : ''}>${p.aqi}</text>`;
              }).join('\n              ')}
            </g>
            <g class="p-m-sc"><line x1="${PAD}" y1="${H-9}" x2="${(PAD+ +barPx).toFixed(1)}" y2="${H-9}"/>
              <text x="${PAD}" y="${H-14}">${barKm} km</text></g>
          </svg>
          <p class="p-legend p-map-lg"><span class="lbl"><i class="p-sw p-sw-hi"></i>Above the limit</span><span class="lbl"><i class="p-sw p-sw-lo"></i>Within it</span></p>
          </div>
          <div class="p-map-t">
          <p class="body p-map-k"><b>${pA.aqi} and ${pB.aqi}, ${pKm.toFixed(1)} km apart.</b>
            ${short(pA)} and ${short(pB)} are the same hour of the same city and they differ by
            ${gapAqi} points &mdash; ${short(pB)} sits inside the limit while ${short(pA)} is
            ${AIR.bands[AIR.bands.findIndex(b=>b.name===pA.band)]?.name.toLowerCase()}. Whichever one is
            nearest to you is the only one describing your air.</p>
          <p class="cap">${geo.length} monitors, true positions, equal scale on both axes; the
            ${Math.round(wKm)}&nbsp;&times;&nbsp;${Math.round(hKm)} km frame is <b>the box the monitors
            describe, not Delhi&rsquo;s boundary</b>. Median spacing between neighbouring monitors
            ${nnMed.toFixed(1)} km &mdash; but inside that same box you can stand <b>${hole.toFixed(1)} km
            from the nearest one</b>. Red is above the limit.</p>
          <p class="cap p-hole"><b>Two layers are missing on purpose.</b> There is no ward layer &mdash;
            the boundary file is not published in a usable form, and a hand-drawn one would be a claim
            about where you live. There is no plume &mdash; a plume is a model, and this page does not
            draw a model on top of measurements without saying so.</p></div></div>`;
  return `    <div class="wrap">
${opener('geography','Which part of the city, and where the city sits',
  `There are ${AIR.spread.stations} monitors reporting for Delhi and they do not agree with each other. `
  + `<b>Every figure in this band was read at ${OBS}</b> &mdash; one hour, all ${AIR.spread.stations} `
  + `stations together, which is what makes them comparable. The reading at the top of the page updates `
  + `when you load it, so it can be an hour newer than the numbers here.`)}
${tabs('Geography', [['The map', pMap], ['Every station', pDelhi], ['India', pIndia]])}
      <p style="margin:var(--gap-row) 0 0"><a class="act" href="#money">What has been spent on it ${ARROW}</a></p>
    </div>`;
};

/* ── THE COST OF INACTION (owner, 21 August).
   This hook was WITHDRAWN once, for a good reason: there is no costed
   abatement plan for Delhi-NCR to set against the damage, so "cheaper to act
   than not to act" could not be sourced. It is reinstated now on a narrower
   and fully sourced claim — damage measured against MONEY ACTUALLY RELEASED
   AND SPENT, all three figures the government's own. That is not a
   cost-benefit study and the caption says so; it is the arithmetic of what
   inaction has cost beside what action has been given. The distinction is
   printed rather than glossed, which is the only reason the hook can stand. */
B.money = () => `    <div class="wrap">
${opener('money','The cost of inaction is more than the action','Allocated is the claim. Utilised is the record. Both are dwarfed by the damage — and all three numbers are the government&rsquo;s own.')}
      <div class="p-money">
        <div class="p-money-r"><p class="lbl">The damage, each year</p><p class="num rl">&#8377;7 lakh crore</p>
          <p class="cap">about $95 billion, roughly <b>3% of GDP</b> &mdash; the report&rsquo;s own comparisons are
          50% of all tax collected annually, and 150% of India&rsquo;s health budget.
          <span class="p-cite">Dalberg with Clean Air Fund and CII, 2021.</span></p></div>
        <div class="p-money-r"><p class="lbl">Released for it since 2019</p><p class="num rl">&#8377;13,415 crore</p>
          <p class="cap">NCAP and the 15th Finance Commission air-quality grants, <b>cumulative</b>.</p></div>
        <div class="p-money-r"><p class="lbl">Actually spent</p><p class="num rl">&#8377;9,929 crore</p>
          <p class="cap"><b>74%</b> of what was released. The 82 NCAP cities used
          &#8377;831 crore of &#8377;1,615 crore &mdash; <b>51%</b>.</p></div>
      </div>
      <p class="body p-key"><b>One year of damage costs about fifty times everything released for it since
        2019</b>, and about seventy times what has been spent. Both periods are stated because the comparison
        only holds if they are: the damage figure is annual, the spending figures are cumulative.</p>
      <p class="cap p-hole"><b>What this is not.</b> It is not a cost-benefit study &mdash; nobody has
        published a costed abatement plan for Delhi-NCR, so this page cannot tell you what fixing the air
        would cost. It is the narrower claim, and the only one the figures support: <b>what the damage costs
        each year, beside what has actually been released and spent against it.</b> Sources: PIB releases,
        CPCB&rsquo;s PRANA funding guidelines, CREA&rsquo;s <i>Tracing the Hazy Air</i>, Dalberg with Clean
        Air Fund and CII. No inference is drawn beyond the arithmetic.</p>
    </div>`;

B.act = () => {
  const items = NEWS.register.items ?? [];
  const ORDER_RE = /\b(NGT|tribunal|supreme court|high court|CAQM|gazette|directs?|order|verdict|bench)\b/i;
  const order = items.find(i => ORDER_RE.test(i.title));
  /* ── WATCH YOUR WARD (D-22.2). Built, and asking for a MONITOR rather than a
     pincode — for a sourced reason, printed below. India Post's own directory
     publishes 562 Delhi post offices and no coordinates at all, so a pincode
     cannot honestly be turned into a place. Importing an unsourced centroid
     file to power the one interactive feature on a page about provenance would
     have been the page contradicting itself.
     The picker works with no credentials. The subscription needs two, and the
     form says which — it will not take an address it cannot store or email. */
  const pAsk = `<div class="p-act">
          <div class="p-act-c">
            <p class="lbl">Watch your monitor</p>
            <p class="body">One message when your monitor&rsquo;s band changes for the worse. Not when it is
              merely over the limit &mdash; it is over the limit most of the year, and an alert every hour is
              not an alert. <b>Nothing else, ever</b>, and no address is shared with anybody.</p>
            <div class="p-ward" data-ward>
              <p class="f-lab" id="ward-l">Find the monitor nearest you</p>
              <p><input class="f" id="ward-q" type="text" aria-labelledby="ward-l"
                  autocomplete="off" placeholder="Type a locality &mdash; Dwarka, Anand Vihar, Rohini&hellip;"></p>
              <div id="ward-list" class="p-ward-l" role="listbox" aria-labelledby="ward-l"></div>
              <p class="cap" id="ward-state">Loading the ${AIR.spread.stations} monitors&hellip;</p>
              <div id="ward-pick" class="p-ward-p" hidden>
                <p class="lbl">Your monitor</p>
                <p class="body" id="ward-pick-n"></p>
                <p class="f-lab" id="ward-el">Where to write</p>
                <p><input class="f" id="ward-e" type="email" aria-labelledby="ward-el"
                    autocomplete="email" placeholder="you@example.com"></p>
                <p><button type="button" class="b b-1" id="ward-go">Watch this monitor ${ARROW}</button></p>
                <p class="cap" id="ward-msg" role="status" aria-live="polite"></p>
              </div>
            </div>
            <p class="cap p-hole"><b>Why it asks for a monitor and not a pin code.</b> India Post&rsquo;s own
              All India Pincode Directory publishes <b>562 post offices for Delhi and no latitude or longitude
              column at all</b>, so there is no official way to turn a Delhi pin code into a point on the
              ground. The alternative was a third-party centroid file of unknown provenance &mdash; on this
              page, of all pages. A monitor is the better question anyway: two of them
              <a class="lk" href="#geography">3.9 km apart</a> read 392 and 110.</p>
          </div>
          <div class="p-act-c">
            <p class="lbl">The campaign</p>
            <p class="body"><b>Delhi I Can&rsquo;t See You</b> is Swechha&rsquo;s campaign on this. This page is
              the why; the campaign is the what.</p>
            <p><a class="b b-2" href="/work/campaigns#delhi-i-cant-see-you">Delhi I Can&rsquo;t See You ${ARROW}</a></p>
            <p class="lbl" style="margin-top:var(--gap-row)">Five more situations</p>
            <p class="body p-sib-n">Yamuna &middot; Heatwave &middot; Forest fires &middot; Forest loss &middot; Climate event</p>
            <p class="cap">Named, not linked, until their pages exist.</p>
            <p><a class="act" href="${INDEX_PAGE.route}">All situations ${ARROW}</a></p>
          </div></div>`;
  const pNews = `<div class="p-news">
          ${order ? `<div class="p-news-o"><p class="lbl p-news-ol">Most recent order, as reported</p>
            <p class="body"><a class="lk" href="${esc(order.link)}" rel="noopener" target="_blank">${esc(order.title)}</a></p>
            <p class="cap">${esc(order.publisher)} &middot; ${esc(order.published).slice(0,16)}. <b>Reported, not
              filed.</b> This page keeps no docket and attaches no judgement &mdash; it records that a court was
              reported to have said something, and links whoever reported it.</p></div>` : ''}
          ${items.slice(0,6).map(i=>`<div class="p-news-r"><a class="lk" href="${esc(i.link)}" rel="noopener" target="_blank">${esc(i.title)}</a>
            <span class="cap p-news-m">${esc(i.publisher)} &middot; ${esc(i.published).slice(5,16)}</span></div>`).join('')}
          <p class="cap">${NEWS.register.count} items from ${Object.keys(NEWS.register.publishers||{}).length} publishers, via Google News.
            <b>Reporting is tagged as reporting. Never presented as Swechha&rsquo;s finding.</b> A headline is
            evidence that something was said, not that it is true.</p></div>`;
  /* ── THE DIY BANK (D-17.6). Two things a reader can actually do, and the
     honest caveat on each. The calibration point is the important one: a
     low-cost sensor that has never been co-located with a reference monitor
     produces a number, not a measurement — which is this page's own argument
     turned back on its reader. */
  const pDo = `<div class="p-do">
          <div class="p-do-r">
            <p class="lbl">Build a monitor, and then distrust it</p>
            <p class="body">A classroom-grade PM sensor costs a few thousand rupees &mdash; an optical
              particle counter, a microcontroller, a power supply. It will give you a PM2.5 number within
              minutes of switching on. <b>That number means nothing yet.</b></p>
            <p class="cap">Low-cost optical sensors read high in humidity and drift as their chamber
              fouls. To turn a reading into a measurement you <b>co-locate</b> it beside a reference
              station for a fortnight and fit your device against theirs. That is the whole difference
              between the ${AIR.spread.stations} instruments on this page and a gadget on a windowsill,
              and it is why this page will not accept a crowd-sourced reading as equivalent.</p>
          </div>
          <div class="p-do-r">
            <p class="lbl">File a complaint that lands somewhere</p>
            <p class="body">Open burning, a construction site without sheeting, a generator running in
              a residential block, a road left unswept &mdash; each is already prohibited under rules
              somebody is meant to enforce.</p>
            <p class="cap"><b>Sameer</b>, CPCB&rsquo;s own app, publishes the same station data this page
              reads and takes a geotagged photograph as a complaint. <b>Green Delhi</b>, the Delhi
              government&rsquo;s app, routes the same thing to the responsible department with a
              trackable number. Neither is Swechha&rsquo;s and neither is endorsed &mdash; they are
              named because a complaint with a reference number is harder to lose than a complaint
              without one.</p>
          </div>
          <div class="p-do-r">
            <p class="lbl">Read the objection window</p>
            <p class="body">Environmental clearances carry a public-consultation stage with a fixed
              window for written objections. Most close unopposed because nobody was watching.</p>
            <p class="cap">This page does not yet track those windows for Delhi-NCR. It is named here
              because it is the highest-leverage thing on the list, not because it is built.</p>
          </div></div>`;
  return `    <div class="wrap">
${opener('act','What you can do','Nobody visits a record every morning. This is the part that asks something of you.')}
${tabs('Act', [['Watch your ward', pAsk], ['Do it yourself', pDo], ['What is being said', pNews]])}
      <div class="p-close">
        <div class="p-close-r">
          <p class="lbl">Every reading, kept</p>
          <p class="cap">Each day&rsquo;s reading keeps its own address, with the station that produced it,
            the hour it was observed, and the limit it was judged against. Nothing is overwritten when it
            improves and nothing is quietly restated when it gets worse. <b>An empty day stays empty</b>
            &mdash; a gap in the record is a gap in the record, never a zero.</p>
        </div>
        <div class="p-close-r">
          <p class="lbl">Cite this page</p>
          <p class="cap"><b>Reuse freely &mdash; CC BY 4.0.</b> Every figure carries its source and its
            cadence in <a class="lk" href="#measured">how the number is made</a>, and every figure carries
            whether it was counted or modelled on the rule beneath it. If you quote a number from here,
            quote the kind with it.</p>
        </div>
      </div>
${siblings('air')}
    </div>`;
};

/* ═══ PAGE CSS ═══════════════════════════════════════════════════════════
   ★ NOTHING IN THIS BLOCK MAY CONTAIN ${...}.
   situation-shell.mjs lifts this template out of this file AS RAW TEXT to give
   the other five pages the same tab component and rules. Text, not evaluation
   — so an interpolation here arrives in five other pages as the literal
   characters "${NAME}". That happened once, with ${FAMILY_CSS}, and six pages
   shipped it before `verify:final` caught it. The family CSS is now appended in
   THE DOCUMENT below instead, where it is evaluated and not extracted.
   ═══════════════════════════════════════════════════════════════════════ */
const PAGE_CSS = `
/* ══ AD-14 / D-19.3 — THIS PAGE'S OWN BLOCK ═══════════════════════════════
   Everything above was EXTRACTED from the frozen home.html. Six sub-blocks
   were left behind deliberately and are named in the build script.
   Every voice, hue, rule and mark below is a frozen component. Layout only.
   ═══════════════════════════════════════════════════════════════════════ */

/* MEASURED vs MODELLED, carried by the rule (D-17.6). Solid = measured.
   DOTTED = modelled. Dashed is NOT reused: §5.7 gives dashed to a shut
   window, and dotted is already the placeholder grammar — the nearer
   neighbour to "not a direct measurement". Three styles, three meanings. */
.p-kind{display:inline-block;font-family:Archivo,system-ui,sans-serif;
  font-variation-settings:'wdth' 88,'wght' 650;font-size:var(--t-micro);
  letter-spacing:.14em;text-transform:uppercase;color:var(--fg-2);
  border-bottom:2px solid var(--hair);padding-bottom:3px}
.p-kind-m{border-bottom-style:dotted;border-bottom-color:var(--fg-3)}
.paper .p-kind,.paper-2 .p-kind{color:var(--ink-2);border-bottom-color:var(--rule-2)}

/* HERO. THE PICTURE BAND, not a photograph behind the readout.
   The frozen CSS states the rule and the measurements behind it:
   "DISPLAY TYPE MAY SIT ON A PHOTOGRAPH. NOTHING ELSE MAY." — copy over a
   full frame failed contrast twice, because the reading block is tall enough
   to cover the frame edge to edge and any scrim strong enough for 12px
   metadata darkens the whole photograph to a rectangle. So: h1 only, over the
   frame, on .pic-over's ramp; the readout, the scale, the provenance and the
   national panel all sit on solid ground in .pic-body directly beneath it,
   where contrast cannot drift. .pic and .pic-over are the homepage's own,
   extracted verbatim — this page adds no new photographic treatment.
   T1 carries no padding by contract; padding-block never the shorthand, or
   .wrap's horizontal gutter is reset to zero. */
.p2-hero{padding-block:0 var(--pad-t3);display:grid;gap:var(--gap-block)}
.p2-top{display:flex;flex-wrap:wrap;gap:12px var(--gap-block);align-items:baseline;
  justify-content:space-between}
.p2-method{color:var(--fg-2);margin:0}
/* The reading and the national panel, one row. The reading is the subject and
   keeps the wider column; the panel is context and is ruled off, not boxed. */
.p2-cols{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);
  gap:var(--gap-block) clamp(28px,4vw,72px);align-items:start}
.p2-nat{border-top:1px solid var(--hair);padding-top:var(--gap-row)}
.p2-nat>*{margin:0}
.p2-nat-h{color:var(--fg-2)}
.p2-nat-l{color:var(--fg-3);max-width:38ch;margin:10px 0 var(--gap-row)!important}
.p-nr{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:0 14px;align-items:baseline;
  border-bottom:1px solid var(--hair);padding:9px 0}
.p-nr-n{font-family:Newsreader,Georgia,serif;font-size:16px;min-width:0}
.p-nr-v{font-family:Archivo,system-ui,sans-serif;font-variation-settings:'wdth' 74,'wght' 800;
  font-size:19px;letter-spacing:-.02em;font-variant-numeric:tabular-nums;text-align:right}
.p-nr-v.is-red{color:var(--red)}
.p-nr-s{color:var(--fg-3);min-width:3.4em;text-align:right}
/* MUSTARD IS THE HUMAN ACT, so it cannot mark "this is the city you are
   reading" — that is a position in a table, not an act. The row Delhi is on
   is marked by WEIGHT and a left rule in the ground's own ink instead. */
.p-nr.is-me{border-left:2px solid var(--fg);padding-left:12px}
.p-nr.is-me .p-nr-n{font-family:Archivo,system-ui,sans-serif;
  font-variation-settings:'wdth' 80,'wght' 700;font-size:15px;letter-spacing:.02em;
  text-transform:uppercase}
.p2-nat-c{color:var(--fg-3);max-width:40ch;margin:var(--gap-row) 0!important}
.p2-read{position:relative;border-top:1px solid var(--hair);
  padding-top:var(--gap-row);display:grid;gap:10px;justify-items:start}
.p2-state{position:absolute;top:var(--gap-row);right:0;margin:0}
.p2-read>*{margin:0}
.p2-read .bands{width:100%}
.p2-read .bands i{flex:1 1 0;min-width:0}
.p2-src{color:var(--fg-3);max-width:60ch;border-top:1px solid var(--hair-2);
  padding-top:10px;margin-top:4px}

/* THE STRIP. Not a band: a rule between bands, on chrome padding. Caged —
   own hex, hairline top and bottom, micro type, never any mustard. Red only:
   Swechha's outcomes are not on this page at all, so no exemption is used. */
#strip{background:var(--ground-2);border-top:1px solid var(--hair);
  border-bottom:1px solid var(--hair);padding:14px 0}
.p-strip-in{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px 18px}
.p-cell{display:grid;gap:2px;text-decoration:none;color:inherit;min-width:0;position:relative}
.p-cell-v{font-family:Archivo,system-ui,sans-serif;font-variation-settings:'wdth' 64,'wght' 800;
  font-size:clamp(1.3rem,3.4vw,2rem);letter-spacing:-.02em;line-height:1;
  font-variant-numeric:tabular-nums;border-bottom:1px solid var(--hair);padding-bottom:6px}
.p-cell-v.is-red{border-bottom-color:var(--red)}
.p-cell-l{color:var(--fg-2)}
.p-cell-s{color:var(--fg-3)}
.p-strip-note{grid-column:1/-1;color:var(--fg-3);margin:4px 0 0}

/* TWO-UP AND ROWS. Shared by people / sources / money. */
.p-two{display:grid;grid-template-columns:1fr 1fr;gap:var(--gap-row) clamp(24px,4vw,64px);
  border-top:1px solid var(--hair);padding-top:var(--gap-row)}
.p-two-c>*{margin:0}
.p-two-c .num{margin-bottom:6px}
.p-two-c .cap{color:var(--fg-2);margin-top:8px}
.p-ratio{max-width:62ch;margin:var(--gap-row) 0 0}
.p-cite{color:var(--fg-3)}
.paper .p-cite,.paper-2 .p-cite{color:var(--ink-3)}
.p-rows{margin-top:var(--gap-block)}
.p-row{display:grid;grid-template-columns:minmax(0,auto) minmax(0,1fr);
  gap:8px clamp(20px,3vw,44px);align-items:start;border-top:1px solid var(--hair);padding:18px 0}
.p-row:last-child{border-bottom:1px solid var(--hair)}
.p-row>*{margin:0}
.p-row .body{max-width:52ch}
.p-row .cap{color:var(--fg-2);margin-top:8px;max-width:58ch}

/* THE KIND RULE (D-17.6 standout 1). SOLID = counted or measured. DOTTED =
   modelled. Dashed is deliberately NOT reused: §5.7 gives dashed to a shut
   window, and dotted is already the placeholder grammar — the nearer
   neighbour to "not a direct measurement". Ink and never hue: the kind of a
   figure is not the same question as whether a limit fell. */
.p-kd{display:inline-block;padding-bottom:5px;border-bottom:2px solid var(--hair)}
.p-kd-m{border-bottom-style:dotted;border-bottom-color:var(--fg-3)}
.paper .p-kd,.paper-2 .p-kd{border-bottom-color:var(--rule-2)}
.paper .p-kd-m,.paper-2 .p-kd-m{border-bottom-color:var(--ink-3)}
.p-legend{display:flex;flex-wrap:wrap;gap:10px 26px;margin:0 0 var(--gap-row);color:var(--fg-3)}
.p-row .p-kd,.p-map .p-kd{margin-left:8px;font-size:var(--t-micro)}
.p-hole{border-left:2px dotted var(--hair);padding-left:14px;margin-top:var(--gap-row)!important;
  color:var(--fg-3);max-width:62ch}
.paper .p-hole,.paper-2 .p-hole{border-left-color:var(--rule-2);color:var(--ink-3)}

/* MEASURED. Explainers, sub-indices, the two-scale device, the method table. */
.p-expl{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0;
  border-top:1px solid var(--rule);margin-bottom:var(--gap-block)}
.p-expl>div{padding:var(--gap-row) clamp(14px,2vw,28px) var(--gap-row) 0;border-right:1px solid var(--rule)}
.p-expl>div:last-child{border-right:0}
.p-expl-h{font-family:Archivo,system-ui,sans-serif;font-variation-settings:'wdth' 74,'wght' 800;
  font-size:20px;letter-spacing:-.01em;margin:0;text-transform:uppercase}
/* NOT ON MUSTARD. The page this replaces put this line on a mustard fill at
   1.31:1 (D-18.1). It sits on the band's own ground. */
.p-expl-s{font-size:19px;font-weight:300;color:var(--ink-2);margin:6px 0 10px}
.p-expl-b{font-size:16px;line-height:1.5;color:var(--ink-2);margin:0}
.p-quote{max-width:62ch;margin:0 0 var(--gap-row)}
.p-subs{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));border-top:1px solid var(--rule)}
.p-sub{padding:var(--gap-row) 10px var(--gap-row) 0;border-right:1px solid var(--rule);min-width:0}
.p-sub:last-child{border-right:0}
.p-sub>*{margin:0}
.p-sub-n,.p-sub-c{color:var(--ink-3)}
.p-sub-v{font-family:Archivo,system-ui,sans-serif;font-variation-settings:'wdth' 74,'wght' 800;
  font-size:clamp(1.4rem,2.6vw,2.2rem);letter-spacing:-.02em;line-height:1;color:var(--ink-3);
  margin:8px 0 6px;font-variant-numeric:tabular-nums}
/* Weight and ink, never hue: which pollutant decided the number is not a
   question of whether a limit fell. */
.p-sub.is-gov .p-sub-n,.p-sub.is-gov .p-sub-v,.p-sub.is-gov .p-sub-c{color:var(--ink)}
.p-sub-g{color:var(--ink);margin-top:8px}
.p-miss{color:var(--ink-3);max-width:64ch;margin:14px 0 0}
.p-key{max-width:62ch;margin:var(--gap-row) 0 0}
.p-scales{border-top:1px solid var(--rule);margin-top:var(--gap-block);padding-top:var(--gap-row)}
.p-scales-l{color:var(--ink-3)}
.p-scales-r{display:grid;grid-template-columns:1fr 1fr;gap:clamp(20px,3vw,48px);margin:14px 0}
.p-scales-r>div>*{margin:0}
.p-scales .cap{color:var(--ink-2);max-width:62ch}
.p-method{border-top:1px solid var(--rule);margin-top:var(--gap-block);padding-top:var(--gap-row)}
.p-tbl{width:100%;border-collapse:collapse;margin:14px 0;font-size:var(--t-cap);
  font-family:Newsreader,Georgia,serif}
.p-tbl th{text-align:left;font-family:Archivo,system-ui,sans-serif;
  font-variation-settings:'wdth' 88,'wght' 650;font-size:var(--t-micro);letter-spacing:.14em;
  text-transform:uppercase;color:var(--ink-3);border-bottom:1px solid var(--rule-2);padding:0 10px 8px 0}
.p-tbl td{padding:9px 10px 9px 0;border-bottom:1px solid var(--rule);color:var(--ink-2);vertical-align:top}
.p-method .cap{color:var(--ink-3);max-width:62ch}

/* THE APPORTIONMENT SPLIT. Registers and bars — width and ink only. Hue is
   not available: red means a published limit was broken, and a sector holding
   a large share is not that. */
.p-ap>*{margin:0 0 var(--gap-row)}
.p-ap>*:last-child{margin-bottom:0}
.p-ap-k,.p-ap-f{max-width:62ch}
.p-ap-h,.p-ap-r{display:grid;grid-template-columns:minmax(0,9.5em) minmax(0,1fr) minmax(0,1fr) 2.6em;
  gap:0 14px;align-items:center}
.p-ap-h{border-bottom:1px solid var(--hair);padding-bottom:8px;margin-bottom:0}
.p-ap-h .lbl{color:var(--fg-3)}
.p-ap-r{border-bottom:1px solid var(--hair);padding:10px 0;margin:0}
.p-ap-n{font-family:Newsreader,Georgia,serif;font-size:16px;min-width:0}
.p-ap-w{display:flex;align-items:center;gap:8px;min-width:0}
.p-ap-b{display:block;height:9px;background:var(--fg-2);flex:none;min-width:1px}
.p-ap-s .p-ap-b{background:var(--fg-3)}
.p-ap-v{font-family:Archivo,system-ui,sans-serif;font-variation-settings:'wdth' 88,'wght' 700;
  font-size:var(--t-micro);color:var(--fg);font-style:normal;font-variant-numeric:tabular-nums;flex:none}
.p-ap-d{color:var(--fg-3);text-align:right;font-variant-numeric:tabular-nums}
.p-ap-r2{grid-template-columns:minmax(0,11em) minmax(0,1fr)}
.p-ap .cap{color:var(--fg-3);max-width:64ch}
/* THE RANGE CHART. A line from low to high on a shared axis: the LENGTH is
   the uncertainty, which is the whole point of the panel. */
.p-rg{border-top:1px solid var(--hair)}
.p-rg-r{display:grid;grid-template-columns:minmax(0,12em) minmax(0,1fr) 5.2em;gap:0 14px;
  align-items:center;border-bottom:1px solid var(--hair);padding:11px 0}
.p-rg-n{font-family:Newsreader,Georgia,serif;font-size:16px;min-width:0}
.p-rg-t{position:relative;height:11px;min-width:0}
.p-rg-t::before{content:'';position:absolute;left:0;right:0;top:5px;height:1px;background:var(--hair-2)}
.p-rg-l{position:absolute;top:3px;height:5px;background:var(--fg);display:block}
.p-rg-l::before,.p-rg-l::after{content:'';position:absolute;top:-3px;width:1.5px;height:11px;background:var(--fg)}
.p-rg-l::before{left:0}
.p-rg-l::after{right:0}
.p-rg-v{font-family:Archivo,system-ui,sans-serif;font-variation-settings:'wdth' 88,'wght' 700;
  font-size:var(--t-micro);color:var(--fg);text-align:right;font-variant-numeric:tabular-nums}
.p-rg-ax{display:flex;justify-content:space-between;padding-top:8px;
  font-family:Archivo,system-ui,sans-serif;font-size:var(--t-micro);letter-spacing:.14em;
  text-transform:uppercase;color:var(--fg-3)}
.p-ap-sub{border-top:1px solid var(--hair)}

/* SOURCES / FIRES. */
.p-fire{border-top:1px solid var(--hair);margin-top:var(--gap-block);padding-top:var(--gap-row)}
.p-fire .lbl{color:var(--fg-2)}
.p-gapkey{max-width:62ch;margin:var(--gap-row) 0}
.p-yy-l{margin-top:var(--gap-block)!important;color:var(--fg-2)}
.p-yy{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:8px;align-items:end;
  height:150px;margin:14px 0;border-bottom:1px solid var(--hair)}
.p-yy-c{display:grid;align-content:end;gap:4px;height:100%;min-width:0}
.p-yy-bar{display:block;background:var(--fg-2);width:100%;align-self:end}
.p-yy-v{font-family:Archivo,system-ui,sans-serif;font-variation-settings:'wdth' 88,'wght' 700;
  font-size:var(--t-micro);color:var(--fg);font-variant-numeric:tabular-nums}
.p-yy-y{color:var(--fg-3)}
.p-fire .cap{color:var(--fg-3);max-width:64ch;margin-top:10px}

/* TREND. The day grid, the attention series, the forecast. */
.p-grid-wrap .lbl,.p-attn .lbl,.p-fc .lbl{color:var(--fg-2)}
.p-grid{display:grid;grid-template-columns:repeat(31,1fr);gap:2px;margin:14px 0;max-width:620px}
.p-grid i{aspect-ratio:1;background:var(--hair-2);border-radius:1px}
.p-grid i.p-g-on{background:var(--red)}
.p-grid-wrap .cap{color:var(--fg-3);max-width:62ch}
.p-attn{border-top:1px solid var(--hair);margin-top:var(--gap-block);padding-top:var(--gap-row)}
.p-attn-c{display:flex;gap:3px;align-items:flex-end;height:132px;margin:14px 0 6px;
  border-bottom:1px solid var(--hair)}
.p-attn-b{flex:1 1 0;background:var(--fg-3);min-width:0}
.p-attn-x{display:flex;justify-content:space-between;font-family:Archivo,system-ui,sans-serif;
  font-size:var(--t-micro);letter-spacing:.14em;color:var(--fg-3)}
.p-attn .body{max-width:62ch;margin:var(--gap-row) 0 0}
.p-attn .cap{color:var(--fg-3);max-width:64ch;margin-top:10px}
.p-fc{border-top:1px solid var(--hair);margin-top:var(--gap-block);padding-top:var(--gap-row)}
.p-fc-c{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:8px;align-items:end;
  height:140px;margin:14px 0;border-bottom:1px solid var(--hair)}
.p-fc-d{display:grid;align-content:end;gap:4px;height:100%;min-width:0}
.p-fc-bar{position:relative;display:block;width:100%;background:var(--fg-3);align-self:end}
.p-fc-rng{position:absolute;left:0;right:0;background:var(--hair);display:block}
.p-fc-v{font-family:Archivo,system-ui,sans-serif;font-variation-settings:'wdth' 88,'wght' 700;
  font-size:var(--t-micro);color:var(--fg);font-variant-numeric:tabular-nums}
.p-fc-x{color:var(--fg-3)}
.p-fc .body{max-width:62ch;margin:var(--gap-row) 0 0}
.p-fc .cap{color:var(--fg-3);margin-top:8px}

/* GEOGRAPHY. Register rows, worst first. */
.p-rank .lbl,.p-nat .lbl{color:var(--fg-2)}
.p-rank-r{display:grid;grid-template-columns:4.2em minmax(0,1fr) auto;gap:0 16px;align-items:baseline;
  border-bottom:1px solid var(--hair);padding:11px 0}
.p-rank-v{font-family:Archivo,system-ui,sans-serif;font-variation-settings:'wdth' 74,'wght' 800;
  font-size:22px;letter-spacing:-.02em;font-variant-numeric:tabular-nums;text-align:right}
.p-rank-v.is-red{color:var(--red)}
.p-rank-n{font-family:Newsreader,Georgia,serif;font-size:16.5px;min-width:0}
.p-rank-g{color:var(--fg-3)}
.p-rank-more{color:var(--fg-3);text-align:center;padding:10px 0;margin:0;
  border-bottom:1px solid var(--hair)}
.p-rank .cap,.p-nat .cap{color:var(--fg-3);max-width:64ch;margin-top:12px}
.p-nat{border-top:1px solid var(--hair);margin-top:var(--gap-block);padding-top:var(--gap-row)}
.p-nat .body{max-width:62ch;margin:12px 0 0}

/* THE MAP. Real positions, equal scale on both axes. Squares, hairlines and
   type — the same three marks the rest of the page is built from, so the map
   is not a new visual system. No fill, no gradient, no plume. */
.p-map{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);
  gap:var(--gap-row) clamp(28px,4vw,64px);align-items:start}
.p-map-s{display:block;width:100%;max-width:480px;height:auto;margin:0 0 14px;overflow:visible}
.p-map-lg{margin:0}
.p-sw{display:inline-block;width:9px;height:9px;margin-right:8px;vertical-align:baseline}
.p-sw-hi{background:var(--red)}
.p-sw-lo{background:var(--fg-3)}
.p-m-fr{fill:none;stroke:var(--hair);stroke-width:1}
.p-m-ln{stroke:var(--red);stroke-width:1;stroke-dasharray:3 3}
.p-m-lo{fill:var(--fg-3)}
.p-m-hi{fill:var(--red)}
/* The two labelled numerals sit in the densest part of the map, so one of
   them landed on a neighbouring monitor. Separated by a stroke in the BAND'S
   OWN GROUND, drawn under the fill — the same principle as .pic-over's ramp
   (type over a busy field needs separation), not a decorative outline. The
   map only ever renders inside #geography, whose ground is --ground-2. */
.p-m-lb text{font-family:Archivo,system-ui,sans-serif;font-variation-settings:'wdth' 74,'wght' 800;
  font-size:14px;fill:var(--fg);font-variant-numeric:tabular-nums;
  stroke:var(--ground-2);stroke-width:3.5px;paint-order:stroke fill}
.p-m-sc line{stroke:var(--fg-3);stroke-width:1}
.p-m-sc text{font-family:Archivo,system-ui,sans-serif;font-size:9px;letter-spacing:.14em;
  text-transform:uppercase;fill:var(--fg-3)}
.p-map-k{max-width:62ch;margin:0 0 12px}
.p-map .cap{color:var(--fg-3);max-width:64ch;margin:0 0 10px}

/* MONEY. Three registers at wildly different scales; the gap does the work. */
.p-money{border-top:1px solid var(--rule);margin-top:0}
.p-money-r{border-bottom:1px solid var(--rule);padding:var(--gap-row) 0}
.p-money-r>*{margin:0}
.p-money-r .lbl{color:var(--ink-3)}
.p-money-r .num{margin:8px 0}
.p-money-r .cap{color:var(--ink-2);max-width:60ch}

/* ACT. */
.p-act{display:grid;grid-template-columns:1.4fr 1fr;gap:var(--gap-row) clamp(28px,4vw,64px);
  border-top:1px solid var(--hair);padding-top:var(--gap-row)}
.p-act-c>*{margin:0 0 12px}
.p-act-c>*:last-child{margin-bottom:0}
.p-act-c .lbl{color:var(--fg-2)}
.p-act-c .body{max-width:48ch}
.p-act-c .cap{color:var(--fg-3)}
.p-news{border-top:1px solid var(--hair);margin-top:var(--gap-block);padding-top:var(--gap-row)}
.p-news .lbl{color:var(--fg-2)}
.p-news-o{border-left:2px solid var(--hair);padding-left:16px;margin:14px 0 var(--gap-row)}
.p-news-o>*{margin:0 0 8px}
.p-news-ol{color:var(--fg-3)}
.p-news-o .cap{color:var(--fg-3);max-width:62ch}
.p-news-r{display:grid;gap:3px;border-bottom:1px solid var(--hair);padding:12px 0}
.p-news-m{color:var(--fg-3)}
.p-news .cap{color:var(--fg-3);max-width:64ch;margin-top:12px}
.p-sib{border-top:1px solid var(--hair);margin-top:var(--gap-block);padding-top:var(--gap-row)}
.p-sib .lbl{color:var(--fg-2)}
.p-sib-n{color:var(--fg-2);margin:10px 0}
.p-sib .cap{color:var(--fg-3)}
.p-cite-b{color:var(--fg-3);border-top:1px solid var(--hair-2);margin-top:var(--gap-block);
  padding-top:14px;max-width:64ch}
/* WATCH YOUR MONITOR. A register of monitors, each with its live reading, so
   choosing one is also reading the page's argument. 44px targets throughout. */
.p-ward{margin:0 0 12px}
.p-ward-l{border-top:1px solid var(--hair);margin:12px 0 10px}
.p-ward-r{display:grid;grid-template-columns:minmax(0,1fr) 3.2em auto;gap:0 14px;
  align-items:baseline;width:100%;text-align:left;appearance:none;background:none;
  border:0;border-bottom:1px solid var(--hair);padding:12px 0;min-height:44px;
  cursor:pointer;color:inherit;font:inherit}
.p-ward-r:hover .p-ward-n,.p-ward-r:focus-visible .p-ward-n{text-decoration:underline;
  text-underline-offset:3px}
.p-ward-n{font-family:Newsreader,Georgia,serif;font-size:16.5px;min-width:0}
.p-ward-v{font-family:Archivo,system-ui,sans-serif;font-variation-settings:'wdth' 74,'wght' 800;
  font-size:19px;letter-spacing:-.02em;font-variant-numeric:tabular-nums;text-align:right}
.p-ward-v.is-red{color:var(--red)}
.p-ward-b{color:var(--fg-3)}
.p-ward-hint,.p-ward-none{color:var(--fg-3);padding:10px 0 0;margin:0}
.p-ward-p{border-top:1px solid var(--hair-2);margin-top:var(--gap-row);padding-top:var(--gap-row)}
.p-ward-p>*{margin:0 0 12px}
.p-ward-p>*:last-child{margin-bottom:0}
.p-ward-p .lbl{color:var(--fg-2)}
.p-ward-p .body{max-width:52ch}
.p-ward-p .cap{color:var(--fg-3);max-width:56ch}
/* The submit is a real <button>; the frozen .b pill is styled for <a>. */
button.b{appearance:none;border:0;font:inherit;cursor:pointer}
button.b[disabled]{opacity:.55;cursor:default}

/* THE DIY BANK. A register, not cards: three rows on hairlines. */
.p-do-r{border-top:1px solid var(--hair);padding:var(--gap-row) 0}
.p-do-r:last-child{border-bottom:1px solid var(--hair)}
.p-do-r>*{margin:0 0 10px}
.p-do-r>*:last-child{margin-bottom:0}
.p-do-r .lbl{color:var(--fg-2)}
.p-do-r .body{max-width:58ch}
.p-do-r .cap{color:var(--fg-3);max-width:64ch}
/* THE CLOSE. Two registers on the band's own hairline, below the tabs, so
   they are never hidden behind a tab — a citation must not be a panel. */
.p-close{display:grid;grid-template-columns:1fr 1fr;gap:var(--gap-row) clamp(28px,4vw,64px);
  border-top:1px solid var(--hair-2);margin-top:var(--gap-block);padding-top:var(--gap-row)}
.p-close-r>*{margin:0 0 10px}
.p-close-r>*:last-child{margin-bottom:0}
.p-close-r .lbl{color:var(--fg-2)}
.p-close-r .cap{color:var(--fg-3);max-width:56ch}

/* ══ TABS (D-21.1) ═════════════════════════════════════════════════════
   The frozen deck's tab grammar, reused for long data objects. Marker is a
   3px border-top in the ground's own ink — THERE IS NO RED VARIANT AND NO
   MUSTARD VARIANT (§5.2). The negative margin and the equal padding are the
   deck's own fix for a focus ring clipped by a scroll container, and they
   MUST move together: dropping either re-clips the ring. */
.p-tabs-l{display:flex;gap:0;overflow-x:auto;scrollbar-width:none;
  margin:-5px -5px 0;padding:5px 5px 0;scroll-padding-inline:5px;
  border-bottom:1px solid var(--hair)}
.paper .p-tabs-l,.paper-2 .p-tabs-l{border-bottom-color:var(--rule)}
.p-tabs-l::-webkit-scrollbar{display:none}
.p-tabs-l button{appearance:none;background:none;border:0;border-top:3px solid transparent;
  color:var(--fg-3);font-family:Archivo,system-ui,sans-serif;
  font-variation-settings:'wdth' 92,'wght' 650;font-size:12.5px;letter-spacing:.13em;
  text-transform:uppercase;padding:14px 18px 14px 0;cursor:pointer;white-space:nowrap;
  min-height:44px;flex:none}
.paper .p-tabs-l button,.paper-2 .p-tabs-l button{color:var(--ink-3)}
.p-tabs-l button[aria-selected=true]{color:var(--fg);border-top-color:var(--fg)}
.paper .p-tabs-l button[aria-selected=true],.paper-2 .p-tabs-l button[aria-selected=true]{
  color:var(--ink);border-top-color:var(--ink)}
.p-tabs [role=tabpanel]{padding-top:var(--gap-row)}

/* ── PHONE ─────────────────────────────────────────────────────────────── */
@media (max-width:900px){
  .p-subs{grid-template-columns:1fr}
  .p-sub{display:grid;grid-template-columns:5.5em minmax(0,1fr) auto;gap:0 14px;align-items:baseline;
    border-right:0;border-bottom:1px solid var(--rule);padding:14px 0}
  .p-sub:last-child{border-bottom:0}
  .p-sub-v{font-size:1.5rem;margin:0}
  .p-sub-g{margin:0;text-align:right}
  .p-expl{grid-template-columns:1fr}
  .p-expl>div{border-right:0;border-bottom:1px solid var(--rule);padding-right:0}
  .p-expl>div:last-child{border-bottom:0}
  .p-act{grid-template-columns:1fr}
  .p-close{grid-template-columns:1fr}
  .p-map{grid-template-columns:1fr}
  .p2-cols{grid-template-columns:1fr}
  .p-grid{grid-template-columns:repeat(21,1fr)}
}
@media (max-width:640px){
  /* The strip goes two-up rather than four; four cells at 375 give each
     numeral 78px, which the account column cannot hold. */
  .p-strip-in{grid-template-columns:1fr 1fr}
  .p-scales-r{grid-template-columns:1fr}
  .p-yy{grid-template-columns:repeat(7,minmax(0,1fr));gap:4px}
  .p-yy-v{font-size:10px}
}
@media (max-width:560px){
  /* .p-two does NOT stack: the device IS the side-by-side comparison, and
     the numerals were kept short so a 158px column holds them. */
  .p-two{column-gap:18px}
  .p-two-c .cap{max-width:none}
  .p-row{grid-template-columns:1fr}
  .p-rank-r{grid-template-columns:3.4em minmax(0,1fr) auto;gap:0 12px}
  .p-grid{grid-template-columns:repeat(14,1fr)}
  .p-fc-c{gap:5px}
  .p-fc-v{font-size:10px}
}
`;

/* ═══ ASSEMBLE ═══════════════════════════════════════════════════════════ */
const section = ([id, cls]) => {
  const body = (B[id] || (() => '    <div class="wrap"><p class="lead">—</p></div>'))();
  const labelled = !['top','strip'].includes(id) ? ` aria-labelledby="${id}-h"` : '';
  const aria = id === 'strip' ? ' aria-label="Readings on this page"' : labelled;
  return `  <section${cls ? ` class="${cls}"` : ''} id="${id}"${aria}>\n${body}\n  </section>`;
};

/* ═══ SCRIPT ═════════════════════════════════════════════════════════════
   Assembled as one string BEFORE the document, so the whole block — the two
   extracted homepage IIFEs, the tab controller and the liveness upgrade —
   passes through a single `node --check` gate. That gate exists because a
   concurrent edit to home.html once shifted the extraction range by ten lines
   and the extracted IIFE began mid-function: a parse error that silently
   killed a panel while the console read clean. Checking only the extracted
   part would leave the hand-written part unchecked, which is the same bug
   waiting on a different line. */
const SCRIPT = `/* ── TABS. Canonical ARIA tabs with a roving tabindex. Panels use the
   'hidden' attribute rather than the deck's tabindex trick, and that is
   deliberate: the deck keeps four READINGS in the accessibility tree at once
   because a reader should have all of them; these panels are alternative
   VIEWS of one object, where one at a time is the point and the height
   saving is the reason the band fits at all. */
(function(){
  var groups=[].slice.call(document.querySelectorAll('[data-tabs]'));
  if(!groups.length) return;
  groups.forEach(function(g){
    var tabs=[].slice.call(g.querySelectorAll('[role=tab]'));
    var panels=tabs.map(function(t){ return document.getElementById(t.getAttribute('aria-controls')); });
    function select(i,focus){
      tabs.forEach(function(t,k){
        var on=k===i;
        t.setAttribute('aria-selected',on?'true':'false');
        if(on) t.removeAttribute('tabindex'); else t.setAttribute('tabindex','-1');
        if(panels[k]){ if(on) panels[k].removeAttribute('hidden'); else panels[k].setAttribute('hidden',''); }
      });
      if(focus) tabs[i].focus();
    }
    tabs.forEach(function(t,i){ t.addEventListener('click',function(){ select(i,false); }); });
    g.querySelector('[role=tablist]').addEventListener('keydown',function(e){
      var i=tabs.indexOf(document.activeElement); if(i<0) return;
      var n=null;
      if(e.key==='ArrowRight'||e.key==='ArrowDown') n=(i+1)%tabs.length;
      if(e.key==='ArrowLeft'||e.key==='ArrowUp') n=(i-1+tabs.length)%tabs.length;
      if(e.key==='Home') n=0;
      if(e.key==='End') n=tabs.length-1;
      if(n!==null){ e.preventDefault(); select(n,true); }
    });
  });
})();

/* ── LIVENESS (D-17.4). The page ships a committed reading and UPGRADES.
   LIVE describes the fetch; the age describes the observation, and the badge
   is never allowed to replace the age — both are printed.
   AN ERROR IS NOT A ZERO (D-16.4): every failure path returns early and
   leaves the committed reading and the PERIODIC badge exactly as rendered.
   Nothing here can write a dash, an empty string or a 0 into the readout. */
(function(){
  var BANDS=${JSON.stringify(AIR.bands.map(b=>b.name))}, LIMIT=${AIR.aqiLimit};
  var CITIES=${JSON.stringify(n0(IND.totals.cities))};
  var el=function(i){return document.getElementById(i);};
  var aqi=el('air-aqi'), state=el('air-state');
  if(!aqi||!state||!window.fetch) return;
  fetch('/api/air',{cache:'no-store'}).then(function(r){return r.json();}).then(function(d){
    if(!d||d.ok!==true) return;
    var r=d.reading;
    if(!r||typeof r.aqi!=='number'||!isFinite(r.aqi)||r.aqi<=0||!r.band) return;
    var i=BANDS.indexOf(r.band); if(i<0) return;

    aqi.textContent=String(r.aqi);
    var b=el('air-band'); if(b) b.textContent=r.band;
    var over=r.aqi>LIMIT;
    var lim=el('air-limit');
    if(lim) lim.innerHTML='CPCB safe limit '+LIMIT+'. '+(over?'<b>Limit broken.</b>':'Within the limit.');
    var scale=el('air-bands');
    if(scale){
      var cells=scale.children;
      for(var k=0;k<cells.length;k++){
        cells[k].className=(k<=i?'on':'')+(k===i?' tip':'');
      }
      scale.setAttribute('aria-label',r.band+', band '+(i+1)+' of '+BANDS.length);
    }
    /* The age, not the badge, carries how old the observation is. */
    var src=el('air-src-w');
    if(src&&r.station) src.textContent=r.station+'. Observed '+(r.observed||'time not stated')+'.';
    var ca=el('air-c-aqi'); if(ca) ca.textContent=String(r.aqi);
    var cb=el('air-c-band'); if(cb) cb.textContent=r.band;
    var cv=el('air-c-above');
    if(cv&&d.spread&&typeof d.spread.above_limit==='number'&&typeof d.spread.stations==='number'){
      cv.textContent=d.spread.above_limit+' of '+d.spread.stations;
    }
    /* ── THE NATIONAL PANEL MUST NOT CONTRADICT THE HERO.
       The panel is drawn from a committed national snapshot and the hero from
       the live fetch, so the same city appeared twice with two numbers — 389
       in the hero and 388 in the table, on one screen. Delhi's row is updated
       and MOVED to where its live value puts it among the snapshot rows, and
       the rank sentence is recomputed from the DOM. The other cities are not
       re-fetched and the caption says so. Ordinal words only to eighth,
       because the panel only ever renders eight rows. */
    var row=el('air-nr-delhi'), rv=el('air-nr-delhi-v');
    if(row&&rv){
      rv.textContent=String(r.aqi);
      rv.className='p-nr-v'+(r.aqi>LIMIT?' is-red':'');
      row.setAttribute('data-aqi',String(r.aqi));
      var list=row.parentNode;
      var rows=[].slice.call(list.querySelectorAll('.p-nr'));
      /* The anchor is taken BEFORE sorting — it is whatever sits immediately
         above the first row in document order, and the sorted rows are laid
         back in after it one at a time. Appending would drop them below the
         captions that follow. */
      var anchor=rows[0].previousSibling;
      rows.sort(function(a,b){ return Number(b.getAttribute('data-aqi'))-Number(a.getAttribute('data-aqi')); });
      rows.forEach(function(n){ list.insertBefore(n, anchor?anchor.nextSibling:list.firstChild); anchor=n; });
      var pos=rows.indexOf(row)+1;
      var ORD=['first','second','third','fourth','fifth','sixth','seventh','eighth'];
      var rk=el('air-nat-rank');
      /* LAST PLACE AMONG EIGHT IS NOT A NATIONAL RANK. If Delhi's live value
         falls below every snapshot row, its true position is somewhere below
         eighth and this panel cannot say where — so it says that, instead of
         printing "eighth" and being wrong. */
      /* A TIE IS NOT A PLACE. Delhi and Sasaram both read 389 on the first
         run of this code, and calling that "second" is a sort order dressed
         up as a finding. Equal numbers get equal billing. */
      var above=rows[pos-2], tie=above&&Number(above.getAttribute('data-aqi'))===r.aqi;
      if(rk&&tie){
        rk.innerHTML=CITIES+' cities report to CPCB. Delhi is <b>level with '
          +above.querySelector('.p-nr-n').textContent.trim().replace(/,.*$/,'')
          +'</b> at the top of them, and that changes between hours.';
      } else if(rk){
        rk.innerHTML = (pos < rows.length)
          ? CITIES+' cities report to CPCB. Delhi is <b>'+ORD[pos-1]+' of them</b>, and that changes between hours.'
          : CITIES+' cities report to CPCB. Delhi now reads <b>below all eight cities listed</b>, which were '
            +'read an hour earlier &mdash; so its place in the full table is lower than this panel can show.';
      }
    }
    /* Badge last, so it only ever claims LIVE over a value that landed. */
    state.className='state p2-state live';
    var w=el('air-state-w'); if(w) w.textContent='Live';
    var x=el('air-state-x');
    if(x) x.textContent=' — fetched when this page loaded; the observation time is printed below';
  }).catch(function(){ /* keep the committed reading. */ });
})();

/* ── WATCH YOUR MONITOR (D-22.2). Loads the 43 monitors with their live
   readings, filters as you type, and submits one address for one monitor.
   THE READING BESIDE EACH MONITOR IS THE POINT: it turns "pick a monitor" from
   a form field into the page's own argument — the numbers under two nearby
   names are different, so which one covers you matters.
   A FORM THAT CANNOT DELIVER SAYS SO. If /api/ward/subscribe answers
   not_configured, the message names what the site is missing rather than
   thanking the reader for an address that went nowhere. */
(function(){
  var root=document.querySelector('[data-ward]'); if(!root||!window.fetch) return;
  var q=document.getElementById('ward-q'), list=document.getElementById('ward-list'),
      state=document.getElementById('ward-state'), pick=document.getElementById('ward-pick'),
      pickN=document.getElementById('ward-pick-n'), mail=document.getElementById('ward-e'),
      go=document.getElementById('ward-go'), msg=document.getElementById('ward-msg');
  var all=[], chosen=null;

  fetch('/api/ward',{cache:'no-store'}).then(function(r){return r.json();}).then(function(d){
    if(!d||d.ok!==true||!Array.isArray(d.stations)||!d.stations.length){
      /* NOT AN EMPTY LIST. An empty picker would read as "no monitors exist". */
      state.textContent='The monitor list is not available just now, so this cannot be set up. '
        +'It is the feed that is down, not the air.';
      q.disabled=true; return;
    }
    all=d.stations;
    state.textContent=all.length+' monitors, read at '+(d.observed||'the latest hour')
      +'. '+d.totals.above_limit+' of them are above the limit.';
    render(all.slice(0,6), true);
  }).catch(function(){
    state.textContent='The monitor list could not be loaded.'; q.disabled=true;
  });

  function render(rows, initial){
    list.innerHTML='';
    if(!rows.length){ list.innerHTML='<p class="cap p-ward-none">No monitor matches that. '
      +'Try a shorter word, or the name of a neighbouring area.</p>'; return; }
    rows.forEach(function(s){
      var b=document.createElement('button');
      b.type='button'; b.className='p-ward-r'; b.setAttribute('role','option');
      b.setAttribute('aria-selected','false');
      b.innerHTML='<span class="p-ward-n">'+esc(s.label)+'</span>'
        +'<span class="p-ward-v'+(s.overLimit?' is-red':'')+'">'+s.aqi+'</span>'
        +'<span class="cap p-ward-b">'+esc(s.band)+'</span>';
      b.addEventListener('click',function(){ choose(s); });
      list.appendChild(b);
    });
    if(initial){
      var n=document.createElement('p');
      n.className='cap p-ward-hint';
      n.textContent='Worst first. Type to find yours.';
      list.appendChild(n);
    }
  }

  function choose(s){
    chosen=s;
    pick.removeAttribute('hidden');
    /* The next-nearest distance is printed because it is the honest width of
       what one monitor can claim to describe. */
    pickN.innerHTML='<b>'+esc(s.label)+'</b> — reading '+s.aqi+', '+esc(s.band).toLowerCase()+'.'
      +(s.nextNearest?' The next nearest monitor is '+s.nextNearest.km
        +' km away and reads separately.':'');
    msg.textContent='';
    mail.focus();
  }

  go&&go.addEventListener('click',function(){
    if(!chosen){ msg.textContent='Pick a monitor first.'; return; }
    var e=(mail.value||'').trim();
    if(e.length<6||e.indexOf('@')<1){ msg.textContent='That does not look like an address an email could reach.'; return; }
    go.disabled=true; msg.textContent='Sending a confirmation…';
    fetch('/api/ward/subscribe',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({email:e,station:chosen.station})})
      .then(function(r){ return r.json().then(function(j){ return {s:r.status,j:j}; }); })
      .then(function(o){
        go.disabled=false;
        if(o.j&&o.j.ok){ msg.textContent=o.j.message; mail.value=''; return; }
        if(o.j&&o.j.state==='not_configured'){
          /* Name the hole. Do not thank them for an address that went nowhere. */
          msg.innerHTML='<b>Not wired yet, and it will not pretend.</b> This site has no '
            +esc((o.j.missing||[]).join(' and '))+', so the alert cannot be promised. '
            +'Your address was not stored and nothing was sent.';
          return;
        }
        msg.textContent=(o.j&&(o.j.reason||o.j.detail))||'That did not work. Nothing was stored.';
      }).catch(function(){
        go.disabled=false; msg.textContent='That did not work. Nothing was stored.';
      });
  });

  var t=null;
  q.addEventListener('input',function(){
    clearTimeout(t);
    t=setTimeout(function(){
      var v=q.value.trim().toLowerCase();
      if(!v){ render(all.slice(0,6), true); return; }
      render(all.filter(function(s){ return s.label.toLowerCase().indexOf(v)>-1; }).slice(0,8), false);
    },110);
  });

  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
})();

${JS_NAVIDX}
${JS_UNDERLINE}
`;

/* ═══ THE DOCUMENT ═══════════════════════════════════════════════════════ */
const OUT = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark">
<title>Delhi&rsquo;s air &mdash; Swechha</title>
${HEAD_FONTS}
<style>
${CSS}
${PAGE_CSS}
${FAMILY_CSS}</style>
</head>
<body>
${SVG_DEFS}
${SKIP}
${HEADER}
<main id="main" tabindex="-1">
${BANDS.map(section).join('\n')}
</main>
${FOOTER}
<script>
${SCRIPT}</script>
</body>
</html>
`;

if (bad > 0) { console.error(`\nREFUSING TO WRITE: ${bad} extraction assertion(s) failed.`); process.exit(1); }
if (clashes > 0) { console.error('\nREFUSING TO WRITE: ground adjacency fails.'); process.exit(1); }

// The WHOLE script block, extracted and hand-written alike, through one gate.
const jsPath = join(tmpdir(), 'swechha-situation-script-check.js');
writeFileSync(jsPath, SCRIPT);
const { execFileSync } = await import('node:child_process');
try { execFileSync(process.execPath, ['--check', jsPath], { stdio: 'pipe' }); console.log('\npage script (all of it): node --check PASSED'); }
catch (e) { console.error('\nREFUSING TO WRITE: page script is not valid JS.\n' + e.stderr.toString()); process.exit(1); }

writeFileSync(`${V3}/situation-air.html`, OUT);
console.log(`\nWROTE situation-air.html — ${OUT.length} bytes, ${OUT.split('\n').length} lines`);
console.log(`  8 bands + strip + footer. Reading: AQI ${rd.aqi} ${rd.band} at ${rd.station}`);
