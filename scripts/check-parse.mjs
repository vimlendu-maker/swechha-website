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
import { readFileSync } from 'node:fs';
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
/* ★ THE INTERPRETER IS THE ONE THE FILE ASKS FOR, NOT THE ONE THE EXTENSION
   SUGGESTS. The first version checked every `.sh` with `sh -n` and reported
   scripts/website-team/{guard-paths,run}.sh as broken — on CI only. Both
   declare `#!/usr/bin/env bash` and use ordinary bash: an array literal
   (`FORBIDDEN=(`) and a here-string (`<<<`). They are correct files.

   The split is the platform's: macOS `/bin/sh` IS bash in POSIX mode and
   accepts both, Ubuntu's is dash and accepts neither. So the gate passed
   locally, failed on the runner, and accused two innocent files — which is
   precisely the failure this repository already names elsewhere: "a gate that
   goes red on most days it had anything to report ... is how a real gate
   becomes a notification people mute". A false positive is more expensive than
   the bug it was meant to find.

   KNOWN LIMIT, and it is the same platform split from the other side: a script
   whose shebang says `#!/bin/sh` but which uses bashisms passes here on macOS
   and fails on a dash system. Honouring the shebang cannot fix that — only
   running dash could, and it is not present on macOS. The two `#!/bin/sh`
   files in this tree are checked on Ubuntu by CI on every push, which is where
   that difference would surface. */
const BY_INTERPRETER = {
  node: (file) => ['node', ['--check', file]],
  bash: (file) => ['bash', ['-n', file]],
  zsh: (file) => ['zsh', ['-n', file]],
  sh: (file) => ['sh', ['-n', file]],
  dash: (file) => ['dash', ['-n', file]],
};

/* Extension decides for JavaScript, because a .mjs is ESM whatever its shebang
   says (most have none — they are imported, not executed). */
const BY_EXTENSION = {
  '.mjs': 'node',
  '.js': 'node',
  '.cjs': 'node',
};

const EXTENSIONS = [...Object.keys(BY_EXTENSION), '.sh'];

/** The interpreter this file should be parsed with, or null to skip it.
 *  `#!/usr/bin/env bash` and `#!/bin/bash` both resolve to `bash`. */
function interpreterFor(file, firstLine) {
  const ext = file.slice(file.lastIndexOf('.'));
  if (BY_EXTENSION[ext]) return BY_EXTENSION[ext];
  const shebang = /^#!\s*(\S+)(?:\s+(\S+))?/.exec(firstLine);
  if (!shebang) return ext === '.sh' ? 'sh' : null;
  const [, first, second] = shebang;
  const name = first.endsWith('/env') && second ? second : first.slice(first.lastIndexOf('/') + 1);
  /* An interpreter with no syntax-only mode wired here (python, perl, ruby) is
     SKIPPED rather than guessed at. Skipping is honest; guessing produces the
     false positive this whole comment is about. */
  return BY_INTERPRETER[name] ? name : null;
}

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
export async function checkAll(files = targets(), skipped = []) {
  const failures = [];
  /* Bounded concurrency: ~95 files at 8 at a time is well under a second,
     where serial spawning is closer to two. The cap keeps a CI runner with
     two cores from being handed 95 processes at once. */
  const queue = [...files];
  const workers = Array.from({ length: 8 }, async () => {
    for (let file = queue.shift(); file; file = queue.shift()) {
      let source = '';
      try { source = readFileSync(join(ROOT, file), 'utf8'); } catch { continue; }
      const firstLine = source.split('\n', 1)[0];

      /* ★ THE ONE CASE `node --check` SILENTLY DOES NOTHING, reported rather
         than passed. Measured on Node 24: for a `.js` file containing ESM
         syntax in a package without `"type": "module"`, `node --check` exits 0
         NO MATTER HOW BROKEN THE FILE IS — verified against a 3,583-line file
         with a deliberate syntax error appended, which it accepted. `.mjs` is
         unambiguous and is checked properly; the ambiguous extension is the
         whole problem.

         There are no tracked `.js` files in this repository today, so this is a
         guard against a future one rather than a live finding. It says
         UNVERIFIABLE instead of quietly passing, because a gate reporting
         success on a file it did not read is the failure mode this whole script
         exists to remove. The fix is a rename: `.mjs` says what the file is. */
      if (file.endsWith('.js') && /^\s*(import|export)\s/m.test(source)) {
        failures.push({
          file,
          detail: 'Contains ESM syntax with the ambiguous `.js` extension, where '
            + '`node --check` exits 0 regardless of what the file contains — it cannot be '
            + 'verified here. Rename it to `.mjs` so it is actually checked.',
        });
        continue;
      }

      const interpreter = interpreterFor(file, firstLine);
      if (!interpreter) { skipped.push(file); continue; }
      const [cmd, args] = BY_INTERPRETER[interpreter](file);
      /* ★ A CLEAN PARSE IS SILENT, AND THAT — NOT THE EXIT CODE ALONE — IS THE
         SIGNAL. macOS ships bash 3.2, which for an unterminated `(` prints
         "unexpected EOF while looking for matching `)'" AND EXITS 0. It only
         returns non-zero when it also emits the follow-on "syntax error:
         unexpected end of file", which that particular breakage does not
         produce. Trusting the exit code alone therefore passes a genuinely
         broken script on every developer's Mac while CI's dash rejects it.
         Measured: all 102 tracked scripts in this repository emit NOTHING on a
         successful check, so any output at all is a finding. */
      try {
        const { stderr } = await execFileAsync(cmd, args, { cwd: ROOT });
        const noise = String(stderr || '').trim();
        if (noise) failures.push({ file, detail: noise });
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
