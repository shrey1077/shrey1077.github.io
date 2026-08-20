/**
 * prepare-zabraku-portfolio.mjs — Zabraku's 2021 company portfolio, page by page.
 *
 * Source: `_source/Assets/Clients/Zabrtaku+/Portfolio 2021.pdf` — 39 pages, an A4
 * cover and back with 37 landscape spreads between them. Same engine as every
 * other PDF in this repo: pypdfium2 through a Python shim, webp at q82, no PDF
 * ships. Idempotent — pages already written are skipped unless --force.
 *
 * ⚠ TWO PAGES ARE DELIBERATELY NOT EXPORTED, and the reasons are not obvious
 * from looking at the output:
 *
 *   • p35 "Contact Us" carries Zabraku's street address, phone numbers and
 *     email. This site is public. The rest of the deck is work; that page is
 *     contact details for a real office, so it stays out until the owner says
 *     otherwise. Nothing else in the deck repeats them.
 *   • p38 is blank — measured, not assumed: mean luma 253 at stdev 20.6, which
 *     is the page furniture and nothing else.
 *
 * Two more are dropped as filler: p37 "Fin" and p39, the back cover. That
 * leaves 35 of 39, in four rooms of nine.
 *
 * Note the deck is the agency's own company profile, not solely the owner's
 * work — it speaks as "we", lists Zabraku's services and client roster, and
 * shows third-party marks (adidas, Google, Star Wars, Colgate, Apollo Tyres,
 * Tecno) in the normal way an agency case study does.
 *
 *   node scripts/prepare-zabraku-portfolio.mjs
 *   node scripts/prepare-zabraku-portfolio.mjs --dry
 *   node scripts/prepare-zabraku-portfolio.mjs --force
 */

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { ASSETS, CONTENT } from "./sources.mjs";

const PY = "C:/Users/tatai/AppData/Local/Python/pythoncore-3.14-64/python.exe";
const SRC = path.join(ASSETS, "Clients/Zabrtaku+/Portfolio 2021.pdf");
const CATALOGUE =
  path.join(CONTENT, "clients/zabraku-media/catalogue");

const MAX_EDGE = 1800;
const QUALITY = 82;

/** ⚠ ONE ROOM, ALL 35 PAGES, REVEALED NINE AT A TIME.
 *
 *  `CatalogueGallery` caps a section at seven artifacts by default — the
 *  curation discipline the rest of the site runs on — and a deck dropped in
 *  whole would render seven and silently swallow the rest. This folder opts out
 *  via `revealStep` in its meta: the deck is a document, so every page is in one
 *  room in page order, three across, with nine on screen and the next nine
 *  arriving as the reader scrolls.
 *
 *  It went through two wrong shapes first — one folder that showed seven of
 *  thirty-seven, then five rooms of seven that broke the deck into chapters it
 *  does not have. Neither is worth restoring.
 *
 *  No captions. The pages explain themselves and the owner asked for the deck
 *  unannotated, so ordering falls to the filenames — which is why they are
 *  zero-padded `pNN`, and why nothing here may be renamed to a non-sortable
 *  form without also restoring a caption list to carry the order.
 *
 *  Four pages of the 39 never ship: p35 (contact details — see above), p38
 *  (blank), and p37/p39, the "Fin" and back-cover filler. */

/** Folder → its pages, as the PDF numbers them (1-based). Nine to a room, which
 *  is the 3x3 grid; 35 and 38 are absent on purpose (header). */
const ROOMS = [
  {
    folder: "Portfolio 2021",
    order: 3,
    // Every page the deck ships, in the order it reads. 35 and 38 absent.
    pages: [
      ...Array.from({ length: 34 }, (_, i) => i + 1), // 1–34
      36,
    ],
  },
];

const dry = process.argv.includes("--dry");
const force = process.argv.includes("--force");

if (!fs.existsSync(SRC)) {
  console.error(`Source PDF not found: ${SRC}`);
  process.exit(1);
}

const total = ROOMS.reduce((n, r) => n + r.pages.length, 0);
console.log(
  `Zabraku Portfolio 2021 — ${total} of 39 pages across ${ROOMS.length} rooms` +
    (dry ? " (dry run)" : ""),
);

/** Every render this run, as [pdfPage, absolute destination]. */
const jobs = [];

for (const room of ROOMS) {
  const out = path.join(CATALOGUE, room.folder);
  if (!dry) fs.mkdirSync(out, { recursive: true });

  for (const n of room.pages) {
    const file = path.join(out, `p${String(n).padStart(2, "0")}.webp`);
    if (force || !fs.existsSync(file)) jobs.push([n, file]);
  }
}

console.log(`  ${jobs.length} page(s) to render`);

if (!dry && jobs.length) {
  const shim = `
import pypdfium2 as p
doc = p.PdfDocument(r"${SRC}")
jobs = [${jobs.map(([n, f]) => `(${n}, r"${f.replace(/\\/g, "/")}")`).join(",")}]
for n, dest in jobs:
    page = doc[n - 1]
    w, h = page.get_size()
    scale = ${MAX_EDGE} / max(w, h)
    img = page.render(scale=scale).to_pil().convert("RGB")
    img.save(dest, "WEBP", quality=${QUALITY}, method=6)
    print("  p%02d -> %s" % (n, dest.split("/")[-2]))
`;
  execFileSync(PY, ["-c", shim], { stdio: "inherit" });
}

if (!dry) {
  for (const room of ROOMS) {
    const meta = {
      order: room.order,
      cover: `p${String(room.pages[0]).padStart(2, "0")}.webp`,
      // No description, no story, no captions — the deck is shown unannotated.
      // Order therefore comes from the zero-padded filenames alone.
      // revealStep lifts the seven cap AND sets the scroll window: all pages
      // are in the room, nine are on screen, the next nine arrive on scroll.
      revealStep: 9,
      showCaptions: false,
    };
    fs.writeFileSync(
      path.join(CATALOGUE, room.folder, "_meta.json"),
      JSON.stringify(meta, null, 2) + "\n",
    );
  }
  console.log(`Wrote ${ROOMS.length} _meta.json files`);
}
