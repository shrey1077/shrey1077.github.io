"""
make_studio_mockups.py — accurate studio mockups for subsections that have none.

The site owner's own Photoshop mockups cover the paper goods (certificates,
cards, bookmarks, flyers, trifolds). Everything else needs a staged resting
image, and the constraint that matters is ACCURACY: the artwork must not be
distorted, recoloured, or dropped into an invented environment.

So this does not try to fake a photograph. It builds a studio product shot:
the real artwork on a correct-proportion substrate, given a shallow perspective
tilt, a soft contact shadow, and a pure white ground. Nothing is added to the
design and nothing is stretched — the tilt is a true projective transform, so
straight lines stay straight and the artwork stays readable.

Substrates carry real-world proportions (an ID card is 54x86mm, a standee is
tall and narrow), so a viewer reads the object correctly even though the scene
is synthetic.

  python scripts/make_studio_mockups.py            # fill every gap
  python scripts/make_studio_mockups.py --force    # redo ones that exist

Run with the 3.14 interpreter that carries Pillow + numpy:
  C:\\Users\\tatai\\AppData\\Local\\Python\\pythoncore-3.14-64\\python.exe
"""

import sys
import pathlib
import numpy as np
from PIL import Image, ImageFilter

DEST = pathlib.Path(r"D:\Brain Folio\public\content\clients\tata-iis\catalogue")
CANVAS = (1600, 1200)          # 4:3, matching the tile's aspect
FORCE = "--force" in sys.argv

# subsection folder -> (substrate kind, tilt degrees)
# "kind" only sets proportions and how the piece is cropped/fitted.
PLAN = {
    "ID Cards":            ("card_portrait", 10),
    "Handbook":            ("book", 8),
    "Banners":             ("wide", 6),
    "Lab Standees":        ("standee", 7),
    "Stationery":          ("sheet", 9),
    "Events":              ("sheet", 9),
    "Backgrounds":         ("screen", 5),
    "Website Banners":     ("screen_wide", 5),
    "Socials & Screens":   ("phone", 8),
    "Presentations":       ("screen", 6),
    "Photography":         ("print", 7),
}

# Kept for reference only — the artwork now keeps its own aspect (see studio()).
# substrate -> nominal real-world aspect (w/h)
ASPECT = {
    "card_portrait": 54 / 86,
    "book":          210 / 297,
    "wide":          3 / 1,
    "standee":       0.4,
    "sheet":         210 / 297,
    "screen":        16 / 10,
    "screen_wide":   3 / 1,
    "phone":         9 / 16,
    "print":         3 / 2,
}


def perspective_coeffs(src, dst):
    """Solve the 8 projective coefficients PIL wants (dst -> src mapping)."""
    a = []
    for (sx, sy), (dx, dy) in zip(src, dst):
        a.append([dx, dy, 1, 0, 0, 0, -sx * dx, -sx * dy])
        a.append([0, 0, 0, dx, dy, 1, -sy * dx, -sy * dy])
    A = np.array(a, dtype=float)
    B = np.array(src, dtype=float).reshape(8)
    return np.linalg.solve(A, B)


def on_white(img: Image.Image) -> Image.Image:
    """Flatten onto WHITE. Much of this catalogue is transparent artwork with
    dark ink (letterheads, stickers); a plain convert('RGB') composites those
    onto black and turns the piece into a slab."""
    if img.mode in ("RGBA", "LA", "P"):
        img = img.convert("RGBA")
        bg = Image.new("RGBA", img.size, (255, 255, 255, 255))
        img = Image.alpha_composite(bg, img)
    return img.convert("RGB")


def studio(artwork: Image.Image, kind: str, tilt_deg: float) -> Image.Image:
    cw, ch = CANVAS
    art = on_white(artwork)

    # Keep the artwork's OWN proportions. An earlier pass cover-cropped to a
    # nominal product size (ID card, A4) and sliced words off standees and
    # event boards — accuracy beats a tidy silhouette, so nothing is cropped.
    aw, ah = art.size
    box_h = int(ch * 0.68)
    box_w = int(box_h * aw / ah)
    if box_w > cw * 0.80:
        box_w = int(cw * 0.80)
        box_h = int(box_w * ah / aw)
    art = art.resize((max(box_w, 1), max(box_h, 1)), Image.LANCZOS)

    # A shallow projective tilt: the far edge narrows, near edge stays put.
    # Straight lines stay straight — this is a real projection, not a shear.
    t = np.tan(np.radians(tilt_deg))
    inset = box_w * t * 0.16
    rise = box_h * t * 0.06
    src = [(0, 0), (box_w, 0), (box_w, box_h), (0, box_h)]
    dst = [(inset, rise), (box_w - inset, 0), (box_w, box_h), (0, box_h - rise)]

    layer = Image.new("RGBA", (box_w, box_h), (0, 0, 0, 0))
    layer.paste(art, (0, 0))
    coeffs = perspective_coeffs(src, dst)
    layer = layer.transform((box_w, box_h), Image.PERSPECTIVE, coeffs, Image.BICUBIC)

    canvas = Image.new("RGB", (cw, ch), "white")
    ox, oy = (cw - box_w) // 2, (ch - box_h) // 2

    # Contact shadow: the piece's own silhouette, blurred and dropped.
    alpha = layer.split()[3]
    shadow = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))
    tint = Image.new("RGBA", (box_w, box_h), (18, 18, 22, 96))
    shadow.paste(tint, (ox, oy + int(box_h * 0.035)), alpha)
    shadow = shadow.filter(ImageFilter.GaussianBlur(int(box_h * 0.035)))
    canvas = Image.alpha_composite(canvas.convert("RGBA"), shadow)

    canvas.alpha_composite(layer, (ox, oy))
    return canvas.convert("RGB")


def hero_for(folder: pathlib.Path):
    """Pick the artwork to stage: the meta's first caption, else the first
    image that is not itself a mockup or an installation photo."""
    import json
    files = sorted(p for p in folder.iterdir()
                   if p.suffix.lower() in (".webp", ".jpg", ".png") and not p.name.startswith("_"))
    files = [p for p in files if not p.name.startswith(("mockup-", "installed-"))]
    if not files:
        return None
    meta = folder / "_meta.json"
    if meta.exists():
        try:
            caps = list(json.loads(meta.read_text(encoding="utf-8")).get("captions", {}))
            for c in caps:
                hit = folder / c
                if hit.exists() and not hit.name.startswith(("mockup-", "installed-")):
                    return hit
        except Exception:
            pass
    return files[0]


made, skipped, failed = 0, 0, []
for name, (kind, tilt) in PLAN.items():
    folder = DEST / name
    if not folder.is_dir():
        failed.append(f"{name} (no folder)")
        continue
    out = folder / "mockup-studio.webp"
    if out.exists() and not FORCE:
        skipped += 1
        continue
    hero = hero_for(folder)
    if hero is None:
        failed.append(f"{name} (no artwork to stage)")
        continue
    try:
        with Image.open(hero) as im:
            studio(im, kind, tilt).save(out, "WEBP", quality=88, method=6)
        kb = out.stat().st_size // 1024
        print(f"  {name:<22} {kind:<14} from {hero.name[:34]:<34} {kb} KB")
        made += 1
    except Exception as e:
        failed.append(f"{name} — {e}")

print(f"\n{made} studio mockups made, {skipped} already present")
if failed:
    print(f"\n{len(failed)} failed:")
    for f in failed:
        print("  -", f)
