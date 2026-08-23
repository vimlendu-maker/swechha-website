#!/usr/bin/env node
/**
 * db-migrate.mjs — apply db/*.sql to the database named by DATABASE_URL.
 *
 *   npm run db:migrate            # apply every db/*.sql, in filename order
 *   npm run db:migrate -- --dry   # print what it would run, connect to nothing
 *   npm run db:migrate -- --list  # show the tables that exist now
 *
 * ★ WHY THIS EXISTS. Both schema files told the operator to run
 *   psql "$DATABASE_URL" -f db/001-ward-subscriptions.sql
 * and on the machine this project is developed on that is
 *   zsh: command not found: psql
 * because there is no Homebrew here and Postgres is not installed. The
 * instruction had never been run. `@neondatabase/serverless` is already a
 * dependency — the app talks to the same database through it every time
 * somebody subscribes — so the driver to apply a schema was already installed
 * and only the runner was missing.
 *
 * ★ SAFE TO RUN TWICE, BY CONSTRUCTION AND BY CHECK. Every statement in db/ is
 * CREATE ... IF NOT EXISTS, and this refuses to run a file containing DROP,
 * TRUNCATE, DELETE or ALTER ... DROP. A migration runner that can destroy data
 * is a different tool with a different name, and this one is pointed at a
 * production database from a laptop.
 *
 * ★ ONE STATEMENT PER CALL. neon()'s HTTP transport takes a single statement,
 * so the file is split on semicolons after line comments are stripped. That is
 * sufficient here and would NOT be sufficient for a file containing a function
 * body, a DO block or a string literal with a semicolon in it — all three are
 * refused below rather than silently mis-split.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { neon } from '@neondatabase/serverless';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DB_DIR = join(ROOT, 'db');
const DRY = process.argv.includes('--dry');
const LIST = process.argv.includes('--list');

const die = (msg) => { console.error(`\n${msg}\n`); process.exit(1); };

/* ── THE REFUSALS. Each one is a thing this runner must not be able to do. ── */
const DESTRUCTIVE = /\b(DROP\s+(TABLE|DATABASE|SCHEMA|INDEX|COLUMN)|TRUNCATE|DELETE\s+FROM)\b/i;
const UNSPLITTABLE = /\$\$|\bDO\s+\$|\bCREATE\s+(OR\s+REPLACE\s+)?FUNCTION\b/i;

/** Strip `-- …` line comments. Everything below reads THIS, never the raw file. */
const strip = (sql) => sql.split('\n').map((l) => l.replace(/--.*$/, '')).join('\n');

/** Strip comments, then split on `;`. */
const statements = (sql) => strip(sql).split(';').map((s) => s.trim()).filter(Boolean);

const files = readdirSync(DB_DIR).filter((f) => f.endsWith('.sql')).sort();
if (!files.length) die('db/ holds no .sql files.');

console.log(`\nSCHEMA FILES (${files.length}), in filename order`);
const plan = [];
for (const f of files) {
  const sql = readFileSync(join(DB_DIR, f), 'utf8');
  /* ★ TEST THE STRIPPED SQL, NOT THE FILE. Both schema files end with the
     retention DELETE written out as a comment, for an operator to run on a
     schedule. Matching against the raw text refused 001 on its own
     documentation — a guard that fires on prose is a guard that gets deleted. */
  const code = strip(sql);
  if (DESTRUCTIVE.test(code)) {
    die(`REFUSING: ${f} contains a destructive statement (DROP / TRUNCATE / DELETE FROM).\n`
      + 'This runner only creates. Apply that one by hand, deliberately, with a backup.');
  }
  if (UNSPLITTABLE.test(code)) {
    die(`REFUSING: ${f} contains a $$-quoted body or a function definition, which cannot be\n`
      + 'split on semicolons safely. Apply it with a client that takes multi-statement SQL.');
  }
  const st = statements(sql);
  plan.push([f, st]);
  console.log(`  ${f.padEnd(34)} ${st.length} statement(s)`);
  for (const s of st) console.log(`      ${s.split('\n')[0].slice(0, 72)}…`);
}

if (DRY) { console.log('\n--dry: nothing was connected to and nothing was run.\n'); process.exit(0); }

const url = process.env.DATABASE_URL;
if (!url) {
  die('DATABASE_URL is not set, so there is nothing to migrate.\n\n'
    + '★ `vercel env pull` WILL NOT GET IT. Tried, 23 August: DATABASE_URL is marked\n'
    + 'SENSITIVE on the Vercel project, so the pull writes the literal string\n'
    + '"[SENSITIVE]" — eleven characters, no scheme — and the only symptom further on\n'
    + 'is an unhelpful "Invalid URL". That is Vercel protecting the secret on purpose.\n'
    + 'Do not route around it.\n\n'
    + 'Two ways that do work.\n\n'
    + '1. THE NEON SQL EDITOR — nothing is installed and no credential is handled.\n'
    + '   Open the project at https://console.neon.tech, pick the SQL Editor, paste\n'
    + '   the contents of db/002-newsletter-subscriptions.sql, and run it. Every\n'
    + '   statement is CREATE ... IF NOT EXISTS, so running it twice is harmless.\n\n'
    + '2. THIS RUNNER, with the connection string from the Neon dashboard\n'
    + '   (Connection Details → the pooled or direct string, either works):\n\n'
    + "     DATABASE_URL='postgresql://…' npm run db:migrate\n\n"
    + '   Passed this way it is never written to a file and never reaches git. It\n'
    + '   will be in your shell history — `history -d` or a leading space, if that\n'
    + '   matters to you.\n\n'
    + 'There is no psql on this machine (no Homebrew), which is why the instruction\n'
    + 'in db/001 and .env.example never ran. This runner replaces it.');
}

/* Name the target before touching it. Host and database only — never the
   credential, which must not reach a terminal, a log or a screenshot. */
let target;
try {
  const u = new URL(url);
  target = `${u.hostname} / ${u.pathname.slice(1)}`;
} catch { die('DATABASE_URL is set but is not a parseable URL.'); }
console.log(`\nTARGET  ${target}`);

const sql = neon(url);
let applied = 0;

for (const [f, st] of plan) {
  process.stdout.write(`\n  ${f}\n`);
  for (const s of st) {
    const label = s.split('\n')[0].slice(0, 64);
    try {
      await sql.query(s);
      console.log(`    ok    ${label}`);
      applied++;
    } catch (e) {
      console.error(`    FAIL  ${label}`);
      die(`${e instanceof Error ? e.message : e}\n\nStopped at ${f}. Earlier statements in this `
        + 'run stand; every statement in db/ is IF NOT EXISTS, so fixing the cause and '
        + 're-running is safe.');
    }
  }
}

/* ── WHAT IS ACTUALLY THERE NOW. The point of the run is the end state, not
   the fact that some statements returned without error. */
const tables = await sql.query(
  `SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' ORDER BY table_name`);
console.log(`\n${applied} statement(s) applied. Tables in public now:`);
for (const t of tables) console.log(`  ${t.table_name}`);

if (!LIST) {
  const want = ['ward_subscriptions', 'newsletter_subscriptions'];
  const have = new Set(tables.map((t) => t.table_name));
  const missing = want.filter((w) => !have.has(w));
  if (missing.length) die(`MISSING AFTER MIGRATE: ${missing.join(', ')}. The run reported no error, `
    + 'so the schema file does not create what this check expects — reconcile them.');
  console.log('\nBoth subscription tables exist. The forms can store an address.\n');
}
