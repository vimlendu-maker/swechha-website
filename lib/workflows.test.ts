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
 * WORST-CASE COMMITS A DAY FROM A WORKFLOW'S CRON LINES.
 *
 * Every commit to main is a Vercel deployment, so for a workflow that commits,
 * how often it can run IS its share of the deploy budget. Shared by the Air
 * block and the whole-budget block below, because the two disagreeing about
 * what a cron means is precisely how the budget got overrun.
 *
 * Cron fields are counted, not merely split: `0-17,23` is nineteen hours, not
 * two. An earlier version split on commas alone, which read the Air schedule
 * as two polls a day and would have hidden the very overrun this file exists
 * to catch.
 */
function countField(field: string, span: number): number {
  let n = 0
  for (const part of field.split(',')) {
    if (part === '*') { n += span; continue }
    if (part.startsWith('*/')) { n += Math.ceil(span / Number(part.slice(2))); continue }
    const range = /^(\d+)-(\d+)(?:\/(\d+))?$/.exec(part)
    if (range) {
      const [, a, b, step] = range
      n += Math.floor((Number(b) - Number(a)) / Number(step ?? 1)) + 1
      continue
    }
    n += 1
  }
  return n
}

function scheduledPerDay(y: string, opts: { ignoreFloor?: boolean } = {}): number {
  let n = 0
  for (const m of y.matchAll(/- cron: '([^']+)'/g)) {
    const [minute, hour] = m[1].trim().split(/\s+/)
    n += countField(minute, 60) * countField(hour, 24)
  }
  /* Air publishes at most once per floor-interval however often it polls. */
  const floor = Number(/MIN_PUBLISH_MINUTES:-(\d+)/.exec(y)?.[1] ?? 0)
  return (!opts.ignoreFloor && floor > 0) ? Math.min(n, Math.ceil((24 * 60) / floor)) : n
}

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
  const pollsPerDay = (y: string) => scheduledPerDay(y, { ignoreFloor: true })

  /* ★ HOURLY, NOT FOUR TIMES AN HOUR, AND NOT ALL NIGHT.
     This asserted 95 polls a day — a fifteen-minute cadence — on the reasoning
     that CPCB posts a top-of-hour observation with a 15-35 minute lag, so
     several attempts are surer than one. It was also 96 deployments a day
     before anything else ran, and on 5 September the account hit Vercel's
     hundred-a-day ceiling and froze every deploy for a full day.

     The owner's instruction is one pull an hour and none between midnight and
     05:00 IST. That is nineteen polls a day, at :34 — the far end of CPCB's lag
     window, which is where a single poll has to sit. THE COST IS ACCEPTED AND
     NAMED: an observation published after :34 is missed for that hour and
     collected on the next poll. The floor below is what used to protect the
     budget; the cadence now does, and the floor is left as a belt. */
  it('polls once an hour through the Indian day', () => {
    expect(pollsPerDay(yml)).toBeGreaterThanOrEqual(18)
    expect(pollsPerDay(yml)).toBeLessThanOrEqual(24)
  })

  it('polls at the far end of CPCB\'s publication lag, not on the hour', () => {
    const minutes = [...yml.matchAll(/- cron: '(\S+)/g)].map((m) => Number(m[1]))
    expect(minutes.length).toBeGreaterThan(0)
    for (const m of minutes) expect(m, 'a single hourly poll must clear the 15-35 minute lag')
      .toBeGreaterThanOrEqual(30)
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

/**
 * AND THE BUDGET THE AIR TEST ABOVE COULD ONLY GUARD ONE END OF.
 *
 * That block caps Air at 60 deployments a day and says, in words, that the
 * rest must "leave room for every other workflow and for a human pushing".
 * Nothing enforced the sum, and on 5 September the sum ran out: the account
 * hit the hundred-a-day Vercel ceiling and every deploy — preview and
 * production — stopped for 24 hours, mid-review, with four pull requests open.
 *
 * The arithmetic at that moment, worst case: Air 48 (a 30-minute publish
 * floor), the climate detector 24 (hourly), the news register 24 (hourly),
 * data-refresh 1. Ninety-seven, leaving three for every push anyone makes.
 * Each of those four numbers was defensible on its own and nobody added them
 * up, which is the whole reason this test exists rather than a comment.
 *
 * Every commit to main is a deployment, so a workflow's worst case is simply
 * how often it can run — except Air, which throttles publishing below its poll
 * rate and is therefore capped by that floor rather than by its cron.
 */
describe('the scheduled workflows together cannot exhaust the deploy budget', () => {
  const CEILING = 100          // Vercel Hobby deployments per day
  const RESERVED_FOR_PEOPLE = 20 // pushes and their previews, during a review day

  const committing = workflows.filter((f) => read(f).includes('git commit'))
  const budget = committing.map((f) => [f, scheduledPerDay(read(f))] as const)
  const total = budget.reduce((a, [, n]) => a + n, 0)

  it('has at least one scheduled committer to measure', () => {
    expect(committing.length).toBeGreaterThan(0)
    expect(total).toBeGreaterThan(0)
  })

  it('leaves room for a person to push during a review day', () => {
    const detail = budget.map(([f, n]) => `${f} ${n}`).join(', ')
    expect(total, `scheduled commits total ${total}/day (${detail}). Every commit to main is a `
      + `Vercel deployment, so this must stay under ${CEILING - RESERVED_FOR_PEOPLE} to leave `
      + `${RESERVED_FOR_PEOPLE} for pushes and previews. Raising a cadence means lowering `
      + 'another one, not raising this number.')
      .toBeLessThanOrEqual(CEILING - RESERVED_FOR_PEOPLE)
  })

  it('keeps the news register off an hourly cadence', () => {
    // The one that could give way without costing anything: air's commits
    // track real CPCB readings and the detector's cadence is the disaster
    // pages' whole promise, but a list of headlines is not worse six hours on.
    const n = scheduledPerDay(read('climate-coverage-hourly.yml'))
    expect(n, 'the news register commits on ~every run — Google News returns a slightly '
      + 'different set each hour — so its cadence is its deploy cost, one for one')
      .toBeLessThanOrEqual(8)
  })
})

/**
 * NOTHING IS PULLED BETWEEN MIDNIGHT AND 05:00 IST.
 *
 * The owner's instruction of 5 September, and the kind of rule that a comment
 * cannot keep: cron is written in UTC, India is UTC+5:30, and the offset is
 * half an hour — so the night maps to UTC 18:30-23:30 and the safe hours are
 * NOT a tidy range. Air keeps hours 0-17 and 23; the detector keeps even hours
 * to 18. Anyone adding a slot by eye will put one inside the window sooner or
 * later, and nothing about the result would look wrong.
 *
 * It covers every scheduled workflow, not only the ones that commit — a job
 * that deploys nothing still pulls from somewhere, and may put an email in
 * front of a person at whatever hour it runs.
 *
 * ★ WITH ONE EXEMPTION, HELD HERE BY NAME SO IT CANNOT BE ASSUMED.
 * ward-alerts.yml runs through the night on purpose: Delhi's air is frequently
 * at its worst between midnight and five, so the window the rule would have
 * skipped is the window a subscriber who asked to be told most needs telling
 * in. It was blacked out on 5 September and the owner reversed it the same day.
 *
 * The exemption is affordable only because that job COMMITS NOTHING — the
 * quiet hours exist to protect the deployment budget, and a job that pushes no
 * commit costs none. That condition is asserted below rather than trusted, so
 * adding a commit step to an exempt workflow fails the test instead of quietly
 * spending 24 deployments a day.
 */
describe('no scheduled job runs during the Indian night', () => {
  const IST_OFFSET_MIN = 330
  const QUIET_UNTIL_HOUR = 5

  /** Workflow -> why it is allowed to run in the quiet hours. */
  const EXEMPT: Record<string, string> = {
    'ward-alerts.yml':
      'air alerts are most needed in exactly those hours; it commits nothing, so it costs no deploys',
  }

  /** Every (hour, minute) a cron field pair fires at, in IST. */
  function istSlots(y: string): Array<{ h: number; m: number; utc: string }> {
    const expand = (field: string, span: number): number[] => {
      const out: number[] = []
      for (const part of field.split(',')) {
        if (part === '*') { for (let i = 0; i < span; i++) out.push(i); continue }
        const range = /^(\d+)-(\d+)$/.exec(part)
        if (range) {
          for (let i = Number(range[1]); i <= Number(range[2]); i++) out.push(i)
          continue
        }
        if (part.startsWith('*/')) {
          for (let i = 0; i < span; i += Number(part.slice(2))) out.push(i)
          continue
        }
        out.push(Number(part))
      }
      return out
    }
    const slots = []
    for (const m of y.matchAll(/- cron: '([^']+)'/g)) {
      const [minute, hour] = m[1].trim().split(/\s+/)
      for (const h of expand(hour, 24)) {
        for (const mi of expand(minute, 60)) {
          const t = h * 60 + mi + IST_OFFSET_MIN
          slots.push({ h: Math.floor(t / 60) % 24, m: t % 60, utc: `${h}:${String(mi).padStart(2, '0')}` })
        }
      }
    }
    return slots
  }

  const scheduled = workflows.filter((f) => /- cron: '/.test(read(f)))

  it('finds the scheduled workflows to check', () => {
    expect(scheduled.length).toBeGreaterThanOrEqual(4)
  })

  it('every exemption is real, and still free', () => {
    for (const [f, why] of Object.entries(EXEMPT)) {
      expect(scheduled, `${f} is exempted from the quiet hours but is not a scheduled workflow — `
        + 'a stale exemption hides the next one that matters').toContain(f)
      expect(why.length, `${f}'s exemption must say why`).toBeGreaterThan(20)
      expect(read(f).includes('git commit'),
        `${f} is exempt from the quiet hours ONLY because it commits nothing. It now commits, `
        + 'so running it overnight spends deployments the budget has not been given. Either drop '
        + 'the commit step or drop the exemption.').toBe(false)
    }
  })

  for (const f of scheduled.filter((w) => !(w in EXEMPT))) {
    it(`${f} sleeps until ${QUIET_UNTIL_HOUR}am IST`, () => {
      const inside = istSlots(read(f))
        .filter((s) => s.h < QUIET_UNTIL_HOUR)
        .map((s) => `${String(s.h).padStart(2, '0')}:${String(s.m).padStart(2, '0')} IST (UTC ${s.utc})`)
      expect(inside, `${f} fires during the quiet hours. Cron is UTC and IST is +5:30, so the `
        + 'window is UTC 18:30-23:30 and the permitted hours are not a tidy range')
        .toEqual([])
    })
  }
})
