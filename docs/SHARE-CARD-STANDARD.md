# The share card: the story, not the publisher

*Settled 28 August 2026, reversing AD-27.49.*

When a swechha.in URL is pasted into WhatsApp, X, LinkedIn, Facebook, Slack or
Signal, the preview shows **that page's own lead photograph**. Not the
wordmark, not the favicon, not a designed card.

> If a page has a meaningful image, the image represents the story. The
> Swechha logo represents the publisher. So when a link is shared, show the
> story image.

## What it replaced

Every one of the 39 built pages shipped the same `og:image`:
`/images/og/og-default.png`, a black card with the wordmark on it. A link to
the Nepal glacial-flood page, to `/work/projects/eco-action`, to `/farm` and to
the homepage all previewed identically — the publisher, forty times over.

`app/layout.tsx` recorded the reasoning (AD-27.49): per-page share images were
"a production job with no owner and no photo budget". **That argument was
answering a different question.** It read per-page cards as *designed* cards —
thirty-nine compositions somebody has to make. They are not. Every one of these
pages already opens on a full-bleed photograph chosen for it. The card is
derived, not produced. Nothing was commissioned to make this change.

## The rule

For each page, in order:

1. **The first image carrying `fetchpriority="high"`.** That attribute is the
   page's own declaration of its LCP element — the generators put it on the
   hero and nowhere else — so it is a statement of intent, not a guess. 26 of
   the 39 built pages carry exactly one.
2. **Otherwise the first content image in document order.**
3. **Otherwise the neutral publisher card**, `/images/og/og-default.png`.

An image is a candidate only if it is:

- a raster photograph under `/images/` — not `/brand/` (the wordmark, which
  clears the size floor easily and must never become a card), not `/icons/`,
  not `/images/og/`, not SVG;
- outside `<header>`, `<footer>`, `<template>` and `<noscript>`;
- not inside anything carrying `hidden` or `display:none`. **Load-bearing on
  the homepage**, where `build-hero.mjs` promotes and demotes the whole
  active-situation slide with a single `hidden` attribute and hides the
  satellite `<figure>` on its own when no usable frame exists. A card derived
  without this would advertise a frame no reader is shown;
- at least 600 × 315. Below that X drops from `summary_large_image` to the
  small square card — the photograph reduced to the size the logo used to
  occupy;
- actually present under `public/`. A card pointing at a 404 previews as no
  card at all, and the failure is invisible until somebody shares the link.

Every page also emits `og:image:secure_url`, `og:image:type`,
`og:image:width`, `og:image:height`, `og:image:alt`, `twitter:image`,
`twitter:image:alt` and `twitter:card: summary_large_image`. The dimensions
matter: without them a crawler has to download and measure the file before it
can lay the card out, which is why a freshly-pasted link so often previews
blank on the first attempt.

**A parent's photograph is never inherited.** `/stories/cyclone-biparjoy` would
then preview under a photograph of a hillside gathering, and a card that looks
like documentation of the story is worse than one that plainly is not.

## Where it lives

The site has two rendering paths and therefore two implementations of one rule.

| | Path | Owner |
|---|---|---|
| 39 built pages | static HTML under `public/_pages/v3/`, served by `next.config.ts`'s rewrites | `scripts/lib/social-image.mjs` |
| `/explore`, `/stories/[slug]`, `/work/campaigns/[slug]` | App Router, `generateMetadata` | `lib/social.ts` |

`lib/social.test.ts` asserts the two agree on the fallback and its dimensions,
so they cannot drift into two different answers.

### The built pages

`withSocialImage()` runs at the four points where page HTML is written to
disk — `scripts/lib/situation-shell.mjs`'s `assemble()`,
`scripts/lib/work-shell.mjs`'s `writePage()`, `scripts/build-situation-air.mjs`
and `scripts/build-hero.mjs` — **after** the `srcset` pass and **before** the
`lastmod` stamp, so the sitemap hash covers what actually ships.

It reads the finished document rather than taking a declared value from each of
the twenty generators. That is the whole design: a page whose hero photograph
changes gets a new card on its next build with nobody remembering a second
place, and a page built next year by a generator that does not exist yet gets
one too.

`npm run build:social-cards` sweeps every built page (`--check` reports without
writing). It calls the same function the generators call, so it can only agree
with them; it exists as the migration, as the repair for a generator that
assembles its own `<head>`, and as the answer to "show me what every page would
get" without opening 39 files. It runs in `.github/workflows/generated-current.yml`
after every generator.

### The App Router routes

`shareCard(image, { type })` returns the **whole** `openGraph` and `twitter`
objects. That is not stylistic. **Next.js merges `metadata` shallowly, per
top-level key** — a route writing

```ts
openGraph: { title, description, images: [src] }
```

does not add to the layout's `openGraph`, it *replaces* it, silently dropping
`og:site_name`, `og:locale` and `og:type` on that route alone. Both dynamic
routes were doing exactly that. The failure is invisible in review — the page
has an `og:image`, so it looks handled — and only shows up as a card missing
its publisher line in somebody's timeline.

## The gate

`scripts/verify-seo.mjs` **re-derives** the answer from each committed page and
fails if the head disagrees. It does not merely check that `og:image` is "not
the default": a page whose hero was swapped and whose head was not rebuilt
fails there rather than shipping yesterday's card. `npm run build:social-cards`
is the fix.

`lib/social.test.ts` additionally asserts, for every built page, that the card
image exists on disk and clears 600 × 315.

## What is still true after this

**Ten pages carry no photograph and keep the brand card**, which is the correct
answer for a page with nothing to show, not a gap in the mechanism:

`/now` · `/now/air/india` · `/act` · `/search` · `/work/journeys/gram-anubhav` ·
and the five essays under `/stories/`.

The five essays are the ones worth revisiting: they are the site's most
shareable writing and `content/essay/_index.json` carries no image field at
all. Giving each a lead photograph is an editorial job, not a code one — and
the moment one lands on the page, its card follows on the next build with no
further change here.

**Eight heroes are portrait** (`/posters`, `/stories`, `/work`,
`/work/projects`, `/work/projects/influence`, `/work/projects/me-to-we`,
`/work/campaigns/no-plastic`, `/work/journeys/yamuna-yatra`). X centre-crops
those to 1.91:1. That is inherent to showing the page's real photograph rather
than a card made for the aspect ratio, and it is the trade this standard
chooses.
