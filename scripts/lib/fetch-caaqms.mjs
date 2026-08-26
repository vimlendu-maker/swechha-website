/* THE SOURCE THAT IS ACTUALLY CURRENT — CPCB's own CAAQMS live feed. (AD-44)
   ───────────────────────────────────────────────────────────────────────────
   Everything this site publishes about air came through data.gov.in resource
   3b01bcb8 — a MIRROR of CPCB's data, and a mirror that lags. Measured
   26 August 2026 at 12:04 IST: the mirror was still serving the 02:00 IST
   observation, TEN HOURS old, while CPCB's own feed at

     https://airquality.cpcb.gov.in/caaqms/rss_feed

   was serving 12:00 IST — one observation hour behind the clock, which is as
   current as CPCB gets. The feed is public, keyless XML, ~375KB, 501 stations
   on the day it was measured. This module reads it. The mirror is now the
   FALLBACK, never a co-equal: one run is served entirely by one source, named
   in the output as `served_by`, and the two are never averaged or mixed.

   ★★ THE SEMANTICS ARE IDENTICAL TO THE MIRROR, AND THAT IS PROVEN, NOT
   ASSUMED. Min/Max/Avg on each <Pollutant_Index> are CPCB's 24-hour
   SUB-INDEXES per pollutant — the index itself, NOT concentrations. This is
   the same data the mirror copies (same numbers, same "NA"s, same station
   names, same "DD-MM-YYYY HH:MM:SS" stamps), verified station-by-station on
   26 August 2026: Anand Vihar's <Air_Quality_Index Value="165"
   Predominant_Parameter="PM10"/> equals its worst Avg sub-index exactly, and
   across all 478 stations publishing a Value that day, ZERO disagreed with
   the worst-Avg rule by more than CPCB's rounding. NEVER run these values
   through the breakpoint table — that is the AD-42 double conversion, the one
   that published doubled numbers for eleven weeks.

   ★ THE FEED CARRIES ITS OWN TRIPWIRE, WHICH THE MIRROR NEVER DID.
   <Air_Quality_Index> is CPCB's OWN computed station AQI. If our parse of a
   station's channels stops agreeing with CPCB's own maximum, the parser has
   drifted — `integrityCheck()` below measures exactly that, per station, on
   every fetch. The AD-42 bug would have tripped it instantly: doubled values
   disagree with CPCB's Value at essentially every station.

   TLS QUIRK, MEASURED 26 AUGUST 2026: the server's chain includes a
   cross-signed eMudhra intermediate that breaks Node/undici's certificate
   path-building — native fetch() fails with "self-signed certificate in
   certificate chain" — while curl and system openssl verify the same chain
   fine (the root is Comodo "AAA Certificate Services"). So every script-side
   fetch of this feed goes through fetchUpstream() (scripts/lib/fetch-cpcb.mjs):
   native fetch first, curl -4 fallback. From machines where undici chokes on
   the chain, curl carries it. On Vercel — where there is no curl — the
   server-route caller in lib/air.ts treats a TLS failure as an ordinary
   fallback to the mirror, never as an error.

   WHY NO XML DEPENDENCY. The feed is machine-generated and rigidly regular:
   one <Country>, <State>/<City> elements (self-closing when empty — two empty
   states on the measured day), <Station> blocks with attribute-only children,
   attributes always double-quoted. A careful regex walk over that shape is
   ~60 lines; an XML library is a supply-chain dependency this repo has zero
   of and does not need for a format this fixed. The walk still handles the
   real hazards: XML entities in names (&amp; and friends — decoded below),
   "NA" values, EMPTY Value="" on <Air_Quality_Index> (seen live at Chittoor),
   missing attributes, missing <Air_Quality_Index> elements, and self-closing
   State/City/Station tags. If CPCB ever changes the format, the sanity gates
   in the callers (station count, stamp, integrity) refuse the parse and the
   mirror serves — the failure mode is the fallback, not a wrong page. */
import { fetchUpstream } from './fetch-cpcb.mjs';

export const CAAQMS_URL = 'https://airquality.cpcb.gov.in/caaqms/rss_feed';

/** The provenance strings callers write into `source.served_by`, so every
    output file names its source with the same words. */
export const SERVED_BY_CAAQMS =
  'CPCB CAAQMS live feed (airquality.cpcb.gov.in/caaqms/rss_feed)';
export const SERVED_BY_MIRROR = 'data.gov.in mirror (resource 3b01bcb8)';

/* Decode the five named XML entities plus numeric references. The feed's
   station names are user-hostile strings like "Knowledge Park - III, Greater
   Noida - UPPCB" and can legally carry &amp; — an undecoded name would fail
   to match the mirror's spelling of the same station, silently splitting one
   station into two. */
const NAMED = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
function decodeEntities(s) {
  return s.replace(/&(amp|lt|gt|quot|apos|#[0-9]+|#x[0-9a-fA-F]+);/g, (whole, e) => {
    if (NAMED[e]) return NAMED[e];
    const n = e[1] === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
    return Number.isFinite(n) ? String.fromCodePoint(n) : whole;
  });
}

/** `id="PM2.5" Min="74"` -> { id: 'PM2.5', Min: '74' }, entities decoded. */
function attrsOf(s) {
  const out = {};
  for (const m of s.matchAll(/([\w.]+)="([^"]*)"/g)) out[m[1]] = decodeEntities(m[2]);
  return out;
}

/** Missing attribute, empty string and "NA" all normalise to the mirror's
    "NA" spelling, because that is what every downstream `num()` already
    understands. Everything else passes through as the string it arrived as. */
const val = (v) => {
  const s = String(v ?? '').trim();
  return s === '' ? 'NA' : s;
};

/**
 * Parse the CAAQMS XML into EXACTLY the row shape the data.gov.in mirror
 * serves — `{ country, state, city, station, last_update, latitude,
 * longitude, pollutant_id, min_value, max_value, avg_value }`, all strings,
 * "NA" preserved, `last_update` in the feed's own "DD-MM-YYYY HH:MM:SS" —
 * so every consumer downstream of the mirror consumes this without change.
 *
 * Returns:
 *   rows         mirror-shape rows, one per (station, pollutant) channel
 *   stationAqi   CPCB's OWN computed AQI per station where it published one:
 *                { [station]: { aqi: number, pollutant: string|null } } —
 *                the integrity tripwire; empty/"NA" Values are skipped
 *   stamps       the distinct `lastupdate` strings seen, as published
 *   stationCount how many <Station> blocks were parsed (gates read this,
 *                because a station whose channels are all NA emits no rows)
 */
export function parseCaaqms(xml) {
  /** @type {Record<string, string>[]} */
  const rows = [];
  /** @type {Record<string, { aqi: number, pollutant: string | null }>} */
  const stationAqi = {};
  /** @type {Set<string>} */
  const stamps = new Set();
  let stationCount = 0;
  const country = decodeEntities(/<Country id="([^"]*)"/.exec(xml)?.[1] ?? 'India');

  // Each level matches BOTH the self-closing form (an empty state really does
  // arrive as <State id="Andaman and Nicobar"/>) and the open form.
  const stateRe = /<State id="([^"]*)"\s*(?:\/>|>([\s\S]*?)<\/State>)/g;
  const cityRe = /<City id="([^"]*)"\s*(?:\/>|>([\s\S]*?)<\/City>)/g;
  const stationRe = /<Station\s([^>]*?)(?:\/>|>([\s\S]*?)<\/Station>)/g;

  for (const st of xml.matchAll(stateRe)) {
    const state = decodeEntities(st[1]);
    for (const ct of (st[2] ?? '').matchAll(cityRe)) {
      const city = decodeEntities(ct[1]);
      for (const sn of (ct[2] ?? '').matchAll(stationRe)) {
        stationCount++;
        const a = attrsOf(sn[1]);
        const station = a.id ?? '';
        const body = sn[2] ?? '';
        if (!station) continue;
        if (a.lastupdate) stamps.add(a.lastupdate);
        for (const p of body.matchAll(/<Pollutant_Index\s([^>]*?)\/>/g)) {
          const pa = attrsOf(p[1]);
          rows.push({
            country, state, city, station,
            last_update: val(a.lastupdate),
            latitude: val(a.latitude),
            longitude: val(a.longitude),
            pollutant_id: val(pa.id),
            min_value: val(pa.Min),
            max_value: val(pa.Max),
            avg_value: val(pa.Avg),
          });
        }
        // CPCB's own station AQI. Value="" and Value="NA" both occur live
        // (Chittoor published an empty Value on the day this was measured);
        // neither is a number and neither goes in the map.
        const q = /<Air_Quality_Index\s([^>]*?)\/>/.exec(body);
        if (q) {
          const qa = attrsOf(q[1]);
          const v = Number(String(qa.Value ?? '').trim());
          if (String(qa.Value ?? '').trim() !== '' && Number.isFinite(v)) {
            stationAqi[station] = {
              aqi: v,
              pollutant: String(qa.Predominant_Parameter ?? '').trim() || null,
            };
          }
        }
      }
    }
  }
  return { rows, stationAqi, stamps: [...stamps], stationCount };
}

/** '26-08-2026 12:00:00' -> parts, by FIELD. Never new Date(string): the
    stamp is IST wall-clock text and must not be shifted through a timezone.
    Same rule and same regex as fetch-air.mjs and lib/air.ts's observedLabel. */
export function parseStamp(s) {
  const m = /^(\d{2})-(\d{2})-(\d{4})\s+(\d{2}):(\d{2})/.exec(String(s ?? '').trim());
  if (!m) return null;
  const [, dd, mm, yyyy, hh, mi] = m;
  return { y: +yyyy, m: +mm, d: +dd, hh: +hh, mi: +mi, raw: s };
}

/**
 * Which of two "DD-MM-YYYY HH:MM:SS" stamps is newer? Compared field by
 * field — never via Date. Returns 'a', 'b', or 'tie'; an unparseable side
 * loses to a parseable one, and two unparseable sides tie.
 *
 * This is the safety net of AD-44's source selection: if both sources answer,
 * the FRESHER observation serves. In practice CAAQMS is always fresher (it is
 * the thing the mirror lags behind); the comparison exists so that an odd day
 * where it is not cannot make the site less current than it was before AD-44.
 */
export function newerStamp(a, b) {
  const pa = parseStamp(a), pb = parseStamp(b);
  if (!pa && !pb) return 'tie';
  if (!pa) return 'b';
  if (!pb) return 'a';
  for (const k of ['y', 'm', 'd', 'hh', 'mi']) {
    if (pa[k] !== pb[k]) return pa[k] > pb[k] ? 'a' : 'b';
  }
  return 'tie';
}

/**
 * THE PER-STATION INTEGRITY GATE — the station-level sibling of the daily
 * bulletin gate in verify-air-crosscheck.mjs, and new capability: the mirror
 * never carried CPCB's own per-station AQI, so this check could not exist
 * before AD-44.
 *
 * For every station where CPCB published <Air_Quality_Index Value>, compare
 * OUR worst-Avg-sub-index against THEIR Value. Tolerance ±1 (their rounding).
 * If more than 2% of comparable stations disagree by more, the parser has
 * drifted from the feed and the caller must REFUSE this data and fall back to
 * the mirror. Measured 26 August 2026: 478 comparable stations, 0 mismatches.
 *
 * ★ IT WOULD HAVE CAUGHT AD-42 INSTANTLY. The double conversion published
 * roughly 2x CPCB's numbers; 2x disagrees with CPCB's own Value at virtually
 * every station, and this gate trips at 2%. The test suite proves that on a
 * doubled copy of the committed fixture.
 *
 * ★ RAW MAXIMA, BEFORE THE STUCK-DROP — this is deliberate and load-bearing.
 * Our pipeline drops stuck channels (lib/air.ts `isStuck`, transcribed into
 * the fetch scripts) and CPCB does not, so at a station where a stuck channel
 * is the maximum, our PUBLISHED AQI legitimately differs from CPCB's own.
 * Comparing post-filter values would flag our POLICY as parser drift. The
 * gate exists to measure parser FIDELITY — did we read the channels CPCB
 * wrote — so it takes the maximum over every numeric Avg, stuck or not.
 */
/**
 * @param {Record<string, string>[]} rows
 * @param {Record<string, { aqi: number, pollutant: string | null }>} stationAqi
 * @param {{ tolerance?: number, maxMismatchRate?: number }} [opts]
 */
export function integrityCheck(rows, stationAqi, { tolerance = 1, maxMismatchRate = 0.02 } = {}) {
  /** @type {Map<string, number>} */
  const worst = new Map(); // station -> max numeric avg_value, raw
  for (const r of rows) {
    const s = String(r.avg_value ?? '').trim();
    if (s === '' || s === 'NA' || s === '-') continue;
    const n = Number(s);
    if (!Number.isFinite(n)) continue;
    if (!worst.has(r.station) || n > worst.get(r.station)) worst.set(r.station, n);
  }
  let comparable = 0, mismatched = 0;
  const examples = [];
  for (const [station, own] of Object.entries(stationAqi)) {
    const ours = worst.get(station);
    if (ours === undefined) continue; // CPCB published an AQI over channels we saw as all-NA
    comparable++;
    if (Math.abs(ours - own.aqi) > tolerance) {
      mismatched++;
      if (examples.length < 5) {
        examples.push(`${station}: ours ${ours} vs CPCB's own ${own.aqi} (${own.pollutant ?? '?'})`);
      }
    }
  }
  const rate = comparable ? mismatched / comparable : 1;
  return { comparable, mismatched, rate, ok: comparable > 0 && rate <= maxMismatchRate, examples };
}

/**
 * Fetch and parse the live feed. Throws on transport failure or non-2xx —
 * callers treat a throw as "CAAQMS was silent" and fall back to the mirror.
 * Sanity of the CONTENT is the caller's job via assessCaaqms(), because the
 * thresholds differ by use (national vs Delhi-filtered).
 */
export async function fetchCaaqms({ timeoutMs = 60000 } = {}) {
  const res = await fetchUpstream(CAAQMS_URL, { timeoutMs });
  if (!res.ok) throw new Error(`CAAQMS HTTP ${res.status}`);
  return parseCaaqms(await res.text());
}

/**
 * The gates a CAAQMS parse must pass before it is trusted over the mirror.
 * Returns { ok: true, integrity } or { ok: false, why, kind, integrity? }.
 *
 *   kind 'thin'      too few stations — an upstream serving a partial feed;
 *                    not our defect, fall back quietly
 *   kind 'stamp'     no parseable observation stamp — same
 *   kind 'integrity' the per-station gate tripped — OUR parser may have
 *                    drifted; fall back AND say so loudly, because unlike the
 *                    other two this one is potentially this repo's bug
 *
 * `minStations` is ≥300 for the national use (the feed carried 501 on the day
 * it was measured; 300 tolerates outages without accepting a stub) and ≥35
 * for a Delhi-filtered use (Delhi carried 44), passed by the caller.
 */
export function assessCaaqms(parsed, { minStations = 300 } = {}) {
  if (parsed.stationCount < minStations) {
    return {
      ok: false, kind: 'thin',
      why: `only ${parsed.stationCount} stations parsed (needs ≥${minStations}) — partial or reshaped feed`,
    };
  }
  if (!parsed.stamps.some((s) => parseStamp(s))) {
    return { ok: false, kind: 'stamp', why: 'no parseable lastupdate stamp in the feed' };
  }
  const integrity = integrityCheck(parsed.rows, parsed.stationAqi);
  if (!integrity.ok) {
    return {
      ok: false, kind: 'integrity', integrity,
      why: `per-station integrity gate FAILED: ${integrity.mismatched} of ${integrity.comparable} `
        + `stations disagree with CPCB's own <Air_Quality_Index> by more than ±1 `
        + `(${(integrity.rate * 100).toFixed(1)}% > 2%). The parser has drifted — refusing this data. `
        + `Examples: ${integrity.examples.join('; ')}`,
    };
  }
  return { ok: true, integrity };
}

/** The newest parseable stamp in a parse — what freshness is compared on. */
export function newestStamp(stamps) {
  let best = null;
  for (const s of stamps) {
    if (!parseStamp(s)) continue;
    if (best === null || newerStamp(s, best) === 'a') best = s;
  }
  return best;
}
