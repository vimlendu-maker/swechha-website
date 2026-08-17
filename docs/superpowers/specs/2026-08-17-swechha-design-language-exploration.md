# Swechha — Design Language Exploration

**Date:** 2026-08-17
**Status:** Design discovery only — no production code in this document or its companion artifact
**Companion:** an HTML visual artifact showing all three directions with real color/type/logo treatment
**Author's role:** creative director exploring visual language, per the brief below

---

## 0. Grounding

I looked for "Swechha Website Master Product Brief" and "Swechha Website Information Architecture & Environmental Intelligence Model" under those exact titles in this repository and did not find them — no file or filename matches. What exists, and what I've treated as the source material those titles refer to, is:

- [`2026-08-16-swechha-website-design.md`](./2026-08-16-swechha-website-design.md) — the product brief (5 content types, NOW/EXPLORE/WORK/ACT/ABOUT, MVP scope).
- [`2026-08-16-swechha-website-technical-design.md`](./2026-08-16-swechha-website-technical-design.md) — the technical spec, which **already contains an Environmental Intelligence model**: a sixth `BRIEFING` content type under a re-purposed NOW section, editorial-first with live data deferred to Phase 2.

If those two titled documents exist somewhere I haven't seen (Desktop, cowork, elsewhere), tell me and I'll reconcile against them directly. Absent that, everything below argues from what's actually in this repo.

**One fact this exploration has to sit next to honestly:** a foundation is already built and merged to `main`. It ships a brand palette (teal `#4BA1A5`, coral `#F05A66`, ochre `#D2C662`, indigo `#2B2D46`), a warm neutral canvas (`paper` `#FBF9F5`, `ink` `#1C1D2B`), Fraunces + Instrument Sans typography, and a working STORY vertical — all contrast-verified and tested. This document doesn't pretend that doesn't exist. Where a direction can extend it, I say so and note the low cost. Where a direction requires real rework, I say that too, plainly.

---

## 1. The central design idea, refined

Monochrome-as-canvas with colour-as-signal is a real, workable design language, not a gimmick — but it needs one honest acknowledgement before it's a system: **a black-and-white photograph with one surviving colour element is the single most famous image in cinema** (the girl in the red coat, *Schindler's List*, 1993). Your own examples — a girl's red hairband, one green leaf — sit close enough to that reference that some visitors will feel the echo. That's not disqualifying; it's information. The device works because it's rare and earned in that film. It fails the moment it's used often or decoratively. So the design system's central discipline has to be **scarcity**: selective colour is a device you spend, not a filter you apply.

The mechanism itself is sound web-technically: CSS `filter: grayscale(1)` on a photograph plus a small colour-preserving mask (either at the image-processing stage — the honest way, done once per photo by a human editor choosing what stays coloured — or a CSS clip-path/mask isolating a region) produces exactly this effect, and it degrades gracefully (a browser without mask support just shows the full grayscale photo, which is still correct).

**Refinement I'd make to the brief:** don't let every hero image get this treatment. Section 3 below proposes a disciplined rule for when it's earned.

---

## 2. Colour as information — a refined, verified palette

Your instinct that colour should be contextual rather than a fixed "Swechha green" is right, and it resolves a tension I'd otherwise have to flag: **the brand's own guidelines already forbid a dominant Swechha colour** — teal/coral/ochre are the *mark*, not the chrome, and the guidelines explicitly provide black and white single-colour logo variants for exactly this kind of monochrome context. This isn't a departure from the brand. It's activating a mode the brand guidelines already document and approve, and using it as the *default* rather than the exception.

So the system has two registers, deliberately kept apart:

**Register 1 — Brand.** Teal, coral, ochre appear only as the logo (which the guidelines forbid recolouring anyway) and in small signature moments — never as a "Swechha blue button" pattern. Indigo `#2B2D46`, already the guideline's "preferred background," becomes the dark canvas this system needs — no invented near-black.

**Register 2 — Signal.** A separate, deliberately distinct-from-brand palette that means something contextually. I picked hues that don't overlap perceptually with the brand accents — critical red reads as alarm, not "oh, that's the brand colour again":

| Signal | Meaning | On paper (light) | On indigo (dark) |
|---|---|---|---|
| **Critical** `#C81E3A` / bright `#FF5C6C` | Hazardous, urgent | 5.39:1 ✅ | 4.47:1 — large text/numerals only |
| **Warning** `#C15A1E` / bright `#F0924A` | Elevated risk | 4.21:1 — large only | 5.69:1 ✅ |
| **Watch** `#A8781A` / bright `#E8B93F` | Emerging, caution | 3.72:1 — large only | 7.30:1 ✅ |
| **Water** `#2860C4` / bright `#5B9BEF` | Rivers, water systems | 5.61:1 ✅ | 4.71:1 ✅ |
| **Nature** `#2E7D4F` / bright `#5FBE85` | Biodiversity, regeneration | 4.80:1 ✅ | 5.87:1 ✅ |

Every ratio above is computed with a WCAG 2.1 relative-luminance script, not eyeballed. The pattern (a base tone for light backgrounds, a brighter variant for dark ones) **extends the exact pattern already shipped** — `--teal` vs `--teal-ink`, `--coral` vs `--coral-ink` exist in the codebase today for the identical reason: some hues can't pass 4.5:1 as text at every combination, so a text-safe derivative exists alongside the "true" hue reserved for non-text use. Nothing new is invented here; six months from now this reads as one system, not two.

**On the sixth colour (purple/culture) the brief floats:** I'd cut it. Nothing in the current content model — Project, Story, Knowledge, Film, Campaign, Briefing — names a "youth/culture" category that needs its own signal. Adding a colour with no defined referent is exactly the "colour to make it prettier" the brief itself warns against. If a Culture/Youth pillar becomes real content later, add its colour then, against a real referent — not now, against a hypothetical one.

**Green gets the discipline the brief asks for.** It appears in exactly one place: the Nature/regeneration signal, for actual wins — a reforestation milestone, a biodiversity count, a positive outcome. It never appears as chrome, navigation, or default accent. That's what makes it mean something when it shows up.

---

## 3. Selective colour in photography — a disciplined rule

Recommendation: **selective colour is earned per-story, not applied by content type.** A rule tied to content type ("always do it for Campaigns") turns into a filter preset within two months. A rule tied to *editorial judgement* — does this photo have one element whose colour is the actual point of the image? — stays rare because most photos don't.

Concretely:
- **Never** on card thumbnails, list views, or anything seen in bulk. The grid stays monochrome; that's what makes the one full-bleed treatment land.
- **Rarely** on Story heroes — maybe one in ten, when the photo genuinely has a single meaningful coloured object (the AQI mask, the surviving sapling, the water sample).
- **Only ever one colour per image.** Never two selectively-coloured elements in the same frame — that reads as a filter, not a choice.
- **Never** as decoration on stock or generic imagery. This technique on a mediocre photo makes the mediocrity more visible, not less.
- The colour preserved must be **named in the caption or alt text** — "the sapling she planted three years ago" — so the device carries meaning for screen reader users too, not just sighted ones. This is the accessibility answer to "don't rely on colour alone," applied to a device that's *entirely* colour.

This becomes a genuine Swechha signature specifically because it's rare enough to notice.

---

## 4–17. The shared design ground

Sections 4 (feel), 6 (typography), 7 (layout), 15 (motion), 16 (mobile), 17 (accessibility) are addressed per-direction below, since the whole point of three directions is that these differ. Sections 8–14 (NOW, Campaigns, Impact, Stories, Knowledge, DIY, ACT) are structural content patterns that hold across all three directions — the visual skin changes, the information architecture doesn't. I address each once here rather than repeating identically three times, and flag where a direction changes the pattern.

**Swechha NOW.** This is the BRIEFING type from the technical spec, given the treatment your brief describes. Structurally: a location/topic eyebrow, an oversized status number or state, a signal-colour badge (not a coloured background — a small badge, so 90% of the module stays monochrome), a timestamp, then "What this means" / "What Swechha is doing" / "What you can do" as three short blocks, not paragraphs. This is not a banner or carousel — it's one module, updated, sitting at the top of NOW. Colour is confined to the badge and, in Directions 2–3, the oversized number itself.

**Campaigns.** The architecture in your brief (NOW → situation → campaign → data → impact → action) maps directly onto the CAMPAIGN type. The status badge (Active/Monitoring/Achieved) uses the same signal system as NOW — a live campaign born from a hazardous-AQI NOW briefing carries visual continuity from the badge that flagged it. That continuity is worth protecting explicitly in whichever direction gets built.

**Impact.** Numbers first, oversized, in the display face — "17 years," "30 gardens" — with photography and short statements underneath, never a KPI-dashboard grid. This is where restraint matters most: three or four numbers, not twelve.

**Stories.** Photography-led, short headlines, pull quotes set in the display face at a size that makes them a visual moment, not just styled text. This is where selective colour (§3) is used, rarely.

**Knowledge.** Short explainer text, a pull-fact treated as a typographic moment (large number or short claim, set apart), progressive disclosure for depth. No walls of text — a rule this codebase's `Prose` component already needs to honour regardless of which direction ships.

**DIY.** What/Time/Cost/Difficulty as compact metadata, not prose. Step photography over step paragraphs.

**Act.** CTAs inherit the signal system contextually — a critical campaign's "Act now" can legitimately use the critical-red badge treatment, because it's carrying real information (urgency), not decoration. Everyday CTAs (newsletter, volunteer) stay in the monochrome/brand register — a text link with a rule, not a coloured button. This is the answer to "don't make every CTA a bright button": buttons earn colour when the colour is true.

---

## 18–19. Three directions

### Direction 1 — Editorial Monochrome

**Philosophy.** The magazine, not the campaign. Typography, photography, and whitespace are the entire vocabulary; colour is nearly absent except brand signature and the rare selective-colour photograph. This is the safest direction relative to what's shipped, and the strongest "contemporary publication" reading.

**Mood.** Quiet, confident, unhurried. Closest to *Cereal* magazine or a well-produced photo-essay site — restraint as the whole personality.

**Typography.** **Keep Fraunces + Instrument Sans — zero rework cost.** Fraunces already has the optical-size and warmth this direction wants; push it further by using its largest optical sizes for headlines cropped at the viewport edge (a genuine signature move, not decoration) and leaning the `SOFT` axis down slightly for a more austere, less rounded editorial voice than what's shipped today. If a fully clean break is wanted instead: **Newsreader** (Google Fonts, OFL) is a genuinely more austere, quieter serif built explicitly for long-form reading — less warmth than Fraunces, more "newspaper." I'd only recommend switching if the "quiet" reading matters more than continuity; otherwise Fraunces already does this job.

**Colour system.** Register 1 only (brand as signature), Register 2 (signal) used at minimum necessary — NOW's badge, nothing more. This direction is the purest test of "does monochrome-plus-restraint feel complete," and it should.

**Selective-colour rule.** As §3, but even rarer here — maybe one story a month gets the treatment. Scarcity is the entire point of this direction.

**Photography treatment.** Full-bleed, large, black-and-white or near-monochrome as the default state for every image, full stop. This is the direction where "photography carries emotion" is tested hardest, since colour can't do any of the work.

**Grid/layout.** Asymmetric, magazine-style: a narrow reading column against a full-bleed image, generous margins, no card grids for anything that isn't literally a list (the archive pages can stay grid-based, per what's shipped — nothing here contradicts that).

**Navigation.** Minimal text nav, no icons, generous letter-spacing (already shipped). Logo in black-on-white / white-on-black, never full colour in the header.

**Homepage concept.** One full-bleed monochrome photograph, one headline in Fraunces at display size, one line of supporting text, two text-link CTAs. NOW's badge is the only colour on the page.

**Swechha NOW concept.** Quietest version of NOW across the three directions — a compact editorial callout, not a dominant module, consistent with the magazine reading.

**Campaign page.** Long-form, photo-essay structured, data presented as short editorial statements rather than dashboards.

**Impact.** Numbers set in Fraunces at large optical size against monochrome photography — an editorial pull-quote treatment for statistics.

**Knowledge.** Explainers read like magazine sidebars — pull-facts set as typographic moments within the text.

**Act.** Text-link CTAs with an underline rule, in ink, not colour — except where a genuinely critical action inherits its signal.

**Mobile.** Photography still full-bleed; type scale compresses but stays generous — the magazine reading has to survive on a phone or it isn't real.

**Motion.** Minimal: crossfades, no parallax, no scroll-jacking. Motion here would work against the mood.

**Accessibility.** Highest-contrast direction by construction — near-black ink on near-white paper is already 15.85:1 (verified, shipped). Selective colour's caption rule (§3) is the one place this direction needs explicit accessibility discipline.

**Strengths.** Lowest implementation cost (mostly reuses what's shipped), ages best, hardest to get visibly wrong, most "credible contemporary organisation" reading.

**Risks.** Could read as safe or under-differentiated if the selective-colour device isn't used with genuine discipline — this direction lives or dies on photography quality, which depends on the WordPress/Desktop archive actually containing images good enough to carry it.

**Why appropriate for Swechha.** It's the direction that makes "shaping the future" a matter of confidence, not spectacle — and it's the one a funder or journalist reads as most credible on first visit, which matters given who's in the audience list.

---

### Direction 2 — Selective Colour / Environmental Signal

**Philosophy.** The one your brief clearly wants most. Monochrome is the default state of everything; colour is the site's only voice for "this matters," used identically for photography and for data. This is the most *Swechha-specific* direction — no other environmental org's site works this way, which is exactly the differentiation your brief is chasing.

**Mood.** Alert, precise, human — a field report crossed with a photo essay. Closer to Reuters Graphics' "monochrome map, coloured danger zones" convention than to any editorial magazine.

**Typography.** Keep Fraunces + Instrument Sans as the editorial base (same zero-rework argument as Direction 1), and add **one utility face reserved entirely for numbers and data**: **Space Mono** (Google Fonts, OFL) — genuine character (not a generic system mono), tabular figures, reads as instrumentation without reading as a dashboard. Used only for AQI numbers, timestamps, coordinates, and campaign statistics — never for body text. This is a small, additive change: one more `next/font/google` call, one more CSS variable.

**Colour system.** Register 2 (signal) is the star. The badge from §2's NOW module becomes larger and more central across the whole site — campaign status, knowledge-difficulty tags, everything that has a real state gets a signal-coloured badge against monochrome. Register 1 (brand) recedes further than in Direction 1 — the logo appears almost exclusively in monochrome, full colour reserved for the footer and nowhere else.

**Selective-colour rule.** Central rather than occasional here — but still per §3's discipline (never bulk, never decorative). This direction is where the technique gets to be a genuine signature, used meaningfully across Stories and Campaigns both.

**Photography treatment.** Monochrome by default; selective colour used more often than Direction 1 but still following the earned-not-applied rule. A campaign hero showing a polluted river might keep only the water's actual colour if it's genuinely distinct from the grey sky and grey concrete around it — informational, not aesthetic.

**Grid/layout.** More modular than Direction 1 — the signal badge needs a consistent slot across content types, so this direction benefits from slightly more structure (a defined "status strip" pattern) without becoming a dashboard.

**Navigation.** Same restrained text nav; the one difference is a persistent small NOW-status indicator in the header (a coloured dot next to the NOW nav item when something's active) — subtle, not a banner.

**Homepage concept.** NOW's badge is visible above the fold as a compact strip even from the homepage — "Delhi Air · Hazardous" as a single line with a red dot — driving into the full NOW module. The rest of the homepage stays exactly as monochrome as Direction 1.

**Swechha NOW concept.** This is where the brief's own example (Delhi Air Quality, 347, HAZARDOUS, red) becomes the site's most recognisable single element — oversized number in Space Mono, signal-coloured badge, everything else in ink-on-paper.

**Campaign page.** The status badge from NOW carries through visibly — a visitor can trace "this campaign started from that NOW alert." Data uses Space Mono; narrative uses Instrument Sans; nothing here becomes a chart-heavy dashboard.

**Impact.** Numbers in Space Mono rather than Fraunces here — a deliberate difference from Direction 1, giving Impact a "measured, verified" feel rather than an editorial one.

**Knowledge.** Difficulty/topic tags use the signal system where genuinely applicable (a "Watch" tag on an emerging-issue explainer) — but not manufactured for content that has no real status.

**Act.** As §"Act" above — signal-coloured CTAs only where the underlying content is genuinely signal-worthy.

**Mobile.** The status badge/strip needs to work as a compact one-line element at 375px — this is the one component this direction should prototype in code before committing, since it's the load-bearing signature element.

**Motion.** A badge that changes colour on data update (AQI moving from Watch to Warning) is the one motion moment worth building deliberately — a brief colour transition, not an animation loop, and gated entirely behind Phase 2's real data (this direction's *visual* language ships now; the live transition only means something once real data exists).

**Accessibility.** Every signal colour ships paired with its text label always, never colour alone (already the plan in §2's table — "Critical" the word, not just red). The dark-canvas variants (bright reds/oranges/etc.) are specifically for numeral/badge use where the 3:1 large-text bar applies, not small body text — a rule that needs enforcing in code the way `--teal`/`--teal-ink` already is.

**Strengths.** Most distinctive, most literally "Swechha" of the three, directly operationalises your brief's central idea, and gives NOW the recognisable identity your brief asks for by name.

**Risks.** The badge-and-signal system needs real editorial discipline to not become "everything has a coloured tag" within a year — this is a governance risk more than a design risk, and worth a content-team rule, not just a design rule. Moderate rework cost (one new typeface, an expanded token set) versus Direction 1's near-zero.

**Why appropriate for Swechha.** It's the direction that makes Environmental Intelligence *visible* as a concept rather than just an information architecture decision — the signal system IS the intelligence, made legible at a glance.

---

### Direction 3 — Intelligent Environmental System

**Philosophy.** The most experimental of the three: monochrome, live data, maps, and typography treated as one integrated instrument rather than a publication. This is "environmental intelligence" read literally — the site as an instrument panel for understanding what's happening, kept legible and calm rather than dashboard-dense.

**Mood.** Precise, quietly technical, forward-facing — closer to NASA's Earth Observatory (confirmed live today: muted base, imagery-led, colour reserved for the phenomenon being shown) or a well-designed scientific instrument than to a magazine.

**Typography.** The direction most worth a real typographic departure. **Space Grotesk** (Google Fonts, OFL) as the display face — geometric, technical, genuine character without being cold, distinct enough from Fraunces's warmth to signal "this is the instrument, not the magazine." **Space Mono** (same family, same rationale as Direction 2) for all data. Instrument Sans can stay for body copy — it already reads as a clean technical sans and doesn't need replacing. This is the highest-rework typography of the three: a new display face means retuning the whole type scale, not just adding a variable.

**Colour system.** Identical Register 1/2 split as Direction 2, but Register 2 extends further — into map choropleth treatments, sparkline colour, and live-data visual states — territory the other two directions never enter. This is the direction where "colour is information" gets applied to genuine data visualisation, not just badges.

**Selective-colour rule.** Least central here — this direction's "colour as attention" job is mostly done by data visualisation rather than photography. Selective-colour photography still follows §3, used sparingly for Stories, but it's not the direction's signature device; live data is.

**Photography treatment.** Monochrome, often paired directly with a map or data visualisation in the same module — a photograph and a chart sharing one visual register (both desaturated except the signal) so they read as one system rather than two different design languages colliding.

**Grid/layout.** Modular, sometimes dashboard-adjacent by necessity (maps need structure) — the discipline required here is explicit: no more than one data-dense module per screen, generous whitespace around it, never a wall of tiles. This is the direction most likely to drift into "technology startup dashboard," which your brief explicitly rules out — building this well means constant editing against that risk.

**Navigation.** Same restrained text nav as the other two, but NOW's status indicator (Direction 2's coloured dot) becomes a live sparkline thumbnail here — still small, still not a banner.

**Homepage concept.** NOW's module includes a compact map or sparkline alongside the number, not just the badge — the homepage becomes slightly more "instrument," while everything below NOW stays as calm as Direction 1's homepage.

**Swechha NOW concept.** The fullest realisation of your brief's own example — number, badge, AND a small live-data element (trend line, map dot) together, still confined to one module, still 90% monochrome.

**Campaign page.** Genuinely data-forward — a real chart of the underlying metric, a map of affected geography — but bounded to one such element per page, per the layout discipline above.

**Impact.** Trend lines alongside the big numbers — "17 years" next to a sparkline of programme growth, not a KPI dashboard.

**Knowledge.** Diagrams and interactive explainers earn a real place here that they don't in Directions 1–2 — this is the direction best suited to an actual interactive explainer (e.g., a scrollable AQI-health-effects diagram) rather than a static one.

**Act.** Same discipline as the other two directions — colour on CTAs only where the underlying signal is real.

**Mobile.** The hardest direction to get right on a phone — maps and sparklines need real mobile-specific treatment (tap-to-expand, simplified geometry), not a shrink of desktop. This should be prototyped mobile-first literally, not just checked at 375px afterward.

**Motion.** The only direction where motion carries real informational weight — a sparkline drawing in, a map layer transitioning as a threshold crosses. Everything here still respects `prefers-reduced-motion`, and everything here is **entirely Phase 2**: this direction's visual language can be designed now, but its actual content depends on live data infrastructure the technical spec explicitly defers.

**Accessibility.** The hardest of the three to get right — maps and data visualisations need text equivalents (a table alternative to every chart, per WCAG), which is real, non-trivial work this direction commits to more than the other two.

**Strengths.** Most future-facing, most literally realises "Environmental Intelligence" as a product idea, best long-term platform for the site becoming what Part 13 of the original brief describes as the eventual vision.

**Risks.** Highest cost by a wide margin — new typeface, new component patterns (maps, sparklines), the highest accessibility burden, and the greatest risk of drifting into the "technology startup dashboard" look the brief explicitly forbids. Most of its distinctive content (live data) can't actually exist until Phase 2 ships, so an MVP built in this direction would be visually promising most of what it can't yet deliver.

**Why appropriate for Swechha.** It's the correct direction for the *eventual* platform — but "eventual" is the operative word, and building toward it now risks visible unfinished promise on day one.

---

## 20. Visual references

References marked ✓ were checked live today; others are cited from established knowledge of real, well-known institutions and are not fabricated, but weren't independently re-fetched this pass.

- **World Press Photo** (worldpressphoto.org) ✓ — photography as the entire hero, neutral palette, generous whitespace, no ornament. The clearest real-world proof that a photography-first monochrome-adjacent site reads as serious, not empty.
- **NASA Earth Observatory** (science.nasa.gov/earth/earth-observatory) ✓ — satellite imagery with colour reserved for the phenomenon being explained; muted chrome around it. Direction 3's closest real precedent.
- **Reuters Graphics** and **Bloomberg Green** — muted/monochrome base maps with colour reserved for the data signal (heat, danger, change). Direct precedent for the NOW/signal system in Directions 2–3. (Bloomberg Green returned a 403 to automated fetch today; cited from established knowledge of its published design, not re-verified this session.)
- **Fondation Cartier** and **Serpentine Galleries** — museum/cultural-institution sites using genuinely restrained monochrome-plus-imagery systems, useful counter-examples to "NGO template."
- **Cereal Magazine** — editorial monochrome-adjacent lifestyle publication; typographic restraint and whitespace discipline, cited for craft rather than subject matter.
- **The Pudding** (pudding.cool) ✓ — checked directly; its actual palette is bright and playful, **not** a monochrome reference. Cited only for its structural approach (data integrated directly into narrative prose) — do not use its colour system as a reference.
- Carried forward from the earlier research pass in this project (already independently vetted): **Carbon Brief**, **Grist**, **Our World in Data**, **Project Drawdown**, **The Ocean Cleanup**, **basement.studio** — see that scan for detail; still relevant for "one strong accent, not generic NGO green" and for narrative-sequence homepage structure.

---

## 21. Recommendation

**Direction 2 — Selective Colour / Environmental Signal**, with Direction 1's typographic and editorial discipline underneath it. Not a hybrid that blurs the two — Direction 2 *is* Direction 1 with the signal system activated; nothing in Direction 1's restraint gets diluted by adding it.

**Why it fits Swechha.** It's the one direction that makes "Environmental Intelligence" a visual fact rather than a paragraph in the IA document — the signal badge is the site's answer to "something is happening," which is your brief's own north star sentence made into a design element.

**Why it will age well.** It's built almost entirely on what's already shipped — same fonts (plus one small, justified addition), same neutrals, same brand colours in the same restrained role. There's no "2026 aesthetic" being bet on; the monochrome canvas doesn't date the way a trend-driven palette would.

**Why it will appeal to younger audiences.** Not through slang or forced youth signifiers (which your brief explicitly rules out) but through confidence — a serious visual system that trusts the visitor to read a badge and a number rather than explaining itself. That reads as respect, which is what actually earns a younger audience's attention.

**How it supports Environmental Intelligence.** Directly — the signal system is the visual expression of the BRIEFING content type already specified in the technical spec. No new content architecture is needed; this is a skin for what's already designed.

**How it supports campaigns.** The badge's continuity from NOW into Campaign pages (§18–19) makes the causal story — "this alert became this campaign" — visible without a sentence of copy explaining it.

**How it supports storytelling.** Selective-colour photography (§3) gets a real home here, used meaningfully rather than as decoration, because the site already has a colour-means-something vocabulary for the reader to recognise it against.

**How it supports action.** CTAs earn colour instead of defaulting to it — a critical campaign's action button is genuinely more visually urgent than a newsletter signup, which is true and useful, not just visually louder.

**How it remains lightweight.** One additional typeface (Space Mono, small, purpose-built for numerals), a token system extension that follows an already-established pattern (`--teal`/`--teal-ink` → `--critical`/`--critical-bright`). No maps, no live-data infrastructure, no dashboard risk — those are Direction 3's cost, deliberately deferred.

**How it becomes recognisably "Swechha."** The badge-and-number NOW module, once it exists, is the kind of element people describe to each other — "did you see Swechha's air quality thing" — the way Direction 1 alone would never generate that sentence.

**What I'd explicitly defer:** Direction 3's maps, sparklines, and live-data visual language. Not because they're wrong — they're the right eventual platform — but because building their visual promise now, with Phase 2's data infrastructure still unbuilt, means shipping a look the site can't yet back up. Direction 2 gives NOW real visual identity today; Direction 3's fuller realisation is the natural Phase 2 companion to the data pipeline the technical spec already defers there.
