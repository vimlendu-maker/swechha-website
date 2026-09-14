/* /method — how a reading is decided. NEXT list item 12.
 *
 * ★ THE PAGE EXISTS BECAUSE THE METHOD WAS THE ONE THING THIS SITE NEVER SAID
 * IN ONE PLACE. The rule lived in a sentence on the situations index; the
 * counted-versus-modelled split lived on the impact register; the
 * observation-time rule lived in the licence page; the four evidence words for
 * a cause lived only in a standard no reader can open. A method distributed
 * across four pages is owned by none of them, and cannot be cited, taught, or
 * argued with by somebody who thinks it is wrong.
 *
 * ★ IT STATES THE EDITORIAL RULES AND NOT THE MACHINERY, AND THE DIFFERENCE IS
 * LOAD-BEARING. The event standard already settled this and the build enforces
 * it: reader-visible text may not name a build script, because a page
 * describing how it was made reads as "a machine explaining itself rather than
 * an organisation reporting a flood". That ruling is about a page nobody opened
 * to ask how the site works. THIS page is the one a reader opens for exactly
 * that, so it is where the rules legitimately live — the rules a person
 * applies, never the code that applies them. No score, no publication gate, no
 * pipeline, no filenames. `visibleOnly` in the shared pattern list refuses the
 * build if that slips.
 *
 * ★ NOTHING HERE IS NEW. Every rule on the page is already in force somewhere,
 * and gate 3 below re-checks the two most load-bearing of them against the
 * pages that actually implement them — so this page cannot drift into
 * describing a site that no longer behaves this way. A method page that has
 * gone stale is worse than none: it is a promise with a date on it.
 *
 * ★ NOT A NAV WORD. The bar is closed at six plus the Give chip. /method is
 * reached from the footer's readings column, from the situations index, and
 * from the licence page — the three places a reader is already asking the
 * question. The footer row is `.foot-d` and collapses to /now, which links it,
 * so the withdrawal rule holds below 640px.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import * as S from './lib/situation-shell.mjs';
import { seo } from './lib/seo-register.mjs';

const { esc, opener, ARROW } = S;
const sh = S.shell();

const D = JSON.parse(readFileSync(join(S.ROOT, 'data/method.json'), 'utf8'));

let dataBad = 0;
const dataFail = (m) => { console.error(`DATA IS WRONG: ${m}`); dataBad++; };

/* ── DATA CHECKS. A method page with an empty section states a rule it does
      not have. ─────────────────────────────────────────────────────────── */
if (!D.reading?.rules?.length) dataFail('no reading rules.');
if (!D.limits?.kinds?.length) dataFail('no kinds of limit.');
if (!D.words?.sets?.length) dataFail('no vocabularies.');
if (!D.refuse?.items?.length) dataFail('no refusals — the page is an assertion without a cost.');
for (const s of D.words.sets) {
  if (!s.terms?.length) dataFail(`vocabulary "${s.h}" has no terms.`);
  for (const t of s.terms) {
    if (!Array.isArray(t) || t.length !== 2 || !t[0] || !t[1]) {
      dataFail(`a term in "${s.h}" is not a [word, meaning] pair.`);
    }
  }
}
if (dataBad) {
  console.error(`\nREFUSING TO WRITE: ${dataBad} data check(s) failed.`);
  process.exit(1);
}

/* ═══ BANDS ══════════════════════════════════════════════════════════════
   Ground chain proved below, not chosen: no two adjacent bands share a hex and
   the last does not share one with the footer (#151512). */
const BANDS = [
  ['top',     't1',         '#0D0D0B'],
  ['reading', 'paper t2',   '#F3F2F0'],
  ['limits',  't2',         '#0D0D0B'],
  ['words',   'paper-2 t3', '#ECEBE8'],
  ['refuse',  'dark-2 t2',  '#151512'],
  ['onward',  'paper t3',   '#F3F2F0'],
];
const clashes = S.groundChain(BANDS);

const INDEX = [
  ['What counts', '#reading'], ['The limits', '#limits'],
  ['The words', '#words'], ['What we refuse', '#refuse'], ['Where it applies', '#onward'],
];

const B = {};

/* ── BAND 1. MASTHEAD. ─────────────────────────────────────────────────── */
const M = D.masthead;
B.top = () => `    <div class="pic ht">
      <img class="duo" src="${M.frame.src}" alt="${esc(M.frame.alt)}"${S.imgDim(M.frame.src)} fetchpriority="high" style="--op:${M.frame.op}">
      <div class="pic-over"><div class="wrap">
        <p class="lbl eyebrow">${esc(M.kicker)}</p>
        <h1 class="d1">${M.h1}</h1>
      </div></div>
    </div>
    <div class="pic-body"><div class="wrap">
      <p class="lead">${esc(M.lead)}</p>
    </div></div>`;

/* ── BAND 2. WHAT COUNTS AS A READING. Six numbered rules, same ruled-row
      grammar the rest of the site uses for a register. ─────────────────── */
B.reading = () => `${opener('reading', D.reading.head, D.reading.lead)}
    <div class="wrap">
      <ol class="mt-rules" role="list">
${D.reading.rules.map((r, i) => `        <li class="mt-rule">
          <p class="lbl mt-rule-n">${String(i + 1).padStart(2, '0')}</p>
          <div class="mt-rule-b">
            <p class="mt-rule-h">${esc(r.h)}</p>
            <p class="body mt-rule-p">${esc(r.p)}</p>
          </div>
        </li>`).join('\n')}
      </ol>
    </div>`;

/* ── BAND 3. THE LIMITS. The five kinds, then the two statements that follow
      from them: no total, and over-the-limit is not unsafe. ────────────── */
B.limits = () => `${opener('limits', D.limits.head, D.limits.lead)}
    <div class="wrap">
      <dl class="mt-kinds">
${D.limits.kinds.map((k) => `        <div class="mt-kind">
          <dt class="mt-kind-k">${esc(k.k)}</dt>
          <dd class="mt-kind-p">${esc(k.p)}</dd>
        </div>`).join('\n')}
      </dl>
      <div class="mt-says">
        <div class="mt-say">
          <p class="d2 mt-say-h">${esc(D.limits.total.h)}</p>
          <p class="body mt-say-p">${esc(D.limits.total.p)}</p>
        </div>
        <div class="mt-say">
          <p class="d2 mt-say-h">${esc(D.limits.safe.h)}</p>
          <p class="body mt-say-p">${esc(D.limits.safe.p)}</p>
        </div>
      </div>
    </div>`;

/* ── BAND 4. THE WORDS. Four closed vocabularies. The TERM is set in the caps
      face the site uses for a state chip everywhere else, so a reader meeting
      one of these words on a situation page recognises it here. ────────── */
B.words = () => `${opener('words', D.words.head, D.words.lead)}
    <div class="wrap">
      <div class="mt-sets">
${D.words.sets.map((s) => `        <section class="mt-set">
          <h3 class="mt-set-h">${esc(s.h)}</h3>
          <p class="cap mt-set-p">${esc(s.p)}</p>
          <dl class="mt-terms">
${s.terms.map(([w, m]) => `            <div class="mt-term">
              <dt class="lbl mt-term-w">${esc(w)}</dt>
              <dd class="mt-term-m">${esc(m)}</dd>
            </div>`).join('\n')}
          </dl>
        </section>`).join('\n')}
      </div>
      <div class="mt-say mt-attr">
        <p class="d2 mt-say-h">${esc(D.words.attribution.h)}</p>
        <p class="body mt-say-p">${esc(D.words.attribution.p)}</p>
      </div>
    </div>`;

/* ── BAND 5. THE REFUSALS. The page's spine: an assertion with no cost is a
      slogan, and this is the cost. ────────────────────────────────────── */
B.refuse = () => `${opener('refuse', D.refuse.head, D.refuse.lead)}
    <div class="wrap">
      <ul class="mt-no" role="list">
${D.refuse.items.map((t) => `        <li class="mt-no-i">${esc(t)}</li>`).join('\n')}
      </ul>
    </div>`;

/* ── BAND 6. WHERE THE RULES ARE APPLIED. ──────────────────────────────── */
B.onward = () => `${opener('onward', D.onward.head, D.onward.lead)}
    <div class="wrap">
      <div class="mt-doors">
${D.onward.doors.map((d) => `        <a class="mt-door" href="${esc(d.href)}">
          <span class="lbl">${esc(d.kicker)}</span>
          <span class="mt-door-h">${esc(d.label)}</span>
          <span class="cap">${esc(d.note)}</span>
        </a>`).join('\n')}
      </div>
    </div>`;

/* ═══ PAGE CSS ═══════════════════════════════════════════════════════════
   NO BACKTICKS BELOW — this block is one template literal and a backtick in a
   comment silently terminates it. Every grid track is minmax(0,1fr), never a
   bare 1fr: 1fr is minmax(auto,1fr) and auto is min-content, so a long child
   blows the track out from the inside while overflow-x:clip hides the damage
   from a scrollWidth sweep. ─────────────────────────────────────────────── */
const PAGE_CSS = `
/* ── THE NUMBERED RULES. The same date-spine grammar the About page's record
      rail uses, with an ordinal in place of a year: a narrow fixed left column
      so the numbers line up as a column a reader can run down. */
.mt-rules{list-style:none;margin:0;padding:0}
.mt-rule{display:grid;grid-template-columns:minmax(0,1fr);gap:.35em 0;
  padding:clamp(16px,2vw,24px) 0;border-top:1px solid var(--rule-2)}
.mt-rule:first-child{border-top:2px solid var(--ink)}
.mt-rule-n{color:var(--ink-3);margin:0;font-variant-numeric:tabular-nums}
.mt-rule-h{margin:0 0 .3em;color:var(--ink);font-size:clamp(18px,1.5vw,23px);line-height:1.22}
.mt-rule-p{margin:0;color:var(--ink-2);max-width:62ch}

/* ── THE KINDS OF LIMIT. Dark ground, so the ink table is --fg*. */
.mt-kinds{margin:0 0 clamp(30px,4vw,52px);padding:0}
.mt-kind{display:grid;grid-template-columns:minmax(0,1fr);gap:.2em 0;
  padding:clamp(12px,1.5vw,17px) 0;border-top:1px solid var(--hair)}
.mt-kind:first-child{border-top:2px solid var(--rule)}
.mt-kind-k{margin:0;color:var(--mustard);font-size:clamp(16px,1.3vw,20px);line-height:1.25}
.mt-kind-p{margin:0;color:var(--fg-2);max-width:62ch}

/* ── THE TWO STATEMENTS. Display type inside a ruled block — the device the
      About page uses for its mission and its definition, not a new one. */
.mt-says{display:grid;grid-template-columns:minmax(0,1fr);gap:clamp(24px,3vw,40px)}
.mt-say{border-top:2px solid var(--hair);padding-top:clamp(14px,1.8vw,22px)}
.mt-say-h{margin:0 0 .4em;color:var(--fg);max-width:22ch}
.mt-say-p{margin:0;color:var(--fg-2);max-width:58ch}
.paper .mt-say,.paper-2 .mt-say{border-top-color:var(--rule-2)}
.paper .mt-say-h,.paper-2 .mt-say-h{color:var(--ink)}
.paper .mt-say-p,.paper-2 .mt-say-p{color:var(--ink-2)}

/* ── THE VOCABULARIES. Four blocks; the term takes the caps face so a word met
      on a situation page is recognisable here. */
.mt-sets{display:grid;grid-template-columns:minmax(0,1fr);gap:clamp(30px,4vw,48px);
  margin-bottom:clamp(30px,4vw,48px)}
.mt-set-h{margin:0 0 .35em;color:var(--ink);font-size:clamp(17px,1.35vw,21px);line-height:1.25}
.mt-set-p{margin:0 0 clamp(12px,1.5vw,18px);color:var(--ink-3);max-width:58ch}
.mt-terms{margin:0;padding:0}
.mt-term{display:grid;grid-template-columns:minmax(0,1fr);gap:.1em 0;
  padding:clamp(9px,1.1vw,13px) 0;border-top:1px solid var(--rule-2)}
.mt-term-w{margin:0;color:var(--ink)}
.mt-term-m{margin:0;color:var(--ink-2);max-width:60ch}
.mt-attr{margin-top:clamp(8px,1vw,14px)}

/* ── THE REFUSALS. No bullets and no ticks: a rule with a mark beside it reads
      as a checklist somebody completed. A hairline between each is enough. */
.mt-no{list-style:none;margin:0;padding:0}
.mt-no-i{color:var(--fg);margin:0;padding:clamp(11px,1.4vw,16px) 0;
  border-top:1px solid var(--hair);max-width:64ch;
  font-size:clamp(16px,1.25vw,19px);line-height:1.4}
.mt-no-i:first-child{border-top:2px solid var(--rule)}

/* ── THE DOORS. The .lr-door grammar from the knowledge sections, restated
      under this page's own prefix so a change here cannot reach those. */
.mt-doors{display:grid;grid-template-columns:minmax(0,1fr);gap:1px;background:var(--rule-2)}
.mt-door{display:grid;gap:.25em 0;background:var(--ground);
  padding:clamp(15px,1.9vw,22px) clamp(13px,1.5vw,18px);
  text-decoration:none;color:inherit;transition:background .14s}
.paper .mt-door{background:var(--paper)}
.mt-door:hover,.mt-door:focus-visible{background:var(--paper-2)}
.mt-door:focus-visible{outline:2px solid var(--ink);outline-offset:-3px}
.mt-door-h{color:var(--ink);font-size:clamp(17px,1.35vw,21px);line-height:1.22}
.mt-door .cap{color:var(--ink-2)}

@media (min-width:640px){
  .mt-rule{grid-template-columns:minmax(0,3.2em) minmax(0,1fr);gap:0 clamp(14px,2vw,28px)}
  .mt-kind{grid-template-columns:minmax(0,13em) minmax(0,1fr);gap:0 clamp(14px,2vw,28px)}
  .mt-term{grid-template-columns:minmax(0,11em) minmax(0,1fr);gap:0 clamp(12px,1.8vw,24px)}
  .mt-says{grid-template-columns:repeat(2,minmax(0,1fr))}
  .mt-doors{grid-template-columns:repeat(2,minmax(0,1fr))}
}
@media (min-width:1024px){
  .mt-sets{grid-template-columns:repeat(2,minmax(0,1fr));gap:clamp(30px,3.4vw,46px)}
  .mt-doors{grid-template-columns:repeat(4,minmax(0,1fr))}
}`;

const OUT = await S.assemble({
  file: 'method.html',
  route: '/method',
  title: seo('/method').title,
  desc: seo('/method').description,
  bands: BANDS, index: INDEX, sh, clashes,
  pageCss: PAGE_CSS,
  sectionFor: (id) => (B[id] || (() => '    <div class="wrap"><p class="lead">&mdash;</p></div>'))(),
  note: `${BANDS.length} bands + footer. ${D.reading.rules.length} rules, `
      + `${D.limits.kinds.length} kinds of limit, `
      + `${D.words.sets.reduce((n, s) => n + s.terms.length, 0)} defined words in `
      + `${D.words.sets.length} vocabularies, ${D.refuse.items.length} refusals.`,
});

/* ═══ POST-WRITE GATES ═══════════════════════════════════════════════════ */
let fail = 0;
const gate = (ok, msg) => { if (!ok) { console.error(`  FAIL ${msg}`); fail++; } else console.log(`  ok   ${msg}`); };
console.log('\nGATES');

const RENDERED = OUT.replace(/<style[\s\S]*?<\/style>/g, ' ')
  .replace(/<script[\s\S]*?<\/script>/g, ' ')
  .replace(/<!--[\s\S]*?-->/g, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&mdash;|&middot;|&nbsp;|&rsquo;/g, ' ')
  .replace(/\s+/g, ' ');

/* 1. EVERY DEFINED WORD REACHES THE PAGE. A vocabulary this page describes and
      does not print is the one failure a method page can have silently. */
const allTerms = D.words.sets.flatMap((s) => s.terms.map(([w]) => w));
const missing = allTerms.filter((w) => !RENDERED.includes(w));
gate(missing.length === 0,
  `all ${allTerms.length} defined words render${missing.length ? `; MISSING: ${missing.join(', ')}` : ''}`);

/* 2. NO MACHINERY IN THE READER'S VIEW. The shared pattern list already refuses
      a build script name; this is the rest of the vocabulary that would turn
      the page into the machine explaining itself. */
const MACHINE = [
  [/\bbuild script\b/i, 'a build script'],
  [/\bgenerator\b/i, 'the word generator'],
  [/\bpipeline\b/i, 'a pipeline'],
  [/\bpublication gate\b/i, 'the publication gate'],
  [/\bworkflow\b/i, 'a workflow'],
  [/\bcron\b/i, 'a cron'],
  [/\brepository\b/i, 'the repository'],
  [/\.json\b|\.mjs\b|\.html\b/, 'a filename'],
].filter(([re]) => re.test(RENDERED));
gate(MACHINE.length === 0,
  `no machinery in the reader's view${MACHINE.length ? `; FOUND: ${MACHINE.map((m) => m[1]).join(', ')}` : ''}`);

/* 3. THE TWO LOAD-BEARING RULES ARE STILL TRUE OF THE PAGES THAT IMPLEMENT
      THEM. A method page that has gone stale is worse than none: it is a
      promise with a date on it. Checked against built HTML on disk, not
      against a belief about it. */
const idx = readFileSync(join(S.V3, 'intelligence.html'), 'utf8');
gate(/no total/i.test(idx),
  'the situations index still refuses a total, which this page says it does');
/* The pattern is the fire page's OWN sentence, checked as it is written rather
   than as it was remembered: "No statute publishes a permitted number of fires
   or detections... this one cannot, and says so instead of inventing a
   benchmark." A first draft of this gate guessed at the wording and failed on a
   page that was behaving perfectly — which is the right way round for a gate to
   be wrong, but it still has to be fixed against the page and not the guess. */
const fire = readFileSync(join(S.V3, 'situation-forest-fire.html'), 'utf8');
gate(/No statute publishes a permitted number/i.test(fire)
  && /inventing a benchmark/i.test(fire),
  'a subject with no published limit still says so, which this page says it does');

/* 4. THE PAGE IS REACHED. A method nobody can find is a document, not a page.
      /now and /use-the-data are the two places a reader is already asking. */
for (const [file, label] of [['intelligence.html', '/now'], ['use-the-data.html', '/use-the-data']]) {
  const h = readFileSync(join(S.V3, file), 'utf8');
  gate(h.includes('href="/method"'), `${label} links to /method`);
}

/* 5. NO STATE CHIP. This page has no feed, and the four cadence words are
      DESCRIBED here rather than worn. Borrowing the site's most load-bearing
      vocabulary to say nothing about this page would spend it. */
gate(!/class="(?:state|tag) /.test(OUT), 'no source-cadence chip on a page with no feed');

console.log(`\n${OUT.length.toLocaleString('en-IN')} bytes. ${fail ? `${fail} gate(s) failed.` : 'All gates pass.'}`);
if (fail) process.exit(1);
