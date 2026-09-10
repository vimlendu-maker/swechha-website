import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { LEDGER_PATTERNS, visibleOnly } from '../scripts/lib/ledger-patterns.mjs'

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

/* AD-28 §7's list — NO LONGER COPIED HERE. It used to be, in parallel with the
   identical array in scripts/lib/situation-shell.mjs's build-time gate, and a
   hand-maintained list that has to move in lockstep is this repo's most repeated
   defect. Both now derive from scripts/lib/ledger-patterns.mjs, so a pattern
   added once is enforced in both places: at build time, naming the generator,
   and here over every file on disk, catching a page nobody rebuilt.

   A pattern may declare scope 'visible', which is scanned over the page with
   inline script and style blanked out. See that file for why the sixth one does. */
const STRUCK = LEDGER_PATTERNS as ReadonlyArray<
  readonly [string, RegExp, string, ('file' | 'visible')?]
>

/* ── ONE EXEMPTION, AND IT IS A PROVEN FALSE POSITIVE ───────────────────────
   `unicode-range` values are blanked before scanning. On 24 August 2026 the two
   webfonts moved off Google Fonts into public/fonts, which put the @font-face
   blocks — and their unicode-range subset declarations — inline on all 35 pages.
   The latin-ext range includes the Indian rupee sign's neighbourhood,
   `U+20AD-20C0`, and the string "U+20AD-20C0" contains "AD-2". All 35 pages
   failed at once.

   This is not the thing AD-28 §7 struck. The ruling is about CITATIONS INTO
   THIS REPOSITORY reaching a reader — "AD-27.48", "D-09.3", "§7" — text that
   promises a document the reader cannot open. A hexadecimal codepoint boundary
   is not reader-facing at all, it is not a reference to anything, and it cannot
   be followed. Exempting it removes a false positive; it does not soften the
   gate, which still reads every other byte of every page. Blanked rather than
   deleted so the surrounding text stays contiguous and a real citation adjacent
   to a font declaration could not slip through a seam.

   Narrow on purpose: `unicode-range` and nothing else. If a future collision
   turns up somewhere else, it gets its own line here and its own argument. */
const scannable = (html: string): string =>
  html.replace(/unicode-range:[^;}]*/gi, (m) => ' '.repeat(m.length))

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
      const html = scannable(readFileSync(page, 'utf8'))
      const visible = visibleOnly(html)
      for (const [label, re, why, scope] of STRUCK) {
        const m = re.exec(scope === 'visible' ? visible : html)
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
