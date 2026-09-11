/* ═══════════════════════════════════════════════════════════════════════════
   THE ONE LIST OF THINGS THAT MAY NOT REACH A READER.

   Two gates enforce it and they used to hold two copies of it:
     · situation-shell.mjs's AD-28 §7 gate, which stops the page being built
       RIGHT NOW and names the generator that did it;
     · lib/provenance.test.ts, which re-reads every built file on disk and so
       catches a page nobody rebuilt.
   A hand-maintained list that must move in lockstep is this repo's most
   repeated defect. It is derived from here now, in both places, so a pattern
   added once is enforced twice.

   ★ THE SIXTH PATTERN IS NEW, 10 September 2026, AND IT IS WHY THIS FILE
     EXISTS. AD-28 struck citations INTO this repository — "SOURCE-FACTS",
     "§7", "AD-27.48". The owner's copy pass of 10 September struck a second
     class the original five never caught: the site NARRATING ITS OWN
     CONSTRUCTION. /journal shipped the sentence "scripts/propose-journal.mjs
     reads the datasets behind the live pages", and the four active-situation
     pages shipped "assembled … by scripts/detect-climate-events.mjs". Both
     name a file in this repository, and a reader cannot open either.

     Scoped to `scripts/<name>.mjs` rather than a bare `.mjs` deliberately: a
     path into this repo's own scripts directory has no legitimate reader-facing
     use and cannot appear by accident.

     AND SCOPED TO VISIBLE TEXT, which the first five are not. The original five
     are citations a reader could follow — the ruling's point is that view-source
     is still reading, so they are scanned over the whole file, comments included.
     This one is about the site EXPLAINING ITSELF IN ITS OWN COPY. A generator
     naming itself in a JS comment is developer documentation and out of AD-28's
     scope by that ruling's own §6; `design/home.html` ships two such comments
     inside its inline script today and they are not the defect. The defect is
     `<code>scripts/propose-journal.mjs</code>` in a paragraph. Hence `visible`.

   NOT IN SCOPE, and deliberately: comments in the .mjs generators. Those are
   the design record, they never reach a reader, and AD-28 §6 says so. Do not
   delete a comment to satisfy a gate.
   ═══════════════════════════════════════════════════════════════════════════ */

/** Strip inline script and style so a pattern can be scanned over reader-visible
    text only. Blanked rather than removed, so offsets stay usable for context. */
export const visibleOnly = (html) => html
  .replace(/<script\b[\s\S]*?<\/script>/gi, (m) => ' '.repeat(m.length))
  .replace(/<style\b[\s\S]*?<\/style>/gi, (m) => ' '.repeat(m.length));

/** @type {Array<[label: string, re: RegExp, why: string, scope?: 'file'|'visible']>} */
export const LEDGER_PATTERNS = [
  ['SOURCE-FACTS', /SOURCE-FACTS/,
    'a citation into a working file in this repository. A reader cannot follow one, cannot check one, and was never meant to see one.'],
  ['§', /§/,
    'a section-mark citation into a repository ledger. The line numbers behind them drift the moment the ledger is edited.'],
  ['AD-2', /\bAD-2\d/, 'an internal design-ruling id.'],
  ['D-0', /\bD-0\d/, 'an internal decision id.'],
  ['W-1', /\bW-1\d/, 'an internal WORK-pass ruling id.'],
  ['scripts/*.mjs', /scripts\/[a-z0-9-]+\.mjs/,
    'the name of a build script in this repository. The page is describing how it was made; '
    + 'a reader cannot open the file and did not ask how the site works.', 'visible'],
];
