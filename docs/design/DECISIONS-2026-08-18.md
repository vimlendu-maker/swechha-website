# Swechha website — decision ledger, 2026-08-18

Captured during brainstorming, BEFORE any code. Source of truth for the spec.

## Document authority (per 02_FINAL_DESIGN_LANGUAGE.md §16)
1. `02_FINAL_DESIGN_LANGUAGE.md`
2. approved homepage mockup (direction, NOT pixel truth)
3. `00_README_MASTER.md`
4. `01_FINAL_REVISED_SITEMAP.md` — governs page architecture / URLs
5. `Swechha-FINAL-Revised-Content-Workbook.xlsx` — governs content + labels
6. `04_ENVIRONMENTAL_INTELLIGENCE.md` — governs intelligence system
Plus `05_INTERNAL_PAGE_DESIGN_SYSTEM.md` for internal pages.
All earlier direction (design-system-v1, IA-revised, brief-revised) is SUPERSEDED.
Do not blend arbitrarily.

## Owner rulings (this session)
- Mustard = primary accent. Monochrome canvas, colour = signal.
- Canvas: black / charcoal. NOT indigo. (Overrides brand guideline's #2B2D46.)
- Nav: 7 items — NOW · WORK · EXPLORE · IMPACT · ACT · ABOUT · SEARCH.
  DONATE is an additional nav item, visually highlighted.
- 26 years (founded 2000). Derive from `foundedYear = 2000`, never hardcode.
- Impact numbers are REAL and verified by owner (overrides workbook's
  "Verification needed: YES" flags). Must be editable by non-developers.
- Homepage impact tiles: FOUR, as mockup —
  3M+ children · 6,890 t Yamuna waste · 5%→90% green cover ·
  100+ green infrastructures across 100+ schools
  (tile 4 RELABELLED — mockup's "renewable energy projects" is wrong,
   contradicted by workbook 09_IMPACT; Swechha has no renewable-energy work)
- Unsplash/Pexels placeholders approved for now. Hero = image only (film later).
- Green the Map → https://www.greenthemap.com/ , opens in NEW TAB.
- Selective-colour photography: build a reusable agent/skill so admins can
  generate these; do not block the build on it.
- Logo: use supplied assets exactly. Never redraw/recreate/substitute.

## Architecture (owner-chosen)
- **Full backend from the start.**
- Host: Vercel. DB: Neon Postgres (free tier; does NOT pause, unlike Supabase).
- Scheduled agents: GitHub Actions cron (free, 5-min granularity, beats the
  hourly requirement; Vercel Hobby cron is capped at 1/day). Keys in GH secrets.
- Data layer must stay host-agnostic (plain Postgres connection string,
  agents runnable from any scheduler).
- Admin auth: Auth.js passwordless email magic link via Resend free tier.
  Roles: admin (full) / editor (content + situations, no source config).

## EI data sources — first build
- **Live:** OpenAQ → Delhi-NCR AQI. NASA FIRMS → wildfire.
- **Honest-static:** Yamuna, heat, extreme rainfall — editor-entered "latest
  published reading" with visible source + date, labelled RECENT/DELAYED,
  never LIVE. (No real-time public Yamuna feed exists; CPCB publishes PDFs.
  Consistent with EI §6.2 "do not fabricate a Yamuna health score".)
- Deferred: news/climate agents (GDELT candidate), IMD scraping (rejected —
  brittle + legally grey).
- CPCB has no stable public API. Do not claim otherwise.

## Conflicts resolved by the priority rule (no owner input needed)
- **Homepage order** → Design Language §9 + sitemap + mockup all agree:
  Hero · NOW · What We're Doing · Stories · Impact · How Change Happens ·
  Farm · Green the Map · About 26yr · Knowledge · Take Action · Footer.
  (EI §32 and workbook 01_HOMEPAGE disagree; both lower priority.)
- **`/explore/media`** (sitemap §5.2) beats workbook's `/media-research`.
- **`/about/reports`** (sitemap §10) beats workbook's `/about/annual-reports`.
- **Newsletter**: embedded/global, no dedicated page (sitemap §10 + mockup footer).
- Footer *labels* come from workbook sheet 16; *URLs* from the sitemap.

## Corrections to earlier claims I made
- `redirects.ts` is an EMPTY array — the ~165 old-WordPress redirects are NOT
  built. Old-site URL mapping is still entirely to do. (165 = 146 posts + 19
  pages, a count of what's NEEDED.)
- No `output: 'export'` in next.config.ts — already a standard Next.js app, so
  adding API routes / DB is an extension, not a rebuild.

## Asset status
- Logos ON DISK: `~/Downloads/swechha-logo-black.png`,
  `~/Downloads/swechha-logo-white-transparent.png` — 2048×512, alpha. Adequate.
- Approved VECTOR sources still available (the PDFs the current colour SVGs were
  built from) → can produce crisp single-colour SVG by recolouring exact
  approved geometry. NEEDS OWNER OK (their logo rule is strict).
- Mustard candidates: #F1C33B, #E4A817 (owner's own Mustard-v2 reference HTML);
  #D5A942 (mockup Take Action band), #C2961F (mockup DONATE button) — sampled.
  Turmeric powder ≈ #E1A32B. **Turmeric source images are NOT on disk** — the
  only turmeric file in ~/Downloads/Images is a different shot. Need the files
  or an owner pick from rendered swatches.

## Preserve from current implementation
- Next.js 16 App Router, TS, Tailwind v4 CSS-first, Zod, gray-matter + marked.
- `lib/status.ts` resolveStatus() — shared lifecycle/severity resolver.
- `liveData.mock: boolean` with NO default — schema-level honesty enforcement.
- DEMO DATA badge contrast fix (5.96:1). Must not regress.
- Three-layer token architecture (primitive → semantic → component).
- `@layer base` cascade discipline + documented bugs in globals.css comments.
- Test posture: 46 tests, tsc clean, Lighthouse a11y/SEO 100.

## Mockup vs document — OWNER RULING 2026-08-18
**The document wins. Diverge from the mockup visibly where they conflict.**
Design Language §16 already ranks doc > mockup; owner confirmed explicitly.
Show each divergence before building it.

Measured mockup breaches of the design language's own rules:
- 6/12 sections are an N-across row of equal items → banned as dominant pattern
  by Internal Pages §3.1. Cap: 2 such rows, both with UNEQUAL cell widths.
- 8/12 sections open with the same eyebrow label + mustard dash → cap at 2.
- ~25 mustard marks vs "must retain its power by being selective" (§3.2)
  → 2 homes only: the DONATE chip + the full-bleed TAKE ACTION flood,
  plus one organic hand-drawn mark per route.
- An underline in every section (2 in the hero) vs §7 "very sparingly".
- Hero AQI gauge = literal red→orange→yellow→green = the "rainbow interface"
  §3.3 forbids; encodes severity by COLOUR ALONE (Internal Pages §20 bans it);
  "HAZARDOUS" measures 3.2:1 on black = FAILS AA.
  → replace with ONE signal colour + the word. Reuse the existing
    `--signal-critical-bright: #ff5c6c` (6.9:1 on near-black) — already correct.
- Hero has no source/timestamp/DEMO label → breaches the hard honesty rule.
  → provenance is a PERMANENT typographic fixture in the condensed face
    (`source · updated HH:MM`), so DEMO is a value in an existing slot, never
    a sticker bolted on later.
- Farm at 50% width beside Green the Map = the "small programme card" §07
  forbids → Farm goes full-bleed, full-viewport. GTM becomes a separate,
  lighter, CONTAINED section on warmer ground (the only contained section).
- Impact is a ~118px strip vs "edge-to-edge presence" + oversized numbers
  → real height, one dominant number, NO icons, full-bleed bg + contained
    inner column (resolves the §05 edge-to-edge/padding contradiction using
    Internal Pages §10's wording).
- Hamburger sits beside a complete desktop nav; ABOUT and SEARCH missing.
  → full nav ≥1024px, hamburger only below.
- Zero asymmetric/overlapping compositions on the whole page → require ≥3.
- No pauses; every section is filled → insert ≥1 near-empty full-viewport
  moment carrying a single line of type.
- Mockup is desktop-only. Design these six at 375px FIRST: oversized numbers,
  the 5-verb row, the 4-metric row, the 6-thumbnail row, the Farm/GTM split,
  the hero side panel.

## REVERSAL 2026-08-18 (later) — owner saw v2 board, rejected the divergence
Owner: *"Something seems to be off in your design. To start with, please
implement the screenshot layout absolutely. Hero and Swechha Now in this style."*
→ **For HERO and SWECHHA NOW, follow the mockup layout literally.** The
"document wins, diverge visibly" ruling no longer applies to these two
sections. Do not re-argue it. Built as
`docs/design/2026-08-18-hero-and-now-mockup-layout.html`.
Mockup layout elements now implemented: 4-line serif headline with TWO mustard
underlines; "SCROLL TO EXPLORE" cue with mouse glyph; right-hand AQI panel with
DELHI NCR / AIR QUALITY, red 347, HAZARDOUS, HEALTH IMPACT + body copy,
outlined SEE THE SITUATION button, and the vertical red→green severity bar with
ticks; black SWECHHA/NOW band with 4 coloured line icons (green waves /
red thermometer / blue rain cloud / mustard flame), each with VIEW →, hairline
dividers, and SEE ALL SITUATIONS + circular arrow at the right.
**Three flagged deviations (told to owner, not silent):**
1. mockup red `#D52B32` = 3.85:1 on the hero ground → fails AA for the small
   HAZARDOUS label. Using `#F1484E` (5.28:1), visually near-identical.
2. ABOUT + SEARCH included per the owner's 7-item ruling; mockup showed 5.
3. Source/timestamp + DEMO DATA line added under the hero — required by the
   owner's own design language §02. Smallest element on screen; movable.
The severity bar is retained: the numeral and the word HAZARDOUS carry the
meaning, so nothing is communicated by colour alone.

## LOGO BUG FOUND + FIXED 2026-08-18 (owner: "seems its slightly off")
The supplied approved PNGs are a 2048x512 (4:1) canvas but the ARTWORK inside
is only 1893x323 = aspect **5.861:1**. Baked-in padding: L 3.9% / R 3.7% /
T 20.3% / B 16.6%. So `height:25px` rendered the logo only ~16px tall (63%)
and pushed it visually low (top padding > bottom).
**Fixed** by cropping to the true ink box (x=79 y=104 w=1893 h=323) →
`public/brand/swechha-white.png` + `swechha-black.png` (3786x646, 2x, zero
padding on all four sides, verified aspect 5.861 both natural and rendered).
Crop done with AppKit via JXA (`scratchpad/crop.js`) because `sips --cropOffset`
silently no-ops on these files and no ffmpeg/ImageMagick/PIL exists on this Mac.
**Always size the logo by the MARK (the square circle-glyph = inkH), not by the
file's canvas height.**

## ui-ux-pro-max pass 2026-08-18 — three additive changes taken
1. **Contextual Live Badge Updates** (High): async values must be ONE atomic
   meaningful status, never a bare number, never competing live regions.
   → numeral + severity are `aria-hidden`; a single `role="status"
   aria-atomic="true"` sentence carries the reading. No `aria-live` on badges.
2. **Icon context**: icon beside visible text = decorative → `aria-hidden="true"`
   (4 NOW icons, warning triangle, arrows, severity bar).
3. **Subtle motion tier**: 320ms, y-offset 12px (reads as fade not slide),
   30ms stagger, reduced-motion honoured. Implemented with CSS +
   IntersectionObserver, NOT GSAP — same spec, no payload, matters for the
   mid-range-Android budget.
   **Critical**: `.js-reveal` is added by JS so default state is VISIBLE
   (no-JS/crawlers get painted content), PLUS a 1.2s `setTimeout` safety net so
   content can never be stuck invisible if IO never fires (zero-height viewport,
   offscreen render, print, headless capture). Verified: 6/6 reveal in a
   zero-viewport pane.

## Owner also likes the FLOWERS hero (field + yellow flowers)
Both hero images now ship in the deliverable behind a review-only toggle:
Delhi smog (real campaign photo) vs Farm/selective-colour (flowers, live SVG
hue-isolation filter). Owner to pick.

## TYPE SYSTEM CHANGE 2026-08-18 — Big Shoulders REPLACED by Archivo
Owner wanted the AQI numeral wider (closer to the mockup). **Big Shoulders has
opsz + wght but NO width axis** — it is condensed by construction and cannot be
widened. Swapped the whole data voice to **Archivo** (variable `wdth` 62–125 +
`wght` 100–900), which serves BOTH registers from one file:
- `wdth 104`, weight 800 → big display numerals (mockup presence)
- `wdth 82`, weight 700 → condensed uppercase micro-labels
Verified the axis really works: "347" at 100px advances 194px @wdth104,
157px @wdth82, 122px @wdth62.
**Net: still three families** (Fraunces / Archivo / Instrument Sans) — Big
Shoulders dropped entirely. Trade-off accepted: loses Big Shoulders' civic-
signage character, gains a width axis and matches the approved mockup.
NOTE for the eventual Hindi work: Archivo has no Devanagari, so the Teko
companion pairing from the type spec still applies to the data voice.

## Rhythm enforced as a score (not per-section judgement)
Four axes — **ground** (photo/black/paper/warm-paper/mustard) ·
**containment** (full-bleed/contained/offset) · **lead** (photo/type/data/
list/object) · **scale** (full-viewport/tall/mid/short).
Each of the 12 sections gets a UNIQUE row; adjacent repeats forbidden;
tallest:shortest non-footer ratio ≥ 3:1. Reviewable — a PR can fail against it.

## Practical constraints surfaced by review
- "5% → 90%" cannot fit at display size on 375px → the condensed numeral voice
  is STRUCTURAL, not stylistic. Range metrics render as two stacked numbers.
- Mustard as TEXT on light paper ≈ 1.6:1 → **mustard is never text on a light
  background.** On near-black it's ~10:1 and legal.
- Animate only the leading number; 4 simultaneous count-ups = 4 focal points.
- NOW atmosphere: static grain/haze + ONE very slow CSS transform (or baked SVG
  turbulence). No requestAnimationFrame particle systems. Init only in view,
  collapse to static under prefers-reduced-motion.
  Budget: LCP < 2.5s on 4G, homepage < ~1.8MB, hero ≤ 200KB AVIF.
- 12 dramatic sections ≈ 7,000–9,000px desktop / 12–14 mobile screens, and
  TAKE ACTION is 11th → add a mid-page action moment ~section 06; treat the
  persistent DONATE chip as the real conversion mechanism.
- Design is calibrated to cinematic imagery Swechha lacks. Need a real
  monochrome recipe (contrast curve, grain, duotone toward WARM black not
  neutral) + an archival register where imperfection reads as document.
  **Test every section against one deliberately poor real photograph.**
- Brand teal/coral/ochre/indigo are unmentioned in the new docs → retire to
  logo-and-footer-signature use only.
- The 5 `--signal-*` tokens + `-bright` on-dark pairs in globals.css are already
  correct and should survive the redesign untouched.

## LOGO — RESOLVED 2026-08-18, no faithful vector possible
Owner asked for vector SVG. Investigated and it CANNOT be done faithfully:
- approved b/w EPS = Illustrator-16 + ASCII85 %AI9_PrivateData, needs Ghostscript
- `high-res rectangle logo swechha-white.ai` IS %PDF-1.5 and converts, but its
  9 paths are clip/mask geometry (render EMPTY); artwork is an embedded
  5001x1452 raster → it's a placed image, not vector
- the 2018 colour vector master converts fine but is a DIFFERENT LOCKUP:
  mark pixel-identical (126px), letters 1.232x larger in the approved lockup,
  but gaps only 1.170x → scale and tracking moved independently, so NO uniform
  transform reproduces it. Matching = re-setting each letter = recreating.
**Canonical assets now in public/brand/:**
`swechha-horizontal-black-approved.png` (2048x512),
`swechha-horizontal-white-approved.png` (2048x512),
`swechha-horizontal-white-approved-6667.png` (6667x1667, found in brand folder).
2048px at ~160px header width = 12x oversampled; fine. Finding is documented in
`scripts/prepare-brand-assets.mjs`. TO GET REAL VECTOR: ask the designer for the
May-2021 rectangle lockup as SVG or PDF.

## Still open
- Exact mustard hex (awaiting owner pick / turmeric file).
- Logo: recoloured vector SVG vs supplied PNG.
- Old-site redirect map (146 posts + 19 pages) — needs the WP REST crawl.
- Which of the 7 workbook metrics appear on /impact vs homepage (homepage = 4, settled).
- Team/Board/Reports/Compliances content — workbook says "Needs inventory".
- Contact details — workbook says "Verify current details".

## TOKEN RULE LEARNED THE HARD WAY 2026-08-19 — `--ink-3` / `--fg-4` are NOT text colours
Three separate sections shipped a contrast failure from the same two tokens before
this was written down: 04's eyebrow (3.01:1), 07's "SWECHHA SINCE" label (3.25:1),
and five elements across the internal-page board (captions, placeholder labels,
the campaign source line, the footer copyright — 3.01 to 4.48:1).
**Rule: `--ink-3` on paper and `--fg-4` on dark are decorative or large-text only.
Small text (anything under ~16px, which is every label, caption and micro-line in
this system) uses `--ink-2` on light and `--fg-3` on dark.** Both of those clear AA
on every ground in the palette. Audit any new section against this before review —
it is the single most repeated defect in the build so far.

## JOURNEYS LANDING PAGE — LOCKED 2026-08-19
`public/design/journeys-landing.html` is the approved design for `/work/journeys`.
Built from the owner's 19-Aug reference after two rejected attempts (an
intro-plus-tile-grid, then an all-caps version).

**Type hierarchy settled here and it applies site-wide:** Fraunces for section
headings, the hero promise and closing statements; Archivo caps for the page
wordmark, card titles and micro-labels; Instrument Sans for body. The owner's
first mockup set every heading in caps, which made the page read as a different
product from the homepage; their second mockup put the serif back, which is the
split the homepage already uses. Do not re-litigate.

**Sections:** big hero → What is a Swechha Journey (GO → EXPERIENCE → QUESTION →
UNDERSTAND → ACT, joined by dotted connectors so it reads as a path, not a
fourth icon grid) → Explore the Journeys (4 cards on black, mustard badge on the
photo edge) → We don't just visit places (5 postures) → Along the way (full-bleed
photo strip, unequal widths, scroll-snaps on mobile) → Who journeys with us (4
audiences) → closing mustard statement → global footer.

**Hero photograph** is owner-supplied and pre-treated (monochrome valley, one
yellow bloom). It carries NO filter class, same rule as the tractor and the
Green the Map tote on the homepage. 747KB at 1536px — needs AVIF/WebP before
launch; the ledger's hero budget is 200KB.

**Bug worth remembering:** lifting the shared shell CSS into a standalone page
by slicing the internal stylesheet copied the header/footer rules but stopped
short of their media queries, so the nav stayed full-width and the footer stayed
five-across at 375px — 164px of horizontal overflow. Any future page assembled
by slicing must carry the shell's responsive block too.

**Open items:** nav and logo follow the approved system, not the mockup (both
flagged to the owner); Gram Anubhav has no sitemap slug; the four card
photographs are stand-ins pending the Drive archive; recommended-but-not-built —
strip the icons from the posture band, and add an impact band and stories row.

**Drive archive is reachable** through the authenticated Google Drive connector
(the old blocker was link-sharing, which does not apply). `Yamuna Yatra (1) -
2023` holds 40+ frames at 2–6MB, and the filenames date that Yatra to 23–30
March 2023. Image BYTES cannot come through the connector at sane cost (base64),
so files must be dropped on disk — `incoming/` exists for that and is gitignored.
