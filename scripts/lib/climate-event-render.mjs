/* ═══════════════════════════════════════════════════════════════════════════
   climate-event-render.mjs — THE SITUATION BOARD AT THE TOP OF /now/climate-event.
   ───────────────────────────────────────────────────────────────────────────
   Two states, one band:

     ACTIVE   a COMPACT banner: an event is being tracked, the four figures that
              fit on one line, and a link to its own page. The full board used to
              be here and is now fifteen bands in situation-render.mjs — see the
              note further down for what moved and what was replaced.

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
import { esc, ARROW } from './situation-shell.mjs';
import { CLAIM_STATUS, istStamp } from './climate-events.mjs';
import { eventName } from './event-figures.mjs';

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

/* ═══ THE FULL BOARD LIVES IN situation-render.mjs NOW ═══════════════════
   `renderEvent()` was here — one function emitting the whole
   /now/climate-event/<slug> page as a single bordered card with eleven stacked
   subsections inside it. It is replaced, not moved: the page is fifteen bands
   built by scripts/lib/situation-render.mjs, so the shell's own layout system
   (band grounds, `opener()` headings, the header's section index, anchors a
   reader can jump to) applies to each question the page answers instead of to
   one thing called "The situation".

   WHAT WENT WITH IT, and each was load-bearing for that design and is not for
   this one:

     statusRow()      four cells rendered unconditionally, with an em dash and
                      "not established" in any it had no figure for. The new
                      hero renders a card per figure that EXISTS, and the
                      figures exist because event-figures.mjs reads them out of
                      the headlines the page was already citing.
     HAZARD_PHOTO     a stock Himalayan valley under a live disaster headline,
                      with a caption confessing it was not a photograph of the
                      event. The page now publishes the actual NASA frame for
                      the region and the dates either side, or prints why it
                      cannot — see scripts/lib/event-imagery.mjs.
     liveConditions() the rainfall panel. The forecast series it read now
                      drives a COMPUTED risk level in the "what happens next"
                      band, against IMD's published day categories.
     riverPath()      the flat origin-to-India chain. Now a real projected map
                      of the downstream places plus the chain as a separate
                      diagram, because they answer two different questions.
     claim()          the generic figure row, superseded by the metric card and
                      the per-outlet ledger under it.

   ★ CE_CSS BELOW IS DELIBERATELY NOT TRIMMED. Some of its rules were only ever
   used by the function above and are now dead weight on /now/climate-event's
   stylesheet. Cutting them is a change to a page that is not in this pass's
   scope, and the banner and the quiet state below share several of them; the
   right time is the next time that page is opened on purpose. */

/* ── THE COMPACT BANNER ───────────────────────────────────────────────────
   What /now/climate-event shows when something is happening. Deliberately
   small: that page's job is the standing national picture, and a full board
   above it pushed the death table, the twelve cities and the trend section
   below three screens of something with a completely different clock. This
   states that an event is live, gives the four figures that fit on one line,
   and gets out of the way — the board itself is one click down. */
export function renderBanner(e) {
  const hazard = HAZARD_LABEL[e.hazard] || e.hazard;
  const deaths = e.impact?.deaths;
  return `    <div class="wrap ce-wrap">
      <a class="ce-ban" href="/now/climate-event/${esc(e.slug)}">
        <span class="ce-ban-l">
          <span class="lbl ce-ban-k"><i class="ce-dot" aria-hidden="true"></i>Active situation
            <i class="ce-sep">&middot;</i>${esc(hazard)}
            <i class="ce-sep">&middot;</i>${e.tier === 1 ? 'In India' : 'Regional'}</span>
          <!-- THE EVENT'S NAME, NOT THE OUTLET'S HEADLINE. The detector picks the
               least-penalised real headline and prints it verbatim, which is
               right for the reporting and wrong for a heading: on the Nepal
               event it chose "Nepal floods: 6 ways to help victims of the
               glacial collapse that left hundreds dead or missing" — a service
               piece — and that was the largest text in this banner and the
               browser tab of the page it links to. The headline keeps its place
               on that page, as the reporting it is. -->
          <span class="ce-ban-h">${esc(eventName(e))}</span>
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
          <span>News and official alert feeds are re-read every hour</span>
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
