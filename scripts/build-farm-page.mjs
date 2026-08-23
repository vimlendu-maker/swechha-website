// AD-24 / AD-27 — farm.html, the Swechha Farm page. NINE BANDS, AND THEY ARE
// NOT AD-24's NINE.
//
// ★ THIS IS THE PAGE D-07.13 PROMISED AND NOBODY BUILT.
//
// On 21 August the client reopened homepage band 8 and required it to carry
// two stories, "both detailed further on the inner page": the transformation
// of barren land into a flourishing Food Forest, and the fact that it is a
// place you can come to. The band shipped with its hook ("Nothing grew here")
// and its button ("Visits, camps and retreats") — and the button pointed at
// href="#" until AD-24 built this page.
//
// ★ AD-27 IS A LENGTH AND CONVERSION PASS, ON THE CLIENT'S OWN WORDS.
// "Story of change section is too long and too text heavy… split into more
// readable sections with lesser text. Highlights is important." · "Remove the
// section on How the Place keeps itself, completely." · "Remove the section on
// nursery hive etc, integrate it." · "Shorten 'Its not a hotel'… may be put
// Airbnb or google link of the map." · "Have a solid CTA and easy conversion
// strategy." · "Mewat is a region and not a country."
//
// What that cost, in structure (AD-27.31):
//   top · origin · built · grows · systems · visit · doing · plainly · act
//   — `keeps` DELETED (AD-27.33), its one unique fact (solar) now an
//     inventory line in `systems`;
//   — `sheet` DELETED as a band (AD-27.34), its three photographs moved
//     beside the inventory cells they actually depict;
//   — `built`, `systems` and `doing` SPLIT out of bands that ran 3,200–5,600px
//     on a phone;
//   — `origin` now leads on the figure (1 → 5,000+ in less than five years)
//     instead of on seven rows of essay (AD-27.32);
//   — `waiting` is gone: F-13 and F-18 closed both its claims and an empty
//     "what we cannot tell you" band performs honesty instead of doing it.
//
// ★ THE CONVERSION SURFACE WAS THREE LINKS IN THE LAST BAND. It is now the
// Ask (AD-27.14–17): a native <details> whose <summary> is the ask itself,
// resolving in place — one sentence about who reads it, one prefilled mailto,
// the address as selectable text, and a quiet link on to /act for the reader
// who does want to read more. Five doors carry one; `act` carries one. TWO
// AUDIENCES, school and institution, which is how AD-27.37 reads AD-27.18's
// two-Asks cap on this page: five doors of the same audience is one ask
// repeated, and each door is a different offer. THE COMPONENT IS LANE 1's —
// its CSS arrives through situation-shell.mjs's SHARED_PAGE_CSS and is NOT
// copied here. The markup and the four bodies are verbatim from AD-27.15/17.
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
//
// ★ NO ACREAGE BUT FIVE, AND NO DISTANCE IN KILOMETRES. GATED.
// D-07.3 ruled five acres and an hour and a half from Delhi. Forty acres
// (frozen homepage), twelve (a prototype) and "60km" have all been struck, and
// the farm's own live Airbnb listing still says "5 acre" while the PDF says
// two hectares — the same number in different units, which is exactly how a
// stale figure gets re-imported by a future session acting in good faith.
//
// ★ NO BAND MAY BE CALLED `farm`.
// The frozen active-section observer matches band ids against nav hrefs, and
// `Farm` is a nav word. A band called `farm` here lights the wrong nav item.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import * as S from './lib/situation-shell.mjs';
const { esc, opener, ARROW } = S;

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

const RESOLVED = F.grows.resolved.map(r => {
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
  'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen',
  'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
const CAP = (w) => w.charAt(0).toUpperCase() + w.slice(1);
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

/* ── THE INVENTORY'S OWN LENGTH, WRITTEN INTO ITS HEADING ─────────────────
   AD-27.31 named this band "Thirteen things running" from the count before
   AD-27.33 moved solar into it. A typed numeral in a heading over a list is
   the easiest thing on this page to make false with one edit, so the build
   counts the list and writes the word. Same rule as the years, different
   number. */
const SYSTEMWORD = CAP(WORD[F.systems.items.length] || String(F.systems.items.length));

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
for (const d of F.visit.doors) if (d.resolved) d.figure = resolveFig(d.resolved);

/* ── EVERY FIGURE CARRIES A SOURCE ────────────────────────────────────────
   The section's standing rule, applied before a line of HTML is built. */
const OWN = F.grows.figures;
for (const f of [...OWN, ...F.origin.rail, ...F.top.readouts]) {
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

/* ═══ THE ASK (AD-27.14–17) ══════════════════════════════════════════════
   THIS FILE NO LONGER CARRIES A COPY OF THE COMPONENT. It used to: ~60 lines
   duplicating `situation-shell.mjs`'s `ask()` — the arrow, the four bodies,
   the subject pattern, the mailto builder and both sentences of prose. The
   markup was byte-identical by hand, which is not a guarantee, it is a
   coincidence that held. This page renders the Ask SIX TIMES, so every word of
   that duplicate shipped six times on one page, and AD-28's copy edit to the
   panel would have had to be made twice and could have been made once.

   Lane 1 authors the component; this file places it. `S.ask()` is that
   component. What stays here is what is genuinely this page's: which page name
   goes in the subject line, which route goes in the body, and which two of the
   four audiences /farm is allowed to ask as.

   ONE ADDRESS, NO TURNAROUND PROMISE. `vimlendu@swechha.in` is the address the
   owner offered for this and the only one that satisfies about-people.json's
   email_policy. The subject line is the routing, so the pattern is invariable:
   "{Audience} enquiry — {Page name}". Naming the person is the honest form of
   "short turnaround"; an SLA nothing in the record supports is the one lie that
   would cost more than it buys. */
const ASK_PAGE = 'Swechha Farm';
const ASK_PATH = '/farm';
/* The two /farm may ask as, out of the shell's four. A door that asked as a
   funder or a journalist would be a different page's ask on this one. */
const ASK_HERE = ['school', 'institution'];

const ask = (a, indent = '        ') => {
  if (!a || !ASK_HERE.includes(a.audience)) {
    console.error(`REFUSING TO BUILD: "${a && a.audience}" is not an audience this page can ask as `
      + `(${ASK_HERE.join(', ')}). Nobody invents a fifth audience (AD-27.56).`);
    process.exit(1);
  }
  /* `S.ask()` indents at six spaces, which is where the situation pages place
     it. Two of this page's six sit four deeper, inside a door card. Re-indent
     the block rather than fork the component for whitespace. */
  const block = S.ask({
    audience: a.audience,
    label: a.label,
    page: ASK_PAGE,
    path: ASK_PATH,
    level: a.primary ? 1 : 2,
  });
  return indent === '      ' ? block
    : block.split('\n').map(l => indent + l.replace(/^ {6}/, '')).join('\n');
};

/* ═══ COMPONENTS ═════════════════════════════════════════════════════════ */
const num = (v) => esc(v).replace(/\+$/, '<sup>+</sup>');

/* `{{years}}` / `{{lessthan}}` / `{{systems}}` in any string are replaced with
   the DERIVED values. The data file may not type them, and this is the seam
   where that rule is enforced rather than merely stated. */
const yr = (t) => String(t)
  .replace(/\{\{years\}\}/g, YEARWORD)
  .replace(/\{\{lessthan\}\}/g, LESSTHAN)
  .replace(/\{\{systems\}\}/g, SYSTEMWORD);

/* ★ AD-28 — THE FIGURE STANDS ALONE. NO PERIOD LINE, NO PROVENANCE LINE.
   This used to take a `prov` argument and print a third line under every
   numeral: "counted August 2026" over "SOURCE-FACTS §200, owner 21 August
   2026". The owner struck exactly that, by example — "Never like this:
   SOURCE-FACTS §200, owner 21 August 2026" — and /farm is an organisational
   page, so it carries no sourcing apparatus at all (AD-28 §2.2). The `period`
   and `source` keys stay in data/farm.json as the internal record; they no
   longer reach the HTML, and gate 21 below fails the build if they do.
   If a figure cannot be stood behind, it is not published — it is not
   published with a caveat under it. */
const bigFig = (f) => `          <div class="fm-big">
            <p class="num fm-big-v">${yr(num(f.value))}</p>
            <p class="lbl fm-big-l">${esc(yr(f.label))}</p>
          </div>`;

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

   THE GROUND CLASS IS NOT THE TIER CLASS, and AD-27.31 made a point of it
   because /act's gate 0 caught exactly this: `t1`, `t2`, `t3` are PADDING and
   paint nothing. A band whose chain entry says #151512 must carry `dark-2`;
   #F3F2F0 is `paper`, #ECEBE8 is `paper-2`, #0D0D0B is neither. AD-24's
   `grows` declared #151512 with no `dark-2` on it and therefore rendered
   #0D0D0B — a chain that was checking a hex the page never painted. Gate 14
   below now proves the class and the hex agree.

   `t1` MEANS ZERO PADDING and is only for a band that supplies its own — the
   masthead does, through `.pic-body`. AD-27.31's table puts `act` back on
   `t1`; it is built on `t3` instead, because `visit` and `act` were on `t1`
   once and their `opener()` heading sat flush against the ground change above
   it (display-scale h2 starting 0px below a hard #ECEBE8 → #0D0D0B edge).
   The tier paints nothing, so the ground chain is identical either way. */
const ALL_BANDS = [
  ['top',     't1',         '#0D0D0B'],
  ['origin',  'paper t2',   '#F3F2F0'],
  ['built',   'dark-2 t2',  '#151512'],
  ['grows',   'paper-2 t2', '#ECEBE8'],
  ['systems', 't3',         '#0D0D0B'],
  ['visit',   'paper t2',   '#F3F2F0'],
  ['doing',   'dark-2 t3',  '#151512'],
  ['plainly', 'paper-2 t2', '#ECEBE8'],
  ['act',     't3',         '#0D0D0B'],
];
const BANDS = ALL_BANDS;
const clashes = S.groundChain(BANDS);

const INDEX_ALL = [
  ['Nothing grew here', '#top'], ['A story of change', '#origin'], ['Built by Mewat', '#built'],
  ['What grows now', '#grows'], [`${SYSTEMWORD} things running`, '#systems'], ['Ways to come', '#visit'],
  ['What a group does', '#doing'], ['Not a hotel', '#plainly'], ['Come and see', '#act'],
];
/* Derived from the bands that actually render, so a chip can never point at
   a band that is not there. */
const BAND_IDS = new Set(BANDS.map(b => b[0]));
const INDEX = INDEX_ALL.filter(([, href]) => BAND_IDS.has(href.slice(1)));

const B = {};

/* ── BAND 1. THE MASTHEAD. 80 words. ─────────────────────────────────────
   The hook is the frozen homepage's, word for word, and that is deliberate:
   the door and the room must not disagree. The two readouts are D-07.3's,
   byte for byte what band 8 carries. The hero is NOT band 8's photograph —
   the same frame twice would make the click feel like it failed.
   AD-27.30 rewrote the standfirst and the rail's place cell: "the Mewat
   country" read as a nation, and `Mewat, in the Aravallis` over `Ladpuri`
   read as a postal address in which Mewat was the administrative unit. The
   region is named as a region, and the district is stated. */
const M = F.top;
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

/* ── BAND 2. A STORY OF CHANGE. THE FIGURE LEADS. 200 words. ─────────────
   AD-27.32. The page's headline claim — one tree became more than five
   thousand, in less than five years — was running text inside row 1 of seven,
   on a page that set "20 Cows" as a 42px numeral two bands later. THE
   STRONGEST NUMBER ON THE PAGE WAS THE ONLY ONE NOT SET AS A NUMBER. It is
   now a three-cell rail, and the Executive Director's sentence is promoted
   into the pull-quote it already was (the component is `plainly`'s, borrowed
   rather than invented).
   The span stays DERIVED, never typed: `< five` comes from LESSTHAN, and the
   gate that fails the build on a typed "four years" stays.
   Rows 2–7 moved to `built`. Row 7 is deleted; its content survives there. */
const O = F.origin;
B.origin = () => `${opener('origin', O.head, esc(yr(O.lead)))}
    <div class="wrap">
      <blockquote class="fm-quote fm-quote-w">
        <p class="lead">${esc(O.quote)}</p>
        <p class="cap">${esc(O.quote_attr)}</p>
      </blockquote>
      <div class="fm-figs" style="--n:${O.rail.length}">
${O.rail.map(f => bigFig(f)).join('\n')}
      </div>
      <div class="fm-ctx">
        <figure class="fm-ctx-f"><img class="duo" src="${O.context.frame.src}" alt="${esc(O.context.frame.alt)}" loading="lazy"></figure>
        <div class="fm-ctx-t">
          <p class="lbl fm-ctx-h">${esc(O.context.h)}</p>
          <p class="body fm-ctx-p">${esc(O.context.p)}</p>
        </div>
      </div>
    </div>`;

/* ── BAND 3. BUILT BY MEWAT. 240 words. NEW, split out of `origin`. ──────
   How it was done and who did it, in the order it was actually done: trees,
   then permaculture, then the mud houses. THREE rows, not four — the owner
   retracted the water-first row on 23 August ("The following is not true in
   teh farm page, delete it from the root"), so it is gone from data/farm.json
   and `gateRetracted()` below refuses to write if it comes back. Each row is
   capped at 55 words, one photograph. The
   community row folded into the lead, because it is the band's premise and
   not one item in a list — F-9's point is that five restored acres in a
   comfortable district is landscaping and five restored acres here is not. */
B.built = () => `${opener('built', F.built.head, esc(yr(F.built.lead)))}
    <div class="wrap">
      <div class="fm-split fm-split-r">
        <div>
${rows(F.built.rows)}
        </div>
${sideFrame(F.built.frame)}
      </div>
    </div>`;

/* ── BAND 4. WHAT GROWS THERE NOW. 200 words. ────────────────────────────
   Five figures — three of this page's own, two RESOLVED out of the Farm
   School — then the orchard counts the client gave as counts (F-11), then the
   produce. The inventory that used to follow them is its own band now
   (`systems`), which is what "break up What grows there now" asked for. */
const G = F.grows;
B.grows = () => `${opener('grows', G.head, esc(G.lead))}
    <div class="wrap">
      <div class="fm-figs" style="--n:${OWN.length + RESOLVED.length}">
${OWN.map(f => bigFig(f)).join('\n')}
${RESOLVED.map(f => bigFig(f)).join('\n')}
      </div>
      <div class="fm-prod">
        <div class="fm-prod-t">
          <p class="lbl fm-prod-h">${esc(G.produce.h)}</p>
          <p class="lead fm-prod-p">${esc(G.produce.p)}</p>
          <div class="fm-orch">
${G.produce.counts.map(c => `            <div class="fm-orch-c"><p class="num fm-orch-n">${esc(c.n)}</p><p class="lbl fm-orch-w">${esc(c.what)}</p></div>`).join('\n')}
          </div>
        </div>
        <figure class="fm-prod-f"><img class="duo" src="${G.produce.frame.src}" alt="${esc(G.produce.frame.alt)}" loading="lazy"></figure>
      </div>
    </div>`;

/* ── BAND 5. THE INVENTORY, AS A REGISTER. 250 words. NEW. ───────────────
   One line each, and the density is the argument — a barren field does not
   have a manifest. AD-27.34's three photographs live HERE, each inside the
   cell it depicts: the dairy, the native nursery, the apiary. That is the
   client's own word, "integrate": `sheet` was a contact sheet of three
   systems already described two bands above it, so the page introduced the
   dairy in words and then, 4,000px later, showed it.
   COLUMNS, NOT A GRID. Three of fourteen cells carry a photograph and a grid
   stretches the whole row to the tallest cell, leaving a hole beside each
   one. CSS columns let the register flow and keeps every cell on its own
   hairline. */
B.systems = () => `${opener('systems', yr(F.systems.head), esc(F.systems.lead))}
    <div class="wrap">
      <div class="fm-inv">
${F.systems.items.map(s => `        <div class="fm-inv-c">
          <p class="lbl fm-inv-h">${esc(s.h)}</p>
          <p class="body fm-inv-p">${esc(s.p)}</p>${s.frame ? `
          <figure class="fm-inv-f"><img class="duo" src="${s.frame.src}" alt="${esc(s.frame.alt)}" loading="lazy"></figure>` : ''}
        </div>`).join('\n')}
      </div>
    </div>`;

/* ── BAND 6. LIVE, LEARN, LEAD. 380 words. THE CONVERSION BAND. ──────────
   F-8's frame above five genuinely different lengths of stay — and, as of
   AD-27.37, five doors that can actually be pressed. The measurement that
   forced it: this page's entire conversion surface was three links in the
   last band, and the band describing five ways to come contained ZERO. A
   reader who has just read "up to a hundred students stay over" had nothing
   to press.
   THE BAND'S ONE PRIMARY BUTTON is the school Ask on the camps door
   (BRANDING §5.8: one `.b-1` per band); the other four summaries take `.b-2`. */
const V = F.visit;
B.visit = () => `${opener('visit', V.head, esc(V.lead))}
    <div class="wrap">
      <div class="fm-triad">
${V.triad.map(t => `        <div class="fm-triad-c">
          <p class="d1 fm-triad-w">${esc(t.w)}</p>
          <p class="body fm-triad-p">${esc(t.p)}</p>
        </div>`).join('\n')}
      </div>
      <div class="fm-doors">
${V.doors.map(d => `        <div class="fm-door">
${d.frame ? `          <figure class="fm-door-f"><img class="duo" src="${d.frame.src}" alt="${esc(d.frame.alt)}" loading="lazy"></figure>\n` : ''}          <h3 class="fm-door-h">${esc(d.name)}</h3>
          <p class="body fm-door-p">${esc(d.p)}</p>
${[d.capacity, d.figure].filter(Boolean).map(g => `          <p class="fm-door-fig"><span class="num">${esc(g.value)}</span> <span class="lbl">${esc(g.label)}</span></p>`).join('\n')}
          <p class="cap fm-door-w">${esc(d.who)}</p>
${ask(d.ask, '          ')}
        </div>`).join('\n')}
      </div>
    </div>`;

/* ── BAND 7. WHAT A GROUP ACTUALLY DOES. 220 words. NEW. ─────────────────
   Eleven activities, one sentence each, on the same hairline run the
   inventory uses because they are the same KIND of list. It was the tail of
   `visit`, which is how that band reached 5,089px on a phone. */
B.doing = () => `${opener('doing', F.doing.head, esc(F.doing.lead))}
    <div class="wrap">
      <div class="fm-act-grid">
${F.doing.items.map(a => `        <div class="fm-act-c">
          <p class="lbl fm-act-ch">${esc(a.h)}</p>
          <p class="body fm-act-cp">${esc(a.p)}</p>
        </div>`).join('\n')}
      </div>
    </div>`;

/* ── BAND 8. IT IS NOT A HOTEL. 120 words, down from 201. ────────────────
   The client's own listing tells people what is wrong with the place before
   it tells them what is right, and that is the best-registered writing any
   source for this page produced. AD-27.35 cut seven rows to five: the shop
   folded into the groundwater row and the food into the animals row.
   AND IT ENDS IN A MAP (AD-27.36). The coordinates are in the ledger, from
   the farm's own Google listing, and google.com/maps/search/?api=1&query= is
   Google's documented URL API — so the link is constructed from a recorded
   fact through a published interface. THE AIRBNB LINK IS NOT BUILT: the two
   listings exist in the record as numeric ids only, and synthesising
   airbnb.co.in/rooms/{id} from an id is guessing a URL shape. This repo has
   shipped fabricated citations once already. */
const C = F.plainly;
B.plainly = () => `${opener('plainly', C.head, esc(C.lead))}
    <div class="wrap">
      <div class="fm-split">
${sideFrame(C.frame)}
        <div>
${rows(C.rows)}
          <blockquote class="fm-quote">
            <p class="lead">${esc(C.quote)}</p>
            <p class="cap">${esc(C.quote_attr)}</p>
          </blockquote>
          <p class="fm-map"><a class="act" href="${esc(F.place.map_url)}" rel="noopener" target="_blank">${esc(F.place.map_label)}<span class="sr"> (opens in a new tab)</span> ${ARROW}</a></p>
${(F.stay.airbnb || []).map(s => `          <p class="fm-map"><a class="act" href="${esc(s.url)}" rel="noopener" target="_blank">${esc(s.label)}<span class="sr"> (opens in a new tab)</span> ${ARROW}</a></p>`).join('\n')}
        </div>
      </div>
    </div>`;

/* ── BAND 9. COME AND SEE. 100 words. ────────────────────────────────────
   An address, per ruling F-2, and now an Ask beside it. The address itself
   changed: it published `swechhaindia@gmail.com`, which fails
   about-people.json's email_policy that /act's gate 10 enforces (AD-25 §6
   item 5 flagged it and could not reach this file). It is
   `vimlendu@swechha.in` now, the same address every Ask on the site uses.

   THE PHONE CELL IS GONE, on the owner's instruction of 22 August ("remove my
   phone number from the site"), which supersedes F-2's phone clause. F-2's
   actual point — this page ends in a PERSON and not a form — is unchanged.
   The cell is CONDITIONAL rather than deleted: `F.act.phone` is absent from
   farm.json, so nothing renders, and if the owner ever gives an office number
   it comes back by adding that one field. */
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
${ask(A.ask, '      ')}
      <div class="fm-onward">
${A.onward.map(o => `        <a class="fm-door-a" href="${o.href}">
          <h3 class="fm-door-h">${esc(o.h)} ${ARROW}</h3>
          <p class="body fm-door-p">${esc(o.p)}</p>
        </a>`).join('\n')}
      </div>
    </div>`;

/* ═══ PAGE CSS ═══════════════════════════════════════════════════════════
   THE ASK'S CSS IS NOT HERE. It arrives through situation-shell.mjs's
   SHARED_PAGE_CSS (AD-27.16), which lane 1 owns; a second copy in this file
   is the drift that ruling exists to prevent. */
const PAGE_CSS = `
/* ── AD-24 / AD-27. SWECHHA FARM. ──────────────────────────────────────── */

/* ── masthead rail. Four cells, and the fourth is a WORD not a numeral:
      "where" is the fact this page adds that the homepage band never had
      (F-5), and it belongs beside the ruled readouts rather than buried in
      the lead. It takes a smaller size because a word set at numeral scale
      reads as a logo. ── */
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
/* ── A .p-row INSIDE A SPLIT COLUMN STACKS, AT EVERY WIDTH. ────────────
      AD-27.25's structural rule, and this page needs it for the same reason
      the project pages did. .p-row is minmax(0,auto) minmax(0,1fr) and the
      label is a .lbl: uppercase, letter-spacing .15em. Inside .fm-split's
      6-of-10 column, "PERMACULTURE, WHICH HERE MEANS THE FARM FEEDS ITSELF"
      measured 417px and left the prose 194px at 1920 — 24 CHARACTERS A LINE
      against AD-27.25's floor of 45, and every one of the nine rows on this
      page was under it. Written unconditionally rather than as a breakpoint:
      a split column is never wide enough for two tracks, at any viewport, and
      the breakpoint version of this rule is exactly what missed the composed
      case last time. ── */
.fm-split .p-row,.fm-split-r .p-row{grid-template-columns:minmax(0,1fr);row-gap:7px}
.fm-side{margin:0;min-width:0}
.fm-side>img{width:100%;height:auto;display:block;aspect-ratio:3/2;object-fit:cover}
@media (max-width:760px){.fm-split,.fm-split-r{grid-template-columns:minmax(0,1fr)}
  .fm-split-r .fm-side{order:-1}}

/* ── the context block: a wide frame beside the paragraph that says why five
      acres here is not five acres anywhere. ── */
.fm-ctx{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);
  gap:clamp(20px,3vw,56px);align-items:center;margin-top:var(--gap-block)}
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
      not: it can be walked and checked.
      ★ AD-28 — THERE IS NO FOURTH CELL. It read "— · Lemon, and the rest of
      the orchard": a figure rail printing an em dash where a number should be,
      which is an absence published as if it were a reading. §2.3 says show
      less rather than annotate the hole. The lemons are not lost — they are a
      fact in the produce sentence above, where they need no count. ── */
.fm-orch{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(10px,1.6vw,24px);
  border-top:1px solid var(--hair);margin-top:var(--gap-row);padding-top:clamp(14px,1.8vw,22px)}
.fm-orch-c>*{margin:0;min-width:0}
.fm-orch-n{font-size:clamp(20px,2.2vw,34px);line-height:1}
.fm-orch-w{color:var(--ink-2);margin-top:8px}
@media (max-width:620px){.fm-orch{grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}}

/* ── LIVE · LEARN · LEAD. The farm's own three words, and they are also the
      three lengths of stay, so they sit ABOVE the doors as the frame the
      doors hang in rather than beside them as a fourth thing to read. ── */
.fm-triad{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(18px,2.6vw,48px);
  border-top:1px solid var(--hair);margin-top:var(--gap-row);padding-top:var(--gap-row)}
.fm-triad-c{min-width:0}
.fm-triad-w{font-size:clamp(30px,3.6vw,56px);line-height:.95;margin:0;color:var(--mustard)}
.fm-triad-p{color:var(--fg-2);margin:14px 0 0}
@media (max-width:760px){.fm-triad{grid-template-columns:minmax(0,1fr);gap:22px}}

/* ── what a group actually does. Its own band since AD-27.31, so the run no
      longer carries the heading and rule it needed as a tail of visit. ── */
.fm-act-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));
  gap:0 clamp(20px,3vw,56px);margin-top:var(--gap-row)}
.fm-act-c{border-top:1px solid var(--hair);padding:clamp(12px,1.6vw,20px) 0;min-width:0}
.fm-act-ch{color:var(--mustard)}
.fm-act-cp{color:var(--fg-2);margin:8px 0 0}
@media (max-width:900px){.fm-act-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:620px){.fm-act-grid{grid-template-columns:minmax(0,1fr)}}

/* ── the figure rails. THE COLUMN COUNT IS DERIVED FROM THE MEMBERSHIP, not
      fixed, so the three-cell rail in origin and the five-cell rail in
      grows are one component and neither renders a hole (AD-27.23's rule,
      applied here: structure fixed, membership flexes). ── */
.fm-figs{display:grid;grid-template-columns:repeat(var(--n,5),minmax(0,1fr));
  gap:clamp(16px,2.4vw,40px);
  border-top:1px solid var(--hair);margin-top:var(--gap-row);padding-top:var(--gap-row)}
.fm-big>*{margin:0;min-width:0}
.fm-big-v{font-size:clamp(30px,3.6vw,60px);line-height:.92}
.fm-big-l{margin-top:12px}
@media (max-width:900px){.fm-figs{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:460px){.fm-figs{grid-template-columns:minmax(0,1fr)}}

/* ── the pull-quote that opens origin. The component is plainly's,
      borrowed rather than invented (AD-27.32), set one step larger because
      here it is the band's arrival and not its footnote. ── */
.fm-quote{border-left:2px solid var(--mustard);margin:var(--gap-row) 0 0;
  padding:2px 0 2px clamp(16px,2vw,24px)}
.fm-quote>p{margin:0}
.fm-quote>.cap{color:var(--ink-3);margin-top:10px}
.fm-quote-w{max-width:34ch}
.fm-quote-w>.lead{font-size:clamp(21px,2.5vw,34px);line-height:1.14}

/* ── the inventory. FOURTEEN THINGS, AND THE DENSITY IS THE ARGUMENT.
      COLUMNS RATHER THAN A GRID, and the reason is AD-27.34: three of the
      cells now carry the photograph of the thing they describe, and in a grid
      the whole row stretches to the tallest cell and leaves a hole beside
      each picture. CSS columns let the register flow, and every cell keeps
      its own hairline. break-inside:avoid is what stops a cell splitting
      across the column break. ── */
.fm-inv{columns:2;column-gap:clamp(24px,4vw,72px);margin-top:var(--gap-block)}
.fm-inv-c{break-inside:avoid;border-top:1px solid var(--hair);
  padding:clamp(14px,1.8vw,22px) 0;min-width:0}
.fm-inv-h{color:var(--mustard)}
.fm-inv-p{color:var(--fg-2);margin:8px 0 0}
.fm-inv-f{margin:14px 0 0;max-width:340px}
.fm-inv-f>img{width:100%;height:auto;display:block;aspect-ratio:16/9;object-fit:cover}
@media (max-width:760px){.fm-inv{columns:1}}

/* ── the five doors, AND EACH ONE IS NOW A CONTROL (AD-27.37). Three columns
      rather than four: the door has to hold a photograph, a heading, two
      sentences, an audience line and an Ask whose panel opens inside it, and
      at four columns that panel is a 280px measure. ── */
.fm-doors{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(20px,2.4vw,40px);
  margin-top:var(--gap-row)}
.fm-door{min-width:0}
.fm-door-f{margin:0 0 16px;min-width:0}
.fm-door-f>img{width:100%;height:100%;display:block;aspect-ratio:4/3;object-fit:cover}
.fm-door-h{font-family:var(--f-caps);font-size:clamp(15px,1.5vw,19px);font-weight:700;
  letter-spacing:.01em;margin:0;display:flex;align-items:baseline;gap:8px}
.fm-door-h svg{width:15px;height:15px;flex:0 0 auto;align-self:center}
.fm-door-p{color:var(--fg-2);margin:10px 0 0}
.paper .fm-door-p,.paper-2 .fm-door-p{color:var(--ink-2)}
.fm-door-fig{margin:14px 0 0;display:flex;align-items:baseline;gap:8px}
.fm-door-fig .num{font-size:clamp(26px,2.6vw,40px);line-height:1;color:var(--mustard)}
.fm-door-fig .lbl{color:var(--fg-2)}
.paper .fm-door-fig .lbl,.paper-2 .fm-door-fig .lbl{color:var(--ink-2)}
.fm-door-w{color:var(--fg-3);margin-top:12px;border-top:1px solid var(--hair);padding-top:10px}
.paper .fm-door-w,.paper-2 .fm-door-w{color:var(--ink-3);border-top-color:var(--rule-2)}
/* The Ask sits at the foot of the door, tight against the audience line —
   var(--gap-row) is the spacing between rows of a band, not between a control
   and the sentence it answers. */
.fm-door>.ask{margin-top:16px}
@media (max-width:1000px){.fm-doors{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:640px){.fm-doors{grid-template-columns:minmax(0,1fr)}}

/* ── the map link, and the Airbnb slot beside it that renders nothing until
      the owner supplies a URL (AD-27.36). ── */
.fm-map{margin:var(--gap-row) 0 0}

/* ── the way in, and the two onward doors. ── */
.fm-ways{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:clamp(20px,3vw,56px);
  border-top:1px solid var(--hair);margin-top:var(--gap-row);padding-top:var(--gap-row)}
.fm-way>*{margin:0;min-width:0}
.fm-way-l{color:var(--fg-3)}
.fm-way-v{font-size:clamp(22px,2.6vw,38px);line-height:1.1;margin-top:10px}
/* THE 2px THAT MAKE THIS A TOUCH TARGET. This anchor is the band's only call
   to action and on a phone it measured 23px tall — one pixel under the 24px
   floor. The height is not the line-height's doing: an INLINE box is as tall
   as the font's own em box (22px of type ≈ 23px of ascent+descent), so the
   1.1 line-height never reaches the anchor's rect. Vertical padding on an
   inline element is the one lever that grows the hit area (and the rect, and
   the focus ring) WITHOUT growing the line box — so the band's ledgered
   height is untouched: 2px top and bottom take the anchor to 27px at every
   width and move nothing else. Do NOT convert this to inline-block with a
   min-height; that one does re-measure the line box and moves the band. */
.fm-way-v a{color:var(--mustard);text-decoration:none;border-bottom:1px solid transparent;
  padding:2px 0}
.fm-way-v a:hover{border-bottom-color:currentColor}
.fm-way>.cap{color:var(--fg-3);margin-top:10px}
.fm-onward{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:clamp(14px,2vw,28px);
  border-top:1px solid var(--hair);margin-top:var(--gap-block);padding-top:var(--gap-row)}
.fm-door-a{display:block;text-decoration:none;color:inherit;border:1px solid var(--hair);
  padding:clamp(16px,2vw,24px);min-width:0}
.fm-door-a:hover{border-color:var(--fg-2)}
/* A DOOR MAY HAVE NO PHOTOGRAPH. W-18 caps this page at 12 and it sits at 12,
   so the fifth door is text — and the library has no frame of volunteering
   labour to give it anyway. Labelled rather than left as a silent gap, so the
   cell reads as a decision instead of a broken image. */
/* ONE CHANNEL, after the phone number came off (owner, 22 August). Not a
   two-column grid with an empty cell. */
.fm-ways-1{grid-template-columns:minmax(0,1fr)}
.fm-door-a .fm-door-h{color:var(--mustard)}
@media (max-width:640px){.fm-ways,.fm-onward{grid-template-columns:minmax(0,1fr)}}

/* ── EVERY COMPONENT ON THIS PAGE, STATED FOR THE OTHER GROUND. ──────────
      AD-27.31 moved four bands across the light/dark line — visit went from
      #0D0D0B to paper and doing went the other way — and a component authored
      on one ground and used on the other is this project's most reliable
      contrast defect (AD-21 §6.1 measured 1.41:1 from exactly that). Measured
      from rendered pixels before this block existed: LIVE / LEARN / LEAD at
      1.98:1 and the triad's prose at 1.51:1, because mustard and --fg-2 had
      followed the band onto paper.
      --mustard-ink (#8A6410) is the paper mustard and home.html states its
      ratio in the token itself: 4.72:1 on paper.
      Written for BOTH .paper and .paper-2 in every rule, and written for
      components that are on the dark ground TODAY as well, because the cost
      is one selector and the alternative is finding out after the next
      reorder. ── */
.paper .fm-triad-w,.paper-2 .fm-triad-w,
.paper .fm-door-fig .num,.paper-2 .fm-door-fig .num,
.paper .fm-inv-h,.paper-2 .fm-inv-h,
.paper .fm-act-ch,.paper-2 .fm-act-ch,
.paper .fm-way-l,.paper-2 .fm-way-l,
.paper .fm-way-v a,.paper-2 .fm-way-v a,
.paper .fm-door-a .fm-door-h,.paper-2 .fm-door-a .fm-door-h{color:var(--mustard-ink)}
.paper .fm-triad-p,.paper-2 .fm-triad-p,
.paper .fm-inv-p,.paper-2 .fm-inv-p,
.paper .fm-act-cp,.paper-2 .fm-act-cp,
.paper .fm-rail-l,.paper-2 .fm-rail-l{color:var(--ink-2)}
.paper .fm-way>.cap,.paper-2 .fm-way>.cap{color:var(--ink-3)}
/* and the hairlines, which are drawn for the dark ground and all but vanish
   on paper. */
.paper .fm-figs,.paper-2 .fm-figs,
.paper .fm-prod,.paper-2 .fm-prod,
.paper .fm-orch,.paper-2 .fm-orch,
.paper .fm-triad,.paper-2 .fm-triad,
.paper .fm-rail,.paper-2 .fm-rail,
.paper .fm-act-c,.paper-2 .fm-act-c,
.paper .fm-inv-c,.paper-2 .fm-inv-c,
.paper .fm-ways,.paper-2 .fm-ways,
.paper .fm-onward,.paper-2 .fm-onward{border-top-color:var(--rule-2)}
.paper .fm-door-a,.paper-2 .fm-door-a{border-color:var(--rule-2)}
.paper .fm-door-a:hover,.paper-2 .fm-door-a:hover{border-color:var(--ink-2)}
`;

/* ═══ WRITE ══════════════════════════════════════════════════════════════ */
const TITLE = 'Swechha Farm — school camps and stays near Delhi';
const DESC = 'Five acres in the Aravallis, ninety minutes from Delhi. Day visits, '
  + 'overnight school camps for a hundred students, retreats and stays. One tree became 5,000.';

const OUT = await S.assemble({
  file: 'farm.html',
  /* AD-27.47: the farm page is the SECONDARY owner of "School Adventure Camp",
     and it carries the phrase in the words the programmes are actually run in
     — "school camps" — rather than the query's own words, which appear in no
     source. AD-27.48: the em dash is the literal character, not &mdash;. */
  title: TITLE,
  desc: DESC,
  bands: BANDS, index: INDEX, sh, clashes,
  pageCss: PAGE_CSS,
  /* `Farm` is a nav word and this page IS it, so it takes aria-current="page".
     The shell cannot derive that — its family is the six situations — so it is
     passed, exactly as /impact passes its own. */
  navMark: { current: 'Farm', url: '/farm' },
  sectionFor: (id) => (B[id] || (() => '    <div class="wrap"><p class="lead">&mdash;</p></div>'))(),
  note: `${BANDS.length} bands + footer. ${OWN.length} own figures + ${RESOLVED.length} resolved `
      + `from the Farm School, ${F.systems.items.length} systems, ${F.visit.doors.length} doors, `
      + `${F.doing.items.length} activities, ${FRAMES.length} frames.`,
});

/* ═══ POST-WRITE GATES ═══════════════════════════════════════════════════ */
let fail = 0;
const gate = (ok, msg) => { if (!ok) { console.error(`  FAIL ${msg}`); fail++; } else console.log(`  ok   ${msg}`); };
console.log('\nGATES');

/* Rendered text only. Tested on the raw HTML, a gate for a word trips on class
   names and attribute values and gets switched off by the next person. */
/* ── THE BODY, WITHOUT THE FOOTER, AND THE BOUNDARY ASSERTS ITSELF ───────
   The footer is lifted verbatim out of home.html at build time and belongs to
   lane 1; it publishes the organisation's general address, which is a gmail
   one. A gate on "every mailto is @swechha.in" that runs over the whole
   document therefore fails on somebody else's correct content. So the ask
   gates run on the page body only — and the slice ASSERTS IT FOUND THE
   BOUNDARY, because AD-27.55 records the exact defect of an indexOf boundary
   that silently returns -1 and takes the whole document instead. */
const FOOT_AT = OUT.indexOf('<footer class="foot"');
if (FOOT_AT < 0) {
  console.error('REFUSING TO GATE: the footer boundary was not found in the built page. '
    + 'The ask gates below would silently run over the whole document, footer included.');
  process.exit(1);
}
const BODY = OUT.slice(0, FOOT_AT);

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
      word "five" fails, including "5".
      A QUANTITY before the unit, not any word before it. The first version
      matched `[\w-]+ acres` and tripped on "barren acres", which is an
      adjective and not a claim about size — a gate that cries wolf is a gate
      somebody deletes. This one flags only a number or a number-word. */
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
      it stays.
      ⚠️ AD-27.35 CUT THIS BAND FROM SEVEN ROWS TO FIVE AND THE SHOP CLAUSE
      SURVIVED DELIBERATELY, folded into the groundwater row. If a later edit
      drops it, RETIRE THIS GATE IN THE SAME COMMIT — a gate that fails on
      correct content is a gate somebody deletes in frustration, which is worse
      than no gate. */
const km = [...RENDERED.matchAll(/\d[\d,.]*\s*(km|kms|kilometres?|kilometers?)\b/gi)].map(m => m[0]);
gate(km.length === 0, `no numeric distance in kilometres${km.length ? `; FOUND: ${km.join(', ')}` : ''}`);
const kmWords = [...RENDERED.matchAll(/[^.]*\bkilometres?\b[^.]*/gi)].map(m => m[0].trim());
gate(kmWords.length === 1 && /nearest shop/i.test(kmWords[0]),
  `the only kilometre on the page is the nearest shop${kmWords.length !== 1 ? `; FOUND ${kmWords.length}: ${kmWords.join(' // ')}` : ''}`);

/* 2b. THE OWNER'S RETRACTION, 23 AUGUST 2026. He read the built page and said
   of `built` row 1 — "Water first, before anything was planted", with its
   swales, bundhs and ponds — "The following is not true in teh farm page,
   delete it from the root". A retraction is only as good as the thing that
   stops it being typed back in by a session that finds the claim still sitting
   in SOURCE-FACTS §72, so this gate is the retraction. Tested on the rendered
   text, not the data, because the claim could return through either.
   UPDATE, same day: asked directly about the instance on
   /work/projects/farm-school that was left standing and flagged rather than
   deleted on inference, he ruled "delete the water swales and bundhs part".
   THE CLAIM IS NOW RETRACTED SITE-WIDE. This gate still only guards /farm —
   the Farm School page is built by build-work-pages.mjs and carries its own —
   but SOURCE-FACTS §72 now records the site-wide ruling, so a session reading
   the ledger finds the retraction rather than the claim. */
const retracted = ['Water first', 'swale', 'bundh'].filter(w => new RegExp(w, 'i').test(RENDERED));
gate(retracted.length === 0,
  `the retracted water-first claim stays off the page${retracted.length ? `; FOUND: ${retracted.join(', ')} — the owner deleted this on 23 August, do not restore it` : ''}`);

/* 3. THE HOMEPAGE'S RULED FACTS SURVIVE INTO THE PAGE ITS BUTTON OPENS. */
gate(/\bFive acres\b/.test(RENDERED), 'the lead carries "Five acres"');
gate(/ninety minutes|hour and a half/i.test(RENDERED), 'the lead carries the ninety minutes');
gate(/\bLadpuri\b/.test(RENDERED), 'the farm is placed at Ladpuri (F-5)');
gate(/\bFood Forest\b/.test(OUT), "the client's proper noun is capitalised");
gate(/Nothing grew/i.test(RENDERED), "the homepage band's hook opens the page it points at");

/* 3a. MEWAT IS A REGION, AND THE DISTRICT IS NAMED (AD-27.30).
      THREE GATES, AND THE MIDDLE ONE IS THE CLIENT'S ACTUAL COMPLAINT: the
      masthead said "the Mewat country" — the archaic sense, hill country,
      sheep country — and he read it as a nation. The word is forbidden by
      name so nobody restores it from an older draft.
      "Kaithal" IS FORBIDDEN AND "Khairthal-Tijara" IS REQUIRED, both ways
      round, because this is the one fact on the page carried on a reading of
      the client's transcription rather than a corroborated source. Kaithal is
      a district of HARYANA about 200km north of these coordinates and cannot
      contain a Rajasthan village; Khairthal-Tijara is the Rajasthan district
      formed out of Alwar, which matches his own "erstwhile Alwar" exactly. A
      future session will want to "correct" one to the other; the build stops
      it in both directions. If the owner says otherwise it is one string in
      data/farm.json and the page re-derives. */
gate(/\bMewat\b/.test(RENDERED), 'Mewat is named — the region, not only the village');
gate(!/Mewat country/i.test(RENDERED), 'the page does NOT say "Mewat country" — Mewat is a region (AD-27.30)');
gate(/\bKhairthal-Tijara\b/.test(RENDERED), 'the district is named: Khairthal-Tijara');
gate(!/\bKaithal\b/.test(RENDERED), 'the Haryana district "Kaithal" is absent — it is Khairthal-Tijara');
gate(/\berstwhile Alwar\b/i.test(RENDERED), "the client's own qualifier survives: erstwhile Alwar");
gate(/built with the people who live around it|community/i.test(RENDERED),
  'the farm is credited to the community that built it');

/* 3b. THE FACTS THE CLIENT GAVE ON 22 AUGUST, AND THE ONE THEY SUPERSEDE.
      THE TREE COUNT IS THE PAGE'S SPINE: the land had ONE tree, not none, and
      the number that matters is the distance between one and five thousand.
      The owner's live Airbnb listing still says "NOT A SINGLE TREE a year
      ago" — it is his own published text, it is the more dramatic line, and
      it is WRONG. A future session reading that listing in good faith will
      want to put it back, so the gate refuses it by name. */
gate(/\bOne tree\b/.test(RENDERED), 'the land had ONE tree, and the page says so');
gate(!/not a single tree/i.test(RENDERED),
  'the superseded "not a single tree" wording is absent (owner, 22 August: it was one tree)');
gate(/\b5,000\+/.test(RENDERED), 'the five thousand it became is on the page');
for (const w of ['Live', 'Learn', 'Lead']) {
  gate(new RegExp(`fm-triad-w">${w}<`).test(OUT), `the triad carries ${w}`);
}
/* 3d. THE PARTICIPATION FIGURE (F-18). The last thing this page could not say.
      It is RESOLVED from the work register, not typed here, so /farm, the Farm
      School page and /impact cannot disagree about it. */
gate(/\b30\b/.test(RENDERED) && /School groups a year/i.test(RENDERED),
  'the participation figure is published and resolved: 30 school groups a year');
gate(!/class="p-hole"/.test(OUT) && !/id="waiting"/.test(OUT),
  'no named hole and no waiting band — nothing on this page is unsourced');

/* ★ AD-28 — THE FILTER HERE IS NOW A GATE, WHICH IS THE INVERSION.
   This loop used to read `.filter(x => x.n !== '—')`, quietly excusing the one
   orchard cell that published an em dash where a number belongs. A rail cell
   with a dash in it is an absence dressed as a reading (§2.3: show less, do
   not annotate the hole), so the cell is gone and the excuse is a check. */
gate(!F.grows.produce.counts.some(c => /^[—–-]$/.test(String(c.n).trim())),
  'no orchard cell publishes a dash in place of a number');
for (const c of F.grows.produce.counts) {
  gate(RENDERED.includes(`${c.n}`) && RENDERED.includes(c.what), `orchard count rendered: ${c.n} ${c.what}`);
}
/* The activities the client named on 22 August, each checked by name. A list
   is the easiest thing on a page to quietly lose in a later edit — and this
   pass rewrote every one of them to one sentence, which is exactly when it
   would have happened. */
for (const a of ['Bird watching', 'tractor ride', 'crickets', 'Star gazing', 'cows', 'Shramdaan']) {
  gate(new RegExp(a, 'i').test(RENDERED), `activity present: ${a}`);
}

/* 3c. NO BAND HEAD CONTAINS A WORD TOO LONG FOR ITS COLUMN.
      `.im-head` is a 12-column grid and the head takes about half of it; at
      the display size that column is ~564px at 1280. "TRANSFORMATION" set in
      `.d1` measures 710px and CANNOT WRAP — a single long word does not
      respect `minmax(0,1fr)`, so it silently painted across the lead beside
      it. Caught by eye only because the band was screenshotted.
      TWELVE CHARACTERS is the measured ceiling, not a guess. */
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

/* 6. THE DELETED BANDS STAY DELETED (AD-27.33, AD-27.34, AD-27.38).
      Both were removed on the client's explicit instruction and both are the
      kind of thing a later session restores from an old draft "because the
      photographs are good". The photographs survive; the bands do not. */
for (const dead of ['keeps', 'sheet', 'waiting']) {
  gate(!new RegExp(`id="${dead}"`).test(OUT), `the deleted band "${dead}" has not come back`);
}
gate(!/How the place/i.test(RENDERED), '"How the place keeps itself" is gone (AD-27.33)');
/* The one fact that band held alone. */
gate(/\bSolar\b/.test(RENDERED) && /inverter/i.test(RENDERED),
  "solar survived the deletion as an inventory line, with its companion fact");
/* And the three frames the contact sheet held are still on the page, now
   beside the cells they depict (AD-27.34). */
for (const src of ['farm-cows-sunrise.jpg', 'bee-on-mustard-flower.jpg', 'nursery-plants.jpg']) {
  gate(OUT.includes(src), `the contact sheet's frame survives, integrated: ${src}`);
}

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
      say `{{lessthan}}` and let the build compute it; a typed "four years" is
      wrong from the next January and nothing would catch it.
      CONTENT FIELDS ONLY. `_` keys are this repo's in-file documentation and
      the note on `acquired` necessarily QUOTES the client's "4 years ago" —
      scanning raw text made the gate fail on its own explanation, which is the
      fastest way to get a gate switched off. */
const typedYears = [];
const scanTyped = (o, path = '') => {
  if (Array.isArray(o)) return o.forEach((v, i) => scanTyped(v, `${path}[${i}]`));
  if (o && typeof o === 'object') {
    for (const [k, v] of Object.entries(o)) if (!k.startsWith('_')) scanTyped(v, `${path}.${k}`);
    return;
  }
  if (typeof o !== 'string') return;
  for (const m of o.matchAll(/\b(one|two|three|four|five|six|seven|eight|nine|ten|\d+)[ -]years?\b/gi)) {
    typedYears.push(`${path}: "${m[0]}"`);
  }
};
scanTyped(F);
gate(typedYears.length === 0,
  `no elapsed-year count typed in the data — use {{lessthan}}${typedYears.length ? `; TYPED: ${typedYears.join(', ')}` : ''}`);
gate(new RegExp(`less than ${LESSTHAN} years`).test(RENDERED),
  `the derived CEILING reached the page: "less than ${LESSTHAN} years" (elapsed ${YEARS})`);
/* The bound must never be stated as an exact elapsed count — that is the
   thing F-16 replaced, and it is the thing that can go wrong silently. */
gate(!new RegExp(`(?<!less than )\\b${YEARWORD} years\\b`).test(RENDERED),
  `the span is stated only as a bound, never as "${YEARWORD} years"`);
/* AND THE INVENTORY'S HEADING COUNTS THE INVENTORY (AD-27.31, corrected).
   The ruling said "Thirteen things running" from the count before solar moved
   in. Derived, so it cannot be wrong twice. */
gate(new RegExp(`${SYSTEMWORD} things`).test(RENDERED)
  && (OUT.match(/class="fm-inv-c"/g) || []).length === F.systems.items.length,
  `the inventory heading counts the inventory: "${SYSTEMWORD} things" over ${F.systems.items.length} cells`);

/* 6d. WHERE A HUNDRED STUDENTS SLEEP (F-17). The page carried a deliberate
      silence here for exactly one pass: capacity was published before the
      arrangement was known, and inventing a dormitory was the one thing that
      could not be done. Tents on the farm's own camping site is the answer,
      and it explains why Google lists this place as a CAMPGROUND. */
for (const w of ['tents', 'camping site']) {
  gate(new RegExp(w, 'i').test(RENDERED), `the sleeping arrangement is stated: ${w}`);
}

/* 7. PHOTOGRAPHS, INSIDE W-18's BAND.
      ⚠️ AD-27.34: the page is AT the ceiling. Deleting `sheet` as a band while
      keeping its three frames holds the count at 12. If `built` or `origin`
      ever wants another frame, one of the door photographs is the one to give
      up. DO NOT RAISE THE GATE. */
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

/* 14. THE GROUND CLASS AND THE GROUND HEX AGREE (AD-27.31; /act's gate 0).
       `t1`/`t2`/`t3` are PADDING and paint nothing. AD-24's `grows` declared
       #151512 in the chain and carried no `dark-2`, so it actually rendered
       #0D0D0B and the adjacency check was checking a colour the page never
       painted. The chain is only worth running if the hexes are real. */
const PAINTS = { paper: '#F3F2F0', 'paper-2': '#ECEBE8', 'dark-2': '#151512' };
for (const [id, cls, hex] of BANDS) {
  const painters = cls.split(/\s+/).filter(n => PAINTS[n]);
  const painted = painters.length ? PAINTS[painters[0]] : '#0D0D0B';
  gate(painters.length <= 1 && painted === hex,
    `${id}: class "${cls}" paints ${painted}, and the chain says ${hex}`);
}

/* 15. HEADING HIERARCHY AND IDS (AD-27.51). Exactly one h1; no level skipped
       in document order; no duplicate id anywhere in the document. */
const levels = [...OUT.matchAll(/<h([1-6])\b/g)].map(m => Number(m[1]));
gate(levels.filter(l => l === 1).length === 1, `exactly one <h1> (found ${levels.filter(l => l === 1).length})`);
const skips = [];
for (let i = 1; i < levels.length; i++) if (levels[i] > levels[i - 1] + 1) skips.push(`h${levels[i - 1]}→h${levels[i]}`);
gate(skips.length === 0, `no heading level is skipped${skips.length ? `; SKIPPED: ${skips.join(', ')}` : ''}`);
const ids = [...OUT.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
const dupIds = [...new Set(ids.filter((v, i) => ids.indexOf(v) !== i))];
gate(dupIds.length === 0, `no duplicate id${dupIds.length ? `; DUPLICATE: ${dupIds.join(', ')}` : ''}`);

/* 16. THE ASK, GATED (AD-27.22). Four assertions, adapted to this page by
       AD-27.37: the cap here is TWO AUDIENCES, not two elements, because five
       doors of the same audience is one ask repeated and each door is a
       different offer. */
const askEls = [...OUT.matchAll(/<details class="ask" data-ask="([^"]*)"/g)].map(m => m[1]);
/* Read out of the shell's own register rather than a local list, so this gate
   checks the component that actually rendered. */
const realAud = (a) => Object.prototype.hasOwnProperty.call(S.ASK_AUDIENCES, a);
gate(askEls.length > 0 && askEls.every(realAud),
  `${askEls.length} Ask(s), every one naming a real audience${askEls.some(a => !realAud(a)) ? `; BAD: ${askEls.filter(a => !realAud(a)).join(', ')}` : ''}`);
const audiences = [...new Set(askEls)];
gate(audiences.length <= 2, `at most two audiences ask on this page: ${audiences.join(', ')}`);
/* Every mailto resolves to @swechha.in — the same check /act's gate 10 makes,
   and the rule that stops a personal or a gmail address being published by
   accident. `swechhaindia@gmail.com` was on this page until today. */
const mailtos = [...BODY.matchAll(/href="mailto:([^"?]+)/g)].map(m => m[1]);
const badMail = [...new Set(mailtos.filter(m => !m.endsWith('@swechha.in')))];
gate(mailtos.length > 0 && badMail.length === 0,
  `${mailtos.length} mailto(s), all @swechha.in${badMail.length ? `; BAD: ${badMail.join(', ')}` : ''}`);
gate(!/swechhaindia@gmail\.com/.test(BODY), "the page's own gmail address is gone (AD-27.37, email_policy)");
/* The subject line is the routing, so a mismatched pair means the inbox sorts
   wrong, silently, forever. */
for (const a of audiences) {
  const word = S.ASK_AUDIENCES[a].subject;
  gate(OUT.includes(`subject=${encodeURIComponent(`${word} — ${ASK_PAGE}`)}`),
    `the ${a} Ask's subject line starts with "${word}" and names this page`);
}
/* An unexpanded token in a mailto looks like a working button — /act's gate 15
   exists for exactly this. */
gate(!/mailto:[^"]*(SUBJECT|BODY|\{\{)/.test(OUT), 'no unexpanded SUBJECT / BODY / {{token}} in a mailto');
gate(!/\{\{[a-z]+\}\}/i.test(OUT), 'no unexpanded {{token}} anywhere in the page');
const longHref = [...OUT.matchAll(/href="(mailto:[^"]+)"/g)].map(m => m[1]).filter(h => h.length > 900);
gate(longHref.length === 0, `every mailto href is under 900 characters${longHref.length ? `; ${longHref.length} over` : ''}`);
/* One primary per band, and every door is a control (AD-27.37). */
gate((OUT.match(/class="b b-1 ask-s"/g) || []).length === 2,
  'exactly two primary Asks — one in `visit` (the camps door), one in `act`');
gate(V.doors.every(d => d.ask), `all ${V.doors.length} doors carry an Ask — the band had zero links before AD-27.37`);

/* 20. NO DOUBLE-ESCAPED ENTITY REACHES THE READER. The two resolved figures
       shipped "Farm School &middot; SOURCE-FACTS §70" as literal text, because
       a caller built provenance with an entity in it and the component escaped
       the whole string. Nothing caught it: it is not a contrast defect, not an
       overflow, not a broken link, and a diff of the data file shows nothing.
       It was found by reading the PNG, which is why BRANDING §10 requires it. */
const escapedEntities = [...new Set([...OUT.matchAll(/&amp;(?:[a-z]+|#\d+);/gi)].map(m => m[0]))];
gate(escapedEntities.length === 0,
  `no double-escaped entity reaches the page${escapedEntities.length ? `; FOUND: ${escapedEntities.join(', ')}` : ''}`);

/* 17. THE MAP LINK SHIPS AND THE AIRBNB LINK DOES NOT (AD-27.36).
       The coordinates are in the ledger, from the farm's own Google listing,
       and the query API is documented — so the link is CONSTRUCTED, not
       guessed. The two Airbnb listings exist in the record as numeric ids
       only; there is no URL for either anywhere in this repository, and
       synthesising one from an id is the fabricated-citation failure this
       repo has already had once. The slot is wired and gated so that the
       moment the owner pastes the real URLs they render, and nothing else
       can. */
gate(/href="https:\/\/www\.google\.com\/maps\/search\/\?api=1&amp;query=28\.1269309,76\.927649"/.test(OUT),
  'the map link ships, on the coordinates in the ledger');
gate(/\(opens in a new tab\)/.test(OUT) && /rel="noopener" target="_blank"/.test(OUT),
  'the external link carries rel=noopener and says it opens in a new tab');
const OK_HOSTS = /^https:\/\/(www\.google\.com\/maps|maps\.app\.goo\.gl|([a-z0-9.-]+\.)?airbnb\.)/;
const placeUrls = [F.place.map_url, ...(F.stay.airbnb || []).map(s => s.url)].filter(Boolean);
const badUrl = placeUrls.filter(u => !OK_HOSTS.test(u));
gate(badUrl.length === 0, `every place URL is a map or an Airbnb URL${badUrl.length ? `; BAD: ${badUrl.join(', ')}` : ''}`);
gate((F.stay.airbnb || []).length === 0 ? !/airbnb/i.test(RENDERED) && !/href="[^"]*airbnb/i.test(OUT) : true,
  'no Airbnb URL is synthesised from a listing id — the slot is empty and the page says nothing');

/* 18. THE PAGE SAYS WHAT IT IS ABOUT (AD-27.47, AD-27.48). 140–158
       characters, the subject in the reader's words plus one verifiable fact,
       nothing tensed and no reading. `desc` is passed to assemble(); until
       lane 1's parameter lands it is ignored there, which is why the length
       is asserted here rather than only in the shell. */
gate(DESC.length >= 140 && DESC.length <= 158, `the description is ${DESC.length} characters (140–158)`);
gate(/school camps/i.test(TITLE) && TITLE.includes('—') && !TITLE.includes('&mdash;'),
  'the title carries "school camps" and a literal em dash (AD-27.47/48)');
gate(!/\b(today|currently|DEMO DATA)\b/i.test(DESC), 'the description is not tensed and carries no specimen');

/* 21. NO SOURCING APPARATUS ON THIS PAGE — AD-28 §2.2, AND THIS IS THE OLD
       PROVENANCE CONTRACT INVERTED. `bigFig` used to REQUIRE a provenance line
       under every numeral, and gate 20 existed to prove those lines rendered
       as entities rather than literals. The owner struck the style by example
       ("Never like this: SOURCE-FACTS §200, owner 21 August 2026"), so the
       requirement is now a prohibition: /farm is Swechha telling the world what
       it does, and a figure here stands on its own or is not published.
       The `period` and `source` keys are still in data/farm.json — they are the
       internal record and should stay — so this gate is what stops a later
       session wiring them back into the template "for transparency".
       Rendered text only: `source` appears in the data and in this file's own
       comments, and a gate that trips on its own explanation gets switched off. */
const APPARATUS = [
  [/SOURCE-FACTS/i, 'SOURCE-FACTS'],
  [/§/, 'a § citation'],
  [/\b(?:owner|given by|stated by|told (?:us|to us))\b/i, 'a who-told-us attribution'],
  [/\bcounted (?:in )?(?:January|February|March|April|May|June|July|August|September|October|November|December)\b/i, 'a "counted <month>" line'],
  [/\bno start year sourced\b|\bperiod not sourced\b|\bnot sourced\b/i, 'a "not sourced" confession'],
  [/\bderived from the year\b/i, 'a "derived from" line'],
  [/\bfrozen homepage band\b/i, 'a reference to this repository'],
  [/\b(?:AD|D|W|F|R)-\d/, 'an internal ledger reference'],
  [/No photograph of this yet/i, 'an empty-state apology'],
].filter(([re]) => re.test(RENDERED));
gate(APPARATUS.length === 0,
  `no sourcing apparatus reaches the page${APPARATUS.length ? `; FOUND: ${APPARATUS.map(a => a[1]).join(', ')}` : ''}`);

/* 19. THE WORD BUDGET (AD-27.31). Measured on the DATA's content fields, not
       on the rendered page, so the Ask's fixed component copy and the chrome
       do not count against a band's prose — the client's complaint was the
       prose. Budgets are AD-27.31's, with 15% of headroom before the build
       stops, because a budget enforced to the word is a budget that gets
       deleted the first time a good sentence needs six more.
       THE TOTAL IS THE NUMBER THAT MATTERS: 1,690, down from 2,424. */
const BUDGET = { top: 80, origin: 200, built: 240, grows: 200, systems: 250, visit: 380, doing: 220, plainly: 120, act: 100 };
const SKIP_KEYS = new Set(['src', 'alt', 'op', 'href', 'source', 'slug', 'basis', 'audience',
  'primary', 'map_url', 'url', 'kicker', 'value', 'num', 'n', 'year']);
const wordsOf = (o) => {
  if (o == null) return 0;
  if (Array.isArray(o)) return o.reduce((t, v) => t + wordsOf(v), 0);
  if (typeof o === 'object') {
    return Object.entries(o).reduce((t, [k, v]) =>
      t + (k.startsWith('_') || SKIP_KEYS.has(k) ? 0 : wordsOf(v)), 0);
  }
  if (typeof o !== 'string') return 0;
  return o.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
};
let total = 0;
console.log('\nWORDS PER BAND (data content fields; budget from AD-27.31)');
for (const [id] of BANDS) {
  const w = wordsOf(F[id]) + (id === 'plainly' ? wordsOf(F.place) : 0);
  total += w;
  const b = BUDGET[id];
  console.log(`  ${id.padEnd(9)} ${String(w).padStart(4)} / ${String(b).padStart(4)}  ${w <= b ? 'ok' : w <= b * 1.15 ? 'over, inside 15%' : '*** OVER ***'}`);
  gate(w <= b * 1.15, `${id} is ${w} words against a budget of ${b}`);
}
console.log(`  ${'TOTAL'.padEnd(9)} ${String(total).padStart(4)} / 1690   (AD-24 shipped 2,424)`);
gate(total <= 1690, `the page is ${total} words of prose, against AD-27.31's budget of 1,690 (was 2,424)`);

if (fail > 0) {
  console.error(`\n${fail} gate(s) failed. The file is written — fix the generator and rebuild.`);
  process.exit(1);
}
console.log(`\n${OUT.length.toLocaleString('en-IN')} bytes. All gates pass.`);
