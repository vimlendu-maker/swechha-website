# AD-28 — Strip the provenance voice from the public pages

**Date:** 2026-08-23
**Status:** Ruled by the owner. Not open for re-litigation.
**Applies to:** everything a visitor reads. Explicitly NOT to `docs/design/**`.

---

## 1. The owner's words

> "delete this style of bringing the facts or dates. Just the numbers have to be
> there if incase source is not available. No need to write explanation of why
> this page is empty etc. Never like this: SOURCE-FACTS §200, owner 21 August
> 2026. Get me a Copy editor to relook at the copy. I dont like this style of
> writing such as ...given by executive director, given by owner, w....we dont
> have the numbers....numbers missing etc"

And, on a second specimen — the `#says` band lead on `/about`:

> "this kind of writing is problematic: *Five blocks. Four are quoted rather than
> written — where the organisation has already put a sentence on the record, this
> page uses that sentence. The fifth names the three things that make it a
> community organisation, and sources each one.*"

That second one is neither a citation nor a gap counter. It is the page
**describing its own editorial method to the reader**. A visitor came to read
about Swechha, not about how this page was assembled. It widens the rule, and it
is category 5 below.

This reverses part of a design language that AD-22, AD-25, AD-26, the FARM source
ledger and the SITUATION-PAGE-TEMPLATE deliberately built. That is understood and
intended. **Do not preserve any of it "for consistency" with a page that has not
been swept yet.** The unswept page is the one that is wrong.

---

## 2. The governing principle

The owner, giving the reason behind all three complaints:

> "this site is afterall presenting Swechha and its work. It cant keep giving
> process to a visitor. Situation sections are drawn from external data. Our
> other pages are about telling the world, what we do, how we do, how much have
> we done, impact, how to get involved, why, etc. It doesnt need this language,
> ah, 3 blocks are there because....ah this number missing"

This decides every case the five categories in §3 do not name.

### 2.1 The test for any sentence

**Is this Swechha and its work, or is this our process?**

Process goes. Not trimmed, not moved to a footnote, not shrunk into a caption —
out. Applied to a band lead: does a visitor learn something about the
organisation, or something about how the page was built?

### 2.2 The two kinds of page are governed differently

**SITUATION pages** — `/now` and its six children (`/now/air`, `/now/yamuna`,
`/now/heat`, `/now/forest-fire`, `/now/forest-loss`, `/now/climate-event`) — are
drawn from **external** data: CPCB, DPCC, FIRMS, GFW, IMD, WHO. There the source
and its method **are the substance**. Naming the monitor, the observation hour
and what the dataset actually counts is what makes those pages worth reading.
Keep it, and keep it plain.

**Every other page** — home, about, work, journeys, farm, impact, act, stories,
publications, search — is Swechha telling the world what it does, how, how much,
to what effect, and how to join in. **Those pages carry no sourcing apparatus at
all.** The figure stands on its own. And:

> If we cannot stand behind a figure, we do not publish it.

This supersedes the boundary I had drawn on my own initiative in §4.2 below. The
"named public institutional source" keep now applies **only to the situation
pages**. On the organisational pages it is stripped with everything else.

### 2.3 "This number is missing" is never publishable copy

Anywhere. Including the situation pages.

A hole in external data may be stated as **a fact about the data** — "CPCB
publishes no reading for this ward" — where that IS the story. It may never be
stated as **an apology about our page**.

This settles every empty state: where a band, card or figure has nothing behind
it, **show less, do not explain the absence**. A card with no photograph simply
has no photograph.

---

## 3. What goes

### Category 1 — Internal ledger references, of every kind

`SOURCE-FACTS §NN`, `D-xx`, `W-xx`, `AD-xx`, `F-x`, `R-x`, bare `§` citations,
and any pointer to a file in this repository (`data/about-people.json`,
"the farm source ledger", "the events register", "frozen homepage band 8").

These name documents that exist only inside this repository. A reader cannot
follow them, cannot check them, and was never meant to see them. They should
never have been published.

### Category 2 — Self-referential attribution

Who told us, and when.

- "owner, 22 August 2026" · "owner 2026-08-22"
- "given by the Executive Director on 22 August" · "Stated by the Executive Director"
- "counted August 2026" · "counted August 2026, from one tree at acquisition"
- "derived from the year the land was bought"
- "the term is now settled — it is the Executive Director's own — but the count is not"
- "The descriptions are theirs, not the site's"
- "Read from the pages that own them, so this page cannot come to disagree with them"
- "no start year sourced" · "period not sourced" · "cumulative, no start year sourced"

Every variant. The organisation speaking on its own website does not need to
attribute itself to itself.

**A span that is real content survives.** "since 2010", "over fifteen years",
"in 2019–20" tell the reader what period a figure covers and stay. What goes is
the *sourcing* half — "· SOURCE-FACTS §85", "· owner 2026-08-22", "· no start
year sourced". Where the span itself is unknown, print the figure with no span
rather than a confession that the span is missing.

### Category 3 — Gap counters and empty-state explanations

- "What this page cannot say yet · 4 GAPS", and every "N gaps" chip
- Every `.p-hole` marker whose content is an explanation of absence
- "There is no photograph on this page, and that is a finding rather than a gap"
- "no figure on this page came from one"
- "Naveen Joshua: description not published on this page yet."
- "We cannot tell you when a Yamuna Shramdaan last ran…"
- "One projects carries no figure at all: … Not padded, not estimated, not left out."
- "Claims waiting on a number" as a counted register
- Any band, disclosure, chip or note whose subject is what the page does not know

A band that existed **only** to enumerate holes is deleted whole — not emptied.
Deleting a band means re-checking `S.groundChain()`, the band ledger and the
page's index chips in the same edit.

### Category 4 — Apologetic and hedging framing

Copy that qualifies a figure into uselessness, or explains the organisation's
record-keeping to the reader instead of telling them the thing.

- "the limit somebody published for it" → "its published limit"
- "and we do not have a photograph of either state"
- "Not a quotation — a description, with each clause traceable"
- "Nothing on this page is pulled from them"

### Category 5 — Editorial meta-copy: the page narrating its own construction

**The largest category, and it runs through the band openers of nearly every
page.** Band leads that:

- count their own contents — "Five blocks.", "Four dated rungs", "Four of them, to show the shape of the problem"
- explain the sourcing method — "quoted rather than written", "with a method note behind every figure", "and sources each one"
- justify a design decision to the reader — "because a timeline with no sources is a mood board", "No date, on purpose."
- describe what the page is doing instead of doing it

**The test.** Read every `lead`, `standfirst`, `note` and opener string and ask:
*is this telling the reader something about the world, or something about this
page?* The second kind goes.

Where a lead was doing real work **as well as** narrating itself, keep the real
work and cut the narration — a shorter, plainer lead. Where a lead was pure
self-description, the band is better with just its heading and no lead at all.

**The trap.** "Repair the sentence around a deletion" does not license writing a
*new* sentence in this voice. The replacement says something a reader wants, or
it says nothing.

---

## 4. What stays

### 4.1 The number itself. Always.

Where a source line is deleted, the figure stays and simply stands unattributed.
Never delete a figure because its provenance line went. Never replace a figure
with a dash, a hedge, or a sentence about why it is uncertain.

### 4.2 The named public institutional source — SITUATION PAGES ONLY

CPCB, DPCC, NASA FIRMS, Global Forest Watch, IMD, WHO, NCRB, ISFR, the E(P)
Rules — in short form:

> CPCB, Anand Vihar · 03:00 IST

On `/now` and its six children this is the substance of the page (§2.2). The
monitor, the observation hour and what the dataset counts are why those readings
are worth anything.

**On every other page it is stripped with the rest.** The owner settled this
after I flagged the boundary as mine: an organisational page carries no sourcing
apparatus, and a figure Swechha cannot stand behind is not published rather than
published with a caveat.

The remaining boundary is narrow even on the situation pages. An **external
monitoring agency publishing a dataset** qualifies. Swechha's own brochure, its
own About page, its own project pages, its own staff, and this repository's
ledgers **never** qualify, on any page.

### 4.3 Brief methodology that stops a reader misreading a public dataset

FIRMS reports thermal detections, not fires. Tree-cover loss is not
deforestation. Dissolved oxygen is read downwards. AQI is governed by its worst
pollutant, not an average.

**Compressed to a clause, and phrased as a fact about the world rather than a
fact about the page.** This is the rewrite rule for the site's pervasive "this
page…" construction:

| before | after |
|---|---|
| "This page therefore never calls a detection a fire." | "A detection is not a fire." |
| "and no figure on this page came from one" | *(delete)* |
| "This page does not carry one, because it is not published in machine-readable form." | *(delete; keep the fact if there is one)* |

Self-narration that is load-bearing methodology gets **rewritten** into a
statement about the world. Self-narration whose only content is the page's own
construction gets **deleted**.

### 4.4 Author attribution on republished third-party writing

The essay pages carry a byline, a publication date, and a link to where the
piece first appeared. That is authorship of someone else's work, not the site
explaining itself. Their gates stay as they are.

### 4.5 Quotation marks around a real quotation

A sentence in quotation marks attributed to a named person speaking is content.
"Quoted from the organisation's own About page. Not paraphrased." is not.

---

## 5. Retraction: the Jagdamba Camp school

`/about` shipped a claim that **no source supports**, and it must not be
reconstructed.

The owner:

> "The following is untrue… Who told you Jagdamba camp has a school?"

**Nobody did.** The only source is SOURCE-FACTS §90–91:

> "ME to WE / Pagdandi — began 2007 as a volunteer school on the Yamuna's banks;
> became ME to WE in 2009 with children from Jagdamba Camp, Sheikh Sarai."

That is a volunteer school **on the Yamuna's banks in 2007**, and children
**from** Jagdamba Camp **in 2009**. The block at `build-about-page.mjs:398–401`
welded the two into "**the Jagdamba Camp school**" — an institution that appears
in no source.

The self-justifying tail made it worse: it asserted "each clause traceable" and
attached page numbers to a claim the pages do not make, so the citation dressed
an invention as a checked fact.

**Both paragraphs are deleted, not repaired.** The block was written this pass
only to carry the SEO phrase "community organisation" (AD-27.47); it fabricates;
and its second paragraph is a specimen of all five categories above.

**The failure mode has a name: a compression that invents a noun.** Two adjacent
true facts, joined, produce an entity that exists in neither. When a claim is
touched, check that the entity it names exists in the source rather than being
assembled out of neighbouring facts. If a claim cannot be traced, **delete the
claim** — do not guess a correction.

*Accurate and left alone:* "children from Jagdamba Camp, Sheikh Sarai"
(`/work/projects/me-to-we`) and "over 50 adolescent girls from Jagdamba"
(homepage, `/work/projects`). Only `/about` invented a school.

---

## 6. Gates: invert, never delete

Several generators carry gates that **require** the style being deleted — a gate
asserting a hole count, a gate asserting every figure carries a source, a gate
asserting an empty-state sentence is present.

**Those gates are inverted in the same edit as the deletion.** The build must now
fail if the deleted style RETURNS.

A gate deleted rather than inverted is how this comes back in six weeks. The
precedent is `build-about-page.mjs` gate 1c, which is the AD-27.39 headcount gate
inverted, and says so in its own comment.

Each inverted gate must be negative-tested: reintroduce the struck string, watch
the build exit non-zero, restore.

---

## 7. The mechanical acceptance test

Zero occurrences, in any file under `public/_pages/v3/`, of:

```
SOURCE-FACTS    §    " GAPS"    D-0    W-1    AD-2
```

HTML and script comments are not visible to readers, but they are stripped too
where they quote the deleted style as an example — otherwise the grep that
proves this rule keeps tripping over the rule's own documentation.

Then, on every page touched: band heights at 375 and 1440, ground adjacency,
`scrollWidth === innerWidth` at 320–1920, contrast from rendered pixels, console
clean, no heading skips, no duplicate ids. Captured with CDP
`Emulation.setDeviceMetricsOverride` — **never** a bare `--window-size`, which
has manufactured two phantom defect lists on this project.

Deleting a band changes composition. The PNGs are **read**, not just measured: a
measurement will not tell you a page now reads as thin.

---

## 8. Scope of the first pass

This document was written for, and first applied to, everything **except**
`scripts/build-work-pages.mjs`, `scripts/lib/work-shell.mjs` and `data/work/**`.
A follow-up pass applies the identical rule there. **The two must agree**, which
is why the rule is written down here rather than carried in a commit message.

---

## 9. Owner answers, 23 August 2026 — two reversals, recorded

Both are cases where **this pass removed a figure on the grounds that it was
untraceable, and the owner put it back.** They are recorded here because the
WORK pass must apply the same corrected rule, and because the reasoning error
is worth naming.

### 9.1 "3M+ children and young people reached since 2000" — kept, unhedged

The homepage figure stays at **3M+**. The line under it, *"Our own count,
verified to 31 March 2026"*, **still comes off** — no external audit exists and
the page should not imply one. The owner chose exactly that combination: publish
the figure, drop the verification claim.

The homepage cell now reads `3M+ · Children and young people reached since 2000`
over `Swechha's own record.`

> **Checked, and now consistent — but the scope is still ambiguous.** `/impact`
> carries a figure with the *same label* — "Children and young people reached",
> period "cumulative, since 2000" — attributed to **Bridge the Gap**, in
> `data/work/projects/bridge-the-gap.json`. It read **2 million** when this pass
> started; the WORK pass has since moved it to **3M+**, so the homepage and
> /impact now show the same number and there is no reader-visible contradiction.
>
> This pass did not touch it — it is a *programme* figure in another pass's file,
> and the instruction was to flag rather than change.
>
> **What is still open is the scope, not the number.** The homepage presents 3M+
> as Swechha's org-wide reach since 2000; /impact presents the identical figure
> and label as Bridge the Gap's. One of those framings is wrong, and they now
> agree only because both say 3M+. If the org-wide total and the programme total
> are genuinely the same number, that is worth stating; if they are not, the
> labels have to diverge. **Do not reconcile it by editing one to match the
> other** — that is how the 266/267 air contradiction got written.

### 9.2 "6,890 tonnes out of the Yamuna" — restored, unhedged

This pass removed it from the homepage ticker and the impact strip because it
traces to no source document in the repository. Asked directly, the owner
confirmed the figure is right and instructed that it go back.

**It is restored exactly as it was** — ticker cell, impact-strip figure, and
aria-label — **with no hedge, caveat or source note attached.** Under §2.2 an
organisational page carries no sourcing apparatus, and that cuts both ways: the
rule that strips a citation off a figure also forbids bolting a disclaimer onto
one. It is his figure, about his organisation's own work.

`/impact`'s sentence that the reading *"appears in no source document we hold"*
is gone — it was struck style anyway (the page explaining its own audit trail),
and it is now contradicted by the owner's confirmation.

### 9.3 The reasoning error, named

Both figures were pulled on the same faulty inference: **"this repository holds
no document for it" was treated as "we cannot stand behind it."**

Those are different claims. The repository is a partial record of a
twenty-six-year-old organisation, assembled from a handful of PDFs and a legacy
website. **The owner is a source.** §3.1's "the number itself, always" already
said the figure survives when its provenance line goes; what this pass got wrong
was deleting figures whose provenance was *only* the owner.

The corrected rule, and the one the WORK pass applies:

> An untraceable figure is a question for the owner, **not a deletion.** Ask.
> Delete only what he retracts — as he retracted the Jagdamba Camp school (§5)
> and the swales and bundhs (F-20) — and restore what he confirms, without a
> caveat.

The Jagdamba retraction stands and is not weakened by this. The distinction: that
was a **fabrication** — an entity welded out of two adjacent facts, which no
source and no person ever asserted. 6,890 tonnes and 3M+ are the owner's own
claims about his own organisation, and he was never asked before they were cut.
