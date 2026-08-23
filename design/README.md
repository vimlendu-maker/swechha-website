# `design/home.html` — the hand-maintained homepage source

This is the file that used to be `public/_pages/v3/home.html`. It moved here on
23 August 2026, under AD-28 §7, and nothing about how it is edited changed.

**It is the source, not the page.** `scripts/build-hero.mjs` reads it, injects
the hero's four readings, writes it back **with its line count unchanged**, and
then emits the shipped page to `public/_pages/v3/home.html` with its comments
stripped. Run `npm run build:hero` after any edit here, or the published page
will not carry it.

**Why it had to leave `public/`.** AD-28 §7's acceptance test is over the FILE,
not over the visible text — zero `SOURCE-FACTS`, `§`, `AD-2`, `D-0`, `W-1` in
anything under `public/_pages/v3/`. This file carried 39 `AD-2`, 84 `D-0` and 3
`SOURCE-FACTS` in its comments. The two ways to satisfy that test were to delete
those comments or to stop shipping them, and deleting them was not available:

- they are the design record for the one file on this site that is written by
  hand rather than generated, and
- **the file is pinned by absolute line number.** `scripts/lib/situation-shell.mjs`
  extracts seven CSS ranges from it (lines 10–414, 422–467, 529–840, 2810–2855,
  2878–2895, 2897–2927, 2971–3033) and `work-shell.mjs` takes the same ones.
  Every generator on this site refuses to write if those ranges stop beginning
  and ending with the text they were written against. Deleting comments moves
  every line below them.

So the comments stay, exactly where they are, and the shipped copy is stripped
at build time instead — the same treatment the fifteen WORK pages have had since
the WORK pass, now applied to the one file that could not be generated.

**Do not add or remove lines above 3033** without re-finding all seven ranges in
`situation-shell.mjs` and `work-shell.mjs`. `npm run build:hero` will refuse to
write if the line count moves at all.
