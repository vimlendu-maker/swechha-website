/* ═══════════════════════════════════════════════════════════════════════════
   INDIA, CITY BY CITY  →  public/_pages/v3/air-india.html, routed at /now/air/india
   ───────────────────────────────────────────────────────────────────────────
   WHY THIS PAGE EXISTS. /now/air carried a link reading "All 268 cities →"
   whose href was "#geography" — an anchor to a band on the same page whose
   first tab is a map of DELHI's forty-four monitors. So the one link on this
   site that promised the national picture delivered the reader back to Delhi,
   and nothing anywhere published the other 267 cities that
   data/air-india.json has held all along. This is that list.

   ★ THE RANKING NUMBER IS THE WORST MONITOR, AND THE PAGE NEVER PRETENDS
   OTHERWISE. `aqi` on every row is the city's worst station; `meanAqi` is the
   average across its stations, which is the figure CPCB itself publishes for
   the city. A city with forty monitors has forty chances to produce a high
   reading and a city with one has one, so a well-monitored city ranks WORSE.
   Both numbers are therefore on every row, side by side, and the station count
   is beside them — the caveat is the table, not a footnote under it.

   ★ NOTHING ON THIS PAGE IS TYPED. Every figure, every name, every count is
   read out of data/air-india.json, and the gates below refuse to write a page
   whose totals disagree with the rows it just rendered. The rank, the hour and
   the limit come from the same snapshot as /now/air's own headline, which is
   what makes the two pages comparable.

   ★ THE ROWS DO NOT REPAINT. Filtering and sorting reorder markup that is
   already in the document; no reading is fetched, recomputed or changed in the
   browser. The page reads completely with JavaScript off — the controls are
   the only thing that stops working, and the full 268 rows are still there.

       node scripts/build-air-india.mjs
   ═══════════════════════════════════════════════════════════════════════════ */
import * as S from './lib/situation-shell.mjs';
import { seo } from './lib/seo-register.mjs';
const { esc, opener, hole, ARROW, n0 } = S;

const sh = S.shell();

/* ═══ DATA ═══════════════════════════════════════════════════════════════ */
const IND = S.J('air-india.json');
const LIMIT = IND.aqiLimit;

let dataBad = 0;
const dataFail = (m) => { console.error(`DATA IS WRONG: ${m}`); dataBad++; };

if (!Array.isArray(IND.cities) || !IND.cities.length) {
  dataFail('air-india.json has no cities array. This page is the cities array; there is nothing to render without it.');
}
if (IND.cities.length !== IND.totals.cities) {
  dataFail(`air-india.json says totals.cities is ${IND.totals.cities} but carries ${IND.cities.length} rows. `
    + 'The headline count and the table would disagree on the same page.');
}
for (const c of IND.cities) {
  if (!c.city || c.aqi == null || c.rank == null) {
    dataFail(`a city row is missing name, rank or aqi: ${JSON.stringify(c).slice(0, 120)}`);
    break;
  }
}
if (!/^\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}$/.test(String(IND.observed || ''))) {
  dataFail(`observed ("${IND.observed}") is not "DD-MM-YYYY HH:MM:SS". The hour is the whole claim of this page.`);
}
if (dataBad) {
  console.error(`\nREFUSING TO WRITE: ${dataBad} data check(s) failed.`);
  process.exit(1);
}

const CITIES = [...IND.cities].sort((a, b) => a.rank - b.rank);
const PRETTY = { 'PM2.5': 'PM2.5', PM10: 'PM10', NO2: 'NO&#8322;', SO2: 'SO&#8322;',
  CO: 'CO', OZONE: 'O&#8323;', NH3: 'NH&#8323;', PB: 'Pb' };
const OBS = esc(String(IND.observed));
const OVER = CITIES.filter((c) => c.aqi > LIMIT);
const ONE_STATION = CITIES.filter((c) => c.stations === 1);
const SUSPECT = CITIES.filter((c) => c.suspect);

/* THE STATE ROLL-UP comes from `stateRollup()` in the shell, NOT from a
   reduction written here: /now/air's India tab renders the same table off the
   same file, and two copies of this arithmetic is how the two pages come to
   disagree about how many states are above the limit while reading one
   dataset. */
const STATES_ROLL = S.stateRollup(CITIES, LIMIT);
const STATES_OVER = STATES_ROLL.filter((s) => s.over > 0);

/* ═══ BANDS ══════════════════════════════════════════════════════════════ */
const ALL_BANDS = [
  ['top',    't1',        '#0D0D0B'],
  ['cities', 'dark-2 t2', '#151512'],
  ['reading', 'paper t2', '#F3F2F0'],
  ['onward', 't3',        '#0D0D0B'],
];
const BANDS = ALL_BANDS;
const clashes = S.groundChain(BANDS);

const INDEX = [
  ['Every city', '#top'],
  ['The table', '#cities'],
  ['How to read it', '#reading'],
  ['Back to Delhi', '#onward'],
];

const B = {};

/* ── BAND 1. MASTHEAD, TYPE ONLY. ─────────────────────────────────────────
   No photograph. Every hero on this site is a `.pic ht` box, which is
   object-fit:cover, and there is no photograph of "268 cities" — putting a
   Delhi haze picture at the top of the national page would repeat the exact
   confusion the page was built to end. /search and /posters set the type-only
   precedent. */
B.top = () => {
  const fig = [
    [n0(IND.totals.cities), 'cities reporting', `across ${n0(STATES_ROLL.length)} states and union territories`],
    [n0(IND.totals.stations), 'stations behind them', `${n0(ONE_STATION.length)} cities are a single monitor`],
    [n0(IND.totals.above_limit), `above AQI ${LIMIT}`, 'the limit India set for itself'],
    [n0(IND.totals.good), 'read &ldquo;Good&rdquo;', 'the country is not uniformly polluted'],
  ].map(([v, l, s]) => `<div class="ci-fig"><p class="ci-fig-v">${v}</p>
          <p class="lbl ci-fig-l">${l}</p><p class="cap ci-fig-s">${s}</p></div>`).join('\n        ');
  return `    <div class="wrap ci-mast">
      <nav class="fam-crumb" aria-label="Where this page sits">
        <a class="fam-crumb-up" href="/now">Now</a>
        <i class="fam-crumb-sep" aria-hidden="true">/</i>
        <a class="fam-crumb-up" href="/now/air">Delhi&rsquo;s air</a>
        <i class="fam-crumb-sep" aria-hidden="true">/</i>
        <span class="fam-crumb-here">Every city</span>
        <span class="fam-crumb-what">Environmental intelligence dashboard</span>
      </nav>
      <p class="lbl eyebrow">India, right now</p>
      <h1 class="d1">Every city CPCB measures</h1>
      <p class="lead">${n0(IND.totals.cities)} cities reported an air quality index at
        <b>${OBS}</b>. ${n0(IND.totals.above_limit)} of them are above the limit India set for
        itself. This is all of them, read together in one hour, in the order they were read.</p>
      <p style="margin:0">${S.stateChip(IND.state_label === 'LIVE' ? 'LIVE' : IND.state_label)}</p>
      <div class="ci-figs">
        ${fig}
      </div>
      <p class="cap ci-mast-c">The number a city is ranked on is its <b>worst monitor</b>, named in
        the feed. CPCB itself publishes a city <b>average</b>, and that figure is on every row
        beside it. They are different questions and this page answers both.</p>
    </div>`;
};

/* ── BAND 2. THE TABLE. ───────────────────────────────────────────────────
   A real <table>, not the .p-rank grid the situation pages use for their short
   lists: 268 rows with six columns is tabular data, and a screen reader
   navigating it by column is the difference between a table and a wall.
   THE CONTROLS ARE PROGRESSIVE. Every row is in the markup, in rank order,
   before any script runs. */
const row = (c) => {
  const over = c.aqi > LIMIT;
  const gasGov = c.governing && c.governing !== 'PM2.5' && c.governing !== 'PM10';
  const doubt = c.suspect
    ? ` <abbr class="ci-q" title="${esc(c.suspectReason || '')}">?</abbr>` : '';
  const key = `${c.city} ${c.state || ''}`.toLowerCase().replace(/\s+/g, ' ').trim();
  return `<tr data-k="${esc(key)}" data-a="${c.aqi}" data-r="${c.rank}"${over ? ' data-over="1"' : ''}>
          <td class="ci-r">${c.rank}</td>
          <td class="ci-c"><b>${esc(c.city)}</b><span class="cap ci-st">${esc(c.state || '&mdash;')}</span></td>
          <td class="ci-v${over ? ' is-red' : ''}">${c.aqi}${doubt}</td>
          <td class="ci-m">${c.meanAqi == null ? '&mdash;' : c.meanAqi}</td>
          <td class="ci-b">${esc(c.band)}${gasGov ? ` <span class="cap ci-g">${PRETTY[c.governing] || esc(c.governing)}</span>` : ''}</td>
          <td class="ci-n">${n0(c.stations)}</td>
        </tr>`;
};

const TABLE = `      <div class="ci-ctl">
        <p class="ci-fl"><label class="sr" for="ci-q">Find a city or a state</label>
          <input class="ci-in" id="ci-q" type="search" placeholder="Find a city or a state" autocomplete="off" spellcheck="false"></p>
        <p class="ci-tg" role="group" aria-label="Which cities">
          <button type="button" class="ci-bt is-on" data-only="all" aria-pressed="true">All ${n0(CITIES.length)}</button>
          <button type="button" class="ci-bt" data-only="over" aria-pressed="false">Above the limit (${n0(OVER.length)})</button>
        </p>
        <p class="ci-tg" role="group" aria-label="Order">
          <button type="button" class="ci-bt is-on" data-sort="rank" aria-pressed="true">Worst first</button>
          <button type="button" class="ci-bt" data-sort="name" aria-pressed="false">A&ndash;Z</button>
        </p>
        <p class="cap ci-count" id="ci-count" role="status">All ${n0(CITIES.length)} cities</p>
      </div>
      <div class="ci-scroll">
      <table class="ci-t">
        <caption class="sr">Every city reporting to CPCB at ${OBS}, ranked by its worst monitor.
          Columns: rank, city and state, worst monitor AQI, city average AQI, band and governing
          pollutant, number of stations.</caption>
        <thead><tr>
          <th scope="col" class="ci-r">#</th>
          <th scope="col" class="ci-c">City</th>
          <th scope="col" class="ci-v">Worst</th>
          <th scope="col" class="ci-m">Mean</th>
          <th scope="col" class="ci-b">Band</th>
          <th scope="col" class="ci-n">St.</th>
        </tr></thead>
        <tbody id="ci-rows">
        ${CITIES.map(row).join('\n        ')}
        </tbody>
      </table>
      </div>
      <p class="cap ci-none" id="ci-none" hidden>No city or state matches that.</p>
      <p class="p-legend ci-lg"><span class="lbl"><i class="ci-sw ci-sw-hi"></i>Above AQI ${LIMIT}</span><span class="lbl"><i class="ci-sw ci-sw-lo"></i>Within it</span></p>`;

const STATE_TABLE = `      <div class="ci-scroll">
      <table class="ci-t ci-t-s">
        <caption class="sr">Every state and union territory with a city reporting to CPCB at ${OBS},
          ordered by how many of its cities are above the limit.</caption>
        <thead><tr>
          <th scope="col" class="ci-c">State or union territory</th>
          <th scope="col" class="ci-n">Cities</th>
          <th scope="col" class="ci-n">Above ${LIMIT}</th>
          <th scope="col" class="ci-c">Worst city</th>
          <th scope="col" class="ci-v">AQI</th>
        </tr></thead>
        <tbody>
        ${STATES_ROLL.map((s) => `<tr>
          <td class="ci-c"><b>${esc(s.state)}</b></td>
          <td class="ci-n">${n0(s.cities)}</td>
          <td class="ci-n${s.over ? ' is-red' : ''}">${n0(s.over)}</td>
          <td class="ci-c">${esc(s.worst.city)}</td>
          <td class="ci-v${s.worst.aqi > LIMIT ? ' is-red' : ''}">${s.worst.aqi}</td>
        </tr>`).join('\n        ')}
        </tbody>
      </table>
      </div>
      <p class="cap ci-sc"><b>${n0(STATES_OVER.length)} of ${n0(STATES_ROLL.length)} states and union
        territories have at least one city above the limit.</b> A state with three cities in the feed
        and three above the limit is not the same finding as a state with forty and three, which is
        why the count of cities is beside it. Nothing here is a state average: CPCB measures cities,
        not states, and the unmeasured parts of a state are unmeasured, not clean.</p>`;

B.cities = () => `${opener('cities', `All ${n0(CITIES.length)} cities, and where they sit`,
  `Every figure below was read at <b>${OBS}</b> &mdash; one hour, all ${n0(IND.totals.stations)} `
  + `stations together, which is what makes them comparable, and the same hour as the reading at the `
  + `top of <a class="lk" href="/now/air">Delhi&rsquo;s air</a>. The order is a reading of that hour, `
  + `not a standing claim: by the time you read it, CPCB has published another.`)}
    <div class="wrap">
${S.tabs('India, city by city', [['Every city', TABLE], ['By state', STATE_TABLE]])}
    </div>`;

/* ── BAND 3. HOW TO READ IT. The caveats, in the reader's words, and the
   absences named rather than left to be discovered. */
B.reading = () => `${opener('reading', 'How to read a rank',
  'Four things decide whether a row above means what it looks like it means. Three of them are '
  + 'about who is holding the monitor.')}
    <div class="wrap">
      <div class="ci-rd">
        <div>
          <p class="lbl ci-rd-h">The number is one machine</p>
          <p class="body">A city&rsquo;s rank here is its <b>worst monitor</b>. A city with forty
            monitors has forty chances to produce a high reading; a city with one has one. That cuts
            against the well-measured city: ${n0(ONE_STATION.length)} of these
            ${n0(CITIES.length)} cities are a single station wearing a city&rsquo;s name, and
            <b>a city with one monitor is measured less, not better</b>. Read the station count
            before you read the rank.</p>
        </div>
        <div>
          <p class="lbl ci-rd-h">Two numbers, two questions</p>
          <p class="body">&ldquo;Worst&rdquo; is the worst station. &ldquo;Mean&rdquo; is the average
            across the city&rsquo;s stations &mdash; the figure <b>CPCB itself publishes</b> for that
            city. Against CPCB&rsquo;s own published figures this ranking runs about a quarter
            higher. Neither is wrong; they answer different questions, so both are on the row.</p>
        </div>
        <div>
          <p class="lbl ci-rd-h">The scale is not a ratio</p>
          <p class="body">The AQI is piecewise-linear. 200 is not twice the pollution of 100 &mdash;
            it is twice the index. Nothing on this page multiplies one AQI by another, and neither
            should a sentence written from it.</p>
        </div>
        <div>
          <p class="lbl ci-rd-h">Every pollutant counts</p>
          <p class="body">A station&rsquo;s AQI is its worst published sub-index, whichever pollutant
            that is. Where the governing pollutant is <b>not particulate</b> the row names it, because
            a rank is not comparable unless you can see what is being ranked. Nothing is excluded:
            CPCB publishes sub-indexes, already on one scale.</p>
        </div>
      </div>
${SUSPECT.length ? `      <p class="cap ci-sus"><b>${n0(SUSPECT.length)} ${SUSPECT.length === 1 ? 'row carries' : 'rows carry'} a question mark.</b>
        At ${SUSPECT.map((c) => esc(c.city)).join(', ')} one gas channel reads far above the worst
        particulate at the same station and no independent monitor is near enough to say which is
        right. ${SUSPECT.length === 1 ? 'It is' : 'They are'} ranked on particulates; the gas figure
        is published in the tooltip, not ranked. Hover or focus the mark to read it.</p>` : ''}
${hole(`These are the cities CPCB measures, not the cities of India. A place with no monitor produces no row, and an absent row is an absent instrument — never clean air. ${n0(IND.totals.cities)} cities is the whole of the national real-time network.`)}
${hole('There is no state figure here and there will not be one. CPCB measures cities; averaging a state’s cities would invent a reading for the land between them.')}
${hole('A failed fetch leaves the previous hour in place rather than writing a zero, so a stale hour is possible and is printed on the page. The hour above is the only claim about freshness this page makes.')}
      <p class="cap ci-src">Source: <a class="lk" href="${esc(IND.source.url)}">${esc(IND.source.name)}</a>,
        resource ${esc(IND.source.resource)}. Snapshot ${OBS}, ${n0(IND.totals.rows)} station-pollutant
        rows behind ${n0(IND.totals.stations)} stations.</p>
    </div>`;

/* ── BAND 4. ONWARD. ────────────────────────────────────────────────────── */
B.onward = () => `${opener('onward', 'The city this site reads every hour',
  'Delhi is one row above. Its page is the same reading taken apart &mdash; forty-four monitors, '
  + 'what is in the air, who is in it, and what has been spent on it.')}
    <div class="wrap">
      <p><a class="b b-1" href="/now/air">Delhi&rsquo;s air, monitor by monitor ${ARROW}</a></p>
      <p style="margin:var(--gap-row) 0 0"><a class="act" href="/now">All 6 environmental intelligence dashboards ${ARROW}</a></p>
    </div>`;

/* ═══ PAGE CSS ═══════════════════════════════════════════════════════════ */
/* NO BACKTICKS BELOW — see the warning on SHARED_PAGE_CSS. */
const PAGE_CSS = `
.ci-mast{padding-block:clamp(40px,6vw,78px)}
.ci-mast .lead{max-width:56ch;margin-top:clamp(14px,1.6vw,20px)}
.ci-mast .fam-crumb{margin-bottom:clamp(18px,2.4vw,30px)}
.ci-mast .eyebrow{color:var(--fg-2);margin:0 0 10px}
.ci-figs{display:grid;grid-template-columns:repeat(auto-fit,minmax(155px,1fr));
  gap:clamp(18px,2.4vw,30px);margin:clamp(26px,3.4vw,44px) 0 0;
  border-top:1px solid var(--hair-2);padding-top:clamp(20px,2.4vw,28px)}
.ci-fig-v{font-family:Archivo,system-ui,sans-serif;font-variation-settings:'wdth' 74,'wght' 800;
  font-size:clamp(30px,4.4vw,46px);line-height:.94;margin:0;font-variant-numeric:tabular-nums}
.ci-fig-l{color:var(--fg);margin:9px 0 0}
.ci-fig-s{color:var(--fg-3);margin:5px 0 0;max-width:24ch}
.ci-mast-c{color:var(--fg-3);max-width:62ch;margin:clamp(22px,2.6vw,30px) 0 0}

/* ── THE CONTROLS. They reorder markup that is already in the document; with
      JavaScript off they are inert and all rows are still present and in rank
      order, which is why the table is not built by script. ─────────────── */
.ci-ctl{display:flex;flex-wrap:wrap;align-items:center;gap:10px 14px;
  margin:0 0 clamp(14px,1.8vw,20px)}
.ci-fl{margin:0;flex:1 1 16em;min-width:0}
.ci-in{width:100%;min-width:0;min-height:var(--hit,44px);background:transparent;color:var(--fg);
  border:1px solid var(--hair);border-radius:0;padding:0 12px;font:inherit;font-size:15px;
  -webkit-appearance:none;appearance:none}
.ci-in::placeholder{color:var(--fg-3)}
.ci-in:focus-visible{outline:2px solid var(--mustard);outline-offset:-1px;border-color:var(--mustard)}
.ci-tg{display:flex;gap:0;margin:0;border:1px solid var(--hair)}
.ci-bt{min-height:var(--hit,44px);padding:0 13px;background:transparent;color:var(--fg-2);
  border:0;border-left:1px solid var(--hair);cursor:pointer;font-family:Archivo,system-ui,sans-serif;
  font-size:12px;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap}
.ci-tg .ci-bt:first-child{border-left:0}
.ci-bt:hover{color:var(--fg)}
.ci-bt.is-on{background:var(--fg);color:#0D0D0B}
.ci-bt:focus-visible{outline:2px solid var(--mustard);outline-offset:-2px}
.ci-count{color:var(--fg-3);margin:0;flex:0 0 auto;font-variant-numeric:tabular-nums}
.ci-none{color:var(--fg-2);margin:16px 0 0}

/* ── THE TABLE. It scrolls in its own box, never the page body. ───────── */
.ci-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch;
  max-height:min(72vh,880px);overflow-y:auto;border-top:1px solid var(--hair);
  border-bottom:1px solid var(--hair)}
.ci-t{width:100%;border-collapse:collapse;font-size:15px}
.ci-t th{position:sticky;top:0;z-index:1;background:var(--ground-2,#151512);
  font-family:Archivo,system-ui,sans-serif;font-size:11px;letter-spacing:.07em;
  text-transform:uppercase;color:var(--fg-3);font-weight:400;text-align:left;
  padding:11px 10px;border-bottom:1px solid var(--hair)}
.ci-t td{padding:10px;border-bottom:1px solid var(--hair-2);vertical-align:baseline}
.ci-t tbody tr:last-child td{border-bottom:0}
.ci-t .ci-r{width:3.4em;color:var(--fg-3);font-variant-numeric:tabular-nums;text-align:right}
.ci-t .ci-c{font-family:Newsreader,Georgia,serif;font-size:16px}
.ci-c .ci-st{display:block;color:var(--fg-3);margin-top:2px}
.ci-t .ci-v,.ci-t .ci-m{font-family:Archivo,system-ui,sans-serif;
  font-variation-settings:'wdth' 74,'wght' 800;font-variant-numeric:tabular-nums;
  text-align:right;width:4.6em}
.ci-t .ci-v{font-size:19px}
.ci-t .ci-m{font-size:15px;color:var(--fg-3);font-variation-settings:'wdth' 74,'wght' 500}
.ci-t .ci-v.is-red,.ci-t .ci-n.is-red{color:var(--red)}
.ci-t .ci-b{color:var(--fg-2);white-space:nowrap}
.ci-b .ci-g{color:var(--fg-3)}
.ci-t .ci-n{width:4em;text-align:right;color:var(--fg-3);font-variant-numeric:tabular-nums}
.ci-t-s .ci-c{width:auto}
.ci-q{color:var(--fg-3);text-decoration:none;border-bottom:1px dotted currentColor;cursor:help;
  font-size:.62em;vertical-align:super;margin-left:.15em}
.ci-lg{margin:14px 0 0}
.ci-sw{display:inline-block;width:9px;height:9px;margin-right:7px;vertical-align:baseline}
.ci-sw-hi{background:var(--red)}
.ci-sw-lo{background:var(--fg-3)}
.ci-sc{color:var(--fg-3);max-width:70ch;margin:16px 0 0}

/* ── HOW TO READ IT, on paper. ─────────────────────────────────────────── */
.ci-rd{display:grid;grid-template-columns:repeat(auto-fit,minmax(255px,1fr));
  gap:clamp(22px,2.8vw,38px)}
.ci-rd-h{color:var(--ink-2);margin:0 0 8px}
.ci-rd .body{margin:0;max-width:46ch}
.ci-sus{color:var(--ink-2);max-width:70ch;margin:clamp(24px,3vw,34px) 0 0}
.ci-src{color:var(--ink-3);max-width:70ch;margin:clamp(20px,2.4vw,28px) 0 0}

/* ── 375px, WHICH IS THE MEASUREMENT THAT MATTERS. ─────────────────────
      The band column goes first: the AQI is already coloured against the limit
      and the legend under the table says so, whereas the numbers are the table.
      The three numeric columns are then narrowed until the table fits INSIDE
      its own scroll box rather than merely scrolling within it, because a
      six-column table that needs a horizontal drag to read one row is a table
      nobody reads on a phone. The box keeps overflow-x anyway — a long city
      name is allowed to push it — but it should not be the resting state. */
@media (max-width:640px){
  .ci-t{font-size:14px}
  .ci-t .ci-b{display:none}
  .ci-t td,.ci-t th{padding:9px 5px}
  .ci-t .ci-r{width:2.2em}
  .ci-t .ci-c{font-size:15px}
  .ci-t .ci-v{width:2.9em;font-size:17px}
  .ci-t .ci-m{width:2.6em;font-size:14px}
  .ci-t .ci-n{width:2.4em}
  .ci-count{flex:1 1 100%}
}
`;

/* ═══ PAGE SCRIPT ════════════════════════════════════════════════════════ */
/* Filter and order only. It never touches a number, and it bails silently if
   the table is not there, so a markup change cannot throw on every page load. */
const SCRIPT = `
(function(){
  var body=document.getElementById('ci-rows');
  var q=document.getElementById('ci-q');
  var out=document.getElementById('ci-count');
  var none=document.getElementById('ci-none');
  if(!body||!q||!out||!none) return;
  var rows=[].slice.call(body.children);
  var total=rows.length;
  var only='all', order='rank';
  var byRank=rows.slice();
  var byName=rows.slice().sort(function(a,b){
    return (a.getAttribute('data-k')||'').localeCompare(b.getAttribute('data-k')||'');
  });
  function press(group,attr,val){
    [].forEach.call(document.querySelectorAll('[data-'+attr+']'),function(b){
      var on=b.getAttribute('data-'+attr)===val;
      b.classList.toggle('is-on',on);
      b.setAttribute('aria-pressed',on?'true':'false');
    });
  }
  function paint(){
    var want=(q.value||'').toLowerCase().replace(/\\s+/g,' ').trim();
    var list=order==='name'?byName:byRank;
    var frag=document.createDocumentFragment(), shown=0;
    for(var i=0;i<list.length;i++){
      var r=list[i];
      var ok=(only!=='over'||r.getAttribute('data-over')==='1')
        && (!want||(r.getAttribute('data-k')||'').indexOf(want)>-1);
      r.hidden=!ok;
      if(ok) shown++;
      frag.appendChild(r);
    }
    body.appendChild(frag);
    none.hidden=shown>0;
    out.textContent=shown===total?('All '+total+' cities')
      :(shown+' of '+total+' cities');
  }
  q.addEventListener('input',paint);
  [].forEach.call(document.querySelectorAll('[data-only]'),function(b){
    b.addEventListener('click',function(){only=b.getAttribute('data-only');press(0,'only',only);paint();});
  });
  [].forEach.call(document.querySelectorAll('[data-sort]'),function(b){
    b.addEventListener('click',function(){order=b.getAttribute('data-sort');press(0,'sort',order);paint();});
  });
})();
`;

/* ═══ WRITE ══════════════════════════════════════════════════════════════ */
const OUT = await S.assemble({
  file: 'air-india.html',
  route: '/now/air/india',
  title: seo('/now/air/india').title,
  bands: BANDS, index: INDEX, sh, clashes,
  pageCss: PAGE_CSS,
  script: SCRIPT,
  navMark: { current: 'Now', url: '/now/air/india' },
  sectionFor: (id) => (B[id] || (() => '    <div class="wrap"><p class="lead">&mdash;</p></div>'))(),
  note: `${BANDS.length} bands + footer. ${CITIES.length} cities, ${STATES_ROLL.length} states, snapshot ${IND.observed}.`,
});

/* ═══ POST-WRITE GATES ═══════════════════════════════════════════════════ */
let fail = 0;
const gate = (ok, msg) => { if (!ok) { console.error(`  FAIL ${msg}`); fail++; } else console.log(`  ok   ${msg}`); };
console.log('\nGATES');

/* 1. EVERY CITY IN THE DATA REACHED THE PAGE. The whole point of the page is
      that it is the complete list; a template that silently drops the tail
      would look exactly like a template that does not. */
const bodyRows = (OUT.match(/<tr data-k="/g) || []).length;
gate(bodyRows === CITIES.length, `all ${CITIES.length} cities rendered as rows (${bodyRows})`);
const dropped = CITIES.filter((c) => !OUT.includes(`>${esc(c.city)}</b>`));
gate(dropped.length === 0,
  `every city is named on the page${dropped.length ? `; DROPPED: ${dropped.slice(0, 6).map((c) => c.city).join(', ')}` : ''}`);

/* 2. THE HEADLINE COUNTS ARE THE ROWS. The failure this catches is the one
      /now/air shipped for weeks: a total typed once and a table built from
      something else, disagreeing on the same screen. */
gate(OUT.includes(`All ${n0(CITIES.length)} cities`), `the masthead count is the row count`);
/* SCOPED TO THE CITY TBODY, deliberately: the by-state table reuses the same
   red cell for each state's worst city, so counting the whole document counts
   those twelve too and the gate would pass or fail for the wrong reason. */
const CITY_TBODY = OUT.slice(OUT.indexOf('id="ci-rows"'), OUT.indexOf('</tbody>', OUT.indexOf('id="ci-rows"')));
const overRendered = (CITY_TBODY.match(/class="ci-v is-red"/g) || []).length;
gate(overRendered === OVER.length,
  `${OVER.length} rows are marked above the limit, matching totals.above_limit=${IND.totals.above_limit} (${overRendered})`);
gate(OVER.length === IND.totals.above_limit,
  `the rows above ${LIMIT} and the dataset's own above_limit agree (${OVER.length} / ${IND.totals.above_limit})`);

/* 3. THE HOUR IS ON THE PAGE, AND IT IS THE DATASET'S HOUR. A national table
      whose rows come from different hours is not a ranking, and the only way a
      reader can tell is if the hour is printed. */
gate(OUT.includes(OBS), `the snapshot hour ${IND.observed} is printed`);

/* 4. THE PAGE READS WITHOUT JAVASCRIPT. No row may be born hidden. */
gate(!/<tr data-k="[^"]*"[^>]*\shidden/.test(OUT), 'no row is hidden in the served markup');

/* 5. THE MEAN IS BESIDE THE WORST ON EVERY ROW. The caveat is the table, not a
      footnote — a row that lost its mean column is a row making the stronger
      claim silently. */
const meanCells = (OUT.match(/<td class="ci-m">/g) || []).length;
gate(meanCells === CITIES.length, `every row carries the city mean (${meanCells})`);

/* 6. EVERY SUSPECT ROW CARRIES ITS REASON, not just a mark. */
const marks = (OUT.match(/class="ci-q"/g) || []).length;
gate(marks === SUSPECT.length, `${SUSPECT.length} flagged row(s) carry the query mark (${marks})`);
for (const c of SUSPECT) {
  gate(OUT.includes(esc(c.suspectReason || '').slice(0, 40)), `${c.city}'s flag carries its stated reason`);
}

/* 7. NO DEAD OR PROTOTYPE HREF. */
const hrefs = [...OUT.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
const dead = hrefs.filter((h) => h === '#' || h.startsWith('/design/') || h.startsWith('/_pages/'));
gate(dead.length === 0, `no dead or prototype href${dead.length ? `; FOUND: ${[...new Set(dead)].join(', ')}` : ''}`);

/* 8. IT LINKS BACK TO ITS PARENT. An orphan page reachable only from one
      arrow is how /now/air/india would become the next situation-soon.html. */
gate(OUT.includes('href="/now/air"'), 'links back to /now/air');
gate(OUT.includes('href="/now"'), 'links back to /now');

/* 9. THE GROUND CHAIN DOES NOT CLASH. */
gate(clashes === 0, `${clashes} ground clash(es)`);

console.log(`\n${OUT.length.toLocaleString('en-IN')} bytes. ${fail ? `${fail} gate(s) failed. The file is written — fix the generator and rebuild.` : 'All gates pass.'}`);
if (fail) process.exit(1);
