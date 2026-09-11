#!/usr/bin/env python3
"""Render the capability map — the ladder-led view of what this organisation
can do, and how much of each a human still owns.

★ EVERY NODE IS REAL. The catalogue it reads (swechha/ai/capabilities.json) is
  asserted by lib/skilltree.test.ts to name, for every capability, a file that
  actually exists. Nothing aspirational is drawn. The maps that inspired this
  are mostly concepts — one says so on screen and most of its nodes read NOT
  STARTED — and a map where the real and the imagined look alike is worse than
  no map. If this one looks sparse, that is the organisation, honestly drawn.

★ IT COMPUTES NOTHING OF ITS OWN. Ladder, status, dependencies and what the
  human owns all come from the catalogue and the registry. Runtime state, where
  shown, comes from the event log the runners write. This renderer must never
  become a second source of truth.

★ IT WRITES OUTSIDE BOTH REPOSITORIES, to ~/.swechha-ai/. No agent has a write
  path there, which is the owner's standing requirement that agents must not be
  able to fabricate their own status.

THE METAPHOR: distance from the centre is independence. The inner ring is what
the human still does; the outer ring runs without anyone. Reading outward is
reading the ladder.
"""
from __future__ import annotations

import json
import math
import os
import sys
import time
from pathlib import Path

HOME = Path(os.path.expanduser("~"))
VAULT = Path(os.environ.get("WEBSITE_TEAM_VAULT", HOME / "swechha-vault"))
CAPS = VAULT / "swechha/ai/capabilities.json"
DEPTS = VAULT / "swechha/ai/departments.json"
EVENTS = Path(os.environ.get("WEBSITE_TEAM_EVENTS", HOME / ".swechha-ai/activity.jsonl"))
OUT = Path(os.environ.get("SKILLTREE_OUT", HOME / ".swechha-ai/skilltree.html"))

# Swechha's own palette, from the May 2025 guidelines. The ladder leads, so the
# rung decides the colour: teal runs alone, ochre needs a review, coral is yours.
RUNG = {
    "fully_autonomous": {"c": "#4BA1A5", "label": "Fully autonomous", "ring": 3},
    "human_assisted":   {"c": "#D2C662", "label": "Human-assisted",   "ring": 2},
    "human_led":        {"c": "#F05A66", "label": "Human-led",        "ring": 1},
}
RADII = {1: 168, 2: 268, 3: 372}
W, H = 1500, 1040
CX, CY = W / 2, H / 2 + 10


def load():
    caps = json.loads(CAPS.read_text())
    depts = json.loads(DEPTS.read_text())
    return caps, depts


def recent_events(limit=14):
    """Runtime, shown quietly. Absent is absent — never invented."""
    try:
        lines = EVENTS.read_text(encoding="utf-8").splitlines()[-400:]
    except Exception:
        return []
    out = []
    for line in reversed(lines):
        try:
            d = json.loads(line)
        except Exception:
            continue
        out.append(d)
        if len(out) >= limit:
            break
    return out


def layout(caps, depts):
    """Place every capability: department decides the angular sector, the ladder
    rung decides the radius."""
    dept_ids = [d["id"] for d in depts["departments"]]
    by_dept = {d: [c for c in caps["capabilities"] if c["department"] == d] for d in dept_ids}
    sector = 2 * math.pi / max(len(dept_ids), 1)
    placed, dept_nodes = {}, {}

    for i, dept in enumerate(dept_ids):
        # Start at the top and go clockwise; leave a gutter between sectors.
        mid = -math.pi / 2 + sector * i + sector / 2
        dept_nodes[dept] = (CX + 86 * math.cos(mid), CY + 86 * math.sin(mid), mid)
        for rung, r in RADII.items():
            group = [c for c in by_dept[dept]
                     if RUNG[c["ladder"]]["ring"] == rung]
            if not group:
                continue
            span = sector * 0.80
            step = span / max(len(group), 1)
            start = mid - span / 2 + step / 2
            for j, c in enumerate(group):
                a = start + step * j
                placed[c["id"]] = (CX + r * math.cos(a), CY + r * math.sin(a), a, c)
    return placed, dept_nodes, dept_ids


def esc(s):
    return (str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
            .replace('"', "&quot;"))


def render():
    caps, depts = load()
    placed, dept_nodes, dept_ids = layout(caps, depts)
    cl = caps["capabilities"]

    # ── edges: builds_on, drawn beneath everything ──────────────────────────
    edges = []
    for c in cl:
        if c["id"] not in placed:
            continue
        x1, y1, _, _ = placed[c["id"]]
        for dep in c.get("builds_on", []):
            if dep in placed:
                x2, y2, _, _ = placed[dep]
                edges.append(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" '
                             f'class="edge"/>')

    # ── department spokes and labels ────────────────────────────────────────
    spokes, dept_labels = [], []
    for dept in dept_ids:
        dx, dy, mid = dept_nodes[dept]
        spokes.append(f'<line x1="{CX}" y1="{CY}" x2="{dx:.1f}" y2="{dy:.1f}" class="spoke"/>')
        for c in cl:
            if c["department"] == dept and c["id"] in placed:
                x, y, _, _ = placed[c["id"]]
                spokes.append(f'<line x1="{dx:.1f}" y1="{dy:.1f}" x2="{x:.1f}" y2="{y:.1f}" '
                              f'class="spoke"/>')
        lx, ly = CX + 452 * math.cos(mid), CY + 452 * math.sin(mid)
        name = next((d["name"] for d in depts["departments"] if d["id"] == dept), dept)
        n = sum(1 for c in cl if c["department"] == dept)
        anchor = "middle"
        dept_labels.append(
            f'<text x="{lx:.1f}" y="{ly:.1f}" class="deptlabel" text-anchor="{anchor}">'
            f'{esc(name.upper())}</text>'
            f'<text x="{lx:.1f}" y="{ly + 19:.1f}" class="deptsub" text-anchor="{anchor}">'
            f'{n} capabilities</text>')

    # ── nodes ───────────────────────────────────────────────────────────────
    nodes = []
    for c in cl:
        if c["id"] not in placed:
            continue
        x, y, a, _ = placed[c["id"]]
        col = RUNG[c["ladder"]]["c"]
        # A capability proven only once is drawn hollow: real, not yet routine.
        fill = col if c["status"] == "live" else "none"
        nodes.append(
            f'<g class="node" data-id="{esc(c["id"])}" tabindex="0">'
            f'<circle cx="{x:.1f}" cy="{y:.1f}" r="17" class="halo" fill="{col}"/>'
            f'<circle cx="{x:.1f}" cy="{y:.1f}" r="7.5" fill="{fill}" stroke="{col}" '
            f'stroke-width="2"/>'
            f'<text x="{x:.1f}" y="{y - 16:.1f}" class="nodelabel" text-anchor="middle">'
            f'{esc(c["name"])}</text></g>')

    rings = "".join(
        f'<circle cx="{CX}" cy="{CY}" r="{r}" class="ring"/>' for r in RADII.values())

    counts = {k: sum(1 for c in cl if c["ladder"] == k) for k in RUNG}
    legend = "".join(
        f'<div class="lg"><span class="dot" style="background:{v["c"]}"></span>'
        f'{v["label"]}<b>{counts[k]}</b></div>' for k, v in RUNG.items())

    ev = recent_events()
    ev_html = "".join(
        f'<div class="ev"><span class="t">{esc(e.get("ts","")[11:19])}</span>'
        f'<span class="d">{esc(e.get("department",""))}</span>'
        f'<span class="a">{esc(e.get("actor",""))}</span>'
        f'<span class="e">{esc(e.get("event",""))}</span></div>' for e in ev) \
        or '<div class="ev muted">No events recorded yet.</div>'

    data = json.dumps({c["id"]: c for c in cl}, ensure_ascii=False)
    dept_meta = json.dumps({d["id"]: d.get("name", d["id"]) for d in depts["departments"]},
                           ensure_ascii=False)
    live = sum(1 for c in cl if c["status"] == "live")

    body = HEAD.format(
        w=W, h=H, cx=CX, cy=CY, rings=rings, edges="".join(edges), spokes="".join(spokes),
        deptlabels="".join(dept_labels), nodes="".join(nodes), legend=legend,
        data=data, dept_meta=dept_meta, events=ev_html,
        total=len(cl), live=live, depts=len(dept_ids),
        stamp=time.strftime("%d %b %Y, %H:%M"),
    )
    if "--artifact" in sys.argv:
        # An Artifact supplies its own doctype/head/body wrapper.
        return body
    return ("<!doctype html>\n<html lang=\"en\"><head><meta charset=\"utf-8\">"
            "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">"
            + body.replace("<header>", "</head><body>\n<header>", 1)
            + "</body></html>\n")


HEAD = """<title>Swechha Capability Map</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Instrument+Sans:wght@400;500;600&display=swap">
<style>
  :root {{ --bg:#0B0D12; --grid:#161A22; --ink:#E8EAEE; --dim:#79828F; --line:#222834; }}
  * {{ box-sizing:border-box; }}
  body {{ margin:0; background:var(--bg); color:var(--ink);
    font:13px/1.55 "Instrument Sans",ui-sans-serif,-apple-system,"Segoe UI",Roboto,sans-serif;
    background-image:linear-gradient(var(--grid) 1px,transparent 1px),
      linear-gradient(90deg,var(--grid) 1px,transparent 1px);
    background-size:44px 44px; }}
  header {{ display:flex; align-items:baseline; gap:18px; padding:18px 26px 10px; }}
  h1 {{ font-family:"Fraunces",Georgia,serif; font-size:19px; letter-spacing:.02em;
    margin:0; font-weight:600; }}
  .sub {{ color:var(--dim); font-size:12px; }}
  .wrap {{ display:grid; grid-template-columns:1fr 372px; gap:8px; align-items:start; }}
  svg {{ display:block; width:100%; height:auto; }}
  .ring {{ fill:none; stroke:var(--line); stroke-dasharray:2 6; }}
  .spoke {{ stroke:#2A3242; stroke-width:.8; }}
  .edge {{ stroke:#3C4658; stroke-width:1.1; stroke-dasharray:3 4; opacity:.75; }}
  .halo {{ opacity:.10; }}
  .node {{ cursor:pointer; outline:none; }}
  .node:hover .halo, .node:focus .halo {{ opacity:.30; }}
  .nodelabel {{ fill:var(--ink); font-size:10.5px; letter-spacing:.01em; pointer-events:none; }}
  .node:hover .nodelabel {{ fill:#fff; }}
  .deptlabel {{ fill:#C7CEDA; font-size:12px; letter-spacing:.22em; font-weight:600;
    font-family:"Instrument Sans",sans-serif; }}
  .deptsub {{ fill:var(--dim); font-size:10px; letter-spacing:.1em; }}
  .core {{ fill:#11151D; stroke:#2E3646; }}
  .coretext {{ fill:#9AA4B2; font-size:10px; letter-spacing:.2em; text-anchor:middle; }}
  aside {{ padding:14px 26px 30px 0; }}
  .panel {{ border:1px solid var(--line); background:#0E1117; padding:16px; min-height:330px; }}
  .panel h2 {{ margin:0 0 2px; font-size:19px; font-family:"Fraunces",Georgia,serif;
    font-weight:600; text-wrap:balance; line-height:1.2; }}
  .rung {{ display:inline-block; font-size:10px; letter-spacing:.14em; text-transform:uppercase;
    padding:2px 8px; border:1px solid; border-radius:2px; margin-bottom:12px; }}
  .k {{ color:var(--dim); font-size:10px; letter-spacing:.14em; text-transform:uppercase;
    margin:13px 0 3px; }}
  .v {{ font-size:12.5px; }}
  code {{ background:#161B24; padding:1px 5px; font-size:11px; color:#A8B2C0; word-break:break-all; }}
  .lg {{ display:flex; align-items:center; gap:8px; font-size:11.5px; color:#B9C1CD; margin:5px 0; }}
  .lg b {{ margin-left:auto; color:var(--ink); }}
  .dot {{ width:9px; height:9px; border-radius:50%; display:inline-block; }}
  .legend, .feed {{ border:1px solid var(--line); background:#0E1117; padding:13px 16px;
    margin-top:8px; }}
  .feed h3, .legend h3 {{ margin:0 0 9px; font-size:10px; letter-spacing:.16em;
    text-transform:uppercase; color:var(--dim); font-weight:600; }}
  .ev {{ display:flex; gap:9px; font-size:11px; padding:2.5px 0; color:#AEB7C4;
    font-family:ui-monospace,SFMono-Regular,Menlo,monospace; }}
  .ev .t {{ color:#5E6875; }} .ev .d {{ color:#4BA1A5; min-width:74px; }}
  .ev .a {{ color:#7C8798; min-width:96px; }} .ev .e {{ color:#D6DCE5; }}
  .muted {{ color:var(--dim); }}
  footer {{ padding:10px 26px 26px; color:var(--dim); font-size:11px; }}
</style>
<header>
  <h1>Swechha · capability map</h1>
  <span class="sub">{total} capabilities · {live} live · {depts} departments · generated {stamp}</span>
</header>
<div class="wrap">
  <svg viewBox="0 0 {w} {h}" role="img" aria-label="Capability map">
    {rings}{spokes}{edges}
    <circle cx="{cx}" cy="{cy}" r="46" class="core"/>
    <text x="{cx}" y="{cy}" class="coretext">SWECHHA</text>
    <text x="{cx}" y="{cy}" dy="15" class="coretext" style="font-size:9px">the human</text>
    {deptlabels}{nodes}
  </svg>
  <aside>
    <div class="panel" id="panel">
      <h2>Select a capability</h2>
      <div class="v muted">Every node is real: each names a file that exists, and a test
        asserts it. Distance from the centre is independence — the inner ring is what you
        still do, the outer ring runs without you.</div>
    </div>
    <div class="legend"><h3>The ladder</h3>{legend}</div>
    <div class="feed"><h3>Recent activity — written by the runners, not the agents</h3>{events}</div>
  </aside>
</div>
<footer>Ladder and dependencies from swechha/ai/capabilities.json · departments from
  departments.json · activity from ~/.swechha-ai/activity.jsonl. This page computes nothing
  of its own and no agent can write to it.</footer>
<script>
const DATA = {data}, DEPTS = {dept_meta};
const panel = document.getElementById('panel');
function show(id) {{
  const c = DATA[id]; if (!c) return;
  const col = {{fully_autonomous:'#4BA1A5', human_assisted:'#D2C662', human_led:'#F05A66'}}[c.ladder];
  const rung = c.ladder.replace(/_/g,' ');
  const row = (k,v) => v ? `<div class="k">${{k}}</div><div class="v">${{v}}</div>` : '';
  const deps = (c.builds_on||[]).map(d => DATA[d] ? DATA[d].name : d).join(' · ');
  panel.innerHTML =
    `<div class="rung" style="color:${{col}};border-color:${{col}}">${{rung}} · ${{c.status.replace(/_/g,' ')}}</div>`
    + `<h2>${{c.name}}</h2>`
    + `<div class="v muted">${{DEPTS[c.department]||c.department}}</div>`
    + row('What it does', c.what)
    + row('What the human still owns', c.the_human)
    + row('What it replaces', c.replaces)
    + row('Builds on', deps)
    + row('Runs', c.runs)
    + row('Evidence', c.evidence)
    + row('Implemented by', `<code>${{c.implemented_by}}</code>`);
}}
document.querySelectorAll('.node').forEach(n => {{
  n.addEventListener('click', () => show(n.dataset.id));
  n.addEventListener('keydown', e => {{ if (e.key==='Enter'||e.key===' ') {{ e.preventDefault(); show(n.dataset.id); }} }});
}});
</script>
"""


def main() -> int:
    if not CAPS.exists():
        print(f"skilltree: REFUSED — no catalogue at {CAPS}", file=sys.stderr)
        return 2
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(render(), encoding="utf-8")
    caps = json.loads(CAPS.read_text())["capabilities"]
    print(f"skilltree: {len(caps)} capabilities → {OUT}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
