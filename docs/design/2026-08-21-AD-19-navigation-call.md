# AD-19 — The navigation call: `/work` does not exist

**One decision, made from outside the build.** Captured with CDP
`Emulation.setDeviceMetricsOverride` at 375×635 and 1440×900 and read as PNGs:
`home.html` (10,363px at 375), `work/index.html` (5,224 / 5,208), `work/projects.html`
(4,551), `intelligence.html` (6,502).

---

## The ruling

**Delete `/work`.** The nav word `Work` points at `/#work` — the homepage band that is
already the section's table of contents. The section is 14 pages, not 15.

### Why, in the form the client asked for

He asked what `/work` holds that homepage bands 4–7 do not. **Measured, one sentence:
nothing.**

| `/work` band | what it is |
|---|---|
| 1 · masthead | 630px of "Everything Swechha runs, in one place" at 1440 |
| 2 · **What we do** | homepage band 4 **verbatim**, plus one clause ("from two hours to fifteen years") |
| 3 · **What is running** | homepage band 6's head; 7 project rows instead of 3 |
| 4 · **In public** | homepage band 7's head; the campaigns and events registers in full |
| 5 · **Go and see** | homepage band 5's head; the four journeys, *without* the frames |
| 6 · cross-sell | three links, two of which are nav words |

Its own architecture doc defends it as "register rows only… that is what stops it becoming
a second homepage." Read as rendered, that defence describes the failure, not the fix: a
page whose every head is borrowed and whose only addition is longer lists is not an index,
it is homepage bands 4–7 with the photographs taken out.

**And the four kinds are already linked from band 4.** Each of `Projects` `Campaigns`
`Journeys` `Events` in that band is an `<a>` to its own landing page
(`home.html:3455–3474`). The index job is done, on the page everyone lands on.

**The Situations comparison, which is the client's own diagnosis and is correct.**
`intelligence.html` opens by *defining* a situation, states that six units cannot be
averaged, refuses to publish a total and explains why, then teaches the four stamp words.
That content exists nowhere else on the site, and its six children are reachable no other
way. That is what an index page earns its place with. `/work` teaches nothing and indexes
four pages the homepage already links. **The shape was copied; the reason for the shape was
not.**

Each kind page, by contrast, does carry original content: `projects.html` opens with
"What a project is here" and a cross-link to the other three kinds before its register.
The per-kind definition and the named holes on `/work/campaigns` are the section's real
argument. The union of four registers is not.

---

## Answers

**1 · Does `/work` exist?** No. Delete `public/design/v3/work/index.html`; replace
`app/work/page.tsx` (49 lines of pre-design campaign cards — nothing is lost) with a
permanent redirect to `/#work`. The URL must not 404: it is guessable, it is the parent of
eleven live paths, and every kind page's masthead carries a `← Work` return.

**2 · What does clicking `Work` do?** `/#work`, from everywhere — and **the client is
right without breaking W-2.** W-2's rule is *one word, one destination*, not *one word, one
page*; `Farm` and `Record` already discharge it as absolute homepage anchors. `/#work` is a
same-page scroll from the homepage and a navigate-plus-jump from `/work/projects`, and it
is **the same destination either way**. One word, one URL, two renderings of the same
arrival. The defect W-2 fixed was `#work` *relative* — meaningless from inside the section.
That is not what this is.

**3 · `Work` and `Journeys` both in six?** Yes, keep both. BRANDING §5.10 already rules the
nav "a selection of five destinations, not a partition", so a child beside its parent is
not an error — and Journeys is the only nav word with a bookable action behind it, the
best-sourced material on the site and the lowest-friction way in. Demoting the conversion
path to keep a taxonomy tidy is the wrong trade. It stays `/work/journeys`; do not promote
it to `/journeys`, which would orphan it from its four children.

**4 · Which pages should not exist.** `/work` — delete now. **`/work/events` — do not port
it.** Four names, and no date, edition, count, location or description for any of them
anywhere on disk (AD-17 §3, ledger hole 8). A landing page for four names with no facts is
thinner than the index I am deleting. Until one event has one date, it is the second
register band on `/work/campaigns` — where the homepage already pairs them, under "In
public" — reached at `/work/campaigns#events`, and band 4's `Events` row points there.
**That lands the section at 13 pages: 3 landings + 10 item pages.** The other twelve stand:
each holds sourced material that appears nowhere else.

**5 · `aria-current`.** The distinction matters, because `Work` no longer points at a page:

| standing on | marked |
|---|---|
| homepage | wordmark `aria-current="page"`; the existing band observer keeps `aria-current="true"` on Work / Farm / Record as the reading line passes |
| `/work/projects`, `/work/campaigns` | **Work**, `aria-current="true"` — its href is not this URL, so `"page"` would be a lie |
| project item pages | **Work**, `aria-current="true"` |
| `/work/journeys` | **Journeys**, `aria-current="page"` — href *is* the URL |
| the four journey pages | **Journeys**, `aria-current="true"` |
| `/now`, `/impact` | that word, `aria-current="page"` |

`aria-current="page"` only where the href equals the current URL. Everywhere else `"true"`,
which is exactly what it is for.

---

## The edit, exactly

Six href values and one deletion, all in `public/design/v3/home.html`:

- **3 × `href="/work"` → `href="/#work"`** — `.navlinks` (3049), `#navidx` (3074),
  `.navscroll` (3074). No visual change, no band moves.
- **Delete band 4's `The whole list →` action** (3452). It is a fifth link to four names
  that are already links, and its destination is gone. Band 4's head loses its right-hand
  column. *This is the one visual change and it needs the owner's word.*
- **Footer `Projects and campaigns` (4188) → `/#work`.**
- **Band 4's `Events` row → `/work/campaigns#events`**, per answer 4.

Then `app/work/page.tsx` → redirect, and the generator stops emitting `work/index.html`.
`LINKS.json` loses one destination (72 → 71).

---

## Where I am uncertain, and what settles it

**`/work/events`.** I am deciding against the page on the evidence on disk, but the
evidence may simply be in three sign-in-blocked Drive folders. **One line — a date and a
location for Yamunotsav — flips it back to a page**, and the answer costs the owner a
sentence. Ask before the port, not after.

**Deleting band 4's button.** I am confident it should go, less confident the head reads
right without it at 1440, where the right-hand column becomes empty. If it looks
unbalanced, the head takes the lead sentence across both columns rather than the button
coming back.

**Not in doubt:** `/work` itself. Two captures, two widths, six bands, four of them
borrowed heads. This is the cheapest moment this call will ever cost — the prototype is
deleted before deploy and the live route is a placeholder — and it will not be cheap once
the port has run.
