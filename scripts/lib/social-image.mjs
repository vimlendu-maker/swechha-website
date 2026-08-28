/* ═══ THE SHARE IMAGE IS THE PAGE'S OWN PHOTOGRAPH ═══════════════════════
 *
 * WHAT THIS REPLACES, AND WHY THE OLD ANSWER WAS WRONG.
 * Every one of the built pages shipped the same `og:image`:
 * `/images/og/og-default.png`, a black card with the wordmark on it. So a link
 * to the Nepal glacial-flood page, to /work/projects/eco-action, to /farm and
 * to the homepage all previewed identically in WhatsApp, on X, on LinkedIn and
 * in Slack — a logo, forty times over. The reasoning recorded in
 * `app/layout.tsx` was that per-page cards are "a production job with no owner
 * and no photo budget". That is true of DESIGNED cards, and it is the wrong
 * frame: these pages already open on a full-bleed photograph chosen for them.
 * Nothing has to be produced. The card just has to stop ignoring the page.
 *
 * The principle, in the owner's words: if a page has a meaningful image, the
 * image represents the story and the logo represents the publisher — so a
 * shared link should show the story.
 *
 * ── WHY DERIVED FROM THE RENDERED MARKUP, NOT DECLARED BY EACH GENERATOR ──
 * Twenty generators write these pages and each already knows its hero. Passing
 * `ogImage` down through all of them would have meant twenty edits, twenty
 * chances to forget, and a twenty-first page built later with no card at all —
 * the exact failure mode `design-routes.ts` documents four times over for
 * routes ("a built page, a routed page and a linked page are one change").
 *
 * So this reads THE PAGE. It runs at the four points where HTML is written to
 * disk, over the finished document, and answers "what is the primary image on
 * this page" from the markup a reader will actually get. A page whose hero
 * photograph changes gets a new card on its next build without anyone
 * remembering to update a second place, which is the whole of requirement 3.
 * A page built next year by a generator that does not exist yet gets one too.
 *
 * ── WHAT COUNTS AS THE PRIMARY IMAGE ─────────────────────────────────────
 * In order:
 *   1. The first candidate carrying `fetchpriority="high"`. That attribute is
 *      the page's own declaration of its LCP element — the generators put it
 *      on the hero and nowhere else — so it is a statement of intent, not a
 *      heuristic. 26 of the 39 built pages carry exactly one.
 *   2. Otherwise the first candidate in document order.
 *
 * A CANDIDATE is an `<img>` that is:
 *   · a raster photograph under `/images/` — not `/brand/` (the wordmark),
 *     not `/icons/`, not `/images/og/` (the fallback card itself), not SVG;
 *   · not inside `<header>`, `<footer>`, `<template>` or `<noscript>`;
 *   · not inside anything carrying `hidden` or `display:none` — LOAD-BEARING
 *     ON THE HOMEPAGE, where `build-hero.mjs` promotes and demotes the whole
 *     active-situation slide with a single `hidden` attribute, and hides the
 *     satellite `<figure>` on its own when no usable frame exists. Without
 *     this the homepage could advertise a satellite frame no reader is shown;
 *   · big enough to be worth sending: at least 600 × 315. Below that X falls
 *     back from `summary_large_image` to the small card, which is the logo
 *     problem again in a different costume;
 *   · present on disk. A card pointing at a 404 is worse than the brand card,
 *     because the failure is invisible until somebody shares the link.
 *
 * ── AND WHEN THERE IS NO SUCH IMAGE ──────────────────────────────────────
 * Ten pages genuinely carry no photograph: /now, /now/air/india, /act,
 * /search, /work/journeys/gram-anubhav and the five essays under /stories.
 * They fall back to the brand card, which is requirement 4 exactly — a
 * neutral publisher card is the honest answer for a page with nothing to
 * show. It is NOT inherited from a parent route: `/stories/cyclone-biparjoy`
 * would then preview under a photograph of a hillside gathering, and a card
 * that looks like documentation of the story is worse than one that plainly
 * is not.
 *
 * ── THE GATE ─────────────────────────────────────────────────────────────
 * `scripts/verify-seo.mjs` re-derives this from each committed page and fails
 * if the head disagrees, so a page rebuilt by a generator that skipped this
 * step cannot ship a stale card quietly.
 */

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { imageSize } from './image-size.mjs';
/* A DELIBERATE IMPORT CYCLE, and it is safe: situation-shell.mjs imports
   `withSocialImage` from here and this file imports `ROOT`/`abs` from there.
   Neither module TOUCHES the other's bindings while its own body is
   evaluating — both uses are inside function bodies that run at build time —
   so ESM's live bindings resolve them long after both modules are
   initialised. The alternative was a second copy of the origin logic, and
   `situation-shell.mjs`'s ORIGIN comment records what a duplicated origin
   already cost this site once (a corrupted sitemap and robots.txt). One
   definition of "what is this site's absolute URL" is worth the cycle. */
import { ROOT, abs } from './situation-shell.mjs';

/* The neutral publisher card, and the ONLY hardcoded image path here. It is
   1200×630 — the dimensions are stated rather than measured so a check can
   fail loudly if the file is ever replaced with something differently sized. */
export const FALLBACK = { src: '/images/og/og-default.png', width: 1200, height: 630, alt: 'Swechha' };

/* Below this an image is not worth a large card. X drops to the small
   summary card under 300px on either axis; 600×315 is the documented floor
   for `summary_large_image` and comfortably above Facebook's 200×200 minimum
   while staying under every hero this site actually ships. */
const MIN_W = 600;
const MIN_H = 315;

const MIME = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };

/* Paths that are chrome or plumbing rather than content. `/images/og/` is here
   so a second pass cannot pick up the fallback card and call it a photograph. */
const NOT_CONTENT = /^\/(?:brand|icons)\//i;
const IS_OG_CARD = /^\/images\/og\//i;

const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr']);

/* ── MASK THE EMBEDDED LANGUAGES, KEEPING EVERY INDEX ─────────────────────
   The range scan below counts `<div` against `</div>`, and these pages carry
   28KB of inline script. A `'</div>'` inside a JS string would throw the count
   off. Replacing script/style bodies and comments with spaces of the same
   length leaves every offset in the real document unchanged, so a match found
   in the masked copy indexes correctly into the original. */
function mask(html) {
  let out = html;
  const blank = (s) => ' '.repeat(s.length);
  out = out.replace(/<!--[\s\S]*?-->/g, blank);
  out = out.replace(/(<script\b[^>]*>)([\s\S]*?)(<\/script>)/gi, (_, o, b, c) => o + blank(b) + c);
  out = out.replace(/(<style\b[^>]*>)([\s\S]*?)(<\/style>)/gi, (_, o, b, c) => o + blank(b) + c);
  return out;
}

/* True for a bare `hidden` / `hidden=""` / `hidden="hidden"`, false for
   `aria-hidden` (which hides from assistive tech, not from the eye — an
   aria-hidden hero is still the page's photograph) and for `data-hidden`. */
const isHidden = (attrs) => /(?:^|\s)hidden(?:\s|=|$)/i.test(attrs)
  || /style="[^"]*display\s*:\s*none/i.test(attrs);

/**
 * The [start, end) spans of every element that disqualifies an image inside it.
 *
 * MATCHED LOCALLY BY TAG NAME rather than by maintaining a document-wide
 * element stack. A stack is only correct for markup with no implied end tags
 * anywhere; counting `<tag` against `</tag>` from one opening tag forward is
 * correct for THAT element regardless of what the rest of the document does,
 * and these are all explicitly-closed containers.
 */
function excludedRanges(html) {
  const masked = mask(html);
  const ranges = [];
  const OPEN = /<([a-zA-Z][a-zA-Z0-9-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/g;
  let m;
  while ((m = OPEN.exec(masked))) {
    const name = m[1].toLowerCase();
    const attrs = m[2];
    if (VOID.has(name)) continue;
    const disqualifies = name === 'header' || name === 'footer'
      || name === 'template' || name === 'noscript' || isHidden(attrs);
    if (!disqualifies) continue;

    /* Walk forward to this element's own end tag, counting nested opens of the
       same name. An unclosed element runs to the end of the document, which is
       the safe direction: it excludes more, never less. */
    const openRe = new RegExp(`<${name}\\b`, 'gi');
    const closeRe = new RegExp(`</${name}\\s*>`, 'gi');
    let depth = 1;
    let at = OPEN.lastIndex;
    let end = masked.length;
    while (depth > 0) {
      openRe.lastIndex = at;
      closeRe.lastIndex = at;
      const o = openRe.exec(masked);
      const c = closeRe.exec(masked);
      if (!c) { end = masked.length; break; }
      if (o && o.index < c.index) { depth++; at = o.index + 1; continue; }
      depth--;
      at = c.index + c[0].length;
      if (depth === 0) end = at;
    }
    ranges.push([m.index, end]);
  }
  return ranges;
}

const attrOf = (tag, name) => (tag.match(new RegExp(`\\s${name}="([^"]*)"`, 'i')) || [])[1] ?? null;

/**
 * The page's primary image, or null if it genuinely has none.
 * Returns `{ src, width, height, alt, why }` — `why` names the rule that
 * chose it, so the build log says what happened rather than only what it did.
 */
export function primaryImage(html) {
  const ranges = excludedRanges(html);
  const inExcluded = (i) => ranges.some(([a, b]) => i >= a && i < b);

  const candidates = [];
  for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = m[0];
    if (inExcluded(m.index)) continue;
    if (isHidden(tag)) continue;

    const src = attrOf(tag, 'src');
    if (!src || !src.startsWith('/')) continue;
    if (NOT_CONTENT.test(src) || IS_OG_CARD.test(src)) continue;
    const ext = (src.match(/\.([a-z0-9]+)$/i) || [])[1]?.toLowerCase();
    if (!ext || !MIME[ext]) continue;
    if (!existsSync(join(ROOT, 'public', src.slice(1)))) continue;

    /* The width/height attributes every generator emits via imgDim() are the
       cheap answer; a hand-written tag without them is measured off the file,
       the same fallback responsiveImages() uses. */
    let width = Number(attrOf(tag, 'width')) || 0;
    let height = Number(attrOf(tag, 'height')) || 0;
    if (!width || !height) {
      const d = imageSize(src) || {};
      width = width || d.width || 0;
      height = height || d.height || 0;
    }
    if (width < MIN_W || height < MIN_H) continue;

    candidates.push({
      src,
      width,
      height,
      alt: attrOf(tag, 'alt') || '',
      priority: /\sfetchpriority="high"/i.test(tag),
    });
  }

  if (!candidates.length) return null;
  const lead = candidates.find((c) => c.priority);
  if (lead) return { ...lead, why: 'fetchpriority="high" — the page names it as its LCP image' };
  return { ...candidates[0], why: 'first content image in document order' };
}

/* ── WRITING IT INTO THE HEAD ─────────────────────────────────────────────
   The shells emit exactly one `og:image` and one `twitter:image`, so these
   patterns swallow the tag AND any `og:image:*` / `twitter:image:*` siblings a
   previous run of this function left behind. That is what makes it idempotent:
   running it twice produces the same head, not two sets of dimensions. */
const OG_RUN = /<meta property="og:image(?::(?:secure_url|type|width|height|alt))?" content="[^"]*">/g;
const TW_RUN = /<meta name="twitter:image(?::alt)?" content="[^"]*">/g;

/* Attribute-safe, and NOT esc(). Alt text on these pages arrives already
   carrying entities (`&rsquo;`, `&mdash;`) because it came through the same
   generators as the titles; re-escaping `&` would ship the literal characters
   "&rsquo;" into a share card. Only the two characters that can break out of a
   double-quoted attribute are touched — the identical rule, and the identical
   reason, as `attr()` in situation-shell.mjs. */
const attr = (s) => String(s ?? '').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/**
 * Rewrite a finished document's share-image tags to point at its own primary
 * image. Returns `{ html, image, fallback, why }`.
 *
 * EVERY URL IS ABSOLUTE AND DERIVED THROUGH `abs()`, never written as a
 * literal — the rule the whole of situation-shell.mjs's ORIGIN comment exists
 * to enforce, after a hardcoded origin silently corrupted this site's sitemap
 * and robots.txt once already. Under `SITE_ORIGIN` the cards move with
 * everything else instead of pointing back at production.
 */
export function withSocialImage(html, { label = '' } = {}) {
  const found = primaryImage(html);
  const img = found ?? FALLBACK;
  const ext = (img.src.match(/\.([a-z0-9]+)$/i) || [])[1].toLowerCase();

  /* `og:image:alt` is the description a screen reader gets when the card is
     read out in a timeline, so a hero with real alt text carries it through.
     The fallback card's "Swechha" is the honest description of a wordmark. */
  const alt = img.alt || FALLBACK.alt;
  const og = [
    `<meta property="og:image" content="${attr(abs(img.src))}">`,
    /* Facebook prefers `og:image:secure_url` when the page is https, and this
       site is https-only (`upgrade-insecure-requests` in the CSP). Same value;
       stating it removes a round of guessing on the crawler's side. */
    `<meta property="og:image:secure_url" content="${attr(abs(img.src))}">`,
    `<meta property="og:image:type" content="${MIME[ext]}">`,
    /* Dimensions let a crawler lay the card out on FIRST fetch instead of
       showing nothing until it has downloaded and measured the file — which is
       why a freshly-shared link so often previews blank on the first paste. */
    `<meta property="og:image:width" content="${img.width}">`,
    `<meta property="og:image:height" content="${img.height}">`,
    `<meta property="og:image:alt" content="${attr(alt)}">`,
  ].join('');
  const tw = [
    `<meta name="twitter:image" content="${attr(abs(img.src))}">`,
    `<meta name="twitter:image:alt" content="${attr(alt)}">`,
  ].join('');

  let seenOg = 0;
  let out = html.replace(OG_RUN, () => (seenOg++ === 0 ? og : ''));
  let seenTw = 0;
  out = out.replace(TW_RUN, () => (seenTw++ === 0 ? tw : ''));

  if (!seenOg || !seenTw) {
    console.error(`REFUSING TO WRITE: ${label || 'this page'} has no og:image/twitter:image tag to `
      + 'rewrite (found ' + seenOg + ' og, ' + seenTw + ' twitter). Every page gets its share tags '
      + 'from headTags() in situation-shell.mjs or work-shell.mjs; a page assembling its own <head> '
      + 'must emit those two tags for this pass to find.');
    process.exit(1);
  }

  const why = found ? found.why : 'no photograph on this page — the neutral brand card stands in';
  if (label) console.log(`  share card   ${img.src}  (${img.width}x${img.height}) — ${why}`);
  return { html: out, image: img, fallback: !found, why };
}
