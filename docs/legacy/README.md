# Legacy WordPress URL capture

**Captured 2026-08-23, while `swechha.in` still served WordPress.**

This directory exists because of a closing window. Once DNS moves `swechha.in`
to Vercel, the old site's sitemaps stop answering and the inventory of what
used to live at which URL is no longer recoverable from the live web. The
redirect entries in `/redirects.ts` can be written at any time; **this list
could only be taken before cutover.** Nothing here is generated at build time
and nothing reads it at runtime — it is an archive.

## What was captured

Source of truth was `https://swechha.in/sitemap.xml` (All in One SEO v4.9.4.1).
Note that `wp-sitemap.xml` and `sitemap_index.xml` both 302 to it, and the
site's `robots.txt` still advertises the stale Yoast `sitemap_index.xml` — three
names, one document.

`sitemaps/` holds all twelve child sitemaps exactly as served, plus the index.
`wp-url-inventory.{json,tsv}` is the flattened list, produced by
`extract-inventory.mjs` (re-runnable against the raw XML, not against the live web).

| Type | Count | Redirects needed? |
|---|---|---|
| `post` | 146 | **Yes** — the blog archive |
| `page` | 19 | **Yes** — the top-level site |
| `project` | 45 | **Yes** — maps onto the new WORK section |
| `profile` | 16 | **Yes** — team bios; `/about` now carries these |
| `attachment` | 996 | No — attachment *pages*, not files (see gap 1) |
| `soliloquy` | 3 | No — slider objects, never reader-facing |
| `post_tag` | 6 | Judgement call — tag archives |
| `pj-categs` | 7 | Judgement call — project category archives |
| `pl-categs` | 2 | Judgement call — playlist category archives |
| **Total** | **1240** | 226 are content URLs |

1240 rows, zero duplicates. The 146/19/45/16 counts agree exactly with
`docs/design/2026-08-22-LEGACY-SITE-CONTENT-AUDIT.md`, which crawled the same
site a day earlier by a different method — so two independent passes concur.

`attachment-sitemap2.xml`, `attachment-sitemap3.xml` and
`post-archive-sitemap.xml` are listed in the index but are genuinely empty
(well-formed `<urlset>`, no entries). That is the old site's state, not a
failed fetch.

## Two gaps the sitemap does not cover

**Gap 1 — no file URLs at all.** There are zero `wp-content/` and zero `.pdf`
entries in any sitemap. The `attachment` type lists WordPress attachment
*pages* (`/open-mic-night-at-remakery/img_8792/`), not the media they wrap. The
consequence is that the eleven annual/activity reports and two statutory
certificates on the old About page — the organisation's transparency record —
are invisible to a sitemap-driven migration and would 404 silently at cutover.
Eight are recoverable and were HTTP-verified 200 `application/pdf` on
2026-08-23, totalling ~2.9 MB:

| File | KiB |
|---|---|
| `2016/06/Activity-Report-2011-2013.pdf` | 90 |
| `2016/06/Activity-Report-2013-14.pdf` | 268 |
| `2016/06/Activity-Report-2014-15.pdf` | 270 |
| `2016/06/INFLUENCE-ANNUAL-REPORT-2012-2013.pdf` | 562 |
| `2016/06/Me-to-We-_Final-Report-2014.pdf` | 109 |
| `2016/06/NSN-BTG_-final-report.pdf` | 1310 |
| `2020/04/Swechha-Annual-report-2016-17.pdf` | 156 |
| `2020/04/Tax-Residency-Certificate-80G.pdf` | 116 |

All are under `https://swechha.in/wp-content/uploads/`. The audit records five
further listed reports that already 404 at both hosts, and no 2019–20 or
2021–22 report listed anywhere — report those years as gaps rather than
papering over them.

### The eight, saved and verified 2026-08-23

Saved to `documents/`, checksums in `documents/SHA256SUMS.txt`. Every file was
checked rather than assumed: `%PDF-` magic present, `%%EOF` present as the last
token (two files carry only a trailing `\r` or `\r\n` after it, which is
intact, not truncated), and byte length equal to the `Content-Length` the server
advertised. 159 pages in total.

| File | Bytes | Pages | Text layer |
|---|---|---|---|
| `Activity-Report-2011-2013.pdf` | 92 104 | 33 | yes |
| `Activity-Report-2013-14.pdf` | 274 827 | 27 | yes |
| `Activity-Report-2014-15.pdf` | 276 600 | 27 | yes |
| `INFLUENCE-ANNUAL-REPORT-2012-2013.pdf` | 575 591 | 24 | **NO — scan** |
| `Me-to-We-_Final-Report-2014.pdf` | 111 477 | 9 | yes |
| `NSN-BTG_-final-report.pdf` | 1 340 936 | 17 | yes |
| `Swechha-Annual-report-2016-17.pdf` | 159 960 | 21 | yes |
| `Tax-Residency-Certificate-80G.pdf` | 118 315 | 1 | **NO — scan** |

**Two of the eight are image-only scans** — 0 embedded fonts, all content as
image XObjects (67 across 24 pages for INFLUENCE; a single image for the 80G
certificate). They are readable by a human and useless to a screen reader, a
search index, or any quote-checking. If these get re-hosted, they need OCR or a
transcribed summary beside them; publishing an NGO's tax-exemption certificate
as an unlabelled image is an accessibility defect, not a neutral choice.

The other four annual reports (2020–21, 2022–23, 2023–24, 2024–25) live on
Google Drive, not on WordPress, so the cutover does not threaten them and they
were not copied here. They are still a dependency worth removing eventually: a
Drive link is not a permanent URL and the folder's sharing state can change
without anyone noticing.

Do not judge these files by `du` output. `du` reports block allocation, so
`NSN-BTG` shows as 2.0M against its true 1 340 936 bytes — which is exactly the
`Content-Length` the server sent. Compare byte counts, not disk usage.

### Where they live, and why not in `public/`

`docs/legacy/documents/` is an **archive**, not a served directory. Re-hosting
is a separate decision belonging to the `/about` transparency section: which
reports to surface, how to present the five that are already lost and the two
missing years, and what to do about the two untranscribed scans. When that is
settled, `git mv` the chosen files into `public/` — a move, so the 3.6 MB is
never carried twice — and add the redirects from the old `wp-content` paths.
Until then a reader reaching an old PDF URL gets a 404, the same as today's
broken staging links, so nothing regresses by waiting.

**Gap 2 — the old About page's own links are already broken.** Every
`wp-content` link rendered on the live About page points at
`http://q7s.734.mytemp.website/…`, a staging domain that 301s to nothing. Only
the `swechha.in` rewrite of the same path resolves, which is the path recorded
above. Do not inherit the staging host into any redirect or re-host.

## Deliberately not captured

Date archives, author archives, feeds (`/feed/`, `/*/feed/`), search URLs and
paginated `/page/N/` variants: none appear in the sitemap, all are
WordPress-shaped conventions with no analogue on the new site, and a redirect
for each would be guesswork. If Search Console later reports traffic to any of
them after cutover, add entries then — that is a decision better made on real
404 data than on speculation.

---

## The post capture

`posts-raw/` holds all 146 posts as `/wp-json/wp/v2/posts` returned them, six
files of 25. **Not 100 at a time:** asking for `content` on 100 posts makes the
old server return a WordPress error page instead of JSON, and it does so with
HTTP 200 — so a fetch loop that only checks the status code will cheerfully
write 2 KB of HTML over what it believes is data. The same request without
`content` succeeds, which is what makes the failure confusing.

`posts-analysis.json` is the derived table — per post, the length of its real
body text — produced by `analyze-posts.mjs`.

**61 of the 146 posts have zero body text.** The distribution is cleanly
bimodal: 61 posts at exactly 0 characters, then nothing at all until 200. There
is no threshold to argue about and no judgement in the split. Measure TEXT, not
markup: an "empty" WordPress body is not the empty string but a wrapper —
`<p>&nbsp;</p>`, a page-builder shell, a comment. A count that strips tags but
leaves entities reports 87 real posts instead of 85, because two of them contain
nothing but entity padding.

51 of the 61 shells are the lost 2014–17 press clippings the audit describes.
The other **8 are dated 2025-08-21**, and that is worth correcting: the audit
characterised the shells as 2014–15 only. These are recent, and each one names a
broadcast whose video IS in `data/media/youtube-index.json` — ten title probes,
ten hits. Their bodies were empty; their content was never lost.

The 85 real posts are overwhelmingly **dated activity reports** — Monsoon
Wooding 2016/17/18/19, Gram Anubhavs, Yamuna Shramdaan, Pagdandi Summer School,
NatureScapes camps, Me to We job exposure camps. That is why they map so cleanly
onto WORK items that already exist, and why 963 KiB of their prose is kept here:
it is the raw material for the pages the re-point list asks for.

## The redirect map

`build-redirect-map.mjs` derives `redirect-map.{tsv,json}` from the capture plus
the site's own registers. It is a script and not 226 hand-written lines because
**a redirect map fails quietly**: a mistyped destination is a 308 into a 404,
which looks alive to a crawler and is worse than never redirecting at all. So
the map is gated — and the gate earned its place immediately by rejecting the
first draft for mapping `/` to `/`.

Three gates: every destination must be a route that actually exists (read out of
`data/work/onward.json`, never restated); every captured URL must be accounted
for exactly once, as a redirect or as a deliberate `none`; and no destination may
itself be a redirect source, so there are no chains.

**226 content URLs → 168 redirects, 58 deliberate 404s.**

| Confidence | n | Meaning |
|---|---|---|
| `exact` | 67 | the same thing, and a detail page exists for it |
| `folded` | 7 | a duplicate or variant slug, onto its real twin |
| `parent` | 94 | no page for this yet — points at the true parent section |
| `none` | 58 | deliberately no redirect |

The 45 old project URLs include about ten duplicates — the `-2` suffixes, the
`future-`/`futures-` typo pair, `remakery`/`remakery-india` — which is why they
resolve to far fewer distinct destinations than their count suggests.

### The `parent` rows are a build backlog, not a rounding error

93 old URLs carry real content and have no specific page on the new site.
Grouped by where they land, they rank the missing pages by what the old site
actually published rather than by anyone's opinion:

| Old URLs | Landing on | What is missing |
|---|---|---|
| 26 | `/stories` | podcast series, films, masterclasses, webinars |
| 22 | `/work/projects` | Remakery, Green Finance, Road to Leadership, Women & Non-Traditional Livelihoods, Circular Economy |
| 13 | `/farm` | the farm training suite — beekeeping, composting, soil regeneration, women farmers |
| 13 | `/work` | programme activity with no clearer parent |
| 7 | `/work/events` | Shramdaan, Yamunotsav and Cyclothon have no detail pages |
| 5 | `/work/campaigns` | the air-pollution campaigns |

This independently confirms audit §1.5 and orders it. Re-point these rows as the
pages get built: a redirect to a section index serves a reader without
satisfying them, and that gap is what `parent` records.

### Owner rulings, 2026-08-23

- **The 8 recent press shells → `/stories`.** Their videos are in the index, so
  the thing the reader clicked does exist. The audit had said let them 404, on
  the belief that every shell was 2014–15.
- **`/profile/kamlika-chandla/` → no redirect.** She has left. The other 15
  profiles point at `/about` because those people are on it; sending a reader
  looking for her to a page that never names her is a promise the page cannot
  keep, and a former colleague's bio going quiet is the normal outcome.
- **`/learning-to-grow-with-swechha/` → `/act`** — a recruitment piece aimed at
  18–25s, not a programme report.
- **`/donate-mainpage/` → `/act`.** The redirect is settled; what `/act` should
  say about giving is a separate question. The old page publishes two full bank
  account sets, INDIAN and FCRA, which ruling G-1 keeps off the new site.
  Pointing the URL at `/act` does not republish them.

### Five redirects that were not guessed

`content/essay/_index.json` records each published essay's `original` URL, so
those five are read out of the repo rather than inferred — and they match the
five longest posts in the capture exactly.
