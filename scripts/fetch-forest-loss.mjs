#!/usr/bin/env node
/**
 * fetch-forest-loss.mjs — the forest-loss page's two jobs.
 *
 *   node scripts/fetch-forest-loss.mjs        # keyless
 *
 * THE PAGE IS A DISAGREEMENT, AND THIS JOB'S WHOLE PURPOSE IS TO KEEP BOTH
 * SIDES OF IT ALIVE. From SITUATION-PAGE-TEMPLATE.md §3: "Two sources that
 * disagree get published as two sources. Never averaged."
 *
 *   SOURCE A — India's own assessment. FSI, India State of Forest Report 2023.
 *              Reports forest cover INCREASING: a net +156.41 km2 between the
 *              2021 and 2023 assessments. Committed as
 *              data/forest-isfr-2023.json, quoted with table numbers.
 *
 *   SOURCE B — the international series. FAO's Global Forest Resources
 *              Assessment, republished by the World Bank as AG.LND.FRST.K2,
 *              keyless. Also reports forest area INCREASING, because it is
 *              built from what countries report to FAO — which for India means
 *              FSI. So A and B are not independent, and the page must say so:
 *              two sources agreeing is not corroboration when one is the
 *              other's input.
 *
 *   SOURCE C — the satellite measurement. Hansen/UMD tree-cover loss, served
 *              by Global Forest Watch, which reports MILLIONS of hectares
 *              lost. THIS IS THE ONE THAT DISAGREES, and it is the one behind
 *              an API key this build does not have.
 *
 * SO THE HONEST STATE OF THIS PAGE IS: two sources that agree because they
 * share a source, and the one that would disagree is missing. That is recorded
 * here as a named hole with the exact thing that closes it, rather than papered
 * over by presenting A and B as independent confirmation. Naming the hole is
 * content (template §3).
 *
 * JOB 1 — the World Bank series, fetched.
 * JOB 2 — watch the ISFR PDF's hash, exactly as fetch-yamuna.mjs watches CPCB's.
 * JOB 3 — probe the GFW API and RECORD THE REFUSAL, so the page can state what
 *         is missing with the actual error rather than a description of it.
 *
 * AN ERROR IS NOT A ZERO. A failed World Bank fetch is null, and null renders
 * nothing. "India's forest area is 0" is not a sentence this site will publish.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { createHash } from 'node:crypto';

/** A PDF, tolerantly detected.
    The magic number is not always at offset 0: CGWB's national groundwater
    compilation is served with a LEADING NEWLINE before "%PDF-", and every real
    PDF reader accepts it. A strict `subarray(0,5) === '%PDF-'` check therefore
    reported a perfectly good 10.9 MB document as "response is not a PDF", which
    is exactly the false alarm this validation exists to avoid. So the magic is
    searched for in the first few bytes, and a minimum size still rules out an
    error stub. */
const looksLikePdf = (buf, minBytes = 10000) =>
  buf.length >= minBytes && buf.subarray(0, 1024).includes(Buffer.from('%PDF-'));


const OUT = resolve(process.argv[2] || 'data/forest-loss-india.json');
const ISFR = resolve('data/forest-isfr-2023.json');
const UA = 'SwechhaBot/1.0 (https://swechha.in; vimlendu@swechha.in)';
const isfr = JSON.parse(readFileSync(ISFR, 'utf8'));

/* ── JOB 1 — THE WORLD BANK / FAO SERIES ───────────────────────────────── */
const WB = {
  indicator: 'AG.LND.FRST.K2',
  name: 'Forest area (sq. km)',
  country: 'IND',
  url: 'https://api.worldbank.org/v2/country/IND/indicator/AG.LND.FRST.K2?format=json&per_page=100',
  upstream: 'Food and Agriculture Organization, Global Forest Resources Assessment',
};
async function worldBank() {
  let body;
  try {
    const res = await fetch(WB.url, { headers: { 'User-Agent': UA } });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}`, years: null };
    body = await res.json();
  } catch (e) { return { ok: false, error: `network: ${e.message}`, years: null }; }

  // Validate the SHAPE. The World Bank returns [meta, rows] and an error is
  // a DIFFERENT shape entirely, not a status code.
  if (!Array.isArray(body) || body.length < 2 || !Array.isArray(body[1])) {
    return { ok: false, error: 'unexpected response shape', years: null };
  }
  const years = body[1]
    .filter(r => r && r.value != null)
    .map(r => ({ year: Number(r.date), km2: Number(r.value) }))
    .sort((a, b) => a.year - b.year);
  if (years.length < 10) return { ok: false, error: `only ${years.length} years returned`, years: null };

  const first = years[0], last = years[years.length - 1];
  return {
    ok: true, error: null,
    lastupdated: body[0]?.lastupdated ?? null,
    years,
    first, last,
    change_km2: +(last.km2 - first.km2).toFixed(0),
    change_pct: +((last.km2 - first.km2) / first.km2 * 100).toFixed(1),
    direction: last.km2 > first.km2 ? 'up' : last.km2 < first.km2 ? 'down' : 'flat',
  };
}

/* ── JOB 2 — WATCH THE ISFR DOCUMENT ───────────────────────────────────── */
async function watchIsfr() {
  const { url, sha256, bytes } = isfr.source;
  let buf;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}`, changed: null };
    buf = Buffer.from(await res.arrayBuffer());
  } catch (e) { return { ok: false, error: `network: ${e.message}`, changed: null }; }
  if (!looksLikePdf(buf, 100000)) {
    return { ok: false, error: `response is not a PDF (${buf.length} bytes)`, changed: null };
  }
  const got = createHash('sha256').update(buf).digest('hex');
  return { ok: true, error: null, changed: got !== sha256,
    expected: { sha256, bytes }, actual: { sha256: got, bytes: buf.length } };
}

/* ── JOB 3 — RECORD THE REFUSAL, VERBATIM ──────────────────────────────── */
const GFW = {
  dataset: 'umd_tree_cover_loss',
  api: 'https://data-api.globalforestwatch.org/dataset/umd_tree_cover_loss/latest/query',
  register: 'https://data-api.globalforestwatch.org/#tag/Authentication',
  what_it_would_add: 'Annual tree-cover loss for India from the Hansen/UMD satellite series — '
    + 'the one measurement on this page that is not derived from what the Government of India '
    + 'reports about itself. It is the source that disagrees, so it is the source that matters most.',
};
async function probeGfw() {
  try {
    const res = await fetch(`${GFW.api}?sql=SELECT%20*%20FROM%20data%20LIMIT%201`,
      { headers: { 'User-Agent': UA }, redirect: 'follow' });
    const text = (await res.text()).slice(0, 400);
    let msg = text;
    try { msg = JSON.parse(text).message || text; } catch { /* prose body */ }
    return { reachable: true, status: res.status, authorised: res.ok, message: msg };
  } catch (e) {
    return { reachable: false, status: null, authorised: false, message: `network: ${e.message}` };
  }
}

const [wb, doc, gfw] = [await worldBank(), await watchIsfr(), await probeGfw()];

if (!wb.ok && !doc.ok) {
  console.error('Both data jobs failed. Leaving the previous file alone rather than publishing an absence.');
  process.exit(1);
}

const out = {
  subject: 'Forest loss in India — three sources, and only two of them are available',
  kind: 'counted',
  kind_note: 'Forest cover is measured from satellite imagery classified by canopy density. It is '
           + 'a measurement, not a model — but the CLASS boundaries are a definition, and the '
           + 'definition is where the disagreement lives.',
  state_label: 'PERIODIC',

  /* THE LEGAL INSTRUMENT. There is no permitted quantity of forest loss, so
     the "limit" on this page is a REQUIREMENT rather than a number, and it is
     named as such. Nothing here is a figure, so nothing here needs a feed. */
  limit: {
    exists: true,
    kind: 'a requirement, not a quantity',
    instrument: 'The Forest (Conservation) Act, 1980',
    what_it_requires: 'Forest land may not be used for a non-forest purpose without prior '
      + 'approval of the central government. Approval is normally conditional on compensatory '
      + 'afforestation and payment of the net present value of the land.',
    why_it_is_not_a_number: 'The Act does not cap how much forest may be diverted. It caps who '
      + 'may decide. So this page cannot say "the limit was exceeded" — it can only say how much '
      + 'was approved, and that figure is published by the Ministry rather than by FSI.',
    hole: 'Diversion approvals under the Act are not in ISFR and were not obtained for this '
        + 'build. Until they are, the page states the requirement and not a quantity.',
  },

  sources: {
    a_india: {
      role: 'India\'s own official assessment — the primary source',
      name: isfr.source.name,
      publication: isfr.source.publication,
      url: isfr.source.url,
      cadence: isfr.source.cadence,
      says: 'forest cover increasing',
      net_change_km2: isfr.change_2021_to_2023.net_change_forest_cover,
      forest_cover_km2: isfr.cover.rows.find(r => r.class === 'Forest Cover').area,
      document_watch: doc,
    },
    b_international: {
      role: 'the international series — and NOT an independent check',
      ...WB,
      says: wb.ok ? `forest area ${wb.direction}` : null,
      not_independent: 'The World Bank republishes FAO, and FAO republishes what each country '
        + 'reports. For India that is FSI. So source B agreeing with source A is not '
        + 'corroboration; it is the same measurement travelling.',
      ...wb,
    },
    c_satellite: {
      role: 'the independent measurement — MISSING',
      name: 'Hansen / UMD tree cover loss, via Global Forest Watch',
      says: 'tree cover loss, in millions of hectares since 2000',
      available: false,
      ...GFW,
      probe: gfw,
      how_to_close: 'Create a Global Forest Watch API key and set GFW_API_KEY. One account, free. '
        + 'It was deliberately not created during this build.',
    },
  },

  /* THE DEVICE, stated as arithmetic on published numbers only. */
  the_disagreement: {
    headline: 'India\'s own report says its forest cover grew. The satellite series says India '
            + 'has lost tree cover. Both can be true, and the reason is the definition.',
    why: [
      'Forest cover counts canopy above 10 per cent density on land over one hectare, whatever '
        + 'is growing there. A plantation counts. An orchard can count.',
      'Tree cover loss counts canopy disappearing, whatever it was. A harvested plantation is a loss.',
      'So a natural forest replaced by a plantation of the same canopy density is NO CHANGE to '
        + 'the first measure and a LOSS AND GAIN to the second. Neither number is wrong.',
    ],
    the_number_that_survives_either_definition: {
      claim: 'A national net change of ' + isfr.change_2021_to_2023.net_change_forest_cover
           + ' km2 is smaller than the loss in a single state.',
      net_national_km2: isfr.change_2021_to_2023.net_change_forest_cover,
      largest_state_loss: isfr.change_2021_to_2023.losses[0],
      ratio: +(isfr.change_2021_to_2023.losses[0].km2
             / isfr.change_2021_to_2023.net_change_forest_cover).toFixed(1),
      source: 'both figures are from ISFR 2023, Table 2.2 and the paragraph following it',
      note: 'This is division on two numbers in one table. It needs no second source and it '
          + 'survives any argument about definitions.',
    },
  },

  caveats: [
    'Two sources agreeing is not corroboration when one is the other\'s input.',
    'A net change conceals gross gain and gross loss, and ISFR publishes no national gross figure.',
    'A change of two hundredths of one per cent is inside what a change of mapping method can produce.',
    '"Forest cover" is a canopy measurement, not an ecosystem measurement, and includes plantations.',
    'A failed fetch is recorded as null. It is never recorded as zero forest.',
    'The missing satellite source is named with its actual API response, not described from memory.',
  ],
  fetched: { epochMs: Date.now() },
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');

/* ── REPORT ───────────────────────────────────────────────────────────── */
if (wb.ok) {
  console.log(`World Bank / FAO: ${wb.years.length} years ${wb.first.year}-${wb.last.year}`);
  console.log(`  ${wb.first.km2.toLocaleString('en-IN')} km2 -> ${wb.last.km2.toLocaleString('en-IN')} km2  `
    + `(${wb.change_km2 > 0 ? '+' : ''}${wb.change_km2.toLocaleString('en-IN')} km2, ${wb.change_pct}%, ${wb.direction})`);
  console.log(`  upstream last updated ${wb.lastupdated}`);
} else {
  console.log(`World Bank / FAO: FAILED — ${wb.error} (recorded as null, not zero)`);
}
console.log(doc.ok
  ? (doc.changed
      ? `ISFR watch: *** THE DOCUMENT HAS CHANGED ***\n  expected ${doc.expected.sha256}\n  actual   ${doc.actual.sha256}\n  The committed figures were NOT touched. Re-read the tables.`
      : `ISFR watch: unchanged (${doc.actual.bytes.toLocaleString('en-IN')} bytes)`)
  : `ISFR watch: FAILED — ${doc.error}`);
console.log(`GFW probe: HTTP ${gfw.status} — ${String(gfw.message).slice(0, 90)}`);
const d = out.the_disagreement.the_number_that_survives_either_definition;
console.log(`\nthe finding: national net +${d.net_national_km2} km2, `
  + `${d.largest_state_loss.state} alone -${d.largest_state_loss.km2} km2 — ${d.ratio}x the national net`);
console.log(`wrote ${OUT}`);
