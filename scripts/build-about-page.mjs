// AD-21 — about.html, the About page. SIX bands (AD-27 deleted the seventh).
// (AD-20 was taken by a concurrent session for the work index; renumbered
//  rather than shared, because these documents are cited by number.)
//
// ★ AD-27, 22 AUGUST 2026 — LANE 4. Four rulings landed here and each one is
// annotated at the code it changed:
//   · AD-27.39  the four-figure "This page, counted" register is DELETED, and
//               the mission sentence takes its place at display level. NO
//               HEADCOUNT of staff or board renders anywhere on this page any
//               more, derived or typed — and the gate that used to prove the
//               figures right now proves they are gone (gate 1c).
//   · AD-27.40  Mission is kept and promoted. There is NO Vision statement on
//               this page and one is not invented; "Be the Change" in #says is
//               a vision in everything but the label and is NOT relabelled,
//               because the source does not call it that.
//   · AD-27.41  the `legible` band ("The boring and necessary part") is
//               DELETED. Every fact in it survives in the client's new footer
//               sentence (AD-27.8) — registered name, city, 2000, Societies
//               Registration Act, 80G, 12A and FCRA — on all 35 pages instead
//               of one. The sixth row was a headcount and AD-27.39 removed it.
//   · AD-27.47  RETRACTED BY AD-28 §5. The "community organisation" sentence
//               fabricated "the Jagdamba Camp school" and is deleted, not
//               repaired; gates 1d and 15 now refuse to write it back.
//   · AD-27.18  the site's ONE media door is the Ask in #act.
//   · AD-27.50  Person JSON-LD for Vimlendu Jha, emitted from the dataset so
//               it cannot drift from the rendered bio, plus the addressable
//               id="vimlendu-jha" the SEO phrase table points at.
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
// ★ THE PAGE NO LONGER COUNTS ITSELF, AND THAT IS AN OWNER RULING.
// It used to open with four figures derived from this file's own dataset —
// staff, governing body, the two who are both, and 2000 — so that adding a
// ninth colleague moved the headline by itself. The client deleted the device:
// "don't give the number of staff, delete that stats formula" (AD-27.39). The
// formula was the conceit, not the figure, so the whole register went and the
// mission took the full measure at display level instead.
//
// THE DERIVATION SURVIVES WHERE IT STILL EARNS ITS KEEP. The dataset is still
// the only source of who is on the page, the cross-reference checks below
// still run, and the counts are still printed in the BUILD LOG so a change to
// either is visible to whoever ran the build. What changed is that no count
// reaches the HTML — enforced by gate 1c, which is the old gate inverted.
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
import { seo } from './lib/seo-register.mjs';
/* `ask` and `askGates` are AD-27.14–22's component, authored once in the shell
   by lane 1. AD-27.56: lanes 3 and 4 build through this file and CALL it rather
   than retype AD-27.15's markup, and they inherit AD-27.16's CSS with it —
   there is deliberately no second copy of either in this file. */
/* `hole` is deliberately NOT imported. AD-28 removed every named hole from
   this page and a build gate refuses to write one; importing the helper back is
   the first half of putting one on the page. */
const { esc, opener, ARROW, disclose, ask, askGates } = S;

const sh = S.shell();

/* ═══ DATA ═══════════════════════════════════════════════════════════════
   The people are scraped from swechha.in's own Team and Governing Body
   listings and each person's /profile/ page — the organisation's own words
   about itself. The build does not write a bio and may not edit one silently:
   every departure from the scraped text is logged in the dataset's own
   `corrections` and `source_defects` arrays, and the counts below are printed
   at the end of the build so a change to either is visible in the log. ── */
const ABOUT = JSON.parse(readFileSync(join(S.ROOT, 'data/about-people.json'), 'utf8'));

/* THE SPELLED NUMBERS SURVIVE FOR THE GATE, NOT FOR THE PAGE.
   Counts used to be spelled when they opened a sentence — "Eight members, and
   two of them are also on the staff" — because the numeral read as data entry
   rather than as prose. AD-27.39 deleted every one of those sentences, so
   nothing renders a count any more. `word()` is kept because gate 1c has to
   search for the counts in EVERY FORM SOMEBODY COULD WRITE THEM BACK IN, and
   "eight" is the form a writer reaches for first. `Word()` went with the last
   sentence that opened on one; the gate is case-insensitive and does not need
   it. */
const WORDS = ['zero','one','two','three','four','five','six','seven','eight','nine','ten',
  'eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty'];
const word = (n) => WORDS[n] ?? String(n);

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
/* EVERY RUNG HAS A YEAR. The rail is a date spine and a blank cell in it reads
   as a bug — see the deleted CNN rung below. A rung whose year cannot be
   settled does not belong on the spine at all; put the claim where it can be
   attributed instead. */
const RUNGS = [
  { year: '2000', head: 'We for Yamuna',
    text: 'A collective response towards growing apathy towards one of the most polluted '
        + 'rivers of the world. No funding, no office, one stretch of bank.' },
  { year: '2004', head: 'The first Yamuna Yatra',
    text: 'Twelve days from Yamunotri to Agra, about a thousand kilometres, tracking the river '
        + '&ldquo;from where it originates and is pristine, down to the point where it reaches '
        + 'Agra and is almost a toxic body of water.&rdquo;' },
  /* AD-28 — THE CNN RUNG IS DELETED, AND THE FACT IS NOT LOST.
     Three sources on this one page gave three different years for it: this rung
     said 2008, Vimlendu's own bio five hundred pixels below says 2007, and
     SOURCE-FACTS says 2008–2009. A page cannot assert a year it cannot settle,
     so the year came off first — and that was worse. The rail is a DATE SPINE
     (the year sits in its own left column at figure weight so the column scans
     as a run of dates); a rung with an empty year cell reads as a rendering
     fault, not as a deliberate silence. Verified by screenshot at 1440 before
     deciding: the blank cell is the loudest thing in the band.
     So the rung goes. THE CLAIM SURVIVES IN VIMLENDU'S OWN BIO in the #team
     band on this same page, in his words, with his year — which is where a
     contested date belongs: attributed to the person making it, not asserted by
     the organisation. The spine now reads 2000 · 2004 · 2016 · Now.
     Do not restore this rung without a source that settles the year. */
  /* AD-28 — "Gram Anubhav and the Farm School begin." IS DELETED. It was not in
     the frozen homepage rung this is carried from ("City to countryside. Land,
     water, livelihoods and the farm."), it is in no source, and this site
     contradicts it in two places: /work/journeys/gram-anubhav publishes no
     start year at all, and F-15 puts the farm land purchase around 2022. Two
     true facts on either side of a rung do not license a third between them.
     Do not restore it without a source that names the year. */
  { year: '2016', head: 'City to countryside',
    text: 'From urban campaigns to land, water, livelihoods and the farm.' },
  { year: 'Now', head: 'Still showing up', green: true,
    text: 'The journeys still run, the schools still run, and the readings still go up '
        + 'with the hour they were taken.' },
];

/* ═══ THE CHECKABLE PART IS NOT A BAND ANY MORE — AD-27.41 ════════════════
   `legible`, "The boring and necessary part", carried a six-row legal
   definition list, two dotted holes and a provenance note. The client called it
   unnecessary; the page called it necessary; and HIS OWN NEW FOOTER SENTENCE is
   what settles it. AD-27.8 replaced the footer legal strip with:

     Swechha We for Change Foundation, New Delhi. Working since 2000.
     Registered Societies Registration Act, 80G, 12A, FCRA Powered.

   That carries the registered name, the city, the founding year, the Societies
   Registration Act, 80G, 12A and FCRA — on all 35 pages of this site instead of
   on one. Row by row: five of the six facts move there with thirty-five times
   the reach, and the sixth (governing body: N members) was a HEADCOUNT, which
   AD-27.39 has just removed from this page in any case.

   THE DOUBLE-CUT RISK WAS REAL AND IT IS VOID. Reading the client's footer
   instruction as ending at "Working since 2000" would have deleted 12A and 80G
   from the entire website, and for an Indian NGO soliciting donations the 80G
   line is the first thing a donor looks for. It does not end there. FCRA, which
   until today existed in exactly two places in this repository and both of them
   were this band, is published on every page for the first time.

   THE TWO HOLES ARE NOT FORGOTTEN, THEY ARE CONTENT DEBT. The registration
   number and its grant year, and the annual reports and audited accounts. The
   real fix for the second is already scoped —
   2026-08-22-LEGACY-SITE-CONTENT-AUDIT.md §1.1 found eleven activity and annual
   reports, eight of them one URL rewrite away and four public on Drive, plus the
   80G certificate. A transparency shelf with twelve real files is worth more
   than a dotted line saying there is not one, and it is its own pass. DO NOT
   restore the dotted rows instead of building it. ─────────────────────────── */

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
  /* `legible` sat here on `dark-2` #151512 until AD-27.41 deleted it. Removing
     it does not break the chain — board #F3F2F0 -> act #0D0D0B -> footer
     #151512 — and it takes the page's only `dark-2` ground with it, which is
     why the `.dark-2 .a-src` rule went from the CSS in the same edit. */
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
/* AD-27.41: `Checkable` goes with the band it pointed at. Six chips, not seven. */
const INDEX = [
  ['The word', '#top'], ['What we say', '#says'], ['The record', '#since'],
  ['The team', '#team'], ['The board', '#board'], ['Turn up', '#act'],
];

const B = {};

/* ── BAND 1. THE WORD. ────────────────────────────────────────────────────
   The masthead over a halftone photograph, §5.4, and the frame is chosen for
   the argument rather than for the subject: a crowd on the floodplain, nobody
   assigned to be there.
   `--op:50% 42%` because the crowd sits above the frame's centre line and a
   plain centre crop puts the horizon through their heads.

   ★ AD-27.39 — WHAT USED TO BE HERE AND WHY IT IS NOT.
   A two-column under-band: the definition sentence on the left, and on the
   right `.a-hero-reg`, "This page, counted" — four figures (staff, governing
   body, the two who are both, 2000) each on a 2px flat rail. The client
   deleted it: "don't give the number of staff, delete that stats formula".
   The whole band went, not just one figure, for two reasons beyond the
   instruction. `.a-regs` was `repeat(2,minmax(0,1fr))` AT EVERY WIDTH, so
   removing one of four leaves a 2+1 grid with a conspicuous hole in the bottom
   right and every surviving cell's top rule making the gap read as a missing
   tile. And the caption — "The first three are counted from this page's own
   list of people" — becomes false the moment there are two.

   ★ WHAT FILLS THE HOLE, AND WHY IT IS BETTER THAN A FIGURE.
   The mission. It is the one sentence on this page quoted verbatim from the
   organisation's own words in two independent sources, and the client said
   explicitly to keep it. It was set in `.body` at the foot of the left column,
   which is where a mission sentence goes to be skipped. It now takes the full
   measure at `.d2` — the site's serif display, Newsreader 300 at --t-d2, 24px
   at 375 and 44px at 1440. NO NEW TYPE ROLE IS INTRODUCED: BRANDING §2.3 closed
   the question of a second display face for section heads, and this is not a
   section head, it is the page's one quotation set large, which is exactly what
   `.d2` is for.

   THE ORDER IS A CRESCENDO AND IT IS DELIBERATE. h1 "Of one's own free will" ->
   the gloss that says what the word means -> the mission, big, on its own rule.
   The gloss stays directly under the masthead because it is the masthead's
   definition; moving the mission above it would break the one adjacency on this
   page that has to hold.

   THE RULE RUNS THE FULL WRAP EVEN THOUGH THE TYPE DOES NOT. `.a-mis-b` has no
   max-width, so its 2px top rule spans the whole measure and the display type
   sits inside it at 40ch. That is what stops the under-band reading as an empty
   right-hand half now that the register has gone — measured by capture at 1440,
   not assumed. */
B.top = () => `    <div class="pic ht">
      <img class="duo" src="/images/photos/yamuna-floodplain-crowd.jpg" alt="A crowd on the Yamuna floodplain looking out over the river" style="--op:50% 42%">
      <div class="pic-over"><div class="wrap">
        <h1 class="d1">Of one&rsquo;s own<br>free will</h1>
      </div></div>
    </div>
    <div class="pic-body"><div class="wrap">
      <p class="lbl a-eye">About Swechha &nbsp;/&nbsp; Khirki Extension, New Delhi &nbsp;/&nbsp; Working since ${FOUNDED}</p>
      <p class="lead a-lede">That is roughly what <i>swechha</i> means. Nobody was assigned to the
        river. Everyone who has ever cleaned it turned up &mdash; and the organisation that grew out
        of that is named after the reason they came.</p>
      <div class="a-mis-b">
        <p class="d2 a-mis">Our mission is ${MISSION}</p>
      </div>
    </div></div>`;

/* ── BAND 2. WHAT WE SAY WE ARE. ─────────────────────────────────────────
   The org's own words, with the source on every block. Three pillars, five
   themes, six modes and one definition — all of it quoted. The band's job is
   to be the place a reader can check the mission sentence against, which is
   why the source lines are set at caption weight and not hidden in a tooltip.

   ★ AD-27.40 — THERE IS NO VISION STATEMENT ON THIS PAGE AND ONE IS NOT
   WRITTEN. The client's instruction was the unfinished sentence "Keep Mission
   and Vision, delete", read by the client-request document as: keep the block,
   and the trailing "delete" attaches to the next bullet. Grepped: the only
   "vision" anywhere on this page is inside the word "division" in a CSS
   comment. The nearest thing the record holds is "Be the Change", quoted below
   from the organisation's own About page, and it is a vision in everything but
   the label. IT IS NOT RELABELLED "Vision", because the source does not call it
   that and this site quotes rather than improves (SOURCE-FACTS: "use these,
   don't improve on them"). A real Vision statement needs one sentence from the
   owner; nothing in the record supplies it, and inventing one here would be the
   single easiest thing on this site to catch out.

   ★ AD-28 — RETRACTED: "the Jagdamba Camp school".
   An `.a-what` block used to sit between the quotation and the three pillars,
   carrying the SEO phrase `community organisation` (AD-27.47) over a sentence
   that named "the Jagdamba Camp school". NO SOURCE SAYS THAT. SOURCE-FACTS
   §90–91 has a volunteer school on the YAMUNA'S BANKS in 2007, and children
   FROM Jagdamba Camp joining ME to WE in 2009; the block welded the two into an
   institution that exists in neither. Its own footnote then asserted "each
   clause traceable" and hung page numbers off the invention, which is how a
   citation ends up dressing a fabrication as a checked fact.

   The owner: "The following is untrue… Who told you Jagdamba camp has a school?"

   BOTH PARAGRAPHS ARE DELETED, NOT REPAIRED, and gate 1d below refuses to write
   the page if the phrase comes back. The SEO phrase is not worth a sentence
   nobody can stand behind. See docs/design/2026-08-23-AD-28-provenance-strip.md §5.

   ★ AD-28 — AND THE SOURCE FOOTNOTES UNDER EVERY BLOCK ARE GONE WITH IT.
   This is an organisational page, not a situation page, so it carries no
   sourcing apparatus at all: no page numbers, no "quoted from", no "not
   paraphrased". The quotations are still quotations — the marks say so — but
   the reader gets the sentence rather than its citation. The band's lead used
   to count its own blocks and explain which were quoted; that is the owner's
   second complaint verbatim, and a band whose lead was pure self-description is
   better with just its heading. */
B.says = () => `${opener('says', 'What we say<br>we are',
  'Swechha works on the environment, both physical and social &mdash; in schools, on the '
  + 'river, and on the land.')}
    <div class="wrap">

      <div class="a-quote">
        <p class="d2 a-q-t">&ldquo;Be the Change&rdquo;</p>
        <p class="body a-q-b">An organisation dedicated to enabling ourselves and others around us to
          Be the Change, in making a visible difference to the Environment &mdash; both Physical and
          Social.</p>
      </div>

      <div class="a-three">
        <h3 class="lbl a-sub">The three it works under</h3>
        <div class="a-three-g">
${PILLARS.map(([n, t]) => `          <div class="a-pil"><p class="a-pil-n">${n}</p><p class="cap a-pil-t">${t}</p></div>`).join('\n')}
        </div>
      </div>

      <div class="a-two">
        <div>
          <h3 class="lbl a-sub">The five themes under those three</h3>
          <ul class="a-list">
${THEMES.map(t => `            <li>${t}</li>`).join('\n')}
          </ul>
          <p class="cap a-q-s">Plus one that cuts across all five: <b>Building Narratives for
            Sustainability</b> &mdash; research, communication, advocacy.</p>
        </div>
        <div>
          <h3 class="lbl a-sub">And how it works</h3>
          <ul class="a-list a-list-n">
${WHEEL.map(t => `            <li>${t}</li>`).join('\n')}
          </ul>
          <p class="cap a-q-s">The <i>Wheel of Change</i>.</p>
        </div>
      </div>

      <div class="a-def">
        <h3 class="lbl a-sub">And what it means by the word</h3>
        <p class="lead a-def-t">Change is &ldquo;a transformation in the attitude of the masses, in
          their perceptions and simultaneously in the environment &mdash; both social and human.&rdquo;</p>
      </div>

      <p class="a-foot"><a class="act" href="/work">What that looks like as work ${ARROW}</a></p>
    </div>`;

/* ── BAND 3. THE RECORD. ─────────────────────────────────────────────────
   Five rungs on the rail. GREEN IS LIVE IN THIS BAND AND ONLY THIS BAND
   (§3.2): green means what Swechha has done, which is exactly what a record
   is, and it lands on the one rung that is not a historical event. The rail is
   the frozen contract's `rl` class; the year sits in the rail's left column at
   figure weight so the column scans as a date spine. */
B.since = () => `${opener('since', 'The record<br>since 2000',
  'A river nobody was cleaning, and what grew out of turning up to clean it.')}
    <div class="wrap">
      <ol class="a-rungs" role="list">
${RUNGS.map(r => `        <li class="a-rung rl${r.green ? ' is-now' : ''}">
          <p class="a-rung-y">${r.year}</p>
          <div class="a-rung-b">
            <p class="a-rung-h">${r.head}</p>
            <p class="body a-rung-t">${r.text}</p>
          </div>
        </li>`).join('\n')}
      </ol>
      <p class="a-foot"><a class="act" href="/impact">What the record adds up to ${ARROW}</a></p>
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
/* ★ AD-27.50 / AD-27.51 — THE NAME IS AN <h3> AND VIMLENDU'S CARRIES AN id.
   AD-27.51's heading rule: band heads are h2 (opener() writes them), component
   heads are h3, no level skipped. A person's name over their role and their own
   description IS a component head, and it was a <p>. `h1,h2,h3{margin:0;
   font-weight:inherit}` is already in the frozen home.html stylesheet, so the
   element change costs nothing visually — verified by capture, not assumed.
   ONLY VIMLENDU CARRIES AN id, and that is deliberate rather than lazy: the SEO
   phrase table (AD-27.47) points `Vimlendu Jha` and half of `Air Pollution
   expert` at /about#vimlendu-jha, and the Person JSON-LD below states the same
   URL, so this heading is the only link target among the sixteen. Giving all
   sixteen an id would also risk the duplicate-id AD-27.51 gate 4 forbids — he
   appears twice on this page, once on staff and once on the governing body. */
const anchorFor = (p) => (p.slug === 'vimlendu' ? ' id="vimlendu-jha"' : '');

const person = (p) => `        <li class="a-p">
          <span class="ht a-p-fig"><img class="duo" src="${p.photo.src}" alt="${esc(p.photo.alt)}" loading="lazy"></span>
          <div class="a-p-b">
            <h3 class="a-p-n"${anchorFor(p)}>${esc(p.name)}</h3>
            <p class="lbl a-p-r">${esc(p.role)}</p>
            ${p.email ? `<p class="cap a-p-e"><a class="lk" href="mailto:${esc(p.email)}">${esc(p.email)}</a></p>` : ''}
${disclose(`About ${esc(p.name.split(' ')[0])}`,
    p.bio.map(t => `<p class="body a-p-x">${esc(t)}</p>`).join('\n            '))}
          </div>
        </li>`;

/* AD-27.39: the lead used to end "The count is in the register at the top."
   There is no register and there is no count. The clause is cut rather than
   rewritten to point somewhere else — a headcount is what the client deleted,
   and a sentence that gestures at one is the same claim with more words. */
B.team = () => `${opener('team', 'Who does<br>the work',
  'Programmes, accounts, the farm and the schools &mdash; the people who run them.')}
    <div class="wrap">
      <ul class="a-people" role="list">
${TEAM.map(person).join('\n')}
      </ul>
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
            <h3 class="a-b-n">${esc(p.name)}</h3>
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
          <p class="a-b-go"><a class="act" href="#team">Their description, with the team ${ARROW}</a></p>`
    /* NO DESCRIPTION, AND NOTHING SAID ABOUT THERE BEING NO DESCRIPTION.
       He is a governing-body member with no bio on the live site's listing, so
       the row carries his name and his role and stops. This used to be a dotted
       hole reading "description not published on this page yet" — AD-28 §2.3:
       where a row has nothing behind it, show less rather than explain the
       absence. Leaving him off the page entirely would still be the worse lie,
       so the row stays. */
    : p.bio_pending
      ? ''
    /* Collapsed, exactly as the team band's are. The first draft left these
       open and the board band measured 3,750px at 375 — on its own, more than
       a third of the whole document, for seven paragraphs almost nobody
       reads top-to-bottom. Same component, same behaviour, both bands. */
      : disclose(`About ${esc(p.name.split(' ')[0])}`,
        p.bio.map(t => `<p class="body a-b-x">${esc(t)}</p>`).join('\n            '))}
          </div>
        </li>`;
};

/* AD-27.39: the lead opened "Eight members, and two of them are also on the
   staff." Both figures are headcounts and both are gone. The FACT they carried
   is not — that some of the governing body are also employed by it is a real
   governance disclosure, and the rows still say which, by name. The count was
   never what made that honest. */
B.board = () => `${opener('board', 'Who governs it',
  'Some of the governing body are also on the staff.')}
    <div class="wrap">
      <ul class="a-board" role="list">
${BOARD.map(boardRow).join('\n')}
      </ul>
    </div>`;

/* ── BAND 6 WAS "WHAT IS CHECKABLE" AND IT IS DELETED (AD-27.41). ────────
   The reasoning is at the top of this file, with the row-by-row account of
   where each of its six facts now lives. Nothing is restored here without
   reading it. */

/* ── BAND 6. TURN UP. ────────────────────────────────────────────────────
   Three doors and one act. Mustard is the only hue in the band and it is on
   the controls, which is what licenses it everywhere else (§3.1). */
/* CANONICAL ROUTES, NOT PROTOTYPE PATHS. These three were written as
   `/design/v3/...` and were the last such hrefs in the finished set —
   `public/design/` is deleted before any deploy (AD-17 §6.4), so each would
   have become a 404 at the port. `The readings` is the situation index the
   nav's `Now` also points at; the other two are homepage bands written
   ABSOLUTELY, which is the same destination from here as from the homepage. */
/* ═══ PERSON JSON-LD — AD-27.50 ══════════════════════════════════════════
   The one piece of structured data on this page, and it is BUILT FROM THE
   DATASET rather than typed, so it cannot drift from the bio rendered two bands
   above it. Name, job title and address all come from data/about-people.json;
   only the four `knowsAbout` subjects and the schema shape are stated here, and
   they are stated in AD-27.50 verbatim.

   ★ WHY `knowsAbout` AND NOT `award`. `knowsAbout` is the honest carrier of the
   client's "Air Pollution expert" phrase: it is a machine statement of subject
   matter, not a superlative, and it is supported by twenty-five years of
   published work on air and the Yamuna. The record WOULD support an award list
   — India Today and Outlook's top-25 youth leaders, the International Youth
   Foundation, CNN International's six changemakers — but an award list in
   structured data is Swechha asserting its own distinctions, whereas the same
   facts inside the man's own quoted bio are attributed to the people who
   awarded them. Same facts, honest voice (AD-27.46).

   ★ THE URL IS ABSOLUTE AND THAT IS THE ONE PLACE ON THIS PAGE IT IS. The
   canonical link is deliberately relative so a preview deploy cannot advertise
   the production host (situation-shell.mjs:754-767); a JSON-LD `url` is an
   identity claim about the person's page on the real site rather than a
   statement about the URL being served, and AD-27.50 states the literal.

   ★ NO `telephone`, NO STREET. G-4 struck the phone number from the site and a
   number in JSON-LD is on the site; the client's new footer sentence
   deliberately drops the street address, and structured data must not
   reinstate what the copy just removed. */
const VJ = TEAM.find(p => p.slug === 'vimlendu');
if (!VJ) {
  console.error('DATA IS WRONG: no team member with slug "vimlendu". The Person JSON-LD, the '
    + 'id="vimlendu-jha" anchor and the SEO phrase table all point at that entry.');
  process.exit(1);
}
const PERSON_JSON = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: VJ.name,
  jobTitle: VJ.role,
  worksFor: { '@type': 'NGO', name: 'Swechha' },
  url: 'https://swechha.in/about#vimlendu-jha',
  email: VJ.email,
  knowsAbout: ['Air pollution', 'River restoration', 'Environmental education', 'Sustainability'],
};
/* Minified to one line, and `<` escaped to < so no value in the dataset can
   ever close the script element early. JSON.stringify's output is otherwise
   already safe inside a script of this type. */
const PERSON_LD = '      <script type="application/ld+json">'
  + JSON.stringify(PERSON_JSON).replace(/</g, '\\u003c') + '</script>';

const DOORS = [
  ['/now', 'The readings', 'Six situations, each against its published limit.'],
  ['/impact', 'The record', 'What the work adds up to.'],
  /* AD-24: `/farm` is a page now, and this door already says "you can come to
     it" — which the homepage band could only promise and the page can answer. */
  ['/farm', 'The farm', 'Five acres, an hour and a half from Delhi. You can come to it.'],
];

/* ★ AD-27.18 — THE SITE'S ONLY MEDIA DOOR IS HERE, AND THAT IS THE RULING.
   A journalist looks for the organisation, not for a programme, so of the four
   audiences the Ask serves — school, funder, institution, media — media gets
   exactly one placement on the whole site and it is this band. It is also the
   only Ask on this page: AD-27.18 caps a page at two and this page has one ask
   to make.

   ★ IT UPGRADES A CONTROL, IT DOES NOT ADD ONE (AD-27.19). The band shipped
   two buttons: "Give monthly" as the primary and "Write to us" — a bare
   mailto: to the general address, no subject, no body, no named recipient — as
   the secondary. The Ask REPLACES "Write to us". That is a straight upgrade for
   every reader, not only journalists: it names the person who reads it, arrives
   with the subject line already sorted and the body already structured, and
   prints the address in plain text for anyone whose device has no mail client.
   The general address is not lost — the frozen footer carries it on all 35
   pages, and AD-27.17 rules that swechhaindia@gmail.com may never carry an Ask
   in any case, because it fails about-people.json's email_policy.

   ★ THE ASK TAKES `.b-1` AND GIVE STEPS DOWN TO `.b-2` (AD-27.15, BRANDING
   §5.8: one primary per band). It is placed BELOW the doors and ABOVE Give, so
   the mustard chip reads primary-then-secondary down the column, and so that
   opening the panel pushes Give down rather than opening underneath it.

   ★ THE LABEL IS THE ONE PIECE OF COPY AD-27.17 DOES NOT FIX. The four subject
   patterns and the four bodies are fixed text; the summary label is
   per-placement ("Book a walk", "Bring your school"). "Ask for an interview" is
   an ask rather than a page name, it is what the media body's own fields are
   for (publication, what you are working on, your deadline), and it promises
   nothing about when — AD-27.17 forbids a turnaround claim anywhere. */
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
${ask({ audience: 'media', label: 'Ask for an interview', page: 'About Swechha', path: '/about', level: 1 })}
      <p class="a-foot a-foot-2"><a class="b b-2" href="/act">Give monthly</a></p>
${PERSON_LD}
    </div>`;

/* ═══ PAGE CSS ════════════════════════════════════════════════════════════
   NO BACKTICKS ANYWHERE BELOW — this block is one template literal and a
   backtick in a comment silently terminates it. Three builds on this project
   were broken that way.
   Everything here is an `a-` component. Tokens are never re-typed: sizes come
   off the type scale's clamps and colours off the ink tables, and each paper
   band restates its ink because the same component runs on both grounds. ── */
const PAGE_CSS = `
/* ── THE HERO'S UNDER-BAND. ONE COLUMN, AND THE MISSION IS ITS ARRIVAL.
      AD-27.39 deleted the two-column split: the right-hand column held
      ".a-hero-reg", the four-figure "This page, counted" register, and the
      client deleted the device. What is left is a single stack — the eyebrow,
      the gloss on the masthead word, then the mission at display level under a
      full-measure rule.
      THE RULE IS FULL WIDTH AND THE TYPE IS NOT. ".a-mis-b" states no
      max-width, so its 2px top rule runs the whole ".wrap" and the block reads
      as a masthead statement across the measure; the sentence itself is capped
      at 40ch, which at 44px sets it in three lines at 1440. That combination is
      what stops the under-band reading as an empty right-hand half now that the
      register has gone — the emptiness was the risk AD-27.58 named for this
      lane, and it was read off the capture rather than assumed.
      ".a-quote" and ".a-def" in the next band already use exactly this device
      (2px rule, padding, display type inside it), so no component is invented. */
.a-eye{color:var(--fg-3);margin:0 0 clamp(14px,1.8vw,22px)}
.a-lede{margin:0 0 clamp(26px,3vw,44px);max-width:44ch}
.a-lede i{font-style:italic}
.a-mis-b{border-top:2px solid var(--hair);padding-top:clamp(16px,1.9vw,26px)}
.a-mis{color:var(--fg);margin:0 0 clamp(12px,1.4vw,18px);max-width:40ch}
.a-mis-src{color:var(--fg-3);margin:0;max-width:52ch}

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
/* ★ THE RUNGS ARE ALL ONE WIDTH, AND THAT NEEDS SAYING OUT LOUD.
   .a-rung also carries the frozen contract's .rl class, and home.html:267
   defines .rl with width:max-content — correct for a readout,
   where the rule under a numeral should be exactly as wide as the numeral, and
   wrong here, where the rule is a SEPARATOR between rows and every row's has to
   line up. Until AD-28 all four rungs happened to be the same width because
   every one of them wrapped past the 56ch measure. Deleting one fabricated
   sentence made the 2016 rung a single short line, its box shrank to 568px
   against its neighbours' 666, and its hairline stopped 98px short. Found by
   reading the screenshot, not by a measurement — nothing was overflowing and no
   check was failing.
   .a-rungs shrink-wraps to the widest rung and each rung fills it, so the
   hairlines stay the deliberate short length they had (they end just past the
   text column, not at the band edge) and are all identical whatever the copy
   does. The frozen .rl is not touched. */
.a-rungs{list-style:none;margin:0;padding:0;width:max-content;max-width:100%}
.a-rung{display:grid;grid-template-columns:minmax(0,1fr);gap:4px clamp(16px,2vw,30px);
  border-top:1px solid var(--hair);padding:clamp(16px,1.9vw,24px) 0;width:100%}
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

/* AD-27.41 deleted the legal band, and ".a-legal", ".a-legal-r", ".a-legal-k",
   ".a-legal-v", ".a-legal-s", ".a-holes" and ".dark-2 .a-src" went with it.
   They are deleted rather than left inert: this repository has twice been bitten
   by CSS that outlived its markup (".delayed", ".rise") and BRANDING §7.2 only
   licenses dead code where it is NAMED as dead. This comment is the naming, and
   there is nothing left to name. The page no longer has a "dark-2" ground at
   all, which is why the last of those four selectors could not match anything
   even if a later band wanted it. */

/* ── BAND 6. THREE DOORS. The door-card grammar: a ruled row that is entirely
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
  .a-b{grid-template-columns:minmax(0,14em) minmax(0,1fr)}
  .a-rung{grid-template-columns:minmax(0,4.6em) minmax(0,1fr)}
  .a-three-g{grid-template-columns:repeat(3,minmax(0,1fr))}
  .a-doors{padding:0}
}
@media (min-width:900px){
  /* ".a-hero" and ".a-regs" both lived here and both are gone with AD-27.39's
     register. The hero's under-band is a single stack at every width now. */
  .a-two{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}
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
.a-p-b,.a-b-c,.a-rung-b{min-width:0}

`;

/* ═══ WRITE ══════════════════════════════════════════════════════════════
   ★ AD-27.47 / AD-27.48 — THE TITLE AND THE DESCRIPTION.
   The title was "About — Swechha", which says nothing a search result reader
   could act on and competes with nothing. AD-27.47 gives this page two phrases
   from the client's list: `India's top 5 environment ngo` and
   `community organisation`. NEITHER SUPERLATIVE IS ASSERTED — AD-27.46 is
   absolute that this site never calls itself the best or the top five in its
   own voice, because a lie in a meta description would be the single easiest
   thing on this site to check and it would discredit every sourced figure on
   it. The query is earned instead by the attributed third-party record already
   rendered in the bios (India Today and Outlook's top-25 youth leaders, 2004;
   CNN International's six worldwide changemakers) and by AD-27.47's new #says
   sentence.
   THE EM DASH IS A LITERAL, NOT `&mdash;` (AD-27.48's convention fix). The 15
   WORK pages already use the literal; the render is identical and the drift is
   not.
   THE DESCRIPTION carries one verifiable fact — founded in 2000 as We for
   Yamuna, which is this page's own first record rung — and nothing tensed,
   dated or specimen, per BRANDING §3.5 applied to <head>.
   BOTH `title` AND `desc` NOW COME FROM data/seo/pages.json (`seo('/about')`)
   rather than literals here: this generator used to keep its own description
   wording, different from situation-shell.mjs's now-deleted DESCRIPTIONS row
   for the same route, and the two answers for one page were exactly the
   drift the register exists to kill. The title had no such second copy
   elsewhere, but the register is the one place every page's head text is
   meant to live (spec §3.1), so it is looked up the same way.
   `desc` is consumed by situation-shell.mjs's assemble(), which lane 1 is
   adding it to in this same pass (AD-27.48). Gate 12 below refuses the page if
   it did not reach the HTML, because a description that is passed and silently
   dropped looks exactly like a description that is there. */
const OUT = await S.assemble({
  file: 'about.html',
  route: '/about',
  title: seo('/about').title,
  desc: seo('/about').description,
  bands: BANDS, index: INDEX, sh, clashes,
  pageCss: PAGE_CSS,
  sectionFor: (id) => (B[id] || (() => '    <div class="wrap"><p class="lead">&mdash;</p></div>'))(),
  /* The counts survive HERE and only here. AD-27.39 removed them from the page,
     not from the build log: whoever runs this build still needs to see that the
     dataset moved, and a line in a terminal is not a claim on a website. */
  note: `${BANDS.length} bands + footer. ${TEAM.length} on staff, ${BOARD.length} on the `
      + `governing body, ${BOTH.length} both — none of which reaches the HTML (AD-27.39). `
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

//    1c. NO HEADCOUNT OF STAFF OR BOARD REACHES THE HTML — AD-27.39.
//        THIS IS THE OLD GATE INVERTED, and inverting it rather than deleting
//        it is the whole point: a gate that was proving four figures correct
//        must not be left proving a DELETED figure correct, and a gate that is
//        simply removed lets the sentence grow back the first time somebody
//        writes a warm opening line about the size of the team.
//        Checked two ways. Structurally, on the component that carried the
//        register — that catches a revert. And on the prose, in both word
//        orders, against the three counts this dataset actually produces in
//        every form they could be written in ("8", "eight", "Eight"). Only
//        those three numbers are searched: a general "any digit near the word
//        people" gate would fire on the quoted bios, which are somebody else's
//        words and are not this page speaking.
/* Both halves run on the DOCUMENT WITHOUT ITS STYLESHEET. The first draft ran
   on the whole file and failed on its own prose: the comments in PAGE_CSS
   explain what AD-27.39 deleted and therefore name ".a-hero-reg" and "This page,
   counted", and BAND 4's heading comment reads "THE PEOPLE, ON PAPER-2", which
   is a noun and a number thirty characters apart. A gate that cannot be
   explained in the file it guards is a gate that gets deleted. */
const BODY = OUT.replace(/<style>[\s\S]*?<\/style>/, '');
/* RENDERED TEXT — the copy-voice gates (1d, 1e) run on this and not on BODY,
   because BODY still carries class names, hrefs and the JSON-LD block, any of
   which can fake a match. Script and style out, tags out, entities back. */
const RENDERED = BODY
  .replace(/<script[\s\S]*?<\/script>/g, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&(?:amp|lt|gt|quot|rsquo|lsquo|ldquo|rdquo|mdash|ndash|nbsp|middot|hellip);/g, ' ')
  .replace(/\s+/g, ' ');
gate(!/a-hero-reg|a-regs|a-reg-v|This page, counted/.test(BODY),
  'the four-figure register is gone from the markup, not merely hidden');
const HEAD_NOUN = '(?:members?|people|persons?|staff|colleagues|employees|trustees|governing body)';
const HEAD_NUMS = [...new Set([TEAM.length, BOARD.length, BOTH.length]
  .flatMap(n => [String(n), word(n)]))].join('|');
const HEADCOUNT = new RegExp(
  `\\b(?:${HEAD_NUMS})\\b[^.<>]{0,30}\\b${HEAD_NOUN}\\b`
  + `|\\b${HEAD_NOUN}\\b[^.<>]{0,30}\\b(?:${HEAD_NUMS})\\b`, 'ig');
const headcounts = [...BODY.matchAll(HEADCOUNT)].map(m => m[0].replace(/\s+/g, ' '));
gate(headcounts.length === 0,
  `no headcount of staff or governing body reaches the page${headcounts.length
    ? `; FOUND: ${headcounts.map(h => JSON.stringify(h)).join(' | ')}` : ''}`);

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

// 1d. THE JAGDAMBA FABRICATION CANNOT COME BACK — AD-28 §5.
//     "the Jagdamba Camp school" was an institution welded out of two adjacent
//     true facts in SOURCE-FACTS §90–91 (a volunteer school on the Yamuna's
//     banks in 2007; children FROM Jagdamba Camp joining ME to WE in 2009).
//     The owner: "Who told you Jagdamba camp has a school?" Nobody did.
//     The sentence is retracted, and this refuses to write the page if any
//     phrasing that makes Jagdamba Camp the site of a school reappears. Tested
//     on rendered text so a class name cannot trip it, and deliberately loose
//     about the words between: it is the ASSOCIATION that is false, not one
//     particular way of typing it.
gate(!/Jagdamba[^.]{0,40}\bschool\b|\bschool\b[^.]{0,40}Jagdamba/i.test(RENDERED),
  'the retracted "Jagdamba Camp school" has not come back (AD-28 §5)');

// 1e. AND NO SOURCING APPARATUS ON THIS PAGE AT ALL — AD-28 §2.2.
//     /about is an organisational page, not a situation page, so it carries no
//     citations, no page numbers, no "quoted from", no repo paths. Any of these
//     reappearing means the provenance voice is growing back.
const appar = [
  [/SOURCE-FACTS/i, 'SOURCE-FACTS'], [/§/, 'a § citation'],
  [/\bp\d+(&ndash;|–|-)\d+\b|\bp\d+\b(?![\w-])/, 'a page-number citation'],
  [/Not paraphrased|quoted rather than written|each clause traceable/i, 'a "how this was written" note'],
  [/data\/[a-z-]+\.json/i, 'a repository path'],
  [/\b(?:AD|D|W|F|R)-\d/, 'an internal ledger reference'],
].filter(([re]) => re.test(RENDERED));
gate(appar.length === 0,
  `no sourcing apparatus in the page's own voice${appar.length ? `; FOUND: ${appar.map(a => a[1]).join(', ')}` : ''}`);

// 6. NO HOLE MARKER AT ALL — AD-28 §2.3, AND THIS GATE IS THE OLD ONE INVERTED.
//    It used to assert that the count of dotted `.p-hole` markers EQUALLED the
//    number of board rows with no published bio: a gate whose whole job was to
//    prove the absence-explanations were present. The owner struck the style,
//    so the same gate now proves they are gone. Inverted rather than deleted on
//    purpose (AD-28 §6): a deleted gate is how the style grows back the first
//    time somebody adds a person with no bio and writes a kind sentence about
//    why the cell is empty. `${BOARD.filter(p => p.bio_pending).length}` row(s)
//    currently have no bio; they render as name and role, and say nothing else.
gate(!OUT.includes('class="p-hole"'),
  'no dotted hole marker on the page — an empty row shows less, it does not explain itself');

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

// 10. THE ASK — AD-27.22's four assertions, run from the shell so that the
//     same four run identically wherever an Ask is emitted. `allowed` is left
//     empty on purpose: about-people.json names swechhaindia@gmail.com as a
//     published exception for the FOOTER's general address, but this page's
//     body must not carry it — AD-27.17 rules that address may never carry an
//     Ask, and the "Write to us" button that used to publish it here is the
//     control the Ask replaced. The extracted footer is not part of this check
//     because it is chrome; the check runs on the whole document, so if the
//     footer ever grows a body-level mailto this fires and it should.
askGates(OUT, gate, { allowed: ABOUT.published_email_exceptions || [] });

// 10b. THE MEDIA ASK IS THE ONE ASK ON THIS PAGE, and it is media. AD-27.18
//      gives media exactly one placement on the whole site; if this page ever
//      grows a school or funder Ask, the site's only media door has quietly
//      been demoted to second control in the band.
const audiences = [...OUT.matchAll(/<details class="ask" data-ask="([^"]*)"/g)].map(m => m[1]);
gate(audiences.length === 1 && audiences[0] === 'media',
  `exactly one Ask on /about and it is the media one (found: ${audiences.join(', ') || 'none'})`);

// 10c. THE ASK IS STYLED. This page inherits AD-27.16's CSS from
//      situation-shell.mjs (lane 1's copy) and deliberately does not carry a
//      second copy. If that block is ever moved or renamed, the markup still
//      renders — as an unstyled disclosure with a mustard button that no longer
//      looks like one — and nothing else on the page would say so. That is
//      exactly the "degrades quietly" failure the shell's own header warns
//      about, so it is checked rather than trusted.
/* CHECKED ON RULES, NOT ON THE COMMENT ABOVE THEM (AD-28 §7). This gate used
   to look for the string "AD-27.16 THE ASK" — the sentinel COMMENT at the head
   of the shell's Ask block. That comment is now stripped out of every emitted
   stylesheet, so the gate was asserting the presence of a thing the build is
   required to remove: it went red the moment the strip landed, on a page whose
   Ask is perfectly styled. Two selectors that only that block emits say the
   same thing and cannot be stripped, because they are the CSS itself. */
gate(OUT.includes('.ask[open]>.ask-s .ask-ar') && OUT.includes('.ask-a .lk::after'),
  'AD-27.16\'s Ask CSS arrived from situation-shell.mjs (no second copy in this file)');
/* AND THE INVERSE, which is the gate AD-28 §6 asks for: the sentinel comment
   must NOT be on the page. It is the design record, it belongs in the .mjs, and
   if it comes back the strip has stopped running. */
gate(!OUT.includes('AD-27.16 THE ASK'),
  "the Ask CSS's sentinel comment is stripped out of the emitted stylesheet (AD-28 §7)");
gate(!/\.ask\{margin/.test(PAGE_CSS), 'this file carries no second copy of the Ask CSS');

// 11. PERSON JSON-LD — AD-27.50. Parsed rather than pattern-matched, because a
//     malformed blob is invisible to a reader, invisible in a capture, and
//     silently ignored by every consumer it was written for.
const ld = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(OUT);
let ldOk = false;
let ldWhy = 'no application/ld+json block on the page';
if (ld) {
  try {
    const parsed = JSON.parse(ld[1].replace(/\\u003c/g, '<'));
    const problems = [];
    if (parsed['@type'] !== 'Person') problems.push(`@type is ${parsed['@type']}`);
    if (parsed.name !== VJ.name) problems.push('name does not match the dataset');
    if (parsed.jobTitle !== VJ.role) problems.push('jobTitle does not match the dataset');
    if (parsed.email !== VJ.email) problems.push('email does not match the dataset');
    if (!/#vimlendu-jha$/.test(parsed.url || '')) problems.push('url does not end at the anchor');
    if ('award' in parsed) problems.push('award is used — AD-27.50 refuses it');
    if ('telephone' in parsed) problems.push('telephone is used — G-4 struck the number');
    ldOk = problems.length === 0;
    ldWhy = problems.join('; ');
  } catch (e) { ldWhy = `does not parse: ${e.message}`; }
}
gate(ldOk, `Person JSON-LD is valid and agrees with the dataset${ldOk ? '' : `; ${ldWhy}`}`);
gate((OUT.match(/id="vimlendu-jha"/g) || []).length === 1,
  'the id="vimlendu-jha" anchor the JSON-LD and the SEO phrase table point at exists, exactly once');

// 12. THE DESCRIPTION REACHED THE HTML — AD-27.48. `desc` is passed to
//     assemble(); until lane 1's parameter lands, an unknown key is silently
//     dropped and the page ships with no description at all, which looks
//     identical from in here. 140-158 characters is AD-27.48's own band.
const descTag = /<meta name="description" content="([^"]*)"/.exec(OUT);
gate(!!descTag, 'a <meta name="description"> reached the head');
if (descTag) {
  const n = descTag[1].length;
  gate(n >= 140 && n <= 158, `the description is ${n} characters (AD-27.48 wants 140-158)`);
  gate(!/\b(?:today|currently|this year|DEMO DATA)\b/i.test(descTag[1]),
    'the description carries no tensed claim, reading or specimen (BRANDING §3.5 in <head>)');
}
gate(/<title>[^<]*—[^<]*<\/title>/.test(OUT) && !/<title>[^<]*&mdash;/.test(OUT),
  'the title uses a literal em dash, not the entity (AD-27.48)');

// 13. HEADING HIERARCHY — AD-27.51. One h1, no level skipped in document
//     order, no duplicate id. Run on the WHOLE document, chrome included,
//     because a heading in the extracted footer counts against the same rules.
const heads = [...OUT.matchAll(/<h([1-6])[\s>]/g)].map(m => Number(m[1]));
gate(heads.filter(n => n === 1).length === 1, `exactly one h1 (found ${heads.filter(n => n === 1).length})`);
let skipped = null;
for (let i = 1; i < heads.length; i++) {
  if (heads[i] > heads[i - 1] + 1) { skipped = `h${heads[i - 1]} -> h${heads[i]} at heading ${i + 1}`; break; }
}
gate(!skipped, `no heading level is skipped in document order (${heads.length} headings)${skipped ? `; SKIP: ${skipped}` : ''}`);
const allIds = [...OUT.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
const dupeIds = [...new Set(allIds.filter((v, i) => allIds.indexOf(v) !== i))];
gate(dupeIds.length === 0, `no duplicate id on the page${dupeIds.length ? `; DUPES: ${dupeIds.join(', ')}` : ''}`);

// 14. `aria-current` MARKS NOTHING IN THE PRIMARY NAV — AD-27.3 and AD-27.42.
//     About is not a nav word: AD-27.9 puts it in the footer instead, so
//     lighting the nearest word would be false, and §5.10 is explicit that
//     pointing aria-current at the wrong section is worse than pointing it
//     nowhere. The page's own .navscroll chips are a different control and are
//     not touched by this.
const navBar = /<nav class="navlinks"[\s\S]*?<\/nav>/.exec(OUT);
gate(navBar && !navBar[0].includes('aria-current'),
  'no primary nav word is marked aria-current on /about (AD-27.3: a page that marks nothing is a legitimate state)');

// 15. AD-27.47's SENTENCE IS *OFF* THE PAGE — THIS GATE IS INVERTED (AD-28 §5).
//     It used to assert `OUT.includes('Swechha is a community organisation')`:
//     a gate holding an SEO phrase onto the page. The sentence it held on
//     fabricated "the Jagdamba Camp school", so the same gate now holds it off.
//     Gate 1d above covers the false association; this covers the sentence that
//     carried it, because the SEO phrase is the reason somebody will want to
//     write it again. If `community organisation` is ever worth owning, it has
//     to be earned by a true sentence, and that sentence needs a source first.
// 15b. EVERY RUNG ON THE DATE SPINE HAS A YEAR — AD-28.
//      A rung with an empty year cell renders as a gap in a column of dates and
//      reads as a fault. The CNN rung was given `year: null` when its year could
//      not be settled between three sources on this page, and the screenshot at
//      1440 showed the blank cell was louder than anything else in the band. The
//      rung was deleted instead. This stops the next attempt at the same fix.
gate(RUNGS.every(r => r.year), `all ${RUNGS.length} rungs carry a year on the spine`);

gate(!/Swechha is a community organisation/i.test(RENDERED),
  'the retracted AD-27.47 community-organisation sentence is not on the page (AD-28 §5)');
gate(!/\bvision\b/i.test(BODY),
  'no Vision statement is invented (AD-27.40 — "Be the Change" is not relabelled)');
gate(OUT.includes('Our mission is'), 'the mission sentence is kept (AD-27.40)');
gate(/<p class="d2 a-mis">/.test(OUT), 'the mission is set at .d2 display level (AD-27.39)');

if (fail) {
  console.error(`\n${fail} gate(s) failed. The file is written — fix the generator and rebuild.`);
  process.exit(1);
}
console.log(`\n${OUT.length.toLocaleString('en-IN')} bytes. All gates pass.`);
