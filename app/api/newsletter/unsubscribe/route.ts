/**
 * GET /api/newsletter/unsubscribe?t=<token> — the link in every digest.
 *
 * ★ IT WORKS ON ONE CLICK, WITH NO ACCOUNT AND NO CONFIRMATION STEP.
 * An unsubscribe that asks the reader to log in, or to confirm that they really
 * meant it, is not an unsubscribe. The token in the mail is the authorisation.
 *
 * Idempotent by construction: `unsubscribe()` matches rows not already
 * unsubscribed, so a second click reports the same end state rather than an
 * error. Either way the reader is off the list, which is the only thing they
 * came here to find out.
 */
import { config, unsubscribe } from '@/lib/newsletter';
import { replyPage } from '@/lib/reply-page';

export const dynamic = 'force-dynamic';

const back = { backHref: '/now', backText: 'The six readings, side by side' };

export async function GET(req: Request) {
  if (!config.db) {
    return replyPage('Not configured',
      '<p>This site has no subscription store, so there is nothing to leave.</p>',
      { status: 503, ...back });
  }

  const t = new URL(req.url).searchParams.get('t');
  if (!t) {
    return replyPage('Nothing to unsubscribe', '<p>That link is missing its token.</p>',
      { status: 400, ...back });
  }

  let done: boolean;
  try { done = await unsubscribe(t); }
  catch (e) {
    console.error('[newsletter/unsubscribe]', e instanceof Error ? e.message : e);
    return replyPage('Something broke',
      '<p>That did not work, so you may still be on the list. Try the link again.</p>',
      { status: 500, ...back });
  }

  /* Both branches say the same true thing: you are not on the list. The first
     is "we just removed you", the second is "you already were not". Neither is
     an error and neither needs a different page. */
  return replyPage('You are off the list',
    done
      ? '<p>Done. No more digests will be sent to that address.</p>'
        + '<p>If you also asked for an air alert on a monitor, that is a separate list and this '
        + 'did not touch it — its own unsubscribe link is in those messages.</p>'
      : '<p>That address was already off the list, or the link is not one of ours. Either way, '
        + 'no digest is going to it.</p>',
    back);
}
