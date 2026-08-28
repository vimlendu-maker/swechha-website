#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════
   build-climate-disaster-pages.mjs — ONE ACTIVE-SITUATION PAGE PER EVENT.
   ───────────────────────────────────────────────────────────────────────────
   Two things live at /now/climate-event and they have opposite clocks:

     /now/climate-event            THE SITUATION. India's extreme rain as a
                                   standing subject — rainfall against IMD's
                                   categories, deaths by cause, twelve cities,
                                   the trend. Moves once a year. Never ends.

     /now/climate-event/<slug>     THE ACTIVE SITUATION. One developing
                                   catastrophe, at the front of the site for a
                                   fortnight and then an archive. Moves every
                                   half hour.

   ★ THE PAGE IS NOW BANDS, NOT ONE BAND, AND THAT IS THE REDESIGN.
   The version this replaces was a single `board` band holding eleven stacked
   subsections inside one bordered card — so the shell's whole layout system
   (band grounds, `opener()` headings, the section index in the header, the
   `.navscroll` contents strip, anchor links) applied to exactly one thing
   called "The situation", and a reader had no way to jump to the map or the
   satellite imagery because as far as the document was concerned there was
   nowhere to jump to. Twelve bands means twelve entries in the contents list,
   twelve anchors, and a page that can be scanned by heading the way /now/air
   is.

   ★ THE GROUND CHAIN IS COMPUTED, NOT CHOSEN.
   groundChain() refuses to write when two adjacent bands share a background,
   so the light/dark alternation below is checked rather than eyeballed. Two
   bands are deliberately PAPER: the precedents (history reads as reference,
   not alarm) and the sources (a bibliography on the light ground is the
   convention this site already uses on /now/air's "What it costs").

   ★ ONLY PUBLISHED EVENTS GET A PAGE, unchanged. A draft the detector scored
   below threshold has no page and no route, which is what stops one
   mis-scraped headline from minting a URL. `situation_status` decides
   PROMINENCE, never existence — a demoted event keeps its page for ever.

   ★ THE ROUTE IS DERIVED FROM THE SAME FILES, unchanged. design-routes.ts
   reads data/climate-events/active/ and routes exactly the published ones, so
   a page cannot be built and left unrouted.
   ═══════════════════════════════════════════════════════════════════════════ */
import { mkdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import * as S from './lib/situation-shell.mjs';
import { loadEvents, isCurrent, loadContext, istStamp } from './lib/climate-events.mjs';
import { coordsFor } from './lib/event-terms.mjs';
import { statusOf, adminHelp, TYPE_LABEL, situationHref } from './lib/active-situation.mjs';
import { eventName } from './lib/event-figures.mjs';
import {
  heroBand, explainBand, whereBand, causeBand, eoBand, timelineBand,
  precedentBand, nextBand, climateBand, indiaBand, sourcesBand, strip, AS_CSS, AS_JS,
} from './lib/situation-render.mjs';

const { ARROW, crumb, siblings } = S;

const HAZARD_LABEL = {
  glof: 'Glacial lake outburst flood', cloudburst: 'Cloudburst', flood: 'Flood',
  landslide: 'Landslide', cyclone: 'Cyclone', extreme_rain: 'Extreme rainfall',
};

const J = (p) => (existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null);

/** A meta description inside assemble()'s 140-158 character window, built from
 *  the event's own facts and trimmed on a word boundary. Unchanged in method
 *  from the version this replaces; it now leads on the event's NAME rather
 *  than its hazard noun, because that is what the page's own heading says. */
function description(e) {
  const hazard = (HAZARD_LABEL[e.hazard] || e.hazard).toLowerCase();
  const where = e.location.text;
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
    d = d.slice(0, d.lastIndexOf(' ')).replace(/[ ,;:–—-]+$/, '') + '.';
  }
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
.dz-back{padding-top:clamp(30px,3.4vw,50px);padding-bottom:clamp(30px,3.4vw,50px)}
.dz-back-l{display:block;color:var(--fg-3);margin:0 0 .5em}
.dz-back-t{font-size:clamp(15px,1.15vw,18px);line-height:1.6;color:var(--fg-2);max-width:60ch;margin:0 0 1.1em}
`;

const published = loadEvents().filter((e) => e.publish_state === 'published');

if (!published.length) {
  console.log('No published events. No situation pages to build — this is a normal quiet state.');
  process.exit(0);
}

mkdirSync(join(S.ROOT, 'public', '_pages', 'v3', 'climate-event'), { recursive: true });

let built = 0;
for (const e of published) {
  const sh = S.shell();
  const ctx = e.contextMissing ? null : loadContext(e.hazard);
  const imagery = J(join(S.ROOT, 'data/climate-events/imagery', `${e.slug}.json`));

  /* ── SUPPLIED IMAGERY: ONLY WHAT IS ACTUALLY ON DISK ──────────────────
     A dossier may name a higher-resolution before/after that an editor has
     permission to publish. It is filtered HERE, against the filesystem, so a
     named-but-not-yet-committed image produces no markup rather than a broken
     picture on a live disaster page — and so the page degrades to the NASA
     frames on its own the moment a file is missing. */
  if (imagery && (e.owner_images || []).length) {
    /* Every file an entry names must exist — whether it is a registered
       before/after pair or a list of separate frames. A named-but-uncommitted
       image renders nothing rather than a broken tag. */
    const has = (src) => !src || existsSync(join(S.ROOT, 'public', src.replace(/^\//, '')));
    const onDisk = e.owner_images
      .map((img) => (img.frames
        ? { ...img, frames: img.frames.filter((f) => has(f.src)) }
        : img))
      .filter((img) => ['before', 'after'].every((k) => has(img[k])))
      .filter((img) => img.before || img.after || (img.frames || []).length);
    if (onDisk.length) imagery.supplied = onDisk;
    const missing = e.owner_images.length - onDisk.length;
    if (missing) {
      console.log(`  ${e.slug}: ${missing} supplied image set(s) named in the dossier have no file `
        + 'on disk yet — not rendered. Commit the files and rebuild.');
    }
  }
  const st = statusOf(e);
  const route = situationHref(e);

  /* ── THE BANDS ────────────────────────────────────────────────────────
     Built as a list of [id, class, ground] and then FILTERED by whether the
     renderer produced anything for that id — an event with no context pack has
     no cause band and no precedents, and an empty band with a heading is worse
     than a missing one. The ground chain is computed AFTER the filter, so a
     dropped band cannot leave two identical grounds adjacent. */
  const sections = {
    top: () => heroBand(e, ctx, imagery, { crumb: crumb('climate') }),
    strip: () => strip(e, ctx, imagery),
    explain: () => explainBand(e, ctx),
    where: () => whereBand(e, ctx, imagery, coordsFor),
    cause: () => causeBand(e, ctx),
    eo: () => eoBand(e, imagery),
    developing: () => timelineBand(e),
    pattern: () => precedentBand(e, ctx),
    next: () => nextBand(e, ctx),
    climate: () => climateBand(e, ctx),
    india: () => indiaBand(e, ctx),
    sources: () => sourcesBand(e),
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

  /* Rendered once, up front, so a band that returns null is dropped from the
     band list, the index and the ground chain together and cannot fall out of
     step with any of the three. */
  const html = {};
  for (const [id, fn] of Object.entries(sections)) html[id] = fn();

  /* [id, class, ground, contents-label]. `paper` bands carry the light ground
     and the CSS flips every token; see the PAPER block in AS_CSS. */
  /* ── THE ORDER, AND THE ONE CHANGE THE OWNER ASKED FOR ────────────────
     `climate` — "the numbers we cannot ignore" — comes THIRD, immediately after
     the hero and its readings strip. It was tenth. The instruction was to bring
     it up, and it is also the order the owner's own briefing runs in: the event,
     then the counted scale of the risk, then everything else. It is the band
     that answers why a Nepal event is on an Indian site, so a reader who leaves
     after two screens has still had the argument.

     `india` follows the geography and the evidence rather than closing the
     page, because "the alarm for India" only lands once the reader has seen
     what happened and what caused it.

     A BAND WITH NOTHING IN IT DOES NOT APPEAR. Each renderer returns null when
     it has no content, `.filter` drops it here, and the ground chain and the
     contents index are both derived AFTER the filter — so an absent band cannot
     leave two identical grounds adjacent or a dead anchor in the header. */
  const ALL = [
    ['top', 't1', '#0D0D0B', 'The situation'],
    ['strip', '', '#151512', null],
    /* ★ THE DEFINITION COMES BEFORE THE ARGUMENT. Every band after this one
       was written for a reader who already knows what the hazard is; most
       people arriving from a news cycle do not. It sits after the readings
       strip rather than between the hero and its strip, because that pair is
       one unit on all six situation pages. */
    ['explain', 't2', '#0D0D0B', 'What it is'],
    ['climate', 'dark-2 t2', '#151512', 'The numbers'],
    ['where', 'dark-2 t2', '#151512', 'Where'],
    ['cause', 'dark-2 t2', '#151512', 'What caused it'],
    ['eo', 't2', '#0D0D0B', 'Satellite'],
    ['developing', 'dark-2 t2', '#151512', 'How it developed'],
    ['pattern', 'paper t2', '#F3F2F0', 'It has happened before'],
    ['india', 't2', '#0D0D0B', 'The alarm for India'],
    ['next', 'dark-2 t2', '#151512', 'What happens next'],
    ['sources', 'paper t2', '#F3F2F0', 'Data and sources'],
    ['back', 't2', '#0D0D0B', null],
    ['act', 'dark-2 t3', '#151512', 'What you can do'],
  ].filter(([id]) => html[id]);

  /* ── THE GROUND CHAIN, AFTER THE FILTER ───────────────────────────────
     A dropped band can put two bands of the same ground next to each other, so
     the classes are re-derived from the surviving order rather than trusted
     from the table above. The table's ground is the PREFERENCE; what ships is
     an alternation that cannot clash, and groundChain() below is what proves
     it rather than an eye.

     THE TWO PAPER BANDS ARE FIXED POINTS. History reads as reference and a
     bibliography reads as reference, and both belong on the light ground the
     way /now/air puts "What it costs" there. Everything else alternates
     between the two darks around them. */
  const PAPER = '#F3F2F0';
  const D1 = '#0D0D0B';
  const D2 = '#151512';
  const KEEP_PAPER = new Set(['pattern', 'sources']);

  /* ★ THE LAST TWO BANDS ARE PINNED, AND THE REASON IS THE FOOTER.
     The shared footer is #151512, and groundChain() counts it as the band after
     the last one — so a closing band that alternates freely lands on #151512
     half the time and the page ends with the footer invisibly welded to it.
     Every other situation page pins its closing band to the darker-not-#151512
     ground for exactly this reason; /now/air ends `['act','t3','#0D0D0B']`.
     Pinning both tail bands rather than only `act` keeps the pair alternating
     with each other too. */
  const PINNED = { strip: D2, back: D2, act: D1 };

  let last = null;
  const BANDS = ALL.map(([id, , , label], i) => {
    if (KEEP_PAPER.has(id)) {
      last = PAPER;
      return [id, `paper t${i === 0 ? 1 : 2}`, PAPER, label];
    }
    const g = PINNED[id] ?? (last === D1 ? D2 : D1);
    last = g;
    const tier = i === 0 ? 't1' : (id === 'act' ? 't3' : 't2');
    return [id, `${g === D2 ? 'dark-2 ' : ''}${id === 'strip' ? '' : tier}`.trim(), g, label];
  });

  const clashes = S.groundChain(BANDS, D2);
  const INDEX = BANDS.filter(([, , , label]) => label).map(([id, , , label]) => [label, `#${id}`]);

  await S.assemble({
    file: join('climate-event', `${e.slug}.html`),
    /* THE TITLE LEADS ON THE EVENT'S NAME, not the outlet's headline. The
       version this replaces sliced the detector's chosen headline to 60
       characters, which on this event produced the browser tab
       "Nepal floods: 6 ways to help victims of the glacial collapse". */
    title: `${eventName(e)} — ${TYPE_LABEL.toLowerCase()} — Swechha`,
    route,
    desc: description(e),
    bands: BANDS.map(([id, cls]) => [id, cls]),
    index: INDEX,
    sh,
    clashes,
    pageCss: AS_CSS + DZ_CSS,
    script: S.NEWSLETTER_JS + AS_JS,
    sectionFor: (id) => html[id] || '    <div class="wrap"><p class="lead">&mdash;</p></div>',
    note: `${e.hazard} @ ${e.location.text} — ${st.label.toUpperCase()} (${st.source}), `
        + `score ${e.significance_score}, ${e.origin}, `
        + `${e.corroboration.independent_publishers} publishers, `
        + `${e.corroboration.official_alerts} official alerts, `
        + `${BANDS.length} bands. `
        + `Imagery: ${imagery?.after ? `${imagery.after.layerName} ${imagery.after.date}` : 'pending'}. `
        + `Checked ${istStamp(e.last_checked?.epochMs || e.last_updated.epochMs)}.`,
  });
  built++;
}

console.log(`\n${built} active-situation page(s) built under public/_pages/v3/climate-event/.`);

/* ── THE ADMIN SURFACE IS THIS PRINTOUT ───────────────────────────────────
   There is no CMS on this route and one would be the wrong shape for five
   words: these pages are built by a cron job from a git-committed dossier, so
   the durable, reviewable, revertible place for an editorial decision is the
   dossier. What an operator needs is therefore not a form but the exact edit,
   printed where they are already looking. */
console.log('\nLIFECYCLE — promote, hold, stabilise, demote or archive by editing the dossier:');
for (const e of published) {
  console.log(adminHelp(e));
  console.log(`      ${situationHref(e)}${isCurrent(e) ? '' : '   (past its 14-day evidence window)'}`);
}
