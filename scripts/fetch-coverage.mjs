#!/usr/bin/env node
/**
 * fetch-coverage.mjs — journalism as a MEASURED SIGNAL, not as a source of
 * fact (D-19.2).
 *
 *   node scripts/fetch-coverage.mjs [out.json]        # no key needed
 *
 * TWO FEEDS, TWO DIFFERENT JOBS.
 *   Google News RSS  -> the register: what is being said right now, dated
 *                       and attributed.
 *   GDELT timelinevol -> the signal: how MUCH is being said, over 12 months.
 *
 * THE DEVICE THIS EXISTS FOR. The volume series is drawn against AQI on the
 * same time axis, and the finding is the divergence: **the air is bad all
 * year and the coverage is not.** Attention spikes with the winter smog and
 * collapses through the monsoon while the readings stay above the limit.
 * Nothing else on the page measures the gap between a problem and the
 * noticing of it.
 *
 * THE RULE THAT GOVERNS EVERY ROW, carried over verbatim from the page this
 * replaces: "Reporting is tagged as reporting. It is never presented as
 * Swechha's finding." A headline is evidence that something was SAID. It is
 * never evidence that it is TRUE. So this file publishes publisher + date +
 * link and nothing else — no summary, no extracted claim, no figure lifted
 * out of a headline and set as data.
 *
 * GDELT RATE-LIMITS at about one request per five seconds and answers a
 * breach with HTTP 429 and a PROSE body. So: exponential backoff, validate
 * the shape, and on failure record `null` — never zero. "Nobody is writing
 * about this" manufactured by a rate limit would be the worst possible
 * version of this band. Same lesson as the FIRMS error-body bug (D-16.4).
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const OUT = resolve(process.argv[2] || 'data/coverage-delhi-air.json');
const QUERY = process.env.COVERAGE_QUERY || 'delhi air pollution';
const GDELT_QUERY = process.env.GDELT_QUERY || '"air pollution" delhi';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const strip = (s) => String(s ?? '')
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
  .replace(/<[^>]+>/g, '')
  .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(+d))
  .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/\s+/g, ' ').trim();

/* ── THE REGISTER — Google News RSS ──────────────────────────────────── */
async function register() {
  const url = 'https://news.google.com/rss/search?q=' + encodeURIComponent(QUERY)
    + '&hl=en-IN&gl=IN&ceid=IN:en';
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SwechhaBot/1.0)' } });
  if (!res.ok) return { ok: false, error: `HTTP ${res.status}`, items: null };
  const xml = await res.text();
  if (!xml.includes('<rss') && !xml.includes('<item>')) {
    return { ok: false, error: 'response is not an RSS document', items: null };
  }
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(m => {
    const it = m[1];
    const tag = (t) => {
      const r = new RegExp(`<${t}[^>]*>([\\s\\S]*?)</${t}>`).exec(it);
      return r ? strip(r[1]) : null;
    };
    // Google News writes <source url="...">Publisher</source>, and appends
    // " - Publisher" to the title. Take the element, then de-duplicate.
    const publisher = tag('source');
    let title = tag('title');
    if (publisher && title?.endsWith(` - ${publisher}`)) {
      title = title.slice(0, -(publisher.length + 3)).trim();
    }
    return { title, publisher, published: tag('pubDate'), link: tag('link') };
  }).filter(i => i.title && i.link);

  const byPublisher = {};
  for (const i of items) if (i.publisher) byPublisher[i.publisher] = (byPublisher[i.publisher] || 0) + 1;
  return { ok: true, error: null, items, count: items.length, publishers: byPublisher };
}

/* ── THE SIGNAL — GDELT article volume over 12 months ──────────────────
   D-20.2 REPLACED THIS WITH WIKIPEDIA PAGEVIEWS for the Air page, on the
   grounds that GDELT measures what outlets PUBLISH, rate-limits to about one
   request per five seconds, and refused six consecutive attempts during that
   build. The code stays because the register half of this file is still the
   coverage band on every situation page — but the signal half is now opt-in.
   With COVERAGE_SKIP_GDELT=1 the block is recorded as a DELIBERATE OMISSION,
   which is a different thing from a failure and is stored as a different
   thing: `skipped: true`, not `ok: false`. A page must never read a decision
   as an outage. */
async function signal() {
  if (process.env.COVERAGE_SKIP_GDELT) {
    return { ok: false, skipped: true,
      error: 'not requested — D-20.2 replaced the GDELT signal with Wikipedia pageviews',
      points: null, monthly: null, peak: null, floor: null, ratio: null };
  }
  const url = 'https://api.gdeltproject.org/api/v2/doc/doc?query='
    + encodeURIComponent(GDELT_QUERY) + '&mode=timelinevol&timespan=12m&format=json';
  for (let attempt = 1; attempt <= 6; attempt++) {
    await sleep(attempt * 5000);                    // 5s, 10s, 15s … backoff
    let res, body;
    try { res = await fetch(url); body = await res.text(); }
    catch (e) { continue; }
    // GDELT answers a rate-limit breach with 200-or-429 and PROSE. Validate
    // the shape, never the status.
    if (!body.trim().startsWith('{')) continue;
    let json;
    try { json = JSON.parse(body); } catch { continue; }
    const series = json.timeline?.[0]?.data ?? [];
    if (!series.length) continue;
    const points = series.map(p => ({ date: p.date.slice(0, 8), value: p.value }));
    const byMonth = {};
    for (const p of points) (byMonth[p.date.slice(0, 6)] ??= []).push(p.value);
    const monthly = Object.entries(byMonth)
      .map(([m, v]) => ({ month: m, mean: +(v.reduce((a, b) => a + b, 0) / v.length).toFixed(5) }))
      .sort((a, b) => a.month.localeCompare(b.month));
    const peak = monthly.reduce((a, b) => (b.mean > a.mean ? b : a));
    const floor = monthly.reduce((a, b) => (b.mean < a.mean ? b : a));
    return {
      ok: true, error: null, attempts: attempt, points, monthly,
      peak, floor,
      ratio: floor.mean > 0 ? +(peak.mean / floor.mean).toFixed(1) : null,
      unit: 'GDELT normalised volume — percent of all monitored coverage',
    };
  }
  // NULL, NOT ZERO. This is the whole point of the guard.
  return { ok: false, error: 'GDELT unavailable after 6 attempts (rate limit)',
    points: null, monthly: null, peak: null, floor: null, ratio: null };
}

const [reg, sig] = [await register(), await signal()];

// A SKIPPED signal is not a failed one, so it must not be able to abort the job.
if (!reg.ok && !sig.ok && !sig.skipped) {
  console.error('Both feeds failed. Leaving the previous file alone rather than publishing an absence.');
  process.exit(1);
}
if (!reg.ok && sig.skipped) {
  console.error('The register failed and the signal was skipped. Nothing to publish; leaving the previous file alone.');
  process.exit(1);
}

const out = {
  subject: QUERY,
  role: 'journalism as a measurement of ATTENTION, never as a source of fact',
  rule: 'Reporting is tagged as reporting. It is never presented as Swechha\'s finding. '
      + 'A headline is evidence that something was said, not that it is true.',
  // The device sentence is per-subject: the reading it is drawn against differs
  // from page to page, and a hardcoded "against AQI" would be false on four of
  // the five situations that reuse this file.
  device: process.env.COVERAGE_DEVICE
        || 'Coverage volume is drawn against the reading on one time axis. The finding is the '
         + 'divergence: the problem runs all year and the coverage does not.',
  state_label: 'PERIODIC',
  register: {
    source: { name: 'Google News', url: 'https://news.google.com/', note: 'search feed, keyless' },
    ok: reg.ok, error: reg.error,
    count: reg.count ?? null,
    publishers: reg.publishers ?? null,
    // Publisher, date and link only. No summary, and no figure lifted out
    // of a headline and set as data.
    items: reg.items ?? null,
  },
  signal: {
    source: { name: 'GDELT Project', url: 'https://www.gdeltproject.org/',
      note: 'timelinevol, 12 months, keyless; rate-limited to ~1 request / 5s' },
    ...sig,
  },
  caveats: [
    'Volume measures how much is written, not how bad the air is.',
    'A quiet month is not a clean month.',
    'Google News ranks by its own relevance model; the register is a sample of coverage, not a census of it.',
    'GDELT indexes a subset of world media and normalises against total coverage, so the series is a share, not a count.',
    'A failed fetch is recorded as null. It is never recorded as zero coverage.',
  ],
  fetched: { epochMs: Date.now() },
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');

console.log(`register: ${reg.ok ? `${reg.count} items, ${Object.keys(reg.publishers).length} publishers` : `FAILED — ${reg.error}`}`);
if (sig.ok) {
  console.log(`signal:   ${sig.points.length} days, ${sig.monthly.length} months (attempt ${sig.attempts})`);
  console.log(`          peak ${sig.peak.month} ${sig.peak.mean} · floor ${sig.floor.month} ${sig.floor.mean} · ratio ${sig.ratio}x`);
} else if (sig.skipped) {
  console.log(`signal:   SKIPPED — ${sig.error} (recorded as a decision, not an outage)`);
} else {
  console.log(`signal:   FAILED — ${sig.error} (recorded as null, not zero)`);
}
console.log(`wrote ${OUT}`);
