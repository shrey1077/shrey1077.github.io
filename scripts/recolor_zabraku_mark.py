"""recolor_zabraku_mark.py — the Zabraku wordmark, redrawn for a white plate.

The board's logo plates went PURE WHITE on 2026-08-20 by the owner's
instruction. Zabraku's supplied artwork is a two-tone wordmark cut out of the
2021 portfolio cover: measured, 72% of its ink is near-white and 28% is the
brand yellow. On a white plate the white three-quarters of the word simply
disappears, which is why it had been flagged `logoTone: "light"` and given a
dark plate instead.

So the WHITE characters are recoloured to #262626 — the owner's value — and the
yellow is left exactly as it is.

  in :  public/content/clients/zabraku-media/zabraku-logo.png
  out:  public/content/clients/zabraku-media/zabraku-logo-dark.png

The original is NOT overwritten: it is the only copy of the artwork as it came
off the cover, and the dark-plate rendering may be wanted again.

WHY SATURATION, NOT A COLOUR MATCH
A naive "replace #FFFFFF" leaves a white halo, because every glyph edge is
anti-aliased through dozens of intermediate greys. Saturation separates the two
inks cleanly at any lightness: the white ink is unsaturated at every step of its
anti-aliasing, the yellow ink is saturated at every step of its own. Pixels in
the transition band are blended rather than switched, so no edge hardens.

Alpha is never touched. A glyph edge that is 40% opaque white becomes 40% opaque
#262626, which is exactly how dark type anti-aliases against transparency.

Idempotent. Run with the repo Python (see docs/HANDOFF) — needs PIL + numpy.
"""

import pathlib
import numpy as np
from PIL import Image

SRC = pathlib.Path("D:/Brain Folio/public/content/clients/zabraku-media/zabraku-logo.png")
OUT = SRC.with_name("zabraku-logo-dark.png")

# The owner's value for the characters that were white.
INK = (0x26, 0x26, 0x26)

# Saturation below LO is treated as pure white ink, above HI as pure brand
# colour, and the band between the two is blended so nothing hardens.
LO, HI = 0.15, 0.35


def main() -> None:
    im = Image.open(SRC).convert("RGBA")
    a = np.asarray(im).astype(np.float64)
    rgb, alpha = a[..., :3], a[..., 3]

    mx = rgb.max(axis=2)
    mn = rgb.min(axis=2)
    # HSV saturation. Guard the divide: fully black pixels have mx == 0.
    sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0.0)

    # 1 where the pixel is white ink, 0 where it is brand colour, ramped between.
    w = np.clip((HI - sat) / (HI - LO), 0.0, 1.0)[..., None]

    ink = np.array(INK, dtype=np.float64)
    out_rgb = w * ink + (1.0 - w) * rgb

    out = np.dstack([out_rgb, alpha]).clip(0, 255).astype(np.uint8)
    Image.fromarray(out, "RGBA").save(OUT)

    # Report what actually changed, so a silent no-op cannot pass as success.
    opaque = alpha > 40
    n = int(opaque.sum())
    recoloured = int((w[..., 0] > 0.5)[opaque].sum())
    print(f"{SRC.name} -> {OUT.name}")
    print(f"  {im.size[0]}x{im.size[1]}, {n} opaque px")
    print(f"  recoloured to #{INK[0]:02X}{INK[1]:02X}{INK[2]:02X}: {recoloured} px ({100 * recoloured / n:.1f}%)")
    print(f"  left as brand colour: {n - recoloured} px ({100 * (n - recoloured) / n:.1f}%)")


if __name__ == "__main__":
    main()
