/* ═══════════════════════════════════════════════════════════════════════════
   umami-shape.mjs — THE FOUR PIECES OF scripts/umami.mjs THAT CAN BE WRONG
   WITHOUT ANYTHING LOOKING WRONG.
   ───────────────────────────────────────────────────────────────────────────
   The rest of that script is a credential, four HTTP calls and a file write:
   if any of those break, they break loudly. These four do not. Each one has a
   failure mode whose symptom is a plausible-looking number, which is the only
   kind this repository treats as dangerous — so they live here, as pure
   functions over plain data, and lib/umami.test.ts holds them to it.
   ═══════════════════════════════════════════════════════════════════════════ */

/** IST, by the same +19800000 shift istStamp() uses in climate-events.mjs.
 *  A UTC day boundary files an Indian evening under the following morning. */
export const istDay = (ms) => new Date(ms + 19800000).toISOString().slice(0, 10);

export const num = (n) => (Number.isFinite(n) ? Math.round(n * 100) / 100 : 0);

/** ★ Umami v3 returns each stat as `{ value, prev }`; earlier versions
 *  returned a bare number. Reading `.value` off a bare number gives
 *  `undefined`, which would record EVERY figure as zero while the script
 *  reported success and the file looked structurally perfect. Both shapes are
 *  read, and anything else becomes 0 rather than NaN — a NaN survives
 *  JSON.stringify as `null` and would be quoted later as "no data". */
export const statValue = (s) => (s && typeof s === 'object' ? num(s.value) : num(s));

/** ★ Umami returns only the buckets it HAS ROWS FOR. A day with no traffic and
 *  a day the database was asleep are both simply absent from the series, so a
 *  28-day window can come back with 19 entries and nothing says which nine are
 *  missing. Filling every date in the window explicitly is what turns an
 *  absence into a zero somebody can see and count. */
export function fillDaily({ startAt, endAt }, pageviewRows = [], sessionRows = []) {
  const byDay = new Map();
  for (const r of pageviewRows) byDay.set(String(r.x).slice(0, 10), num(r.y));
  const sess = new Map();
  for (const r of sessionRows) sess.set(String(r.x).slice(0, 10), num(r.y));
  const out = [];
  for (let t = startAt; t < endAt; t += 864e5) {
    const date = istDay(t);
    out.push({ date, pageviews: byDay.get(date) ?? 0, sessions: sess.get(date) ?? 0 });
  }
  return out;
}

/** ★ A zero day BETWEEN two non-zero days — the signature of a collection gap
 *  rather than a quiet site. The analytics database is on a free tier that
 *  suspends compute at its cap (spec §3.4), and a week that was never
 *  collected looks exactly like a week nobody visited. Traffic on both sides
 *  of a hole is the one thing that distinguishes them from outside Neon's
 *  console.
 *
 *  DELIBERATELY NOT THE EDGES. The first and last day of a window are
 *  partial — the window starts and ends at an hour, not at midnight IST — so a
 *  zero there is ordinary and flagging it would cry wolf on every run. This is
 *  a suspicion handed to a person, never a finding. */
export function suspectedGaps(daily) {
  return daily
    .filter((d, i) => i > 0 && i < daily.length - 1
      && d.pageviews === 0 && daily[i - 1].pageviews > 0 && daily[i + 1].pageviews > 0)
    .map((d) => d.date);
}
