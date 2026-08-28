#!/usr/bin/env python3
"""08 — the photographs that ALREADY EXIST and are usable.

Sheet 06 says what to collect. Without this one, nobody can tell what is
already on disk, and somebody gets sent out to photograph a thing we have.
Generated from content/photo-library.json, so it cannot drift.
"""
import csv, json, os, re
HERE=os.path.dirname(os.path.abspath(__file__))
ROOT=os.path.abspath(os.path.join(HERE,"..","..",".."))

lib=json.load(open(os.path.join(ROOT,"content/photo-library.json"),encoding="utf-8"))["photos"]
arr=lib if isinstance(lib,list) else [dict(src=k,**v) for k,v in lib.items()]

# which pages actually use each frame
used={}
pages=os.path.join(ROOT,"public/_pages/v3")
for dp,_,fns in os.walk(pages):
    for fn in fns:
        if not fn.endswith(".html"): continue
        rel=os.path.relpath(os.path.join(dp,fn),pages)
        h=open(os.path.join(dp,fn),encoding="utf-8",errors="ignore").read()
        for src in re.findall(r'/images/photos/[A-Za-z0-9._-]+',h):
            used.setdefault(src,set()).add(rel)

COLS=["File","Alt text (already written)","Credit","Tags","Pixels",
      "Rendering note","Used on which built pages","Usable?"]
rows=[]
for e in sorted(arr,key=lambda x:x.get("src","")):
    src=e.get("src","")
    if e.get("synthetic"): usable="NO — withdrawn as synthetic (22 Aug 2026)"
    elif e.get("stock"):   usable="NO — bought stock, refused by the build"
    else:                  usable="YES"
    note=[]
    if e.get("baked"): note.append("colour baked in — takes NO filter")
    if e.get("placeholder"): note.append("used as a placeholder")
    if e.get("signal"): note.append(f'signal: {e["signal"]}')
    on=sorted(used.get(src,[]))
    rows.append([src, e.get("alt",""), e.get("credit",""),
                 ", ".join(e.get("tags",[])) or "(untagged)",
                 f'{e.get("width","?")}x{e.get("height","?")}',
                 "; ".join(note), ", ".join(on) if on else "NOT USED ANYWHERE", usable])

with open(os.path.join(HERE,"08-photos-we-already-have.csv"),"w",newline="",encoding="utf-8") as f:
    w=csv.writer(f,quoting=csv.QUOTE_ALL); w.writerow(COLS); w.writerows(rows)

u=[r for r in rows if r[-1]=="YES"]
un=[r for r in u if r[-2]=="NOT USED ANYWHERE"]
print(f"08-photos-we-already-have.csv {len(rows)} rows | usable {len(u)} | usable but UNUSED on any page {len(un)}")
