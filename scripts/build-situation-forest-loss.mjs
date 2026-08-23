// AD-16 — situation-forest-loss.html. EIGHT bands.
//
// ★ THIS PAGE IS A DISAGREEMENT BETWEEN TWO OFFICIAL SOURCES, AND THAT IS THE
// DESIGN. India's own Forest Survey reports forest cover INCREASING — a net
// +156.41 km2 across its last two assessments. The Hansen/UMD satellite series
// reports 2.43 million hectares of tree cover LOST since 2001. Both are honest.
// They measure different things, and the gap is more informative than either
// number alone. Template §3: two sources that disagree are published as two
// sources and never averaged.
//
// ★ AND THE SATELLITE SOURCE ARRIVED LATE, WHICH IS ON THE PAGE.
// AD-16 §2.3 recorded it as unavailable: the documented GFW API needs a key
// this build would not create. The client pointed at globalnaturewatch.org,
// whose network layer turned out to reach the same datasets through a keyless
// proxy. So the page carries the figure AND the caveat that it came through a
// web client's proxy rather than a documented contract.
import * as S from './lib/situation-shell.mjs';
const { esc, n0, n1, compact, opener, tabs, hole, kd, KIND_LEGEND, ARROW,
  stateChip, measureRow, measureHead, disclose, crumb, siblings } = S;

const sh = S.shell();

/* ═══ DATA ═══════════════════════════════════════════════════════════════ */
const GFW = S.J('gfw-india.json');
const ISFR = S.J('forest-isfr-2023.json');
const FL = S.J('forest-loss-india.json');   // FAO/World Bank series + the legal instrument
const NEWS = S.J('coverage-forest-loss.json');
const ATTN = S.J('attention-forest-loss.json');

const CH = ISFR.change_2021_to_2023;
const COVER = ISFR.cover.rows.find(r => r.class === 'Forest Cover');
const TREE = ISFR.cover.rows.find(r => r.class === 'Tree Cover');
const GEO = ISFR.cover.rows.find(r => r.class === 'Geographical Area');
const LAW = FL.limit;
const WB = FL.sources.b_international;
const PLANT = GFW.planted_split;
const PRIM = GFW.primary_forest;
const G = GFW.halves;

if (!GFW.years?.length) { console.error('No GFW series. Refusing to build.'); sh.bad++; }

// The two headline numbers, in one unit, so a reader can hold them together.
const lossKm2 = GFW.total.loss_km2;
const gainKm2 = CH.net_change_forest_cover;
const lossShareOfCover = +(lossKm2 / COVER.area * 100).toFixed(1);
const netVsWorstState = +(CH.losses[0].km2 / gainKm2).toFixed(1);
const doubling = (G && G[0] && G[1]) ? +(G[1].mean_ha / G[0].mean_ha).toFixed(1) : null;

/* ═══ BAND SEQUENCE — id, tier class, ground hex ══════════════════════════ */
const BANDS = [
  ['top',      't1',        '#0D0D0B'],
  ['strip',    '',          '#151512'],
  ['split',    't2',        '#0D0D0B'],
  ['measured', 'paper t2',  '#F3F2F0'],
  ['years',    'dark-2 t3', '#151512'],
  ['states',   't2',        '#0D0D0B'],
  ['law',      'dark-2 t2', '#151512'],
  ['act',      't3',        '#0D0D0B'],
];
const clashes = S.groundChain(BANDS);

const INDEX = [
  ['The reading', '#top'], ['Two sources', '#split'],
  ['What each one measures', '#measured'], ['Twenty-five years', '#years'],
  ['Where it went', '#states'], ['What the law says', '#law'],
  ['What you can do', '#act'],
];

/* ═══ BANDS ══════════════════════════════════════════════════════════════ */
const B = {};

B.top = () => `    <div class="pic ht p2-pic">
      <img class="duo" src="/images/photos/pine-forest-path.jpg" alt="A path through even-aged pine forest" style="--op:50% 45%">
      <div class="pic-over"><div class="wrap">
        <h1 class="d1">India&rsquo;s forest loss</h1>
      </div></div>
    </div>
    <div class="pic-body"><div class="wrap p2-hero">
${crumb('loss')}
      <div class="p2-top">
        <p class="lbl p2-method">Every reading against its published limit. Every gap named.</p>
        <p style="margin:0"><span class="tag tag-season">Year round</span></p>
      </div>
      <div class="p2-cols">
      <div class="p2-read breach">
        <p class="state p2-state">${stateChip('PERIODIC')}<span class="sr"> &mdash; annual satellite series, biennial official report</span></p>
        <p class="readout rl">${GFW.total.loss_mha}<span class="l-u">M ha</span></p>
        <p ${kd(GFW.kind)}>tree cover lost, ${GFW.total.from}&ndash;${GFW.total.to} &middot; ${n0(lossKm2)} km&sup2;</p>
        <p class="verdict bad">${lossShareOfCover}% of India&rsquo;s recorded forest cover</p>
        <p class="limit">The Forest (Conservation) Act, 1980 caps <b>who may decide</b>, not how
          much. <b>There is no permitted quantity.</b></p>
        <p class="cap p2-src">Hansen / UMD, at ${GFW.threshold.value}% canopy density.
          <a class="lk" href="#measured">What each one measures</a>.</p>
      </div>
      <div class="p2-nat">
        <p class="lbl p2-nat-h">And India&rsquo;s own report says it went up</p>
        <p class="l-plain">Over its last two assessments the Forest Survey of India recorded a net
          national <b>increase of ${n1(gainKm2)} km&sup2;</b>.</p>
        <p class="l-plain"><b>Both figures are official. Neither is wrong.</b> They measure different
          things &mdash; and the difference between them is the most useful thing on this page.</p>
        <p class="cap p-hole"><b>One number survives either definition.</b> That national net gain of
          ${n1(gainKm2)} km&sup2; is <b>${netVsWorstState} times smaller</b> than the loss in
          ${esc(CH.losses[0].state)} alone, which the same report puts at
          ${n1(CH.losses[0].km2)} km&sup2;. Both figures are in one table.</p>
        <p style="margin:0"><a class="act" href="#split">Put them side by side ${ARROW}</a></p>
      </div>
      </div>
      <p style="margin:0"><a class="act" href="#split">Two sources ${ARROW}</a></p>
    </div></div>`;

B.strip = () => {
  const cells = [
    ['Satellite says', `&minus;${n0(lossKm2)}`, `km&sup2; lost, ${GFW.total.from}&ndash;${GFW.total.to}`, 'years', true],
    ['India&rsquo;s report says', `+${n1(gainKm2)}`, 'km&sup2;, last two assessments', 'split', false],
    ['Outside plantations', `${PLANT?.outside_pct ?? '—'}%`, 'of the measured loss', 'measured', true],
    ['Loss has', `${doubling ?? '—'}&times;`, 'doubled since 2013', 'years', true],
  ];
  return `    <div class="wide p-strip-in">
      ${cells.map(([l, v, s, href, red]) => `<a class="p-cell" href="#${href}">
        <span class="p-cell-v${red ? ' is-red' : ''}">${v}</span>
        <span class="lbl p-cell-l">${l}</span><span class="cap p-cell-s">${s}</span></a>`).join('\n      ')}
      <p class="cap p-strip-note">One reading, one label. <a class="lk" href="#measured">What is behind them</a>.</p>
    </div>`;
};

/* TWO SOURCES. The core device: three sources, and two of them are the same one. */
B.split = () => `${opener('split', 'Two sources', 'Three, in fact &mdash; and two of them are not independent, which matters more than the disagreement.')}
    <div class="wrap">
      <div class="l-srcs">
        <div class="l-src">
          <p class="lbl l-src-t">A &middot; India&rsquo;s own assessment</p>
          <p class="num l-src-n">+${n1(gainKm2)}<i>km&sup2;</i></p>
          <p class="cap l-src-x"><b>${esc(ISFR.source.name)}</b>, ${esc(ISFR.source.publication)}.
            Satellite imagery classified by canopy density, every two years. This is the number the
            Government of India reports to FAO.</p>
        </div>
        <div class="l-src">
          <p class="lbl l-src-t">B &middot; the international series</p>
          <p class="num l-src-n">${WB.ok ? `+${n0(Math.round(WB.change_km2 / 100) * 100)}` : '—'}<i>km&sup2;</i></p>
          <p class="cap l-src-x"><b>FAO, via the World Bank.</b>
            ${WB.ok ? `Forest area ${n0(Math.round(WB.first.km2))} km&sup2; in ${WB.first.year} to
            ${n0(Math.round(WB.last.km2))} km&sup2; in ${WB.last.year}.` : 'unavailable'}
            <b class="l-warn-i">Not an independent check:</b> FAO republishes what each country
            reports, and for India that is source A.</p>
        </div>
        <div class="l-src is-c">
          <p class="lbl l-src-t">C &middot; the satellite measurement</p>
          <p class="num l-src-n is-red">&minus;${n0(lossKm2)}<i>km&sup2;</i></p>
          <p class="cap l-src-x"><b>Hansen / University of Maryland</b>, published by Global Forest
            Watch. Canopy change measured from Landsat, every year. <b>This is the one that
            disagrees</b>, and it is the only one not derived from what the government reports about
            itself.</p>
        </div>
      </div>
${KIND_LEGEND}
      <p class="l-note"><b>Two sources agreeing is not corroboration when one is the other&rsquo;s
        input.</b> A and B move together because B is built from A. So the honest reading of this
        page is not &ldquo;two against one&rdquo; &mdash; it is <b>one administrative measurement and
        one independent one</b>, and they point in opposite directions.</p>
      <p class="cap l-cap"><b>How source C was obtained, stated plainly.</b>
        ${esc(GFW.source.obtained_via.why)} ${esc(GFW.source.obtained_via.honesty)}</p>
      <p style="margin:0"><a class="act" href="#measured">What each one measures ${ARROW}</a></p>
    </div>`;

/* WHAT EACH ONE MEASURES. On paper. The definition is the whole argument. */
B.measured = () => `${opener('measured', 'What each one measures', 'A plantation is forest cover. A harvested plantation is tree cover loss. Both statements are true, and that is the entire disagreement.')}
    <div class="wrap">
      ${tabs('What each one measures', [
  ['Forest cover', `<div class="l-panel">
          <p class="l-def-h">India&rsquo;s definition</p>
          <p><b>${esc(ISFR.cover.definitions.forest_cover)}</b></p>
          <p>${esc(ISFR.cover.definitions.why_it_matters)}</p>
          <div class="l-cover">
            ${ISFR.cover.rows.filter(r => ['Forest Cover', 'Tree Cover', 'Scrub'].includes(r.class))
      .map(r => `<div class="l-cover-r">
              <span class="l-cover-n">${esc(r.class)}</span>
              <span class="l-cover-b"><i style="--w:${Math.round(r.pct_geographical / 25.17 * 100)}%"></i></span>
              <span class="l-cover-v">${n1(r.pct_geographical)}%</span>
              <span class="cap l-cover-a">${n0(Math.round(r.area))} km&sup2;</span></div>`).join('\n            ')}
          </div>
          <p class="cap l-cap">Of India&rsquo;s ${n0(Math.round(GEO.area))} km&sup2;,
            <b>${n1(COVER.pct_geographical)}%</b> is forest cover and
            <b>${n1(TREE.pct_geographical)}%</b> is tree cover outside it. ${esc(ISFR.cover.table)}.</p>
        </div>`],
  ['Tree cover loss', `<div class="l-panel">
          <p class="l-def-h">The satellite&rsquo;s definition</p>
          <p>Canopy disappearing, whatever it was and for whatever reason &mdash; felling, fire,
            storm, disease, harvest. <b>It does not say why, and it is not net change:</b> gain is a
            separate measurement on a different method and the two are not subtracted here.</p>
          <p class="l-warn"><b>The threshold changes the answer, so it is printed everywhere.</b>
            Loss is counted above <b>${GFW.threshold.value}% canopy density in 2000</b>, which is
            GFW&rsquo;s own headline choice. ${esc(GFW.threshold.why)}</p>
          <div class="l-thr">
            ${(GFW.threshold.ladder || []).map(t => `<div class="l-thr-r${t.threshold === GFW.threshold.value ? ' is-used' : ''}">
              <span class="l-thr-n">${t.threshold}%</span>
              <span class="l-thr-b"><i style="--w:${Math.round(t.total_ha / GFW.threshold.ladder[0].total_ha * 100)}%"></i></span>
              <span class="l-thr-v">${(t.total_ha / 1e6).toFixed(2)}M ha</span></div>`).join('\n            ')}
          </div>
          <p class="cap l-cap"><b>These are nested, not separate.</b> ${esc(GFW.threshold.semantics)}
            ${esc(GFW.threshold.the_trap)}</p>
        </div>`],
  ['Why they differ', `<div class="l-panel">
          <p class="l-def-h">Same ground, two answers</p>
          <p>A natural forest replaced by a plantation of the same canopy density is
            <b>no change</b> to forest cover and <b>a loss and a gain</b> to the satellite. Neither
            number is wrong.</p>
          <p class="l-warn"><b>So is the satellite series just counting plantation harvests?</b>
            No. <b>${PLANT?.outside_pct ?? '—'}% of the measured loss was outside any planted
            forest</b> &mdash; ${n0(PLANT?.outside_planted_ha ?? 0)} hectares of
            ${n0((PLANT?.outside_planted_ha ?? 0) + (PLANT?.in_planted_ha ?? 0))}. That objection is
            the commonest one made about this dataset, and on the dataset&rsquo;s own fields it does
            not hold.</p>
          <div class="l-pl">
            ${(PLANT?.rows || []).slice(0, 6).map(r => `<div class="l-pl-r">
              <span class="l-pl-n">${esc(r.type)}</span>
              <span class="l-pl-v">${n0(r.loss_ha)}<i>ha</i></span></div>`).join('\n            ')}
          </div>
          <p class="cap l-cap"><b>And ${PRIM?.share_of_all_loss_pct ?? '—'}% of it was primary
            forest</b> &mdash; ${PRIM?.total_mha ?? '—'} million hectares of
            ${esc(PRIM?.what_it_is || 'mature natural forest')}.</p>
        </div>`],
])}
      <p class="cap l-src-p"><b>Sources.</b>
        <a class="lk" href="${esc(ISFR.source.url)}">${esc(ISFR.source.publication)}</a> ·
        Hansen / UMD via <a class="lk" href="https://globalnaturewatch.org/map/country/IND/">Global Nature Watch</a>,
        dataset <code>${esc(GFW.source.dataset)}</code>.</p>
      <p style="margin:0"><a class="act" href="#years">Twenty-five years ${ARROW}</a></p>
    </div>`;

/* TWENTY-FIVE YEARS. The annual series and the doubling. */
B.years = () => {
  const yrs = GFW.years;
  const maxL = Math.max(...yrs.map(y => y.loss_ha));
  const primByYear = Object.fromEntries((PRIM?.years || []).map(y => [y.year, y.loss_ha]));
  const bars = yrs.map(y => {
    const h = Math.max(2, Math.round(y.loss_ha / maxL * 100));
    const p = primByYear[y.year] || 0;
    const ph = Math.round(p / maxL * 100);
    const isPeak = y.year === GFW.peak.year;
    return `<div class="l-yy-c${isPeak ? ' is-peak' : ''}">
          <span class="l-yy-b"><i class="l-yy-all" style="--h:${h}%"></i><i class="l-yy-pri" style="--h:${ph}%"></i></span>
          <span class="cap l-yy-y">${String(y.year).slice(2)}</span></div>`;
  }).join('\n        ');
  return `${opener('years', 'Twenty-five years', `${GFW.total.loss_mha} million hectares, one year at a time. It has roughly doubled.`)}
    <div class="wrap">
      <div class="l-yy" role="img" aria-label="Annual tree cover loss ${GFW.total.from} to ${GFW.total.to}, peaking at ${n0(GFW.peak.loss_ha)} hectares in ${GFW.peak.year}">
        ${bars}
      </div>
      <p class="cap l-key"><i class="l-k-all"></i> all tree cover loss &nbsp;
        <i class="l-k-pri"></i> the part that was primary forest</p>
      ${G && G[0] && G[1] ? `<p class="l-note"><b>${G[0].from}&ndash;${G[0].to} lost an average of
        ${n0(G[0].mean_ha)} hectares a year. ${G[1].from}&ndash;${G[1].to} lost
        ${n0(G[1].mean_ha)}</b> &mdash; ${doubling} times as much. The worst single year is
        ${GFW.peak.year}, at ${n0(GFW.peak.loss_ha)} hectares; the lowest is ${GFW.floor.year}, at
        ${n0(GFW.floor.loss_ha)}.</p>` : ''}
      <p class="cap l-cap"><b>Tree cover loss is not deforestation.</b> ${esc(GFW.caveats[0])} ${esc(GFW.caveats[1])}</p>
      ${disclose(`Every year, ${GFW.total.from} to ${GFW.total.to}`,
    `<div class="l-tbl">
            <div class="l-tr is-head"><span class="lbl">Year</span><span class="lbl">Tree cover lost</span>
              <span class="lbl">Of it, primary</span><span class="lbl">Primary share</span></div>
            ${yrs.slice().reverse().map(y => {
      const p = primByYear[y.year] ?? null;
      return `<div class="l-tr"><span class="l-td-y">${y.year}</span>
              <span>${n0(y.loss_ha)}</span><span>${p == null ? '—' : n0(p)}</span>
              <span>${p == null ? '—' : n1(p / y.loss_ha * 100) + '%'}</span></div>`;
    }).join('\n            ')}
          </div>
          <p class="cap l-cap">Hectares, at ${GFW.threshold.value}% canopy density.</p>`)}
      <p style="margin:0"><a class="act" href="#states">Where it went ${ARROW}</a></p>
    </div>`;
};

/* WHERE IT WENT. ISFR's own state table — the net hides the gross. */
B.states = () => {
  const all = [...CH.losses.map(x => ({ ...x, dir: 'loss' })),
    ...CH.gains.map(x => ({ ...x, dir: 'gain' }))]
    .sort((a, b) => b.km2 - a.km2);
  const maxS = Math.max(...all.map(x => x.km2));
  const rows = all.map(x => measureRow({
    name: `${esc(x.state)}<i>${x.dir === 'loss' ? 'lost' : 'gained'}</i>`,
    valuePct: x.km2 / maxS * 100,
    limitPct: gainKm2 / maxS * 100,
    value: `${x.dir === 'loss' ? '&minus;' : '+'}${n1(x.km2)}`,
    times: 'km&sup2;',
    over: x.dir === 'loss',
    aria: `${x.state} ${x.dir === 'loss' ? 'lost' : 'gained'} ${x.km2} square kilometres`,
  })).join('\n        ');
  return `${opener('states', 'Where it went', 'A net figure hides its own components. This is what the +156 km&sup2; is made of.')}
    <div class="wrap">
      <p class="l-lead">The five biggest state losses and the five biggest gains between
        India&rsquo;s last two forest assessments. <b>The tick marks the national net figure</b>,
        ${n1(gainKm2)} km&sup2; &mdash; so every bar reaching past it is a single state moving more
        than the whole country appeared to.</p>
      ${measureHead(['State', `Change, against the national net of ${n1(gainKm2)} km&sup2;`, 'km&sup2;', ''])}
      <div class="l-rows">
        ${rows}
      </div>
      <p class="l-note"><b>${esc(CH.the_arithmetic)}</b></p>
      <p class="cap l-cap"><b>And the scale of it.</b> ${esc(CH.the_scale)}</p>
${hole('ISFR publishes no national gross gain or gross loss — only a net, plus per-state changes. So the total area of forest India actually lost over those two years cannot be computed from the report at all.')}
${hole('And "forest cover" includes plantations and orchards. There is no natural-forest-only series in the report, so the question most readers are asking cannot be answered from this document alone.')}
      <p style="margin:0"><a class="act" href="#law">What the law says ${ARROW}</a></p>
    </div>`;
};

/* WHAT THE LAW SAYS. The limit is a requirement, not a quantity. */
B.law = () => `${opener('law', 'What the law says', 'There is no legal maximum. There is a legal gatekeeper &mdash; and that is a different kind of limit from every other one on this site.')}
    <div class="wrap">
      <div class="l-law">
        <p class="lbl l-law-t">${esc(LAW.instrument)}</p>
        <p class="l-law-b">${esc(LAW.what_it_requires)}</p>
        <p class="cap l-law-x"><b>${esc(LAW.why_it_is_not_a_number)}</b></p>
      </div>
      <p class="l-note"><b>Every other situation on this site reads a number against a threshold
        somebody notified.</b> Air has an AQI limit. The Yamuna has a dissolved-oxygen minimum. Heat
        has IMD&rsquo;s criteria. Forest has an approval process. So this page cannot say
        &ldquo;the limit was exceeded&rdquo; &mdash; only how much was approved, by whom, and
        whether the forest came back.</p>
${hole(LAW.hole)}
      <p class="cap l-cap"><b>What cannot be computed, and is therefore not published.</b>
        ${esc(FL.sources?.c_satellite?.how_to_close || '')} A single national figure for "forest lost
        to legal diversion" would need the Ministry&rsquo;s own approval data, which this build did
        not obtain.</p>
      <h3 class="d2 l-h3">And who is looking</h3>
      ${(() => {
    const mm = ATTN.months.filter(m => !m.partial);
    const peakV = Math.max(...mm.map(m => m.views));
    const bars = mm.slice(-36).map(m =>
      `<i class="l-ab${m.views === ATTN.peak.views ? ' is-peak' : ''}" style="--h:${Math.max(1, Math.round(m.views / peakV * 100))}%" title="${m.month}: ${n0(m.views)} views"></i>`).join('');
    return `<div class="l-att" role="img" aria-label="Monthly attention, peaking at ${n0(ATTN.peak.views)} views">${bars}</div>
      <p class="cap l-cap">Views of the English Wikipedia article on deforestation in India. Peak
        <b>${n0(ATTN.peak.views)}</b>, floor <b>${n0(ATTN.floor.views)}</b> &mdash; a swing of
        <b>${ATTN.swing}&times;</b>. <b>It is the thinnest attention series of any situation on this
        site.</b> A national net gain of ${n1(gainKm2)} km&sup2; generates less interest than a
        single felling with a photograph, and that is the honest shape of it.</p>`;
  })()}
      <p class="cap l-reg-i">${n0(NEWS.register.count)} items from
        ${n0(Object.keys(NEWS.register.publishers || {}).length)} publishers. Reporting is tagged as
        reporting.</p>
      ${disclose(`Read the ${n0(Math.min(40, NEWS.register.count || 0))} most recent items`,
    `<ol class="p-news-ol l-reg">
            ${(NEWS.register.items || []).slice(0, 40).map(i => `<li class="p-news-r"><a class="p-news-o" href="${esc(i.link)}">${esc(i.title)}</a><span class="cap p-news-m">${esc(i.publisher || 'unattributed')}${i.published ? ` &middot; ${esc(shortDate(i.published))}` : ''}</span></li>`).join('\n            ')}
          </ol>
          <p class="cap l-pub"><b>Publishers:</b> ${Object.entries(NEWS.register.publishers || {}).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${esc(k)} (${v})`).join(' &middot; ')}</p>`)}
      <p style="margin:0"><a class="act" href="#act">What you can do ${ARROW}</a></p>
    </div>`;

B.act = () => `${opener('act', 'What you can do', 'A forest is lost with paperwork, not with an axe.')}
    <div class="wrap">
      <div class="p-act">
        <div class="p-act-c">
          <p class="lbl">Read the definition before the number</p>
          <p>Anyone quoting a forest figure at you is using one of two definitions and almost never
            says which. <b>Ask whether it counts plantations.</b> That single question separates
            most of the arguments about Indian forests.</p>
          <p style="margin:0"><a class="act" href="${esc(ISFR.source.landing)}">India&rsquo;s forest report ${ARROW}</a></p>
        </div>
        <div class="p-act-c">
          <p class="lbl">Diversion proposals are public</p>
          <p>Forest land cannot be used for anything else without central approval, and those
            proposals are published while they are still proposals. That is the point at which a
            forest is still a forest.</p>
          <p style="margin:0"><a class="act" href="/now/forest-fire">And what burns ${ARROW}</a></p>
        </div>
        <div class="p-act-c">
          <p class="lbl">Compensatory is not equivalent</p>
          <p>An approval usually comes with compensatory afforestation elsewhere. A sixty-year-old
            forest and a two-year-old plantation are the same line in a ledger and not the same
            thing on the ground.</p>
          <p style="margin:0"><a class="act" href="/#give">Support the work ${ARROW}</a></p>
        </div>
      </div>
      <p class="cap l-close">Every figure on this page is public, dated and linked &mdash; including
        the two that disagree.</p>
${siblings('loss')}
    </div>`;

/* ═══ HELPERS ════════════════════════════════════════════════════════════ */
function shortDate(s) {
  const m = /(\d{1,2})\s+(\w{3})\w*\s+(\d{4})/.exec(String(s));
  return m ? `${m[1]} ${m[2]} ${m[3]}` : String(s).slice(0, 16);
}

/* ═══ PAGE CSS — layout only ═════════════════════════════════════════════ */
const PAGE_CSS = `
/* ══ AD-16 — THE FOREST LOSS PAGE'S OWN BLOCK ═════════════════════════════
   Tokens, chrome, tabs, disclosure and measure row all inherited. Every
   component states its colour for its own ground rather than inheriting.
   ═══════════════════════════════════════════════════════════════════════ */
.l-u{font-size:.3em;vertical-align:.6em;color:var(--fg-3);font-weight:500;margin-left:.1em}
.l-plain{font-size:clamp(15px,1.05vw,17px);line-height:1.6;color:var(--fg-2);max-width:46ch;margin:0 0 .7em}
.l-lead{font-size:clamp(16px,1.15vw,18.5px);line-height:1.55;max-width:60ch;margin:0 0 1.1em;color:var(--fg-2)}
.paper .l-lead{color:var(--ink-2)}
.l-note{border-left:2px solid var(--hair);padding:2px 0 2px 16px;margin:clamp(20px,2.2vw,30px) 0;
  font-size:clamp(15px,1.05vw,17px);line-height:1.58;color:var(--fg-2);max-width:60ch}
.paper .l-note{border-left-color:var(--rule-2);color:var(--ink-2)}
.l-cap{color:var(--fg-3);max-width:60ch;margin:.8em 0 0}
.paper .l-cap{color:var(--ink-3)}
.l-h3{margin:clamp(30px,3.4vw,46px) 0 .5em}
.l-src-p{max-width:62ch;color:var(--fg-3);margin:clamp(18px,2vw,26px) 0 clamp(20px,2.2vw,28px)}
.paper .l-src-p{color:var(--ink-3)}
.l-close{max-width:60ch;color:var(--fg-3);margin:clamp(22px,2.4vw,32px) 0 0}
.l-rows{margin:0 0 2px}
.is-red{color:var(--red)}
.paper .is-red{color:var(--red-ink)}
.l-src-p code{font-size:.9em;color:var(--fg-2)}
.paper .l-src-p code{color:var(--ink-2)}

/* THE THREE SOURCES, side by side. C is the one that disagrees. */
.l-srcs{display:grid;grid-template-columns:1fr;gap:clamp(18px,2vw,28px)}
.l-src{border-top:2px solid var(--hair);padding-top:13px}
.l-src.is-c{border-top-color:var(--red)}
.l-src-t{display:block;color:var(--fg-3);margin:0 0 .5em}
.l-src-n{font-size:clamp(30px,3.2vw,44px);line-height:.98;margin:0 0 .3em;font-variant-numeric:tabular-nums}
.l-src-n i{font-size:.32em;font-style:normal;letter-spacing:.03em;color:var(--fg-3);margin-left:.22em}
.l-src-x{color:var(--fg-3);max-width:44ch}
.l-warn-i{color:var(--fg-2);font-style:normal}

/* ON PAPER: the definition panels. */
.l-panel{max-width:64ch}
.l-panel>p{font-size:clamp(14.5px,1vw,16.5px);line-height:1.58;color:var(--ink-2);margin:0 0 .85em}
.l-def-h{font-size:clamp(15px,1.1vw,17.5px);color:var(--ink);margin:0 0 .6em}
.l-warn{border-left:2px solid var(--rule-2);padding-left:14px}
.l-cover,.l-thr,.l-pl{margin:.3em 0 .8em}
.l-cover-r,.l-thr-r{display:grid;grid-template-columns:minmax(0,8em) minmax(60px,1fr) 3.6em 5.6em;
  gap:0 clamp(7px,.9vw,13px);align-items:center;padding:8px 0;border-bottom:1px solid var(--rule)}
.l-thr-r{grid-template-columns:3em minmax(60px,1fr) 5em}
.l-cover-n,.l-thr-n{font-size:12.5px;color:var(--ink)}
.l-cover-b,.l-thr-b{display:block;height:8px;background:var(--rule)}
.l-cover-b>i,.l-thr-b>i{display:block;height:100%;width:var(--w);background:var(--ink-2)}
.l-thr-r.is-used .l-thr-b>i{background:var(--red-ink)}
.l-thr-r.is-used .l-thr-n,.l-thr-r.is-used .l-thr-v{color:var(--ink);font-weight:600}
.l-cover-v,.l-cover-a,.l-thr-v{font-variant-numeric:tabular-nums;text-align:right;font-size:12px;color:var(--ink-2)}
.l-cover-a{font-size:10.5px;color:var(--ink-3)}
.l-pl-r{display:grid;grid-template-columns:minmax(0,1fr) 7em;gap:0 12px;align-items:baseline;
  padding:7px 0;border-bottom:1px solid var(--rule)}
.l-pl-n{font-size:12.5px;color:var(--ink)}
.l-pl-v{font-variant-numeric:tabular-nums;text-align:right;font-size:12.5px;color:var(--ink-2)}
.l-pl-v i{font-style:normal;font-size:.78em;color:var(--ink-3);margin-left:.2em}

/* THE TWENTY-FIVE YEAR COLUMNS, with primary forest overlaid. */
.l-yy{display:grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:clamp(2px,.4vw,5px);
  align-items:end;margin:.2em 0 .3em}
.l-yy-c{display:grid;grid-template-rows:104px auto;justify-items:center;gap:4px}
.l-yy-b{position:relative;display:block;width:100%;height:104px}
.l-yy-all,.l-yy-pri{position:absolute;left:0;right:0;bottom:0;display:block;height:var(--h)}
.l-yy-all{background:var(--fg-3)}
.l-yy-pri{background:var(--fg)}
.l-yy-c.is-peak .l-yy-all{background:var(--red)}
.l-yy-y{color:var(--fg-3);font-variant-numeric:tabular-nums;font-size:10px}
.l-key{display:flex;flex-wrap:wrap;gap:0 6px;align-items:center;color:var(--fg-3);margin:0}
.l-k-all,.l-k-pri{display:inline-block;width:14px;height:8px;vertical-align:middle}
.l-k-all{background:var(--fg-3)}
.l-k-pri{background:var(--fg)}

/* THE YEAR TABLE. */
.l-tbl{margin:.2em 0 0}
.l-tr{display:grid;grid-template-columns:3.6em repeat(3,minmax(0,1fr));gap:0 7px;align-items:baseline;
  padding:8px 0;border-bottom:1px solid var(--hair-2);font-variant-numeric:tabular-nums}
.l-tr.is-head{border-bottom:1px solid var(--hair)}
.l-tr.is-head .lbl{font-size:9.5px;color:var(--fg-3)}
.l-tr>span{font-size:12px;color:var(--fg-2);text-align:right}
.l-tr>span:first-child{text-align:left}
.l-td-y{color:var(--fg)!important}

/* THE LAW BLOCK. */
.l-law{border-left:3px solid var(--fg-2);padding:2px 0 2px 18px;margin:0 0 clamp(18px,2vw,26px)}
.l-law-t{display:block;color:var(--fg);margin:0 0 .6em}
.l-law-b{font-size:clamp(15px,1.08vw,17.5px);line-height:1.55;color:var(--fg-2);max-width:56ch;margin:0 0 .7em}
.l-law-x{color:var(--fg-3);max-width:56ch;margin:0}

/* ATTENTION. */
.l-att{display:flex;align-items:flex-end;gap:2px;height:80px;margin:.3em 0 .2em}
.l-ab{flex:1 1 0;min-width:2px;height:var(--h);background:var(--fg-3);border-radius:1px 1px 0 0}
.l-ab.is-peak{background:var(--mustard)}
.l-reg-i,.l-pub{max-width:62ch;color:var(--fg-3)}
.l-reg{margin:.5em 0 .4em}

@media (min-width:760px){ .l-srcs{grid-template-columns:repeat(3,1fr)} }
@media (max-width:639px){
  .l-cover-r{grid-template-columns:minmax(0,1fr) 3.4em;grid-template-areas:'n v' 'b b' 'a a';gap:4px 8px}
  .l-cover-n{grid-area:n}.l-cover-v{grid-area:v}.l-cover-b{grid-area:b}
  .l-cover-a{grid-area:a;text-align:left}
  .l-thr-r{grid-template-columns:3em minmax(0,1fr) 4.6em}
  .l-yy-c{grid-template-rows:84px auto}
  .l-yy-b{height:84px}
  .l-yy-y{font-size:8.5px}
  .l-tr{font-size:11.5px}
  .l-att{height:68px}
}
`;

/* ═══ WRITE ══════════════════════════════════════════════════════════════ */
await S.assemble({
  file: 'situation-forest-loss.html',
  title: 'India&rsquo;s forest loss &mdash; Swechha',
  bands: BANDS, index: INDEX, sh, clashes,
  pageCss: PAGE_CSS,
  sectionFor: (id) => (B[id] || (() => '    <div class="wrap"><p class="lead">&mdash;</p></div>'))(),
  note: `8 bands + footer. THE DISAGREEMENT: satellite -${lossKm2} km2 over `
      + `${GFW.total.from}-${GFW.total.to} against ISFR +${gainKm2} km2. `
      + `${PLANT?.outside_pct}% of loss outside plantations, ${PRIM?.share_of_all_loss_pct}% primary. `
      + `Loss ${doubling}x since 2013.`,
});
