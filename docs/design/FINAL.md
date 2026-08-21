# FINAL — the pages that are done

**This file is GENERATED.** It is written from the register in
`scripts/verify-final.mjs`, which is also the acceptance test. Do not edit it by
hand: run `npm run verify:final -- --doc`.

That indirection is the point. A hand-written list of "final pages" goes stale
the first time somebody edits a generator and nothing tells you. Here the list
and the test are the same object, so **the only way this document can be wrong is
if the test is failing** — and the test is what regenerates it.

```bash
npm run verify:final              # rebuild all seven, assert everything
npm run verify:final -- --no-build  # assert the pages as they sit on disk
npm run verify:final -- --doc     # regenerate this file
```

---

## 1. The shape: one index, six situations born out of it

**This is not seven peers.** `/now` is the parent. A reader arrives there, picks
a situation, and lands on its page. Every situation carries a crumb back to the
index and a rail to its five siblings, and the relationship is **asserted in both
directions** — the index must link to all six, and all six must link home. A page
that stops linking home has orphaned itself, and an index that drops a card has
orphaned a page. Neither shows up in a diff, so both are checked.

```
                    /now  ·  intelligence.html
                              │
        ┌─────────┬───────────┼───────────┬─────────┐
       Air     Yamuna       Heat    Forest fire  Forest loss  Climate event
```

## 2. The register

| page | route | bands | money | reading, from its own dataset | state |
|---|---|---|---|---|---|
| `intelligence.html` | `/now` | 3 | — | 387 · 0.3 · 2.43 · 34,562 | pass |
| `situation-air.html` | `/now/air` | 9 | yes | 387 | pass |
| `situation-yamuna.html` | `/now/yamuna` | 10 | yes | 0.3 · 5.0 mg/L | pass |
| `situation-heatwave.html` | `/now/heat` | 8 | — | 48.3 · 1,832 | pass |
| `situation-forest-fire.html` | `/now/forest-fire` | 8 | — | 34,562 | pass |
| `situation-forest-loss.html` | `/now/forest-loss` | 8 | — | 2.43 · 156.41 | pass |
| `situation-climate-event.html` | `/now/climate-event` | 8 | — | 13 · 3,594 | pass |

Every page is a **build artefact**. Editing the HTML is pointless — the change
dies at the next build. Edit the generator.

| page | generator | npm |
|---|---|---|
| `intelligence.html` | `scripts/build-intelligence.mjs` | `npm run build:index` |
| `situation-air.html` | `scripts/build-situation-air.mjs` | `npm run build:situation-air` |
| `situation-yamuna.html` | `scripts/build-situation-yamuna.mjs` | `npm run build:situation-yamuna` |
| `situation-heatwave.html` | `scripts/build-situation-heatwave.mjs` | `npm run build:situation-heatwave` |
| `situation-forest-fire.html` | `scripts/build-situation-forest-fire.mjs` | `npm run build:situation-forest-fire` |
| `situation-forest-loss.html` | `scripts/build-situation-forest-loss.mjs` | `npm run build:situation-forest-loss` |
| `situation-climate-event.html` | `scripts/build-situation-climate-event.mjs` | `npm run build:situation-climate-event` |

## 3. What each one is

- **`intelligence.html`** — The situation index. Six cards, six units, six kinds of limit, and no total.
- **`situation-air.html`** — AQI against CPCB’s own limit of 100, computed from station concentrations.
- **`situation-yamuna.html`** — Dissolved oxygen at or below the detection limit, against a notified minimum of 5.0 mg/L.
- **`situation-heatwave.html`** — The hottest reading in the archive against IMD’s severe threshold, across 14 stations.
- **`situation-forest-fire.html`** — Area burnt in one season. The one situation with no legal threshold.
- **`situation-forest-loss.html`** — Two official sources pointing opposite ways, published as two.
- **`situation-climate-event.html`** — Days over IMD’s heavy-rain threshold, and the deaths from five named causes.

## 4. What the test asserts, and why each check exists

Every check earned its place by catching something in this build.

| check | why it is here |
|---|---|
| builds | the generator runs and its own five write-gates pass |
| h1 | the page is the page it claims to be |
| bands | a band did not silently vanish or duplicate |
| **reading** | **the page still says what its committed dataset says.** This is the class of bug that had the index showing 412 while the Air page said 387, and the homepage ticker showing 0.0 for a figure CPCB never published |
| states | the four-word vocabulary, and only those four words |
| money | present only on Air and Yamuna, per D-27 |
| headings in gutter | every `.im-head` inside a `.wrap`, or it renders at x=0 (D-23.2) |
| no placeholders | no unexpanded `${...}` reached the HTML — caught six pages carrying a literal `${FAMILY_CSS}` |
| links up to /now | a situation has not orphaned itself |
| links to 5 siblings | the set is navigable without going back up |
| carries its crumb | the page states that it is one of six |
| links down to all 6 | the index has not dropped a child |

**No credentials needed.** Builds read committed JSON; only the fetchers need
keys. This runs in CI.

## 5. Not in the final set

- **`home.html`** — THE FROZEN DESIGN SOURCE. Not a deliverable in this set — it is the language every page above extracts from. Hand-maintained, and D-24.5 records that making it a build artefact is a real architectural change nobody has taken.
- **`situation-soon.html`** — SUPERSEDED AND DEAD. It was the "coming soon" stub for situations with no page. All six now have pages, so nothing links here. Safe to delete; left in place because deleting another session's prototype is not this work's call.
- **`about.html`** — Prototype, outside this work.
- **`system.html`** — Prototype, outside this work.
- **`_mobile.html`** — Prototype, outside this work.
- **`work/`** — In progress in a concurrent session (AD-17). Not this work.

## 6. Open items on the finished set

1. **Two markups for one vocabulary.** The five shell-built pages stamp state
   with the `.tag` component in caps (`PERIODIC`); Air predates the shell and
   uses the frozen homepage's `.state` component in title case (`Periodic`).
   Both are legitimate frozen components and both say the right word, so the test
   accepts both — but it is a divergence across siblings, and it should be
   resolved when Air is next touched for its own reasons.
2. **Air still owns the situation CSS.** The shell reads it out of
   `build-situation-air.mjs` as text. The intended end state is that the block
   moves into the shell and Air imports it; prove that migration with a
   byte-identical rebuild.
3. **`situation-soon.html` is dead** and nothing links to it. Safe to delete.
4. **`home.html` is hand-maintained**, which is why its ticker fallback figure
   is typed rather than injected (D-24.5).
