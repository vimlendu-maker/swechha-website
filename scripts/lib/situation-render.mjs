/* ═══════════════════════════════════════════════════════════════════════════
   situation-render.mjs — THE ACTIVE SITUATION BOARD, DATA FIRST.
   ───────────────────────────────────────────────────────────────────────────
   WHAT WAS WRONG WITH THE PAGE THIS REPLACES, measured rather than felt. The
   old /now/climate-event/<slug> was ONE band containing eleven stacked
   subsections and roughly 1,400 words of prose, and the first thing under the
   headline was four cells reading "— not established" followed by a
   180-word paragraph explaining why the page would not write a summary. A
   reader scanning for ten seconds learned: an unnamed number of people, in
   Nepal, possibly.

   The order is now the one the brief sets, and each band answers exactly one
   question so that scanning works:

     A  top          WHAT and HOW BAD          status pill, name, the numbers
        strip        the four readings          the same component Air uses
     B  where        WHERE                     a real map, then origin to India
     C  damage       WHAT IS BROKEN            counted things, or a named gap
     D  cause        WHY, AND HOW SURE         candidate causes + evidence word
     E  eo           WHAT THE SATELLITE SEES   before and after, actual imagery
     F  developing   WHAT HAS HAPPENED         a timeline, not a news feed
     G  voice        WHAT SWECHHA SAYS         Vimlendu, on the record, linked
     H  pattern      HAS THIS HAPPENED BEFORE  precedents as cards
     I  next         WHAT HAPPENS NEXT         two horizons, levels where earned
     J  climate      IS THIS A CLIMATE SIGNAL  trend figures + what cannot be said
     K  india        IS INDIA AFFECTED         the chain, and confirmed vs watch
        sources      WHO SAYS SO               compact, expandable

   ★ IT BORROWS AIR AND YAMUNA'S COMPONENTS RATHER THAN INVENTING A LOOK.
   `.readout`, `.p-cell` strip, `.p-tabs`, `.p-nr` rows, `.bands`, `.p-map`,
   `.p-hole`, `disclose()`, `opener()` — all of it already exists in
   situation-shell's CSS and is already on this page's stylesheet, because the
   shell ships one stylesheet to every situation. So the new markup inherits
   the spacing, the type scale and the rules for free, and what CSS this file
   adds is only what genuinely has no precedent: the status pill, the metric
   cards, the image slider, the risk matrix and the cause grid.

   ★ THE PROSE THAT WAS REMOVED WAS NOT DELETED, IT WAS DEMOTED.
   Every caveat the old page carried is still on this page, inside a
   `<details>` a reader can open. That is the actual instruction — "preserve
   evidence, caveats and source integrity in expandable/deeper layers" — and it
   is also the only version of the rigour that survives contact with a reader:
   a caveat nobody reaches because it is the fourth paragraph of the hero has
   not been published, it has been filed.

   ★ ONE RULE IS UNCHANGED AND IS LOAD-BEARING. Every figure still carries its
   source and its confidence word. What changed is that the figures now EXIST,
   because event-figures.mjs reads them out of the headlines this page was
   already citing at the bottom. The em-dash was never rigour; it was an empty
   field with a good excuse.
   ═══════════════════════════════════════════════════════════════════════════ */
import { esc, ARROW, imgDim, disclose, opener, n0, tabs } from './situation-shell.mjs';
import { CLAIM_STATUS, RELEVANCE, istStamp } from './climate-events.mjs';
import { statusOf, TYPE_LABEL } from './active-situation.mjs';
import { METRIC_ORDER, METRIC_LABEL, eventName, HAZARD_NAME } from './event-figures.mjs';
import { layerById } from './event-imagery.mjs';

const HAZARD_LABEL = {
  glof: 'Glacial lake outburst flood', cloudburst: 'Cloudburst', flood: 'Flood',
  landslide: 'Landslide', cyclone: 'Cyclone', extreme_rain: 'Extreme rainfall',
};

/* TIME IN THE MARKUP IS ABSOLUTE — the rule the page this replaces established
   and the one thing about it that was exactly right. A relative age written
   into committed HTML makes the file's bytes move every minute, which turns
   the repository's own "the tree moved" gate permanently red. The browser
   rewrites it to "6 minutes ago" and keeps the absolute in the title. */
const stamp = (epochMs) => {
  const abs = istStamp(epochMs);
  return `<time class="ce-t" datetime="${new Date(epochMs).toISOString()}" title="${esc(abs)}">${esc(abs)}</time>`;
};

const srcName = (sources, id) => {
  const s = sources[id];
  if (!s) return '';
  const name = esc(s.publisher);
  return s.url ? `<a class="lk" href="${esc(s.url)}">${name}</a>` : name;
};

const srcNames = (sources, ids, max = 3) => {
  const list = (Array.isArray(ids) ? ids : [ids]).filter(Boolean);
  const shown = list.slice(0, max).map((id) => srcName(sources, id)).filter(Boolean);
  const rest = list.length - shown.length;
  return shown.join(', ') + (rest > 0 ? ` and ${rest} more` : '');
};

/* Hedges are the outlet's word, so they are printed as the outlet's word.
   ★ THE SLOT IS ALWAYS RENDERED, EVEN EMPTY, and that is a layout fix rather
   than markup for its own sake. The hedge sits above the numeral, so on a row
   of four cards where two outlets hedged and two did not, the four 62px
   numerals sat at two different heights and the row read as broken. An empty
   slot costs one line of small type in two cards and buys a baseline the eye
   can run along, which on this page is the entire point of the row. */
const withHedge = (v, hedge) => `<i class="as-hedge"${hedge ? '' : ' aria-hidden="true"'}>${hedge ? esc(hedge) : '&nbsp;'}</i>${n0(v)}`;

/* ═══ A. THE HERO ═════════════════════════════════════════════════════════ */

/** The status pill. Three of the five statuses render one; the other two are
 *  the absence of urgency and must not be dressed as its presence. */
function pill(st) {
  if (!st.pill) {
    return `<span class="as-pill as-pill-off"><i aria-hidden="true">${st.dot}</i>${esc(st.label)}</span>`;
  }
  return `<span class="as-pill as-pill-${st.pill}"><i aria-hidden="true">${st.dot}</i>${esc(st.label)}`
    + `<span class="sr"> situation. ${esc(st.line)}</span></span>`;
}

/* ── THE METRIC CARDS ─────────────────────────────────────────────────────
   ★ A CARD ONLY EXISTS WHEN A NUMBER EXISTS. This is the single biggest
   departure from the old board, which rendered all four cells always and put
   an em-dash in the ones it had nothing for. Four dashes is not honesty about
   uncertainty, it is four units of visual weight spent saying nothing, at the
   top of the page, where the reader is deciding whether to stay.

   THE DISAGREEMENT IS ON THE CARD, NOT BEHIND IT. Where outlets differ, the
   range and the outlet count sit under the figure in the same glance. That is
   the part a newspaper cannot do and a dashboard can. */
function metricCards(impact, sources) {
  const rows = METRIC_ORDER
    .map((k) => [k, impact?.[k]])
    .filter(([, c]) => c && c.value != null);
  if (!rows.length) return '';

  return `      <div class="as-cards">
${rows.slice(0, 6).map(([k, c]) => {
    const st = CLAIM_STATUS[c.status] || CLAIM_STATUS.preliminary;
    const sp = c.spread;
    const disagree = sp && sp.max > sp.min;
    return `        <div class="as-card${k.startsWith('indians_') ? ' as-card-in' : ''}">
          <span class="as-card-v">${withHedge(c.value, c.hedge)}</span>
          <span class="lbl as-card-l">${esc(c.label || METRIC_LABEL[k] || k)}</span>
          <span class="as-card-st as-st-${st.cls}">${esc(st.label)}</span>
          ${disagree
    ? `<span class="cap as-card-sp">Outlets report ${n0(sp.min)}&ndash;${n0(sp.max)} &middot;
            ${sp.outlets} source${sp.outlets === 1 ? '' : 's'}</span>`
    : `<span class="cap as-card-sp">${sp ? `${sp.outlets} source${sp.outlets === 1 ? '' : 's'}, agreeing` : 'one source'}</span>`}
        </div>`;
  }).join('\n')}
      </div>
${figureLedger(rows, sources)}`;
}

/** Every reading behind every card, with the exact words it was read out of.
 *  This is the audit trail, and it is one click rather than a page of prose. */
function figureLedger(rows, sources) {
  const body = rows.map(([k, c]) => `<p class="lbl as-led-h">${esc(c.label || METRIC_LABEL[k] || k)}</p>
          <ul class="as-led">
            ${(c.readings || []).map((r) => `<li><b>${withHedge(r.value, r.hedge)}</b>
              <span class="cap">${srcName(sources, r.source) || esc(r.publisher || '')}${r.matched ? ` &mdash; &ldquo;${esc(r.matched)}&rdquo;` : ''}</span></li>`).join('\n            ')}
          </ul>`).join('\n          ');
  return disclose('Every figure, and the words it was read out of',
    `<p class="as-led-p">No number on this page is this site&rsquo;s own. Each one was read out of a
        published headline and is printed here beside that headline&rsquo;s own wording, so a figure and
        the sentence it came from can be checked against each other. Where outlets disagree, all of
        them are below &mdash; nothing is averaged and nothing is reconciled.</p>
          ${body}`);
}

/* ── THE READINGS STRIP ───────────────────────────────────────────────────
   THE SAME COMPONENT AIR AND YAMUNA USE, deliberately down to the class
   names, because it is the thing that makes those two pages scannable and it
   is the one piece of this design language that is literally about "the four
   numbers on this page". Four cells, each an anchor into the band that
   explains it. */
export function strip(e, impact, imagery) {
  const cells = [];
  const first = METRIC_ORDER.map((k) => [k, impact?.[k]]).filter(([, c]) => c?.value != null);
  for (const [, c] of first.slice(0, 2)) {
    cells.push([n0(c.value), c.label, c.spread?.max > c.spread?.min
      ? `${n0(c.spread.min)}–${n0(c.spread.max)} reported` : 'reported', '#top', true]);
  }
  const lc = e.live_conditions;
  if (lc && lc.rain_7d_mm != null) {
    cells.push([`${lc.rain_7d_mm}`, 'Rain, 7 days', 'mm over the region', '#next', false]);
  }
  if (imagery?.after) {
    cells.push([imagery.after.date.slice(5).replace('-', '/'), 'Satellite', `${imagery.after.satellite} · ${imagery.after.obscuredPct}% cloud`, '#eo', false]);
  }
  cells.push([n0(e.corroboration.independent_publishers), 'Publishers', 'reporting it', '#sources', false]);

  return `    <div class="wide p-strip-in">
${cells.slice(0, 4).map(([v, l, s, href, red]) => `      <a class="p-cell" href="${href}">
        <span class="p-cell-v${red ? ' is-red' : ''}">${v}</span>
        <span class="lbl p-cell-l">${esc(l)}</span><span class="cap p-cell-s">${esc(s)}</span></a>`).join('\n')}
      <p class="cap p-strip-note">One reading, one label. <a class="lk" href="#sources">Every source behind them</a>.</p>
    </div>`;
}

export function heroBand(e, ctx, imagery, { crumb }) {
  const st = statusOf(e);
  const hazard = HAZARD_LABEL[e.hazard] || e.hazard;
  const name = eventName(e);
  const impact = e.impact || {};
  const S = e.sourceIndex;

  return `    <div class="wrap as-hero">
${crumb}
      <div class="as-head">
        <p class="lbl as-kicker">${esc(TYPE_LABEL)}
          <i class="as-sep">&middot;</i>${esc(e.location.text)}
          <i class="as-sep">&middot;</i>${esc(hazard)}</p>
        ${pill(st)}
      </div>

      <h1 class="d1 as-h1">${esc(name)}</h1>

${metricCards(impact, S)}

      <!-- WHEN, AFTER WHAT AND HOW BAD. MEASURED AT 375x635, WHICH IS AN
           IPHONE-CLASS VISIBLE HEIGHT AND NOT THE 812 LOGICAL ONE. With the
           two timestamp cards above the figures, the first screen of this page
           on a phone ended on "LAST UPDATED / 89 minutes ago" and not one
           casualty number was above the fold — on a page whose entire purpose
           is that the numbers are the first thing you see. The order is now
           what the brief's own principle says: what, how bad, then when. It
           reads correctly at 1440 too, so this is one order rather than a
           breakpoint. -->
      <div class="as-when">
        <div class="as-when-c">
          <span class="lbl as-when-l">Occurred</span>
          <span class="as-when-v">${stamp(e.occurred.epochMs)}</span>
          <span class="cap as-when-n">${e.occurred.precision === 'reported'
    ? 'The hour the first report carried, not a verified onset time.'
    : 'As dated by the source.'}</span>
        </div>
        <div class="as-when-c">
          <span class="lbl as-when-l">Last updated</span>
          <span class="as-when-v">${stamp(e.last_updated.epochMs)}</span>
          <span class="cap as-when-n">Feeds re-read every 30 minutes. This moves only when the evidence does.</span>
        </div>
      </div>
${Object.keys(impact).length ? '' : `      <p class="p-hole">No casualty or damage figure has been reported in a form this page can
        attribute yet. ${e.corroboration.independent_publishers} publishers are carrying the event;
        none of their headlines states a count. <a class="lk" href="#sources">The reporting is here</a>.</p>`}

      <p class="as-lede">${esc(e.headline)}
        <span class="cap as-lede-s">&mdash; ${srcName(S, Object.keys(S)[0]) || 'reported'}, the most corroborated
        headline of ${n0(e.corroboration.items_read || e.corroboration.independent_publishers)} read.
        This site writes no summary of a live disaster; it prints the reporting and names it.</span></p>

      <p style="margin:0"><a class="act" href="#where">Where it happened ${ARROW}</a></p>
    </div>`;
}

/* ═══ B. WHERE ════════════════════════════════════════════════════════════ */

/* ── THE MAP ──────────────────────────────────────────────────────────────
   ★ INLINE SVG FROM REAL COORDINATES, THE SAME WAY /now/air PLOTS ITS
   FORTY-FIVE MONITORS. No tiles, no key, no third-party request, and it works
   with images blocked. What it plots is what this repository can actually
   locate: the region point the reporting names, and the downstream places the
   hazard's own context pack names as being in the path.

   ★ IT IS EXPLICITLY NOT A MAP OF THE EVENT, AND THE FRAME SAYS SO.
   The dossier's location is "Nepal" — a country 885 km across whose centroid
   is not where the flood was. So the origin is drawn as a RING, not a dot: a
   ring reads as an area and a dot reads as a place, and only one of those is
   true. The label under it states the frame's own width in kilometres, which
   is the honest measure of how much this does not know. */
const ORIGIN_RING = 13;

function mapSvg(e, ctx, imagery, coordsFor) {
  const origin = coordsFor(e.location.text);
  if (!origin) return null;

  /* ★ THE MAP PLOTS `downstream`, NOT `india_path`, AND THE DIFFERENCE IS WHY
     THE FIRST VERSION DREW ONE DOT. `india_path` is the MECHANISM chain —
     "Glacial lake, high Himalaya", "Moraine dam fails", "Headwater river" — and
     four of its five nodes are steps rather than locations, so a projection can
     do nothing with them. It is exactly right for the chain diagram beside this
     map, which is a statement about hydrology and needs no coordinates, and
     useless here, because a map is a statement about position and must not fake
     one. `downstream` is the same journey written as places.

     A place with no coordinate is DROPPED rather than approximated. */
  const located = (ctx?.downstream || [])
    .map((label) => {
      const c = coordsFor(label);
      return c ? { label, lat: c[0], lon: c[1] } : null;
    })
    .filter(Boolean)
    /* ★ NEAR-DUPLICATES ARE DROPPED, and this is not hypothetical tidiness.
       PLACE_COORDS puts "Brahmaputra" at 26.20, 91.75 and "Guwahati" at 26.14,
       91.74 — eight kilometres apart — so a pack naming both printed two
       labels through each other on one dot. Half a degree is roughly 55 km,
       which at this frame width is one marker's worth of space. */
    .filter((p, i, all) => !all.slice(0, i).some((q) =>
      Math.abs(q.lat - p.lat) < 0.5 && Math.abs(q.lon - p.lon) < 0.5));

  const pts = [{ label: e.location.text, lat: origin[0], lon: origin[1], origin: true }, ...located];
  const lats = pts.map((p) => p.lat); const lons = pts.map((p) => p.lon);
  /* ★ THE SATELLITE FRAME IS PART OF THE EXTENT. It is drawn on this map, and
     the first version sized the map from the POINTS alone — so the imagery box,
     which reaches 31 degrees north while the northernmost plotted point is at
     30, was drawn hanging outside the map's own border. A box that escapes its
     frame reads as a rendering fault rather than as the area it is. */
  if (imagery?.frame) {
    lats.push(imagery.frame.south, imagery.frame.north);
    lons.push(imagery.frame.west, imagery.frame.east);
  }
  const pad = 1.6;
  const s = Math.min(...lats) - pad; const n = Math.max(...lats) + pad;
  const w = Math.min(...lons) - pad; const ee = Math.max(...lons) + pad;

  const W = 420; const H = 340;
  const X = (lon) => 28 + ((lon - w) / (ee - w)) * (W - 56);
  /* Latitude is inverted: north is up, and SVG y grows downward. */
  const Y = (lat) => 24 + (1 - (lat - s) / (n - s)) * (H - 60);

  const kmWide = Math.round((ee - w) * 111 * Math.cos((((n + s) / 2) * Math.PI) / 180));

  const path = located.map((p, i) => {
    const from = i === 0 ? pts[0] : located[i - 1];
    return `<line x1="${X(from.lon).toFixed(1)}" y1="${Y(from.lat).toFixed(1)}" `
      + `x2="${X(p.lon).toFixed(1)}" y2="${Y(p.lat).toFixed(1)}" class="p-m-ln"/>`;
  }).join('\n            ');

  const dots = located.map((p) => `<rect x="${(X(p.lon) - 3.5).toFixed(1)}" y="${(Y(p.lat) - 3.5).toFixed(1)}" `
    + `width="7" height="7" class="as-m-down"><title>${esc(p.label)} — in the path downstream</title></rect>`)
    .join('\n            ');

  /* ── LABEL PLACEMENT, WITH COLLISION AVOIDANCE ────────────────────────
     ★ ALTERNATING THE SIDE WAS NOT ENOUGH AND THE FAILURE IS GEOGRAPHIC.
     Assam and the Brahmaputra sit at the SAME LATITUDE 1.2 degrees apart, so a
     left/right alternation put one label right-anchored and one left-anchored
     at an identical y and they printed through each other. Two more pairs on
     this one map are within 60 km.

     So placement is greedy: try to the right of the marker, then to the left,
     then above, then below, and take the first box that does not overlap one
     already placed. The estimate of a label's width is deliberately crude —
     6.2px per character at this 9px uppercase Archivo — because being
     approximately right about a text box beats being exactly right about
     nothing, and the failure mode of an over-estimate is a label placed
     further away rather than a label on top of another one. */
  const CH = 6.2; const LH = 11;
  /* The ORIGIN's label is placed first and unconditionally — it is the one mark
     on this map that may not move — so it is seeded into the collision list
     rather than competing with the downstream ones. */
  const placed = [{
    x: X(pts[0].lon) + ORIGIN_RING + 7, y: Y(pts[0].lat) - LH / 2,
    w: e.location.text.length * 6.2, h: LH,
  }];
  const overlaps = (b) => placed.some((o) =>
    b.x < o.x + o.w && b.x + b.w > o.x && b.y < o.y + o.h && b.y + b.h > o.y);
  const labels = located.map((p) => {
    const cx = X(p.lon); const cy = Y(p.lat);
    const w = p.label.length * CH;
    const tries = [
      { x: cx + 8, y: cy - LH / 2, anchor: 'start', ty: cy + 3.5 },
      { x: cx - 8 - w, y: cy - LH / 2, anchor: 'end', ty: cy + 3.5 },
      { x: cx - w / 2, y: cy - 8 - LH, anchor: 'middle', ty: cy - 9 },
      { x: cx - w / 2, y: cy + 8, anchor: 'middle', ty: cy + 17 },
      { x: cx + 8, y: cy + 8, anchor: 'start', ty: cy + 17 },
    ];
    const pick = tries.find((t) => !overlaps({ ...t, w, h: LH })) || tries[0];
    placed.push({ x: pick.x, y: pick.y, w, h: LH });
    return `<text x="${(pick.anchor === 'end' ? cx - 8 : pick.anchor === 'middle' ? cx : cx + 8).toFixed(1)}"`
      + ` y="${pick.ty.toFixed(1)}"`
      + `${pick.anchor === 'start' ? '' : ` text-anchor="${pick.anchor}"`} class="as-m-t">${esc(p.label)}</text>`;
  }).join('\n            ');

  /* The satellite frame, drawn as the box it actually is, so the reader can
     see how much of this map the picture below covers. */
  const frame = imagery?.frame ? `<rect x="${X(imagery.frame.west).toFixed(1)}" y="${Y(imagery.frame.north).toFixed(1)}" `
    + `width="${(X(imagery.frame.east) - X(imagery.frame.west)).toFixed(1)}" `
    + `height="${(Y(imagery.frame.south) - Y(imagery.frame.north)).toFixed(1)}" class="as-m-box">`
    + '<title>The area the satellite image below covers</title></rect>' : '';

  return `<svg viewBox="0 0 ${W} ${H}" class="p-map-s as-map" role="img"
            aria-label="${esc(e.location.text)} and the ${located.length} places downstream of it, at their true positions. The frame is ${kmWide} kilometres wide.">
            <rect x="14" y="14" width="${W - 28}" height="${H - 40}" class="p-m-fr"/>
            ${frame}
            ${path}
            ${dots}
            <circle cx="${X(pts[0].lon).toFixed(1)}" cy="${Y(pts[0].lat).toFixed(1)}" r="${ORIGIN_RING}" class="as-m-ring"><title>${esc(e.location.text)} — the region named in the reporting, not a located event site</title></circle>
            <circle cx="${X(pts[0].lon).toFixed(1)}" cy="${Y(pts[0].lat).toFixed(1)}" r="2.5" class="as-m-ringc"/>
            <text x="${(X(pts[0].lon) + ORIGIN_RING + 7).toFixed(1)}" y="${(Y(pts[0].lat) + 4).toFixed(1)}" class="as-m-t as-m-t-o">${esc(e.location.text)}</text>
            ${labels}
          </svg>
          <p class="p-legend p-map-lg"><span class="lbl"><i class="as-sw as-sw-o"></i>Region named in the reporting</span><span class="lbl"><i class="p-sw as-sw-d"></i>Downstream, in the path</span>${frame ? '<span class="lbl"><i class="as-sw as-sw-b"></i>The satellite frame below</span>' : ''}</p>
          <p class="cap">Frame ${n0(kmWide)} km wide. The ring is an AREA, not a point &mdash;
            this page knows the region the reporting names and does not know where inside it the
            event was. Positions of the downstream places are true.</p>`;
}

/** ORIGIN → DIRECT → INDIRECT, the compact hierarchy the brief asks for. It is
 *  a separate element from the map on purpose: the map answers "where", this
 *  answers "and then where does it go", and one diagram doing both does
 *  neither well. */
function chainDiagram(e, ctx) {
  const chain = ctx?.india_path?.length ? ctx.india_path : [e.location.text, 'India, downstream'];
  const ROLE = ['Origin', 'Direct impact', 'In the path', 'Downstream', 'Under watch'];
  return `      <ol class="as-chain">
${chain.map((node, i) => `        <li class="as-chain-n${i === 0 ? ' is-start' : ''}${i === chain.length - 1 ? ' is-end' : ''}">
          <span class="lbl as-chain-r">${esc(ROLE[Math.min(i, ROLE.length - 1)])}</span>
          <span class="as-chain-t">${esc(node)}</span>
        </li>`).join('\n')}
      </ol>`;
}

export function whereBand(e, ctx, imagery, coordsFor) {
  const map = mapSvg(e, ctx, imagery, coordsFor);
  return `${opener('where', 'Where', `${esc(e.location.text)} &mdash; and every place the water reaches after it. `
    + 'Positions are real coordinates; the extent of the event is not known.')}
    <div class="wrap">
      <div class="p-map">
        <div class="p-map-f">
          ${map || '<p class="p-hole">This page holds no coordinate for the place the reporting names, so no map is drawn. A map of somewhere nearby is not a map of this.</p>'}
        </div>
        <div class="p-map-t">
${chainDiagram(e, ctx)}
          ${e.india_relevance_note ? `<p class="body as-rel">
            <span class="lbl as-rel-l">${esc(RELEVANCE[e.india_relevance] || '')}</span>
            ${esc(e.india_relevance_note)}</p>` : ''}
        </div>
      </div>
    </div>`;
}

/* ═══ C. DAMAGE ═══════════════════════════════════════════════════════════
   ★ NO DASH GRID. The instruction is explicit and it is also the right call:
   where there is no damage assessment, one sentence saying an assessment is
   under way beats eight icons with nothing under them. */
const DAMAGE_ICON = {
  homes: '\u{1F3E0}', buildings: '\u{1F3E0}', bridges: '\u{1F309}', roads: '\u{1F6E3}',
  power: '⚡', hydropower: '⚡', tourism: '\u{1F3E8}', travellers: '\u{1F3E8}',
  agriculture: '\u{1F33E}', crops: '\u{1F33E}', livestock: '\u{1F404}', schools: '\u{1F3EB}',
  water: '\u{1F30A}', area_flooded: '\u{1F30A}', discharge: '\u{1F30A}',
};
const HUMAN_METRICS = new Set(METRIC_ORDER);

export function damageBand(e) {
  const S = e.sourceIndex;
  const rows = Object.entries(e.impact || {})
    .filter(([k, c]) => !HUMAN_METRICS.has(k) && c && c.value != null);
  const figures = (e.figures || []).filter((c) => c?.value != null);

  const cards = [
    ...rows.map(([k, c]) => [DAMAGE_ICON[k] || '▪', c.label || k.replace(/_/g, ' '), c]),
    ...figures.map((c) => [DAMAGE_ICON[String(c.label || '').toLowerCase()] || '▪', c.label || 'figure', c]),
  ];

  if (!cards.length) {
    return `${opener('damage', 'What is broken', 'Physical damage, where an authority has counted it.')}
    <div class="wrap">
      <p class="p-hole"><b>Damage assessment is ongoing.</b> No count of buildings, bridges, roads or
        cropland has been published in a form this page can attribute. In a Himalayan disaster the
        first credible infrastructure figures typically follow the first aerial survey, which follows
        the weather. This band fills itself when they exist; it will not fill itself with dashes.</p>
      <p class="cap">What IS counted &mdash; people &mdash; is at the top of this page, with every
        outlet that reported each figure.</p>
    </div>`;
  }

  return `${opener('damage', 'What is broken', 'Physical damage, where an authority has counted it. Anything not listed here has not been counted, which is different from being undamaged.')}
    <div class="wrap">
      <div class="as-dmg">
${cards.slice(0, 8).map(([icon, label, c]) => {
    const st = CLAIM_STATUS[c.status] || CLAIM_STATUS.preliminary;
    return `        <div class="as-dmg-c">
          <span class="as-dmg-i" aria-hidden="true">${icon}</span>
          <span class="as-dmg-v">${esc(String(c.value))}${c.unit ? `<i>${esc(c.unit)}</i>` : ''}</span>
          <span class="lbl as-dmg-l">${esc(label)}</span>
          <span class="cap as-dmg-s"><i class="as-st as-st-${st.cls}">${esc(st.label)}</i> ${srcNames(S, c.source)}</span>
        </div>`;
  }).join('\n')}
      </div>
    </div>`;
}

/* ═══ D. CAUSE ════════════════════════════════════════════════════════════
   ★ FOUR EVIDENCE WORDS, AND "CONFIRMED" IS ALMOST NEVER ONE OF THEM.
   Himalayan disasters are routinely reported as one mechanism and found months
   later to be another: Chamoli 2021 was called a glacier burst and was a
   rock-ice avalanche. So the default for every candidate cause is UNDER
   INVESTIGATION, and only a dossier field an editor set can raise it.

   ★ CLIMATE CHANGE IS NOT ON THIS LIST AND CANNOT BE PUT ON IT.
   Attribution of a single event is a research programme, not a page section.
   The larger signal has its own band, which states what science can say about
   the CLASS of event and, separately, what has not been attributed to this one. */
const CAUSE_STATUS = {
  confirmed: { label: 'Confirmed', cls: 'confirmed', rank: 3 },
  likely: { label: 'Likely', cls: 'likely', rank: 2 },
  under_investigation: { label: 'Under investigation', cls: 'invest', rank: 1 },
  not_established: { label: 'Not established', cls: 'none', rank: 0 },
};

export function causeBand(e, ctx) {
  const causes = ctx?.causes || [];
  if (!causes.length) return null;
  const set = e.cause_status || {};
  const rows = causes
    .map((c) => ({ ...c, status: set[c.id] || c.default_status || 'under_investigation' }))
    .sort((a, b) => (CAUSE_STATUS[b.status]?.rank ?? 0) - (CAUSE_STATUS[a.status]?.rank ?? 0));

  const anyConfirmed = rows.some((r) => r.status === 'confirmed');

  return `${opener('cause', 'What caused it', anyConfirmed
    ? 'One mechanism has been established. The others remain candidates.'
    : `Candidate mechanisms for a ${esc((HAZARD_NAME[e.hazard] || e.hazard).toLowerCase())}, each with what is actually known about it here. Nothing on this list is established for this event.`)}
    <div class="wrap">
      <div class="as-causes">
${rows.slice(0, 5).map((r) => {
    const st = CAUSE_STATUS[r.status] || CAUSE_STATUS.under_investigation;
    return `        <div class="as-cause as-cause-${st.cls}">
          <span class="as-cause-st">${esc(st.label)}</span>
          <span class="as-cause-t">${esc(r.label)}</span>
          ${r.short ? `<span class="cap as-cause-n">${esc(r.short)}</span>` : ''}
        </div>`;
  }).join('\n')}
      </div>
${disclose('How would we know?', `<p>Each of these leaves different evidence, and the evidence arrives at
        different speeds. That is why the status words above are what they are.</p>
        <dl class="as-how">
${rows.map((r) => `          <dt>${esc(r.label)}</dt>
          <dd>${esc(r.evidence || 'How this would be established for this event has not been set out.')}</dd>`).join('\n')}
        </dl>
        ${ctx?.mechanism ? `<p class="lbl as-how-h">The mechanism in general, researched in advance</p>
        ${Object.entries(ctx.mechanism).map(([k, v]) => `<p><b>${esc({ trigger: 'Immediate trigger', conditions: 'Environmental conditions', assessment: 'What science says', human: 'Human factors' }[k] || k)}.</b> ${esc(v)}</p>`).join('\n        ')}
        <p class="cap"><b>This is the mechanism for this kind of event, not a finding about this
          one.</b> The classification above is this page&rsquo;s reading of how the event was first
          reported. Himalayan disasters are often reclassified once fieldwork is done.</p>` : ''}`)}
    </div>`;
}

/* ═══ E. EARTH OBSERVATION ════════════════════════════════════════════════
   ★ THE IMAGERY IS ON THE PAGE OR THE REASON IS ON THE PAGE. There is no
   third option and in particular there is no stock mountain. */
function imageFig(img, label) {
  return `<figure class="as-eo-f">
            <img class="as-eo-i" src="${esc(img.src)}" alt="${esc(`${img.layerName} satellite view of the region, ${img.date}`)}"${imgDim(img.src)} loading="lazy" decoding="async">
            <figcaption class="cap as-eo-c"><b>${esc(label)} &middot; ${esc(img.date)}</b>
              ${esc(img.satellite)}, ${esc(img.sensor)}, ${esc(img.resolution)}.
              ${img.obscuredPct > 0 ? `${img.obscuredPct}% of the frame is cloud or snow.` : ''}</figcaption>
          </figure>`;
}

export function eoBand(e, imagery) {
  const head = opener('eo', 'What the satellite sees',
    'Imagery published here, not linked to. The same public NASA layers a newsroom would use, over the region the reporting names, on the dates either side of the event.');

  if (!imagery || (!imagery.before && !imagery.after && !imagery.latest)) {
    const why = imagery?.after_pending || imagery?.reason
      || 'No usable frame has been found over this region yet.';
    return `${head}
    <div class="wrap">
      <div class="as-eo-pend">
        <p class="lbl as-eo-pend-l">Satellite imagery pending</p>
        <p class="as-eo-pend-t">${esc(why)}</p>
        <p class="cap">This page will not put a photograph of a different mountain here while it
          waits. Optical layers, a second satellite, shortwave infrared and Sentinel-1 radar were
          all tried; the ladder is re-run every half hour.</p>
      </div>
    </div>`;
  }

  const pair = imagery.before && imagery.after;
  const L = layerById(imagery.after?.layer || imagery.before?.layer);

  /* THE SLIDER IS ONLY OFFERED FOR A COMPARABLE PAIR. Two different
     instruments sliding across each other shows the instrument changing, not
     the ground — so a mixed pair is shown side by side and says why. */
  const compare = pair && imagery.comparable
    ? `      <div class="as-cmp" data-cmp>
        <img class="as-cmp-b" src="${esc(imagery.before.src)}" alt="${esc(`The same region before the event, ${imagery.before.date}`)}"${imgDim(imagery.before.src)} loading="lazy" decoding="async">
        <div class="as-cmp-a" style="--x:50%">
          <img src="${esc(imagery.after.src)}" alt="${esc(`The same region after the event, ${imagery.after.date}`)}"${imgDim(imagery.after.src)} loading="lazy" decoding="async">
        </div>
        <span class="as-cmp-h" aria-hidden="true"></span>
        <span class="lbl as-cmp-lb">Before &middot; ${esc(imagery.before.date)}</span>
        <span class="lbl as-cmp-la">After &middot; ${esc(imagery.after.date)}</span>
        <input class="as-cmp-r" type="range" min="0" max="100" value="50" step="1"
          aria-label="Reveal the after image. Left is before the event, right is after.">
      </div>
      <p class="cap as-eo-k">Drag to wipe between the two dates. Both frames are the same layer,
        the same box and the same satellite, so what changes between them is the ground.
        ${imagery.before.obscuredPct}% cloud before, ${imagery.after.obscuredPct}% after.</p>`
    : `      <div class="as-eo-two">
        ${imagery.before ? imageFig(imagery.before, 'Before') : ''}
        ${imagery.after ? imageFig(imagery.after, 'After') : ''}
      </div>
      ${imagery.comparable_note ? `<p class="cap as-eo-k">${esc(imagery.comparable_note)}</p>` : ''}`;

  const panels = [];
  panels.push([pair && imagery.comparable ? 'Before and after' : 'The frames', compare]);
  if (imagery.latest) panels.push(['Latest view', `      <div class="as-eo-two">${imageFig(imagery.latest, 'Latest')}</div>`]);
  panels.push(['What the colours mean', `      <div class="as-eo-leg">
        <p class="body">${esc(L?.shows || '')}</p>
        <p class="cap"><b>Cloud and snow are not separated.</b> Both are bright and colourless at this
          resolution and there is no honest way to tell them apart from colour alone, so the figure
          this page prints is &ldquo;cloud or snow&rdquo; and means exactly that.</p>
        <p class="cap"><b>${esc(L?.resolution || '')} per pixel.</b> That is enough to show a changed river
          course, a flood plain and a large landslide scar. It is not enough to show a bridge or a
          building, and this page does not claim it is.</p>
      </div>`]);

  return `${head}
    <div class="wrap">
${tabs('Satellite imagery', panels)}
      ${imagery.frame ? `<p class="cap as-eo-fr">Frame ${imagery.frame.south}&ndash;${imagery.frame.north}&deg;N,
        ${imagery.frame.west}&ndash;${imagery.frame.east}&deg;E. ${esc(imagery.frame.note)}</p>` : ''}
      <p class="cap as-eo-at"><a class="lk" href="${esc(imagery.attribution.url)}">${esc(imagery.attribution.name)}</a>.
        ${esc(imagery.attribution.note)}
        ${imagery.before_pending ? `<b>Before the event:</b> ${esc(imagery.before_pending)}` : ''}
        ${imagery.after_pending ? `<b>Since the event:</b> ${esc(imagery.after_pending)}` : ''}</p>
    </div>`;
}

/* ═══ F. THE TIMELINE ═════════════════════════════════════════════════════ */
export function timelineBand(e) {
  const S = e.sourceIndex;
  const items = (e.timeline || []).slice(0, 8);
  if (!items.length) return null;
  const fmt = (w) => {
    const ms = Date.parse(w || '');
    if (!Number.isFinite(ms)) return esc(String(w || ''));
    return istStamp(ms).replace(' IST,', '').replace(/(\d{4})$/, '');
  };
  return `${opener('developing', 'How it developed', `${items.length} development${items.length === 1 ? '' : 's'} this page can date and attribute. Not a news feed &mdash; only moments where something changed.`)}
    <div class="wrap">
      <ol class="as-tl">
${items.map((t, i) => `        <li class="as-tl-i${i === items.length - 1 ? ' is-now' : ''}">
          <span class="as-tl-w">${fmt(t.when)}</span>
          <span class="as-tl-t">${esc(t.what)}</span>
          ${t.source ? `<span class="cap as-tl-s">${srcName(S, t.source)}</span>` : ''}
        </li>`).join('\n')}
      </ol>
      <p class="cap">Assembled from the feeds this page reads. A development nobody published does
        not appear here, and the absence of an entry is not the absence of an event.</p>
    </div>`;
}

/* ═══ H. PRECEDENTS ═══════════════════════════════════════════════════════
   ★ CARDS, NOT PARAGRAPHS. The context pack's `what` fields are 60 to 90 words
   each and the old page printed four of them in full, which is 300 words of
   history in the middle of a live disaster board. The card carries the place,
   the year, the number and the hazard; the paragraph moves into the
   disclosure, unchanged. */
function precedentCard(p, sources) {
  /* ★ THE CARD TITLE IS AUTHORED, IN THE CONTEXT PACK'S `card` FIELD.
     It was derived here at first, as the first sentence of `what`, and that
     failed twice: for "Chorabari Lake above Kedarnath, Uttarakhand, overtopped
     its moraine and drained in five to ten minutes" the first full stop is a
     hundred characters in, so the card fell back to printing its own date
     twice; and flood.json's precedents are milestones in a record rather than
     events at a place, so no slice of them is a title at all. A four-word card
     heading is authored data, not a string operation. */
  const title = p.card || p.when;
  const year = (p.when.match(/\b(1[89]\d{2}|20\d{2})\b/) || [])[1] || '';
  const toll = p.toll;
  const st = toll ? CLAIM_STATUS[toll.status] : null;

  /* ── THE LABEL IS UPPERCASED BY `.lbl`, AND HALF OF THESE ARE NOT LABELS ──
     ★ `toll.label` IN THE CONTEXT PACKS IS TWO DIFFERENT FIELDS WEARING ONE
     NAME, and set in uppercase Archivo the difference is the whole card:

       "missing, presumed dead"                      a unit label. Correct.
       "deaths — the figure of twenty or more in
        circulation is unsourced"                    a label AND a caveat.
       "— and other credible counts run to 102;
        there is no settled figure"                  ENTIRELY a caveat. The
                                                     unit is already inside
                                                     `value`: "55 dead, 74
                                                     missing".

     Splitting on the dash alone shipped the third case as the uppercase words
     "— AND OTHER CREDIBLE COUNTS RUN TO 102", which reads as a shout where a
     footnote was meant. So a string only becomes a label if it is short AND
     does not open with a connective; otherwise it is a sentence, it goes to
     the caption, and the card carries no label at all — which is right,
     because in exactly those cases `value` already names its own unit. */
  const rawLabel = String(toll?.label || '').replace(/^[\s—–-]+/, '');
  const isSentence = /^(and|or|for|the|but|plus|though|which|there|other)\b/i.test(rawLabel)
    || rawLabel.length > 26;
  const cut = isSentence ? -1 : rawLabel.search(/\s[—–-]\s|;\s/);
  const label = isSentence ? '' : (cut > 0 ? rawLabel.slice(0, cut) : rawLabel);
  const tail = isSentence ? rawLabel : (cut > 0 ? rawLabel.slice(cut).replace(/^[\s—–;-]+/, '') : '');

  return {
    card: `        <div class="as-prec">
          <span class="as-prec-y">${esc(year)}</span>
          <span class="as-prec-p">${esc(title)}</span>
          ${toll ? `<span class="as-prec-v">${esc(String(toll.value))}</span>
          ${label ? `<span class="lbl as-prec-l">${esc(label)}</span>` : ''}
          ${tail ? `<span class="cap as-prec-n">${esc(tail)}</span>` : ''}
          <span class="cap as-prec-s"><i class="as-st as-st-${st.cls}">${esc(st.label)}</i>
            ${srcNames(sources, toll.source)}</span>` : '<span class="cap as-prec-s">No settled toll</span>'}
        </div>`,
    detail: `          <dt>${esc(title)} &middot; ${esc(p.when)}</dt>
          <dd>${esc(p.what)}${toll?.note ? ` <b>${esc(toll.note)}</b>` : ''}</dd>`,
  };
}

export function precedentBand(e, ctx) {
  const list = (ctx?.precedents || []).slice(0, 5);
  if (!list.length) return null;
  const built = list.map((p) => precedentCard(p, ctx.sourceIndex));
  return `${opener('pattern', 'It has happened before', `${list.length} comparable events, with what each one actually cost. Every toll below is an official or peer-reviewed count, not a headline.`)}
    <div class="wrap">
      <div class="as-precs">
${built.map((b) => b.card).join('\n')}
      </div>
${disclose('What happened in each, and what was learned', `<dl class="as-how">
${built.map((b) => b.detail).join('\n')}
        </dl>
        ${(ctx.not_counted || []).length ? `<p class="lbl as-how-h">What these counts leave out</p>
        <ul>${(ctx.not_counted || []).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}`)}
    </div>`;
}

/* ═══ I. WHAT HAPPENS NEXT ════════════════════════════════════════════════
   ★ A LEVEL IS PRINTED ONLY WHERE A NUMBER SUPPORTS ONE, and on this page
   exactly one risk has that: rainfall, because the dossier carries a
   forecast. Everything else is a WATCH with its evidence named. Colouring
   five rows CRITICAL from a hazard's general character would be the same
   invention this whole subsystem exists to refuse, in a new colour.

   The rainfall level IS derived, from the ten-day series Open-Meteo already
   supplied, against India Meteorological Department's own published day
   categories — which is a real threshold from a real authority and not a
   scale invented here. */
const IMD_HEAVY = 64.5;        // mm/day: IMD "heavy rainfall"
const IMD_VERY_HEAVY = 115.5;  // mm/day: IMD "very heavy rainfall"

export function rainfallRisk(lc) {
  if (!lc?.daily?.length) return null;
  const todayIso = lc.daily.find((d) => d.date)?.date;
  /* The forward half of the series. Open-Meteo's window here is seven days
     back and three forward, and only the forward days are a forecast. */
  const ahead = lc.daily.slice(-3);
  if (!ahead.length) return null;
  const peak = Math.max(...ahead.map((d) => d.mm || 0));
  const total = ahead.reduce((a, d) => a + (d.mm || 0), 0);
  let level = 'Low';
  if (peak >= IMD_VERY_HEAVY) level = 'Critical';
  else if (peak >= IMD_HEAVY) level = 'High';
  else if (peak >= 25 || total >= 50) level = 'Moderate';
  return {
    level,
    peak: Math.round(peak * 10) / 10,
    total: Math.round(total * 10) / 10,
    days: ahead.length,
    from: todayIso,
    why: `Peak ${Math.round(peak * 10) / 10} mm in one day across the next ${ahead.length}, `
       + `against IMD's heavy-rainfall threshold of ${IMD_HEAVY} mm and very heavy at ${IMD_VERY_HEAVY} mm.`,
    source: lc.source,
  };
}

export function nextBand(e, ctx) {
  const rain = rainfallRisk(e.live_conditions);
  const watch = ctx?.what_to_watch || [];
  const later = ctx?.what_later || [];
  if (!rain && !watch.length && !later.length) return null;

  const row = (what, level, why) => `        <div class="as-risk-r${level ? ` as-risk-${level.toLowerCase()}` : ' as-risk-na'}">
          <span class="as-risk-l">${level ? esc(level) : 'Not assessed'}</span>
          <span class="as-risk-t">${esc(what)}</span>
          ${why ? `<span class="cap as-risk-w">${esc(why)}</span>` : ''}
        </div>`;

  return `${opener('next', 'What happens next', 'Two horizons. A level is printed only where a published threshold and a number exist to put something against; everything else is named as a watch, not graded.')}
    <div class="wrap">
      <p class="lbl as-sub">Next 24&ndash;72 hours</p>
      <div class="as-risk">
${rain ? row('More rain over the region', rain.level, rain.why) : ''}
${watch.slice(0, 5).map((w) => row(w, null, null)).join('\n')}
      </div>
      ${later.length ? `<p class="lbl as-sub">Coming days and weeks</p>
      <div class="as-risk">
${later.slice(0, 5).map((w) => row(w, null, null)).join('\n')}
      </div>` : ''}
      <p class="cap">${rain ? `The rainfall row is computed from a forecast model over a representative
        point for the region &mdash; ${esc(rain.source?.name || 'a forecast API')}, ${esc(rain.source?.note || '')} &mdash;
        not from a gauge at the event. ` : ''}The ungraded rows are the mechanisms that follow this
        hazard, drawn from the standing research pack. They are things to watch, and this page does
        not pretend to know their probability.</p>
    </div>`;
}

/* ═══ J. THE CLIMATE SIGNAL ═══════════════════════════════════════════════ */
export function climateBand(e, ctx) {
  const figures = (ctx?.figures || []).filter((f) => f?.value != null);
  if (!figures.length) return null;
  const S = ctx.sourceIndex;
  return `${opener('climate', 'Is this a climate signal', 'What is established about this KIND of event, at scale, with citations. Read the two statements at the foot of this band together; neither is complete on its own.')}
    <div class="wrap">
      <div class="as-sig">
${figures.slice(0, 6).map((f) => {
    const st = CLAIM_STATUS[f.status] || CLAIM_STATUS.preliminary;
    return `        <div class="as-sig-c">
          <span class="as-sig-v">${esc(String(f.value))}${f.unit ? `<i>${esc(f.unit)}</i>` : ''}</span>
          <span class="lbl as-sig-l">${esc(f.label)}</span>
          <span class="cap as-sig-s"><i class="as-st as-st-${st.cls}">${esc(st.label)}</i> ${srcNames(S, f.source)}</span>
        </div>`;
  }).join('\n')}
      </div>
      <div class="as-attr">
        <div class="as-attr-c as-attr-can">
          <p class="lbl as-attr-h">What science can say</p>
          <p class="as-attr-t">${esc(ctx.summary_short || (ctx.mechanism?.assessment || '').split('. ').slice(0, 2).join('. ') + '.')}</p>
        </div>
        <div class="as-attr-c as-attr-cant">
          <p class="lbl as-attr-h">What has not been attributed</p>
          <p class="as-attr-t">Nobody has established that climate change caused THIS event. Single-event
            attribution takes months of modelling and for a glacial or landslide-driven flood it is
            often not possible at all. A rising hazard across a region is not a finding about one
            flood in it, and this page will not print one as though it were.</p>
        </div>
      </div>
${disclose(`The full standing pack for this hazard (${(ctx.sources || []).length} sources)`,
    `${ctx.summary ? `<p>${esc(ctx.summary)}</p>` : ''}
        ${figures.map((f) => `<p><b>${esc(String(f.value))}${f.unit ? ` ${esc(f.unit)}` : ''} &mdash; ${esc(f.label)}.</b>
          ${esc(f.note || '')} <span class="cap">${srcNames(S, f.source, 4)}</span></p>`).join('\n        ')}
        ${(ctx.withheld || []).length ? `<p class="lbl as-how-h">Figures deliberately not published here</p>
        <ul>${(ctx.withheld || []).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}`)}
    </div>`;
}

/* ═══ K. INDIA ════════════════════════════════════════════════════════════ */
export function indiaBand(e, ctx) {
  const S = e.sourceIndex;
  const impact = e.impact || {};
  /* CONFIRMED vs UNDER WATCH, and the split is the whole band. An Indians-
     missing count reported by the Ministry of External Affairs IS a confirmed
     Indian impact; a river that could rise is not. Mixing them is the generic
     paragraph the brief specifically rejects. */
  const confirmed = METRIC_ORDER
    .filter((k) => k.startsWith('indians_'))
    .map((k) => [k, impact[k]])
    .filter(([, c]) => c?.value != null);

  if (!confirmed.length && !ctx?.india_watch && !e.india_relevance_note) return null;

  return `${opener('india', 'India', e.tier === 1
    ? 'This event is in India. What follows is what has been counted and what is still being watched.'
    : `${esc(e.location.text)} is outside India. This band is why an Indian site is carrying it, and it separates what has been counted from what has not.`)}
    <div class="wrap">
      <div class="as-ind">
        <div class="as-ind-half">
          <p class="lbl as-ind-h as-ind-h-c">Confirmed India impact</p>
${confirmed.length ? `          <div class="as-cards as-cards-sm">
${confirmed.map(([k, c]) => {
    const st = CLAIM_STATUS[c.status] || CLAIM_STATUS.preliminary;
    return `            <div class="as-card">
              <span class="as-card-v">${withHedge(c.value, c.hedge)}</span>
              <span class="lbl as-card-l">${esc(c.label || METRIC_LABEL[k])}</span>
              <span class="as-card-st as-st-${st.cls}">${esc(st.label)}</span>
              <span class="cap as-card-sp">${srcNames(S, c.source)}</span>
            </div>`;
  }).join('\n')}
          </div>` : `          <p class="p-hole">No Indian casualty, evacuation or damage figure has been
            reported in a form this page can attribute.</p>`}
        </div>
        <div class="as-ind-half">
          <p class="lbl as-ind-h as-ind-h-w">Potential, and under watch</p>
          ${e.india_relevance_note ? `<p class="body as-ind-t">${esc(e.india_relevance_note)}</p>` : ''}
          ${ctx?.india_watch ? `<p class="body as-ind-t"><b>Downstream:</b> ${esc(ctx.india_watch)}</p>` : ''}
          ${ctx?.india_relevance ? `<p class="cap">${esc(ctx.india_relevance)}</p>` : ''}
          <p class="cap"><b>This column is a mechanism, not an outcome.</b> These are the basins and
            districts the hazard reaches when it reaches India. Nothing here is a report that it has.</p>
        </div>
      </div>
    </div>`;
}

/* ═══ SOURCES ═════════════════════════════════════════════════════════════
   ★ COUNTED IN THE OPEN, LISTED BEHIND A CLICK. The old page put twenty-four
   news headlines into the reading flow. The rigour was never the list's
   position; it was the list's existence and its tiering. */
export function sourcesBand(e) {
  const S = e.sourceIndex;
  const all = Object.values(S);
  const byTier = {
    official: all.filter((s) => s.tier === 'official'),
    scientific: all.filter((s) => s.tier === 'scientific'),
    news: all.filter((s) => s.tier === 'news'),
  };
  const list = (rows) => `<ul class="as-srcs">
${rows.map((s) => `            <li class="as-src">
              ${s.url ? `<a class="as-src-t" href="${esc(s.url)}">${esc(s.title)}</a>` : `<span class="as-src-t">${esc(s.title)}</span>`}
              <span class="cap as-src-p">${esc(s.publisher)}${s.published ? ` &middot; ${esc(s.published)}` : ''}</span>
            </li>`).join('\n')}
          </ul>`;

  const counts = [
    [byTier.official.length, 'official alert', 'official alerts'],
    [byTier.scientific.length, 'scientific source', 'scientific sources'],
    [byTier.news.length, 'published report', 'published reports'],
  ].filter(([n]) => n > 0);

  return `${opener('sources', 'Data and sources', 'Everything this page is built from, counted by kind. Nothing here is quoted in this site’s own voice.')}
    <div class="wrap">
      <div class="as-scount">
${counts.map(([n, one, many]) => `        <div class="as-scount-c">
          <span class="as-scount-v">${n0(n)}</span>
          <span class="lbl as-scount-l">${esc(n === 1 ? one : many)}</span>
        </div>`).join('\n')}
        <div class="as-scount-c">
          <span class="as-scount-v">${n0(e.corroboration.independent_publishers)}</span>
          <span class="lbl as-scount-l">independent publishers</span>
        </div>
      </div>
${disclose(`View all ${all.length} sources`,
    `${byTier.official.length ? `<p class="lbl as-src-h">Official</p>${list(byTier.official)}` : ''}
        ${byTier.scientific.length ? `<p class="lbl as-src-h">Scientific</p>${list(byTier.scientific)}` : ''}
        ${byTier.news.length ? `<p class="lbl as-src-h">Reported</p>${list(byTier.news)}` : ''}
        <p class="cap"><b>A headline is evidence that something was said.</b> It is never evidence
          that it is true &mdash; which is why every figure at the top of this page carries the outlet
          that printed it and, where they disagree, all of them.</p>`)}
${disclose('What this page does not know', `<ul class="as-unc">
${(e.uncertain || []).map((u) => `          <li>${esc(u)}</li>`).join('\n')}
        </ul>
        <p class="cap">Method: assembled automatically from ${n0(e.corroboration.items_read || 0)} items
          across ${n0(e.corroboration.independent_publishers)} publishers by
          <code>${esc(e.detector?.script || 'the detector')}</code>, which scored this event
          ${e.significance_score} against a publication threshold of ${e.detector?.threshold ?? '—'}.
          ${esc(e.detector?.note || '')}</p>`)}
      <p class="cap as-stamp">Feeds last read ${esc(istStamp(e.last_checked?.epochMs || e.last_updated.epochMs))},
        and re-read every 30 minutes.</p>
    </div>`;
}

/* ═══ G. VIMLENDU, ON THE RECORD ══════════════════════════════════════════
   ★ WHY THIS BAND IS LINKS AND NOT PROSE, and it is the same rule as
   everywhere else on this page pointed at a person instead of a number.
   Swechha's director is on television and on X about most of these events.
   The useful thing is therefore to SHOW THAT and hand the reader the actual
   item; the harmful thing would be to compose a paragraph of his position on a
   disaster he has not yet commented on, in his name, from a generator. So this
   band prints titles the platforms published, verbatim, each linked, and says
   nothing in his voice at all.

   ★ IT IS PLACED HERE, BEFORE THE HISTORY AND THE SCIENCE, ON PURPOSE.
   The instruction was a prominent section. Above the fold would displace the
   numbers, which are the thing a first-time visitor came for; below the
   precedents and the climate pack it would be the ninth screen. Directly after
   the timeline is the first point at which a reader knows what happened and is
   ready to hear who is saying what about it.

   ★ MATCHED BY HAZARD, AND IT DEGRADES BY SAYING SO.
   An event whose hazard has nothing tagged for it falls back to the general
   items and labels them as the wider record rather than passing them off as
   comment on this event. */
export function voiceBand(e, voice) {
  if (!voice?.items?.length) return null;
  const onHazard = voice.items.filter((i) => (i.hazards || []).includes(e.hazard));
  const general = voice.items.filter((i) => (i.hazards || []).includes('general'));
  const items = (onHazard.length ? onHazard : general).slice(0, 4);
  if (!items.length) return null;
  const specific = onHazard.length > 0;

  const KIND = {
    tv: 'Television', video: 'Video', talk: 'Talk', post: 'Post', essay: 'Written',
  };

  const person = voice.person || {};
  const channels = (voice.channels || []);

  return `${opener('voice', 'What Swechha says', specific
    ? `Vimlendu Jha has been on the record on this hazard before. These are the items themselves, not a summary of them &mdash; this page does not write anybody&rsquo;s opinion for them.`
    : `Vimlendu Jha on the wider subject. Nothing here is comment on this specific event, and it is not presented as though it were.`)}
    <div class="wrap">
      <div class="as-voice">
        <div class="as-voice-who">
          ${person.photo ? `<img class="as-voice-p" src="${esc(person.photo)}" alt="${esc(person.name)}"${imgDim(person.photo)} loading="lazy" decoding="async">` : ''}
          <p class="as-voice-n">${esc(person.name || 'Vimlendu Jha')}</p>
          <p class="cap as-voice-r">${esc(person.role || '')}</p>
          ${person.profile ? `<p style="margin:0"><a class="act as-voice-a" href="${esc(person.profile)}">Who he is ${ARROW}</a></p>` : ''}
          <p class="lbl as-voice-ch-h">Where he posts</p>
${channels.map((c) => `          <p class="as-voice-ch"><a class="lk" href="${esc(c.url)}">${esc(c.label)}</a>
            <span class="cap">${esc(c.handle)}${c.whose === 'organisation' ? ' &middot; the organisation&rsquo;s account' : ''}</span></p>`).join('\n')}
        </div>
        <div class="as-voice-list">
${items.map((i) => `          <a class="as-voice-i" href="${esc(i.url)}">
            <span class="lbl as-voice-k">${esc(KIND[i.kind] || 'Item')}${i.where ? ` <i class="as-sep">&middot;</i>${esc(i.where)}` : ''}${i.date ? ` <i class="as-sep">&middot;</i>${esc(i.date)}` : ''}</span>
            <span class="as-voice-t">${esc(i.title)}</span>
            ${i.note ? `<span class="cap as-voice-nt">${esc(i.note)}</span>` : ''}
          </a>`).join('\n')}
          <p class="cap as-voice-c">${specific
    ? 'Titles are the platforms&rsquo; own, verbatim. What he said is in the item; this page does not paraphrase it.'
    : 'These are on the subject, not on this event. When there is comment on this event it appears here in its place.'}</p>
        </div>
      </div>
    </div>`;
}

/* ═══ CSS ═════════════════════════════════════════════════════════════════
   ONLY WHAT HAS NO PRECEDENT. Everything this page can borrow, it borrows:
   `.wrap`, `.im-head`/`.d1`/`.lead` (opener), `.lbl`, `.cap`, `.body`,
   `.p-strip-in`/`.p-cell`, `.p-map`, `.p-tabs`, `.p-hole`, `.p-legend`,
   `.dx` (disclose), `.act`, `.lk`, `.sr` and the whole type scale arrive from
   situation-shell's own stylesheet, which every situation page already ships.
   So what is below is the six components that genuinely did not exist: the
   status pill, the metric card, the geography chain, the image wipe, the cause
   grid and the risk matrix.

   THE FOUR CONFIDENCE WORDS SHARE ONE RULE SET (`.as-st-*`) so that a
   Preliminary figure cannot come to look different in two places on one page —
   which is exactly how a reader stops noticing the difference between a
   confirmed count and a headline. */
export const AS_CSS = `
/* ── (a) THE HERO ─────────────────────────────────────────────────────── */
.as-hero{padding-top:clamp(18px,2.2vw,30px);padding-bottom:clamp(26px,3vw,44px)}
.as-head{display:flex;align-items:center;gap:12px 18px;flex-wrap:wrap;
  margin:clamp(14px,1.6vw,22px) 0 clamp(10px,1.2vw,16px)}
.as-kicker{color:var(--fg-3);margin:0}
.as-sep{font-style:normal;color:var(--fg-4,rgba(251,248,240,.42));margin:0 .45em}
.as-h1{font-size:clamp(34px,5.4vw,68px);line-height:1.02;letter-spacing:-.015em;
  margin:0 0 clamp(16px,1.8vw,26px);max-width:18ch;text-wrap:balance}

/* THE PILL. Three live words carry colour; two closed ones deliberately do
   not — a coloured dot on a finished event keeps asserting an urgency the site
   has itself decided is over. */
.as-pill{display:inline-flex;align-items:center;gap:8px;margin-left:auto;
  font-family:Archivo,system-ui,sans-serif;font-size:11px;letter-spacing:.1em;
  text-transform:uppercase;padding:6px 11px;border:1px solid currentColor;white-space:nowrap}
.as-pill i{font-style:normal;font-size:9px;line-height:1}
.as-pill-red{color:var(--red)}
.as-pill-red i{animation:as-pulse 2s ease-in-out infinite}
.as-pill-amber{color:var(--mustard-2)}
.as-pill-ochre{color:var(--fg-2)}
.as-pill-off{color:var(--fg-3);border-color:var(--hair)}
@keyframes as-pulse{0%,100%{opacity:1}50%{opacity:.28}}
@media (prefers-reduced-motion:reduce){.as-pill-red i{animation:none}}

/* OCCURRED AND LAST UPDATED, side by side, because the gap between them is
   itself information on a live page. */
.as-when{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(240px,100%),1fr));
  gap:1px;background:var(--hair-2);margin:clamp(14px,1.6vw,22px) 0 clamp(18px,2vw,28px)}
.as-when-c{background:var(--ground);padding:13px 15px}
.as-when-l{display:block;color:var(--fg-3);margin:0 0 5px}
.as-when-v{display:block;font-size:clamp(15px,1.2vw,18px);color:var(--fg);
  font-variant-numeric:tabular-nums}
.as-when-n{display:block;margin-top:5px;max-width:44ch}
.ce-t{font-variant-numeric:tabular-nums}

/* ── (b) THE METRIC CARDS. The page's whole reason for existing. ───────── */
.as-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(190px,100%),1fr));
  gap:1px;background:var(--hair-2);margin:0 0 clamp(14px,1.6vw,20px)}
.as-card{background:var(--ground);padding:clamp(14px,1.5vw,20px) clamp(13px,1.4vw,18px);
  display:flex;flex-direction:column;gap:0}
.as-card-v{font-size:clamp(38px,4.6vw,62px);line-height:.94;color:var(--red);
  font-variant-numeric:tabular-nums;letter-spacing:-.02em}
.as-card-in .as-card-v{color:var(--fg)}
.as-hedge{font-style:normal;font-size:.34em;letter-spacing:.06em;text-transform:uppercase;
  color:var(--fg-3);display:block;margin-bottom:.3em;font-family:Archivo,system-ui,sans-serif}
.as-card-l{display:block;color:var(--fg-2);margin-top:10px}
.as-card-st{display:inline-block;align-self:flex-start;margin-top:9px;
  font-family:Archivo,system-ui,sans-serif;font-size:9.5px;letter-spacing:.09em;
  text-transform:uppercase;padding:3px 7px;border:1px solid currentColor}
.as-card-sp{display:block;margin-top:8px;max-width:30ch}
.as-cards-sm .as-card-v{font-size:clamp(28px,3vw,40px)}
.as-cards-sm{background:var(--hair-2)}

/* THE FOUR CONFIDENCE WORDS, ONE RULE SET. */
.as-st,.as-card-st{font-style:normal}
.as-st{display:inline-block;font-family:Archivo,system-ui,sans-serif;font-size:9.5px;
  letter-spacing:.09em;text-transform:uppercase;padding:2px 6px;border:1px solid currentColor;
  margin-right:7px}
.as-st-confirmed{color:var(--fg)}
.as-st-estimate{color:var(--fg-2)}
.as-st-media{color:var(--fg-3)}
.as-st-prelim{color:var(--mustard-2)}

.as-lede{font-size:clamp(15px,1.15vw,18px);line-height:1.55;color:var(--fg-2);
  max-width:58ch;margin:clamp(16px,1.8vw,24px) 0 clamp(16px,1.8vw,24px);
  border-left:2px solid var(--hair);padding-left:15px}
.as-lede-s{display:block;margin-top:.6em;color:var(--fg-3);font-size:13.5px;line-height:1.45}

/* THE LEDGER behind the cards. */
.as-led-p{max-width:62ch}
.as-led-h{color:var(--fg-2);margin:1.2em 0 .4em}
.as-led{list-style:none;padding:0;margin:0}
.as-led li{padding:5px 0;border-bottom:1px solid var(--hair-2);
  display:flex;gap:12px;flex-wrap:wrap;align-items:baseline}
.as-led li b{font-variant-numeric:tabular-nums;min-width:5.5em;color:var(--fg)}
.as-led li .cap{flex:1 1 20ch}

/* ── (c) WHERE. The map borrows .p-map/.p-map-s; only the marks are new. ─ */
.as-map{max-width:560px}
.as-m-ring{fill:none;stroke:var(--red);stroke-width:1.6;stroke-dasharray:4 3}
.as-m-ringc{fill:var(--red)}
.as-m-down{fill:var(--fg-2)}
.as-m-box{fill:none;stroke:var(--mustard);stroke-width:1;stroke-dasharray:2 3;opacity:.75}
.as-m-t{fill:var(--fg-3);font-family:Archivo,system-ui,sans-serif;font-size:9px;
  letter-spacing:.05em;text-transform:uppercase}
.as-m-t-o{fill:var(--red)}
.as-sw{display:inline-block;width:9px;height:9px;margin-right:8px;vertical-align:baseline}
.as-sw-o{border:1.5px solid var(--red);border-radius:50%}
.as-sw-d{background:var(--fg-2)}
.as-sw-b{border:1px dashed var(--mustard)}

/* ORIGIN → DOWNSTREAM, a chain and not a map. */
.as-chain{list-style:none;padding:0;margin:0 0 clamp(16px,1.8vw,24px)}
.as-chain-n{position:relative;padding:0 0 16px 22px;border-left:1px solid var(--hair)}
.as-chain-n:last-child{padding-bottom:0}
.as-chain-n::before{content:"";position:absolute;left:-4px;top:6px;width:7px;height:7px;
  background:var(--fg-3)}
.as-chain-n.is-start::before{background:var(--red);width:9px;height:9px;left:-5px}
.as-chain-n.is-end::before{background:var(--mustard)}
.as-chain-r{display:block;color:var(--fg-3);margin-bottom:2px}
.as-chain-t{display:block;font-size:clamp(15px,1.15vw,17.5px);color:var(--fg);line-height:1.35}
.as-rel{margin:0;color:var(--fg-2);line-height:1.55;border-left:2px solid var(--hair);padding-left:15px}
.as-rel-l{display:block;color:var(--fg-3);margin-bottom:.3em}

/* ── (d) DAMAGE ───────────────────────────────────────────────────────── */
.as-dmg{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(170px,100%),1fr));
  gap:1px;background:var(--hair-2)}
.as-dmg-c{background:var(--ground);padding:14px 15px}
.as-dmg-i{display:block;font-size:19px;line-height:1;margin-bottom:9px}
.as-dmg-v{display:block;font-size:clamp(24px,2.4vw,34px);line-height:1;color:var(--fg);
  font-variant-numeric:tabular-nums}
.as-dmg-v i{font-style:normal;font-size:.42em;color:var(--fg-3);margin-left:.3em}
.as-dmg-l{display:block;color:var(--fg-2);margin-top:7px}
.as-dmg-s{display:block;margin-top:6px}

/* ── (e) CAUSE ────────────────────────────────────────────────────────── */
.as-causes{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(220px,100%),1fr));
  gap:1px;background:var(--hair-2);margin:0 0 clamp(14px,1.6vw,20px)}
.as-cause{background:var(--ground);padding:14px 15px;border-top:2px solid var(--hair-2)}
.as-cause-confirmed{border-top-color:var(--fg)}
.as-cause-likely{border-top-color:var(--mustard)}
.as-cause-invest{border-top-color:var(--red)}
.as-cause-none{border-top-color:var(--hair-2)}
.as-cause-st{display:block;font-family:Archivo,system-ui,sans-serif;font-size:9.5px;
  letter-spacing:.09em;text-transform:uppercase;color:var(--fg-3);margin-bottom:9px}
.as-cause-invest .as-cause-st{color:var(--red)}
.as-cause-likely .as-cause-st{color:var(--mustard-2)}
.as-cause-confirmed .as-cause-st{color:var(--fg)}
.as-cause-t{display:block;font-size:clamp(15px,1.2vw,18px);line-height:1.3;color:var(--fg)}
.as-cause-n{display:block;margin-top:7px}
.as-how{margin:0}
.as-how dt{font-family:Archivo,system-ui,sans-serif;font-size:11px;letter-spacing:.07em;
  text-transform:uppercase;color:var(--fg-2);margin:1.1em 0 .3em}
.as-how dd{margin:0;max-width:62ch;line-height:1.55;color:var(--fg-2)}
.as-how-h{color:var(--fg-2);margin:1.4em 0 .5em}

/* ── (f) EARTH OBSERVATION ────────────────────────────────────────────── */
.as-eo-two{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(280px,100%),1fr));
  gap:clamp(14px,1.6vw,22px)}
.as-eo-f{margin:0}
.as-eo-i{display:block;width:100%;height:auto;border:1px solid var(--hair-2)}
.as-eo-c{display:block;margin-top:9px;max-width:52ch}
.as-eo-k{max-width:66ch;margin:12px 0 0}
.as-eo-fr,.as-eo-at{max-width:74ch;margin:14px 0 0}
.as-eo-leg p{margin:0 0 .9em}
.as-eo-pend{border-top:2px solid var(--mustard);padding-top:14px;max-width:66ch}
.as-eo-pend-l{color:var(--mustard-2);margin:0 0 .5em}
.as-eo-pend-t{font-size:clamp(15px,1.2vw,18px);line-height:1.55;color:var(--fg);margin:0 0 .8em}

/* THE WIPE. One range input drives one CSS variable; with no JavaScript the
   after frame simply sits at fifty per cent and both images are still visible
   and still captioned, which is the right degradation for a comparison. */
.as-cmp{position:relative;max-width:100%;line-height:0;border:1px solid var(--hair-2);
  overflow:hidden;touch-action:pan-y}
.as-cmp img{display:block;width:100%;height:auto}
.as-cmp-a{position:absolute;inset:0;width:var(--x,50%);overflow:hidden}
.as-cmp-a img{width:calc(100% / (var(--x,50%) / 100%));max-width:none}
.as-cmp-h{position:absolute;top:0;bottom:0;left:var(--x,50%);width:2px;background:var(--fg);
  pointer-events:none;transform:translateX(-1px)}
.as-cmp-h::after{content:"";position:absolute;top:50%;left:50%;width:34px;height:34px;
  transform:translate(-50%,-50%);border:2px solid var(--fg);border-radius:50%;
  background:rgba(13,13,11,.55)}
.as-cmp-lb,.as-cmp-la{position:absolute;bottom:10px;color:var(--fg);background:rgba(13,13,11,.72);
  padding:5px 9px;line-height:1.2;pointer-events:none}
.as-cmp-lb{left:10px}
.as-cmp-la{right:10px}
/* THE RANGE COVERS THE WHOLE FRAME, not a 44px strip at the bottom, and the
   reason is that a range input jumps its thumb to wherever it is clicked — so
   stretched over the image, "click anywhere to wipe to there" and "drag to
   scrub" are the same one control, with real keyboard support and a real
   accessible name, and no drag handlers at all. */
.as-cmp-r{position:absolute;inset:0;width:100%;height:100%;margin:0;opacity:0;
  cursor:ew-resize}
.as-cmp-r:focus-visible{opacity:1;outline:2px solid var(--mustard);outline-offset:2px}

/* ── (g) THE TIMELINE ─────────────────────────────────────────────────── */
.as-tl{list-style:none;padding:0;margin:0 0 clamp(14px,1.6vw,20px);max-width:70ch}
.as-tl-i{position:relative;padding:0 0 clamp(16px,1.8vw,24px) 26px;border-left:1px solid var(--hair)}
.as-tl-i:last-child{border-left-color:transparent;padding-bottom:0}
.as-tl-i::before{content:"";position:absolute;left:-4.5px;top:5px;width:8px;height:8px;
  background:var(--fg-3)}
.as-tl-i.is-now::before{background:var(--red);width:10px;height:10px;left:-5.5px}
.as-tl-w{display:block;font-family:Archivo,system-ui,sans-serif;font-size:11px;
  letter-spacing:.07em;text-transform:uppercase;color:var(--red);margin-bottom:4px;
  font-variant-numeric:tabular-nums}
.as-tl-t{display:block;font-size:clamp(15px,1.15vw,17.5px);line-height:1.45;color:var(--fg)}
.as-tl-s{display:block;margin-top:4px}

/* ── (h) VIMLENDU ─────────────────────────────────────────────────────── */
.as-voice{display:grid;grid-template-columns:minmax(0,240px) minmax(0,1fr);
  gap:clamp(20px,2.6vw,44px);align-items:start}
.as-voice-p{display:block;width:88px;height:88px;object-fit:cover;
  filter:grayscale(1) contrast(1.06);margin:0 0 12px}
.as-voice-n{font-family:Newsreader,Georgia,serif;font-size:clamp(19px,1.6vw,23px);
  line-height:1.2;margin:0 0 3px;color:var(--fg)}
.as-voice-r{margin:0 0 12px;max-width:26ch}
.as-voice-a{margin-bottom:1.4em;display:inline-block}
.as-voice-ch-h{color:var(--fg-3);margin:1.4em 0 .5em}
.as-voice-ch{margin:0 0 .7em;line-height:1.35}
.as-voice-ch .cap{display:block;margin-top:2px}
.as-voice-list{display:flex;flex-direction:column;gap:1px;background:var(--hair-2)}
.as-voice-i{background:var(--ground);padding:14px 16px;text-decoration:none;color:inherit;display:block}
.as-voice-i:hover{background:var(--ground-2)}
.as-voice-k{display:block;color:var(--fg-3);margin-bottom:6px}
.as-voice-t{display:block;font-family:Newsreader,Georgia,serif;
  font-size:clamp(16px,1.35vw,20px);line-height:1.3;color:var(--fg);max-width:52ch}
.as-voice-i:hover .as-voice-t{color:var(--mustard-2)}
.as-voice-nt{display:block;margin-top:6px;max-width:52ch}
.as-voice-c{background:var(--ground);padding:12px 16px;margin:0;max-width:58ch}

/* ── (i) PRECEDENTS ───────────────────────────────────────────────────── */
.as-precs{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(190px,100%),1fr));
  gap:1px;background:var(--hair-2);margin:0 0 clamp(14px,1.6vw,20px)}
.as-prec{background:var(--ground);padding:14px 15px}
.as-prec-y{display:block;font-family:Archivo,system-ui,sans-serif;font-size:11px;
  letter-spacing:.09em;color:var(--fg-3);margin-bottom:6px;font-variant-numeric:tabular-nums}
.as-prec-p{display:block;font-family:Newsreader,Georgia,serif;font-size:16px;line-height:1.25;
  color:var(--fg);margin-bottom:12px;min-height:2.5em}
.as-prec-v{display:block;font-size:clamp(24px,2.2vw,32px);line-height:1;color:var(--fg-2);
  font-variant-numeric:tabular-nums}
.as-prec-l{display:block;color:var(--fg-2);margin-top:5px}
.as-prec-n{display:block;margin-top:7px;max-width:32ch}
.as-prec-s{display:block;margin-top:7px}

/* ── (j) RISK ─────────────────────────────────────────────────────────── */
.as-sub{color:var(--fg-3);margin:clamp(6px,.8vw,10px) 0 clamp(10px,1.1vw,14px)}
.as-risk{display:flex;flex-direction:column;gap:1px;background:var(--hair-2);
  margin:0 0 clamp(20px,2.2vw,32px)}
.as-risk-r{background:var(--ground);padding:12px 15px;display:grid;
  grid-template-columns:minmax(0,7.5em) minmax(0,1fr);gap:4px 16px;align-items:baseline}
.as-risk-l{font-family:Archivo,system-ui,sans-serif;font-size:10px;letter-spacing:.1em;
  text-transform:uppercase;color:var(--fg-3);border-left:3px solid currentColor;padding-left:9px}
.as-risk-critical .as-risk-l{color:var(--red)}
.as-risk-high .as-risk-l{color:var(--red)}
.as-risk-moderate .as-risk-l{color:var(--mustard-2)}
.as-risk-low .as-risk-l{color:var(--fg-2)}
.as-risk-na .as-risk-l{color:var(--fg-3);border-left-color:var(--hair-2)}
.as-risk-t{font-size:clamp(14.5px,1.1vw,17px);line-height:1.45;color:var(--fg)}
.as-risk-w{grid-column:2;display:block;max-width:60ch}

/* ── (k) THE CLIMATE SIGNAL ───────────────────────────────────────────── */
.as-sig{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(200px,100%),1fr));
  gap:1px;background:var(--hair-2);margin:0 0 clamp(20px,2.2vw,32px)}
.as-sig-c{background:var(--ground);padding:15px 16px}
.as-sig-v{display:block;font-size:clamp(26px,2.7vw,38px);line-height:1;color:var(--fg);
  font-variant-numeric:tabular-nums;letter-spacing:-.01em}
.as-sig-v i{font-style:normal;font-size:.4em;color:var(--fg-3);margin-left:.3em}
.as-sig-l{display:block;color:var(--fg-2);margin-top:9px;max-width:26ch}
.as-sig-s{display:block;margin-top:8px}
.as-attr{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(280px,100%),1fr));
  gap:clamp(16px,2vw,34px);margin:0 0 clamp(16px,1.8vw,24px)}
.as-attr-c{border-top:2px solid var(--hair);padding-top:13px}
.as-attr-can{border-top-color:var(--fg-2)}
.as-attr-cant{border-top-color:var(--red)}
.as-attr-h{margin:0 0 .5em;color:var(--fg-3)}
.as-attr-can .as-attr-h{color:var(--fg-2)}
.as-attr-cant .as-attr-h{color:var(--red)}
.as-attr-t{font-size:clamp(14.5px,1.1vw,17px);line-height:1.55;color:var(--fg-2);
  max-width:52ch;margin:0}

/* ── (l) INDIA ────────────────────────────────────────────────────────── */
.as-ind{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(300px,100%),1fr));
  gap:clamp(18px,2.2vw,40px)}
.as-ind-h{margin:0 0 .8em;border-top:2px solid var(--hair);padding-top:11px}
.as-ind-h-c{border-top-color:var(--fg-2);color:var(--fg-2)}
.as-ind-h-w{border-top-color:var(--mustard);color:var(--mustard-2)}
.as-ind-t{margin:0 0 .9em;line-height:1.55;color:var(--fg-2)}

/* ── (m) SOURCES ──────────────────────────────────────────────────────── */
.as-scount{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(150px,100%),1fr));
  gap:1px;background:var(--hair-2);margin:0 0 clamp(16px,1.8vw,24px)}
.as-scount-c{background:var(--ground);padding:13px 15px}
.as-scount-v{display:block;font-size:clamp(24px,2.3vw,32px);line-height:1;color:var(--fg);
  font-variant-numeric:tabular-nums}
.as-scount-l{display:block;color:var(--fg-2);margin-top:6px}
.as-srcs{list-style:none;padding:0;margin:0 0 1.2em}
.as-src{padding:8px 0;border-bottom:1px solid var(--hair-2)}
.as-src-t{display:block;color:var(--fg);text-decoration:none;line-height:1.4;max-width:70ch}
a.as-src-t:hover{color:var(--mustard-2)}
.as-src-p{display:block;margin-top:3px}
.as-src-h{color:var(--fg-2);margin:1.3em 0 .4em}
.as-unc{margin:0 0 1em;max-width:66ch}
.as-unc li{margin-bottom:.6em;line-height:1.5;color:var(--fg-2)}
.as-stamp{margin-top:clamp(16px,1.8vw,24px)}

/* ── PAPER BANDS. Two of these bands sit on the light ground, and every
      token above that names a dark foreground has to flip. ───────────── */
.paper .as-card,.paper .as-when-c,.paper .as-dmg-c,.paper .as-cause,.paper .as-prec,
.paper .as-risk-r,.paper .as-sig-c,.paper .as-scount-c,.paper .as-voice-i,
.paper .as-voice-c{background:var(--paper)}
.paper .as-cards,.paper .as-when,.paper .as-dmg,.paper .as-causes,.paper .as-precs,
.paper .as-risk,.paper .as-sig,.paper .as-scount,.paper .as-voice-list{background:var(--rule-2)}
.paper .as-card-v{color:var(--red-ink)}
.paper .as-card-in .as-card-v,.paper .as-dmg-v,.paper .as-sig-v,.paper .as-scount-v,
.paper .as-prec-p,.paper .as-cause-t,.paper .as-risk-t,.paper .as-tl-t,.paper .as-when-v,
.paper .as-voice-t,.paper .as-voice-n,.paper .as-h1{color:var(--ink)}
.paper .as-card-l,.paper .as-dmg-l,.paper .as-sig-l,.paper .as-scount-l,.paper .as-prec-l,
.paper .as-attr-t,.paper .as-ind-t,.paper .as-lede,.paper .as-chain-t{color:var(--ink-2)}
.paper .as-kicker,.paper .as-hedge,.paper .as-cause-st,.paper .as-risk-l,
.paper .as-chain-r,.paper .as-when-l{color:var(--ink-3)}
.paper .as-st-confirmed{color:var(--ink)}
.paper .as-st-estimate{color:var(--ink-2)}
.paper .as-st-media{color:var(--ink-3)}
.paper .as-st-prelim{color:var(--mustard-ink)}
.paper .as-tl-w{color:var(--red-ink)}
.paper .as-when,.paper .as-lede{border-color:var(--rule-2)}

/* ── PHONE. Measured at 375 wide: every grid above is auto-fit with a
      min-width at or under 300px, so all of them collapse to one column on
      their own. What does NOT collapse on its own is the two-column voice
      band and the readout scale, so those are the only overrides. ────── */
@media (max-width:640px){
  .as-voice{grid-template-columns:1fr;gap:clamp(18px,4vw,26px)}
  .as-voice-p{width:64px;height:64px}
  /* EVERY PIXEL ABOVE THE FIRST FIGURE IS MEASURED AGAINST 635. The kicker
     wraps to two lines at this width and the pill takes a row of its own, so
     the heading gives back what it can without losing its scale. */
  .as-h1{font-size:clamp(28px,8.4vw,40px);max-width:none;
    margin-bottom:clamp(12px,3.2vw,18px)}
  .as-hero{padding-top:14px}
  .as-head{margin:10px 0 10px}
  .as-when-c{padding:11px 13px}
  .as-card-v{font-size:clamp(32px,10.5vw,44px)}
  .as-pill{margin-left:0}
  .as-risk-r{grid-template-columns:1fr;gap:6px}
  .as-risk-w{grid-column:1}
  .as-prec-p{min-height:0}
  .as-cmp-lb,.as-cmp-la{bottom:6px;font-size:9.5px;padding:4px 7px}
}
`;

/* ═══ THE WIPE, AND THE RELATIVE CLOCK ════════════════════════════════════
   ★ THE SLIDER IS ONE LINE OF STATE. The range input owns the value, the CSS
   variable owns the presentation, and there is no drag handling, no pointer
   capture and no touch special-casing — a range is already all of those, plus
   arrow keys, plus an accessible name. With JavaScript off it sits at 50% and
   both frames are visible and captioned, which is a working comparison rather
   than a broken widget.

   ★ THE CLOCK REWRITES ABSOLUTE TIMES TO RELATIVE ONES IN THE BROWSER, and
   never the other way round. The committed markup carries the instant, so the
   page's bytes do not move every minute and the repository's "the tree moved"
   gate stays green; the reader gets "6 minutes ago" with the absolute time in
   the title attribute. This is the one behaviour carried over unchanged from
   the board this page replaces, because it was right. */
export const AS_JS = `
(function(){
  var boxes = document.querySelectorAll('[data-cmp]');
  for (var i = 0; i < boxes.length; i++) (function(box){
    var r = box.querySelector('.as-cmp-r');
    var a = box.querySelector('.as-cmp-a');
    var h = box.querySelector('.as-cmp-h');
    if (!r || !a) return;
    function paint(){
      var x = r.value + '%';
      a.style.setProperty('--x', x);
      if (h) h.style.setProperty('--x', x);
      box.style.setProperty('--x', x);
    }
    r.addEventListener('input', paint);
    paint();
  })(boxes[i]);
})();

(function(){
  function rel(ms){
    var s = Math.max(0, Math.round((Date.now() - ms) / 1000));
    if (s < 90) return 'just now';
    var m = Math.round(s / 60);
    if (m < 90) return m + ' minute' + (m === 1 ? '' : 's') + ' ago';
    var hh = Math.round(m / 60);
    if (hh < 36) return hh + ' hour' + (hh === 1 ? '' : 's') + ' ago';
    var d = Math.round(hh / 24);
    return d + ' day' + (d === 1 ? '' : 's') + ' ago';
  }
  function go(){
    var t = document.getElementsByClassName('ce-t');
    for (var i = 0; i < t.length; i++) {
      var iso = t[i].getAttribute('datetime');
      if (!iso) continue;
      var ms = Date.parse(iso);
      if (!ms) continue;
      t[i].textContent = rel(ms);
    }
  }
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', go, {once:true});
  else go();
})();
`;
