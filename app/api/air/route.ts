/**
 * GET /api/air — the LIVE reading for the Air situation page (D-17.4).
 *
 * WHY THIS ROUTE EXISTS AT ALL. The page is prerendered and its reading comes
 * from committed JSON, which makes the badge PERIODIC: the number cannot
 * change between two views of the same build. This route is the one thing that
 * changes that — it fetches CPCB at request time, so the value CAN move
 * between two page views, and the badge is then entitled to read LIVE.
 *
 *   LIVE describes the fetch. The age describes the observation.
 *
 * Both are printed. CPCB publishes hourly, so the badge must never be allowed
 * to stand in for "observed 10:00, an hour ago" — the page prints the age
 * beside the badge, always.
 *
 * ★ THE KEY NEVER REACHES THE CLIENT. That is the whole reason this is a
 * server route rather than a browser fetch. `DATA_GOV_IN_KEY` is read from the
 * environment here and never serialised into the response.
 *
 * ★ AN ERROR IS NOT A ZERO (D-16.4). Every failure path returns
 * `{ ok: false }` with a reason and NO reading. The page then keeps the
 * committed reading it already rendered and leaves the badge on PERIODIC. It
 * must never render a hole, a dash, or a 0 as though it were air.
 *
 * The AQI is COMPUTED HERE, from concentrations, using CPCB's own breakpoint
 * table — the feed publishes no index. The table below is the same one in
 * scripts/fetch-air.mjs and the two must not be allowed to drift; the
 * self-check against CPCB's worked example runs on every request and the route
 * refuses to answer if it fails.
 */
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * CPCB National AQI breakpoints, TRANSCRIBED VERBATIM from
 * scripts/fetch-air.mjs — same bounds, same band index ranges, same rounding.
 * These two implementations must agree exactly or the hero number will jump
 * when the page hydrates, which would look like the air changing when only the
 * code did. The bounds are INCLUSIVE INTEGERS (…30 / 31…), not shared edges:
 * CPCB's own worked example puts PM2.5 31 µg/m³ at sub-index 51, and a
 * shared-edge table returns 52. The self-check below catches exactly that.
 */
const BANDS: { name: string; idx: [number, number] }[] = [
  { name: 'Good', idx: [0, 50] },
  { name: 'Satisfactory', idx: [51, 100] },
  { name: 'Moderately Polluted', idx: [101, 200] },
  { name: 'Poor', idx: [201, 300] },
  { name: 'Very Poor', idx: [301, 400] },
  { name: 'Severe', idx: [401, 500] },
];
const BP: Record<string, [number, number][]> = {
  'PM10': [[0, 50], [51, 100], [101, 250], [251, 350], [351, 430], [431, 600]],
  'PM2.5': [[0, 30], [31, 60], [61, 90], [91, 120], [121, 250], [251, 380]],
  'NO2': [[0, 40], [41, 80], [81, 180], [181, 280], [281, 400], [401, 600]],
  'OZONE': [[0, 50], [51, 100], [101, 168], [169, 208], [209, 748], [749, 1000]],
  'SO2': [[0, 40], [41, 80], [81, 380], [381, 800], [801, 1600], [1601, 2400]],
  'NH3': [[0, 200], [201, 400], [401, 800], [801, 1200], [1201, 1800], [1801, 2400]],
};
/** Feed spellings → the keys above. */
const ALIAS: Record<string, string> = {
  'PM2.5': 'PM2.5', 'PM10': 'PM10', 'NO2': 'NO2', 'SO2': 'SO2',
  'OZONE': 'OZONE', 'O3': 'OZONE', 'NH3': 'NH3',
};
/* CO IS EXCLUDED, and the exclusion is published on the page (D-15.9). The
   feed states no unit for it; CPCB's CO breakpoints are mg/m³ where every
   other pollutant here is µg/m³, and on either reading the values are not
   credible — read as mg/m³, CO alone would put almost every station in the
   top band. Pb has no breakpoint in the sub-daily table. */

/** Linear sub-index inside the CPCB band. Null outside the table. */
function subIndex(pollutant: string, conc: number): number | null {
  const bp = BP[pollutant];
  if (!bp || !Number.isFinite(conc) || conc < 0) return null;
  for (let i = 0; i < bp.length; i++) {
    const [bLo, bHi] = bp[i];
    const [iLo, iHi] = BANDS[i].idx;
    if (conc <= bHi) {
      const lo = i === 0 ? 0 : bLo;
      return Math.round(((iHi - iLo) / (bHi - lo)) * (conc - lo) + iLo);
    }
  }
  return 500;                       // above the top band; CPCB caps at 500
}

/** CPCB's own worked example. If this fails the table is wrong — refuse. */
function selfCheck(): boolean {
  return subIndex('PM2.5', 31) === 51 && subIndex('PM2.5', 45) === 75 && subIndex('PM2.5', 60) === 100;
}

const band = (aqi: number) =>
  (BANDS.find((b) => aqi >= b.idx[0] && aqi <= b.idx[1]) ?? BANDS[BANDS.length - 1]).name;

const MON = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

/**
 * CPCB writes `last_update` as "DD-MM-YYYY HH:MM:SS". Formatted here into the
 * SAME shape the committed JSON uses, so the line does not change format when
 * the page hydrates. Parsed by field, never by `new Date(string)` — the
 * standing date rule: this stamp is already IST and must not be shifted.
 */
function observedLabel(raw: string | null): string | null {
  if (!raw) return null;
  const m = /^(\d{2})-(\d{2})-(\d{4})\s+(\d{2}):(\d{2})/.exec(raw.trim());
  if (!m) return null;
  const [, d, mo, y, hh, mi] = m;
  const name = MON[Number(mo) - 1];
  if (!name) return null;
  return `${hh}:${mi} IST, ${Number(d)} ${name} ${y}`;
}

type Reading = {
  station: string; aqi: number; band: string; governing: string;
  conc: number; unit: string; observed: string | null;
};

export async function GET() {
  const key = process.env.DATA_GOV_IN_KEY;

  if (!selfCheck()) {
    return fail('breakpoint self-check failed — refusing to publish a computed index', 500);
  }
  if (!key) {
    // Not an error the reader caused, and not a zero. The page keeps its
    // committed reading and stays PERIODIC.
    return fail('no server-side key configured', 503);
  }

  /* `limit` and `offset` are BOTH required in practice — the endpoint answers
     a request without `offset` with an empty `records` array and HTTP 200,
     which is the error-as-zero trap this whole file is written against.
     Measured 21 August 2026: 308 rows for Delhi, all sharing ONE `last_update`
     — the feed advances the entire city one hour at a time. */
  const url = 'https://api.data.gov.in/resource/3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69'
    + `?api-key=${encodeURIComponent(key)}&format=json&limit=1000&offset=0`
    + '&filters%5Bcity%5D=Delhi';

  /* ONE RETRY. data.gov.in is measurably flaky — three consecutive calls
     during one build gave 200, 200, 502. Retrying is cheap here and costs the
     reader nothing visible: the page has already rendered its committed
     reading, and this route only ever UPGRADES it. Two attempts, not five: a
     source that fails twice in four seconds is down, and PERIODIC with a
     visibly ageing observation is the honest thing to show. */
  let rows: Record<string, string>[] | null = null;
  let last = 'not attempted';
  for (let attempt = 1; attempt <= 2 && rows === null; attempt++) {
    if (attempt > 1) await new Promise((r) => setTimeout(r, 400));
    try {
      const res = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(12000) });
      if (!res.ok) { last = `upstream HTTP ${res.status}`; continue; }
      const body = await res.json();
      // VALIDATE THE SHAPE, NOT THE STATUS. data.gov.in answers some failures
      // with 200 and an object that has no records at all.
      if (!Array.isArray(body?.records)) { last = 'unexpected response shape'; continue; }
      if (!body.records.length) { last = 'upstream returned no records for Delhi'; continue; }
      rows = body.records;
    } catch (e) {
      last = e instanceof Error ? e.message : 'fetch failed';
    }
  }
  if (rows === null) return fail(last, 502);

  // One row per station per pollutant. Fold to a station AQI = WORST
  // sub-index, then a city AQI = worst station. Never an average: CPCB's own
  // definition is "the worst sub-index determines the overall AQI".
  const byStation = new Map<string, { subs: Map<string, { sub: number; conc: number; unit: string }>; stamp: string | null }>();
  for (const r of rows) {
    const st = r.station;
    const raw = String(r.pollutant_id ?? '');
    const pol = ALIAS[raw] ?? ALIAS[raw.toUpperCase()] ?? raw.toUpperCase();
    const conc = Number(r.avg_value ?? r.pollutant_avg);
    if (!st || !Number.isFinite(conc)) continue;
    const sub = subIndex(pol, conc);
    if (sub == null) continue;                       // CO, Pb and anything unmapped
    if (!byStation.has(st)) byStation.set(st, { subs: new Map(), stamp: r.last_update ?? null });
    byStation.get(st)!.subs.set(pol, { sub, conc, unit: r.unit ?? 'µg/m³' });
  }

  let worst: Reading | null = null;
  let above = 0;
  for (const [station, { subs, stamp }] of byStation) {
    if (!subs.size) continue;
    let gov = '', top = -1;
    for (const [pol, v] of subs) if (v.sub > top) { top = v.sub; gov = pol; }
    if (top > 100) above++;
    if (!worst || top > worst.aqi) {
      const v = subs.get(gov)!;
      worst = { station, aqi: top, band: band(top), governing: gov, conc: v.conc, unit: v.unit,
        observed: observedLabel(stamp) };
    }
  }
  if (!worst) return fail('no station produced a computable sub-index', 502);

  return NextResponse.json({
    ok: true,
    state: 'LIVE',
    reading: worst,
    spread: { stations: byStation.size, above_limit: above },
    aqiLimit: 100,
    derivation: 'Computed from CPCB concentrations using CPCB\'s National AQI breakpoints. '
      + 'Station AQI is the worst sub-index; city AQI is the worst station. CO and Pb excluded.',
    source: { name: 'CPCB via data.gov.in', resource: '3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69' },
    fetchedAt: new Date().toISOString(),
  }, { headers: { 'Cache-Control': 'no-store' } });
}

function fail(reason: string, status: number) {
  // NO reading, NO zero, NO empty string that could be printed as a number.
  return NextResponse.json(
    { ok: false, state: 'PERIODIC', reason, reading: null },
    { status, headers: { 'Cache-Control': 'no-store' } },
  );
}
