# Website Team

The machinery. **What a human reads lives in the vault**, at
`~/swechha-vault/swechha/website/team/` — the architecture, the baseline
audit, the full agent specifications, the operating policy explained, the scored
backlog and the phased plan. This directory holds only what the agents execute.

- `policy.json` — autonomy level, per-role permissions, the three lists. **Change
  autonomy here, not in an agent.** The `never` list does not move with the dial.
- `roster.json` — who exists and what paths they may touch. Adding a specialist is
  an entry here plus a role file.
- `roles/*.md` — what each agent reads at run time.

## Status

Phase 1. **Only `engineering` is active**, at autonomy level 2, and its first job
shipped as `lib/route-invariant.test.ts` rather than as a scheduled agent — a test
in the repo keeps working whether or not any agent ever runs again.

Manager, design and content_seo are specified but inactive.

## The rule that overrides everything else here

**Served pages are `public/_pages/**`, not `app/`.** `design-routes.ts` rewrites
the built HTML onto the canonical routes in `beforeFiles`, ahead of the
filesystem. An agent editing `app/` to change what a reader sees ships nothing and
will report success. Every role file repeats this because it is the one mistake
that produces confident, invisible failure.

## The other rule

**Do not trust a label over the contents.** Open the file, read it, quote it. This
is the repo's own most-repeated defect class, and it is not hypothetical: a
document named `SWECHHA - PSEA Policy 2023.docx` turned out to carry
"Adopted on September 13, 2022" in every footer.
