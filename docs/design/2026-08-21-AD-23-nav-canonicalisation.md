# AD-23 — The navigation, wired: one word, one destination, from every page

**21 August 2026.** The owner's instruction, unchanged since the link contract was
compiled: *"keep in mind which page is linked to menu bar WORK, what happens when
anyone clicks on Project in home page, etc… All cross linkings need to be solid."*

This pass finishes that job across the **whole** finished set, not one section of it.
Nothing was designed here and no copy changed: **every edit in it is an `href` value**,
plus two `aria-current` attributes and one stray byte.

---

## 1. The defect, measured before it was touched

Every `href` in all 24 live pages under `public/design/v3/` was enumerated
mechanically — the same method the link census used, not by reading markup and
believing it. **The finished set was running two incompatible nav conventions.**

| convention | pages | the six as written |
|---|---|---|
| **canonical routes** | `home.html` + the 15 WORK pages | `/now` `/work` `/work/journeys` `/impact` `/#farm` `/#record` |
| **prototype paths** | the 7 situation pages + `about.html` | `/design/v3/intelligence.html`, `/design/v3/home.html#work`, … |

So the site had **two answers for every nav word**, decided by which page the reader
happened to be standing on — the exact defect the link contract's §1 was written to
kill, surviving in the half of the set that the WORK brief did not cover.

**Why the prototype half is the wrong half, and it is not a matter of taste.**
`public/design/` is deleted before any deploy (AD-17 §6.4), so a `/design/` path is a
link that *cannot survive the port*. W-2 already recorded the frozen homepage's own six
being corrected off exactly these values, and the WORK section's link gate rejects the
whole class. The situation pages and About simply never got the same pass.

### The four defects underneath it

1. **8 pages × 6 nav words + wordmark + Give chip** on prototype paths — 66 hrefs.
2. **The homepage's own body still carried 13 prototype paths** after W-2. The rewire
   covered the nav, the footer and the journeys; the ticker cells, the four hero
   "full instrument" actions and band 7's two situation links were not in its scope.
3. **Two dead links on the frozen homepage.** The monsoon and fire hero slides pointed
   at `situation-soon.html` — the "coming soon" stub that FINAL.md §5 records as
   *"SUPERSEDED AND DEAD… All six now have pages, so nothing links here."* Two links
   did, which is why a generated register should not be trusted over a census.
4. **A dead anchor:** `intelligence.html#method`. The index has three bands —
   `top`, `set`, `campaigns` — and no `method`.

## 2. The route-map conflict, and which one wins

The two sessions had each written down where the six situations live, and **they
disagreed on both halves of the path**:

| source | the six | heat |
|---|---|---|
| `FINAL.md` / `situation-shell.mjs` | `/now/<slug>` | `/now/heat` |
| `work-shell.mjs` `SITUATION_PROTOTYPES` | `/situations/<slug>` | `/situations/heatwave` |

**`/now/<slug>` wins, and the reason is structural rather than aesthetic.** `/now` is
the index and the six are its children — the shell's own comment describes the
workflow as *"a reader arrives at /now, picks a situation, and lands on its page"*, and
`verify:final` asserts that relationship in both directions. A child route that does
not sit under the index it belongs to orphans the page from its own parent.

`SITUATION_PROTOTYPES` is therefore **retired**, not corrected. It existed to record a
canonical destination beside each working prototype path so the port would be a table
lookup; the generators now write the canonical route directly, so it had nothing left
to exempt — and a second copy of somebody else's route map is what let the two drift
in the first place. The six arrive in the WORK build through `data/work/onward.json`'s
route map and are checked like every other route.

## 3. What changed, exactly

**Destinations were preserved, not redesigned.** Body copy keeps the destination it
had, rewritten into canonical form (`/design/v3/home.html#work` → `/#work`). Only
three links changed where they *point*, and each is a defect being closed:

| link | was | now | why |
|---|---|---|---|
| hero, monsoon slide | `situation-soon.html` | `/now/climate-event` | dead stub; that slide's situation is IMD's heavy-rain threshold |
| hero, fire slide | `situation-soon.html` | `/now/forest-fire` | dead stub; that slide's situation is area burnt |
| `intelligence.html#method` | dead anchor | `/now` | fragment dropped, not invented |

**Two label-matched promotions**, where a link's text is the proper name of a page that
now exists: Air's `Delhi I Can't See You` → `/work/campaigns#delhi-i-cant-see-you`, and
Yamuna's `Yamuna Yatra` → `/work/journeys/yamuna-yatra`. Both previously landed on a
homepage band.

**`aria-current` on the situation set**, per AD-19 §5 — `"page"` only where the href
equals the URL being built, `"true"` where the word is the right location but the href
is its parent. So the index carries `"page"` on `Now` and each situation carries
`"true"`. It is derived in `assemble()` from the file being written, so a generator
cannot mark the wrong word. **This is the pass's one visual change:** the mustard
`[aria-current]` underline — the mark the homepage already uses — now appears under
`Now` on seven pages.

## 4. Verification

- **1,109 internal links resolve** across the 24 live pages, against the route map and
  each target's own ids. **One unresolved href remains** and it is named in §5.
- `verify:final` — **7 of 7 pages, all 12 checks**, including the up/down family
  assertions now checked against canonical routes rather than filenames.
- `build:work` — **15 pages, every gate green, zero link-gate failures**, and the
  `situation-prototype` verdict class is gone from `LINKS.json` because nothing emits it.
- **The frozen homepage did not move.** Its whole diff is 35 `href` values and W-2's
  two-line observer fix — no element, no text, no style. `href="#"` still **9**, the
  count the build refuses to write past. Measured at 1440×900: document **10,905**,
  `record` **1,289.54** against W-30's ledger of 10,906 and 1,289.50; `work` 1,012.32
  against 1,013.83. **These are capture differences, not layout differences** — W-30
  measured with CDP device-metrics override and this pass through the in-app browser —
  and an `href` value cannot move a box. Stated rather than rounded into a match.

## 5. Open, and deliberately not decided here

1. **`/design/v3/system.html` — the last prototype path, in the frozen footer's
   "The system sheet", and therefore on all 24 pages.** It is a design-system sheet
   with no route and no plan for one, so at the port it 404s. Removing it is a visible
   change to the frozen footer and belongs to the owner, not to a link pass.
2. **The port itself is untouched, on AD-17 §6.4's recommendation.** Every nav word now
   names the URL it will have, and `/work/journeys` and the six `/now/<slug>` routes
   do not exist yet — clicking them in the prototype 404s, and `/now`, `/work`,
   `/impact` and `/act` still render the pre-design scaffold pages. The hrefs are
   correct *for* the port, which is what the architecture asked prototypes to carry.
   No interim redirects were added; `/work/projects` → `/work` would be a lie.
3. **`intelligence.html#method`'s promise is unmet.** Its homepage label reads *"Every
   source · Where the readings come from … with its cadence, the date it was last
   drawn"*. No page provides that register. The fragment was dropped so the link is not
   dead; the missing page is a content gap, not a link bug.
4. **The Monsoon Wooding card on the index** still reads `The record →` into `/#impact`,
   though `/work/campaigns/monsoon-wooding` is now a page. Repointing it needs the
   label to change, and approved copy is under the never-rewrite rule.
5. **`scripts/build-about-page.mjs` contained one NUL byte**, which made `file` report
   it as `data` and caused `grep` to silently return nothing on it — three searches for
   the About doors came back empty before Python found them. Removed. Worth knowing
   that a generator can go grep-invisible without anything failing.
