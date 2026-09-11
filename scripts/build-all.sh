#!/bin/sh
# ─────────────────────────────────────────────────────────────────────────────
# ONE REBUILD, IN ONE ORDER, FOR EVERY PUBLISHER AND FOR THE GATE.
#
# Five workflows commit generated pages to `main` on a cron, and until this
# script each carried its own loop. Measured 9 September 2026, against
# generated-current.yml's list, which is authoritative because the gate is what
# compares the committed pages with a fresh build:
#
#   generated-current  19 targets            the gate
#   air-hourly         14   — missing healthy-cities learn schools journal social-cards
#   data-refresh       14   — the same five
#   content-rebuild    12   — those five, plus data and record
#   climate-events      2   — build:situations and build:hero only
#   climate-coverage    1   — one page, while staging four trees
#
# The symptom never lands on the publisher. A page the publisher does not
# rebuild goes stale on `main`, and generated-current.yml then fails on the
# next pull request anyone opens, for files its author never touched. It has
# happened at least three times: the homepage (`fix(ci): the homepage is built
# from event data too, and two workflows forgot`), the air exports under
# public/data, and search.html, which no publisher rebuilt at all — found when
# the landslide context pack gave two event pages five new bands and left the
# search index advertising the three they used to have.
#
# ★ THE ORDER IS THE LOAD-BEARING PART, AND TWO WORKFLOWS HAD IT WRONG.
#
#   1. SITUATIONS BEFORE THE HERO. build-hero.mjs reads the air figure out of
#      the BUILT situation-air.html and refuses to write when it disagrees with
#      the dataset. Its own comment records what hero-first cost: "The daily
#      data-refresh workflow did exactly that — hero first, situations second —
#      and went red on most days it had anything to report, which is how a real
#      gate becomes a notification people mute." generated-current.yml still
#      ran hero-first and survived only because a gate starts from a tree that
#      is already in step.
#   2. THE SEARCH INDEX AFTER EVERY PAGE IT INDEXES. build-search-page.mjs
#      reads the built pages and stores each one's headings and hook as its
#      search text. The gate's loop ran `search` before `essays`, so an essay
#      change was missing from the index until something else rebuilt it.
#   3. THE SHARE CARDS LAST, before the verifiers, so a page assembled outside
#      the per-generator hook still gets its own photograph rather than
#      shipping the wordmark to everyone who shares it.
#
# ★ AND IT REPORTS EVERY FAILURE, NOT THE FIRST. This is why the list is a
# shell loop rather than an `&&` chain in package.json. data-refresh.yml
# already collected failed gates and printed them together, deliberately, so
# an operator learns about three broken generators in one run instead of one
# per day. That behaviour now belongs to all five publishers instead of one.
#
# Usage:  npm run build:all
# Exit:   0 if every generator wrote; 1 with a FAILED list otherwise.
# ─────────────────────────────────────────────────────────────────────────────
set -u

# The order above, once. Add a generator here and every publisher runs it;
# lib/publishers.test.ts fails if a `build:*` script exists that this misses.
TARGETS="
situations
hero
work
about
impact
farm
act
stories
publications
posters
healthy-cities
learn
teach
schools
data
record
journal
essays
search
social-cards
"

failed=""
for t in $TARGETS; do
  printf '::group::npm run build:%s\n' "$t"
  if npm run "build:$t"; then
    printf '::endgroup::\n'
  else
    printf '::endgroup::\n'
    printf '::error::npm run build:%s refused to write. A generator gate failed.\n' "$t"
    failed="$failed build:$t"
  fi
done

if [ -n "$failed" ]; then
  printf '::error::FAILED GATES:%s\n' "$failed"
  if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then
    printf 'FAILED GATES:%s\n' "$failed" >> "$GITHUB_STEP_SUMMARY"
  fi
  exit 1
fi

printf 'build:all — every generator wrote.\n'
