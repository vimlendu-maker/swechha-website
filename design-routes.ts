import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * THE ROUTE LAYER FOR THE FINISHED DESIGN SET.
 *
 * The finished pages are static HTML build artefacts under
 * `public/design/v3/` — 15 WORK pages from `scripts/build-work-pages.mjs`, the
 * situation index and its six children from the `build-situation-*` scripts,
 * and `about.html`. AD-23 put the canonical route on every href in all of
 * them: the nav says `/work`, not `/design/v3/work/index.html`.
 *
 * Nothing was serving those routes. `/work/projects`, `/work/journeys`,
 * `/work/events` and the six `/now/<slug>` were 404, and `/`, `/now`, `/work`,
 * `/work/campaigns` and `/about` answered 200 with the PRE-DESIGN Tailwind
 * scaffold — so clicking `Work` in the finished header opened the old page.
 * That is what this file fixes, by rewriting each canonical route onto the
 * built file that is the approved design for it.
 *
 * WHY A REWRITE AND NOT A REDIRECT. The reader must stay on `/work`. A
 * redirect would put `/design/v3/work/index.html` in the address bar, which is
 * the prototype path the whole of AD-23 took out of the markup — and it would
 * be the URL people copied and shared.
 *
 * ── THIS IS A BRIDGE, AND ITS EXPIRY IS KNOWN ──────────────────────────────
 * AD-17 §6.4 IS NOW SATISFIED, and this is how: `public/design/` no longer
 * exists. The 27 built pages moved to `public/_pages/v3/`, the 12 superseded
 * prototypes and the orphaned `credits.json` were deleted, and the four
 * harnesses (`system.html`, `_mobile.html`, `situation-soon.html`,
 * `work/_index-proposal.html`) moved to `docs/prototypes/` — out of `public/`,
 * so none of them is served, and none of them was destroyed.
 *
 * The ruling's INTENT — no second, shareable URL for a page that has a
 * canonical route — is held by `next.config.ts`'s unconditional
 * `X-Robots-Tag: noindex` on `/_pages/*` plus the `Disallow` in `app/robots.ts`,
 * because a rewrite destination must be a path Next can serve and files outside
 * `public/` are not. Serving them from a route handler instead would turn 27
 * CDN-cached static pages into a serverless invocation each, which is a real
 * cost paid for a cosmetic reading of the rule.
 *
 * The original note read: `public/design/` is deleted before any deploy, and
 * the real port — these pages as React routes, with one shared stylesheet and
 * a layout component — has not been done. So this makes the finished set live
 * for review at its real URLs TODAY; it is not the port, and it does not
 * pretend to be. Before a deploy, either the port lands and this file goes, or
 * the built HTML moves out of `public/design/` and the destinations change.
 * Nothing else in the app depends on it: delete the file and the `rewrites()`
 * hook, and the scaffold routes come back exactly as they were.
 *
 * ROUTES WITH NO FINISHED PAGE ARE LEFT ALONE, deliberately: `/explore` and
 * `/work/campaigns/<slug>` keep their real app routes. Shadowing a route with
 * a page that does not exist would trade a scaffold for a 404.
 *
 * `/search` LEFT THAT LIST and is now built. It indexes the 29 BUILT PAGES,
 * read out of each page's own `rel=canonical` — not `content/`, which
 * `lib/search.ts` indexes and which holds four entries because five of the six
 * content directories are empty. `lib/search.ts` and `app/search/page.tsx` are
 * superseded by that and serve nothing now this route is mapped; they are left
 * in place because `lib/search.test.ts` covers the function, and deleting
 * tested code is its own decision.
 *
 * `/stories` LEFT THAT LIST ON 22 AUGUST (AD-26) and `/publications` joined
 * the map with it. Both are the owner's answers to AD-26 §5 made buildable:
 * the nav STAYS at AD-19's six words and these two are reached from the
 * footer, whose "Stories and films" and "Publications" links had been
 * pointing at `/now` — an air-and-river index — since commit 812235a.
 * `/stories/<slug>` IS NOW BUILT TOO — five essay pages, one per bylined
 * piece recovered from the old blog. The three placeholder markdown stories
 * that used to sit behind that route were retired; these replace them with
 * writing that carries a name and a date.
 *
 * `/impact` JOINED THE MAP ON 22 AUGUST (AD-22). It was in the paragraph above
 * until its page existed, and this is the failure mode that paragraph was
 * written to prevent working in reverse: the nav has said `/impact` on every
 * page of this site since AD-23, so for as long as the route was unmapped,
 * clicking `Impact` in the finished header opened the 25-line Tailwind
 * placeholder — the same defect, on the same nav bar, that this whole file was
 * written to fix for `Work`. Building a page is not shipping it; routing it
 * is.
 *
 * `/farm` JOINED ON 22 AUGUST (AD-24), the same lesson a third time with one
 * extra turn of the screw. `Farm` has been a nav word on every page of this
 * site since AD-23, but unlike `Impact` it pointed at `/#farm` — a homepage
 * ANCHOR — because there was no farm page to point at. So the failure here was
 * not a 404 and not a placeholder: it was a link that worked perfectly and
 * delivered the reader to a teaser band whose own button was `href="#"`.
 * AD-24 builds the page D-07.13 promised, repoints the nav word in BOTH
 * shells, and maps the route. Those are one change, not three: a nav word, a
 * built file and a route — and any two of them without the third is a defect.
 *
 * `/act` JOINED ON 22 AUGUST (AD-25), and it is the fourth turn of the same
 * screw and the worst of them. `/act` was named in the paragraph above as the
 * one route deliberately left on its placeholder — and meanwhile the GIVE CHIP
 * in the nav of every page on this site pointed at it, the frozen homepage's
 * three "Three ways in" buttons pointed at `href="#"`, the footer's "Work with
 * us" pointed at `href="#"`, and EIGHTEEN WORK pages ended in a named ask whose
 * destination was this route. So the most-linked-to page on the site was the
 * only one nobody had built. AD-25 builds it, repoints the four dead hrefs in
 * `home.html` that should have opened it — band 12's three buttons and the
 * footer's "Work with us" — and maps the route here. The Give chip needed no
 * repointing: it had said `/act` all along, which is exactly why the missing page
 * mattered.
 */

/* `process.cwd()`, not `__dirname`: this module is now imported by
   `app/sitemap.ts` as well as `next.config.ts`, and a bundled module's
   `__dirname` is not the project root. Next runs both from the root, so
   `cwd()` is the same directory the literal used to resolve to. */
const ROOT = process.cwd()
const PUBLIC = join(ROOT, 'public')

/* The six and their index. Slugs are NOT derived from the filenames — the
   register in `scripts/lib/situation-shell.mjs`'s FAMILY is the one place a
   situation route may be written, and `heatwave` maps to `/now/heat`. Kept in
   step with it by the assertion below, which reads that file rather than
   trusting this list. */
const SITUATIONS: Record<string, string> = {
  '/now': 'intelligence.html',
  '/now/air': 'situation-air.html',
  '/now/yamuna': 'situation-yamuna.html',
  '/now/heat': 'situation-heatwave.html',
  '/now/forest-fire': 'situation-forest-fire.html',
  '/now/forest-loss': 'situation-forest-loss.html',
  '/now/climate-event': 'situation-climate-event.html',
}

/* The WORK section is DERIVED from the generator's own route map, so a
   sixteenth page cannot be built and left unrouted. `/work` is the index;
   every other route maps to the file at the same shape under `work/`. */
function workRoutes(): Record<string, string> {
  const onward = JSON.parse(
    readFileSync(join(ROOT, 'data/work/onward.json'), 'utf8'),
  ) as { routes: string[] }
  const out: Record<string, string> = {}
  for (const r of onward.routes) {
    if (r === '/work') out[r] = 'work/index.html'
    else if (r.startsWith('/work/')) out[r] = `work${r.slice(5)}.html`
  }
  return out
}

export function designRoutes(): Array<{ source: string; destination: string }> {
  const map: Record<string, string> = {
    '/': 'home.html',
    ...SITUATIONS,
    ...workRoutes(),
    '/search': 'search.html',
    '/stories': 'stories.html',
    '/stories/cyclone-biparjoy': 'stories/cyclone-biparjoy.html',
    '/stories/rise-above-the-waters': 'stories/rise-above-the-waters.html',
    '/stories/young-people-accelerate-climate-action': 'stories/young-people-accelerate-climate-action.html',
    '/stories/climate-crisis-uk-and-europe': 'stories/climate-crisis-uk-and-europe.html',
    '/stories/increasing-climate-migration-assam-floods': 'stories/increasing-climate-migration-assam-floods.html',
    '/publications': 'publications.html',
    /* AD-42. `/posters` — the ten GIZ marine-plastic sheets as artefacts, the
       campaign that made them being at /work/campaigns/no-plastic. It joins the
       map in the same commit that builds it and that adds it to the footer
       index, which is the whole lesson of the four paragraphs above: a built
       page, a routed page and a linked page are one change, and any two of them
       without the third is a defect. */
    '/posters': 'posters.html',
    '/about': 'about.html',
    '/impact': 'impact.html',
    '/farm': 'farm.html',
    '/act': 'act.html',
  }

  /* THE GATE. Every generator in this repo refuses to write on a failed check
     rather than emitting something subtly wrong, and a route layer deserves
     the same: a rewrite whose target is missing serves a 404 at a URL that
     looks routed, which is harder to notice than no route at all. So a bad
     map fails the build instead. */
  const missing = Object.entries(map).filter(
    ([, file]) => !existsSync(join(PUBLIC, '_pages/v3', file)),
  )
  if (missing.length) {
    throw new Error(
      'design-routes: no built file for ' +
        missing.map(([route, file]) => `${route} -> _pages/v3/${file}`).join(', ') +
        '. Run `npm run build:work` / `npm run build:situations` / `npm run build:about`.',
    )
  }

  /* And the reverse check: the situation slugs above must match FAMILY, or the
     two have drifted the way `/situations/heatwave` once drifted from
     `/now/heat` (AD-23 §2). Read out of the shell, not restated. */
  const shell = readFileSync(join(ROOT, 'scripts/lib/situation-shell.mjs'), 'utf8')
  for (const [route, file] of Object.entries(SITUATIONS)) {
    if (route === '/now') continue
    const line = shell.split('\n').find((l) => l.includes(`file: '${file}'`))
    if (!line || !line.includes(`route: '${route}'`)) {
      throw new Error(
        `design-routes: ${file} is routed here as ${route}, which is not what FAMILY ` +
          'in scripts/lib/situation-shell.mjs says. That register wins — fix this file.',
      )
    }
  }

  return Object.entries(map).map(([source, file]) => ({
    source,
    destination: `/_pages/v3/${file}`,
  }))
}

/* THE SITEMAP READS THIS, so a page cannot be routed and left out of the map —
   the failure `app/sitemap.ts` shipped with, which advertised `/explore` and
   `/search` (both unbuilt) while omitting `/farm` and all six situations. One
   list, one source, checked by the same gate above. */
export function designRoutePaths(): string[] {
  return designRoutes().map((r) => r.source)
}
