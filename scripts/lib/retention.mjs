/* ═══════════════════════════════════════════════════════════════════════════
   RETENTION — unconfirmed subscriptions, and the promise that had nobody
   keeping it.
   ───────────────────────────────────────────────────────────────────────────
   Both subscription schemas end with the same rule, in the same words:

     db/001:  "An address somebody typed and never confirmed is not a lead, and
               keeping it is the thing double opt-in exists to prevent."
     db/002:  "An unconfirmed row is an address somebody typed and never
               confirmed — quite possibly not theirs. It is not a lead and must
               not be kept.  Run this alongside the send job."

   ★ ONE OF THE TWO WAS ENFORCED AND THE OTHER WAS NOT.
   `scripts/ward-alerts.mjs` ran db/001's delete inline, hourly, so the ward
   table was clean. db/002 told the operator to run its delete "alongside the
   send job" — AND THERE IS NO SEND JOB. No script, nothing scheduled, nothing
   that has ever executed that statement. So every address typed into the digest
   box and never confirmed was kept indefinitely, against that file's own words.
   Found 9 September 2026 while wording the subscribe endpoints' failure
   messages: the message could not honestly name a deletion date, because
   nothing deleted anything.

   ★ WHY BOTH TABLES MOVED HERE RATHER THAN A SECOND INLINE DELETE.
   The rule is identical for both and the two are one concern — "an unconfirmed
   address is not ours to keep". Written twice it drifts: one gets a corrected
   interval, or a third table is added and only the author of the day remembers
   there are two places to look. Written once, the set of tables under retention
   is a list somebody can read.

   ★ IT RIDES ON THE WARD JOB'S SCHEDULE, DELIBERATELY, AND THAT IS THE ONE
   THING TO KNOW IF THAT JOB EVER GOES. `ward-alerts.yml` is the only scheduled
   process in this repository with database access, it already ran half of this,
   and it fires hourly at :20 all night — so "after seven days" is accurate to
   within an hour. A dedicated workflow whose whole content is two DELETEs would
   be more correctly named and would add a second thing to keep alive; this adds
   nothing. THE COUPLING IS THE COST: retire the ward feature and newsletter
   retention silently stops with it. If that day comes, this module moves to its
   own scheduled workflow — it takes a query function and nothing else,
   precisely so that move is a change of caller and not a rewrite.

   ★ NO DYNAMIC SQL. A table name cannot be a bound parameter, so the two
   statements are written out in full rather than looped over a list of names.
   That is not repetition to tidy away: it is what keeps this file free of
   string-built SQL, and it makes each statement greppable by table.
   ═══════════════════════════════════════════════════════════════════════════ */

/** How long an unconfirmed row may live. Both schemas say seven days. */
export const PENDING_MAX_AGE_DAYS = 7;

/** The tables under this rule, for anything that wants to report on it. */
export const RETAINED_TABLES = ['ward_subscriptions', 'newsletter_subscriptions'];

/**
 * Delete every unconfirmed row past the retention horizon, in both tables.
 *
 * `q` is a `neon()` tagged-template query function, PASSED IN rather than
 * constructed here — the same argument `lib/rate-limit.ts` makes for the same
 * reason: `neon()` only talks to Neon, so a test that cannot supply its own
 * query function cannot test this code at all, only a re-implementation of it.
 * `lib/retention.test.ts` runs THIS function against a recording stub and
 * asserts the predicate, which is the part that can be quietly wrong.
 *
 * ★ `status = 'pending'` IS THE WHOLE SAFETY OF THIS FUNCTION. Without it these
 * are two statements that delete every subscriber you have. It is asserted by
 * test, not merely written here.
 *
 * Returns the counts, so the caller can log what went. Never throws for the
 * caller to swallow — a retention sweep that fails silently is the state this
 * module was written to end.
 */
export async function prunePending(q) {
  const ward = await q`
    DELETE FROM ward_subscriptions
     WHERE status = 'pending'
       AND created_at < now() - make_interval(days => ${PENDING_MAX_AGE_DAYS})
     RETURNING id`;
  const newsletter = await q`
    DELETE FROM newsletter_subscriptions
     WHERE status = 'pending'
       AND created_at < now() - make_interval(days => ${PENDING_MAX_AGE_DAYS})
     RETURNING id`;
  return { ward: ward.length, newsletter: newsletter.length };
}

/** One line for a job log, or null when there was nothing to do. */
export function pruneSummary({ ward, newsletter }) {
  const parts = [];
  if (ward) parts.push(`${ward} ward`);
  if (newsletter) parts.push(`${newsletter} newsletter`);
  return parts.length
    ? `expired ${parts.join(' and ')} unconfirmed subscription(s) past ${PENDING_MAX_AGE_DAYS} days`
    : null;
}
