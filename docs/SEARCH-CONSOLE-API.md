# Search Console API — what it can do, and the six steps to switch it on

**Date:** 2026-09-08 · **Status:** code wired, credential not created
**Owner action required:** four of the six steps below need a Google account.

## Read this first: what the API cannot do

Three things are widely assumed and two of them are wrong. Verified against
Google's own documentation on 8 September 2026, not from memory.

| | |
|---|---|
| **"Request Indexing" via API** | **Does not exist.** There is no API for that button. |
| **URL Inspection API** | **Read-only.** It returns "information about the provided URL in the Google index" and submits nothing. |
| **Indexing API** | **Not for us.** Google's quickstart: *"The Indexing API can only be used to crawl pages with either `JobPosting` or `BroadcastEvent` embedded in a `VideoObject`."* Swechha publishes neither. |

Plenty of SEO advice recommends calling the Indexing API for ordinary pages
anyway. It is outside the documented scope, and this repository does not
publish a figure it cannot source or call an endpoint it is not entitled to.

**So no content page on this site can be pushed to Google by anybody**, through
this API or any other. What follows is the three things that are sanctioned.

## What is wired

`scripts/search-console.mjs`, zero dependencies — a signed JWT via `node:crypto`
and two `fetch` calls, the same reasoning that gave this repo its own CSV
parser.

```bash
node scripts/search-console.mjs --check                    # who am I, what can I see
node scripts/search-console.mjs --sitemap      [--dry-run] # resubmit sitemap.xml
node scripts/search-console.mjs --inspect /learn/pm25 …    # is it indexed?
node scripts/search-console.mjs --analytics --days 28      # pull the baseline
```

- **`--sitemap`** is the one genuine push available for ordinary pages: the
  supported way to say *look again*. It also reports the sitemap's error count,
  which is silent in the UI unless somebody opens the report.
- **`--inspect`** is monitoring. It is how you find out whether anything worked,
  and it is read-only by design. Paced at 100 ms between calls, well under the
  documented 600/minute per property.
- **`--analytics`** is the one that matters most. Search Console is the only
  source of impressions, CTR and position, **and it keeps only sixteen months** —
  every week not pulled is a week that can never be recovered.

`.github/workflows/search-console.yml` runs the pull weekly (Mondays) and
commits the snapshot. Without the secret it says so in the job summary and
stops; it never pretends to have run.

## The performance file appends and never overwrites

`data/seo/search-performance.json` grows. Google revises its own figures for
days after the fact — exactly as CPCB re-serves an observation — and this site
already keeps both versions of one of those. A re-read of a window already
recorded is stored **beside** the first, never on top of it, because a figure
quoted from a report is worthless if the report silently changed underneath it.

Each snapshot carries: totals, a per-section split derived from the URL path
(`/learn`, `/now`, `/record`, `/journal`, `/schools`, `/work`, `/stories`), a
branded/non-branded split, and the top 40 pages and queries. The brand rule is
`/swechha|vimlendu/i` and is **stated in the file** rather than implied, because
a brand filter is a judgement and not a classifier.

## The six steps

Steps 1–4 need a Google account. Steps 5–6 are this repository.

1. **Google Cloud project.** console.cloud.google.com → create or pick a
   project. Any project works; it holds nothing but the identity.
2. **Enable two APIs** in that project: **Google Search Console API** and
   **Web Search Indexing API** is *not* needed — only the first. (Search for
   "Google Search Console API" and enable it.)
3. **Create a service account** → Keys → Add key → **JSON**. Download it. This
   file is the credential; treat it like a password. Note the
   `client_email`, which looks like `something@project.iam.gserviceaccount.com`.
4. **Add that email to the property.** Search Console → Settings → Users and
   permissions → Add user → paste the `client_email` → permission **Owner**
   (Full will not permit sitemap submission). *This is the step people miss,
   and it produces a 403 that reads like a code bug.*
5. **GitHub secret.** Repository → Settings → Secrets and variables → Actions →
   New **secret** named `GSC_SERVICE_ACCOUNT_JSON`, contents = the whole JSON
   file, unquoted. The script also accepts base64 if pasting raw JSON is
   awkward.
6. **GitHub variable.** Same screen, **Variables** tab → `GSC_PROPERTY`. For a
   domain property this is `sc-domain:swechha.in`. For a URL-prefix property it
   is `https://swechha.in/` **with the trailing slash**. They are different
   properties with different data; the wrong one returns 403 and looks like a
   permissions failure.

Then run the workflow manually with **action: check**. It prints the properties
the service account can see and whether `GSC_PROPERTY` is one of them.

## What still has to be done by hand, forever

**Request Indexing.** After a large addition, open Search Console →
URL Inspection → paste the URL → Request Indexing. There is no API for it. Four
requests on `/learn`, `/schools`, `/record` and `/journal` seed four sections,
and that remains the fastest way to get new work looked at.

## Testing status, stated honestly

The JWT signing path is verified — RS256 signature generated and verified
locally, including the escaped-newline form a GitHub secret produces. Every
other path requires a credential that does not exist yet, so **nothing here has
been run against Google**. The first `--check` run is the real test.
