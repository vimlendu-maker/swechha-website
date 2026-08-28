#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════
   detect-climate-events.mjs — THE THING THAT NOTICES.
   ───────────────────────────────────────────────────────────────────────────
     node scripts/detect-climate-events.mjs            # fetch, score, write
     node scripts/detect-climate-events.mjs --dry-run  # fetch, score, write NOTHING

   /now/climate-event led on an archive figure that cannot move for up to
   twelve months. This script is the other half: it reads the news and the
   official alert feeds every half hour, and when something is actually
   happening it writes an event dossier that the page then opens on.

   ★ NEWS IS THE TRIGGER. OFFICIAL FEEDS ARE THE CORROBORATION.
   That order is deliberate and it is the opposite of what a data-first
   instinct suggests. India's official feeds — IMD's CAP alerts, NDMA's Sachet
   aggregation — are excellent and they are ONLY ABOUT INDIA. A glacial lake
   collapsing in Nepal, a cloudburst in Tibet, a cyclone crossing Bangladesh:
   none of these appear in an Indian government feed until they reach India,
   by which time they are not early. News is the only signal that crosses the
   border, so news is what triggers. The official feeds then raise the score
   and add authority when the event IS in India.

   ★ WHAT THIS SCRIPT MAY AND MAY NOT WRITE.
   It writes: a hazard type, a place, timestamps, links, counts of who reported
   what, and a score with every component itemised. It quotes headlines
   verbatim and attributes each to its publisher.
   It does NOT write: a death toll, a cause, a consequence, or any sentence in
   its own voice. Those are `claims` in the dossier, and a claim needs a source
   and a status word before lib/climate-events.mjs will let the page build.
   The analytical depth on the published page — how many glacial lakes there
   are, what happened at South Lhonak in 2023, why a Nepali flood is a Bihari
   flood — comes from the HAZARD CONTEXT PACK for the detected type. That pack
   was researched and cited in advance, calmly, in review. Nothing is composed
   under deadline by a machine.

   ★ FAIL SOFT, AND NEVER MANUFACTURE A QUIET DAY.
   A source that does not answer is recorded as unreachable. It is never
   recorded as "nothing happened" — the same rule the coverage and FIRMS
   fetchers in this repo already follow, for the same reason. If every source
   fails, the run exits 75 (upstream silent) and changes nothing, rather than
   quietly retiring a live event because the internet blinked.
   ═══════════════════════════════════════════════════════════════════════════ */
import { writeFileSync, mkdirSync, existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { HAZARD_TERMS, TIER1, TIER2, SEVERITY_TERMS, NEGATIVE_TERMS, hay, ownedElsewhere, coordsFor, regionOf } from './lib/event-terms.mjs';
import { HAZARDS, hasContext } from './lib/climate-events.mjs';

const ROOT = resolve(import.meta.dirname, '..');
const DIR = join(ROOT, 'data', 'climate-events');
const ACTIVE = join(DIR, 'active');
const DRY = process.argv.includes('--dry-run');
const NOW = Date.now();
const UA = 'Mozilla/5.0 (compatible; SwechhaBot/1.0; +https://swechha.in)';

/* ═══ 1. SOURCES ══════════════════════════════════════════════════════════ */

/* Google News, one query per hazard family. `when:2d` is load-bearing: an
   unbounded query returns a median item age of about a week, which would keep
   resurrecting last month's flood as today's event. */
/* Scoped to THIS page's hazards. Heat, fire and forest loss are deliberately
   absent — they are /now/heat, /now/forest-fire and /now/forest-loss's
   subjects, and querying for them here would spend the request budget
   collecting stories this detector is then required to throw away. */
const NEWS_QUERIES = [
  'india flood OR flooding OR inundated when:2d',
  'india OR nepal OR himalaya cloudburst OR "flash flood" when:2d',
  'nepal OR bhutan OR tibet OR himalaya "glacial lake" OR glacier flood when:2d',
  'india landslide OR landslip deaths when:2d',
  'india cyclone OR "cyclonic storm" OR landfall when:2d',
  'india "extremely heavy rain" OR "record rainfall" when:2d',
  'nepal OR bangladesh OR pakistan flood OR landslide deaths when:2d',
];

/* Newsroom feeds, polled directly. The Hindu's two feeds were measured
   minutes-fresh; Hindustan Times' india-news likewise. HT's `environment` and
   `top-news` feeds return HTTP 200 with ZERO items — they are dead URLs that
   pass a naive up/down check, and they are deliberately not listed here. */
const RSS_FEEDS = [
  { url: 'https://www.thehindu.com/news/national/feeder/default.rss', publisher: 'The Hindu' },
  { url: 'https://www.thehindu.com/sci-tech/energy-and-environment/feeder/default.rss', publisher: 'The Hindu' },
  { url: 'https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml', publisher: 'Hindustan Times' },
];

const strip = (s) => String(s ?? '')
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
  .replace(/<[^>]+>/g, '')
  .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(+d))
  .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/\s+/g, ' ').trim();

const tagOf = (block, t) => {
  const r = new RegExp(`<${t}[^>]*>([\\s\\S]*?)</${t}>`).exec(block);
  return r ? strip(r[1]) : null;
};

/** Parse an RSS document into items. Shared by Google News and the newsrooms. */
function parseRss(xml, fallbackPublisher) {
  if (!xml.includes('<rss') && !xml.includes('<item')) return null;
  return [...xml.matchAll(/<item[\s>]([\s\S]*?)<\/item>/g)].map((m) => {
    const it = m[1];
    const publisher = tagOf(it, 'source') || fallbackPublisher || null;
    let title = tagOf(it, 'title');
    // Google News appends " - Publisher" to every title. Undo it.
    if (publisher && title?.endsWith(` - ${publisher}`)) title = title.slice(0, -(publisher.length + 3)).trim();
    const pub = tagOf(it, 'pubDate');
    return {
      title, publisher,
      link: tagOf(it, 'link'),
      published: pub,
      publishedMs: pub ? Date.parse(pub) || null : null,
    };
  }).filter((i) => i.title && i.link);
}

async function get(url, headers = {}) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 20000);
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA, ...headers }, signal: ctl.signal });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    return { ok: true, body: await res.text() };
  } catch (e) {
    return { ok: false, error: e.name === 'AbortError' ? 'timeout' : e.message };
  } finally { clearTimeout(t); }
}

const unreachable = [];

async function collectNews() {
  const items = [];
  for (const q of NEWS_QUERIES) {
    const url = 'https://news.google.com/rss/search?q=' + encodeURIComponent(q) + '&hl=en-IN&gl=IN&ceid=IN:en';
    const r = await get(url);
    if (!r.ok) { unreachable.push({ source: `Google News: ${q}`, error: r.error }); continue; }
    const parsed = parseRss(r.body);
    if (!parsed) { unreachable.push({ source: `Google News: ${q}`, error: 'not an RSS document' }); continue; }
    items.push(...parsed);
  }
  for (const f of RSS_FEEDS) {
    const r = await get(f.url);
    if (!r.ok) { unreachable.push({ source: f.publisher, error: r.error }); continue; }
    const parsed = parseRss(r.body, f.publisher);
    if (!parsed) { unreachable.push({ source: f.publisher, error: 'not an RSS document' }); continue; }
    items.push(...parsed);
  }
  // De-duplicate by link, then by normalised title — wire copy runs verbatim
  // across outlets, and counting it twice would fake corroboration.
  const seenLink = new Set(), seenTitle = new Set(), out = [];
  for (const i of items) {
    const t = (i.title || '').toLowerCase().replace(/[^a-z0-9 ]/g, '').slice(0, 70);
    if (seenLink.has(i.link) || seenTitle.has(t)) continue;
    seenLink.add(i.link); seenTitle.add(t); out.push(i);
  }
  return out;
}

/* ── OFFICIAL CORROBORATION ───────────────────────────────────────────────
   Both of these are India-only, and both are keyless. IMD's CAP feed is a
   standards-based RSS on the international Alert Hub. NDMA's Sachet endpoint
   is an internal API behind their public dashboard: it is not documented, it
   could change without notice, and it is treated here as a bonus signal whose
   absence costs nothing. Neither can ever gate a detection — see the header on
   why news has to be the trigger. */
async function collectOfficial() {
  const alerts = [];
  const imd = await get('https://cap-sources.s3.amazonaws.com/in-imd-en/rss.xml');
  if (!imd.ok) unreachable.push({ source: 'IMD CAP feed', error: imd.error });
  else {
    const parsed = parseRss(imd.body, 'India Meteorological Department');
    if (parsed) {
      for (const a of parsed) {
        alerts.push({ agency: 'IMD', text: a.title, link: a.link, published: a.published, publishedMs: a.publishedMs });
      }
    } else unreachable.push({ source: 'IMD CAP feed', error: 'not an RSS document' });
  }

  const sachet = await get('https://sachet.ndma.gov.in/cap_public_website/FetchAllAlertDetails', {
    'Content-Type': 'application/json',
  }).catch(() => ({ ok: false, error: 'fetch threw' }));
  if (!sachet.ok) unreachable.push({ source: 'NDMA Sachet', error: sachet.error });
  else {
    try {
      const j = JSON.parse(sachet.body);
      const rows = Array.isArray(j) ? j : (j.data || j.alerts || []);
      for (const a of rows) {
        alerts.push({
          agency: a.alert_source || 'NDMA',
          text: [a.disaster_type, a.area_description, a.severity_level].filter(Boolean).join(' — '),
          link: 'https://sachet.ndma.gov.in/',
          published: a.effective_start_time || null,
          publishedMs: a.effective_start_time ? Date.parse(a.effective_start_time) || null : null,
          severity_color: a.severity_color || null,
        });
      }
    } catch { unreachable.push({ source: 'NDMA Sachet', error: 'response was not JSON' }); }
  }
  return alerts;
}

/* ── LIVE CONDITIONS OVER THE AFFECTED REGION ─────────────────────────────
   Open-Meteo's FORECAST endpoint, which is a different thing from the ERA5
   archive the rest of this page is built on: the archive is reanalysis and is
   inherently weeks behind, and no amount of scheduling makes it current. This
   is the live one, it is keyless, and it is the only genuinely real-time
   reading on the page.

   ★ IT IS A READING OVER A REGION, NOT AT THE EVENT.
   The coordinate is a representative point for the named place, not the
   location of the disaster — nobody has told this script where the flood
   actually is. The page says so beside the figure. Without that sentence the
   panel would imply a precision it does not have, which on a disaster page is
   the difference between context and a false claim. */
async function liveWeather(place) {
  const c = coordsFor(place);
  if (!c) return null;
  const [lat, lon] = c;
  const url = 'https://api.open-meteo.com/v1/forecast'
    + `?latitude=${lat}&longitude=${lon}`
    + '&current=precipitation,rain,temperature_2m,relative_humidity_2m,weather_code'
    + '&daily=precipitation_sum&past_days=7&forecast_days=3&timezone=Asia%2FKolkata';
  const r = await get(url);
  if (!r.ok) { unreachable.push({ source: `Open-Meteo forecast @ ${place}`, error: r.error }); return null; }
  try {
    const j = JSON.parse(r.body);
    const days = j.daily?.precipitation_sum || [];
    const dates = j.daily?.time || [];
    const past7 = days.slice(0, 7).filter((v) => v != null);
    return {
      point: { lat, lon, note: 'a representative point for the named region, not the site of the event' },
      observed_at: j.current?.time || null,
      precipitation_mm: j.current?.precipitation ?? null,
      temperature_c: j.current?.temperature_2m ?? null,
      humidity_pct: j.current?.relative_humidity_2m ?? null,
      rain_7d_mm: past7.length ? +past7.reduce((a, b) => a + b, 0).toFixed(1) : null,
      daily: dates.map((d, i) => ({ date: d, mm: days[i] ?? null })),
      source: { name: 'Open-Meteo forecast API', url: 'https://open-meteo.com/', note: 'keyless; ECMWF-driven forecast model, not a gauge' },
      fetched: { epochMs: Date.now() },
    };
  } catch { unreachable.push({ source: `Open-Meteo forecast @ ${place}`, error: 'response was not JSON' }); return null; }
}

/* ═══ 2. CLASSIFY ═════════════════════════════════════════════════════════ */

/** Which hazard is this item about? First strong match wins — HAZARD_TERMS is
 *  ordered specific-to-general precisely so "glacial lake outburst" beats
 *  "flood" and pulls the right context pack. */
function classifyHazard(h) {
  for (const t of HAZARD_TERMS) if (t.strong.some((w) => h.includes(w))) return { hazard: t.hazard, strength: 'strong' };
  for (const t of HAZARD_TERMS) {
    const n = t.weak.filter((w) => h.includes(w)).length;
    if (n >= 2) return { hazard: t.hazard, strength: 'weak' };
  }
  return null;
}

/** Where is it, and does that place reach India? */
function classifyPlace(h) {
  const t1 = TIER1.filter((p) => h.includes(p));
  if (t1.length) {
    return { tier: 1, place: title(t1.sort((a, b) => b.length - a.length)[0]), relevance: 'direct', why: null };
  }
  for (const z of TIER2) {
    const hit = z.match.filter((p) => h.includes(p));
    if (hit.length) {
      return { tier: 2, place: title(hit.sort((a, b) => b.length - a.length)[0]), relevance: z.relevance, why: z.why };
    }
  }
  return null;
}

const title = (s) => s.replace(/\b[a-z]/g, (c) => c.toUpperCase());

function severityHits(h) {
  const out = {};
  for (const [k, terms] of Object.entries(SEVERITY_TERMS)) {
    const n = terms.filter((w) => h.includes(w)).length;
    if (n) out[k] = n;
  }
  return out;
}

const negativeHits = (h) => NEGATIVE_TERMS.filter((w) => h.includes(w));

/* ═══ 3. CLUSTER ══════════════════════════════════════════════════════════
   One real disaster produces dozens of headlines. A cluster is (hazard,
   place) — a coarse key on purpose. Splitting "Wayanad" from "Kerala" would
   halve the corroboration count for one event and could push a genuine
   disaster below the publication threshold, which is a far worse failure than
   occasionally merging two nearby events into one dossier a human can split. */
function cluster(items) {
  const byKey = new Map();
  const routed = [];
  const noPack = new Set();
  for (const it of items) {
    const h = hay(it);
    /* ★ ROUTED AWAY BEFORE ANYTHING ELSE LOOKS AT IT.
       Heat, fire and forest loss have their own situation pages. This check
       runs FIRST because the alternative is not "the story is ignored" — it is
       that a heatwave story matches `deaths` plus an Indian place and gets
       filed here as a flood, on the wrong page, against the wrong context
       pack, competing with the page that actually owns the subject. */
    const other = ownedElsewhere(h);
    if (other) { routed.push({ title: it.title, ...other }); continue; }
    const neg = negativeHits(h);
    const hz = classifyHazard(h);
    const pl = classifyPlace(h);
    if (!hz || !pl) continue;
    /* Out of this page's scope is a skip. A missing context pack is NOT —
       the event is still detected and published, just without its standing
       background. Dropping it would mean a cyclone landfall going unnoticed
       because nobody had written cyclone.json yet. */
    if (!HAZARDS.includes(hz.hazard)) continue;
    if (!hasContext(hz.hazard)) noPack.add(hz.hazard);
    /* ★ CLUSTER ON THE REGION, NOT THE HAZARD-PLACE PAIR.
       One Himalayan disaster produces flood, glof and landslide headlines from
       Kathmandu, Rasuwa and the Koshi at once. Keyed on (hazard, place) that
       became six clusters, each holding a sixth of the corroboration. Keyed on
       region it is one event with all of it, and the hazard is decided below
       by which mechanism the reporting actually names most specifically. */
    const region = regionOf(pl.place);
    const key = region.toLowerCase();
    if (!byKey.has(key)) {
      byKey.set(key, { hazard: hz.hazard, ...pl, place: region,
        items: [], negatives: 0, severity: {}, strong: 0, hazardVotes: {} });
    }
    const c = byKey.get(key);
    /* HAZARD_TERMS is ordered specific-to-general, so a lower index is a more
       specific mechanism. A single credible "glacial lake outburst" outranks
       fifty generic "flood" mentions, because the specific word is the one
       that carries information — and it picks the right context pack. */
    c.hazardVotes[hz.hazard] = (c.hazardVotes[hz.hazard] || 0) + (hz.strength === 'strong' ? 2 : 1);
    const rank = (h) => HAZARD_TERMS.findIndex((t) => t.hazard === h);
    if (hz.strength === 'strong' && rank(hz.hazard) < rank(c.hazard)) c.hazard = hz.hazard;
    c.items.push({ ...it, severity: severityHits(h), negative: neg });
    if (hz.strength === 'strong') c.strong++;
    if (neg.length) c.negatives++;
    for (const [k, n] of Object.entries(severityHits(h))) c.severity[k] = (c.severity[k] || 0) + n;
  }
  return { clusters: [...byKey.values()], routed, noPack: [...noPack] };
}

/* ═══ 4. SCORE ════════════════════════════════════════════════════════════
   Every component is itemised into the dossier so the threshold can be tuned
   later against real misses and real false positives, rather than by feel.
   Nothing here is a magic constant without a line saying what it is for. */
/* ★ RAISED FROM 6 AFTER THE FIRST REAL RUN PUBLISHED TWENTY PAGES.
   Six cleared on ordinary monsoon reporting: a state named, the word flood,
   one casualty mention. This page is for events worth interrupting the
   standing picture for, and the honest test of the threshold is how many
   pages a normal monsoon week produces. It should be nought or one. */
const THRESHOLD = 14;

/* ★ SCORE ALONE IS NOT THE PUBLICATION TEST, AND RAISING IT WAS THE WRONG FIX.
   At threshold 14 two routine monsoon stories still cleared — West Bengal on
   three publishers plus the day's ordinary rain alerts, Gujarat on three
   publishers plus casualty language — while the genuine regional disaster sat
   far above them on 123 publishers. Pushing the number higher would have
   silenced the ordinary stories by also silencing any real Indian event
   carried by a normal number of outlets.

   Breadth is the discriminator, so it gets its own gate. An event reaches the
   public site only if the score clears AND either a lot of independent
   outlets carried it, or a moderate number did AND an official agency issued
   a matching alert. Everything else stays a draft: recorded, scored, and
   given no URL. */
const MIN_PUBLISHERS = 8;
const MIN_PUBLISHERS_WITH_ALERT = 4;

function publishable(s) {
  if (s.total < THRESHOLD) return false;
  const pub = s.publishers.length;
  const alerts = s.matchedAlerts.length;
  return pub >= MIN_PUBLISHERS || (pub >= MIN_PUBLISHERS_WITH_ALERT && alerts >= 1);
}

function score(c, alerts) {
  const parts = [];
  const add = (points, signal) => { if (points) parts.push({ signal, points }); };

  /* CORROBORATION — the heaviest single component, because independent
     publishers carrying the same event is the strongest evidence available to
     a system that cannot go and look. */
  const publishers = new Set(c.items.map((i) => i.publisher).filter(Boolean));
  const nPub = publishers.size;
  /* ★ IT USED TO CAP AT FIVE, AND THAT FLATTENED THE ONE SIGNAL THAT MATTERS.
     A regional disaster carried by 113 independent publishers scored exactly
     the same as a district story carried by 3. Breadth of coverage is the
     single best proxy available to a system that cannot go and look, so it
     now scales with the log of the count and keeps climbing: 2 outlets is 2
     points, 5 is about 5, 20 is about 8, 100 is about 11. */
  add(nPub >= 2 ? Math.min(12, Math.round(Math.log2(nPub) * 2.4)) : 0,
    `${nPub} independent publisher${nPub === 1 ? '' : 's'}`);

  /* The hazard word itself appearing unambiguously, repeatedly. */
  add(c.strong >= 3 ? 2 : c.strong >= 1 ? 1 : 0, `hazard named explicitly in ${c.strong} item(s)`);

  /* IMPACT LANGUAGE. Casualty and displacement outrank infrastructure, and
     none of them alone is enough to publish. */
  add(c.severity.casualty ? 3 : 0, 'casualty language');
  add(c.severity.missing ? 1 : 0, 'missing/trapped language');
  add(c.severity.displacement ? 2 : 0, 'evacuation or displacement language');
  add(c.severity.infrastructure ? 1 : 0, 'infrastructure damage language');
  add(c.severity.record ? 1 : 0, 'record-breaking language');

  /* OFFICIAL CORROBORATION. India-only by nature, so its absence is never
     held against a tier-2 event — it simply does not score.

     ★ PLACE ALONE IS NOT A MATCH, AND THIS COST A FALSE POSITIVE.
     The first version matched an alert on place OR hazard. Because IMD and the
     state authorities publish routine rain and thunderstorm alerts for whole
     states every day of the monsoon, ANY cluster placed in Uttarakhand
     collected five "corroborating" alerts automatically — and since one
     official alert is enough to clear the publication bar, a single story
     mentioning a glacier plus the day's ordinary rain warning was enough to
     put an event on the page. Measured, not hypothesised: it happened on the
     first scoped run.

     An alert now has to be about the same PLACE and the same KIND of thing. */
  const hazardWords = {
    glof: ['glacial', 'glacier', 'glof', 'lake outburst'],
    cloudburst: ['cloudburst', 'cloud burst', 'flash flood'],
    flood: ['flood', 'inundation', 'water level', 'rising'],
    landslide: ['landslide', 'landslip', 'mudslide'],
    cyclone: ['cyclone', 'cyclonic', 'storm', 'landfall'],
    extreme_rain: ['rain', 'rainfall', 'precipitation'],
  }[c.hazard] || [c.hazard];

  const matched = alerts.filter((a) => {
    const t = (a.text || '').toLowerCase();
    return t.includes(c.place.toLowerCase()) && hazardWords.some((w) => t.includes(w));
  });
  add(matched.length ? 3 : 0, `${matched.length} matching official alert(s)`);
  add(matched.some((a) => ['red', 'orange'].includes(String(a.severity_color).toLowerCase())) ? 1 : 0,
    'official alert at red or orange');

  /* RECENCY. An item with no parseable date is not penalised — Google News
     occasionally omits pubDate — but a cluster whose freshest item is over two
     days old is not "current" and loses ground. */
  const freshest = Math.max(...c.items.map((i) => i.publishedMs || 0));
  const ageH = freshest ? (NOW - freshest) / 3600000 : null;
  if (ageH != null) add(ageH <= 12 ? 2 : ageH <= 36 ? 1 : ageH > 72 ? -2 : 0,
    ageH <= 12 ? 'reported within 12 hours' : ageH <= 36 ? 'reported within 36 hours' : ageH > 72 ? 'nothing fresher than 72 hours' : 'reported within 72 hours');

  /* NEGATIVES. A cluster that is mostly studies, anniversaries and policy is
     punished in proportion, not merely flagged. */
  if (c.negatives) {
    const share = c.negatives / c.items.length;
    add(share > 0.5 ? -5 : share > 0.25 ? -2 : -1,
      `${c.negatives} of ${c.items.length} items read as commentary, study or anniversary`);
  }

  const total = parts.reduce((a, p) => a + p.points, 0);
  return { total, parts, publishers: [...publishers], matchedAlerts: matched, freshestMs: freshest || null };
}

/* ═══ 5. WRITE ════════════════════════════════════════════════════════════ */

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);

/* ── HEADLINE HYGIENE ─────────────────────────────────────────────────────
   The headline is the largest text on the page when an event is live, so it
   is worth more than a first-match. Two problems, both seen on the first real
   run against the Nepal event:

   1. The publisher suffix survived. Google News appends " - Publisher" to
      every title and parseRss strips it, but only when <source> matches the
      suffix exactly — which it does not always do. So it is stripped again
      here, defensively, against the publisher we actually recorded and against
      a generic trailing " - Some Outlet" as a fallback.

   2. The chosen headline was a live-blog roundup: "News Today: Avalanche,
      glacier burst, warning delay: What caused Nepal floods? What experts
      say". Picking purely by recency favours exactly this kind of item,
      because rolling roundups are republished constantly. A reported headline
      about the event itself is a better hero than an aggregator's digest of
      the day, so roundup markers are penalised and a clean, specific headline
      wins. */
const ROUNDUP_MARKERS = [
  'news today', 'live updates', 'live:', 'highlights', 'top news', 'morning digest',
  'evening digest', 'what we know', 'explained', 'in pics', 'in photos', 'watch:',
  'top 10', 'roundup', 'wrap', 'daily brief', 'newsletter', 'opinion', 'editorial',
];

function cleanHeadline(title, publisher) {
  let t = String(title || '').trim();
  if (publisher && t.endsWith(` - ${publisher}`)) t = t.slice(0, -(publisher.length + 3)).trim();
  // Generic trailing attribution, when <source> disagreed with the suffix.
  t = t.replace(/\s+[-–—]\s+[A-Z][A-Za-z0-9.'&\s]{2,28}$/, '').trim();
  // Leading section labels a desk prepended, possibly stacked and pipe- or
  // colon-separated: "Video | Nepal Glacier Collapse | ...", "Explained: ...".
  // Applied repeatedly because desks stack two and three of them.
  const LABEL = /^(video|watch|live|breaking|news today|explained|update|exclusive|photos?|in pics|opinion|analysis)\s*[:|]\s*/i;
  for (let i = 0; i < 4 && LABEL.test(t); i++) t = t.replace(LABEL, '').trim();
  // A remaining pipe-separated deck: keep the longest segment, which is the
  // one carrying the actual sentence rather than a section name.
  if (t.includes('|')) {
    const parts = t.split('|').map((x) => x.trim()).filter(Boolean);
    if (parts.length > 1) t = parts.reduce((a, b) => (b.length > a.length ? b : a));
  }
  return t;
}

/* Signals that a headline is about ONE PERSON rather than the event. The first
   real run picked "Nepal flash floods: Software engineer from A.P.'s Kuppam
   'missing', family appeals for assistance" as the lead for a disaster carried
   by 123 publishers — a true story, and the wrong one to head a situation
   board, because it describes an individual case rather than the event. */
const PERSONAL_MARKERS = [
  'family appeals', 'appeals for', 'my son', 'my husband', 'my father', 'my brother',
  'engineer from', 'student from', 'native of', 'hails from', 'resident of',
  'body found', 'last seen', 'speaks to', 'recalls', 'tells us', 'i was', 'we were',
  'survivor', 'eyewitness', 'trapped for', 'rescued after', 'reunited',
];
/* Words that indicate the headline describes the event at scale. */
const SCALE_MARKERS = [
  'toll', 'dead', 'killed', 'missing', 'districts', 'villages', 'evacuated',
  'displaced', 'swept', 'washed away', 'destroyed', 'submerged', 'stranded',
  'alert', 'warning', 'rescue', 'relief', 'damage', 'bridge', 'highway',
];

/** Lower is better. Penalises roundups, single-person stories, questions, and
 *  titles that are too long or too short to work as a page heading; rewards
 *  headlines that name the hazard and describe it at scale. */
function headlinePenalty(title, hazard) {
  const t = String(title || '').toLowerCase();
  let p = 0;
  for (const m of ROUNDUP_MARKERS) if (t.includes(m)) p += 4;
  for (const m of PERSONAL_MARKERS) if (t.includes(m)) p += 5;
  if (/[‘’'"“”]/.test(title || '')) p += 2;        // a quoted word is usually one person speaking
  if (t.includes('?')) p += 2;
  if (t.split(':').length > 2) p += 2;
  const scale = SCALE_MARKERS.filter((m) => t.includes(m)).length;
  p -= Math.min(4, scale * 2);
  const hazWords = { glof: ['glacial', 'glacier', 'outburst'], cloudburst: ['cloudburst'],
    flood: ['flood'], landslide: ['landslide', 'landslip'], cyclone: ['cyclone'],
    extreme_rain: ['rain', 'rainfall'] }[hazard] || [];
  if (hazWords.some((w) => t.includes(w))) p -= 2;
  if (/\d/.test(t)) p -= 1;                        // a number is usually a count
  const n = t.length;
  if (n > 110) p += 2;
  if (n < 30) p += 2;
  return p;
}

/** The headline that will lead the page: least penalised, then most recent. */
function pickLead(items, hazard) {
  return items.slice().sort((a, b) => {
    const pa = headlinePenalty(cleanHeadline(a.title, a.publisher), hazard);
    const pb = headlinePenalty(cleanHeadline(b.title, b.publisher), hazard);
    return pa - pb || (b.publishedMs || 0) - (a.publishedMs || 0);
  })[0];
}

/** Build the dossier. Every figure it emits is a count this script performed
 *  itself; every sentence it emits is either quoted from a headline or is the
 *  standing `why` string from the geography table. */
async function dossier(c, s, existing) {
  const slug = slugify(`${c.place}-${c.hazard}`);
  const sources = [];
  const seen = new Set();
  for (const i of c.items.slice(0, 24)) {
    const id = slugify(`${i.publisher || 'unattributed'}-${(i.title || '').slice(0, 30)}`);
    if (seen.has(id)) continue;
    seen.add(id);
    sources.push({
      id, tier: 'news',
      publisher: i.publisher || 'Unattributed',
      title: cleanHeadline(i.title, i.publisher),
      url: i.link,
      published: i.published || null,
    });
  }
  for (const [n, a] of s.matchedAlerts.slice(0, 6).entries()) {
    sources.push({
      id: `official-${n + 1}`, tier: 'official',
      publisher: a.agency || 'Official alert',
      title: a.text || 'Alert',
      url: a.link || null,
      published: a.published || null,
    });
  }

  /* The headline is the most-corroborated actual headline, verbatim. The
     script does not write one of its own — a generated headline about a
     disaster is exactly the sentence nobody should be inventing. */
  const lead = pickLead(c.items, c.hazard);

  return {
    slug,
    /* Preserve an editor's own headline and prose across re-detections. The
       detector may update evidence and timestamps under a human's writing; it
       may never overwrite it. */
    headline: existing?.origin === 'editor' && existing.headline
      ? existing.headline : cleanHeadline(lead.title, lead.publisher),
    hazard: c.hazard,
    tier: c.tier,
    india_relevance: c.relevance,
    india_relevance_note: c.why || null,
    origin: existing?.origin === 'editor' ? 'editor' : 'automated',
    publish_state: publishable(s) ? 'published' : 'draft',
    location: { text: c.place, country: c.tier === 1 ? 'India' : null },
    occurred: { epochMs: s.freshestMs || NOW, precision: 'reported' },
    first_detected: { epochMs: existing?.first_detected?.epochMs || NOW },
    last_updated: { epochMs: NOW },
    last_checked: { epochMs: NOW },
    significance_score: s.total,
    score_breakdown: s.parts,
    corroboration: {
      independent_publishers: s.publishers.length,
      official_alerts: s.matchedAlerts.length,
      items_read: c.items.length,
    },
    /* Editor-authored prose. Empty for an automated dossier, and the page
       renders the context pack in its place rather than a gap. */
    what_happened: existing?.what_happened || null,
    why_it_matters: existing?.why_it_matters || null,
    impact: existing?.impact || {},
    figures: existing?.figures || [],
    timeline: (existing?.timeline || []).length ? existing.timeline : [
      { when: lead.published || null, what: 'First reported in the sources below.', source: sources[0]?.id || null },
    ],
    /* ★ ALWAYS NON-EMPTY FOR AN AUTOMATED DOSSIER, AND HONESTLY SO.
       The publish gate in lib/climate-events.mjs requires this list. A machine
       that has only read headlines genuinely does not know these things, and
       saying so on the page is the difference between a summary and a claim. */
    uncertain: (existing?.uncertain || []).length ? existing.uncertain : [
      'Casualty and damage figures are not established here. Any number in the headlines below belongs to the outlet that printed it.',
      /* ★ THE CLASSIFICATION ITSELF IS A READING, AND SAYING SO IS NOT
         BOILERPLATE. Himalayan disasters are routinely reported as one
         mechanism and found months later to be another: Chamoli 2021 was
         called a glacier burst and was a rock-ice avalanche; the Sikkim 2023
         flood was attributed to a cloudburst and was permafrost thaw. This
         detector reads headlines, so it inherits the first reporting's
         mechanism — including when that turns out to be wrong. */
      `The mechanism is this page's reading of how the event was first reported, not a finding. `
        + 'Himalayan disasters are often reclassified once fieldwork is done.',
      'The extent of the affected area has not been verified against satellite or official mapping.',
      c.tier === 2
        ? 'Downstream consequences for India are a known mechanism for this hazard, not a confirmed outcome of this event.'
        : 'Whether this event is continuing or has passed is not established.',
    ],
    sources,
    live_conditions: await liveWeather(c.place),
    detector: {
      script: 'scripts/detect-climate-events.mjs',
      threshold: THRESHOLD,
      note: 'Assembled automatically from published headlines and official alert feeds. '
          + 'Every figure is a count this script performed; no claim about the event is made in its own voice.',
    },
    fetched: { epochMs: NOW },
  };
}

/* ═══ RUN ═════════════════════════════════════════════════════════════════ */

const news = await collectNews();
const alerts = await collectOfficial();

/* ★ TOTAL SILENCE IS NOT A QUIET DAY. If nothing answered, change nothing. */
if (!news.length) {
  console.error(`No news source answered (${unreachable.length} unreachable). Nothing written; existing events left alone.`);
  for (const u of unreachable) console.error(`  ${u.source}: ${u.error}`);
  process.exit(75);
}

const { clusters: rawClusters, routed, noPack } = cluster(news);
const clusters = rawClusters.map((c) => ({ c, s: score(c, alerts) }))
  .sort((a, b) => b.s.total - a.s.total);

mkdirSync(ACTIVE, { recursive: true });
const existingFiles = existsSync(ACTIVE) ? readdirSync(ACTIVE).filter((f) => f.endsWith('.json')) : [];
const existing = new Map(existingFiles.map((f) => {
  const j = JSON.parse(readFileSync(join(ACTIVE, f), 'utf8'));
  return [j.slug, j];
}));

console.log(`Read ${news.length} news items and ${alerts.length} official alerts.`);
if (unreachable.length) {
  console.log(`${unreachable.length} source(s) unreachable — recorded, NOT counted as quiet:`);
  for (const u of unreachable) console.log(`  ${u.source}: ${u.error}`);
}
if (noPack.length) {
  console.log(`\n::warning:: ${noPack.length} hazard(s) detected with no context pack yet: ${noPack.join(', ')}.`);
  console.log('  These still publish — the card renders without its standing background.');
  console.log('  Write data/climate-events/context/<hazard>.json to give them one.');
}

if (routed.length) {
  const byOwner = {};
  for (const r of routed) byOwner[r.owner] = (byOwner[r.owner] || 0) + 1;
  console.log(`\n${routed.length} item(s) belong to a sibling situation page and were routed away, not missed:`);
  for (const [owner, n] of Object.entries(byOwner).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(n).padStart(3)}  ${owner}`);
  }
}

console.log(`\n${clusters.length} candidate cluster(s), threshold ${THRESHOLD}:\n`);

let written = 0;
for (const { c, s } of clusters) {
  const d = await dossier(c, s, existing.get(slugify(`${c.place}-${c.hazard}`)));
  const mark = publishable(s) ? 'PUBLISH' : 'draft  ';
  console.log(`  ${mark} ${String(s.total).padStart(3)}  ${c.hazard} @ ${c.place}`
    + `  (${s.publishers.length} publishers, ${s.matchedAlerts.length} alerts, ${c.items.length} items)`);
  for (const p of s.parts) console.log(`            ${p.points > 0 ? '+' : ''}${p.points}  ${p.signal}`);
  if (!DRY) {
    writeFileSync(join(ACTIVE, `${d.slug}.json`), JSON.stringify(d, null, 2) + '\n');
    written++;
  }
}

/* ★ STAMP THE CHECK, ALWAYS — INCLUDING ON A QUIET RUN.
   "We looked and nothing crossed the threshold" and "we have not looked since
   Tuesday" are different statements, and the page prints one of them. Writing
   this only when an event was found would leave the quiet state quoting the
   date of the last DISASTER as the date of the last CHECK, which is the most
   misleading thing this whole feature could do. It is a clock, not a figure,
   so data-refresh-changed.mjs's noise filter is expected to revert it on a run
   that changed nothing else — that is correct: the page is rebuilt in the same
   job that writes it, so a quiet run costs no commit and no deploy. */
if (!DRY) {
  /* ── THE FRESHEST RELEVANT ITEMS, WHETHER OR NOT ANYTHING CROSSED ──────
     The page's quiet state used to borrow its three headlines from the
     coverage register, which Google News orders by ITS OWN relevance model
     rather than by date — the first build printed items from 20 August,
     20 July and 29 June under the word "Latest". These are this run's items,
     every query bounded by `when:2d`, sorted newest first and filtered to the
     ones that actually classified as a climate hazard somewhere relevant. So
     the quiet state shows genuinely recent reporting even in a week when
     nothing clears the event threshold. */
  const recent = clusters.flatMap(({ c }) => c.items.map((i) => ({ ...i, hazard: c.hazard, place: c.place })))
    .filter((i) => i.publishedMs)
    .sort((a, b) => b.publishedMs - a.publishedMs)
    .slice(0, 6)
    .map((i) => ({
      title: i.title, link: i.link, publisher: i.publisher,
      published: i.published, publishedMs: i.publishedMs, hazard: i.hazard, place: i.place,
    }));

  writeFileSync(join(DIR, 'checked.json'), JSON.stringify({
    checked: { epochMs: NOW },
    read: { news_items: news.length, official_alerts: alerts.length },
    clusters_considered: clusters.length,
    published: clusters.filter((x) => publishable(x.s)).length,
    recent,
    unreachable,
    note: 'Written on every detector run, including runs that found nothing. '
        + 'The page prints this as "feeds last read", which is a different claim '
        + 'from "nothing happened".',
  }, null, 2) + '\n');
}

if (DRY) console.log('\n--dry-run: nothing written.');
else console.log(`\nWrote ${written} dossier(s) to data/climate-events/active/, and stamped checked.json.`);
