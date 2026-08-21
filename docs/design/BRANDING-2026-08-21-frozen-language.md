# Swechha — the frozen design language

**Extracted from the page as built, 21 August 2026.**

**Source of truth:** `public/design/v3/home.html` at commit `1149b6d`
(287,754 bytes). Everything in this document was read out of that file or
measured on it, not carried over from an earlier spec. Where a written spec
and the built page disagree, **the page wins and the spec is flagged** — see
§9.

**Method.** Chrome CDP with `Emulation.setDeviceMetricsOverride` only, IST,
device scale 1. Widths exercised: 320, 375, 390, 414, 560, 768, 901, 1024,
1280, 1440, 1920. Phone heights 635, 812 and 900. Contrast computed from the
token hexes by the WCAG 2.x relative-luminance formula and separately
re-measured against every rendered text node's effective background.

**What this document is for.** It is the thing the next twelve pages get built
from. It is precise where the page is decided and it says so where the page is
not. Read §7 (forbidden) and §10 (the build checklist) before writing a line
of CSS.

---

## 0. The one-paragraph version

The page is a dark instrument. Four grounds alternate on a fixed rhythm and
each band declares how much air it gets from a four-tier scale, so weight is
carried by tier and treatment, never by how many items exist. Two typefaces:
Archivo variable for everything that measures or labels, Newsreader for
everything that reads. Three hues with fixed jobs — **red is a broken
published limit, green is what Swechha has done, mustard is the interface and
never carries state** — and state is additionally carried by *shape*, so it
survives colour blindness and a photocopier. Every figure is set as a
*reading*: a numeral that owns its own rule, with a unit, a published limit, a
named source and an hour attached. Nothing typed into static markup is allowed
to make a tensed or dated claim. Where the record is missing the page leaves
the hole showing, and it has a vocabulary for saying so.

---

## 1. Tokens, as they actually resolve

### 1.1 The four grounds, and the tier logic

| token | hex | role |
|---|---|---|
| `--ground` | `#0D0D0B` | the page; heroes and arrival bands |
| `--ground-2` | `#151512` | the alternate dark; chrome, strips, the footer |
| `--paper` | `#F3F2F0` | off-white. **Long reading and section breaks only** |
| `--paper-2` | `#ECEBE8` | the second paper, tuned so every hue still clears AA on it |

Plus one field colour that is a ground exactly once on the whole site:
`--mustard` `#E1A32B`, the Give band. A second mustard field anywhere spends
what licenses mustard as the control colour everywhere else.

**Bands declare their own vertical tier. `section` itself carries no padding.**

```css
section{padding:0;position:relative;overflow-x:clip}
.t1{padding:0}                    /* ARRIVAL — the photograph runs to the seam */
.t2{padding:var(--pad-t2) 0}      /* MAJOR */
.t3{padding:var(--pad-t3) 0}      /* MINOR */
.t4{padding:var(--pad-t4) 0}      /* STRIP */
```

`overflow-x:clip` and not `hidden`: clip stops a band widening the document
without making it a scroll container, so `scroll-snap` and sticky children
inside a section keep working. A band that forgets to declare a tier looks
obviously wrong rather than quietly average — that is the point of putting the
padding on the class and not on the element.

**The frozen band sequence, fourteen bands, measured.** Heights are at
375×812 / 1440×900.

| # | band | tier | ground | 375 | 1440 |
|---|---|---|---|---|---|
| 1 | `#top` hero | t1 | `#0D0D0B` | 716.89 | 825.00 |
| 2 | `#ticker` | — | `#151512` | 116.45 | 111.16 |
| 3 | `#say` smell banner | t1 | `#0D0D0B` | 417.05 | 488.55 |
| 4 | `#work` | t2 | `#F3F2F0` | 741.28 | 1,013.83 |
| 5 | `#journeys` | t2 | `#0D0D0B` | 833.20 | 1,058.08 |
| 6 | `#projects` | t2 | `#ECEBE8` | 893.48 | 1,112.66 |
| 7 | `#campaigns` | t3 | `#151512` | 784.11 | 1,009.78 |
| 8 | `#about` | t2 | `#F3F2F0` | 890.33 | 944.89 |
| 9 | `#impact` | t3 | `#151512` | 598.19 | 550.97 |
| 10 | `#farm` | t1 | `#0D0D0B` | 841.25 | 1,006.09 |
| 11 | `#gtm` Green the Map | t4 | `#151512` | 325.58 | 336.09 |
| 12 | `#record` | t2 | `#F3F2F0` | **1,393.48** | 1,236.17 |
| 13 | `#give` | t3 | `#E1A32B` | 861.13 | 679.16 |
| 14 | `footer` | — | `#151512` | 725.83 | 416.97 |

**No two adjacent bands share a hex.** Verified mechanically at 375×812,
375×635 and 1440×900: zero clashes across all fourteen. The two darks that
meet (`#impact` `#151512` → `#farm` `#0D0D0B`) are the intended
alternate-dark step, not a clash — the cut there is carried by weight (a
picture-free type wall giving way to an edge-to-edge photograph), which is a
harder cut than any colour change.

**Document height is a function of viewport *height*, not only width**, because
the three t1 bands scale off `svh`. Measured:

| viewport | document |
|---|---|
| 320×812 | 10,819 |
| 375×635 | 10,125 |
| 375×812 | **10,244** |
| 375×900 | 10,282 |
| 390×844 | 10,145 |
| 414×896 | 10,070 |
| 560×800 | 9,460 |
| 768×1024 | 10,426 |
| 901×900 | 10,193 |
| 1024×800 | 9,522 |
| 1280×800 | 10,016 |
| 1440×900 | **10,852** |
| 1920×1080 | 11,159 |

Quote a document height *with its viewport height* or not at all. Two
documents in this repo quote a bare "10,282px at 375" and one of them calls it
a transcription slip; it is neither a slip nor a contradiction — it is 375×900.

### 1.2 Ink and rules

| token | hex | contrast on `--ground` | on `--ground-2` | note |
|---|---|---|---|---|
| `--fg` | `#FBF8F0` | **18.33:1** | 17.24:1 | body and display on dark |
| `--fg-2` | `#CDC7B7` | **11.53:1** | 10.85:1 | labels, provenance, secondary |
| `--fg-3` | `#9C9585` | **6.53:1** | 6.14:1 | captions. **12px floor** |
| `--hair` | `rgba(251,248,240,.20)` | composites to `#3D3C39`, 1.76:1 | `#43423E`, 1.82:1 | 1px divisions on dark |
| `--hair-2` | `rgba(251,248,240,.10)` | `#252422`, 1.25:1 | `#2C2C28`, 1.31:1 | disabled borders only |

| token | hex | on `--paper` | on `--paper-2` | note |
|---|---|---|---|---|
| `--ink` | `#141310` | **16.61:1** | 15.58:1 | display and body on paper |
| `--ink-2` | `#4C473F` | **8.23:1** | 7.72:1 | secondary on paper |
| `--ink-3` | `#615B50` | **6.01:1** | 5.64:1 | captions. **13.5px floor** |
| `--rule` | `#DEDDD9` | 1.21:1 | 1.14:1 | row rules on paper |
| `--rule-2` | `#C6C4BF` | 1.56:1 | 1.46:1 | the heavier terminal rule |

**`--fg-3` and `--ink-3` are the two tokens with a stated minimum size.** They
are the only ones that get near the floor and they are the ones a new page will
be tempted to use for a 10px label. Don't.

### 1.3 The three hues

```
MUSTARD  a human act.        Second person.           THE INTERACTIVE COLOUR.
RED      a published limit broken.  Third person present.  NEVER A CONTROL.
GREEN    what Swechha has done.     Past perfect.
```

| token | hex | ground | ground-2 | paper | paper-2 | mustard field |
|---|---|---|---|---|---|---|
| `--mustard` | `#E1A32B` | **8.78:1** | 8.25:1 | 1.98:1 | 1.86:1 | — |
| `--mustard-2` | `#F1C33B` | **11.68:1** | 10.98:1 | 1.49:1 | 1.40:1 | 1.33:1 |
| `--mustard-ink` | `#8A6410` | 3.62:1 | 3.41:1 | **4.80:1** | **4.50:1** | 2.42:1 |
| `--on-mustard` | `#12110F` | — | — | 16.87:1 | 15.83:1 | **8.51:1** |
| `--red` | `#F1484E` | **5.35:1** | 5.03:1 | 3.25:1 | 3.05:1 | — |
| `--red-ink` | `#c81e3a` | 3.43:1 | 3.23:1 | **5.07:1** | **4.76:1** | — |
| `--green` | `#5FBE85` | **8.51:1** | 8.01:1 | 2.04:1 | 1.92:1 | — |
| `--green-ink` | `#1F6B45` | 3.01:1 | 2.83:1 | **5.78:1** | **5.42:1** | — |

Bold = the pairing that is actually used. The `-ink` variants exist because the
base hue fails AA on off-white; that is the file's own naming convention and a
new hue must follow it.

**`--mustard-ink` is DEMOTED and this is the single most likely thing for a new
page to get wrong.** It survives *only* as a focus ring on paper, where it has
to clear AA as a 2px outline. `#E1A32B` is the mark on **both** canvases. A
paper band buys its contrast with **weight, an underline, or a filled chip** in
`#E1A32B` with `--on-mustard` ink — never by darkening the hue. The one
licensed accent cannot have three faces.

Note `--mustard-ink` on `--paper-2` is **4.50:1** — exactly on the AA line for
normal text. It is fine as a 2px non-text outline (needs 3:1) and it must not
be used as body colour on `paper-2`.

**Contrast audit of the built page: zero failures.** Every element carrying its
own text was walked at 375×812 and 1440×900, its computed colour compared
against its composited effective background, and tested against 4.5:1 (or 3:1
for large/bold-large). **Zero elements failed, and zero came within 0.6 of
failing.** Not "no known failures" — none.

### 1.4 The type scale, with its real clamp values

| token | declaration | @375 | @768 | @1440 | @1920 |
|---|---|---|---|---|---|
| `--t-readout` | `clamp(6.2rem,21vw,17rem)` | **99.2** | 161.28 | **272** (capped) | 272 |
| `--t-d1` | `clamp(2.7rem,8vw,6.5rem)` | **43.2** | 61.44 | **104** (capped) | 104 |
| `--t-num` | `clamp(2.6rem,6vw,4.6rem)` | **41.6** | 46.08 | **73.6** (capped) | 73.6 |
| `--t-d2` | `clamp(1.5rem,3.4vw,2.75rem)` | **24** | 26.11 | **44** (capped) | 44 |
| `--t-h2` | `clamp(1rem,1.9vw,1.45rem)` | **16** | 16 | **23.2** (capped) | 23.2 |
| `--t-lead` | `clamp(1.06rem,1.55vw,1.28rem)` | **16.96** | 16.96 | **20.48** (capped) | 20.48 |
| `--t-body` | `18px` | 18 | 18 | 18 | 18 |
| `--t-cap` | `13.5px` | 13.5 | 13.5 | 13.5 | 13.5 |
| `--t-micro` | `11.5px` | 11.5 | 11.5 | 11.5 | 11.5 |

The three fixed sizes are fixed on purpose. Body, caption and micro do not
scale — the reading size of a sentence is not a function of the window.

**The display-to-body ratio is 14.9:1 at desktop** (272 ÷ 18.3) and the working
ratios at 375 are 99:18 for readouts and 43:18 for headlines. The file's own
comment: *"the blankness is not solved by making this bigger."* And the
standing mobile rule: **never solve a mobile problem by making type bigger.
Solve it by cutting the frame.**

The `6.2rem` readout floor (99.2px) is a floor — do not go below it. The
`2.7rem` d1 floor (43.2px) is a *ceiling* on the phone — do not go above it.

### 1.5 Spacing, containers, chrome

| token | declaration | @375 | @768 | @1440 |
|---|---|---|---|---|
| `--gut` | `clamp(20px,3.4vw,46px)` | **20** | 26.11 | **46** (caps at 1353px) |
| `--pad-t2` | `clamp(88px,9vw,136px)` · **`56px` ≤767** | **56** | 88 | **129.6** |
| `--pad-t3` | `clamp(64px,6.5vw,96px)` · **`44px` ≤767** | **44** | 64 | **93.6** |
| `--pad-t4` | `clamp(28px,3vw,44px)` · **`22px` ≤767** | **22** | 28 | **43.2** |
| `--gap-head` | `clamp(18px,1.6vw,28px)` | 18 | 18 | 23.04 |
| `--gap-block` | `clamp(36px,4vw,64px)` | 36 | 36 | 57.6 |
| `--gap-row` | `clamp(24px,2.6vw,40px)` | 24 | 24 | 37.44 |

`--gut`'s 20px floor is deliberate: *16px at 375 is an app margin, not a
document margin.*

The tier tokens are **overridden to flat values at ≤767**, so the clamps only
operate above the phone. There is a designed 32px step at the 767/768 boundary
(t2 goes 56 → 88). That is intent, not a bug — a phone gets a tighter tier
scale so a band can stay inside its budget.

**Exactly three internal gaps. A fourth is a pattern this page does not have.**
Four of nine partials in an earlier build each arrived carrying a private copy
of exactly these three numbers; that is the failure mode these tokens exist to
prevent.

**Two containers, and only two.**

```css
.wrap{max-width:1240px;margin:0 auto;padding:0 var(--gut)}   /* everything with sentences */
.wide{max-width:1580px;margin:0 auto;padding:0 var(--gut)}   /* indexes, not reading */
```

`.wide` is for the header, the ticker and the archive contact sheet. Everything
containing sentences goes on `.wrap`. Measure ceilings: **lead 46ch, body 62ch,
caption 60ch.** `.lead{max-width:46ch}` and `.body{max-width:62ch}` are real
classes; use them rather than restating the number.

**The header height is a token, not a literal, and it is two numbers because it
describes two things.**

```css
:root{--bar-h:62px;--nav-h:63px}
@media (max-width:940px){ :root{--bar-h:56px;--nav-h:56px} }
html,body{scroll-padding-top:var(--nav-h)}
```

`--bar-h` is the bar's own box. `--nav-h` is the strip that actually **occludes**
the top of the viewport — above 940 `.nav` is sticky and its 1px
`border-bottom` paints too, so 62 + 1 = 63; below 940 `.nav-in` is `fixed` and
`border-box` already contains the hairline, so 56 flat. **These being two
literals in two places is exactly how the anchor-landing bug went unnoticed for
weeks.** Never re-type 56 or 63 anywhere; read the custom property.

### 1.6 `--kiss`, and the rule weights

```css
--kiss:.06em;   /* of the NUMERAL'S OWN font-size. One value, nothing else. */
```

Because it is an em of the numeral it scales for free: **16.32px beside a 272px
readout at 1440, 5.95px beside the 99.2px floor at 375** — both exactly
`.06 ×` the numeral's own size, across a 2.7× scale range. Verified at 375,
768, 1024 and 1440.

| where | weight | token |
|---|---|---|
| hairline division, dark | 1px | `--hair` |
| hairline division, paper | 1px | `--rule`, terminal row `--rule-2` |
| the rail, at rest | 1px | `--rl-w` default, colour `--rl-c` → `--hair` / `--rule-2` |
| the rail, **breach** | **6px** | `--rl-c` → `--red` / `--red-ink` |
| the rail, **closed window** | 1px **dashed** | `border-left-style:dashed` |
| link underline on paper (`.lk`, `.act`) | **2px** | `--mustard` |
| nav link underline | 2px transparent → `--mustard` on hover / `[aria-current]` |
| `.b-2` outlined button on paper | **2px** (padding compensated to `13px 23px`) |
| selected tab marker | **3px** `border-top` | `--fg` / `--ink` |
| state chip square `.state i` | 9×9px, **1.5px** border; closed **2px dashed** |
| the six-band scale `.bands i` | 12px tall, 1px border, 3px gap, `max-width:340px` |
| focus ring | **2px at `outline-offset:3px`** (inset `-3px` for corner controls) |

**Breach changes the rule's colour and its width and nothing else, and it grows
RIGHTWARD, away from the numeral, so the kiss gap is identical in every state.
A breach must never shift the numeral.**

---

## 2. Type roles

### 2.1 Two faces, and what each is for

- **Archivo** (variable, `wdth` + `wght`) — everything that **measures or
  labels**: display heads, wordmarks, micro-caps, readouts, numerals, units,
  verdicts, buttons, tabs, tags, form labels.
- **Newsreader** (serif, weights 300/400) — everything that **reads**: body,
  leads, captions, the multiplier's noun, the method notes. It is `body`'s
  default: `font:400 var(--t-body)/1.6 Newsreader,Georgia,'Times New Roman',serif`
  with `font-optical-sizing:auto`.

Stacks are always `Archivo,system-ui,sans-serif` and
`Newsreader,Georgia,serif`. Never load a third family.

### 2.2 The role table — exact variation settings

| class | face | `wdth` | `wght` | size | tracking | line-height | case |
|---|---|---|---|---|---|---|---|
| `.d1` display 1 | Archivo | **68** | **850** | `--t-d1` | `-.032em` | `.86` | upper |
| `.d2` display 2 | Newsreader | — | `300` | `--t-d2` | `-.015em` | `1.12` | as set |
| `.h2` section label | Archivo | **100** | **680** | `--t-h2` | `.24em` | `1.35` | upper |
| `.readout` the reading | Archivo | **62** | **800** | `--t-readout` | `-.038em` | `.74` | — |
| `.num` a figure | Archivo | **64** | **800** | `--t-num` | `-.03em` | `.8` | — |
| `.lbl` micro-caps | Archivo | **88** | **650** | `--t-micro` | `.15em` | `1.5` | upper |
| `.lead` | Newsreader | — | `300` | `--t-lead` | — | `1.48` | as set |
| `.cap` caption | Newsreader | — | `400` | `--t-cap` | — | `1.45` | as set |
| `.state` | Archivo | 88 | 650 | `--t-micro` | `.13em` | — | upper |
| `.unit` | Archivo | 88 | 650 | `--t-micro` | `.15em` | — | upper |
| `.limit` | Archivo | 88 | 650 | `--t-micro` | `.13em` | — | upper |
| `.limit b` | Archivo | 88 | **800** | `--t-micro` | — | — | upper |
| `.verdict` | Archivo | **78** | **800** | `clamp(1.15rem,2.4vw,1.85rem)` | `.03em` | — | upper |
| `.b` button | Archivo | **92** | **700** | `12.5px` | `.14em` | — | upper |
| `.act` action link | Archivo | **92** | **680** | `12.5px` | `.13em` | — | upper |
| `.tag` | Archivo | 88 | **700** | `10.5px` | `.14em` | — | upper |
| `.mark` wordmark fallback | Archivo | **74** | **850** | `22px` | `-.01em` | — | upper |
| `.nav a.nl` | Archivo | **92** | **620** | `12px` | `.13em` | — | upper |
| `.give` | Archivo | 92 | **700** | `12px` | `.14em` | — | upper |
| `.f-lab` form label | Archivo | 88 | **700** | `--t-micro` | `.14em` | — | upper |

Section heads elsewhere in the page narrow further as they get more specific:
`.s-record-door-h` 74/820, `.w7-jr-t` 74/800, `.w7-pj-t` 74/800, `.w7-ce-t`
72/830, `.w7-ab-yr` 78/800, `.gv-g h3` 76/800. **The pattern is: the narrower
the width axis, the more display the role.** 62 is the readout, 68 the page
head, 74–78 a component head, 88 a label, 92 a control, 100 the widest and
most letterspaced section label.

**Numerals.** `.readout` and `.num` both carry
`font-variant-numeric:tabular-nums`. Tabular makes digits monospaced but
**not the separator**, so `"0.0"` shrink-wrapped 59.2px narrower than `"412"`
and the whole account column lurched sideways when the reader arrowed to that
slide. The fix is a digit slot for the decimal point:

```css
.readout .dp{display:inline-block;width:calc(1ch - .0351em);text-align:center}
```

**Do not simplify that to `1ch`.** Both corrections are real: a tabular digit
occupies `.3915em` here (advance `.4295em` plus the readout's `-.038em`
tracking) while `1ch` reports `.42665em`, and an inline-block is not given the
letter-spacing a glyph gets. Because every term scales with font-size the slot
is exact at 272px and at the 99.2px floor alike — measured, `"0.0"` and `"412"`
are both 319.469px at 1440.

**The logo is an asset, never live type.** `.mark img{height:30px}`,
`.foot .mark img{height:42px}`, source
`/brand/swechha-horizontal-white-approved.png` (2048×512). `.mark`'s Archivo
74/850 settings are the *fallback* for when the asset fails to load. Never
re-set the wordmark as live type, never redraw it, never substitute it.

### 2.3 The two hierarchies that were rejected — do not re-propose them

**(a) A serif display level for section heads.** `#gtm`'s wordmark was the one
section head on the page set in `.d2` (Newsreader 300). It is now `.d1`
(Archivo 68/850, uppercase), capped at `clamp(2rem,4.4vw,3.4rem)` rather than
taking the full `--t-d1`. The band's own copy says it is deliberately the
quieter one — **so the quiet is carried by scale and by the T4 ground, not by a
different typeface.** Every section head on the page is `.d1`. A second
display face for heads is closed (D-07.4).

**(b) A typographic level between the h1 and the readout.** A tagline naming
the site an "environmental intelligence dashboard" was proposed and refused,
and the measured reason is structural: **there is no typographic level
available between a deliberately suppressed 67.2px h1 and a 272px numeral.**
The gap was real and it was filled at the *bottom* of the scale instead — a
`.lbl` micro-caps method line, *"Every reading against its published limit"*,
315.4px measured, in `--fg-2`, on the spine, `--gap-head` under the h1. It
states the **method**, not the category, which is what actually explains an
instrument. Rejected alternatives, all measured: *"Environmental intelligence,
Delhi and India"* (a genre label, and it overruns 375 by 0.2px); *"Live
readings against the legal limit"* (over-claims); *"Nine situations, read
against the law"* (the hero shows four and the ticker six, so the number
invites a count the band fails); *"Read against the limit"* at 169.3px, the
only line that fits beside the state badge at 375, rejected as weaker than
silence (D-01.12).

---

## 3. The grammar that carries meaning

**This is the part that matters most. The tokens are replaceable; this is
not.** Everything below is a closed rule. Widening one needs a client ruling,
and two of them have already been widened once by ruling, which is why they are
worth stating exactly.

### 3.1 The three hues have jobs, and only their jobs

**RED — a published limit broken.** Third person present. It appears on: a
readout's rail when the reading breaches (`--rl-w:6px`, `--rl-c:--red`), the
verdict (`.verdict.bad`), the breach words in the limit line (`.limit b`), the
tip cell of the six-band scale (`.bands.bad i.tip`), the breach tag
(`.tag-breach`, `.tag-breach-solid`), and a field that is out of limit
(`.f-err`, `.f-errmsg`).

**Red is never a control.** A red Give button teaches a reader that red means
"click me", and three screens later red has to mean the river is dead. The
deleted rule is named in the file so nobody rebuilds it:
`.rig-tabs button[data-breach=true][aria-selected=true]{border-top-color:var(--red)}`.
The one apparent exception is not one: `.f-err` is red on a form field because
it is **a reading of the control**, not the control — the field is out of
limit.

**GREEN — what Swechha has done.** Past perfect. Widened by client ruling on
21 August from the narrower *what has been recovered*, because the Impact band
carries reach as well as recovery and "3M+ children and young people" is reach.
**Green is now the organisation's own outcomes.** It also settles the rotating
Impact slot: "6 million youth reached" and "25 Yamuna Yatra" may be green.
Red's meaning is unchanged.

**MUSTARD — a human act. Second person. The interactive colour, and it never
carries state.** Primary buttons, links on dark, hover, active, focus rings,
the Give chip, form submits, the arrow. It becomes a ground exactly once, at
`#give`, and that single field is what licenses it as a control colour
everywhere else.

**`.b-g`, the green button, is retired and deliberately kept in the file so the
retirement is on the record.** Green is applied by *data* — it is what has been
done — and a control is an *act*, which is mustard. A green button teaches a
reader that green means "click me" and spends the distinction that makes the
four green numerals in `#impact` mean anything. The one band that reached for
it uses `.b-2` now.

### 3.2 One hue live per band — verified, not asserted

Every element in every band was walked at 375 and 1440 and its computed
colour, background and four border colours matched against the hue tokens.
Result:

| band | ground | hues present |
|---|---|---|
| `#top` | `#0D0D0B` | **red** (30 elements) + mustard (4, the interface) |
| `#ticker` | `#151512` | **red** (10) + **green** (5) — *the one exemption* |
| `#say` | `#0D0D0B` | **none at all** |
| `#work` `#journeys` `#projects` `#campaigns` `#about` | — | mustard only (1–2, the band's one CTA) |
| `#impact` | `#151512` | **green** (25) + mustard (1, the CTA) |
| `#farm` `#gtm` `#record` | — | mustard only |
| `#give` | `#E1A32B` | mustard (the ground) |
| `footer` | `#151512` | **none at all** |

**Red and green are never in the same band and never in adjacent bands.** Red
lives in band 1, green in band 9 — eight bands apart. Mustard is not a band
hue; it is the interface layer and appears wherever there is an act.

**The ticker holds the site's only exemption, and it is still needed.** It
carries both hues because there it summarises every situation at once and its
colours are *data, not design*. There was an open question about whether the
exemption survived moving the recovery figure out of the situation list; it
does — the frozen strip's rightmost cell is the Impact slot and it is green. To
earn the exemption the strip must stay **visually caged**: its own hex, a
hairline top and bottom, micro-scale type throughout, and **never any
mustard.** (Verified: zero mustard elements in `#ticker`.)

**Two bands carry no hue at all**, and both are deliberate: the smell banner is
the page's one moment with nothing to click, and the footer is addresses.

### 3.3 State is carried by SHAPE as well as hue

```css
.state i{width:9px;height:9px;flex:none;border:1.5px solid currentColor}
.state.live    i{background:currentColor}                                        /* filled  */
.state.demo    i{background:repeating-linear-gradient(45deg,currentColor 0 1.5px,transparent 1.5px 3.5px)}  /* hatched */
.state.closed  i{background:none;border-style:dashed;border-width:2px}            /* dashed  */
```

The chip is `currentColor` — `--fg-2` on dark, `--ink-2` on paper. **It is
never red, green or mustard.** The word carries the state, the fill pattern
carries it again, and the colour carries none of it. That is why the state mark
survives being printed, photocopied, or read by someone who cannot distinguish
the hues — and it is why a state mark can sit in a red band without borrowing
red's meaning.

**The state vocabulary is four words and they are all displayed at all times,
never conditionally: LIVE / PERIODIC / DEMO DATA / OUT OF SEASON.** A badge
that appears only when live needs a conditional, and *the conditional is the
mechanism by which a wrong state gets displayed*. Removing the branch removes
the failure mode. Absence is also unreadable — "not live" and "failed to
render" look identical.

**`live` / `periodic` / `demo` / `closed` are class names and must never become
copy.** The PERIODIC badges were marked `state delayed` until AD-12 (21 August)
— a survivor of the abandoned RECENT/DELAYED vocabulary, rendering a word it did
not name. Nothing ever selected `.delayed`, which is why it outlived a freeze
and two sweeps; the rename is byte-identical in the render, proved on 1,058
computed properties per badge and on identical PNGs. **PERIODIC's hollow square
has no rule of its own — it is the `.state i` default.** Do not add
`.state.periodic i` to complete the set: the absence of a fill is the shape.

**The blink.** Only `.state.live`, only the 9×9 dot, never the word: 2.4s
holding solid for 70% of the cycle — **0.42 Hz, seven times slower than WCAG
2.3.1's three-per-second threshold**. Off-white, because mustard is the
interface and red is a broken limit. Solid at full opacity under
`prefers-reduced-motion: reduce`, so it reads as *on* rather than broken; no
information is lost because the word and the fill pattern carry the state
completely. It must not read as a button: no border, no background, no padding
box, no hover, `pointer-events:none`, never inside an `<a>`,
`aria-hidden="true"` because each slide's `.sr` span already narrates it.
**This is the page's only `@keyframes` — there is exactly one on the whole
file, `s-hero-live`.**

**The state mark belongs to the reading, not to the page.** It is positioned at
the top-right of *its own* frame so it travels with the reading it describes
and cannot desync. It must never live in a page-level masthead. A corner badge
reading LIVE over an editor-entered figure would be the single worst thing on
the site, and that failure mode is made structurally impossible rather than
merely avoided.

### 3.4 A figure is set as a reading, with the rule that belongs to it

**THE RULE BELONGS TO THE NUMERAL, NOT TO THE COLUMN.**

```css
.rl{position:relative;display:block;width:max-content;max-width:100%}
.rl::after{content:'';position:absolute;left:100%;margin-left:var(--kiss);
  top:var(--rl-top,0);bottom:var(--rl-bottom,0);height:var(--rl-h,auto);
  width:0;border-left:var(--rl-w,1px) solid var(--rl-c,var(--hair))}
.paper .rl::after,.paper-2 .rl::after{--rl-c:var(--rule-2)}
.breach .rl::after{--rl-w:6px;--rl-c:var(--red)}
.paper .breach .rl::after{--rl-c:var(--red-ink)}
.closed .rl::after{border-left-style:dashed}
```

`.rl` shrink-wraps its digits (`width:max-content`) and draws the rule as its
own `::after` at `left:100%` plus `--kiss`. **Because the rule starts at 100%
of a max-content box it is geometrically incapable of crossing a digit** — at
every viewport width and for every value length: 412, 0.0, 512, 6,890, 14 of
18. And because every account column's clearance is measured *from the rule*
rather than from a column edge, the rule can never touch the text either.

This replaced a mechanism that failed in two opposite directions from one
cause — the rule was drawn by a fixed-percentage column and the numeral was
positioned against it, so in one place the rule sliced a third of the way into
a digit and in another it floated 215px clear of it. `--ovh` is gone. `--lw` as
a positioning input is gone. The negative margins are gone. The right-hand
column draws no border.

**The rail does not disappear on a phone. It rotates.** The numeral goes
full-width, the rule stays vertical at its right still kissing the last digit,
and the account block drops full-width beneath a hairline that itself carries
the breach state. Indenting the account block to the rule's exact x — which an
earlier written doctrine prescribed — was measured and rejected: it leaves a
211px measure at 375, about 26 characters a line.

**One rotation of the contract exists: the ticker lays the rail FLAT** — the
rule under the numeral rather than beside it — and it carries the state colour
the same way (red under a breach, green under the recovery figure, `--hair`
otherwise).

**Every reading carries the same six parts, and a figure missing any of them is
not a reading:**

1. the **numeral** (`.readout` or `.num`, in `.rl`)
2. its **rule**, in the state that belongs to it
3. the **unit** (`.unit`, micro-caps, `--fg-2`) — *"AQI, 24-HOUR ROLLING"*
4. the **verdict** (`.verdict`, red if bad) — *"SEVERE"*
5. the **published limit and whether it is broken** (`.limit`, with `.limit b`
   in red) — *"CPCB SAFE LIMIT 100. LIMIT BROKEN."* — plus the six-band scale
   (`.bands`) with the tip cell red
6. the **provenance and the hour** (`.src`, hairline-topped) — *"CPCB
   continuous monitor, Anand Vihar. Hourly. Read 07:00 IST · 43 min ago."*

The multiplier (`4.1× the limit`) is derived, and it is set in **`--fg`, not
red** — the breach is already said three ways and a fourth is shouting. On the
hero it sits under the numeral with the bold figure in Archivo and the noun in
Newsreader.

### 3.5 Nothing typed in static markup may make a tensed or dated claim

The page is served statically. **A tensed word is a claim the markup makes
before any script runs**, so computing it fixes the scripted path and leaves
the typed fallback wrong for part of every day. The settled answer is
therefore usually **cut, not compute**:

- A typed `"today"` was **cut**, not computed, for exactly that reason.
- The page-level LIVE dot was **removed** rather than bound to the date —
  removing the branch removes the failure mode.
- `"twenty-six years of paper"` became `"the paper since 2000"`. Four words for
  four words; the other three items in that list are noun phrases so the fourth
  stays one.
- **No year count is typed anywhere.** Founded 2000 is sourced; the count of
  years since is derived or omitted.

**Where a date genuinely must appear, it computes**, from **local `Date`
getters only — never `toISOString()` or `toLocaleDateString()`**. This project
runs IST and that exact pattern has corrupted data before in the owner's other
codebase. Verified: the ticker's absolute date and the source line's relative
age both compute, they agree at all eight mocked instants including
`1 Sep 00:30 → "31 August"` and `1 Jan 2027 00:30 → "31 December 2026"`, and
the relative age ticked 40 → 43 min between two of my own captures today.

**Two live residues in the frozen page, named honestly rather than hidden**
(§9 carries the full list): the record doors type `"Last compiled 18 August
2026"`, which was three days stale on the day I measured; and the archive
sheet types `"Seven of the twenty-seven years are scanned. The other twenty
are…"` plus a `7 / 27` tally. The tally is *currently* true of the 27 cells
actually drawn, so it is not false — but "twenty-seven years" is a typed year
count and the argument that killed "twenty-six years of paper" applies to it
unchanged the moment a 2027 cell is added.

---

## 4. The honesty devices, and how to reuse them

### 4.1 Dotted means placeholder. Dashed means a shut window. They are different.

```css
.tag-demo{border-style:dotted;color:var(--fg-3)}     /* a placeholder / demo value */
.tag-season{border-style:solid}                       /* a validity window — SOLID */
.closed .rl::after{border-left-style:dashed}          /* a window that is shut */
.state.closed i{border-style:dashed;border-width:2px} /* ditto */
```

**`.tag-season` is solid and this was a deliberate correction.** Dashed is
already spoken for and it means *a window that is shut*; "YEAR ROUND" and "IN
WINDOW" say the opposite. A dashed rectangle around micro-caps beside a live
link also reads as a disabled button. **The tag keeps its box** — the validity
window decides whether a situation appears at all, so it is a discrete object,
not decoration.

Window tag vocabulary: `Year round` · `In window` · `Out of window` ·
`One-off window`.

### 4.2 A closed window does not render. Anywhere.

**Client ruling, and it is absolute:** a situation whose validity window is shut
is **absent from the front end.** No dormant cell, no CLOSED word, no dashed
rule, no placeholder, no greyed row. This killed the dormant-cell mechanism
outright.

Three consequences a new page inherits:

1. **A list's length varies with the season.** `repeat(6,1fr)` must be
   `repeat(n,1fr)`, and the grid has to degrade honestly at whatever n it
   reaches. A reader returning in spring finds a column that was not there
   before, so **something on the band must explain why the length changes** —
   the ticker's answer is the computed head line *"Five in window · one
   record"*.
2. **Any `aria-label` claiming completeness becomes false.** "Today's readings,
   every situation" is not true of a seasonal list.
3. **`OUT OF SEASON` is still reachable** — the admin override can switch a
   situation *on* outside its window, which is exactly a rendered
   out-of-season situation. The four-word vocabulary stands.

### 4.3 How an absent value renders

There is no em-dash-for-zero device. It was retired along with every stated
numeral, because a printed total *is* a design depending on a total.

- **No limit exists for this reading** → the limit line says so in words:
  *"No legal threshold."* It does not print a blank, a dash or a zero.
- **A value is not known yet** → the row or cell **does not render**, reusing
  the closed-window grammar. Its absence is the honest form.
- **A whole kind is empty** → it renders nothing, and any boundary row
  ("More this week", "and more →") must reveal itself *by its own child
  position* exactly when something is hidden. A boundary row that
  out-specifies its own `display:none` and paints when nothing is hidden — an
  arrow pointing at nothing — is a real bug that a membership proof caught and
  an assertion would have shipped.
- **A reading of zero is not an absent value.** Yamuna's dissolved oxygen is
  `0.0` against a minimum of `5.0`: that is a reading, it is red, and it is the
  most serious thing on the strip. Note the open question this creates — how an
  *absence* (0.0 of 5.0) ranks against a *multiple* (4.1×) has never been
  answered, and any page that orders readings by severity has to answer it.
- **The design is under review and the content is not written yet** → a
  **marked** placeholder goes in, so the design can be judged at full strength
  rather than distorted by a hole. This is scope, not a reversal: *"where the
  record is missing, the page leaves the hole showing"* still governs what
  ships, every placeholder must be visibly a placeholder at a glance at both
  widths, and each one still needs a launch-time ruling on whether it resolves
  to real content or to a visible hole.

### 4.4 The marked archive cells

27 cells, 2000–2026, four columns at phone widths. Seven are scanned and carry
a **solid dark year chip in white type**. Twenty are placeholders and carry
**four marks at once**: the frame is hatched, the chip is pale and dotted
(`.tag-demo`'s grammar), the cell keeps `.s-record-ph`, and the `alt` text
reads *"Placeholder frame: …"* and **deliberately claims no year**. The tally
`7 / 27 YEARS SCANNED` stays true, and the note says what the hatching means:
*"The other twenty are placeholder frames under hatching — a box nobody has
opened yet. The hatch comes off when a real scan goes in."*

**Two traps in this component.** First, the year chip is absolutely positioned
type at a **fixed 37.7 × 21.5px**, so it does not shrink with the cell: at 4
columns it is already 40.3% of the cell's height, and by 7 columns at 320 it is
**wider than the cell it is marking**. Densifying the field past four columns
at ≤375 unmarks the placeholders. Second, five of the placeholder cells hold
photographs that *are* Swechha's own and are ruled not to be tagged
placeholder — **the class marks an unscanned YEAR, not a doubtful
photograph.** A future session must not "tidy" `.s-record-ph` off them.

### 4.5 Provenance and hour are attached to every reading, and there are two levels

The reading's own line (`.src`, hairline-topped, `--fg-2`) carries **source,
station, cadence, absolute hour and relative age**: *"CPCB continuous monitor,
Anand Vihar. Hourly. Read 07:00 IST · 43 min ago."* At ≤560 it drops
`", Anand Vihar"` and the words "Read" and "today" to hold one line; the
station name is on the situation page in full.

The band's own honesty clause sits in the footer strip: *"Every reading shown
is a sample value standing in for the live feed."* The Impact band's
equivalent is *"Every figure has a method note behind it"* and *"Our own
count, verified to 31 March 2026"* — note **verified, not audited**.

### 4.6 "Audited" is withdrawn as a word

**Client ruling: "Verified, not audited."** *"Audited to 31 March 2026"*
claimed an external audit of programme figures that the record shows as
**owner-verified**. The word is withdrawn from the Impact strip and from its
method note, and **no auditor may be implied anywhere on a programme ledger**.
Swechha's *accounts* being audited is a separate claim and belongs on
About/Reports, not on a programme ledger. (`about.html` still carries it in two
places and is not yet fixed — see §9.)

### 4.7 A figure must be checkable, and the label must say what it counts

Every figure on the page has to be checkable against
`docs/design/2026-08-21-SOURCE-FACTS.md`. Two rules that fell out of doing
that, and both generalise:

- **Name the scope on the tile, not only in the note.** "5% → 90% green cover"
  is **one park** — Vasant Kunj, over a decade. The honest tile says so:
  *"Green cover, in one Vasant Kunj park, over a decade."* A figure set so it
  reads as city-wide when it is one site is the failure this rule exists to
  stop.
- **Say which population a number counts.** "3M+" is a *cumulative* reach
  extrapolation since 2000; the documented curriculum count is 50,000+ students
  in 250+ schools over 15 years. Both can be true of different things, so the
  label has to say which: *"Children and young people reached since 2000."*

And prefer the source's own word. *"Airshed Park"* is what the source says;
*"air-detox garden"* is a term neither source uses. *"Planted and survived"* is
their phrase and it is the honest one.

---

## 5. Components already solved

Reuse these. Do not rebuild them, and do not make a private copy of their
numbers — a page that carries its own `.det-head` instead of `.im-head` is how
nine partials each ended up with a private copy of the same three gap values.

### 5.1 The section opener — `.im-head`

The one gesture every T2 and T3 band opens with. 12-column grid,
`column-gap:24px`, `row-gap:var(--gap-head)`, `margin:0 0 var(--gap-block)`.
First child (the `.d1` head) on `1 / span 6`; last child (the `.lead`) on
`8 / span 5` with `padding-top:.4em` and `align-self:end`; `:only-child`
takes `1 / span 8` with no top padding. Use it for **every** section opening
so the section openings read as one gesture.

### 5.2 The situation deck — an ARIA tabs widget, not a carousel

`role="tablist"` on `.rig-tabs`, `role="tab"` per generated button,
`role="tabpanel"` per `<article class="sit">`, inside a native
`overflow-x:auto` track with `scroll-snap-type:x mandatory` and
`scroll-behavior:auto` — the advance is an instant `scrollLeft` jump.

- **All four panels stay in the DOM and in the accessibility tree at once.**
  An AT user having every reading available is a feature of this deck.
- **It does not loop.** `next.disabled` becomes true at the last slide,
  deliberately.
- Non-selected panels get `tabindex="-1"` on their focusables — **`tabindex`,
  not `hidden` and not `inert`**, so only *sequential* focus is withdrawn.
  Without JS all four stay tabbable, which is the right degradation.
- `.rig-tabs{margin:-19px -5px -5px;padding:5px;scroll-padding-inline:5px}`
  **is four numbers that must move together.** Do not put the `-14px` back on
  the button (that kills the selected-tab marker). Do not drop the horizontal
  half (that re-clips the first tab's focus ring). Do not drop
  `scroll-padding-inline` or the matching `RING=5` in the reveal arithmetic —
  either alone leaves the ring unclipped only at `scrollLeft 0`. **Keep the CSS
  5 and the JS 5 equal.**
- The selected tab is **off-white, and there is no red variant** (§3.1).
- `setActive(ids)` exists, shows/hides slides by `data-id`, rebuilds the tab
  row and calls `mark(0)`. **It is defined and never called** — it is the hook
  waiting for the validity-window backend.

### 5.3 The readings ticker

Two zones under different rules, and this is the part to carry forward:

| | left | right |
|---|---|---|
| what | the situations | **one Impact slot** |
| count | variable — only open windows render | always exactly one |
| ever absent | yes, seasonally | **never** |
| content | fixed per situation | rotates, one active, admin-selected |
| destination | that situation's page | the Impact page |

**Position carries "different in kind", not a mark.** A heavier divider and a
14px gap were built and measured invisible at working size; the rightmost cell
being *always* the Impact slot makes its identity structural and constant, and
it stabilises the strip's right terminus while n varies on the left.

The cell **flips: the value leads and the label sits under the rule.** Head row
is three fields — a left line (*"Delhi, then India."*), a centred computed count
(*"Five in window · one record"*), and the computed date and hour. Scroll
breakpoint **1018px**, set from the worst case the frozen set permits (7 cells)
rather than today's 6; floors are **876 / 1018 / 1195** for 6 / 7 / 8 cells.
Impact-slot content ceiling: **label ≤ 125px (~13–14 caps), value ≤ 125px (~12
digits)**, binding at 375.

**Green belongs to the figure, not to the slot.** A recovery or
what-we-have-done figure renders green; anything that is not that renders
off-white. The admin panel must state at the point of selection that the colour
follows the kind of figure, or the first admin to pick the wrong kind will file
the off-white numeral as a bug.

### 5.4 The band masthead over a halftone photograph

Three photographs on the whole site carry the dot screen, and a full-bleed hero
is defined so nobody has to guess: **a photograph that runs edge to edge,
carries a display headline inside its frame, and has no other content in that
frame.**

```css
.pic::after,.ht.scrim::after{content:'';position:absolute;inset:0;z-index:2;pointer-events:none;
  background-image:radial-gradient(circle at 50% 50%,rgba(0,0,0,.62) 1.5px,transparent 1.7px);
  background-size:6px 6px}
@media (max-width:700px){ /* 4px pitch, 1px dot */ }
```

**The pitch scales with the frame, and dropping the treatment below a
breakpoint is closed.** A halftone is a reproduction metaphor; screen ruling is
chosen for the reproduction size and the dots read against the subject, not
against the screen. The mobile frame is *re-cropped* at the same time — 38 dot
rows can describe a monument that fills the frame, not a plaza either side of
one.

**Composited NORMALLY, not with `mix-blend-mode`** — visually identical for a
pure black pattern, materially more expensive, and unreliable once several
halftoned frames are on screen at once.

**THE RULE FOR TYPE ON A PHOTOGRAPH, and it is simple enough to hold: DISPLAY
TYPE MAY SIT ON A PHOTOGRAPH. NOTHING ELSE MAY.** A headline at 44px or more
needs 3:1, which a short top gradient delivers while leaving the lower frame
untouched. Everything smaller sits on solid ground directly beneath the
picture, at full contrast, where it cannot drift. Copy floating over a full
frame was tried twice and failed contrast both times, and the reason is
structural: a reading block is 450–500px tall, so on an 800px hero it covers
the frame edge to edge, and any scrim strong enough to carry 12px metadata over
a bright pixel darkens the whole photograph to a rectangle.

**The scrim belongs to the TEXT BLOCK, not to the frame** (`.pic-over`), so it
scales itself to one line or three; a band gradient has to guess how tall the
headline is and a two-line headline overruns it.

**Photography is black and white without exception.** Two ramps and nothing
else: `.duo` for a frame where the scrim does the contrast work, `.duo-dim`
for a frame where type sits on an unveiled area. These two rules are
load-bearing — they are the only thing joining the class names to the SVG
`<filter>` definitions, and without them every photograph renders in full
colour while the markup still looks correct. If you touch the defs block,
re-check that `filter` computes to `url(#duo)`.

**A frame that discards 57–69% of the photograph is not a defect signal.** All
three heavy crops were captured at 1:1 and land on their subject. That
percentage is exactly the kind of number that manufactures a phantom defect
list.

### 5.5 The register / ledger rows

Ruled rows, `border-bottom:1px solid var(--rule)` with the last row on
`--rule-2`. Each row is one `<a>` laid out as a grid: **ordinal** (`.w7-pj-n`,
`--ink-3`, `tabular-nums`) · **title** (Archivo 74/800, uppercase) · **fact
line** (`--ink-2`, 13.5px). The whole row is the target, via
`a::before{position:absolute;inset:0 -14px}` which also paints the hover wash
`rgba(20,19,16,.045)` past the rule ends.

**Row ordinals stay. Stated totals do not.** An ordinal numbers a *sequence*
("the order they take up our week"); a total is a number the design depends on.

**Count-independence is proven, not asserted.** Structure fixed, membership
flexes. The three *treatments* carry the weight — a lead item with a
photograph and two `.num` readouts, thin rows for the second kind, one line at
the band's foot for the third — so weight holds at any n. Caps are 6/4 · 4/3 ·
4/3 (desktop/phone) with an **unnumbered** boundary row per kind. Measured
across four membership scenarios including `15p / 7c / 12e` — the worst the
design permits — the band ranged 664.9 → 887.9px, inside the cap, with no
stated total present at any membership. **The CMS contract is one line: emit
every item plus one trailing more-row per kind; pure CSS does the rest per
breakpoint.**

### 5.6 The door cards

`grid-template-columns:repeat(3,minmax(0,1fr))`, divided by `border-right`
with the last cleared, `padding-left:clamp(18px,2vw,32px)` on each subsequent
door. Row structure is `auto auto 1fr auto` so the figure row bottom-aligns
across all three regardless of copy length. Each door: **eyebrow** (`.lbl`
micro-caps) · **head** (Archivo 74/820) · **body** (16px/1.5) · **a figure row
with a mustard arrow** that translates 4px on hover. Focus ring is inset
(`outline-offset:-2px`) because the door is a full-bleed cell.

**One pre-existing 320px defect was found and fixed post-freeze**, and it is
the instructive kind: both the eyebrow and the figure carry `white-space:nowrap`
at ≤519, so at 320 the eyebrow needed 128px inside a 95px track and the row
rendered as *"UPDATED EVERY HOU9,400 DAYS ON FILE SINCE 2000"* — while the two
boxes stayed a clean 16px apart. **`getBoundingClientRect` saw nothing. The
defect exists only in `scrollWidth` vs `clientWidth`, and in the PNG.**

### 5.7 The flat-rail figure (the Impact tile)

The rail's one rotation: numeral above, rule beneath it, label under the rule.
Numeral in `--green`, rule in `--green`, label in micro-caps. The unit rides as
a `<sup>` at `font-size:.3em` with `wdth 88 / wght 700`. An optional eyebrow
above the numeral carries a from-value (*"FROM 5%"*). **Lower bound is
unmeasured**: a one-character value leaves the flat rail ~12px wide, and there
is a length below which the site's signature mark stops being a rule and
becomes a dash. Not established — establish it before shipping a short value.

### 5.8 The CTA family

```css
.b   /* base: inline-flex, gap 9px, Archivo 92/700, 12.5px, .14em, uppercase,
        padding 14px 24px, 1px transparent border, transition .16s */
.b-1 /* PRIMARY  — mustard fill, --on-mustard ink. ONE per band.            */
.b-2 /* SECONDARY— outlined in mustard. On paper: 2px border, --ink label,
        padding compensated to 13px 23px so the box does not grow.          */
.b-3 /* GHOST    — neutral until touched, then mustard. Tertiary rows.      */
.b-g /* RETIRED  — kept only so the retirement is on the record.            */
.lk  /* inline link. Dark: mustard with a .42-alpha underline.
        Paper: --ink with a 2px #E1A32B underline.                          */
.act /* standalone action link. Archivo 92/680, 2px mustard bottom border,
        padding-bottom 5px, 16px svg arrow. The band's one CTA.             */
```

**Disabled carries no hue at all** — a disabled control is not a human act.

**Every section carries a button to its own detail page.** This overrides the
prototype's `href="#"` habit for body CTAs. Menu and header links are wired
separately, after sign-off.

### 5.9 The footer

`.wrap`, `--pad-t4` top, 30px bottom, `#151512`, `border-top:1px solid
var(--hair)`. A four-column link grid (`1.5fr 1fr 1fr 1fr`, 30px gap) with
`h3.lbl` heads in `--fg-3` and links in `--fg-2` at 15.5px/1.8 going mustard
on hover. Then `.foot-soc`, then `.foot-b` legal strip. The wordmark sits at
rest at `height:42px` — the page closing the way it opened.

**The social row is words, not icons, and this is the judgement to defend.**
The page's entire vocabulary is type, rules and photographs; the only non-type
marks it permits anywhere are the `→` arrow, the six-band scale and the
halftone. Four platform logos would be the site's first icon set, arriving as
four foreign trademarks each carrying its own colour and geometry into a design
that has spent eleven bands refusing exactly that import. The words are just as
recognisable, they carry the register, and they are mechanically better — real
text, so they inherit the footer's contrast, need no SVG and no alt string, and
scale with the type instead of against it.

The row is a **sub-row, not a fifth column**: a fifth column takes the four
existing ones from 352.7 / 235.1×3 to 280 / 187×4 at 1440 and "Environmental
Intelligence" wraps at 187px. As its own sub-row it costs one hairline and
reflows nothing — verified identical to the decimal.

It carries a label and a sentence, and the sentence does two jobs:

> **FOLLOW THE WORK**
> Journeys, clean-up dates and film go out on these four accounts — all of them
> **@swechhaindia**. *Nothing on this page is pulled from them.*

**No follower counts, no embeds, no "latest from Instagram".** The closing
clause is the page's honesty grammar and it pre-empts the reader who wonders
why there is no Instagram grid. Links: `instagram.com/swechhaindia/` ·
`facebook.com/SwechhaIndia/` · `x.com/swechhaindia` (labelled
**"X / Twitter"** — a bare "X" is a one-character tap target and an ambiguous
word read aloud) · `youtube.com/@swechhaindia`. All four
`rel="noopener" target="_blank"` with `<span class="sr"> (opens in a new
tab)</span>`. Each is exactly **44.0px** tall at every width including 320.
**No LinkedIn — none exists on the live site, and the file carries an HTML
comment saying one may not be invented**, so that whoever ports this does not
helpfully fill the gap.

### 5.10 The nav, the SECTIONS index and the active-section underline

**Desktop (>940).** `.nav` is `position:sticky;top:0;z-index:60` on `--ground`
with a `--hair` bottom border. `.nav-in` runs on `.wide` (1580) at
`height:var(--bar-h)`. Six `.nl` links plus the mustard `.give` chip. The
header running on `.wide` while bands run on `.wrap` is intended, not drift —
so the logo at 46px does not align with the 146px content spine at 1440.

**Phone (≤940) — the pattern inverts.** `.nav` goes `position:static` and
reserves `padding-top:var(--bar-h)`; `.nav-in` goes `position:fixed`. **This is
not a style choice**: moving `position:sticky` down to `.nav-in` does not work,
because a sticky box is constrained to its own containing block and `.nav` is
only 105.8px tall — measured at 375, `scrollY 400` put a "sticky" `.nav-in` at
`top:-350`. Fixed, with `.nav` reserving the 56px it no longer occupies, is
what actually leaves one row on screen. `.nav-in`'s `max-width:1580px` is inert
below 940 because the viewport is already narrower; **do not lift this block
out of the media query** or the bar's background becomes a centred box on
desktop.

Under the fixed bar sits `.navscroll`, a **non-sticky** horizontally scrolling
chip row: 56px of permanent chrome, ~37px of one-time chrome, no JS and no
drawer. Its right-edge affordance is the same 8px hard mask the hero's tab row
uses, plus a real 8px trailing flex item — a flex container's trailing padding
is not honoured as scrollable overflow, so at full scroll-right the last chip
ended 8.2px *inside* the fade.

**The SECTIONS index control**, in the bar's own unused space: at 375 the bar
carries a 120px wordmark and a 70.4px GIVE chip inside 335px of content width,
leaving **144.6px already paid for and empty**. The control is **70.0 × 44.0px**
at x 202.5.

- **No new iconography, which is the ruling and not an oversight.** No
  hamburger, no caret, no chevron. The control is the word the page already
  uses for these six things, set in the nav's own micro-caps.
- **Its open state is the page's own mark**: `.nav a.nl` already carries a 2px
  transparent bottom border that goes mustard on hover and on
  `[aria-current]`; the button borrows that declaration for
  `[aria-expanded=true]`.
- The panel is **six full-width 44px rows, hairline-ruled** — the same
  ruled-rows grammar as the footer grid and the record doors — `position:fixed`
  at `top:var(--bar-h)`, at **z-index 59 against the bar's 60**, so the
  wordmark, the control and GIVE stay visible above it.
- The rows carry `class="nl"` and live inside `.nav` on purpose, so they
  inherit the nav's type, colour and `[aria-current]` underline with no new
  rule — opening the index also shows the reader which band they are in.
- **Not modal, and that is the point.** No scrim, no focus trap, no
  `aria-modal`, no scroll lock. Four ways out: press it again, Escape, choose a
  destination, or touch anything else.
- **It must stay `hidden` in the markup and must stay immediately after its
  button inside `.nav-in`.** Placed after `.navscroll` the tab order ran
  SECTIONS → GIVE → panel, so the first Tab *left* the panel and a keyboard
  reader could open the index but never enter it.
- **The chip row's `tabindex="-1"` while the panel is open is load-bearing**,
  not tidying: without it a Tab inside the open index scrolls the page back to
  the top from anywhere below the fold.
- Cost: **zero pixels, open or closed**, at 320, 375×812, 375×635 and 768.

**The anchor-offset token.** `html,body{scroll-padding-top:var(--nav-h)}`, set
on both because `body{overflow-x:hidden}` makes body a scroll container too and
whichever the UA scrolls has to carry the offset. It is a *scroll* offset, so it
adds no layout height, costs no document height, changes nothing until an
anchor is used, and **covers anchors added later** — which is why it beats
per-element `scroll-margin-top`. Before it, every in-page jump put the band's
top edge at viewport y=0 and the header painted over the first 56/63px: at 375,
`#farm` lost **34.0px of a 37.1px masthead headline (92%)** — the FARM link
delivered a band with no title on it. After: every landing within **±0.48px**
of `--nav-h` on both paths (cold load with the hash, and a same-page click), at
375×812, 375×635 and 1440×900.

**Transient overlap while free-scrolling is not a defect and is left alone** —
display type passing under a sticky header is what a sticky header *is*. The
distinction that matters is overlap on **arrival**, because that hides the one
word that tells the reader they got there.

**The active-section underline.** No new colour, no new mark, no new
breakpoint: the code adds and removes one attribute, `aria-current="location"`,
and the CSS that lights it was already drawn. Three things about it are
load-bearing:

1. **It is not a reveal system.** Nothing observes anything in order to animate
   it. No rule in the file puts a transition on `.nav a.nl`. The underline
   appears on the frame it is set.
2. **The reading line is driven by `--nav-h`, read from the custom property**,
   so the 56/63 split is inherited rather than re-typed. The anchor jump lands
   the band top at exactly `--nav-h` and the reading line sits at exactly
   `--nav-h`, so **the band a reader jumped to is the band that lights, by
   construction.** Never re-type 56 or 63 into that code.
3. **Do not simplify the containment test back to `isIntersecting`.** A
   same-page click on JOURNEYS lands the band top at 56.47 against a line at
   56.0, so the boundary itself crosses the line and *both* bands intersect —
   and whichever went live first won. Measured: clicking JOURNEYS at 375
   underlined WORK, while 1440 happened to be correct. Each callback recomputes
   from the rects with `top <= line+0.5 < bottom`.

**The underline going dark in five of the fourteen bands is deliberate.** The
nav is a *selection* of five destinations, not a partition of fourteen bands.
Holding the last-lit item was considered and refused: it leaves JOURNEYS
underlined through Projects, Campaigns and About — three bands that are Work's
children, not Journeys' — and `aria-current` is announced as the current
location, so pointing it at the wrong section is worse than pointing it
nowhere.

Guard it: `if(!('IntersectionObserver' in window)) return;`. No observer, no
attribute, no error, and a nav that behaves exactly as before.

---

## 6. The floors

Every number here was measured on the built file, and the touch numbers were
measured on the **pseudo-element hit box, not the element rect** — see the
warning below.

### 6.1 Touch targets: 24px is the floor, 44px is the target

| | measured on the frozen page |
|---|---|
| controls under **24px** at any width (320–1920) | **zero** |
| controls under **44px** at phone widths | **four**, all in one arithmetically capped stack |

The page states a 44px floor and enforces it directly in five places
(`.give` and `.mark` at ≤940, the deck's tabs at ≤940, the hero plate's `.act`
at ≤560, the Impact foot's `.act` at ≤767). Six other controls never got it and
were fixed by expander.

**THE HIT BOX GROWS, THE DRAWN BOX DOES NOT.** Every one of those controls
carries a 2px mustard underline or an optical baseline that is part of the
composition, so raising `min-height` would drop the rule 8–17px and add roughly
136px of document height across the page. Instead:

```css
.act,.w7-ce-lk,.w7-ce-pre a{position:relative}
.act::after,.w7-ce-lk::after,.w7-ce-pre a::after{
  content:'';position:absolute;left:0;right:0;top:50%;
  transform:translateY(-50%);height:var(--hit,44px)}
```

**MEASURE THE PSEUDO BOX, NOT THE ELEMENT RECT.** A probe that reads
`getBoundingClientRect()` on these controls reports 17.3px and 23.0px and will
tell you the page fails WCAG 2.5.8. It does not. The real hit height is
`getComputedStyle(el,'::after').height` when that pseudo is
`position:absolute` with a stated height; take `max(pseudo, rect)`. Document
height is unchanged at every width — verified 10,244 before and after at 375.

**MEASURE THE CLEARANCES FIRST, so no expander steals a neighbour's taps.**
Nearest interactive neighbour to each `.act` at 375: 37.0 · 32.0 · 27.0 · 35.8
· 267.0 · 562.2 — all clear of the 8.5px per side that 27→44 costs.

**The two-rule campaigns exception, and why the order is the point:**

```css
.w7-ce-pre a{--hit:24px}
.w7-ce-pre + .w7-ce-lk{--hit:24px}                  /* safe base            */
.w7-ce-pre:not(:has(a)) + .w7-ce-lk{--hit:44px}     /* give 44 back         */
```

A first version capped this by breakpoint at ≤767, and at exactly 768 the name
is 23.6px tall so it *still* took the 44px expander and **overlapped the link
above it by 5.6px** — two links fighting for the same pixels, worse than the
small target it replaced. The rule is now structural rather than
breakpoint-based, and it is written in that order on purpose: **an engine
without `:has()` drops the second rule and keeps the conservative base**,
rather than dropping the constraint and bringing the overlap back.

**Where 44px is arithmetically impossible, take 24 and say so.** Two different
destinations 8.0px apart inside a 48.3px envelope need 88px for two 44s. They
are at the 24px AA floor, which fits (3.35 + 0.5 of the 8px gap, leaving
4.15px between them). Closing it needs the composition opened, and that is a
client call, not a silent one.

### 6.2 Focus visibility

```css
:focus-visible{outline:2px solid var(--mustard);outline-offset:3px;border-radius:1px}
.paper :focus-visible,.paper-2 :focus-visible{outline-color:var(--mustard-ink)}
.paper .b-1:focus-visible{outline-color:var(--paper);box-shadow:0 0 0 5px var(--mustard-ink)}
.gv :focus-visible{outline-color:var(--on-mustard)}
```

Note the ground-specific overrides: a mustard ring is invisible on a mustard
chip, so a primary button on paper inverts to an off-white ring with a 5px
`--mustard-ink` halo, and anything inside the mustard band rings in
`--on-mustard`. **The frozen commit carried this pair twice** — an earlier,
weaker copy at equal specificity that could never win. The block above is the
authoritative one; the duplicate was swept on 21 August.

**A scroll container clips BOTH axes.** `overflow-x:auto` forces
`overflow-y:auto`, so any ring drawn outside a border box inside a horizontal
scroller is discarded. This has bitten the file twice — once on the deck's tab
marker and once on its focus ring, 5px on all four sides at every width. The
cure both times is **padding inside the scroll box cancelled by an equal
negative margin**, so the margin box and every child's position are unchanged:

```css
/* journeys rail, ≤767 */ margin:-8px calc(-1*var(--gut));padding:8px var(--gut)
/* deck tab row        */ margin:-19px -5px -5px;padding:5px
```

**Padding alone only guarantees the ring at `scrollLeft 0`.** Measure the ring
*after scrolling*, not only at rest — a click out and back left the deck's row
resting at `scrollLeft 5`, exactly the ring allowance scrolled off.

**A corner control takes an INSET ring.** The skip link lives at the top-left
corner, and the `.give` halo treatment (`outline-offset:2px` plus a 5px mustard
box-shadow) would put 7px of ring above y=0 and off the screen. Inset
(`outline-offset:-3px`) is the pattern the ticker cells already use for the
same reason. A ticker cell's ring being inset is **not** a clipped ring —
that probe error was made once and corrected.

**Result on the frozen page:** ring overhang **0.00 on all four sides at all
twelve widths**, at rest and after scrolling. Skip link and index control both
ring visibly and were read in PNGs at 375 and 1440.

### 6.3 Keyboard

- **A skip link is stop 1**, off-screen at `top:-200px`, arriving at `top:0` on
  focus, 195.4 × 44.0px. Focusing it does not scroll the page (scrollY 0 → 0,
  and 5000 → 5000 from mid-page); activating it moves focus to `MAIN#main` and
  the anchor offset applies to it for free.
- **One `<main id="main" tabindex="-1">`** wrapping the content sections and
  stopping before the footer. `tabindex="-1"` so the skip link's focus actually
  *lands* rather than only moving the sequential start point.
  `main{display:block;margin:0;padding:0}` is stated rather than assumed,
  because a UA default on an unknown element is exactly how a wrapper added for
  accessibility ends up costing document height.
- **Stops before the content: 9 at >940, 10 at ≤940** — and stop 1 bypasses all
  of them. Only one index is focusable at a time, in both panel states.
- Landmarks: header, four labelled navs, main, footer. No duplicate ids.

### 6.4 The phone budget

**No band may exceed ~900px at 375, and there are two licensed exceptions: the
heroes (one viewport each) and — by client ruling — `record`, by name.**

Measured at 375: **one breach, `record` at 1,393.48px**, 493px over. Every
other band is inside. `record` also breaches at 390 (1,280.03), 414 (1,283.05)
and 560 (1,249.06). At 320, four bands breach (about 1,023.41 · farm 905.44 ·
record 1,487.92 · give 935.38) and **320 is below the tested floor by prior
ruling** — recorded as data, not as a defect list.

**Record's licence was granted on arithmetic, not on preference**, and the
arithmetic is worth keeping because it is the shape of this argument in
general:

- densifying the archive field closes nothing **at any density** — not 5
  columns (1,267), not 7 (1,121), not 9 (1,066), not 14 (1,021, cells 19.3 ×
  12.8px);
- densifying **breaks the placeholder marking before it gets close**, because
  the year chip is a fixed 37.7 × 21.5px and by 7 columns at 320 it is wider
  than the cell;
- **deleting all three doors still leaves the band at 946.34px**;
- so the breach is not attributable to any one element — it is the sum of four
  subjects in a band where every other band carries one.

The exception count stayed at two rather than rising to three, because the
timeline band that held the second licence was deleted and left it vacant.

**The ~8,200px document target was formally ruled unreachable** and the page
ships at full length. Do not inherit it as a live constraint; do inherit the
habit of ledgering the overage rather than hiding it.

### 6.5 635px is the real phone height

**The phone is costed at ~635px of actually-visible iOS Safari, not 812.** This
is the number that decides mobile arguments, and it has already cost real
design money: a hero at 806–811px put the deck's whole control bar below the
fold on every real phone, and the fix was 96px of cut copy plus a −19.5px
structural move. At 375×667 the deck's tab row, pager and both arrows are
**183.4px below the fold** — confirmed `tabsVisible false`, `countVisible
false`, `arrowsVisible false`.

Measure every band at **375×635 as well as 375×812**, and quote both.

### 6.6 No horizontal overflow

**`document.scrollWidth === innerWidth` at 320, 375, 390, 414, 560, 768, 901,
1024, 1280, 1440 and 1920 — and with the index panel open.** Body matches.
Verified independently in this pass at all thirteen widths.

There are exactly two licensed horizontal scrollers — the ticker and the
journeys rail (plus the nav chip row and the deck track as chrome) — and each
must show a hard **8px** ground-coloured fade at its right edge so it is
obvious there is more.

### 6.7 The console is silent

No errors, no warnings, no exceptions, no failed requests, at every width,
before and after every change, and with the index panel open. **The
`console.warn` guards in the date code stay in the shipped file**: mid-repair
an agent broke a comment and killed the entire date IIFE, and **the page looked
identical to correct behaviour**, because silent-and-empty is the honest
failure mode those guards produce. Only the warnings caught it.

---

## 7. Explicitly forbidden

1. **Auto-advancing carousels.** Ruled *no*, not "not yet". The reading load on
   the slowest panel is 31.5s at 200 wpm and 42s at 150 wpm; to not interrupt a
   reader the interval must exceed ~30–40s, and to register as an affordance it
   must be ≤8s. **The brackets do not overlap.** On the one device where the
   discovery problem is real, the controls are below the fold, so the phone
   reader would see the panel change with **no visible control** — WCAG 2.2.2
   cannot be met there, and pause-on-touch needs an end-of-user-scroll signal
   that is not reliably implementable on the iOS versions in this audience.
   It also demotes the lead: left to run, every reader's resting state becomes
   the *weakest* reading. If the client ever overrules this, the only
   non-damaging form is written down in `2026-08-21-AD-08-slider-automation.md`
   §7 — never on load, `n ≥ 3`, fine pointer only, at most two advances, dies
   permanently on any interaction, with a text PAUSE control in the page's own
   vocabulary.

2. **A reveal / IntersectionObserver animation system in these files.** `.rise`
   exists, matches **zero nodes**, and its observer is inert. **Leave it
   inert.** There are 18 transitions in the whole file and not one touches a
   nav link, the skip link or the index control. The page has no motion
   language beyond one 0.42 Hz dot, and the active-section underline appears on
   the frame it is set. A new page that adds scroll-triggered reveals is not
   matching this design; it is replacing it.

3. **Selective colour.** Retired from photography. **Hue lives only in type,
   data, marks and controls.** Two ramps and nothing else, `.duo` and
   `.duo-dim`.

   **The retirement is not yet enforced across the site, and this is worth
   knowing before you copy a defs block from the wrong page.** Measured on 21
   August:

   | | `sig-*` filters defined | actually referenced |
   |---|---|---|
   | `v3/home.html` (frozen commit) | 5 | **0** — swept the same day |
   | `v3/situation-air.html` | 5 | **0** — dead weight, carry nothing forward |
   | `v3/about.html`, `v3/intelligence.html`, `v3/system.html`, `v3/situation-yamuna.html`, `v3/situation-soon.html` | 5 each | to be checked per page |
   | the eleven `journeys-*` / `project-*` / `*-landing` pages | 5 each | **6 each — selective colour is genuinely live there** |

   So eleven pages still apply the treatment to photographs and **contradict
   the frozen language**. That is a separate remediation job, not a licence.
   Copy defs from the swept `home.html` — two filters, `duo` and `duo-dim` —
   and from nowhere else.

   `lib/content/schemas.ts` also still carries
   `heroImageSchema.signal: 'none'|'red'|'mustard'|'green'`, the field that fed
   the treatment. **Dead surface. Do not build against it.**

4. **Borrowed platform logos, and icon sets generally.** The only non-type
   marks the site permits anywhere are the `→` arrow, the six-band scale and
   the halftone dot screen. A disclosure glyph would be the page's first icon;
   four platform logos would be its first icon *set*, arriving as four foreign
   trademarks with their own colours and geometry.

5. **Invented figures.** Every number must be checkable against
   `2026-08-21-SOURCE-FACTS.md` or an owner ruling. No follower counts, no
   embeds, no "latest from Instagram", no invented editions or counts. **Prefer
   a sourced phrase over an invented one** — the lines that work on this page
   are the ones quoted straight.

6. **"Fix it once" thinking.** **Each page carries its own `<style>`.** These
   are single-file design prototypes and there is no shared stylesheet, so a
   fix made on the homepage does *not* propagate. Every page must be audited
   against this document individually, and a "we already fixed that" is only
   true of the file it was fixed in. That is exactly how `situation-air.html`
   still carries three defects the homepage cured.

7. **Red on a control.** (§3.1.) **Green on a control.** (§3.1.) **Mustard
   carrying state.** (§3.1.)

8. **A stated total on the page.** (§5.5.) **A layout whose height is a
   function of n.** **Weight expressed as row count.**

9. **A tensed or dated claim typed into static markup.** (§3.5.)

10. **Dashed used for anything except a shut window.** (§4.1.)

11. **A hamburger drawer**, or any modal — it would be the site's only modal
    pattern, on a page meant to read as an instrument rather than an app.

12. **`toISOString()` / `toLocaleDateString()` for a local date.** (§3.5.)

---

## 8. The measurement method — this is part of the language

Three traps have each manufactured a phantom defect list on this project. All
three are cheap to avoid and expensive to re-discover.

1. **`Emulation.setDeviceMetricsOverride` only. Never a bare
   `--window-size`.** It has produced false defect lists twice.
2. **`Page.captureScreenshot` with a clip and `captureBeyondViewport:true`
   renders `position:fixed` elements against the DOCUMENT origin**, so the
   fixed mobile bar and the index panel land in the wrong place or vanish from
   every scrolled capture. Viewport shots must be taken with
   `captureBeyondViewport:false`. *I hit a residual form of this in this pass:*
   a 375×635 viewport capture composited the fixed bar *below* the hero
   masthead, which looks exactly like a self-scrolling page. A three-line probe
   showed `scrollY 0`, `.nav-in` position `fixed`, `top 0`. **Verify a
   suspicious PNG against a probe before reporting it.**
3. **`loading="lazy"` images below the fold never load for a clipped CDP
   capture** unless the element is scrolled through first. Scroll the target
   into view and flip every image to `eager` before shooting — otherwise a
   photograph appears "missing" and is not.
4. **`sips --cropOffset` is unreliable. Crop with PIL.**
5. **Read the PNG.** Two of the defects in the frozen page's history exist only
   in `scrollWidth` vs `clientWidth` and in the picture — a
   `getBoundingClientRect` check saw two boxes a clean 16px apart while the
   glyphs collided. Box measurement and image reading find different bugs and
   you need both.

Harness in the session scratchpad: `cap10.mjs` (capture), `measure.mjs` /
`mh.mjs` (probe at a list of widths, or width×height pairs — use the latter,
because document height depends on viewport height).

---

## 9. Honest about what is undecided, and which documents are stale

**None of this is a reason not to build. All of it is a reason not to inherit a
number without checking it.**

### 9.1 Soft spots inside the frozen page

| item | status |
|---|---|
| The ticker's **1018px breakpoint has never been rendered for real** — it is the n=7 floor and seven cells have only ever existed as an injected simulation. | Re-measure the first time a seventh window genuinely opens. |
| **The count wording has never been seen at a low n.** n=1 is arithmetically possible in February; a two-cell grid at 1440 gives each cell ~700px and stops reading as an instrument. | Blocked behind the window fields; not solvable now. |
| **The Impact slot's lower bound is unmeasured.** A one-character value leaves the flat rail ~12px wide. | Establish before shipping a short value. |
| **How an absence (0.0 of 5.0) ranks against a multiple (4.1×)** has never been answered. | Needed by anything that orders readings by severity. |
| `"Last compiled 18 August 2026"` is typed and was **three days stale** on 21 August. | A dated claim in static markup. Needs cutting or computing. |
| `"Seven of the twenty-seven years"` / `7 / 27` are typed year counts. | Currently true of the 27 drawn cells; goes stale the moment a 2027 cell is added. |
| `"9,400 days on file since 2000"` is **unsourced and drifts daily** — 2000-01-01 to today is nearer 9,729. `"34 guides"` is unsourced. | Both flagged, neither in SOURCE-FACTS. |
| `"air-detox garden"` survives in the DIY door's copy — the term the gardens ruling killed. | Here it names something a reader might build, not a count of Swechha's gardens, which may be why it was left. Needs a ruling. |
| The `320` **Record doors eyebrow collision** was fixed post-freeze with a `@media (max-width:374px)` allowing the eyebrow to wrap; `record` grows to 1,487.9px at 320 as a result. | 320 stays below the tested floor. |
| `content/photo-library.json` has **53 entries and not one `cityscapes-*` file**, so the archive credit those frames were ruled to keep is not recorded anywhere in the repo. | Owner of the photo library. |
| The **campaigns pair stays at the 24px AA floor**; 44px is arithmetically impossible in a 48.3px envelope. | Client call, already AA-compliant. |
| The **GIVE chip goes mustard-on-mustard over the Give band.** | Cosmetic; a taste call. |
| **Footer links are 27.9px at 768 and 1440** (12 of them) — above 24px AA, below 44px, and 768 is a touch device. | Extending the phone treatment to ≤940 would close it. |
| **The deck's arrows are 40×40 at 768** — the 44×44 rule lives inside `@media (max-width:560px)`. | One line if the band is opened. |
| The **40% unveiled floor** on a hero photograph is arithmetically impossible above 860px against the whole-frame denominator (the ceiling at 1440×720 is 37.0% with both veils at zero). | **It needs restating against a named denominator before it is quoted again.** Shipped clean picture: 50.4px at 1440×720, 168.4px at 1440×900, 62.2px at 375×635. |

### 9.2 Stale documents — flagged, not repeated

**`docs/design/2026-08-20-art-direction.json` should not be used as a spec any
more.** Its `mobileDoctrine` was amended on 21 August and the rest was not.
Specifically:

- **`groundRhythm` describes twelve bands in the wrong order.** It lists
  journeys as band 4 on paper, work as band 5 on black, and **a timeline band
  at 6** as "THE PAUSE". The page has **fourteen** bands, no timeline band
  (deleted), and the order in §1.1 above.
- **`spaceRules` still lists the tier assignments against those dead band
  names**, and describes `--pad` as the thing to replace — which it was, and
  has been.
- **`perSection[0].hook`** still promises *"a three-digit numeral … standing
  over a halftoned India Gate in the haze"*. The ruling is the opposite: the
  photograph is a **masthead band** and the reading sits on solid ground. This
  line was already owed a rewrite and has not had one.
- **`perSection[0].job`** still says *"today's worst broken legal limit"*. The
  deck is governed by **validity window × severity**, with no special
  preference for Air.
- **`perSection[1]`** still says *"seven live readings"* and gives the ticker a
  fixed count. The strip is six cells today and **variable by season**.
- **`perSection[5]`** specifies a timeline band that no longer exists — and its
  900px cap licence, which that band held, is what `record` inherited.
- **`perSection[7]`** still says the farm is *"forty acres, sixty kilometres
  away"*. Ruled: **five acres, an hour and a half from Delhi.**
- **`perSection[8]`** still says Green the Map has *"no display type at all"*.
  Its wordmark is now `.d1`.
- **`perSection[9]`** still says *"twenty-six years of paper"*, which is the
  exact string the year-count ruling removed.
- **`mobileDoctrine`'s** *"375 today is 12,296px"* is stale, and its own 21
  August amendment then quotes *"the frozen page is 10,282px at 375"* without a
  viewport height — that figure is 375×**900**; at 375×812 it is 10,244 and at
  375×635 it is 10,125.
- **`mobileDoctrine`'s rail instruction** — *"the account column drops below
  and is indented to the rule's exact x-position"* — was measured and
  overruled in favour of the build. The doctrine is what changed, not the code.

`README`-level docs and the `2026-08-19-*` direction files are historical.
`DECISIONS-2026-08-20-homepage.md` is the live ruling ledger;
`2026-08-21-SOURCE-FACTS.md` is the live fact base. Use those two plus this
document.

---

## 10. Building page N+1 — the checklist

**Before you write CSS**

1. Copy the `:root` block, the voices block, the grounds/tier block, the rail
   contract, the state marks, the buttons/links/tags block, `.im-head`, the
   nav + SECTIONS + underline block, the hit-expander block, the skip link and
   `main`, and the footer — **verbatim**. Do not retype a number that is
   already a token, and do not make a private copy of `.im-head`.
2. Declare the band sequence first: id, tier class, ground hex. **Check no two
   adjacent bands share a hex, mechanically.**
3. Decide which single hue each band carries, and which bands carry none.
   **Red and green must not meet, and only a ticker-class summary strip may
   hold both.**
4. Budget each band against 900px at 375. If one cannot make it, say so with
   the arithmetic and ask — do not quietly breach, and do not damage a
   component to hit the number.

**Before you write copy**

5. Every figure checks against SOURCE-FACTS or an owner ruling, and its label
   says which population it counts.
6. Grep your own file for `today`, `now`, `currently`, `this year`, `since`,
   `as of`, a month name, and `20\d\d`. Every hit is either cut, computed from
   local `Date` getters, or a sourced constant like "since 2000".
7. Every reading carries all six parts (§3.4). If it cannot carry a published
   limit, the limit line says so in words.
8. Every section carries a button to its own detail page.

**Before you call it done — the same measurements the homepage was signed off
on**

9. `document.scrollWidth === innerWidth` at **320, 375, 390, 414, 560, 768,
   901, 1024, 1280, 1440, 1920**, and in every open/closed state of any panel.
10. Contrast: walk every element with its own text, composite its effective
    background, test against 4.5:1 / 3:1. **Zero failures**, not "no known
    failures".
11. Touch: **zero controls under 24px at any width.** Measure the pseudo box.
    Name and justify every control under 44px.
12. Focus: ring overhang **0.00 on all four sides** at every width, **at rest
    and after scrolling any scroll container**.
13. Keyboard: skip link is stop 1; count the stops before content; one index
    focusable at a time; no off-screen duplicate links in the tab order.
14. Anchors: both paths — cold load with the hash and a same-page click — land
    within **±0.5px of `--nav-h`** at 375×812, 375×635 and 1440×900, and
    `aria-current` is correct on arrival.
15. Band ledger at **375×812, 375×635 and 1440×900**: height, top, pad-top,
    ground, for every band. Publish it. It is how the next pass proves it
    changed nothing.
16. Console silent at every width.
17. **Read the PNGs.** At minimum: every band at 375 and 1440, every heavy
    crop at 1:1, every placeholder treatment at 320 and 375, and every panel in
    its open state.
