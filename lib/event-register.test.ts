import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
// Importing the .mjs script modules directly is the repo's standing convention
// for these — see event-lead.test.ts and active-situation.test.ts.
import { consolidate, selectRegister, REGISTER_CAP, REGISTER_FIGURE_CAP } from '../scripts/lib/event-figures.mjs'

const ROOT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..')

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * A DAY OF RELIEF LOGISTICS MAY NOT DELETE A DEATH TOLL FROM THE HOMEPAGE.
 * ───────────────────────────────────────────────────────────────────────────
 * Read off the live site on 14 September 2026, first slide of the homepage
 * hero, 40pt:
 *
 *     69   independent publishers reporting it
 *
 * A count of press outlets, as the lead number for a disaster that had killed
 * about 1,390 people. The hour before, the same slide read "1,388 — reported
 * dead".
 *
 * Nothing broke. The detector run at 17:02 UTC wrote `impact: {}` because the
 * only headline in the register still printing a number — Press Trust of
 * India, "Nepal flood death toll reaches 1,388" — had been pushed past
 * position 24 by a day of India-angle coverage. Every one of the 24 entries it
 * kept is quoted verbatim below. Exactly one of them carries a casualty word
 * at all (Reuters, "after deadly flood"), and that is an adjective.
 *
 * ★ THE SAME RUN ELECTED THE HEADLINE "Bhote Koshi flood death toll reaches
 *   1,390; over 4,000 still missing" and wrote `impact: {}` underneath it. The
 *   toll was in the item pool. It was not in the register, and the register is
 *   the only thing consolidate() can read.
 *
 * ★ THIS IS event-lead.test.ts's DEFECT THROUGH THE OTHER DOOR. That file
 *   covers the day the page printed 1,377 in its heading over an impact.deaths
 *   of 1,365 — "two pools and two rules". Its fix disqualifies a headline that
 *   disagrees with the figures, and it cannot fire here: an empty impact
 *   disagrees with nothing. The page lost the number instead of contradicting
 *   itself, which is quieter and no better. Both symptoms are the same cause,
 *   and the cause is that the register is narrower than the pool the page
 *   quotes from.
 *
 * ★ EVERY HEADLINE IN THIS FILE IS REAL. The 24 register titles are quoted
 *   from data/climate-events/active/nepal-glof.json as it stood at commit
 *   6f56e273, with their own publishers and published stamps; the PTI line is
 *   quoted from the same file at commit 2003a81a, two hours earlier, where it
 *   was still source id "press-trust-of-india-nepal-flood-death-toll-reaches".
 *   No figure here was chosen, adjusted or invented.
 */

type Src = { id: string; publisher: string; title: string; published: string }
type Row = { value: number; status: string; label: string; source: string[] }
const rowsOf = (r: unknown) => r as Record<string, Row>

/* nepal-glof.json's news register at 6f56e273, all 24 of it, verbatim. */
const RELIEF: Src[] = [
  { id: "the-hindu-india-approves-expedited-expor", publisher: "The Hindu", title: "India approves expedited export of electricity to flood-hit Nepal", published: "Mon, 14 Sep 2026 14:05:39 GMT" },
  { id: "news-on-air-india-sends-first-consignment", publisher: "News On AIR", title: "India sends first consignment of Bailey bridge components to flood-hit Nepal", published: "Sun, 13 Sep 2026 06:44:21 GMT" },
  { id: "the-new-indian-express-india-to-supply-power-to-flood", publisher: "The New Indian Express", title: "India to supply power to flood-hit Nepal for 18 hours a day till December end", published: "Mon, 14 Sep 2026 10:18:44 GMT" },
  { id: "hindustan-times-india-approves-up-to-654-mw-of", publisher: "Hindustan Times", title: "India approves up to 654 MW of power export to flood-hit Nepal for 18 hours every day till December 31", published: "Mon, 14 Sep 2026 15:32:55 GMT" },
  { id: "dd-india-india-approves-power-export-to", publisher: "DD India", title: "India approves power export to Nepal amid flood damage to hydropower infrastructure", published: "Mon, 14 Sep 2026 09:55:32 GMT" },
  { id: "reuters-india-approves-export-of-power", publisher: "Reuters", title: "India approves export of power to Nepal after deadly flood", published: "Mon, 14 Sep 2026 08:50:05 GMT" },
  { id: "swarajyamag-india-dispatches-first-bailey", publisher: "Swarajyamag", title: "India dispatches first Bailey bridge shipment to restore connectivity in flood-hit Betrawati, Nepal", published: "Mon, 14 Sep 2026 10:31:08 GMT" },
  { id: "connectedtoindia-com-india-comes-to-flood-ravaged-n", publisher: "connectedtoindia.com", title: "India comes to flood-ravaged Nepal\u2019s aid amid power shortage; 654 MW export cleared", published: "Mon, 14 Sep 2026 12:16:39 GMT" },
  { id: "deccan-chronicle-india-approves-electricity-sup", publisher: "Deccan Chronicle", title: "India Approves Electricity Supply To Nepal After Flash Flood", published: "Mon, 14 Sep 2026 14:50:32 GMT" },
  { id: "bbc-nepal-floods-the-himalayas-ar", publisher: "BBC", title: "Nepal floods: The Himalayas are melting faster - and India's economy is 'at risk'", published: "Sun, 13 Sep 2026 22:07:22 GMT" },
  { id: "devdiscourse-india-approves-emergency-power", publisher: "Devdiscourse", title: "India Approves Emergency Power Export to Flood-Stricken Nepal", published: "Mon, 14 Sep 2026 14:11:12 GMT" },
  { id: "the-new-indian-express-nepal-seeks-chinese-help-to-re", publisher: "The New Indian Express", title: "Nepal seeks Chinese help to rebuild flood-damaged Rasuwagadhi road", published: "Mon, 14 Sep 2026 11:06:29 GMT" },
  { id: "news-on-air-india-and-nepal-hold-meeting-i", publisher: "News On AIR", title: "India and Nepal hold meeting in Kathmandu on flood forecasting model ahead of monsoon", published: "Sun, 13 Sep 2026 20:53:27 GMT" },
  { id: "india-today-nepal-seeks-china-aid-to-rebui", publisher: "India Today", title: "Nepal seeks China aid to rebuild flood-hit Rasuwagadhi trade road", published: "Mon, 14 Sep 2026 09:18:28 GMT" },
  { id: "daily-pioneer-india-sends-bailey-bridge-comp", publisher: "Daily Pioneer", title: "India sends Bailey bridge components to flood-hit Nepal", published: "Mon, 14 Sep 2026 03:57:55 GMT" },
  { id: "etv-bharat-nepal-floods-hold-lessons-for", publisher: "ETV Bharat", title: "Nepal Floods Hold Lessons For India's Himalayan Future", published: "Mon, 14 Sep 2026 00:30:42 GMT" },
  { id: "press-trust-of-india-us-provides-additional-usd-1-m", publisher: "Press Trust of India", title: "US provides additional USD 1 million aid to Nepal for flood victim identification", published: "Mon, 14 Sep 2026 09:55:15 GMT" },
  { id: "prameyanews-com-india-approves-export-of-power", publisher: "prameyanews.com", title: "India approves export of power to flood-ravaged Nepal", published: "Mon, 14 Sep 2026 15:02:08 GMT" },
  { id: "devdiscourse-india-bolsters-nepal-s-energy", publisher: "Devdiscourse", title: "India Bolsters Nepal's Energy Needs Post-Glacial Flood Catastrophe", published: "Mon, 14 Sep 2026 08:44:51 GMT" },
  { id: "india-today-nepal-flood-recovery-needs-hit", publisher: "India Today", title: "Nepal flood recovery needs hit USD 4.7 billion after Himalayan avalanche", published: "Sun, 13 Sep 2026 11:36:27 GMT" },
  { id: "the-annapurna-express-india-approves-daily-18-hour-p", publisher: "The Annapurna Express", title: "India Approves Daily 18-Hour Power Export to Flood-Hit Nepal", published: "Mon, 14 Sep 2026 14:03:32 GMT" },
  { id: "dd-india-india-sends-eighth-iaf-flight", publisher: "DD India", title: "India sends eighth IAF flight with relief supplies to flood-hit Nepal", published: "Sun, 13 Sep 2026 10:34:23 GMT" },
  { id: "boldnewsonline-com-india-dispatches-first-bailey", publisher: "boldnewsonline.com", title: "India Dispatches First Bailey Bridge Components to Flood-Hit Nepal", published: "Mon, 14 Sep 2026 03:46:30 GMT" },
  { id: "punch-newspapers-india-approves-electricity-exp", publisher: "Punch Newspapers", title: "India approves electricity exports to flood-hit Nepal", published: "Mon, 14 Sep 2026 14:54:33 GMT" },
]

/* The toll headline that had just aged out of it. */
const PTI: Src = {
  id: 'press-trust-of-india-nepal-flood-death-toll-reaches',
  publisher: 'Press Trust of India',
  title: 'Nepal flood death toll reaches 1,388',
  published: 'Sun, 13 Sep 2026 13:16:00 GMT',
}

describe('the register the page quotes from', () => {
  it('has 24 relief headlines and not one figure among them — the state that shipped', () => {
    expect(RELIEF).toHaveLength(REGISTER_CAP)
    const rows = rowsOf(consolidate(RELIEF, { place: 'Nepal' }))
    expect(rows.deaths).toBeUndefined()
    expect(Object.keys(rows)).toHaveLength(0)
  })

  it('admits the toll headline that fell past the cap, and the page has its number back', () => {
    const pool = [...RELIEF, PTI]

    /* What shipped: the cap alone, and the toll is gone. */
    expect(rowsOf(consolidate(pool.slice(0, REGISTER_CAP), { place: 'Nepal' })).deaths)
      .toBeUndefined()

    /* What the register does now. */
    const register = selectRegister(pool, { place: 'Nepal' })
    expect(register).toContain(PTI)
    const rows = rowsOf(consolidate(register, { place: 'Nepal' }))
    expect(rows.deaths?.value).toBe(1388)
    expect(rows.deaths?.source).toContain(PTI.id)
  })

  it('keeps the freshest cap exactly as it was, in order', () => {
    const register = selectRegister([...RELIEF, PTI], { place: 'Nepal' })
    expect(register.slice(0, REGISTER_CAP)).toEqual(RELIEF)
  })

  it('does not admit a later headline that carries no figure — the list may not simply grow', () => {
    const filler: Src[] = Array.from({ length: 30 }, (_, i) => ({
      id: `filler-${i}`,
      publisher: 'Filler',
      title: 'India approves electricity exports to flood-hit Nepal',
      published: 'Mon, 14 Sep 2026 14:54:33 GMT',
    }))
    expect(selectRegister([...RELIEF, ...filler], { place: 'Nepal' })).toHaveLength(REGISTER_CAP)
  })

  it('will not carry another disaster\'s toll into this dossier — the place guard still rules', () => {
    /* The real migration the place guard exists to stop: a Bihar cluster holds
       Nepal's headline because an Indian outlet ran it. Admitting figure-bearing
       items past the cap must not become a second door into the same defect. */
    const bihar = selectRegister([...RELIEF, PTI], { place: 'Bihar' })
    expect(bihar).not.toContain(PTI)
    expect(bihar).toHaveLength(REGISTER_CAP)
  })

  it('bounds the overflow, so a register cannot run away on a busy day', () => {
    const tolls: Src[] = Array.from({ length: 40 }, (_, i) => ({
      id: `toll-${i}`,
      publisher: `Outlet ${i}`,
      title: `Nepal flood death toll reaches 1,3${String(10 + i).slice(0, 2)}`,
      published: 'Sun, 13 Sep 2026 13:16:00 GMT',
    }))
    const register = selectRegister([...RELIEF, ...tolls], { place: 'Nepal' })
    expect(register).toHaveLength(REGISTER_CAP + REGISTER_FIGURE_CAP)
  })

  it('never cites a source the register does not hold — on every dossier on disk', () => {
    /* The rule the widening exists to serve, and the one it must not break. A
       figure citing a source that is not listed beneath it is the dangling
       citation that once held this pipeline red for eleven runs. */
    const dir = join(ROOT_DIR, 'data/climate-events/active')
    if (!existsSync(dir)) return
    const files = readdirSync(dir).filter((f) => f.endsWith('.json'))
    expect(files.length).toBeGreaterThan(0)
    for (const f of files) {
      const ev = JSON.parse(readFileSync(join(dir, f), 'utf8'))
      const held = new Set((ev.sources ?? []).map((s: { id: string }) => s.id))
      for (const [metric, claim] of Object.entries(ev.impact ?? {})) {
        for (const id of (claim as { source?: string[] })?.source ?? []) {
          expect(held.has(id), `${f}: impact.${metric} cites ${id}, not in its register`).toBe(true)
        }
      }
    }
  })
})
