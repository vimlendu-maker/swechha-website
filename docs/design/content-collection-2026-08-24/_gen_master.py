#!/usr/bin/env python3
"""Emits 01-master-content-collection.csv.

Every row traces to evidence gathered in the 24 August 2026 audit. Nothing here
asserts a Swechha fact that is not already on the site or already in a committed
data file; the rows describe what to COLLECT, not what is true.
"""
import csv, os

OUT = os.path.dirname(os.path.abspath(__file__))

COLS = ["ID","Website Page/URL","Section","Content Gap","Priority","Content Needed",
        "Specific Details Required","Existing on Site?","Existing Internally?",
        "Source/Person to Contact","File/URL Available","Asset Type",
        "Public Permission/Clearance","Recommended Website Use","Status","Notes"]

R = []
def row(*a): R.append(list(a))

# ─────────────────────────── A. TRANSPARENCY & GOVERNANCE ───────────────────────────
row("T-01","/about","New: transparency shelf",
    "Nine annual/activity reports and the 80G certificate are committed to public/docs/ and answer 200 on the live site, but NO page links them. The organisation's entire published transparency record is invisible.",
    "CRITICAL","Editorial decision + a linked list on /about",
    "For each of the 9 files: display title, FY covered, page count, file size, and one line on what it covers. Decide presentation for the two image-only scans (INFLUENCE 2012-13, 80G) and how to state the gap years.",
    "No — files live, links absent","YES — already in repo",
    "Vimlendu / Neeraj (Accounts)",
    "/docs/reports/*.pdf (9), /docs/compliance/80g-certificate.pdf","PDF",
    "Already public on old site; no new clearance needed",
    "A 'Transparency' band on /about listing every report by year with the gaps named",
    "AVAILABLE","Highest credibility per unit of work on this list. Zero collection required — this is a publishing decision, not a hunt.")

row("T-02","/about","Transparency shelf — gap years",
    "Five reports listed on the old About page are 404 at both hosts (2015-16, 2017-18, 2018-19, Me-to-We 2015-16, Registration Certificate) and no 2019-20 or 2021-22 report is listed anywhere.",
    "HIGH","The missing report files, or confirmation they are lost",
    "Search internal drives/email for: Annual Report 2015-16, 2017-18, 2019-20, 2021-22. A 2018-19 .docx IS in the repo — confirm whether it is the final version and whether a PDF exists.",
    "No","PARTIAL — 2018-19 exists as .docx only",
    "Neeraj (Accounts) / Vimlendu","docs/reports/swechha-annual-report-2018-19.docx","PDF / DOCX",
    "TO BE COLLECTED / VERIFIED INTERNALLY",
    "Fill the shelf; state remaining years as gaps rather than omitting them",
    "SEARCHING","Do not paper over gap years. A named gap is more credible than a tidy list.")

row("T-03","/about, footer","Statutory registration",
    "The footer asserts 'Registered Societies Registration Act, 80G, 12A, FCRA Powered' with no registration numbers and no certificate linked, while the 80G certificate PDF is live and unlinked.",
    "CRITICAL","Registration numbers and certificates",
    "Societies Registration Act number and date; 12A registration number; 80G number and validity; FCRA number and validity; registered legal name exactly as on the certificates.",
    "Claim only, in the footer","YES — with Accounts",
    "Neeraj (Accounts)","80G cert in repo; others TBC","PDF + text",
    "Registration numbers are routinely published by Indian NGOs; confirm with Accounts",
    "A compliance line on /about with numbers, beside the report shelf",
    "NEEDS VERIFICATION","An unlinked claim of FCRA/80G status is the one thing an institutional funder checks first.")

row("T-04","/about","New: financial summary",
    "No income or expenditure figure appears anywhere on 35 pages. There is no way to tell whether Swechha is a two-person or a fifty-person operation.",
    "HIGH","Three years of income/expenditure headline figures",
    "FY total income, total expenditure, % to programmes vs admin, and the top funding sources by share, for the last 3 FYs. Source each to the annual report page it comes from.",
    "No","YES — inside the annual reports already on disk",
    "Neeraj (Accounts)","Derivable from /docs/reports/*.pdf","Table / numbers",
    "Already public inside the reports",
    "A short 'Where the money goes' band on /about or /act",
    "AVAILABLE","The numbers are already published inside the PDFs — surfacing them is transcription, not disclosure.")

row("T-05","/about","Governance — Naveen Joshua",
    "One of eight governing-body members has a name and role and no biography. Every other member has one.",
    "MEDIUM","One biography, 100-250 words","Current role/affiliation, qualifications, why he is on this board, and a portrait if he consents.",
    "Name and role only","Possibly — the old /profile/ page had no bio either",
    "Vimlendu / the member directly","No","Text + portrait",
    "Needs his consent","Complete the governing-body list on /about",
    "NOT STARTED","")

row("T-06","/about","Governance — how it works",
    "The board is listed but nothing states how often it meets, what it decides, or how a conflict of interest is handled. Three of eight board members are also staff, which the page notes but does not explain.",
    "MEDIUM","A short governance statement","Meeting frequency, term lengths, how members are appointed, and the policy on staff who also sit on the board.",
    "Partially — overlap is noted",
    "Likely, in the society's rules","Vimlendu / Kuriakose Varghese (board, lawyer)","No","Text",
    "Board sign-off","Two paragraphs under 'Who governs it'",
    "NOT STARTED","Three staff-directors on an eight-person board is normal for a founder-led society but reads badly unexplained.")

row("T-07","/about","New: policies",
    "No child-protection, safeguarding, POSH, or privacy policy is published, on a site whose core work is taking children on residential journeys and to landfills.",
    "HIGH","Existing policy documents","Child protection / safeguarding policy, POSH policy and committee, consent process for photographing minors, data/privacy policy for the two email subscriptions the site runs.",
    "No","LIKELY — required for school partnerships and most funders",
    "Ashim (Programs) / Neeraj","TBC","PDF / text",
    "Should be public",
    "A 'Policies' block on /about; the safeguarding one also belongs on /farm and every journey page",
    "SEARCHING","Schools booking a residential journey will ask for this before they ask about price.")

row("T-08","/act","Giving — no destination",
    "Ruling G-1 stands: there is no payment destination anywhere on the site, so /act's Give ask ends in an email. The old site published two full bank account sets (INDIAN and FCRA) and an 80G FAQ.",
    "CRITICAL","An owner decision on how money is received",
    "Either: (a) a payment gateway/UPI/bank details cleared for publication, or (b) a written decision that giving stays email-mediated. If (a), also the 80G receipting process and the FCRA/domestic split.",
    "No — states the ask, ends in email","YES — the old site published account details",
    "Vimlendu (owner decision) / Neeraj","Old /donate-mainpage had them","Text / gateway",
    "OWNER RULING REQUIRED",
    "Completes the Give band on /act",
    "NOT STARTED","Flagged, not proposed. Bank details are the owner's call. Three different phone numbers were live on the old site; ruling G-4 struck the phone number entirely.")

# ─────────────────────────── B. INSTITUTIONAL HISTORY ───────────────────────────
row("H-01","/about","The record since 2000",
    "A 26-year-old organisation has a four-entry timeline: 2000, 2004, 2016, Now. The homepage version has five (adds 2008). Everything between 2004 and 2016 is blank.",
    "CRITICAL","A real timeline: 15-25 dated entries",
    "For each entry: year, one-line event, and ONE verifiable anchor (a report page, a press item, a photograph, a partner). Candidate years already evidenced elsewhere on the site or in the reports: 2004 first Yatra, 2006 first Yamunotsav, 2007 Pagdandi/riverbank school, 2008 CNN Be the Change, 2010 Influence/volunteering begins, 2012-13 Influence annual report, 2014 last Yamunotsav, 2014 Me-to-We final report, 2015 Khirki book, 2017 She Leads Change begins, 2019-20 200+ schools on year-long curricula, 2021 IGES scenario, 2026 farm.",
    "Yes, 4 entries","YES — the 9 annual reports are a year-by-year record",
    "Vimlendu; extract from /docs/reports/*.pdf",
    "Yes — reports already on disk","Text + one image per entry",
    "Own material","Expand 'The record since 2000' on /about into the site's institutional spine",
    "AVAILABLE","The raw material for this is already in the repo. It needs a reader, not a researcher.")

row("H-02","/about","Founding story — evidence",
    "The founding is told well in prose (2000, We for Yamuna, no funding, no office, one stretch of bank) but carries no artefact: no photograph, no clipping, no first-clean-up record.",
    "HIGH","Founding-era artefacts, 2000-2004",
    "Any photograph of the first clean-ups; the first registration document; the first press mention; names of the founding group; the specific stretch of bank.",
    "Prose only","POSSIBLY — founder's personal archive",
    "Vimlendu (founder archive)","No","Photo / scan / text",
    "Own material","Anchors the founding band on /about and the 2000 cell of the homepage archive strip",
    "SEARCHING","The homepage's 2000-2017 archive cells are ALL placeholders. This row and P-01 are the same hunt.")

row("H-03","/","'The record' band — paper archive",
    "The homepage advertises 'The paper archive, digitised in public — 7/27 years scanned' over a 27-cell year strip. 20 of the 27 cells are placeholder frames. Every year from 2000 to 2017 is a placeholder.",
    "CRITICAL","One representative scanned/photographed item per year, 2000-2017 (+2021, 2024)",
    "Per year: one image (photo, poster, clipping, report cover, letter), the year, a 3-8 word caption, and where it came from. 20 items needed to fill the strip.",
    "7 of 27 years","LIKELY — 'boxes nobody has opened yet', per the site's own copy",
    "Vimlendu / office archive at Khirki Extension","No","Scans / photographs",
    "Own material; check for identifiable minors",
    "Fills the homepage archive strip; also feeds H-01's timeline",
    "NOT STARTED","The site already tells visitors 20 years are unscanned. Closing this converts an admitted absence into the site's best asset.")

row("H-04","/","'Do it yourself' door",
    "The homepage's 'The record' band promises four things and links three. The 'Do it yourself' door — 'Compost, a balcony air-detox garden, a school waste audit, a river walk you can run without us' — has NO href and no page behind it.",
    "HIGH","Four evergreen how-to guides","Compost guide, balcony air-detox garden guide, school waste audit protocol, self-guided river walk. Each: materials, steps, what to expect, roughly how long.",
    "Described, not linked, not built","LIKELY — these are things Swechha teaches weekly",
    "Ashim / Srija / Nikhil (facilitators)","No","Text + diagrams/photos",
    "Own material","A /do or /diy section, linked from the homepage door that already describes it",
    "NOT STARTED","This is the AD-24/AD-25 defect pattern again: copy exists, destination does not. Either build it or remove the door.")

row("H-05","/about, /","Mission and 'Wheel of Change'",
    "The five themes, three pillars and 'Wheel of Change' are stated as a framework with no work attached. A reader cannot tell which project sits under which theme.",
    "MEDIUM","A theme-to-work mapping","For each of the five themes plus 'Building Narratives', list which of the 23 work items belong to it.",
    "Framework stated, unmapped","YES — implicit in the programme structure",
    "Ashim (Programs)","No","Mapping table",
    "Own material","Either map the themes onto WORK, or drop them. An unattached framework reads as boilerplate.",
    "NOT STARTED","The site classifies work by FORM (projects/campaigns/journeys/events), which is the better spine. Do not build a second taxonomy — just attach the themes.")

row("H-06","/about","Awards and recognition",
    "Every award Swechha holds is buried inside one team biography. There is no recognition section anywhere on the site.",
    "MEDIUM","A verified award list",
    "For each: award name, awarding body, year, what it was for, and a link or scan. Already named in bios: India Today & Outlook top-25 youth leaders (2004), International Youth Foundation 'Our Time is Now' (2004), CNN International Be the Change (2007/2008), UN General Assembly address (2011), ELC Bright Promise Award (2018, 57 girls — citation unknown), M. K. Tata Prize and NTPC gold medal (Aruna Pandey), Young Analyst Award EU/DPG (Aruna Pandey).",
    "In bio prose only","YES — founder's records",
    "Vimlendu","No","Text + scans/screenshots",
    "Check whether personal awards may be presented as organisational",
    "A recognition band on /about; the ELC citation belongs on the She Leads Change page",
    "NEEDS VERIFICATION","Distinguish clearly between Vimlendu's personal awards and Swechha's institutional ones. Presenting one as the other is the credibility risk here.")

row("H-07","/about","Organisational scale",
    "Nothing states how many people work at Swechha, how many are full-time, or where the offices are, beyond eight named staff and 'Khirki Extension, New Delhi'.",
    "MEDIUM","Headcount and locations",
    "Full-time staff, part-time/contract facilitators, annual volunteer count, and every physical location (Khirki Extension office, the farm, the Remakery, any field base).",
    "8 names + one address","YES",
    "Neeraj (Admin)","No","Text",
    "Own material","One line on /about; feeds a 'Where we work' element",
    "NOT STARTED","")

# ─────────────────────────── C. WORK: ITEMS WITH NO PAGE ───────────────────────────
def pageless(rid, name, kind, gap, needed, priority="HIGH", notes=""):
    row(rid, "/work/"+kind, name,
        gap, priority,
        "Enough content for a detail page: 400-900 words plus figures and photographs",
        needed,
        "Card on the index only — no page",
        "TO BE COLLECTED / VERIFIED INTERNALLY",
        "Ashim (Programs) / Vimlendu","No","Text + figures + photos",
        "Own material; consent for any identifiable participants",
        "A /work/"+kind+"/<slug> detail page in the same shape as the ten that exist",
        "NOT STARTED", notes)

pageless("W-01","We for Yamuna","campaigns",
    "The organisation's founding campaign, running since 2000, is a card with no page, no dated action, no demand and no photograph. Its whole story on the site is the founding story, which /about tells better.",
    "One dated action and one stated demand — anything that is not the year 2000. Then: is it still running? What has it asked for, of whom? Any measured change it can honestly claim a hand in.",
    "CRITICAL","The site's own declared hole says exactly this. This is the oldest thing Swechha does and the thinnest page about it.")

pageless("W-02","Delhi I Can't See You","campaigns",
    "A name and nothing else: no start date, no demand, no action. The air situation page and the campaigns index both tell readers this is Swechha's campaign on Delhi's air, so the name promises more than the record can keep.",
    "Three sentences: when it started, what it asks for, and one thing it has done. Plus any photograph at all from a real action.",
    "CRITICAL","Named on the homepage and cross-linked from /now/air. The most-promised, least-documented item on the site.")

pageless("W-03","This Girl Can","campaigns",
    "A name and a subject. No start date, no demand, no action. Cannot be distinguished from She Leads Change or ME to WE, which work with the same girls in the same settlement.",
    "Three sentences: when it started, what it asked for, one thing it did. AND a ruling: is this a campaign in its own right, or the public name that She Leads Change / ME to WE campaign under?",
    "HIGH","A 'This Girl Can book' was named and then withdrawn under AD-26 R-2 because no file was ever found. If a file exists, it changes both this row and /publications.")

pageless("W-04","No more Waste Hills","campaigns",
    "Names a target and nothing else: no year, no landfill, no demand, no outcome. A CityScapes walk goes to a landfill edge and there is a photograph of it, but no stated link between the two.",
    "Which hill (Ghazipur, Bhalswa, Okhla?), what was asked and of whom, what year. And whether the CityScapes landfill walk is part of this campaign.",
    "HIGH","If the walk is part of it, this campaign has been running in plain sight with a usable photograph already on file.")

pageless("W-05","No Plastic","campaigns",
    "A clear demand with no record behind it: no year, no target, no outcome. The site cannot say whether this is about a ban, a substitution, or a shop — three different campaigns.",
    "Which of the three it is; when it ran; what it changed. A refusal counts as an outcome.",
    "HIGH","Likely connected to the GIZ Sustainable Shopping Basket (2010) already on /publications, and to the Marine Litter / EPR work with GIZ+MoEFCC that has no page at all (see W-16).")

pageless("W-06","Park Restoration","campaigns",
    "No date, no site list, no demand. Eco Action holds all the park figures (70+ butterfly parks, 20+ herb gardens, the Vasant Kunj decade); this campaign holds none of them.",
    "A ruling first: is this the same work as Eco Action under a second name? If yes it becomes a section of that page. If no: one park, one year, one thing that was asked for.",
    "HIGH","A merge is a perfectly good answer here and is cheaper than a page.")

pageless("W-07","Sustainable Shopping","campaigns",
    "No date, no demand, no audience. And Green the Map — which the homepage explicitly labels NOT a Swechha programme — sells sustainable goods, so a reader will assume a connection the site never addresses.",
    "Who it spoke to and what it asked them to buy instead; the years it ran; and ONE line on whether it is connected to Green the Map.",
    "HIGH","The GIZ Sustainable Shopping Basket guide (2010) on /publications is almost certainly this campaign's artefact and is not linked to it.")

pageless("W-08","Yamunotsav","events",
    "Nine editions of a river festival, June 2006-2014, and not one photograph or account on the site. The site's own note says the frames sit in a Drive folder that will not open.",
    "ACCESS to the Yamunotsav Drive folder. Then: what happened at one, roughly how many people came, and one sentence on why 2014 was the last — and whether it is coming back.",
    "CRITICAL","The site's own words: 'Nine Junes of a river festival is the best unshown material Swechha has.' Getting that folder open is one of the highest-value single actions on this whole list.")

pageless("W-09","Cyclothon","events",
    "Has been run; the site cannot say when, where, or how many times. 43 words of data total.",
    "One line on what happens, roughly how many editions, which years, and the Cyclothon archive folder.",
    "MEDIUM","")

pageless("W-10","Greenathon","events",
    "No record beyond the name. 42 words of data total.",
    "One line on what happens, roughly how many editions, which years, and any photographs.",
    "MEDIUM","")

pageless("W-11","Yamuna Shramdaan","events",
    "The site cannot say when one last ran, how many have run, or which stretch of bank. 52 words of data total. Meanwhile /act asks people to turn up to clean-ups.",
    "One line, the Shramdaan archive folder, which bank stretches, and — critically — whether they still run, since /act's volunteer ask depends on it.",
    "CRITICAL","/act deliberately publishes no calendar BECAUSE all four event formats carry this hole. Closing it unblocks the volunteer ask on the site's most-linked-to page.")

pageless("W-12","She Leads Change","projects",
    "Has three sourced figures but no page. Runs on the same settlement, with the same partner (EMpower), in the same age group as ME to WE, and the site cannot say how the two differ.",
    "One sentence of difference from ME to WE (or a merge); a current cohort size; and the citation for the 2018 ELC Bright Promise Award given to 57 girls.",
    "HIGH","Three sourced figures already exist — this is close to page-ready.")

pageless("W-13","Food systems, with UNEP","projects",
    "Sits under a heading that reads 'What is running' while the site's own sentence about it is in the future tense. UNEP's role is unstated: funder, technical partner, or co-designer.",
    "Has it started? A start date and a school count. One word for UNEP's role. One dated first deliverable.",
    "CRITICAL","A UNEP association is one of the strongest credibility signals on the site and it is currently a sentence in the future tense on a page titled 'What is running'.")

# ─────────────────────────── D. WORK: PROGRAMMES WITH NO PRESENCE AT ALL ───────────────────────────
def missing(rid, name, dest, gap, needed, priority="HIGH", notes=""):
    row(rid, dest, name, gap, priority,
        "A decision on whether it belongs on the site, then a page or a section",
        needed, "No — old URL redirects to a parent index",
        "YES — the old site carried a full page","Ashim / Vimlendu",
        "Old WordPress page text captured in docs/legacy/","Text + figures + photos",
        "Own material","Either a /work item or a section of an existing page",
        "NOT STARTED", notes)

missing("M-01","The Remakery","/work/projects",
    "The upcycling shop and workshop space is named on the homepage and /about, is where a named staff member works, and has no page. /remakery 404s on the live site.",
    "What it is, where it is, when it opened, the weekly 'One Night Stand' events, what it makes, who runs it, and whether it is open now. A 2025-09-03 post exists about it reopening after eight months.",
    "CRITICAL","Named on two pages, staffed by Nikhil per his own bio, and 404 at its own URL. The clearest case of a real thing with no page.")

missing("M-02","Teacher Training","/work/projects",
    "700+ educators trained per the old site, with no page. Teacher training is currently one bullet inside Bridge the Gap.",
    "Verified number of teachers trained, over what period, in which schools, what the training covers, and whether it runs standalone or only inside Bridge the Gap.",
    "HIGH","A teacher-training figure is one of the few things that converts 'reach' into 'effect' — the gap Bridge the Gap's own hole names.")

missing("M-03","Green Finance (with IGES)","/work/projects",
    "A study of 93 social enterprises — the longest project page on the old site — with no presence on the new one. It pairs directly with the IGES publication already on /publications.",
    "Study period, method, what the 93 enterprises were, findings, and the published output. Confirm the relationship to the IGES Future Lifestyles report already hosted.",
    "HIGH","Swechha's only primary research is already on /publications. This is the project behind it and is invisible.")

missing("M-04","Circular Economy / Marine Litter & EPR (GIZ + MoEFCC)","/work/projects",
    "Indo-German bilateral cooperation with a government ministry, and 10 single-use-plastic-alternative infographics — none of it on the site. 8 GIZ marine images sit unused in public/images/giz-marine/.",
    "Project period, GIZ's and MoEFCC's roles, the deliverables, and clearance to use the GIZ/MoEFCC names and the infographics.",
    "HIGH","A named ministry collaboration is the strongest governmental credibility signal available, and the assets are already in the repo but unused.")

missing("M-05","Women & Non-Traditional Livelihoods (Udaan, MOM, Lunchbox 17)","/work/projects",
    "A livelihoods programme with named enterprises, a British Council partnership and a 25,000-meals-in-a-year figure that became Million Kitchen. Entirely absent. None of these words appears on any built page.",
    "Programme years, the British Council YWSEDP relationship, what Udaan / MOM candles / Lunchbox 17 were, the 25,000 meals figure and its source, and what happened when it became Million Kitchen.",
    "HIGH","This is the only outcomes-with-names-and-numbers livelihood story in the archive and it is the largest single omission after the events.")

missing("M-06","Pagdandi (2007 origin of ME to WE)","/work/projects",
    "The 2007 open-air school on the Yamuna at Kudsia Ghat, the Jagdamba Camp school, the Kitaab Ghar library and the Right to Education campaign that got 150+ children into formal schools. 'Pagdandi' and 'Kitaab Ghar' appear on zero built pages.",
    "The 2007 start, what Pagdandi was, the Kitaab Ghar library, the RTE campaign and the 150+ children figure with its source. This is ME to WE's origin story.",
    "HIGH","ME to WE's page names alumni who are now staff but shows nothing of the riverbank school this grew out of. This is the missing first chapter of the site's best-written page.")

missing("M-07","Films & Documentaries (Jijivisha, Wasted, Disposable, Tatva, Sakhi)","/stories",
    "The films are on /stories as embeds, but the PROGRAMME — broadcast on CNN International, NDTV, BBC and CBC, and Sakhi (2021) with Ford Foundation support — has no account. 'Ford Foundation' and 'Sakhi' appear on zero built pages. 'Disposable' returns zero hits across all 148 indexed videos.",
    "Broadcast history with dates and channels; the Ford Foundation relationship for Sakhi; a file or link for Disposable and for Tatva; director/producer credits.",
    "HIGH","National and international broadcast is a hard, checkable credibility fact and it is currently on the site only as a clause inside one bio.")

missing("M-08","The five farm training programmes","/farm",
    "Bee Keepers Collective, Composting & Micro-enterprises, Soil Regeneration, Sustainable Agriculture Training Camps, Women Farmers Collective — all five had old project pages, all five redirect to /farm, and /farm describes none of them as a programme.",
    "For each: what it trains, who attends, how many have been through it, which years, and any partner. Note that one old counter (9,385 'Rural Youth Engaged' on soil-regeneration) is contaminated placeholder data and must not be reused.",
    "HIGH","/farm currently reads as a place. These five would make it a place that runs programmes — which is what a funder or a partner school is actually assessing.")

missing("M-09","Learning Communities","/work/projects",
    "Named on /impact and on three built pages, with no page of its own. Its old counter (9,385 'Campaigns') is contaminated placeholder data.",
    "What it is, which communities, which years, and how it relates to She Leads Change's '300 girls in the wider Learning Communities cohort' figure already published.",
    "MEDIUM","A published figure on the site already refers to this programme by name.")

missing("M-10","Green Creeps, Road to Leadership, Brake Even, Micro Grants, Green Exposures, Future Lifestyles, Air Pollution Campaigns, Cycles for Sustainability, Green the Map (as a project)","/work",
    "Nine further old programme pages redirect to a parent index with nothing behind them. 'Pagdandi', 'Brake Even', 'Udaan', 'Million Kitchen' and 'Sakhi' appear on zero built pages.",
    "A triage decision per programme: (a) real and still relevant → collect content, (b) real but finished → one line in the timeline (H-01), (c) never really ran or folded into another → record the decision and leave the redirect. Do not build nine thin pages.",
    "MEDIUM","Triage first. The instruction here is explicitly NOT to add content to make the site longer — several of these belong in the timeline, not on a page.")

# ─────────────────────────── E. WORK: DECLARED HOLES ON EXISTING PAGES ───────────────────────────
def hole(rid, page, sect, gap, needed, priority="HIGH", who="Ashim (Programs)", notes=""):
    row(rid, page, sect, gap, priority, "One specific fact or artefact", needed,
        "Named as a hole on the page","TO BE COLLECTED / VERIFIED INTERNALLY",
        who,"No","Text / number / photo","Own material",
        "Closes a hole the page already declares to the reader","NOT STARTED", notes)

hole("D-01","/work/projects/bridge-the-gap","Impact",
    "The headline '3M+ children reached' is a derivation, not a count: schools per year x years x children per school. The middle term is written down nowhere.",
    "ONE year's roll from ONE school. That turns the multiplier from an assumption into a measurement and the 3M from a derivation into a count.",
    "CRITICAL","Neeraj / any partner school",
    "3M+ is the largest number on the site and appears on the homepage. One school roll is all it needs.")

hole("D-02","/work/projects/bridge-the-gap","Impact — effect",
    "The page counts schools and students. It does not publish what changed in one school after the sixteenth session.",
    "Follow-up from a single school at any scale: a teacher's account, a before/after waste audit, a garden that survived, an action project that continued.",
    "CRITICAL","Ashim (Programs)",
    "The site's own note: this is 'the only figure a parent actually wants'.")

hole("D-03","/work/projects/bridge-the-gap","CineGreen and Ride the Van",
    "Two leadership journeys that ran inside the year-long curricula across 200+ schools in 2019-20 are named on the site and described nowhere on earth.",
    "Two paragraphs each: what they were, who they were for, what happened.","HIGH","Ashim (Programs)",
    "A CineGreen Manual exists on the old Resources page (Drive) — see K-04.")

hole("D-04","/work/projects/eco-action","Photographs",
    "Not one photograph of a butterfly park, a herb garden, or the Vasant Kunj park that went from 5% to 90% green cover over a decade. The frame currently used is a planting site, not one of these gardens.",
    "Three frames: one butterfly park, one herb garden, and Vasant Kunj then AND now. Plus the park's actual name and the decade's start year.",
    "CRITICAL","Ashim / Naveen",
    "The site's own words: 'would make this the strongest page in the section. The text is already there.' A genuine before/after of 5% to 90% green cover is the single best visual asset available anywhere in this audit.")

hole("D-05","/work/projects/eco-action","Park count",
    "The page says 70+ butterfly parks; elsewhere Swechha's own material has said 78. The lower figure is published deliberately.",
    "A current count with a date, and the same for herb gardens.","HIGH","Ashim (Programs)","")

hole("D-06","/work/projects/influence","The fellows",
    "Ten fellowships a year since 2010 — roughly 150 fellows — and not one is named, no project is described, and no film or case study has been located.",
    "For 5-10 featured fellows: name, city/state, fellowship year, the project they ran, one outcome, a portrait, a 50-word update, and written permission. Plus: the length of a fellowship year, which is not stated because nobody has said.",
    "CRITICAL","Ashim (Programs) / alumni network",
    "The largest named-people gap on the site. A fellowship with no fellow on it reads as a line item.")

hole("D-07","/work/projects/influence","50 colleges, 75 partner organisations",
    "Two published counts sit behind the volunteering programme and the page names none of the organisations.",
    "Five college names and five partner-organisation names, WITH permission to list them. Plus a current year on any one of the five volunteering figures, which are all dated to 2010.",
    "HIGH","Ashim (Programs)","Turns two counts into a list of collaborators, which is what they are.")

hole("D-08","/work/projects/me-to-we","Alumni who became staff",
    "The page's strongest claim about the organisation — that alumni are now core team members — names nobody.",
    "Two names with their written permission, their story in 60-100 words, and a portrait.",
    "CRITICAL","Ashim / the alumni themselves",
    "The site's own note: 'would turn the strongest claim we make about ourselves into a person a reader can look at.'")

hole("D-09","/work/projects/me-to-we","Photographs",
    "Nothing of the riverbank school, nothing of the Jagdamba group, no face on any alumnus. The frame used is of schoolchildren but not of this programme.",
    "Any frame from the camp or the riverbank, with consent.","CRITICAL","Ashim / Vimlendu",
    "The site calls this 'the best-written unillustrated thing on the site'.")

hole("D-10","/work/projects/me-to-we, /work/projects (she-leads-change)","Programme boundaries",
    "ME to WE and She Leads Change both run on Jagdamba, both with EMpower, both with girls in the same age group, and the site does not say how they differ. This Girl Can may be a third name for the same work.",
    "One sentence of difference — or a ruling that two or three of them are one programme, which is a shorter and equally good answer.",
    "HIGH","Ashim (Programs)","")

hole("D-11","/work/projects/farm-school","Partners and funders",
    "Nobody is named as a partner or funder. Bridge the Gap names seven funders; this page names none.",
    "The supporter list for Farm School: who paid for what, and in which years.","HIGH","Neeraj / Vimlendu","")

hole("D-12","/work/campaigns/monsoon-wooding","Survival rate",
    "The page publishes '50,000+ trees planted AND SURVIVED' but cannot state a survival rate, because the planted total is not written down anywhere citable. Nor is the interval at which survival is counted.",
    "Two numbers: how many went into the ground, and how long after planting the count is taken.",
    "HIGH","Naveen (Farm) / Ashim",
    "With those, the page states a survival rate — a far stronger and rarer claim than a planting total.")

hole("D-13","/work/campaigns/monsoon-wooding","Planting sites",
    "Sites are spread across Delhi and no geo-locations are held, so there is nowhere a reader can go and stand.",
    "Coordinates, or even a neighbourhood list, for the seasons that can still be reconstructed.","MEDIUM","Naveen / Ashim",
    "Feeds a 'Where we work' map (see structural recommendation S-04).")

hole("D-14","/work/journeys/yamuna-yatra","The route",
    "The page is named after a route it cannot draw. Both ends are known (Yamunotri to Agra, ~1,000 km) but the stops between are published nowhere checkable; a ten-stop route on an older draft appears in no verifiable document.",
    "Confirmation of the ten stops.","HIGH","Vimlendu / Naveen",
    "Unlocks a route map on the site's flagship journey.")

hole("D-15","/work/journeys/yamuna-yatra","Cohort measurements",
    "Twelve days on a river and not one measurement of it taken by the people who walked it.",
    "Any water readings cohorts took, in any year — even a notebook.","MEDIUM","Ashim / facilitators",
    "Would put the river's own numbers beside the walk and connect /work to /now/yamuna, which is the site's whole argument.")

hole("D-16","/work/journeys/gram-anubhav","Host organisations",
    "More than a hundred grassroots organisations host these journeys and not one is named.",
    "Five host organisations named, with permission.","HIGH","Ashim (Programs)",
    "The site's own note: 'it is their programme as much as ours.'")

hole("D-17","/work/journeys/gram-anubhav, /work/journeys/naturescapes","Start year",
    "Both publish '60+ journeys' with no start year, so both are totals rather than rates.",
    "One year each.","MEDIUM","Ashim (Programs)","Trivially cheap, and it fixes two figures.")

hole("D-18","/work/journeys/naturescapes","Sariska",
    "Sariska is on the destination list and on nothing else held: no photograph, no account, no journal. A NatureScapes Manual for Sariska exists on the old Resources page.",
    "Confirmation that Sariska is still a destination, plus the Sariska manual (Drive ID in the legacy audit).",
    "MEDIUM","Ashim (Programs)","")

hole("D-19","/work/journeys/cityscapes","Per-walk records",
    "A thousand walks and a hundred thousand people, and the site cannot say which of the six walks people actually ask for. Two of the six walks have no photograph at all.",
    "Any per-walk count; a walk name against each surviving frame; and any photograph of the heritage walk or the restoration park.",
    "HIGH","Ashim (Programs)",
    "Thirteen frames catalogued as photographs of these walks were withdrawn as synthetic on 2026-08-22. What is left is real but unlabelled.")

# ─────────────────────────── F. PARTNERS, FUNDERS, SCHOOLS ───────────────────────────
row("P-01","Site-wide","Partners and funders",
    "Twenty organisations are named site-wide, all buried inside five item pages. There is no partner page, no logos, no years, no description of any relationship, and no permission record.",
    "HIGH","A partner register",
    "For each of the 20 already named (Bupa Foundation, Acuity Knowledge Partners, Sir Ratan Tata Trust, Nokia Siemens Networks, American Express, National Geographic, Adobe, PVR, Amazon, The American Embassy, EMpower, IndusInd Bank, PwC, S&P Global, UNEP, British Council, The European Union, plus GIZ and IGES from /publications and UNV from a bio): relationship type, project, years, one line, logo file, website, and WRITTEN permission to display the logo.",
    "Names only, no context","PARTIAL — Accounts will hold the grant records",
    "Neeraj (Accounts) / Vimlendu","No logos in repo","Logos + text",
    "PERMISSION REQUIRED PER ORGANISATION — this is the blocking step",
    "See structural recommendation S-02","NOT STARTED",
    "Add a 'Should this be publicly featured?' decision per row before any design work. Some funder relationships are deliberately quiet.")

row("P-02","Site-wide","Partners — completeness",
    "The funder list is almost certainly incomplete: it was assembled from two pages. Nine annual reports on disk list donors year by year.",
    "HIGH","The full historical funder list","Extract the donor/funder list from each of the 9 annual reports and reconcile into one register with years.",
    "No","YES — inside the reports already in the repo",
    "Neeraj (Accounts)","/docs/reports/*.pdf","Table",
    "Already published inside the reports; display is a separate decision",
    "Feeds S-02","AVAILABLE","Again: the material is already in the repo. This is transcription.")

row("P-03","Site-wide","Schools",
    "Bridge the Gap claims 250+ schools over fifteen years and 100-150 every year. FIVE school names appear anywhere on the site (Vasant Valley, Shriram, Pathways World, Modern, and 'The Shriram Schools').",
    "CRITICAL","A school register",
    "Per school: name, city, state, programme, year(s), number of participants, key activity, photos available, permission status. Start with the 20-30 longest-running partner schools rather than attempting 250.",
    "5 names","YES — programme records must exist to run 100-150 schools a year",
    "Ashim (Programs)","No","Table + logos/photos",
    "SCHOOL PERMISSION REQUIRED per institution — many schools will not permit naming",
    "See structural recommendation S-05","NOT STARTED",
    "Do not chase all 250. Twenty named schools with permission is far more convincing than a claim of 250 and a list of five.")

row("P-04","/work/projects/bridge-the-gap","Schools — the anchor school",
    "No single school relationship is told as a story anywhere on the site, despite fifteen years of them.",
    "HIGH","One or two anchor-school case studies",
    "One school that has run the curriculum for 5+ years: how it started, what it runs now, what the teachers say, what changed, one named teacher quote with permission, and photographs.",
    "No","LIKELY","Ashim (Programs)","No","Case study + photos + quote",
    "School and teacher permission required","A case study on /work/projects/bridge-the-gap",
    "NOT STARTED","This single asset would close D-02 as well.")

row("P-05","Site-wide","Testimonials and voices",
    "Across 35 pages, not one student, teacher, fellow, villager, volunteer or partner is quoted. There is no first-person voice anywhere on the site except the staff bios.",
    "HIGH","8-12 short attributed quotes",
    "Target mix: 2 students, 2 teachers, 2 fellows, 2 village hosts, 1 volunteer, 1 funder. Each: exact words, name, role, place, year, written permission, and a portrait if consented.",
    "No","POSSIBLY — in reports and social media",
    "Ashim / Srija / Anushka","No","Text + portraits",
    "Written consent required for each",
    "Distribute across work pages, /farm and /impact — do NOT build a testimonials page",
    "NOT STARTED",
    "The site's editorial voice is deliberately austere; quotes must be real and specific or they will read worse than the current silence.")

# ─────────────────────────── G. PHOTOGRAPHY ───────────────────────────
def photo(rid, page, subj, gap, needed, priority="HIGH", orient="Landscape", notes=""):
    row(rid, page, subj, gap, priority, "Photographs", needed,
        "No / insufficient","TO BE COLLECTED / VERIFIED INTERNALLY",
        "Vimlendu (archive) / Ashim / facilitators","No",
        "Photograph — "+orient+", min 2000px on the long edge, EXIF intact",
        "Owner has permitted use of Swechha photographs (ruling W-14, 21 Aug 2026); check for identifiable minors",
        "Replaces a placeholder or an unillustrated section","NOT STARTED", notes)

photo("F-01","/work/journeys/gram-anubhav","Gram Anubhav — any real frame",
    "Sixty journeys run and the page has ZERO genuine photographs. Twelve files filed under it were found to be synthetic and withdrawn — they carry page borders, hands merging into tools, and captions naming states the journey does not go to.",
    "One real frame per activity: shramdaan, a village interaction, a home visit, a cultural evening. Four frames minimum. Uttarakhand, Rajasthan, Gujarat or Himachal.",
    "CRITICAL","Landscape","Sixty journeys have been run, so the photographs exist somewhere. What is on file is not them.")

photo("F-02","/work/journeys/naturescapes","NatureScapes destinations",
    "Every frame on the page is a real Swechha frame and not one is of the six destinations. The only pictures held of those were bought from a stock library and are refused by the build.",
    "One Swechha frame per ecosystem: Sariska, Ranthambore, Mukteshwar/Sirmaur, Jim Corbett, Sunderbans, Jaisalmer. From the 60+ journeys already run.",
    "CRITICAL","Landscape","Five stock files are flagged and refused in the catalogue specifically so they cannot be used by accident.")

photo("F-03","/work/projects/eco-action","Butterfly parks and Vasant Kunj",
    "No photograph of any of 70+ butterfly parks or 20+ herb gardens, and neither the before nor the after of the park that went from 5% to 90% green cover.",
    "Three frames: one butterfly park, one herb garden, and Vasant Kunj THEN and NOW (two frames, same viewpoint if possible).",
    "CRITICAL","Landscape","The before/after pair is the highest-value single image asset in this entire audit.")

photo("F-04","/work/projects/me-to-we","Riverbank school and Jagdamba",
    "Nothing of the 2007 riverbank school at Kudsia Ghat, nothing of the Jagdamba group, no face on the alumni who became staff.",
    "Any frame from the camp or the riverbank, any year, with consent. Plus portraits of the two alumni named under D-08.",
    "CRITICAL","Landscape + portraits","")

photo("F-05","/work/events (all four)","Events — any photograph",
    "Yamunotsav ran nine times and has no photograph. Cyclothon, Greenathon and Yamuna Shramdaan have none either. The events section is four unillustrated stubs.",
    "ACCESS to the Yamunotsav Drive folder first (it will not currently open). Then 3-5 frames per event.",
    "CRITICAL","Landscape","The single highest-value archive unlock on this list. Nine Junes of a river festival.")

photo("F-06","/","Paper archive strip, 2000-2017",
    "Twenty of the 27 year-cells on the homepage archive strip are placeholder frames. The first eighteen years of the organisation have no image.",
    "One image per year for 2000-2017, plus 2021 and 2024. Photograph, poster, clipping, letter or report cover — anything genuine and datable.",
    "CRITICAL","Landscape preferred","See H-03. This and the timeline (H-01) are one collection exercise.")

photo("F-07","/work/journeys/cityscapes","Heritage walk and restoration park",
    "Two of the six CityScapes walks have no frame at all, and the surviving frames are not labelled by which walk they were taken on.",
    "One frame each of the heritage walk and the restoration park, plus a walk name against every existing CityScapes frame.",
    "HIGH","Landscape","Thirteen frames were withdrawn as synthetic on 2026-08-22, which is why the set is thin.")

photo("F-08","/about","Team and board portraits",
    "Eight staff portraits exist. The eight governing-body members have a `photo_unused` record pointing at old WordPress files, and none is displayed.",
    "Eight board portraits at usable resolution, with each member's consent. The existing sources are 338x232 and too small.",
    "MEDIUM","Portrait / square","")

photo("F-09","/farm","Farm — the change",
    "/farm opens on 'Nothing grew here' and tells a barren-land-to-food-forest story, but carries no before frame of the barren ground.",
    "The land before planting (any year), the same viewpoint now, and frames of each named system: nursery, dairy, apiary, vermicompost, hydroponics, mud houses, butterfly garden.",
    "HIGH","Landscape","A genuine before/after here would do the same work as F-03.")

photo("F-10","Site-wide","Portrait-orientation frames",
    "The photo library is heavily landscape, and the audit record shows portrait files being placed in letterbox bands and rendering as slivers — a defect that has already shipped once.",
    "When shooting or selecting new frames, deliberately capture some true-landscape wide frames (2400x1600 or wider) for masthead bands. Confirm EXIF orientation is 1, not 6.",
    "MEDIUM","Landscape, 3:2 or wider",
    "A prior perf pass shipped seven photos rotated 90 degrees by stripping EXIF orientation without rotating pixels. Any bulk photo intake must apply exif_transpose.")

photo("F-11","Site-wide","Campaign posters and creatives",
    "Eleven posters by Sandip Paul are on /stories. No campaign poster, banner, placard or creative from any of the eight campaigns is on the site.",
    "Poster and creative scans per campaign, with the designer credited and the year recorded. The 10 GIZ single-use-plastic-alternative infographics are a known set.",
    "MEDIUM","Portrait / poster","8 GIZ marine images already sit unused in public/images/giz-marine/.")

photo("F-12","Site-wide","Press clippings",
    "No newspaper clipping, magazine page or broadcast still appears anywhere on the site.",
    "Scans of significant press: the 2004 India Today and Outlook features, any Yamuna Yatra coverage, any Yamunotsav coverage. Record publication, date and page.",
    "HIGH","Portrait / scan","See J-01. The old site's 'In the News' archive was verified to be 59 empty headline shells with no scans — so these must come from the office, not the web.")

# ─────────────────────────── H. PUBLICATIONS & KNOWLEDGE ───────────────────────────
row("K-01","/publications","Field manuals",
    "Six documents on the old Resources page — all Drive-hosted, all public, all uploaded August 2025 — are absent from /publications, which carries three items.",
    "HIGH","Six documents and a ruling on each",
    "NatureScapes Manual (Sirmaur), NatureScapes Manual (Sariska), Yamuna Manual, CineGreen Manual, New Delhi Brochure — Drive IDs are recorded in docs/design/2026-08-22-LEGACY-SITE-CONTENT-AUDIT.md §1.2. The IGES scenario from that list is ALREADY published.",
    "3 of 9","YES — on Google Drive, public",
    "Ashim / Vimlendu","Drive IDs recorded in the legacy audit","PDF",
    "Own material; confirm the manuals are final versions",
    "Add to /publications, and link each manual from the journey page it belongs to",
    "AVAILABLE","AD-26 R-1/R-2 fixed Publications at two items on the evidence then available; a third has since been added. Six more real files exist. This needs a re-ruling, not a hunt.")

row("K-02","/publications","Annual reports as publications",
    "Nine annual reports sit in public/docs/ and /publications does not list them. See T-01.",
    "CRITICAL","A decision on where reports live",
    "Whether the reports belong on /about (transparency) or /publications (knowledge), or both. Recommend /about, cross-linked from /publications.",
    "No","YES — in the repo","Vimlendu","/docs/reports/*.pdf","PDF",
    "Already public","Resolve alongside T-01","AVAILABLE","")

row("K-03","/publications","Accessibility of the scans",
    "Two of the recovered documents are image-only scans with zero embedded fonts — the INFLUENCE Annual Report 2012-13 (24 pages) and the 80G certificate. They are unreadable to a screen reader and unsearchable.",
    "MEDIUM","OCR or a transcribed summary",
    "Run OCR, or write a 150-word summary to sit beside each. For the 80G certificate, a transcription of the registration details is sufficient and arguably better.",
    "Files present, not surfaced","YES","Whoever surfaces T-01","In repo","PDF + text",
    "Own material","Publishing a tax-exemption certificate as an unlabelled image is an accessibility defect, not a neutral choice.",
    "NOT STARTED","")

row("K-04","/stories","Written — nothing since August 2023",
    "All five published essays are dated 2022-08 to 2023-08. The site has published no new writing in two years. A sixth recovered essay ('Learning to grow with Swechha', 2018) was not republished.",
    "HIGH","New writing, and a decision on the sixth essay",
    "A publishing cadence and 3-4 new pieces. Best candidates from work already done: the Vasant Kunj decade, the Yamunotsav story, a fellow's project, a Gram Anubhav host's account. Plus: publish or formally drop the 2018 essay.",
    "5 essays, all 2022-23","The 2018 essay text is recoverable",
    "Ashim / Srija / Anushka / Chhavi","Old blog","Text",
    "Own material","Keeps /stories alive; each new essay is also a timeline anchor",
    "NOT STARTED","The essays are the only bylined writing on the site and the byline is what makes them credible. Keep bylines.")

row("K-05","/stories","Films — two ruled films have no source",
    "Of six ruled films, 'Disposable' returns zero hits across all 148 indexed videos, and 'Yatra' is not a film (only two School Journeys shorts match). Both are named as holes rather than dropped.",
    "MEDIUM","Files or links for the two missing films",
    "A file, a link, or a written confirmation that Disposable is lost. Same for whatever 'Yatra' was meant to be. Vimlendu's bio names 'Tatva' as a fourth film, which appears on one page and has no entry.",
    "Named as holes","POSSIBLY — founder's archive","Vimlendu","No","Video",
    "Own material","Completes the films list on /stories","SEARCHING",
    "Do not print a film count that includes the two unsourced titles.")

row("K-06","/stories","148 indexed videos, ~8 used",
    "The YouTube channel's full 148-video index is committed to the repo and roughly eight videos are embedded on the site. 140 videos of archive footage are indexed and unused.",
    "MEDIUM","A curation pass over the index",
    "Review data/media/youtube-index.json and identify which videos belong on which work page. Many are titled by journey, event or campaign and would illustrate pages that currently have no photographs.",
    "Indexed, mostly unused","YES — in the repo",
    "Ashim / Anushka","data/media/youtube-index.json","Video embeds",
    "Own channel","Embed relevant videos on the work pages that have no images",
    "AVAILABLE","This is the cheapest way to put moving evidence on the thirteen pageless items — several of them almost certainly have footage in the index.")

# ─────────────────────────── I. MEDIA & PUBLIC VOICE ───────────────────────────
row("J-01","Site-wide","Media coverage of Swechha — none",
    "There is NO record anywhere on the site of Swechha having been covered by anyone. The six coverage-*.json files measure press attention to the ISSUES (Delhi air, the Yamuna), explicitly never to Swechha. The old site's 'In the News' archive was verified as 59 empty headline shells with no scans.",
    "CRITICAL","A media archive built from scratch",
    "Per item: headline, publication, date, author, URL or scan, topic, and which page it belongs beside. Known anchors to start from: CNN International Be the Change (2007, reported weekly for a year, 6 changemakers worldwide); India Today and Outlook top-25 youth leaders (2004); International Youth Foundation 'Our Time is Now' (2004); UN General Assembly address (2011); NDTV, BBC and CBC broadcasts of the documentaries.",
    "No","POSSIBLY — a physical clippings file",
    "Vimlendu (founder archive) / office at Khirki Extension","No","Scans + links",
    "Copyright: link and cite rather than reproducing article text; a scan thumbnail plus headline and outlet is the safe pattern",
    "See structural recommendation S-03","NOT STARTED",
    "Twenty-six years of an outspoken Delhi environmental organisation and zero press evidence on the site is the largest single credibility gap in this audit.")

row("J-02","/about","Media contact",
    "There is a media enquiry mailto on /about, but no press kit, no boilerplate, no logo pack, and no spokesperson listing.",
    "MEDIUM","A small press kit",
    "One-paragraph organisational boilerplate, founding year, registered name, spokesperson names and areas, logo files in usable formats, and 5-10 cleared photographs with captions and credits.",
    "Email link only","PARTIAL — logos exist in public/brand/",
    "Vimlendu / Anushka","public/brand/*.svg","Logos + text + photos",
    "Own material","A press kit block on /about",
    "NOT STARTED","The situation pages are genuinely newsworthy and there is currently no easy path from a journalist to a usable asset.")

row("J-03","Site-wide","Broadcast and speaking record",
    "TV appearances, podcasts, panels and speeches exist per the bios but are recorded nowhere as an institutional record.",
    "MEDIUM","A speaking and broadcast list",
    "Per item: event/programme, date, platform, topic, speaker, and a link or recording. The site already indexes podcast videos on its own channel.",
    "No","POSSIBLY","Vimlendu / Anushka","Partly in the YouTube index","Links + video",
    "Third-party platforms — link, do not re-host","Feeds S-03","NOT STARTED","")

row("J-04","/now/*","Situations — Swechha's own advocacy",
    "The six situation pages are the site's strongest asset and each carries a 'What we do about it' section. None of them documents an advocacy action, a submission, a representation or a policy engagement by Swechha on that issue.",
    "HIGH","Advocacy record per situation",
    "Any RTI filed, consultation response, PIL, ministry submission, parliamentary engagement, or official meeting on air, the Yamuna, heat, forest fire, forest loss or extreme rain. Date, addressee, what was asked, what happened.",
    "Work is linked; advocacy is not","TO BE COLLECTED / VERIFIED INTERNALLY",
    "Vimlendu / Kuriakose Varghese (board, lawyer)","No","Documents + text",
    "Check whether any submission is confidential",
    "Connects the measurement pages to the organisation that made them",
    "NOT STARTED","The situation pages currently prove Swechha can MEASURE. Nothing on them proves Swechha has ever ACTED on a measurement, which is the obvious next question a reader asks.")

# ─────────────────────────── J. IMPACT NUMBERS ───────────────────────────
row("N-01","/","Homepage figures not in the register",
    "The homepage's 'Swechha's own record' band shows four numbers and links to '/impact — The whole record'. Two of the four — 6,890 tonnes 'Out of the Yamuna' and '100+ green infrastructures across 100+ schools' — do not appear in /impact's register or anywhere in data/work.",
    "CRITICAL","Source both figures, or withdraw them",
    "For 6,890t: what was weighed, over what period, by whom, and where it is recorded. For 100+ green infrastructures / 100+ schools: definition of a 'green infrastructure', the period, and how it relates to Eco Action's 70+ parks and 20+ gardens.",
    "On the homepage only","TO BE COLLECTED / VERIFIED INTERNALLY",
    "Ashim / Vimlendu","No","Numbers + source",
    "Own material","Either enter them into data/work so /impact resolves them, or remove them from the homepage",
    "NEEDS VERIFICATION",
    "This is the exact defect class the /impact architecture was built to prevent — it simply does not cover the hand-built homepage. Two of four numbers under the words 'the whole record' are not in the record.")

row("N-02","Site-wide","Figures with no start year",
    "Nine of the 33 published figures carry the period 'cumulative, no start year sourced', which makes each a total rather than a rate.",
    "HIGH","Nine start years",
    "Start years for: Eco Action butterfly parks, Eco Action herb gardens, Farm School composting, Farm School honey, Monsoon Wooding cumulative trees, Gram Anubhav journeys, Gram Anubhav grassroots partners, NatureScapes journeys, and She Leads Change's 'Learning Communities cohort' period.",
    "Published with the gap named","TO BE COLLECTED / VERIFIED INTERNALLY",
    "Ashim (Programs)","No","Numbers",
    "Own material","Turns nine totals into nine rates","NOT STARTED",
    "Cheapest high-value row in the audit: nine facts, one conversation, nine figures upgraded.")

row("N-03","/impact","Metrics the site does not publish",
    "The register carries 33 figures, all of them reach counts. No cost-per-participant, no repeat-engagement rate, no retention, no survival rate, no completion rate, no gender or income breakdown.",
    "MEDIUM","A decision on which effect metrics can honestly be published",
    "Candidates already implied by the site's own holes: tree survival rate (D-12), what changed in one school (D-02), fellows' project outcomes (D-06), per-walk demand (D-19), teacher-training numbers (M-02).",
    "No","Partially derivable","Ashim / Neeraj","No","Numbers",
    "Own material","Would move /impact from reach to effect, which is what the page's own copy says it wants",
    "NOT STARTED","")

row("N-04","/impact","Contaminated legacy counters — do not reuse",
    "Four old project pages were unfinished templates with lorem-ipsum bodies sharing one counter set (2740/4751/1260/9385). That set contaminated two otherwise real pages: 'learning-communities' ends in 9385 'Campaigns' and 'soil-regeneration-training' ends in 9385 'Rural Youth Engaged'.",
    "HIGH","A standing instruction, not a collection",
    "When porting old project prose (M-01 to M-10), port the PROSE and treat every legacy counter as an unsourced claim. Known contradictions on the old site: Yamuna Yatra prose 2000 vs counter 3000; Monsoon Wooding 50,000 vs 55,000; Bee Keepers 500 kg vs 600 litres; Bridge the Gap 250 schools/50,000 students vs 257/45,000/300,000; and eco-action vs green-action-in-schools are the same programme with different numbers.",
    "N/A","N/A","N/A","docs/design/2026-08-22-LEGACY-SITE-CONTENT-AUDIT.md §3","Guidance",
    "N/A","Guardrail for every M-row above","READY FOR WEBSITE",
    "Record this in the collection sheet so a well-meaning volunteer does not type 9,385 into a data file.")

# ─────────────────────────── K. FARM ───────────────────────────
row("R-01","/farm","Programmes at the farm",
    "/farm describes a place and five visit formats. The five farm training programmes that redirect to it (M-08) are described nowhere, so the farm reads as a venue rather than a training centre.",
    "HIGH","See M-08","As M-08.","Partially","YES","Naveen (Farm Manager) / Ashim","No","Text + photos",
    "Own material","A 'What runs here' section on /farm","NOT STARTED","")

row("R-02","/farm","Built by Mewat",
    "The page has a section titled 'Built by Mewat' and the farm was built with local labour, but no Mewat worker, family or village is named, quoted or photographed.",
    "HIGH","Names, permission and portraits",
    "Two or three people from the local community who built or work the farm: name, village, what they do, one quote, a portrait. With consent.",
    "Section exists, unpeopled","TO BE COLLECTED",
    "Naveen (Farm Manager)","No","Text + portraits","Written consent required",
    "Puts people in the section already titled after them","NOT STARTED",
    "A section named 'Built by Mewat' that names nobody from Mewat is the clearest example on the site of a good idea waiting for content.")

row("R-03","/farm","Visitor evidence",
    "Farm School publishes '30 school groups a year' and /farm offers five visit formats, but no visiting school is named, no visit is described from a visitor's side, and there is no testimonial.",
    "HIGH","Two visit accounts","One school day-visit and one overnight camp, told from the school's side, with a named teacher quote and photographs. With permission.",
    "No","LIKELY","Naveen / Ashim","No","Text + quote + photos",
    "School permission required","On /farm and /work/projects/farm-school","NOT STARTED","")

row("R-04","/farm","Practicalities",
    "The page says the farm is 90 minutes from Delhi and can sleep 100 students, and says 'It is not a hotel'. It does not state costs, seasons, capacity limits, accessibility, or what a school must bring.",
    "MEDIUM","Booking practicalities","Indicative cost or cost basis, best months, group size limits, accessibility, safeguarding arrangements for overnight stays with minors, and what a school needs to bring.",
    "Partially","YES","Naveen (Farm Manager)","No","Text",
    "Own material","Completes 'It is not a hotel' and 'Come and see'","NOT STARTED",
    "A school booking an overnight stay for minors will ask about safeguarding before anything else — see T-07.")

row("R-05","/farm","Location and how to get there",
    "The farm is described as 'an hour and a half from Delhi' and 'Built by Mewat' but the page carries no map, no address and no directions.",
    "MEDIUM","Location detail and a map",
    "Nearest town, approximate address or pin, how to reach it by road and rail, and whether the location may be published.",
    "Distance only","YES","Naveen / Vimlendu","No","Map + text",
    "OWNER DECISION — whether to publish a precise location",
    "A map on /farm; also feeds S-04","NOT STARTED","")

# ─────────────────────────── L. SITE DEFECTS FOUND IN THE AUDIT ───────────────────────────
row("X-01","/explore","Orphan page live in production",
    "https://swechha.in/explore returns 200 and serves the PRE-DESIGN Tailwind scaffold: the old navigation (with 'Donate', 'Projects', 'Campaigns' as nav words that no longer exist), an old newsletter form, and three empty states reading 'nothing published yet' and 'No films published yet'. It is not in the sitemap but it is NOT disallowed in robots.txt, so it is crawlable and indexable.",
    "CRITICAL","No content — a routing decision",
    "Either redirect /explore to /stories, or delete the route. It should not be reachable in its current state.",
    "Yes — live and wrong","N/A","Engineering","N/A","Route",
    "N/A","Remove or redirect","NOT STARTED",
    "This is the only page on the live site that shows a visitor an empty state, and it also contradicts the site's own navigation. Fixing it is a five-minute change.")

row("X-02","/","Duplicate destination in 'The record'",
    "Two of the three record doors on the homepage — 'Today's readings' and 'Where the readings come from' — both link to /now. The third has no link at all (H-04).",
    "MEDIUM","A routing decision",
    "Either give 'Where the readings come from' its own sources page, or merge the two doors.",
    "Yes — live","N/A","Engineering / Vimlendu","N/A","Route",
    "N/A","Fix alongside H-04","NOT STARTED","")

row("X-03","/keystatic","CMS reachable in production",
    "https://swechha.in/keystatic returns 200. It is correctly noindexed and disallowed, but the editor route is publicly reachable on the production domain.",
    "MEDIUM","No content — a security review",
    "Confirm the Keystatic route is either authenticated or not deployed to production.",
    "Yes","N/A","Engineering","N/A","Route","N/A",
    "Out of scope for content, recorded because it was found","NOT STARTED",
    "Noted for completeness. Not a content gap.")

row("X-04","Site-wide","Newsletter capture is missing from the institutional pages",
    "The email digest form appears on the six situation pages, /now and /stories. It does NOT appear on /about, /work, /impact, /act, /farm or /publications — including /act, which is the page eighteen others point at.",
    "MEDIUM","No content — a placement decision",
    "Decide whether the digest belongs on the institutional pages, particularly /act.",
    "Partially","N/A","Vimlendu / Engineering","N/A","Component",
    "N/A","Add to /act at minimum","NOT STARTED","")

row("X-05","Site-wide","Contact information",
    "The only contact points on the site are mailto links (swechhaindia@gmail.com and vimlendu@swechha.in). There is no address block and no phone number — ruling G-4 struck the phone number. The old site published R-84 Khirki Extension, Malviya Nagar, New Delhi 110017 and three different phone numbers.",
    "HIGH","One decision on contact details",
    "Confirm the postal address for publication, and settle the phone question — the old site had three live numbers (011-41009320, 011-29544678, +91-9811812788). Also: whether a generic gmail address should be the organisation's primary published contact.",
    "Email only","YES","Vimlendu (owner ruling)","N/A","Text",
    "OWNER RULING REQUIRED","A contact block in the footer or on /about",
    "NOT STARTED",
    "An organisation with 80G/FCRA status whose only published contact is a gmail address undercuts the transparency work in T-01 to T-04.")

with open(os.path.join(OUT,"01-master-content-collection.csv"),"w",newline="",encoding="utf-8") as f:
    w = csv.writer(f, quoting=csv.QUOTE_ALL)
    w.writerow(COLS)
    for r in R:
        assert len(r) == len(COLS), (r[0], len(r))
        w.writerow(r)

print("rows:", len(R))
