"""
mirror_pin_art.py — mirror the four creative pin artworks, keeping the labels
readable.

The owner asked (2026-08-21) for the right-hand column — sections AND their
connector lines — to read as a mirror image, with the text of course still
running left-to-right. The pill, circle, lead ring, splash and LABEL are all
baked into each WebP, so a CSS `scaleX(-1)` would reverse the words too.

THE METHOD, and why it is this and not text detection:
  1. Flip the whole image. Everything is now mirrored, words included.
  2. Flip ONE region back: the pill's own SILHOUETTE — its white body, the label
     glyphs enclosed in it, and its outline. That region holds the label and
     nothing else, so the words come back the right way round while the circle,
     the lead ring and the splash stay mirrored.

  Locating it needs only the pill, found as the largest connected near-white
  region and then hole-filled and grown 2px. Detecting the glyphs directly was
  tried first and is not reliable here: the splash carries dark desaturated
  droplets AND white highlights, so "dark pixel with white above and below"
  grabs a chunk of paint and the box ran ~380px past the end of the word. The
  pill is a big solid shape and is not ambiguous.

  ⚠ IT IS THE SILHOUETTE, NOT THE BOUNDING RECTANGLE. That was the first
  attempt and it is wrong: the splash crosses the pill on all four artworks, so
  flipping the rectangle re-mirrors the paint inside it and leaves a hard
  rectangular seam standing out against the surrounding splash. Masking to the
  shape ends the flip on the pill's own outline, where an edge already exists.

  ⚠ The circle is a SEPARATE white component — a dark outline runs between it
  and the pill — so it is outside the mask and stays mirrored, which is what the
  brief wants. An earlier version assumed it sat inside the pill's box and
  subtracted its width from that box; that un-flipped only part of each label
  and left the words half reversed.

Originals are copied to pins/_orig/ once and are always the input, so this is
idempotent and re-runnable. Do not delete _orig: the four WebPs are the only
copies of the supplied art, and there is no source file for them anywhere.

Output: public/content/pins/*.webp (mirrored, in place)
        public/content/pins/_orig/*.webp (pristine)
Also prints the mirrored ART constants for BrainPins.tsx.
"""

from collections import deque
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
PINS = ROOT / "public" / "content" / "pins"
ORIG = PINS / "_orig"

# circleR is a fraction of HEIGHT; circleCX / ringCX are fractions of WIDTH.
ART = {
    "art": dict(circleCX=0.2393, circleCY=0.6458, circleR=0.2034, ringCX=0.0508, ringCY=0.6266),
    "publications": dict(circleCX=0.215, circleCY=0.5108, circleR=0.2034, ringCX=0.0392, ringCY=0.4938),
    "the-extincts-project": dict(circleCX=0.1786, circleCY=0.5121, circleR=0.1999, ringCX=0.0182, ringCY=0.4984),
    "ai-generations": dict(circleCX=0.1867, circleCY=0.5583, circleR=0.2015, ringCX=0.0289, ringCY=0.5391),
}


def lum(p):
    return 0.2126 * p[0] + 0.7152 * p[1] + 0.0722 * p[2]


def pill_mask(im):
    """A boolean mask of the pill SHAPE — its white body, the label glyphs
    enclosed inside it, and its outline — plus that shape's bounding box.

    ⚠ A bounding RECTANGLE is not good enough. The paint splash crosses the
    pill on every one of the four artworks, so flipping the rectangle back
    mirrors the splash inside it too and leaves a hard rectangular seam around
    the pill, plainly visible against the surrounding paint. Masking to the
    pill's own silhouette keeps the splash mirrored right up to the pill edge,
    where a real outline already is.
    """
    w, h = im.size
    px = im.load()
    seen = [[False] * h for _ in range(w)]

    def ok(x, y):
        q = px[x, y]
        return q[3] > 200 and lum(q) > 232

    best = None
    best_n = 0
    # Seed only from the middle band: the pill always crosses it, and this
    # skips the splash's white highlights near the top and bottom edges.
    for sx in range(w):
        for sy in range(int(h * 0.35), int(h * 0.65)):
            if seen[sx][sy] or not ok(sx, sy):
                continue
            comp = []
            q = deque([(sx, sy)])
            seen[sx][sy] = True
            x0 = x1 = sx
            y0 = y1 = sy
            while q:
                x, y = q.popleft()
                comp.append((x, y))
                x0, x1 = min(x0, x), max(x1, x)
                y0, y1 = min(y0, y), max(y1, y)
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < w and 0 <= ny < h and not seen[nx][ny] and ok(nx, ny):
                        seen[nx][ny] = True
                        q.append((nx, ny))
            if len(comp) > best_n:
                best_n, best = len(comp), (comp, (x0, y0, x1 + 1, y1 + 1))
    if best is None:
        return None, None

    comp, (x0, y0, x1, y1) = best
    mask = [[False] * h for _ in range(w)]
    for x, y in comp:
        mask[x][y] = True

    # Fill holes: anything inside the bbox not reachable from its border
    # without crossing the pill is enclosed — the label glyphs.
    pad = 2
    bx0, by0 = max(0, x0 - pad), max(0, y0 - pad)
    bx1, by1 = min(w, x1 + pad), min(h, y1 + pad)
    outside = [[False] * h for _ in range(w)]
    q = deque()
    for x in range(bx0, bx1):
        for y in (by0, by1 - 1):
            if not mask[x][y] and not outside[x][y]:
                outside[x][y] = True
                q.append((x, y))
    for y in range(by0, by1):
        for x in (bx0, bx1 - 1):
            if not mask[x][y] and not outside[x][y]:
                outside[x][y] = True
                q.append((x, y))
    while q:
        x, y = q.popleft()
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if bx0 <= nx < bx1 and by0 <= ny < by1 and not mask[nx][ny] and not outside[nx][ny]:
                outside[nx][ny] = True
                q.append((nx, ny))
    for x in range(bx0, bx1):
        for y in range(by0, by1):
            if not mask[x][y] and not outside[x][y]:
                mask[x][y] = True

    # Grow by 2px so the pill's own dark outline travels with the shape.
    for _ in range(2):
        add = []
        for x in range(bx0, bx1):
            for y in range(by0, by1):
                if mask[x][y]:
                    continue
                if any(
                    0 <= x + dx < w and 0 <= y + dy < h and mask[x + dx][y + dy]
                    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))
                ):
                    add.append((x, y))
        for x, y in add:
            mask[x][y] = True

    return mask, (bx0, by0, bx1, by1)


ORIG.mkdir(parents=True, exist_ok=True)
print("mirrored pin art\n")
out_consts = []

for name, m in ART.items():
    live = PINS / f"{name}.webp"
    keep = ORIG / f"{name}.webp"
    if not keep.exists():
        keep.write_bytes(live.read_bytes())

    im = Image.open(keep).convert("RGBA")
    w, h = im.size

    mask, box = pill_mask(im)
    if box is None:
        print(f"  {name:24} PILL NOT FOUND — skipped")
        continue
    px0, py0, px1, py1 = box

    flipped = im.transpose(Image.FLIP_LEFT_RIGHT)

    # ⚠ The circle is a SEPARATE white component from the pill — a dark outline
    #   runs between them — so it is NOT in this mask and stays mirrored, which
    #   is what the brief wants. The label occupies the pill itself, so the
    #   pill's silhouette is what flips back.
    from PIL import Image as _I

    mimg = _I.new("L", (w, h), 0)
    mpx = mimg.load()
    for x in range(px0, px1):
        for y in range(py0, py1):
            if mask[x][y]:
                mpx[x, y] = 255

    orig_crop = im.crop(box)
    orig_mask = mimg.crop(box)
    dest = (w - px1, py0)
    flipped.paste(orig_crop, dest, orig_mask)

    flipped.save(live, "WEBP", quality=92, method=6)

    out_consts.append(
        (name, 1 - m["circleCX"], m["circleCY"], m["circleR"], 1 - m["ringCX"], m["ringCY"])
    )
    print(f"  {name:24} pill {box} -> x{dest[0]}")

print("\nmirrored ART constants (circleCX and ringCX become 1 - x):")
for n, ccx, ccy, cr, rcx, rcy in out_consts:
    print(
        f"    {n:24} circleCX: {ccx:.4f}, circleCY: {ccy:.4f}, "
        f"circleR: {cr:.4f}, ringCX: {rcx:.4f}, ringCY: {rcy:.4f}"
    )
