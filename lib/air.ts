/**
 * lib/air.ts — CPCB's National AQI, read (not recomputed) in one place.
 *
 * WHY THIS FILE EXISTS. Two routes need the same number: /api/air prints the
 * city reading in the hero, and /api/ward prints a per-station reading so a
 * reader can find the monitor that covers them. Deriving it twice would mean
 * two tables, and a page that disagrees with itself about the air is worse than
 * a page with one fewer feature.
 *
 * ★★ THE FEED ALREADY PUBLISHES THE INDEX. Read the resource's title: "Real
 * time AIR QUALITY INDEX from various locations". `avg_value` is CPCB's own
 * 24-hour SUB-INDEX for that pollutant at that station — not a concentration.
 * From 21 August 2026 this file read it as µg/m³ and pushed it through the CPCB
 * breakpoint table a SECOND time, which roughly doubled every number the site
 * printed. On 25 August the site showed Delhi at 381 "Very Poor" while CPCB
 * itself published 97 "Satisfactory", and Anand Vihar at 381 against CPCB's own
 * 177. Verified field by field against CPCB's Central Control Room panel: the
 * feed's PM2.5 MIN of 67 is CPCB's PM2.5 sub-index MIN of 67, to the unit.
 *
 *   NEVER CONVERT `avg_value`. It is the answer, not the input.
 *
 * That is also why `subIndex()` is gone rather than merely unused: the only
 * reliable way to stop a conversion being reintroduced is to delete the
 * function that performs it. The table survives in the INVERSE direction only.
 *
 * ★ A CITY IS THE MEAN OF ITS STATIONS. A station is its worst sub-index —
 * CPCB's rule, and unchanged. But a city is the average, which is CPCB's rule
 * too and which this file previously contradicted. Tested against CPCB's own
 * published figures for 73 cities: mean-of-stations scored MAE 9.1 with zero
 * bias and a ratio of 1.00; worst-station scored MAE 21.1 with +15.7 bias.
 * CPCB weights that mean by the population of each station's 2km grid square.
 * We have no such grid, so this is the unweighted mean, and the page says so.
 *
 * ★ CO IS IN. It was excluded because its values were "not credible" as mg/m³
 * or µg/m³ — correct, because they were never concentrations. CO 128 is a
 * perfectly ordinary sub-index, and at six Delhi stations CO is the worst one.
 * Excluding it was a consequence of the same misreading.
 *
 * ★ AN ERROR IS NOT A ZERO. `fetchDelhi()` either returns rows or throws. It
 * never returns an empty array that a caller could read as clean air, and
 * `worstStation()` / `cityMean()` return null rather than 0 for an empty list.
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

/**
 * CPCB's breakpoint table — kept ONLY to run backwards, turning a published
 * sub-index into the concentration that must have produced it. The bounds are
 * inclusive integers (…30 / 31…), not shared edges, because CPCB's own worked
 * example puts PM2.5 31 µg/m³ at sub-index 51 and a shared-edge table returns
 * 52. CO is in mg/m³; everything else is µg/m³.
 */
const BP: Record<string, [number, number][]> = {
  'PM10': [[0, 50], [51, 100], [101, 250], [251, 350], [351, 430], [431, 600]],
  'PM2.5': [[0, 30], [31, 60], [61, 90], [91, 120], [121, 250], [251, 380]],
  'NO2': [[0, 40], [41, 80], [81, 180], [181, 280], [281, 400], [401, 600]],
  'OZONE': [[0, 50], [51, 100], [101, 168], [169, 208], [209, 748], [749, 1000]],
  'SO2': [[0, 40], [41, 80], [81, 380], [381, 800], [801, 1600], [1601, 2400]],
  'NH3': [[0, 200], [201, 400], [401, 800], [801, 1200], [1201, 1800], [1801, 2400]],
  'CO': [[0, 1], [1.1, 2], [2.1, 10], [10.1, 17], [17.1, 34], [34.1, 50]],
};

const ALIAS: Record<string, string> = {
  'PM2.5': 'PM2.5', 'PM10': 'PM10', 'NO2': 'NO2', 'SO2': 'SO2',
  'OZONE': 'OZONE', 'O3': 'OZONE', 'NH3': 'NH3', 'CO': 'CO',
};

/** CPCB states CO in mg/m³ and every other pollutant in µg/m³. */
export const unitFor = (pollutant: string): string =>
  pollutant === 'CO' ? 'mg/m³' : 'µg/m³';

/**
 * The concentration implied by a published sub-index.
 *
 * The feed carries no µg/m³ at all, so this is the only way the page can say
 * "against a limit of 60". The mapping is piecewise-linear and therefore
 * exactly invertible; the only loss is CPCB's rounding of the index to a whole
 * number, worth well under a µg/m³. It is IMPLIED, never measured, and every
 * caller must label it that way — see `Station.concBasis`.
 */
export function impliedConcentration(pollutant: string, sub: number): number | null {
  const bp = BP[pollutant];
  if (!bp || !Number.isFinite(sub) || sub < 0) return null;
  for (let i = 0; i < bp.length; i++) {
    const [bLo, bHi] = bp[i];
    const [iLo, iHi] = BANDS[i].idx;
    if (sub <= iHi) {
      const lo = i === 0 ? 0 : bLo;
      // One decimal. The inverse is exact, but printing 98.03030303030303 for a
      // figure whose input was rounded to a whole index claims a precision the
      // number does not have — and the page prints this straight.
      return Math.round((lo + ((sub - iLo) * (bHi - lo)) / (iHi - iLo)) * 10) / 10;
    }
  }
  return bp[bp.length - 1][1]; // above the top band; CPCB caps the index at 500
}

/**
 * Refuse to publish on a broken table. Checks the INVERSE, which is the only
 * direction this file uses — the previous self-check validated the forward
 * conversion, was correct, and stayed green for eleven weeks while the forward
 * conversion was the bug. A passing self-check is not a correct reading.
 */
export function selfCheck(): boolean {
  const near = (got: number | null, want: number) =>
    got !== null && Math.abs(got - want) < 0.05;
  return near(impliedConcentration('PM2.5', 51), 31)
    && near(impliedConcentration('PM2.5', 100), 60)
    && near(impliedConcentration('CO', 106), 2.5);
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

export type StationQuality = {
  /** Channels dropped as stuck instruments: min === max === avg over 24h. */
  flatlined: string[];
  /** Channels CPCB reports as NA, or does not report at all. */
  missing: string[];
  /** True when the reading stands on something we cannot corroborate. */
  suspect: boolean;
  suspectReason: string | null;
};

export type Station = {
  station: string;
  aqi: number;
  band: string;
  governing: string;
  /** IMPLIED from the sub-index, not measured — the feed carries no units. */
  conc: number | null;
  concBasis: 'implied-from-subindex';
  unit: string;
  lat: number | null;
  lng: number | null;
  observed: string | null;
  quality: StationQuality;
};

/** The channels CPCB's CAAQMS stations are expected to report. */
const EXPECTED = ['PM2.5', 'PM10', 'NO2', 'SO2', 'OZONE', 'NH3', 'CO'];
const GASES = new Set(['OZONE', 'CO', 'NO2', 'SO2', 'NH3']);

const RESOURCE = '3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69';

/**
 * Fetch Delhi's rows from CPCB via data.gov.in.
 *
 * `limit` AND `offset` are both required in practice — without `offset` the
 * endpoint answers HTTP 200 with an empty `records` array, which is the
 * error-as-zero trap this whole module is written against.
 *
 * ONE RETRY. Three consecutive calls during one build returned 200, 200, 502.
 * A source that fails twice in four seconds is down, and the caller should fall
 * back to its committed reading rather than wait.
 *
 * NOTE ON FRESHNESS: this feed lags. Measured 25 August 2026 at 13:59 IST, every
 * one of its 3,451 rows nationwide was still stamped 05:00 IST. The observation
 * time must always be printed beside the reading; it is not "now".
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
 * A station's AQI is its WORST SUB-INDEX, taken straight from `avg_value` with
 * NO conversion. That is CPCB's own definition — "the worst sub-index
 * determines the overall AQI" — and averaging would let a station with many
 * clean pollutants hide one far over the limit.
 *
 * Every pollutant the feed reports counts toward that maximum, including any
 * this file has no breakpoints for: the value is CPCB's sub-index whether or
 * not we can invert it. Only the implied concentration needs the table.
 */
export function foldStations(rows: Record<string, string>[]): Station[] {
  type Acc = { subs: Map<string, number>; flat: string[]; seen: Set<string>;
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
    const sub = num(r.avg_value ?? r.pollutant_avg);
    if (!by.has(st)) {
      by.set(st, { subs: new Map(), flat: [], seen: new Set(), stamp: r.last_update ?? null,
        lat: num(r.latitude), lng: num(r.longitude) });
    }
    const acc = by.get(st)!;
    // Coordinates arrive on every row; keep the first non-null we see.
    if (acc.lat === null) acc.lat = num(r.latitude);
    if (acc.lng === null) acc.lng = num(r.longitude);
    if (sub === null || sub < 0) continue;
    acc.seen.add(pol);

    /* ★ A FLATLINED CHANNEL IS A STUCK INSTRUMENT, NOT A READING.
       A channel that does not move across a 24-hour window is a sensor that
       has stopped, not air. See `isStuck` for the test and for why it is
       relative rather than absolute. Dropping these is safe where the stuck
       value is low, because a low channel never governed anyway. It matters
       where the value is high — which is exactly where it was missing. */
    const lo = num(r.min_value), hi = num(r.max_value);
    if (isStuck(lo, hi, sub)) {
      acc.flat.push(pol);
      continue;
    }
    acc.subs.set(pol, sub);
  }

  const out: Station[] = [];
  for (const [station, acc] of by) {
    // No live channel means no reading. Not a zero, not a clean bill of
    // health — three stations report nothing but frozen numbers, and one of
    // them is a city's only monitor. Publishing its "37, Good" would have
    // been a dead sensor quietly improving a city's average.
    if (!acc.subs.size) continue;
    let gov = '', top = -1;
    for (const [pol, sub] of acc.subs) if (sub > top) { top = sub; gov = pol; }

    const missing = EXPECTED.filter((p) => !acc.seen.has(p));
    const pm = Math.max(acc.subs.get('PM2.5') ?? -1, acc.subs.get('PM10') ?? -1);

    /* ★ FLAGGED, NOT DELETED. Leh ranked second in India at 195 on one ozone
       channel, beside a PM2.5 of 13 — and CPCB publishes the same number, so
       it is a bad reading faithfully repeated rather than our arithmetic.
       But high-altitude ozone is genuinely elevated (stratospheric intrusion,
       low NOx titration at 3,500m), so we cannot show it false, only that it
       stands alone. Deleting a government reading we merely mistrust would be
       this site doing the thing it exists to complain about. It is published
       with the doubt attached, and the page prints the doubt. */
    let suspectReason: string | null = null;
    if (GASES.has(gov) && top > AQI_LIMIT && pm >= 0 && pm < top / 2) {
      suspectReason = `Set by ${gov} alone: its sub-index is ${top} while the worst `
        + `particulate here reads ${pm}. A gas standing this far above clean particulates `
        + `is either a local source or an uncalibrated channel, and this feed cannot say which`
        + (acc.flat.length ? `. The ${acc.flat.join(', ')} channel at this station is flatlined` : '')
        + '.';
    }

    out.push({ station, aqi: top, band: bandFor(top), governing: gov,
      conc: impliedConcentration(gov, top), concBasis: 'implied-from-subindex',
      unit: unitFor(gov), lat: acc.lat, lng: acc.lng,
      observed: observedLabel(acc.stamp),
      quality: { flatlined: acc.flat, missing, suspect: suspectReason !== null, suspectReason } });
  }
  return out.sort((a, b) => b.aqi - a.aqi);
}

/**
 * IS THIS CHANNEL A STUCK INSTRUMENT? — AD-42D.
 *
 * The original test was `min === max === avg`: a perfectly frozen sensor. It
 * caught 228 of 3,219 rows (7.1%) and MISSED the one that mattered — Leh's CO
 * read min 187 / max 188 / avg 188, a ONE-POINT range across 24 hours, and put
 * Leh first in India above Delhi on the cleanest particulates in the country.
 * The same Navi Mumbai analyser that was caught frozen at exactly 101 on
 * 25 August escaped hours later reading 101–103. An instrument does not have
 * to be perfectly frozen to be broken; it only has to be stuck.
 *
 * ★ THE TEST IS RELATIVE, NOT ABSOLUTE. `max - min <= 2` would drop channels
 * that are simply LOW — Madurai's ozone at 5–6 is a real, varying measurement
 * of almost nothing, and dropping it would be inventing a fault. What marks a
 * stuck sensor is that it does not move RELATIVE to what it is reading.
 *
 * The threshold is 2% and it is read off the data, not chosen for looking
 * round. Across the 25 August feed the relative 24-hour range distributes:
 *
 *     0–1%   216 rows   6.7%   <- stuck
 *     1–2%     6 rows   0.2%   <- the trough
 *     2–5%    50 rows   1.6%
 *     5–10%  128 rows   4.0%
 *     ...    median real channel: 50%
 *
 * There is a genuine gap at 1–2%: real air and stopped sensors are two
 * populations, not one continuum, and the line goes in the empty space
 * between them. A channel that varies by less than 2% of its own value over
 * a day is not measuring the atmosphere.
 */
export function isStuck(min: number | null, max: number | null, avg: number | null): boolean {
  if (min === null || max === null || avg === null) return false;
  if (max < min) return false;              // malformed, not stuck
  if (max === 0) return min === 0;          // an all-zero channel is stuck
  return (max - min) / max < 0.02;
}

/**
 * THE HEADLINE READING: the WORST MONITOR, returned whole so its name travels
 * with its number.
 *
 * ★ OWNER'S RULING, 25 August 2026 (AD-42C), reversing AD-42's A-42.3.
 * AD-42 made the headline the mean of the stations, because the mean is what
 * CPCB publishes as "Delhi" and therefore what a reader checking us against
 * CPCB is checking. That is true, and it is not what this site is for: the
 * subject is limits being broken at real places, and the mean is precisely the
 * number that averages away the place where the limit is broken worst.
 *
 * ★ THE NAME IS NOT OPTIONAL. AD-42 was raised because a single monitor's
 * number was printed under the word "Delhi". Publishing the worst monitor again
 * is only honest if it is LABELLED as the worst monitor, with its station and
 * the count it was selected from. A bare number under a city's name is the same
 * defect whichever value it holds — which is why this returns the Station and
 * not an integer. Callers cannot print it without having the name to hand.
 *
 * Returns null, never 0, when nothing reported. `foldStations` already sorts
 * worst-first, but this does not rely on that.
 */
export function worstStation(stations: Station[]): Station | null {
  let worst: Station | null = null;
  for (const s of stations) if (!worst || s.aqi > worst.aqi) worst = s;
  return worst;
}

/**
 * The mean of the station AQIs — CPCB's own city definition.
 *
 * ★ COMPUTED, NOT PUBLISHED AS THE HEADLINE. This is the tripwire for the bug
 * AD-42 corrected. Read as sub-indexes, this mean tracks CPCB's published city
 * figure at a ratio of 1.00 across 73 cities; if the parser ever starts
 * double-converting again it diverges immediately and visibly. Keeping it costs
 * one reduce and is the only cheap check we have that the feed still means what
 * we think it means.
 *
 * Returns null, never 0, when there is nothing to average.
 */
export function cityMean(stations: Station[]): number | null {
  if (!stations.length) return null;
  return Math.round(stations.reduce((sum, s) => sum + s.aqi, 0) / stations.length);
}

/** Great-circle distance in km. Used to say which monitor is nearest. */
export function km(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371, rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(bLat - aLat), dLng = rad(bLng - aLng);
  const x = Math.sin(dLat / 2) ** 2
    + Math.cos(rad(aLat)) * Math.cos(rad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}
