#!/usr/bin/env node
/**
 * watch-documents.mjs — one job that proves every hand-transcribed figure on
 * the site still matches the document it was read from.
 *
 *   node scripts/watch-documents.mjs            # check, report, write the log
 *   node scripts/watch-documents.mjs --strict   # exit 1 if anything changed
 *
 * WHY THIS EXISTS. Four of the five new situation pages rest on figures that
 * were read off a PDF or a parliamentary reply by hand, because the sources
 * have no API: CPCB's annual Yamuna table, FSI's biennial forest report,
 * NCRB's annual accidental-deaths table, and a Lok Sabha written answer. The
 * apportionment split on the Air page was the first of these and D-22.1 set
 * the pattern.
 *
 * Hand transcription is not the weak link people assume. For a limit it is the
 * ONLY correct form — a limit is not a measurement — and for an annual
 * publication a human reading a table once a year is more reliable than a
 * parser pointed at a layout that changes annually. AD-16 §5.1 records what
 * happens otherwise: CPCB republishes the same measurements in a different
 * column order every year, and a parser written for 2025 silently reads BOD
 * out of the pH column for 2023.
 *
 * What hand transcription genuinely lacks is a CHANGE SIGNAL. A feed announces
 * itself when it moves; a PDF does not. So every committed source records the
 * SHA-256 of the document it came from, and this job re-downloads each one and
 * compares. It NEVER rewrites a figure. It raises a hand.
 *
 *   unchanged  -> the figures on the site are still the figures in the source
 *   CHANGED    -> a human re-reads the tables, by eye, and updates the JSON
 *   failed     -> recorded as a failure, which is NOT the same as unchanged
 *                 and is NOT the same as changed
 *
 * That last distinction is the D-16.4 guard in its document form. A network
 * error must never be able to read as "verified".
 *
 * ★ AND IT DOES A SECOND JOB, WHICH IS THE ONE THAT ACTUALLY BIT.
 * Hashing proves the edition we HAVE has not changed. It says nothing about
 * whether a NEWER edition exists — and for an annual publication that is the
 * failure that matters. This build transcribed NCRB's 2023 report, hashed it,
 * saw "unchanged", and was briefly publishing a year-old death toll while the
 * 2024 edition sat at a predictable URL. The 2024 figures turned out to be
 * dramatically different: heat deaths 804 -> 1,832, a 128 per cent rise.
 *
 * So every annual or biennial source also declares how to construct the URL of
 * its NEXT edition, and this job probes for it. "Unchanged and current" and
 * "unchanged but superseded" are different states and the page's freshness
 * depends on the difference.
 *
 * Run it from CI on a schedule and it becomes the audit trail for every
 * sourced constant on the site.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
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


const OUT = resolve('data/document-watch.json');
const STRICT = process.argv.includes('--strict');
/* TWO USER AGENTS, AND THE REASON IS NOT CLOAKING.
   The polite thing is to identify as a bot, so that is what is sent first.
   But jalshakti-dowr.gov.in answers an identified bot with HTTP 403 while
   serving the identical public PDF to a browser, and cpcb.gov.in intermittently
   drops the connection. A 403 caused by a UA string would be recorded as
   "failed" and would then be indistinguishable from a document that had really
   gone — which is the exact confusion this whole job exists to prevent. So a
   403 or 406 is retried once with a browser UA, and which agent succeeded is
   RECORDED in the output rather than hidden. Nothing is bypassed: these are
   public documents linked from public landing pages, fetched at one request
   each, a few times a year. */
const UA = 'SwechhaBot/1.0 (https://swechha.in; vimlendu@swechha.in)';
const UA_FALLBACK = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36';

/** Fetch, retrying once with a browser UA on a UA-shaped refusal. */
async function politeFetch(url, init = {}) {
  let res = null, err = null, agent = 'bot';
  try { res = await fetch(url, { ...init, headers: { ...(init.headers || {}), 'User-Agent': UA } }); }
  catch (e) { err = e; }
  const uaRefusal = res && (res.status === 403 || res.status === 406);
  if (err || uaRefusal) {
    agent = 'browser';
    try { res = await fetch(url, { ...init, headers: { ...(init.headers || {}), 'User-Agent': UA_FALLBACK } }); err = null; }
    catch (e) { err = e; }
  }
  if (err) throw err;
  return { res, agent };
}

/* Each entry names the committed file and the dotted path inside it that holds
   the source block. The source block must carry `url` and `sha256`. Adding a
   new transcribed source means adding one row here — nothing else. */
const WATCHED = [
  { file: 'data/yamuna-cpcb-2025.json',  at: 'source', label: 'CPCB NWMP Yamuna table 2025', situation: 'yamuna',
    // Hashing proves the edition we HAVE has not changed. It says nothing about
    // whether a NEWER edition exists — see `nextEdition` below.
    nextEdition: (y) => `https://cpcb.gov.in/wqm/${y}/WQuality_River-Data-${y}.pdf`, edition: 2025, every: 1 },
  { file: 'data/forest-isfr-2023.json',  at: 'source', label: 'FSI India State of Forest Report 2023', situation: 'forest-loss, forest-fire',
    nextEdition: (y) => `http://fsi.nic.in/uploads/isfr${y}/isfr_book_eng-vol-1_${y}.pdf`, edition: 2023, every: 2 },
  { file: 'data/deaths-ncrb-2024.json',  at: 'source', label: 'NCRB Accidental Deaths & Suicides 2024', situation: 'heatwave, climate-event, forest-fire',
    nextEdition: (y) => `https://www.ncrb.gov.in/uploads/files/1ADSIPublication-${y}.pdf`, edition: 2024, every: 1 },
  { file: 'data/groundwater-india-2025.json', at: 'source', label: 'CGWB Dynamic Ground Water Resources 2025', situation: 'yamuna',
    edition: 2025, every: 1 },
];

/* A source with no hash cannot be watched, and pretending otherwise is worse
   than admitting it. The Lok Sabha reply is an HTML page whose markup changes
   without the figures changing, so hashing it would cry wolf every run. It is
   listed as UNWATCHABLE, with the reason, rather than quietly omitted. */
const UNWATCHABLE = [
  {
    file: 'data/yamuna-parliament-2025.json', at: 'source',
    label: 'Lok Sabha Unstarred Question 1949, 31 July 2025',
    situation: 'yamuna',
    reason: 'An HTML page, not a fixed document. Its markup, visitor counter and navigation change '
          + 'between requests while the figures do not, so a hash would report a change on almost '
          + 'every run and the signal would be worthless. A parliamentary answer is also immutable '
          + 'once given — the risk this job guards against does not really apply to it.',
  },
];

const get = (obj, path) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);

async function check(entry) {
  const p = resolve(entry.file);
  if (!existsSync(p)) return { ...entry, status: 'missing-file', error: `${entry.file} does not exist` };
  let src;
  try { src = get(JSON.parse(readFileSync(p, 'utf8')), entry.at); }
  catch (e) { return { ...entry, status: 'unreadable', error: e.message }; }
  if (!src?.url || !src?.sha256) {
    return { ...entry, status: 'no-hash', error: `${entry.file}#${entry.at} has no url/sha256 to check` };
  }

  let buf, agent;
  try {
    const r = await politeFetch(src.url);
    if (!r.res.ok) return { ...entry, status: 'failed', url: src.url, error: `HTTP ${r.res.status}`, agent: r.agent };
    buf = Buffer.from(await r.res.arrayBuffer());
    agent = r.agent;
  } catch (e) {
    return { ...entry, status: 'failed', url: src.url, error: `network: ${e.message}` };
  }
  // Validate the SHAPE. A portal error page is also HTTP 200, and hashing one
  // would report a "change" that is really an outage.
  if (!looksLikePdf(buf, 100000)) {
    return { ...entry, status: 'failed', url: src.url, error: `response is not a PDF (${buf.length} bytes)` };
  }
  const got = createHash('sha256').update(buf).digest('hex');
  return {
    ...entry, url: src.url,
    agent,
    status: got === src.sha256 ? 'unchanged' : 'CHANGED',
    expected: { sha256: src.sha256, bytes: src.bytes ?? null },
    actual: { sha256: got, bytes: buf.length },
  };
}

/* ── IS THERE A NEWER EDITION? ────────────────────────────────────────────
   Probes the next one or two editions by constructing their URL from the
   source's own naming pattern. A HEAD request is enough — we only need to know
   whether it exists, not to read it. Validated on content-type and size as
   well as status, because these portals answer an unknown path with a 200 HTML
   page as often as with a 404. */
async function probeNewer(e) {
  if (!e.nextEdition || !e.edition) return { probed: false };
  const tried = [];
  for (let n = 1; n <= 2; n++) {
    const year = e.edition + n * (e.every || 1);
    const url = e.nextEdition(year);
    let found = false, why = '';
    try {
      const { res } = await politeFetch(url, { method: 'HEAD', redirect: 'follow' });
      const ct = res.headers.get('content-type') || '';
      const len = Number(res.headers.get('content-length') || 0);
      found = res.ok && /pdf/i.test(ct) && len > 100000;
      why = res.ok ? `HTTP ${res.status}, ${ct || 'no content-type'}${len ? `, ${len} bytes` : ''}` : `HTTP ${res.status}`;
    } catch (err) { why = `network: ${err.message}`; }
    tried.push({ year, url, found, why });
    if (found) break;
  }
  const hit = tried.find(t => t.found) || null;
  return { probed: true, newer_exists: !!hit, newer: hit, tried };
}

const results = [];
for (const e of WATCHED) {
  const r = await check(e);
  r.editions = await probeNewer(e);
  results.push(r);
  const tag = { unchanged: 'ok', CHANGED: '*** CHANGED ***' }[r.status] || `FAILED (${r.status})`;
  const ed = r.editions.probed
    ? (r.editions.newer_exists ? `  *** ${r.editions.newer.year} EDITION EXISTS ***` : '  (latest)')
    : '';
  console.log(`${r.status === 'unchanged' && !r.editions.newer_exists ? ' ' : '!'} ${r.label.padEnd(46)} ${tag}${ed}`);
  if (r.editions.newer_exists) {
    console.log(`    ${r.editions.newer.url}`);
    console.log(`    ${r.file} is SUPERSEDED. Transcribe the new edition — the figures may move a long way.`);
  }
  if (r.status === 'CHANGED') {
    console.log(`    expected ${r.expected.sha256}`);
    console.log(`    actual   ${r.actual.sha256}`);
    console.log(`    ${r.file} was NOT modified. Re-read the tables by eye and update it.`);
  } else if (r.status !== 'unchanged') {
    console.log(`    ${r.error}`);
  }
}
for (const u of UNWATCHABLE) console.log(`- ${u.label.padEnd(48)} not watchable by design`);

const changed = results.filter(r => r.status === 'CHANGED');
const failed = results.filter(r => !['unchanged', 'CHANGED'].includes(r.status));
const superseded = results.filter(r => r.editions?.newer_exists);

const out = {
  role: 'proves every hand-transcribed figure still matches its source document',
  rule: 'This job never rewrites a figure. It raises a hand. A failure is recorded as a failure '
      + 'and is never recorded as verified.',
  checked: results.length,
  unchanged: results.length - changed.length - failed.length,
  changed: changed.length,
  failed: failed.length,
  superseded: superseded.length,
  superseded_note: 'A source can be unchanged AND superseded at the same time. That is the state '
    + 'this job was extended to catch: the edition we hold is intact, and a newer one has been published.',
  results,
  unwatchable: UNWATCHABLE,
  fetched: { epochMs: Date.now() },
};
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');

console.log(`\n${out.unchanged} unchanged, ${out.changed} changed, ${out.failed} failed, ${out.superseded} superseded`);
console.log(`wrote ${OUT}`);
if (STRICT && (changed.length || failed.length || superseded.length)) process.exit(1);
