"""prepare_logo_marks.py — board marks trimmed to their ink, and sized by it.

THE PROBLEM
The board fits each mark into one centred box with `object-contain`, which
sizes a logo by its BOUNDING BOX. The eye does not read bounding boxes, it
reads ink. Two things broke the match:

  1. Padding. Most logofolio files are 16:9 canvases with a small mark adrift
     in the middle — measured, some are 97% empty. `object-contain` dutifully
     fits the EMPTINESS to the box and the mark lands tiny. No amount of
     scaling fixes it: even at a box filling the whole plate, elf-bar reached
     38% of Azoth's ink.
  2. Density. A solid roundel and an airy wordmark with the same bounding box
     carry very different amounts of ink, so they read as different sizes.

THE FIX, in that order
  · Trim every mark to its ink bounding box, which is what "excluding the white
    space in their files" means. Both kinds of emptiness go: transparent
    padding, and a baked-in white background (abs.png and newsmobile.png have
    one). A mark whose ink IS white must not be erased by the second rule, so
    the white background is only subtracted where the corners are actually
    opaque white — where there is a background to subtract.
  · Then solve, per mark, for the scale whose rendered FOOTPRINT — the drawn
    bounding box, once the padding is gone — equals Azoth's.

⚠ FOOTPRINT, NOT INK. Both were built and compared on 2026-08-20; the owner
chose footprint. Matching ink instead makes a dense solid mark much smaller
than an airy wordmark — the ABS roundel packs the same ink into a third of the
space, so it read as the runt of the row. Equal footprint makes them siblings.
Azoth is still pinned to the exact size it had before any of this: its own
scale is derived from its current INK, and the footprint that results is what
every other mark is matched to.

THE REFERENCE
Azoth at its current `logoScale: 2`, measured on its UNTRIMMED file — that is
the size the owner picked, so it is the constant everything else is matched to.
Azoth itself gets a new scale here too, because its own file is trimmed like
the rest; the on-screen result is the same area it has today.

GEOMETRY, mirroring SectionPanel exactly
  plate : aspect 4/3
  box   : w% = min(62 * scale, 94), h% = min(31 * scale, 94)
  mark  : object-contain inside that box
  ink   : (ink px / all px) * rendered width * rendered height

⚠ The 94% ceiling makes ink area saturate — past a point the box stops growing.
Anything that still cannot reach the target after trimming is reported loudly
rather than silently pinned at the cap.

OUTPUT
  public/content/marks/<key>.png     trimmed art
  public/content/marks/_marks.json   { "<original url>": { url, scale } }

The board looks marks up BY THEIR ORIGINAL URL, so nothing else has to change:
clients.ts and the logofolio manifest keep pointing at the files they always
did, and the swap happens in one place. Keys are namespaced because the
logofolio and the client list share slugs (`tata-iis` is a different mark in
each) while being entirely different artwork.

Idempotent. Repo Python (PIL + numpy).
"""

import json
import pathlib
import numpy as np
from PIL import Image

ROOT = pathlib.Path("D:/Brain Folio/public")
OUT = ROOT / "content" / "marks"

BOX_W, BOX_H, BOX_MAX = 62.0, 31.0, 94.0
PLATE_W = 1000.0
PLATE_H = PLATE_W * 3 / 4

# Marks the board fits into the logo box. `fill` cells — a study's own work
# plate — cover the plate edge to edge and are deliberately absent.
SOURCES: list[tuple[str, str]] = [
    ("client-tata-iis", "/content/career/tata-iis.png"),
    ("client-azoth-biotech", "/content/clients/azoth-biotech/brand/logo-azoth.png"),
    ("client-abs", "/content/career/abs.png"),
    ("client-zabraku", "/content/clients/zabraku-media/zabraku-logo-dark.png"),
    ("client-newsmobile", "/content/career/newsmobile.png"),
    ("client-uid", "/content/clients/uid/brand/uid-logo.png"),
    ("client-chess", "/chess/images/logo.png"),
    ("study-first-divine", "/content/logofolio/first-divine.png"),
    ("study-komono", "/content/logofolio/komono.png"),
]

REFERENCE = "client-azoth-biotech"
REFERENCE_SCALE = 2.0


def ink_mask(im: Image.Image) -> np.ndarray:
    a = np.asarray(im).astype(np.int16)
    rgb, alpha = a[..., :3], a[..., 3]
    opaque = alpha > 40
    h, w = opaque.shape
    corners = [(0, 0), (0, w - 1), (h - 1, 0), (h - 1, w - 1)]
    white_bg = all(opaque[y, x] and rgb[y, x].min() > 235 for y, x in corners)
    return opaque & (rgb.min(axis=2) <= 235) if white_bg else opaque


def frac_and_size(im: Image.Image) -> tuple[float, tuple[int, int]]:
    m = ink_mask(im)
    return float(m.sum()) / float(m.size), im.size


def drawn_box(size: tuple[int, int], scale: float) -> float:
    """Area of the mark as actually drawn — object-contain inside the box."""
    bw = PLATE_W * min(BOX_W * scale, BOX_MAX) / 100.0
    bh = PLATE_H * min(BOX_H * scale, BOX_MAX) / 100.0
    aspect = size[0] / size[1]
    rw = min(bw, bh * aspect)
    return rw * (rw / aspect)


def rendered_ink(frac: float, size: tuple[int, int], scale: float) -> float:
    return frac * drawn_box(size, scale)


def scale_for_box(size: tuple[int, int], target: float) -> tuple[float, float]:
    """Smallest scale whose DRAWN FOOTPRINT reaches `target`, and how much of
    the target is reachable at all.

    ⚠ When the box ceiling makes the target unreachable, this returns the
    smallest scale that still reaches the CEILING — not the search bound. A very
    wide wordmark is width-limited long before `scale` runs out, so any larger
    number would be a lie in the data: it would read as "this mark is huge" when
    it is simply pinned.
    """
    ceiling = drawn_box(size, 40.0)
    goal = min(target, ceiling * 0.999)
    lo, hi = 0.05, 40.0
    for _ in range(90):
        mid = (lo + hi) / 2
        if drawn_box(size, mid) < goal:
            lo = mid
        else:
            hi = mid
    return round((lo + hi) / 2, 2), ceiling / target


def trim(im: Image.Image) -> Image.Image:
    m = ink_mask(im)
    ys, xs = np.where(m)
    if len(xs) == 0:
        return im
    return im.crop((int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1))


def main() -> None:
    sources = list(SOURCES)
    man = json.loads((ROOT / "content/logofolio/_manifest.json").read_text())
    known = {u for _, u in sources}
    for e in man:
        url = f"/content/logofolio/{e['slug']}.png"
        if url not in known:
            sources.append((f"logofolio-{e['slug']}", url))

    OUT.mkdir(parents=True, exist_ok=True)

    # Azoth must not move — it is the size the owner picked. Its CURRENT ink
    # area fixes the scale its trimmed file has to run at to look identical,
    # and the FOOTPRINT that results is what every other mark is matched to.
    ref_url = dict(sources)[REFERENCE]
    ref_im = Image.open(ROOT / ref_url.lstrip("/")).convert("RGBA")
    ref_frac, ref_size = frac_and_size(ref_im)
    target_ink = rendered_ink(ref_frac, ref_size, REFERENCE_SCALE)

    ref_tfrac, ref_tsize = frac_and_size(trim(ref_im))
    lo, hi = 0.05, 40.0
    for _ in range(90):
        mid = (lo + hi) / 2
        if rendered_ink(ref_tfrac, ref_tsize, mid) < target_ink:
            lo = mid
        else:
            hi = mid
    ref_scale = (lo + hi) / 2
    target = drawn_box(ref_tsize, ref_scale)

    print(f"Azoth pinned: logoScale {REFERENCE_SCALE:g} untrimmed = {target_ink:,.0f} px of ink")
    print(f"  trimmed, that is scale {ref_scale:.2f} — a footprint of {target:,.0f} plate px")
    print("target = that footprint, for every mark\n")

    marks: dict[str, dict] = {}
    capped: list[str] = []
    print(f"{'key':<30}{'ink% before':>12}{'after':>8}{'aspect':>8}{'scale':>8}")
    for key, url in sources:
        src = ROOT / url.lstrip("/")
        if not src.exists():
            print(f"  MISSING {key}: {url}")
            continue
        im = Image.open(src).convert("RGBA")
        before, _ = frac_and_size(im)

        t = trim(im)
        t.save(OUT / f"{key}.png")
        frac, size = frac_and_size(t)

        s, reach = scale_for_box(size, target)
        if reach < 0.995:
            capped.append(f"{key} ({reach * 100:.0f}% of target)")
        marks[url] = {"url": f"/content/marks/{key}.png", "scale": s}
        print(
            f"{key:<30}{before * 100:>11.1f}%{frac * 100:>7.1f}%"
            f"{size[0] / size[1]:>8.2f}{s:>8.2f}"
        )

    (OUT / "_marks.json").write_text(json.dumps(marks, indent=2))
    print(f"\n{len(marks)} marks -> {OUT}")
    if capped:
        print(f"⚠ {len(capped)} pinned at the box ceiling, short of the target:")
        for c in capped:
            print(f"    {c}")
    else:
        print("All marks reach the target within the box ceiling.")


if __name__ == "__main__":
    main()
