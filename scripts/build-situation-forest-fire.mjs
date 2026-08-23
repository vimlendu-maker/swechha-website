// AD-16 — situation-forest-fire.html. EIGHT bands, real data, nothing invented.
// Shell, tokens, tab component and write gates from scripts/lib/situation-shell.mjs.
//
// ★ THIS IS THE ONE SITUATION WITH NO PUBLISHED LIMIT.
// Every other page on this site reads a number against a threshold somebody
// notified. No statute publishes a permitted number of forest fires or a
// permitted area burnt. So the limit line says "No legal threshold." — the
// frozen wording for exactly this case — and the page has to earn its authority
// some other way. It does it by publishing the DISAGREEMENT BETWEEN
// INSTRUMENTS, which is a harder and more honest thing than a breach.
//
// ★ AND IT REFUSES TO CALL A DETECTION A FIRE.
// FIRMS counts thermal anomalies. Over India in March that is canopy, wheat
// residue, sugarcane trash, brick kilns and rubbish. Calling the count "forest
// fires" would be the identical error to calling a computed AQI "CPCB's AQI",
// which D-15.8 already forbids. FSI's burnt-area mapping IS forest-specific, so
// the page leads on that and uses the detections for what they are good at:
// showing how much the answer depends on which satellite you ask.
import * as S from './lib/situation-shell.mjs';
const { esc, n0, n1, compact, opener, tabs, hole, kd, KIND_LEGEND, ARROW, MON3,
  stateChip, measureRow, measureHead, disclose, crumb, siblings } = S;

const sh = S.shell();

/* ═══ DATA ═══════════════════════════════════════════════════════════════ */
const FF = S.J('forest-fire-india.json');
const ISFR = S.J('forest-isfr-2023.json');
const GFW = S.J('gfw-india.json');
const DTH = S.J('deaths-ncrb-2024.json');
const NEWS = S.J('coverage-forest-fire.json');

const FIRE = ISFR.fire;
const BURNT = FIRE.burnt_area;
const PRONE = FIRE.prone_classes;
const SER = FF.series;
const XS = FF.cross_sensor;
const FIRE_DEATHS = DTH.per_situation.forest_fire;
const COVER = ISFR.cover.rows.find(r => r.class === 'Forest Cover');

const good = SER.years.filter(y => y.ok);
if (!good.length) { console.error('No usable FIRMS series. Refusing to build.'); sh.bad++; }
const maxDet = Math.max(...good.map(y => y.count));
// Every sensor that answered, for the cross-sensor device.
const sensors = Object.values(XS.sensors).filter(s => s.ok);
const maxSensor = sensors.length ? Math.max(...sensors.map(s => s.count)) : 0;

// The comparison the whole page turns on: an area, against the area that exists.
const burntShare = +(BURNT.total / PRONE.total * 100).toFixed(2);

/* ═══ BAND SEQUENCE — id, tier class, ground hex ══════════════════════════ */
const BANDS = [
  ['top',      't1',        '#0D0D0B'],
  ['strip',    '',          '#151512'],
  ['people',   't2',        '#0D0D0B'],
  ['measured', 'paper t2',  '#F3F2F0'],
  ['seasons',  'dark-2 t3', '#151512'],
  ['cover',    't2',        '#0D0D0B'],
  ['said',     'dark-2 t2', '#151512'],
  ['act',      't3',        '#0D0D0B'],
];
const clashes = S.groundChain(BANDS);

const INDEX = [
  ['The reading', '#top'], ['What it costs', '#people'],
  ['What a fire even is', '#measured'], ['Fourteen seasons', '#seasons'],
  ['And the forest itself', '#cover'], ['What is being said', '#said'],
  ['What you can do', '#act'],
];

/* ═══ BANDS ══════════════════════════════════════════════════════════════ */
const B = {};

B.top = () => `    <div class="pic ht p2-pic">
      <img class="duo" src="/images/photos/uttarakhand-fire-scar-2016.jpg" alt="Hillside vegetation destroyed by fire in Uttarakhand" style="--op:50% 55%">
      <div class="pic-over"><div class="wrap">
        <h1 class="d1">India&rsquo;s forest fires</h1>
      </div></div>
    </div>
    <div class="pic-body"><div class="wrap p2-hero">
${crumb('fire')}
      <div class="p2-top">
        <p class="lbl p2-method">Every reading against its published limit. Every gap named.</p>
        <p style="margin:0"><span class="tag tag-season">${esc(FF.season.label)}</span></p>
      </div>
      <div class="p2-cols">
      <div class="p2-read breach">
        <p class="state p2-state">${stateChip('PERIODIC')}<span class="sr"> &mdash; an annual assessment, not a feed</span></p>
        <p class="readout rl">${n0(Math.round(BURNT.total))}<span class="f-u">km&sup2;</span></p>
        <p ${kd('counted')}>burnt in one fire season &middot; ${esc(BURNT.season)}</p>
        <p class="verdict bad">${burntShare}% of India&rsquo;s forest and scrub</p>
        <p class="limit"><b>No legal threshold.</b> ${esc(FF.limit.why)}</p>
        <p class="cap p2-src">${esc(ISFR.source.name)}, ${esc(BURNT.table)}.
          <a class="lk" href="#measured">What a fire even is</a>.</p>
      </div>
      <div class="p2-nat">
        <p class="lbl p2-nat-h">What that area is, in things you know</p>
        <p class="f-plain">${n0(Math.round(BURNT.total))} square kilometres is a little over
          <b>twenty-three times the area of Delhi</b>, burnt in a single season between November and
          June. It is not a satellite alert count. It is an <b>area</b>, mapped afterwards from
          Landsat imagery by India&rsquo;s own Forest Survey.</p>
        <p class="f-plain">And it is measured against a country where
          <b>${n1(PRONE.top_three_pct)}%</b> of the forest and scrub is already classed as highly,
          very highly or extremely fire prone &mdash; ${n0(PRONE.rows[0].area + PRONE.rows[1].area + PRONE.rows[2].area)}
          square kilometres of it.</p>
        <p class="cap"><b>Nobody publishes a count of forest fires in India.</b> What is published
          is an area burnt, and separately how many hot pixels three different satellites saw. Those
          are three different numbers, and none of them is the number of fires.</p>
        <p style="margin:0"><a class="act" href="#measured">Why not ${ARROW}</a></p>
      </div>
      </div>
      <p style="margin:0"><a class="act" href="#people">What it costs ${ARROW}</a></p>
    </div></div>`;

B.strip = () => {
  const cells = [
    ['Burnt in a season', `${compact(Math.round(BURNT.total))}`, 'km&sup2;, 2023&ndash;24', 'top', true],
    ['Fire prone', `${n1(PRONE.top_three_pct)}%`, 'of forest and scrub', 'measured', true],
    ['Recorded deaths', n0(FIRE_DEATHS.deaths), `India, ${DTH.year}`, 'people', false],
    ['Tree cover lost', `${GFW.total.loss_mha}M`, `hectares, ${GFW.total.from}&ndash;${GFW.total.to}`, 'cover', true],
  ];
  return `    <div class="wide p-strip-in">
      ${cells.map(([l, v, s, href, red]) => `<a class="p-cell" href="#${href}">
        <span class="p-cell-v${red ? ' is-red' : ''}">${v}</span>
        <span class="lbl p-cell-l">${l}</span><span class="cap p-cell-s">${s}</span></a>`).join('\n      ')}
      <p class="cap p-strip-note">One reading, one label. <a class="lk" href="#measured">What is behind them</a>.</p>
    </div>`;
};

/* WHAT IT COSTS. The mismatch band: a two-figure death count against a
   five-figure burnt area. Both numbers are interpolated from the data rather
   than typed — the first version of this lead said "six", which went stale the
   moment the page moved from NCRB's 2023 edition to its 2024 one. */
B.people = () => `${opener('people', 'What it costs', `${n0(FIRE_DEATHS.deaths)} people are recorded as having died in a forest fire in India, in a period the country mapped ${n0(Math.round(BURNT.total))} square kilometres of burnt forest. Both figures are official.`)}
    <div class="wrap">
      <div class="f-two">
        <div class="f-two-c">
          <p class="num f-big">${n0(FIRE_DEATHS.deaths)}</p>
          <p ${kd('counted')}>deaths recorded as forest fire, India, ${DTH.year}</p>
          <p class="cap">Up from ${n0(FIRE_DEATHS.previous)} the year before, but still the
            smallest named cause but one in India&rsquo;s whole table of deaths from forces of
            nature. Avalanche killed ${n0(DTH.causes.find(c => c.cause === 'Avalanche').y2024)}.</p>
        </div>
        <div class="f-two-c">
          <p class="num f-big is-red">${n0(Math.round(BURNT.total))}<i>km&sup2;</i></p>
          <p ${kd('counted')}>of forest burnt in the same window</p>
          <p class="cap">${esc(BURNT.season)}. Mapped from satellite imagery by the Forest Survey of
            India, state by state.</p>
        </div>
      </div>
${KIND_LEGEND}
      <p class="f-note"><b>The two numbers are not in conflict, and the gap between them is the
        point.</b> ${esc(DTH.the_mismatch.forest_fire_vs_burnt_area.reading)}</p>
      <p class="cap f-cap"><b>The periods differ and the page says so.</b> NCRB counts a calendar
        year; FSI&rsquo;s fire season runs November to June. Any comparison between them is
        approximate, which is why it is drawn as a comparison of magnitudes and never as a rate.</p>
      <p class="lbl f-lbl">Where it burnt, ${esc(BURNT.season)}</p>
      ${measureHead(['State', 'Area burnt', 'km&sup2;', ''])}
      <div class="f-rows">
        ${BURNT.top.map(t => measureRow({
  name: esc(t.state),
  valuePct: t.km2 / BURNT.top[0].km2 * 100,
  value: n0(Math.round(t.km2)),
  times: '',
  over: true,
  aria: `${t.state}, ${t.km2} square kilometres burnt`,
})).join('\n        ')}
      </div>
      <p class="cap f-cap">The six worst states account for
        ${n0(Math.round(BURNT.top.reduce((a, t) => a + t.km2, 0)))} km&sup2; of the
        ${n0(Math.round(BURNT.total))} km&sup2; total. <b>Delhi burnt ${BURNT.zero.includes('Delhi') ? 'nothing at all' : 'very little'}</b>
        &mdash; which is why this is the one situation on this site that is not about Delhi.</p>
${hole('There is no published count of people displaced, livelihoods lost or livestock killed by forest fire in India. A forest fire here mostly does not kill people directly — it removes what the people nearby live on, and no national table counts that.')}
      <p style="margin:0"><a class="act" href="#measured">What a fire even is ${ARROW}</a></p>
    </div>`;

/* WHAT A FIRE EVEN IS. On paper. The cross-sensor device lives here. */
B.measured = () => {
  const sensorRows = sensors.map(s => measureRow({
    name: `${esc(s.label)}<i>${esc(s.pixel)} pixel &middot; ${esc(s.platform)}</i>`,
    valuePct: maxSensor ? s.count / maxSensor * 100 : 2,
    value: n0(s.count),
    times: '',
    aria: `${s.label}, ${s.count} detections in the same five days`,
  })).join('\n        ');
  const failed = Object.values(XS.sensors).filter(s => !s.ok);

  return `${opener('measured', 'What a fire even is', 'Three satellites looked at the same five days over the same country and returned three different numbers. Almost every fire figure in circulation depends on which one was asked, and almost none of them says.')}
    <div class="wrap">
      ${tabs('What a fire even is', [
    ['Three satellites, five days', `<div class="f-panel">
          <p>The same box, the same ${XS.window.days} days to ${esc(XS.window.to)}, three instruments:</p>
          <div class="f-sens">
        ${sensorRows}
          </div>
          <p class="f-warn"><b>${esc(XS.rule)}</b> ${esc(XS.device)}</p>
          ${failed.length ? `<p class="cap f-cap">${failed.length} sensor(s) did not answer and are recorded as null rather than zero: ${failed.map(f => esc(f.label)).join(', ')}.</p>` : ''}
          <p class="cap f-cap">${FF.season.open
      ? 'The season is open, so these are in-season counts.'
      : '<b>The season is shut.</b> A low count here is the calendar, not an absence of risk — and it is exactly the condition under which a failed request and a true zero look identical. That is why the header of every response is validated and a failure is stored as null.'}</p>
        </div>`],
    ['Detection is not fire', `<div class="f-panel">
          <p class="f-def-h">What FIRMS actually measures</p>
          <p>A pixel hot enough to register in the infrared. Over India in March that is forest
            canopy, wheat and sugarcane residue, brick kilns, gas flares and rubbish fires
            &mdash; <b>and the satellite cannot tell them apart</b>.</p>
          <p>One fire can produce several detections on one pass and none on the next. A fire the
            size of a football pitch is invisible to a 1&nbsp;km MODIS pixel and obvious to a
            375&nbsp;m VIIRS one. So a detection count is a measure of <b>what was visible to that
            instrument on those overpasses</b>, and nothing more.</p>
          <p class="f-warn"><b>A detection is not a fire.</b> ${esc(FF.not)}</p>
        </div>`],
    ['Burnt area is different', `<div class="f-panel">
          <p class="f-def-h">And this is why it leads the page</p>
          <p>${esc(BURNT.why_it_outranks_a_detection_count)}</p>
          <p>So the hero figure on this page is an <b>area</b> from India&rsquo;s own Forest Survey,
            not a count from a satellite feed. The detections are kept for the one thing they are
            uniquely good at: showing how unstable any single fire number is.</p>
          <p class="f-warn"><b>What FSI has that nobody else does.</b> It runs India&rsquo;s forest fire
            alert system, and in the ${esc(FIRE.alerts.season)} season it sent
            <b>${esc(FIRE.alerts.sms_alerts_as_published)}</b> SMS alerts &mdash;
            ${n0(FIRE.alerts.sms_alerts_disseminated)} messages &mdash; to
            ${n0(FIRE.alerts.subscribers_2023_24)} subscribers, up from
            ${n0(FIRE.alerts.subscribers_2020_21)} three seasons earlier.
            ${esc(FIRE.alerts.note)}</p>
        </div>`],
    ['How much can burn', `<div class="f-panel">
          <p class="f-def-h">${esc(PRONE.table)}</p>
          <div class="f-prone">
            ${PRONE.rows.map((r, i) => `<div class="f-prone-r${i < 3 ? ' is-hot' : ''}">
              <span class="f-prone-n">${esc(r.class)}</span>
              <span class="f-prone-b"><i style="--w:${Math.round(r.pct)}%"></i></span>
              <span class="f-prone-v">${n1(r.pct)}%</span>
              <span class="cap f-prone-a">${n0(Math.round(r.area))} km&sup2;</span></div>`).join('\n            ')}
          </div>
          <p class="cap f-cap"><b>${n1(PRONE.top_three_pct)}% of India&rsquo;s forest cover and scrub
            sits in the top three classes.</b> ${esc(PRONE.top_three_note)} The total assessed is
            ${n0(Math.round(PRONE.total))} km&sup2;.</p>
        </div>`],
  ])}
      <p class="cap f-src-p"><b>Sources.</b> Burnt area and fire-prone classes:
        <a class="lk" href="${esc(ISFR.source.url)}">${esc(ISFR.source.publication)}</a>.
        Detections: <a class="lk" href="${esc(FF.source.url)}">${esc(FF.source.name)}</a>,
        ${esc(SER.sensor.id)}. Deaths:
        <a class="lk" href="${esc(DTH.source.url)}">${esc(DTH.source.publication)}</a>.</p>
      <p style="margin:0"><a class="act" href="#seasons">Fourteen seasons ${ARROW}</a></p>
    </div>`;
};

/* FOURTEEN SEASONS — the fixed-window sample. */
B.seasons = () => {
  const bars = good.map(y => {
    const h = Math.max(2, Math.round(y.count / maxDet * 100));
    const isPeak = y.year === SER.peak.year;
    const isFloor = y.year === SER.floor.year;
    return `<div class="f-yy-c${isPeak ? ' is-peak' : ''}${isFloor ? ' is-floor' : ''}">
          <span class="f-yy-v">${Math.round(y.count / 1000)}k</span>
          <span class="f-yy-b"><i style="--h:${h}%"></i></span>
          <span class="cap f-yy-y">${String(y.year).slice(2)}</span></div>`;
  }).join('\n        ');
  const H = SER.halves;
  return `${opener('seasons', 'Fourteen seasons', `The same ten days of March, every year from ${good[0].year} to ${good[good.length - 1].year}, on one satellite. Comparable by construction, and a sample rather than a season.`)}
    <div class="wrap">
      <p class="f-lead">${esc(FF.method.why_fixed)}</p>
      <div class="f-yy">
        ${bars}
      </div>
      <p class="cap f-cap">Detections in ${esc(SER.window.label)}, ${esc(SER.sensor.label)}
        (${esc(SER.sensor.processing)}). Peak <b>${n0(SER.peak.count)} in ${SER.peak.year}</b>,
        floor <b>${n0(SER.floor.count)} in ${SER.floor.year}</b> &mdash; a spread of
        <b>${SER.ratio}&times;</b> between two years, on the same instrument in the same ten days.</p>
      ${H && H[0] && H[1] ? `<p class="f-note"><b>And across the whole period it is close to flat.</b>
        ${H[0].from}&ndash;${H[0].to} averaged <b>${n0(H[0].mean)}</b> detections in the window;
        ${H[1].from}&ndash;${H[1].to} averaged <b>${n0(H[1].mean)}</b>. The year-to-year swing is far
        larger than any drift between the halves, which is what you would expect from something
        driven by how dry a particular March happened to be.</p>` : ''}
      <p class="cap p-hole"><b>${esc(FF.method.caveat)}</b> ${esc(FF.method.one_sensor)}</p>
      ${disclose('Every window, and why the series runs on one sensor',
    `<div class="f-tbl">
            <div class="f-tr is-head"><span class="lbl">Season</span><span class="lbl">Detections</span>
              <span class="lbl">Days</span><span class="lbl">Total FRP</span><span class="lbl">Peak FRP</span></div>
            ${good.slice().reverse().map(y => `<div class="f-tr"><span class="f-td-y">${y.year}</span>
              <span>${n0(y.count)}</span><span>${y.days}</span>
              <span>${n0(Math.round(y.frp_sum))}</span><span>${n1(y.frp_max)}</span></div>`).join('\n            ')}
          </div>
          <p class="cap f-cap">FRP is fire radiative power in megawatts &mdash; roughly, how hard the
            fires were burning, as opposed to how many were seen. It is published because a season
            with fewer, fiercer fires and one with many small ones give the same detection count.</p>
          <p class="cap f-cap">${esc(FF.method.one_sensor)}</p>`)}
      <p style="margin:0"><a class="act" href="#cover">And the forest itself ${ARROW}</a></p>
    </div>`;
};

/* AND THE FOREST ITSELF — what the fire is happening to. */
B.cover = () => {
  const yrs = GFW.years;
  const maxL = Math.max(...yrs.map(y => y.loss_ha));
  const bars = yrs.map(y => {
    const h = Math.max(2, Math.round(y.loss_ha / maxL * 100));
    const isPeak = y.year === GFW.peak.year;
    return `<i class="f-lb${isPeak ? ' is-peak' : ''}" style="--h:${h}%" title="${y.year}: ${n0(y.loss_ha)} hectares"></i>`;
  }).join('');
  const G = GFW.halves;
  return `${opener('cover', 'And the forest itself', 'Fire is one way a forest disappears. This is the measurement of the disappearing, and it has roughly doubled.')}
    <div class="wrap">
      <div class="f-two">
        <div class="f-two-c">
          <p class="num f-big is-red">${GFW.total.loss_mha}<i>M ha</i></p>
          <p ${kd('counted')}>of tree cover lost, ${GFW.total.from}&ndash;${GFW.total.to}</p>
          <p class="cap">${n0(GFW.total.loss_km2)} km&sup2;, measured from Landsat at
            ${GFW.threshold.value}% canopy density. That is roughly
            <b>${n1(GFW.total.loss_km2 / COVER.area * 100)}% of India&rsquo;s recorded forest
            cover</b>, over twenty-five years.</p>
        </div>
        <div class="f-two-c">
          <p class="num f-big is-red">${GFW.planted_split?.outside_pct ?? '&mdash;'}<i>%</i></p>
          <p ${kd('counted')}>of that loss was <b>not</b> in a planted forest</p>
          <p class="cap">${esc(GFW.planted_split?.reading || '')} On this measurement the objection
            does not hold: nearly all of it is outside plantations.</p>
        </div>
      </div>
      <p class="lbl f-lbl">Tree cover lost per year, ${GFW.total.from}&ndash;${GFW.total.to}</p>
      <div class="f-loss" role="img" aria-label="Annual tree cover loss, peaking at ${n0(GFW.peak.loss_ha)} hectares in ${GFW.peak.year}">${bars}</div>
      ${G && G[0] && G[1] ? `<p class="f-note"><b>It has roughly doubled.</b>
        ${G[0].from}&ndash;${G[0].to} lost an average of <b>${n0(G[0].mean_ha)}</b> hectares a year.
        ${G[1].from}&ndash;${G[1].to} lost <b>${n0(G[1].mean_ha)}</b> &mdash;
        <b>${n1(G[1].mean_ha / G[0].mean_ha)}&times;</b> as much. The worst single year is
        ${GFW.peak.year}, at ${n0(GFW.peak.loss_ha)} hectares.</p>` : ''}
      <p class="cap f-cap"><b>Of the whole total, ${GFW.primary_forest?.share_of_all_loss_pct ?? '&mdash;'}%
        was primary forest</b> &mdash; ${GFW.primary_forest?.total_mha ?? '&mdash;'} million hectares of
        ${esc(GFW.primary_forest?.what_it_is || 'mature natural forest')}.</p>
      <p class="f-note"><b>And India&rsquo;s own report says forest cover went up.</b> Over its last two
        assessments the Forest Survey of India recorded a net national <b>increase of
        ${n1(ISFR.change_2021_to_2023.net_change_forest_cover)} km&sup2;</b>. Both figures are
        official, both are honest, and they measure different things. That argument has its own
        page.</p>
      <p style="margin:0"><a class="act" href="/now/forest-loss">Forest loss, in full ${ARROW}</a></p>
      <p class="cap f-cap"><b>Tree cover loss is not deforestation.</b> ${esc(GFW.caveats[0])}</p>
      <p class="cap"><b>Tree cover loss is not attributed to fire.</b> Loss is counted
        for any cause and the dataset does not say why. Separating fire-driven loss from felling,
        storm and harvest needs an attribution layer this build does not have &mdash; so the two
        measurements sit side by side and no arrow is drawn between them.</p>
      <p style="margin:0"><a class="act" href="#said">What is being said ${ARROW}</a></p>
    </div>`;
};

/* WHAT IS BEING SAID. No attention series exists for this subject and the page
   says so rather than substituting a proxy about something else. */
B.said = () => `${opener('said', 'What is being said', 'The register, and one measurement this page could not make.')}
    <div class="wrap">
      <p class="f-lead">${n0(NEWS.register.count)} items from
        ${n0(Object.keys(NEWS.register.publishers || {}).length)} publishers.
        <b>Reporting is tagged as reporting.</b> A headline is evidence that something was said,
        never that it is true.</p>
      ${disclose(`Read the ${n0(Math.min(40, NEWS.register.count || 0))} most recent items`,
  `<ol class="p-news-ol f-reg">
            ${(NEWS.register.items || []).slice(0, 40).map(i => `<li class="p-news-r"><a class="p-news-o" href="${esc(i.link)}">${esc(i.title)}</a><span class="cap p-news-m">${esc(i.publisher || 'unattributed')}${i.published ? ` &middot; ${esc(shortDate(i.published))}` : ''}</span></li>`).join('\n            ')}
          </ol>
          <p class="cap f-pub"><b>Publishers in the sample:</b> ${Object.entries(NEWS.register.publishers || {}).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${esc(k)} (${v})`).join(' &middot; ')}</p>`)}
      <p class="f-note"><b>The other four situations on this site carry an attention series &mdash;
        how much the public looks the subject up, month by month. This one does not, and the reason
        is worth stating.</b> There is no English Wikipedia article about forest fires in India with
        enough traffic to plot. The nearest candidate is the global
        <i>Wildfire</i> article, whose peaks are Californian and Australian. Plotting it here would
        produce a convincing line about somebody else&rsquo;s fire season.</p>
      <p class="cap p-hole">So the band is short, and that is the honest version. Naming the hole is
        content; filling it with a proxy about another continent would not be.</p>
      <p style="margin:0"><a class="act" href="#act">What you can do ${ARROW}</a></p>
    </div>`;

/* NO MONEY CARD. The earlier version asked the reader to chase state fire
   budgets — a question this page cannot answer and had no business raising.
   Client ruling: money belongs only where it is applicable, which on this site
   means Air and Yamuna, the two with primary documents behind the figures. The
   card is replaced by one the page can stand behind completely, because it is
   made of what the page already proved. */
B.act = () => `${opener('act', 'What you can do', 'Almost every forest fire in India is lit. That makes this a page about people, not weather.')}
    <div class="wrap">
      <div class="p-act">
        <div class="p-act-c">
          <p class="lbl">Subscribe to the alerts</p>
          <p>FSI&rsquo;s alert service is free and open to anyone, down to beat level where the state
            has shared boundaries. ${n0(FIRE.alerts.subscribers_2023_24)} people already use it.
            If you live near forest, you are the fastest detector there is.</p>
          <p style="margin:0"><a class="act" href="${esc(FIRE.alerts.portal)}">FSI forest fire alerts ${ARROW}</a></p>
        </div>
        <div class="p-act-c">
          <p class="lbl">Ask which number you are being given</p>
          <p>Any fire figure quoted at you is one of three things: <b>satellite detections</b>,
            <b>alerts sent</b>, or <b>area burnt</b> &mdash; and almost no report says which, or
            which satellite. The three answers differ by an order of magnitude.
            <b>Asking is free, and it is the whole argument of this page.</b></p>
          <p style="margin:0"><a class="act" href="#measured">The three, side by side ${ARROW}</a></p>
        </div>
        <div class="p-act-c">
          <p class="lbl">Plant where it matters</p>
          <p>A ${n1(PRONE.top_three_pct)}%-fire-prone country does not need more monoculture on dry
            slopes. Swechha&rsquo;s nursery grows native species for the places people actually
            live and walk.</p>
          <p style="margin:0"><a class="act" href="/#give">Support the work ${ARROW}</a></p>
        </div>
      </div>
      <p class="cap f-close">Every figure on this page is public, dated and linked.</p>
${siblings('fire')}
    </div>`;

/* ═══ HELPERS ════════════════════════════════════════════════════════════ */
function shortDate(s) {
  const m = /(\d{1,2})\s+(\w{3})\w*\s+(\d{4})/.exec(String(s));
  return m ? `${m[1]} ${m[2]} ${m[3]}` : String(s).slice(0, 16);
}

/* ═══ PAGE CSS — layout only ═════════════════════════════════════════════ */
const PAGE_CSS = `
/* ══ AD-16 — THE FOREST FIRE PAGE'S OWN BLOCK ═════════════════════════════
   Tokens, chrome, tabs, disclosure and measure row all inherited. Every
   component states its colour for its own ground rather than inheriting.
   ═══════════════════════════════════════════════════════════════════════ */
.f-u{font-size:.3em;vertical-align:.62em;color:var(--fg-3);font-weight:500;margin-left:.08em}
.f-plain{font-size:clamp(15px,1.05vw,17px);line-height:1.62;color:var(--fg-2);max-width:46ch;margin:0 0 .7em}
.f-lead{font-size:clamp(16px,1.15vw,18.5px);line-height:1.58;max-width:62ch;margin:0 0 1.1em;color:var(--fg-2)}
.paper .f-lead{color:var(--ink-2)}
.f-note{border-left:2px solid var(--hair);padding:2px 0 2px 16px;margin:clamp(20px,2.2vw,30px) 0;
  font-size:clamp(15px,1.05vw,17px);line-height:1.6;color:var(--fg-2);max-width:62ch}
.paper .f-note{border-left-color:var(--rule-2);color:var(--ink-2)}
.f-cap{color:var(--fg-3);max-width:62ch;margin:.8em 0 0}
.paper .f-cap{color:var(--ink-3)}
.f-lbl{display:block;color:var(--fg-3);margin:clamp(22px,2.4vw,32px) 0 .6em}
.paper .f-lbl{color:var(--ink-3)}
.f-big{font-size:clamp(38px,4.4vw,60px);line-height:.95;margin:0 0 .16em;font-variant-numeric:tabular-nums}
.f-big i{font-size:.34em;font-style:normal;letter-spacing:.03em;color:var(--fg-3);margin-left:.22em}
.f-src-p{max-width:62ch;color:var(--fg-3);margin:clamp(18px,2vw,26px) 0 clamp(20px,2.2vw,28px)}
.paper .f-src-p{color:var(--ink-3)}
.f-close{max-width:62ch;color:var(--fg-3);margin:clamp(22px,2.4vw,32px) 0 0}
.f-two{display:grid;grid-template-columns:1fr;gap:clamp(18px,2vw,30px)}
.f-two-c{border-top:2px solid var(--hair);padding-top:14px}
.f-two-c .cap{color:var(--fg-3);max-width:48ch}
.f-rows,.f-sens{margin:0 0 2px}
.is-red{color:var(--red)}
.paper .is-red{color:var(--red-ink)}

/* ON PAPER: the definition panels. */
.f-panel{max-width:70ch}
.f-panel>p{font-size:clamp(14.5px,1vw,16.5px);line-height:1.6;color:var(--ink-2);margin:0 0 .85em}
.f-def-h{font-size:clamp(15px,1.1vw,17.5px);color:var(--ink);margin:0 0 .6em}
.f-warn{border-left:2px solid var(--rule-2);padding-left:14px}

/* THE FIRE-PRONE LADDER. A quantity, so weight and ink — the top three classes
   take red because "extremely fire prone" is a published classification, not a
   value this page chose. */
.f-prone{margin:.3em 0 .2em}
.f-prone-r{display:grid;grid-template-columns:minmax(0,10em) minmax(60px,1fr) 3.4em 5.4em;
  gap:0 clamp(7px,.9vw,13px);align-items:center;padding:9px 0;border-bottom:1px solid var(--rule)}
.f-prone-n{font-size:clamp(12.5px,.9vw,14px);color:var(--ink)}
.f-prone-b{display:block;height:8px;background:var(--rule)}
.f-prone-b>i{display:block;height:100%;width:var(--w);background:var(--ink-2)}
.f-prone-r.is-hot .f-prone-b>i{background:var(--red-ink)}
.f-prone-v,.f-prone-a{font-variant-numeric:tabular-nums;text-align:right}
.f-prone-v{font-size:12.5px;color:var(--ink)}
.f-prone-a{font-size:10.5px;color:var(--ink-3)}

/* THE FOURTEEN-SEASON COLUMNS. */
.f-yy{display:grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:clamp(3px,.5vw,6px);
  align-items:end;margin:.4em 0 .2em}
.f-yy-c{display:grid;grid-template-rows:auto 96px auto;justify-items:center;gap:4px}
.f-yy-v{font-size:10.5px;font-variant-numeric:tabular-nums;color:var(--fg-3)}
.f-yy-b{display:flex;align-items:flex-end;width:100%;height:96px}
.f-yy-b>i{display:block;width:100%;height:var(--h);background:var(--fg-3)}
.f-yy-c.is-peak .f-yy-v{color:var(--fg)}
.f-yy-c.is-peak .f-yy-b>i{background:var(--red)}
.f-yy-c.is-floor .f-yy-b>i{background:var(--fg-2)}
.f-yy-y{color:var(--fg-3);font-variant-numeric:tabular-nums}

/* ANNUAL LOSS BARS. */
.f-loss{display:flex;align-items:flex-end;gap:2px;height:92px;margin:.3em 0 .2em}
.f-lb{flex:1 1 0;min-width:2px;height:var(--h);background:var(--fg-3);border-radius:1px 1px 0 0}
.f-lb.is-peak{background:var(--red)}

/* THE FULL WINDOW TABLE. */
.f-tbl{margin:.2em 0 0}
.f-tr{display:grid;grid-template-columns:3.6em repeat(4,minmax(0,1fr));gap:0 7px;align-items:baseline;
  padding:8px 0;border-bottom:1px solid var(--hair-2);font-variant-numeric:tabular-nums}
.f-tr.is-head{border-bottom:1px solid var(--hair)}
.f-tr.is-head .lbl{font-size:9.5px;color:var(--fg-3)}
.f-tr>span{font-size:12px;color:var(--fg-2);text-align:right}
.f-tr>span:first-child{text-align:left}
.f-td-y{color:var(--fg)!important}
.f-reg{margin:.5em 0 .4em}
.f-pub{max-width:62ch;color:var(--fg-3)}

@media (min-width:760px){ .f-two{grid-template-columns:1fr 1fr} }
@media (max-width:639px){
  .f-prone-r{grid-template-columns:minmax(0,1fr) 3.2em;grid-template-areas:'n v' 'b b' 'a a';gap:4px 8px}
  .f-prone-n{grid-area:n}.f-prone-v{grid-area:v}.f-prone-b{grid-area:b}
  .f-prone-a{grid-area:a;text-align:left}
  .f-yy-c{grid-template-rows:auto 76px auto}
  .f-yy-b{height:76px}
  .f-yy-v{font-size:9px}
  .f-tr{grid-template-columns:3.4em repeat(2,minmax(0,1fr));font-size:11.5px}
  .f-tr>span:nth-child(4),.f-tr>span:nth-child(5){display:none}
  .f-tr.is-head .lbl:nth-child(4),.f-tr.is-head .lbl:nth-child(5){display:none}
  .f-loss{height:74px}
}
`;

/* ═══ WRITE ══════════════════════════════════════════════════════════════ */
await S.assemble({
  file: 'situation-forest-fire.html',
  title: 'India&rsquo;s forest fires &mdash; Swechha',
  bands: BANDS, index: INDEX, sh, clashes,
  pageCss: PAGE_CSS,
  sectionFor: (id) => (B[id] || (() => '    <div class="wrap"><p class="lead">&mdash;</p></div>'))(),
  note: `8 bands + footer. Reading: ${BURNT.total} km2 burnt (${burntShare}% of forest and scrub), `
      + `no legal threshold. Cross-sensor: ${sensors.map(s => `${s.label} ${s.count}`).join(', ')}. `
      + `Tree cover loss ${GFW.total.loss_mha} Mha, ${GFW.planted_split?.outside_pct}% outside plantations.`,
});
