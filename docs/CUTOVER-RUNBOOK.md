# Cutover runbook — pointing swechha.in at the new site

Written 2026-08-23. Every fact here was checked against the live domain and the
repo on that date; where something is a value you must read off a dashboard
rather than trust from a document, it says so.

Run `node scripts/verify-cutover.mjs` before and after. It exits non-zero on
failure and it checks email first, for the reason in step 0.

---

## 0. READ THIS BEFORE TOUCHING DNS

**`swechha.in` carries live Google Workspace email.** As of 2026-08-23 the apex
has five Google MX records, an SPF record (`v=spf1 include:_spf.google.com
~all`), a Google Search Console verification TXT, a Brevo verification TXT, and
`mail.swechha.in` is a CNAME to a Brevo branded-sending host.

`vimlendu@swechha.in` — the address this project is run from — depends on those
records. A browser cannot tell you they are gone. **Nothing below deletes a
record; every step changes exactly one value or adds one.**

> **Do NOT delegate the nameservers to Vercel.** Vercel will offer this, and it
> is the wrong choice here: it moves authority away from `ns77/ns78
> .domaincontrol.com` (GoDaddy) and every MX, SPF and TXT record above would
> have to be recreated by hand at the new provider. One transcription slip and
> mail stops. Keep DNS at GoDaddy and change only the records in step 2.

Take a baseline before you start, so "did I break mail?" is answerable:

```bash
node scripts/verify-cutover.mjs --sample 5 > /tmp/before-cutover.txt
```

---

## 1. Preconditions

- [ ] **PR #10 is merged to `main`.** The 167 redirects live on
      `design/ad-27-final-pass`; they are NOT in production until that merges.
      Verify at `https://swechha-website.vercel.app/campaigns` — a 308 to
      `/work/campaigns` means the redirect layer is deployed.
- [ ] The production deployment on `main` is green in Vercel.
- [ ] `npm test` passes (104 tests) and `npx tsc --noEmit` is clean.

---

## 2. Add the domain in Vercel, then move DNS

**Order matters.** Add the domain in Vercel *first*. Vercel then shows you the
exact records to create, and it can begin issuing the certificate as soon as
DNS resolves. Doing DNS first means a window where the domain points at Vercel
and Vercel does not yet claim it — which serves an error page, not your site.

1. Vercel → project `swechha-website` → Settings → Domains → Add.
   Add **both** `swechha.in` and `www.swechha.in`.
2. Set `swechha.in` as the primary and let `www` redirect to it. The old site
   already behaves this way (`www` 301s to the apex), so this preserves
   existing behaviour rather than introducing a second indexable hostname.
3. **Read the record values off the Vercel screen and use those.** Vercel has
   changed its published IPs before, and a runbook that hardcodes them is a
   runbook that eventually breaks a site. What you will almost certainly be
   told to create, at GoDaddy:

   | Record | Name | Value | Action |
   |---|---|---|---|
   | A | `@` | the IP Vercel shows | **edit** the existing `97.74.184.156` |
   | CNAME | `www` | the target Vercel shows | **edit** the existing `www` |

   Leave every MX, TXT, NS and the `mail` CNAME untouched.
4. Lower the apex record's TTL to 600s an hour beforehand if GoDaddy allows it.
   That shortens the window in which visitors are split between old and new.

### HTTPS is not a later step

Vercel provisions and renews a Let's Encrypt certificate automatically once the
domain resolves to it — usually within minutes. There is nothing to buy,
install or configure. Two things can block it, both checked on 2026-08-23:

- **CAA records.** `swechha.in` has none, so issuance is unrestricted. If one
  is ever added it must permit `letsencrypt.org`.
- **DNS not yet propagated.** If the certificate is still pending after ~30
  minutes, the cause is nearly always a record that has not taken effect, not
  Vercel.

---

## 3. `SITE_ORIGIN` — two places, and it is easy to get half-right

The value becomes `https://swechha.in`. It is currently the vercel.app alias.

1. **Vercel env var**, production scope only:
   `SITE_ORIGIN=https://swechha.in`. Previews must NOT have it — they fall back
   to `VERCEL_URL` and describe themselves correctly.
2. **GitHub repo variable** (a *variable*, not a secret — it is not sensitive
   and it needs to stay readable):

   ```bash
   gh variable set SITE_ORIGIN --body "https://swechha.in"
   ```

   Read as `vars.SITE_ORIGIN` by `.github/workflows/ward-alerts.yml`.

Why both: `lib/subscriptions.ts` falls back to the literal `https://swechha.in`
and, unlike `lib/org.ts`, does **not** fall back to `VERCEL_URL`. So ward
confirmation and unsubscribe links in email are driven by this variable. Leaving
it stale points those links at whatever the alias was.

**Redeploy after changing it.** Env vars are read at build time for the sitemap
and structured data; an unchanged deployment keeps the old value.

---

## 4. Open the site to search engines

Until this is set, every deploy serves `robots.txt` with `Disallow: /` and a
blanket `X-Robots-Tag: noindex` — deliberately, so review builds on the alias
could not compete with the real domain.

- Vercel env var, production scope: `SITE_INDEXABLE=true`
- **Redeploy.** Both `app/robots.ts` and `next.config.ts` read it through
  `isIndexable()` in `lib/org.ts`, so they cannot disagree — but neither
  changes without a new build.

Only the exact string `true` counts.

---

## 5. Verify

```bash
node scripts/verify-cutover.mjs
```

Checks, in order: Google MX and SPF still resolve; the homepage and eight key
routes return 200 over HTTPS; `www` redirects to the apex; `robots.txt` allows
crawling and no blanket `X-Robots-Tag` remains; the sitemap advertises
`swechha.in` and not a vercel.app alias; **all 167 redirects land on their
destination with a 200**; and the URLs meant to 404 actually do.

Expect each old URL to take **two hops** — Next strips WordPress's trailing
slash, then the redirect fires. That is by design; see the comment block in
`lib/legacy-redirects.ts`.

Compare against `/tmp/before-cutover.txt`. The email lines must be identical.

---

## 6. After launch

- [ ] **Google Search Console.** Add `swechha.in` if it is not already there
      (a verification TXT exists, so it probably is), submit
      `https://swechha.in/sitemap.xml`, and watch Coverage for a week. Real 404
      traffic is better evidence than speculation for which of the deliberate
      404s deserve a redirect after all — see the "deliberately not captured"
      note in `docs/legacy/README.md`.
- [ ] **Re-point the 93 `parent` redirects** as the missing pages get built.
      `docs/legacy/README.md` ranks them: 26 want story/film detail, 22 want
      project pages, 13 want the farm training suite.
- [ ] **Re-host the eight annual reports.** They are in
      `docs/legacy/documents/`, verified and checksummed. `git mv` them into
      `public/` and add redirects from the old `wp-content/uploads/` paths,
      which appear in NO sitemap and would otherwise stay dead. Two of the
      eight are image-only scans and need OCR or a transcript first.
- [ ] Security headers and CSP.
- [ ] Rate limiting on `/api/ward*` and `/api/air`.

### App mail: fixed 2026-08-23, and why it passes

`WARD_MAIL_FROM` defaults to `air@swechha.in` and the digest sends as
`hello@swechha.in`, so both send **as** the domain — while DMARC is published
`p=quarantine`. That combination used to mean every alert went to spam
silently. The domain has now been verified in Resend and the records are live:

| Record | Value | What it does |
| --- | --- | --- |
| `resend._domainkey.swechha.in` TXT | `p=MIGfMA0…` | signs app mail as `d=swechha.in` |
| `send.swechha.in` TXT | `v=spf1 include:amazonses.com ~all` | authorises the Return-Path |
| `send.swechha.in` MX | `feedback-smtp.ap-northeast-1.amazonses.com` | bounces and complaints |

DMARC (`adkim=r; aspf=r`) needs only one aligned mechanism and now gets both:
DKIM signs as the apex domain itself, and the envelope sender `send.swechha.in`
relaxed-aligns with `swechha.in`. **The apex SPF record was left Google-only on
purpose** — widening it was never the fix, and it is the one change here that
could have put Workspace mail at risk. `scripts/verify-cutover.mjs` now asserts
the DKIM key, so deleting it fails the check instead of quietly filling spam
folders.

Two things still open, neither blocking:

- [ ] **Send one real message and read the headers.** DNS says it should align;
      only a delivered message proves it. Confirm `dkim=pass header.d=swechha.in`
      and `dmarc=pass` in the received headers before the first alert goes to a
      real subscriber.
- [ ] **A second Resend domain entry exists for `send.swechha.in`** — fully
      configured (its own DKIM at `resend._domainkey.send.swechha.in`, SPF and
      MX under `send.send.swechha.in`) and unused, since nothing in the app
      sends as `@send.swechha.in`. Harmless, but delete it in Resend rather than
      leaving a verified sender nobody is watching.

---

## Rollback

DNS is the only irreversible-feeling step, and it is not actually irreversible:
set the apex A record back to `97.74.184.156` and the `www` CNAME back to
`swechha.in`. WordPress is untouched by any of this and keeps serving throughout
— nothing in this runbook modifies the old site. Propagation is bounded by the
TTL you set in step 2.4.

Keep the old host paid up until Search Console shows the new URLs indexed and
the report PDFs have been re-hosted.
