# Analytics Phase 1 (Collection) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every page on swechha.in reports pageviews to a self-hosted Umami instance, served same-origin so the Content-Security-Policy is unchanged, with a build gate that fails if any page loses the tag.

**Architecture:** Umami (an open-source Next.js app) is deployed as a second Vercel project backed by its own Neon Postgres. Its tracker script and collection endpoint are proxied through `swechha.in` via `next.config.ts` rewrites, so both are same-origin and `script-src 'self'` needs no allow-list entry. One JSON file (`data/analytics.json`) is the single source of the website ID and paths; the `.mjs` generators, the TypeScript config and the React layout all read from it. `scripts/verify-seo.mjs` gains a check asserting every built page carries the tag.

**Tech Stack:** Umami (self-hosted, current release — do not pin to a major version in this plan; the deploy tracks the fork), Neon Postgres, Vercel, Next.js 16 App Router, Node ESM build scripts (`.mjs`), Vitest.

**Spec:** `docs/superpowers/specs/2026-08-24-analytics-design.md` — read §3, §4 and §5 before starting. This plan implements Phase 1 only (§6).

---

## Global Constraints

Copied verbatim from the spec. Every task's requirements implicitly include these.

- **The website ID is a committed constant, never an environment variable.** `.github/workflows/generated-current.yml` regenerates all pages and `exit 1`s if the working tree moves. An env var absent in CI would produce different HTML and fail a gate it did not break. The ID is public in the page source anyway, so it is not a secret.
- **Shell change + regenerated HTML must land in the SAME commit** (spec §5.3). The 35 pages under `public/_pages/v3/` are committed artefacts, not build output.
- **New `verify-seo.mjs` checks land in the same commit as the fix that makes them pass** — the convention is stated in that file at the line above `const CHECKS = [`.
- **The tracker is served at `/record` and the collector at `/api/ledger`** — both verified live on 2026-08-26. **`TRACKER_SCRIPT_NAME` is used VERBATIM by Umami v3; it does NOT append `.js`** (v2 did, which is the source of much stale advice — this plan's own first draft included). The deployed value is `record`, so the path is `/record`, and `/record.js` is a 404. Do not fall back to Umami's defaults `/script.js` or `/api/send` — Umami serves those alongside the custom names, and both appear on keyword blocker lists, which would reintroduce the undercount that disqualified GA4.
- **The production CSP header must be byte-identical before and after this work.** If the CSP changes, the proxy is misconfigured.
- **Do not create additional Vercel accounts to spread usage.** The team is on Hobby by owner ruling (spec §3.6); splitting across accounts is circumvention and explicitly a fair-use violation.
- **Start from a clean tree on a branch off `main`.** `scripts/lib/situation-shell.mjs` and `next.config.ts` have been observed changing mid-session from a concurrent agent (spec §10). Re-verify every line number with `grep` before editing; the anchors below are hints, not guarantees.
- Tests run via `npm test` (Vitest). **`vitest.config.mts` includes only `lib/**/*.test.ts`** — a test placed anywhere else will silently not run.

---

### Task 1: Provision Umami and its database

No repository changes. This task produces the two values every later task consumes.

> **There is no Umami signup, and you must not create one.** Umami's docs
> confirm self-hosting is entirely self-contained — no umami.is account is
> involved at any point. Signing up at umami.is creates an **Umami Cloud**
> account, which is the option spec §2 rejects: its free tier is 100K
> events/month, 6-month retention and **no API access**, and the missing API is
> what makes the Phase 3 `/impact` figures impossible. The only account in this
> plan is the admin account on *your own* instance, created automatically at
> Step 4.

> **Order matters here.** Neon comes before the Vercel import because Umami
> will not boot without `DATABASE_URL`, and the password change (Step 4) comes
> before the public domain (Step 5) deliberately — see the warning in Step 4.

**Files:**
- Create: none (infrastructure only)
- Modify: none

**Interfaces:**
- Consumes: nothing
- Produces: the dashboard host `https://analytics.swechha.in` and `WEBSITE_ID` (a UUID). Task 2 and Task 3 both need these exact values.

- [ ] **Step 1: Create an isolated Neon project**

In the Neon console, create a **new project** named `swechha-analytics`. Do **not** reuse the project holding ward/newsletter subscriptions — spec §3.1 explains why: Umami writes on every pageview, and exhausting the shared 100 CU-hour cap would suspend the compute that newsletter confirmation and ward alert emails depend on.

**Region: co-locate it with the Vercel function region, and put both near India if available** (Neon `ap-southeast-1` / Singapore, Vercel `sin1`). This is not cosmetic. Every Umami write is a round trip from the Vercel function to Postgres; a cross-continent hop stretches function duration, which spends *both* Vercel Active CPU and Neon compute hours. Since spec §3.1 identifies Neon's 100 CU-hour cap as the binding constraint on the whole design, shortening that round trip directly buys headroom against the thing most likely to fail first. Confirm the region is offered on the free plan before selecting; if Singapore is unavailable, match whatever region both providers share.

Postgres version: accept the default.

Copy the **pooled** connection string — the one containing `-pooler`. Serverless needs pgbouncer, and the direct string will exhaust connections under concurrent pageviews.

- [ ] **Step 2: Fork Umami — a TRUE fork, not the one-click clone**

Umami's Vercel guide offers a `vercel.com/new/clone` button. **Do not use it.**

That button creates a *clone* — a fresh standalone repo with no upstream link to `umami-software/umami`. GitHub's "Sync fork" button does not exist on a clone, so every future update becomes a manual `git remote add upstream` + merge. Spec §8's update plan ("syncing the fork is a periodic chore") assumes a real fork; the clone quietly breaks it, and it breaks it in a way nobody notices until the first security update.

A real fork costs three clicks and keeps one-click updates forever:

1. Open `https://github.com/umami-software/umami`
2. Click **Fork** (top right)
3. Owner: `vimlendu-maker`. Leave the name as `umami`. Keep **"Copy the `master` branch only"** ticked — the other branches are upstream development history and are not wanted.
4. Click **Create fork**

The result is `https://github.com/vimlendu-maker/umami`, which shows "forked from umami-software/umami" and carries a **Sync fork** button. If that line and that button are absent, a clone was created instead — delete it and redo the fork.

The fork is public, which is correct: it is MIT-licensed upstream code with no Swechha data in it. Nothing in it is secret; the secrets live in Vercel's environment variables (Step 3).

- [ ] **Step 3: Import the fork into Vercel and set the environment variables**

1. Go to `https://vercel.com/new`
2. **Select the team first** — the scope selector at the top. Choose the existing team, not a personal scope. Getting this wrong puts the project in the wrong account and the fix is a project transfer.
3. Find `vimlendu-maker/umami` in the repository list. If it is not listed, click **Adjust GitHub App Permissions** and grant Vercel access to the new fork.
4. Click **Import**.
5. **Before clicking Deploy**, expand **Environment Variables** and add all six from the table below. The first deploy will fail without `DATABASE_URL`, and — more subtly — will build a tracker at the *default* path if `TRACKER_SCRIPT_NAME` is missing, so `/record` would 404 and Task 2 Step 10 would fail for a reason that looks like a proxy bug.
6. Click **Deploy**.

Set all six now, not later:

| Variable | Value |
|---|---|
| `DATABASE_URL` | the pooled Neon string from Step 1 |
| `APP_SECRET` | output of `openssl rand -hex 32` |
| `TRACKER_SCRIPT_NAME` | `record` |
| `COLLECT_API_ENDPOINT` | `/api/ledger` |
| `DISABLE_TELEMETRY` | `1` |
| `PRIVATE_MODE` | `1` |

Generate the secret with:

```bash
openssl rand -hex 32
```

`TRACKER_SCRIPT_NAME` is used **verbatim** by Umami v3 — it does *not* append `.js`. The value `record` therefore serves the tracker at `/record`. (Umami v2 did append the extension; that is the source of a lot of stale advice, this plan's first draft included.) `DISABLE_TELEMETRY` and `PRIVATE_MODE` are required by spec §3.2: a self-hosted analytics install that phones home would undercut the entire reason for choosing it.

- [ ] **Step 4: Deploy, then change the default password before anything else**

Deploy. Umami seeds an account on first boot with username `admin` and password `umami` — this is still true as of 2026 and applies to every install method.

**Change it before you do anything else, and before Step 5 attaches the public domain.**

This is not routine hygiene. Default Umami credentials are *actively scanned for*: there is a published Nuclei detection template for exactly this, so internet-reachable instances get probed automatically. The dashboard will hold every reader's browsing pattern across a site covering Yamuna pollution and forest loss — an unauthenticated copy of that is a real harm, not an inconvenience.

Doing the password change while the instance is still only on its obscure `*.vercel.app` URL keeps the exposure window as small as it can be. That is why Step 5 comes after this one.

Record the new password in the team password manager, **not** in this repo. Consider a passphrase rather than a generated string — it will be typed by people, not just pasted.

- [ ] **Step 5: Point `analytics.swechha.in` at the Umami project**

Spec §3.3. In the Umami Vercel project: **Settings → Domains → Add**, enter `analytics.swechha.in`. Vercel will show the DNS record to create — a `CNAME` for `analytics` pointing at `cname.vercel-dns.com`. Add it wherever swechha.in's DNS is managed (the same zone holding the `google-site-verification` TXT that `scripts/verify-cutover.mjs` checks).

Wait for Vercel to report the domain as Valid, then confirm:

```bash
curl -sI https://analytics.swechha.in/record | head -1
```

Expected: `HTTP/2 200`.

**Use this domain as the proxy target in Task 2, not the `*.vercel.app` URL.** It is stable, it is legible in `data/analytics.json`, and it survives the project being renamed. Hobby allows 50 domains per project, so this costs nothing.

- [ ] **Step 6: Create the website record and capture the ID**

In Umami: **Settings → Websites → Add website**. Name `swechha.in`, domain `swechha.in`. Save, then open its settings and copy the **Website ID** (a UUID).

- [ ] **Step 7: Verify the tracker path before touching the repo**

If Step 5's `curl` already returned `200`, this is confirmed. If it 404s, `TRACKER_SCRIPT_NAME` is wrong — fix it before continuing, because every later task assumes this path.

- [ ] **Step 8: Record both values**

Write the host (`https://analytics.swechha.in`) and `WEBSITE_ID` where Task 2 can read them. Both are committed in Task 2; neither is a secret.

---

### Task 2: Same-origin proxy and the CSP inventory comment

Ships safely on its own: a proxy with nothing yet calling it is inert.

**Files:**
- Create: `data/analytics.json`
- Create: `lib/analytics.ts`
- Create: `lib/analytics.test.ts`
- Modify: `next.config.ts` — the `rewrites()` function, and the CSP inventory comment (grep for `no analytics`; it was at `:87`)

**Interfaces:**
- Consumes: the dashboard host and `WEBSITE_ID` from Task 1
- Produces:
  - `data/analytics.json` — `{ host, websiteId, scriptPath, collectPath }`
  - `lib/analytics.ts` exports `ANALYTICS: { host: string; websiteId: string; scriptPath: string; collectPath: string }`, `trackerTag(): string`, and `analyticsRewrites(): { source: string; destination: string }[]`
  - Task 3 reads the same JSON from `.mjs` via the `J()` helper; Task 4 imports `ANALYTICS` from `lib/analytics`.

- [ ] **Step 1: Write the failing test**

Create `lib/analytics.test.ts`. It must live under `lib/` — `vitest.config.mts` includes only `lib/**/*.test.ts`.

```typescript
import { describe, expect, it } from 'vitest'
import { ANALYTICS, analyticsRewrites, trackerTag } from './analytics'

describe('analytics config', () => {
  it('uses names that keyword blockers do not match', () => {
    /* Spec §4: `umami.js` and `/api/send` are on blocker lists. Using them
       would reintroduce the undercount that disqualified GA4 in §2. */
    expect(ANALYTICS.scriptPath).toBe('/record')
    expect(ANALYTICS.collectPath).toBe('/api/ledger')
    expect(ANALYTICS.scriptPath).not.toMatch(/umami|analytics|track/i)
    expect(ANALYTICS.collectPath).not.toMatch(/umami|analytics|track|send|collect/i)
  })

  it('has a real website id', () => {
    expect(ANALYTICS.websiteId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    )
  })

  it('points at an https host with no trailing slash', () => {
    expect(ANALYTICS.host).toMatch(/^https:\/\//)
    expect(ANALYTICS.host).not.toMatch(/\/$/)
  })

  it('rewrites both the script and the collector to the umami host', () => {
    const rules = analyticsRewrites()
    expect(rules).toHaveLength(2)
    expect(rules).toContainEqual({
      source: '/record',
      destination: `${ANALYTICS.host}/record`,
    })
    expect(rules).toContainEqual({
      source: '/api/ledger',
      destination: `${ANALYTICS.host}/api/ledger`,
    })
  })

  it('does not collide with an existing app/api route', () => {
    /* app/api holds air, ward, newsletter and keystatic. A collision would
       shadow a real endpoint. */
    for (const taken of ['/api/air', '/api/ward', '/api/newsletter', '/api/keystatic']) {
      expect(ANALYTICS.collectPath).not.toBe(taken)
    }
  })

  it('emits a defer-loaded same-origin script tag', () => {
    const tag = trackerTag()
    expect(tag).toBe(
      `<script defer src="/record" data-website-id="${ANALYTICS.websiteId}"></script>`,
    )
    /* Same-origin is the whole point: an absolute src would need a CSP
       allow-list entry and break the promise at next.config.ts. */
    expect(tag).not.toContain('http')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npm test -- analytics
```

Expected: FAIL — `Cannot find module './analytics'`.

- [ ] **Step 3: Create the data file**

Create `data/analytics.json`, substituting the two values from Task 1:

```json
{
  "host": "https://analytics.swechha.in",
  "websiteId": "REPLACE-WITH-WEBSITE-ID",
  "scriptPath": "/record",
  "collectPath": "/api/ledger"
}
```

This file is the single source of truth. It is committed because the ID must be identical in CI (see Global Constraints). Only `websiteId` needs substituting — `host` is the domain set up in Task 1 Step 5.

- [ ] **Step 4: Write the module**

Create `lib/analytics.ts`:

```typescript
import config from '@/data/analytics.json'

/**
 * ONE SOURCE FOR THE TRACKER, read by three consumers that cannot import each
 * other: this module (TypeScript — `next.config.ts` and `app/layout.tsx`), and
 * `scripts/lib/situation-shell.mjs` (Node ESM, which cannot import `.ts`).
 * They agree because they read the same JSON, and `verify-seo.mjs` asserts the
 * emitted tag matches this module's `trackerTag()` on every built page.
 *
 * The website id is committed rather than read from `process.env` on purpose.
 * `generated-current.yml` regenerates all 35 pages and fails if the tree moves;
 * an env var absent in CI would change the HTML and fail a gate it did not
 * break. The id is public in the page source regardless, so it is not a secret.
 */
export const ANALYTICS = config as {
  host: string
  websiteId: string
  scriptPath: string
  collectPath: string
}

/** The exact tag every page must carry. Same-origin — see `analyticsRewrites`. */
export function trackerTag(): string {
  return `<script defer src="${ANALYTICS.scriptPath}" data-website-id="${ANALYTICS.websiteId}"></script>`
}

/**
 * Proxies the tracker and the collector through this origin, which is what
 * keeps `script-src 'self'` and `connect-src 'self'` untouched. Without these
 * two rules the tag above 404s.
 */
export function analyticsRewrites(): { source: string; destination: string }[] {
  return [
    { source: ANALYTICS.scriptPath, destination: `${ANALYTICS.host}${ANALYTICS.scriptPath}` },
    { source: ANALYTICS.collectPath, destination: `${ANALYTICS.host}${ANALYTICS.collectPath}` },
  ]
}
```

- [ ] **Step 5: Confirm JSON imports are enabled**

```bash
grep -n "resolveJsonModule" tsconfig.json
```

If absent, add `"resolveJsonModule": true` to `compilerOptions` in `tsconfig.json`.

- [ ] **Step 6: Run the test to verify it passes**

```bash
npm test -- analytics
```

Expected: PASS, 6 tests. If the website-id test fails, `data/analytics.json` still holds the placeholder.

- [ ] **Step 7: Wire the rewrites into next.config.ts**

Find the `rewrites()` function. It currently reads:

```typescript
  async rewrites() {
    return { beforeFiles: designRoutes(), afterFiles: [], fallback: [] }
  },
```

Replace with:

```typescript
  async rewrites() {
    /* The two analytics rules come FIRST and are exact paths, so they cannot be
       shadowed by a designRoutes() pattern. They are what make the tracker
       same-origin — see lib/analytics.ts and the CSP note in headers() below. */
    return {
      beforeFiles: [...analyticsRewrites(), ...designRoutes()],
      afterFiles: [],
      fallback: [],
    }
  },
```

Add the import beside the existing ones at the top of the file:

```typescript
import { analyticsRewrites } from './lib/analytics'
```

- [ ] **Step 8: Rewrite the CSP inventory comment**

Spec §4.1 makes this a required deliverable, not a nicety: the comment asserts the site has no analytics, and that becomes false today. An inventory that lies is worse than none.

Locate it:

```bash
grep -n "no analytics" next.config.ts
```

Replace the sentence claiming there is no analytics with:

```
         THE ALLOW-LIST IS THE AUDIT'S OWN INVENTORY, not a guess: every
         external subresource on the live site is a `youtube-nocookie.com`
         embed (8), a `fonts.googleapis.com` stylesheet, or a
         `fonts.gstatic.com` font file. Analytics was added on 26 August 2026
         and DELIBERATELY DOES NOT APPEAR HERE: the Umami tracker and its
         collector are proxied through this origin by the two rules at the top
         of `rewrites()` above, so the browser sees `/record` and
         `/api/ledger` as first-party. `script-src 'self'` and
         `connect-src 'self'` therefore still describe the truth, and no
         third-party host was added. If that proxy is ever removed, the host
         must be allow-listed here — which is the point of having this header
         at all.
```

- [ ] **Step 9: Verify the CSP header is byte-identical**

This is the check that proves the proxy approach worked. Capture the header before and after:

```bash
npm run build && npm run start &
sleep 5
curl -sI http://localhost:3000/ | grep -i content-security-policy
```

Expected: identical to production today — `script-src 'self' 'unsafe-inline'` with no new hosts. If a host appears, the proxy is misconfigured; stop and fix before Task 3.

- [ ] **Step 10: Verify the proxy actually serves the script**

```bash
curl -s http://localhost:3000/record | head -c 120
```

Expected: JavaScript source, not a 404 page. This proves the rewrite reaches Umami.

- [ ] **Step 11: Commit**

```bash
git add data/analytics.json lib/analytics.ts lib/analytics.test.ts next.config.ts tsconfig.json
git commit -m "feat(analytics): proxy the tracker through this origin so the CSP need not change

The tracker and collector are served from /record and /api/ledger via
rewrites, so script-src 'self' still describes the truth. The inventory
comment in headers() is rewritten to say so — an inventory that lies is
worse than none.

Nothing calls these paths yet; the tags land in the next commit."
```

---

### Task 3: Tag the 35 static pages, and gate them

**These three things must land in ONE commit.** Spec §5.3: the built pages are committed artefacts and `generated-current.yml` fails if regenerating moves the tree. The gate must land with them per the convention stated in `verify-seo.mjs`.

**Files:**
- Modify: `scripts/lib/situation-shell.mjs` — add a `TRACKER` export; inject at the `assemble()` template (grep `${sh.HEAD_FONTS}`)
- Modify: `scripts/lib/work-shell.mjs` — inject at its `<head>` template (grep `${sh.HEAD_FONTS}`)
- Modify: `scripts/build-situation-air.mjs` — inject at its hand-rolled `<head>` (grep `${HEAD_FONTS}`)
- Modify: `scripts/verify-seo.mjs` — one new entry in `CHECKS`
- Modify: all HTML under `public/_pages/v3/` (regenerated, not hand-edited)

**Interfaces:**
- Consumes: `data/analytics.json` from Task 2
- Produces: `TRACKER` (a string constant) exported from `scripts/lib/situation-shell.mjs`, byte-identical to `trackerTag()` in `lib/analytics.ts`

- [ ] **Step 1: Write the failing gate**

In `scripts/verify-seo.mjs`, add this as a new object at the end of the `CHECKS` array (the file's own comment says to add checks in the same commit as the fix that makes them pass):

```javascript
  {
    /* PHASE 1 ANALYTICS. The tag is the only thing making a page countable, and
       a page that silently loses it is invisible rather than broken — so this
       is a build failure, not a warning. Reads the same data/analytics.json
       the generators do, so the id cannot drift between the two. */
    name: 'carries the analytics tracker',
    run: ({ html }) => {
      const want = `<script defer src="${A.scriptPath}" data-website-id="${A.websiteId}"></script>`;
      if (html.includes(want)) return null;
      const has = html.includes(A.scriptPath);
      return has
        ? 'tracker script present but the website id does not match data/analytics.json'
        : 'no tracker tag';
    },
  },
```

Add the import near the top of the file, beside the other constants:

```javascript
const A = JSON.parse(readFileSync('data/analytics.json', 'utf8'));
```

Confirm `readFileSync` is already imported in that file; it is used to read the built pages.

- [ ] **Step 2: Run the gate to verify it fails**

```bash
npm run verify:seo
```

Expected: FAIL, with `no tracker tag` reported for all 35 pages and a non-zero exit. This proves the gate has teeth before anything makes it pass.

- [ ] **Step 3: Add the TRACKER constant to the shared shell**

In `scripts/lib/situation-shell.mjs`, near the other module-level exports (the `J()` helper that reads `data/` is defined around `:388`), add:

```javascript
/* THE ANALYTICS TAG, from the same data/analytics.json that lib/analytics.ts
   reads. Node ESM cannot import a .ts module, so the string is built in both
   places rather than shared — and verify-seo.mjs asserts every built page
   matches, so the two cannot drift silently.

   Same-origin by design: `/record` is proxied to the Umami deployment by
   next.config.ts, which is what lets script-src stay 'self'. Never make this
   an absolute URL. */
export const TRACKER = (() => {
  const a = J('analytics.json');
  return `<script defer src="${a.scriptPath}" data-website-id="${a.websiteId}"></script>`;
})();
```

`J` is already defined in this file as `(f) => JSON.parse(readFileSync(join(DATA, f), 'utf8'))`.

- [ ] **Step 4: Inject into the shared shell's head**

In `assemble()`, find the head template line reading `${headExtra ? ... : ''}${sh.HEAD_FONTS}` and add `TRACKER` on the line after `${sh.HEAD_FONTS}`, before `<style>`:

```javascript
${headExtra ? `${headExtra}\n` : ''}${sh.HEAD_FONTS}
${TRACKER}
<style>
```

- [ ] **Step 5: Inject into the WORK shell**

In `scripts/lib/work-shell.mjs`, find the same `${sh.HEAD_FONTS}` line in its `<head>` template and add the tag after it:

```javascript
${sh.HEAD_FONTS}
${TRACKER}
<style>
```

Import it from the shared shell. Check how that file already imports from `situation-shell.mjs` and follow the existing pattern — it imports `sh` plus named helpers such as `stripCssComments`; add `TRACKER` to that same named import list.

- [ ] **Step 6: Inject into the air page's hand-rolled head**

`scripts/build-situation-air.mjs` deliberately does not go through the shell — its own comment explains why. Find its `${HEAD_FONTS}` line and add the tag after it:

```javascript
${HEAD_FONTS}
${TRACKER}
<style>
```

Add `TRACKER` to that file's existing named import from `./lib/situation-shell.mjs`.

- [ ] **Step 7: Regenerate every page**

```bash
npm run build:situations && npm run build:work && npm run build:about && npm run build:impact && npm run build:farm && npm run build:act && npm run build:stories && npm run build:publications && npm run build:search && npm run build:essays
```

If a build script errors on a missing `TRACKER` import, that generator hand-rolls its head too — add the tag there the same way and note it, because it is a fifth insertion point the spec did not list.

- [ ] **Step 8: Run the gate to verify it now passes**

```bash
npm run verify:seo
```

Expected: PASS — `Every built page matches the register.` and a zero exit.

- [ ] **Step 9: Confirm the tag count matches the page count**

```bash
find public/_pages -name '*.html' | wc -l
grep -rl 'data-website-id' public/_pages | wc -l
```

Expected: the two numbers are equal. A mismatch means a generator was missed in Step 7.

- [ ] **Step 10: Run the full verification suite**

```bash
npm test && npm run lint && npm run verify:final
```

Expected: all pass. `verify-final.mjs` checks properties the SEO gate does not; a failure here means the injected tag broke a different invariant (for example a byte-budget check on head size).

- [ ] **Step 11: Commit — shells, pages and gate together**

```bash
git add scripts/lib/situation-shell.mjs scripts/lib/work-shell.mjs \
        scripts/build-situation-air.mjs scripts/verify-seo.mjs \
        public/_pages
git commit -m "feat(analytics): every built page reports, and the build fails if one stops

The tag goes into the two shared shells and into the air page's hand-rolled
head, then all 35 pages are regenerated — same commit, because the built
pages are committed artefacts and generated-current.yml fails if
regenerating moves the tree.

verify:seo gains a check asserting the exact tag on every page, so a future
page cannot ship uncounted."
```

---

### Task 4: Tag the React routes

Independent of Task 3 — the gate walks `public/_pages/v3` only, so these routes are not covered by it.

**Files:**
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: `ANALYTICS` from `lib/analytics.ts` (Task 2)
- Produces: nothing downstream

- [ ] **Step 1: Add the script to the root layout**

`app/layout.tsx` runs for `/explore`, `/keystatic`, `/stories` and anything added later — the routes the rewrite does not shadow. Add the import:

```tsx
import Script from 'next/script'
import { ANALYTICS } from '@/lib/analytics'
```

Then inside `<body>`, as the first child before `<PhotoFilters />`:

```tsx
        {/* The 35 rewritten static pages carry this tag from the generators;
            this covers the routes that actually execute this layout. Both read
            data/analytics.json, so the id cannot differ between them.
            `afterInteractive` keeps it off the critical path — a pageview that
            arrives 200ms late is still a pageview. */}
        <Script
          src={ANALYTICS.scriptPath}
          data-website-id={ANALYTICS.websiteId}
          strategy="afterInteractive"
        />
```

- [ ] **Step 2: Verify it renders on a React route**

```bash
npm run build && npm run start &
sleep 5
curl -s http://localhost:3000/explore | grep -o 'data-website-id="[^"]*"'
```

Expected: one match, showing the same UUID as `data/analytics.json`.

- [ ] **Step 3: Verify a rewritten static route still carries exactly one tag**

```bash
curl -s http://localhost:3000/now/air | grep -c 'data-website-id'
```

Expected: `1`. If `2`, the layout is executing for a rewritten route as well and pageviews would double-count — remove the layout tag and rely on the generators for that path.

- [ ] **Step 4: Run lint and tests**

```bash
npm test && npm run lint
```

Expected: both pass.

- [ ] **Step 5: Commit**

```bash
git add app/layout.tsx
git commit -m "feat(analytics): the React routes report too

The gate in verify:seo walks public/_pages only, so these routes are not
covered by it. Both paths read data/analytics.json, so the id cannot drift."
```

---

### Task 5: End-to-end verification and rollback note

**Files:**
- Create: `docs/superpowers/reports/2026-08-26-analytics-phase-1.md`

**Interfaces:**
- Consumes: everything above
- Produces: the record that Phase 1's "done when" conditions in spec §6 were actually met

- [ ] **Step 1: Deploy to a preview and confirm a real pageview lands**

Push the branch and open the Vercel preview. Visit two pages — one rewritten static page (`/now/air`) and one React route (`/explore`). Then open the Umami dashboard and confirm both appear in Realtime.

Spec §6 requires the confirming visit to come **from a phone on mobile data**, not the build machine: that proves the collector is reachable from the public internet rather than only from a local proxy.

- [ ] **Step 2: Confirm the CSP did not move**

```bash
curl -sI https://<preview-url>/ | grep -i content-security-policy
```

Compare against production:

```bash
curl -sI https://swechha.in/ | grep -i content-security-policy
```

Expected: byte-identical. This is spec §6's hard condition for Phase 1.

- [ ] **Step 3: Prove the gate has teeth**

Remove the tag from one page by hand, confirm the build fails, then restore it:

```bash
sed -i '' 's|<script defer src="/record"[^>]*></script>||' public/_pages/v3/about.html
npm run verify:seo; echo "exit=$?"
git checkout public/_pages/v3/about.html
```

Expected: `exit=1` with `no tracker tag` named against `/about`. If it exits `0`, the check is not wired into `CHECKS`.

- [ ] **Step 4: Confirm no IP is stored**

Spec §4.2 claims this structurally. Verify against the live schema:

```bash
psql "$ANALYTICS_DATABASE_URL" -c "\d website_event" | grep -i ip || echo "no ip column — as designed"
```

Expected: `no ip column — as designed`.

- [ ] **Step 5: Write the report**

Create `docs/superpowers/reports/2026-08-26-analytics-phase-1.md` recording: the Umami host and website ID, the measured CSP before/after, the page count vs tag count from Task 3 Step 9, the gate-has-teeth result, the no-IP-column result, and the date collection started. Phase 3 will need that start date to state honestly what period a published figure covers.

- [ ] **Step 6: Note the rollback**

Add to the report:

> **Rollback.** Revert the Task 3 and Task 4 commits and regenerate. The Task 2 commit can stay: a proxy nothing calls is inert, and keeping it means the CSP comment stays accurate about the rewrite rules that still exist. To stop collection without a deploy, delete the website record in Umami — the tag then posts to a 404 and no data is written.

- [ ] **Step 7: Commit and open the PR**

```bash
git add docs/superpowers/reports/2026-08-26-analytics-phase-1.md
git commit -m "docs(analytics): Phase 1 verification record"
git push -u origin HEAD
```

Open the PR against `main`. Confirm `generated-current.yml` passes — it regenerates all pages and fails if the tree moves, which is the real proof that Task 3's committed HTML matches what the generators produce.

---

## What Phase 1 deliberately does not do

Carried from spec §6 so nobody treats these as omissions:

- **No scroll-depth or outbound-click events.** Phase 2. Until then "where do people abandon" is answerable only at page granularity, not within a page.
- **No figures on `/impact`.** Phase 3, deliberately last — which figures are honest to publish is a question to settle against real traffic.
- **No GA4 and no demographics.** Phase 4, behind the trigger defined in the spec.
- **No consent banner**, because none is required (spec §4.2).
