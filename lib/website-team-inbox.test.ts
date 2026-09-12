import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { homedir } from 'node:os'

/**
 * THE INBOX IS AN ORGANISATION-WIDE CONVENTION, NOT THIS DEPARTMENT'S INVENTION.
 *
 * The owner's instruction, 2026-09-11: make the inbox architecture
 * organisation-wide rather than inventing a different task system for every
 * department. The spec lives in the vault at `swechha/ai/README.md` and governs
 * every AI department Swechha runs; this department's runner implements it.
 *
 * The spec travels between repositories; the executable deliberately does not.
 * The vault is shared with Swechha colleagues, so a runner script stored there
 * would be editable by anyone with vault access while running unattended with
 * write access to a live site. Which leaves conformance to be checked rather
 * than shared — that is what this file is for. Department two gets the same
 * test, and the paths below are the contract both must satisfy.
 *
 * Reads are inside each it(): a throw during collection makes vitest report
 * "no tests" instead of a failure, hiding every other assertion in the file.
 */

const ROOT = join(__dirname, '..')
const read = (p: string) => readFileSync(join(ROOT, p), 'utf8')
const VAULT = join(homedir(), 'swechha-vault')

describe('inbox: the org-wide convention', () => {
  it('every path derives from $DEPARTMENT rather than being hardcoded', () => {
    const run = read('scripts/website-team/run.sh')
    expect(run).toMatch(/DEPARTMENT="\$\{WEBSITE_TEAM_DEPARTMENT:-website\}"/)
    // The three derived paths. A literal 'website' in any of them means the
    // next department has to rewrite the script instead of setting a variable.
    expect(run).toMatch(/RECORDS="\$VAULT\/swechha\/\$DEPARTMENT\/decisions"/)
    expect(run).toMatch(/INBOX="\$VAULT\/swechha\/\$DEPARTMENT\/team\/inbox\.md"/)
    expect(run).toMatch(/ORG_INBOX="\$VAULT\/swechha\/ai\/inbox\.md"/)
    expect(run, 'the record filename must derive from the department too')
      .toMatch(/OUT="\$RECORDS\/\$STAMP-\$DEPARTMENT-team-\$MODE\.md"/)
    expect(run, 'the activity log actor must be the department, not a literal')
      .toMatch(/"\$EV" "\$DEPARTMENT" manager/)
  })

  it('the manager is told to read BOTH inboxes, and only to claim its own', () => {
    const run = read('scripts/website-team/run.sh')
    // Both modes name both files, so neither can be quietly dropped.
    const prompts = run.match(/PROMPT="[\s\S]*?"\n/g) ?? []
    expect(prompts.length).toBe(2)
    for (const p of prompts) {
      expect(p, 'a run mode that does not name both inboxes').toMatch(/\$INBOX/)
      expect(p).toMatch(/\$ORG_INBOX/)
    }
    const role = read('.claude/agents/website-manager.md')
    expect(role).toMatch(/swechha\/ai\/inbox\.md/)
    // The rule that stops two departments doing one job.
    expect(role.toLowerCase()).toMatch(/never both act|both act on one job/)
  })

  it('no agent is given a write path to any inbox', () => {
    const policy = JSON.parse(read('docs/website-team/policy.json')) as {
      inbox: { read_only_for_agents: boolean; org_inbox: string; spec: string }
      allowlist: { write: string[]; read: string[] }
    }
    expect(policy.inbox.read_only_for_agents).toBe(true)
    // The only vault write is the department's own decisions folder. An agent
    // that can edit the list of jobs can mark its own homework.
    for (const w of policy.allowlist.write) {
      expect(w, `${w} would let an agent edit an inbox`).not.toMatch(/inbox/)
      if (w.includes('swechha-vault')) expect(w).toMatch(/decisions$/)
    }
    // And the org folder is readable but never writable.
    expect(policy.allowlist.read.some((r) => r.includes('/swechha/ai'))).toBe(true)
    expect(policy.allowlist.write.some((w) => w.includes('/swechha/ai'))).toBe(false)
  })

  it('the runner grants no Write or Edit tool into the vault at all', () => {
    const run = read('scripts/website-team/run.sh')
    const allowed = [...run.matchAll(/ALLOWED="?\$?\{?ALLOWED\}?,?([^"]*)"/g)].map((m) => m[1]).join(',')
    expect(allowed, 'the manager must have no file-write tool whatsoever')
      .not.toMatch(/\b(Write|Edit|NotebookEdit)\b/)
  })

  it('the spec and the org inbox actually exist in the vault', () => {
    // A convention nothing implements is a document, not an architecture. If
    // the vault is absent (another machine, a CI runner), skip rather than
    // fail — this asserts the local install, not the repository.
    if (!existsSync(VAULT)) return
    for (const f of ['swechha/ai/README.md', 'swechha/ai/inbox.md']) {
      expect(existsSync(join(VAULT, f)), `${f} is missing from the vault`).toBe(true)
    }
    const spec = readFileSync(join(VAULT, 'swechha/ai/README.md'), 'utf8')
    // The spec must carry the rules the code relies on, in the same words.
    expect(spec).toMatch(/swechha\/<department>\/team\/inbox\.md/)
    expect(spec).toMatch(/swechha\/ai\/inbox\.md/)
    expect(spec).toMatch(/only ACTED ON if it names a department/i)
    expect(spec).toMatch(/No agent may edit an inbox/i)
    expect(spec, 'the spec must say why the code is not stored in the vault')
      .toMatch(/shared with Swechha colleagues/i)
  })

  it('this department is listed in the org register, so the owner can find it', () => {
    if (!existsSync(VAULT)) return
    const spec = readFileSync(join(VAULT, 'swechha/ai/README.md'), 'utf8')
    expect(spec).toMatch(/vimlendu-maker\/swechha-website/)
  })
})

describe('inbox: urgency, and the sentinel it feeds', () => {
  const readSh = (p: string) => readFileSync(join(ROOT, p), 'utf8')

  it('only NOW and TODAY — colon or #tag — wake the department off-schedule', () => {
    const src = readSh('scripts/website-team/on-change.sh')
    // Everything else is queued, because every run is an LLM invocation and a
    // BACKLOG idea typed at midnight must not bill one.
    expect(src).toMatch(/URGENT[\s\S]*-eq 0/)
    expect(src, 'a non-urgent change must record the hash and NOT run')
      .toMatch(/leaving it for the next scheduled run/)

    // Since 4406b9ee, `#now`/`#today` (the Obsidian tag form) are urgent too,
    // not just `NOW:`/`TODAY:`. Pull the REAL strip+match pipeline out of the
    // script and run sample lines through it, rather than asserting a regex
    // string that could drift from what the script actually executes.
    const sedMatch = src.match(/sed -E '([^']*)'/)
    const grepMatch = src.match(/grep -icE '([^']*)'/)
    expect(sedMatch, 'could not find the leading-marker strip in on-change.sh').not.toBeNull()
    expect(grepMatch, 'could not find the URGENT match pattern in on-change.sh').not.toBeNull()
    const [, sedPattern] = sedMatch!
    const [, grepPattern] = grepMatch!

    const urgentCountFor = (line: string) =>
      Number(
        execFileSync(
          'bash',
          [
            '-c',
            'printf "%s\\n" "$1" | sed -E "$2" | grep -icE "$3" || true',
            '_',
            line,
            sedPattern,
            grepPattern,
          ],
          { encoding: 'utf8' },
        ).trim(),
      )

    // The colon form, bulleted or not.
    expect(urgentCountFor('NOW: fix the CDN')).toBe(1)
    expect(urgentCountFor('- TODAY: fix the CDN')).toBe(1)
    // The Obsidian tag form — including bulleted, the case that sat unworked
    // on 2026-09-12 until this commit.
    expect(urgentCountFor('#now fix the CDN')).toBe(1)
    expect(urgentCountFor('- #today fix the CDN')).toBe(1)
    // A tag ends at a non-word character: these are different tags.
    expect(urgentCountFor('#nowhere is not urgent')).toBe(0)
    expect(urgentCountFor('#todayish is not urgent')).toBe(0)
    // Everything else still queues rather than waking anyone.
    expect(urgentCountFor('THIS WEEK: refresh the sitemap')).toBe(0)
    expect(urgentCountFor('BACKLOG: someday')).toBe(0)
    expect(urgentCountFor('fix the broken link')).toBe(0)
  })

  it('the manager is told what each prefix means, including WATCH', () => {
    const role = readSh('.claude/agents/website-manager.md')
    for (const p of ['NOW:', 'TODAY:', 'THIS WEEK:', 'BACKLOG:', 'WATCH:']) {
      expect(role, `the role file never explains ${p}`).toContain(p)
    }
    // WATCH must become a monitor, not a one-off look.
    expect(role).toMatch(/never satisfy a `?WATCH`? by checking the condition once/i)
  })

  /* ★ THREE TESTS LEFT WITH THE INSTRUMENT, 2026-09-11. The sentinel, its
     probes, the dashboard renderer and the service inventory moved to the
     swechha-ai repository — it watches two departments and lived inside one of
     them, and this repository is public while the fundraising pipeline it
     monitors is not. The contract they asserted (no model call, a non-zero
     exit, UNKNOWN never healthy, the orchestrator stays thin) is now enforced
     by swechha-ai/tests/test_sentinel_contract.py, where the files can
     actually be seen. A test kept here would guard an empty room. */
})
