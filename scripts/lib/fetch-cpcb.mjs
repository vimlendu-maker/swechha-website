/* THE TRANSPORT THAT ACTUALLY REACHES data.gov.in.
   ───────────────────────────────────────────────────────────────────────────
   Every CPCB fetch in scripts/ goes through here. This module changes HOW the
   bytes arrive and nothing about what is computed from them.

   WHY NATIVE fetch() KEPT FAILING — measured 26 August 2026, not guessed:

   · undici (Node's fetch) gives a connection 10 SECONDS to open, and that
     default is separate from any signal the caller passes. `AbortSignal.
     timeout(60000)` bounds the whole request; the CONNECT phase still dies at
     undici's own 10s. Every failing hourly run said the same thing:
     `ConnectTimeoutError ... timeout: 10000ms`.
   · DNS for api.data.gov.in has an A record only (164.100.61.198); the AAAA
     query returns ENODATA. Dual-stack ("happy eyeballs") resolution stalls
     ~35 seconds on some networks — longer than undici's 10s, so fetch() never
     stood a chance from those networks. That killed ~50% of GitHub Actions
     runs and 100% of runs from the maintainer's Mac.
   · curl against the SAME url from the same Mac: `-4` connects in 0.06s and
     delivers the full 3,549-row national payload in 1–2.6s, three for three.
     Plain curl (auto family) takes ~35s to connect but still succeeds.
   · node:https with family:4 — and even a custom resolve4-based lookup — was
     tried and STILL hangs from that machine (the response never arrives). Do
     not spend another afternoon there. curl is the one transport proven to
     work everywhere this repo runs its fetch scripts.

   SO: TRY fetch FIRST, FALL BACK TO curl. fetch is fastest when the network
   lets it work (about half of GitHub runs), and curl -4 is the proven path
   when it does not. The fallback fires only on a TRANSPORT failure — fetch()
   resolves on HTTP 4xx/5xx, so an upstream that ANSWERED, however unhappily,
   is reported as-is and never re-asked via curl. Callers keep their existing
   split between exit 75 (the source was silent) and exit 1 (the source
   answered and the answer was wrong) untouched: both transports failing still
   surfaces as one thrown error, exactly where a thrown fetch() surfaced
   before.

   ★ THE URL CARRIES THE API KEY AND MUST NEVER REACH A LOG. The key rides in
   an `api-key=` query param. So: the URL is passed to curl as an argv element
   via execFileSync — no shell, no interpolation, no history file — and every
   error message that could quote a URL (curl's own stderr does, and
   execFileSync's "Command failed: ..." message embeds the whole argv) is
   passed through redact() before it can propagate. Nothing in this module
   logs; it throws, and what it throws is already scrubbed.

   ★ app/api/air/route.ts IS DELIBERATELY NOT REWIRED TO THIS. That route runs
   on Vercel, where this connect-timeout failure mode has not been observed
   and where a curl binary is not available to fall back to. GitHub runners
   and macOS both ship curl; Vercel functions do not.

   ★★ THE THIRD RUNG: THE RELAY — added 26 August 2026 (AD-45), the day the
   two-transport ladder stopped being enough. Both fetch and curl solve
   PROTOCOL problems (undici's 10s connect default, the AAAA stall, the
   cross-signed eMudhra chain); neither can solve a NETWORK problem, and on
   26 August the network problem arrived: GitHub's runners lost raw TCP to
   api.data.gov.in mid-afternoon (6/6 probes dropped, two rounds 15 minutes
   apart) after days of clean hourly fetches — while Vercel's bom1 region kept
   reaching the same host in the same minutes. The reachability of these
   Indian-government hosts from any given cloud CHANGES OVER TIME, so the
   ladder's last rung is our own deployment's egress: GET
   https://swechha.in/api/relay with a bearer token, asking for a WHITELISTED
   source by name (never by URL — see lib/relay.ts for why it is not a proxy).

   · The rung fires only after fetch AND curl have both failed, so a healthy
     network never pays the extra hop.
   · A relay response counts as "the source answered" ONLY when it carries
     x-relay-upstream-status — the relay's own 401/404/5xx (including the
     404 every deployment older than the route returns: PR CI runs BEFORE
     the route exists in production, and nothing here may depend on it
     answering) is a failed RUNG, never an upstream answer. That keeps the
     callers' exit-75 (silent) vs exit-1 (answered wrongly) split honest.
   · No AIR_RELAY_TOKEN in the environment -> the rung skips itself. The
     token never rides a URL, only the Authorization header, and only to the
     relay origin.
   · AIR_RELAY_ORIGIN overrides the origin for testing against a local
     `next start`; AIR_FORCE_RELAY=1 skips fetch and curl entirely — the
     test seam that proves a fetch can complete through the relay alone. */
import { execFileSync } from 'node:child_process';
import { readFileSync, rmSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/** Strip anything key-shaped out of a message before it can be logged.
    Belt and braces: the api-key param by name, then any query string hanging
    off any URL-looking token. */
function redact(s) {
  return String(s ?? '')
    .replace(/api-key=[^&\s"'\\]+/gi, 'api-key=REDACTED')
    .replace(/(https?:\/\/[^\s"'\\]*?)\?[^\s"'\\]*/g, '$1?REDACTED');
}

/** One curl request. Returns { status, url, buf } or throws a redacted Error.
    · -4            skip the AAAA/ENODATA stall entirely — the measured fix
    · -sS           quiet, but keep real errors on stderr (captured, scrubbed)
    · -L            follow redirects, because native fetch's default does and
                    the CPCB bulletin 302s to the day's PDF
    · body to a temp FILE, not stdout — the national payload is a few MB and
      execFileSync's default maxBuffer is 1MB; stdout carries only the tiny
      `%{http_code}\t%{url_effective}` write-out
    · NO --fail flag: an HTTP error must come back as a status the caller can
      read, because callers already distinguish "answered wrongly" from
      "never answered" and an exit-22 would collapse the two. */
function curlRequest(url, timeoutMs, headers) {
  const dir = mkdtempSync(join(tmpdir(), 'cpcb-fetch-'));
  const bodyFile = join(dir, 'body');
  try {
    let meta;
    try {
      /* Headers ride argv, which error messages embed and `ps` can see — so
         ONLY non-secret headers (a User-Agent) may ever be passed this way.
         The relay's Authorization header never comes here: the relay rung is
         fetch-only by design (see relayRequest). */
      const headerArgs = Object.entries(headers ?? {}).flatMap(([k, v]) => ['-H', `${k}: ${v}`]);
      meta = execFileSync('curl', [
        '-4', '-sS', '-L',
        '--max-time', String(Math.max(5, Math.ceil(timeoutMs / 1000))),
        '--connect-timeout', '15',
        ...headerArgs,
        '-o', bodyFile,
        '-w', '%{http_code}\t%{url_effective}',
        url,
      ], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    } catch (e) {
      // NEVER rethrow the original: execFileSync's message embeds the argv,
      // argv embeds the URL, the URL embeds the key.
      throw new Error(`curl transport failed: ${redact(e.stderr?.trim() || e.message)}`);
    }
    const tab = meta.lastIndexOf('\t');
    const status = Number(meta.slice(0, tab));
    if (!Number.isFinite(status) || status === 0) {
      throw new Error('curl transport failed: no HTTP status came back');
    }
    return { status, url: redact(meta.slice(tab + 1)), buf: readFileSync(bodyFile) };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/* ── THE RELAY RUNG ──────────────────────────────────────────────────────
   Maps a whitelisted upstream URL onto /api/relay's `src=` vocabulary. A URL
   with no mapping gets no relay attempt — the whitelist lives on BOTH sides
   of the boundary, so a new upstream cannot ride the relay by accident. The
   resource id is transcribed (the repo's standing convention), same value as
   lib/relay.ts's MIRROR_RESOURCE and every fetch script's RESOURCE. */
const MIRROR_RESOURCE = '3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69';

/** The relay query for a given upstream URL, or null when the upstream is
    not one the relay serves. Exported for the tests only. */
export function relayQueryFor(url) {
  let u;
  try { u = new URL(url); } catch { return null; }
  if (u.hostname === 'airquality.cpcb.gov.in' && u.pathname === '/caaqms/rss_feed') {
    return 'src=caaqms';
  }
  if (u.hostname === 'cpcb.nic.in' && u.pathname === '/aqi_report.php') {
    return 'src=bulletin';
  }
  if (u.hostname === 'api.data.gov.in' && u.pathname === `/resource/${MIRROR_RESOURCE}`) {
    const city = u.searchParams.get('filters[city]');
    const q = new URLSearchParams({ src: city ? 'mirror' : 'mirror-all' });
    if (city) q.set('city', city);
    for (const k of ['limit', 'offset']) {
      const v = u.searchParams.get(k);
      if (v !== null) q.set(k, v);
    }
    return q.toString(); // NOTE: the api-key param is deliberately NOT
    // forwarded — the relay holds its own key server-side (lib/relay.ts).
  }
  return null;
}

/**
 * One relayed request. Throws on anything that is not a genuine upstream
 * answer; resolves with the curl-branch's Response shape otherwise.
 *
 * ★ x-relay-upstream-status IS THE WHOLE CONTRACT. The relay sets it if and
 * only if the upstream actually answered, and then the status and body are
 * the upstream's own. A response without it is the RELAY speaking — 401 (bad
 * or missing token), 404 (a deployment that predates the route: PR CI runs
 * before the route exists in production, by design), an edge error page —
 * and must be a failed rung, NOT "the source answered". Treating a relay 404
 * as an upstream answer would flip the callers from exit 75 (silent, green
 * skip) to exit 1 (answered wrongly, red) on every pre-deploy CI run.
 *
 * The rung is fetch-only, no curl: the relay origin is a global CDN with
 * none of the Indian-government hosts' protocol quirks, and curl would put
 * the Authorization header on argv where error messages and `ps` can see it.
 */
async function relayRequest(url, timeoutMs) {
  const token = process.env.AIR_RELAY_TOKEN;
  if (!token) throw new Error('AIR_RELAY_TOKEN is not set — rung skipped');
  const q = relayQueryFor(url);
  if (!q) throw new Error('no whitelisted relay mapping for this upstream — rung skipped');
  const origin = (process.env.AIR_RELAY_ORIGIN || 'https://swechha.in').replace(/\/+$/, '');
  const res = await fetch(`${origin}/api/relay?${q}`, {
    headers: { authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(timeoutMs),
  });
  const upstream = Number(res.headers.get('x-relay-upstream-status'));
  if (!res.headers.has('x-relay-upstream-status') || !Number.isFinite(upstream)) {
    throw new Error(`relay answered HTTP ${res.status} with no upstream status — `
      + 'the relay itself refused or does not exist yet, so the source has not been asked');
  }
  const buf = Buffer.from(await res.arrayBuffer());
  return {
    ok: upstream >= 200 && upstream < 300,
    status: upstream,
    url: redact(url),
    via: 'relay',
    json: async () => JSON.parse(buf.toString('utf8')),
    text: async () => buf.toString('utf8'),
    arrayBuffer: async () =>
      buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength),
  };
}

/**
 * Drop-in replacement for `fetch(url, { signal: AbortSignal.timeout(ms) })`
 * against flaky upstreams. Resolves with a Response, or a Response-shaped
 * object when curl or the relay carried the request: `ok`, `status`, `url`,
 * and async `json()` / `text()` / `arrayBuffer()` — the four things the
 * callers in this repo actually use. HTTP errors RESOLVE (read `.ok` /
 * `.status`, as with fetch); only every rung failing throws, with
 * `.transport = 'fetch+curl+relay'` so a caller can tell "all roads were
 * closed" from its own shape checks. Exit-75 therefore now means direct
 * fetch AND curl AND the relay were all silent.
 *
 * `headers` are optional and NON-SECRET only (a User-Agent for hosts that
 * gate on one) — they ride curl's argv on the fallback rung.
 * AIR_FORCE_RELAY=1 skips the first two rungs — the test seam that proves a
 * fetch can complete purely through the relay.
 */
export async function fetchUpstream(url, { timeoutMs = 60000, headers } = {}) {
  const failures = [];
  const why = (e) => redact(e?.cause?.message ? `${e.message} (${e.cause.message})` : e?.message);
  if (process.env.AIR_FORCE_RELAY === '1') {
    failures.push('fetch (skipped: AIR_FORCE_RELAY=1)', 'curl (skipped: AIR_FORCE_RELAY=1)');
  } else {
    try {
      return await fetch(url, { headers, signal: AbortSignal.timeout(timeoutMs) });
    } catch (e) {
      failures.push(`fetch (${why(e)})`); // network-level only: fetch resolves on HTTP errors
    }
    try {
      const { status, url: effective, buf } = curlRequest(url, timeoutMs, headers);
      return {
        ok: status >= 200 && status < 300,
        status,
        url: effective,
        via: 'curl',
        json: async () => JSON.parse(buf.toString('utf8')),
        text: async () => buf.toString('utf8'),
        arrayBuffer: async () =>
          buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength),
      };
    } catch (e) {
      failures.push(`curl (${redact(e.message)})`);
    }
  }
  try {
    return await relayRequest(url, timeoutMs);
  } catch (e) {
    failures.push(`relay (${why(e)})`);
  }
  const err = new Error(`unreachable via ${failures.join(' and via ')}`);
  err.transport = 'fetch+curl+relay';
  throw err;
}
