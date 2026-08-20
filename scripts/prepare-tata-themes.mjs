/**
 * prepare-tata-themes.mjs — the theme-separated Digital sources.
 *
 * The archive was reorganised so the three brand voices are explicit folders
 * ("TATA IIS THEME", "IISA", "IISM theme", …) rather than something you have to
 * infer from a filename. The page reads brand off the ASSET NAME, though, so
 * this pipeline folds the folder's theme into the output name as a prefix:
 *
 *   Digital/Website Banners/IISA theme/Foo.png  →  iisa-foo.webp
 *
 * `brandOf()` in constants/tataSections.ts then lands it in the IISA column
 * with no per-file bookkeeping. That is the whole trick: theme lives in the
 * filename, so adding artwork to a theme folder is all it takes.
 *
 * Idempotent. Run: node scripts/prepare-tata-themes.mjs
 */

import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { ASSETS, CONTENT } from "./sources.mjs";

const SRC = path.join(ASSETS, "Clients/Tata IIS");
const DEST = path.join(CONTENT, "clients/tata-iis/catalogue");

const MAX_W = 1800;
const RASTER = new Set([".png", ".jpg", ".jpeg", ".webp"]);

/** Source theme folder name → the marker `brandOf()` looks for. */
const THEME = { tata: "tata", iisa: "iisa", iism: "iism" };

const slug = (n) =>
  path.parse(n).name.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

/**
 * Destination catalogue folder → the theme folders that feed it.
 * `recurse` pulls nested folders too (Mockups/IISA/Tshirts and friends).
 */
const FOLDERS = [
  {
    name: "Mockups",
    description: "The identity staged in the world — the system shown as it would be built.",
    themes: [
      { theme: THEME.tata, from: "Digital/Mockups/TATA IIS THEME" },
      { theme: THEME.iisa, from: "Digital/Mockups/IISA", recurse: true },
      { theme: THEME.iism, from: "Digital/Mockups/IISM", recurse: true },
    ],
  },
  {
    name: "Website Banners",
    description: "Masthead artwork for the institute's own pages, per campus.",
    themes: [
      { theme: THEME.iisa, from: "Digital/Website Banners/IISA theme" },
      { theme: THEME.iism, from: "Digital/Website Banners/IISM theme" },
    ],
  },
  {
    name: "Socials & Screens",
    description: "The social system — one grammar, spoken in three voices.",
    themes: [
      { theme: THEME.tata, from: "Digital/Social Media/Tata IIS theme" },
      { theme: THEME.iisa, from: "Digital/Social Media/IISA theme" },
      { theme: THEME.iism, from: "Digital/Social Media/IISM theme" },
    ],
  },
];

/** Every raster under `dir`, optionally including nested folders. */
function collect(dir, recurse, prefix = "") {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (recurse) out.push(...collect(path.join(dir, e.name), true, `${prefix}${slug(e.name)}-`));
      continue;
    }
    if (RASTER.has(path.extname(e.name).toLowerCase())) {
      out.push({ abs: path.join(dir, e.name), name: `${prefix}${slug(e.name)}` });
    }
  }
  return out;
}

let total = 0;
const missing = [];

for (const folder of FOLDERS) {
  const outDir = path.join(DEST, folder.name);
  fs.mkdirSync(outDir, { recursive: true });
  let wrote = 0;
  const perTheme = {};

  for (const t of folder.themes) {
    const srcDir = path.join(SRC, t.from);
    const files = collect(srcDir, t.recurse);
    if (files.length === 0) { missing.push(t.from); continue; }

    for (const f of files) {
      // The theme prefix is what puts the asset in the right column.
      const out = path.join(outDir, `${t.theme}-${f.name}.webp`);
      try {
        await sharp(f.abs).resize({ width: MAX_W, withoutEnlargement: true }).webp({ quality: 82 }).toFile(out);
        wrote++;
        perTheme[t.theme] = (perTheme[t.theme] ?? 0) + 1;
      } catch (err) {
        missing.push(`${t.from}/${path.basename(f.abs)} (${err.message.slice(0, 40)})`);
      }
    }
  }

  fs.writeFileSync(
    path.join(outDir, "_meta.json"),
    JSON.stringify({ description: folder.description }, null, 2) + "\n",
  );

  const split = Object.entries(perTheme).map(([k, v]) => `${k} ${v}`).join(" · ") || "none";
  console.log(`${String(wrote).padStart(3)} → ${folder.name.padEnd(18)} (${split})`);
  total += wrote;
}

console.log(`\nDone. ${total} themed assets.`);
if (missing.length) {
  console.log(`\n${missing.length} source(s) missing or failed:`);
  for (const m of missing) console.log("  -", m);
}
