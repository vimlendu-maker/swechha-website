/* ═══════════════════════════════════════════════════════════════════════════
   climate-events.mjs — THE EVENT DOSSIER MODEL, AND THE GATE THAT GUARDS IT.
   ───────────────────────────────────────────────────────────────────────────
   /now/climate-event used to open on an archive figure: the worst station's
   count of days over IMD's heavy-rain threshold in the last COMPLETE calendar
   year. That number is true, and it cannot move for up to twelve months at a
   stretch — 2025's rainfall is finished history, and 2026 does not become
   "complete" until 1 January 2027. A page that leads on it reads as stale in
   the exact week a reader most wants it, which is the week something happened.

   This module adds the thing that was missing: a CURRENT EVENT, carrying its
   own dossier, at the top of the page — and the archive below it, unchanged.

   ★ THE CENTRAL RULE: A CLAIM WITHOUT A SOURCE IS A BUILD FAILURE.
   Every figure in an event dossier is a `claim` — a value, a unit, a status
   and a `source` that must resolve to an entry in that file's own register.
   `validateEvent()` refuses a dossier whose claim points at a source id that
   does not exist. This is not defensive politeness: the page publishes death
   tolls and discharge volumes during a disaster, when the reporting is fastest
   and the numbers are worst. An unsourced figure on that page is the single
   most damaging thing this repository could ship, so the build stops instead.

   ★ FOUR CONFIDENCE WORDS, AND ONLY FOUR.
   `CLAIM_STATUS` below. They render differently and they mean different things:
   an official's estimate and a news report's figure must never look alike. A
   fifth word invented at the callsite fails the gate rather than rendering as
   an unlabelled fact.

   ★ TWO KINDS OF FACT, SOURCED DIFFERENTLY. This is the whole shape of the
   thing, and it is why an event page can be rich without being invented:

     EVENT FACTS      what happened here, this week. Deaths, discharge, area
                      flooded. Fast-moving, contested, per-event — carried in
                      data/climate-events/active/<slug>.json, each claim
                      individually attributed and status-marked.

     HAZARD CONTEXT   what is true about this KIND of event, always. How many
                      glacial lakes the Himalaya holds, how many are rated
                      dangerous, what happened at South Lhonak in 2023. It does
                      not change per event, so it is researched ONCE, cited
                      once, committed once, and reused by every event of that
                      type — data/climate-events/context/<hazard>.json.

   The second half is what lets a Nepal event answer "how many such lakes are
   there, and what does this mean for India" without anybody inventing a number
   under deadline. The context pack was written calmly, in review, with
   citations. The event file carries only what is genuinely new.

   ★ AN EVENT EXPIRES ON ITS OWN.
   `isCurrent()` demotes an event out of the hero after `hero_days` days with
   no update. Nothing has to be un-published by hand; a page whose top slot is
   still shouting about last month's flood is its own kind of lie.
   ═══════════════════════════════════════════════════════════════════════════ */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..', '..');
const DIR = join(ROOT, 'data', 'climate-events');
const ACTIVE = join(DIR, 'active');
const CONTEXT = join(DIR, 'context');

/* ── THE FOUR CONFIDENCE WORDS ────────────────────────────────────────────
   Ordered weakest-to-strongest so a dossier can be sorted or filtered by
   confidence without a second table. The label is what the page prints; the
   caller never writes display text for a status itself. */
export const CLAIM_STATUS = {
  preliminary:        { rank: 0, label: 'Preliminary',       cls: 'prelim' },
  media_report:       { rank: 1, label: 'Media report',      cls: 'media' },
  official_estimate:  { rank: 2, label: 'Official estimate', cls: 'estimate' },
  confirmed:          { rank: 3, label: 'Confirmed',         cls: 'confirmed' },
};

/* ── THE HAZARDS THIS PAGE OWNS, AND ONLY THOSE ───────────────────────────
   ★ THIS IS A SCOPE BOUNDARY, NOT A CAPABILITY LIMIT.
   /now/climate-event is one of six situation pages, and the other five have
   their own subjects: /now/heat owns heatwaves, /now/forest-fire owns fire,
   /now/forest-loss owns deforestation, /now/yamuna owns the river, /now/air
   owns air quality. This page is "India's extreme rain", and its own death
   table is NCRB's five: flood, landslide, torrential rain, cyclone, lightning.

   So the list below is the rain-driven catastrophe family and nothing else. A
   detector that also filed heatwaves here would not be more useful; it would
   be publishing /now/heat's subject on the wrong page, twice, with two
   different cadences. Hazards belonging to a sibling page are recognised and
   deliberately skipped — see OTHER_SITUATIONS in lib/event-terms.mjs, which
   exists so a heatwave story is REJECTED rather than misfiled as something
   this page does cover.

   A dossier's `hazard` must be one of these AND must have a context pack on
   disk — see validateEvent(). The list is written here rather than inferred
   from the directory so that a MISSING pack is a loud failure rather than a
   silently shorter menu. */
export const HAZARDS = [
  'glof',            // glacial lake outburst flood
  'cloudburst',
  'flood',           // riverine / urban / flash
  'landslide',
  'cyclone',
  'extreme_rain',
];

/* India-relevance, which is the whole reason a Nepal event belongs on an
   Indian page at all. Tier 1 is inside India; tier 2 is the region, and must
   say through WHICH mechanism it reaches India — a shared basin, a shared
   range, Indian nationals, or infrastructure. "It is nearby" is not a
   mechanism and does not appear here. */
export const RELEVANCE = {
  direct:            'In India',
  downstream:        'Upstream of India — shared river system',
  shared_range:      'Shared Himalayan system',
  indian_nationals:  'Indian nationals or infrastructure affected',
  regional_context:  'Regional climate significance',
};

const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'));

/* ═══ VALIDATION ══════════════════════════════════════════════════════════
   Everything below throws. Nothing warns. A generator that catches these and
   carries on would defeat the point — see the header. Each message names the
   FILE and the FIELD, matching lib/content/load.ts's ContentError convention
   so a failure reads the same wherever it comes from. */

class EventError extends Error {
  constructor(file, msg) { super(`${file}: ${msg}`); this.name = 'EventError'; }
}

/** A claim is {value, unit?, status, source, note?}. `sources` is the file's
 *  own register, already keyed by id. Returns nothing; throws on any problem.
 *  `where` is a dotted path used only to make the error legible. */
function validateClaim(file, where, claim, sources) {
  if (claim == null) return;                    // an absent claim is fine
  if (typeof claim !== 'object' || Array.isArray(claim)) {
    throw new EventError(file, `${where} must be a claim object {value, status, source}, got ${typeof claim}`);
  }
  if (!('value' in claim)) throw new EventError(file, `${where} has no value`);
  if (!claim.status) throw new EventError(file, `${where} has no status — one of ${Object.keys(CLAIM_STATUS).join(', ')}`);
  if (!(claim.status in CLAIM_STATUS)) {
    throw new EventError(file, `${where} has status "${claim.status}", which is not one of the four: ${Object.keys(CLAIM_STATUS).join(', ')}`);
  }
  /* ★ THE GATE THIS FILE EXISTS FOR. */
  if (!claim.source) throw new EventError(file, `${where} states a value with no source. Every figure on this page is attributable or it does not ship.`);
  const ids = Array.isArray(claim.source) ? claim.source : [claim.source];
  for (const id of ids) {
    if (!sources[id]) {
      throw new EventError(file, `${where} cites source "${id}", which is not in this file's source register. Add it to sources[] or remove the claim.`);
    }
  }
}

/** Walk any nested structure and validate every claim-shaped node in it.
 *  A claim is recognised by having BOTH `value` and `status` — which is why
 *  `status` is mandatory above: it is also the discriminator. */
function walkClaims(file, node, sources, path = '') {
  if (node == null || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    node.forEach((v, i) => walkClaims(file, v, sources, `${path}[${i}]`));
    return;
  }
  if ('value' in node && 'status' in node) { validateClaim(file, path || 'claim', node, sources); return; }
  for (const [k, v] of Object.entries(node)) walkClaims(file, v, sources, path ? `${path}.${k}` : k);
}

/** Index a file's sources[] by id, rejecting duplicates and incomplete rows. */
function indexSources(file, list) {
  if (!Array.isArray(list)) throw new EventError(file, 'sources must be an array');
  const out = {};
  for (const s of list) {
    if (!s.id) throw new EventError(file, 'a source has no id');
    if (out[s.id]) throw new EventError(file, `two sources share the id "${s.id}"`);
    if (!s.publisher) throw new EventError(file, `source "${s.id}" has no publisher`);
    if (!s.title) throw new EventError(file, `source "${s.id}" has no title`);
    /* A URL is NOT required: some of the strongest sources here are printed
       bulletins and PDFs whose links rot within a season. Publisher + title +
       date is enough to find it again, which is what attribution is for. */
    if (!s.tier || !['official', 'scientific', 'news'].includes(s.tier)) {
      throw new EventError(file, `source "${s.id}" needs tier: official | scientific | news`);
    }
    out[s.id] = s;
  }
  return out;
}

/* ═══ CONTEXT PACKS ═══════════════════════════════════════════════════════ */

/** Load one hazard's standing context. Throws if it is missing or malformed. */
export function loadContext(hazard) {
  const file = `context/${hazard}.json`;
  const p = join(CONTEXT, `${hazard}.json`);
  if (!existsSync(p)) {
    throw new EventError(file, `no context pack for hazard "${hazard}". Every hazard an event may declare must have one — that pack is what lets the page answer "how many such lakes are there" without anybody inventing a number under deadline.`);
  }
  const c = readJson(p);
  const sources = indexSources(file, c.sources || []);
  if (!c.hazard) throw new EventError(file, 'no hazard field');
  if (c.hazard !== hazard) throw new EventError(file, `declares hazard "${c.hazard}" but is filed as ${hazard}.json`);
  if (!Array.isArray(c.figures)) throw new EventError(file, 'figures must be an array (may be empty)');
  walkClaims(file, c.figures, sources, 'figures');
  walkClaims(file, c.precedents || [], sources, 'precedents');
  /* India relevance is the reason a pack about Nepal's glaciers sits on an
     Indian site. A pack without it is a geography lesson. */
  if (!c.india_relevance) throw new EventError(file, 'no india_relevance — a context pack must say why this hazard concerns India');
  return { ...c, sourceIndex: sources };
}

export const hasContext = (hazard) => existsSync(join(CONTEXT, `${hazard}.json`));

/* ═══ EVENTS ══════════════════════════════════════════════════════════════ */

/** Validate one event dossier. Returns it with `sourceIndex` attached. */
export function validateEvent(file, e) {
  const sources = indexSources(file, e.sources || []);

  for (const k of ['slug', 'headline', 'hazard', 'publish_state', 'india_relevance']) {
    if (!e[k]) throw new EventError(file, `no ${k}`);
  }
  if (!HAZARDS.includes(e.hazard)) {
    throw new EventError(file, `hazard "${e.hazard}" is not one of: ${HAZARDS.join(', ')}`);
  }
  /* ★ A MISSING CONTEXT PACK IS A DEGRADED PAGE, NOT A DROPPED EVENT.
     This threw at first, and the detector correspondingly refused to cluster
     any hazard without a pack. The consequence was the opposite of the point:
     a cyclone making landfall would have been detected by every feed, scored
     well above threshold — and then silently discarded, because nobody had
     written cyclone.json yet. Missing background is a reason to publish a
     thinner card, never a reason to miss the event.

     So the pack is optional here and the renderer simply omits its section.
     The gap is surfaced instead: the detector prints it, and this leaves a
     marker on the dossier so the page can say the standing context for this
     hazard has not been compiled rather than implying none exists. */
  const contextMissing = !hasContext(e.hazard);
  if (!['draft', 'published'].includes(e.publish_state)) {
    throw new EventError(file, `publish_state must be draft or published, got "${e.publish_state}"`);
  }
  if (!RELEVANCE[e.india_relevance]) {
    throw new EventError(file, `india_relevance "${e.india_relevance}" is not one of: ${Object.keys(RELEVANCE).join(', ')}`);
  }
  if (![1, 2].includes(e.tier)) throw new EventError(file, 'tier must be 1 (in India) or 2 (region)');
  if (!e.location?.text) throw new EventError(file, 'no location.text');
  if (!e.occurred?.epochMs) throw new EventError(file, 'no occurred.epochMs — an event must say when it happened');
  if (!e.last_updated?.epochMs) throw new EventError(file, 'no last_updated.epochMs');

  /* ── ORIGIN: WHO ASSEMBLED THIS, AND THEREFORE WHAT IT MAY CLAIM ────────
     `automated`  the detector built it from news and alert feeds. It reaches
                  the page WITHOUT waiting for a person, because a disaster
                  page that appears three days late has failed at the one job
                  it has. What it may say is strictly bounded: headlines it
                  actually read, quoted and attributed; a hazard type; a
                  location; counts of corroborating outlets and official
                  alerts. It may not assert a death toll, a cause or a
                  consequence in its own voice — those live as `claims` with a
                  source and a status word, or they do not appear.
     `editor`     a person wrote it. Prose fields are then required, because a
                  human-authored dossier that skips "what happened" is just an
                  automated one with the label filed off.

     An automated event may later be UPGRADED in place by an editor writing the
     prose fields; origin flips to `editor` at that point and the stricter gate
     below starts applying. Nothing has to be recreated. */
  const origin = e.origin || 'editor';
  if (!['automated', 'editor'].includes(origin)) {
    throw new EventError(file, `origin must be automated or editor, got "${origin}"`);
  }

  if (e.publish_state === 'published') {
    if (!Object.keys(sources).length) throw new EventError(file, 'is published with an empty source register');

    if (origin === 'editor') {
      for (const k of ['what_happened', 'why_it_matters']) {
        if (!e[k] || !String(e[k]).trim()) {
          throw new EventError(file, `is origin:editor and published, but ${k} is empty. Either write it, or set origin:"automated" so the page labels it as machine-assembled rather than implying a person checked it.`);
        }
      }
    }

    /* ★ THE GATE THAT MAKES AUTOMATIC PUBLICATION DEFENSIBLE.
       A machine-assembled event reaches the public page only if more than one
       independent publisher carried it, or an official agency alert matched
       it. One outlet repeating one wire story is not corroboration, and the
       failure mode this prevents — a single mis-scraped headline becoming a
       "situation" on an NGO's front page — is the reason the whole detector is
       allowed to publish at all. See scripts/detect-climate-events.mjs, which
       computes these; this is the second, independent check that they held. */
    if (origin === 'automated') {
      /* ★ THE BAR IS TESTED AGAINST THE EVIDENCE THAT MINTED THE PAGE, NOT
         AGAINST TODAY'S. `corroboration` is recomputed on every detector run
         from a rolling window of headlines, so it DECAYS — assam-landslide was
         published on eleven independent publishers and read four a week later;
         assam-flood went from five-plus-eight-alerts to one. Testing the live
         counts therefore failed every real event a few days after it happened,
         which un-published nine already-indexed pages and turned their URLs
         into 404s. The wording above is the giveaway and was right all along:
         an event "REACHES the public page" only if corroborated. Reaching is
         minting. Nothing about a decayed news cycle makes the corroboration
         that existed on the day retroactively untrue.

         `published_on` is that day's counts, written once by the detector at
         first publication and never rewritten. An older dossier that predates
         the field falls back to the live counts, which is the same test this
         has always applied and keeps the gate meaningful for a hand-written
         automated dossier that has no minting record. */
      const minted = e.published_on;
      const outlets = minted?.independent_publishers ?? e.corroboration?.independent_publishers ?? 0;
      const official = minted?.official_alerts ?? e.corroboration?.official_alerts ?? 0;
      /* Mirrors publishable() in scripts/detect-climate-events.mjs, deliberately
         restated here rather than imported: this is the SECOND, independent
         check that the bar held, and a gate that shares its implementation with
         the thing it is checking is not a gate. Eight independent outlets, or
         four plus a matching official alert. */
      if (!(outlets >= 8 || (outlets >= 4 && official >= 1))) {
        throw new EventError(file, `is origin:automated and published on ${outlets} independent publisher(s) and ${official} official alert(s)${minted ? ' when it was first published' : ''}. Automatic publication needs 8+ publishers, or 4+ with a matching official alert. Routine monsoon reporting clears a lower bar every week.`);
      }
    }
  }

  walkClaims(file, e.impact || {}, sources, 'impact');
  walkClaims(file, e.figures || [], sources, 'figures');
  walkClaims(file, e.timeline || [], sources, 'timeline');

  /* Timeline entries are dated prose, not claims, so they get their own check. */
  for (const [i, t] of (e.timeline || []).entries()) {
    if (!t.when) throw new EventError(file, `timeline[${i}] has no when`);
    if (!t.what) throw new EventError(file, `timeline[${i}] has no what`);
  }

  /* `uncertain` is not optional decoration. A live disaster page that lists no
     open questions is claiming a completeness nobody has 48 hours in. For an
     automated event the detector writes this list itself — it always knows at
     least one thing it could not establish, because it could not establish
     anything beyond what it read. */
  if (e.publish_state === 'published' && !(e.uncertain || []).length) {
    throw new EventError(file, 'is published with an empty `uncertain` list. Name what is not yet known — during a disaster that list is never genuinely empty, and a page implying otherwise is the failure mode this whole file exists to prevent.');
  }

  return { ...e, origin, contextMissing, sourceIndex: sources };
}

/** Every event on disk, validated, newest first. */
export function loadEvents() {
  if (!existsSync(ACTIVE)) return [];
  return readdirSync(ACTIVE)
    .filter((f) => f.endsWith('.json'))
    .map((f) => validateEvent(`active/${f}`, readJson(join(ACTIVE, f))))
    .sort((a, b) => b.last_updated.epochMs - a.last_updated.epochMs);
}

/* ── HOW LONG AN EVENT HOLDS THE TOP OF THE PAGE ──────────────────────────
   Fourteen days since the last verified update, unless the dossier overrides
   it with `hero_days`. A slow-moving event (a drought, a displacement crisis)
   can legitimately ask for longer; a cloudburst should not. The clock runs
   from last_updated rather than from `occurred`, so an event that is still
   being actively reported keeps its place and one that stopped moving loses
   it — which is the honest reading of "current". */
const DEFAULT_HERO_DAYS = 14;
const DAY = 86400000;

export function isCurrent(e, now = Date.now()) {
  if (e.publish_state !== 'published') return false;
  const days = e.hero_days ?? DEFAULT_HERO_DAYS;
  return (now - e.last_updated.epochMs) <= days * DAY;
}

/* ── WHICH EVENT OWNS THE TOP OF THE PAGE ─────────────────────────────────
   ★ THIS RANKED BY TIER FIRST, AND THAT WAS A REAL BUG.
   The first version sorted tier ascending, then recency: any event inside
   India beat any event outside it, unconditionally. So a one-district flood
   warning in Maharashtra would have taken the hero slot from a catastrophic
   glacial lake outburst in Nepal that killed hundreds and was about to reach
   Bihar. That is precisely backwards — for an Indian reader the Nepal event is
   both the bigger story AND the one with consequences still travelling
   downstream toward them.

   Rank is now IMPACT-LED:

     significance   the scorer's own total, which already rises with casualty
                    language, independent corroboration and official alerts.
                    This dominates, because it is the closest thing available
                    to "how bad is it".
     hazard weight  a small, fixed bump for the mechanisms that are
                    catastrophic when they happen at all. A glacial lake
                    outburst or a cyclone landfall is not the same class of
                    event as a heavy-rain warning, even before the toll is in.
     recency        a decay, not a cliff. Yesterday's disaster still outranks
                    today's minor flood; a fortnight-old one does not.
     proximity      a modest bonus for tier 1, NOT an override. India-first is
                    a tiebreak between comparable events, never a reason to
                    bury a regional catastrophe.

   Every component is returned in the breakdown so a wrong call can be
   diagnosed against the numbers rather than argued about. */
const HAZARD_WEIGHT = {
  glof: 6,          // rare, sudden, no rain to warn you, cascades downstream
  cyclone: 5,       // named, tracked, and a landfall is a national event
  cloudburst: 4,    // catastrophic locally, and undetectable in advance
  landslide: 3,
  flood: 2,
  extreme_rain: 1,  // the most common, and often only a forecast
};

export function heroRank(e, now = Date.now()) {
  const significance = e.significance_score ?? 0;
  const hazard = HAZARD_WEIGHT[e.hazard] ?? 0;
  const ageDays = (now - e.last_updated.epochMs) / DAY;
  /* Full marks for the first two days, then falling away to nothing by
     fourteen — the same horizon isCurrent() uses, so an event fades out of
     contention rather than dropping out of it. */
  const recency = Math.max(0, 8 * (1 - Math.max(0, ageDays - 2) / 12));
  const proximity = e.tier === 1 ? 3 : 0;
  return {
    total: significance + hazard + recency + proximity,
    parts: { significance, hazard, recency: +recency.toFixed(1), proximity },
  };
}

/** The one event that owns the hero, or null. */
export function currentEvent(events = loadEvents(), now = Date.now()) {
  const live = events.filter((e) => isCurrent(e, now));
  if (!live.length) return null;
  return live
    .map((e) => ({ e, r: heroRank(e, now) }))
    .sort((a, b) => b.r.total - a.r.total || b.e.last_updated.epochMs - a.e.last_updated.epochMs)[0].e;
}

/* ── HUMAN TIME, WITHOUT A LIBRARY ────────────────────────────────────────
   "Updated 2 hours ago" is the single most freshness-carrying string on the
   page, so it is computed at BUILD time and stamped, never left to client JS.
   The page also prints the absolute instant beside it — a relative age with no
   anchor is unfalsifiable, and this repo's air page learned that the hard way
   (AD-27.6-A: nothing repaints a reading). */
export function ago(epochMs, now = Date.now()) {
  const s = Math.max(0, Math.round((now - epochMs) / 1000));
  if (s < 90) return 'just now';
  const m = Math.round(s / 60);
  if (m < 90) return `${m} minute${m === 1 ? '' : 's'} ago`;
  const h = Math.round(m / 60);
  if (h < 36) return `${h} hour${h === 1 ? '' : 's'} ago`;
  const d = Math.round(h / 24);
  return `${d} day${d === 1 ? '' : 's'} ago`;
}

/** IST, because every reader of this page is in it. */
export function istStamp(epochMs) {
  const d = new Date(epochMs + 19800000);
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const p = (n) => String(n).padStart(2, '0');
  return `${p(d.getUTCHours())}:${p(d.getUTCMinutes())} IST, ${d.getUTCDate()} ${MON[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}
