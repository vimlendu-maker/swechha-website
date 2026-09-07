# Bridge The Gap — Healthy Cities: microsite design

**Date:** 2026-09-07
**Status:** approved in chat, pending spec review
**Route:** `/healthy-cities` + `/healthy-cities/fellows/<slug>` × 10
**Lane:** Lane 2 (generator → committed HTML), not the Tailwind app

---

## 1. What this is

A microsite for the **Bridge The Gap – Healthy Cities Initiative**, the
2025–26 chapter of Bridge the Gap funded by **the Bupa Foundation and Niva
Bupa Health Insurance**. Two halves: a schools programme across Delhi-NCR,
and the **Influence India Fellowship** — ten funded fellows working in eight
states.

Audience is partner-weighted: it opens on people and closes on evidence, and
every figure on it is one Swechha can stand behind. Niva Bupa should be able
to read it as an account of what their money did; a journalist landing cold
should be able to read it as a story.

## 2. What this is NOT

Three pages already on the site cover ground this microsite touches, and it
must not re-tell any of them:

| Existing page | Covers | This microsite's relationship |
|---|---|---|
| `/work/projects/bridge-the-gap` | the 25-year Delhi curriculum, 3M+ reached, all funders | the **programme**. This microsite is one funded chapter of it. |
| `/work/projects/influence` | the fellowship as a standing programme, 10 fellows/year | the **mechanism**. This microsite is one cohort of it. |
| `/work/journeys/cityscapes` | the exposure-trip format | the **method**. This microsite reports 20 of them. |

So the microsite carries: this cohort's ten named projects, this period's
school activity, this partnership. It does not restate the curriculum's
history, the fellowship's design, or what an exposure trip is. Each of the
three gets one link, and `bridge-the-gap` spends its **one licensed inline
cross-sell** (AD-17 §4) pointing here.

It is also not an annual report. `2026-08-23-COPY-STANDARD.md:98-106` names
**"impact", "empower", "sustainable", "transformative", "innovative"** as
words to stop overusing and forbids "conventional NGO annual report" voice.
The celebration is carried by density — named projects, real quotes, sourced
figures, photographs — never by adjectives.

## 3. Route and IA

```
/healthy-cities                              hub — and the fellows register
/healthy-cities/fellows/tanuz-kalita         Majuli, Assam
/healthy-cities/fellows/mansi-thakar-jani    Mahuva · Dabhoi · Viramgam, Gujarat
/healthy-cities/fellows/anjali-choudhary     Bharuch, Gujarat
/healthy-cities/fellows/taniya-gill          Delhi
/healthy-cities/fellows/s-vineeth-kumar      Chinthamani, Karnataka
/healthy-cities/fellows/shubham-panwar       Uttarkashi, Uttarakhand
/healthy-cities/fellows/swapnil-chaurasiya   Bilaspur, Chhattisgarh
/healthy-cities/fellows/tawheed-zubair       Moradabad, Uttar Pradesh
/healthy-cities/fellows/shubham-dipak-gurav  Sangli, Maharashtra
/healthy-cities/fellows/miyawaki-forests     Unnao, Uttar Pradesh  ⚠ see §10
```

**No `/healthy-cities/fellows` index page.** The hub carries the register, and
`AD-19-navigation-call.md:12-49` deleted a section index whose "only addition
was longer lists". A fellow page's crumb points at `/healthy-cities#fellows`.

**No seventh nav word.** The nav is closed at six plus the Give chip; a
seventh was rejected on arithmetic (`design-routes.ts`). The microsite is
reachable from: a footer row (the footer is the site index — a **row in an
existing column**, never a fifth column), the `bridge-the-gap` cross-sell,
and the sitemap.

**Why it earns a top-level route rather than nesting under `/work`:** it
passes the `/now` test — it teaches something that exists nowhere else on the
site and its children are reachable no other way — rather than failing the
deleted-`/work` test of being a union of registers. Practically, a microsite's
purpose is a short link you hand a partner. `/work/**`'s page-vs-row sets
(`RULED_PAGES`/`RULED_ROWS`) are closed rulings and this deliberately sits
outside them.

**Ten fellow pages, and why each is a page not a row.** The repo's promotion
criterion is evidence, not ambition: `campaigns/monsoon-wooding` and
`campaigns/no-plastic` were both promoted "the moment the thing the campaign
actually did turned up". Every one of the ten fellows filed a final report
carrying aims, method, named partners, figures and — for six of them — quoted
speakers. That is more evidence than either promoted campaign had. Fellow
#10 is the weakest and is conditional (§10).

## 4. The hub's spine

Bands are `[id, tierClass, groundHex]`; `groundChain()` refuses two adjacent
identical grounds. Every band declares a tier — `section` has no padding of
its own.

| # | id | tier / ground | Carries |
|---|---|---|---|
| 1 | `top` | `t1` `#0D0D0B` | masthead. Photo frame + `h1.d1` in `.pic-over`; ancestor line, deck and `PERIODIC` chip in `.pic-body` beneath. **Display type may sit on a photograph; nothing else may.** |
| 2 | `strip` | — `#151512` | figure rail, 4 tiles (§5) |
| 3 | `schools` | `paper t2` `#F3F2F0` | the schools half: what ran in 26 schools. `splitBand` ×2, `flip` alternating |
| 4 | `green` | `t3` `#0D0D0B` | the Green Action Projects — the seven kinds, as `doRows` |
| 5 | `statement` | — `#151512` | `statementBand` — one `.d1` line over a photo. Carries no figure. |
| 6 | `fellows` | `paper-2 t2` `#ECEBE8` | **the register.** `regRows` ×10, each row `id="<slug>"`, each linking to its page. The one licensed `.lbl` pre-line per row names the state. |
| 7 | `voices` | `t3` `#0D0D0B` | the 16 publishable quotes, attributed. `panel` per quote. |
| 8 | `watch` | `paper t3` `#F3F2F0` | the four video series (§8) |
| 9 | `gaps` | — `#151512` | `hole()` × the named holes (§7). Real sentences, never a blank or a dash. |
| 10 | `act` | `t3` `#0D0D0B` | `onwardBand` — doors to the three existing pages + `ask()` |
| 11 | — | — | `closing()`, `newsletter()`, `citeBlock()`, footer |

`INDEX` for the header: The programme · In the schools · The fellows · Voices ·
What we cannot say yet.

## 5. The published figure set

Every figure is `{value, label, period, basis, source}`. `basis` is `counted`
or `modelled`; a **missing `period` is rejected by the data gate**, so an
unknown span is stated rather than invented. On the page, Regime B strips the
source line — the figure stands on its own.

**Hub figure rail — four tiles, no more** (a rail takes 2–4; a page carrying
one figure gets no rail at all):

| value | label | period | basis |
|---|---|---|---|
| 2,000+ | Students in classroom workshops | 2025–26 project period | counted |
| 26 | Partner schools across Delhi-NCR | 2025–26 project period | counted |
| 3,000+ | Saplings and seeds planted | 2025–26 project period | counted |
| 10 | Fellows, eight states | 2025–26 cohort | counted |

Further figures, in the bands rather than the rail: 20 CityScapes trips ·
20 Green Action Projects · 95 fellowship applications · 25,000+ average
monthly engagement across the video series.

**Per-fellow figures live on the fellow's own page, sourced to that fellow's
own report.** Cohort engagement is published as a **range — 35 to about
6,000 people per project** — using `rangeRow` ("a published range rather than
a fake single number"), because the definitions of "engaged" and "reached"
differ per report and the spread is 170×.

## 6. Figures deliberately withheld

Per the ruling: a figure ships only if the fellow's own report supports it.

| Withheld | Why |
|---|---|
| **"5,000+ community members reached"** (synopsis) | a cohort rollup over ten reports that count different things; Miyawaki's ~6,000 alone exceeds it. Owner question — see §12. |
| **"200+ plants / 500+ people / 5 workshops"** for Mansi, Vineeth and Miyawaki | boilerplate pasted from Tawheed's row. His own real figure is **235 saplings**. |
| **Moradabad, Uttar Pradesh** for Mansi Thakar Jani | her project is in **Gujarat**. Her whole row was overwritten with Tawheed's. |
| **"40 schools"** (proposal conclusion) | contradicts the proposal's own body and the synopsis. Owner ruled 26. |
| **Any total-funds or spend figure** | only 1 of 10 financial summaries both itemises and sums; four leave ₹10k–23k unaccounted; one reports ₹102,000 against a ₹1,00,000 grant. Per-fellow **grant size (₹1,00,000)** is publishable; utilisation is not. |
| **"Swachha Foundation"** | the Miyawaki report's spelling of the organisation. Not published without confirmation. |
| **A 20 ⇄ 26 parity** | with schools at 26, "20 Green Action Projects" and "20 CityScapes trips" stay as reported. They are not scaled up to match. Named as a gap. |

## 7. The gaps band — what it says

`hole()` renders a named hole as a real sentence. The site's own convention
is that a hole in *external* data may be stated where that is the story, and
is never an apology about our own page. These four qualify:

1. Thirty-one testimonial videos exist and not one records who is speaking —
   every quote on this page comes from inside a fellow's written report.
2. Twenty Green Action Projects and twenty exposure trips are reported against
   twenty-six schools. The programme grew; the activity count is the one that
   was reported, and it has not been re-counted.
3. Three fellows' Hindi testimonials survive only as broken text encoding and
   have to be taken again from the speaker.
4. The Miyawaki plantation report names four green spaces, four dates and no
   year, no district and no state.

Two more that are *ours* rather than the data's, and therefore per the copy
standard do **not** go on the page — they go to the owner as §12 questions.

## 8. Video

Four YouTube series with embed codes already written (`Videos for Microsite`
sheet): **DIY Videos & Short Listicles · School Gardens · Students
Testimonials · Podcasts**.

**Link out with a still frame; do not ship a YouTube `<iframe>`.** Reasons, in
order: no page in Lane 2 currently embeds third-party video, so it would be a
new pattern rather than the house one; a third-party iframe sets cookies on a
page that otherwise sets none; and the link gate enumerates every `href` and
resolves it against the route map. **Verify before building** whether any
built page carries an iframe — if one does, follow it; if none does, the still
frame + link is the honest default.

## 9. Photography

`duo` / `duo-dim` — **black and white without exception.** Selective colour is
retired in Lane 2 ("hue lives only in type, data, marks and controls"), and
`baked: true` is *refused* by the data gate rather than honoured. Every frame
takes a ramp: `duo` where a scrim does the contrast work, `duo-dim` where type
sits on the frame.

- Source pool: 839 images across 26 school folders. Best sets:
  **GBSSS Uttam Ngr no. 2 / Garden** (~25 clean 6–7 MB JPEGs) and Hari Nagar.
  Rights: owner ruled these are ours.
- **~280 HEIC files need converting** to JPEG. Eleven subfolders hold no JPEG
  at all; 8 of 26 schools cannot supply a hero.
- **EXIF orientation is a shipped-regression hazard** — seven frames in this
  repo already carry Orientation 6, and a naive SOF read reports pre-transpose
  pixels. Use the repo's own `scripts/lib/jpeg-size.mjs` path; never hand-write
  `width`/`height`. A frame whose recorded dimensions disagree with the file is
  refused: *the file wins.*
- Filenames `healthy-cities-*.jpg` under `public/images/photos/`. `/images/*`
  is cached a week, so **a changed picture needs a new filename**, never new
  bytes at the old one.
- Every `alt` is a real descriptive sentence, in the register the repo already
  uses. Not "students planting" — *"Two children in maroon school uniforms
  crouched in dug earth, settling a sapling into the ground."*
- **Reuse existing wrapper classes** (`pic`, `w7-pj-fig`, `w7-say-fig`,
  `w7-jr-fig`) so no new `IMG_SIZES` entry is needed. If a new wrapper is
  unavoidable its `sizes` value must be **measured, not guessed**, and above
  the 1240px `.wrap` cap the honest unit is **px, not vw**.

## 10. Fellow #10 is conditional

The Miyawaki report has no fellow name, no location, no year, a different
template, a ₹5 arithmetic error and the organisation spelled "Swachha
Foundation". The impact PDF supplies **Palak Bajpai, Unnao, Uttar Pradesh**;
the report names **Palak** as team lead alongside Nisha, Roli and Kshama.

It gets a page **only if** the owner confirms the fellow name, the location
and the year. Otherwise it is a rich row on the hub carrying what the report
does support — 1,025 plants of 1,460 procured, four green spaces, 2,120 sq ft,
~6,000 reached — and its slug is not routed. A stub page is worse than a rich
row.

## 11. The build, and every gate it must pass

**One commit, three parts.** `design-routes.ts` records four separate defects
from shipping any two of {a route, a built file, a nav-or-footer entry}
without the third. This change ships all three together.

Files touched:

| File | Change |
|---|---|
| `data/healthy-cities/programme.json` | new — hub data |
| `data/healthy-cities/fellows/<slug>.json` × 10 | new — one per fellow |
| `scripts/build-healthy-cities.mjs` | new — imports `situation-shell.mjs` + `work-shell.mjs`, emits 11 pages |
| `public/_pages/v3/healthy-cities.html` + `…/fellows/*.html` | new — committed output |
| `design-routes.ts` | 11 route entries; throws at build if a built file is missing |
| `data/seo/pages.json` | 11 entries. **description 140–158 chars — hard refusal outside that** |
| `design/home.html` footer | one row in an existing column |
| `data/work/projects/bridge-the-gap.json` | the one cross-sell link |
| `scripts/verify-final.mjs` | register entries |
| `package.json` | `build:healthy-cities` |
| `.github/workflows/generated-current.yml` | add to the `for t in …` loop |
| `public/images/photos/healthy-cities-*.jpg` | new frames |

Generator write gates, any of which exits 1: extraction assertions · ground
adjacency · canonical route · meta description present · description length
140–158 · `.im-head` inside `.wrap` · **the AD-28 ledger strip** (`SOURCE-FACTS`,
`§`, `AD-2x`, `D-0x`, `W-1x` in output is refused — so no internal reference
may appear in copy) · `node --check` on the assembled page script · servable
image widths · shared-class collision · unexpanded `${…}`.

Then: the **link gate** (`class Links`) resolves every `href` in every built
page; a new `href="#"` anywhere trips it. And **`npm run build` does not run
the generators** — CI regenerates all pages and fails on `git diff`, so the
generator must join the CI loop in the same commit.

Verification sequence:

```bash
npm test && npm run lint
npm run build:hero            # FIRST — every generator reads design/home.html after this
npm run build:healthy-cities
npm run build:work            # bridge-the-gap changed
npm run build:social-cards
npm run verify:final && npm run verify:seo
npm run dev                   # then read the real pages at 375×635 and at 1440
```

**Never hardcode a number in a generator** — `verify-final.mjs` cross-checks
the *rendered* figure against the committed JSON.

## 12. Owner questions — none block the build

1. **The cohort total.** The synopsis reports "5,000+ community members
   reached" to the funder. The ten reports do not reconcile to it. Publish it
   as reported, publish the 35–6,000 range instead, or publish both?
2. **Fellow #10** — confirm Palak Bajpai, Unnao, Uttar Pradesh, and the year.
   And is "Swachha Foundation" a real separate organisation or a typo?
3. **School names.** Two of the 26 are place names only (`Pushp Vihar`,
   `Hari Nagar`); `St. Columbas` wants its apostrophe; `Sarvapriye` is likely
   `Sarvapriya`; SKV/GGSSS/GBSSS/MCD/CM Shri/TSMS are unexpanded. Four
   campuses appear as boys'/girls' pairs — one school each or two? A roster
   only ships if the names are right; otherwise the count ships without it.
4. **Two schools are in Haryana** (TSMS Faridabad, Heritage Gurgaon), so
   "Delhi-NCR" is the honest frame and "20 CityScapes trips within Delhi"
   stays worded as Delhi. Confirm.
5. **Taniya Gill's zine** was in progress at report date, due 25 April 2026.
   Did it land?

---

## Appendix — sources

- Drive inventory: `scratchpad/drive-inventory.md` (1,419 lines) — folder tree,
  all ten reports, 22 verbatim quotes, 26 school folders, photo pools.
- Site conventions: `scratchpad/site-conventions.md` (1,756 lines) — the two
  lanes, tokens, component vocabulary, copy standard quoted, gates, 138 traps.
- Precedence: the built page beats every written spec; the frozen homepage
  beats every detail page; `2026-08-23-COPY-STANDARD.md` beats older AD
  rulings on voice.
