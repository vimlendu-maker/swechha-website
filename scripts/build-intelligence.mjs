// D-25 — intelligence.html, the situation index. THREE bands. Lean.
//
// ★ THE CONCEPT, AND IT COMES OUT OF THE DATA RATHER THAN OFF A MOODBOARD.
// Put the six readings next to each other and the striking thing is that they
// are NOT COMMENSURABLE. Six different units — an index, mg/L, °C, km², million
// hectares, a count of days — and, more interestingly, six different KINDS of
// limit:
//
//     Air            a ceiling            AQI 100, and it is above it
//     Yamuna         a floor              > 5.0 mg/L, and it is below it
//     Heat           an absolute          47 °C, no reference to normal
//     Forest fire    NONE                 no statute publishes a permitted area
//     Forest loss    a requirement        approval, not a quantity
//     Climate event  a class crossed N×   64.5 mm, thirteen times in one year
//
// So the index's job is the inverse of a dashboard's. VAYU — the reference site
// — reduces this to one score under a LIVE chip, and re-tested on 21 August it
// serves every figure from seeded fixtures (D-23.13). The honest page cannot
// out-apparatus that and should not try. It says the thing a single score has to
// hide: THESE ARE SIX DIFFERENT MEASUREMENTS AND ANYTHING THAT AVERAGES THEM IS
// INVENTING A NUMBER NOBODY PUBLISHED.
//
// That is also why the page is short. There is no aggregate to build, no gauge
// to fill, and no cadence table to pad it with — the client cut orders and
// cadence, and the vocabulary teaches itself in the blocks, where three of the
// four state words appear on real cards: LIVE on Air, PERIODIC on four, and
// OUT OF SEASON on Heat. Each chip names how its SOURCE delivers, never how
// this page was rendered — which is why Air's reads LIVE on every render.
//
// ★ EVERY FIGURE IS READ FROM THE SAME COMMITTED JSON THE SITUATION PAGES USE.
// The index cannot disagree with a situation page, because it is not told the
// numbers — it reads them. That was a real defect class on the old page, whose
// h1 claimed four illegal over a set containing three.
import * as S from './lib/situation-shell.mjs';
const { esc, n0, n1, compact, opener, hole, ARROW, stateChip, disclose } = S;

const sh = S.shell();

/* ═══ DATA ═══════════════════════════════════════════════════════════════ */
const AIR = S.J('air-delhi.json');
const YAM = S.J('yamuna-cpcb-2025.json');
const HEAT = S.J('heat-india.json');
const FF = S.J('forest-fire-india.json');
const ISFR = S.J('forest-isfr-2023.json');
const GFW = S.J('gfw-india.json');
const CL = S.J('climate-india.json');
const DTH = S.J('deaths-ncrb-2024.json');

const airRd = AIR.city_reading;
const heatRec = HEAT.national.hottest_on_record;
const burnt = ISFR.fire.burnt_area;
const clWorst = [...CL.stations].sort((a, b) =>
  b.last_complete.extreme_days - a.last_complete.extreme_days)[0];

/* ── THE SIX. Each one names its own KIND of limit, because that is the
      page's argument. `kind` is a word from a closed list of six, and no two
      situations share one — which is the finding, not a coincidence.

      `href` IS READ OUT OF THE SHELL'S FAMILY, never typed. This index and
      its six children are asserted to link to each other in both directions
      (`npm run verify:final`), so the one place a route may be written is
      `FAMILY` in situation-shell.mjs — and `familyHref` throws on an id it
      does not know, which is what makes a typo here a build failure rather
      than a card pointing at nothing. ────────────────────────────────────── */
const SITUATIONS = [
  {
    id: 'air', name: 'Air', where: 'Delhi',
    href: S.familyHref('air'),
    value: n0(airRd.aqi), unit: 'air quality index',
    sub: `${esc(airRd.band)} · governed by ${airRd.governing === 'PM2.5' ? 'PM2.5' : esc(airRd.governing)}`,
    kind: 'a ceiling', limit: `AQI ${AIR.aqiLimit}`,
    authority: 'CPCB, National Air Quality Index',
    verdict: airRd.aqi > AIR.aqiLimit
      ? `${+(airRd.aqi / AIR.aqiLimit).toFixed(1)}× the limit` : 'within the limit',
    breach: airRd.aqi > AIR.aqiLimit,
    /* ★ LIVE, ALWAYS. Client ruling, and the justification is better than
       the ruling.

       THE CHIPS ON THIS PAGE ARE CADENCE LABELS FOR THE SITUATION, NOT
       CLAIMS ABOUT THIS PAGE'S RENDER. Yamuna's PERIODIC does not mean
       "this card was fetched periodically" — it means the Yamuna SOURCE is
       periodic, an annual CPCB table. Forest loss carries PERIODIC over a
       2001-2025 cumulative figure that no fetch could ever move. Heat
       carries OUT OF SEASON because the SEASON is shut, not because the
       card is.

       Not one of the six chips describes the DOM. They describe how the
       source delivers. So Air — the one situation with a server route in
       front of an hourly feed, which is what earned its own page the badge
       under D-21.5 — is the one situation whose delivery IS live, and its
       label should say so on every render.

       An earlier pass had this card ship PERIODIC and swap to LIVE after
       the fetch. That was the wrong correction to the right instinct: it
       made the chip describe the fetch instead of the source, which is the
       one thing none of the other five chips do.

       The fetch still runs — see IX_LIVE — but only to keep the NUMBER
       current. The chip no longer moves, because the cadence it names does
       not move. The residual is recorded at D-26.2. */
    state: 'LIVE',
    upgrades: true,
    line: 'The only reading on this site that can change while you look at it.',
  },
  {
    id: 'yamuna', name: 'Yamuna', where: 'Delhi',
    href: S.familyHref('yamuna'),
    value: n1(YAM.reporting_floor.do), unit: 'mg/L dissolved oxygen',
    sub: 'at or below the detection limit',
    kind: 'a floor', limit: YAM.limits.do.label,
    authority: 'Primary Water Quality Criteria, E(P) Rules 1986',
    verdict: 'no measurable oxygen',
    breach: true,
    state: 'PERIODIC',
    line: 'The one number here that has to be read downwards. Lower is worse, and it is at the bottom.',
  },
  {
    id: 'heat', name: 'Heat', where: 'India',
    href: S.familyHref('heatwave'),
    value: n1(heatRec.tmax), unit: '°C',
    sub: `${esc(heatRec.name)}, ${heatRec.year} · the record in this archive`,
    kind: 'an absolute', limit: `${HEAT.criteria.absolute_severe} °C`,
    authority: 'IMD, severe heat wave',
    verdict: `${n1(heatRec.tmax - HEAT.criteria.absolute_severe)} °C above it`,
    breach: heatRec.tmax >= HEAT.criteria.absolute_severe,
    state: HEAT.window.open ? 'PERIODIC' : 'OUT OF SEASON',
    line: `The season is shut until ${esc(HEAT.window.returns)}. The record is true either way.`,
  },
  {
    id: 'fire', name: 'Forest fire', where: 'India',
    href: S.familyHref('fire'),
    value: n0(Math.round(burnt.total)), unit: 'km² burnt in one season',
    sub: esc(burnt.season),
    kind: 'none', limit: FF.limit.label,
    authority: 'no statute publishes one',
    verdict: 'nothing to be over',
    breach: false,
    state: 'PERIODIC',
    line: 'The only situation here with no threshold to break. That is not reassurance.',
  },
  {
    id: 'forest', name: 'Forest loss', where: 'India',
    href: S.familyHref('loss'),
    value: `${GFW.total.loss_mha}`, unit: 'million hectares of tree cover',
    sub: `${GFW.total.from}–${GFW.total.to} · satellite-measured`,
    kind: 'a requirement', limit: 'approval, not a quantity',
    authority: 'Forest (Conservation) Act, 1980',
    verdict: `India’s own report says +${n1(ISFR.change_2021_to_2023.net_change_forest_cover)} km²`,
    breach: false,
    state: 'PERIODIC',
    line: 'Two official sources, opposite directions. Neither is lying.',
  },
  {
    id: 'climate', name: 'Climate event', where: 'India',
    href: S.familyHref('climate'),
    value: n0(clWorst.last_complete.extreme_days), unit: 'days over the heavy-rain threshold',
    sub: `${esc(clWorst.name)}, ${clWorst.last_complete.year}`,
    kind: 'a class, crossed', limit: `${n1(CL.categories.heavy)} mm in 24 hours`,
    authority: 'IMD rainfall day categories',
    verdict: `crossed ${clWorst.last_complete.extreme_days} times in one year`,
    breach: true,
    state: 'PERIODIC',
    line: 'Not one breach. A count of them.',
  },
];

// THE ARGUMENT, COMPUTED. If two situations ever shared a kind of limit, the
// page's central claim would be weaker and it should say so rather than assert
// it from a comment. So the count is derived.
const KINDS = [...new Set(SITUATIONS.map(s => s.kind))];
const kindsAllDistinct = KINDS.length === SITUATIONS.length;
const UNITS = [...new Set(SITUATIONS.map(s => s.unit))];
const breaches = SITUATIONS.filter(s => s.breach).length;
const states = [...new Set(SITUATIONS.map(s => s.state))];

/* ═══ BAND SEQUENCE — id, tier class, ground hex ══════════════════════════ */
const BANDS = [
  ['top',       't1',        '#0D0D0B'],
  ['set',       'dark-2 t2', '#151512'],
  ['campaigns', 'paper t3',  '#F3F2F0'],
];
const clashes = S.groundChain(BANDS);

const INDEX = [
  ['What a situation is', '#top'],
  ['The six', '#set'],
  ['What we do about it', '#campaigns'],
];

/* ═══ BANDS ══════════════════════════════════════════════════════════════ */
const B = {};

/* THE HERO BANNER. Typographic, not photographic — all six situation pages
   open on a photograph, and the index is the cover of the instrument rather
   than a seventh subject. The banner's job is one definition and one refusal. */
B.top = () => `    <div class="wrap ix-hero">
      <p class="lbl ix-eyebrow">Environmental intelligence</p>
      <h1 class="d1 ix-h1">Every situation<br>we read</h1>
      <p class="ix-lead"><b>A situation is one measurement, against one published limit, with
        the gap named.</b> Not a score, not a mood, not a colour. If nobody published a limit,
        the page says so instead of inventing one.</p>
      <div class="ix-def">
        <div class="ix-def-c">
          <p class="ix-def-n">${SITUATIONS.length}</p>
          <p class="lbl ix-def-l">situations</p>
          <p class="cap ix-def-x">Air, the Yamuna, heat, forest fire, forest loss, extreme rain.
            Each one has its own page, and every figure on this page is read from the same
            committed data as that page &mdash; so the two cannot disagree.</p>
        </div>
        <div class="ix-def-c">
          <p class="ix-def-n">${UNITS.length}</p>
          <p class="lbl ix-def-l">different units</p>
          <p class="cap ix-def-x">An index. Milligrams per litre. Degrees. Square kilometres.
            Million hectares. A count of days. <b>There is no exchange rate between them.</b></p>
        </div>
        <div class="ix-def-c">
          <p class="ix-def-n">${KINDS.length}</p>
          <p class="lbl ix-def-l">kinds of limit</p>
          <p class="cap ix-def-x">A ceiling. A floor. An absolute. A class crossed repeatedly.
            A legal requirement that names no quantity. And, once, <b>none at all</b>.</p>
        </div>
      </div>
      <p class="ix-refuse"><b>So there is no total on this page, and there never will be.</b>
        ${kindsAllDistinct
    ? `No two of the ${SITUATIONS.length} share a kind of limit`
    : `The ${SITUATIONS.length} carry ${KINDS.length} kinds of limit between them`}, and
        ${UNITS.length} units cannot be averaged into one. A dashboard that gives you a single
        figure for &ldquo;the environment&rdquo; has decided something on your behalf and not
        told you what. <b>This page would rather be harder to read than that.</b></p>
      <p class="lbl ix-vocab-h">The four words, and the two the set needs today</p>
      <div class="ix-vocab">
        ${['LIVE', 'PERIODIC', 'OUT OF SEASON', 'DEMO DATA'].map(w => {
    const inUse = states.includes(w);
    const why = {
      LIVE: 'the value can change between two views of this page',
      PERIODIC: 'delivered on a cadence — a yearly table, a monthly sample',
      'OUT OF SEASON': 'the window is shut; the record still stands',
      'DEMO DATA': 'a specimen, and there are none in the set below',
    }[w];
    return `<span class="ix-vocab-r${inUse ? ' is-used' : ''}">${stateChip(w)}<i class="cap">${why}</i></span>`;
  }).join('\n        ')}
      </div>
      <p class="cap ix-vocab-x"><b>Nothing below is unstamped</b>, and the word is shown whether
        or not it flatters the reading. <b>Each word describes how its source delivers, not how
        this page was built</b> &mdash; Yamuna reads PERIODIC because CPCB publishes once a year,
        and Air reads LIVE because it is the one situation with a server route in front of an
        hourly feed. The chip names the cadence. The reading&rsquo;s own page carries the hour it
        was observed.</p>
      <p style="margin:0"><a class="act" href="#set">All ${SITUATIONS.length} ${ARROW}</a></p>
    </div>`;

/* THE SIX. One card each. The KIND OF LIMIT is the field that carries the
   argument, so it is given the same weight as the reading. */
B.set = () => {
  const cards = SITUATIONS.map((s, i) => `<a class="ix-card${s.breach ? ' is-breach' : ''}${s.kind === 'none' ? ' is-nolimit' : ''}"${s.upgrades ? ` id="ix-${s.id}"` : ''} href="${esc(s.href)}">
          <span class="ix-card-top">
            <span class="lbl ix-card-n">${esc(s.name)}</span>
            <span class="cap ix-card-w">${esc(s.where)}</span>
          </span>
          <span class="ix-card-v"${s.upgrades ? ' data-v' : ''}>${s.value}</span>
          <span class="cap ix-card-u">${s.unit}</span>
          <span class="cap ix-card-s"${s.upgrades ? ' data-sub' : ''}>${s.sub}</span>
          <span class="ix-card-rule" aria-hidden="true"></span>
          <span class="ix-card-lim">
            <i class="lbl ix-card-k">${esc(s.kind)}</i>
            <b>${s.limit}</b>
            <i class="cap ix-card-a">${esc(s.authority)}</i>
          </span>
          <span class="ix-card-verd${s.breach ? ' is-red' : ''}"${s.upgrades ? ' data-verd' : ''}>${s.verdict}</span>
          <span class="ix-card-line cap">${s.line}</span>
          <span class="ix-card-foot">${stateChip(s.state)}<i class="ix-card-go">${ARROW}</i></span>
        </a>`).join('\n        ');

  return `${opener('set', 'The six', 'One card each. The line that matters on every one of them is not the reading &mdash; it is what kind of limit the reading is being held to.')}
    <div class="wide ix-cards">
        ${cards}
    </div>
    <div class="wrap">
      <p class="ix-note"><b>Read the middle line of each card.</b> ${breaches} of the
        ${SITUATIONS.length} are over a published limit. One is <i>below</i> a published
        minimum, which is the same failure pointing the other way. One is measured against a
        legal <i>requirement</i> that names no quantity at all. And one has
        <b>no threshold in law to break</b> &mdash; which is the weakest position of the six,
        not the safest.</p>
      <p class="cap ix-src">Every figure is read at build time from the committed dataset behind
        its own page. Nothing on this page is typed in by hand, which is why it cannot drift from
        the six pages it points at.</p>
${hole('There is no seventh situation hidden behind this page, and no waiting list. When a source exists for one, it gets a page and a card. Until then this is the whole set.')}
    </div>`;
};

/* WHAT WE DO ABOUT IT. On paper, short, and sourced. The client's instruction
   was "at most a section of campaigns", so this is the only band after the set,
   and it carries only figures with a source in SOURCE-FACTS. */
B.campaigns = () => `${opener('campaigns', 'What we do about it', 'Three campaigns. None of them is a solution to a national number, and saying otherwise would be the same trick as a single score.')}
    <div class="wrap">
      <div class="ix-camps">
        <div class="ix-camp">
          <p class="ix-camp-n">We for Yamuna</p>
          <p class="cap ix-camp-y">since 2000</p>
          <p class="ix-camp-x">The founding campaign, and still the organisation&rsquo;s spine.
            It is the reason there is a Yamuna page at all, and the reason the walk exists.</p>
          <p style="margin:0"><a class="act" href="/now/yamuna">The reading it works against ${ARROW}</a></p>
        </div>
        <div class="ix-camp">
          <p class="ix-camp-n">Monsoon Wooding</p>
          <p class="cap ix-camp-y">annual</p>
          <p class="ix-camp-x">Roughly <b>5,000 trees a year</b> across Delhi NCR, and
            <b>over 50,000 planted and survived</b> in total.
            <i>Survived</i> is the organisation&rsquo;s own word for it, and it is the honest one
            &mdash; planting is not the same measurement as living.</p>
          <p style="margin:0"><a class="act" href="/#impact">The record ${ARROW}</a></p>
        </div>
        <div class="ix-camp">
          <p class="ix-camp-n">Delhi I Can&rsquo;t See You</p>
          <p class="cap ix-camp-y">&mdash;</p>
          <p class="ix-camp-x">Named here because it is one of the three current campaigns.
            <b>No description is given because none is sourced yet</b>, and this page does not
            write copy for a campaign it cannot cite.</p>
          <p style="margin:0"><a class="act" href="/#work">What we work on ${ARROW}</a></p>
        </div>
      </div>
      <p class="ix-note"><b>The gap between a campaign and a national figure is the honest
        subject.</b> Fifty thousand surviving trees is a real number and it is not a reply to
        ${GFW.total.loss_mha} million hectares. Both are on this site, in their own units, and
        neither is used to cancel the other.</p>
      <p class="cap ix-close">Every reading here is public, dated and linked to the document it
        came from. Where a figure could not be obtained, the page it belongs to says so in the
        place the figure would have gone.</p>
      <p style="margin:0"><a class="act" href="/#give">Support the work ${ARROW}</a></p>
    </div>`;

/* ═══ THE ONE PIECE OF PAGE SCRIPT ═══════════════════════════════════════
   The Air card upgrades from /api/air, exactly as the Air page and the
   homepage ticker do. Same contract as both: the card ships a committed value
   stamped PERIODIC, and only a well-formed reading may write — at which point
   the chip becomes LIVE, because by then the value genuinely can move between
   two views. Every failure path returns early and leaves the card as rendered
   (D-16.4). Nothing here can write a dash, an empty string or a 0.
   ═══════════════════════════════════════════════════════════════════════ */
const IX_LIVE = `
(function(){
  var card=document.getElementById('ix-air'); if(!card||!window.fetch) return;
  var v=card.querySelector('[data-v]'),
      verd=card.querySelector('[data-verd]'), sub=card.querySelector('[data-sub]');
  if(!v) return;
  fetch('/api/air',{cache:'no-store'}).then(function(r){return r.json();}).then(function(d){
    if(!d||d.ok!==true) return;
    var r=d.reading;
    if(!r||typeof r.aqi!=='number'||!isFinite(r.aqi)||r.aqi<=0||!r.band) return;
    var limit=(typeof d.aqiLimit==='number'&&d.aqiLimit>0)?d.aqiLimit:${AIR.aqiLimit};
    v.textContent=r.aqi.toLocaleString('en-IN');
    var over=r.aqi>limit;
    card.classList.toggle('is-breach',over);
    if(verd) verd.textContent=over?(Math.round(r.aqi/limit*10)/10)+'\u00D7 the limit':'within the limit';
    if(verd) verd.classList.toggle('is-red',over);
    if(sub&&r.band) sub.textContent=r.band+(r.governing?' \u00B7 governed by '+r.governing:'');
    /* THE CHIP IS NOT TOUCHED. It reads LIVE on every render because it
       names Air's DELIVERY CADENCE, not this fetch. See the note on the
       Air situation above, and D-26. */
  }).catch(function(){ /* leave the committed card alone */ });
})();
`;

/* ═══ PAGE CSS — layout only ═════════════════════════════════════════════ */
const PAGE_CSS = `
/* ══ D-25 — THE SITUATION INDEX'S OWN BLOCK ═══════════════════════════════
   Tokens, chrome and the state chip are inherited. Nothing below re-picks a
   colour or a type size. Every component states its colour for its own ground.
   The old page was 887 lines with 49.5% of its bytes in a private style block
   and a rail mechanism that did not exist on the frozen page; none of that is
   carried forward.
   ═══════════════════════════════════════════════════════════════════════ */
/* THE INDEX'S HERO PAYS FOR ITS OWN PADDING, because its band is t1 and t1 is
   padding:0. It had a top value only, and no bottom, so the ALL 6 link's rule
   landed exactly on the #0D0D0B -> #151512 ground change below it. Both halves
   are now the site's hero figure -- .pic-body on farm/impact/about/work, which
   is also what .ac-mast on /act uses -- so all six heroes sit on one rhythm
   instead of this one being 8px off the top on a phone.
   NO BACKTICKS IN THIS BLOCK: it is inside a template literal. */
.ix-hero{padding:clamp(24px,3.2vw,42px) 0 clamp(22px,2.8vw,36px)}
.ix-eyebrow{display:block;color:var(--fg-3);margin:0 0 clamp(14px,1.6vw,22px)}
.ix-h1{margin:0 0 clamp(18px,2vw,28px)}
.ix-lead{font-size:clamp(17px,1.35vw,22px);line-height:1.46;max-width:44ch;color:var(--fg);
  margin:0 0 clamp(24px,2.8vw,38px)}
.ix-refuse{border-left:2px solid var(--hair);padding:2px 0 2px 16px;
  margin:clamp(22px,2.6vw,34px) 0 0;font-size:clamp(15px,1.05vw,17px);line-height:1.58;
  color:var(--fg-2);max-width:62ch}
.ix-vocab{display:flex;flex-wrap:wrap;gap:6px 8px;align-items:center;max-width:62ch;
  color:var(--fg-3);margin:clamp(20px,2.2vw,28px) 0 clamp(22px,2.4vw,30px)}

/* THE THREE DEFINITION COLUMNS. Numerals, because the page's argument is a
   count: six situations, six units, six kinds of limit. */
.ix-def{display:grid;grid-template-columns:1fr;gap:clamp(20px,2.4vw,32px);
  margin:0 0 clamp(4px,1vw,10px)}
.ix-def-c{border-top:2px solid var(--hair);padding-top:13px}
.ix-def-n{font-size:clamp(40px,4.6vw,64px);line-height:.92;margin:0 0 .08em;
  font-variant-numeric:tabular-nums;color:var(--fg)}
.ix-def-l{display:block;color:var(--fg-2);margin:0 0 .5em}
.ix-def-x{color:var(--fg-3);max-width:40ch}

/* THE SIX CARDS. A grid that reads as a contact sheet rather than a
   dashboard: no shared scale, because there is no shared unit. */
.ix-cards{display:grid;grid-template-columns:1fr;gap:1px;background:var(--hair-2);
  margin:0 0 clamp(24px,2.8vw,36px)}
.ix-card{display:grid;gap:0;background:var(--ground-2);padding:clamp(18px,2vw,26px);
  text-decoration:none;color:inherit;position:relative;transition:background .14s}
.ix-card:hover,.ix-card:focus-visible{background:rgba(251,248,240,.045)}
.ix-card:focus-visible{outline:2px solid var(--fg);outline-offset:-3px}
.ix-card-top{display:flex;align-items:baseline;justify-content:space-between;gap:10px;
  margin:0 0 clamp(12px,1.4vw,18px)}
.ix-card-n{color:var(--fg)}
.ix-card-w{color:var(--fg-3)}
.ix-card-v{display:block;font-size:clamp(44px,5vw,68px);line-height:.94;
  font-variant-numeric:tabular-nums;color:var(--fg)}
.ix-card.is-breach .ix-card-v{color:var(--red)}
.ix-card-u{display:block;color:var(--fg-2);margin:.35em 0 .1em}
.ix-card-s{display:block;color:var(--fg-3)}
.ix-card-rule{display:block;height:1px;background:var(--hair);margin:clamp(14px,1.6vw,20px) 0}
/* THE KIND OF LIMIT. Given the same weight as the reading, because it is the
   page's argument. A card with no limit is marked by the ABSENCE of a value,
   not by a colour — there is nothing here to call red. */
.ix-card-lim{display:block;margin:0 0 clamp(10px,1.2vw,14px)}
.ix-card-k{display:block;font-size:10px;letter-spacing:.09em;text-transform:uppercase;
  color:var(--fg-3);font-style:normal;margin:0 0 .3em}
.ix-card-lim b{display:block;font-size:clamp(15px,1.15vw,18px);line-height:1.3;color:var(--fg);font-weight:500}
.ix-card-a{display:block;color:var(--fg-3);margin-top:.28em;font-style:normal}
.ix-card.is-nolimit .ix-card-lim b{color:var(--fg-2)}
.ix-card-verd{display:block;font-size:clamp(14px,1vw,16px);line-height:1.4;color:var(--fg-2);
  margin:0 0 clamp(10px,1.2vw,14px)}
.ix-card-line{display:block;color:var(--fg-3);max-width:38ch;
  margin:0 0 clamp(16px,1.8vw,22px)}
.ix-card-foot{display:flex;align-items:center;justify-content:space-between;gap:10px;
  margin-top:auto}
.ix-card-go{display:inline-flex;width:22px;height:22px;color:var(--mustard);flex:none}
.ix-card-go svg{width:100%;height:100%}
.is-red{color:var(--red)}

.ix-note{border-left:2px solid var(--hair);padding:2px 0 2px 16px;
  margin:clamp(20px,2.2vw,30px) 0;font-size:clamp(15px,1.05vw,17px);line-height:1.58;
  color:var(--fg-2);max-width:62ch}
.paper .ix-note{border-left-color:var(--rule-2);color:var(--ink-2)}
.ix-src{color:var(--fg-3);max-width:62ch;margin:.8em 0 0}
.ix-close{color:var(--ink-3);max-width:62ch;margin:clamp(20px,2.2vw,28px) 0 clamp(18px,2vw,24px)}

/* CAMPAIGNS, on paper. */
.ix-camps{display:grid;grid-template-columns:1fr;gap:clamp(22px,2.6vw,34px)}
.ix-camp{border-top:2px solid var(--rule-2);padding-top:13px}
.ix-camp-n{font-family:inherit;font-size:clamp(18px,1.5vw,24px);line-height:1.2;color:var(--ink);margin:0 0 .2em}
.ix-camp-y{display:block;color:var(--ink-3);margin:0 0 .7em}
.ix-camp-x{font-size:clamp(14.5px,1vw,16.5px);line-height:1.55;color:var(--ink-2);
  max-width:40ch;margin:0 0 1em}

@media (min-width:760px){
  .ix-def{grid-template-columns:repeat(3,1fr)}
  .ix-cards{grid-template-columns:1fr 1fr}
  .ix-camps{grid-template-columns:repeat(3,1fr)}
}
@media (min-width:1100px){
  .ix-cards{grid-template-columns:repeat(3,1fr)}
}
`;

/* ═══ WRITE ══════════════════════════════════════════════════════════════ */
await S.assemble({
  file: 'intelligence.html',
  title: 'Now &mdash; Swechha',
  bands: BANDS, index: INDEX, sh, clashes,
  pageCss: PAGE_CSS,
  script: IX_LIVE,
  sectionFor: (id) => (B[id] || (() => '    <div class="wrap"><p class="lead">&mdash;</p></div>'))(),
  note: `3 bands + footer. ${SITUATIONS.length} situations, ${UNITS.length} units, `
      + `${KINDS.length} kinds of limit (all distinct: ${kindsAllDistinct}). `
      + `${breaches} over a published limit. States: ${states.join(', ')}.`,
});
