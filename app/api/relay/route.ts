/**
 * GET /api/relay — the egress rung that runs where connectivity happens to be.
 *
 * WHY. On 26 August 2026, GitHub's runners lost TCP to BOTH CPCB-side data
 * hosts mid-afternoon — api.data.gov.in (which had served every hourly run
 * for days) and airquality.cpcb.gov.in (which never answered them at all) —
 * while Vercel's bom1 region, where this function runs, kept fetching the
 * mirror without a hiccup in the same minutes. The reachability of these
 * hosts from any given cloud CHANGES OVER TIME; this endpoint exists so the
 * fetch scripts can borrow this deployment's egress when their own dies,
 * instead of a laptop having to be on. See lib/relay.ts for the measured
 * matrix and the whitelist policy, and docs/design/2026-08-26-AD-45-egress-
 * relay.md for the decision record.
 *
 * ★ NOT AN OPEN PROXY. Callers name a whitelisted source (`src=`), never a
 * URL. Upstream URLs are built server-side from constants (lib/relay.ts's
 * planUpstream); the data.gov.in key comes from THIS deployment's env and
 * never crosses the relay boundary in either direction. No token — including
 * the unset-env case — is a 401.
 *
 * ★ THE CONTRACT WITH THE CALLING RUNG (scripts/lib/fetch-cpcb.mjs):
 * `x-relay-upstream-status` is present IF AND ONLY IF the upstream actually
 * answered, and then the response status and body are the upstream's own.
 * A response WITHOUT that header — a 401 here, a 404 from a deployment that
 * predates this route, an edge error page — is a failure of the RUNG, never
 * an answer from the source. That distinction is what keeps the callers'
 * exit-75 ("every source was silent") vs exit-1 ("a source answered wrongly")
 * split honest across the relay.
 *
 * ★ DEPLOY-ORDER TRAP, STATED SO NOBODY RE-TRIPS IT: this route exists in
 * production only AFTER the branch that adds it merges and deploys, but PR CI
 * runs BEFORE. Nothing in CI may depend on the relay answering — the callers
 * treat relay-404/relay-unreachable as one more failed rung, which is also
 * exactly what happens on any future day Vercel itself is the thing that is
 * down.
 */
import { NextResponse } from 'next/server';
import { caFetchText, CAAQMS_URL } from '@/lib/air';
import { bearerAuthorized, planUpstream, scrub } from '@/lib/relay';

/* Mumbai, like /api/air (A-44.12): next to the sources this relays. */
export const preferredRegion = 'bom1';
/* The bulletin is a multi-MB PDF behind a 302 on a slow host; the mirror's
   national set is a few MB. 60s is the ceiling worth paying for a rung whose
   callers time-bound themselves anyway. */
export const maxDuration = 60;
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_STORE = { 'Cache-Control': 'no-store' };

function refuse(status: number, reason: string) {
  // Deliberately NO x-relay-upstream-status: this is the relay speaking, not
  // the upstream, and the calling rung must be able to tell the two apart.
  return NextResponse.json({ ok: false, reason: scrub(reason) }, { status, headers: NO_STORE });
}

/** The upstream answered: pass its status and bytes through, labelled. */
function relayed(status: number, body: BodyInit, contentType: string) {
  return new NextResponse(body, {
    status,
    headers: {
      ...NO_STORE,
      'Content-Type': contentType,
      'x-relay-upstream-status': String(status),
    },
  });
}

export async function GET(req: Request) {
  if (!bearerAuthorized(req.headers.get('authorization'), process.env.AIR_RELAY_TOKEN)) {
    return refuse(401, 'unauthorized');
  }
  const plan = planUpstream(new URL(req.url).searchParams, process.env.DATA_GOV_IN_KEY);
  if (!plan.ok) return refuse(plan.status, plan.reason);

  if (plan.src === 'caaqms') {
    /* CA-PINNED FIRST — the same node:https path /api/air climbs (AD-44's
       A-44.11): this host's cross-signed eMudhra intermediate breaks undici's
       path-building, and Vercel has no curl. Plain fetch second, for the day
       the pinned bundle rots AND CPCB starts serving a chain undici accepts.
       caFetchText resolves only on 2xx, so a pinned-path success is a clean
       200 relay; any other outcome falls through to plain fetch, which
       carries real upstream statuses. */
    let pinnedWhy: string;
    try {
      const xml = await caFetchText(CAAQMS_URL, { timeoutMs: 20000 });
      return relayed(200, xml, plan.contentType);
    } catch (e) {
      pinnedWhy = e instanceof Error ? e.message : String(e);
    }
    try {
      const res = await fetch(CAAQMS_URL, { cache: 'no-store', signal: AbortSignal.timeout(20000) });
      return relayed(res.status, await res.arrayBuffer(), plan.contentType);
    } catch (e) {
      return refuse(502, `caaqms unreachable from the relay: pinned (${scrub(pinnedWhy)}); `
        + `plain fetch (${scrub(e instanceof Error ? e.message : e)})`);
    }
  }

  /* mirror / mirror-all / bulletin: plain fetch is fine from Vercel (measured
     — bom1 was serving /api/air off the mirror while the runners were being
     dropped), and redirects are followed so the bulletin's 302 to the day's
     dated PDF still lands. */
  try {
    const res = await fetch(plan.url, {
      cache: 'no-store',
      redirect: 'follow',
      signal: AbortSignal.timeout(45000),
    });
    // Prefer the upstream's own content-type when it states one; the plan's
    // is the fallback so a body never goes out untyped.
    const ct = res.headers.get('content-type') ?? plan.contentType;
    return relayed(res.status, await res.arrayBuffer(), ct);
  } catch (e) {
    return refuse(502, `${plan.src} unreachable from the relay: `
      + scrub(e instanceof Error ? (e.cause instanceof Error ? `${e.message} (${e.cause.message})` : e.message) : e));
  }
}
