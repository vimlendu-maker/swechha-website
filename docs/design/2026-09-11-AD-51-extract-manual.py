import os
import re, json
# WHERE THE EXTRACTED PDF TEXT LIVES. Not in the repo — the manual is a 25MB
# PDF and its text dump is an intermediate, so this is passed in:
#   pdftotext -layout "Final BTG MANUAL.docx.pdf" $BTG_TEXT_DIR/btg.txt
#   BTG_TEXT_DIR=/tmp/btg python3 docs/design/2026-09-11-AD-51-extract-manual.py
# It fails here with that instruction rather than on a missing-file traceback.
SP=os.environ.get("BTG_TEXT_DIR")
if not SP or not os.path.isdir(SP):
    raise SystemExit("Set BTG_TEXT_DIR to the directory holding btg.txt "
                     "(pdftotext -layout 'Final BTG MANUAL.docx.pdf' $BTG_TEXT_DIR/btg.txt)")
raw=open(SP+"/btg.txt").read().replace("​","").replace("﻿","")
lines=raw.split("\n")

def is_pagenum(l): return bool(re.fullmatch(r'\d{1,3}', l.strip()))

CANON={
 'DESCRIPTION':'description','OBJECTIVE':'objective','OBJECTIVES':'objective',
 'TEACHING TECHNIQUES':'techniques','METHODOLOGY':'techniques',
 'VOCABULARY':'vocabulary','MATERIALS':'materials','TIME':'time','Time':'time',
 'AGE GROUP':'age','GRADE LEVELS':'age','GRADE LEVEL':'age','Grade Level':'age',
 'TEACHING SEQUENCE':'sequence','PROCEDURE':'sequence','Instructions':'sequence',
 'POINTS FOR DISCUSSION':'discussion','STARTER POINTS FOR DISCUSSION':'discussion',
 'FOLLOW UP DISCUSSION':'discussion',
 'CLOSURE':'closure','EVALUATION':'evaluation','EXTENSION':'extension','SAFETY':'safety',
 'Source':'source','SOURCES':'source','Sources':'source','Resources':'source',
 'Online Resources':'source','Link':'source','Photograph Courtesy':'source','Photo':'source',
 'EXAMPLES':'examples',
}
SHORT={'time','age','vocabulary','techniques','safety'}   # cap at first para; rest is other material
LABEL_RE=re.compile(r'^\s*([A-Z][A-Za-z /&\'‘’\-]{2,34})\s*:\s*(.*)$')
BULLET=re.compile(r'^\s*[●○•▪·‣]\s*|^\s*•\s*')

def label_of(l):
    m=LABEL_RE.match(l)
    if not m: return None,None
    return m.group(1).strip(), m.group(2)

def paras(ls):
    items=[]; buf=[]; mode='p'
    def flush():
        nonlocal buf,mode
        if buf:
            txt=re.sub(r'\s+',' ',' '.join(buf)).strip()
            if txt: items.append({'t':mode,'x':txt})
        buf=[]
    for l in ls:
        if is_pagenum(l): continue
        if not l.strip(): flush(); mode='p'; continue
        if BULLET.match(l):
            flush(); mode='li'; buf=[BULLET.sub('',l).strip()]
        else:
            buf.append(l.strip())
    flush()
    return [i for i in items if i['x']]

def blocks(seg):
    out=[]; cur={'label':None,'key':None,'lines':[]}
    for l in seg:
        if is_pagenum(l): continue
        lab,rest=label_of(l)
        if lab and (lab in CANON or (lab.isupper() and len(lab)>2)):
            if cur['lines'] or cur['label']: out.append(cur)
            cur={'label':lab,'key':CANON.get(lab),'lines':[rest] if rest.strip() else []}
        else:
            cur['lines'].append(l)
    if cur['lines'] or cur['label']: out.append(cur)
    return out

chap=[(i,l.strip()) for i,l in enumerate(lines)
      if re.match(r'^(CHAPTER \d|Chapter \d+:)',l.strip()) and len(l.strip())<90]
GLOSS=next(i for i,l in enumerate(lines) if l.strip().startswith('Glossary (A-Z)'))

THEMES=[('sustainable-development','Sustainable Development','Sustainable development'),
 ('blowing-in-the-wind','Blowing in the Wind','Air pollution and what it does to a body'),
 ('water-water-everywhere','Water, Water, Everywhere','Water, and not a drop to drink'),
 ('food-on-my-plate','Food on my Plate','Where food comes from'),
 ('future-and-energy','Future and Energy','Energy and the future'),
 ('wasted','Wasted!','Waste, and what happens to it'),
 ('trees-and-forests','Trees and Forests','Trees, forests and how they grow'),
 ('climate-justice','Climate Justice and Active Citizenship','Climate justice and active citizenship')]

# Titles for ch1 I-VI, which the manual leaves untitled. Drawn from each activity's own
# DESCRIPTION/OBJECTIVE, and marked editorial so the page can say so.
CH1={'I':'The Three Spheres in Your Own Community',
     'II':'Defining Sustainable, Holistic and Inclusive Development',
     'III':'Issue Analysis',
     'IV':'Issue Analysis: the Jigsaw',
     'V':'Truth, Falsehood and Citizenship',
     'VI':'What Sustainability Means to You'}

SUBHEAD=re.compile(r'^\s*(\d+\.\d+\.?)\s+(.{3,64})$')

out=[]
for ci,(cl,ctitle) in enumerate(chap):
    end = chap[ci+1][0] if ci+1<len(chap) else GLOSS
    slug,name,sub = THEMES[ci]
    acts=[(j,re.match(r'^\s*ACTIVITY ([IVX]+)\s*$',lines[j]).group(1))
          for j in range(cl,end) if re.match(r'^\s*ACTIVITY [IVX]+\s*$',lines[j])]
    # theme reading material = everything between the chapter head and the first activity,
    # minus the MODULE SUMMARY table (column-bled OCR, unusable)
    stop = acts[0][0] if acts else end
    ms=[j for j in range(cl,stop) if 'MODULE SUMMARY' in lines[j]]
    if ms: stop=ms[0]
    seg=lines[cl+1:stop]
    # split reading into sections on numbered sub-headings
    secs=[]; cur={'h':None,'lines':[]}
    for l in seg:
        m=SUBHEAD.match(l)
        h = m.group(2).strip().rstrip(':').strip() if m else None
        if m and not LABEL_RE.match(l) and len(l.strip())<78 and not h.endswith('.') and h.count(':')==0:
            if cur['lines']: secs.append(cur)
            cur={'h':h,'lines':[]}
        else: cur['lines'].append(l)
    if cur['lines']: secs.append(cur)
    reading=[{'h':s['h'],'body':paras(s['lines'])} for s in secs]
    reading=[s for s in reading if s['body']]

    sessions=[]
    for ai,(j,num) in enumerate(acts):
        aend = acts[ai+1][0] if ai+1<len(acts) else end
        seg=lines[j+1:aend]
        title=None; drop=None
        for k,l in enumerate(seg):
            if is_pagenum(l) or not l.strip(): continue
            lab,_=label_of(l)
            if lab and (lab in CANON or lab.isupper()): break
            title=l.strip(); drop=k; break
        tsrc='manual'
        if title:
            m=re.match(r'^(?:Game Name|Title)\s*:\s*(.+)$', title, re.I)
            if m: title=m.group(1).strip()
            seg=seg[:drop]+seg[drop+1:]
        if not title or len(title)>110:
            title = CH1.get(num) if ci==0 else None
            tsrc='editorial'
        if not title: title=f'Activity {num}'; tsrc='editorial'
        title=re.sub(r'^[‘’\'"]+|[‘’\'"]+$','',title).strip().rstrip('.')
        if title.isupper() and len(title)>4: title=title.title()

        fields={}; other=[]
        for b in blocks(seg):
            p=paras(b['lines'])
            if not p: continue
            k2=b['key']
            if k2 in SHORT:
                fields.setdefault(k2,[]).append(p[0])
                if len(p)>1: other.append({'label':None,'body':p[1:]})
            elif k2:
                fields.setdefault(k2,[]).extend(p)
            else:
                other.append({'label':b['label'],'body':p})
        sessions.append({'n':num,'slug':None,'title':title,'title_source':tsrc,
                         'fields':fields,'other':other})
    # slugs, unique within theme
    seen={}
    for s in sessions:
        b=re.sub(r'[^a-z0-9]+','-',s['title'].lower()).strip('-')[:48].strip('-')
        if b in seen:
            seen[b]+=1; b=f"{b}-{seen[b]}"
        else: seen[b]=1
        s['slug']=b
    out.append({'slug':slug,'name':name,'sub':sub,'printed_as':ctitle,
                'reading':reading,'sessions':sessions})

json.dump(out,open(SP+"/btg-parsed.json","w"),indent=1,ensure_ascii=False)
print("themes",len(out),"sessions",sum(len(t['sessions']) for t in out))
for t in out:
    rw=sum(len(s['body']) for s in t['reading'])
    print(f"\n== {t['name']} — reading: {len(t['reading'])} sections / {rw} blocks")
    for s in t['reading'][:6]: print(f"     § {str(s['h'])[:66]}  ({len(s['body'])})")
    for s in t['sessions']:
        print(f"   {s['n']:5s} {s['slug'][:40]:42s} {sorted(s['fields'])} other={len(s['other'])} {'' if s['title_source']=='manual' else '[editorial title]'}")
