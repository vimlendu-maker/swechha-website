# SWECHHA WEBSITE — REVISED PRODUCT BRIEF

**Version:** 1.0 — MVP-Focused Revision  
**Status:** Ready for implementation  
**Organisation:** Swechha  
**Timeline:** 8 weeks (2 months)

---

## CRITICAL PREAMBLE

This revision takes the excellent founding brief and restructures it for ruthless 2-month MVP delivery while preserving the long-term vision.

**The key change:** Environmental Intelligence (live data, automated updates, intelligence pipeline) is a **Phase 2+ feature**, not MVP. This is critical because it's the most technically complex and requires infrastructure the team doesn't yet have.

**MVP is about:** Telling Swechha's stories beautifully, making content discoverable, and building the foundation for everything else.

**Phase 2+ is about:** Making the website feel alive with real-time environmental data and automated intelligence.

Both are important. They're just in different phases.

---

## PART 1: EXECUTIVE SUMMARY

### The North Star

> **Something is happening. I understand it now. I know what I can do. And Swechha can help me do it.**

### What Swechha's Website Should Become

A credible, beautiful platform that combines:

1. **Organisational home** — who Swechha is, its work, achievements
2. **Knowledge platform** — searchable resources, explainers, guides, research
3. **Action platform** — ways to participate immediately
4. **Impact archive** — permanent record of Swechha's work and change created
5. **Environmental destination** — (future) make environmental issues understandable

### MVP Scope (Weeks 1-8)

- Homepage that surfaces current work and calls to action
- Core content types: Projects, Stories, Knowledge, Films, Campaigns
- Navigation and discovery that feels contemporary and effortless
- SEO-friendly, accessible, fast architecture
- Basic CMS so Swechha can publish independently
- Newsletter signup integrated throughout
- Search across all content

### Not in MVP (Launch in Phase 2+)

- Live environmental data integration
- Automated environmental intelligence updates
- "Swechha NOW" dynamic homepage system
- Interactive maps and advanced data visualisation
- Advanced automation and AI-assisted publishing

---

## PART 2: DESIGN DIRECTION (CONCRETE GUIDANCE)

### Personality (What It Actually Means)

The website should feel:

- **Young without trying** — not forced, not full of slang, not trying to be cool. Just naturally contemporary.
  - Example: Modern editorial sites like The Verge, FT visual journalism, climate-focused outlets like Carbon Brief
  - What to avoid: Obvious attempts at youth appeal (emoji, "fellow kids" tone, TikTok references)

- **Minimal without feeling empty** — white space is active, not a design failure. Every element earns its place.
  - Example: Apple, Medium, The Guardian's visual approach
  - What to avoid: Blank pages, lonely content, pages that feel unfinished

- **Serious without institutional** — credible but not corporate. Warm but not casual.
  - Example: Patagonia, The Information, National Geographic
  - What to avoid: NGO templates, corporate blue, stock photography

- **Environmental without stereotypical green** — the natural world matters, not a colour palette
  - Example: Use photography, strong typography, real images of environmental work
  - What to avoid: Generic green + blue + earth tones, leaf logos, nature photography that's purely decorative

- **Bold but restrained** — strong visual decisions, but nothing shouty or gratuitous
  - Example: Single impactful hero image, bold typography choices, meaningful colour accents
  - What to avoid: Gradients everywhere, multiple competing visual styles, animations for decoration

### Visual Principles

**Typography is doing 70% of the work.**
- Modern, clean typefaces (serif or sans, not script)
- Strong type hierarchy
- Readable body text (18-20px minimum)
- Generous line spacing
- No excessive text (ruthlessly edit)

**Photography is your hero.**
- Swechha's real field photography comes first
- People, not places (faces, action, community)
- Environmental conditions visible and real
- Avoid stock photography entirely
- Every image should tell a story or establish a mood

**Colour system is restrained.**
- Predominantly neutral (blacks, whites, grays)
- 2-3 accent colours maximum (e.g., one warm, one cool)
- Use colour strategically for emphasis and navigation
- Test for accessibility (WCAG AA minimum)

**Whitespace is intentional.**
- Pages should feel uncluttered but not empty
- Margins, padding, and breathing room are design decisions
- Use whitespace to guide attention

**Motion is editorial.**
- Subtle transitions as users navigate
- No auto-playing carousels or decorative animation
- Motion supports understanding, not distraction
- Respectful of reduced-motion preferences

---

## PART 3: MVP SCOPE (WHAT SHIPS IN 8 WEEKS)

### Core Content Types (5 Types)

**1. PROJECT** (Swechha's work)
- Title, description, geography, timeline
- Problem statement
- What Swechha is doing
- Partners, team
- Impact summary (where visible)
- Related stories, films, knowledge

**2. STORY** (Impact and narrative)
- Title, author, publication date
- Hero image
- Long-form narrative text
- Photo essay if relevant
- Impact highlighted
- Related projects, knowledge, films

**3. KNOWLEDGE** (Explainers, guides, resources)
- Title, topic, difficulty level
- Structured content (sections, images, downloads)
- Key facts highlighted
- Links to related projects, stories, campaigns
- DIY guides as specialized knowledge type

**4. FILM** (Videos, explainers, recordings)
- Title, description, runtime
- Embedded video
- Transcript (accessibility)
- Related projects, stories, knowledge
- Used across site (homepage, projects, knowledge)

**5. CAMPAIGN** (Calls to action and issues)
- Title, issue area, status (Active/Monitoring/Achieved)
- What's happening
- What Swechha wants
- How to participate
- Related projects, stories, films, knowledge

### Core Pages

- **Homepage** — Static hero + editorial highlights + calls to action. NOT a dynamic intelligence system yet.
- **About** — Who Swechha is, history, team, mission
- **Work** — Grid of projects with filters (geography, theme, status)
- **Stories** — Archive of impact stories and narratives
- **Knowledge** — Hub for guides, explainers, resources, DIY
- **Campaigns** — Current campaigns with participation options
- **Impact** — Summary of what has changed
- **Act** — Volunteer, donate, participate, join newsletter
- **Search** — Site-wide search (basic but functional)

### Navigation Structure (Hypothesis)

- **NOW** — Latest stories, campaigns, what's happening (static, not dynamic yet)
- **EXPLORE** — Knowledge, stories, films, explainers
- **WORK** — Projects, programmes
- **ACT** — Volunteer, donate, campaign
- **ABOUT** — Who we are, team, partners, impact

(This should be tested during discovery but is a reasonable starting point.)

### Technical Stack (Proposed)

- **Framework:** Next.js (React-based, fast, SEO-friendly, flexible)
- **Content:** Markdown files in Git repository (no heavyweight CMS initially)
- **Hosting:** Vercel or similar (built for Next.js, fast global delivery)
- **Search:** Algolia (fast, feature-rich, supports filters)
- **Video:** YouTube/Vimeo (embedded, not self-hosted)
- **Images:** Optimized with Next.js Image component (automatic sizing, formats, lazy loading)
- **Analytics:** Plausible or Fathom (privacy-focused, fast)
- **Forms:** Formspree or similar (simple, no vendor lock-in)

**Why this stack:**
- Minimal dependencies (fast page loads)
- Non-technical Swechha team can update content via Git (with templates and documentation)
- Extremely performant (competitive with any CMS)
- Scales to complex features later without replatforming
- SEO-friendly by design

### What Gets Built (Content-Wise)

**Migrated from old site:**
- Existing projects (curated, updated)
- Existing stories (valuable historical content)
- Existing films and media
- Existing programmes and impact data
- Key reports and resources

**Written new:**
- About page (fresh, contemporary voice)
- Homepage narrative
- Campaign pages (with current status)
- Knowledge explainers (at least 10-15 to launch with)
- DIY guides (at least 5-10)
- Impact summary and metrics

**Content inventory needed (Discovery Phase):** See section below.

---

## PART 4: DESIGN SYSTEM

Build this before extensive page production (Week 2-3).

### Typography
- **Primary font:** One modern sans-serif (e.g., Inter, Sohne, GT Sectra)
- **Hierarchy:** H1 (48px), H2 (36px), H3 (24px), Body (18-20px), Small (14px)
- **Line height:** 1.6 for body, 1.3 for headlines

### Colour
- **Neutral base:** 2-3 shades of black, white, light gray
- **Primary accent:** One colour (warm or cool)
- **Secondary accent:** One complementary colour
- **Functional colours:** Green for success/action, red for alerts, yellow for caution

### Spacing & Grid
- **Base unit:** 8px
- **Grid:** 12-column responsive grid
- **Margins:** Generous (2-4 base units minimum)
- **Padding:** Content breathing room (1-3 base units)

### Components
- **Buttons:** Minimal, text-based or simple solid with lots of whitespace
- **Cards:** Minimal (no drop shadows or borders unless necessary)
- **Navigation:** Clear, modern, responsive
- **Forms:** Accessible, properly labelled, clear feedback
- **Tags/Labels:** Subtle, useful for filtering and categorisation
- **Alerts/Banners:** Functional, not decorative

### Responsive Behaviour
- **Mobile-first approach** (design for 375px width first)
- **Breakpoints:** 375px, 768px, 1024px, 1440px
- **Touch-friendly:** Buttons minimum 44px, spacing for thumbs
- **Performance priority:** No heavy animations on mobile

---

## PART 5: WHAT THE HOMEPAGE LOOKS LIKE

### Structure (Not a Dynamic Intelligence System Yet)

1. **Hero section** — One powerful image + headline answering "What is Swechha?" (not a slideshow)
2. **Featured story** — One current story with image and excerpt
3. **Featured campaign** — One current campaign call to action
4. **Featured projects** — 3-4 projects with images, titles, brief description
5. **Knowledge highlight** — Feature one explainer or DIY guide
6. **Latest stories** — Scrollable list of recent stories
7. **CTA section** — "How to participate" with action options
8. **Newsletter signup** — Clean, simple email capture

### Why This Approach

**Advantage:** Can be maintained by Swechha team with simple content updates. No complex automation.

**Disadvantage:** Doesn't surface real-time environmental news. That comes in Phase 2.

**Trade-off:** We gain stability and speed for launch. We sacrifice the "living front page" feeling for now.

---

## PART 6: TIMELINE (8 WEEKS)

### Week 1-2: Discovery & Setup
- Audit and inventory existing WordPress site
- Audit WordPress backend content
- Document all existing URLs (for redirects)
- Set up development environment and Git repository
- Complete content model spec
- Final information architecture decisions
- Identify 50-100 pieces of content to migrate or create

### Week 2-3: Design System
- Create typography system (fonts, scales, styles)
- Define colour palette with accessibility testing
- Build component library design (buttons, cards, forms, etc.)
- Design desktop and mobile homepage
- Create responsive grid system
- Approve design direction with stakeholder

### Week 3-4: Core Build
- Set up Next.js project with routing, image optimization, performance optimizations
- Build layout/navigation component
- Build homepage template
- Set up search infrastructure (Algolia)
- Set up analytics
- Set up forms (email capture, contact)
- Start content migration

### Week 4-5: Content Pages
- Build project template and grid
- Build story template and archive
- Build knowledge/guide template
- Build campaign template
- Build film/media pages
- Build About page
- Build Act/Participate page
- Migrate priority content (40+ pieces)

### Week 5-6: Content Completion & Polish
- Finish content migration
- Write new content (explainers, about, impact)
- Image optimization and selection
- Internal linking between related content
- SEO metadata completion
- Testing (accessibility, performance, responsive)

### Week 6-7: Redirects, Performance & SEO
- Set up 301 redirects from old site
- XML sitemap generation
- Performance optimization (images, JavaScript, caching)
- Accessibility audit (WCAG AA)
- SEO optimization (metadata, structured data, canonical URLs)
- Analytics setup and goal configuration

### Week 7-8: Testing & Launch
- Full QA testing (all browsers, devices)
- Security review (forms, authentication, dependencies)
- Performance testing (Lighthouse, real-world testing)
- Load testing (can it handle traffic?)
- Stakeholder review and approval
- DNS and hosting setup
- Production deployment
- Monitoring and bug fixes

**Buffer week:** One week of contingency built into timeline above.

---

## PART 7: CONTENT ARCHITECTURE & MIGRATION STRATEGY

### Content to Migrate (Curated, Not Everything)

**KEEP:**
- Valuable projects (active and completed, with good documentation)
- Stories with visible impact
- Research, reports, and key resources
- Films, videos, explainers
- Educational resources
- Key stats on programmes and reach

**UPDATE:**
- Outdated projects (still worth keeping but rewritten)
- Old stories (important historically but need new framing)
- Existing explainers (rewritten for clarity)

**REWRITE:**
- Any content that's useful but poorly written
- Anything with unclear impact or relevance

**ARCHIVE:**
- Old campaign pages (historical value, not current)
- Outdated statistics and reports
- Anything superseded by newer content

**DELETE:**
- Duplicate content
- Broken links, placeholder pages
- Old plugin-generated pages
- Anything of no strategic value

**REDIRECT:**
- All URLs from old site to new site (preserve SEO equity)

### Content Inventory (Discovery Phase)

Before migration begins, audit:
1. Count and categorize all WordPress posts, pages, custom post types
2. Document all URLs and metadata (for 301 redirects)
3. Extract media library (images, videos, PDFs)
4. Identify broken links and dependencies
5. Note any custom WordPress functionality that needs rebuilding
6. Identify what can be automated (taxonomy, tags) vs. what needs human review

---

## PART 8: WHAT'S NOT IN MVP (PHASE 2+)

### Environmental Intelligence System (Phase 2)

This is the most ambitious part of the vision and not MVP.

**Phase 2 will add:**
- Real-time environmental data feeds (AQI, weather, alerts)
- "Swechha NOW" dynamic homepage banner
- Automated detection of environmental developments
- AI-assisted draft generation from trusted sources
- Human editorial review before publication

**Why not MVP?**
- Requires building data infrastructure
- Requires establishing trusted source relationships and APIs
- Requires designing editorial workflows
- Too much risk/complexity for launch
- The site is valuable without it

**Timeline:** 4-8 weeks after MVP launch

### Advanced Features (Phase 3+)

- Interactive maps showing project locations
- Data visualizations of environmental trends
- Advanced search with AI recommendations
- Community participation and user-generated content
- Personalised dashboards for supporters
- Advanced analytics and impact dashboards

---

## PART 9: DISCOVERY WORK STILL REQUIRED

**Before building begins, complete these:**

### Content Inventory (1-2 weeks)
1. Full audit of WordPress backend
2. Count and categorize all content
3. Identify what migrates, updates, rewrites, archives, deletes
4. Document all URLs for redirect mapping

### Stakeholder Input (1 week)
1. Finalize which projects/programmes are "core" for MVP
2. Clarify what "impact" looks like for each project
3. Identify key team members for About page
4. Approve visual direction and homepage approach
5. Confirm key campaigns that should be featured

### Content Gaps (2 weeks)
1. What knowledge/explainers are missing and important?
2. How many DIY guides should launch with? (5? 10? 20?)
3. What reports and resources are essential?
4. Are there important stories from the archive to highlight?

### Environmental Intelligence Planning (1 week) 
(For Phase 2, but good to start thinking)
1. What data sources are most relevant?
2. What environmental issues matter most to Swechha?
3. How would editorial workflow work?

---

## PART 10: KEY TRADE-OFFS & DECISIONS

### Trade-off 1: Static Homepage vs. Dynamic Intelligence System

**We're choosing:** Static homepage (MVP)

**Advantage:**
- Fast to build and ship
- Easy for Swechha team to update
- Low risk of technical failure
- Clear, comprehensible visitor experience

**Disadvantage:**
- Website doesn't feel "alive" with current events
- Doesn't showcase real-time environmental intelligence
- Requires manual editing to highlight current campaigns

**What we gain:** 2-3 weeks of development time + shipping confidence.

**What we lose:** The dynamic "something is happening right now" feeling.

**Phase 2 adds:** Dynamic banner showing current environmental issues with real data.

---

### Trade-off 2: Git-Based Content vs. Traditional CMS

**We're choosing:** Markdown files in Git (with templates, not CMS)

**Advantage:**
- Extremely fast page loads (no database)
- Simple deployment (push to Git = website updates)
- Version control (undo changes if needed)
- No vendor lock-in
- Lower operational complexity

**Disadvantage:**
- Requires some Git literacy (or very clear documentation)
- No visual WYSIWYG editor
- Less friendly for non-technical users initially

**What we gain:** Performance, simplicity, sustainability.

**What we lose:** Ultimate ease-of-use without training.

**Mitigation:** Create clear templates and documentation so Swechha team can publish independently without needing to understand Git deeply.

**Phase 2 can add:** A lightweight CMS interface if Git feels too technical (e.g., Decap CMS, which is git-based but has a visual editor).

---

### Trade-off 3: Comprehensive Content Migration vs. Strategic Curation

**We're choosing:** Curation (not everything migrates)

**Advantage:**
- Fresh start, cleaner site
- No outdated information
- Forces decision-making about what's valuable
- Faster to migrate less

**Disadvantage:**
- Some historical content gets archived, not visible
- Swechha loses some "depth" of available resources initially

**What we gain:** Clarity, quality, faster launch.

**What we lose:** Comprehensive coverage of everything Swechha has ever done.

**Mitigation:** Archive old site on Web.archive.org; keep old content available but not prominent.

---

### Trade-off 4: Minimal Design System vs. Maximal Customization

**We're choosing:** Minimal, reusable components

**Advantage:**
- Fast to design and build
- Easy to maintain and update
- Scales cleanly
- Performance-optimized

**Disadvantage:**
- Less visual variety
- Each page feels somewhat similar
- Less room for playful, decorative design

**What we gain:** Coherence, maintainability, speed.

**What we lose:** Visual uniqueness on every page.

---

## PART 11: 2-MONTH REALITY CHECK

### What's Definitely Doable

✓ **Beautiful, contemporary design**  
✓ **Core content types (Projects, Stories, Knowledge, Campaigns, Films)**  
✓ **Homepage that feels alive and editorial**  
✓ **Fast, accessible, SEO-friendly website**  
✓ **Search across all content**  
✓ **Mobile-first, responsive experience**  
✓ **Newsletter integration**  
✓ **100+ pieces of migrated/new content**  
✓ **Volunteer, donation, participation CTAs**  
✓ **Impact messaging and storytelling**  

### What's Ambitious but Doable

? **Environmental explainers and knowledge base (15-20 pieces)**  
? **DIY guides (5-10 pieces)**  
? **Advanced filtering and discovery**  
? **Video integration and management**  
? **Team/About pages with photos and bios**  
? **Custom impact visualisations and metrics**  

### What's Definitely Not Happening in 8 Weeks

✗ **Real-time environmental data integration**  
✗ **Automated environmental intelligence updates**  
✗ **"Swechha NOW" dynamic system**  
✗ **AI-assisted content generation**  
✗ **Interactive maps**  
✗ **Complex data visualisations**  
✗ **Community features or user accounts**  
✗ **Advanced personalization**  
✗ **Traditional CMS with visual editor**  

**These are all Phase 2-3 features.**

---

## PART 12: SUCCESS CRITERIA (MVP)

**The website succeeds if, on launch day:**

1. ✓ It's noticeably faster than the old WordPress site
2. ✓ A visitor can understand what Swechha does in under 1 minute
3. ✓ The design feels contemporary and distinctive (not like a template)
4. ✓ A visitor can easily find how to volunteer, donate, or participate
5. ✓ A visitor can discover projects, stories, and knowledge
6. ✓ It's mobile-friendly and accessible
7. ✓ Search works and finds relevant content
8. ✓ Swechha team can publish new content without developer help
9. ✓ It has zero broken links from the old site
10. ✓ It feels like "an organisation shaping the future" (not a generic NGO)

---

## PART 13: PHASE 2-6 ROADMAP (BEYOND MVP)

### Phase 2 (Weeks 9-16 after launch) — Environmental Intelligence Foundation

**What ships:**
- Real-time environmental data integration
- "Swechha NOW" dynamic homepage banner system
- Automated environmental updates with human editorial control
- Advanced content discovery

**Technical work:**
- Build data pipeline architecture (connect to AQI APIs, weather services, news feeds)
- Design editorial workflow (source → detection → verification → publication)
- Build dynamic homepage system
- Implement related-content recommendation engine

**Content work:**
- Create 20+ environmental update templates
- Establish partnerships with data sources
- Build editorial guidelines for automation

**Example: Swechha NOW in Phase 2**

When Delhi AQI exceeds 300, the homepage banner automatically shows:

```
DELHI AIR - HAZARDOUS
AQI 347 · Updated 2 hours ago

What this means:
Air pollution reaches hazardous levels. Vulnerable groups should avoid outdoor activity.

What Swechha is doing:
→ Monitoring air quality across Delhi
→ Documenting health impacts
→ Advocating for policy action

What you can do:
→ Track your local air quality (DIY guide)
→ Join Swechha's air campaign
→ Share this information
→ Subscribe for updates

[Source attribution] [Timestamp] [Related projects] [Related stories]
```

The banner is editorially reviewed by a Swechha team member before publication (not fully automated).

**Timeline:** 4-8 weeks post-MVP launch

---

### Phase 3 (Weeks 17-24 after launch) — Interactive Platforms & Data

**What ships:**
- Interactive maps showing project locations and environmental conditions
- Environmental data visualisations (trends, historical data, comparisons)
- Advanced filtering across content (by issue, geography, impact level)
- Impact dashboards showing Swechha's reach and outcomes
- Video gallery with advanced filters

**Example: Interactive Map**

Visitors can explore projects geographically:
- Click on a state → see all Swechha projects there
- Filter by programme type (education, advocacy, conservation)
- See environmental indicators for that region (AQI, water quality, forest coverage)
- Link directly to related projects, stories, impact data

**Example: Impact Dashboard**

A visual summary showing:
- Trees planted (cumulative)
- Communities engaged
- Students reached
- Campaigns won
- CO2 equivalent reduced/avoided
- With trend lines and comparisons over time

**Timeline:** 8-12 weeks after Phase 2

---

### Phase 4 (Weeks 25-32 after launch) — Community & Personalization

**What ships:**
- User accounts and personalisation
- Volunteer management system (track hours, contributions)
- Supporter dashboard (my campaigns, my contributions, my impact)
- Community participation features (comments, shared learning, user-generated content)
- Personalised email digests

**Example: Supporter Dashboard**

A Swechha supporter logs in and sees:
- "You've volunteered 24 hours"
- "You're following 3 campaigns"
- "3 new updates on campaigns you follow"
- "Your impact: 500 trees planted (through our campaign)"
- "Recommended: Similar projects in your state"

**Timeline:** 12-16 weeks after Phase 3

---

### Phase 5+ (6+ months after MVP) — Platform Maturity

**What ships:**
- AI-powered environmental discovery (intelligent search, recommendations)
- Integration with external environmental platforms and datasets
- Advanced analytics and research tools
- Environmental intelligence becomes a major content pillar
- "Digital Environmental Commons" — the full vision

**The full vision:**

At scale, Swechha's website becomes a place where:
- Researchers find environmental data easily
- Journalists discover stories and sources
- Policymakers find evidence and examples
- Young people find ways to participate
- Communities find solutions relevant to their context
- Environmental professionals find partners and resources
- The world has a go-to source for credible, accessible environmental intelligence from India

**This is a 1-2 year vision, not a 2-month goal.**

---

## PART 14: CONCRETE CONTENT EXAMPLES

### Example 1: A Story Page

**URL:** /stories/delhi-air-victory-2024

**Content structure:**
```
Hero image: Community members at an anti-pollution event

HEADLINE
"How Delhi's community won a partial ban on construction emissions"

BYLINE & DATE
By Priya Sharma | August 2024

SUMMARY (150 words)
"After 18 months of advocacy and documentation, Swechha helped secure a partial ban on construction-related emissions in Delhi. Here's what changed, who made it happen, and what comes next."

BODY TEXT (2000+ words with sections)
- The problem (air pollution numbers, health data)
- What Swechha did (field documentation, evidence-gathering, advocacy)
- The people (profiles, photos, voices of communities affected)
- The policy change (what exactly changed, limitations, next steps)
- The impact (what's improved, what still needs to happen)

PHOTO ESSAY
[4-6 contextual photos from the field]

IMPACT HIGHLIGHTED
"287 schools now have reduced outdoor activity on high-pollution days.
13 construction sites modified emissions protocols.
8,000+ residents followed the campaign."

RELATED CONTENT BOXES
- Related projects: "Delhi Air Campaign"
- Related knowledge: "How Air Pollution Affects Children"
- Related DIY: "Measure Your Local Air Quality"
- Related film: "30-min documentary on Delhi's air crisis"

NEWSLETTER SIGNUP
"Get updates on environmental victories and campaigns"
```

---

### Example 2: A DIY Knowledge Page

**URL:** /knowledge/diy-terrace-garden-biodiversity

**Content structure:**
```
Hero image: Photo of a successful terrace garden with birds and flowers

HEADLINE
"Create a Biodiversity Garden on Your Terrace (In 4 Weekends)"

META INFORMATION
Difficulty: Easy | Time: 4 weekends | Cost: ₹2,000-5,000 | Location: Works anywhere

WHAT YOU'LL NEED (with images of each)
- Large containers or raised beds
- Soil and compost
- Native plants (specific species list)
- Bird feeders
- Watering system
- Tools

WHY THIS MATTERS
[Explanation of how urban gardens support biodiversity, with local examples]

STEP-BY-STEP INSTRUCTIONS
Week 1: Preparation
- Choose your location (north-facing, 4+ hours sun)
- Gather materials
- Prepare containers

Week 2: Planting
- Fill containers with soil
- Plant native species (with specific guidance)
- Photos of each step

Week 3: Water & Feeding
- Set up irrigation
- Add bird feeders
- Instructions with photos

Week 4: Monitoring
- Track what appears
- Document birds, insects, butterflies
- Reporting template

EXPECTED RESULTS
Photos of mature gardens with the specific outcomes (types of butterflies, birds attracted, etc.)

SCIENCE EXPLANATION
Why native plants? How do they support local biodiversity? What's the difference between a "garden" and a "nature space"?

DOWNLOADABLE RESOURCES
- Plant species list for your region
- Monitoring checklist (PDF)
- Supply shopping list

RELATED CONTENT
- Project: "Urban Biodiversity Initiative"
- Story: "How One Rooftop Became a Sanctuary"
- Knowledge: "Native Plants of [Region]"

COMMUNITY SECTION
Photos and results from other people who completed this DIY

NEWSLETTER SIGNUP
"Get new DIY guides delivered monthly"
```

---

### Example 3: A Campaign Page

**URL:** /campaigns/delhi-plastic-ban-2024

**Content structure:**
```
Hero image: Striking visual of plastic pollution or community action

CAMPAIGN STATUS: ACTIVE (color-coded)

HEADLINE
"Ban Single-Use Plastic in Delhi's Schools"

THE ASK (Bold, clear)
"We're calling on Delhi government to ban single-use plastic in all government schools by December 2024."

THE SITUATION
- Context: Why this matters now
- Evidence: 1,200 tons of plastic waste from schools annually
- Impact on students: Health risks, environmental
- What other cities have done

WHAT SWECHHA IS DOING
- Field documentation (with photos)
- Community engagement (how many schools, students)
- Evidence-gathering (data collection methodology)
- Advocacy (meetings with officials, policy proposals)
- Public awareness (events, communications)

HOW YOU CAN HELP (with clear CTAs)
- 🔗 Sign petition (link to form)
- 📨 Email your local councillor (template provided)
- 🎓 Organize a school event (guide provided)
- 💰 Donate to campaign (specific ask)
- 📢 Share information (social templates)
- 👥 Volunteer (sign-up form)

CAMPAIGN TIMELINE
- June 2024: Campaign launched
- July 2024: 500 student testimonies gathered
- August 2024: Petition submitted to municipal corporation
- [Future milestones marked as "upcoming"]

VICTORIES SO FAR
✓ 12 schools have voluntarily adopted plastic bans
✓ Local media coverage (5 articles)
✓ Municipal corporation meeting scheduled

EVIDENCE & REPORTS
- Download: "Plastic Waste in Delhi Schools" (PDF report)
- Download: "Health Impacts Assessment"
- Video: "30 min documentary"

RELATED CONTENT
- Project: "School Sustainability Programme"
- Stories: "How One School Cut Plastic 90%"
- Knowledge: "What Happens to School Waste?"
- DIY: "Start a Plastic Audit at Your School"

SUBSCRIBE FOR UPDATES
"Get campaign updates delivered to your inbox"
```

---

## PART 15: INFORMATION ARCHITECTURE — DETAILED

### Site Map (MVP)

```
/ (Root)
├── / (Homepage)
├── /about
│   ├── /about/mission
│   ├── /about/team
│   ├── /about/partners
│   ├── /about/impact-summary
│
├── /work (Projects)
│   ├── /work/[project-slug]
│   │   ├── Related stories
│   │   ├── Related knowledge
│   │   └── Related films
│   └── /work/?filter=geography,theme,status
│
├── /explore (Knowledge hub)
│   ├── /explore/explainers
│   ├── /explore/diy-guides
│   ├── /explore/research-reports
│   ├── /explore/[knowledge-slug]
│   └── /explore/?filter=topic,difficulty,format
│
├── /stories (Impact narratives)
│   ├── /stories/[story-slug]
│   │   ├── Related projects
│   │   ├── Related campaigns
│   │   └── Related knowledge
│   └── /stories/?filter=issue,geography,year
│
├── /campaigns (Current campaigns)
│   ├── /campaigns/[campaign-slug]
│   │   ├── Evidence & reports
│   │   ├── How to help
│   │   └── Updates
│   └── /campaigns/?filter=status,issue,region
│
├── /films (Videos & multimedia)
│   ├── /films/[film-slug]
│   │   └── Transcript
│   └── /films/?filter=format,topic,length
│
├── /act (Participate)
│   ├── /act/volunteer
│   ├── /act/donate
│   ├── /act/campaigns
│   └── /act/newsletter-signup
│
├── /impact (What changed)
│   ├── Impact summary with metrics
│   ├── Stories of change
│   └── Data dashboard (Phase 3)
│
├── /search
│   └── Global search across all content
│
└── [Legacy redirects from old site]
    └── /old-project-name → /work/new-slug [301]
```

### User Journeys (MVP)

**Journey 1: Student discovering environmental action**
1. Googles "how to help environment"
2. Finds Swechha's "DIY guides" through search
3. Completes a DIY guide (terrace garden)
4. Discovers related projects and campaigns
5. Joins a campaign
6. Subscribes to newsletter

**Journey 2: Funder evaluating Swechha**
1. Lands on homepage
2. Clicks "About" → understands mission
3. Clicks "Work" → explores projects
4. Clicks on a project → sees impact details
5. Reads related stories → sees real-world outcomes
6. Clicks "Impact" → sees overall metrics
7. Downloads reports (from project pages)
8. Contacts team (CTA on impact page)

**Journey 3: Journalist researching environmental crisis**
1. Googles "air pollution Delhi"
2. Finds Swechha's air quality knowledge page
3. Reads explanation + Swechha's related campaigns
4. Finds contact info for media inquiries
5. Finds downloadable reports and photos
6. Downloads "Delhi Air Campaign" media kit
7. Contacts Swechha team for interview

**Journey 4: Existing supporter checking progress**
1. Visits homepage to see latest updates
2. Sees campaign they previously supported
3. Clicks campaign → sees "Victory" milestone
4. Reads story about impact
5. Shares on social media
6. Renews donation

### Navigation Logic (Why This Structure)

**Top Navigation: NOW | EXPLORE | WORK | ACT | ABOUT**

- **NOW** — What's latest, what matters right now (featured stories, campaigns, updates)
- **EXPLORE** — Understand environmental issues deeply (knowledge, resources, learning)
- **WORK** — See Swechha's approach and projects (the organisation's work)
- **ACT** — Do something (volunteer, donate, campaign, subscribe)
- **ABOUT** — Know Swechha (mission, team, impact, history)

This moves a visitor through: understanding → exploration → discovering Swechha → taking action → learning more about Swechha.

---

## PART 16: DESIGN EXAMPLES

### Example 1: Project Card (on /work grid)

```
┌─────────────────────────────────────┐
│ [Image: Community in action]         │
├─────────────────────────────────────┤
│ TITLE (bold, 22px)                  │
│ "Urban Biodiversity in Delhi"       │
│                                     │
│ GEOGRAPHY BADGE                     │
│ Delhi, NCR                          │
│                                     │
│ DESCRIPTION (18px, 2 lines max)     │
│ "Working with communities to       │
│ create wildlife habitats in urban  │
│ spaces..."                          │
│                                     │
│ STATUS INDICATOR                    │
│ ● Active                            │
│                                     │
│ [More] →                            │
└─────────────────────────────────────┘
```

**Design principles:**
- Hero image does most of the visual work
- Minimal text, clean hierarchy
- Geography badge makes filtering easy
- Status indicator is subtle but clear

---

### Example 2: Homepage Hero Section

```
┌────────────────────────────────────────┐
│                                        │
│ [One powerful image of Swechha work]   │
│                                        │
│ HEADLINE (bold, 56px)                 │
│ "Environmental action starts here"    │
│                                        │
│ SUPPORTING TEXT (22px, light)         │
│ "We're building a future where        │
│ environmental justice and action      │
│ go hand in hand."                     │
│                                        │
│ [CTA BUTTON]  [Secondary CTA]         │
│                                        │
└────────────────────────────────────────┘
```

**Design principles:**
- One image, not a carousel
- Headline answers "what is Swechha?"
- Two CTAs: primary (explore) and secondary (learn more)
- No decoration, no animation
- Mobile: full width, optimised for thumb navigation

---

## PART 17: FINAL PRINCIPLE

> **Ship something useful and beautiful in 8 weeks.**
>
> **Build the foundation for something extraordinary in the long run.**

Every decision in MVP should be evaluated through this lens.

If a feature makes the site materially worse or slower for a 2-month deadline, it doesn't happen in MVP. Full stop.

But every decision should also be made knowing that it will need to support advanced features later.

This is the balance.

---

## APPENDIX: QUICK REFERENCE

### The 5 Content Types
1. **PROJECT** — Swechha's work and initiatives
2. **STORY** — Impact narratives and testimonies
3. **KNOWLEDGE** — Explainers, guides, resources, DIY
4. **FILM** — Videos, documentaries, interviews
5. **CAMPAIGN** — Calls to action on environmental issues

### The 5 Navigation Buckets
1. **NOW** — Latest and current
2. **EXPLORE** — Learn deeply
3. **WORK** — See our approach
4. **ACT** — Participate
5. **ABOUT** — Know us

### The 5 Core Pages (Beyond Content)
1. Homepage
2. About
3. Act (Participate)
4. Search
5. Impact

### The 8-Week Timeline (TL;DR)
- Weeks 1-2: Discovery & setup
- Weeks 2-3: Design system
- Weeks 3-4: Core build
- Weeks 4-5: Content pages
- Weeks 5-6: Content & polish
- Weeks 6-7: Performance & SEO
- Weeks 7-8: Testing & launch

### The 4 Key Trade-Offs
1. **Static vs. dynamic:** Choose static for MVP (Phase 2 adds dynamic)
2. **Git vs. CMS:** Choose Git for performance (Phase 2 can add visual layer)
3. **Curated vs. comprehensive:** Choose curated for quality (archive everything)
4. **Minimal vs. custom:** Choose minimal for speed (scale later)

