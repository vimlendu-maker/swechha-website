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
    line: 'Being tracked now. Figures move while you are on this page.',
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
    line: 'No longer a developing situation. This page is kept as the record.',
  },
  archived: {
    rank: 0, hero: 0, label: 'Archived', pill: null, dot: '○',
    line: 'Archived. Kept at this address so anything that cited it still resolves.',
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
