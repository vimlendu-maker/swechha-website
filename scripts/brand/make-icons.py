#!/usr/bin/env python3
"""AD-27.12 / AD-27.13 / AD-27.49 — the favicon set and the share card.

WHAT WAS ACTUALLY WRONG. `app/favicon.ico` existed — 25,931 bytes, 16 August, a
four-image ICO at 16 and 32 — and it was the Next.js scaffold default. So the
address bar was not empty; it was showing somebody else's logo on Swechha's
website. And the 35 static pages never execute the React layout (the beforeFiles
rewrite serves the HTML file), so Next's icon injection never reached them:
zero of 35 carried a `<link rel="icon">` at all.

THE MARK, NOT THE LOCKUP. At 16px a 4:1 horizontal lockup renders the wordmark
at roughly one pixel per letter — unreadable, and it makes the tab look like a
smudge. The mark is a circle with a leaf in it: a silhouette, which is what a
favicon is for.

A SOLID TILE, NOT TRANSPARENCY. A tab strip is light on one OS setting and dark
on another. A transparent PNG with a black mark vanishes in dark mode; with a
white mark it vanishes in light mode. A solid #0D0D0B tile is legible in both,
and it is the site's own ground, so the tab reads as a small piece of the page.
Rejected: transparency in either polarity, and a mustard tile — mustard is a
ground exactly once on this whole site, at #give, and a favicon is a field.

THE CROP IS MEASURED, NOT EYEBALLED. The mark occupies exactly 224x224 at
origin (79, 147) inside both approved lockups (both 2048x512; the alpha bounding
box of the whole lockup is (79,147)-(1914,371)). Verified on both files at the
time of writing and re-asserted on every run below.

PIL, NOT `sips`. BRANDING §8.4: "sips --cropOffset is unreliable. Crop with PIL."

HONEST NOTE ON LEGIBILITY. The mark is a fine-line drawing: at 224px the strokes
are roughly 6px, so at 32px they are ~0.9px and at 16px they are sub-pixel. At
16px this favicon reads as a circle with something in it, and that is enough — a
tab is identified by silhouette and colour, not by draughtsmanship. Do NOT
thicken the strokes. Redrawing the mark is forbidden (BRANDING §2.2: the logo is
an asset, never live type).

    python3 scripts/brand/make-icons.py
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / 'public/brand/swechha-horizontal-white-approved.png'
GROUND = (13, 13, 11, 255)          # #0D0D0B, the site's own ground
CROP = (79, 147, 303, 371)          # 224x224, the mark alone
LOCKUP_BBOX = (79, 147, 1914, 371)  # the whole lockup, ink only

src = Image.open(SRC).convert('RGBA')
if src.size != (2048, 512):
    raise SystemExit(f'{SRC} is {src.size}, not 2048x512 — the crop box below is measured '
                     'against that geometry. Re-measure before changing this line.')
if src.getchannel('A').getbbox() != LOCKUP_BBOX:
    raise SystemExit(f"{SRC}'s ink bounding box moved: {src.getchannel('A').getbbox()} "
                     f'is not {LOCKUP_BBOX}. The asset was re-exported; re-measure the crop.')

mark = src.crop(CROP)

def tile(n: int, flatten: bool = False) -> Image.Image:
    """The mark, edge to edge on the ground, at n x n.

    NO INNER MARGIN. The mark's own circle already provides optical padding
    inside its square; a margin on top of that shrinks the silhouette below
    usefulness at 16px."""
    out = Image.new('RGBA', (n, n), GROUND)
    out.alpha_composite(mark.resize((n, n), Image.LANCZOS))
    # iOS composites transparency onto black inconsistently, so the home-screen
    # icon ships with no alpha channel at all.
    return out.convert('RGB') if flatten else out

written = []


def write(img, rel):
    p = ROOT / rel
    p.parent.mkdir(parents=True, exist_ok=True)
    img.save(p)
    written.append((rel, p.stat().st_size))


# THE MULTI-IMAGE ICO REPLACES THE SCAFFOLD DEFAULT IN PLACE. Next serves
# app/favicon.ico at the origin root for every route on the site, including the
# 35 rewritten static pages, because it is a file convention rather than a page.
# DO NOT add public/favicon.ico alongside it — two files claiming one URL is a
# build error.
tile(48).save(ROOT / 'app/favicon.ico', sizes=[(16, 16), (32, 32), (48, 48)])
written.append(('app/favicon.ico', (ROOT / 'app/favicon.ico').stat().st_size))

write(tile(32), 'public/icons/icon-32.png')
write(tile(180, flatten=True), 'public/icons/apple-touch-icon.png')
# 192 and 512 exist ONLY so that adding a web-app manifest later is a two-line
# job. No manifest ships in this pass: it implies installability and a
# standalone display mode this site has no design for.
write(tile(192), 'public/icons/icon-192.png')
write(tile(512), 'public/icons/icon-512.png')

# ── THE SHARE CARD (AD-27.49) ───────────────────────────────────────────────
# ONE BRAND CARD, CORRECT EVERYWHERE, rather than thirty-five unmaintained ones:
# per-page cards are a production job with no owner and no photo budget, and the
# photo library's provenance is the subject of AD-27.28. NO TEXT IS DRAWN ONTO
# IT — a card with a baked-in tagline goes stale, and BRANDING §2.2 forbids
# re-setting the wordmark as live type.
#
# ONE DEVIATION FROM THE LETTER OF AD-27.49, STATED. The ruling says "resized to
# 900px wide and centred". Resizing the 2048x512 FILE centres its canvas, and
# the canvas is not symmetric about the ink (79px of margin on the left, 134px
# on the right), which would leave the lockup 12px off-centre on the card. So
# the ink is cropped to its own bounding box first and THAT is centred, which is
# what "centred" means to anyone looking at the card.
card = Image.new('RGBA', (1200, 630), GROUND)
lockup = src.crop(LOCKUP_BBOX)
w = 900
h = round(lockup.height * w / lockup.width)
card.alpha_composite(lockup.resize((w, h), Image.LANCZOS), ((1200 - w) // 2, (630 - h) // 2))
write(card.convert('RGB'), 'public/images/og/og-default.png')

for rel, size in written:
    print(f'  {rel:38} {size:>9,} bytes')
print(f'\n{len(written)} files written from {SRC.relative_to(ROOT)}.')
