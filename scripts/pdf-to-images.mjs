/**
 * pdf-to-images.mjs — rasterise every source PDF into web images.
 *
 * The Tata IIS archive is PDF-heavy (104 files / 1342 pages) and a PDF cannot
 * be shown in a gallery, so nothing PDF ships: every page becomes a webp.
 *
 * ENGINE: pypdfium2 (Google's PDFium), driven through a small Python shim.
 * The earlier `pdf-to-img` route (pdfjs + skia) could not rasterise the
 * ceremony backdrops at ANY scale — they are drawn at built size (180 x 120
 * inch) and skia refused the surface. PDFium renders them without complaint,
 * so it is the engine for all PDF work from here on.
 *
 * SIZE: pages render to a long edge of MAX_EDGE and save as webp q82 —
 * visually lossless for artwork at display size, roughly a tenth of the PNG.
 *
 * PAGE CAPS: multi-page documents export every page, EXCEPT where a document
 * is a book rather than a piece of artwork. The four handbooks are ~200pp
 * each (800 of the archive's 1342 pages); shipping them whole would add
 * ~100MB and bury the slider, so they are capped. Everything else is complete.
 *
 *   node scripts/pdf-to-images.mjs             # convert all
 *   node scripts/pdf-to-images.mjs --dry       # report only, write nothing
 *   node scripts/pdf-to-images.mjs --only Certificates
 */

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { ASSETS, CONTENT } from "./sources.mjs";

const PY = "C:/Users/tatai/AppData/Local/Python/pythoncore-3.14-64/python.exe";
const SRC = path.join(ASSETS, "Clients/Tata IIS");
const OUT = path.join(CONTENT, "clients/tata-iis/catalogue");

const MAX_EDGE = 1800;
const QUALITY = 82;

/** Source folder (under SRC) → destination catalogue folder, and an optional
 *  page cap for documents that are books rather than artwork. */
const MAP = [
  { from: "Print/Visiting card", to: "Visiting Cards" },
  { from: "Print/ID cards", to: "ID Cards" },
  { from: "Print/Brochures", to: "Brochures" },
  { from: "Print/Brochures/Trifolds", to: "Trifolds" },
  { from: "Print/Flyers", to: "Flyers & Campaigns" },
  { from: "Print/Flyers/Course Flyers", to: "Flyers & Campaigns" },
  { from: "Print/Campus Posters", to: "Campus Posters" },
  { from: "Print/Certificates", to: "Certificates" },
  { from: "Print/Certificates/Culinary Certs/PDF", to: "Certificates" },
  { from: "Print/Letterhead", to: "Stationery" },
  { from: "Print/Notepad", to: "Stickers & Notepads" },
  { from: "Print/Signages", to: "Billboards & Signages" },
  { from: "Print/Standee", to: "Lab Standees" },
  { from: "Print/Big Boards/Lab Boards", to: "Boards" },
  { from: "Print/Big Boards/Exterior Signages", to: "Boards" },
  { from: "Print/Events/Skill connect", to: "Events" },
  // NOT converted, by the site owner's instruction (2026-08-09): the four
  // handbooks are ~200pp each — 800 of the archive's 1342 PDF pages — and are
  // books rather than artwork. Add a line here if that ever changes.
  //   { from: "Print/Handbook", to: "Handbook" },
];

const slug = (n) =>
  path.parse(n).name.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const DRY = process.argv.includes("--dry");
const onlyIdx = process.argv.indexOf("--only");
const only = onlyIdx !== -1 ? process.argv[onlyIdx + 1] : null;

/* The Python shim: render selected pages of one PDF straight to webp. */
const SHIM = `
import sys, json, pathlib
import pypdfium2 as pdfium

src, outdir, base, cap, max_edge, quality = sys.argv[1:7]
cap = int(cap); max_edge = int(max_edge); quality = int(quality)
outdir = pathlib.Path(outdir); outdir.mkdir(parents=True, exist_ok=True)

doc = pdfium.PdfDocument(src)
total = len(doc)
pages = range(total if cap <= 0 else min(total, cap))
written = []
for i in pages:
    page = doc[i]
    w, h = page.get_width(), page.get_height()
    scale = min(max_edge / w, max_edge / h)
    scale = min(scale, 4.0)          # never upsample a small page absurdly
    img = page.render(scale=scale).to_pil()
    if img.mode not in ("RGB", "RGBA"):
        img = img.convert("RGB")
    name = f"{base}.webp" if total == 1 else f"{base}-{i+1:02d}.webp"
    img.save(outdir / name, "WEBP", quality=quality, method=6)
    written.append(name)
print(json.dumps({"total": total, "written": written}))
`;

const shimPath = path.join(process.env.TEMP || ".", "_pdf_shim.py");
fs.writeFileSync(shimPath, SHIM);

let files = 0, pagesOut = 0, pagesSkipped = 0, bytes = 0;
const failures = [];

for (const entry of MAP) {
  if (only && entry.to !== only) continue;
  const srcDir = path.join(SRC, entry.from);
  if (!fs.existsSync(srcDir)) { failures.push(`${entry.from} (missing)`); continue; }

  const pdfs = fs.readdirSync(srcDir).filter((f) => f.toLowerCase().endsWith(".pdf"));
  if (pdfs.length === 0) continue;

  const outDir = path.join(OUT, entry.to);
  for (const pdf of pdfs) {
    const base = slug(pdf);
    if (DRY) { console.log(`  [dry] ${entry.from}/${pdf} → ${entry.to}/${base}`); files++; continue; }
    try {
      const raw = execFileSync(
        PY,
        [shimPath, path.join(srcDir, pdf), outDir, base, String(entry.cap ?? 0), String(MAX_EDGE), String(QUALITY)],
        { encoding: "utf8", maxBuffer: 1 << 26 },
      );
      const res = JSON.parse(raw.trim().split("\n").pop());
      files++;
      pagesOut += res.written.length;
      pagesSkipped += res.total - res.written.length;
      for (const n of res.written) bytes += fs.statSync(path.join(outDir, n)).size;
      const capped = res.total > res.written.length ? `  (capped from ${res.total})` : "";
      console.log(`  ${String(res.written.length).padStart(3)}p  ${entry.to}/${base}${capped}`);
    } catch (err) {
      failures.push(`${entry.from}/${pdf} — ${String(err.message).split("\n")[0].slice(0, 90)}`);
    }
  }
}

console.log(
  `\n${files} PDFs → ${pagesOut} images (${(bytes / 1048576).toFixed(1)} MB, avg ${
    pagesOut ? Math.round(bytes / pagesOut / 1024) : 0
  } KB/page)`,
);
if (pagesSkipped) console.log(`${pagesSkipped} pages skipped by page caps (handbooks).`);
if (failures.length) {
  console.log(`\n${failures.length} failure(s):`);
  for (const f of failures) console.log("  -", f);
}
