/**
 * prepare-tool-logos.mjs — the owner's tool stack as one family of marks:
 * dark grey (TOOL_GREY) on transparency, for the landing's Tools fact and the
 * footer (owner, 2026-10-02).
 *
 * Every mark is fetched from the brand's own source, never redrawn:
 *   • Simple Icons (CC0, the brands' official single-colour marks) for Adobe
 *     CC, Claude, Gemini, ChatGPT (OpenAI), GitHub and Gmail — recoloured and
 *     kept as SVG.
 *   • The brands' own sites for the four Simple Icons doesn't carry:
 *       Leonardo   — its favicon, the bearded face, white on black: keyed on
 *                    luminance so the white becomes the mark.
 *       Postshot   — the mountain mark, cut from the left of its bright logo.
 *       Lemonpeel  — the lemon, cut from its logo; keyed on DARKNESS so the
 *                    yellow fill becomes the mark and its white segment lines
 *                    read as cut-outs.
 *       Google Flow — it has no standalone mark, so the "Flow" half of its own
 *                    wordmark (paths copied from flow.google.com, 2026-10-02).
 *
 *   node scripts/prepare-tool-logos.mjs
 *
 * ⚠ Trademarks of their owners, shown to say "I use this tool" — nominative
 * use. Don't alter the marks' shapes beyond the recolour and crop done here.
 */

import sharp from "sharp";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT = "public/content/tools";
/** Dark grey — neutral-700, the landing corner's darkest text tone. */
const TOOL_GREY = "#404040";
const RGB = [0x40, 0x40, 0x40];
/** Raster marks are written at this height: 4× the largest display size. */
const PX = 128;

/** Pinned. ⚠ Adobe and OpenAI had their marks REMOVED from Simple Icons after
 *  v13 (at the brands' request), so those two come from the last release that
 *  carried them; the rest from the current one. */
const SI_NOW = "16.33.0";
const SI_LAST_WITH_ADOBE_OPENAI = "13.21.0";
const SI = (slug, v = SI_NOW) => `https://cdn.jsdelivr.net/npm/simple-icons@${v}/icons/${slug}.svg`;

mkdirSync(OUT, { recursive: true });

async function fetchBuf(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${url} → ${r.status}`);
  return Buffer.from(await r.arrayBuffer());
}

/** Simple Icons: one path, no fill — give it ours. */
async function simpleIcon(id, slug, v) {
  const svg = (await fetchBuf(SI(slug, v))).toString("utf8").replace("<svg ", `<svg fill="${TOOL_GREY}" `);
  writeFileSync(join(OUT, `${id}.svg`), svg);
  console.log(`${id}.svg ← simple-icons/${slug}`);
}

/** Raw RGBA → a TOOL_GREY mark whose alpha is `key(r,g,b,a)` (0..1), trimmed. */
async function keyed(id, input, key, crop) {
  let img = sharp(input, { density: 300 }).ensureAlpha();
  if (crop) img = img.extract(crop);
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i += 4) {
    const a = key(data[i] / 255, data[i + 1] / 255, data[i + 2] / 255, data[i + 3] / 255);
    out[i] = RGB[0];
    out[i + 1] = RGB[1];
    out[i + 2] = RGB[2];
    out[i + 3] = Math.round(Math.max(0, Math.min(1, a)) * 255);
  }
  const meta = await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
    .trim({ threshold: 1 })
    .resize({ height: PX })
    .png()
    .toFile(join(OUT, `${id}.png`));
  console.log(`${id}.png ${meta.width}×${meta.height}`);
}

const luma = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

/** Columns of an RGBA raster that carry any ink. */
async function inkColumns(input, density = 300) {
  const { data, info } = await sharp(input, { density }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const cols = new Array(info.width).fill(false);
  for (let y = 0; y < info.height; y++)
    for (let x = 0; x < info.width; x++) if (data[(y * info.width + x) * 4 + 3] > 8) cols[x] = true;
  return { cols, width: info.width, height: info.height };
}

/** The first run of ink from the left — a logo's mark before its wordmark. */
function firstInkRun(cols, minGap) {
  const start = cols.indexOf(true);
  let x = start;
  for (let gap = 0; x < cols.length; x++) {
    gap = cols[x] ? 0 : gap + 1;
    if (gap >= minGap) return { start, end: x - gap };
  }
  return { start, end: cols.length - 1 };
}

// ── Simple Icons ──
await simpleIcon("adobe-cc", "adobecreativecloud", SI_LAST_WITH_ADOBE_OPENAI);
await simpleIcon("claude", "claude");
await simpleIcon("gemini", "googlegemini");
await simpleIcon("chatgpt", "openai", SI_LAST_WITH_ADOBE_OPENAI);
await simpleIcon("github", "github");
await simpleIcon("gmail", "gmail");

// ── Leonardo: white face on black, no alpha → luminance is the mark. ──
await keyed("leonardo", await fetchBuf("https://leonardo.ai/images/leonardo_favicon.png"), (r, g, b) =>
  (luma(r, g, b) - 0.25) / 0.5,
);

// ── Postshot: the mountain mark, left of a gap before the word. ──
{
  const src = await fetchBuf("https://static.jawset.com/website/psht/postshot-bright.svg");
  const { cols, height } = await inkColumns(src);
  const { start, end } = firstInkRun(cols, 12);
  await keyed("postshot", src, (_r, _g, _b, a) => a, { left: start, top: 0, width: end - start + 1, height });
}

// ── Lemonpeel: the lemon, the only saturated thing in its logo. ──
{
  const src = await fetchBuf("https://www.lemonpeel.ai/brand/logo-dark.png");
  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let x0 = info.width, x1 = 0, y0 = info.height, y1 = 0;
  for (let y = 0; y < info.height; y++)
    for (let x = 0; x < info.width; x++) {
      const i = (y * info.width + x) * 4;
      const sat = Math.max(data[i], data[i + 1], data[i + 2]) - Math.min(data[i], data[i + 1], data[i + 2]);
      if (data[i + 3] > 128 && sat > 80) {
        x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
      }
    }
  const pad = 3;
  const crop = {
    left: Math.max(0, x0 - pad),
    top: Math.max(0, y0 - pad),
    width: Math.min(info.width, x1 + pad + 1) - Math.max(0, x0 - pad),
    height: Math.min(info.height, y1 + pad + 1) - Math.max(0, y0 - pad),
  };
  // Yellow (luma ~0.8) → solid; white (1.0) → clear, so the segments survive.
  await keyed("lemonpeel", src, (r, g, b, a) => a * (1 - luma(r, g, b)) * 5, crop);
}

// ── Google Flow: the "Flow" half of the official wordmark. ──
writeFileSync(
  join(OUT, "google-flow.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="786 0 448 172" fill="${TOOL_GREY}">` +
    `<path d="M788.864 165.639V3.62053H881.414V26.9277H813.642V165.639H788.864ZM802.441 98.3199V75.8047H878.585V98.3199H802.441Z"/>` +
    `<path d="M898.615 165.639V3.62053H923.28V165.639H898.615Z"/>` +
    `<path d="M996.685 169.373C979.111 169.373 964.591 163.527 953.126 151.836C941.661 140.144 935.929 125.436 935.929 107.711C935.929 89.7588 941.661 75.0127 953.126 63.4723C964.666 51.9319 979.186 46.1617 996.685 46.1617C1014.18 46.1617 1028.7 51.9696 1040.24 63.5855C1051.79 75.2013 1057.56 89.9097 1057.56 107.711C1057.56 125.436 1051.82 140.144 1040.36 151.836C1028.89 163.527 1014.34 169.373 996.685 169.373ZM996.685 147.876C1007.02 147.876 1015.69 144.142 1022.71 136.675C1029.72 129.132 1033.23 119.477 1033.23 107.711C1033.23 95.793 1029.69 86.1383 1022.59 78.7464C1015.58 71.3545 1006.94 67.6586 996.685 67.6586C986.352 67.6586 977.678 71.3545 970.663 78.7464C963.648 86.1383 960.141 95.793 960.141 107.711C960.141 119.477 963.61 129.132 970.55 136.675C977.565 144.142 986.276 147.876 996.685 147.876Z"/>` +
    `<path d="M1092.38 165.639L1055.61 49.8954H1080.62L1102.45 125.248L1105.28 135.43H1106.07L1108.9 125.926L1132.78 49.8954H1155.74L1179.28 125.361L1182.33 135.204H1183.01L1185.84 125.587L1208.01 49.8954H1232L1194.78 165.639H1171.13L1146.24 87.4583L1143.86 78.9727H1143.18L1140.69 87.4583L1116.26 165.639H1092.38Z"/>` +
    `</svg>`,
);
console.log("google-flow.svg ← flow.google.com wordmark");
