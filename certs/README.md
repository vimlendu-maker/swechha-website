# certs/ — the CPCB CAAQMS trust anchors (AD-44 addendum)

## Why this exists

`airquality.cpcb.gov.in` serves a chain whose eMudhra intermediate is
**cross-signed** (one version chains to Comodo "AAA Certificate Services",
another to eMudhra's own emSign roots). Node/undici's certificate
path-building rejects it — native `fetch()` fails with *"self-signed
certificate in certificate chain"* — while curl and system openssl validate
the same chain fine. Scripts route around it with a curl fallback
(`scripts/lib/fetch-cpcb.mjs`); **Vercel has no curl**, and on
26 August 2026 the prediction in AD-44's A-44.7 materialized exactly:
`/api/air`'s CAAQMS attempt failed on Vercel and the route fell back to the
ten-hour-stale mirror while the page showed the fresh hour.

The fix, measured from a machine where plain `fetch()` also fails: hand the
served chain to `node:https` as explicit trust anchors via the `ca` option —
**200 OK in 80ms**. With `ca` supplied, Node validates against exactly these
certificates and the path-building ambiguity disappears.

## What is in here — and that it is PUBLIC

`cpcb-caaqms-chain.pem` is the certificate chain the server itself sends to
every visitor, plus the public roots it chains to. **There is nothing secret
in a certificate** — no private keys, no credentials; committing it is
committing the server's own public handshake.

The PEM is not the copy the code reads. `lib/cpcb-ca.ts` embeds the same
bytes as a string constant, because a runtime `readFileSync` would depend on
Next's output file tracing including `certs/` in the deployed function — a
static import is bundled unconditionally. `lib/cpcb-ca.test.ts` pins the two
byte-for-byte, so they cannot drift.

## Regeneration

```sh
echo | openssl s_client -connect airquality.cpcb.gov.in:443 \
  -servername airquality.cpcb.gov.in -showcerts \
  | awk '/BEGIN CERT/,/END CERT/' > certs/cpcb-caaqms-chain.pem
node scripts/lib/regen-cpcb-ca.mjs   # rewrites lib/cpcb-ca.ts from the PEM
```

Run both, or the no-drift test fails — which is the point.

## Expiry (captured 26 August 2026)

| # | subject | notAfter |
|---|---|---|
| 1 | `*.cpcb.gov.in` (leaf) | **20 Sep 2026** ← the near one |
| 2 | EM OV TLS CA - G2A-1 (cross-signed by Comodo AAA) | 31 Dec 2028 |
| 3 | AAA Certificate Services (root) | 31 Dec 2028 |
| 4 | EM OV TLS CA - G2A-1 (emSign-signed) | 28 May 2040 |
| 5 | emSign Root TLS CA - G1 | 9 Jul 2039 |
| 6 | emSign Root CA - G1 | 18 Feb 2043 |

**The leaf rotates within a month of capture.** That is fine by design: the
`ca` option needs the ISSUERS to be trusted, not the leaf itself, so a
renewed leaf signed by the same intermediates keeps validating against this
bundle. If CPCB ever changes CA entirely, the CA-pinned request starts
failing — and that is handled: **a CA-pinned failure is an ordinary fallback**
(plain fetch, then the data.gov.in mirror), never an error. The site degrades
to exactly its pre-pin behaviour and `served_by` says so. When that happens,
re-run the regeneration above.
