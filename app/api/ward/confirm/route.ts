/**
 * GET /api/ward/confirm?t=<token> — the second half of double opt-in.
 *
 * Answers in HTML, not JSON: this URL is opened by a human clicking a link in
 * an email client, so the reply is a page, not a payload.
 *
 * The token is single-use by construction — `confirm()` only matches rows still
 * `pending`, so a second click finds nothing and says so plainly rather than
 * pretending to have worked.
 */
import { config, confirm } from '@/lib/subscriptions';

export const dynamic = 'force-dynamic';

/* Inline styles, and only the two typefaces and two grounds the site uses. A
   confirmation page is one sentence; it does not get a stylesheet, a header or
   a script. */
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
    + `<small><a href="/now/air">Delhi&rsquo;s air &mdash; the reading, and how it is made</a></small>`
    + `</main></body></html>`,
    { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } },
  );
}

export async function GET(req: Request) {
  if (!config.db) return page('Not configured', '<p>This site has no subscription store yet, so there is nothing to confirm.</p>', 503);

  const t = new URL(req.url).searchParams.get('t');
  if (!t) return page('Nothing to confirm', '<p>That link is missing its token.</p>', 400);

  let sub;
  try { sub = await confirm(t); }
  catch (e) {
    console.error('[ward/confirm]', e instanceof Error ? e.message : e);
    return page('Something broke', '<p>That did not work. Nothing changed. Try the link again.</p>', 500);
  }

  if (!sub) {
    return page('Already done, or expired', '<p>That link has been used already, or it is not '
      + 'one of ours. If you are still waiting to be confirmed, ask again from the page and we '
      + 'will send a fresh link.</p>', 410);
  }

  return page('You are watching ' + escapeHtml(sub.station.replace(/,\s*Delhi\s*-\s*/, ' · ')),
    `<p>Confirmed. You will get <b>one message when this monitor&rsquo;s band changes for the worse</b>, `
    + `and nothing else.</p>`
    + `<p>Not a newsletter, not a digest of our work, and your address is never shared with anybody. `
    + `Every message carries a one-click link to stop them.</p>`);
}

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
