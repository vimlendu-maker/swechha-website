/* THE DATA-QUALITY RULES BOTH AIR FETCHERS APPLY — AD-47.
   ───────────────────────────────────────────────────────────────────────────
   `isStuck` existed in THREE places: lib/air.ts (TypeScript, for the runtime
   routes), scripts/fetch-air.mjs and scripts/fetch-india.mjs. The .ts copy
   cannot be imported from an .mjs script and stays where it is — but the two
   .mjs copies had already drifted in the way that matters: fetch-air.mjs
   carried the self-check that fails the run when the rule is wrong, and
   fetch-india.mjs carried only the comment saying it was "transcribed" from
   somewhere else. A rule with the test attached and a rule without it are not
   the same rule, and the national table is precisely where the Leh reading
   came from.

   So both .mjs callers now import from here, and the self-check runs ON
   IMPORT — a caller cannot take the rule without taking the test.

   lib/air.ts keeps its own transcription and its own vitest cases
   (lib/air.test.ts). Two implementations across a language boundary is the
   floor; three was not.
   ─────────────────────────────────────────────────────────────────────────── */

/**
 * A stuck instrument, not a reading.
 *
 * ★ THE TEST IS RELATIVE, AND THAT IS THE WHOLE POINT. The rule this replaced
 * was the literal `min === max === avg`, which caught 228 of 3,219 rows (7.1%)
 * and MISSED the one that mattered: Leh's CO at min 187, max 188, avg 188 — a
 * sensor that had not moved meaningfully in twenty-four hours, which ranked Leh
 * FIRST in India, above Delhi, on the cleanest particulates in the country.
 * A channel that varies by less than 2% of its own value across a full day is
 * reporting an instrument, not air.
 *
 * ★ AND IT IS RELATIVE RATHER THAN ABSOLUTE so that genuinely low, genuinely
 * live channels survive: Madurai's ozone at 5/6/5 is a real low reading, and
 * an absolute "range < 2" test would have thrown it away.
 *
 * Anything unreadable is NOT stuck — a missing value is handled by the callers
 * as missing, and must not be laundered into a drop by this rule.
 */
export function isStuck(min, max, avg) {
  if (min == null || max == null || avg == null) return false;
  if (max < min) return false;
  if (max === 0) return min === 0;
  return (max - min) / max < 0.02;
}

/* ── THE CASES THAT MADE THE RULE, CHECKED ON IMPORT ──────────────────────
   Two real stuck readings, and two real live ones that an over-eager rule
   would wrongly drop. A mistyped constant here would silently change which
   stations report across the whole site, so it fails the run instead. */
const CASES = [
  [187, 188, 188, true,  'Leh CO — one point across 24h; ranked Leh 1st in India'],
  [101, 103, 102, true,  'Navi Mumbai CO — the analyser frozen at 101 hours earlier'],
  [5, 6, 5,      false,  'Madurai ozone — LOW, not stuck; an absolute test would wrongly drop it'],
  [94, 248, 158, false,  'Leh ozone — a live channel at the same station'],
];
for (const [mn, mx, av, want, why] of CASES) {
  if (isStuck(mn, mx, av) !== want) {
    console.error(`STUCK-CHANNEL TEST IS WRONG: ${mn}/${mx}/${av} should be `
      + `${want ? 'stuck' : 'live'} (${why}). Refusing to run.`);
    process.exit(1);
  }
}

/**
 * CPCB's National AQI runs 0-500. A sub-index above that is not an index on
 * the scale it claims to be on, whatever produced it.
 *
 * This is deliberately NOT a "large change = reject" rule: the bound is the
 * published scale, never the previous reading, so a genuine 500 on a genuinely
 * severe day passes untouched.
 */
export const AQI_SCALE_MAX = 500;
export const isOffScale = (sub) => sub != null && sub > AQI_SCALE_MAX;
