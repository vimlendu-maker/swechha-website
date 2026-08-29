#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════
   extract-event-figures.mjs — FILL `impact` ON DOSSIERS ALREADY ON DISK.
   ───────────────────────────────────────────────────────────────────────────
   The detector now writes `impact` on every run, so a NEW event arrives with
   its figures already read. Twenty-three dossiers predate that and would
   otherwise wait for the next time the detector happened to re-cluster them —
   which for an event whose evidence has stopped moving is never, because the
   fingerprint check exists precisely to stop a quiet run rewriting a file.

   So this applies the same one implementation, consolidate(), to what is
   already committed. No network, no feeds: every headline it reads is the
   `sources` register inside the dossier itself.

   ★ IT IS IDEMPOTENT AND IT NEVER OVERWRITES AN EDITOR.
   A metric already present in `impact` is left exactly as it is, including its
   status word — a person may legitimately have set `confirmed`, which a
   headline can never earn. So running this twice changes nothing, and running
   it after an editorial pass changes nothing an editor did.

   ★ IT WRITES NOTHING WHEN IT FOUND NOTHING.
   A dossier whose headlines carry no numbers is left byte-identical rather
   than rewritten with an empty object, because every write here is a commit
   and every commit is a deployment.

   Usage:
     node scripts/extract-event-figures.mjs
     node scripts/extract-event-figures.mjs --dry-run
     node scripts/extract-event-figures.mjs --slug nepal-glof
   ═══════════════════════════════════════════════════════════════════════════ */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { consolidate, METRIC_LABEL } from './lib/event-figures.mjs';
import { validateEvent } from './lib/climate-events.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIR = join(ROOT, 'data', 'climate-events', 'active');
const ARGV = process.argv.slice(2);
const DRY = ARGV.includes('--dry-run');
const ONLY = (() => { const i = ARGV.indexOf('--slug'); return i >= 0 ? ARGV[i + 1] : null; })();

let changed = 0;
let looked = 0;

for (const f of readdirSync(DIR).filter((x) => x.endsWith('.json'))) {
  const path = join(DIR, f);
  const raw = readFileSync(path, 'utf8');
  const e = JSON.parse(raw);
  if (ONLY && e.slug !== ONLY) continue;
  looked++;

  const read = consolidate(e.sources || [], { place: e.location?.text });
  const existing = e.impact || {};
  const added = Object.keys(read).filter((k) => !(k in existing));
  if (!added.length) {
    console.log(`  ${String(e.slug).padEnd(26)} nothing new`);
    continue;
  }

  const next = { ...e, impact: { ...read, ...existing } };

  /* ★ VALIDATED BEFORE IT IS WRITTEN, WITH THE REAL GATE.
     validateEvent() is what the page build runs, and it throws on a claim
     whose source id is not in the file's own register. Running it here means a
     bad extraction fails this script rather than the build of a live disaster
     page on the next scheduled run. */
  try {
    validateEvent(`active/${f}`, next);
  } catch (err) {
    console.error(`  ${String(e.slug).padEnd(26)} REFUSED — ${err.message}`);
    process.exitCode = 1;
    continue;
  }

  console.log(`  ${String(e.slug).padEnd(26)} + ${added.map((k) => {
    const c = read[k];
    const sp = c.spread;
    return `${METRIC_LABEL[k] || k} ${c.value}`
      + (sp && sp.max > sp.min ? ` (${sp.min}–${sp.max}, ${sp.outlets} outlets)` : '')
      + ` [${c.status}]`;
  }).join(', ')}`);

  if (!DRY) writeFileSync(path, `${JSON.stringify(next, null, 2)}\n`);
  changed++;
}

console.log(`\n${looked} dossier(s) read, ${changed} ${DRY ? 'would change' : 'updated'}.`);
