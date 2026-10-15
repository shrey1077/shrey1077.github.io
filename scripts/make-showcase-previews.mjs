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
 *   public/content/previews/<id>.webp           a laptop, 1728 × 1080 at 1.25×
 *   public/content/previews/<id>-portrait.webp  a phone, 9:16, 450 × 800 at 2×
 * Both a little ZOOMED OUT (owner, 2026-10-15: "Tata preview on slide is ok,
 * need a little zoomed out") — a screen 1.2× the usual, so the slide shows
 * more of the page at a touch smaller size.
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

/** Still → the page it shows. Only the slides that ARE a page's preview
 *  need one now (2026-10-15): Tata IIS, UID, and Vivid's website. The others
 *  became slides of their own; their stills stay on disk, unused. */
const SHOTS = {
  "tata-iis": "/clients/tata-iis/",
  uid: "/clients/uid/",
  // Vivid's slide is the company's own website (owner: "full screen Vivid
  // ProTech website preview").
  "vivid-site": "https://vividprotech.com/",
}

/** Blurred out of a still, in its own pixels: Vivid's website carries its
 *  phone number in the header, and the owner wants no phone numbers on the
 *  site (2026-10-15). ⚠ Measured on the laptop shot; re-check if the site's
 *  header moves. */
const REDACT = {
  "vivid-site": [{ left: 425, top: 50, width: 185, height: 42 }],
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
  { suffix: "", viewport: { width: 1728, height: 1080, deviceScaleFactor: 1.25 }, quality: 70 },
  { suffix: "-portrait", viewport: { width: 450, height: 800, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, quality: 72 },
];
for (const shape of SHAPES) {
  await page.setViewport(shape.viewport);
  for (const [id, at] of Object.entries(SHOTS)) {
    if (only.length && !only.includes(id)) continue;
    const url = at.startsWith("http") ? at : BASE + at;
    await page.goto(url, { waitUntil: at.startsWith("http") ? "networkidle2" : "networkidle0", timeout: 90000 });
    // The pages arrive with a short transition; let it, and any hash scroll, settle.
    await new Promise((r) => setTimeout(r, 3500));
    let png = await page.screenshot({ type: "png" });
    for (const box of shape.suffix ? [] : (REDACT[id] ?? [])) {
      const patch = await sharp(png).extract(box).blur(14).toBuffer();
      png = await sharp(png).composite([{ input: patch, left: box.left, top: box.top }]).png().toBuffer();
    }
    const file = path.join(OUT, `${id}${shape.suffix}.webp`);
    await sharp(png).webp({ quality: shape.quality }).toFile(file);
    console.log((id + shape.suffix).padEnd(26), at.padEnd(26), Math.round(fs.statSync(file).size / 1024) + " KB");
  }
}
await browser.close();
