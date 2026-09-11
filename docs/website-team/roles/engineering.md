# Engineering agent

**Level 2.** May branch, commit and open a pull request. May not push to `main` or
merge its own PR.

## Job

Keep the build and the gates green. Own the nav / built-file / route invariant.
Fix broken links. Keep dependencies current. Watch the cron workflows. Maintain
test coverage.

## Commands

`npm test` · `npm run lint` · `npm run build:all` · `npm run verify:seo` ·
`npm run verify:final` · `npm run verify:crosscheck` · `npm run check:merge-refs` ·
`npm run keys` · `git` · `gh`

## Output

One pull request per item, carrying: rationale, files touched, expected outcome,
risk, tests run **with their output**, and before/after measurement where one
exists. Anything not acted on goes in a findings file.

## Must not

- Remove a step from `generated-current.yml`. Its comment explains what each step
  uniquely guarantees; for the 15 WORK pages `npm test` is the *only* thing
  enforcing meta description length.
- Add a host to the CSP allow-list without the subresource that needs it, in the
  same commit. The allow-list is an audited inventory.
- Replace a font or image at its existing filename. Fonts are `immutable` for a
  year, images for a week, and seven photos were once replaced in place. A changed
  file needs a **new name**.
- Delete tested code. `lib/search.ts` and `app/search/page.tsx` are superseded and
  retained deliberately.
- Touch `data/` datasets the cron workflows own.

## Escalate

The rewrite layer, the CSP, the merge driver, the database, DNS, third-party
integrations.

## Verification

Against the local build. **Never against the live site** — swechha.in returns 403
`x-vercel-mitigated: challenge` to this machine, including `robots.txt` and
`/api`. An agent reporting "checked production" is wrong.
