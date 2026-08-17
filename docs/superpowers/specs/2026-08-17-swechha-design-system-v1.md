# Swechha Design System v1

**Date:** 2026-08-17
**Status:** Approved direction, design-system specification — no production implementation yet
**Direction:** DIRECTION 2 — Selective Colour / Environmental Signal, with Direction 1's editorial restraint underneath it
**Architecture:** Environmental Intelligence as a property of the Campaign/Situation content type (not a separate content type) — see [Architecture correction](#0-architecture-correction) below
**Supersedes:** the BRIEFING/NOW content-type model in [`2026-08-16-swechha-website-technical-design.md`](./2026-08-16-swechha-website-technical-design.md) §"Environmental Intelligence — the BRIEFING type"

---

## 0. Architecture correction

The technical spec this document supersedes modelled Environmental Intelligence as a sixth content type (`BRIEFING`) living under a re-purposed NOW section, separate from `CAMPAIGN`. The project owner has corrected this against the authoritative architecture in `Swechha-Website-IA-Environmental-Intelligence-Revised.md`:

> Every significant environmental situation can become a **Campaign / Environmental Situation**. Swechha NOW surfaces the most important active situations. The Campaign page is the canonical destination.

**What changes:** there is no `BRIEFING` type. `CAMPAIGN` becomes **`CAMPAIGN / SITUATION`** — one content type carrying a lifecycle (`active` / `monitoring` / `achieved` / `archived`), a severity classification, live-data fields, source references, and an update log. NOW is not an archive of a separate type; it's a **curated surface** pulling the highest-priority active situations from the Campaign/Situation set.

**What this document is, and isn't:** this is the *design system* — tokens, components, page templates — for that architecture. It is not the Environmental Intelligence backend (source registry, ingestion, event detection, editorial decision engine). That pipeline is specified in full in the IA document (§7–8) and is unaffected by anything here: this document only needs to render whatever that pipeline eventually publishes. The design system is built so the **public-facing states** of that pipeline (a live situation, a data reading with its source and timestamp, a lifecycle badge, a moment in a situation's history) have a home — not so the pipeline itself gets built now. Per the project owner's explicit instruction, no large production implementation starts from this document.

**A discrepancy worth flagging, not silently resolving:** the IA document's sitemap lists `CAMPAIGNS` as a top-level section, but its "visually minimal" nav line gives `NOW · EXPLORE · WORK · IMPACT · ACT · ABOUT · SEARCH` — Campaigns has no dedicated top-level nav slot in that line, and `IMPACT` is newly promoted to top-level nav (it wasn't in the original 5-item brief). §9 below records the resolution I'm using and why.

---

## 1. Method note — skills used, and what I rejected from them

Per instruction, this system was built using `frontend-design`, `ui-ux-pro-max:design-system`, and `taste-skill:minimalist-skill`, plus the exploration already committed in [`2026-08-17-swechha-design-language-exploration.md`](./2026-08-17-swechha-design-language-exploration.md).

The token architecture below follows `ui-ux-pro-max:design-system`'s three-layer structure (**primitive → semantic → component**) exactly. From `taste-skill:minimalist-skill` I kept what agreed with the already-verified foundation (off-black rather than pure-black text, muted secondary text, hairline borders, `IntersectionObserver` scroll-reveal, grain-textured photography) and **explicitly rejected**: its pastel accent-colour rule (would neuter the signal system's urgency — the opposite of "colour means something"), its generic font-stack suggestion (would discard the already-shipped, brand-specific Fraunces/Instrument Sans/Space Mono pairing for no reason tied to this subject), and its pill-badge/bento-grid patterns (read as generic SaaS — directly what constraint #8, "not a technology dashboard," rules out).

---

## 2. Token architecture

### 2.1 Primitive tokens — raw values, already shipped, unchanged

```
--swechha-teal:      #4BA1A5
--swechha-coral:     #F05A66
--swechha-ochre:     #D2C662
--swechha-indigo:    #2B2D46
--swechha-teal-ink:  #2C6E72   (5.58:1 on paper — teal's text-safe derivative)
--swechha-coral-ink: #BE2E3B   (5.48:1 on paper — coral's text-safe derivative)

--paper:      #FBF9F5
--ink:        #1C1D2B          (15.85:1 on paper)
--ink-muted:  #55576B          (6.74:1 on paper)
--rule:       #E4E0D8

--signal-critical:      #C81E3A   /   bright: #FF5C6C
--signal-warning:       #C15A1E   /   bright: #F0924A
--signal-watch:         #A8781A  /   bright: #E8B93F
--signal-water:         #2860C4  /   bright: #5B9BEF
--signal-nature:        #2E7D4F  /   bright: #5FBE85
```

Every ratio above is measured with a WCAG 2.1 relative-luminance script, not eyeballed — see the exploration doc §2 for the full table. The "bright" variants are for badges, numerals and any text on the indigo/dark canvas; the base variants are for light-canvas text. This pairing already exists in shipped code as `--teal`/`--teal-ink` — the signal system is one more application of a pattern already proven, not a new one.

**Rule 6 (non-negotiable):** red is never a brand colour and never decorative. `--signal-critical` is used **only** where the underlying situation is genuinely critical. The same discipline applies to all five: orange only for warning, yellow-amber only for watch, blue only for water topics, green only for nature/regeneration/positive outcomes. A designer or engineer reaching for one of these hues to make something "pop" is a process failure, not a style choice — the token names say what they mean.

### 2.2 Semantic tokens — purpose aliases

```
/* Surface */
--surface-canvas:     var(--paper)      /* the default page ground */
--surface-band:       var(--swechha-indigo)  /* dark bookend bands: cover, footer, NOW hero, situation live-status header */
--surface-band-fg:    var(--paper)

/* Text */
--text-primary:       var(--ink)
--text-secondary:     var(--ink-muted)
--text-on-band:       var(--paper)
--text-link:          var(--swechha-teal-ink)
--text-link-on-band:  var(--signal-water-bright)   /* teal-ink is too close to indigo to read as a link there */

/* Structure */
--border-hairline:    var(--rule)
--border-on-band:     color-mix(in srgb, var(--paper) 20%, transparent)

/* Signal — semantic meaning, not raw hue */
--status-critical:        var(--signal-critical)
--status-critical-onband: var(--signal-critical-bright)
--status-warning:         var(--signal-warning)
--status-warning-onband:  var(--signal-warning-bright)
--status-watch:           var(--signal-watch)
--status-watch-onband:    var(--signal-watch-bright)
--status-water:           var(--signal-water)
--status-water-onband:    var(--signal-water-bright)
--status-nature:          var(--signal-nature)
--status-nature-onband:   var(--signal-nature-bright)

/* Brand signature — logo and rare accent use only, never chrome */
--brand-mark-1: var(--swechha-teal)
--brand-mark-2: var(--swechha-coral)
--brand-mark-3: var(--swechha-ochre)
```

### 2.3 Component tokens

```
/* Badge */
--badge-radius:      2px       /* deliberately near-square — "field instrument," not a SaaS pill */
--badge-font:        var(--font-mono)
--badge-tracking:    0.08em
--badge-padding:     0.3rem 0.65rem

/* Card (ContentCard — already shipped) */
--card-overlay:       stretched pseudo-element, title-only accessible name
--card-title-level:   h3 by default, h2 when the card sits under an h1 with no intervening h2 (e.g. archive pages)

/* Data attribution — mandatory on every live figure */
--data-attribution-font: var(--font-mono)
--data-attribution-size: 0.68rem
--data-attribution-color: var(--text-secondary)

/* Lifecycle timeline (new — Campaign/Situation history log) */
--timeline-rule:      var(--border-hairline)
--timeline-dot-size:  8px
--timeline-dot-color: matches the entry's status colour at time of that entry
```

---

## 3. Logo treatment

Unchanged from the exploration: the mark ships as artwork (already converted to SVG at `public/brand/`) and is **never recoloured, restyled, or reconstructed from type** — the May 2025 guidelines forbid this and the codebase already enforces it structurally (the SVGs are committed, not generated at request time).

- **Navigation:** monochrome — `--text-primary` on light contexts, `--text-on-band` on dark. Small, horizontal lockup (`swechha-horizontal.svg`), already shipped at `h-10`/`h-12`.
- **Over photography:** monochrome only, on a scrim if the underlying image's tonal range doesn't guarantee contrast — never full colour over an image, which the guidelines' background rule already implies (full-colour logo only on backgrounds that don't fight its own colours).
- **Footer:** full brand colour permitted — this is the one place the mark's real hues appear as itself, a deliberate signature moment rather than chrome. Already shipped this way.
- **Situation/Campaign pages:** monochrome in the header nav as everywhere else. The mark never appears colour-matched to a situation's signal colour — the two colour systems (brand, signal) stay visually distinct, per the exploration's Register 1/Register 2 split.

---

## 4. Monochrome base & colour tokens

Canvas is `--surface-canvas` (paper) for the overwhelming majority of every page. `--surface-band` (indigo) appears only at deliberate structural bookends: page cover/hero moments, the footer, and — new in this system — the **Live Status header of a Situation/Campaign page** and the **hero module of Swechha NOW**, both of which are compositionally the same kind of "this is a signature moment" band as the homepage cover.

No other background colour exists in the system. A card, a section, a component background that isn't `--surface-canvas` or `--surface-band` is a defect.

---

## 5. Signal colours — meaning, not decoration

| Signal | Meaning | Never means |
|---|---|---|
| **Critical** | Hazardous, urgent, immediate risk | "important" in general, an editorial pick, a brand accent |
| **Warning** | Elevated risk, escalating | Anything not measurably escalating |
| **Watch** | Emerging, early-stage, worth monitoring | A default/idle state — see badge states below |
| **Water** | Rivers, water systems, water-quality topics | "cool" or "calm" as a mood choice |
| **Nature** | Biodiversity, regeneration, a genuine positive outcome | The site's chrome, decoration, "eco" branding |

**Lifecycle → colour mapping**, the piece this document adds beyond the exploration doc, because the Campaign/Situation model has states the BRIEFING model didn't:

| Lifecycle state | Badge treatment | Why |
|---|---|---|
| `active` | The situation's classified severity signal (critical/warning/watch/water, whichever applies) | The badge *is* the situation's current signal — this is where the five-colour system actually gets used |
| `monitoring` | `--status-watch` family, deliberately de-escalated | "Being watched, not raging" — distinct from `active`'s sharper signal |
| `achieved` | `--status-nature` | The one place green means what section 6 says it must: a real, positive, verified outcome |
| `archived` | Monochrome — `--text-secondary` on `--rule`, no signal colour at all | History is not a live signal. An archived situation earns no colour, on purpose |

`detected` and `candidate` (from the IA doc's §8.16) are **pre-publication, internal-only states** — they never reach the design system because they never reach the public site. Nothing here needs to render them.

---

## 6. Typography

Unchanged from Direction 2, and unchanged from what's shipped — zero rework:

- **Display:** Fraunces (variable, `SOFT`/`WONK`/`opsz` axes in production use)
- **Body:** Instrument Sans
- **Data:** Space Mono — timestamps, coordinates, AQI/metric readings, badge labels, source-attribution lines. Never body text.

### Type scale (already shipped, `app/globals.css`)

| Level | 375px | 1440px | Weight | Fraunces axes |
|---|---|---|---|---|
| h1 | 38.0px | 56px | 600 | opsz 96, SOFT 20, WONK 1 |
| h2 | 30px | 36px | 600 | opsz 48, SOFT 20, WONK 0 |
| h3 | 24px | 28px | 600 | opsz 28, SOFT 25, WONK 0 |
| h4 | 20px | 20px (fixed) | 600 | opsz 20, SOFT 30, WONK 0 |
| body | 18px | 18px | 400 | — |

Body line-height 1.6, headings 1.3. `WONK 1` is spent in exactly one place per page — the single largest heading — per the standing rule that one h1 is the whole character budget.

---

## 7. Spacing & grid

8px base unit (consistent with the Farm App project's own convention and the original brief). 12-column responsive grid. Breakpoints: 375 / 768 / 1024 / 1440 — already shipped, unchanged.

---

## 8. Photography & selective colour

Unchanged from the exploration, with one addition specific to Situation/Campaign pages: **when a selective-colour treatment is used on a situation photograph, the surviving colour should be thematically true to the topic where honestly possible** — a water-crisis photo's surviving colour is the water; a wildfire photo's is the flame or smoke haze. This isn't a new rule, it's the existing "the colour must have a true reason" discipline (exploration §3) applied where the subject makes it obvious. It is never forced — most situation photography stays fully monochrome, and the signal badge is doing the "colour is information" work already.

The discipline from the exploration stands unchanged: never bulk, never more than one colour per image, never decorative, always captioned.

---

## 9. Navigation

**Resolved reading of the IA doc's nav discrepancy:** `NOW · EXPLORE · WORK · IMPACT · ACT · ABOUT` — six items, dropping `SEARCH` from the persistent nav row (search gets an icon/shortcut, not a full label slot, consistent with "visually minimal") and **not** adding a separate `CAMPAIGNS` item. Campaigns/Situations are reached through NOW (active ones) and through WORK (the fuller archive, since Situations are conceptually "what Swechha is working on" as much as Projects are). This reading is a judgement call, not dictated by the source doc — flag it back to me if the intent was a literal 7-item bar with Campaigns included.

Otherwise unchanged from what's shipped: minimal text nav, generous letter-spacing, logo returns home (no separate "Home" nav item).

---

## 10. Buttons & links

Unchanged discipline: text-link primary pattern (underline, `--text-link`), not a filled-button-everywhere pattern. **One filled/solid CTA variant exists**, using a status colour, reserved for exactly the case the IA doc and exploration both name: a genuinely critical, live situation's primary action ("Join this campaign now"). Every other CTA — newsletter, volunteer, generic "learn more" — stays a text link. This is rule 7, made concrete: colour on a button is a claim about urgency, and most actions aren't urgent.

---

## 11. Status badges

Near-square (`2px` radius, not a pill — see §1's rejection of the SaaS pill pattern), Space Mono, uppercase, `0.08em` tracking. Always paired with its word (`CRITICAL`, not just red) — never colour alone, per WCAG and per the IA doc's own principle that automated confidence must never silently read as authoritative fact to a visitor: the badge names the state in words every time.

Four public states as specified in §5's lifecycle table. No other badge states exist in the public interface.

---

## 12. Swechha NOW

**Redesigned against the corrected architecture.** NOW is not a list of BRIEFING entries — it's a **curated surface of the highest-priority active Campaign/Situations**, ranked by the priority scoring the IA doc describes (severity × relevance × confidence × recency, §8.9), with the editorial team retaining override per §8.19.

Structure: one hero situation (the highest-priority active one) gets the full treatment — location/topic, oversized metric in Space Mono, lifecycle+signal badge, source-and-timestamp attribution line (mandatory, per §8.4/§8.17's provenance requirement), "What this means" / "What you can do" links through to the full Situation page. Below it, 2–3 secondary situations in a quieter, single-line treatment (Direction 1's restraint) — never a long feed; per the IA doc, "surface the most important without overwhelming."

Every figure on NOW carries its source and timestamp. This is not optional styling — it's the IA doc's explicit requirement (§8.17: "the public site must never imply that old information is current") made into a component rule.

---

## 13. Campaign / Situation page — the canonical component set

This is the architecture's centre of gravity, and the biggest structural addition this document makes over the exploration.

**Live Status header** (on `--surface-band`, matching the homepage cover's register): location, topic, lifecycle+signal badge, the live metric if one exists, source-and-timestamp attribution.

**What We Know** — short, edited summary. Facts and numbers, not paragraphs, per the IA doc's explicit instruction.

**Live Data / Monitoring** — any chart, trend, or reading here follows §14's data-visualisation rules and *always* carries its attribution line. This block is allowed to be empty/absent for a situation with no live data (most will start here) — its presence is conditional, never faked.

**Public Health / Environmental Impact** — plain-language consequence, no alarmism, per the IA doc.

**Why It Matters** — connects to the wider policy/climate/justice context.

**What Swechha Is Doing** — the organisation's actual response.

**What You Can Do** — specific, named actions (not "Support Us") — rendered as a short list of concrete action links, each one earning the filled-CTA treatment from §10 only if the situation is genuinely `active`+`critical`.

**Evidence & Sources** — a plain citation list: source, publication date, update time, methodology where relevant. This is not decorative — it's where the IA doc's provenance requirement becomes visible to the visitor, not just tracked internally.

**Lifecycle timeline** — new component, directly specified by the IA doc §6 ("Campaigns evolve over time... a living environmental record"). A simple vertical log: date, one-line status change, the lifecycle badge active at that moment. This is what turns a Situation page from a static article into "a living record" the IA doc asks for, and it's cheap to build — a list, not a visualisation.

**Related Content** — cross-links to Stories, Knowledge, Films, other Situations.

---

## 14. Data visualisation principles

- Monochrome base for every chart; **one signal colour maximum** per chart, applied to the one series that's the actual point.
- Never colour alone — every coloured data point pairs with a text label.
- Sparklines get an emphasised endpoint (a dot on the current value) and a faint baseline grid — the same treatment used in the exploration artifact's NOW sparkline demo.
- **Every live data element states its source and timestamp**, always, without exception — this is the single most load-bearing rule in this whole document, because it's the visible proof of the IA doc's entire provenance architecture (§8.4, §8.6, §8.17).
- A text/table alternative exists for any chart that carries real information — the accessibility requirement, not an afterthought.
- No 3D, no gradients on data fills, no dashboard-tile grids of many small charts on one screen — one data moment per screen section, per Direction 1's restraint and constraint #8.

---

## 15. Cards

`ContentCard` as already shipped: title-only accessible link name, stretched-overlay click target, `h3` by default / `h2` when it sits directly under an `h1`. Situation/Campaign list cards are the same component with one addition: a lifecycle+signal badge in the same slot the "meta" prop already occupies. No new card component — an extension of the existing one.

---

## 16. Story / Impact / Knowledge / DIY / Act layouts

Unchanged from the exploration (§18–19, Direction 2 entries) — photography-led stories with rare selective colour; oversized editorial numbers for Impact; short explainers with pull-facts for Knowledge; What/Time/Cost/Difficulty metadata for DIY; text-link-first CTAs for Act, filled treatment reserved for genuine urgency.

---

## 17. Motion

Unchanged principles: `prefers-reduced-motion` respected throughout, `IntersectionObserver`-based reveal (never scroll-event polling), transform/opacity only. One addition specific to the corrected architecture: **a badge's colour transition when a situation's status genuinely changes** (e.g. `warning` → `critical` as AQI worsens) is the one deliberate motion moment in the whole system — brief, not a loop, and entirely gated behind real data existing (Phase 2, per the IA doc's progressive-automation levels).

---

## 18. Mobile

Unchanged principles (mobile-first, 375px baseline). The Live Status header and lifecycle timeline both go single-column, badge-above-headline on mobile — the two components most likely to feel cramped if treated as a desktop-shrink rather than designed mobile-first.

---

## 19. Accessibility

Unchanged verified contrast requirements (§2.1's ratios). Every signal badge pairs colour with a word. The lifecycle timeline is a real list (`<ol>`), not a styled `<div>` soup, so it's navigable by screen reader as the sequence it is. Live data elements should be designed with a future `aria-live="polite"` region in mind once Phase 2 makes any of this genuinely real-time — noted now so it isn't a retrofit later.

---

## 20. Dark/light behaviour

**This system commits to one visual world** — the paper canvas with indigo as a deliberate dark accent band — the same choice already shipped. It is not a light/dark *toggle* for the product itself. If a genuine dark-mode variant of the whole site becomes a real requirement later, that's a distinct decision with its own trade-offs (signal colours would need separate on-dark-canvas-as-default tuning beyond what §2.1 already provides for badges) — worth raising explicitly rather than assuming, since it wasn't asked for here.

---

## 21. Responsive rules

Breakpoints 375 / 768 / 1024 / 1440, fluid type via `clamp()`, grid collapses to single column below 768 — all unchanged and already shipped.
