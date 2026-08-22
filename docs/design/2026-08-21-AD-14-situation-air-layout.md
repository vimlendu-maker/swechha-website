# AD-14 — The first situation page: AIR. Layout specification (Stage 1)

**Status:** Stage 1 — composition and layout, for sign-off. No build until this is ruled.
**Subordinate to,** in this order: `BRANDING-2026-08-21-frozen-language.md` ·
`DECISIONS-2026-08-20-homepage.md` · `2026-08-21-SOURCE-FACTS.md` ·
`2026-08-21-SITUATION-PAGE-BRIEF.md`.

**Client decisions taken 21 August, in this pass:**

| # | question | ruling |
|---|---|---|
| A | the spatial device | **A coverage map** — where the monitors are, not a pollution surface |
| B | the human-impact band | **Named exposed populations**, not Swechha's own footprint |
| C | the five sibling situations | **Name five, link none** |
| D | the `<h1>` wording | **DELHI'S AIR** |

---

## 1. Verdict, in one line

The page is an **instrument that publishes the hole beside the reading**, in twelve bands
plus the frozen footer, on a rebuilt shell (D-10.3) — and the composition is designed to
hold when every value on it is stamped `DEMO DATA`, because today every value is.

### The composition rationale

The reference the client supplied — `vayu-gamma.vercel.app` — is a command centre that
manufactures certainty. Its network layer was read end to end: every figure is served from
its own Vercel API routes off seeded fixtures, the same JSON returns byte-identical minutes
apart, a nonsense city returns Delhi's coordinates, its source attribution is labelled in
its own UI as a *"Spatial Noise Model"*, its pipeline telemetry is invented milliseconds,
and its court dockets do not exist. It wears a `LIVE` chip over all of it.

Swechha cannot out-apparatus that and should not try. The available position is the
inverse, and it is the stronger one, because it is the only one that is true:

> **Every reading against its published limit. Every gap named.**

That is the method line, and it is also the page's architecture. **Six of the fourteen
bands are direct inversions of a VAYU feature** — where it fabricates, this page names the
limit of what is known (§4). This is not a rhetorical posture; it is forced by the fact
base. `SOURCE-FACTS.md` carries **no environmental figures at all**, so per the ledger *no
figure on this page may need to be true*. A page that only reads well when its numbers look
authoritative is the wrong page for this site. This one reads *better* when they are
stamped.

---

## 2. Three corrections the frozen language forces

These change what I proposed in chat. All three are the branding document winning.

**2.1 The "Watch your ward" band loses its mustard field.**
`--mustard` is a ground **exactly once on the whole site**, at `#give`, *"and that single
field is what licenses it as a control colour everywhere else."* The existing prototype's
`.sub` band is a second mustard field. It comes off. The band keeps one `.b-1` primary
button in mustard, which is the grammar it should have had. **This resolves the open
question at §1.7 of the situation brief, with a reason rather than a preference.**

**2.2 The `DEMO DATA` chip may not sit under the `<h1>`.**
§5.3: the state mark *"belongs to the reading, not to the page… a corner badge reading LIVE
over an editor-entered figure would be the single worst thing on the site,"* and that
failure is made structurally impossible rather than avoided. So the chip sits top-right of
**the reading's own frame** inside the hero, travelling with the reading. There is no
page-level state badge anywhere on this page.

**2.3 The coverage map may not introduce a mark system.**
§9.4: the only non-type marks the site permits *anywhere* are **the `→` arrow, the six-band
scale, and the halftone dot screen.** A conventional map — pins, basemap, tile layer,
legend icons — would be the site's first icon set, on the page meant to read as an
instrument rather than an app.

The map is therefore drawn **entirely in marks the language already owns**:

| map element | drawn as | already means |
|---|---|---|
| district / ward boundaries | 1px `--hair` hairlines | a division |
| a continuous monitor | the `.state i` 9×9 square, filled | a reading exists here |
| a monitor whose feed is not wired | the same square, 45° hatched | this value is not real |
| **unmonitored area** | the 45° hatch as an area fill | *(see the ruling needed below)* |
| the reader's own ward | the 2px mustard underline grammar | a human act |

No basemap, no tiles, no colour, no pins, no third-party library. It is a diagram in
hairlines and squares, and it is honest by construction because **it can only draw what is
measured.**

> **RULING NEEDED (R-1).** The 45° hatch currently means *a placeholder or demo value*
> (`.state.demo`, `.tag-demo`'s grammar, the archive's placeholder frames). Using it as an
> **area fill for "nobody is measuring here"** widens it. I think it is the same meaning —
> *there is no real measurement behind this* — and that the widening is therefore
> legitimate and cheap. But §5.7 says a border/fill style is a semantic and widening one
> needs a ruling, so this is that ruling. **If refused,** the unmonitored area renders as
> bare ground with a labelled boundary and the band loses some of its force.

---

## 3. Two problems found by measuring, not by looking

**3.1 The 365-day year strip does not fit a phone.** At 375 the `.wrap` measure is 335px
after the 20px gutters. 365 ticks in 335px is **0.92px per tick with zero gap** — not a
strip, a smear, and sub-pixel rendering will alias it into stripes that mean nothing.

Three ways out, in my order of preference:

| option | at 375 | at 1440 | cost |
|---|---|---|---|
| **(a) 52 weeks on phone, 365 days on desktop** | 52 ticks × 4.4px + 2px gap | 365 × 2.3px | two compositions, one dataset; the phone tick means *a week above the limit* and the label must say so |
| (b) 12 months everywhere | 12 blocks, readable | 12 blocks, coarse | one composition, but throws away the desktop's real resolution |
| (c) 365 everywhere, phone scrolls | needs a licensed horizontal scroller | fine | the site permits **exactly two** horizontal scrollers and both are spoken for |

**Recommendation: (a).** It follows the standing mobile rule — *never solve a mobile
problem by making type bigger; solve it by cutting the frame* — and a week is an honest
unit for a phone.

**3.2 `watched` is at or over the 900px phone cap.** Estimated 880–950px at 375. The
frozen homepage has exactly **two** licensed exceptions (the heroes, and `record` by name),
and the branding doc is explicit that you *"do not quietly breach and do not damage a
component to hit the number."* So this is asked, not assumed:

> **RULING NEEDED (R-2).** Either license `watched` by name as this page's one exception,
> **or** it ships at ≤560 as a **ward list** (the same hairline rows, the same filled /
> hatched squares, no plan geometry) and the map appears from 561 up. The list is not a
> degradation — it carries the identical information and it is the honest form on a
> 335px measure. **My recommendation is the list**, because it keeps the exception count
> at two and the page needs no licence.

---

## 4. The six inversions

The page's distinctiveness lives here. Each is a VAYU feature turned inside out. **Two of
the six exist because the source research contradicted this document's own first draft** —
which is the method working, not a correction to be embarrassed about.

| # | band | VAYU does | this page does |
|---|---|---|---|
| 1 | `measured` | shows one AQI number as *the* air quality | shows that **the index is the worst of six sub-indices, not the average of six** — one column lit, five lower. A methodological truth, so it costs no data claim, and it quietly explains why one number cannot describe a city |
| 2 | `watched` | paints ward-level plumes and per-facility "enforcement registry" rows it does not have | draws **where the monitors actually are**, and hatches everything nobody is measuring |
| 3 | `sources` | generates the traffic/industry/construction/biomass split from a *"Spatial Noise Model"* | cites **one published apportionment study, stamped with its year and its authority**, and says in words that it is a study and not today |
| 4 | `next` | serves a **fabricated** 72-hour forecast with confidence bands | **names the real forecaster** — SAFAR publishes a genuine 72-hour Delhi forecast, and CPCB republishes it. This band links it and says why Swechha does not restate it (D-13.2) |
| 5 | `stubble` | prints a farm-fire hotspot count with no sensor named | **counts the same fires twice** — MODIS and VIIRS side by side, because a 1 km² fire is one hotspot in one and nine in the other, and almost no published count says which it used |
| 6 | `money` | invents court dockets to imply accountability | **quotes the government's own budget** — allocated against utilised, national and state-wise, every row with its Parliament answer or notification attached |

---

## 5. Band ledger

Tier padding, from the build sheet: `t1` = `padding:0` · `t2` = `--pad-t2` (56px at ≤767,
129.6px at 1440) · `t3` = `--pad-t3` (44 / 93.6) · `t4` = `--pad-t4` (22 / 43.2).
Every T2 and T3 band opens with **`.im-head`** — no private section-opener. Everything
carrying sentences is on **`.wrap`** (1240). Estimates are at **375×812**.

> **REVISED TWICE since first issue.** Stubble entered at 5 (D-13.4) and the funds band at
> 9 (D-13.6). Band 10 `next` was rebuilt because its hook was false (D-13.2) and band 7
> `record` shortened to the real series (D-13.3). The chain below was **re-derived, not
> patched.** Data sources for every row are in `2026-08-21-AD-15-air-source-ledger.md`.

| # | id | tier | ground | hue | container | job | est. @375 |
|---|---|---|---|---|---|---|---|
| 1 | `top` | t1 | `#0D0D0B` | **red** + mustard (interface) | `.wrap` | The instrument | ~780 |
| — | `strip` | *chrome, not a band* | `#151512` | **red** only | `.wide` | **The 360° overview** (D-14.6) | ~116 |
| 2 | `people` | t2 | `#0D0D0B` | none | `.wrap` | Who is in it? · **the health evidence** | ~740 |
| 3 | `measured` | t2 | `#F3F2F0` | none | `.wrap` | What is actually being measured? | ~820 |
| 4 | `sources` | t3 | `#151512` ⇄ `#0D0D0B` | none | `.wrap` | Where is it coming from? · **flips out of season** | ~620 |
| 5 | `stubble` | t3 | `#0D0D0B` | none | `.wrap` | The fires, counted two ways · **seasonal** | ~700 |
| 6 | `watched` | t2 | `#151512` | none | `.wide` | Which part of the city is watched? | ~660 |
| 7 | `record` | t2 | `#0D0D0B` | **red** | `.wrap` | Is it getting better? · **AQI since 2015** | ~820 |
| 8 | `india` | t3 | `#151512` | none | `.wide` | And where does Delhi stand? | ~640 |
| 9 | `money` | t2 | `#0D0D0B` | none | `.wrap` | **What has been spent on it?** | ~760 |
| 10 | `next` | t3 | `#151512` | none | `.wrap` | What happens next? · **names SAFAR** | ~560 |
| 11 | `doing` | t2 | `#F3F2F0` | **green** | `.wrap` | What is being done about it? | ~800 |
| 12 | `method` | t2 | `#0D0D0B` | none | `.wrap` | What is measured and what is not | ~820 |
| 13 | `situations` | t4 | `#151512` | none | `.wrap` | The other five, named | ~300 |
| 14 | `ward` | t3 | `#ECEBE8` | mustard (control only) | `.wrap` | The one ask | ~520 |
| — | `footer` | — | `#151512` | none | `.wrap` | frozen footer, whole | ~726 |

**Document estimate ≈ 10,226px at 375×812** (homepage: 10,244 at the same viewport). Quoted
with its viewport height, per §2 of the build sheet — the t1 band scales off `svh`, so this
number is meaningless without it.

**Every band is inside the 900px phone cap, and the hero is the only licensed exception** —
which every page gets, so **this page raises the site's exception count by nothing.** The
reason is D-12.8: turning `watched` into a ward list at ≤560 took it from ~880 to ~660.

**Two counts that must never become dependencies.** The band count is **fourteen in season,
thirteen out of it** (D-13.4), and the spine is now **seven** questions. No stated total, no
`repeat(14,1fr)`, and the word "seven" is not typed anywhere.

### 5.1 Adjacency proof

**IN SEASON** — hero, then the caged strip, then fourteen bands:

```
 1  #0D0D0B  →  s  #151512   ✓      8  #151512  →  9  #0D0D0B   ✓
 s  #151512  →  2  #0D0D0B   ✓      9  #0D0D0B  → 10  #151512   ✓
 2  #0D0D0B  →  3  #F3F2F0   ✓     10  #151512  → 11  #F3F2F0   ✓
 3  #F3F2F0  →  4  #151512   ✓     11  #F3F2F0  → 12  #0D0D0B   ✓
 4  #151512  →  5  #0D0D0B   ✓     12  #0D0D0B  → 13  #151512   ✓
 5  #0D0D0B  →  6  #151512   ✓     13  #151512  → 14  #ECEBE8   ✓
 6  #151512  →  7  #0D0D0B   ✓     14  #ECEBE8  → ft  #151512   ✓
 7  #0D0D0B  →  8  #151512   ✓
```

**OUT OF SEASON** — band 5 absent, and **`sources` flips to `#0D0D0B`**:

```
 3  #F3F2F0  →  4  #0D0D0B   ✓      4  #0D0D0B  →  6  #151512   ✓
```

…and the chain from 6 onward is unchanged. **Zero clashes in both states.**

> **CORRECTION to this document as first issued.** It said `watched` flips ground when
> `stubble` does not render. **That is wrong** — it produces `watched` `#0D0D0B` meeting
> `record` `#0D0D0B`, moving the clash rather than fixing it. **`sources` is the band that
> flips**, and it is the only one: nothing downstream cascades. Recorded as D-14.7.
>
> This is the first place a seasonal band has touched the ground grammar, and it is exactly
> the hazard §5.8 warns about — a sequence whose length varies with the season. **Both states
> must be verified mechanically on rendered colour**, not just the one that happens to be
> live on the day of measurement.

To be re-verified mechanically on *rendered* background colour at 375×812, 375×635 and
1440×900, in **both** seasonal states, before Phase 3 closes — the existing prototype hides
seven clashes precisely because it was checked on class names.

### 5.2 Hue proof

Red lives in bands **1** and **7**. Green lives in band **11**.

- One hue live per band: ✓ (mustard is the interface layer, not a band hue.)
- Red and green never in the same band: ✓
- Red and green never in **adjacent** bands: ✓ — nearest approach is band 7 (red) to
  band 11 (green), **four bands apart**. Bands 8, 9 and 10 carry no hue, which is what makes
  the separation real rather than nominal. Adding the funds band widened this.
- **`stubble` carries no hue, deliberately.** Fire begs for red; red means *a published limit
  broken* and there is no published limit on a fire count.
- **`money` carries no hue, deliberately.** An underspend is not a breached limit, and green
  is spoken for. The allocated-versus-utilised gap is carried by the **rail contract** —
  allocated is the full rule, utilised the filled portion, the shortfall the unfilled
  remainder. No colour at all, and it scales onto the solved register-row grammar.
- No red on any control, no green on any control, mustard carries no state: to be proven
  per-element at Phase 7.
- The multiplier in band 1 is set in `--fg`, **not red** — the breach is already said three
  ways there and a fourth is shouting.

---

## 6. Wireframes

`.im-head` is the 12-column opener throughout: head (`.d1`) on `1 / span 6`, lead
(`.lead`, 46ch max) on `8 / span 5` with `padding-top:.4em` and `align-self:end`;
`:only-child` takes `1 / span 8`.

### Band 1 — `top`, the instrument · t1 · `#0D0D0B`

```
1440 ─────────────────────────────────────────────────────────────────────────
  DELHI'S AIR                                    ┌─ reading frame ─────────┐
  .d1  Archivo 68/850  104px  -.032em  .86       │            [▨ DEMO DATA]│  ← .state.demo,
                                                 │                          │    top-right of
  EVERY READING AGAINST ITS PUBLISHED LIMIT.     │   412 ▍                  │    THIS frame
  EVERY GAP NAMED.                               │   .readout 272px  │6px   │    (§5.3)
  .lbl  11.5px  .15em  --fg-2                    │   in .rl         │--red │
                                                 │                  │       │
  [ YEAR ROUND ]  ← .tag-season, SOLID border    │   AQI, 24-HOUR ROLLING   │
                                                 │   SEVERE   ← .verdict    │
                                                 │   4.1× the limit ← --fg  │
                                                 │   CPCB SAFE LIMIT 100.   │
                                                 │   LIMIT BROKEN. ← .limit b│
                                                 │   ▭▭▭▭▭▮  ← .bands, tip  │
                                                 │   ────────────────────── │
                                                 │   {station}. {cadence}.  │
                                                 │   Read {hh:mm} IST ·     │
                                                 │   {age} ago.   ← .src    │
                                                 └──────────────────────────┘
                                                 [ SEE WHAT IS MEASURED → ] .b-1

375 ──────────────────────
  DELHI'S AIR          .d1 43.2px (the phone CEILING — do not go above)
  EVERY READING…       .lbl, wraps to 2 lines
  [ YEAR ROUND ]
  ─────────────────────
             [▨ DEMO DATA]
  412 ▍                     ← rail ROTATES: numeral full width, rule still
  ──────────────────────      vertical at its right kissing the last digit,
  AQI, 24-HOUR ROLLING        account block full-width beneath a hairline
  SEVERE                      that itself carries the breach state (§5.5)
  4.1× the limit
  CPCB SAFE LIMIT 100. LIMIT BROKEN.
  ▭▭▭▭▭▮
  ─────────────────────
  {station}. {cadence}. Read {hh:mm} IST · {age} ago.
  [ SEE WHAT IS MEASURED → ]
```

All **six parts** present (§5.6): numeral · rule in its state · unit · verdict · published
limit + band scale · provenance and hour. `--kiss` is `.06em` of the numeral's own size —
16.32px at 272, 5.95px at the 99.2px floor. The 6px breach rule grows **rightward, away
from the numeral**, so the kiss gap is identical in every state and a breach never shifts
the numeral. Hero is licensed to one viewport.

### Band 3 — `measured` · t2 · `#F3F2F0` paper

The teaching band, and the page's best original device. Long reading, so: paper.

```
1440 ─────────────────────────────────────────────────────────────────────────
  .im-head
  WHAT IS ACTUALLY BEING MEASURED?        │ One number is standing in for six.
  .d1                                     │ The index is not their average. It
                                          │ is the worst of them. .lead 46ch

  PM2.5      PM10      NO₂       SO₂       CO        O₃
  ▮▮▮▮▮▮▮▮   ▮▮▮▮▮     ▮▮        ▮         ▮▮        ▮▮▮        ← hairline columns,
  412        {slot}    {slot}    {slot}    {slot}    {slot}       one lit in --ink,
  GOVERNING  ── ── ── ── ── ── ── ── ── ── ── ── ──               five in --ink-3
  ▲                                                             ← the lit column
  └─ this one, and only this one, is the number in the hero.

  ─────────────────────────────────────────────────────────────
  The index reports the highest of six sub-indices. Five of the six are
  lower than the number at the top of this page, and the index does not
  say which one it came from.  .body 62ch
  [ WHERE IS IT COMING FROM? → ] .act

375 ──────────────────────
  Columns become six hairline-ruled ROWS (the register grammar, §7.5):
  ┌───────────────────────────────────────┐
  │ PM2.5    412        GOVERNING         │ ← --ink, weight carries "lit"
  ├───────────────────────────────────────┤
  │ PM10     {slot}                       │ ← --ink-3
  ├───────────────────────────────────────┤   … four more
```

### Band 6 — `watched`, the coverage map · t2 · `#151512` · `.wide`

> Ground is `#151512` in **both** seasonal states. The seasonal flip belongs to `sources`,
> not to this band — see the correction at §5.1.

```
1440 ─────────────────────────────────────────────────────────────────────────
  .im-head
  WHICH PART OF THE CITY IS WATCHED?      │ The city is not measured evenly.
                                          │ This is where it is measured.

  ┌──────────────────────────────────────────────────────────────────┐
  │  ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ 1px --hair boundaries ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌      │
  │      ▨▨▨▨▨▨          ■ = .state i, filled — a wired monitor      │
  │    ▨▨▨▨▨▨▨▨▨         ▨ = the 45° hatch — nothing measured here   │
  │  ▨▨▨■▨▨▨▨▨▨▨▨          (R-1)                                     │
  │  ▨▨▨▨▨▨▨▨■▨▨▨        No basemap. No tiles. No pins. No colour.   │
  │  ▨▨▨▨▨▨▨▨▨▨▨▨        Hairlines and squares only.                 │
  │    ▨▨■▨▨▨▨▨▨                                                     │
  └──────────────────────────────────────────────────────────────────┘
  {n} continuous monitors. {m} districts with none.   .lbl + .cap
  ─────────────────────────────────────────────────────────────
  A NOTE ON STATION DATA   ← named caveat panel, carried over from
  {what a station reading does and does not describe}   the prototype

≤560 ────────────────────── (per R-2, the recommended form)
  The same information as hairline-ruled rows — no plan geometry:
  ┌───────────────────────────────────────┐
  │ ■  {district}          {n} monitors   │
  ├───────────────────────────────────────┤
  │ ▨  {district}          none           │
  ├───────────────────────────────────────┤   … one row per district
```

### Band 7 — `record` · t2 · `#0D0D0B` · hue red

```
1440 ─────────────────────────────────────────────────────────────────────────
  .im-head
  IS IT GETTING BETTER?                   │ {lead}

  ── THE YEAR, ONE TICK A DAY ──────────────────────────────────────
  ▏▏▎▎▍▍▌▌▋▋▊▊▉▉██▉▉▊▊▋▋▌▌▍▍▎▎▏▏ … 365 ticks × 2.3px, banded
  J   F   M   A   M   J   J   A   S   O   N   D
  {n} days above {threshold}.   ← the hook figure, --red

  ── AND SINCE THE INDEX BEGAN ─────────────────────────────────────
  ▁▂▃▅▆▇█▇▆▅▃   ← 11 bars, one a year, 2015 → current
  2015 ··············· {current, COMPUTED}
  [◀ ▶]  ← scrubber. The current year is NEVER typed. See §8.
  India has only had an air quality index since 2015.  ← the hook (D-13.3)

  NOT SPLICED: pre-2015 NAMP data is SPM / RSPM / PM10 — a different
  quantity by a different method. The short series is the point.

375 ──────────────────────
  ── THE YEAR, ONE TICK A WEEK ──   ← 52 × 4.4px + 2px gap (option 3.1a)
  ▏▎▍▌▋▊▉█▉▊▋▌▍▎▏▎▍▌▋▊▉█▉▊▋▌▍▎ …
  {n} weeks with a day above {threshold}.   ← the LABEL CHANGES with the unit
```

### Bands 2, 4, 5, 8, 9, 10, 11, 12, 13, 14 — described grids

| band | 1440 | 375 |
|---|---|---|
| **2 `people`** | **One lead device, two supporting rows** (D-14.5) — three figures at equal weight measured ~920px, over cap. **LEAD: the dual-limit deaths device** — two `.num` figures in their own `.rl`, `~1.5 million a year` against the **WHO guideline** and `5.0% of all mortality` against **India's own NAAQS**, with `India's limit is 8× the WHO's` stated between them. *Lancet Planetary Health*, Dec 2024. **SUPPORTING, two register rows:** `29.4%` — Delhi adolescents 13–17, spirometry-defined asthma or airflow obstruction, *Lung India* 2021, **with the study's own BMI finding stated in the same breath** (D-14.3); and `8.2 years` Delhi-NCR / `3.5 years` India of life expectancy, **AQLI / EPIC, U Chicago, 2025**. Unifying line goes in the `.im-head` lead, not standing alone: **every one of these is measured against a limit India has not adopted.** Hook: *"A number is not a smell."* | lead device stacks its two numerals, each keeping its rail; the two supporting rows stay rows. **No total, and no row summing the others** |
| **4 `sources`** | `.im-head`, then **one horizontal stacked bar** in `--fg` / `--fg-2` / `--fg-3` / `--hair` — four segments, no hue, because a source split is not a breach. Under it: `[ {STUDY}, {YEAR} ]` as a `.tag`, and one `.cap` line stating in words that this is a published study and not a reading of today | bar stays horizontal, full measure; segment labels move below as a 4-row key |
| **5 `stubble`** ⛔ *seasonal — does not render out of window* | `.im-head`, then **the same fires, counted two ways**: two `.num` figures side by side in their own `.rl`, one labelled **MODIS** and one **VIIRS**, with the ratio stated in words beneath. Then one `.cap` naming NASA FIRMS and CREAMS/IARI, and that NRT counts are indicative and run hot while science-quality data lags months. **No hue** (D-13.7). Hook: *"The same fires. Two satellites. Nine times the count."* | the two figures stack, each keeping its rail; the ratio line carries the argument on its own |
| **8 `india`** | `.im-head` on `.wide`, then a **ranked strip** — one hairline row per city, Delhi's row marked by weight (Archivo 800) not by hue. Hook: *"Delhi is the loudest. It is not always the worst."* | 10 rows, then a `.act` to the full table; the boundary row must reveal itself by its own child position (§5.9) |
| **9 `money`** | `.im-head`, then **the allocated/utilised gap on the rail contract**: per row, the **hairline rule is what was allocated, the solid `--fg` fill is what was spent, and the unfilled remainder is the shortfall.** No hue — the gap does the work. National pair first, then the NCR states named individually (Delhi · Haryana · Uttar Pradesh · Rajasthan · Punjab), on the solved register-row grammar. Each row carries its **source document link** and the answer/notification it came from. One `.act` to the full table | rows stack; the rule stays horizontal because it *is* the comparison. **A row without an attached document does not render** |
| **10 `next`** | `.im-head`, then: **somebody is forecasting this.** A `.lbl` naming **SAFAR (IITM Pune, operationalised by IMD)**, a `.lk` to the official portal, and a `.body` stating Swechha's position — that it will not republish a forecast it cannot attach a source document to. Then the prototype's surviving clause **verbatim** where it is still true: *"None of them forecasts."* referring to **this page's own feeds**, not to the world | identical; type only, still the cheapest band on the page |
| **11 `doing`** | `.im-head` on paper, hue **green**. Three items, each a `.num` flat-rail figure (§7.7) + a fact line: **Airshed Park, Vasant Kunj — 5% → 90% green cover, one park, over a decade** · **Monsoon Wooding — planted and survived** · **Bridge the Gap — Delhi schools each year**. Every figure sourced in `SOURCE-FACTS.md`; scope named **on the tile**, not only in a note | figures stack; each keeps its flat rail. **Check the flat rail's lower bound before shipping a short value (§7.7)** |
| **12 `method`** | `.im-head`, then the **method table** — one row per derived figure: figure → source → *derivation*, not just source. Then the **feed inventory sentence**, rewritten to what is true on the day. Then the named caveat panel | table becomes stacked definition rows; each figure keeps its derivation |
| **13 `situations`** | t4 strip. Head `.lbl` *"FIVE MORE SITUATIONS"*. Then the five — Yamuna · Heatwave · Forest Fires · Forest Loss · Climate Event — as **plain names in `--fg-2`, unlinked** (D-12.4). One `.act` to `/now`. **No count is stated**, because the set that renders varies with the season (§5.8) | names wrap to two lines; the `.act` keeps its 44px expander |
| **14 `ward`** | t3 on `paper-2`. `.im-head`, then the location control: one labelled field, one `.b-1` in mustard. **The empty state is built first** — a location with no data **shows the hole and never falls back to Delhi's number.** `--mustard-ink` here is a **2px focus outline only**; it is 4.50:1 on `paper-2`, exactly on the AA line, and must not be body colour | field full width, 44px minimum, label above |

---

## 7. Copy slots

Structural strings only. Editorial prose is Stage 2, and per the honesty rules **no slot
below may be filled with an invented figure, station, limit, cadence, date or docket.**

| slot | value | note |
|---|---|---|
| `<h1>` | **DELHI'S AIR** | constant, D-10.2. Never a reading |
| method line | **Every reading against its published limit. Every gap named.** | `.lbl`, mirrors the homepage's masthead line |
| hero state chip | **DEMO DATA** | `.state.demo`, hatched, on the reading's frame |
| hero season tag | **YEAR ROUND** | `.tag-season`, **solid** border |
| hero verdict | `{verdict}` | from the band the reading falls in |
| hero limit line | **CPCB SAFE LIMIT {n}. LIMIT BROKEN.** | breach words in `--red`; if no limit exists, the words **"No legal threshold."** and never a blank or a dash |
| band 2 hook | **A number is not a smell.** | existing project canon |
| band 3 head | **WHAT IS ACTUALLY BEING MEASURED?** | |
| band 3 lead | **One number is standing in for six. The index is not their average. It is the worst of them.** | |
| band 4 hook | **Somebody measured this once. It was not today.** | |
| band 4 stamp | `[ {STUDY}, {YEAR} ]` | a `.tag`; the study must be real and named |
| band 5 head | **THE FIRES, COUNTED TWICE** | seasonal band |
| band 5 hook | **The same fires. Two satellites. Nine times the count.** | the ratio is the finding; state the sensor on each figure |
| band 6 head | **WHICH PART OF THE CITY IS WATCHED?** | |
| band 6 lead | **The city is not measured evenly. This is where it is measured.** | |
| band 7 hook | **{n} days above {threshold}.** | at 375 the unit changes to weeks and **the label must change with it** (D-13.3) |
| band 7 hook 2 | **India has only had an air quality index since 2015.** | the series' shortness *is* the hook |
| band 8 hook | **Delhi is the loudest. It is not always the worst.** | needs the India table to actually support it before it ships |
| band 9 head | **WHAT HAS BEEN SPENT ON IT?** | |
| band 9 hook | **{allocated} was allocated. {utilised} was spent.** | both figures quoted, document attached, **no third sentence** — the gap speaks (D-13.6) |
| band 10 head | **WHAT HAPPENS NEXT?** | |
| band 10 lead | **Somebody is forecasting this. It is not us.** | ~~*"Nobody is forecasting this for you."*~~ — **withdrawn as false**, D-13.2 |
| band 10 body | names **SAFAR (IITM Pune, operationalised by IMD)**, links the portal, and states why this page does not restate it | the position, not an apology |
| band 10 clause | **None of them forecasts.** | still true, and now scoped to **this page's own feeds** rather than to the world |
| band 13 head | **FIVE MORE SITUATIONS** | no count of what renders |
| band 14 head | **WATCH YOUR WARD** | |
| band 14 empty | **{no data for this location}** | must show the hole; **never Delhi's number** |

---

## 8. The value slots — what has to fill them

Per the ledger, *no figure on this page may need to be true*, so each is written as a slot
here rather than guessed. Nothing in this table is invented.

| # | slot | needed by | what must fill it |
|---|---|---|---|
| 1 | the hero reading + its published limit | band 1 | a stored `limit` field (value + publishing authority) — schema gap #1. Until it exists, breach and multiplier are hand-typed and the page can claim a limit is broken when it is not |
| 2 | six sub-index values | band 3 | the same reading source, per pollutant |
| 3 | the apportionment split + its study and year | band 4 | one real published study, named |
| 4 | monitor locations, count, districts with none | band 5 | a station list with coordinates |
| 5 | the day/week series + the 26-year series | band 6 | historical bulletin data. **The current year must compute, never be typed** — the prototype types 2026 as "now" in four separate places |
| 6 | the city ranking | band 7 | a bulletin snapshot, labelled `PERIODIC` |
| 7 | last-forecast-check date | band 8 | **computed from local `Date` getters only.** Never `toISOString()` / `toLocaleDateString()` |
| 8 | the three `doing` figures | band 9 | **already sourced** in `SOURCE-FACTS.md`. The only band on the page that is |
| 9 | source URL per figure | band 10 | schema gap #5 — `liveDataSchema` has `sourceLabel` and no URL, `evidenceSchema` has `source` and no URL. **On a page whose claim is "with the source document attached", nothing can currently attach a document** |
| 10 | a freshness enum | every reading | schema gap #7 — the only freshness signal is the boolean `mock`, so the four-word vocabulary cannot be expressed |

---

## 9. What comes off the page

| item | why |
|---|---|
| **The court-orders band** — six NGT / Supreme Court / MoEFCC / Delhi HC filings with docket numbers | **D-11.1.** None is checkable; `OA 412/2026` reuses the AQI figure as a case number, which is how it can be identified as invented rather than mis-transcribed. Fabricated citations of named Indian courts attributed to a real NGO is a different class of risk from a wrong number. **Kept in this spec as a named future section so the composition reserves its place** — it returns when real filings exist with attached documents, which needs an order content type and the source-URL field |
| **The `<h1>` "Four times the limit"** | D-10.2. A reading in the largest type on the page, false on the first clean-air day |
| **All five per-reading `LIVE` badges** | D-10.1. Nothing is wired. `DEMO DATA` until a feed exists |
| **The second mustard field** (`.sub`) | §2.1 above |
| **The five `sig-*` selective-colour filters** | Retired, and referenced zero times here anyway. Copy the swept defs block from `home.html` — **`duo` and `duo-dim` only.** Never from a `journeys-*` or `project-*` page, where selective colour is genuinely live and contradicts the freeze |
| **`--pad`, `.det-head` (×11), `.btn`, `--rail-kiss`, `--rail-clear`** | Superseded by the tier system, `.im-head` and the `.rl` contract |
| **The static `aria-current="page"` on the Now link** | Wrong on this page, and it will fight the observer once the underline is wired |

---

## 10. Rulings — all four settled, 21 August

**Stage 1 is closed.** Recorded in the ledger as D-12.1 → D-12.10.

| # | ruling | settled |
|---|---|---|
| **R-1** | The 45° hatch may mean *"nothing is measured here"* as an area fill | **Approved** (D-12.7). Both cases say *there is no real measurement behind this*, so it is arguably not a widening at all |
| **R-2** | `watched` past the 900px cap, or a ward list at ≤560? | **The ward list** (D-12.8). Exception count stays at two; this page needs no licence |
| **R-3** | Year strip resolution | **52 weeks phone / 365 days desktop** (D-12.9). **Binding: the label changes with the unit** — a label that survives the breakpoint unchanged is false at one of the two widths |
| **R-4** | Green in band 9 against red in band 6, three bands apart | **Approved** (D-12.10). Bands 7 and 8 carry no hue, so the separation is real rather than nominal |

---

## 11. Build order and the gate

Phases follow §6 of the situation brief unchanged: **shell measured empty → hero → the
argument on the real ground rhythm → the honest data layer → location → the heavy data
objects → floors, then the ledger.** No phase starts before the one above it is measured.

Two additions specific to this page:

- **`watched` and `record` are the two expensive bands and they are the two most likely to
  be cut for budget.** They are therefore built last within their phase, and the page must
  read without them.
- **Band 8 (`next`) is built early, not late.** It is type only, it is the cheapest band on
  the page, and it is the one that proves the thesis. If it does not read, the thesis is
  wrong and that is worth knowing before six data objects are built.

The gate is the fifteen-line gate at §7 of the situation brief, unmodified: `scrollWidth
=== innerWidth` at eleven widths in every panel state · zero contrast failures measured
from pixels · zero controls under 24px measured on **the pseudo box, not the element rect**
· focus ring overhang 0.00 at rest **and after scrolling every scroll container** · skip
link is stop 1 · anchors landing within ±0.5px of `--nav-h` on both the cold-hash and
same-page-click paths · zero ground clashes checked on **rendered** colour · every band
inside 900px at 375 or named and licensed · console silent · band ledger published at
375×812, 375×635 and 1440×900 with document height quoted **with its viewport height** ·
every figure traced · every reading carrying all six parts · **zero tensed or dated claims
in static markup, grep shown** · zero drift itemised against §1–§7 of the branding
document · **and the PNGs read, not only measured.**

Measurement method is part of the gate: `Emulation.setDeviceMetricsOverride` only, never a
bare `--window-size`.

---

## 12. PHASE 1 — the shell, measured empty. BUILT AND PASSING.

`public/design/v3/situation-air-v2.html` — **77,625 bytes, 1,300 lines**, against the frozen
`home.html`'s 291,613. It replaces `situation-air.html` when the build closes (D-12.11), so
no `-v2` filename ever reaches a link.

### 12.1 How it was built, and why that closes the drift set

The token and chrome layer is **extracted from the frozen file by script, never retyped**, so
anything not copied does not exist here (D-10.3). **Six exclusions, every one named:** the
slider (no deck), the deck tabs' ≤940 hit-box growth, the motion block (`.js .rise` — inert
on the homepage, doubly inert here since the observer is not copied), the campaigns `:has()`
exception, the deck tab-row ring fix, and the date IIFE (held to Phase 4).

**Three things the build script now does that it did not at first, each after a real
failure:**

1. **Every numeric range asserts its own first and last line.** A concurrent session added
   ten lines at ~4068 mid-build (D-11.6), which silently shifted the footer and both script
   IIFEs. The first shell's `<script>` therefore began mid-function — **a parse error that
   killed the SECTIONS panel while the console still read clean.**
2. **Everything in the body is located by marker, not line number** — the footer by its own
   tag, each IIFE from its comment through the `})();` at column 0.
3. **The extracted script is `node --check`ed before the file is written.** This is the gate
   that was missing; a truncated IIFE renders a page that looks entirely fine.

### 12.2 Measured — the Phase 1 gate

| gate | result |
|---|---|
| `document.scrollWidth === innerWidth` | **0 overflow** at 320, 375, 1440 — and **0 with the SECTIONS panel open**. `body.scrollWidth` matches |
| Ground adjacency, **composited colour** not class names | **0 clashes, in season (16 sections) and out of season (15)** |
| Grounds render as declared | `#0D0D0B` · `#151512` · `#F3F2F0` · `#ECEBE8` — all four exact |
| Tier padding | 375: t1 `0` · t2 `56` · t3 `44` · t4 `22`. 1440: t2 `129.6` · t3 `93.6` · t4 `43.2` |
| Header tokens | 375: `--nav-h` **56**, `--bar-h` **56**. 1440: **63 / 62**. `scroll-padding-top` tracks `--nav-h` |
| **Anchors, all 14 bands** | same-page-click path, **worst delta 0.24px** against `--nav-h` — inside the ±0.5px gate |
| Skip link is tab stop 1 | **yes** — first focusable is `.skip` |
| SECTIONS panel | opens, closes, **Escape closes**; **7 rows at exactly 44.0px**; button **70.0 × 44.0px** |
| Panel costs zero pixels | document height **4417 → 4417**, overflow **0 → 0** |
| Chip row withdrawn from tab order while panel open | **true**, and restored on close |
| Controls under 24px, **measuring the pseudo box** | **zero**, at 320 |
| `@keyframes` on the page | **zero** — see 12.3 |
| Console | **silent**, at every width tested, before and after every change |
| Containers | `.wrap` caps at **1240.0px**; `--gut` floors at **20px** |
| Above 940 the bar inverts correctly | `.navlinks` visible, SECTIONS button `display:none` |

Document height, quoted with its viewport: **4,417px at 375×812** · **4,696px at 320×635** ·
**7,490px at 1440×900**. Shell only — bands carry an opener and nothing else.

### 12.3 The page has no motion at all, and that is a consequence not a choice

Zero `@keyframes`. The site's only animation is the 0.42 Hz blink, which belongs to
`.state.live` — and **D-10.1 means no reading on this page is ever LIVE**, so the blink can
never fire here. It follows that this page needs no `prefers-reduced-motion` rule either.
**Do not "restore" one.**

### 12.4 One defect, found by reading the PNG

`.p1-hero` used the `padding` **shorthand** on the same element as `.wrap`, and being
declared later it **reset `.wrap`'s horizontal gutter to zero** — the `<h1>`, the method line
and the lead all ran to the screen edge at every width. Fixed with `padding-block`.

**A box check saw a full-width `.wrap` and reported nothing wrong.** This is gate #15
earning its place on the first band of the first page: hero `<h1>`, method line and the next
band's `<h2>` now all land at **x = 20.00**, the gutter floor, verified numerically as well
as visually.

### 12.5 What Phase 2 inherits

- The hero's inner padding replaces `.p1-hero`.
- The strip measures **76px at 375** empty; it wants ~116px with cells, and its cells must
  link down to their own band (D-14.6).
- The date IIFE arrives with the honest data layer, **with its `console.warn` guards kept**.
- `body.oos` toggles the closed-season state. **Both states are adjacency-clean and both must
  be measured every pass** — the out-of-season chain is the one nobody will remember to check.
