/* ═══════════════════════════════════════════════════════════════════════════
   active-situation.mjs — THE LIFECYCLE OF A DEVELOPING ENVIRONMENTAL EVENT.
   ───────────────────────────────────────────────────────────────────────────
   WHY THIS IS A SEPARATE CONCEPT FROM "CLIMATE EVENT", which is the whole
   reason this file exists rather than four more fields on the dossier:

     /now/climate-event      is a SITUATION — one of the six standing
                             instruments, alongside air and the Yamuna. It owns
                             India's extreme rain as a subject. It moves once a
                             year and it never ends.

     an ACTIVE SITUATION     is a single developing catastrophe that deserves
                             the front of the site for a fortnight and then
                             stops deserving it. It has a beginning, a peak, a
                             tail and an archive life.

   Those are two different clocks and two different editorial contracts, and
   collapsing them is what produced a homepage whose disaster cell pointed at a
   rainfall archive. So the DOSSIER (data/climate-events/active/<slug>.json) is
   still the storage — nothing moves on disk, no URL changes, the twenty-three
   published events keep their pages — and this module is the LIFECYCLE laid
   over it: what status an event is in, who may change it, and what the
   homepage is therefore obliged to show.

   ★ THE PUBLIC WORDS AND THE INTERNAL WORDS ARE THE SAME FIVE.
   ACTIVE, DEVELOPING, STABILISING, DEMOTED, ARCHIVED. A reader sees the first
   three as a pill on the page; the last two are the absence of one. There is
   no sixth, and a status this module does not know fails the build rather than
   rendering as an unlabelled dot — the same rule CLAIM_STATUS follows in
   lib/climate-events.mjs, for the same reason.

   ★ AN ADMIN DECISION ALWAYS BEATS THE DERIVED ONE, AND SAYS SO ON THE PAGE.
   `situation_status` on the dossier is the human's answer and it wins outright.
   Absent, the status is DERIVED from evidence age — so the twenty-three events
   already on disk need no edit and behave sensibly today, and a new detection
   is never stuck waiting for somebody to promote it. That asymmetry is the
   point: automation may raise an event, only a person may bury one early or
   hold one up late.

   ★ DEMOTION IS NOT DELETION, AND THIS IS ENFORCED BY SHAPE.
   Nothing here can remove a dossier, unpublish a page or drop a route. The
   most a demotion does is make `homepageSlot()` return null, at which point
   Air is first again because it is next in the deck. The event page stays at
   its own URL for ever, which is what makes it an archive rather than a
   retraction.
   ═══════════════════════════════════════════════════════════════════════════ */
import { isCurrent, heroRank, loadEvents } from './climate-events.mjs';

const DAY = 86400000;

/* ── THE FIVE, AND WHAT EACH ONE OBLIGES ──────────────────────────────────
   `hero` is the ONLY field the homepage reads, and it is a rank rather than a
   boolean so that "first" and "in the rotation" are one comparable scale
   instead of two flags that can disagree. 0 means "not in the deck at all".

   `pill` is null where the page must NOT show a status pill: a demoted event
   is a record of something that happened, and a coloured dot on it would keep
   asserting urgency the site has itself decided is over. */
export const SITUATION_STATUS = {
  active: {
    rank: 3, hero: 2, label: 'Active', pill: 'red', dot: '●',
    line: 'Being tracked now. The figures are still moving.',
  },
  developing: {
    rank: 2, hero: 2, label: 'Developing', pill: 'amber', dot: '●',
    line: 'The event is unfolding and the reported figures are still rising.',
  },
  stabilising: {
    rank: 1, hero: 1, label: 'Stabilising', pill: 'ochre', dot: '◐',
    line: 'The immediate emergency has passed. Counts are still being settled.',
  },
  demoted: {
    rank: 0, hero: 0, label: 'Closed', pill: null, dot: '○',
    line: 'No longer a developing situation.',
  },
  archived: {
    rank: 0, hero: 0, label: 'Archived', pill: null, dot: '○',
    line: 'Archived. Kept as the record of what happened.',
  },
};

export const STATUSES = Object.keys(SITUATION_STATUS);

/* Public-facing name for the whole content type. The brief allowed either
   wording; this is the one the existing page already used, so a reader who saw
   the old board sees the same words on the new one. */
export const TYPE_LABEL = 'Active situation';

/* ── HOW LONG EACH DERIVED STATE LASTS ────────────────────────────────────
   Measured from `last_updated`, which the detector only advances when the
   EVIDENCE moved — so an event that stops being reported ages out, and one
   still being covered every half hour does not. That is the honest reading of
   "developing", and it is the same clock isCurrent() already runs on.

   The first window is deliberately short. A disaster is genuinely ACTIVE while
   the wires are still moving hour to hour; three days later the reporting has
   turned to relief and inquiry, which is DEVELOPING, not active. Nothing here
   is a claim about the ground — it is a claim about the reporting, which is the
   only thing this repository can observe. */
const DERIVED = [
  [3, 'active'],
  [8, 'developing'],
  [21, 'stabilising'],
];

/* ── HOW LONG COVERAGE MUST STAY GONE BEFORE THE PAGE SAYS SO ─────────────
   The detector stamps `faded_since` when an event drops below the
   corroboration bar and clears it the moment it climbs back — an event below
   that bar is one that would not be published today, which is the honest
   reading of "no longer a developing situation".

   IT IS NOT ACTED ON IMMEDIATELY, and that is the whole design. The counts
   behind it are noisy: one detector run read 11 items where the run fifty
   minutes earlier read 235, taking the Nepal glacial flood from 137
   independent publishers to 2 with 1,344 dead. Demoting on the live counts
   would have closed the site's biggest live disaster on a bad fetch.

   Twenty-four hours is chosen against the measured shapes rather than picked.
   Across the committed history a dip is a SINGLE hourly run, and a genuine
   fade runs 1.3 to 5.4 days: two orders of magnitude apart. A day sits far
   above the noise and comfortably below every real fade, so it demotes what
   has actually gone quiet and nothing that merely flickered. */
const FADE_GRACE_HOURS = 24;

/* ── PUBLICATION IS A ONE-WAY DOOR ────────────────────────────────────────
   ★ THIS IS A COARSER GATE THAN statusOf(), AND IT COMES FIRST.
   `publish_state` decides whether the event has a public URL AT ALL:
   design-routes.ts routes exactly the published ones, the sitemap is derived
   from those routes, and IndexNow pushes what the sitemap carries. statusOf()
   then decides how loudly that URL speaks. The two must not be confused, and
   for a while they were.

   ★ THE BUG THIS EXISTS TO PREVENT.
   The detector set `publish_state` from publishable() on EVERY run, and
   publishable() reads CURRENT reporting volume — a score built from a rolling
   window of headlines, plus a publisher count. Coverage of a real disaster
   decays by design: the wires move on, the window empties, the score falls.
   So an event that had been published, routed, listed in the sitemap, pushed
   to IndexNow and indexed by Google was rewritten to `draft` a few days later,
   its route vanished, and every reader arriving from a search result got a
   404. Nine pages were in that state when it was found — assam-landslide,
   assam-flood, tamil-nadu-flood and six more — each still sitting in
   public/_pages/v3/climate-event/, because the builder writes published events
   and never deletes.

   ★ WHY LATCHING IS THE RIGHT SHAPE AND NOT A WORKAROUND.
   Two rules already written into this repository say a page must keep its
   address: build-climate-disaster-pages.mjs's "situation_status decides
   PROMINENCE, never existence — a demoted event keeps its page for ever", and
   the `archived` line thirty lines above this one, "Kept at this address so
   anything that cited it still resolves." Decay already HAS a lifecycle —
   active -> developing -> stabilising -> demoted, derived below, every step of
   which keeps the page and only changes how it presents. Score decay was a
   second, undesigned lifecycle fighting the first, and it was the one holding
   the URL.

   So the threshold governs MINTING, which is what it was written for: it stops
   one mis-scraped headline becoming a public address. It does not govern
   keeping, because nothing is gained by withdrawing an address and a reader
   with a link to it is lost.

   ★ WHAT THIS DELIBERATELY DOES NOT DO. It is not a retraction mechanism. A
   page published in error should be withdrawn by a person, and withdrawing it
   properly means deciding what its URL answers afterwards — a redirect, or a
   tombstone, never a bare 404. Nobody has needed that yet; when they do it is
   its own change, not a special case here.

   ★ 11 SEPTEMBER 2026: SOMEBODY NEEDS IT. `nepal-flood` is a duplicate of
   `nepal-glof` — the same disaster, forked into a second dossier when the
   winning hazard word changed (see dossierSlug() below). Withdrawing the fork
   is the right move and it retires an address that was published, routed,
   listed in the sitemap and pushed to IndexNow, so by the rule above it needs
   a 308 to the surviving dossier in `movedRedirects` (redirects.ts) in the
   same change that withdraws it.

   NEITHER IS IN THIS COMMIT, and that is a boundary rather than an oversight:
   `data/climate-events/active/` belongs to the cron that writes it and to the
   people who curate it, and the withdrawal pair plus the redirect is one
   human change. dossierSlug() below is the half that stops it recurring, and
   it is deliberately written so that WHEN the withdrawal lands, the region
   resolves back to `nepal-glof` rather than into the tombstone. */
/* ★ `withdrawn` OUTRANKS EVERYTHING, AND IT IS THE ONLY STATE A PERSON SETS.
   Publication is otherwise sticky — an event that ever cleared the bar stays
   published, deliberately, so a dip in hourly coverage cannot close a live
   disaster. That stickiness has no way to express "a human looked at this and
   it is wrong", and on 9 September 2026 eight published events needed exactly
   that: places taken from a publisher's masthead, one flood filed as a
   landslide, and two stories that were an explainer and an opinion piece.
   Setting them back to `draft` would not have held, because the next run that
   found them publishable would publish them again.

   So `withdrawn` is permanent and the detector may not overturn it. It is not
   deletion: the dossier, its sources and its score all remain, and
   `withdrawn_why` records who decided and on what grounds. Restoring one is a
   person editing the file back, which is the correct amount of friction for
   undoing a human judgement. */
export function publishStateFor({ existing, publishableNow }) {
  if (existing?.publish_state === 'withdrawn') return 'withdrawn';
  if (existing?.publish_state === 'published') return 'published';
  return publishableNow ? 'published' : 'draft';
}

/* ── THE DOSSIER'S IDENTITY, AND WHY IT IS NOT THE HAZARD WORD ────────────
   ONE DEFINITION OF slugify, SHARED. It was a private const in
   detect-climate-events.mjs, which was fine while that script was the only
   thing that minted a slug. dossierSlug() below has to mint the same string,
   and two copies of this expression are two chances for a filename and the
   lookup that finds it again to disagree — which is precisely the bug this
   block exists to close. */
export const slugify = (s) => String(s ?? '').toLowerCase()
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);

/* ★ THE FORK THIS EXISTS TO PREVENT, MEASURED ON THE LIVE SITE.
   cluster() in detect-climate-events.mjs keys on the REGION alone, and its own
   comment says why: one Himalayan disaster produces flood, glof and landslide
   headlines from three districts at once, and keyed on (hazard, place) that
   became six clusters each holding a sixth of the corroboration. But the
   dossier's on-disk identity was still `slugify(place-hazard)`, and `hazard`
   is the winning hazard word for THIS RUN's headlines — a value that moves as
   press framing shifts, which is a legitimate thing for it to do.

   On 11 September 2026 it moved. "Glacial lake outburst flood" faded out of
   the Nepal coverage and "flood" took over, so the lookup for the prior
   dossier asked for `nepal-flood`, missed `nepal-glof` entirely, `prior` came
   back undefined and a second dossier was minted for the same disaster: same
   region, same source register down to the individual articles, the same score
   of 22. The fork carried the current toll (1,377) and the original kept the
   homepage, because heroRank() breaks a score tie on HAZARD_WEIGHT and glof
   (6) outranks flood (2). So the stale half led the front of the site while
   the live half sat at a second URL — and every editor-set field existed only
   on the stale one: the mechanism, the Rasuwa coordinates, the downstream
   chain to the Gandak, three IFRC/UNICEF figures, the owner's supplied
   imagery, all of it dated 28 August and reconstructible from nothing.

   It had already been paid for once. `bihar-landslide` was withdrawn by hand
   on 9 September — "Wrong hazard, and a duplicate ... the Bihar flood already
   has its own page" — which is this same defect, cleaned up downstream of it.

   ★ SO IDENTITY IS FIXED AT PUBLICATION, WHICH IS THE DOOR THAT IS ALREADY
   ONE-WAY. publishStateFor() above refuses to withdraw an address because a
   reader holding a link to it is lost. The same argument applies to the
   address itself: once a region has a published, still-live dossier, that
   dossier IS the region's event, and a later run writes into it whatever word
   the wires have settled on. The `hazard` FIELD still tracks the framing — it
   must, or the page renders against the wrong context pack — and the SLUG
   stops tracking it.

   ★ WHAT IT DELIBERATELY DOES NOT DO, in the order that matters:

     IT NEVER RENAMES A FILE. Rule 1 returns exactly what the old expression
     returned whenever that file exists and nobody has withdrawn it, so every
     dossier on disk keeps its slug and no published URL moves. Measured, not
     asserted: lib/active-situation.test.ts runs all 71 files in
     data/climate-events/active/ through this and not one resolves elsewhere.

     IT DOES NOT ADOPT A DRAFT. A draft has no URL, no sitemap entry and
     nothing citing it, so a second one costs a reader nothing. Adopting one
     would move a region's coverage into a file named `odisha-cyclone` and then
     publish a flood at that address the day it cleared the bar.

     IT DOES NOT ADOPT A WITHDRAWN DOSSIER — but it does refuse to let one
     CAPTURE a region. With `nepal-flood` withdrawn, Nepal's next run resolves
     to `nepal-glof` instead of writing into the tombstone, where the latch
     would hold it invisible while the live page froze. That is the other half
     of the same bug, and it is the half that would have bitten on the very
     next scheduled run after the withdrawal landed.

     AND IT DOES NOT UNDO A FORK THAT HAS ALREADY HAPPENED. While `nepal-flood`
     and `nepal-glof` are BOTH published, rule 1 still sends Nepal to
     `nepal-flood`, because that file exists and nobody has withdrawn it — this
     function stops the next fork, it does not adjudicate an existing pair.
     Choosing which of two published pages survives is an editorial judgement
     and belongs to a person; this is only arranged not to fight that decision
     once it is made.

     IT DOES NOT ADOPT AN EVENT THAT IS NO LONGER LIVE. isCurrent() is the
     bound, and it is the same fortnight the hero uses. Without it, November's
     Bihar flood would be written over August's archive page underneath
     August's editor fields — one page describing two disasters, which is worse
     than a fork, not better. A genuinely new event in an old region mints its
     own dossier, as it should.

   `onDisk` is every dossier already on disk, parsed. `now` is injectable for
   the tests and for nothing else. */
export function dossierSlug({ place, hazard }, onDisk = [], now = Date.now()) {
  const minted = slugify(`${place}-${hazard}`);
  const key = String(place ?? '').trim().toLowerCase();
  if (!key || !hazard) return minted;

  /* 1. THE ANSWER THE OLD EXPRESSION GAVE, whenever that file is there and a
        person has not taken it down. This is the clause that makes the change
        a no-op for every dossier already committed. */
  if (onDisk.some((e) => e?.slug === minted && e.publish_state !== 'withdrawn')) return minted;

  /* 2. THE REGION'S LIVE PUBLISHED DOSSIER, if it has one. */
  const live = onDisk.filter((e) => e?.slug
    && e.publish_state === 'published'
    && e.last_updated?.epochMs
    && String(e.location?.text ?? '').trim().toLowerCase() === key
    && isCurrent(e, now));
  if (!live.length) return minted;

  /* The oldest detection wins: that is the dossier holding the history and any
     editor's work, which is the thing a fork strands. The slug comparison is a
     tie-break only, so the answer cannot depend on readdir order. */
  return live.slice().sort((a, b) => (
    (a.first_detected?.epochMs ?? Infinity) - (b.first_detected?.epochMs ?? Infinity)
    || (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0)
  ))[0].slug;
}

/* ── WHAT A RE-DETECTION MAY NOT EAT ──────────────────────────────────────
   ★ THE DIVISION, AND WHY IT IS NOW ARITHMETIC INSTEAD OF A LIST.
   dossier() in detect-climate-events.mjs rebuilds each event from a fixed key
   set, so any field it does not name is dropped on the next scheduled run.
   The detector owns the EVIDENCE — the score, the corroboration counts, the
   source register, the timestamps, all of which it exists to keep current. A
   person owns the JUDGEMENT: the lifecycle, a precise place the feeds do not
   carry, a cause raised to confirmed once fieldwork lands, the reason a page
   was taken down.

   THIS USED TO BE A HAND-WRITTEN ALLOWLIST OF THE SECOND SET, AND IT WAS
   FORGOTTEN FOUR TIMES OUT OF FOUR. `situation_status` (an editor demoting an
   event off the homepage, reverted by the next tick), `hero_days`,
   `cause_status` — each lost silently. Then `withdrawn_why`, which did not
   fail silently: publishStateFor() above latches `withdrawn` deliberately,
   validateEvent() requires the reason whenever it is latched, and the
   rebuilt-without-a-reason dossier was refused inside the page build — which
   runs before the commit, so the failing run published nothing, the reason
   survived untouched on main, and the next run read it back and destroyed it
   again. Eleven consecutive red runs, and the failure was what prevented the
   repair landing.

   The allowlist was never information. Measured across all 65 dossiers:
   dossier() emits 28 top-level keys, the list named 17, the files carry 42 —
   disjoint, and together complete. It was the arithmetic complement of what
   the detector emits, maintained by hand.

   So it is computed. The detector owns exactly the keys the run produced;
   every other key on the previous file survives. A new human-set field is
   preserved by default, and there is no list to keep in step.

   ★ THE KEYS OF `next`, NEVER ITS VALUES. `faded_since` and `published_on`
   are emitted as keys whose value is `undefined` when they do not apply, and
   for both the ABSENCE is the signal — a fade that clears the moment coverage
   returns, a minting record a draft has not earned. Object.keys() counts
   them, so they stay detector-owned and keep being cleared. Testing values
   for undefined, or comparing against a JSON round-trip (which drops
   undefined keys), would resurrect a stale fade from the previous file and
   quietly demote a live event.

   ★ AND IT IS NOT A SPREAD OF `existing` OVER `next`. It only fills keys the
   run did not produce, so the evidence fields are still wholly the
   detector's. The one thing it does that a list did not: a field REMOVED from
   dossier() in some future change would start being carried forward out of
   old files. That is visible in the dossier the next run writes, and the
   remedy is to delete it from the files — a great deal cheaper than a
   silently reverted human decision. */
export function keepEditorFields(next, existing) {
  if (!existing) return next;
  const producedThisRun = new Set(Object.keys(next));
  for (const [k, v] of Object.entries(existing)) {
    if (!producedThisRun.has(k)) next[k] = v;
  }
  return next;
}

/** The status word for an event, and where it came from. Never throws on a
 *  missing field; throws on a status word this module does not know, because a
 *  typo silently downgrading a live disaster to nothing is the failure this
 *  whole module is arranged to prevent. */
export function statusOf(e, now = Date.now()) {
  const set = e?.situation_status;
  if (set) {
    if (!SITUATION_STATUS[set]) {
      throw new Error(
        `active-situation: "${set}" is not a status. One of: ${STATUSES.join(', ')}. `
        + `Set situation_status on data/climate-events/active/${e.slug}.json, or remove it `
        + 'and let the age-derived status stand.',
      );
    }
    return { status: set, ...SITUATION_STATUS[set], source: 'admin', why: e.situation_status_why || null };
  }
  /* An unpublished dossier has no public standing of any kind. It is not
     "archived" — it was never shown — but for every consumer here the answer
     is the same: nothing on the homepage, no pill. */
  if (e?.publish_state !== 'published') {
    return { status: 'archived', ...SITUATION_STATUS.archived, source: 'unpublished', why: null };
  }
  /* ★ COVERAGE THAT HAS GONE IS NOT A DEVELOPING SITUATION, WHATEVER THE
     CLOCK SAYS. The ladder below reads `last_updated`, which now means "the
     freshest reporting we have" — honest, but it cannot tell one outlet from
     a hundred. An event carried by a single publisher yesterday is recent and
     is not being tracked. `faded_since` is the volume signal, and the grace
     period above is what makes it safe to act on. */
  const faded = e?.faded_since?.epochMs;
  if (faded && now - faded >= FADE_GRACE_HOURS * 3600000) {
    return { status: 'demoted', ...SITUATION_STATUS.demoted, source: 'derived', why: null };
  }

  const ageDays = (now - (e.last_updated?.epochMs ?? 0)) / DAY;
  for (const [days, status] of DERIVED) {
    if (ageDays <= days) {
      return { status, ...SITUATION_STATUS[status], source: 'derived', why: null };
    }
  }
  return { status: 'demoted', ...SITUATION_STATUS.demoted, source: 'derived', why: null };
}

/** Is this event allowed to hold the front of the site at all? */
export const inRotation = (e, now = Date.now()) => statusOf(e, now).hero > 0;

/** Is it entitled to be the FIRST thing a homepage visitor sees? */
export const isPrimary = (e, now = Date.now()) => statusOf(e, now).hero >= 2;

/* ── THE HOMEPAGE'S ANSWER, IN ONE CALL ───────────────────────────────────
   ★ THE SLOT, NOT THE EVENT, IS WHAT THE HOMEPAGE NEEDS.
   build-hero.mjs has to decide three things and they must not be able to
   disagree: whether the situation slide exists, whether it comes before Air,
   and what goes in it. So one function answers all three.

     slot 'primary'   the slide is first. Air moves to second.
     slot 'rotation'  the slide is present but after Air.
     slot null        no slide. The deck is the four it has always been, and
                      Air is first with no special casing anywhere.

   Ranked with heroRank() from lib/climate-events.mjs rather than a second
   scale, so the event that leads the homepage is by construction the same one
   /now/climate-event's banner leads on. Two events at once is not
   hypothetical — the detector currently holds twenty-three. */
export function homepageSlot(events = loadEvents(), now = Date.now()) {
  const eligible = events
    .filter((e) => isCurrent(e, now) && inRotation(e, now))
    .map((e) => ({ e, st: statusOf(e, now), r: heroRank(e, now) }))
    .sort((a, b) => b.st.hero - a.st.hero || b.r.total - a.r.total
      || b.e.last_updated.epochMs - a.e.last_updated.epochMs);
  if (!eligible.length) return { slot: null, event: null, status: null };
  const top = eligible[0];
  return {
    slot: top.st.hero >= 2 ? 'primary' : 'rotation',
    event: top.e,
    status: top.st,
    rank: top.r,
    contenders: eligible.length,
  };
}

/** The page's own route. One place, so a CTA cannot point at the section index
 *  the way the homepage ticker's did until this pass. */
export const situationHref = (e) => `/now/climate-event/${e.slug}`;

/* ── THE ADMIN SURFACE, WHICH IS A JSON FIELD AND A PRINTED SENTENCE ──────
   There is no CMS on this route and adding one for five words would be the
   wrong shape: these pages are built by a cron job from a git-committed
   dossier, so the durable, reviewable, revertible place for an editorial
   decision is the dossier. This prints the exact edit, so the instruction in
   the console is the instruction a person can follow.

   Printed by build-climate-disaster-pages.mjs on every run — the operator sees
   the five moves available on every event, every time, rather than having to
   find this file. */
export function adminHelp(e, now = Date.now()) {
  const st = statusOf(e, now);
  const file = `data/climate-events/active/${e.slug}.json`;
  const moves = STATUSES
    .filter((s) => s !== st.status)
    .map((s) => `      "situation_status": "${s}"`.padEnd(46) + ` -> ${SITUATION_STATUS[s].label}`
      + (SITUATION_STATUS[s].hero >= 2 ? ', first on the homepage'
        : SITUATION_STATUS[s].hero === 1 ? ', in the homepage rotation'
          : ', off the homepage; the page stays'));
  return [
    `    ${e.slug}: ${st.label.toUpperCase()} (${st.source})`,
    `      edit ${file} to change it:`,
    ...moves,
  ].join('\n');
}
