/**
 * prepare-tata-raws.mjs — the camera raws (.NEF) in the archive.
 *
 * The site owner moved the "mockups to finished product" shots into their
 * section folders, and those photographs are Nikon raws. Nothing in the JS
 * toolchain reads NEF (sharp cannot, and neither can Pillow), so they go
 * through rawpy — libraw with a postprocess to sRGB — then out as webp.
 *
 * These are the REAL-WORLD shots: a board actually mounted on a campus wall,
 * a quote panel installed. They are worth more than any generated mockup,
 * which is why they land in the same folders as the artwork they realise.
 *
 * Idempotent. Run: node scripts/prepare-tata-raws.mjs
 */

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const PY = "C:/Users/tatai/AppData/Local/Python/pythoncore-3.14-64/python.exe";
const SRC = "D:/Assets/Clients/Tata IIS";
const OUT = "D:/Brain Folio/public/content/clients/tata-iis/catalogue";

/** Source folder → catalogue folder. `prefix` marks these as installed shots
 *  so they read as "in place", and keeps them apart from the flat artwork. */
const MAP = [
  { from: "Print/Big Boards/Campus installations", to: "Boards", prefix: "installed" },
  { from: "Print/Big Boards/Lab Boards", to: "Boards", prefix: "installed" },
  { from: "Print/Big Boards/Tata Quotes", to: "Boards", prefix: "installed" },
  { from: "Photography", to: "Photography", prefix: "shot" },
];

const SHIM = `
import sys, json, pathlib
import rawpy
from PIL import Image

src, out_path, max_edge, quality = sys.argv[1:5]
max_edge = int(max_edge); quality = int(quality)

with rawpy.imread(src) as raw:
    rgb = raw.postprocess(use_camera_wb=True, no_auto_bright=False, output_bps=8)
img = Image.fromarray(rgb)
w, h = img.size
scale = min(max_edge / w, max_edge / h, 1.0)
if scale < 1.0:
    img = img.resize((round(w * scale), round(h * scale)), Image.LANCZOS)
img.save(out_path, "WEBP", quality=quality, method=6)
print(json.dumps({"size": img.size}))
`;

const shimPath = path.join(process.env.TEMP || ".", "_raw_shim.py");
fs.writeFileSync(shimPath, SHIM);

const slug = (n) =>
  path.parse(n).name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

let n = 0, bytes = 0;
const failures = [];

for (const entry of MAP) {
  const dir = path.join(SRC, entry.from);
  if (!fs.existsSync(dir)) { failures.push(`${entry.from} (missing)`); continue; }
  const raws = fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith(".nef"));
  if (raws.length === 0) continue;

  const outDir = path.join(OUT, entry.to);
  fs.mkdirSync(outDir, { recursive: true });

  for (const raw of raws) {
    const out = path.join(outDir, `${entry.prefix}-${slug(raw)}.webp`);
    try {
      execFileSync(PY, [shimPath, path.join(dir, raw), out, "2000", "82"], {
        encoding: "utf8",
        maxBuffer: 1 << 26,
      });
      const size = fs.statSync(out).size;
      bytes += size;
      n++;
      console.log(`  ${entry.to.padEnd(12)} ${path.basename(out)}  ${Math.round(size / 1024)} KB`);
    } catch (err) {
      failures.push(`${entry.from}/${raw} — ${String(err.message).split("\n")[0].slice(0, 80)}`);
    }
  }
}

console.log(`\n${n} raws → webp (${(bytes / 1048576).toFixed(1)} MB)`);
if (failures.length) {
  console.log(`\n${failures.length} failure(s):`);
  for (const f of failures) console.log("  -", f);
}
