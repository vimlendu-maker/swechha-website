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
 * Both are printed. The value genuinely moves between observations, but the
 * badge must never stand in for "observed 13:00, an hour ago". The page prints
 * the age beside the badge, always — and that matters more than it reads:
 * measured 25 August 2026 at 13:59 IST, the feed was still serving 05:00 IST
 * nationwide. LIVE has never meant "now", and here it means it less than usual.
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
 * ★ THE AQI IS READ, NOT COMPUTED — the correction of 25 August 2026. The feed
 * publishes CPCB's own sub-indexes; this route used to convert them a second
 * time and published Delhi at 381 against CPCB's own 97. It also published the
 * WORST STATION as the city. Both are fixed in lib/air.ts, so this route and
 * /api/ward cannot disagree about the same station. See the header there.
 */
import { NextResponse } from 'next/server';
import { fetchDelhiLive, foldStations, worstStation, cityMean, bandFor, selfCheck, AQI_LIMIT } from '@/lib/air';

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

  /* CAAQMS FIRST, MIRROR FALLBACK — AD-44. The mirror lags CPCB's own
     publication by up to ten measured hours, which broke this route's whole
     purpose: it could serve a 02:00 observation while the committed page
     showed 12:00, so the chip-confirm never confirmed a FRESH page. CPCB's
     own live feed is one hour old; `fetchDelhiLive` tries it first and falls
     back to the mirror on ANY failure (including this host's TLS quirk on
     undici — a cert failure here is an ordinary fallback, never an error
     response). `servedBy` names which source actually answered. */
  let stations, servedBy;
  try {
    const live = await fetchDelhiLive(key);
    stations = foldStations(live.rows);
    servedBy = live.servedBy;
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'fetch failed', 502);
  }
  if (!stations.length) return fail('no station reported a sub-index', 502);

  /* THE READING IS THE WORST MONITOR, AND IT SAYS SO — AD-42C.
     Two different mislabellings have to be kept apart here. Until 25 August
     2026 this route ran the feed's sub-indexes through the breakpoint table a
     second time and published a DOUBLED number (381 on a day CPCB published
     97); AD-42 fixed that arithmetic and, separately, replaced the worst
     station with the mean of the 44. The owner reversed the second half: this
     site is about limits being broken at named places, and the mean averages
     away the place where the limit is broken worst.
     So the worst monitor is the reading again — but `scope` says 'worst-monitor',
     the station and the count travel with it, and no field here is called
     "Delhi's AQI". `cityMean` is still computed and still returned, as the
     CPCB-comparable number and as the tripwire that would show the double
     conversion coming back. */
  const worst = worstStation(stations);
  const mean = cityMean(stations);
  if (!worst || mean === null) return fail('no station reported a sub-index', 502);
  const above = stations.filter((s) => s.aqi > AQI_LIMIT).length;

  return NextResponse.json({
    ok: true,
    state: 'LIVE',
    reading: {
      scope: 'worst-monitor',
      city: 'Delhi',
      station: worst.station,
      aqi: worst.aqi,
      band: worst.band,
      governing: worst.governing,
      conc: worst.conc,
      concBasis: worst.concBasis,
      unit: worst.unit,
      selectedFrom: stations.length,
      observed: worst.observed,
    },
    /* NOT the headline, and not printed as one. Kept so the page can say what
       CPCB says beside what we say, and so a drift between the two is visible
       rather than silent. */
    cityMean: { scope: 'city', aqi: mean, band: bandFor(mean), stations: stations.length,
      method: 'mean of station sub-index maxima (unweighted; CPCB weights by 2km-grid population)' },
    spread: { stations: stations.length, above_limit: above },
    aqiLimit: AQI_LIMIT,
    derivation: 'Read from CPCB\'s published per-pollutant sub-indexes — the feed carries '
      + 'the index, not concentrations, and nothing here recomputes it. A station\'s AQI is '
      + 'its worst sub-index, and the reading above is the WORST MONITOR of those reporting, '
      + 'named — not a city average. CPCB\'s own city figure is the mean of the stations and '
      + 'is given separately as cityMean. Any concentration shown is implied back from the '
      + 'sub-index, not measured.',
    /* `served_by` states which source ACTUALLY answered this request — the
       CAAQMS live feed on the normal path, the data.gov.in mirror when the
       feed failed its gates or its TLS. Never both; never mixed. */
    source: { name: 'Central Pollution Control Board', served_by: servedBy },
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
