/**
 * make-showcase-previews — the stills in the home page's "page" quadrants
 * (ShowcaseRoom, 2026-10-15): the first screen of each page a slide's button
 * opens, as a laptop sees it.
 *
 * Shoots the BUILT site, so build first and serve `out/`:
 *   npm run build
 *   node .perf-tools/serve.cjs out 4100
 *   node scripts/make-showcase-previews.mjs [http://localhost:4100]
 * then build again so the stills ship. Each page is shot twice, in the two
 * shapes a slide can be (owner, 2026-10-15: the left side's slides show the
 * page on the WHOLE slide, and every slide must fit a 9:16 screen):
 *   public/content/previews/<id>.webp           a laptop, 1440 × 900 at 1.5×
 *   public/content/previews/<id>-portrait.webp  a phone, 9:16, 405 × 720 at 2×
 * ProjectSlide picks by the screen's orientation. Re-run when a page's first
 * screen changes. Pass ids after the address to shoot only those.
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

/** Showcase id → the page (and place on it) its button opens — the left
 *  side's nine. (The right side's slides are their own; their stills from
 *  the first round stay on disk, unused.) */
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
const SHAPES = [
  { suffix: "", viewport: { width: 1440, height: 900, deviceScaleFactor: 1.5 }, quality: 70 },
  { suffix: "-portrait", viewport: { width: 405, height: 720, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, quality: 72 },
];
for (const shape of SHAPES) {
  await page.setViewport(shape.viewport);
  for (const [id, at] of Object.entries(SHOTS)) {
    if (only.length && !only.includes(id)) continue;
    await page.goto(BASE + at, { waitUntil: "networkidle0", timeout: 60000 });
    // The pages arrive with a short transition; let it, and any hash scroll, settle.
    await new Promise((r) => setTimeout(r, 3500));
    const png = await page.screenshot({ type: "png" });
    const file = path.join(OUT, `${id}${shape.suffix}.webp`);
    await sharp(png).webp({ quality: shape.quality }).toFile(file);
    console.log((id + shape.suffix).padEnd(26), at.padEnd(26), Math.round(fs.statSync(file).size / 1024) + " KB");
  }
}
await browser.close();
