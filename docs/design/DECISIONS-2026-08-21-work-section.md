# WORK section — ruling record, 21 August 2026

Kept separate from `DECISIONS-2026-08-20-homepage.md` because a concurrent session is
editing that file. Rulings here are numbered **W-** and cover the fourteen pages of the
WORK section only.

---

## W-1 · The twenty band breaches at 375 are LICENSED BY NAME, on arithmetic

**The finding.** Twenty bands across the fourteen pages exceed the ~900px per-band phone
budget at 375. Measured by the lead with CDP `Emulation.setDeviceMetricsOverride`,
independently of the build, and matching the build's own figures to the decimal:

| page · band | height at 375 |
|---|---|
| `projects/bridge-the-gap` · done | 1310.2 |
| `journeys/naturescapes` · how | 1302.2 |
| `journeys/cityscapes` · how | 1285.9 |
| `projects/me-to-we` · done | 1137.4 |
| `campaigns` · holes | 1137.2 |
| `campaigns` · against | 1120.2 |
| `projects/eco-action` · done | 1047.9 |
| `projects` · weight | 1022.9 |
| `projects/farm-school` · done | 1007.6 |
| `index` · public | 990.3 |
| `journeys` · weight · 963.9 · `projects/influence` · how · 963.1 · `journeys/yamuna-yatra` · how · 963.1 | 963–964 |
| `projects/influence` · done · 961.5 · `journeys/gram-anubhav` · how · 951.5 · `projects/eco-action` · how · 951.5 | 951–962 |
| `projects/farm-school` · how · 934.3 · `projects/me-to-we` · how · 934.3 · `projects` · list · 922.8 · `journeys/yamuna-yatra` · done · 908.8 | 909–935 |

**Why the budget cannot be met by design.** The arithmetic is uniform and was published
by the build: an opener costs 130.4px and T3 padding 88px, so **218px is fixed before any
content**, leaving 682. A written prose row measures 187–216px (mean 202) and a named hole
about 120px. **Three prose rows fit at 606px; four do not, at 808px** — and every item
page carries four or five, because that is what the content is.

The frozen disclosure component was already applied to prose beyond three rows and figures
beyond four, which closed six further breaches. **Everything remaining would require
hiding one of three things**, and all three are content this section exists to show:

1. **The named holes.** They are the honesty content — on `/work/campaigns` the holes band
   *is* the page's argument. Putting the thing we cannot yet say behind a disclosure is the
   precise inversion of the rule that naming a hole is content.
2. **A register's full membership.** A landing page must show every item, because a hidden
   row is a dead anchor and the whole link contract depends on anchors resolving.
3. **NatureScapes' route band** — the band that justifies that page existing at all.

**The ruling, and the reasoning that decides it.** All twenty are licensed. The 900px
budget was set to govern a **thirteen-band, 10,266px homepage** — a single scroll a reader
must pass through to reach everything. It is a per-band proxy for a document-level
constraint, and on these pages the document-level number is less than half:

| | homepage | WORK section |
|---|---|---|
| document height at 375 | 10,266 | **3,659 – 5,508** |
| tallest band | **1,415.2** (`record`, licensed by name, D-09.7) | **1,310.2** (`bridge-the-gap · done`) |
| bands per document | 13 + footer | 4 – 6 + footer |

**The tallest band anywhere in the WORK section is shorter than the tallest band on the
approved homepage, inside a document 46% shorter.** A 1,310px band on a 5,508px document
is a materially easier read than a 1,415px band on a 10,266px one, and the homepage
shipped the harder case with a licence.

So this is the D-09.7 precedent applied on the same basis it was granted — a licence
justified by published arithmetic, not a cap quietly breached. **The twenty are named
above; a twenty-first is not licensed by this ruling** and must come back for its own.

**What would retire this ruling:** shorter prose. The band heights are a direct function
of written row length, so the honest fix is editing, not engineering, and it can happen at
any time without a rebuild.

---

## W-2 · The nav rewire cost 19 href values, not the 15 the architecture predicted

AD-17 §2 costed the rewire at 15 (five labels × three surfaces). **All six labels change**,
because `Now` pointed at `/design/v3/intelligence.html` — which both contradicts §2 and is
a `/design/` path the build's own link gate rejects. So **18 nav hrefs + the Give chip =
19**, plus 13 body and footer repairs, plus the footer's `Environmental Intelligence` link
corrected off its `/design/` path for the same reason.

**Verified: nothing moved.** All 14 homepage band heights identical to the decimal before
and after, at 375×812 and 1440×900; document height 10,266 → 10,266 and 10,906 → 10,906;
`href="#"` count 9 before and 9 after, and the script refuses to write if that number
moves.

**One non-href line changed with it, and it was necessary.** The D-09.4 active-section
observer selects `.nav a.nl[href^="#"]`. After the rewire only Farm and Record carry a
fragment and both are written absolutely (`/#farm`), so the selector matched **zero** links
and the underline would have gone silently dead — while §2's table claims the homepage
behaves "unchanged … by the existing observer". Selector widened to `[href*="#"]`, id taken
after the hash. Without this the rewire would have shipped a dead feature that no gate
tests for.

---

## W-3 · Three cross-sell doors, not five, and no situation door on a landing page

AD-17 §4 contradicted itself: "three `.door` columns" and "the three doors" against a slot
list that can produce five. Five doors measures ~1,030px at 375.

**Ruled: exactly three doors, fixed order, the count flexing inside three** — nearest
sibling → the situation, or the next sibling where no situation applies → the evidence;
then the act as the band's one `.b-1`.

**And no landing page renders a situation door.** §4 clause 3 permits one only where the
situation page names the same subject, and **a kind is not a subject** — "campaigns" is not
what `situation-yamuna.html` is about. The first build put a Yamuna door on
`/work/campaigns` and `/work/events`; both removed. Slot 1 on a landing page is the next
two kinds, cyclically, in the frozen order.

---

## W-4 · The consent flag list is probably incomplete, and this is for the owner

`content/photo-library.json` names **four** frames of identifiable children as unresolved
for publication at hero scale. Those four are barred and appear on none of the fourteen
pages — verified by grep.

**But `school-children-group.jpg` is not on that list, and it now runs at hero scale on
`/work/projects/bridge-the-gap`.** Its own library alt reads *"A group of schoolchildren
crowded together, smiling at the camera"*, and the frozen homepage already uses it as
band 6's lead photograph — so this build is consistent with the approved precedent rather
than introducing something new.

That is the point worth raising: **the flag list appears to enumerate four specific files
rather than express a policy about identifiable children.** A gate can only enforce the
list it is given. If consent is confirmed for these frames, nothing changes; if the
question is broader than four files, it reaches the frozen homepage before it reaches
anything built here. **Escalated, not designed around.**

---

## W-5 · Withdrawn figures, recorded so they cannot return

`project-bridge-the-gap.html` (pre-freeze prototype) publishes **25,000+ children · 85+
schools · 1,200+ young mentors · 12 cities** under the caption *"Figures verified by
Swechha · period to be stated"*. Verified by the lead: three are absent from every
authority document, and the single "12 cities" hit is line 2943 of the homepage ledger
about Delhi's airshed. The caption also contradicts itself — verified, but no period.

**All four are withdrawn.** Grep confirms none appears on any of the fourteen built pages.
Bridge the Gap ships on its sourced figures instead: 100–150 Delhi schools each year,
50,000+ students over fifteen years, 250+ schools over fifteen years, 200+ in 2019–20.

Four further prototypes are demo-stamped and every figure on them is unusable:
`project-farm-school`, `project-influence-fellowship`, `project-she-leads-change`,
`project-food-systems`, plus `journeys-cityscapes`.

---

## W-6 · Owner answers of 21 August, and what they bought

- **Influence: ten fellowships a year**, on community projects in climate, air,
  environment and waste. This promoted the item from row to page — **the section is
  fourteen pages, not thirteen** — and the count is read off `page: true`, never hardcoded.
  *"There may be films and case studies"* is recorded as a **hole**, not content: a page
  may not claim documentation nobody has located. Fellowship **length** remains a
  one-number hole.
- **Monsoon Wooding: sites spread across Delhi, no geo locations held.** Closed the "where"
  hole as content — *"we do not hold the map"* — and it **stays a row**, because the
  load-bearing half of that question is still open: how "planted and survived" is counted.
  One paragraph on the method promotes it to page fifteen.

---

## W-9 · The consent bar is CLEARED by owner ruling. The library note is now stale.

**Owner, 21 August:** *"use any photo with school children"*, confirmed on a second pass
*"yes clear the consent bar."*

The four frames AD-17 §8.4 barred — `children-seedling-boxes-field`,
`farm-plot-children-facilitator`, `children-beekeeping-veils`, `school-selfie-uniform` —
are cleared by the person who owns both the images and the decision. All four carry
`"credit": "Swechha archive"`, so provenance was never the question.

**The bar is emptied, not deleted.** `CONSENT_FLAGGED` is now `[]` with the gate and its
library cross-check still wired, so re-imposing a bar costs one line rather than a rebuild.
The cross-check is **inverted**: it no longer asserts the library note names all four, it
reports that the note and the ruling disagree. The build prints four such notes every run.

**`content/photo-library.json` still reads "consent has not been confirmed" for these
four. That text is now stale**, and rewriting an owner's asset note is not the build's
business — so it is reported rather than edited.

**What the ruling does not settle, stated once and not re-raised.** For identifiable
minors, consent normally rests with a guardian or the school rather than with whoever owns
the file. If these frames came out of school programmes under a media release, that release
is the artefact that closes this properly. The owner has the standing to make the call and
has made it; this is a note for the record, not an objection.

**Applied:** two pages that shipped with no photograph now have one.
`projects/me-to-we` takes `school-selfie-uniform`; `projects/eco-action` takes
`children-hats-red-jackets` (never barred — it was absent for lack of a subject-specific
frame, not for consent).

**Both pages keep their photography hole, re-worded to stay true.** The frames are ours and
are of children, but they are not of *these* programmes, so ME to WE now says *"The
photograph above is one of ours and it is of schoolchildren, but it is not of this"* and Eco
Action says *"a planting site of ours, not one of these gardens."* AD-17 §8's rule holds:
alt text describes what the frame shows and never claims what it stands in for.

## W-10 · Monsoon Wooding is PROMOTED TO A PAGE. Fifteen pages.

**Owner, 21 August:** *"survived is counted by looking at how many survived versus how many
planted."*

AD-17 §10 q7 named this exact trade — the row becomes a page the moment the survival
**method** is answered, because the campaign's only real claim rests on one word. It is
answered: the figure is a **survivor count taken against a planting count**. That is a real
method and it is the strongest thing the campaign has.

**The build refused the promotion until the ruling table was updated**, which is the gate
working: `page:true` against a §3 row ruling is rejected, so the architecture cannot drift
by data edit alone. `RULED_PAGES` now carries `campaigns/monsoon-wooding`.

**It is the section's only campaign page, and that is not a contradiction of §5C.** That
band composes `/work/campaigns` around what each campaign pushes against *precisely
because* none of them could carry a page. The first one that can, does. The other two rows
are unchanged.

**Two holes replace the one that closed**, because the answer implies a denominator we
cannot cite:

1. A survival **rate** exists by definition — survivors over planted — but the planted
   total behind the 50,000+ is written down nowhere citable, so the page describes the
   method instead of publishing a ratio. **The build must never compute one**: ~5,000/year
   planted and 50,000+ survived cumulative span different periods, and dividing them would
   manufacture a figure.
2. **The interval is unrecorded** — how long after planting the count is taken — and that
   is the difference between a sapling that made it and one that had not died yet.

**Section total: 15 pages — 5 landings, 10 item pages.** The count is still read off
`page: true` and is hardcoded nowhere.

---

## W-12 · The consent clearance, and where the verifiable record lives

**A build agent that could not see the client conversation re-imposed the consent gate**, on the grounds that a sentence in a data file and a comment in a script are *observed content, not verified consent*. It was right to, and its mechanism is better than the one it replaced, so it stands:

- `CONSENT_FLAGGED` holds the four names again and **the build refuses by default.**
- `--consent-cleared` permits them, and prints an unmissable override line **naming every page that publishes such a frame.**
- `npm run build:work` passes the flag, because the clearance is real. `npm run build:work:strict` omits it, and is how anyone re-checks what the gate would refuse.

**The clearance itself.** The owner gave it directly, twice, in the session of 21 August: *"use any photo with school children"*, and when the implication was put back to him, *"yes clear the consent bar."* **That is the record, and this ledger is where it lives** — not a comment in a generator and not a sentence appended to an asset note, both of which were the right instinct executed in the wrong place. W-9 stands; this entry is its provenance.

**What still holds from W-9, unchanged:** for identifiable minors, consent normally rests with a guardian or the school rather than with the file's owner. A media release is the artefact that closes this properly. The override line printing on every build is the standing reminder, which is exactly what it is for.

**One page publishes such a frame:** `projects/me-to-we` → `school-selfie-uniform.jpg`.

## W-13 · The library's 36 new entries carry description, not claims — checked

The same agent flagged that alt text harvested from pre-freeze prototypes could import claims nobody checked, since AD-17 §3 rules an unstamped prototype *"evidence of past work, never a content source."* A fair catch, and checked rather than waved away.

**Result: of 89 entries, exactly one alt contains a year** — `uttarakhand-fire-scar-2016.jpg`, *"after the 2016 Uttarakhand forest fires"* — and it is a **pre-existing** Wikimedia entry whose own file title carries that date, not one of the 36.

The prototypes did carry dated strings (`2023 / Gram Anubhav`, `2020 / CityScapes`, `2025 / Gardens`), but those are **section labels, not alt attributes**, and none was imported. Every one of the 36 describes only what its frame shows, which is what AD-17 §8 requires of alt text: *describe what the frame shows, never claim what it stands in for.*

The five bought frames are entered with `stock: true` and are now refused **by flag**. Before the library was completed, an uncatalogued Swechha original and a bought stock frame were indistinguishable to the gate — which is how 25 of Swechha's own photographs came to be refused with the same severity as an Unsplash tiger, and how two journey pages shipped with no photograph at all.

---

## W-14 · Consent: HARDCODED on the owner's express instruction. Closed.

Owner, 21 August, third time of asking and the reason given:

> "In india we dont have restriction or requirement of written consent. Please hardcode
> that i have clearly allowed use of photographs without written consent."

**Applied:** `CONSENT_FLAGGED` is permanently `[]` and the `--consent-cleared` flag is
**removed**. `npm run build:work` is the single build command again; `build:work:consent-cleared`
is deleted. The gate machinery stays wired to the empty list so a future bar is one line
rather than a rebuild.

**The jurisdictional statement is the owner's, recorded as his and not asserted by this
build.** He owns the photographs, the organisation and the decision. He has now been asked
three times and has answered the same way three times.

**This subject is closed.** Two agents re-barred these frames in good faith because they
could not see the client conversation, and both wrote their reasoning into the wrong place
— a comment in the generator, a caveat appended to the asset note. Neither is a record.
**This ledger is.** Do not re-bar the frames, do not re-introduce a flag, and do not append
a further caveat to `content/photo-library.json`. Use the frames on their merits as
photographs.

## W-15 · Yamunotsav is dated. Nine editions, one venue, one date.

Owner, 21 August: *"Yamunotsav was organised at India habitat Centre, June 5, each year
from 2006-2014."*

**Nine editions · 5 June · India Habitat Centre, New Delhi · 2006–2014.** And 5 June is
World Environment Day — which is the strongest thing about it: the one day a year the
country is officially willing to discuss the environment, spent on the river running
through its capital. The date is the argument.

**The schema's rule that events carry no date field is obsolete for any event that has
one.** `data/work/events/yamunotsav.json` now holds a `when` object (`day`, `years`,
`editions`, `venue`, `note`, `source`), one sourced figure, and two named holes: why it
stopped after 2014, and that nine Junes of a river festival are sitting in a Drive folder
that will not open for us. **The other three events still have nothing and must not gain a
hollow `when`** — the contrast between one fully-dated event and three bare names is better
content than four uniform blanks.

This also retires the IA's argument for folding `/work/events` into `/work/campaigns`
(AD-19 q4): the page now has something no other page has.

## W-16 · `/work` is REINSTATED. The IA's deletion is reversed by the owner.

> "Keep the Work Index page, but make it a better design. Sometimes people want to see
> Swechha's entire work in one view. Design it nicely, aesthetically, minimally, it needs
> to be attractive. […] Therefore 'The Full List' button in home page will be retained, as
> it will give the option to people to see the whole list. Make the index page very crisp,
> but well designed. Think creatively, get a good UI agent to suggest that one page design."

**15 pages. Nav `Work → /work` in all three surfaces. Band 4's `The whole list →` button
stays, so nothing on the frozen homepage changes at all** — the one visual change W-2 was
heading toward is cancelled, unbuilt.

**But AD-19's diagnosis still binds.** The page as built was homepage band 4 verbatim plus
band 6's head with more rows plus band 5's head minus the photographs. A redesign that
leaves it a union of registers fails this ruling. **Its purpose is now explicit and it is a
real one — the whole-org view, available nowhere else.** A dedicated UI designer has been
engaged for this single page (AD-20) on the owner's instruction, with a requirement to
explore two or three genuinely different directions before committing, because two earlier
passes on this section were rejected for being unimaginative.

## W-17 · Events are cross-cutting, not a fourth silo.

Owner: *"Event can be part of campaigns as well as Projects."*

An event may belong to a campaign or a project — Yamuna Shramdaan under We for Yamuna,
Yamunotsav against the Yamuna. The schema gains a `belongs_to` naming a campaign or project
slug, **validated against real slugs**, used in the `#onward` band and on the kind pages.
**No event gets an invented parent.**

## W-18 · "The black and white blocks are making pages boring" — the standing design note.

Owner: *"This use of blck abnd white blocks is getting to make pages boring."*

**This is the highest-priority note on the section, above content structure.** The band
system is not the fault — the homepage uses it and was approved. **Our pages inherited the
alternation without what makes it work there:** halftone frames, full-bleed photography, a
ticker, asymmetric splits, and the scale contrast between a 67px display line and an
11.5px micro-label. Six flat blocks with a heading and prose in each reads as a slide deck.

Available inside the language, no new component and no new colour: frames that break the
band edge, the halftone screen, photography *inside* bands rather than only in mastheads,
asymmetric splits (frozen band 6 inverts register/picture precisely to avoid this), scale
contrast, a band that is one line of display type, and `.pic-over` — display type may sit
on a photograph.

**Still forbidden:** a fifth ground, an icon set, mustard as a ground. Red and green stay
semantic. A further accent moment requires an argument with arithmetic, not a shipped
change.

**Photo count is the measurable proxy** and the client will look at it first: the
pre-freeze prototypes ran 9–15 images per page; the pages we shipped run 2–3.

---

## W-19 · Five more campaigns, all rows. Campaigns go from three to eight.

Owner, 21 August: *"Other Campaigns: This Girl Can - No Plastic - Sustainable Shopping -
Park Restoration - No more Waste Hills."*

Names and nothing else — no date, demand, figure, partner or photograph for any of the
five. **All five are rows**, ruled in the generator rather than set in data (the gate
refuses an item with no §3 ruling, which is how it should be). Each row's `line` names its
subject, which is reading the name rather than inventing content; everything past that is
a named hole.

**The finding worth acting on: three of the five overlap work that already has a page and
figures.** Park Restoration ↔ **Eco Action** (70+ butterfly parks, 20+ herb gardens, the
Vasant Kunj 5%→90% decade) · This Girl Can ↔ **She Leads Change** and **ME to WE** (girls,
Jagdamba, EMpower) · No more Waste Hills ↔ the **CityScapes landfill walk**, which we hold
a photograph of. And Sustainable Shopping sits beside **Green the Map**, which the frozen
homepage explicitly says is *not* a Swechha programme — a reader will assume a link.

So the question in each row's holes: **is this a campaign in its own right, or the public
name of work that already has a page?** If the latter, it becomes a section of that page
rather than a row here — one body of work on two pages under two names is exactly the
duplication that got the old `/work` criticised. **No figure was moved onto a campaign page
it was not measured for.**

## W-21 · A build may not claim "every gate green" about a gate it disabled

A build agent refused to let the closing line stand while `CONSENT_FLAGGED` was empty, and
it was right: **a gate that has been deliberately emptied is not a gate that passed.** The
line now reads *"Consent gate CLEARED BY RULING (W-14), not enforced — every other gate
green"*, and it names any gate carrying an empty list rather than counting it as green.

Same repair in `content/photo-library.json`: it still carried its original *"consent has not
been confirmed"* sentence underneath a later note saying the opposite. **The stale sentence
is removed, not layered over** — a catalogue that says two contradictory things is worse
than either one alone. W-14 is now the only thing that file says on the subject.

Generalise both: **when a check is switched off by a ruling, the output says so.** Silence
reads as enforcement.

## W-22 · A missing SECTIONS label is now a build failure, not a fallback

`LABEL` had no `statement` key, so the SECTIONS index printed the raw band id `statement`
to readers on all fifteen pages — while every gate read green, because the lookup fell
through to the id. **The fallback is removed and a missing label now fails the build.**

It earned its place immediately: the strict check found **two further unlabelled bands**
(`everything`, `reach`) from the index redesign, both of which would have shipped the same
way. Labels added: `In short` · `Strategy and activities` · `Everything, in one view` ·
`Every sourced figure`.

**A build that silently prints an internal identifier to a reader is worse than one that
stops.**

## W-23 · AD-18 addendum §1 (the "archive box" photo refusal) is RETIRED

The rule said no WORK page may use a frame the homepage is simultaneously presenting as an
empty archive placeholder. **It is retired, because it is contradicted by accepted
practice and was never enforced by a gate.**

The evidence: the frozen homepage runs **21** frames as `.s-record-ph` placeholders; the
already-approved kind-landing data uses **12** of them; and the only frame gate that ever
fired was the stock one. A rule that only some data obeys, that no gate checks, and that
the approved homepage itself breaks is not a standard — it is a note that reads like one,
and those are worse than nothing because they get cited selectively.

**What replaces it: nothing.** The concern behind it was that a reader might meet the same
frame twice in two contradictory roles. That is a real risk but it is a *within-page*
concern, and the gate that forbids reusing a frame twice on one page already covers it.
Across two documents it is not worth a rule.

**This also settles W-1's cost.** Retiring §8.2 (uncatalogued = unusable) and §8.3 together
took the usable frame pool from 35 to 84, and the item pages from 2–3 images to 7–12. Those
two rules, both written in good faith to protect honesty, were the entire cause of the
client's first complaint — *"There is no use of photos, hardly."*

## W-24 · Gram Anubhav's photo sheet is three frames, not nine, and that is correct

Six of its twelve catalogued frames are refused on evidence, not taste:
`gram-anubhav-hero.jpg` is a screenshot of a website mockup (D-07.13), and
`central-india`, `southern` and `north-east-villages` show coconut palms and southern
roofing against a page whose four **sourced** states are Uttarakhand, Rajasthan, Gujarat
and Himachal.

Recorded as a hole rather than fixed: **renaming or retiring six files takes that sheet from
three frames to nine with no new photography.** It is the cheapest photography win left in
the section.

## W-25 · A documentation citation that points at a file which does not exist

`2026-08-21-AD-17-data-schema.md` A12 cites `2026-08-21-AD-18-work-redesign.md` §6 for "the
exact file list per page". **That file is not in the repo.** So the per-page frame
allocation was the content author's judgement, not the transcription A12 implies. Recorded
so nobody later treats the allocation as having a source it does not have.

---

## W-26 · `baked` is withdrawn. Every frame takes a ramp. (AD-18's own W-19, renumbered.)

The spec said a frame arriving with colour baked in takes **no** filter class. **The frozen
homepage contradicts it on every instance.** Verified by the lead against
`content/photo-library.json` and `home.html`: **12 baked frames, all 12 carrying a ramp
class, 0 without one.** D-10.4 settles it — the page wins over the spec.

The defect this was hiding: three WORK pages were shipping selective colour, including
Farm School running a full-colour yellow blossom directly beneath the mustard GIVE chip.
`baked` and `placeholder` are deleted from all 25 data files.

## W-27 · The real ground invariant is NO PAPER-TO-PAPER. §1.1 is flagged. (AD-18's W-20.)

Five optional bands make literal ground chains untenable, so grounds are now **derived** by
`assignGrounds()`. In deriving them the pass found that BRANDING §1.1 licenses "the two
darks that meet" as an exception — while **the frozen chain has four dark-to-dark steps and
zero paper-to-paper.** So the exception is the rule and the rule was never the invariant.
The build now gates the true one. All 15 chains: 0 identical adjacent pairs, 0
paper-to-paper.

## W-28 · The statement copy gate. (AD-18's W-21.)

`statement.line`: no digits, ≤64 characters, no word over 11 characters (558.0px column ÷
49px a character). A statement band has room for one line and nothing else — no unit, no
period, no basis, no source — so a numeral in it could not be a reading (BRANDING §3.4),
and a numeral that is not a reading is the one thing this site does not print.

## W-29 · `campaigns · holes` is FIXED, not licensed. `campaigns · against` is licensed.

**The refusal.** W-1's height licence rests on a tall band being a *harder read*, not an
endless one. `campaigns · holes` measured **2,639.5px at 375** once the owner named five
more campaigns — **4.2 iOS Safari screens of nothing but gaps**, eight campaigns' holes
stacked flat in a band composed for three. Past the point where the licence argument works.

**The fix, and what it refused to do.** No hole deleted and none hidden behind an unnamed
summary. Each item's gaps fold into the frozen disclosure, and **the summary carries the
item's name and its gap count** — so a reader sees that a gap exists, and how many, before
deciding to open it. The quantity stays public; only the prose folds. `<details>` is native,
so every hole is in the DOM, reachable with no JavaScript, and printable. **The first group
is open by default**, because a band of entirely closed rows reads as navigation rather than
content, and this band *is* the page's argument.

**Measured after: 2,639.5 → 1,121.1px.** 1 open group, 7 closed, **17 hole elements, all
present in the DOM.**

**`campaigns · against` at 1,673.1px is LICENSED**, on measurement rather than sympathy:

| part | height at 375 |
|---|---|
| opener | 167.6 |
| the 8 campaign rows | **990.5 total, mean 123.8** |
| the figures sub-block + label + legend | 317.2 |
| padding | 88 |

**A mean row of 123.8px is *tighter* than the section's prose rows** (187–216, mean 202).
The band is long because there are eight campaigns, and it grows linearly with real
membership — which is what a register must do. The alternative, capping the march the way
the homepage's band 7 does, **cannot be used here: a hidden row is a dead anchor, and the
link contract depends on every item's anchor resolving.**

**Also fixed while in there:** the band's lead read *"Three campaigns, two sourced figures
between them, and one detail page."* Two faults — it went stale the moment five more were
named, and **a stated total of the set is exactly what D-03.2 forbids.** It now describes
the state of the evidence, which is true at any membership, and the gap counts in the
summaries carry the quantity without anyone typing one.

## W-30 · Correction: the frozen homepage is not byte-for-byte HEAD, and must not be

AD-18 reported reverting it. `git diff` shows **22 insertions / 22 deletions**: the nav
rewire (18 nav hrefs + the Give chip), the footer's four named journeys, band 5/6/7's
per-item links, and the two-line `[href*="#"]` observer fix. **That is the intended state**
— the owner kept `The whole list →` and kept `Work → /work`, so the rewire stays and only
the button removal was reverted.

**What matters is that nothing moved, and it is verified:** document **10,266 at 375 ·
10,906 at 1440**, all thirteen band heights identical to the W-2 ledger to the decimal
(`work` 741.28 / 1013.83 · `record` 1415.23 / 1289.50), `href="#"` still **9**, button back
and pointing at `/work`.

Recorded because "reverted to HEAD" would have sent the next session looking for a
regression that does not exist.
