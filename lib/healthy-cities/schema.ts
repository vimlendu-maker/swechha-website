import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { z } from 'zod'

export const DATA_DIR = join(process.cwd(), 'data/healthy-cities')
export const FELLOW_DIR = join(DATA_DIR, 'fellows')

/* The spec's withheld list, as literal strings that must not appear anywhere in
   the published data. Each is a figure the sources do not reconcile on.

   'Moradabad, Uttar Pradesh, India' and '40 schools' were removed here (see
   controller ruling 2) — neither string would ever appear in the data as
   authored, so asserting their absence proved nothing. The real defect they
   were meant to guard against — one fellow's file inheriting another's
   location — is covered instead by two positive assertions in
   schema.test.ts. */
export const WITHHELD = [
  '5,000+',
  'Swachha Foundation',
] as const

/* THE BANDS THE HUB'S PROSE IS READ OUT OF, listed because `bands` is a
   `z.record` and a record requires no key: `bands: {}` validates forever, and a
   band whose prose key is dropped renders as an empty band with a heading and
   nothing under it. The generator dies on a missing key too — this is the same
   assertion made in the test suite, so it fails on a commit nobody rebuilt.
   Adding a band to the hub means adding its id here in the same change. */
/* 2026-09-07 RESTRUCTURE. `schools` and `green` are gone: the programme is now
   cut into the four things it delivered — `workshops`, `cityscapes`, `actions`
   and the Green Fellowship (`fellows`) — and the two old bands' content moved
   into the first and third of those. `kinds` is the display-row band that names
   all four. The tier rows for `schools`, `green` and the struck `gaps` band were
   removed from work-shell's TIER in the same change, so a band id re-added here
   without a tier throws rather than defaulting. */
export const REQUIRED_BAND_KEYS = [
  'top', 'what', 'kinds', 'workshops', 'cityscapes', 'statement', 'actions',
  'fellows', 'voices', 'watch', 'with', 'onward',
] as const

/* ★ `planned` IS A THIRD BASIS AND IT IS NOT A ROUNDING OF `counted`.
   The owner ruled (2026-09-07) that the page publishes the proposal's 100
   classroom workshops and its five curriculum modules, because no report gives
   an achieved count for either. Those are TARGETS out of a funding proposal,
   and calling a target `counted` asserts an observation nobody made — the
   figure would then be indistinguishable in the data from the 3,000+ saplings
   somebody actually counted. `basis` is not rendered on the page (AD-28 struck
   the basis rule and the legend that decoded it), so this changes no pixel; it
   changes what the data claims, which is the thing a later session reads.
   A gate in build-healthy-cities.mjs refuses a `planned` figure on the masthead
   rail — the rail is what the year achieved, and a target does not belong on
   it. */
export const figureSchema = z.strictObject({
  value: z.string().min(1),
  label: z.string().min(1),
  period: z.string().min(1),
  basis: z.enum(['counted', 'modelled', 'planned']),
  source: z.string().min(1),
  note: z.string().optional(),
})

export const frameSchema = z.strictObject({
  src: z.string().startsWith('/images/photos/'),
  alt: z.string().min(1),
  /* THE MONOCHROME RAMP THE FRAME IS MEANT TO CARRY — DECLARED INTENT, NOT WHAT
     SHIPS. Required, so no frame can be added without somebody deciding; but
     NOTHING IN THE RENDER PATH READS IT (`grep '\.ramp' scripts/`), and that is
     why every value here reads `duo`.

     `masthead()` in scripts/lib/work-shell.mjs derives its own ramp instead —
     `duo-dim` only when a frame is a placeholder, `duo` otherwise — and the
     statement/split/panel components hardcode `duo`. Ruling 33 (2026-09-07)
     settled it in the render's favour rather than the data's: about.html, the
     page this generator is patterned on, runs its masthead at `duo` behind
     `.pic-over`'s rgba(11,11,9,.92) scrim, which is already doing the contrast
     work, and dimming these mastheads would make them the only dark ones on the
     site. So the values were brought down to `duo` to stop the data claiming a
     treatment nobody renders.

     If a future session wires `ramp` up (one line at work-shell.mjs:1749), the
     values here are the place to re-decide, not the place to read history off:
     three of these frames carry type over the photograph and would be the
     candidates for `duo-dim`. */
  ramp: z.enum(['duo', 'duo-dim']),
  op: z.string().optional(),
  /* WHICH BAND THE FRAME BELONGS TO, on the programme's own `frames` array.
     The hub's bands each take at most one photograph and the components that
     hold them are different objects — a masthead letterbox, a statement band's
     seam-to-seam field, a split's inset figure — so a frame cannot be assigned
     by array position without the order silently deciding the layout. Optional,
     because a fellow's `frames` are a contact sheet where order is the only
     thing that matters. */
  slot: z.string().optional(),
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
  /* THERE IS NO `holes` FIELD, AND ITS ABSENCE IS THE RULING RATHER THAN AN
     OMISSION. Every fellow file carried one, and every one of them was struck
     on 7 September 2026: the copy standard puts "what this page cannot say
     yet", gap counters and empty-state confessions in the Removed column, and
     these were not holes in an external record — they were the state of a Word
     document we were handed (broken Devanagari, unticked boxes, a blank
     objective, an unconfirmed spelling). A reader of a fellow's page has no use
     for any of it. The facts inside them that WERE programme detail were moved
     into `deck`, `aims` and `did` in the same commit and re-voiced; the rest
     went. Because this is a `z.strictObject`, re-adding the key fails the
     schema instead of quietly reaching a renderer that no longer exists. */
  links: z.array(z.strictObject({ label: z.string(), href: z.string().url() })).optional(),
})

export const programmeSchema = z.strictObject({
  title: z.string().min(1),
  description: z.string().min(140).max(158),
  deck: z.string().min(1),
  /* Who Swechha is, in one sentence. It exists on exactly one other page in the
     site (the homepage), and this one is a landing page a funder forwards, so a
     cold visitor arrives here with no answer to "who is this?". */
  identity: z.string().min(1),
  /* The parent programme. This page is Bridge the Gap's 2025-26 chapter, not a
     separate thing, and the masthead says so in one line. */
  ancestor: z.strictObject({ label: z.string().min(1), href: z.string().min(1) }),
  partnership: z.string().min(1),
  figures: z.array(figureSchema).min(4),
  /* The funder register, same grammar as data/work/projects/bridge-the-gap.json.
     funders_lead counts how many leading entries carry the lead mark — a rank on
     a published list is a claim, so funders_source is required alongside it,
     exactly as the WORK build already demands. */
  with: z.strictObject({
    funders: z.array(z.string()).min(1),
    funders_lead: z.number().int().positive(),
    funders_source: z.string().min(1),
    /* ★ THE ONE THIRD-PARTY MARK ON THIS SITE, and the only reason it is here is
       that the owner asked for it (ruling 42), reversing ruling 10's "no funder
       logos". It is DATA rather than a path in the generator for the same reason
       every figure on this page is: a trademark's file, its alt, its licensee
       and its acknowledgement wording are content, and content that lives in a
       build script cannot be reviewed by the person whose mark it is.

       ★ IT IS NOT A `frame`, AND THAT IS THE LOAD-BEARING DISTINCTION. A frame
       is a PHOTOGRAPH: `frameSchema` pins it under /images/photos/, the
       generator's photo-library gate refuses it without a registered credit and
       provenance row, the test suite demands a six-word descriptive alt, and
       every renderer hands it `class="duo"` for the site-wide monochrome ramp.
       A logo fails or corrupts every one of those. It is a mark, it renders in
       COLOUR (the design language's own words: "hue lives only in type, data,
       marks and controls"), its alt is the organisation's name and nothing else,
       and it may never be recoloured. So it gets its own shape, its own pool
       under /images/partners/, and its own gates.

       `holder` is the licensee's full legal name and `trademark` is the
       acknowledgement their own site carries — reproducing somebody's registered
       marks without it would be worse than not showing them. `source` is the
       provenance of the exact bytes we ship, which for a photograph would be the
       library row; a mark has no library, so this is it. */
    mark: z.strictObject({
      src: z.string().startsWith('/images/partners/'),
      alt: z.string().min(1),
      holder: z.string().min(1),
      trademark: z.string().min(1),
      source: z.string().min(1),
    }),
  }),
  bands: z.record(z.string(), z.unknown()),
  quotes: z.array(quoteSchema),
  /* Ruling 14: the hub points at quotes, it does not copy them. Same grammar as
     /impact naming a figure by (kind, slug, label). `quote` is the full text
     because `speaker` is NOT unique within a fellow file — taniya-gill has two
     "A workshop participant" and s-vineeth-kumar two "A farmer on the pilot
     plots", so a speaker key would resolve ambiguously. */
  voices: z.array(z.strictObject({ fellow: z.string(), quote: z.string() })).min(1),
  /* NO `holes` HERE EITHER, AND IT USED TO BE `.min(1)` — see the note on
     fellowSchema above. The hub's five were the same class of thing: a video
     set that does not name its speakers, an encoding failure, a report with no
     year on it. Two of the five carried a real programme fact and those two
     were moved: the thirty-one filmed accounts into `bands.watch` as
     content, the twenty-against-twenty-six count into `bands.green` as prose
     about how a school takes on a garden. The `gaps` band went with them. */
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
