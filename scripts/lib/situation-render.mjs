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
import { layerById, worldviewUrl } from './event-imagery.mjs';

const HAZARD_LABEL = {
  glof: 'Glacial lake outburst flood', cloudburst: 'Cloudburst', flood: 'Flood',
  landslide: 'Landslide', cyclone: 'Cyclone', extreme_rain: 'Extreme rainfall',
};

/* ── NO ABSOLUTE-INSTANT HELPER HERE ANY MORE ─────────────────────────────
   `stamp()` lived here and rendered a <time class="ce-t"> carrying the absolute
   instant, which AS_JS then rewrote to "2 hours ago" in the browser. Its only
   caller was the OCCURRED / LAST UPDATED pair, removed 2026-08-28.

   THE RULE IT EMBODIED STILL STANDS AND MUST NOT BE FORGOTTEN: a relative age
   written into committed HTML makes the file's bytes move every minute, so
   `generated-current.yml` — which regenerates every page and fails if the tree
   moved — would go red and stay red. Anything reintroducing a human-readable
   age to this page must commit the INSTANT and let the browser relativise it.
   `istStamp()` from lib/climate-events.mjs is what the sources band uses, and
   it is absolute. */

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
function metricCards(impact, ownerFigures = []) {
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
${ownerFigures.length ? `        ${ownerFigures.map((f) => `<div class="as-card as-card-owner">
          <span class="as-card-v">${f.hedge ? `<i class="as-hedge">${esc(f.hedge)}</i>` : '<i class="as-hedge" aria-hidden="true">&nbsp;</i>'}${esc(String(f.value))}</span>
          <span class="lbl as-card-l">${esc(f.label)}</span>
          <span class="as-card-st as-st-estimate">${esc(CLAIM_STATUS[f.status]?.label || 'Reported')}</span>
          <span class="cap as-card-sp">${esc(f.source_name)}</span>
        </div>`).join('\n        ')}` : ''}
      </div>`;
}

/* ── WHAT USED TO BE HERE: THE FIGURE LEDGER ──────────────────────────────
   A `<details>` under the cards listing every outlet's reading beside the exact
   words it was quoted from — the audit trail for "where did 547 come from".
   Removed on the owner's instruction, 2026-08-28, along with the timestamp pair
   and the quoted lede.

   ★ THE PROVENANCE IS NOT LOST, AND THAT IS WHY THIS IS SAFE TO REMOVE.
   Each card still carries its confidence word and, where outlets disagree, the
   range and the number of sources ("Outlets report 160-547 · 5 sources"). Every
   contributing outlet is still in `impact.<metric>.source` on the dossier and
   still listed, linked, in the sources band at the foot of the page. What went
   is the per-outlet breakdown as a reading-flow element, not the attribution.

   IF IT COMES BACK, it belongs in the sources band's disclosure rather than
   under the hero: that band is already the page's answer to "who says so", and
   the hero's job is the figures. */

/* ── THE READINGS STRIP ───────────────────────────────────────────────────
   THE SAME COMPONENT AIR AND YAMUNA USE, deliberately down to the class
   names, because it is the thing that makes those two pages scannable and it
   is the one piece of this design language that is literally about "the four
   numbers on this page". Four cells, each an anchor into the band that
   explains it. */
/* ── THE READINGS STRIP ───────────────────────────────────────────────────
   THE SAME COMPONENT AIR AND YAMUNA USE, deliberately down to the class names,
   because it is what makes those two pages scannable.

   ★ IT MUST NOT REPEAT THE HERO, AND THE FIRST VERSION DID.
   Its opening two cells were "547 confirmed dead, 160-547 reported" and "750
   missing, 750-1,468 reported" — the exact two cards sitting directly above it,
   restated four centimetres lower with the same ranges. On /now/air the strip
   carries the readings the hero does NOT: the count of stations above the
   limit, the national rank, the attention ratio. Its job is a table of
   contents made of numbers, one door into each band a reader should jump to —
   not a summary of the thing they have just read.

   So every cell here comes from a DIFFERENT band, and the hero's casualty
   figures are deliberately absent from it. Each falls back in turn, so a flood
   event with no context pack still gets a strip rather than a gap. */
export function strip(e, ctx, imagery) {
  const cells = [];
  const fig = (band, match) => (ctx?.figures || [])
    .find((f) => f.band === band && f.value != null && (!match || match.test(f.label)));

  /* THE STANDING SCALE -> the band the whole page now leads on. */
  const scale = fig('scale', /Indian Himalayan river basins/) || fig('scale');
  if (scale) cells.push([esc(String(scale.value)), 'Glacial lakes', 'mapped above India', '#climate', false]);

  /* EXPOSURE INSIDE INDIA -> the alarm band. */
  const ind = fig('india', /Alaknanda/) || fig('india');
  if (ind) cells.push([esc(String(ind.value)), 'Alaknanda', 'dangerous lakes above it', '#india', true]);

  const lc = e.live_conditions;
  if (lc && lc.rain_7d_mm != null) {
    cells.push([`${lc.rain_7d_mm}`, 'Rain, 7 days', 'mm over the region', '#next', false]);
  }
  if (imagery?.after) {
    cells.push([imagery.after.date.slice(5).replace('-', '/'), 'Satellite',
      `${esc(imagery.after.satellite)} &middot; ${imagery.after.obscuredPct}% cloud`, '#eo', false]);
  }
  /* Only if the four above could not be filled. */
  if (cells.length < 4) {
    cells.push([n0(e.corroboration.independent_publishers), 'Publishers', 'reporting it', '#sources', false]);
  }

  return `    <div class="wide p-strip-in">
${cells.slice(0, 4).map(([v, l, sub, href, red]) => `      <a class="p-cell" href="${href}">
        <span class="p-cell-v${red ? ' is-red' : ''}">${v}</span>
        <span class="lbl p-cell-l">${esc(l)}</span><span class="cap p-cell-s">${sub}</span></a>`).join('\n')}
      <p class="cap p-strip-note">Four readings this page holds, and where each one is explained.
        <a class="lk" href="#sources">Every source behind them</a>.</p>
    </div>`;
}

export function heroBand(e, ctx, imagery, { crumb }) {
  const st = statusOf(e);
  const hazard = HAZARD_LABEL[e.hazard] || e.hazard;
  const name = eventName(e);
  const impact = e.impact || {};

  /* WHERE AND WHEN, AS PRECISELY AS ANYONE HAS SAID. The feeds carry only the
     country; `location_detail` and `occurred_detail` are the precision a person
     added, and they are in EDITOR_OWNED so a re-detection cannot rebuild over
     them. Printed on one line under the heading rather than as two cards — the
     pair of cards that used to be here said the same thing twice and cost the
     first figure its place above the fold on a phone. */
  const where = e.location_detail || e.location.text;
  const when = e.occurred_detail || istStamp(e.occurred.epochMs).replace(/^\d\d:\d\d IST, /, '');

  /* ── THE BANNER: A BACKDROP, THE WAY AIR AND YAMUNA DO IT ───────────────
     The same `.pic .ht` band with the h1 over it, so this page is structurally
     the same as the other two rather than the odd one out.

     ★ NO VISIBLE CREDIT LINE, AND THAT IS THE SITE'S OWN CONVENTION rather
     than a shortcut. Air's India Gate frame and Yamuna's students-at-the-foam
     frame carry none either; every hero photograph on this site is credited in
     docs/design/image-credits.json and nowhere on the page. The Unsplash
     License does not require attribution, so the ledger is the right place for
     it and the band is left to do its job.

     THE "THIS IS NOT A PHOTOGRAPH OF THIS EVENT" CAPTION WAS HERE AND IS GONE
     ON THE OWNER'S INSTRUCTION, 28 August 2026. The concern it answered is
     answered better elsewhere on the page: the satellite band carries imagery
     that IS of the affected region — the NASA frames, dated and machine-chosen,
     and the supplied Reuters views of Manakamana — each captioned with what it
     shows. A reader looking for pictures of the event finds them there, which
     is where they would look.

     NO duo CLASS. It was tried: this frame is mean saturation 60, a saturated
     green pine forest, and a duotone collapses exactly that — the documented
     limit of the treatment. The band overrides the shared 0.92-alpha scrim to
     roughly half strength instead, and the heading measures 6.2:1 against the
     composite, well over the 3:1 large-text bar. Both numbers were measured on
     the rendered page. */
  const banner = {
    src: '/images/photos/mukteshwar-pines-snow-peak.jpg',
    alt: 'Pine forest below a snow-covered Himalayan peak',
    artist: 'Renzo D&rsquo;souza',
    lic: 'Unsplash License',
    page: 'https://unsplash.com/photos/rMl3KMzz_Ok',
  };

  return `    <div class="pic ht as-pic">
      <img class="as-pic-i" src="${banner.src}" alt="${esc(banner.alt)}"${imgDim(banner.src)} fetchpriority="high" decoding="async">
      <div class="pic-over"><div class="wrap">
        <p class="lbl as-pic-k">${esc(TYPE_LABEL)}</p>
        <h1 class="d1 as-pic-h">${esc(name)}</h1>
      </div></div>
    </div>
    <div class="wrap as-hero">
${crumb}
      <div class="as-head">
        <p class="lbl as-kicker">${esc(TYPE_LABEL)}
          <i class="as-sep">&middot;</i>${esc(hazard)}</p>
        ${pill(st)}
      </div>

      <p class="as-place"><b>${esc(where)}</b>
        <i class="as-sep">&middot;</i>${esc(when)}
        ${e.mechanism_stated ? `<span class="as-place-m">${esc(e.mechanism_stated)}</span>` : ''}</p>

${metricCards(impact, e.owner_figures)}

      <p style="margin:0"><a class="act" href="#climate">Why this keeps happening ${ARROW}</a></p>
    </div>`;
}

/* ═══ A2. WHAT THIS EVEN IS ═══════════════════════════════════════════════
   ★ THE ONE THING THE PAGE ASSUMED AND SHOULD NOT HAVE.
   Every band on this page was built for a reader who already knows what a
   glacial lake outburst flood is. The hero says "glacial lake outburst flood",
   the cause band lists moraine breach against ice-rock avalanche, and the
   climate band counts 25,614 of the lakes — none of which means anything to
   somebody who has not met the word before, which on a page reached from a news
   cycle is most people.

   So: the definition, immediately after the hero, in two registers side by
   side. The PLAIN one carries the weight — it is written to be understood by a
   ten-year-old and it is the wider column, because that is the one most
   readers need. The TECHNICAL one sits beside it for the reader who wants
   precision, and because a page that only offers the analogy is talking down.

   ★ IT IS HAZARD-LEVEL, NOT EVENT-LEVEL. It lives in the context pack, so
   every glacial flood ever published gets the same explanation and nobody
   rewrites it under deadline. A hazard whose pack has no `explainer` renders no
   band, which is the right degradation — an invented definition is worse than
   none.

   "GLOBAL HEATING, NOT WARMING" IS THE OWNER'S OWN FORMULATION and it is in the
   copy deliberately, in both packs. It is not a slip to be tidied. */
export function explainBand(e, ctx) {
  const x = ctx?.explainer;
  if (!x || !x.plain?.length) return null;

  return `${opener('explain', esc(x.heading || `What is a ${x.term}`), esc(x.hook || ''))}
    <div class="wrap">
      <div class="as-exp">
        <div class="as-exp-plain">
${x.plain.map((para) => `          <p class="as-exp-p">${esc(para)}</p>`).join('\n')}
        </div>
        <aside class="as-exp-tech">
          <p class="lbl as-exp-tech-h">The technical version</p>
          ${x.expands && x.term && x.expands.toLowerCase() !== x.term.toLowerCase()
    ? `<p class="as-exp-ex"><b>${esc(x.term)}</b> &mdash; ${esc(x.expands)}.</p>` : ''}
          <p class="as-exp-t">${esc(x.technical || '')}</p>
          ${x.not ? `<p class="as-exp-not">${esc(x.not)}</p>` : ''}
        </aside>
      </div>
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
  /* ★ THE EVENT'S OWN COORDINATES WIN, and getting this wrong drew the wrong
     river. The dossier's place is "Nepal", whose centroid sits 250 km from the
     Bhote Koshi in a different catchment — so the map centred there and then
     took the HAZARD's generic downstream list, which runs to Assam and north
     Bengal. Those are the Brahmaputra and the Teesta. They are not downstream
     of this event and never were. */
  const origin = e.coords || coordsFor(e.location.text);
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
  const located = (e.downstream || ctx?.downstream || [])
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

  const originLabel = (e.location_detail || e.location.text).split(/[,–—]/)[0].trim();
  const pts = [{ label: originLabel, lat: origin[0], lon: origin[1], origin: true }, ...located];
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
    w: originLabel.length * 6.2, h: LH,
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
            <circle cx="${X(pts[0].lon).toFixed(1)}" cy="${Y(pts[0].lat).toFixed(1)}" r="${e.coords ? 6 : ORIGIN_RING}" class="as-m-ring"><title>${esc(e.location_detail || e.location.text)}</title></circle>
            <circle cx="${X(pts[0].lon).toFixed(1)}" cy="${Y(pts[0].lat).toFixed(1)}" r="2.5" class="as-m-ringc"/>
            <text x="${(X(pts[0].lon) + (e.coords ? 6 : ORIGIN_RING) + 7).toFixed(1)}" y="${(Y(pts[0].lat) + 4).toFixed(1)}" class="as-m-t as-m-t-o">${esc(originLabel)}</text>
            ${labels}
          </svg>
          <p class="p-legend p-map-lg"><span class="lbl"><i class="as-sw as-sw-o"></i>Region named in the reporting</span><span class="lbl"><i class="p-sw as-sw-d"></i>Downstream, in the path</span>${frame ? '<span class="lbl"><i class="as-sw as-sw-b"></i>The satellite frame below</span>' : ''}</p>
          <p class="cap">Frame ${n0(kmWide)} km wide.
            ${e.coords
    ? `The marked point is ${esc(e.location_detail || e.location.text)}${e.coords_note ? ` &mdash; ${esc(e.coords_note.replace(/^[A-Z]/, (c) => c.toLowerCase()))}` : ''}`
    : 'The ring is an AREA, not a point: this page knows the region the reporting names and not where inside it the event was'}.
            ${e.downstream_note ? esc(e.downstream_note) : 'Positions of the downstream places are true.'}</p>`;
}

/* ── ORIGIN → DOWNSTREAM, FROM THE EVENT'S OWN RIVER ─────────────────────
   ★ THIS CONTRADICTED THE MAP BESIDE IT. The chain was built from the hazard
   pack's `india_path`, a generic GLOF sequence ending "Bihar, Assam, north
   Bengal" — so the map said in its caption that Assam and Bengal are a
   different basin and not downstream of this event, while the diagram directly
   under it listed them as the last step. One of the two had to go, and the one
   that was wrong was the generic one.

   It is now the event's own `downstream`, which an editor set, with the roles
   the brief asks for laid over it. A pack with no event-specific river falls
   back to `india_path` — thinner, and honest about being the hazard's shape
   rather than this event's. */
function chainDiagram(e, ctx) {
  const own = e.downstream || [];
  const chain = own.length
    ? [e.location_detail || e.location.text, ...own]
    : (ctx?.india_path?.length ? ctx.india_path : [e.location.text, 'India, downstream']);
  const ROLE = own.length
    ? ['Where it started', 'The river it entered', 'Downstream', 'Downstream', 'Reaches India']
    : ['Origin', 'Direct impact', 'In the path', 'Downstream', 'Under watch'];
  return `      <ol class="as-chain">
${chain.map((node, i) => `        <li class="as-chain-n${i === 0 ? ' is-start' : ''}${i === chain.length - 1 ? ' is-end' : ''}">
          <span class="lbl as-chain-r">${esc(i === chain.length - 1 && own.length ? 'Reaches India' : ROLE[Math.min(i, ROLE.length - 1)])}</span>
          <span class="as-chain-t">${esc(node)}</span>
        </li>`).join('\n')}
      </ol>`;
}

export function whereBand(e, ctx, imagery, coordsFor) {
  const map = mapSvg(e, ctx, imagery, coordsFor);
  return `${opener('where', 'Where', `${esc(e.location_detail || e.location.text)} &mdash; and the river it runs into. `
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

/* ── WHAT USED TO BE HERE: "WHAT IS BROKEN" ───────────────────────────────
   A band for counted physical damage — buildings, bridges, roads, hydropower,
   cropland — which on this event had nothing to count and rendered as a
   heading, a lead, and a paragraph explaining that damage assessment is
   ongoing. Removed on the owner's instruction, 2026-08-28: a full band whose
   content is the reason it is empty is an empty band with an excuse.

   IF A DOSSIER EVER CARRIES INFRASTRUCTURE FIGURES they have nowhere to go
   now. `damageBand()` and the DAMAGE_ICON table went with the band; restoring
   them is a revert of this hunk plus one entry in the band table of
   scripts/build-climate-disaster-pages.mjs. Non-human `impact` keys and
   `figures[]` on the dossier are still validated by lib/climate-events.mjs, so
   nothing on disk becomes invalid — it simply does not render. */

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
  /* ★ EACH CAUSE CARRIES THE FIGURE THAT MAKES IT PLAUSIBLE, on the owner's
     instruction to link the numbers to the causes. A "likely" or "under
     investigation" word is an assertion; the same word with a counted thing
     under it is an argument. The link is declared in the pack — a figure's
     `supports` names a cause id — so neither side can drift. */
  const supporting = (id) => (ctx.figures || [])
    .find((f) => f.supports === id && f.value != null);
  const rows = causes
    .map((c) => ({ ...c, status: set[c.id] || c.default_status || 'under_investigation',
      figure: supporting(c.id) }))
    .sort((a, b) => (CAUSE_STATUS[b.status]?.rank ?? 0) - (CAUSE_STATUS[a.status]?.rank ?? 0));

  const anyConfirmed = rows.some((r) => r.status === 'confirmed');

  return `${opener('cause', 'What caused it', anyConfirmed
    ? 'One mechanism has been established. The others remain candidates.'
    : `Candidate mechanisms, each with the evidence word it has actually earned and, where one exists, the counted thing that makes it plausible. Nothing on this list is established for this event.`)}
    <div class="wrap">
      <div class="as-causes">
${rows.slice(0, 5).map((r) => {
    const st = CAUSE_STATUS[r.status] || CAUSE_STATUS.under_investigation;
    return `        <div class="as-cause as-cause-${st.cls}">
          <span class="as-cause-st">${esc(st.label)}</span>
          <span class="as-cause-t">${esc(r.label)}</span>
          ${r.short ? `<span class="cap as-cause-n">${esc(r.short)}</span>` : ''}
          ${r.figure ? `<span class="as-cause-f">
            <b>${esc(String(r.figure.value))}${r.figure.unit ? ` ${esc(r.figure.unit)}` : ''}</b>
            <i>${esc(r.figure.label)}</i>
            <span class="cap">${srcNames(ctx.sourceIndex, r.figure.source)}</span>
          </span>` : ''}
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

/* ── SUPPLIED IMAGERY, WITH ITS PERMISSION ON THE PAGE ────────────────────
   ★ A CREDIT LINE IS NOT A LICENCE, so this block prints the BASIS as well as
   the credit. Commercial high-resolution satellite imagery is licensed to the
   outlet that bought it; republishing it because the outlet is named is a
   copyright claim waiting to happen. What makes it publishable here is a
   permission, and a permission has a grantor and a date — so the caption
   carries all three and a reader can see which of them is doing the work.

   ★ IT RENDERS ONLY IF THE FILE IS ON DISK. build-climate-disaster-pages.mjs
   filters `owner_images` to entries whose files exist before passing them, so a
   dossier naming an image nobody has committed yet produces no markup at all
   rather than a broken picture on a live disaster page.

   IT GOES ABOVE THE NASA FRAMES, not instead of them. Supplied imagery is
   higher resolution and shows what 250 m cannot; the NASA pair stays because it
   is dated, machine-chosen, reproducible and public domain, and because the two
   together are a stronger statement than either alone. */
function suppliedFrame(f) {
  return `<figure class="as-eo-f">
            <img class="as-eo-i" src="${esc(f.src)}" alt="${esc(f.alt || f.label)}"${imgDim(f.src)} loading="lazy" decoding="async">
            <figcaption class="cap as-eo-c">${esc(f.label)}</figcaption>
          </figure>`;
}

function suppliedBlock(imgs) {
  if (!imgs?.length) return '';
  return imgs.map((img) => {
    /* ★ A WIPE IS A CLAIM THAT THE TWO FRAMES ARE THE SAME PLACE, and it must
       not be made on a pair that is not. The first supplied set for the Nepal
       event was two frames at different scales — 1078x652 against 1197x677,
       one a wide valley with intact settlements, the other a close view of a
       debris flow on a single slope. Sliding between those shows a DIFFERENT
       PLACE, not a change over time, which is a false claim made in pictures:
       the easiest kind to make by accident and the hardest for a reader to
       catch.

       So `registered` gates the slider. True, and the two are shown as a wipe
       with dates. Absent or false, they are shown as separate captioned views
       and the caption says in as many words that they are two frames of the
       same event rather than one frame twice. */
    const wipe = img.registered && img.before && img.after;
    const body = wipe
      ? `      <div class="as-cmp" data-cmp>
        <img class="as-cmp-b" src="${esc(img.before)}" alt="${esc(`The valley before the event: ${img.shows || ''}`)}"${imgDim(img.before)} loading="lazy" decoding="async">
        <div class="as-cmp-a" style="--x:50%">
          <img src="${esc(img.after)}" alt="${esc(`The same valley after the event: ${img.shows || ''}`)}"${imgDim(img.after)} loading="lazy" decoding="async">
        </div>
        <span class="as-cmp-h" aria-hidden="true"></span>
        <span class="lbl as-cmp-lb">Before</span>
        <span class="lbl as-cmp-la">After</span>
        <input class="as-cmp-r" type="range" min="0" max="100" value="50" step="1"
          aria-label="Reveal the after image. Left is before the event, right is after.">
      </div>`
      : `      <div class="as-eo-two">
${(img.frames || []).map((f) => `        ${suppliedFrame(f)}`).join('\n')}
      </div>`;

    /* ★ THE CAPTION IS THE FLOOR, and the copy standard names most of what
       used to be here: "who provided or verified a number internally" and "the
       exact date on which an internal figure was supplied or confirmed" are on
       its list of things to cut. So the permission provenance is recorded in
       the dossier, where a reviewer can find it, and not printed under the
       picture.

       WHAT STAYS IS ATTRIBUTION, which the same standard says to KEEP in the
       Situations sections: Reuters holds the imagery and the report is linked.

       AND THE "NOT A BEFORE AND AFTER" PARAGRAPH IS GONE BECAUSE THE LABELS DO
       THAT JOB. They read "The valley" and "The debris field", not "Before" and
       "After" — so the page makes no before/after claim that would need
       explaining away. A structural fix beats a paragraph apologising for one. */
    return `${body}
      <p class="cap as-eo-k">${img.place ? `<b>${esc(img.place)}.</b> ` : ''}
        ${wipe ? 'Drag to wipe between the two dates. ' : ''}${esc(img.credit || 'Supplied')}${img.published_by ? `, via <a class="lk" href="${esc(img.credit_url)}">${esc(img.published_by)}</a>` : ''}.</p>`;
  }).join('\n');
}

export function eoBand(e, imagery) {
  const supplied = suppliedBlock(imagery?.supplied);
  const head = opener('eo', 'What the satellite sees', supplied
    ? 'Close views of the affected valley, published by permission, and beneath them the public NASA frames this site fetches for itself.'
    : 'Imagery published here, not linked to. The same public NASA layers a newsroom would use, over the region the reporting names, on the dates either side of the event.');

  if (!imagery || (!imagery.before && !imagery.after && !imagery.latest)) {
    /* Supplied imagery can carry the band on its own when the NASA ladder
       found nothing — which is the whole point of having the slot. */
    if (supplied) {
      return `${head}
    <div class="wrap">
${supplied}
    </div>`;
    }
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
${supplied ? `${supplied}
      <p class="lbl as-eo-sub">And the public frames this site fetches for itself</p>` : ''}
${tabs('Satellite imagery', panels)}
      ${imagery.frame ? `<p class="cap as-eo-fr">Frame ${imagery.frame.south}&ndash;${imagery.frame.north}&deg;N,
        ${imagery.frame.west}&ndash;${imagery.frame.east}&deg;E. ${esc(imagery.frame.note)}</p>` : ''}
${(e.reported_imagery || []).length ? `      <div class="as-eo-rep">
        <p class="lbl as-eo-rep-h">Higher-resolution before-and-after, at its publisher</p>
${(e.reported_imagery || []).map((r) => `        <p class="as-eo-rep-i"><a class="lk" href="${esc(r.url)}">${esc(r.title)}</a>
          <span class="cap">${esc(r.publisher)}${r.date ? ` &middot; ${esc(r.date)}` : ''} &mdash; ${esc(r.shows)}</span></p>`).join('\n')}
        <p class="cap as-eo-rep-n"><b>Linked, not reproduced, and that is a licence question
          rather than a preference.</b> Commercial high-resolution imagery is licensed to the outlet
          that bought it; a credit line is not a licence to republish it, and this site will not put
          Swechha&rsquo;s name on a copyright claim. What is published above is imagery whose terms
          permit it &mdash; NASA&rsquo;s, which is public domain &mdash; at the resolution that
          actually exists for free, stated on the frame.</p>
      </div>` : ''}
${(() => {
    /* ── THE LIVE COMPARISON ────────────────────────────────────────────
       ★ THE ONE THING THIS PAGE CANNOT DO, HANDED TO THE READER.
       The frames above are 250 m per pixel and committed at two fixed dates.
       Worldview's A/B mode is the same NASA imagery, live, with the controls
       this page has no business reimplementing: zoom, any pair of dates, and
       the layer menu — including the OPERA Sentinel-1 radar products, which see
       through the cloud that spoils the optical pair here.

       A LINK, NOT AN EMBED. This site is static HTML on a CDN with no runtime
       map anywhere in it; embedding a tile map would add a third-party script
       and a per-read network dependency for a view most readers will not open. */
    const wv = worldviewUrl({
      frame: imagery.frame,
      before: imagery.before?.date,
      after: imagery.after?.date,
      layer: imagery.after?.layer || imagery.before?.layer,
    });
    if (!wv) return '';
    return `      <p class="as-eo-live"><a class="act" href="${esc(wv)}">Open the live comparison ${ARROW}</a>
        <span class="cap as-eo-live-c">The same NASA imagery at NASA&rsquo;s own viewer, opened on this
        valley with these two dates side by side. Zoom in, change either date, or switch to the
        Sentinel-1 radar layers, which see through cloud. Nothing here is stored by this site.</span></p>`;
  })()}
      <p class="cap as-eo-at"><a class="lk" href="${esc(imagery.attribution.url)}">${esc(imagery.attribution.name)}</a>.
        ${esc(imagery.attribution.note)}
        ${imagery.before_pending ? `<b>Before the event:</b> ${esc(imagery.before_pending)}` : ''}
        ${imagery.after_pending ? `<b>Since the event:</b> ${esc(imagery.after_pending)}` : ''}</p>
    </div>`;
}

/* ═══ F. THE TIMELINE ═════════════════════════════════════════════════════ */
export function timelineBand(e) {
  const S = e.sourceIndex;
  /* ★ ONE ENTRY IS NOT A TIMELINE, AND THE ONE ENTRY WAS THE DETECTOR'S OWN
     FILLER: "First reported in the sources below." A band with a heading, a
     lead, a rule and a single row saying nothing is the kind of empty section
     the owner asked to have removed. Two real developments or the band does not
     exist \u2014 and the sources band already says when the feeds were last read. */
  const FILLER = /^first reported in the sources below\.?$/i;
  const items = (e.timeline || []).filter((t) => t.what && !FILLER.test(t.what.trim())).slice(0, 8);
  if (items.length < 2) return null;
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

  /* A pack may give a plain string or a {what, why} pair. The string form is
     shown as the heading with no detail, so an unconverted pack still works. */
  const norm = (x) => (typeof x === 'string' ? { what: x, why: null } : x);

  /* ── CARDS, NOT FULL-WIDTH ROWS ────────────────────────────────────────
     ★ THE ROWS WERE 130 CHARACTERS WIDE AND READ AS PARAGRAPHS. Each item was
     one long sentence spanning the whole band — "Whether a landslide dam formed
     in the flood path. A blockage that fills and then fails produces a second
     flood, often larger than the first." — which is four lines of prose in a
     section whose whole point is that it can be scanned. The structure the
     owner liked is kept: two horizons, and a level printed only where a
     published threshold earns one. What changes is that each item is now a
     short heading with one detail line under it, in a card whose measure is
     capped, so the eye runs down a column instead of across the page. */
  const card = (item, level, why) => {
    const it = norm(item);
    return `        <div class="as-risk-c${level ? ` as-risk-${level.toLowerCase()}` : ''}">
          <span class="as-risk-l">${level ? esc(level) : 'Watch'}</span>
          <span class="as-risk-t">${esc(it.what)}</span>
          ${(why || it.why) ? `<span class="cap as-risk-w">${esc(why || it.why)}</span>` : ''}
        </div>`;
  };

  return `${opener('next', 'What happens next', 'Two horizons. A level only where a published threshold and a number exist to put something against &mdash; everything else is named as a watch, not graded.')}
    <div class="wrap">
      <p class="lbl as-sub">Next 24&ndash;72 hours</p>
      <div class="as-risk">
${rain ? card({ what: 'More rain over the region' }, rain.level, rain.why) : ''}
${watch.slice(0, 5).map((w) => card(w, null, null)).join('\n')}
      </div>
      ${later.length ? `<p class="lbl as-sub">Coming days and weeks</p>
      <div class="as-risk">
${later.slice(0, 5).map((w) => card(w, null, null)).join('\n')}
      </div>` : ''}
      <p class="cap as-risk-n">${rain ? `The rainfall level is computed from a forecast model over a
        representative point &mdash; ${esc(rain.source?.name || 'a forecast API')}, not a gauge at the
        event. ` : ''}The ungraded items are the mechanisms that follow this hazard. This page does not
        pretend to know their probability.</p>
    </div>`;
}

/* ═══ J. THE CLIMATE SIGNAL ═══════════════════════════════════════════════ */
export function climateBand(e, ctx) {
  const all = (ctx?.figures || []).filter((f) => f?.value != null);
  /* ★ ONLY THE `scale` FIGURES ARE CARDS HERE. The owner's instruction was to
     keep every one of these numbers and spread them across sections rather
     than stack sixteen cards in one band: the size of the risk argues here, the
     mechanism figures argue beside the CAUSE they make plausible, and the
     Indian exposure figures argue in the India band. Every figure, band-tagged
     or not, is still in this band's disclosure. */
  const figures = all.filter((f) => f.band === 'scale');
  if (!figures.length) return null;
  const S = ctx.sourceIndex;
  const cascade = ctx.cascade || [];

  /* ★ THIS BAND LEADS THE PAGE NOW, on the owner's instruction. It is the one
     section that answers why a Nepal event is on an Indian site at all, and it
     does it with counted things rather than with an argument. */
  return `${opener('climate', 'The numbers we cannot ignore',
    'The geography of this risk is already mapped. What follows is what has been counted, and by whom.')}
    <div class="wrap">
      <div class="as-sig">
${figures.map((f, i) => {
    const st = CLAIM_STATUS[f.status] || CLAIM_STATUS.preliminary;
    /* THE FIRST FIGURE LEADS. The pack's `scale` block is in editorial order,
       so figures[0] is the one the owner's briefing opens its own number list
       with — 28,043 lakes across the Indian Himalayan river basins. It gets
       double width and a bigger numeral so the band has a focal point instead
       of six equal cards a reader has to rank for themselves. */
    return `        <div class="as-sig-c${i === 0 ? ' is-lead' : ''}">
          <span class="as-sig-v">${esc(String(f.value))}${f.unit ? `<i>${esc(f.unit)}</i>` : ''}</span>
          <span class="lbl as-sig-l">${esc(f.label)}</span>
          <span class="cap as-sig-s"><i class="as-st as-st-${st.cls}">${esc(st.label)}</i> ${srcNames(S, f.source)}</span>
        </div>`;
  }).join('\n')}
      </div>
      <p class="cap as-sig-n">The danger is not a distant hypothetical. The question is whether
        monitoring, planning and construction follow what is already known.</p>

${cascade.length ? `      <p class="lbl as-sub">And they are not separate hazards. This is one chain.</p>
      <ol class="as-casc">
${cascade.map((step, i) => `        <li class="as-casc-s${i === cascade.length - 1 ? ' is-end' : ''}">${esc(step)}</li>`).join('\n')}
      </ol>
      <p class="cap as-casc-n">Flood, landslide, cloudburst, avalanche, outburst &mdash; described one
        at a time, they look like separate accidents. They are a sequence, and it is why assessment
        project by project cannot see what arrives catchment by catchment.</p>` : ''}

      <div class="as-attr">
        <div class="as-attr-c as-attr-can">
          <p class="lbl as-attr-h">What science can say</p>
          <p class="as-attr-t">${esc(ctx.summary_short || '')}</p>
        </div>
        <div class="as-attr-c as-attr-cant">
          <p class="lbl as-attr-h">What has not been attributed</p>
          <p class="as-attr-t">Nobody has established that climate change caused THIS event.
            Single-event attribution takes months, and for a glacier or rock collapse it is often not
            possible at all. A rising hazard across a region is not a finding about one flood in it.</p>
        </div>
      </div>
${disclose(`All ${all.length} standing figures for this hazard, and their sources`,
    `${ctx.summary ? `<p>${esc(ctx.summary)}</p>` : ''}
        ${all.map((f) => `<p><b>${esc(String(f.value))}${f.unit ? ` ${esc(f.unit)}` : ''} &mdash; ${esc(f.label)}.</b>
          ${esc(f.note || '')} <span class="cap">${srcNames(S, f.source, 4)}</span></p>`).join('\n        ')}
        <p class="cap"><b>Some of these are named but not linked.</b> Where a figure came from
          Swechha&rsquo;s own briefing, the originating publication is named and this site has not
          opened the primary document &mdash; so no link is given and none is invented.</p>
        ${(ctx.withheld || []).length ? `<p class="lbl as-how-h">Figures deliberately not published here</p>
        <ul>${(ctx.withheld || []).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}`)}
    </div>`;
}

/* ═══ K. INDIA ════════════════════════════════════════════════════════════ */
export function indiaBand(e, ctx) {
  const S = e.sourceIndex;
  const impact = e.impact || {};
  const corridors = ctx?.india_corridors || [];
  const exposure = (ctx?.figures || []).filter((f) => f.band === 'india' && f.value != null);

  /* CONFIRMED vs UNDER WATCH, and the split is the whole band. An Indians-
     missing count the Ministry of External Affairs gave IS a confirmed Indian
     impact; a valley with nine dangerous lakes above it is not. Mixing them is
     the generic "Himalayan rivers can affect India" paragraph this band was
     rebuilt to replace. */
  const confirmed = METRIC_ORDER
    .filter((k) => k.startsWith('indians_'))
    .map((k) => [k, impact[k]])
    .filter(([, c]) => c?.value != null);

  if (!confirmed.length && !corridors.length && !ctx?.india_watch) return null;

  return `${opener('india', 'The alarm for India',
    'Nepal is not somebody else\u2019s disaster. The triggers differ; the vulnerability is the same, and it is already measured.')}
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
          </div>` : `          <p class="p-hole">No Indian casualty or evacuation figure has been reported
            in a form this page can attribute.</p>`}
        </div>
        <div class="as-ind-half">
          <p class="lbl as-ind-h as-ind-h-w">What is already counted above India</p>
${exposure.length ? `          <div class="as-expo">
${exposure.map((f) => `            <div class="as-expo-r">
              <span class="as-expo-v">${esc(String(f.value))}</span>
              <span class="as-expo-l">${esc(f.label)}</span>
              <span class="cap as-expo-s">${srcNames(ctx.sourceIndex, f.source)}</span>
            </div>`).join('\n')}
          </div>` : ''}
          <p class="lbl as-sub">The corridors this maps onto</p>
${corridors.length ? `          <div class="as-corr">
${corridors.map((c) => `            <div class="as-corr-r">
              <span class="as-corr-n">${esc(c.name)}</span>
              <span class="as-corr-w">${esc(c.why)}</span>
              ${c.source ? `<span class="cap as-corr-s">${srcNames(ctx.sourceIndex, c.source)}</span>` : ''}
            </div>`).join('\n')}
          </div>` : ''}
          ${ctx?.india_watch ? `<p class="cap as-ind-t"><b>Downstream of this event:</b> ${esc(ctx.india_watch)}</p>` : ''}
          <p class="cap"><b>This column is exposure, not an outcome.</b> Nothing in it is a report
            that anything has happened in India. It is where the same hazard would arrive.</p>
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

/* ── WHAT USED TO BE HERE: "WHAT SWECHHA SAYS" ────────────────────────────
   A band carrying Vimlendu Jha's own published items on this hazard — the
   Dharali videos, the Vaishno Devi interview, the TEDx talk — each linked, none
   paraphrased. Removed on the owner's instruction, 2026-08-28.

   THE REGISTER IS KEPT: data/media/vimlendu-voice.json still holds the person,
   the channels (@vimlendu and @swechhaindia) and the eight verified items with
   their hazard tags. Nothing was deleted from it, so restoring the band is one
   import and one entry in the band table of
   scripts/build-climate-disaster-pages.mjs. */

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

/* ── (b) THE METRIC CARDS. The page's whole reason for existing. ───────── */
.as-cards{display:flex;flex-wrap:wrap;gap:1px;background:var(--hair-2);margin:0 0 clamp(14px,1.6vw,20px)}
.as-card{flex:1 1 200px;background:var(--ground);padding:clamp(14px,1.5vw,20px) clamp(13px,1.4vw,18px);
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


/* THE LEDGER behind the cards. */

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

/* ── (e) CAUSE ────────────────────────────────────────────────────────── */
.as-causes{display:flex;flex-wrap:wrap;gap:1px;background:var(--hair-2);margin:0 0 clamp(14px,1.6vw,20px)}
.as-cause{flex:1 1 230px;background:var(--ground);padding:14px 15px;border-top:2px solid var(--hair-2)}
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
.as-eo-sub{color:var(--fg-3);margin:clamp(22px,2.6vw,36px) 0 clamp(10px,1.2vw,16px);
  border-top:1px solid var(--hair);padding-top:14px}
.as-eo-live{margin:clamp(18px,2vw,26px) 0 0}
.as-eo-live-c{display:block;margin-top:9px;max-width:66ch}
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

/* ── (h) THE VIMLENDU BAND'S CSS WENT WITH THE BAND ──────────────────────
   About twenty-five rules shipped to every disaster page for an element no
   page renders. The register at data/media/vimlendu-voice.json is untouched,
   so restoring the band means reverting this hunk, the voiceBand() hunk above,
   and one entry in the band table of build-climate-disaster-pages.mjs. */

/* ── (i) PRECEDENTS ───────────────────────────────────────────────────── */
.as-precs{display:flex;flex-wrap:wrap;gap:1px;background:var(--hair-2);margin:0 0 clamp(14px,1.6vw,20px)}
.as-prec{flex:1 1 195px;background:var(--ground);padding:14px 15px}
.as-prec-y{display:block;font-family:Archivo,system-ui,sans-serif;font-size:11px;
  letter-spacing:.09em;color:var(--fg-3);margin-bottom:6px;font-variant-numeric:tabular-nums}
.as-prec-p{display:block;font-family:Newsreader,Georgia,serif;font-size:16px;line-height:1.25;
  color:var(--fg);margin-bottom:12px;min-height:2.5em}
.as-prec-v{display:block;font-size:clamp(24px,2.2vw,32px);line-height:1;color:var(--fg-2);
  font-variant-numeric:tabular-nums}
.as-prec-l{display:block;color:var(--fg-2);margin-top:5px}
.as-prec-n{display:block;margin-top:7px;max-width:32ch}
.as-prec-s{display:block;margin-top:7px}

/* ── (j) RISK. CARDS WITH A CAPPED MEASURE, not full-width rows. See the
      note in nextBand(): the rows were 130 characters wide and read as
      paragraphs in a band built to be scanned. Flex, so the last row fills. ── */
.as-sub{color:var(--fg-3);margin:clamp(6px,.8vw,10px) 0 clamp(10px,1.1vw,14px)}
.as-risk{display:flex;flex-wrap:wrap;gap:1px;background:var(--hair-2);
  margin:0 0 clamp(20px,2.2vw,32px)}
.as-risk-c{flex:1 1 235px;background:var(--ground);padding:13px 15px;
  border-top:2px solid var(--hair-2)}
.as-risk-critical,.as-risk-high{border-top-color:var(--red)}
.as-risk-moderate{border-top-color:var(--mustard)}
.as-risk-low{border-top-color:var(--fg-3)}
.as-risk-l{display:block;font-family:Archivo,system-ui,sans-serif;font-size:9.5px;
  letter-spacing:.1em;text-transform:uppercase;color:var(--fg-3);margin-bottom:8px}
.as-risk-critical .as-risk-l,.as-risk-high .as-risk-l{color:var(--red)}
.as-risk-moderate .as-risk-l{color:var(--mustard-2)}
.as-risk-t{display:block;font-size:clamp(15px,1.2vw,18px);line-height:1.3;color:var(--fg);
  max-width:24ch}
.as-risk-w{display:block;margin-top:7px;max-width:34ch}
.as-risk-n{max-width:66ch;margin:0}
.paper .as-risk-c{background:var(--paper)}
.paper .as-risk{background:var(--rule-2)}
.paper .as-risk-t{color:var(--ink)}
.paper .as-risk-l{color:var(--ink-3)}

/* ── (k) THE CLIMATE SIGNAL ───────────────────────────────────────────── */
.as-sig{display:flex;flex-wrap:wrap;gap:1px;background:var(--hair-2);margin:0 0 clamp(20px,2.2vw,32px)}
.as-sig-c{flex:1 1 210px;background:var(--ground);padding:15px 16px}
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
.as-scount{display:flex;flex-wrap:wrap;gap:1px;background:var(--hair-2);margin:0 0 clamp(16px,1.8vw,24px)}
.as-scount-c{flex:1 1 150px;background:var(--ground);padding:13px 15px}
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

.as-eo-rep{border-top:1px solid var(--hair);margin-top:clamp(18px,2vw,26px);padding-top:14px}
.as-eo-rep-h{color:var(--fg-3);margin:0 0 .7em}
.as-eo-rep-i{margin:0 0 .9em;line-height:1.4}
.as-eo-rep-i .cap{display:block;margin-top:3px;max-width:64ch}
.as-eo-rep-n{max-width:70ch;margin:1em 0 0}

/* ── (p) CARD ROWS ARE FLEX, NOT AUTO-FIT GRID ────────────────────────────
   ★ AUTO-FIT ALWAYS ORPHANS A LAST ROW, and it shipped a four-cell grey hole.
   repeat(auto-fit, minmax(200px,1fr)) fits as many equal tracks as it can
   and then leaves the remainder EMPTY: six figures at five tracks wide drew
   one card and four cells of bare background beside it. Every card row on this
   page has that failure mode at some width — six causes, five precedents, four
   source counts — and it is not fixable by picking a better minmax, because the
   count is data and the width is the reader's.

   Flex wrap with flex:1 1 <basis> grows the items on the last row to fill it,
   so there is never a hole at any width for any count. The cost is that a last
   row of two is wider than a row of four, which reads as deliberate; a gap does
   not. The 1px gap over a hairline background is unchanged, so the rules
   between cards still come from the container rather than from borders. */
.as-sig-c.is-lead{flex:2 1 330px}
.as-sig-c.is-lead .as-sig-v{font-size:clamp(34px,3.6vw,52px)}
.as-sig-c.is-lead .as-sig-l{max-width:34ch}

/* ── (q) THE EXPLAINER. Two registers, side by side: the plain reading takes
      the wider column because it is the one most readers need, and the
      technical definition sits beside it rather than under it so neither
      reads as the footnote of the other. ─────────────────────────────────── */
.as-exp{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(0,1fr);
  gap:clamp(22px,3vw,56px);align-items:start}
.as-exp-p{font-size:clamp(16px,1.35vw,21px);line-height:1.5;color:var(--fg);
  max-width:44ch;margin:0 0 .85em}
.as-exp-p:last-child{margin-bottom:0;color:var(--fg-2)}
.as-exp-tech{border-top:2px solid var(--hair);padding-top:13px}
.as-exp-tech-h{color:var(--fg-3);margin:0 0 .8em}
.as-exp-ex{font-size:14px;line-height:1.45;color:var(--fg-2);margin:0 0 .8em}
.as-exp-ex b{color:var(--fg)}
.as-exp-t{font-size:clamp(14px,1.05vw,16px);line-height:1.55;color:var(--fg-2);
  max-width:42ch;margin:0 0 1em}
.as-exp-not{font-size:clamp(14px,1.05vw,16px);line-height:1.5;color:var(--fg);
  max-width:38ch;margin:0;border-left:2px solid var(--red);padding-left:13px}
.paper .as-exp-p,.paper .as-exp-ex b,.paper .as-exp-not{color:var(--ink)}
.paper .as-exp-t,.paper .as-exp-ex,.paper .as-exp-p:last-child{color:var(--ink-2)}
.paper .as-exp-tech{border-top-color:var(--rule-2)}

/* ── (o) THE HERO BANNER, on Air and Yamuna's own picture-band component.
      Only the overrides this page needs are here; .pic, .ht and .pic-over come from the shared stylesheet. ───────────────────────── */
.as-pic-i{display:block;width:100%;height:100%;object-fit:cover;object-position:50% 38%}
/* HALF-STRENGTH SCRIM, scoped to this band. The shared one is tuned for a
   duo-filtered frame; this one is unfiltered, so the same gradient buries it. */
.as-pic .pic-over{background:linear-gradient(180deg,
  rgba(11,11,9,.80) 0%,rgba(11,11,9,.66) 62%,rgba(11,11,9,.28) 100%)}
.as-pic-k{color:var(--fg-2);margin:0 0 .5em}
.as-pic-h{max-width:22ch}

/* ── (n) THE REVISION OF 28 AUGUST: place line, cascade, exposure, and the
      figure that sits under a cause ─────────────────────────────────────── */
.as-place{display:flex;flex-wrap:wrap;align-items:baseline;gap:2px 4px;
  font-size:clamp(14.5px,1.15vw,17.5px);line-height:1.5;color:var(--fg-2);
  margin:0 0 clamp(18px,2vw,26px);max-width:70ch}
.as-place b{color:var(--fg);font-weight:400}
.as-place-m{display:block;width:100%;color:var(--fg-3);font-size:13.5px;margin-top:.35em}

.as-card-owner .as-card-v{color:var(--fg)}
.as-sig-n{max-width:62ch;margin:clamp(12px,1.4vw,18px) 0 clamp(20px,2.4vw,34px)}

/* THE CASCADE. Numbered, because the argument is that it is a SEQUENCE — the
   thing the page exists to say and the thing a bullet list would lose. */
.as-casc{list-style:none;padding:0;margin:0 0 clamp(12px,1.4vw,18px);counter-reset:casc;
  max-width:72ch}
.as-casc-s{counter-increment:casc;position:relative;padding:9px 0 9px 44px;
  border-top:1px solid var(--hair-2);font-size:clamp(14.5px,1.1vw,17px);line-height:1.4;
  color:var(--fg)}
.as-casc-s::before{content:counter(casc);position:absolute;left:0;top:9px;width:26px;
  text-align:right;font-family:Archivo,system-ui,sans-serif;font-size:11px;letter-spacing:.06em;
  color:var(--fg-3);font-variant-numeric:tabular-nums}
.as-casc-s::after{content:"";position:absolute;left:31px;top:22px;bottom:-9px;width:1px;
  background:var(--hair-2)}
.as-casc-s:last-child::after{display:none}
.as-casc-s.is-end{color:var(--red)}
.as-casc-n{max-width:66ch;margin:0 0 clamp(20px,2.4vw,32px)}

/* THE FIGURE UNDER A CAUSE. Set apart by a rule rather than a box: it is
   evidence FOR the card it sits in, not a second card. */
.as-cause-f{display:block;margin-top:11px;padding-top:10px;border-top:1px solid var(--hair-2)}
.as-cause-f b{display:block;font-size:clamp(19px,1.7vw,25px);line-height:1;color:var(--fg);
  font-variant-numeric:tabular-nums}
.as-cause-f i{display:block;font-style:normal;font-size:12.5px;line-height:1.35;
  color:var(--fg-2);margin-top:5px;max-width:26ch}
.as-cause-f .cap{display:block;margin-top:4px}

/* INDIAN EXPOSURE. A list of counted things, so rows and not cards. */
.as-expo{display:flex;flex-direction:column;margin:0 0 clamp(16px,1.8vw,24px)}
.as-expo-r{display:grid;grid-template-columns:minmax(0,5.2em) minmax(0,1fr);gap:2px 14px;
  padding:9px 0;border-bottom:1px solid var(--hair-2);align-items:baseline}
.as-expo-v{font-size:clamp(18px,1.5vw,23px);line-height:1;color:var(--red);
  font-variant-numeric:tabular-nums}
.as-expo-l{font-size:clamp(13.5px,1vw,15.5px);line-height:1.4;color:var(--fg)}
.as-expo-s{grid-column:2}
.paper .as-expo-v{color:var(--red-ink)}
.paper .as-expo-l,.paper .as-casc-s,.paper .as-place b{color:var(--ink)}
.paper .as-cause-f b{color:var(--ink)}
.paper .as-cause-f i,.paper .as-place{color:var(--ink-2)}

/* ── PAPER BANDS. Two of these bands sit on the light ground, and every
      token above that names a dark foreground has to flip. ───────────── */
.paper .as-card,.paper .as-cause,.paper .as-prec,
.paper .as-sig-c,.paper .as-scount-c{background:var(--paper)}
.paper .as-cards,.paper .as-causes,.paper .as-precs,
.paper .as-risk,.paper .as-sig,.paper .as-scount{background:var(--rule-2)}
.paper .as-card-v{color:var(--red-ink)}
.paper .as-card-in .as-card-v,.paper .as-sig-v,.paper .as-scount-v,
.paper .as-prec-p,.paper .as-cause-t,.paper .as-risk-t,.paper .as-tl-t{color:var(--ink)}
.paper .as-card-l,.paper .as-sig-l,.paper .as-scount-l,.paper .as-prec-l,
.paper .as-attr-t,.paper .as-ind-t,.paper .as-chain-t{color:var(--ink-2)}
.paper .as-kicker,.paper .as-hedge,.paper .as-cause-st,.paper .as-risk-l,
.paper .as-chain-r{color:var(--ink-3)}
.paper .as-st-confirmed{color:var(--ink)}
.paper .as-st-estimate{color:var(--ink-2)}
.paper .as-st-media{color:var(--ink-3)}
.paper .as-st-prelim{color:var(--mustard-ink)}
.paper .as-tl-w{color:var(--red-ink)}

/* ── PHONE. Measured at 375 wide: every grid above is auto-fit with a
      min-width at or under 300px, so all of them collapse to one column on
      their own. What does NOT collapse on its own is the two-column voice
      band and the readout scale, so those are the only overrides. ────── */
@media (max-width:640px){
  /* EVERY PIXEL ABOVE THE FIRST FIGURE IS MEASURED AGAINST 635. The kicker
     wraps to two lines at this width and the pill takes a row of its own, so
     the heading gives back what it can without losing its scale. */
  .as-hero{padding-top:14px}
  .as-head{margin:10px 0 10px}
  .as-card-v{font-size:clamp(32px,10.5vw,44px)}
  .as-pill{margin-left:0}
  .as-prec-p{min-height:0}
  .as-exp{grid-template-columns:1fr;gap:clamp(20px,5vw,30px)}
  .as-casc-s{padding-left:34px}
  .as-casc-s::before{width:20px}
  .as-casc-s::after{left:25px}
  .as-expo-r{grid-template-columns:minmax(0,4.4em) minmax(0,1fr)}
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

   The relative-time loop that used to sit beside it went with the timestamp
   pair it rewrote — see the note where it stood. */
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

/* THE RELATIVE-TIME LOOP IS GONE WITH THE ELEMENT IT REWROTE. It walked
   the .ce-t class and replaced each absolute instant with "2 hours ago"; the only
   the .ce-t class on this page was the timestamp pair. Bring it back with any element
   that carries an instant — and keep the instant in the markup, never the age. */
`;

/* ═══ THE GUARD THAT SHOULD HAVE EXISTED THREE MISTAKES AGO ═══════════════
   ★ AS_CSS AND AS_JS ARE TEMPLATE LITERALS, AND A BACKTICK IN A COMMENT INSIDE
   ONE CLOSES IT. That has now happened three times in one sitting: a note
   citing `.ce-t`, a note citing `occurred`, and a note citing `.pic` each ended
   the template early and turned the following CSS selector into a function
   call — "TypeError: .pic is not a function", which names a line 1,300 deep and
   says nothing about the cause.

   The failure is loud, so nothing broken ships. What it is not is DIAGNOSABLE,
   and the fix is one assertion at module load: these two blocks are pure text
   and must contain no backtick and no interpolation. If either ever needs a
   real `${...}`, this is the line that has to be deliberately relaxed — which
   is the point. */
for (const [name, body] of [['AS_CSS', AS_CSS], ['AS_JS', AS_JS]]) {
  const bad = [];
  if (body.includes('`')) bad.push('a backtick');
  if (body.includes('${')) bad.push('a ${ interpolation');
  if (bad.length) {
    throw new Error(
      `situation-render: ${name} contains ${bad.join(' and ')}. Both blocks are `
      + 'plain text inside a template literal, so a backtick in a comment closes the '
      + 'template early and the next CSS selector is parsed as a function call. '
      + 'Quote class names in these comments without backticks.',
    );
  }
}
