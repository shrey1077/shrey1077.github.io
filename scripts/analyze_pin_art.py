"""
analyze_pin_art.py — one-off probe for the pin artwork.

Reports, per pin: the lead ring's own colour (for the hover fill) and the
bounding box of the LABEL TEXT, so a mirror pass can flip the art and then put
the words back the right way round. Draws each box onto a PNG for eyeballing.

⚠ Two things this got wrong first time round, both worth keeping written down:
  · `circleR` is a fraction of the image HEIGHT (ART multiplies it by ART_H)
    while `circleCX` is a fraction of the WIDTH. Adding them as if they shared
    a basis put the scan window ~200px too far right, truncating every box and
    losing "Art" completely.
  · Dark-and-desaturated alone is not "text": the paint splash carries dark
    droplets and shadows, which inflated the boxes by ~300px across. A real
    glyph pixel has near-white pill DIRECTLY ABOVE AND BELOW it.
"""

from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
PINS = ROOT / "public" / "content" / "pins"
OUTDIR = Path(
    r"C:\Users\tatai\AppData\Local\Temp\claude"
    r"\D--Assets\b593d8d6-adf2-4542-af01-e44ce54de87d\scratchpad"
)

# Fractions copied from ART in BrainPins.tsx.
ART = {
    "art": dict(circleCX=0.2393, circleR=0.2034, ringCX=0.0508, ringCY=0.6266),
    "publications": dict(circleCX=0.215, circleR=0.2034, ringCX=0.0392, ringCY=0.4938),
    "the-extincts-project": dict(circleCX=0.1786, circleR=0.1999, ringCX=0.0182, ringCY=0.4984),
    "ai-generations": dict(circleCX=0.1867, circleR=0.2015, ringCX=0.0289, ringCY=0.5391),
}


def lum(p):
    return 0.2126 * p[0] + 0.7152 * p[1] + 0.0722 * p[2]


def sat(p):
    mx, mn = max(p[:3]), min(p[:3])
    return 0 if mx == 0 else (mx - mn) / mx


for name, m in ART.items():
    im = Image.open(PINS / f"{name}.webp").convert("RGBA")
    w, h = im.size
    px = im.load()

    # ── the lead ring's colour: most saturated opaque pixel near the ring ──
    rx, ry = int(m["ringCX"] * w), int(m["ringCY"] * h)
    best, bestsat = None, -1.0
    rad = max(6, int(0.02 * w))
    for x in range(max(0, rx - rad), min(w, rx + rad)):
        for y in range(max(0, ry - rad), min(h, ry + rad)):
            p = px[x, y]
            if p[3] < 200:
                continue
            s = sat(p)
            if s > bestsat:
                bestsat, best = s, p

    def white(x, yy):
        if yy < 0 or yy >= h:
            return False
        q = px[x, yy]
        return q[3] > 200 and lum(q) > 225

    x_start = int(m["circleCX"] * w + m["circleR"] * h)
    xs, ys = [], []
    for x in range(x_start, w):
        for y in range(h):
            p = px[x, y]
            if p[3] < 200:
                continue
            if not (lum(p) < 110 and sat(p) < 0.25):
                continue
            if any(white(x, y - d) for d in range(6, 46)) and any(
                white(x, y + d) for d in range(6, 46)
            ):
                xs.append(x)
                ys.append(y)

    bbox = (min(xs), min(ys), max(xs) + 1, max(ys) + 1) if xs else None

    if bbox:
        vis = Image.new("RGB", (w, h), (249, 249, 249))
        vis.paste(im, mask=im.split()[-1])
        ImageDraw.Draw(vis).rectangle(bbox, outline=(0, 200, 0), width=4)
        vis.resize((w // 2, h // 2)).save(OUTDIR / f"box-{name}.png")

    hexc = "#%02x%02x%02x" % best[:3] if best else "?"
    print(f"{name:24} {w}x{h}")
    print(f"    ring colour : {hexc}  (sat {bestsat:.2f})")
    if bbox:
        print(f"    text bbox   : {bbox}")
        print(
            f"    as fraction : x {bbox[0] / w:.4f}-{bbox[2] / w:.4f}"
            f"   y {bbox[1] / h:.4f}-{bbox[3] / h:.4f}"
        )
    else:
        print("    text bbox   : NONE")
