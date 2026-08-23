/**
 * lib/newsletter.ts — The monthly digest: storage and the two emails.
 *
 * THE PROMISE THE FORM MAKES, WHICH THIS FILE HAS TO KEEP:
 *
 *   "One email a month. What the six readings did, and what we did about it.
 *    Nothing else, ever, and no address is shared with anybody."
 *
 * It is deliberately the same shape of promise as `lib/subscriptions.ts`, and
 * for the same reason: a promise a reader can hold you to has to be one the
 * code makes literally true.
 *
 *  1. DOUBLE OPT-IN, NO EXCEPTIONS. A row is created `pending` and sends one
 *     confirmation. It cannot receive a digest until it is `confirmed`. Nobody
 *     can subscribe somebody else's address, which single opt-in always allows.
 *  2. ONE A MONTH, ENFORCED IN THE ROW. `last_digest_month` holds the YYYY-MM
 *     actually sent. The send job skips a row already stamped with the month it
 *     is sending, so a re-run cannot double-send and a half-finished run can be
 *     resumed. "Monthly" is a column, not an intention.
 *  3. UNSUBSCRIBE IS A LINK, NOT A REPLY. Every message carries a token URL
 *     that works without logging in.
 *  4. THE ADDRESS IS THE ONLY PERSONAL DATA STORED. No name, no IP, and no
 *     record of which page it was typed on.
 *
 * ★ NOT CONFIGURED IS NOT AN ERROR. Without `DATABASE_URL` and
 * `RESEND_API_KEY` the shared `config` reports false and the endpoint answers
 * 503 naming what is missing. The form then states the feature's real state
 * instead of accepting an address it cannot store and cannot email — which is
 * the one genuinely dishonest thing a subscribe box can do, and exactly what a
 * "coming soon" form does.
 *
 * ★ WHY THIS IS A SEPARATE MODULE FROM subscriptions.ts. The primitives are
 * shared and imported below — one definition of a token, a hash, an address
 * check and a send. What is NOT shared is the table, because a ward alert
 * needs a monitor and a digest does not; see db/002-newsletter-subscriptions.sql
 * for what putting them in one table would have broken.
 *
 * SCHEMA: db/002-newsletter-subscriptions.sql
 */
import {
  sql, newToken, hashToken, RESEND_KEY, SITE,
} from '@/lib/subscriptions';

/* ★ ITS OWN SENDER, NOT THE WARD ALERT'S.
   `subscriptions.ts`'s MAIL_FROM defaults to "Swechha air <air@swechha.in>",
   which is right for a limit-crossing alert about one monitor and wrong for a
   monthly digest about six readings and the work — a reader who filters or
   blocks one should not lose the other, and the From line is what they filter
   on. Two promises, two senders, the same way they are two tables. */
export const DIGEST_MAIL_FROM =
  process.env.DIGEST_MAIL_FROM || 'Swechha <hello@swechha.in>';

export { config, normaliseEmail } from '@/lib/subscriptions';

export type DigestSub = {
  id: number;
  email: string;
  status: 'pending' | 'confirmed' | 'unsubscribed';
  last_digest_month: string | null;
};

/**
 * Returns the confirm token for a row that needs confirming, or null when the
 * address is already confirmed. The caller sends nothing in the null case and
 * answers identically either way — see the route for why that matters.
 */
export async function subscribe(email: string): Promise<string | null> {
  const q = sql();
  const token = newToken();
  const rows = await q`
    INSERT INTO newsletter_subscriptions (email, status, confirm_token_hash, created_at)
    VALUES (${email}, 'pending', ${hashToken(token)}, now())
    ON CONFLICT (email) DO UPDATE
      SET status = CASE WHEN newsletter_subscriptions.status = 'confirmed'
                        THEN 'confirmed' ELSE 'pending' END,
          confirm_token_hash = CASE WHEN newsletter_subscriptions.status = 'confirmed'
                        THEN newsletter_subscriptions.confirm_token_hash
                        ELSE ${hashToken(token)} END,
          created_at = now()
    RETURNING status
  ` as { status: string }[];
  const r = rows[0];
  if (!r || r.status === 'confirmed') return null;
  return token;
}

export async function confirm(token: string): Promise<DigestSub | null> {
  const q = sql();
  const rows = await q`
    UPDATE newsletter_subscriptions
       SET status = 'confirmed', confirmed_at = now(),
           unsub_token_hash = COALESCE(unsub_token_hash, ${hashToken(newToken())})
     WHERE confirm_token_hash = ${hashToken(token)} AND status = 'pending'
     RETURNING id, email, status, last_digest_month
  ` as DigestSub[];
  return rows[0] ?? null;
}

export async function unsubscribe(token: string): Promise<boolean> {
  const q = sql();
  const rows = await q`
    UPDATE newsletter_subscriptions SET status = 'unsubscribed', unsubscribed_at = now()
     WHERE unsub_token_hash = ${hashToken(token)} AND status <> 'unsubscribed'
     RETURNING id
  `;
  return rows.length > 0;
}

/* Resend, via the same one-POST call subscriptions.ts makes — re-stated here
   only because the From line differs. Everything else is identical. */
export async function send(to: string, subject: string, text: string): Promise<void> {
  if (!RESEND_KEY) throw new Error('RESEND_API_KEY is not set');
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: DIGEST_MAIL_FROM, to, subject, text }),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`Resend HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
}

/* Plain text, not HTML. Same rule as the ward mail: lighter, likelier to reach
   an inbox, and there is no template for a future edit to hide a tracking pixel
   in — on a message whose whole selling point is that it is clean. */
export const confirmMail = (token: string) => ({
  subject: 'Confirm: the monthly digest from Swechha',
  text: [
    `You asked Swechha for the monthly digest.`,
    ``,
    `Confirm here — the link works once:`,
    `${SITE}/api/newsletter/confirm?t=${encodeURIComponent(token)}`,
    ``,
    `If this was not you, ignore it. Nothing is stored against your address until`,
    `you confirm, and nothing can be sent to an unconfirmed address.`,
    ``,
    `What you will get: one email a month — what the six readings did, and what`,
    `we did about it. Nothing else, and your address is never shared.`,
    ``,
    `This is not the air alert. That one is per-monitor and fires when a band`,
    `changes for the worse: ${SITE}/now/air`,
    ``,
    `The readings themselves are always at ${SITE}/now`,
  ].join('\n'),
});
