#!/usr/bin/env node
/**
 * digest-send.mjs — the monthly digest. The job that keeps the OTHER promise.
 *
 *   DATABASE_URL=... RESEND_API_KEY=... node scripts/digest-send.mjs [--dry-run]
 *   node scripts/digest-send.mjs --dry-run --month 2026-09      # compose only
 *
 * ★ WHY THIS FILE EXISTS. Audited 14 September 2026. The subscribe band was on
 * eleven pages, promising in the reader's own words:
 *
 *     "Once a month, what these numbers did. One email. What the six readings
 *      did that month, what moved and what did not, and what we did about it."
 *
 * Behind it: a table, a double opt-in, a token unsubscribe, a `last_digest_month`
 * column built expressly to make "one a month" enforceable — and NO COMPOSER AND
 * NO SEND JOB. lib/newsletter.ts had subscribe, confirm, unsubscribe and send;
 * nothing ever assembled a digest and no workflow ever ran one. Not one had been
 * sent. db/002's own retention note said to run its sweep "alongside the send
 * job", which is a comment addressed to a file that did not exist.
 *
 * The route file argues that a subscribe box accepting an address it cannot
 * store is "the single most dishonest thing this site could ship". A subscribe
 * box that stores the address, confirms it, and then never writes is the second.
 *
 * ★ THE HUMAN PARAGRAPH IS REQUIRED, AND THAT IS THE DESIGN.
 * The promise has three clauses and only two of them can be computed. "What the
 * six readings did" and "what moved" come out of data this repository already
 * holds. "What we did about it" is a claim about Swechha that no dataset
 * contains, and a digest that quietly dropped it would be keeping two-thirds of
 * a promise while appearing to keep all of it.
 *
 * So a month needs data/digest/<YYYY-MM>.json, carrying that paragraph and a
 * named approver — the same gate data/journal and data/climate-events already
 * run on. With no approved note the job composes nothing, sends nothing and
 * EXITS 75, naming the file to write. A missing note is not an error; it is a
 * month nobody wrote, and the honest response is silence rather than an email
 * with a hole in it.
 *
 * ★ IT REFUSES TO INVENT A READING. Every figure is read from the dataset that
 * publishes it and then CROSS-CHECKED against the built situation page that
 * shows it — the same guard build-hero.mjs runs, for the same reason. A digest
 * quoting a number the page beside it contradicts is worse than no digest, and
 * unlike the homepage, nobody would ever see it to notice.
 *
 * ★ RE-RUNNING IS SAFE. `last_digest_month` is stamped per row as each send
 * succeeds, and rows already stamped with the month being sent are skipped. A
 * run that dies halfway resumes; a run fired twice sends once.
 *
 * ★ RETENTION IS NOT DONE HERE. scripts/ward-alerts.mjs already prunes BOTH
 * subscription tables hourly (scripts/lib/retention.mjs). A second sweep on a
 * monthly job would be a second place to keep that rule correct.
 */
import { neon } from '@neondatabase/serverless';
import { randomBytes, createHash } from 'node:crypto';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readHistory } from './lib/air-history.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const V3 = join(ROOT, 'public/_pages/v3');
const J = (f) => JSON.parse(readFileSync(join(ROOT, 'data', f), 'utf8'));

const DRY = process.argv.includes('--dry-run');
const monthArg = (() => {
  const i = process.argv.indexOf('--month');
  return i > -1 ? process.argv[i + 1] : null;
})();

const DB = process.env.DATABASE_URL;
const RESEND = process.env.RESEND_API_KEY;
const FROM = process.env.DIGEST_MAIL_FROM || 'Swechha <hello@swechha.in>';
const SITE = (process.env.SITE_ORIGIN || 'https://swechha.in').replace(/\/+$/, '');

/* A dry run needs neither the database nor the mailer: it composes and prints.
   That is what makes this script reviewable by a person who has no secrets. */
const miss = DRY ? [] : [['DATABASE_URL', DB], ['RESEND_API_KEY', RESEND]]
  .filter(([, v]) => !v).map(([k]) => k);
if (miss.length) {
  console.error(`missing: ${miss.join(', ')}. Refusing to run.`);
  process.exit(1);
}

/* ── THE MONTH ──────────────────────────────────────────────────────────
   The PREVIOUS complete month, in IST. A digest sent on the 1st is about the
   month that just ended; computing it from the runner's UTC clock would put
   the first five and a half hours of every Indian day in the wrong month, which
   is the same class of bug data/air-history keys around. */
const MON = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

function previousMonthIST(now = new Date()) {
  const ist = new Date(now.getTime() + 330 * 60 * 1000);
  const y = ist.getUTCFullYear();
  const m = ist.getUTCMonth();          // 0-based, the CURRENT month
  const d = new Date(Date.UTC(y, m - 1, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

const MONTH = monthArg || previousMonthIST();
if (!/^\d{4}-\d{2}$/.test(MONTH)) {
  console.error(`--month must be YYYY-MM, got "${MONTH}".`);
  process.exit(1);
}
const [MY, MM] = MONTH.split('-').map(Number);
const MONTH_NAME = `${MON[MM - 1]} ${MY}`;

/* ── THE NOTE, AND THE GATE ─────────────────────────────────────────────── */
const NOTE_PATH = join(ROOT, 'data/digest', `${MONTH}.json`);
if (!existsSync(NOTE_PATH)) {
  console.log(`No note for ${MONTH_NAME}.`);
  console.log(`  Expected: data/digest/${MONTH}.json`);
  console.log('  Nothing composed, nothing sent, nothing written. The digest promises');
  console.log('  "what we did about it", and no dataset on this site contains that.');
  console.log('  See data/digest/README.md for the shape and the gate.');
  process.exit(75);
}
const NOTE = JSON.parse(readFileSync(NOTE_PATH, 'utf8'));

/* ★ THE GATE IS ON SENDING, NOT ON COMPOSING, AND THE DIFFERENCE IS THE WHOLE
   POINT OF THE DRY RUN. The first version of this refused both, which made the
   preview useless for its actual job: you approve a note BECAUSE you have read
   what the composer does with it, so a reviewer who cannot compose a draft has
   to approve it blind. A dry run therefore builds a draft and prints it under a
   banner saying it would not be sent. Nothing leaves the machine either way. */
const APPROVED = NOTE.publish_state === 'published' && Boolean(NOTE.approved_by);
if (!APPROVED && !DRY) {
  console.log(`The note for ${MONTH_NAME} is not approved for sending.`);
  console.log(`  publish_state: ${JSON.stringify(NOTE.publish_state)}  approved_by: ${JSON.stringify(NOTE.approved_by)}`);
  console.log('  Both are required, exactly as they are for a Journal article.');
  console.log(`  Read it first:  npm run digest:dry -- --month ${MONTH}`);
  process.exit(75);
}
for (const k of ['opening', 'did']) {
  if (!NOTE[k] || (Array.isArray(NOTE[k]) ? !NOTE[k].length : !String(NOTE[k]).trim())) {
    console.error(`The note names no ${k}. That is the half of the promise a dataset cannot write.`);
    process.exit(1);
  }
}

/* ── THE SIX READINGS ───────────────────────────────────────────────────
   MIRRORS scripts/build-intelligence.mjs's SITUATIONS, and is checked against
   the built pages below rather than trusted. Each entry names where its figure
   comes from, what the figure means, and the page a reader should open.

   IT IS A SECOND COPY AND THE CROSS-CHECK IS WHY THAT IS ACCEPTABLE. The
   alternative — importing the generator — would run six page builds to send an
   email. The alternative to the cross-check is drift nobody can see. */
const AIR = J('air-delhi.json');
const YAM = J('yamuna-cpcb-2025.json');
const HEAT = J('heat-india.json');
const ISFR = J('forest-isfr-2023.json');
const GFW = J('gfw-india.json');

const n0 = (v) => Number(v).toLocaleString('en-IN');

const READINGS = [
  {
    id: 'air', name: 'Delhi air', route: '/now/air',
    value: n0(AIR.city_reading.aqi), unit: 'AQI',
    says: `${AIR.city_reading.band}, against a 24-hour limit of ${AIR.aqiLimit}.`,
    page: 'situation-air.html', find: () => String(AIR.city_reading.aqi),
  },
  {
    id: 'yamuna', name: 'The Yamuna at Nizamuddin', route: '/now/yamuna',
    value: Number(YAM.reporting_floor.do).toFixed(1), unit: 'mg/L dissolved oxygen',
    says: `The legal minimum is ${YAM.limits.do.label}. This is at or below the detection limit.`,
    page: 'situation-yamuna.html', find: () => Number(YAM.reporting_floor.do).toFixed(1),
  },
  {
    id: 'heat', name: 'Heat', route: '/now/heat',
    value: Number(HEAT.national.hottest_on_record.tmax).toFixed(1), unit: '°C',
    says: `${HEAT.national.hottest_on_record.name}, ${HEAT.national.hottest_on_record.year} — the record in this archive.`,
    page: 'situation-heatwave.html',
    find: () => Number(HEAT.national.hottest_on_record.tmax).toFixed(1),
  },
  {
    id: 'fire', name: 'Forest fire', route: '/now/forest-fire',
    value: n0(Math.round(ISFR.fire.burnt_area.total)), unit: 'km² burnt in one season',
    says: `${ISFR.fire.burnt_area.season}. No statute publishes a limit for this one.`,
    page: 'situation-forest-fire.html',
    find: () => n0(Math.round(ISFR.fire.burnt_area.total)),
  },
  {
    id: 'loss', name: 'Forest loss', route: '/now/forest-loss',
    value: String(GFW.total.loss_mha), unit: 'million hectares of tree cover',
    says: `${GFW.total.from}–${GFW.total.to}, satellite-measured.`,
    page: 'situation-forest-loss.html', find: () => String(GFW.total.loss_mha),
  },
  {
    id: 'climate', name: 'Climate events', route: '/now/climate-event',
    value: null, unit: null,
    says: 'One page per published event, with what is known and what is not.',
    page: 'situation-climate-event.html', find: null,
  },
];

/* ── THE CROSS-CHECK. Refuse to mail a figure its own page does not show. ── */
function crossCheck() {
  const problems = [];
  for (const r of READINGS) {
    if (!r.find) continue;
    const p = join(V3, r.page);
    if (!existsSync(p)) { problems.push(`${r.id}: ${r.page} is not built`); continue; }
    const needle = r.find();
    if (!readFileSync(p, 'utf8').includes(needle)) {
      problems.push(`${r.id}: the digest would say ${needle}, and ${r.page} does not contain it — `
        + 'one of the two is stale. Rebuild the situation pages, then re-run.');
    }
  }
  return problems;
}

/* ── THE AIR MONTH. The one reading that actually moves month to month, read
      out of the record rather than recomputed: these are the same observations
      /record/air/<YYYY>/<MM> renders. A day with no reading is absent, never a
      zero — so "days observed" is stated beside "days over", because a low
      count of breaches on a month with six days of data is not good news. ── */
function airMonth() {
  const all = readHistory({ dir: join(ROOT, 'data/air-history'), scope: 'delhi' });
  const days = new Map();
  for (const e of all) {
    const m = /^(\d{2})-(\d{2})-(\d{4})/.exec(e.obs || '');
    if (!m) continue;
    const [, dd, mm, yyyy] = m;
    if (Number(yyyy) !== MY || Number(mm) !== MM) continue;
    const aqi = e.city?.aqi;
    if (typeof aqi !== 'number') continue;
    const key = dd;
    const cur = days.get(key);
    if (!cur || aqi > cur.aqi) days.set(key, { aqi, band: e.city.band, station: e.city.station });
  }
  if (!days.size) return null;
  const peaks = [...days.values()];
  const limit = AIR.aqiLimit;
  const over = peaks.filter((p) => p.aqi > limit).length;
  const worst = peaks.reduce((a, b) => (b.aqi > a.aqi ? b : a));
  return { observed: days.size, over, limit, worst };
}

/* ── WHAT WAS PUBLISHED IN THE MONTH ────────────────────────────────────
   Derived from the same files the pages are, so the digest cannot advertise an
   article that is not on the site: both sets carry the approval gate. */
function publishedIn(dir, mapper) {
  const d = join(ROOT, dir);
  if (!existsSync(d)) return [];
  return readdirSync(d).filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(readFileSync(join(d, f), 'utf8')))
    .filter((a) => a.publish_state === 'published' && a.approved_by)
    .filter((a) => String(a.date || '').startsWith(MONTH))
    .map(mapper);
}

const plain = (s) => String(s ?? '')
  .replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '')
  .replace(/&mdash;/g, '—').replace(/&ndash;/g, '–').replace(/&rsquo;/g, '’')
  .replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ')
  .replace(/\s+/g, ' ').trim();

const journal = publishedIn('data/journal/articles',
  (a) => ({ title: plain(a.h1), url: `${SITE}/journal/${a.slug}`, note: plain(a.standfirst) }));

/* ── COMPOSE. Plain text, same rule as the ward mail: lighter, likelier to
      reach an inbox, and no template for a tracking pixel to hide in. ─────── */
function compose(unsubToken) {
  const air = airMonth();
  const L = [];

  L.push(`${MONTH_NAME} — what the readings did.`);
  L.push('');
  L.push(...wrap(NOTE.opening));
  L.push('');

  if (air) {
    L.push('DELHI AIR, THIS MONTH');
    L.push(`  ${air.observed} day${air.observed === 1 ? '' : 's'} with a reading. `
      + `${air.over} of them above the limit of ${air.limit}.`);
    L.push(`  Worst day: ${air.worst.aqi}, ${air.worst.band} — ${air.worst.station}.`);
    L.push(`  The month, hour by hour: ${SITE}/record/air/${MY}/${String(MM).padStart(2, '0')}`);
    L.push('');
  }

  L.push('THE SIX, AS THEY STAND');
  for (const r of READINGS) {
    L.push(r.value
      ? `  ${r.name}: ${r.value} ${r.unit}`
      : `  ${r.name}`);
    L.push(`    ${r.says}`);
    L.push(`    ${SITE}${r.route}`);
  }
  L.push('');

  if (journal.length) {
    L.push('PUBLISHED THIS MONTH');
    for (const a of journal) {
      L.push(`  ${a.title}`);
      if (a.note) L.push(...wrap(a.note, '    '));
      L.push(`    ${a.url}`);
    }
    L.push('');
  }

  L.push('WHAT WE DID ABOUT IT');
  for (const line of [].concat(NOTE.did)) L.push(...wrap(line, '  '));
  L.push('');

  L.push('—');
  L.push('Every figure above is published, dated and linked to the document it came');
  L.push(`from: ${SITE}/now`);
  L.push('Take the data and use it — CC BY 4.0, no key, no sign-up:');
  L.push(`${SITE}/use-the-data`);
  L.push('');
  L.push('You get this once a month and nothing else, ever.');
  if (unsubToken) {
    L.push(`Stop these: ${SITE}/api/newsletter/unsubscribe?t=${encodeURIComponent(unsubToken)}`);
  }
  return L.join('\n');
}

/** 72 columns, because a plain-text mail read in a terminal or a narrow phone
    client does not rewrap for you. */
function wrap(text, indent = '') {
  const words = String(text).split(/\s+/).filter(Boolean);
  const out = [];
  let line = indent;
  for (const w of words) {
    if (line.trim() && (line + ' ' + w).length > 72) { out.push(line); line = indent + w; }
    else line = line.trim() ? `${line} ${w}` : indent + w;
  }
  if (line.trim()) out.push(line);
  return out;
}

/* ── RUN ────────────────────────────────────────────────────────────────── */
const problems = crossCheck();
if (problems.length) {
  console.error('REFUSING TO SEND — a figure disagrees with its own page:');
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}
console.log(`cross-check ok — ${READINGS.filter((r) => r.find).length} figures agree with their situation pages`);

const SUBJECT = NOTE.subject || `Swechha — ${MONTH_NAME}`;

if (DRY) {
  console.log(`\n${'='.repeat(72)}`);
  console.log(`Subject: ${SUBJECT}`);
  console.log('='.repeat(72));
  console.log(compose('EXAMPLE-TOKEN'));
  console.log('='.repeat(72));
  if (!APPROVED) {
    console.log(`\n★ THIS NOTE IS NOT APPROVED AND WOULD NOT BE SENT.`);
    console.log(`  data/digest/${MONTH}.json — publish_state: ${JSON.stringify(NOTE.publish_state)}, `
      + `approved_by: ${JSON.stringify(NOTE.approved_by)}`);
    console.log('  Set both to send it. This preview is what you read before you do.');
  }
  console.log('\ndry run — nothing was mailed and nothing was written.');
  process.exit(0);
}

const q = neon(DB);

const subs = await q`
  SELECT id, email FROM newsletter_subscriptions
   WHERE status = 'confirmed'
     AND (last_digest_month IS DISTINCT FROM ${MONTH})`;
console.log(`${subs.length} confirmed subscriber(s) have not had ${MONTH_NAME}`);

let sent = 0, failed = 0;
for (const s of subs) {
  /* A FRESH UNSUBSCRIBE TOKEN PER MESSAGE, for the reason ward-alerts states:
     only the hash is ever stored, so the token is unrecoverable by design and
     has to be minted at send time. The newest message always carries a live
     link. */
  const token = randomBytes(32).toString('base64url');
  const hash = createHash('sha256').update(token).digest('hex');
  await q`UPDATE newsletter_subscriptions SET unsub_token_hash = ${hash} WHERE id = ${s.id}`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to: s.email, subject: SUBJECT, text: compose(token) }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`Resend HTTP ${res.status}: ${(await res.text()).slice(0, 160)}`);
    /* STAMPED ONLY AFTER THE SEND SUCCEEDS. A row stamped before would be a
       subscriber silently skipped for the month if the send then failed. */
    await q`UPDATE newsletter_subscriptions
       SET last_digest_month = ${MONTH}, last_digest_at = now() WHERE id = ${s.id}`;
    sent++;
  } catch (e) {
    // ONE BAD ADDRESS MUST NOT STOP THE QUEUE. Unstamped, so the next run retries.
    failed++;
    console.error(`  send failed for subscription ${s.id}: ${e.message}`);
  }
}

console.log(`sent ${sent}, failed ${failed} — ${MONTH_NAME}`);
if (failed) process.exit(1);
