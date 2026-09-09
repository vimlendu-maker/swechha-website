/**
 * lib/retention.test.ts — the predicate, which is the part that can be quietly
 * wrong and catastrophic.
 *
 * `prunePending()` issues two DELETEs against the two subscription tables. Drop
 * `status = 'pending'` from either and it deletes every subscriber you have,
 * with no error and a cheerful count in the job log. That is the property under
 * test here, and it is why this file exists at all — not to prove a DELETE
 * deletes, but to pin the clause that stops it deleting the wrong rows.
 *
 * NO DATABASE. `q` is passed into the function rather than constructed inside
 * it — the argument `lib/rate-limit.ts` makes at length for the same reason —
 * so a recording stub can capture the SQL that would have run. That tests THIS
 * code rather than a re-implementation of it, which is the whole point of the
 * injection. `lib/rate-limit.db.test.ts` is the pattern for the cases that
 * genuinely need a live Postgres; the shape of a predicate is not one of them.
 */
import { describe, it, expect } from 'vitest';
import {
  prunePending, pruneSummary, PENDING_MAX_AGE_DAYS, RETAINED_TABLES,
} from '../scripts/lib/retention.mjs';

/** Records each tagged-template call as flattened SQL plus its bound values. */
function recorder(rowsPerCall: unknown[][] = [[], []]) {
  const calls: { sql: string; values: unknown[] }[] = [];
  let n = 0;
  const q = (strings: TemplateStringsArray, ...values: unknown[]) => {
    calls.push({ sql: strings.join('?').replace(/\s+/g, ' ').trim(), values });
    return Promise.resolve(rowsPerCall[n++] ?? []);
  };
  return { q, calls };
}

describe('the predicate', () => {
  it('touches only pending rows — the clause that stops it deleting every subscriber', async () => {
    const { q, calls } = recorder();
    await prunePending(q);
    expect(calls).toHaveLength(2);
    for (const c of calls) {
      expect(c.sql).toMatch(/WHERE status = 'pending'/);
    }
  });

  /* Stated as its own case because the failure is silent and total: a sweep
     without the status clause reports a large number and looks like it worked. */
  it('never issues an unqualified DELETE', async () => {
    const { q, calls } = recorder();
    await prunePending(q);
    for (const c of calls) {
      expect(c.sql).not.toMatch(/DELETE FROM \w+ RETURNING/);
      expect(c.sql).toMatch(/DELETE FROM \w+ WHERE/);
    }
  });

  it('bounds on age, with the interval as a bound parameter rather than built into the string', async () => {
    const { q, calls } = recorder();
    await prunePending(q);
    for (const c of calls) {
      expect(c.sql).toMatch(/created_at < now\(\) - make_interval\(days => \?\)/);
      expect(c.values).toEqual([PENDING_MAX_AGE_DAYS]);
    }
  });

  it('uses the seven days both schemas state', () => {
    expect(PENDING_MAX_AGE_DAYS).toBe(7);
  });

  /* ★ THE DEFECT THIS MODULE WAS WRITTEN FOR. db/001's delete ran hourly inside
     scripts/ward-alerts.mjs; db/002's was documented and executed by nothing,
     so an unconfirmed digest address was kept indefinitely. Both tables must be
     swept, and the count is asserted so adding a third table without adding its
     DELETE fails here. */
  it('sweeps both subscription tables, not just the ward one', async () => {
    const { q, calls } = recorder();
    await prunePending(q);
    const swept = calls.map((c) => /DELETE FROM (\w+)/.exec(c.sql)?.[1]);
    expect(swept).toEqual(RETAINED_TABLES);
    expect(swept).toContain('newsletter_subscriptions');
  });

  it('reports what it removed, per table', async () => {
    const { q } = recorder([[{ id: 1 }, { id: 2 }], [{ id: 9 }]]);
    expect(await prunePending(q)).toEqual({ ward: 2, newsletter: 1 });
  });
});

describe('the job log line', () => {
  it('is null when there was nothing to do, so a quiet hour stays quiet', () => {
    expect(pruneSummary({ ward: 0, newsletter: 0 })).toBeNull();
  });

  it('names only the tables that actually gave up rows', () => {
    expect(pruneSummary({ ward: 0, newsletter: 3 })).toMatch(/3 newsletter/);
    expect(pruneSummary({ ward: 0, newsletter: 3 })).not.toMatch(/ward/);
    expect(pruneSummary({ ward: 2, newsletter: 0 })).toMatch(/2 ward/);
    expect(pruneSummary({ ward: 2, newsletter: 3 })).toMatch(/2 ward and 3 newsletter/);
  });

  it('states the horizon, so a log line is readable without the source', () => {
    expect(pruneSummary({ ward: 1, newsletter: 0 })).toContain('7 days');
  });
});
