# Implementing the journey / project / event verticals — design

Written 2026-08-19, after the nine design boards were approved. Owner
decisions in this document were taken in conversation on 19 Aug and are
recorded here because they change the whole site, not one page.

Authority: `docs/design/DECISIONS-2026-08-18.md` still governs. Where this
document and that ledger disagree, the ledger wins.

## Why this work exists

Nine approved pages live in `public/design/` as self-contained HTML boards:

- `journeys-landing.html` (LOCKED 19 Aug)
- `journeys-naturescapes.html` (FROZEN 19 Aug — the journey template)
- `journeys-cityscapes.html`, `journeys-gram-anubhav.html`, `journeys-yamuna-yatra.html`
- `projects-landing.html`, `events-landing.html`
- `project-bridge-the-gap.html` (the project template) plus four demo project pages

None of it is in the app. The app has 12 routes and **no journeys route at
all**. Twelve boards are 635 KB, almost all of it the same CSS repeated, and
the kit has already forked: the frozen Naturescapes page carries
`min-width:190px` where its siblings carry `186px`, has no `.lead--wide`, and
missed a tuned mobile hero crop. During one session the same fix had to be
applied by hand to four files, and a stale `aria-current` inherited from a
sibling header shipped two active nav items.

That divergence is the cost this work removes.

## The finding that sizes the work

The app's visual system predates the locked design language. This is not only
about missing routes:

| | app today | locked language |
|---|---|---|
| accent | `--color-teal`, `teal-ink` | mustard `#E1A32B` |
| ink | `#1c1d2b` (indigo) | `#1C1B18` near-black |
| paper | `#fbf9f5` | `#F7F4ED` |
| dark grounds | none | `--ground` `#0F0F0E`, `--panel` `#141413`, `--void` |
| severity | none | `--sev` `#F1484E`, one hue only |
| fonts | Fraunces + Instrument Sans | + **Archivo** (the condensed-caps voice) |
| nav | 8 items, no Donate | 7 items + highlighted Donate |

The 18 Aug ledger already ruled the canvas is black/charcoal **not** indigo and
that mustard is the primary accent. The app was never brought up to that.

What is reusable as-is, and must not be rewritten: the content system
(`gray-matter` + Zod schemas in `lib/content/schemas.ts` + loaders in
`lib/content/index.ts` + the relations resolver), `lib/status.ts`,
`components/data-attribution.tsx`, and the `@layer base` cascade discipline
documented in `app/globals.css`.

## Owner decision, 19 Aug: swap the palette globally

The new tokens replace the old ones site-wide. The 12 existing routes
(`/now`, `/stories`, `/campaigns`, `/impact`, …) re-skin from teal-and-indigo
to mustard-and-charcoal.

Rejected alternative: scoping the new tokens to the new routes only. It leaves
two visual systems side by side and makes one shared header wrong on one of
them.

Accepted consequence: some existing pages will need layout attention after
re-skinning. That is follow-up work, not a reason to keep two palettes.

## Phase 1 — foundation

1. Replace the palette tokens in `app/globals.css`, keeping the three-layer
   token architecture (primitive → semantic → component) and the `@layer base`
   discipline, both of which are documented in that file's comments.
2. Add Archivo via `next/font/google` alongside Fraunces and Instrument Sans,
   exposed as `--font-archivo`.
3. Rebuild `components/site-header.tsx`: the approved 7-item nav
   (NOW · WORK · EXPLORE · IMPACT · ACT · ABOUT · SEARCH) plus a visually
   highlighted DONATE, on `--ground`, with the approved logo asset.
4. Rebuild `components/site-footer.tsx` to the boards' four-column footer.
   Labels come from workbook sheet 16; URLs from the sitemap.

**Hard constraints.** The DEMO-badge contrast fix (5.96:1) must not regress.
Nothing may reintroduce a second accent hue: red is `--sev` and means a
reading is bad. Type hierarchy is fixed — Fraunces for section headings and
promises, Archivo caps for wordmarks, card titles and every micro-label,
Instrument Sans for body.

**Verification.** Every one of the 12 existing routes is loaded and screenshotted
after the swap; `npm test` (46 tests) and `tsc` stay clean; the DEMO badge is
re-measured for contrast.

## Phase 2 — journeys

**Content type `journey`.** Zod schema added to `lib/content/schemas.ts`,
loader alongside the existing ones. Fields, from the frozen boards:

- `title`, `promise`, `standfirst`, `heroImage { src, alt, baked }`
- `facts[]` — `{ label, body, big? }`; `big` carries the oversized duration
- `where` — `{ variant: 'staggered' | 'cards' | 'spine', items[] }`
- `experience[]` — `{ icon, title, body }` (the page's one icon row)
- `strip[]` — `{ src, alt, baked }`
- `close` — `{ line, ctaLabel, ctaHref }`

**Components.** `Hero`, `FactsRow`, `IconRow`, `PhotoStrip`, `CloseBand`, and
three `Where*` variants. `PhotoFrame` centralises the one rule everybody gets
wrong: a frame with `baked: true` takes **no** filter class, because its
selective colour is already in the file and a ramp greys out the one thing the
picture is for.

**Routes.** `/work/journeys` (landing) and `/work/journeys/[slug]` —
naturescapes, cityscapes, gram-anubhav, yamuna-yatra.

**Fidelity rule.** The frozen Naturescapes board is the reference. Where the
other boards diverge from it, the frozen board wins, because the divergences
are drift and not decisions.

## Phase 3 — projects and events

Adds `ImpactBand` (edge-to-edge, one dominant number, no icons, per the
18 Aug ruling) and `GapPanel` (states the sitemap content-model fields that
have no value rather than silently omitting them).

**Content type `project`**: the journey fields minus `where`, plus
`challenge`, `impact[]`, and the four model fields `location`, `period`,
`partners`, `theme`.

**Content type `event`**: `title`, `body`, `date?`, `location?`, `heroImage?`.
No per-event route — the sitemap specifies none. `date` is optional because no
date exists for any of the four events; Upcoming renders a real empty state
when nothing has one.

**Routes.** `/work/projects`, `/work/projects/[slug]`, `/work/events`.

## Demo state is data, not markup

Four project pages are entirely placeholder. `components/data-attribution.tsx`
already rules that an unverified figure must carry a DEMO DATA tag "so a
visitor can never mistake a placeholder number for a real reading".

So `demo: true` in frontmatter drives it: the band under the header, the tag on
the impact figures, and the dashed pill on the landing card all render from
that one field. A project becomes real by deleting one line, and it is
impossible to publish demo figures without the marking, which is the point.

## URL map

| page | route |
|---|---|
| journeys landing | `/work/journeys` |
| journey detail | `/work/journeys/[slug]` |
| projects landing | `/work/projects` |
| project detail | `/work/projects/[slug]` |
| campaigns | `/work/campaigns` |
| campaign detail | `/work/campaigns/[slug]` |
| events | `/work/events` |

**Owner ruling, 19 Aug: WORK is the umbrella and everything under it is
normalised to `/work/*`.** The earlier draft of this document had journeys at
top level because the boards put them there; that inconsistency is now closed.

Campaigns MOVED as part of this: `app/campaigns` became `app/work/campaigns`,
and `movedRedirects` in `redirects.ts` sends both `/campaigns` and
`/campaigns/:slug` to their new paths (verified 308 in dev). Those are our own
routing decisions and are kept separate from the WordPress migration list so
they survive whatever happens to it. The design boards already assumed
`/work/campaigns` throughout, so the app was the outlier, not the boards.

## Non-goals

- No new page designs. Campaigns, Stories, Explore, Impact, Act, About and
  Media stay as they are.
- No re-layout of the existing 12 routes beyond what the token swap forces.
- The ~165 old-WordPress redirects (`redirects.ts` is still an empty array).
- Image optimisation. Several heroes are far over the 200 KB budget and need
  AVIF/WebP; that is its own task.
- Replacing the generated Cityscapes and Gram Anubhav photography, or the five
  Unsplash Naturescapes placeholders. Blocked on the Drive archive, which is
  still sign-in gated.

## Open questions for the owner

1. **Red as severity.** Many of the 18 new `blackwhite_pop` frames pop red or
   orange. The palette allows mustard plus one severity hue, and red currently
   means a bad reading on the homepage AQI signal. Decorative red across the
   journey and project pages dilutes that.
2. **Children's faces at hero scale.** Four of the new frames show identifiable
   children. Consent for publication has not been confirmed, and the design
   language bans beneficiary framing. Currently used at strip size only.
3. **Women Farmers Collective** appears as a Project on the homepage but is not
   in the sitemap's five. One list is stale.
