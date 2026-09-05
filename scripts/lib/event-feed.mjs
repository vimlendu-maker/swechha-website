/* ═══════════════════════════════════════════════════════════════════════════
   event-feed.mjs — AN ARTICLE'S PUBLICATION TIME IS A FACT, NOT A READING.
   ───────────────────────────────────────────────────────────────────────────
   ★ THE INCIDENT THIS MODULE EXISTS FOR, IN FULL.

   /now/climate-event/nepal-glof published "600 CONFIRMED DEAD" at 19:10 IST on
   28 August 2026 and "160 CONFIRMED DEAD" from 21:17 until 01:12 — four and a
   half hours, on a live disaster page, on the largest numeral on the page.
   Nothing about the disaster changed in that window. Nothing about the sources
   changed either: the same twenty-four headlines were in the register before
   and after. ONE FIELD MOVED.

   The News On AIR piece "Nepal flash flood claims nearly 160 lives; over 750
   Missing, including 133 Indians" is returned by TWO of this detector's seven
   Google News queries, with TWO DIFFERENT pubDates for the identical URL:

       q0  'india flood OR flooding OR inundated when:2d'
           Fri, 28 Aug 2026 19:48:50 GMT
       q1  'india OR nepal OR himalaya cloudburst OR "flash flood" when:2d'
           Fri, 28 Aug 2026 13:39:10 GMT

   Six hours and nine minutes apart, verified live against both feeds on 29
   August 2026 — 49 URLs appeared in more than one query that day and this was
   the one Google could not keep a single time for. It is not a parsing bug at
   this end. Google News stamps an item with when it entered THAT query's
   result set, and a story re-surfaces into a query hours after it was written.

   ★ AND IT WAS THREE TIMES, NOT TWO. Reading this article's stamp back through
   every commit of nepal-glof.json: 08:39:31 GMT, then 13:39:10, then 19:48:50.
   Eleven hours of drift on one unchanging headline, always forward.

   ★ ONE ARTICLE IN THE REGISTER RE-STAMPS ON EVERY SINGLE RUN. The Reuters
   piece in himalaya-flood.json ("Chinese rescue team finds...") was recorded,
   in run order, at 19:03, 01:04, 20:09, 02:04, 02:34, 20:49, 22:20, 23:30,
   23:34 and 22:55 GMT — ten runs, ten different times, oscillating across a
   22-hour range. Two queries answer for it and one of them is handing back
   something close to the fetch time. Every one of those runs re-ordered that
   dossier's register, and any figure that headline had carried would have
   changed hands with it. It is the same defect with the fuse already lit.

   collectNews() de-duplicated by link keeping the FIRST occurrence in query
   order, and a Google News query is a relevance-ranked window that churns run
   to run. So the moment this article appeared in q0 as well as q1, the
   publication time recorded for an article ALREADY ON THE PAGE jumped forward
   six hours — and a stale headline became the newest reading in the register.
   consolidate() elects the lead figure by exactly that field. 600 became 160.

   ★ THE RULE, AND WHY IT IS THIS ONE.
   An article is published once. Every later timestamp for it is an artefact of
   how it was re-encountered, so where two answers exist THE EARLIER ONE IS THE
   ANSWER, and a time already recorded never moves forward. Both halves are
   needed and neither is sufficient: `dedupeFeedItems` removes the run-to-run
   nondeterminism inside a single fetch, `anchorPublished` stops a future fetch
   inventing a third, later time for something already on the page.

   ★ WHY NOT SIMPLY TRUST ONE QUERY. Because the queries overlap by design —
   a Nepali glacial flood is matched by three of the seven — and dropping the
   overlap would cost the corroboration counts the score is built on. The
   overlap is the point. Reconciling it is this module's job.
   ═══════════════════════════════════════════════════════════════════════════ */

/** The normalised title two outlets' verbatim wire copy shares. Kept identical
 *  to the form collectNews() has always used, because it decides what counts
 *  as corroboration and changing it would move the scores. */
const titleKey = (t) => String(t || '').toLowerCase().replace(/[^a-z0-9 ]/g, '').slice(0, 70);

/* Exported because the detector needs the same reading of a source's date
   that anchorPublished() uses, to decide when new reporting actually
   arrived — see last_updated in detect-climate-events.mjs. */
export const msOf = (p) => (p ? Date.parse(p) || 0 : 0);

/**
 * De-duplicate feed items by link, then by normalised title — wire copy runs
 * verbatim across outlets, and counting it twice would fake corroboration.
 *
 * ★ THE DUPLICATE IS NOT DISCARDED, IT IS RECONCILED. Where two copies of one
 * article carry different pubDates, the surviving row keeps the EARLIEST. The
 * result no longer depends on which query surfaced the story first, which is
 * the nondeterminism that moved a live death toll.
 *
 * @param {Array<{link?:string,title?:string,published?:string|null,publishedMs?:number|null}>} items
 * @returns {Array} one row per article, in first-seen order.
 */
export function dedupeFeedItems(items) {
  const byLink = new Map();
  const byTitle = new Map();
  const out = [];
  for (const i of items) {
    const key = titleKey(i.title);
    const prev = (i.link != null && byLink.get(i.link)) || byTitle.get(key);
    if (prev) {
      const now = i.publishedMs ?? msOf(i.published);
      const had = prev.publishedMs ?? msOf(prev.published);
      /* A row with no parseable date loses to one that has a date; between two
         dates, the earlier wins. */
      if (now && (!had || now < had)) { prev.published = i.published; prev.publishedMs = now; }
      continue;
    }
    if (i.link != null) byLink.set(i.link, i);
    byTitle.set(key, i);
    out.push(i);
  }
  return out;
}

/**
 * Carry the publication time an article was FIRST recorded with across a
 * re-detection. A stamp already in the register may move earlier — a feed
 * correcting itself downward is new information about when the piece ran — and
 * may never move later.
 *
 * ★ NEWS ROWS ONLY. A news source's id is derived from its publisher and its
 * own title, so an id match means the same article. An official alert's id is
 * `official-1`, `official-2` — POSITIONAL, the n-th alert matched by whichever
 * run wrote the file. Two runs' `official-1` are routinely different alerts,
 * so anchoring them would stamp one alert with another's time.
 *
 * @param {Array<{id:string,tier?:string,publisher?:string,title?:string,url?:string|null,published?:string|null}>} sources
 *   the register just built.
 * @param {Array<{id:string,tier?:string,publisher?:string,title?:string,url?:string|null,published?:string|null}>} [previous]
 *   the register on disk.
 * @returns {Array} `sources`, with anchored `published` values.
 */
export function anchorPublished(sources, previous) {
  if (!Array.isArray(previous) || !previous.length) return sources;
  const was = new Map();
  for (const s of previous) {
    if (!s || s.tier !== 'news' || !s.id || !s.published) continue;
    was.set(s.id, s.published);
  }
  if (!was.size) return sources;
  return sources.map((s) => {
    if (s.tier !== 'news') return s;
    const before = was.get(s.id);
    if (!before) return s;
    const a = msOf(before);
    const b = msOf(s.published);
    /* Unparseable either side: prefer what is already on the page, which is
       what a reader has already seen. */
    if (!a || !b) return before ? { ...s, published: before } : s;
    return b > a ? { ...s, published: before } : s;
  });
}

/* ── WHAT "LAST UPDATED" IS ALLOWED TO MEAN ───────────────────────────────
   The freshest piece of reporting we hold about an event, never earlier than
   what was already recorded and never later than now.

   It was `fingerprint changed ? now : keep`, and the fingerprint includes the
   score and the publisher count — both of which move as coverage DECAYS. So an
   event the wires had dropped kept looking freshly updated and the derived
   status ladder kept calling it active. Losing a source is not an update, and
   neither is a bad fetch: one run read 11 items where the run fifty minutes
   before it read 235.

   MONOTONIC, so a shrinking register cannot walk the clock backwards, and
   DERIVED FROM THE DATA rather than from when the job ran, so a rebuild that
   learns nothing new writes the same value — the same reason the pages commit
   absolute instants and let the browser do relative time.

   anchorPublished() above has already pinned each source's date to the first
   value seen, so an item that is merely republished cannot drag this forward. */
export function lastUpdatedFrom(previousMs, sources, now = Date.now()) {
  const reported = (sources || []).map((x) => msOf(x?.published)).filter((m) => m > 0);
  const freshest = reported.length ? Math.min(Math.max(...reported), now) : 0;
  /* `|| now` is the FIRST-DETECTION fallback only — nothing recorded and no
     readable date anywhere. It must not apply when a previous value exists:
     an earlier draft folded it into the expression and an empty register then
     jumped the clock to now, which is precisely the bad-fetch case this
     function is here to survive. The test for it is the one that caught this. */
  return Math.max(previousMs || 0, freshest) || now;
}

/* ── A COLLAPSE IS NOT A QUIET DAY ────────────────────────────────────────
   The detector exits 75 when NOTHING answers, which is a statement about the
   internet rather than the weather. This is the case that slips past it: the
   sources answer, the RSS parses, and a fraction of the usual items come back.
   On 5 September one run read 218 news items where the run fifty minutes
   before it read 574, and the Nepal glacial flood went from 137 independent
   publishers to 2 with 1,344 dead. Everything downstream survives that now —
   publication latches, and a fade waits a day before demoting — but nothing
   noticed it happen. It looked like an ordinary run.

   THE THRESHOLD IS MEASURED. Across the 59 runs in checked.json's committed
   history the run-over-run ratio has a median of 1.00; the two real collapses
   both landed at 0.38 and both recovered to full volume on the next run; the
   lowest non-collapse ratio is 0.66. Half sits in the middle of that gap, so
   this fires twice in 59 runs and both times on something real. A baseline
   floor keeps it quiet when the previous run was itself tiny — comparing two
   small numbers is how a ratio test turns into noise.

   Returns null when the run looks normal, so the caller reads as a question. */
export const COLLAPSE_RATIO = 0.5;
export const COLLAPSE_MIN_BASELINE = 100;

export function feedCollapse(current, previous) {
  if (typeof previous !== 'number' || previous < COLLAPSE_MIN_BASELINE) return null;
  if (typeof current !== 'number' || current >= previous * COLLAPSE_RATIO) return null;
  return { current, previous, pct: Math.round((current / previous) * 100) };
}
