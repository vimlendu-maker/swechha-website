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
import { consolidate } from './lib/event-figures.mjs';
import { dedupeFeedItems, anchorPublished, lastUpdatedFrom, feedCollapse } from './lib/event-feed.mjs';
import { HAZARDS, hasContext } from './lib/climate-events.mjs';
import { publishStateFor } from './lib/active-situation.mjs';

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
  /* De-duplicate by link, then by normalised title — wire copy runs verbatim
     across outlets, and counting it twice would fake corroboration.

     ★ THE DUPLICATE IS RECONCILED, NOT DROPPED, and that one word is the fix
     for the 600-to-160 incident. This loop used to keep whichever copy the
     query order surfaced first; Google News hands the SAME URL a different
     pubDate in different queries, and query membership churns between runs, so
     an article already on the page could have its recorded publication time
     jump six hours forward. dedupeFeedItems keeps the earliest. The full
     measurement is at the top of scripts/lib/event-feed.mjs. */
  return dedupeFeedItems(items);
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

/* THE BREADTH HALF OF THE TEST, ON ITS OWN, because two callers need it: the
   publication gate below, and the FADE stamp in dossier(), which records when
   an event stopped clearing this bar. One expression, so the two can never
   drift into disagreeing about what "corroborated" means. */
function corroborated(s) {
  const pub = s.publishers.length;
  const alerts = s.matchedAlerts.length;
  return pub >= MIN_PUBLISHERS || (pub >= MIN_PUBLISHERS_WITH_ALERT && alerts >= 1);
}

function publishable(s) {
  if (s.total < THRESHOLD) return false;
  return corroborated(s);
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

/* ── FIELDS THE DETECTOR MUST NEVER TOUCH ─────────────────────────────────
   ★ THIS WAS A LIVE BUG AND IT HAD A THIRTY-MINUTE FUSE.
   dossier() below rebuilds the object from a FIXED key set, so any field not
   named in it is dropped on the next run. That silently discarded:

     situation_status   the lifecycle. An editor demoting an event off the
                        homepage would have had the decision reverted by the
                        next scheduled detection, thirty minutes later, with
                        the page quietly promoting itself again.
     hero_days          read by isCurrent() in lib/climate-events.mjs. A slow
                        event granted a longer window lost it the same way,
                        and this one predates the lifecycle entirely.
     cause_status       an editor raising a candidate cause from "under
                        investigation" to "confirmed" once fieldwork lands.

   AN ALLOWLIST, NOT A SPREAD OF `existing`. Spreading the previous file over
   the new one would also freeze the score, the corroboration counts, the
   sources and the timestamps — the things this script exists to update. The
   division is the same one the whole file runs on: the detector owns the
   EVIDENCE, a person owns the EDITORIAL JUDGEMENT, and neither may overwrite
   the other. Adding a new human-set field means adding it here, and a comment
   saying so sits on each of them at the point of use. */
const EDITOR_OWNED = [
  'situation_status',      // active | developing | stabilising | demoted | archived
  'situation_status_why',  // printed beside it when a person set it
  'hero_days',             // overrides the 14-day evidence window
  'cause_status',          // { causeId: confirmed | likely | under_investigation | not_established }
  'location_detail',       // a precise place the feeds do not carry
  'coords', 'coords_note', // and its coordinates, which drive the map and the satellite frame
  'downstream', 'downstream_note', // THIS event's river, not the hazard's generic chain
  'mechanism_stated',
  'occurred_detail',       // a precise onset the feeds do not carry
  'owner_figures',         // figures supplied by an editor, with their own sources
  'reported_imagery',      // higher-resolution before/after at its publisher, linked not reproduced
  'owner_images',          // and the same imagery published HERE, where permission exists
  'editor_note',
];

/** Carry every editor-owned field across untouched. */
function keepEditorFields(next, existing) {
  if (!existing) return next;
  for (const k of EDITOR_OWNED) {
    if (existing[k] !== undefined) next[k] = existing[k];
  }
  return next;
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

  /* ★ A TIME ALREADY ON THE PAGE MAY NOT MOVE FORWARD. The dedupe above makes
     one run deterministic; this makes the SEQUENCE of runs stable, so a feed
     inventing a later stamp on some future fetch cannot re-order a register a
     reader has already been shown. News rows only — see event-feed.mjs on why
     `official-N` ids are positional and must not be anchored. */
  const register = anchorPublished(sources, existing?.sources);

  /* The headline is the most-corroborated actual headline, verbatim. The
     script does not write one of its own — a generated headline about a
     disaster is exactly the sentence nobody should be inventing. */
  const lead = pickLead(c.items, c.hazard);

  /* ── A QUIET RUN MUST PRODUCE AN IDENTICAL FILE ────────────────────────
     ★ SAME LESSON AS THE RELATIVE TIMESTAMPS, ONE LAYER DOWN.
     Stamping last_updated and last_checked on every run means a dossier's
     bytes move every run whether or not a single source changed —
     and this repository's rule is that it commits figures, not clocks.
     data-refresh-changed.mjs only treats `fetched` as noise, so these two
     would have produced a commit and a deploy on every quiet run.

     So the evidence is fingerprinted. If the score, the corroboration counts,
     the headline and the set of sources are all unchanged, the previous
     timestamps are preserved and the file re-serialises byte-identically. The
     fact that we looked is still recorded — once, globally, in checked.json,
     which is itself clock-only and gets reverted when nothing else moved. */
  const fingerprint = JSON.stringify({
    score: s.total,
    pubs: s.publishers.length,
    alerts: s.matchedAlerts.length,
    hazard: c.hazard,
    tier: c.tier,
    headline: existing?.origin === 'editor' && existing.headline
      ? existing.headline : cleanHeadline(lead.title, lead.publisher),
    sources: register.map((x) => x.id).sort(),
  });
  const unchanged = existing && existing.evidence_fingerprint === fingerprint;
  /* Decided once, because `publish_state` and `published_on` below must not be
     able to disagree about whether this event is public. */
  const pubState = publishStateFor({ existing, publishableNow: publishable(s) });

  /* The newest thing anyone has published about this event — see
     lastUpdatedFrom()'s own note, which carries the reasoning and the rule. */
  const freshestReport = lastUpdatedFrom(existing?.last_updated?.epochMs, register, NOW);

  /* ── WHEN THE COVERAGE FADED, WHICH IS NOT THE SAME AS WHEN IT DIPPED ────
     An event below the corroboration bar is one that would not be published
     today. That is the honest signal for "no longer a developing situation" —
     but the raw counts are NOISE: a single run read 11 items where the one
     fifty minutes earlier read 235, taking the Nepal glacial flood from 137
     independent publishers to 2 with 1,344 dead. A rule keyed on the live
     counts would have called that event closed.

     So this records WHEN the event first fell below the bar, and clears the
     moment it climbs back. statusOf() then demotes only after the event has
     stayed below for a grace period. Measured over the committed history, a
     dip is a single hourly run and a genuine fade is 1.3 to 5.4 days — two
     orders of magnitude apart, which is what makes the distinction safe. */
  const isCorroborated = corroborated(s);
  const fadedSince = isCorroborated ? undefined
    : (existing?.faded_since?.epochMs
      ? existing.faded_since
      : { epochMs: NOW });

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
    /* ★ PUBLICATION LATCHES. publishable() decides whether this event may be
       MINTED as a public URL; it does not get to withdraw one. Writing
       publishable(s) straight into this field meant a decaying score
       un-published an already-indexed page and every search visitor hit a 404
       — see publishStateFor()'s own note, which carries the full account. */
    publish_state: pubState,
    location: { text: c.place, country: c.tier === 1 ? 'India' : null },
    occurred: { epochMs: unchanged && existing.occurred?.epochMs
      ? existing.occurred.epochMs : (s.freshestMs || NOW), precision: 'reported' },
    first_detected: { epochMs: existing?.first_detected?.epochMs || NOW },
    /* ★ "UPDATED" MEANS NEW REPORTING ARRIVED, NOT THAT ANY NUMBER MOVED.
       This read `unchanged ? existing : NOW`, so it advanced whenever the
       fingerprint changed — and the fingerprint includes the score and the
       publisher count, both of which move as coverage DECAYS. So an event the
       wires had dropped kept looking freshly updated, statusOf()'s age ladder
       kept calling it "Active. Being tracked now. Figures move while you are
       on this page", and nine pages said exactly that about stories nobody
       was covering. Losing a source is not an update. A bad fetch is not an
       update either — see the run that read 11 items where the one before it
       read 235.

       So the clock follows the freshest piece of reporting in the register,
       and never runs backwards. anchorPublished() has already pinned each
       source's date to the first value seen, so a republished item cannot
       drag this forward, and the value is derived from the data rather than
       from when the job happened to run — which keeps it stable across
       rebuilds, the same reason stamp() writes absolute instants. */
    last_updated: { epochMs: freshestReport },
    last_checked: { epochMs: unchanged ? existing.last_checked.epochMs : NOW },
    evidence_fingerprint: fingerprint,
    significance_score: s.total,
    /* ★ FROZEN WHEN THE EVIDENCE IS UNCHANGED, and the reason is subtle.
       `items_read` is the raw count of matching headlines, and Google News
       returns a slightly different set on every fetch — so it drifts by one or
       two even when the score, the publishers, the alerts and the sources are
       all identical. Two of the score_breakdown strings quote that count, so
       the drift propagated into them too, and the file churned on every run
       for no reason a reader would recognise as a change. The fingerprint has
       already established these are the same evidence; the raw tally is not
       worth a commit and a deploy. */
    score_breakdown: unchanged ? existing.score_breakdown : s.parts,
    corroboration: unchanged ? existing.corroboration : {
      independent_publishers: s.publishers.length,
      official_alerts: s.matchedAlerts.length,
      items_read: c.items.length,
    },
    /* ★ THE EVIDENCE THAT MINTED THE URL, WRITTEN ONCE AND NEVER REWRITTEN.
       `corroboration` above is a live reading and decays as the wires move on;
       this is the day the page became public and what justified it that day.
       Both publication gates test THIS, so a real event no longer falls below
       its own bar a week later and un-publishes itself — see publishStateFor()
       in lib/active-situation.mjs and validateEvent() in lib/climate-events.mjs,
       which between them carry the whole account. Absent on a draft, because a
       draft has never been minted. */
    published_on: pubState === 'published'
      ? (existing?.published_on || {
        epochMs: NOW,
        independent_publishers: s.publishers.length,
        official_alerts: s.matchedAlerts.length,
      })
      : (existing?.published_on || undefined),
    /* Absent while the event is corroborated — the absence IS the "still
       carried" signal, so it must not be written as null. */
    faded_since: fadedSince,
    /* Editor-authored prose. Empty for an automated dossier, and the page
       renders the context pack in its place rather than a gap. */
    what_happened: existing?.what_happened || null,
    why_it_matters: existing?.why_it_matters || null,
    /* ── THE IMPACT FIGURES, READ OUT OF THE HEADLINES ABOVE ─────────────
       ★ THIS FIELD USED TO BE `existing?.impact || {}` AND IT WAS ALWAYS {}.
       Nothing wrote it, because nothing could: this script may not state a
       death toll in its own voice, so the slot waited for an editor who, on a
       disaster carried by 125 publishers inside twelve hours, does not exist.
       The consequence shipped: /now/climate-event/nepal-glof led on four cells
       reading "— not established" while the twenty-four sources listed at the
       bottom of the same page carried 547 dead, 1,944 injured and 320 Indians
       uncontactable in their own titles.

       consolidate() resolves that without breaking the rule. It reads digits
       out of the headline strings ALREADY in `sources` above, attributes each
       to the source that printed it, keeps that source's own hedge, and where
       outlets disagree carries every value and marks the row PRELIMINARY. No
       figure is averaged, rounded or stated in this script's voice — each one
       is a quotation of a number, printed beside a link to the sentence it was
       quoted from.

       ★ AN EDITOR'S FIGURES WIN, PER METRIC. A hand-set `deaths` claim is not
       overwritten by a headline; the extracted rows fill in around it. That is
       the same asymmetry `headline` and `what_happened` already have — the
       detector may add under a human's writing and may never replace it. */
    impact: (() => {
      const read = consolidate(register, { place: c.place });
      const kept = { ...read };
      /* ── ONLY AN EDITOR'S ROW SURVIVES A RE-DETECTION ──────────────────
         ★ THIS MERGE USED TO BE `{ ...read, ...existing.impact }` AND IT
         DEADLOCKED THE WHOLE PIPELINE. Spreading the previous impact over the
         fresh one preserved EVERY row, including the machine-extracted ones —
         and an extracted row cites source ids out of `sources`, which is
         rebuilt from the last two days of news on every run and capped at 24
         entries. So the moment a quoted headline aged out of that window, the
         row it produced stayed behind citing a source the register no longer
         held, and lib/climate-events.mjs correctly refused the file:

           active/nepal-glof.json: impact.deaths cites source
           "india-today-nepal-tibet-floods-toll-hits-5", which is not in this
           file's source register.

         That throw is inside the page rebuild, which runs BEFORE the commit —
         so a failing run committed nothing, the dossier on disk never moved,
         and the next run inherited the same doomed impact. The failure was
         guaranteed to repeat and guaranteed to get worse, because more
         citations expire with every passing day. Measured 28 August 2026: the
         first live run of this workflow died exactly here.

         It was also silently freezing the figures. nepal-glof's preserved
         `deaths` read 547 while the sources in its own register had moved to
         600 — the page was quoting a toll no listed source still printed.

         So an extracted row is now RECOMPUTED from the register every run,
         which makes a dangling citation structurally impossible: the row and
         the register are built from the same array in the same call. Only a
         row a human set — no `extracted` flag — is carried across, which is
         all the original comment ever claimed to protect, and it keeps the
         editor's own status word (`confirmed`, where a headline could only
         ever be `media_report`).

         ★ A FIGURE WHOSE LAST SOURCE HAS AGED OUT NOW DISAPPEARS, and that is
         the honest behaviour, not a regression: this page's rule is that every
         number is a quotation attributable to a source listed beneath it. If
         nothing in the register still prints it, the page has no business
         printing it either. (nepal-glof's `injured: 1944` goes this way.) The
         lever if that proves too aggressive is the 24-item cap on `sources`
         above — widen the register, not the merge. */
      for (const [metric, claim] of Object.entries(existing?.impact || {})) {
        if (claim && !claim.extracted) kept[metric] = claim;
      }
      return kept;
    })(),
    figures: existing?.figures || [],
    timeline: (existing?.timeline || []).length ? existing.timeline : [
      { when: lead.published || null, what: 'First reported in the sources below.', source: register[0]?.id || null },
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
    sources: register,
    /* Live weather is a reading, and it genuinely does move every run — but a
       quiet run must not churn the file, so it is only refreshed when the
       evidence moved. The page labels it with its own fetch time either way. */
    live_conditions: unchanged && existing.live_conditions
      ? existing.live_conditions : await liveWeather(c.place),
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

/* ── A COLLAPSE IS NOT A QUIET DAY EITHER ─────────────────────────────────
   ★ THE FAILURE THIS MAKES VISIBLE, WHICH RAN SILENTLY FOR WEEKS.
   Exit 75 above catches TOTAL silence: nothing answered, so nothing is
   written. What it cannot catch is the feed answering with a fraction of its
   usual volume — sources reachable, RSS well-formed, five per cent of the
   items. On 5 September one run read 218 news items where the run fifty
   minutes earlier read 574, and the Nepal glacial flood went from 137
   independent publishers to 2 with 1,344 dead. Everything downstream now
   survives that (publication latches, and `faded_since` waits a day before it
   demotes anything), but nothing NOTICED it. It looked like an ordinary run.

   THE THRESHOLD IS MEASURED, NOT PICKED. Across the 59 runs in the committed
   history of checked.json the run-over-run ratio has a median of 1.00, and the
   two genuine collapses both landed at 0.38 — each recovering to full volume
   on the very next run. The lowest non-collapse ratio is 0.66. Half sits in
   the middle of that gap with a wide margin on both sides, so this fires twice
   in 59 runs and both times on something real.

   IT WARNS AND DOES NOT BLOCK, deliberately. A sustained genuine drop — Google
   changing how much it returns, a quiet fortnight — must not freeze the
   pipeline, and the downstream hysteresis already absorbs a single bad run.
   The alert exists so a human can tell an anomaly from the weather, which is
   the same reason exit 75 emits a notice rather than a red run. */
{
  let prevRead = null;
  try {
    prevRead = JSON.parse(readFileSync(join(DIR, 'checked.json'), 'utf8'))?.read?.news_items ?? null;
  } catch { /* first run, or the file has never been written */ }
  /* The rule and the measurement behind it live in lib/event-feed.mjs. */
  const collapse = feedCollapse(news.length, prevRead);
  if (collapse) {
    console.log(`\n::warning:: NEWS FEED COLLAPSE — read ${collapse.current} items, `
      + `${collapse.pct}% of the ${collapse.previous} the previous run read. Sources answered, `
      + `so this is not the silent-upstream case that exits 75. Corroboration counts written `
      + `this run will be understated, and that is visible on the pages until the feed recovers.`);
    console.log('  Nothing is blocked: publication latches, and a fade needs 24h below the bar');
    console.log('  before it demotes anything, so a single bad run cannot close an event.');
    console.log(`  ${unreachable.length} source(s) unreachable this run.`);
    for (const u of unreachable) console.log(`    ${u.source}: ${u.error}`);
  }
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
  const prior = existing.get(slugify(`${c.place}-${c.hazard}`));
  /* keepEditorFields() carries the human-set fields across — see EDITOR_OWNED
     above for why an allowlist and not a spread. */
  const d = keepEditorFields(await dossier(c, s, prior), prior);
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

  /* ★ THE CLOCK FIELD IS CALLED `fetched` ON PURPOSE.
     data-refresh-changed.mjs treats exactly three key names as noise —
     `fetched`, `fetchedAt`, `_gathered` — and reverts a file whose only change
     is one of them. Naming this `checked` would have put a 48-commits-a-day
     clock outside that filter. `fetched` is also the honest name: it is when
     this file was written. Everything else here (what was read, what cleared,
     the recent items) is real content, so a run that finds something new does
     produce a commit. */
  writeFileSync(join(DIR, 'checked.json'), JSON.stringify({
    fetched: { epochMs: NOW },
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
