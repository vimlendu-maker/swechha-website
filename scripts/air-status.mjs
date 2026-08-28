#!/usr/bin/env node
/**
 * air-status.mjs — "is the AQI pipeline actually working, right now?"
 *
 *   npm run air:status
 *
 * WHY THIS EXISTS. Every check this repo had watched a MECHANISM — the
 * workflow went green, the tests passed, the deploy succeeded — and the
 * mechanism lies in both directions. On 27 August 2026 every GitHub check was
 * green while the site was frozen, because the failure was in Vercel. On
 * 28 August the workflow went red on every run that SUCCEEDED, because the
 * failure was in a build gate. In both cases a human noticed, days later.
 *
 * So this asks the only question that matters, of the OUTCOME:
 *   is swechha.in showing a reading that is as fresh as CPCB allows,
 *   and are its two clocks telling the truth?
 *
 * It reads the LIVE SITE, not the repo — the repo being correct is exactly
 * what every previous green check already proved while the site was stale.
 *
 * Exit codes so it can be wired into anything:
 *   0  OK          1  STALE / BROKEN          2  could not determine
 */
import { execFileSync } from 'node:child_process';

const SITE = process.env.AIR_STATUS_ORIGIN || 'https://swechha.in';
const IST = 19800000;

/* Thresholds, each with a reason rather than a round number.
   OBS_STALE_H matches scripts/fetch-air.mjs's own STALE_HOURS: the feed claims
   hourly and three hours is already generous to it.
   CHECK_STALE_M is twice the 15-minute poll plus slack — if the heartbeat has
   missed two consecutive slots, something is wrong with the trigger.
   RUN_GAP_M is the same idea measured from the other end, at GitHub. */
const OBS_STALE_H = 3;
const CHECK_STALE_M = 45;
const RUN_GAP_M = 60;

const ist = (ms) => {
  const d = new Date(ms + IST);
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')} IST`;
};
const ago = (ms) => {
  const m = Math.round((Date.now() - ms) / 60000);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ${m % 60}m ago`;
};
/** CPCB's "HH:MM IST, D Month YYYY" -> epoch. Field-wise; never Date.parse. */
const MON = ['January','February','March','April','May','June','July','August',
  'September','October','November','December'];
function istLabelToMs(label) {
  const m = /^(\d{2}):(\d{2}) IST, (\d{1,2}) ([A-Za-z]+) (\d{4})$/.exec(String(label ?? '').trim());
  if (!m) return null;
  const mo = MON.indexOf(m[4]);
  if (mo < 0) return null;
  return Date.UTC(+m[5], mo, +m[3], +m[1], +m[2]) - IST;
}

const problems = [];
const notes = [];
const fail = (m) => { console.error(`\nCANNOT DETERMINE: ${m}`); process.exit(2); };

async function getJSON(url) {
  const r = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(30000) });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

/* ── 1. WHAT THE VISITOR ACTUALLY SEES ────────────────────────────────────
   Parsed out of the shipped HTML, because that is the artefact a reader gets.
   Not the JSON, not the repo. */
let page;
try {
  const html = await (await fetch(`${SITE}/now/air`, { cache: 'no-store', signal: AbortSignal.timeout(30000) })).text();
  page = {
    aqi: (/data-committed="(\d+)"/.exec(html) || [])[1] ?? null,
    observed: (/Observed (\d{2}:\d{2} IST, \d{1,2} [A-Za-z]+ \d{4})/.exec(html) || [])[1] ?? null,
    checked: (/last checked by Swechha (\d{2}:\d{2}) IST/.exec(html) || [])[1] ?? null,
  };
} catch (e) {
  fail(`could not read ${SITE}/now/air — ${e.message}`);
}
if (!page.aqi || !page.observed) fail('the live page did not carry a reading and an observation stamp.');

/* ── 2. WHAT CPCB HAS RIGHT NOW ───────────────────────────────────────────
   /api/air fetches CPCB per request, so this is the honest "what could the
   site be showing" — from the same egress the pipeline has. */
let api = null;
try { api = await getJSON(`${SITE}/api/air`); }
catch (e) { notes.push(`/api/air did not answer (${e.message}) — the freshness comparison below is missing.`); }

/* ── 3. IS THE PIPELINE EVEN RUNNING? ─────────────────────────────────────
   The trigger has been the failure twice. gh is optional: without it the
   outcome checks above still stand on their own. */
let runs = null;
try {
  const out = execFileSync('gh', ['run', 'list', '--workflow=air-hourly.yml', '--limit', '10',
    '--json', 'createdAt,conclusion'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  runs = JSON.parse(out).map((r) => ({ at: Date.parse(r.createdAt), ok: r.conclusion === 'success' }));
} catch { notes.push('gh CLI unavailable — could not check whether the workflow is running.'); }

/* ── REPORT ───────────────────────────────────────────────────────────── */
const obsMs = istLabelToMs(page.observed);
const obsAgeH = obsMs === null ? null : (Date.now() - obsMs) / 3600000;

console.log(`\nSWECHHA AIR — PIPELINE STATUS            ${ist(Date.now())}, ${SITE}\n`);

console.log('  WHAT THE SITE SHOWS');
console.log(`    reading           ${page.aqi}`);
console.log(`    observed          ${page.observed}${obsMs !== null ? `   (${ago(obsMs)})` : ''}`);
console.log(`    last checked      ${page.checked ? page.checked + ' IST' : '— not printed —'}`);

if (obsAgeH !== null && obsAgeH > OBS_STALE_H) {
  problems.push(`The observation on the page is ${obsAgeH.toFixed(1)}h old (over ${OBS_STALE_H}h). `
    + 'The pipeline is not publishing.');
}

if (api?.ok) {
  const apiObsMs = istLabelToMs(api.reading?.observed);
  const chkMs = Date.parse(api.time?.swechha_checked_utc ?? '');
  console.log('\n  WHAT CPCB HAS, ASKED JUST NOW');
  console.log(`    observed          ${api.reading?.observed}${apiObsMs !== null ? `   (${ago(apiObsMs)})` : ''}`);
  console.log(`    reading           ${api.reading?.aqi}`);
  console.log(`    served by         ${api.source?.served_by}`);
  if (api.source?.ladder?.length) {
    console.log(`    fresher rungs     ${api.source.ladder.join(' | ')}`);
  }
  /* ★ THE COMPARISON THAT MATTERS. Not "did the job run" but "is the site
     showing what the pipeline could actually have got". A gap here is the
     pipeline being behind its own sources — the real symptom, whatever the
     cause turns out to be. */
  if (apiObsMs !== null && obsMs !== null && apiObsMs > obsMs) {
    const behindH = (apiObsMs - obsMs) / 3600000;
    (behindH >= 2 ? problems : notes).push(
      `The site shows ${page.observed} while CPCB is serving ${api.reading.observed} `
      + `— ${behindH.toFixed(1)}h behind what the pipeline could have fetched.`);
  }
  if (Number.isFinite(chkMs)) {
    const chkAgeM = (Date.now() - chkMs) / 60000;
    if (chkAgeM > CHECK_STALE_M) {
      problems.push(`The route last checked CPCB ${Math.round(chkAgeM)}m ago (over ${CHECK_STALE_M}m).`);
    }
  }
} else if (api) {
  problems.push(`/api/air answered ok:false — ${api.reason ?? 'no reason given'}.`);
}

if (runs?.length) {
  const last = runs[0];
  const gapM = Math.round((Date.now() - last.at) / 60000);
  const recent = runs.filter((r) => Date.now() - r.at < 3600000);
  console.log('\n  THE PIPELINE');
  console.log(`    last run          ${ist(last.at)}   ${last.ok ? 'success' : 'FAILED'}   (${ago(last.at)})`);
  console.log(`    runs in last hour ${recent.length}`);
  if (gapM > RUN_GAP_M) {
    problems.push(`No workflow run for ${gapM}m (over ${RUN_GAP_M}m) — the heartbeat is probably down. `
      + 'Check the cron-job.org job and the GitHub token expiry.');
  }
  const failed = recent.filter((r) => !r.ok).length;
  if (failed) notes.push(`${failed} of the last ${recent.length} runs this hour FAILED.`);
}

if (notes.length) {
  console.log('\n  NOTES');
  for (const n of notes) console.log(`    · ${n}`);
}

console.log('');
if (problems.length) {
  console.log('  VERDICT   NOT HEALTHY\n');
  for (const p of problems) console.log(`    ✗ ${p}`);
  console.log('\n  Runbook: docs/AIR-HEARTBEAT-RUNBOOK.md\n');
  process.exit(1);
}
console.log('  VERDICT   OK — the site is showing CPCB\'s freshest reachable observation,');
console.log('            and both clocks are moving.\n');
