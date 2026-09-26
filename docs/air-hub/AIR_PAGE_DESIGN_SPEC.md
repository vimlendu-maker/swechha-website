# /now/air — Design spec v2

**The design language does not change.** This round adds two bands and one tab inside the frozen system: Archivo +
Newsreader, the `--t-*` type tokens, grounds and ink (`--ground`, `--paper`, `--fg*`, `--ink*`), mustard as the one
interactive hue, red only for a reading over a standard, every photograph black and white. No new font, no new type
step, no new hue, no gauge, no animation.

## Above the fold (phone first)

In order, at 375 px: the reading (numeral), its unit line (`AQI · 24-hour · worst of N monitors`), the band word, the
six-pip scale, **the standard line**, the source line with the observation time, **the age sentence when stale**,
**the doubt line when the governing channel is uncorroborated**, and **Copy this reading**. The national panel follows.

### The standard line (replaces "CPCB safe limit 100. Limit broken.")

`AQI 100 is NO₂'s 24-hour standard, 80 µg/m³. Over it.` — the pollutant, its window and its unit are read off the
governing row. Set in the `.limit` capitals, except the unit (`.limit .u`), because a capital µ is Greek Mu and
"MG/M³" reads as milligrams. Red only on "Over it."

### The state chip

Live (green) / Periodic (outlined) — the existing two. On load the page compares its own observation time with the
reader's clock; past three hours it switches the chip to Periodic and shows the age sentence in the source line. No
fifth state and no new colour.

### The doubt line

`.cap.p-hole` (the dotted left rule this page already uses for "what a number cannot tell you"), under the source
line: "One channel, uncorroborated. That 154 is North Campus's NO₂; the same station's particulates read only 58, so
nothing at that station backs the figure up. Set that channel aside and the worst monitor is Wazirpur: 134, on PM10."

### Copy this reading

A `<button>` dressed as `.lk` (mustard underline), because it acts rather than navigates. It copies a pre-built
sentence — who, what, where, when, number, source, caveat, URL — and announces "Reading copied" to screen readers. It
hides itself where the clipboard API is unavailable.

## New band: The rules that apply

Dark ground (`t2`), two tabs.

- **India and the WHO** — a lead that states the ratio honestly (8× annual, 4× daily for PM2.5) and says why a
  multiplier is allowed here and not on the AQI; an 18-row table (`.p-tbl.p-tbl-d`): pollutant with its unit beneath,
  window, India, WHO, ratio. "none set" where a body sets no figure. Two source links.
- **GRAP** — the lead, a four-row stage table with a PIB link per row, then **"A comparison, not a status"** placing
  Delhi's average against the schedule, and a link to `/learn/grap`.

## New tab: Delhi-NCR (in the geography band)

A table of every NCR town CPCB measured in the national snapshot's hour: town with its district beneath; the
worst-monitor figure on its own line (red if over 100, `?` if a suspect channel) with pollutant and station beneath;
the mean; the monitor count. Delhi's row is weighted. Beneath: the districts with no reporting monitor, named, and the
NCR Planning Board link.

## New band: Questions, answered

Dark-2 ground. A two-column grid of h3 + paragraph (one column under ~720 px). Each answer ≤ 90 words, self-contained,
figures read off the data.

## Tables

`<table>` with `<caption class="sr">`, `scope="col"` headers and `scope="row"` row headers — the pattern the method
table already uses. On dark grounds `.p-tbl-d` swaps only the colour tokens.

## Loading and failure states

Nothing on the page loads after first paint except the chip check and the monitor picker. A failed `/api/air` changes
nothing on screen (it logs once). A stale build is handled by the age check. An empty national snapshot fails the build.

## Accessibility

- Band is never carried by colour alone: the band word is printed, the six-pip scale has an `aria-label`
  ("Moderately Polluted, band 3 of 6"), red values sit beside the word "Over it" or in a column whose header says
  what red means.
- The chip's meaning is visible and audible (a screen-reader gloss that changes with the state).
- Heading order: one h1, h2 per band, h3 for the explainer cards and each question.
- The copy control is a real button with a live-region status.
- Checked: new colour pairs use existing tokens already contrast-checked on these grounds (`--fg-2` on `--ground-2`).
