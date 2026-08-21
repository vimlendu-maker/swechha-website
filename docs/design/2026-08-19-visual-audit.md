# External visual audit — 19 August 2026

Commissioned brief: a contemporary art director whose portfolio is entirely
black-and-white / near-monochrome editorial work, asked to audit everything
built so far and answer four questions — why does this read as AI-made, is
Universal Sans a better face, should all titles be uppercase, and what motion
belongs here.

**Claims spot-checked against the files before recording them** (all confirmed):
6 uses of `.rule-m`, 10 equal-width `repeat(N,minmax(0,1fr))` grids and 11
`text-transform:uppercase` rules in `journeys-landing.html`; hero
`clamp(2.1rem,5.4vw,4.2rem)` vs section heading `clamp(1.4rem,2.7vw,2.15rem)`
vs 17px body; exactly one `box-shadow` in the whole corpus (a slider thumb at
`internal.html:781`).

**One correction to the brief the auditor was given:** the app is *not* still on
the teal/indigo palette. `app/globals.css:38–74` already carries the mono/mustard
tokens lifted from the locked board; the old brand hues survive only as brand
definitions. Anything downstream that assumed a pending palette swap should be
re-read with that in mind.

---

## 1. Verdict

Yes, it reads as AI-made — but not for the usual reasons, which makes it more
fixable than most. The palette, the contrast discipline, the selective-colour
SVG system and the hairline-instead-of-shadow decision are genuinely good and
genuinely unusual. The problem is **compositional monotony**, and the single
biggest tell is that **there is no display scale**: the largest type on the
locked reference is 67.2px against 34.4px headings and 17px body, so the whole
page lives inside two octaves and nothing on it is ever *big*. Everything else
follows: because no element dominates, every section has to be an equal-width
row of four or five identical things, each introduced by the same mustard dash,
each populated by one line icon per idea.

The cruel detail: `homepage-final.html` — the *older* board — obeys the rhythm
rules properly. The 19-Aug journey/project/event/about boards regressed away
from it as the kit got templated.

## 2. The tells, ranked

| # | Tell | Evidence | Fix |
|---|---|---|---|
| 1 | **No display scale.** Display:body = 3.95:1 | `journeys-landing.html:364, 340, 63` — repeated verbatim in six sibling boards | D1 to `clamp(4rem,13vw,11rem)`, set once per page, clipping the frame. Card titles and section headings *shrink*. Target ≥ 8:1 |
| 2 | **Equal-width N-across rows as the dominant pattern** — 10 per board; the ledger's cap is 2, both unequal | `journeys-landing.html:383, 399, 426, 453`; `about.html:462, 463, 478` | Keep two, both unequal. `homepage-final.html:152, 433, 664` already shows how |
| 3 | **The same 3px mustard dash under six headings** | `.rule-m` at `journeys-landing.html:342`, used 6× | One per page, under the display line only. Nothing replaces the others |
| 4 | **Four icon rows, 18 generic 24px line icons** | `:386, :407, :430, :456` — and the file's own header comment at `:26` says to drop one of them | One icon row per page maximum. Numerals in Archivo at 48px, or nothing |
| 5 | **Photographs never escape their box** — zero bleeds, overlaps or negative margins anywhere | `:402, :441`; no `margin-top:-` hits in any board | One photograph per page out of its box: full-bleed, taller than the viewport, display type sitting on it |
| 6 | **The one "hand-made" element is symmetric vector geometry**, and there is no texture anywhere | `.leafmark` at `:349–352`; zero `feTurbulence` in the corpus | Draw 4 real marks, scan them, ship asymmetric at 6–10% opacity. Add one baked grain PNG (≤8KB, `overlay`) over the dark grounds. Cheapest decisive anti-AI move on the list |
| 7 | **Card titles are 13–15px uppercase — smaller than body copy** | `:413–415`; the four journeys are the quietest type on their own page | Serif, sentence case, `clamp(1.5rem,2.4vw,2rem)` |
| 8 | **Uniform vertical rhythm** — byte-identical `.sec` padding across six boards | `:374` and its twins | Three tiers (`--air-s/m/l`), assigned per section, plus one near-empty full-viewport pause per long page |
| 9 | **Copy is verb-led triads of matched length**; em-dash density 22–53 per board | `naturescapes:702, 709, 780, 804, 810, 819, 863`; `about.html`'s four consecutive "Our ___" headings | No two adjacent items sharing a grammatical shape. Replace two in five with a concrete fact, date or place |
| 10 | **Nine detail pages are one template with swapped strings** — the five `project-*.html` files are within 300 bytes of each other | `ls -la public/design/project-*.html` | Four journeys, four structures. Same tokens, different architectures |
| 11 | **`.dual` is exactly 50/50 — a recorded ruling shipped in its forbidden form** | `homepage-final.html:598` vs `DECISIONS-2026-08-18.md:117–119` | Split it: Farm full-bleed full-viewport, Green the Map contained |
| 12 | **One shape for every meaning** — `border-radius:50%` doing three unrelated jobs 45× | `:386, :408, :160` | Keep 2px everywhere; circles survive only on social links |

Two things the auditor pushed back on in the brief: "everything centred" is
*not* a defect here (only two `text-align:center` rules per board), and the app
palette is already swapped (above).

## 3. Typography

### Universal Sans — verdict: no

1. **It cannot do the job.** The ledger's most important type decision is that
   the data voice needs a **live width axis** — Big Shoulders was rejected for
   lacking one (`DECISIONS:190–191`) and Archivo chosen because one variable
   file serves `wdth 104/800` display numerals and `wdth 82/700` micro-labels
   (`:193–197`). NewGlyph ships **static cuts** from a configurator: three or
   four files where there is now one, against a `LCP < 2.5s on 4G` budget.
2. **Its character is the register you are trying to escape.** A clean geometric
   grotesque is the house face of the 2021–24 studio/seed-stage internet. It
   makes a 26-year-old Delhi organisation read younger and *more* generic.
3. **It solves nothing and costs money.** No Devanagari — a gap the ledger
   already flags (`:201–202`). Rough figures to verify at purchase: ~€30–60 per
   style desktop, €200–450 family, web licences pageview-tiered — call it
   €400–900 to do it properly.

### Pairings worth specifying instead

| | Pairing | Cost | Why |
|---|---|---|---|
| **1 (recommended)** | Fraunces + Archivo, **drop Instrument Sans** — body in Archivo `wdth 100/400` | ₹0, OFL | Two families instead of three. Fraunces' `WONK`/`SOFT` axes are the most human thing in the system and are currently used on one heading. Spend the type budget on photography |
| **2 (closes the Devanagari gap)** | Fraunces + **Anek Latin / Anek Devanagari** (Ek Type, Mumbai) replacing Archivo | ₹0, OFL | Variable `wdth 75–125` — the axis the ledger calls structural — plus nine Indian scripts from one system, drawn in India. **The change to make if you change anything** |
| **3** | **Instrument Serif** ≥64px display + Fraunces headings + Archivo data | ₹0, OFL | A display cut that only works when enormous, which forces the scale fix |
| **4 (paid, Indian)** | **Universal Thirst** — Anagram + Devanagari companion | ~€250–500 total | Latin and Devanagari drawn together. Drawn by someone with a position — the quality the site lacks |
| **5 (paid, premium)** | **Klim** — Signifier + Söhne Schmal | ~$600–1,200 | The reference standard for this register. No Devanagari; English-only sites with a real budget |

Not recommended: Pangram Pangram (PP Neue Montreal, Editorial New) — free-tier
ubiquity now reads as a template signature.

### The scale to specify

D1 `clamp(4rem,13vw,11rem)` Archivo `wdth 104`/800, caps, `-0.035em`, once per
page · D2 statement Fraunces `opsz 144` **400** at `clamp(2.25rem,5.5vw,4.25rem)`
sentence case · H2 Fraunces `opsz 48`/600 at `clamp(1.625rem,3.2vw,2.5rem)`, no
rule beneath · H3 Fraunces `opsz 28` at `clamp(1.375rem,2.2vw,1.875rem)`
sentence case (replaces the 13px caps) · numerals Archivo `wdth 104` at
`clamp(3.25rem,9vw,8rem)`, tabular · body 17px/1.55/62ch · lead 20px/48ch ·
caption 13px in `--ink-2`/`--fg-3` only · micro-label Archivo `wdth 82` 11px
caps `0.13em` · nav 10px caps (unchanged — correct as built).

**The gap between H3 (30px) and micro-label (11px) is deliberate. Nothing lives
there.** That vacuum is what makes a page look designed rather than interpolated.

## 4. Case rule

> **Uppercase is a voice, not a level. It marks text that is not read as
> language — the machine's labels, not the author's words.**

Takes caps: (a) chrome and micro-labels at ≤12px with ≥0.12em tracking — nav,
eyebrows, badges, provenance lines, buttons, footer column heads; (b) the single
page wordmark at ≥64px, maximum two words. **Nothing else.**

Never: section headings (already settled — the all-caps mockup was rejected
because it read as a different product), card and item titles, statements,
pull-quotes, body, captions.

Hard limits: no uppercase run longer than 3 words outside D1; caps above 13px
need ≥0.06em tracking and caps above 48px need ≤0.01em — uniform tracking across
sizes is itself a giveaway.

Test: *would you read it aloud as a sentence?* → sentence case. *Is it a tag
stamped on an instrument?* → caps. Applied to the locked board, caps survive in
6 places; they currently appear in 11 rules.

## 5. Motion

Animate **only `opacity` and `transform`**.

**Never animate, in order of harm:** `filter: url(#…)` — the nine selective-colour
filters re-rasterise the full frame every tick and will take a mid-range
Snapdragon below 10fps (this is the highest-risk item in the build, and it
extends to siblings in the same stacking context); scroll-scrubbed non-transform
timelines; `width`/`height`/`top`/`left`/`margin`; `box-shadow` and
`background-color` on large surfaces; parallax on any filtered photograph;
fade-up on every element; rAF particle systems.

| Interaction | Property | Duration | Easing |
|---|---|---|---|
| Section entrance | opacity + `translateY(12px→0)` | 320ms, 30ms stagger, **max 4 items**, once | `cubic-bezier(.22,.61,.36,1)` |
| Hero photograph | **none** — it is the LCP element | — | — |
| Arrow nudge | `translateX(3px)` | 160ms (currently 200ms) | ease-out |
| Card photo zoom | `scale(1.045)` | 400ms (currently 500/600ms), wrapped in `@media (hover:hover)` | `cubic-bezier(.2,.6,.2,1)` |
| Nav underline | border colour only | 120ms | linear |
| Number count-up | text | 900ms, one per viewport, `tabular-nums`, never for ranges | `cubic-bezier(.16,1,.3,1)` |
| Journey route | `stroke-dashoffset` on a short unfiltered path | 600ms, in-view only, never scrubbed | ease-out |
| Mustard closing band | **none** — it is the pause | — | — |

Cost: a 5-item row at 320ms + 4×30ms settles at 440ms, *after* content that was
already late on 4G. So: nothing above the fold animates, ever; staggered groups
cap at 4; motion JS budget is 0 KB of library — CSS plus one
`IntersectionObserver`. **The mustard flood and the black pauses are the site's
real motion**: a full-viewport ground change costs 0ms and works on every phone.

## 6. Ten moves, ranked by leverage

1. **Break the type scale** — `journeys-landing.html:340, 364, 413–415` + the same lines in twelve sibling boards, then `app/globals.css`. 4–6h
2. **Cut equal grids from 10 to 2 per board, both unequal** — `:383, 399, 426, 453`; `about.html:462, 463, 478`. 4–5h
3. **Delete 5 of 6 `.rule-m` and 3 of 4 icon rows** — `:342, 386, 430, 456`. 2–3h
4. **Let one photograph break its box per page** — `:402, 441`. 3h
5. **Make something hand-made** — 4 drawn marks + one grain PNG, replacing `.leafmark` at `:349–352`. 3–4h
6. **Three-tier vertical rhythm** + one full-viewport pause per long page — `.sec` at `:374`. 2h
7. **Rewrite the triadic copy**, cap em-dashes at 3/page, rename the four "Our ___" headings. 3–4h
8. **Four journeys, four structures** — river-spine / photo essay / dense grid / long silences. 1.5–2 days, the biggest single win
9. **Motion hardening** — hover transforms behind `@media (hover:hover)`, 500/600ms→400ms, arrows→160ms, a never-animate-filters comment beside the filter block. 1h
10. **Split `.dual`** per the recorded ruling — `homepage-final.html:598`. 1h

If only one day is available: moves 1, 2, 3 and 5 on `journeys-landing.html`
alone. It is the reference the whole kit inherits from.

## 7. What must not be touched

- The mustard ramp and its contrast maths (`tokens.css:25–36`) — hue held in the
  CIELAB 79–87° band at every step, and the `--mustard-ink` "only mustard legal
  as text on light" rule.
- The warm neutral ramp (`:12–23`) — R > G > B at every step, R−B peaking at 20
  through the midtones. This is why the black grounds don't look like a dev tool.
- One accent, one severity hue, and the refusal of the rainbow AQI gauge.
- The nine selective-colour SVG filters — two mono ramps plus three hue
  isolations, with a written rule for picking the hue and an exemption for
  pre-treated frames. The site's signature, and genuinely original.
- Hairlines instead of shadows; `border-radius: 2px` as "field instrument, not a
  SaaS pill"; zero glassmorphism; the only gradient is a functional legibility
  scrim. **This alone is why the site doesn't look like most AI output.**
- `homepage-final.html`'s composition — only 4 equal grids in 44 declarations.
- `.strip`'s unequal `flex-grow` (`:442–447`) — the one place a photo row
  escapes uniformity. The model for everything else.
- The reveal architecture's failure mode: class added by JS so the default state
  is visible, plus a 1.2s safety net.
- The written token discipline (`DECISIONS:259–268`).

**The pattern to take away:** every one of the twelve tells is a violation of a
rule this project already wrote down for itself. The design language bans
uniform card grids and asks for oversized type, full-screen moments and visual
silence; the ledger set numeric caps. The boards then shipped 5 equal grids
where the cap was 2, 6 mustard dashes where the cap was 2, 4 icon rows where the
file's own comment said 3 was too many, and 0 full-viewport pauses where 1 was
required. **The site does not need a new design language. It needs the one it
has, enforced** — and the rhythm score at `DECISIONS:204–209` is already an
instrument a PR can fail against.
