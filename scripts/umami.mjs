#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════
   umami.mjs — THE READ SIDE OF THE ANALYTICS THIS SITE ALREADY COLLECTS.
   ───────────────────────────────────────────────────────────────────────────
     node scripts/umami.mjs --check
     node scripts/umami.mjs --pull [--days 28] [--dry-run]

   ★ WHY THIS EXISTS, STATED PLAINLY. Umami has been collecting since
   26 August 2026 and the tracker is on all 149 built pages, gated by
   verify-seo.mjs. There has never been a way to READ any of it except by
   logging into a dashboard. So the site has a rigorous, committed, appended
   Search Console baseline in data/seo/search-performance.json and, for its
   own first-party analytics, nothing at all — no file, no history, no figure
   anybody can quote without opening a browser and trusting their memory of it.
   That asymmetry is the whole of this script.

   It is the spec's Phase 3 collection half, and only that half:
   docs/superpowers/specs/2026-08-24-analytics-design.md §6 describes
   "Umami's API → a script shaped like the existing scripts/fetch-*.mjs → JSON
   under data/", and then says the figures are "deliberately last" because
   "which figures are honest to publish is a question to settle against real
   traffic, not against a guess". THIS SCRIPT PUBLISHES NOTHING. It writes a
   record under data/analytics/ and stops there. Putting a number on /impact
   is a separate, owner-level decision, and it is now a decision that can be
   made against a year of evidence instead of a dashboard screenshot.

   ★ APPEND, NEVER OVERWRITE — AND FOR A DIFFERENT REASON THAN THE SEARCH
   CONSOLE FILE. That one appends because Google revises its own figures for
   days after the fact. Umami does not revise: an event is written once and
   stays. The reason here is the failure mode the spec itself names in §3.4 —
   Neon's free tier "suspends compute at the cap", so the risk being managed
   is "a silent gap in the data". A gap does not announce itself. It looks
   exactly like a quiet week. Keeping every reading, with the day-by-day
   series inside it, is what makes the difference visible later; overwriting
   would leave one number that cannot be cross-examined.

   ★ AND IT LOOKS FOR THAT GAP ON EVERY PULL. `--pull` reports any day inside
   the window with zero pageviews when the days around it had traffic. That is
   the signature of suspended compute rather than a quiet Sunday, and it is
   the one thing this script can check that a person reading the dashboard
   would not think to.

   ★ ONE HOST AND ONE WEBSITE ID, READ FROM data/analytics.json — the same
   file lib/analytics.ts and situation-shell.mjs read to emit the tracker tag.
   A second copy of either here is how the reader and the reporter end up
   describing different websites. Neither value is secret; both are in the
   page source of every page on the site.

   ★ NOT CONFIGURED IS ANSWERED HONESTLY, never swallowed — the rule
   scripts/search-console.mjs and app/api/newsletter/subscribe/route.ts
   already set. Without a credential this exits non-zero and names exactly
   what is missing and where to put it. It does not write an empty snapshot,
   and it does not pretend to have run.
   ═══════════════════════════════════════════════════════════════════════════ */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
/* The four pieces that can be wrong while still looking right. Pure, and held
   to it by lib/umami.test.ts — see that module's own header for why these and
   not the HTTP calls around them. */
import { istDay, num, statValue, fillDaily, suspectedGaps } from './lib/umami-shape.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ARGV = process.argv.slice(2);
const DRY = ARGV.includes('--dry-run');
const arg = (n, d = null) => { const i = ARGV.indexOf(n); return i >= 0 && ARGV[i + 1] && !ARGV[i + 1].startsWith('--') ? ARGV[i + 1] : d; };
const has = (n) => ARGV.includes(n);

const CONFIG = JSON.parse(readFileSync(join(ROOT, 'data/analytics.json'), 'utf8'));
const HOST = (process.env.UMAMI_HOST?.trim() || CONFIG.host).replace(/\/+$/, '');
const WEBSITE = process.env.UMAMI_WEBSITE_ID?.trim() || CONFIG.websiteId;
const STORE = join(ROOT, 'data/analytics/audience.json');

/* The reader's clock, and the one the daily buckets must be cut on. A day
   boundary in UTC puts an Indian evening's traffic on the following day, which
   is the same class of error dateMath.js exists to prevent in the Farm app and
   that db.js's type-parser override prevents for Postgres dates. */
const TZ = 'Asia/Kolkata';

function fail(msg) { console.error(`REFUSING: ${msg}`); process.exit(1); }

/* ═══ CREDENTIAL ═════════════════════════════════════════════════════════
   TWO WAYS IN, AND THE SCRIPT DOES NOT CARE WHICH. Umami Cloud issues API
   keys; a self-hosted instance authenticates with the admin username and
   password and hands back a bearer token. swechha.in is self-hosted (spec §2
   rejected Cloud outright — its free tier has no API at all), so the password
   path is the one expected to be used here. The key path costs four lines and
   removes a reason to ever paste a password into a CI secret if a future
   Umami version issues keys for self-hosted installs.

   NEITHER VALUE IS EVER PRINTED, including inside an error. The failure
   messages below name the ENV VAR, never its contents. */
function credentialKind() {
  if (process.env.UMAMI_API_KEY?.trim()) return 'api-key';
  if (process.env.UMAMI_USERNAME?.trim() && process.env.UMAMI_PASSWORD?.trim()) return 'password';
  return null;
}

async function authorize() {
  const kind = credentialKind();
  if (!kind) {
    fail('no Umami credential. Set UMAMI_API_KEY, or set BOTH UMAMI_USERNAME and '
      + 'UMAMI_PASSWORD, in the environment. In CI they are repository secrets — see '
      + 'docs/UMAMI-API.md. Nothing was read and nothing was written.');
  }
  if (kind === 'api-key') {
    return { headers: { 'x-umami-api-key': process.env.UMAMI_API_KEY.trim() }, kind };
  }
  const res = await fetch(`${HOST}/api/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      username: process.env.UMAMI_USERNAME.trim(),
      password: process.env.UMAMI_PASSWORD,
    }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    /* The body is Umami's own error envelope and carries no secret — it is the
       most useful thing to show, because 401 here means the password is wrong
       while 404 means UMAMI_HOST points at something that is not Umami. */
    fail(`login to ${HOST} returned ${res.status}: ${JSON.stringify(body)}. `
      + '401 means the username or password is wrong; 404 means UMAMI_HOST is not an '
      + 'Umami instance; 405 means it reached the right path with the wrong method, '
      + 'which would be a bug in this script.');
  }
  /* Asserted rather than assumed. If a future version renames this field the
     run stops here with the shape it actually got, instead of sending
     `Bearer undefined` and reporting a puzzling 401 on every later call. */
  if (!body?.token) {
    fail(`login to ${HOST} succeeded but the response has no "token" field. `
      + `Got keys: ${JSON.stringify(Object.keys(body || {}))}.`);
  }
  return { headers: { authorization: `Bearer ${body.token}` }, kind };
}

/* ═══ REQUESTS ═══════════════════════════════════════════════════════════ */
async function api(auth, path, params = {}) {
  const url = new URL(`${HOST}${path}`);
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  const res = await fetch(url, { headers: { ...auth.headers, accept: 'application/json' } });
  const text = await res.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = { raw: text.slice(0, 400) }; }
  if (!res.ok) {
    const e = new Error(`${res.status} from ${url.pathname}${url.search}: ${JSON.stringify(body)}`);
    e.status = res.status;
    throw e;
  }
  return body;
}

/* ── THE PARAMETER CONTRACT WAS MEASURED, NOT READ OFF A DOC PAGE ─────────
   Against the live instance on 18 September 2026, unauthenticated, which is
   enough to see the validator run before the auth check:

     GET /api/websites/<id>/stats      400  "Either startAt+endAt or
                                             startDate+endDate must be provided"
     GET /api/websites/<id>/metrics    400  properties.type: "expected string,
                                             received undefined"
     GET /api/websites/<id>/pageviews  400  same startAt/endAt message; and with
                                             unit=__bogus__, "Invalid unit"
     …the same three WITH startAt/endAt  401 Unauthorized

   So the required parameters are known exactly. What could NOT be established
   without a credential is which `type` values the metrics endpoint accepts on
   this version — the enum is validated after auth. That is why METRICS below
   is a list this script tries INDIVIDUALLY and records as unavailable when the
   instance refuses one, rather than a set it asserts. The first authenticated
   run prints the truth and the snapshot records it.

   ★ AND THE FIRST AUTHENTICATED RUN DID EXACTLY THAT — 2026-09-21. It recorded
   `url` as unavailable, which is the one metric the whole snapshot is for: the
   per-page breakdown. The design above worked; the guess inside it was wrong.
   `type=url` is Umami's name in the documentation and in most of what is
   written about it, and it is NOT this instance's name. Probed against the
   live API with a working credential, same window, same auth:

     type=url                 400  bad-request
     type=url  (no limit)     400  bad-request
     type=url + unit/timezone 400  bad-request
     type=host                400  bad-request
     type=path                200  50 rows, first {"x":"/","y":692}
     type=title               200  50 rows, first {"x":"Swechha — Delhi…","y":697}
     type=query               200  34 rows, first {"x":"utm_source=chatgpt.com","y":19}

   So: `path`. The instance is `privateMode:true`, `cloudMode:false` per
   /api/config, i.e. self-hosted, and that is the variant whose enum this is.
   Do not "correct" it back to `url` because a doc page says so — the table
   above is this instance answering for itself.

   `query` joins the list on the same evidence. It is the only place the UTM
   tags appear, and it is already carrying something worth reading: 19 visits
   tagged `utm_source=chatgpt.com`. `title` is deliberately NOT here — it is
   the same rows as `path` keyed by a string that changes whenever a headline
   is edited, so it would age into a second, worse copy of the page list. */
const METRICS = [
  ['path', 'top pages'],
  ['query', 'query strings, where the UTM tags land'],
  ['referrer', 'where readers came from'],
  ['country', 'country'],
  ['device', 'device'],
  ['browser', 'browser'],
  ['event', 'custom events (spec §6 Phase 2 — empty until those are instrumented)'],
];

/* ═══ WINDOW ═════════════════════════════════════════════════════════════
   No lag subtraction, unlike the Search Console pull. That script asks for a
   window ending three days ago because Google is still filling the last two
   in; Umami wrote each row at the moment of the request, so "now" is complete
   the instant it is asked for. Ending the window at the most recent whole hour
   keeps a re-read of the same window comparable rather than off by minutes. */
function windowFor(days) {
  const end = new Date();
  end.setMinutes(0, 0, 0);
  const start = new Date(end.getTime() - days * 864e5);
  return { startAt: start.getTime(), endAt: end.getTime(), days };
}

/* ═══ COMMANDS ═══════════════════════════════════════════════════════════ */
async function check(auth) {
  console.log(`Umami at ${HOST}`);
  console.log(`Authenticated by ${auth.kind === 'api-key' ? 'UMAMI_API_KEY' : 'UMAMI_USERNAME/UMAMI_PASSWORD'}`);
  const w = windowFor(1);
  const stats = await api(auth, `/api/websites/${WEBSITE}/stats`, { startAt: w.startAt, endAt: w.endAt });
  console.log(`Website ${WEBSITE} answered. Last 24h: `
    + `${statValue(stats.pageviews)} pageview(s), ${statValue(stats.visitors)} visitor(s).`);
  console.log('\nThe credential works and the website id resolves. `--pull` will write a snapshot.');
}

async function pull(auth) {
  const days = Number(arg('--days', '28'));
  if (!Number.isInteger(days) || days < 1 || days > 400) {
    fail(`--days must be a whole number between 1 and 400; got ${JSON.stringify(arg('--days', '28'))}.`);
  }
  const w = windowFor(days);
  const range = { startAt: w.startAt, endAt: w.endAt };
  console.log(`Umami ${istDay(w.startAt)} to ${istDay(w.endAt)} (${days} days, ${TZ})`);
  console.log(`Host ${HOST}  website ${WEBSITE}`);

  /* ★ --dry-run STILL FETCHES. It suppresses the WRITE and nothing else.
     search-console.mjs's --dry-run returns before its first request, which
     means there is no way to look at a fresh figure there without committing
     a snapshot — a small thing that makes the safe option useless for the
     exact question people use it for. Reading is not the side effect worth
     guarding against here; writing a file into git history is. */
  const stats = await api(auth, `/api/websites/${WEBSITE}/stats`, range);
  const series = await api(auth, `/api/websites/${WEBSITE}/pageviews`, { ...range, unit: 'day', timezone: TZ });

  const metrics = {};
  const unavailable = {};
  for (const [type, label] of METRICS) {
    try {
      const rows = await api(auth, `/api/websites/${WEBSITE}/metrics`, { ...range, type, limit: 50 });
      metrics[type] = { _: label, rows: (Array.isArray(rows) ? rows : []).slice(0, 25).map((r) => ({ x: r.x, y: num(r.y) })) };
    } catch (e) {
      /* Recorded, not swallowed and not fatal. One refused metric type on one
         Umami version must not cost the whole snapshot — the pageview totals
         are the part that cannot be re-read later if the compute suspends. */
      unavailable[type] = `${e.status || '?'} — ${String(e.message).slice(0, 200)}`;
      console.error(`  ! metrics type="${type}" unavailable: ${unavailable[type]}`);
    }
  }

  /* The daily series and the gap it exists to expose — both in
     lib/umami-shape.mjs, with the reasoning, and both tested. */
  const daily = fillDaily(w, series?.pageviews || [], series?.sessions || []);
  const suspected = suspectedGaps(daily);

  const snapshot = {
    observed_at: new Date().toISOString(),
    window: { start: istDay(w.startAt), end: istDay(w.endAt), days, timezone: TZ },
    host: HOST,
    website_id: WEBSITE,
    totals: {
      pageviews: statValue(stats.pageviews),
      visitors: statValue(stats.visitors),
      visits: statValue(stats.visits),
      bounces: statValue(stats.bounces),
      totaltime_seconds: statValue(stats.totaltime),
    },
    daily,
    suspected_collection_gaps: {
      _: 'Dates inside the window with zero pageviews between two days that had some. '
        + 'A suspicion, not a finding: the spec (§3.4) names Neon suspending compute at its '
        + 'free-tier cap as the risk, and only Neon\'s own console can confirm it.',
      dates: suspected,
    },
    metrics,
    ...(Object.keys(unavailable).length ? { metrics_unavailable: unavailable } : {}),
  };

  console.log(`\n  pageviews   ${snapshot.totals.pageviews}`);
  console.log(`  visitors    ${snapshot.totals.visitors}`);
  console.log(`  visits      ${snapshot.totals.visits}`);
  const zero = daily.filter((d) => d.pageviews === 0).length;
  console.log(`  days        ${daily.length} in window, ${zero} with no pageviews at all`);
  if (suspected.length) {
    console.log(`\n  ★ ${suspected.length} suspected collection gap(s): ${suspected.join(', ')}`);
    console.log('    Zero pageviews with traffic on both sides. Check whether Neon suspended compute.');
  }
  const top = metrics.path?.rows?.slice(0, 8) || [];
  if (top.length) {
    console.log('\n  most-read pages');
    for (const r of top) console.log(`    ${String(r.y).padStart(6)}  ${r.x}`);
  }

  if (DRY) {
    console.log('\n--dry-run: read everything above, wrote nothing.');
    return;
  }

  mkdirSync(dirname(STORE), { recursive: true });
  const store = existsSync(STORE)
    ? JSON.parse(readFileSync(STORE, 'utf8'))
    : {
      _: 'First-party audience figures from this site\'s own Umami, appended never overwritten. '
        + 'Umami does not revise a reading the way Search Console does; this appends because the '
        + 'risk it manages is a SILENT GAP — the analytics database is on a free tier that suspends '
        + 'compute at its cap, and a week that was never collected looks exactly like a quiet week '
        + 'unless every reading is kept with its day-by-day series. Written by scripts/umami.mjs. '
        + 'Nothing here is published; see docs/UMAMI-API.md.',
      snapshots: [],
    };
  store.snapshots.push(snapshot);
  writeFileSync(STORE, `${JSON.stringify(store, null, 2)}\n`);
  console.log(`\n${store.snapshots.length} snapshot(s) in data/analytics/audience.json`);
}

/* ═══ MAIN ═══════════════════════════════════════════════════════════════
   ★ EVERY THROWN REQUEST ERROR LANDS IN fail(), and this catch is here
   because the first version did not have it. api() throws so that the metrics
   loop can record one refused type and carry on; but nothing caught the throw
   from the stats or pageviews calls, so a wrong credential printed a raw
   `Error: 401 from /api/websites/…` stack trace and exited on an unhandled
   rejection. Measured with UMAMI_API_KEY=not-a-real-key before this existed.
   A stack trace is not "answered honestly" — it is the same swallow wearing
   more text, because the one thing an operator needs to read (which secret is
   wrong) is the one thing it does not say. */
try {
  const auth = await authorize();
  if (has('--check')) await check(auth);
  else if (has('--pull')) await pull(auth);
  else {
    console.error('usage: node scripts/umami.mjs --check');
    console.error('       node scripts/umami.mjs --pull [--days 28] [--dry-run]');
    process.exit(2);
  }
} catch (e) {
  const hint = e.status === 401
    ? ' — 401 means the credential reached Umami and was rejected. With UMAMI_API_KEY, the key is '
      + 'wrong or this self-hosted version does not accept API keys at all (Cloud issues them; a '
      + 'self-hosted install may not), in which case use UMAMI_USERNAME and UMAMI_PASSWORD instead.'
    : e.status === 404
      ? ` — 404 means the path does not exist on this instance. Check the website id (${WEBSITE}) `
        + 'against data/analytics.json and the dashboard.'
      : '';
  fail(`${e.message}${hint}`);
}
