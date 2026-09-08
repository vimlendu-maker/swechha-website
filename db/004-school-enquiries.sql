-- 004-school-enquiries.sql — the school enquiry, and the third table.
--
-- Apply with:  npm run db:migrate      (applies every db/*.sql, safe to re-run)
-- See db/001 for why not psql, and why `vercel env pull` cannot give you the URL.
--
-- ★ WHY THIS TABLE EXISTS, AND WHAT IT REVERSES.
-- scripts/build-schools.mjs opened with a refusal: "THE ENQUIRY IS THE ASK, NOT
-- A FORM. AD-27.17's school Ask already collects exactly what a coordinator
-- needs to send — school, name and role, year group and numbers, what they have
-- in mind, when in the year — and it does it with no backend, no stored personal
-- data and no promise the site cannot keep. A stored enquiry form is a different
-- decision (a table of school contact details, a retention rule, a named
-- recipient) and it is the owner's to make, not this build's."
--
-- The owner has now made it. So this file supplies the three things that
-- refusal named as its price, and none of them is left implicit:
--   a table of school contact details  — below, with every column justified;
--   a retention rule                   — twelve months, stated on the page and
--                                        enforced by the query at the bottom;
--   a named recipient                  — Vimlendu Jha, the same person the
--                                        mailto Ask has always gone to. It is
--                                        lib/school-enquiry.ts's ENQUIRY_TO.
--
-- ★ THE MAILTO ASK DOES NOT GO AWAY, and that is not hedging. A mailto works
-- with scripting off, with the database down and with RESEND_API_KEY unset, and
-- it puts the coordinator in their own sent-items folder with a copy of what
-- they said. The form is the better path when it is available; the Ask is the
-- one that cannot break. The page carries both and says which is which.
--
-- ★ WHAT IS STORED IS WHAT A REPLY NEEDS, AND THE REPLY IS THE PURPOSE.
-- This is the first table on this site that stores a NAMED PERSON rather than a
-- bare address, and the rule 001 and 002 run on — "the cheapest way to keep a
-- privacy promise is to have nowhere to break it" — cannot be applied
-- unchanged: you cannot ring a school back without knowing which school and who
-- asked. So the rule here is the next one down: every column is a field the
-- enquirer typed into a labelled box on a page that says what happens to it,
-- and NOTHING is inferred, enriched or captured behind their back.
--
-- Specifically, and for the same reason 001 and 002 say so: NO ip address, NO
-- user agent, NO referrer, NO analytics id, NO utm parameters, NO record of
-- which pages they read before writing. A column that exists gets used.
--
-- ★ ONE OPTIONAL FIELD IS OPTIONAL IN THE COLUMN TOO. `phone` is NULLable
-- because a coordinator who would rather be emailed should be able to leave it
-- blank and still be answered — a required phone number on a school form is
-- collected because it is easy to require, not because the reply needs it.

CREATE TABLE IF NOT EXISTS school_enquiries (
  id              BIGSERIAL PRIMARY KEY,

  -- ── WHO IS ASKING. Trimmed and length-capped before it arrives; see
  -- lib/school-enquiry.ts's FIELDS, which is the single definition of every
  -- limit below and is what the form, the API and this schema all read from.
  school          TEXT        NOT NULL,
  contact_name    TEXT        NOT NULL,
  designation     TEXT,
  email           TEXT        NOT NULL,
  phone           TEXT,

  -- ── WHAT THEY ARE ASKING FOR.
  -- `year_group` is free text on purpose: Indian schools say Class 8, Grade 8,
  -- Std VIII, Year 9 and IB MYP 3 for overlapping cohorts, and a select box
  -- would force a coordinator to translate their own school into ours.
  year_group      TEXT,
  -- Approximate, and the form says approximate. A cohort is not booked here.
  students        INTEGER     CHECK (students IS NULL OR (students > 0 AND students <= 5000)),

  -- ★ A CLOSED VOCABULARY, AND IT IS THE SIX PROGRAMMES data/schools.json
  -- LISTS PLUS 'unsure'. Not a free-text "programme" field: the whole value of
  -- this column is that it can be grouped, and it can only be grouped if it
  -- cannot drift. lib/school-enquiry.ts derives the list from
  -- data/schools.json at request time and rejects anything else, so a seventh
  -- programme added to that file is accepted here without a migration — and a
  -- string that is not a programme is refused rather than stored.
  programme       TEXT        NOT NULL,

  -- 'YYYY-MM' from an <input type="month">, or NULL. Stored as text rather than
  -- a date because a month is not a day and coercing it to the 1st would invent
  -- a date the enquirer did not give.
  preferred_month TEXT        CHECK (preferred_month IS NULL OR preferred_month ~ '^[0-9]{4}-[0-9]{2}$'),
  duration_pref   TEXT,

  -- What they actually wrote. The one field that carries the enquiry.
  message         TEXT,

  -- ── BOOKKEEPING, and only what the recipient needs to work the list.
  -- 'new' -> 'answered' | 'closed'. Nobody is emailed off the back of this
  -- table: there is no send job, no digest and no list. It is an inbox.
  status          TEXT        NOT NULL DEFAULT 'new'
                    CHECK (status IN ('new', 'answered', 'closed')),

  -- Whether the notification to ENQUIRY_TO actually went out. An enquiry that
  -- is stored but not delivered is the failure mode that loses a school, and
  -- without this column it is invisible: the API returns success to the
  -- coordinator as soon as the row is committed, because a mail provider being
  -- down is not their problem and re-typing the form is not their remedy.
  notified_at     TIMESTAMPTZ,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- The recipient's only query: the unanswered ones, newest first.
CREATE INDEX IF NOT EXISTS school_enquiries_open
  ON school_enquiries (created_at DESC) WHERE status = 'new';

-- The one report worth having: which programmes schools actually ask about.
-- /schools orders its six rows by duration, which is the right order for a
-- reader and tells nobody which of them a coordinator opens first.
CREATE INDEX IF NOT EXISTS school_enquiries_programme
  ON school_enquiries (programme, created_at DESC);

-- The delivery-failure sweep. Rows whose notification never went out are the
-- ones to look at first after any Resend incident.
CREATE INDEX IF NOT EXISTS school_enquiries_undelivered
  ON school_enquiries (created_at DESC) WHERE notified_at IS NULL;

-- ★ RETENTION: TWELVE MONTHS, AND THE PAGE SAYS SO.
-- An enquiry is a business contact and deleting it the week after would lose
-- the reply. Keeping it forever would build, one form at a time, a list of
-- named teachers at named schools that nobody decided to build — which is
-- exactly what 001 and 002 refuse to have. Twelve months is longer than a
-- school year, so a coordinator who asks in September and books the following
-- August is still on record, and shorter than the point at which the table
-- becomes a marketing asset.
--
-- It is NOT automatic. This runner refuses DELETE by design (see
-- scripts/db-migrate.mjs's DESTRUCTIVE guard), and a retention rule that a
-- migration applies silently is a retention rule nobody reads. Run it
-- deliberately, and the statement is here so there is no question what it is:
--
--   DELETE FROM school_enquiries
--    WHERE created_at < now() - INTERVAL '12 months'
--
-- Nothing else in this file or in lib/school-enquiry.ts ever removes a row.
