# Search visibility action plan — off-site work

**Date:** 2026-08-30
**Status:** owner-run. Nothing in this document is executed by the on-site
work in the same pass (register title/description edits, `/llms.txt`) — it
is the list of what's left, and why each item can't be a code change.

## Why this is a separate document

Eleven phrases were checked against live search results before any work
started: `best environment ngo of india`, `top environment ngo of india`,
`top 10 environment ngo of india`, `top ngo of india`, `best ngo delhi`,
`best ngo india`, `air pollution ngo`, `school trips`, `vimlendu jha`,
`vimlendu jha environmentalist`, `top environmentalist of india`. Two are
winnable through the site's own content (title/description work, done in
this pass). The rest are dominated by third-party listicles, donation
platforms, or a decades-deep canon of national figures — no page edit on
swechha.in moves those. This document is the plan for the part that
actually moves them.

## 1. Listicle inclusion — the "top/best NGO" family

Checked 2026-08-30. Swechha does **not** currently appear on any of these,
and every one of them is a candidate for a submission or a direct email —
most explicitly solicit "let us know if we missed you" style inclusion:

| Site | URL | Note |
|---|---|---|
| Grow Billion Trees | growbilliontrees.com/pages/top-10-ngos-in-india | Also runs a Delhi-specific list and a 50-NGO list |
| Unessa Foundation | unessafoundation.org/environmental-conservation-ngos-in-india | Also a separate "climate change NGOs" list |
| Social for Action | socialforaction.com/blog/top-ngo-for-environment-protection-in-india | |
| Inventiva | inventiva.co.in/trends/top-environmental-ngos-india | |
| Sakal Relief Fund | sakalrelieffund.com/blog/ngo-for-environment-protection | |
| Impaac | blog.impaac.org/top-10-environmental-ngos-in-india | |
| India Is Us | indiaisus.com/blog/top-environmental-ngo-in-india.html | |

**Already working — verify, don't rebuild:** [AQI.IN's "5 Environmental
Organizations in Delhi"](https://www.aqi.in/blog/5-environmental-organizations-delhi/)
lists Swechha **first**, ahead of Chintan, CSE and TERI. Worth a check that
its outbound link points at a live swechha.in URL and not a dead WordPress
one — the pattern `[[swechha-seo-baseline]]` already found elsewhere on the
old site.

**What to send each site:** one paragraph — founding year, focus areas
(air, Yamuna, youth environmental education, the farm), registration status
(80G/12A/FCRA), and a link to `/about`. Don't lead with a self-declared
superlative ("we are one of the best") — lead with what's checkable. Most of
these sites monetise through their own ad/affiliate placement, not through
a paid-inclusion model, so this is an editorial pitch, not a purchase.

## 2. Press — fixing links that already exist

`[[swechha-seo-baseline]]` (2026-08-25 audit) found this is the
highest-value lever for non-brand search generally, not just this query set:
existing press coverage (YourStory and others) links to dead pre-migration
WordPress URLs. Each fixed link is both a working referral and a signal to
Google that the new domain structure is the real one. This needs the
outlet's cooperation — an email to whoever handles corrections/updates,
pointing at the specific dead URL and its live replacement.

## 3. NGO directories (India-specific)

Distinct from the listicles above — these are registries donors and CSR
teams actually search, and several are free to list on:

- **NGO Darpan** (ngodarpan.gov.in) — the government registry; if Swechha
  isn't listed, this is the single most credible directory available, and
  it's free.
- **GuideStar India / Give.do** — donor-facing NGO transparency directory.
- **GlobalGiving** — if Swechha wants international donor visibility.

## 4. Google Business Profile

Relevant to the local-pack version of `best ngo delhi` (the map/local
results Google shows alongside organic ones). Needs the owner's Google
account — not something this repo can set up. **Respect the standing
ruling:** no phone number goes on the profile or anywhere else that syncs
back to the site (G-4, enforced by a build gate at
`scripts/build-hero.mjs:512`) — a Business Profile can be created with just
an address and hours, phone is optional.

## 5. The Vimlendu Jha Wikipedia option

The single highest-leverage move for the `vimlendu jha` / `vimlendu jha
environmentalist` queries specifically, and genuinely different from
everything above: Wikipedia and Wikidata are weighted heavily by AI answer
engines as grounding sources, more than most SEO tactics reach. No
Wikipedia article exists for him today (confirmed by search, 2026-08-30).

This is **not** a rename of the existing `docs/wikipedia/Draft-Swechha.wiki`
draft — `[[swechha-wikipedia-draft]]` already found that most independent
press coverage is about Vimlendu personally rather than the organisation,
which is exactly the condition under which a *personal* article is the
better-sourced one, not the org article. A biography of a living person
carries a stricter notability and sourcing bar (WP:BLP) than an
organisation does, and the same COI process applies (he is the subject,
so any draft needs a `{{connected contributor}}` declaration, via Articles
for Creation, never straight to mainspace).

**This needs its own decision and its own sourcing pass** — not something
to fold into this document's other items. Flagging it here so it isn't
lost, not proposing to start it.

## 6. Search submission — what is now automatic, and what still is not

Added 2026-09-08, after checking rather than assuming.

**Automatic now.** `.github/workflows/indexnow-new-pages.yml` submits any page
file **added** in a push to `main`. It closes a real gap: IndexNow was wired
only into `content-rebuild.yml` and `climate-events.yml`, each of which submits
only the pages *it* changed — so forty URLs added by hand in PRs #87–#89
(`/learn`, `/schools`, `/record`, `/journal`) were published and never
announced. Those forty were submitted by hand on 8 September; everything after
is automatic.

It filters to **added, not modified**, on purpose. `scripts/ping-indexnow.mjs`
records that the hourly air job is deliberately *not* wired to IndexNow, because
`/now/air` changes a few dozen times a day and submitting one URL that often is
the behaviour the protocol asks you not to exhibit. A trigger on "any changed
page" would reverse that decision by the back door. It also stands down when
the pushing commit is authored by `actions@github.com`, so the workflows that
already submit their own pages do not submit them twice.

**IndexNow does not reach Google.** It reaches Bing, Yandex, Seznam and Naver.
Both legacy sitemap pings are dead and were verified against the live
endpoints: Google's answers 404 *"Sitemaps ping is deprecated"* and Bing's
answers 410 Gone. Never wire either.

**What Google actually gets** is the sitemap `lastmod`, which this repo already
computes from a content hash so it moves only when a page really changed —
Google's own stated replacement for the ping. That is a passive signal: hours
to weeks.

**The only push route to Google needs the owner.** Two options, and the first
is ten minutes:

1. **Search Console, by hand.** Resubmit `sitemap.xml`, then URL-inspect and
   Request Indexing on `/learn`, `/schools`, `/record` and `/journal` — four
   requests seed four sections. Do this after any large addition.
2. **The Search Console API**, which needs an OAuth service account added as a
   property owner. Deliberately not wired: unattended credentials for a search
   property are a bigger commitment than a cron job should make on its own. It
   remains a real option if the publishing rate justifies it.

**Also owner-only, and time-sensitive:** set the measurement baseline. Thirty
Learn articles are in the sitemap with no before-figures recorded against them,
and the comparison gets weaker every day it is left.

## What NOT to do

- No paid "best NGO" award/badge schemes — several exist and most are
  pay-to-play recognition mills that don't move real search rankings and
  can read as astroturfing if discovered.
- No purchased backlinks — the org's own credibility is the asset here;
  a link-farm backlink is a liability if it's ever audited.
- No self-declared superlative claims added to swechha.in itself ("India's
  best environmental NGO") — unearned and against the site's own copy
  standard; #7 (`air pollution ngo delhi`) and #8 (`school trips`) already
  work by being specific and checkable instead.
