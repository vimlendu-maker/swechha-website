/* ═══ THE DEAD FRAGMENT STRIPPER ═════════════════════════════════════════
 *
 * WHAT IT IS FOR. 175 permanent redirects carry the old WordPress URLs onto
 * this site, and A URL FRAGMENT IS NEVER SENT TO THE SERVER — the browser
 * keeps it locally and re-attaches it to whatever the redirect landed on. So
 * `/project/city-scapes/#7G85YEUtVME` (that tail is a YouTube video id from
 * the old Elementor page, still visible in
 * `docs/legacy/sitemaps/raw-project.xml`) arrives here as
 * `/work/journeys/cityscapes#7G85YEUtVME`. Nothing is broken — the fragment
 * matches no element, so the browser ignores it and the page renders
 * correctly, canonical and og:url already clean — but the reader is looking
 * at an address with somebody else's video id stuck on the end, and that is
 * the address they will copy and share.
 *
 * NO REDIRECT CAN FIX THIS. Not `redirects.ts`, not Next, not Vercel: none of
 * them can see a fragment. The client is the ONLY place the tail is visible,
 * which is why this is a script and not a rule.
 *
 * IT STRIPS ONLY DEAD FRAGMENTS. A fragment resolving to a real `id` or
 * `name` on the page is a working deep link — `#aim`, `#who`, `#fellows`,
 * `#measured`, `#statement` — and is left exactly alone. Only a fragment
 * pointing at nothing is removed, plus a bare trailing `#` (for which
 * `location.hash` is the empty string, so it needs its own test rather than
 * falling out of the first one).
 *
 * ── THREE THINGS IN IT ARE LOAD-BEARING ─────────────────────────────────
 * Each would be easy to "simplify" straight back into a bug:
 *
 *  · IT WAITS FOR DOMContentLoaded. In the built pages this tag sits in the
 *    head, next to TRACKER, so at parse time the body does not exist yet and
 *    `getElementById` answers null for EVERY id. Running it eagerly would
 *    strip every working anchor on the site.
 *  · IT PASSES `history.state` BACK TO `replaceState`, not null. The App
 *    Router keeps its router state in that slot, and blanking it breaks
 *    back/forward on the routes that run `app/layout.tsx`.
 *  · IT LEAVES `:~:` ALONE. That is a scroll-to-text fragment directive.
 *    Browsers that support it never expose it to `location.hash`; browsers
 *    that do not would have it stripped here, silently breaking a link the
 *    reader was sent.
 *
 * ── WHY THIS FILE EXISTS AT ALL ─────────────────────────────────────────
 * Both lanes need the same script and neither can import the other's copy:
 * `scripts/lib/situation-shell.mjs` is run by plain `node` and cannot import
 * a `.ts` module, and `app/layout.tsx` cannot import the shell, which reads
 * from disk at module scope and would drag `node:fs` into the client bundle.
 * `data/analytics.json` solves the same problem for the tracker by being
 * data; this is code, so it is a dependency-free `.mjs` that both sides
 * import instead — one copy, no drift possible, no gate needed to prove it.
 *
 * KEEP THIS FILE FREE OF IMPORTS. The moment it needs one it stops being
 * safe for the client bundle, and the two lanes go back to two copies.
 */
export const DEAD_FRAGMENT_JS =
  '(function(){function c(){var h=location.hash,u=location.href,'
  + "b=!h&&u.charAt(u.length-1)==='#';if(!h&&!b)return;if(!b){var i=h.slice(1);"
  + "if(i.indexOf(':~:')!==-1)return;var t=null;try{t=document.getElementById(decodeURIComponent(i))}"
  + 'catch(e){}if(!t)t=document.getElementById(i);if(!t)t=document.getElementsByName(i)[0]||null;'
  + "if(t)return}history.replaceState(history.state,'',location.pathname+location.search)}"
  + "if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',c);else c()})();"
