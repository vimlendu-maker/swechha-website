-- 003-rate-limits.sql — the counter behind lib/rate-limit.ts.
--
-- ★ WHY THIS EXISTS. Audited in production on 23 August 2026:
-- `POST /api/newsletter/subscribe` and `POST /api/ward/subscribe` each accept
-- an unauthenticated request and send an email, via Resend, to whatever address
-- the body names. There was no rate limit, captcha or honeypot anywhere in the
-- app. Three things follow from that, and the third is the reason this is not
-- merely untidy:
--   1. anybody can send unlimited confirmation mail to a third party, carrying
--      swechha.in's From: address;
--   2. the Resend quota and this database are both somebody else's to exhaust;
--   3. mail sent that way gets the SENDING DOMAIN blocklisted, which breaks
--      double opt-in for every genuine reader. The abuse costs the attacker
--      nothing and costs the org its ability to email at all.
--
-- ★ IT STORES A HASH, NEVER AN ADDRESS OR AN IP.
-- `lib/subscriptions.ts` opens by promising, in its fourth numbered point,
-- "THE ADDRESS IS THE ONLY PERSONAL DATA STORED. No name, no IP, no ward
-- boundary, no coordinates." A rate limiter is exactly the feature that
-- ordinarily breaks that promise, so this one is built not to: `actor_hash` is
-- a salted SHA-256 and the plaintext never reaches a column. The salt is
-- required and not decorative — unsalted SHA-256 of an IPv4 address is
-- reversible by enumerating four billion candidates, which is minutes of work,
-- so an unsalted hash here would be an IP log with extra steps.
--
-- ★ IT IS A LEDGER OF HITS, NOT A COUNTER PER ACTOR. One row per accepted
-- request, counted inside a moving window. That costs more rows than a counter
-- with a reset timestamp, and buys the property that matters: a fixed-window
-- counter lets an attacker send `limit` requests at 14:59 and `limit` again at
-- 15:00. Rows in a window cannot be gamed that way. `lib/rate-limit.ts` prunes
-- them; nothing here needs to grow without bound.
--
-- Safe to run twice, like every file in this directory.

CREATE TABLE IF NOT EXISTS rate_limit_hits (
  id          BIGSERIAL PRIMARY KEY,
  -- Which limit this counts against, e.g. 'newsletter:ip', 'ward:email'.
  bucket      TEXT NOT NULL,
  -- Salted SHA-256, hex. NEVER a raw IP and never a raw address. See above.
  actor_hash  TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- The read path is always "how many hits for this bucket and actor since T",
-- so the index leads with both and carries the timestamp.
CREATE INDEX IF NOT EXISTS rate_limit_hits_lookup
  ON rate_limit_hits (bucket, actor_hash, created_at DESC);

-- The prune path is "everything older than T", regardless of bucket.
CREATE INDEX IF NOT EXISTS rate_limit_hits_created
  ON rate_limit_hits (created_at);
