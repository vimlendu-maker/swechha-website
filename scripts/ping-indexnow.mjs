#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════
   ping-indexnow.mjs — TELL THE SEARCH ENGINES A PAGE CHANGED.
   ───────────────────────────────────────────────────────────────────────────
   WHY THIS EXISTS. A disaster page is worth finding on the day. Sitemap
   discovery is a crawl schedule — hours to days — and on an event page that is
   most of its useful life. IndexNow is a push: one POST and Bing, Yandex,
   Seznam and Naver know immediately.

   ★ GOOGLE IS NOT IN THIS LIST, AND IT IS NOT AN OVERSIGHT.
   Google does not participate in IndexNow, and both legacy sitemap pings are
   GONE — verified against the endpoints rather than assumed:

     https://www.google.com/ping?sitemap=…   404, body reads
                                             "Sitemaps ping is deprecated"
     https://www.bing.com/ping?sitemap=…     410 Gone

   Google's own replacement is the `lastmod` in the sitemap, which this
   repository already computes from a content hash (lib/lastmod.mjs) so it moves
   only when a page really changed — which is exactly the signal Google says it
   now uses. The only push route to Google is the Search Console API, which
   needs an OAuth service account added as a property owner; that is a real
   option and it is not wired here, because unattended OAuth credentials for a
   search property are a bigger commitment than a cron job should make on its
   own.

   ★ IT SUBMITS ONLY WHAT ACTUALLY CHANGED.
   IndexNow's guidance is to submit changed URLs, not inventories, and a
   scheduled job that re-submits the whole sitemap every half hour is
   indistinguishable from abuse. So this takes the CHANGED built files, reads
   each one's own `rel=canonical` — the same self-describing route the sitemap
   and the search index are built from — and submits those URLs and nothing
   else. No changed pages, no request.

   ★ IT IS NOT WIRED INTO THE HOURLY AIR JOB, deliberately. That workflow
   publishes a new reading up to a few dozen times a day; /now/air genuinely
   changes each time, but submitting one URL that often is the behaviour the
   protocol asks you not to exhibit, and the page is already crawled often
   because it changes often. The event and content workflows are where a NEW
   url appears, which is what a push notification is for.

   ★ THE KEY IS PUBLIC BY DESIGN. IndexNow authenticates a submission by
   fetching https://<host>/<key>.txt and checking it contains the key — that is
   the whole model, and it proves the submitter controls the host. So the key
   lives in data/seo/indexnow.json and the file ships in public/. Moving it to a
   secret would break it, because then the file would not exist.

   Usage:
     node scripts/ping-indexnow.mjs --changed "public/_pages/v3/a.html public/_pages/v3/b.html"
     node scripts/ping-indexnow.mjs --url /now/climate-event/nepal-glof
     node scripts/ping-indexnow.mjs --url … --dry-run
   ═══════════════════════════════════════════════════════════════════════════ */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ARGV = process.argv.slice(2);
const DRY = ARGV.includes('--dry-run');
const arg = (name) => {
  const i = ARGV.indexOf(name);
  return i >= 0 ? ARGV[i + 1] : null;
};

const cfg = JSON.parse(readFileSync(join(ROOT, 'data/seo/indexnow.json'), 'utf8'));
const ORIGIN = (process.env.SITE_ORIGIN?.trim() || 'https://swechha.in').replace(/\/+$/, '');

/* ── THE KEY FILE MUST SHIP, OR EVERY SUBMISSION IS REJECTED ─────────────
   Checked locally before any request: the failure is otherwise silent and
   remote, and a cron job that pings into a rejection forever is worse than one
   that does not ping. */
const keyFile = join(ROOT, 'public', `${cfg.key}.txt`);
if (!existsSync(keyFile)) {
  console.error(`REFUSING: public/${cfg.key}.txt does not exist, so IndexNow cannot verify `
    + 'ownership and every submission would be rejected. Write the key into that file.');
  process.exit(1);
}
if (readFileSync(keyFile, 'utf8').trim() !== cfg.key) {
  console.error(`REFUSING: public/${cfg.key}.txt does not contain the key from `
    + 'data/seo/indexnow.json. The two must match exactly.');
  process.exit(1);
}

/* ── CHANGED FILES → THE ROUTES THEY SERVE ───────────────────────────────
   Read out of each page's own `rel=canonical`, not from a second copy of the
   route map. That tag is written by assemble() and is already what the sitemap
   and the search index derive from, so a page cannot be submitted under a URL
   it does not claim. */
function routesFor(files) {
  const out = new Set();
  for (const f of files) {
    if (!f.endsWith('.html')) continue;
    const p = join(ROOT, f);
    if (!existsSync(p)) continue;
    const m = /<link rel="canonical" href="([^"]+)"/.exec(readFileSync(p, 'utf8'));
    if (m) out.add(m[1]);
    else console.log(`  no rel=canonical in ${f} — skipped`);
  }
  return [...out];
}

let urls = [];
if (arg('--url')) {
  urls = ARGV.filter((a, i) => ARGV[i - 1] === '--url')
    .map((u) => (u.startsWith('http') ? u : `${ORIGIN}${u}`));
} else if (arg('--changed')) {
  urls = routesFor(arg('--changed').split(/\s+/).filter(Boolean));
}

if (!urls.length) {
  console.log('No changed pages to submit. Nothing sent — this is the normal quiet state.');
  process.exit(0);
}

/* Absolute, same-origin, de-duplicated. IndexNow rejects a batch outright if
   any URL is off-host, so one bad entry must not take the batch with it. */
const clean = [...new Set(urls.map((u) => (u.startsWith('http') ? u : `${ORIGIN}${u}`)))]
  .filter((u) => {
    if (u.startsWith(`${ORIGIN}/`) || u === ORIGIN) return true;
    console.log(`  dropped (not on ${ORIGIN}): ${u}`);
    return false;
  });

console.log(`IndexNow — ${clean.length} URL(s):`);
for (const u of clean) console.log(`  ${u}`);

if (DRY) {
  console.log('\n--dry-run: nothing sent.');
  process.exit(0);
}

const body = {
  host: new URL(ORIGIN).host,
  key: cfg.key,
  keyLocation: `${ORIGIN}/${cfg.key}.txt`,
  urlList: clean,
};

const res = await fetch(cfg.endpoint, {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify(body),
}).catch((e) => ({ ok: false, status: 0, statusText: e.message }));

const text = typeof res.text === 'function' ? await res.text().catch(() => '') : '';

/* ★ A FAILED PING IS A WARNING, NOT A BUILD FAILURE. The page is already
   published and correct; this is a notification about it. 202 is the success
   code. 200 is also accepted. Anything else is reported loudly and the job
   carries on, for the same reason the news fetches exit 75 on an unreachable
   feed: going red about somebody else's server trains a human to ignore the
   alert that matters. */
if (res.status === 200 || res.status === 202) {
  console.log(`\nAccepted — HTTP ${res.status}. Bing, Yandex, Seznam and Naver have it.`);
  console.log('Google does not participate in IndexNow; its signal is the sitemap lastmod, '
    + 'which this repo already computes from a content hash.');
  process.exit(0);
}
console.error(`\nIndexNow returned HTTP ${res.status} ${res.statusText || ''}`.trimEnd());
if (text) console.error(`  ${text.slice(0, 300)}`);
console.error('  Not fatal: the page is published and correct either way. Common causes are a '
  + `key file that has not deployed yet (${ORIGIN}/${cfg.key}.txt must be live), or too many `
  + 'submissions of the same URL.');
process.exit(0);
