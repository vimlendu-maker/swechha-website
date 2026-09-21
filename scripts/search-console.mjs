#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════
   search-console.mjs — THE ONE PUSH ROUTE TO GOOGLE, AND THE THREE THINGS IT
   CAN ACTUALLY DO.
   ───────────────────────────────────────────────────────────────────────────
     node scripts/search-console.mjs --check
     node scripts/search-console.mjs --sitemap        [--dry-run]
     node scripts/search-console.mjs --inspect <url…> [--dry-run]
     node scripts/search-console.mjs --analytics      [--days 28] [--dry-run]

   ★ WHAT THIS DELIBERATELY DOES NOT DO, AND IT IS THE FIRST THING TO READ.
   There is NO API for the "Request Indexing" button in Search Console. The URL
   Inspection API is read-only — verified against Google's own reference on
   8 September 2026: it returns "information about the provided URL in the
   Google index" and submits nothing.

   The Indexing API (indexing.googleapis.com) is a real push and it is NOT
   available for pages like ours. Google's own quickstart, checked the same
   day, says in terms: "The Indexing API can only be used to crawl pages with
   either JobPosting or BroadcastEvent embedded in a VideoObject." Swechha
   publishes neither. Plenty of SEO advice suggests using it anyway; doing so
   is outside the documented scope of the API, and this repository does not
   publish a figure it cannot source or call an endpoint it is not entitled to.

   So the honest answer is that Google cannot be pushed a content page by
   anybody, and what follows is the three things that ARE sanctioned:

     --sitemap    RESUBMIT the sitemap. A genuine push, and the supported way
                  to say "look again". Sitemaps.submit in the v3 API.
     --inspect    ASK whether a URL is indexed, and what Google last saw. This
                  is monitoring, not submission, and it is how you find out
                  whether any of the rest worked.
     --analytics  PULL impressions, clicks, CTR and position. This is the one
                  that matters most over time: it is the baseline nobody has
                  recorded yet, and it is only obtainable through this API.

   ★ THE PERFORMANCE FILE APPENDS AND NEVER OVERWRITES.
   Search Console revises its own numbers for days after the fact, exactly as
   CPCB re-serves an observation. This site keeps both versions of a re-served
   air reading, and it keeps both here for the same reason: a figure quoted
   from a report is worthless if the report silently changed underneath it.
   Every run stores what it saw, stamped with when it saw it.

   ★ NOT CONFIGURED IS ANSWERED HONESTLY, never swallowed — the rule
   app/api/newsletter/subscribe/route.ts already sets. Without the credential
   this exits non-zero and names what is missing.
   ═══════════════════════════════════════════════════════════════════════════ */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createSign } from 'node:crypto';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ARGV = process.argv.slice(2);
const DRY = ARGV.includes('--dry-run');
const arg = (n, d = null) => { const i = ARGV.indexOf(n); return i >= 0 && ARGV[i + 1] && !ARGV[i + 1].startsWith('--') ? ARGV[i + 1] : d; };
const has = (n) => ARGV.includes(n);

const ORIGIN = (process.env.SITE_ORIGIN?.trim() || 'https://swechha.in').replace(/\/+$/, '');
/* A Search Console property is either a domain property (`sc-domain:swechha.in`)
   or a URL-prefix property (`https://swechha.in/`, trailing slash required).
   They are DIFFERENT properties with different data, so this is configured
   rather than derived — guessing wrong returns 403 and looks like a
   permissions problem. */
const PROPERTY = process.env.GSC_PROPERTY?.trim() || `sc-domain:${new URL(ORIGIN).host}`;
const PERF = join(ROOT, 'data/seo/search-performance.json');
const LASTMOD = join(ROOT, 'data/seo/lastmod.json');

/* ═══ CREDENTIAL ═════════════════════════════════════════════════════════ */
function credential() {
  const raw = process.env.GSC_SERVICE_ACCOUNT_JSON?.trim();
  if (!raw) return null;
  let j;
  try { j = JSON.parse(raw); } catch {
    /* A common failure: the secret was pasted with the surrounding quotes, or
       base64-encoded. Say which rather than "invalid JSON". */
    try { j = JSON.parse(Buffer.from(raw, 'base64').toString('utf8')); } catch {
      fail('GSC_SERVICE_ACCOUNT_JSON is set but is neither JSON nor base64-encoded JSON. '
        + 'Paste the whole service-account key file, unquoted.');
    }
  }
  for (const k of ['client_email', 'private_key', 'token_uri']) {
    if (!j[k]) fail(`GSC_SERVICE_ACCOUNT_JSON has no "${k}". That is not a service-account key file.`);
  }
  return j;
}
function fail(msg) { console.error(`REFUSING: ${msg}`); process.exit(1); }

/* ── A SIGNED JWT, WITH NO DEPENDENCY. ───────────────────────────────────
   googleapis pulls in a large tree for what is, here, one RS256 signature and
   one form POST. This repository writes its own RFC-4180 CSV parser for the
   same reason; node:crypto signs a JWT in nine lines. */
const b64 = (o) => Buffer.from(typeof o === 'string' ? o : JSON.stringify(o))
  .toString('base64url');

async function accessToken(cred, scope) {
  const now = Math.floor(Date.now() / 1000);
  const claim = { iss: cred.client_email, scope, aud: cred.token_uri, iat: now, exp: now + 3600 };
  const unsigned = `${b64({ alg: 'RS256', typ: 'JWT' })}.${b64(claim)}`;
  const sig = createSign('RSA-SHA256').update(unsigned).end()
    .sign(cred.private_key.replace(/\\n/g, '\n')).toString('base64url');
  const res = await fetch(cred.token_uri, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${unsigned}.${sig}`,
    }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    fail(`token exchange returned ${res.status}: ${JSON.stringify(body)}. `
      + 'If this says invalid_grant, the service account clock or key is wrong; if it says '
      + 'unauthorized_client, the account exists but has not been added to the property.');
  }
  return body.access_token;
}

async function api(token, url, init = {}) {
  const res = await fetch(url, {
    ...init,
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json', ...(init.headers || {}) },
  });
  const text = await res.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = { raw: text.slice(0, 400) }; }
  if (!res.ok) {
    const hint = res.status === 403
      ? ` — 403 usually means the service account (${CRED.client_email}) is not an owner or full user of `
        + `${PROPERTY}, or the property string is the wrong kind (domain vs URL-prefix).`
      : '';
    fail(`${res.status} from ${url}${hint}\n${JSON.stringify(body)}`);
  }
  return body;
}

/* ═══ ACTIONS ════════════════════════════════════════════════════════════ */
const SITE = encodeURIComponent(PROPERTY);
const WMX = 'https://www.googleapis.com/webmasters/v3/sites';
const SCOPE_RW = 'https://www.googleapis.com/auth/webmasters';
const SCOPE_RO = 'https://www.googleapis.com/auth/webmasters.readonly';

/** Resubmit the sitemap. The one sanctioned "look again" for ordinary pages. */
async function submitSitemap(token) {
  const feed = `${ORIGIN}/sitemap.xml`;
  console.log(`Sitemap  ${feed}\nProperty ${PROPERTY}`);
  if (DRY) return console.log('\n--dry-run: nothing sent.');
  await api(token, `${WMX}/${SITE}/sitemaps/${encodeURIComponent(feed)}`, { method: 'PUT' });
  console.log('\nSubmitted. Google has been asked to fetch it again.');
  const list = await api(token, `${WMX}/${SITE}/sitemaps`);
  const me = (list.sitemap || []).find((s) => s.path === feed);
  if (me) {
    console.log(`  last downloaded: ${me.lastDownloaded || 'not yet'}`);
    console.log(`  warnings ${me.warnings ?? 0} · errors ${me.errors ?? 0}`);
    /* A sitemap Google has fetched but not processed is the normal state for
       minutes to hours. Errors are not, and they are silent in the UI unless
       somebody opens the report. */
    if (Number(me.errors) > 0) console.log('  ★ Google reports ERRORS on this sitemap — open the Sitemaps report.');
  }
}

/** Ask what Google currently knows about a URL. Read-only, by design. */
async function inspect(token, urls) {
  console.log(`Inspecting ${urls.length} URL(s) against ${PROPERTY}\n`);
  if (DRY) { for (const u of urls) console.log(`  ${u}`); return console.log('\n--dry-run: nothing sent.'); }
  const rows = [];
  for (const u of urls) {
    const r = await api(token, 'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', {
      method: 'POST', body: JSON.stringify({ inspectionUrl: u, siteUrl: PROPERTY }),
    });
    const i = r.inspectionResult?.indexStatusResult || {};
    rows.push({ url: u, verdict: i.verdict, coverage: i.coverageState, lastCrawl: i.lastCrawlTime });
    console.log(`  ${(i.verdict || '?').padEnd(8)} ${(i.coverageState || '').padEnd(38)} ${u}`);
    /* 600 queries/minute per property is the documented ceiling; a tenth of a
       second between calls keeps a 100-URL sweep an order of magnitude under
       it without making the run slow. */
    await new Promise((r2) => setTimeout(r2, 100));
  }
  const indexed = rows.filter((r) => r.verdict === 'PASS').length;
  console.log(`\n${indexed} of ${rows.length} pass. A URL Google has not crawled yet is normal for days after publication.`);
  return rows;
}

/** Pull performance, and APPEND it. This is the baseline. */
async function analytics(token) {
  const days = Number(arg('--days', '28'));
  const end = new Date(Date.now() - 3 * 864e5);   // GSC lags ~2-3 days; asking for
  const start = new Date(end - (days - 1) * 864e5); // yesterday returns an empty row.
  const iso = (d) => d.toISOString().slice(0, 10);
  const window = { startDate: iso(start), endDate: iso(end) };
  console.log(`Search performance ${window.startDate} to ${window.endDate} (${days} days)\nProperty ${PROPERTY}`);
  /* ★ NO EARLY RETURN HERE ANY MORE, AND THAT IS THE POINT OF --dry-run.
     This used to stop before asking Google anything, so `--analytics
     --dry-run` printed one line and proved nothing — the run that would tell
     you whether a change to this function works was the same run that
     appends to the committed record. A pull is READ-ONLY at Google's end;
     the only side effect is the file written at the bottom, so that is the
     only thing a dry run needs to skip. `--sitemap` keeps its early return
     above, because there the request ITSELF is the write.
     scripts/umami.mjs has always behaved this way — "read everything above,
     wrote nothing" — and the two pulls should not mean different things by
     the same flag. */

  const q = (body) => api(token, `${WMX}/${SITE}/searchAnalytics/query`,
    { method: 'POST', body: JSON.stringify({ ...window, ...body }) });

  const totals = await q({ dimensions: [] });
  const byPage = await q({ dimensions: ['page'], rowLimit: 500 });
  const byQuery = await q({ dimensions: ['query'], rowLimit: 250 });
  /* ★ THE PAIRING, WHICH NEITHER OF THE TWO ABOVE CAN RECONSTRUCT.
     `by_page` says a page took 3,783 impressions and 11 clicks. `by_query`
     says the property was shown for "nepal glof". Neither says WHICH query
     that page was shown for — and a 0.8% CTR is a question about exactly
     that: what a reader typed, immediately before deciding this result was
     not the answer. Without the pairing the only remedy anyone can propose
     for a bad CTR is a guess at the title. */
  const byPageQuery = await q({ dimensions: ['page', 'query'], rowLimit: 5000 });

  const t = totals.rows?.[0] || { clicks: 0, impressions: 0, ctr: 0, position: 0 };
  const num = (n) => Math.round(n * 100) / 100;

  /* ★ SECTIONS ARE DERIVED FROM THE REGISTER, AND THE COMMENT THAT USED TO SIT
     HERE SAID THEY ALREADY WERE.
     It read "Derived from the path, not a typed list" above a typed list of
     eight. That list was written before `/teach` (54 pages) and
     `/healthy-cities` (11) existed, so the two largest additions the site has
     ever made fell into `(other)` together with the homepage and every surviving
     WordPress URL — and `(other)` is the one row nobody can read anything out
     of. The whole point of this file is to see whether a new section earns
     anything, and for the biggest new section it could not answer.

     This is the estate's parallel-list failure class: a hand-kept list that has
     to move in lockstep with something else, in the file whose own comment
     denied being one. The fix is the one that class always takes — derive it.

     `data/seo/lastmod.json` is the register of every route this site has ever
     built, which is exactly the right universe: it is keyed by route, it is
     written by the build rather than by hand, and it keeps RETIRED routes too,
     so a withdrawn event still sections to `/now` instead of falling out of the
     report on the day it stops being served.

     `(other)` therefore now means one thing — a URL Google still has that is
     not a route this site has built — which is legacy WordPress URLs and the
     homepage. That is a reading rather than a residue.

     ★ SECTION ROWS ARE NOT COMPARABLE ACROSS THIS CHANGE. Snapshots taken
     before it used the eight-item list, so their `(other)` bundles `/teach`,
     `/healthy-cities`, `/about`, `/act`, `/farm`, `/impact`, `/method`,
     `/posters`, `/publications` and `/search` into itself. Totals, brand split
     and per-page rows are unaffected; only `by_section` changed shape. */
  const SECTIONS = [...new Set(
    Object.keys(JSON.parse(readFileSync(LASTMOD, 'utf8')))
      .filter((r) => r !== '/')
      .map((r) => `/${r.split('/')[1]}`),
  )].sort();
  const section = (u) => { const p = new URL(u).pathname; return SECTIONS.find((s) => p === s || p.startsWith(`${s}/`)) || '(other)'; };
  const bySection = {};
  for (const r of byPage.rows || []) {
    const s = section(r.keys[0]);
    const b = bySection[s] ||= { clicks: 0, impressions: 0, pages: 0 };
    b.clicks += r.clicks; b.impressions += r.impressions; b.pages += 1;
  }
  for (const b of Object.values(bySection)) {
    b.clicks = num(b.clicks); b.impressions = num(b.impressions);
    b.ctr = b.impressions ? num((b.clicks / b.impressions) * 100) : 0;
  }

  /* BRANDED VS NOT. Crude on purpose and labelled as such: a brand filter is a
     judgement, and the honest thing is to state the rule rather than imply a
     classifier. */
  const BRAND = /swechha|vimlendu/i;
  const branded = { clicks: 0, impressions: 0 }, nonBranded = { clicks: 0, impressions: 0 };
  for (const r of byQuery.rows || []) {
    const b = BRAND.test(r.keys[0]) ? branded : nonBranded;
    b.clicks += r.clicks; b.impressions += r.impressions;
  }

  /* ── WHICH QUERY LOSES THE CLICK ──────────────────────────────────────
     Kept to the pages worth diagnosing and their strongest queries, because
     this file APPENDS FOREVER: the full pairing is thousands of rows a week
     and would bury the figures it sits next to. 20 pages x 10 queries is the
     shape of the question — "this page is shown a lot and clicked rarely, for
     what?" — and the pages are chosen by IMPRESSIONS, not clicks, because a
     page nobody clicks is the one being asked about.

     ★ COVERAGE IS RECORDED BECAUSE IT IS LOW AND THE OMISSION WOULD MISLEAD.
     Google anonymises any query it considers rare, and those impressions are
     counted in the totals while appearing under no query at all. On the
     2026-09-18 window only 2,528 of 20,680 impressions — about 12% — had a
     query Google would name. So these rows are the VISIBLE TAIL of a page's
     demand, never the whole of it, and `coverage` states the share so a later
     reader cannot mistake one for the other. A page's listed queries summing
     to far less than its impressions is the normal case, not a bug. */
  const pageRows = {};
  for (const r of byPageQuery.rows || []) {
    const [page, query] = r.keys;
    (pageRows[page] ||= []).push({
      query, clicks: num(r.clicks), impressions: num(r.impressions),
      ctr: num(r.ctr * 100), position: num(r.position),
    });
  }
  const pairedImpressions = (byPageQuery.rows || []).reduce((a, r) => a + r.impressions, 0);
  const rankedPages = (byPage.rows || []).slice(0, 20).map((r) => r.keys[0]);
  const pages = {};
  for (const page of rankedPages) {
    const rows = (pageRows[page] || []).sort((a, b) => b.impressions - a.impressions).slice(0, 10);
    if (rows.length) pages[page] = rows;
  }
  const pageQueries = {
    _: 'The queries each of the 20 most-shown pages was shown for, its 10 strongest each. '
      + 'Google names only the queries it does not consider rare, so these are a page\'s VISIBLE '
      + 'demand and not all of it — read `coverage` before treating a page\'s rows as complete.',
    coverage: {
      impressions_with_a_named_query: num(pairedImpressions),
      impressions_total: num(t.impressions),
      share_percent: t.impressions ? num((pairedImpressions / t.impressions) * 100) : 0,
    },
    pages,
  };

  const snapshot = {
    observed_at: new Date().toISOString(),
    window,
    property: PROPERTY,
    totals: { clicks: num(t.clicks), impressions: num(t.impressions), ctr: num(t.ctr * 100), position: num(t.position) },
    by_section: bySection,
    brand_split: {
      _rule: 'A query matching /swechha|vimlendu/i is counted as branded. A stated rule, not a classifier.',
      branded: { clicks: num(branded.clicks), impressions: num(branded.impressions) },
      non_branded: { clicks: num(nonBranded.clicks), impressions: num(nonBranded.impressions) },
    },
    top_pages: (byPage.rows || []).slice(0, 40).map((r) => ({
      page: r.keys[0], clicks: num(r.clicks), impressions: num(r.impressions), position: num(r.position),
    })),
    top_queries: (byQuery.rows || []).slice(0, 40).map((r) => ({
      query: r.keys[0], clicks: num(r.clicks), impressions: num(r.impressions), position: num(r.position),
    })),
    page_queries: pageQueries,
  };

  /* ── APPEND. Search Console revises its own figures for days, exactly as
     CPCB re-serves an observation, and this site keeps both versions of one of
     those. A snapshot for a window already recorded is added BESIDE the
     earlier one and never on top of it: that is the only way to see later
     whether a number moved after it was quoted. */
  if (DRY) {
    console.log(`\n  clicks ${num(t.clicks)}  impressions ${num(t.impressions)}  CTR ${num(t.ctr * 100)}%  position ${num(t.position)}`);
    console.log(`  page/query pairs ${(byPageQuery.rows || []).length}, coverage ${pageQueries.coverage.share_percent}% of impressions`);
    for (const [page, rows] of Object.entries(pageQueries.pages).slice(0, 6)) {
      console.log(`\n    ${page}`);
      for (const r of rows.slice(0, 5)) {
        console.log(`      ${String(Math.round(r.impressions)).padStart(5)} impr  ${String(r.clicks).padStart(3)} clk  pos ${String(r.position).padStart(5)}  ${r.query}`);
      }
    }
    return console.log('\n--dry-run: read everything above, wrote nothing.');
  }

  mkdirSync(dirname(PERF), { recursive: true });
  const store = existsSync(PERF)
    ? JSON.parse(readFileSync(PERF, 'utf8'))
    : { _: 'Search Console performance, appended never overwritten. Google revises these figures for days after the fact; a snapshot records what was true when it was read, and a re-read of the same window is stored beside the first rather than replacing it.', snapshots: [] };
  store.snapshots.push(snapshot);
  writeFileSync(PERF, `${JSON.stringify(store, null, 2)}\n`);

  console.log(`\n  clicks      ${snapshot.totals.clicks}`);
  console.log(`  impressions ${snapshot.totals.impressions}`);
  console.log(`  CTR         ${snapshot.totals.ctr}%`);
  console.log(`  position    ${snapshot.totals.position}`);
  console.log('\n  by section:');
  for (const [s, b] of Object.entries(bySection).sort((a, c) => c[1].impressions - a[1].impressions)) {
    console.log(`    ${s.padEnd(16)} ${String(b.impressions).padStart(8)} impressions  ${String(b.clicks).padStart(6)} clicks  ${b.pages} pages`);
  }
  /* THE PAGES WORTH A TITLE REWRITE, PRINTED RATHER THAN LEFT IN THE JSON.
     Ranked by impressions LOST — impressions x (2% - its CTR) — because the
     prize is the product of the two, not either alone. 2% is the bar this
     site's own average position (7.5) would ordinarily earn; a page already
     above it is not listed, however many impressions it takes. */
  const BAR = 2;
  const lossy = Object.entries(pages).map(([page, rows]) => {
    const p = (byPage.rows || []).find((r) => r.keys[0] === page);
    const ctr = p && p.impressions ? (p.clicks / p.impressions) * 100 : 0;
    return { page, rows, ctr, impressions: p?.impressions || 0, lost: (p?.impressions || 0) * (BAR - ctr) / 100 };
  }).filter((x) => x.lost > 0).sort((a, b) => b.lost - a.lost).slice(0, 5);
  if (lossy.length) {
    console.log(`\n  shown often, clicked rarely — the ${lossy.length} pages furthest below a ${BAR}% CTR:`);
    for (const x of lossy) {
      console.log(`\n    ${x.page}`);
      console.log(`      ${Math.round(x.impressions)} impressions at ${x.ctr.toFixed(2)}% — about ${Math.round(x.lost)} clicks below the bar`);
      console.log('      shown for:');
      for (const r of x.rows.slice(0, 5)) {
        console.log(`        ${String(Math.round(r.impressions)).padStart(5)} impr  ${String(r.clicks).padStart(3)} clk  pos ${String(r.position).padStart(5)}  ${r.query}`);
      }
    }
    console.log(`\n    Query coverage ${pageQueries.coverage.share_percent}% — Google names only the queries it does not`);
    console.log('    consider rare, so each list is the visible part of that page\'s demand.');
  }

  console.log(`\n  ${store.snapshots.length} snapshot(s) in data/seo/search-performance.json`);
  return snapshot;
}

/* ═══ RUN ════════════════════════════════════════════════════════════════ */
const CRED = credential();
if (!CRED) {
  console.error('NOT CONFIGURED. Set GSC_SERVICE_ACCOUNT_JSON to the whole service-account key file,');
  console.error('and GSC_PROPERTY to the property string (e.g. sc-domain:swechha.in).');
  console.error('docs/SEARCH-CONSOLE-API.md has the six steps, and four of them need a Google account.');
  process.exit(1);
}

const wantsWrite = has('--sitemap');
const token = await accessToken(CRED, wantsWrite ? SCOPE_RW : SCOPE_RO);

if (has('--check')) {
  const list = await api(token, 'https://www.googleapis.com/webmasters/v3/sites');
  const mine = (list.siteEntry || []).map((s) => `${s.siteUrl}  (${s.permissionLevel})`);
  console.log(`Authenticated as ${CRED.client_email}\nProperties this account can see:`);
  console.log(mine.length ? mine.map((m) => `  ${m}`).join('\n') : '  none — it has not been added to any property yet');
  const ok = (list.siteEntry || []).some((s) => s.siteUrl === PROPERTY);
  console.log(`\nGSC_PROPERTY is ${PROPERTY} — ${ok ? 'visible to this account.' : 'NOT visible to this account.'}`);
  if (!ok) process.exit(1);
} else if (has('--sitemap')) {
  await submitSitemap(token);
} else if (has('--inspect')) {
  const urls = ARGV.slice(ARGV.indexOf('--inspect') + 1).filter((a) => !a.startsWith('--'))
    .map((u) => (u.startsWith('http') ? u : `${ORIGIN}${u}`));
  if (!urls.length) fail('--inspect needs at least one URL or path.');
  await inspect(token, urls);
} else if (has('--analytics')) {
  await analytics(token);
} else {
  console.log('Nothing asked for. One of --check, --sitemap, --inspect <url…>, --analytics.');
  process.exit(1);
}
