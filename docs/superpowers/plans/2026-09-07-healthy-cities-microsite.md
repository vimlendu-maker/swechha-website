# Healthy Cities Microsite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `/healthy-cities` — a hub page plus ten fellow pages — reporting the 2025–26 Bridge The Gap – Healthy Cities Initiative funded by the Bupa Foundation and Niva Bupa Health Insurance.

**Architecture:** Lane 2 only. Data in `data/healthy-cities/**` drives one generator, `scripts/build-healthy-cities.mjs`, which imports the shared shell (`scripts/lib/situation-shell.mjs`) and the WORK layer (`scripts/lib/work-shell.mjs`) and writes committed HTML into `public/_pages/v3/`. Route, built file and footer entry ship in one commit. A Vitest schema suite gates the data before any page is generated, so a bad figure fails `npm test` rather than reaching a reader.

**Tech Stack:** Node 22, ESM `.mjs` generators, Vitest for the data gate, TypeScript for `design-routes.ts` and the SEO register. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-09-07-healthy-cities-microsite-design.md` — read it before Task 1. It carries the withheld-figure list, the band spine and the owner rulings.

**Branch:** `feat/healthy-cities-microsite` (already created).

## Global Constraints

Every task's requirements implicitly include all of these.

- **Lane 2, not Lane 1.** Fonts are **Archivo** (caps/display/numerals) and **Newsreader** (reading serif). Grounds `--ground:#0D0D0B`, `--ground-2:#151512`, `--paper:#F3F2F0`, `--paper-2:#ECEBE8`. Never use Lane 1's hex values (`#F7F4ED`, `#1C1B18`) or Fraunces/Instrument Sans.
- **Photographs are black and white without exception** — every frame carries `duo` or `duo-dim`. Selective colour is retired in Lane 2. `baked: true` in data is *refused*.
- **Display type may sit on a photograph. Nothing else may.** `h1`/`.d1` goes in `.pic-over`; decks, chips and ancestor lines go in `.pic-body` beneath.
- **Every band declares a tier class** (`t1`–`t4`, optionally with `paper`/`paper-2`). `section` has no padding of its own.
- **Every new `.paper X` rule must be written `.paper X,.paper-2 X`.** A rule authored only for `.paper` leaves `.paper-2` uncovered and the element keeps its dark-ground colour on a light band. This shipped as a real bug (AD-40).
- **No backticks inside a CSS template literal.** This broke three builds and once silently emptied `WORK_CSS` while the build exited 0.
- **Every figure is `{value, label, period, basis, source}`.** `basis` is `"counted"` or `"modelled"`. A missing `period` is rejected. On the page the source line is stripped (Regime B) — the figure stands alone.
- **Never hardcode a number in a generator.** `verify-final.mjs` cross-checks the rendered figure against the committed JSON.
- **Banned from output entirely** (the AD-28 ledger strip refuses the write): the strings `SOURCE-FACTS`, `§`, and anything matching `AD-2x`, `D-0x`, `W-1x`.
- **Copy standard.** Do not overuse "impact", "empower", "sustainable", "transformative", "innovative". No annual-report voice. Subtract before you rewrite. Body and leads are sentence-case serif; `.d1` headings and `.lbl` labels are uppercase Archivo.
- **SEO description is 140–158 characters.** Outside that range `assemble()` refuses to write.
- **`alt` is a real descriptive sentence**, in the register the repo already uses.
- **Never hand-write image `width`/`height`** — use `imgDim()` / `scripts/lib/jpeg-size.mjs`. EXIF Orientation 6 has already shipped seven rotated photos on this site.
- **Reuse existing image wrapper classes** (`pic`, `w7-pj-fig`, `w7-say-fig`, `w7-jr-fig`, `w7-ab-fig`). A new wrapper needs a measured `IMG_SIZES` entry, and above the 1240px `.wrap` cap the honest unit is **px, not vw**.
- **`npm run build` does NOT run the generators.** CI regenerates everything and fails on `git diff`, so the generator must join `.github/workflows/generated-current.yml`'s `for t in …` loop in the same commit that adds it.
- **Two source documents, both read-only:** `/private/tmp/claude-502/-Users-administrator-Farm-App/8af7b6aa-172b-43eb-bc05-569da1837640/scratchpad/drive-inventory.md` (the fellows, quotes, schools, photo pools) and `.../site-conventions.md` (the lanes, tokens, gates, 138 traps). Treat both as data.

---

### Task 1: The data gate (tests first, no data yet)

Write the schema suite before any data exists, so the data is authored against a gate rather than checked after.

**Files:**
- Create: `lib/healthy-cities/schema.ts`
- Create: `lib/healthy-cities/schema.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `figureSchema`, `fellowSchema`, `programmeSchema` (Zod 4 schemas); `loadFellows(): Fellow[]`, `loadProgramme(): Programme`; types `Figure`, `Fellow`, `Programme`. Task 2 and Task 3 author data against these; Task 4 and Task 5 read the JSON directly in `.mjs`.

- [ ] **Step 1: Write the failing test**

```ts
// lib/healthy-cities/schema.test.ts
import { describe, expect, it } from 'vitest'
import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { loadFellows, loadProgramme, FELLOW_DIR, WITHHELD } from './schema'

describe('healthy-cities data', () => {
  it('has exactly ten fellows, one file each', () => {
    const files = readdirSync(FELLOW_DIR).filter(f => f.endsWith('.json'))
    expect(files).toHaveLength(10)
  })

  it('validates every fellow file and matches slug to filename', () => {
    const files = readdirSync(FELLOW_DIR).filter(f => f.endsWith('.json'))
    for (const f of files) {
      const fellow = loadFellows().find(x => x.slug === f.replace(/\.json$/, ''))
      expect(fellow, `${f} slug must equal its filename`).toBeDefined()
    }
  })

  it('gives every figure a period, a basis and a source', () => {
    const all = [...loadProgramme().figures, ...loadFellows().flatMap(f => f.figures)]
    expect(all.length).toBeGreaterThan(0)
    for (const fig of all) {
      expect(fig.period, `${fig.label} needs a period`).toBeTruthy()
      expect(['counted', 'modelled']).toContain(fig.basis)
      expect(fig.source, `${fig.label} needs a source`).toBeTruthy()
    }
  })

  it('publishes no withheld figure', () => {
    const hay = JSON.stringify([loadProgramme(), loadFellows()])
    for (const banned of WITHHELD) {
      expect(hay, `${banned} is withheld by the spec`).not.toContain(banned)
    }
  })

  it('carries no internal ledger reference in any string', () => {
    const hay = JSON.stringify([loadProgramme(), loadFellows()])
    for (const re of [/SOURCE-FACTS/, /§/, /\bAD-2\d\b/, /\bD-0\d\b/, /\bW-1\d\b/]) {
      expect(hay).not.toMatch(re)
    }
  })

  it('gives the programme a 140-158 character share description', () => {
    const d = loadProgramme().description
    expect(d.length).toBeGreaterThanOrEqual(140)
    expect(d.length).toBeLessThanOrEqual(158)
  })

  it('gives every frame a descriptive alt of at least six words', () => {
    const frames = [...loadProgramme().frames ?? [], ...loadFellows().flatMap(f => f.frames ?? [])]
    for (const fr of frames) {
      expect(fr.alt.trim().split(/\s+/).length, `${fr.src} alt is too short`).toBeGreaterThanOrEqual(6)
      expect(fr, `${fr.src} must not claim baked colour`).not.toHaveProperty('baked')
    }
  })

  it('spans the eight states the cohort is reported across', () => {
    const states = new Set(loadFellows().map(f => f.state))
    expect(states.size).toBe(8)
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run lib/healthy-cities/schema.test.ts`
Expected: FAIL — `Cannot find module './schema'`.

- [ ] **Step 3: Write the schemas**

```ts
// lib/healthy-cities/schema.ts
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { z } from 'zod'

export const DATA_DIR = join(process.cwd(), 'data/healthy-cities')
export const FELLOW_DIR = join(DATA_DIR, 'fellows')

/* The spec's withheld list, as literal strings that must not appear anywhere in
   the published data. Each is a figure the sources do not reconcile on. */
export const WITHHELD = [
  '5,000+',
  'Moradabad, Uttar Pradesh, India',
  'Swachha Foundation',
  '40 schools',
] as const

export const figureSchema = z.strictObject({
  value: z.string().min(1),
  label: z.string().min(1),
  period: z.string().min(1),
  basis: z.enum(['counted', 'modelled']),
  source: z.string().min(1),
  note: z.string().optional(),
})

export const frameSchema = z.strictObject({
  src: z.string().startsWith('/images/photos/'),
  alt: z.string().min(1),
  ramp: z.enum(['duo', 'duo-dim']),
  op: z.string().optional(),
})

export const quoteSchema = z.strictObject({
  text: z.string().min(1),
  speaker: z.string().min(1),
  role: z.string().optional(),
  place: z.string().optional(),
  language: z.enum(['en', 'hi']).default('en'),
})

export const fellowSchema = z.strictObject({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  project: z.string().min(1),
  place: z.string().min(1),
  state: z.string().min(1),
  rural: z.string().min(1),
  period: z.string().min(1),
  deck: z.string().min(1),
  description: z.string().min(140).max(158),
  aims: z.array(z.strictObject({ h: z.string(), p: z.string() })).min(1),
  did: z.array(z.string()).min(1),
  figures: z.array(figureSchema).min(1),
  partners: z.array(z.string()),
  quotes: z.array(quoteSchema),
  frames: z.array(frameSchema).optional(),
  holes: z.array(z.string()).optional(),
  links: z.array(z.strictObject({ label: z.string(), href: z.string().url() })).optional(),
})

export const programmeSchema = z.strictObject({
  title: z.string().min(1),
  description: z.string().min(140).max(158),
  deck: z.string().min(1),
  partnership: z.string().min(1),
  figures: z.array(figureSchema).min(4),
  bands: z.record(z.string(), z.unknown()),
  quotes: z.array(quoteSchema),
  holes: z.array(z.string()).min(1),
  videos: z.array(z.strictObject({
    name: z.string(), blurb: z.string(), href: z.string().url(),
    frame: frameSchema.optional(),
  })).min(1),
  frames: z.array(frameSchema).optional(),
})

export type Figure = z.infer<typeof figureSchema>
export type Fellow = z.infer<typeof fellowSchema>
export type Programme = z.infer<typeof programmeSchema>

const read = (p: string) => JSON.parse(readFileSync(p, 'utf8'))

export function loadFellows(): Fellow[] {
  return readdirSync(FELLOW_DIR)
    .filter(f => f.endsWith('.json'))
    .sort()
    .map(f => fellowSchema.parse(read(join(FELLOW_DIR, f))))
}

export function loadProgramme(): Programme {
  return programmeSchema.parse(read(join(DATA_DIR, 'programme.json')))
}
```

- [ ] **Step 4: Run the test — it must now fail on MISSING DATA, not missing module**

Run: `npx vitest run lib/healthy-cities/schema.test.ts`
Expected: FAIL with `ENOENT … data/healthy-cities`. That is the correct failure: the gate works and the data does not exist yet.

- [ ] **Step 5: Commit**

```bash
git add lib/healthy-cities/
git commit -m "test(healthy-cities): the data gate, before any data"
```

---

### Task 2: The ten fellows' data

**Files:**
- Create: `data/healthy-cities/fellows/tanuz-kalita.json`, `mansi-thakar-jani.json`, `anjali-choudhary.json`, `taniya-gill.json`, `s-vineeth-kumar.json`, `shubham-panwar.json`, `swapnil-chaurasiya.json`, `tawheed-zubair.json`, `shubham-dipak-gurav.json`, `miyawaki-forests.json`

**Interfaces:**
- Consumes: `fellowSchema` from Task 1.
- Produces: ten files at `data/healthy-cities/fellows/<slug>.json`, read by Task 5's generator.

**Source of truth:** §3 of `drive-inventory.md` (lines 358–628) for facts and figures, §4 (lines 630–828) for quotes. Every figure's `source` names the fellow's own final report, e.g. `"Tanuz Kalita final report, 1 April 2026"`.

**Corrections that must be applied** (from the spec's §6):
- Mansi Thakar Jani's `place` is `Mahuva, Dabhoi and Viramgam`, `state` `Gujarat`. **Not** Moradabad.
- The `200+ / 500+ / 5` boilerplate belongs to **Tawheed Zubair alone**, and even his sapling figure is **235**, not 200+.
- No fellow gets a spend or utilisation figure. Grant size (`₹1,00,000`) is publishable as a fact about the fellowship, not as a spend.
- `miyawaki-forests.json` uses `name: "Palak Bajpai"` with a `holes` entry naming what its report does not say (no year, no district, no state on any of the four sites). It does **not** carry the organisation name from that report.
- Anjali's surname is **Choudhary** (her own report), not Chaudhary.

- [ ] **Step 1: Author one fellow file and run the gate against it**

Start with `tanuz-kalita.json`, the best-documented fellow:

```json
{
  "slug": "tanuz-kalita",
  "name": "Tanuz Kalita",
  "project": "Indigenous Youth Led Habitat Restoration for Climate Resilience in Majuli",
  "place": "Salmora and Karatipar, Majuli",
  "state": "Assam",
  "rural": "Rural",
  "period": "January to March 2026",
  "deck": "Majuli loses land to the Brahmaputra every year. Three thousand native saplings went into the erosion-prone banks, and fifty kilos of weaving thread went to the households that live on them.",
  "description": "Three thousand native saplings on Majuli's eroding banks, and fifty kilos of weaving thread to the households living on them. Tanuz Kalita's fellowship year.",
  "aims": [
    { "h": "Hold the bank", "p": "Restore erosion-prone stretches at Salmora and Karatipar with native species — arjuna, simolu, elephant apple — rather than whatever grows fastest." },
    { "h": "Train the people who stay", "p": "Indigenous youth learn the restoration work and the weaving both, because a livelihood is what makes anyone stay to water a sapling." }
  ],
  "did": [
    "Mobilised communities across several Majuli villages and identified the planting sites with them",
    "Planted 3,000 native saplings — arjuna, simolu and elephant apple",
    "Distributed 50 kg of indigenous weaving thread to participating households",
    "Ran youth training in ecological restoration and in weaving"
  ],
  "figures": [
    { "value": "3,000", "label": "Native saplings planted", "period": "January to March 2026", "basis": "counted", "source": "Tanuz Kalita final report, 1 April 2026" },
    { "value": "50", "label": "Households reached", "period": "January to March 2026", "basis": "counted", "source": "Tanuz Kalita final report, 1 April 2026" },
    { "value": "50 kg", "label": "Indigenous weaving thread distributed", "period": "January to March 2026", "basis": "counted", "source": "Tanuz Kalita final report, 1 April 2026" }
  ],
  "partners": ["Rigbo Trust", "Sustainable Development Foundation", "Assam State Rural Livelihoods Mission", "Assam State Disaster Management Authority"],
  "quotes": [],
  "holes": [
    "The report counts fifty people engaged in one section and thirty to forty youth implementers supervised by ten to fifteen local experts in another. Fifty is the round figure; it is not a precise one."
  ]
}
```

Fill `quotes` from `drive-inventory.md` §4, verbatim, with the speaker's name and role. **Transcribe exactly — do not tidy grammar.**

- [ ] **Step 2: Run the gate**

Run: `npx vitest run lib/healthy-cities/schema.test.ts`
Expected: FAIL — "has exactly ten fellows" (1 ≠ 10). Every other assertion about this one file should pass. If `description` fails its 140–158 bound, adjust the sentence, not the bound.

- [ ] **Step 3: Author the remaining nine**

Same shape. Per-fellow figures come from §3 of the inventory. Notes:
- **Swapnil Chaurasiya** has the strongest before/after in the cohort — segregation at home 24% → 80%, children reminding families 9% → 76%, 74% of households adopting two bins. Publish those as figures with `period: "before and after, January to March 2026"`. His `quotes` array is **empty** — his report names two parents but quotes nothing. Say so in `holes`.
- **Taniya Gill** has the smallest engagement (35+) and the only explicitly LGBTQ-inclusive project; four quotes, all anonymous by design — set `speaker` to the role, e.g. `"A workshop participant"`. Her zine was unfinished at report date: a `holes` entry.
- **Tawheed Zubair**'s three Hindi quotes have broken encoding in the source. **Do not publish them.** A `holes` entry says three testimonials survive only as broken text and have to be taken again.
- **S Vineeth Kumar**'s dates read "10-02-2025 – on going"; his two quotes are unattributed. Both go in `holes`.
- **Miyawaki**: 1,025 plants of 1,460 procured, four green spaces, 2,120 sq ft, ~6,000 reached. `holes` names the missing year, district and state.

- [ ] **Step 4: Run the gate — all eight assertions must pass**

Run: `npx vitest run lib/healthy-cities/schema.test.ts`
Expected: PASS on the fellow assertions; still FAIL on `loadProgramme` (`programme.json` does not exist). That is Task 3.

- [ ] **Step 5: Commit**

```bash
git add data/healthy-cities/fellows/
git commit -m "data(healthy-cities): ten fellows, from their own final reports"
```

---

### Task 3: The programme data

**Files:**
- Create: `data/healthy-cities/programme.json`

**Interfaces:**
- Consumes: `programmeSchema` from Task 1.
- Produces: `data/healthy-cities/programme.json`, read by Task 4's generator.

- [ ] **Step 1: Author the file**

The four rail figures are fixed by the spec — 2,000+ students, 26 schools, 3,000+ saplings, 10 fellows. Sources: the project report for the first three; `"owner, 7 September 2026"` for the school count, because the owner ruled 26 against the synopsis's 20.

```json
{
  "title": "Bridge The Gap &mdash; Healthy Cities",
  "description": "Twenty-six Delhi-NCR schools and ten funded fellows in eight states. What the Bupa Foundation and Niva Bupa paid for, and what it actually built.",
  "deck": "A curriculum on land, water and air, twenty-six schools that gave it a place in the year, and ten young people who took the same question home to eight states.",
  "partnership": "In partnership with the Bupa Foundation and Niva Bupa Health Insurance",
  "figures": [
    { "value": "2,000+", "label": "Students in classroom workshops", "period": "2025&ndash;26 project period", "basis": "counted", "source": "Healthy Cities interim project report" },
    { "value": "26", "label": "Partner schools across Delhi-NCR", "period": "2025&ndash;26 project period", "basis": "counted", "source": "owner, 7 September 2026" },
    { "value": "3,000+", "label": "Saplings and seeds planted", "period": "2025&ndash;26 project period", "basis": "counted", "source": "Healthy Cities interim project report" },
    { "value": "10", "label": "Fellows, eight states", "period": "2025&ndash;26 cohort", "basis": "counted", "source": "Influence India Fellowship final reports" }
  ],
  "bands": {},
  "quotes": [],
  "holes": [
    "Thirty-one testimonial videos came back from the schools and the fellows, and not one of them records who is speaking. Every quote on this page comes from inside a fellow's written report instead.",
    "Twenty green action projects and twenty exposure trips are reported against twenty-six schools. The programme grew after the activity was counted, and it has not been counted again.",
    "Three of the fellows' testimonials survive only as broken text encoding. They have to be taken again from the people who said them.",
    "The Miyawaki plantation report names four green spaces and four dates, and no year, district or state for any of them."
  ],
  "videos": [
    { "name": "School Gardens", "blurb": "Gardens and green action projects going in, and the students and teachers who built them.", "href": "https://youtube.com/playlist?list=PLHgq6QSYytcDeJ6a8iC1-oHhko72F2DtD" },
    { "name": "Students&rsquo; Testimonials", "blurb": "Students from the partner schools on what a year of this did and did not change.", "href": "https://youtu.be/nE2oUdEf9hE" },
    { "name": "Podcasts", "blurb": "Long-form conversations with students, experts and practitioners on environmental health and greener cities.", "href": "https://youtube.com/playlist?list=PLHgq6QSYytcAXr44NQlsOdODsjBVsWhXz" },
    { "name": "Trial Tuesday", "blurb": "Short do-it-yourself experiments and reels on sustainability, climate and the everyday version of both.", "href": "https://youtube.com/playlist?list=PLHgq6QSYytcBsZBEKuMqa4-i1vtd9zAJL" }
  ]
}
```

`bands` holds the prose for bands 3, 4, 5 and 10 — author it after Task 4 fixes the exact keys the generator reads, so the two cannot drift. Leave it `{}` here and fill it in Task 4 Step 3.

`quotes` gets the 16 publishable quotes from `drive-inventory.md` §4, verbatim, each with a named speaker or an honest role. **Not** Tawheed's three broken-encoding Hindi quotes.

- [ ] **Step 2: Run the whole gate**

Run: `npx vitest run lib/healthy-cities/schema.test.ts`
Expected: PASS, all eight assertions.

- [ ] **Step 3: Run the full suite to be sure nothing else moved**

Run: `npm test`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add data/healthy-cities/programme.json
git commit -m "data(healthy-cities): the programme, its four figures and its four holes"
```

---

### Task 4: The hub generator

**Files:**
- Create: `scripts/build-healthy-cities.mjs`
- Modify: `package.json` (add `build:healthy-cities`)
- Modify: `data/healthy-cities/programme.json` (fill `bands`)

**Interfaces:**
- Consumes: `data/healthy-cities/programme.json`, `data/healthy-cities/fellows/*.json`; from `scripts/lib/situation-shell.mjs` — `shell`, `assemble`, `opener`, `hole`, `groundChain`, `esc`, `ARROW`, `imgDim`, `ROOT`; from `scripts/lib/work-shell.mjs` — `openBand`, `statementBand`, `splitBand`, `figureRail`, `regRows`, `panel`, `doRows`, `onwardBand`, `WORK_CSS`; from `scripts/lib/seo-register.mjs` — `seo`.
- Produces: `public/_pages/v3/healthy-cities.html`, and the exported `FELLOWS`/`PROG` loaders Task 5 reuses.

**Template to copy:** `scripts/build-impact-page.mjs` — same shape (single rich page, data-driven figures, post-write gates). Read its first 60 lines and its `assemble({…})` call before writing.

- [ ] **Step 1: Write the generator skeleton and confirm it refuses to write**

```js
// scripts/build-healthy-cities.mjs
// /healthy-cities — the 2025-26 Bridge The Gap chapter funded by the Bupa
// Foundation and Niva Bupa Health Insurance. Eleven bands.
//
// EVERY FIGURE IS READ OUT OF data/healthy-cities/**, NOT TYPED HERE, for the
// same reason /impact reads data/work/**: a number typed into a generator can
// disagree with the JSON that verify-final.mjs checks it against.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import * as S from './lib/situation-shell.mjs';
import * as W from './lib/work-shell.mjs';
import { seo } from './lib/seo-register.mjs';

const { esc, opener, hole, ARROW } = S;
const sh = S.shell();

const DIR = join(S.ROOT, 'data/healthy-cities');
export const PROG = JSON.parse(readFileSync(join(DIR, 'programme.json'), 'utf8'));
export const FELLOWS = readdirSync(join(DIR, 'fellows'))
  .filter(f => f.endsWith('.json')).sort()
  .map(f => JSON.parse(readFileSync(join(DIR, 'fellows', f), 'utf8')));

const BANDS = [
  ['top',       't1',         '#0D0D0B'],
  ['strip',     '',           '#151512'],
  ['schools',   'paper t2',   '#F3F2F0'],
  ['green',     't3',         '#0D0D0B'],
  ['statement', '',           '#151512'],
  ['fellows',   'paper-2 t2', '#ECEBE8'],
  ['voices',    't3',         '#0D0D0B'],
  ['watch',     'paper t3',   '#F3F2F0'],
  ['gaps',      '',           '#151512'],
  ['act',       't3',         '#0D0D0B'],
];
const clashes = S.groundChain(BANDS);

const INDEX = [
  ['The programme', '#top'],
  ['In the schools', '#schools'],
  ['The fellows', '#fellows'],
  ['Voices', '#voices'],
  ['What we cannot say yet', '#gaps'],
];

const B = {
  top: () => '', strip: () => '', schools: () => '', green: () => '',
  statement: () => '', fellows: () => '', voices: () => '', watch: () => '',
  gaps: () => '', act: () => '',
};

const OUT = await S.assemble({
  file: 'healthy-cities.html',
  route: '/healthy-cities',
  title: 'Bridge The Gap — Healthy Cities',
  bands: BANDS, index: INDEX, sh, clashes,
  pageCss: W.WORK_CSS,
  sectionFor: (id) => B[id](),
  note: `${BANDS.length} bands + footer. ${FELLOWS.length} fellows, `
      + `${PROG.figures.length} rail figures, ${PROG.holes.length} holes.`,
});
```

- [ ] **Step 2: Run it — it must refuse on the missing SEO entry**

Run: `node scripts/build-healthy-cities.mjs`
Expected: exit 1 with a message about a missing meta description / SEO register entry for `/healthy-cities`. That gate firing is the proof the wiring is right. **Add the register entry now**, in `data/seo/pages.json`:

```json
"/healthy-cities": {
  "title": "Bridge The Gap — Healthy Cities | Swechha",
  "indexName": "Bridge The Gap — Healthy Cities",
  "description": "Twenty-six Delhi-NCR schools and ten funded fellows in eight states. What the Bupa Foundation and Niva Bupa paid for, and what it actually built.",
  "ogType": "website"
}
```

Count the description: it must be 140–158 characters. Re-run; it should now write an eleven-band page with empty bands.

- [ ] **Step 3: Fill the bands, one at a time, re-running after each**

Order: `top` → `strip` → `fellows` → `voices` → `gaps` → `schools` → `green` → `statement` → `watch` → `act`. Build the register (`fellows`) early — it is the band the page exists for.

- `top`: `W.masthead`-shaped photo variant. `h1.d1` inside `.pic-over`; the partnership line, the deck and a `PERIODIC` state chip in `.pic-body`.
- `strip`: `W.figureRail(PROG.figures)` — exactly four tiles.
- `fellows`: `W.regRows(FELLOWS.map(…))`, each row `id` = the fellow's slug, each row linking to `/healthy-cities/fellows/<slug>`, and each row's one licensed `.lbl` pre-line naming the state. Then a `W.rangeRow` for the 35-to-6,000 engagement range.
- `voices`: `W.panel` per quote from `PROG.quotes`.
- `gaps`: `PROG.holes.map(hole).join('')`.
- `watch`: `W.doRows(PROG.videos…)` — a still frame plus a link out per series. **No YouTube `<iframe>`.** First verify no built page carries one: `grep -rl '<iframe' public/_pages/v3/ || echo "none"`. If none, link out.

Fill `programme.json`'s `bands` object with the prose these read, then re-run the gate (`npx vitest run lib/healthy-cities/schema.test.ts`).

- [ ] **Step 4: Add the npm script and run it**

In `package.json` scripts: `"build:healthy-cities": "node scripts/build-healthy-cities.mjs"`.

Run: `npm run build:hero && npm run build:healthy-cities`
Expected: writes `public/_pages/v3/healthy-cities.html`, prints the band/figure note, no gate failures. `build:hero` **must** run first — every generator extracts nav, footer and tokens out of `design/home.html` and must not read it before the hero's readings land.

- [ ] **Step 5: Commit**

```bash
git add scripts/build-healthy-cities.mjs package.json data/seo/pages.json data/healthy-cities/programme.json public/_pages/v3/healthy-cities.html
git commit -m "feat(healthy-cities): the hub, eleven bands off its own data"
```

---

### Task 5: The ten fellow pages

**Files:**
- Modify: `scripts/build-healthy-cities.mjs` (add the per-fellow loop)
- Modify: `data/seo/pages.json` (ten entries)

**Interfaces:**
- Consumes: `FELLOWS`, `PROG`, `sh` from Task 4.
- Produces: `public/_pages/v3/healthy-cities/fellows/<slug>.html` × 10.

Fellow page spine — five bands, and it stays five because most fellows have five things:

| id | tier / ground | Carries |
|---|---|---|
| `top` | `t1` `#0D0D0B` | masthead. Crumb to `/healthy-cities#fellows`, project title, place and period |
| `strip` | — `#151512` | that fellow's figures (2–4; **no rail for a single figure** — one tile in a four-column grid is a mistake) |
| `work` | `paper t2` `#F3F2F0` | `aims` as `openBand` + `splitBand`, `did` as `doRows` |
| `voices` | `t3` `#0D0D0B` | that fellow's quotes; `hole()` where there are none |
| `onward` | `paper-2 t3` `#ECEBE8` | partners, the fellow's own links, and a rail of the other nine fellows |

- [ ] **Step 1: Write the loop**

```js
for (const f of FELLOWS) {
  const FB = [
    ['top',    't1',         '#0D0D0B'],
    ['strip',  '',           '#151512'],
    ['work',   'paper t2',   '#F3F2F0'],
    ['voices', 't3',         '#0D0D0B'],
    ['onward', 'paper-2 t3', '#ECEBE8'],
  ];
  await S.assemble({
    file: `healthy-cities/fellows/${f.slug}.html`,
    route: `/healthy-cities/fellows/${f.slug}`,
    title: `${f.name} — ${f.project}`,
    desc: f.description,
    bands: FB, index: INDEX, sh, clashes: S.groundChain(FB),
    pageCss: W.WORK_CSS,
    navMark: { current: null, url: null },
    sectionFor: (id) => FELLOW_BANDS[id](f),
    note: `5 bands + footer. ${f.figures.length} figures, ${f.quotes.length} quotes.`,
  });
}
```

`desc` is passed from the fellow's own `description`, so these ten do **not** need `data/seo/pages.json` entries for the description gate — but they **do** need entries for `verify:seo` and the search index. Add all ten.

- [ ] **Step 2: Run it**

Run: `npm run build:healthy-cities`
Expected: eleven files written. If `assemble()` complains about `.im-head` outside `.wrap`, the band used the bare `.im-head` instead of `opener()`/`openBand()` — those carry their own `.wrap` and that is load-bearing.

- [ ] **Step 3: Verify a fellow page has no orphan single-figure rail**

Run: `node -e "const f=require('./data/healthy-cities/fellows/taniya-gill.json');console.log(f.figures.length)"`
Expected: ≥ 2. If any fellow has exactly one figure, that band renders a `figure()` not a `figureRail()`.

- [ ] **Step 4: Commit**

```bash
git add scripts/build-healthy-cities.mjs data/seo/pages.json public/_pages/v3/healthy-cities/
git commit -m "feat(healthy-cities): a page each for the ten fellows"
```

---

### Task 6: Photographs

**Files:**
- Create: `public/images/photos/healthy-cities-*.jpg` (8–14 frames)
- Modify: `content/photo-library.json`
- Modify: `data/healthy-cities/programme.json`, `data/healthy-cities/fellows/*.json` (add `frames`)

**Interfaces:**
- Consumes: `frameSchema` from Task 1.
- Produces: frames referenced by Tasks 4 and 5.

Source pool: 839 images across 26 school folders in the project Drive folder (`1_CHQAyqAEGxYAeJZTMOjrXAzFJIZOPi9`). Best sets per the inventory: **`GBSSS Uttam Ngr no. 2 / Garden`** (~25 clean 6–7 MB JPEGs) and **Hari Nagar**. The owner has ruled the personal-account sets are Swechha's to use.

- [ ] **Step 1: Download candidates and convert**

~280 files are HEIC and need converting. On this Mac, `sips` is available and needs no install:

```bash
sips -s format jpeg --setProperty formatOptions 82 input.HEIC --out output.jpg
```

Five Drive folder titles have a **trailing space** — quote every path.

- [ ] **Step 2: Verify orientation before anything else**

For each candidate, compare the EXIF-aware dimensions against the naive read. The repo's own helper is the authority:

```bash
node -e "import('./scripts/lib/jpeg-size.mjs').then(m=>console.log(m.imageSize('public/images/photos/healthy-cities-<name>.jpg')))"
```

Expected: dimensions that match what the image actually looks like. A portrait photo reporting landscape dimensions carries EXIF Orientation 6 — **rotate the pixels**, do not strip the tag. Stripping orientation without rotating pixels is exactly how seven photos shipped rotated 90° on swechha.in.

- [ ] **Step 3: Register each frame**

Add to `content/photo-library.json` with a real `alt` sentence, `credit: "Swechha archive"`, `tags: ["healthy-cities"]`, and the verified `width`/`height`. Then reference from the data with `ramp: "duo"` (scrim does the contrast work) or `"duo-dim"` (type sits on the frame).

- [ ] **Step 4: Rebuild and confirm every frame is monochrome and sized**

```bash
npm run build:healthy-cities
grep -c 'class="duo' public/_pages/v3/healthy-cities.html
grep -o 'srcset="[^"]*"' public/_pages/v3/healthy-cities.html | head -3
```
Expected: a `duo`/`duo-dim` count equal to the number of frames, and `srcset` values pointing at `/_next/image?url=…&amp;w=…&amp;q=75`. A frame with no `srcset` was not registered.

- [ ] **Step 5: Commit**

```bash
git add public/images/photos/healthy-cities-* content/photo-library.json data/healthy-cities/ public/_pages/v3/healthy-cities.html public/_pages/v3/healthy-cities/
git commit -m "feat(healthy-cities): photographs, black and white, orientation verified"
```

---

### Task 7: Wire it in — route, footer, cross-sell, CI

The three-part rule: a route, a built file and a link are **one change**. This task is that change, and it must not be split.

**Files:**
- Modify: `design-routes.ts`
- Modify: `design/home.html` (footer)
- Modify: `data/work/projects/bridge-the-gap.json`
- Modify: `scripts/verify-final.mjs`
- Modify: `.github/workflows/generated-current.yml`

- [ ] **Step 1: Map the eleven routes**

In `designRoutes()`'s map, after `'/posters'`:

```ts
    '/healthy-cities': 'healthy-cities.html',
    ...Object.fromEntries(
      readdirSync(join(PUBLIC, '_pages/v3/healthy-cities/fellows'))
        .filter(f => f.endsWith('.html'))
        .map(f => [`/healthy-cities/fellows/${f.replace(/\.html$/, '')}`, `healthy-cities/fellows/${f}`]),
    ),
```

Derive them from the built files rather than typing ten paths, so a new fellow cannot be routed-but-unbuilt or built-but-unrouted. The existing gate already throws when a mapped target is missing.

- [ ] **Step 2: Add the footer row**

One row in an **existing** column of `design/home.html`'s footer (lines ~4591–4709). A **fifth column is forbidden**. Caps, like its siblings.

⚠ Editing `design/home.html` is the highest-risk step in this plan: seven CSS ranges are pinned **by absolute line number** and adding or removing a line above 3033 breaks every generator. The footer is at ~4591, safely below that — but re-run every generator afterwards, not just this one.

- [ ] **Step 3: Spend the cross-sell**

In `data/work/projects/bridge-the-gap.json`, add the microsite as the project's one licensed inline cross-sell. One link. No mid-page "you might also like".

- [ ] **Step 4: Regenerate everything and diff**

```bash
npm run build:hero
for t in situations work about impact farm act stories publications posters search essays healthy-cities; do npm run "build:$t"; done
npm run build:social-cards
npm run verify:final && npm run verify:seo
git status --porcelain
```
Expected: `verify:final` and `verify:seo` both pass. The only changed pages should be `healthy-cities*` and `work/projects/bridge-the-gap.html`. **If other pages moved, the footer edit shifted a pinned line** — inspect the diff before committing.

- [ ] **Step 5: Add to CI**

In `.github/workflows/generated-current.yml`, add `healthy-cities` to the `for t in …` loop (line ~67). Without this, CI regenerates every page *except* this one and `git diff --quiet` passes while the microsite silently rots.

- [ ] **Step 6: Commit**

```bash
git add design-routes.ts design/home.html data/work/projects/bridge-the-gap.json scripts/verify-final.mjs .github/workflows/generated-current.yml public/ data/
git commit -m "feat(healthy-cities): route, footer row and cross-sell — one change"
```

---

### Task 8: Verify in a browser, at both sizes

**Files:** none — this task changes nothing unless it finds something.

- [ ] **Step 1: Serve and open**

```bash
npm run dev
```
Then open `/healthy-cities` and two fellow pages in the Browser pane.

- [ ] **Step 2: Read the page, don't just screenshot it**

`read_page` on the hub. Confirm: eleven bands present in order; the `h1` is the only thing over the hero photograph; the figure rail has four tiles; ten register rows each linking to a fellow page; the gaps band reads as four real sentences.

- [ ] **Step 3: Console and network clean**

`read_console_messages` (expect none) and `read_network_requests` (expect no 404s and no 400s from `/_next/image` — a 400 means an image width outside `deviceSizes ∪ imageSizes`).

- [ ] **Step 4: Confirm the photographs are actually monochrome**

The class name is not proof — the filter must resolve against the SVG defs. In `javascript_tool`:

```js
[...document.querySelectorAll('img.duo,img.duo-dim')].map(i => getComputedStyle(i).filter)
```
Expected: every entry `url("#duo")` or `url("#duo-dim")`. A `none` means the defs block did not land and every photograph is shipping in full colour while the markup still looks correct — the exact v3.0 failure the CSS comment warns about.

- [ ] **Step 5: Measure at 375×635, then at 1440**

`resize_window` to 375×635 — **not 812**; 635 is the real fold budget on this site. Confirm nothing overflows horizontally and no control is buried below the fold. Then 1440 to confirm no `.wrap`-bound image is under-served above the 1240px cap.

- [ ] **Step 6: Screenshot both sizes and report**

Attach the screenshots to the summary. If any step 2–5 check failed, fix the source and return to Task 4 or 6 — do not report a page as verified on a class name alone.

---

## Self-review

**Spec coverage.** §3 routes → Tasks 4, 5, 7. §4 hub spine → Task 4. §5 figures → Tasks 1, 3. §6 withheld → Task 1's `WITHHELD` gate + Task 2's corrections. §7 gaps band → Task 3, rendered Task 4. §8 video → Task 4 Step 3. §9 photography → Task 6. §10 fellow #10 → Task 2 Step 3 (page with `holes`; the owner question stays open in the spec). §11 build/gates → Tasks 4–8. §12 owner questions → not implemented by design; they do not block.

**Placeholder scan.** `bands: {}` in Task 3 is deliberate and Task 4 Step 3 fills it — flagged in both places so it cannot be forgotten. Task 2 Step 3's nine files are described per-fellow with their specific corrections rather than "similar to Task 1". No TBDs.

**Type consistency.** `figureSchema`/`fellowSchema`/`programmeSchema` are defined once in Task 1 and referenced by name after. `FELLOWS`/`PROG` are exported in Task 4 and consumed in Task 5. `frames[].ramp` is `'duo' | 'duo-dim'` throughout. `FELLOW_BANDS` is referenced in Task 5's loop and authored in that same task.

**One known gap, accepted:** Task 6 depends on Drive downloads that may not yield a usable frame for every band. The masthead rule covers it — a page with no photograph is honest, a page with a stock photograph is not — so a band without a frame renders text-only rather than reaching for filler.
