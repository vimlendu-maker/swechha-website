/**
 * GET /api/newsletter/confirm?t=<token> — the second half of double opt-in.
 *
 * Answers in HTML, not JSON: this URL is opened by a human clicking a link in
 * an email client, so the reply is a page. See lib/reply-page.ts.
 *
 * The token is single-use by construction — `confirm()` only matches rows still
 * `pending`, so a second click finds nothing and says so plainly rather than
 * pretending to have worked.
 */
import { config, confirm } from '@/lib/newsletter';
import { replyPage } from '@/lib/reply-page';

export const dynamic = 'force-dynamic';

const back = { backHref: '/now', backText: 'The six readings, side by side' };

export async function GET(req: Request) {
  if (!config.db) {
    return replyPage('Not configured',
      '<p>This site has no subscription store yet, so there is nothing to confirm.</p>',
      { status: 503, ...back });
  }

  const t = new URL(req.url).searchParams.get('t');
  if (!t) {
    return replyPage('Nothing to confirm', '<p>That link is missing its token.</p>',
      { status: 400, ...back });
  }

  let sub;
  try { sub = await confirm(t); }
  catch (e) {
    console.error('[newsletter/confirm]', e instanceof Error ? e.message : e);
    return replyPage('Something broke',
      '<p>That did not work. Nothing changed. Try the link again.</p>', { status: 500, ...back });
  }

  if (!sub) {
    return replyPage('Already done, or expired',
      '<p>That link has been used already, or it is not one of ours. If you are still waiting to '
      + 'be confirmed, ask again from the page and we will send a fresh link.</p>',
      { status: 410, ...back });
  }

  return replyPage('You are on the list',
    '<p>Confirmed. <b>One email a month</b> — what the six readings did, and what we did about '
    + 'it. Nothing else.</p>'
    + '<p>This is not the air alert: that one is per-monitor and fires when a band changes for '
    + 'the worse. Your address is never shared with anybody, and every message carries a '
    + 'one-click link to stop them.</p>',
    back);
}
