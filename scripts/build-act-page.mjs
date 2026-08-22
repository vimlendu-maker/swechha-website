// AD-25 — act.html, the Get involved page. SIX BANDS.
//
// ★ THIS IS THE PAGE EIGHTEEN OTHER PAGES ALREADY POINT AT.
//
// The frozen homepage's band 12 is called "Three ways in". Its three buttons —
// "Give monthly", "See the dates", "Work with us" — have pointed at href="#"
// since 19 August. The Give chip in the nav of every page on this site says
// `/act`. Eighteen WORK items and all four kind landings end in a named ask
// whose href is `/act`. And `/act` served a sixty-line Tailwind placeholder
// whose own copy admitted the sign-up "isn't connected yet".
//
// That is the AD-24 lesson for the third time, and AD-22's for the fourth: a
// nav word, a built file and a route are ONE change, not three, and any two of
// them without the third is a defect. This build is the file; `design-routes.ts`
// is the route; the homepage's three dead buttons are the third part.
//
// ★ THE SPINE IS THE HOMEPAGE'S OWN THREE, IN THE HOMEPAGE'S OWN ORDER.
// Give, then Volunteer, then Partner. Gate 6 reads those three headings out of
// home.html and fails if this page reorders or renames them, because the door
// and the room may not disagree — the same rule that made /farm open on
// "Nothing grew here".
//
// ★ THE ASK LIST IS NOT TYPED. IT IS DERIVED, AND THE DERIVATION IS TOTAL.
// A reader who clicked "Bring your school" on NatureScapes must find "Bring
// your school" on this page, or the click lied. So the eighteen asks are read
// out of `data/work/*/*.json` and `kinds.json`, grouped into the three ways by
// the WAYS table below, and every one of them links BACK to the page it came
// from. Gate 1 fails the build on a label no way claims — so a nineteenth ask
// cannot be added to the WORK section and left unanswered here. This is the
// /impact figure architecture and /farm's two resolved figures, applied to
// inbound asks instead of numbers.
//
// ★ THREE OWNER RULINGS, 22 AUGUST, AND THEY ARE WHY THIS PAGE IS HONEST.
// G-1 — GIVE ROUTES TO A HUMAN. There is no payment destination anywhere in
//   this repository: no gateway, no UPI ID, no bank details, no donation URL.
//   None is invented. The band states the ask, names the hole, and ends in an
//   email. A form that pretends to take a card would be the exact defect the
//   whole page exists to fix.
// G-2 — VOLUNTEER ASKS TO BE TOLD. All four event formats carry named holes
//   saying we cannot say when the last one ran, so this page will not say when
//   the next one is. No calendar, no fake dates.
// G-3 — THE ₹500 IS CARRIED AND FLAGGED. It is the frozen homepage's figure
//   and it has no entry in SOURCE-FACTS, unlike every figure on /impact and
//   /farm. It is used because the freeze makes the homepage authoritative, and
//   gate 5 asserts it still matches home.html so the two cannot drift. The
//   ledger records it as design copy awaiting confirmation; the page does not
//   editorialise about its own ask.
//
// ★ GOOGLE FORMS ARE WIRED BUT EMPTY, ON PURPOSE (owner asked, 22 August).
// A form receives a submission, so it beats a mailto: for Volunteer and
// Partner — and it cannot help Give, because a form does not take money.
// `data/act.json`'s `channels` holds one slot per way. Gate 9 rejects anything
// that is not a real docs.google.com/forms URL, because a guessed form URL is a
// 404 behind a live-looking button, which is this page's own founding defect.
//
// ★ ONLY @swechha.in EMAIL MAY BE PUBLISHED, plus the addresses named in
// `data/about-people.json`'s published_email_exceptions. That file holds the
// rule and the reason; gate 10 reads it rather than restating the domain.
// The /farm-vs-everywhere-else split this note used to flag is RESOLVED: on
// 22 August 2026 the owner replaced info@swechha.in with swechhaindia@gmail.com
// site-wide, so /farm's address is now the site's address.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import * as S from './lib/situation-shell.mjs';
const { esc, opener, hole, ARROW } = S;

const sh = S.shell();

/* ═══ DATA ═══════════════════════════════════════════════════════════════ */
const A = JSON.parse(readFileSync(join(S.ROOT, 'data/act.json'), 'utf8'));
const ONWARD = JSON.parse(readFileSync(join(S.ROOT, 'data/work/onward.json'), 'utf8'));
const KINDS = JSON.parse(readFileSync(join(S.ROOT, 'data/work/kinds.json'), 'utf8'));
const ROUTES = new Set(ONWARD.routes);
const ANCHORS = ONWARD.anchors || {};

const die = (msg) => { console.error(`REFUSING TO BUILD: ${msg}`); process.exit(1); };

/* Every WORK item, keyed by slug. Read off the directory rather than from a
   list, so an item added over there is visible here without an edit. */
const ITEMS = [];
for (const kind of ['projects', 'campaigns', 'journeys', 'events']) {
  const dir = join(S.ROOT, 'data/work', kind);
  for (const f of readdirSync(dir).filter(n => n.endsWith('.json'))) {
    const it = JSON.parse(readFileSync(join(dir, f), 'utf8'));
    it.__file = `data/work/${kind}/${f}`;
    ITEMS.push(it);
  }
}
const BY_SLUG = new Map(ITEMS.map(i => [i.slug, i]));

/* An item's own URL, by exactly the rule the WORK generator uses
   (`dest()` in build-work-pages.mjs:901): its own page if it has one,
   otherwise its anchor on the kind landing. Restating that rule is a risk, so
   gate 2 checks every result against the route map rather than trusting it. */
const destOf = (it) => it.page
  ? `/work/${it.kind}/${it.slug}`
  : `${ANCHORS[it.anchor] ?? `/work/${it.kind}`}#${it.anchor}`;

/* ═══ THE ASKS, DERIVED ══════════════════════════════════════════════════
   Everything in the WORK section that ends in an ask pointing here. Items and
   kind landings both, because both carry an `act` and both send a reader to
   this page — the kind landings were the ones most likely to be forgotten. */
const ASKS = [];
for (const it of ITEMS) {
  if (it.act?.href === '/act') {
    ASKS.push({ label: it.act.label, from: it.name, href: destOf(it), kind: it.kind, file: it.__file });
  }
}
for (const k of KINDS) {
  if (k.act?.href === '/act') {
    ASKS.push({ label: k.act.label, from: `${k.name} — the whole kind`, href: `/work/${k.slug}`, kind: k.slug, file: 'data/work/kinds.json' });
  }
}
if (ASKS.length < 15) die(`only ${ASKS.length} asks point at /act. The WORK data has changed shape — check act.href, not this number.`);

/* ── THE WAYS TABLE. The one place a label is assigned to a way, and the only
      typed thing about the ask list. Gate 1 makes it total: a label that is
      not here stops the build, so the WORK section cannot grow an ask that
      this page silently drops on the floor. ─────────────────────────────── */
const WAYS = {
  give: ['Support this work'],
  hands: ['Plant with us', 'Plant one with us', 'Volunteer with us', 'Walk it with us',
    'Walk the river with us', 'Book a walk', 'Book a journey', 'Apply for a fellowship'],
  partner: ['Work with us on it', 'Bring your school'],
};
const WAY_OF = new Map();
for (const [way, labels] of Object.entries(WAYS)) {
  for (const l of labels) {
    if (WAY_OF.has(l)) die(`"${l}" is claimed by two ways (${WAY_OF.get(l)} and ${way}). A label belongs to one.`);
    WAY_OF.set(l, way);
  }
}

/* GATE 1 — TOTALITY. */
const orphans = [...new Set(ASKS.filter(a => !WAY_OF.has(a.label)).map(a => a.label))];
if (orphans.length) {
  die(`${orphans.length} ask(s) in the WORK section have no way on this page: ${orphans.map(l => `"${l}"`).join(', ')}.\n`
    + '  Somebody added an ask that points at /act and this page does not answer it.\n'
    + '  Put each label in the WAYS table above under the way that actually receives it.');
}
/* GATE 2 — EVERY BACK-LINK RESOLVES. A page whose asks point at 404s is worse
   than the placeholder it replaced. */
for (const a of ASKS) {
  const path = a.href.split('#')[0];
  if (!ROUTES.has(path)) die(`the ask "${a.label}" (${a.file}) links back to ${a.href}, which is not in onward.json's route map.`);
}
/* GATE 3 — NO EMPTY WAY. A way with no ask means the table has drifted from
   the data and a band would render a heading over nothing. */
const asksFor = (way) => ASKS.filter(a => WAY_OF.get(a.label) === way)
  .sort((x, y) => x.label.localeCompare(y.label) || x.from.localeCompare(y.from));
for (const way of Object.keys(WAYS)) {
  if (!asksFor(way).length) die(`no ask lands on "${way}", but the WAYS table claims ${WAYS[way].length} label(s) for it.`);
}

/* ═══ FIGURES RESOLVED OUT OF THE WORK SECTION ═══════════════════════════
   Not copied. Read by label out of the item that owns them, so this page
   cannot come to disagree with the page a reader arrives from — the defect
   class that had the situation index printing 412 while Air said 387. */
const figure = (slug, label) => {
  const it = BY_SLUG.get(slug);
  if (!it) die(`no WORK item "${slug}" — a figure on this page is resolved out of it.`);
  const hit = (it.figures || []).find(f => f.label === label);
  if (!hit) {
    die(`${it.__file} has no figure labelled "${label}".\n`
      + `  Labels there: ${(it.figures || []).map(f => `"${f.label}"`).join(', ') || 'none'}.\n`
      + '  This page reads that figure rather than repeating it. Follow the rename or stop.');
  }
  return { ...hit, from: it.name, href: destOf(it) };
};

const VOLUNTEERS = figure('influence', 'Volunteers, annually');
const FELLOWSHIPS = figure('influence', 'Fellowships');
const COLLEGES = figure('influence', 'Colleges');
const SCHOOLS = figure('bridge-the-gap', A.partner.doors[0].resolve.label);
const PARTNERS = figure('influence', A.partner.doors[2].resolve.label);
const TREES = figure('monsoon-wooding', 'Trees planted in Delhi NCR');

/* The five companies, out of the campaign that names them. `with.funders` is
   the WORK schema's own field for this and it is the only sourced list of
   corporate supporters on the site. */
const WOODING = BY_SLUG.get('monsoon-wooding');
const FUNDERS = WOODING?.with?.funders || [];
if (FUNDERS.length < 3) die('monsoon-wooding.json\'s with.funders is empty or short — the Companies door is built out of it.');

/* The two funded things that HAVE a page, resolved so the promise and the
   destination are the same object. The third has no page and is a hole. */
for (const f of A.give.funds) {
  if (!f.resolve) continue;
  const it = BY_SLUG.get(f.resolve.slug);
  if (!it) die(`give.funds resolves against "${f.resolve.slug}", which is not a WORK item.`);
  f.__href = destOf(it);
  f.__name = it.name;
}

/* The four gathering formats, read out of the events register — including
   their holes, which is the point. G-2 exists because these four cannot say
   when they last ran; a page that quietly dropped that would be claiming a
   calendar it does not have. */
const FORMATS = ITEMS.filter(i => i.kind === 'events')
  .sort((a, b) => a.name.localeCompare(b.name))
  .map(i => {
    if (!i.gathering) die(`${i.__file} has no "gathering" line — the Volunteer band is built out of it.`);
    return { name: i.name, line: i.gathering, href: destOf(i), hole: (i.holes || [])[0]?.what || null };
  });
if (FORMATS.length !== 4) die(`${FORMATS.length} event formats, expected 4. If a fifth exists this band is fine; check the copy that says "four".`);

/* ═══ THE CHANNELS. Google Forms if there are any, email if not. ══════════ */
const CH = A.channels || {};
for (const [way, c] of Object.entries(CH)) {
  if (!c.form) continue;
  if (!/^https:\/\/docs\.google\.com\/forms\/[\w/?=&.+-]+$/.test(c.form)) {
    die(`channels.${way}.form is "${c.form}", which is not a docs.google.com/forms URL.\n`
      + '  A guessed or shortened form URL is a 404 behind a live-looking button — the defect this page exists to fix.\n'
      + '  Paste the real "Send > link" URL, or leave it null and the way keeps its email.');
  }
  if (way === 'give') {
    die('channels.give.form is set. A form does not take money, so G-1 is not satisfied by one.\n'
      + '  If giving now has a real destination, that is a payment URL and a ruling, not a form slot.');
  }
}
const EMAIL = A.start.email;
/* The way's call to action: a form when there is one, the email when there is
   not. Written once so all three ways cannot drift apart. */
const cta = (way, formLabel, mailSubject) => {
  const f = CH[way]?.form;
  return f
    ? `<a class="b b-1" href="${f}" rel="noopener" target="_blank">${esc(formLabel)}<span class="sr"> (a form on Google Forms, opens in a new tab)</span> ${ARROW}</a>`
    : `<a class="b b-1" href="mailto:${esc(EMAIL)}?subject=${encodeURIComponent(mailSubject)}">${esc(mailSubject)} ${ARROW}</a>`;
};

/* ═══ BANDS ══════════════════════════════════════════════════════════════
   Ground chain checked mechanically below. No two adjacent bands share a hex
   and the last does not share one with the footer (#151512).
   NO BAND IS CALLED `record` (a nav anchor, gate 7) OR `money` (reserved by
   verify-final.mjs's D-27 scope check). */
const BANDS = [
  ['top',      't1',         '#0D0D0B'],
  ['give',     'paper t2',   '#F3F2F0'],
  ['hands',    'dark-2 t2',  '#151512'],
  ['partner',  'paper-2 t3', '#ECEBE8'],
  /* `standing` is t3, NOT t1: it opens with `opener()` like every other band
     here, and on t1 (padding:0) its heading sat flush against the #ECEBE8 edge
     above and its last row flush against the #F3F2F0 one below. */
  ['standing', 't3',         '#0D0D0B'],
  ['start',    'paper t2',   '#F3F2F0'],
];

/* ── GATE 0. THE DECLARED GROUND IS THE PAINTED GROUND. ───────────────────
   `groundChain` compares the hexes DECLARED above and cannot see whether a
   band's classes actually paint them. `t1`, `t2` and `t3` are PADDING classes
   — the type rhythm — and paint nothing at all; the grounds are `paper`,
   `paper-2`, `dark-2` and, for a band with none of them, the body.

   This gate exists because the first version of this table declared `hands` as
   #151512 with the class `t2`, which paints #0D0D0B. Nothing looked wrong: the
   band's real neighbours are both paper, so the adjacency chain passed, the page
   rendered, and the declaration was simply false — the exact failure the shell's
   own comment says shipped once and cost a review cycle. A declaration that
   cannot be checked is a comment; this makes it an assertion. */
const GROUNDS = { paper: '#F3F2F0', 'paper-2': '#ECEBE8', 'dark-2': '#151512' };
const BODY_GROUND = '#0D0D0B';
for (const [id, cls, declared] of BANDS) {
  const painting = cls.split(/\s+/).filter(c => c in GROUNDS);
  if (painting.length > 1) {
    die(`band ${id} carries two ground classes ("${cls}") — which one paints is undefined.`);
  }
  const actual = painting.length ? GROUNDS[painting[0]] : BODY_GROUND;
  if (actual !== declared) {
    die(`band ${id} is declared ${declared} but its classes ("${cls}") paint ${actual}.\n`
      + '  t1/t2/t3 are PADDING classes and paint nothing. The grounds are paper, paper-2, dark-2, or the body.\n'
      + '  Fix whichever is wrong — but the adjacency chain below is only worth running on true hexes.');
  }
}
const clashes = S.groundChain(BANDS);

const INDEX = [
  ['Three ways in', '#top'], ['Give', '#give'], ['Volunteer', '#hands'],
  ['Partner', '#partner'], ['What you give to', '#standing'], ['Write to us', '#start'],
];

const B = {};

/* ── COMPONENTS ────────────────────────────────────────────────────────── */

/* An ask, as the reader met it somewhere else. The label is the WORK section's
   own words and the arrow points BACK — this is a return path, not a new
   offer, and it should not look like the page's own buttons. */
const askList = (way) => `      <ul class="ac-asks">
${asksFor(way).map(a => `        <li><a href="${a.href}"><b>${esc(a.label)}</b><span>${esc(a.from)}</span></a></li>`).join('\n')}
      </ul>`;

const bigNum = (f) => `        <div class="ac-fig">
          <p class="num ac-fig-v">${esc(f.value)}</p>
          <p class="lbl ac-fig-l">${esc(f.label)}</p>
          <p class="cap ac-fig-s">${esc(f.period)} &middot; ${esc(f.from)}</p>
        </div>`;

const namedHole = (what, unlocks) => `      <div class="ac-hole">
${hole(what)}
        <p class="body ac-unlock">${esc(unlocks)}</p>
      </div>`;

/* COUNTS IN PROSE ARE SUBSTITUTED, NEVER TYPED. One sentence on this page wants
   to say how many asks land here, and a number written into copy is a number
   that goes stale the next time the WORK section grows an ask — the whole reason
   the list itself is derived. `{{ASKS}}` is filled from the same count the rail
   uses, and gate 15 fails on any token left unexpanded. */
const TOKENS = { ASKS: String(ASKS.length) };
const copy = (s) => String(s ?? '').replace(/\{\{(\w+)\}\}/g, (m, k) => {
  if (!(k in TOKENS)) die(`copy token ${m} has no value. Add it to TOKENS or fix the text.`);
  return TOKENS[k];
});

/* ── BAND 1. THE MASTHEAD. ───────────────────────────────────────────────
   The homepage's own words for the h1, and the rail's first cell is COUNTED
   from the asks rather than typed: the page states how many other pages end
   by sending a reader here, and that number cannot be flattering by accident. */
const M = A.masthead;
B.top = () => `    <div class="wrap ac-mast">
      <p class="lbl eyebrow">${esc(M.kicker)}</p>
      <h1 class="d1">${M.h1}</h1>
      <p class="lead ac-standfirst">${esc(M.lead)}</p>
      <div class="ac-rail">
        <div class="ac-rail-c"><p class="num ac-rail-v">${ASKS.length}</p><p class="lbl ac-rail-l">Asks on this site that land here</p></div>
        <div class="ac-rail-c"><p class="num ac-rail-v">${esc(VOLUNTEERS.value)}</p><p class="lbl ac-rail-l">${esc(VOLUNTEERS.label)}, ${esc(VOLUNTEERS.period)}</p></div>
        <div class="ac-rail-c"><p class="num ac-rail-v ac-rail-w">12A + 80G</p><p class="lbl ac-rail-l">Registered</p></div>
      </div>
    </div>`;

/* ── BAND 2. GIVE. ───────────────────────────────────────────────────────
   The ask, then the three things it pays for, then the hole where the payment
   button would be. The hole is the band's most important element: G-1 means
   this page asks for money it cannot yet receive, and saying so is the only
   version of that which is not a trick. */
const G = A.give;
B.give = () => `${opener('give', G.head, esc(G.lead))}
    <div class="wrap">
      <div class="ac-ask">
        <div class="ac-ask-f">
          <p class="num ac-ask-v">${esc(G.figure.value)}</p>
          <p class="lbl ac-ask-l">${esc(G.figure.unit)}</p>
        </div>
        <div class="ac-funds">
${G.funds.map(f => `          <div class="ac-fund">
            <p class="lbl ac-fund-h">${f.__href ? `<a href="${f.__href}">${esc(f.h)} ${ARROW}</a>` : esc(f.h)}</p>
            ${f.hole ? `<div>\n${hole(f.hole)}\n            <p class="body ac-unlock">${esc(f.unlocks)}</p>\n            </div>` : `<p class="body ac-fund-p">${esc(f.p)}</p>`}
          </div>`).join('\n')}
        </div>
      </div>
${namedHole(G.hole, G.unlocks)}
      <div class="ac-cta">${cta('give', 'Set up a monthly gift', 'I want to give monthly')}</div>
      <h3 class="ac-sub">${esc(G.ask_head)}</h3>
${askList('give')}
    </div>`;

/* ── BAND 3. VOLUNTEER. ──────────────────────────────────────────────────
   The four formats come out of the events register with their holes attached,
   and then the band admits it has no calendar. Ruling G-2 in one band: the
   formats are real, the dates are not knowable from this repository, and the
   ask is therefore "tell us and we will tell you" rather than a date. */
const H = A.hands;
B.hands = () => `${opener('hands', H.head, esc(H.lead))}
    <div class="wrap">
      <div class="ac-figs">
${[VOLUNTEERS, COLLEGES, FELLOWSHIPS].map(bigNum).join('\n')}
      </div>
      <p class="cap ac-figs-n">Read from the pages that own them, so this page cannot come to disagree with them.</p>
      <h3 class="ac-sub">${esc(H.formats_head)}</h3>
      <div class="ac-formats">
${FORMATS.map(f => `        <div class="ac-format">
          <p class="lbl ac-format-h"><a href="${f.href}">${esc(f.name)} ${ARROW}</a></p>
          <p class="body ac-format-p">${esc(f.line)}</p>
${f.hole ? hole(f.hole) : ''}
        </div>`).join('\n')}
      </div>
      <p class="cap ac-figs-n">${esc(H.formats_note)}</p>
${namedHole(H.hole, H.unlocks)}
      <div class="ac-cta">${cta('hands', 'Sign up to volunteer', 'I want to volunteer')}</div>
      <h3 class="ac-sub">${esc(H.ask_head)}</h3>
${askList('hands')}
    </div>`;

/* ── BAND 4. PARTNER. ────────────────────────────────────────────────────
   Three doors, each with one resolved figure standing behind it, because
   "partner with us" is the emptiest sentence on any NGO website and the
   figures are the only thing that makes it mean something. The five companies
   are named — they are in the campaign's own data — and what they bought is
   described as the survival, not the planting day. */
const P = A.partner;
B.partner = () => `${opener('partner', P.head, esc(P.lead))}
    <div class="wrap">
      <div class="ac-doors">
        <div class="ac-door">
          <h3 class="ac-door-h">${esc(P.doors[0].name)}</h3>
          <p class="body ac-door-p">${esc(P.doors[0].p)}</p>
          <p class="num ac-door-v">${esc(SCHOOLS.value)}</p>
          <p class="cap ac-door-s">${esc(SCHOOLS.label)}, ${esc(SCHOOLS.period)} &middot; <a href="${SCHOOLS.href}">${esc(SCHOOLS.from)}</a></p>
        </div>
        <div class="ac-door">
          <h3 class="ac-door-h">${esc(P.doors[1].name)}</h3>
          <p class="body ac-door-p">${esc(P.doors[1].p)}</p>
          <p class="ac-door-list">${FUNDERS.map(esc).join(' &middot; ')}</p>
          <p class="cap ac-door-s">${esc(TREES.value)} &mdash; ${esc(TREES.label)}, ${esc(TREES.period)} &middot; <a href="${TREES.href}">${esc(TREES.from)}</a></p>
        </div>
        <div class="ac-door">
          <h3 class="ac-door-h">${esc(P.doors[2].name)}</h3>
          <p class="body ac-door-p">${esc(P.doors[2].p)}</p>
          <p class="num ac-door-v">${esc(PARTNERS.value)}</p>
          <p class="cap ac-door-s">${esc(PARTNERS.label)}, ${esc(PARTNERS.period)} &middot; <a href="${PARTNERS.href}">${esc(PARTNERS.from)}</a></p>
        </div>
      </div>
      <div class="ac-cta">${cta('partner', 'Start a partnership enquiry', 'I want to work with you')}</div>
      <h3 class="ac-sub">${esc(P.ask_head)}</h3>
${askList('partner')}
    </div>`;

/* ── BAND 5. WHAT YOU WOULD BE GIVING TO. ────────────────────────────────
   The legal facts, once, on the page where they matter. The registered name is
   the About page's, not the footer's — the footer is short by one word on every
   page of this site and that is a known, unfixed defect (AD-21 finding 2). */
const ST = A.standing;
B.standing = () => `${opener('standing', ST.head, esc(ST.lead))}
    <div class="wrap">
      <div class="p-rows">
${ST.rows.map(r => `        <div class="p-row">
          <p class="lbl">${esc(r.h)}</p>
          <div><p class="body">${esc(r.p)}</p></div>
        </div>`).join('\n')}
      </div>
${namedHole(ST.hole, ST.unlocks)}
    </div>`;

/* ── BAND 6. WHERE AN ASK ACTUALLY GOES. ─────────────────────────────────
   ONE CHANNEL, NOT TWO. This band shipped with an email and a phone number,
   following F-2's precedent on /farm — and on 22 August the owner said to take
   the number off the site. So the phone cell is gone from here and from
   /farm.json, and F-2's phone clause is superseded: the page still ends in a
   person rather than a form, which was the whole of F-2's point, and that
   person is reached by email.

   The band reads BETTER for it, which is worth recording rather than claiming
   as a plan. Its own lead has always said "three ways in and one door out of
   all of them" — with two cells under that sentence the copy was approximate.
   One door, stated once, at display size. Only the @swechha.in address is
   published (gate 10), and gate 16 fails the build if the struck number ever
   comes back. */
const T = A.start;
B.start = () => `${opener('start', T.head, esc(T.lead))}
    <div class="wrap">
      <div class="ac-ways ac-ways-1">
        <div class="ac-way">
          <p class="lbl ac-way-l">Write</p>
          <p class="ac-way-v"><a href="mailto:${esc(T.email)}">${esc(T.email)}</a></p>
          <p class="cap">${esc(T.email_note)}</p>
        </div>
      </div>
      <div class="ac-onward">
${T.onward.map(o => `        <a class="ac-door-a" href="${o.href}">
          <h3 class="ac-door-ah">${esc(o.h)} ${ARROW}</h3>
          <p class="body ac-door-ap">${esc(copy(o.p))}</p>
        </a>`).join('\n')}
      </div>
    </div>`;

/* ═══ PAGE CSS ═══════════════════════════════════════════════════════════
   NO BACKTICKS BELOW — the whole block is one template literal.
   Every grid track is minmax(0,1fr) or an fr pair with a 0 basis; gate 8
   fails a bare 1fr, which does not shrink and blows the page out sideways. */
const PAGE_CSS = `
/* ── masthead. A text masthead, deliberately: this page has no photograph of
      its own and a borrowed one would be decoration. The rail is three cells
      and the third is a WORD, at a smaller size, because a word set at
      numeral scale reads as a logo. ── */
/* The masthead is the one band that pays for its own padding, because it is t1.
   The bottom half is the site's hero figure -- .pic-body on farm/impact/about;
   without it the rail's labels ran into the ground change below them.
   NO BACKTICKS IN THIS BLOCK: it is inside a template literal. */
.ac-mast{padding:clamp(20px,3vw,44px) 0 clamp(22px,2.8vw,36px)}
.ac-standfirst{max-width:52ch;margin-top:var(--gap-row)}
.ac-rail{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(16px,3vw,48px);
  border-top:1px solid var(--hair);margin-top:var(--gap-row);padding-top:var(--gap-row)}
.ac-rail-c>*{margin:0;min-width:0}
.ac-rail-v{font-size:clamp(40px,7vw,96px);line-height:.9}
.ac-rail-w{font-size:clamp(24px,3.2vw,46px);letter-spacing:-.01em}
.ac-rail-l{margin-top:10px;color:var(--fg-2)}
@media (max-width:560px){.ac-rail{grid-template-columns:repeat(2,minmax(0,1fr));gap:20px}
  .ac-rail-c:last-child{grid-column:span 2}}

/* ── the ask, and the three things it pays for. The numeral is held in its own
      column so the three funded things read as a list beside it rather than
      as its caption. ── */
.ac-ask{display:grid;grid-template-columns:minmax(0,3fr) minmax(0,7fr);
  gap:clamp(20px,3vw,56px);align-items:start;margin-top:var(--gap-row)}
.ac-ask-f>*{margin:0}
.ac-ask-v{font-size:clamp(52px,8vw,112px);line-height:.86;letter-spacing:-.02em}
.ac-ask-l{margin-top:10px;color:var(--ink-2)}
.ac-funds{display:grid;gap:clamp(16px,2vw,26px)}
.ac-fund{border-top:1px solid var(--rule);padding-top:14px}
.ac-fund>*{margin:0;min-width:0}
.ac-fund-h{color:var(--ink)}
.ac-fund-h a{color:inherit;text-decoration:none;display:inline-flex;align-items:center;gap:7px}
.ac-fund-h a:hover{color:var(--mustard-ink)}
.ac-fund-h svg{width:14px;height:14px;flex:none}
.ac-fund-p{margin-top:8px;max-width:56ch}
@media (max-width:760px){.ac-ask{grid-template-columns:minmax(0,1fr)}}

/* ── a named hole, and the fact that closes it. Dotted rule, never a grey box:
      a hole is content and it should read like the rest of the page. ── */
.ac-hole{margin-top:var(--gap-block);max-width:62ch}
.ac-unlock{margin:10px 0 0;padding-left:16px;color:var(--fg-2)}
.paper .ac-unlock,.paper-2 .ac-unlock{color:var(--ink-2)}

/* ── the call to action. One per band, and the button is the only mustard on
      the page: red is never a control, and a second mustard field would spend
      the Give band's own signal. ── */
.ac-cta{margin-top:var(--gap-block)}
.ac-cta .b{min-height:var(--hit,44px)}

/* ── the three resolved figures on the Volunteer band. ── */
.ac-figs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(16px,3vw,44px);
  margin-top:var(--gap-row)}
.ac-fig>*{margin:0;min-width:0}
.ac-fig-v{font-size:clamp(34px,5.4vw,72px);line-height:.92}
.ac-fig-l{margin-top:9px}
.ac-fig-s{margin-top:6px;color:var(--fg-3)}
.paper .ac-fig-s,.paper-2 .ac-fig-s{color:var(--ink-3)}
.ac-figs-n{margin-top:var(--gap-row);color:var(--fg-3);max-width:60ch}
.paper .ac-figs-n,.paper-2 .ac-figs-n{color:var(--ink-3)}
@media (max-width:640px){.ac-figs{grid-template-columns:repeat(2,minmax(0,1fr))}
  .ac-fig:last-child{grid-column:span 2}}

/* ── a subheading inside a band. Caps, hairline above, so a band can carry two
      lists without either looking like a new section. ── */
.ac-sub{font-family:Archivo,system-ui,sans-serif;font-variation-settings:'wdth' 88,'wght' 650;
  font-size:clamp(13px,1.1vw,15px);letter-spacing:.06em;text-transform:uppercase;margin:var(--gap-block) 0 0;
  border-top:1px solid var(--hair);padding-top:14px;color:var(--fg-2)}
.paper .ac-sub,.paper-2 .ac-sub{border-top-color:var(--rule);color:var(--ink-2)}

/* ── the four gathering formats. Two columns of hairline-separated blocks, each
      carrying its own hole — the density IS the argument, exactly as the farm
      inventory is. ── */
.ac-formats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));
  gap:0 clamp(20px,3vw,56px);margin-top:var(--gap-row)}
.ac-format{border-top:1px solid var(--hair);padding:16px 0}
.ac-format>*{margin:0;min-width:0}
.ac-format-h a{color:var(--fg);text-decoration:none;display:inline-flex;align-items:center;gap:7px}
.ac-format-h a:hover{color:var(--mustard)}
.ac-format-h svg{width:14px;height:14px;flex:none}
.ac-format-p{margin-top:9px}
@media (max-width:700px){.ac-formats{grid-template-columns:minmax(0,1fr)}}

/* ── the ask list. A return path: the label the reader clicked, and the page it
      was on. Set as rows rather than cards, because eleven cards would look
      like a menu and this is a receipt. ── */
.ac-asks{list-style:none;margin:var(--gap-row) 0 0;padding:0;display:grid;
  grid-template-columns:repeat(2,minmax(0,1fr));gap:0 clamp(20px,3vw,56px)}
.ac-asks li{border-top:1px solid var(--hair);min-width:0}
.paper .ac-asks li,.paper-2 .ac-asks li{border-top-color:var(--rule)}
.ac-asks a{display:flex;flex-wrap:wrap;gap:2px 12px;align-items:baseline;
  min-height:var(--hit,44px);padding:9px 0;text-decoration:none;color:var(--fg)}
.paper .ac-asks a,.paper-2 .ac-asks a{color:var(--ink)}
.ac-asks b{font-weight:600}
.ac-asks span{font-size:12px;letter-spacing:.04em;text-transform:uppercase;color:var(--fg-3)}
.paper .ac-asks span,.paper-2 .ac-asks span{color:var(--ink-3)}
.ac-asks a:hover b{color:var(--mustard)}
.paper .ac-asks a:hover b,.paper-2 .ac-asks a:hover b{color:var(--mustard-ink)}
@media (max-width:640px){.ac-asks{grid-template-columns:minmax(0,1fr)}}

/* ── the three partner doors, ON A SHARED ROW GRID.
      "Organisations and researchers" wraps to two lines where "Schools" and
      "Companies" do not, so with three independent blocks every row below the
      heading sat lower in the third door than in the first two — the body copy,
      the numeral and the provenance line all out of step by one line's height.
      Subgrid makes the four rows one set of rows across all three doors, so the
      tallest heading sets the heading row and everything under it stays level.
      Fixing it by shortening the heading would work until the next edit; this
      holds for any copy. Where subgrid is unsupported the doors simply fall
      back to the old independent behaviour, which is a misalignment and not a
      break, so it needs no second rule. ── */
.ac-doors{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(20px,3vw,48px);
  margin-top:var(--gap-row);grid-template-rows:auto auto auto auto}
.ac-door{border-top:2px solid var(--ink);padding-top:16px;min-width:0;
  display:grid;grid-row:span 4;grid-template-rows:subgrid;align-content:start}
.ac-door>*{margin:0}
.ac-door-h{font-family:Archivo,system-ui,sans-serif;font-variation-settings:'wdth' 72,'wght' 800;
  font-size:clamp(17px,1.9vw,25px);letter-spacing:-.005em;text-transform:uppercase}
.ac-door-p{margin-top:12px}
.ac-door-v{font-size:clamp(30px,4.4vw,58px);line-height:.94;margin-top:16px}
.ac-door-list{margin-top:16px;font-size:clamp(14px,1.2vw,17px);line-height:1.5;color:var(--ink)}
.ac-door-s{margin-top:10px;color:var(--ink-3)}
.ac-door-s a{color:inherit}
@media (max-width:820px){.ac-doors{grid-template-columns:minmax(0,1fr)}}

/* ── TOUCH TARGETS. Nine links on this page draw at 14-17px: the two funded
      things that have a page, the four gathering formats, and the three
      provenance links under the partner numerals. All are under the 24px
      WCAG 2.5.8 floor and far under the 44 this site works to.

      THE HIT BOX GROWS, THE DRAWN BOX DOES NOT — AD-09's own pattern, reused
      rather than reinvented: a transparent absolutely-positioned ::after
      centred on the link. Every one of these sits on a hairline or under a
      numeral that is part of the composition, so raising min-height would move
      the drawn rule and add document height; the expander changes no pixel and
      no band height.

      CLEARANCES MEASURED FIRST, at 1440, to the nearest interactive element that
      horizontally overlaps: funds 107px · formats 166px · provenance 80/246/265px.
      Growing 17px to 44 costs 13.5px each side, so no expander can steal a
      neighbour's taps — which is the failure AD-09 had to hand-solve for the
      campaigns pair, and it does not arise here.

      THE EMAIL AND THE PHONE NUMBER draw at 37px — over the 24px hard floor and
      under 44, because they are set as display type and their own line height is
      the constraint. They take the same expander: they are the two controls the
      whole page funnels into, so they are the last place to leave 7px on the
      table. ── */
.ac-fund-h a,.ac-format-h a,.ac-door-s a,.ac-way-v a{position:relative}
.ac-fund-h a::after,.ac-format-h a::after,.ac-door-s a::after,.ac-way-v a::after{
  content:'';position:absolute;left:0;right:0;top:50%;
  transform:translateY(-50%);height:var(--hit,44px)}

/* ── the legal rows. THE SHARED .p-row IS auto + 1fr, which sizes its label
      column to each row's own label — right on a situation page, where the
      labels are of a length, and wrong here, where they run from "FCRA held" to
      "Registered under sections 12A and 80G". Every row started its body copy at
      a different x and the band read as five unrelated rows rather than one
      table. Overridden for THIS BAND ONLY, by id: a proportional pair, so the
      five bodies share one left edge. The shared component is not touched — it is
      correct for the pages that own it. ── */
#standing .p-row{grid-template-columns:minmax(0,3fr) minmax(0,7fr)}
@media (max-width:640px){#standing .p-row{grid-template-columns:minmax(0,1fr)}}

/* ── the two channels, and the three onward doors. Same shape as /farm's
      closing band, on purpose: a reader who has seen one should recognise the
      other as the same promise. ── */
.ac-ways{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:clamp(20px,3vw,48px);
  margin-top:var(--gap-row)}
/* ONE CHANNEL. Not a two-column grid with an empty cell — the address takes the
   measure it deserves and the note sits under it rather than beside a hole. */
.ac-ways-1{grid-template-columns:minmax(0,1fr)}
.ac-ways-1 .ac-way-v{font-size:clamp(24px,4vw,52px)}
.ac-ways-1 .cap{max-width:56ch}
.ac-way>*{margin:0;min-width:0}
.ac-way-l{color:var(--ink-3)}
.ac-way-v{font-family:Archivo,system-ui,sans-serif;font-variation-settings:'wdth' 76,'wght' 750;
  font-size:clamp(21px,2.6vw,34px);letter-spacing:-.01em;margin-top:8px;overflow-wrap:break-word}
.ac-way-v a{color:var(--ink);text-decoration:none}
.ac-way-v a:hover{color:var(--mustard-ink)}
.ac-way .cap{margin-top:10px;color:var(--ink-2);max-width:44ch}
@media (max-width:620px){.ac-ways{grid-template-columns:minmax(0,1fr)}}

.ac-onward{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(16px,2vw,32px);
  border-top:1px solid var(--rule);margin-top:var(--gap-block);padding-top:var(--gap-row)}
.ac-door-a{display:block;border:1px solid var(--rule);padding:clamp(14px,1.6vw,20px);
  text-decoration:none;transition:border-color .14s}
.ac-door-a:hover{border-color:var(--ink-2)}
.ac-door-ah{font-family:Archivo,system-ui,sans-serif;font-variation-settings:'wdth' 84,'wght' 700;
  font-size:clamp(15px,1.4vw,19px);letter-spacing:-.005em;margin:0;color:var(--mustard-ink);
  display:flex;align-items:center;gap:8px}
.ac-door-ah svg{width:15px;height:15px;flex:none}
.ac-door-ap{margin:10px 0 0;color:var(--ink-2)}
@media (max-width:760px){.ac-onward{grid-template-columns:minmax(0,1fr)}}
`;

/* ═══ WRITE ══════════════════════════════════════════════════════════════ */
const OUT = await S.assemble({
  file: 'act.html',
  title: 'Get involved &mdash; Swechha',
  bands: BANDS, index: INDEX, sh, clashes,
  pageCss: PAGE_CSS,
  /* /act is not a nav word — the Give chip points here and the chip carries no
     aria-current in the frozen header. Nothing is marked, deliberately;
     marking `Work` or `Impact` here would be a lie about where the reader is. */
  sectionFor: (id) => (B[id] || (() => '    <div class="wrap"><p class="lead">&mdash;</p></div>'))(),
  note: `${BANDS.length} bands + footer. ${ASKS.length} asks derived from the WORK section `
      + `into ${Object.keys(WAYS).length} ways, ${FORMATS.length} gathering formats, `
      + `${FUNDERS.length} named companies, ${6} resolved figures, `
      + `${Object.values(CH).filter(c => c.form).length} Google Form(s) wired.`,
});

/* ═══ POST-WRITE GATES ═══════════════════════════════════════════════════ */
let fail = 0;
const gate = (ok, msg) => { if (!ok) { console.error(`  FAIL ${msg}`); fail++; } else console.log(`  ok   ${msg}`); };
console.log('\nGATES');

/* Rendered text only. A gate run on raw HTML trips on class names and
   attribute values, and the next person switches it off. */
const RENDERED = OUT.replace(/<style[\s\S]*?<\/style>/g, ' ')
  .replace(/<script[\s\S]*?<\/script>/g, ' ')
  .replace(/<!--[\s\S]*?-->/g, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&mdash;|&middot;|&nbsp;/g, ' ')
  .replace(/\s+/g, ' ');

const HOME = readFileSync(join(S.V3, 'home.html'), 'utf8');

/* 4. EVERY DERIVED ASK IS ON THE PAGE, WITH ITS BACK-LINK. The whole promise
      of the derivation: a reader who clicked a label finds that label here. */
for (const label of new Set(ASKS.map(a => a.label))) {
  gate(RENDERED.includes(label), `the ask "${label}" is answered on the page`);
}
gate([...new Set(ASKS.map(a => a.href))].every(h => OUT.includes(`href="${h}"`)),
  `all ${new Set(ASKS.map(a => a.href)).size} distinct back-links render`);
/* The rail's counted cell says ASKS, not pages — several asks share a landing
   page, because an item with no page of its own is an anchor on its kind's. A
   cell that said "pages" would be off by the difference and nobody would
   notice; this asserts the number on the page is the one that was counted. */
gate(new RegExp(`>${ASKS.length}</p><p class="lbl ac-rail-l">Asks on this site`).test(OUT),
  `the rail counts ${ASKS.length} asks, and calls them asks rather than pages `
  + `(${new Set(ASKS.map(a => a.href.split('#')[0])).size} distinct landing pages carry them)`);

/* 5. THE ASK MATCHES THE FROZEN HOMEPAGE'S (G-3). The figure has no
      SOURCE-FACTS entry, so the homepage IS its source — which only holds if
      the two say the same thing. Checked against home.html, not asserted. */
gate(/500 rupees a month/i.test(HOME), 'home.html still carries the 500-rupee ask (its only source)');
gate(/₹500/.test(RENDERED) && /month/i.test(RENDERED), 'this page carries the same ask');

/* 6. THE THREE WAYS, IN THE HOMEPAGE'S ORDER. Read out of home.html's Give
      band rather than restated, so a rename over there fails the build here
      instead of quietly making the door and the room disagree. */
const giveBand = HOME.slice(HOME.indexOf('id="give"'), HOME.indexOf('id="give"') + 4000);
const homeWays = [...giveBand.matchAll(/<h3>([^<]+)<\/h3>/g)].map(m => m[1].trim());
gate(homeWays.join('|') === 'Give|Volunteer|Partner',
  `home.html's three ways are Give|Volunteer|Partner (found ${homeWays.join('|') || 'none'})`);
const order = ['give', 'hands', 'partner'].map(id => BANDS.findIndex(b => b[0] === id));
gate(order.every((v, i) => v > 0 && (i === 0 || v > order[i - 1])),
  'this page carries them as bands 2, 3, 4 in that order');

/* 7. NO BAND ID COLLIDES WITH A NAV ANCHOR. The frozen active-section observer
      matches band ids against nav hrefs, so a band called `record` would light
      the wrong nav item. */
const navWords = S.NAV.map(([, h]) => h.startsWith('/#') ? h.slice(2) : null).filter(Boolean);
const collide = BANDS.map(b => b[0]).filter(id => navWords.includes(id));
gate(collide.length === 0, `no band id collides with a nav anchor${collide.length ? `; COLLIDING: ${collide.join(', ')}` : ''}`);
gate(!/<section[^>]*id="money"/.test(OUT), 'no band called `money` — reserved by verify-final\'s D-27 check');

/* 7b. EVERY CUSTOM PROPERTY THIS PAGE USES IS ACTUALLY DEFINED.
       ★ THIS GATE CAUGHT A REAL BUG THE MOMENT IT WAS WRITTEN, and it is the
       cheapest gate on the page. Four declarations here read `var(--coral-ink)`,
       which is a token from the Next app's Tailwind theme in `app/globals.css`
       and DOES NOT EXIST in the v3 prototype's stylesheet. CSS does not warn:
       an undefined custom property with no fallback makes the declaration
       invalid at computed-value time, so `color` silently inherits and the
       accent simply never appears. The page renders, the console is clean, the
       contrast audit passes — because the text is the inherited near-black — and
       the intended colour is nowhere. Measured contrast is what exposed it: an
       accent reading 16.61:1 on paper is not an accent.
       The prototype's accents are --mustard / --mustard-ink / --red / --red-ink /
       --green / --green-ink. There is no coral in this system. */
/* A var() WITH A FALLBACK is valid even when the property is undefined, and that
   is this site's own idiom: `--hit` is never defined in the extracted stylesheet
   and every rule in the shell reads `var(--hit,44px)` for exactly that reason. So
   only NO-FALLBACK uses are checked — those are the ones that fail silently. */
const usedVars = [...new Set([...PAGE_CSS.matchAll(/var\((--[a-z0-9-]+)\s*(,?)/g)]
  .filter(m => !m[2]).map(m => m[1]))];
const definedVars = new Set([...OUT.matchAll(/(--[a-z0-9-]+)\s*:/g)].map(m => m[1]));
const undef = usedVars.filter(v => !definedVars.has(v));
gate(undef.length === 0,
  `all ${usedVars.length} custom properties used by this page's CSS are defined`
  + `${undef.length ? `; UNDEFINED: ${undef.join(', ')} — an undefined var makes the whole declaration invalid and inherits silently` : ''}`);

/* 7c. EVERY SMALL LINK HAS A HIT EXPANDER. The site works to a 44px floor and a
       24px hard floor, and nine links here draw at 14-17px. The floor is met by
       a transparent ::after (AD-09's pattern), which no static check can measure
       — so this asserts the RULE exists for every class that needs it, and the
       measurement is in the ledger. A new small link with no expander is the
       thing that would slip past. */
for (const cls of ['.ac-fund-h a', '.ac-format-h a', '.ac-door-s a', '.ac-way-v a']) {
  gate(PAGE_CSS.includes(`${cls}::after`), `${cls} carries a hit expander`);
}

/* 8. EVERY GRID TRACK IS minmax(0,1fr). A bare 1fr does not shrink. */
const bareFr = [...PAGE_CSS.matchAll(/grid-template-columns:[^;}]*/g)]
  .map(m => m[0]).filter(s => /\b1fr/.test(s.replace(/minmax\(0,\s*1fr\)/g, 'MM')));
gate(bareFr.length === 0, `every grid track is minmax(0,1fr)${bareFr.length ? `; BARE: ${bareFr.join(' | ')}` : ''}`);

/* 9. THE HOLES RENDER AS HOLES. G-1 and G-2 are only kept if the page actually
      says it cannot take money and cannot name a date. Four expected: the
      archive, the payment destination, the calendar, the accounts. */
const holes = (OUT.match(/class="p-hole"/g) || []).length;
gate(holes >= 4 + FORMATS.filter(f => f.hole).length,
  `${holes} named holes render (4 of the page's own + ${FORMATS.filter(f => f.hole).length} inherited from the events register)`);
gate(/cannot give money on this site yet/i.test(RENDERED), 'G-1: the page says giving is not connected');
gate(/no calendar on this site/i.test(RENDERED), 'G-2: the page says there is no calendar');

/* 10. ONLY @swechha.in EMAIL IS PUBLISHED, plus the exceptions the policy
       names (about-people.json's email_policy + published_email_exceptions).
       READ, NOT RESTATED: the rule lives in the data beside the addresses it
       governs, so relaxing it requires editing the recorded policy — where the
       reason is written down next to it — rather than editing this line. */
const EMAIL_POLICY = JSON.parse(
  readFileSync(join(S.ROOT, 'data/about-people.json'), 'utf8'));
const ALLOWED = new Set(EMAIL_POLICY.published_email_exceptions || []);
const mails = [...new Set([...OUT.matchAll(/mailto:([^"?]+)/g)].map(m => m[1]))];
const offsite = mails.filter(e => !e.endsWith('@swechha.in') && !ALLOWED.has(e));
gate(offsite.length === 0, `every published address is @swechha.in or a named exception${offsite.length ? `; FOUND: ${offsite.join(', ')}` : ''} (${mails.join(', ')})`);

/* 11. NO DEAD OR PROTOTYPE HREF. This page exists because of href="#"; it may
       not ship one of its own. The footer's remaining ones are the frozen P-1
       debt and are COUNTED — derived from the extracted footer rather than
       written as a number here, exactly as the WORK link gate derives its
       `inheritedHash`, so paying part of the debt does not break the gate. One
       of the three WAS the footer's own "Work with us", dead on every page of
       this site until this page existed to receive it; it now points at
       /act#partner and the count is one lower of its own accord. */
const footerHashes = (sh.FOOTER.match(/href="#"/g) || []).length;
const hashes = (OUT.match(/href="#"/g) || []).length;
gate(hashes === footerHashes,
  `no dead href of this page's own — ${hashes} on the page, all ${footerHashes} inherited from the frozen footer`);
gate(/href="\/act#partner"[^>]*>Work with us|>Work with us<\/a>/.test(sh.FOOTER)
  && !/href="#"[^>]*>Work with us/.test(sh.FOOTER),
  'the footer\'s "Work with us" now points at this page rather than nowhere');
const designHrefs = [...OUT.matchAll(/href="(\/design\/[^"]*)"/g)].map(m => m[1])
  .filter(h => !HOME.includes(`href="${h}"`));
gate(designHrefs.length === 0, `no /design/ href of this page's own${designHrefs.length ? `; FOUND: ${[...new Set(designHrefs)].join(', ')}` : ''}`);

/* 12. EVERY BAND CARRIES A HEADING, AND EVERY INDEX CHIP RESOLVES. */
const headless = BANDS.map(b => b[0]).filter(id => id !== 'top' && !new RegExp(`id="${id}-h"`).test(OUT));
gate(headless.length === 0, `every band carries a heading${headless.length ? `; HEADLESS: ${headless.join(', ')}` : ''}`);
for (const [, href] of INDEX) gate(OUT.includes(`id="${href.slice(1)}"`), `index chip ${href} resolves`);

/* 12b. NO PROPER NOUN IS CASE-MANGLED. A resolved label was being lowercased to
       make it read as a caption, which turned "Delhi NCR" into "delhi ncr" — a
       label read out of somebody else's dataset is their words, and case is part
       of the words. Cheap and specific: the two place names this page resolves
       must appear as themselves. */
for (const proper of ['Delhi NCR', 'Monsoon Wooding', 'Bridge the Gap']) {
  gate(RENDERED.includes(proper) && !RENDERED.includes(proper.toLowerCase()),
    `"${proper}" is rendered in its own case`);
}

/* 16. THE STRUCK PHONE NUMBER MAY NEVER COME BACK.
       The owner said "remove my phone number from the site" on 22 August. This
       repository's recurring failure is a struck fact being re-imported later by
       somebody acting in good faith — forty acres, twelve acres, two hectares —
       so the instruction becomes a build gate rather than a line in a document.
       Checked on the WHOLE output including attributes, because a tel: href is
       where it would hide, and on the digits with the separators stripped, so
       reformatting it does not evade the check. */
const STRUCK_NUMBER = '9013522222';
const digitsOnly = OUT.replace(/[^\d]/g, '');
gate(!digitsOnly.includes(STRUCK_NUMBER) && !/href="tel:/.test(OUT),
  'the struck phone number is absent, and there is no tel: link at all');

/* 15. NO UNEXPANDED TOKEN AND NO UNEXPANDED TEMPLATE REACHED THE HTML. */
const leftovers = [...OUT.matchAll(/\{\{\w+\}\}|\$\{[A-Za-z_][\w.]*\}/g)].map(m => m[0]);
gate(leftovers.length === 0, `no unexpanded token${leftovers.length ? `; FOUND: ${[...new Set(leftovers)].join(', ')}` : ''}`);
gate(RENDERED.includes(`${ASKS.length} of its asks end on this page`),
  'the onward door\'s count is the derived one, not a typed number');

/* 13. THE REGISTERED NAME, ITS CASE, AND THE BRAND NAME EVERYWHERE ELSE.
       Owner ruling, 22 August: the registered name is "Swechha We for Change
       Foundation" and "usually we use Swechha as the brand name — use Swechha
       wherever possible, other than legal or statutory requirement answers."
       Three gates, because the ruling has three failure modes.

       THE CASE IS THE INTERESTING ONE. It was written "We For Change" here, on
       /about, and in the AD-21 ledger it was copied from, and nothing could
       catch it: a capital in the middle of a legal name renders, passes every
       contrast and layout check, and reads as correct to anybody who has not
       been told. Only the owner saying so fixed it — so the wrong case is now
       struck, in the same way the phone number is, and it cannot come back. */
gate(/Swechha We for Change Foundation/.test(RENDERED),
  'the registered name is published in full, in the legal band');
gate(!/We For Change/i.test(OUT) || /We for Change/.test(OUT),
  'the case is "We for Change", lowercase "for"');
gate(!OUT.includes('We For Change'), 'the struck capital-F spelling is absent');

/* 13b. THE BRAND NAME CARRIES THE PAGE. The long name is a statutory answer, so
        it belongs in the legal band and nowhere else; everywhere the
        organisation is named in prose it should be "Swechha". Checked as a
        ratio rather than a ban, because one legal row legitimately needs the
        long form — and if a second one appears, somebody is using the
        registrar's name as the brand. */
const BODY = RENDERED.slice(0, RENDERED.indexOf('Swechha We for Change Foundation. Khirki'));
const longName = (BODY.match(/Swechha We for Change Foundation/g) || []).length;
const brandName = (BODY.match(/\bSwechha\b/g) || []).length;
gate(longName === 1, `the full legal name appears exactly once in the page's own body (found ${longName})`);
gate(brandName > longName + 2,
  `the brand name carries the prose — "Swechha" ${brandName}x against the long form ${longName}x`);
/* The footer is the site's other statutory line and carries it a second time,
   which is correct and is the frozen shell's business, not this page's — so it
   is excluded above and asserted here instead. AD-25 completed it: it read
   "We for Change Foundation." with no "Swechha" on every page of this site
   until 22 August. */
gate(/Swechha We for Change Foundation\. Khirki Extension/.test(RENDERED),
  'the frozen footer carries the completed registered name');

/* 14. THE HOMEPAGE'S THREE BUTTONS POINT HERE. The third part of the change:
       a built file and a route with the door still nailed shut is the AD-24
       defect. Recorded rather than failed ONLY if home.html is untouched, so
       the number is visible either way. */
const giveCtas = [...giveBand.matchAll(/class="b b-[12]" href="([^"]*)"/g)].map(m => m[1]);
gate(giveCtas.length === 3 && giveCtas.every(h => h.startsWith('/act')),
  `home.html's three Give buttons point at /act (found: ${giveCtas.join(', ') || 'none'})`);

if (fail > 0) {
  console.error(`\n${fail} gate(s) failed. The file is written — fix the generator and rebuild.`);
  process.exit(1);
}
console.log(`\n${OUT.length.toLocaleString('en-IN')} bytes. All gates pass.`);
