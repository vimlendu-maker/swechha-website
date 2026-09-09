#!/bin/sh
# ─────────────────────────────────────────────────────────────────────────────
# ONE STAGING LIST, FOR EVERY PUBLISHER THAT COMMITS TO `main`.
#
# Five workflows commit generated output on a cron — air-hourly, data-refresh,
# content-rebuild, climate-events and climate-coverage-hourly — and until this
# script each of them named the trees to stage by hand. No two lists agreed.
# Measured 9 September 2026:
#
#   air-hourly        data  _pages  public/data                design
#   climate-coverage  data  _pages                             design  FINAL.md
#   climate-events    data  _pages               public/images design  FINAL.md
#   content-rebuild   data  _pages                             design
#   data-refresh      data  _pages  public/data                design  FINAL.md
#
# `public/images` appeared in exactly one of them, and that is not a curiosity:
# it is what `fix(imagery): the satellite frames were downloaded, recorded, and
# thrown away` repaired. fetch-event-imagery.mjs wrote the JPEGs to
# public/images/eo/<slug>/ and recorded them in data/, so the RECORD was staged
# by `data` and the pages citing it by `public/_pages`, while the frames
# themselves were staged by nothing and died with the runner. 23 of the 25
# frames the committed metadata cited were absent from the repository.
#
# ★ WHY A SUPERSET IS SAFE, WHICH IS WHAT MAKES ONE LIST POSSIBLE AT ALL.
# `git add -A <tree>` on a tree with no changes stages nothing and exits 0 —
# verified, not assumed. So a publisher naming a tree it never writes pays
# nothing, while a publisher NOT naming a tree it does write leaves a
# generated file uncommitted, and the next pull request anyone opens fails
# generated-current.yml on a diff its author did not cause.
#
# ★ TREES, NOT FILES, AND THE ONE EXCEPTION.
# air-hourly.yml records the lesson: a previous version named five paths by
# hand and one of them, `data/air-history.ndjson`, did not exist — AD-46 moved
# that history into a DIRECTORY, `data/air-history/`. Under `set -e` that
# `git add` exits 128, so the publisher was one refactor away from failing on
# every run. Naming trees cannot rot that way. `docs/design/FINAL.md` is the
# single named file here because it is the only generated artefact outside the
# four trees, and `docs/` as a whole is hand-written.
#
# Usage:  ./scripts/stage-generated.sh
# It stages and does nothing else. Each workflow keeps its own commit message,
# its own "nothing staged" check and its own push-and-retry, because those
# genuinely differ between publishers — only the list was ever the same.
# ─────────────────────────────────────────────────────────────────────────────
set -eu

git add -A \
  data \
  public/_pages \
  public/data \
  public/images \
  design \
  docs/design/FINAL.md
