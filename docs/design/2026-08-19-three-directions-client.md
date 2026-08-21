# How to read this

Swechha's new website has a working design, approved on 18 August and partly built. This document puts three alternative directions next to it so you can choose deliberately rather than by drift.

Each direction is not a colour scheme. Each one is a different answer to a single question: **what kind of thing is this website?** A record, an instrument, or a poster. Everything else, the type, the photography, the use of colour, follows from that answer, which is why the three cannot be blended into one.

All three were designed as black and white sites. That was the brief, and there is a reason for it beyond taste: the sector all looks the same, and a monochrome site with real typography is the cheapest way to look unlike it. Where colour returns, it returns to mean something.

**What you are being asked to decide.** Three questions, in this order:

1. Is Swechha's website primarily a **record of measurements**, or a **campaign that moves people**? A and B answer "record". C answers "campaign".
2. Should colour be **a feeling** (warmth, brand, mustard) or **a fact** (this reading broke a legal limit)? The current site says feeling. A says fact. B says neither, no colour at all.
3. How much distance from the category are you willing to buy, knowing distance costs comfort?

Every page shown here is real, working HTML at real sizes, not a picture of a website. Live addresses are in the appendix.

---

# Where we are today

![The current approved homepage](img/directions/current-home-top.png){width=full}

The current design is warm, photographic and competent. India Gate under a dark sky, a serif promise, a live AQI panel, mustard for the accent. It reads as a well made non-profit site, and for most organisations that would be the end of the conversation.

**What it does better than all three proposals:** it feels like people. The mustard and the warm greys carry an approachability that black and white will not give you for free. Schools, parents and first-time donors respond to that, and it should not be dismissed.

**Where it is holding you back**, from a review of the built pages:

- **Nothing on the page is ever big.** The largest type on the homepage is roughly 67px against 34px headings and 17px body. Everything lives within two octaves, so no single thing dominates and every section has to compete by adding elements.
- **Because nothing dominates, everything becomes a row of identical cards.** Ten equal-width grids on one page, six identical mustard dashes under six headings, four rows of small line icons. This is the pattern that makes a site read as generic.
- **The readings do not look like readings.** Swechha's genuinely unusual asset, live air and river measurements with sources, is presented as one more card among cards.
- **Nothing is hand-made.** No texture, no drawn mark, no printed artefact, nothing that could only have come from this organisation.

None of this is a failure of execution. It is what happens when a design is assembled from good components rather than driven by one idea. The three directions each supply that missing idea.

---

# Option A: The Record

![Direction A, homepage](img/directions/a-home-top.png){width=full}

## The idea

Swechha has been keeping a record of Delhi's environment for twenty-six years. **The site should look like the record, not like a brochure about the people who keep it.** A newspaper that publishes a river's vital signs.

## What you are looking at

`WE KEEP THE RECORD` at roughly 130px, set on newsprint. Then the ground turns black exactly once, where the readings are: AQI 412 in red against `SEVERE / LIMIT 100`, dissolved oxygen 0.0 in red against `MIN 4.0`, heat index 41.8 and fire count 118 in white, because those have not broken a limit. Each carries the monitor it came from and the hour it was taken.

Below, a full-bleed photograph of students at the Yamuna foam line with a line set into it, then "What is running", the projects and campaigns as a plain typographic index. No cards anywhere on the page.

![Direction A, a journey page](img/directions/a-journey-top.png){width=full}

## Strengths

- **Colour becomes evidence.** Red is not decoration and not brand. It appears only when a published legal threshold is crossed. A reader learns that rule in about four seconds and then trusts the page.
- **It suits the age of the organisation.** Twenty-six years of continuous record-keeping is the strongest thing Swechha has, and this is the register that states it without saying "since 2000" in a badge.
- **It survives weak photography.** Most weeks the available picture is a phone snap. A newspaper page can carry that. A photographic site cannot.
- **It reads well in Hindi later**, and the Devanagari pairing is chosen now rather than retrofitted.

## Where it comes from

The moodboard names its references so you can look at each one and disagree.

![The direction A moodboard](img/directions/moodboard-top.png){width=full}

- **Museum Insel Hombroich**, a cultural institution reading as a printed publication rather than a product. This is where the newsprint idea starts.
- **Oto Nove Swiss**, thin monospaced micro-type against enormous bold sans with nothing in between. That empty middle octave is the trick the current site most needs.
- **Sam Goddard**, thin exact rules under headings, replacing every card and box.
- **Fontshare**, grid lines separating a long list without a border on every row: how a twenty-six-year archive index should behave.
- **Tangan**, the ground flipping between black and white once per page, used here to mark the instrument and nothing else.

## Type and cost

Archivo (variable, width axis 62 to 125) and Newsreader. Two families, both open licence, **zero licence cost**. Hindi later: Anek Devanagari and Tiro Devanagari Hindi, both free. Total font payload under 100KB, self-hosted.

## What it costs you

It asks you to drop the mustard accent, the third typeface and the selective-colour photo treatment, and to accept that the brand's accent colour on a tote or a poster no longer matches the site, because on the site red means something specific.

---

# Option B: Instrument

![Direction B, homepage](img/directions/b-home-top.png){width=full}

## The idea

The site is **a public measuring instrument**, and its manners are the design. Black ink on white paper, no colour anywhere, and every figure carries its source, its date and its unit.

## What you are looking at

The `/now` page is where this direction earns its keep, and it is the hardest page in the site.

![Direction B, the Environmental Intelligence page](img/directions/b-intel-top.png){width=full}

The headline reads "The air over Delhi this morning is the best it will be all year", above a reading of 84, which is still above what the WHO considers safe. Severity is encoded three ways without using hue: a six-cell counter filled solid, a six-step grey ramp across a 366-day calendar where the winter block of black and the monsoon white band are unmistakable, and shifts of weight and width. Below it, a station table with over and under limit markers, and a full sources table with fetch times.

## Strengths

- **It serves a reader you already have and do not serve well**: the journalist checking a number before quoting it, the school head deciding whether to send a class outside, the funder's programme officer doing diligence, the student writing on the Yamuna. These people want something they can cite.
- **Nobody in the Indian environmental sector publishes readings this legibly.** The organisation with twenty-six years of field data is the one that should.
- **Width replaces colour.** Anek's 75 to 125 width axis does the work hue normally does, which is why the page still has hierarchy with no colour at all.
- **Hindi is a font-family swap, not a second design.** Anek is one skeleton across ten scripts, Latin and Devanagari sharing the same weight and width axes. This is the strongest Hindi story of the three.

## Type and cost

Anek Latin (Ek Type, Mumbai) and IBM Plex Mono for all metadata. Both open licence, **zero cost**. Devanagari later from the same family.

## What it costs you

**No red on an air-quality page.** A funder, a comms consultant or a board member will ask for it, and it does not degrade gracefully: adding one red band to a six-step grey ramp makes the ramp worse. It is a yes or a no. This direction is also the coolest of the three in temperature. It will not charm a parent at a school fair.

---

# Option C: Ink

![Direction C, homepage](img/directions/c-home-top.png){width=full}

## The idea

The site is **a screen-printed wall.** Black ground, white ink, every photograph broken into a coarse dot screen, type at poster scale.

## What you are looking at

The hero is Swechha's own protest photograph, halftoned, with the hand-lettered `CLEAN AIR IS OUR RIGHT` sign filling the frame and `DELHI, I CAN'T SEE YOU` knocked out beneath it. Then the AQI at poster size, a rack of halftoned journey posters, ten campaign and project names as poster lines that fill solid white as you move across them, and one inversion to a white sheet where the impact figures live.

## Strengths

- **It is the only direction with a pulse.** If the goal is recruiting young people, mobilising for a march, or being screenshotted onto Instagram, this is the one that travels.
- **It comes from Indian street printing**, not from a Swiss design annual, and it is the only direction whose visual language a volunteer could reproduce with a photocopier.
- **Type is Indian and free.** Teko and Mukta, from Indian Type Foundry and Ek Type, both shipping Devanagari today.
- **It is genuinely memorable.** A stranger who sees it once will recognise it again.

## What it costs you

**A twenty-six-year photographic archive rendered entirely as dots.** The people who took those photographs will object, and their objection is legitimate.

There is also a quieter problem, and it is the real disqualifier: all-caps condensed Latin is the whole signature, and Devanagari has no upper case. The Hindi site would have to be a different design.

---

# Design against design

Two charts, then the head-to-head. The scorecard is our judgement rather than a measurement, and it includes the current design so nothing here is graded against an absent baseline. The positioning chart plots the same four against the only two axes that actually decide this: who the site speaks as, and how far it sits from the rest of the sector.

Read them together. The scorecard tells you what each option is good at; the positioning chart tells you what each one *is*, and how far the organisation would be travelling to get there.

![Scorecard comparing the four designs](img/directions/chart-scorecard.png){page=landscape}

![Positioning chart](img/directions/chart-map.png){page=landscape}

## A against B

These two are cousins. Both say "publish the measurement, cite the source, do not decorate it". The whole difference is one decision: **is red allowed when a reading breaks a legal limit?**

A says yes, and gains an alarm that a reader understands instantly. B says no, and gains absolute consistency plus a severity system that works for a colour-blind reader and in print without change. A is warmer and more quotable. B is more rigorous and reads as more trustworthy to a sceptical professional.

If you want the site to feel like a newspaper, choose A. If you want it to feel like an instrument that happens to publish, choose B.

## A against C

A is the organisation speaking in its own institutional voice; C is the organisation shouting. A works for every page in the site, including the dull ones: compliances, annual reports, a project with no photographs. C is spectacular on a campaign page and starts to strain on a governance page.

A ages slowly. C ages the way posters age, which can be a virtue if you re-print often.

## B against C

The two extremes. B is the most restrained website you could responsibly ship for this organisation; C is close to the most expressive. B is built for people who want to cite you. C is built for people who want to join you. Both are true audiences for Swechha, which is the honest complication in this decision.

## All three against today

Today's site is more approachable than any of the three and less distinctive than all of them. It is the only one of the four that a stranger would struggle to describe afterwards. Each direction trades some warmth for a specific identity: A trades least, B trades most, C trades warmth for energy rather than for rigour.

---

# The mustard question

You said you miss the mustard, and that instinct is worth taking seriously rather than designing around. On the scorecard, warmth is the single row where the current site beats all three proposals, and mustard is doing most of that work.

Here is the honest position. **Mustard and a conditional red cannot both live on the same page.** If a reader sees two accent colours, neither one means anything, and the entire argument of directions A and B collapses. So there are four ways forward, not one:

**1. Keep mustard, choose A, and give up red.** Mustard becomes the site's single accent exactly as it is today, and severity is carried by the word `SEVERE`, by weight, and by the black ground rather than by hue. You keep the warmth and the brand, and you lose the four-second alarm. This is the most conservative route and it is entirely defensible.

**2. Choose A as designed, and let mustard own everything that is not the website.** Posters, totes, Green the Map, tote bags, Instagram, the farm signage, the annual report cover. The site is the one place that stays severe, because the site is the place where readings are published. Off-site, mustard is Swechha's colour and nothing changes.

**3. Mustard as the action colour only, red as the reading colour.** One hue for "do something" (Give, Volunteer, Join a journey), one hue for "this measurement is illegal". It is the most useful compromise and the least pure: two accents means the discipline has to be enforced by somebody forever, and in practice it tends to leak.

**4. Choose B and accept a monochrome site.** Mustard survives in print and social only. The cleanest, the coldest, the hardest to argue with, and the hardest to love.

Our reading: option 2 is the one that loses the least. Mustard is not deleted, it is relocated to where nobody is trying to read a number. If that feels like too much loss, option 1 is a real choice and not a failure of nerve, because a conditional red is a strong idea but it is not the only reason A works. The scale, the newsprint and the index are.

---

# What we recommend, and what we need from you

**Recommendation: Direction A, "The Record", with the mustard question settled as option 2 above.** It is the direction that works on every page in the site rather than only the exciting ones, it carries the twenty-six-year archive better than the other two, and it is the least expensive to build of the three because it needs no new photography and no image processing.

**Direction B is the stronger choice if the primary audience is professional**: journalists, funders, government, researchers. It is not a worse design. It is a different bet about who this site is for.

**Direction C should not be discarded.** It is the right register for campaign pages and for the Journeys chapter, and it could live inside A or B as the treatment those sections get. Do not run it across the whole site.

**What we need from you, in order:**

1. **Pick a register**: record (A), instrument (B), or poster (C).
2. **Settle mustard**: which of the four options above.
3. **Rule on the photography.** Roughly 25 of the 87 photographs currently on file are strong enough for a full-bleed hero. This is the real constraint on the launch, more than any design decision here.
4. **Confirm the Hindi timeline.** It changes the type decision, and a Devanagari pairing chosen late always looks chosen late.

Once those four are answered, the chosen direction becomes a working site rather than a mockup, and the pages already built get re-skinned to match.

---

# Appendix

## Where to see the pages

All of these are live, working pages, best viewed on a laptop. They are served locally at `http://localhost:3000`.

| | |
|---|---|
| Direction A moodboard | `/design/explore/moodboard.html` |
| A, homepage | `/design/explore/direction-a-home.html` |
| A, Yamuna Yatra journey | `/design/explore/direction-a-journey.html` |
| B, homepage | `/design/explore/direction-b-home.html` |
| B, Environmental Intelligence | `/design/explore/direction-b-intelligence.html` |
| C, homepage | `/design/explore/direction-c-home.html` |
| Current design, homepage | `/design/homepage-final.html` |

Written directions, longer and more technical than this document: `docs/design/2026-08-19-independent-direction.md` for A, `docs/design/2026-08-19-directions-b-and-c.md` for B and C, and `docs/design/2026-08-19-visual-audit.md` for the audit of the current site.

## What is still missing, regardless of which direction wins

- **Two photographs are stored sideways** and will display rotated in every browser: `yamuna-barrage-crowd.jpg` and `yamuna-source-rapids.jpg`. Both are currently used on live pages. A two-command fix.
- **`gram-anubhav-hero.jpg` is not a photograph.** It is a screenshot of a website mockup, with a navigation bar and a donate button baked into the pixels. It should be removed from the library.
- **The team, board and report content does not exist yet.** Every page built so far marks those gaps rather than inventing names, and they will stay marked until the inventory arrives.
- **Roughly 165 old WordPress addresses still need redirects** to their new locations. This is a launch blocker and has not been started.
