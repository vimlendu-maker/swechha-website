# SITUATION SPEC — the formula for situation seven

**Read this before building a new situation page.** `SITUATION-PAGE-TEMPLATE.md` tells you how
the machinery works. This tells you **what a situation page is made of, and what evidence each
part requires** — so the question "can I build this band?" has an answer before you start
writing it.

Everything below is **derived from the six that exist**, not proposed. The matrix in §3 was
computed from the six generators, not written by hand.

---

## 1. The answer to "should this be a template?"

**Yes — but the layout was never the hard part, and a page template would solve the wrong
problem.**

The layout is already generalised. `scripts/lib/situation-shell.mjs` gives every page the token
and chrome layer, the tab component, the disclosure, the measure row, the opener, the state chip,
the named-hole marker, the family crumb and rail, the ground-adjacency check and five write
gates. A new situation inherits all of that by importing one module.

**What varies between situations is not how a band looks. It is whether a band has anything to
put in it.** That is D-27's rule — *a band exists because it has something to carry, not because
the template has a slot for it* — and it is the whole reason Air has nine bands and Climate event
has eight, with only four in common.

So the useful artefact is not a page skeleton. It is **an evidence test per component**: a
question you can answer yes or no *before* writing any markup, from the sources alone. That is
§2. Answer the fifteen questions and the page's band sequence falls out of the answers.

---

## 2. The formula

### 2.1 The spine — four bands, every situation, no exceptions

These are the only bands all six share. If a subject cannot fill all four, **it is not a
situation and should not get a page.**

| band | what it must contain | the evidence test |
|---|---|---|
| `top` | a hero photograph, one reading, its unit, its **published limit**, a verdict, a state word | **Is there a number, and did somebody publish a threshold for it?** If no threshold exists, the page must say `No legal threshold.` in words — that is a valid answer, and forest fire is built on it. What is *not* valid is inventing a benchmark. |
| `strip` | four caged summary cells, each pointing at the band that owns it | Derived. Originates nothing. |
| `measured` | how the number is made: the method, the instrument, what it is **not** | **Can you explain the derivation without hand-waving?** Air computes an AQI from concentrations and says so. Heat computes a departure from a normal it builds itself. If you cannot say how the number was made, do not publish the number. |
| `act` | three things a reader can do, each made of what the page already proved | **Does every card rest on something on this page?** The forest-fire card "Ask which number you are being given" passes. Its predecessor, "Ask what the state spent", did not — the page had no spending figure. |

### 2.2 The optional bands, with their evidence tests

Build a band **only if its test passes**. If it fails, the band does not exist — and in most
cases you should not mention that it does not exist. See §4.

| component | band | the evidence test | how many of six pass |
|---|---|---|---|
| **pan-India view** | `cities` `states` `india` | Is there a national dataset at the same cadence, or a station set you can compute one from? | 6/6 |
| **hotspot view** | `geography` `stretch` `seasons` | Do you have coordinates or a named sequence? Air has 45 stations, Yamuna 7 in order, fire has FRP points. **Forest loss has no geometry and gets no map.** | 6/6, but different geometry each time |
| **media register** | `said` or folded in | Always available — Google News RSS, keyless. `scripts/refresh-coverage.mjs` needs one config row. **It is reporting, never a source of fact.** | 6/6 |
| **attention series** | inside `trend` | Is there an India-specific Wikipedia article with real traffic? **Forest fire has none** — the nearest is the global *Wildfire* article, whose peaks are Californian. A proxy about another continent is worse than no band. | 5/6 |
| **health impact / deaths** | `people` | Does a national table name your cause? NCRB's Table 1.0 covers heat, flood, landslide, lightning, cyclone, forest fire. **Nothing covers the Yamuna or forest loss** — both name the hole instead. | 3/6 |
| **money / budget** | `money` | **D-27: is there a primary document with a figure you can attach?** Not journalism reporting a panel — the panel's own report. Air has NCAP tables; Yamuna has two parliamentary documents. | **2/6** |
| **localised impact, pincode / ward search** | `ward` | Is there a per-location feed *and* a server route to front it? **Only Air.** It needs a station network with an API; a river sampled monthly by hand cannot answer "what about my ward". | **1/6** |
| **court records / orders** | — | **0/6 shipped.** Cut twice: D-11.1 removed it because six dockets were uncheckable and one reused an AQI figure as a case number; D-19.1 withdrew D-18.4's attempt to reinstate it. **Do not build this band without a court's own document.** | **0/6** |
| **related campaigns** | index only | Is the campaign in `SOURCE-FACTS.md`? The index carries three; a situation page links to one only where the connection is in the campaign's own name. | index |
| **warnings / how to read this** | `.p-hole` + `measured` | Always. Every page has both. | 6/6 |
| **two disagreeing sources** | `split` `sources` | Do two credible sources disagree? **Publish both, never averaged.** Forest loss is built entirely on this. | 5/6 |

### 2.3 Components that are always available, so never a reason to delay

The media register, the named-hole marker, the measured-versus-modelled rule, the state chip, the
family crumb and rail, and the four spine bands. **A situation with only these is publishable.**

---

## 2A. AIR AS THE REFERENCE SPECIMEN — chapters, content, ingredients

**Air is the fullest situation and the one to read before building another.** Nine bands, seven
datasets, and the only page carrying a live route and a ward search. Everything below was
extracted from the built page and its generator, not described from memory.

### 2A.1 Its nine chapters

| # | band | ground | the question it answers | size |
|---|---|---|---|---|
| 1 | `top` | `#0D0D0B` | **What is the reading, and what is the limit?** | 1,308 ch |
| 2 | `strip` | `#151512` | Four cells, the shape of the page before you scroll it | 168 ch |
| 3 | `people` | `#0D0D0B` | *Who is in it?* — the human cost, and which figures are models | 1,619 ch |
| 4 | `measured` | `#F3F2F0` | *How the number is made* — the derivation, on paper | 2,482 ch |
| 5 | `sources` | `#151512` | *Where does it come from?* — apportionment, two studies, never averaged | **5,845 ch** |
| 6 | `trend` | `#0D0D0B` | *Where it has been, and where it is going* | 1,251 ch |
| 7 | `geography` | `#151512` | *Which part of the city, and where the city sits* | 3,026 ch |
| 8 | `money` | `#F3F2F0` | *The cost of inaction is more than the action* | 1,459 ch |
| 9 | `act` | `#0D0D0B` | *What you can do* — including the ward subscription | **4,924 ch** |

**The two biggest bands are `sources` and `act`, not the hero.** That is worth noticing: the
page spends most of its length on *where the number came from* and *what to do about it*, and
comparatively little on the number itself. A situation page is not a readout.

### 2A.2 Its ingredients, band by band

Every component below is a frozen one. Nothing on Air is bespoke.

```
  ingredient         top  stri  peop  meas  sour  tren  geog  mone   act
  photo hero         yes    ·     ·     ·     ·     ·     ·     ·     ·
  reading + limit    yes    ·     ·     ·     ·     ·     ·     ·     ·
  band scale         yes    ·     ·     ·     ·     ·     ·     ·     ·
  tabs                ·     ·     ·   yes   yes   yes   yes    ·    yes
  measure/bar rows    ·     ·     ·   yes   yes   yes   yes    ·     ·
  map                 ·     ·     ·     ·     ·     ·   yes    ·     ·
  year series         ·     ·     ·     ·   yes    ·     ·     ·     ·
  attention chart     ·     ·     ·     ·     ·   yes    ·     ·     ·
  news register       ·     ·     ·     ·     ·     ·     ·     ·   yes
  money rows          ·     ·     ·     ·     ·     ·     ·   yes    ·
  ward form           ·     ·     ·     ·     ·     ·     ·     ·   yes
  named hole         yes    ·   yes    ·   yes    ·   yes   yes   yes
  kind rule           ·     ·   yes    ·     ·     ·     ·     ·     ·
  state chip         yes    ·     ·     ·     ·     ·     ·     ·     ·
  caged cells         ·   yes    ·     ·     ·     ·     ·     ·     ·
  quote / citation    ·     ·   yes   yes   yes    ·     ·   yes    ·
  family crumb       yes    ·     ·     ·     ·     ·     ·     ·     ·
  sibling rail        ·     ·     ·     ·     ·     ·     ·     ·   yes
```

**Read the `named hole` row.** It appears in **six of nine bands** — more than any other
ingredient except tabs. On the best page on this site, naming what is missing is the most
frequently used device there is. That is the single most transferable thing about Air.

### 2A.3 Its seven datasets, and what each buys

| dataset | what it buys | without it |
|---|---|---|
| `air-delhi.json` | the reading, 45 stations, the computed AQI | no page |
| `air-india.json` | the national panel and the rank | `geography` loses half its content |
| `air-crosscheck.json` | WAQI on a different scale, and the forecast | the two-scale device goes |
| `apportionment-delhi.json` | TERI-ARAI beside IIT Kanpur — two studies, never averaged | `sources` collapses to a paragraph |
| `fires-nw-india.json` | the stubble season, per sensor, never summed | the seasonal argument goes |
| `attention-delhi-air.json` | attention against reading on one axis | `trend` loses its finding |
| `coverage-delhi-air.json` | the register — reporting tagged as reporting | `act` loses its close |

**Five of the seven are not the reading.** The reading is one file; the other six exist to say
where it came from, what it is not, and what it costs.

### 2A.4 The five devices worth stealing wholesale

1. **The reading against its limit, with the multiplier derived.** `387` against `AQI 100`, and
   `3.9×` computed rather than typed. Every situation needs this shape, whatever its unit.
2. **Two disagreeing sources, published as two.** Air shows TERI-ARAI beside IIT Kanpur, and
   *IIT Kanpur's refusal to give a single number is the strongest graphic on the page*. Forest
   loss is built entirely on the same device.
3. **Per-sensor counts, never summed.** MODIS, VIIRS S-NPP and VIIRS NOAA-20 return different
   numbers for the same five days. Publishing all three is more honest than any one of them, and
   it is the reason the fire page leads on burnt area instead.
4. **The kind rule under the numeral** — solid for counted, dotted for modelled. Costs no
   vertical space, and applying it to Air's four health figures produced the finding that three
   of them are models.
5. **The named hole as content.** Six of nine bands. Not an apology — see §4 for the distinction
   that took two attempts to get right.

### 2A.5 What Air has that nothing else can copy yet

- **`LIVE`**, earned by `/api/air` — a server route in front of an hourly feed, so the value can
  change between two page views (D-21.5). Five of six situations cannot earn this; a river
  sampled monthly by hand never will.
- **The ward search**, at `/api/ward`. It needs a station network with an API. There is no
  ward-level Yamuna, forest or rainfall equivalent, which is why `localised impact` is 1/6.
- **A money band with fund tables** — NCAP, the 15th Finance Commission, PRANA, CAG audits.
  Only Yamuna matched it, and only because two parliamentary documents exist (D-27).

---

## 3. The matrix, computed from the six generators

Bands, by how many situations use them:

```
  top        6/6  UNIVERSAL        geography  1/6
  strip      6/6  UNIVERSAL        india      1/6
  measured   6/6  UNIVERSAL        stretch    1/6
  act        6/6  UNIVERSAL        official   1/6
  people     5/6                   seasons    1/6
  trend      4/6                   cover      1/6
  sources    2/6                   split      1/6
  money      2/6                   years      1/6
  cities     2/6                   states     1/6
  said       2/6                   law        1/6
```

**Four universal, two common, fourteen used once or twice.** That distribution is the argument
against a fixed page template: 70% of the band vocabulary is subject-specific, and a template
that offered all twenty slots would invite exactly the empty-band filling D-27 forbids.

---

## 4. The rule that is easy to get wrong

**Naming a hole is content when the hole is IN THE MEASUREMENT. It is an apology when it is about
a band the page never promised.**

- **Do** say: *there is no forest mask, so a detection is not a fire.* That is a limit of the
  instrument, and it is the most valuable sentence on the fire page.
- **Do** say: *no national register counts cloudbursts, and a 9 km reanalysis cannot resolve one.*
- **Do not** say: *there is no money band on this page.* The heatwave page said that, and it was
  removed at D-27.2. It raises a question the page then declines to answer.

The test: **would a reader have expected this number?** If the page's own subject implies it,
name the hole. If only the template implies it, say nothing.

---

## 5. Adding situation seven, in order

The order matters — steps 1–3 are a day's work and they decide everything after.

0. **Read Air first, band by band — §2A.** It is the fullest situation, its nine chapters are
   the full vocabulary, and its ingredient table shows which frozen component does which job.
   Steal the five devices in §2A.4; do not expect to match §2A.5.
1. **Find the limit first.** Not the data — the *limit*. Who published a threshold for this
   subject, and in what document? If the answer is "nobody", the page can still be built (fire
   proves it) but you must know that before designing the hero.
2. **Verify every source over the network, and record the failures.** AD-16 is the model. A
   source is not available because it is public — CPCB has no API, FSI's fire portal has no API,
   GFW needs a key, data.gov.in's search does not search.
3. **Answer the fifteen tests in §2.** The band sequence is now decided. Write it down before
   writing markup.
4. **Add the situation to `FAMILY`** in `situation-shell.mjs`. That one edit gives it a card on
   the index, a crumb, and a place in five sibling rails.
5. **Write the fetcher** with the guards: validate the *shape* not the status, record a failure
   as `null` never `0`, and leave the previous file alone if everything fails.
6. **Write the generator.** Import the shell. Declare the band sequence with its ground hexes and
   let `groundChain` check adjacency. Nothing in `PAGE_CSS` may contain `${...}`.
7. **Add it to the register** in `scripts/verify-final.mjs` — file, route, h1, band count, money
   flag, expected states, and a `reading()` that reads from its committed dataset.
8. **Run `npm run verify:final`.** Twelve checks. It will catch the placeholder, the orphaned
   link, the missing gutter and the page that disagrees with its own data.
9. **Measure in a browser**: contrast against the composited ground, horizontal overflow at 375,
   document height. Zero failures, or it does not ship.
10. **Record the rulings.** What you cut, what you could not source, and what you got wrong.

---

## 6. What a scaffold can and cannot do for you

`npm run new:situation -- <id>` writes a working skeleton generator with the four spine bands and
prints the §2 evidence checklist with every optional band marked unanswered. It saves perhaps two
hours of boilerplate.

**It cannot answer the tests.** The two days that went into Air and Yamuna were source
verification, and no scaffold shortens that. The scaffold's real value is that it makes the
spine correct by default and forces the evidence questions to be answered explicitly rather than
by whatever the previous page happened to have.
