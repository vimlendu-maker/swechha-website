import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

/**
 * AD-28 §7 — THE MECHANICAL ACCEPTANCE TEST, WIRED AS A GATE.
 *
 * The ruling (`docs/design/2026-08-23-AD-28-provenance-strip.md` §7) states it
 * in one line: zero occurrences, in any file under `public/_pages/v3/`, of
 * `SOURCE-FACTS`, `§`, `AD-2`, `D-0`, `W-1`. It had never been wired to
 * anything, and the site failed it on twenty of thirty-five pages while every
 * page READ as if it passed — the strings were all in HTML, CSS and JS
 * comments, which no reader sees and every "view source" does.
 *
 * ★ THE TEST IS OVER THE WHOLE FILE, COMMENTS INCLUDED. That is the ruling's
 * own wording and its own reason: "a reader who views source is still a reader,
 * and a grep that has to special-case the rule's own documentation proves
 * nothing." The engineering record is not deleted to satisfy this — it stays in
 * the `.mjs` generators and in `design/home.html`, both of which are developer
 * documentation and explicitly outside AD-28's scope, and the emitted pages are
 * stripped at build time (`stripCssComments` / `stripHtmlComments` /
 * `redactScriptLedgerRefs` / `shipDocument`, all in
 * `scripts/lib/situation-shell.mjs`).
 *
 * ★ WHY A TEST AND NOT ONLY A BUILD GATE. Every generator gates its own output,
 * which catches the page being rebuilt and nothing else. This runs over what is
 * ON DISK, so it also catches a page that was hand-edited, a page whose
 * generator regressed, and a page nobody has rebuilt since the rule landed.
 * `npm test` is the only thing that sees all thirty-five at once.
 *
 * ★ IT IS A GATE, NOT A REPORT: it fails, it names the file, and it prints the
 * surrounding characters so the offending line can be found without a second
 * search.
 */

const V3 = join(process.cwd(), 'public', '_pages', 'v3')

/* AD-28 §7's list, verbatim. `§` is here as a bare character because that is
   how the ruling writes it — it only ever appeared on these pages as a citation
   into a repository ledger, and no reader-facing copy on this site uses one. */
const STRUCK: Array<[string, RegExp, string]> = [
  ['SOURCE-FACTS', /SOURCE-FACTS/, 'a citation into a working file in this repository. A reader cannot follow one and was never meant to see one.'],
  ['§', /§/, 'a section-mark citation into a repository ledger. The line numbers behind them drift the moment the ledger is edited.'],
  ['AD-2', /AD-2/, 'an internal design-ruling id.'],
  ['D-0', /D-0/, 'an internal decision id.'],
  ['W-1', /W-1/, 'an internal WORK-pass ruling id.'],
]

function builtPages(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return builtPages(path)
    return name.endsWith('.html') ? [path] : []
  })
}

describe('AD-28 §7 — no internal ledger reference reaches a built page', () => {
  const pages = builtPages(V3)

  /* If the glob ever finds nothing the assertions below all pass vacuously,
     which is the one way a gate like this rots without anybody noticing. */
  it('finds the built pages at all', () => {
    expect(pages.length).toBeGreaterThan(30)
  })

  for (const page of pages) {
    const name = relative(V3, page)
    it(`${name} carries no ledger reference`, () => {
      const html = readFileSync(page, 'utf8')
      for (const [label, re, why] of STRUCK) {
        const m = re.exec(html)
        const context = m
          ? JSON.stringify(html.slice(Math.max(0, m.index - 90), m.index + 90).replace(/\s+/g, ' '))
          : ''
        expect(
          m,
          `${name} ships ${JSON.stringify(label)} — ${why}\n` +
            `  Context: ${context}\n` +
            '  This is not fixed by hand-editing the built file: it is generated. Strip it in\n' +
            '  the generator that emits it (scripts/lib/situation-shell.mjs assemble(), or\n' +
            '  work-shell.mjs buildPage(), or build-hero.mjs for home.html) and rebuild.',
        ).toBeNull()
      }
    })
  }
})
