# AD-42 — The GIZ posters: No Plastic becomes a page, and /posters is built

**Status: SHIPPED.** Two routes, both built, routed and linked in the same pass:
`/work/campaigns/no-plastic` (promoted from a row) and `/posters` (new). 37 built
pages now carry a `Posters` link in the footer index.

## 1. What was asked

The owner asked whether the marine litter infographics were on the site. They
were not — and the answer had four layers, each wrong in a different way:

| Where it was recorded | What it said | What was true |
|---|---|---|
| The live site | nothing at all | correct: no page, no image, no link |
| `public/images/giz-marine/` | 8 committed JPEGs, referenced by no page or component | 7 were ours; 1 was not (see §3) |
| Content audit M-04 / N-04 | "10 infographics", "8 GIZ marine images", project with **GIZ + MoEFCC** | 10 is right; 8 is wrong; MoEFCC is wrong (§2) |
| AD-26 R-4 / §3 | 7 infographics, belonging to the `no-plastic` campaign row | the count was low; the destination was right |

The owner then ruled: put it in **campaigns**, and build **Posters**; the Sandip
Paul series is **not** part of this set; name all three partners.

## 2. The correction: it is the GERMAN environment ministry, not MoEFCC

Every one of the ten sheets carries the same printed credit:

> Implemented by **GIZ** (Deutsche Gesellschaft für Internationale Zusammenarbeit
> (GIZ) GmbH) · On behalf of: **Federal Ministry for the Environment, Nature
> Conservation and Nuclear Safety** of the Federal Republic of Germany · In
> partnership with **SWECHHA**

The commissioning ministry is Germany's, not India's MoEFCC. The MoEFCC claim
traces to old WordPress page text captured in `docs/legacy/`; **no artefact in
the set supports it**, and the content audit built a "only government
collaboration in the archive" argument on top of it (partner sheet row 03-027).

The site now names the partners **only inside a quoted credit** — the claim is
"this is what the artwork says", which anybody can check by looking at the
artwork, rather than "this is who we worked with", which would need a record
nobody holds. `scripts/build-posters-page.mjs` gate 3 enforces it: if "GIZ" or
"Federal Ministry for the Environment" appears on the page outside the quoted
string, the build fails.

**Still open for the owner:** whether MoEFCC had any role at all. If it did, it
is unrecorded on the deliverables and needs its own source before the site says
it. If it did not, the content sheet's partner row should be struck.

## 3. The file that was not ours

`public/images/giz-marine/marine-pollution.jpg` was a **European Commission**
(DG Maritime Affairs and Fisheries) infographic — EU flag, Commission mark, no
GIZ, ministry or Swechha mark anywhere. It was committed in `0176d7f` beside the
seven real posters and the content audit counted it as an eighth Swechha asset.

AD-26 §3 records exactly how it got there: it sat *one level up* from
`ALL POSTERS FINAL - JPEG/` in the source archive — a reference download filed
next to the real work, swept in with it.

Publishing it in a Swechha poster gallery would have misattributed EU material
to this organisation. It is now at
`docs/legacy/reference/european-commission-marine-pollution.jpg`, out of
`public/` and therefore unservable, not destroyed — the same treatment
`design-routes.ts` gave the superseded prototypes. `checkPosters` in the WORK
generator now refuses any poster outside `/images/posters/`, so the next stray
download cannot repeat it.

## 4. Ten, not seven or eight — and where the missing three came from

`All posters final.pdf` (Adobe Illustrator, 2022) has **ten pages**, A3 portrait,
with a proper TrimBox. That is the set, and it is why the content audit said ten
while the image folder held seven.

The three the repo never had:

- **What is EPR?** — extended producer responsibility, the only sheet addressed
  to producers rather than shoppers. Present only as `EPR.png` in a
  `Without border posters/` subfolder.
- **Replace Plastic. They Did It! (1 of 2)** and **(2 of 2)** — four Indian
  enterprises selling everyday things without single-use plastic. PDF only.

Both "They Did It" sheets carry their own printed qualification, which the site
now reproduces verbatim rather than paraphrasing:

> "Presenting innovative alternatives to everyday items of use, few amongst
> various initiatives in the country. We do not directly endorse any companies
> and focus on awareness generation on plastic prevention."

### The assets were re-rendered, not re-used

Three candidate sources existed and all three were wrong on their own:

| Source | Problem |
|---|---|
| `public/images/giz-marine/*.jpg` (in repo) | 1156×1600, **printer's crop marks visible**, 7 of 10 |
| `ALL POSTERS FINAL - JPEG/*.jpg` | 1891×2617 but crop marks, 7 of 10 |
| `Without border posters/*.png` | clean but only 848×1197 — too soft for a poster page — and 8 of 10 |

So all ten were rendered from the PDF at 150 dpi and cropped to its own TrimBox
(33pt inset, 2px safety inset) → **1750×2476**, full bleed, no crop marks, 4.5 MB
for the set. `public/images/posters/giz-marine/*.jpg`.

## 5. No Plastic: row → page

W-19 ruled No Plastic a row because "all five are names — no date, demand,
figure, partner or photograph for any of them". Four of the five arrived at once,
in print: the **demand** ("Refuse single-use plastic. Choose a sustainable
alternative", set in the artwork), the **year** (2022, from the print file and
from the SUP rules the sheets cite), the **partners** (the printed credit), and
the **artefacts**. Same trade W-10 made for Monsoon Wooding.

It has **no distribution figure**, and that is a named hole, not a reason to stay
a row. The page names three:

1. no print run and no list of places it went up;
2. no start or end date, and no statement of what the partnership covered beyond
   the posters;
3. nothing measured whether the demand moved anybody.

`figures` is deliberately **empty**. One defensible figure (ten sheets) is below
`FIGURE_RAIL_MIN`, and the alternative was inventing a second — which
`SOURCE_FORMS` exists to prevent.

The other four campaigns W-19 ruled rows are unchanged and still have nothing.

## 6. The poster band sits SECOND, and that is a deliberate departure

The obvious slot was beside `sheet`, seventh, where the other visual band lives.
Rejected: on this page the posters are not illustration *of* the argument, they
**are** the argument — the campaign's entire surviving record is ten printed
sheets. Seventh would put six bands of prose about posters ahead of the first
poster, which is the burying pattern the mobile audit already caught on the hero.

All six of the client's spine parts survive in his order. One artefact band is
inserted ahead of them, and only on a page that has artefacts.

## 7. Why `posterSheet` is not `gallerySheet`

Tried as a re-scope of `.wk-gal` first. Three independently disqualifying
reasons:

1. **`.ht>img` is `object-fit:cover`.** An A3 infographic cropped to 3/2 loses
   its headline and its whole footer — *including the printed credit*, which is
   the only evidence of who commissioned the work.
2. **`.duo` must not touch these.** The selective-colour filter is the site's
   treatment for *photography*; over flat infographic artwork it destroys the one
   thing a poster is for, which is reading it.
3. **`.s-record-cell` is measured at 11vw** — a 70px archive thumbnail.

The component lives in `scripts/lib/situation-shell.mjs` (the layer both
generators import), not in `work-shell.mjs`, because two generators need it and a
component copied into both is the drift the shell exists to prevent.
`work-shell.mjs` re-exports it.

### The `sizes` value needed measuring, and the first guess was wrong

`.pst-f` was first declared `40vw` above 1023. Measured on the built page:

| viewport | cell | as vw |
|---|---|---|
| 375 | 335px | 89.3 |
| 1024 | 468px | 45.7 |
| 1280 | 565px | 44.1 |
| 1440 | 561px | 39.0 |

The last two rows are the finding: `.wrap` caps at 1240px, so past roughly 1300
the cell **stops growing** and its vw fraction starts shrinking — 44.1vw at 1280
and 39.0vw at 1440 are the same 563px. A single `40vw` asks for 512px into a
565px box. **Above the cap the honest unit is px, not vw**, so the final value is
`(max-width:639px) 90vw, (max-width:1319px) 46vw, 565px`.

## 8. `/posters` and `/work/campaigns/no-plastic` show the same ten images

On purpose, and it is the one thing to keep honest here. `next.config.ts` is
explicit that this site does not want a second URL for the same content, so the
difference has to be real:

- **the campaign page** frames the sheets as a demand, inside the six-part spine;
- **`/posters`** frames them as printed objects, with the credit line and the
  per-sheet citation trail promoted to content.

Same pixels, different claim. If `/posters` ever becomes just the grid again,
delete it and leave the band on the campaign.

`data/posters.json` holds **framing only**. Every series reads its sheets out of
the item that made them, so a title, an alt or a credit exists once in this repo.
Gate 1 fails the build if a series names a source carrying no `posters`.

## 9. Sandip Paul is NOT part of this

The owner ruled it explicitly. AD-26 §3 lists 11 JPEGs by that name and AD-26 R-5
puts posters "in Stories"; **neither applies to this set** and no Sandip Paul
asset was copied into the repo.

Recorded for whoever picks that up: the series is co-branded VSO India · UN
Volunteers · American Center · **Swechha** · UNDP India, the filenames date it
`paulsandip09` (2009), and it carries the **old** `SWECHHA we for change` mark —
correct for a 2009 artefact, but a page showing it has to date it or it reads as
current branding.

## 9a. The campaign description, and the empty band it filled

The owner asked for a description on the campaign page. There was nowhere to put
one: `what` was an opener plus a split of scale-left and figures-right and
nothing else. That composes fine while an item has figures — Monsoon Wooding
fills the lead column with two readings — and fails the moment an item has none.
No Plastic has no sourced figure and cannot be given one, so its `what` band
rendered a heading, a one-line lead and an empty `wk-solo` div: about 250px of
nothing, on the band whose job is to say what the work IS.

So `about` is a new field — an array of paragraphs, each scanned by `checkProse`
like every other written string. Three decisions in it:

- **Full measure, not the lead column.** Putting it in `right` would make a
  proper asymmetric split, but only on a page that also fills `left`; here `left`
  is empty, so the prose would sit in columns 7–12 with the void merely moved to
  the other side. The shell's own comment settles the mirror case: "a split with
  nothing in its second column is not a split — it is a 5-column text block ...
  and unreadable." It takes the 62ch measure the aim, who and done bands give
  their prose.
- **Paragraphs, not h/p rows.** An object with headings would have made it a
  fourth band of the same shape as aim, how and who. It is one continuous
  description.
- **The split is now guarded.** With no figures and no scale it emits nothing
  rather than an empty box — the omit-when-absent rule every other band on the
  page already follows.

Reading order is uniform for every item: heading, the one-line lead, the
description, then the figures. An item that gains a figure later does not move
its own description.

## 10. Files

**New:** `scripts/build-posters-page.mjs` · `data/posters.json` ·
`public/images/posters/giz-marine/*.jpg` (10) ·
`docs/legacy/reference/` (+ README)

**Changed:** `data/work/campaigns/no-plastic.json` (row → page, +`posters`) ·
`scripts/build-work-pages.mjs` (rulings, `checkPosters`, SEQ/GAP/LABEL, band) ·
`scripts/lib/situation-shell.mjs` (`posterSheet`, `POSTER_CSS`, IMG_SIZES) ·
`scripts/build-work-pages.mjs` also gains `about` / `aboutBlock` (§9a) ·
`scripts/lib/work-shell.mjs` (TIER, re-export) · `design-routes.ts` ·
`data/work/onward.json` · `data/seo/pages.json` · `design/home.html` (footer) ·
`components/site-footer.tsx` · `scripts/verify-final.mjs` · `package.json`

**Removed from `public/`:** 7 crop-marked JPEGs (superseded) and the EU
infographic (moved, not destroyed).

## 11. Verification

`npm test` 162 pass · `npm run build` clean, every route still static ·
`npm run lint` 0 errors · `verify:final` census 18/18 · `verify:seo` 37 pages
match the register · `build:posters` 13 gates pass · `build:work` 5 gates pass ·
sitemap carries both routes · no horizontal overflow at 375 on either page ·
both pages captured at 375 and 1280 and read as printed sheets.

## 12. Open

- **MoEFCC** — see §2.
- **Distribution** — the print run and where the sheets went up. It is the
  difference between a poster set and a campaign with a reach.
- **Project period** — start, end, and what GIZ and Swechha each did.
- **The other nine campaigns and projects** with no printed material catalogued;
  the build report names every one.
