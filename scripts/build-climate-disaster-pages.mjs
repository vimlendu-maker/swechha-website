#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════
   build-climate-disaster-pages.mjs — ONE PAGE PER DISASTER.
   ───────────────────────────────────────────────────────────────────────────
   The situation board began life bolted to the top of /now/climate-event, and
   it did not fit. That page has a job — the standing national picture of
   extreme rain, its death table, its twelve cities, its trends — and a full
   disaster board pushed all of it below three screens of something else. The
   two things also have opposite clocks: the archive moves once a year, the
   disaster moves every half hour.

   So they are two pages now:

     /now/climate-event            the standing picture. Rainfall against IMD's
                                   categories, deaths by cause, drought and
                                   landslide context, the twelve cities. It
                                   carries a COMPACT banner when something is
                                   happening, and links here.

     /now/climate-event/<slug>     this. One page per published event, the full
                                   board: status row, live conditions, the path
                                   to India, timeline, mechanism, precedents,
                                   what is not known, every source.

   ★ ONLY PUBLISHED EVENTS GET A PAGE.
   A draft — anything the detector scored below threshold — has no page and no
   route. It sits in data/ waiting for corroboration or expiry. That is what
   keeps a single mis-scraped headline from minting a URL.

   ★ THE ROUTE IS DERIVED FROM THE SAME FILES.
   design-routes.ts reads data/climate-events/active/ and routes exactly the
   published ones, the same way it derives the sixteen WORK routes from
   onward.json. A page cannot be built and left unrouted, and a route cannot
   point at a page that was never built.
   ═══════════════════════════════════════════════════════════════════════════ */
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import * as S from './lib/situation-shell.mjs';
import { loadEvents, isCurrent, loadContext, istStamp } from './lib/climate-events.mjs';
import { renderEvent, CE_CSS } from './lib/climate-event-render.mjs';

const { esc, ARROW, crumb, siblings } = S;

const HAZARD_LABEL = {
  glof: 'Glacial lake outburst flood', cloudburst: 'Cloudburst', flood: 'Flood',
  landslide: 'Landslide', cyclone: 'Cyclone', extreme_rain: 'Extreme rainfall',
};

/** A meta description inside assemble()'s 140–158 character window. Built from
 *  the event's own facts, then padded with the standing sentence and trimmed on
 *  a word boundary — never mid-word, and never below the floor. */
function description(e) {
  const hazard = (HAZARD_LABEL[e.hazard] || e.hazard).toLowerCase();
  const where = e.location.text;
  /* Built longest-first, then trimmed on a word boundary, because the window is
     narrow (140-158) and a place name can be one word or five. The clauses are
     ordered so that the ones carrying the most meaning survive the trim. */
  const clauses = [
    `A ${hazard} at ${where}, tracked from published reporting and official alert feeds.`,
    'What is claimed, who claims it, and what is still unknown.',
    'Every figure carries its source.',
  ];
  let d = '';
  for (const c of clauses) {
    if (d.length && d.length + 1 + c.length > 158) break;
    d = d ? `${d} ${c}` : c;
  }
  if (d.length > 158) {
    d = d.slice(0, 158);
    d = d.slice(0, d.lastIndexOf(' ')).replace(/[ ,;:\u2013\u2014-]+$/, '') + '.';
  }
  /* Still short? Extend with clauses that are true of every one of these pages,
     one word at a time, rather than shipping a page with no description or one
     the gate will reject. */
  const filler = 'Updated as the reporting is, and dated on this page.'.split(' ');
  let i = 0;
  while (d.length < 140 && i < filler.length) {
    const next = `${d} ${filler[i]}`;
    if (next.length > 158) break;
    d = next; i++;
  }
  if (d.length < 140 || d.length > 158) {
    d = `A ${hazard} tracked from published reporting and official alert feeds: `
      + 'what is claimed, who claims it, and what is not yet established.';
    if (d.length > 158) d = d.slice(0, 155).replace(/\s+\S*$/, '') + '.';
  }
  return d;
}


/* ═══ PAGE CSS ═══════════════════════════════════════════════════════════ */
const DZ_CSS = `
.dz-top{padding-top:clamp(20px,2.4vw,34px);padding-bottom:0}
.dz-kicker{display:block;color:var(--fg-3);margin:clamp(12px,1.4vw,18px) 0 0}
.dz-kicker i{font-style:normal;color:var(--fg-4);margin:0 .35em}
.dz-back{padding-top:clamp(30px,3.4vw,50px);padding-bottom:clamp(30px,3.4vw,50px)}
.dz-back-l{display:block;color:var(--fg-3);margin:0 0 .5em}
.dz-back-t{font-size:clamp(15px,1.15vw,18px);line-height:1.6;color:var(--fg-2);max-width:60ch;margin:0 0 1.1em}
`;

const published = loadEvents().filter((e) => e.publish_state === 'published');

if (!published.length) {
  console.log('No published events. No disaster pages to build — this is a normal quiet state.');
  process.exit(0);
}

mkdirSync(join(S.ROOT, 'public', '_pages', 'v3', 'climate-event'), { recursive: true });

let built = 0;
for (const e of published) {
  const sh = S.shell();
  const ctx = e.contextMissing ? null : loadContext(e.hazard);
  const hazard = HAZARD_LABEL[e.hazard] || e.hazard;
  const route = `/now/climate-event/${e.slug}`;

  /* THREE BANDS, and the ground chain still applies. The board is one long
     band because it is one continuous argument; the two after it are the way
     back to the standing page and the site's own closing. */
  const BANDS = [
    ['board', 'dark-2 t1', '#151512'],
    ['back',  't2',        '#0D0D0B'],
    ['act',   'dark-2 t3', '#151512'],
  ];
  const clashes = S.groundChain(BANDS, '#0D0D0B');

  const INDEX = [
    ['The situation', '#board'],
    ['The standing picture', '#back'],
    ['What you can do', '#act'],
  ];

  const B = {
    board: () => `    <div class="wrap dz-top">
${crumb('climate')}
      <p class="lbl dz-kicker">Climate event <i>&middot;</i> ${esc(hazard)} <i>&middot;</i>
        ${e.tier === 1 ? 'In India' : 'Regional, with Indian relevance'}</p>
    </div>
${renderEvent(e, ctx)}`,

    back: () => `    <div class="wrap dz-back">
      <p class="lbl dz-back-l">This is one event</p>
      <p class="dz-back-t">The standing picture &mdash; how much extreme rain India actually gets,
        what IMD counts as extreme, who the rain kills, and what is changing across twelve cities
        &mdash; is on the situation page this belongs to. That page moves slowly on purpose. This one
        moves every half hour.</p>
      <p style="margin:0"><a class="act" href="/now/climate-event">India&rsquo;s extreme rain ${ARROW}</a></p>
    </div>`,

    act: () => `    <div class="wrap">
${S.citeBlock('climate')}
${S.closing('climate')}
${siblings('climate')}
${S.newsletter('climate')}
    </div>`,
  };

  await S.assemble({
    file: join('climate-event', `${e.slug}.html`),
    title: `${e.headline.slice(0, 60)} — Swechha`,
    route,
    desc: description(e),
    bands: BANDS, index: INDEX, sh, clashes,
    pageCss: CE_CSS + DZ_CSS,
    script: S.NEWSLETTER_JS,
    sectionFor: (id) => (B[id] || (() => '    <div class="wrap"><p class="lead">&mdash;</p></div>'))(),
    note: `${e.hazard} @ ${e.location.text} — score ${e.significance_score}, ${e.origin}, `
        + `${e.corroboration.independent_publishers} publishers, `
        + `${e.corroboration.official_alerts} official alerts. `
        + `Checked ${istStamp(e.last_checked?.epochMs || e.last_updated.epochMs)}.`,
  });
  built++;
}

console.log(`\n${built} disaster page(s) built under public/_pages/v3/climate-event/.`);
console.log(published.map((e) => `  /now/climate-event/${e.slug}${isCurrent(e) ? '  (current)' : '  (past its hero window)'}`).join('\n'));
