#!/usr/bin/env node
/* Rewrites lib/cpcb-ca.ts from certs/cpcb-caaqms-chain.pem.
   ───────────────────────────────────────────────────────────────────────────
   The PEM is the openssl-shaped artifact a human regenerates (see
   certs/README.md for the one-liner and why the bundle exists at all); the
   TS module is the copy the Vercel route actually reads, embedded as a
   string so Next's output file tracing cannot strand the runtime without it.
   Two copies of one fact need a machine keeping them equal: this script
   writes one from the other, and lib/cpcb-ca.test.ts fails the suite if they
   ever differ. Run this after re-capturing the PEM; never edit lib/cpcb-ca.ts
   by hand. */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const pem = readFileSync(resolve(ROOT, 'certs/cpcb-caaqms-chain.pem'), 'utf8');
const blocks = (pem.match(/-----BEGIN CERTIFICATE-----/g) || []).length;
if (blocks < 2) {
  console.error(`certs/cpcb-caaqms-chain.pem holds ${blocks} certificate(s) — a chain has several. `
    + 'Refusing to embed what looks like a truncated capture.');
  process.exit(1);
}

const out = `/**
 * GENERATED — DO NOT EDIT. Run \`node scripts/lib/regen-cpcb-ca.mjs\` after
 * re-capturing certs/cpcb-caaqms-chain.pem (command in certs/README.md).
 *
 * The PUBLIC certificate chain airquality.cpcb.gov.in serves, embedded as a
 * string so the Vercel route bundle carries it without depending on output
 * file tracing. Node's undici rejects this host's cross-signed eMudhra
 * intermediate during path-building; handing the served chain to node:https
 * as the \`ca\` option validates cleanly (measured 200 OK in 80ms from a
 * machine where plain fetch fails). Nothing here is secret — these are the
 * bytes the server hands every visitor. lib/cpcb-ca.test.ts pins this
 * constant byte-for-byte to the PEM.
 *
 * ${blocks} certificates; the leaf expires 20 Sep 2026 — see certs/README.md
 * for why leaf rotation does NOT break this bundle, and what does.
 */
export const CPCB_CAAQMS_CA = ${JSON.stringify(pem)};
`;
writeFileSync(resolve(ROOT, 'lib/cpcb-ca.ts'), out);
console.log(`wrote lib/cpcb-ca.ts — ${blocks} certificates, ${pem.length} PEM bytes`);
