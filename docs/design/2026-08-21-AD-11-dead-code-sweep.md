# AD-11 — Dead-code sweep on the frozen homepage

**Date:** 21 August 2026
**File:** `public/design/v3/home.html` (frozen and committed as `1149b6d`)
**Client instruction:** *"delete unnecessary codes"*
**Constraint:** the rendered page must not change by a single pixel.

**Method.** Chrome headless, CDP `Emulation.setDeviceMetricsOverride` only — never a
bare `--window-size`, which has manufactured phantom defect lists on this project
twice. Timezone `Asia/Kolkata`, `deviceScaleFactor` 1, scrollbars hidden. Widths
**320 · 375 · 390 · 414 · 560 · 768 · 901 · 1024 · 1280 · 1440 · 1920**. Band PNGs at
375×812 and 1440×900, every band clipped with `captureBeyondViewport` after forcing
every `loading="lazy"` image to `eager` and scrolling the document through once.

**Result: 4,728 bytes removed (287,754 → 283,026, −1.64%). Every band 0.00px at every
width, every document total unchanged, all 56 band PNGs byte-identical, console still
silent, zero new unmatched selectors, every interactive path identical.**

---

## 1. The headline numbers

| | before | after | delta |
|---|---|---|---|
| `home.html` bytes | 287,754 | 283,026 | **−4,728 (−1.64%)** |
| lines | 4,537 | 4,540 | +3 (removals plus five short comments recording them) |
| DOM nodes | 892 | 811 | **−81** (the deleted `<filter>` subtrees) |
| CSS rules | 751 | 745 | −6 |
| declarations removed | — | — | **13** |
| byte-identical duplicate rules remaining | 0 | 0 | — |
| unconditionally-shadowed declarations remaining | 13 | **0** | −13 |
| unused custom properties | 0 of 67 | 0 of 67 | — |
| `@keyframes` / `@font-face` | 1 (used) / 0 | 1 (used) / 0 | — |
| files deleted on disk | — | — | **5 (958,278 bytes)** |

Gross code removed from the file is ~6.2 KB; five short comments recording each
removal cost ~1.5 KB back. That trade is deliberate — see §6.

---

## 2. What was removed, by class of cut

### 2.1 Byte-identical duplicate rules — 1 pair

A duplicate `:focus-visible` pair sat orphaned at the foot of the `MOTION` block:

```css
:focus-visible{outline:2px solid var(--mustard);outline-offset:3px}
.paper :focus-visible{outline-color:var(--mustard-ink)}
```

The documented `── FOCUS ──` block ~150 lines later restates both at **equal
specificity and later in the cascade**, and its version is a strict superset
(`border-radius:1px` added; the `.paper` selector extended to `.paper-2`). Neither
declaration here could win at any width. Evidence: same media context (none), same
specificity, later rule sets the same properties.

### 2.2 Stale-selector survivor — 1 rule

```css
@media (max-width:519px){ … .s-record-off .s-record-yr{font-size:11px} … }
```

The file's own comment above the archive sheet already records this removal as **done**:

> `.s-record-cell.s-record-off` and `.s-record-off .s-record-yr` were here … Both are
> REMOVED rather than orphaned, because after the client's "put placeholder photos in
> archive boxes" no markup carries `.s-record-off` any more, and a live rule matching
> nothing is the stale-selector bug this file has already been bitten by twice.

The `≤519` copy was missed by that cleanup. Verified in the live DOM:
`document.querySelectorAll('.s-record-off').length === 0` at both widths, while
`.s-record-ph` returns **20** — the placeholder cells are untouched, and their year
chip is `.s-record-ph`'s, not this rule's.

### 2.3 Declarations unconditionally overridden later — 13 declarations

Each is the *same selector*, in the *same media condition string*, at *equal
specificity*, with a later block setting the same property. A declaration in that
position can never win at any width, so removing it is provably a no-op. No
`!important` is involved anywhere (the file contains exactly one, unrelated).

| # | selector | media | property removed | won by |
|---|---|---|---|---|
| 1 | `.foot-g` | `≤520` | `gap:22px 18px` | `.foot-g{gap:4px 18px}`, same block, 12 lines down |
| 2 | `.w7-pj-fig` | `≤767` | `height` | AD-07 PHONE TRIMS block |
| 3 | `.w7-pj-nums` | `≤767` | `gap` | AD-07 PHONE TRIMS block |
| 4 | `.w7-pj-num` | `≤767` | `font-size` | AD-07 PHONE TRIMS block |
| 5–7 | `.w7-ce-evn` | `≤767` | `padding`, `min-height`, `line-height` | AD-07 PHONE TRIMS block |
| 8 | `.w7-ce-evmore` | `≤767` | `min-height` | AD-07 PHONE TRIMS block |
| 9 | `.w7-ce-evnote` | `≤767` | `font-size` | AD-07 PHONE TRIMS block |
| 10 | `.w7-ab-p` | `≤767` | `font-size` | AD-07 PHONE TRIMS block |
| 11–13 | `.w7-ab-yrs > li` | `≤767` | `padding` (3 values, one declaration) | AD-07 PHONE TRIMS block |

The AD-07 "PHONE TRIMS, measured band by band" block near the foot of the sheet is
itself `@media (max-width:767px)`, so it applies wherever the earlier per-band `≤767`
blocks apply. It is the authority by construction: its comments record the measured
decisions that superseded these values ("an event name is not a link, so it does not
need a 44px tap row — that was 54px of dead phone height"). Cases 5–7 are that exact
superseded 44px tap row, still sitting in the earlier block where it could never fire.

**Only the losing declaration was removed.** Where a rule set a surviving property too
(`.w7-pj-fig`'s siblings, `.w7-ce-evn`'s `display`/`border-top`, `.w7-ab-yrs > li`'s
`grid-template-columns`/`column-gap`, `.foot-g`'s `grid-template-columns`), that
property stayed exactly where it was.

### 2.4 Unreferenced SVG filter definitions — 6 filters, 5,377 bytes

The `<defs>` block defined **eight** filters. The stylesheet references **two**:

```css
.duo{filter:url(#duo)}
.duo-dim{filter:url(#duo-dim)}
```

and the comment above them is explicit: *"Two ramps and nothing else … Selective colour
is retired from photography; hue lives only in type, data, marks and controls."*

Removed: `duo-m` (434 B), `sig-r` (986), `sig-y` (984), `sig-g` (989), `sig-r-dim`
(993), `sig-y-dim` (991).

Three independent lines of evidence that these were dead:

1. **Static:** `url(#sig-…)` and `url(#duo-m)` appear **zero** times in the file — in
   CSS, in inline styles, and in every `filter=` attribute.
2. **Live DOM, before the cut:** enumerating computed `filter` over the whole document
   returned exactly `{url("#duo"): 20, url("#duo-dim"): 20}`. Forty filtered elements,
   none of them reaching a `sig-*` or `duo-m`.
3. **Cross-page:** the seven `v3/*.html` pages all define these filters and all use
   **zero**. Selective colour is genuinely live, but on the *detail* pages
   (`journeys-*`, `project-*`, `*-landing`) — 7 defined / 7 used each — and those pages
   carry their own `<defs>`. Nothing about this cut touches them.

A height check cannot catch a broken filter (a photograph rendering in full colour costs
no pixels of layout), so this cut is carried by the **PNG comparison** in §3.2, not by
the band table.

---

## 3. Proof

### 3.1 Every band, every width — 0.00px

Values are the frozen (before) measurements; the Δ column is the largest absolute
before→after difference across all eleven widths.

| band | 320 | 375 | 390 | 414 | 560 | 768 | 901 | 1024 | 1280 | 1440 | 1920 | Δ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `top` | 769.27 | 733.63 | 734.09 | 701.98 | 674.88 | 665.03 | 817.20 | 819.42 | 824.03 | 825.00 | 825.00 | **0.00** |
| `ticker` | 116.45 | 116.45 | 116.45 | 116.45 | 99.94 | 107.67 | 107.67 | 107.67 | 108.44 | 111.16 | 111.67 | **0.00** |
| `say` | 438.05 | 438.05 | 438.05 | 438.05 | 463.08 | 450.00 | 450.00 | 450.00 | 463.14 | 488.55 | 503.30 | **0.00** |
| `work` | 741.28 | 741.28 | 741.28 | 719.53 | 659.78 | 762.47 | 801.75 | 787.33 | 952.08 | 1013.83 | 1036.84 | **0.00** |
| `journeys` | 879.30 | 833.20 | 833.20 | 833.20 | 809.50 | 1211.23 | 1233.64 | 1232.63 | 977.86 | 1058.08 | 1083.08 | **0.00** |
| `projects` | 893.48 | 893.48 | 893.48 | 894.94 | 837.59 | 1140.23 | 1171.67 | 940.80 | 1026.45 | 1112.66 | 1141.81 | **0.00** |
| `campaigns` | 823.86 | 784.11 | 784.11 | 784.11 | 785.48 | 743.28 | 761.56 | 804.09 | 942.97 | 1009.78 | 1026.80 | **0.00** |
| `about` | 1023.41 | 890.33 | 890.33 | 890.33 | 666.14 | 900.05 | 902.11 | 862.67 | 903.98 | 944.89 | 964.38 | **0.00** |
| `impact` | 619.88 | 598.19 | 598.19 | 598.19 | 598.19 | 579.77 | 418.88 | 440.83 | 510.41 | 550.97 | 561.25 | **0.00** |
| `farm` | 905.44 | 841.25 | 841.25 | 843.25 | 810.31 | 927.06 | 927.75 | 945.95 | 978.64 | 1006.09 | 1018.91 | **0.00** |
| `gtm` | 351.14 | 325.58 | 325.58 | 300.02 | 274.45 | 284.00 | 289.02 | 299.55 | 326.50 | 336.09 | 337.72 | **0.00** |
| `record` | 1487.92 | 1393.48 | 1280.03 | 1283.05 | 1249.06 | 1233.98 | 1166.23 | 992.05 | 1113.38 | 1236.17 | 1294.28 | **0.00** |
| `give` | 935.38 | 861.13 | 861.13 | 836.05 | 812.67 | 563.23 | 550.39 | 509.17 | 561.13 | 679.16 | 690.38 | **0.00** |
| `footer` | 766.19 | 725.83 | 725.83 | 725.83 | 660.19 | 666.19 | 489.67 | 464.50 | 412.17 | 416.97 | 417.78 | **0.00** |
| `header` | 105.80 | 105.80 | 105.80 | 105.80 | 105.80 | 105.80 | 105.80 | 63.00 | 63.00 | 63.00 | 63.00 | **0.00** |
| **document** | **10857** | **10282** | **10169** | **10071** | **9507** | **10340** | **10193** | **9720** | **10164** | **10852** | **11076** | **0.00** |
| `scrollWidth` | 320 | 375 | 390 | 414 | 560 | 768 | 901 | 1024 | 1280 | 1440 | 1920 | **0** |

`scrollWidth === innerWidth` at every width, before and after. `--nav-h` (56/63) and
`--bar-h` (56/62) unchanged at every width.

**Harness cross-check against the existing ledger.** `record` 1,393.48 @375, 1,236.17
@1440, 1,487.92 @320, document 10,282 @375 (900-tall probe) / 10,244 @375×812 and 10,852
@1440 — every one of these matches the figures already recorded in AD-09 and its
post-freeze fix. The harness agrees with the frozen record before a single byte was cut.

### 3.2 Every band PNG — byte-identical

The pre-cut file was served alongside the live one and both were captured **back to
back**, at 375×812 and 1440×900, all 14 bands, then SHA-256 compared.

| run | bands compared | differing |
|---|---|---|
| normal media, 375 | 14 | **0** |
| normal media, 1440 | 14 | **0** |
| `prefers-reduced-motion: reduce`, 375 | 14 | **0** |
| `prefers-reduced-motion: reduce`, 1440 | 14 | **0** |

**56 of 56 band PNGs byte-identical.** This is what carries the filter cut: if any
photograph had lost its duotone ramp, its band's height would not have moved by a
pixel, but its PNG hash would have.

#### A false positive, recorded because it nearly became a finding

The *first* comparison — before PNGs captured at the start of the session, after PNGs
~40 minutes later — reported `top` differing at **both** widths: 60 differing pixels at
375, 53 at 1440, max channel delta ~130, inside a 7×11px box.

The tempting explanation was the file's one `@keyframes` (`s-hero-live`, the 9×9px
blinking LIVE dot) catching a different animation phase. **That was wrong**, and taking
it on trust would have hidden whatever the real cause was. Two checks settled it:

- Two independent runs of the *identical* file produced byte-identical PNGs including
  `top` — so the difference was not nondeterministic phase.
- `document.elementFromPoint` at the centre of the diff bbox returned
  `time.s-hero-age` inside `p.cap.s-hero-src` — the **computed relative age**, not the
  dot. The dot sits at band-relative (311.2, 56.7) at 375; the diff was at (268, 511).

The 7×11px box was one or two digits of *"· N hours ago"* advancing on the real clock
between my two capture sessions. AD-05 R1's computed age doing exactly its job. The
back-to-back re-run in the table above is the valid comparison.

*(Separately confirmed for the record: the LIVE dot's own opacity does vary with
capture timing on the pre-cut file alone — 1.0 at +0…+1100ms, 0.9216 at +1500ms — so a
band PNG comparison of this page must always be taken back-to-back.)*

### 3.3 Console — still silent

Cold load plus the full interaction sequence, at both widths, capturing
`Runtime.consoleAPICalled`, `Log.entryAdded` and `Runtime.exceptionThrown`:

| | 375 | 1440 |
|---|---|---|
| cold-load console | `[]` | `[]` |
| console after all interactions | `[]` | `[]` |
| exceptions | `[]` | `[]` |

`console.warn` is still present in the shipped file (verified in the source, not
assumed). Its silence is the point: a broken comment once killed the whole date IIFE and
the page looked identical to correct behaviour — only the warnings caught it.

### 3.4 Unmatched selectors — zero new

Full CSSOM walk, every rule, every comma-separated part, pseudo-elements and state
pseudo-classes stripped (longest-token-first, so `:focus-visible` is not eaten by
`:focus`), tested with `querySelector` against the live DOM at 375 and 1440:

| | before | after |
|---|---|---|
| rules with at least one dead part | 107 | 106 |
| fully dead rules | 97 | 96 |
| **new unmatched selectors introduced** | — | **0** |
| unmatched selectors eliminated | — | 1 (`.s-record-off .s-record-yr`) |

The earlier pass's "roughly 29" was a count of distinct base class names; the real
figure by rule is 107. Every one was re-verified against the live DOM in this pass
rather than inherited. §5 says why 96 of them stay.

### 3.5 Interactive paths — identical

The whole interaction report serialises byte-identical before and after, at both
widths. What it covers:

| path | before = after |
|---|---|
| deck: 4 tabs built, pager `1 of 4` at load, `prev` disabled / `next` live | ✓ |
| deck: click tab 3 → `3 of 4`, `aria-selected` `false,false,true,false`, both arrows live | ✓ |
| deck: `next` → `4 of 4`, `next.disabled === true` (**no loop**) | ✓ |
| deck: three `prev` → `1 of 4`, `prev.disabled === true` | ✓ |
| deck: D-09.3 tabindex withdrawal — focusables per panel `[1,0,0,0]` | ✓ |
| deck: `.rig-tabs` `scroll-padding-inline: 5px` and `margin: -19px -5px -5px` | ✓ |
| SECTIONS panel: `hidden` in markup at load, `aria-expanded=false`, panel is the button's **next sibling** | ✓ |
| SECTIONS panel: click → open, `aria-expanded=true`, 6 chips withdrawn from tab order, mustard `rgb(225,163,43)` underline @375 | ✓ |
| SECTIONS panel: **Escape** → closed, `aria-expanded=false`, focus returned to the button, 6 chips restored | ✓ |
| active-section underline, **same-page click** on all five nav bands → `aria-current` on all 3 matching links, correct band every time | ✓ |
| active-section underline, **cold-hash** load (`#journeys`, `#record`) → correct band | ✓ |
| anchor landing clears the header: error −0.47 to +0.47px @375, −0.47 to +0.09px @1440 | ✓ |
| 40 elements still filtered, values exactly `url("#duo")` and `url("#duo-dim")` | ✓ |
| `--nav-h` / `--bar-h` read from the custom property | ✓ |

The five same-page-click landings at 375 measured 56.19 / 56.47 / 55.59 / 55.78 /
55.61 against a `--nav-h` of 56 — inside the ±0.5px slack AD-09 recorded, and the
`journeys` case (56.47, the one that used to underline WORK) still lights `#journeys`.

### 3.6 Structural spot checks

| | 375 | 1440 |
|---|---|---|
| images / broken images | 42 / **0** | 42 / **0** |
| `main#main[tabindex="-1"]` present | ✓ | ✓ |
| `a.skip` present | ✓ | ✓ |
| `#navidx` `hidden` at load | ✓ | ✓ |
| `.rise` nodes (must stay 0 and inert) | 0 | 0 |
| `.rig` `setActive` still a function | ✓ | ✓ |
| `.s-record-ph` cells | 20 | 20 |
| `.s-record-off` nodes | 0 | 0 |
| `.tag-demo` rule retained | ✓ | ✓ |

---

## 4. Files deleted on disk — 958,278 bytes

Only files whose deletion I could prove harmless. All are tracked in git and therefore
recoverable from `1149b6d`.

| bytes | file | why certain |
|---|---|---|
| 924,693 | `public/design/img/wm-fire.jpg` | **Exact duplicate** of the live `public/images/photos/uttarakhand-fire-scar-2016.jpg` (md5 `0df1bd744b99123ee855abf77753162a`, identical size). Referenced by no renderable page. Zero information lost. |
| 8,463 | `public/images/stories/delhi-air.png` | Solid-colour placeholder generated by `scripts/make-placeholders.mjs`; all three are md5-identical to each other. The three story pages now point at real photography (`delhi-smog-skyline.jpg`, `bee-on-mustard-flower.jpg`, `children-certificates-field.jpg`). Only reference was an old plan doc. Regenerable by a script in this repo. |
| 8,463 | `public/images/stories/monsoon-wooding.png` | same |
| 8,463 | `public/images/stories/rooftop-sanctuary.png` | same |
| 8,196 | `.DS_Store` | macOS junk, untracked, already gitignored. |

The now-empty `public/images/stories/` directory was removed;
`scripts/make-placeholders.mjs` calls `mkdirSync(…, {recursive:true})`, so it self-heals.

**Checked before deleting.** `lib/content/schemas.test.ts` contains the string
`/images/stories/delhi-air.jpg` — note `.jpg`, while the file on disk was `.png`. It is
an in-memory Zod fixture that validates a string's shape and never opens a file. Not a
dependency. The live `public/images/campaigns/delhi-air.png` shares the placeholders'
md5 but **is** referenced by `content/campaign/delhi-air-quality-2026.md` and was left
alone — a basename-only sweep would have deleted it.

Re-verified after deleting: home.html loads 42 images with **0** broken at both widths.

---

## 5. NOT cut, and why

This is the half of the job where a sweep like this does damage. Every item below
matches nothing today and was left in place.

### 5.1 Named in the rulings as load-bearing

| kept | reason |
|---|---|
| `.js .rise`, `.js .rise.in`, the reduced-motion `.rise` block, and the reveal observer | AD-09 must-not-undo #10: *"`.rise` matches zero nodes and its observer is inert. Leave it inert."* Verified still 0 nodes. |
| `root.setActive(ids)` — defined, never called | AD-08 §1: *"it is the hook waiting for the D-01.4 / D-00.1 backend."* This is the single most inviting cut in the file (8 lines of unreachable JS) and it is explicitly not dead. |
| `.nav a.nl[aria-current]` | D-09.4. Matches nothing on a cold load at the top of the page and matches three links the moment a band holds the reading line. A live state machine, not a dead rule. |
| `.navidx-t[aria-expanded="true"]` @≤940 | AD-09 must-not-undo #6: the mustard underline **is** the state marker, in place of an icon. Matches only while the panel is open — proven live in §3.5. |
| `.sit[hidden]` | D-00.1 — a closed situation does not render. Nothing is hidden today because all four windows are open. This is the guard, and `slides()`'s `[hidden]` filter is its other half. |
| `.tag-demo`, `.paper .tag-demo` | D-07.14: the dotted grammar the archive placeholders borrow. |
| `.s-record-ph` and its 20 cells | AD-09 must-not-undo #9: it marks an unscanned **year**, not a doubtful photograph. |
| every `mask` / `clip-path` vendor prefix | the halftone and cut-out treatments need them. |
| all `console.warn` lines | in the shipped file on purpose. |
| `--nav-h`, `--bar-h` and everything reading them | one token drives the anchor offset **and** the underline; they must move together. |
| `.w7-ab`, `.w7-ce`, `.w7-do`, `.w7-im`, `.w7-jr` | AD-07 §5.8: five section hook classes with **no CSS rule, intentionally**. |
| `.delayed`, `.rp`, `.rn`, `.s-ticker-date` | AD-07 §3 ran these as a before/after control and declared them pre-existing, not defects. |

### 5.2 Count-independence guards — the classic trap

```css
.w7-pj-rows > li:nth-child(n+8):not(.w7-more)     .w7-pj-rows > li.w7-more:nth-child(n+9)
.w7-ce-camp > li:nth-child(n+4):not(.w7-more)     .w7-ce-camp > li.w7-more:nth-child(n+5)
.w7-ce-evn:nth-of-type(n+5)                       .w7-ce-evrail .w7-ce-evmore:nth-child(n+6)
```

All match nothing today, because the register holds exactly 7 rungs, the campaigns
exactly 3 and the events exactly 4. They are the D-03.2 / D-03.4 contract — *the
homepage may not depend on counts* — and the file says so in three places
(`THE BOUNDARY ROW (count-independence, D-03.2/D-03.4)`, `Count-independence: 7 rungs
above 768…`, `Cap 3, down from 4 with the Oye Dilli removal`). D-07.7 and D-07.8 are
already queued to grow both lists (a fourth journey, eight register rows). Cutting these
would silently arm the exact failure they exist to prevent.

### 5.3 The shared component kit — 96 of the 107 unmatched rules

The `COMPONENTS` block (buttons `.b-1`/`.b-2`/`.b-3`/`.b-g`, links `.lk`/`.act`, tags
`.tag-*`, form fields `.f`/`.f-lab`/`.f-help`/`.f-err`/`.f-errmsg`/`.f-search`, the
focus layer) plus the `VOICES` and readout vocabulary (`.h2`, `.body`, `.eyebrow`,
`.src`, `.win`, `.limit`, `.bands`, `.state`, `.readout`) accounts for almost all of the
remaining unmatched selectors — mostly as `.paper X` / `.paper-2 X` on-paper inversions
of components that are not currently placed on a paper ground. **All of it stays**, on
four grounds:

1. **The file says so.** `.b-g` carries *"RETIRED, AND DELIBERATELY NOT USED … Kept only
   so the retirement is on the record."* `VOICES` and `BANDS, LIMIT, VERDICT, WINDOW`
   are both headed *"Unchanged."* The duotone pair carries *"THESE TWO RULES ARE
   LOAD-BEARING … Do not remove them."*
2. **D-07.12 makes this file a spec.** *"The frozen v3 pages stay — they are the only
   spec the real Next.js build has to work from."* The on-paper inversions are the
   design system's answer to "what does this component look like on paper", and the
   engineer reading it needs that answer whether or not band 6 happens to use it today.
3. **Several are the honesty vocabulary.** `.win`, `.win.closed b`, `.state.closed i`,
   `.closed .rl::after`, `.readout.quiet`, `.verdict.bad`, `.limit b` are the
   closed-window / out-of-limit language. D-02.3 rules explicitly that `OUT OF SEASON`
   *"is not a dead value"*, and the `.tag-season` comment cites `.closed .rl::after`
   and `.state.closed i` as live doctrine that constrains other decisions.
4. **They cost nothing measurable.** They are matched once at parse and never again.

Cutting this block would have been the single biggest byte win available. It is also the
one that would have destroyed the most information, and it is not what "delete
unnecessary codes" asks for.

### 5.4 Comments

Left in full, including two that are now slightly stale:

- The deck's smoothing warning names `.s-journeys-rack` as the home of the file's one
  `scroll-behavior:smooth`. That band was replaced in AD-07 and the declaration now
  lives on `.w7-jr-strip`. **The name is stale; the trap it documents (AD-05 R6 — adding
  `scroll-behavior:smooth` alone makes the deck lie, because `idx()` reads
  `track.scrollLeft`) is still live.** Correcting the name is a one-word edit, but it is
  an edit to a frozen file for no rendered benefit; flagged in §7 instead.
- The comment at lines ~791–792 names `.s-impact`, `.s-journeys-open`, `.s-work-head`,
  `.s-impact-open`, `.s-timeline-open`, `.im-head` while describing a grid that was
  removed. Comment-only; a grep for those names produces false positives.

---

## 6. On the five comments this pass added

Five short comments (~1.5 KB) mark where each removal was, costing back about a quarter
of the gross saving. That is deliberate and it is this file's own convention: the
`.s-record-off` cleanup left exactly such a comment, and the survivor found in §2.2 is
proof the convention works — it is how I knew that rule was already ruled dead rather
than guessing. This file records that it has been bitten by stale selectors twice
(AD-05 R6, R8). A note saying *why a declaration could never win* is what stops the next
session putting it back.

They were written twice: the first drafts ran ~1.5× longer and were tightened once the
byte cost was visible.

---

## 7. Left for a human decision

Nothing here was touched.

### 7.1 Unique photography with no renderable reference

| bytes | file | note |
|---|---|---|
| 748,176 | `public/design/img/wm-heat.jpg` | Unique frame. **The repo has no other heat photograph** — `public/images/photos/` contains nothing matching heat. Named only in `docs/design/image-credits.json` and `public/design/credits.json`, neither of which is loaded by any code. |
| 131,011 | `public/design/img/wm-monsoon.jpg` | Unique frame. `monsoon-flooded-fields.jpg` is live and may or may not be the same subject. |
| 767,393 | `public/images/photos/yellow-flower-closeup.jpg` | Referenced by nothing at all, and not even present in `content/photo-library.json`. Near-miss checked: the only `yellow-flower` hits are the different, live `kans-grass-yellow-flower.jpg`. |

`public/design/img/` is reachable from **no** HTML, app, component or content file — the
prototypes that used it were deleted in `1149b6d`. Deleting the last two files empties
the directory. I stopped at `wm-fire.jpg` because it was a provable duplicate; these two
are unique images and deleting unique photography is a content decision, not a sweep.

**Consequence either way:** `docs/design/image-credits.json` and
`public/design/credits.json` both still carry a `wm-fire.jpg` row that now points at
nothing. Nothing loads either file, so it is a records question, not a bug.

### 7.2 `public/design/v3/_mobile.html` (9,455 bytes)

The last surviving review harness — a phone-width viewer with a fold line at 635px. Not
linked from any page; referenced only by three docs. **D-07.12 ruled that the review
harnesses go**, and its siblings `_review.html` and `_options.html` are already off
disk. Left in place because the section-by-section homepage pass may still want it, and
deleting the last instrument mid-pass is the kind of tidying that costs an hour later.
One-line decision.

### 7.3 The curated photo library — 11 files, 7,632,087 bytes

`public/images/photos/{farm-cow-closeup, langurs-branch-family, oranges-on-tree,
farm-building-yellow-trees, langur-portrait, red-flower-cluster, oranges-branch,
pink-flower-bud, red-trumpet-flowers, magenta-flowers, red-flower-bud-branch}.jpg` are
listed in `content/photo-library.json` and rendered by nothing.

`content/photo-library.json` is read by **no code** — it is a curation catalogue, not a
runtime source. So these are "in the library, not yet placed", which is not the same as
orphaned. Not a sweep decision.

### 7.4 Explicitly keep

- `public/brand/archive/*` (4 files, 555,047 bytes) — unreferenced **by design**.
  `public/design/v3/system.html:391-393` says the pre-correction logo originals are
  *"kept, not deleted"*, with a note not to regenerate exports from them. They are
  provenance, and `scripts/prepare-brand-assets.mjs` cannot reproduce them (its source
  folder is outside the repo).
- `incoming/journeys hero.png` (3,423,770 bytes) — gitignored local drop-box, invisible
  to the repo. Presumably the source original behind the live `journeys-hero.jpg`. Not
  mine to touch.

### 7.5 Two stale comment references

`.s-journeys-rack` in the deck's smoothing warning, and the removed-grid class list at
lines ~791–792. Both described in §5.4. Renaming the first is correct and costs one
word; I did not edit prose in a frozen file for zero rendered benefit.

---

## 8. What a future session must not undo from this pass

1. **The AD-07 PHONE TRIMS block is now the only `≤767` source for the nine properties
   in §2.3.** If a per-band `≤767` block ever needs one of them back, it must go *after*
   the trims block or it still will not win.
2. **`.foot-g`'s gap at `≤520` is set once, at the second occurrence** (`4px 18px`). The
   first occurrence now sets `grid-template-columns` only. Do not merge the two — that
   reintroduces the equal-specificity ambiguity, which is the shape of the AD-05 R8 bug.
3. **The `<defs>` block holds two filters and only two.** If selective colour is ever
   brought back to this page, the `sig-*` definitions are recoverable from `1149b6d`
   and are live in the `journeys-*` / `project-*` pages. Do not re-add them speculatively;
   an unreferenced filter is 5.4 KB that no measurement can catch.
4. **Band PNG comparisons on this page must be captured back-to-back.** Both the
   computed relative age (`time.s-hero-age`) and the LIVE dot's animation phase move on
   real time, and either will manufacture a hero "defect" across sessions. §3.2 has the
   numbers.

---

## Appendix — harness

Scratchpad: `.../scratchpad/ad11/`

| file | what |
|---|---|
| `probe.js` | band heights, document total, `scrollWidth`, `--nav-h`/`--bar-h`, node count |
| `sel2.js` | full CSSOM walk, per-comma-part `querySelector` test, pseudo-safe stripping |
| `dup.js` | byte-identical duplicates, shadowed declarations, unused custom properties, keyframes, font-faces |
| `capbands.mjs` | batched band PNGs, one Chrome per width, lazy images forced eager |
| `capbands-rm.mjs` | same, with `prefers-reduced-motion: reduce` emulated |
| `interact.mjs` | console + exceptions + every interactive path in §3.5 |
| `dot.mjs` | LIVE dot sampled at five settle offsets |
| `who.js` | `elementFromPoint` at a diff bbox; enumerates animated elements |
| `final.js` | broken images, landmarks, protected-node counts |
| `home.html.bak-pre-ad11` | pre-sweep file |

Byte-identical-PNG evidence: `png-before-*`, `png-after-*`, `b2-before-*`, `b2-after-*`,
`rm-before-*`, `rm-after-*`.

**Not committed.**
