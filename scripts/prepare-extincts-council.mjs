/**
 * prepare-extincts-council — the first two seconds of the owner's Flow film
 * "Animal council faces military in…", as stills, for the home page's
 * Extincts slide (owner, 2026-10-18: "use 0 to 2seconds footage of this video
 * as a bg for extincts slide, and link it with horizontal mouse movement").
 *
 * The slide scrubs it with the pointer, frame by frame (FilmScrub); a video
 * seeks too slowly for that, so every frame of the cut is written as a still,
 * in two widths (the big one for a laptop, the small one for a phone) — the
 * way prepare-tata-turn does the Tata slide's:
 *
 *   public/content/extincts/council/1280/NN.webp
 *   public/content/extincts/council/960/NN.webp
 *   public/content/extincts/council/council.json   { frames, w, h, sizes }
 *
 *   node scripts/prepare-extincts-council.mjs "<film.mp4>"
 *
 * Needs Chrome, and puppeteer-core from .perf-tools/node_modules.
 */

import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { createRequire } from "node:module";
import sharp from "sharp";

const puppeteer = createRequire(path.resolve(".perf-tools/package.json"))("puppeteer-core");

const SRC = process.argv[2];
if (!SRC || !fs.existsSync(SRC)) throw new Error('usage: node scripts/prepare-extincts-council.mjs "<film.mp4>"');
const OUT = path.resolve("public/content/extincts/council");
/** Frames a second kept: the film's 24 halved — the camera pulls back slowly,
 *  and the footage, snow and stars, is dense (a 1600px frame came to 260 KB). */
const FPS = 12;
/** The cut: 0 to 2 seconds. */
const CUT = 2;
const SIZES = [1280, 960];
const QUALITY = { 1280: 58, 960: 54 };

fs.rmSync(OUT, { recursive: true, force: true });
for (const w of SIZES) {
  fs.mkdirSync(path.join(OUT, String(w)), { recursive: true });
}
const server = http
  .createServer((req, res) => {
    if (req.url.startsWith("/f.mp4")) {
      const size = fs.statSync(SRC).size;
      const m = /bytes=(\d+)-(\d*)/.exec(req.headers.range ?? "");
      const a = m ? +m[1] : 0;
      const b = m && m[2] ? +m[2] : size - 1;
      res.writeHead(m ? 206 : 200, { "Content-Type": "video/mp4", "Accept-Ranges": "bytes", "Content-Length": b - a + 1, ...(m ? { "Content-Range": `bytes ${a}-${b}/${size}` } : {}) });
      fs.createReadStream(SRC, { start: a, end: b }).pipe(res);
    } else {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(`<video id=v src="/f.mp4" muted playsinline preload=auto></video><canvas id=c></canvas>`);
    }
  })
  .listen(4195);

const browser = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: "new", userDataDir: path.resolve(".perf-tools/profiles", "council") });
const page = await browser.newPage();
await page.goto("http://localhost:4195/");
const meta = await page.evaluate(() => new Promise((ok) => { const v = document.getElementById("v"); const go = () => ok({ w: v.videoWidth, h: v.videoHeight, d: v.duration }); if (v.readyState >= 1) go(); else v.onloadedmetadata = go; }));
console.log("film", meta);
const cut = Math.min(CUT, meta.d);
const frames = Math.floor(cut * FPS + 1e-6) + 1; // frame 0 … the cut, inclusive
for (let k = 0; k < frames; k++) {
  const t = Math.min(cut - 0.01, k / FPS) + 0.001;
  const url = await page.evaluate(
    (t) =>
      new Promise((ok) => {
        const v = document.getElementById("v");
        v.onseeked = () => {
          const c = document.getElementById("c");
          c.width = v.videoWidth;
          c.height = v.videoHeight;
          c.getContext("2d").drawImage(v, 0, 0);
          ok(c.toDataURL("image/png"));
        };
        v.currentTime = t;
      }),
    t,
  );
  const png = Buffer.from(url.split(",")[1], "base64");
  for (const w of SIZES) await sharp(png).resize({ width: w }).webp({ quality: QUALITY[w] }).toFile(path.join(OUT, String(w), `${String(k).padStart(2, "0")}.webp`));
}
await browser.close();
server.close();
fs.writeFileSync(path.join(OUT, "council.json"), JSON.stringify({ frames, w: meta.w, h: meta.h, sizes: SIZES }));
const kb = (w) => Math.round(fs.readdirSync(path.join(OUT, String(w))).reduce((n, f) => n + fs.statSync(path.join(OUT, String(w), f)).size, 0) / 1024);
console.log(frames, "frames;", SIZES.map((w) => `${w}px ${kb(w)} KB`).join(", "));
