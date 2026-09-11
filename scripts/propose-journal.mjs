#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════
   propose-journal.mjs — THE THING THAT NOTICES, FOR THE JOURNAL.
   ───────────────────────────────────────────────────────────────────────────
     node scripts/propose-journal.mjs             # detect and write dossiers
     node scripts/propose-journal.mjs --dry-run   # detect and write nothing

   ★ WHAT THIS WRITES, AND WHAT IT REFUSES TO WRITE.
   It writes a DOSSIER: what fired, the numbers that fired it, the pages that
   already explain those numbers, the primary sources to check, and a
   reviewer's checklist. It writes NO prose, NO headline, NO claim, and it
   never creates an article. `scripts/build-journal.mjs` will not build
   anything that is not marked published with a named approver, so there is no
   path from this script to a live page that does not pass through a person.

   That is the same discipline `detect-climate-events.mjs` already runs on, and
   reusing it is the point: this repository's rule is generic engines rather
   than parallel mechanisms, and "a machine may notice, a person must publish"
   is the rule the disaster pages were built around first.

   ★ THE TRIGGERS ARE FIRST-PARTY, WHICH IS WHY THEY NEED NO KEYS.
   Every one of them fires off a dataset already committed to this repository —
   the same files the live pages read. That makes the proposals reproducible
   from a clean checkout, runnable in CI with no secret, and, more importantly,
   about Swechha's own record rather than about somebody else's headline.
   Reading external news is what detect-climate-events.mjs is for; this is the
   half nobody else can run.

   ★ A TRIGGER IS NOT A STORY. Every dossier states what would have to be true
   for the trigger to be worth writing about, because a threshold crossing on a
   quiet week is a fact and not news.
   ═══════════════════════════════════════════════════════════════════════════ */
import { readFileSync, readdirSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA = join(ROOT, 'data');
const OUT = join(DATA, 'journal/proposals');
const DRY = process.argv.includes('--dry-run');

const J = (f) => JSON.parse(readFileSync(join(DATA, f), 'utf8'));
const has = (f) => existsSync(join(DATA, f));
const today = new Date().toISOString().slice(0, 10);

const proposals = [];
/** Every dossier has the same shape; the trigger block is what differs. */
const propose = (p) => proposals.push({
  id: `${today}-${p.slug}`,
  detected_at: new Date().toISOString(),
  detector: 'propose-journal.mjs',
  status: 'proposed',
  note: 'A DOSSIER, NOT A DRAFT. No prose here is publishable and none is in Swechha\'s voice. '
    + 'Write the piece by hand into data/journal/articles/, or discard this file. '
    + 'scripts/build-journal.mjs refuses to build anything without publish_state:"published" '
    + 'and a named approved_by, so nothing here can reach a reader on its own.',
  ...p,
});

/* ═══ TRIGGER 1 — DELHI AIR AGAINST ITS PUBLISHED LIMIT ══════════════════ */
if (has('air-delhi.json')) {
  const a = J('air-delhi.json');
  const limit = a.aqiLimit;
  const worst = a.city_reading?.aqi;
  const best = a.spread?.best?.aqi;
  const above = a.spread?.above_limit;
  const stations = a.spread?.stations;
  const spread = Number.isFinite(worst) && Number.isFinite(best) ? worst - best : null;

  /* 1a. The city's worst monitor in a band that is over the standard. */
  if (Number.isFinite(worst) && worst > limit * 2) {
    propose({
      slug: 'delhi-air-well-over-the-standard',
      subject: 'Delhi air',
      kind: 'threshold crossed',
      trigger: {
        what: `The worst reporting monitor is at ${worst}, more than twice the top of CPCB's Satisfactory band (${limit}).`,
        figures: [
          { label: 'Worst monitor', value: worst, station: a.city_reading?.station, governing: a.city_reading?.governing },
          { label: 'Top of Satisfactory', value: limit, authority: 'CPCB National Air Quality Index' },
          { label: 'Observed', value: a.observed?.cpcb_observed_ist || a.observed?.raw },
        ],
      },
      worth_writing_if: [
        'The reading holds across several hours rather than being one pass.',
        'The same station is repeatedly the worst, which points at a source rather than at weather.',
        'It is early in the season, when a reading like this is not yet expected.',
      ],
      already_explains_it: ['/learn/delhi-aqi', '/learn/pm25', '/learn/delhi-air-pollution'],
      live: '/now/air',
      record: '/record/air',
      sources_to_check: [
        'https://airquality.cpcb.gov.in/',
        'https://api.data.gov.in/resource/3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69',
      ],
    });
  }

  /* 1b. The spread across the city — the finding a city average conceals. */
  if (Number.isFinite(spread) && spread >= 120) {
    propose({
      slug: 'delhi-air-station-spread',
      subject: 'Delhi air',
      kind: 'dispersion',
      trigger: {
        what: `${spread} index points between the cleanest and the dirtiest reporting monitor, with ${above} of ${stations} over ${limit}.`,
        figures: [
          { label: 'Worst', value: worst, station: a.city_reading?.station },
          { label: 'Cleanest', value: best, station: a.spread?.best?.station },
          { label: 'City mean (unweighted)', value: a.city_mean?.aqi },
          { label: 'Stations over the limit', value: `${above} of ${stations}` },
        ],
      },
      worth_writing_if: [
        'The spread is unusual for the season rather than the normal daily range.',
        'The stations at each end are geographically close, which makes a single city figure harder to defend.',
      ],
      already_explains_it: ['/learn/cpcb-aqi', '/learn/delhi-aqi'],
      live: '/now/air',
      record: '/record/air',
      sources_to_check: ['https://cpcb.nic.in/National-Air-Quality-Index/'],
    });
  }
}

/* ═══ TRIGGER 2 — A SOURCE RESTATED A PUBLISHED READING ══════════════════ */
{
  const dir = join(DATA, 'air-history');
  if (existsSync(dir)) {
    let served = 0; const moved = [];
    for (const f of readdirSync(dir).filter((x) => /^delhi-\d{4}-\d{2}\.ndjson$/.test(x))) {
      for (const line of readFileSync(join(dir, f), 'utf8').trim().split('\n').filter(Boolean)) {
        const o = JSON.parse(line);
        if (!o.revised) continue;
        served += o.revised;
        for (const r of o.revisions || []) {
          if (r.from?.aqi != null && o.city?.aqi != null && r.from.aqi !== o.city.aqi) {
            moved.push({ obs: o.obs, from: r.from.aqi, to: o.city.aqi });
          }
        }
      }
    }
    /* ONLY A MOVED HEADLINE IS A STORY. A re-read that changes nothing visible
       is housekeeping, and proposing it every run would train a reviewer to
       ignore this detector — which is the way a detector dies. */
    if (moved.length) {
      propose({
        slug: 'cpcb-restated-published-readings',
        subject: 'Delhi air',
        kind: 'source revision',
        trigger: {
          what: `${moved.length} published observation${moved.length === 1 ? ' has' : 's have'} had the city's headline reading changed after this site first stored ${moved.length === 1 ? 'it' : 'them'} (${served} observation times re-served in total).`,
          figures: moved.slice(0, 10),
        },
        worth_writing_if: [
          'A revision crossed a band boundary, which changes what the reading meant.',
          'A revision moved a figure that was already quoted publicly.',
          'The pattern is systematic rather than a handful of late-reporting stations.',
        ],
        already_explains_it: ['/learn/cpcb-aqi', '/learn/how-to-read-environmental-data'],
        live: '/now/air',
        record: '/record/air',
        sources_to_check: ['https://airquality.cpcb.gov.in/'],
      });
    }
  }
}

/* ═══ TRIGGER 3 — THE RIVER AGAINST ITS NOTIFIED CRITERIA ════════════════ */
if (has('yamuna-cpcb-2025.json')) {
  const y = J('yamuna-cpcb-2025.json');
  const doLim = y.limits?.do?.value, bodLim = y.limits?.bod?.value;
  const failDo = (y.stations || []).filter((s) => s.do?.min != null && s.do.min < doLim);
  const failBod = (y.stations || []).filter((s) => s.bod?.max != null && s.bod.max > bodLim);
  const floor = (y.stations || []).filter((s) => s.do?.min === y.reporting_floor?.do);
  if (floor.length >= 3) {
    propose({
      slug: 'yamuna-stations-at-the-oxygen-floor',
      subject: 'The Yamuna',
      kind: 'threshold crossed',
      trigger: {
        what: `${floor.length} stations report a dissolved-oxygen minimum at the method's reporting floor of ${y.reporting_floor?.do} mg/L — meaning at or below it. ${failDo.length} of ${y.stations.length} fail the ${y.limits?.do?.label} criterion and ${failBod.length} fail ${y.limits?.bod?.label}.`,
        figures: floor.map((s) => ({ station: s.station, state: s.state, do_min: s.do.min, bod_max: s.bod?.max })),
      },
      worth_writing_if: [
        'A new station has joined the floor group since the previous year\'s table.',
        'It coincides with a policy claim about the river that the table does not support.',
        'The stretch above the barrage has also moved, which would point at something other than abstraction.',
      ],
      already_explains_it: ['/learn/yamuna-dissolved-oxygen', '/learn/yamuna-bod', '/learn/yamuna-pollution'],
      live: '/now/yamuna',
      record: null,
      sources_to_check: ['https://cpcb.gov.in/nwmp-data-2025/', 'https://cpcb.nic.in/water-quality-criteria/'],
    });
  }
}

/* ═══ TRIGGER 4 — A HEAT STATION AT ITS OWN RECORD ═══════════════════════ */
if (has('heat-india.json')) {
  const h = J('heat-india.json');
  const nat = h.national || {};
  if (nat.worst_station_this_reading) {
    const w = nat.worst_station_this_reading;
    propose({
      slug: 'heat-season-worst-station',
      subject: 'Heat',
      kind: 'seasonal reading',
      trigger: {
        what: `${w.name} recorded ${w.days} day${w.days === 1 ? '' : 's'} meeting IMD's heatwave criteria in ${w.year}, the highest of the ${nat.stations_reporting} stations read.`,
        figures: [
          { label: 'Worst station this reading', value: `${w.name}, ${w.state}`, days: w.days, peak_tmax: w.peak_tmax, year: w.year },
          { label: 'Hottest in the whole record', value: nat.hottest_on_record?.name, tmax: nat.hottest_on_record?.tmax, date: nat.hottest_on_record?.date },
          { label: 'Stations trending up on qualifying days', value: nat.consensus?.heatwave_days?.up, of: nat.stations_reporting },
        ],
      },
      worth_writing_if: [
        'The station is one where a heatwave is not expected, which is the story rather than the count.',
        'The warm-night count moved with it — night temperature predicts mortality better than the day maximum.',
        'A heat action plan exists for that city and its trigger temperature was crossed.',
      ],
      already_explains_it: ['/learn/india-heatwave', '/learn/imd-heatwave-criteria', '/learn/heatwave-vs-extreme-heat'],
      live: '/now/heat',
      record: null,
      sources_to_check: ['https://mausam.imd.gov.in/'],
    });
  }
}

/* ═══ TRIGGER 5 — A LIVE DISASTER ALREADY ABOVE ITS PUBLICATION BAR ══════ */
{
  const dir = join(DATA, 'climate-events/active');
  if (existsSync(dir)) {
    const live = readdirSync(dir).filter((f) => f.endsWith('.json'))
      .map((f) => JSON.parse(readFileSync(join(dir, f), 'utf8')))
      .filter((e) => e.publish_state === 'published');
    if (live.length) {
      propose({
        slug: 'live-climate-events',
        subject: 'Extreme events',
        kind: 'live event',
        trigger: {
          what: `${live.length} climate event${live.length === 1 ? ' is' : 's are'} above the detector's publication bar and already have pages.`,
          figures: live.map((e) => ({ slug: e.slug, hazard: e.hazard, place: e.place })),
        },
        worth_writing_if: [
          'A Journal piece would add analysis the event page does not carry — the pattern across events, or the policy behind it.',
          'It would NOT simply restate the event dossier, which is already published and already sourced.',
        ],
        already_explains_it: ['/learn/extreme-rainfall', '/learn/delhi-rainfall'],
        live: '/now/climate-event',
        record: null,
        sources_to_check: ['https://mausam.imd.gov.in/', 'https://sachet.ndma.gov.in/'],
      });
    }
  }
}

/* ═══ TRIGGER 6 — THE STANDING FOREST ARITHMETIC ═════════════════════════ */
if (has('forest-isfr-2023.json')) {
  const i = J('forest-isfr-2023.json');
  const net = i.change_2021_to_2023?.net_change_forest_cover;
  const worst = i.change_2021_to_2023?.losses?.[0];
  if (net != null && worst && worst.km2 > net) {
    propose({
      slug: 'forest-net-vs-largest-state-loss',
      subject: 'Forests',
      kind: 'standing finding',
      trigger: {
        what: `India's national net change in forest cover is ${net} km², and ${worst.state} alone lost ${worst.km2} km² — ${(worst.km2 / net).toFixed(1)} times the national net.`,
        figures: [
          { label: 'National net change', value: net, unit: 'km²' },
          { label: `${worst.state} loss`, value: worst.km2, unit: 'km²' },
          { label: 'Largest state gain', value: i.change_2021_to_2023?.gains?.[0] },
        ],
      },
      worth_writing_if: [
        'A new ISFR has been published, which resets both numbers.',
        'The national net figure is being quoted somewhere as evidence of a trend.',
        'ALREADY WRITTEN once — /journal/one-state-lost-twice-the-national-gain. Do not repeat it; a second piece needs a new report or a new angle.',
      ],
      already_explains_it: ['/learn/forest-loss-india', '/learn/forest-cover-vs-tree-cover'],
      live: '/now/forest-loss',
      record: null,
      sources_to_check: ['https://fsi.nic.in/forest-report-2023', 'https://www.globalforestwatch.org/dashboards/country/IND/'],
    });
  }
}

/* ═══ REPORT AND WRITE ═══════════════════════════════════════════════════ */
console.log(`propose-journal — ${proposals.length} dossier(s)${DRY ? ' (dry run, nothing written)' : ''}\n`);
for (const p of proposals) {
  console.log(`  ${p.subject.padEnd(16)} ${p.kind.padEnd(18)} ${p.id}`);
  console.log(`    ${p.trigger.what}`);
  console.log(`    explains it already: ${(p.already_explains_it || []).join(' ') || '—'}\n`);
}
if (!proposals.length) console.log('  Nothing crossed a threshold. That is a normal week.\n');

if (!DRY && proposals.length) {
  mkdirSync(OUT, { recursive: true });
  for (const p of proposals) {
    const f = join(OUT, `${p.id}.json`);
    /* NEVER OVERWRITE. A reviewer may have annotated yesterday's dossier, and a
       detector that clobbers its own output destroys the review it exists to
       start. */
    if (existsSync(f)) { console.log(`  kept  ${p.id}.json already exists — not overwritten.`); continue; }
    writeFileSync(f, `${JSON.stringify(p, null, 2)}\n`);
    console.log(`  wrote data/journal/proposals/${p.id}.json`);
  }
  console.log('\nNext: write one by hand into data/journal/articles/, set publish_state and approved_by,\n'
    + 'then `npm run build:journal`. Nothing is published until you do.');
}
