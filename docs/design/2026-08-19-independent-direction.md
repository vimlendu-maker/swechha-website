# The Record

**An independent art direction for swechha.in. 19 August 2026.**

Commissioned as an outside opinion, explicitly released from the existing
tokens, the decision ledger, the brand guidelines and the previous
instructions. What follows is what I would do if the site were mine, and what
I would refuse to do. Mockups:

- `public/design/explore/moodboard.html`
- `public/design/explore/direction-a-home.html`
- `public/design/explore/direction-a-journey.html` (Yamuna Yatra)

---

## 1. The one idea

> **Swechha has been keeping a record of Delhi's environment for twenty-six
> years. The site should look like the record, not like a brochure about the
> people who keep it.**

Nobody else on the internet is publishing a daily broadsheet of a river's
vital signs. There are photo essays and there are dashboards. There is no
newspaper of the environment. Swechha is the only organisation in this brief
that already has the two things such a thing needs: a live instrument feed and
a twenty-six-year archive.

Three rules follow.

1. **The page is a printed page.** Newsprint ground, hairline rules, no cards,
   no shadows, no rounded corners, nothing floating.
2. **Measurement is the loudest thing on the site.** Wherever Swechha is
   telling you what it read today, the ground turns black and the number
   becomes the largest object in the layout.
3. **Colour is evidence.** The site is black and white until a reading crosses
   a published legal threshold. Then, and only then, it goes red.

Rule three, stated so you can argue with it: **if Delhi's air and the Yamuna
were within legal limits, this website would contain no colour at all.** The
red is not a brand asset. It is a condition of the city, and the site gets
redder as the city gets worse.

---

## 2. What is wrong with the current site

I agree with the 19 August audit's diagnosis of *symptoms* and disagree with
about half of its prescription. Where I agree I have not repeated the argument.

### 2.1 There is no display scale, and every proposed fix keeps three families

`journeys-landing.html:364` sets the largest type on the page at
`clamp(2.1rem,5.4vw,4.2rem)`. Section headings at `:340` are
`clamp(1.4rem,2.7vw,2.15rem)`. Body at `:63` is 17px. That is a display-to-body
ratio of 3.95:1 across two octaves, and it is why nothing on the site has ever
been big.

The audit's fix is to push D1 to `clamp(4rem,13vw,11rem)`. Correct. But it then
keeps **three families** (Fraunces, Archivo, Instrument Sans) in every option
except one, and its recommended option still keeps Fraunces as the voice of
every heading. Fraunces is the most-used display serif in AI-generated design
work of the last two years; its `WONK` and `SOFT` axes are the reason it is
attractive and also the reason it reads as decoration rather than as a
publisher's face. I would drop it entirely.

### 2.2 Ten equal-width rows per board

`journeys-landing.html:383, 399, 426, 453` and `about.html:462, 463, 478` are
all `repeat(N,minmax(0,1fr))`. The whole site is a stack of identical rows of
identical rectangles. This is the single most reliable signal of design by
consensus: no element is allowed to dominate, because no one in the room could
agree which one should.

### 2.3 The palette is doing two contradictory jobs

`app/globals.css:66-73` makes mustard "THE accent" and `:76-78` makes red "THE
one severity hue," and both live on the same charcoal ground. So the page has a
decorative gold and an alarming red competing for the same eye at the same
time, and the moment a reading goes critical the two are adjacent. Mustard is
also the single most common accent in nonprofit web design of the last five
years; it says "we are warm and hopeful about the environment," which is a
position, but it is not Swechha's position and it is not what the data says.

### 2.4 Selective colour will not survive the archive

The selective-colour SVG filter is genuinely the most original thing in the
current system and I would still kill it, for three reasons.

- It needs a hand-tuned `signal` decision per photograph. Across a
  twenty-six-year archive of several thousand images that decision will be made
  by whoever is on shift, and it will decay.
- It reads as a 2014 photo filter. On `children-seedling-boxes-field.jpg` it is
  already baked into the source file, so the site is currently running two
  selective-colour systems on top of each other.
- It is unnecessary. The two strongest photographs the organisation owns,
  `yamuna-students-foam-line.jpg` and `clean-air-protest.jpg`, **arrived in
  black and white.** The archive is telling you what it wants to be.

### 2.5 Nine detail pages are one template

`public/design/project-*.html` are within 300 bytes of each other. Four
Journeys that are genuinely different experiences are being served by one
architecture with the strings swapped. My Journey page deliberately uses a
different hero structure from my homepage for exactly this reason: the system
has to be provably able to hold more than one shape.

### 2.6 Findings from the photo library that are not a design issue but will become one

While selecting photographs I found the library is not production-ready:

- **Stored sideways with no EXIF orientation** (they will render rotated 90
  degrees in every browser): `yamuna-barrage-crowd.jpg`,
  `yamuna-source-rapids.jpg`, `forest-group-walk.jpg`, `hillside-gathering.jpg`.
  There are likely more; the whole directory needs a pass.
- **Not a photograph at all**: `gram-anubhav-hero.jpg` is a screenshot of a
  website mockup, complete with a nav bar and a mustard DONATE button baked
  into the pixels.
- **Upscaled low-resolution crops with white or yellow border artefacts**:
  `gram-anubhav-village-walk.jpg`, `gram-anubhav-community-circle.jpg`,
  `cityscapes-landfill-walk.jpg`, `cityscapes-heritage-walk.jpg` (660px wide).
- **Possibly not Delhi**: `delhi-smog-skyline.jpg` shows a skyline I cannot
  match to Delhi. I did not use it. An environmental organisation whose whole
  claim is that it publishes evidence cannot afford a mislabelled photograph on
  its air-quality page.

Of 87 files, roughly 25 are genuinely strong. That is enough for a launch and
it is not enough for an archive.

---

## 3. What I am proposing

### 3.1 Type: two families, three voices

| Role | Family | Setting |
|---|---|---|
| D0 masthead | Archivo | `clamp(3.1rem, 14.4vw, 13.5rem)`, `wdth 62 / wght 900`, caps, `-0.045em`, leading 0.80 |
| D1 headline | Archivo | `clamp(2.1rem, 7vw, 5.4rem)`, `wdth 66 / wght 850`, caps, `-0.035em`, leading 0.88 |
| Readout numeral | Archivo | `clamp(4rem, 13vw, 11rem)`, `wdth 62 / wght 800`, tabular, `-0.030em` |
| H2 section | Archivo | `clamp(1.45rem, 3.2vw, 2.4rem)`, `wdth 72 / wght 800`, caps |
| D2 statement | Newsreader | `clamp(1.45rem, 3.6vw, 2.9rem)`, `wght 300`, sentence case, `-0.018em`, leading 1.14 |
| H3 item title | Newsreader | `clamp(1.3rem, 2.3vw, 1.8rem)`, `wght 500`, sentence case |
| Body | Newsreader | 18px / 1.62 / 64ch measure, `wght 400`, optical sizing on |
| Lead | Newsreader | `clamp(1.05rem, 2vw, 1.32rem)` / 1.46 / 44ch, `wght 300` |
| Micro-label | Archivo | 11px caps, `wdth 87 / wght 650`, `+0.14em` |
| Caption | Newsreader | 13.5px / 1.42, `--ink-3` only |

**Display to body is 12.9:1 at a 1280px viewport.** Nothing is set between 30px
and 11px. That empty octave is deliberate and it is most of what makes a page
look composed rather than interpolated.

**Archivo** (Omnibus-Type, OFL, free). One variable file carries a `wdth`
62-125 axis and a `wght` 100-900 axis, which means the same file gives a
condensed-black broadsheet headline at `wdth 62 / wght 900` and a technical
micro-label at `wdth 87 / wght 650`. I am keeping Archivo not because the
previous ledger chose it but because no other free family gives two genuinely
different voices from one download, and that matters on a 4G budget.

**Newsreader** (Production Type, OFL, free) replaces both Fraunces and
Instrument Sans. It was drawn for reading news on screen, it has real optical
sizing, and it means a 26-year publication archive finally has a comfortable
place to be read. Not Fraunces, not Playfair, not Instrument Serif, not
Cormorant. It is a working face, not a mood.

**No monospace.** Timestamps and sources are set in Newsreader at 12.5px and
the instrument numbers are set in Archivo with tabular figures. Adding a mono
would be a third family for one job.

**Costs.** Both families are SIL Open Font Licence, so **zero licence cost, at
any traffic volume, including commercial use.** For comparison, since the
question of a paid face will come up: Universal Sans is roughly EUR 400-900 to
do properly and ships static cuts with no Devanagari; Universal Thirst's
Anagram plus its Devanagari companion is roughly EUR 250-500 and is the only
paid option I would consider, because it is Latin and Devanagari drawn
together; Klim's Signifier plus Söhne Schmal is roughly USD 600-1,200 and has no
Devanagari. **My recommendation is to spend nothing on type and spend the whole
budget on photography**, because the photo audit in section 2.6 is the real
constraint on this site, not the typeface.

**Hindi, decided now rather than retrofitted.** Neither Archivo nor Newsreader
carries Devanagari, and no free Latin family with a real width axis does. So
Hindi gets its own pair rather than a compromise:

- **Anek Devanagari** (Ek Type, Mumbai, OFL, variable `wdth`) for display. It
  has the same width axis Archivo is being used for, so it can be set condensed
  and heavy at masthead size and the two language versions will have the same
  posture.
- **Tiro Devanagari Hindi** (Tiro Typeworks, OFL) for reading. A book face with
  real modulation that sits at the same colour on the page as Newsreader.

Each language version loads only its own two files.

**Payload.** Archivo variable Latin subset about 44KB woff2, Newsreader
variable Latin subset about 38KB. Self-hosted and preloaded, not linked from
Google, so first paint does not wait on a third-party handshake. Grain,
halftone and rules are under 1KB of CSS. Zero icon libraries. Zero JavaScript
above the fold.

### 3.2 Colour: black and white, with one conditional red

```
--paper       #EEEEE9   newsprint ground
--ink         #0C0C0B   16.9:1 on paper
--ink-2       #4A4A46   7.3:1   secondary text
--ink-3       #666660   4.8:1   captions only
--rule        #C6C6BF   hairlines
--night       #0A0A09   the instrument ground
--snow        #F4F4F0   text on night
--alarm       #D8261E   fills and type 24px and up
--alarm-ink   #B71710   5.1:1 on paper, for small red text
--alarm-night #FF4438   5.8:1 on night, for the readouts
```

Ten values, five of which are greys. No mustard, no teal, no coral, no ochre,
no indigo, no lifecycle palette. The brand hues survive in the logo file and
nowhere else.

The red is not applied by a designer. It is applied by a comparison: reading
against published legal standard. The moodboard shows the same component in
both states side by side, and the difference between them is a threshold, not a
taste decision.

**If you want to go further, you can drop the red too.** A pure zero-colour
site would encode severity in weight and scale alone. I did not do that because
the severity distinction here is legal, not aesthetic, and because losing the
red loses the site's one genuinely memorable behaviour. But it is a coherent
position and I would build it if asked.

### 3.3 The one inversion

Every page is newsprint. The ground turns black exactly once per page, and only
where the site is reporting a measurement. On the homepage that is
Environmental Intelligence. On the Journey page it is the station-by-station
dissolved-oxygen read.

This is the only theme flip on the site, and it is a device, not a rhythm. The
current section-rhythm rule (paper, warm paper, ground, panel, no adjacent
repeats) is doing the opposite: it alternates so regularly that the inversions
stop meaning anything. On my homepage the pause, the two places and the closing
section run as one continuous black passage so that the eye reads it as a
single event rather than three.

### 3.4 Photography

`filter: grayscale(1) contrast(1.14)` on every photograph, without exception
and without per-image tuning. `contrast(1.55)` on the small number of images
that sit behind type. A coarse 4px halftone dot, at `mix-blend-mode: multiply`,
on **exactly one** photograph per page, which is the archive voice.

The argument is not that monochrome is prettier. It is that a twenty-six-year
archive containing press photography, phone snaps, screenshots and scans has no
other way of reading as one body of work, and desaturation is the only
treatment that requires no decision at ingest.

Rules that follow: no pill, tag or caption plate overlaid on any image;
captions live outside the frame. One photograph per page escapes its box
completely.

### 3.5 Motion

Deliberately almost none. One behaviour: blocks rise 14px and fade in once as
they arrive, `700ms`, `cubic-bezier(.16,1,.3,1)`, via `IntersectionObserver`,
never a scroll listener. It communicates arrival order and nothing else.

No parallax, no scroll hijack, no pinned sections, no marquee, no counters
counting up, no custom cursor. On a mid-range Android on an Indian mobile
network, motion is the first thing that makes a site feel broken, and the
second thing is a fixed blended overlay, which is why the grain is a single
140px tile on one fixed layer and nothing else on the page composites.

The hidden state is applied only after JavaScript is confirmed running
(`html.js`), so a failed script leaves the page fully readable rather than
blank. `prefers-reduced-motion: reduce` disables the whole thing.

### 3.6 Navigation

Desktop: one line, 60px tall, six links plus one action. Mobile: no hamburger.
A horizontally scrolling **section index strip** sits directly under the
masthead, which is what the front page of a newspaper does, needs no
JavaScript, and shows six destinations instead of hiding them behind a
disclosure.

---

## 4. What it would take to build

| Item | Effort |
|---|---|
| Token swap in `app/globals.css` (ten values replacing about forty) | half a day |
| Self-host Archivo and Newsreader, preload, drop the Google link | half a day |
| Type scale as CSS custom properties plus nine utility classes | 1 day |
| Rebuild the homepage against the new scale | 2 days |
| Journey template, plus the three other Journeys given their own architectures | 4 days |
| Environmental Intelligence block, wired to the real feeds with source and timestamp per reading | 3 days, plus whatever the feed integration itself costs |
| Threshold table (reading, standard, source, severity) as data rather than markup | 1 day |
| Project and campaign index and detail | 2 days |
| Archive index behaving like an index rather than a card grid | 2 days |
| Photo library triage: fix rotations, remove the four unusable files, re-crop, commission replacements | 1 day of work plus a real photography budget |
| Hindi type pair wired in and a language switch that survives routing | 2 days |

Roughly **three weeks of front-end** on top of the existing Next.js app, plus
the feed work and the photography. Nothing here needs a framework, a component
library, an icon set or an animation library. There are zero runtime
dependencies in the three mockups.

The riskiest item on that list is not on the front end. It is the
Environmental Intelligence feed. The entire direction rests on those numbers
being live, sourced and timestamped. **If the readings are going to be updated
by hand once a month, do not build this direction** — build something quieter,
because a stale number set at 180px is worse than no number at all.

---

## 5. What I would refuse to do

- **Put a second accent colour on this site.** Not a hopeful green, not a
  mustard, not a water blue for the Yamuna sections. The moment red is not the
  only colour, red stops meaning "this reading is illegal."

- **Apply the red anywhere a threshold has not been crossed.** No red buttons,
  no red underlines, no red logo, no red on the donate call to action. If the
  Give button is red on a day when the air is clean, the system is a lie.

- **Soften the numbers.** No rounding 412 to "over 400," no "moderate to poor"
  in place of a value, no gauge dials, no traffic-light chips, no smiley faces.
  The number, the unit, the monitor, the hour. If the number is frightening,
  that is the finding.

- **Use a stock photograph, an illustration, or an AI-generated image anywhere
  on this site.** Every image is a photograph of something that happened, taken
  by someone Swechha can name. An environmental organisation that publishes
  evidence cannot decorate itself with fiction. This also means I would not
  ship `gram-anubhav-hero.jpg`, and I would not ship `delhi-smog-skyline.jpg`
  under a Delhi caption until someone confirms where it was taken.

- **Restore selective colour as a per-image toggle "just for the hero."** It is
  either the system or it is not. A hand-tuned exception on the most-viewed
  image is how a design system starts dying.

- **Add a scroll cue, a section-number eyebrow, a locale-and-weather strip, or
  a "Quietly trusted by" line.** These are the tells of a site trying to look
  designed. This one has a river to report on.

- **Build the Environmental Intelligence block as decoration.** If the feed is
  not live, the block does not ship. I would rather launch with a page that
  says "the monitoring goes live in November" than with four numbers that were
  true in August.

---

## 6. What I most want argued with

1. **Dropping Fraunces and the mustard entirely.** This unpicks the 18 August
   decision ledger. It is a real loss of accumulated work and I think it is
   worth it.
2. **Making red conditional rather than owned.** It means the brand cannot use
   its own accent in a deck, on a poster, or on a tote bag, because on the site
   the accent means something specific. That is a genuine constraint on the
   rest of the organisation's design.
3. **Killing selective colour.** It is the most distinctive thing the current
   site has and I am proposing to replace it with the oldest treatment there
   is.
4. **Near-zero motion.** Some people will read the result as flat or as
   unfinished. I would hold the line, but it should be a decision taken with
   eyes open rather than a default.

---

*Mockups verified in browser at 375px and 1280px. No horizontal overflow at
either width. Readings shown in the mockups are sample values standing in for
the live feed and are labelled as such on the page.*
