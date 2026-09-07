#!/usr/bin/env node
/**
 * check-merge-refs.mjs — "can the generated-pages gate run on this PR at all?"
 *
 *   node scripts/check-merge-refs.mjs
 *
 * WHY THIS EXISTS. A `pull_request`-triggered workflow runs against the pull
 * request's MERGE REF, `refs/pull/N/merge` — the commit GitHub makes by merging
 * the head into the base. GitHub only creates that ref if the merge succeeds.
 * When a PR conflicts, THE REF DOES NOT EXIST AND EVERY `pull_request`
 * WORKFLOW SILENTLY DOES NOT RUN. Not a failed run. Not a skipped run. Nothing
 * at all: no entry in `gh run list`, no check on the PR, no red mark, no
 * notification. The PR simply has one fewer check than it had yesterday, and
 * nothing anywhere says so.
 *
 * `.github/workflows/generated-current.yml` is this repository's only quality
 * gate and it is `pull_request`-triggered. It regenerates all 60 built pages
 * and fails if the tree moves — the one thing standing between a stale
 * committed artefact and a reader seeing last week's figure. So the failure
 * mode is: a PR conflicts, the gate stops running, the board looks clean
 * because an absent check renders as no check, and the PR merges unchecked.
 *
 * Observed on 5 September 2026. PRs #69-#72 had merge refs and the `current`
 * check ran on all four. #73 had no merge ref and carried NO check for forty
 * minutes. #74, opened AFTER #73, had a merge ref and ran normally — so
 * nothing about the repository looked broken, and the one PR that was
 * ungated was the one that looked most like the others.
 *
 * WHY CONFLICTS ARE THE NORMAL CASE HERE, NOT THE EXCEPTION. `main` takes
 * roughly thirteen bot commits every six hours — swechha-air[bot] hourly, plus
 * the climate detector and the coverage register — and each one restamps
 * data/seo/lastmod.json. Any branch touching that file conflicts within the
 * hour, and a footer or nav change touches it in all 60 pages. PR #75's merge
 * driver fixes THAT CAUSE. It does not fix this: a conflict in any other file
 * still silently disables the gate, and there will always be another file.
 *
 * ★ WHY THIS IS NOT ITSELF A `pull_request` WORKFLOW, WHICH IS THE WHOLE
 * DESIGN. A check for "did the checks run" that runs on `pull_request` is
 * blinded by exactly the condition it exists to detect — a conflicting PR
 * would produce no run of THIS either, and it would report nothing precisely
 * when it matters. `pull_request_target` is no answer: even granting that it
 * fires for a conflicting PR (it checks out the base, so it plausibly does),
 * no `pull_request*` trigger fires when `main` MOVES, and a bot commit landing
 * on main is how a PR becomes conflicting here. A PR that was mergeable when
 * opened and conflicting an hour later generates no PR event at all. Only a
 * clock is independent of mergeability, so this runs on `schedule`.
 *
 * WHAT IT PUBLISHES. A commit status on each open PR's HEAD SHA, which is what
 * makes a signal appear on the PR itself rather than in the Actions tab nobody
 * reads. The description names the CONSEQUENCE — "the generated-pages gate
 * cannot run on this PR" — not merely the state, because "conflicting" is a
 * thing reviewers already see and have learned to read as "rebase eventually",
 * whereas "your only gate is switched off" is not.
 *
 * ★ THE TRAP THAT WOULD MAKE THIS WORSE THAN NOTHING. `mergeable` IS COMPUTED
 * LAZILY. The REST API returns `null` on a first query while GitHub works the
 * merge out in the background; GraphQL returns UNKNOWN for the same reason.
 * A check that reads that `null` as "false" reports healthy PRs as conflicting,
 * teaches everyone to ignore it inside a week, and leaves the repository worse
 * off than with no check. So `null` is retried with backoff and, if it is
 * still unknown at the end, reported as UNKNOWN — a pending status that says
 * it could not tell. Never a failure. Observed live on PR #58, whose
 * `mergeable` came back UNKNOWN from GraphQL while `refs/pull/58/merge`
 * existed and was perfectly fine.
 *
 * ★ AND THE TRAP UNDERNEATH THAT ONE: A MERGE REF THAT EXISTS CAN BE TEN DAYS
 * STALE. `git ls-remote origin refs/pull/N/merge` is the obvious ground truth
 * and it is the wrong one. GitHub does NOT delete that ref when a PR later
 * stops being mergeable — it leaves the last merge commit it managed to
 * compute sitting there indefinitely. Measured on PR #58 on 8 September 2026:
 * the API said `mergeable: false, mergeable_state: dirty`, and
 * `refs/pull/58/merge` existed and resolved happily to f4deba67 — a merge
 * commit dated 29 AUGUST, whose first parent a626e81e had not been the tip of
 * `main` for ten days. Presence proved nothing. A check built on presence
 * alone would have called that PR gated and green for as long as it stayed
 * open.
 *
 * So the ref is read for its FRESHNESS, not its existence: a merge ref is
 * current only if its first parent is the base branch's tip right now. Three
 * outcomes — absent, stale (naming the base it was built on), or fresh — and
 * `mergeable` is the signal that decides the verdict, with the ref's freshness
 * as the cross-check. That is the reverse of how this script was first
 * written, and the reversal is the finding.
 *
 * Exit codes:
 *   0  every open PR got a status (whatever the verdict), or there were none
 *   1  this publisher itself failed — bad token, API refusing, no repo
 *
 * ★ A CONFLICTING PR DOES NOT MAKE THIS RUN RED, AND THAT IS DELIBERATE. The
 * defect being fixed is that nobody looks at the Actions tab, so putting the
 * signal back there would rebuild the original problem one level up. Worse, an
 * hourly red job emails the owner every hour about a PR they already know
 * about, which is how a check gets muted. The PR carries the red; this run
 * goes red only when it could not do its job.
 *
 * Environment:
 *   GITHUB_TOKEN        required; needs `statuses: write` + `pull-requests: read`
 *   GITHUB_REPOSITORY   owner/name (set for free inside Actions)
 *   GITHUB_API_URL      defaults to https://api.github.com
 *   MERGE_REF_TARGET_URL  where the status links to; defaults to the run
 *   MERGE_REF_DRY_RUN=1   compute and print verdicts, publish nothing
 *   MERGE_REF_ONLY=N      only PR N, for testing against one real PR
 *   MERGE_REF_FORCE_UNKNOWN=1  pretend `mergeable` never resolves, to exercise
 *                              the lazy-computation path on demand
 */

import { execFileSync } from 'node:child_process';

const API = process.env.GITHUB_API_URL || 'https://api.github.com';
const REPO = process.env.GITHUB_REPOSITORY;
const TOKEN = process.env.GITHUB_TOKEN;
const DRY = process.env.MERGE_REF_DRY_RUN === '1';
const ONLY = process.env.MERGE_REF_ONLY ? Number(process.env.MERGE_REF_ONLY) : null;
const FORCE_UNKNOWN = process.env.MERGE_REF_FORCE_UNKNOWN === '1';

/* The status context — the name a reader sees on the PR. Phrased as the
   question it answers, because the answer is the point. Changing this string
   ORPHANS every status already published under the old one: GitHub keys
   statuses by (sha, context), so the old context keeps its last value on every
   existing PR forever with nothing to update it. */
const CONTEXT = 'merge-ref / can the gate run';

/* ★ 140 CHARACTERS. GitHub silently truncates a longer status description, so
   a message whose point is at the end loses its point. Asserted, not trusted:
   every description below is measured before it is sent. */
const MAX_DESCRIPTION = 140;

/* Retry schedule for a `mergeable` that comes back null, in milliseconds.
   Five attempts over ~26 seconds. GitHub's own guidance is that the first
   request STARTS the background merge computation, so the retries are the
   mechanism, not politeness — and the cost of giving up too early is a false
   "conflicting" on a healthy PR, which is the one outcome that would make this
   check worse than nothing. Giving up too late costs 26 seconds. */
const BACKOFF_MS = [2000, 4000, 8000, 12000, 15000, 15000];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let apiCalls = 0;

async function api(path, init = {}) {
  apiCalls++;
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${TOKEN}`,
      'x-github-api-version': '2022-11-28',
      'user-agent': 'swechha-merge-ref-check',
      ...(init.body ? { 'content-type': 'application/json' } : {}),
      ...(init.headers || {}),
    },
  });
  return res;
}

async function json(path) {
  const res = await api(path);
  if (!res.ok) throw new Error(`GET ${path} -> ${res.status} ${await res.text()}`);
  return res.json();
}

/**
 * THE REF, AND WHETHER IT IS ACTUALLY CURRENT.
 *
 * Returns 'absent' | 'stale' | 'fresh'. The distinction is the whole point:
 * see the header. A ref that exists but was merged against a base that has
 * since moved tells you only that this PR was mergeable at some past moment,
 * which is not a question anybody asked.
 *
 * Anything other than 200/404 from the ref probe is raised, not folded into
 * 'absent' — reading a rate-limit or a 500 as "no ref" would post a false
 * failure onto every open PR at once, which is the failure mode of a check
 * that cries wolf and then gets ignored.
 */
async function mergeRefState(n, baseTip) {
  const res = await api(`/repos/${REPO}/git/ref/pull/${n}/merge`);
  if (res.status === 404) return { state: 'absent', sha: null, base: null };
  if (res.status !== 200) throw new Error(`ref probe for PR #${n} -> ${res.status} ${await res.text()}`);

  const sha = (await res.json())?.object?.sha ?? null;
  if (!sha) return { state: 'absent', sha: null, base: null };

  /* First parent of a GitHub-computed merge commit is the BASE side. */
  const commit = await json(`/repos/${REPO}/git/commits/${sha}`);
  const base = commit?.parents?.[0]?.sha ?? null;
  return { state: base && base === baseTip ? 'fresh' : 'stale', sha, base };
}

/**
 * `mergeable`, retried through the lazy-computation window.
 *
 * Returns true | false | null, where null means GENUINELY UNKNOWN and must
 * never be collapsed into false by a caller. `mergeable_state` is carried
 * alongside for the log — 'dirty' is the conflicting one; 'blocked' and
 * 'unstable' are mergeable PRs with unhappy checks and are not our business.
 */
async function mergeableOf(n) {
  for (let attempt = 0; ; attempt++) {
    const pr = await json(`/repos/${REPO}/pulls/${n}`);
    const mergeable = FORCE_UNKNOWN ? null : pr.mergeable;
    const state = FORCE_UNKNOWN ? 'unknown' : pr.mergeable_state;
    if (mergeable !== null && mergeable !== undefined) {
      return { mergeable, state, head: pr.head.sha, attempts: attempt + 1 };
    }
    if (attempt >= BACKOFF_MS.length) {
      return { mergeable: null, state: state ?? 'unknown', head: pr.head.sha, attempts: attempt + 1 };
    }
    await sleep(BACKOFF_MS[attempt]);
  }
}

/**
 * ★ THE TIE-BREAKER, FOR WHEN GITHUB WILL NOT SAY: DO THE MERGE OURSELVES.
 *
 * Observed while building this, on the first live run against PR #58:
 * `mergeable` came back `false` on one run and stayed `null` through all six
 * retries on the next, ~26 seconds apart. The reason is visible in the data —
 * `main` had moved between the two runs (a bot commit), which throws away the
 * background computation and starts it again. On a repository taking thirteen
 * bot commits every six hours, "wait for GitHub to finish" is a race this can
 * lose repeatedly, and a check that answers "don't know" forever is a check
 * nobody keeps.
 *
 * So when the API will not answer, compute the same thing locally.
 * `git merge-tree --write-tree` performs the merge in memory and exits
 * non-zero if it conflicts — the identical question, asked of the identical
 * commits, with no lazy background job in the way. Git 2.38+; the runner has
 * it.
 *
 * BEST EFFORT, AND SILENT WHEN IT CANNOT RUN. If git is missing, the fetch
 * fails, or the exit code is anything but the documented 0/1, this returns
 * null and the verdict stays `pending`. Reporting a conflict because a
 * `git fetch` timed out is the same false-positive this whole script is
 * arranged to avoid, and it does not become acceptable just because it comes
 * from a different subsystem.
 */
function mergesCleanlyLocally(baseTip, headSha, n) {
  const run = (args, opts = {}) => execFileSync('git', args, { stdio: 'pipe', timeout: 300000, ...opts });
  try {
    /* ★ THE SHALLOW-CLONE TRAP, AND WHY THE DEEPEN IS HERE RATHER THAN IN THE
       WORKFLOW. `actions/checkout` fetches depth 1 by default. A merge needs a
       MERGE BASE, and a PR ten days behind a branch taking ~50 commits a day
       is ~500 commits from one — so on a shallow clone merge-tree fails to
       find an ancestor and this returns null, quietly turning the tie-breaker
       off exactly when it is wanted. `fetch-depth: 0` in the workflow would
       fix it by cloning 245MB of history every hour for a job that needs it on
       maybe one run in twenty. So it is deepened HERE, lazily, on the rare run
       that gets this far. Already-complete clones error; that is the success
       case and is swallowed. */
    try { run(['fetch', '--unshallow', '--quiet', '--no-tags', 'origin']); } catch { /* already complete */ }

    /* Both sides by explicit ref — `refs/pull/N/head` always exists (GitHub
       never garbage-collects it), unlike the `/merge` ref this file is about. */
    run(['fetch', '--quiet', '--no-tags', 'origin', `+refs/pull/${n}/head:refs/mergecheck/${n}`]);
    run(['fetch', '--quiet', '--no-tags', 'origin', baseTip]);
  } catch {
    return null;
  }
  try {
    run(['merge-tree', '--write-tree', baseTip, headSha]);
    return true;                    // exit 0: merged with no conflict
  } catch (err) {
    /* 1 is "merged with conflicts". Anything else — 128 for a bad object, 129
       for an unsupported flag on an old git — is this check failing, not the
       PR conflicting, and must not be reported as the latter. */
    return err?.status === 1 ? false : null;
  }
}

/**
 * THE DECISION TABLE, in one place so it can be read as a whole.
 *
 * `mergeable` decides; the ref's FRESHNESS is the cross-check and is always
 * named in the log. Rows, in the order they are tested:
 *
 *   mergeable   ref      -> status    because
 *   ---------   ------   ----------   -------------------------------------
 *   null        any         pending   GitHub has not worked it out yet AND the
 *                                     local merge-tree could not answer
 *                                     either. NEVER a failure — see the
 *                                     header; this is the transient state of
 *                                     every new PR, and calling it a conflict
 *                                     is the one bug that would make this
 *                                     worse than nothing.
 *   false       any         failure   The merge cannot be computed, so no
 *                                     fresh merge ref can exist and the gate
 *                                     cannot run. A LINGERING STALE REF DOES
 *                                     NOT SOFTEN THIS — it is why the ref
 *                                     alone cannot be trusted.
 *   true        fresh       success   Gate can run, and demonstrably could.
 *   true        stale/      success   Mergeable, so the gate will run on the
 *               absent                next PR event; GitHub just has not
 *                                     refreshed the ref yet. Said out loud so
 *                                     nobody reads the ref and panics.
 *
 * WHY A CONFLICT IS `failure` AND NOT PENDING OR NEUTRAL. A commit status has
 * exactly four states — error, failure, pending, success. There is no neutral;
 * that belongs to check runs, which need a GitHub App and cannot be posted by
 * a workflow's own token. And `pending` is not a mild failure, it is a
 * SPINNER: it renders as "still working, wait for it", which is an active lie
 * about a PR whose gate will never run until someone rebases. Of the four
 * states available, `failure` is the only one that tells the truth. It blocks
 * nothing unless someone adds this context to branch protection, which is a
 * separate and deliberate act.
 */
function verdict({ refState, mergeable, local, number, base }) {
  /* The local merge is only consulted where the API abstained, so a
     disagreement between the two can never arise here by construction. */
  const merges = mergeable === null ? local : mergeable;

  if (merges === null || merges === undefined) {
    return {
      status: 'pending',
      description: 'Undetermined: GitHub has not computed mergeability and the local merge could not run either.',
    };
  }
  if (merges === false) {
    const via = mergeable === null ? ' (merged locally to check)' : '';
    return {
      status: 'failure',
      description: refState === 'stale'
        ? `CONFLICTS WITH ${base}: the generated-pages gate CANNOT run. refs/pull/${number}/merge exists but is STALE.${via}`
        : `CONFLICTS WITH ${base}, so there is no merge ref and the generated-pages gate CANNOT run on this PR.${via}`,
    };
  }
  if (refState === 'fresh') {
    return {
      status: 'success',
      description: `Merges cleanly and refs/pull/${number}/merge is current, so the generated-pages gate can run.`,
    };
  }
  return {
    status: 'success',
    description: `Merges cleanly, so the gate can run. refs/pull/${number}/merge is ${refState}; GitHub has yet to refresh it.`,
  };
}

async function publish(sha, { status, description }, targetUrl) {
  if (description.length > MAX_DESCRIPTION) {
    /* Loud, because a truncated description loses whichever half carries the
       consequence, and truncation is invisible in the UI. */
    throw new Error(`status description is ${description.length} chars, over GitHub's ${MAX_DESCRIPTION}: ${description}`);
  }
  if (DRY) return { dryRun: true };
  const res = await api(`/repos/${REPO}/statuses/${sha}`, {
    method: 'POST',
    body: JSON.stringify({
      state: status,
      context: CONTEXT,
      description,
      ...(targetUrl ? { target_url: targetUrl } : {}),
    }),
  });
  if (!res.ok) throw new Error(`POST status on ${sha} -> ${res.status} ${await res.text()}`);
  return res.json();
}

async function main() {
  if (!TOKEN) throw new Error('GITHUB_TOKEN is not set. This needs statuses:write and pull-requests:read.');
  if (!REPO) throw new Error('GITHUB_REPOSITORY is not set (owner/name).');

  const server = process.env.GITHUB_SERVER_URL || 'https://github.com';
  const targetUrl = process.env.MERGE_REF_TARGET_URL
    || (process.env.GITHUB_RUN_ID ? `${server}/${REPO}/actions/runs/${process.env.GITHUB_RUN_ID}` : '');

  /* ★ DRAFTS ARE INCLUDED, and the flag is read only to label them.
     A draft suffers the identical blindness — its gate is just as off — and it
     is the likelier casualty, because "ready for review" is exactly the moment
     someone glances at a board of checks and sees nothing wrong. Excluding
     drafts would carve the hole back into the check at the one point where
     a human is about to trust it. They cost one extra API call each. */
  const open = await json(`/repos/${REPO}/pulls?state=open&per_page=100`);
  const prs = ONLY ? open.filter((p) => p.number === ONLY) : open;

  /* ZERO OPEN PRS IS A HEALTHY ANSWER, NOT AN ERROR. A repository with nothing
     open has nothing ungated, and a scheduled job that fails on the quiet
     weekend is a job that gets turned off before the busy Monday. */
  if (prs.length === 0) {
    console.log('No open pull requests. Nothing can be silently ungated.');
    await summary(['_No open pull requests._']);
    return;
  }

  const rows = [];
  let conflicting = 0;
  let undetermined = 0;

  /* Each base branch's tip, fetched once and reused — it is what makes a merge
     ref "fresh". NOT `pr.base.sha`, which the REST API reports as the base
     commit the PR was last synced against, not the branch's tip now; using it
     would call every stale ref fresh and reintroduce the exact blindness. */
  const baseTips = new Map();
  const baseTipOf = async (branch) => {
    if (!baseTips.has(branch)) {
      const ref = await json(`/repos/${REPO}/git/ref/heads/${branch}`);
      baseTips.set(branch, ref?.object?.sha ?? null);
    }
    return baseTips.get(branch);
  };

  for (const pr of prs) {
    const n = pr.number;
    const { mergeable, state, head, attempts } = await mergeableOf(n);
    const baseTip = await baseTipOf(pr.base.ref);
    const ref = await mergeRefState(n, baseTip);

    /* Only when the API abstained — the common path stays a pure API check
       with no git in it, and the fetch cost is paid only where it buys an
       answer that would otherwise be "don't know". */
    const local = mergeable === null ? mergesCleanlyLocally(baseTip, head, n) : null;

    /* Clamped so a long base branch name cannot push the composed description
       past GitHub's 140-character truncation. */
    const base = pr.base.ref.length > 24 ? `${pr.base.ref.slice(0, 23)}…` : pr.base.ref;
    const v = verdict({ refState: ref.state, mergeable, local, number: n, base });

    const label = `#${n}${pr.draft ? ' (draft)' : ''}`;
    const refDesc = ref.state === 'absent'
      ? 'ABSENT'
      : `${ref.sha.slice(0, 8)} ${ref.state.toUpperCase()}`
        + (ref.state === 'stale' ? ` (merged onto ${String(ref.base).slice(0, 8)}, base is now ${String(baseTip).slice(0, 8)})` : '');
    console.log(
      `${label} ${pr.head.ref} head=${head.slice(0, 8)} `
      + `mergeable=${mergeable === null ? 'UNKNOWN' : mergeable} (state=${state}, ${attempts} `
      + `${attempts === 1 ? 'query' : 'queries'}) refs/pull/${n}/merge=${refDesc}`
      + (mergeable === null ? ` merge-tree=${local === null ? 'INCONCLUSIVE' : local ? 'clean' : 'CONFLICTS'}` : '')
      + ` -> ${v.status.toUpperCase()}`,
    );

    if (v.status === 'failure') {
      conflicting++;
      /* A warning annotation, not an error: see the exit-code note at the top.
         This is here so the run's own log names the PR, for whoever does end
         up reading it. */
      console.log(`::warning title=PR #${n} is ungated::${v.description}`);
    }
    if (v.status === 'pending') undetermined++;

    /* The status goes on the HEAD sha, which is the commit the PR shows. The
       merge ref's own sha is not a commit anyone can see or comment on. */
    await publish(head, v, targetUrl);

    rows.push(
      `| ${label} | \`${pr.head.ref}\` | ${mergeable === null ? '`UNKNOWN`' : `\`${mergeable}\``}`
      + ` (${state}) | ${ref.state === 'fresh' ? 'fresh' : `**${ref.state}**`} | **${v.status}** | ${v.description} |`,
    );
  }

  await summary([
    `Checked ${prs.length} open pull ${prs.length === 1 ? 'request' : 'requests'} in ${apiCalls} API calls.`,
    '',
    `- **${prs.length - conflicting - undetermined}** can run the generated-pages gate`,
    `- **${conflicting}** cannot — the gate is silently switched off on them`,
    `- **${undetermined}** undetermined this run (reported as pending, never as a conflict)`,
    '',
    '| PR | branch | `mergeable` | merge ref | status | published description |',
    '|---|---|---|---|---|---|',
    ...rows,
  ]);

  console.log(
    `\n${prs.length} open, ${conflicting} ungated, ${undetermined} undetermined. `
    + `${DRY ? 'Dry run — nothing published.' : `Statuses published under "${CONTEXT}".`}`,
  );
}

async function summary(lines) {
  const path = process.env.GITHUB_STEP_SUMMARY;
  if (!path) return;
  const { appendFile } = await import('node:fs/promises');
  await appendFile(path, `## Can the generated-pages gate run?\n\n${lines.join('\n')}\n`);
}

main().catch((err) => {
  console.log(`::error title=merge-ref check could not run::${err.message}`);
  console.error(err);
  process.exit(1);
});
