/**
 * GET /api/ward — every Delhi monitor, right now, so a reader can find the one
 * that describes their air.
 *
 * WHY THIS IS A MONITOR PICKER AND NOT A PINCODE BOX.
 * The page originally promised "pick the ward you live in". It cannot honestly
 * deliver that, and the reason is worth stating rather than hiding:
 *
 *   India Post's own All India Pincode Directory on data.gov.in publishes 562
 *   post offices for Delhi and NO latitude or longitude column at all.
 *
 * So there is no official, checkable way to turn a Delhi pincode into a point
 * on the ground. The alternatives were a third-party centroid file of unknown
 * provenance, or asking the reader for the thing that actually matters. On a
 * page whose entire argument is that a number needs a source, importing an
 * unsourced geography to power the one interactive feature would have been the
 * page contradicting itself.
 *
 * And a monitor is the better question anyway. This page's own finding is that
 * two monitors 3.9 km apart read 392 and 110 — so "which pincode" is a worse
 * predictor of your air than "which monitor", and the monitor is the thing that
 * produces the number an alert would be about.
 *
 * ★ NO PERSONAL DATA IN, NOTHING STORED. This route is a read. It takes no
 * identifier, sets no cookie, and logs nothing about who asked.
 */
import { NextResponse } from 'next/server';
import { fetchDelhiLive, foldStations, selfCheck, km, AQI_LIMIT } from '@/lib/air';

/* ── RUN THIS FUNCTION IN MUMBAI — A-44.12 ─────────────────────────────────
   Vercel's default region is iad1 (US-East). From there, the production
   ladder recorded `caaqms+ca: timed out after 12000ms` — twelve seconds of
   pure silence from airquality.cpcb.gov.in, an Indian government host that
   throttles or drops far-away cloud egress. The same request completes in
   ~100ms from a machine near the source. bom1 puts the function next to BOTH
   the data source and this site's actual readers. If the plan does not honor
   preferredRegion, Vercel ignores it and the ladder's mirror fallback keeps
   the route correct — this line can only help.
   /api/ward/subscribe deliberately does NOT move: it writes to Neon, whose
   region we have not pinned down, and its CPCB use (validating a station
   name) is served fine by the mirror. */
export const preferredRegion = 'bom1';
export const maxDuration = 30;
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  if (!selfCheck()) {
    return NextResponse.json(
      { ok: false, reason: 'breakpoint self-check failed — refusing to publish a computed index' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } },
    );
  }
  const key = process.env.DATA_GOV_IN_KEY;
  if (!key) {
    return NextResponse.json(
      { ok: false, reason: 'no server-side key configured', stations: null },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  /* CAAQMS FIRST, MIRROR FALLBACK — AD-44 addendum. This route is the one a
     reader consults to find THEIR monitor, so freshness matters here most of
     all: the mirror lags CPCB by up to ten measured hours. fetchDelhiLive
     climbs the same ladder as /api/air (CA-pinned CAAQMS, plain-fetch CAAQMS,
     then the mirror) and the rows come back in the identical shape, so
     nothing below this line changed. */
  let stations, servedBy;
  try {
    const live = await fetchDelhiLive(key);
    stations = foldStations(live.rows);
    servedBy = live.servedBy;
  } catch (e) {
    // NULL, NEVER AN EMPTY LIST. An empty list would render as "no monitors".
    return NextResponse.json(
      { ok: false, reason: e instanceof Error ? e.message : 'fetch failed', stations: null },
      { status: 502, headers: { 'Cache-Control': 'no-store' } },
    );
  }
  if (!stations.length) {
    return NextResponse.json(
      { ok: false, reason: 'no station produced a computable sub-index', stations: null },
      { status: 502, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  /* For each monitor: how far is the NEXT nearest one? That number is the
     honest width of what a single monitor can claim to describe, and it is the
     reason this feature asks which monitor rather than which pincode. */
  const withCoords = stations.filter((s) => s.lat !== null && s.lng !== null);
  const enriched = stations.map((s) => {
    let nearest: { station: string; km: number } | null = null;
    if (s.lat !== null && s.lng !== null) {
      for (const t of withCoords) {
        if (t.station === s.station) continue;
        const d = km(s.lat, s.lng, t.lat!, t.lng!);
        if (!nearest || d < nearest.km) nearest = { station: t.station, km: +d.toFixed(1) };
      }
    }
    return {
      ...s,
      // A short label for the search box: CPCB writes "Anand Vihar, Delhi - DPCC".
      label: s.station.replace(/,\s*Delhi\s*-\s*/, ' · ').replace(/,\s*Delhi$/, ''),
      overLimit: s.aqi > AQI_LIMIT,
      nextNearest: nearest,
    };
  });

  return NextResponse.json({
    ok: true,
    state: 'LIVE',
    aqiLimit: AQI_LIMIT,
    observed: stations[0]?.observed ?? null,
    observed_note: 'CPCB advances the whole city one hour at a time, so every station here shares one observation time.',
    totals: {
      stations: enriched.length,
      above_limit: enriched.filter((s) => s.overLimit).length,
      with_coordinates: withCoords.length,
    },
    derivation: 'Read from CPCB\'s published per-pollutant sub-indexes — the feed carries the '
      + 'index, not concentrations, and nothing here recomputes it. A station\'s AQI is its '
      + 'worst sub-index, never the mean. Any concentration shown is implied back from that '
      + 'sub-index, not measured.',
    why_not_pincode: 'India Post\'s All India Pincode Directory on data.gov.in lists 562 Delhi post '
      + 'offices and carries no latitude or longitude column, so a pincode cannot be turned into a '
      + 'point on the ground from an official source. This page asks which monitor instead — which is '
      + 'also the better question, since two Delhi monitors 3.9 km apart read 225 and 72.',
    stations: enriched,
    /* Which source ACTUALLY answered — the CAAQMS live feed normally, the
       data.gov.in mirror when the feed failed its gates or its TLS. */
    source: { name: 'Central Pollution Control Board', served_by: servedBy },
    fetchedAt: new Date().toISOString(),
  }, { headers: { 'Cache-Control': 'no-store' } });
}
