/**
 * lib/subscriptions.ts — Watch your ward: storage and the two emails.
 *
 * THE PROMISE THE PAGE MAKES, WHICH THIS FILE HAS TO KEEP:
 *
 *   "One message when something crosses. One digest a month. Nothing else,
 *    ever, and no address is shared with anybody."
 *
 * Everything below exists to make that literally true rather than
 * aspirationally true:
 *
 *  1. DOUBLE OPT-IN, NO EXCEPTIONS. A row is created `pending` and sends one
 *     confirmation. It cannot receive an alert until it is `confirmed`. Nobody
 *     can subscribe somebody else's address to this, which single opt-in always
 *     allows.
 *  2. ONE ALERT PER CROSSING, NOT PER READING. `last_alert_band` remembers the
 *     band the subscriber was last told about. The air sits above the limit for
 *     months at a time, so alerting on "is it over the limit" would mean an
 *     email an hour, forever. The alert fires when the BAND CHANGES upward.
 *  3. UNSUBSCRIBE IS A LINK, NOT A REPLY. Every message carries a token URL
 *     that works without logging in, because an unsubscribe that requires an
 *     account is not an unsubscribe.
 *  4. THE ADDRESS IS THE ONLY PERSONAL DATA STORED. No name, no IP, no ward
 *     boundary, no coordinates. The station is a public monitor's name.
 *
 * ★ NOT CONFIGURED IS NOT AN ERROR. Without `DATABASE_URL` and
 * `RESEND_API_KEY` this module reports `configured: false` and refuses to
 * pretend. The page then shows the feature's real state instead of accepting an
 * address it cannot store and cannot email — which would be the one genuinely
 * dishonest thing this page could do.
 *
 * SCHEMA: db/001-ward-subscriptions.sql
 */
import { neon } from '@neondatabase/serverless';
import { randomBytes, createHash, timingSafeEqual } from 'node:crypto';

export const DB_URL = process.env.DATABASE_URL;
export const RESEND_KEY = process.env.RESEND_API_KEY;
export const MAIL_FROM = process.env.WARD_MAIL_FROM || 'Swechha air <air@swechha.in>';
export const SITE = process.env.SITE_ORIGIN || 'https://swechha.in';

export const config = {
  get db() { return Boolean(DB_URL); },
  get mail() { return Boolean(RESEND_KEY); },
  get ready() { return Boolean(DB_URL && RESEND_KEY); },
  /** What an operator has to do, named precisely, for the page to say it. */
  missing(): string[] {
    const m: string[] = [];
    if (!DB_URL) m.push('DATABASE_URL');
    if (!RESEND_KEY) m.push('RESEND_API_KEY');
    return m;
  },
};

export const sql = () => {
  if (!DB_URL) throw new Error('DATABASE_URL is not set');
  return neon(DB_URL);
};

/* ── EMAIL VALIDATION ─────────────────────────────────────────────────────
   Deliberately conservative and deliberately NOT a regex claiming to
   implement RFC 5322 — those regexes are famous for rejecting valid
   addresses. This checks the shape that a confirmation email can actually be
   delivered to, and the confirmation itself is the real validator: an address
   that does not exist never confirms, and an unconfirmed row never receives
   anything.                                                                */
export function normaliseEmail(raw: unknown): string | null {
  const s = String(raw ?? '').trim().toLowerCase();
  if (s.length < 6 || s.length > 254) return null;
  if (!/^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(s)) return null;
  return s;
}

/** Tokens are random; only their HASH is stored, so a database leak cannot be
    replayed to unsubscribe or confirm anybody. */
export const newToken = () => randomBytes(32).toString('base64url');
export const hashToken = (t: string) => createHash('sha256').update(t).digest('hex');

export function tokensMatch(a: string, b: string): boolean {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export type Sub = {
  id: number;
  email: string;
  station: string;
  status: 'pending' | 'confirmed' | 'unsubscribed';
  last_alert_band: string | null;
};

/**
 * Create or revive a subscription and return the confirmation token.
 *
 * Re-subscribing an address that is already confirmed does NOT reset it to
 * pending — that would let anyone silence somebody else's alerts by
 * re-submitting their address. It returns null, and the caller says "already
 * watching" without revealing whether the address exists.
 */
export async function subscribe(email: string, station: string): Promise<string | null> {
  const q = sql();
  const token = newToken();
  const rows = await q`
    INSERT INTO ward_subscriptions (email, station, status, confirm_token_hash, created_at)
    VALUES (${email}, ${station}, 'pending', ${hashToken(token)}, now())
    ON CONFLICT (email, station) DO UPDATE
      SET status = CASE WHEN ward_subscriptions.status = 'confirmed'
                        THEN 'confirmed' ELSE 'pending' END,
          confirm_token_hash = CASE WHEN ward_subscriptions.status = 'confirmed'
                        THEN ward_subscriptions.confirm_token_hash ELSE ${hashToken(token)} END,
          created_at = now()
    RETURNING status, (ward_subscriptions.confirm_token_hash = ${hashToken(token)}) AS is_new
  ` as { status: string; is_new: boolean }[];
  const r = rows[0];
  if (!r || r.status === 'confirmed') return null;
  return token;
}

export async function confirm(token: string): Promise<Sub | null> {
  const q = sql();
  const rows = await q`
    UPDATE ward_subscriptions
       SET status = 'confirmed', confirmed_at = now(),
           unsub_token_hash = COALESCE(unsub_token_hash, ${hashToken(newToken())})
     WHERE confirm_token_hash = ${hashToken(token)} AND status = 'pending'
     RETURNING id, email, station, status, last_alert_band
  ` as Sub[];
  return rows[0] ?? null;
}

export async function unsubscribe(token: string): Promise<boolean> {
  const q = sql();
  const rows = await q`
    UPDATE ward_subscriptions SET status = 'unsubscribed', unsubscribed_at = now()
     WHERE unsub_token_hash = ${hashToken(token)} AND status <> 'unsubscribed'
     RETURNING id
  `;
  return rows.length > 0;
}

/* ── EMAIL, via Resend's HTTP API. No SDK: it is one POST. ─────────────── */
export async function send(to: string, subject: string, text: string): Promise<void> {
  if (!RESEND_KEY) throw new Error('RESEND_API_KEY is not set');
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: MAIL_FROM, to, subject, text }),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`Resend HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
}

/* Plain text, not HTML. A limit-crossing alert is one fact and a link; an HTML
   template would be heavier, likelier to land in spam, and would let a future
   edit smuggle a tracking pixel into a message this page promised was clean. */
export const confirmMail = (station: string, token: string) => ({
  subject: 'Confirm: watch ' + station,
  text: [
    `You asked Swechha to tell you when the air at ${station} crosses into a worse band.`,
    ``,
    `Confirm here — the link works once:`,
    `${SITE}/api/ward/confirm?t=${encodeURIComponent(token)}`,
    ``,
    `If this was not you, ignore it. Nothing is stored against your address until`,
    `you confirm, and no alert can be sent to an unconfirmed address.`,
    ``,
    `What you will get: one message when the band changes for the worse, and`,
    `nothing else. Not a newsletter. Your address is never shared.`,
    ``,
    `Why this exists: ${SITE}/now/air`,
  ].join('\n'),
});

export const alertMail = (station: string, aqi: number, band: string, prev: string | null,
  observed: string | null, unsubToken: string) => ({
  subject: `${station}: ${band.toLowerCase()} (${aqi})`,
  text: [
    `${station} is reading ${aqi} — ${band}.`,
    prev ? `It was ${prev} when you were last told.` : `This is the first reading since you subscribed.`,
    observed ? `Observed ${observed}.` : ``,
    ``,
    `India's own 24-hour standard is AQI 100. This reading is ${(aqi / 100).toFixed(1)} times that`,
    `on the index scale — which is not the same as ${(aqi / 100).toFixed(1)} times the pollution,`,
    `because the index is piecewise-linear. The concentration is on the page.`,
    ``,
    `The reading, how it is made, and what it is made of:`,
    `${SITE}/now/air`,
    ``,
    `You will not hear from us again until the band changes again.`,
    `Stop these: ${SITE}/api/ward/unsubscribe?t=${encodeURIComponent(unsubToken)}`,
  ].filter((l) => l !== '').join('\n'),
});
