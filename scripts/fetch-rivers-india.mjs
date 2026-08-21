#!/usr/bin/env node
/**
 * fetch-rivers-india.mjs — the national river picture, and what the water does
 * to people.
 *
 *   node scripts/fetch-rivers-india.mjs        # keyless
 *
 * WHY THIS EXISTS. The Yamuna page opens on one river, and a reader's first
 * honest question is "is this one unusually bad, or is this just what a river
 * in India looks like?" That question cannot be answered from the Yamuna table,
 * and leaving it unanswered lets a reader assume either answer.
 *
 * TWO JOBS, TWO KINDS OF NUMBER.
 *
 *   1. THE RANKING — India's rivers, ordered by their worst measured organic
 *      load. Built from the CPCB-derived station table already committed in
 *      data/yamuna-crosscheck.json. No new network call: the rows are already
 *      there and re-fetching them would only add a failure mode.
 *
 *   2. THE HEALTH FIGURES — what unsafe water costs, from WHO via the World
 *      Bank's keyless API. This is the layer the river tables cannot supply:
 *      CPCB measures the water, and nobody in that chain counts a person.
 *
 * ★ THE RANKING'S OWN BIGGEST FLAW, AND IT IS PUBLISHED ON THE PAGE.
 * The source table contains NO DELHI YAMUNA STATION. So the Yamuna's row in
 * this ranking is computed without the worst stretch of the Yamuna — the one
 * the whole page is about. Measured against CPCB's direct 2025 Yamuna table,
 * the river's true worst BOD in Delhi is 72 mg/L against the 26 this table can
 * see. The ranking therefore UNDERSTATES the Yamuna, and the page says so
 * beside it rather than quietly substituting the better number and leaving a
 * ranking whose rows come from two different tables.
 *
 * ★ WHY A RANKING IS A WEAKER CLAIM THAN IT LOOKS, from the template: "A
 * snapshot is not a fact." Every row here is a MAXIMUM across that river's
 * stations, so a river with thirty stations has thirty chances to record a bad
 * one and a river with three has three. Cauvery has 30 stations here; Sirsa
 * has 3. That is on the page, in the row, because a river measured more is not
 * a river polluted more — the same correction the Air page makes for a city
 * with one monitor.
 *
 * AN ERROR IS NOT A ZERO. Each World Bank indicator is fetched independently
 * and a failure is recorded as null for that indicator alone. A missing
 * mortality rate must never render as "no deaths".
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const OUT = resolve(process.argv[2] || 'data/rivers-india.json');
const SRC = resolve('data/yamuna-crosscheck.json');
const UA = 'SwechhaBot/1.0 (https://swechha.in; vimlendu@swechha.in)';
const xc = JSON.parse(readFileSync(SRC, 'utf8'));

/* ── 1. THE RANKING ─────────────────────────────────────────────────────── */
const MIN_STATIONS = 3;   // a river with one station is a station, not a river

/** Pull the river name out of a CPCB station name. Confluence stations name two
    rivers ("RIVER GANGA AFTER CONFLUENCE OF RIVER BHAGIRATHI"); the FIRST is
    the one being measured, which is why the match is anchored at the start. */
function riverOf(name) {
  const n = String(name).toUpperCase();
  const m = /^\s*RIVER\s+([A-Z\-' ]+?)(?:\s+(?:AT|U\/S|D\/S|AFTER|BEFORE|BEFOR|B\/C|A\/C|NEAR|DOWN|DOWNSTREAM|UPSTREAM)\b|,|$)/.exec(n);
  if (m) return m[1].trim();
  const alt = /^\s*RIVER\s+([A-Z\-']+)/.exec(n);
  return alt ? alt[1].trim() : null;
}

const byRiver = new Map();
for (const s of xc.crosscheck.stations || []) {
  const r = riverOf(s.name);
  if (!r || s.bod == null) continue;
  if (!byRiver.has(r)) byRiver.set(r, { river: r, stations: 0, bod: [], fcMax: null, flagged: 0 });
  const a = byRiver.get(r);
  a.stations++;
  a.bod.push(s.bod);
  if (s.fc != null) a.fcMax = a.fcMax == null ? s.fc : Math.max(a.fcMax, s.fc);
  if (s.polluted || s.contaminated) a.flagged++;
}

// CPCB's Primary Water Quality Criteria, the same limits the Yamuna page uses.
const LIMIT_BOD = 3.0, LIMIT_FC = 2500;
const rivers = [...byRiver.values()]
  .filter(r => r.stations >= MIN_STATIONS)
  .map(r => ({
    river: title(r.river),
    stations: r.stations,
    bod_worst: +Math.max(...r.bod).toFixed(1),
    bod_mean: +(r.bod.reduce((a, b) => a + b, 0) / r.bod.length).toFixed(1),
    fc_worst: r.fcMax,
    // Multiples of the published limit. Division on two published numbers.
    bod_times_limit: +(Math.max(...r.bod) / LIMIT_BOD).toFixed(1),
    fc_times_limit: r.fcMax == null ? null : Math.round(r.fcMax / LIMIT_FC),
    stations_flagged: r.flagged,
  }))
  .sort((a, b) => b.bod_worst - a.bod_worst);

function title(s) {
  return s.toLowerCase().replace(/\b[a-z]/g, c => c.toUpperCase())
    .replace(/\bOf\b/g, 'of').trim();
}

const yamunaRow = rivers.find(r => /^Yamuna$/i.test(r.river)) || null;

/* ── 2. THE HEALTH FIGURES ──────────────────────────────────────────────── */
const WB = [
  { id: 'SH.STA.WASH.P5', key: 'wash_mortality_per_100k',
    what: 'Mortality rate attributed to unsafe water, unsafe sanitation and lack of hygiene',
    per: 'deaths per 100,000 population', authority: 'WHO, via the World Bank' },
  { id: 'SH.H2O.SMDW.ZS', key: 'safe_drinking_water_pct',
    what: 'People using safely managed drinking water services',
    per: '% of population', authority: 'WHO/UNICEF Joint Monitoring Programme, via the World Bank' },
  { id: 'SH.STA.SMSS.ZS', key: 'safe_sanitation_pct',
    what: 'People using safely managed sanitation services',
    per: '% of population', authority: 'WHO/UNICEF Joint Monitoring Programme, via the World Bank' },
  { id: 'SH.STA.ODFC.ZS', key: 'open_defecation_pct',
    what: 'People practising open defecation',
    per: '% of population', authority: 'WHO/UNICEF Joint Monitoring Programme, via the World Bank' },
  { id: 'SP.POP.TOTL', key: 'population',
    what: 'Population, total', per: 'people', authority: 'World Bank' },
];

async function wb(ind) {
  const url = `https://api.worldbank.org/v2/country/IND/indicator/${ind.id}?format=json&per_page=100`;
  let body;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (!res.ok) return { ...ind, ok: false, error: `HTTP ${res.status}`, series: null, latest: null };
    body = await res.json();
  } catch (e) { return { ...ind, ok: false, error: `network: ${e.message}`, series: null, latest: null }; }
  // Validate the SHAPE — the World Bank signals an error by returning a
  // different shape, not a different status.
  if (!Array.isArray(body) || body.length < 2 || !Array.isArray(body[1])) {
    return { ...ind, ok: false, error: 'unexpected response shape', series: null, latest: null };
  }
  const series = body[1].filter(r => r && r.value != null)
    .map(r => ({ year: Number(r.date), value: r.value }))
    .sort((a, b) => a.year - b.year);
  if (!series.length) return { ...ind, ok: false, error: 'no values returned', series: null, latest: null };
  return { ...ind, ok: true, error: null, name: body[1][0].indicator.value,
    lastupdated: body[0]?.lastupdated ?? null, series, latest: series[series.length - 1] };
}

const health = {};
for (const ind of WB) {
  const r = await wb(ind);
  health[ind.key] = r;
  console.log(`${ind.id.padEnd(16)} ` + (r.ok
    ? `${String(r.latest.value).padStart(16)}  (${r.latest.year})  ${r.series.length} years`
    : `FAILED — ${r.error}`));
}

/* THE DERIVED DEATH TOTAL. A rate is not a number of people, and most readers
   cannot turn one into the other, so the multiplication is done here — with
   the population taken from THE SAME YEAR as the rate, not the latest one.
   Using 2024's population against a 2019 rate would inflate the answer and
   would be the sort of quiet error this whole site exists to avoid. */
const wash = health.wash_mortality_per_100k;
const pop = health.population;
let washDeaths = null;
if (wash?.ok && pop?.ok) {
  const y = wash.latest.year;
  const popSame = pop.series.find(p => p.year === y);
  if (popSame) {
    washDeaths = {
      year: y,
      rate_per_100k: wash.latest.value,
      population: popSame.value,
      deaths: Math.round(wash.latest.value / 100000 * popSame.value),
      sum: `${wash.latest.value} per 100,000 x ${popSame.value.toLocaleString('en-IN')} people, both for ${y}`,
      note: 'The rate and the population are taken from the same year. Applying an older rate to a '
          + 'newer population would inflate the total.',
    };
  }
}

const out = {
  subject: 'India\'s rivers, and what unsafe water costs',
  role: 'the national context for one river, plus the health layer no river table carries',
  state_label: 'PERIODIC',
  kind: 'counted',

  ranking: {
    source: {
      name: 'CPCB National Water Quality Monitoring Programme data, as compiled by RiverWatch India',
      via: xc.crosscheck.source.url,
      note: 'Built from the station table already committed in data/yamuna-crosscheck.json. '
          + 'No new network call.',
      primary_caveat: 'This is a SECONDARY compiler. Every reading on the Yamuna page itself comes '
                    + 'from CPCB directly.',
    },
    limits: { bod: LIMIT_BOD, bod_unit: 'mg/L', fc: LIMIT_FC, fc_unit: 'MPN/100 mL',
      authority: 'Primary Water Quality Criteria notified under the Environment (Protection) Rules, 1986' },
    method: `A river's figure is the WORST reading across its stations. Rivers with fewer than `
          + `${MIN_STATIONS} stations in the table are excluded, because one station is a station, not a river.`,
    rivers_ranked: rivers.length,
    stations_used: (xc.crosscheck.stations || []).filter(s => s.bod != null).length,
    rivers,
    /* THE FLAW, ON THE PAGE. */
    the_delhi_hole: {
      headline: 'This ranking cannot see the Yamuna in Delhi.',
      yamuna_rows_in_source: xc.crosscheck.yamuna_rows,
      yamuna_delhi_rows_in_source: xc.crosscheck.yamuna_delhi_rows,
      yamuna_worst_bod_here: yamunaRow?.bod_worst ?? null,
      yamuna_worst_bod_cpcb_delhi: 72.0,
      cpcb_source: 'CPCB, water quality data of river Yamuna 2025, station 1812 — Okhla after the Shahdara drain',
      reading: 'The compiled table carries no Delhi Yamuna station, so the Yamuna\'s row below is '
             + 'computed without the stretch this page is about. CPCB\'s own Yamuna table puts the '
             + 'worst Delhi BOD at 72 mg/L. The ranking therefore understates this river, and the '
             + 'two numbers are shown together rather than one being swapped for the other — a '
             + 'ranking whose rows come from two different tables is not a ranking.',
    },
    the_station_count_caveat: 'Each figure is a maximum, so a river with more stations has more '
      + 'chances to record a bad one. The station count is printed on every row. A river measured '
      + 'more is not a river polluted more.',
  },

  health: {
    role: 'CPCB measures the water. Nobody in that chain counts a person. This is that layer.',
    indicators: health,
    wash_deaths: washDeaths,
    what_it_is_not: [
      'It is not attributable to any one river. It is a national figure for unsafe water, '
        + 'sanitation and hygiene together, and no published figure isolates the Yamuna.',
      'It is a modelled attribution, not a count of death certificates. WHO estimates what share '
        + 'of deaths from diarrhoea, respiratory infection, malnutrition and other causes is '
        + 'attributable to WASH exposure.',
      'The rate is from 2019 and is the most recent WHO published. It is not this year\'s figure.',
    ],
    kind: 'modelled',
  },

  holes: [
    'There is no published figure for illness or death caused by any single Indian river.',
    'India\'s own waterborne-disease surveillance (IDSP outbreak reporting) publishes outbreak '
      + 'counts rather than a national burden, and was not obtained for this build.',
    'CPCB\'s Polluted River Stretches report assigns priority classes to stretches and would be a '
      + 'better ranking than a maximum-of-stations. It is a PDF and was not parsed for this build.',
  ],
  caveats: [
    'A ranking of maxima is not a ranking of how polluted a river is overall.',
    'The health figures are modelled attributions and are marked as modelled.',
    'A rate and a total are different claims. The total states its own multiplication.',
    'A failed indicator is recorded as null for that indicator alone, never as zero.',
  ],
  fetched: { epochMs: Date.now() },
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');

console.log(`\n${rivers.length} rivers with ${MIN_STATIONS}+ stations, from ${out.ranking.stations_used} stations`);
console.log('worst ten by measured BOD:');
for (const r of rivers.slice(0, 10)) {
  console.log(`  ${r.river.padEnd(16)} BOD ${String(r.bod_worst).padStart(5)} (${String(r.bod_times_limit).padStart(5)}x limit)  ` +
    `bacteria ${String(r.fc_worst == null ? '—' : r.fc_worst.toLocaleString('en-IN')).padStart(12)}  ${r.stations} stations`);
}
if (yamunaRow) console.log(`\nYamuna in this table: BOD ${yamunaRow.bod_worst} — but CPCB's Delhi stretch reads 72. The table cannot see Delhi.`);
if (washDeaths) console.log(`\nWASH deaths ${washDeaths.year}: ${washDeaths.deaths.toLocaleString('en-IN')} (${washDeaths.sum})`);
console.log(`wrote ${OUT}`);
