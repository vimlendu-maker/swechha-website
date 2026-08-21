# Handoff — Swechha homepage, section by section

Rewritten at the end of the 20 August session. **This file supersedes the version
written that morning**; four of that file's open items are now closed and are not
repeated here. The next session starts from this page.

## Read first, in this order

1. `DECISIONS-2026-08-20-homepage.md` — every client ruling taken this session,
   with the reasoning and what each one costs. Additive to `DECISIONS-2026-08-18.md`.
2. `2026-08-20-art-direction.json` — the through-line, the twelve-band ground
   sequence, the four vertical tiers, the mobile doctrine, the per-section spec.
   **It has three known-stale passages — see "Amendments owed" below. Do not treat
   it as current until they are made.**
3. The art director's reviews, in section order: `2026-08-20-AD-01-hero.md`,
   `2026-08-20-AD-01b-hero-live-and-tagline.md`, `2026-08-20-AD-02-ticker.md`.
4. `2026-08-20-AD-01-hero-implemented.md` — what actually shipped for the hero,
   with measured before/after per defect.

## Where everything is

Dev server serves `public/` at the root. Start it from `.claude/launch.json`
(`swechha-website`, port 3000) — never with a bare shell command.

| | |
|---|---|
| **Both viewports, band stepper** | `/design/v3/_review.html` |
| **Phone only, width + fold line** | `/design/v3/_mobile.html` |
| Homepage | `/design/v3/home.html` |
| Environmental Intelligence | `/design/v3/intelligence.html` |
| Situations | `/design/v3/situation-air.html`, `-yamuna.html`, `-soon.html` |
| System sheet / About | `/design/v3/system.html`, `/design/v3/about.html` |

The two review harnesses were built this session and are the fastest way to work.
`_review.html` shows 1440 and 375 side by side, steps all twelve bands with the
arrow keys, and **measures the live page** — per-band height at both widths, the
mobile budget breach, the computed ground hex, and the adjacency check the art
direction says to run mechanically. `_mobile.html` runs the phone as an ordinary
iframe inside a normal-width tab, with width 375/390/414/768/940, height
812/736/635, and a fold line at 635.

**Both are working files under `public/design/` and must be deleted before any deploy.**

## Capture method — the one that produces trustworthy numbers

Use CDP `Emulation.setDeviceMetricsOverride`. **Do NOT use bare `--window-size`**:
it applies no device emulation, lays the page out wider than the nominal width and
crops the PNG. That produced a phantom "horizontal overflow in the hero" finding
this session — clipped body copy, bands running off the edge, a truncated ticker —
none of which existed. An hour went into it. The morning version of this file
recommended that broken recipe; it has been removed.

Then READ the PNG. Never report on a page you have only read as source.

## State by section

| # | band | reviewed | implemented |
|---|---|---|---|
| 01 | hero | yes — AD-01, AD-01b | **yes**, 12 defects + nav; 2 items outstanding |
| 02 | ticker | yes — AD-02 | no |
| 03–12 | statement → footer | no | no |

### Hero — outstanding
- **D2, the veil arithmetic.** Approved (masthead band, keep the reading on solid
  ground) but NOT built. Three gradient layers scale off `vw` while the frame
  scales off `svh`, so clean picture goes 176px → 110px → **negative below a 790px
  window**. Fix: derive both veils from the frame, floor of 40% unveiled.
- **The ≤560 sentence cut.** Approved but NOT built.
- **The 375 budget got worse, not better.** Hero + nav is now **878px** against
  ~635px of visible iOS Safari, up from 868. The chip row costs 48.8px and the
  provenance collapse returned 37px, not the ~98px projected. Closing this needs
  ~243px, and the approved cut alone will not do it. **Decide whether the hero
  simply does not fit one phone screen and stop designing as though it must.**
- AD-01b's rulings on the LIVE indicator and the tagline land in that file; neither
  is built.

### Ticker — reviewed, nothing built
AD-02's two priorities: at 375 the strip delivers 2.7 of 7 readings and the
licensed 8px fade paints nothing (it sits in empty ground behind the last ink, and
no single fade width bites at both 375 and 414 — the affordance has to become a
count in the masthead, not a gradient); and `intelligence.html#h-waste` is
`display:none`, so the strip's only green figure — the one number the organisation
owns — leads nowhere.

Of the 12 defects in `2026-08-19-section-audit-salvage.json`: **5 are dead, 4 live,
3 overtaken.** AD-02 lists which. Two of its prescribed fixes are now *forbidden*
by later rulings — check AD-02 before applying anything from the salvage file.

## Amendments owed to the art direction JSON

Three passages are now wrong and will mislead whoever reads them next.

1. `perSection[0].hook` — promises "a numeral standing over a halftoned India Gate".
   Ruled otherwise: the photograph is a masthead band and the reading sits on solid
   ground. Rewrite it.
2. `perSection[0].job` — "today's worst broken legal limit". Ruled otherwise:
   validity window plus severity, no hardcoded first situation.
3. `mobileDoctrine` — says the hero rail's account column "drops below and is
   indented to the rule's exact x". The build keeps it beside the rule and the
   build won. Also its "375 today is 12,296px" is stale: **it is 9,452px.**
   And its one-56px-row nav rule stands, but losing the navigation with it does not.

AD-02 additionally argues T4's stated padding is arithmetically impossible for the
ticker (86.4px of padding against a 96–120px height cap) and that the build's
documented refusal should be promoted into the direction.

## Still open, unchanged from the morning

- **Seven of nine situations have no page**; they point at `situation-soon.html`.
  The client's call whether to build them thin.
- **Two backend fields, now confirmed as required rather than optional** by the
  validity-window ruling: a stored `limit`, and `windowStart`/`windowEnd`/
  `recursAnnually`. Neither is in `lib/content/schemas.ts`. Unanswered sub-question:
  how an absence (0.0 of a 5.0 minimum) ranks against a multiple (4.1×).
- **~165 legacy WordPress redirects** are still an empty array in `redirects.ts`.
  Launch blocker.
- **Photo library**: `gram-anubhav-hero.jpg` is a screenshot of a website mockup,
  not a photograph. `yamuna-barrage-crowd.jpg` and `yamuna-source-rapids.jpg` are
  stored rotated 90° (`sips -r 90`, back them up first).
- **These v3 pages each carry their own `<style>` — there is no shared stylesheet.**
  `intelligence.html` and `about.html` still contain the clipped tab marker, the
  red-on-a-control and the dashed season tag that were fixed in `home.html`. Any
  "fix once" instruction is wrong on this codebase.

## Process

Menu destinations are wired **after** the whole homepage is signed off (client
ruling). Do not log dead header anchors as defects before then. `#h-waste` is a
genuine defect, not deferred wiring — it looks live and lands on the wrong panel.

Next section is **03, the statement.**
