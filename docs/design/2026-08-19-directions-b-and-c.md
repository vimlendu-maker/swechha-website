# Swechha: Directions B and C

19 August 2026. Two alternatives to the lead direction, written to be argued with.
Direction A ("The Record") is being produced in parallel and is not discussed here
except where B or C had to move to stay genuinely different from it.

Files:

| | |
|---|---|
| Direction B, homepage | `public/design/explore/direction-b-home.html` |
| Direction B, Environmental Intelligence (`/now`) | `public/design/explore/direction-b-intelligence.html` |
| Direction C, homepage | `public/design/explore/direction-c-home.html` |

Both are static, self-contained HTML with an inline `<style>`, no build step, no
framework, local images only. Both were built and checked in a browser at 1280 and
375, with `scrollWidth === clientWidth` at both widths.

Neither direction uses the existing token file, the mustard accent, the Fraunces
stack, or the section-rhythm rules. That was the brief. Neither uses colour at all.

---

## Direction B: "Instrument"

### The idea in one line

The site is a public measuring instrument, and its manners are the design: black ink
on white paper, no colour anywhere, and every figure carries its source, its date and
its unit.

### Who it is for

The reader Swechha already has and does not serve well: the journalist checking a
number before quoting it, the school head deciding whether to send a class, the
funder's programme officer doing diligence, the student writing a dissertation on the
Yamuna. These people are not looking for a feeling. They are looking for something
they can cite. Nobody in the Indian environmental sector currently publishes readings
this legibly, and the organisation with 26 years of field data is the one that should.

Secondary audience: the individual donor who is persuaded by competence rather than by
photographs of children. That donor exists and is under-courted.

### Type specification

| Role | Family | Foundry | Licence | Cost |
|---|---|---|---|---|
| Display and text | Anek Latin (variable) | Ek Type, Mumbai | SIL OFL 1.1 | Free |
| Devanagari (later) | Anek Devanagari (variable) | Ek Type, Mumbai | SIL OFL 1.1 | Free |
| Data, metadata, sources | IBM Plex Mono | IBM | SIL OFL 1.1 | Free |
| Devanagari mono companion (later) | IBM Plex Sans Devanagari | IBM | SIL OFL 1.1 | Free |

Anek is the whole argument. It is a ten-script superfamily built on one skeleton, with
matched Latin and Devanagari cuts sharing the same weight and **width** axes. In a
design with no colour, width becomes a primary variable, and Anek gives 75 to 125 of
it in a single file. When Devanagari arrives it is a `font-family` swap on the same
axis values, not a second design.

Scale, as built:

| Element | Size | Width | Weight | Tracking | Leading |
|---|---|---|---|---|---|
| Front-page headline | `clamp(2.55rem, 7.4vw, 6.6rem)` | 96 | 700 | -0.035em | 0.94 |
| Section headline | `clamp(1.9rem, 4.4vw, 3.4rem)` | 100 | 600 | -0.02em | 1.02 |
| Impact numerals | `clamp(3.6rem, 15vw, 12rem)` | 76 | 800 | -0.045em | 0.82 |
| Lead reading (`/now`) | `clamp(6.5rem, 20vw, 17rem)` | 76 | 800 | -0.05em | 0.78 |
| Reading values | `clamp(1.9rem, 3.4vw, 2.9rem)` | 82 | 800 | -0.02em | 0.90 |
| Standfirst | `clamp(1.05rem, 1.7vw, 1.3rem)` | 100 | 400 | 0 | 1.5 |
| Body | 18px (17px under 600px) | 100 | 400 | 0 | 1.62 |
| Metadata, sources, nav | IBM Plex Mono 11px, 10.5px in tables | | 400/500/600 | 0.09em | 1.45 |

Numerals are set with `font-feature-settings: 'tnum'` everywhere they sit in a column.

**The known type risk.** The negative tracking on the display sizes is correct for
Latin and wrong for Devanagari, where it will crowd matras and reph. The production
rule has to be a per-script tracking override (`:lang(hi)` resets `letter-spacing` to
0 and raises line-height to about 1.35 for display). That is a known, bounded fix, not
a redesign, which is exactly why Anek was chosen.

### Colour

There is none. Paper `#FFFFFF`, ink `#000000`, muted `#5E5E5E` (7.0:1), rules
`#D4D4D4`. Every neutral is truly achromatic: R equals G equals B at every step. There
is no accent, no brand hue, no signal red, no signal green.

This is the load-bearing decision, so here is the argument. An air-quality page wants
red. Red is also the single least reliable channel it could use. Roughly one in twelve
Indian men has a red-green deficiency; a phone in Delhi sunlight in May loses
saturation before it loses luminance; and a large share of this organisation's actual
distribution is photocopied handouts at school assemblies, where colour does not
survive at all. So severity is carried by three achromatic devices instead:

1. **A six-cell counter.** Six outlined squares, filled solid from the left. Two
   filled means band 2 of 6. It reads at a glance, at any size, in any medium.
2. **A six-step grey ramp** on the year calendar, from white through to solid black,
   mapped to the six official CPCB bands. Darker is worse, on every chart on the page,
   with no exceptions.
3. **Weight and width.** The band name under a reading is set heavier when the reading
   is out of limit; out-of-limit table cells carry a triangle pointing up for too much
   and down for too little.

Every chart also states its numbers in text and carries an `aria-label` that gives the
reading, not the picture.

### Photography

Sparse and enormous. Full-bleed, `grayscale(1) contrast(1.06)`, no other treatment, no
duotone, no overlay pattern. The photograph is allowed to be a photograph. There are
seven images on the homepage and one on `/now`, and the `/now` page is deliberately
almost photograph-free, because the numbers are the picture there.

The lead image is `clean-air-protest.jpg`, which arrived already black and white and
carries hand-lettered type inside the frame. It sets the register for everything else.

### Motion

Dial reading: 2 out of 10. Ink does not animate.

- One reveal: opacity and a 10px rise on section headlines and impact rows, via
  `IntersectionObserver`, `once` semantics, no scroll listener anywhere.
- Hover and focus states only otherwise: index rows shift 12px right and take a light
  ground, archive cells invert, buttons invert.
- The whole reveal is skipped under `prefers-reduced-motion: reduce`.

This is a deliberate low setting, not an unbuilt intention. A page that claims restraint
and then animates is worse than either.

### What it costs to build

The homepage is cheap: static markup, one grid, no images below the fold that are not
lazy. Call it a week of front-end work.

`/now` is the whole budget, and it is not a design cost, it is a data cost:

- **CPCB** publishes hourly AQI. Reachable, but the bulletin formats change without
  notice; expect a fetcher plus an alerting rule for when it breaks.
- **DPCC** publishes Yamuna water quality as monthly PDF bulletins. There is no feed.
  This is either a PDF scraper or a person typing six rows a month, and it is the
  single most under-estimated line in this project. Budget for the person.
- **IMD** daily temperature and rainfall: workable.
- **NASA FIRMS** active fire detections: a clean API, the easiest of the five.
- **Swechha's own field record**: waste weighed at cleanups. This needs an internal
  form, or it will silently stop being updated by month four.

Plus a cache layer, a staleness policy, and the rule the page already states in
writing: if a reading is stale, say so rather than showing the last good value as
though it were current.

Honest range: four to six weeks of one full-stack developer for the data spine, two to
three weeks of front-end, and a recurring 2 to 4 hours a month of somebody's time to
keep DPCC current. If that recurring commitment is not real, cut the Yamuna panel to a
quarterly figure rather than shipping a dead "live" number.

Current page weights, as built: homepage 32 KB of HTML plus 3.1 MB of images;
`/now` 44 KB of HTML plus 10 KB of image. The `/now` figure is the point. Production
needs AVIF derivatives with `srcset` (target 40 to 120 KB per image) and self-hosted
subset woff2 rather than the Google Fonts `<link>` used in these mockups.

### Where it fails

- **It is cold.** Somebody who has just watched a film about the Yamuna and wants to
  give ₹1,000 out of feeling will not be moved by this page. The organisation would be
  trading emotional conversion for institutional credibility, and that is a real trade,
  not a free win.
- **It is unforgiving of weak photography and of boring days.** On 19 August the air is
  fine, and the page has to be honest about that. A design whose drama depends on a
  bad number is a design that will be tempted to cherry-pick. B handles this by making
  the *year* the headline (237 days above 200) rather than the hour, but the temptation
  stays.
- **The no-red decision will be fought,** by the board, by a comms consultant, and
  possibly by a funder who has a brand deck. If it loses, the design does not
  gracefully degrade: adding one red band to a six-step grey ramp makes the ramp worse,
  not better. It is a yes or a no.
- **Devanagari display tracking** needs the per-script override described above before
  the Hindi site ships. Skipping it produces broken conjuncts, which is worse than
  having no Hindi site.
- **The archive grid promises something.** Showing "not scanned" in public is
  admirable and it is also a standing obligation. If nothing gets scanned for two
  years, the page says so to every visitor.

---

## Direction C: "Ink"

### The idea in one line

The site is a screen-printed wall: black ground, white ink, every photograph broken
into a coarse dot screen, type at poster scale, and almost no prose above the fold.

### Who it is for

The seventeen-year-old who will actually come on a journey, and the person who shares
one screen of it to a story. This is a recruiting and mobilising site, not a reference
site. It is built for the moment of contact, not the moment of diligence.

It is also, frankly, for the organisation's own morale. Swechha has been running
protest campaigns for 26 years; nothing on its current site looks like a protest.

### Type specification

| Role | Family | Foundry | Licence | Cost |
|---|---|---|---|---|
| Poster display | Teko (variable, 300 to 700) | Indian Type Foundry | SIL OFL 1.1 | Free |
| Running text, labels | Mukta (200 to 800) | Ek Type for ITF | SIL OFL 1.1 | Free |

Both ship Devanagari today, in the same file, from Indian foundries. Teko is derived
from Devanagari letterform logic in the first place, which is why its condensed Latin
caps have that particular squared-off street-print quality. That is the reason it is
here rather than Bebas Neue or Anton, either of which would have been the lazier
choice and neither of which has a script partner.

Scale, as built:

| Element | Size | Weight | Leading |
|---|---|---|---|
| Hero headline | `clamp(3.1rem, 12.4vw, 11rem)` | 600 caps | 0.82 |
| Plate headline | `clamp(2.4rem, 9vw, 7rem)` | 600 caps | 0.82 |
| Lead reading | `clamp(9.5rem, 26vw, 22rem)` | 600 | 0.72 |
| Inverted impact figures | `clamp(5rem, 22vw, 18rem)` | 600 | 0.74 |
| Index rows | `clamp(1.85rem, 5.4vw, 4rem)` | 600 caps | 0.94 |
| Menu sheet items | `clamp(2.4rem, 9vw, 5rem)` | 600 caps | 0.92 |
| Standfirst | `clamp(1.05rem, 1.5vw, 1.24rem)` Mukta | 400 | 1.55 |
| Body | 18px Mukta (17px under 600px) | 400 | 1.62 |
| Labels, tags | Mukta 11.5px, 0.16em tracking, caps | 600 | 1.5 |

Hard rule enforced throughout: **Teko never appears below 28px.** Anything smaller is
Mukta. Teko is a poster face and becomes illegible fast at text sizes, particularly for
readers with low vision.

### Colour

There is none here either. Ground `#000000`, ink `#FFFFFF`, muted `#A6A6A6` (9.0:1),
rules `#3A3A3A`. Body text is 21:1.

The page inverts to a white sheet exactly once, for the impact figures, and never
again. That inversion is the whole dramatic structure of the page: everything before it
is a wall, and then somebody hands you a printed sheet with the receipts on it. The
fixed navigation bar flips to black ink while that plate is behind it, so the chrome
never disappears into the one inverted screen.

### Photographic treatment

Every photograph is `grayscale(1) contrast(1.68) brightness(1.16)` with a 6px dot
screen painted over it (4px under 700px), plus a gradient scrim where type sits on top.

The dot screen is a `radial-gradient` of black dots on transparent, composited normally.
The first build used `mix-blend-mode: multiply`, which is visually identical for a pure
black pattern and materially more expensive; it also failed to composite reliably once
several halftoned images were on screen at once. The blend mode was removed. This is
the sort of thing that looks like a detail and is actually the difference between the
direction shipping and not shipping on a mid-range Android.

There is a real benefit hiding in the treatment: a coarse dot screen destroys
compression artefacts, so C can ship the most aggressively compressed derivatives of
the three directions. A 30 KB AVIF looks the same as a 300 KB one once it is screened.

The archive is a contact sheet: small square crops, no dot screen at that size (it would
not read), and diagonally hatched tiles standing in for the years that are not scanned.
The holes stay in the sheet.

### Motion

Dial reading: 6 out of 10. Every animation has one job:

- **Reveal** on plate headlines and impact figures. Job: sequence, so each plate lands
  as its own moment rather than all at once.
- **Index rows invert on hover and focus**, filling solid white with black type and
  taking 14px of padding. Job: feedback, and it is the only affordance a list of ten
  names in poster type actually needs.
- **Horizontal snap band** for the four journeys. Job: it is a rack of posters and it
  should behave like one, by flick on a phone and by drag or trackpad on a desktop.
- **Navigation bar inversion** over the white plate, via `IntersectionObserver`. Job:
  state, and legibility.

No scroll listeners, no scroll hijack, no parallax, no marquee. Under
`prefers-reduced-motion: reduce` every transition and animation is disabled and the
snap band becomes a plain scroller.

### What it costs to build

Cheaper than B on the data side, more expensive on the art-direction side.

- The homepage shows one headline reading and four secondary ones, and defers
  everything else to `/now`. If C were chosen, `/now` would still have to be built, and
  it would cost what B's `/now` costs. C does not avoid that bill, it postpones it.
- The real cost is **per-photograph art direction**. A halftone is merciless: any image
  with a busy mid-tone turns to mud, and any image whose subject is dark on dark
  disappears. Of the 87 photographs in the library, my estimate from working through
  them is that fewer than half survive the treatment without a bespoke crop and a
  per-image contrast override. Budget a day of somebody sitting with the library, and
  a CSS hook for per-image tone (`--ht-contrast`, `--ht-bright`) rather than one global
  filter.
- Front end: two weeks. There is more of it than B, but none of it is hard.

Current page weight, as built: 30 KB of HTML plus 4.3 MB of images. That is the honest
number and it is too high; the contact sheet alone was 6 MB before I swapped it to the
lightest available files. Production must ship derivatives.

### Where it fails

- **It is hostile to Devanagari, and that is not fixable.** The poster device is
  all-caps condensed Latin. Hindi has no case. A Devanagari version of C either sets
  the same headlines in ordinary Devanagari at ordinary width, which throws away the
  entire visual signature, or it does something else, which means the Hindi site is a
  different design. Given that Devanagari is on the roadmap, this is the strongest
  single argument against C and I am not going to argue around it.
- **It is hostile to the photographic archive.** A 26-year library of photographs, many
  of them good, all rendered as dots. The people who took those photographs will not
  like it, and their objection is legitimate.
- **It is hostile to the person looking something up.** A teacher who wants the Farm
  School application form has to scroll through posters. C would need a genuinely good
  search and a conventional inner-page template underneath the posters, and the moment
  you build that you have two design languages in one site.
- **It reads as a campaign, not an institution.** That is the point, and it is also a
  problem when a CSR committee opens the site to check whether Swechha is a serious
  organisation before signing a partnership.
- **Long condensed all-caps is hard for dyslexic readers.** The build keeps every
  actual sentence in Mukta at 17 to 18px with 1.62 leading, so the reading experience is
  sound, but the headlines are not accessible in the way B's are.

---

## Recommendation

**Direction B.**

Three reasons, in order of weight.

**1. Its hardest page is its best page.** The Environmental Intelligence page is the
thing the rest of this site has to be built around, and it is the page that kills most
NGO redesigns: it is dense, it is unglamorous, and nobody enjoys designing it. B's whole
language was derived from that page and then run backwards onto the homepage, so the
homepage inherits credibility instead of the data page inheriting decoration. C's
homepage is better than B's homepage. B's `/now` is better than anything C could put
there, and `/now` is the site's spine.

**2. The no-colour severity system is a real advantage, not a pose.** A filled counter
and a six-step grey ramp survive colour blindness, direct sunlight, a photocopier and a
black-and-white school handout. Swechha distributes through all four of those channels.
This is the rare case where the most restrictive aesthetic choice is also the most
functional one, and it is defensible in a room full of people who do not care about
design.

**3. Devanagari lands.** Anek gives matched Latin and Devanagari on one skeleton with
the same width axis. The only work needed is a per-script tracking override. C's
signature does not translate at all.

**But do not throw C away.** C is the right language for a specific part of this site,
and I would build it as a sub-system inside B rather than as a losing pitch:

- The **campaign pages** (Delhi I Can't See You, Yamuna Pollution, This Girl Can) should
  be C: black, poster-scale, halftoned, one message per screen. Campaigns are supposed
  to look like campaigns.
- The **Journeys chapter** landing and the individual journey pages should borrow C's
  full-bleed halftone plates and its horizontal rack, on B's type.
- Everything else stays B.

That gives the site a quiet default and a loud register it can switch into, with the
switch itself carrying meaning. It also means Teko and Mukta come in as a second pair
for campaign surfaces only, which is a defensible amount of type for a site this size:
four families, all free, all OFL, two of them from Indian foundries.

If the client rejects the no-colour position, my fallback is not to add red to B. It is
to add exactly one achromatic-plus-one signal, applied only to the severity ramp's top
two bands and nowhere else on the site, with the grey ramp kept underneath it as the
real carrier. Colour as a redundant second channel, never as the only one.

---

## Appendix: the checks that were run

Both directions were opened in a browser at 1280x900 and 375x812 and looked at, not
just built.

- `document.documentElement.scrollWidth === clientWidth` at both widths on all three
  pages. No horizontal overflow. Wide content (the year calendar, the data tables, the
  journeys rack) scrolls inside its own container.
- Every image loads; no broken paths; all images are local.
- Body text is 17 to 18px at 1.6 leading in both directions. Contrast: B body 21:1,
  muted 7.0:1; C body 21:1, muted 9.0:1. Nothing under 4.5:1 is used for text below
  24px.
- Mobile navigation exists in both (a `<details>` panel in B, a full black sheet in C)
  and both work without JavaScript.
- `prefers-reduced-motion: reduce` disables all motion in both.
- Zero em-dashes and zero en-dashes in any of the three files.
- All readings shown are sample values, and each page says so on the page itself, in the
  dateline and in the footer.
