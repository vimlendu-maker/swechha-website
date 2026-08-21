/**
 * lib/air.ts — CPCB's National AQI, computed here, in one place.
 *
 * WHY THIS FILE EXISTS. Two routes need the same number: /api/air prints the
 * city reading in the hero, and /api/ward prints a per-station reading so a
 * reader can find the monitor that covers them. Computing it twice would mean
 * two breakpoint tables, and a page that disagrees with itself about the air
 * is worse than a page with one fewer feature.
 *
 * THE FEED PUBLISHES NO INDEX. It publishes concentrations. Every AQI on this
 * site is derived here from CPCB's own breakpoint table, and the page says so.
 *
 * ★ THE TABLE IS TRANSCRIBED VERBATIM FROM scripts/fetch-air.mjs and the two
 * must not drift. The bounds are INCLUSIVE INTEGERS (…30 / 31…), not shared
 * edges: CPCB's own worked example puts PM2.5 31 µg/m³ at sub-index 51, and a
 * shared-edge table returns 52. `selfCheck()` catches exactly that and every
 * caller runs it before trusting a number.
 *
 * ★ AN ERROR IS NOT A ZERO. `fetchDelhi()` either returns rows or throws. It
 * never returns an empty array that a caller could read as clean air.
 */

export const AQI_LIMIT = 100; // AQI 100 IS the NAAQS 24-hour standard.

export const BANDS: { name: string; idx: [number, number] }[] = [
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

const ALIAS: Record<string, string> = {
  'PM2.5': 'PM2.5', 'PM10': 'PM10', 'NO2': 'NO2', 'SO2': 'SO2',
  'OZONE': 'OZONE', 'O3': 'OZONE', 'NH3': 'NH3',
};

/* CO and Pb are EXCLUDED from every computed index, and the exclusion is
   published on the page: the feed states no unit for CO, CPCB defines CO in
   mg/m³ where everything else here is µg/m³, and the values are not credible
   as either. Read as mg/m³, CO alone would put almost every station in the
   top band. Pb has no sub-daily breakpoint. */

export function subIndex(pollutant: string, conc: number): number | null {
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
  return 500; // above the top band; CPCB caps the index at 500
}

/** CPCB's own worked example. If this fails the table is wrong — refuse. */
export function selfCheck(): boolean {
  return subIndex('PM2.5', 31) === 51
    && subIndex('PM2.5', 45) === 75
    && subIndex('PM2.5', 60) === 100;
}

export const bandFor = (aqi: number) =>
  (BANDS.find((b) => aqi >= b.idx[0] && aqi <= b.idx[1]) ?? BANDS[BANDS.length - 1]).name;

const MON = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

/**
 * CPCB writes `last_update` as "DD-MM-YYYY HH:MM:SS". Formatted into the SAME
 * shape the committed JSON uses, so a line does not change format when the page
 * hydrates. Parsed by FIELD, never `new Date(string)` — this stamp is already
 * IST and must not be shifted. (Same standing rule as the Farm app: never let a
 * timezone conversion touch a date that arrived as local wall-clock text.)
 */
export function observedLabel(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const m = /^(\d{2})-(\d{2})-(\d{4})\s+(\d{2}):(\d{2})/.exec(String(raw).trim());
  if (!m) return null;
  const [, d, mo, y, hh, mi] = m;
  const name = MON[Number(mo) - 1];
  if (!name) return null;
  return `${hh}:${mi} IST, ${Number(d)} ${name} ${y}`;
}

export type Station = {
  station: string;
  aqi: number;
  band: string;
  governing: string;
  conc: number;
  unit: string;
  lat: number | null;
  lng: number | null;
  observed: string | null;
};

const RESOURCE = '3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69';

/**
 * Fetch Delhi's rows from CPCB via data.gov.in.
 *
 * `limit` AND `offset` are both required in practice — without `offset` the
 * endpoint answers HTTP 200 with an empty `records` array, which is the
 * error-as-zero trap this whole module is written against. Measured 21 August
 * 2026: 308 rows, all sharing one `last_update` — the feed advances the entire
 * city one hour at a time.
 *
 * ONE RETRY. Three consecutive calls during one build returned 200, 200, 502.
 * A source that fails twice in four seconds is down, and the caller should fall
 * back to its committed reading rather than wait.
 *
 * @throws if the upstream fails, is misshapen, or returns nothing.
 */
export async function fetchDelhi(key: string): Promise<Record<string, string>[]> {
  const url = `https://api.data.gov.in/resource/${RESOURCE}`
    + `?api-key=${encodeURIComponent(key)}&format=json&limit=1000&offset=0`
    + '&filters%5Bcity%5D=Delhi';
  let last = 'not attempted';
  for (let attempt = 1; attempt <= 2; attempt++) {
    if (attempt > 1) await new Promise((r) => setTimeout(r, 400));
    try {
      const res = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(12000) });
      if (!res.ok) { last = `upstream HTTP ${res.status}`; continue; }
      const body = await res.json();
      // VALIDATE THE SHAPE, NOT THE STATUS.
      if (!Array.isArray(body?.records)) { last = 'unexpected response shape'; continue; }
      if (!body.records.length) { last = 'upstream returned no records for Delhi'; continue; }
      return body.records as Record<string, string>[];
    } catch (e) {
      last = e instanceof Error ? e.message : 'fetch failed';
    }
  }
  throw new Error(last);
}

/**
 * Fold rows into one reading per station.
 *
 * A station's AQI is its WORST SUB-INDEX — never the mean of its pollutants.
 * That is CPCB's own definition: "the worst sub-index determines the overall
 * AQI". Averaging would let a station with many clean pollutants hide one that
 * is far over the limit.
 */
export function foldStations(rows: Record<string, string>[]): Station[] {
  type Acc = { subs: Map<string, { sub: number; conc: number; unit: string }>;
    stamp: string | null; lat: number | null; lng: number | null };
  const by = new Map<string, Acc>();
  const num = (v: unknown) => {
    const s = String(v ?? '').trim();
    if (!s || s === 'NA' || s === '-') return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  };

  for (const r of rows) {
    const st = String(r.station ?? '').trim();
    if (!st) continue;
    const raw = String(r.pollutant_id ?? '').trim();
    const pol = ALIAS[raw] ?? ALIAS[raw.toUpperCase()] ?? raw.toUpperCase();
    const conc = num(r.avg_value ?? r.pollutant_avg);
    if (!by.has(st)) {
      by.set(st, { subs: new Map(), stamp: r.last_update ?? null,
        lat: num(r.latitude), lng: num(r.longitude) });
    }
    const acc = by.get(st)!;
    // Coordinates arrive on every row; keep the first non-null we see.
    if (acc.lat === null) acc.lat = num(r.latitude);
    if (acc.lng === null) acc.lng = num(r.longitude);
    if (conc === null) continue;
    const sub = subIndex(pol, conc);
    if (sub === null) continue;            // CO, Pb, and anything unmapped
    acc.subs.set(pol, { sub, conc, unit: r.unit ?? 'µg/m³' });
  }

  const out: Station[] = [];
  for (const [station, acc] of by) {
    if (!acc.subs.size) continue;
    let gov = '', top = -1;
    for (const [pol, v] of acc.subs) if (v.sub > top) { top = v.sub; gov = pol; }
    const v = acc.subs.get(gov)!;
    out.push({ station, aqi: top, band: bandFor(top), governing: gov,
      conc: v.conc, unit: v.unit, lat: acc.lat, lng: acc.lng,
      observed: observedLabel(acc.stamp) });
  }
  return out.sort((a, b) => b.aqi - a.aqi);
}

/** Great-circle distance in km. Used to say which monitor is nearest. */
export function km(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371, rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(bLat - aLat), dLng = rad(bLng - aLng);
  const x = Math.sin(dLat / 2) ** 2
    + Math.cos(rad(aLat)) * Math.cos(rad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}
