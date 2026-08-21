// AD-21 — about.html, the About page. SEVEN bands.
// (AD-20 was taken by a concurrent session for the work index; renumbered
//  rather than shared, because these documents are cited by number.)
//
// ★ THE CONCEPT, AND IT IS THE SAME ARGUMENT THE SITUATION PAGES MAKE, TURNED
// AROUND TO FACE INWARDS.
//
// Every other page on this site measures something in the world against the
// limit somebody published for it, and where the record has a hole it leaves
// the hole showing. An About page is where an organisation is normally allowed
// to stop doing that: a mission sentence, a photograph of a river, four round
// numbers, no sources. This one does not get the exemption. The page's whole
// position is that an organisation whose NAME MEANS "of one's own free will"
// should be the most legible object on its own website — so it states what
// Swechha says it is, in Swechha's own words with the source named; it names
// every person who does the work and every person who governs it; and it
// publishes what is checkable about the institution WITH THE TWO HOLES STILL
// IN IT.
//
// ★ THE PAGE'S FOUR FIGURES ARE COUNTED FROM ITS OWN DATASET, NOT TYPED.
// The situation pages earn their headline by reading it out of committed JSON
// so the page cannot disagree with its own source (that defect class had the
// index showing 412 while Air said 387). The institutional equivalent:
//
//     8       people on staff        = ABOUT.team.length
//     7       on the governing body  = ABOUT.governing_body.length
//     2       who are both           = the ones carrying `also_staff`
//     2000    working since          = sourced, and the ONLY year typed
//
// Add a ninth colleague to data/about-people.json and the headline moves by
// itself. Nobody has to remember to edit a sentence, which is the only reason
// a number on a page stays true.
//
// ★ NO YEAR COUNT ANYWHERE, PER BRANDING §3.5. "Since 2000" is sourced;
// "twenty-six years" is a tensed claim typed into static markup and it is the
// exact phrasing that section killed on the homepage. The settled answer there
// was CUT, not compute, and it is cut here too. Grep this file for 20\d\d: the
// only hits are 2000, and the four dated rungs of the record band, each of
// which is a historical event and not a claim about now.
//
// ★ WHAT IS NOT HERE, AND WHY.
//   · No state chip. LIVE / PERIODIC / OUT OF SEASON / NO SEASON describe how
//     a SOURCE delivers readings. This page has no feed, so stamping it with a
//     cadence word would be borrowing the site's most load-bearing vocabulary
//     to say nothing.
//   · No red. Red is a published limit broken (§3.1) and there is no limit on
//     this page to break. A governance row that is missing is a HOLE, which has
//     its own dotted marker, and dotted is not a colour.
//   · No board photographs. All seven exist only at 338-580px on the live site,
//     below this site's standard. See data/about-people.json's photo_policy —
//     the reason is recorded there so a later session does not "fix" it by
//     upscaling. A governing body reads as a register in any case.
//   · No social links and no contact band. The frozen footer already carries
//     both (AD-08 added the four verified accounts), and a second copy on this
//     page is the drift the shell pattern exists to prevent.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import * as S from './lib/situation-shell.mjs';
const { esc, opener, hole, ARROW, disclose } = S;

const sh = S.shell();

/* ═══ DATA ═══════════════════════════════════════════════════════════════
   The people are scraped from swechha.in's own Team and Governing Body
   listings and each person's /profile/ page — the organisation's own words
   about itself. The build does not write a bio and may not edit one silently:
   every departure from the scraped text is logged in the dataset's own
   `corrections` and `source_defects` arrays, and the counts below are printed
   at the end of the build so a change to either is visible in the log. ── */
const ABOUT = JSON.parse(readFileSync(join(S.ROOT, 'data/about-people.json'), 'utf8'));

/* Counts still come from the dataset; they are just SPELLED when they open a
   sentence. Read off the 1440 capture: "8 people. The descriptions are theirs"
   and "7 members. 2 of the 7 are also on the staff" both read as data entry
   rather than as prose. The numerals stay numerals in the hero register, where
   a figure is the point. */
const WORDS = ['zero','one','two','three','four','five','six','seven','eight','nine','ten',
  'eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty'];
const word = (n) => WORDS[n] ?? String(n);
const Word = (n) => { const w = word(n); return w.charAt(0).toUpperCase() + w.slice(1); };

const TEAM = ABOUT.team;
const BOARD = ABOUT.governing_body;
const BOTH = BOARD.filter(p => p.also_staff);
const FOUNDED = 2000;

/* Cross-reference gate. A board row carrying `also_staff` renders "see above"
   INSTEAD OF a bio, so a slug that does not resolve would render a dead
   pointer to a person who is not on the page. */
const teamBySlug = new Map(TEAM.map(p => [p.slug, p]));
let bad = 0;
for (const p of BOTH) {
  if (!teamBySlug.has(p.also_staff)) {
    console.error(`DATA IS WRONG: board member ${p.name} claims also_staff="${p.also_staff}", ` +
      'but no team entry has that slug. The board row would point at nobody.');
    bad++;
  }
}
for (const p of TEAM) {
  if (!p.bio || !p.bio.length) { console.error(`DATA IS WRONG: ${p.name} has no bio.`); bad++; }
  if (!p.photo || !p.photo.alt) { console.error(`DATA IS WRONG: ${p.name} has no photo alt.`); bad++; }
}
for (const p of BOARD) {
  /* Three legitimate states for a board row and no fourth: a bio, a pointer to
     the same person's staff entry, or an ADMITTED HOLE. `bio_pending` is the
     third — it is not "no bio", it is "the page says there is no bio yet", and
     it renders as a sentence rather than as a gap (BRANDING §4.4). A row with
     none of the three is a silent blank, which is the thing this whole design
     language exists to refuse. */
  if (!p.also_staff && !p.bio_pending && (!p.bio || !p.bio.length)) {
    console.error(`DATA IS WRONG: board member ${p.name} has no bio, no also_staff pointer and ` +
      'no bio_pending flag. A row must state its own absence rather than render blank.');
    bad++;
  }
  if (p.bio_pending && p.bio && p.bio.length) {
    console.error(`DATA IS WRONG: ${p.name} is flagged bio_pending but has a bio.`);
    bad++;
  }
}
/* An unpublished personal address must not reach the page. Checked here rather
   than trusted to the renderer, because the renderer is one line long and the
   consequence is republishing somebody's private Gmail on a public site. */
for (const p of BOARD) {
  if (p.email && !p.email.endsWith('@swechha.in')) {
    console.error(`REFUSING: ${p.name}'s published email is not an @swechha.in address.`);
    bad++;
  }
}
if (bad) { console.error('\nREFUSING TO WRITE: the dataset failed its own checks.'); process.exit(1); }

/* ═══ THE ORGANISATION'S OWN WORDS ════════════════════════════════════════
   Everything in this block is quoted from a named source, per
   docs/design/2026-08-21-SOURCE-FACTS.md §"Who we are — the org's own words
   (use these, don't improve on them)". The `src` field is rendered on the
   page, not kept in the comment, because a quotation whose source is only in
   the code is not checkable by a reader. ─────────────────────────────── */
const MISSION = 'to inspire, create and support &mdash; a just, equitable and sustainable '
  + 'society, for everyone and forever.';

const PILLARS = [
  ['Education', 'Curriculum, teacher training and school programmes.'],
  ['Environment', 'Land, water, air, waste and the living systems that carry them.'],
  ['Enterprise', 'Livelihoods, and products made from what was thrown away.'],
];

const THEMES = [
  'Sustainable Lifestyles &amp; Education',
  'Sustainable Agriculture &amp; Integrated Development',
  'Sustainable Cities &amp; Ecology',
  'Resilient &amp; Equitable Communities',
  'Green Economy &amp; Enterprise',
];

/* The Wheel of Change, PDF p2 — the organisation's own frame for how it works.
   Six modes, and they are set as a list rather than a wheel because a wheel
   drawn in CSS would be six words plus an ornament. */
const WHEEL = ['Research and knowledge creation', 'Media and advocacy', 'Networking',
  'Systemic change', 'Awareness and learning', 'Individual and collective action'];

/* THE RECORD. Four dated rungs and a present one. Every date is a historical
   event with a source; none of them is a claim about today. The last rung
   carries no year for that reason — "Now" is the frozen homepage's own word
   for it (band 8's fifth rung) and it cannot go stale. */
const RUNGS = [
  { year: '2000', head: 'We for Yamuna',
    text: 'A collective response towards growing apathy towards one of the most polluted '
        + 'rivers of the world. No funding, no office, one stretch of bank.',
    src: 'The organisation&rsquo;s own words, About' },
  { year: '2004', head: 'The first Yamuna Yatra',
    text: 'Twelve days from Yamunotri to Agra, about a thousand kilometres, tracking the river '
        + '&ldquo;from where it originates and is pristine, down to the point where it reaches '
        + 'Agra and is almost a toxic body of water.&rdquo;',
    src: 'Introduction to Swechha, p4' },
  { year: '2008', head: 'One of six, worldwide',
    text: 'CNN International selected Swechha as one of six change makers for Be the Change, '
        + 'and followed the work weekly for a year.',
    src: 'Introduction to Swechha; the org&rsquo;s own words, About' },
  { year: '2016', head: 'City to countryside',
    text: 'From urban campaigns to land, water, livelihoods and the farm. Gram Anubhav and the '
        + 'Farm School begin.',
    src: 'The organisation&rsquo;s own words, About' },
  { year: 'Now', head: 'Still showing up', green: true,
    text: 'The journeys still run, the schools still run, and the readings are published with '
        + 'the monitor each one came from and the hour it was taken.',
    src: null },
];

/* ═══ THE CHECKABLE PART ══════════════════════════════════════════════════
   Six facts and two holes. FIVE OF THE SIX COME OUT OF THE FROZEN FOOTER,
   which is the owner-approved place they already appear on this site
   (home.html:4183-4184) — so this band is not making a new claim, it is
   giving an existing one a page where it can be read. FCRA is an owner ruling
   given in chat on 21 August 2026. The two remaining rows are HOLES and they
   render as holes: dotted, stated in a sentence, per §4.1 and §4.4. ───── */
const LEGAL = [
  /* THE REGISTERED NAME, AND THE FOOTER NOW AGREES WITH IT.
     This row was written on 21 August against a frozen footer that read "We for
     Change Foundation." — missing the word "Swechha" — and recorded that
     mismatch as a defect in home.html it would not reach across and fix.
     RESOLVED 22 AUGUST (AD-25). The owner restated the registered name and
     ruled on the brand name in the same breath, which settled both halves: the
     footer now carries "Swechha We for Change Foundation." on every page, and
     THE CASE IS "We for Change" WITH A LOWERCASE "for". It was written "We For
     Change" here and on /act until he said so — a capital in the middle of a
     legal name is the kind of error that survives every check except being
     told, so build-act-page.mjs now gates the wrong case out. */
  ['Registered as', 'Swechha We for Change Foundation', 'the Executive Director, 21 August 2026'],
  ['Where', 'Khirki Extension, New Delhi', 'the footer of every page on this site'],
  ['Working since', String(FOUNDED), 'the footer of every page on this site'],
  ['Tax exemption', 'Sections 12A and 80G of the Income Tax Act', 'the footer of every page on this site'],
  ['Foreign contributions', 'FCRA held', 'the Executive Director, 21 August 2026'],
  ['Governing body', `${Word(BOARD.length)} members, every one of them named on this page`, 'a count of the rows in the band above'],
];

const HOLES = [
  'Registration number and the year it was granted: not published on this page yet.',
  'Annual reports and audited accounts: not published on this page yet. When they are, they '
  + 'belong here as files, not on request.',
];

/* ═══ BANDS ══════════════════════════════════════════════════════════════
   Ground chain, mechanically checked below. No two adjacent bands share a hex
   and the last band does not share one with the footer, which is #151512. */
const BANDS = [
  ['top',     't1',        '#0D0D0B'],
  // Paper for the longest reading on the page, and it is the context break
  // between the photograph above and the record below.
  ['says',    'paper t2',  '#F3F2F0'],
  /* ID IS `since`, NOT `record`, AND THAT IS NOT COSMETIC. The frozen
     active-section underline matches BAND IDS against the nav's hrefs
     (§5.10), and the nav's `Record` word points at the homepage's #record —
     the archive chapter. Naming this band `record` lit RECORD in the nav
     while a reader was in About's history, which is the precise failure that
     section calls worse than lighting nothing. Caught in a 1440 capture, not
     by reading the code. `work` `journeys` `impact` `farm` are reserved the
     same way; do not name a band after a nav word. */
  ['since',   't2',        '#0D0D0B'],
  // The second paper, so the two people bands read as a pair without sharing
  // a ground. Team is the heavier of the two (photographs, eight bios) and
  // takes t3's tighter rhythm because its own rows already carry the air.
  ['team',    'paper-2 t3', '#ECEBE8'],
  ['board',   'paper t2',  '#F3F2F0'],
  ['legible', 'dark-2 t2', '#151512'],
  ['act',     't3',        '#0D0D0B'],
];
const clashes = S.groundChain(BANDS);

/* THE CHIP LABELS ARE SHORT NOUN PHRASES, NOT THE BAND HEADS, and that is
   §5.10's own grammar: the control is "the word the page already uses for these
   six things, set in the nav's own micro-caps". It is also measured. The first
   draft used the band heads verbatim ("Who does the work", "What is
   checkable") and five of the seven chips then had to be scrolled flush to the
   row's right edge to reach, where the 1.5px focus ring lands 0.19-1.66px past
   the container. The frozen homepage exhibits the same thing on exactly one
   chip at -1.70px, so the mechanism is inherited chrome rather than a defect
   here — but long labels make the page meet it five times instead of once, and
   the labels were the half of it this page controls. */
const INDEX = [
  ['The word', '#top'], ['What we say', '#says'], ['The record', '#since'],
  ['The team', '#team'], ['The board', '#board'],
  ['Checkable', '#legible'], ['Turn up', '#act'],
];

const B = {};

/* ── BAND 1. THE WORD. ────────────────────────────────────────────────────
   The masthead over a halftone photograph, §5.4, and the frame is chosen for
   the argument rather than for the subject: a crowd on the floodplain, nobody
   assigned to be there. The four figures sit UNDER the photograph in the
   pic-body, in the flat-rail treatment the Impact tile uses, because they are
   a register of this page's own contents and not a hero statistic.
   `--op:50% 42%` because the crowd sits above the frame's centre line and a
   plain centre crop puts the horizon through their heads. */
B.top = () => `    <div class="pic ht">
      <img class="duo" src="/images/photos/yamuna-floodplain-crowd.jpg" alt="A crowd on the Yamuna floodplain looking out over the river" style="--op:50% 42%">
      <div class="pic-over"><div class="wrap">
        <h1 class="d1">Of one&rsquo;s own<br>free will</h1>
      </div></div>
    </div>
    <div class="pic-body"><div class="wrap">
      <p class="lbl a-eye">About Swechha &nbsp;/&nbsp; Khirki Extension, New Delhi &nbsp;/&nbsp; Working since ${FOUNDED}</p>
      <div class="a-hero">
        <div class="a-hero-say">
          <p class="lead a-lede">That is roughly what <i>swechha</i> means. Nobody was assigned to the
            river. Everyone who has ever cleaned it turned up &mdash; and the organisation that grew out
            of that is named after the reason they came.</p>
          <p class="body a-mis">Our mission is ${MISSION}</p>
          <p class="cap a-mis-src">Quoted from the organisation&rsquo;s own About page and from
            <i>Introduction to Swechha</i>, p1. Not paraphrased.</p>
        </div>
        <div class="a-hero-reg">
          <p class="lbl a-reg-k">This page, counted</p>
          <div class="a-regs">
            <div class="a-reg rl"><span class="a-reg-v">${TEAM.length}</span><span class="lbl a-reg-l">People on staff, named below</span></div>
            <div class="a-reg rl"><span class="a-reg-v">${BOARD.length}</span><span class="lbl a-reg-l">On the governing body, named below</span></div>
            <div class="a-reg rl"><span class="a-reg-v">${BOTH.length}</span><span class="lbl a-reg-l">Who are both, and the page says which</span></div>
            <div class="a-reg rl"><span class="a-reg-v">${FOUNDED}</span><span class="lbl a-reg-l">Working since</span></div>
          </div>
          <p class="cap a-reg-n">The first three are counted from this page&rsquo;s own list of
            people, so they cannot drift from it. ${FOUNDED} is the only year here that is a claim
            about now, and it is the one figure that is not counted but sourced.</p>
        </div>
      </div>
    </div></div>`;

/* ── BAND 2. WHAT WE SAY WE ARE. ─────────────────────────────────────────
   The org's own words, with the source on every block. Three pillars, five
   themes, six modes and one definition — all of it quoted. The band's job is
   to be the place a reader can check the mission sentence against, which is
   why the source lines are set at caption weight and not hidden in a tooltip. */
B.says = () => `${opener('says', 'What we say<br>we are',
  'Four blocks, all of them quoted rather than written. Where the organisation has already put '
  + 'a sentence on the record, this page uses that sentence.')}
    <div class="wrap">

      <div class="a-quote">
        <p class="d2 a-q-t">&ldquo;Be the Change&rdquo;</p>
        <p class="body a-q-b">An organisation dedicated to enabling ourselves and others around us to
          Be the Change, in making a visible difference to the Environment &mdash; both Physical and
          Social.</p>
        <p class="cap a-q-s">The organisation&rsquo;s own About page.</p>
      </div>

      <div class="a-three">
        <p class="lbl a-sub">The three it works under</p>
        <div class="a-three-g">
${PILLARS.map(([n, t]) => `          <div class="a-pil"><p class="a-pil-n">${n}</p><p class="cap a-pil-t">${t}</p></div>`).join('\n')}
        </div>
        <p class="cap a-q-s"><i>Introduction to Swechha</i>, p3. The site calls them
          &ldquo;three key focus areas&rdquo;; the tagline sets them as three words.</p>
      </div>

      <div class="a-two">
        <div>
          <p class="lbl a-sub">The five themes under those three</p>
          <ul class="a-list">
${THEMES.map(t => `            <li>${t}</li>`).join('\n')}
          </ul>
          <p class="cap a-q-s">Plus one that cuts across all five: <b>Building Narratives for
            Sustainability</b> &mdash; research, communication, advocacy. Each is a live page on the
            current site.</p>
        </div>
        <div>
          <p class="lbl a-sub">And how it says it works</p>
          <ul class="a-list a-list-n">
${WHEEL.map(t => `            <li>${t}</li>`).join('\n')}
          </ul>
          <p class="cap a-q-s">The <i>Wheel of Change</i>, <i>Introduction to Swechha</i>, p2.</p>
        </div>
      </div>

      <div class="a-def">
        <p class="lbl a-sub">And what it means by the word</p>
        <p class="lead a-def-t">Change is &ldquo;a transformation in the attitude of the masses, in
          their perceptions and simultaneously in the environment &mdash; both social and human.&rdquo;</p>
        <p class="cap a-q-s"><i>Introduction to Swechha</i>, p1.</p>
      </div>

      <p class="a-foot"><a class="act" href="/#work">What that looks like as work ${ARROW}</a></p>
    </div>`;

/* ── BAND 3. THE RECORD. ─────────────────────────────────────────────────
   Five rungs on the rail. GREEN IS LIVE IN THIS BAND AND ONLY THIS BAND
   (§3.2): green means what Swechha has done, which is exactly what a record
   is, and it lands on the one rung that is not a historical event. The rail is
   the frozen contract's `rl` class; the year sits in the rail's left column at
   figure weight so the column scans as a date spine. */
B.since = () => `${opener('since', 'The record<br>since 2000',
  'Four dated rungs and where it has got to. Each date is an event with a source under it, '
  + 'because a timeline with no sources is a mood board.')}
    <div class="wrap">
      <ol class="a-rungs" role="list">
${RUNGS.map(r => `        <li class="a-rung rl${r.green ? ' is-now' : ''}">
          <p class="a-rung-y">${r.year}</p>
          <div class="a-rung-b">
            <p class="a-rung-h">${r.head}</p>
            <p class="body a-rung-t">${r.text}</p>
            ${r.src ? `<p class="cap a-rung-s">${r.src}</p>` : '<p class="cap a-rung-s">No date, on purpose. A year typed here would be a claim about today.</p>'}
          </div>
        </li>`).join('\n')}
      </ol>
      <p class="a-foot"><a class="act" href="/#impact">What the record adds up to ${ARROW}</a></p>
    </div>`;

/* ── BAND 4. WHO DOES THE WORK. ──────────────────────────────────────────
   Eight people, each with the photograph, the role, the institutional address
   and THEIR OWN DESCRIPTION OF THEMSELVES, collapsed.
   THE BIOS ARE IN DISCLOSURES AND THAT IS A BUDGET DECISION, NOT A STYLE ONE.
   Eight bios run to about 8,000 characters; open, that is roughly 4,000px of
   band at 375 and it would make this the tallest thing on the site by a wide
   margin (§6.4, the phone budget). `details` is the frozen component for it
   (SHARED_PAGE_CSS's `.dx`): no JS, keyboard and screen-reader support for
   free, and the summary states what is inside rather than saying "more".
   The photographs take the site-wide monochrome ramp via `duo` — the library's
   own note records that selective colour is off by owner decision, and eight
   frames shot on eight different days in eight different lights is precisely
   the case the ramp exists to hold together. */
const person = (p) => `        <li class="a-p">
          <span class="ht a-p-fig"><img class="duo" src="${p.photo.src}" alt="${esc(p.photo.alt)}" loading="lazy"></span>
          <div class="a-p-b">
            <p class="a-p-n">${esc(p.name)}</p>
            <p class="lbl a-p-r">${esc(p.role)}</p>
            ${p.email ? `<p class="cap a-p-e"><a class="lk" href="mailto:${esc(p.email)}">${esc(p.email)}</a></p>` : ''}
${disclose(`In ${esc(p.name.split(' ')[0])}&rsquo;s own words`,
    p.bio.map(t => `<p class="body a-p-x">${esc(t)}</p>`).join('\n            '))}
          </div>
        </li>`;

B.team = () => `${opener('team', 'Who does<br>the work',
  'The descriptions are theirs, not the site&rsquo;s &mdash; each one is what that person wrote '
  + 'about themselves, carried over unedited. The count is in the register at the top.')}
    <div class="wrap">
      <ul class="a-people" role="list">
${TEAM.map(person).join('\n')}
      </ul>
      <p class="cap a-src">Names, roles and descriptions as the organisation publishes them.
        ${ABOUT.corrections.length
    ? `${ABOUT.corrections.length} spelling and institution-name corrections were made and every one of
        them is logged in <code>data/about-people.json</code>.`
    : ''}</p>
    </div>`;

/* ── BAND 5. WHO GOVERNS IT. ─────────────────────────────────────────────
   Seven rows on the register grammar (§5.5), no photographs.
   THE TWO WHO ARE ALSO STAFF CROSS-LINK INSTEAD OF REPEATING. Vimlendu's bio
   is 2,255 characters and Ashim's is 1,198; printing them twice on one page
   would add 3,453 characters of duplicate reading AND, in Ashim's case, print
   two different job titles for one person on one page, because the live site's
   two copies of his bio disagree (recorded in the dataset's source_defects).
   The cross-link is also the honest way to surface a real governance fact
   rather than let a reader discover it by noticing a name twice. */
/* `p-do-r` IS DELIBERATELY NOT USED HERE, AND THAT IS A CORRECTION.
   The first draft borrowed Air's `.p-do-r` row for the rule and padding. It
   rendered light-on-light: `.p-do-r .lbl{color:var(--fg-2)}` is two classes and
   beat this file's one-class `.a-b-r`, so every role on a paper ground came out
   at 1.51:1 — measured, not guessed. `.p-do-r` is a DARK-GROUND component and
   it states no paper ink; borrowing it onto paper is borrowing the wrong half
   of a component. The row keeps its own rule instead. */
const boardRow = (p) => {
  const also = p.also_staff ? teamBySlug.get(p.also_staff) : null;
  return `        <li class="a-b">
          <div class="a-b-h">
            <p class="a-b-n">${esc(p.name)}</p>
            <p class="lbl a-b-r">${esc(p.role)}</p>
          </div>
          <div class="a-b-c">${also
    /* THE CROSS-LINK IS A CONTROL, NOT A WORD IN A SENTENCE, and that is a
       touch-target decision. As prose ("their description is <a>in the band
       above</a>") it measured 20.0px at 375 — under the 24px AA floor, and an
       inline link cannot take AD-09's hit expander without stealing the taps
       of the line above it. The signed-off situation pages do ship inline links
       at 14-19px, so precedent would have covered it; a standalone `.act` is
       simply better, inherits the frozen 44px expander for free, and matches
       every other band's one CTA. */
    ? `<p class="body a-b-also">Also <b>${esc(also.role)}</b> on the staff.</p>
          <p class="a-b-go"><a class="act" href="#team">Their description, in the band above ${ARROW}</a></p>`
    /* A NAMED HOLE, not a blank row. He was named by the owner and is not on
       the live site's listing at all, so there is no description to carry over.
       The row still exists — leaving a governing-body member off the page to
       avoid an empty cell would be the worse lie — and the hole says what is
       missing, in a sentence, on the dotted marker. */
    : p.bio_pending
      ? hole(`${p.name}: description not published on this page yet.`)
    /* Collapsed, exactly as the team band's are. The first draft left these
       open and the board band measured 3,750px at 375 — on its own, more than
       a third of the whole document, for seven paragraphs almost nobody
       reads top-to-bottom. Same component, same behaviour, both bands. */
      : disclose(`In ${esc(p.name.split(' ')[0])}&rsquo;s own words`,
        p.bio.map(t => `<p class="body a-b-x">${esc(t)}</p>`).join('\n            '))}
          </div>
        </li>`;
};

B.board = () => `${opener('board', 'Who governs it',
  `${Word(BOARD.length)} members, and ${word(BOTH.length)} of them are also on the staff. The rows `
  + 'say which &mdash; that is the kind of thing an organisation asking you to trust its numbers '
  + 'should tell you rather than let you work out.')}
    <div class="wrap">
      <ul class="a-board" role="list">
${BOARD.map(boardRow).join('\n')}
      </ul>
    </div>`;

/* ── BAND 6. WHAT IS CHECKABLE. ──────────────────────────────────────────
   Six rows and two holes, on the alternate dark. The holes are DOTTED, which
   is the placeholder marker (§4.1) — not dashed, which means a window that is
   shut and is a different statement. Each fact names where it comes from, in
   the row, because "checkable" that does not say against what is a word. */
B.legible = () => `${opener('legible', 'The boring<br>and necessary<br>part',
  'An organisation that asks you to trust its readings has to be legible about itself. '
  + 'Six things are on the record. Two are not, and they are named rather than left out.')}
    <div class="wrap">
      <dl class="a-legal">
${LEGAL.map(([k, v, src]) => `        <div class="a-legal-r">
          <dt class="lbl a-legal-k">${k}</dt>
          <dd class="a-legal-v">${v}<span class="cap a-legal-s">From ${src}.</span></dd>
        </div>`).join('\n')}
      </dl>
      <div class="a-holes">
        <p class="lbl a-sub">Not on this page yet</p>
${HOLES.map(h => hole(h)).join('\n')}
      </div>
      <p class="cap a-src">Nothing in this band is new to the site. Five of the six rows are the
        sentence that already runs in the footer of every page here; the sixth was given by the
        Executive Director on 21 August 2026. The two holes stay dotted until there is a file
        behind them.</p>
    </div>`;

/* ── BAND 7. TURN UP. ────────────────────────────────────────────────────
   Three doors and one act. Mustard is the only hue in the band and it is on
   the controls, which is what licenses it everywhere else (§3.1). */
/* CANONICAL ROUTES, NOT PROTOTYPE PATHS. These three were written as
   `/design/v3/...` and were the last such hrefs in the finished set —
   `public/design/` is deleted before any deploy (AD-17 §6.4), so each would
   have become a 404 at the port. `The readings` is the situation index the
   nav's `Now` also points at; the other two are homepage bands written
   ABSOLUTELY, which is the same destination from here as from the homepage. */
const DOORS = [
  ['/now', 'The readings', 'Six situations, each against the limit somebody published for it.'],
  ['/#impact', 'The record', 'What the work adds up to, with a method note behind every figure.'],
  /* AD-24: `/farm` is a page now, and this door already says "you can come to
     it" — which the homepage band could only promise and the page can answer. */
  ['/farm', 'The farm', 'Five acres, an hour and a half from Delhi. You can come to it.'],
];

B.act = () => `${opener('act', 'Turn up',
  'The name is not a slogan &mdash; it is a description of how everyone here arrived.')}
    <div class="wrap">
      <div class="a-doors">
${DOORS.map(([h, n, t]) => `        <a class="a-door" href="${h}">
          <p class="a-door-n">${n}</p>
          <p class="cap a-door-t">${t}</p>
          <span class="a-door-go" aria-hidden="true">${ARROW}</span>
        </a>`).join('\n')}
      </div>
      <p class="a-foot a-foot-2"><a class="b b-1" href="/#give">Give monthly</a>
        <a class="b b-2" href="mailto:info@swechha.in">Write to us</a></p>
    </div>`;

/* ═══ PAGE CSS ════════════════════════════════════════════════════════════
   NO BACKTICKS ANYWHERE BELOW — this block is one template literal and a
   backtick in a comment silently terminates it. Three builds on this project
   were broken that way.
   Everything here is an `a-` component. Tokens are never re-typed: sizes come
   off the type scale's clamps and colours off the ink tables, and each paper
   band restates its ink because the same component runs on both grounds. ── */
const PAGE_CSS = `
/* ── THE HERO'S UNDER-BAND. Two columns at width: the sentence on the left,
      the page's own register on the right. One column below 900, and the
      register goes first-to-last rather than shrinking, because four figures
      squeezed beside a paragraph at 375 is four illegible figures. */
.a-eye{color:var(--fg-3);margin:0 0 clamp(14px,1.8vw,22px)}
.a-hero{display:grid;grid-template-columns:minmax(0,1fr);gap:clamp(26px,3vw,44px)}
.a-lede{margin:0 0 clamp(16px,1.8vw,22px);max-width:44ch}
.a-lede i{font-style:italic}
.a-mis{margin:0 0 .5em;max-width:48ch;color:var(--fg-2)}
.a-mis-src{color:var(--fg-3);margin:0;max-width:52ch}
.a-reg-k{color:var(--fg-3);margin:0 0 clamp(12px,1.4vw,16px)}
/* THE FLAT-RAIL FIGURE, the Impact tile's rotation of the rail contract: the
   rule lies under the numeral rather than beside it. Four cells, sized by
   content, because label lengths here differ by a factor of four. */
.a-regs{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:clamp(16px,2vw,26px) clamp(14px,1.8vw,24px)}
.a-reg{border-top:2px solid var(--hair);padding-top:11px}
.a-reg-v{display:block;font-size:clamp(34px,4vw,54px);line-height:.94;color:var(--fg);
  font-variant-numeric:tabular-nums}
.a-reg-l{display:block;color:var(--fg-2);margin-top:.5em}
.a-reg-n{color:var(--fg-3);margin:clamp(14px,1.6vw,20px) 0 0;max-width:42ch}

/* ── BAND 2, ON PAPER. Quoted blocks. Every one of them restates its ink:
      the same components run on dark elsewhere on the site. */
.a-sub{color:var(--ink-3);margin:0 0 clamp(10px,1.2vw,14px)}
.a-quote{border-top:2px solid var(--rule-2);padding-top:clamp(14px,1.6vw,20px);
  margin:0 0 clamp(30px,3.4vw,46px)}
.a-q-t{color:var(--ink);margin:0 0 .4em;max-width:24ch}
.a-q-b{color:var(--ink-2);margin:0 0 .7em;max-width:56ch}
.a-q-s{color:var(--ink-3);margin:0;max-width:60ch}
.a-q-s i{font-style:italic}
.a-three{margin:0 0 clamp(30px,3.4vw,46px)}
.a-three-g{display:grid;grid-template-columns:minmax(0,1fr);gap:clamp(18px,2vw,28px);
  margin:0 0 clamp(14px,1.6vw,20px)}
.a-pil{border-top:1px solid var(--rule);padding-top:11px}
.a-pil-n{font-size:clamp(20px,1.9vw,29px);line-height:1.15;color:var(--ink);margin:0 0 .3em}
.a-pil-t{color:var(--ink-2);margin:0;max-width:34ch}
.a-two{display:grid;grid-template-columns:minmax(0,1fr);gap:clamp(28px,3.2vw,44px);
  margin:0 0 clamp(30px,3.4vw,46px)}
/* The two lists differ in KIND, so they differ in mark: the five themes are a
   register and take rules, the six modes are a set and take counters. Neither
   takes a bullet, which this site does not use. */
.a-list{list-style:none;margin:0 0 clamp(12px,1.4vw,18px);padding:0}
.a-list li{border-top:1px solid var(--rule);padding:9px 0;color:var(--ink);
  font-size:clamp(15px,1.15vw,17.5px);line-height:1.4}
.a-list li:last-child{border-bottom:1px solid var(--rule)}
.a-list-n{counter-reset:wheel}
.a-list-n li{counter-increment:wheel;display:grid;grid-template-columns:2.2em minmax(0,1fr);gap:0 4px}
.a-list-n li::before{content:counter(wheel,decimal-leading-zero);color:var(--ink-3);
  font-size:11.5px;letter-spacing:.06em;padding-top:.35em}
.a-def{border-top:2px solid var(--rule-2);padding-top:clamp(14px,1.6vw,20px)}
.a-def-t{color:var(--ink);margin:0 0 .6em;max-width:46ch}
.a-foot{margin:clamp(26px,3vw,40px) 0 0}
.a-foot-2{display:flex;flex-wrap:wrap;gap:10px}

/* ── BAND 3. THE RECORD RAIL. The year is the spine. Green lands on the one
      rung that is not a dated event, and it is the only hue in the band. */
.a-rungs{list-style:none;margin:0;padding:0}
.a-rung{display:grid;grid-template-columns:minmax(0,1fr);gap:4px clamp(16px,2vw,30px);
  border-top:1px solid var(--hair);padding:clamp(16px,1.9vw,24px) 0}
.a-rung:last-child{border-bottom:1px solid var(--hair)}
.a-rung-y{font-size:clamp(26px,2.6vw,38px);line-height:1;color:var(--fg-2);margin:0;
  font-variant-numeric:tabular-nums}
.a-rung.is-now .a-rung-y{color:var(--green)}
.a-rung-b>*{margin:0}
.a-rung-h{font-size:clamp(18px,1.5vw,23px);line-height:1.2;color:var(--fg);margin:0 0 .35em}
.a-rung-t{color:var(--fg-2);max-width:56ch;margin:0 0 .5em}
.a-rung-s{color:var(--fg-3);max-width:56ch}
.a-rung-s i{font-style:italic}

/* ── THE DISCLOSURE ON PAPER-2, AND IT IS A DEFECT IN THE SHARED SHELL.
      SHARED_PAGE_CSS states the summary's ink for dark and for ".paper" and
      STOPS THERE. On "paper-2" it therefore keeps var(--fg-2), a light ink, on
      a light ground: measured at 1.41:1 against a 4.5:1 requirement, on all
      eight rows. Every other paper component in that file is written
      ".paper X,.paper-2 X" — this one rule is not, so the bug waits for the
      first page that puts a disclosure on the second paper. This one is.
      Repaired here rather than in the shell because seven signed-off pages
      build off that string and a concurrent session owns them; the shell fix
      is one selector and it is logged in this page's decision record. */
.paper-2 .dx-s{color:var(--ink-2)}
.paper-2 .dx-s:hover,.paper-2 .dx-s:focus-visible{color:var(--ink)}
.paper-2 .dx{border-top-color:var(--rule-2)}

/* ── BAND 4. THE PEOPLE, ON PAPER-2.
      THE FRAME IS CUT ON THE PHONE, NOT THE TYPE. At 375 the first draft ran a
      230px portrait above each name and the band measured 4,036px — four and a
      half times the 900px a band is budgeted (§6.4) and, with the board band,
      more than half the document. The rule that applies is the standing one:
      never solve a mobile problem by making type bigger, solve it by cutting
      the frame. So below 640 a person is a RULED REGISTER ROW — a 112px
      portrait beside the name, which is this site's own grammar for a list of
      things — and the frame opens to 230px at 640 and to a two-up 5:4 at 1100.
      The bio is the same disclosure at every width; nothing is hidden on the
      phone that is shown on the desktop.
      CROPPED HIGH ON PURPOSE: these are candid frames, not headshots, and the
      faces sit above the centre line in most of them. A dead-centre crop puts
      a chin at the top edge of half the set — read off the contact sheet, not
      assumed. */
.a-people{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:minmax(0,1fr);
  gap:clamp(18px,2.2vw,42px)}
.a-p{display:grid;grid-template-columns:112px minmax(0,1fr);gap:clamp(12px,1.6vw,20px);
  border-top:2px solid var(--rule-2);padding-top:clamp(12px,1.6vw,18px)}
.a-p-fig{display:block;position:relative;overflow:hidden;aspect-ratio:4/5;max-width:230px}
.a-p-fig img{width:100%;height:100%;object-fit:cover;object-position:50% 28%;display:block}
.a-p-b{min-width:0}
.a-p-b>*{margin:0}
.a-p-n{font-size:clamp(19px,1.6vw,25px);line-height:1.18;color:var(--ink);margin:0 0 .18em}
/* TWO CLASSES, BECAUSE ".paper-2 .lbl" IS TWO. A one-class rule here loses the
   cascade and silently gets --ink-3 instead of the --ink-2 this asks for. It
   still passed contrast, which is how it would have survived unnoticed. */
.a-p .a-p-r{color:var(--ink-2);margin:0 0 .4em}
/* THE HIT EXPANDER, AD-09's device: the box the finger hits grows, the drawn
   box does not, so the 2px mustard underline stays on its baseline and the band
   height does not move. The address is a STANDALONE control on its own line —
   unlike a link inside flowing prose, which the frozen pages ship at 14-19px
   and which cannot take an expander without stealing the taps of the line
   above. Clearance is measured, not assumed: see the decision record. */
.a-p-e{margin:0 0 .2em}
.a-p-e .lk{position:relative;color:var(--ink)}
.a-p-e .lk::after{content:'';position:absolute;left:0;right:0;top:50%;
  transform:translateY(-50%);height:var(--hit,32px)}
.a-p-x{color:var(--ink-2);max-width:62ch;margin:0 0 .8em}
.a-p-x:last-child{margin-bottom:0}
.a-src{color:var(--ink-3);max-width:64ch;margin:clamp(24px,2.8vw,36px) 0 0}
.a-src code{font-size:.94em;letter-spacing:.01em}

/* ── BAND 5. THE BOARD REGISTER. Rows, not cards: seven names with no
      photographs is a register, and a register is ruled. The rule is this
      component's own — see the note above boardRow() for why ".p-do-r" is not
      borrowed for it. */
.a-board{list-style:none;margin:0;padding:0}
.a-b{display:grid;grid-template-columns:minmax(0,1fr);gap:clamp(6px,.9vw,14px);
  border-top:1px solid var(--rule);padding:clamp(14px,1.7vw,20px) 0}
.a-b:last-child{border-bottom:1px solid var(--rule)}
.a-b-h>*{margin:0}
.a-b-n{font-size:clamp(19px,1.6vw,25px);line-height:1.18;color:var(--ink);margin:0 0 .16em}
.a-b .a-b-r{color:var(--ink-3)}
.a-b-c{min-width:0}
.a-b-x,.a-b-also{color:var(--ink-2);max-width:62ch;margin:0 0 .7em}
.a-b-x:last-child{margin-bottom:0}
.a-b-also{margin:0 0 .35em}
.a-b-go{margin:0}
.a-b-also b{font-weight:500;color:var(--ink)}
.a-b .dx{margin-top:0;border-top:0}

/* ── BAND 6. THE LEGAL ROWS, on the alternate dark. Definition list, because
      that is what it is: a term and the thing it resolves to. */
.a-legal{margin:0}
.a-legal-r{display:grid;grid-template-columns:minmax(0,1fr);gap:3px clamp(16px,2vw,30px);
  border-top:1px solid var(--hair);padding:clamp(13px,1.5vw,18px) 0}
.a-legal-r:last-child{border-bottom:1px solid var(--hair)}
.a-legal-k{color:var(--fg-3);margin:0;padding-top:.25em}
.a-legal-v{font-size:clamp(16px,1.3vw,20px);line-height:1.35;color:var(--fg);margin:0}
.a-legal-s{display:block;color:var(--fg-3);margin-top:.45em}
.a-holes{margin:clamp(24px,2.8vw,36px) 0 0}
.a-holes .a-sub{color:var(--fg-3)}
.a-src{max-width:64ch}
.dark-2 .a-src{color:var(--fg-3);margin-top:clamp(20px,2.4vw,30px)}

/* ── BAND 7. THREE DOORS. The door-card grammar: a ruled row that is entirely
      clickable, with the mark in the corner. */
.a-doors{display:grid;grid-template-columns:minmax(0,1fr);gap:1px;background:var(--hair)}
.a-door{display:block;background:var(--ground);padding:clamp(16px,1.9vw,24px) 0;
  text-decoration:none;color:inherit;transition:background .14s}
.a-door:hover,.a-door:focus-visible{background:rgba(251,248,240,.045)}
.a-door:focus-visible{outline:2px solid var(--fg);outline-offset:-3px}
/* THE MARK IS ITS OWN CELL, not a flex child of the name. It has to sit at the
   far right of the ROW; parked inside the name it lands at the right edge of
   the NAME, which in the two-column layout below is the middle of the row. */
.a-door{display:grid;grid-template-columns:minmax(0,1fr) 22px;
  gap:0 12px;align-items:baseline}
.a-door-n{font-size:clamp(19px,1.6vw,25px);line-height:1.2;color:var(--fg);margin:0 0 .3em;
  grid-column:1}
.a-door-go{display:inline-flex;width:22px;height:22px;color:var(--mustard);flex:none;
  grid-column:2;grid-row:1;align-self:center}
.a-door-go svg{width:100%;height:100%}
.a-door-t{color:var(--fg-2);margin:0;max-width:52ch;grid-column:1}
/* AT WIDTH THE DOOR IS TWO COLUMNS, not a name with a short caption under it
   and half a row of nothing to the right. Read off the 1440 capture: the
   caption capped at 46ch of 13.5px type left roughly 500px of the row empty
   while the caption itself wrapped to two lines. Same row grammar as the legal
   and board rows above it, which is the point — this page has one kind of
   ruled row, not three. */
@media (min-width:640px){
  .a-door{grid-template-columns:minmax(0,15em) minmax(0,1fr) 22px;
    gap:0 clamp(14px,2vw,30px)}
  .a-door-n{margin:0;grid-column:1}
  .a-door-t{grid-column:2;padding-top:.25em}
  .a-door-go{grid-column:3;grid-row:1}
}

@media (min-width:640px){
  .a-p{grid-template-columns:230px minmax(0,1fr)}
  .a-legal-r{grid-template-columns:minmax(0,14em) minmax(0,1fr)}
  .a-b{grid-template-columns:minmax(0,14em) minmax(0,1fr)}
  .a-rung{grid-template-columns:minmax(0,4.6em) minmax(0,1fr)}
  .a-three-g{grid-template-columns:repeat(3,minmax(0,1fr))}
  .a-doors{padding:0}
}
@media (min-width:900px){
  .a-hero{grid-template-columns:minmax(0,1.12fr) minmax(0,1fr)}
  .a-two{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}
  .a-regs{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}
}
@media (min-width:1100px){
  .a-people{grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:clamp(26px,3vw,42px) clamp(30px,3.4vw,52px)}
  .a-p{grid-template-columns:minmax(0,1fr);align-content:start}
  .a-p-fig{max-width:100%;aspect-ratio:5/4}
}
/* ── WHY EVERY TRACK ABOVE IS minmax(0,1fr) AND NOT 1fr.
      Measured at 768: .a-hero declared "grid-template-columns:1fr" and the
      track resolved to 821.80px inside a .wrap of 715.78px — 106px past the
      right gutter. It did not show up as document overflow, because section
      carries overflow-x:clip, so scrollWidth still equalled innerWidth and the
      overflow gate passed while the content was quietly cut off. 1fr is
      minmax(auto,1fr) and auto is min-content, so one long child pushes the
      track out from the inside. minmax(0,1fr) is the house style in
      situation-shell.mjs for precisely this reason (see .mr's track list and
      .mr-n's min-width:0) and it is not decoration. */
.a-hero-say,.a-hero-reg,.a-p-b,.a-b-c,.a-rung-b{min-width:0}

`;

/* ═══ WRITE ══════════════════════════════════════════════════════════════ */
const OUT = await S.assemble({
  file: 'about.html',
  title: 'About &mdash; Swechha',
  bands: BANDS, index: INDEX, sh, clashes,
  pageCss: PAGE_CSS,
  sectionFor: (id) => (B[id] || (() => '    <div class="wrap"><p class="lead">&mdash;</p></div>'))(),
  note: `${BANDS.length} bands + footer. ${TEAM.length} on staff, ${BOARD.length} on the `
      + `governing body, ${BOTH.length} both. ${LEGAL.length} facts, ${HOLES.length} named holes. `
      + `${ABOUT.corrections.length} logged corrections, ${ABOUT.source_defects.length} source defects.`,
});

/* ═══ POST-WRITE GATES. Each one is here because the thing it checks cannot be
      seen in a diff of this file. ─────────────────────────────────────── */
let fail = 0;
const gate = (ok, msg) => { if (!ok) { console.error(`  FAIL ${msg}`); fail++; } else console.log(`  ok   ${msg}`); };

console.log('\nGATES');

// 1. NO TYPED YEAR COUNT THAT THIS PAGE IS MAKING (BRANDING §3.5). Two
//    separate checks, because the first draft of this gate conflated them and
//    fired on three quoted bios.
//
//    1a. The dead phrasings, outright. "Twenty-six years" is the exact wording
//        §3.5 had surgically removed from the homepage, and it is the thing
//        this page is most likely to grow back the next time somebody writes a
//        warm opening sentence.
const DEAD = /twenty-(?:five|six|seven)\s+years|quarter of a century|\d+\s+years of (?:paper|work|showing up|Swechha)/i;
gate(!DEAD.test(OUT), 'none of the killed year-count phrasings is present');

//    1b. EVERY REMAINING YEAR COUNT IS TRACEABLE TO A QUOTED BIO. This is the
//        distinction that actually matters and it is checkable rather than
//        argued: "over 14 years of experience" is a claim NIKHIL makes about
//        his own career, attributed as his words in the band's own lead, and
//        the page is not the thing asserting it. A year count that is NOT in
//        somebody's quoted bio is the page speaking in its own voice, and then
//        §3.5 applies with full force. Anything new fails here loudly instead
//        of passing quietly because the regex happened not to match it.
const BIOTEXT = TEAM.concat(BOARD).flatMap(p => p.bio || []).join('  ');
const counts = [...OUT.matchAll(/[^.>;]{0,90}\b(?:\d+|a decade|two decades)\s+years?\b/g)]
  .map(m => m[0].replace(/<[^>]*>/g, '').replace(/&\w+;/g, ' ').replace(/\s+/g, ' ').trim());
const untraceable = counts.filter((c) => {
  // Compare on the tail of the phrase, which is what carries the claim, and
  // against the bios as the dataset holds them (before HTML escaping).
  const tail = c.slice(-42).replace(/^\S*\s/, '');
  return !BIOTEXT.includes(tail);
});
gate(untraceable.length === 0,
  `all ${counts.length} year counts are inside a quoted bio${untraceable.length ? `; PAGE'S OWN VOICE: ${untraceable.map(u => JSON.stringify(u)).join(' | ')}` : ''}`);

// 2. EVERY YEAR ON THE PAGE IS ONE THIS BUILD DECLARED. Catches a date typed
//    into a bio or a source line where nobody would look for it.
const years = [...new Set((OUT.match(/\b(?:19|20)\d\d\b/g) || []))].sort();
const declared = new Set(['2000', '2004', '2008', '2016', '2026',
  // years inside the people's own descriptions of themselves, which are
  // quoted and therefore historical statements, not claims by this page
  '2001', '2003', '2005', '2006', '2007', '2011', '2013', '2014', '2017', '2018', '2019', '2020', '2024']);
const undeclared = years.filter(y => !declared.has(y));
gate(undeclared.length === 0, `every year on the page is declared (${years.length} distinct${undeclared.length ? `; UNDECLARED: ${undeclared.join(', ')}` : ''})`);

// 3. NO UNPUBLISHED PERSONAL ADDRESS REACHED THE PAGE.
const leaked = (ABOUT.governing_body.concat(ABOUT.team))
  .filter(p => p.email_personal && OUT.includes(p.email_personal.address));
gate(leaked.length === 0, `no personal address published (${ABOUT.governing_body.filter(p => p.email_personal).length} withheld)`);

// 4. EVERY PERSON IS ON THE PAGE, BY NAME. A rendering bug that drops a row is
//    invisible unless you count.
const missing = TEAM.concat(BOARD).filter(p => !OUT.includes(esc(p.name)));
gate(missing.length === 0, `all ${TEAM.length + BOARD.length} people render${missing.length ? `; MISSING: ${missing.map(p => p.name).join(', ')}` : ''}`);

// 5. EVERY TEAM PHOTOGRAPH IS REFERENCED AND TAKES THE RAMP.
const noduo = TEAM.filter(p => !OUT.includes(`class="duo" src="${p.photo.src}"`));
gate(noduo.length === 0, `all ${TEAM.length} portraits render with the monochrome ramp`);

// 6. THE HOLES ARE DOTTED, NOT DASHED (§4.1). Two markers, two meanings, and
//    the wrong one turns "not published yet" into "this window is shut".
const pendingRows = BOARD.filter(p => p.bio_pending).length;
gate((OUT.match(/class="p-hole"/g) || []).length === HOLES.length + pendingRows,
  `${HOLES.length + pendingRows} named holes (${HOLES.length} institutional, ${pendingRows} missing description), all on the dotted marker`);

// 7. NO STATE CHIP. The four-word cadence vocabulary belongs to pages with a
//    feed. Borrowing it here would spend it for nothing.
gate(!/class="(?:state|tag) /.test(OUT) || !/(LIVE|PERIODIC|OUT OF SEASON)/.test(OUT),
  'no source-cadence state word on a page with no source feed');

// 8. NO RED. There is no published limit on this page to break (§3.1).
gate(!/--red\b/.test(PAGE_CSS), 'no red in the page CSS');

// 8b. NO BARE `1fr` TRACK. This gate exists because the overflow check CANNOT
//     see the bug it prevents: `section` carries overflow-x:clip, so a grid
//     track blown out from the inside by a long child gets silently cut off
//     while document.scrollWidth still equals innerWidth and every width in the
//     sweep reports clean. Measured at 768 on the first build of this page:
//     .a-hero's track resolved to 821.80px inside a .wrap of 715.78px. `1fr` is
//     minmax(auto,1fr), and auto is min-content.
const bareFr = [...PAGE_CSS.matchAll(/grid-template-columns:[^;}]*(?<![\w),])1fr\b[^;}]*/g)]
  .map(m => m[0]).filter(t => !t.includes('minmax(0,1fr)'));
gate(bareFr.length === 0,
  `every grid track is minmax(0,1fr)${bareFr.length ? `; BARE: ${bareFr.join(' | ')}` : ''}`);

// 8c. NO BAND ID COLLIDES WITH A NAV WORD. The frozen active-section observer
//     matches band ids against the nav's hrefs, so a band called `record`
//     lights the nav's RECORD — which points at the homepage's archive chapter,
//     not at anything on this page. Measured in a 1440 capture on the first
//     build: the history band was called `record` and RECORD stayed underlined
//     through it. §5.10: aria-current pointing at the wrong section is worse
//     than pointing nowhere.
const NAV_IDS = new Set(S.NAV.map(([, href]) => (href.match(/#([\w-]+)$/) || [])[1]).filter(Boolean));
const collide = BANDS.map(b => b[0]).filter(id => NAV_IDS.has(id));
gate(collide.length === 0,
  `no band id collides with a nav word (reserved: ${[...NAV_IDS].join(', ')})${collide.length ? `; COLLIDING: ${collide.join(', ')}` : ''}`);

// 9. THE CROSS-LINK TARGETS RESOLVE. A "see above" pointing at a band that
//    does not exist is the defect verify:final was written for.
for (const [, href] of INDEX) {
  const id = href.slice(1);
  gate(OUT.includes(`id="${id}"`), `index entry ${href} resolves to a band`);
}

if (fail) {
  console.error(`\n${fail} gate(s) failed. The file is written — fix the generator and rebuild.`);
  process.exit(1);
}
console.log(`\n${OUT.length.toLocaleString('en-IN')} bytes. All gates pass.`);
