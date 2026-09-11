/* INSTALLS THE PRE-PUSH PARSE GUARD IN THIS CLONE.
   Run by npm's `prepare` lifecycle hook, beside setup-git-merge-driver.mjs and
   for the same reason: git hooks live in .git/, which is per-clone and never
   committed, so a hook nobody installs is a hook nobody has.

   ★ WHY A HOOK AND NOT ONLY CI. On 10 September 2026 an unparseable
   scripts/build-hero.mjs took all four scheduled publishers down for eighteen
   hours. generated-current.yml caught it and could not prevent it: the commit
   was PUSHED STRAIGHT TO `main`, and a push-triggered check by definition runs
   after the push it would have blocked. This is the layer that can say no
   first — on the machine, before the bad object reaches the remote.

   THIS SCRIPT MUST NEVER FAIL, the same contract setup-git-merge-driver.mjs
   carries: a `prepare` that exits non-zero breaks `npm ci`, which would take CI
   and Vercel down for a convenience. Every failure mode — no git, no .git
   directory, a read-only hooks directory, a repo using core.hooksPath — is
   reported on stderr and exited 0. The cost of a skipped install is that CI
   catches the problem instead of the hook; the cost of a failed install is the
   whole pipeline.

   It refuses to overwrite a pre-push hook it did not write, so someone else's
   hook is never silently replaced.

   Idempotent: writes only when the content differs, so repeated installs
   neither churn .git/hooks nor print anything.

   A hook is a convenience, not an authority — `git push --no-verify` skips it
   and any clone that never ran `npm install` never had it. It is the fast
   local layer; generated-current.yml remains the one that actually gates. */

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, chmodSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const MARKER = '# swechha:check-parse';
const HOOK = `#!/bin/sh
${MARKER} — installed by scripts/setup-git-hooks.mjs, rewritten on npm install.
# Refuses a push carrying a script that does not parse. About a third of a
# second. Skip with --no-verify if you know better; CI will still check.
exec node scripts/check-parse.mjs
`;

/** @returns {string | null} stdout, or null if git could not run the command */
function git(args) {
  try {
    return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  } catch {
    return null;
  }
}

function main() {
  if (git(['rev-parse', '--is-inside-work-tree']) !== 'true') return;

  /* A repo pointing core.hooksPath elsewhere is managing its hooks on purpose
     (husky, lefthook, a shared template). Writing into .git/hooks there would
     do nothing at all while reporting success, which is worse than not trying. */
  const custom = git(['config', '--get', 'core.hooksPath']);
  if (custom) {
    console.error(`setup-git-hooks: core.hooksPath is ${custom}; not installing. `
      + 'Add `node scripts/check-parse.mjs` to that pre-push hook by hand.');
    return;
  }

  const gitDir = git(['rev-parse', '--git-path', 'hooks']);
  if (!gitDir) return;
  const hookFile = join(gitDir, 'pre-push');

  if (existsSync(hookFile)) {
    let existing = '';
    try { existing = readFileSync(hookFile, 'utf8'); } catch { return; }
    if (existing === HOOK) return;               // already current, say nothing
    if (!existing.includes(MARKER)) {            // somebody else's hook — leave it
      console.error('setup-git-hooks: a pre-push hook already exists and was not written by this '
        + 'script; leaving it alone. Add `node scripts/check-parse.mjs` to it to get the parse guard.');
      return;
    }
  }

  try {
    writeFileSync(hookFile, HOOK);
    chmodSync(hookFile, 0o755);
    console.error('setup-git-hooks: installed the pre-push parse guard.');
  } catch (err) {
    console.error(`setup-git-hooks: could not write ${hookFile} (${err.code || err.message}); skipping.`);
  }
}

main();
