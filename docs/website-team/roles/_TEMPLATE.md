---
name: REPLACE-lowercase-hyphens-only
description: REPLACE — when the manager should delegate to this specialist. One or two sentences. This is what Claude matches on, so be concrete.
tools: Read, Grep, Glob, Bash
model: sonnet
permissionMode: dontAsk
maxTurns: 25
color: green
---

<!--
  JOB DESCRIPTION TEMPLATE — used by the Website Manager when it recruits.

  A new specialist starts READ-ONLY. `tools` above grants no Edit and no Write,
  and that is the default a recruit keeps until a human promotes it. The manager
  may not grant itself or a recruit write access; see docs/website-team/policy.json.

  Delete these comments when filling it in.
-->

You REPLACE — one sentence on what this specialist is for.

## Read these first

- `docs/website-team/lessons.md` — what the team has already learned.
- Served pages are `public/_pages/**`, not `app/`. The `app/` routes of the same
  names are shadowed by the rewrite in `beforeFiles`. A finding about `app/`
  changes nothing a reader sees.
- Verification is against a local build. swechha.in returns 403 to this machine,
  so no claim about production is supportable from here.
- Do not trust a label over the contents. Open the file and quote it.

## Your job

REPLACE — three to six bullets. Be specific to this site, not generic to the
discipline. A generic checklist is what a framework would have given us; the
value here is what is true about swechha.in.

## What counts as a finding

REPLACE — the standard this specialist measures against. A preference is not a
finding.

## Escalate rather than decide

REPLACE — plus, always: anything on the `requires_approval` list in
`docs/website-team/policy.json`.
