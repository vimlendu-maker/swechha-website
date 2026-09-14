# The monthly digest note

One file per month: `data/digest/<YYYY-MM>.json`. Without one, `npm run
digest:send` composes nothing, sends nothing and exits 75 naming the file it
wanted. That is deliberate — see below.

## Why a human has to write something

The subscribe band on eleven pages promises, in the reader's own words:

> One email. What the six readings did that month, what moved and what did not,
> **and what we did about it.**

Two of those three clauses are computable. The readings are in `data/`, and the
month's air is in `data/air-history/`. The third is a claim about Swechha, and
no dataset on this site contains it. A digest that dropped it would be keeping
two-thirds of a promise while looking like it kept all of it — so the job refuses
to send a month nobody wrote.

A missing note is **not an error**. It is a month nobody wrote, and silence is
the honest response. The job exits 75, the workflow stays green, and nothing is
mailed.

## The gate

`publish_state: "published"` **and** a named `approved_by`, exactly as
`data/journal/articles/` and `data/climate-events/` already work. An unapproved
note is composed by nobody and sent to nobody.

## The shape

```json
{
  "month": "2026-09",
  "subject": "Swechha — September 2026",
  "publish_state": "draft",
  "approved_by": null,
  "approved_at": null,
  "opening": "One paragraph. What this month was actually like...",
  "did": [
    "One line per thing Swechha did about any of it.",
    "A filing, a walk, a planting, a school. Dated where it matters."
  ]
}
```

- **`subject`** — optional. Defaults to `Swechha — <Month Year>`.
- **`opening`** — one paragraph, wrapped at 72 columns by the composer. Write it
  the way the Journal is written: start at the fact.
- **`did`** — a list. One line each. If the honest answer for a month is "we
  measured and filed nothing", say that; it is a truer line than a padded one,
  and it is the kind of sentence this site is supposed to be able to print.

## What the job assembles around it

Nothing else is typed. The composer adds, in this order:

1. The month's Delhi air out of `data/air-history/` — days with a reading, days
   over the limit, and the worst day, with a link to that month's record page.
2. The six readings as they stand, each linked to its own situation page.
3. Anything published in the month from `data/journal/articles/` — the same
   approval gate, so the digest cannot advertise an article the site does not
   show.
4. The licence line and a working unsubscribe link.

Every figure is cross-checked against the built situation page that shows it
before anything is sent. If the two disagree the job refuses to run and tells
you to rebuild the pages — the same guard `scripts/build-hero.mjs` applies to
the homepage.

## Writing and checking one

```bash
npm run digest:dry                    # compose last month and print it
npm run digest:dry -- --month 2026-09 # compose a specific month
```

The dry run needs no database and no mail key. It is meant to be readable by
somebody with no secrets on their machine — which is also how the note gets
reviewed before it is approved.
