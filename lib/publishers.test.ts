import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')) as { scripts: Record<string, string> }
const SCRIPTS = pkg.scripts

/** The ordered target list, read from the one place it lives. */
const BUILD_ALL_SH = readFileSync(join(ROOT, 'scripts', 'build-all.sh'), 'utf8')
const ORDER = (BUILD_ALL_SH.match(/TARGETS="\n([\s\S]*?)\n"/)?.[1] ?? '')
  .split('\n').map((l) => l.trim()).filter(Boolean).map((t) => `build:${t}`)

const WORKFLOW_DIR = join(ROOT, '.github', 'workflows')
const workflows = readdirSync(WORKFLOW_DIR)
  .filter((f) => f.endsWith('.yml'))
  .map((f) => ({ name: f, src: readFileSync(join(WORKFLOW_DIR, f), 'utf8') }))

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ONE REBUILD LOOP AND ONE STAGING LIST, FOR EVERY PUBLISHER.
 * ───────────────────────────────────────────────────────────────────────────
 * ★ THIS REPOSITORY'S MOST REPEATED DEFECT IS A HAND-MAINTAINED LIST THAT HAD
 * TO MOVE IN LOCKSTEP WITH SOMETHING ELSE AND DID NOT. `EDITOR_OWNED` was
 * forgotten four times out of four. `fix(imagery)` was a `git add` list
 * missing `public/images`. `fix(ci): the homepage is built from event data
 * too, and two workflows forgot` was a rebuild list. `fix(build): refresh
 * data/work-links.json, the sixth registry` was a registry list.
 *
 * Measured on 9 September 2026, five publishers commit to `main` on a cron and
 * every one of them carried BOTH a rebuild loop and a staging list of its own:
 *
 *   generated-current  hero + 17 targets + social-cards   (the gate; authoritative)
 *   air-hourly         13 + hero        — missing healthy-cities, learn, schools, journal, social-cards
 *   data-refresh       13 + hero        — the same five
 *   content-rebuild    11 + hero        — those five, plus data and record
 *   climate-events     situations+hero  — missing fifteen
 *   climate-coverage   one page         — missing everything else
 *
 * climate-coverage-hourly staged four trees while rebuilding a single page, so
 * it could commit a data change whose pages it never regenerated. The symptom
 * is always the same and always lands on somebody else: generated-current.yml
 * goes red on a pull request whose author touched none of it.
 *
 * So there is now one `build:all` and one `scripts/stage-generated.sh`, and
 * these tests are what stops either of them quietly acquiring a rival.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/** Every `build:*` target reachable from `target`, expanded through the
 *  aggregates rather than listed — so a chain that grows is followed. */
function expand(target: string, seen = new Set<string>()): Set<string> {
  if (seen.has(target)) return seen
  seen.add(target)
  const body = SCRIPTS[target]
  if (body === undefined) return seen
  for (const m of body.matchAll(/npm run (build:[a-z0-9:-]+)/g)) expand(m[1], seen)
  return seen
}

/** Every target the shared rebuild actually runs, aggregates followed. */
function reachable(): Set<string> {
  const out = new Set<string>()
  for (const t of ORDER) expand(t, out)
  return out
}

describe('one rebuild loop', () => {
  it('build:all exists and is the one place the order lives', () => {
    expect(SCRIPTS['build:all'], 'package.json has no build:all script').toBeTruthy()
    expect(SCRIPTS['build:all']).toContain('scripts/build-all.sh')
    expect(ORDER.length, 'could not read TARGETS out of scripts/build-all.sh').toBeGreaterThan(15)
  })

  it('reaches every build target, without naming a single exception by hand', () => {
    /* ★ DERIVED, NOT LISTED — the same correction made to EDITOR_OWNED.
       The only things allowed outside build:all are described by a RULE and
       not by a roster: an aggregate is not its own member, and a `:check`
       variant is a verifier that deliberately writes nothing. Everything else
       in package.json that can write a page must be reachable from build:all,
       so ADDING A GENERATOR AND FORGETTING THE LOOP IS A RED TEST rather than
       a red gate on an unrelated pull request a week later. */
    const covered = reachable()
    const orphans = Object.keys(SCRIPTS)
      .filter((k) => k.startsWith('build:'))
      .filter((k) => k !== 'build:all')
      .filter((k) => !k.endsWith(':check'))
      .filter((k) => !covered.has(k))

    expect(orphans, `these generators are not reachable from build:all, so no publisher runs `
      + `them and their pages go stale on main: ${orphans.join(', ')}`).toEqual([])
  })

  it('builds the situation pages BEFORE the hero, which is the documented order', () => {
    /* ★ THE ONE ORDERING CONSTRAINT THAT HAS ALREADY COST A WORKFLOW ITS
       CREDIBILITY, and it is recorded in build-hero.mjs in its own words:
       "The daily data-refresh workflow did exactly that — hero first,
       situations second — and went red on most days it had anything to
       report, which is how a real gate becomes a notification people mute."
       build:hero reads the air figure out of the BUILT situation-air.html and
       refuses to write when it disagrees with the dataset, so a hero built
       first compares a fresh number against a page nobody has rebuilt.
       generated-current.yml had it the wrong way round and survived only
       because the gate runs on a tree already in step. */
    expect(ORDER).toContain('build:situations')
    expect(ORDER.indexOf('build:hero')).toBeGreaterThan(ORDER.indexOf('build:situations'))
  })

  it('builds the search index AFTER every page it indexes', () => {
    /* build:search reads the BUILT pages and stores each one's headings and
       hook as its search text, so it has to be last but for the share cards.
       Two things went wrong here before: no publisher ran it at all (only the
       gate did), and the gate's own loop ran `search` before `essays`. The
       landslide context pack found the first: two event pages gained five
       bands and search.html still advertised the three they used to have. */
    const searchAt = ORDER.indexOf('build:search')
    expect(searchAt).toBeGreaterThan(0)
    for (const [at, t] of ORDER.entries()) {
      if (t === 'build:search' || t === 'build:social-cards') continue
      expect(at, `${t} runs after build:search, so a change it makes is missing from `
        + 'the search index until something else rebuilds it').toBeLessThan(searchAt)
    }
  })

  it('writes the share cards last, after every generator', () => {
    expect(ORDER[ORDER.length - 1]).toBe('build:social-cards')
  })
})

/* ═══ THE MEASUREMENT EXEMPTION, AND WHY IT IS NOW CHECKED ════════════════
   Some workflows commit to `main` without being publishers: they rebuild
   nothing and stage ONE data file that no generator reads, so they cannot
   leave a page stale — which is the failure this whole file is about.
   search-console.yml was the first and umami.yml is the second.

   ★ IT USED TO BE A FILENAME SOMEBODY TYPED. `w.name !== 'search-console.yml'`,
   with the reasoning in a comment and a grep the author had run by hand once.
   That is the exact shape this file's own header calls this repository's most
   repeated defect — a hand-maintained list that has to move in lockstep with
   something else. Adding a second name to it would have been the defect
   arriving inside the test written to prevent it.

   So the rule the comment stated is now the rule the code applies. A workflow
   is exempt only while BOTH remain true, re-derived on every run:

     1. it runs no generator at all — no `npm run build:` anywhere in it; and
     2. every path it stages is a data file that NOTHING under scripts/ or
        lib/ reads, other than the script that writes it.

   The day a generator renders one of these files, condition 2 fails, the
   workflow joins PUBLISHERS, and the two assertions below demand it run the
   shared rebuild and the shared staging. That is the outcome the old comment
   asked a future reader to notice; this notices it for them. */
/** ★ COMMENTS ARE NOT READS, and the first version of this check did not know
 *  that. scripts/umami.mjs's header explains why it appends by contrasting
 *  itself with data/seo/search-performance.json — it NAMES that path, in prose,
 *  and the naive substring search counted the mention as a generator rendering
 *  the file. search-console.yml promptly lost an exemption it still deserved.
 *  A gate that accuses correct files is worse than no gate; this repository
 *  calls that "the notification people mute" in scripts/lib/build-all.sh's
 *  neighbourhood and in lib/scripts-parse.test.ts. So the comments come out
 *  before the search goes in. */
const codeOnly = (src: string) => src.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/^\s*\/\/[^\n]*/gm, ' ')

const READERS = [
  ...readdirSync(join(ROOT, 'scripts')).filter((f) => f.endsWith('.mjs')).map((f) => join('scripts', f)),
  ...readdirSync(join(ROOT, 'scripts', 'lib')).filter((f) => f.endsWith('.mjs')).map((f) => join('scripts/lib', f)),
].map((p) => ({ path: p, src: codeOnly(readFileSync(join(ROOT, p), 'utf8')) }))

/** Every `data/…` path a workflow stages with `git add`. */
function stagedDataPaths(src: string): string[] {
  return [...src.matchAll(/git add\s+(?!-A\b)([^\n]*)/g)]
    .flatMap((m) => m[1].trim().split(/\s+/))
    .filter((p) => p.startsWith('data/'))
}

/** Is this data file read by any generator other than the one that writes it? */
function readByAGenerator(dataPath: string, writer: string): boolean {
  return READERS.some((r) => r.path !== writer && r.src.includes(dataPath))
}

describe('one staging list', () => {
  const EXEMPT_WRITERS: Record<string, string> = {
    'search-console.yml': 'scripts/search-console.mjs',
    'umami.yml': 'scripts/umami.mjs',
  }
  const isMeasurementOnly = (w: { name: string; src: string }) => {
    const writer = EXEMPT_WRITERS[w.name]
    if (!writer) return false
    if (/npm run build:/.test(w.src)) return false
    const staged = stagedDataPaths(w.src)
    return staged.length > 0 && staged.every((p) => !readByAGenerator(p, writer))
  }
  const PUBLISHERS = workflows.filter((w) => /git commit/.test(w.src) && !isMeasurementOnly(w))

  it('exempts a measurement job only while it really is one', () => {
    /* The exemption re-derived, not trusted. If umami.yml ever gains a
       `npm run build:`, or data/analytics/audience.json ever gets a reader
       under scripts/, this goes red and the workflow is treated as the
       publisher it has become. */
    for (const name of Object.keys(EXEMPT_WRITERS)) {
      const w = workflows.find((x) => x.name === name)
      expect(w, `${name} is listed as exempt but does not exist`).toBeTruthy()
      expect(isMeasurementOnly(w!), `${name} no longer qualifies for the measurement exemption: `
        + 'it either runs a generator now, or the data file it stages has gained a reader under '
        + 'scripts/. Remove it from EXEMPT_WRITERS — it is a publisher.').toBe(true)
    }
  })

  it('finds the five publishers this is about', () => {
    expect(PUBLISHERS.map((w) => w.name).sort()).toEqual([
      'air-hourly.yml',
      'climate-coverage-hourly.yml',
      'climate-events.yml',
      'content-rebuild.yml',
      'data-refresh.yml',
    ])
  })

  it('gives every publisher the shared rebuild and the shared staging', () => {
    for (const w of PUBLISHERS) {
      expect(w.src, `${w.name} does not run the shared rebuild`).toContain('npm run build:all')
      expect(w.src, `${w.name} does not use the shared staging script`)
        .toContain('scripts/stage-generated.sh')
    }
  })

  it('leaves no publisher a rebuild loop of its own', () => {
    for (const w of workflows) {
      expect(w.src, `${w.name} still carries its own build loop; it will drift from build:all`)
        .not.toMatch(/for t in [^\n]*build:/)
    }
  })

  it('leaves no publisher a staging list of its own', () => {
    /* A bare `git add -A data …` is the list this replaces. The staging script
       names the trees once; a workflow naming them again is a copy that can
       rot, and the copy that rotted is what `fix(imagery)` repaired — 23 of
       the 25 satellite frames the committed metadata cited were absent from
       the repository, because the JPEGs were staged by nothing. */
    for (const w of workflows) {
      if (w.name === 'search-console.yml') continue
      const bare = [...w.src.matchAll(/^\s*git add\s+-A\s+[^\n]*/gm)].map((m) => m[0].trim())
      expect(bare, `${w.name} stages generated trees by hand: ${bare.join(' | ')}`).toEqual([])
    }
  })

  it('names only trees this repository actually has', () => {
    /* ★ THE ASSERTION AIR-HOURLY LEARNED THE HARD WAY, NOW MADE ONCE FOR ALL
       FIVE. Its list named `data/air-history.ndjson`, a path that never
       existed — AD-46 stores that history in a DIRECTORY, data/air-history/ —
       and under `set -e` a `git add` on a missing path exits 128, so the
       publisher was one refactor away from failing on every run. One list
       means one place this can go wrong, and one test to stop it. */
    const sh = readFileSync(join(ROOT, 'scripts', 'stage-generated.sh'), 'utf8')
    const code = sh.split('\n').filter((l) => !/^\s*#/.test(l)).join('\n').replace(/\\\n/g, ' ')
    const staged = [...code.matchAll(/^\s*git add (?:-A )?(.+)$/gm)]
      .flatMap((m) => m[1].trim().split(/\s+/))
      .filter((x) => x && !x.startsWith('-'))

    expect(staged.length, 'could not read the staged trees out of stage-generated.sh')
      .toBeGreaterThan(3)
    for (const rel of staged) {
      expect(existsSync(join(ROOT, rel)), `stage-generated.sh names "${rel}", which does not exist — `
        + 'under `set -e` that is git add exiting 128 on every publisher').toBe(true)
    }
  })

  it('keeps the gate on the shared rebuild too, so it cannot check a different tree', () => {
    /* generated-current.yml does not commit — it rebuilds and compares with an
       unstaged `git diff`. It must run the SAME rebuild as the publishers, or
       the gate is checking a tree no publisher produces, which is how its
       hero-first ordering survived unnoticed. */
    const gate = workflows.find((w) => w.name === 'generated-current.yml')
    expect(gate).toBeTruthy()
    expect(gate!.src).toContain('npm run build:all')
  })
})
