# AD-26 — Stories, Publications and Films: the source ledger

**Status: RESEARCH. No page is built and no route is claimed.** This records what
was asked for, what source material exists, what does not, and the four
questions that have to be answered before anything is generated. Written the way
AD-16 and AD-22 were: sources first, page later.

## 1. The finding that started it

The owner asked where the Stories and Publications links are on the site. The
answer is narrower than expected, and it is the reason both were dead:

**One place. The footer's "Read" column, repeated identically on all 27 finished
pages.** They are not in the nav (six words, AD-19: Now, Work, Journeys, Impact,
Farm, Record), not on the frozen homepage — whose thirteen bands are `top`,
`ticker`, `say`, `work`, `journeys`, `projects`, `campaigns`, `about`, `impact`,
`farm`, `gtm`, `record`, `give`, none of them Stories — and not cross-linked from
any WORK or situation page. The "04 Stories" band from the 18 August prototype
never entered the frozen `home.html`.

Separately, the pre-design React footer on the five un-ported pages (`/stories`,
`/explore`, `/search`, `/stories/<slug>`, `/work/campaigns/<slug>`) carries
**"Stories & media" → `/stories`**, which resolves and shows three demo markdown
stories.

**So there is no Stories page and no Publications page in the finished design at
all**, and `content/film/` and `content/knowledge/` are empty directories. What
the owner described is a new vertical, not a repointing. The interim fix — both
footer links to `/now`, commit `812235a` — is a stopgap and should be replaced by
real destinations, not extended.

## 2. Owner rulings, 22 August

- **R-1. Publications carries the KHD book.** `khd_final_March 2015.pdf`, with
  print cover and jacket PDFs beside it.
- **R-2. The "This Girl Can book" is WITHDRAWN.** It was named first and then
  struck. No book file was found for it either — see §4 — so nothing is lost, but
  record the withdrawal so it is not re-derived from the earlier instruction.
- **R-3. Films are six**: Jijivisha, Wasted, Disposable, Yatra, NatureScapes,
  Podcasts. Embedded YouTube players on the page.
- **R-4. The marine-plastic campaign carries the GIZ infographic posters.**
- **R-5. Posters go in Stories** — not in Publications.

## 3. Source material that exists

All paths are on the owner's Mac, outside this repo. Nothing has been copied in.

**Publications** — `~/Desktop/website photos/Publications & Posters/`
- `khd_final_March 2015.pdf`, `cover print pdf.pdf`, `jacket pdf print.pdf` (R-1)
- `GIZ 2010 Sustainable Shopping Basket - a lifestyle and shopping guide.pdf`
  — not requested, but it is a publication and it matches an existing campaign row
- `All posters final.pdf`

**Posters for Stories (R-5)** — same folder, the Sandip Paul series, 11 JPEGs:
OH!FISH, USEDless polybag, canuseethefuture, climate change, electrical vampires,
eat fresh store less, ped katron se sawdhan, plant more cut less, tapurwater,
thinkb4usink, tajmahal.

**GIZ marine-plastic infographics (R-4)** —
`~/Desktop/SWECHHA MASTER/Swechha Projects/GIZ Infographics/ALL POSTERS FINAL - JPEG/`:
Microplastics, Plastic in The Ocean, Wasted, What is SUP, alternatives,
cause and effect, did you know. Plus `Marine-Pollution.jpg` one level up.

**YouTube** — the channel index is committed at `data/media/youtube-index.json`:
148 distinct videos across all 18 public playlists plus the channel page. Two
playlists matter: **"Swechha short films" (19)** and **"Podcasts" (17)**.

### The material maps onto campaign rows that already exist

Four of the eight campaigns in `data/work/campaigns/` are name-only, with no
page, and the source material above is exactly what would give them one:

| campaign row | material found |
|---|---|
| `no-plastic` | the 7 GIZ marine-plastic infographics (R-4) |
| `sustainable-shopping` | `GIZ 2010 Sustainable Shopping Basket.pdf` |
| `this-girl-can` | the This Girl poster series + 13 photos, Jan 2018 |
| `delhi-i-cant-see-you` | `Delhi cant see you hires.jpg` |

This is worth noticing before building a Publications page: some of this material
may belong on campaign pages rather than in a publications list, and the same
file cannot be the primary subject of both.

## 4. What was asked for and DOES NOT EXIST

Recorded so nobody spends a second session looking.

- **"Disposable" is not on the YouTube channel.** Zero hits across all 148
  indexed videos. Unlisted, on another platform, or offline — unresolved.
- **"Yatra" is not a film on the channel.** The only matches are two *shorts*
  from School Journeys about a Yamuna Yatra with Vasant Valley students
  (`m2R252e5wbM`, `S8dHYjj0p7c`). If a Yatra film exists it is elsewhere.
- **No "This Girl Can" book file.** What exists is a poster series
  (`thisgirlruns`, `thisgirltalks`, `thisgirlthinks`, `thisgirlworks`,
  `thisgirllaughs`, `THISGIRLFIGHTS`) and 13 WhatsApp photos. Moot under R-2.

## 5. The four questions blocking a build

1. **Which Jijivisha?** Three uploads: `ZaANbZ7rhHE` "Jijivisha - Story of River
   Yamuna", `F_bGH9oFGjA` "Jijivisha: A River Struggles...", `MbqeNl6ipLY`
   "Jjivisha- A River Struggles" (typo in YouTube's own title). One film, three
   records — the page must name one.
2. **Wasted is two parts** (`zagCunxKcoY` Pt-1, `r1CnGGkhN2Q` Pt-2), and
   `sxvRkF4YskI` "Swechha Film | Waste it" is a *different* film with a similar
   name. Three players or two?
3. **Is "NatureScapes" a film or a series?** Five diary entries exist, all under
   School Journeys, none presented as a film. If it is a series it belongs beside
   the journey page, not in a film list.
4. **Where does this live in the IA, and does the nav grow?** AD-19 settled six
   nav words. Two new top-level routes would make it eight, which reopens that
   ruling — the owner's call, not a build decision.

**A fifth, structural**: the "Swechha short films" playlist of 19 already *is* a
films page in everything but form. Using it as the spine — and striking from it —
is likely better than assembling six titles by hand, because it survives the
channel changing and a hand-list does not.

## 6. Deployment findings, recorded here because they surfaced in the same pass

Not part of this vertical, but they bear on when it can ship.

- **The sitemap is inverted.** `app/sitemap.ts` advertises 14 URLs, **7 of them
  the pre-design scaffold** (`/stories`, `/explore`, `/search`, three demo
  stories, one demo campaign), and **omits 20 of the 27 finished pages** — every
  situation page, every WORK item page, and `/farm`. `robots.txt` is `Allow: /`.
  Deployed as-is, search engines index the scaffold and miss the finished site.
  This is the item with the longest tail: indexed URLs outlive the fix.
- **The React scaffold footer has 15 dead links** — `/archive`, `/contact`,
  `/privacy`, `/terms`, `/refund`, `/about/{team,board,reports,compliances}`,
  `/explore/{learn,media}` and four `/act/*`. They ship only on the five
  un-ported pages, and nothing in the finished set links there — so they are
  reachable by direct URL, **or from Google, which the sitemap currently
  invites**. Fixing the sitemap demotes them; the port removes them. `/privacy`
  and `/terms` are a separate matter: the footer promises documents that do not
  exist.
- **The deploy is already blocked.** `designRoutes()` throws when a rewrite
  target is missing, and AD-17 §6.4 deletes `public/design/` before deploy — so
  `npm run build` fails rather than shipping a broken site. The port is the gate,
  and "fix it after deployment" is not yet a live option.
