/**
 * prepare-uid-experience.mjs — assets for the bespoke UID page.
 *
 * UID is the Unitedworld Institute of Design, where the M.Des in Visual
 * Communication happened (2018–2020). The page is the portfolio of that degree:
 * a branding system, packaging, a performance identity, print and fieldwork.
 * The painting and craft made alongside it go to public/content/art instead,
 * which the homepage's Art room reads.
 *
 * Source: D:/Brain Website portfolio/UID
 * Output: public/content/clients/uid/{brand,work}/…
 * Idempotent. Node ≥ 18, sharp (+ pdf-to-img for the documentation PDFs).
 */

import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const SRC = "D:/Brain Website portfolio/UID";
const DEST = "D:/Brain Folio/public/content/clients/uid";

const ensure = (p) => fs.mkdirSync(p, { recursive: true });
let ok = 0, fail = 0;
const good = (m) => { ok++; console.log("  ok " + m); };
const bad = (m, e) => { fail++; console.error("  FAIL " + m + ": " + e.message); };

/** Raster → web webp. */
async function webp(src, out, width = 1400, q = 82) {
  try {
    ensure(path.dirname(out));
    await sharp(src, { limitInputPixels: false })
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: q })
      .toFile(out);
    good(path.basename(out));
  } catch (e) { bad(path.basename(out), e); }
}

/** First page of a PDF → webp. */
async function pdfPage(src, out, width = 1400) {
  try {
    ensure(path.dirname(out));
    const { pdf } = await import("pdf-to-img");
    const doc = await pdf(src, { scale: 2 });
    for await (const page of doc) {
      await sharp(page).resize({ width, withoutEnlargement: true }).webp({ quality: 84 }).toFile(out);
      good(path.basename(out));
      return;
    }
    throw new Error("empty pdf");
  } catch (e) { bad(path.basename(out), e); }
}

/* The institute's mark is the official one from uid.edu.in, fetched once into
 * brand/uid-logo.png — the archive holds no Unitedworld artwork. */

/** Each project: a folder of stills. */
const WORK = {
  // Puran Studios — the full branding system.
  branding: [
    "Branding/LOGOS SHEETSpuran-01-01.png",
    "Branding/pnglogo-01.png",
    "Branding/logo puran2-01.png",
    "Branding/logo puran3-01.png",
    "Branding/logo puran4-01.png",
    "Branding/cards.png",
    "Branding/Vinyl Record .png",
    "Branding/HARCOVER MOCKUP.png",
    "Branding/Adversiment-Billboard-mockup-vol4.png",
    "Branding/visuallang-01.png",
    "Branding/1-01.png",
    "Branding/2-01.png",
    "Branding/3-01.png",
  ],
  // Packaging — Farmstacks and the muffin box.
  packaging: [
    "Packaginhg/farmstacks/Green FARMSTACK1.png",
    "Packaginhg/farmstacks/Green FARMSTACK2.png",
    "Packaginhg/farmstacks/Green FARMSTACK3.png",
    "Packaginhg/farmstacks/Green FARMSTACK4.png",
    "Packaginhg/farmstacks/farminfinite.png",
    "Packaginhg/sortoffinalfarmstacks.jpg",
    "Packaginhg/Sharad1.jpg",
  ],
  // Nirvaan — body and space.
  nirvaan: ["NIRVAAN- BODY AND SPACE/nirvaan poster.jpg"],
  // Posters and illustration.
  posters: [
    "Himalaya_Warli_Poster_Semthree-01.png",
    "Himalaya_Warli_Poster_sem3-01.png",
    "covid19advs-01.png",
  ],
  // The trip — a photo essay.
  trip: ["the trip/111.png", "the trip/222.png", "the trip/333.png", "the trip/444.png", "the trip/555.png", "the trip/666.png", "the trip/777.png"],
};

for (const [folder, files] of Object.entries(WORK)) {
  console.log(`${folder}:`);
  let n = 0;
  for (const f of files) {
    const src = path.join(SRC, f);
    if (!fs.existsSync(src)) { console.error(`  skip (missing) ${f}`); continue; }
    await webp(src, `${DEST}/work/${folder}/${String(++n).padStart(2, "0")}.webp`);
  }
}

/* The painting and the craft belong to the ART room, not to the degree page —
 * they go to public/content/art, which the homepage's Art panel reads. */
const ART = "D:/Brain Folio/public/content/art";

console.log("art — painting:");
const PAINTING = [
  "PINKM-01.png", "bluemandlanew-01.png", "greenmandala-01.png", "orngmand-01.png",
  "godsavememandalaBLUE-01.png", "newmandalawhite-01.png", "whitemanda-01.png",
  "brain-01.png", "hrt-01.png", "immu-01.png", "enrg-01.png",
];
{
  let n = 0;
  for (const f of PAINTING) {
    const src = path.join(SRC, f);
    if (!fs.existsSync(src)) { console.error(`  skip (missing) ${f}`); continue; }
    await webp(src, `${ART}/Painting/${String(++n).padStart(2, "0")}.webp`, 1400);
  }
}

console.log("art — craft:");
try {
  const dir = path.join(SRC, "Sketches");
  const picks = fs.readdirSync(dir).filter((f) => /\.jpe?g$/i.test(f)).sort().slice(0, 12);
  let n = 0;
  for (const f of picks) await webp(path.join(dir, f), `${ART}/Craft/${String(++n).padStart(2, "0")}.webp`, 1200);
} catch (e) { bad("craft", e); }

/** Documentation covers — the books the degree produced. */
console.log("documents:");
await pdfPage(`${SRC}/BOOK ETHNO.pdf`, `${DEST}/work/documents/01.webp`);
await pdfPage(`${SRC}/Packaging_Documentation_Shrey_Dagar.pdf`, `${DEST}/work/documents/02.webp`);
await pdfPage(`${SRC}/NIRVAAN- BODY AND SPACE/Nirvaan Documentation.pdf`, `${DEST}/work/documents/03.webp`);
await pdfPage(`${SRC}/Branding/Branding_Shrey.pdf`, `${DEST}/work/documents/04.webp`);

console.log(`\nDone. ${ok} ok, ${fail} failed.`);
