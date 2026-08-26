/**
 * lib/relay.ts — the decisions behind /api/relay, kept importable so they can
 * be unit-tested without a running server. The route (app/api/relay/route.ts)
 * is transport; THIS file is policy: who may ask, and what may be asked for.
 *
 * WHY A RELAY EXISTS AT ALL — the egress volatility of 26 August 2026.
 * The three CPCB-side hosts this pipeline reads answer or refuse depending on
 * WHERE the request comes from, and that map CHANGES BY THE HOUR:
 *
 *   · api.data.gov.in served every hourly GitHub-runner fetch for days, then
 *     started dropping TCP from the runners mid-afternoon (6/6 probes across
 *     two attempts 15 minutes apart) — while Vercel's bom1 region kept
 *     fetching it without a hiccup in the same minutes.
 *   · airquality.cpcb.gov.in (the CAAQMS live feed) is unreachable from both
 *     GitHub runners and Vercel iad1, answers Vercel bom1 not at all (9s+ of
 *     silence), but answers this project's build machine in ~100ms.
 *   · cpcb.nic.in (the daily bulletin) answered the runners in ~1s the same
 *     afternoon the other two refused them.
 *
 * No single egress point can be trusted to keep reaching these hosts, so the
 * fetch scripts get one more rung: a request relayed through our own Vercel
 * deployment, which sits in Mumbai next to the sources. Design for the
 * volatility, not for today's matrix — every rung is an ordinary fallback.
 *
 * ★ THIS IS NOT AN OPEN PROXY, AND THE SHAPE OF THE API IS THE PROOF.
 * The caller never supplies a URL. It supplies `src=` — one of four
 * WHITELISTED names — plus, for the mirror, a city/limit/offset triplet that
 * is validated to the character before it is allowed anywhere near a URL.
 * Upstream URLs are constructed HERE, server-side, from constants. There is
 * no code path from caller input to an arbitrary host.
 *
 * ★ THE data.gov.in KEY NEVER TRANSITS THE RELAY BOUNDARY, in either
 * direction. The relay reads DATA_GOV_IN_KEY from Vercel's own environment
 * and splices it into the upstream URL after validation; the caller neither
 * sends a key nor receives one back (error text is scrubbed by the route).
 *
 * ★ NO TOKEN, NO SERVICE — INCLUDING WHEN THE TOKEN IS UNSET. An env var
 * that someone forgot to configure must fail CLOSED: `bearerAuthorized`
 * returns false when the expected token is missing, so a misdeployed relay
 * is a 401, never an anonymous proxy.
 */
import { createHash, timingSafeEqual } from 'node:crypto';

/**
 * Constant-time bearer check. The comparison runs over fixed-length SHA-256
 * digests rather than the raw strings, so neither the length of the supplied
 * token nor an early-mismatch byte leaks through timing — `timingSafeEqual`
 * itself refuses buffers of unequal length, which raw strings would hit.
 */
export function bearerAuthorized(header: string | null, expected: string | undefined): boolean {
  if (!expected) return false; // unset token fails CLOSED — never an open proxy
  const m = /^Bearer\s+(\S+)$/.exec(header ?? '');
  if (!m) return false;
  const a = createHash('sha256').update(m[1]).digest();
  const b = createHash('sha256').update(expected).digest();
  return timingSafeEqual(a, b);
}

/** The one mirror resource this pipeline reads — transcribed constant, same
    id as lib/air.ts's RESOURCE and the fetch scripts'. */
export const MIRROR_RESOURCE = '3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69';

export const BULLETIN_URL = 'https://cpcb.nic.in/aqi_report.php';

export type RelayPlan =
  | { ok: true; src: 'caaqms'; contentType: string }
  | { ok: true; src: 'mirror' | 'mirror-all' | 'bulletin'; url: string; contentType: string }
  | { ok: false; status: number; reason: string };

/* The mirror's city filter, validated to the character. CPCB city names are
   letters, spaces and a few marks ("Sri Ganganagar", "Kalaburagi"); nothing
   URL-structural may pass. Encoded again on the way into the URL regardless —
   the validation is the wall, the encoding is the belt. */
const CITY_RE = /^[A-Za-z][A-Za-z .()'-]{0,59}$/;

const intIn = (v: string | null, lo: number, hi: number, dflt: number): number | null => {
  if (v === null) return dflt;
  if (!/^\d{1,6}$/.test(v)) return null;
  const n = Number(v);
  return n >= lo && n <= hi ? n : null;
};

/**
 * Turn the caller's query into an upstream plan, or refuse it.
 * `key` is Vercel's own DATA_GOV_IN_KEY — required for the mirror sources
 * only; its absence there is a 503 (our misconfiguration), never a 400.
 */
export function planUpstream(params: URLSearchParams, key: string | undefined): RelayPlan {
  const src = params.get('src');
  switch (src) {
    case 'caaqms':
      // The URL is a constant in lib/air.ts (CAAQMS_URL); the route fetches it
      // via the CA-pinned path. Nothing caller-supplied is involved.
      return { ok: true, src: 'caaqms', contentType: 'application/xml; charset=utf-8' };
    case 'mirror':
    case 'mirror-all': {
      if (!key) return { ok: false, status: 503, reason: 'no server-side data.gov.in key configured' };
      const limit = intIn(params.get('limit'), 1, 20000, 1000);
      const offset = intIn(params.get('offset'), 0, 100000, 0);
      if (limit === null || offset === null) {
        return { ok: false, status: 400, reason: 'limit/offset out of range' };
      }
      let cityFilter = '';
      if (src === 'mirror') {
        const city = params.get('city') ?? 'Delhi';
        if (!CITY_RE.test(city)) return { ok: false, status: 400, reason: 'malformed city' };
        cityFilter = `&filters%5Bcity%5D=${encodeURIComponent(city)}`;
      }
      return {
        ok: true, src,
        url: `https://api.data.gov.in/resource/${MIRROR_RESOURCE}`
          + `?api-key=${encodeURIComponent(key)}&format=json&limit=${limit}&offset=${offset}`
          + cityFilter,
        contentType: 'application/json; charset=utf-8',
      };
    }
    case 'bulletin':
      // 302s to the day's dated PDF; the route follows the redirect.
      return { ok: true, src: 'bulletin', url: BULLETIN_URL, contentType: 'application/pdf' };
    default:
      return { ok: false, status: 400, reason: 'src must be one of caaqms, mirror, mirror-all, bulletin' };
  }
}

/** Strip anything key-shaped from text that could reach a response or a log —
    same double defence as scripts/lib/fetch-cpcb.mjs's redact(). */
export function scrub(s: unknown): string {
  return String(s ?? '')
    .replace(/api-key=[^&\s"'\\]+/gi, 'api-key=REDACTED')
    .replace(/(https?:\/\/[^\s"'\\]*?)\?[^\s"'\\]*/g, '$1?REDACTED');
}
