/* REGISTERS THE `lastmod` MERGE DRIVER IN THIS CLONE.
   Run by npm's `prepare` lifecycle hook, so it happens on every plain
   `npm install` and `npm ci` without anyone having to remember it.

   .gitattributes can say `merge=lastmod`, but it CANNOT define what `lastmod`
   is — a merge driver's command line lives in git config, which is per-clone
   and never committed. Without this step .gitattributes names a driver git has
   never heard of, and git falls back to a text merge, which is exactly the
   status quo the driver exists to fix (this is also why `merge=ours` does not
   work: `ours` is not a built-in driver either).

   THIS SCRIPT MUST NEVER FAIL. A `prepare` that exits non-zero breaks
   `npm ci`, which would take CI and Vercel down for a convenience. So every
   failure mode — no git binary, no .git directory (a tarball or a
   Docker-copied source tree), a read-only git dir, a `git config` that
   refuses — is caught, reported on stderr, and exited 0. The cost of a
   skipped registration is a merge conflict someone resolves by hand; the cost
   of a failed install is the whole pipeline.

   Idempotent: reads the current value first and writes only when it differs,
   so repeated installs neither churn .git/config nor print anything. */

import { execFileSync } from 'node:child_process';

const KEY = 'merge.lastmod.driver';
const VALUE = 'node scripts/git-merge-lastmod.mjs %O %A %B';

/** @returns {string | null} stdout, or null if git could not run the command */
function git(args) {
  try {
    return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  } catch {
    return null;
  }
}

function main() {
  /* Not a work tree (or no git at all) — nothing to register, and nothing
     wrong with that. `--is-inside-work-tree` also answers "no" inside a bare
     repo, where a merge driver would have nothing to merge. */
  if (git(['rev-parse', '--is-inside-work-tree'])?.trim() !== 'true') return;

  if (git(['config', '--get', KEY])?.trim() === VALUE) return;

  if (git(['config', KEY, VALUE]) === null) {
    process.stderr.write(
      `setup-git-merge-driver: could not set ${KEY} — data/seo/lastmod.json will ` +
      'conflict on merge instead of merging key-wise. Set it by hand with:\n' +
      `  git config ${KEY} "${VALUE}"\n`,
    );
    return;
  }

  process.stderr.write(`setup-git-merge-driver: registered ${KEY}\n`);
}

try {
  main();
} catch (error) {
  process.stderr.write(`setup-git-merge-driver: skipped (${error.message})\n`);
}

/* Explicit, because the whole contract of this file is that it exits 0. */
process.exit(0);
