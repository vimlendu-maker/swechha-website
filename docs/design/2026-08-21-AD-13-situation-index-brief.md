# BRIEF — Art director, THE SITUATION INDEX (the "Now" destination)

**Date:** 21 August 2026
**Deliverable:** the **design layout and section architecture** for one page. **A document,
not a build.** You do not write CSS, you do not edit any file in `public/design/`, and you do
not touch `app/`. Your output is `docs/design/2026-08-21-AD-13-situation-index.md`.
**Remit:** the page's information architecture, its band sequence, the composition of each
band, and its SEO surface. Not a redesign of the language — the language is frozen and you
inherit it.

**Client instruction, 21 August, and it governs your scope:**

> *"Just have the design layout at this stage, with defined sections etc. Ideally it should
> populate better well once individual situation pages are populated. Yet the page layout can
> be tentatively decided."*

So: **sections and layout are the deliverable; final editorial copy is not.** You specify
what each band is, what it holds, how it is composed and how it behaves — and for copy you
give the *slots*, the labels and structural strings needed to read the layout, plus enough
specimen text to judge the composition. You do not write the finished editorial prose for
five situations whose own pages do not exist yet, because that copy will be derived from
those pages when they are built.

**The layout is tentative by instruction. Say so in your document, and say which parts you
expect to move** once the first situation pages land. A layout that admits which of its
decisions are provisional is more useful here than one that pretends to be final.

---

## 0. What this page is

The frozen homepage's `Now` link points at `public/design/v3/intelligence.html` in all three
of its nav surfaces — header, phone SECTIONS panel, and the scroll chip rail — plus the six
ticker cells, two Record doors and the footer. **That file is the situation index**, and by
inbound-link count it is the most-pointed-at inner page on the site.

It is the page a reader reaches after the homepage has shown them one reading and said *"The
full instrument →"*. It has to be the apparatus behind the whole set, not behind one number.

**It is also the page that defines the site's vocabulary for every page after it.** The
colour rules, the four state words and the window grammar are *taught* here. Get them wrong
here and every situation page inherits the error.

---

## 1. Read these first, in this order. They outrank this brief.

1. **`DECISIONS-2026-08-20-homepage.md`** — the client ruling ledger, D-01 → **D-11.4**.
   This file wins over every other document including this one. **D-11.1–D-11.4 are new and
   are yours**; read them before anything else here.
2. **`BRANDING-2026-08-21-frozen-language.md`** — the design language as actually built.
   §5 is the fifteen solved components, §7 is the forbidden list, §10 is the build-page-N+1
   checklist. **Read it in full.** Every composition you propose is made of things in §5 or
   is justified in writing as a new component.
3. **`2026-08-21-SITUATION-PAGE-BRIEF.md`** — the brief for the Air *detail* page. Its §2.2
   ("what the homepage already promises") and §3 (the data reality) bind you too. Its §1 is
   an audit of a *different* file — do not confuse it with §3 below.
4. **`2026-08-21-SOURCE-FACTS.md`** — the fact base. **Read §6 of this brief before you
   trust it for a reading.**
5. **`HANDOFF-2026-08-21-resume-here.md`** — where the project stands.

---

## 2. Settled. Do not reopen.

The four rulings of 21 August, in full in the ledger as D-11.1–D-11.4:

| | ruling |
|---|---|
| **D-11.1** | **The orders band is cut.** It presented six court and tribunal filings with docket numbers, none checkable anywhere in the repo, one of which reused the AQI figure 412 as a case number. Keep the *idea* as a named future section so the composition reserves its place. Do not design its contents. Do not invent a citation, a docket number, an authority or a holding sentence anywhere on this page. |
| **D-11.2** | **The frozen six, windows enforced.** Air · Yamuna · Heatwave · Forest Fires · Forest Loss · Climate Event. STP, Night noise and Out of River are gone. **Heatwave's window is shut so it does not render at all** — §4.2 is absolute: no dormant cell, no OUT OF SEASON row, no reveal toggle. **The page shows five today, six in season**, and a changing count must not read as a defect. The prototype's reader-facing "All 9, in and out" control is retired. |
| **D-11.3** | **This becomes `/now`.** The shipped `app/now/page.tsx` card list is retired. Same path, no redirect, nav label stays **Now**, "Environmental Intelligence" survives only as the footer's destination label. `<title>` uses the site's em dash, not a hyphen. |
| **D-11.4** | **First full SEO layer on the site.** Canonical, `openGraph` restated in full, the repo's first `opengraph-image`, and JSON-LD: `ItemList`, `Dataset`/`Observation`, `BreadcrumbList`, `WebSite`+`SearchAction`. |

And from the situation phase, which bind you unchanged:

- **D-10.1 — no reading may carry LIVE.** Nothing is wired; runtime deps are `gray-matter`,
  `marked`, `next`, `react`, `react-dom`, `zod`. The state vocabulary is exactly four words —
  **LIVE / PERIODIC / DEMO DATA / OUT OF SEASON** — shown at all times, never conditionally.
  The class names `live/periodic/demo/closed` **never become copy**.
- **D-10.2 — a situation page's headline is a constant, not a reading.** See §5 Q1: whether
  that binds the *index* is the one composition question genuinely open to you.
- **D-10.3 — rebuilt shell, not retrofit.** Same ruling applies here for the same reason.
- **D-10.4 — the frozen homepage is authoritative** over every detail page.

---

## 3. The audit of `intelligence.html` — what you inherit

887 lines. **752 of them (84.8%) are its own `<style>` block**, and roughly a fifth of that
CSS matches zero nodes. Audited 21 August against `home.html` and the branding doc.
**~20–25% survives a rebuild.** Full findings are the two audits behind this brief; the
parts that shape your composition:

**The identity is safe.** All 22 colour tokens and all 9 type-scale values are
**byte-identical** to the frozen page, as is the font link. You are not re-picking colours or
type.

**Nothing structural is there.** No tier system — one `--pad` on every band, which the
branding doc calls the root defect the tiers exist to correct; zero `.t1`–`.t4`.
**`.im-head`: zero occurrences**, replaced by two private openers (`.det-head` ×4,
`.idx-top` ×1). **17 `.wide`, 0 `.wrap`** — every band of prose on the 1,580px index
container, where the frozen page is 23 `.wrap` to 2 `.wide`. No `--bar-h`/`--nav-h` (header
height hardcoded twice), no `scroll-padding-top`, no `--hit`, no skip link, no `<main>`, no
SECTIONS panel. **`.navscroll` is `display:none!important` below 767px**, so a phone gets the
wordmark and GIVE for the page's entire length — on a page longer and more sectioned than the
homepage. 17 dead anchors and 11 `href="#"` CTAs.

**The rail is a parallel mechanism.** `.rail`/`.rail-l`/`.rail-r` on an inline `--lw`
percentage, against the frozen `.rl` contract with `--rl-w/--rl-c/--rl-h`. The frozen page
contains *zero* `.rail-l` CSS — those hits are comments describing the retired mechanism.
All nine readings hang off it. **This is the largest single reason the page cannot be dropped
onto the frozen shell, and it is why you are re-composing rather than editing.**

**Three already-ruled defects are live**, because the file predates the freeze and nothing
propagates between pages: `.tag-season{border-style:dashed}` (nine uses, three of them
saying the *opposite* of the shut-window meaning), the red selected-tab rule the frozen page
deletes and names in a comment, and `--mustard-ink` spent as a fill after its demotion.

**Copy: the honesty grammar is the best on the site and ports for free.** Zero LIVE claims,
and the page says so out loud — *"There is no LIVE badge anywhere on this page, because that
would be a claim the data cannot support."* All four state words used correctly across 16
chips. `PERIODIC` correctly styled by absence. Zero uses of the withdrawn word "audited".
**Keep every one of these sentences you can.**

**Copy: the claims layer breaks four rules.**
- **Stated totals, starting with the `h1`** — `Six situations, four of them illegal`. The
  branding doc records the near-identical *"Nine situations, read against the law"* as
  **already rejected**. The four-tile stat row (`6` / `4` / `0` / `+3`) repeats it four
  times. There is also an internal contradiction: the h1 says four illegal, the default
  rendered set contains three breaches.
- **26 typed dates and ~10 tensed strings, with zero date computation anywhere** — the
  frozen page has four `new Date` calls. Including `"Wednesday, 19 August 2026, 07:00 IST"`
  as the page's own eyebrow and `"Last compiled 18 August 2026"`, the exact string the
  branding doc already ledgers as a live residue.
- **A closed window renders in full**, with a reader toggle, against an absolute ruling —
  and the copy argues the opposite of the ruling.
- **The colour legend teaches the retired green rule** — *"Green only ever labels a
  past-tense recovery"*, after the 21 August widening to Swechha's own outcomes. This is the
  page that defines the vocabulary, so it is the worst place in the site for the stale
  version.

**What the content architecture gets right — this is the asset, keep the sequence:** index
head → deck of readings → validity-window explainer → source/cadence table → colour-rule
legend. The `#windows` and `#method` tables are the right answer to §4.5's two-level
provenance requirement and have no homepage equivalent worth preferring. They need re-typing
against tokens, not redesigning.

---

## 4. What the page must do

**Inherited promises.** The homepage ships these today on this page's behalf:

1. **"The full instrument →"** — the word *instrument* sets the expectation: the full
   apparatus behind a number the reader has already seen.
2. **Six ticker cells link here**, each to a situation anchor. A reader may arrive already
   knowing a figure and wanting only its provenance.
3. **"Every reading against its published limit"** — the masthead's method line. So **every
   figure here carries a published limit, or states in words that none exists.** The frozen
   wording for the second case is *"No legal threshold."*
4. **A closed window does not render, anywhere.** The `Year round` / `In window` tag is
   load-bearing — the visible face of the window — and keeps a **solid**-bordered box.

**Therefore deliver:**

- **The set, as readings.** Each of the five rendering situations with all six parts of a
  reading (§3.4): numeral in its rail, the rule in its state, unit, verdict, published limit
  and band scale, provenance and hour. Three of the prototype's nine readings were missing
  their band scale — none of yours may be.
- **The two-level provenance the homepage cannot carry** — the per-reading `.src` line, and
  the page-level source table with each feed's cadence and state.
- **The window grammar, taught.** Why a situation is here, why one is absent, and what
  brings it back. This is the page that has to make a changing count legible.
- **The vocabulary, taught — as labelled specimens, not as situations.** D-11.2 removed the
  two slides that were demonstrating DEMO DATA and OUT OF SEASON. The four state words and
  the three hues now get taught in the legend band, where a specimen can be labelled as a
  specimen. **This is the most interesting design problem on the page: teach four words when
  the live set only exercises two of them, without faking a third.**
- **A route onward** to each situation's own page, and honesty where that page does not
  exist yet. Only Air is briefed; the other five have nothing behind them. The through-line
  is *show the hole rather than fake the door* — propose how, and flag it as Q3.
- **One CTA per band**, per §5.8.

### 4.1 The primary design criterion: the layout must POPULATE, not just render

This is the client's own emphasis and it outranks visual resolution. **The page ships thin
and fills up over months**, and the layout has to be right at both ends of that without being
re-composed in between. Three axes move independently:

| axis | today | later |
|---|---|---|
| **situations rendering** | **five** (Heatwave's window is shut) | **six** in season, and a different five if another window closes |
| **situation pages behind them** | **one** briefed (Air), none built | six built, each a real destination |
| **data state per reading** | every one a stamped specimen — `DEMO DATA` or `PERIODIC` | some `LIVE`, some still `PERIODIC`, mixed within one band |

**Design for the sparse case and let it thicken.** The failure mode to avoid is the one the
prototype already has: a composition tuned to nine slides and four stat tiles, which cannot
lose three slides without a hole. Specifically:

- **No band may depend on a count** — of situations, of live feeds, of built pages, or of
  rows in a table. The homepage already proved this discipline is achievable (D-03.4,
  count-independence, built and proven); inherit the technique.
- **A band with one item and a band with six must both look composed**, not like a grid
  missing cells. Say for each band what it looks like at its minimum and at its maximum.
- **State the growth path per band**: what changes on this page the day Air's page ships,
  the day a second situation page ships, and the day the first real feed is wired. If a band
  needs re-composing at any of those moments, that is a design defect — name it and fix it
  now, or flag it as a deliberate, dated exception.
- **The reader must never see the scaffolding.** A slot with nothing in it renders nothing
  (§4.3), not a blank, a dash, a zero or a greyed placeholder. The one licensed exception on
  this site is the *marked* archive cell (§4.4) — if you use that device, mark it as such.

---

## 5. Questions genuinely open to you — propose, with a recommendation

Everything else is settled. On these four, give me your recommendation and the reasoning,
and name the cost of the alternative:

**Q1 — Is the index's `<h1>` a constant, and what is it?** D-10.2 rules a *situation page's*
headline a constant naming its subject. This is the index, not a situation, so the ruling
does not bind it by its own terms — but the reasoning does: the current h1 is two stated
totals in the largest type on the page, and one of them goes false in March when Heatwave
returns. Propose the constant, and say what carries the *reading* of the set instead, if
anything does.

**Q2 — What replaces the four-tile stat row?** `6 in window` / `4 breaking a legal limit` /
`0 live feeds` / `+3 change since yesterday`. All four are stated totals; the fourth is also
a change figure with no second reading behind it, and the ledger already flags it. But the
row was doing real work — it told a reader the shape of the set before they scrolled through
it. Propose what does that job without a total, or argue that nothing needs to.

**Q3 — Does the index link to situation pages that do not exist?** Five of the six have no
page. Options include linking all to a stub, rendering the five as unlinked names, or
carrying only Air's door. This is a visible admission on the site's most-linked inner page.

**Q4 — The share card.** This is the repo's first, so it sets the pattern for every page
after it. Propose its composition, and say whether it is a static asset or a generated
`opengraph-image`. Note that a card showing a *reading* dates itself the moment the reading
changes, and that a generated card carrying a stamped specimen value is a claim in a place
no honesty chip can reach.

---

## 6. The constraint that shapes everything: no figure here may need to be true

**`2026-08-21-SOURCE-FACTS.md` contains no environmental figures at all.** It is the
work/about/impact fact base — journeys, projects, campaigns, the 3M derivation, the social
accounts. So `412`, `0.0`, `118`, `1.65M ha` and `512mm` trace only to the decisions ledger,
where they appear as *design examples in the frozen homepage's ticker*. That is circular: the
homepage took them from these same prototypes. **Gate #11 of the situation brief cannot
currently be met for a single reading on this page.**

Design to it rather than around it. Every reading is a stamped specimen until its feed
exists (D-10.1), so **the composition must hold together when every value on it is labelled
DEMO DATA or PERIODIC.** A page that only reads well when its numbers look authoritative is
the wrong page for this site.

Concretely: **do not invent a figure, a station name, a limit, a cadence, a date, a docket
number or an arithmetic derivation.** The prototype invented `47.8`, `14 of 18`, `68 dB(A)`,
`"Normal to 19 August is 434mm"`, `"day 80 of 122"`, `"Twenty-two kilometres of it are
inside the city"` and `"Schools in this ward are three kilometres from the monitor"` — none
of which is checkable. Where you need a value the fact base does not have, **write the slot
and name what has to fill it**, in a table at the end of your document.

Note also, from the situation brief §3: CPCB has no stable public API, a CPCB daily bulletin
is `PERIODIC` and not a feed, there is no real-time public Yamuna feed, and IMD was already
rejected as brittle. Do not assume a source is available because it is public.

---

## 7. Hard constraints

**From §7, forbidden — the ones this page has broken before:** a stated total on the page ·
a tensed or dated claim typed into static markup · red on a control · green on a control ·
dashed for anything except a shut window · selective colour (retired; two ramps only, `duo`
and `duo-dim`) · borrowed logos and icon sets generally · a reveal/IntersectionObserver
animation system · auto-advance · `toISOString()`/`toLocaleDateString()` for a local date.

**From §3.2:** one hue live per band. **Red and green must never meet in a band** — only a
visually caged ticker-class summary strip may hold both. The prototype's deck breaks this by
putting four breach rails and a green "Recovered" verdict in one component; with Out of River
gone this resolves itself, but check your own composition for it.

**From §3.4:** the multiplier is set in `--fg`, **not red**. The prototype colours it red.

**From §1.5:** `--gut` floors at **20px**, not 16 — *"16px at 375 is an app margin, not a
document margin."* Measure ceilings: **lead 46ch, body 62ch, caption 60ch.** Everything
containing sentences goes on `.wrap`, not `.wide`.

**From §1.1 / §10.2:** declare the band sequence first — **id, tier class, ground hex** — and
check adjacency mechanically. No two adjacent bands share a ground. Then decide which single
hue each band carries and which carry none.

**From §6.4:** budget each band against **900px at 375**. If one cannot make it, show the
arithmetic and ask; do not quietly breach and do not damage a component to hit the number.
The frozen page has exactly one licensed exception.

**Components:** build from the fifteen solved components in §5. The deck is an ARIA tabs
widget, not a carousel, and non-current panels take `tabindex="-1"` — **not `hidden`**, which
is what the prototype does. Any new component is named, justified, and argued against the
solved one it displaces.

---

## 8. What to deliver

One document, `docs/design/2026-08-21-AD-13-situation-index.md`:

1. **Verdict in one line**, then the composition rationale in a paragraph.
2. **The band ledger** — every band in order: id, tier class, ground hex, the single hue it
   carries, its purpose, its phone budget estimate. **Adjacency checked and shown.**
3. **A wireframe per band**, at 375 and at 1440 — **the core of this deliverable.** ASCII or
   a described grid is fine; this is a layout specification, not a picture. Name the frozen
   component each element is, and its container (`.wrap` unless argued otherwise).
4. **The populate table** — per §4.1, for every band: how it looks at its minimum and its
   maximum, and what changes at each of the three growth moments (Air's page ships, a second
   situation page ships, the first feed is wired). Flag any band that needs re-composing at
   one of those moments.
5. **Copy slots, not finished copy.** Per the client instruction in the header: the labels
   and structural strings needed to read the layout (headings, eyebrows, state chips, window
   tags, button text, empty states, the legend's teaching copy), plus specimen text where
   the composition cannot be judged without it — clearly marked as specimen. **Do not write
   finished editorial prose for the five situations whose pages do not exist.** For every
   figure the layout wants: name the slot and what has to fill it, per §6.
6. **Your four answers** to §5, each with the recommendation, the reasoning, and the cost of
   the alternative.
7. **The SEO surface** — `title`, `description`, canonical path, the full restated
   `openGraph` object, the share-card composition, and the JSON-LD shape for each of the
   four types in D-11.4. Name every field each JSON-LD block needs and whether the schema
   has it. **Note which JSON-LD blocks can ship now and which wait on real data**, since a
   `Dataset` describing a specimen is its own honesty problem.
8. **The backend requirements table** — every field the design depends on that
   `lib/content/schemas.ts` does not have. Start from §4 of the situation brief; add what
   your composition needs. Mark which are blocking and which degrade gracefully.
9. **Open questions for the client** — only where a different answer changes the work.
10. **What you deliberately did not design**, and why — and per the header, **which of your
    layout decisions you expect to move** once the first situation pages are populated.

**Method note.** You are reading and specifying, not measuring — there is no build to
measure yet. Do not report a pixel measurement you did not take. Where you need one, state
the frozen page's value and where you read it. Cite `file:line` for every claim you make
about an existing file.

**Tone of the document itself:** the project's convention is dense, numbered, evidence-first,
and willing to name its own uncertainty. Follow the existing AD records.
