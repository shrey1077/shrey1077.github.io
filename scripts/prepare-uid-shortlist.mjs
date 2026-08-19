/**
 * prepare-uid-shortlist.mjs — the owner's curated shortlist, routed to three rooms.
 *
 * On 2026-08-20 the owner assembled `UID/Shortlisted for Claude/` and named where
 * each folder belongs:
 *
 *   Branding-Puran Studios  → the UID page's branding project
 *   Packaging               → the UID page's packaging project (+ the full zine)
 *   Sketches                → the homepage's ART room
 *   Ebooks                  → the homepage's PUBLICATIONS room
 *   Chess website           → shipped as-is; see copy-chess-site.mjs
 *
 * ⚠ This SUPERSEDES the branding/packaging halves of prepare-uid-experience.mjs,
 * which read the unshortlisted archive. That script still owns nirvaan, posters
 * and trip. Its `documents` step is retired: "The Books" moved to Publications
 * by the owner's instruction, so a UID project would only duplicate them.
 *
 * ⚠ `Sketches/` is NOT all sketches. It is a mixed coursework archive, and two
 * groups in it are not art at all — the Farm Stacks dielines and process board
 * (packaging), and the Rockwell type specimen. The dielines are routed to the
 * packaging project where they belong; the specimen stays in Art, under the
 * owner's folder mapping. Both are flagged in the handoff.
 *
 * ⚠ Nothing PDF ships, per the repo's standing rule (pdf-to-images.mjs): every
 * page becomes a webp and the site reads those. A 59 MB zine in a static export
 * is not a download anyone wants.
 *
 * Source: D:/Brain Website portfolio/UID
 * Idempotent. Node >= 18, sharp; pypdfium2 through the shared Python shim.
 */

import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const PY = "C:/Users/tatai/AppData/Local/Python/pythoncore-3.14-64/python.exe";
const ROOT = "D:/Brain Website portfolio/UID";
const SHORT = `${ROOT}/Shortlisted for Claude`;
const FOLIO = "D:/Brain Folio/public/content";
const UID_WORK = `${FOLIO}/clients/uid/work`;
const ART = `${FOLIO}/art`;
const PUBS = `${FOLIO}/publications`;

let ok = 0;
const failures = [];
const ensure = (p) => fs.mkdirSync(p, { recursive: true });
const good = (m) => { ok++; console.log("  ok " + m); };
const bad = (m, e) => { failures.push(`${m} — ${e.message}`); console.error("  FAIL " + m + ": " + e.message); };

/** Wipe a folder's webps so a re-curation never leaves orphans behind. */
function reset(dir) {
  if (!fs.existsSync(dir)) return;
  for (const f of fs.readdirSync(dir)) {
    if (f.endsWith(".webp")) fs.unlinkSync(path.join(dir, f));
  }
}

/** Raster → web webp, numbered in the order given. */
async function webp(src, out, width = 1400, q = 82) {
  try {
    ensure(path.dirname(out));
    await sharp(src, { limitInputPixels: false })
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: q })
      .toFile(out);
    good(path.relative(FOLIO, out));
  } catch (e) { bad(path.basename(out), e); }
}

/** Render a numbered list of source files into `dir` as 01.webp, 02.webp, … */
async function plates(dir, files, width = 1400) {
  reset(dir);
  let n = 0;
  for (const f of files) {
    const src = path.isAbsolute(f) ? f : path.join(SHORT, f);
    if (!fs.existsSync(src)) { bad(f, new Error("missing")); continue; }
    await webp(src, `${dir}/${String(++n).padStart(2, "0")}.webp`, width);
  }
}

/* ── The PDF shim: selected pages of one PDF straight to webp ─────────── */

const SHIM = `
import sys, json, pathlib
import pypdfium2 as pdfium

src, outdir, pages_spec, max_edge, quality = sys.argv[1:6]
max_edge = int(max_edge); quality = int(quality)
outdir = pathlib.Path(outdir); outdir.mkdir(parents=True, exist_ok=True)

doc = pdfium.PdfDocument(src)
total = len(doc)
# pages_spec: "all" or 1-based comma list ("13,14,15,16")
idx = range(total) if pages_spec == "all" else [int(x) - 1 for x in pages_spec.split(",")]
written = []
for out_n, i in enumerate(idx, start=1):
    if i < 0 or i >= total:
        continue
    page = doc[i]
    w, h = page.get_width(), page.get_height()
    scale = min(min(max_edge / w, max_edge / h), 4.0)
    img = page.render(scale=scale).to_pil()
    if img.mode not in ("RGB", "RGBA"):
        img = img.convert("RGB")
    name = f"{out_n:02d}.webp"
    img.save(outdir / name, "WEBP", quality=quality, method=6)
    written.append(name)
print(json.dumps({"total": total, "written": written}))
`;

const shimPath = path.join(process.env.TEMP || ".", "_uid_pdf_shim.py");
fs.writeFileSync(shimPath, SHIM);

/** Render `spec` ("all" | "13,14,15,16") of a PDF into `dir`, numbered from 01. */
function pdfPages(src, dir, spec = "all", maxEdge = 1500, quality = 78) {
  try {
    if (!fs.existsSync(src)) throw new Error("missing");
    reset(dir);
    const raw = execFileSync(PY, [shimPath, src, dir, spec, String(maxEdge), String(quality)], {
      encoding: "utf8",
      maxBuffer: 1 << 26,
    });
    const res = JSON.parse(raw.trim().split("\n").pop());
    good(`${path.relative(FOLIO, dir)} — ${res.written.length}p of ${res.total}`);
    return res;
  } catch (e) { bad(path.basename(src), e); return null; }
}

/* ── 1. Puran Studios — the branding system ───────────────────────────── */
/* Ordered as a brand book reads: the mark, its lockups, the exploration that
 * got there, then the law (language / type / colour), then the things it lives
 * on, then the colophon. `LOGOS SHEETSpuran-01-01.png` is dropped as a
 * near-duplicate of `logos_purandocu-01.png`, which is the finished layout.
 * `Himalaya_Warli_Poster_sem3-01.png` sits in this folder but is not Puran — it
 * is already a plate on the posters project. */
const B = "Branding-Puran Studios";
console.log("uid/branding:");
await plates(`${UID_WORK}/branding`, [
  `${B}/pnglogo-01.png`,
  `${B}/2-01.png`,
  `${B}/3-01.png`,
  `${B}/logos_purandocu-01.png`,
  `${B}/visuallang-01-01.png`,
  `${B}/TYPO-01-01.png`,
  `${B}/colour-01.png`,
  `${B}/Promotion-01.png`,
  `${B}/cards.png`,
  `${B}/2019-12-12 (2).png`,
  `${B}/Vinyl Record .png`,
  `${B}/HARCOVER MOCKUP.png`,
  `${B}/mockup1_billboard.png`,
  `${B}/Adversiment-Billboard-mockup-vol4.png`,
  `${B}/last page-01.png`,
]);

/* ── 2. Packaging — structure first, then the zine's finished pages ───── */
/* The owner's note in the folder: "USe only page number 13-16 in preview, with
 * an option to read full zine." Those four pages are the hydroponics end
 * results, its display, and the Griffin Muffin concept. The dielines and the
 * process board come from Sketches/, which is where they happened to sit. */
console.log("uid/packaging:");
const PKG_ZINE = `${SHORT}/Packaging/Packaging_Documentation_Shrey_Dagar.pdf`;
const SK = `${SHORT}/Sketches`;
await plates(`${UID_WORK}/packaging`, [
  `${SK}/DC_250685612.jpg`, // net / dieline, printed and folded
  `${SK}/DC_250685613.jpg`, // the stack, assembled
  `${SK}/DC_250685614.jpg`, // Farm Stacks process board
]);
// The zine's four shortlisted pages continue the same numbered run (04–07).
{
  const tmp = `${UID_WORK}/_zine_tmp`;
  const res = pdfPages(PKG_ZINE, tmp, "13,14,15,16", 1500, 80);
  if (res) {
    let n = 3;
    for (const f of res.written) {
      fs.renameSync(path.join(tmp, f), `${UID_WORK}/packaging/${String(++n).padStart(2, "0")}.webp`);
    }
  }
  fs.rmSync(tmp, { recursive: true, force: true });
}

/* ── 3. The ART room ──────────────────────────────────────────────────── */
/* `Craft/` is deleted, not refreshed: it was the first twelve Sketches files in
 * alphabetical order, so every one of them reappears below, curated. Leaving it
 * would ship each of those twelve twice. */
console.log("art:");
fs.rmSync(`${ART}/Craft`, { recursive: true, force: true });

const ART_SETS = {
  // Travel and architecture sketchbook pages, notes in the margins.
  Sketchbooks: [
    "DC_25068567.jpg", "DC_25068582.jpg", "DC_25068583.jpg", "DC_25068584.jpg",
    "DC_25068585.jpg", "DC_25068586.jpg", "DC_25068587.jpg", "DC_25068588.jpg",
    "DC_25068589.jpg",
  ],
  // Observational drawing: hands, eyes, leaves, objects.
  "Drawing Studies": [
    "DC_250685610.jpg", "DC_250685611.jpg", "DC_25068562.jpg", "DC_25068563.jpg",
    "DC_25068564.jpg", "DC_25068565.jpg", "DC_25068566.jpg", "DC_25068568.jpg",
    "DC_25068569.jpg",
  ],
  // Ink, pattern and the basic-design principle boards.
  "Ink and Pattern": [
    "DC_25068561.jpg", "DC_250685615.jpg", "DC_250685616.jpg", "DC_25068581.jpg",
    "DC_250685810.jpg",
  ],
  // The laser-cut stepped structure, photographed on the bench.
  "Model Making": [
    "20190401_024511.jpg", "20190401_024523.jpg", "20190401_024537.jpg",
    "20190401_024600.jpg", "20190401_024654.jpg", "20190401_024720.jpg",
  ],
  // Fieldwork frames from the same folder.
  "Field Photographs": [
    "DC_250685619.jpg", "DC_250685620.jpg", "DC_250685621.jpg", "DC_250685622.jpg",
  ],
  // A Rockwell specimen, hand-assembled. ⚠ Screen work sitting in an Art room —
  // kept here because the owner mapped the whole Sketches folder to Art.
  "Type Studies": [
    "DC_25068591.jpg", "DC_25068592.jpg", "DC_25068593.jpg", "DC_25068594.jpg",
    "DC_25068595.jpg", "DC_25068596.jpg",
  ],
  // The earliest work in the shortlist — portraits, from `sketching old/`.
  Portraits: [
    "sketching old/bob_marley___from_cig_ashes_by_zlatan107_d50x4ew-pre.jpg",
    "sketching old/jim morison.jpg",
    "sketching old/zlatan_ibrahimovic_by_zlatan107_d5h6vqc-fullview.jpg",
  ],
};

for (const [name, files] of Object.entries(ART_SETS)) {
  await plates(`${ART}/${name}`, files.map((f) => `Sketches/${f}`), 1400);
}

/* ── 4. The PUBLICATIONS room ─────────────────────────────────────────── */
/* Every page of every book, so they can actually be read on the site. The two
 * carried over from the UID page's retired "The Books" project come from the
 * wider archive, not the shortlist — the Ebooks folder does not hold them.
 *
 * NOT carried: `Branding/branddocu/Branding_Shrey.pdf`. It is one page of
 * personal-branding self-description, not a publication. */
console.log("publications:");
const E = `${SHORT}/Ebooks`;
const BOOKS = [
  ["design-for-print", `${E}/A5 portraitDESIGN4printFINAL.pdf`],
  ["ethnography", `${E}/BOOK ETHNO.pdf`],
  ["food-distribution", `${E}/Elective- Colloquium Paper- Food Distribution during Natural Disasters.pdf`],
  ["mycoveda-app", `${E}/Mycoveda App doc.pdf`],
  ["packaging-zine", PKG_ZINE],
  ["nirvaan", `${ROOT}/NIRVAAN- BODY AND SPACE/Nirvaan Documentation.pdf`],
];
for (const [slug, src] of BOOKS) pdfPages(src, `${PUBS}/${slug}`, "all", 1400, 78);

console.log(`\nDone. ${ok} ok, ${failures.length} failed.`);
if (failures.length) for (const f of failures) console.log("  " + f);
