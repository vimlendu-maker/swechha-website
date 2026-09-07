# The lastmod register merges route by route, not as text

*Settled 8 September 2026.*

`data/seo/lastmod.json` is a flat map of route → `{hash, date}`. Every entry is
independent — nothing about `/now/air`'s entry constrains `/healthy-cities`'.
So when two branches change different routes, the resolution is to **take each
side's own changed entries**, which is what a human resolving it would type
every time.

That is done by a custom git merge driver, not by hand and not by any built-in.

> A conflict in this file is never a disagreement. It is two sets of independent
> facts arriving at once.

## Why it needed solving at all

`main` takes roughly thirteen bot commits every six hours — `swechha-air[bot]`
hourly, plus climate-events and coverage. **All thirty of the last thirty bot
commits restamped this file.** It is the most churned file in the repository.
The `date` is content-hash driven (`scripts/lib/lastmod.mjs`), so any branch
touching a shared component restamps it too — and *any* footer or nav change
does, because the footer is extracted into all sixty built pages.

The consequence is not untidiness, and this is the part worth understanding:

**A conflicted pull request has no `refs/pull/N/merge`. `pull_request`
workflows run against that ref. So `.github/workflows/generated-current.yml`
physically cannot run — silently.** No failed run, no skipped run, nothing in
`gh run list`, no check on the pull request.

Observed on 7 September 2026: PR #73 went unchecked for forty minutes with no
visible signal, while PR #74 — opened *later* — got its check normally, because
it happened to be mergeable at the time. The gate that exists to verify
regenerated pages was the gate least able to run on the pull requests that
regenerate them.

The file cannot simply be un-committed: `app/sitemap.ts` reads it, and Vercel
runs `next build` without the generators.

## No built-in driver works. All three were tested

| `.gitattributes` driver | conflict? | outcome |
|---|---|---|
| `merge=ours` | **yes** | **not a built-in.** `.gitattributes` cannot supply `merge.ours.driver`, so git silently falls back to a text merge |
| `merge=union` | no | **invalid JSON** — line concatenation duplicates and garbles the structure |
| `merge=text`, or no attribute | yes | the status quo |

`ours` would also be wrong in principle even if it worked: it discards the
bots' updates to routes the branch never touched.

## The rule

`.gitattributes` maps the file to a custom driver; `scripts/git-merge-lastmod.mjs`
implements it; `scripts/setup-git-merge-driver.mjs` registers it per clone via
npm's `prepare` hook. Per key, over the union of all three inputs:

| situation | result |
|---|---|
| neither side moved it | the ancestor's entry |
| exactly one side moved it | that side's entry, including its deletion |
| both moved it, both present | **newer `date` wins**; a tie goes to **ours** |
| deleted on both | deleted |
| deleted on one, edited on the other | **the surviving entry is kept** |

Two of those are judgement calls, recorded so they are not re-litigated by
accident. The **tie-break to ours** is safe because the loser is a bot restamp
that the next generator run reproduces anyway. The **delete-versus-edit rule
keeps the entry** because a stale key here is inert — `app/sitemap.ts` reads
only the routes it needs — whereas a missing one is a hard build failure. Keep
is the safe direction.

Entries are compared as canonical JSON rather than field by field, so a field
the driver does not know about still counts as a change and travels with its
side untouched.

## Two properties that are load-bearing

**Byte-stability.** Output is sorted keys, two-space indent, trailing newline —
identical to what `stampLastmod` writes. Any other shape would be rewritten by
the next `stampLastmod` call, the working tree would move, and
`generated-current.yml` would fail the build the merge was supposed to unblock.
The test asserts against `lastmod.mjs`'s **real output** rather than a string
literal, so the two cannot drift apart unnoticed.

**Failure is a conflict, never a guess.** If any input is not a well-formed map
of `{hash, date}` entries, the driver does not merge: it hands the three files
to `git merge-file`, which writes the ordinary text merge — conflict markers and
all, exactly the old behaviour — and exits non-zero so git marks the path
unmerged. Nothing is written until a complete merged document has been
serialised, so a failure cannot leave a partial file behind.

## If you re-test this, do not use two routes

The first end-to-end test of this driver was **a false pass.** Two far-apart
routes merged cleanly *even with the driver unregistered* — four-line entries
with three lines of diff context do not necessarily overlap.

The production collision is a footer change restamping **every** entry against
the bots' `/now/*` set, where every hunk overlaps. Reproduce that, or you will
conclude there was never a problem. With the driver unregistered it gives exit 1
and an invalid file; registered, exit 0 and a valid one carrying both sides.

That unregistered case is also the answer to "does a fresh clone fail safely?"
It degrades to precisely the old behaviour — git conflicts, a human resolves,
nothing is corrupted and nothing is silently mis-merged.

## Other generated JSON, considered and deliberately excluded

- **`data/seo/pages.json`** — structurally amenable, but it carries editorial
  prose (titles, descriptions) and appears in none of the last thirty bot
  commits. Auto-merging editorial copy key-wise would resolve real content
  disagreements without a human seeing them. Wrong trade.
- **`data/seo/indexnow.json`** — not a route map; it carries a `_` documentation
  string at the top level, which the driver's shape validation rejects anyway.
- **`data/climate-events/checked.json`** — churns often, but it is nested
  telemetry with correlated scalars and an ordered `recent` array. Its keys are
  *not* independent, so key-wise merging would produce an internally
  inconsistent record.
- **`data/air-history/*.ndjson`** — append-only, so `merge=union` genuinely
  *would* be correct here. Excluded only because these are written by bots
  alone, and bots do not run concurrently on different branches. Revisit if a
  human branch ever edits them.

## Two live caveats

**Same-route ties lose a real hash.** When a footer change and a bot restamp the
same route on the same day, ours wins and the bot's hash is discarded.
Self-healing — the next `stampLastmod` recomputes from actual content — but the
register can briefly hold a hash matching neither side's page. It cannot produce
a wrong `lastmod` *date*, which is the only thing the sitemap publishes.

**Registration is per-clone.** Anyone who merges before their first
`npm install` gets the old conflict. Safe, but confusing; `.gitattributes`
points at the setup script. The `prepare` hook is guarded so it cannot break an
install — it exits 0 with no `.git`, in a bare repo, with `git` absent from
`PATH`, with a read-only or corrupt config, and with a dangling worktree link.

## What this does not fix

It removes the most frequent *cause* of unmergeable pull requests. **It does not
fix the blindness itself:** a conflict in any other file still silently disables
`generated-current.yml`. The missing signal is a check that fails loudly when a
pull request has no merge ref — and because such a check cannot itself be
triggered by `pull_request` without being blinded by the same condition, it has
to run on a schedule and publish its verdict onto the pull request.
