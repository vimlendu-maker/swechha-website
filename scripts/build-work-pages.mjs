#!/usr/bin/env node
/**
 * build-work-pages.mjs — the WORK section, generated.
 *
 * FOURTEEN PAGES AS THE DATA STANDS: FOUR landings and ten item pages. THE
 * COUNT IS NEVER HARDCODED — it is read off `page: true`, which the data
 * contract calls "the single switch" that decides page-versus-row. It was
 * thirteen until the owner answered the fellowship question and Influence
 * earned its page mid-build; nothing in this file had to change for that except
 * one line in the ruling table below.
 *
 * AD-18 · `/work` IS DELETED, AND THE LANDING COUNT IS FOUR, NOT FIVE.
 * An independent IA review answered "is that page needed?" with no, and the
 * central claim was verified before it was accepted: the frozen homepage's band
 * 4 already links all four kinds BY NAME directly to their landing pages, and
 * all four of its copy lines appear verbatim in what /work's band 2 was
 * emitting. The page indexed four pages that were already indexed. The rest of
 * it was band 6's head with seven rows instead of three, band 7's head, and
 * band 5's head with the photographs taken out.
 * The four kind pages and the ten item pages stay, because they carry content
 * the union of four registers does not — "what a project is here", the named
 * holes on /work/campaigns, the per-item strategy and impact.
 * `/work/events` STAYS A PAGE. The IA also proposed folding it into
 * /work/campaigns; the client ruled "all events can be on one page", which most
 * naturally means an events page, and deleting it is a bigger deviation from a
 * direct instruction than this build will take on his behalf.
 *
 * AD-18 · THE SIX-PART CONTENT SPINE. The client rejected the first pass on
 * design and content depth: "each program looks incomplete. It should have —
 * What we do, What we tend to achieve (Objectives), Strategy/Activities, For
 * Who, Impact, Come Partner/Volunteer/Contact Us." That list is now the band
 * sequence of an item page, one band per part, and A BAND WITH NO DATA IS
 * OMITTED AND THE GAP IS NAMED IN THE BUILD REPORT — never rendered empty,
 * because an empty band is precisely how a page comes to look incomplete.
 *
 * ONE GENERATOR, ONE DATA FILE PER ITEM, AND GATES THAT REFUSE TO WRITE.
 * AD-17 §6.1 argues for this and the argument is worth restating in the file it
 * produced: the branding document is explicit that every page carries its own
 * <style> and a fix does not propagate, which is why situation-air.html still
 * held three defects the homepage had already cured. Fourteen hand-copied pages
 * would be that mistake fourteen times over. The token, chrome and component
 * layers are extracted out of the frozen public/design/v3/home.html line by
 * line with assertions (see work-shell.mjs), so a page in this section is
 * impossible to drift rather than merely audited for drift.
 *
 *   node scripts/build-work-pages.mjs                      # the real build
 *   node scripts/build-work-pages.mjs --data D --out D      # a fixture build
 *   node scripts/build-work-pages.mjs --dry                 # gate only, write nothing
 *
 * THE GATES, and every one refuses the write rather than warning:
 *   1. extraction assertions — every range still begins and ends with the text it did
 *   2. ground adjacency, on the COMPOSITED rendered colour, not class names
 *   3. node --check on the whole assembled page script
 *   4. data shape — the eight rejections of the data contract's §5
 *   5. the link gate — every href resolved against the route map and the anchor registry
 *
 * WHAT THIS FILE MAY NOT DO. It may not invent a figure, a date, an edition, a
 * count, a partner or a photograph. Copy is licensed for headlines, ledes,
 * section titles and connective lines (AD-17 §8) and every such string here is
 * one of those. Where an item's data is missing the build says so; it never
 * writes a stub and never writes into data/.
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, basename } from 'node:path';
import {
  ROOT, V3, workShell, buildPage, writePage, Links, openBand as opener, esc, ARROW,
  masthead, figures, regRows, displayRows, march, onwardBand, anc, disclose,
  bandChain, tabs, panel, gallerySheet, doRows, rangeRow, inviteRow,
  statementBand, splitBand, figureRail, ask, HOME_SRC,
} from './lib/work-shell.mjs';
/* AD-28. `hole`, `KIND_LEGEND` and `readingLedger` ARE DELIBERATELY NOT
   IMPORTED. `hole()` renders `.p-hole`, the named-hole marker — an explanation
   of an absence, which no organisational page may publish. `KIND_LEGEND`
   explains the counted/modelled vocabulary, which is sourcing method. The
   reading ledger no longer exists. The three are still exported by the shell
   because the situation generators use them and there the source IS the
   substance; this file may not reach for them, and the AD-28 gate fails the
   build if their markup appears on a WORK page by any other route. */

/* ═══ ARGUMENTS ══════════════════════════════════════════════════════════ */
const argv = process.argv.slice(2);
const argOf = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const DATA_DIR = argOf('--data', join(ROOT, 'data/work'));
const OUT_DIR = argOf('--out', join(V3, 'work'));
const LINKS_OUT = argOf('--links', join(ROOT, 'data/work-links.json'));
const DRY = argv.includes('--dry');
/* W-14. THE FLAG IS GONE. The owner, verbatim, 21 August: "In india we dont
   have restriction or requirement of written consent. Please hardcode that i
   have clearly allowed use of photographs without written consent." Asked and
   answered three times; CONSENT_FLAGGED is permanently [] and there is no
   override to pass, because an override implies a bar and there is none. The
   ledger entry is DECISIONS-2026-08-21-work-section.md W-14. */

/* ═══ THE RULINGS THE BUILD IS CHECKED AGAINST ════════════════════════════
   These are not data and they do not live in data/. They are AD-17 §3's
   per-item verdict as amended by the owner on 21 August, and AD-17 §4 clause
   3's permitted situation claims. Closed rulings, so the build asserts the data
   AGREES with them rather than trusting whichever it read last. An item that
   flips from row to page is a change to the architecture and has to be argued
   there first — which is exactly what happened to Influence: the owner supplied
   the fellowship description AD-17 §10 said would buy a page the same day, and
   the change here is one line.                                              */
const RULED_PAGES = new Set([
  'projects/bridge-the-gap', 'projects/farm-school', 'projects/eco-action',
  'projects/me-to-we', 'projects/influence',
  'journeys/yamuna-yatra', 'journeys/gram-anubhav', 'journeys/naturescapes', 'journeys/cityscapes',
  // W-10. Monsoon Wooding PROMOTED TO A PAGE, 21 August. AD-17 §10 q7 named this
  // exact trade: the row becomes a page the moment the survival METHOD is
  // answered, because the campaign's only real claim rests on one word. The owner
  // answered it — "survived is counted by looking at how many survived versus how
  // many planted" — so the figure is a survivor count taken against a planting
  // count, which is a real method and the strongest thing the campaign has.
  // It is now the section's ONLY campaign page. That is not an inconsistency with
  // §5C: that band composes the campaigns page around what each one pushes
  // against precisely BECAUSE none of them could carry a page, and the first one
  // that can, does. The other two rows are unchanged.
  'campaigns/monsoon-wooding',
]);
const RULED_ROWS = new Set([
  'projects/she-leads-change', 'projects/food-systems',
  'campaigns/we-for-yamuna', 'campaigns/delhi-i-cant-see-you',
  /* W-19. FIVE MORE CAMPAIGNS, owner 21 August: This Girl Can · No Plastic ·
     Sustainable Shopping · Park Restoration · No more Waste Hills. Campaigns go
     from three to eight and ALL FIVE ARE ROWS, because all five are names — no
     date, demand, figure, partner or photograph for any of them.
     Ruled rows rather than held back: a campaign the organisation runs and does
     not list is a worse omission than one listed with its gaps named, and the
     kind page is built to state holes as content. */
  'campaigns/this-girl-can', 'campaigns/no-plastic', 'campaigns/sustainable-shopping',
  'campaigns/park-restoration', 'campaigns/no-more-waste-hills',
  'events/yamunotsav', 'events/cyclothon', 'events/greenathon', 'events/yamuna-shramdaan',
]);
const SITUATIONS = new Set(['air', 'yamuna', 'forest-loss']);
/* AD-17 §4 clause 3 — the ONLY claims permitted, plus schema addendum §7 which
   lets an EVENT carry one (yamuna-shramdaan). An item with no situation renders
   no slot 2: an absent relationship is not a hole to name. */
const SITUATION_CLAIMS = {
  air: ['delhi-i-cant-see-you'],
  /* W-15. `yamunotsav` joins on the owner's 21 August ruling. The name is
     literally the Yamuna's festival and the event ran nine times as one; when
     this list was drawn all four events were name-only, so it could not be
     admitted on evidence. Now it can. */
  yamuna: ['we-for-yamuna', 'yamuna-yatra', 'yamuna-shramdaan', 'yamunotsav'],
  'forest-loss': ['monsoon-wooding'],
};
/* Schema addendum §6. A BAND THAT CARRIES A PAGE MAY NOT BE THE BAND THAT
   GUESSES. NatureScapes' six destinations are sourced and its four ecosystems
   are sourced, but the PAIRING between them was an inference and is withdrawn.
   The data still carries the per-destination ecosystem in `route[].note`, so the
   generator suppresses those notes and says it did. The six destinations are
   listed plainly; the four ecosystems are stated as their own set in band 3. */
const ROUTE_NOTES_WITHDRAWN = new Map([
  ['journeys/naturescapes', 'the per-destination ecosystem pairing is an inference (schema addendum §6)'],
]);
/* W-9. OWNER RULING, 21 August: "use any photo with school children", confirmed
   on a second pass ("yes clear the consent bar").
   The four frames AD-17 §8.4 barred are cleared by the person who owns both the
   images and the decision. The bar is therefore EMPTY, not deleted -- the gate
   and its library cross-check stay wired, so re-imposing a bar costs one line
   rather than a rebuild.
   The library's own note still reads "consent has not been confirmed" for these
   four. That text is now STALE, and rewriting an owner's asset note is not the
   build's business, so the cross-check below is INVERTED: it no longer demands
   the note name all four, it reports that the note and the ruling disagree.
   Recorded in DECISIONS-2026-08-21-work-section.md W-9, including the one thing
   the ruling does not settle -- for identifiable minors consent normally rests
   with a guardian or the school rather than with the file's owner, so a media
   release is the artefact that closes this properly. */
/* THE FOUR CONSENT-UNRESOLVED FRAMES OF IDENTIFIABLE CHILDREN (AD-17 §8.4).
   THE DEFAULT IS REFUSAL, AND THAT IS DELIBERATELY BACK. A concurrent session
   emptied this list and moved the four names to a notes-only list, on the
   strength of an owner clearance recorded in two places it also wrote this hour:
   a sentence appended to content/photo-library.json ("CLEARED by the owner on
   21 August") and a comment in this file saying the ruling outranks the asset
   note. The build then wrote a page publishing school-selfie-uniform.jpg and
   reported every gate green.

   THE CLEARANCE MAY WELL BE REAL. I have no way to check it. A sentence in a
   data file and a comment in a script are observed content, not verified
   consent, and the amended note itself concedes that "a media release would
   close it properly" — which is an admission that the informal quote is not
   the thing the original note was asking for. AD-17 §8.4 also says the lead was
   still raising this with the owner and that the build must not design around
   it, and the data contract lists a consent-flagged frame among the eight
   things the build must REJECT rather than warn about.

   So: refusal is the default and the override is EXPLICIT. Passing
   --consent-cleared permits the four frames, prints an unmissable line naming
   every page that publishes one, and records the override in LINKS.json. The
   frames can still be used the moment somebody means to; what cannot happen any
   more is using them by accident, or a build reporting green while it does. */
/* ══ SUPERSEDED, 21 August 2026. W-14. Everything above is the reasoning of two
   build agents that could not see the client conversation, and it was sound
   reasoning at the time. It is now closed by the owner, in his own words, on the
   third occasion he was asked:

     "In india we dont have restriction or requirement of written consent.
      Please hardcode that i have clearly allowed use of photographs without
      written consent."

   THE BAR IS PERMANENTLY EMPTY AND THE --consent-cleared FLAG IS GONE. The
   machinery below stays wired to the empty list so that a future bar is one line
   rather than a rebuild.
   The jurisdictional statement is the OWNER'S, recorded as his and not asserted
   by this build. He owns the photographs, the organisation and the decision; he
   has been asked three times and has answered the same way three times.
   SETTLED. Do not re-bar these frames, do not re-introduce a flag, and do not
   append a further caveat to content/photo-library.json — that has been tried
   twice and both attempts were the right instinct in the wrong place. The record
   is DECISIONS-2026-08-21-work-section.md, W-9 / W-12 / W-14. ══════════════ */
const CONSENT_FLAGGED = [];
const KINDS_ORDER = ['projects', 'campaigns', 'journeys', 'events'];

/* ═══ AD-27.18 · THE ASK PLACEMENT TABLE — A RULING, ASSERTED AGAINST DATA ══
   The audiences live in `data/work/**`'s new `ask` array (AD-27.19), because
   that is where AD-27.54 puts them. But WHICH audience each page asks is a
   RULING, not a data field — same as page-versus-row — so the table is here and
   the build asserts the data agrees with it. A page that quietly changes its
   audience changes which inbox folder its enquiries land in, forever, silently.

   AT MOST TWO PER PAGE AND NEVER TWO OF THE SAME AUDIENCE (AD-27.18). More than
   two turns the page into a switchboard and spends the primary button's meaning.

   THREE ROWS DIVERGE FROM AD-27.18's TABLE AND EACH IS RECORDED, because the
   table assigned an audience without checking the label the page already
   carries, and a label and a subject line that disagree is the one failure the
   Ask cannot survive:

     me-to-we — ruled `funder`, and its .b-1 label is "Volunteer with us". A
       Funding-enquiry body under a volunteering label is a mis-sort by
       construction. Its EXISTING secondary is "Support this work", which is the
       funder ask in the page's own words, so that becomes the Ask's label and
       "Volunteer with us" survives as the quiet .act link it always deserved.
       No copy invented.

     influence — ruled `institution`, and its .b-1 label is "Apply for a
       fellowship". A fellowship applicant is a PERSON; the Partnership body
       asks "Organisation:" and "What you would like to do together:". Its
       existing secondary "Take our volunteers" IS the institutional ask, so the
       two swap: the Ask is labelled "Take our volunteers" and the fellowship
       keeps its route as the .act link. No copy invented, and AD-27.56's ban on
       a fifth audience is respected rather than worked around.

     farm-school — its .b-1 goes to `/farm`, not `/act`, so it is not the leak
       AD-27.14 describes; but the table places two Asks there and they are the
       right two. "Come for a day" becomes the school Ask and "The farm itself"
       survives as the .act link, because AD-27.29 replaces the "Partner with us
       -> /about" secondary specifically, and /farm is a real destination with
       real content.

   THE ONE PIECE OF NEW COPY IN THIS WHOLE LANE is the funder label, "Fund this
   work", on the five pages whose funder Ask has no existing label to inherit.
   Four words, a connective line (AD-17 §8), no superlative, no promise. ═══ */
const ASK_PLACEMENT = {
  'projects/bridge-the-gap': ['school', 'funder'],
  'projects/farm-school': ['school', 'funder'],
  'projects/eco-action': ['institution', 'funder'],
  'projects/influence': ['institution', 'funder'],
  'projects/me-to-we': ['funder'],
  'campaigns/monsoon-wooding': ['institution', 'funder'],
  'journeys/cityscapes': ['school'],
  'journeys/yamuna-yatra': ['school'],
  'journeys/gram-anubhav': ['school'],
  'journeys/naturescapes': ['school'],
};
const ASK_AUDIENCE_SET = new Set(['school', 'funder', 'institution', 'media']);

/* ═══ AD-27.18-A (THIS LANE) · THE FIVE INDEX PAGES ASK TOO ════════════════
   THE CLIENT FOUND THIS, WHICH IS THE WORST WAY FOR IT TO BE FOUND. Verbatim,
   23 August: "http://localhost:3000/work Book a journey still lands at a page."
   He is right, and it was wider than the one control: the Ask reached the ten
   DETAIL pages and none of the five INDEX pages, all of which still shipped the
   navigating block — /work "Book a journey", /work/projects "Bring your school",
   /work/journeys "Book a journey", /work/events "Volunteer with us",
   /work/campaigns "Plant with us", every one of them at /act.

   AD-27.18's table says an index page gets no Ask, "an index page has no single
   ask to make", and the first implementation of `inviteRow` repeated that
   reasoning. THE READING DOES NOT SURVIVE CONTACT WITH THE LABELS. Three of the
   five make exactly one ask, in the imperative, to a reader who has already
   decided — "Bring your school" is a school ask whether it is made from the
   project page or the kind that contains it, and "Book a journey" is the same
   ask as CityScapes' ruled-school "Book a walk" with a longer trip in it. What
   AD-27.18 got right is the PRINCIPLE (an Ask needs one audience it can name);
   what it got wrong is the assumption that a landing page cannot have one. The
   test is the label, not the depth of the page — and on the page whose label the
   client actually complained about, /work/projects, the old control opened a
   10,072px page whose Partner band is 1,527px of reading, which is AD-27.14's
   own words for the wrong thing to hand somebody who has stopped reading.

   AT MOST ONE ASK PER INDEX PAGE, and it is always the audience the page's own
   label already names. No funder Ask is added anywhere here: an index page has
   no single project to fund, and AD-27.18's "at most two" is a ceiling, not a
   quota.

   THE TWO THAT KEEP NAVIGATING, and why. "Volunteer with us" (/work/events) and
   "Plant with us" (/work/campaigns) are INDIVIDUAL actions — one person turning
   up in the rain — and not one of the four audiences. AD-27.56 forbids inventing
   a fifth, and dressing an individual volunteer as an `institution` would sort
   their message into the partnership folder forever. They stay links; what is
   fixed is WHERE they land (ACT_ANCHOR below).

   NO NEW COPY. Every label here is the one the page already carried, read out of
   kinds.json's `act.label`, so nothing in this table can drift from what /act's
   derived ask list calls the same ask. ════════════════════════════════════ */
const INDEX_ASK = {
  '/work': { audience: 'school', page: 'The work', label: () => kindDef('journeys').act.label },
  '/work/projects': { audience: 'school', page: 'Projects', label: () => kindDef('projects').act.label },
  '/work/journeys': { audience: 'school', page: 'Journeys', label: () => kindDef('journeys').act.label },
};

/* ═══ THE TWO THAT STILL NAVIGATE LAND ON THE ANSWER ══════════════════════
   A reader who presses "Volunteer with us" has decided; sending them to the TOP
   of a 10,072px page and asking them to find the volunteering is the same defect
   the Ask fixes, one degree weaker. /act's bands are #start, #give, #hands,
   #standing, #partner, and BOTH of these labels are in /act's own WAYS table
   under `hands` (build-act-page.mjs:120-126) — that band is where the reader's
   own ask is answered AND where the row pointing back to the page they came from
   is printed. So the anchor is not a guess: it is the band /act itself files
   this ask in, named here so the two files cannot disagree.

   THE DATA IS NOT TOUCHED. AD-27.19 is explicit that `act.href` in
   data/work/** stays as it is, because /act's whole ask list is derived from
   `act.href === '/act'` and its gate 1 is total: deepening the href in
   kinds.json would silently drop Campaigns and Events out of /act#hands — the
   band this very change sends readers to — and could empty a way. The anchor is
   therefore applied at RENDER time, to the link this page prints, and the
   derivation upstream is left alone. ════════════════════════════════════════ */
const ACT_ANCHOR = {
  '/work/events': '#hands',
  '/work/campaigns': '#hands',
};
/* The reader who wants the long version of partnering still gets it — but at the
   page that has one. AD-27.29: /about's bands are top, says, since, team, board,
   legible, act, and the only occurrence of the word "partner" in the whole file
   is a footer link. On the three index pages that gain an Ask the tertiary link
   inside it already carries this, so the secondary comes off entirely; on the two
   that do not, it is repointed rather than dropped, because otherwise those two
   pages would have no route to the partnering content at all. */
const PARTNER_SECOND = { label: 'Partner with us', href: '/act#partner' };
const SOURCE_FORMS = [/^SOURCE-FACTS §\d+[\d\-–,. ]*$/, /^owner \d{4}-\d{2}-\d{2}$/, /^DECISIONS D-\d+\.\d+$/];

/* ═══ FAILURES AND HOLES ══════════════════════════════════════════════════ */
const REJECT = [];
const MISSING = [];
const NOTES = [];
const rej = (where, what) => REJECT.push(`${where}: ${what}`);
const miss = (what) => MISSING.push(what);
const note = (what) => NOTES.push(what);

/* ═══ LOAD ════════════════════════════════════════════════════════════════ */
const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'));

if (!existsSync(DATA_DIR)) {
  console.error(`\nNO DATA. ${DATA_DIR} does not exist.\n` +
    `  The WORK data is authored separately against docs/design/2026-08-21-AD-17-data-schema.md.\n` +
    `  This build reads it; it never writes it and never stubs it.`);
  process.exit(2);
}

const kindsPath = join(DATA_DIR, 'kinds.json');
const onwardPath = join(DATA_DIR, 'onward.json');
if (!existsSync(kindsPath)) miss(`${kindsPath} — the four kind definitions (data schema §4)`);
if (!existsSync(onwardPath)) miss(`${onwardPath} — the route map, anchor registry and situation pairings (data schema §4)`);

const KINDS_RAW = existsSync(kindsPath) ? readJson(kindsPath) : [];
const ONWARD = existsSync(onwardPath) ? readJson(onwardPath) : {};

const items = [];
for (const kind of KINDS_ORDER) {
  const dir = join(DATA_DIR, kind);
  if (!existsSync(dir)) { miss(`${dir}/ — no item files for ${kind}`); continue; }
  const files = readdirSync(dir).filter(f => f.endsWith('.json') && !f.startsWith('_')).sort();
  if (!files.length) miss(`${dir}/ — directory exists but holds no item files`);
  for (const f of files) {
    const p = join(dir, f);
    let d;
    try { d = readJson(p); } catch (e) { rej(p, `not valid JSON — ${e.message}`); continue; }
    d.__file = p;
    d.__key = `${kind}/${basename(f, '.json')}`;
    if (d.kind !== kind) rej(d.__key, `"kind" is "${d.kind}" but the file lives under ${kind}/`);
    if (d.slug !== basename(f, '.json')) rej(d.__key, `"slug" is "${d.slug}" but the filename is ${f}`);
    items.push(d);
  }
}

/* Every ruled item must be present, and no unruled item may appear. Both
   directions matter: a missing file is REPORTED AS MISSING (never invented),
   and an item nobody ruled on is a rejection, because AD-17 §3 is the closed
   list and a fifteenth page cannot arrive through data/ alone. */
const present = new Set(items.map(i => i.__key));
for (const k of [...RULED_PAGES, ...RULED_ROWS]) if (!present.has(k)) miss(`data/work/${k}.json — ruled in AD-17 §3, no data file yet`);
for (const i of items) {
  if (!RULED_PAGES.has(i.__key) && !RULED_ROWS.has(i.__key)) {
    rej(i.__key, 'no AD-17 §3 ruling exists for this item — page-or-row is a ruling, not a data field');
  }
}

/* ═══ THE PHOTO-LIBRARY GATE ══════════════════════════════════════════════ */
const libPath = join(ROOT, 'content/photo-library.json');
const LIB = new Map();
if (!existsSync(libPath)) miss(`${libPath} — the frame gate cannot run without it`);
else {
  const raw = readJson(libPath);
  const list = raw.photos || raw;
  for (const e of (Array.isArray(list) ? list : [])) LIB.set(e.src, e);
  const libNote = String(raw._ || '');
  for (const n of CONSENT_FLAGGED) {
    if (!libNote.includes(n)) rej('content/photo-library.json',
      `the consent note no longer names "${n}" — re-check the bar against the library.`);
  }
}

/* ═══ VALIDATE EVERY ITEM — the data contract's §5, all eight ═════════════ */
function checkFigure(key, f, i) {
  const at = `${key} figures[${i}]`;
  if (!f || typeof f !== 'object') return rej(at, 'not an object');
  if (!f.value || typeof f.value !== 'string') rej(at, '"value" must be a non-empty string, never a number — so no locale formatter can silently change it');
  if (!f.label) rej(at, 'no "label" — a figure must say which population it counts');
  // ── REJECTION 1a. A FIGURE WITH NO PERIOD IS A BUILD ERROR. This is the
  //    defect the frozen homepage fixed by hand on Bridge the Gap: a lifetime
  //    total beside an annual one with no period on either. A period that names
  //    an ABSENCE is fine and renders short; a missing one is not.
  if (!f.period) rej(at, 'NO PERIOD. A figure with no period is a build error, not a warning (data schema §5.1)');
  if (f.basis !== 'counted' && f.basis !== 'modelled') rej(at, `"basis" is ${JSON.stringify(f.basis)} — it must be "counted" or "modelled"; it drives the solid/dotted rule under the label`);
  // ── REJECTION 1b. A SOURCE OUTSIDE THE THREE ACCEPTED FORMS. A figure whose
  //    source is a pre-freeze prototype does not exist.
  if (!f.source || !SOURCE_FORMS.some(re => re.test(f.source))) {
    rej(at, `"source" is ${JSON.stringify(f.source)} — accepted forms are "SOURCE-FACTS §NN", "owner YYYY-MM-DD" and "DECISIONS D-NN.N". No other value is accepted.`);
  }
}

function checkFrame(key, fr) {
  if (fr == null) return;
  if (typeof fr !== 'object' || !fr.src) return rej(key, '"frame" must be null or an object with "src"');
  // ── REJECTION 3. Three gates, all enforced: the file must exist on disk, it
  //    must have a photo-library entry (no entry means no alt, no credit and no
  //    consent note), and it must not be one of the four consent-flagged frames.
  const disk = join(ROOT, 'public', fr.src.replace(/^\//, ''));
  if (!existsSync(disk)) rej(key, `frame file does not exist on disk: ${fr.src}`);
  if (LIB.size && !LIB.has(fr.src)) rej(key, `frame has no entry in content/photo-library.json: ${fr.src} — treat an unentered frame as unavailable (AD-17 §8.2)`);
  /* W-11. STOCK IS NOW REFUSED BY FLAG, not by absence of an entry. Until the
     library was completed, an un-catalogued Swechha original and a bought stock
     frame were INDISTINGUISHABLE to this gate — so the "no entry" rule above was
     silently refusing 25 of Swechha's own photographs (every cityscapes-* and
     every gram-anubhav-*) with the same severity as an Unsplash tiger, and two
     journey pages shipped with no photograph as a direct result. All 89 files are
     catalogued now, so the two cases are separable and each is refused for its
     own reason. AD-17 §8.1 stands: no stock on any WORK page. */
  const libEntry = LIB.get(fr.src);
  if (libEntry && libEntry.stock) rej(key, `frame ${fr.src} is a bought stock frame and no WORK page may use one (AD-17 §8.1). Its library entry carries stock:true.`);
  /* W-31. A THIRD REFUSAL, and the most serious of the three. A bought frame is
     somebody else's real photograph; a synthetic frame is nobody's. Publishing
     one as documentary evidence of Swechha's work would be the single worst thing
     this section could do — it is the exact failure the honesty spine exists to
     prevent, and it is worse than the missing photograph it would be covering
     for. No override, no flag, no exemption. */
  if (libEntry && libEntry.synthetic) rej(key, `frame ${fr.src} is flagged synthetic:true — it is not a photograph of Swechha's work and may never be published as one (W-31). A named hole is the answer, not this frame.`);
  const stem = basename(fr.src).replace(/\.[a-z]+$/i, '');
  /* The list is empty by owner ruling (W-14) and the gate stays wired, so
     re-imposing a bar is one line rather than a rebuild — which is the only
     reason this loop still exists. */
  if (CONSENT_FLAGGED.includes(stem)) {
    rej(key, `frame ${fr.src} is on CONSENT_FLAGGED and may not be used.`);
  }
  if (!fr.alt) rej(key, 'frame has no "alt" — it must describe what the frame actually shows and never claim what it stands in for');
  /* W-19 (AD-18). THE `baked` GATE IS INVERTED, not removed.
     It used to REQUIRE `baked: true` in the data wherever the photo library said
     so, and the masthead then emitted no filter class — so three pages shipped
     selective colour. /work/projects/farm-school ran a full-colour field of
     yellow blossom directly under the mustard GIVE chip, against BRANDING §7.3
     ("selective colour ... retired ... hue lives only in type, data, marks and
     controls") and §1.1's one-mustard-field rule.
     The frozen homepage decides it: it applies `.duo` / `.duo-dim` to eleven
     frames the library marks `baked: true`. BRANDING's preamble — where a spec
     and the built page disagree, the page wins and the spec is flagged.
     So `baked` is a fact about the source file, not a licence for the page. Data
     may not claim it, and the library's note is reported as stale rather than
     rewritten — the same shape W-9 used for the consent note. */
  const lib = LIB.get(fr.src);
  /* Reported, not rejected, and the distinction is deliberate: a rejection here
     would refuse the whole build until three data files are edited, and the
     ruling is that the field is INERT rather than wrong. The renderer now
     ignores it entirely, so a stale `baked: true` cannot change a pixel — it can
     only mislead the next reader of the data, which is what the note is for. */
  if (fr.baked === true) {
    note(`${key}: frame ${fr.src} still carries baked:true. The field is WITHDRAWN (W-19) and the ` +
      `renderer ignores it — every frame takes the ramp. Delete it on the next data pass.`);
  }
  if (lib && lib.baked === true) BAKED_SEEN.add(fr.src);
}

/* Frames that arrive from anywhere other than the masthead — an activity panel,
   a gallery cell. Same three gates, plus the two that only matter in a set. */
function checkFrameSet(key, where, list, { min = 0 } = {}) {
  if (!Array.isArray(list)) { if (list != null) rej(key, `"${where}" must be an array`); return; }
  const seen = new Set();
  list.forEach((fr, i) => {
    checkFrame(`${key} ${where}[${i}]`, fr);
    if (fr && fr.src) {
      if (seen.has(fr.src)) rej(key, `"${where}" uses ${fr.src} twice — one frame, one place on a page`);
      seen.add(fr.src);
    }
  });
  if (list.length && list.length < min) {
    rej(key, `"${where}" has ${list.length} frame(s) and the floor is ${min}. Below that it is not a sheet, ` +
      `it is a stray thumbnail — omit the field and the band does not render.`);
  }
}
const BAKED_SEEN = new Set();

/* A tensed or dated claim typed into static markup (BRANDING §3.5, §7.9). A
   sourced constant like "since 2000" is licensed and a `period` legitimately
   carries a year, so this scans NARRATIVE fields only and looks for the tenses
   and month names, not for bare years. */
const TENSE = /\b(today|currently|this year|as of|last month|next month|upcoming)\b/i;
const MONTHS = /\b(January|February|March|April|June|July|August|September|October|November|December)\b/;
/* W-15. A month name in prose is stale-able when it means "this June". It is NOT
   stale-able when it names a historical date the owner has sourced — Yamunotsav
   ran on 5 June for nine years and stopped in 2014, so "nine Junes" cannot go
   out of date. Prose on an item that carries a sourced `when` is therefore
   exempt from the MONTHS scan and from that scan only: the TENSE scan still
   applies, because "currently" goes stale whatever the item's history. */
const WHEN_SOURCED = new Set();
function checkProse(key, field, s, monthsOk = false) {
  if (!s) return;
  if (TENSE.test(s)) rej(`${key} ${field}`, `carries a tensed claim ("${s.match(TENSE)[0]}") typed into static markup — cut it, compute it from local Date getters, or use a sourced constant`);
  if (MONTHS.test(s) && !monthsOk && !WHEN_SOURCED.has(key)) rej(`${key} ${field}`, `names a month ("${s.match(MONTHS)[0]}") in static copy — it goes stale without anyone touching the file. If it is a historical date, source it in a "when" object.`);
}

  /* ── REJECTION 12. A STATEMENT BAND WITHOUT ITS FRAME, OR WITH A FIGURE IN IT.
     The statement band is one display line beside a photograph and it has room
     for nothing else — no unit, no period, no basis, no source. So a figure in
     it could not be a reading (BRANDING §3.4 requires all six parts), and a
     numeral that is not a reading is the one thing this site does not print. The
     gate refuses digits in the line rather than trusting the author to remember,
     because it is the single most tempting place on the page to put one. */
function checkStatement(key, st) {
  if (st == null) return;
  {
    if (typeof st !== 'object') rej(key, '"statement" must be an object with "line" and "frame"');
    else {
      if (!st.line) rej(key, '"statement" has no "line" — the band is one display line and nothing else');
      if (!st.frame) rej(key, '"statement" has no "frame". The band without its photograph is a heading on an empty ground, which is the flat block this band exists to break.');
      checkFrame(`${key} statement.frame`, st.frame);
      checkProse(key, 'statement.line', st.line);
      checkProse(key, 'statement.under', st.under);
      if (st.line && /\d/.test(String(st.line).replace(/&[a-z]+;/g, ''))) {
        rej(key, `"statement.line" contains a digit (${JSON.stringify(st.line)}). A statement band has no room for a ` +
          `unit, a period, a basis or a source, so a figure in it cannot be a reading (BRANDING §3.4) — and a ` +
          `numeral that is not a reading is the one thing this site does not print. Put the figure in "figures".`);
      }
      /* ── REJECTION 13. A WORD TOO WIDE FOR THE TYPE COLUMN.
         The statement band's type column NARROWS as the page widens past 1332,
         because its right padding is a percentage and its left is the capped
         .wrap spine: 471.0px at 1440, 442.8px at 1920. A single word cannot
         wrap, and --t-d1 caps at 104px where Archivo 68/850 uppercase measures
         49px a character, so 442.8 / 49 = 9.03 characters is the hard ceiling
         and eight is the working one. Measured: a ten-character word overran the
         photograph by 2.9px at 1440 and 31.7px at 1920 — and every gate that was
         running passed it, because the band clips its own overflow. */
      /* Punctuation is stripped before counting: a trailing comma is not ink the
         column has to hold, and the first version of this gate refused
         "happened," at nine characters for a word that is eight. */
      const words = String(st.line || '').replace(/<[^>]*>/g, ' ')
        .replace(/&[a-z]+;/g, ' ').replace(/[^A-Za-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
      const longest = words.sort((a, b) => b.length - a.length)[0] || '';
      if (longest.length > 11) {
        rej(key, `"statement.line" contains "${longest}" (${longest.length} characters). The band's type column is ` +
          `558.0px at 1440 and at 1920 and --t-d1 caps at 104px, where Archivo 68/850 uppercase measures 49px a ` +
          `character — so 11.4 characters is the arithmetic ceiling and a word of ${longest.length} crosses the seam ` +
          `into the photograph. A single word cannot wrap, and the band clips its own overflow, so no other gate ` +
          `sees this: it was found by reading a PNG and then by a purpose-built seam probe.`);
      }
      if (st.line && String(st.line).replace(/<[^>]*>/g, '').length > 64) {
        rej(key, `"statement.line" is ${String(st.line).replace(/<[^>]*>/g, '').length} characters. The band sets it at ` +
          `--t-d1 in a 44%-width column with a 16ch measure; past about 64 characters it stops being a statement ` +
          `and starts being a paragraph in display type.`);
      }
    }
  }
}

/* The gallery floor, needed by the validation pass which runs before the band
   sequences are declared. One constant, referenced by both. */
const GALLERY_MIN_LATE = 3;

const anchorSeen = new Map();
for (const it of items) {
  const key = it.__key;
  for (const f of ['slug', 'kind', 'name', 'anchor']) if (!it[f]) rej(key, `no "${f}"`);
  if (typeof it.page !== 'boolean') rej(key, '"page" must be a boolean — it is the single switch that decides page-versus-row');
  // ── REJECTION 2. page:true on an event, or on any item AD-17 §3 ruled a row.
  if (it.kind === 'events' && it.page === true) rej(key, 'page:true on an event. Events never have a detail page, at any count — a closed ruling (AD-17 §9.3, data schema §3)');
  if (it.page === true && !RULED_PAGES.has(key)) rej(key, 'page:true but AD-17 §3 ruled this a ROW. A stub page is worse than a rich row.');
  if (it.page === false && RULED_PAGES.has(key)) rej(key, 'page:false but AD-17 §3 ruled this an OWN PAGE.');
  // ── REJECTION 6. A duplicate anchor anywhere in the section.
  if (it.anchor) {
    if (anchorSeen.has(it.anchor)) rej(key, `duplicate anchor "${it.anchor}" — already used by ${anchorSeen.get(it.anchor)}. Anchor ids are globally unique across the section.`);
    else anchorSeen.set(it.anchor, key);
  }
  // ── REJECTION 4. A situation outside air / yamuna / forest-loss, and a claim
  //    the situation pages do not support.
  if (it.situation != null) {
    if (!SITUATIONS.has(it.situation)) rej(key, `"situation" is "${it.situation}" — only air, yamuna and forest-loss are verified (data schema §5.4)`);
    else if (!(SITUATION_CLAIMS[it.situation] || []).includes(it.slug)) {
      rej(key, `claims situation "${it.situation}", which does not name this subject. AD-17 §4 clause 3 permits only: ` +
        Object.entries(SITUATION_CLAIMS).map(([s, l]) => `${s} <-> ${l.join(', ')}`).join(' · '));
    }
  }
  /* W-15. Register this item as date-sourced BEFORE any prose is scanned, so the
     MONTHS check can exempt it. `when.source` is validated separately in the
     events block — this only records that a source was claimed at all. */
  if (it.when && typeof it.when === 'object' && it.when.source) WHEN_SOURCED.add(key);
  (it.figures || []).forEach((f, i) => checkFigure(key, f, i));
  checkFrame(key, it.frame);
  /* ── REJECTION 14, INVERTED BY AD-28. `frame_note` IS NO LONGER A FIELD.
     It carried one sentence, in the masthead and in the open: that this page has
     no photograph. Gram Anubhav's read "No photograph, and that is a finding
     rather than a gap." AD-28 §2.3 settles every empty state the other way —
     where a card, band or page has nothing behind it, SHOW LESS, do not explain
     the absence. Gram Anubhav now simply has no photograph.

     THE GATE IS INVERTED RATHER THAN DELETED (AD-28 §6). It used to assert the
     note was well-formed and that the page it sat on really had no frame; it now
     refuses the field outright, so the sentence cannot come back by somebody
     re-adding a key that still had plumbing behind it. */
  if ('frame_note' in it || '_frame_note' in it) {
    rej(key, '"frame_note" is not a field any more (AD-28). It published a sentence explaining that the page '
      + 'has no photograph. Where there is no photograph, the page shows none and says nothing — delete the key.');
  }
  if (it.act && (!it.act.href || !it.act.label)) rej(key, '"act" needs both a label and an href');
  /* ── AD-27.19. THE `ask` SIBLING, AND WHY IT IS A SIBLING.
     `/act`'s ENTIRE architecture is derived: build-act-page.mjs reads every
     every data/work item file, takes every one whose act.href is /act, groups them
     through its WAYS table and renders each as a link back to the page it came
     from — and its gate 1 is TOTAL, so an ask label that no way claims stops
     that build. If this lane rewrote act.href to a mailto:, /act would lose its
     ask list and refuse to build. Adding a sibling key changes nothing
     build-act-page.mjs reads, so the derivation survives untouched and the
     return path a reader followed from /act#partner still lands on the page
     that made the ask.
     The audience is asserted against AD-27.18's ruled table above; the subject
     line is DERIVED from the item's own name, never typed, so it cannot drift
     from the page it names. */
  if (it.ask != null) {
    const ruled = ASK_PLACEMENT[key];
    if (!Array.isArray(it.ask)) rej(key, '"ask" must be an array of {audience, label}');
    else if (!ruled) rej(key, `carries "ask" but AD-27.18's placement table names no Ask for this page. Placement is a ruling, not a data field.`);
    else {
      if (it.ask.length > 2) rej(key, `${it.ask.length} Asks. AD-27.18 caps a page at two — more turns it into a switchboard and spends the primary button.`);
      const got = it.ask.map(a => a && a.audience);
      if (new Set(got.filter(Boolean)).size !== got.length) rej(key, `two Asks share an audience (${got.join(', ')}) — AD-27.18.`);
      if (got.join('|') !== ruled.join('|')) {
        rej(key, `"ask" audiences are [${got.join(', ')}] and AD-27.18 rules [${ruled.join(', ')}], in that order. ` +
          `The order is the .b-1 / .b-2 order and it is not a preference.`);
      }
      it.ask.forEach((a, i) => {
        if (!a || !ASK_AUDIENCE_SET.has(a.audience)) rej(key, `ask[${i}].audience is ${JSON.stringify(a && a.audience)} — one of school, funder, institution, media. AD-27.56: nobody invents a fifth.`);
        if (!a || !a.label) rej(key, `ask[${i}] has no "label". The summary IS the ask, and it has to read as one.`);
        checkProse(key, `ask[${i}].label`, a && a.label);
      });
    }
  } else if (ASK_PLACEMENT[key]) {
    rej(key, `AD-27.18 places [${ASK_PLACEMENT[key].join(', ')}] Ask(s) on this page and the data carries none. ` +
      `Without it the page keeps the CTA that navigates to /act, which is the exact defect the client reported.`);
  }
  for (const [fld, val] of [['deck', it.deck], ['line', it.line], ['gathering', it.gathering]]) checkProse(key, fld, val);
  for (const grp of ['how', 'done']) for (const r of (it[grp] || [])) { checkProse(key, `${grp}.h`, r.h); checkProse(key, `${grp}.p`, r.p); }
  for (const h of (it.holes || [])) checkProse(key, 'holes.what', h.what);

  /* ── AD-18. THE FIVE NEW FIELDS, AND THE FOUR NEW REJECTIONS ─────────────
     The client's six-part spine cannot be expressed by how/done/with, so the
     contract gains `aims`, `who`, `activities`, `gallery` and `scale`. Every one
     of them gets the same treatment as the fields already here: shape asserted,
     prose scanned for tense, frames put through all three frame gates, and
     ABSENCE IS FINE — an absent field omits its band and the gap is named in the
     build report, which is the whole answer to "each program looks
     incomplete". An empty band is how a page comes to look incomplete; a
     missing one plus a named gap is how it stays honest. */
  for (const grp of ['aims', 'who']) {
    const list = it[grp];
    if (list == null) continue;
    if (!Array.isArray(list)) { rej(key, `"${grp}" must be an array of {h, p}`); continue; }
    list.forEach((r, i) => {
      if (!r || !r.h || !r.p) rej(key, `${grp}[${i}] needs both "h" (a written heading) and "p" (a written body)`);
      checkProse(key, `${grp}[${i}].h`, r && r.h);
      checkProse(key, `${grp}[${i}].p`, r && r.p);
      checkProse(key, `${grp}[${i}].cap`, r && r.cap);
    });
  }
  if (it.activities != null) {
    if (!Array.isArray(it.activities)) rej(key, '"activities" must be an array');
    else {
      it.activities.forEach((a, i) => {
        if (!a || !a.name || !a.p) rej(key, `activities[${i}] needs a "name" and a written "p"`);
        checkProse(key, `activities[${i}].name`, a && a.name);
        checkProse(key, `activities[${i}].p`, a && a.p);
      });
      checkFrameSet(key, 'activities', it.activities.map(a => a && a.frame).filter(Boolean));
      /* ── REJECTION 9. A TAB GROUP OF ONE IS NOT A TAB GROUP. A single tab is a
         control with nothing to choose between, and it costs 44px to say so. */
      if (it.activities.length === 1) {
        rej(key, 'one activity. A tab group of one is a control with nothing to choose — either the ' +
          'set has two or more or it is prose, and prose belongs in "how".');
      }
    }
  }
  /* ── REJECTION 10. A GALLERY BELOW THE FLOOR. */
  checkFrameSet(key, 'gallery', it.gallery, { min: GALLERY_MIN_LATE });
  /* ── REJECTION 11. A SCALE THAT INTRODUCES A NUMBER.
     This is the gate that makes the range row safe. `scale` may not carry a
     figure; it may only name one the item already publishes, by index, and
     supply the two endpoints — and BOTH endpoints must appear verbatim inside
     that figure's own `value` string. "100–150" yields 100 and 150 and nothing
     else. So the device can redraw a published span and is structurally
     incapable of inventing one, which is the difference between making a number
     do more work and making a number up. */
  for (const [i, sc] of (it.scale || []).entries()) {
    const at = `${key} scale[${i}]`;
    if (!sc || typeof sc !== 'object') { rej(at, 'not an object'); continue; }
    if (!Number.isInteger(sc.figure) || !(it.figures || [])[sc.figure]) {
      rej(at, `"figure" must be the index of one of this item's own figures; got ${JSON.stringify(sc.figure)}`);
      continue;
    }
    const src = (it.figures[sc.figure] || {}).value || '';
    for (const end of ['low', 'high']) {
      if (typeof sc[end] !== 'number') { rej(at, `"${end}" must be a number`); continue; }
      const asWritten = String(sc[end]);
      const grouped = sc[end].toLocaleString('en-IN');
      if (!src.includes(asWritten) && !src.includes(grouped)) {
        rej(at, `"${end}" is ${asWritten}, which does not appear in figures[${sc.figure}].value ` +
          `(${JSON.stringify(src)}). A scale may only redraw a span the page already publishes with a ` +
          `source — it may not introduce an endpoint.`);
      }
    }
    if (typeof sc.low === 'number' && typeof sc.high === 'number' && !(sc.high > sc.low)) {
      rej(at, `"high" (${sc.high}) must be greater than "low" (${sc.low}) — a span of zero is a number, not a range`);
    }
    checkProse(key, `scale[${i}].note`, sc.note);
  }
  checkStatement(key, it.statement);
  if (it.invite) {
    for (const slot of ['second']) {
      const v = it.invite[slot];
      if (v && (!v.label || !v.href)) rej(key, `invite.${slot} needs both a label and an href`);
    }
    checkProse(key, 'invite.note', it.invite.note);
  }

  if (it.kind === 'events') {
    /* Events are deliberately thinner. NO date, edition, year or count field
       exists in the schema for them, on purpose — a field for a date invites one
       to be invented. §3's key set is a MINIMUM, not an exact match (schema
       addendum §7), so the check is on the four banned fields and on the one
       written line, never on the presence of anything else. */
    /* ══ W-15. THIS WHOLE BLOCK WAS BUILT ON A FACT THAT IS NO LONGER TRUE. ══
       Every rule below assumed all four events were name-only, so a date, an
       edition or a figure on an event could only have been invented. The owner
       supplied Yamunotsav on 21 August — nine editions, 5 June, India Habitat
       Centre, 2006–2014 — so for that event a date is now SOURCED, and refusing
       it would be the build enforcing an absence the owner has just filled.
       The rules are therefore keyed to `when`, not abolished. An event that
       carries a sourced `when` may carry dates, editions and figures. An event
       with no `when` still may not — and that is the important half, because
       three of the four still have nothing and a hollow `when` on them would be
       exactly the fabrication this block was written to stop. ═══════════ */
    const hasWhen = it.when && typeof it.when === 'object';
    if (hasWhen) {
      for (const f of ['day', 'years', 'editions', 'venue']) {
        if (!it.when[f]) rej(key, `"when" is missing "${f}" — a partial date is how an invented one gets in`);
      }
      if (!it.when.source || !SOURCE_FORMS.some(re => re.test(it.when.source))) {
        rej(key, `"when.source" is ${JSON.stringify(it.when.source)} — a date needs a source in an accepted form, same as a figure`);
      }
    } else {
      for (const banned of ['date', 'edition', 'year', 'count', 'editions']) {
        if (banned in it) rej(key, `has a "${banned}" field but no sourced "when". Put the date in a "when" object with its source, or it does not exist (data schema §3).`);
      }
      if ((it.figures || []).length) rej(key, 'carries figures but no sourced "when". For an event we hold only a name, a figure is invented.');
    }
    if (!it.gathering) rej(key, 'no "gathering" — one written line saying what kind of gathering this is');
    const schedule = it.gathering && it.gathering.match(/\b(20\d\d|19\d\d|\d+(st|nd|rd|th)\s+edition|\d{2,}\s+(editions|years))\b/i);
    /* A `gathering` may reference a span only where `when` sources one. */
    if (schedule && !hasWhen) {
      rej(key, `"gathering" implies a schedule or an edition ("${schedule[0]}") and this event has no sourced ` +
        `"when". A name-only event carries no dates, editions, years or counts.`);
    }
  }
  /* AD-18 · W-17. AN EVENT MAY BELONG TO A CAMPAIGN OR A PROJECT.
     Owner, 21 August: "Event can be part of campaigns as well as Projects." So
     the four kinds are not four silos, and the cross-sell has to be able to say
     that Yamuna Shramdaan happens under We for Yamuna rather than beside it.
     `belongs_to` names a real slug and is checked against one. NO PARENT IS
     INVENTED for an event that has none, which is the case for at least two of
     the four — an absent relationship renders no slot and is not a hole, exactly
     as the data contract already rules for `situation`. */
  if (it.belongs_to != null) {
    if (it.kind !== 'events') {
      rej(key, '"belongs_to" is for events only. Making a project a child of a campaign is a change to the ' +
        'architecture, not a data field, and AD-17 §3 is where it would have to be argued.');
    } else if (typeof it.belongs_to !== 'string') {
      rej(key, '"belongs_to" must be the slug of a campaign or a project, as a string');
    } else {
      const parent = items.find(x => x.slug === it.belongs_to && (x.kind === 'campaigns' || x.kind === 'projects'));
      if (!parent) {
        rej(key, `"belongs_to" is "${it.belongs_to}", which is not the slug of any campaign or project in ` +
          `data/work/. A parent is named or it is absent; it is never guessed.`);
      }
    }
  }
  if (it.kind === 'journeys' && it.page) {
    if (!it.duration || !it.duration.value || !it.duration.unit) rej(key, 'a journey needs "duration" with a value and a unit — the band is ordered duration-first');
    else if (![34, 25, 22, 19].includes(it.duration.rank)) rej(key, `duration.rank is ${it.duration.rank} — reuse the frozen band 5 factors 34 / 25 / 22 / 19, do not re-derive them`);
  }
}

/* Each of the four kinds must be defined, in the frozen homepage's order. */
const KINDS = [];
for (const k of KINDS_ORDER) {
  const d = (Array.isArray(KINDS_RAW) ? KINDS_RAW : KINDS_RAW.kinds || []).find(x => x.slug === k);
  if (!d) { if (existsSync(kindsPath)) miss(`kinds.json has no entry for "${k}"`); continue; }
  for (const f of ['name', 'line', 'frame_line']) if (!d[f]) rej(`kinds.json/${k}`, `no "${f}"`);
  if (!d.act || !d.act.href) rej(`kinds.json/${k}`, 'no "act" with an href');
  checkProse(`kinds.json/${k}`, 'frame_line', d.frame_line);
  checkFrame(`kinds.json/${k}`, d.frame);           // optional, null permitted (addendum §3)
  checkStatement(`kinds.json/${k}`, d.statement);
  checkFrameSet(`kinds.json/${k}`, 'gallery', d.gallery, { min: GALLERY_MIN_LATE });
  if (!d.frame) note(`kinds.json/${k}: no masthead frame, so /work/${k} takes the type-only masthead (AD-17 §5D, addendum §1/§3)`);
  KINDS.push(d);
}

/* ═══ THE ROUTE MAP AND THE ANCHOR REGISTRY ═══════════════════════════════
   AD-18: /work IS KEPT (W-16, owner reversal of the IA's deletion) and it is
   the section's own front door again. The constant stays named so the
   destination appears once and an ancestor line cannot drift from the nav. */
const PATHS = { index: { url: '/work', file: 'index.html' } };
for (const k of KINDS_ORDER) PATHS[k] = { url: `/work/${k}`, file: `${k}.html` };
const WORK_BAND = PATHS.index.url;
const itemPath = (it) => ({ url: `/work/${it.kind}/${it.slug}`, file: `${it.kind}/${it.slug}.html` });

/* ═══ AD-27.48 · A DESCRIPTION FOR EVERY PAGE, 140-158 CHARACTERS ═════════
   All fifteen WORK pages carried one already — `it.line` or `def.line` — and
   all fifteen were between 51 and 117 characters, which is a sentence Google
   pads or truncates rather than the page's own answer. AD-27.48 sets the band
   at 140-158 and requires each one to carry (a) the page's own subject in the
   reader's words and (b) ONE VERIFIABLE FACT, which is the same standard the
   page's copy is held to.

   EVERY FACT BELOW IS ALREADY PUBLISHED ON THE PAGE IT DESCRIBES, with a source
   in its own `figures` block or `line`. Nothing here introduces a number.

   AND NOTHING IS TENSED, DATED OR A SPECIMEN. BRANDING §3.5 applies to <head>
   exactly as it applies to <body> — a description is static markup that Google
   caches — so no description carries a reading, "today", "currently" or a year
   count. The two totals a page could state about its own SET are also absent:
   D-03.2 forbids "eight campaigns" and "four events" for the same reason the
   pages themselves refuse them — the sentence has to read the same at three or
   at thirteen.

   /work/journeys IS TAKEN VERBATIM FROM AD-27.47's PHRASE TABLE, which assigns
   it the "School Adventure Camp" query and rules exactly how it is discharged:
   the programmes are outdoor residential school journeys and camps, the pages
   say so in those words, and the literal string "adventure camp" appears in no
   source and is therefore not written. */
const DESC = {
  '/work':
    'Everything Swechha runs, in one view: every project, campaign, journey and event, by name, with the kind of work it is set on the row beside it.',
  '/work/projects':
    'The work that runs for years rather than days: a school curriculum on land, water and air, a five-acre learning farm, butterfly parks, and a volunteer corps.',
  '/work/campaigns':
    'Public pressure with a name on it, from We for Yamuna in 2000 to Monsoon Wooding. The campaigns, by name, and what each one of them pushes against.',
  '/work/journeys':
    'School journeys and camps, two hours to twelve days: a city walk, a forest, a village, and a thousand kilometres down the Yamuna. The oldest runs since 2004.',
  '/work/events':
    'Workshops, concerts, plays and river clean-ups — the gatherings Swechha runs in public, from Yamunotsav to the Greenathon and the Yamuna Shramdaan.',
  '/work/projects/bridge-the-gap':
    'A module-based school curriculum on land, water and air: five to sixteen sessions, plus exposure trips and action projects. 100-150 Delhi schools every year.',
  '/work/projects/farm-school':
    'A learning lab on five acres, ninety minutes from Delhi. Day visits, short courses, internships and stays, with the composting and the nursery as the class.',
  '/work/projects/eco-action':
    'Butterfly parks and herb gardens built with schools and residents across Delhi NCR: over seventy parks and over twenty gardens planted so far.',
  '/work/projects/me-to-we':
    'A leadership programme run with children from one settlement in south Delhi. Over 3,000 through it in thirteen years, and over 200 back as peer leaders.',
  '/work/projects/influence':
    'Volunteering and a fellowship, nationwide: ten fellows a year, ten thousand volunteers a year, fifty colleges, and a network of over 300 youth groups.',
  '/work/campaigns/monsoon-wooding':
    'Planting through the monsoon across Delhi NCR. About 5,000 trees a year and over 50,000 planted and survived, counted as survivors against a planting count.',
  '/work/journeys/yamuna-yatra':
    'Twelve days and about a thousand kilometres down the Yamuna, from Yamunotri to Agra. Thirty Yatras since 2004, and ten thousand young people through them.',
  '/work/journeys/gram-anubhav':
    'Four to five days living in a village in Uttarakhand, Rajasthan, Gujarat or Himachal. Over sixty journeys run, with over a hundred partners in the villages.',
  '/work/journeys/naturescapes':
    'Two to five days in a forest, a mountain, a desert or a mangrove: Sariska, Ranthambore, Corbett, Jaisalmer, the Sunderbans. Over sixty journeys organised.',
  '/work/journeys/cityscapes':
    'Two to four hours inside Delhi, at six places it would rather you did not look at: the river, a landfill, a city forest. Over a thousand walks in two decades.',
};
/* AD-27.47. The one title the phrase table rewrites in this lane. Every other
   WORK title is already correct and only the description is added. */
const TITLE = {
  '/work/journeys': 'Journeys — school camps and walks — Swechha',
};

/* AD-27.50 · BreadcrumbList, DERIVED FROM THE ROUTE. Two or three levels:
   Swechha -> The work -> Projects -> Bridge the Gap. Built from `PATHS` and the
   item's own name, so a breadcrumb cannot disagree with the URL. */
const crumbsIndex = () => [['Swechha', '/'], ['The work', PATHS.index.url]];
const crumbsKind = (k) => [...crumbsIndex(), [kindDef(k).name, PATHS[k].url]];
const crumbsFor = (it) => [...crumbsKind(it.kind), [it.name, itemPath(it).url]];

/* The description and the title are looked up by ROUTE, and a page whose route
   is not in the table refuses to build rather than falling back to `line` —
   which is what left fifteen pages at 51-117 characters with nobody noticing.
   Both bounds are checked: 140 because a shorter one is padded by Google, 158
   because a longer one is truncated mid-clause. */
const descFor = (it) => DESC[itemPath(it).url];
function checkDescriptions() {
  const want = [PATHS.index.url, ...KINDS_ORDER.map(k => PATHS[k].url),
    ...items.filter(i => i.page).map(i => itemPath(i).url)];
  for (const u of want) {
    const d = DESC[u];
    if (!d) { rej('DESC', `no description for ${u}. AD-27.48 makes one required on every page.`); continue; }
    if (d.length < 140 || d.length > 158) rej('DESC', `${u}'s description is ${d.length} characters; AD-27.48's band is 140-158.`);
    if (/\b(today|currently|this year|as of|DEMO DATA)\b/i.test(d)) rej('DESC', `${u}'s description carries a tensed claim or a specimen marker (BRANDING §3.5 applies to <head>).`);
  }
  const seen = new Map();
  for (const u of want) {
    const d = DESC[u];
    if (d && seen.has(d)) rej('DESC', `${u} and ${seen.get(d)} share a description. AD-27.53 condition 3 checks uniqueness mechanically.`);
    else if (d) seen.set(d, u);
  }
}

const canonical = new Set([PATHS.index.url, ...KINDS_ORDER.map(k => PATHS[k].url)]);
for (const it of items) if (it.page) canonical.add(itemPath(it).url);

const routes = new Set([...(ONWARD.routes || []), ...canonical]);
if (!ONWARD.routes) miss('onward.json has no "routes" — the route map every href is checked against');
else {
  for (const u of canonical) {
    if (!ONWARD.routes.includes(u)) note(`onward.json routes[] does not list ${u}, which this build emits. Added to the route map from the build's own output; worth reconciling.`);
  }
  /* AND THE OTHER DIRECTION, which the first version of this file did not
     check: a route map that lists a /work page nobody emits will happily pass an
     href pointing at a page that does not exist. Reported, not edited — it is
     data. */
  for (const u of ONWARD.routes) {
    if (u.startsWith('/work') && !canonical.has(u)) {
      note(`onward.json routes[] lists ${u}, which this build does not emit. While it stays, the link ` +
        `gate would accept an href pointing at a page that does not exist.`);
    }
  }
}

/* THE ANCHOR REGISTRY IS CROSS-CHECKED, NOT COPIED. onward.json states which
   landing page each anchor lives on, and this build derives the same fact from
   the item files. Two independently-authored answers to one question, compared
   — which is the only kind of check worth having on a link contract. */
const declaredAnchors = ONWARD.anchors || {};
for (const it of items) {
  const want = PATHS[it.kind].url;
  const got = declaredAnchors[it.anchor];
  if (got === undefined) note(`onward.json anchors[] does not declare "${it.anchor}"; derived as ${want} from the item file.`);
  else if (got !== want) rej('onward.json', `anchors["${it.anchor}"] says ${got}, but ${it.__file} puts it on ${want}`);
}

/* ── AD-18. `onward.json`'s `index` BLOCK IS VALIDATED LIKE ANY OTHER SUBJECT.
   /work's masthead frame, its statement and its gallery live there rather than
   in an item file, because /work is not an item — and the first version of this
   build validated the item files and the kinds and skipped it, which is exactly
   how the index shipped a ten-character statement word that overran the
   photograph at 1440 and 1920. Same three checks, same messages. */
if (ONWARD.index) {
  checkFrame('onward.json/index', ONWARD.index.frame);
  checkStatement('onward.json/index', ONWARD.index.statement);
  checkFrameSet('onward.json/index', 'gallery', ONWARD.index.gallery, { min: GALLERY_MIN_LATE });
} else {
  note('onward.json has no "index" block, so /work takes the type-only masthead and renders no statement band and no contact sheet (AD-18 §index).');
}

/* The homepage's own anchors are READ OUT OF home.html, not typed here: /#farm
   and /#record are two of the six nav destinations and a typo in either would
   be a dead nav link on all fourteen pages. */
const homeHtml = readFileSync(HOME_SRC, 'utf8');
const homeAnchors = new Set([...homeHtml.matchAll(/<section[^>]*\sid="([^"]+)"/g)].map(m => m[1]).concat(['main', 'footer']));

/* ═══ THE ORDER IS EXTRACTED, NOT CHOSEN ══════════════════════════════════
   Item order is a content decision the owner has already made, and the frozen
   homepage is where he made it: Bridge the Gap, Farm School, Eco Action, ME to
   WE, Influence, She Leads Change, Food systems — and D-10.4 says the homepage
   wins where anything contradicts it. The first build listed items in readdir
   order, which is alphabetical, so /work/projects numbered Eco Action 02 while
   the homepage numbers it 03. Two ordinals for one item is exactly the
   one-word-two-destinations defect in a different register.
   So the order is READ OUT OF home.html — the register titles in band 6, the
   journey names in band 5, the campaign names in band 7 and the event names in
   its rail — by the same extract-rather-than-retype rule as the CSS. An item
   the homepage does not name keeps its file order and lands after the ones it
   does, and the build says which.                                          */
const grab = (re) => [...homeHtml.matchAll(re)].map(m => m[1].replace(/&rsquo;/g, "\u2019").replace(/&nbsp;/g, ' ').trim());
const HOME_ORDER = {
  projects: grab(/<h3 class="w7-pj-(?:rt|t)">([^<]+)<\/h3>/g),
  journeys: grab(/<h3 class="w7-jr-t">([^<]+)<\/h3>/g),
  campaigns: grab(/<h3 class="w7-ce-t">([^<]+)<\/h3>/g),
  events: grab(/<span class="w7-ce-evn">([^<]+)<\/span>/g),
};
for (const [k, list] of Object.entries(HOME_ORDER)) {
  if (!list.length) rej('home.html', `no ${k} names could be read out of the frozen homepage — the markup moved, so item order cannot be inherited. Re-find it, do not fall back to alphabetical.`);
}
function orderKey(it) {
  const list = HOME_ORDER[it.kind] || [];
  // Apostrophes differ by design: the frozen markup carries the typographic
  // entity and the data carries the plain character. Normalise, do not rename.
  const norm = (x) => x.toLowerCase().replace(/[\u2018\u2019']/g, "'").replace(/\s+/g, ' ');
  const i = list.findIndex(n => norm(n) === norm(it.name));
  if (i < 0) { note(`${it.__key}: not named on the frozen homepage, so it keeps file order and sorts after the ones that are`); return 1000; }
  return i;
}
for (const need of ['farm', 'record']) {
  if (!homeAnchors.has(need)) rej('home.html', `no <section id="${need}"> — the nav's /#${need} destination would be dead on every page in the section`);
}
const anchors = new Map([['/', homeAnchors]]);

/* /act's ANCHORS, READ OUT OF act.html, by the same extract-rather-than-retype
   rule as the homepage's above. AD-25 gave `/act` a real page with six bands,
   and the frozen footer's "Work with us" — which is extracted into every page
   in this section — now points at `/act#partner` instead of the href="#" it had
   carried since 19 August. Without this the link gate fails all fifteen pages
   with FAIL:not-in-anchor-registry, which is the gate working correctly: it
   cannot confirm an anchor on a page whose ids it has never been shown.
   Read, not typed, so renaming a band on that page fails the build here rather
   than leaving a dead fragment in fifteen footers. */
const actPath = join(V3, 'act.html');
if (!existsSync(actPath)) {
  rej('act.html', 'not built, and the frozen footer now links to /act#partner on every page in this section. Run `npm run build:act` first.');
} else {
  const actHtml = readFileSync(actPath, 'utf8');
  const actAnchors = new Set([...actHtml.matchAll(/<section[^>]*\sid="([^"]+)"/g)].map(m => m[1]).concat(['main', 'footer']));
  for (const need of ['give', 'hands', 'partner']) {
    if (!actAnchors.has(need)) {
      rej('act.html', `no <section id="${need}"> — the frozen homepage's Give band and this section's footer both point at /act#${need}, so that link would be dead.`);
    }
  }
  anchors.set('/act', actAnchors);
}

/* ═══ THE BAND SEQUENCES — AD-18, DERIVED FROM WHAT HAS CONTENT ═══════════
   AD-17 §5 published one chain per page type and this file carried them as
   literals. That worked while `with` was the only optional band; the client's
   six-part spine makes FIVE bands optional on an item page, which is thirty-two
   literal chains, and the one optional case the literals did handle was only
   found because the ground gate fired on it.

   So a page now declares the ORDER of its possible bands and the CONDITION each
   one is present under, and `bandChain` assigns the grounds and tiers by the
   rhythm the frozen homepage keeps (see work-shell.mjs: papers never adjoin,
   exactly one licensed dark-to-dark step absorbs an odd count, top is the
   arrival ground, onward is paper-2, the band above onward is dark). The
   adjacency gate then checks the result on the composited colour, plus two new
   gates the assigned chain needs — no paper-to-paper step, at most one
   dark-to-dark.

   THE ORDER IS THE CLIENT'S OWN LIST, in his own sequence:
     what       "What we do (description of the project/campaign/journey)"
     aim        "What we tend to achieve (Objectives)"
     how        "Strategy/Activities"
     who        "For Who"
     done       "Impact"
     sheet      the photographs — his first complaint, and the only band whose
                job is to be looked at rather than read
     with       who it is with, by name (kept from AD-17 §5D band 5)
     onward     "Come Partner/Volunteer/Contact Us"

   A BAND WHOSE CONDITION IS FALSE IS OMITTED AND THE GAP IS NAMED in the build
   report — never rendered empty. "Each program looks incomplete" is the
   complaint, and an empty band is how you get there.                        */
const hasStatement = (x) => !!(x.statement && x.statement.line && x.statement.frame);
const SEQ = {
  index: [
    ['top', () => true],
    ['everything', () => true],
    ['statement', hasStatement],
    ['reach', () => true],
    ['sheet', (k) => (k.gallery || []).length >= GALLERY_MIN],
    ['onward', () => true],
  ],
  item: [
    ['top', () => true],
    ['what', (it) => !!(it.line || (it.figures || []).length)],
    ['aim', (it) => (it.aims || []).length > 0],
    ['statement', hasStatement],
    ['how', (it) => (it.how || []).length > 0 || (it.activities || []).length > 0 || (it.route || []).length > 0],
    ['who', (it) => (it.who || []).length > 0],
    ['done', (it) => (it.done || []).length > 0 || (it.figures || []).length > 0 || (it.holes || []).length > 0],
    ['sheet', (it) => (it.gallery || []).length >= GALLERY_MIN],
    ['with', (it) => hasNames(it.with)],
    ['onward', () => true],
  ],
  kind: [
    ['top', () => true],
    ['frame', () => true],
    ['list', () => true],
    ['statement', hasStatement],
    ['weight', () => true],
    ['sheet', (k) => (k.gallery || []).length >= GALLERY_MIN],
    ['onward', () => true],
  ],
  /* AD-28. `holes` IS OUT OF THE SEQUENCE, not emptied — a band whose entire
     subject was what we cannot yet say. Removing it from here is the whole
     edit: `bandChain` re-derives the grounds and tiers from the surviving
     count, and the adjacency gate checks the result, so the alternation cannot
     silently break. Same for `nodates` on events, below. */
  campaigns: [
    ['top', () => true],
    ['frame', () => true],
    ['against', () => true],
    ['statement', hasStatement],
    ['sheet', (k) => (k.gallery || []).length >= GALLERY_MIN],
    ['onward', () => true],
  ],
  events: [
    ['top', () => true],
    ['record', () => true],
    ['statement', hasStatement],
    ['sheet', (k) => (k.gallery || []).length >= GALLERY_MIN],
    ['onward', () => true],
  ],
};
/* The gallery floor. Below three frames the contact sheet is not a sheet, and a
   one-frame "gallery" reads as a photograph somebody forgot to caption. */
const GALLERY_MIN = GALLERY_MIN_LATE;

/** Which bands this subject actually has content for, plus the gaps to name. */
function bandsFor(kindOfPage, subject, key) {
  const seq = SEQ[kindOfPage];
  const on = [], off = [];
  for (const [id, cond] of seq) (cond(subject) ? on : off).push(id);
  for (const id of off) {
    miss(`${key} — band "${id}" is omitted: ${GAP[id]}`);
  }
  return { bands: bandChain(on), omitted: off };
}
/* What each omitted band's absence actually means, said in the terms a content
   author can act on. This is the "name the gap" half of the omit-and-name rule,
   and it is the report the owner needs in order to close them. */
const GAP = {
  what: 'no "line" and no figures — the page cannot say what it is',
  aim: 'no "aims" — nothing is written down about what this sets out to achieve. The client asked for this band by name ("What we tend to achieve (Objectives)").',
  how: 'no "how", no "activities" and no "route" — nothing is written down about how it runs. The client asked for this band by name ("Strategy/Activities").',
  who: 'no "who" — nobody has written down who this is for. The client asked for this band by name ("For Who").',
  done: 'no "done", no figures and no holes — the page can claim nothing and names nothing it cannot claim',
  sheet: `fewer than ${GALLERY_MIN} catalogued frames in "gallery" — the photograph band does not render. This is the client's first complaint ("There is no use of photos, hardly") and it is closed by naming frames, not by design.`,
  with: 'no schools, partners or funders named (schema addendum §5)',
  statement: 'no "statement" with both a written line and a frame. THIS IS THE BAND THAT ANSWERS THE OWNER\'S SHARPEST NOTE — "this use of black and white blocks is getting to make pages boring". It is the frozen homepage\'s own cure (band 3, #say): one display line beside a photograph running to the seam, no opener, no rule, no list. Without it the page is a stack of rectangles. One line and one frame each closes it.',
  everything: 'no items at all',
  reach: 'no figures anywhere in the section',
};

/* The SECTIONS index label for each band. It is also the band's own head where
   the head is not written per page, so these are the client's six part names in
   the register the rest of the site uses. */
const LABEL = {
  top: 'Top', onward: 'Get involved', frame: 'What this is', list: 'The list',
  weight: 'The figures', against: 'What each pushes against',
  what: 'What we do', aim: 'What it sets out to do', how: 'Strategy and activities',
  who: 'Who it is for', done: 'Impact', sheet: 'The photographs', with: 'Who it is with',
  record: 'The record',
  /* AD-28. `holes` ("What we cannot say yet") and `nodates` ("Why there are no
     dates") are gone from SEQ, so their labels go too — a label left behind for
     a band that no longer exists is the next person's confusion, and the strict
     check below would not catch it because it only fires the other way. */
  /* W-22. `statement` was missing, so the SECTIONS index printed the raw band id
     on all 15 pages. It is deliberately NOT a descriptive label like the rest —
     the band is one line of display type and the index should carry that line's
     own subject, not a category. "In short" is the shortest honest name for a
     band whose whole job is to say the thing in one sentence. */
  statement: 'In short', activities: 'Strategy and activities',
  /* The two bands the /work index redesign added (W-16). The strict check above
     caught both the moment it replaced the raw-id fallback, which is the case it
     was written for. */
  everything: 'Everything, in one view', reach: 'The numbers',
};
/* W-22. A band id with no LABEL entry used to fall through to the raw id, which
   is how `statement` shipped visibly on 15 pages while every gate read green.
   It now throws at build time: a missing label is a defect, and a build that
   silently prints an internal identifier to a reader is worse than one that
   stops. Add the label — do not restore the fallback. */
const sectionsFor = (bands) => bands.map(([id]) => {
  if (!LABEL[id]) {
    rej('LABEL', `band "${id}" has no entry in LABEL, so the SECTIONS index would print the raw band id to a reader. Add a label.`);
    return [id, `#${id}`];
  }
  return [LABEL[id], `#${id}`];
});

function registerAnchors(url, bands, extra = []) {
  const set = anchors.get(url) || new Set();
  for (const [id] of bands) set.add(id);
  for (const a of extra) set.add(a);
  set.add('main');
  anchors.set(url, set);
}

/* ═══ DESTINATIONS ════════════════════════════════════════════════════════
   An item's destination is a PAGE URL where it has a page, and its own
   /work/<kind>#<anchor> where AD-17 §3 ruled it a row. A row's link is still
   specific: five rows sharing one destination is what makes homepage band 6
   feel broken today.                                                        */
const dest = (it) => it.page ? itemPath(it).url : `${PATHS[it.kind].url}#${it.anchor}`;
const byKind = (k) => items.filter(i => i.kind === k).sort((a, b) => orderKey(a) - orderKey(b) || a.slug.localeCompare(b.slug));
const kindDef = (k) => KINDS.find(x => x.slug === k) || { slug: k, name: k, line: '', frame_line: '', act: null };

const SIT = new Map((ONWARD.situations || []).map(s => [s.slug, s]));
if (!SIT.size) miss('onward.json has no "situations" — no situation door or hook can be drawn');
for (const [slug, s] of SIT) {
  if (!SITUATIONS.has(slug)) rej('onward.json', `situations[] carries "${slug}", which is not one of the three verified subjects`);
  if (!s.href) rej('onward.json', `situations["${slug}"] has no href`);
}

/* ═══ THE CROSS-SELL BAND — one component, specified once, instantiated
       identically on all fourteen pages (AD-17 §4) ═══════════════════════════

   EXACTLY THREE DOORS, and this is the one place where §4 contradicts itself
   and I had to resolve it rather than implement both readings. §4's shape
   paragraph says "slots 1-3 as three .door columns, repeat(3,minmax(0,1fr))"
   and its 375 paragraph says "the three doors become three full-width rows" —
   three. Its honesty rule says "one, two or three siblings paint" and "a row's
   door uses the row's anchor, never the bare landing page", which needs one
   door PER SIBLING. Those cannot both be true at three columns.

   Resolved in favour of three doors, on the arithmetic. Five doors at 375
   measures about 575px of doors, and with the opener and the act row the band
   lands near 1,030px against a 900px cap that no WORK band inherits a licence
   from. So: the ORDER is fixed and the COUNT flexes inside three —
     door 1  the nearest same-kind item, on its own destination
     door 2  the situation it answers where one applies, else the NEXT same-kind
             item, so "one, two or three siblings paint" still holds
     door 3  the evidence
   and slot 4 is the act, beneath a hairline, as the band's one .b-1. Every
   door keeps its own destination, the act stays last because it is the only
   slot that asks the reader for something, and no numeral names the set.     */
function siblingDoor(s) {
  const fig = (s.figures || [])[0];
  return {
    href: dest(s),
    eyebrow: esc(kindDef(s.kind).name),
    head: s.name,
    body: s.line || s.gathering || '',
    /* AD-28. A door with a figure ends on it. A door without one ends on
       nothing — it used to read "No figure published yet", which is a card
       apologising for our records to a reader who was about to click it. */
    foot: fig ? `${fig.value} ${esc(fig.label).toLowerCase()}` : '',
  };
}
function situationDoor(slug) {
  if (!slug) return null;
  const s = SIT.get(slug);
  if (!s) { miss(`onward.json situations["${slug}"] — the situation door cannot be drawn without its canonical href`); return null; }
  return {
    href: s.href, eyebrow: 'The situation', head: s.name,
    /* AD-28. Was "The reading, its published limit, and the gaps named. Our
       work is the answer to it, not the evidence for it." — half a gap counter,
       half an explanation of the site's own division of labour. The door now
       says what is on the other side of it. */
    body: 'The current readings, and what they are measured against.',
    foot: 'Every reading against its limit',
  };
}
const EVIDENCE = {
  /* AD-28. The foot read "Nothing here is unsourced" — a claim about our
     method, on a card. The body kept its subject (the readings) and lost the
     clause about keeping the paper behind them. */
  '/#record': { href: '/#record', eyebrow: 'The evidence', head: 'The record', body: 'Every reading the situation pages are built on, in one place.', foot: 'Every situation, side by side' },
  /* AD-24: was `/#farm`, the homepage teaser band. `/farm` is now a page, and
     this door's own copy ("the five acres this happens on") promises the place
     rather than a paragraph about it. An anchor here would land a reader who
     clicked "the evidence" on a band whose own button is the real destination. */
  '/farm': { href: '/farm', eyebrow: 'The evidence', head: 'Swechha Farm', body: 'The five acres this happens on. The composting, the nursery and the apiary are the teaching material, and they have to actually produce.', foot: 'Five acres, ninety minutes out' },
};
const atFarm = new Set(ONWARD.evidence && ONWARD.evidence.at_farm || []);
const evidenceFor = (slug) => EVIDENCE[atFarm.has(slug) ? '/farm' : (ONWARD.evidence && ONWARD.evidence.default) || '/#record'] || EVIDENCE['/#record'];

function threeDoors({ siblings, situation, evidence }) {
  const out = [];
  if (siblings[0]) out.push(siblings[0].__door ? siblings[0] : siblingDoor(siblings[0]));
  if (situation) out.push(situation);
  else if (siblings[1]) out.push(siblings[1].__door ? siblings[1] : siblingDoor(siblings[1]));
  out.push(evidence);
  return out.slice(0, 3);
}

/* SLOT 1 ON A LANDING PAGE IS THE OTHER KINDS, NOT THE PAGE'S OWN ITEMS. AD-17
   §4's table is explicit about that, and it is also the only reading that works:
   a kind landing's own items are the whole of band 3, so repeating three of them
   in the doors would be the duplication AD-02 spent a review removing from the
   ticker. Two of the other three fit inside three columns, and WHICH TWO IS A
   RULE RATHER THAN A PREFERENCE — the next two kinds cyclically in the frozen
   homepage's order (projects, campaigns, journeys, events). Deterministic,
   count-independent, and every kind ends up pointed at from two others. */
function otherKindDoors(slug) {
  const i = KINDS_ORDER.indexOf(slug);
  return [1, 2].map(n => KINDS_ORDER[(i + n) % KINDS_ORDER.length]).map(s => {
    const k = kindDef(s);
    return {
      /* THE DOOR BODY IS THE ONE-LINE `line`, NOT THE THREE-SENTENCE
         `frame_line`. Two reasons and both matter: BRANDING §5.6's door is an
         eyebrow, a head, a short body and a figure row, and a three-sentence
         body took the #onward band to 978px at 375 against a cap it has no
         licence for; and the frame_line is now the copy inside the `frame`
         band's tab panels on the same page, so a door repeating it is the
         duplication AD-02 spent a review removing. */
      __door: true, href: PATHS[s].url, eyebrow: 'Another kind', head: k.name,
      body: k.line, foot: `Every ${k.name.toLowerCase().replace(/s$/, '')} on one page`,
    };
  });
}

/* ═══ SHARED BAND PIECES ══════════════════════════════════════════════════ */
const wrap = (s) => `    <div class="wrap">\n${s}\n    </div>`;
const dark = (s) => `    <div class="wrap wk-dark">\n${s}\n    </div>`;
/* THE CANVAS IS CHOSEN FROM THE BAND'S DECLARED GROUND, NOT BY HAND, AND THAT
   IS A FIX FOR A CLASS OF BUG RATHER THAN AN INSTANCE OF ONE. The register, the
   reading pair and the four-kinds rows are all frozen on paper tokens, so on a
   dark band they need the .wk-dark statement or they render near-invisible ink
   on near-black. The first build of /work/campaigns put the figure block on the
   #151512 band with a plain .wrap and measured 1.02:1 — the same defect, in the
   same direction, as the ten Yamuna contrast failures. Choosing the wrapper
   from the hex the band already declares means it cannot be got wrong once per
   band per page.

   AND THE OPENER IS NOT WRAPPED AGAIN, WHICH IS THE OTHER HALF OF THIS. The
   shell's opener() CARRIES ITS OWN .wrap — that is the fix for the bug that put
   every band heading at x=0 on all five situation pages. Wrapping it a second
   time does not undo that, it does the opposite: .wrap is
   max-width:1240px;padding:0 var(--gut), and padding on nested boxes is
   additive, so at 375 the outer .wrap puts its content at x=20 and an inner
   .wrap puts the heading at x=40 — a 20px misalignment between every band
   heading and the register beneath it, on every band of every page. Found by
   reading the markup, not by any measurement that was running: contrast,
   overflow, height and adjacency were all green while it was there. Which is
   §9.1's own lesson arriving from the other direction — MEASURE THE THING YOU
   WOULD NOT THINK TO MEASURE, and horizontal position is still the one.

   So a band body is an ARRAY whose first element is the opener. The opener is
   passed through with its own .wrap, and only what follows takes the canvas —
   two stacked .wrap SIBLINGS, which is exactly the shape the shell documents as
   harmless. */
const canvasFor = (hex) => (hex === '#0D0D0B' || hex === '#151512') ? dark : wrap;
function applyCanvas(bands, body) {
  const out = {};
  for (const [id, , hex] of bands) {
    const v = body[id];
    // `top` and `onward` carry their own containers (the picture band and the
    // door grid), so they are passed through untouched.
    // `top`, `statement` and `onward` carry their own containers — the picture
    // bands' frames run to the seam and the door grid is its own object — so
    // they are passed through untouched.
    if (id === 'top' || id === 'onward' || id === 'statement') { out[id] = v; continue; }
    if (!Array.isArray(v)) { out[id] = canvasFor(hex)(v); continue; }
    const rest = v.slice(1).filter(Boolean).join('\n');
    out[id] = rest ? `${v[0]}\n${canvasFor(hex)(rest)}` : v[0];
  }
  return out;
}
const subLabel = (t) => `      <p class="lbl" style="margin:var(--gap-block) 0 14px">${t}</p>`;

/* THE FIGURE BLOCK. The legend states the solid/dotted vocabulary once per band
   rather than tagging every figure, which is how the frozen pages do it. An
   EMPTY figure list is valid output, not an error (schema addendum §8) — the
   band says what it does not have and moves on. */
/* THE SAME BUDGET, THE SAME REMEDY. A reading measures about 140px at 375, so a
   band of eight — which /work/projects reaches, because a row's whole figure set
   lives on the landing page — came out at 1,366px. FOUR ARE SHOWN and the rest
   go into the frozen disclosure, whose summary names what is inside and carries
   no numeral. The legend that states the solid/dotted vocabulary sits above
   both, once per band, so it governs the disclosed figures too. */
/* AD-28. TWO THINGS CAME OFF THIS BLOCK.
   The LEGEND, because it explains the counted/modelled vocabulary and that is
   sourcing method, not work. And the ABSENCE SENTENCE: an empty figure list now
   renders NOTHING. It used to render a named hole — "Not one project on this
   register carries a figure with the span it counts and a source we can name" —
   which is an apology about our records dressed as honesty. Where there is no
   figure the band simply carries no figures. The `absence` parameter is kept in
   the signature and ignored so no call site silently starts passing prose
   somewhere else. */
const FIGURES_VISIBLE = 4;
const figureBlock = (list, absence, tailSummary = 'The rest of the figures') => {
  void absence;
  if (!list.length) return '';
  const head = list.slice(0, FIGURES_VISIBLE), tail = list.slice(FIGURES_VISIBLE);
  return tail.length
    ? `${figures(head)}\n${disclose(`${esc(tailSummary)} ${ARROW}`, figures(tail))}`
    : figures(head);
};

/* THE PROSE ROWS, AND THE PHONE BUDGET THEY RUN INTO. Measured at 375 on
   me-to-we: the band opener is 130.4px and the t3 tiers are 44px top and bottom,
   so 218.4px of every band is fixed cost — leaving 682px of the 900px cap for
   content. A .p-row of written prose measures 187-216px at 375 (mean 202), so
   THREE ROWS FIT AT 606px AND FOUR DO NOT AT 808px. Every item page in the data
   carries four or five.

   The remedy is the frozen disclosure (SITEMPLATE §8.1) doing exactly its stated
   job — keeping a long block off the phone's critical path. Native details, no
   JS, keyboard and screen-reader support for free, a 44px summary, and ZERO
   HEIGHT WHEN CLOSED. The summary names what is inside and CARRIES NO NUMERAL,
   because a count of hidden rows is weight expressed as row count (D-03.2). */
/* AD-27.24. THREE BECOMES TWO, AND IT IS THIS ONE CONSTANT.
   `#done` has to reach 900px at 1440 from 2,726 on Bridge the Gap, and the
   prose is the bulk of it — not the figures. The two rows that stay are the two
   that explain the figures in the rail above them; the rest is provenance, and
   provenance belongs in the provenance disclosure, which is exactly where the
   figures should never have been.
   Deleting the rows outright was rejected: they are sourced, they carry the
   honest caveats (the two-million derivation, the fifty-thousand documented
   count), and figures without their qualifications is the failure BRANDING §4.7
   exists to stop. One click away is not hidden. */
const PROSE_VISIBLE = 2;
const proseRows = (rows, tailSummary) => {
  if (!rows.length) return '';
  const row = (r) => `        <div class="p-row"><p class="lbl">${r.h}</p>
          <div><p class="body">${r.p}</p></div></div>`;
  const head = rows.slice(0, PROSE_VISIBLE), tail = rows.slice(PROSE_VISIBLE);
  const block = (list) => `      <div class="p-rows">\n${list.map(row).join('\n')}\n      </div>`;
  return tail.length
    ? `${block(head)}\n${disclose(`${esc(tailSummary)} ${ARROW}`, block(tail))}`
    : block(head);
};

/* ═══ AD-28 · THE THREE HOLE COMPONENTS ARE DELETED ══════════════════════
   `holeBlock`, `holeFold` and `holeBlockGrouped` all rendered the same thing in
   three arrangements: a list of the things this section cannot yet say, with a
   gap count in the summary. AD-27.24 and W-29 spent a lot of measurement
   deciding how to FOLD them; AD-28 removes the question by removing the
   content. The owner, on the whole family of it: "No need to write explanation
   of why this page is empty etc ... we dont have the numbers....numbers
   missing". A visitor came to read what Swechha does.

   `holes` STAYS IN data/work/** and stays in the build report. It is a genuine
   editorial worklist — it is how the content author knows what to go and find —
   and MISSING/NOTES print it at every build. What changed is that it is no
   longer published to a reader. Nothing was lost; it moved to the place that
   was always the right one for it.

   The `#done` band's condition still counts holes as a reason to render, which
   is deliberate: an item with figures OR done-rows still gets its Impact band,
   and one with only holes now renders the band's other content or, if there is
   none, the band is omitted by the same rule as every other empty band. ══ */

/* AD-27.27. RANK IS ORDER PLUS ONE WEIGHT STEP, AND NOTHING ELSE.
   The client, 22 August: "Add Bupa Foundation. Acuity Knowledge Partners, make
   these two the top partners." There is no partner logo anywhere in this
   repository and BRANDING §7.4 forbids importing foreign trademarks, so rank is
   carried by the two devices the site already has:
     1. POSITION — the two are first in the array and are rendered IN THE DATA'S
        ORDER. A sort here would silently undo the ruling, so there is none, and
        the gate below asserts the lead names came out where the data put them.
     2. ONE WEIGHT STEP — wght 620 -> 780 on the first `funders_lead` rows. No
        size change, no colour change, no rule change.
   Rejected: a logo wall (no assets exist and it imports seven trademarks into a
   design that has spent the whole site refusing exactly that); numbered
   ordinals 1-7 (an ordinal on every funder claims a total ranking of all seven,
   which the owner did not give); a separate "Lead funders" heading (it would
   put the other five under an implied "lesser funders" heading nobody agreed
   to). The caption says the order means something without asserting a category
   — "current", "principal", "major" — that nothing in the record supports. */
const namesBlock = (w, key) => {
  const cols = [['Schools', w.schools], ['Partners', w.partners], ['Funders', w.funders]]
    .filter(([, l]) => (l || []).length);
  if (!cols.length) return '';
  const lead = Number.isInteger(w.funders_lead) ? w.funders_lead : 0;
  if (lead > (w.funders || []).length) {
    rej(key, `"funders_lead" is ${lead} but there are only ${(w.funders || []).length} funders. It names how many of the array's own leading entries are lead, and it cannot exceed the array.`);
  }
  if (lead > 0 && !w.funders_source) {
    rej(key, '"funders_lead" is set with no "funders_source". A rank on a published list is a claim and it carries a source like any other.');
  }
  const li = (t, n, i) => `<li${t === 'Funders' && i < lead ? ' class="wk-lead"' : ''}>${esc(n)}</li>`;
  const grid = `      <div class="wk-names${cols.length === 1 ? ' wk-names-1' : ''}" style="--n:${cols.length}">\n`
    + cols.map(([t, l]) => `        <div><span class="lbl">${t}</span><ul>${l.map((n, i) => li(t, n, i)).join('')}</ul></div>`).join('\n')
    + `\n      </div>`;
  /* AD-28, SECOND PASS. THE FOOT NOTE IS DELETED. It read "Listed in the order
     Swechha names them." — the organisation, on its own website, attributing
     the ordering of its own funder list to itself (§3 category 2), and doing it
     as a note about how the page was compiled (category 5). It explained
     nothing a reader wanted: it did not even describe the one visible
     distinction on the grid, which is the lead emphasis, and the `#done` band
     already says in prose who funds the work now and who funded it before.
     `funders_lead` and its `funders_source` gate are untouched — the data still
     carries the rank and still has to source it; only the sentence goes. */
  return grid;
};

/* The band's own heading named three groups over a list that held one, on every
   page that has the band. It now names only what is actually there. */
const namesHead = (w) => {
  const have = [['schools', w.schools], ['partners', w.partners], ['funders', w.funders]]
    .filter(([, l]) => (l || []).length).map(([t]) => t);
  const list = have.length === 1 ? have[0]
    : `${have.slice(0, -1).join(', ')} and ${have[have.length - 1]}`;
  /* AD-28. "Nobody here is described as a category" was the page explaining its
     own editorial choice. The list is the content. */
  return `${list.charAt(0).toUpperCase()}${list.slice(1)} by name.`;
};

const hasNames = (w) => [(w || {}).schools, (w || {}).partners, (w || {}).funders].some(l => (l || []).length);

const regOf = (list) => regRows(list.map(i => ({
  anchor: i.anchor, name: i.name, line: i.line || i.gathering || '', href: dest(i), duration: i.duration,
})), { duration: list.every(i => i.duration) && list.length > 0 });

/* ═══ AD-18 BAND PIECES — THE FIVE DEVICES THE FIRST PASS DID NOT USE ══════ */

/* THE PHOTOGRAPH BAND. The client's first complaint, measured: the pre-freeze
   prototypes carried 14 / 15 / 14 / 9 / 9 <img> against the 2 or 3 this section
   shipped, of which 2 are the wordmark. So most pages carried ZERO or ONE real
   photograph against nine to fifteen.
   The band's note is required and it is the honest half: a sheet says what the
   frames ARE, and where the frames are not of the thing the page is about it
   says that too (W-9's rule — alt describes what a frame shows and never claims
   what it stands in for). */
const sheetBand = (subject, label, note) => gallerySheet({
  label, frames: subject.gallery, note,
});

/* THE STRATEGY AND ACTIVITIES BAND, AS ONE TAB GROUP.
   Panel 1 is the written method — the prose rows this band already carried.
   Panels 2..n are the named activities, one photograph each. Panel n+1 is the
   route where there is one.
   THE ARITHMETIC IS WHY IT IS TABS AND NOT A GRID. A tab group is as tall as
   its tallest panel, so six destination frames enter the document for the
   height of one. Measured on the first build, /work/journeys/naturescapes'
   `how` band was 1,302px at 375 — a W-1 licensed breach — carrying prose AND a
   six-row route register stacked. Folding both into panels of one group puts
   the same content, plus six photographs, inside the tallest single panel. */
function howTabs(it, url) {
  const panels = [];
  if ((it.how || []).length) {
    panels.push(['How it runs', proseRows(it.how, 'The rest of how it runs')]);
  }
  for (const a of (it.activities || [])) panels.push([a.name, panel(a)]);
  if ((it.route || []).length) {
    const route = it.route;
    panels.push([it.geography ? 'Where it goes' : 'The stops',
      `${it.geography ? `      <p class="lbl" style="margin:0 0 14px">${esc(it.geography)}</p>\n` : ''}${regRows(route.map((r, i) => ({
        anchor: `stop-${i + 1}`, name: esc(r.stop), line: r.note ? esc(r.note) : '', href: `${url}#stop-${i + 1}`,
      })))}`]);
  }
  if (!panels.length) return '';
  /* A group of one is a control with nothing to choose, and it costs 44px to
     say so. One panel renders as itself. */
  return panels.length === 1 ? panels[0][1] : tabs('How it runs', panels);
}

/* THE RANGE ROW. Every endpoint is gated against the figure's own published
   value, so this cannot introduce a number — see REJECTION 11. No derived
   NUMBER is printed either: the geometry is a length, not a figure. */
function scaleBlock(it) {
  const list = (it.scale || []).filter(sc => (it.figures || [])[sc.figure]);
  if (!list.length) return '';
  const top = Math.max(...list.map(sc => sc.high));
  const rows = list.map(sc => {
    const f = it.figures[sc.figure];
    return {
      name: esc(sc.label || f.label),
      value: esc(f.value),
      loPct: (sc.low / top) * 100,
      hiPct: (sc.high / top) * 100,
      aria: [`${f.label}: ${f.value}`, period(f.period)].filter(Boolean).join(', '),
    };
  });
  /* AD-28. THE NOTE IS GONE. It was a source list followed by a sentence about
     how the bar was constructed — a citation and a piece of page-narration, and
     nothing a visitor came for. The bars and the axis are the content. */
  return rangeRow({
    rows,
    axis: ['0', esc(String(top.toLocaleString('en-IN')))],
  });
}
/* The span, for the screen-reader label only. AD-28: an unknown span is silence,
   not a sentence about the span being unknown — same rule as work-shell's
   `period()`, which this mirrors for plain text rather than markup. */
const period = (p) => {
  const s = String(p || '');
  if (!s || /^cumulative, no start year sourced$/i.test(s) || /^period not sourced$/i.test(s)) return '';
  return s.replace(/^cumulative,\s*/i, 'cumulative · ');
};

/* AD-28. `ledgerBlock` IS DELETED — the disclosure and the component under it.
   Its summary read "Every figure on this page, and where it comes from", which
   is the sourcing apparatus named in its own words, and it appeared on twelve of
   the fifteen pages. The figures it restated are still on the page, in the bands
   that publish them. A visitor does not audit us; if we cannot stand behind a
   figure we do not print it, which is a stronger guarantee than an audit trail
   and takes no space on the page. */

/* THE INVITE. AD-17 §4 slot 4 was one act; the client asked for three routes.
   The mailto is the third and it is a SENTENCE, not a button, because /act's
   volunteer sign-up is "not connected yet" and its newsletter input is disabled
   by design (W-7) — so a third button would imply a mechanism that does not
   exist, and the email address is the only route on this site that reaches a
   person. The address is read out of the frozen footer rather than typed. */
const CONTACT = (homeHtml.match(/mailto:([^"]+)/) || [])[1] || '';
if (!CONTACT) rej('home.html', 'no mailto: address in the frozen footer — the invite band has no third route to offer');
const invite = ({ act, second, note, asks }) => inviteRow({
  act, second, asks,
  /* THE NOTE IS ONE CLAUSE, and the length is a budget decision with its
     arithmetic in WORK_CSS: the first version ran to five lines and 112.5px at
     375, on a band that was 78px over its cap. The clause that had to survive is
     the one that stops the page implying a mechanism it does not have.

     AD-27.14. WHERE AN ASK IS PRESENT THE SECOND SENTENCE COMES OFF. "Nothing
     here is a form — write to <the footer's general address>" was the honest
     thing to say when the page's only route to a person was a navigation to
     /act; it is now false in both halves. The Ask IS the route, it goes to a
     named person at an @swechha.in address, and telling a reader who has just
     opened it that there is nothing here would be the page contradicting the
     control directly above the sentence. */
  note: (asks && asks.length) ? note
    : `${note} Nothing here is a form &mdash; write to <a class="lk" href="mailto:${esc(CONTACT)}">${esc(CONTACT)}</a>.`,
});

/* ═══ AD-27.14 → AD-27.22 · THE ASK, INSTANTIATED ════════════════════════
   `ask()` itself lives in situation-shell.mjs — lane 1 authored it, and this
   file IMPORTS it rather than carrying a second implementation, which is
   AD-27.56's whole purpose ("to stop four implementations"). The comment in
   that file says work-shell "has no access to this module"; it does, and has
   since AD-18 — work-shell.mjs imports SHARED_PAGE_CSS, disclose and tabs from
   it and emits them into all fifteen pages. Reported to the art director.

   THE SUBJECT LINE IS DERIVED FROM THE ITEM'S OWN NAME, never typed, so the
   owner's inbox can never sort a message under a page that does not exist. The
   path is the item's canonical route, which is also derived. */
const askBlocks = (it) => (it.ask || []).map((a, i) => ask({
  audience: a.audience,
  label: a.label,
  page: it.name,
  path: itemPath(it).url,
  level: i + 1,
}));

/* AD-27.18-A. THE INDEX PAGE'S ASK, built from the same component, the same
   AD-27.17 copy and the same subject-line derivation as the ten detail pages —
   one code path, not a parallel one. The subject's page name is the page's own
   name so the owner's inbox can tell "School enquiry — Projects" (somebody who
   wants the programme) from "School enquiry — Bridge the Gap" (somebody who
   wants that curriculum), and the path is the canonical route. */
const indexAsk = (url) => {
  const r = INDEX_ASK[url];
  if (!r) return [];
  return [ask({ audience: r.audience, label: r.label(), page: r.page, path: url, level: 1 })];
};

/* AD-27.18-A. The two pages that keep a navigating primary get the /act band
   that answers their ask instead of the top of the page. Applied only to a bare
   `/act` — an href that already carries a fragment is somebody's deliberate
   choice and is left alone. */
const deepen = (url, act) => (ACT_ANCHOR[url] && act.href === '/act')
  ? { ...act, href: `/act${ACT_ANCHOR[url]}` } : act;

/* A secondary link survives the Ask only where it is NOT the /about partner
   link AD-27.29 removes. Checked on the href, not the label, because the label
   is what varies ("Partner with us", "Take our volunteers", "Support this
   work") and the href is what is wrong. */
const secondSurvives = (it) => {
  const s = it.invite && it.invite.second;
  return !!(s && s.href && !s.href.startsWith('/about'));
};

/* THE STATEMENT BAND BODY. Passed through untouched by applyCanvas because it
   carries its own containers (the frame runs to the seam, so a .wrap would
   inset it). See the `top`/`onward`/`statement` passthrough there. */
const statementFor = (x) => statementBand({
  line: x.statement.line, under: x.statement.under, frame: x.statement.frame,
});

/* ═══ A. /work — EVERYTHING SWECHHA DOES, IN ONE VIEW ══════════════════════
   W-16. The owner reversed the IA's deletion and gave the page the reason it
   never had: "Sometimes people want to see Swechha's entire work in one view.
   Design it nicely, aesthetically, minimally, it needs to be attractive."

   THE IA'S DIAGNOSIS STILL BINDS AND IT WAS RIGHT. As built, this page was
   homepage band 4 verbatim (four kinds, four lines), plus band 6's head with
   seven rows instead of three, plus band 5's head with the photographs taken
   out. It indexed four pages that the homepage already links by name. A redesign
   that leaves it a union of four registers fails the ruling, so it is not one.

   WHAT MAKES IT ONE VIEW RATHER THAN FOUR LISTS: band 2 is a SINGLE register
   carrying every item in the section — every project, campaign, journey and
   event — with ONE ordinal sequence running through all of them and the kind
   carried as a property of the row rather than as a heading over a group. That
   is the whole inventory as one object, and it exists nowhere else on the site:
   the homepage shows a selection, and each kind page shows a quarter.
   Band 4 is the same move applied to the numbers: every sourced figure in the
   section in one auditable ledger, four tab panels deep, so a reader can hold a
   journey's count against a project's — which no other page lets them do.
   MINIMAL IS SPARE, NOT SPARSE: two registers, one statement, one sheet, and
   no band that repeats another page's argument.                              */
function pageIndex() {
  const all = KINDS_ORDER.flatMap(k => byKind(k));
  const gallery = (ONWARD.index && ONWARD.index.gallery) || [];
  const stmt = (ONWARD.index && ONWARD.index.statement) || null;
  const subject = { gallery, statement: stmt };
  const { bands } = bandsFor('index', subject, '/work');
  /* THE ONE REGISTER. The ordinal runs 01..n across all four kinds, which is
     what makes this one list; the kind rides on the row as the frozen `.tag`
     micro-caps. Count-independent by construction — the register's structure is
     fixed and its membership flexes (BRANDING §5.5), and no total is stated
     (§7.8), so the page never claims how many things Swechha does. */
  /* AND THE ROWS CARRY NO FACT LINE, WHICH IS THE DECISION THAT MAKES THIS PAGE
     NOT A UNION OF REGISTERS. Every one of those lines is on its kind page, one
     click away; repeating twenty-one of them here is precisely what the IA
     diagnosed. What this page is for is the SHAPE of the whole — how many kinds
     of thing there are, what they are called, and how they group — so the row is
     an ordinal, a kind and a name, at register density.
     It is also the only way the band closes on arithmetic. Measured at 375: a
     row with its fact line is 103.7px and twenty-one of them is 2,179px; a row
     with the kind tag alone is 69px and twenty-one is 1,449. Both breach the
     900px cap, because full membership is what the page is (W-1 clause 2), but
     the design decision saves 730px and reads stronger. */
  const oneView = regRows(all.map(i => ({
    anchor: `all-${i.anchor}`, name: i.name, href: dest(i),
    line: `<span class="lbl">${esc(kindDef(i.kind).name.replace(/s$/, ''))}</span>`,
  })));
  /* THE ONE LEDGER, four panels. Every figure in the section, with the item it
     belongs to as its eyebrow — which the kind pages already needed (the first
     build put two identical "60+ journeys organised" side by side). */
  const figPanels = KINDS_ORDER.map(k => {
    const figs = byKind(k).flatMap(i => (i.figures || []).map(f => ({ ...f, owner: i.name })));
    /* AD-28. A kind with no figures shows no figures. The panel used to carry a
       named hole saying so; a tab that opens on a sentence about our
       record-keeping is the specimen this ruling is named for. */
    return [kindDef(k).name, figureBlock(figs, '')];
  });
  const body = {
    top: masthead({
      h1: 'The work', deck: 'Everything Swechha runs, in one place. Projects, campaigns, journeys and events.',
      frame: (ONWARD.index && ONWARD.index.frame) || null,
    }),
    /* AD-28 category 5 runs through every lead on this page and the four kind
       pages. Each one described how the page was assembled — "One list, not
       four ... because that is the only place they appear together", "every
       published figure ... whether it was counted or modelled, and where it
       comes from". None of it is about Swechha's work, and the headings above
       them already say what the bands are. They are deleted, not rewritten:
       repairing a deletion with a new sentence in the same voice is the trap
       AD-28 §3.5 names. */
    everything: [
      opener('everything', 'Everything, in one view'),
      oneView,
    ],
    statement: stmt ? statementFor(subject) : '',
    reach: [
      opener('reach', 'The numbers'),
      tabs('Figures by kind', figPanels),
    ],
    sheet: [
      opener('sheet', 'What it looks like'),
      gallery.length >= GALLERY_MIN ? gallerySheet({
        label: 'The work, from the archive', frames: gallery,
      }) : '',
    ],
  };
  const act = kindDef('journeys').act || { label: 'Book a journey', href: '/act' };
  const kdoor = (slug, foot) => {
    const k = kindDef(slug);
    return { href: PATHS[slug].url, eyebrow: 'The whole kind', head: k.name, body: k.line, foot };
  };
  body.onward = onwardBand({
    /* /work's slot 1 is not "the other three kinds" — every kind is already in
       band 2's register. The two doors are THE TWO MOST-LINKED DESTINATIONS IN
       THE SECTION, which is measured and not preferred: the frozen homepage
       points 8 links at /work/projects and 6 at /work/journeys. */
    doors: [kdoor('projects', 'The most-linked page in the section'), kdoor('journeys', 'Two hours to twelve days'), EVIDENCE['/#record']],
    act, actNote: 'If you would rather start than read, the shortest way in is a walk that takes an afternoon.',
    /* AD-27.18-A. "Book a journey" resolves here. The secondary goes with it:
       the Ask's own tertiary link is /act#partner, which is the destination
       "Partner with us" should always have had (AD-27.29). */
    invite: invite({ act, second: null, asks: indexAsk(PATHS.index.url),
      note: 'If you would rather start than read, the shortest way in is a walk that takes an afternoon.' }),
  });
  return {
    bands, body: applyCanvas(bands, body), sections: sectionsFor(bands), current: 'Work',
    crumbs: crumbsIndex(),
    title: 'The work — Swechha',
    desc: DESC[PATHS.index.url],
  };
}

/* ═══ B. A kind landing — /work/projects, /work/journeys ══════════════════ */
function pageKind(k) {
  const def = kindDef(k);
  const mine = byKind(k);
  const bands = bandsFor('kind', def, `kinds.json/${k}`).bands;
  const url = PATHS[k].url;
  const singular = def.name.toLowerCase().replace(/s$/, '');
  /* THE FIGURES BAND, AND ITS ALLOCATION RULE, STATED ON THE PAGE. A page item
     keeps its own figures on its own page and contributes its LEAD figure here;
     a ROW has no page, so all of its figures live here. That is the honest
     allocation and it is also what keeps this band inside the 900px cap: the
     projects register carries 21 figures in total and 21 readings is a 2,500px
     band at 375. */
  const figs = mine.flatMap(i => (i.page ? (i.figures || []).slice(0, 1) : (i.figures || [])).map(f => ({ ...f, owner: i.name })));
  const others = KINDS.filter(x => x.slug !== k);
  const body = {
    top: masthead({ h1: def.name, deck: def.line, frame: def.frame || null, ancestor: anc('Work', WORK_BAND) }),
    /* AD-18. THE FOUR KINDS AS A TAB GROUP, not a register of "the other three".
       The first build listed the other three as ruled rows, which reads as a
       menu; the client's note is that the pages do not let him interrogate
       anything. A tab per kind puts the four side by side under one head, so the
       distinction between them — which is the only thing this band is for — is
       something a reader compares rather than something we assert. Costs one
       tablist and shows the tallest panel. */
    /* THE LEAD IS NOT THE frame_line, AND IT USED TO BE. The tab group below
       opens on this kind's own panel, whose first paragraph IS `def.frame_line`
       — so the sentence printed twice, forty pixels apart, on three of the four
       kind landings. The copy standard's "avoid saying the same thing twice"
       decides it, and subtraction decides which copy goes: the tabs are the
       band's content and the head is only its label. */
    frame: [
      opener('frame', `What a ${singular} is here`),
      tabs('The four kinds', [def, ...others].map(o => [o.name,
        `<div class="wk-panel"><div><p class="body">${o.frame_line}</p>
        <p class="cap" style="margin-top:12px">${o.line}</p>${o.slug === k ? '' :
          `\n        <p style="margin:16px 0 0"><a class="act" href="${PATHS[o.slug].url}">Every ${o.name.toLowerCase().replace(/s$/, '')} ${ARROW}</a></p>`}</div></div>`])),
    ],
    list: [
      opener('list', 'Every one of them'),
      regOf(mine),
    ],
    weight: [
      opener('weight', 'What it adds up to'),
      figureBlock(figs, ''),
    ],
    statement: hasStatement(def) ? statementFor(def) : '',
    sheet: [
      opener('sheet', 'What it looks like'),
      (def.gallery || []).length >= GALLERY_MIN ? sheetBand(def, `${def.name}, from the archive`) : '',
    ],
  };
  body.onward = onwardBand({
    /* NO SITUATION DOOR ON A LANDING PAGE. §4 clause 3 permits one only where
       the situation page names the SAME SUBJECT, and this page's subject is a
       KIND — no situation page names Projects or Journeys. The per-item
       situation links live on the items, where the claim is actually true. */
    doors: threeDoors({ siblings: otherKindDoors(k), situation: null, evidence: EVIDENCE['/#record'] }),
    act: deepen(url, def.act || { label: 'Get involved', href: '/act' }),
    actNote: 'Reading this page is not the point of it.',
    /* AD-27.18-A. /work/projects and /work/journeys resolve their ask in place;
       any future kind landing that has no Ask keeps a navigating primary and a
       secondary that points at the partnering content rather than at /about. */
    invite: invite({
      act: deepen(url, def.act || { label: 'Get involved', href: '/act' }),
      second: INDEX_ASK[url] ? null : PARTNER_SECOND,
      asks: indexAsk(url),
      note: 'Reading this page is not the point of it.',
    }),
  });
  return {
    bands, body: applyCanvas(bands, body), sections: sectionsFor(bands),
    current: k === 'journeys' ? 'Journeys' : 'Work',
    crumbs: crumbsKind(k), title: TITLE[PATHS[k].url] || `${def.name} — Swechha`, desc: DESC[PATHS[k].url],
  };
}

/* ═══ C. /work/campaigns — the weakest kind, composed honestly ════════════
   Three items, two figures between them, and one detail page. So the page's
   subject is not "our three campaigns" but WHAT EACH ONE PUSHES AGAINST, which
   turns the section's thinnest content into its clearest statement of the
   work-answers-situation reciprocity D-18.2 asked for.                       */
function pageCampaigns() {
  const def = kindDef('campaigns');
  const mine = byKind('campaigns');
  const bands = bandsFor('campaigns', def, 'kinds.json/campaigns').bands;
  const figs = mine.flatMap(c => (c.figures || []).map(f => ({ ...f, owner: c.name })));
  const others = KINDS.filter(x => x.slug !== 'campaigns');
  const body = {
    top: masthead({ h1: def.name, deck: def.line, frame: def.frame || null, ancestor: anc('Work', WORK_BAND) }),
    frame: [
      /* Same duplication as pageKind(): the lead was `def.frame_line` and the
         first tab panel below prints it verbatim. */
      opener('frame', 'A campaign pushes. An event invites.'),
      tabs('The four kinds', [def, ...others].map(o => [o.name,
        `<div class="wk-panel"><div><p class="body">${o.frame_line}</p>
        <p class="cap" style="margin-top:12px">${o.line}</p>${o.slug === 'campaigns' ? '' :
          `\n        <p style="margin:16px 0 0"><a class="act" href="${PATHS[o.slug].url}">Every ${o.name.toLowerCase().replace(/s$/, '')} ${ARROW}</a></p>`}</div></div>`])),
    ],
    against: [
      /* The second half of this lead — "Where a situation page names the same
         subject, the line above the name goes to it" — explained the page's own
         linking rule to the reader. The first half is an argument about
         campaigns and stays. */
      opener('against', 'What each one pushes against', 'A campaign is only as clear as the thing it is against.'),
      march(mine.map(c => {
        const s = c.situation ? SIT.get(c.situation) : null;
        return {
          anchor: c.anchor, name: c.name, href: c.page ? dest(c) : null, line: c.line,
          pre: s ? `<a href="${s.href}">${esc(s.hook || `Runs against ${s.name}`)} ${ARROW}</a>` : '',
        };
      })),
      /* AD-28. The sub-label counted the band's own contents two ways ("The
         only two figures the campaigns have" / "What the campaigns can count").
         Both are the page talking about itself, and the second is a hedge. */
      figureBlock(figs, ''),
    ],
    statement: hasStatement(def) ? statementFor(def) : '',
    sheet: [
      opener('sheet', 'What it looks like'),
      (def.gallery || []).length >= GALLERY_MIN ? sheetBand(def, 'Campaigns, from the archive') : '',
    ],
  };
  body.onward = onwardBand({
    doors: threeDoors({ siblings: otherKindDoors('campaigns'), situation: null, evidence: EVIDENCE['/#record'] }),
    act: deepen(PATHS.campaigns.url, def.act || { label: 'Plant with us', href: '/act' }),
    actNote: 'A campaign is people turning up. That is the only figure it really has.',
    /* AD-27.18-A. "Plant with us" is one person turning up in the rain, not one
       of the four audiences, so it stays a link — but it lands on /act#hands,
       the band that answers it, instead of the top of a 10,072px page. */
    invite: invite({
      act: deepen(PATHS.campaigns.url, def.act || { label: 'Plant with us', href: '/act' }),
      second: PARTNER_SECOND,
      note: 'A campaign is people turning up. That is the only figure it really has.',
    }),
  });
  return {
    bands, body: applyCanvas(bands, body), sections: sectionsFor(bands), current: 'Work',
    crumbs: crumbsKind('campaigns'), title: TITLE[PATHS['campaigns'].url] || `${def.name} — Swechha`, desc: DESC[PATHS['campaigns'].url],
  };
}

/* ═══ D. An item detail page — THE CLIENT'S SIX-PART SPINE ════════════════
   The h1 is a CONSTANT NAMING THE ITEM (D-10.2), never a reading.
   Bands, in his order: what we do · what it sets out to do · strategy and
   activities · who it is for · impact · the photographs · who it is with · get
   involved. Every one of them is present only if the data supports it, and
   every absence is named in the build report.                                */
function pageItem(it) {
  const def = kindDef(it.kind);
  const w = it.with || {};
  const url = itemPath(it).url;
  const { bands } = bandsFor('item', it, it.__key);

  let route = it.route || [];
  const withdrawn = ROUTE_NOTES_WITHDRAWN.get(it.__key);
  if (withdrawn && route.length) {
    note(`${it.__key}: route notes suppressed — ${withdrawn}. The stops are listed plainly.`);
    route = route.map(r => ({ stop: r.stop }));
  }
  const itForHow = { ...it, route };

  const body = {
    top: masthead({
      h1: it.name, deck: it.deck, frame: it.frame || null,
      ancestor: anc(def.name, PATHS[it.kind].url),
    }),
    /* 1 — WHAT WE DO. The description, the reading pair, and the published span
       set as a span. The scale row is the one thing here that is new, and it is
       new only in the sense that a range that was already published as
       "100-150" is now drawn as one. */
    /* AND IT IS AN ASYMMETRIC SPLIT, NOT A STACK. This is the second half of the
       answer to "this use of black and white blocks is getting to make pages
       boring", and it is the half that needs no new photograph: the frozen band
       6 composition puts written content in columns 1-5 and the readings in
       7-12, so the band has a vertical axis running down the middle instead of
       being a centred block of the same width as every other band. The frozen
       page does this deliberately — its own comment says weight is carried by
       TREATMENT — and `done` below takes the same split FLIPPED, so two
       consecutive type bands do not share an axis. Below 900 both collapse to
       one column and the picture, where there is one, goes first. */
    what: [
      opener('what', 'What we do', it.line || ''),
      splitBand({
        /* THE DECK IS NOT REPEATED HERE, and the first version of this band did
           repeat it: masthead() already sets `deck` under the h1 two hundred
           pixels above. Measured the cost at 375 on bridge-the-gap — the `what`
           band went 757.6 -> 932.8, and 175 of those pixels were a paragraph the
           reader had just finished. Same defect W-8 fixed on /work's masthead. */
        /* AD-28. The fallback used to be a `.p-cite` promising that every
           figure carries a span and a source — a statement about our method,
           standing in the space a range chart would have used. Where there is no
           range to draw, the column is empty. */
        left: scaleBlock(it),
        frame: (it.statement && it.statement.frame && !hasStatement(it)) ? it.statement.frame : null,
        right: figureBlock(it.figures || [], ''),
      }),
    ],
    /* 2 — WHAT IT SETS OUT TO DO. */
    aim: [
      opener('aim', 'What it sets out to do'),
      doRows(it.aims || []),
    ],
    /* 3 — STRATEGY AND ACTIVITIES, as one tab group. */
    how: [
      opener('how', 'Strategy and activities'),
      /* AD-28. The fallback was a named hole saying the method is not written
         down anywhere. The band's own condition already requires method content,
         so the branch was near-unreachable; now it renders nothing. */
      howTabs(itForHow, url) || '',
    ],
    /* 4 — WHO IT IS FOR. */
    who: [
      opener('who', 'Who it is for'),
      doRows(it.who || []),
    ],
    /* 5 — IMPACT. AD-27.23 → AD-27.26, AND IT IS THE CLIENT'S LOUDEST NOTE:
       "Formating is incorrect, make it crisp and simpler. The section needs to
       be small. May be follow [the impact] page impact band style in all
       project impacts."

       MEASURED BEFORE THE REWRITE, so the fix has a number on it. /impact's
       reference band puts FOUR SOURCED FIGURES IN 164px at 1440. This band was
       2,726px on Bridge the Gap — 16.6x the reference — and it showed ZERO
       figures: all five were collapsed inside <details class="dx">. A band
       titled "Impact" that renders no numbers is the defect, and "formatting"
       was a generous word for it. All nine item pages had the same structure.

       THE BAND IS NOW, IN ORDER:
         the opener
         the FIGURE RAIL, at full .wrap measure, above the prose
         at most TWO prose rows, the rest behind the frozen disclosure
         the named holes, VISIBLE — W-1 refused to put those behind a control,
           because naming a hole is content
         the provenance ledger, behind its own disclosure, now correctly named:
           "Every figure on this page, and where it comes from" is the right
           summary for a ledger of methods and sources. It was the wrong place
           for the figures themselves.

       AND THE SPLIT IS GONE (AD-27.25 rule 1). splitBand({flip:true, ...}) put
       this content into .w7-pj-reg — 5 of 12 columns, 464.3px — with a 562px
       empty gutter beside it, and a .p-row inside that column left the prose
       track 49.7px on Bridge the Gap and 0px on ME to WE. The shell's own
       comment already held the verdict: "A split with nothing in its second
       column is not a split — it is a 5-column text block, which is 41% of the
       measure and unreadable." The band then shipped prose PLUS a second nested
       grid into that same block, on nine pages. Rule 2 (in WORK_CSS) makes the
       inner row stack unconditionally so this cannot recur anywhere else. */
    done: [
      /* AD-28. The lead promised "what it cannot yet say"; the holes fold
         delivered it and the ledger disclosure audited the figures. All three
         are gone. What is left is the band the client asked for: the figures,
         then what they mean, and nothing about our filing. */
      opener('done', 'Impact'),
      figureRail(it.figures || []),
      proseRows(it.done || [], 'The rest of the record'),
    ],
    /* 6 — THE PHOTOGRAPHS. */
    statement: hasStatement(it) ? statementFor(it) : '',
    sheet: [
      opener('sheet', 'What it looks like'),
      /* AD-28. `gallery_note` is no longer published either. Every value it
         carried in the data was a sentence about dates we do not have or frames
         we could not source. A contact sheet is looked at, not explained. */
      (it.gallery || []).length >= GALLERY_MIN ? sheetBand(it, `${it.name}, from the archive`) : '',
    ],
    with: [
      opener('with', 'Who it is with', namesHead(w)),
      namesBlock(w, it.__key),
    ],
  };

  const act = it.act || def.act || { label: 'Get involved', href: '/act' };
  /* AD-18 · W-17 IN THE DOORS. An event that belongs to this item is NEARER
     than a sibling of the same kind — it is this work happening in public — so
     it takes slot 1 where one exists. The owner's ruling is that the kinds are
     not silos; a door is where the page has to show it. No parent is invented,
     so most items have none and slot 1 is a sibling exactly as before. */
  const childEvents = items.filter(e => e.kind === 'events' && e.belongs_to === it.slug);
  for (const e of childEvents) note(`${it.__key}: "${e.name}" belongs to this item (W-17), so it takes slot 1 of the cross-sell band.`);
  body.onward = onwardBand({
    doors: threeDoors({
      siblings: [...childEvents, ...byKind(it.kind).filter(s => s.slug !== it.slug && s.page)],
      situation: situationDoor(it.situation),
      evidence: evidenceFor(it.slug),
    }),
    act,
    actNote: 'One thing to do about this, and it is the only slot on the page that asks you for anything.',
    invite: invite({
      act,
      /* AD-27.29. "Partner with us -> /about" IS REPLACED BY THE ASK, on all
         nine pages, and the reason is worth stating precisely: `/about`
         contains ZERO partnering content. Its bands are top, says, since, team,
         board, legible, act, and the only occurrence of the word "partner" in
         the whole file is a footer link. The partnering content is at
         `act.html#partner`, which is now every Ask's tertiary link.
         A SECONDARY THAT IS NOT THE /about LINK SURVIVES. farm-school's "The
         farm itself" and influence's "Apply for a fellowship" are real
         destinations with real content; this ruling removes a link that went
         somewhere wrong, not every link. */
      second: askBlocks(it).length
        ? (secondSurvives(it) ? it.invite.second : null)
        : ((it.invite && it.invite.second) || { label: 'Partner with us', href: '/about' }),
      asks: askBlocks(it),
      note: (it.invite && it.invite.note) || 'One thing to do about this, and it is the only slot on the page that asks you for anything.',
    }),
  });
  return {
    bands, body: applyCanvas(bands, body), sections: sectionsFor(bands),
    current: it.kind === 'journeys' ? 'Journeys' : 'Work',
    crumbs: crumbsFor(it),
    title: `${it.name} — Swechha`, desc: descFor(it),
  };
}

/* ═══ E. /work/events — the hardest brief in the section ══════════════════
   Four names and nothing else, for all four. Solved by changing what the page
   is about: not four events, but what happens when Swechha goes public. NO
   "Upcoming" band, NO email capture form, and no promise of dates that must not
   exist — all three of which events-landing.html does today.                 */
function pageEvents() {
  const def = kindDef('events');
  const mine = byKind('events');
  const bands = bandsFor('events', def, 'kinds.json/events').bands;
  const body = {
    top: masthead({ h1: def.name, deck: def.line, frame: def.frame || null, ancestor: anc('Work', WORK_BAND) }),
    /* AD-18. THE CONTRAST BETWEEN ONE DATED EVENT AND THREE UNDATED ONES IS
       NOW THE PAGE. Yamunotsav has nine editions, one venue and one date the
       owner supplied; the other three have a name and a line. The old page was
       four uniform blanks and read as an omission. Four rows where one carries
       a span, a venue and a note about why that date matters, and three say
       plainly that nothing is written down, reads as a record with a hole in it
       — which is what it is, and is far stronger.
       The dated row's `when` is set as its own ruled block under the name: the
       span, the venue, and the note. NO FIGURE IS SET HERE — the edition count
       is a reading and goes through the figure gate on the row's own terms. */
    record: [
      /* The third sentence — "One of the four has a date somebody wrote down;
         the other three do not, and the difference is the page" — counted the
         band's own contents and made the page's gaps its subject.
         AD-28, SECOND PASS: the second sentence went the same way. "A record of
         what we do in public, not a calendar of what is next" restated the
         heading and then explained an absence, which §2.3 forbids on any page.
         One sentence of fact is left, and it is the confident one. */
      opener('record', 'On the record', 'Every one of these has been run.'),
      displayRows(mine.map(e => {
        const st = e.situation ? SIT.get(e.situation) : null;
        const parent = e.belongs_to ? items.find(x => x.slug === e.belongs_to) : null;
        /* THE ONE LICENSED INLINE CROSS-SELL (AD-17 §4, last clause) — and it
           now has two possible subjects, in a fixed order. A PARENT OUTRANKS A
           SITUATION, because "this happens under We for Yamuna" is a fact about
           our own work and "runs against the Yamuna" is a fact about the world:
           the nearer relationship goes first, which is the same ordering rule
           the whole cross-sell band uses. Only ONE renders; two hooks above one
           name is the duplication AD-02 spent a review removing. */
        const pre = parent
          ? `<a href="${dest(parent)}">Part of ${esc(parent.name)} ${ARROW}</a>`
          : (st ? `<a href="${st.href}">${esc(st.hook || `Runs against ${st.name}`)} ${ARROW}</a>` : '');
        /* Colour comes from .wk-when, stated for BOTH grounds in WORK_CSS. The
           first version set it inline in --fg-2 / --fg-3 and measured 1.51:1 on
           #F3F2F0 at every width — the same defect this file has now caught
           four times, arriving because an inline style cannot inherit a canvas. */
        const when = e.when ? `<span class="lbl wk-when">`
          + [e.when.editions && e.when.years ? `<b>${esc(e.when.editions)} editions &middot; ${esc(e.when.years)}</b>` : (e.when.years ? `<b>${esc(e.when.years)}</b>` : ''),
             e.when.day ? `<i>${esc(e.when.day)}</i>` : '', e.when.venue ? `<i>${esc(e.when.venue)}</i>` : '']
            .filter(Boolean).join('')
          + `</span>${e.when.note ? `<span class="cap wk-when-n">${esc(e.when.note)}</span>` : ''}` : '';
        /* AD-28. `when.source` is no longer printed beside the date. It still
           has to be present in the data — the date gate refuses an unsourced
           one — but "owner 2026-08-21" under an edition count tells a visitor
           nothing about the event. */
        return { name: e.name, line: `${e.gathering}${when}`, anchor: e.anchor, pre };
      }), { ordinals: false, anchors: true }),
    ],
    statement: hasStatement(def) ? statementFor(def) : '',
    sheet: [
      opener('sheet', 'What it looks like'),
      (def.gallery || []).length >= GALLERY_MIN ? sheetBand(def, 'Events, from the archive') : '',
    ],
  };
  body.onward = onwardBand({
    doors: threeDoors({ siblings: otherKindDoors('events'), situation: null, evidence: EVIDENCE['/#record'] }),
    act: deepen(PATHS.events.url, def.act || { label: 'Volunteer with us', href: '/act' }),
    /* AD-28. Was "There is no date on this page to hold you to, and no list here
       to join. Dates go out on the four accounts..." — two clauses of what this
       page does not have, then the one clause that tells a reader where to
       actually look. Subtract, do not rewrite: the useful clause stands alone. */
    actNote: 'Dates go out on the four accounts at the foot of this page.',
    /* AD-27.18-A. "Volunteer with us" is an individual action and not one of the
       four audiences (AD-27.56 forbids a fifth), so it keeps navigating — to
       /act#hands, which is where /act's own WAYS table files this exact label
       and where the row pointing back to this page is printed. */
    invite: invite({
      act: deepen(PATHS.events.url, def.act || { label: 'Volunteer with us', href: '/act' }),
      second: PARTNER_SECOND,
      note: 'Dates go out on the four accounts at the foot of this page.',
    }),
  });
  return {
    bands, body: applyCanvas(bands, body), sections: sectionsFor(bands), current: 'Work',
    crumbs: crumbsKind('events'), title: TITLE[PATHS['events'].url] || `${def.name} — Swechha`, desc: DESC[PATHS['events'].url],
  };
}

/* ═══ PLAN ════════════════════════════════════════════════════════════════
   FIVE landings and n item pages. /work is back (W-15) with a different job:
   everything Swechha does in one view, which is what its band 2 now is.      */
const plan = [];
plan.push({ ...PATHS.index, ...pageIndex() });
for (const k of KINDS_ORDER) {
  if (!KINDS.find(x => x.slug === k)) continue;
  plan.push({ ...PATHS[k], ...(k === 'campaigns' ? pageCampaigns() : k === 'events' ? pageEvents() : pageKind(k)) });
}
for (const it of items) if (it.page) plan.push({ ...itemPath(it), ...pageItem(it) });

for (const p of plan) {
  const seg = p.url.split('/');
  const isLanding = seg.length === 3 && KINDS_ORDER.includes(seg[2]);
  registerAnchors(p.url, p.bands, isLanding
    ? items.filter(i => i.kind === seg[2]).map(i => i.anchor)
    : []);
}
/* Route stops are anchors on their own item page, and the band list is the one
   that page ACTUALLY got — the old code passed a fixed `B.item`, which would
   register bands a page with omitted bands does not have. */
for (const p of plan) {
  const it = items.find(i => i.page && itemPath(i).url === p.url);
  if (it && (it.route || []).length) {
    registerAnchors(p.url, p.bands, it.route.map((_, i) => `stop-${i + 1}`));
  }
}

checkDescriptions();

/* ═══ REPORT BEFORE THE GATES ═════════════════════════════════════════════
   "The data is not there yet" is a different answer from "the data is wrong",
   and whoever reads this needs both.                                        */
if (NOTES.length) {
  console.log(`\nBUILD NOTES — ${NOTES.length}:`);
  for (const n of NOTES) console.log(`  · ${n}`);
}
if (MISSING.length) {
  console.log(`\nMISSING DATA — ${MISSING.length} item(s). Reported, never invented, never stubbed:`);
  for (const m of MISSING) console.log(`  · ${m}`);
}
if (REJECT.length) {
  console.error(`\nREFUSING TO WRITE: ${REJECT.length} data-shape rejection(s).`);
  for (const r of REJECT) console.error(`  ✗ ${r}`);
}

/* ═══ BUILD ═══════════════════════════════════════════════════════════════ */
const sh = workShell();
const built = [];
let problems = REJECT.length;

for (const p of plan) {
  const r = await buildPage({
    file: p.file, url: p.url, title: p.title, desc: p.desc, bands: p.bands, crumbs: p.crumbs,
    sectionFor: (id) => {
      const b = p.body[id];
      if (b == null) { rej(p.url, `band "${id}" has no content`); problems++; return ''; }
      return b;
    },
    sections: p.sections, current: p.current, sh,
  });
  if (r.problems.length) {
    console.error(`\nREFUSING TO WRITE ${p.file}:`);
    for (const x of r.problems) console.error(`  ✗ ${x}`);
    problems += r.problems.length;
  }
  built.push({ ...p, html: r.html, chain: r.chain });
}

console.log('\nGROUND CHAIN (composited, per page)');
for (const b of built) console.log(`  ${b.url.padEnd(34)} ${b.chain.map(c => c[2]).join(' -> ')}`);

/* ═══ THE ASK GATE — AD-27.18-A ══════════════════════════════════════════
   A MISS THE CLIENT HAD TO FIND IS WORTH A BUILD GATE. AD-27.22's four
   assertions all check an Ask that IS on the page; not one of them could see
   the defect he found, which is an Ask that is ABSENT — a primary button still
   navigating to /act under a label the Ask exists to answer. Two assertions,
   both section-wide, both over the rendered HTML rather than the data, because
   the rendered HTML is the thing a reader clicks.

   1. NO NAVIGATING PRIMARY UNDER AN ASK'S OWN LABEL. The forbidden label set is
      DERIVED, not typed: it is every label that any Ask anywhere in the section
      actually carries. So the day somebody adds a page whose primary reads
      "Bring your school" and forgets the Ask, this stops the build — and the
      day an Ask's label is reworded, the gate follows it with no edit here.
   2. NO "PARTNER" LINK AT /about. AD-27.29: /about has no partner content and
      never did; the partnering content is at /act#partner. The check is on the
      pair (word, destination) so the footer's legitimate "About Swechha" link
      is untouched and only the wrong one is caught.

   THE EXEMPTION LIST IS NAMED, AND IT IS NOT A FREE PASS. Exactly one label
   collides: "Plant with us" is Monsoon Wooding's INSTITUTION Ask — an
   organisation that wants a planting — and it is also /work/campaigns' primary,
   where the reader is one person turning up in the rain and the page says so
   ("A campaign is people turning up"). Handing that reader a Partnership body
   that opens "Organisation:" mis-sorts them by construction, which is the same
   argument ASK_PLACEMENT already records for me-to-we and influence. So the two
   individual-action primaries are exempted BY NAME — and the exemption costs
   them something: an exempted primary must land on a NAMED /act band, never on
   the bare page, which is the "still lands at a page" defect one degree weaker.
   An exemption that stops matching is a failure too, so the list cannot rot. */
const NAVIGATING_PRIMARY = {
  '/work/campaigns::Plant with us':
    'an individual planting, not the institutional one Monsoon Wooding\'s Ask answers (AD-27.56: no fifth audience)',
  '/work/events::Volunteer with us':
    'an individual volunteering, which is not one of the four audiences (AD-27.56)',
};
const askLabels = new Set(
  built.flatMap(b => [...b.html.matchAll(/<summary class="b b-\d ask-s">([^<]*)/g)].map(m => m[1].trim()))
    .filter(Boolean),
);
const askGateFailures = [];
const exemptionsUsed = new Set();
for (const b of built) {
  const body = b.html.split('<footer')[0];
  for (const m of body.matchAll(/<a class="b b-1"[^>]*href="([^"]*)"[^>]*>([^<]*)/g)) {
    const [, href, raw] = m;
    const label = raw.trim();
    const key = `${b.url}::${label}`;
    if (Object.prototype.hasOwnProperty.call(NAVIGATING_PRIMARY, key)) {
      exemptionsUsed.add(key);
      if (!/^\/act#\w/.test(href)) {
        askGateFailures.push(`${b.url}: "${label}" is exempt from resolving in place (${NAVIGATING_PRIMARY[key]}), `
          + `but it navigates to ${href} — the top of a 10,072px page. An exempt primary must land on the `
          + '/act band that answers it (#start, #give, #hands, #standing, #partner).');
      }
      continue;
    }
    if (askLabels.has(label)) {
      askGateFailures.push(`${b.url}: the primary CTA "${label}" NAVIGATES to ${href}. `
        + 'That label is an Ask elsewhere in this section, so it is an ask one of the four '
        + 'audiences covers and it must resolve in place (AD-27.14 / AD-27.18-A). '
        + 'Give the page an Ask, or rename the control to something that is not an ask.');
    }
  }
  for (const m of body.matchAll(/<a[^>]*href="(\/about[^"]*)"[^>]*>([^<]*)/g)) {
    if (/partner/i.test(m[2])) {
      askGateFailures.push(`${b.url}: "${m[2].trim()}" links to ${m[1]}. AD-27.29: /about carries `
        + 'zero partnering content — its bands are top, says, since, team, board, legible, act. '
        + 'The partnering content is at /act#partner.');
    }
  }
}
for (const key of Object.keys(NAVIGATING_PRIMARY)) {
  if (!exemptionsUsed.has(key)) {
    askGateFailures.push(`the navigating-primary exemption "${key}" matched nothing this build. `
      + 'Either the control was renamed or the page dropped it — delete the exemption rather than '
      + 'leaving a licence lying about for a label somebody may reuse.');
  }
}
if (askGateFailures.length) {
  console.error(`\nREFUSING TO WRITE: ${askGateFailures.length} Ask/partner-routing failure(s).`);
  for (const f of askGateFailures) console.error(`  ✗ ${f}`);
  problems += askGateFailures.length;
}
console.log(`\nASK GATE — ${askLabels.size} distinct Ask label(s) in the section, `
  + `${built.filter(b => /<details class="ask"/.test(b.html)).length} of ${built.length} pages resolve an ask in place, `
  + `${Object.keys(NAVIGATING_PRIMARY).length} named exemption(s) all landing on an /act band; `
  + `${askGateFailures.length} routing failure(s).`);

/* ═══ THE LINK GATE ══════════════════════════════════════════════════════ */
const links = new Links({
  routes, anchors,
  // The frozen footer's own P-1 debt, extracted verbatim and explicitly out of
  // this brief (link-contract §4). Counted, so a NEW one anywhere trips the gate.
  inheritedHash: (sh.FOOTER.match(/href="#"/g) || []).length,
  inheritedDesign: [...new Set((sh.FOOTER.match(/href="(\/design\/[^"]*)"/g) || []).map(s => s.slice(6, -1)))],
});
for (const b of built) links.collect(b.url, b.file, b.html);

const sum = links.summary();
console.log('\nLINK MANIFEST');
console.log(`  ${sum.hrefs} href attributes · ${sum.distinct} distinct destinations`);
for (const [k, v] of Object.entries(sum.byVerdict).sort()) console.log(`    ${k.padEnd(26)} ${v}`);
if (links.failures.length) {
  console.error(`\nREFUSING TO WRITE: ${links.failures.length} link failure(s).`);
  for (const f of links.failures.slice(0, 60)) console.error(`  ✗ ${f.page}  ${JSON.stringify(f.href)}  ${f.verdict}`);
  problems += links.failures.length;
}

if (sh.bad > 0) {
  console.error(`\nREFUSING TO WRITE: ${sh.bad} extraction assertion(s) failed. The ranges moved — re-find them, do not delete the assertion.`);
  problems += sh.bad;
}

if (problems > 0) { console.error(`\n${problems} gate failure(s). Nothing was written.`); process.exit(1); }
if (DRY) { console.log('\n--dry: every gate passed, nothing written.'); process.exit(0); }

for (const b of built) {
  writePage(OUT_DIR, b.file, b.html);
  console.log(`WROTE ${b.file.padEnd(34)} ${b.html.length.toLocaleString('en-IN').padStart(9)} bytes  ->  ${b.url}`);
}
links.write(LINKS_OUT);
console.log(`WROTE ${LINKS_OUT}`);
const itemPages = built.filter(b => b.url.split('/').length === 4).length;
/* W-21. "Every gate green" was FALSE while the consent bar was empty, and a build
   agent was right to call it out: a gate that has been deliberately emptied is not
   a gate that passed, and a build must never overstate what it checked. So the
   line now states what is enforced and what is cleared by ruling, and it names any
   gate carrying an empty list rather than counting it as green. */
const CLEARED = CONSENT_FLAGGED.length === 0
  ? ' Consent gate CLEARED BY RULING (W-14), not enforced — every other gate green.'
  : ' Every gate green.';
console.log(`\n${built.length} page(s) — ${built.length - itemPages} landings, ${itemPages} item pages.${CLEARED}`);
console.log('  The count is read off "page: true", never hardcoded — it was 13 until Influence earned its page.');
