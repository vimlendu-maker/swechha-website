/* THE OBSERVATION TIME-SERIES — AD-46.
   ───────────────────────────────────────────────────────────────────────────
   data/air-delhi.json and data/air-india.json are CURRENT-STATE files: every
   run overwrites them, so the site has always known what the air is and never
   what it WAS. This module is the memory — an append-only store of GENUINE
   CPCB observations under data/air-history/, one NDJSON file per scope per
   month, committed by the same workflow that commits the current state.

   ★ THE TWO CLOCKS ARE DIFFERENT FACTS AND THIS STORE KEEPS BOTH.
     `obs`          CPCB's own observation stamp — IST wall-clock TEXT in
                    CPCB's "DD-MM-YYYY HH:MM:SS" spelling, NEVER converted,
                    never Date-parsed except field-wise. When the air was
                    MEASURED.
     `first_seen`   UTC ISO — when a Swechha poll first saw this observation.
     `last_checked` UTC ISO — the latest poll that saw it. When WE ASKED.
   Confusing them is the site's standing timestamp bug class; the test suite
   has a case that fails if either clock is written in the other's format.

   ★ DEDUP IS BY THE OBSERVATION STAMP — the natural key. CPCB publishes one
   observation per hour; we poll every 15 minutes, so the COMMON case is
   seeing a stamp we already hold. That run must not append a duplicate — it
   updates the existing record's `last_checked` and increments `checks`.
   That is how "don't store duplicates" and "preserve the fetch timestamp"
   (the owner's brief, 26 August 2026) are both satisfied at once.

   ★ CPCB REVISES HOURS. A stamp we already hold can come back with DIFFERENT
   values. Silently overwriting hides the revision; appending duplicates the
   hour. So the record is updated IN PLACE and the change is recorded:
   `revised` counts revisions and `revisions[]` keeps, per revision, when it
   arrived and a compact summary of what the record said before.

   ★ WHY NDJSON IN GIT AND NOT A DATABASE. Production has no database for
   this (no DATABASE_URL in the Vercel env; the site is committed artefacts
   by architecture). One JSON object per line means an append never rewrites
   history, a diff is one readable line, and git supplies provenance —
   every record's arrival is a signed commit. Monthly partitioning keeps a
   file around ~1MB/year for Delhi, so a read-modify-write stays trivial.

   ★ CORRUPTION IS TOLERATED, NEVER FATAL. A crash mid-append can leave a
   malformed trailing line; a malformed line is logged and dropped, and the
   fetch is never crashed over the history store — the current-state files
   outrank it. Rewrites go through a temp file + rename so a crash mid-rewrite
   leaves the old file whole. */
import {
  readFileSync, writeFileSync, appendFileSync, renameSync, mkdirSync, existsSync,
  readdirSync,
} from 'node:fs';
import { join } from 'node:path';

/** CPCB's stamp, parsed FIELD-WISE — same rule and regex as fetch-caaqms.mjs.
    Never `new Date(string)`: the stamp is IST wall-clock text. */
function parseObs(s) {
  const m = /^(\d{2})-(\d{2})-(\d{4})\s+(\d{2}):(\d{2})/.exec(String(s ?? '').trim());
  if (!m) return null;
  const [, dd, mm, yyyy, hh, mi] = m;
  return { y: +yyyy, m: +mm, d: +dd, hh: +hh, mi: +mi };
}

/** Field-wise comparison of two parsed stamps: -1, 0, 1. */
function cmpObs(a, b) {
  for (const k of ['y', 'm', 'd', 'hh', 'mi']) {
    if (a[k] !== b[k]) return a[k] > b[k] ? 1 : -1;
  }
  return 0;
}

/** delhi + '26-08-2026 16:00:00' -> 'delhi-2026-08.ndjson' — the month is the
    OBSERVATION's month (IST), so a poll just after IST midnight files the
    23:00 observation under the month it belongs to, not the month we asked. */
export function historyFile(scope, obs) {
  const p = parseObs(obs);
  if (!p) return null;
  return `${scope}-${p.y}-${String(p.m).padStart(2, '0')}.ndjson`;
}

/** The value fields of a record — everything that describes the OBSERVATION
    itself, none of the bookkeeping about our polling of it. `source` is also
    excluded: the same CPCB observation arriving later via the mirror is the
    same observation, not a revision. */
function valuesOf(entry) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- destructured only to EXCLUDE these keys
  const { obs, first_seen, last_checked, checks, source, revised, revisions, ...values } = entry;
  return values;
}

/** A compact before-image for the revision audit trail — enough to see what
    changed without duplicating a full station list per revision. */
function summaryOf(entry) {
  if (entry.city) {
    return { aqi: entry.city.aqi, band: entry.city.band,
      governing: entry.city.governing, station: entry.city.station,
      mean: entry.mean ?? null, above_limit: entry.above_limit ?? null };
  }
  if (Array.isArray(entry.cities)) {
    const top = entry.cities[0] ?? null;
    // Rows are columnar [city, aqi, ...] (fetch-india) — objects tolerated
    // for any older shape.
    return { cities: entry.cities.length,
      top: top ? (Array.isArray(top) ? { c: top[0], a: top[1] } : { c: top.c, a: top.a }) : null };
  }
  return {};
}

/** Read a store file into entries, tolerating malformed lines (logged,
    dropped, never thrown — a crash mid-append is expected to be survivable). */
function readStore(path) {
  if (!existsSync(path)) return { entries: [], dirty: false };
  const entries = [];
  let dirty = false;
  const raw = readFileSync(path, 'utf8');
  // A file that does not end in a newline was interrupted mid-append; a plain
  // append would GLUE the new record onto the broken line and corrupt it too,
  // so the caller must rewrite instead. `dirty` says so.
  if (raw !== '' && !raw.endsWith('\n')) dirty = true;
  const lines = raw.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    try {
      const e = JSON.parse(line);
      if (!e || typeof e !== 'object' || !parseObs(e.obs)) throw new Error('no parseable obs');
      entries.push(e);
    } catch {
      dirty = true;
      console.warn(`air-history: dropping malformed line ${i + 1} of ${path} — `
        + 'tolerated (a crash mid-append leaves one); the record it held is lost.');
    }
  }
  return { entries, dirty };
}

/** Rewrite via temp + rename so a crash mid-write leaves the old file whole. */
function writeStore(path, entries) {
  const tmp = `${path}.tmp-${process.pid}`;
  writeFileSync(tmp, entries.map((e) => JSON.stringify(e)).join('\n') + '\n');
  renameSync(tmp, path);
}

/**
 * Record one genuine CPCB observation (or one more sighting of it).
 *
 *   recordObservation({ dir, scope, record, now })
 *     dir     the store directory (created if missing)
 *     scope   'delhi' | 'india' — the file prefix
 *     record  { obs: 'DD-MM-YYYY HH:MM:SS', ...value fields }
 *             `obs` is the natural key; everything else is stored as given.
 *             Do NOT pass first_seen/last_checked/checks — this module owns
 *             the bookkeeping fields.
 *     now     UTC ISO string of THIS check (defaults to the wall clock);
 *             injectable so backfills can carry the commit time they came
 *             from and tests can pin the clock.
 *
 * Returns { action, file }:
 *   'appended'  a new observation stamp — a new line
 *   'touched'   same stamp, same values — last_checked/checks updated
 *   'revised'   same stamp, DIFFERENT values — updated in place, audited
 *   'skipped'   unusable input (no parseable obs) — logged, nothing written
 *
 * Never throws for store trouble; the fetch scripts must not die over
 * history. (Programming errors — a missing dir/scope — still throw.)
 */
export function recordObservation({ dir, scope, record, now = new Date().toISOString() }) {
  if (!dir || !scope) throw new Error('recordObservation: dir and scope are required');
  const fname = historyFile(scope, record?.obs);
  if (!fname) {
    console.warn(`air-history: no parseable observation stamp in ${JSON.stringify(record?.obs)} — skipped`);
    return { action: 'skipped', file: null };
  }
  mkdirSync(dir, { recursive: true });
  const path = join(dir, fname);
  const { entries, dirty } = readStore(path);
  const parsed = parseObs(record.obs);
  const idx = entries.findIndex((e) => cmpObs(parseObs(e.obs), parsed) === 0);

  if (idx === -1) {
    const { obs, ...values } = record;
    const entry = { obs, first_seen: now, last_checked: now, checks: 1, ...values };
    // O(1)-ish common case: a new observation is nearly always the newest.
    // A dirty read (malformed line found) forces the rewrite path, which is
    // also what heals the corruption.
    const last = entries[entries.length - 1];
    if (!dirty && (!last || cmpObs(parsed, parseObs(last.obs)) > 0)) {
      appendFileSync(path, JSON.stringify(entry) + '\n');
    } else {
      // A late-arriving older hour (mirror lag) — insert in observation order.
      entries.push(entry);
      entries.sort((a, b) => cmpObs(parseObs(a.obs), parseObs(b.obs)));
      writeStore(path, entries);
    }
    return { action: 'appended', file: path };
  }

  const existing = entries[idx];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- destructured only to EXCLUDE obs
  const { obs, ...incomingValues } = record;
  delete incomingValues.source; // metadata, not a value — see valuesOf()
  const same = JSON.stringify(valuesOf({ ...incomingValues })) === JSON.stringify(valuesOf(existing));
  if (same) {
    existing.last_checked = now;
    existing.checks = (existing.checks || 0) + 1;
    writeStore(path, entries);
    return { action: 'touched', file: path };
  }

  // CPCB revised the hour. Keep the record, take the new values, audit the old.
  const before = summaryOf(existing);
  const kept = {
    obs: existing.obs,
    first_seen: existing.first_seen,
    source: existing.source,
    revisions: [...(existing.revisions || []), { at: now, from: before }],
  };
  entries[idx] = {
    ...kept,
    last_checked: now,
    checks: (existing.checks || 0) + 1,
    revised: (existing.revised || 0) + 1,
    ...incomingValues,
  };
  writeStore(path, entries);
  return { action: 'revised', file: path };
}

/** Read a whole scope back, across months, sorted by observation — the seam
    the report CLI and any future chart build on. */
export function readHistory({ dir, scope }) {
  if (!existsSync(dir)) return [];
  const entries = [];
  for (const f of readdirSync(dir).sort()) {
    if (f.startsWith(`${scope}-`) && f.endsWith('.ndjson')) entries.push(...readStore(join(dir, f)).entries);
  }
  entries.sort((a, b) => cmpObs(parseObs(a.obs), parseObs(b.obs)));
  return entries;
}
