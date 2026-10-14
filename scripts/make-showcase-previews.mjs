/**
 * make-showcase-previews — the stills in the home page's "page" quadrants
 * (ShowcaseRoom, 2026-10-15): the first screen of each page a slide's button
 * opens, as a laptop sees it.
 *
 * Shoots the BUILT site, so build first and serve `out/`:
 *   npm run build
 *   node .perf-tools/serve.cjs out 4100
 *   node scripts/make-showcase-previews.mjs [http://localhost:4100]
 * then build again so the stills ship. Writes
 * public/content/previews/<showcase id>.webp (960 × 600). Re-run when a
 * page's first screen changes.
 *
 * Needs puppeteer-core and a local Chrome; puppeteer-core lives in the
 * untracked .perf-tools/ folder, so it is not a dependency of the site.
 */

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const require = createRequire(path.join(ROOT, ".perf-tools", "package.json"));
const puppeteer = require("puppeteer-core");
const CHROME = process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = process.argv[2] || "http://localhost:4100";
const OUT = path.join(ROOT, "public", "content", "previews");

/** Showcase id → the page (and place on it) its button opens. */
const SHOTS = {
  "tata-iis": "/clients/tata-iis/",
  "azoth-biotech": "/clients/azoth-biotech/",
  abs: "/clients/abs/",
  luzid: "/clients/abs/#luzid",
  kartpipe: "/clients/abs/#kartpipe",
  zabraku: "/clients/zabraku-media/",
  newsmobile: "/clients/newsmobile/",
  uid: "/clients/uid/",
  vivid: "/clients/vivid/",
  "arts-and-crafts": "/arts-and-crafts/",
  writings: "/writings/",
  "the-extincts-project": "/extincts/",
};

const only = process.argv.slice(3);
fs.mkdirSync(OUT, { recursive: true });
const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  userDataDir: path.join(ROOT, ".perf-tools", "profiles", `previews-${Date.now()}`),
  args: ["--hide-scrollbars"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
for (const [id, at] of Object.entries(SHOTS)) {
  if (only.length && !only.includes(id)) continue;
  await page.goto(BASE + at, { waitUntil: "networkidle0", timeout: 60000 });
  // The pages arrive with a short transition; let it, and any hash scroll, settle.
  await new Promise((r) => setTimeout(r, 3500));
  const png = await page.screenshot({ type: "png" });
  const file = path.join(OUT, `${id}.webp`);
  await sharp(png).resize({ width: 960 }).webp({ quality: 76 }).toFile(file);
  console.log(id.padEnd(22), at.padEnd(26), Math.round(fs.statSync(file).size / 1024) + " KB");
}
await browser.close();
