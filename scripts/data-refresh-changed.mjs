/* ═══════════════════════════════════════════════════════════════════════════
   DID THE DATA ACTUALLY CHANGE?  —  used by .github/workflows/data-refresh.yml
   ───────────────────────────────────────────────────────────────────────────
   Every fetch script stamps `fetched: { epochMs }` into the JSON it writes. So
   after a scheduled re-fetch, `git status` reports every dataset as modified
   whether or not a single figure moved — and a workflow that commits that
   produces a daily commit, a daily deploy and a changelog in which nothing is
   findable because everything is noise.

   This reverts the files whose ONLY change is the timestamp, leaving modified
   exactly those where a real value moved. The workflow then decides whether
   there is anything to rebuild and commit.

   ★ WHAT COUNTS AS NOISE IS DELIBERATELY NARROW.
   Only `fetched`, `fetchedAt` and `_gathered` — the three fields this repo
   writes to record WHEN IT LOOKED. Everything else is data, including fields
   that look like timestamps and are not:
     `as_of`, `lastupdated`, `stamp`  — dates the SOURCE states about its own
        publication. If one of those moves, the agency republished, which is
        the single most important thing this workflow exists to notice.
   Treating a source-stated date as noise would mean silently discarding the
   republication it announces. So the list is a fixed allow-list of three keys
   and it is not to be widened without that argument being answered.

   ★ IT COMPARES VALUES, NOT TEXT. A re-serialised file can differ in key order
   or whitespace while carrying identical figures. Both sides are normalised —
   keys sorted at every depth, noise stripped — and compared as canonical JSON,
   so formatting churn is not mistaken for a reading.

   ★ IT NEVER REVERTS SOMETHING IT CANNOT PARSE. If either side fails to parse,
   the file is left modified and reported. A malformed fetch result must reach a
   human, not be quietly reverted (which would hide the breakage) and not be
   quietly committed (which would ship it).

   Usage:  node scripts/data-refresh-changed.mjs [--dry-run]
   Prints one line per file and a final summary. Exit 0 unless git itself fails.
   ═══════════════════════════════════════════════════════════════════════════ */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const DRY = process.argv.includes('--dry-run');

/* The only three keys this repo writes to say when it looked. */
const NOISE = new Set(['fetched', 'fetchedAt', '_gathered']);

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' });

/** Sorted keys at every depth, noise removed, so two files with the same
 *  figures compare equal regardless of serialisation. */
function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') {
    const out = {};
    for (const k of Object.keys(value).sort()) {
      if (NOISE.has(k)) continue;
      out[k] = canonical(value[k]);
    }
    return out;
  }
  return value;
}

const same = (a, b) => JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));

/* Modified, tracked files under data/. Untracked files are NOT touched: a new
   dataset is by definition a change, and reverting it would delete it. */
const status = git('status', '--porcelain', '--', 'data').trim();
const modified = status ? status.split('\n')
  .filter((l) => /^\s*M/.test(l))
  .map((l) => l.replace(/^\s*\S+\s+/, '').trim())
  .filter((f) => f.endsWith('.json')) : [];

const untracked = status ? status.split('\n')
  .filter((l) => /^\?\?/.test(l))
  .map((l) => l.replace(/^\?\?\s+/, '').trim()) : [];

if (!modified.length && !untracked.length) {
  console.log('No data files changed at all — nothing fetched, or every source returned what it already had.');
  console.log('CHANGED=0');
  process.exit(0);
}

const real = [], noise = [], unreadable = [];

for (const file of modified) {
  let head, now;
  try {
    head = JSON.parse(git('show', `HEAD:${file}`));
    now = JSON.parse(readFileSync(file, 'utf8'));
  } catch (err) {
    unreadable.push([file, err.message.split('\n')[0]]);
    continue;
  }
  if (same(head, now)) noise.push(file);
  else real.push(file);
}

/* Revert the timestamp-only files so the commit contains figures, not clocks. */
if (noise.length && !DRY) {
  git('checkout', '--', ...noise);
}

console.log('');
for (const f of real) console.log(`  CHANGED   ${f}`);
for (const f of noise) console.log(`  timestamp ${f}${DRY ? ' (would revert)' : ' (reverted)'}`);
for (const [f, why] of unreadable) console.log(`  UNREADABLE ${f} — ${why}`);
for (const f of untracked) console.log(`  NEW       ${f}`);

const total = real.length + untracked.length + unreadable.length;
console.log('');
console.log(`${real.length} dataset(s) with a real change, ${noise.length} timestamp-only, `
  + `${untracked.length} new, ${unreadable.length} unreadable.`);
console.log(`CHANGED=${total}`);

/* Unreadable files are left modified ON PURPOSE and reported as changed, so the
   workflow rebuilds — and the page generators, which validate what they read,
   are what will refuse. A broken dataset should fail a gate, loudly, rather
   than be reverted out of sight. */
if (unreadable.length) {
  console.log('\nAt least one dataset could not be parsed. It has been left in place so the '
    + 'page generators see it and refuse — do not "fix" this by reverting it.');
}
