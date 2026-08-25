#!/usr/bin/env node
/**
 * fetch-attention.mjs — how much the world is LOOKING at Delhi's air.
 *
 *   node scripts/fetch-attention.mjs [out.json]        # keyless
 *
 * WHY WIKIPEDIA AND NOT GDELT (D-20.2). GDELT counts what outlets
 * PUBLISH and rate-limits to about one request per five seconds, refusing
 * six consecutive attempts during the build. Wikipedia pageviews count what
 * people SEEK — attention as demand rather than supply — and the endpoint is
 * keyless, unthrottled and daily, with years of history returned on the
 * first call.
 *
 * THE DEVICE. Drawn against AQI on one time axis, the finding is the
 * divergence: **the air is bad all year and the attention is not.**
 * Measured monthly views for "Air pollution in Delhi":
 *
 *     Nov 2023  39,084      Nov 2024  29,709      Nov 2025  31,052
 *     summer floors ~3,600 – 4,900
 *
 * An eight-to-tenfold seasonal swing, every year, while the readings stay
 * above the limit year-round.
 *
 * ★ THE GUARD THAT MATTERS — THE PARTIAL MONTH.
 * The current month is INCOMPLETE. August 2026 returned 83 views against a
 * ~3,600 floor. Plotted innocently, that reads as attention collapsing to
 * nothing, which is the same class of lie as the FIRMS error-body being read
 * as "no fires" (D-16.4). So the newest month is flagged `partial:true` and
 * EXCLUDED from every derived figure — the peak, the floor, the ratio and
 * the series drawn on the page.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const OUT = resolve(process.argv[2] || 'data/attention-delhi-air.json');
const ARTICLE = process.env.WIKI_ARTICLE || 'Air_pollution_in_Delhi';

/* ---- WHAT THIS FILE IS ABOUT, PER ARTICLE. --------------------------------

   THE DEFECT THIS FIXES (2026-08-26). `subject`, `role`, `device` and the first
   caveat used to be four hardcoded strings about Delhi air, written when this
   script only ever ran for one article. It has run for five since. Every
   attention file on disk therefore described itself as "Attention paid to Delhi
   air pollution" and claimed to be drawn against AQI — including the Yamuna,
   heat, forest-loss and climate ones.

   None of it renders and none of the NUMBERS were ever wrong: `source.article`
   was always derived from ARTICLE, so each file fetched the right series. But
   this site's whole claim is that a reading carries its own provenance, and a
   provenance label that is wrong four times out of five is the wrong thing to
   be carrying, rendered or not.

   Keyed by article rather than by output filename because ARTICLE is what
   decides the series. An article with no entry THROWS: a new situation must say
   what its attention is attention TO, and inheriting Delhi's wording silently
   is the bug that got us here.                                                */
const SUBJECTS = {
  Air_pollution_in_Delhi: {
    subject: 'Attention paid to Delhi air pollution',
    never:   'air quality',
    against: 'AQI',
    finding: 'the air is bad all year and the attention is not',
    caveat:  'Pageviews measure attention, not air quality. A quiet month is not a clean month.',
  },
  Yamuna: {
    subject: 'Attention paid to the Yamuna',
    never:   'river health',
    against: 'the river readings',
    finding: 'the river breaches its legal limits all year and the attention does not',
    caveat:  'Pageviews measure attention, not river health. A quiet month is not a clean river.',
  },
  Heat_wave: {
    subject: 'Attention paid to heat',
    never:   'temperature',
    against: 'the heat readings',
    finding: 'attention arrives with the season and leaves before the heat does',
    caveat:  'Pageviews measure attention, not temperature. A quiet month is not a cool one.',
  },
  Deforestation_in_India: {
    subject: 'Attention paid to forest loss',
    never:   'forest cover',
    against: 'the annual loss figures',
    finding: 'loss accumulates every year and attention does not track it',
    caveat:  'Pageviews measure attention, not forest cover. A quiet month is not a month without loss.',
  },
  Climate_change_in_India: {
    subject: 'Attention paid to climate change in India',
    never:   'the climate itself',
    against: 'the recorded events',
    finding: 'attention spikes around events and settles far below them',
    caveat:  'Pageviews measure attention, not climate. A quiet month is not an uneventful one.',
  },
};

const LABELS = SUBJECTS[ARTICLE];
if (!LABELS) {
  console.error(
    `fetch-attention: no labels for WIKI_ARTICLE="${ARTICLE}".\n` +
    `Add an entry to SUBJECTS in this file saying what this attention is attention TO.\n` +
    `Known: ${Object.keys(SUBJECTS).join(', ')}`,
  );
  process.exit(1);
}
const PROJECT = 'en.wikipedia';
const UA = 'SwechhaBot/1.0 (https://swechha.in; vimlendu@swechha.in)';

// Local getters only. Never toISOString — the standing rule.
const d = new Date();
const Y = d.getFullYear(), M = d.getMonth() + 1, D = d.getDate();
const pad = (n) => String(n).padStart(2, '0');
const thisMonth = `${Y}${pad(M)}`;
const START = process.env.WIKI_START || `${Y - 4}0101`;
const END = `${Y}${pad(M)}${pad(D)}`;

async function pageviews(granularity, start, end) {
  const url = `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/`
    + `${PROJECT}/all-access/user/${encodeURIComponent(ARTICLE)}/${granularity}/${start}/${end}`;
  const res = await fetch(url, { headers: { 'User-Agent': UA, 'Api-User-Agent': UA } });
  if (!res.ok) return { ok: false, error: `HTTP ${res.status}`, items: null };
  const body = await res.json();
  if (!Array.isArray(body.items)) return { ok: false, error: 'unexpected response shape', items: null };
  return { ok: true, error: null, items: body.items };
}

const monthly = await pageviews('monthly', START, END);
if (!monthly.ok) {
  console.error(`Wikipedia pageviews unavailable (${monthly.error}). ` +
    `Leaving the previous file alone rather than publishing an absence.`);
  process.exit(1);
}

const months = monthly.items.map(x => {
  const m = x.timestamp.slice(0, 6);
  return { month: m, views: x.views, partial: m === thisMonth };
});
// Every derived figure is computed on COMPLETE months only.
const complete = months.filter(m => !m.partial);
if (!complete.length) { console.error('No complete months returned.'); process.exit(1); }

const peak = complete.reduce((a, b) => (b.views > a.views ? b : a));
const floor = complete.reduce((a, b) => (b.views < a.views ? b : a));

// November against the summer, year by year — the seasonal claim, checkable.
const byYear = {};
for (const m of complete) {
  const y = m.month.slice(0, 4), mm = m.month.slice(4, 6);
  (byYear[y] ??= { year: y, november: null, summerMean: null, _summer: [] });
  if (mm === '11') byYear[y].november = m.views;
  if (['05', '06', '07', '08'].includes(mm)) byYear[y]._summer.push(m.views);
}
const seasons = Object.values(byYear).map(y => {
  const s = y._summer.length ? Math.round(y._summer.reduce((a, b) => a + b, 0) / y._summer.length) : null;
  return { year: y.year, november: y.november, summerMean: s,
    ratio: (y.november && s) ? +(y.november / s).toFixed(1) : null };
}).filter(y => y.november || y.summerMean);

const out = {
  subject: LABELS.subject,
  role: `a measurement of ATTENTION, never of ${LABELS.never}`,
  source: {
    name: 'Wikimedia pageviews API',
    article: ARTICLE.replace(/_/g, ' '),
    url: `https://en.wikipedia.org/wiki/${ARTICLE}`,
    api: 'https://wikimedia.org/api/rest_v1/',
    note: 'keyless, unthrottled, daily granularity; counts what people SEEK, not what outlets publish',
  },
  state_label: 'PERIODIC',
  device: `Drawn against ${LABELS.against} on one time axis. The finding is the divergence: `
        + `${LABELS.finding}.`,
  window: { from: START, to: END, granularity: 'monthly' },
  months,                                  // includes the partial, flagged
  complete_months: complete.length,
  partial_month: months.find(m => m.partial) ?? null,
  peak, floor,
  swing: floor.views > 0 ? +(peak.views / floor.views).toFixed(1) : null,
  seasons,
  caveats: [
    LABELS.caveat,
    'One English Wikipedia article is a proxy for public attention, not a census of it.',
    'The current month is incomplete and is excluded from every derived figure. It is flagged, never plotted.',
    'Attention is compared with readings on the same axis. Neither causes the other.',
  ],
  fetched: { epochMs: Date.now() },
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');

console.log(`${complete.length} complete months (${START} → ${END})`);
console.log(`peak  ${peak.month} ${peak.views.toLocaleString()}`);
console.log(`floor ${floor.month} ${floor.views.toLocaleString()}`);
console.log(`swing ${out.swing}x`);
if (out.partial_month) console.log(`partial month EXCLUDED: ${out.partial_month.month} (${out.partial_month.views} views so far)`);
console.log('\nNovember against the summer:');
for (const s of seasons) {
  console.log(`  ${s.year}  Nov ${String(s.november ?? '—').padStart(6)}   summer mean ${String(s.summerMean ?? '—').padStart(5)}   ${s.ratio ? s.ratio + 'x' : ''}`);
}
console.log(`\nwrote ${OUT}`);
