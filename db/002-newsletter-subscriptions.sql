-- The monthly digest: the site's second table.
--
-- Apply with:  npm run db:migrate      (applies every db/*.sql, safe to re-run)
-- See db/001 for why not psql, and why `vercel env pull` cannot give you the URL.
--
-- ★ WHY A SECOND TABLE AND NOT A ROW IN ward_subscriptions.
-- That table's `station` is NOT NULL and its key is UNIQUE (email, station),
-- because a ward alert is meaningless without a monitor. A digest has no
-- monitor. Storing one with a sentinel station ('*', '', 'all') would make the
-- alert job's own query — confirmed rows grouped by station — start returning
-- rows that must never be alerted, and the first person to forget that ships an
-- hourly air alert to every digest subscriber. Two promises, two tables.
--
-- WHAT IS AND IS NOT STORED. The same rule as 001, for the same reason: the
-- cheapest way to keep a privacy promise is to have nowhere to break it. An
-- address, the bookkeeping needed for double opt-in and unsubscribe, and
-- nothing else. NO name, NO ip address, NO user agent, NO referrer, NO record
-- of which page the address was typed on. A column that exists gets used.

CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
  id                 SERIAL PRIMARY KEY,

  -- Lowercased and trimmed before it arrives. The only personal data here.
  email              TEXT        NOT NULL UNIQUE,

  status             TEXT        NOT NULL DEFAULT 'pending'
                       CHECK (status IN ('pending', 'confirmed', 'unsubscribed')),

  -- ★ HASHES, NEVER THE TOKENS. A database leak must not hand anybody the
  -- ability to confirm or unsubscribe a stranger's address.
  confirm_token_hash TEXT,
  unsub_token_hash   TEXT,

  -- The last digest actually sent to this row, as a YYYY-MM string. It is the
  -- column that makes "one a month" enforceable rather than intended: the send
  -- job skips any row whose value already equals the month being sent, so a
  -- re-run cannot double-send and a partial failure can be resumed safely.
  last_digest_month  TEXT,
  last_digest_at     TIMESTAMPTZ,

  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  confirmed_at       TIMESTAMPTZ,
  unsubscribed_at    TIMESTAMPTZ
);

-- The send job's only query: confirmed rows that have not had this month's.
CREATE INDEX IF NOT EXISTS newsletter_active
  ON newsletter_subscriptions (last_digest_month) WHERE status = 'confirmed';

-- Token lookups are single-row and must not table-scan as this grows.
CREATE INDEX IF NOT EXISTS newsletter_confirm_token
  ON newsletter_subscriptions (confirm_token_hash) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS newsletter_unsub_token
  ON newsletter_subscriptions (unsub_token_hash);

-- RETENTION. An unconfirmed row is an address somebody typed and never
-- confirmed — quite possibly not theirs. It is not a lead and must not be kept.
-- Run this alongside the send job:
--   DELETE FROM newsletter_subscriptions
--    WHERE status = 'pending' AND created_at < now() - INTERVAL '7 days';
