/**
 * prepare-tata-sections.mjs — the catalogue folders added by the section
 * restructure (Print / Digital / Photography & Videography / Misc).
 *
 * The original `prepare-tata-iis.mjs` built 13 catalogue folders. The
 * restructure asks for a finer taxonomy, so this script adds the folders that
 * one doesn't produce — visiting cards, ID cards, trifolds, the handbook,
 * stickers & notepads, the big boards, call backgrounds and the mockup wall.
 * Existing folders are left completely alone; run either script in any order.
 *
 * Much of this source material is PDF (handbooks, lab boards, backdrops), which
 * sharp cannot read — those go through `pdf-to-img` (pdfjs + prebuilt canvas),
 * the same route `render-iisa-guidelines.mjs` uses.
 *
 * ⚠ Privacy: the ID-card fronts name and picture a real trainee. They were
 * excluded from the original build for that reason and are included here only
 * because the site owner explicitly asked for them (2026-08-08).
 *
 * Idempotent — re-running overwrites derivatives in place.
 *   node scripts/prepare-tata-sections.mjs
 */

import { pdf } from "pdf-to-img";
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const SRC = "D:/Assets/Clients/Tata IIS";
const DEST = "D:/Brain Folio/public/content/clients/tata-iis/catalogue";

/** Source filename → tidy asset slug. */
const slug = (name) =>
  path
    .parse(name)
    .name.toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/* ── the manifest ─────────────────────────────────────────────────────────
 * Each folder lists sources. A source is one of:
 *   { img: <file> }                  a single raster file
 *   { dir: <folder>, only?: [...] }  every raster in a folder
 *   { pdf: <file>, pages?: [1,2] }   PDF pages (default: page 1)
 * `as` renames the output; otherwise the source filename is slugified.       */
const FOLDERS = [
  {
    name: "Visiting Cards",
    description: "The two-campus calling card — Ahmedabad and Mumbai off one plate.",
    sources: [{ pdf: "Print/Visiting card/Visiting Card 2026_ahm-MUM.pdf", pages: "all", as: "visiting-card" }],
  },
  {
    name: "ID Cards",
    description: "Trainee identity cards for both campuses — every front, then every reverse.",
    sources: [
      { img: "Print/ID cards/Front.png", as: "ahmedabad-front" },
      { img: "Print/ID cards/BACK.png", as: "ahmedabad-back" },
      { img: "Print/ID cards/Front_mum.png", as: "mumbai-front" },
      { img: "Print/ID cards/Back_mum.png", as: "mumbai-back" },
      // The two Artboard exports are byte-identical to the Mumbai front and
      // reverse above, and Back_IG CARD is a "Follow us" social card rather
      // than an ID card at all — all three dropped 2026-08-10.
      //   { img: "Print/ID cards/Artboard 1.png",     as: "card-artwork-i" },
      //   { img: "Print/ID cards/Artboard 1-1.png",   as: "card-artwork-ii" },
      //   { pdf: "Print/ID cards/Back_IG CARD.pdf",   as: "lanyard-card" },
    ],
  },
  {
    name: "Trifolds",
    description: "Three-panel folds — the institute's pitch in a pocket.",
    sources: [{ dir: "Print/Brochures/Trifolds" }],
  },
  {
    name: "Handbook",
    description: "The trainee handbook for both campuses — cover and opening spreads.",
    sources: [
      { pdf: "Print/Handbook/IISA Handbook AMD MAY28.pdf", pages: [1, 2, 3], as: "ahmedabad-handbook" },
      { pdf: "Print/Handbook/IISM Handbook MUM MAY28.pdf", pages: [1, 2, 3], as: "mumbai-handbook" },
      { pdf: "Print/Handbook/IISA Handbook_one.pdf", as: "ahmedabad-handbook-single" },
      { pdf: "Print/Handbook/IISM Handbook_one.pdf", as: "mumbai-handbook-single" },
    ],
  },
  {
    name: "Stickers & Notepads",
    description: "Desk collateral — notepad covers, bookmarks, visitor cards and campus stickers.",
    sources: [
      { dir: "Print/Notepad", only: [".png", ".jpg"] },
      { pdf: "Print/Notepad/Notepad_Mum_front.pdf", as: "notepad-mumbai-front" },
      { pdf: "Print/Notepad/Notepad_Mum_back.pdf", as: "notepad-mumbai-back" },
      { dir: "Print/Stickers" },
    ],
  },
  {
    name: "Boards",
    description: "Wall-scale boards — lab explainers, ceremony backdrops and the Tata quote series.",
    sources: [
      { dir: "Print/Big Boards/Tata Quotes" },
      ...["Applications", "Partners", "Student's journey", "Tech in Lab", "Protocols", "Dos And Donts"].map((f) => ({
        pdf: `Print/Big Boards/Lab Boards/${f}.pdf`,
        as: `lab-board-${slug(f)}`,
      })),
      // Ceremony backdrops. Drawn at built size, so they render tiny (0.12).
      // Only "Backdrop 3" survives pdfjs — the other five in that folder fail
      // with "Create skia surface failed" at EVERY scale down to 0.01, i.e. a
      // resource pdfjs can't rasterise, not a size problem. They need a real
      // PDF engine (poppler / Ghostscript / Acrobat export) to come in.
      { pdf: "Print/Big Boards/Exterior Signages/Backdrop 3.pdf", as: "ceremony-backdrop", scale: 0.12 },
    ],
  },
  {
    name: "Backgrounds",
    description: "Video-call backdrops and the on-camera frame the institute presents itself in.",
    sources: [{ dir: "Digital/Teams call BG" }],
  },
  {
    name: "Mockups",
    description: "The identity staged in the world — the system shown as it would be built.",
    sources: [{ dir: "Digital/Mockups" }],
  },
];

/* ── Presentations: not built here, on purpose ─────────────────────────────
 * `Digital/Presentations/Placement Proposal TATA IIS 2025 edited2.pptx` is a
 * 28-slide deck and there is no headless renderer on this box (no LibreOffice,
 * no poppler) — it was rendered through PowerPoint COM instead:
 *
 *   $ppt  = New-Object -ComObject PowerPoint.Application
 *   $pres = $ppt.Presentations.Open($src, $true, $false, $false)
 *   $pres.SaveAs($outDir, 18)   # 18 = ppSaveAsPNG
 *   $pres.Close(); $ppt.Quit()
 *
 * Only slides 1, 2, 5, 9 and 12 ship. Every other slide either names and
 * pictures an identifiable trainee (10, 13-17, 19-27 — several carry family
 * income and background) or is an unfinished lorem-ipsum template (18, 28).
 * If the deck is ever re-rendered, screen it again before adding slides: the
 * five here are the only ones that carry no personal data.
 * ------------------------------------------------------------------------ */

/* ── helpers ──────────────────────────────────────────────────────────── */

const RASTER = new Set([".png", ".jpg", ".jpeg", ".webp"]);
const MAX_W = 1800;

async function writeRaster(buf, outPath) {
  await sharp(buf).resize({ width: MAX_W, withoutEnlargement: true }).webp({ quality: 84 }).toFile(outPath);
}

// pdf-to-img renders pages eagerly, so a failed page rejects a promise we are
// no longer awaiting; without this the whole run dies on one bad PDF.
process.on("unhandledRejection", (reason) => {
  console.warn(`  (ignored async pdf error: ${reason?.message ?? reason})`);
});

/** Render selected pages of a PDF. `pages` = "all" | [1-indexed…] | undefined→[1].
 *  `scale` defaults to 2; hoarding artwork is drawn at real-world size
 *  (15x10ft, 18x9ft) and must be rendered far smaller or the rasteriser
 *  refuses to allocate a surface. */
async function renderPdf(absPdf, outDir, base, pages, scale = 2) {
  const want = pages === "all" ? null : new Set(pages ?? [1]);
  const doc = await pdf(absPdf, { scale });
  let page = 0;
  const written = [];
  for await (const buf of doc) {
    page++;
    if (want && !want.has(page)) continue;
    const multi = want === null || want.size > 1;
    const name = multi ? `${base}-${String(page).padStart(2, "0")}.webp` : `${base}.webp`;
    await writeRaster(buf, path.join(outDir, name));
    written.push(name);
  }
  return written;
}

/* ── run ──────────────────────────────────────────────────────────────── */

let folders = 0;
let assets = 0;
const missing = [];

// `--only "Boards"` re-runs a single folder (the mockup wall is slow).
const onlyArg = process.argv.indexOf("--only");
const only = onlyArg !== -1 ? process.argv[onlyArg + 1] : null;

for (const folder of FOLDERS) {
  if (only && folder.name !== only) continue;
  const outDir = path.join(DEST, folder.name);
  fs.mkdirSync(outDir, { recursive: true });
  let wrote = 0;

  for (const s of folder.sources) {
    try {
      if (s.img) {
        const abs = path.join(SRC, s.img);
        if (!fs.existsSync(abs)) { missing.push(s.img); continue; }
        await writeRaster(fs.readFileSync(abs), path.join(outDir, `${s.as ?? slug(path.basename(s.img))}.webp`));
        wrote++;
      } else if (s.pdf) {
        const abs = path.join(SRC, s.pdf);
        if (!fs.existsSync(abs)) { missing.push(s.pdf); continue; }
        wrote += (await renderPdf(abs, outDir, s.as ?? slug(path.basename(s.pdf)), s.pages, s.scale)).length;
      } else if (s.dir) {
        const absDir = path.join(SRC, s.dir);
        if (!fs.existsSync(absDir)) { missing.push(s.dir); continue; }
        const allow = s.only ? new Set(s.only) : RASTER;
        for (const file of fs.readdirSync(absDir)) {
          const ext = path.extname(file).toLowerCase();
          if (!allow.has(ext) || !RASTER.has(ext)) continue;
          await writeRaster(fs.readFileSync(path.join(absDir, file)), path.join(outDir, `${slug(file)}.webp`));
          wrote++;
        }
      }
    } catch (err) {
      missing.push(`${s.img ?? s.pdf ?? s.dir} (${err.message})`);
    }
  }

  // Folder name is the display name; the meta carries the blurb.
  fs.writeFileSync(
    path.join(outDir, "_meta.json"),
    JSON.stringify({ description: folder.description }, null, 2) + "\n",
  );

  console.log(`${String(wrote).padStart(3)} → ${folder.name}`);
  folders++;
  assets += wrote;
}

console.log(`\nDone. ${assets} assets across ${folders} new catalogue folders.`);
if (missing.length) {
  console.log(`\n${missing.length} source(s) missing or failed:`);
  for (const m of missing) console.log("  -", m);
}
