#!/usr/bin/env node
/**
 * verify-final.mjs — the acceptance test for every finished page.
 *
 *   npm run verify:final          # rebuild all, assert everything, report
 *   npm run verify:final -- --no-build   # assert the pages as they are on disk
 *
 * WHY THIS EXISTS RATHER THAN A LIST IN A MARKDOWN FILE.
 * A register of "final pages" written as prose goes stale the first time
 * somebody edits a generator, and nothing tells you. This file is the register,
 * and it is executable: `FINAL` below is the single source of truth for what is
 * finished, and running it proves every claim in it is still true.
 *
 * `docs/design/FINAL.md` is generated FROM this file, so the document and the
 * code cannot disagree. If you add a page, add it here and regenerate the doc.
 *
 * ★ WHAT IT ASSERTS, AND WHY EACH ONE IS HERE.
 * Every check below exists because the corresponding thing actually broke at
 * some point in this build:
 *
 *   builds            the generator still runs and its own five gates pass
 *   h1                the page is the page it claims to be
 *   bands             a band did not silently vanish or duplicate
 *   reading           THE IMPORTANT ONE. The page still contains the value its
 *                     committed dataset holds. This is what caught the index
 *                     claiming 412 while the Air page said 387, and the ticker
 *                     claiming 0.0 for a figure CPCB never published.
 *   states            the four-word vocabulary, and only those four
 *   money             present only where D-27 scopes it
 *   im-head in wrap   every band heading has a gutter (D-23.2)
 *   no placeholders   no unexpanded ${...} reached the HTML
 *
 * It needs NO credentials. Builds read committed JSON; only the fetchers need
 * keys. So this runs in CI.
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve, join } from 'node:path';
import { FAMILY, INDEX_PAGE } from './lib/situation-shell.mjs';

const ROOT = resolve(import.meta.dirname, '..');
const V3 = join(ROOT, 'public/_pages/v3');
const DATA = join(ROOT, 'data');
const J = (f) => JSON.parse(readFileSync(join(DATA, f), 'utf8'));
const NO_BUILD = process.argv.includes('--no-build');
const WRITE_DOC = process.argv.includes('--doc');

/* ═══ THE REGISTER ═══════════════════════════════════════════════════════
   ★ THIS IS NOT SEVEN PEERS. It is ONE PARENT AND SIX CHILDREN.
   /now is the situation index, and the six situations are born out of it: a
   reader arrives there, picks one, and lands on its page. Every child carries a
   crumb back to the parent and a rail to its five siblings, and `linkGraph`
   below asserts the relationship in BOTH directions — the parent must link to
   all six, and all six must link home.
   An earlier version of this file listed all seven in one flat array, which
   reads as seven equal pages and is the wrong model of the set.

   Every page is a build artefact. Editing the HTML is pointless; the change
   dies at the next build. `reading` is a FUNCTION, so the expected value is
   read from the same committed dataset the page reads — which is what makes
   this a cross-check rather than a restatement of itself.
   ═══════════════════════════════════════════════════════════════════════ */
export const INDEX = [
  {
    kind: 'index', file: 'intelligence.html', route: '/now',
    title: 'Now', h1: 'Every situationwe read',
    generator: 'scripts/build-intelligence.mjs', npm: 'build:index',
    bands: 3, money: false,
    states: ['LIVE', 'PERIODIC', 'OUT OF SEASON', 'DEMO DATA'],
    subject: 'The situation index. Six cards, six units, six kinds of limit, and no total.',
    // The index must carry every situation's own reading.
    reading: () => {
      const air = J('air-delhi.json');
      return [String(air.city_reading.aqi), '0.3', '2.43', '34,562'];
    },
    readingNote: 'the four figures it shares with the pages it points at',
  },
];

/* THE SIX CHILDREN, in the order the index lists them. */
export const SITUATIONS = [
  {
    kind: 'situation', famId: 'air', file: 'situation-air.html', route: '/now/air',
    title: 'Delhi’s air', h1: 'Delhi’s air',
    generator: 'scripts/build-situation-air.mjs', npm: 'build:situation-air',
    bands: 9, money: true,
    states: ['PERIODIC'],
    subject: 'AQI against CPCB’s own limit of 100, computed from station concentrations.',
    reading: () => [String(J('air-delhi.json').city_reading.aqi)],
    readingNote: 'the worst Delhi station’s computed AQI',
  },
  {
    kind: 'situation', famId: 'yamuna', file: 'situation-yamuna.html', route: '/now/yamuna',
    title: 'Delhi’s Yamuna', h1: 'Delhi’s Yamuna',
    generator: 'scripts/build-situation-yamuna.mjs', npm: 'build:situation-yamuna',
    bands: 10, money: true,
    states: ['PERIODIC'],
    subject: 'Dissolved oxygen at or below the detection limit, against a notified minimum of 5.0 mg/L.',
    reading: () => {
      const y = J('yamuna-cpcb-2025.json');
      return [String(y.reporting_floor.do), y.limits.do.label.replace('> ', '')];
    },
    readingNote: 'the BDL floor and its notified minimum',
  },
  {
    kind: 'situation', famId: 'heatwave', file: 'situation-heatwave.html', route: '/now/heat',
    title: 'India’s heat', h1: 'India’s heat',
    generator: 'scripts/build-situation-heatwave.mjs', npm: 'build:situation-heatwave',
    bands: 8, money: false,
    states: ['OUT OF SEASON'],
    subject: 'The hottest reading in the archive against IMD’s severe threshold, across 14 stations.',
    reading: () => {
      const h = J('heat-india.json');
      const d = J('deaths-ncrb-2024.json');
      return [String(h.national.hottest_on_record.tmax),
        d.per_situation.heatwave.deaths.toLocaleString('en-IN')];
    },
    readingNote: 'the record temperature and the recorded death toll',
  },
  {
    kind: 'situation', famId: 'fire', file: 'situation-forest-fire.html', route: '/now/forest-fire',
    title: 'India’s forest fires', h1: 'India’s forest fires',
    generator: 'scripts/build-situation-forest-fire.mjs', npm: 'build:situation-forest-fire',
    bands: 8, money: false,
    states: ['PERIODIC'],
    subject: 'Area burnt in one season. The one situation with no legal threshold.',
    reading: () => [Math.round(J('forest-isfr-2023.json').fire.burnt_area.total).toLocaleString('en-IN')],
    readingNote: 'FSI’s mapped burnt area',
  },
  {
    kind: 'situation', famId: 'loss', file: 'situation-forest-loss.html', route: '/now/forest-loss',
    title: 'India’s forest loss', h1: 'India’s forest loss',
    generator: 'scripts/build-situation-forest-loss.mjs', npm: 'build:situation-forest-loss',
    bands: 8, money: false,
    states: ['PERIODIC'],
    subject: 'Two official sources pointing opposite ways, published as two.',
    reading: () => {
      const g = J('gfw-india.json');
      const i = J('forest-isfr-2023.json');
      return [String(g.total.loss_mha), String(i.change_2021_to_2023.net_change_forest_cover)];
    },
    readingNote: 'the satellite loss and the official gain',
  },
  {
    kind: 'situation', famId: 'climate', file: 'situation-climate-event.html', route: '/now/climate-event',
    title: 'India’s extreme rain', h1: 'India’s extreme rain',
    generator: 'scripts/build-situation-climate-event.mjs', npm: 'build:situation-climate-event',
    bands: 8, money: false,
    states: ['PERIODIC'],
    subject: 'Days over IMD’s heavy-rain threshold, and the deaths from five named causes.',
    reading: () => {
      const c = J('climate-india.json');
      const d = J('deaths-ncrb-2024.json');
      const worst = [...c.stations].sort((a, b) =>
        b.last_complete.extreme_days - a.last_complete.extreme_days)[0];
      return [String(worst.last_complete.extreme_days),
        d.per_situation.climate_event.deaths.toLocaleString('en-IN')];
    },
    readingNote: 'the worst city’s breach count and the death toll',
  },
];

/** Parent first, then children — the order the register reports in. */
export const FINAL = [...INDEX, ...SITUATIONS];

/* Pages that are NOT final, recorded so the register is a complete picture of
   the directory rather than a flattering subset. */
export const NOT_FINAL = [
  { file: 'home.html', why: 'THE FROZEN DESIGN SOURCE. Not a deliverable in this set — it is the language every page above extracts from. Hand-maintained, and D-24.5 records that making it a build artefact is a real architectural change nobody has taken.' },
  { file: 'about.html', why: 'FINISHED, and not a prototype — AD-21 built it and it serves at /about. It is outside THIS test because the twelve checks above are situation-specific (crumb, five siblings, the four-word state vocabulary); none of them describe an About page. Its own gates live in scripts/build-about-page.mjs.' },
  { file: 'impact.html', why: 'FINISHED (AD-22), serving at /impact. Outside this test for the same reason as about.html — and worth naming, because it is the page that refuses the number it is named for, so a "reading" check would assert the opposite of its design.' },
  { file: 'farm.html', why: 'FINISHED (AD-24), serving at /farm. Outside this test for the same reason as about.html.' },
  { file: 'act.html', why: 'FINISHED (AD-25), serving at /act. Outside this test for the same reason as about.html.' },
  { file: 'stories/', why: 'FINISHED \u2014 five essay pages from scripts/build-essays.mjs, one per bylined piece recovered from the legacy blog, serving at /stories/<slug>. Outside this test for the same reason as about.html. Their own gates live in that generator; the load-bearing ones are the word-count check that fails if the Brizy extraction silently drops prose, and the provenance check that refuses an essay without a byline, a date and a link to where it first appeared \u2014 which is what replaced the source requirement after the owner ruled on 22 August that unsourced data is allowed off the situation pages.' },
  { file: 'search.html', why: 'FINISHED, serving at /search. Outside this test for the same reason as about.html \u2014 the twelve checks above are situation-specific. Its own gates live in scripts/build-search-page.mjs; the load-bearing ones assert that every built page on disk is in the index, that all 29 rows render server-side so the page reads without JavaScript, and that it does not index itself.' },
  { file: 'stories.html', why: 'FINISHED (AD-26), serving at /stories. Outside this test for the same reason as about.html \u2014 the twelve checks above are situation-specific. Its own gates live in scripts/build-stories-page.mjs, including the two that matter: every YouTube id resolves against data/media/youtube-index.json, and the page may not claim six films when two of R-3\'s six have no source on the channel.' },
  { file: 'publications.html', why: 'FINISHED (AD-26), serving at /publications. Its own gates live in scripts/build-publications-page.mjs; the load-bearing one reads every linked PDF\'s size off disk rather than trusting a typed figure, and refuses anything large enough to be a print master.' },
  { file: 'work/', why: 'FINISHED — 15 pages from scripts/build-work-pages.mjs, merged in PR #5 and serving under /work. It was in progress in a concurrent session when this line first read that way. It carries its own acceptance gate, the LINKS.json manifest, which fails the build on any unlisted or dead href.' },
];

/* ═══ NO BACKTICK INSIDE SHARED_PAGE_CSS ════════════════════════════════
   SHARED_PAGE_CSS is one template literal and a backtick anywhere inside it —
   including inside a comment — terminates it and every generator in the repo
   fails to parse. The block's own first line says so in capitals, it records
   that three builds were broken that way, and it has now happened twice more
   in one session. A warning that keeps being ignored is a missing check, so
   this is the check.
   Scoped to the literal, not the file: the module legitimately uses backticks
   everywhere else, including in the header template two hundred lines above. */
{
  const src = readFileSync(join(ROOT, 'scripts/lib/situation-shell.mjs'), 'utf8');
  const open = src.indexOf('export const SHARED_PAGE_CSS = `');
  if (open < 0) {
    console.error('  FAIL could not find SHARED_PAGE_CSS to check it for backticks');
    fail++;
  } else {
    const body = src.slice(open + 'export const SHARED_PAGE_CSS = `'.length);
    const end = body.indexOf('`');
    const after = body.slice(end + 1, end + 40).trim();
    /* The literal must end at a semicolon. If the first backtick after the
       opening one is followed by anything else, it closed the literal early —
       which is exactly what a backtick in a comment does. */
    const ok = after.startsWith(';');
    if (!ok) {
      console.error(`  FAIL SHARED_PAGE_CSS closes early — a backtick inside it, probably in a comment. `
        + `Text after the closing backtick: ${JSON.stringify(after.slice(0, 30))}`);
      fail++;
    } else {
      console.log('  ok   SHARED_PAGE_CSS contains no stray backtick');
    }
  }
}

/* ═══ THE CENSUS ═════════════════════════════════════════════════════════
   FINAL and NOT_FINAL are a register, and AD-23 already recorded what a
   register costs when it is not also a census: FINAL.md's generated text said
   "nothing links here" about situation-soon.html while two hero slides did.
   The same gap ran the other way here — about.html sat in NOT_FINAL reading
   "Prototype, outside this work" for a day after it shipped, and impact.html,
   farm.html and act.html were built, routed and merged without ever appearing
   in either list, so this file could report "7 of 7 pass" over a design set of
   ten pages and be telling the truth about a fraction of it.

   So: every page on disk must be accounted for by name. A new page fails this
   run until somebody says which list it belongs to and why. That is a
   deliberately annoying gate — being forced to write the sentence is the
   point, because the sentence is what the next session reads.
   ═══════════════════════════════════════════════════════════════════════ */
export function census(dir) {
  const known = new Set([...FINAL.map(f => f.file), ...NOT_FINAL.map(n => n.file)]);
  const onDisk = readdirSync(dir, { withFileTypes: true })
    .filter(e => (e.isFile() && e.name.endsWith('.html')) || (e.isDirectory() && known.has(e.name + '/')))
    .map(e => (e.isDirectory() ? e.name + '/' : e.name));
  return {
    unaccounted: onDisk.filter(f => !known.has(f)),
    missing: [...known].filter(f => !f.endsWith('/') && !existsSync(join(dir, f))),
  };
}

const VOCAB = ['LIVE', 'PERIODIC', 'DEMO DATA', 'OUT OF SEASON'];

/* ═══ RUN ════════════════════════════════════════════════════════════════ */
let fail = 0;
const results = [];

for (const p of FINAL) {
  const r = { file: p.file, checks: [], ok: true };
  const add = (name, pass, detail = '') => {
    r.checks.push({ name, pass, detail });
    if (!pass) { r.ok = false; fail++; }
  };

  if (!NO_BUILD) {
    try {
      execFileSync(process.execPath, [join(ROOT, p.generator)], { cwd: ROOT, stdio: 'pipe' });
      add('builds', true);
    } catch (e) {
      add('builds', false, (e.stderr?.toString() || e.message).split('\n').slice(0, 3).join(' '));
      results.push(r); continue;
    }
  }

  const path = join(V3, p.file);
  if (!existsSync(path)) { add('exists', false, 'file missing'); results.push(r); continue; }
  const html = readFileSync(path, 'utf8');

  // The page is the page it claims to be.
  const h1 = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1];
  const h1txt = h1 ? h1.replace(/<[^>]+>/g, '').replace(/&rsquo;/g, '’').replace(/\s+/g, '') : '';
  add('h1', h1txt === p.h1.replace(/\s+/g, ''), h1txt ? `got "${h1txt}"` : 'no h1');

  // Band count — a band did not silently vanish or duplicate.
  const bands = (html.match(/<section[^>]*id="/g) || []).length;
  add('bands', bands === p.bands, `${bands}, expected ${p.bands}`);

  // THE IMPORTANT ONE. The page still says what its dataset says.
  const want = p.reading();
  const missing = want.filter(v => !html.includes(v));
  add('reading', missing.length === 0,
    missing.length ? `missing ${missing.map(m => `"${m}"`).join(', ')}` : want.join(' · '));

  // The vocabulary, and only the vocabulary.
  /* TWO MARKUPS FOR ONE VOCABULARY, and that is a real family divergence.
     The five shell-built pages use the .tag component in caps ("PERIODIC").
     Air predates the shell and uses the frozen homepage's .state component in
     title case ("Periodic"). Both are legitimate frozen components and both
     say the right word, so both are accepted here — but the inconsistency is
     recorded in FINAL.md as an open item, to be resolved when Air is next
     touched for its own reasons. Silently accepting it without recording it
     would be how a divergence becomes permanent. */
  const chips = [...new Set([
    ...[...html.matchAll(/class="lbl tag tag-(?:live|periodic|demo|closed)">([^<]+)</g)].map(m => m[1].trim()),
    ...[...html.matchAll(/class="state[^"]*"[^>]*>(?:<i[^>]*><\/i>)?<span[^>]*>([^<]+)</g)]
      .map(m => m[1].trim().toUpperCase()),
  ])];
  const strays = chips.filter(c => !VOCAB.includes(c));
  add('states', strays.length === 0 && p.states.every(w => chips.includes(w)),
    strays.length ? `stray: ${strays.join(', ')}` : chips.join(', ') || 'none');

  // Money band only where D-27 scopes it.
  const hasMoney = /<section[^>]*id="money"/.test(html);
  add('money', hasMoney === p.money, hasMoney ? 'present' : 'absent');

  // Every band heading inside a gutter (D-23.2).
  let stray = 0;
  for (const m of html.matchAll(/<div class="im-head/g)) {
    const before = html.slice(Math.max(0, m.index - 400), m.index);
    const opens = [...before.matchAll(/<div class="([^"]*)"/g)];
    const last = opens[opens.length - 1];
    if (!last || !(last[1] || '').split(/\s+/).includes('wrap')) stray++;
  }
  add('headings in gutter', stray === 0, stray ? `${stray} outside .wrap` : 'all');

  // No unexpanded template placeholder reached the output.
  const ph = (html.match(/\$\{[A-Za-z_][\w.]*\}/g) || []).length;
  add('no placeholders', ph === 0, ph ? `${ph} found` : 'clean');

  /* ── THE LINK GRAPH, ASSERTED IN BOTH DIRECTIONS. ────────────────────
     The six situations are born out of /now. That relationship is only real
     if it is navigable both ways, so:
       a CHILD must link UP to the index, and to all five siblings
       the PARENT must link DOWN to all six children
     A page that stops linking home has orphaned itself, and an index that
     drops a card has orphaned a page. Neither is visible in a diff. */
  if (p.kind === 'situation') {
    add('links up to /now', html.includes(`href="${INDEX_PAGE.route}"`),
      html.includes(INDEX_PAGE.route) ? 'yes' : `no link to ${INDEX_PAGE.route}`);
    const sibs = FAMILY.filter(f => f.id !== p.famId);
    const missingSibs = sibs.filter(f => !html.includes(`href="${f.route}"`));
    add('links to 5 siblings', missingSibs.length === 0,
      missingSibs.length ? `missing ${missingSibs.map(f => f.name).join(', ')}` : `all ${sibs.length}`);
    add('carries its crumb', /class="fam-crumb"/.test(html) && html.includes(`of ${FAMILY.length} situations`),
      /class="fam-crumb"/.test(html) ? 'yes' : 'no crumb');
  } else {
    const missingKids = FAMILY.filter(f => !html.includes(`href="${f.route}"`));
    add('links down to all 6', missingKids.length === 0,
      missingKids.length ? `missing ${missingKids.map(f => f.name).join(', ')}` : `all ${FAMILY.length}`);
  }

  results.push(r);
}

/* ═══ REPORT ═════════════════════════════════════════════════════════════ */
const NAMES = ['builds', 'h1', 'bands', 'reading', 'states', 'money', 'headings in gutter',
  'no placeholders', 'links up to /now', 'links to 5 siblings', 'carries its crumb', 'links down to all 6'];
console.log(`\nFINAL PAGES — 1 index + ${SITUATIONS.length} situations born out of it` +
  `${NO_BUILD ? ' (asserted on disk)' : ', all rebuilt'}\n`);
for (const r of results) {
  const spec = FINAL.find(f => f.file === r.file);
  const failed = r.checks.filter(c => !c.pass);
  const lead = spec.kind === 'index' ? '  ' : '    └ ';
  console.log(`${r.ok ? ' ' : '!'}${lead}${r.file.padEnd(30)} ` +
    `${String(r.checks.length).padStart(2)} checks  ` +
    (failed.length ? `${failed.length} FAILED: ${failed.map(f => f.name).join(', ')}` : 'all pass'));
}
console.log();
for (const r of results) {
  const rd = r.checks.find(c => c.name === 'reading');
  if (rd) console.log(`  ${r.file.padEnd(30)} ${rd.detail}`);
}
const bad = results.filter(r => !r.ok);
if (bad.length) {
  console.log('\nFAILURES');
  for (const r of bad) for (const c of r.checks.filter(x => !x.pass)) {
    console.log(`  ${r.file} · ${c.name}: ${c.detail}`);
  }
}
console.log(`\n${results.length - bad.length} of ${results.length} pages pass all ${NAMES.length} checks.`);
if (NOT_FINAL.length) {
  console.log(`\nNot in the final set (${NOT_FINAL.length}):`);
  for (const n of NOT_FINAL) console.log(`  ${n.file.padEnd(24)} ${n.why.split('.')[0]}.`);
}

/* The census runs LAST so its verdict is the final word on screen, and it
   counts toward `fail` — an unaccounted page is a failure, not a warning.
   A warning is what the previous four stale entries effectively were. */
const { unaccounted, missing } = census(V3);
if (unaccounted.length || missing.length) {
  fail += unaccounted.length + missing.length;
  console.log('\nCENSUS FAILED — the register does not describe what is on disk.');
  for (const f of unaccounted) {
    console.log(`  ${f.padEnd(24)} on disk, in neither FINAL nor NOT_FINAL. Add it to one, with a reason.`);
  }
  for (const f of missing) {
    console.log(`  ${f.padEnd(24)} named in the register, not on disk. Rebuild it, or remove the entry.`);
  }
} else {
  console.log(`\nCensus: all ${FINAL.length + NOT_FINAL.length} pages in public/_pages/v3 are accounted for.`);
}
/* ═══ THE DOCUMENT, GENERATED FROM THE REGISTER ══════════════════════════
   docs/design/FINAL.md is written FROM the arrays above, so the prose and the
   code cannot drift. Regenerate with `npm run verify:final -- --doc`.
   ═══════════════════════════════════════════════════════════════════════ */
if (WRITE_DOC) {
  const { writeFileSync } = await import('node:fs');
  const stamp = readFileSync(join(DATA, 'air-delhi.json'), 'utf8').length ? '' : '';
  const row = (p) => {
    const r = results.find(x => x.file === p.file);
    const rd = r?.checks.find(c => c.name === 'reading');
    return `| \`${p.file}\` | \`${p.route}\` | ${p.bands} | ${p.money ? 'yes' : '—'} | ${rd?.detail || '—'} | ${r?.ok ? 'pass' : 'FAIL'} |`;
  };
  const doc = `# FINAL — the pages that are done

**This file is GENERATED.** It is written from the register in
\`scripts/verify-final.mjs\`, which is also the acceptance test. Do not edit it by
hand: run \`npm run verify:final -- --doc\`.

That indirection is the point. A hand-written list of "final pages" goes stale
the first time somebody edits a generator and nothing tells you. Here the list
and the test are the same object, so **the only way this document can be wrong is
if the test is failing** — and the test is what regenerates it.

\`\`\`bash
npm run verify:final              # rebuild all seven, assert everything
npm run verify:final -- --no-build  # assert the pages as they sit on disk
npm run verify:final -- --doc     # regenerate this file
\`\`\`

---

## 1. The shape: one index, six situations born out of it

**This is not seven peers.** \`/now\` is the parent. A reader arrives there, picks
a situation, and lands on its page. Every situation carries a crumb back to the
index and a rail to its five siblings, and the relationship is **asserted in both
directions** — the index must link to all six, and all six must link home. A page
that stops linking home has orphaned itself, and an index that drops a card has
orphaned a page. Neither shows up in a diff, so both are checked.

\`\`\`
                    /now  ·  intelligence.html
                              │
        ┌─────────┬───────────┼───────────┬─────────┐
       Air     Yamuna       Heat    Forest fire  Forest loss  Climate event
\`\`\`

## 2. The register

| page | route | bands | money | reading, from its own dataset | state |
|---|---|---|---|---|---|
${row(INDEX[0])}
${SITUATIONS.map(row).join('\n')}

Every page is a **build artefact**. Editing the HTML is pointless — the change
dies at the next build. Edit the generator.

| page | generator | npm |
|---|---|---|
${FINAL.map(p => `| \`${p.file}\` | \`${p.generator}\` | \`npm run ${p.npm}\` |`).join('\n')}

## 3. What each one is

${FINAL.map(p => `- **\`${p.file}\`** — ${p.subject}`).join('\n')}

## 4. What the test asserts, and why each check exists

Every check earned its place by catching something in this build.

| check | why it is here |
|---|---|
| builds | the generator runs and its own five write-gates pass |
| h1 | the page is the page it claims to be |
| bands | a band did not silently vanish or duplicate |
| **reading** | **the page still says what its committed dataset says.** This is the class of bug that had the index showing 412 while the Air page said 387, and the homepage ticker showing 0.0 for a figure CPCB never published |
| states | the four-word vocabulary, and only those four words |
| money | present only on Air and Yamuna, per D-27 |
| headings in gutter | every \`.im-head\` inside a \`.wrap\`, or it renders at x=0 (D-23.2) |
| no placeholders | no unexpanded \`\${...}\` reached the HTML — caught six pages carrying a literal \`\${FAMILY_CSS}\` |
| links up to /now | a situation has not orphaned itself |
| links to 5 siblings | the set is navigable without going back up |
| carries its crumb | the page states that it is one of six |
| links down to all 6 | the index has not dropped a child |

**No credentials needed.** Builds read committed JSON; only the fetchers need
keys. This runs in CI.

## 5. Not in the final set

${NOT_FINAL.map(n => `- **\`${n.file}\`** — ${n.why}`).join('\n')}

## 6. Open items on the finished set

1. **Two markups for one vocabulary.** The five shell-built pages stamp state
   with the \`.tag\` component in caps (\`PERIODIC\`); Air predates the shell and
   uses the frozen homepage's \`.state\` component in title case (\`Periodic\`).
   Both are legitimate frozen components and both say the right word, so the test
   accepts both — but it is a divergence across siblings, and it should be
   resolved when Air is next touched for its own reasons.
2. **Air still owns the situation CSS.** The shell reads it out of
   \`build-situation-air.mjs\` as text. The intended end state is that the block
   moves into the shell and Air imports it; prove that migration with a
   byte-identical rebuild.
3. **\`situation-soon.html\` is dead** and nothing links to it. Safe to delete.
4. **\`home.html\` is hand-maintained**, which is why its ticker fallback figure
   is typed rather than injected (D-24.5).
`;
  writeFileSync(join(ROOT, 'docs/design/FINAL.md'), doc);
  console.log('\nwrote docs/design/FINAL.md');
}

process.exit(fail ? 1 : 0);
