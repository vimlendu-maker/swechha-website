/* ═══════════════════════════════════════════════════════════════════════════
   ARE THE THREE DATA KEYS WHERE THEY NEED TO BE?
   ───────────────────────────────────────────────────────────────────────────
   Three keys, and each is needed in more than one place, which is the part that
   is easy to get half-right:

     DATA_GOV_IN_KEY   CPCB via data.gov.in
                       · Vercel env  — /api/air runs at REQUEST time, so
                         without it the live hero, the ticker, /now and /now/air
                         all fall back to committed readings and the badge
                         stays Periodic instead of Live.
                       · GitHub secret — ward-alerts.yml AND data-refresh.yml
                       · .env.local — the local fetch scripts
     WAQI_TOKEN        aqicn.org, the air cross-check (fetch-crosscheck)
                       · GitHub secret + .env.local. Not needed by the app.
     FIRMS_MAP_KEY     NASA FIRMS, fire detections
                       · GitHub secret + .env.local. Not needed by the app.

   ★ IT NEVER PRINTS A VALUE, AND NEVER WRITES ONE.
   Presence, length and a source's answer — nothing else. Reporting a key by
   name is what makes a missing one findable; reporting it by value is how it
   ends up in a terminal log, a screenshot or a transcript.

   Usage:
     node --env-file=.env.local scripts/keys-check.mjs
     node --env-file=.env.local scripts/keys-check.mjs --live   also calls each
                                                               source once
     node scripts/keys-check.mjs --github                      also lists which
                                                               repo secrets exist

   `--env-file` is how the fetch scripts see .env.local at all: they read
   process.env directly and nothing in this repo loads a dotenv file, so a bare
   `node scripts/…` sees no keys even when .env.local is full.
   ═══════════════════════════════════════════════════════════════════════════ */
import { execFileSync } from 'node:child_process';
import { fetchUpstream } from './lib/fetch-cpcb.mjs';

const LIVE = process.argv.includes('--live');
const GH = process.argv.includes('--github');

const KEYS = [
  {
    name: 'DATA_GOV_IN_KEY',
    what: 'CPCB air, via data.gov.in',
    needed: ['Vercel env (the live /api/air route)', 'GitHub secret (both workflows)', '.env.local'],
    probe: async (key) => {
      const u = 'https://api.data.gov.in/resource/3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69'
        + `?api-key=${encodeURIComponent(key)}&format=json&limit=1`;
      /* Same transport the fetch scripts use (fetch-first, curl-fallback —
         scripts/lib/fetch-cpcb.mjs). Probing on the transport that always
         fails from this network would report a working key as broken. */
      const r = await fetchUpstream(u, { timeoutMs: 15000 });
      if (!r.ok) return { ok: false, why: `HTTP ${r.status}` };
      const j = await r.json();
      /* data.gov.in answers 200 with an error body on a bad key, so the shape
         is what is checked rather than the status. */
      if (j.status && String(j.status).toLowerCase().includes('error')) {
        return { ok: false, why: j.message || 'the API reported an error' };
      }
      const n = Array.isArray(j.records) ? j.records.length : 0;
      return n > 0 ? { ok: true, why: `${n} record(s) returned` }
        : { ok: false, why: 'answered, but with no records' };
    },
  },
  {
    name: 'WAQI_TOKEN',
    what: 'aqicn.org, the air cross-check',
    needed: ['GitHub secret', '.env.local'],
    probe: async (key) => {
      const r = await fetch(`https://api.waqi.info/feed/delhi/?token=${encodeURIComponent(key)}`,
        { signal: AbortSignal.timeout(15000) });
      const j = await r.json();
      return j.status === 'ok' ? { ok: true, why: 'status ok' }
        : { ok: false, why: j.data || j.status || 'refused' };
    },
  },
  {
    name: 'FIRMS_MAP_KEY',
    what: 'NASA FIRMS, fire detections',
    needed: ['GitHub secret', '.env.local'],
    probe: async (key) => {
      const r = await fetch(`https://firms.modaps.eosdis.nasa.gov/mapserver/mapkey_status/?MAP_KEY=${encodeURIComponent(key)}`,
        { signal: AbortSignal.timeout(15000) });
      if (!r.ok) return { ok: false, why: `HTTP ${r.status}` };
      const t = await r.text();
      return /current_transactions|transaction_limit/i.test(t)
        ? { ok: true, why: 'map key accepted' }
        : { ok: false, why: t.slice(0, 80).replace(/\s+/g, ' ') };
    },
  },
];

console.log('DATA KEYS\n');

let missing = 0;
for (const k of KEYS) {
  const v = process.env[k.name];
  if (!v) {
    missing++;
    console.log(`  ABSENT   ${k.name.padEnd(17)} ${k.what}`);
    for (const n of k.needed) console.log(`           ${''.padEnd(17)} needs: ${n}`);
  } else {
    /* Length only. Enough to spot a truncated paste, useless to anyone reading
       a log over your shoulder. */
    console.log(`  present  ${k.name.padEnd(17)} ${k.what}  (${v.length} chars)`);
  }
}

if (LIVE) {
  console.log('\nDOES THE SOURCE ACCEPT IT?');
  for (const k of KEYS) {
    const v = process.env[k.name];
    if (!v) { console.log(`  skip     ${k.name.padEnd(17)} not set here`); continue; }
    try {
      const res = await k.probe(v);
      console.log(`  ${res.ok ? 'ok      ' : 'REFUSED '} ${k.name.padEnd(17)} ${res.why}`);
    } catch (err) {
      console.log(`  ERROR    ${k.name.padEnd(17)} ${String(err.message).slice(0, 70)}`);
    }
  }
}

if (GH) {
  console.log('\nREPO SECRETS (names only — GitHub never returns a value)');
  try {
    const out = execFileSync('gh', ['secret', 'list', '--json', 'name'], { encoding: 'utf8' });
    const have = new Set(JSON.parse(out).map((s) => s.name));
    for (const k of KEYS) {
      console.log(`  ${have.has(k.name) ? 'set     ' : 'MISSING '} ${k.name}`);
    }
    const extra = [...have].filter((n) => !KEYS.some((k) => k.name === n));
    if (extra.length) console.log(`  also set: ${extra.join(', ')}`);
  } catch (err) {
    console.log(`  could not read repo secrets — ${String(err.message).split('\n')[0]}`);
  }
}

console.log('');
if (missing) {
  console.log(`${missing} key(s) absent from this environment. Nothing here writes a key: set them`);
  console.log('yourself with `gh secret set <NAME>` for CI, in Vercel for the live route, and in');
  console.log('.env.local for local fetches. Re-run with --live to confirm the source accepts it.');
} else {
  console.log('All three present in this environment.');
}
