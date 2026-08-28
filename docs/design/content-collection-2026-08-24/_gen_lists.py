#!/usr/bin/env python3
"""Emits the six special collection lists (02-07).

Lists 02, 05 and 06 are generated FROM the repo's own data files wherever
possible, so the "what we already have" columns cannot drift from the site.
Anything not derivable is left as an explicit TO COLLECT marker — never guessed.
"""
import csv, json, os

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))

def load(p):
    with open(os.path.join(ROOT, p), encoding="utf-8") as f:
        return json.load(f)

def write(name, cols, rows):
    with open(os.path.join(HERE, name), "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f, quoting=csv.QUOTE_ALL)
        w.writerow(cols)
        for r in rows:
            assert len(r) == len(cols), (name, r[0], len(r), len(cols))
            w.writerow(r)
    print(name, len(rows), "rows")

TC = "TO COLLECT"

# ══════════════════════════════ 02. PROJECT MASTER LIST ══════════════════════════════
COLS2 = ["Project Name","Kind","Year Started","Year Ended/Ongoing","Location","Theme",
         "Short Description","Key Numbers","Partners","Funder","Available Photos",
         "Available Report","Available Video","Available Media Coverage","Website Status",
         "Missing Information","Source"]
rows2 = []

KIND_DIRS = ["projects","campaigns","journeys","events"]
for kind in KIND_DIRS:
    d = os.path.join(ROOT, "data/work", kind)
    for fn in sorted(os.listdir(d)):
        j = json.load(open(os.path.join(d, fn), encoding="utf-8"))
        w = j.get("with", {})
        figs = j.get("figures", [])
        nums = " | ".join(f'{f["value"]} {f.get("label","")} ({f.get("period","")})' for f in figs) or TC
        holes = " || ".join(h.get("what","") for h in j.get("holes", [])) or "—"
        gallery = len(j.get("gallery", []))
        rows2.append([
            j.get("name",""), kind.rstrip("s").capitalize(), TC, TC, TC, TC,
            j.get("line", j.get("deck",""))[:300] or TC,
            nums,
            ", ".join(w.get("partners", [])) or TC,
            ", ".join(w.get("funders", [])) or TC,
            f"{gallery} in gallery" if gallery else "NONE",
            TC, TC, "NONE ON SITE",
            "Detail page" if j.get("page") else "INDEX CARD ONLY — no page",
            holes[:600],
            f"data/work/{kind}/{fn}",
        ])

# Legacy programmes with no presence at all — from the redirect map's `parent` rows.
LEGACY = [
 ("The Remakery","Project","/work/projects","Upcycling shop and workshop space; weekly 'One Night Stand' events. Named on / and /about; /remakery 404s.","docs/legacy redirect-map: /project/remakery/"),
 ("Teacher Training","Project","/work/projects","700+ educators trained per the old site. Currently one bullet inside Bridge the Gap.","/project/teacher-training/"),
 ("Green Finance (with IGES)","Project","/work/projects","Study of 93 social enterprises. Longest project page on the old site. Pairs with the IGES report on /publications.","/project/green-finance/"),
 ("Circular Economy / Marine Litter & EPR","Project","/work/projects","GIZ + MoEFCC, Indo-German bilateral cooperation. 10 single-use-plastic-alternative infographics.","/project/circular-economy-marine-litter-and-epr/"),
 ("Women & Non-Traditional Livelihoods","Project","/work/projects","Udaan, British Council YWSEDP, MOM candle enterprise, Lunchbox 17 (25,000 meals/yr) which became Million Kitchen.","/project/women-and-non-traditional-livelihood/"),
 ("Pagdandi","Project","/work/projects","2007 open-air school on the Yamuna at Kudsia Ghat; Jagdamba Camp school; Kitaab Ghar library; RTE campaign, 150+ children into formal schools. ME to WE's origin.","/project/... (named in the legacy audit §1.5)"),
 ("Films & Documentaries","Project","/stories","Jijivisha, Wasted, Disposable, Tatva, Sakhi (2021, Ford Foundation). Broadcast on CNN International, NDTV, BBC, CBC.","/project/films-and-documentaries/"),
 ("Bee Keepers Collective Training","Project","/farm","Farm training programme. Old counters contradict each other (500 kg vs 600 litres).","/project/bee-keepers-collective-training/"),
 ("Composting & Micro-enterprises","Project","/farm","Farm training programme.","/project/composting-and-micro-enterprises/"),
 ("Soil Regeneration Training","Project","/farm","Farm training programme. Old counter (9,385) is contaminated placeholder data.","/project/soil-regeneration-training/"),
 ("Sustainable Agriculture Training Camps","Project","/farm","Farm training programme.","/project/sustainable-agriculture-training-camps/"),
 ("Women Farmers Collective","Project","/farm","Farm training programme.","/project/women-farmers-collective/"),
 ("Solar Energy Training","Project","/farm","Old page was an unfinished lorem-ipsum template. Verify it ever ran.","/project/solar-energy-training/"),
 ("Water Harvesting Training","Project","/farm","Old page was an unfinished lorem-ipsum template. Verify it ever ran.","/project/water-harvesting-training/"),
 ("Learning Communities","Project","/work/projects","Named on /impact and 3 built pages. Old counter (9,385 'Campaigns') is contaminated.","/project/learning-communities/"),
 ("Green Creeps","Project","/work/projects","No presence anywhere on the new site.","/project/green-creeps/"),
 ("Road to Leadership","Project","/work/projects","No presence anywhere on the new site.","/project/road-to-leadership/"),
 ("Brake Even","Project","/work/campaigns","Appears on zero built pages.","/project/brake-even-2/"),
 ("US Embassy Micro Grants Competition","Project","/work/projects","Appears only in the video index.","/project/u-s-embassy-micro-grants-competition/"),
 ("Micro Grants","Project","/work/projects","","/project/micro-grants/"),
 ("Green Exposures / Eco Walks","Journey","/work/journeys","Probably the ancestor of CityScapes — confirm or fold.","/project/green-exposures-eco-walks/"),
 ("Future Lifestyles Project","Project","/work/projects","Pairs with the IGES New Delhi scenario already on /publications.","/project/future-lifestyles-project/"),
 ("Air Pollution Campaigns","Campaign","/work/campaigns","Probably the ancestor of Delhi I Can't See You — confirm or fold.","/project/air-pollution-campaigns/"),
 ("Cycles for Sustainability","Event","/work/events","Probably related to Cyclothon — confirm or fold.","/project/cycles-for-sustainability/"),
 ("US Dept of State / Green the Map podcast & masterclass series","Project","/stories","Podcasts are on /stories; the programme behind them is not described.","/project/u-s-dept-of-state-...-masterclass-series.../"),
 ("Dairy Cooperative and Cow Rearing","Project","/farm","Listed on the old Programs page and the Sustainable Agriculture theme page but had NO project page even on the old site — a promise the old site never kept. /farm names 20 cows.","legacy audit §1.5"),
]
for name, kind, dest, desc, src in LEGACY:
    rows2.append([name, kind, TC, TC, TC, TC, desc, TC, TC, TC, TC, TC, TC, TC,
                  f"ABSENT — old URL redirects to {dest}",
                  "Everything. Decide first whether it belongs on the site at all.", src])

write("02-project-master-list.csv", COLS2, rows2)

# ══════════════════════════════ 03. PARTNER MASTER LIST ══════════════════════════════
COLS3 = ["Organisation","Type of Partner","Project/Campaign","Year(s)","Nature of Association",
         "Logo Available","Permission to Display","Existing Website Mention","Missing Content",
         "Should this be publicly featured?","Source"]
rows3 = []

# Derived from data/work/**/*.json `with` blocks — the only place the site names organisations.
seen = {}
for kind in KIND_DIRS:
    d = os.path.join(ROOT, "data/work", kind)
    for fn in sorted(os.listdir(d)):
        j = json.load(open(os.path.join(d, fn), encoding="utf-8"))
        w = j.get("with", {})
        for cat, label in (("funders","Funder"),("partners","Institutional partner"),("schools","School")):
            for org in w.get(cat, []):
                seen.setdefault((org, label), []).append(j["name"])
for (org, label), where in sorted(seen.items()):
    rows3.append([org, label, ", ".join(where), TC, TC, "NO", TC,
                  f"Named on /work — {', '.join(where)}",
                  "Years, nature of association, logo, website link, one-line description",
                  TC, "data/work/**/*.json `with`"])

# Named elsewhere on the site but not in any `with` block.
OTHER = [
 ("GIZ","Knowledge / publication partner","The Sustainable Shopping Basket (2010); Circular Economy / Marine Litter & EPR","2010; TBC","Co-produced the shopping guide; Indo-German bilateral cooperation on marine litter","NO",TC,"Named on /publications","Years, scope, the marine-litter project's whole record",TC,"data/publications.json; legacy audit §1.5"),
 ("IGES","Research partner / publisher","Future Lifestyles: the New Delhi scenario (2021); Green Finance study","2021; TBC","IGES published; Swechha was the New Delhi partner","NO","Report is hosted with credit + link","Named and credited on /publications","The Green Finance project (93 social enterprises) has no page",TC,"data/publications.json"),
 ("MoEFCC (Ministry of Environment, Forest and Climate Change)","Government","Circular Economy / Marine Litter & EPR",TC,"Named in the old project page","NO",TC,"NOT on any built page","Everything — this is the only government collaboration in the archive",TC,"legacy audit §1.5"),
 ("Ford Foundation","Funder","Sakhi (2021 film)","2021","Supported the film per the old site","NO",TC,"NOT on any built page","Everything",TC,"legacy audit §1.5"),
 ("VSO / DFID","Programme partner","Influence / CYON — International Citizen Service exchange","2012","65 leaders, India and UK","NO",TC,"Named in passing on 4 built pages","The exchange itself has no page",TC,"legacy audit §1.5"),
 ("UNV (United Nations Volunteers)","Institutional","International Year of Volunteers 2001, India","2001","Swechha's founder headed the Volunteer Promotion Unit, New Delhi","NO",TC,"In one team biography only","Whether this is an organisational or a personal association",TC,"data/about-people.json"),
 ("EMpower","Funder / partner","ME to WE; She Leads Change","TBC","Funds both Jagdamba programmes","NO",TC,"Named on 5 built pages","Years, grant scope, and how the two programmes differ",TC,"data/work/projects/*.json"),
 ("British Council","Partner","Yamuna Yatra; Women & Non-Traditional Livelihoods (YWSEDP)","TBC","Named as a Yatra partner; YWSEDP for the livelihoods work","NO",TC,"Named on 2 built pages","The YWSEDP relationship entirely",TC,"data/work/journeys/yamuna-yatra.json; legacy audit §1.5"),
 ("Green the Map","Related enterprise (NOT a Swechha programme)","Upcycled goods","TBC","Explicitly labelled on the homepage as a separate organisation with its own accounts","Own site",TC,"Named on 4 built pages","Whether the Sustainable Shopping campaign is connected to it — a reader will assume it is","Already featured, with the distinction stated","home.html"),
 ("The Yamunotsav / Shramdaan host bodies",TC,"Yamunotsav; Yamuna Shramdaan","2006-2014; TBC","Nine editions of a river festival must have had civic or municipal counterparties","NO",TC,"NOT on any built page","Everything",TC,"data/work/events/*.json holes"),
 ("100+ grassroots host organisations","Community partner","Gram Anubhav",TC,"Host the journeys in their own villages","NO","REQUIRED — five names, with permission","Counted (100+) on /work/journeys/gram-anubhav, none named","Five names to start with",TC,"data/work/journeys/gram-anubhav.json hole"),
 ("50 colleges + 75 partner organisations","Institutional","Influence — volunteering","since 2010","Volunteering placements","NO","REQUIRED — five names each, with permission","Counted on /work/projects/influence, none named","Five names in each category",TC,"data/work/projects/influence.json hole"),
]
for r in OTHER:
    rows3.append(list(r))
write("03-partner-master-list.csv", COLS3, rows3)

# ══════════════════════════════ 04. SCHOOL / INSTITUTION MASTER LIST ══════════════════════════════
COLS4 = ["Institution Name","City","State","Programme/Project","Year","Number of Students/Participants",
         "Key Activity","Photos Available","Permission Available","Website Use Recommendation","Source"]
rows4 = [
 ["Vasant Valley School","New Delhi","Delhi","Yamuna Yatra",TC,TC,"Named as a Yatra school","NO",TC,
  "Already named on /work/journeys/yamuna-yatra — confirm permission and add years/numbers",
  "data/work/journeys/yamuna-yatra.json"],
 ["The Shriram School","New Delhi","Delhi","Yamuna Yatra; NatureScapes",TC,TC,
  "Named as a Yatra school and a NatureScapes school. The site's own copy says one school made the Yatra part of its Grade XI year — confirm whether this is that school.",
  "NO",TC,"Confirm the Grade XI claim and name the school, with permission — it is the strongest school-partnership fact on the site",
  "data/work/journeys/yamuna-yatra.json; data/work/journeys/naturescapes.json; home.html"],
 ["Pathways World School","Gurugram (TBC)","Haryana (TBC)","Yamuna Yatra",TC,TC,"Named as a Yatra school","NO",TC,
  "Confirm city/state and permission","data/work/journeys/yamuna-yatra.json"],
 ["Modern School","New Delhi","Delhi","NatureScapes",TC,TC,"Named as a NatureScapes school","NO",TC,
  "Confirm which Modern School campus","data/work/journeys/naturescapes.json"],
]
# Collection templates for the categories the site claims but cannot name.
TEMPLATES = [
 ("[Bridge the Gap partner schools — 250+ claimed over 15 years, 100-150 per year]","Delhi / NCR","Delhi / Haryana / UP",
  "Bridge the Gap","2010-2026","50,000+ students over 15 years (aggregate)",
  "Five to sixteen curriculum sessions on land, water and air, plus exposure trips and action projects",
  "Some, unlabelled","SCHOOL PERMISSION REQUIRED",
  "Collect the 20-30 longest-running partner schools, not all 250. A named list of 20 with permission is worth more than a claim of 250.",
  "data/work/projects/bridge-the-gap.json"),
 ("[Eco Action schools — 100+ 'green infrastructures across 100+ schools' claimed on the homepage]","Delhi / NCR","Delhi",
  "Eco Action",TC,"100+ (homepage figure, NOT in /impact's register — see master sheet N-01)",
  "Butterfly parks, herb gardens, airshed parks","NONE of any garden","SCHOOL PERMISSION REQUIRED",
  "Name the Vasant Kunj park first — it carries the 5%-to-90% decade figure and is the site's best unillustrated claim",
  "home.html; data/work/projects/eco-action.json"),
 ("[Farm School visiting schools — 30 groups a year]","Various","Various","Farm School","annual, current","30 school groups a year",
  "Day visits, overnight camps, short courses","Some farm frames, not visit-labelled","SCHOOL PERMISSION REQUIRED",
  "Two named schools with a visit account each would populate /farm and /work/projects/farm-school",
  "data/work/projects/farm-school.json"),
 ("[Food systems with UNEP — Delhi NCR government schools]","Delhi / NCR","Delhi",
  "Food systems, with UNEP",TC,TC,"Curriculum and action projects on food and sustainability",
  "NONE","SCHOOL PERMISSION REQUIRED",
  "The site cannot currently say whether this has started — see master sheet W-13",
  "data/work/projects/food-systems.json"),
 ("[Influence — 50 colleges]","Various","Various","Influence — volunteering","since 2010","50 colleges (aggregate)",
  "Volunteering placements","NONE","INSTITUTION PERMISSION REQUIRED",
  "Five college names with permission would turn a count into a list of collaborators",
  "data/work/projects/influence.json"),
 ("[Teacher Training — 700+ educators]","Delhi / NCR","Delhi","Teacher Training",TC,"700+ educators (old site, unverified)",
  "Teacher training","NONE","TO BE VERIFIED",
  "The programme has no page at all — see master sheet M-02",
  "legacy audit §1.5"),
 ("[Jagdamba Camp / settlement]","New Delhi","Delhi","ME to WE; She Leads Change; This Girl Can",
  "2007-2026 (ME to WE); 2017- (She Leads Change)","3,000+ girls and boys; 50+ adolescent girls",
  "Year-long journeys on agency and decision-making; peer leadership; Kitaab Ghar library (Pagdandi era)",
  "NONE of the programme","COMMUNITY CONSENT REQUIRED — minors",
  "The site's three girl-focused items may be one programme under three names — settle that before collecting",
  "data/work/projects/me-to-we.json; she-leads-change.json"),
]
for t in TEMPLATES:
    rows4.append(list(t))
write("04-school-institution-master-list.csv", COLS4, rows4)

# ══════════════════════════════ 05. IMPACT NUMBERS MASTER LIST ══════════════════════════════
COLS5 = ["Metric","Current Number on Website","Correct/Verified Number?","Year/Period",
         "Source of Data","Supporting Document","Needs Updating?","Website Page(s) Using It"]
rows5 = []
for kind in KIND_DIRS:
    d = os.path.join(ROOT, "data/work", kind)
    for fn in sorted(os.listdir(d)):
        j = json.load(open(os.path.join(d, fn), encoding="utf-8"))
        page = f"/work/{kind}/{j['slug']}" if j.get("page") else f"/work/{kind} (card only)"
        for f in j.get("figures", []):
            period = f.get("period","")
            basis = f.get("basis","")
            needs = []
            if "no start year sourced" in period: needs.append("YES — no start year")
            if basis == "modelled": needs.append("YES — modelled, not counted")
            if "period not sourced" in period: needs.append("YES — period not sourced")
            rows5.append([
                f'{j["name"]} — {f.get("label","")}',
                f.get("value",""),
                "Published with basis stated: " + (basis or "unstated"),
                period,
                f.get("source",""),
                "NONE ATTACHED — no source document is linked on the site",
                "; ".join(needs) or "No",
                page + " + /impact register",
            ])
EXTRA5 = [
 ["Out of the Yamuna","6,890 t","NOT VERIFIED — absent from data/work and from /impact's register",TC,
  "NOT SOURCED — appears only in the hand-built homepage","NONE",
  "YES — CRITICAL. Source it or withdraw it.","/ (homepage impact band) ONLY"],
 ["Green infrastructures across schools","100+ / 100+ schools","NOT VERIFIED — absent from data/work and from /impact's register",TC,
  "NOT SOURCED — appears only in the hand-built homepage","NONE",
  "YES — CRITICAL. Define 'green infrastructure', source it, or withdraw it.","/ (homepage impact band) ONLY"],
 ["Years of the paper archive scanned","7 of 27","Verified — 7 real frames, 20 placeholders","2000-2026",
  "Counted from home.html","N/A","Not a defect — an honest gap. Close it by scanning (master sheet F-06).","/ (record band)"],
 ["Trees at Swechha Farm","5,000+","Owner-stated","current","SOURCE-FACTS §200, owner 21 Aug 2026","NONE","No","/farm, / (farm band)"],
 ["Saplings in the native nursery","20,000","Carried from the frozen homepage","current","home.html band 8","NONE",
  "YES — trace to a farm record rather than to a design file","/farm, /"],
 ["Cows in the dairy","20","Owner-stated","current","SOURCE-FACTS §200","NONE","No","/farm, /"],
 ["Students the farm can sleep","100","Owner-stated","current","owner 22 Aug 2026","NONE","No","/farm"],
 ["Acres at the farm","5","Owner-stated","current","owner","NONE","No","/farm, /"],
 ["Teachers trained","NOT ON SITE","700+ claimed on the old site, unverified",TC,"old WordPress project page","NONE",
  "YES — collect and verify before publishing","None — the programme has no page"],
 ["Meals served (Lunchbox 17)","NOT ON SITE","25,000 in a year claimed on the old site, unverified",TC,
  "old WordPress project page","NONE","YES — collect and verify","None — the programme has no page"],
 ["Children into formal schooling (RTE campaign)","NOT ON SITE","150+ claimed on the old site, unverified","2007-",
  "old WordPress project page (Pagdandi / Me to We)","NONE","YES — collect and verify","None"],
 ["Tree survival rate","NOT PUBLISHED — cannot be, planted total unrecorded","N/A",TC,
  "Monsoon Wooding's own declared hole","NONE","YES — needs the planted total and the counting interval",
  "/work/campaigns/monsoon-wooding"],
 ["Fellows to date","NOT PUBLISHED","~150 implied (10/year since 2010) but never stated as a cumulative figure","since 2010",
  "Derived from the published '10 fellowships each year'","NONE",
  "YES — a cumulative fellow count, and the length of a fellowship year, are both unstated",
  "/work/projects/influence"],
 ["Volunteers, annually","10,000","Published, but dated to the year the programme started","since 2010","SOURCE-FACTS §84","NONE",
  "YES — the page's own hole says it cannot say which of the five volunteering figures is still true",
  "/work/projects/influence, /impact"],
]
rows5.extend(EXTRA5)
write("05-impact-numbers-master-list.csv", COLS5, rows5)

# ══════════════════════════════ 06. PHOTO AND VISUAL ASSET LIST ══════════════════════════════
COLS6 = ["Asset Needed","Related Project/Page","Description","Approximate Year","Location",
         "Preferred Orientation","Minimum Quality Needed","Source/Photographer","File Available?",
         "Rights/Credit Confirmed?","Priority","Status",
         "Alt text (REQUIRED - build refuses a frame without it)",
         "Credit line (REQUIRED - e.g. 'Swechha archive')",
         "Genuine photograph? (confirm - 25 synthetic frames were withdrawn on 22 Aug)",
         "Link to file (Drive/Dropbox) or filename once supplied"]
CONSENT = "Owner has permitted use of Swechha photographs (ruling W-14, 21 Aug 2026); check separately for identifiable minors"
rows6 = [
 ["Gram Anubhav — shramdaan","/work/journeys/gram-anubhav","Villagers and students working together on a shared task","any","Uttarakhand / Rajasthan / Gujarat / Himachal","Landscape","2000px long edge, EXIF intact","Facilitators' phones; journey leads","NO — all 12 filed frames were withdrawn as synthetic",CONSENT,"CRITICAL","NOT STARTED"],
 ["Gram Anubhav — village interaction","/work/journeys/gram-anubhav","A group in conversation with village hosts","any","as above","Landscape","2000px","Facilitators","NO",CONSENT,"CRITICAL","NOT STARTED"],
 ["Gram Anubhav — home visit","/work/journeys/gram-anubhav","Inside a host household","any","as above","Landscape or portrait","2000px","Facilitators","NO","CONSENT REQUIRED — private home","CRITICAL","NOT STARTED"],
 ["Gram Anubhav — cultural evening","/work/journeys/gram-anubhav","An evening gathering, music or performance","any","as above","Landscape","2000px","Facilitators","NO",CONSENT,"HIGH","NOT STARTED"],
 ["NatureScapes — Sariska","/work/journeys/naturescapes","A Swechha group on a Sariska journey","any","Sariska Tiger Reserve, Rajasthan","Landscape","2000px","Journey leads","NO — only stock, refused by the build",CONSENT,"CRITICAL","NOT STARTED"],
 ["NatureScapes — Ranthambore","/work/journeys/naturescapes","A Swechha group on a Ranthambore journey","any","Ranthambore, Rajasthan","Landscape","2000px","Journey leads","NO — only stock",CONSENT,"CRITICAL","NOT STARTED"],
 ["NatureScapes — Mukteshwar / Sirmaur","/work/journeys/naturescapes","A Swechha group in the Himalayan destinations","any","Uttarakhand / Himachal","Landscape","2000px","Journey leads","NO — only stock",CONSENT,"CRITICAL","NOT STARTED"],
 ["NatureScapes — Jim Corbett","/work/journeys/naturescapes","A Swechha group at Corbett","any","Uttarakhand","Landscape","2000px","Journey leads","NO — only stock",CONSENT,"HIGH","NOT STARTED"],
 ["NatureScapes — Sunderbans","/work/journeys/naturescapes","A Swechha group in the mangroves","any","West Bengal","Landscape","2000px","Journey leads","NO — only stock",CONSENT,"HIGH","NOT STARTED"],
 ["NatureScapes — Jaisalmer","/work/journeys/naturescapes","A Swechha group in the desert","any","Rajasthan","Landscape","2000px","Journey leads","NO — only stock",CONSENT,"HIGH","NOT STARTED"],
 ["Eco Action — Vasant Kunj park BEFORE","/work/projects/eco-action","The park at ~5% green cover, before restoration","~2010-2015","Vasant Kunj, New Delhi","Landscape","Any usable resolution — an old phone photo is fine","Project files / founder archive","NO",CONSENT,"CRITICAL","NOT STARTED"],
 ["Eco Action — Vasant Kunj park AFTER","/work/projects/eco-action","The same viewpoint at ~90% green cover","current","Vasant Kunj, New Delhi","Landscape","2400px","Can be shot fresh — the park still exists","NO",CONSENT,"CRITICAL","NOT STARTED"],
 ["Eco Action — a butterfly park","/work/projects/eco-action","One of the 70+ butterfly parks","current","Delhi NCR","Landscape","2400px","Can be shot fresh","NO",CONSENT,"CRITICAL","NOT STARTED"],
 ["Eco Action — a herb garden","/work/projects/eco-action","One of the 20+ herb gardens","current","Delhi NCR","Landscape","2400px","Can be shot fresh","NO",CONSENT,"CRITICAL","NOT STARTED"],
 ["ME to WE — the riverbank school","/work/projects/me-to-we","The 2007 open-air school at Kudsia Ghat","~2007-2010","Kudsia Ghat, Yamuna, Delhi","Landscape","Any","Founder archive","NO","CONSENT — minors, historic","CRITICAL","NOT STARTED"],
 ["ME to WE — the Jagdamba group","/work/projects/me-to-we","The programme in the settlement","any","Jagdamba Camp, Delhi","Landscape","2000px","Programme team","NO","CONSENT REQUIRED — minors","CRITICAL","NOT STARTED"],
 ["ME to WE — alumni now on staff","/work/projects/me-to-we","Portraits of the two alumni who became core team members","current","Delhi","Portrait","2000px","Shoot fresh","NO","WRITTEN CONSENT REQUIRED — named individuals","CRITICAL","NOT STARTED"],
 ["Yamunotsav — the festival","/work/events","Any frames from the nine June editions","2006-2014","Yamuna, Delhi","Landscape","Any","THE DRIVE FOLDER — currently will not open","NO — access blocked","Unlock the folder first","CRITICAL","NOT STARTED"],
 ["Yamuna Shramdaan","/work/events","A clean-up in progress on the bank","any","Yamuna, Delhi","Landscape","2000px","Archive folder","NO — folder not located",CONSENT,"CRITICAL","NOT STARTED"],
 ["Cyclothon","/work/events","The ride","any","Delhi","Landscape","2000px","Archive folder","NO",CONSENT,"MEDIUM","NOT STARTED"],
 ["Greenathon","/work/events","The event","any","Delhi","Landscape","2000px","Archive folder","NO",CONSENT,"MEDIUM","NOT STARTED"],
 ["Homepage archive strip — 2000 to 2017","/ (record band)","ONE datable image per year: photograph, poster, clipping, letter or report cover. 18 consecutive years currently show placeholder frames.","2000-2017","various","Landscape preferred","Scan at 300dpi or photograph at 2400px","Office archive, Khirki Extension — 'boxes nobody has opened yet'","NO","Own material; check for minors","CRITICAL","NOT STARTED"],
 ["Homepage archive strip — 2021 and 2024","/ (record band)","Two further placeholder years","2021, 2024","various","Landscape","2400px","Recent programme files","NO",CONSENT,"HIGH","NOT STARTED"],
 ["CityScapes — heritage walk","/work/journeys/cityscapes","One of the two walks with no frame at all","any","Delhi","Landscape","2000px","Walk leads","NO",CONSENT,"HIGH","NOT STARTED"],
 ["CityScapes — restoration park walk","/work/journeys/cityscapes","The second walk with no frame","any","Delhi","Landscape","2000px","Walk leads","NO",CONSENT,"HIGH","NOT STARTED"],
 ["CityScapes — walk labels for existing frames","/work/journeys/cityscapes","Not a photograph: a walk name against each surviving CityScapes frame, so the six walks can carry a picture each","n/a","n/a","n/a","n/a","Walk leads","Frames exist, unlabelled","n/a","HIGH","NOT STARTED"],
 ["Farm — the barren ground before","/farm","The land before planting, to sit against the food forest now","~2016","Mewat, Haryana","Landscape","Any","Founder / farm archive","NO",CONSENT,"HIGH","NOT STARTED"],
 ["Farm — each named system","/farm","One frame each: native nursery, dairy, apiary, vermicompost, hydroponics, mud houses, butterfly garden, poultry","current","Swechha Farm","Landscape","2400px","Can be shot fresh — Naveen is on site","Partially",CONSENT,"HIGH","NOT STARTED"],
 ["Farm — people of Mewat","/farm ('Built by Mewat')","Portraits of two or three local people who built or work the farm","current","Mewat, Haryana","Portrait","2400px","Shoot fresh","NO","WRITTEN CONSENT REQUIRED — named individuals","HIGH","NOT STARTED"],
 ["Governing body portraits","/about","Eight board portraits. Existing sources are 338x232 and too small to use.","current","various","Portrait or square","1200px minimum","Members directly","NO — old WP files too small","EACH MEMBER'S CONSENT","MEDIUM","NOT STARTED"],
 ["Fellows — portraits","/work/projects/influence","Portraits of 5-10 featured fellows with their projects","2010-2026","across India","Portrait","1200px","The fellows themselves","NO","WRITTEN CONSENT REQUIRED","CRITICAL","NOT STARTED"],
 ["Press clippings","/about (media archive)","Scans of the 2004 India Today and Outlook features and any other significant press","2004-2026","n/a","Portrait / page scan","300dpi","Office clippings file","NO","Copyright: show a thumbnail + headline + outlet; do not reproduce article text","HIGH","NOT STARTED"],
 ["Broadcast stills","/about (media archive)","Stills or screenshots from the CNN Be the Change films and the NDTV/BBC/CBC broadcasts","2007-2008","n/a","Landscape","Any","Founder archive / broadcaster","NO","THIRD-PARTY COPYRIGHT — check before publishing","MEDIUM","NOT STARTED"],
 ["Campaign posters and placards","/work/campaigns","Posters, banners and hand-lettered placards from each of the eight campaigns","various","Delhi","Portrait","300dpi scan","Office archive; designers","Partially — 11 Sandip Paul posters are on /stories","Credit the designer by name","MEDIUM","NOT STARTED"],
 ["GIZ marine-litter infographics","/work/projects (Circular Economy)","The 10 single-use-plastic-alternative infographics. 8 GIZ marine images already sit UNUSED in public/images/giz-marine/.","TBC","n/a","Varies","n/a","GIZ / project files","PARTIALLY — 8 in the repo, unused","GIZ CLEARANCE REQUIRED","MEDIUM","AVAILABLE"],
 ["Bridge the Gap — a school, over time","/work/projects/bridge-the-gap","One partner school photographed across several years of the curriculum","various","Delhi","Landscape","2000px","Programme team","Some, unlabelled","SCHOOL PERMISSION","HIGH","NOT STARTED"],
 ["Teacher training in progress","/work/projects (Teacher Training)","Educators being trained, not children","any","Delhi NCR","Landscape","2000px","Programme team","NO",CONSENT,"MEDIUM","NOT STARTED"],
 ["The Remakery","/work/projects (Remakery)","The space, the making, and a 'One Night Stand' event","current","Delhi","Landscape","2400px","Nikhil (runs the space)","NO",CONSENT,"HIGH","NOT STARTED"],
 ["Founding era","/about","Any photograph from 2000-2004: the first clean-ups, the first Yatra","2000-2004","Yamuna, Delhi; Yamunotri to Agra","Landscape","Any","Founder archive","NO",CONSENT,"CRITICAL","NOT STARTED"],
 ["Yamuna Yatra route map","/work/journeys/yamuna-yatra","Not a photograph: the confirmed ten stops between Yamunotri and Agra, so the page can draw the route it is named after","n/a","n/a","n/a","n/a","Vimlendu / Naveen","NO","n/a","HIGH","NOT STARTED"],
]
rows6 = [r + ["", "", "", ""] for r in rows6]
write("06-photo-visual-asset-list.csv", COLS6, rows6)

# ══════════════════════════════ 07. PUBLICATION / MEDIA ARCHIVE ══════════════════════════════
COLS7 = ["Title","Type","Date","Author/Speaker","Publication/Platform","Topic","URL/File",
         "Relevant Swechha Page","Permission/Copyright Status","Recommended Use","Status"]
rows7 = []
# Already on the site
for e in load("data/publications.json")["items"]["entries"]:
    rows7.append([e["title"], e["kind"], e["year"], e.get("credit","Swechha"),
                  "swechha.in", e["lead"][:120], e["file"], "/publications",
                  e.get("credit","Own material"), "Already published", "READY FOR WEBSITE"])
# Reports in the repo, unlinked
REPORTS = [
 ("Activity Report 2011-2013","/docs/reports/swechha-activity-report-2011-2013.pdf","2011-2013","33pp, text layer"),
 ("Activity Report 2013-14","/docs/reports/swechha-activity-report-2013-14.pdf","2013-14","27pp, text layer"),
 ("Activity Report 2014-15","/docs/reports/swechha-activity-report-2014-15.pdf","2014-15","27pp, text layer"),
 ("Annual Report 2016-17","/docs/reports/swechha-annual-report-2016-17.pdf","2016-17","21pp, text layer"),
 ("Annual Report 2018-19","/docs/reports/swechha-annual-report-2018-19.docx","2018-19","DOCX ONLY — confirm it is final and produce a PDF"),
 ("Annual Report 2020-21","/docs/reports/swechha-annual-report-2020-21.pdf","2020-21",""),
 ("Annual Report 2022-23","/docs/reports/swechha-annual-report-2022-23.pdf","2022-23",""),
 ("Annual Report 2023-24","/docs/reports/swechha-annual-report-2023-24.pdf","2023-24",""),
 ("Annual Report 2024-25","/docs/reports/swechha-annual-report-2024-25.pdf","2024-25",""),
]
for t, f, yr, note in REPORTS:
    rows7.append([t,"Annual/activity report",yr,"Swechha","swechha.in",
                  "Institutional transparency", f, "/about (transparency shelf — DOES NOT EXIST YET)",
                  "Own material; already public","Surface on /about. "+note,"AVAILABLE — IN REPO, LINKED FROM NOWHERE"])
rows7.append(["80G Tax Exemption Certificate","Statutory certificate",TC,"Income Tax Department","swechha.in",
              "Tax exemption","/docs/compliance/80g-certificate.pdf","/about (transparency shelf)",
              "Own material","Surface on /about WITH the registration details transcribed — it is an image-only scan and unreadable to a screen reader",
              "AVAILABLE — IN REPO, LINKED FROM NOWHERE"])
rows7.append(["INFLUENCE Annual Report 2012-2013","Project report","2012-13","Swechha","old WordPress",
              "The Influence programme","docs/legacy/documents/INFLUENCE-ANNUAL-REPORT-2012-2013.pdf",
              "/work/projects/influence","Own material",
              "24pp IMAGE-ONLY SCAN — needs OCR or a written summary before publishing","NEEDS VERIFICATION"])
rows7.append(["Me to We Final Report 2014","Project report","2014","Swechha","old WordPress",
              "The ME to WE programme","docs/legacy/documents/Me-to-We-_Final-Report-2014.pdf",
              "/work/projects/me-to-we","Own material","9pp, text layer. Publish beside the programme page.","AVAILABLE"])
rows7.append(["NSN-BTG Final Report","Project report",TC,"Swechha / Nokia Siemens Networks","old WordPress",
              "Bridge the Gap, funded by Nokia Siemens Networks","docs/legacy/documents/NSN-BTG_-final-report.pdf",
              "/work/projects/bridge-the-gap","CHECK — carries a funder's name",
              "17pp, text layer. May contain the school roll that closes master-sheet row D-01.","AVAILABLE"])
# Drive-hosted manuals from the old Resources page
MANUALS = [
 ("NatureScapes Manual — Sirmaur","Field manual","2025 (uploaded)","1cJD5hCL7MZk7kwf104q992i8Q_sf55Rw","/work/journeys/naturescapes"),
 ("NatureScapes Manual — Sariska Tiger Reserve","Field manual","2025 (uploaded)","1zJSbwYdNQs5P--xlnj86L1oVI8aCnJs0","/work/journeys/naturescapes"),
 ("Yamuna Manual","Field manual","2025 (uploaded)","1k56jWyb-qA7Sv9Ge4HbpqyZALRFVBQTu","/work/journeys/yamuna-yatra + /now/yamuna"),
 ("CineGreen Manual","Field manual","2025 (uploaded)","1cqmTmsGKuYpAiWr7AtV4oeDTP920AcjG","/work/projects/bridge-the-gap (CineGreen)"),
 ("New Delhi Brochure","Brochure","2025 (uploaded)","1eSI4cOX4f32SeEJo3epndcSPbtbinNfx","/publications or /about"),
]
for t, k, d, drive, page in MANUALS:
    rows7.append([t,k,d,"Swechha","Google Drive","Field methodology",
                  f"Drive ID {drive}", page, "Own material; confirm final version",
                  "Add to /publications AND link from the page it belongs to. Currently absent.","AVAILABLE — DRIVE"])
# Essays
for e in load("content/essay/_index.json"):
    rows7.append([e["title"],"Essay",e["date"],e["byline"],"swechha.in (originally the Swechha blog)",
                  "Climate / environment commentary", f'/stories/{e["slug"]}', "/stories",
                  "Own material — bylined","Already published","READY FOR WEBSITE"])
rows7.append(["Learning to grow with Swechha","Essay","2018-07-24",TC,"old Swechha blog",
              "Reflection", "old blog — recoverable", "/stories",
              "Own material","The SIXTH recovered essay, NOT republished. Publish or formally drop it.","NOT STARTED"])
# Media that must be collected
MEDIA = [
 ("Be the Change","Television series","2007-2008","CNN International","CNN International",
  "Followed Swechha's founder for a year as one of six worldwide changemakers; reported weekly",
  TC,"/about (media archive — DOES NOT EXIST)","THIRD-PARTY COPYRIGHT — link/cite, do not re-host",
  "The single strongest media fact Swechha holds. Currently a clause inside one biography.","NOT STARTED"),
 ("Top 25 youth leaders of India","Magazine feature","2004",TC,"India Today",
  "Youth leadership",TC,"/about (media archive)","THIRD-PARTY COPYRIGHT — thumbnail + citation",
  "Scan needed from the office clippings file","NOT STARTED"),
 ("Top 25 youth leaders of India","Magazine feature","2004",TC,"Outlook",
  "Youth leadership",TC,"/about (media archive)","THIRD-PARTY COPYRIGHT — thumbnail + citation",
  "Scan needed","NOT STARTED"),
 ("Our Time is Now","Publication feature","2004","International Youth Foundation","International Youth Foundation",
  "Profiled as one of the top 25 youth leaders of the world",TC,"/about (media archive)",
  "THIRD-PARTY — link if the publication is online","NOT STARTED","NOT STARTED"),
 ("UN General Assembly address on youth issues in the global south","Speech","2011","Vimlendu Jha","United Nations",
  "Youth and the global south",TC,"/about (media archive)","Check for a UN recording or transcript",
  "A dated, checkable institutional fact","NOT STARTED"),
 ("Jijivisha / Wasted / Disposable — broadcast history","Broadcast record",TC,"Swechha",
  "CNN International, NDTV, BBC, CBC","Waste and the Yamuna",TC,"/stories",
  "THIRD-PARTY BROADCASTERS — cite dates and channels rather than re-hosting",
  "Broadcast dates and channels are the collectible here, not the films — those are already embedded.","NOT STARTED"),
 ("Disposable (film)","Documentary",TC,"Vimlendu Jha",TC,"Solid waste management",
  "NOT FOUND — zero hits across all 148 indexed channel videos","/stories",
  "Own material","Locate the file or confirm it is lost. The site names it as a hole rather than dropping it.","SEARCHING"),
 ("Tatva (film)","Documentary",TC,"Vimlendu Jha",TC,"Climate, water and energy",
  "NOT ON THE SITE — named in one biography only","/stories",
  "Own material","Locate and add, or drop the mention.","SEARCHING"),
 ("Sakhi (film)","Documentary","2021","Swechha",TC,TC,
  "NOT ON THE SITE — 'Sakhi' and 'Ford Foundation' appear on zero built pages","/stories",
  "Check the Ford Foundation credit requirements","Locate the film and the funder credit.","SEARCHING"),
 ("Podcast and masterclass series","Podcast",TC,"Swechha / Green the Map","YouTube (indexed)",
  "Environment and resilience","Indexed in data/media/youtube-index.json","/stories",
  "Own channel","Episodes are indexed and largely unembedded — see master sheet K-06.","AVAILABLE"),
 ("[Any RTI, consultation response, PIL or ministry submission]","Advocacy document",TC,"Swechha",TC,
  "Air / Yamuna / heat / forest","NONE ON SITE","/now/* ('What we do about it')",
  "Check confidentiality","Nothing on the six situation pages shows Swechha acting on a measurement. This is the collection that would fix it.","NOT STARTED"),
]
for m in MEDIA:
    rows7.append(list(m))
write("07-publication-media-archive.csv", COLS7, rows7)
