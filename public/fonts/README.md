# The site's two typefaces, served from this origin

Added 24 August 2026. Before this, both came from Google Fonts, and that
stylesheet was **the only render-blocking request on swechha.in** — Lighthouse
measured it at 780 ms and estimated 2,580 ms of savings on mobile. The cost was
structural, not incidental: the browser had to fetch
`fonts.googleapis.com/css2?…` and parse it before it even learned which files to
ask `fonts.gstatic.com` for, so a cold visit paid DNS + TLS + a round-trip on
two hosts before any webfont byte moved.

These six files are byte-for-byte the woff2 subsets that stylesheet pointed at
(Archivo v25, Newsreader v26), re-declared in an inline `@font-face` block. No
re-encoding, no subsetting: the glyph coverage and the variable axes are exactly
what the site rendered with before.

## What is here, and why six files

| file | family | axes | subset |
|---|---|---|---|
| `archivo-var-latin.woff2` | Archivo | `wght` 100–900, `wdth` 62–125 | latin |
| `archivo-var-latin-ext.woff2` | Archivo | same | latin-ext |
| `newsreader-var-latin.woff2` | Newsreader | `wght` 200–800, `opsz` 6–72 | latin |
| `newsreader-var-latin-ext.woff2` | Newsreader | same | latin-ext |
| `newsreader-var-italic-latin.woff2` | Newsreader italic | `wght` 200–700, `opsz` 6–72 | latin |
| `newsreader-var-italic-latin-ext.woff2` | Newsreader italic | same | latin-ext |

**They are VARIABLE fonts and that is not optional.** The whole typographic
system is axis-driven — `.d1` is `'wdth' 68,'wght' 850`, `.readout` is
`'wdth' 62,'wght' 800`, `.lbl` is `'wdth' 88,'wght' 650`. Swap in a static
instance and every one of those silently collapses to one width, which looks
like a design change rather than a broken file, on all 35 pages, with nothing
else in the repo noticing.

`scripts/verify-final.mjs` gates it. A woff2's table directory is not inside the
Brotli stream, so the tables can be enumerated straight out of the header
without decompressing and without a Python toolchain: **`fvar` present means
variable, absent means somebody shipped a static cut**, and the build exits 1.
It also checks each declared `src` resolves to a file that is really a woff2,
that every Archivo face declares `font-stretch: 62% 125%`, and that no built
page has reacquired a `fonts.googleapis.com` or `fonts.gstatic.com` reference.

What that gate does **not** prove is that a file is complete or renders — it
reads what the font declares. A truncated woff2 whose directory survives still
passes it. Rendering is checked by eye and in a browser when these change.

**latin-ext is not padding.** `unicode-range` means a subset is only fetched
when a page actually uses a character in it, and the one that pulls latin-ext
here is `₹` (U+20B9). A page with no rupee sign never downloads those files.

Characters the site uses that are in **neither** subset — `₂` `₃` (NO₂, O₃ on
the air pages), `→`, a few Hangul syllables, `🌿` — fall back to a system font.
That is not a regression: Google's own latin and latin-ext subsets did not carry
them either, so this is what the site has always rendered.

## Replacing a face

`next.config.ts` serves this directory `Cache-Control: public,
max-age=31536000, immutable`, so **editing a file in place reaches nobody who
has already loaded it.** A new version needs a new filename, and the `src` in
the `@font-face` block on **line 8 of `design/home.html`** updated to match —
that line is the single source for all 35 built pages, which extract it rather
than each carrying a copy (`situation-shell.mjs`'s `R(8, 8, …)`). Line 8 must
stay one line: `design/home.html` is pinned by absolute line number.

## Licence

Both families are under the SIL Open Font License 1.1, which permits this
redistribution and requires the licence to travel with the files —
`OFL-Archivo.txt` and `OFL-Newsreader.txt`, copied from
[google/fonts](https://github.com/google/fonts).

- **Archivo** — Omnibus-Type. Copyright 2020 The Archivo Project Authors.
- **Newsreader** — Production Type. Copyright 2020 The Newsreader Project Authors.
