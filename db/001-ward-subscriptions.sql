-- Watch your ward: the first of the site's two tables.
-- (The second is db/002-newsletter-subscriptions.sql, the monthly digest.)
--
-- Apply with:  npm run db:migrate      (applies every db/*.sql, safe to re-run)
--
-- NOT with psql: there is none on the development machine (no Homebrew), which
-- is why the line that used to be here never ran anywhere. And `vercel env pull`
-- will not supply DATABASE_URL — it is marked SENSITIVE, so the pull writes the
-- literal string "[SENSITIVE]". Take the connection string from the Neon
-- dashboard:  DATABASE_URL='postgresql://…' npm run db:migrate
--
-- WHAT IS AND IS NOT STORED, and why the columns stop where they do.
-- The page promises: "One message when something crosses. One digest a month.
-- Nothing else, ever, and no address is shared with anybody." So the row holds
-- an address, a public monitor's name, and the bookkeeping needed to keep that
-- promise. There is deliberately NO name, NO ip address, NO user agent, NO
-- coordinates and NO ward boundary. A column that exists gets used eventually;
-- the cheapest way to keep a privacy promise is to have nowhere to break it.

CREATE TABLE IF NOT EXISTS ward_subscriptions (
  id                 SERIAL PRIMARY KEY,

  -- Lowercased and trimmed before it arrives. The only personal data here.
  email              TEXT        NOT NULL,

  -- A CPCB monitor's own published name, e.g. 'Anand Vihar, Delhi - DPCC'.
  -- Not a ward, not a pincode: India Post publishes no coordinates for Delhi
  -- pincodes, so a monitor is the only location this site can honestly resolve.
  station            TEXT        NOT NULL,

  status             TEXT        NOT NULL DEFAULT 'pending'
                       CHECK (status IN ('pending', 'confirmed', 'unsubscribed')),

  -- ★ HASHES, NEVER THE TOKENS. A database leak must not hand anybody the
  -- ability to confirm or unsubscribe a stranger's address.
  confirm_token_hash TEXT,
  unsub_token_hash   TEXT,

  -- ★ THE COLUMN THAT MAKES THE PROMISE KEEPABLE. Delhi's air sits above the
  -- limit for months, so "alert when over the limit" would mean an email every
  -- hour forever. The alert fires when the BAND CHANGES UPWARD, and this
  -- remembers the band the subscriber was last told about.
  last_alert_band    TEXT,
  last_alert_at      TIMESTAMPTZ,

  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  confirmed_at       TIMESTAMPTZ,
  unsubscribed_at    TIMESTAMPTZ,

  -- One subscription per address per monitor. Makes re-submitting the same
  -- address idempotent instead of duplicating alerts.
  UNIQUE (email, station)
);

-- The alert job's only query: confirmed rows, grouped by monitor.
CREATE INDEX IF NOT EXISTS ward_subscriptions_active
  ON ward_subscriptions (station) WHERE status = 'confirmed';

-- Token lookups are single-row and must not table-scan as this grows.
CREATE INDEX IF NOT EXISTS ward_subscriptions_confirm_token
  ON ward_subscriptions (confirm_token_hash) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS ward_subscriptions_unsub_token
  ON ward_subscriptions (unsub_token_hash);

-- RETENTION. An unconfirmed row is an address somebody typed and never
-- confirmed — quite possibly not theirs. It is not a lead and must not be kept.
-- Run this alongside the alert job:
--   DELETE FROM ward_subscriptions
--    WHERE status = 'pending' AND created_at < now() - INTERVAL '7 days';
