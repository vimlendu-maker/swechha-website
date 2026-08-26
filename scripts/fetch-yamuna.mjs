#!/usr/bin/env node
/**
 * fetch-yamuna.mjs — the Yamuna page's two network jobs.
 *
 *   node scripts/fetch-yamuna.mjs          # no key needed, nothing to configure
 *
 * IT DOES NOT FETCH THE READING. Read that sentence twice, because it is the
 * opposite of fetch-air.mjs and the difference is the whole design.
 *
 * CPCB publishes the Yamuna table as a PDF, ONCE A YEAR. There is no API, and
 * `SITUATION-PAGE-TEMPLATE.md` §5 is explicit: there is no real-time public
 * Yamuna water-quality feed, so D-10.1 forbids `LIVE` here. The table was
 * therefore parsed once, offline, and COMMITTED as
 * `data/yamuna-cpcb-2025.json`, in the same way the apportionment split on the
 * Air page was transcribed by hand rather than fetched.
 *
 * So this job does the two things that are actually automatable:
 *
 *   JOB 1 — WATCH THE DOCUMENT. Re-download the source PDF and check its
 *           SHA-256 against the value recorded inside the committed JSON. If
 *           CPCB republishes, this FAILS LOUDLY and tells a human to re-run
 *           the transcription. It never rewrites the table itself. An annual
 *           publication changing is a human event, not a refresh, and a script
 *           that silently re-parsed a re-laid-out PDF is exactly how a BOD
 *           column becomes a pH column (see AD-16 §5.1).
 *
 *   JOB 2 — THE CROSS-CHECK AND THE GEOGRAPHY. riverwatchindia.com carries a
 *           CPCB-derived station table inline, and it carries the one thing
 *           CPCB's PDF does not: LAT/LON PER STATION. That is what makes the
 *           geography band possible at all.
 *
 * WHY riverwatch IS A CROSS-CHECK AND NEVER THE READING. Measured on
 * 21 August 2026, the site's own headline and share text claim "481 out of
 * 1,553 monitoring stations exceed safe pollution limits" while the table the
 * page actually draws contains ~630 rows. Not one Delhi Yamuna station is in
 * it — no Palla, no Wazirabad, no ITO, no Okhla — so on the stretch this page
 * is about, it has nothing to say. It also carries one row corrupted at
 * source, with two stations merged into a single record.
 *
 * None of that makes it useless. It makes it a SECOND SOURCE, and the rule
 * from the template is that two sources which disagree get published as two
 * sources and are never averaged. So this job records the discrepancy as data
 * — declared count against parsed count — rather than resolving it.
 *
 * AN ERROR IS NOT A ZERO (D-16.4). If the PDF check cannot run, that is
 * recorded as `null` and the page keeps its committed reading. If riverwatch
 * fails, the cross-check block is `null` and the band that draws it renders
 * nothing at all rather than an empty frame. "Zero stations over the limit"
 * manufactured by a failed fetch would be the worst sentence on this page.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { fetchUpstream } from './lib/fetch-cpcb.mjs';

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


const TABLE = resolve('data/yamuna-cpcb-2025.json');
const OUT = resolve(process.argv[2] || 'data/yamuna-crosscheck.json');
const UA = 'Mozilla/5.0 (compatible; SwechhaBot/1.0; +https://swechha.in)';

const committed = JSON.parse(readFileSync(TABLE, 'utf8'));

/* ── JOB 1 — WATCH THE SOURCE DOCUMENT ─────────────────────────────────── */
async function watchDocument() {
  const { url, sha256, bytes } = committed.source;
  let res;
  /* fetch-first, curl-fallback (scripts/lib/fetch-cpcb.mjs) — this URL is a
     cpcb.gov.in PDF, the same class of unreliable Indian-government transport
     as the air sources, and it was the one such fetch in scripts/ still on
     raw fetch() (found by the AD-45 audit). A failure here stays what it
     always was: recorded as `ok: false` in the output, never a job failure. */
  try { res = await fetchUpstream(url, { timeoutMs: 60000, headers: { 'User-Agent': UA } }); }
  catch (e) { return { ok: false, error: `network: ${e.message}`, changed: null }; }
  if (!res.ok) return { ok: false, error: `HTTP ${res.status}`, changed: null };

  const buf = Buffer.from(await res.arrayBuffer());
  // Validate the SHAPE, never the status. A portal error page is also HTTP 200.
  if (!looksLikePdf(buf)) {
    return { ok: false, error: `response is not a PDF (${buf.length} bytes)`, changed: null };
  }
  const got = createHash('sha256').update(buf).digest('hex');
  return {
    ok: true, error: null,
    changed: got !== sha256,
    expected: { sha256, bytes },
    actual: { sha256: got, bytes: buf.length },
  };
}

/* ── JOB 2 — THE CROSS-CHECK TABLE AND THE COORDINATES ─────────────────── */
const RW_URL = 'https://riverwatchindia.com/';

function parseCsv(text) {
  // RFC-4180 enough for this file: quoted fields containing commas exist in it
  // (one station name is a merged pair), so a naive split would shift columns.
  const rows = [];
  for (const line of text.split('\n')) {
    if (!line.trim()) continue;
    const out = []; let cur = '', q = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (q) {
        if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
        else if (c === '"') q = false;
        else cur += c;
      } else if (c === '"') q = true;
      else if (c === ',') { out.push(cur); cur = ''; }
      else cur += c;
    }
    out.push(cur);
    rows.push(out);
  }
  return rows;
}

async function crosscheck() {
  let html;
  try {
    const res = await fetch(RW_URL, { headers: { 'User-Agent': UA } });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    html = await res.text();
  } catch (e) { return { ok: false, error: `network: ${e.message}` }; }

  const m = /const RIVERS_CSV = `([\s\S]*?)`;/.exec(html);
  if (!m) return { ok: false, error: 'RIVERS_CSV block not found — the page was rebuilt' };

  const rows = parseCsv(m[1]);
  const head = rows[0].map(h => h.trim());
  const want = ['code', 'name', 'state', 'bod', 'fc', 'pflag', 'cflag', 'lat', 'lon'];
  if (want.some((w, i) => head[i] !== w)) {
    return { ok: false, error: `unexpected columns: ${head.join(',')}` };
  }

  const num = (v) => { const n = Number(String(v).trim()); return Number.isFinite(n) ? n : null; };
  const stations = rows.slice(1)
    .filter(r => r.length >= 9 && r[0].trim())
    .map(r => ({
      code: r[0].trim(), name: r[1].trim(), state: r[2].trim(),
      bod: num(r[3]), fc: num(r[4]),
      polluted: r[5].trim() === 'POLLUTED',
      contaminated: r[6].trim() === 'CONTAMINATED',
      lat: num(r[7]), lng: num(r[8]),
    }));

  // The site's own declared totals, lifted from its share copy. Recorded as a
  // CLAIM, next to what the table actually contains. The gap is the finding.
  const declared = {
    stations: /1,?553/.test(html) ? 1553 : null,
    exceeding: /\b481\b/.test(html) ? 481 : null,
    source_year: /CPCB[^.]{0,40}2024/.test(html) ? 2024 : null,
  };

  const yamuna = stations.filter(s => /YAMUNA/i.test(s.name));
  const withCoords = stations.filter(s => s.lat !== null && s.lng !== null);
  // Counted against riverwatch's OWN flags, not against a limit we chose.
  const flagged = stations.filter(s => s.polluted || s.contaminated);

  /* A MERGED RECORD, DETECTED NARROWLY AND ON PURPOSE.
     The first version of this check also flagged any name containing "RIVER"
     twice, and it was wrong: a confluence station is legitimately called
     "RIVER GANGA AFTER CONFLUENCE OF RIVER BHAGIRATHI AND RIVER ALAKNANDA".
     That over-count would have put 20 defects on the page where there are 3.
     The one unambiguous signal is a STATE field naming a state more than once
     — a single monitoring station cannot be in two states — so that is the
     only thing counted. Under-claiming beats over-claiming on a page whose
     subject is other people's data quality. */
  const stateRepeat = (v) => {
    const t = String(v).trim().split(/\s+/);
    for (let n = 1; n <= 2 && n * 2 <= t.length; n++) {
      const first = t.slice(0, n).join(' ');
      if (t.slice(n, n * 2).join(' ') === first) return true;
    }
    return false;
  };
  const malformed = stations.filter(s => stateRepeat(s.state));

  return {
    ok: true, error: null,
    parsed: stations.length,
    declared,
    discrepancy: declared.stations && declared.stations !== stations.length
      ? { declared: declared.stations, parsed: stations.length,
          note: 'The site states one total in its headline and share text and publishes a '
              + 'different number of rows. Recorded, not resolved.' }
      : null,
    flagged: flagged.length,
    with_coords: withCoords.length,
    yamuna_rows: yamuna.length,
    // Delhi is the stretch this page is about, so its absence is the point.
    yamuna_delhi_rows: yamuna.filter(s => /DELHI/i.test(s.state) || /DELHI/i.test(s.name)).length,
    malformed: malformed.map(s => ({ code: s.code, name: s.name, state: s.state })),
    yamuna: yamuna,
    stations,
  };
}

const [doc, xc] = [await watchDocument(), await crosscheck()];

if (!doc.ok && !xc.ok) {
  console.error('Both jobs failed. Leaving the previous file alone rather than publishing an absence.');
  process.exit(1);
}

const out = {
  subject: 'Yamuna — source watch and cross-check',
  role: 'CPCB is the reading. riverwatchindia.com is a second source and a coordinate table. '
      + 'Neither is averaged into the other.',
  state_label: 'PERIODIC',
  document_watch: {
    role: 'proves the committed CPCB table still matches the document it was parsed from',
    url: committed.source.url,
    ...doc,
  },
  crosscheck: {
    source: { name: 'RiverWatch India', url: RW_URL,
      note: 'a secondary compiler of CPCB NWMP data, keyless; carries lat/lon, which CPCB\'s PDF does not' },
    ...xc,
  },
  caveats: [
    'CPCB is the primary source for every reading on this page. riverwatch is never the reading.',
    'riverwatch publishes no Delhi Yamuna station, so on this page\'s own stretch it is silent.',
    'Its declared station total and its published row count disagree. Both are recorded.',
    'A failed fetch is recorded as null. It is never recorded as zero stations over the limit.',
    'Coordinates come from the secondary source and are used for placement only, never for a value.',
  ],
  fetched: { epochMs: Date.now() },
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');

if (doc.ok) {
  console.log(doc.changed
    ? `*** CPCB HAS REPUBLISHED THE DOCUMENT ***\n` +
      `    expected sha256 ${doc.expected.sha256} (${doc.expected.bytes} bytes)\n` +
      `    actual   sha256 ${doc.actual.sha256} (${doc.actual.bytes} bytes)\n` +
      `    The committed table was NOT touched. Re-run the transcription, check the\n` +
      `    column layout by eye, and update data/yamuna-cpcb-2025.json.`
    : `document watch: unchanged (sha256 ${doc.actual.sha256.slice(0, 16)}…, ${doc.actual.bytes} bytes)`);
} else {
  console.log(`document watch: FAILED — ${doc.error} (recorded as null; the committed table stands)`);
}
if (xc.ok) {
  console.log(`crosscheck: ${xc.parsed} stations parsed, ${xc.with_coords} with coordinates, ${xc.flagged} flagged by the source itself`);
  if (xc.discrepancy) console.log(`            declares ${xc.discrepancy.declared}, publishes ${xc.discrepancy.parsed} — recorded, not resolved`);
  console.log(`            Yamuna rows ${xc.yamuna_rows}, of them in Delhi: ${xc.yamuna_delhi_rows}`);
  if (xc.malformed.length) console.log(`            ${xc.malformed.length} malformed row(s) at source: ${xc.malformed.map(m => m.code).join(', ')}`);
} else {
  console.log(`crosscheck: FAILED — ${xc.error} (recorded as null, not as zero)`);
}
console.log(`wrote ${OUT}`);
