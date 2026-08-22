#!/usr/bin/env node
/**
 * verify-data-fidelity.mjs — did an edit LOSE anything?
 *
 *   node scripts/verify-data-fidelity.mjs <before-dir> <after-dir> [--json]
 *
 * WHY THIS EXISTS.
 * The CMS (Keystatic, mounted at /keystatic) writes `data/**.json` by
 * SERIALISING ITS SCHEMA — not by patching the file. Anything the schema does
 * not declare is not written back. On these files that is not a cosmetic risk:
 * `_rulings`, `_note`, `_holes`, `holes[]`, `source`, `basis` and `period` are
 * the provenance this whole site argues from. A dropped `basis` turns a sourced
 * figure into an unsourced one and nothing else would notice.
 *
 * So every CMS commit is checked: for each file, every key path present BEFORE
 * must still be present AFTER, and no non-empty value may become empty.
 *
 * WHAT COUNTS AS A LOSS (exit 1):
 *   · a key path disappears
 *   · a non-empty string/array/object becomes empty
 *   · a non-null value becomes null
 *
 * WHAT DOES NOT (reported, exit 0):
 *   · key REORDERING — JSON objects are unordered and Keystatic rewrites order
 *   · whitespace / trailing-newline changes
 *   · a value CHANGING to another non-empty value — that is an edit, the point
 *     of a CMS. This tool guards against silent deletion, not against editing.
 *
 * `null` -> `""` IS A LOSS HERE, deliberately. `situation: null` means "this
 * item has no situation page"; `situation: ""` is a different claim, and the
 * builders branch on it.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const [, , beforeDir, afterDir, ...rest] = process.argv;
const AS_JSON = rest.includes('--json');

if (!beforeDir || !afterDir) {
  console.error('usage: verify-data-fidelity.mjs <before-dir> <after-dir> [--json]');
  process.exit(2);
}

/** Every *.json under a directory, as paths relative to it. */
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

const isEmpty = (v) =>
  v === '' ||
  (Array.isArray(v) && v.length === 0) ||
  (v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0);

/** Walk `before`, recording every path, and compare against `after`. */
function compare(before, after, path, losses) {
  if (before === null || typeof before !== 'object') {
    if (after === undefined) losses.push({ path, kind: 'key removed', was: before });
    else if (before !== null && after === null) losses.push({ path, kind: 'value nulled', was: before });
    else if (!isEmpty(before) && isEmpty(after)) losses.push({ path, kind: 'value emptied', was: before });
    return;
  }
  if (after === undefined) { losses.push({ path, kind: 'key removed', was: summarise(before) }); return; }
  if (after === null) { losses.push({ path, kind: 'value nulled', was: summarise(before) }); return; }
  if (!isEmpty(before) && isEmpty(after)) { losses.push({ path, kind: 'value emptied', was: summarise(before) }); return; }

  if (Array.isArray(before)) {
    if (!Array.isArray(after)) { losses.push({ path, kind: 'type changed', was: 'array' }); return; }
    if (after.length < before.length) {
      losses.push({ path, kind: 'array shortened', was: `${before.length} items`, now: `${after.length}` });
    }
    before.forEach((v, i) => { if (i < after.length) compare(v, after[i], `${path}[${i}]`, losses); });
    return;
  }
  if (typeof after !== 'object' || Array.isArray(after)) { losses.push({ path, kind: 'type changed', was: 'object' }); return; }
  for (const k of Object.keys(before)) {
    compare(before[k], after[k], path ? `${path}.${k}` : k, losses);
  }
}

const summarise = (v) =>
  Array.isArray(v) ? `array[${v.length}]`
    : v && typeof v === 'object' ? `object{${Object.keys(v).join(',')}}`
      : String(v);

const read = (p) => { try { return JSON.parse(readFileSync(p, 'utf8')); } catch { return undefined; } };

const files = jsonFiles(beforeDir);
const report = [];
let lost = 0;

for (const rel of files) {
  const before = read(join(beforeDir, rel));
  const after = read(join(afterDir, rel));
  if (before === undefined) continue;
  if (after === undefined) {
    report.push({ file: rel, losses: [{ path: '(whole file)', kind: 'file removed or unparseable' }] });
    lost += 1;
    continue;
  }
  const losses = [];
  compare(before, after, '', losses);
  if (losses.length) { report.push({ file: rel, losses }); lost += losses.length; }
}

if (AS_JSON) {
  console.log(JSON.stringify({ files: files.length, lost, report }, null, 2));
} else {
  console.log(`DATA FIDELITY — ${files.length} file(s) compared\n`);
  if (!report.length) {
    console.log('  No key removed, nulled or emptied. Edits (value changes) are not flagged.');
  } else {
    for (const { file, losses } of report) {
      console.log(`  ${file}`);
      for (const l of losses) {
        console.log(`    ${l.kind.padEnd(18)} ${l.path || '(root)'}${l.was !== undefined ? `  was: ${l.was}` : ''}`);
      }
      console.log('');
    }
    console.log(`REFUSING: ${lost} loss(es). An edit may change a value; it may not delete one.`);
  }
}

process.exit(lost ? 1 : 0);
