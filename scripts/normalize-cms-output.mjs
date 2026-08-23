#!/usr/bin/env node
/**
 * normalize-cms-output.mjs — put back the nulls Keystatic cannot write.
 *
 *   node scripts/normalize-cms-output.mjs <reference-dir> <target-dir> [--dry]
 *
 * THE PROBLEM, PROVEN RATHER THAN ASSUMED.
 * Keystatic serialises its schema. It has no `string | null` field: a text
 * field that an editor leaves blank is written as `""`, and an object field is
 * written with empty members rather than as `null`. On this data that is not
 * cosmetic. `build-work-pages.mjs:468` reads
 *
 *     if (it.situation != null) { ...only air|yamuna|forest-loss are verified... }
 *
 * and `""` satisfies `!= null`. Setting one item's `situation` to `""` and
 * running `npm run build:work` gives, exactly:
 *
 *     ✗ projects/me-to-we: "situation" is "" — only air, yamuna and
 *       forest-loss are verified (data schema §5.4)
 *     1 gate failure(s). Nothing was written.
 *
 * 17 of the 23 work items carry `situation: null`, so an unfixed CMS save would
 * fail the build for most of the collection. `frame` is the same shape —
 * `null` is explicitly permitted (`build-work-pages.mjs:640`) and an empty
 * `{alt:"",src:""}` is not.
 *
 * WHY THIS IS DRIVEN BY THE PREVIOUS COMMIT AND NOT A FIELD LIST.
 * A hardcoded list of nullable fields is a second source of truth that goes
 * stale the moment someone adds one. Instead: wherever the REFERENCE (the file
 * as it was before the edit) holds `null` and the TARGET now holds an empty
 * equivalent — `""`, `{}`, or an object whose every leaf is `""` — the null is
 * restored. Anywhere the reference was not null, nothing is touched.
 *
 * That is safe because `""` is never a legal value for these fields anyway:
 * the builder rejects it. So `"" -> null` cannot destroy a deliberate editor
 * choice; there is no valid edit it could be confused with.
 *
 * Run BEFORE the builders and before verify-data-fidelity.mjs, which then
 * confirms nothing else was lost.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const [, , refDir, targetDir, ...rest] = process.argv;
const DRY = rest.includes('--dry');

if (!refDir || !targetDir) {
  console.error('usage: normalize-cms-output.mjs <reference-dir> <target-dir> [--dry]');
  process.exit(2);
}

function jsonFiles(root) {
  const out = [];
  const walk = (d) => {
    let entries;
    try { entries = readdirSync(d); } catch { return; }
    for (const e of entries) {
      const p = join(d, e);
      if (statSync(p).isDirectory()) walk(p);
      else if (e.endsWith('.json')) out.push(relative(root, p));
    }
  };
  walk(root);
  return out.sort();
}

/** `""`, `{}`, `[]`, or an object/array whose every leaf is one of those. */
function isEmptyish(v) {
  if (v === '') return true;
  if (Array.isArray(v)) return v.length === 0 || v.every(isEmptyish);
  if (v && typeof v === 'object') {
    const ks = Object.keys(v);
    return ks.length === 0 || ks.every((k) => isEmptyish(v[k]));
  }
  return false;
}

/** Walk reference and target together; restore nulls. Returns paths restored. */
function restore(ref, tgt, path, out) {
  if (ref === null) {
    if (tgt !== null && isEmptyish(tgt)) { out.push(path); return { replace: true }; }
    return { replace: false };
  }
  if (!ref || typeof ref !== 'object' || !tgt || typeof tgt !== 'object') return { replace: false };

  if (Array.isArray(ref) && Array.isArray(tgt)) {
    ref.forEach((r, i) => {
      if (i >= tgt.length) return;
      const res = restore(r, tgt[i], `${path}[${i}]`, out);
      if (res.replace) tgt[i] = null;
    });
    return { replace: false };
  }
  if (Array.isArray(ref) !== Array.isArray(tgt)) return { replace: false };

  for (const k of Object.keys(ref)) {
    if (!(k in tgt)) continue;
    const res = restore(ref[k], tgt[k], path ? `${path}.${k}` : k, out);
    if (res.replace) tgt[k] = null;
  }
  return { replace: false };
}

const read = (p) => { try { return JSON.parse(readFileSync(p, 'utf8')); } catch { return undefined; } };

let touched = 0, total = 0;
for (const rel of jsonFiles(refDir)) {
  const ref = read(join(refDir, rel));
  const tgtPath = join(targetDir, rel);
  const tgt = read(tgtPath);
  if (ref === undefined || tgt === undefined) continue;
  const out = [];
  restore(ref, tgt, '', out);
  if (out.length) {
    touched += 1; total += out.length;
    console.log(`  ${rel}`);
    for (const p of out) console.log(`    null restored  ${p || '(root)'}`);
    if (!DRY) writeFileSync(tgtPath, `${JSON.stringify(tgt, null, 2)}\n`);
  }
}

console.log(
  touched
    ? `\n${total} null(s) restored across ${touched} file(s)${DRY ? ' (dry run — nothing written)' : ''}.`
    : 'No nulls needed restoring.',
);
