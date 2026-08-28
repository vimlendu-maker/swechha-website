import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

/**
 * THE WIRING BETWEEN package.json AND .github/workflows/, CHECKED.
 *
 * Two real gaps motivated this file, and neither was visible from either side
 * on its own — you had to hold both open at once:
 *
 *   1. `build:posters` existed in package.json and appeared in NONE of the
 *      four rebuild loops. /posters is a live page (HTTP 200) whose generator
 *      no workflow ran, so it could drift from its data indefinitely and
 *      generated-current.yml — the gate whose whole job is to fail when a
 *      generated page is out of step — never regenerated it and so never
 *      looked. Found 28 August 2026, sitting in an abandoned agent worktree
 *      as an uncommitted one-word fix nobody had landed.
 *
 *   2. `data-refresh.yml` hardcoded the seven situation fetches that
 *      `data:situations` already listed, with nothing keeping the two equal.
 *
 * A workflow that calls a script that does not exist fails loudly and gets
 * fixed. A page whose generator nobody calls fails SILENTLY, forever. This
 * file is for the second kind.
 */

const ROOT = join(__dirname, '..')
const WF_DIR = join(ROOT, '.github', 'workflows')
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')).scripts as Record<string, string>
const workflows = readdirSync(WF_DIR).filter((f) => f.endsWith('.yml'))
const read = (f: string) => readFileSync(join(WF_DIR, f), 'utf8')

/**
 * Every npm script a workflow can invoke — literals AND the ones produced by
 * `for t in a b c; do npm run "build:$t"`. The loop form is the whole reason a
 * naive grep misses these: `npm run "build:$t"` names no script at all.
 */
function invocations(yml: string): Set<string> {
  const out = new Set<string>()
  for (const m of yml.matchAll(/npm run "?([a-z][a-z0-9:._-]*)"?/g)) {
    if (!m[1].endsWith(':')) out.add(m[1])          // drop the `build:` stub of `build:$t`
  }
  for (const m of yml.matchAll(/for\s+(\w+)\s+in\s+([\s\S]*?);\s*do([\s\S]{0,800}?)\n\s*done/g)) {
    const [, varName, itemsRaw, body] = m
    const items = itemsRaw.replace(/\\\s*\n/g, ' ').trim().split(/\s+/).filter(Boolean)
    const pre = new RegExp(`npm run "?([a-z0-9:._-]*)\\$\\{?${varName}\\b`).exec(body)
    if (!pre) continue
    if (items.some((i) => i.includes('$') || i.includes('('))) continue  // computed list, not literal
    for (const it of items) out.add(pre[1] + it)
  }
  return out
}

const allInvoked = new Set<string>()
for (const f of workflows) for (const s of invocations(read(f))) allInvoked.add(s)

describe('every npm script a workflow calls actually exists', () => {
  for (const f of workflows) {
    it(`${f}`, () => {
      const missing = [...invocations(read(f))].filter((s) => !(s in pkg))
      expect(missing, `${f} calls npm scripts that are not in package.json`).toEqual([])
    })
  }
})

/**
 * ★ THE POSTERS TEST. Every page-building script must be reachable from
 * generated-current.yml, which regenerates and fails if the committed tree
 * moves. A generator outside that loop has no gate at all.
 *
 * The allowlist is for scripts that are genuinely NOT page builds of their
 * own — components of `build:situations`, or alternate modes. Adding a name
 * here is a deliberate statement that the page is covered another way; it is
 * not a place to park an inconvenience.
 */
const COVERED_BY_SITUATIONS = [
  'build:situation-air', 'build:situation-yamuna', 'build:situation-heatwave',
  'build:situation-forest-fire', 'build:situation-forest-loss',
  'build:situation-climate-event', 'build:air-india', 'build:index',
  /* One page per PUBLISHED climate event, emitted by build:situations after
     the standing climate page. It is exempt from the by-name gate for a
     reason the other entries do not share: its output set is not fixed. On a
     quiet week it writes nothing at all, and after a regional disaster it
     writes one page — so "regenerate it and fail if the tree moved" is a check
     the gate still performs (build:situations runs it), while a register of
     expected filenames would be wrong by construction. */
  'build:climate-disasters',
]
const NOT_A_PAGE_BUILD = [
  'build',              // next build
  'build:hero:check',   // a --check mode of build:hero, not a second page
  /* A --check mode too, of build:social-cards — which IS in the gate. */
  'build:social-cards:check',
]

describe('every page generator is inside the gate that checks it', () => {
  const gate = invocations(read('generated-current.yml'))

  it('generated-current.yml regenerates every build:* script', () => {
    const exempt = new Set([...COVERED_BY_SITUATIONS, ...NOT_A_PAGE_BUILD])
    const unguarded = Object.keys(pkg)
      .filter((s) => s.startsWith('build') && !exempt.has(s))
      .filter((s) => !gate.has(s))
    expect(unguarded, 'these generators are never run by generated-current.yml, so nothing '
      + 'would notice their page going stale').toEqual([])
  })

  it('the situation sub-builds really are inside build:situations', () => {
    for (const s of COVERED_BY_SITUATIONS) {
      expect(pkg['build:situations'], `${s} is exempted as "covered by build:situations" but is not in it`)
        .toContain(s)
    }
  })
})

/**
 * The situation fetch list is defined once, in package.json. data-refresh.yml
 * used to spell out the same seven scripts a second time.
 */
describe('the situation fetch list is defined in one place', () => {
  it('data-refresh.yml does not hardcode a second copy of it', () => {
    const members = pkg['data:situations'].split('&&').map((x) => x.trim().replace(/^npm run /, ''))
    expect(members.length).toBeGreaterThan(1)
    const yml = read('data-refresh.yml')
    const hardcoded = yml.match(/for\s+s\s+in\s+([\s\S]*?);\s*do/)?.[1] ?? ''
    expect(hardcoded, 'the loop should derive its list from package.json, not restate it')
      .not.toMatch(/data:yamuna[\s\\]+data:heat/)
    for (const m of members) expect(m in pkg, `data:situations names ${m}, which does not exist`).toBe(true)
  })
})

/**
 * ★ THE DEPLOY BUDGET. Vercel Hobby: "You are able to deploy 100 times every
 * 86400 seconds (1 day). Should you hit the rate limit, you will need to wait
 * another day before you can deploy again." Every push to `main` is a
 * deployment, so the Air workflow's push rate is a platform budget, not a
 * style choice.
 *
 * Shipped on 28 August 2026 and caught the same day: a 15-minute poll that
 * commits every successful check is 96 deployments/day from Air alone, before
 * data-refresh, content-rebuild or a human pushing anything — through the
 * ceiling, with a full day of no deploys as the penalty. That is the site
 * frozen, which is the exact failure this cleanup existed to end.
 */
describe('the Air workflow cannot exhaust the Vercel Hobby deploy budget', () => {
  const yml = readFileSync(join(WF_DIR, 'air-hourly.yml'), 'utf8')

  /** Scheduled polls per day, from the cron lines. */
  function pollsPerDay(y: string): number {
    let n = 0
    for (const m of y.matchAll(/- cron: '([^']+)'/g)) {
      const minute = m[1].trim().split(/\s+/)[0]
      n += minute === '*' ? 60 : minute.split(',').length
    }
    return n * 24
  }

  it('polls often enough to catch a new CPCB hour promptly', () => {
    expect(pollsPerDay(yml)).toBeGreaterThanOrEqual(24 * 4 - 1)   // ~15-minute cadence
  })

  it('does NOT publish on every poll — there is a minimum publish interval', () => {
    expect(yml, 'air-hourly.yml must throttle publishing; every push is a Vercel deployment')
      .toMatch(/MIN_PUBLISH_MINUTES/)
    const floor = Number(/MIN_PUBLISH_MINUTES:-(\d+)/.exec(yml)?.[1] ?? 0)
    expect(floor, 'the default publish floor must be a real number of minutes').toBeGreaterThan(0)

    // Worst case: one publish per floor-interval, plus CPCB's hourly
    // observation changes, which share the same slots rather than adding to
    // them. Budget 100/day and leave room for every other workflow and for a
    // human pushing.
    const worstCase = Math.ceil((24 * 60) / floor)
    expect(worstCase, `a ${floor}-minute floor allows ${worstCase} Air deployments/day, `
      + 'which leaves too little of the 100/day Hobby budget for anything else').toBeLessThanOrEqual(60)
  })

  it('a new observation is always published, whatever the floor says', () => {
    expect(yml).toMatch(/if \[ "\$status" = "new_observation" \]/)
  })
})
