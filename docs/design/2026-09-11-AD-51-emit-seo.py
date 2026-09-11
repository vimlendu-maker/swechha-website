import os
import json,os,re,sys
ROOT="/Users/administrator/swechha-website"; T=f"{ROOT}/data/teach"
# WHERE THE EXTRACTED PDF TEXT LIVES. Not in the repo — the manual is a 25MB
# PDF and its text dump is an intermediate, so this is passed in:
#   pdftotext -layout "Final BTG MANUAL.docx.pdf" $BTG_TEXT_DIR/btg.txt
#   BTG_TEXT_DIR=/tmp/btg python3 docs/design/2026-09-11-AD-51-extract-manual.py
# It fails here with that instruction rather than on a missing-file traceback.
SP=os.environ.get("BTG_TEXT_DIR")
if not SP or not os.path.isdir(SP):
    raise SystemExit("Set BTG_TEXT_DIR to the directory holding btg.txt "
                     "(pdftotext -layout 'Final BTG MANUAL.docx.pdf' $BTG_TEXT_DIR/btg.txt)")
idx=json.load(open(f"{T}/index.json")); themes=[t['slug'] for t in idx['themes']]
TERMS=['delhi','india','ngo','environmental','environment','school','student','volunteer',
 'river','yamuna','climate','air','forest','farm','donate','report','camp','city','nature',
 'waste','water','youth','community','fellowship','workshop','garden','heat','rain',
 'pollution','aravalli']
def dec(s): return s.replace('&mdash;','—').replace('&rsquo;','’').replace('&amp;','&').replace('&nbsp;',' ')
def L(s): return len(dec(s))
STOP={'a','an','the','or','and','of','to','in','on','for','with','through','from','by','at',
 'is','are','it','as','that','this','their','its','be','can','will','which','who','into','but'}
def tidy(d):
    d=re.sub(r'[❯▪●•▸►]', '', d)
    d=re.sub(r'\s+',' ',d).strip().rstrip(' ,;:—-')
    while True:
        w=d.rstrip('.').split(' ')
        if w and w[-1].lower().strip('.,;:') in STOP: d=' '.join(w[:-1])
        else: break
    d=d.rstrip(' ,;:—-')
    return d if d[-1:] in '.?!' else d+'.'

def sents(blocks):
    out=[]
    for b in blocks:
        t=re.sub(r'\s+',' ',b['x']).strip()
        for s in re.split(r'(?<=[.!?])\s+', t):
            s=s.strip()
            # drop OCR headings and shouty fragments — they are not prose
            if len(s)<25 or len(s)>200: continue
            letters=[c for c in s if c.isalpha()]
            if letters and sum(c.isupper() for c in letters)/len(letters)>0.4: continue
            if re.match(r'^\d+[\.\)]', s): continue
            out.append(s)
    return out

def build(prefix,pool,lo=140,hi=158,whole=()):
    """prefer WHOLE sentences; fall back to a clause; never a dangling word"""
    for s in pool:                                    # 1. prefix + one whole sentence
        c=tidy(f"{prefix} {s}")
        if lo<=L(c)<=hi: return c
    for i in range(len(pool)-1):                      # 2. prefix + two whole sentences
        c=tidy(f"{prefix} {pool[i]} {pool[i+1]}")
        if lo<=L(c)<=hi: return c
    for s in pool:                                    # 3. prefix + a clause of one
        if s in whole: continue
        for cut in ('; ', ', '):
            if cut in s:
                for k in range(s.count(cut),0,-1):
                    c=tidy(prefix+" "+cut.join(s.split(cut)[:k]))
                    if lo<=L(c)<=hi: return c
    for s in pool:                                    # 4. word-trim, stop-words stripped
        if s in whole: continue
        c=f"{prefix} {s}"
        while L(tidy(c))>hi and ' ' in c: c=c.rsplit(' ',1)[0]
        c=tidy(c)
        if lo<=L(c)<=hi: return c
    c=tidy(prefix)
    return c if lo<=L(c)<=hi else None

# ── the eleven pages that are the section's shop windows: written by hand,
#    grounded in what each theme's reading material actually covers.
HAND={
"/teach":("Teaching resources for schools on environment and climate","Teach",
 "Swechha's Bridge the Gap compendium for teachers and NGOs: eight themes covering air, water, food, waste, energy, trees and climate justice, with 43 sessions.","website"),
"/teach/before-you-start":("How to teach sustainability in school — a guide","Before you start",
 "Education for Sustainable Development, written for the classroom: the four thrusts, learner-centred teaching, simulations, issue analysis and storytelling.","article"),
"/teach/a-to-z":("Environmental glossary for students and teachers, A to Z","The A to Z",
 "Plain definitions for 334 environmental terms, from abiotic and acid rain to vermicomposting and zero waste — the glossary from Swechha's teaching compendium.","article"),
"/teach/sustainable-development":("Sustainable development lessons and reading for schools","Sustainable development",
 "What development costs and who pays: the three spheres, needs against wants, issue analysis and life-cycle thinking, with eleven sessions for a classroom.","article"),
"/teach/blowing-in-the-wind":("Air pollution lesson plans and reading for schools","Air pollution",
 "What dirties the air and what it does to a body: sources, the main pollutants, and how air reaches a child's lungs — with three sessions for a classroom.","article"),
"/teach/water-water-everywhere":("Water and rivers — school lessons and reading","Water and rivers",
 "The water cycle, the ecosystem approach and why a city runs short: eight sessions on footprints, saving water, plastic in the ocean and walking a river.","article"),
"/teach/food-on-my-plate":("Where food comes from — school lessons and reading","Food on my plate",
 "Food from plants and animals, what is in it and how far it travels: three sessions on tracing a meal to its source and on what food security means.","article"),
"/teach/future-and-energy":("Energy and climate — school lessons and reading","Energy and the future",
 "What energy is, where it comes from and what renewables can do: five sessions including a solar purifier, an energy audit and the carbon cycle as a game.","article"),
"/teach/wasted":("Waste lessons and reading for schools and teachers","Waste",
 "Industrial, commercial, domestic and agricultural waste, and where each ends up: five sessions including biogas from dung and a walk to a landfill.","article"),
"/teach/trees-and-forests":("Trees and forests — school lessons and reading","Trees and forests",
 "India's forest types and how a tree actually grows: four sessions on measuring twig growth, sketching trees and walking a forest with a class.","article"),
"/teach/climate-justice":("Climate justice lessons for students and schools","Climate justice",
 "Who should act, who carries the cost and why that is unequal: four sessions on human rights, climate justice and a role-play game about who moves first.","article"),
}
SHORT={'sustainable-development':'sustainable development','blowing-in-the-wind':'air pollution',
 'water-water-everywhere':'water','food-on-my-plate':'food','future-and-energy':'energy',
 'wasted':'waste','trees-and-forests':'trees and forests','climate-justice':'climate justice'}

SEO={}
for r,(t,ix,d,og) in HAND.items(): SEO[r]={"title":t,"indexName":ix,"description":d,"ogType":og}
IXNAME={s:HAND[f"/teach/{s}"][1] for s in themes}

for slug in themes:
    for f in sorted(os.listdir(f"{T}/sessions/{slug}")):
        s=json.load(open(f"{T}/sessions/{slug}/{f}")); base=s['title']
        suffix=": a school session"; cap=60-len(suffix)
        b=base if len(base)<=cap else base[:cap].rsplit(' ',1)[0].rstrip(' ,:;-')
        title=f"{b}{suffix}"
        if any(e['title']==title for e in SEO.values()):
            alt=f": a school session on {SHORT[slug]}"; cap2=60-len(alt)
            b2=base if len(base)<=cap2 else base[:cap2].rsplit(' ',1)[0].rstrip(' ,:;-')
            title=f"{b2}{alt}"
        pool=sents(s['fields'].get('description') or [])+sents(s['fields'].get('objective') or [])
        # A truthful tail, composed from the fields this session actually has,
        # for the sessions whose own description is too short to reach 140.
        have=[]
        F=s['fields']
        if F.get('time'): have.append('how long it takes')
        if F.get('materials'): have.append('what you need')
        if F.get('sequence'): have.append('every step')
        if F.get('discussion'): have.append('points for discussion')
        if F.get('extension'): have.append('how to take it further')
        # Tail VARIANTS, longest first, so one is accepted WHOLE by the
        # whole-sentence tier rather than word-trimmed to "...and how."
        def _join(xs):
            return xs[0] if len(xs)==1 else ', '.join(xs[:-1])+' and '+xs[-1]
        tails=[f'The page lists {_join(have[:k])}.' for k in range(len(have),0,-1)]
        # LAST RESORT: two "Exposure Walks" sessions carry no description, no
        # objective and no fields at all — only a trailing block. Its own words
        # beat a generic sentence, so it comes last rather than not at all.
        pool=pool+tails+sents([x for o in s['other'] for x in o['body']])
        d=None
        # PREFIXES OF GRADUATED LENGTH. The description gate is an 18-character
        # window, and a composed tail is only ever used whole, so the prefix has
        # to be able to flex to meet it. Shortest first.
        for pref in (f"{base}: a session on {SHORT[slug]} for teachers.",
                     f"{base}: a classroom session on {SHORT[slug]} from Swechha's compendium for teachers.",
                     f"A classroom session on {SHORT[slug]} from Swechha's Bridge the Gap compendium for schools and NGOs.",
                     f"{base} — a session on {SHORT[slug]} for schools and NGOs, from Swechha's Bridge the Gap teaching compendium.",
                     f"{base} — a classroom session on {SHORT[slug]} from Swechha's Bridge the Gap compendium, for teachers and NGOs working with schools."):
            d=build(pref,pool,whole=tuple(tails))
            if d and not any(e['description']==d for e in SEO.values()): break
            d=None
        assert d, f"no description for /teach/{slug}/{f}"
        SEO[f"/teach/{slug}/{f[:-5]}"]={"title":title,"indexName":f"{base} ({IXNAME[slug]})",
                                        "description":d,"ogType":"article"}
errs=[]
for r,e in SEO.items():
    if L(e['title'])>60: errs.append(f"{r}: title {L(e['title'])}")
    n=L(e['description'])
    if not 140<=n<=158: errs.append(f"{r}: desc {n}")
    head=re.sub(r'\s*—\s*Swechha\s*$','',dec(e['title']))
    if len(head)<15: errs.append(f"{r}: bare label")
    if not any(t in head.lower() for t in TERMS): errs.append(f"{r}: no term — {e['title']}")
    if re.search(r'\b(a|an|the|or|and|of|to|in|on|for|with|from|by|at|is|are|it|as)\.$',dec(e['description'])):
        errs.append(f"{r}: dangling word — ...{e['description'][-40:]}")
for k in ('title','description','indexName'):
    v=[e[k] for e in SEO.values()]
    if len(set(v))!=len(v): errs.append(f"dup {k}: {[x for x in set(v) if v.count(x)>1][:3]}")
print(f"entries {len(SEO)}")
if errs: print("FAILURES:"); [print("  -",x) for x in errs[:20]]; sys.exit(1)
print("all constraints pass, no dangling truncations")
json.dump(SEO,open(SP+"/seo-teach.json","w"),indent=1,ensure_ascii=False)
