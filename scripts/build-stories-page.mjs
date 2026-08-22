/* ═══════════════════════════════════════════════════════════════════════════
   STORIES AND FILMS  →  public/_pages/v3/stories.html, routed at /stories
   ───────────────────────────────────────────────────────────────────────────
   AD-26 asked for this page and recorded four questions blocking a build. All
   four are answered (owner, 22 August 2026) and the answers are written into
   `data/stories.json`, not here:
     · Jijivisha is the "A River Struggles" upload, not "Story of River Yamuna".
     · Wasted is ONE entry carrying both parts; "Waste it" is a different film
       and gets its own entry.
     · NatureScapes is a series and appears BOTH here and beside the journeys.
     · The nav stays at AD-19's six words; this page is reached from the footer.

   ★ NO FILM TITLE IS TYPED IN THIS REPO THAT THE CHANNEL DOES NOT CARRY.
   Every id in stories.json is resolved against `data/media/youtube-index.json`
   and the build DIES on a miss. The whole reason AD-26 stopped short of
   building was three uploads of one film and two titles that turned out not to
   exist — so the fix is not care, it is a gate. Gates 1 and 2.

   ★ THE FILM COUNT IS DERIVED, NEVER WRITTEN.
   R-3 ruled "films are six" and two of the six — Disposable, Yatra — have no
   source anywhere on the channel (AD-26 §4, verified across all 148 indexed
   videos). So the page carries FIVE entries and names the two holes. A count
   of six would be the exact defect this site was built to refuse. Gate 3.

   ★ A PLAYLIST OF 21 IS NOT 21 IFRAMES.
   Entries resolved from a playlist embed players when the playlist is small
   (≤ PLAYER_MAX) and render as a linked list when it is not. Podcasts is 21;
   embedding all of them would put 21 third-party players on one page, on a
   site whose own audit named page weight as its main performance problem.
   ═══════════════════════════════════════════════════════════════════════════ */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import * as S from './lib/situation-shell.mjs';
const { esc, opener, hole, ARROW } = S;

const sh = S.shell();

/* ═══ DATA ═══════════════════════════════════════════════════════════════ */
const D = JSON.parse(readFileSync(join(S.ROOT, 'data/stories.json'), 'utf8'));
const YT = JSON.parse(readFileSync(join(S.ROOT, 'data/media/youtube-index.json'), 'utf8'));
const VIDEOS = YT.videos;

/* How many players a playlist-resolved entry may embed before it becomes a
   list instead. Six is one screen of players on a phone. */
const PLAYER_MAX = 6;

let dataBad = 0;
const dataFail = (m) => { console.error(`DATA IS WRONG: ${m}`); dataBad++; };

/* ── EVERY ID RESOLVES, OR THE BUILD STOPS ────────────────────────────────
   Resolved to the channel's OWN title. The page never prints a title typed
   here, so a typo in this repo cannot become a claim on the page. */
const resolve = (id, where) => {
  const v = VIDEOS[id];
  if (!v) { dataFail(`${where} names video ${id}, which is not in data/media/youtube-index.json.`); return null; }
  return { id, title: v.title, playlists: v.playlists || [] };
};

const byPlaylist = (match) => Object.entries(VIDEOS)
  .filter(([, v]) => (v.playlists || []).some((p) => p.toLowerCase().includes(match.toLowerCase())))
  .map(([id, v]) => ({ id, title: v.title, playlists: v.playlists || [] }))
  .sort((a, b) => a.title.localeCompare(b.title));

/* SOME SERIES ARE NOT A PLAYLIST. NatureScapes is filmed on school trips and
   sits inside the School Journeys playlist, so it is identifiable by title and
   not by playlist — resolving it the other way returned nothing, which is what
   the "resolves to no video at all" check is for. */
const byTitle = (match) => Object.entries(VIDEOS)
  .filter(([, v]) => v.title.toLowerCase().includes(match.toLowerCase()))
  .map(([id, v]) => ({ id, title: v.title, playlists: v.playlists || [] }))
  .sort((a, b) => a.title.localeCompare(b.title));

const FILMS = D.films.entries.map((e) => {
  const ways = ['videos', 'playlist_match', 'title_match'].filter((k) => e[k]);
  if (ways.length !== 1) {
    dataFail(`film "${e.slug}" declares ${ways.length} of videos/playlist_match/title_match; it must declare exactly one.`);
  }
  const vids = e.videos ? e.videos.map((id) => resolve(id, `film "${e.slug}"`)).filter(Boolean)
    : e.playlist_match ? byPlaylist(e.playlist_match)
    : byTitle(e.title_match);
  if (!vids.length) {
    dataFail(`film "${e.slug}" resolves to no video at all.`);
  }
  return { ...e, vids, mode: vids.length > PLAYER_MAX ? 'list' : 'players' };
});

/* ── THE WRITTEN STORIES, READ OFF DISK ───────────────────────────────────
   content/story/*.md is the source. Not restated here: a story that is added
   or renamed over there must not need an edit in this file to appear. */
const STORY_DIR = join(S.ROOT, 'content/story');
const fm = (raw) => {
  const m = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return {};
  const out = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([a-zA-Z_]+):\s*(.*)$/);
    if (!kv) continue;
    let v = kv[2].trim().replace(/^['"]|['"]$/g, '');
    if (v) out[kv[1]] = v;
  }
  return out;
};
const WRITTEN = readdirSync(STORY_DIR)
  .filter((f) => f.endsWith('.md'))
  .map((f) => {
    const meta = fm(readFileSync(join(STORY_DIR, f), 'utf8'));
    const slug = f.replace(/\.md$/, '');
    if (!meta.title) dataFail(`content/story/${f} has no title in its frontmatter.`);
    return { slug, title: meta.title, summary: meta.summary || '', date: meta.date || '' };
  })
  .sort((a, b) => String(b.date).localeCompare(String(a.date)));

/* ── JPEG DIMENSIONS, READ OUT OF THE FILE ────────────────────────────────
   `width`/`height` on an <img> is what lets the browser reserve the box before
   the bytes arrive; without it a grid of eleven lazy images reflows the page
   under the reader's thumb. The design audit named that defect across the rest
   of this site, so a new page may not add to it. Read from the JPEG's own SOF
   marker rather than typed into the data or shelled out to `sips`: a typed
   figure drifts the first time an image is re-exported, and a build that needs
   a macOS binary is a build that fails on the deploy host. */
function jpegSize(abs) {
  const b = readFileSync(abs);
  if (b[0] !== 0xFF || b[1] !== 0xD8) return null;      // not a JPEG
  let i = 2;
  while (i < b.length - 9) {
    if (b[i] !== 0xFF) { i++; continue; }               // resync on padding
    const marker = b[i + 1];
    if (marker === 0xD8 || marker === 0x01 || (marker >= 0xD0 && marker <= 0xD7)) { i += 2; continue; }
    const len = b.readUInt16BE(i + 2);
    /* SOF0/1/2/3 and the rarer 5-7, 9-11, 13-15 all carry height then width at
       the same offset. DHT (0xC4), JPG (0xC8) and DAC (0xCC) sit in the same
       0xCn range and do NOT, so they are excluded rather than matched loosely. */
    const isSOF = marker >= 0xC0 && marker <= 0xCF
      && marker !== 0xC4 && marker !== 0xC8 && marker !== 0xCC;
    if (isSOF) return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) };
    i += 2 + len;
  }
  return null;
}

/* ── THE POSTERS EXIST ON DISK, OR THE BUILD STOPS ────────────────────────
   A poster tile whose image 404s is a broken page that still passes a build,
   which is the failure mode every generator in this repo refuses. */
const POSTERS = D.posters.entries.map((p) => {
  const rel = `/images/posters/${p.file}.jpg`;
  const abs = join(S.ROOT, 'public', rel.slice(1));
  if (!existsSync(abs)) {
    dataFail(`poster "${p.file}" has no file at public${rel}.`);
    return { ...p, src: rel, w: 0, h: 0 };
  }
  const dim = jpegSize(abs);
  if (!dim) dataFail(`poster "${p.file}" is at ${rel} but its dimensions could not be read; an <img> without width/height reflows the grid.`);
  return { ...p, src: rel, w: dim?.w || 0, h: dim?.h || 0 };
});

if (dataBad) {
  console.error(`\nREFUSING TO WRITE: ${dataBad} data check(s) failed.`);
  process.exit(1);
}

/* ═══ BANDS ══════════════════════════════════════════════════════════════ */
const ALL_BANDS = [
  ['top',     't1',         '#0D0D0B'],
  ['films',   'paper t2',   '#F3F2F0'],
  ['posters', 't2',         '#151512'],
  ['written', 'paper-2 t3', '#ECEBE8'],
  ['act',     't3',         '#0D0D0B'],
];
/* THE WRITTEN SECTION IS A CLAIM ABOUT SOURCING, so it is gated on one.
   `written.publish` is false while the three files in content/story/ carry no
   source between them — see the reason recorded beside it in data/stories.json.
   The band still renders, because a section that vanishes tells the reader
   nothing; it names the hole instead, the device /work/events and /act use. */
const PUBLISH_WRITTEN = D.written.publish === true;
const LIVE = { written: WRITTEN.length > 0 };
const BANDS = ALL_BANDS.filter(([id]) => LIVE[id] !== false);
const clashes = S.groundChain(BANDS);

const INDEX_ALL = [
  ['Some of it we filmed', '#top'], ['The films', '#films'],
  ['The poster series', '#posters'], ['Written', '#written'],
  ['Bring us a story', '#act'],
];
const BAND_IDS = new Set(BANDS.map((b) => b[0]));
const INDEX = INDEX_ALL.filter(([, href]) => BAND_IDS.has(href.slice(1)));

const B = {};

/* ── BAND 1. MASTHEAD. ───────────────────────────────────────────────────── */
const M = D.masthead;
B.top = () => `    <div class="pic ht">
      <img class="duo" src="${M.frame.src}" alt="${esc(M.frame.alt)}" style="--op:${M.frame.op}">
      <div class="pic-over"><div class="wrap">
        <p class="lbl eyebrow">${esc(M.kicker)}</p>
        <h1 class="d1">${M.h1}</h1>
      </div></div>
    </div>
    <div class="pic-body"><div class="wrap">
      <p class="lead">${esc(M.lead)}</p>
    </div></div>`;

/* ── BAND 2. THE FILMS. ───────────────────────────────────────────────────
   `youtube-nocookie.com` rather than `youtube.com`: the reader has not asked
   to be tracked by a third party for reading a page. `loading="lazy"` so the
   players below the fold are not fetched until they are approached. */
const player = (v) => `        <div class="st-p"><iframe src="https://www.youtube-nocookie.com/embed/${esc(v.id)}"`
  + ` title="${esc(v.title)}" loading="lazy" allowfullscreen`
  + ` referrerpolicy="strict-origin-when-cross-origin"`
  + ` allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe></div>`;

const filmCard = (f) => {
  const body = f.mode === 'players'
    ? f.vids.map(player).join('\n')
    : `        <ul class="st-list">${f.vids.map((v) =>
        `<li><a href="https://www.youtube.com/watch?v=${esc(v.id)}" rel="noopener">${esc(v.title)}${ARROW}</a></li>`).join('')}</ul>`;
  const count = f.mode === 'list'
    ? `        <p class="lbl st-n">${f.vids.length} in the playlist</p>`
    : (f.vids.length > 1 ? `        <p class="lbl st-n">${f.vids.length} parts</p>` : '');
  const also = f.also_at
    ? `        <p class="st-also"><a class="act" href="${esc(f.also_at.href)}">${esc(f.also_at.label)}${ARROW}</a></p>`
    : '';
  return `      <article class="st-f" id="film-${esc(f.slug)}">
        <h3 class="d2 st-f-h">${esc(f.title)}</h3>
        <p class="lbl st-sub">${esc(f.subtitle)}</p>
${count}
${body}
        <p class="st-note">${esc(f.note)}</p>
${also}
      </article>`;
};

B.films = () => `${opener('films', D.films.head, D.films.lead)}
    <div class="wrap">
      <div class="st-fs">
${FILMS.map(filmCard).join('\n')}
      </div>
${D.films.holes.map((h) => hole(h)).join('\n')}
    </div>`;

/* ── BAND 3. THE POSTERS. ─────────────────────────────────────────────────
   Raw <img> with width/height so the grid does not reflow as they arrive —
   the CLS defect the design audit found across the rest of the site. */
B.posters = () => `${opener('posters', D.posters.head, D.posters.lead)}
    <div class="wrap">
      <ul class="st-ps">
${POSTERS.map((p) => `        <li class="st-po"><img src="${p.src}" alt="${esc(p.title)} &mdash; poster by ${esc(D.posters.credit)}" width="${p.w}" height="${p.h}" loading="lazy" decoding="async"><span class="lbl st-po-t">${esc(p.title)}</span></li>`).join('\n')}
      </ul>
      <p class="lbl st-cred">Drawn by ${esc(D.posters.credit)}</p>
    </div>`;

/* ── BAND 4. WRITTEN. ─────────────────────────────────────────────────────
   The note about the unported detail pages is carried as a named hole rather
   than left silent: these links leave the frozen design, and a reader who
   notices deserves to know it is unfinished work and not a different site. */
B.written = () => `${opener('written', D.written.head, D.written.lead)}
    <div class="wrap">
${PUBLISH_WRITTEN
    ? `      <ul class="st-ws">
${WRITTEN.map((w) => `        <li class="st-w"><a href="/stories/${esc(w.slug)}"><span class="st-w-h">${esc(w.title)}</span><span class="st-w-s">${esc(w.summary)}</span><span class="lbl st-w-d">${esc(w.date)}</span></a></li>`).join('\n')}
      </ul>`
    : hole(D.written.hole)}
    </div>`;

/* ── BAND 5. ACT. ────────────────────────────────────────────────────────── */
B.act = () => `${opener('act', D.act.head, D.act.lead)}
    <div class="wrap">
      <p><a class="b b-1" href="${esc(D.act.href)}">${esc(D.act.cta)}${ARROW}</a></p>
    </div>`;

/* ═══ PAGE CSS ═══════════════════════════════════════════════════════════ */
const PAGE_CSS = `
.st-fs{display:grid;gap:clamp(28px,4vw,52px);margin-top:clamp(20px,3vw,32px)}
.st-f{display:grid;gap:10px;min-width:0}
.st-f-h{margin:0}
.st-sub{color:var(--fg-2);margin:0}
.st-n{color:var(--fg-2);margin:0}
/* 16:9 without a wrapper hack, and no layout shift while the iframe loads. */
.st-p{aspect-ratio:16/9;background:#0D0D0B;border:1px solid var(--rule);min-width:0}
.st-p iframe{display:block;width:100%;height:100%;border:0}
.st-note{margin:0;max-width:62ch}
.st-also{margin:0}
.st-list{list-style:none;margin:0;padding:0;display:grid;gap:2px}
.st-list li{border-top:1px solid var(--rule)}
.st-list a{display:flex;gap:10px;align-items:baseline;justify-content:space-between;
  padding:12px 0;text-decoration:none;color:inherit}
.st-list a:hover{color:var(--mustard)}
.st-list svg{width:18px;height:18px;flex:none}
.st-ps{list-style:none;margin:clamp(20px,3vw,32px) 0 0;padding:0;
  display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:clamp(12px,2vw,20px)}
.st-po{display:grid;gap:8px;min-width:0}
.st-po img{display:block;width:100%;height:auto;border:1px solid var(--rule);background:#0D0D0B}
.st-po-t{color:var(--fg-2)}
.st-cred{margin:clamp(16px,2vw,24px) 0 0;color:var(--fg-2)}
.st-ws{list-style:none;margin:clamp(20px,3vw,32px) 0 0;padding:0;display:grid;gap:2px}
.st-ws li{border-top:1px solid var(--rule)}
.st-w a{display:grid;gap:6px;padding:clamp(14px,2vw,20px) 0;text-decoration:none;color:inherit}
.st-w a:hover .st-w-h{color:var(--mustard)}
.st-w-h{font-weight:600}
.st-w-s{color:var(--fg-2);max-width:70ch}
.st-w-d{color:var(--fg-2)}
@media (max-width:640px){
  .st-ps{grid-template-columns:repeat(auto-fill,minmax(140px,1fr))}
}
`;

/* ═══ WRITE ══════════════════════════════════════════════════════════════ */
const OUT = await S.assemble({
  file: 'stories.html',
  route: '/stories',
  title: 'Stories and films &mdash; Swechha',
  bands: BANDS, index: INDEX, sh, clashes,
  pageCss: PAGE_CSS,
  sectionFor: (id) => (B[id] || (() => '    <div class="wrap"><p class="lead">&mdash;</p></div>'))(),
  note: `${BANDS.length} bands + footer. ${FILMS.length} film entries `
      + `(${FILMS.filter((f) => f.mode === 'players').length} embedded, `
      + `${FILMS.filter((f) => f.mode === 'list').length} listed), `
      + `${D.films.holes.length} named holes, ${POSTERS.length} posters, `
      + `${WRITTEN.length} written ${PUBLISH_WRITTEN ? 'stories published' : 'drafts, none published (unsourced)'}.`,
});

/* ═══ POST-WRITE GATES ═══════════════════════════════════════════════════ */
let fail = 0;
const gate = (ok, msg) => { if (!ok) { console.error(`  FAIL ${msg}`); fail++; } else console.log(`  ok   ${msg}`); };
console.log('\nGATES');

const RENDERED = OUT.replace(/<style[\s\S]*?<\/style>/g, ' ')
  .replace(/<script[\s\S]*?<\/script>/g, ' ')
  .replace(/<!--[\s\S]*?-->/g, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&mdash;|&middot;|&nbsp;/g, ' ')
  .replace(/\s+/g, ' ');

/* 1. EVERY EMBEDDED ID IS ONE THE CHANNEL CARRIES. Re-checked against the
      index on the rendered output, not on the data, so a template that drops
      or mangles an id fails here rather than 404ing in a player. */
const embedded = [...OUT.matchAll(/youtube-nocookie\.com\/embed\/([\w-]+)/g)].map((m) => m[1]);
const watched = [...OUT.matchAll(/youtube\.com\/watch\?v=([\w-]+)/g)].map((m) => m[1]);
const unknown = [...new Set([...embedded, ...watched])].filter((id) => !VIDEOS[id]);
gate(unknown.length === 0, `every video id on the page is in the channel index${unknown.length ? `; UNKNOWN: ${unknown.join(', ')}` : ''} (${embedded.length} embedded, ${watched.length} linked)`);

/* 2. THE JIJIVISHA RULING HOLDS. Three uploads exist; the owner named one.
      A future session re-deriving "the most descriptive title" would pick the
      other, so the ruling is a gate and not a comment. */
gate(embedded.includes('F_bGH9oFGjA'),
  'Jijivisha is the "A River Struggles" upload F_bGH9oFGjA (owner, 22 Aug)');
gate(!embedded.includes('ZaANbZ7rhHE') && !embedded.includes('MbqeNl6ipLY'),
  'the two other Jijivisha uploads are not embedded');

/* 3. NO FILM COUNT THAT COUNTS THE MISSING TWO. R-3 said six; two have no
      source. Any bare "six films" on this page is the invented count. */
gate(!/\b(six|6)\s+films?\b/i.test(RENDERED),
  'the page does not claim six films (two of R-3\'s six have no source)');
gate(D.films.holes.length === 2 && /Disposable/.test(RENDERED) && /Yatra/.test(RENDERED),
  'both missing films are named as holes rather than dropped');

/* 4. WASTED IS ONE ENTRY WITH TWO PARTS, AND "WASTE IT" IS SEPARATE. */
const wasted = FILMS.find((f) => f.slug === 'wasted');
gate(wasted && wasted.vids.length === 2, 'Wasted is one entry carrying both parts');
gate(FILMS.some((f) => f.slug === 'waste-it'), '"Waste it" is a separate entry, not folded into Wasted');

/* 5. NO PLAYLIST BECOMES A WALL OF PLAYERS. */
const overs = FILMS.filter((f) => f.mode === 'players' && f.vids.length > PLAYER_MAX);
gate(overs.length === 0, `no entry embeds more than ${PLAYER_MAX} players${overs.length ? `; FOUND: ${overs.map((f) => f.slug).join(', ')}` : ''}`);

/* 6. NO DEAD OR PROTOTYPE HREF. The site-wide rule: this page may not ship
      the defect /act was built to fix. */
const hrefs = [...OUT.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
const dead = hrefs.filter((h) => h === '#' || h.startsWith('/design/') || h.startsWith('/_pages/'));
gate(dead.length === 0, `no dead or prototype href${dead.length ? `; FOUND: ${[...new Set(dead)].join(', ')}` : ''}`);

/* 7. EVERY POSTER IMAGE RESOLVES ON DISK. */
const imgs = [...OUT.matchAll(/<img[^>]+src="(\/images\/[^"]+)"/g)].map((m) => m[1]);
const missing = imgs.filter((s) => !existsSync(join(S.ROOT, 'public', s.slice(1))));
gate(missing.length === 0, `all ${imgs.length} images exist on disk${missing.length ? `; MISSING: ${missing.join(', ')}` : ''}`);

/* 8. EVERY POSTER CARRIES REAL width/height. The reflow defect this page was
      careful not to add; a gate rather than a comment, because the next person
      adding a tile will copy the markup and not the reasoning. */
const posterTags = [...OUT.matchAll(/<img[^>]+\/images\/posters\/[^>]*>/g)].map((m) => m[0]);
const noDim = posterTags.filter((t) => !/width="[1-9]\d*"/.test(t) || !/height="[1-9]\d*"/.test(t));
gate(posterTags.length === POSTERS.length && noDim.length === 0,
  `all ${POSTERS.length} posters carry real width/height${noDim.length ? `; MISSING ON ${noDim.length}` : ''}`);

/* 9. EVERY IMAGE CARRIES ALT TEXT. */
const noAlt = [...OUT.matchAll(/<img(?![^>]*\balt=)[^>]*>/g)].map((m) => m[0].slice(0, 60));
gate(noAlt.length === 0, `every image has alt text${noAlt.length ? `; FOUND: ${noAlt.join(' | ')}` : ''}`);

/* 9. NO tel: LINK, ANYWHERE. The owner's number was struck on 22 August and
      the /act generator gates on it; a new page is exactly where it would
      come back. */
gate(!/href="tel:/i.test(OUT), 'no tel: link (the struck number does not return)');

/* 10a. A PUBLISHED STORY MUST CARRY A SOURCE. The three files in
       content/story/ carry none, and one of them — delhi-air-victory — claims a
       policy victory AD-17 §3 recorded as unsupported and put in the same class
       as the fabricated court citations D-11.1 cut from the air page. So
       publishing is gated on sourcing rather than on the files existing, and
       flipping `written.publish` without adding sources fails the build. */
if (PUBLISH_WRITTEN) {
  const unsourced = WRITTEN.filter((w) => !w.source);
  gate(unsourced.length === 0,
    `every published story carries a source${unsourced.length ? `; UNSOURCED: ${unsourced.map((w) => w.slug).join(', ')}` : ''}`);
} else {
  gate(!/href="\/stories\//.test(OUT),
    'no link to an unpublished story detail page');
  gate(typeof D.written.hole === 'string' && D.written.hole.length > 40,
    'the written section names the hole instead of listing unsourced drafts');
}

/* 10. THE UNPORTED DETAIL PAGES ARE ADMITTED, NOT HIDDEN. These links leave
       the frozen design; the register records that, so the note must exist. */
gate(typeof D.written.note_unported === 'string' && D.written.note_unported.length > 40,
  'the register records that /stories/<slug> is not yet in this design');

/* 11. THE GROUND CHAIN DOES NOT CLASH. */
gate(clashes === 0, `${clashes} ground clash(es)`);

console.log(`\n${OUT.length.toLocaleString('en-IN')} bytes. ${fail ? `${fail} gate(s) failed. The file is written — fix the generator and rebuild.` : 'All gates pass.'}`);
if (fail) process.exit(1);
