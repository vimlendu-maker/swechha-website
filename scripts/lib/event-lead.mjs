/* ═══════════════════════════════════════════════════════════════════════════
   event-lead.mjs — THE HEADLINE MAY NOT CONTRADICT THE PAGE'S OWN FIGURES.
   ───────────────────────────────────────────────────────────────────────────
   THE DEFECT THIS CLOSES, read off disk on 11 September 2026.
   data/climate-events/active/nepal-glof.json carried, in the same file:

     "headline": "Nepal flood death toll rises to 1,377, over 5,000 still missing"
     "impact": { "deaths": { "value": 1365, ... } }

   So /now/climate-event/nepal-glof printed one death toll in 40pt type at the
   top of the page and a different one in the CONFIRMED DEAD card underneath
   it, about a disaster that has killed more than a thousand people. Neither
   number was wrong in itself — each is a verbatim quotation of an outlet — and
   that is exactly why nothing caught it. The page was internally inconsistent,
   in public, for as long as the two pools disagreed.

   ★ THE CAUSE IS TWO POOLS AND TWO RULES, NOT A BAD NUMBER.
   The headline was chosen by ranking the detector's FULL, uncapped item list by
   headlinePenalty() and taking the least-penalised survivor. The figure was
   computed by consolidate() over the dossier's REGISTER — the first 24 items
   plus up to six official alerts, then filtered again by the place guard and by
   electLead()'s recency/corroboration rule. The 1,377 item is not in that
   file's register at all — the string occurs once in the whole dossier, as the
   headline; its 24 source titles carry 1,365, 1,365 and 1,369 — so it could
   lead the page while contributing nothing to the figure the page published.
   Two selections, made independently, never compared.

   ★ THE FIX IS AN ORDERING AND A DISQUALIFICATION, NOT A NEW JUDGEMENT.
   The impact rows are computed FIRST. A candidate headline is then run through
   figuresFromText() — the same grammar that produced the rows — and if it
   yields a death toll of its own that differs from the one the page is about to
   print, it cannot lead. The next candidate is asked instead, and a candidate
   carrying no death toll at all is perfectly eligible. A plainer headline beats
   a wrong one.

   Nothing here chooses, averages, adjusts or invents a figure. It can only
   decline a headline, and the value it declines against is one consolidate()
   had already decided.

   ★ TWO CALLERS, BECAUSE THERE ARE TWO WRITE PATHS TO `impact`.
   detect-climate-events.mjs elects the lead against the figures it has just
   computed. extract-event-figures.mjs backfills a row onto a dossier whose
   headline an OLDER run elected, against figures that did not exist then — so
   it can manufacture the same contradiction from the other end. It has no
   candidate pool and may not compose a heading, so it abstains from the write
   and leaves the dossier to the detector. Both are asserted in
   lib/event-lead.test.ts, because a guard nothing calls is a comment.

   ★ WHY ONLY THE DEATH METRICS. LEAD_FIGURE_METRICS is deliberately short.
   Every metric added to it is another reason to descend the quality ranking,
   and descending it is how a situation board ends up led by commentary — the
   failure that withdrew eight live pages on 9 September 2026 and put
   ANALYSIS_MARKERS into event-terms.mjs. The death toll is the figure a
   disaster page leads on and the one the inbox item named; widening the set is
   a one-line change here, to be made only with the same kind of evidence.

   ★ WHY IT ONLY FIRES WHEN THE PAGE HOLDS A FIGURE. A headline whose toll the
   dossier does not publish at all contradicts nothing on the page — the card
   reads "not established" and `uncertain` says in as many words that a number
   in a headline belongs to the outlet that printed it. Disqualifying those too
   would silently rewrite the lead of every dossier whose place guard abstains,
   which is a different change with different evidence behind it. */
import { headlinePenalty } from './event-terms.mjs';
import { figuresFromText } from './event-figures.mjs';

/** The metrics a lead headline is checked against. See the note above before
 *  adding to this list. */
export const LEAD_FIGURE_METRICS = ['deaths', 'indians_dead'];

/**
 * A candidate headline: a title the detector has already CLEANED, and the
 * moment its item was published. Callers pass richer objects (the detector
 * carries the feed item along on `.item`) and those properties survive — this
 * names only what the election itself reads.
 *
 * @typedef {{title: string, publishedMs?: number}} LeadCandidate
 *
 * The dossier's impact block, exactly as consolidate() — plus any editor-set
 * rows — produced it: one row per metric, each carrying the value the page will
 * print.
 *
 * @typedef {Record<string, {value?: number}>} ImpactRows
 */

/**
 * True when `title`'s own figures disagree with the impact rows the dossier is
 * about to publish.
 *
 * @param {string} title  a CLEANED headline — cleanHeadline() has already run.
 * @param {ImpactRows|null} [impact]
 */
export function headlineDisagreesWith(title, impact) {
  if (!impact) return false;
  for (const f of figuresFromText(title)) {
    if (!LEAD_FIGURE_METRICS.includes(f.metric)) continue;
    const held = impact[f.metric];
    /* No row, or a row with no numeric value: the page is not publishing this
       figure, so there is nothing for the headline to contradict. */
    if (!held || !Number.isFinite(held.value)) continue;
    if (f.value !== held.value) return true;
  }
  return false;
}

/**
 * The ranking the lead is chosen from: least penalised, then most recent.
 * Exported because it is the UNGUARDED rule — the one that shipped 1,377 over
 * 1365 — and a test that cannot call it cannot show the defect.
 *
 * @param {LeadCandidate[]} candidates
 * @param {string} hazard
 * @returns {LeadCandidate[]}
 */
export function rankHeadlines(candidates, hazard) {
  return candidates.slice().sort((a, b) => {
    const pa = headlinePenalty(a.title, hazard);
    const pb = headlinePenalty(b.title, hazard);
    return pa - pb || (b.publishedMs || 0) - (a.publishedMs || 0);
  });
}

/**
 * The headline that will lead the page: the least-penalised candidate that does
 * not contradict `impact`.
 *
 * ★ IT NEVER RETURNS NOTHING WHEN IT WAS GIVEN SOMETHING. If every candidate
 * disagrees — which needs the register to hold a toll that no headline in the
 * pool prints — the unguarded pick is returned rather than leaving the page
 * headless. That is the one case this cannot repair, and it is recorded here
 * rather than hidden: the alternative would be a page with no heading at all.
 *
 * @param {LeadCandidate[]} candidates  cleaned titles.
 * @param {string} hazard
 * @param {ImpactRows|null} [impact]
 * @returns {LeadCandidate|null} the winning candidate, or null for an empty pool.
 */
export function electHeadline(candidates, hazard, impact = null) {
  const ranked = rankHeadlines(candidates, hazard);
  return ranked.find((c) => !headlineDisagreesWith(c.title, impact)) || ranked[0] || null;
}
