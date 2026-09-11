#!/usr/bin/env bash
# The department's own working tree — so that a person's session can never move
# the branch under a scheduled run.
#
# WHY THIS EXISTS
#   Stage two checks out a branch, runs a specialist, commits, pushes and opens
#   a pull request. It used to do all of that in ~/swechha-website — the same
#   checkout a human session works in. On 2026-09-11 exactly that collided:
#   another session had left HEAD on its own branch, two commits intended for
#   main landed on that branch instead, and recovering them took a rebase that
#   rewrote four of someone else's commits. Nobody did anything wrong; one
#   checkout simply cannot serve an unattended 09:00 job and a person typing.
#
#   So the department gets its own worktree: same repository, same object
#   store, same refs — separate HEAD, separate index, separate files.
#
# WHAT IT IS NOT
#   Not a clone. `git worktree` shares the object database, so this costs
#   almost no disk, and every branch the department pushes is immediately
#   visible from the main checkout with no remote round-trip.
#
#   node_modules is a SYMLINK to the main checkout's (821M). Three abandoned
#   agent worktrees on this machine each have a real copy, which is where 2.5GB
#   went. The symlink is only safe because the runner's allowlist contains no
#   `npm install` — the department can run tests, lint and builds, none of
#   which write to the dependency tree. IF THAT ALLOWLIST EVER GAINS AN INSTALL
#   COMMAND, this must become a real `npm ci` or the department will mutate the
#   dependencies under the human checkout.
#
# HEAD IS ALWAYS DETACHED BETWEEN RUNS, deliberately. Git refuses to check out
# a branch that another worktree already has checked out, so parking here on a
# named branch would eventually collide with the main checkout — including on
# `main` itself, which is the one branch this tree most needs to read.
#
# A REFRESH DISCARDS THE WORKING TREE, NOT BRANCHES. execute.sh keeps a failed
# task branch "locally for inspection"; that branch is a ref in the shared
# repository, so it survives every refresh here and stays visible from the main
# checkout. Only uncommitted files in this tree are thrown away, and only the
# department writes them.
set -euo pipefail

REPO="${WEBSITE_TEAM_REPO:-$HOME/swechha-website}"
WORK="${WEBSITE_TEAM_WORKTREE:-$HOME/.swechha-ai/worktree}"
BASE="${WEBSITE_TEAM_BASE:-origin/main}"
LOCK="${WEBSITE_TEAM_LOCK:-$HOME/.swechha-ai/run.lock}"

# Status goes to stderr; stdout carries the path and nothing else, so a caller
# can write WORK="$(worktree.sh ensure)" and get a usable path even when this
# script has plenty to say.
say() { echo "worktree: $*" >&2; }

usage() { echo "usage: worktree.sh [ensure|path|status|lock|unlock|remove]" >&2; exit 2; }

cmd_path() { echo "$WORK"; }

cmd_ensure() {
  [ -d "$REPO/.git" ] || { say "REFUSED — $REPO is not a git repository"; exit 3; }
  mkdir -p "$(dirname "$WORK")"

  # A worktree whose directory was deleted by hand stays registered until it is
  # pruned, and `worktree add` then refuses the path as already in use.
  git -C "$REPO" worktree prune

  if ! git -C "$REPO" worktree list --porcelain | grep -Fqx "worktree $WORK"; then
    say "creating $WORK"
    git -C "$REPO" fetch -q origin
    git -C "$REPO" worktree add -q --detach "$WORK" "$BASE"
  fi

  git -C "$WORK" fetch -q origin
  git -C "$WORK" checkout -q --detach "$BASE"
  git -C "$WORK" reset -q --hard "$BASE"
  # node_modules is excluded because it is the symlink above; .next because it
  # is build output that `npm run build:all` overwrites anyway, and rebuilding
  # it from cold on every run would cost minutes for nothing.
  git -C "$WORK" clean -qxdf -e node_modules -e .next

  if [ ! -e "$WORK/node_modules" ]; then
    if [ -d "$REPO/node_modules" ]; then
      ln -s "$REPO/node_modules" "$WORK/node_modules"
      say "linked node_modules -> $REPO/node_modules"
    else
      say "WARNING — $REPO/node_modules is missing, so npm gates will fail here"
    fi
  fi

  say "at $(git -C "$WORK" rev-parse --short HEAD) (detached from $BASE)"
  echo "$WORK"
}

cmd_status() {
  git -C "$REPO" worktree list
  echo
  if [ -d "$WORK" ]; then
    echo "department worktree: $WORK"
    echo "  HEAD:        $(git -C "$WORK" rev-parse --short HEAD 2>/dev/null || echo '?') $(git -C "$WORK" symbolic-ref -q --short HEAD || echo '(detached)')"
    echo "  uncommitted: $(git -C "$WORK" status --porcelain | wc -l | tr -d ' ') path(s)"
    echo "  node_modules: $([ -L "$WORK/node_modules" ] && echo "symlink -> $(readlink "$WORK/node_modules")" || echo 'not a symlink')"
  else
    echo "department worktree: not created yet ($WORK)"
  fi
  echo
  echo "lock: $([ -d "$LOCK" ] && echo "HELD by pid $(cat "$LOCK/pid" 2>/dev/null || echo '?') since $(cat "$LOCK/since" 2>/dev/null || echo '?')" || echo 'free')"
}

# ── THE LOCK ─────────────────────────────────────────────────────────────────
# Both schedules fire at 09:00, so on Mondays the daily `work` run and the
# weekly `review` run start in the same second and would share one worktree —
# one of them checking out a branch while the other reads it. `mkdir` is the
# atomic primitive here: macOS has no flock(1).
#
# THE RECORDED PID MUST BE THE CALLER'S, NOT THIS SCRIPT'S. The first version
# wrote $$ -- the pid of this short-lived `worktree.sh lock` process, which
# exits the instant it returns. So the holder was always already dead, the
# staleness check below fired every single time, and the lock excluded nothing
# while looking exactly like it worked. Caught only by testing contention for
# real. run.sh passes its own $$; $PPID is the fallback for a hand call.
cmd_lock() {
  local waited=0 limit="${WEBSITE_TEAM_LOCK_WAIT:-1800}"
  local holder_pid="${2:-$PPID}"
  mkdir -p "$(dirname "$LOCK")"
  while ! mkdir "$LOCK" 2>/dev/null; do
    local holder; holder="$(cat "$LOCK/pid" 2>/dev/null || echo '')"
    # A lock whose holder is gone is debris from a killed run, not a live one.
    if [ -z "$holder" ] || ! kill -0 "$holder" 2>/dev/null; then
      say "breaking stale lock (pid ${holder:-unknown} is not running)"
      rm -rf "$LOCK"
      continue
    fi
    if [ "$waited" -ge "$limit" ]; then
      say "REFUSED — lock held by pid $holder for over ${limit}s; not starting"
      exit 4
    fi
    [ "$waited" = 0 ] && say "waiting for pid $holder to finish"
    sleep 15
    waited=$((waited + 15))
  done
  echo "$holder_pid" > "$LOCK/pid"
  date -u +%Y-%m-%dT%H:%M:%SZ > "$LOCK/since"
}

cmd_unlock() { rm -rf "$LOCK"; }

cmd_remove() {
  git -C "$REPO" worktree remove --force "$WORK" 2>/dev/null || rm -rf "$WORK"
  git -C "$REPO" worktree prune
  say "removed $WORK"
}

case "${1:-ensure}" in
  ensure) cmd_ensure ;;
  path)   cmd_path ;;
  status) cmd_status ;;
  lock)   cmd_lock "$@" ;;
  unlock) cmd_unlock ;;
  remove) cmd_remove ;;
  *)      usage ;;
esac
