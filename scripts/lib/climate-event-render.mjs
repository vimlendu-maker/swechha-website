/* ═══════════════════════════════════════════════════════════════════════════
   climate-event-render.mjs — THE SITUATION BOARD AT THE TOP OF /now/climate-event.
   ───────────────────────────────────────────────────────────────────────────
   Two states, one band:

     ACTIVE   a full situation board — status row, what is claimed and by whom,
              live conditions over the region, the river path to India, the
              timeline, why this hazard happens, how it compares with the
              Himalayan events before it, what is not known, and every source.

     QUIET    no event is current, so the freshest genuine signal from the
              archive holds the slot, with the three most recent headlines.

   ★ THE SECTION THIS FILE DELIBERATELY DOES NOT GENERATE.
   A "what happened in 60 seconds" summary is the one block on this board that
   a machine must not write. Everything else here is either a count this
   repository performed, a figure carrying a source and a confidence word, or
   a standing fact researched in advance and cited. A fluent paragraph
   summarising a disaster is none of those: it reads as authored, it would be
   the most quoted thing on the page, and it would be assembled under deadline
   from headlines by something that cannot check them. So the slot exists, an
   editor can fill it, and until they do the page shows the attributed
   reporting instead and says plainly that nobody has written the summary yet.

   ★ THE STATUS WORD IS NOT THE CADENCE WORD.
   This site has exactly four cadence words — LIVE, PERIODIC, DEMO DATA, OUT OF
   SEASON — enforced by situation-shell's cadence() and asserted by
   verify-final. Those describe the DATASET under a page, and the archive below
   this band is still PERIODIC. The chips here describe two different axes:
   whether an event is being tracked, and how well any single figure is
   attested.

   ★ EVERY FIGURE CARRIES ITS PROVENANCE, VISIBLY.
   Value, status word, publisher. On a disaster page the difference between a
   district collector's estimate and a news wire's figure is the product.
   ═══════════════════════════════════════════════════════════════════════════ */
import { esc, ARROW, imgDim } from './situation-shell.mjs';
import { CLAIM_STATUS, RELEVANCE, istStamp } from './climate-events.mjs';

/* ── TIME IN THE MARKUP IS ABSOLUTE. RELATIVE TIME IS THE BROWSER'S JOB. ──
   ★ THIS WAS A REAL DEFECT AND THE REPOSITORY'S OWN GATE CAUGHT IT.
   The first version wrote "updated 6 minutes ago" straight into the committed
   HTML. That makes the page's BYTES change every minute even when not one
   figure has moved — so `generated-current.yml`, which regenerates every page
   and fails if the tree moved, went red and would have stayed red forever.
   Worse: air-hourly.yml rebuilds every page on its own schedule (all the
   generators share home.html's shell), so the air job would have committed a
   ticking clock on this page every twenty minutes. This repository already
   has a rule for exactly that — IT COMMITS FIGURES, NOT CLOCKS — and this
   broke it.

   So the markup carries the ABSOLUTE instant, which is stable across rebuilds
   and is the complete, honest statement on its own. CE_TIME_JS then rewrites
   it to "6 minutes ago" in the browser, keeping the absolute value in the
   title attribute. With JavaScript off the reader sees a real timestamp
   rather than nothing — which is the right way round. */
const stamp = (epochMs, prefix = '') => {
  const abs = istStamp(epochMs);
  return `<time class="ce-t" datetime="${new Date(epochMs).toISOString()}" title="${esc(abs)}">${prefix ? esc(prefix) + ' ' : ''}${esc(abs)}</time>`;
};

const HAZARD_LABEL = {
  glof: 'Glacial lake outburst flood',
  cloudburst: 'Cloudburst',
  flood: 'Flood',
  landslide: 'Landslide',
  cyclone: 'Cyclone',
  extreme_rain: 'Extreme rainfall',
};

/* An illustrative photograph per hazard, drawn from this repository's own
   library. ★ IT IS NEVER A PHOTOGRAPH OF THE EVENT and the caption says so in
   as many words — a picture of a different flood placed under a live headline
   is a false claim made in pictures, which is the easiest kind to make by
   accident and the hardest for a reader to catch. */
const HAZARD_PHOTO = {
  glof: { src: '/images/photos/river-valley-hillside-climb.jpg',
    alt: 'A Himalayan river valley below steep hillsides',
    credit: 'Swechha field archive' },
  cloudburst: { src: '/images/photos/river-valley-hillside-climb.jpg',
    alt: 'A Himalayan river valley below steep hillsides',
    credit: 'Swechha field archive' },
  landslide: { src: '/images/photos/river-valley-hillside-climb.jpg',
    alt: 'A steep hillside above a river valley',
    credit: 'Swechha field archive' },
  flood: { src: '/images/photos/monsoon-flooded-fields.jpg',
    alt: 'Flooded fields under monsoon cloud',
    credit: 'Swechha field archive' },
  extreme_rain: { src: '/images/photos/monsoon-flooded-fields.jpg',
    alt: 'Flooded fields under monsoon cloud',
    credit: 'Swechha field archive' },
  cyclone: { src: '/images/photos/monsoon-flooded-fields.jpg',
    alt: 'Flooded fields under heavy cloud',
    credit: 'Swechha field archive' },
};

function srcName(sources, id) {
  const s = sources[id];
  if (!s) return '';
  const name = esc(s.publisher);
  return s.url ? `<a class="lk" href="${esc(s.url)}">${name}</a>` : name;
}

function claim(c, sources) {
  if (!c) return '';
  const st = CLAIM_STATUS[c.status];
  const ids = Array.isArray(c.source) ? c.source : [c.source];
  const who = ids.map((id) => srcName(sources, id)).filter(Boolean).join(', ');
  return `<div class="ce-claim">
          <span class="ce-claim-v">${esc(String(c.value))}${c.unit ? `<i>${esc(c.unit)}</i>` : ''}</span>
          <span class="lbl ce-claim-k">${esc(c.label || '')}</span>
          <span class="ce-st ce-st-${st.cls}">${esc(st.label)}</span>
          ${who ? `<span class="cap ce-claim-s">${who}</span>` : ''}
          ${c.note ? `<span class="cap ce-claim-n">${esc(c.note)}</span>` : ''}
        </div>`;
}

/* ── THE STATUS ROW ───────────────────────────────────────────────────────
   Deaths, missing, injured, and how severe. ★ EVERY ONE OF THESE IS EMPTY
   UNTIL SOMEBODY SOURCES IT. A disaster board with four confident numerals is
   the thing this whole subsystem exists to avoid; the honest version shows the
   slot and says the figure is not established, which is also the true state of
   the world in the first days of a disaster. */
function statusRow(e) {
  const S = e.sourceIndex;
  const cells = [
    ['Deaths', e.impact?.deaths],
    ['Missing', e.impact?.missing],
    ['Injured', e.impact?.injured],
    ['Displaced', e.impact?.displaced],
  ];
  return `<div class="ce-status">
          ${cells.map(([label, c]) => {
    if (!c) {
      return `<div class="ce-stat is-none">
            <span class="ce-stat-v">&mdash;</span>
            <span class="lbl ce-stat-l">${label}</span>
            <span class="cap ce-stat-n">not established</span>
          </div>`;
    }
    const st = CLAIM_STATUS[c.status];
    const ids = Array.isArray(c.source) ? c.source : [c.source];
    return `<div class="ce-stat">
            <span class="ce-stat-v">${esc(String(c.value))}</span>
            <span class="lbl ce-stat-l">${label}</span>
            <span class="cap ce-stat-n"><i class="ce-st ce-st-${st.cls}">${esc(st.label)}</i> ${ids.map((i) => srcName(S, i)).filter(Boolean).join(', ')}</span>
          </div>`;
  }).join('\n          ')}
        </div>`;
}

/* ── THE RIVER PATH ───────────────────────────────────────────────────────
   A schematic, not a map. Drawn as inline SVG because it must work with no
   network, no tiles and no key, and because the thing worth showing is not
   geography — it is the CHAIN: where the water starts, what it runs into, and
   which Indian state is at the bottom of it. A tile map would show terrain and
   hide exactly that. */
function riverPath(e, ctx) {
  const chain = ctx?.india_path || (e.tier === 2
    ? [esc(e.location.text), 'Himalayan river system', 'India, downstream']
    : [esc(e.location.text), 'India']);
  if (!chain.length) return '';
  const w = 100 / chain.length;
  return `<div class="ce-path" role="img" aria-label="Path from ${esc(chain[0])} to ${esc(chain[chain.length - 1])}">
          ${chain.map((n, i) => `<span class="ce-path-n${i === chain.length - 1 ? ' is-end' : ''}${i === 0 ? ' is-start' : ''}" style="--w:${w}%">
            <i class="ce-path-d" aria-hidden="true"></i><b>${esc(n)}</b></span>`).join('\n          ')}
        </div>`;
}

/* ── LIVE CONDITIONS ──────────────────────────────────────────────────────
   The only genuinely real-time reading on this page. It is a forecast-model
   value over a representative point for the region, NOT a gauge at the event,
   and the caption says both things because the difference matters. */
function liveConditions(lc) {
  if (!lc) return '';
  const cells = [
    ['Rain now', lc.precipitation_mm == null ? '—' : `${lc.precipitation_mm}`, 'mm/hr'],
    ['Rain, 7 days', lc.rain_7d_mm == null ? '—' : `${lc.rain_7d_mm}`, 'mm'],
    ['Temperature', lc.temperature_c == null ? '—' : `${Math.round(lc.temperature_c)}`, '°C'],
    ['Humidity', lc.humidity_pct == null ? '—' : `${Math.round(lc.humidity_pct)}`, '%'],
  ];
  const max = Math.max(1, ...(lc.daily || []).map((d) => d.mm || 0));
  const bars = (lc.daily || []).map((d) => `<i class="ce-bar" style="--h:${Math.max(2, Math.round((d.mm || 0) / max * 100))}%" title="${esc(d.date)}: ${d.mm == null ? 'no data' : `${d.mm} mm`}"></i>`).join('');
  return `<p class="lbl ce-lbl">Conditions over the region, now</p>
        <div class="ce-live">
          ${cells.map(([l, v, u]) => `<div class="ce-lv">
            <span class="ce-lv-v">${esc(v)}<i>${esc(u)}</i></span>
            <span class="lbl ce-lv-l">${esc(l)}</span>
          </div>`).join('\n          ')}
        </div>
        ${bars ? `<div class="ce-bars" role="img" aria-label="Daily rainfall, seven days past and three ahead">${bars}</div>
        <p class="cap ce-bars-c">Daily rainfall, seven days back and three forward.</p>` : ''}
        <p class="cap ce-live-c"><b>This is a model, not a gauge, and it is not the site of the event.</b>
          Read at ${lc.point.lat.toFixed(2)}&deg;, ${lc.point.lon.toFixed(2)}&deg; &mdash; ${esc(lc.point.note)}.
          ${esc(lc.source.name)}, ${esc(lc.source.note)}.
          ${lc.observed_at ? `Model time ${esc(lc.observed_at)}.` : ''}</p>`;
}

/* ── THE ACTIVE-EVENT BOARD ───────────────────────────────────────────── */
export function renderEvent(e, ctx) {
  const S = e.sourceIndex;
  const hazard = HAZARD_LABEL[e.hazard] || e.hazard;
  const relLabel = RELEVANCE[e.india_relevance];
  const photo = HAZARD_PHOTO[e.hazard];

  const impact = Object.entries(e.impact || {})
    .filter(([k]) => !['deaths', 'missing', 'injured', 'displaced'].includes(k))
    .map(([k, c]) => claim({ ...c, label: c.label || k.replace(/_/g, ' ') }, S))
    .filter(Boolean).join('\n        ');
  const figures = (e.figures || []).map((c) => claim(c, S)).filter(Boolean).join('\n        ');
  const ctxFigures = (ctx?.figures || []).map((c) => claim(c, ctx.sourceIndex)).filter(Boolean).join('\n        ');

  const precedents = (ctx?.precedents || []).slice(0, 4).map((p) => `<li class="ce-prec">
            <span class="ce-prec-w">${esc(p.when)}</span>
            <span class="ce-prec-t">${esc(p.what)}</span>
            ${p.toll ? `<span class="cap ce-prec-n">${esc(String(p.toll.value))} ${esc(p.toll.label || 'deaths')} &middot; ${esc(CLAIM_STATUS[p.toll.status]?.label || '')}${p.toll.source ? ` &middot; ${srcName(ctx.sourceIndex, Array.isArray(p.toll.source) ? p.toll.source[0] : p.toll.source)}` : ''}</span>` : ''}
          </li>`).join('\n          ');

  const timeline = (e.timeline || []).slice(0, 10).map((t) => `<li class="ce-tl">
            <span class="ce-tl-w">${esc(t.when || '')}</span>
            <span class="ce-tl-t">${esc(t.what)}${t.source ? ` <span class="cap">&mdash; ${srcName(S, t.source)}</span>` : ''}</span>
          </li>`).join('\n          ');

  const uncertain = (e.uncertain || []).map((u) => `<li>${esc(u)}</li>`).join('\n            ');
  const known = (e.known || []).map((u) => `<li>${esc(u)}</li>`).join('\n            ');

  const newsSrc = Object.values(S).filter((s) => s.tier === 'news');
  const offSrc = Object.values(S).filter((s) => s.tier === 'official');
  const sciSrc = Object.values(S).filter((s) => s.tier === 'scientific');
  const srcList = (list) => list.slice(0, 24).map((s) => `<li class="ce-src-i">
              ${s.url ? `<a class="ce-src-t" href="${esc(s.url)}">${esc(s.title)}</a>` : `<span class="ce-src-t">${esc(s.title)}</span>`}
              <span class="cap ce-src-p">${esc(s.publisher)}${s.published ? ` &middot; ${esc(s.published)}` : ''}</span>
            </li>`).join('\n            ');

  /* "Why this happens" is the HAZARD's mechanism, not this event's cause —
     the distinction is in the heading and in the caption, because nobody has
     established this event's cause and the page must not imply otherwise. */
  const why = ctx?.mechanism ? Object.entries(ctx.mechanism).map(([k, v]) => `<div class="ce-why-c">
            <p class="lbl ce-why-h">${esc({ trigger: 'Immediate trigger', conditions: 'Environmental conditions', assessment: 'What science says', human: 'Human factors' }[k] || k)}</p>
            <p class="ce-why-t">${esc(v)}</p>
          </div>`).join('\n          ') : '';

  const watch = (ctx?.what_to_watch || []).map((w) => `<li>${esc(w)}</li>`).join('\n            ');

  return `    <div class="wrap ce-wrap">
      <div class="ce-card ce-live-card">
        <div class="ce-head">
          <p class="lbl ce-eyebrow"><span class="ce-flag">Active situation</span>
            <i class="ce-sep">&middot;</i> ${e.tier === 1 ? 'In India' : 'Regional'}
            <i class="ce-sep">&middot;</i> ${esc(hazard)}</p>
          <span class="ce-track"><i class="ce-dot" aria-hidden="true"></i>Tracking</span>
        </div>

        <h2 class="ce-h">${esc(e.headline)}</h2>

        <p class="ce-meta">
          <span class="ce-place">${esc(e.location.text)}</span>
          <i class="ce-sep">&middot;</i>
          <span>Reported ${stamp(e.occurred.epochMs)}</span>
          <i class="ce-sep">&middot;</i>
          <span>Updated ${stamp(e.last_updated.epochMs)}</span>
        </p>

        ${statusRow(e)}

        ${e.what_happened ? `<p class="ce-said">${esc(e.what_happened)}</p>` : `
        <p class="ce-auto"><b>Assembled automatically</b> from
          ${e.corroboration.independent_publishers} independent publisher${e.corroboration.independent_publishers === 1 ? '' : 's'}${e.corroboration.official_alerts ? ` and ${e.corroboration.official_alerts} official alert${e.corroboration.official_alerts === 1 ? '' : 's'}` : ''}.
          <b>No summary of this event has been written by a person yet</b>, and this page will not
          generate one &mdash; a fluent paragraph about a live disaster, assembled from headlines by
          something that cannot check them, is the one thing here that would read as authored and be
          least worth trusting. The reporting itself is below, attributed.</p>`}

        ${e.why_it_matters ? `<p class="ce-why-p">${esc(e.why_it_matters)}</p>` : ''}

        ${photo ? `<figure class="ce-fig">
          <img class="ce-img" src="${photo.src}" alt="${esc(photo.alt)}"${imgDim(photo.src)} loading="lazy" decoding="async">
          <figcaption class="cap ce-figc"><b>This is not a photograph of this event.</b>
            ${esc(photo.alt)} &mdash; an illustration of the terrain this hazard occurs in.
            ${esc(photo.credit)}.</figcaption>
        </figure>` : ''}

        ${e.tier === 2 || ctx?.india_path ? `<p class="lbl ce-lbl">Could India be affected</p>
        ${riverPath(e, ctx)}
        ${e.india_relevance_note ? `<p class="ce-rel">
          <span class="lbl ce-rel-l">${esc(relLabel)}</span>
          ${esc(e.india_relevance_note)}</p>` : ''}
        ${ctx?.india_watch ? `<p class="cap ce-watch"><b>Under watch downstream:</b> ${esc(ctx.india_watch)}</p>` : ''}` : ''}

        ${liveConditions(e.live_conditions)}

        ${impact || figures ? `<p class="lbl ce-lbl">What is claimed, and by whom</p>
        <div class="ce-claims">
        ${impact}
        ${figures}
        </div>` : ''}

        ${timeline ? `<p class="lbl ce-lbl">How it developed</p>
        <ol class="ce-tls">
          ${timeline}
        </ol>` : ''}

        ${why ? `<p class="lbl ce-lbl">Why this kind of event happens</p>
        <div class="ce-whys">
          ${why}
        </div>
        <p class="cap ce-why-c">This is the mechanism for ${esc(hazard.toLowerCase())}s in general, researched in
          advance. <b>It is not a finding about the cause of this event</b>, which has not been established.</p>` : ''}

        ${known ? `<p class="lbl ce-lbl">What is established</p>
        <ul class="ce-kn">
            ${known}
        </ul>` : ''}

        <p class="lbl ce-lbl">What is not known</p>
        <ul class="ce-unc">
            ${uncertain}
        </ul>

        <p class="lbl ce-lbl">Satellite and official imagery</p>
        <p class="ce-sat">This page publishes no before-and-after imagery of its own. These are the
          public services that would carry it, linked rather than reproduced, so what you see is
          theirs and dated by them.</p>
        <ul class="ce-sats">
          <li><a class="lk" href="https://worldview.earthdata.nasa.gov/">NASA Worldview</a> &mdash; daily global imagery, MODIS and VIIRS</li>
          <li><a class="lk" href="https://browser.dataspace.copernicus.eu/">Copernicus Browser</a> &mdash; Sentinel-1 radar, which sees through cloud</li>
          <li><a class="lk" href="https://rapidmapping.emergency.copernicus.eu/">Copernicus Emergency Mapping</a> &mdash; activated only when an authority requests it</li>
          <li><a class="lk" href="https://bhuvan.nrsc.gov.in/">Bhuvan</a>, ISRO/NRSC &mdash; India's own platform</li>
        </ul>

        ${precedents ? `<p class="lbl ce-lbl">The pattern it belongs to</p>
        <ul class="ce-precs">
          ${precedents}
        </ul>` : ''}

        ${ctxFigures ? `<p class="lbl ce-lbl">${esc(ctx.title || 'Standing facts for this hazard')}</p>
        ${ctx.summary ? `<p class="ce-ctx-lead">${esc(ctx.summary)}</p>` : ''}
        <div class="ce-claims ce-claims-ctx">
        ${ctxFigures}
        </div>
        <p class="cap ce-ctx-src">Standing figures are researched and cited in advance, not assembled
          during an event. ${(ctx.sources || []).length} source${(ctx.sources || []).length === 1 ? '' : 's'}.</p>` : ''}

        ${watch ? `<p class="lbl ce-lbl">What to watch next</p>
        <ul class="ce-watchl">
            ${watch}
        </ul>` : ''}

        <details class="ce-det">
          <summary class="ce-sum">Every source behind this board
            (${newsSrc.length} report${newsSrc.length === 1 ? '' : 's'}${offSrc.length ? `, ${offSrc.length} official` : ''}${sciSrc.length ? `, ${sciSrc.length} scientific` : ''})</summary>
          <div class="ce-det-in">
            ${offSrc.length ? `<p class="lbl ce-src-h">Official</p><ul class="ce-srcs">${srcList(offSrc)}</ul>` : ''}
            ${sciSrc.length ? `<p class="lbl ce-src-h">Scientific</p><ul class="ce-srcs">${srcList(sciSrc)}</ul>` : ''}
            ${newsSrc.length ? `<p class="lbl ce-src-h">Reported</p><ul class="ce-srcs">${srcList(newsSrc)}</ul>` : ''}
            <p class="cap ce-det-n">A headline is evidence that something was said. It is never
              evidence that it is true &mdash; the same rule this page applies to its coverage band.</p>
          </div>
        </details>
      </div>

      <p class="cap ce-stamp">Feeds last read ${esc(istStamp(e.last_checked?.epochMs || e.last_updated.epochMs))},
        and re-read every 30 minutes. <a class="lk" href="#top">The archive below is unchanged</a>, and is
        still periodic.</p>
    </div>`;
}

/* ── THE COMPACT BANNER ───────────────────────────────────────────────────
   What /now/climate-event shows when something is happening. Deliberately
   small: that page's job is the standing national picture, and a full board
   above it pushed the death table, the twelve cities and the trend section
   below three screens of something with a completely different clock. This
   states that an event is live, gives the four figures that fit on one line,
   and gets out of the way — the board itself is one click down. */
export function renderBanner(e) {
  const hazard = HAZARD_LABEL[e.hazard] || e.hazard;
  const S = e.sourceIndex;
  const deaths = e.impact?.deaths;
  return `    <div class="wrap ce-wrap">
      <a class="ce-ban" href="/now/climate-event/${esc(e.slug)}">
        <span class="ce-ban-l">
          <span class="lbl ce-ban-k"><i class="ce-dot" aria-hidden="true"></i>Active situation
            <i class="ce-sep">&middot;</i>${esc(hazard)}
            <i class="ce-sep">&middot;</i>${e.tier === 1 ? 'In India' : 'Regional'}</span>
          <span class="ce-ban-h">${esc(e.headline)}</span>
          <span class="cap ce-ban-m">${esc(e.location.text)}
            <i class="ce-sep">&middot;</i>updated ${stamp(e.last_updated.epochMs)}
            <i class="ce-sep">&middot;</i>${e.corroboration.independent_publishers} publisher${e.corroboration.independent_publishers === 1 ? '' : 's'}${e.corroboration.official_alerts ? `, ${e.corroboration.official_alerts} official alert${e.corroboration.official_alerts === 1 ? '' : 's'}` : ''}
            ${deaths ? `<i class="ce-sep">&middot;</i>${esc(String(deaths.value))} dead, ${esc(CLAIM_STATUS[deaths.status]?.label.toLowerCase() || '')}` : '<i class="ce-sep">&middot;</i>no toll established'}</span>
        </span>
        <span class="ce-ban-go">The full situation ${ARROW}</span>
      </a>
    </div>`;
}

/* ── THE QUIET STATE ─────────────────────────────────────────────────────── */
export function renderQuiet({ wetNow, total, seasonTo, checkedMs, headlines = [] }) {
  const recent = headlines.slice(0, 3).map((h) => `<li class="ce-hl">
            <a class="ce-hl-t" href="${esc(h.link)}">${esc(h.title)}</a>
            <span class="cap ce-hl-p">${esc(h.publisher || 'unattributed')}${h.published ? ` &middot; ${esc(h.published)}` : ''}</span>
          </li>`).join('\n          ');

  return `    <div class="wrap ce-wrap">
      <div class="ce-card ce-quiet">
        <div class="ce-head">
          <p class="lbl ce-eyebrow">Current situation</p>
          <span class="ce-track ce-track-q"><i class="ce-dot" aria-hidden="true"></i>No major event being tracked</span>
        </div>
        <h2 class="ce-h ce-h-q">${wetNow} of ${total} monitored cities are running above their own
          rainfall normal${seasonTo ? ` this season, to ${esc(seasonTo)}` : ' this season'}.</h2>
        <p class="ce-said">Nothing in the last two days crossed this page&rsquo;s threshold for a
          major climate event in India or its immediate region. That is a statement about what was
          reported and what the alert feeds carried &mdash; not a guarantee that nothing happened.</p>
        ${recent ? `<p class="lbl ce-lbl">Latest in the register</p>
        <ul class="ce-hls">
          ${recent}
        </ul>` : ''}
        <p class="ce-meta">
          <span>News and official alert feeds are re-read every 30 minutes</span>
          <i class="ce-sep">&middot;</i>
          <span>this page last changed ${stamp(checkedMs)}</span>
        </p>
        <p style="margin:0"><a class="act" href="#said">The whole register ${ARROW}</a></p>
      </div>
    </div>`;
}

/* ── CSS ────────────────────────────────────────────────────────────────── */
export const CE_CSS = `
/* ══ THE CURRENT-SITUATION BAND ═══════════════════════════════════════════ */
.ce-wrap{padding-top:clamp(26px,3vw,44px);padding-bottom:clamp(26px,3vw,44px)}
.ce-card{border-top:2px solid var(--hair);padding-top:clamp(14px,1.6vw,20px);position:relative}
.ce-live-card{border-top-color:var(--red)}
.ce-head{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:clamp(10px,1.2vw,16px)}
.ce-eyebrow{color:var(--fg-3);margin:0}
.ce-flag{color:var(--red)}
.ce-sep{font-style:normal;color:var(--fg-4);margin:0 .35em}
.ce-track{display:inline-flex;align-items:center;gap:7px;margin-left:auto;font-size:10px;
  letter-spacing:.08em;text-transform:uppercase;font-family:Archivo,system-ui,sans-serif;
  padding:4px 9px;border:1px solid var(--hair);color:var(--fg-2);white-space:nowrap}
.ce-live-card .ce-track{color:var(--red);border-color:rgba(241,72,78,.42)}
.ce-dot{width:6px;height:6px;border-radius:50%;background:currentColor;flex:none}
.ce-live-card .ce-dot{animation:ce-pulse 2s ease-in-out infinite}
@keyframes ce-pulse{0%,100%{opacity:1}50%{opacity:.3}}
@media (prefers-reduced-motion:reduce){.ce-live-card .ce-dot{animation:none}}

.ce-h{font-size:clamp(23px,2.9vw,40px);line-height:1.12;margin:0 0 .4em;max-width:22ch;
  letter-spacing:-.01em;text-wrap:balance}
.ce-h-q{font-size:clamp(19px,2.1vw,28px);color:var(--fg-2);max-width:30ch;font-weight:400}
.ce-meta{display:flex;flex-wrap:wrap;align-items:center;gap:2px;font-size:13px;color:var(--fg-3);
  margin:0 0 1.2em;font-variant-numeric:tabular-nums}
.ce-place{color:var(--fg-2)}

/* STATUS ROW. */
.ce-status{display:grid;grid-template-columns:repeat(2,1fr);gap:1px;background:var(--hair-2);
  margin:0 0 clamp(16px,1.8vw,24px)}
.ce-stat{background:var(--ground-2);padding:12px 13px}
.ce-stat-v{display:block;font-size:clamp(24px,2.4vw,34px);line-height:1;color:var(--red);
  font-variant-numeric:tabular-nums}
.ce-stat.is-none .ce-stat-v{color:var(--fg-4)}
.ce-stat-l{display:block;color:var(--fg-2);margin-top:5px}
.ce-stat-n{display:block;color:var(--fg-4);margin-top:2px}
.ce-stat-n .ce-st{font-style:normal;margin-right:5px}

.ce-rel{border-left:2px solid var(--hair);padding:2px 0 2px 15px;margin:0 0 1em;max-width:60ch;
  font-size:clamp(14px,1vw,16px);line-height:1.55;color:var(--fg-2)}
.ce-rel-l{display:block;color:var(--fg-3);margin-bottom:.25em}
.ce-said{font-size:clamp(15px,1.1vw,17.5px);line-height:1.6;color:var(--fg-2);max-width:60ch;margin:0 0 1em}
.ce-why-p{font-size:clamp(15px,1.05vw,17px);line-height:1.6;color:var(--fg-2);max-width:60ch;margin:0 0 1em}
.ce-auto{font-size:13.5px;line-height:1.6;color:var(--fg-3);max-width:62ch;margin:0 0 1.2em;
  border-left:2px solid var(--hair-2);padding-left:15px}
.ce-auto b{color:var(--fg-2)}
.ce-lbl{display:block;color:var(--fg-3);margin:clamp(20px,2.2vw,30px) 0 .55em}

/* PHOTO. */
.ce-fig{margin:clamp(16px,1.8vw,24px) 0;padding:0}
.ce-img{display:block;width:100%;height:auto;filter:grayscale(1) contrast(1.05);opacity:.72}
.ce-figc{color:var(--fg-4);margin:.5em 0 0;max-width:62ch}
.ce-figc b{color:var(--fg-3)}

/* THE PATH TO INDIA. */
.ce-path{display:flex;flex-wrap:wrap;gap:0;margin:.2em 0 1em;border-top:1px solid var(--hair-2);
  border-bottom:1px solid var(--hair-2)}
.ce-path-n{flex:1 1 var(--w);min-width:110px;padding:12px 12px 12px 0;position:relative;
  display:flex;align-items:center;gap:9px}
.ce-path-n b{font-weight:400;font-size:13.5px;color:var(--fg-2)}
.ce-path-n.is-start b{color:var(--red)}
.ce-path-n.is-end b{color:var(--fg)}
.ce-path-d{width:8px;height:8px;flex:none;border:1px solid var(--fg-4);border-radius:50%}
.ce-path-n.is-start .ce-path-d{background:var(--red);border-color:var(--red)}
.ce-path-n.is-end .ce-path-d{background:var(--fg);border-color:var(--fg)}
.ce-path-n:not(:last-child)::after{content:'';position:absolute;left:4px;top:50%;width:100%;
  height:1px;background:var(--hair);z-index:0}
.ce-path-n>*{position:relative;z-index:1;background:var(--ground-2)}
.ce-path-n b{padding-right:8px}
.ce-watch{max-width:62ch;color:var(--fg-3);margin:.4em 0 0}
.ce-watch b{color:var(--fg-2)}

/* LIVE CONDITIONS. */
.ce-live{display:grid;grid-template-columns:repeat(2,1fr);gap:1px;background:var(--hair-2);margin:.2em 0 0}
.ce-lv{background:var(--ground-2);padding:11px 13px}
.ce-lv-v{display:block;font-size:clamp(20px,1.9vw,27px);line-height:1;color:var(--fg);
  font-variant-numeric:tabular-nums}
.ce-lv-v i{font-style:normal;font-size:.45em;color:var(--fg-3);margin-left:.25em}
.ce-lv-l{display:block;color:var(--fg-3);margin-top:5px}
.ce-bars{display:flex;align-items:flex-end;gap:2px;height:52px;margin:10px 0 2px}
.ce-bar{flex:1 1 0;min-width:3px;height:var(--h);background:var(--fg-3);border-radius:1px 1px 0 0}
.ce-bars-c,.ce-live-c{color:var(--fg-4);max-width:62ch;margin:.4em 0 0}
.ce-live-c b{color:var(--fg-3)}

/* CLAIMS. */
.ce-claims{display:grid;grid-template-columns:1fr;gap:1px;background:var(--hair-2);margin:.2em 0 .4em}
.ce-claim{background:var(--ground-2);padding:11px 13px;display:grid;
  grid-template-columns:auto 1fr auto;gap:3px 11px;align-items:baseline}
.ce-claim-v{font-size:clamp(19px,1.7vw,25px);line-height:1.05;color:var(--fg);
  font-variant-numeric:tabular-nums;grid-row:span 2}
.ce-claim-v i{font-style:normal;font-size:.5em;color:var(--fg-3);margin-left:.2em}
.ce-claim-k{color:var(--fg-2);align-self:center}
.ce-claim-s{grid-column:2;color:var(--fg-3)}
.ce-claim-n{grid-column:2/-1;color:var(--fg-4);margin-top:2px}
.ce-st{font-size:9.5px;letter-spacing:.07em;text-transform:uppercase;padding:3px 7px;
  font-family:Archivo,system-ui,sans-serif;border:1px solid;white-space:nowrap;align-self:center}
.ce-st-confirmed{color:var(--fg);border-color:var(--hair)}
.ce-st-estimate{color:var(--fg-2);border-color:var(--hair-2)}
.ce-st-media{color:var(--fg-3);border-color:var(--hair-2)}
.ce-st-prelim{color:var(--red);border-color:rgba(241,72,78,.42)}

/* TIMELINE, LISTS. */
.ce-tls{list-style:none;margin:.2em 0 .4em;padding:0}
.ce-tl{display:grid;grid-template-columns:minmax(90px,auto) 1fr;gap:4px 14px;padding:8px 0;
  border-bottom:1px solid var(--hair-2);font-size:14px;line-height:1.5}
.ce-tl-w{color:var(--fg-3);font-variant-numeric:tabular-nums}
.ce-tl-t{color:var(--fg-2)}
.ce-unc,.ce-kn,.ce-watchl,.ce-sats{margin:.2em 0 .6em;padding-left:1.15em;max-width:62ch}
.ce-unc li,.ce-kn li,.ce-watchl li,.ce-sats li{font-size:14px;line-height:1.55;color:var(--fg-3);margin:0 0 .5em}
.ce-kn li{color:var(--fg-2)}
.ce-sat{font-size:14px;line-height:1.55;color:var(--fg-3);max-width:62ch;margin:0 0 .6em}

/* WHY THIS HAPPENS. */
.ce-whys{display:grid;grid-template-columns:1fr;gap:1px;background:var(--hair-2);margin:.2em 0 .3em}
.ce-why-c{background:var(--ground-2);padding:13px}
.ce-why-h{display:block;color:var(--fg-3);margin:0 0 .4em}
.ce-why-t{font-size:14px;line-height:1.55;color:var(--fg-2);margin:0}
.ce-why-c2,.ce-why-c{max-width:none}
.ce-why-c{}
p.ce-why-c{max-width:62ch;color:var(--fg-4);margin:.5em 0 0}

/* SOURCES. */
.ce-det{border-top:1px solid var(--hair-2);margin-top:clamp(16px,1.8vw,24px)}
.ce-sum{cursor:pointer;padding:12px 0;font-size:13px;color:var(--fg-2);list-style:none}
.ce-sum::-webkit-details-marker{display:none}
.ce-sum::before{content:'+';display:inline-block;width:1.1em;color:var(--fg-3)}
.ce-det[open] .ce-sum::before{content:'\\2212'}
.ce-det-in{padding:0 0 14px}
.ce-src-h{display:block;color:var(--fg-3);margin:.6em 0 .4em}
.ce-srcs{list-style:none;margin:0 0 .8em;padding:0}
.ce-src-i{padding:6px 0;border-bottom:1px solid var(--hair-2)}
.ce-src-t{display:block;font-size:13.5px;line-height:1.45;color:var(--fg-2);text-decoration:none}
a.ce-src-t:hover{color:var(--fg);text-decoration:underline}
.ce-src-p{display:block;color:var(--fg-4);margin-top:1px}
.ce-det-n{max-width:60ch;color:var(--fg-4);margin:.6em 0 0}

/* PRECEDENTS AND CONTEXT. */
.ce-ctx-lead{font-size:clamp(14.5px,1.02vw,16.5px);line-height:1.6;color:var(--fg-2);max-width:62ch;margin:0 0 .9em}
.ce-claims-ctx .ce-claim-v{color:var(--fg-2)}
.ce-precs{list-style:none;margin:.2em 0 .6em;padding:0}
.ce-prec{display:grid;grid-template-columns:minmax(90px,auto) 1fr;gap:2px 14px;padding:9px 0;
  border-bottom:1px solid var(--hair-2)}
.ce-prec-w{color:var(--fg-3);font-size:13px;font-variant-numeric:tabular-nums}
.ce-prec-t{color:var(--fg-2);font-size:14px;line-height:1.5}
.ce-prec-n{grid-column:2;color:var(--fg-4)}
.ce-ctx-src{max-width:62ch;color:var(--fg-4);margin:.8em 0 0}
.ce-stamp{color:var(--fg-4);margin:clamp(18px,2vw,26px) 0 0;max-width:62ch}

/* HEADLINES IN THE QUIET STATE. */
.ce-hls{list-style:none;margin:.2em 0 1em;padding:0;max-width:66ch}
.ce-hl{padding:8px 0;border-bottom:1px solid var(--hair-2)}
.ce-hl-t{display:block;font-size:14.5px;line-height:1.45;color:var(--fg-2);text-decoration:none}
a.ce-hl-t:hover{color:var(--fg);text-decoration:underline}
.ce-hl-p{display:block;color:var(--fg-4);margin-top:1px}

@media (min-width:760px){
  .ce-claims{grid-template-columns:1fr 1fr}
  .ce-status{grid-template-columns:repeat(4,1fr)}
  .ce-live{grid-template-columns:repeat(4,1fr)}
  .ce-whys{grid-template-columns:1fr 1fr}
}
@media (max-width:639px){
  .ce-track{margin-left:0}
  .ce-claim{grid-template-columns:1fr auto}
  .ce-claim-v{grid-row:auto}
  .ce-claim-s,.ce-claim-n{grid-column:1/-1}
  .ce-tl,.ce-prec{grid-template-columns:1fr;gap:2px}
  .ce-path-n{flex:1 1 100%;min-width:0}
  .ce-path-n:not(:last-child)::after{display:none}
}
`;

/* THE COMPACT BANNER on /now/climate-event. Small on purpose — see renderBanner. */
export const CE_BANNER_CSS = `
.ce-ban{display:flex;align-items:center;gap:clamp(14px,2vw,28px);flex-wrap:wrap;
  border-top:2px solid var(--red);border-bottom:1px solid var(--hair-2);
  padding:clamp(14px,1.7vw,22px) 0;text-decoration:none;color:inherit}
.ce-ban:hover .ce-ban-h{color:var(--fg)}
.ce-ban:hover .ce-ban-go{color:var(--mustard)}
.ce-ban:focus-visible{outline:2px solid var(--fg);outline-offset:3px}
.ce-ban-l{flex:1 1 320px;min-width:0;display:block}
.ce-ban-k{display:flex;align-items:center;gap:7px;color:var(--red);margin-bottom:.5em}
.ce-ban-h{display:block;font-family:Newsreader,Georgia,serif;
  font-size:clamp(18px,1.9vw,26px);line-height:1.2;color:var(--fg-2);max-width:34ch;
  margin-bottom:.4em;text-wrap:balance}
.ce-ban-m{display:block;color:var(--fg-4)}
.ce-ban-go{flex:none;font-family:Archivo,system-ui,sans-serif;font-size:11px;
  letter-spacing:.07em;text-transform:uppercase;color:var(--fg-3);
  display:inline-flex;align-items:center;gap:8px}
.ce-ban-go svg{width:15px;height:15px}
@media (max-width:639px){.ce-ban-go{margin-left:auto}}
`;

/* ── THE ONLY SCRIPT ON THESE PAGES ───────────────────────────────────────
   Rewrites the absolute stamps written by stamp() into relative ages. It
   touches ONLY <time class="ce-t"> elements, never a reading — the rule that
   nothing on this site repaints a figure is intact, because a clock is not a
   figure and the absolute value stays in the title attribute either way.

   It runs once on load. There is deliberately no setInterval: a page that
   silently re-counts itself while you read is a liability on a disaster page,
   and the difference between "8 minutes ago" and "9 minutes ago" is not worth
   a timer that keeps running in a background tab. */
export const CE_TIME_JS = `
(function(){
  var N = ['ce-t'];
  function rel(ms){
    var s = Math.max(0, Math.round((Date.now() - ms) / 1000));
    if (s < 90) return 'just now';
    var m = Math.round(s / 60);
    if (m < 90) return m + ' minute' + (m === 1 ? '' : 's') + ' ago';
    var h = Math.round(m / 60);
    if (h < 36) return h + ' hour' + (h === 1 ? '' : 's') + ' ago';
    var d = Math.round(h / 24);
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
