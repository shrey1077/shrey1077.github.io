/**
 * prepare-tata-hero — knock the white ground out of the Tata IIS hero artwork.
 *
 * The owner supplied the campaign artwork on a flat white ground (2026-09-22)
 * and asked on 2026-09-23 for it to sit transparently on the page — "only
 * remove the white part, I like the lines and text". That is the whole
 * difficulty: the ground is #fdfdfd, and the faint circuit lines and the
 * "PEOPLE SKILLS INDUSTRY INDIA" caption around the figure are ALSO very light
 * grey. A plain luminance key takes them with the background.
 *
 * So it floods from the edges instead, the same way `make_abs_logo.py` cuts the
 * ABS mark: only background that is CONNECTED to the border is removed, and the
 * flood stops the moment it meets a pixel darker than BG_MIN. Anything the
 * flood cannot reach — the lines, the caption, the highlights inside the
 * figure — is left exactly as supplied.
 *
 * ⚠ BG_MIN IS THE WHOLE DIAL. Raise it and the flood walks straight through the
 * faintest lines and deletes them; lower it and a rim of white survives around
 * the figure. It is set from the measured histogram: the ground sits at 252–253
 * and the faintest line work bottoms out around 232, so 246 clears the ground
 * with room to spare and still stops at every line. `--stats` prints those
 * numbers again if the artwork is ever replaced.
 *
 * The edge is then feathered: the supplied art is anti-aliased against white,
 * so the pixels just inside the silhouette are part white. They get a partial
 * alpha instead of a hard 255, which is what stops a pale halo appearing once
 * the page's own ground shows through.
 *
 * Source:  hero/_orig/skills-build-stronger-india.webp   (the supplied file —
 *          keep it, it is the only way to regenerate this)
 * Output:  hero/skills-build-stronger-india.webp         (RGBA)
 */

import sharp from "sharp";
import path from "node:path";
import fs from "node:fs/promises";

const ROOT = process.cwd();
const HERO = path.join(ROOT, "public/content/clients/tata-iis/hero");
const SRC = path.join(HERO, "_orig/skills-build-stronger-india.webp");
const OUT = path.join(HERO, "skills-build-stronger-india.webp");

/** At or above this luminance a pixel counts as ground the flood may cross. */
const BG_MIN = 246;
/** Below this, a pixel is fully opaque. Between the two it ramps, which is the
 *  anti-aliased edge. */
const EDGE_LO = 232;
/** Ground can also be LANDLOCKED — the angular shapes at the top right, the
 *  gaps between the spray, the box behind the caption. The border flood cannot
 *  reach any of it, and it survived as opaque white patches: invisible on the
 *  near-white page, obvious the moment anything sits behind it. A second pass
 *  takes those too.
 *  ⚠ It is deliberately STRICTER than the flood: near-pure white only, and only
 *  in patches. Highlights inside the figure — the lenses, the sparks — are
 *  small and none of them are this white, so they stay. */
const POCKET_MIN = 250;
/** px. Below this a patch is treated as ink, not ground. */
const POCKET_AREA = 120;

const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;
const lum = new Uint8Array(W * H);
for (let i = 0; i < W * H; i++) {
  const p = i * 4;
  lum[i] = (data[p] + data[p + 1] + data[p + 2]) / 3;
}

if (process.argv.includes("--stats")) {
  const hist = new Array(256).fill(0);
  for (const v of lum) hist[v]++;
  const total = W * H;
  console.log(`size ${W}×${H}`);
  for (let v = 225; v < 256; v += 5) {
    const share = hist.slice(v, v + 5).reduce((a, b) => a + b, 0) / total;
    console.log(`  ${v}–${v + 4}  ${(share * 100).toFixed(2)}%`);
  }
}

/* ── Flood the ground, from every edge pixel inward ───────────────────────── */
const isGround = new Uint8Array(W * H);
const stack = [];
const push = (x, y) => {
  const i = y * W + x;
  if (!isGround[i] && lum[i] >= BG_MIN) {
    isGround[i] = 1;
    stack.push(i);
  }
};
for (let x = 0; x < W; x++) {
  push(x, 0);
  push(x, H - 1);
}
for (let y = 0; y < H; y++) {
  push(0, y);
  push(W - 1, y);
}
while (stack.length) {
  const i = stack.pop();
  const x = i % W;
  const y = (i / W) | 0;
  if (x > 0) push(x - 1, y);
  if (x < W - 1) push(x + 1, y);
  if (y > 0) push(x, y - 1);
  if (y < H - 1) push(x, y + 1);
}

/* ── The landlocked pockets ──────────────────────────────────────────────── */
let pockets = 0;
const seen = new Uint8Array(W * H);
for (let start = 0; start < W * H; start++) {
  if (isGround[start] || seen[start] || lum[start] < POCKET_MIN) continue;
  const region = [];
  const queue = [start];
  seen[start] = 1;
  while (queue.length) {
    const i = queue.pop();
    region.push(i);
    const x = i % W;
    const y = (i / W) | 0;
    const step = (j) => {
      if (!seen[j] && !isGround[j] && lum[j] >= POCKET_MIN) {
        seen[j] = 1;
        queue.push(j);
      }
    };
    if (x > 0) step(i - 1);
    if (x < W - 1) step(i + 1);
    if (y > 0) step(i - W);
    if (y < H - 1) step(i + W);
  }
  if (region.length >= POCKET_AREA) {
    for (const i of region) isGround[i] = 1;
    pockets++;
  }
}

/* ── Alpha: 0 on the ground, a ramp on the pixels touching it, 255 elsewhere ─ */
let cleared = 0;
let feathered = 0;
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const i = y * W + x;
    const p = i * 4;
    if (isGround[i]) {
      // Fully transparent, and the colour is zeroed too: a stray white RGB
      // under a zero alpha shows up as a light fringe the moment anything
      // resamples the image (and the page scales it at every breakpoint).
      data[p] = data[p + 1] = data[p + 2] = data[p + 3] = 0;
      cleared++;
      continue;
    }
    data[p + 3] = 255;
    if (lum[i] <= EDGE_LO) continue;
    // Light, and next to the ground: the anti-aliased rim. Ramp it.
    const touches =
      (x > 0 && isGround[i - 1]) ||
      (x < W - 1 && isGround[i + 1]) ||
      (y > 0 && isGround[i - W]) ||
      (y < H - 1 && isGround[i + W]);
    if (!touches) continue;
    data[p + 3] = Math.round((255 * (BG_MIN - lum[i])) / (BG_MIN - EDGE_LO));
    feathered++;
  }
}

await fs.mkdir(path.dirname(OUT), { recursive: true });
await sharp(data, { raw: { width: W, height: H, channels: 4 } })
  .webp({ quality: 88, alphaQuality: 100 })
  .toFile(OUT);

const { size } = await fs.stat(OUT);
console.log(
  `cleared ${((cleared / (W * H)) * 100).toFixed(1)}% of the frame (${pockets} landlocked pockets), feathered ${feathered} edge px  →  ${(size / 1024).toFixed(0)} KB`,
);
