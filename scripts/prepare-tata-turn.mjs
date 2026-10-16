/**
 * prepare-tata-turn — the student turning to face the camera, as stills, for
 * the home page's Tata slide (owner, 2026-10-16: the Flow film
 * "Animate_image_and_rotate_face…", "cut it exactly the point of screenshot"
 * — 00:01:10 on Flow's timeline, one second and ten frames at 24 fps — "and
 * use the zero to this point footage to replace the background and image of
 * student … and the movement of mouse in the right half of screen
 * horizontally to correspond to the cut video").
 *
 * The slide scrubs it with the pointer, frame by frame; a video seeks too
 * slowly for that, so every frame of the cut is written as a still, in two
 * widths (the big one for a laptop, the small one for a phone):
 *
 *   public/content/clients/tata-iis/hero/turn/1600/NN.webp
 *   public/content/clients/tata-iis/hero/turn/960/NN.webp
 *   public/content/clients/tata-iis/hero/turn/turn.json   { frames, w, h }
 *
 *   node scripts/prepare-tata-turn.mjs "<film.mp4>"
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
if (!SRC || !fs.existsSync(SRC)) throw new Error('usage: node scripts/prepare-tata-turn.mjs "<film.mp4>"');
const OUT = path.resolve("public/content/clients/tata-iis/hero/turn");
const FPS = 24;
/** The cut: 00:01:10 — one second and ten frames. */
const CUT = 1 + 10 / FPS;
const SIZES = [1600, 960];

for (const w of SIZES) fs.mkdirSync(path.join(OUT, String(w)), { recursive: true });
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
  .listen(4194);

const browser = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: "new", userDataDir: path.resolve(".perf-tools/profiles", `turn-${Date.now()}`) });
const page = await browser.newPage();
await page.goto("http://localhost:4194/");
const meta = await page.evaluate(() => new Promise((ok) => { const v = document.getElementById("v"); const go = () => ok({ w: v.videoWidth, h: v.videoHeight }); if (v.readyState >= 1) go(); else v.onloadedmetadata = go; }));
const frames = Math.round(CUT * FPS) + 1; // frame 0 … the cut, inclusive
for (let k = 0; k < frames; k++) {
  const t = Math.min(CUT, k / FPS) + 0.001;
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
  for (const w of SIZES) await sharp(png).resize({ width: w }).webp({ quality: 76 }).toFile(path.join(OUT, String(w), `${String(k).padStart(2, "0")}.webp`));
}
await browser.close();
server.close();
fs.writeFileSync(path.join(OUT, "turn.json"), JSON.stringify({ frames, w: meta.w, h: meta.h, sizes: SIZES }));
const kb = (w) => Math.round(fs.readdirSync(path.join(OUT, String(w))).reduce((n, f) => n + fs.statSync(path.join(OUT, String(w), f)).size, 0) / 1024);
console.log(frames, "frames;", SIZES.map((w) => `${w}px ${kb(w)} KB`).join(", "));
