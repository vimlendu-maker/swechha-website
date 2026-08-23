/**
 * lib/reply-page.ts — the one-sentence HTML page a confirm/unsubscribe link
 * lands on.
 *
 * These URLs are opened by a human clicking a link in an email client, so the
 * reply is a page and not a payload. It is deliberately the smallest page on
 * the site: no stylesheet, no header, no nav, no script. A confirmation is one
 * fact and one way back.
 *
 * ★ WHY IT IS EXTRACTED. `app/api/ward/confirm` and `app/api/ward/unsubscribe`
 * each carry their own copy of this markup, identical down to the hex values.
 * Adding the newsletter's two routes would have made four, which is four places
 * for one design to drift — and the colours here are hardcoded on purpose (the
 * page ships no stylesheet), so a brand change would have to find all of them.
 *
 * KNOWN, AND DELIBERATELY NOT DONE YET: the two ward routes still carry their
 * copies. They predate this file and they work; converting them was attempted
 * and reverted because it is a change to a shipped, tested feature made for
 * tidiness rather than for a defect. The next person to touch either ward route
 * for its own reasons should point it here and delete its local `page()`. Until
 * then this is two copies plus one shared definition, not three copies — the
 * newsletter routes added no new duplication.
 *
 * The palette is the site's own dark ground and mustard, stated literally
 * because there is no CSS file in this response to read a token from.
 */
export function replyPage(
  title: string,
  body: string,
  opts: { status?: number; backHref: string; backText: string } ,
) {
  const { status = 200, backHref, backText } = opts;
  return new Response(
    `<!doctype html><html lang="en"><head><meta charset="utf-8">`
    + `<meta name="viewport" content="width=device-width,initial-scale=1">`
    + `<meta name="robots" content="noindex,nofollow">`
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
    + `<small><a href="${backHref}">${backText}</a></small>`
    + `</main></body></html>`,
    { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } },
  );
}

export const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
