# Brief — the first situation page: AIR

**Situation:** Delhi-NCR / Air Quality Index. The hero deck's first slide, the
ticker's first cell, and the loudest reading on the site.

**Governing documents, in this order.** This brief is subordinate to all three.
- `docs/design/BRANDING-2026-08-21-frozen-language.md` — the design language,
  extracted from the frozen page as built. **Read it first and in full.**
- `docs/design/DECISIONS-2026-08-20-homepage.md` — the live client ruling
  ledger.
- `docs/design/2026-08-21-SOURCE-FACTS.md` — the live fact base. Nothing may
  state a figure that is not here or in an owner ruling.

**This brief does not design the page.** It says exactly where the builder
stands, what the homepage has already promised on this page's behalf, what data
honestly exists, what the backend cannot yet do, and what "done" means measured
the way the homepage was measured.

**Method note.** Everything asserted about the existing file was read out of
`public/design/v3/situation-air.html` or measured on it with CDP
(`Emulation.setDeviceMetricsOverride`, IST, scale 1). Everything asserted about
the schema was read out of `lib/content/schemas.ts` and the rest of the
`lib/` and `app/` tree.

---

## 0. The decision to take before anything else

`public/design/v3/situation-air.html` exists. It is **109,062 bytes, dated 20
August, and it predates the freeze by a day.** It carries its own `<style>`
block, as every page in this system does, so **none of the homepage's fixes
reached it.**

Two paths, and they are different jobs:

**Path A — retrofit.** Work through the existing file and correct each drift.
Cheap-looking, and I do not recommend it. The audit below lists **roughly forty
distinct drifts** across a 109KB file, including a stale root token (`--pad`)
that is consumed in two places and whose removal reflows every band, a private
copy of the section-opener used **eleven** times, and six misuses of a
demoted colour token. There is no way to prove you found them all, because the
set is open — the file is a fork of a pre-freeze design and the differences are
not enumerable from the outside.

**Path B — replace the style block, keep the content architecture.** Start from
the frozen page's chrome and token layer verbatim (§10 of the branding doc
lists exactly what to copy), and re-flow this page's *content* into it. **This
is the recommendation.** The reason is structural rather than aesthetic: with
Path B the drift set is **closed by construction** — anything not copied from
the frozen file does not exist — whereas with Path A it stays open and the
verification is a hope. It is also the only path that produces a reusable
shell for the five sibling situation pages that follow.

**And the content architecture of the existing page is the asset worth
keeping.** It is genuinely good and it should not be thrown away with the CSS.
Its spine is six plain questions a reader actually asks, in order:

> Who is in it? · What is actually being measured? · Where is it coming from? ·
> Which part of the city? · Is it getting better? · What happens next? · What
> has been ordered about it? · What is measured and what is not?

It also already contains three devices that are exactly right for this design
language and should survive:

- **A stated feed inventory:** *"Two of the feeds behind this page are live and
  three are a published bulletin. None of them forecasts."* That is the
  honesty grammar working properly. (Its arithmetic needs correcting — see §3.)
- **An empty-state that names its own date of last check** rather than
  pretending: the forecast band's `#fc-empty` and its "As it ships today"
  control.
- **A method table** attaching a source to each derived figure, and a named
  caveat panel (*"A note on CPCB station data"*).

Path B's cost is honest and bounded: the copy and the data structures move; the
composition is rebuilt on tier classes and `.im-head`; every band gets
re-measured. Path A's cost is unbounded.

---

## 1. Audit of `situation-air.html` against the frozen language

### 1.1 Verdict

The page is a competent pre-freeze prototype whose **content thinking is ahead
of the homepage's and whose visual and structural layer is a generation
behind.** Its three worst problems are not cosmetic: on a phone it has **no
navigation at all**, its **ground alternation is broken across six consecutive
bands**, and its **`<h1>` is a reading** — a sentence that becomes false on the
first clean-air day.

### 1.2 Token drift

**Tokens the frozen page has and this file lacks entirely:**

| missing | frozen value | consequence here |
|---|---|---|
| `--pad-t2` / `--pad-t3` / `--pad-t4` | `clamp(88,9vw,136)` / `clamp(64,6.5vw,96)` / `clamp(28,3vw,44)`, flat `56/44/22` at ≤767 | **no tier system at all** — every band gets identical air |
| `--gap-head` / `--gap-block` / `--gap-row` | `clamp(18,1.6vw,28)` / `clamp(36,4vw,64)` / `clamp(24,2.6vw,40)` | hardcoded `gap:20px` and `margin-bottom:clamp(24px,3.2vw,42px)` in `.det-head` |
| `--bar-h` / `--nav-h` | `62/63`, `56/56` at ≤940 | **three separate literals**: `.nav-in{height:62px}`, a duplicate `.nav-in{height:56px}`, and `.side{position:sticky;top:78px}` — a third number that matches neither |
| `--hit` | `44px` default, `24px` override | no target-size token |
| `--rl-w` / `--rl-c` / `--rl-h` | the rail's state inputs | rail state hardcoded as `border-left:1px solid var(--hair)` and a bare `border-left-width:6px` |

**`--kiss` exists three times, in three forms.** The frozen page declares it
once, in `:root`, as `.06em`. This file declares it locally on the numeral
classes *and* re-derives the same number twice more as
`calc(.06 * var(--t-num))` and `calc(.06 * var(--t-readout))`. Three copies of
one value is precisely the failure the token exists to prevent.

**Tokens present in both with a different value:**

| token | frozen | here |
|---|---|---|
| `--gut` | `clamp(20px,3.4vw,46px)` | `clamp(16px,3.4vw,46px)` |

The 20px floor is a ruling with a reason attached: *16px at 375 is an app
margin, not a document margin.* This file is on the app margin.

**Every colour token and the entire type scale are byte-identical.** That is
the good news, and it means the visual identity is not at risk — but see the
next point.

**`--mustard-ink` is used under its old meaning in six places.** It has been
demoted to *a focus ring on paper only*; `#E1A32B` is the mark on both
canvases. This file still spends it as a fill and as text:

| here | frozen |
|---|---|
| `.paper .b-1{background:var(--mustard-ink);color:#fff}` | `background:var(--mustard);color:var(--on-mustard)` |
| `.paper .b-2{color:var(--mustard-ink);border-color:var(--mustard-ink)}` | `color:var(--ink);border-color:var(--mustard);border-width:2px;padding:13px 23px` |
| `.paper .b-3:hover{color:var(--mustard-ink);…}` | `color:var(--ink);border-color:var(--mustard)` |
| `.paper .lk{color:var(--mustard-ink);border-bottom-color:rgba(138,100,16,.4)}` and `:visited{color:#6E4F0C}` | `color:var(--ink);border-bottom:2px solid var(--mustard)`; `:visited{color:var(--ink-2)}` |
| `.paper .act{border-bottom-color:var(--mustard-ink)}`, `:hover{color:var(--mustard-ink)}` | `border-bottom-color:var(--mustard)`; `:hover{color:var(--ink-2)}` |
| `.paper .tag-act{color:var(--mustard-ink);border-color:var(--mustard-ink)}` | `color:var(--ink-2);border-color:var(--mustard)` |

`#6E4F0C` is a seventh mustard value that exists nowhere in the token set.

**Stale tokens this file still carries:**

- **`--pad:clamp(44px,5.6vw,88px)`**, consumed by
  `section{padding:var(--pad) 0}` and by `.foot{padding:var(--pad) 0 36px}`.
  **This is the named root defect the whole tier system exists to correct** —
  one padding token applied to every band is why nothing has a weight. It is
  the single largest structural change Path B makes.
- `--rail-kiss`, `--rail-clear` — superseded by the generic `.rl` contract.
- `--rl-h` as a pixel clamp (`clamp(118px,19vw,268px)` and
  `clamp(96px,30vw,168px)`); the frozen contract uses `1.05em` so the rule
  scales with its own numeral.

**No anchor/scroll-offset token of any kind.** `scroll-padding-top`,
`scroll-margin-top` and `--anchor` all return zero hits. Every in-page jump on
this page lands the band's title under the header — the exact defect the client
reported on `#farm`, at 92% of the headline hidden at 375.

**No `.t1`–`.t4`, no `.im-head`.** Instead there is `.det-head`, a private
near-copy of the section opener, **used eleven times**:

```css
.det-head{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.15fr);
  gap:20px clamp(28px,4vw,64px);align-items:start;
  margin-bottom:clamp(24px,3.2vw,42px)}
```

versus the frozen 12-column opener with `column-gap:24px`,
`row-gap:var(--gap-head)`, `margin:0 0 var(--gap-block)`, head on `1/span 6`,
lead on `8/span 5` with `padding-top:.4em` and `align-self:end`. Eleven section
openings on this page therefore do not read as the same gesture as the
homepage's thirteen.

### 1.3 The three named bugs — all three present, all three live

**(a) The clipped tab marker.** The `-14px` is still on the button:

```css
.rig-tabs{display:flex;gap:0;overflow-x:auto;scrollbar-width:none;flex:1;min-width:0}
.rig-tabs button{…border-top:3px solid transparent;margin-top:-14px;padding:14px 15px 0 0;…}
```

`overflow-x:auto` forces `overflow-y:auto` and a scroll container clips both
axes, so the 3px marker sits 14px above the container's padding box and is
discarded. **The selected-tab marker never paints, at any width.** The frozen
fix moves the negative margin to the container. This file also lacks the
second, later fix — the focus ring is clipped 5px on all four sides — and lacks
the ≤940 hit-box growth on the tabs.

**(b) Red on a control.** Present, and it is the exact rule the frozen page
deletes and names in a comment so it is not rebuilt:

```css
.rig-tabs button[data-breach=true][aria-selected=true]{border-top-color:var(--red)}
.paper .rig-tabs button[data-breach=true][aria-selected=true]{border-top-color:var(--red-ink)}
```

The selected tab must be **off-white, with no red variant and no mustard
variant.** Note that this file's own comment block states the rule — *"RED IS
NEVER A CONTROL"* — twelve lines above the rule that breaks it. Everything else
red in the file is legitimate: the verdict, the limit's breach words, the band
scale's tip, the form error state, and the modelled-forecast baseline are all
*readings*, not controls.

**(c) The dashed season tag.** `.tag-season{border-style:dashed}`, and it is
live in the hero markup as `<span class="tag tag-season">Year round</span>`.
Dashed already means **a window that is shut** in this same file — it is used
that way twice, on `.closed .rl::after` and on `.state.closed i`. So the tag
currently says the opposite of what it means, and a dashed rectangle around
micro-caps beside a live link also reads as a disabled button. Frozen:
`.tag-season{border-style:solid}`. **The tag keeps its box** — a validity
window is a discrete object, not decoration.

I confirmed all three by reading a 1440×900 capture of the hero, not only the
source: the YEAR ROUND tag renders visibly dashed.

### 1.4 The newer work it cannot know about

| item | here | port from the frozen page |
|---|---|---|
| **anchor-offset token** | absent | `:root{--bar-h;--nav-h}` + `html,body{scroll-padding-top:var(--nav-h)}`, both elements, with the ≤940 override. Costs no document height and covers anchors added later. Replace all three header-height literals with the tokens **first** — the rest depends on it. |
| **the SECTIONS index control** | absent — and worse, `@media (max-width:767px){.navscroll{display:none!important}}`, so **on a phone this page offers exactly one link, GIVE, for its entire length.** Confirmed in a 375×635 capture: the bar carries the wordmark and GIVE and nothing else. This page is longer and more sectioned than the homepage, so the cost is higher here than the 91.9%-of-the-document figure that bought the control on the homepage. | The 70 × 44px `.navidx-t` button in the bar's own unused space, and the `hidden` six-row `.navidx` panel immediately after it inside `.nav-in`. Non-modal, no glyph, z-index 59 under the bar's 60, zero pixels open or closed. **Keep `.navscroll` as well** and give it the 8px mask plus the 8px trailing flex item. |
| **the footer social row** | absent (`foot-soc` = 0 hits) | `.foot-soc` sub-row between the link grid and the legal strip: label, sentence naming `@swechhaindia`, the honesty clause *"Nothing on this page is pulled from them"*, and four **word** links at 44.0px each. Words, not icons, by ruling. No LinkedIn. |
| **the active-section underline** | absent. The CSS hook exists (`.nav a.nl[aria-current]`) and nothing ever sets it; the only `aria-current` in the header is a **static `aria-current="page"` hardcoded on the "Now" link**, which is wrong on this page and will fight the observer once it is wired. The file's one `IntersectionObserver` is the inert `.rise` reveal. | The guarded observer whose root is a 1px row at `--nav-h` read from the custom property, with the explicit containment test `top <= line+0.5 < bottom` and `aria-current="location"`. Remove the static `aria-current="page"`. |
| **skip link + `<main>`** | both absent | `.skip` at stop 1 with an **inset** ring, and one `<main id="main" tabindex="-1">` with `display/margin/padding` stated. |
| **the hit-box expander system** | absent | the `::after` expanders with `--hit`, the two-rule `:has()` exception written in the safe order, and the `.navscroll` expanders. **Measure the pseudo box, not the rect.** |
| **tier classes + `.im-head`** | absent; `--pad` and `.det-head` instead | `.t1`–`.t4` and the 12-column opener. Delete `--pad` and `.det-head`. |
| **the footer generally** | present and close, but: it wraps in `.wide` (1580) where frozen uses `.wrap` (1240); it has **no `id`**, so nothing can link to it; padding is `var(--pad) 0 36px`; and its ≤520 treatment collapses to one column, which the frozen file records as having produced *thirteen links at 159×23 with a measured 0px gap between vertical siblings* | port the frozen footer whole |
| **the photography defs block** | carries **five `sig-*` selective-colour filters and references none of them** — dead weight, the same dead weight the homepage carried until it was swept on 21 August. Note the wider problem: eleven `journeys-*` / `project-*` / `*-landing` pages define these filters **and reference them six times each**, so selective colour is genuinely live on those pages and contradicts the frozen language. | copy the swept defs block: **`duo` and `duo-dim` only.** Do not copy a defs block from any `journeys-*` or `project-*` page. |
| **the CTA family** | structurally complete and correct — `.b`, `.b-1`, `.b-2`, `.b-3`, `.b-g`, disabled, `.lk`, `.act`, `.give`, focus. Only the paper variants drifted (§1.2). One stray one-off outside the family: `.sub .btn{background:var(--on-mustard);color:var(--mustard)}` with **no base `.btn` rule anywhere in the file** — an orphan class. | fix the six paper variants; delete `.btn` and use the family |

### 1.5 Content claims

**Clean, and better than expected.**

- **"audited" — zero occurrences.** Nothing to withdraw here. (It is still live
  in two places on `about.html`, which is a separate job — see §5.)
- **journey counts — clean.** "Journeys" appears only as a nav label with no
  count attached, and the footer's Go column lists exactly the **four**
  journeys, byte-identical to the frozen footer.
- **project counts — clean.** The noun "projects" does not appear; all
  `project*` hits are the verb *projected/projection* in data prose. There is
  no Projects destination in this page's nav to renumber.
- **"verified" — zero occurrences.**
- **"real-time"/"realtime" — zero occurrences.** Five hits on "live", four of
  them correct: the `.state.live` mark and its `.sr` mirror, the footer's
  *"Every reading shown is a sample value standing in for the live feed"*, and
  the verb in "the ward you live in". The fifth is the feed inventory sentence,
  which is the right *shape* and the wrong *arithmetic* (§3).

**Not clean: dated and tensed claims typed into static markup. This is the
page's largest content-rule breach, and there are more than twenty of them.**

*Explicit typed dates:* the dateline `07:00 IST, 19 August 2026`; the byline
`First published 4 November 2021. Text last revised 12 August 2026`; a school
register `2025 list`; a bulletin range `August 2025 to August 2026`;
`Last checked for a forecast feed: 18 August 2026`;
`Last compiled 18 August 2026`; three order rows with both a typed
`<time datetime>` *and* typed display text plus typed docket numbers
(`Order, OA 412/2026`, `Direction 91 of 2026`); the legal strip's
`Design synthesis v3, 19 August 2026`.

*Typed present tense, nine instances:* `Read 07:00 IST today`; `…above the
limit today`; `412 today.`; `218 micrograms … today.`; `392 micrograms …
today.`; `…run against this morning's meteorology`; `…to thirty-six today`;
`07:00 IST today` in a table caption; `India, right now`. Plus a **control
label** carrying a tensed claim: `<button data-fc="empty">As it ships
today</button>`.

*A hardcoded year series:* twenty-six `<button data-y="2001" …>` through
`data-y="2026"`, each with a typed `aria-label`, and **2026 typed as "now" in
four separate places** — the `<span class="scrub-yr">`, the range input's
`value`, an `aria-current="true"`, and a JS `NOTES` object whose 2026 entry
reads *"the lowest of the twenty-six"*, hardcoding both the count and the
currency of the series.

**And the `<h1>` is itself a reading.** The page's headline is
`<h1 class="d1">Four times the limit</h1>`. On a clean-air day that sentence is
false, in the largest type on the page, in static markup. The frozen homepage
solved exactly this problem: its `<h1>` is the constant **"WE KEEP THE
RECORD"** and the method line **"Every reading against its published limit"**
sits under it, while the *reading* — 412, SEVERE, 4.1× — lives in the deck
below where it belongs and where it changes. **This needs a client ruling
(§5, Q2), and it is the most consequential single finding in this audit.**

### 1.6 Structure — the ground grammar is broken

Twelve bands. Grounds and headings in document order:

| # | element | heading | ground as coded | **ground as rendered** |
|---|---|---|---|---|
| 1 | `.hero` | *Four times the limit* | `--ground` | `#0D0D0B` |
| 2 | `.dark-2` | *(dateline, caveat, byline)* | `--ground-2` | `#151512` |
| 3 | `.withside` wrapper | *(none)* | `--ground` | `#0D0D0B` |
| 3a | ↳ `.dark-2` | Who is in it? | `#151512` | **`#0D0D0B`** |
| 3b | ↳ `.paper` | What is actually being measured? | `#F3F2F0` | **`#0D0D0B`** |
| 3c | ↳ `.dark-2` | Where is it coming from? | `#151512` | **`#0D0D0B`** |
| 3d | ↳ *(none)* | Which part of the city? | `--ground` | `#0D0D0B` |
| 3e | ↳ `.dark-2` | Is it getting better? | `#151512` | **`#0D0D0B`** |
| 3f | ↳ `.dark-2` | Two hundred and thirty-seven days above 200 | `#151512` | **`#0D0D0B`** |
| 4 | `.nat` | And where does Delhi stand? | *no bg rule* | `#0D0D0B` |
| 5 | `.dark-2 fc` | What happens next? | `--ground-2` | `#151512` |
| 6 | `.paper#record` | What has been ordered about it? | `--paper` | `#F3F2F0` |
| 7 | `.sub` | Watch your ward | `--mustard` | `#E1A32B` |
| 8 | *(none)* | What is measured and what is not? | `--ground` | `#0D0D0B` |
| 9 | `footer.foot` | *(link grid)* | `--ground-2` | `#151512` |

**Seven consecutive bands render on one unbroken `#0D0D0B`** — bands 3a
through 4. The cause is one rule:

```css
.withside>div>section{…background:none}
```

which strips the `.dark-2` and `.paper` classes off five of them. **The class
names lie about what renders.** The consequences:

1. **"No two adjacent bands share a ground" fails seven times over** — this is
   the longest stretch on the page, and it includes the whole body of the
   argument.
2. **The one `.paper` long-reading band is dark**, with `--fg` ink forced back
   over the top. That inverts the contract *paper is for long reading only*,
   on the single band on this page most deserving of paper.
3. Band 3f → band 4 is a second adjacency clash (`#0D0D0B` → `#0D0D0B`) even
   after the nested ones.

The first real ground change after band 2 is at band 5. A reader gets
`#151512` once and then roughly two-thirds of the page on one black.

Also: `.side{position:sticky;top:78px}` — a fourth header-height literal
matching neither `--nav-h` value, so the sticky sidebar and the sticky header
will overlap or gap depending on width.

### 1.7 What it gets right — keep these

So the rebuild does not throw away the thinking:

- **The six-question spine** (§0).
- **The feed inventory sentence** — the right device, wrong arithmetic (§3).
- **The forecast empty-state** that names its own last-checked date instead of
  faking a forecast, with a control to see the shipped state.
- **The method table** attaching a source to each derived figure, and the named
  `A note on CPCB station data` caveat panel.
- **The whole CTA family**, needing only its six paper variants corrected.
- **The footer copy and the four-journey Go column**, byte-identical to frozen.
- **`.sub` — the mustard "Watch your ward" band.** A single mustard field on a
  situation page is a real question (the homepage's rule is that its one
  mustard field at `#give` is what licenses mustard everywhere else), so it
  needs a decision, but the *idea* — one ask, in the accent, near the end — is
  the homepage's own grammar.

---

## 2. What the page has to do

### 2.1 What a situation is

In the schema it is a **`campaign`**, and that is the type name to keep working
with (`content/campaign/*.md`, `lib/content/schemas.ts` → `campaignSchema`,
route `app/work/campaigns/[slug]/page.tsx`). A situation carries:

- **a lifecycle** — `status: 'active' | 'monitoring' | 'achieved' | 'archived'`
- **a severity** — `severity: 'critical' | 'warning' | 'watch' | 'water'`,
  optional, and **required when `status === 'active'`** by a schema refine
  - *(`'water'` is almost certainly a typo for a fourth severity level and is
    currently a legal value. Flagged, not fixed.)*
- **a timeline** — `timeline[]`, each entry `{date, status, severity?, note}`
  with the same refine, so the lifecycle has a *history* and not just a current
  value
- **a reading** — `liveData?: {label, value, unit?, sourceLabel, updatedAt,
  mock, trendPoints?}`
- **actions** (min 1), **evidence** (min 1), and four prose fields:
  `whatWeKnow`, `publicHealthImpact`, `whyItMatters`, `whatSwechhaIsDoing`

**The frozen situation set is SIX**, by client ruling: Delhi's Air · Yamuna ·
Heatwave · Forest Fires · Forest Loss · Climate Event. Two were removed as
separate situations (Treatment/STP, which folds into Yamuna's inner page; and
Out of River, which was never a situation — 6,890t recovered is an *outcome*,
and it moved to the Impact slot, where it now lives). Noise was not on the keep
list and is therefore also out.

**`public/design/v3/intelligence.html` still renders NINE**, including `stp`,
`noise` and `waste`. It is pre-freeze. **Air's page must link to the frozen
six, not the nine**, and `intelligence.html` needs its own pass.

**Visibility is backend-controlled.** A situation is frozen into the *set*, but
whether it shows and when is governed by its validity window and its severity —
plus an admin override.

### 2.2 What the homepage already promises on this page's behalf

These are commitments, not suggestions. The homepage ships them today.

1. **"The full instrument →"** — the hero deck's one mustard act on the Air
   slide points here. The word *instrument* sets the expectation: this is the
   full apparatus behind a number the reader has already seen.
2. **The ticker's AIR cell** (`412`, red flat rail) links here. So the reader
   may arrive already knowing the figure, from either of two places.
3. **"Every reading against its published limit"** — the hero masthead's method
   line. It is a promise about *every* reading, which means **every figure on
   this page needs a published limit beside it, or an explicit statement that
   no limit exists.** The homepage already models the second case on another
   situation: *"No legal threshold."*
4. **The validity-window rules.** A closed window **does not render, anywhere**
   — no dormant cell, no CLOSED word, no greyed row. And the `YEAR ROUND` /
   `IN WINDOW` tag is **load-bearing**, not decoration: it is the visible face
   of the window, so it keeps a solid-bordered box. Air holds the widest
   window, which is why it usually leads.
5. **The state badge said LIVE.** The homepage's Air slide carries a filled
   state chip reading LIVE at the top right of its own frame. **Whatever this
   page says about its own data must agree with that**, or the pair of pages
   contradict each other. See §3 — as things actually stand, they cannot both
   be right.
6. **The location control was deferred to here.** *"We can keep my location etc
   features in the inner page of the issue."* The hero stays a single editorial
   choice; anything location-aware lives here, where the reader has opted into
   depth. Two constraints came with it: **a location with no data must show the
   hole rather than falling back to Delhi's number**, and the open scoping
   question — how many of the six situations could answer an arbitrary
   location — is explicitly assigned to this pass.
7. **India-wide data belongs here.** The frozen set's note on Air is that *"the
   inner page carries India-wide data too."* The existing page already has this
   as *"And where does Delhi stand?"* and a 256-city table. Keep it.

### 2.3 Therefore the page must deliver

- The **full arithmetic the hero cut**. At ≤560 the hero drops the sentence
  *"Four times the limit the Central Pollution Control Board sets for a safe
  day"* and keeps the schools sentence. That cut was granted on the explicit
  understanding that **the arithmetic appears in full on this page.**
- The **full provenance the hero collapsed**. At ≤560 the hero drops
  `", Anand Vihar"` and the words "Read" and "today". The station name, the
  cadence, the absolute hour and the age belong here in full.
- **Every reading with its published limit**, or the words saying there isn't
  one — for the index and for each constituent pollutant.
- **The lifecycle, visibly.** The schema carries a dated timeline with a status
  and a severity per entry; the page should show that a situation has a history
  and is not just a number today.
- **The location surface**, with an honest empty state.
- **A route to the sibling situations** — see §5 Q4.
- **One CTA to its own next step**, in mustard, per the frozen rule that every
  section carries a button.

---

## 3. The data reality — and a correction to the brief I was given

**I was told Air is one of two genuinely live feeds, via OpenAQ. It is not. As
the repository stands, nothing on this site is live at all.**

Measured, not assumed:

- `grep -riE "openaq|cpcb|aqicn|waqi"` across the repo returns **zero code
  hits.** Every match is prose in `docs/design/` or hardcoded copy in
  `public/design/`.
- **"OpenAQ" appears exactly once in the entire repository**, in prose, in
  `docs/design/2026-08-18-swechha-design-board-v2.html` — a superseded design
  board — in the sentence *"Two feeds genuinely live (OpenAQ · NASA FIRMS)"*.
  **That sentence is the sole origin of the belief that there is a live feed,
  and it describes an intention, not an integration.**
- There is **no `fetch()`, no HTTP client, and no such dependency.**
  `package.json` runtime deps are `gray-matter`, `marked`, `next`, `react`,
  `react-dom`, `zod`.
- There is **no `revalidate`, no `unstable_cache`, no `force-dynamic`.** The
  only dynamic-rendering exports are `generateStaticParams()` on two routes.
  The site is fully static SSG from local markdown.
- The one real situation record, `content/campaign/delhi-air-quality-2026.md`,
  carries **`mock: true`** and `value: '347'` — and that is honest.

**So the label position, stated plainly:**

- **On the day this page ships, its reading is `DEMO DATA` unless a feed is
  built first.** Not RECENT, not DELAYED — see below. The homepage's Air slide
  currently says **LIVE**, and that is the contradiction to resolve (§5 Q1).
  It is the single most important honesty decision on this page, because the
  site's entire claim is that it never overstates what it knows.
- **The frozen state vocabulary is four words and RECENT/DELAYED are not among
  them.** It is **LIVE / PERIODIC / DEMO DATA / OUT OF SEASON**, displayed at
  all times, never conditionally. An editor-entered "latest published reading"
  is **PERIODIC**, not "RECENT" — that is the word the vocabulary already has
  for it. `closed` / `demo` / `delayed` are class names and **must never become
  copy.**
- **`mock: true` already renders as `DEMO DATA — NOT LIVE`** in
  `components/data-attribution.tsx`. The schema deliberately makes `mock`
  non-optional with no default, so **omitting it throws** — the requirement is
  that mock is *stated*, not assumed. Keep that property.

**What is true about the underlying data, for the copy:**

- **There is no real-time public Yamuna feed**, and **CPCB has no stable public
  API.** A CPCB daily bulletin is a *published bulletin*, not a feed — which
  makes PERIODIC the correct label for a CPCB-sourced figure even after
  something is wired, unless what is wired is genuinely hourly.
- IMD was already rejected as brittle and legally grey, which is why Climate
  Event was flipped from Live to Periodic. Do not assume a source is available
  because it is public.
- The existing page's sentence *"Two of the feeds behind this page are live and
  three are a published bulletin. None of them forecasts."* is **the right
  device with the wrong numbers.** Rewrite it to whatever is true on the day —
  and if the answer is "none of them is live", say that. The last clause is
  excellent and should survive verbatim.
- **Every derived figure must name its derivation**, not just its source. The
  existing page does this well (*"Ward population from the 2011 Census
  projected forward, multiplied by the share of the ward inside the plume
  estimate"*) and that standard should hold across the page.
- **No forecast may be presented as a reading.** The existing page's forecast
  band is empty by design and says when it was last checked. Keep that shape.

---

## 4. The backend fields the design depends on and that do not exist

None of the following is in `lib/content/schemas.ts`. All were confirmed absent
by reading the file. The design already depends on the first four and they are
**not optional any more** — they are the mechanism behind rulings the client
has already made.

| # | field | what it is for | consequence of its absence |
|---|---|---|---|
| 1 | **`limit`** — a stored published limit per reading (value + the authority that publishes it) | so a breach is **derived and never typed**, and the multiplier comes free | today the limit exists only as English prose inside `whatWeKnow` / `publicHealthImpact` and as an `evidence[]` entry. `4.1×`, `LIMIT BROKEN`, the red rail and the red tip cell all have to be **hand-typed**, which means the page can say a limit is broken when it is not. This is the field the masthead's promise rests on. |
| 2 | **`windowStart` / `windowEnd` / `recursAnnually`** | the validity window: whether a situation appears on the front end at all, and whether it leads | `getActiveSituations()` filters on `status === 'active'` and sorts by severity, with **no date logic at all**. So "a closed window does not render" is currently enforced by an editor remembering. The ticker's computed *"Five in window · one record"* has nothing behind it, and the deck's `setActive()` hook is defined and never called. |
| 3 | **an admin on/off override** | switch a situation **off inside** its window and **on outside** it — the client's own stated mechanism, *"admin access to enable/disable a situation periodically, or through a date formula"* | `featured: boolean` governs card prominence, not visibility; `status` is a hand-set lifecycle value, not an override. Also: **`OUT OF SEASON` is only reachable via this override**, so without it one of the four state words can never legitimately appear. |
| 4 | **the rotating Impact slot** | a set of candidate figures with **exactly one active**, admin-selectable, independent of the situation windows; destination is the Impact page | there is **no impact schema of any kind**, and `app/impact/page.tsx` is a 25-line honest placeholder. The ticker's rightmost cell is hardcoded markup (`Out of river / 6,890t`). The admin panel must also **state at the point of selection that the colour follows the kind of figure**, or the first admin to pick a reach figure will file the off-white numeral as a bug. |
| 5 | **a source URL** | so provenance is checkable and not just named | `liveDataSchema` has `sourceLabel` but **no URL**, and `evidenceSchema` has `source` and `note` but **no URL either**. On a page whose whole claim is "with the source document attached", nothing can actually attach a document. |
| 6 | **a validated observed timestamp, separate from the hour** | the reading's own `.src` line carries an absolute hour *and* a computed relative age | `updatedAt: string` is `min(1)` with **no ISO validation**, and it is treated as one datetime. `components/data-attribution.tsx` formats it with `toLocaleString('en-IN', {timeZone:'UTC'})` — **UTC on an IST project**, which is the exact class of bug the homepage's date rules exist to prevent. |
| 7 | **a freshness enum** | the four-word state vocabulary | the only freshness signal is the binary `mock: boolean`. LIVE / PERIODIC / DEMO DATA / OUT OF SEASON cannot be expressed, so the state badge — a component whose whole design is that it is *never conditional* — has nothing to read. |

**Two dead surfaces to remove rather than build against:**

- **`heroImageSchema.signal: 'none' | 'red' | 'mustard' | 'green'`** is the
  selective-colour field. **Selective colour is retired**; photography is two
  ramps, `.duo` and `.duo-dim`, and hue lives only in type, data, marks and
  controls. The frozen HTML still carries the matching `sig-*` SVG filters.
  Both are dead.
- **`severity: 'water'`** is a legal enum value that means nothing. Almost
  certainly a typo. It should not survive into a page that derives a red rail
  from severity.

**Also on the record, outside this page's scope but blocking launch:**
`redirects.ts`'s `legacyRedirects` is still `[]` against roughly 165 old
WordPress URLs (146 posts, 19 pages), documented in-file as a launch blocker.

---

## 5. Open questions for the client — five

Only where a different answer changes the work.

**Q1 — The homepage says Air is LIVE. Nothing is wired. Which moves?**
There is no OpenAQ integration and no HTTP client in the repository (§3). So
either (a) **this page ships with its reading labelled `DEMO DATA` and the
homepage's Air slide changes to match** — one token change on each, honest
today, and it makes the site's own claim true; or (b) **a feed is built first**
and both pages stay as they are. The precedent is on the record and it went
this way: Climate Event was flipped from Live to Periodic *because nothing was
behind it*, with the note that it flips back the day a feed exists and must
remain a one-token change. **This is the first question because it decides
whether the page can ship at all.**

**Q2 — Is a situation page's `<h1>` a constant or a reading?**
Today it is `Four times the limit` — a reading, in the largest type on the
page, typed into static markup, false on the first clean-air day. The homepage
solved the same problem by making its `<h1>` the constant *"WE KEEP THE
RECORD"* with the method line under it and the reading in the deck below.
Options: **(a)** the situation h1 becomes a constant naming the *subject*
("DELHI'S AIR"), with the reading immediately below it where it changes; or
**(b)** it stays a reading and is computed, which means the page has a headline
that can render as "Below the limit" — and the whole composition has to work at
that setting too. **(a) is my recommendation** and it is also the cheaper build;
but (b) is defensible if the client wants the page to shout, and the answer
changes the hero composition entirely.

**Q3 — Retrofit the existing 109KB page, or rebuild its shell from the frozen
file and re-flow the content?**
§0 sets out both. I recommend rebuild, because it closes the drift set by
construction and produces the reusable shell the five sibling pages need. The
client is buying a different amount of work either way, and it is their call
which.

**Q4 — Five of the six frozen situations have no page. Does Air link to its
siblings before they exist?**
`situation-soon.html` is the stub, and seven links currently point at it from
`intelligence.html` and the homepage — but that count is pre-freeze: the frozen
set is **six**, and `intelligence.html` still renders **nine** (including STP,
Noise and Out of River, all of which the freeze removed or relocated). So the
questions are: does Air's page carry a sibling index at all before the other
five exist; if it does, do those five link to the stub or render as
unlinked names; and **when does `intelligence.html` get cut from nine to six?**
The through-line says show the hole rather than fake the door, which argues for
naming the five and not linking them — but that is a visible admission on the
site's most-visited inner page and it is the client's to make.

**Q5 — Which is authoritative where the detail pages contradict the frozen
homepage?**
Three project/journey detail pages disagree with the homepage that now links to
them:

| | frozen homepage says | the detail page says |
|---|---|---|
| **She Leads Change** | *"With EMpower: over 50 adolescent girls from Jagdamba, on agency and decision-making, since 2017."* | a **"Demo content — not verified"** banner, `Location — To be confirmed`, `Period — To be confirmed`, and four invented figures (2,100+ women, 48 villages, 15 enterprises, 120+ elected) |
| **Food systems, with UNEP** | *"Curriculum and action projects on food and sustainability, in Delhi NCR government schools."* | same banner, four different invented figures (3 studies, 18 partners, 1,400t, 2 cities) |
| **CityScapes** | *"2–4 hours. Over a thousand walks in two decades, and over a hundred thousand people on them."* | **no demo stamp at all**, so it reads as verified — and it shows a duration with **no figures**, against a PDF that said "half-day" |

The homepage's copy is the client's own, supplied 21 August, and is newer. The
detail pages are demo templates. **CityScapes is the urgent one**, because it
is the only one of the three carrying no honesty stamp, so a reader cannot tell
it is a template. Confirm the homepage is authoritative and the three detail
pages are rewritten from it — or say otherwise, because the answer decides
whether Air's page can carry a "related work" block at all.

*(Two smaller items that need a ruling but do not gate this page: "audited" is
still live twice on `about.html` — on the impact tiles and in the governance
block — against the ruling that withdrew the word; and how an **absence** (0.0
of 5.0) ranks against a **multiple** (4.1×) is still unanswered and is needed
by anything that orders readings by severity.)*

---

## 6. Build order

Assumes Path B. Each step ends in a measurement, and no step starts before the
one above it is measured — the ordering is not arbitrary, it is dependency.

**Phase 0 — decide.** Q1 and Q2 at minimum. Q1 decides the state token, Q2
decides the hero composition. Do not build the hero before Q2 is answered.

**Phase 1 — the shell, measured empty.** Copy the frozen `:root`, voices,
grounds/tiers, rail contract, state marks, buttons/links/tags, `.im-head`, the
nav + SECTIONS + underline block, the hit expanders, the skip link and `main`,
and the footer whole. Declare the band sequence — id, tier class, ground hex —
and check adjacency mechanically **before any content goes in.** Delete
`--pad`, `.det-head`, `--rail-kiss`, `--rail-clear`, `.btn`, and the static
`aria-current="page"`. Gate: `scrollWidth === innerWidth` at all eleven widths,
console silent, anchors landing within ±0.5px of `--nav-h` on both paths.

**Phase 2 — the hero.** The reading, in the six-part form: numeral in `.rl`,
rule in its state, unit, verdict, published limit + band scale, provenance and
hour. The state badge at the top right of its own frame, carrying whatever Q1
decided. The season tag **solid**. The multiplier in `--fg`, not red. Gate: the
rail's kiss is exactly `.06em` of the numeral at 375 and 1440; the readout's
decimal slot holds the account column still across every value length; ring
overhang 0.00 on the tabs at rest **and after scrolling**.

**Phase 3 — the argument, on the real ground rhythm.** The six questions, each
band a declared tier with a declared ground, alternating properly, with **the
long-reading band actually on paper**. Restore the sticky sidebar against
`--nav-h` rather than `top:78px`. Gate: no two adjacent bands share a hex, at
375×812, 375×635 and 1440×900; every band inside 900px at 375 or named and
justified.

**Phase 4 — the honest data layer.** Rewrite the feed-inventory sentence to
what is true. Rebuild the forecast empty state. Attach a source and a
derivation to every derived figure. Sweep every typed date and tensed claim —
cut it, or compute it from **local `Date` getters only**, with the
`console.warn` guards kept in the shipped file. Gate: grep your own file for
`today`, `now`, `currently`, `this year`, `as of`, month names and `20\d\d`,
and account for every hit.

**Phase 5 — location.** The control the hero deferred here, **with its empty
state built first**: a location with no data shows the hole and never falls
back to Delhi's number. Answer the scoping question the ruling assigned to this
pass — of the frozen six, which can actually answer an arbitrary location —
before designing the control, because a control that answers two situations in
six needs a deliberate design for the other four.

**Phase 6 — the year series and the national table.** These are the two heavy
data objects and they are last because they are the most likely to be cut for
budget. The 26-button scrubber must not hardcode "now" in four places.

**Phase 7 — the floors, then the ledger.** Touch, focus, keyboard, 320–1920
overflow, contrast walk. Then publish the band ledger at three viewports so the
next pass can prove it changed nothing.

---

## 7. What "done" means — measured the way the homepage was

A gate, not a wish list. Each line is a number someone else can reproduce.

| # | gate |
|---|---|
| 1 | **`document.scrollWidth === innerWidth`** at 320, 375, 390, 414, 560, 768, 901, 1024, 1280, 1440, 1920 — and in every open/closed state of the SECTIONS panel and any other panel. Body matches. |
| 2 | **Contrast: zero failures.** Walk every element carrying its own text, composite its effective background, test 4.5:1 (or 3:1 for large/bold-large). Not "no known failures" — none. The homepage clears this with no element within 0.6 of the line. |
| 3 | **Touch: zero controls under 24px at any width.** Measure the **pseudo box**, not the element rect — `getComputedStyle(el,'::after').height` where that pseudo is absolutely positioned with a stated height. Every control under 44px is named, justified and shown to be arithmetically capped. |
| 4 | **Focus: ring overhang 0.00 on all four sides at every width, at rest AND after scrolling every scroll container.** Corner controls take an inset ring. |
| 5 | **Keyboard:** skip link is stop 1; the stop count before content is stated; one index focusable at a time in both panel states; no off-screen duplicate links in the tab order. |
| 6 | **Anchors:** cold load with the hash **and** same-page click, for every in-page target, landing within **±0.5px of `--nav-h`** at 375×812, 375×635 and 1440×900, with `aria-current` correct on arrival. |
| 7 | **Ground adjacency: zero clashes**, checked mechanically on rendered background colour (not on class names — that is exactly how the existing page hides seven clashes), at all three viewports. |
| 8 | **Phone budget:** every band inside 900px at 375, or named with the arithmetic showing why it cannot be and a ruling licensing it. Measured at **375×635 as well as 375×812** — 635 is the real iOS Safari height. |
| 9 | **Console silent** at every width, before and after every change, in every panel state. Zero failed requests. |
| 10 | **Band ledger published** — id, tier, height, top, pad-top, ground — at 375×812, 375×635 and 1440×900, plus document height quoted **with its viewport height**. |
| 11 | **Every figure traced** to `2026-08-21-SOURCE-FACTS.md` or a named owner ruling, with its label stating which population it counts. |
| 12 | **Every reading carries all six parts**, or states in words that no published limit exists. |
| 13 | **Zero tensed or dated claims in static markup.** Grep results shown. |
| 14 | **Zero drift from the frozen language**, itemised against §1–§7 of `BRANDING-2026-08-21-frozen-language.md`: no `--pad`, no private section-opener, no `--mustard-ink` as fill or text, no dashed season tag, no red on a control, no selective-colour filters, no reveal system, no auto-advance, no icon set, no borrowed logo. |
| 15 | **PNGs read, not just measured.** Every band at 375 and 1440; every heavy crop at 1:1; every placeholder treatment at 320 and 375; every panel open. Two of the frozen page's real defects existed **only** in `scrollWidth` vs `clientWidth` and in the picture — a box check saw two elements a clean 16px apart while the glyphs collided. |

**Measurement method is part of the gate.** `Emulation.setDeviceMetricsOverride`
only, never a bare `--window-size`. Viewport captures with
`captureBeyondViewport:false`, or `position:fixed` elements render against the
document origin and vanish or misplace. Scroll lazy images into view and flip
them to `eager` before a clipped capture. Crop with PIL, not `sips
--cropOffset`. And **verify a suspicious PNG against a probe before reporting
it as a defect** — all three of these traps have manufactured a phantom defect
list on this project already, and I hit the fixed-element one again while
preparing this brief.
