// AD-24 — farm.html, the Swechha Farm page. NINE BANDS.
//
// ★ THIS IS THE PAGE D-07.13 PROMISED AND NOBODY BUILT.
//
// On 21 August the client reopened homepage band 8 and required it to carry
// two stories, "both detailed further on the inner page": the transformation
// of barren land into a flourishing Food Forest, and the fact that it is a
// place you can come to. The band shipped with its hook ("Nothing grew here")
// and its button ("Visits, camps and retreats") — and the button has pointed
// at href="#" ever since. There was no inner page. This is it.
//
// ★ THE TWO STORIES ARE THE SPINE, IN THAT ORDER.
// Bands 2–4 are the transformation; bands 5–7 are the place you can come to.
// They are not two sections among nine, they are the two halves, and the
// order is the client's. "Food Forest" is his proper noun and is capitalised
// wherever it appears.
//
// ★ WHAT THIS PAGE IS, AND WHAT IT IS NOT (ruling F-1, 22 August).
// This page is THE PLACE. `/work/projects/farm-school` is THE PROGRAMME and is
// unchanged. That split closes AD-17 question 6 and `farm-school.json`'s
// second hole, both open since 21 August. The two pages link across.
//
// ★ TWO FIGURES ARE RESOLVED OUT OF THE FARM SCHOOL'S OWN DATA, NOT TYPED.
// The composted leaves and the honey belong to `farm-school.json`. A split
// across two pages is precisely where a number drifts, so this build reads
// them from that file by label and DIES if either goes missing or is renamed.
// It is the /impact architecture applied to two figures instead of thirty-two,
// and it exists so that /farm cannot come to disagree with the page the
// figures came from — the defect class that had the situation index printing
// 412 while the Air page said 387.
//
// ★ NO ACREAGE BUT FIVE, AND NO DISTANCE IN KILOMETRES. GATED.
// D-07.3 ruled five acres and an hour and a half from Delhi. Forty acres
// (frozen homepage), twelve (a prototype) and "60km" have all been struck, and
// the farm's own live Airbnb listing still says "5 acre" while the PDF says
// two hectares — which is the same number in different units and is exactly
// how a stale figure gets re-imported by a future session acting in good
// faith. Gates 1 and 2 fail the build rather than leave that to review.
//
// ★ NO BAND MAY BE CALLED `farm`.
// The frozen active-section observer matches band ids against nav hrefs, and
// `Farm` is a nav word — it now points at `/farm` rather than `/#farm`, but
// the homepage still carries a band with that id. A band called `farm` here
// lights the wrong nav item: AD-21's band-6 finding, and this is the one page
// on the site where it is the obvious mistake to make. Gate 5.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import * as S from './lib/situation-shell.mjs';
const { esc, opener, hole, ARROW } = S;

const sh = S.shell();

/* ═══ DATA ═══════════════════════════════════════════════════════════════ */
const F = JSON.parse(readFileSync(join(S.ROOT, 'data/farm.json'), 'utf8'));
const LIB = new Map(JSON.parse(readFileSync(join(S.ROOT, 'content/photo-library.json'), 'utf8'))
  .photos.map(e => [e.src, e]));

/* ── THE FARM SCHOOL'S FIGURES, RESOLVED BY LABEL ─────────────────────────
   Not copied. If somebody edits a label or a value over there, this build
   either follows it or stops; what it cannot do is quietly disagree. */
const SCHOOL = JSON.parse(readFileSync(
  join(S.ROOT, 'data/work/projects/farm-school.json'), 'utf8'));

const RESOLVED = F.forest.resolved.map(r => {
  if (r.slug !== SCHOOL.slug) {
    console.error(`REFUSING TO BUILD: farm.json resolves against "${r.slug}", which is not the Farm School.`);
    process.exit(1);
  }
  const hit = (SCHOOL.figures || []).find(f => f.label === r.label);
  if (!hit) {
    console.error(`REFUSING TO BUILD: no figure labelled "${r.label}" in data/work/projects/farm-school.json.\n`
      + `  It holds: ${(SCHOOL.figures || []).map(f => `"${f.label}"`).join(', ') || '(none)'}\n`
      + `  Either the label moved and farm.json must follow it, or the figure was deleted and this page\n`
      + `  must stop claiming it. Do NOT fix this by typing the number in here.`);
    process.exit(1);
  }
  return { ...hit, from: SCHOOL.name };
});

/* ── THE ELAPSED YEARS, DERIVED AND NEVER TYPED ───────────────────────────
   D-09.5's standing rule: no year count is written into a static page, it is
   computed from a stored year, so a rebuild refreshes it and no January makes
   the page wrong. The client said "4 years ago" on 22 August 2026; 2022 is
   stored and the count comes from here. */
const WORD = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight',
  'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen'];
const YEARS = new Date().getFullYear() - F.acquired.year;
const YEARWORD = WORD[YEARS] || String(YEARS);
/* ── AND THE CEILING, WHICH IS WHAT THE PAGE ACTUALLY SAYS (F-16).
   The client asked for "less than five years" rather than "four years", and
   the phrasing is better than the precision it replaces for two reasons.
   It is ROBUST: the acquisition year is my arithmetic from his "4 years ago",
   and if the true year is 2021 or 2023 a stated "four" is wrong while a
   ceiling is not. And it is STRONGER: a bound is the shape this claim wants —
   the point is how little time it took, not how much.
   Derived like the count, so it stays true forever: elapsed 4 gives "less
   than five", elapsed 5 gives "less than six". It can never become false. */
const LESSTHAN = WORD[YEARS + 1] || String(YEARS + 1);
if (YEARS < 1) {
  console.error(`REFUSING TO BUILD: acquired year ${F.acquired.year} is not in the past.`);
  process.exit(1);
}

/* Doors may resolve a figure from the Farm School too — same rule, same file,
   same refusal to type a number twice. */
const resolveFig = (r) => {
  const hit = (SCHOOL.figures || []).find(f => f.label === r.label);
  if (!hit) {
    console.error(`REFUSING TO BUILD: no figure labelled "${r.label}" in farm-school.json.`);
    process.exit(1);
  }
  return hit;
};
for (const d of F.come.doors) if (d.resolved) d.figure = resolveFig(d.resolved);

/* ── EVERY FIGURE CARRIES A SOURCE ────────────────────────────────────────
   The section's standing rule, applied before a line of HTML is built. */
const OWN = F.forest.figures;
for (const f of [...OWN, ...F.masthead.readouts]) {
  if (!f.source) {
    console.error(`REFUSING TO BUILD: "${f.label || f.unit}" carries no source.`);
    process.exit(1);
  }
}

/* ── EVERY FRAME IS CATALOGUED AND ON DISK ────────────────────────────────
   An un-catalogued file and a bought file were once indistinguishable to the
   frame gate (W-11). This checks both the catalogue and the filesystem, and
   refuses anything flagged stock or synthetic — the gram-anubhav lesson
   (W-31), enforced rather than remembered. */
const FRAMES = [];
const walkFrames = (o) => {
  if (Array.isArray(o)) return o.forEach(walkFrames);
  if (o && typeof o === 'object') {
    if (typeof o.src === 'string' && o.src.startsWith('/images/')) FRAMES.push(o);
    Object.values(o).forEach(walkFrames);
  }
};
walkFrames(F);
for (const fr of FRAMES) {
  const e = LIB.get(fr.src);
  if (!e) { console.error(`REFUSING TO BUILD: ${fr.src} is not in content/photo-library.json.`); process.exit(1); }
  if (e.stock || e.synthetic) { console.error(`REFUSING TO BUILD: ${fr.src} is flagged ${e.stock ? 'stock' : 'synthetic'}.`); process.exit(1); }
  if (!existsSync(join(S.ROOT, 'public', fr.src))) { console.error(`REFUSING TO BUILD: ${fr.src} is catalogued but not on disk.`); process.exit(1); }
}

/* ═══ COMPONENTS ═════════════════════════════════════════════════════════ */
const num = (v) => esc(v).replace(/\+$/, '<sup>+</sup>');

const bigFig = (f, prov) => `          <div class="fm-big">
            <p class="num fm-big-v">${num(f.value)}</p>
            <p class="lbl fm-big-l">${esc(f.label)}</p>
            <p class="cap fm-big-s">${esc(f.period)}${prov ? `<br>${esc(prov)}` : ''}</p>
          </div>`;

/* `{{years}}` in any row heading or body is replaced with the DERIVED count.
   The data file may not type the number, and this is the seam where that rule
   is actually enforced rather than merely stated. */
const yr = (t) => String(t)
  .replace(/\{\{years\}\}/g, YEARWORD)
  .replace(/\{\{lessthan\}\}/g, LESSTHAN);

const rows = (list) => `      <div class="p-rows">
${list.map(r => `        <div class="p-row">
          <p class="lbl">${esc(yr(r.h))}</p>
          <div><p class="body">${esc(yr(r.p))}</p></div>
        </div>`).join('\n')}
      </div>`;

const sideFrame = (fr) => `      <figure class="fm-side"><img class="duo" src="${fr.src}" alt="${esc(fr.alt)}" loading="lazy"></figure>`;

/* ═══ BANDS ══════════════════════════════════════════════════════════════
   Ground chain checked mechanically below. No two adjacent bands share a hex,
   and the last does not share one with the footer (#151512).
   NO BAND IS CALLED `farm` OR `record` — see the header note.

   THE TIER IS THE BAND'S PADDING, AND `t1` MEANS ZERO. `t1` is for a band that
   supplies its own — the masthead does, through `.pic-body`. `visit` and `act`
   were on `t1` and supplied none, so their `opener()` heading sat flush against
   the ground change above it: at 1440 the display-scale h2 started 0px below a
   hard #ECEBE8 → #0D0D0B edge, and `act`'s last line ended 25px above the
   footer. Both open with the same `.im-head` every t2/t3 band opens with, so
   they take the tier their content actually is — nothing else about them
   changes, because t1/t2/t3 paint nothing (see the act page's gate 0). */
/* ── THE WAITING BAND IS CONDITIONAL, AND THAT IS THE POINT ───────────────
   `waiting` names what this page cannot source. On 22 August both its claims
   closed — the camp capacity (F-13) and the participation figure (F-18) — and
   a "what we cannot tell you" band with nothing under it is worse than no
   band: it performs the honesty instead of doing it. So the band renders only
   while it has something to say, and THE GROUND CHAIN IS RECOMPUTED from
   whatever survives rather than being a fixed list with a hole in it. Put a
   claim back in the data and the band returns, correctly coloured, with no
   code change here. */
const ALL_BANDS = [
  ['top',     't1',         '#0D0D0B'],
  ['origin',  'paper t2',   '#F3F2F0'],
  ['grows',   't2',         '#151512'],
  ['keeps',   'paper-2 t3', '#ECEBE8'],
  ['visit',   't2',         '#0D0D0B'],
  ['plainly', 'paper t2',   '#F3F2F0'],
  ['waiting', 'dark-2 t2',  '#151512'],
  ['sheet',   'paper-2 t3', '#ECEBE8'],
  ['act',     't3',         '#0D0D0B'],
];
const LIVE = { waiting: F.waiting.claims.length > 0 };
const BANDS = ALL_BANDS.filter(([id]) => LIVE[id] !== false);
const clashes = S.groundChain(BANDS);

const INDEX_ALL = [
  ['Nothing grew here', '#top'], ['The ground', '#origin'], ['What grows now', '#grows'],
  ['How it keeps itself', '#keeps'], ['Ways to come', '#visit'], ['Not a hotel', '#plainly'],
  ['What we cannot say', '#waiting'], ['The place itself', '#sheet'], ['Come and see', '#act'],
];
/* Derived from the bands that actually render, so a chip can never point at
   a band that is not there. */
const BAND_IDS = new Set(BANDS.map(b => b[0]));
const INDEX = INDEX_ALL.filter(([, href]) => BAND_IDS.has(href.slice(1)));

const B = {};

/* ── BAND 1. THE MASTHEAD. ───────────────────────────────────────────────
   The hook is the frozen homepage's, word for word, and that is deliberate:
   the door and the room must not disagree. The two readouts are D-07.3's,
   byte for byte what band 8 carries. The hero is NOT band 8's photograph —
   the same frame twice would make the click feel like it failed. */
const M = F.masthead;
B.top = () => `    <div class="pic ht">
      <img class="duo" src="${M.frame.src}" alt="${esc(M.frame.alt)}" style="--op:${M.frame.op}">
      <div class="pic-over"><div class="wrap">
        <p class="lbl eyebrow">${esc(M.kicker)}</p>
        <h1 class="d1">${M.h1}</h1>
      </div></div>
    </div>
    <div class="pic-body"><div class="wrap">
      <p class="lead fm-standfirst">${esc(M.lead)}</p>
      <div class="fm-rail">
${M.readouts.map(r => `        <div class="fm-rail-c"><p class="num fm-rail-v">${esc(r.num)}</p><p class="lbl fm-rail-l">${esc(r.unit)}</p></div>`).join('\n')}
        <div class="fm-rail-c"><p class="num fm-rail-v fm-rail-w">${esc(M.place.word)}</p><p class="lbl fm-rail-l">${esc(M.place.under)}</p></div>
      </div>
    </div></div>`;

/* ── BAND 2. A STORY OF TRANSFORMATION. THE PAGE'S LARGEST BAND. ─────────
   The client asked for this one big, and big here is structural rather than
   typographic: three movements instead of one list.
     1. WHERE — the Aravallis, which is what gives five acres its stakes. A
        restored plot in an intact landscape is gardening; the same plot in a
        range being quarried is a demonstration. NO CASE LAW (ruling F-6): the
        definition of what legally counts as an Aravalli hill is live before
        the Supreme Court and moved three times between November and January,
        so anything this page said about it would be wrong by the time a
        school read it. What is said instead — oldest range, Delhi to Gujarat,
        quarried and built on — needs no citation and does not go stale.
     2. WHAT WAS DONE — six rows, water before trees, and permaculture stated
        as a RULE (every output is some other part's input) rather than as a
        style, because the style reading is the one that lets a farm buy its
        inputs and still use the word.
     3. WHAT IT PRODUCES — the produce hint the client asked for, and the
        band's closing argument: a barren field's manifest is what comes off
        it. The frame pair is deliberate — bare ground opens the band, fruit
        on the tree closes it, and that is the whole transformation in two
        photographs with the argument in between. */
B.origin = () => `${opener('origin', F.before.head, esc(F.before.lead))}
    <div class="wrap">
      <div class="fm-ctx">
        <figure class="fm-ctx-f"><img class="duo" src="${F.before.context.frame.src}" alt="${esc(F.before.context.frame.alt)}"></figure>
        <div class="fm-ctx-t">
          <p class="lbl fm-ctx-h">${esc(F.before.context.h)}</p>
          <p class="body fm-ctx-p">${esc(F.before.context.p)}</p>
        </div>
      </div>
${rows(F.before.rows)}
      <div class="fm-prod">
        <div class="fm-prod-t">
          <p class="lbl fm-prod-h">${esc(F.before.produce.h)}</p>
          <p class="lead fm-prod-p">${esc(F.before.produce.p)}</p>
          <div class="fm-orch">
${F.before.produce.counts.map(c => `            <div class="fm-orch-c"><p class="num fm-orch-n">${esc(c.n)}</p><p class="lbl fm-orch-w">${esc(c.what)}</p></div>`).join('\n')}
          </div>
        </div>
        <figure class="fm-prod-f"><img class="duo" src="${F.before.produce.frame.src}" alt="${esc(F.before.produce.frame.alt)}" loading="lazy"></figure>
      </div>
    </div>`;

/* ── BAND 3. WHAT GROWS THERE NOW. ───────────────────────────────────────
   The inventory is the answer to the absence, and the density is the
   argument — a barren field does not have a manifest. Three figures of this
   page's own, then two resolved from the Farm School, then the ten systems
   as a continuous run rather than as cells. */
B.grows = () => `${opener('grows', F.forest.head, esc(F.forest.lead))}
    <div class="wrap">
      <div class="fm-figs">
${OWN.map(f => bigFig(f, f.source)).join('\n')}
${RESOLVED.map(f => bigFig(f, `${f.from} &middot; ${f.source}`)).join('\n')}
      </div>
      <p class="cap fm-figs-n">The last two are the Farm School's own figures and are read from its page
        rather than repeated here, so the two cannot drift apart.</p>
      <div class="fm-inv">
${F.forest.systems.map(s => `        <div class="fm-inv-c">
          <p class="lbl fm-inv-h">${esc(s.h)}</p>
          <p class="body fm-inv-p">${esc(s.p)}</p>
        </div>`).join('\n')}
      </div>
    </div>`;

/* ── BAND 4. HOW THE PLACE KEEPS ITSELF. Story one closes on the systems. ─ */
B.keeps = () => `${opener('keeps', F.works.head, esc(F.works.lead))}
    <div class="wrap">
      <div class="fm-split fm-split-r">
        <div>
${rows(F.works.rows)}
        </div>
${sideFrame(F.works.frame)}
      </div>
    </div>`;

/* ── BAND 5. WAYS TO COME. Story two, and the reason the button exists. ───
   Four doors, genuinely different lengths of stay. The school camp carries a
   NAMED HOLE rather than an invented capacity (ruling F-3): overnight camps
   are real and they run, but no number is sourced, and a plausible-looking
   one is the lie this whole section is built to refuse. */
B.visit = () => `${opener('visit', F.come.head, esc(F.come.lead))}
    <div class="wrap">
      <div class="fm-triad">
${F.come.triad.map(t => `        <div class="fm-triad-c">
          <p class="d1 fm-triad-w">${esc(t.w)}</p>
          <p class="body fm-triad-p">${esc(t.p)}</p>
        </div>`).join('\n')}
      </div>
      <div class="fm-doors">
${F.come.doors.map(d => `        <div class="fm-door">
          <figure class="fm-door-f"><img class="duo" src="${d.frame.src}" alt="${esc(d.frame.alt)}" loading="lazy"></figure>
          <h3 class="fm-door-h">${esc(d.name)}</h3>
          <p class="body fm-door-p">${esc(d.p)}</p>
${[d.capacity, d.figure].filter(Boolean).map(g => `          <p class="fm-door-fig"><span class="num">${esc(g.value)}</span> <span class="lbl">${esc(g.label)}</span></p>`).join('\n')}
          <p class="cap fm-door-w">${esc(d.who)}</p>
${d.hole ? hole('We cannot yet tell you how many students can stay over, in what, or with how many adults. Nothing on that is written down anywhere we can cite, so nothing on it is printed here.') : ''}
        </div>`).join('\n')}
      </div>
      <div class="fm-act">
        <div class="fm-act-head">
          <h3 class="fm-act-h">${esc(F.come.activities.h)}</h3>
          <p class="body fm-act-l">${esc(F.come.activities.lead)}</p>
        </div>
        <div class="fm-act-grid">
${F.come.activities.items.map(a => `          <div class="fm-act-c">
            <p class="lbl fm-act-ch">${esc(a.h)}</p>
            <p class="body fm-act-cp">${esc(a.p)}</p>
          </div>`).join('\n')}
        </div>
      </div>
    </div>`;

/* ── BAND 6. IT IS NOT A HOTEL. ──────────────────────────────────────────
   The client's own listing tells people what is wrong with the place before
   it tells them what is right, and that is the best-registered writing any
   source for this page produced. It goes ABOVE the fold of the decision, not
   in a footnote, because that is the only placement that means anything. */
B.plainly = () => `${opener('plainly', F.conditions.head, esc(F.conditions.lead))}
    <div class="wrap">
      <div class="fm-split">
${sideFrame(F.conditions.frame)}
        <div>
${rows(F.conditions.rows)}
          <blockquote class="fm-quote">
            <p class="lead">${esc(F.conditions.quote)}</p>
            <p class="cap">${esc(F.conditions.quote_attr)}</p>
          </blockquote>
        </div>
      </div>
    </div>`;

/* ── BAND 7. WHAT WE CANNOT TELL YOU YET. ────────────────────────────────
   Naming a hole is content, not an apology. Both of these are one fact away
   from closing, and each says which fact. */
B.waiting = () => `${opener('waiting', F.waiting.head, esc(F.waiting.lead))}
    <div class="wrap">
${F.waiting.claims.map(c => `      <div class="fm-claim">
${hole(c.what)}
        <p class="body fm-unlock">${esc(c.unlocks)}</p>
      </div>`).join('\n')}
    </div>`;

/* ── BAND 8. THE PLACE ITSELF. ───────────────────────────────────────────
   Six frames, none dated, because no date on this page is sourced. */
B.sheet = () => `${opener('sheet', F.sheet.head, esc(F.sheet.lead))}
    <div class="wrap">
      <div class="fm-sheet">
${F.sheet.frames.map(fr => `        <figure class="fm-sh-c"><img class="duo" src="${fr.src}" alt="${esc(fr.alt)}" loading="lazy"></figure>`).join('\n')}
      </div>
      <p class="cap fm-sheet-n">${esc(F.sheet.note)}</p>
    </div>`;

/* ── BAND 9. COME AND SEE. ───────────────────────────────────────────────
   An address, per ruling F-2. There is no form, and the band says why rather
   than leaving a reader to wonder where the button is.

   THE PHONE CELL IS GONE, on the owner's instruction of 22 August ("remove my
   phone number from the site"), which supersedes F-2's phone clause. F-2's
   actual point — this page ends in a PERSON and not a form — is unchanged.
   The cell is now CONDITIONAL rather than deleted: `F.act.phone` is absent from
   farm.json, so nothing renders, and if the owner ever gives an office number
   it comes back by adding that one field. Written this way so the next session
   does not have to reconstruct the markup from the ledger. */
const A = F.act;
B.act = () => `${opener('act', A.head, esc(A.lead))}
    <div class="wrap">
      <div class="fm-ways${A.phone ? '' : ' fm-ways-1'}">
${A.phone ? `        <div class="fm-way">
          <p class="lbl fm-way-l">Call the farm</p>
          <p class="fm-way-v"><a href="tel:${A.phone.replace(/[^+\d]/g, '')}">${esc(A.phone)}</a></p>
          <p class="cap">${esc(A.phone_note)}</p>
        </div>
` : ''}        <div class="fm-way">
          <p class="lbl fm-way-l">Write</p>
          <p class="fm-way-v"><a href="mailto:${esc(A.email)}">${esc(A.email)}</a></p>
          <p class="cap">${esc(A.email_note)}</p>
        </div>
      </div>
      <div class="fm-onward">
${A.onward.map(o => `        <a class="fm-door-a" href="${o.href}">
          <h3 class="fm-door-h">${esc(o.h)} ${ARROW}</h3>
          <p class="body fm-door-p">${esc(o.p)}</p>
        </a>`).join('\n')}
      </div>
    </div>`;

/* ═══ PAGE CSS ═══════════════════════════════════════════════════════════ */
const PAGE_CSS = `
/* ── AD-24. SWECHHA FARM. ──────────────────────────────────────────────── */

/* ── masthead rail. Three cells, and the third is a WORD not a numeral:
      "where" is the fact this page adds that the homepage band never had
      (F-5), and it belongs beside the two ruled readouts rather than buried
      in the lead. It takes a smaller size because a word set at numeral
      scale reads as a logo. ── */
.fm-standfirst{max-width:46ch}
.fm-rail{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:clamp(14px,2.2vw,40px);
  border-top:1px solid var(--hair);margin-top:var(--gap-row);padding-top:var(--gap-row)}
.fm-rail-c>*{margin:0;min-width:0}
.fm-rail-v{font-size:clamp(34px,4.8vw,72px);line-height:.9}
.fm-rail-w{font-size:clamp(24px,2.9vw,42px);letter-spacing:-.01em}
.fm-rail-l{margin-top:10px;color:var(--fg-2)}
@media (max-width:900px){.fm-rail{grid-template-columns:repeat(2,minmax(0,1fr));gap:24px}}
@media (max-width:420px){.fm-rail{grid-template-columns:minmax(0,1fr);gap:18px}}

/* ── the picture-beside-argument split, both hands. ── */
.fm-split{display:grid;grid-template-columns:minmax(0,4fr) minmax(0,6fr);
  gap:clamp(20px,3vw,56px);align-items:start;margin-top:var(--gap-row)}
.fm-split-r{grid-template-columns:minmax(0,6fr) minmax(0,4fr)}
.fm-side{margin:0;min-width:0}
.fm-side>img{width:100%;height:auto;display:block;aspect-ratio:3/2;object-fit:cover}
@media (max-width:760px){.fm-split,.fm-split-r{grid-template-columns:minmax(0,1fr)}
  .fm-split-r .fm-side{order:-1}}

/* ── the story of change. THE PAGE'S LARGEST BAND, and big is carried by
      structure: a wide context frame, then the six rows, then the produce
      block mirrored against it. The two frames are the argument — bare
      ground at the top, fruit at the bottom. ── */
.fm-ctx{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);
  gap:clamp(20px,3vw,56px);align-items:center;margin-top:var(--gap-row)}
.fm-ctx-f{margin:0;min-width:0}
.fm-ctx-f>img{width:100%;height:auto;display:block;aspect-ratio:16/9;object-fit:cover}
.fm-ctx-t>*{margin:0;min-width:0}
.fm-ctx-h{color:var(--ink-3)}
.fm-ctx-p{margin-top:12px}
.paper .fm-ctx-h,.paper-2 .fm-ctx-h{color:var(--ink-2)}
@media (max-width:820px){.fm-ctx{grid-template-columns:minmax(0,1fr)}}

.fm-prod{display:grid;grid-template-columns:minmax(0,6fr) minmax(0,6fr);
  gap:clamp(20px,3vw,56px);align-items:center;
  border-top:1px solid var(--hair);margin-top:var(--gap-block);padding-top:var(--gap-row)}
.fm-prod-t>*{margin:0;min-width:0}
.fm-prod-h{color:var(--ink-2)}
.fm-prod-p{margin-top:14px}
.fm-prod-f{margin:0;min-width:0}
.fm-prod-f>img{width:100%;height:auto;display:block;aspect-ratio:4/3;object-fit:cover}
@media (max-width:820px){.fm-prod{grid-template-columns:minmax(0,1fr)}
  .fm-prod-f{order:-1}}

/* ── the orchard, counted. The client gave these as counts (200 amla, 200
      kinnow, 200 moringa), and a count is a promise in a way "an orchard" is
      not: it can be walked and checked. Set small, under the produce
      paragraph, because they are corroboration and not the headline. The
      lemon row carries an em dash rather than a guessed number. ── */
.fm-orch{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:clamp(10px,1.6vw,24px);
  border-top:1px solid var(--hair);margin-top:var(--gap-row);padding-top:clamp(14px,1.8vw,22px)}
.fm-orch-c>*{margin:0;min-width:0}
.fm-orch-n{font-size:clamp(20px,2.2vw,34px);line-height:1}
.fm-orch-w{color:var(--ink-2);margin-top:8px}
@media (max-width:620px){.fm-orch{grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}}

/* ── LIVE · LEARN · LEAD. The farm's own three words, and they are also the
      three lengths of stay, so they sit ABOVE the doors as the frame the
      doors hang in rather than beside them as a fourth thing to read. Set in
      the display face at section-head scale: this is the one place on the
      page where three words carry more than a sentence would. ── */
.fm-triad{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(18px,2.6vw,48px);
  border-top:1px solid var(--hair);margin-top:var(--gap-row);padding-top:var(--gap-row)}
.fm-triad-c{min-width:0}
.fm-triad-w{font-size:clamp(30px,3.6vw,56px);line-height:.95;margin:0;color:var(--mustard)}
.fm-triad-p{color:var(--fg-2);margin:14px 0 0}
@media (max-width:760px){.fm-triad{grid-template-columns:minmax(0,1fr);gap:22px}}

/* ── what a group actually does. Seven items on the same hairline run as the
      inventory, because they are the same KIND of list — a density argument,
      not a feature grid. Three columns rather than the inventory's two: these
      are shorter, and at two columns the run outgrew the doors above it. ── */
.fm-act{border-top:1px solid var(--hair);margin-top:var(--gap-block);padding-top:var(--gap-row)}
.fm-act-head{display:grid;grid-template-columns:minmax(0,4fr) minmax(0,7fr);
  gap:clamp(16px,3vw,48px);align-items:baseline}
.fm-act-h{font-family:var(--f-caps);font-size:clamp(19px,2.2vw,30px);font-weight:800;
  letter-spacing:-.005em;margin:0;text-transform:uppercase}
.fm-act-l{color:var(--fg-2);margin:0}
.fm-act-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));
  gap:0 clamp(20px,3vw,56px);margin-top:var(--gap-row)}
.fm-act-c{border-top:1px solid var(--hair);padding:clamp(12px,1.6vw,20px) 0;min-width:0}
.fm-act-ch{color:var(--mustard)}
.fm-act-cp{color:var(--fg-2);margin:8px 0 0}
@media (max-width:900px){.fm-act-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:620px){.fm-act-head{grid-template-columns:minmax(0,1fr);gap:12px}
  .fm-act-grid{grid-template-columns:minmax(0,1fr)}}

/* ── the five figures. ── */
.fm-figs{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:clamp(16px,2.4vw,40px);
  border-top:1px solid var(--hair);margin-top:var(--gap-row);padding-top:var(--gap-row)}
.fm-big>*{margin:0;min-width:0}
.fm-big-v{font-size:clamp(30px,3.6vw,60px);line-height:.92}
.fm-big-l{margin-top:12px}
.fm-big-s{color:var(--fg-3);margin-top:10px}
.fm-figs-n{color:var(--fg-3);margin-top:14px;max-width:62ch}
@media (max-width:900px){.fm-figs{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:460px){.fm-figs{grid-template-columns:minmax(0,1fr)}}

/* ── the inventory. TEN THINGS, AND THE DENSITY IS THE ARGUMENT.
      The homepage runs them past you in one line at caption size; here each
      gets its sentence, and they are a run of hairline-separated items
      rather than ten equal boxes — a feature grid is the register the client
      rejected, and ten cards would say less than ten things in a row. ── */
.fm-inv{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));
  gap:0 clamp(24px,4vw,72px);margin-top:var(--gap-block)}
.fm-inv-c{border-top:1px solid var(--hair);padding:clamp(14px,1.8vw,22px) 0;min-width:0}
.fm-inv-h{color:var(--mustard)}
.fm-inv-p{color:var(--fg-2);margin:8px 0 0}
@media (max-width:760px){.fm-inv{grid-template-columns:minmax(0,1fr)}}

/* ── the four doors. ── */
.fm-doors{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:clamp(16px,2vw,32px);
  margin-top:var(--gap-row)}
.fm-door{min-width:0}
.fm-door-f{margin:0 0 16px;min-width:0}
.fm-door-f>img{width:100%;height:100%;display:block;aspect-ratio:4/3;object-fit:cover}
.fm-door-h{font-family:var(--f-caps);font-size:clamp(15px,1.5vw,19px);font-weight:700;
  letter-spacing:.01em;margin:0;display:flex;align-items:baseline;gap:8px}
.fm-door-h svg{width:15px;height:15px;flex:0 0 auto;align-self:center}
.fm-door-p{color:var(--fg-2);margin:10px 0 0}
.fm-door-fig{margin:14px 0 0;display:flex;align-items:baseline;gap:8px}
.fm-door-fig .num{font-size:clamp(26px,2.6vw,40px);line-height:1;color:var(--mustard)}
.fm-door-fig .lbl{color:var(--fg-2)}
.fm-door-w{color:var(--fg-3);margin-top:12px;border-top:1px solid var(--hair);padding-top:10px}
@media (max-width:1000px){.fm-doors{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:560px){.fm-doors{grid-template-columns:minmax(0,1fr)}}

/* ── the quote, in the client's own words about his own farm. ── */
.fm-quote{border-left:2px solid var(--mustard);margin:var(--gap-row) 0 0;
  padding:2px 0 2px clamp(16px,2vw,24px)}
.fm-quote>p{margin:0}
.fm-quote>.cap{color:var(--ink-3);margin-top:10px}

/* ── the two open holes. ── */
.fm-claim+.fm-claim{margin-top:var(--gap-block)}
.fm-claim{margin-top:var(--gap-row)}
.fm-unlock{color:var(--fg-3);max-width:62ch;margin:10px 0 0 16px}

/* ── the photo sheet. ── */
.fm-sheet{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(8px,1.2vw,16px);
  margin-top:var(--gap-row)}
.fm-sh-c{margin:0;aspect-ratio:4/3;min-width:0}
.fm-sh-c>img{width:100%;height:100%;object-fit:cover;display:block}
.fm-sheet-n{color:var(--ink-3);margin-top:14px;max-width:62ch}
@media (max-width:760px){.fm-sheet{grid-template-columns:minmax(0,1fr)}
  .fm-sh-c{aspect-ratio:3/2}}

/* ── the two ways in, and the two onward doors. ── */
.fm-ways{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:clamp(20px,3vw,56px);
  border-top:1px solid var(--hair);margin-top:var(--gap-row);padding-top:var(--gap-row)}
.fm-way>*{margin:0;min-width:0}
.fm-way-l{color:var(--fg-3)}
.fm-way-v{font-size:clamp(22px,2.6vw,38px);line-height:1.1;margin-top:10px}
.fm-way-v a{color:var(--mustard);text-decoration:none;border-bottom:1px solid transparent}
.fm-way-v a:hover{border-bottom-color:currentColor}
.fm-way>.cap{color:var(--fg-3);margin-top:10px}
.fm-onward{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:clamp(14px,2vw,28px);
  border-top:1px solid var(--hair);margin-top:var(--gap-block);padding-top:var(--gap-row)}
.fm-door-a{display:block;text-decoration:none;color:inherit;border:1px solid var(--hair);
  padding:clamp(16px,2vw,24px);min-width:0}
.fm-door-a:hover{border-color:var(--fg-2)}
/* ONE CHANNEL, after the phone number came off (owner, 22 August). Not a
   two-column grid with an empty cell. */
.fm-ways-1{grid-template-columns:minmax(0,1fr)}
.fm-door-a .fm-door-h{color:var(--mustard)}
@media (max-width:640px){.fm-ways,.fm-onward{grid-template-columns:minmax(0,1fr)}}
`;

/* ═══ WRITE ══════════════════════════════════════════════════════════════ */
const OUT = await S.assemble({
  file: 'farm.html',
  title: 'Swechha Farm &mdash; Swechha',
  bands: BANDS, index: INDEX, sh, clashes,
  pageCss: PAGE_CSS,
  /* `Farm` is a nav word and this page IS it, so it takes aria-current="page".
     The shell cannot derive that — its family is the six situations — so it is
     passed, exactly as /impact passes its own. */
  navMark: { current: 'Farm', url: '/farm' },
  sectionFor: (id) => (B[id] || (() => '    <div class="wrap"><p class="lead">&mdash;</p></div>'))(),
  note: `${BANDS.length} bands + footer. ${OWN.length} own figures + ${RESOLVED.length} resolved `
      + `from the Farm School, ${F.come.doors.length} doors, ${F.waiting.claims.length} named holes, `
      + `${FRAMES.length} frames.`,
});

/* ═══ POST-WRITE GATES ═══════════════════════════════════════════════════ */
let fail = 0;
const gate = (ok, msg) => { if (!ok) { console.error(`  FAIL ${msg}`); fail++; } else console.log(`  ok   ${msg}`); };
console.log('\nGATES');

/* Rendered text only. Tested on the raw HTML, a gate for a word trips on class
   names and attribute values and gets switched off by the next person. */
const RENDERED = OUT.replace(/<style[\s\S]*?<\/style>/g, ' ')
  .replace(/<script[\s\S]*?<\/script>/g, ' ')
  .replace(/<!--[\s\S]*?-->/g, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&mdash;|&middot;|&nbsp;/g, ' ')
  .replace(/\s+/g, ' ');

/* 1. NO ACREAGE BUT FIVE. D-07.3, and the reason this gate is worth its
      length: forty acres and twelve acres were both live in this repo, and
      two hectares is FIVE ACRES IN OTHER UNITS — so a future session doing
      the arithmetic honestly can re-import a struck figure believing it is
      corroborating the ruled one. Any acreage or hectarage that is not the
      word "five" fails, including "5". */
/* A QUANTITY before the unit, not any word before it. The first version
   matched `[\w-]+ acres` and tripped on "barren acres", which is an adjective
   and not a claim about size — a gate that cries wolf is a gate somebody
   deletes. This one flags only a number or a number-word. */
const QTY = String.raw`\d[\d,.]*|zero|one|two|three|four|five|six|seven|eight|nine|ten`
  + String.raw`|eleven|twelve|fifteen|twenty|thirty|forty|fifty|sixty|hundred|thousand`;
const acre = [...RENDERED.matchAll(new RegExp(String.raw`\b(${QTY})\s+(acres?|hectares?)\b`, 'gi'))]
  .map(m => m[0]).filter(m => !/^(five|5)\s+acres?$/i.test(m));
gate(acre.length === 0, `no acreage on the page but "five acres"${acre.length ? `; FOUND: ${[...new Set(acre)].join(' | ')}` : ''}`);

/* 2. THE JOURNEY IS NEVER STATED IN KILOMETRES. The farm is ~60km as the crow
      flies and ~100 by road, so the frozen homepage's "60km" and a road figure
      were BOTH true of different things and neither answers "can I get there
      and back in a day". D-07.3 ruled the time, and the time is what a reader
      needs.
      TWO GATES, BECAUSE ONE WAS NOT HONEST. A digit-anchored regex passes a
      page that says "a couple of kilometres" — which this page does say, of
      the nearest shop, in the owner's own words. That is a different fact and
      it stays. So: no NUMERIC kilometre figure at all, and the shop is the
      only place the word may appear. If a second one ever turns up, somebody
      is measuring the journey again and the build stops. */
const km = [...RENDERED.matchAll(/\d[\d,.]*\s*(km|kms|kilometres?|kilometers?)\b/gi)].map(m => m[0]);
gate(km.length === 0, `no numeric distance in kilometres${km.length ? `; FOUND: ${km.join(', ')}` : ''}`);
const kmWords = [...RENDERED.matchAll(/[^.]*\bkilometres?\b[^.]*/gi)].map(m => m[0].trim());
gate(kmWords.length === 1 && /nearest shop/i.test(kmWords[0]),
  `the only kilometre on the page is the nearest shop${kmWords.length !== 1 ? `; FOUND ${kmWords.length}: ${kmWords.join(' // ')}` : ''}`);

/* 3. THE HOMEPAGE'S RULED FACTS SURVIVE INTO THE PAGE ITS BUTTON OPENS. */
gate(/\bFive acres\b/.test(RENDERED), 'the lead carries "Five acres"');
gate(/ninety minutes|hour and a half/i.test(RENDERED), 'the lead carries the ninety minutes');
gate(/\bLadpuri\b/.test(RENDERED), 'the farm is placed at Ladpuri (F-5)');
gate(/\bFood Forest\b/.test(OUT), "the client's proper noun is capitalised");
gate(/Nothing grew/i.test(RENDERED), "the homepage band's hook opens the page it points at");

/* 3b. THE FACTS THE CLIENT GAVE ON 22 AUGUST, AND THE ONE THEY SUPERSEDE.
      THE TREE COUNT IS THE PAGE'S SPINE: the land had ONE tree, not none, and
      the number that matters is the distance between one and five thousand.
      The owner's live Airbnb listing still says "NOT A SINGLE TREE a year
      ago" — it is his own published text, it is the more dramatic line, and
      it is WRONG. A future session reading that listing in good faith will
      want to put it back, so the gate refuses it by name rather than trusting
      anyone to remember this paragraph. */
gate(/\bOne tree\b/.test(RENDERED), 'the land had ONE tree, and the page says so');
gate(!/not a single tree/i.test(RENDERED),
  'the superseded "not a single tree" wording is absent (owner, 22 August: it was one tree)');
gate(/\b5,000\+/.test(RENDERED), 'the five thousand it became is on the page');
gate(/\bMewat\b/.test(RENDERED), 'Mewat is named — the region, not only the village');
gate(/built with the people who live around it|community/i.test(RENDERED),
  'the farm is credited to the community that built it');
for (const w of ['Live', 'Learn', 'Lead']) {
  gate(new RegExp(`fm-triad-w">${w}<`).test(OUT), `the triad carries ${w}`);
}
/* 3d. THE PARTICIPATION FIGURE (F-18). The last thing this page could not say.
      It is RESOLVED from the work register, not typed here, so /farm, the Farm
      School page and /impact cannot disagree about it — and the register is
      where it belongs, because "30 school groups a year" is a fact about the
      programme that the place happens to host. */
gate(/\b30\b/.test(RENDERED) && /School groups a year/i.test(RENDERED),
  'the participation figure is published and resolved: 30 school groups a year');
gate(!/class="p-hole"/.test(OUT) && !/id="waiting"/.test(OUT),
  'the waiting band is gone — nothing on this page is unsourced any more');

for (const c of F.before.produce.counts.filter(x => x.n !== '—')) {
  gate(RENDERED.includes(`${c.n}`) && RENDERED.includes(c.what), `orchard count rendered: ${c.n} ${c.what}`);
}
/* The activities the client named on 22 August, each checked by name. A list
   is the easiest thing on a page to quietly lose in a later edit. */
for (const a of ['Bird watching', 'tractor ride', 'crickets', 'Star gazing', 'cows']) {
  gate(new RegExp(a, 'i').test(RENDERED), `activity present: ${a}`);
}

/* 3c. NO BAND HEAD CONTAINS A WORD TOO LONG FOR ITS COLUMN.
      `.im-head` is a 12-column grid and the head takes about half of it; at
      the display size that column is ~564px at 1280. "TRANSFORMATION" set in
      `.d1` measures 710px and CANNOT WRAP — a single long word does not
      respect `minmax(0,1fr)`, so it silently painted across the lead beside
      it. Caught by eye only because the band was screenshotted; a diff shows
      nothing and a contrast audit shows nothing.
      TWELVE CHARACTERS is the measured ceiling, not a guess: 710px/14 chars
      is ~50px per character at this size, and 564px of column therefore holds
      about eleven. The client offered both "transformation" and "change" for
      this head — the shorter word is the one that can be set big, which is
      what he asked for. */
const LONGEST = 12;
const longWords = [];
for (const m of OUT.matchAll(/<h2 class="d1" id="([^"]+)">([\s\S]*?)<\/h2>/g)) {
  for (const w of m[2].replace(/<[^>]+>/g, ' ').split(/[\s—–-]+/)) {
    const bare = w.replace(/[^A-Za-z]/g, '');
    if (bare.length > LONGEST) longWords.push(`${m[1]}: "${bare}" (${bare.length})`);
  }
}
gate(longWords.length === 0,
  `no band head has a word over ${LONGEST} characters${longWords.length ? `; TOO LONG: ${longWords.join(', ')}` : ''}`);

/* 4. THE TWO RESOLVED FIGURES ARE THE FARM SCHOOL'S, RENDERED. */
for (const r of RESOLVED) {
  gate(RENDERED.includes(r.value), `resolved from the Farm School: ${r.value} — ${r.label}`);
}

/* 5. NO BAND ID COLLIDES WITH A NAV WORD. The frozen observer matches band ids
      against nav hrefs, and `Farm` is a nav word — on THIS page of all pages. */
const navWords = S.NAV.map(([, h]) => h.startsWith('/#') ? h.slice(2) : null).filter(Boolean);
const collide = BANDS.map(b => b[0]).filter(id => navWords.includes(id));
gate(collide.length === 0, `no band id collides with a nav word${collide.length ? `; COLLIDING: ${collide.join(', ')}` : ''}`);

/* 6. THE NAMED HOLES RENDER AS HOLES. Ruling F-3 is only kept if the school
      camp door actually says it cannot answer. */
gate((OUT.match(/class="p-hole"/g) || []).length === F.waiting.claims.length,
  `exactly ${F.waiting.claims.length} named hole(s) render — the camp capacity is ANSWERED (100) and must no longer print as one`);

/* 6b. THE CAPACITY, AND THE THINGS THE CLIENT RULED OUT.
      100 students closes the hole this page shipped with. The MEAL RATES are
      the opposite ruling: they are real, they are on his own live Airbnb
      listing, they are undated, and he has said they do not go on the site.
      An undated price is the easiest thing in this whole build for a future
      session to "helpfully" add, so it is refused by number. */
gate(/\b100\b/.test(RENDERED) && /stay over/i.test(RENDERED), 'the camp capacity is published: 100 students');
const rates = [...RENDERED.matchAll(/(?:₹|Rs\.?\s*)\d+/gi)].map(m => m[0]);
gate(rates.length === 0, `no price on the page — the meal rates are ruled out${rates.length ? `; FOUND: ${rates.join(', ')}` : ''}`);

/* 6c. NO ELAPSED-YEAR COUNT IS TYPED IN THE DATA. D-09.5. The data file must
      say `{{years}}` and let the build compute it; a typed "four years" is
      wrong from the next January and nothing would catch it. */
/* CONTENT FIELDS ONLY. `_` keys are this repo's in-file documentation and the
   note on `acquired` necessarily QUOTES the client's "4 years ago" — scanning
   raw text made the gate fail on its own explanation, which is the fastest way
   to get a gate switched off. */
const typedYears = [];
const scanTyped = (o, path = '') => {
  if (Array.isArray(o)) return o.forEach((v, i) => scanTyped(v, `${path}[${i}]`));
  if (o && typeof o === 'object') {
    for (const [k, v] of Object.entries(o)) if (k !== '_') scanTyped(v, `${path}.${k}`);
    return;
  }
  if (typeof o !== 'string') return;
  for (const m of o.matchAll(/\b(one|two|three|four|five|six|seven|eight|nine|ten|\d+)[ -]years?\b/gi)) {
    typedYears.push(`${path}: "${m[0]}"`);
  }
};
scanTyped(F);
gate(typedYears.length === 0,
  `no elapsed-year count typed in the data — use {{years}}${typedYears.length ? `; TYPED: ${typedYears.join(', ')}` : ''}`);
gate(new RegExp(`less than ${LESSTHAN} years`).test(RENDERED),
  `the derived CEILING reached the page: "less than ${LESSTHAN} years" (elapsed ${YEARS})`);
/* The bound must never be stated as an exact elapsed count — that is the
   thing F-16 replaced, and it is the thing that can go wrong silently. */
gate(!new RegExp(`(?<!less than )\\b${YEARWORD} years\\b`).test(RENDERED),
  `the span is stated only as a bound, never as "${YEARWORD} years"`);

/* 6d. WHERE A HUNDRED STUDENTS SLEEP (F-17). The page carried a deliberate
      silence here for exactly one pass: capacity was published before the
      arrangement was known, and inventing a dormitory was the one thing that
      could not be done. Tents on the farm's own camping site is the answer,
      and it also explains something that was sitting in the research
      unexplained — Google lists this place as a CAMPGROUND, not a guest
      house, and now it is obvious why. */
for (const w of ['tents', 'camping site']) {
  gate(new RegExp(w, 'i').test(RENDERED), `the sleeping arrangement is stated: ${w}`);
}

/* 7. PHOTOGRAPHS, INSIDE W-18's BAND. */
const imgs = (OUT.match(/<img[^>]+src="\/images\//g) || []).length;
gate(imgs >= 7 && imgs <= 12, `${imgs} photographs — inside W-18's 7–12 band`);

/* 8. NO PROTOTYPE PATH ESCAPES INTO A LIVE HREF (AD-23). */
const designHrefs = [...OUT.matchAll(/href="(\/design\/[^"]*)"/g)].map(m => m[1]);
gate(designHrefs.length === 0, `no /design/ href${designHrefs.length ? `; FOUND: ${[...new Set(designHrefs)].join(', ')}` : ''}`);

/* 9. EVERY GRID TRACK IS minmax(0,1fr) — a bare 1fr does not shrink and is
      how a table or a long word blows the page out sideways. */
const bareFr = [...PAGE_CSS.matchAll(/grid-template-columns:[^;}]*/g)]
  .map(m => m[0]).filter(s => /\b1fr/.test(s.replace(/minmax\(0,\s*1fr\)/g, 'MM')));
gate(bareFr.length === 0, `every grid track is minmax(0,1fr)${bareFr.length ? `; BARE: ${bareFr.join(' | ')}` : ''}`);

/* 10. THE NAV MARKS THIS PAGE, AND MARKS IT AS THE PAGE. */
gate(/<a class="nl" href="\/farm" aria-current="page">Farm<\/a>/.test(OUT),
  'the nav marks Farm as the current page — which requires NAV to point at /farm');

/* 11. EVERY BAND CARRIES A HEADING. */
const headless = BANDS.map(b => b[0]).filter(id => id !== 'top'
  && !new RegExp(`id="${id}-h"`).test(OUT));
gate(headless.length === 0, `every band carries a heading${headless.length ? `; HEADLESS: ${headless.join(', ')}` : ''}`);

/* 12. EVERY INDEX CHIP RESOLVES TO A BAND ON THIS PAGE. */
for (const [, href] of INDEX) gate(OUT.includes(`id="${href.slice(1)}"`), `index chip ${href} resolves`);

/* 13. THE STRUCK PHONE NUMBER MAY NEVER COME BACK (owner, 22 August). Checked
       on digits with separators stripped, so a reformat does not evade it. */
gate(!OUT.replace(/[^\d]/g, '').includes('9013522222') && !/href="tel:/.test(OUT),
  'the struck phone number is absent, and there is no tel: link');

if (fail > 0) {
  console.error(`\n${fail} gate(s) failed. The file is written — fix the generator and rebuild.`);
  process.exit(1);
}
console.log(`\n${OUT.length.toLocaleString('en-IN')} bytes. All gates pass.`);
