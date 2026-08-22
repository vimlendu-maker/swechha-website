/**
 * GET /api/ward/unsubscribe?t=<token> — one click, no login, no questions.
 *
 * There is no confirmation step and no "are you sure". An unsubscribe that asks
 * a second question is a retention tactic, and this page promised "nothing
 * else, ever". A GET is used precisely because email clients follow links, and
 * the token is unguessable, so no CSRF surface is created that matters here:
 * the only thing an attacker with the token can do is the thing the token is
 * for.
 */
import { config, unsubscribe } from '@/lib/subscriptions';

export const dynamic = 'force-dynamic';

function page(title: string, body: string, status = 200) {
  return new Response(
    `<!doctype html><html lang="en"><head><meta charset="utf-8">`
    + `<meta name="viewport" content="width=device-width,initial-scale=1">`
    + `<title>${title} — Swechha</title><style>`
    + `body{margin:0;background:#0D0D0B;color:#F3F2F0;`
    + `font-family:Newsreader,Georgia,serif;line-height:1.55;`
    + `display:grid;place-items:center;min-height:100vh;padding:24px}`
    + `main{max-width:52ch}`
    + `h1{font-family:Archivo,system-ui,sans-serif;font-weight:800;`
    + `text-transform:uppercase;letter-spacing:-.01em;font-size:clamp(1.6rem,5vw,2.4rem);`
    + `margin:0 0 18px;line-height:1.05}`
    + `p{margin:0 0 14px}`
    + `small{color:#8C8A85;display:block;margin-top:22px;font-size:14px}`
    + `a{color:#E1A32B}`
    + `</style></head><body><main><h1>${title}</h1>${body}`
    + `<small><a href="/design/v3/situation-air.html">The reading stays public, either way</a></small>`
    + `</main></body></html>`,
    { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } },
  );
}

export async function GET(req: Request) {
  if (!config.db) return page('Not configured', '<p>There is no subscription store, so there is nothing to stop.</p>', 503);

  const t = new URL(req.url).searchParams.get('t');
  if (!t) return page('Nothing to stop', '<p>That link is missing its token.</p>', 400);

  let done: boolean;
  try { done = await unsubscribe(t); }
  catch (e) {
    console.error('[ward/unsubscribe]', e instanceof Error ? e.message : e);
    return page('Something broke', '<p>That did not work, which means you may still be subscribed. '
      + 'Try the link again, or reply to any message we sent you.</p>', 500);
  }

  // Both outcomes end in the same state — stopped — so both say so.
  return done
    ? page('Stopped', '<p>You will get no further messages about that monitor. '
      + 'Nothing else was sent and nothing was shared.</p>')
    : page('Already stopped', '<p>That subscription was already ended, so there is nothing to do.</p>');
}
