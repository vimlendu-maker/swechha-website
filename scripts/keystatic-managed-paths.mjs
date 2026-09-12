#!/usr/bin/env node
/**
 * keystatic-managed-paths.mjs — the directories Keystatic can actually write to.
 *
 * WHY THIS EXISTS. content-rebuild.yml's fidelity gate has to tell a real
 * Keystatic CMS save from a hand-run data tool. The one thing Keystatic
 * literally cannot do is write outside the paths its own collections declare
 * — `keystatic.config.ts`'s header calls that config the "editorial files
 * only" boundary, and the machine-owned and transcribed-figure files under
 * `data/` are named there as deliberately absent. So a commit that only
 * touches `data/**` paths OUTSIDE every collection's path cannot be a CMS
 * save, full stop, regardless of whether `scripts/` also changed.
 *
 * THIS READS `keystatic.config.ts` RATHER THAN HARDCODING `data/work/**`.
 * `config()` and `collection()` in `@keystatic/core` are identity functions
 * (see `node_modules/@keystatic/core/dist/keystatic-core.node.js`: `function
 * config(config) { return config; }`) — importing the default export gives
 * back exactly the object the file declares, `path` strings included. Reading
 * that object, instead of copying today's `data/work/**` into a second place,
 * means a future collection is covered here the moment it is added to the
 * config, with no second edit — the exact lockstep defect this repo has paid
 * for before (`docs/website-team/lessons.md`; the nav-word/build-file/route
 * defect named in CLAUDE.md).
 *
 * USAGE
 *   node scripts/keystatic-managed-paths.mjs
 *     Prints every managed directory, one per line. For a human to check
 *     what this resolved to.
 *
 *   node scripts/keystatic-managed-paths.mjs --any-managed "<path> <path> …"
 *     Exit 0 if ANY of the given paths (one argument, whitespace-separated —
 *     same convention as ping-indexnow.mjs's --changed) falls inside a
 *     managed directory. Exit 1 if none do, including when the argument is
 *     empty or omitted: nothing changed under a managed path leads to the
 *     same conclusion as nothing to check.
 */
import keystaticConfig from '../keystatic.config.ts';

/** `data/work/projects/*` -> `data/work/projects/`. A collection's `path` is
 *  `${string}/${glob}` or deeper (see @keystatic/core's `Collection` type) —
 *  strip trailing glob segments (`*` or `**`) and whatever is left is the
 *  directory Keystatic can write inside, at any depth beneath it. */
function managedDirOf(path) {
  const segments = path.split('/');
  while (segments.length && segments[segments.length - 1].includes('*')) segments.pop();
  return `${segments.join('/')}/`;
}

/** Every directory a collection or singleton in `config` can write to. */
export function managedDirs(config = keystaticConfig) {
  const dirs = [];
  for (const c of Object.values(config.collections ?? {})) {
    if (c.path) dirs.push(managedDirOf(c.path));
  }
  for (const s of Object.values(config.singletons ?? {})) {
    if (s.path) dirs.push(managedDirOf(s.path));
  }
  return [...new Set(dirs)];
}

/** Is `path` inside (or exactly) one of `dirs`? */
export function isManaged(path, dirs = managedDirs()) {
  return dirs.some((dir) => path === dir.slice(0, -1) || path.startsWith(dir));
}

/* ── CLI ─────────────────────────────────────────────────────────────────── */
if (import.meta.url === `file://${process.argv[1]}`) {
  const ARGV = process.argv.slice(2);
  const flagIndex = ARGV.indexOf('--any-managed');

  if (flagIndex === -1) {
    for (const dir of managedDirs()) console.log(dir);
  } else {
    const raw = ARGV[flagIndex + 1] ?? '';
    const paths = raw.split(/\s+/).filter(Boolean);
    const dirs = managedDirs();
    const managed = paths.filter((p) => isManaged(p, dirs));

    if (managed.length) {
      console.log('Changed path(s) under a Keystatic-managed directory:');
      for (const p of managed) console.log(`  ${p}`);
    } else {
      console.log(
        `No changed path is under a Keystatic-managed directory (${dirs.join(', ') || 'none configured'}).`,
      );
    }
    process.exit(managed.length ? 0 : 1);
  }
}
