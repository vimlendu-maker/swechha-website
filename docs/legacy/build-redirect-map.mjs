/*
   THE REDIRECT MAP, DERIVED — not hand-typed into redirects.ts.

   Input : docs/legacy/wp-url-inventory.tsv  (the 2026-08-23 pre-cutover capture)
           docs/legacy/posts-analysis.json   (per-post length of real body text)
           data/about-people.json            (who is staff, who is governing body)
           content/essay/_index.json          (each essay's `original` URL)
           data/work/onward.json             (the WORK generator's route register)
   Output: docs/legacy/redirect-map.tsv      (reviewable, one row per captured URL)
           docs/legacy/redirect-map.json     (the same, input to the codegen step)

   WHY A SCRIPT AND NOT 226 HAND-WRITTEN LINES: a redirect map fails quietly.
   A typo'd destination is a 308 into a 404, which looks alive to a crawler and
   is worse than never redirecting. So the map is derived and then GATED:

   1. Every destination must be a route that actually exists on the new site.
   2. Every captured URL must be accounted for exactly once — as a redirect, or
      as a deliberate `none`. Silence is how a migration loses pages.
   3. No destination may itself be a redirect source (no chains), and nothing
      may redirect to itself.

   CONFIDENCE is stated per row, and it is not decoration:
     exact   the same thing, and a detail page exists for it
     folded  a duplicate or variant slug, onto its real twin
     parent  no page for this yet — points at the true parent section.
             THESE ARE THE RE-POINT LIST once audit §1.5's pages get built.
     RULING  needs an owner decision before it ships
     none    deliberately no redirect
*/
import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '..', '..')
const read = (p) => readFileSync(join(ROOT, p), 'utf8')
const readJSON = (p) => JSON.parse(read(p))

/* ---- THE VALID DESTINATION SET, read from the site, never restated ---- */
const ROUTES = new Set(readJSON('data/work/onward.json').routes.filter((r) => !r.includes('#')))
ROUTES.add('/')
/* Routed in design-routes.ts but built by other generators than WORK's. */
for (const r of ['/about', '/act', '/farm', '/impact', '/publications', '/search', '/stories', '/now'])
  ROUTES.add(r)

/* ---- PROJECTS: 45 old URLs. [destination, why, confidence] ---- */
const P = '/work/projects'
const PROJECTS = {
  'eco-action':                       ['/work/projects/eco-action', 'same programme, detail page exists', 'exact'],
  'bridge-the-gap':                   ['/work/projects/bridge-the-gap', 'same programme, detail page exists', 'exact'],
  'farm-school':                      ['/work/projects/farm-school', 'same programme, detail page exists', 'exact'],
  'influence-cyon':                   ['/work/projects/influence', 'Influence/CYON is the new Influence item', 'exact'],
  'me-to-we-pagdandi':                ['/work/projects/me-to-we', 'Me to We, with Pagdandi as its origin', 'exact'],
  'yamuna-yatra':                     ['/work/journeys/yamuna-yatra', 'same journey, detail page exists', 'exact'],
  'gram-anubhav':                     ['/work/journeys/gram-anubhav', 'same journey, detail page exists', 'exact'],
  'city-scapes':                      ['/work/journeys/cityscapes', 'same journey, de-hyphenated slug', 'exact'],
  'nature-scapes':                    ['/work/journeys/naturescapes', 'same journey, de-hyphenated slug', 'exact'],
  'monsoon-wooding':                  ['/work/campaigns/monsoon-wooding', 'same campaign, detail page exists', 'exact'],
  'pagdandi':                         ['/work/projects/me-to-we', 'Pagdandi is Me to We before the rename (audit 1.5)', 'exact'],
  'green-action-in-schools':          ['/work/projects/eco-action', 'the schools strand of Eco Action (audit 1.5)', 'exact'],

  'farm-school-community-development':['/work/projects/farm-school', 'variant slug of the farm-school page', 'folded'],
  'green-the-map-2':                  ['/stories', 'duplicate of green-the-map', 'folded'],
  'cycles-for-sustainability-2':      ['/work/events', 'duplicate of cycles-for-sustainability', 'folded'],
  'women-farmers-collective-2':       ['/farm', 'duplicate of women-farmers-collective', 'folded'],
  'women-and-non-traditional-livelihood-2': [P, 'duplicate of the unsuffixed slug', 'folded'],
  'futures-lifestyles-project':       [P, 'typo twin of future-lifestyles-project', 'folded'],
  'remakery-india':                   [P, 'duplicate of remakery', 'folded'],

  'bee-keepers-collective-training':      ['/farm', 'farm training suite (audit 1.5)', 'parent'],
  'composting-and-micro-enterprises':     ['/farm', 'farm training suite (audit 1.5)', 'parent'],
  'soil-regeneration-training':           ['/farm', 'farm training suite (audit 1.5)', 'parent'],
  'sustainable-agriculture-training-camps':['/farm', 'farm training suite (audit 1.5)', 'parent'],
  'women-farmers-collective':             ['/farm', 'farm training suite (audit 1.5)', 'parent'],
  'water-harvesting-training':            ['/farm', 'farm training, water', 'parent'],
  'solar-energy-training':                ['/farm', 'farm training, energy', 'parent'],
  'teacher-training':                     [P, '700+ educators; no page yet', 'parent'],
  'green-exposures-eco-walks':            ['/work/journeys', 'eco-walks are journeys in the new taxonomy', 'parent'],
  'learning-communities':                 [P, 'named on /impact, no page of its own', 'parent'],
  'road-to-leadership':                   [P, 'confirmed absent (audit 1.5)', 'parent'],
  'green-creeps':                         [P, 'confirmed absent (audit 1.5)', 'parent'],
  'circular-economy-marine-litter-and-epr':[P, 'GIZ+MoEFCC work, confirmed absent', 'parent'],
  'green-finance':                        ['/publications', 'the IGES 93-enterprise study is published there', 'parent'],
  'micro-grants':                         [P, 'no page yet', 'parent'],
  'u-s-embassy-micro-grants-competition': [P, 'same programme; only in the video index', 'parent'],
  'u-s-dept-of-state-swechha-green-the-map-podcast-and-masterclass-series-on-environment-and-resilience':
                                          ['/stories', 'the podcast and masterclass series are indexed videos', 'parent'],
  'green-the-map':                        ['/stories', 'survives as the podcast series', 'parent'],
  'films-and-documentaries':              ['/stories', 'the films section indexes all 148 videos', 'parent'],
  'remakery':                             [P, 'no page yet despite /home and /about referencing it', 'parent'],
  'women-and-non-traditional-livelihood': [P, 'Udaan/MOM/Lunchbox 17; entirely missing', 'parent'],
  'future-lifestyles-project':            [P, 'no page yet', 'parent'],
  'brake-even-2':                         ['/work/campaigns', 'one ticker mention; a campaign by form', 'parent'],
  'air-pollution-campaigns':              ['/work/campaigns', 'the air campaigns live under campaigns', 'parent'],
  'cycles-for-sustainability':            ['/work/events', 'survives as the Cyclothon event', 'parent'],

  '2022-project-sample':                  [null, 'a WordPress sample placeholder, never real content', 'none'],
}

/* ---- PAGES: 19 old URLs ---- */
const PAGES = {
  '/':                          [null, 'home is home; a redirect to itself is a loop, not a mapping', 'none'],
  '/programs/':                 ['/work', 'the programmes index is now WORK', 'exact'],
  '/about-us-environment-ngo/': ['/about', 'the About page', 'exact'],
  '/get-involved/':             ['/act', '/act is the get-involved page', 'exact'],
  '/events-mainpage/':          ['/work/events', 'events are a WORK kind now', 'exact'],
  '/resources-mainpage/':       ['/publications', 'resources resolve to publications', 'exact'],
  '/swechha-blog-stories/':     ['/stories', 'the blog is /stories', 'exact'],
  '/swechha-farm-school-sustainability-non-traditional-educatio/': ['/farm', 'the farm-school page is /farm', 'exact'],
  '/in-the-news/':              ['/stories', 'four dated entries, no content; press/films live in /stories', 'parent'],
  /* The redirect is settled (owner, 2026-08-23); what /act SAYS about giving
     is a separate question. Flagged because this old page publishes two full
     bank account sets — INDIAN and FCRA — which ruling G-1 deliberately keeps
     off the new site. Pointing the URL at /act does not republish them. */
  '/donate-mainpage/':          ['/act', 'giving lives under /act; the G-1 bank-details question is about /act content, not this redirect', 'parent'],
  /* The five theme pages. WORK classifies by form, not theme (audit §2), so
     these collapse — except Cities & Ecology, which reads as the direct
     ancestor of the situation index. */
  '/sustainable-lifestyles-and-education/':               ['/work', 'theme page, collapses onto WORK', 'parent'],
  '/sustainable-agriculture-and-integrated-development/': ['/farm', 'this theme is the farm', 'parent'],
  '/sustainable-cities-and-ecology/':                     ['/now', 'the direct ancestor of the situations (audit §2)', 'parent'],
  '/resilient-and-equitable-communities/':                ['/work', 'theme page, collapses onto WORK', 'parent'],
  '/green-economy-and-enterprise/':                       ['/work', 'theme page, collapses onto WORK', 'parent'],
  '/building-narratives-for-sustainability/':             ['/stories', 'the narrative theme is the stories section', 'parent'],
  /* NOT a deliberate 404, and the reversal is evidence-led. The old page was
     indeed "a title and a breadcrumb", and on content grounds alone dropping it
     was right. But the ruling weighed the PAGE and never asked what the URL was
     earning: on 2026-08-25 /contact-us/ was still a live Google result, its
     snippet reading "Partnerships, Volunteering and Internships". That is /act,
     almost word for word. A 404 forfeits a ranking that is transferable only
     while the old index still stands. '/get-involved/' -> '/act' above is the
     same call already made. */
  '/contact-us/':               ['/act', 'still a live search result; its partnerships/volunteering promise is what /act answers', 'parent'],
  '/privacy-draft/':            [null, 'an unlinked boilerplate draft', 'none'],
  '/6220-2/':                   [null, 'an orphan test page containing the word "Button"', 'none'],
}

/* ---- RECOVERED: six URLs THE CAPTURE MISSED. -------------------------------

   The 2026-08-23 inventory was built from the old site's own sitemaps, and a
   WordPress sitemap lists what WordPress still considers current. These six
   were live pages that had already fallen out of it — so they were never
   captured, never mapped, and 404 today with nobody having decided that.

   That is the difference between this list and a `none` row: absence there is
   an instruction, absence here was an accident. Discovered 2026-08-26 while
   auditing what still links to swechha.in.

   THE INVENTORY TSV IS NOT EDITED TO ADD THEM, and that is deliberate. It is a
   dated record of one capture; back-filling it would make a factual artefact
   say something it never observed, and the next person could not tell the
   capture from the correction. These rows are declared separately, carry their
   own evidence, and are counted separately by the gate.

   EVIDENCE, per row: each was fetched from the Wayback Machine on 2026-08-26
   and returned a real archived page with HTTP 200. Timestamps below are that
   snapshot. The first two are also live Google results today, which is the
   /contact-us/ test — a 404 forfeits a ranking only while the old index still
   stands.

   [type, path, destination, why, confidence]                                 */
const RECOVERED = [
  ['project', '/project/yamuna-yatra-2/', '/work/journeys/yamuna-yatra',
   'duplicate of yamuna-yatra; archived 200 at 2025-06-24 and still a live search result', 'folded'],
  ['project', '/project/brake-even/', '/work/campaigns',
   'the unsuffixed twin of brake-even-2, which already points here; archived 200 at 2022-05-18', 'parent'],
  ['project', '/project/influence/', '/work/projects/influence',
   'the Influence programme before the CYON rename; archived 200 at 2020-02-05', 'exact'],
  ['project', '/project/me-to-we/', '/work/projects/me-to-we',
   'Me to We before the Pagdandi merge; archived 200 at 2022-01-19', 'exact'],
  ['page', '/about-us/', '/about',
   'the About page under its pre-2021 slug; archived 200 at 2021-04-15', 'exact'],
  ['page', '/what-we-do/', '/work',
   'the programmes index under its 2013 slug; /programs/ -> /work is the same call', 'parent'],
]

/* ---- POSTS ---- */
const ESSAYS = new Map(
  readJSON('content/essay/_index.json').map((e) => [new URL(e.original).pathname, e.slug]),
)
/* Five posts no title pattern catches. Each was read before being placed. */
const POST_OVERRIDES = {
  /* A ZERO-BODY POST THAT IS NOT A LOST PRESS CLIPPING, and the exception that
     made overrides outrank the length heuristic below.

     It has 0 characters of body text, so the 2014-17 rule caught it and sent it
     to a 404 with the other 51 shells. But those are press clippings about
     Swechha; this is We for Yamuna, the campaign the organisation has run since
     2000 — and on 2026-08-26 the URL was still a live Google result titled "We
     for Yamuna - Swechha", archived 200 as recently as 2025-06-24.

     Same reasoning as /contact-us/: the ruling weighed the page's body and never
     asked what the URL was earning. `/work/campaigns/we-for-yamuna` is not a
     built route yet, so this points at the index and stays on the re-point list
     until the detail page exists. */
  '/we-for-yamuna-and-you/':
    ['/work/campaigns', 'still a live search result for the campaign; detail page not built, so the index', 'parent'],

  '/low-carbon-future-participatory-workshop/':
    [P, 'a carbon-footprint workshop with 39 participants; no matching new item', 'parent'],
  '/post-covid-environment-mirage-or-hope/':
    ['/stories', 'written commentary on India\'s environment during Covid, not an event', 'parent'],
  '/yamuna-a-river-or-a-drain-walk-with-american-centre/':
    ['/work/journeys', 'a 42-person Yamuna walk — a journey, but not specifically Yamuna Yatra', 'parent'],
  '/upcycled-air-detox-planter-workshops-and-installations-with-national-geographic/':
    ['/work/projects/eco-action', 'air-detox installations in schools — the Eco Action schools strand', 'parent'],
  '/learning-to-grow-with-swechha/':
    ['/act', 'a recruitment piece aimed at 18-25s joining social enterprises (owner, 2026-08-23)', 'parent'],
}
const POST_RULES = [
  [/monsoon.?wooding/i,  '/work/campaigns/monsoon-wooding', 'a dated instance of the Monsoon Wooding campaign', 'exact'],
  [/gram.?anubhav/i,     '/work/journeys/gram-anubhav', 'a dated instance of the Gram Anubhav journey', 'exact'],
  [/naturescapes/i,      '/work/journeys/naturescapes', 'a dated NatureScapes camp', 'exact'],
  [/yamuna.?yatra/i,     '/work/journeys/yamuna-yatra', 'a dated Yamuna Yatra', 'exact'],
  [/yamuna.?shramdaan/i, '/work/events', 'a dated Shramdaan; the event has no detail page', 'parent'],
  [/yamunotsav/i,        '/work/events', 'the Yamunotsav event, no detail page', 'parent'],
  [/cyclothon/i,         '/work/events', 'the Cyclothon event, no detail page', 'parent'],
  [/greenathon/i,        '/work/events', 'the Greenathon event, no detail page', 'parent'],
  [/pagdandi/i,          '/work/projects/me-to-we', 'Pagdandi is Me to We (audit 1.5)', 'exact'],
  [/me.?to.?we/i,        '/work/projects/me-to-we', 'a dated Me to We activity', 'exact'],
  [/she.?leads.?change/i,P, 'She Leads Change has no detail page yet', 'parent'],
  [/farm.?school/i,      '/work/projects/farm-school', 'a dated Farm School activity', 'exact'],
  [/airshed|eco.?action|greening schools|nature club|insect hotel|birdwatch/i,
                         '/work/projects/eco-action', 'the airshed park and schools greening are Eco Action', 'exact'],
  [/\bcyon\b|influence/i,'/work/projects/influence', 'Influence/CYON', 'exact'],
  [/learning communit/i, P, 'Learning Communities has no page of its own', 'parent'],
  [/air pollution|country with a mask|hawa light kar/i,
                         '/work/campaigns', 'an air-pollution campaign activity', 'parent'],
  [/green the map|podcast/i, '/stories', 'the Green The Map podcast is in the video index', 'parent'],
  [/masterclass|webinar|panel discussion|in conversation with|cinegreen|premier/i,
                         '/stories', 'a talk or film event; the video index carries these', 'parent'],
  [/remakery|monthly mixer|open mic/i, P, 'Remakery has no page yet despite being referenced', 'parent'],
  [/urban gardening|grow your own food|wind chime|butterfly garden|vermicompost/i,
                         '/farm', 'a growing or composting workshop; the farm is the true parent', 'parent'],
  [/nursery/i,           '/farm', 'the community native nursery is farm work', 'parent'],
  [/eco.?walk|exposure|azaad|flash mob|spotted|swm training|community impact|winter camp|survey mapping|school program/i,
                         '/work', 'a programme activity with no specific new page', 'parent'],
]

/* ---- PROFILES ---- */
const people = readJSON('data/about-people.json')
const TEAM = new Set(people.team.map((p) => p.slug))
const BOARD = new Set(people.governing_body.map((p) => p.slug))

const SKIP = {
  attachment:  'a WordPress attachment page, never reader-facing content',
  soliloquy:   'a slider object, never a page',
  post_tag:    'a tag archive; the new site has no tag taxonomy',
  'pj-categs': 'a project-category archive; WORK classifies by form instead',
  'pl-categs': 'a playlist-category archive; superseded by the video index',
}

/* ================================ BUILD ================================ */
const inv = read('docs/legacy/wp-url-inventory.tsv').trim().split('\n').map((l) => {
  const [type, url] = l.split('\t')
  return { type, path: new URL(url).pathname }
})
const posts = new Map(readJSON('docs/legacy/posts-analysis.json').map((r) => [r.path, r]))
const rows = []

for (const { type, path } of inv) {
  let to = null, why = '', conf = 'none', title = posts.get(path)?.title

  if (SKIP[type]) {
    why = SKIP[type]
  } else if (type === 'page') {
    const hit = PAGES[path]
    if (!hit) throw new Error(`unmapped page: ${path}`)
    ;[to, why, conf] = hit
  } else if (type === 'project') {
    const slug = path.replace(/^\/project\//, '').replace(/\/$/, '')
    const hit = PROJECTS[slug]
    if (!hit) throw new Error(`unmapped project: ${slug}`)
    ;[to, why, conf] = hit
  } else if (type === 'profile') {
    const slug = path.replace(/^\/profile\//, '').replace(/\/$/, '')
    if (TEAM.has(slug))        { to = '/about'; why = 'staff bio; /about carries the team section'; conf = 'exact' }
    else if (BOARD.has(slug))  { to = '/about'; why = 'governing body bio; /about carries the board section'; conf = 'exact' }
    /* Kamlika Chandla is the one old profile with nobody behind it: 16 old
       profiles and 16 new people, but the sets differ — the new data has
       naveen-joshua, the old site has her. OWNER, 2026-08-23: she has left.
       So no redirect. The other 15 point at /about because they ARE on it;
       sending a reader looking for her to a page that never names her is a
       promise the page cannot keep, and a former colleague's bio going quiet
       is the normal outcome, not a defect. */
    else                       { to = null; why = 'has left the organisation (owner, 2026-08-23); not on /about, so nothing to point at'; conf = 'none' }
  } else if (type === 'post') {
    const rec = posts.get(path)
    if (!rec) throw new Error(`post not in analysis: ${path}`)
    if (ESSAYS.has(path)) {
      to = `/stories/${ESSAYS.get(path)}`
      why = 'republished verbatim as an essay; exact content match'
      conf = 'exact'
    } else if (POST_OVERRIDES[path]) {
      /* ★ BEFORE the length rule, not after — changed 2026-08-26. A reviewed,
         per-URL ruling must outrank a heuristic, or a zero-body post can never
         be rescued no matter what evidence is found for it (which is exactly
         what happened to /we-for-yamuna-and-you/). The three pre-existing
         overrides all have bodies of 549-1740 characters, so none of them
         reaches the length rule either way and this reorder does not move
         them. */
      ;[to, why, conf] = POST_OVERRIDES[path]
    } else if (rec.textLen < 40) {
      /* 61 posts carry ZERO characters of body text. The distribution is
         cleanly bimodal — 61 at exactly 0, then nothing until 200 — so there
         is no threshold to argue about.

         The 51 from 2014-17 are the lost press-clipping shells: no body, no
         featured image, no attachment, and nothing anywhere else on the new
         site. They 404.

         The 8 dated 2025-08-21 are different, and the difference was checked
         rather than assumed: every one of them names a broadcast whose VIDEO is
         in data/media/youtube-index.json (probed for 'breakfast club',
         'heatwave', 'uttarkashi', 'rahul gandhi', 'dharali', 'times now',
         'airshed', 'ndtv', 'monsoon wooding', 'choking' — 10 for 10). So the
         thing the reader clicked does exist on the new site; only the old
         post's body was ever empty. OWNER, 2026-08-23: send them to /stories,
         where the films section carries all 148 videos. */
      const recent = rec.date >= '2024'
      to = recent ? '/stories' : null
      why = recent
        ? 'zero-body press shell, but the broadcast it names is in the 148-video index (owner, 2026-08-23)'
        : 'empty shell: zero characters of body text, nothing anywhere to send a reader to'
      conf = recent ? 'parent' : 'none'
    } else {
      const rule = POST_RULES.find(([re]) => re.test(rec.title) || re.test(path))
      if (!rule) throw new Error(`no rule and no override for post: ${path} — "${rec.title}"`)
      ;[, to, why, conf] = rule
    }
  }
  rows.push({ type, from: path, to, why, confidence: conf, title })
}

/* The six the capture never saw. Appended after the inventory loop so the
   generated map stays in one piece, while the gate below still counts the two
   sources separately — a recovered row must never be mistaken for a captured
   one. */
const captured = new Set(rows.map((r) => r.from))
for (const [type, from, to, why, confidence] of RECOVERED) {
  if (captured.has(from)) throw new Error(`recovered URL is already in the capture: ${from}`)
  rows.push({ type, from, to, why, confidence })
}

/* ============================== THE GATE ============================== */
const problems = []
const sources = new Set(rows.filter((r) => r.to).map((r) => r.from))
for (const r of rows) {
  if (r.to && !ROUTES.has(r.to)) problems.push(`destination is not a real route: ${r.from} -> ${r.to}`)
  if (r.to && sources.has(r.to)) problems.push(`chained redirect: ${r.from} -> ${r.to}, itself a source`)
  if (r.to && r.to === r.from) problems.push(`self-redirect: ${r.from}`)
  if (r.to === null && r.confidence !== 'none' && r.confidence !== 'RULING')
    problems.push(`no destination but confidence "${r.confidence}": ${r.from}`)
}
if (rows.length !== inv.length + RECOVERED.length)
  problems.push(`accounted ${rows.length} of ${inv.length} captured + ${RECOVERED.length} recovered URLs`)
if (problems.length) {
  console.error('MAP REFUSED:\n' + problems.map((p) => '  ' + p).join('\n'))
  process.exit(1)
}

/* =============================== EMIT =============================== */
writeFileSync(join(HERE, 'redirect-map.json'), JSON.stringify(rows, null, 2))
writeFileSync(
  join(HERE, 'redirect-map.tsv'),
  'type\tconfidence\tfrom\tto\twhy\n' +
    rows.map((r) => [r.type, r.confidence, r.from, r.to ?? '(none — 404)', r.why].join('\t')).join('\n') + '\n',
)

const content = rows.filter((r) => !SKIP[r.type])
const tally = (rs) => rs.reduce((a, r) => ((a[r.confidence] = (a[r.confidence] ?? 0) + 1), a), {})
console.log('captured URLs        :', inv.length)
console.log('recovered URLs       :', RECOVERED.length, '(missing from the capture; see RECOVERED)')
console.log('total rows           :', rows.length)
console.log('content URLs         :', content.length)
console.log('  redirected         :', content.filter((r) => r.to).length)
console.log('  deliberate 404     :', content.filter((r) => !r.to).length)
console.log('non-content 404       :', rows.length - content.length)
console.log('\nconfidence, content URLs only:')
for (const [k, v] of Object.entries(tally(content)).sort((a, b) => b[1] - a[1]))
  console.log('  ', k.padEnd(7), v)
console.log('\nRE-POINT LIST — "parent" rows to revisit as §1.5 pages get built:',
  content.filter((r) => r.confidence === 'parent').length)
console.log('NEEDS A RULING:', content.filter((r) => r.confidence === 'RULING').length)
