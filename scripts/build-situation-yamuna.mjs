// AD-16 — situation-yamuna.html. NINE bands, real data, nothing invented.
// Token and chrome layer extracted from the frozen home.html; the
// situation-page CSS and the tab controller extracted from the Air build.
// Neither is retyped here (D-10.3). See scripts/lib/situation-shell.mjs.
//
// THE READING IS `PERIODIC` AND CAN NEVER BE `LIVE` ON THIS PAGE.
// SITUATION-PAGE-TEMPLATE.md §5 is explicit: there is no real-time public
// Yamuna water-quality feed and CPCB has no stable public API for it. Air
// earned LIVE by proving its feed advanced hourly and putting a server route
// in front of it. A river sampled by hand once a month cannot earn it, and
// D-10.1 forbids claiming it. So the state word is PERIODIC everywhere and the
// page is built to be good at that rather than to look like a dashboard.
import { readFileSync, writeFileSync } from 'node:fs';
import * as S from './lib/situation-shell.mjs';
const { esc, n0, n1, compact, opener, tabs, hole, kd, KIND_LEGEND, ARROW, MON3, stateChip , crumb, siblings } = S;

const sh = S.shell();

/* ═══ DATA ═══════════════════════════════════════════════════════════════ */
const YAM = S.J('yamuna-cpcb-2025.json');       // the annual CPCB table
const PARL = S.J('yamuna-parliament-2025.json'); // the Lok Sabha reply
const XC = S.J('yamuna-crosscheck.json');        // riverwatchindia, secondary
const ATTN = S.J('attention-yamuna.json');
const NEWS = S.J('coverage-yamuna.json');
const RIV = S.J('rivers-india.json');            // the national picture + WHO health
const GW = S.J('groundwater-india-2025.json');   // CGWB, the other water
const GAN = S.J('ganga-parliament-2026.json');   // the national programme

const L = YAM.limits;
const DELHI = YAM.stations.filter(s => s.state === 'DELHI');
// North to south, the order the water actually travels. Taken from CPCB's own
// row order, which is upstream-to-downstream — not re-sorted by value, because
// the sequence IS the argument.
const ORDER = ['1120', '5098', '5099', '5100', '1121', '1375', '1812'];
const stretch = ORDER.map(c => DELHI.find(s => s.code === c)).filter(Boolean);
if (stretch.length !== 7) {
  console.error(`EXPECTED 7 Delhi stations in the stretch, got ${stretch.length}. ` +
    `CPCB renamed or dropped a station — check data/yamuna-cpcb-2025.json before shipping.`);
  sh.bad++;
}

/* ── DERIVED FIGURES. Every one is arithmetic on two published numbers, and
      every one states its own operation on the page. Nothing is typed. ──── */
const FLOOR = YAM.reporting_floor.do;                       // 0.3, the BDL value
const atFloor = stretch.filter(s => s.do.min <= FLOOR);      // stations with no oxygen
const worstFc = stretch.reduce((a, b) => (b.fc.max > a.fc.max ? b : a));
const worstBod = stretch.reduce((a, b) => (b.bod.max > a.bod.max ? b : a));
const entry = stretch[0];                                    // Palla
const exit = stretch[stretch.length - 1];                    // Okhla after Shahdara
const mult = (v, lim) => v == null ? null : +(v / lim).toFixed(v / lim >= 100 ? 0 : 1);
const fcMult = mult(worstFc.fc.max, L.fc.value);
const bodMult = mult(worstBod.bod.max, L.bod.value);
const overFc = stretch.filter(s => s.fc.max > L.fc.value).length;
const overBod = stretch.filter(s => s.bod.max > L.bod.value).length;
const underDo = stretch.filter(s => s.do.min < L.do.value).length;

// The monthly reply: how many measured months read below the detection limit?
const monthlyBdl = PARL.monthly_readings_2025.stations
  .flatMap(st => st.readings.map(r => ({ st: st.station, ...r })))
  .filter(r => r.bdl === true);
const monthlyMeasured = PARL.monthly_readings_2025.stations
  .flatMap(st => st.readings.filter(r => r.do != null)).length;
const D = PARL.derived;
const SW = PARL.sewage;

/* ═══ BAND SEQUENCE — id, tier class, ground hex ══════════════════════════ */
const BANDS = [
  ['top',      't1',        '#0D0D0B'],
  ['strip',    '',          '#151512'],
  // THE HOOK, and it is deliberately the second thing a reader meets. A page
  // about one river has to answer "is this one unusually bad, or is this what
  // a river in India looks like?" before it earns nine more bands about the
  // Yamuna. Paper, because it is the context break and the longest reading on
  // the page — and because paper is the only ground that separates the dark
  // strip above it from the dark band below.
  ['india',    'paper t2',  '#F3F2F0'],
  ['people',   't2',        '#0D0D0B'],
  ['measured', 'paper t2',  '#F3F2F0'],
  ['stretch',  'dark-2 t3', '#151512'],
  ['trend',    't2',        '#0D0D0B'],
  ['sources',  'dark-2 t2', '#151512'],
  ['money',    'paper t2',  '#F3F2F0'],
  ['act',      't3',        '#0D0D0B'],
];
const clashes = S.groundChain(BANDS);

const INDEX = [
  ['The reading', '#top'], ['Every other river', '#india'], ['Who is in it', '#people'],
  ['How the number is made', '#measured'], ['The stretch', '#stretch'],
  ['Where it is going', '#trend'], ['Where it comes from', '#sources'],
  ['What has been spent', '#money'], ['What you can do', '#act'],
];

/* ═══ BANDS ══════════════════════════════════════════════════════════════ */
const B = {};

B.top = () => `    <div class="pic ht">
      <img class="duo" src="/images/photos/yamuna-students-foam-line.jpg" alt="Students standing along the Yamuna at a line of foam" style="--op:50% 62%">
      <div class="pic-over"><div class="wrap">
        <h1 class="d1">Delhi&rsquo;s Yamuna</h1>
      </div></div>
    </div>
    <div class="pic-body"><div class="wrap p2-hero">
${crumb('yamuna')}
      <div class="p2-top">
        <p class="lbl p2-method">Every reading against its published limit. Every gap named.</p>
        <p style="margin:0"><span class="tag tag-season">Year round</span></p>
      </div>
      <div class="p2-cols">
      <div class="p2-read breach">
        <p class="state p2-state">${stateChip('PERIODIC')}<span class="sr"> &mdash; sampled on a cadence, not continuously</span></p>
        <p class="readout rl">0.3<span class="y-bdl">&thinsp;BDL</span></p>
        <p ${kd('counted')}>mg/L dissolved oxygen &middot; the lowest the meter can report</p>
        <p class="verdict bad">No measurable oxygen</p>
        <p class="limit">Legal minimum <b>${L.do.label}</b>. <b>Limit broken at ${atFloor.length} of ${stretch.length} Delhi stations.</b></p>
        <p class="cap p2-src">CPCB, ${YAM.year}, at ${esc(atFloor.map(s => shortName(s.station)).slice(0, 2).join(' and '))} and ${atFloor.length - 2} more.
          <a class="lk" href="#measured">How this number is made</a>.</p>
      </div>
      <div class="p2-nat">
        <p class="lbl p2-nat-h">What that means, in one line</p>
        <p class="y-plain">A fish needs about four milligrams of oxygen in every litre of water to
          stay alive. The law asks for five. At ${atFloor.length} places in Delhi the instrument
          cannot find <b>nought point three</b> &mdash; and nought point three is not a measurement,
          it is the smallest number the method is able to print.</p>
        <p class="y-plain">The government&rsquo;s own word for it is <b>BDL</b>: below detection limit.
          Not low. Not measurable at all.</p>
        <p class="cap p-hole"><b>The river arrives alive and leaves dead, and it happens inside one
          city.</b> At ${esc(shortName(entry.station))}, where the Yamuna enters Delhi, oxygen reads
          ${n1(entry.do.min)}&ndash;${n1(entry.do.max)} mg/L. ${stretch.length - 1} stations later,
          at ${esc(shortName(exit.station))}, it reads ${n1(exit.do.min)}. The distance between those two
          readings is the length of Delhi.</p>
        <p style="margin:0"><a class="act" href="#stretch">Station by station ${ARROW}</a></p>
      </div>
      </div>
      <p style="margin:0"><a class="act" href="#people">Who is in it ${ARROW}</a></p>
    </div></div>`;

/* THE STRIP — a caged summary. Red only, per D-14.6: red and green may never
   meet in a band, and only a visually caged ticker-class strip may hold both.
   Nothing here originates; every cell points at the band that owns it. */
B.strip = () => {
  const cells = [
    ['Oxygen', `0.3`, 'BDL, against 5.0', 'stretch', true],
    ['Sewage bacteria', `${n0(fcMult)}×`, 'the legal limit', 'stretch', true],
    ['Delhi&rsquo;s sewage', `${n0(D.not_treated_to_standard_mld.value)}`, 'MLD not treated to standard', 'sources', true],
    ['Attention', `${ATTN.swing}×`, 'peak against floor', 'trend', false],
  ];
  return `    <div class="wide p-strip-in">
      ${cells.map(([l, v, s, href, red]) => `<a class="p-cell" href="#${href}">
        <span class="p-cell-v${red ? ' is-red' : ''}">${v}</span>
        <span class="lbl p-cell-l">${l}</span><span class="cap p-cell-s">${s}</span></a>`).join('\n      ')}
      <p class="cap p-strip-note">One reading, one label. <a class="lk" href="#measured">What is behind them</a>.</p>
    </div>`;
};

/* EVERY OTHER RIVER — the hook, and the honest scale.
   On paper, tabbed, because three different kinds of number live here: a
   ranking of rivers, a health burden, and the water underneath. Each tab is a
   different source and each says so. */
B.india = () => {
  const R = RIV.ranking;
  const H = RIV.health;
  const dh = R.the_delhi_hole;
  const top = R.rivers.slice(0, 10);
  const rest = R.rivers.slice(10);
  const worst = Math.max(...R.rivers.map(r => r.bod_worst));

  const riverRow = (r, i) => {
    const isY = /^Yamuna$/i.test(r.river);
    const w = Math.max(2, Math.round(r.bod_worst / worst * 100));
    const wLim = Math.round(R.limits.bod / worst * 100);
    return `<div class="r-rw${isY ? ' is-y' : ''}">
          <span class="cap r-rw-i">${i + 1}</span>
          <span class="r-rw-n">${esc(r.river)}${isY ? '<i class="r-rw-y">this page</i>' : ''}</span>
          <span class="r-rw-b" role="img" aria-label="worst BOD ${n1(r.bod_worst)} milligrams per litre, ${r.bod_times_limit} times the limit">
            <i class="r-rw-f" style="--w:${w}%"></i><i class="r-rw-l" style="--x:${wLim}%"></i></span>
          <span class="r-rw-v">${n1(r.bod_worst)}</span>
          <span class="cap r-rw-x is-red">${r.bod_times_limit}&times;</span>
          <span class="cap r-rw-s">${r.stations}</span>
        </div>`;
  };

  const ind = (k) => H.indicators[k];
  const pct = (k) => { const i = ind(k); return i?.ok ? +i.latest.value.toFixed(1) : null; };
  const yr = (k) => { const i = ind(k); return i?.ok ? i.latest.year : null; };
  const wd = H.wash_deaths;

  const gwCats = GW.delhi.categories.map(c => {
    const safe = c.category === 'Safe';
    return `<div class="g-cat${safe ? ' is-ok' : ''}">
          <span class="g-cat-v">${c.units}</span>
          <span class="lbl g-cat-l">${esc(c.category)}</span>
          <span class="cap g-cat-p">${c.pct}%</span></div>`;
  }).join('\n        ');
  const gwStates = GW.context_states.map(st => {
    const isD = st.state === 'Delhi';
    const w = Math.min(100, Math.round(st.stage_pct / 160 * 100));
    const w100 = Math.round(100 / 160 * 100);
    return `<div class="g-st${isD ? ' is-d' : ''}">
          <span class="g-st-n">${esc(st.state)}</span>
          <span class="g-st-b"><i class="g-st-f" style="--w:${w}%"></i><i class="g-st-l" style="--x:${w100}%"></i></span>
          <span class="g-st-v${st.stage_pct >= 100 ? ' is-red' : ''}">${n1(st.stage_pct)}%</span></div>`;
  }).join('\n        ');

  return `${opener('india', 'Every other river', 'Before the rest of this page asks for your attention: the Yamuna is not an exception. It is the one Delhi has to look at.')}
    <div class="wrap">
      ${tabs('The national picture', [
        ['India&rsquo;s rivers', `<div class="r-panel">
          <p>Every river below is measured by CPCB against the same legal limit as the Yamuna:
            <b>BOD under ${n1(R.limits.bod)} mg/L</b>. The bar is that river&rsquo;s worst reading;
            the tick is the limit. Ranked by the worst single station, from
            ${n0(R.stations_used)} stations on ${R.rivers_ranked} rivers.</p>
          <div class="r-hd">
            <span class="lbl">&nbsp;</span><span class="lbl">River</span>
            <span class="lbl">Worst organic load against the limit</span>
            <span class="lbl">BOD</span><span class="lbl">&times;limit</span><span class="lbl">St</span>
          </div>
          <div class="r-rows">
        ${top.map(riverRow).join('\n        ')}
          </div>
          <details class="dx">
            <summary class="dx-s">The other ${rest.length} rivers in the table</summary>
            <div class="dx-b"><div class="r-rows">
        ${rest.map((r, i) => riverRow(r, i + 10)).join('\n        ')}
            </div></div>
          </details>
          <p class="cap r-hole"><b>${esc(dh.headline)}</b> ${esc(dh.reading)}</p>
          <p class="cap r-note"><b>And a ranking of worst readings is a weaker claim than it looks.</b>
            ${esc(R.the_station_count_caveat)} The last column is the station count for that reason.</p>
        </div>`],
        ['What the water does', `<div class="r-panel">
          <p>CPCB measures the water. Nobody in that chain counts a person. These are the figures
            that do &mdash; from the World Health Organization, and they are for
            <b>India as a whole</b>, never for one river.</p>
          <div class="r-hl">
            <div class="r-hl-c">
              <p class="num r-hl-n is-red">${wd ? n0(wd.deaths) : '&mdash;'}</p>
              <p ${kd('modelled')}>deaths a year attributed to unsafe water, sanitation and hygiene</p>
              <p class="cap">${wd ? esc(wd.sum) : 'not published'}. WHO&rsquo;s attributable-burden
                estimate, the most recent published. <b>It is a model, not a count of certificates</b>
                &mdash; WHO estimates what share of deaths from diarrhoea, respiratory infection and
                malnutrition is attributable to water and sanitation exposure.</p>
            </div>
            <div class="r-hl-c">
              <p class="num r-hl-n">${pct('safe_drinking_water_pct') ?? '&mdash;'}<i>%</i></p>
              <p ${kd('counted')}>of India uses safely managed drinking water (${yr('safe_drinking_water_pct') ?? '&mdash;'})</p>
              <p class="cap">Which leaves
                <b>${pct('safe_drinking_water_pct') != null ? n1(100 - pct('safe_drinking_water_pct')) : '&mdash;'}%</b>
                who do not &mdash; on this population, around
                <b>${pct('safe_drinking_water_pct') != null && ind('population')?.ok
                    ? compact(Math.round((100 - pct('safe_drinking_water_pct')) / 100 * ind('population').latest.value))
                    : '&mdash;'}</b> people.</p>
            </div>
            <div class="r-hl-c">
              <p class="num r-hl-n">${pct('safe_sanitation_pct') ?? '&mdash;'}<i>%</i></p>
              <p ${kd('counted')}>uses safely managed sanitation (${yr('safe_sanitation_pct') ?? '&mdash;'})</p>
              <p class="cap">Sanitation is the upstream half of this whole page. What is not safely
                managed arrives somewhere, and for Delhi that somewhere has a name. Open defecation
                is down to <b>${pct('open_defecation_pct') ?? '&mdash;'}%</b>.</p>
            </div>
          </div>
${KIND_LEGEND}
          <p class="cap r-hole">${(H.what_it_is_not || []).map(esc).join(' ')}</p>
        </div>`],
        ['The water underneath', `<div class="r-panel">
          <p>A page about a dead river is half the water story. When the surface fails, a city goes
            underground. This is the official annual account of what is left down there &mdash; from
            the same ministry that answers for the Yamuna.</p>
          <div class="g-hero">
            <p class="num g-hero-n is-red">${n1(GW.delhi.stage_of_extraction_pct)}<i>%</i></p>
            <p ${kd('modelled')}>of Delhi&rsquo;s annual groundwater recharge is taken back out every year</p>
          </div>
          <p><b>${esc(GW.the_reading.headline)}</b> Under 70% is classed Safe. Above 100% and the
            aquifer is being spent rather than used &mdash; the balance comes out of storage that
            does not come back.</p>
          <p class="lbl g-lbl">Delhi&rsquo;s ${GW.delhi.assessment_units} assessment units</p>
          <div class="g-cats">
        ${gwCats}
          </div>
          <p class="cap g-cap"><b>${GW.delhi.derived.critical_or_worse.value} of
            ${GW.delhi.assessment_units} are Critical or Over-Exploited</b>
            (${esc(GW.delhi.derived.critical_or_worse.sum)}). Seven are Safe.</p>
          <details class="dx">
            <summary class="dx-s">How Delhi compares, and the national total</summary>
            <div class="dx-b">
              <div class="g-sts">
        ${gwStates}
              </div>
              <p class="cap g-cap">The tick is 100% &mdash; the line above which storage is being
                spent. Nationally the stage of extraction is
                <b>${n1(GW.national.stage_of_extraction_pct)}%</b>, and around
                <b>${GW.national.share_not_safe_pct}%</b> of
                ${n0(GW.national.assessment_units)} assessment units are Over-Exploited, Critical or
                Semi-Critical. Comparing states compares ratios, not volumes: Punjab at
                ${n1(GW.context_states[0].stage_pct)}% and Delhi at
                ${n1(GW.delhi.stage_of_extraction_pct)}% are different sizes of the same problem.</p>
            </div>
          </details>
          <p class="cap r-hole"><b>${esc(GW.the_reading.the_honest_limit)}</b></p>
        </div>`],
      ])}
      <p class="cap r-src"><b>Sources.</b> Rivers: ${esc(R.source.name)}.
        Health: WHO and the WHO/UNICEF Joint Monitoring Programme, via the World Bank&rsquo;s open API.
        Groundwater: <a class="lk" href="${esc(GW.source.url)}">${esc(GW.source.publication)}</a>,
        ${esc(GW.source.published)}.</p>
      <p style="margin:0"><a class="act" href="#people">Back to this river ${ARROW}</a></p>
    </div>`;
};

/* WHO IS IN IT. Named exposed populations, not Swechha's own footprint
   (AD-14 ruling B). Every figure here is from the parliamentary reply or from
   CPCB, and where there is no figure the hole is stated instead. */
B.people = () => `${opener('people', 'Who is in it', 'A dead river is not an aesthetic problem. It is a sanitation one, and it is the city&rsquo;s own sewage that killed it.')}
    <div class="wrap">
      <div class="p-two">
        <div class="p-two-c">
          <p class="num y-big">${n0(SW.generated_mld)}</p>
          <p ${kd('counted')}>million litres of sewage a day, Delhi</p>
          <p class="cap">Delhi Jal Board&rsquo;s own estimate, given to Parliament in July 2025.
            The city produces this every day, and it has to go somewhere.</p>
        </div>
        <div class="p-two-c">
          <p class="num y-big is-red">${n0(D.not_treated_to_standard_mld.value)}</p>
          <p ${kd('counted')}>million litres a day that reach the river untreated, or treated below the standard</p>
          <p class="cap"><b>${D.not_treated_to_standard_mld.pct_of_generated}% of everything the city
            produces.</b> ${esc(D.not_treated_to_standard_mld.sum)}. Both numbers are in the same
            paragraph of the same reply.</p>
        </div>
        <div class="p-two-c">
          <p class="num y-big is-red">${compact(worstFc.fc.max)}</p>
          <p ${kd('counted')}>faecal bacteria per 100 millilitres, at ${esc(shortName(worstFc.station))}</p>
          <p class="cap">A hundred millilitres is about a third of a glass. The legal limit is
            ${n0(L.fc.value)}. This is <b>${n0(fcMult)} times</b> it, and it is measured immediately
            after two of Delhi&rsquo;s drains join the river.</p>
        </div>
      </div>
${KIND_LEGEND}
      <p class="y-note"><b>Read the last number again.</b> It is not a pollution index or a score.
        It is a count of bacteria that come out of human bodies, in water that people stand in, wash
        in, immerse idols in and hold ceremonies beside &mdash; every week, at ghats along this
        stretch.</p>
${hole('How many people fall ill from this river each year is not published. There is no national or Delhi figure for waterborne illness attributable to the Yamuna specifically, so this page does not carry one. The number would be the most useful figure on the page and it does not exist.')}
${hole('How many people draw water, wash, fish or work in this stretch is also not published. Swechha has walked it for two decades and has not counted them either, so no figure is offered.')}
      <p style="margin:0"><a class="act" href="#measured">How the number is made ${ARROW}</a></p>
    </div>`;

/* HOW THE NUMBER IS MADE. On paper, because it is the longest reading on the
   page. The limits are printed IN the source table, which is worth saying. */
B.measured = () => `${opener('measured', 'How the number is made', 'Four measurements, four published limits, and one of them is not really a measurement at all.')}
    <div class="wrap">
      <p class="lead-2">The Yamuna is judged on four things. All four limits come from the
        <b>Primary Water Quality Criteria notified under the Environment (Protection) Rules,
        1986</b> &mdash; and all four are printed in the header of the very table the readings come
        from. The measurement and the limit are on the same page of the same document. Nothing here
        had to be looked up, inferred or chosen.</p>
      ${tabs('The four measurements', [
        ['Oxygen', `<div class="y-def">
          <p class="y-def-h">Dissolved oxygen &middot; legal minimum ${L.do.label}</p>
          <p>Oxygen dissolved in the water, in milligrams per litre. It is the one measurement
            where a <b>high</b> number is good, and it is the closest thing to a pulse a river has.
            Below about 4 mg/L most fish cannot survive. Below 2, almost nothing can.</p>
          <p><b>This is the number that reads 0.3.</b> And 0.3 is the reporting floor of the
            method &mdash; the smallest value it can print. CPCB writes it as
            <b>0.3(BDL)</b>: below detection limit. The honest reading is
            &ldquo;at or below 0.3&rdquo;, and the honest word is not <i>low</i> but
            <b>absent</b>. This page never renders it as 0.0, because 0.0 would be a claim the
            method cannot support.</p>
        </div>`],
        ['Sewage load', `<div class="y-def">
          <p class="y-def-h">Biochemical oxygen demand &middot; legal maximum ${L.bod.label}</p>
          <p>BOD measures how much oxygen the bacteria in the water would consume while eating
            what is dissolved in it. In plain terms: <b>how much rot is in the river.</b> A high
            BOD and a low oxygen are the same event described from two ends.</p>
          <p>The worst Delhi reading is <b>${n1(worstBod.bod.max)} mg/L</b> at
            ${esc(shortName(worstBod.station))} &mdash; <b>${bodMult} times</b> the limit of
            ${n1(L.bod.value)}. ${overBod} of the ${stretch.length} Delhi stations are over it.</p>
        </div>`],
        ['Bacteria', `<div class="y-def">
          <p class="y-def-h">Faecal coliform &middot; legal maximum ${L.fc.label}</p>
          <p>Bacteria that live in the guts of warm-blooded animals, counted per 100 millilitres.
            They are measured not because they are all dangerous but because their presence means
            <b>sewage</b>, and sewage carries what does the harm.</p>
          <p>The count is expressed as MPN &mdash; most probable number &mdash; because the method
            is statistical rather than a headcount. ${overFc} of ${stretch.length} Delhi stations
            are over the limit, the worst by <b>${n0(fcMult)} times</b>.</p>
        </div>`],
        ['Acidity', `<div class="y-def">
          <p class="y-def-h">pH &middot; legal range ${L.ph.label}</p>
          <p>How acidic or alkaline the water is. It is the one parameter on this page that Delhi
            mostly passes, and it is included for exactly that reason: a page that only shows the
            failures is not an instrument, it is an argument.</p>
          <p>Every Delhi station in the ${YAM.year} table sits inside
            ${L.ph.label} or within a tenth of it. pH tells you almost nothing about whether a
            river is alive, which is why it is never the headline.</p>
        </div>`],
      ])}
      <p class="cap y-src-p"><b>Source.</b> ${esc(YAM.source.publication)} &mdash;
        <a class="lk" href="${esc(YAM.source.url)}">the document</a>, ${n0(YAM.stations.length)} stations
        from Yamunotri to Prayagraj, ${stretch.length} of them in Delhi. Cross-checked against
        ${esc(PARL.source.publication)}, ${esc(PARL.source.question)},
        <a class="lk" href="${esc(PARL.source.url)}">${esc(PARL.source.date)}</a>.</p>
      <p style="margin:0"><a class="act" href="#stretch">The stretch, station by station ${ARROW}</a></p>
    </div>`;

/* THE STRETCH. The sequence is the argument, so the rows run in the order the
   water travels and are never re-sorted by value. */
B.stretch = () => {
  const maxBod = Math.max(...stretch.map(s => s.bod.max));
  const rows = stretch.map((s, i) => {
    const dead = s.do.min <= FLOOR;
    const w = Math.max(2, Math.round(s.bod.max / maxBod * 100));
    const wLim = Math.round(L.bod.value / maxBod * 100);
    return `<div class="y-st${dead ? ' is-dead' : ''}">
          <span class="cap y-st-i">${i + 1}</span>
          <span class="y-st-n">${esc(shortName(s.station))}</span>
          <span class="y-st-do${dead ? ' is-red' : ''}">${n1(s.do.min)}${dead ? '<i class="y-bdl2">BDL</i>' : ''}</span>
          <span class="y-st-bar" role="img" aria-label="BOD ${n1(s.bod.max)} milligrams per litre against a limit of ${n1(L.bod.value)}">
            <i class="y-st-fill" style="--w:${w}%"></i><i class="y-st-lim" style="--x:${wLim}%"></i></span>
          <span class="y-st-v${s.bod.max > L.bod.value ? ' is-red' : ''}">${n1(s.bod.max)}</span>
          <span class="cap y-st-fc${s.fc.max > L.fc.value ? ' is-red' : ''}">${compact(s.fc.max)}</span>
        </div>`;
  }).join('\n        ');
  return `${opener('stretch', 'The stretch', `Seven monitoring stations, in the order the water passes them. ${underDo} of the ${stretch.length} are below the legal oxygen minimum.`)}
    <div class="wrap">
      <div class="y-sth">
        <span class="lbl">&nbsp;</span><span class="lbl">Station, north to south</span>
        <span class="lbl">O&#8322; min</span><span class="lbl">Sewage load, against the limit</span>
        <span class="lbl">BOD max</span><span class="lbl">Bacteria</span>
      </div>
      <div class="y-sts">
        ${rows}
      </div>
      <p class="cap y-stk"><i class="y-k-fill"></i> measured BOD &nbsp; <i class="y-k-lim"></i> the legal
        limit, ${n1(L.bod.value)} mg/L &nbsp;&middot;&nbsp; <b>BDL</b> = below detection limit &nbsp;&middot;&nbsp;
        bacteria per 100 mL, limit ${n0(L.fc.value)}</p>
      <p class="y-note"><b>Look at the second row and the third.</b> Between
        ${esc(shortName(stretch[1].station))} and ${esc(shortName(stretch[2].station))} the oxygen
        falls from ${n1(stretch[1].do.min)} to ${n1(stretch[2].do.min)} and the bacteria count goes
        from ${compact(stretch[1].fc.max)} to ${compact(stretch[2].fc.max)}. That is not a gradual
        decline down the length of a river. It is a cliff, and the city is standing at the top of it.</p>
${hole('Where each drain enters, and how much it carries, is not on this page. CPCB monitors Delhi\'s drains and publishes the results in a separate annual document that was not parsed for this build. Until it is, the page can show that the collapse happens and not exactly where each contribution joins.')}
      <p style="margin:0"><a class="act" href="#trend">Where it is going ${ARROW}</a></p>
    </div>`;
};

/* WHERE IT IS GOING. Three tabs: the monthly 2025 series (the best cadence
   available), the year-on-year cross-check, and attention. */
B.trend = () => {
  const st = PARL.monthly_readings_2025.stations;
  const monthly = st.map(s => {
    const cells = s.readings.map(r => {
      const dead = r.bdl === true;
      const miss = r.do == null;
      return `<span class="y-mc${dead ? ' is-dead' : ''}${miss ? ' is-miss' : ''}" title="${esc(s.station)} ${r.month}: ${miss ? 'not reported' : (dead ? 'below detection limit' : n1(r.do) + ' mg/L')}">
              <i class="y-mc-m">${r.month}</i><i class="y-mc-v">${miss ? '—' : n1(r.do)}</i></span>`;
    }).join('');
    const anyLive = s.readings.some(r => r.do != null && r.bdl !== true && r.do >= L.do.value);
    return `<div class="y-mr">
          <p class="y-mr-n">${esc(shortName(s.station))}<span class="cap y-mr-p">${esc(s.position)}</span></p>
          <div class="y-mr-c">${cells}</div>
          <p class="cap y-mr-s">${anyLive
      ? 'above the legal minimum in every month it was measured'
      : '<b class="is-red">below the detection limit in every month it was measured</b>'}</p>
        </div>`;
  }).join('\n        ');

  const mm = ATTN.months.filter(m => !m.partial);
  const peakV = Math.max(...mm.map(m => m.views));
  const bars = mm.slice(-36).map(m => {
    const h = Math.max(1, Math.round(m.views / peakV * 100));
    const isPeak = m.views === ATTN.peak.views;
    return `<i class="y-ab${isPeak ? ' is-peak' : ''}" style="--h:${h}%" title="${m.month.slice(4)}/${m.month.slice(0, 4)}: ${n0(m.views)} views"></i>`;
  }).join('');

  return `${opener('trend', 'Where it is going', 'The best answer available is six months long, and it is the same answer six times.')}
    <div class="wrap">
      ${tabs('Trend views', [
    ['Month by month, 2025', `<div class="y-panel">
          <p>CPCB samples four Delhi stations monthly and the results were published in a written
            answer to Parliament in July 2025. This is the finest cadence that exists for this
            river &mdash; and it is the reason the page says <b>PERIODIC</b> and never
            <b>LIVE</b>. Each cell is the dissolved oxygen for that month.</p>
          ${monthly}
          <p class="cap y-panel-c"><b>${monthlyBdl.length} of the ${monthlyMeasured} monthly oxygen
            readings taken in Delhi in the first half of 2025 were below the detection
            limit.</b> Not falling. Not seasonal. The same reading, every month, at every station
            downstream of the city.</p>
          <p class="cap p-hole">Blank cells are blank in the source. March oxygen is missing at two
            stations and March bacteria at one, and they are left empty rather than carried forward
            from February or interpolated.</p>
        </div>`],
    ['Two years apart', `<div class="y-panel">
          <p>There is no machine-readable multi-year series for this river. CPCB republishes the
            same measurements in a <b>different column layout every year</b> &mdash; the 2023 file
            is an all-rivers document with extra columns where the 2025 one has pH &mdash; so a
            parser written for one year silently reads the wrong column for another.</p>
          <p>So instead of a series, one check that survives any layout: <b>the value against its
            own station name.</b></p>
          <div class="y-cc">
            <div class="y-cc-r"><span class="y-cc-y">2023</span><span class="y-cc-v is-red">0.3</span><span class="cap y-cc-l">ISBT bridge, ITO bridge, Nizamuddin</span></div>
            <div class="y-cc-r"><span class="y-cc-y">2025</span><span class="y-cc-v is-red">0.3</span><span class="cap y-cc-l">the same three stations</span></div>
          </div>
          <p class="cap y-panel-c">Two years apart, three stations, the same number &mdash; and that
            number is the floor of the method. Whatever has been done between those two readings has
            not moved this one.</p>
          <p class="cap p-hole">This is deliberately not drawn as a trend line. Two points are not a
            trend, and a line between them would imply a rate this data cannot support.</p>
        </div>`],
    ['Who is looking', `<div class="y-panel">
          <p>How much the public looks up the Yamuna, month by month, measured as views of the
            English Wikipedia article. It measures <b>attention</b>, never water quality.</p>
          <div class="y-att" role="img" aria-label="Monthly attention over the last three years, peaking at ${n0(ATTN.peak.views)} views">${bars}</div>
          <p class="cap y-panel-c">Peak <b>${n0(ATTN.peak.views)}</b> in
            ${esc(monthName(ATTN.peak.month))} against a floor of <b>${n0(ATTN.floor.views)}</b> in
            ${esc(monthName(ATTN.floor.month))} &mdash; a swing of <b>${ATTN.swing}×</b>.
            The peak is the month the river <b>flooded Delhi</b>. The oxygen reading did not change
            in that month, or in any other.</p>
          <p class="cap p-hole"><b>A quiet month is not a clean month.</b> Attention arrives when the
            river comes into the city, and leaves when it goes back inside its banks. The reading
            stays where it is either way. The current month is incomplete and is excluded from every
            figure here.</p>
        </div>`],
  ])}
      <p style="margin:0"><a class="act" href="#sources">Where it comes from ${ARROW}</a></p>
    </div>`;
};

/* WHERE IT COMES FROM. The sewage arithmetic. This band is the page's real
   finding and every number in it is subtraction on the reply's own figures. */
B.sources = () => {
  const bar = (label, mld, cls) => {
    const w = Math.round(mld / SW.generated_mld * 100);
    return `<div class="y-sq">
          <span class="lbl y-sq-l">${label}</span>
          <span class="y-sq-t"><i class="y-sq-f ${cls}" style="--w:${w}%"></i></span>
          <span class="y-sq-v">${n0(mld)}<i class="cap">MLD</i></span>
        </div>`;
  };
  return `${opener('sources', 'Where it comes from', 'Not factories. The city.')}
    <div class="wrap">
      <p class="lead-2">Every figure in this band comes from one paragraph of one parliamentary
        answer, and every derived figure shows its own arithmetic. Nothing is inferred beyond the
        subtraction shown.</p>
      <div class="y-sqs">
        ${bar('Sewage Delhi produces', SW.generated_mld, 'is-all')}
        ${bar('Treatment capacity built', SW.installed_capacity_mld, 'is-cap')}
        ${bar('Capacity actually used', SW.capacity_utilised_mld, 'is-use')}
        ${bar('Treated to the standard', SW.compliant_treated_mld, 'is-ok')}
      </div>
      <div class="y-find">
        <div class="y-find-c">
          <p class="num y-find-n is-red">${n0(D.idle_capacity_mld.value)}<i class="cap">MLD</i></p>
          <p class="lbl">of treatment capacity built and not used</p>
          <p class="cap">${esc(D.idle_capacity_mld.sum)}. At the same time,
            <b>${n0(SW.untreated_mld)} MLD</b> of sewage goes into the river untreated. The idle
            capacity is <b>${D.idle_capacity_mld.covers_pct_of_untreated}%</b> of the untreated
            flow. Delhi is not only short of plants. It is not using the plants it has.</p>
        </div>
        <div class="y-find-c">
          <p class="num y-find-n is-red">${SW.stps_non_compliant} <i class="cap">of ${SW.stps_operational}</i></p>
          <p class="lbl">sewage plants that fail Delhi&rsquo;s own discharge standard</p>
          <p class="cap">${D.non_compliant_stp_share_pct}% of the city&rsquo;s working plants do not
            meet the limits set by Delhi&rsquo;s own pollution control committee. A plant that runs
            and does not clean is counted as capacity.</p>
        </div>
        <div class="y-find-c">
          <p class="num y-find-n is-red">${n0(SW.capacity_utilised_mld - SW.compliant_treated_mld)}<i class="cap">MLD</i></p>
          <p class="lbl">of sewage that IS treated, and still fails the standard</p>
          <p class="cap">${n0(SW.capacity_utilised_mld)} treated minus ${n0(SW.compliant_treated_mld)}
            compliant. <b>Nearly a third of everything Delhi treats does not meet the
            standard it is treated to.</b> This is the figure that sits between the two numbers
            usually quoted &mdash; it is neither the ${n0(SW.untreated_mld)} MLD that never reaches
            a plant, nor the capacity that does. It is water that went through the process and came
            out failing.</p>
        </div>
      </div>
      <p class="y-note"><b>And it is not industry.</b> CPCB inspected
        ${PARL.industry.gpis_inspected} grossly polluting industries on the Yamuna&rsquo;s main stem
        in ${PARL.industry.inspection_year}. Their total discharge was
        <b>${n1(PARL.industry.discharge_mld)} MLD</b> &mdash; against
        ${n0(SW.untreated_mld)} MLD of untreated sewage. On the government&rsquo;s own numbers,
        industry is roughly <b>one five-hundredth</b> of the problem in this river. That is worth
        saying plainly, because it is not what most coverage implies.</p>
      <p class="cap y-sub-note">Of those ${PARL.industry.gpis_inspected},
        ${PARL.industry.operational} were operating and ${PARL.industry.non_complying} of those
        &mdash; ${D.gpi_non_compliance_pct}% &mdash; were breaking their discharge conditions or had
        no valid consent. ${PARL.industry.show_cause_notices} received a show-cause notice and
        ${PARL.industry.closure_directions} were ordered shut.</p>
      <details class="dx">
        <summary class="dx-s">Two sources, published as two</summary>
        <div class="dx-b">
      <p>This page&rsquo;s readings are CPCB&rsquo;s. A second compiler,
        <a class="lk" href="${esc(XC.crosscheck.source.url)}">RiverWatch India</a>, publishes a
        CPCB-derived station table with something CPCB&rsquo;s own PDF lacks &mdash; coordinates.
        It is used for placement and never for a value, and its disagreements are printed rather
        than resolved.</p>
      <div class="y-xc">
        <div class="y-xc-r"><span class="y-xc-v">${n0(XC.crosscheck.declared.stations)}</span><span class="cap">stations its headline and share text claim</span></div>
        <div class="y-xc-r"><span class="y-xc-v">${n0(XC.crosscheck.parsed)}</span><span class="cap">rows in the table it actually draws</span></div>
        <div class="y-xc-r"><span class="y-xc-v is-red">${XC.crosscheck.yamuna_delhi_rows}</span><span class="cap">of its ${XC.crosscheck.yamuna_rows} Yamuna stations that are in Delhi</span></div>
        <div class="y-xc-r"><span class="y-xc-v">${XC.crosscheck.malformed.length}</span><span class="cap">records with two stations merged into one row</span></div>
      </div>
      <p class="cap y-panel-c">On the stretch this page is about, the second source is silent: it
        carries no Palla, no Wazirabad, no ITO, no Okhla. That is why it is a cross-check and not a
        reading. Neither number is averaged into the other.</p>
        </div>
      </details>
      <p style="margin:0"><a class="act" href="#money">What has been spent ${ARROW}</a></p>
    </div>`;
};

/* WHAT HAS BEEN SPENT. On paper. Every figure quoted, the document attached,
   and no inference drawn beyond the arithmetic (D-13.6). No "wasted", no
   "failed", no "diverted". */
B.money = () => {
  const ng = PARL.money.namami_gange_delhi;
  const projects = ng.projects.map(p => `<div class="y-pj">
          <span class="y-pj-n">${esc(p.name)}</span>
          <span class="y-pj-m">${p.mld ? `${n0(p.mld)} MLD` : '&mdash;'}</span>
          <span class="y-pj-c">&#8377;${n1(p.crore)} cr</span>
          <span class="cap y-pj-s">${esc(p.status)}</span>
        </div>`).join('\n        ');
  return `${opener('money', 'What has been spent', 'Nine projects. All of them finished. The oxygen has not moved.')}
    <div class="wrap">
      <div class="y-mon">
        <div class="y-mon-c">
          <p class="num y-mon-n">&#8377;${n0(ng.cost_crore)}<i class="cap">crore</i></p>
          <p class="lbl">sanctioned for sewerage work in Delhi under Namami Gange</p>
        </div>
        <div class="y-mon-c">
          <p class="num y-mon-n">${n0(ng.capacity_created_mld)}<i class="cap">MLD</i></p>
          <p class="lbl">of treatment capacity it created</p>
        </div>
        <div class="y-mon-c">
          <p class="num y-mon-n">${ng.projects_sanctioned}<i class="cap">of ${ng.projects_sanctioned}</i></p>
          <p class="lbl">projects completed</p>
        </div>
      </div>
      <p class="lead-2">That is <b>&#8377;${D.cost_per_mld_crore.value} crore for every million litres
        a day</b> of capacity &mdash; ${esc(D.cost_per_mld_crore.sum)}. Separately,
        <b>&#8377;${n0(PARL.money.since_january_2025.allocated_crore)} crore</b> was allocated for
        Yamuna cleaning from January 2025 by NMCG and the Delhi government, of which
        <b>&#8377;${n1(PARL.money.since_january_2025.utilised_crore)} crore</b>
        &mdash; ${D.utilisation_2025_pct.value}% &mdash; had been spent by the date of the reply.</p>
      <details class="dx">
        <summary class="dx-s">All ${ng.projects_sanctioned} projects, with cost and capacity</summary>
        <div class="dx-b"><div class="y-pjs">
        <div class="y-pjh"><span class="lbl">Project</span><span class="lbl">Capacity</span><span class="lbl">Cost</span><span class="lbl">Status</span></div>
        ${projects}
        <div class="y-pj is-tot"><span class="y-pj-n"><b>Total</b></span><span class="y-pj-m"><b>${n0(ng.capacity_created_mld)} MLD</b></span><span class="y-pj-c"><b>&#8377;${n1(ng.cost_crore)} cr</b></span><span class="cap y-pj-s">all completed</span></div>
        </div></div>
      </details>

      <h3 class="d2 y-h3">And the river it flows into</h3>
      <p class="lead-2">Delhi&rsquo;s Yamuna work is one part of Namami Gange, the national mission
        for the Ganga basin. Without the national figure the Delhi figure has no scale.</p>
      <div class="y-mon">
        <div class="y-mon-c">
          <p class="num y-mon-n">&#8377;${n0(GAN.sewerage.cost_crore)}<i class="cap">crore</i></p>
          <p class="lbl">taken up across ${GAN.sewerage.projects_taken_up} sewerage projects, basin-wide</p>
        </div>
        <div class="y-mon-c">
          <p class="num y-mon-n">${n0(GAN.sewerage.capacity_operational_mld)}<i class="cap">of ${n0(GAN.sewerage.capacity_sanctioned_mld)} MLD</i></p>
          <p class="lbl">running, as of ${esc(GAN.sewerage.as_of)}</p>
        </div>
        <div class="y-mon-c">
          <p class="num y-mon-n">${GAN.derived.capacity_completed_pct.value}<i class="cap">%</i></p>
          <p class="lbl">of the capacity paid for is switched on</p>
        </div>
      </div>
      <p class="cap y-sub-note">${GAN.sewerage.stps_completed} of
        ${GAN.sewerage.projects_taken_up} projects are complete
        (${GAN.derived.projects_completed_pct.value}%), and
        ${GAN.sewerage.commissioned_in_2025.stps} plants adding
        ${n0(GAN.sewerage.commissioned_in_2025.mld)} MLD were commissioned during 2025 &mdash;
        ${GAN.derived.share_of_2025_additions.value}% of everything now running. Alongside the
        sewerage: ${n0(GAN.other_work.afforestation_ha)} hectares afforested along the Ganga for
        about &#8377;${n0(GAN.other_work.afforestation_crore)} crore, and the first country-wide
        river dolphin assessment put the Gangetic dolphin population at
        ${n0(GAN.other_work.dolphins_estimated)}.
        <a class="lk" href="${esc(GAN.source.url)}">${esc(GAN.source.publication)}, ${esc(GAN.source.date)}</a>.</p>
      <p class="cap p-hole"><b>One division this page will not do.</b>
        ${esc(GAN.what_cannot_be_computed.national_cost_per_mld)}</p>
      <p class="y-note">The page states the money and the reading side by side and draws no line
        between them. <b>Completed is not the same word as working, and this page will not use
        one to mean the other.</b> What is on the record is that the capacity was built, the
        projects were signed off, and the oxygen at four Delhi stations still reads below the
        detection limit.</p>
${hole('The total ever spent on the Yamuna is not on this page. Figures of six and a half thousand crore and eight thousand crore circulate widely, sourced to a parliamentary panel through newspapers rather than to the panel\'s own report. Under this site\'s rules a figure reported by a newspaper is reporting, not data — it belongs in the coverage list below, never in this band. Closing this properly needs the panel report itself, and that is the largest single piece of work still outstanding on this page.')}
      <h3 class="d2 y-h3">What is being said</h3>
      <p class="cap y-reg-i">${n0(NEWS.register.count)} items from
        ${n0(Object.keys(NEWS.register.publishers || {}).length)} publishers, most recent first.
        <b>Reporting is tagged as reporting.</b> A headline is evidence that something was said,
        never that it is true, and no figure on this page was taken from one.</p>
      <details class="dx">
        <summary class="dx-s">Read the ${n0(Math.min(40, NEWS.register.count || 0))} most recent items</summary>
        <div class="dx-b">
          <ol class="p-news-ol y-reg">
            ${(NEWS.register.items || []).slice(0, 40).map(i => `<li class="p-news-r"><a class="p-news-o" href="${esc(i.link)}">${esc(i.title)}</a><span class="cap p-news-m">${esc(i.publisher || 'unattributed')}${i.published ? ` &middot; ${esc(shortDate(i.published))}` : ''}</span></li>`).join('\n            ')}
          </ol>
          <p class="cap y-pub"><b>Publishers in the sample:</b> ${Object.entries(NEWS.register.publishers || {}).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`${esc(k)} (${v})`).join(' &middot; ')}</p>
        </div>
      </details>
      <p style="margin:0"><a class="act" href="#act">What you can do ${ARROW}</a></p>
    </div>`;
};

B.act = () => `${opener('act', 'What you can do', 'The river is downstream of a decision. Some of those decisions are yours.')}
    <div class="wrap">
      <div class="p-act">
        <div class="p-act-c">
          <p class="lbl">Walk it</p>
          <p>Swechha has run the Yamuna walk for two decades, and it is the single thing that
            changes how people talk about this river. You stand at the foam line. Nothing on a
            screen does that.</p>
          <p style="margin:0"><a class="act" href="/design/v3/home.html#journeys">Yamuna Yatra ${ARROW}</a></p>
        </div>
        <div class="p-act-c">
          <p class="lbl">Ask one question</p>
          <p>Your ward has a sewage connection or it does not, and a plant that meets the standard
            or one of the ${SW.stps_non_compliant} that does not. Both are public. Ask which, in
            writing, and ask what the plan is for the
            <b>${n0(D.idle_capacity_mld.value)} MLD</b> of capacity already built and not used.</p>
          <p style="margin:0"><a class="act" href="${esc(PARL.source.url)}">The reply these figures come from ${ARROW}</a></p>
        </div>
        <div class="p-act-c">
          <p class="lbl">Stop sending it there</p>
          <p>Idols, ashes, flowers, plastic and oil all arrive at the same water. It is the smallest
            of the causes on this page and the only one an individual fully controls.</p>
          <p style="margin:0"><a class="act" href="/design/v3/home.html#give">Support the work ${ARROW}</a></p>
        </div>
      </div>
      <p class="cap y-close">Every figure on this page is public, dated and linked. If one is wrong,
        the source is named so you can prove it &mdash; which is the only kind of number worth
        publishing.</p>
${siblings('yamuna')}
    </div>`;

/* ═══ HELPERS ════════════════════════════════════════════════════════════ */
// CPCB's station names carry the river, the state and sometimes a parenthetical.
// The stretch table needs the place. Trimmed for display only; the full name is
// in the committed data and in the source document.
function shortName(s) {
  return String(s)
    .replace(/^RIVER YAMUNA (AT|U\/S|D\/S)\s*/i, '')
    .replace(/,?\s*DELHI$/i, '')
    .replace(/\s*\(INLET OF AGRA CANAL\)/i, '')
    .replace(/AFTER MEETING OF SHAHDARA DRAIN/i, 'Okhla, after the Shahdara drain')
    .replace(/AFTER CONFLUENCE OF SHAHDARA DRAIN AND TUGHLAKABAD DRAIN/i, 'after two drains join')
    .replace(/\bOKHLA BARRAGE D\/S\b/i, 'Okhla barrage')
    .replace(/\bISBT BRIDGE\b/i, 'ISBT bridge')
    .replace(/\bITO BRIDGE\b/i, 'ITO bridge')
    .replace(/\bASGARPUR\b.*/i, 'Asgarpur, after two drains join')
    .trim()
    .replace(/^(\w)(.*)$/, (_, a, b) => a + b.toLowerCase())
    .replace(/\bisbt\b/i, 'ISBT').replace(/\bito\b/i, 'ITO');
}
function monthName(m) { return `${MON3[Number(String(m).slice(4, 6)) - 1]} ${String(m).slice(0, 4)}`; }
function shortDate(s) {
  const m = /(\d{1,2})\s+(\w{3})\w*\s+(\d{4})/.exec(String(s));
  return m ? `${m[1]} ${m[2]} ${m[3]}` : String(s).slice(0, 16);
}

/* ═══ PAGE CSS — layout only. Every hue, voice and rule is a frozen token. ══ */
const PAGE_CSS = `
/* ══ AD-16 — THE YAMUNA PAGE'S OWN BLOCK ══════════════════════════════════
   Everything above is EXTRACTED: the token and chrome layer from the frozen
   home.html, the situation-page layer from the Air build. Nothing below
   re-picks a colour or a type size. Layout only, plus four components this
   subject needs that Air did not: the stretch table, the monthly oxygen grid,
   the sewage quantity bars and the project table.
   ═══════════════════════════════════════════════════════════════════════ */
.y-bdl{font-size:.34em;letter-spacing:.06em;vertical-align:.5em;color:var(--fg-3);font-weight:500}
.y-plain{font-size:clamp(15px,1.05vw,17px);line-height:1.62;color:var(--fg-2);max-width:46ch;margin:0 0 .7em}
.y-note{border-left:2px solid var(--hair);padding:2px 0 2px 16px;margin:clamp(20px,2.2vw,30px) 0;
  font-size:clamp(15px,1.05vw,17px);line-height:1.6;color:var(--fg-2);max-width:62ch}
.paper .y-note{border-left-color:var(--rule-2);color:var(--ink-2)}
.y-sub-note{max-width:60ch;color:var(--fg-3);margin:.6em 0 0}
.paper .y-sub-note{color:var(--ink-3)}
.y-big{font-size:clamp(38px,4.4vw,62px);line-height:.94;margin:0 0 .18em}
.y-h3{margin:clamp(30px,3.4vw,46px) 0 .5em}
.y-src-p{max-width:60ch;margin:clamp(18px,2vw,26px) 0 clamp(20px,2.2vw,28px)}
.y-close{max-width:60ch;color:var(--fg-3);margin:clamp(22px,2.4vw,32px) 0 0}
.lead-2{font-size:clamp(16px,1.15vw,18.5px);line-height:1.58;max-width:62ch;margin:0 0 1.1em;color:var(--fg-2)}
.paper .lead-2{color:var(--ink-2)}

/* THE FOUR DEFINITIONS, inside the tabs. */
.y-def{max-width:62ch}
.y-def-h{font-family:var(--ff-d,inherit);font-size:clamp(15px,1.1vw,17.5px);margin:0 0 .6em;color:var(--ink)}
.y-def p{font-size:clamp(14.5px,1vw,16.5px);line-height:1.6;color:var(--ink-2);margin:0 0 .75em}

/* THE STRETCH. Six columns at 1440, stacked to three rows at 375. */
.y-sth,.y-st{display:grid;grid-template-columns:1.6em minmax(0,1fr) 4.4em minmax(90px,1fr) 3.6em 4.6em;
  gap:0 clamp(8px,1vw,16px);align-items:center}
.y-sth{padding:0 0 8px;border-bottom:1px solid var(--hair)}
.y-sth .lbl{font-size:10.5px;color:var(--fg-3)}
.y-sts{margin:0 0 12px}
.y-st{padding:11px 0;border-bottom:1px solid var(--hair-2)}
.y-st-i{color:var(--fg-3);font-variant-numeric:tabular-nums}
.y-st-n{font-size:clamp(13.5px,.95vw,15.5px);color:var(--fg);min-width:0;overflow-wrap:break-word}
.y-st.is-dead .y-st-n{color:var(--fg)}
.y-st-do,.y-st-v,.y-st-fc{font-variant-numeric:tabular-nums;text-align:right}
.y-st-do{font-size:clamp(15px,1.15vw,18px);font-weight:500;color:var(--fg)}
.y-bdl2{display:block;font-size:9px;font-style:normal;letter-spacing:.06em;color:var(--fg-3);line-height:1}
.y-st-bar{position:relative;display:block;height:9px;background:var(--hair-2);border-radius:1px}
.y-st-fill{position:absolute;inset:0 auto 0 0;width:var(--w);background:var(--red);border-radius:1px}
.y-st-lim{position:absolute;top:-3px;bottom:-3px;left:var(--x);width:2px;background:var(--fg-2)}
.y-st-v{font-size:clamp(12.5px,.9vw,14px);color:var(--fg-2)}
.y-st-fc{font-size:11px;color:var(--fg-3)}
.y-stk{display:flex;flex-wrap:wrap;gap:0 6px;align-items:center;color:var(--fg-3)}
.y-k-fill,.y-k-lim{display:inline-block;vertical-align:middle}
.y-k-fill{width:14px;height:8px;background:var(--red)}
.y-k-lim{width:2px;height:12px;background:var(--fg-2)}
.is-red{color:var(--red)}
.paper .is-red{color:var(--red-ink)}

/* THE MONTHLY OXYGEN GRID.
   ★ THESE COMPONENTS LIVE ON A DARK GROUND, and the first version of this
   block styled them with the PAPER ink tokens because they were written
   alongside the .y-def definitions, which are on paper. Measured in the
   browser that produced ten contrast failures, the worst at 2.11:1 — the same
   defect class the template records for the Air build (--fg-3 on paper,
   2.66:1). The tokens exist in both families precisely so this is a one-line
   fix rather than a re-pick; nothing below chooses a new colour. */
.y-panel{max-width:70ch}
.y-panel>p{font-size:clamp(14.5px,1vw,16.5px);line-height:1.6;color:var(--fg-2);margin:0 0 .85em}
.y-panel-c{color:var(--fg-3);max-width:62ch;margin:.8em 0 .6em}
.y-mr{padding:12px 0;border-bottom:1px solid var(--hair-2)}
.y-mr-n{font-size:clamp(13.5px,.95vw,15.5px);color:var(--fg);margin:0 0 7px}
.y-mr-p{display:block;color:var(--fg-3);font-size:11px;margin-top:1px}
.y-mr-c{display:flex;flex-wrap:wrap;gap:5px}
.y-mc{display:inline-grid;place-items:center;min-width:44px;padding:5px 6px;
  background:rgba(251,248,240,.05);border:1px solid var(--hair-2)}
.y-mc-m{font-size:9.5px;letter-spacing:.05em;color:var(--fg-3);font-style:normal}
.y-mc-v{font-size:14px;font-variant-numeric:tabular-nums;color:var(--fg);font-style:normal}
.y-mc.is-dead{background:rgba(241,72,78,.12);border-color:rgba(241,72,78,.42)}
.y-mc.is-dead .y-mc-v{color:var(--red);font-weight:600}
.y-mc.is-miss .y-mc-v{color:var(--fg-3)}
.y-mr-s{color:var(--fg-3);margin:7px 0 0}
.y-cc{margin:.4em 0 .8em}
.y-cc-r{display:grid;grid-template-columns:3.4em 3.6em minmax(0,1fr);gap:0 12px;align-items:baseline;
  padding:9px 0;border-bottom:1px solid var(--hair-2)}
.y-cc-y{font-size:12px;letter-spacing:.05em;color:var(--fg-3)}
.y-cc-v{font-size:clamp(20px,1.7vw,26px);font-variant-numeric:tabular-nums;color:var(--fg)}
.y-cc-l{color:var(--fg-3)}

/* ATTENTION BARS. A bar is not text, so it is held to the 3:1 non-text floor
   rather than 4.5:1 — but --hair at 20% opacity would be invisible against
   this ground, so the bars take --fg-3, which is the faintest INK token and
   reads cleanly as a mark. */
.y-att{display:flex;align-items:flex-end;gap:2px;height:88px;margin:.4em 0 .2em}
.y-ab{flex:1 1 0;min-width:2px;height:var(--h);background:var(--fg-3);border-radius:1px 1px 0 0}
.y-ab.is-peak{background:var(--mustard)}

/* AIR'S NEWS REGISTER, REUSED ON A PAPER BAND. Its own rules assume a dark
   ground — .p-news-o is --fg-3, which measures 2.66:1 on paper. Overridden
   here rather than moved, because the register belongs beside the money it
   comments on. Same defect, same fix, opposite direction. */
.paper .p-news-o{color:var(--ink)}
.paper .p-news-m{color:var(--ink-3)}
.paper .p-news-r{border-color:var(--rule)}

/* THE SEWAGE QUANTITY BARS. Weight and ink, never red — a quantity is not a
   broken limit (SITUATION-PAGE-TEMPLATE.md §3). Only the derived shortfall
   figures below carry red, because those are the breach. */
.y-sqs{margin:0 0 clamp(24px,2.6vw,34px)}
.y-sq{display:grid;grid-template-columns:minmax(0,13em) minmax(80px,1fr) 5.2em;gap:0 clamp(10px,1.2vw,18px);
  align-items:center;padding:10px 0;border-bottom:1px solid var(--hair-2)}
.y-sq-l{font-size:11px;color:var(--fg-2)}
.y-sq-t{display:block;height:14px;background:var(--hair-2)}
.y-sq-f{display:block;height:100%;width:var(--w)}
.y-sq-f.is-all{background:var(--fg-2)}
.y-sq-f.is-cap{background:var(--fg-3)}
.y-sq-f.is-use{background:rgba(251,248,240,.34)}
.y-sq-f.is-ok{background:var(--green)}
.y-sq-v{font-size:clamp(15px,1.15vw,18px);font-variant-numeric:tabular-nums;text-align:right;color:var(--fg)}
.y-sq-v i{display:block;font-size:9.5px;font-style:normal;color:var(--fg-3);line-height:1}

.y-find,.y-mon,.y-xc{display:grid;gap:clamp(18px,2vw,30px)}
.y-find{grid-template-columns:1fr}
.y-find-c{border-top:2px solid var(--hair);padding-top:14px}
.y-find-n{font-size:clamp(34px,3.8vw,52px);line-height:.96;margin:0 0 .12em;font-variant-numeric:tabular-nums}
.y-find-n i{font-size:.3em;font-style:normal;letter-spacing:.05em;color:var(--fg-3);margin-left:.35em}
.y-find-c .lbl{display:block;margin:0 0 .5em;color:var(--fg-2)}
.y-find-c .cap{max-width:52ch;color:var(--fg-3)}
.y-xc{grid-template-columns:1fr;gap:0}
.y-xc-r{display:grid;grid-template-columns:5.4em minmax(0,1fr);gap:0 14px;align-items:baseline;
  padding:10px 0;border-bottom:1px solid var(--hair-2)}
.y-xc-v{font-size:clamp(19px,1.6vw,25px);font-variant-numeric:tabular-nums;text-align:right;color:var(--fg)}
.y-xc-r .cap{color:var(--fg-3)}

/* MONEY, on paper. */
.y-mon{grid-template-columns:1fr;margin:0 0 clamp(20px,2.2vw,28px)}
.y-mon-c{border-top:2px solid var(--rule-2);padding-top:12px}
.y-mon-n{font-size:clamp(30px,3.4vw,46px);line-height:.98;margin:0 0 .14em;font-variant-numeric:tabular-nums;color:var(--ink)}
.y-mon-n i{font-size:.3em;font-style:normal;letter-spacing:.05em;color:var(--ink-3);margin-left:.3em}
.y-mon-c .lbl{color:var(--ink-2);max-width:26ch;display:block}
.y-pjs{margin:clamp(20px,2.2vw,28px) 0 0}
.y-pjh,.y-pj{display:grid;grid-template-columns:minmax(0,1fr) 5.4em 6.4em 6.2em;gap:0 clamp(8px,1vw,14px);
  align-items:baseline;padding:10px 0;border-bottom:1px solid var(--rule)}
.y-pjh{padding-bottom:7px;border-bottom:1px solid var(--rule-2)}
.y-pjh .lbl{font-size:10.5px;color:var(--ink-3)}
.y-pj-n{font-size:clamp(13px,.92vw,14.5px);color:var(--ink);min-width:0;overflow-wrap:break-word}
.y-pj-m,.y-pj-c{font-size:clamp(12.5px,.9vw,14px);font-variant-numeric:tabular-nums;text-align:right;color:var(--ink-2)}
.y-pj-s{color:var(--ink-3);text-align:right}
.y-pj.is-tot{border-bottom:none;border-top:2px solid var(--rule-2);margin-top:2px}
.y-reg-i{max-width:62ch;color:var(--ink-3)}
.y-reg{margin:.6em 0 clamp(20px,2.2vw,28px)}

/* ══ THE NATIONAL BAND (paper) and the DISCLOSURE ═════════════════════════
   Added after the client asked for the wider river picture at the top, plus
   groundwater and the health burden. On paper, so every token here is an ink
   token — the mistake made once already on this page was reaching for the
   wrong family, and it measured 2.11:1. */
.r-panel{max-width:70ch}
.r-panel>p{font-size:clamp(14.5px,1vw,16.5px);line-height:1.6;color:var(--ink-2);margin:0 0 .9em}
.r-hole,.r-note{color:var(--ink-3);max-width:62ch;margin:.9em 0 0}
.r-src{max-width:64ch;color:var(--ink-3);margin:clamp(20px,2.2vw,28px) 0 clamp(18px,2vw,24px)}
.r-hd,.r-rw{display:grid;grid-template-columns:1.5em minmax(0,1fr) minmax(70px,1fr) 3.4em 3em 2.2em;
  gap:0 clamp(7px,.9vw,13px);align-items:center}
.r-hd{padding:0 0 7px;border-bottom:1px solid var(--rule-2)}
.r-hd .lbl{font-size:10px;color:var(--ink-3)}
.r-rw{padding:9px 0;border-bottom:1px solid var(--rule)}
.r-rw-i{color:var(--ink-3);font-variant-numeric:tabular-nums}
.r-rw-n{font-size:clamp(13px,.93vw,15px);color:var(--ink);min-width:0;overflow-wrap:break-word}
.r-rw.is-y{background:rgba(225,163,43,.10)}
.r-rw-y{display:block;font-size:9.5px;font-style:normal;letter-spacing:.05em;color:var(--ink-3);line-height:1.2}
.r-rw-b{position:relative;display:block;height:8px;background:var(--rule)}
.r-rw-f{position:absolute;inset:0 auto 0 0;width:var(--w);background:var(--ink-2)}
.r-rw.is-y .r-rw-f{background:var(--mustard)}
.r-rw-l{position:absolute;top:-3px;bottom:-3px;left:var(--x);width:2px;background:var(--red-ink)}
.r-rw-v,.r-rw-x,.r-rw-s{font-variant-numeric:tabular-nums;text-align:right}
.r-rw-v{font-size:clamp(12.5px,.9vw,14px);color:var(--ink)}
.r-rw-x{font-size:11px}
.r-rw-s{font-size:10.5px;color:var(--ink-3)}
.r-hl{display:grid;grid-template-columns:1fr;gap:clamp(18px,2vw,28px);margin:.3em 0 0}
.r-hl-c{border-top:2px solid var(--rule-2);padding-top:12px}
.r-hl-n{font-size:clamp(30px,3.4vw,46px);line-height:.98;margin:0 0 .1em;font-variant-numeric:tabular-nums;color:var(--ink)}
.r-hl-n i{font-size:.42em;font-style:normal}
.r-hl-c .cap{color:var(--ink-3);max-width:46ch}

/* GROUNDWATER. A quantity, so it gets weight and ink — red is reserved for the
   stage of extraction above 100%, which IS a threshold crossed. */
.g-hero{margin:.2em 0 .9em}
.g-hero-n{font-size:clamp(44px,5vw,72px);line-height:.92;margin:0 0 .1em;font-variant-numeric:tabular-nums}
.g-hero-n i{font-size:.4em;font-style:normal}
.g-lbl{display:block;color:var(--ink-3);margin:1.1em 0 .5em}
.g-cats{display:grid;grid-template-columns:repeat(2,1fr);gap:1px;background:var(--rule)}
.g-cat{background:var(--paper);padding:11px 12px}
.g-cat-v{display:block;font-size:clamp(22px,2vw,30px);line-height:1;font-variant-numeric:tabular-nums;color:var(--red-ink)}
.g-cat.is-ok .g-cat-v{color:var(--ink)}
.g-cat-l{display:block;font-size:10.5px;color:var(--ink-2);margin-top:3px}
.g-cat-p{display:block;color:var(--ink-3);margin-top:1px}
.g-cap{color:var(--ink-3);max-width:62ch;margin:.7em 0 0}
.g-sts{margin:.3em 0 .2em}
.g-st{display:grid;grid-template-columns:minmax(0,7.6em) minmax(70px,1fr) 4.2em;gap:0 10px;
  align-items:center;padding:8px 0;border-bottom:1px solid var(--rule)}
.g-st-n{font-size:12.5px;color:var(--ink-2)}
.g-st.is-d .g-st-n{color:var(--ink);font-weight:600}
.g-st-b{position:relative;display:block;height:8px;background:var(--rule)}
.g-st-f{position:absolute;inset:0 auto 0 0;width:var(--w);background:var(--ink-2)}
.g-st.is-d .g-st-f{background:var(--mustard)}
.g-st-l{position:absolute;top:-3px;bottom:-3px;left:var(--x);width:2px;background:var(--red-ink)}
.g-st-v{font-size:12.5px;font-variant-numeric:tabular-nums;text-align:right;color:var(--ink)}

/* The disclosure and the measure row now come from situation-shell.mjs's
   SHARED_PAGE_CSS, so all five situation pages carry one copy. */

@media (min-width:760px){
  .r-hl{grid-template-columns:repeat(3,1fr)}
  .g-cats{grid-template-columns:repeat(4,1fr)}
}
@media (max-width:639px){
  .r-hd{display:none}
  .r-rw{grid-template-columns:1.4em minmax(0,1fr) 3.2em 2.8em;
    grid-template-areas:'i n v x' '. b b b';gap:5px 8px;padding:11px 0}
  .r-rw-i{grid-area:i}.r-rw-n{grid-area:n}.r-rw-v{grid-area:v}.r-rw-x{grid-area:x}
  .r-rw-b{grid-area:b}
  .r-rw-s{display:none}
  .g-cats{grid-template-columns:repeat(2,1fr)}
  .g-st{grid-template-columns:minmax(0,1fr) 4em;grid-template-areas:'n v' 'b b';gap:4px 8px}
  .g-st-n{grid-area:n}.g-st-v{grid-area:v}.g-st-b{grid-area:b}
}

@media (min-width:760px){
  .y-find{grid-template-columns:1fr 1fr}
  .y-mon{grid-template-columns:repeat(3,1fr)}
  .y-xc{grid-template-columns:1fr 1fr;gap:0 clamp(20px,2.4vw,34px)}
}
@media (max-width:639px){
  /* THE STRETCH, RESHAPED FOR THE THUMB. Six columns do not fit at 375 and
     squeezing them produces a 4-character station name, so the row becomes two
     lines: name and oxygen on the first, the bar and its numbers on the second.
     Budgeted against the 900px-at-375 per-band ceiling. */
  .y-sth{display:none}
  .y-st{grid-template-columns:1.5em minmax(0,1fr) 4.2em;grid-template-areas:'i n d' '. b b';
    gap:6px clamp(8px,2vw,12px);padding:13px 0}
  .y-st-i{grid-area:i}.y-st-n{grid-area:n}.y-st-do{grid-area:d}
  .y-st-bar{grid-area:b;height:8px}
  .y-st-v,.y-st-fc{display:none}
  .y-sq{grid-template-columns:minmax(0,1fr) 4.8em;grid-template-areas:'l l' 't v';gap:5px 10px}
  .y-sq-l{grid-area:l}.y-sq-t{grid-area:t}.y-sq-v{grid-area:v}
  .y-pjh{display:none}
  .y-pj{grid-template-columns:minmax(0,1fr) 6em;grid-template-areas:'n c' 'm s';gap:3px 10px}
  .y-pj-n{grid-area:n}.y-pj-c{grid-area:c}.y-pj-m{grid-area:m;text-align:left}.y-pj-s{grid-area:s}
  .y-mc{min-width:40px}
  .y-att{height:70px}
}
`;

/* ═══ WRITE ══════════════════════════════════════════════════════════════ */
await S.assemble({
  file: 'situation-yamuna.html',
  title: 'Delhi&rsquo;s Yamuna &mdash; Swechha',
  bands: BANDS, index: INDEX, sh, clashes,
  pageCss: PAGE_CSS,
  sectionFor: (id) => (B[id] || (() => '    <div class="wrap"><p class="lead">&mdash;</p></div>'))(),
  note: `9 bands + footer. Reading: dissolved oxygen 0.3 BDL against ${L.do.label}, `
      + `at ${atFloor.length} of ${stretch.length} Delhi stations. ${monthlyBdl.length} of `
      + `${monthlyMeasured} monthly readings below the detection limit.`,
});
