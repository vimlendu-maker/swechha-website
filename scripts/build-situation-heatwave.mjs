// AD-16 — situation-heatwave.html. EIGHT bands. PAN-INDIA. Rebuilt on client
// feedback: the first version was one Delhi grid point, and too wordy.
//
// ★ THREE THINGS CHANGED, AND EACH FOR A REASON WORTH KEEPING.
//
// 1. IT IS NATIONAL. Heat is the one situation on this site that is not a Delhi
//    story. NCRB's count is national; the hottest reading in the record is in
//    Jodhpur; the worst season on this list was Mumbai's. Fourteen grid points
//    across the desert, the plateau, the Gangetic plain, both coasts and one
//    hill station — each on IMD's threshold for ITS OWN zone, because the plains
//    rule would under-count every coastal city.
//
// 2. THE READING IS THE RECORD, NOT THE SEASON. The window is shut for eight
//    months of the year, and the first version spent three paragraphs
//    apologising for that. A record is true on every day of the year. So the
//    hero is the hottest reading in the archive, against IMD's severe
//    threshold — a real measured value against a published limit, relevant in
//    August as much as in May. The state chip still says OUT OF SEASON, once.
//
// 3. THE COPY IS CUT. Short sentences. The numbers carry it.
import * as S from './lib/situation-shell.mjs';
import { seo } from './lib/seo-register.mjs';
const { esc, n0, n1, compact, opener, tabs, hole, kd, KIND_LEGEND, ARROW, MON, MON3,
  stateChip, measureRow, measureHead, disclose, crumb, siblings } = S;

const sh = S.shell();

/* ═══ DATA ═══════════════════════════════════════════════════════════════ */
const HI = S.J('heat-india.json');
const DTH = S.J('deaths-ncrb-2024.json');
const BHU = S.J('bhuvan-heat.json');
const ATTN = S.J('attention-heatwave.json');
const NEWS = S.J('coverage-heatwave.json');

const C = HI.criteria;
const W = HI.window;
const NAT = HI.national;
const REC = NAT.hottest_on_record;
const ST = HI.stations;
const HEAT = DTH.per_situation.heatwave;
const CONS = NAT.consensus;

if (!ST.length) { console.error('No stations in heat-india.json. Refusing to build.'); sh.bad++; }

// The hero: the hottest reading in the archive, against IMD's absolute rule.
const overSevere = REC.tmax >= C.absolute_severe;
const readingOf = (s) => W.open ? (s.this_season || s.last_complete_season) : s.last_complete_season;
// 2024 is the record year at how many stations? Computed, never typed.
const recordYears = {};
for (const s of ST) recordYears[s.records.hottest_day.year] = (recordYears[s.records.hottest_day.year] || 0) + 1;
const topRecordYear = Object.entries(recordYears).sort((a, b) => b[1] - a[1])[0];

const fmtDate = (d) => {
  if (!d) return '—';
  const [y, m, dd] = String(d).split('-').map(Number);
  return `${dd} ${MON[m - 1]} ${y}`;
};
const dirWord = (c) => c.up > c.down ? 'up' : c.down > c.up ? 'down' : 'flat';

/* ═══ BAND SEQUENCE — id, tier class, ground hex ══════════════════════════ */
const BANDS = [
  ['top',      't1',        '#0D0D0B'],
  ['strip',    '',          '#151512'],
  ['people',   't2',        '#0D0D0B'],
  ['measured', 'paper t2',  '#F3F2F0'],
  ['cities',   'dark-2 t3', '#151512'],
  ['trend',    't2',        '#0D0D0B'],
  ['official', 'dark-2 t2', '#151512'],
  ['act',      't3',        '#0D0D0B'],
];
const clashes = S.groundChain(BANDS);

const INDEX = [
  ['The record', '#top'], ['Who it kills', '#people'],
  ['What counts as heat', '#measured'], ['Fourteen cities', '#cities'],
  ['What is rising', '#trend'], ['Who is watching', '#official'],
  ['What you can do', '#act'],
];

/* ═══ BANDS ══════════════════════════════════════════════════════════════ */
const B = {};

B.top = () => `    <div class="pic ht p2-pic">
      <img class="duo" src="/images/photos/ridge-road-dusk.jpg" alt="An empty road in heavy late-afternoon light" style="--op:50% 58%">
      <div class="pic-over"><div class="wrap">
        <h1 class="d1">India&rsquo;s heat</h1>
      </div></div>
    </div>
    <div class="pic-body"><div class="wrap p2-hero">
${crumb('heatwave')}
      <div class="p2-top">
        <p class="lbl p2-method">Every reading against its published limit. Every gap named.</p>
        <p style="margin:0"><span class="tag tag-season">${esc(W.label)}</span></p>
      </div>
      <div class="p2-cols">
      <div class="p2-read breach">
        <p class="state p2-state">${stateChip(S.cadence('heatwave'))}<span class="sr"> &mdash; the season is shut; this is the record</span></p>
        <p class="readout rl">${n1(REC.tmax)}<span class="h-deg">&deg;C</span></p>
        <p ${kd(HI.kind)}>the hottest reading in this record &middot; ${esc(REC.name)}, ${esc(esc(REC.state))} &middot; ${esc(fmtDate(REC.date))}</p>
        <p class="verdict bad">${overSevere ? 'Above IMD&rsquo;s severe threshold' : 'Above IMD&rsquo;s heat wave threshold'}</p>
        <p class="limit">IMD: <b>${C.absolute_hw}&deg;C</b> is a heat wave anywhere,
          <b>${C.absolute_severe}&deg;C</b> is severe. <b>Limit broken by ${n1(REC.tmax - C.absolute_severe)}&deg;C.</b></p>
        <p class="cap p2-src">${ST.length} grid points, ${HI.source.upstream}.
          <a class="lk" href="#measured">What counts as heat</a>.</p>
      </div>
      <div class="p2-nat">
        <p class="lbl p2-nat-h">The one that is coming, not the one that came</p>
        <p class="h-plain">Air kills more. The river is worse. <b>But heat is the only situation on
          this site whose death toll more than doubled in a single year</b> &mdash; and it is the one
          nobody can move away from, insulate against, or filter.</p>
        <p class="h-plain">A heatwave has no plume, no smell and no photograph. It leaves no damage
          to survey. It kills indoors, at night, in people who were already ill, and it is recorded
          as something else.</p>
        <p class="cap p-hole"><b>${topRecordYear[1]} of these ${ST.length} cities set their
          all-time record in ${topRecordYear[0]}.</b> Not spread across thirty-five years. One year.</p>
        <p style="margin:0"><a class="act" href="#cities">All ${ST.length} cities ${ARROW}</a></p>
      </div>
      </div>
      <p style="margin:0"><a class="act" href="#people">Who it kills ${ARROW}</a></p>
    </div></div>`;

B.strip = () => {
  const cells = [
    ['Deaths', n0(HEAT.deaths), `recorded, India, ${DTH.year}`, 'people', true],
    ['In one year', `+${n1(HEAT.change_pct)}%`, `on ${DTH.compare_year}`, 'people', true],
    ['Hottest', `${n1(REC.tmax)}&deg;`, `${esc(REC.name)}, ${REC.year}`, 'cities', true],
    ['Nights that never cool', `${CONS.warm_nights_28.up}/${ST.length}`, 'cities where they rose', 'trend', false],
  ];
  return `    <div class="wide p-strip-in">
      ${cells.map(([l, v, s, href, red]) => `<a class="p-cell" href="#${href}">
        <span class="p-cell-v${red ? ' is-red' : ''}">${v}</span>
        <span class="lbl p-cell-l">${l}</span><span class="cap p-cell-s">${s}</span></a>`).join('\n      ')}
      <p class="cap p-strip-note">One reading, one label. <a class="lk" href="#measured">What is behind them</a>.</p>
    </div>`;
};

/* WHO IT KILLS. The death toll doubled. That is the band. */
B.people = () => {
  const causes = DTH.causes.filter(c => c.y2024 > 0).sort((a, b) => b.y2024 - a.y2024);
  const maxC = Math.max(...causes.map(c => c.y2024));
  const rows = causes.map(c => {
    const isHeat = c.cause === 'Heat/Sun Stroke';
    const isOther = /other than above/i.test(c.cause);
    return measureRow({
      name: esc(c.cause) + (isHeat ? '<i>this page</i>' : isOther ? '<i>no cause recorded</i>' : ''),
      valuePct: c.y2024 / maxC * 100,
      value: n0(c.y2024),
      times: c.change_pct == null ? '' : `${c.change_pct > 0 ? '+' : ''}${n1(c.change_pct)}%`,
      mine: isHeat, over: isHeat,
      aria: `${c.cause}, ${c.y2024} recorded deaths in ${DTH.year}`,
    });
  }).join('\n        ');

  return `${opener('people', 'Who it kills', `${n0(HEAT.deaths)} people in ${DTH.year}. It was ${n0(HEAT.previous)} the year before.`)}
    <div class="wrap">
      <div class="h-two">
        <div class="h-two-c">
          <p class="num h-big is-red">${n0(HEAT.deaths)}</p>
          <p ${kd('counted')}>deaths recorded as heat or sunstroke, ${DTH.year}</p>
          <p class="cap">The second largest killer in India&rsquo;s national table of deaths from
            forces of nature, after lightning.</p>
        </div>
        <div class="h-two-c">
          <p class="num h-big is-red">+${n1(HEAT.change_pct)}<i>%</i></p>
          <p ${kd('counted')}>in one year</p>
          <p class="cap">The largest rise of any cause in the table. Heat&rsquo;s share of all such
            deaths went from ${n1(DTH.causes.find(c => c.cause === 'Heat/Sun Stroke').y2023 / DTH.total.y2023 * 100)}%
            to ${n1(HEAT.share_pct)}%.</p>
        </div>
      </div>
${KIND_LEGEND}
      <p class="h-note"><b>${esc(DTH.the_undercount.headline)}</b> Heat rarely reaches a death
        certificate. It kills through heart failure, kidney failure and stroke, in people who were
        already ill. <b>This number is a floor, not an estimate.</b></p>
      <p class="lbl h-lbl">Every death from a force of nature, India, ${DTH.year}</p>
      ${measureHead(['Cause', 'Recorded deaths', 'Deaths', `vs ${DTH.compare_year}`])}
      <div class="h-rows">
        ${rows}
      </div>
      <p class="cap h-cap"><b>Lightning kills more than everything else combined</b>
        &mdash; ${n0(DTH.causes.find(c => c.cause === 'Lightning').y2024)} deaths, and almost never a
        story. <b>And ${n0(DTH.causes.find(c => /other than above/i.test(c.cause)).y2024)} deaths
        (${DTH.causes.find(c => /other than above/i.test(c.cause)).pct}%) have no named cause at
        all.</b></p>
${hole('Nobody publishes heat-related hospital admissions, lost work or school days missed in India. Those are the numbers a city needs to plan with, and they do not exist publicly.')}
      <p style="margin:0"><a class="act" href="#measured">What counts as heat ${ARROW}</a></p>
    </div>`;
};

/* WHAT COUNTS AS HEAT. On paper. Three tabs, short. */
B.measured = () => `${opener('measured', 'What counts as heat', 'India does not define a heatwave by a temperature. It defines it by a distance from normal &mdash; and the temperature it starts from depends on where you are.')}
    <div class="wrap">
      ${tabs('What counts as heat', [
  ['The rule', `<div class="h-panel">
          <p>A day is a <b>heat wave</b> when the maximum clears its local floor
            <i>and</i> stands <b>${C.departure_hw}&deg;C above the normal</b> for that place and
            date. <b>${C.departure_severe}&deg;C</b> above makes it severe.</p>
          <div class="h-zones">
            ${Object.entries(C.zones).map(([k, z]) => `<div class="h-zone">
              <span class="h-zone-v">${z.base}&deg;C</span>
              <span class="lbl h-zone-l">${esc(z.label)}</span></div>`).join('\n            ')}
          </div>
          <p class="cap h-cap">The floor by zone. Applying the plains figure to Chennai would
            under-count every coastal city on this page.</p>
          <p>There is also an absolute rule, with no reference to normal:
            <b>${C.absolute_hw}&deg;C</b> anywhere is a heat wave, <b>${C.absolute_severe}&deg;C</b>
            is severe.</p>
          <p class="h-warn">So the same 41&deg;C afternoon is a heatwave in March and an ordinary day
            in June. <b>That is the point, not a loophole.</b> A body acclimatised to June heat is
            not the body that meets it in March.</p>
        </div>`],
  ['The normal', `<div class="h-panel">
          <p>A departure needs a normal. Each city gets its own, computed from
            <b>${esc(HI.normal.window)}</b>: for every calendar day, the mean maximum over a
            &plusmn;7-day window. About <b>450 samples</b> per day.</p>
          <p>${esc(HI.normal.why_per_station)}</p>
          <p class="h-warn"><b>Reproducible, not quoted.</b> Because the normal comes from the same
            archive as the readings, you can recompute every departure on this page from the source.
            It is not IMD&rsquo;s published departure and does not claim to be.</p>
        </div>`],
  ['What this is not', `<div class="h-panel">
          <p class="h-warn"><b>${esc(C.note)}</b></p>
          <p>So every figure here is <i>days meeting IMD&rsquo;s criteria at this location</i>, never
            <i>heatwave days declared by IMD</i>. Different quantities. The second is not ours to
            publish.</p>
          <p><b>And it is modelled.</b> ${esc(HI.kind_reason)}</p>
          <p><b>A grid point is not a city.</b> Fourteen grid points are not a country.</p>
        </div>`],
])}
      <p class="cap h-src-p"><b>Sources.</b> Criteria: ${esc(C.authority)}. Readings:
        <a class="lk" href="${esc(HI.source.url)}">${esc(HI.source.name)}</a>. Deaths:
        <a class="lk" href="${esc(DTH.source.url)}">${esc(DTH.source.publication)}</a>, ${esc(DTH.source.table)}.</p>
      <p style="margin:0"><a class="act" href="#cities">Fourteen cities ${ARROW}</a></p>
    </div>`;

/* FOURTEEN CITIES — the pan-India band. */
B.cities = () => {
  const maxRec = Math.max(...ST.map(s => s.records.hottest_day.tmax));
  const byRecord = [...ST].sort((a, b) => b.records.hottest_day.tmax - a.records.hottest_day.tmax);
  const rows = byRecord.map(s => {
    const r = s.records.hottest_day;
    const L = readingOf(s);
    const sev = r.tmax >= C.absolute_severe;
    return measureRow({
      name: `${esc(s.name)}<i>${esc(s.state)} &middot; ${esc(s.zone_label)}, floor ${s.base_threshold}&deg;C</i>`,
      valuePct: r.tmax / maxRec * 100,
      limitPct: C.absolute_severe / maxRec * 100,
      value: `${n1(r.tmax)}&deg;`,
      times: String(r.year),
      over: sev,
      aria: `${s.name}, record ${r.tmax} degrees in ${r.year}, ${L.heatwave_days} qualifying days last season`,
    });
  }).join('\n        ');
  return `${opener('cities', 'Fourteen cities', 'The desert, the plateau, the Gangetic plain, both coasts and one hill station. Each measured against the threshold for its own zone.')}
    <div class="wrap">
      <p class="h-lead">Sorted by the hottest reading each city has recorded since
        ${HI.normal.window.split('-')[0]}. The tick marks IMD&rsquo;s severe threshold,
        ${C.absolute_severe}&deg;C.</p>
      ${measureHead(['City', `Hottest on record, against ${C.absolute_severe}&deg;C`, 'Peak', 'Year'])}
      <div class="h-rows">
        ${rows}
      </div>
      <p class="cap h-cap"><b>${topRecordYear[1]} of ${ST.length} set their record in
        ${topRecordYear[0]}.</b> ${NAT.stations_omitted?.length
      ? `${NAT.stations_omitted.length} requested station(s) did not answer and are omitted, not backfilled.`
      : 'All requested stations answered.'}</p>
      ${disclose('Last season, city by city',
    `<div class="h-tbl">
            <div class="h-tr is-head"><span class="lbl">City</span><span class="lbl">Days</span>
              <span class="lbl">Severe</span><span class="lbl">Peak</span><span class="lbl">Felt</span>
              <span class="lbl">Warm nights</span></div>
            ${[...ST].sort((a, b) => readingOf(b).heatwave_days - readingOf(a).heatwave_days).map(s => {
      const L = readingOf(s);
      return `<div class="h-tr"><span class="h-td-y">${esc(s.name)}</span>
              <span>${L.heatwave_days}</span><span>${L.severe_days}</span>
              <span>${n1(L.peak_tmax)}</span><span>${L.peak_apparent == null ? '—' : n1(L.peak_apparent)}</span>
              <span>${L.warm_nights_28}</span></div>`;
    }).join('\n            ')}
          </div>
          <p class="cap h-cap"><b>${esc(NAT.total_days_note)}</b> ${NAT.total_days_this_reading}
            station-days across ${ST.length} cities, ${NAT.reading_of}.</p>`)}
      <p style="margin:0"><a class="act" href="#trend">What is rising ${ARROW}</a></p>
    </div>`;
};

/* WHAT IS RISING. The consensus across stations, and the honest finding. */
B.trend = () => {
  const labels = {
    heatwave_days: 'Days meeting the criteria',
    peak_tmax: 'Hottest afternoon',
    peak_apparent: 'Hottest afternoon, felt',
    apparent_over_45: 'Days that felt over 45&deg;C',
    warm_nights_28: 'Nights that never fell below 28&deg;C',
  };
  const rows = Object.entries(CONS).map(([k, c]) => {
    const w = dirWord(c);
    const total = c.up + c.down + c.flat;
    return `<div class="h-cons${w === 'up' ? ' is-up' : w === 'down' ? ' is-down' : ''}">
          <span class="h-cons-n">${labels[k] || k}</span>
          <span class="h-cons-b" role="img" aria-label="up at ${c.up} cities, down at ${c.down}, flat at ${c.flat}">
            <i class="is-up" style="--w:${c.up / total * 100}%"></i><i class="is-flat" style="--w:${c.flat / total * 100}%"></i><i class="is-down" style="--w:${c.down / total * 100}%"></i></span>
          <span class="h-cons-v">${c.up}<i>&uarr;</i></span>
          <span class="h-cons-x">${c.down}<i>&darr;</i></span></div>`;
  }).join('\n        ');

  const mm = ATTN.months.filter(m => !m.partial);
  const peakV = Math.max(...mm.map(m => m.views));
  const bars = mm.slice(-36).map(m => {
    const h = Math.max(1, Math.round(m.views / peakV * 100));
    const mo = Number(m.month.slice(4, 6));
    return `<i class="h-ab${m.views === ATTN.peak.views ? ' is-peak' : ''}${mo >= 3 && mo <= 7 ? ' is-season' : ''}" style="--h:${h}%" title="${MON3[mo - 1]} ${m.month.slice(0, 4)}: ${n0(m.views)} views"></i>`;
  }).join('');

  return `${opener('trend', 'What is rising', 'Not the afternoons. The nights.')}
    <div class="wrap">
      <p class="h-lead">Five measures, the first eighteen seasons against the last, counted across
        all ${ST.length} cities. <b>The pale bar is cities where it rose</b>, the grey where it did
        not move, the dark where it fell.</p>
      <div class="h-conss">
        ${rows}
      </div>
      <p class="h-note"><b>${esc(HI.honesty.headline)}</b> ${esc(HI.honesty.reading)}</p>
      <p class="cap h-cap"><b>Counted as cities, not averaged.</b>
        ${esc(NAT.consensus_note)}</p>
      ${disclose('Why the afternoons are the wrong thing to watch',
    `<ol class="h-ol">
            ${HI.honesty.what_it_does_not_mean.map(x => `<li>${esc(x)}</li>`).join('\n            ')}
          </ol>`)}
      <p class="lbl h-lbl">And who is looking</p>
      <div class="h-att" role="img" aria-label="Monthly attention over three years, peaking at ${n0(ATTN.peak.views)} views">${bars}</div>
      <p class="cap h-cap">Lighter bars are months inside the season. Peak
        <b>${n0(ATTN.peak.views)}</b> in ${esc(monthName(ATTN.peak.month))}, floor
        <b>${n0(ATTN.floor.views)}</b> in ${esc(monthName(ATTN.floor.month))} &mdash;
        <b>${ATTN.swing}&times;</b>. <b>Attention peaks with the season and is gone by August.
        NCRB publishes the death count the following year, when nobody is looking.</b></p>
      <p class="cap h-reg-i">${n0(NEWS.register.count)} items from
        ${n0(Object.keys(NEWS.register.publishers || {}).length)} publishers.
        Reporting is tagged as reporting; no figure here came from a headline.</p>
      ${disclose(`Read the ${n0(Math.min(40, NEWS.register.count || 0))} most recent items`,
      `<ol class="p-news-ol h-reg">
            ${(NEWS.register.items || []).slice(0, 40).map(i => `<li class="p-news-r"><a class="p-news-o" href="${esc(i.link)}">${esc(i.title)}</a><span class="cap p-news-m">${esc(i.publisher || 'unattributed')}${i.published ? ` &middot; ${esc(shortDate(i.published))}` : ''}</span></li>`).join('\n            ')}
          </ol>
          <p class="cap h-pub"><b>Publishers:</b> ${Object.entries(NEWS.register.publishers || {}).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${esc(k)} (${v})`).join(' &middot; ')}</p>`)}
      <p style="margin:0"><a class="act" href="#official">Who is watching ${ARROW}</a></p>
    </div>`;
};

/* WHO IS WATCHING. Bhuvan, linked and never scraped.
   NO MONEY BAND, AND NO NOTE ABOUT NOT HAVING ONE. Client ruling: the money
   section belongs only where it is applicable, and Air and Yamuna are the two
   that have it clearly — both rest on primary documents (NCAP fund tables, the
   Namami Gange reply). Heat preparedness has no single audited national figure
   this build could attach.
   An earlier pass named that as a hole here. That was the wrong instinct
   applied in the wrong place: naming a hole is content when the hole is IN THE
   MEASUREMENT the page is about — a missing forest mask, an uncountable
   cloudburst. A paragraph explaining the absence of a band this page never
   promised is not a named hole, it is an apology, and it raises a question the
   page then declines to answer. Removed. */
B.official = () => {
  const cov = BHU.coverage;
  const years = Object.entries(cov.by_year || {});
  const maxY = Math.max(...years.map(([, n]) => n));
  return `${opener('official', 'Who is watching', 'India runs a daily satellite heat outlook. Its layer list makes the same argument this page does.')}
    <div class="wrap">
      <div class="h-layers">
        ${BHU.layers.map(l => `<div class="h-layer${/theta/.test(l.value) ? ' is-moist' : ''}">
          <span class="h-layer-n">${esc(l.label)}${/theta/.test(l.value) ? '<i class="h-layer-t">includes humidity</i>' : ''}</span>
          <span class="cap h-layer-x">${esc(l.note)}</span></div>`).join('\n        ')}
      </div>
      <p class="h-note"><b>${esc(BHU.the_argument.headline)}</b> Two of its four layers add moisture.
        Two express the answer as a departure from normal. That is the official instrument agreeing,
        in its design, with the two things this page had to compute for itself.</p>
      <p class="lbl h-lbl">What it covers, read from its own index</p>
      <div class="h-cov">
        ${years.map(([y, n]) => `<div class="h-cov-c">
          <span class="h-cov-v">${n}</span><span class="h-cov-b"><i style="--h:${Math.round(n / maxY * 100)}%"></i></span>
          <span class="cap h-cov-y">${y}</span></div>`).join('\n        ')}
      </div>
      <p class="cap h-cap"><b>${n0(cov.dates_count)} days, ${esc(cov.first)} to ${esc(cov.last)}.</b>
        Read from the application&rsquo;s date index, not described &mdash; a portal that stopped
        publishing and one that is current look identical from outside. This one is current.
        <b>It serves map images, so no reading on this page comes from it.</b></p>
      <p class="cap h-src-p"><b>Source.</b>
        <a class="lk" href="${esc(BHU.source.url)}">${esc(BHU.source.name)} &mdash; ${esc(BHU.source.application)}</a>.</p>
      <p style="margin:0"><a class="act" href="#act">What you can do ${ARROW}</a></p>
    </div>`;
};

B.act = () => `${opener('act', 'What you can do', 'Heat kills the people who cannot leave it.')}
    <div class="wrap">
      <div class="p-act">
        <div class="p-act-c">
          <p class="lbl">The season starts 1 March</p>
          <p>Not May, when the headlines arrive. Construction and delivery workers, street vendors,
            anyone whose room does not cool at night &mdash; they are exposed from the first week.</p>
          <p style="margin:0"><a class="act" href="${esc(BHU.source.url)}">India&rsquo;s heat outlook ${ARROW}</a></p>
        </div>
        <div class="p-act-c">
          <p class="lbl">Ask for the plan</p>
          <p>Cities write Heat Action Plans. Ask if yours has one, whether it names shaded spaces and
            water points near your ward, and whether outdoor workers were consulted. A plan nobody
            can find is not a plan.</p>
          <p style="margin:0"><a class="act" href="/work">What we work on ${ARROW}</a></p>
        </div>
        <div class="p-act-c">
          <p class="lbl">Shade is infrastructure</p>
          <p>A tree over a bus stop does more for a waiting body than any advisory. It is the one
            place a heat page and a forest page meet.</p>
          <p style="margin:0"><a class="act" href="/act">Support the work ${ARROW}</a></p>
        </div>
      </div>
      <p class="cap h-close">Every figure here is public, dated and reproducible from the source
        named beside it &mdash; including the ones that do not support the argument.</p>
${S.closing('heatwave')}
${siblings('heatwave')}
${S.newsletter('heatwave')}
    </div>`;

/* ═══ HELPERS ════════════════════════════════════════════════════════════ */
function monthName(m) { return `${MON3[Number(String(m).slice(4, 6)) - 1]} ${String(m).slice(0, 4)}`; }
function shortDate(s) {
  const m = /(\d{1,2})\s+(\w{3})\w*\s+(\d{4})/.exec(String(s));
  return m ? `${m[1]} ${m[2]} ${m[3]}` : String(s).slice(0, 16);
}

/* ═══ PAGE CSS — layout only ═════════════════════════════════════════════ */
const PAGE_CSS = `
/* ══ AD-16 — THE HEAT PAGE'S OWN BLOCK ════════════════════════════════════
   Tokens, chrome, tabs, disclosure and measure row all inherited. Every
   component states its colour for its own ground rather than inheriting.
   ═══════════════════════════════════════════════════════════════════════ */
.h-deg{font-size:.34em;vertical-align:.52em;color:var(--fg-3);font-weight:500;margin-left:.04em}
.h-plain{font-size:clamp(15px,1.05vw,17px);line-height:1.6;color:var(--fg-2);max-width:46ch;margin:0 0 .7em}
.h-lead{font-size:clamp(16px,1.15vw,18.5px);line-height:1.55;max-width:60ch;margin:0 0 1.1em;color:var(--fg-2)}
.paper .h-lead{color:var(--ink-2)}
.h-note{border-left:2px solid var(--hair);padding:2px 0 2px 16px;margin:clamp(20px,2.2vw,30px) 0;
  font-size:clamp(15px,1.05vw,17px);line-height:1.58;color:var(--fg-2);max-width:60ch}
.paper .h-note{border-left-color:var(--rule-2);color:var(--ink-2)}
.h-cap{color:var(--fg-3);max-width:60ch;margin:.8em 0 0}
.paper .h-cap{color:var(--ink-3)}
.h-lbl{display:block;color:var(--fg-3);margin:clamp(22px,2.4vw,32px) 0 .6em}
.paper .h-lbl{color:var(--ink-3)}
.h-big{font-size:clamp(40px,4.6vw,64px);line-height:.94;margin:0 0 .16em;font-variant-numeric:tabular-nums}
.h-big i{font-size:.4em;font-style:normal}
.h-src-p{max-width:62ch;color:var(--fg-3);margin:clamp(18px,2vw,26px) 0 clamp(20px,2.2vw,28px)}
.paper .h-src-p{color:var(--ink-3)}
.h-close{max-width:60ch;color:var(--fg-3);margin:clamp(22px,2.4vw,32px) 0 0}
.h-two{display:grid;grid-template-columns:1fr;gap:clamp(18px,2vw,30px)}
.h-two-c{border-top:2px solid var(--hair);padding-top:14px}
.h-two-c .cap{color:var(--fg-3);max-width:44ch}
.h-rows{margin:0 0 2px}
.is-red{color:var(--red)}
.paper .is-red{color:var(--red-ink)}

/* ON PAPER: the definition panels. */
.h-panel{max-width:64ch}
.h-panel>p{font-size:clamp(14.5px,1vw,16.5px);line-height:1.58;color:var(--ink-2);margin:0 0 .85em}
.h-warn{border-left:2px solid var(--rule-2);padding-left:14px}
.h-ol{margin:.2em 0 .4em;padding-left:1.3em}
.h-ol li{font-size:clamp(13.5px,.95vw,15px);line-height:1.52;color:var(--fg-2);margin:0 0 .5em}
.paper .h-ol li{color:var(--ink-2)}

/* THE THREE ZONE FLOORS. */
.h-zones{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--rule);margin:.4em 0 .3em}
.h-zone{background:var(--paper);padding:11px 12px;text-align:center}
.h-zone-v{display:block;font-size:clamp(20px,1.9vw,28px);line-height:1;color:var(--ink);font-variant-numeric:tabular-nums}
.h-zone-l{display:block;font-size:10px;color:var(--ink-3);margin-top:4px}

/* THE CONSENSUS BARS. A three-part stack: rose / flat / fell, across cities.
   No hue is spent — direction is carried by position and by the count beside
   it, because "more cities got hotter" is not a broken limit. */
.h-conss{margin:.2em 0 .2em}
.h-cons{display:grid;grid-template-columns:minmax(0,1fr) minmax(90px,1.1fr) 3.2em 3.2em;
  gap:0 clamp(7px,.9vw,13px);align-items:center;padding:10px 0;border-bottom:1px solid var(--hair-2)}
.h-cons-n{font-size:clamp(13px,.93vw,15px);color:var(--fg)}
.h-cons-b{display:flex;height:10px;background:var(--hair-2);overflow:hidden}
.h-cons-b>i{display:block;width:var(--w);height:100%}
.h-cons-b>i.is-up{background:var(--fg)}
.h-cons-b>i.is-flat{background:var(--fg-3)}
.h-cons-b>i.is-down{background:var(--hair)}
.h-cons-v,.h-cons-x{font-variant-numeric:tabular-nums;text-align:right;font-size:clamp(13px,.95vw,15px)}
.h-cons-v{color:var(--fg)}
.h-cons-x{color:var(--fg-3)}
.h-cons-v i,.h-cons-x i{font-style:normal;font-size:.72em;margin-left:.15em}

/* THE CITY TABLE, inside the disclosure. */
.h-tbl{margin:.2em 0 0}
.h-tr{display:grid;grid-template-columns:minmax(0,1.5fr) repeat(5,minmax(0,1fr));gap:0 6px;
  align-items:baseline;padding:8px 0;border-bottom:1px solid var(--hair-2);font-variant-numeric:tabular-nums}
.h-tr.is-head{border-bottom:1px solid var(--hair)}
.h-tr.is-head .lbl{font-size:9.5px;color:var(--fg-3)}
.h-tr>span{font-size:12px;color:var(--fg-2);text-align:right}
.h-tr>span:first-child{text-align:left}
.h-td-y{color:var(--fg)!important}

/* ATTENTION. */
.h-att{display:flex;align-items:flex-end;gap:2px;height:86px;margin:.3em 0 .2em}
.h-ab{flex:1 1 0;min-width:2px;height:var(--h);background:var(--fg-3);border-radius:1px 1px 0 0}
.h-ab.is-season{background:var(--fg-2)}
.h-ab.is-peak{background:var(--mustard)}
.h-reg-i,.h-pub{max-width:62ch;color:var(--fg-3)}
.h-reg{margin:.5em 0 .4em}

/* BHUVAN'S LAYERS AND COVERAGE. */
.h-layers{display:grid;grid-template-columns:1fr;gap:1px;background:var(--hair-2)}
.h-layer{background:var(--ground-2);padding:11px 13px}
.h-layer-n{display:block;font-size:clamp(13px,.93vw,15px);color:var(--fg)}
.h-layer-x{display:block;color:var(--fg-3);margin-top:2px}
/* Marked without a hue: mustard means a human act, and highlighting two rows of
   a source's layer list is not one. It also lightened the ground toward the
   caption ink and measured 3.91:1. A rule and a label cost neither. */
.h-layer.is-moist{box-shadow:inset 2px 0 0 var(--fg-2)}
.h-layer-t{display:block;font-size:9.5px;font-style:normal;letter-spacing:.06em;
  text-transform:uppercase;color:var(--fg-3);margin-top:3px}
.h-cov{display:grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:clamp(5px,.8vw,10px);align-items:end}
.h-cov-c{display:grid;grid-template-rows:auto 62px auto;justify-items:center;gap:4px}
.h-cov-v{font-size:12px;font-variant-numeric:tabular-nums;color:var(--fg-2)}
.h-cov-b{display:flex;align-items:flex-end;width:100%;height:62px}
.h-cov-b>i{display:block;width:100%;height:var(--h);background:var(--fg-3)}
.h-cov-y{color:var(--fg-3)}

@media (min-width:760px){
  .h-two{grid-template-columns:1fr 1fr}
  .h-layers{grid-template-columns:1fr 1fr}
}
@media (max-width:639px){
  .h-cons{grid-template-columns:minmax(0,1fr) 3em 3em;grid-template-areas:'n v x' 'b b b';gap:5px 8px}
  .h-cons-n{grid-area:n}.h-cons-v{grid-area:v}.h-cons-x{grid-area:x}.h-cons-b{grid-area:b}
  .h-tr{grid-template-columns:minmax(0,1.4fr) repeat(3,minmax(0,1fr));font-size:11.5px}
  .h-tr>span:nth-child(5),.h-tr>span:nth-child(6){display:none}
  .h-tr.is-head .lbl:nth-child(5),.h-tr.is-head .lbl:nth-child(6){display:none}
  .h-att{height:72px}
}
`;

/* ═══ WRITE ══════════════════════════════════════════════════════════════ */
/* THE TITLE COMES FROM data/seo/pages.json now, not a literal here —
   see scripts/build-farm-page.mjs and scripts/build-situation-air.mjs for
   the same pattern. This generator used to keep its own copy; it happened
   to already agree with the register, but a second copy that merely agrees
   today is drift waiting to happen, which is exactly why the register
   exists (spec section 3.1). */
const TITLE = seo('/now/heat').title;

await S.assemble({
  file: 'situation-heatwave.html',
  title: TITLE,
  bands: BANDS, index: INDEX, sh, clashes,
  pageCss: PAGE_CSS, script: S.NEWSLETTER_JS,
  sectionFor: (id) => (B[id] || (() => '    <div class="wrap"><p class="lead">&mdash;</p></div>'))(),
  note: `8 bands + footer. PAN-INDIA, ${ST.length} stations. Window ${W.open ? 'OPEN' : 'SHUT'}, `
      + `state = ${W.open ? 'PERIODIC' : 'OUT OF SEASON'}. Hero: ${REC.tmax}C at ${REC.name} `
      + `(${REC.date}) against IMD severe ${C.absolute_severe}C. Deaths ${HEAT.deaths} `
      + `(+${HEAT.change_pct}%). Warm nights up at ${CONS.warm_nights_28.up}/${ST.length} cities.`,
});
