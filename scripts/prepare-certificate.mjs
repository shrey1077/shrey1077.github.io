/**
 * prepare-certificate — the owner's AI Film Making certificate, for the brain
 * slide's "At a glance" row (BrainFooter; owner, 2026-10-16: "Upskilled: AI
 * film Making (click to view certificate, display in popup) add my
 * certificate"). Writes, from the PDF the owner supplied:
 *
 *   public/content/about/ai-film-making-certificate.webp  the pop-up's picture
 *   public/content/about/ai-film-making-certificate.pdf   the original, to open
 *
 *   node scripts/prepare-certificate.mjs "<path to the .pdf>"
 */

import fs from "node:fs";
import path from "node:path";
import { pdf } from "pdf-to-img";
import sharp from "sharp";

const SRC = process.argv[2];
if (!SRC || !fs.existsSync(SRC)) throw new Error("usage: node scripts/prepare-certificate.mjs <certificate.pdf>");
const OUT = path.resolve("public/content/about");
fs.mkdirSync(OUT, { recursive: true });
fs.copyFileSync(SRC, path.join(OUT, "ai-film-making-certificate.pdf"));
const doc = await pdf(SRC, { scale: 3 });
const page = await doc.getPage(1);
const info = await sharp(page).resize({ width: 1800 }).webp({ quality: 84 }).toFile(path.join(OUT, "ai-film-making-certificate.webp"));
console.log("certificate", info.width, info.height, Math.round(info.size / 1024) + "KB");
