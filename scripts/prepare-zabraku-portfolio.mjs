/**
 * prepare-zabraku-portfolio.mjs — Zabraku's 2021 company portfolio, page by page.
 *
 * Source: `D:/Assets/Clients/Zabrtaku+/Portfolio 2021.pdf` — 39 pages, an A4
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
 * That leaves 37 of 39. The captions below ARE the curation: `readSections`
 * orders a folder by caption order first and filename second, so a partial
 * caption list would silently reorder the deck. Every exported page is
 * captioned, in page order, for that reason.
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

const PY = "C:/Users/tatai/AppData/Local/Python/pythoncore-3.14-64/python.exe";
const SRC = "D:/Assets/Clients/Zabrtaku+/Portfolio 2021.pdf";
const CATALOGUE =
  "D:/Brain Folio/public/content/clients/zabraku-media/catalogue";

const MAX_EDGE = 1800;
const QUALITY = 82;

/** ⚠ WHY THIS IS FIVE FOLDERS AND NOT ONE.
 *
 *  `CatalogueGallery` caps a section at seven artifacts on purpose — the
 *  curation discipline the whole site is built on. A 37-page deck dropped into
 *  one folder therefore renders SEVEN pages and silently swallows the other
 *  thirty; the first pass here did exactly that. So the deck is split along its
 *  own section breaks into five rooms of seven, which is the shape the rest of
 *  the catalogue already uses.
 *
 *  That leaves two more pages out, both pure filler: p37 "Fin" and p39, the
 *  back cover. If the cap ever changes, they are one line each to restore. */

/** Folder → its seven pages, each `[pdfPage, caption]`. Page numbers are
 *  1-based as the PDF counts them; 35 and 38 are absent on purpose (header). */
const ROOMS = [
  {
    folder: "Portfolio — The Studio",
    order: 3,
    description:
      "How Zabraku introduces itself: the cover, the premise, and the pages that set up everything after them.",
    story:
      "A media house selling 'art meets technology' has to promise both halves before it shows either, and the front of this deck is that promise — a wordmark, a Steve Jobs quote about how design works rather than how it looks, and an index that puts the installations first.",
    pages: [
      [1, "Cover — the Zabraku wordmark."],
      [2, "Opening spread — design is how it works."],
      [3, "Title spread — Portfolio 2021."],
      [4, "The premise — where art meets technology."],
      [5, "Index."],
      [6, "Intro — who we are."],
      [7, "Vision."],
    ],
  },
  {
    folder: "Portfolio — Experiential",
    order: 4,
    description:
      "The services page, then the first run of experiential builds — Google, a mirror that answers back, a robot that keeps goal.",
    story:
      "The deck leads with the hardest thing to fake. Before any logo appears there is a robot goalkeeper that stopped Lionel Messi from the spot, an RFID maze that counts your level, and thought bubbles built for Google — work that only exists if the studio can actually build it.",
    pages: [
      [8, "Our services — experiential, brand, digital, content."],
      [9, "Experiential Marketing — section opener."],
      [10, "Thought Bubbles, for Google."],
      [11, "Interactive Mirror."],
      [12, "AI robot goalkeeper — Tecno Mobile."],
      [13, "RFID-based registration and maze level counter."],
      [14, "adidas Space Station — the installation set."],
    ],
  },
  {
    folder: "Portfolio — Installations",
    order: 5,
    description:
      "The rest of the built work: treadmills that programme their own LEDs, a touch map, a glass car wired for current.",
    story:
      "Where the first room proves the studio can build, this one proves it can build at scale and on a brand's terms — adidas across three pieces, an electric-vehicle energy flow rendered in LED, and a projection room you stand inside.",
    pages: [
      [15, "Programmed LED treadmill."],
      [16, "Hashtag photo print."],
      [17, "Interactive touch map."],
      [18, "The VII Sense."],
      [19, "Electric-vehicle energy-flow glass car, as an LED installation."],
      [20, "Immersive projection room."],
      [21, "Virtual events platform, for Apollo Tyres."],
    ],
  },
  {
    folder: "Portfolio — Identity",
    order: 6,
    description:
      "The brand identity half — marks, packs and the case study that explains one of them properly.",
    story:
      "The identity work sits behind the installations, which is the right way round for this studio: by the time a logo appears you already believe the hands. The RK Entertainment page does the persuading — a monogram derived on a bounding grid, with the typeface argued for in writing.",
    pages: [
      [22, "Brand Identity — section opener."],
      [23, "curestick 1.0."],
      [24, "AVAIL — campaign identity."],
      [25, "Superfast charger — pack and campaign."],
      [26, "KOSHA."],
      [27, "Logo designs — Ayush Vaid and Gautam Heights."],
      [28, "RK Entertainment — identity system."],
    ],
  },
  {
    folder: "Portfolio — Campaigns",
    order: 7,
    description:
      "Product ranges, the digital and poster output, the client roster, and the studio's own brand rules.",
    story:
      "The back half is the working evidence: packs and ranges, a wall of posters and social sets, the roster the studio had earned by 2021, and finally its own colour and typeface rules — the guidelines page being the one place a media house has to take its own advice.",
    pages: [
      [29, "ABS Wholesale — identity."],
      [30, "tcboo — product range."],
      [31, "Digital Marketing & Advertising — section opener."],
      [32, "Digital campaigns."],
      [33, "Poster design and social posts."],
      [34, "Client roster."],
      [36, "Brand guidelines — colour scheme and typeface."],
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

  for (const [n] of room.pages) {
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
      cover: `p${String(room.pages[0][0]).padStart(2, "0")}.webp`,
      description: room.description,
      story: room.story,
      // The caption list IS the order: readCatalogueCategory sorts by it, and
      // a page missing from here would fall to the back of the room.
      captions: Object.fromEntries(
        room.pages.map(([n, caption]) => [
          `p${String(n).padStart(2, "0")}.webp`,
          caption,
        ]),
      ),
    };
    fs.writeFileSync(
      path.join(CATALOGUE, room.folder, "_meta.json"),
      JSON.stringify(meta, null, 2) + "\n",
    );
  }
  console.log(`Wrote ${ROOMS.length} _meta.json files`);
}
