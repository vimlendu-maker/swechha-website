/* EVERY COMMITTED SCRIPT PARSES. THE CHEAPEST GATE IN THE REPOSITORY.
   ───────────────────────────────────────────────────────────────────────────
   ★ WHY THIS EXISTS, measured: on 10 September 2026 `d8c468d3` committed the
   SHELL SNIPPET THAT WAS MEANT TO APPLY A FIX into the top of the file it was
   meant to edit. scripts/build-hero.mjs line 1 became:

       cd ~/Desktop/swechha-website

   ahead of 1,200 lines of ES module. Node stops at the `~`. Every scheduled
   publisher — air-hourly, climate-events, climate-coverage-hourly and
   data-refresh — runs `npm run build:all`, and build:all runs build:hero, so
   ONE UNPARSEABLE FILE TOOK DOWN ALL FOUR. Nothing published for eighteen
   hours. Four red pipelines, one cause, and the four separate failure emails
   made it look like an infrastructure problem — the runbook's first suggestion
   was an expired GitHub PAT.

   ★ THE GATE THAT CATCHES IT ALREADY EXISTED AND ALREADY FIRED.
   generated-current.yml rebuilds everything on every push and pull request; it
   went red on `d8c468d3` at 09:44:40Z, the same minute the commit landed. It
   could not prevent anything, because the commit was pushed straight to `main`
   and the check runs after the push. What it also is, is SLOW: it reinstalls,
   tests, lints and regenerates 30 pages to discover that line 1 is not
   JavaScript. Roughly three minutes, which reads like a dispatch or auth
   failure rather than a syntax error and sent the first diagnosis to the wrong
   layer entirely.

   So this is the same finding, available in about a second, early enough to be
   worth running before you push rather than after. It does not replace
   generated-current.yml — it fails faster and says exactly which file.

   ★ THE LIST IS DERIVED, NOT WRITTEN DOWN. This repository's most repeated
   defect is a hand-maintained list that had to move in lockstep with something
   else and did not (see lib/publishers.test.ts's header for the count). A gate
   listing the files it checks would be one more, and the file it forgot would
   be the file that breaks. `git ls-files` is the list: add a script and it is
   covered on the next run, with nothing to remember and no exclusions to go
   stale.

   ★ IT REPORTS EVERY FAILURE, NOT THE FIRST, for the reason build-all.sh gives
   for the same choice: an operator should learn about three broken files in one
   run instead of one per run.

   WHAT IT DOES NOT DO: this is a SYNTAX gate, not a behaviour gate. A file that
   parses and does the wrong thing passes here and is caught by the real build.
   Nothing is imported or executed — `node --check` and `sh -n` parse only, so a
   generator cannot write a page, spend an API call or touch the tree by being
   checked.

   Usage:  node scripts/check-parse.mjs   (also run by `npm test`, and by the
                                           pre-push hook scripts/setup-git-hooks.mjs installs)
   Exit:   0 when everything parses; 1 with a per-file report otherwise. */

import { execFile, execFileSync } from 'node:child_process';
import { promisify } from 'node:util';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const execFileAsync = promisify(execFile);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/* `node --check` is the SAME parser Node uses at runtime, which is the whole
   point — a hand-rolled parser or a third-party one could disagree with the
   thing that actually runs. Verified on Node 24 against the real broken file:
   exit 1 on `cd ~/Desktop/...`, exit 0 on valid ESM including top-level await
   and imports that do not resolve, because resolution never happens.

   (`node --check` prints its diagnosis on stderr and returns a non-zero EXIT
   CODE. Read the exit code, never the output: `node --check f | head` reports
   success no matter what, because `$?` is then head's. That mistake is how a
   gate becomes a false green.) */
const CHECKERS = {
  '.mjs': (file) => ['node', ['--check', file]],
  '.js': (file) => ['node', ['--check', file]],
  '.cjs': (file) => ['node', ['--check', file]],
  '.sh': (file) => ['sh', ['-n', file]],
};

const EXTENSIONS = Object.keys(CHECKERS);

/** Every tracked file this knows how to parse. Tracked, so an untracked
 *  scratch file in the working tree is not the gate's business — and a file
 *  that IS about to be committed always is. */
export function targets() {
  const out = execFileSync('git', ['ls-files', '-z', ...EXTENSIONS.map((e) => `*${e}`)], {
    cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024,
  });
  return out.split('\0').filter(Boolean).sort();
}

/** @returns {Promise<Array<{file: string, detail: string}>>} one entry per file that does not parse. */
export async function checkAll(files = targets()) {
  const failures = [];
  /* Bounded concurrency: ~95 files at 8 at a time is well under a second,
     where serial spawning is closer to two. The cap keeps a CI runner with
     two cores from being handed 95 processes at once. */
  const queue = [...files];
  const workers = Array.from({ length: 8 }, async () => {
    for (let file = queue.shift(); file; file = queue.shift()) {
      const ext = file.slice(file.lastIndexOf('.'));
      const [cmd, args] = CHECKERS[ext](file);
      try {
        await execFileAsync(cmd, args, { cwd: ROOT });
      } catch (err) {
        /* Node's own message already carries the line, the source line and a
           caret under the offending token. Reproducing that by hand would only
           make it worse, so it is passed through verbatim. */
        const detail = String(err.stderr || err.message || '').trim();
        failures.push({ file, detail });
      }
    }
  });
  await Promise.all(workers);
  return failures.sort((a, b) => a.file.localeCompare(b.file));
}

/* Run directly (`node scripts/check-parse.mjs`) rather than imported. */
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const files = targets();
  const failures = await checkAll(files);
  if (failures.length === 0) {
    console.log(`check-parse — ${files.length} tracked scripts, every one parses.`);
    process.exit(0);
  }
  for (const { file, detail } of failures) {
    console.error(`\n✗ ${file} does not parse\n`);
    console.error(detail.replace(/^/gm, '    '));
  }
  console.error(
    `\ncheck-parse — ${failures.length} of ${files.length} tracked scripts do not parse.`
    + `\nNothing that imports one of these can run, and build:all runs most of them.\n`
  );
  process.exit(1);
}
