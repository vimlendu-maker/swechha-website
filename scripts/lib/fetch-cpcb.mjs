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
   and macOS both ship curl; Vercel functions do not. */
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
function curlRequest(url, timeoutMs) {
  const dir = mkdtempSync(join(tmpdir(), 'cpcb-fetch-'));
  const bodyFile = join(dir, 'body');
  try {
    let meta;
    try {
      meta = execFileSync('curl', [
        '-4', '-sS', '-L',
        '--max-time', String(Math.max(5, Math.ceil(timeoutMs / 1000))),
        '--connect-timeout', '15',
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

/**
 * Drop-in replacement for `fetch(url, { signal: AbortSignal.timeout(ms) })`
 * against flaky upstreams. Resolves with a Response, or a Response-shaped
 * object when curl carried the request: `ok`, `status`, `url`, and async
 * `json()` / `text()` / `arrayBuffer()` — the four things the callers in this
 * repo actually use. HTTP errors RESOLVE (read `.ok` / `.status`, as with
 * fetch); only a double transport failure throws, with `.transport =
 * 'fetch+curl'` so a caller can tell "both roads were closed" from its own
 * shape checks.
 */
export async function fetchUpstream(url, { timeoutMs = 60000 } = {}) {
  let fetchError;
  try {
    return await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
  } catch (e) {
    fetchError = e; // network-level only: fetch resolves on HTTP errors
  }
  try {
    const { status, url: effective, buf } = curlRequest(url, timeoutMs);
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
  } catch (curlError) {
    const fetchWhy = redact(fetchError.cause?.message
      ? `${fetchError.message} (${fetchError.cause.message})`
      : fetchError.message);
    const err = new Error(
      `unreachable via fetch (${fetchWhy}) and via curl (${redact(curlError.message)})`);
    err.transport = 'fetch+curl';
    throw err;
  }
}
