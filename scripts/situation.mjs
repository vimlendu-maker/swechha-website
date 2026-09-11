#!/usr/bin/env node
/**
 * The owner's intervention on a live situation page.
 *
 *   node scripts/situation.mjs list
 *   node scripts/situation.mjs withdraw <slug> --why "..."
 *
 * ★ WHY THIS EXISTS, GIVEN THE MECHANISM ALREADY DID.
 *   `publishStateFor()` has always honoured `publish_state: "withdrawn"` and
 *   the detector may not overturn it — the veto was real, permanent, and
 *   documented NOWHERE outside the source. Eight events were withdrawn by hand
 *   on 9 September 2026 by editing JSON. A control a person cannot find is a
 *   control they do not have, and this is the one control over a page about a
 *   disaster that is already public.
 *
 * ★ IT IS A PERSON'S TOOL AND NO AGENT MAY RUN IT.
 *   It writes `data/**`, which is `never_touch` in docs/website-team/policy.json
 *   and refused outright by guard-paths.sh. It appears in no allowlist. That is
 *   deliberate: the department publishes these pages automatically and is
 *   exactly the thing being overruled. An agent that could withdraw a page
 *   could also withdraw the evidence of its own mistake.
 *
 * ★ THERE IS NO `restore`, ON PURPOSE.
 *   active-situation.mjs states the rule: "Restoring one is a person editing
 *   the file back, which is the correct amount of friction for undoing a human
 *   judgement." Adding a one-command undo would remove friction its author
 *   chose. Edit the file if you mean it.
 *
 * ★ WITHDRAWAL IS NOT DELETION. The dossier, its sources and its score all
 *   remain; `withdrawn_why` records who decided and on what grounds. A page
 *   that vanished without a trace would leave the next reader — and the next
 *   run — unable to tell a considered decision from a bug.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const DIR = 'data/climate-events/active';
const [, , cmd, slugArg, ...rest] = process.argv;

const die = (msg, code = 2) => { console.error(`situation: ${msg}`); process.exit(code); };
const load = (f) => JSON.parse(readFileSync(join(DIR, f), 'utf8'));
const files = () => (existsSync(DIR) ? readdirSync(DIR).filter((f) => f.endsWith('.json')).sort() : []);

if (!cmd || cmd === 'help' || cmd === '--help') {
  console.log(`Intervene on an automatically published situation page.

  list                          every dossier, newest state first
  withdraw <slug> --why "..."   take a page down, permanently

The detector publishes on its own — score over threshold AND corroborated by
independent publishers. \`withdraw\` is the only state a person sets, and it
outranks the detector for good: no later run can republish it.

There is no restore command. Edit the file back if you mean it.`);
  process.exit(0);
}

if (cmd === 'list') {
  const rows = files().map((f) => {
    const d = load(f);
    return {
      file: f.replace(/\.json$/, ''),
      // ★ THE ROUTE USES THE DOSSIER'S OWN `slug`, NOT THE FILENAME, and
      //   design-routes.ts refuses to route an event that has no slug at all.
      //   They agree today; they are separately written, so the tool reads the
      //   one the router reads rather than assuming.
      slug: d.slug ?? null,
      state: d.publish_state ?? '?',
      score: d.significance_score ?? d.score?.total ?? '',
      where: d.location?.text ?? '',
    };
  });
  const order = { published: 0, draft: 1, withdrawn: 2 };
  rows.sort((a, b) => (order[a.state] ?? 9) - (order[b.state] ?? 9) || a.file.localeCompare(b.file));
  const n = (s) => rows.filter((r) => r.state === s).length;
  console.log(`${rows.length} dossiers — ${n('published')} published, ${n('draft')} draft, ${n('withdrawn')} withdrawn\n`);
  for (const r of rows) {
    // Only a published row with a slug is actually routed — design-routes.ts
    // requires both. Printing a URL for anything else would be a link that 404s.
    const url = r.state === 'published' && r.slug
      ? `https://swechha.in/now/climate-event/${r.slug}`
      : '(no public URL)';
    console.log(`  ${r.state.padEnd(9)} ${r.file.padEnd(32)} ${String(r.score).padStart(4)}  ${url}`);
  }
  // The publication latch is deliberate — a dip in coverage must not close a
  // live disaster page — but it means a page can sit published on a score that
  // would not publish it today. That is precisely what this tool is for.
  const stale = rows.filter((r) => r.state === 'published' && Number(r.score) < 14);
  if (stale.length) {
    console.log(`\n${stale.length} published page(s) score below the publication threshold of 14:`);
    for (const r of stale) console.log(`  ${r.file} (${r.score}) — published once, kept by the latch`);
    console.log('Not a bug. Worth a look.');
  }
  process.exit(0);
}

if (cmd !== 'withdraw') die(`unknown command '${cmd}' — try: list, withdraw`);
if (!slugArg) die('withdraw needs a slug. `situation.mjs list` shows them.');

const whyAt = rest.indexOf('--why');
const why = whyAt >= 0 ? rest.slice(whyAt + 1).join(' ').trim() : '';
// ★ THE REASON IS REQUIRED. Every withdrawal already on disk carries one, and
//   they are the only record of why a published page about a disaster came
//   down. "Withdrawn by the owner" six months later is not an answer.
if (!why) die('withdraw needs --why "your reason" — it is the only record of this decision');

const file = `${slugArg.replace(/\.json$/, '')}.json`;
if (!existsSync(join(DIR, file))) die(`no dossier at ${join(DIR, file)}`);

const d = load(file);
if (d.publish_state === 'withdrawn') {
  console.log(`situation: ${slugArg} is already withdrawn (${d.withdrawn_on}) — nothing changed`);
  console.log(`  why: ${d.withdrawn_why}`);
  process.exit(0);
}

const was = d.publish_state;
d.publish_state = 'withdrawn';
// Local date: the decision belongs to the day the person made it, not to UTC.
const now = new Date();
d.withdrawn_on = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
d.withdrawn_why = why;
writeFileSync(join(DIR, file), `${JSON.stringify(d, null, 2)}\n`);

console.log(`situation: ${slugArg} withdrawn (was ${was}). No later run can republish it.`);
console.log(`  why: ${why}`);
console.log('\nIt is not off the site until the pages are rebuilt and pushed:');
console.log('  npm run build:all && git add -A && git commit -m "data(climate-event): withdraw ' + slugArg + '" && git push');
