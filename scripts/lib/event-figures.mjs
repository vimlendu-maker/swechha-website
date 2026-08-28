/* ═══════════════════════════════════════════════════════════════════════════
   event-figures.mjs — READING THE NUMBERS OUT OF THE HEADLINES, ATTRIBUTED.
   ───────────────────────────────────────────────────────────────────────────
   THE DEFECT THIS CLOSES, exactly as it shipped. /now/climate-event/nepal-glof
   led on four cells reading "—  DEATHS  not established", "—  MISSING  not
   established", and so on, under a headline that was itself a listicle
   ("6 ways to help victims..."). Meanwhile the twenty-four sources listed at
   the bottom of that same page carried, in their own titles: 469 dead, 547
   dead, 472 dead, 392 dead, 1,944 injured, 1,468 missing, 320 Indians
   uncontactable. The page had the numbers. It was refusing to print them
   because nobody had typed them into `impact`.

   That refusal was well-intentioned and it was still wrong. The rule this
   repository actually holds is not "no numbers" — it is EVERY FIGURE CARRIES
   ITS SOURCE. A death toll lifted verbatim from a named outlet's own headline,
   printed beside that outlet's name and a link to it, satisfies that rule
   completely. It is a strictly stronger statement than the em-dash, because
   the em-dash tells the reader nothing and also tells them nothing about who
   said what.

   ★ WHAT THIS DOES NOT DO, AND CANNOT BE MADE TO DO.
   It never averages, never rounds, never picks a "best" figure by judgement,
   and never states a number in this repository's own voice. It reads digits
   out of a string somebody else published, keeps the string's own hedge
   ("nearly", "over"), and hands the renderer every value it found so the
   DISAGREEMENT is visible. On the Nepal event the outlets ranged from 160 to
   547 dead on the same day; a page showing 547 alone would be as dishonest as
   one showing nothing, and a page showing "160-547, six outlets, latest 547"
   is the true state of the record.

   ★ THE GRAMMAR IS DELIBERATELY MEAN, AND THESE ARE THE CASES THAT MADE IT SO.
   Every one of these is a real headline from the Nepal dossier:

     "List Of 35 Countries Whose Citizens Are Missing"   35 is COUNTRIES. The
        word "missing" is four tokens away, and the noun touching the number is
        on the reject list. No match.
     "swept bodies 200km downstream, 3 found in UP"      200km is a distance —
        a digit glued to a unit never counts. "3 found" has no metric word.
     "flood was just 100 metres from me"                 a distance again.
     "Families of 33 from Bengal pray for a miracle"      33 people, and not a
        count of anything this page publishes.
     "6 ways to help victims"                            "ways" is rejected.
     "left hundreds dead or missing"                     a word, not a numeral.
        This module publishes digits or nothing.

   So a number counts only when a metric word is within two tokens of it, or
   when it completes an explicit toll construction ("toll hits N", "claims N
   lives"). Everything else is dropped in silence, which is the correct
   direction for a module that runs unattended during a disaster.
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── THE FIVE METRICS, AND THE ONE THAT IS ABOUT INDIANS ──────────────────
   `indianOf` names the metric an Indian-qualified match is filed under. It is
   a separate row on the page and not a subtraction from the main one — 320
   Indians uncontactable is a subset of the missing, and presenting it as a
   sixth independent total would double-count people. */
const METRICS = {
  deaths: {
    label: 'Confirmed dead',
    words: ['dead', 'deaths', 'death', 'killed', 'die', 'died', 'dies', 'lives', 'bodies',
      'fatalities', 'perished'],
    indianOf: 'indians_dead',
  },
  missing: {
    label: 'Missing or unaccounted for',
    words: ['missing', 'unaccounted', 'uncontactable', 'unreachable', 'untraced', 'traceless'],
    indianOf: 'indians_missing',
  },
  injured: {
    label: 'Injured',
    words: ['injured', 'injuries', 'hurt', 'wounded'],
    indianOf: 'indians_injured',
  },
  displaced: {
    label: 'Displaced or evacuated',
    words: ['displaced', 'evacuated', 'evacuees', 'homeless', 'sheltered', 'marooned'],
    indianOf: 'indians_displaced',
  },
  rescued: {
    label: 'Rescued',
    words: ['rescued', 'airlifted', 'saved', 'evacuees'],
    indianOf: 'indians_rescued',
  },
  stranded: {
    label: 'Stranded or trapped',
    words: ['stranded', 'trapped', 'stuck'],
    indianOf: 'indians_stranded',
  },
};

/* The Indian rows, declared so the renderer can order and label them without
   deriving names from `indianOf` strings. */
const INDIAN_LABEL = {
  indians_dead: 'Indians confirmed dead',
  indians_missing: 'Indians missing or uncontactable',
  indians_injured: 'Indians injured',
  indians_displaced: 'Indians displaced',
  indians_rescued: 'Indians rescued',
  indians_stranded: 'Indians stranded',
};

/* ── THE SHORT FORMS, FOR WHERE THE LONG ONES DO NOT FIT ──────────────────
   ★ THIS IS A FOLD BUDGET, MEASURED AT 375x635. On the homepage deck the
   subject and unit sit beside the numeral in a narrow column, and "Confirmed
   dead, reported" wraps to two lines there where Air's "AQI, 24-hour rolling"
   takes one. Two extra lines in that column pushed the slide's own "View full
   situation" link to y=647 — twelve pixels below an iPhone-class visible
   height — which is exactly the defect this deck's own CSS has been re-measured
   three times to prevent. The full labels stay on the situation page, where
   there is room for them and where precision is the product. */
export const METRIC_SHORT = {
  deaths: 'reported dead',
  missing: 'reported missing',
  injured: 'reported injured',
  displaced: 'displaced',
  rescued: 'rescued',
  stranded: 'stranded',
  indians_dead: 'Indians dead',
  indians_missing: 'Indians missing',
  indians_injured: 'Indians injured',
  indians_displaced: 'Indians displaced',
  indians_rescued: 'Indians rescued',
  indians_stranded: 'Indians stranded',
};

/* The hazard in as few words as a tab strip and a narrow column can carry.
   HAZARD_NAME below is the full form and stays the page's. */
export const HAZARD_SHORT = {
  glof: 'Glacial flood',
  cloudburst: 'Cloudburst',
  flood: 'Flood',
  landslide: 'Landslide',
  cyclone: 'Cyclone',
  extreme_rain: 'Extreme rain',
};

export const METRIC_LABEL = {
  ...Object.fromEntries(Object.entries(METRICS).map(([k, v]) => [k, v.label])),
  ...INDIAN_LABEL,
};

/* THE ORDER THE HERO CARDS APPEAR IN. Human cost first, and within it the
   figure a reader is looking for first. Indians-specific rows never lead: this
   is a page about a disaster, not about one nationality inside it. */
export const METRIC_ORDER = [
  'deaths', 'missing', 'injured', 'displaced', 'stranded', 'rescued',
  'indians_missing', 'indians_dead', 'indians_injured', 'indians_stranded',
  'indians_rescued', 'indians_displaced',
];

/* ── NOUNS THAT MEAN THE NUMBER IS NOT PEOPLE ─────────────────────────────
   Checked against the token immediately after the numeral. Each one is here
   because it appeared, or would plainly appear, glued to a digit in disaster
   reporting. */
const REJECT_NOUN = new Set([
  'countries', 'country', 'nations', 'states', 'districts', 'villages', 'towns',
  'ways', 'things', 'reasons', 'points', 'questions', 'photos', 'videos', 'images',
  'km', 'kms', 'kilometre', 'kilometres', 'kilometer', 'kilometers', 'metre', 'metres',
  'meter', 'meters', 'feet', 'ft', 'm', 'mm', 'cm', 'inches', 'inch',
  'hours', 'hour', 'hrs', 'days', 'day', 'weeks', 'months', 'years', 'minutes', 'mins',
  'am', 'pm', 'ist',
  'crore', 'lakh', 'million', 'billion', 'percent', 'per',
  'mw', 'kw', 'gw', 'mld', 'cusecs', 'cumecs',
  'bridges', 'bridge', 'roads', 'road', 'houses', 'homes', 'buildings', 'schools',
  'hospitals', 'dams', 'dam', 'vehicles', 'trucks', 'buses', 'camps', 'teams',
  'sq', 'hectares', 'ha', 'acres',
]);

/* Hedges an outlet put in front of its own number. Kept verbatim, because
   "nearly 160" and "160" are different claims and the difference is the
   outlet's, not ours. */
const HEDGES = [
  ['at least', 'at least'], ['more than', 'more than'], ['upwards of', 'more than'],
  ['nearly', 'nearly'], ['almost', 'nearly'], ['about', 'about'], ['around', 'about'],
  ['some', 'about'], ['over', 'over'], ['above', 'over'], ['close to', 'nearly'],
  ['as many as', 'as many as'], ['up to', 'up to'],
];

/* ── VERB CONSTRUCTIONS WHERE THE NUMBER COMES LAST ──────────────────────
   "toll hits 547" has no metric word after the numeral at all, so pattern A
   cannot see it, and "Deaths Rise To 472, Over 170 Indians Missing" is worse
   than invisible to A: the nearest metric word after 472 is the OTHER
   headline figure's. Both forms appeared in the first dossier this ran on.

   Two lists, because they carry different risk. A SPECIFIC phrase names the
   metric on its own and is trusted. A GENERIC verb ("claims", "leaves") is
   trusted only when a death word also appears just after the numeral —
   "claims nearly 160 lives" qualifies, "claims 6 districts are cut off" does
   not. */
const TOLL_SPECIFIC = [
  'toll rises to', 'toll rose to', 'toll climbs to', 'toll climbed to', 'toll mounts to',
  'toll mounted to', 'toll hits', 'toll hit', 'toll reaches', 'toll reached', 'toll nears',
  'toll crosses', 'toll crossed', 'toll touches', 'toll at', 'toll of', 'toll to', 'toll:',
  'toll now', 'death toll',
  /* The same sentence written without the word "toll", which is how NDTV,
     PTI and most television desks write it. */
  'deaths rise to', 'deaths rose to', 'deaths rise', 'deaths climb to', 'deaths at',
  'deaths to', 'deaths:', 'deaths reach', 'deaths reached', 'deaths cross',
  'dead rises to', 'dead rose to', 'dead:', 'dead now', 'dead to',
  'killed at least', 'killed rises to', 'death count',
  'missing rises to', 'missing at', 'missing:', 'missing now',
  'injured at', 'injured:', 'injured rises to',
];
const TOLL_GENERIC = ['claims', 'kills', 'killing', 'leaves', 'leaving', 'sweeps away'];

/** Which metric a specific toll phrase names. */
function tollMetric(phrase) {
  if (/missing/.test(phrase)) return 'missing';
  if (/injured/.test(phrase)) return 'injured';
  return 'deaths';
}

/* Words that mean the outlet is quoting a government rather than a stringer.
   Raises the confidence word on that one value only. */
const OFFICIAL_VOICE = [
  'mea', 'ministry of external affairs', 'external affairs ministry', 'government says',
  'govt says', 'ndma', 'ndrf', 'home ministry', 'foreign minister', 'home minister',
  'chief minister', 'police say', 'army says', 'official', 'officials say', 'authorities say',
  'district administration', 'disaster management authority', 'prime minister', 'embassy',
  'spokesperson', 'ministry',
];

const INDIAN_WORDS = /^(indian|indians|indian's)$/i;
const INDIAN_NOUNS = new Set(['nationals', 'national', 'tourists', 'tourist', 'pilgrims',
  'pilgrim', 'citizens', 'citizen', 'trekkers', 'trekker', 'workers', 'students']);

/** Tokenise for matching, keeping numerals whole. A numeral keeps its grouping
 *  commas so "1,468" survives as one token; a digit followed immediately by
 *  letters ("200km") is deliberately kept as ONE token so the reject test
 *  below sees the unit.
 *
 *  EACH TOKEN CARRIES ITS CHARACTER OFFSET, and that is not tidiness. The
 *  first version located a numeral in the raw string with `lastIndexOf`, which
 *  is wrong the moment a headline repeats a figure — and "320 Indians ... 320
 *  uncontactable" is an ordinary sentence in this material. */
function tokens(s) {
  const src = String(s || '').replace(/[’‘]/g, "'");
  const out = [];
  const re = /[A-Za-z0-9][A-Za-z0-9,.'%:-]*/g;
  for (let m = re.exec(src); m; m = re.exec(src)) {
    /* TRAILING PUNCTUATION COMES OFF, and it cost a real figure. The class
       above has to admit a comma so "1,468" survives as one token, which also
       swallows the comma in "Deaths Rise To 472, Over 170" — and "472," fails
       the numeral test, so NDTV's death toll was silently dropped. */
    const t = m[0].replace(/[,.:'%-]+$/, '');
    if (t) out.push({ t, at: m.index });
  }
  return { src, toks: out };
}

const NUMERAL = /^(\d{1,3}(?:,\d{2,3})*|\d+)$/;
const GLUED = /^\d+[A-Za-z%]/;

const numOf = (t) => Number(t.replace(/,/g, ''));

/** Hedge immediately before position `i`, if any. */
function hedgeAt(toks, i) {
  const two = `${(toks[i - 2] || '').toLowerCase()} ${(toks[i - 1] || '').toLowerCase()}`;
  const three = `${(toks[i - 3] || '').toLowerCase()} ${two}`;
  for (const [needle, word] of HEDGES) {
    if (three.endsWith(needle) || two.endsWith(needle) || (toks[i - 1] || '').toLowerCase() === needle) {
      return word;
    }
  }
  return null;
}

/** True when the numeral at `i` is qualified as Indian by what touches it. */
function indianAt(toks, i) {
  const after = (toks[i + 1] || '').toLowerCase().replace(/[.,:]$/, '');
  const after2 = (toks[i + 2] || '').toLowerCase().replace(/[.,:]$/, '');
  if (INDIAN_WORDS.test(after)) return true;
  if (INDIAN_WORDS.test(after) || (INDIAN_WORDS.test(after) && INDIAN_NOUNS.has(after2))) return true;
  /* "290 Indian nationals", "300 Indian tourists" — the adjective then a noun. */
  if (after === 'indian' && INDIAN_NOUNS.has(after2)) return true;
  /* "India says around 320 Indians", handled by the after-token test above.
     "288 Indians among 1,468 missing" — also the after-token test. */
  return false;
}

/**
 * Every figure a single headline yields. Returns
 *   [{ metric, value, hedge, official, matched }]
 * `matched` is the substring the reader can check the claim against, which is
 * the whole point: a figure whose match cannot be shown is a figure nobody can
 * audit.
 */
export function figuresFromText(text) {
  const { src, toks: T } = tokens(text);
  const toks = T.map((x) => x.t);
  const low = src.toLowerCase();
  const out = [];
  const claimed = new Set();

  /* ── OFFICIAL VOICE IS POSITIONAL, AND THAT WAS A REAL MISATTRIBUTION. ──
     Tested over the whole headline first, "Nepal flood death toll rises to
     469; 1,944 injured, India's MEA says 290 Indians missing" marked ALL
     THREE of its figures "Official estimate", because the string contains
     "MEA". Only the third one is the ministry's. So the window is the sixty
     characters around the numeral: close enough that the attribution is in the
     same clause, wide enough to catch "says 290" and "290 ... : MEA". */
  const officialNear = (at) => {
    /* EIGHTEEN CHARACTERS EACH SIDE, measured against the headline that
       exposed this: in "...rises to 469; 1,944 injured, India's MEA says 290
       Indians missing", a window of 34 still reached MEA from 1,944 and
       marked the injury count as the ministry's. At 18 the attribution
       reaches "says 290" and stops short of the injured. */
    const w = low.slice(Math.max(0, at - 18), at + 18);
    return OFFICIAL_VOICE.some((word) => w.includes(word));
  };

  const push = (metric, value, hedge, i, span, at) => {
    /* One numeral serves one metric. Without this, "1,944 injured" reached
       both `injured` and, via a nearby word, something else. */
    if (claimed.has(i) || !Number.isFinite(value) || value <= 0 || value > 10_000_000) return;
    claimed.add(i);
    out.push({ metric, value, hedge: hedge || null, official: officialNear(at), matched: span });
  };

  const span = (i, n = 3) => toks.slice(Math.max(0, i - 2), i + n).join(' ');

  for (let i = 0; i < toks.length; i++) {
    const t = toks[i];
    if (GLUED.test(t)) continue;                    // 200km, 100m, 5pm
    if (!NUMERAL.test(t)) continue;
    const v = numOf(t);
    const at = T[i].at;
    const next = (toks[i + 1] || '').toLowerCase().replace(/[.,:;]$/, '');
    if (REJECT_NOUN.has(next)) continue;            // 35 Countries, 6 ways

    const isIndian = indianAt(toks, i);
    const hedge = hedgeAt(toks, i);

    /* ── PATTERN B FIRST, AND THE ORDER IS THE FIX. ───────────────────────
       A metric word BEFORE the numeral is a stronger signal than one after
       it, because the one after may belong to the next figure in the same
       headline. Run the other way round, "death toll rises to 469; 1,944
       injured" filed 469 as INJURED — it looked ahead, skipped past 1,944 and
       found that figure's own noun. Reading backwards first is what stops a
       headline's second number stealing the first one's label. */
    const tail = low.slice(Math.max(0, at - 44), at).replace(/\s+/g, ' ');
    /* ★ THE PHRASE MUST ABUT THE NUMERAL. `includes` was not enough and the
       failure was symmetrical with pattern A's: once "death toll" appeared
       anywhere in the backward window, EVERY later numeral in that window
       became a death toll — so "toll rises to 469; 1,944 injured" reported
       1,944 dead, and "toll hits 392; 288 Indians among 1,468 missing"
       reported 1,468 dead. Only the outlet's own hedge may sit between the
       phrase and the digits. */
    const abut = tail.replace(new RegExp(`(?:\\b(?:${HEDGES.map(([h]) => h).join('|')})\\s*)?$`), '')
      .replace(/\s+$/, '');
    const spec = TOLL_SPECIFIC.filter((p) => abut.endsWith(p))
      .sort((a, b) => b.length - a.length)[0];
    if (spec) {
      push(isIndian ? METRICS[tollMetric(spec)].indianOf : tollMetric(spec),
        v, hedge, i, span(i, 4), at);
      continue;
    }

    /* ── PATTERN A. The metric word follows, within reach. ────────────────
       Indian-qualified numerals get a wider window, because the qualifier
       itself occupies the tokens the metric would otherwise sit in:
       "320 Indian nationals remain uncontactable" is five tokens wide.

       ★ IT STOPS AT THE NEXT NUMERAL. That is the same defect as above seen
       from the other side: in "392; 288 Indians among 1,468 missing", the
       word "missing" belongs to 1,468 and to nothing else. */
    const reach = isIndian ? 6 : 3;
    let hit = null;
    for (let k = 1; k <= reach && !hit; k++) {
      const raw = toks[i + k];
      if (raw == null) break;
      if (NUMERAL.test(raw) || GLUED.test(raw)) break;
      const w = raw.toLowerCase().replace(/[^a-z]/g, '');
      if (!w) continue;
      for (const [metric, def] of Object.entries(METRICS)) {
        if (def.words.includes(w)) { hit = metric; break; }
      }
    }
    if (hit) {
      push(isIndian ? METRICS[hit].indianOf : hit, v, hedge, i, span(i, reach + 1), at);
      continue;
    }

    /* ── PATTERN C. A generic verb, redeemed by a death word after it. ────
       "claims nearly 160 lives" counts; "claims 6 districts are cut off"
       does not, and neither does anything else that reaches here. */
    if (TOLL_GENERIC.some((p) => abut.endsWith(p))) {
      const after = toks.slice(i + 1, i + 4).map((x) => x.toLowerCase().replace(/[^a-z]/g, ''));
      if (!after.some((w) => METRICS.deaths.words.includes(w))) continue;
      push(isIndian ? 'indians_dead' : 'deaths', v, hedge, i, span(i, 4), at);
    }
  }
  return out;
}

/* ── FROM MANY HEADLINES TO ONE ROW PER METRIC ────────────────────────────
   ★ THE LEADING VALUE IS THE MOST RECENTLY PUBLISHED ONE, NOT THE HIGHEST.
   This was the one real judgement in the file and it is made here, once, in
   the open. A death toll in the first days of a disaster RISES as bodies are
   found, so the maximum is usually the newest and taking the maximum looks
   identical most of the time — but not always, and where they differ the
   maximum is wrong. "Toll hits 547" from an outlet at 12:10 supersedes "nearly
   160 lives" from one at 08:39 because more was known at 12:10, whereas
   picking the larger of two figures published in the same hour by two outlets
   who disagree is this page choosing the more alarming one. Recency is a fact
   about the record; magnitude is an editorial preference.

   ★ THE SPREAD DECIDES THE CONFIDENCE WORD, and it is computed, not chosen.
   Outlets agreeing inside 15% is a REPORTED figure. Outlets ranging 160 to 547
   is a PRELIMINARY one, and saying so is the most useful thing this page can
   do with that row.
*/
const AGREEMENT = 0.15;

/* ── THE PLACE GUARD ──────────────────────────────────────────────────────
   ★ THIS CAUGHT A FIGURE ABOUT TO BE PUBLISHED ON THE WRONG EVENT, and it is
   the most dangerous thing this module could have done.

   The detector clusters an event by which places its headlines mention, so a
   regional outlet covering somebody else's disaster lands in that region's
   cluster: `goa-flood` holds "Nepal Flood Death Toll Rises to 538" because the
   Goan paper ran it, `kashmir-flood` holds "Nepal Flash Flood Death Toll Rises
   to 469" from the Kashmir Observer, and `odisha-flood` holds the same story
   from Kanak News. Extracting figures without this guard put Nepal's death
   toll on three Indian flood pages, each under its own place name.

   So a figure counts only when the headline it came from NAMES THE DOSSIER'S
   OWN PLACE. Prefix matching, because the adjectival form is what a headline
   uses — "Himalayan flood" is the Himalaya cluster, "Goan NRI" is Goa.

   ABSTAINING IS THE RIGHT FAILURE. "Death toll reaches 538, 977 still missing
   as rescue teams race against fresh flood threat" names no place at all, and
   there is no way to tell from it which of two simultaneous floods it is
   about. A dropped figure is a gap; a figure on the wrong page is a false
   claim with a place name attached. */
export function placeTokens(place) {
  return String(place || '')
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter((t) => t.length >= 3);
}

/* ★ THE THRESHOLDS ARE BOTH FROM REAL CASES AND NEITHER IS A ROUND NUMBER
   CHOSEN FOR TIDINESS.

   THREE, not four, because of GOA. At a four-character floor "Goa" produced no
   usable token at all, the guard fell through to its permissive default, and
   `goa-flood` accepted "Nepal Flood Death Toll Rises to 538" — the exact
   migration this function exists to stop, let through by the function itself.

   ALL STRONG TOKENS, not any, because of PRADESH. Five Indian states end in
   that word, so matching on any single token would let a Himachal Pradesh
   headline into the Uttar Pradesh dossier. Requiring every token of five
   characters or more separates them; the short tokens stay optional so
   "Tamil Nadu" still matches a headline that says "Tamil Nadu pilgrims" and
   is not defeated by one that drops "Nadu". */
export function mentionsPlace(title, place) {
  const toks = placeTokens(place);
  if (!toks.length) return true;             // no usable place name: do not gate
  const low = String(title || '').toLowerCase();
  const hit = (t) => new RegExp(`\\b${t}`).test(low);
  const strong = toks.filter((t) => t.length >= 5);
  return strong.length ? strong.every(hit) : toks.some(hit);
}

/**
 * @param {Array<{id:string, publisher:string, title:string, published?:string|null, tier?:string}>} sources
 *   the dossier's own register.
 * @param {{place?: string|null}} [opts] `place` is the dossier's own location
 *   text. Supplied, a figure counts only when the headline it came from names
 *   that place — see the place guard above. Omitted, no gating happens, which
 *   is right only for a caller that has already established the set is about
 *   one event.
 * @returns {Record<string, object>} one row per metric, keyed by metric name.
 */
export function consolidate(sources, { place = null } = {}) {
  /* sources: the dossier's own register as an array, each {id, publisher,
     title, published, tier}. Order does not matter; publication time does. */
  const rows = new Map();
  for (const s of sources) {
    if (place && !mentionsPlace(s.title, place)) continue;
    const when = Date.parse(s.published || '') || 0;
    for (const f of figuresFromText(s.title)) {
      if (!rows.has(f.metric)) rows.set(f.metric, []);
      rows.get(f.metric).push({
        ...f,
        source: s.id,
        publisher: s.publisher,
        when,
        officialTier: s.tier === 'official',
      });
    }
  }

  const out = {};
  for (const [metric, readings] of rows) {
    readings.sort((a, b) => b.when - a.when || b.value - a.value);
    const lead = readings[0];
    const values = readings.map((r) => r.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const spread = max > 0 ? (max - min) / max : 0;
    const outlets = new Set(readings.map((r) => r.publisher)).size;

    /* ONE VALUE, ONE STATUS WORD. The four are lib/climate-events.mjs's and a
       fifth cannot be invented here — the validator rejects it. */
    let status = 'media_report';
    if (spread > AGREEMENT && readings.length > 1) status = 'preliminary';
    else if (lead.official || lead.officialTier) status = 'official_estimate';

    out[metric] = {
      value: lead.value,
      status,
      /* Every outlet that printed a figure for this metric, so the claim is
         attributable to all of them rather than to whichever one was newest. */
      source: [...new Set(readings.map((r) => r.source))],
      label: METRIC_LABEL[metric] || metric.replace(/_/g, ' '),
      hedge: lead.hedge,
      /* The disagreement, carried rather than resolved. */
      spread: { min, max, outlets, readings: readings.length, ratio: +spread.toFixed(3) },
      /* Per-outlet detail for the disclosure under the card. Each is itself a
         claim shape so the validator checks every one of them. */
      readings: readings.map((r) => ({
        value: r.value, status: r.officialTier || r.official ? 'official_estimate' : 'media_report',
        source: r.source, publisher: r.publisher, hedge: r.hedge, matched: r.matched,
        published: r.when || null,
      })),
      note: null,
      extracted: true,
    };
  }
  return out;
}

/* ── THE HEADLINE, WHEN THE DETECTOR'S PICK IS A LISTICLE ─────────────────
   The Nepal page's own heading was "Nepal floods: 6 ways to help victims of
   the glacial collapse that left hundreds dead or missing" — a service piece,
   chosen because headlinePenalty() rewards scale words and that title happens
   to carry three of them. It is not a heading for a disaster board.

   This does not overwrite the detector's choice. It supplies a SHORT, factual
   name for the event, built from the fields the dossier already validates —
   place and hazard — which is what the hero should say in 40pt type. The
   outlet's headline keeps its place lower down, as the reporting it is. */
export const HAZARD_NAME = {
  glof: 'glacial lake outburst flood',
  cloudburst: 'cloudburst',
  flood: 'flood',
  landslide: 'landslide',
  cyclone: 'cyclone',
  extreme_rain: 'extreme rainfall',
};

export function eventName(e) {
  const place = e.location.text.replace(/,.*$/, '').trim();
  const haz = HAZARD_NAME[e.hazard] || e.hazard.replace(/_/g, ' ');
  /* "Nepal glacial lake outburst flood" reads as a wire slug. The article is
     what makes it a name a person would say out loud. */
  const NAMED = {
    glof: `${place}: glacial flood`,
    cloudburst: `${place}: cloudburst`,
    flood: `${place} flood`,
    landslide: `${place} landslide`,
    cyclone: `Cyclone over ${place}`,
    extreme_rain: `${place}: extreme rainfall`,
  };
  return NAMED[e.hazard] || `${place} ${haz}`;
}
