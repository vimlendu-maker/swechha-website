import os, re, json
# WHERE THE EXTRACTED PDF TEXT LIVES. Not in the repo — the manual is a 25MB
# PDF and its text dump is an intermediate, so this is passed in:
#   pdftotext -layout "Final BTG MANUAL.docx.pdf" $BTG_TEXT_DIR/btg.txt
#   BTG_TEXT_DIR=/tmp/btg python3 docs/design/2026-09-11-AD-51-extract-manual.py
# It fails here with that instruction rather than on a missing-file traceback.
SP=os.environ.get("BTG_TEXT_DIR")
if not SP or not os.path.isdir(SP):
    raise SystemExit("Set BTG_TEXT_DIR to the directory holding btg.txt "
                     "(pdftotext -layout 'Final BTG MANUAL.docx.pdf' $BTG_TEXT_DIR/btg.txt)")
# ★ DERIVED FROM THIS FILE'S LOCATION, NEVER HARDCODED.
# This was an absolute path to one checkout, and running the script from a git
# worktree therefore wrote 54 data files into the OTHER working tree — silently,
# and while reporting success. `docs/design/` is two levels below the repo root.
ROOT=os.path.dirname(os.path.dirname(os.path.dirname(os.path.realpath(__file__))))
OUT=os.path.join(ROOT,"data","teach")
lines=open(SP+"/btg.txt").read().replace("​","").replace("﻿","").split("\n")
themes=json.load(open(SP+"/btg-parsed.json"))

def is_pn(l): return bool(re.fullmatch(r'\s*\d{1,3}\s*', l))
BULLET=re.compile(r'^\s*[●○•▪·‣]\s*')
def paras(ls):
    items=[];buf=[];mode='p'
    def flush():
        nonlocal buf,mode
        if buf:
            t=re.sub(r'\s+',' ',' '.join(buf)).strip()
            if t: items.append({'t':mode,'x':t})
        buf=[]
    for l in ls:
        if is_pn(l): continue
        if not l.strip(): flush(); mode='p'; continue
        if BULLET.match(l): flush(); mode='li'; buf=[BULLET.sub('',l).strip()]
        else: buf.append(l.strip())
    flush(); return [i for i in items if i['x']]


# ── SPLIT A RUN-ON TEACHING SEQUENCE BACK INTO ITS OWN STEPS.
# The manual numbers its steps, but the PDF puts each bare number on its own
# line, so joining wrapped lines into paragraphs swallows them and a 1,700-char
# sequence arrives as ONE block — which renders as a single "step 01" holding a
# wall of text. The numbering is real structure in the source, so it is restored
# here in the DATA rather than papered over in the generator.
# Guarded three ways, because a naive split on r"\d+\." fragments "3.5 litres"
# and "No. 2": the numbers must form an ASCENDING RUN from 1, there must be at
# least TWO of them, and the period must NOT be followed by a digit. The space
# after it is optional — one session numbers its steps "1.Hold up a jar".
def split_steps(blocks):
    out=[]
    for b in blocks:
        if b['t']!='p':
            out.append(b); continue
        t=b['x']
        marks=[]; expect=1
        for m in re.finditer(r'(?:(?<=^)|(?<=\s))(\d{1,2})\.(?!\d)\s*', t):
            if int(m.group(1))==expect:
                marks.append(m); expect+=1
        if len(marks)<2:
            out.append(b); continue
        for i,m in enumerate(marks):
            start=m.end()
            end=marks[i+1].start() if i+1<len(marks) else len(t)
            x=re.sub(r'\s+',' ',t[start:end]).strip()
            if x: out.append({'t':'p','x':x})
        head=re.sub(r'\s+',' ',t[:marks[0].start()]).strip()
        if head: out.insert(len(out)-len(marks), {'t':'p','x':head})
    return out

# ---------- teacher's guide (the ESD introduction) ----------
ch1=next(i for i,l in enumerate(lines) if l.strip().startswith('CHAPTER 1'))
TOP=re.compile(r'^\s*(\d)\.\s+(.{4,70})$')
SUB=re.compile(r'^\s*(\d\.\d(?:\.\d)?)\s+(.{3,70})$')
secs=[];cur=None;sub=None
for i in range(39,ch1):
    l=lines[i]
    mt=TOP.match(l); ms=SUB.match(l)
    if mt and not ms and len(l.strip())<76 and not mt.group(2).strip().endswith('.'):
        if cur: secs.append(cur)
        cur={'n':mt.group(1),'h':mt.group(2).strip().rstrip(':').strip(),'subs':[{'h':None,'lines':[]}]}
        continue
    if ms and cur and len(l.strip())<76:
        cur['subs'].append({'h':ms.group(2).strip().rstrip(':').strip(),'lines':[]}); continue
    if cur: cur['subs'][-1]['lines'].append(l)
if cur: secs.append(cur)
guide=[{'n':s['n'],'h':s['h'],
        'subs':[{'h':x['h'],'body':paras(x['lines'])} for x in s['subs'] if paras(x['lines'])]}
       for s in secs]
guide=[g for g in guide if g['subs']]

# ---------- glossary ----------
gi=next(i for i,l in enumerate(lines) if l.strip().startswith('Glossary (A-Z)'))
g="\n".join(lines[gi+1:])
terms=[]
for m in re.finditer(r'[●•]\s*([A-Za-z][A-Za-z \-/()\'’]{1,55}?)\s*[-–—]\s*(.+?)(?=\n\s*[●•]|\n\s*[A-Z]\s*\n|\Z)', g, re.S):
    t=m.group(1).strip().rstrip('-').strip()
    dfn=re.sub(r'\s+',' ',m.group(2)).strip()
    dfn=re.sub(r'\s*\b\d{1,3}\b\s*$','',dfn).strip()
    if 1<len(t)<60 and len(dfn)>4: terms.append({'term':t,'def':dfn})
seen=set();gl=[]
for t in terms:
    k=t['term'].lower()
    if k in seen: continue
    seen.add(k); gl.append(t)
gl.sort(key=lambda x:x['term'].lower())

os.makedirs(OUT+"/themes",exist_ok=True)
for t in themes: os.makedirs(f"{OUT}/sessions/{t['slug']}",exist_ok=True)

FAMILIES=[
 {"id":"frame","h":"How to think about it","themes":["sustainable-development"]},
 {"id":"systems","h":"Five systems of a city",
  "themes":["blowing-in-the-wind","water-water-everywhere","food-on-my-plate","wasted","trees-and-forests"]},
 {"id":"next","h":"What happens next","themes":["future-and-energy","climate-justice"]}]

PHOTO={"sustainable-development":"bridge-the-gap-outdoor-briefing.jpg",
 "blowing-in-the-wind":None,
 "water-water-everywhere":"yamuna-students-foam-line.jpg",
 "food-on-my-plate":None,
 "future-and-energy":None,
 "wasted":"bridge-the-gap-exposure-trip-landfill.jpg",
 "trees-and-forests":"bridge-the-gap-tree-planting-huddle.jpg",
 "climate-justice":"bridge-the-gap-no-dumping-banner.jpg"}

LEARN={"blowing-in-the-wind":["cpcb-aqi","pm25","pm10","delhi-aqi"],
 "water-water-everywhere":["yamuna-pollution","yamuna-bod","yamuna-dissolved-oxygen","faecal-coliform","groundwater-delhi"],
 "trees-and-forests":["forest-cover-vs-tree-cover","forest-loss-india","tree-cover-loss"],
 "climate-justice":["environmental-deaths-india","india-heatwave","extreme-rainfall"],
 "sustainable-development":["how-to-read-environmental-data","measured-vs-modelled","reporting-floor"]}

idx={"eyebrow":"Bridge the Gap","h1":"Take it into the room.",
 "lead":"Swechha's education programme, written out in full: the background a teacher needs on each theme, and the sessions that go with it. Use one, use all of them, change them for your own classroom.",
 "families":FAMILIES,
 "themes":[{"slug":t['slug'],"name":t['name'],"sub":t['sub'],
            "sessions":len(t['sessions']),"reading":len(t['reading']),
            "photo":PHOTO[t['slug']]} for t in themes]}
json.dump(idx,open(OUT+"/index.json","w"),indent=1,ensure_ascii=False)
# ★ A CURATED GUIDE IS NOT REBUILT. The guide gained a section that is not in
# the manual's front matter — the reference list, moved out of the climate
# chapter's last activity where the source document had attached it. Rebuilding
# from the front matter alone silently drops it, which is what happened once.
gp=OUT+"/before-you-start.json"
if os.path.exists(gp) and json.load(open(gp)).get('curated'):
    print("  PRESERVED curated guide — delete `curated` to regenerate")
else:
    json.dump({"h1":"Before you start","sections":guide},
              open(gp,"w"),indent=1,ensure_ascii=False)
json.dump({"h1":"The A to Z","terms":gl},open(OUT+"/a-to-z.json","w"),indent=1,ensure_ascii=False)

ns=0
for t in themes:
    # ★ A THEME WHOSE READING HAS BEEN REWRITTEN IS NOT OVERWRITTEN.
    # The air chapter as printed taught the United Kingdom, so its reading was
    # replaced by hand and the theme file carries a `reading_note` saying so.
    # Re-running this extractor would otherwise restore the original text
    # silently — the failure mode being that nobody notices the site has gone
    # back to teaching the 1952 London smog. The presence of `reading_note` is
    # the flag, and it is preserved along with the reading it describes.
    tp=f"{OUT}/themes/{t['slug']}.json"
    keep=None
    if os.path.exists(tp):
        prev=json.load(open(tp))
        if prev.get('reading_note'):
            keep=prev
    if keep:
        print(f"  PRESERVED rewritten reading: {t['slug']} "
              f"({len(keep['reading'])} sections) — delete reading_note to regenerate")
        json.dump(keep, open(tp,'w'), indent=1, ensure_ascii=False); open(tp,'a').write('\n')
    else:
        json.dump({"slug":t['slug'],"name":t['name'],"sub":t['sub'],
                   "printed_as":t['printed_as'],"photo":PHOTO[t['slug']],
                   "learn":LEARN.get(t['slug'],[]),"reading":t['reading']},
                  open(tp,"w"),indent=1,ensure_ascii=False)
    for i,s in enumerate(t['sessions']):
        # ★ AND A SESSION SWECHHA HAS ANNOTATED IS NOT OVERWRITTEN EITHER.
        # Same reasoning as the theme guard above: a `content_note` records a
        # re-attributed foreign figure or a table that did not survive
        # extraction, and re-running this would drop the annotation while
        # restoring the text it was written about.
        sp=f"{OUT}/sessions/{t['slug']}/{s['slug']}.json"
        if os.path.exists(sp):
            prev=json.load(open(sp))
            if prev.get('content_note'):
                print(f"  PRESERVED annotated session: {t['slug']}/{s['slug']}"
                      f" — delete content_note to regenerate")
                json.dump(prev, open(sp,'w'), indent=1, ensure_ascii=False); open(sp,'a').write('\n')
                ns+=1
                continue
        json.dump({"theme":t['slug'],"position":i+1,"numeral":s['n'],
                   "title":s['title'],"title_source":s['title_source'],
                   "fields":{**s['fields'],
                             **({"sequence":split_steps(s['fields']['sequence'])}
                                if s['fields'].get('sequence') else {})},
                   "other":s['other']},
                  open(sp,"w"),indent=1,ensure_ascii=False)
        ns+=1
print(f"themes 8  sessions {ns}  guide sections {len(guide)}  glossary terms {len(gl)}")
print("guide:", [f"{g['n']}. {g['h'][:42]}" for g in guide])
print("glossary sample:", [x['term'] for x in gl[:6]], "...", [x['term'] for x in gl[-3:]])
