/* ═══════════════════════════════════════════════════════════════════════════
   POSTERS  →  public/_pages/v3/posters.html, routed at /posters
   ───────────────────────────────────────────────────────────────────────────
   AD-26 R-4 assigned the GIZ marine-plastic posters to the marine-plastic
   campaign, and AD-42 carries that out: `/work/campaigns/no-plastic` shows the
   set as the campaign's argument. THIS page shows the same ten sheets as
   ARTEFACTS — each one's own title, what it says, and the credit printed on it.

   ★ THE TWO PAGES SHOW THE SAME IMAGES ON PURPOSE, AND THAT IS THE ONE THING
   TO GET RIGHT HERE. next.config.ts is explicit that this site does not want a
   second URL for the same content, so the difference has to be real: the
   campaign page frames the sheets as a demand, at campaign scale, inside the
   six-part spine; this page frames them as printed objects, with the credit
   line and the citation trail promoted to content. Same pixels, different
   claim. If this page ever becomes just the grid again, delete it and leave the
   band on the campaign.

   ★ NO POSTER IS LISTED IN THIS FILE OR IN data/posters.json.
   Every series reads its sheets out of the item that made them — for this one,
   data/work/campaigns/no-plastic.json. A title, an alt or a printed credit
   therefore exists once in this repo. Gate 1 fails the build if a series names
   a source that does not carry `posters`.

   ★ THE CREDIT IS QUOTED, NEVER COMPOSED. The string naming GIZ and the German
   federal environment ministry is read verbatim out of the item's
   `posters_credit`, which was transcribed off the artwork. This generator has
   no sentence of its own about who commissioned the work, and gate 3 refuses
   to write a page that names either partner outside that quoted string.

       node scripts/build-posters-page.mjs
   ═══════════════════════════════════════════════════════════════════════════ */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import * as S from './lib/situation-shell.mjs';
import { seo } from './lib/seo-register.mjs';
const { esc, opener, hole, ARROW, posterSheet, POSTER_CSS } = S;

const sh = S.shell();

/* ═══ DATA ═══════════════════════════════════════════════════════════════ */
const D = JSON.parse(readFileSync(join(S.ROOT, 'data/posters.json'), 'utf8'));

let dataBad = 0;
const dataFail = (m) => { console.error(`DATA IS WRONG: ${m}`); dataBad++; };

/* GATE 1, and it runs before anything is composed: a series whose source file
   is missing, unreadable or carries no posters is a series that would render an
   empty band, which every generator in this repo refuses. */
const SERIES = D.series.map((se) => {
  const abs = join(S.ROOT, se.source);
  if (!existsSync(abs)) {
    dataFail(`series "${se.id}" names source ${se.source}, which is not on disk.`);
    return { ...se, posters: [], credit: '', note: '' };
  }
  const item = JSON.parse(readFileSync(abs, 'utf8'));
  const posters = item.posters || [];
  if (!posters.length) {
    dataFail(`series "${se.id}" reads ${se.source}, which has no "posters" array. `
      + 'The posters live on the item that made them; this page never holds its own copy.');
  }
  for (const p of posters) {
    if (!existsSync(join(S.ROOT, 'public', p.src.replace(/^\//, '')))) {
      dataFail(`series "${se.id}" poster ${p.src} is not on disk.`);
    }
    if (!p.title || !p.alt) dataFail(`series "${se.id}" poster ${p.src} is missing a title or an alt.`);
  }
  if (!item.posters_credit) {
    dataFail(`series "${se.id}" source has no "posters_credit". A printed sheet whose credit we cannot `
      + 'quote does not get published here — the credit is the provenance.');
  }
  return { ...se, posters, credit: item.posters_credit || '', note: item.posters_note || '', itemName: item.name };
});

if (dataBad) {
  console.error(`\nREFUSING TO WRITE: ${dataBad} data check(s) failed.`);
  process.exit(1);
}

const ALL = SERIES.flatMap((se) => se.posters);

/* ═══ BANDS ══════════════════════════════════════════════════════════════ */
/* One band per series, so a second series is a data entry rather than a code
   change — the same reason the WORK generator reads `page: true` instead of
   counting pages. The ids are derived, so they cannot drift from the index. */
const SERIES_BANDS = SERIES.map((se, i) => [
  `s-${se.id}`, i % 2 === 0 ? 'paper t2' : 'dark-2 t2', i % 2 === 0 ? '#F3F2F0' : '#151512',
]);
const ALL_BANDS = [
  ['top', 't1', '#0D0D0B'],
  ...SERIES_BANDS,
  ['waiting', 'dark-2 t2', '#151512'],
  ['act', 't3', '#0D0D0B'],
];
const LIVE = { waiting: D.waiting.claims.length > 0 };
const BANDS = ALL_BANDS.filter(([id]) => LIVE[id] !== false);
const clashes = S.groundChain(BANDS);

const INDEX_ALL = [
  ['The posters', '#top'],
  ...SERIES.map((se) => [se.head, `#s-${se.id}`]),
  ['What is not here', '#waiting'],
  ['Put a set up', '#act'],
];
const BAND_IDS = new Set(BANDS.map((b) => b[0]));
const INDEX = INDEX_ALL.filter(([, href]) => BAND_IDS.has(href.slice(1)));

const B = {};

/* ── BAND 1. MASTHEAD, AND IT IS TYPE ONLY. ───────────────────────────────
   Every other landing page in this set opens on a photograph in a `.pic ht`
   box, which is `object-fit:cover`. The only images this page has are A3
   sheets, and cropping one to a 16/9 hero is precisely the failure the poster
   component exists to prevent — it would cut the headline off the first thing a
   reader sees. /search's type masthead is the pattern instead. */
const M = D.masthead;
B.top = () => `    <div class="wrap pst-mast">
      <p class="lbl eyebrow">${esc(M.kicker)}</p>
      <h1 class="d1">${M.h1}</h1>
      <p class="lead">${esc(M.lead)}</p>
      <p class="lbl pst-count">${ALL.length} sheets${SERIES.length > 1 ? `, ${SERIES.length} series` : ''}</p>
    </div>`;

/* ── ONE BAND PER SERIES. ─────────────────────────────────────────────────
   `says` is promoted to content here and is optional on the campaign page: on
   this page a reader is looking at sheets rather than reading an argument, so
   one line per sheet saying what it actually claims is the difference between
   an archive and a wall of thumbnails. */
for (const se of SERIES) {
  B[`s-${se.id}`] = () => `${opener(`s-${se.id}`, se.head, se.lead)}
    <div class="wrap">
${posterSheet({
    label: `${se.posters.length} sheets, as printed`,
    credit: se.credit,
    posters: se.posters,
    note: se.note,
  })}
${se.campaign ? `      <p class="pst-back"><a class="act" href="${esc(se.campaign)}">${esc(se.campaign_label || 'The campaign behind them')}${ARROW}</a></p>` : ''}
    </div>`;
}

/* ── WHAT IS NOT HERE. ────────────────────────────────────────────────────── */
B.waiting = () => `${opener('waiting', D.waiting.head, D.waiting.lead)}
    <div class="wrap">
${D.waiting.claims.map((c) => hole(c)).join('\n')}
    </div>`;

/* ── ACT. ─────────────────────────────────────────────────────────────────── */
B.act = () => `${opener('act', D.act.head, D.act.lead)}
    <div class="wrap">
      <p><a class="b b-1" href="${esc(D.act.href)}">${esc(D.act.cta)}${ARROW}</a></p>
    </div>`;

/* ═══ PAGE CSS ═══════════════════════════════════════════════════════════ */
/* POSTER_CSS is imported, not restated — it is the same component the WORK item
   pages render, and two copies of a grid is how the two pages come to disagree
   about what a sheet looks like. */
const PAGE_CSS = `${POSTER_CSS}
.pst-mast{padding-block:clamp(46px,7vw,88px)}
.pst-mast .lead{max-width:52ch}
.pst-count{color:var(--fg-2);margin:clamp(18px,2vw,26px) 0 0}
.pst-back{margin:clamp(20px,2.4vw,30px) 0 0}
`;

/* ═══ WRITE ══════════════════════════════════════════════════════════════ */
const OUT = await S.assemble({
  file: 'posters.html',
  route: '/posters',
  title: seo('/posters').title,
  bands: BANDS, index: INDEX, sh, clashes,
  pageCss: PAGE_CSS,
  sectionFor: (id) => (B[id] || (() => '    <div class="wrap"><p class="lead">&mdash;</p></div>'))(),
  note: `${BANDS.length} bands + footer. ${ALL.length} posters across ${SERIES.length} series.`,
});

/* ═══ POST-WRITE GATES ═══════════════════════════════════════════════════ */
let fail = 0;
const gate = (ok, msg) => { if (!ok) { console.error(`  FAIL ${msg}`); fail++; } else console.log(`  ok   ${msg}`); };
console.log('\nGATES');

const RENDERED = OUT.replace(/<style[\s\S]*?<\/style>/g, ' ')
  .replace(/<script[\s\S]*?<\/script>/g, ' ')
  .replace(/<!--[\s\S]*?-->/g, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&mdash;|&middot;|&nbsp;|&hellip;/g, ' ')
  .replace(/\s+/g, ' ');

/* 1. EVERY POSTER ON THE PAGE IS ON DISK, AND EVERY POSTER IN THE DATA IS ON
      THE PAGE. Both directions: the first catches a broken path, the second
      catches a template that silently drops a sheet. */
const imgs = [...OUT.matchAll(/src="(\/images\/posters\/[^"?]+)"/g)].map((m) => m[1]);
const uniq = [...new Set(imgs)];
const gone = uniq.filter((s) => !existsSync(join(S.ROOT, 'public', s.slice(1))));
gate(gone.length === 0, `all ${uniq.length} posters exist on disk${gone.length ? `; MISSING: ${gone.join(', ')}` : ''}`);
const dropped = ALL.filter((p) => !uniq.includes(p.src));
gate(dropped.length === 0, `all ${ALL.length} posters from the data reached the page${dropped.length ? `; DROPPED: ${dropped.map((p) => p.src).join(', ')}` : ''}`);

/* 2. NOTHING OUTSIDE /images/posters/. The path rule that keeps a stray
      third-party download from being published as Swechha's work — the failure
      docs/legacy/reference/README.md records. */
const others = [...OUT.matchAll(/<img[^>]+src="(\/images\/(?!posters\/)[^"?]+)"/g)].map((m) => m[1]);
gate(others.length === 0, `no image from outside /images/posters/${others.length ? `; FOUND: ${[...new Set(others)].join(', ')}` : ''}`);

/* 3. THE PARTNERS ARE NAMED ONLY INSIDE THE QUOTED CREDIT. This generator has
      no sentence of its own about who commissioned the work, and it must not
      grow one: "GIZ" and the ministry appear on this page because they are
      printed on the sheets, and the page says so in those words. */
const credits = SERIES.map((se) => se.credit).join(' ');
for (const who of ['GIZ', 'Federal Ministry for the Environment']) {
  const inCredit = credits.includes(who);
  const onPage = RENDERED.includes(who);
  gate(!onPage || inCredit, `"${who}" appears only inside a quoted printed credit`);
}

/* 4. EVERY SHEET IS TITLED, and no title doubles as its own alt — the
      distinction posterSheet enforces at build time, re-checked on the output
      so a future template change cannot quietly collapse the two. */
const untitled = ALL.filter((p) => !RENDERED.includes(p.title.replace(/&[a-z]+;/g, ' ')));
gate(untitled.length === 0, `every sheet is titled on the page${untitled.length ? `; MISSING: ${untitled.map((p) => p.src).join(', ')}` : ''}`);
const same = ALL.filter((p) => p.title.trim() === p.alt.trim());
gate(same.length === 0, `no sheet's title doubles as its alt${same.length ? `; FOUND: ${same.length}` : ''}`);

/* 5. NO SHEET IS CROPPED OR DUOTONED. The two ways this page could betray its
      own subject, both checkable in the markup: `.duo` runs the
      selective-colour filter over flat artwork, and the `.ht` box is
      object-fit:cover. Neither may touch a poster. */
const posterTags = [...OUT.matchAll(/<img[^>]+\/images\/posters\/[^>]*>/g)].map((m) => m[0]);
const duoed = posterTags.filter((t) => /class="[^"]*\bduo/.test(t));
gate(duoed.length === 0, `no poster carries the duotone filter${duoed.length ? `; FOUND: ${duoed.length}` : ''}`);
gate(!/<span class="ht[^"]*">\s*<img[^>]+\/images\/posters\//.test(OUT)
  && !/<div class="[^"]*\bht\b[^"]*">\s*<img[^>]+\/images\/posters\//.test(OUT),
  'no poster sits in an .ht box (object-fit:cover would crop the sheet)');

/* 6. EVERY IMAGE CARRIES ALT TEXT. */
const noAlt = [...OUT.matchAll(/<img(?![^>]*\balt=)[^>]*>/g)].map((m) => m[0].slice(0, 60));
gate(noAlt.length === 0, `every image has alt text${noAlt.length ? `; FOUND: ${noAlt.join(' | ')}` : ''}`);

/* 7. EVERY POSTER IS RESPONSIVE. Ten full-resolution A3 renders is 4.5 MB; the
      whole point of the srcset pass is that a phone never fetches that. A
      poster with no srcset is the record-grid bug of situation-shell's own
      header comment, running in reverse. */
const noSrcset = posterTags.filter((t) => !/\ssrcset=/.test(t));
gate(noSrcset.length === 0, `every poster has a srcset${noSrcset.length ? `; FOUND: ${noSrcset.length}` : ''}`);

/* 8. NO DEAD OR PROTOTYPE HREF. */
const hrefs = [...OUT.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
const dead = hrefs.filter((h) => h === '#' || h.startsWith('/design/') || h.startsWith('/_pages/'));
gate(dead.length === 0, `no dead or prototype href${dead.length ? `; FOUND: ${[...new Set(dead)].join(', ')}` : ''}`);

/* 9. THE GROUND CHAIN DOES NOT CLASH. */
gate(clashes === 0, `${clashes} ground clash(es)`);

console.log(`\n${OUT.length.toLocaleString('en-IN')} bytes. ${fail ? `${fail} gate(s) failed. The file is written — fix the generator and rebuild.` : 'All gates pass.'}`);
if (fail) process.exit(1);
