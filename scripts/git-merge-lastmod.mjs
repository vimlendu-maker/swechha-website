/* A KEY-WISE MERGE DRIVER FOR data/seo/lastmod.json.
   Registered as `merge=lastmod` in .gitattributes and invoked by git as
   `node scripts/git-merge-lastmod.mjs %O %A %B` (ancestor, ours, theirs).

   WHY THIS EXISTS, AND WHY IT IS NOT A FUDGE. `main` takes ~13 bot commits
   every six hours (swechha-air hourly, plus climate-events and coverage) and
   every one of them restamps this file, because the date is content-hash
   driven (see scripts/lib/lastmod.mjs). Any branch that also touches it — and
   ANY footer or nav change does, since the footer is in all 60 built pages —
   conflicts against main within about an hour.

   That is not merely an annoyance. A conflicted PR has no refs/pull/N/merge,
   and `pull_request` workflows run against that ref, so
   .github/workflows/generated-current.yml — the gate whose whole job is to
   verify that the committed pages match a fresh regeneration — CANNOT RUN, and
   does so silently: no failed run, no skipped run, nothing in `gh run list`.
   The gate that exists to check regenerated pages was the gate least able to
   run on the PRs that regenerate them.

   The file cannot simply be un-committed: app/sitemap.ts reads it and Vercel
   runs `next build` without the generators.

   KEY-WISE IS THE SEMANTICALLY CORRECT MERGE, not a way of dodging the
   conflict. The file is a flat map of route -> { hash, date }, and each
   route's entry is independent: nothing about /now/air's entry constrains
   /healthy-cities'. If a branch changed the healthy-cities routes and a bot
   changed /now/air, taking each side's own changed entries is exactly right —
   it is what a human resolving the conflict would type, every time.

   No built-in driver does this (all three were tested):
     merge=ours   — NOT A BUILT-IN. .gitattributes cannot supply
                    merge.ours.driver, so git silently falls back to a text
                    merge and still conflicts.
     merge=union  — line-concatenates, producing duplicate keys and garbled
                    structure, i.e. INVALID JSON.
     merge=text   — the status quo: conflicts.

   FAILURE IS A CONFLICT, NEVER A GUESS. If any of the three inputs is not a
   JSON object of well-formed entries, this driver does not merge. It hands the
   three files to `git merge-file`, which writes the ordinary text merge — the
   exact behaviour the repo has today, conflict markers and all — and exits
   non-zero so git marks the path unmerged. Nothing is written until a complete
   merged document has been serialised, so a failure can never leave a partial
   file behind. */

import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const DATE = /^\d{4}-\d{2}-\d{2}$/;

/* JSDoc, not TypeScript, because git invokes this file directly with plain
   `node` — there is no build step in the merge path. The types are here for
   the sake of the callers that ARE typechecked: `npx tsc --noEmit` reads this
   through lib/seo/lastmod-merge.test.ts, and without them `mergeLastmod`
   infers `{}` and every indexed read in that suite is an implicit-any error.
   @typedef {{ hash: string, date: string }} Entry
   @typedef {Record<string, Entry>} Register */

/* Rejecting an entry we do not fully understand is the point: a shape this
   driver cannot reason about must become a conflict a human reads, not a
   merge it silently gets wrong. Extra keys are tolerated — entries are taken
   whole, so an added field travels with its side untouched — but `hash` and
   `date` must both be present and well-formed, because `date` is the
   tie-break and a malformed one would order wrongly rather than loudly. */
function isEntry(value) {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    typeof value.hash === 'string' &&
    typeof value.date === 'string' &&
    DATE.test(value.date)
  );
}

/** Parses one side. An absent ancestor arrives as an empty file, not a missing
 *  path — a route added independently on both sides has no base entry at all.
 *  @param {string} text @param {string} label @returns {Register} */
function parseSide(text, label) {
  const trimmed = text.trim();
  if (trimmed === '') return {};
  let parsed;
  try {
    parsed = JSON.parse(trimmed);
  } catch (error) {
    throw new Error(`${label} is not valid JSON: ${error.message}`);
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error(`${label} is not a JSON object`);
  }
  for (const [route, entry] of Object.entries(parsed)) {
    if (!isEntry(entry)) {
      throw new Error(`${label} entry ${JSON.stringify(route)} is not a { hash, date } record`);
    }
  }
  return parsed;
}

/* Entries are compared by canonical JSON rather than field by field so that a
   field this driver does not know about still counts as a change. */
function canonical(entry) {
  if (entry === undefined) return undefined;
  return JSON.stringify(Object.keys(entry).sort().map((k) => [k, entry[k]]));
}

/**
 * Three-way merge of the register, one route key at a time.
 *
 * Per key, over the union of all three sides:
 *  - neither side moved it        -> the ancestor's entry (or its absence)
 *  - exactly one side moved it    -> that side's entry (or its deletion)
 *  - both sides moved it, both now present -> the NEWER `date` wins; a tie
 *    goes to ours, because ours is the change a human is currently making and
 *    the loser is a bot restamp that the next generator run reproduces anyway
 *  - both deleted it              -> deleted
 *  - one deleted, the other edited -> the SURVIVING entry is kept. A stale key
 *    in this register is inert (app/sitemap.ts reads the routes it needs); a
 *    missing one is a hard build failure, so keeping is the safe direction.
 *
 * @param {Register} ancestor @param {Register} ours @param {Register} theirs
 * @returns {Register}
 */
export function mergeLastmod(ancestor, ours, theirs) {
  /** @type {Register} */
  const merged = {};
  const routes = new Set([...Object.keys(ancestor), ...Object.keys(ours), ...Object.keys(theirs)]);

  for (const route of routes) {
    const base = canonical(ancestor[route]);
    const oursChanged = canonical(ours[route]) !== base;
    const theirsChanged = canonical(theirs[route]) !== base;

    let winner;
    if (!oursChanged && !theirsChanged) winner = ancestor[route];
    else if (oursChanged && !theirsChanged) winner = ours[route];
    else if (!oursChanged && theirsChanged) winner = theirs[route];
    else if (ours[route] === undefined) winner = theirs[route];
    else if (theirs[route] === undefined) winner = ours[route];
    else winner = theirs[route].date > ours[route].date ? theirs[route] : ours[route];

    if (winner !== undefined) merged[route] = winner;
  }

  return merged;
}

/* BYTE-IDENTICAL TO WHAT THE GENERATORS EMIT — sorted keys, two-space indent,
   trailing newline. This must stay in lockstep with scripts/lib/lastmod.mjs:
   a merge result in any other shape would be rewritten by the very next
   `stampLastmod` call, so generated-current.yml would see the working tree
   move and fail the build the merge was supposed to unblock.
   @param {Register} store @returns {string} */
export function serializeLastmod(store) {
  const sorted = Object.fromEntries(Object.keys(store).sort().map((k) => [k, store[k]]));
  return JSON.stringify(sorted, null, 2) + '\n';
}

function textMergeFallback(reason, [O, A, B]) {
  process.stderr.write(`git-merge-lastmod: ${reason}\ngit-merge-lastmod: falling back to a text merge — resolve this file by hand\n`);
  try {
    execFileSync('git', ['merge-file', '-L', 'ours', '-L', 'base', '-L', 'theirs', A, O, B], {
      stdio: ['ignore', 'inherit', 'inherit'],
    });
  } catch {
    /* Non-zero here is the normal case: it is git reporting the conflict count.
       A genuine merge-file failure leaves %A exactly as it was — our side,
       unmodified — which git then marks unmerged. Either way nothing partial
       has been written. */
  }
  process.exit(1);
}

function main(argv) {
  const paths = argv.slice(2, 5);
  if (paths.length !== 3) {
    process.stderr.write('usage: node scripts/git-merge-lastmod.mjs %O %A %B\n');
    process.exit(2);
  }
  const [O, A, B] = paths;

  let output;
  try {
    const ancestor = parseSide(readFileSync(O, 'utf8'), 'the merge base');
    const ours = parseSide(readFileSync(A, 'utf8'), 'our side');
    const theirs = parseSide(readFileSync(B, 'utf8'), 'their side');
    output = serializeLastmod(mergeLastmod(ancestor, ours, theirs));
  } catch (error) {
    /* Nothing has been written at this point, by construction: the single
       write below is the only one in this function and it is unreachable
       without a fully serialised document. */
    textMergeFallback(error.message, paths);
    return;
  }

  writeFileSync(A, output);
  process.exit(0);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main(process.argv);
