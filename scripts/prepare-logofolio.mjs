/**
 * prepare-logofolio.mjs — the Logofolio wall.
 *
 * Gathers every mark from the archives, renders it (PDF or raster), trims it to
 * its ink, and scales each one so they all occupy the SAME INK AREA on a shared
 * canvas — a tall wordmark and a compact monogram then read as equals on the
 * grid, which normalising by height alone never achieves.
 *
 * Each logo also gets a `tone`: marks that are predominantly light are flagged
 * `light` so the grid seats them on black; everything else (colour or black
 * artwork) sits on white.
 *
 * Output: public/content/logofolio/<slug>.png + _manifest.json
 * Idempotent. Node ≥ 18, sharp, pdf-to-img.
 */

import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const P = "D:/Brain Website portfolio";
const FOLIO = "D:/Brain Folio";
const DEST = path.join(FOLIO, "public/content/logofolio");

/** Every mark, once. `src` is the cleanest available artwork for that brand. */
const LOGOS = [
  { slug: "tata-iis", name: "Tata IIS", src: `${P}/All Logos/TATA IIS corrrcetd BLK@3x.png` },
  { slug: "iis-ahmedabad", name: "IIS Ahmedabad", src: `${P}/All Logos/IISA COLOR@3x.png` },
  { slug: "iis-mumbai", name: "IIS Mumbai", src: `${P}/All Logos/IISM COLOR.png` },
  { slug: "azoth-biotech", name: "Azoth Biotech", src: `${FOLIO}/public/content/clients/azoth-biotech/brand/logo.png` },
  { slug: "mushroomworks", name: "Mushroomworks", src: `${FOLIO}/public/content/clients/azoth-biotech/brand/brands/mushroomworks.png` },
  { slug: "mycoactive", name: "MycoActive", src: `${FOLIO}/public/content/clients/azoth-biotech/brand/brands/mycoactive.png` },
  { slug: "mycoveda", name: "Mycoveda", src: `${FOLIO}/public/content/clients/azoth-biotech/brand/brands/mycoveda.png` },
  { slug: "kavaka", name: "Kavaka", src: `${FOLIO}/public/content/clients/azoth-biotech/brand/brands/kavaka.png` },
  { slug: "naturalist", name: "Naturalist Nootropics", src: `${P}/logos/Naturalist Logo_ Resolution Free.pdf` },
  { slug: "newsmobile", name: "NewsMobile", src: `${P}/Extincts/newsmobile_logo.png` },
  { slug: "puran-studios", name: "Puran Studios", src: `${P}/UID/Branding/pnglogo-01.png` },
  { slug: "mycoveda-symbol", name: "Mycoveda — symbol", src: `${P}/UID/whitelogonew-01-01.png` },
  { slug: "betright365", name: "BetRight365", src: `${P}/Zabraku Media/black new logo@2x.png` },
  { slug: "first-divine", name: "First Divine", src: `${P}/Zabraku Media/Asset 7@2x.png` },
  { slug: "fabs", name: "FABS Distro", src: `${P}/vapes/Brands developed under ABS/FABS color@2x.png` },
  { slug: "elf-bar", name: "Elf Bar", src: `${P}/logos/Asset 20@3x.png` },
  { slug: "hyla", name: "Hyla", src: `${P}/logos/Asset 24@3x.png` },
  { slug: "luzid", name: "Luzid", src: `${P}/logos/Asset 23@3x.png` },
  { slug: "runtz-wraps", name: "Runtz Wraps", src: `${P}/logos/Asset 21@3x.png` },
  { slug: "alphastrip", name: "AlphaStrip", src: `${P}/logos/Asset 22@3x.png` },
  { slug: "opms", name: "O.P.M.S.", src: `${P}/logos/opms resfree.pdf` },
  { slug: "top-shine", name: "Top Shine", src: `${P}/logos/top shine.pdf` },
  { slug: "shrey-singh-rook", name: "Shrey Singh — Rook", src: `${P}/logos/black.pdf` },
  { slug: "shrey-singh-lion", name: "Shrey Singh — Lion", src: `${P}/logos/SinghlogoB.pdf` },
  { slug: "komono", name: "Komono", src: `${P}/komono/komono1-01.png` },
];
// Deliberately absent: Flum / Tobo / Casa Playa / Puff (only packshots and ad
// layouts exist, no standalone mark), FAbSinc (a name variant of FABS — each
// mark appears once), and Your Kratom (its only artwork is white-on-white, with
// no alpha to recover).

const TARGET_AREA = 46000; // ink px² every mark is scaled to
const MARGIN = 44; // transparent breathing room inside the canvas
/** Above this mean luminance the artwork is "white" and needs a dark ground. */
const LIGHT_MEAN = 205;

fs.mkdirSync(DEST, { recursive: true });

/** Source → RGBA buffer (PDFs rendered through pdfjs). */
async function load(src) {
  if (/\.pdf$/i.test(src)) {
    const { pdf } = await import("pdf-to-img");
    const doc = await pdf(src, { scale: 3 });
    for await (const page of doc) return page; // first page only
    throw new Error("empty pdf");
  }
  return fs.readFileSync(src);
}

/** Ink bounds + tone. Transparent art uses alpha; flattened art uses "not the
 *  paper colour", so a black-on-white PNG trims correctly too. */
async function analyse(buf) {
  const { data, info } = await sharp(buf, { limitInputPixels: false })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;

  // Is the artwork delivered on an opaque sheet, or with real transparency?
  let transparent = 0;
  for (let i = 0; i < W * H; i++) if (data[i * 4 + 3] < 200) transparent++;
  const hasAlpha = transparent > W * H * 0.02;

  let minX = W, minY = H, maxX = -1, maxY = -1;
  let lumSum = 0, lumN = 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      // "ink" = visible (alpha art) or not-paper (flattened art)
      const isInk = hasAlpha ? a > 32 : lum < 244;
      if (!isInk) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      lumSum += lum;
      lumN++;
    }
  }
  if (maxX < 0) return null;
  return {
    bounds: { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 },
    tone: lumN && lumSum / lumN > LIGHT_MEAN ? "light" : "dark",
    hasAlpha,
  };
}

const manifest = [];
let ok = 0, fail = 0;

// Pass 1 — measure every mark so the canvas can be shared.
const plan = [];
for (const logo of LOGOS) {
  try {
    const buf = await load(logo.src);
    const a = await analyse(buf);
    if (!a) throw new Error("no ink found");
    const aspect = a.bounds.width / a.bounds.height;
    plan.push({
      ...logo,
      buf,
      ...a,
      nw: Math.round(Math.sqrt(TARGET_AREA * aspect)),
      nh: Math.round(Math.sqrt(TARGET_AREA / aspect)),
    });
  } catch (e) {
    fail++;
    console.error(`  ✗ ${logo.slug}: ${e.message}`);
  }
}

const canvasW = Math.max(...plan.map((p) => p.nw)) + MARGIN * 2;
const canvasH = Math.max(...plan.map((p) => p.nh)) + MARGIN * 2;

// Pass 2 — trim, scale to equal ink area, centre on the shared canvas.
for (const p of plan) {
  try {
    const ink = await sharp(p.buf, { limitInputPixels: false })
      .ensureAlpha()
      .extract(p.bounds)
      .resize(p.nw, p.nh, { fit: "fill" })
      .png()
      .toBuffer();

    // Flattened artwork keeps its own paper; alpha artwork stays transparent so
    // the grid's ground (white, or black for light marks) shows through.
    const base = p.hasAlpha
      ? { create: { width: canvasW, height: canvasH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }
      : { create: { width: canvasW, height: canvasH, channels: 4, background: p.tone === "light" ? { r: 0, g: 0, b: 0, alpha: 1 } : { r: 255, g: 255, b: 255, alpha: 1 } } };

    await sharp(base)
      .composite([{ input: ink, gravity: "center" }])
      .png({ compressionLevel: 9 })
      .toFile(path.join(DEST, `${p.slug}.png`));

    manifest.push({ slug: p.slug, name: p.name, tone: p.tone });
    ok++;
    console.log(`  ✓ ${p.slug.padEnd(20)} ${p.nw}×${p.nh}  ${p.tone}`);
  } catch (e) {
    fail++;
    console.error(`  ✗ ${p.slug}: ${e.message}`);
  }
}

fs.writeFileSync(path.join(DEST, "_manifest.json"), JSON.stringify(manifest, null, 2));
console.log(`\nDone. ${ok} logos on a uniform ${canvasW}×${canvasH} canvas, ${fail} failed.`);
