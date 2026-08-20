"""
make_abs_logo.py — the ABS Wholesale roundel, background knocked out.

The ABS page prints its own logo instead of a text title (owner's instruction,
2026-08-21), and the page ground is #fafafa. Both existing copies of the mark
(`content/career/abs.png`, `content/marks/client-abs.png`) carry an OPAQUE WHITE
field, which on #fafafa reads as a faint but real white square behind a circular
logo. This produces a transparent-background copy.

WHY FLOOD FILL AND NOT A COLOUR KEY: the wordmark "ABS WHOLESALE" is WHITE text
sitting on the oxblood roundel. A global white -> alpha pass deletes it and
leaves the logo wearing a hole. Filling inward from the border only reaches the
white that is actually connected to the outside, so enclosed white survives.

Feathered by one pass so the circle's anti-aliased rim does not saw-tooth.

Output: public/content/clients/abs/abs-logo.png
Idempotent.
"""

from collections import deque
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "public" / "content" / "career" / "abs.png"
OUT = ROOT / "public" / "content" / "clients" / "abs" / "abs-logo.png"

NEAR_WHITE = 236  # a pixel this bright in every channel counts as background

im = Image.open(SRC).convert("RGBA")
w, h = im.size
px = im.load()


def is_bg(x, y):
    r, g, b, _ = px[x, y]
    return r >= NEAR_WHITE and g >= NEAR_WHITE and b >= NEAR_WHITE


# Flood from every border pixel inward.
seen = [[False] * h for _ in range(w)]
q = deque()
for x in range(w):
    for y in (0, h - 1):
        if is_bg(x, y) and not seen[x][y]:
            seen[x][y] = True
            q.append((x, y))
for y in range(h):
    for x in (0, w - 1):
        if is_bg(x, y) and not seen[x][y]:
            seen[x][y] = True
            q.append((x, y))

while q:
    x, y = q.popleft()
    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        nx, ny = x + dx, y + dy
        if 0 <= nx < w and 0 <= ny < h and not seen[nx][ny] and is_bg(nx, ny):
            seen[nx][ny] = True
            q.append((nx, ny))

cleared = 0
for x in range(w):
    for y in range(h):
        if seen[x][y]:
            r, g, b, _ = px[x, y]
            px[x, y] = (r, g, b, 0)
            cleared += 1

# One feather pass: a kept pixel touching cleared space gets partial alpha, so
# the rim blends instead of stepping.
edge = []
for x in range(1, w - 1):
    for y in range(1, h - 1):
        if seen[x][y]:
            continue
        if any(seen[x + dx][y + dy] for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
            edge.append((x, y))
for x, y in edge:
    r, g, b, a = px[x, y]
    px[x, y] = (r, g, b, int(a * 0.72))

OUT.parent.mkdir(parents=True, exist_ok=True)
im.save(OUT)

pct = 100 * cleared / (w * h)
print(f"  {OUT.relative_to(ROOT)}  {w}x{h}  background cleared: {pct:.1f}%  feathered: {len(edge)}")
