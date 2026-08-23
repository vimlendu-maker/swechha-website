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
 * Both are printed. CPCB updates hourly — verified: 10:00, 12:00 and 13:00 IST
 * on 21 August 2026 returned 392, 388 and 389 — so the value genuinely moves,
 * but the badge must never stand in for "observed 13:00, an hour ago". The page
 * prints the age beside the badge, always.
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
 * The AQI is COMPUTED, not read — the feed publishes concentrations and no
 * index. The breakpoint table, the CO exclusion and the worst-sub-index rule
 * all live in lib/air.ts so this route and /api/ward cannot disagree about the
 * same station.
 */
import { NextResponse } from 'next/server';
import { fetchDelhi, foldStations, selfCheck, AQI_LIMIT } from '@/lib/air';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  if (!selfCheck()) {
    return fail('breakpoint self-check failed — refusing to publish a computed index', 500);
  }
  const key = process.env.DATA_GOV_IN_KEY;
  if (!key) {
    // Not an error the reader caused, and not a zero. The page keeps its
    // committed reading and stays PERIODIC.
    return fail('no server-side key configured', 503);
  }

  let stations;
  try {
    stations = foldStations(await fetchDelhi(key));
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'fetch failed', 502);
  }
  if (!stations.length) return fail('no station produced a computable sub-index', 502);

  // foldStations sorts worst-first, and a CITY's AQI is its worst STATION —
  // the same rule one level up. Never an average, at either level.
  const worst = stations[0];
  const above = stations.filter((s) => s.aqi > AQI_LIMIT).length;

  return NextResponse.json({
    ok: true,
    state: 'LIVE',
    reading: {
      station: worst.station,
      aqi: worst.aqi,
      band: worst.band,
      governing: worst.governing,
      conc: worst.conc,
      unit: worst.unit,
      observed: worst.observed,
    },
    spread: { stations: stations.length, above_limit: above },
    aqiLimit: AQI_LIMIT,
    derivation: 'Computed from CPCB concentrations using CPCB\'s National AQI breakpoints. '
      + 'Station AQI is the worst sub-index; city AQI is the worst station. CO and Pb excluded.',
    source: { name: 'CPCB via data.gov.in', resource: '3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69' },
    fetchedAt: new Date().toISOString(),
    /* THE SUCCESS PATH IS CACHED AT THE EDGE (AD-27.6 clause 7, kept and
       re-justified by AD-27.6-A).
       Clause 7 was written to shrink the window between the committed reading
       and the live one, because that window was the flash. There is no such
       window now: AD-27.6-A made the numeral a build artefact that nothing
       repaints, and this route's only remaining job on those two pages is to
       CONFIRM the chip — the homepage and /now/air flip PERIODIC to LIVE only
       if the reading here is the same number the page is already showing, from
       an observation inside two hours.
       The header stays, for the reasons that never depended on the flash: an
       HOURLY feed does not need a per-request upstream call, a ~20ms edge hit
       instead of a 300-2000ms round trip is the difference between a chip that
       resolves before the reader looks at it and one that does not, and it
       takes most of data.gov.in's measured flakiness out of the reader's path
       (D-21.5 recorded three consecutive calls returning 200, 200, 502).
       It also matters more than it used to: a confirmation that misses the
       6-second deadline leaves an accurate page reading PERIODIC when it could
       honestly read LIVE.
       300s fresh / 3300s stale-while-revalidate = one hour total, which is the
       feed's own cadence, so no reader is served a value from a previous
       observation hour without a revalidation already in flight.
       ONLY THE SUCCESS PATH IS CACHED. fail() keeps no-store below: a 503
       because a key is missing must not be held at the edge for five minutes
       after the key is set. And /api/ward* keeps no-store unconditionally —
       those are per-reader. */
  }, { headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=3300' } });
}

function fail(reason: string, status: number) {
  // NO reading, NO zero, NO empty string that could be printed as a number.
  return NextResponse.json(
    { ok: false, state: 'PERIODIC', reason, reading: null },
    { status, headers: { 'Cache-Control': 'no-store' } },
  );
}
