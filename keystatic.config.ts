/**
 * keystatic.config.ts — the editor, mounted at /keystatic.
 *
 * WHAT THIS IS FOR. After cutover, someone at Swechha has to publish without a
 * terminal. Today nothing on this site can be changed without a git checkout,
 * and the design documents assume an admin panel that was never built (AD-02c
 * §5.3, AD-03:319, AD-04:289/350, DECISIONS:575). This closes that for the
 * EDITORIAL files only.
 *
 * ★ WHAT IT DELIBERATELY DOES NOT TOUCH.
 * The 14 machine-owned files under `data/` — air-delhi, air-india,
 * air-crosscheck, heat-india, bhuvan-heat, climate-india, fires-nw-india,
 * forest-fire-india, forest-loss-india, gfw-india, rivers-india,
 * yamuna-crosscheck, coverage-*, attention-* — are the default outputs of the
 * `fetch-*` scripts and are rewritten by the daily data-refresh job. A hand
 * edit there would be silently reverted within 24 hours, so they are absent
 * from this config on purpose.
 *
 * Also absent: the transcribed-figure files (yamuna-cpcb-2025,
 * forest-isfr-2023, deaths-ncrb-2024, groundwater-india-2025, rainfall-delhi,
 * the parliament files, document-watch). Those are citations from annual
 * reports. An editor who can casually retype a CPCB figure is a liability on a
 * site whose entire argument is source discipline. They stay in git, in review.
 *
 * ★★ THE SCHEMA MUST BE EXHAUSTIVE, AND THAT IS NOT A STYLE PREFERENCE.
 * Keystatic SERIALISES ITS SCHEMA — it does not patch the file. A key that is
 * not declared here is not written back, and is therefore deleted on the first
 * save. Verified against this very repo: reading a work item with a partial
 * schema fails with
 *
 *     Invalid data for "bridge-the-gap": Key on object value "slug" is not allowed
 *
 * so the field list below is the UNION of every key across all 23 item files,
 * not the keys of a representative one. If you add a key to the data, add it
 * here in the same commit or the next save will drop it.
 *
 * `scripts/verify-data-fidelity.mjs` enforces that in CI, and
 * `scripts/normalize-cms-output.mjs` puts back the `null`s Keystatic cannot
 * express (it has no `string | null`; a blank text field is written `""`, and
 * `situation: ""` fails the work build outright — see that script's header).
 */
import { config, collection, fields } from '@keystatic/core';

/** All three, or GitHub storage cannot be constructed at all. See `storage`. */
const HAS_GITHUB_APP = Boolean(
  process.env.KEYSTATIC_GITHUB_CLIENT_ID &&
    process.env.KEYSTATIC_GITHUB_CLIENT_SECRET &&
    process.env.KEYSTATIC_SECRET,
);

/* ── SHARED PIECES ────────────────────────────────────────────────────────── */

/** `{ src, alt }`. Nullable at the top level of an item; the normalizer
 *  restores that null, because an empty frame is not the same claim as none. */
const frame = (label: string) =>
  fields.object(
    {
      src: fields.text({ label: 'Image path', description: 'e.g. /images/photos/…' }),
      alt: fields.text({ label: 'Alt text', multiline: true }),
    },
    { label },
  );

/** The `{ h, p }` heading-and-paragraph block used by aims/how/who/done. */
const blocks = (label: string, description: string) =>
  fields.array(
    fields.object({
      h: fields.text({ label: 'Heading' }),
      p: fields.text({ label: 'Paragraph', multiline: true }),
    }),
    { label, description, itemLabel: (p) => p.fields.h.value || 'Untitled' },
  );

/* ── A WORK ITEM ──────────────────────────────────────────────────────────── */

const workItem = {
  /* `slug` is a real key in the JSON *and* the filename. fields.slug writes the
     name part under this key and takes the filename from the slug part, so both
     stay `me-to-we` and nothing is lost. */
  slug: fields.slug({ name: { label: 'Slug', description: 'Lowercase, hyphenated. Also the filename.' } }),
  kind: fields.text({ label: 'Kind', description: 'projects | journeys | campaigns | events' }),
  name: fields.text({ label: 'Name', description: 'The display title.' }),
  page: fields.checkbox({ label: 'Has its own page', defaultValue: true }),
  anchor: fields.text({ label: 'Anchor' }),
  line: fields.text({ label: 'One-line summary', multiline: true }),
  deck: fields.text({ label: 'Deck', multiline: true }),

  figures: fields.array(
    fields.object({
      value: fields.text({ label: 'Value', description: 'e.g. 3,000+' }),
      label: fields.text({ label: 'Label' }),
      period: fields.text({ label: 'Period' }),
      basis: fields.text({ label: 'Basis', description: 'How it was arrived at. Do not leave blank.' }),
      source: fields.text({ label: 'Source' }),
    }),
    { label: 'Figures', itemLabel: (p) => `${p.fields.value.value} — ${p.fields.label.value}` },
  ),

  aims: blocks('Aims', 'Optional; present on 10 of 23 items.'),
  how: blocks('How', ''),
  who: blocks('Who', 'Optional.'),
  done: blocks('What was done', ''),

  with: fields.object(
    {
      schools: fields.array(fields.text({ label: 'School' }), { label: 'Schools', itemLabel: (p) => p.value }),
      partners: fields.array(fields.text({ label: 'Partner' }), { label: 'Partners', itemLabel: (p) => p.value }),
      funders: fields.array(fields.text({ label: 'Funder' }), { label: 'Funders', itemLabel: (p) => p.value }),
    },
    { label: 'With' },
  ),

  /* ★ The named holes. These are the honesty device the whole site rests on.
     Never remove one to make a page look finished. */
  holes: fields.array(
    fields.object({
      what: fields.text({ label: 'What is missing', multiline: true }),
      unlocks: fields.text({ label: 'What would close it', multiline: true }),
    }),
    { label: 'Named holes', itemLabel: (p) => (p.fields.what.value || '').slice(0, 60) },
  ),

  statement: fields.object(
    {
      line: fields.text({ label: 'Statement line' }),
      under: fields.text({ label: 'Under the line', multiline: true }),
      frame: frame('Statement image'),
    },
    { label: 'Statement band' },
  ),

  gallery: fields.array(
    fields.object({
      src: fields.text({ label: 'Image path' }),
      alt: fields.text({ label: 'Alt text', multiline: true }),
    }),
    { label: 'Gallery', itemLabel: (p) => p.fields.src.value },
  ),
  gallery_note: fields.text({ label: 'Gallery note', multiline: true }),

  frame: frame('Masthead image'),
  situation: fields.text({
    label: 'Situation slug',
    description: 'air, yamuna or forest-loss — or blank for none. Blank is stored as null.',
  }),
  geography: fields.text({ label: 'Geography' }),

  /* Events only (4 files). Missed by the first key scan because that scan
     skipped the root prefix; the Keystatic reader caught it:
     `Key on object value "gathering" is not allowed`. */
  gathering: fields.text({ label: 'Gathering', multiline: true }),
  /* One file only — yamuna-shramdaan belongs_to we-for-yamuna. */
  belongs_to: fields.text({ label: 'Belongs to', description: 'Slug of the parent item, if any.' }),

  activities: fields.array(
    fields.object({
      name: fields.text({ label: 'Name' }),
      p: fields.text({ label: 'Paragraph', multiline: true }),
      cap: fields.text({ label: 'Caption' }),
      frame: frame('Image'),
    }),
    { label: 'Activities', itemLabel: (p) => p.fields.name.value || 'Activity' },
  ),

  duration: fields.object(
    {
      value: fields.text({ label: 'Value' }),
      unit: fields.text({ label: 'Unit' }),
      /* INTEGER, not text. The reader rejects a string schema here:
         `duration.rank: FieldDataError: Must be a string` on all four journeys. */
      rank: fields.integer({ label: 'Rank' }),
    },
    { label: 'Duration' },
  ),

  route: fields.array(
    fields.object({
      stop: fields.text({ label: 'Stop' }),
      note: fields.text({ label: 'Note', multiline: true }),
    }),
    { label: 'Route', itemLabel: (p) => p.fields.stop.value },
  ),

  scale: fields.array(
    fields.object({
      /* All three are integers in the data, not strings. */
      figure: fields.integer({ label: 'Figure' }),
      low: fields.integer({ label: 'Low' }),
      high: fields.integer({ label: 'High' }),
      note: fields.text({ label: 'Note', multiline: true }),
    }),
    /* String(), because itemLabel must return a string and fields.integer
       yields number | null — the only itemLabel in this file reading a
       non-text field, and the one that failed typecheck. The fallback
       matches the 'Untitled' / 'Activity' pattern used above. */
    { label: 'Scale', itemLabel: (p) => p.fields.figure.value === null ? 'Figure' : String(p.fields.figure.value) },
  ),

  when: fields.object(
    {
      day: fields.text({ label: 'Day' }),
      years: fields.text({ label: 'Years' }),
      editions: fields.text({ label: 'Editions' }),
      venue: fields.text({ label: 'Venue' }),
      note: fields.text({ label: 'Note', multiline: true }),
      source: fields.text({ label: 'Source' }),
    },
    { label: 'When (events only)' },
  ),

  act: fields.object(
    {
      label: fields.text({ label: 'Call-to-action label' }),
      href: fields.text({ label: 'Link' }),
    },
    { label: 'Act' },
  ),

  invite: fields.object(
    {
      note: fields.text({ label: 'Note', multiline: true }),
      second: fields.object(
        {
          label: fields.text({ label: 'Label' }),
          href: fields.text({ label: 'Link' }),
        },
        { label: 'Second invitation' },
      ),
    },
    { label: 'Invite' },
  ),
};

/* ── PER-COLLECTION SCHEMAS ───────────────────────────────────────────────────
 * One shared schema across all four kinds was the first attempt and it is
 * wrong, for a reason worth writing down: Keystatic writes a UNIFORM key set
 * per collection, so saving a project would add `gathering: ""`, `when: {}`,
 * `route: []`, `duration: {}` and `scale: []` to a file that never had them —
 * and would show an editor of a project six field groups that mean nothing
 * there ("Gathering", "When (events only)", "Route", "Scale", "Duration",
 * "Geography").
 *
 * It is NOT a correctness bug. Tested: adding `gathering:""` and `when:{}` to
 * `projects/eco-action.json` and running `npm run build:work` still produced
 * `15 page(s) — every other gate green`. `build-work-pages.mjs` validates the
 * keys it cares about and tolerates extras. So this split is for the editor's
 * sake and to keep the data files honest, not to stop a build failure.
 *
 * The division is the KEY CENSUS across all 23 files, not a guess:
 *   all four kinds  slug kind name page anchor figures holes situation
 *   projects only   scale (2/7)
 *   journeys only   duration (4/4) geography (4/4) route (2/4)
 *   events only     gathering (4/4) belongs_to (1/4) when (1/4)
 *   events LACK     act deck done frame line with, and all of
 *                   aims who gallery gallery_note statement invite activities
 */
const { scale, duration, geography, route, gathering, belongs_to, when, ...shared } = workItem;

const projectsSchema = { ...shared, scale };
const journeysSchema = { ...shared, duration, geography, route };
const campaignsSchema = shared;

/* Events are a thinner kind — twelve keys, and `how` is the only body field
   any of them carries (1 of 4). */
const eventsSchema = {
  slug: workItem.slug,
  kind: workItem.kind,
  name: workItem.name,
  page: workItem.page,
  anchor: workItem.anchor,
  figures: workItem.figures,
  holes: workItem.holes,
  situation: workItem.situation,
  how: workItem.how,
  gathering,
  belongs_to,
  when,
};

/* The four are spelled out rather than built by a helper. A helper needs the
   schema widened to a parameter, and widening it detaches `slugField: 'slug'`
   from the schema's keys — `Type 'string' is not assignable to type 'never'`.
   Inline, every collection is fully inferred and typechecked. */
const workCollectionOpts = (dir: string) =>
  ({ slugField: 'slug', path: `data/work/${dir}/*`, format: { data: 'json' } }) as const;

export default config({
  /* Direct commits to `main`. A PR per edit would need a developer to merge,
     which is the thing this exists to remove. Change `branchPrefix`/storage
     here if that trade stops being the right one.
     *
     * ★ GATED ON THE CREDENTIALS EXISTING, NOT ON NODE_ENV — and that is a
     * correctness fix, not a preference. `github` storage throws at MODULE LOAD
     * without all three of KEYSTATIC_GITHUB_CLIENT_ID,
     * KEYSTATIC_GITHUB_CLIENT_SECRET and KEYSTATIC_SECRET:
     *
     *     Missing required config in Keystatic API setup when using the
     *     'github' storage mode: - clientId - clientSecret - secret
     *
     * Keyed on NODE_ENV, deploying this before the GitHub App exists would
     * break the production build rather than the editor. Keyed on the env vars,
     * a deployment without them simply runs the editor in local mode — no
     * persistence on Vercel's read-only filesystem, but nothing else breaks —
     * and switches to GitHub the moment the three are set. Same shape as
     * `/api/air` returning 503 without DATA_GOV_IN_KEY, and
     * `config.missing()` in lib/subscriptions.ts: a designed state, not a
     * break. */
  storage: HAS_GITHUB_APP
    ? { kind: 'github', repo: { owner: 'vimlendu-maker', name: 'swechha-website' } }
    : { kind: 'local' },

  ui: {
    brand: { name: 'Swechha' },
    navigation: {
      Work: ['projects', 'journeys', 'campaigns', 'events'],
    },
  },

  collections: {
    projects: collection({
      label: 'Work — Projects',
      ...workCollectionOpts('projects'),
      schema: projectsSchema,
    }),
    journeys: collection({
      label: 'Work — Journeys',
      ...workCollectionOpts('journeys'),
      schema: journeysSchema,
    }),
    campaigns: collection({
      label: 'Work — Campaigns',
      ...workCollectionOpts('campaigns'),
      schema: campaignsSchema,
    }),
    events: collection({
      label: 'Work — Events',
      ...workCollectionOpts('events'),
      schema: eventsSchema,
    }),
  },
});
