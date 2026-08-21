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
 * AD-17 §6.4 records that `public/design/` is deleted before any deploy, and
 * the real port — these pages as React routes, with one shared stylesheet and
 * a layout component — has not been done. So this makes the finished set live
 * for review at its real URLs TODAY; it is not the port, and it does not
 * pretend to be. Before a deploy, either the port lands and this file goes, or
 * the built HTML moves out of `public/design/` and the destinations change.
 * Nothing else in the app depends on it: delete the file and the `rewrites()`
 * hook, and the scaffold routes come back exactly as they were.
 *
 * ROUTES WITH NO FINISHED PAGE ARE LEFT ALONE, deliberately: `/impact` and
 * `/act` are nav destinations whose pages were never designed, and they keep
 * serving their honest placeholders. `/explore`, `/search`, `/stories` and
 * `/work/campaigns/<slug>` keep their real app routes. Shadowing a route with
 * a page that does not exist would trade a scaffold for a 404.
 */

const ROOT = __dirname
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
    '/about': 'about.html',
  }

  /* THE GATE. Every generator in this repo refuses to write on a failed check
     rather than emitting something subtly wrong, and a route layer deserves
     the same: a rewrite whose target is missing serves a 404 at a URL that
     looks routed, which is harder to notice than no route at all. So a bad
     map fails the build instead. */
  const missing = Object.entries(map).filter(
    ([, file]) => !existsSync(join(PUBLIC, 'design/v3', file)),
  )
  if (missing.length) {
    throw new Error(
      'design-routes: no built file for ' +
        missing.map(([route, file]) => `${route} -> design/v3/${file}`).join(', ') +
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
    destination: `/design/v3/${file}`,
  }))
}
