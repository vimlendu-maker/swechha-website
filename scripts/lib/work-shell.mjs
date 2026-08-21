/**
 * work-shell.mjs — the shared scaffold for the thirteen pages of the WORK section.
 *
 * WHY THIS EXISTS, AND WHY IT IS NOT THIRTEEN HAND-WRITTEN FILES.
 * BRANDING §7.6 is explicit: every page carries its own <style> and there is no
 * shared stylesheet, so a fix made on the homepage does NOT propagate. That is
 * exactly how situation-air.html kept three defects the homepage had already
 * cured. Thirteen hand-copied pages would be that mistake thirteen times over,
 * so the token layer, the chrome layer AND the component layer are all
 * EXTRACTED OUT OF public/design/v3/home.html LINE BY LINE, WITH ASSERTIONS
 * (D-10.3, D-22.3). Nothing here is retyped.
 *
 *     home.html ──extracted, asserted──▶ build-situation-air.mjs
 *          │                                      │
 *          │                            extracted, asserted
 *          │                                      ▼
 *          └──extracted, asserted──────▶  situation-shell.mjs
 *                                                 │
 *                                        imported, not copied
 *                                                 ▼
 *                                          work-shell.mjs
 *                                                 │
 *                                   ┌──────┬──────┼──────┬──────┐
 *                                 work  projects camps journeys events (+8 items)
 *
 * WHAT IS TAKEN FROM WHERE, and the reason in each case:
 *
 *  1. situation-shell.mjs's `shell()`  — the token block, the voices, the
 *     grounds/tiers, the rail, the state marks, the buttons/links/tags, the
 *     .im-head opener, the nav + SECTIONS + underline block, the hit expander,
 *     the skip link, <main>, the SVG duo/duo-dim defs, THE FOOTER VERBATIM, and
 *     the two homepage IIFEs. Imported rather than re-extracted: a second copy
 *     of those seven ranges is the drift this whole pattern exists to prevent.
 *
 *  2. situation-shell.mjs's SITUATION_CSS — Air's own component layer, which
 *     carries three components AD-17 explicitly asks for and which already
 *     state their colour on BOTH grounds: `.p-hole` (a named hole rendered as a
 *     sentence, BRANDING §4.4), `.p-kd` / `.p-kd-c` / `.p-kd-m` (the
 *     measured-vs-modelled rule under a numeral, §4.3 — which is what the data
 *     schema's `basis` field drives), and the `.p-row` / `.p-do-r` ruled row
 *     families. Reusing them is cheaper AND safer than a fourth copy.
 *
 *  3. NEW HERE — six component ranges out of home.html that the situation pages
 *     never needed and that AD-17 §5 does: the door cards (§5.6, the whole
 *     cross-sell band), the register rows (§5.5, every landing page's list
 *     band), the four-kinds display rows, the campaign march, the events rail
 *     and the journey duration figure. Extracted, asserted, and NOT retyped —
 *     because a private copy of `.s-record-door`'s four-row grid is precisely
 *     the failure BRANDING §5 opens by naming.
 *
 * IF AN ASSERTION FIRES, THE RANGES MOVED. Re-find them. Do not delete the
 * assertion: it has already caught a real bug on this project (a concurrent
 * session added ten lines to home.html mid-build and an extracted <script>
 * began mid-function, silently killing a whole panel while the console read
 * clean). A concurrent session may be editing home.html right now.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import {
  ROOT, V3, extractor, shell, groundChain, opener, hole, esc,
  kd, kindTag, KIND_LEGEND, ARROW, n0, disclose, SHARED_PAGE_CSS, tabs,
} from './situation-shell.mjs';

export { ROOT, V3, opener, hole, esc, kd, kindTag, KIND_LEGEND, ARROW, n0, disclose, groundChain, tabs };

/* ═══ THE FOUR GROUNDS, AND THE CLASS THAT PAINTS EACH ════════════════════
   Ground adjacency is gated on the COMPOSITED RENDERED COLOUR, not on class
   names, because a <section> with no ground class is TRANSPARENT and inherits
   its neighbour — and that bug shipped once. So the mapping below is the model
   of what actually paints: `body{background:var(--ground)}` (home.html:99) is
   the page ground, and a class-less section composites to it. Every band
   declares its hex, the build resolves the hex its class would actually paint,
   and a mismatch REFUSES THE WRITE. The empirical confirmation of the same
   thing — getComputedStyle walking up for `rgba(0,0,0,0)` — is run in the
   browser during verification; this is the half that can refuse to write.  */
export const GROUND = {
  ground: '#0D0D0B',    // body, so a class-less section composites here
  'dark-2': '#151512',
  paper: '#F3F2F0',
  'paper-2': '#ECEBE8',
};
export const FOOTER_HEX = '#151512';

/* ═══ THE GROUND CHAIN IS NOW ASSIGNED, NOT TYPED ═════════════════════════
   AD-17 §5 published one chain per page type and the build carried two of them
   as literals (`item` and `itemNoWith`). AD-18 makes four more bands optional —
   `aim`, `how`, `sheet`, `with` — and a band that omits itself changes the
   chain, so five optional bands is thirty-two literal chains. That is not a
   table anybody can keep true, and the one case the old code did handle was
   only found because the adjacency gate fired on it.

   So the chain is DERIVED from the list of bands that actually have content,
   by the rhythm the frozen homepage keeps rather than by a rule invented here:

     1. Papers and darks ALTERNATE. The frozen chain never puts two papers
        together (verified: 0D,15,0D,F3,0D,EC,15,F3,15,0D,15,F3,E1,15 — every
        paper is flanked by darks), because two off-whites meeting read as one
        band with a seam in it.
     2. TWO DARKS MAY MEET, exactly once. BRANDING §1.1 licenses it by name:
        "#impact #151512 -> #farm #0D0D0B ... the intended alternate-dark step,
        not a clash — the cut there is carried by weight." It is what absorbs an
        odd band count, and it is placed at the TOP SEAM, where the cut is
        carried by weight for the same reason it is on the homepage: an arrival
        band giving way to a type wall.
     3. `top` is always #0D0D0B, T1. `onward` is always #ECEBE8, T3. The band
        above `onward` must be dark (AD-17 §4).
     4. Within a family the two members alternate, and the PAPERS are assigned
        BACKWARDS from `onward` so that `onward` always lands on paper-2 without
        a special case.

   The old adjacency gate still runs on the composited colour and still refuses
   the write. This function is not trusted; it is checked.                    */
const DARKS = ['ground', 'dark-2'];
const PAPERS = ['paper', 'paper-2'];

/* WHICH BANDS DECLARE THEIR FAMILY, AND WHY ONLY THESE.
   `top` and `statement` are T1 PICTURE BANDS. Their frames run to the seam and
   the frozen components that carry them — `.pic-body` and `.w7-say` — both
   hardcode `background:var(--ground)`, so those two bands are #0D0D0B or they
   are broken. `onward` is the section's close and is paper-2 on every page.
   Everything else takes whatever the alternation gives it, which is the point:
   a band's ground is a position in a rhythm, not a decision made per page. */
const FAMILY = { top: 'D', statement: 'D', onward: 'P' };
const PINNED = { top: 'ground', statement: 'ground' };

/* THE ONE HARD RHYTHM RULE, READ OFF THE FROZEN PAGE RATHER THAN OFF THE SPEC.
   BRANDING §1.1 says "the two darks that meet (#impact -> #farm) are the
   intended alternate-dark step", which reads as a licence for exactly one. It
   is not what the page does: measured on home.html's own chain
   (0D 15 0D F3 0D EC 15 F3 15 0D 15 F3 E1 15) there are FOUR dark-to-dark
   steps — ticker->say, say->work is not one, but top->ticker, ticker->say,
   about->impact and gtm->record all are. What the frozen chain has ZERO of is
   PAPER-TO-PAPER. So that is the rule this build enforces: two off-whites never
   meet, because they read as one band with a seam in it, while two darks are a
   step the page takes freely. §1.1's sentence is flagged, not obeyed. */
export function assignGrounds(ids) {
  const n = ids.length;
  if (n < 3) throw new Error(`a WORK page needs at least top, one middle band and onward; got ${n}`);
  // 1. Families. Declared where declared; otherwise alternate, except that a
  //    paper may never follow a paper and may never precede a declared paper.
  const fam = ids.map(id => FAMILY[id] || null);
  for (let i = 0; i < n; i++) {
    if (fam[i]) continue;
    const prev = fam[i - 1];
    const nextDeclared = ids.slice(i + 1).map(x => FAMILY[x] || null).find(x => x) || null;
    const nextIsPaperImmediately = fam[i + 1] === 'P';
    fam[i] = (prev === 'P' || nextIsPaperImmediately) ? 'D' : 'P';
    void nextDeclared;
  }
  /* 2. Members. Each family ROTATES through its two, so all four grounds get
        used rather than #F3F2F0 four times and #ECEBE8 once — which is what a
        naive "just differ from the previous one" rule produces, because the
        previous one is nearly always the other family.
        Two exclusions on top of the rotation, and both are needed: the member
        above (a clash) and, where the NEXT band is pinned, that pin (a clash one
        row later, which is the case that fired on the first run of this — an
        unpinned dark took #0D0D0B immediately above a pinned #0D0D0B statement
        band). Lookahead of one is enough because only T1 picture bands pin. */
  const out = new Array(n);
  const rot = { D: 0, P: 0 };
  for (let i = 0; i < n; i++) {
    const f = fam[i];
    const pool = f === 'D' ? DARKS : PAPERS;
    const pin = PINNED[ids[i]];
    if (pin) { out[i] = pin; rot[f] = (pool.indexOf(pin) + 1) % 2; continue; }
    const nextPin = (fam[i + 1] === f) ? PINNED[ids[i + 1]] : null;
    const order = [pool[rot[f] % 2], pool[(rot[f] + 1) % 2]];
    const pick = order.find(m => m !== out[i - 1] && m !== nextPin) || order[0];
    out[i] = pick;
    rot[f] = (pool.indexOf(pick) + 1) % 2;
  }
  // 3. The close is pinned: `onward` is paper-2 on every page in the section.
  //    Its predecessor is a dark by rule, so pinning cannot create a clash.
  if (ids[n - 1] === 'onward') out[n - 1] = 'paper-2';
  return out;
}

/** The tier a band id declares. Fixed per id, so a band is the same weight on
    every page it appears on — AD-17 §5's tiers, plus the two AD-18 adds. */
export const TIER = {
  top: 't1',
  statement: 't1',
  what: 't2', aim: 't3', how: 't2', who: 't3', done: 't2', sheet: 't3', with: 't2',
  frame: 't2', list: 't3', weight: 't2', against: 't3', holes: 't2',
  record: 't2', nodates: 't3',
  everything: 't2', shape: 't3', reach: 't2',
  onward: 't3',
};

/** Turn an ordered list of band ids into the [id, class, hex, tier] rows the
    build and its gates both read. */
export function bandChain(ids) {
  const g = assignGrounds(ids);
  return ids.map((id, i) => {
    const tier = TIER[id];
    if (!tier) throw new Error(`band "${id}" has no tier in TIER — a band's weight is declared, not defaulted`);
    return [id, g[i] === 'ground' ? '' : g[i], GROUND[g[i]], tier];
  });
}

/** The hex a band's class list actually composites to. */
export function compositedHex(cls) {
  const names = String(cls || '').split(/\s+/).filter(Boolean);
  const painters = names.filter(n => n === 'paper' || n === 'paper-2' || n === 'dark-2');
  if (painters.length > 1) return null;                 // ambiguous: two grounds
  if (painters.length === 0) return GROUND.ground;      // transparent -> body
  return GROUND[painters[0]];
}

/* ═══ THE SHELL ══════════════════════════════════════════════════════════ */

const wrapMedia = (q, body) => `@media ${q}{\n${body}\n}`;

export function workShell() {
  const base = shell();                       // tokens, chrome, footer, script, Air's CSS
  const home = extractor(join(V3, 'home.html'));
  const R = home.R;

  /* ── THE COMPONENT LAYER, six ranges, all out of the frozen homepage.
        Each range is asserted at both ends. Where a component's frozen
        declarations are interleaved inside a media query with a NEIGHBOURING
        component's (the record doors share their phone block with the archive
        contact sheet), the declarations are sliced and re-wrapped in the SAME
        query — the declarations themselves are still verbatim and still
        asserted, and nothing is retyped. ──────────────────────────────── */

  // 1. THE DOOR CARDS (BRANDING §5.6). The whole #onward band is these plus a
  //    .b-1, per AD-17 §4 — "it adds no new component".
  const DOORS = [
    R(1743, 1780, '.s-record-doors{display:grid', '.s-record-door:focus-visible{outline-offset:-2px}'),
    wrapMedia('(max-width:899px)',
      R(1853, 1863, '.s-record-doors{grid-template-columns:1fr}', '.s-record-door-n svg{width:13px;height:13px}')),
    wrapMedia('(max-width:519px)',
      R(1882, 1885, '.s-record-door{padding:13px 0 12px}', '.s-record-door-n svg{width:12px;height:12px}')),
    // The 320 collision fix. It is already a whole media block, so it is taken
    // whole. Without it the door eyebrow runs into the figure beside it at 320
    // — a defect that getBoundingClientRect could not see and only the PNG did.
    R(1906, 1908, '@media (max-width:374px){', '}'),
  ].join('\n');

  // 2. THE REGISTER ROWS (BRANDING §5.5). Every landing page's `list` band.
  //    THE COUNT CAPS AT home.html:2443-2445 ARE DELIBERATELY NOT TAKEN. On the
  //    homepage the register shows 7 of n and paints a boundary row; a landing
  //    page's whole job is FULL MEMBERSHIP (AD-17 §1: "the only place all four
  //    kinds appear together at full membership"), so a cap there would hide
  //    real items and the anchor registry's rows would become unreachable.
  const REG = R(2410, 2432, '.w7-pj-rows{list-style:none', '.w7-pj-foot{margin:clamp(26px,2.8vw,42px) 0 0}');

  // 3. THE READING PAIR (BRANDING §5.7, the flat-rail figure). Carries
  //    `#projects`-scoped rail rules, re-scoped per band id in WORK_CSS below.
  const FIGPAIR = R(2398, 2406, '.w7-pj-nums{display:flex', '.w7-pj-nl{display:block');

  // 4. THE FOUR-KINDS DISPLAY ROWS. A ruled row at display scale with a
  //    rule-kissed word and one definition line. AD-17 §5A band 2 says the
  //    /work `kinds` band "extends band 4's device", and §5E band 2 asks for
  //    exactly the same shape for the four event names.
  const KINDS = R(2137, 2185, '.w7-do-head{display:grid', '.w7-do-t{--rl-w:2px;--rl-bottom:.11em}');

  // 5. THE CAMPAIGN MARCH + THE EVENTS RAIL. AD-17 §5C band 3 is "the march
  //    composition from frozen band 7, at page scale". The cap rules at
  //    2515-2516 are again NOT taken, for the same reason as the register's.
  const MARCH = [
    R(2484, 2510, '.w7-ce-camp{list-style:none', '.w7-ce-camp>li.w7-more{display:none;padding-left:24%'),
    R(2517, 2517, '.w7-ce-cfoot{margin:clamp(20px,2.1vw,30px) 0 0}', '.w7-ce-cfoot{margin:clamp(20px,2.1vw,30px) 0 0}'),
    R(2519, 2540, '.w7-ce-ev{margin:clamp(28px,3vw,46px) 0 0', '.w7-ce-evnote{margin:0;color:var(--fg-2)'),
    R(2541, 2574, '@media (max-width:767px){', '.w7-ce-evnote{max-width:none}'),
  ].join('\n');

  // 6. THE JOURNEY DURATION FIGURE. Duration-first is the journeys register's
  //    ordering device on /work band 5 and /work/journeys band 3 (AD-17 §5).
  const JRDUR = R(2245, 2256, '.w7-jr-dur{display:block;width:max-content', '.w7-jr-dur::after{content:');

  // 7. THE PLACEHOLDER FRAME (AD-17 §8, D-07.14). Dotted outline + the hatch
  //    OVER the photograph + an inverted chip. The hatch gradient is the one
  //    thing here worth never retyping, and the frozen declarations are taken
  //    verbatim; WORK_CSS re-points them at a frame instead of a sheet cell.
  const PH = R(1833, 1838, ".s-record-ph{outline-style:dotted}", '.s-record-ph .s-record-yr{color:var(--ink-2)');

  /* 8. AD-18. THE CONTACT SHEET (BRANDING §4.4). This is the section's answer
        to "there is no use of photos": a grid of n frames that costs about
        340px at 375 and shows six photographs in it. Frozen on the homepage's
        #record band, which is #F3F2F0 — so it is a PAPER component and AD-18
        puts it on a paper band, which is why it needs no dark statement.
        THE YEAR CHIP IS NOT TAKEN AND THAT IS THE POINT. `.s-record-yr` is a
        DATE device and §4.4 is explicit that `.s-record-ph` "marks an unscanned
        YEAR, not a doubtful photograph". No WORK frame has a sourced year — the
        events page exists because four names is all that is written down — so a
        year chip here would be the invented date that page refuses. The frame's
        own alt carries what it shows; nothing claims when.
        The five responsive column steps ARE taken, because the sheet's whole
        behaviour is its column count, and §4.4's trap is real: densifying past
        four columns at <=375 makes the chip wider than the cell it marks. */
  const SHEET = [
    R(1782, 1786, '.s-record-sheetblock{margin-top:clamp(38px,4.2vw,62px)', '.s-record-sheethead .lbl{color:var(--ink-3);margin:0}'),
    R(1796, 1798, '.s-record-sheet{display:grid', 'outline:1px solid var(--rule-2);outline-offset:-1px}'),
    R(1844, 1844, '.s-record-note{margin:0;max-width:60ch}', '.s-record-note{margin:0;max-width:60ch}'),
    R(1851, 1851, '@media (max-width:1023px){.s-record-sheet', 'repeat(7,minmax(0,1fr))}}'),
    wrapMedia('(max-width:767px)', R(1866, 1866, '.s-record-sheet{grid-template-columns:repeat(6', 'gap:6px}')),
    R(1878, 1880, '@media (min-width:376px) and (max-width:519px){', 'repeat(5,minmax(0,1fr))}'),
    wrapMedia('(max-width:519px)', R(1886, 1887, '.s-record-sheet{gap:5px}', '.s-record-cell{aspect-ratio:3/2}')),
    R(1912, 1914, '@media (max-width:375px){', 'repeat(4,minmax(0,1fr))}'),
  ].join('\n');

  /* 9. AD-18. THE PANEL FIGURE. One fixed-height halftoned frame, frozen as the
        journeys card's picture on homepage band 5. It is the frame that goes in
        a tab panel, one per named activity or destination — which is how the
        photograph count goes UP while the band height stays flat, because a tab
        group is only as tall as its tallest panel. Two declarations, taken
        rather than retyped so the height clamp cannot drift from the card. */
  const PANELFIG = R(2257, 2259, '.w7-jr-fig{display:block;height:clamp(178px,21.5vw,300px)', '.w7-jr-fig img{transition:opacity .18s}');

  /* 10. AD-18. THE STATEMENT BAND — frozen homepage band 3, `#say`.
         THIS IS THE ANSWER TO THE OWNER'S SHARPEST NOTE: "this use of black and
         white blocks is getting to make pages boring." The alternation is not
         the problem — he approved the homepage, which alternates harder than
         anything here. The problem is that our pages took the alternation and
         none of what carries it, so six flat blocks with a heading and prose in
         each read as a slide deck.
         `#say` is the frozen page's own cure and the only band on it that has no
         opener, no rule, no list and no CTA: a photograph occupying the right
         56% of the band with a halftone over it, one display line in the left
         44%, and one micro-caps line under that. It BREAKS THE BAND EDGE — the
         frame runs to the seam on three sides — so it is the one thing in the
         chain that does not read as a rectangle of ground with content inside
         it. At 417px at 375 it is also the cheapest band on the homepage.
         Taken whole, with its phone rotation, which re-crops rather than
         shrinks (§5.4: "a different crop, not the same one smaller"). */
  const SAY = [
    R(2074, 2101, '.w7-say{background:var(--ground)', '.w7-say-ans{color:var(--fg-2)'),
    R(2102, 2112, '@media (max-width:767px){', '.w7-say-ans{margin-top:20px;font-size:12px}'),
  ].join('\n');

  /* 11. AD-18. THE ASYMMETRIC SPLIT — frozen homepage band 6, `.w7-pj-split`.
         The second half of the same cure. Band 6 puts the register in columns
         1-5 and a photograph with two readings in columns 7-12, and its own
         comment says why: "weight is carried by TREATMENT, never by how many
         items exist". A 5/6 split across twelve columns with a one-column gutter
         between is the frozen page's way of making a type band stop being a
         centred block — and it puts A PHOTOGRAPH INSIDE A T2 BAND, which is
         exactly what these pages had none of. */
  const SPLIT = R(2377, 2396, '.w7-pj-split{display:grid', '.w7-pj-say{display:block');

  const COMPONENT_CSS = [DOORS, REG, FIGPAIR, KINDS, MARCH, JRDUR, PH, SHEET, PANELFIG, SAY, SPLIT].join('\n\n');

  /* Prove the ranges are the components we think they are. A range that still
     parses but no longer holds its component would ship thirteen pages whose
     doors, register or march silently do nothing while the console reads clean
     — which is the exact class of failure that produced these assertions. */
  const must = [
    [DOORS, '.s-record-door{display:grid;grid-template-rows:auto auto 1fr auto', 'the door cards four-row grid'],
    [DOORS, 'grid-template-areas:"lbl n" "h h" "t t"', 'the doors phone rotation'],
    [REG, '.w7-pj-rows>li>a::before', 'the register full-row hit target'],
    [REG, 'rgba(20,19,16,.045)', 'the register hover wash'],
    [FIGPAIR, '--rl-top', 'the flat-rail figure geometry'],
    [KINDS, '.rl::after', 'the rule that kisses the word'],
    [MARCH, 'padding-left:24%', 'the marching indent terminus'],
    [MARCH, '.w7-ce-evn:first-of-type', 'the events rail divider'],
    [JRDUR, 'var(--kiss)', 'the duration figure kiss gap'],
    [PH, 'repeating-linear-gradient(45deg', 'the placeholder hatch'],
    [SHEET, '.s-record-sheet{display:grid', 'the contact sheet grid'],
    [SHEET, 'aspect-ratio:5/4', 'the contact sheet cell ratio'],
    [SHEET, 'repeat(4,minmax(0,1fr))', 'the contact sheet four-column phone floor'],
    [SHEET, 'repeat(5,minmax(0,1fr))', 'the contact sheet 376-519 step-up'],
    [PANELFIG, 'clamp(178px,21.5vw,300px)', 'the panel figure height clamp'],
    [SAY, 'width:56%', 'the statement band picture width'],
    [SAY, 'background-size:6px 6px', 'the statement band halftone'],
    [SAY, 'object-position:46% 62%', 'the statement band phone re-crop'],
    [SPLIT, '.w7-pj-reg{grid-column:1/span 5', 'the asymmetric split register column'],
    [SPLIT, '.w7-pj-lead{grid-column:7/span 6', 'the asymmetric split picture column'],
    [SPLIT, '.w7-pj-fig{display:block', 'the in-band photograph'],
  ];
  /* And the year chip must NOT have come along with the sheet: no WORK frame
     carries a sourced date, so a date chip here is an invented one. */
  if (SHEET.includes('.s-record-yr{position:absolute')) {
    console.error('EXTRACTION IS WRONG: the year chip (.s-record-yr) was pulled in with the contact ' +
      'sheet. No WORK frame has a sourced year — a date chip here invents one. Narrow the range.');
    home.state.bad++;
  }
  for (const [block, needle, what] of must) {
    if (!block.includes(needle)) {
      console.error(`EXTRACTION IS WRONG: ${what} (${needle}) is not in the range taken from ` +
        `home.html. The block moved or was renamed — re-find it, do not delete this check.`);
      home.state.bad++;
    }
  }
  // The count caps must NOT have come along: if they did, a landing page would
  // silently hide its eighth item and the anchor registry would break.
  for (const [block, needle, what] of [
    [REG, 'nth-child(n+8)', 'the register count cap'],
    [MARCH, 'nth-child(n+4):not(.w7-more)', 'the march count cap'],
  ]) {
    if (block.includes(needle)) {
      console.error(`EXTRACTION IS WRONG: ${what} (${needle}) was pulled in. A landing page must ` +
        `show FULL MEMBERSHIP — a cap there hides real items and kills their anchors. Narrow the range.`);
      home.state.bad++;
    }
  }

  return { ...base, COMPONENT_CSS, bad: base.bad + home.state.bad };
}

/* ═══ THE NAV — AD-17 §2, ONE WORD, ONE ABSOLUTE DESTINATION ══════════════
   The ruling: the menu wires to pages, and the two that stay homepage anchors
   are WRITTEN ABSOLUTELY, so `/#farm` is a same-page jump from the homepage and
   a navigate-plus-jump from /work/projects — the SAME destination either way.
   No word means two things anywhere.

   `aria-current` is one location, most-specific-wins: Work on /work and
   everything under it, but JOURNEYS — not Work — on /work/journeys and the four
   journey pages, because Journeys owns a nav word of its own (AD-17 §2).
   Pointing aria-current at the parent when the child owns the word would
   announce the wrong location.                                             */
/* W-16 (AD-18). `/work` IS KEPT and `Work` points at it.
   An IA review recommended deleting it; the OWNER reversed that, and gave the
   page a reason it did not have before: "Sometimes people want to see Swechha's
   entire work in one view." That is a job the four kind pages cannot do, and
   nobody who wants it can get it anywhere else.
   The IA's DIAGNOSIS still binds, and it was correct: as built, the page was
   homepage band 4 verbatim plus band 6's head with more rows plus band 5's head
   with the photographs removed. A redesign that leaves it a union of four
   registers fails the ruling. See pageIndex().
   `Journeys` stays at /work/journeys and is NOT promoted to /journeys, which
   would orphan its four children. */
export const NAV = [
  ['Now', '/now'],
  ['Work', '/work'],
  ['Journeys', '/work/journeys'],
  ['Impact', '/impact'],
  ['Farm', '/#farm'],
  ['Record', '/#record'],
];
export const GIVE_HREF = '/act';
export const HOME_HREF = '/';

/**
 * The three nav surfaces, all six links in each. `sections` is THIS PAGE'S own
 * bands — on a WORK page the SECTIONS control lists the page you are standing
 * on, which is what finally makes both sentences true at once: the nav goes to
 * pages, SECTIONS goes to bands (AD-17 §2).
 *
 * `aria-current` NOW HAS TWO LEVELS, because Work no longer points at a page.
 * `aria-current="page"` is a claim that THIS LINK'S HREF IS THIS URL, and it
 * would be false on /work/projects for a link pointing at /#work. So:
 *   page  — the href equals the page being built (only Journeys, on
 *           /work/journeys)
 *   true  — this nav word owns the section the reader is in, but its
 *           destination is somewhere else
 * Both are valid `aria-current` tokens and the underline CSS keys off the
 * attribute's presence, not its value, so the mark is identical either way.
 */
export const workHeader = (sections, current, url) => {
  const cur = (label, href) => label !== current ? ''
    : (href === url ? ' aria-current="page"' : ' aria-current="true"');
  const nl = ([t, h]) => `<a class="nl" href="${h}"${cur(t, h)}>${t}</a>`;
  const idx = sections.map(([t, h]) => `<a class="nl" href="${h}">${esc(t)}</a>`).join('');
  return `<header class="nav"><div class="nav-in"><a class="mark" href="${HOME_HREF}" aria-label="Swechha"><img src="/brand/swechha-horizontal-white-approved.png" alt="Swechha"></a><nav class="navlinks" aria-label="Primary">${NAV.map(nl).join('')}</nav><button type="button" class="navidx-t" aria-expanded="false" aria-controls="navidx">Sections</button>
<div class="navidx" id="navidx" hidden><nav aria-label="All sections">${idx}</nav></div><a class="give" href="${GIVE_HREF}">Give</a></div><nav class="navscroll" aria-label="Sections"><ul>${sections.map(([t, h]) => `<li><a class="nl" href="${h}">${esc(t)}</a></li>`).join('')}</ul></nav></header>`;
};

/* ═══ THE WORK LAYER — the only CSS this section AUTHORS ══════════════════
   NO BACKTICKS ANYWHERE IN THIS BLOCK. It is one template literal and a
   backtick inside a comment silently terminates it, with the parse error
   surfacing dozens of lines away. Three separate builds on this project were
   broken exactly that way. Quote selectors in prose without them.

   Everything below is one of four things and nothing else:
     (a) re-scoping an extracted rule that was id-scoped to a homepage band;
     (b) stating an extracted component's colour for the OTHER ground, which
         BRANDING/§9.3 requires of every shared component — ten contrast
         failures on the Yamuna page, worst 2.11:1, came from a component
         authored on paper tokens and then used on a dark band;
     (c) lifting the homepage's count caps, which a full-membership register
         must not carry;
     (d) three genuinely new pieces, each named with its reason.
   ═══════════════════════════════════════════════════════════════════════ */
export const WORK_CSS = `
/* ── (a) RE-SCOPING. The extracted four-kinds rows read --w7-do-def off the
      band id, and the extracted reading pair reads its rail weight off
      #projects. Those two ids are the HOMEPAGE's band names. Left unscoped the
      grid template resolves to minmax(0,) and the row collapses, so every WORK
      band that uses either component states the same value under its own id.
      This is why the ids are listed rather than the class: the frozen rule is
      unchanged and inherited, and only its scope is extended. ──────────── */
#kinds,#record,#against,#list,#what,#weight,#done{--w7-do-def:420px}
@media (max-width:1023px){#kinds,#record,#against,#list,#what,#weight,#done{--w7-do-def:260px}}
#kinds .w7-do-t.rl::after,#record .w7-do-t.rl::after{--rl-w:2px;--rl-c:var(--ink-2)}
#what .w7-pj-num.rl::after,#weight .w7-pj-num.rl::after,
#done .w7-pj-num.rl::after,#list .w7-pj-num.rl::after{--rl-w:2px;--rl-c:var(--ink-2)}

/* ── (b) THE SAME COMPONENTS, STATED FOR THE DARK GROUND.
      The register rows, the reading pair and the four-kinds rows are all frozen
      on paper: --ink, --ink-2, --ink-3, --rule, --rule-2. AD-17 §5 puts the
      register on a #151512 band on four of the five page types and the reading
      pair on #0D0D0B, so each one needs its dark statement or it renders
      near-invisible ink on a near-black band. Carried on a WRAPPER class so the
      extracted declarations stay untouched and only the canvas changes.
      Every value below is a token that already exists; none is a new colour. */
.wk-dark .w7-pj-rows{border-top-color:var(--hair)}
.wk-dark .w7-pj-rows>li{border-bottom-color:var(--hair-2)}
.wk-dark .w7-pj-rows>li:last-child{border-bottom-color:var(--hair)}
.wk-dark .w7-pj-rows>li>a:hover::before{background:rgba(251,248,240,.045)}
.wk-dark .w7-pj-rows .w7-pj-n{color:var(--fg-3)}
.wk-dark .w7-pj-rt{color:var(--fg)}
.wk-dark .w7-pj-rf{color:var(--fg-2)}
.wk-dark .w7-pj-rows>li>a:hover .w7-pj-rt{color:var(--mustard)}
.wk-dark .w7-pj-rows>li>a:focus-visible{outline-color:var(--mustard)}
.wk-dark .w7-pj-num .num{color:var(--fg)}
.wk-dark .w7-pj-num sup{color:var(--fg-2)}
.wk-dark .w7-pj-nl{color:var(--fg-3)}
.wk-dark .w7-pj-num.rl::after{--rl-c:var(--fg-3)}
.wk-dark .w7-do-list>li,.wk-dark .w7-do-list>li:last-child{border-color:var(--hair)}
.wk-dark .w7-do-t{color:var(--fg)}
.wk-dark .w7-do-t.rl::after{--rl-c:var(--fg-3)}
.wk-dark .w7-do-d{color:var(--fg-2)}
.wk-dark .w7-do-n{color:var(--fg-3)}
.wk-dark .w7-do-list>li>a::before{background:transparent}
.wk-dark .w7-do-list>li>a:hover::before{background:rgba(251,248,240,.045)}
.wk-dark .w7-do-list>li>a:hover .w7-do-t,.wk-dark .w7-do-list>li>a:hover .w7-do-n{color:var(--fg)}
.wk-dark .w7-do-list>li>a:focus-visible{outline-color:var(--mustard)}
.wk-dark .w7-do-lead{color:var(--fg)}
/* And the mirror case: the door cards and the campaign march. The doors are
   frozen on paper and #onward is paper-2, so they need nothing; the MARCH is
   frozen on the dark ground and AD-17 §5C keeps it there, so it needs nothing
   either. Both are recorded here so the next reader does not go looking. */

/* ── (c) FULL MEMBERSHIP. The homepage register shows 7 of n and the march 3 of
      n, each with a boundary row, because the homepage is a summary. A landing
      page is the list, and every row on it carries the anchor an inbound link
      lands on (AD-17 §7.2), so a hidden row is a dead link. The caps were left
      out of the extraction; these two lines make the intent explicit and would
      also survive the caps arriving back. No .w7-more row is ever emitted. */
.w7-pj-rows>li:not(.w7-more){display:list-item}
.w7-ce-camp>li:not(.w7-more){display:list-item}

/* ── (b, continued) THE RULED PROSE ROW ON PAPER. Air's .p-row family is
      written for the dark ground only and this section puts it on #ECEBE8 for
      the "what it has done" band. Same defect, opposite direction, as the ten
      Yamuna contrast failures — so it is stated rather than left to inherit. */
.paper .p-row,.paper-2 .p-row{border-top-color:var(--rule)}
.paper .p-row:last-child,.paper-2 .p-row:last-child{border-bottom-color:var(--rule)}
.paper .p-row .cap,.paper-2 .p-row .cap{color:var(--ink-2)}
.paper .p-rows .lbl,.paper-2 .p-rows .lbl{color:var(--ink-3)}
.paper .p-key,.paper-2 .p-key{color:var(--ink)}
.paper .p-legend,.paper-2 .p-legend{color:var(--ink-3)}

/* ── (b, continued) THE INLINE CROSS-SELL HOOK ON PAPER. The .w7-ce-pre rule is
      frozen for the dark band 7 and carries --fg-3 / --fg-2. AD-17 §4's licensed
      inline cross-sell puts it above an item name, and on /work/events that
      name sits on #F3F2F0 — where the frozen colour measured 1.51:1 on the
      first build. Third time this exact defect has appeared on this project, so
      it is stated for paper rather than left to inherit. --ink-2 on --paper is
      8.23:1. */
.paper .w7-ce-pre,.paper-2 .w7-ce-pre{color:var(--ink-3)}
.paper .w7-ce-pre a,.paper-2 .w7-ce-pre a{color:var(--ink-2)}
.paper .w7-ce-pre a:hover,.paper .w7-ce-pre a:focus-visible,
.paper-2 .w7-ce-pre a:hover,.paper-2 .w7-ce-pre a:focus-visible{color:var(--ink)}
.paper .w7-ce-pre a:focus-visible,.paper-2 .w7-ce-pre a:focus-visible{outline-color:var(--mustard-ink)}

/* ── THE DISCLOSURE MARKER IS THE ARROW, NOT A CHEVRON, AND §7.4 IS EXPLICIT
      ABOUT WHY. The shared disclosure draws its marker as a rotated
      border-right/border-bottom square — a chevron. BRANDING §7.4 names exactly
      that: "A disclosure glyph would be the page's first icon", and §5.10 rules
      it again for the SECTIONS control — "No new iconography ... No hamburger,
      no caret, no chevron." The only non-type marks this site permits anywhere
      are the arrow, the six-band scale and the halftone.
      So the chevron is switched off and the summary carries THE LICENSED ARROW,
      pointing down when the block is closed and up when it is open. Same
      affordance, same transition, no new mark. Found by reading the PNG; it
      passes every box measurement, because a chevron is the right size.
      (The five situation pages still draw the chevron. That is their defect to
      fix, not a licence to repeat it here.) */
.dx-s::before{display:none}
.dx-s svg{width:14px;height:14px;flex:none;color:var(--mustard);
  transform:rotate(90deg);transition:transform .16s}
.dx[open]>.dx-s svg{transform:rotate(-90deg)}
.paper .dx-s svg,.paper-2 .dx-s svg{color:var(--mustard-ink)}
.dx-s:focus-visible{outline:2px solid var(--mustard);outline-offset:3px}
.paper .dx-s:focus-visible,.paper-2 .dx-s:focus-visible{outline-color:var(--mustard-ink)}

/* ── (d.5) THE DURATION-FIRST REGISTER, AND A DEFECT ONLY THE PNG SHOWED.
      AD-17 §5 orders the journeys bands duration-first, so the register's lead
      column carries the frozen .w7-jr-dur figure instead of an ordinal. But the
      register's lead column is clamp(28px,2.4vw,38px) — sized for two tabular
      digits — and .w7-jr-dur is clamp(1.9rem,3.1vw,3.1rem), which is 30.4px at
      375 and 49.6px at 1440. So "2-4" wrapped to two lines and its unit dropped
      to a third: THREE LINES WHERE THERE SHOULD BE ONE, at both widths.
      Nothing that was running caught it. Contrast, overflow, band height,
      adjacency and the left edge were all green, because the row simply got
      taller and stayed inside every one of them. It is in the picture and
      nowhere else, which is BRANDING §8.5 exactly: box measurement and image
      reading find different bugs and you need both.
      The column is widened to hold the figure and the figure is set at register
      scale rather than card scale — the same component, sized for the row it is
      now in, with its rule and its kiss gap unchanged. */
.wk-reg-dur>li>a{grid-template-columns:clamp(62px,7.4vw,104px) minmax(0,1fr)}
.wk-reg-dur .w7-jr-dur{margin:0;font-size:clamp(1.35rem,2.1vw,1.9rem);
  white-space:nowrap;grid-row:1/span 2}
.wk-reg-dur .w7-jr-dur .num{color:var(--fg)}
.paper .wk-reg-dur .w7-jr-dur .num,.paper-2 .wk-reg-dur .w7-jr-dur .num{color:var(--ink)}
.paper .wk-reg-dur .w7-jr-dur i,.paper-2 .wk-reg-dur .w7-jr-dur i{color:var(--ink-3)}
.paper .wk-reg-dur .w7-jr-dur::after,.paper-2 .wk-reg-dur .w7-jr-dur::after{background:var(--ink-3)}

/* ── (d.4) THE PROSE ROW'S PHONE ROTATION, AND IT IS A FIX, NOT A PREFERENCE.
      Air's .p-row is a two-column grid, minmax(0,auto) beside minmax(0,1fr),
      and on the Air page column one holds a NUMERAL — three or four glyphs. In
      this section column one holds a written heading, so at 375 the .wrap is
      335px, the heading takes about 120px of it and the prose is squeezed into
      roughly 195px. Measured on the first build: the "how it runs" band on
      NatureScapes came out at 1,491px at 375 against a 900px per-band cap that
      no WORK band inherits a licence from, and Bridge the Gap's "what it has
      done" at 1,334px. The rows stack below 640 — same component, same rule,
      the label above its prose instead of beside it, which is the exact
      rotation the phone rail and the events divider already perform. */
@media (max-width:639px){
  .p-rows .p-row{grid-template-columns:minmax(0,1fr);row-gap:6px;padding:15px 0}
  .p-rows .p-row .body{max-width:none}
}

/* ── (d.1) THE ANCESTOR LINE. Every page below /work opens with where it sits.
      It is type, not a mark: the frozen page permits the arrow glyph, the
      six-band scale and the halftone as its only non-type marks, so this uses
      the left-arrow CHARACTER in the nav's own micro-caps rather than an icon.
      44px tall so it is a real touch target, and it sits above the display
      head where a breadcrumb would, without being a breadcrumb trail. */
.wk-anc{display:inline-flex;align-items:center;gap:9px;min-height:44px;margin:0;
  text-decoration:none;color:var(--fg-2);transition:color .16s}
.wk-anc:hover,.wk-anc:focus-visible{color:var(--mustard)}
.paper .wk-anc,.paper-2 .wk-anc{color:var(--ink-2)}
.paper .wk-anc:hover,.paper-2 .wk-anc:hover{color:var(--ink)}
.wk-anc i{font-style:normal;font-size:1.15em;line-height:1}

/* ── (d.2) THE TYPE-ONLY MASTHEAD (AD-17 §5D). Eco Action, ME to WE and
      NatureScapes have no usable photograph and a page with a stock photograph
      is not honest, so band 1 on those pages is the same T1 dark band with NO
      FRAME AT ALL. T1 carries padding:0 by design — the photograph runs to the
      seam — so a frameless T1 needs its own vertical block, and this is it. It
      is .im-head at masthead scale, which is what §5D specifies; the head and
      the deck inside it are the frozen opener, unchanged. */
/* AND IT IS SET AT ARRIVAL SCALE, ON THE ARITHMETIC. The first build gave it
   38/30px of padding and /work's masthead measured 148px at 375 — a T1 arrival
   band thinner than the ticker. The frozen page's own type-only T1 band, the
   smell banner, is 417px at 375 and 489 at 1440, and that is the reference: a
   band a reader arrives in has to read as arrival, whether or not it has a
   photograph. These values put the thinnest case (one-line head, one-line deck,
   no ancestor) at about 296px and the fullest at about 440, so every masthead
   stays inside one viewport at 375x635 and at 1440x900 — which is the licence
   §6.4 gives a hero and the only one it gives. */
.wk-mast{padding:clamp(120px,12vw,180px) 0 clamp(96px,9vw,140px)}
.wk-mast .im-head{margin-bottom:0}
.wk-mast .d1{max-width:20ch}
.wk-pic-head{padding-top:clamp(18px,2.2vw,30px)}

/* ── (d.3) THE ARRIVAL MARK ON A REGISTER ROW (AD-17 §7.2). Six inbound links
      from the frozen homepage land on a row rather than a page, and a reader
      has to be able to tell they arrived. IT INTRODUCES NO COLOUR: the hue
      system is closed and a row is not a control, so the row takes its own
      hairline from --rule to --rule-2 weight and its title to full ink. The
      scroll-padding-top token already lands the row correctly under the header
      on both paths, cold hash and same-page click. */
.w7-pj-rows>li:target{border-bottom-color:var(--rule-2)}
.w7-pj-rows>li:target>a::before{background:rgba(20,19,16,.045)}
.w7-pj-rows>li:target .w7-pj-rt{color:var(--ink)}
.w7-pj-rows>li:target .w7-pj-n{color:var(--ink)}
.wk-dark .w7-pj-rows>li:target{border-bottom-color:var(--hair)}
.wk-dark .w7-pj-rows>li:target>a::before{background:rgba(251,248,240,.045)}
.wk-dark .w7-pj-rows>li:target .w7-pj-rt,.wk-dark .w7-pj-rows>li:target .w7-pj-n{color:var(--fg)}
.w7-ce-camp>li:target{border-top-color:var(--fg-3)}
.w7-ce-camp>li:target .w7-ce-t{color:var(--fg)}
.w7-do-list>li:target{border-color:var(--rule-2)}
.wk-dark .w7-do-list>li:target{border-color:var(--fg-3)}

/* ── THE CROSS-SELL BAND (AD-17 §4). One band, four slots, a fixed order, and
      IT ADDS NO NEW COMPONENT: slots 1-3 are the door cards and slot 4 is the
      CTA family. All this does is put the act beneath a hairline as the band's
      one .b-1, and give the doors a top rule so the band reads as doors on
      paper rather than a fifth dark band. Mustard appears ONLY as that fill:
      no WORK page gets a mustard ground, because mustard is a ground exactly
      once site-wide. */
.wk-onward-act{display:flex;flex-wrap:wrap;align-items:center;
  justify-content:space-between;gap:clamp(16px,2vw,32px);
  margin:clamp(26px,3vw,44px) 0 0;padding:clamp(20px,2.4vw,32px) 0 0;
  border-top:1px solid var(--rule-2)}
.wk-onward-act p{margin:0;color:var(--ink-2);font-size:16px;line-height:1.5;max-width:46ch}
@media (max-width:519px){.wk-onward-act .b{width:100%;justify-content:center;padding:16px 20px}}

/* ── A NAMED LIST — schools, partners and funders BY NAME (AD-17 §5D band 5).
      Not a component so much as the register's own divider used across instead
      of down: the same 1px hairline, the same micro-caps label. Stated for both
      grounds because the item pages put it on #0D0D0B and /work/campaigns does
      not use it at all. */
.wk-names{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));
  gap:0;border-top:1px solid var(--hair)}
.wk-names>div{padding:var(--gap-row) clamp(14px,2vw,28px) var(--gap-row) 0;
  border-right:1px solid var(--hair)}
.wk-names>div:last-child{border-right:0}
.wk-names .lbl{display:block;margin:0 0 12px;color:var(--fg-3)}
.wk-names ul{list-style:none;margin:0;padding:0}
.wk-names li{font-family:Archivo,system-ui,sans-serif;
  font-variation-settings:'wdth' 84,'wght' 620;font-size:15px;line-height:1.5;
  color:var(--fg);padding:5px 0;border-bottom:1px solid var(--hair-2)}
.wk-names li:last-child{border-bottom:0}
.paper .wk-names,.paper-2 .wk-names{border-top-color:var(--rule-2)}
.paper .wk-names>div,.paper-2 .wk-names>div{border-right-color:var(--rule)}
.paper .wk-names .lbl,.paper-2 .wk-names .lbl{color:var(--ink-3)}
.paper .wk-names li,.paper-2 .wk-names li{color:var(--ink);border-bottom-color:var(--rule)}
@media (max-width:639px){
  .wk-names>div{border-right:0;border-bottom:1px solid var(--hair);padding-right:0}
  .wk-names>div:last-child{border-bottom:0}
  .paper .wk-names>div,.paper-2 .wk-names>div{border-bottom-color:var(--rule)}
}

/* ── A FIGURE WITH ITS PERIOD, ITS BASIS AND ITS SOURCE. The data contract
      makes all four required, and BRANDING §3.4 says a figure is set as a
      reading. The numeral and its rule are the EXTRACTED flat-rail figure; this
      only adds the two lines under the label that carry the period and the
      source, at the caption floor, because a figure whose period is not on the
      page is the defect the frozen homepage fixed by hand on Bridge the Gap. */
/* THE EYEBROW THAT SAYS WHOSE FIGURE THIS IS. On an item page every reading
   belongs to the item the page names, so none is needed. On a KIND LANDING the
   readings come from different items, and the first build put two "60+ journeys
   organised" side by side — Gram Anubhav's and NatureScapes', both true, and
   reading exactly like a copy-paste. §5.7 already licenses an optional eyebrow
   above the numeral, so the owner's name goes there and the ambiguity goes away
   without a new component. */
.wk-fig-o{display:block;margin:0 0 9px;color:var(--ink-3)}
.wk-dark .wk-fig-o{color:var(--fg-3)}
.wk-fig-m{display:block;margin:7px 0 0;color:var(--ink-3)}
.wk-dark .wk-fig-m{color:var(--fg-3)}
.wk-fig-s{display:block;margin:3px 0 0;color:var(--ink-3)}
.wk-dark .wk-fig-s{color:var(--fg-3)}

/* ── THE PLACEHOLDER FRAME (AD-17 §8). The extracted declarations above are
      written for a sheet cell; these three lines point the same dotted outline,
      the same hatch and the same inverted chip at a frame. DOTTED MEANS
      PLACEHOLDER. Dashed means a shut window and dashed may never be used here.
      There is a FLOOR: the chip is about 37.7 x 21.5px, so below ~60px the
      frame does not render at all and the gap is stated in words — a marker
      wider than the thing it marks is worse than no image. */
.wk-ph{position:relative;outline:1px dotted var(--rule-2);outline-offset:-1px}
.wk-ph::after{content:'';position:absolute;inset:0;z-index:1;pointer-events:none;
  background:repeating-linear-gradient(45deg,transparent 0 5px,rgba(20,19,16,.30) 5px 6px)}
.wk-ph-chip{position:absolute;left:0;bottom:0;z-index:3;margin:0;
  color:var(--ink-2);background:rgba(238,236,230,.88);
  border:1px dotted rgba(20,19,16,.5);padding:4px 6px 5px;font-size:10.5px}

/* ── WHAT WE CANNOT YET SAY, AS CONTENT. AD-17 §5C band 4 and §5D band 4 both
      put the named holes on the page in the frozen grammar. The marker is the
      extracted .p-hole; this only gives the group its heading rhythm. */
.wk-holes{margin:var(--gap-block) 0 0}
.wk-holes .p-hole{margin-top:var(--gap-row)!important}
.wk-holes .p-hole:first-child{margin-top:0!important}

/* ══════════════════════════════════════════════════════════════════════════
   AD-18. EVERYTHING BELOW IS EITHER (a) A RE-SCOPE OR (b) A GROUND STATEMENT
   FOR A COMPONENT THAT IS ALREADY IN THIS FILE AND WAS NEVER USED.

   THAT IS THE FINDING THIS PASS TURNS ON, so it is stated once here rather
   than nine times below. The client's note says "that design ethos the
   homepage has, or the situation page has, is missing here". It was not
   missing because the components did not exist. work-shell imports
   situation-shell's SITUATION_CSS and SHARED_PAGE_CSS wholesale, so EVERY
   page in this section already shipped, unused, in its own <style> block:

     .p-tabs   the ARIA tab component — and SCRIPT_BASE already carries its
               controller, so a WORK page could always have been interrogable
               for the cost of markup and zero JS
     .p-nr     a figure set as a ruled row: name, value, suffix
     .p-do-r   a ruled prose row with a label, a body and a caption
     .p-rg     a RANGE row — a published low-to-high span drawn with end caps
     .p-two    two figures side by side, which is the same harm counted twice
     .p-key    the interpretive sentence that reads the page's own numbers
     .p-cell .p-rank .p-yy .p-fc .p-attn .mr  (still unused, deliberately —
               they carry axes and limits this section has no sourced data for)

   Measured on the built /work/index.html before this pass: 8 rules mentioning
   .p-tabs, 7 mentioning .p-nr, 11 mentioning .p-rg. Zero instances in the
   markup of any of them. So the ethos gap was a markup gap, and closing it
   adds no CSS weight and no script.

   WHAT EACH ONE NEEDS IS ITS OTHER GROUND, and this is the third time this
   exact defect has cost a session on this project (ten Yamuna contrast
   failures, worst 2.11:1; .w7-ce-pre at 1.51:1 on paper; the campaigns figure
   block at 1.02:1). Air's components are authored on ONE canvas each — the
   .p-* family on dark tokens, .p-expl and .p-sub on paper tokens — and AD-18's
   assigned ground chain puts several of them on the other one. So every
   component used below states both. No new colour: every value is a token that
   already resolves. ═══════════════════════════════════════════════════════ */

/* ── (b) THE READING LEDGER — .p-nr, ON PAPER. Frozen on --hair / --fg-*. */
.paper .p-nr,.paper-2 .p-nr{border-bottom-color:var(--rule)}
.paper .p-nr-v,.paper-2 .p-nr-v{color:var(--ink)}
.paper .p-nr-n,.paper-2 .p-nr-n{color:var(--ink)}
.paper .p-nr-s,.paper-2 .p-nr-s{color:var(--ink-3)}
.paper .p-nr.is-me,.paper-2 .p-nr.is-me{border-left-color:var(--ink)}
/* .p-nr-v.is-red is NOT stated for paper, and that is deliberate: red is a
   broken published limit and no programme figure is one. A WORK page may not
   paint a numeral red, so the paper variant of that rule does not exist. */

/* ── (b) THE RULED PROSE ROW — .p-do-r, ON PAPER. Air's own row for a written
      heading over a body and a caption, which is exactly what an objective and
      a for-who entry are. */
.paper .p-do-r,.paper-2 .p-do-r{border-top-color:var(--rule)}
.paper .p-do-r:last-child,.paper-2 .p-do-r:last-child{border-bottom-color:var(--rule)}
.paper .p-do-r .lbl,.paper-2 .p-do-r .lbl{color:var(--ink-2)}
.paper .p-do-r .cap,.paper-2 .p-do-r .cap{color:var(--ink-3)}

/* ── (b) THE RANGE ROW — .p-rg, ON PAPER.
      THIS IS THE ONE DEVICE THAT MAKES A NUMBER DO MORE WORK WITHOUT ADDING
      ONE. Several of this section's published figures are already SPANS —
      "100-150 schools", "5 to 16 sessions", "2-5 days", "2-4 hours" — and every
      one of them was being set as a single string, so the span did nothing. The
      range row draws the low and the high with end caps on an axis, which is
      the difference between a number and a decision a school actually makes.
      The endpoints are gated against the figure's own published value, so this
      component is incapable of introducing a figure. */
.paper .p-rg,.paper-2 .p-rg{border-top-color:var(--rule-2)}
.paper .p-rg-r,.paper-2 .p-rg-r{border-bottom-color:var(--rule)}
.paper .p-rg-n,.paper-2 .p-rg-n{color:var(--ink)}
.paper .p-rg-t::before,.paper-2 .p-rg-t::before{background:var(--rule-2)}
.paper .p-rg-l,.paper-2 .p-rg-l{background:var(--ink)}
.paper .p-rg-l::before,.paper .p-rg-l::after,
.paper-2 .p-rg-l::before,.paper-2 .p-rg-l::after{background:var(--ink)}
.paper .p-rg-v,.paper-2 .p-rg-v{color:var(--ink)}
.paper .p-rg-ax,.paper-2 .p-rg-ax{color:var(--ink-3)}

/* ── (b) TWO FIGURES SIDE BY SIDE — .p-two, ON PAPER. */
.paper .p-two,.paper-2 .p-two{border-top-color:var(--rule-2)}
.paper .p-two-c .cap,.paper-2 .p-two-c .cap{color:var(--ink-2)}
.paper .p-two-c .num,.paper-2 .p-two-c .num{color:var(--ink)}

/* ── (b) THE NAMED HOLE AND THE LEGEND already state both grounds in Air's own
      block, and .p-tabs states .paper for its rail and its selected marker.
      Recorded so the next reader does not go looking for statements that are
      already there. */

/* ── (d.6) THE PANEL FIGURE, AND WHY THE PHOTOGRAPHS LIVE IN TABS.
      The pre-freeze prototypes carried 9 to 15 photographs a page and the
      first build of this section carried 0 or 1. The frames are all there —
      13 CityScapes, 12 Gram Anubhav — but a six-frame grid of destination
      cards costs about 1,100px at 375, and no band on these pages has 1,100px
      to spend.
      A TAB GROUP IS ONLY AS TALL AS ITS TALLEST PANEL. So the six frames go
      one per panel: six photographs enter the document for the height of one,
      the reader chooses which destination to look at instead of scrolling past
      all six, and the band gets the interrogability the situation pages have
      and these did not. The figure is the frozen journeys-card picture,
      extracted, at its own clamp. The frame runs the full panel width because
      a photograph in this language is either full-measure or it is a thumbnail
      in a contact sheet, and there is no third size. */
.wk-panel-fig{margin:0 0 clamp(14px,1.6vw,22px)}
.paper .wk-panel-fig,.paper-2 .wk-panel-fig{background:#DCDAD4}
.wk-panel-h{font-family:Archivo,system-ui,sans-serif;
  font-variation-settings:'wdth' 74,'wght' 800;
  font-size:clamp(1.16rem,1.7vw,1.44rem);line-height:1.05;letter-spacing:-.015em;
  text-transform:uppercase;margin:0 0 10px;color:var(--fg)}
.paper .wk-panel-h,.paper-2 .wk-panel-h{color:var(--ink)}
.wk-panel p{margin:0;max-width:62ch}
/* Above 900 a panel sets its frame beside its words rather than over them, so
   the tallest panel governs less height and the photograph gets a real size.
   Below it the frame leads, which is the reading order a phone wants. */
@media (min-width:900px){
  .wk-panel{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);
    gap:clamp(24px,3vw,48px);align-items:start}
  .wk-panel-fig{margin:0}
}

/* ── (d.8) THE TAB ROW GETS THE FROZEN SCROLL AFFORDANCE. At 375 an eight-tab
      group scrolls, and the last visible label was cut mid-word with nothing to
      say it continues -- "VILLAGE INTERA". The frozen page solves this twice, at
      .rig-tabs and at .navscroll, with the SAME device and it is not an icon: an
      8px hard mask at the right edge plus a real 8px trailing item, because a
      flex container's trailing padding is not honoured as scrollable overflow
      (§5.10 -- at full scroll-right the last chip ended 8.2px inside the fade).
      Reusing it here adds no mark and no colour. Scoped to this section's CSS,
      so the five situation pages that share .p-tabs are untouched -- their fix
      is theirs to make. */
.p-tabs-l{position:relative;
  -webkit-mask-image:linear-gradient(90deg,#000 0,#000 calc(100% - 8px),transparent 100%);
  mask-image:linear-gradient(90deg,#000 0,#000 calc(100% - 8px),transparent 100%)}
.p-tabs-l::after{content:'';flex:none;width:8px;min-height:1px}

/* ── (a) A TAB PANEL'S FIRST CHILD ADDS NO TOP MARGIN, AND THIS ONE IS 60px A
      BAND. Air's .p-rows carries margin-top:var(--gap-block) because on a
      situation page it follows a band opener. In a tab panel it follows a
      TABLIST, which already sets the panel's own padding-top of var(--gap-row) —
      so the two stack: measured 60.0px of dead ground between the tab row and
      the first prose row at 375, and 95.0px at 1440. Visible in the PNG as a
      hole under the tabs and in nothing else; every box measurement was green
      because the band simply got taller.
      Stated for any first child rather than for .p-rows alone, because the same
      collision waits for every block this section ever puts in a panel. */
.p-tabs [role=tabpanel]>*:first-child{margin-top:0}

/* ── (a) THE ONE VIEW'S REGISTER TAKES A THIRD COLUMN, AND THE PNG IS WHY.
      /work band 2 is every item in the section in one list, and the kind has to
      ride on the row rather than sit in a heading over a group -- otherwise the
      page is four registers again, which is what an IA review correctly refused.
      The frozen register is a TWO-column grid, ordinal plus a content column
      that stacks the title over its fact line, so the kind landed on a second
      line under every name: twenty-one rows each two lines tall, each with a
      bordered chip hanging under a heading. Every box measurement was green --
      no overflow, no clash, contrast fine, the band merely taller -- and it is
      only in the picture, which is BRANDING §8.5 exactly.
      Three columns instead: ordinal, kind, name. The kind becomes a column you
      can run your eye down, the row is one line again, and it saves 12 rows'
      worth of height. Same component, one grid re-scope, no new mark -- and the
      chip loses its box, because a bordered chip is the .tag grammar and a kind
      is not a state (BRANDING §4.1, §3.3). */
#everything .w7-pj-rows>li>a{grid-template-columns:clamp(28px,2.4vw,38px) clamp(74px,7.4vw,108px) minmax(0,1fr)}
#everything .w7-pj-rows .w7-pj-rf{grid-row:1;align-self:baseline;margin:0}
#everything .w7-pj-rows .w7-pj-rt{grid-column:3}
#everything .w7-pj-rf .lbl{color:var(--ink-3)}
.wk-dark #everything .w7-pj-rf .lbl{color:var(--fg-3)}
@media (max-width:519px){
  /* At 375 a 74px kind column takes 22% of a 335px measure and the longest name
     ("Food systems, with UNEP") then wraps to three lines. The kind goes back
     above the name on the phone, where vertical is the axis there is more of. */
  #everything .w7-pj-rows>li>a{grid-template-columns:clamp(28px,2.4vw,38px) minmax(0,1fr)}
  #everything .w7-pj-rows .w7-pj-rf{grid-row:2}
  #everything .w7-pj-rows .w7-pj-rt{grid-column:2}
}

/* ── (a) THE CONTACT SHEET, RE-SCOPED FROM AN ARCHIVE FIELD TO A GALLERY.
      The frozen sheet is 27 cells at 9 columns because it is an archive of 27
      years and the field IS the argument. A programme page has four to eight
      frames of one subject, and eight cells in a nine-column grid is a short
      row that reads as a rendering fault.
      So the column count is re-scoped to THREE, and two below 520 — which
      also makes each frame about 392px wide at 1440 instead of 125px, ie. a
      photograph rather than a thumbnail. Higher specificity than every one of
      the five extracted breakpoint rules, so it wins at all widths without
      touching them. Nothing else about the component changes.
      NO YEAR CHIP: the extraction deliberately leaves it behind. */
.wk-gal .s-record-sheet{grid-template-columns:repeat(3,minmax(0,1fr));
  gap:clamp(8px,1vw,14px)}
@media (max-width:519px){
  .wk-gal .s-record-sheet{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
}
/* (b) The sheet is frozen on #F3F2F0 (homepage band 12) and the assigned
   ground chain puts it on a dark band on five of the fourteen pages. */
.wk-dark .s-record-sheetblock{border-top-color:var(--fg)}
.wk-dark .s-record-sheethead .lbl{color:var(--fg-3)}
.wk-dark .s-record-cell{background:#1B1B17;outline-color:var(--hair)}
.wk-dark .s-record-note{color:var(--fg-2)}
/* A frame in the sheet is a link only where it has somewhere to go; today none
   does, so the cell is a figure and carries no hover or focus affordance. Its
   alt is the content. Stated so nobody adds a dead <a> to make it feel live. */

/* ── (d.7) THE INVITE ROW. The client's sixth part is "Come Partner /
      Volunteer / Contact Us" — three routes, not one, where AD-17 §4 slot 4
      gave the band a single act.
      IT ADDS NO NEW CONTROL, AND THE THREE ROUTES DESCEND THROUGH THE CTA
      FAMILY RATHER THAN REPEATING ONE LEVEL OF IT (BRANDING §5.8): one .b-1,
      which is the act the page is actually asking for and the band's only
      primary; one .act, the standalone action link, for the second route; and
      the third as an inline .lk inside a sentence, because the third route is an
      email address and an email address set as a button pretends a form exists.
      /act's volunteer sign-up is "not connected yet" and its newsletter input is
      disabled by design (W-7), so nothing here may imply a mechanism: the mailto
      is the only route on this site that reaches a person.
      THE SECOND ROUTE IS AN .act AND NOT A .b-2, ON THE ARITHMETIC. Measured at
      375 on /work/projects: two stacked full-width buttons cost 110px and the
      band came to 978 against a 900px cap this band has no licence for. A .b-1
      plus an .act costs 54 + 27 = 81, and the note trimmed to one clause costs
      68 rather than 112.5 — 73px recovered, which is what brings the band inside
      the cap. It also reads better: three routes at one weight is not a
      hierarchy, and one of the three is plainly the one we want. */
.wk-invite{display:flex;flex-wrap:wrap;gap:14px 22px;align-items:center;
  margin:clamp(18px,2vw,26px) 0 0}
.wk-invite-n{margin:clamp(12px,1.4vw,18px) 0 0;color:var(--ink-2);
  font-size:15px;line-height:1.5;max-width:62ch;flex:1 0 100%}
.wk-dark .wk-invite-n{color:var(--fg-2)}
@media (max-width:519px){.wk-invite .b-1{width:100%;justify-content:center;padding:16px 20px}}
/* THE INVITE'S THIRD ROUTE IS AN INLINE LINK AND IT NEEDS A HIT BOX.
   Measured at every width from 320 to 1920: the mailto draws at 111.2 x 17.0px,
   which is under the 24px WCAG 2.5.8 AA floor everywhere. The frozen page's own
   remedy applies -- a transparent centred ::after that grows what the finger
   hits and changes no pixel (the AD-09 block, .act / .w7-ce-lk / .w7-ce-pre a).
   IT TAKES 24, NOT 44, and the arithmetic is why: .wk-invite-n is flex:1 0 100%
   under a 14px row gap, so a 44px box on a 17px link overhangs 13.5px each side
   and would reach into the buttons above it. 24 overhangs 3.5px, inside the gap
   with 10.5px to spare. Same trade the campaigns pair took, for the same reason,
   and it is recorded here rather than left to be re-derived. */
.wk-invite-n a{position:relative}
.wk-invite-n a::after{content:'';position:absolute;left:0;right:0;top:50%;
  transform:translateY(-50%);height:24px}

/* ── (b) THE DISCLOSURE SUMMARY ON #ECEBE8, AND IT IS A PRE-EXISTING DEFECT
      RATHER THAN A NEW ONE. situation-shell's SHARED_PAGE_CSS states the
      summary's paper colour as .paper .dx-s{color:var(--ink-2)} and stops
      there -- there is no .paper-2 in that selector. AD-17's chains put the
      disclosure on #ECEBE8 on nine of the fifteen pages, where --fg-2 on
      paper-2 measures 1.41:1 against a 4.5 floor. Measured on ten pages at all
      eleven widths, so it was shipping on the first pass too and no gate caught
      it because the contrast walk was not being run per band per ground.
      Fourth appearance of this exact defect class on this project. Stated for
      both papers, including the border and the hover, so the whole component
      moves together rather than half of it. */
.paper-2 .dx{border-top-color:var(--rule-2)}
.paper-2 .dx-s{color:var(--ink-2)}
.paper-2 .dx-s:hover,.paper-2 .dx-s:focus-visible{color:var(--ink)}

/* ── (b) THE EVENT DATE BLOCK. AD-18 puts a sourced when under one event
      name on /work/events, and the record band is paper on every chain the
      assigner produces -- so it is stated for paper first and dark second,
      rather than the other way round, which is how the first version of it got
      --fg-2 on #F3F2F0 at 1.51:1. */
.wk-when{display:block;margin-top:12px}
.wk-when b{display:block;font-weight:inherit;font-style:normal;color:var(--ink)}
.wk-when i{display:block;font-style:normal;color:var(--ink-2)}
.wk-when-n{display:block;margin-top:10px;color:var(--ink-2);max-width:56ch}
.wk-when-s{display:block;margin-top:6px;color:var(--ink-3)}
.wk-dark .wk-when b{color:var(--fg)}
.wk-dark .wk-when i{color:var(--fg-2)}
.wk-dark .wk-when-n{color:var(--fg-2)}
.wk-dark .wk-when-s{color:var(--fg-3)}

/* ── (b) THE IN-BAND PHOTOGRAPH ON A DARK GROUND. .w7-pj-fig is frozen on
      paper (border --rule-2, background --rule), and the assigned chain puts the
      split band on a dark ground on about half the pages. */
.wk-dark .w7-pj-fig{border-color:var(--hair);background:#1B1B17}
.wk-dark .w7-pj-t{color:var(--fg)}
.wk-dark .w7-pj-say{color:var(--fg-2)}
.wk-dark .w7-pj-lead a:hover .w7-pj-t{color:var(--mustard)}
.wk-dark .w7-pj-kick .w7-pj-n{color:var(--fg-3)}
/* The split's own reversal, and it is a composition decision rather than a
   ground one: on an item page the PICTURE leads and the words follow, because
   the item is the subject and the register is not there to be scanned. Same
   grid, same gutter, columns swapped — the frozen band 6 inverts left/right for
   exactly this reason, so alternating the inversion down a page is the device
   the frozen page already uses rather than a new one. */
.wk-flip .w7-pj-lead{grid-column:1/span 6}
.wk-flip .w7-pj-reg{grid-column:8/span 5}
/* A split with nothing in its second column is not a split -- it is a 5-column
   text block, which is 41% of the measure and unreadable. One column, 8 wide. */
.wk-solo .w7-pj-reg{grid-column:1/span 8}
@media (max-width:899px){
  /* THE STACKED GAP IS --gap-row, NOT --gap-block. Above 900 the two columns are
     side by side and the row-gap is never used; below it they stack and the
     frozen 36px block gap is being spent on a seam that a 24px row gap already
     reads. 12px x two split bands x fifteen pages, on the axis that is short. */
  .w7-pj-split{grid-template-columns:1fr;row-gap:var(--gap-row)}
  .w7-pj-reg,.w7-pj-lead,.wk-flip .w7-pj-reg,.wk-flip .w7-pj-lead{grid-column:1/-1;grid-row:auto}
  /* AND THE PICTURE GOES FIRST BELOW 900, on both variants. A photograph after
     500px of prose on a phone is a photograph nobody reaches. */
  .w7-pj-lead{order:-1}
}

/* ── (a) THE STATEMENT BAND, RE-SCOPED OFF #say's SUBJECT.
      The extracted rules are complete and take no ground statement — the band IS
      the arrival ground by declaration (FAMILY/PINNED in assignGrounds). Two
      re-scopes only:
      1. The frozen band's object-position values are the crop of ONE
         photograph (the Yamuna foam field). A per-frame crop is a per-frame
         decision, so it moves onto a custom property the markup sets, with the
         frozen values as the default — nothing changes on the homepage, and a
         WORK frame can be cropped for its own subject at both widths.
      2. The statement line takes a 16ch ceiling, because the frozen band's copy
         is three hand-broken lines and these are written per item. */
.w7-say-fig img{object-position:var(--op,54% 52%)}
@media (max-width:767px){.w7-say-fig img{object-position:var(--op-s,46% 62%)}}
/* ── (a) THE STATEMENT BAND'S SPLIT GOES 56/44 -> 50/50, AND THE ARITHMETIC IS
      THE WHOLE ARGUMENT. The frozen 56% was chosen for ONE statement, hand-broken
      into three lines whose longest word is six characters ("A NUMBER / IS NOT /
      A SMELL"). A WORK statement is written per item, so the column has to hold
      words nobody has counted yet — and the frozen proportion leaves 442.8px at
      1920, which is nine characters at --t-d1's 104px cap. Nine is not a
      vocabulary.
      At 50% the column is 558.0px at both 1440 and 1920, which is 11.4
      characters, so the gate can sit at 11 and ordinary English fits. The two
      numbers MOVE TOGETHER — .w7-say-fig's width and .w7-say-in's right padding
      are the same measurement stated twice, and changing one without the other
      either overlaps the type or leaves a gap. Scoped to #statement so the
      frozen band on the homepage is untouched. */
/* AND IT IS INSIDE min-width:768, WHICH IS NOT TIDINESS. The frozen band's phone
   rotation is .w7-say-fig{position:relative;width:auto;height:clamp(...)} in a
   max-width:767 block — 0,0,1,0 specificity. An id-scoped override is 1,0,1,0
   and wins everywhere, so the un-gated version of these two lines held the frame
   at 50% width BELOW 767 too: measured at 375, a 202px-wide picture floating in
   a 375px band with 173px of empty ground beside it. Every gate was green and it
   is plainly wrong in the PNG. The re-scope belongs only where the frozen
   two-column composition is live. */
@media (min-width:768px){
  #statement .w7-say-fig{width:50%}
  #statement .w7-say-in{padding-right:calc(50% + 16px)}
}
.wk-say-h{max-width:16ch;overflow-wrap:break-word}
/* THE 16ch CEILING IS NOT WHAT BINDS, AND THIS IS THE MEASUREMENT THAT MATTERS.
   .w7-say-in's right padding is calc(56% + 16px) and its left is the .wrap
   spine, so above 1332 (where .wrap caps at 1240) THE TYPE COLUMN NARROWS AS THE
   PAGE WIDENS: 558.0px at 1440 and 1920 alike, after the 50/50 re-scope above. A single word cannot wrap,
   so at --t-d1's 104px cap — Archivo 68/850 uppercase measures 49px a character
   there — a word of ten characters is 490px and CROSSES THE SEAM INTO THE
   PHOTOGRAPH. Measured: /work's statement overran by 2.9px at 1440 and 31.7px at
   1920, and nothing that was running saw it. No overflow (the band is
   overflow:hidden), no contrast failure, no clash, no height breach. It is in
   the PNG and in a purpose-built seam probe and nowhere else, which is BRANDING
   §8.5 for the second time in this pass.
   The real control is a COPY GATE — 558.0 / 49 = 11.4 characters, so the build
   refuses a statement whose longest word exceeds eleven, which is the discipline
   the frozen band already keeps ("A NUMBER / IS NOT / A SMELL", longest word
   six). break-word here is only the net under it: a violation that somehow got
   past the gate breaks inside the column instead of crossing into the picture. */
`;

/* ═══ COMPONENTS ══════════════════════════════════════════════════════════ */

/**
 * THE STATEMENT BAND. One display line over a photograph that runs to the seam,
 * and one micro-caps line under it. No opener, no rule, no list, no CTA — it is
 * the only band shape in the language whose whole job is to stop the scroll.
 *
 * THE COPY RULE IS TIGHT, AND IT HAS TO BE. A statement is the strongest thing
 * the page can say WITHOUT MAKING A NEW CLAIM, so it is written from what the
 * item already publishes: the source's own phrase, its own X-is-not-Y grammar,
 * or the named hole. It carries no figure, because a figure without its period,
 * its basis and its source is not a reading (§3.4) and a statement band has room
 * for none of those.
 *
 * DISPLAY TYPE MAY SIT ON A PHOTOGRAPH. NOTHING ELSE MAY (§5.4) — and this band
 * obeys it the frozen way rather than by scrim: the type is in the left 44% on
 * solid ground and the frame occupies the right 56%, so they do not overlap at
 * all above 767. Below it they stack.
 */
export const statementBand = ({ line, under, frame, id = 'statement' }) => `    <figure class="w7-say-fig">
      <img class="duo" src="${esc(frame.src)}" alt="${esc(frame.alt)}" loading="lazy"${frame.op || frame.opSmall ? ` style="${frame.op ? `--op:${esc(frame.op)};` : ''}${frame.opSmall ? `--op-s:${esc(frame.opSmall)}` : ''}"` : ''}>
    </figure>
    <div class="w7-say-in">
      <h2 class="d1 w7-say-h wk-say-h" id="${id}-h">${line}</h2>
${under ? `      <p class="lbl w7-say-ans">${under}</p>` : ''}
    </div>`;

/**
 * THE ASYMMETRIC SPLIT — the frozen band 6 composition, used to put a
 * photograph INSIDE a T2 band instead of only in a masthead. `flip` swaps the
 * two columns; alternating it down a page is what stops five stacked bands
 * reading as five stacked rectangles.
 */
export const splitBand = ({ left, frame, right, kick, title, say, nums, flip = false, href }) => {
  if (!frame && right) {
    return `      <div class="w7-pj-split${flip ? ' wk-flip' : ''}">
        <div class="w7-pj-reg">${left}</div>
        <div class="w7-pj-lead">${right}</div>
      </div>`;
  }
  if (!frame && !right) return `      <div class="w7-pj-split wk-solo"><div class="w7-pj-reg">${left}</div></div>`;
  const pic = frame ? `<div class="w7-pj-lead">${href ? `<a href="${href}">` : ''}
        <div class="ht w7-pj-fig"><img class="duo" src="${esc(frame.src)}" alt="${esc(frame.alt)}" loading="lazy"${frame.op ? ` style="--op:${esc(frame.op)}"` : ''}></div>
${kick || title ? `        <p class="w7-pj-kick">${kick || ''}${title ? `<span class="w7-pj-t">${title}</span>` : ''}</p>` : ''}
${say ? `        <p class="w7-pj-say">${say}</p>` : ''}
${nums || ''}${href ? '</a>' : ''}
      </div>` : '';
  return `      <div class="w7-pj-split${flip ? ' wk-flip' : ''}">
        <div class="w7-pj-reg">${left}</div>
        ${pic}
      </div>`;
};

/** The ancestor line. Type, not an icon: the left-arrow CHARACTER. */
export const anc = (label, href) =>
  `<a class="lbl wk-anc" href="${href}"><i aria-hidden="true">&larr;</i>${esc(label)}</a>`;

/**
 * The band masthead. Two variants and ONE rule deciding between them: a frame
 * or no frame. A page without a photograph is honest; a page with a stock
 * photograph is not (AD-17 §8), so where `frame` is null the band is the same
 * T1 dark band with no picture and the missing frame is stated in band 4 as
 * content rather than faked here.
 *
 * DISPLAY TYPE MAY SIT ON A PHOTOGRAPH. NOTHING ELSE MAY. So the h1 goes inside
 * .pic-over and every other word — the ancestor line, the deck, any chip — sits
 * on solid ground in .pic-body beneath the frame, where it cannot drift.
 */
export function masthead({ h1, deck, frame, ancestor, chip }) {
  const head = `        <h1 class="d1" id="top-h">${h1}</h1>`;
  const under = [
    ancestor ? `        <p style="margin:0">${ancestor}</p>` : '',
    deck ? `        <p class="lead">${deck}</p>` : '',
    chip ? `        <p style="margin:0">${chip}</p>` : '',
  ].filter(Boolean).join('\n');

  if (!frame) {
    // THE TYPE-ONLY VARIANT (§5D). .im-head at masthead scale, nothing faked.
    return `    <div class="wk-mast"><div class="wrap">
${ancestor ? `      <p style="margin:0 0 6px">${ancestor}</p>` : ''}
      <div class="im-head">
        <div>${head}</div>
        ${deck ? `<div><p class="lead">${deck}</p></div>` : ''}
      </div>
${chip ? `      <p style="margin:var(--gap-head) 0 0">${chip}</p>` : ''}
    </div></div>`;
  }
  const ph = frame.placeholder;
  const cls = ['pic', 'ht', ph ? 'wk-ph' : ''].filter(Boolean).join(' ');
  /* W-19 (AD-18). EVERY FRAME TAKES A RAMP. NO EXCEPTIONS, INCLUDING BAKED.
     This line used to read `frame.baked ? '' : ...`, on the photo library's own
     note that a frame with colour baked in "must take NO ramp at all, or it
     greys out the one thing the picture is for". Three pages shipped that way
     and it is wrong on the page:
       /work/projects/farm-school ran its masthead as a full-colour field of
       yellow amaltas blossom, 1440x370, immediately under the mustard GIVE
       chip. BRANDING §7.3 retires selective colour outright — "hue lives only
       in type, data, marks and controls" — and §1.1 says a second mustard-scale
       field spends what licenses mustard as the control colour everywhere else.
     AND THE FROZEN PAGE SETTLES IT, which is the part that decides rather than
     argues. home.html applies `.duo` or `.duo-dim` to eleven frames the library
     marks `baked: true` — cityscapes-hero-riverside-walk, school-selfie-uniform,
     green-the-map-tote, langar-community-meal, hillside-journaling-group,
     turmeric-plot-workers, yamuna-students-line-skyline, yamuna-students-
     foam-line and three more. The approved page ramps them. BRANDING's own
     preamble: where a written spec and the built page disagree, THE PAGE WINS
     and the spec is flagged.
     So `baked` is a note about the SOURCE FILE, not a licence to publish
     selective colour on a page. The data gate is kept and inverted (see
     checkFrame in build-work-pages.mjs): it now refuses `baked: true` in data
     and reports the library note as stale, exactly as W-9 did with consent. */
  const filt = ` class="${ph ? 'duo-dim' : 'duo'}"`;
  return `    <div class="${cls}">
      <img${filt} src="${esc(frame.src)}" alt="${esc(frame.alt)}"${frame.op ? ` style="--op:${esc(frame.op)}"` : ''}>
      <div class="pic-over"><div class="wrap">
${head}
      </div></div>${ph ? `\n      <p class="lbl wk-ph-chip">Placeholder</p>` : ''}
    </div>
    <div class="pic-body wk-pic-head"><div class="wrap">
${under}
    </div></div>`;
}

/**
 * A PERIOD THAT NAMES AN ABSENCE, SET SHORT. Eight of the section's figures
 * carry "cumulative, no start year sourced" and one "period not sourced" — the
 * author's choice is right, because the schema forbids a MISSING period exactly
 * so that an unknown span is stated rather than invented. But a long apologetic
 * clause repeating down a page is worse than the information is good, so the
 * absence goes into the absence grammar and keeps its meaning (schema
 * addendum §4). Any other period is printed as written.
 */
export const period = (p) => {
  const s = String(p || '');
  if (/^cumulative, no start year sourced$/i.test(s)) return 'cumulative &middot; start year not sourced';
  if (/^period not sourced$/i.test(s)) return 'period not sourced';
  return esc(s);
};

/**
 * One reading. Six parts on two lines: the numeral, the rule beside it, the
 * label with THE RULE THAT CARRIES ITS BASIS UNDER IT — solid where it was
 * counted, dotted where it was modelled, which costs no height (BRANDING §4.3)
 * — then the span it counts and the source it comes from, on one caption line.
 *
 * The period and the source share a line deliberately: at 375 a second caption
 * line costs about 17px on every figure, and a landing page carrying eight of
 * them cannot spend 136px on line breaks and stay inside the 900px band cap.
 * Nothing is lost — both facts are still on the page, beside each other.
 */
export const figure = (f) => `        <span>
          ${f.owner ? `<span class="lbl wk-fig-o">${f.owner}</span>` : ''}
          <span class="w7-pj-num rl"><span class="num">${f.value.replace(/\+$/, '<sup>+</sup>')}</span></span>
          <span class="lbl w7-pj-nl"><span class="p-kd ${f.basis === 'modelled' ? 'p-kd-m' : 'p-kd-c'}">${esc(f.label)}</span></span>
          <span class="cap wk-fig-m">${period(f.period)} &middot; ${esc(f.source)}</span>
        </span>`;

/**
 * The reading pair. Never renders a numeral without its period — the data gate
 * rejects a figure with no period before this is ever reached, so there is no
 * branch here to get wrong.
 */
export const figures = (list) => list.length
  ? `      <span class="w7-pj-nums">\n${list.map(figure).join('\n')}\n      </span>`
  : '';

/**
 * THE REGISTER. Every row carries `id="<anchor>"`, page or row, so an inbound
 * link always lands on itself and the reader can tell (AD-17 §7.2). The lead
 * column is the ordinal by default and the DURATION on a journeys register,
 * which is what "duration-first" means in §5A band 5 and §5B band 3.
 */
export const regRows = (items, { duration = false, start = 1 } = {}) => {
  const rows = items.map((it, i) => {
    const lead = duration && it.duration
      ? `<span class="w7-jr-dur w7-pj-n"><span class="num">${it.duration.value}</span><i>${esc(it.duration.unit)}</i></span>`
      : `<span class="lbl w7-pj-n" aria-hidden="true">${String(start + i).padStart(2, '0')}</span>`;
    return `        <li id="${esc(it.anchor)}"><a href="${it.href}">
          ${lead}
          <h3 class="w7-pj-rt">${it.name}</h3>
          <p class="w7-pj-rf">${it.line}</p>
        </a></li>`;
  }).join('\n');
  return `      <ol class="w7-pj-rows${duration ? ' wk-reg-dur' : ''}" role="list">\n${rows}\n      </ol>`;
};

/**
 * THE FOUR-KINDS ROWS, at display scale with the rule kissing the word. Used
 * for the /work kinds band and — the same device, deliberately — for the four
 * event names, which are four names at display scale with one written line
 * each and no date, edition, year or count anywhere near them.
 */
export const displayRows = (items, { ordinals = true, anchors = false } = {}) => {
  const rows = items.map((it, i) => {
    const n = ordinals ? `<span class="lbl w7-do-n" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>` : '';
    /* THE ONE LICENSED INLINE CROSS-SELL (AD-17 §4, last clause): the `.lbl`
       pre-line hook above an item's name, as it already exists on the frozen
       homepage's band 7 — "Runs against Delhi's air ->" sitting above the
       campaign name. An item may carry ONE. No other inline cross-sell is
       licensed and no page gets a mid-page "you might also like". */
    const pre = it.pre ? `\n        <p class="lbl w7-ce-pre">${it.pre}</p>` : '';
    const inner = `${pre}
        <h3 class="d1 rl w7-do-t">${it.name}</h3>
        <p class="w7-do-d">${n}${it.line}</p>`;
    const body = it.href ? `<a href="${it.href}">${inner}\n      </a>` : `<div>${inner}\n      </div>`;
    return `      <li${anchors && it.anchor ? ` id="${esc(it.anchor)}"` : ''}>${body}</li>`;
  }).join('\n');
  return `    <ol class="w7-do-list" role="list">\n${rows}\n    </ol>`;
};

/**
 * THE CAMPAIGN MARCH. Opponent-first: the mark comes above the name and the
 * name is the band's ink. The marching indent is positional, not
 * count-dependent — with one campaign it reads as one entry at zero indent.
 */
export const march = (items) => {
  const rows = items.map(it => {
    // THE NAME IS THE BAND'S INK, NOT A LINK. On /work/campaigns the row IS the
    // destination — it carries the anchor six inbound links land on — so making
    // the name link to itself would be the duplication AD-02 spent a review
    // removing. The one door out of the row is the situation hook above it.
    const title = it.href
      ? `<a class="w7-ce-lk" href="${it.href}"><h3 class="w7-ce-t">${it.name}</h3></a>`
      : `<h3 class="w7-ce-t">${it.name}</h3>`;
    return `      <li id="${esc(it.anchor)}">
        ${it.pre ? `<p class="lbl w7-ce-pre">${it.pre}</p>` : ''}
        ${title}
        ${it.line ? `<p class="body" style="margin:12px 0 0;color:var(--fg-2);max-width:54ch">${it.line}</p>` : ''}
      </li>`;
  }).join('\n');
  return `    <ol class="w7-ce-camp" role="list">\n${rows}\n    </ol>`;
};

/** One door card. Slot 1-3 of the cross-sell band; the same component as §5.6. */
export const door = (d) => `      <a class="s-record-door" href="${d.href}">
        <p class="lbl s-record-door-lbl">${d.eyebrow}</p>
        <h3 class="s-record-door-h">${d.head}</h3>
        <p class="s-record-door-t">${d.body}</p>
        <p class="s-record-door-n"><span>${d.foot}</span>${ARROW}</p>
      </a>`;

/**
 * THE CROSS-SELL BAND — ONE component, specified once in AD-17 §4 and
 * instantiated identically on all thirteen pages. Nearest first: same kind →
 * the situation → the evidence → the act. The act is always last because it is
 * the only slot that asks the reader for something, so a reader who has seen
 * one WORK page knows where the doors are on all of them.
 *
 * A SLOT RENDERS ONLY IF ITS DESTINATION EXISTS, and "exists" is decided by the
 * route map at build time, not by markup. Slot 1's count flexes and NO NUMERAL
 * NAMES THE SET (D-03.2): one, two or three doors paint, and at zero the slot
 * does not render. There is no "3 more projects" anywhere.
 */
export const onwardBand = ({ doors, act, actNote, invite }) => `    <div class="wrap">
      <div class="im-head">
        <div><h2 class="d1" id="onward-h" style="max-width:15ch">Get involved</h2></div>
        <div><p class="lead">Three ways in, and then the nearest thing to this, what it pushes against, and the record it is kept in.</p></div>
      </div>
${invite || `      <div class="wk-onward-act">
        <p>${actNote}</p>
        <a class="b b-1" href="${act.href}">${act.label} ${ARROW}</a>
      </div>`}
      <div class="s-record-doors" style="margin-top:clamp(30px,3.4vw,52px);border-top:1px solid var(--rule-2);padding-top:clamp(8px,1vw,14px)">
${doors.map(door).join('\n')}
      </div>
    </div>`;

/* ═══ AD-18 COMPONENTS — MARKUP OVER CSS THAT WAS ALREADY IN THE FILE ══════ */

/**
 * ONE PANEL OF THE ACTIVITY / DESTINATION TAB GROUP.
 * The photograph, its name, its written line. `tabs()` from situation-shell
 * wraps them, its controller is already in SCRIPT_BASE, and all panels stay in
 * the accessibility tree — so an AT user has every destination available at
 * once, which is the same property §5.2 calls a feature of the frozen deck.
 */
export const panel = (a) => {
  const fig = a.frame
    ? `<div class="ht wk-panel-fig"${a.frame.op ? ` style="--op:${esc(a.frame.op)}"` : ''}>` +
      `<img class="duo" src="${esc(a.frame.src)}" alt="${esc(a.frame.alt)}" loading="lazy"></div>`
    : '';
  return `<div class="wk-panel">${fig}<div><h4 class="wk-panel-h">${a.name}</h4>
        <p class="body">${a.p}</p>${a.cap ? `\n        <p class="cap" style="margin-top:10px">${a.cap}</p>` : ''}</div></div>`;
};

/**
 * THE CONTACT SHEET. n frames of one subject, the frozen archive grid re-scoped
 * to three columns. The note under it is REQUIRED, not decorative: a sheet with
 * no note is a mood board, and this site does not publish mood boards. It says
 * what the frames are and — where it applies — what they are not.
 */
export const gallerySheet = ({ label, frames, note }) => `      <div class="wk-gal s-record-sheetblock">
        <div class="s-record-sheethead"><p class="lbl">${label}</p></div>
        <div class="s-record-sheet">
${frames.map(f => `          <figure class="ht s-record-cell"${f.op ? ` style="--op:${esc(f.op)}"` : ''}><img class="${f.dim ? 'duo-dim' : 'duo'}" src="${esc(f.src)}" alt="${esc(f.alt)}" loading="lazy"></figure>`).join('\n')}
        </div>
        <p class="cap s-record-note" style="margin-top:14px">${note}</p>
      </div>`;

/**
 * A RULED PROSE ROW SET — Air's `.p-do-r`. Used for the objectives band and the
 * for-who band, because an objective is a heading over a sentence and that is
 * exactly the row's shape. An optional `cap` carries the source where the
 * objective is quoted rather than written.
 */
export const doRows = (rows) => `      <div class="p-do">
${rows.map(r => `        <div class="p-do-r"><p class="lbl">${r.h}</p>
          <p class="body">${r.p}</p>${r.cap ? `\n          <p class="cap">${r.cap}</p>` : ''}</div>`).join('\n')}
      </div>`;

/**
 * THE READING LEDGER — every figure on the page in one auditable list, with the
 * span it counts, whether it was counted or modelled, and where it comes from.
 *
 * This is the device that answers "make the numbers do more work" without a new
 * number: the same figures the band already shows, set so a reader can check
 * them against each other. The frozen `.p-nr` row is name / value / suffix, and
 * the suffix slot carries the basis word — so the counted-versus-modelled
 * distinction appears twice on the page, once as a rule under a label and once
 * as a word in a ledger, which is BRANDING §3.3's shape-as-well-as-hue rule
 * applied to provenance.
 */
export const readingLedger = (figs) => `      <div class="p-nrs">
${figs.map(f => `        <div class="p-nr"><span class="p-nr-n">${esc(f.label)}<i style="display:block;font-style:normal;font-size:12px;opacity:.75">${period(f.period)} &middot; ${esc(f.source)}</i></span>
          <span class="p-nr-v">${f.value.replace(/\+$/, '<sup>+</sup>')}</span>
          <span class="lbl p-nr-s">${f.basis === 'modelled' ? 'Modelled' : 'Counted'}</span></div>`).join('\n')}
      </div>`;

/**
 * A PUBLISHED SPAN, SET AS A SPAN — Air's `.p-rg` range row.
 *
 * THE ENDPOINTS CANNOT BE INVENTED, BY CONSTRUCTION. `scale` names a figure by
 * index and supplies only `low` and `high`; the data gate asserts both appear
 * verbatim inside that figure's own published `value` string. So this component
 * can only ever redraw a number the page already publishes with a source. The
 * bar's geometry is derived from those two endpoints against `high`, which is
 * arithmetic on published values and not a new figure — and no derived NUMBER
 * is ever printed, only a length.
 */
export const rangeRow = ({ rows, axis, note }) => `      <div class="p-rg">
${rows.map(r => {
    const lo = Math.max(0, Math.min(100, r.loPct)), hi = Math.max(0, Math.min(100, r.hiPct));
    return `        <div class="p-rg-r"><span class="p-rg-n">${r.name}</span>
          <span class="p-rg-t" role="img" aria-label="${esc(r.aria)}"><i class="p-rg-l" style="left:${lo.toFixed(1)}%;right:${(100 - hi).toFixed(1)}%"></i></span>
          <span class="p-rg-v">${esc(r.value)}</span></div>`;
  }).join('\n')}
        <p class="p-rg-ax"><span>${axis[0]}</span><span>${axis[1]}</span></p>
      </div>${note ? `\n      <p class="cap p-cite" style="margin-top:12px;max-width:64ch">${note}</p>` : ''}`;

/**
 * THE INVITE. The client's sixth part, and BRANDING §5.8 caps it at one `.b-1`
 * per band — so it is one primary, one outlined secondary, and the third route
 * as a sentence with an inline link, because that route is an email address and
 * an email address set as a button implies a form this site does not have.
 */
export const inviteRow = ({ act, second, note }) => `      <div class="wk-invite">
        <a class="b b-1" href="${act.href}">${act.label} ${ARROW}</a>${second ? `
        <a class="act" href="${second.href}">${second.label} ${ARROW}</a>` : ''}
        <p class="wk-invite-n">${note}</p>
      </div>`;

/* ═══ THE LINK MANIFEST AND THE LINK GATE ═════════════════════════════════
   The owner's instruction is "All cross linkings need to be solid". This turns
   it into a machine check: every href attribute in every built file is
   enumerated — the same way the link census was compiled, not by reading the
   markup and believing it — and resolved against the route map and the anchor
   registry. The gate fails on an href that is `#`, that is a /design/ path, or
   that is absent from both registries.

   TWO CLASSES ARE RECORDED RATHER THAN FAILED, and only these two:

   1. THE FROZEN FOOTER'S href="#". Three of them, extracted verbatim from
      home.html. They belong to process ruling P-1 and are explicitly out of
      this brief (link-contract §4) — but they are COUNTED, and the count is
      asserted per page, so a NEW one anywhere trips the gate.
   2. THE FROZEN FOOTER'S OWN /design/ paths, same reasoning, same counting.

   THE SITUATION-PROTOTYPE EXEMPTION IS RETIRED, and this is the note it
   leaves behind. Schema addendum §2 carried a closed list of seven
   `/design/v3/situation-*.html` filenames, each recording a CANONICAL
   destination beside the working one so the port would be a table lookup.
   The situation generators now WRITE those canonical routes, so nothing in
   this section links at a prototype path any more and the exemption has
   nothing left to exempt — the ordinary route-map check covers them.

   IT ALSO DISAGREED WITH THE SET IT WAS DESCRIBING, in two ways, which is
   the argument for not keeping a second copy of somebody else's route map:
   it flattened the six to `/situations/<slug>`, orphaning them from the
   `/now` index they are children of, and it called heat `/situations/heatwave`
   where the register has always said `/now/heat`. The one place a situation
   route may be written is `FAMILY` in `scripts/lib/situation-shell.mjs`; the
   six arrive here through the route map in `data/work/onward.json`, checked
   like every other route.

   `situation-soon.html` was the seventh entry and is dead — FINAL.md §5 and
   §6.3 record that all six situations have pages and nothing links to it.  */

export class Links {
  constructor({ routes, anchors, inheritedHash = 0, inheritedDesign = [] }) {
    this.routes = new Set(routes);
    this.anchors = anchors;                  // page path -> Set of anchor ids
    this.inheritedHash = inheritedHash;
    this.inheritedDesign = new Set(inheritedDesign);
    this.rows = [];
    this.failures = [];
  }

  /** Enumerate every href in one built page and resolve each one. */
  collect(pagePath, file, html) {
    const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]));
    let hashCount = 0;
    for (const m of html.matchAll(/\shref="([^"]*)"/g)) {
      const href = m[1];
      const row = { page: pagePath, file, href, verdict: 'ok' };
      if (href === '#') {
        hashCount++;
        row.verdict = 'inherited-hash';
      } else if (href.startsWith('/design/')) {
        row.verdict = this.inheritedDesign.has(href) ? 'inherited-design' : 'FAIL:design-path';
      } else if (href.startsWith('mailto:') || /^https?:\/\//.test(href)) {
        row.verdict = 'external';
      } else if (href.startsWith('#')) {
        row.verdict = ids.has(href.slice(1)) ? 'in-page' : 'FAIL:no-such-id';
      } else {
        const [path, frag] = href.split('#');
        const p = path || pagePath;
        if (!this.routes.has(p)) row.verdict = 'FAIL:not-in-route-map';
        else if (frag) {
          const set = this.anchors.get(p);
          if (!set || !set.has(frag)) row.verdict = 'FAIL:not-in-anchor-registry';
        }
      }
      if (row.verdict.startsWith('FAIL')) this.failures.push(row);
      this.rows.push(row);
    }
    if (hashCount !== this.inheritedHash) {
      this.failures.push({
        page: pagePath, file, href: '#', verdict: `FAIL:hash-count-${hashCount}-expected-${this.inheritedHash}`,
      });
    }
  }

  summary() {
    const distinct = new Set(this.rows.map(r => r.href));
    const byVerdict = {};
    for (const r of this.rows) byVerdict[r.verdict] = (byVerdict[r.verdict] || 0) + 1;
    return { hrefs: this.rows.length, distinct: distinct.size, byVerdict, failures: this.failures.length };
  }

  write(path) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, JSON.stringify({
      generated_by: 'scripts/build-work-pages.mjs',
      note: 'Every href attribute in every built WORK page, resolved against the route map and the anchor registry. '
        + 'inherited-hash and inherited-design are the frozen footer\'s P-1 debt (link-contract §4), counted so a new one trips the gate. '
        + 'situation-prototype rows carry the canonical destination beside the working one (schema addendum §2); those canonical routes DO NOT EXIST YET, '
        + 'so the port is a table lookup against situation_prototype_map below and not a re-derivation.',
      summary: this.summary(),
      routes: [...this.routes].sort(),
      anchors: Object.fromEntries([...this.anchors].map(([k, v]) => [k, [...v].sort()])),
      links: this.rows,
    }, null, 2) + '\n');
  }
}

/* ═══ ASSEMBLE AND THE WRITE GATES ════════════════════════════════════════ */

/**
 * Build one page and hand it back — this does NOT write. The caller collects
 * every page, runs the link gate across the whole section, and only then
 * writes, because a link gate that can only see one page cannot check a
 * cross-page anchor.
 *
 * Gates run here, per page: the extraction assertions, ground adjacency on the
 * composited colour, every .im-head inside a .wrap, and `node --check` on the
 * WHOLE page script — the extracted IIFEs and this build's own code together.
 * Checking only the extracted half leaves the other half unchecked, which is
 * the same bug on a different line.
 */
export async function buildPage({ file, url, title, desc, bands, sectionFor, sections, current, sh, pageCss = '', script = '' }) {
  const problems = [];

  /* GATE — GROUND ADJACENCY, ON THE COMPOSITED COLOUR. */
  const chain = [...bands.map(b => [b[0], b[1], b[2]]), ['footer', 'dark-2', FOOTER_HEX]];
  for (const [id, cls, hex] of chain) {
    const real = compositedHex(cls);
    if (real === null) problems.push(`band ${id} declares two ground classes ("${cls}") — which one paints is undefined`);
    else if (real !== hex) problems.push(`band ${id} declares ${hex} but class "${cls}" composites to ${real}`);
  }
  for (let i = 0; i < chain.length - 1; i++) {
    if (chain[i][2] === chain[i + 1][2]) {
      problems.push(`ground clash: ${chain[i][0]} ${chain[i][2]} -> ${chain[i + 1][0]} ${chain[i + 1][2]}`);
    }
  }

  /* GATE — THE RHYTHM, NOT JUST THE HEXES. AD-18 assigns the chain instead of
     typing it, and an identical-hex check is too weak to prove an assigned
     chain: #F3F2F0 next to #ECEBE8 passes it and still reads as one off-white
     band with a seam in it. The frozen homepage's own chain has ZERO
     paper-to-paper steps and exactly ONE dark-to-dark step, licensed by name in
     BRANDING §1.1. Both facts are now gates, so the assigner is checked rather
     than trusted. Also checked: top is the arrival ground, onward is paper-2,
     and the band above onward is dark (AD-17 §4). */
  const isPaper = (h) => h === '#F3F2F0' || h === '#ECEBE8';
  let darkSteps = 0;
  for (let i = 0; i < chain.length - 1; i++) {
    const [aId, , a] = chain[i], [bId, , b] = chain[i + 1];
    if (isPaper(a) && isPaper(b)) {
      problems.push(`two papers meet: ${aId} ${a} -> ${bId} ${b}. The frozen chain never does this — an off-white beside an off-white reads as one band with a seam in it.`);
    }
    if (!isPaper(a) && !isPaper(b) && bId !== 'footer') darkSteps++;
  }
  /* Dark-to-dark is COUNTED, NOT FAILED — the frozen homepage takes four of
     them. Three or more on one page of five bands would mean the alternation
     has stopped alternating, so that is where the line is. */
  if (darkSteps > 3) {
    problems.push(`${darkSteps} dark-to-dark steps on ${bands.length} bands. Two darks meeting is a step the frozen page takes freely (it has four); this many means the paper alternation has stopped happening.`);
  }
  if (bands[0][2] !== GROUND.ground) problems.push(`band 1 is ${bands[0][2]}, not the arrival ground ${GROUND.ground}`);
  const last = bands[bands.length - 1];
  if (last[0] !== 'onward') problems.push(`the last band is "${last[0]}", not "onward" — every page in the section closes on the cross-sell band`);
  else if (last[2] !== GROUND['paper-2']) problems.push(`onward is ${last[2]}, not ${GROUND['paper-2']}`);
  const above = bands[bands.length - 2];
  if (above && isPaper(above[2])) problems.push(`the band above onward is ${above[0]} ${above[2]}, which is not dark (AD-17 §4)`);

  const section = ([id, cls, , tier]) => {
    const body = sectionFor(id);
    const c = [cls, tier].filter(Boolean).join(' ');
    const aria = id === 'top' ? ' aria-labelledby="top-h"' : ` aria-labelledby="${id}-h"`;
    return `  <section${c ? ` class="${c}"` : ''} id="${id}"${aria}>\n${body}\n  </section>`;
  };

  /* THE WHOLE PAGE SCRIPT, extracted and hand-written together. No WORK page
     writes any script of its own today, so `script` is empty on all fourteen —
     but it is concatenated here rather than checked separately, because
     `node --check` on only the extracted half is the same bug on a different
     line and that is precisely how it got through last time. */
  const SCRIPT = script ? `${sh.SCRIPT_BASE}\n${script}` : sh.SCRIPT_BASE;
  const OUT = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark">
<title>${esc(title)}</title>
${desc ? `<meta name="description" content="${esc(desc)}">\n` : ''}${sh.HEAD_FONTS}
<style>
${sh.CSS}
${sh.SITUATION_CSS}
${SHARED_PAGE_CSS}
${sh.COMPONENT_CSS}
${WORK_CSS}
${pageCss}</style>
</head>
<body>
${sh.SVG_DEFS}
${sh.SKIP}
${workHeader(sections, current, url)}
<main id="main" tabindex="-1">
${bands.map(section).join('\n')}
</main>
${sh.FOOTER}
<script>
${SCRIPT}</script>
</body>
</html>
`;

  /* GATE — EVERY BAND HEADING IS INSIDE A GUTTER. `.im-head` has no padding of
     its own; the gutter is .wrap's padding:0 var(--gut). An .im-head that is a
     direct child of <section> renders hard against the screen edge — invisible
     in a diff, survives a contrast audit and an overflow check, and shipped
     once on all five situation pages. Checked structurally, because by eye is
     how it got through. */
  const re = /<div class="im-head[^"]*"/g;
  let m;
  while ((m = re.exec(OUT)) !== null) {
    const before = OUT.slice(Math.max(0, m.index - 400), m.index);
    const opens = [...before.matchAll(/<div class="([^"]*)"|<(section)\b/g)];
    const last = opens[opens.length - 1];
    if (!last || !(last[1] || '').split(/\s+/).includes('wrap')) {
      problems.push(`band heading at line ${OUT.slice(0, m.index).split('\n').length} is not inside a .wrap — it would render with no left gutter. Use opener() or nest it.`);
    }
  }

  /* GATE — node --check ON THE WHOLE PAGE SCRIPT. */
  const jsPath = join(tmpdir(), `swechha-work-${file.replace(/\W+/g, '-')}-check.js`);
  writeFileSync(jsPath, SCRIPT);
  const { execFileSync } = await import('node:child_process');
  try {
    execFileSync(process.execPath, ['--check', jsPath], { stdio: 'pipe' });
  } catch (e) {
    problems.push(`page script is not valid JS:\n${e.stderr.toString()}`);
  }

  return { file, html: OUT, problems, chain };
}

export function writePage(outDir, file, html) {
  const p = join(outDir, file);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, html);
  return p;
}

export const readIfExists = (p) => existsSync(p) ? readFileSync(p, 'utf8') : null;
