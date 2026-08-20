"""measure_logo_ink.py — size every board mark by its INK, not its file.

The board fits each mark into one centred box and lets `object-contain` do the
rest, which sizes a logo by its BOUNDING BOX. That is not what the eye reads.
A wordmark that is 90% whitespace and a solid roundel with the same bounding
box carry wildly different amounts of ink, so they land looking nothing like
the same size — which is what `logoScale` was being hand-tuned to patch.

This measures the thing that actually matters: how many rendered pixels of a
plate each mark's ink would cover, and what per-mark scale makes them equal.

INK, and what counts as whitespace
  Two kinds of emptiness have to go:
    · transparent padding around the art, and
    · a baked-in white background (abs.png and newsmobile.png both have one).
  A mark whose ink IS white (mycoveda-symbol) must not be erased by the second
  rule, so the white background is only subtracted when the image's corners are
  actually opaque white — i.e. when there is a background there to subtract.

GEOMETRY, mirroring SectionPanel
  plate  : aspect 4/3, width W  ->  h = 0.75W
  box    : w% = min(62 * scale, 94), h% = min(31 * scale, 94)
  mark   : object-contain inside that box, so it keeps its own aspect
  ink    : (ink px / all px) * rendered width * rendered height

⚠ The 94% ceiling means ink area SATURATES: past some scale the box stops
growing and no further scale helps. Any mark that cannot reach the target even
at the ceiling is reported, rather than silently pinned at the cap.

Run with the repo Python (PIL + numpy). Reads only; prints a table.
"""

import json
import pathlib
import numpy as np
from PIL import Image

ROOT = pathlib.Path("D:/Brain Folio/public")

# Every mark the board fits into the logo box. The `fill` cells (a study's own
# work plate) cover the plate edge to edge and are deliberately not here.
CLIENT_MARKS = [
    ("tata-iis", "/content/career/tata-iis.png"),
    ("azoth-biotech", "/content/clients/azoth-biotech/brand/logo-azoth.png"),
    ("abs", "/content/career/abs.png"),
    ("zabraku-media", "/content/clients/zabraku-media/zabraku-logo-dark.png"),
    ("newsmobile", "/content/career/newsmobile.png"),
    ("uid", "/content/clients/uid/brand/uid-logo.png"),
    ("chess", "/chess/images/logo.png"),
    ("first-divine", "/content/logofolio/first-divine.png"),
    ("komono", "/content/logofolio/komono.png"),
]

BOX_W, BOX_H, BOX_MAX = 62.0, 31.0, 94.0
PLATE_W = 1000.0                  # arbitrary; only ratios matter
PLATE_H = PLATE_W * 3 / 4


def ink_fraction(path: pathlib.Path) -> tuple[float, tuple[int, int], bool]:
    """Fraction of the image that is ink, its size, and whether a white
    background was subtracted."""
    im = Image.open(path).convert("RGBA")
    a = np.asarray(im).astype(np.int16)
    rgb, alpha = a[..., :3], a[..., 3]
    opaque = alpha > 40

    # Is there a baked-in white background? Ask the corners, not the histogram —
    # a mark can legitimately be mostly white ink.
    h, w = opaque.shape
    corners = [(0, 0), (0, w - 1), (h - 1, 0), (h - 1, w - 1)]
    white_bg = all(opaque[y, x] and rgb[y, x].min() > 235 for y, x in corners)

    mask = opaque
    if white_bg:
        mask = opaque & (rgb.min(axis=2) <= 235)

    return float(mask.sum()) / float(w * h), im.size, white_bg


def rendered_ink(frac: float, size: tuple[int, int], scale: float) -> float:
    """Plate px of ink at a given scale, mirroring the board's geometry."""
    bw = PLATE_W * min(BOX_W * scale, BOX_MAX) / 100.0
    bh = PLATE_H * min(BOX_H * scale, BOX_MAX) / 100.0
    aspect = size[0] / size[1]
    # object-contain: fit inside the box, keep aspect.
    rw = min(bw, bh * aspect)
    rh = rw / aspect
    return frac * rw * rh


def scale_for(frac: float, size: tuple[int, int], target: float) -> tuple[float, bool]:
    """Smallest scale whose ink area reaches `target`. Returns (scale, capped)."""
    lo, hi = 0.05, 12.0
    if rendered_ink(frac, size, hi) < target:
        return hi, True
    for _ in range(80):
        mid = (lo + hi) / 2
        if rendered_ink(frac, size, mid) < target:
            lo = mid
        else:
            hi = mid
    return round((lo + hi) / 2, 2), False


def main() -> None:
    marks = list(CLIENT_MARKS)
    man = json.loads((ROOT / "content/logofolio/_manifest.json").read_text())
    for e in man:
        url = f"/content/logofolio/{e['slug']}.png"
        if url not in {u for _, u in marks}:
            marks.append((f"logofolio:{e['slug']}", url))

    rows = []
    for name, url in marks:
        p = ROOT / url.lstrip("/")
        if not p.exists():
            print(f"  MISSING {name}: {url}")
            continue
        frac, size, wbg = ink_fraction(p)
        rows.append({"name": name, "url": url, "frac": frac, "size": size, "white_bg": wbg})

    # Azoth is the reference, at the scale it ships with today.
    ref = next(r for r in rows if r["name"] == "azoth-biotech")
    target = rendered_ink(ref["frac"], ref["size"], 2.0)
    print(f"target = Azoth at its current logoScale 2 -> {target:,.0f} plate px of ink")
    print(f"        (ink is {ref['frac'] * 100:.1f}% of its {ref['size'][0]}x{ref['size'][1]} file)\n")

    print(f"{'mark':<28}{'ink%':>7}{'aspect':>8}{'wbg':>5}{'now':>7}{'->':>4}{'scale':>7}  note")
    for r in rows:
        s, capped = scale_for(r["frac"], r["size"], target)
        asp = r["size"][0] / r["size"][1]
        note = "CANNOT REACH TARGET (box ceiling)" if capped else ""
        print(
            f"{r['name']:<28}{r['frac'] * 100:>6.1f}%{asp:>8.2f}{'y' if r['white_bg'] else '-':>5}"
            f"{'':>7}{'':>4}{s:>7.2f}  {note}"
        )


if __name__ == "__main__":
    main()
