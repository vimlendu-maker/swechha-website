/* ═══════════════════════════════════════════════════════════════════════════
   RECORD  →  /record, /record/air, /record/air/<YYYY>/<MM>
   ───────────────────────────────────────────────────────────────────────────
   THE ARCHIVE. Not a second copy of /now — the opposite of one.

   /now answers "what is it right now". This answers "what was it, and what did
   the source say about it afterwards". The material is data/air-history/, the
   hourly store AD-46 introduced: one NDJSON line per observation, carrying the
   reading as first seen, every later REVISION CPCB made to it, and the state
   of all forty-odd monitors at that hour.

   ★ THE REVISIONS ARE THE POINT, AND THEY ARE WHY THIS SECTION EXISTS.
   A published reading that is quietly restated later is the commonest way an
   environmental record decays: the number you cited is not the number now at
   that address, and nothing tells you. This store keeps both. So the archive
   can state, per month, how many published readings were later changed and by
   how much — which is a fact about the SOURCE, not about us, and it is not
   published anywhere else.

   ★ ONE PAGE PER MONTH, NOT ONE PER READING.
   Twelve pages a year, each a complete day table. A page per hourly
   observation would be eight thousand thin pages a year, which is the failure
   mode this section was explicitly told to avoid — and none of them would
   carry enough to be worth citing.

   ★ AN EMPTY DAY STAYS EMPTY.
   A day with no observation is printed as having none. It is never a zero, and
   the hours-observed column is on every row so a partial day cannot be read as
   a complete one.
   ═══════════════════════════════════════════════════════════════════════════ */
import { readFileSync, readdirSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import * as S from './lib/situation-shell.mjs';
import { seo } from './lib/seo-register.mjs';
const { esc, opener, ARROW, disclose } = S;

const sh = S.shell();
const HIST = join(S.ROOT, 'data/air-history');

let dataBad = 0;
const dataFail = (m) => { console.error(`DATA IS WRONG: ${m}`); dataBad++; };

/* ═══ READ THE STORE ═════════════════════════════════════════════════════ */
const AIR = JSON.parse(readFileSync(join(S.ROOT, 'data/air-delhi.json'), 'utf8'));
const AQI_LIMIT = AIR.aqiLimit;
const BANDS_REF = AIR.bands;
const bandOf = (aqi) => (BANDS_REF.find((b) => aqi >= b.idx[0] && aqi <= b.idx[1]) || {}).name || '—';

/** `DD-MM-YYYY HH:MM:SS` → { date: 'YYYY-MM-DD', hour: 'HH:MM' }. */
function stamp(obs) {
  const m = /^(\d{2})-(\d{2})-(\d{4})\s+(\d{2}):(\d{2})/.exec(obs || '');
  if (!m) return null;
  return { date: `${m[3]}-${m[2]}-${m[1]}`, hour: `${m[4]}:${m[5]}`, y: m[3], mo: m[2] };
}

const MONTHS = readdirSync(HIST)
  .filter((f) => /^delhi-\d{4}-\d{2}\.ndjson$/.test(f))
  .sort()
  .map((f) => {
    const [, y, mo] = /^delhi-(\d{4})-(\d{2})\.ndjson$/.exec(f);
    const rows = readFileSync(join(HIST, f), 'utf8').trim().split('\n')
      .filter(Boolean).map((l, i) => {
        try { return JSON.parse(l); } catch { dataFail(`${f} line ${i + 1} is not JSON`); return null; }
      }).filter(Boolean);
    return { file: f, y, mo, rows };
  });

if (!MONTHS.length) dataFail('data/air-history holds no delhi-YYYY-MM.ndjson — there is no record to publish.');

/** Collapse a month's hourly rows into one entry per calendar day. */
function days(month) {
  const by = new Map();
  for (const r of month.rows) {
    const t = stamp(r.obs);
    if (!t) { dataFail(`${month.file}: unparseable observation stamp ${JSON.stringify(r.obs)}`); continue; }
    if (!by.has(t.date)) by.set(t.date, { date: t.date, obs: [], revised: 0, revisions: [] });
    const d = by.get(t.date);
    d.obs.push({ hour: t.hour, aqi: r.city?.aqi, band: r.city?.band, governing: r.city?.governing,
      station: r.city?.station, mean: r.mean, above: r.above_limit, stations: (r.stations || []).length });
    if (r.revised) {
      d.revised += r.revised;
      for (const rev of r.revisions || []) {
        if (rev.from?.aqi != null && r.city?.aqi != null && rev.from.aqi !== r.city.aqi) {
          d.revisions.push({ hour: t.hour, from: rev.from.aqi, to: r.city.aqi });
        }
      }
    }
  }
  return [...by.values()].sort((a, b) => a.date.localeCompare(b.date)).map((d) => {
    const withAqi = d.obs.filter((o) => Number.isFinite(o.aqi));
    const peak = withAqi.length ? withAqi.reduce((a, b) => (b.aqi > a.aqi ? b : a)) : null;
    const low = withAqi.length ? withAqi.reduce((a, b) => (b.aqi < a.aqi ? b : a)) : null;
    const above = d.obs.map((o) => o.above).filter(Number.isFinite);
    return { ...d, hours: d.obs.length, peak, low, maxAbove: above.length ? Math.max(...above) : null };
  });
}

const MONTH_DAYS = new Map(MONTHS.map((m) => [`${m.y}-${m.mo}`, days(m)]));

if (dataBad) {
  console.error(`\nREFUSING TO WRITE: ${dataBad} data check(s) failed.`);
  process.exit(1);
}

/* ── A DESCRIPTION THAT FITS, WITHOUT BEING WRITTEN TWELVE TIMES. ────────
   assemble() refuses anything outside 140-158 characters, and a month page's
   description contains the month's name — "September 2026" is two characters
   longer than "August 2026", so one hand-written sentence passes for one month
   and fails for the next. The clauses below are tried in order and the first
   that lands inside the window is used; if none does, the build stops rather
   than shipping a truncated snippet. */
const DESC_TAILS = [
  ' Kept with every revision the source later made.',
  ' Kept with every later revision.',
  ' From CPCB network readings.',
  ' From CPCB readings.',
  ' CPCB network data.',
  ' Read from CPCB.',
  ' CPCB data.',
  '',
];
function fitDesc(core) {
  for (const tail of DESC_TAILS) {
    const d = core + tail;
    if (d.length >= 140 && d.length <= 158) return d;
  }
  console.error(`REFUSING TO WRITE: no clause fits ${JSON.stringify(core)} into 140-158 characters `
    + `(bare length ${core.length}). Add one to DESC_TAILS.`);
  process.exit(1);
}

const MON = S.MON;
const monthLabel = (y, mo) => `${MON[Number(mo) - 1]} ${y}`;
const dayLabel = (iso) => {
  const [y, m, d] = iso.split('-');
  return `${Number(d)} ${S.MON3[Number(m) - 1]} ${y}`;
};
const monthRoute = (y, mo) => `/record/air/${y}/${mo}`;

/* Totals across the whole store, for the index and the air page. */
const ALL_DAYS = [...MONTH_DAYS.values()].flat();
const TOTAL_OBS = MONTHS.reduce((n, m) => n + m.rows.length, 0);
const TOTAL_REVISED = ALL_DAYS.reduce((n, d) => n + d.revised, 0);
const TOTAL_MOVED = ALL_DAYS.reduce((n, d) => n + d.revisions.length, 0);
const FIRST = ALL_DAYS[0]?.date;
const LAST = ALL_DAYS[ALL_DAYS.length - 1]?.date;
const PEAK = ALL_DAYS.filter((d) => d.peak).reduce((a, b) => (b.peak.aqi > a.peak.aqi ? b : a), { peak: { aqi: -1 } });

/* ═══ SHARED CSS ═════════════════════════════════════════════════════════ */
const PAGE_CSS = `
.rc-p{margin:0 0 clamp(12px,1.6vw,18px);max-width:64ch}
.rc-p:last-child{margin-bottom:0}
.rc-kept{display:grid;gap:clamp(18px,2.6vw,28px);margin:clamp(20px,3vw,32px) 0 0;
  grid-template-columns:repeat(auto-fit,minmax(260px,1fr))}
.rc-k{display:grid;gap:5px;align-content:start;min-width:0;
  border-top:2px solid currentColor;padding-top:13px}
.rc-k-h{margin:0}
.rc-k-h a{color:inherit;text-decoration:none}
.rc-k-p{margin:0;max-width:44ch}
.rc-k-m{margin:0}
.rc-tw{overflow-x:auto;margin:clamp(20px,3vw,32px) 0 0;-webkit-overflow-scrolling:touch}
.rc-t{border-collapse:collapse;width:100%;min-width:640px;font-variant-numeric:tabular-nums}
.rc-t caption{text-align:left;padding:0 0 10px}
.rc-t th,.rc-t td{text-align:left;padding:9px 14px 9px 0;border-bottom:1px solid currentColor;
  vertical-align:baseline;white-space:nowrap}
.rc-t th{font-weight:600;border-bottom-width:2px}
.rc-t td.rc-wide{white-space:normal;min-width:190px}
.rc-over{font-weight:600}
.rc-none{}
.rc-months{display:grid;gap:clamp(14px,2vw,20px);margin:clamp(20px,3vw,32px) 0 0;
  grid-template-columns:repeat(auto-fit,minmax(220px,1fr))}
.rc-m{display:grid;gap:4px;align-content:start;text-decoration:none;color:inherit;min-width:0;
  border-top:2px solid currentColor;padding-top:13px}
.rc-m-h{font-family:var(--display);font-size:clamp(21px,2.6vw,28px);line-height:1.1}
.rc-cite{margin:clamp(18px,2.6vw,26px) 0 0;max-width:70ch}
/* THE DOWNLOAD ROWS. A ruled list of files, deliberately not cards: a card
   implies a page behind it and these are files. Each row is the name, then the
   format and the measured size on a second line, so the reader knows what they
   are about to fetch before they fetch it. Ground-aware on the hairline only
   (the type inherits), because dlRows renders on dark-2 on all three pages
   today and a paper ground is one band move away. */
.rc-dl{list-style:none;margin:clamp(16px,2.2vw,22px) 0 0;padding:0;
  display:grid;gap:0;max-width:64ch}
.rc-dl li{display:grid;gap:2px;padding:12px 0;border-top:1px solid var(--hair)}
.rc-dl li:last-child{border-bottom:1px solid var(--hair)}
.paper .rc-dl li,.paper-2 .rc-dl li{border-top-color:var(--rule-2)}
.paper .rc-dl li:last-child,.paper-2 .rc-dl li:last-child{border-bottom-color:var(--rule-2)}
.rc-dl-m{margin:0;font-variant-numeric:tabular-nums}
/* An endpoint or a JSON literal inside a sentence. The .rc-cite code rule
   above is a BLOCK for a whole citation; this is the inline sibling and must
   not inherit that display or padding. */
.rc-inline{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.92em;
  padding:1px 5px;border:1px solid var(--hair);white-space:nowrap}
.paper .rc-inline,.paper-2 .rc-inline{border-color:var(--rule-2)}
.rc-defs{margin:clamp(18px,2.6vw,26px) 0 0;display:grid;gap:14px;max-width:66ch}
.rc-defs dt{font-weight:600;margin:0}
.rc-defs dd{margin:4px 0 0}
.rc-cite code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.92em;
  display:block;padding:12px 14px;border:1px solid currentColor;margin:10px 0 0;white-space:pre-wrap;
  overflow-wrap:anywhere}
.rc-doors{display:grid;gap:clamp(14px,2vw,20px);margin:clamp(18px,2.6vw,26px) 0 0;
  grid-template-columns:repeat(auto-fit,minmax(230px,1fr))}
.rc-door{display:grid;gap:5px;align-content:start;min-width:0;text-decoration:none;color:inherit;
  border-top:2px solid currentColor;padding-top:12px}
.rc-door-h{font-family:var(--display);font-size:clamp(19px,2.2vw,24px);line-height:1.14}
.rc-rev{list-style:none;margin:12px 0 0;padding:0;display:grid;gap:7px;max-width:60ch}
.rc-rev li{border-top:1px solid currentColor;padding-top:7px;font-variant-numeric:tabular-nums}
/* ── AD-50. THE AFFORDANCE IS TYPOGRAPHIC, NOT AN ICON. ──────────────────
   Every card, door and row in this section carried the shell's ARROW glyph.
   ARROW is a bare <svg viewBox="0 0 24 24"> with NO width or height of its
   own, and AD-40 had already recorded what that does — "as the third flex
   item in a stretch column the arrow took the card's full width and its 1:1
   viewBox made it that tall as well: measured 314x314 at 390px". This build
   read that note and then reproduced the bug in four new generators: thirty-
   two unsized arrows, and two of the generators had no sizing rule at all.

   Sizing them was the small fix. The owner asked for the arrow to stop being
   the device, and the site already has a better one: the footer's directory
   treatment, whose own note argues for it — "the underline is drawn in the
   HAIRLINE colour rather than the text colour ... so the column still reads
   as a directory rather than as twenty-four emphasised phrases; hover and
   focus take it to mustard along with the ink."

   So the cue is a hairline underline at rest, mustard on hover and focus. It
   satisfies AD-38's refusal of zero-cue blocks without an icon, it costs no
   vertical space — which is the space the cards get back as air — and it is
   already the language of the bottom of every page on this site.

   GROUND-AWARE, because --hair is rgba(251,248,240,.20): a light hairline
   for a dark ground, and invisible on paper. Paper takes --rule-2, the same
   split build-act-page.mjs makes for its own five classes. */
.rc-m-h,.rc-door-h,.rc-k-h a{text-decoration:underline;text-decoration-thickness:1px;
  text-underline-offset:5px;text-decoration-color:var(--hair);
  transition:text-decoration-color .14s ease}
.paper .rc-m-h,.paper-2 .rc-m-h,.paper .rc-door-h,.paper-2 .rc-door-h,.paper .rc-k-h a,.paper-2 .rc-k-h a{text-decoration-color:var(--rule-2)}
.rc-m:hover .rc-m-h,.rc-m:focus-visible .rc-m-h,.rc-door:hover .rc-door-h,.rc-door:focus-visible .rc-door-h,.rc-k-h a:hover,.rc-k-h a:focus-visible{text-decoration-color:var(--mustard)}
@media (prefers-reduced-motion:reduce){.rc-m-h,.rc-door-h,.rc-k-h a{transition:none}}

`;

/* ═══ THE JOURNAL DOOR ════════════════════════════════════════════════════
   THE DEFECT THIS CLOSES. A link census over all 93 built pages on 9 September
   2026 found `/journal` in the body of three of them — its own two articles and
   `/search`. The archive was one of the pages with no route into it, which is
   backwards: an article that reads a month of this record is the single best
   demonstration that keeping it was worth doing.

   ★ RENDERED AS THIS PAGE'S OWN `.rc-door`, NOT AS THE SITUATION SHELL'S RAIL.
   `journalRail()` is styled by CLOSING_CSS, which only the six situation
   generators emit; a rail here would arrive unstyled. The doors band is already
   on all three of these pages and `auto-fit` takes a fourth card, so the door
   is the component that costs nothing.

   ★ THE MATCH DIFFERS PER PAGE AND THAT IS THE POINT. A month page shows only
   the articles that cite THAT month. `/record/air` shows any article citing any
   month of the air record, because a month belongs to its subject page. See
   journalFor's predicate note. */
const journalDoors = (match) => S.journalFor(match, 'record').map((a) => {
  const [y, mo, d] = String(a.date).split('-').map(Number);
  return `        <a class="rc-door" href="/journal/${a.slug}"><span class="lbl">Journal</span>`
    + `<span class="rc-door-h">${a.h1.replace(/<br>/g, ' ')}</span>`
    + `<span class="cap">${d} ${S.MON[mo - 1]} ${y} &mdash; written against this record.</span></a>`;
}).join('\n');

/* ═══ THE DOWNLOADS ═══════════════════════════════════════════════════════
   WRITTEN BY scripts/build-data-exports.mjs, NAMED HERE, and existence-checked
   by recordDatasetJsonLd before any of it is published as a `distribution`.
   Nothing in this file writes a byte of data; it links what that generator
   wrote, and if that generator has not run the link band renders the files it
   can find and the Dataset markup drops the rest. The build is not failed for
   it: `npm run build:record` predates `npm run build:data` and making the
   archive pages refuse to build without the exports would take the record
   offline over a missing download. The CI loops run both. */
const dl = (rel) => `/data/${rel}`;
const haveFile = (rel) => existsSync(join(S.ROOT, 'public', dl(rel)));
const kb = (rel) => {
  const p = join(S.ROOT, 'public', dl(rel));
  if (!existsSync(p)) return '';
  const n = statSync(p).size;
  return n >= 1024 * 1024 ? `${(n / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`;
};

/* ── THE VISIBLE DOWNLOAD ROWS. `download` on the anchor rather than a plain
      link, because a browser shown text/csv may render it as a wall of text in
      a tab instead of saving it, and the reader asked for a file. The size is
      read off the file rather than typed: an advertised size that is wrong is
      the same class of defect as an advertised file that is missing. */
const dlRows = (rows) => {
  const have = rows.filter((r) => haveFile(r.rel));
  if (!have.length) return '';
  return `      <ul class="rc-dl">
${have.map((r) => `        <li><a class="lk" href="${dl(r.rel)}" download>${esc(r.label)}</a>
          <span class="cap rc-dl-m">${esc(r.format)} &middot; ${kb(r.rel)}${r.note ? ` &middot; ${esc(r.note)}` : ''}</span></li>`).join('\n')}
      </ul>`;
};

const BANDS_6 = (ids) => ids;
const gateAll = [];
const gate = (ok, msg) => { if (!ok) { console.error(`  FAIL ${msg}`); gateAll.push(msg); } else console.log(`  ok   ${msg}`); };

/* ═══ PAGE 3 — ONE PER MONTH ═════════════════════════════════════════════ */
mkdirSync(join(S.V3, 'record/air'), { recursive: true });
const monthPages = [];

for (const m of MONTHS) {
  const key = `${m.y}-${m.mo}`;
  const D = MONTH_DAYS.get(key);
  const route = monthRoute(m.y, m.mo);
  mkdirSync(join(S.V3, `record/air/${m.y}`), { recursive: true });

  const revised = D.reduce((n, d) => n + d.revised, 0);
  const moved = D.flatMap((d) => d.revisions);
  const peak = D.filter((d) => d.peak).reduce((a, b) => (b.peak.aqi > a.peak.aqi ? b : a), { peak: { aqi: -1 } });

  const BANDS = [
    ['top',      't1',          '#0D0D0B'],
    ['readings', 'paper t2',    '#F3F2F0'],
    ['revised',  't2',          '#0D0D0B'],
    ['method',   'paper-2 t2',  '#ECEBE8'],
    ['cite',     'dark-2 t2',   '#151512'],
    ['onward',   'paper t3',    '#F3F2F0'],
  ];
  const B = {
    top: () => `    <div class="wrap"><div class="im-head">
        <p class="lbl eyebrow">The record &middot; Delhi air</p>
        <h1 class="d1" id="top-h">${monthLabel(m.y, m.mo)}</h1>
        <p class="lead">${D.length} day${D.length === 1 ? '' : 's'} of readings from CPCB's Delhi network,
          ${m.rows.length} hourly observations in all. Every day carries the hours actually observed, so a
          partial day cannot be read as a complete one.</p>
      </div></div>`,

    readings: () => `${opener('readings', 'Day by day',
      `The highest and lowest worst-monitor reading recorded on each day, the monitor that produced the peak, and how many of the city's stations were over ${AQI_LIMIT} at the worst hour.`)}
    <div class="wrap">
      <div class="rc-tw">
        <table class="rc-t">
          <caption>Delhi, ${monthLabel(m.y, m.mo)}. AQI is CPCB's National Air Quality Index at the worst reporting monitor. ${AQI_LIMIT} is the top of the &lsquo;Satisfactory&rsquo; band.</caption>
          <thead><tr>
            <th scope="col">Date</th><th scope="col">Peak AQI</th><th scope="col">Band</th>
            <th scope="col" class="rc-wide">Monitor at the peak</th><th scope="col">Lowest</th>
            <th scope="col">Stations over ${AQI_LIMIT}</th><th scope="col">Hours observed</th>
          </tr></thead>
          <tbody>
${D.map((d) => `            <tr>
              <th scope="row">${dayLabel(d.date)}</th>
              <td${d.peak && d.peak.aqi > AQI_LIMIT ? ' class="rc-over"' : ''}>${d.peak ? d.peak.aqi : '<span class="rc-none">no reading</span>'}</td>
              <td>${d.peak ? esc(d.peak.band || bandOf(d.peak.aqi)) : '<span class="rc-none">&mdash;</span>'}</td>
              <td class="rc-wide">${d.peak && d.peak.station ? esc(d.peak.station) : '<span class="rc-none">&mdash;</span>'}${d.peak && d.peak.governing ? ` <span class="cap">(${esc(d.peak.governing)})</span>` : ''}</td>
              <td>${d.low ? d.low.aqi : '<span class="rc-none">&mdash;</span>'}</td>
              <td>${d.maxAbove == null ? '<span class="rc-none">&mdash;</span>' : d.maxAbove}</td>
              <td>${d.hours}</td>
            </tr>`).join('\n')}
          </tbody>
        </table>
      </div>
    </div>`,

    revised: () => `${opener('revised', 'When the source served it again',
      `The feed was re-served for ${revised} observation time${revised === 1 ? '' : 's'} this month. `
      + (moved.length
        ? `${moved.length} of those changed the city&rsquo;s headline reading.`
        : 'None of them changed the city&rsquo;s headline reading.'))}
    <div class="wrap">
      <p class="rc-p">Each observation time is read when it appears and re-read on later passes. Where a
        later pass returns something different for a time already stored, the earlier snapshot is kept beside
        the new one rather than overwritten &mdash; so a figure cited from this record can still be found at
        the address it was cited from. What differs is usually further down than the headline: a station
        reporting late, or one dropping out of the set.</p>
${moved.length ? `      <ul class="rc-rev">
${moved.slice(0, 40).map((r) => `        <li>${esc(r.hour)} &mdash; ${r.from} &rarr; ${r.to}</li>`).join('\n')}
      </ul>` : ''}
    </div>`,

    method: () => `${opener('method', 'How to read this table',
      'Four things the columns are, and are not.')}
    <div class="wrap">
      <p class="rc-p"><b>The reading is the worst reporting monitor, named</b> &mdash; not a city average. CPCB
        publishes a population-weighted city figure as well, and the two answer different questions. This
        record keeps the worst because it is what somebody in that part of the city was breathing.</p>
      <p class="rc-p"><b>An AQI is already a rolling figure.</b> CPCB's sub-indices are computed over averaging
        periods set per pollutant &mdash; 24 hours for the particulates. So an hourly observation describes a
        window ending at that hour, not that minute, and the day's peak is the highest such window.</p>
      <p class="rc-p"><b>Hours observed is the honesty column.</b> A day with four hours in it is four hours of
        record. Nothing here is interpolated and no missing hour is filled.</p>
      <p class="rc-p"><b>${AQI_LIMIT} is the top of CPCB's &lsquo;Satisfactory&rsquo; band</b>, which corresponds to the
        24-hour standard for the governing pollutant. It is the line this table marks, and
        <a class="lk" href="/learn/cpcb-aqi">what the index actually measures</a> explains the rest.</p>
    </div>`,

    cite: () => `${opener('cite', 'Cite this month',
      'Reuse freely. The grant is ours to give; CPCB\'s own terms travel with the underlying readings.')}
    <div class="wrap">
      <div class="rc-cite">
        <code>Swechha (${m.y}). Delhi air quality record, ${monthLabel(m.y, m.mo)}.
Readings from the Central Pollution Control Board network.
https://swechha.in${route}</code>
        <p class="cap rc-p" style="margin-top:12px">Licensed <a class="lk" href="${S.LICENCE_URL}" rel="license noopener">${S.LICENCE_NAME}</a>.
          <a class="lk" href="/use-the-data">Full terms, method and limitations</a>.</p>
      </div>
${/* ★ THE CITATION AND THE FILE BELONG TOGETHER. Whoever is copying the
      citation is the one person on this page who wants the data as a file, and
      until these rows existed the only way to get this month was to scrape the
      table above it out of HTML. */''}
${dlRows([
    { rel: `air/delhi-${m.y}-${m.mo}.csv`, label: `${monthLabel(m.y, m.mo)}, hour by hour`, format: 'CSV', note: `${m.rows.length} observations` },
    { rel: `air/delhi-${m.y}-${m.mo}-stations.csv`, label: `${monthLabel(m.y, m.mo)}, every station`, format: 'CSV', note: 'one row per monitor per hour' },
    { rel: `air/delhi-${m.y}-${m.mo}.json`, label: `${monthLabel(m.y, m.mo)}, with every revision`, format: 'JSON', note: 'what each reading said before it changed' },
  ])}
    </div>`,

    onward: () => `${opener('onward', 'Next', 'The live reading, the rest of the record, and what the numbers mean.')}
    <div class="wrap">
      <div class="rc-doors">
        <a class="rc-door" href="/now/air"><span class="lbl">Live</span><span class="rc-door-h">Delhi&rsquo;s air, now</span><span class="cap">Every reporting monitor, the worst named.</span></a>
        <a class="rc-door" href="/record/air"><span class="lbl">Record</span><span class="rc-door-h">Every month kept</span><span class="cap">The Delhi air archive, month by month.</span></a>
        <a class="rc-door" href="/learn/delhi-aqi"><span class="lbl">Learn</span><span class="rc-door-h">What is Delhi&rsquo;s AQI?</span><span class="cap">The six bands, and the standard underneath them.</span></a>
${journalDoors(route)}
      </div>
    </div>`,
  };

  const OUT = await S.assemble({
    file: `record/air/${m.y}/${m.mo}.html`,
    route,
    /* A MONTH PAGE IS A DATASET AND CAN SAY SO PRECISELY. It knows its own
       temporal coverage — first day to last, from the store rather than from
       the calendar — which is the one thing a live page can never state.

       ★ AND IT NOW HAS A `distribution`. This note used to read: "No
       `distribution`: there is no download yet, and asserting a file that does
       not exist is how markup gets a site distrusted rather than indexed."
       `npm run build:data` writes the three files named below, and
       recordDatasetJsonLd checks each is on disk before publishing the claim —
       so the second half of that note is enforced now rather than merely
       obeyed. Without a distribution a Dataset is, to a machine, a page ABOUT
       data; with one it is the data. */
    headExtra: S.recordDatasetJsonLd({
      name: `Delhi air quality record, ${monthLabel(m.y, m.mo)}`,
      description: `Day-by-day peak and lowest AQI at Delhi's worst reporting monitor for `
        + `${monthLabel(m.y, m.mo)}, with the monitor named, the count of stations over the limit `
        + 'and the hours observed, from CPCB network readings.',
      url: route,
      temporalCoverage: D.length ? `${D[0].date}/${D[D.length - 1].date}` : null,
      spatialCoverage: 'Delhi, India',
      measurementTechnique: 'Continuous ambient air quality monitoring; CPCB National Air Quality Index sub-indices',
      variables: ['Air Quality Index', 'Governing pollutant', 'Monitoring stations above the limit', 'Hours observed'],
      dist: [
        { path: dl(`air/delhi-${m.y}-${m.mo}.csv`), format: 'text/csv',
          name: `Delhi air quality, ${monthLabel(m.y, m.mo)}, hourly (CSV)`,
          description: 'One row per hourly observation: the worst reporting monitor named, the station mean beside it, and how many times the source later revised that reading.' },
        { path: dl(`air/delhi-${m.y}-${m.mo}.json`), format: 'application/json',
          name: `Delhi air quality, ${monthLabel(m.y, m.mo)}, hourly with revision history (JSON)`,
          description: 'The same observations, with what each revision said and the reading it replaced — which a CSV cell cannot hold.' },
        { path: dl(`air/delhi-${m.y}-${m.mo}-stations.csv`), format: 'text/csv',
          name: `Delhi air quality, ${monthLabel(m.y, m.mo)}, every station (CSV)`,
          description: 'Long format, one row per reporting monitor per hour, with the band it was in and whether it was over the published limit.' },
      ],
    }),
    title: `Delhi air quality record, ${monthLabel(m.y, m.mo)} — Swechha`,
    desc: fitDesc(`Day-by-day Delhi air quality for ${monthLabel(m.y, m.mo)}: peak AQI, the monitor that `
      + 'produced it, stations over the limit and hours observed.'),
    bands: BANDS_6(BANDS),
    index: [['Day by day', '#readings'], ['Revisions', '#revised'], ['How to read it', '#method'], ['Cite', '#cite'], ['Next', '#onward']],
    sh, clashes: S.groundChain(BANDS),
    pageCss: PAGE_CSS,
    navMark: { current: null, url: null },
    sectionFor: (id) => B[id](),
    note: `${D.length} days, ${m.rows.length} observations, ${revised} revised.`,
  });
  monthPages.push({ m, route, OUT, days: D, revised, moved, peak });
}

/* ═══ PAGE 2 — /record/air ═══════════════════════════════════════════════ */
{
  const BANDS = [
    ['top',     't1',          '#0D0D0B'],
    ['months',  'paper t2',    '#F3F2F0'],
    ['what',    't2',          '#0D0D0B'],
    ['holes',   'paper-2 t2',  '#ECEBE8'],
    ['cite',    'dark-2 t2',   '#151512'],
    ['onward',  'paper t3',    '#F3F2F0'],
  ];
  const B = {
    top: () => `    <div class="pic ht">
      <img class="duo" src="/images/photos/delhi-smog-skyline.jpg" alt="The Delhi skyline flattened into silhouette by smog"${S.imgDim('/images/photos/delhi-smog-skyline.jpg')} fetchpriority="high">
      <div class="pic-over"><div class="wrap">
        <p class="lbl eyebrow">The record</p>
        <h1 class="d1">Delhi&rsquo;s air,<br>kept.</h1>
      </div></div>
    </div>
    <div class="pic-body"><div class="wrap">
      <p class="lead">${S.n0(TOTAL_OBS)} hourly observations from ${dayLabel(FIRST)}, each one kept at its own
        address with the monitor that produced it. ${S.n0(TOTAL_REVISED)} of those observation times were
        later served again, and both snapshots are still here.</p>
    </div></div>`,

    months: () => `${opener('months', 'Every month kept', 'One page per month, each a complete day table.')}
    <div class="wrap">
      <div class="rc-months">
${monthPages.slice().reverse().map((p) => `        <a class="rc-m" href="${p.route}">
          <span class="rc-m-h">${monthLabel(p.m.y, p.m.mo)}</span>
          <span class="cap">${p.days.length} days &middot; ${S.n0(p.m.rows.length)} observations</span>
          <span class="cap">${p.revised} re-served by the source</span>
        </a>`).join('\n')}
      </div>
    </div>`,

    what: () => `${opener('what', 'What a row of this record is',
      'One observation time, one worst monitor, and everything the source said about it since.')}
    <div class="wrap">
      <p class="rc-p">Each stored observation carries CPCB's own observation stamp, the hour this site first
        read it, every later re-read, the city's worst reporting monitor by name, the unweighted mean of all
        reporting stations, how many were over ${AQI_LIMIT}, and the reading at each of them.</p>
      <p class="rc-p">Across the whole record, ${S.n0(TOTAL_REVISED)} observations were revised after first
        publication and ${S.n0(TOTAL_MOVED)} of those revisions changed the city's headline figure. That is a
        fact about the source, not about this site, and it is the reason both versions are kept: a reading
        that is quietly restated later means the number somebody cited is no longer the number at that
        address.</p>
      <p class="rc-p">The highest reading in the record so far is
        <b>${PEAK.peak.aqi > 0 ? PEAK.peak.aqi : '&mdash;'}</b>${PEAK.peak.aqi > 0 ? ` at ${esc(PEAK.peak.station || 'a named monitor')}, ${dayLabel(PEAK.date)}` : ''}.</p>
    </div>`,

    holes: () => `${opener('holes', 'What this record does not contain',
      'Stated because a record is only useful if its edges are known.')}
    <div class="wrap">
      <p class="rc-p">It begins on ${dayLabel(FIRST)}. There is no reconstruction of anything before that, and
        there will not be one &mdash; a record assembled backwards from a source that has since revised itself
        is not a record.</p>
      <p class="rc-p">An hour with no observation is absent, not zero. Where CPCB's live feed did not answer,
        the mirror on data.gov.in was read instead and the row says which.</p>
      <p class="rc-p">It is Delhi. The national file behind
        <a class="lk" href="/now/air/india">every city in the feed</a> is stored the same way and is not yet
        published as day tables.</p>
    </div>`,

    cite: () => `${opener('cite', 'Cite the record', 'Reuse freely. Each month page carries its own citation.')}
    <div class="wrap">
      <div class="rc-cite">
        <code>Swechha. Delhi air quality record.
Readings from the Central Pollution Control Board network.
https://swechha.in/record/air</code>
        <p class="cap rc-p" style="margin-top:12px">Licensed <a class="lk" href="${S.LICENCE_URL}" rel="license noopener">${S.LICENCE_NAME}</a>.
          <a class="lk" href="/use-the-data">Full terms, method and limitations</a>.</p>
      </div>
${dlRows([
    { rel: 'air/delhi-daily.csv', label: 'Every day of the record', format: 'CSV', note: 'peak, hours observed, hours over the limit' },
    { rel: 'index.json', label: 'What is published, and where', format: 'JSON', note: 'the manifest a script reads instead of this page' },
  ])}
      <p class="cap rc-p" style="margin-top:14px">Each month page below carries that month hour
        by hour, every reporting station in it, and what each reading said before the source
        changed it.</p>
    </div>`,

    onward: () => `${opener('onward', 'Next', 'The live page, the rest of the archive, and the explanation.')}
    <div class="wrap">
      <div class="rc-doors">
        <a class="rc-door" href="/now/air"><span class="lbl">Live</span><span class="rc-door-h">Delhi&rsquo;s air, now</span><span class="cap">The current hour, against the standard.</span></a>
        <a class="rc-door" href="/record"><span class="lbl">Record</span><span class="rc-door-h">Everything kept</span><span class="cap">What is archived across all six situations.</span></a>
        <a class="rc-door" href="/learn/pm25"><span class="lbl">Learn</span><span class="rc-door-h">What is PM2.5?</span><span class="cap">The pollutant that governs most of these readings.</span></a>
${journalDoors((h) => h.startsWith('/record/air'))}
      </div>
    </div>`,
  };

  var AIR_PAGE = await S.assemble({
    file: 'record/air.html',
    route: '/record/air',
    headExtra: S.recordDatasetJsonLd({
      name: 'Delhi air quality record',
      description: seo('/record/air').description,
      url: '/record/air',
      temporalCoverage: FIRST && LAST ? `${FIRST}/${LAST}` : null,
      spatialCoverage: 'Delhi, India',
      measurementTechnique: 'Continuous ambient air quality monitoring; CPCB National Air Quality Index sub-indices, stored hourly with every later re-read',
      variables: ['Air Quality Index', 'Governing pollutant', 'Worst reporting monitor', 'Station mean', 'Stations above the limit'],
      /* THE SUBJECT PAGE'S DISTRIBUTION IS THE WHOLE-ARCHIVE FILES, not a
         repeat of every month's. The daily roll-up is the one file that spans
         the record, and the manifest is how a script finds the rest without
         parsing this page — which is the point of publishing a manifest at
         all. Each month's own three files are the distribution of that month's
         own Dataset, one level down, where they describe exactly their page. */
      dist: [
        { path: dl('air/delhi-daily.csv'), format: 'text/csv',
          name: 'Delhi air quality, day by day (CSV)',
          description: "One row per day across the whole record: the day's peak observation, the monitor that produced it, how many hours were actually observed and how many were over the published limit." },
        { path: dl('index.json'), format: 'application/json',
          name: 'Manifest of every published file',
          description: 'What exists, at what URL, covering what span, under what terms — machine readable, so a script does not have to read this page to find the files.' },
      ],
    }),
    title: seo('/record/air').title,
    bands: BANDS,
    index: [['Every month', '#months'], ['What a row is', '#what'], ['What is missing', '#holes'], ['Cite', '#cite'], ['Next', '#onward']],
    sh, clashes: S.groundChain(BANDS),
    pageCss: PAGE_CSS,
    navMark: { current: null, url: null },
    sectionFor: (id) => B[id](),
    note: `${monthPages.length} months, ${TOTAL_OBS} observations.`,
  });
}

/* ═══ PAGE 1 — /record ═══════════════════════════════════════════════════ */
const KEPT = [
  { subject: 'Delhi air', href: '/record/air', live: '/now/air', learn: '/learn/delhi-aqi',
    cadence: 'Hourly', source: 'CPCB CAAQMS, mirrored on data.gov.in',
    limit: 'PM2.5 24-hour: 60 µg/m³ (NAAQS 2009)',
    note: `${S.n0(TOTAL_OBS)} observations kept with every revision, from ${dayLabel(FIRST)}.` },
  { subject: 'The Yamuna', href: null, live: '/now/yamuna', learn: '/learn/yamuna-bod',
    cadence: 'Annual', source: 'CPCB National Water Quality Monitoring Programme',
    limit: 'DO > 5.0 mg/L, BOD < 3.0 mg/L (PWQC 1986)',
    note: 'Published once a year as a station table. The whole series is on the live page.' },
  { subject: 'Heat', href: null, live: '/now/heat', learn: '/learn/imd-heatwave-criteria',
    cadence: 'Seasonal', source: 'ERA5 reanalysis, fourteen stations',
    limit: 'IMD heatwave criteria — a definition, not a standard',
    note: 'Thirty-five years per station, held as one series rather than split by year.' },
  { subject: 'Forest loss', href: null, live: '/now/forest-loss', learn: '/learn/forest-loss-india',
    cadence: 'Annual', source: 'FSI ISFR and Hansen / GFW',
    limit: 'No limit — two definitions that disagree',
    note: 'Both sources kept side by side, because reconciling them into one number would be the error.' },
  { subject: 'Fire', href: null, live: '/now/forest-fire', learn: '/learn/forest-fires-india',
    cadence: 'Annual sample', source: 'NASA FIRMS, VIIRS S-NPP',
    limit: 'No limit published anywhere',
    note: 'One fixed ten-day March window each year, so the series is comparable by construction.' },
  { subject: 'Extreme rain', href: null, live: '/now/climate-event', learn: '/learn/extreme-rainfall',
    cadence: 'Seasonal', source: 'ERA5, with NCRB for the deaths',
    limit: 'IMD day categories — severity, not permission',
    note: 'Days over the heavy-rain threshold per station, and the deaths recorded against five named causes.' },
];

{
  const BANDS = [
    ['top',     't1',          '#0D0D0B'],
    ['kept',    'paper t2',    '#F3F2F0'],
    ['rule',    't2',          '#0D0D0B'],
    ['air',     'paper-2 t2',  '#ECEBE8'],
    ['cite',    'dark-2 t2',   '#151512'],
    ['onward',  'paper t3',    '#F3F2F0'],
  ];
  const B = {
    top: () => `    <div class="pic ht">
      <img class="duo" src="/images/photos/yamuna-students-line-skyline.jpg" alt="A line of students standing at the Yamuna's edge against the Delhi skyline"${S.imgDim('/images/photos/yamuna-students-line-skyline.jpg')} fetchpriority="high">
      <div class="pic-over"><div class="wrap">
        <p class="lbl eyebrow">The record</p>
        <h1 class="d1">Nothing is<br>overwritten.</h1>
      </div></div>
    </div>
    <div class="pic-body"><div class="wrap">
      <p class="lead">Every reading this site publishes keeps its own address, with the source that produced
        it, when it was observed and the limit it was judged against. Nothing is quietly restated when it
        improves and nothing is quietly restated when it gets worse. An empty day stays empty.</p>
    </div></div>`,

    kept: () => `${opener('kept', 'What is kept', 'Six subjects, six cadences, six different kinds of source.')}
    <div class="wrap">
      <div class="rc-kept">
${KEPT.map((k) => `        <div class="rc-k">
          <h3 class="d2 rc-k-h">${k.href ? `<a href="${k.href}">${esc(k.subject)}</a>` : esc(k.subject)}</h3>
          <p class="cap rc-k-m">${esc(k.cadence)} &middot; ${esc(k.source)}</p>
          <p class="rc-k-p">${esc(k.note)}</p>
          <p class="cap rc-k-m">Judged against: ${esc(k.limit)}</p>
          <p class="cap"><a class="lk" href="${k.live}">Live reading</a> &middot; <a class="lk" href="${k.learn}">What it means</a></p>
        </div>`).join('\n')}
      </div>
    </div>`,

    rule: () => `${opener('rule', 'The rule this archive follows',
      'Four sentences, and every one of them is a thing an environmental record usually gets wrong.')}
    <div class="wrap">
      <p class="rc-p"><b>A gap is a gap.</b> A missing hour, a station that stopped reporting, a year the
        survey was not run &mdash; all of them are absent, and none of them is a zero.</p>
      <p class="rc-p"><b>A re-read is kept beside the original.</b> When a source serves something
        different for an observation time already stored, both snapshots are held.
        ${S.n0(TOTAL_REVISED)} observation times in the Delhi air record have been served again since
        the archive opened, and ${S.n0(TOTAL_MOVED)} of those changed the headline reading.</p>
        number against the notified standard is a finding. Where there is no published limit &mdash; rainfall,
        fire detections &mdash; the record says so rather than inventing a benchmark.</p>
      <p class="rc-p"><b>Counted and modelled are marked differently.</b> A satellite reanalysis and a station
        instrument are both useful and they fail in different ways. <a class="lk" href="/learn/measured-vs-modelled">Which one you are holding</a> decides what it can be used for.</p>
    </div>`,

    air: () => `${opener('air', 'The one that is published day by day',
      'Air is hourly, so it is the only subject with enough resolution to be worth a page per month.')}
    <div class="wrap">
      <p class="rc-p">${S.n0(TOTAL_OBS)} hourly observations of Delhi's air are kept, from ${dayLabel(FIRST)} to
        ${dayLabel(LAST)}, each with the worst reporting monitor named and the full state of the network at
        that hour.</p>
      <div class="rc-months">
${monthPages.slice().reverse().slice(0, 6).map((p) => `        <a class="rc-m" href="${p.route}">
          <span class="rc-m-h">${monthLabel(p.m.y, p.m.mo)}</span>
          <span class="cap">${p.days.length} days &middot; ${S.n0(p.m.rows.length)} observations</span>
        </a>`).join('\n')}
      </div>
      <p class="rc-p" style="margin-top:22px"><a class="b b-1" href="/record/air">The whole Delhi air record${ARROW}</a></p>
    </div>`,

    cite: () => `${opener('cite', 'Cite it, reuse it', 'The archive exists to be used by somebody else.')}
    <div class="wrap">
      <p class="rc-p">Everything here is published under <a class="lk" href="${S.LICENCE_URL}" rel="license noopener">${S.LICENCE_NAME}</a>.
        Quote a figure, republish a table, build something on it. If you quote a number, quote the kind with
        it &mdash; counted or modelled &mdash; and name the upstream source, which keeps its own terms.</p>
      <div class="rc-cite">
        <code>Swechha. Environmental record.
https://swechha.in/record</code>
      </div>
      <p class="rc-p" style="margin-top:18px"><a class="b b-1" href="/use-the-data">Terms, method and limitations${ARROW}</a></p>
    </div>`,

    onward: () => `${opener('onward', 'Next', 'The live readings, the explanations, and the way in.')}
    <div class="wrap">
      <div class="rc-doors">
        <a class="rc-door" href="/now"><span class="lbl">Live</span><span class="rc-door-h">Every situation</span><span class="cap">Six readings, each against its published limit.</span></a>
        <a class="rc-door" href="/learn"><span class="lbl">Learn</span><span class="rc-door-h">What the numbers mean</span><span class="cap">Twenty explainers behind these readings.</span></a>
        <a class="rc-door" href="/use-the-data"><span class="lbl">Reuse</span><span class="rc-door-h">Use this data</span><span class="cap">Licence, attribution, method and limits.</span></a>
${/* THE INDEX TAKES ANY ARTICLE THAT CITES ANY PART OF THE RECORD, because
     this is the page that argues the archive is worth keeping and a piece
     written out of it is the argument. */''}
${journalDoors((h) => h.startsWith('/record'))}
      </div>
    </div>`,
  };

  var INDEX_PAGE_OUT = await S.assemble({
    file: 'record.html',
    route: '/record',
    title: seo('/record').title,
    /* ★ `ItemList`, NOT `Dataset`. The subject pages and the month pages under
       them ARE Datasets and say so; this page is the register naming which
       subjects are kept and where each one lives. Marking an index as a Dataset
       would put a licence and a coverage on a page that publishes no reading —
       and it is the DataCatalog on /use-the-data, not this page, that describes
       the collection as a collection. Two pages, two jobs, neither claiming the
       other's type.

       The entries are `KEPT`, which is the same register the band above renders
       and the same one /use-the-data's catalogue reads. */
    headExtra: S.itemListJsonLd({
      name: 'What Swechha keeps a record of',
      items: KEPT.map((k) => ({
        name: k.subject === 'Air' ? 'Delhi air quality' : `${k.subject}, India`,
        url: k.href || k.live,
        description: `${k.source}. Read ${k.cadence.toLowerCase()}, judged against ${k.limit}.`,
      })),
    }),
    bands: BANDS,
    index: [['What is kept', '#kept'], ['The rule', '#rule'], ['Day by day', '#air'], ['Cite it', '#cite'], ['Next', '#onward']],
    sh, clashes: S.groundChain(BANDS),
    pageCss: PAGE_CSS,
    navMark: { current: null, url: null },
    sectionFor: (id) => B[id](),
    note: `${KEPT.length} subjects, ${monthPages.length} month pages.`,
  });
}

/* ═══ PAGE 4 — /use-the-data ═════════════════════════════════════════════
   THE PAGE THAT MAKES THE ARCHIVE USABLE BY SOMEBODY ELSE.
   A dataset nobody knows the terms of is a dataset nobody cites. This states
   the licence, the attribution, the method per subject and — the part usually
   missing — what each source does NOT cover. The per-subject rows are the same
   KEPT register the index renders, so the two cannot drift. */
{
  const BANDS = [
    ['top',     't1',          '#0D0D0B'],
    ['licence', 'paper t2',    '#F3F2F0'],
    /* ★ `files` GOES SECOND, NOT LAST, and the order is the argument. This page
       had the licence, the citation formats, the method and the limits, and no
       data — so a researcher who accepted every one of those terms still had to
       scrape month pages out of HTML. Putting the download below the method
       register would say the terms matter more than the files. It comes after
       the licence because the licence is what makes taking them legitimate, and
       before the method because a file you cannot get is not worth a method.

       ★ AND IT IS `dark-2`, WHICH IS ARITHMETIC RATHER THAN TASTE. Two things
       had to hold. Every band that already existed keeps the exact ground it
       shipped on, because their CSS is written per ground and re-tinting one to
       make room for a new band is how a light rule ends up on a dark seam.
       And `groundChain` requires each hex to differ from its neighbour: seven
       content bands opening on a dark masthead cannot strictly alternate into a
       dark footer, so the new band's ground is the one free variable. #151512
       after #F3F2F0 and before #0D0D0B satisfies both — and it is the same
       ground the `cite` band carries on the month pages and on /record/air,
       which is where `dlRows` also renders. One treatment, three pages. */
    ['files',   'dark-2 t2',   '#151512'],
    ['how',     't2',          '#0D0D0B'],
    ['method',  'paper-2 t2',  '#ECEBE8'],
    ['limits',  'dark-2 t2',   '#151512'],
    ['onward',  'paper t3',    '#F3F2F0'],
  ];
  const LIMITS = [
    ['Air', 'A station reading describes a point, not a neighbourhood, and the index cannot be converted back into a concentration. Indoor air, where most of the day is spent, is not measured at all.'],
    ['The Yamuna', 'One year of grab samples per station, published as a minimum and a maximum rather than a mean. Metals, pesticides and pharmaceuticals are not among the five parameters.'],
    ['Heat', 'Days meeting IMD’s temperature criteria at single grid points — related to, but not the same as, an IMD declaration, which needs two or more stations in a subdivision.'],
    ['Forest', 'Two sources that disagree by definition. Neither measures forest quality, biodiversity or carbon, and neither can attribute a change to a cause.'],
    ['Fire', 'Detections, not fires and not forest fires. A fixed ten-day window each year is a sample and can miss a peak; it is comparable across years precisely because it does not chase one.'],
    ['Rain', 'A 24-hour category is blind to intensity within the day, and there is no legal rainfall threshold for anything to be over.'],
  ];
  const B = {
    top: () => `    <div class="pic ht">
      <img class="duo" src="/images/photos/healthy-cities-nature-journals-leaf-studies.jpg" alt="Fourteen open nature journals laid out in rows on a dark cloth, each spread pairing a real pressed leaf or seed pod with a painted study of the same leaf beside it"${S.imgDim('/images/photos/healthy-cities-nature-journals-leaf-studies.jpg')} fetchpriority="high">
      <div class="pic-over"><div class="wrap">
        <p class="lbl eyebrow">Use the data</p>
        <h1 class="d1">Take it and<br>use it.</h1>
      </div></div>
    </div>
    <div class="pic-body"><div class="wrap">
      <p class="lead">Everything Swechha publishes as a reading is open. Quote it, republish it, build on it,
        argue with it. This page is the licence, the attribution, the method and the part most datasets leave
        out &mdash; what each one does not cover.</p>
    </div></div>`,

    licence: () => `${opener('licence', 'The licence',
      'One grant, stated once, and the limit of what it is ours to give.')}
    <div class="wrap">
      <p class="rc-p"><b>Everything on this site that is a reading, a table or a record is licensed
        <a class="lk" href="${S.LICENCE_URL}" rel="license noopener">${S.LICENCE_NAME}</a>.</b> You may copy it,
        redistribute it, transform it and use it commercially, provided you give attribution.</p>
      <p class="rc-p">The grant covers our compilation, our derived figures and our pages. It does not and
        cannot cover the upstream sources &mdash; CPCB, IMD, the Forest Survey of India, NASA, ECMWF and the
        others keep their own terms, which is why every figure on this site names the source it came from.
        If you are republishing an upstream figure at scale, go to that source's terms as well.</p>
      <p class="rc-p">Photographs are not covered. They are Swechha's own or licensed to Swechha, and they
        are not part of this grant.</p>
    </div>`,

    /* ═══ THE FILES ═══════════════════════════════════════════════════════
       THE BAND THIS PAGE WAS MISSING. Every clause above it was already true
       and none of it was actionable: a journalist on a deadline, a student
       writing a project, a teacher building a lesson and a researcher checking
       a claim all arrived at a page that told them the terms of data they
       could not download.

       ★ IT SAYS WHO IT IS FOR, BY NAMING THE FILE EACH ONE ACTUALLY WANTS.
       Not an audience list — a list of audiences is a marketing device and
       tells nobody which file to click. The daily roll-up is the one a
       newsroom or a classroom wants; the hourly and the per-station files are
       for somebody testing a claim about a neighbourhood; the manifest is for
       a script. Three sentences, three files, no personas.

       ★ THE WORD "API" APPEARS EXACTLY ONCE ON THIS PAGE AND IT NAMES THE ONE
       ENDPOINT THAT IS ONE. `/api/air` is real, request-time, one city, the
       current hour. Everything else here is a static file, and this band says
       so in the same breath rather than leaving the reader to assume a
       directory of CSVs is a service with an uptime. */
    files: () => `${opener('files', 'Take the files',
      'The record as CSV and JSON, under the licence above. No key, no sign-up, no rate limit. '
      + 'Written for whoever has to check something: a journalist on a deadline, a teacher building '
      + 'a lesson, a student testing a claim, a researcher who needs one neighbourhood.')}
    <div class="wrap">
      <p class="rc-p"><b>Start with the day-by-day file.</b> One row per day across the whole record:
        the peak reading, the monitor that produced it, how many hours were actually observed and how
        many of them were over the published limit. It is the one most people want and the smallest.</p>
${dlRows([
    { rel: 'air/delhi-daily.csv', label: 'Delhi air, day by day', format: 'CSV', note: 'the whole record so far' },
  ])}
      <p class="rc-p" style="margin-top:22px"><b>Go to a month for the hours.</b> Each
        <a class="lk" href="/record/air">month page</a> carries that month hour by hour, every
        reporting station in it, and &mdash; the part that makes this an archive rather than a
        snapshot &mdash; what each reading said before the source changed it. Those three files are
        linked from the month itself, so the citation and the download sit together.</p>
${dlRows(MONTHS.slice().reverse().flatMap((m) => [
    { rel: `air/delhi-${m.y}-${m.mo}.csv`, label: `${monthLabel(m.y, m.mo)}, hour by hour`, format: 'CSV', note: `${m.rows.length} observations` },
    { rel: `air/delhi-${m.y}-${m.mo}-stations.csv`, label: `${monthLabel(m.y, m.mo)}, every station`, format: 'CSV', note: 'one row per monitor per hour' },
  ]))}
      <p class="rc-p" style="margin-top:22px"><b>If you are writing a script, read the manifest.</b>
        It lists every file, its URL, the span it covers and the terms, so nothing has to parse this
        page to find them.</p>
${dlRows([
    { rel: 'index.json', label: 'The manifest', format: 'JSON', note: 'every file, its span and its terms' },
  ])}
      <p class="rc-p" style="margin-top:22px"><b>One endpoint is live; the rest are files.</b>
        <code class="rc-inline">GET /api/air</code> fetches Delhi's current hour from CPCB at request
        time and returns <code class="rc-inline">{ ok: false }</code> with a reason and no reading
        when the source does not answer &mdash; never a zero. Everything above is a static file
        regenerated when the record changes, which is what makes it quotable: the file you cite today
        is the file that was there.</p>
      <p class="cap rc-p">The national store behind
        <a class="lk" href="/now/air/india">every city in the feed</a> is kept the same way and is not
        published as files yet &mdash; around 268 rows an hour is roughly twelve megabytes of CSV a
        month. Ask if you need it.</p>
    </div>`,

    how: () => `${opener('how', 'How to cite it',
      'Three shapes, depending on what you are quoting.')}
    <div class="wrap">
      <div class="rc-cite">
        <p class="lbl">A live reading</p>
        <code>Swechha, Delhi air quality. Reading from the Central Pollution Control Board
network, observed [date and hour IST]. https://swechha.in/now/air</code>
      </div>
      <div class="rc-cite">
        <p class="lbl">A month of the record</p>
        <code>Swechha (2026). Delhi air quality record, [month year].
Readings from the Central Pollution Control Board network.
https://swechha.in/record/air/2026/09</code>
      </div>
      <div class="rc-cite">
        <p class="lbl">An explanation</p>
        <code>Swechha. “What is PM2.5?” https://swechha.in/learn/pm25</code>
      </div>
      <p class="rc-p" style="margin-top:22px"><b>Quote the kind with the number.</b> If a figure is modelled,
        say so; if it is counted or measured, say so. A modelled national estimate presented as a measurement
        is the commonest way an honest number becomes a false claim, and
        <a class="lk" href="/learn/measured-vs-modelled">the difference</a> is on the page it came from.</p>
      <p class="rc-p"><b>Quote the observation time, not the time you read it.</b> Every reading here carries
        the source's own stamp for when the air, the water or the imagery was actually observed.</p>
${/* ★ FOUR THINGS ON THIS SITE, AND ONLY ONE OF THEM IS SWECHHA'S DATA.
      Nothing here is new information — the licence band above already says the
      grant "does not and cannot cover the upstream sources", every figure on
      every page already names its source, and the counted/modelled rule is
      already printed beside each numeral. What was missing was the DISTINCTION
      stated once, in the place somebody writes a citation, so that a person
      quoting this site knows which of the four they are quoting and whose name
      goes on it.

      It is written as a register rather than a paragraph because it is a
      lookup: a reader arrives with one figure and needs to know which row it
      is in. Nothing in it may be a claim the pages do not already support —
      each row names where on this site that kind of thing lives, and every one
      of those places is real. */''}
      <dl class="rc-defs" style="margin-top:26px">
        <dt>Source data &mdash; not ours</dt>
        <dd>Every reading originates with somebody else: CPCB for air and the river, IMD for heat and
          rainfall, the Forest Survey of India and Global Forest Watch for forest, NASA FIRMS for fire
          detections. We did not measure any of it and never say we did. Cite the source alongside us,
          and go to its own terms if you are republishing at scale.</dd>
        <dt>Swechha processing &mdash; ours, and reproducible</dt>
        <dd>What we do to those readings: taking the worst reporting monitor rather than a city
          average, printing the unweighted station mean beside it as a cross-check, looking each index
          up in CPCB's own band table, sampling forest fire detections in a fixed ten-day window every
          year, and keeping every reading the source later revised. All of it is visible in the files
          above &mdash; the point of publishing them is that you can redo it and disagree.</dd>
        <dt>Swechha analysis &mdash; ours, and arguable</dt>
        <dd>A finding derived from the above: a <a class="lk" href="/journal">Journal</a> piece, a
          figure on <a class="lk" href="/impact">/impact</a>. Each one shows its derivation and
          snapshots the figures it was true at, so it can be checked against the record rather than
          taken on trust.</dd>
        <dt>Editorial interpretation &mdash; ours, and not a finding</dt>
        <dd>The writing around the numbers: which reading leads a page, what we say is not enough,
          what we ask you to do about it. Quotable as Swechha's position. Not quotable as a result.</dd>
      </dl>
      <p class="cap rc-p" style="margin-top:18px">If you only take one rule from this: the numbers are
        somebody else's measurements, the method is ours, and the two need separate attribution.</p>
    </div>`,

    method: () => `${opener('method', 'Where each number comes from',
      'Source, cadence and the limit it is judged against — the same register the record itself renders.')}
    <div class="wrap">
      <div class="rc-tw">
        <table class="rc-t">
          <caption>Every subject Swechha publishes a reading for.</caption>
          <thead><tr>
            <th scope="col">Subject</th><th scope="col">Source</th><th scope="col">Cadence</th>
            <th scope="col" class="rc-wide">Judged against</th><th scope="col">Where</th>
          </tr></thead>
          <tbody>
${KEPT.map((k) => `            <tr>
              <th scope="row">${esc(k.subject)}</th>
              <td class="rc-wide">${esc(k.source)}</td>
              <td>${esc(k.cadence)}</td>
              <td class="rc-wide">${esc(k.limit)}</td>
              <td><a class="lk" href="${k.live}">Live</a>${k.href ? ` &middot; <a class="lk" href="${k.href}">Record</a>` : ''}</td>
            </tr>`).join('\n')}
          </tbody>
        </table>
      </div>
    </div>`,

    limits: () => `${opener('limits', 'What it does not cover',
      'Stated per subject, because a dataset used past its edges produces a confident wrong answer.')}
    <div class="wrap">
      <dl class="rc-defs">
${LIMITS.map(([h, p]) => `        <dt>${esc(h)}</dt>\n        <dd>${esc(p)}</dd>`).join('\n')}
      </dl>
      <p class="rc-p" style="margin-top:24px">Nothing here is interpolated, and no gap is filled. An hour with
        no observation is absent; a station that stopped reporting is missing, not clean; a year the survey was
        not run has no figure. If you need a complete grid, this is the wrong dataset and that is a property of
        the measurement, not of the archive.</p>
    </div>`,

    onward: () => `${opener('onward', 'Next', 'The archive, the explanations, and a person to ask.')}
    <div class="wrap">
      <div class="rc-doors">
        <a class="rc-door" href="/record"><span class="lbl">Record</span><span class="rc-door-h">The archive</span><span class="cap">Every reading kept at its own address.</span></a>
        <a class="rc-door" href="/learn"><span class="lbl">Learn</span><span class="rc-door-h">What the numbers mean</span><span class="cap">Twenty explainers, each with its sources.</span></a>
        <a class="rc-door" href="/now"><span class="lbl">Live</span><span class="rc-door-h">Every situation</span><span class="cap">Six readings, each against its published limit.</span></a>
      </div>
${S.ask({ audience: 'media', label: 'Ask about the data', page: 'Use the data', path: '/use-the-data' })}
    </div>`,
  };

  var USE_PAGE = await S.assemble({
    file: 'use-the-data.html',
    route: '/use-the-data',
    title: seo('/use-the-data').title,
    /* ★ `DataCatalog`, NOT `Dataset` AND NOT `Article`. This page publishes no
       reading of its own — it states what datasets exist, under what terms,
       from what source and with what limits, and each entry points at the page
       that holds it. That is the definition of a catalogue. Calling it a
       Dataset would claim it IS the data; calling it an Article would put the
       licence terms of six subjects into a byline.

       THE ENTRIES ARE THE `KEPT` REGISTER, which the /record index renders as
       its own table, so the catalogue and the page cannot describe a different
       set of subjects. `live: true` marks the six that have a live page;
       `href` marks the ones with an archive behind them, and only those get a
       temporal coverage, because a live page cannot state one. */
    headExtra: S.dataCatalogJsonLd({
      name: 'Swechha environmental data',
      description: seo('/use-the-data').description,
      url: '/use-the-data',
      datasets: KEPT.map((k) => ({
        name: k.subject === 'Air' ? 'Delhi air quality' : `${k.subject} readings, India`,
        description: `${k.source}. Read ${k.cadence.toLowerCase()}, judged against ${k.limit}.`,
        url: k.href || k.live,
        spatialCoverage: k.subject === 'Air' ? 'Delhi, India' : 'India',
        measurementTechnique: k.source,
        ...(k.href === '/record/air' && FIRST && LAST ? { temporalCoverage: `${FIRST}/${LAST}` } : {}),
      })),
      dist: [
        { path: dl('air/delhi-daily.csv'), format: 'text/csv', name: 'Delhi air quality, day by day (CSV)' },
        { path: dl('index.json'), format: 'application/json', name: 'Manifest of every published file' },
      ],
    }),
    bands: BANDS,
    index: [['Licence', '#licence'], ['The files', '#files'], ['How to cite', '#how'], ['Sources', '#method'], ['What it misses', '#limits'], ['Next', '#onward']],
    sh, clashes: S.groundChain(BANDS),
    pageCss: PAGE_CSS,
    navMark: { current: null, url: null },
    sectionFor: (id) => B[id](),
    note: `licence + citation formats + ${KEPT.length} sources.`,
  });
}

/* ═══ GATES ══════════════════════════════════════════════════════════════ */
console.log('\nGATES');
const ALL = [INDEX_PAGE_OUT, AIR_PAGE, USE_PAGE, ...monthPages.map((p) => p.OUT)];

/* 1. EVERY DAY IN THE STORE IS A ROW ON ITS MONTH PAGE. A record that silently
      drops a day is worse than no record. */
let missingDays = [];
for (const p of monthPages) {
  for (const d of p.days) if (!p.OUT.includes(dayLabel(d.date))) missingDays.push(`${p.route} ${d.date}`);
}
gate(missingDays.length === 0, `all ${ALL_DAYS.length} days in the store render${missingDays.length ? `; MISSING: ${missingDays.join(', ')}` : ''}`);

/* 2. EVERY PEAK VALUE ON A PAGE IS THE PEAK IN THE DATA. Re-derived from the
      rendered HTML, so a template that prints the wrong day's figure fails. */
let wrongPeak = [];
for (const p of monthPages) {
  for (const d of p.days.filter((x) => x.peak)) {
    /* Located by string, not by regex. The first attempt built the row matcher
       with `new RegExp` over an escaped date and every one of the fifteen days
       "failed" — a gate that fires on its own escaping is worse than no gate,
       because the next person to see it red switches it off. */
    const at = p.OUT.indexOf(`<th scope="row">${dayLabel(d.date)}</th>`);
    if (at < 0) { wrongPeak.push(`${p.route} ${d.date} (no row)`); continue; }
    const cell = /<td[^>]*>(\d+)</.exec(p.OUT.slice(at, at + 400));
    if (!cell || Number(cell[1]) !== d.peak.aqi) {
      wrongPeak.push(`${p.route} ${d.date} (page ${cell ? cell[1] : 'none'}, store ${d.peak.aqi})`);
    }
  }
}
gate(wrongPeak.length === 0, `every rendered peak matches the store${wrongPeak.length ? `; WRONG: ${wrongPeak.join(', ')}` : ''}`);

/* 3. NO MONTH PAGE IS UNREACHABLE. Every one is linked from /record/air. */
const unlinked = monthPages.filter((p) => !AIR_PAGE.includes(`href="${p.route}"`));
gate(unlinked.length === 0, `every month page is linked from /record/air${unlinked.length ? `; ORPHAN: ${unlinked.map((p) => p.route).join(', ')}` : ''}`);

/* 4. THE LICENCE AND A CITATION ARE ON EVERY PAGE. The section's whole purpose
      is to be cited; a page somebody cannot attribute is not part of it. */
const RECORD_PAGES = [INDEX_PAGE_OUT, AIR_PAGE, ...monthPages.map((p) => p.OUT)];
const noCite = RECORD_PAGES.filter((h) => !h.includes(S.LICENCE_URL) || !h.includes('https://swechha.in/record'));
gate(noCite.length === 0, `every record page carries the licence and a citation (${RECORD_PAGES.length} pages)`);
gate(USE_PAGE.includes(S.LICENCE_URL) && /CC BY 4\.0/.test(USE_PAGE), 'the terms page states the licence by name');

/* 5. NO EMPTY-DAY ZERO. A day with no reading must say so in words. */
const zeroDay = monthPages.filter((p) => /<td[^>]*>0<\/td>\s*<td>&mdash;/.test(p.OUT));
gate(zeroDay.length === 0, 'no day with no reading is printed as a zero');

/* 6. NO DEAD OR PROTOTYPE HREF. */
const dead = ALL.flatMap((h) => [...h.matchAll(/href="([^"]+)"/g)].map((m) => m[1]))
  .filter((h) => h === '#' || h.startsWith('/design/') || h.startsWith('/_pages/'));
gate(dead.length === 0, `no dead or prototype href${dead.length ? `; FOUND: ${[...new Set(dead)].join(', ')}` : ''}`);

/* 7. EVERY IMAGE CARRIES ALT TEXT. */
const noAlt = ALL.flatMap((h) => [...h.matchAll(/<img(?![^>]*\balt=)[^>]*>/g)].map((m) => m[0].slice(0, 50)));
gate(noAlt.length === 0, `every image has alt text${noAlt.length ? `; FOUND: ${noAlt.join(' | ')}` : ''}`);

/* 8. THE TABLE IS A TABLE. A record read by a screen reader or scraped by a
      researcher needs headers, a caption and row scope — not a grid of divs. */
const badTable = monthPages.filter((p) => !/<table class="rc-t">/.test(p.OUT)
  || !/<caption>/.test(p.OUT) || !/<th scope="col">/.test(p.OUT) || !/<th scope="row">/.test(p.OUT));
gate(badTable.length === 0, 'every month page uses a real table with a caption and scoped headers');

console.log(`\n${ALL.length} pages. ${gateAll.length ? `${gateAll.length} gate(s) failed.` : 'All gates pass.'}`);
if (gateAll.length) process.exit(1);
