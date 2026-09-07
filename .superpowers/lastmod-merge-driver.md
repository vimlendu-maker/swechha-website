# A key-wise git merge driver for `data/seo/lastmod.json`

**Branch:** `feat/lastmod-merge-driver` (off `main` at `ffd7cd46`)
**Date:** 2026-09-08

## Why

`main` takes ~13 bot commits every six hours (`swechha-air[bot]` hourly, plus
climate-events and coverage). **All 30 of the last 30 bot commits restamped
`data/seo/lastmod.json`** — measured, not assumed; it is the single most
churned file in the repo. The date is content-hash driven
(`scripts/lib/lastmod.mjs`), so any branch touching a shared component
restamps it too, and *any* footer or nav change does, because the footer is in
all 60 built pages.

The consequence is not untidiness. **A conflicted PR has no
`refs/pull/N/merge`, and `pull_request` workflows run against that ref, so
`.github/workflows/generated-current.yml` physically cannot run — silently.**
No failed run, no skipped run, nothing in `gh run list`. PR #73 went unchecked
for 40 minutes with no visible signal while PR #74, opened later and
mergeable, got its check normally. The gate that exists to verify regenerated
pages was the gate least able to run on the PRs that regenerate them.

The file cannot be un-committed: `app/sitemap.ts` reads it and Vercel runs
`next build` without the generators.

## No built-in driver works (all three tested)

| `.gitattributes` driver | conflict? | outcome |
|---|---|---|
| `merge=ours` | **yes** | **not a built-in.** `.gitattributes` cannot supply `merge.ours.driver`; git silently falls back to a text merge |
| `merge=union` | no | **invalid JSON** — line concatenation duplicates and garbles structure |
| `merge=text` / none | yes | the status quo |

## What was built

- **`.gitattributes`** (new — the repo had none): `data/seo/lastmod.json merge=lastmod`
- **`scripts/git-merge-lastmod.mjs`** — the driver, invoked `%O %A %B`
- **`scripts/setup-git-merge-driver.mjs`** — per-clone registration, run by npm's `prepare`
- **`package.json`** — `"prepare": "node scripts/setup-git-merge-driver.mjs"`
- **`lib/seo/lastmod-merge.test.ts`** — 20 Vitest cases

### Why key-wise is correct, not a fudge

The file is a flat map of route → `{hash, date}` and **each route's entry is
independent**: nothing about `/now/air`'s entry constrains `/healthy-cities`'.
Taking each side's own changed entries is what a human resolving the conflict
would type, every time.

The decision table, per key over the union of all three sides:

| situation | result |
|---|---|
| neither side moved it | the ancestor's entry |
| exactly one side moved it | that side's entry (including its deletion) |
| both moved it, both present | **newer `date` wins**; a tie goes to **ours** |
| deleted on both | deleted |
| deleted on one, edited on the other | **the surviving entry is kept** |

Two choices worth recording. The **tie-break to ours** is safe because the
loser is a bot restamp that the next generator run reproduces anyway. The
**delete-vs-edit rule keeps the entry** because a stale key in this register is
inert (`app/sitemap.ts` reads the routes it needs) whereas a missing one is a
hard build failure, so keeping is the safe direction.

Entries are compared by canonical JSON, not field by field, so a field the
driver does not know about still counts as a change and travels with its side
untouched.

### Byte-stability

Output is `JSON.stringify(sorted, null, 2) + '\n'` — sorted keys, two-space
indent, trailing newline, identical to `stampLastmod`. This is load-bearing:
any other shape would be rewritten by the next `stampLastmod` call, the working
tree would move, and `generated-current.yml` would fail the build the merge was
supposed to unblock. The test asserts against `lastmod.mjs`'s **real output**
rather than a string literal, so the two cannot drift apart unnoticed.

### Failure is a conflict, never a guess

If any of the three inputs is not a JSON object of well-formed `{hash, date}`
entries, the driver does not merge. It hands the three files to
`git merge-file`, which writes the ordinary text merge — exactly the repo's
current behaviour, conflict markers and all — and exits non-zero so git marks
the path unmerged. **Nothing is written until a complete merged document has
been serialised**, so a failure cannot leave a partial file behind.

## Verification

`npm test` → **454 passed**, 12 skipped, 27 files (20 new cases).
`npx tsc --noEmit` → **0 errors** attributable to this change (the 5
`PageProps`/`LayoutProps` errors are pre-existing missing `.next/types`; this
branch touches nothing in `app/`).
`npx eslint . --ignore-pattern '.claude/**'` → **0 errors**, 39 pre-existing
warnings.

### End-to-end merges in a throwaway repo, seeded with the real register

Real `git merge`, real driver, five scenarios:

| # | scenario | driver | exit | conflicts | result |
|---|---|---|---|---|---|
| 1 | ours: 2 `/healthy-cities*`; theirs: `/now/air`, `/now` | registered | **0** | **0** | valid JSON, 64 routes, **both sides' changes present**, every untouched route verbatim, byte-stable |
| 2 | same route `/now/air`, **theirs** newer | registered | **0** | **0** | theirs won (`2026-09-08` > `2026-09-01`) |
| 3 | same route `/now/air`, **ours** newer | registered | **0** | **0** | ours won (`2026-09-08` > `2026-09-01`) |
| 4 | footer change (**all 62 routes**) vs bot (33 routes) | **unregistered** | **1** | **1** | conflict markers, invalid JSON — the status quo, reproduced |
| 5 | the same collision | registered | **0** | **0** | valid JSON, 62 routes, byte-stable; same-day tie → ours |

**A finding worth keeping.** My first attempt at scenario 4 changed only two
distant routes and *merged cleanly without the driver* — 4-line entries with 3
lines of diff context do not always overlap. That was a gap in the test, not a
pass. The production collision is a footer change restamping **every** entry
against the bot's `/now/*` set, where every hunk overlaps; scenario 4 above is
that, and it reproduces the conflict exactly. **Do not test this driver with
one or two far-apart routes — it will look like there was never a problem.**

Scenario 4 is also the answer to "does an unregistered driver fail safely?"
It degrades to precisely today's behaviour: git conflicts, the file is left
with markers for a human, nothing is corrupted, no silent wrong merge.

### The `prepare` hook cannot break an install

A `prepare` that exits non-zero breaks `npm ci`. **Real `npm ci` → exit 0**,
prepare ran, driver registered. Every hostile case exits 0:

| case | exit |
|---|---|
| no `.git` at all (tarball / Docker `COPY`) | 0 |
| a bare repo (no work tree) | 0 |
| `git` binary not on `PATH` | 0 |
| read-only `.git/config` | 0 |
| corrupt `.git/config` git refuses to parse | 0 |
| `.git` is a file pointing nowhere (broken worktree link) | 0 |

Idempotent: it reads the current value first and writes only on a difference,
so repeated installs neither churn `.git/config` nor print anything (asserted
in the suite, including that only one value is ever set).

## Other generated JSON — considered, deliberately not added

Asked whether anything else deserves the driver. **No**, and each for its own
reason:

- **`data/seo/pages.json`** — a route map, so structurally amenable, but it
  carries editorial prose (titles, descriptions) and appears in *none* of the
  last 30 bot commits. Auto-merging editorial copy key-wise would resolve real
  content disagreements without a human seeing them. Wrong trade.
- **`data/seo/indexnow.json`** — not a route → `{hash, date}` map; it has a `_`
  documentation string at the top level. The driver's shape validation would
  reject it anyway.
- **`data/climate-events/checked.json`** — churns (13/30) but is a nested
  telemetry blob with correlated scalars (`clusters_considered`, `published`)
  and an ordered `recent` array. Keys are *not* independent; key-wise merging
  would produce an internally inconsistent record.
- **`data/air-history/*.ndjson`** — append-only, so `merge=union` genuinely
  *would* be correct here. Not added because only bots write these files and
  bots do not run concurrently on different branches, so no branch-vs-`main`
  collision arises. Worth revisiting only if a human branch ever edits them.

## Concerns

1. **Same-route ties lose a real hash.** When a footer change and a bot restamp
   the same route on the same day, ours wins the tie and the bot's hash is
   discarded. Self-healing — the next `stampLastmod` recomputes from actual
   content — but it means the register can briefly hold a hash that matches
   neither side's page. It cannot cause a wrong `lastmod` *date*, which is the
   only thing the sitemap publishes.
2. **The driver is per-clone.** Anyone who runs a merge before their first
   `npm install` gets the old conflict. Safe (scenario 4) but confusing; the
   `.gitattributes` comment points at the setup script.
3. **This does not fix the underlying gate problem.** It removes the most
   frequent *cause* of unmergeable PRs, but a conflict in any other file still
   silently disables `generated-current.yml`. A `pull_request_target` job (or a
   mergeability check) that *fails loudly* when a PR has no merge ref remains
   worth building separately — that is the actual missing signal.
