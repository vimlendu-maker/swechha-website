# AD-27 photo manifest — Bridge the Gap and CityScapes, sourced from swechha.in

**Date:** 2026-08-22
**Scope:** photo sourcing only (no page/HTML/CSS edits). Crawled `swechha.in`
project pages for Bridge the Gap and CityScapes (plus adjacent Green Exposures
Eco Walks / Yamuna Yatra / Eco Action pages that share the same photo pool),
via `curl` against rendered HTML and the WordPress uploads directory. The
`/wp-json/wp/v2/media` REST endpoint is disabled site-wide (returns a raw
WordPress fatal-error page), so images were found by scraping
`<img>`/background-image URLs out of six project pages
(`bridge-the-gap`, `city-scapes`, `green-exposures-eco-walks`, `eco-action`,
`yamuna-yatra`, `circular-economy-marine-litter-and-epr`) and, for each hit,
stripping the WordPress `-WIDTHxHEIGHT` size suffix to fetch the original.

**Method note on attribution-by-page:** swechha.in reuses a shared "recent
media" pool across templates, so a file turning up in more than one project
page's HTML is not evidence the photo is *about* that programme — several
Yamuna Yatra (Himalayan source-to-Delhi expedition) photos surfaced on the
Bridge the Gap, CityScapes, Eco Action and Circular Economy pages alike.
Every image below was therefore classified by what is actually in the frame,
verified visually, not by which URL it was scraped from.

Total kept: **31**. Total rejected: **19** (listed below with reasons).

---

## KEPT — Bridge the Gap (16 images)

Bridge the Gap had **zero** dedicated real photographs anywhere in the
existing photo library (`content/photo-library.json`) — every image below is
new coverage for that programme.

| Local path | Source URL | Dimensions | Size | What's in the frame | Recommended for |
|---|---|---|---|---|---|
| `public/images/photos/bridge-the-gap-classroom-session.jpg` | `swechha.in/wp-content/uploads/2022/06/BTG-4.jpeg` | 1148×644 | 127 KB | A girl in a school auditorium standing to read from a worksheet while classmates sit with their own papers; three women (teachers/facilitators) at the back | BTG strategy / classroom curriculum session |
| `public/images/photos/bridge-the-gap-outdoor-briefing.jpg` | `swechha.in/wp-content/uploads/2022/06/BTG-3.jpeg` | 1148×644 | 148 KB | A facilitator in a purple scarf addressing a semicircle of girls in winter school uniforms against a boundary wall | BTG strategy / facilitator-led session |
| `public/images/photos/bridge-the-gap-sapling-cups-group.jpg` | `swechha.in/wp-content/uploads/2022/06/BTG.jpeg` | 2048×1365 | 304 KB | A group of children in maroon school uniforms, each holding up a sapling planted in a repurposed plastic cup, smiling at camera | BTG activity: action projects (hero-quality) |
| `public/images/photos/bridge-the-gap-compost-soil-circle.jpg` | `swechha.in/wp-content/uploads/2022/06/BTG-2.jpeg` | 1024×768 | 178 KB | Children seated cross-legged outdoors, hands raised holding fistfuls of soil/compost from two large bowls in the centre | BTG activity: action projects (soil/compost) |
| `public/images/photos/bridge-the-gap-no-dumping-banner.jpg` | `swechha.in/wp-content/uploads/2022/06/BTG-6.jpeg` | 960×592 | 127 KB | Three children holding a hand-painted cloth banner reading "NO DUMPING" outdoors | BTG activity: action projects (campaign) |
| `public/images/photos/bridge-the-gap-cinegreen-screening.jpg` | `swechha.in/wp-content/uploads/2022/06/BTG-cinegreen.jpeg` | 2048×1365 | 514 KB | Children in cinema-style auditorium seating, two of them holding up a hand-lettered Hindi poster about air/water pollution | BTG activity: CineGreen (named leadership journey inside BTG) |
| `public/images/photos/bridge-the-gap-exposure-trip-landfill.png` | `swechha.in/wp-content/uploads/2022/06/BTG.png` | 1379×1040 | 2.5 MB | Children in beige uniforms standing at the edge of a landfill mound, a rag-picker visible working the waste in the background | BTG activity: exposure trips (landfill) — strong hero candidate |
| `public/images/photos/bridge-the-gap-exposure-trip-ghat-briefing.jpg` | `swechha.in/wp-content/uploads/2022/06/BTG-5.jpeg` | 960×720 | 114 KB | Teenagers standing on stone ghat steps above an informal riverside settlement (tents visible), a facilitator addressing them | BTG activity: exposure trips |
| `public/images/photos/bridge-the-gap-classroom-water-crisis.jpg` | `swechha.in/wp-content/uploads/2020/01/IMG-20190913-WA0006.jpg` | 1280×853 | 92 KB | Classroom/hall presentation, screen reads "India's water crisis" with three stat circles (70%/75%/84%), a speaker addressing seated students | BTG strategy / classroom curriculum session |
| `public/images/photos/bridge-the-gap-butterfly-gardening-assembly.jpg` | `swechha.in/wp-content/uploads/2022/05/IMG-20240311-WA0021.jpg` (original, not the `-scaled` variant) | 4032×3024 | 1.4 MB | School assembly hall, large screen reading "Butterfly Gardening with the Shiv Nadar School, Noida," a facilitator addressing hundreds of seated children on green mats, many hands raised | BTG activity: action projects (largest, sharpest file in the whole set) |
| `public/images/photos/bridge-the-gap-tree-planting-huddle.jpg` | `swechha.in/wp-content/uploads/2020/04/IMG-20200219-WA0071.jpg` | 1280×589 | 136 KB | A tight circle of students in school jackets, all hands together packing soil around a newly planted tree | BTG activity: action projects (tree planting) |
| `public/images/photos/bridge-the-gap-tyre-planter-garden.jpg` | `swechha.in/wp-content/uploads/2020/04/IMG-20200219-WA0065.jpg` | 1280×960 | 301 KB | An upcycled garden: old tyres and bicycle-wheel "flowers" painted and repurposed as planters on a lawn | BTG activity: action projects (upcycling/waste module) |
| `public/images/photos/bridge-the-gap-sapling-planting-green-caps.jpg` | `swechha.in/wp-content/uploads/2025/08/IMG-20200129-WA0016.jpg` | 1280×960 | 222 KB | Children in green caps and maroon-and-white uniforms crouched together planting saplings with water bottles, against a wall | BTG activity: action projects (tree planting) |
| `public/images/photos/bridge-the-gap-vermicompost-unit-visit.jpg` | `swechha.in/wp-content/uploads/2025/08/20230319_143607.jpg` | 4000×2252 | 7.9 MB | A large group standing for a photo outside a "Green Bharat Vermicompost Unit" building | BTG activity: exposure trips (very high resolution) |
| `public/images/photos/bridge-the-gap-sapling-bamboo-frame.jpg` | `swechha.in/wp-content/uploads/2020/02/IMG-20191129-WA0031.jpg` | 1280×960 | 326 KB | A sapling in a protective bamboo/wire frame in a dug plot, other children working the ground behind it | BTG activity: action projects (tree planting) |
| `public/images/photos/bridge-the-gap-planting-red-uniforms.jpg` | `swechha.in/wp-content/uploads/2020/04/20046398_10154841440662896_1666475332074937536_n.jpg` | 960×720 | 165 KB | Children in maroon uniforms crouched in dug furrows, planting saplings | BTG activity: action projects (tree planting) |

## KEPT — CityScapes (14 images)

CityScapes already had 13 small (mostly 660–780px) owner-supplied photos in
the library. The images below are new, additional, and mostly much larger —
several are full camera originals (4600×3456). Filenames carry a `-legacy`
suffix per the naming convention example in the brief, since they come from
the old WordPress site rather than the 2026-08-18/19 owner-supplied batch.

| Local path | Source URL | Dimensions | Size | What's in the frame | Recommended for |
|---|---|---|---|---|---|
| `public/images/photos/cityscapes-yamuna-walk-water-hyacinth-legacy.jpg` | `swechha.in/wp-content/uploads/2019/05/IMG_20190504_085121.jpg` | 4608×3456 | 6.1 MB | Two people (one a facilitator in a sun hat) standing on the Yamuna's edge, looking out over water clogged with hyacinth | CityScapes hero or Yamuna walk card — full camera original, largest file in the set |
| `public/images/photos/cityscapes-yamuna-boatride-umbrella-legacy.jpg` | `swechha.in/wp-content/uploads/2019/05/IMG_20190504_104249.jpg` | 4608×3456 | 4.9 MB | A group seated in a boat on the Yamuna under a pink umbrella, a metro bridge behind them | CityScapes Yamuna walk card |
| `public/images/photos/cityscapes-yamuna-boatride-metro-bridge-legacy.jpg` | `swechha.in/wp-content/uploads/2019/05/IMG_20190504_104722.jpg` | 4608×3456 | 4.9 MB | Same boat group, a Delhi Metro train crossing the bridge overhead | CityScapes Yamuna walk card |
| `public/images/photos/cityscapes-forest-walk-goat-trail-legacy.jpg` | `swechha.in/wp-content/uploads/2020/04/IMG_20190707_072917.jpg` (full original, not `-scaled`) | 3000×4000 | 2.6 MB | A line of students walking a dirt forest trail, a goat grazing beside the path | CityScapes forest walk card |
| `public/images/photos/cityscapes-bird-watching-walk-binoculars-legacy.jpg` | `swechha.in/wp-content/uploads/2025/08/IMG_20250131_101131-scaled.jpg` (only the `-scaled` rendition exists; the unsuffixed original 404s) | 1441×2560 | 1.1 MB | A line of children on a park path, several raising binoculars to watch birds in the trees overhead | CityScapes bird-watching walk card — replaces the existing 660×777 `cityscapes-birdwatching.jpg` with a much larger frame |
| `public/images/photos/cityscapes-yamuna-walk-facilitator-pointing-legacy.jpg` | `swechha.in/wp-content/uploads/2019/02/50816687_10156250618117896_3221451919855714304_n.jpg` | 960×640 | 132 KB | A facilitator pointing out across the Yamuna to a small group of students on the bank | CityScapes Yamuna walk card. Below the 1200px target — usable at card size, not as a hero |
| `public/images/photos/cityscapes-yamuna-walk-dry-riverbed-legacy.jpg` | `swechha.in/wp-content/uploads/2019/02/50867321_10156250619567896_6660146970625048576_n.jpg` | 960×640 | 102 KB | A line of students walking across a dry, cracked Yamuna riverbed toward a road bridge | CityScapes Yamuna walk card. Below 1200px — card size only |
| `public/images/photos/cityscapes-yamuna-pollution-plastic-debris-legacy.jpg` | `swechha.in/wp-content/uploads/2019/02/50905758_10156250618927896_4328520869006540800_n.jpg` | 640×960 | 128 KB | A dog scavenging a solid mat of plastic waste floating on the Yamuna under a bridge — a stark, documentary pollution frame | CityScapes Yamuna walk or landfill card. Small (640×960) and visually harsh; use deliberately, not decoratively |
| `public/images/photos/cityscapes-restoration-walk-trash-path-legacy.jpg` | `swechha.in/wp-content/uploads/2019/02/50917007_10156250619297896_1774144960119963648_n.jpg` | 960×640 | 168 KB | A line of walkers on a footpath thickly littered with plastic waste along both edges | CityScapes restoration-park or landfill walk card. Below 1200px |
| `public/images/photos/cityscapes-landfill-walk-birds-smoke-legacy.jpg` | `swechha.in/wp-content/uploads/2020/04/11114251_10152841756042896_75031661622197325_n.jpg` | 960×720 | 87 KB | A small group walking a dirt track beside a smoking landfill, birds circling overhead | CityScapes landfill walk card. Below 1200px |
| `public/images/photos/cityscapes-yamuna-wetland-wading-legacy.png` | `swechha.in/wp-content/uploads/2022/06/yamuna-walk-1.png` | 1306×866 | 1.75 MB | A line of people wading through shallow water at a reed-lined wetland edge | CityScapes Yamuna walk / urban wetland card |
| `public/images/photos/cityscapes-yamuna-bridge-group-legacy.jpg` | `swechha.in/wp-content/uploads/2022/06/walks-1.jpeg` | 960×540 | 85 KB | A school group (green blazers) posed for a photo on a sandy Yamuna bank, a road bridge behind them | CityScapes Yamuna walk card. Below 1200px |
| `public/images/photos/cityscapes-landfill-mound-legacy.jpg` | `swechha.in/wp-content/uploads/2022/06/landfill-walk.jpg` | 715×570 | 102 KB | A group of masked students facing a huge landfill mound under a hazy sky | CityScapes landfill walk card. Small — usable as a thumbnail only |

Note: `cityscapes-forest-walk-treeline-legacy.jpg` (`forest-walk.jpg`, 713×535,
students walking into dense green forest) was also kept as a secondary/smaller
forest-walk frame alongside the much larger goat-trail image above.

## KEPT — secondary, Swechha Farm (1 image)

| Local path | Source URL | Dimensions | Size | What's in the frame | Recommended for |
|---|---|---|---|---|---|
| `public/images/photos/swechha-farm-thatch-pavilion-classroom.jpg` | `swechha.in/wp-content/uploads/2020/04/52188130_10161316079690433_7526773282494742528_n.jpg` | 720×960 | 126 KB | Children seated on a red bench under a bamboo/thatch pavilion roof, an open-air classroom setup with potted plants and a blue table visible | Farm page — outdoor classroom / pavilion. Small, secondary priority per brief |

---

## REJECTED

| File | Reason (four words) |
|---|---|
| `BTG-7.jpeg` (girls on a bench, colourful clothing) | redundant, less distinctive |
| `IMG-20240311-WA0024-scaled.jpg` | duplicate of kept frame |
| `IMG-20190904-WA0023.jpg` (girls planting single sapling closeup) | small, redundant scene |
| `20250725_091253.jpg` (rooftop discussion, hill backdrop) | ambiguous programme identification |
| `IMG-20190803-WA0107.jpg` ("#SHOE MATTERS" classroom) | unclear which module |
| `staging/1-scaled.jpg` (kids raising saplings, celebratory) | baked-in logo watermark |
| `landfill-walk-1.jpg` | smaller duplicate crop |
| `forest-walk-1.jpg` | byte-identical duplicate file |
| `development-walk-waste-cloth-shop.jpeg` | unclear relevance, indoors |
| `69740636_714805715608770_…_o-1.jpg` (Remakery shop interior) | wrong programme, Remakery |
| `45fc8316bf524157f27db1d26f6eec98a43dd212.jpeg` (Chicago-style skyline) | generic stock, wrong city |
| `Singleuseplastics.jpeg` (pile of plastic bottles) | generic stock photo |
| `microplastics-over-ocean.jpeg` (hand holding sieve, ocean) | generic stock photo |
| `Untitled-design-1-1.png` (25th-anniversary logo) | logo graphic, not a photo |
| `21.jpg` (Remakery shop interior, logo overlay) | wrong programme, logo overlay |
| `wfc-1.jpg` (Women Farmers Collective portrait) | resolution far too small (483×326) |
| `51327390_10156270302157896_…_n.jpg` (students at industrial pipes) | resolution too small (560×560) |
| Seven `Copy-of-*_o.jpg` / `Copy-of-*_o-1.jpg` Yamuna Yatra Himalaya-source photos (boat sunset, hydel dam, suspension bridge, campfire circle, river-gorge group) | out of scope (Yamuna Yatra, not BTG/CityScapes/Farm — kept as candidates but not copied in, since the brief's scope is BTG/CityScapes primary and Farm/Gram Anubhav/NatureScapes secondary; Yamuna Yatra is neither) |
| `yamuna-yatra-3/4/5.jpeg` (river gorge, Yamunotri signpost, camp circle) | same: out of scope |

The Yamuna Yatra and remaining Copy-of-*/yamuna-yatra-* frames are genuinely
good, high-resolution documentary photographs (1296×864 to 1672×936) sitting
in `/private/tmp/claude-502/…/scratchpad/swechha-crawl/staging/` if a future
pass on the Yamuna Yatra journey page wants them — flagging their existence
here rather than silently dropping them, since they were fully vetted.

---

## GAPS — no usable photograph found on swechha.in

- **CityScapes heritage walk.** No dedicated heritage-walk photograph turned
  up anywhere in the crawl (six project pages, all attachment sitemaps
  checked by URL pattern). The existing `cityscapes-heritage-walk.jpg` in the
  library is owner-supplied from the 2026-08-18 batch, not from swechha.in.
- **CityScapes butterfly walk.** Same gap — no swechha.in photograph of the
  butterfly walk specifically (as opposed to Eco Action's butterfly *garden*
  events, which are covered above). The existing `cityscapes-butterfly.jpg`
  is likewise owner-supplied, not sourced here.
- **CityScapes restoration park walk.** The closest frame found
  (`cityscapes-restoration-walk-trash-path-legacy.jpg`) is a litter-strewn
  footpath, not a restored park — it reads as "before," not the finished
  restoration the copy describes.
- **A clean, uncluttered CityScapes hero shot.** The two largest, sharpest
  Yamuna frames (`water-hyacinth`, the two boat-ride photos) are strong, but
  all three are close-in group shots, not a wide establishing frame of "the
  city and the river together" that a hero usually wants.
- **Bridge the Gap: a single wide "curriculum in one classroom" hero.** The
  BTG set is rich in activity photos (planting, banners, exposure trips) but
  thin on a plain, well-lit classroom-only shot without a screen or crowd —
  `BTG-3` and `BTG-4` are the closest and both are under 1200px on the long
  edge.
- **Women Farmers Collective, Yamuna Yatra as its own journey, and Circular
  Economy** each have real photographs on swechha.in (see REJECTED and the
  staged extras above) but are out of this brief's scope — noted here in case
  a future photo pass targets them directly.

---

## Quality note

swechha.in's own image handling is inconsistent: the REST media API is
broken site-wide, several of the site's own `<img>` tags point at only a
150×150 or 250×250 thumbnail with no larger rendition ever uploaded
(`wfc-1.jpg`, `51327390…jpg`), and at least one frame in current use elsewhere
on the old site carries a baked-in logo watermark. Where a genuine original
exists, though, it is often very good — several 2019 Yamuna and 2024 school
event photos are full, unresized camera originals (up to 4608×3456) that had
simply never been linked at full size from the live pages. The Bridge the Gap
haul in particular is strong: eight `BTG-*` gallery photographs plus several
WhatsApp/camera originals amount to the first real, non-synthetic photographic
coverage that programme has had anywhere in this project.
