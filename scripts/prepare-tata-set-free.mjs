/**
 * prepare-tata-set-free — the owner's film of the boy setting the birds free
 * (Google Flow, Veo 3.1; 2026-10-16), for the Tata slide on the home page
 * (TataSlide). It replaces the handbook flipbook there: same boy, cage and
 * birds, but the wings beat, his hair moves, and the camera travels in under
 * him as the flock leaves.
 *
 * The text wraps the film's ink, frame by frame, so each frame is read here
 * (in Chrome — the film is H.264, and Chrome decodes it): drawn small, its
 * black found, and each band of BAND px listed as runs of ink, gaps under GAP
 * px closed (the cage's bars, a wing's feathers read as one shape). Writes:
 *
 *   public/content/clients/tata-iis/handbook/set-free.mp4        the film, as supplied
 *   public/content/clients/tata-iis/handbook/set-free-first.webp its first frame (poster)
 *   public/content/clients/tata-iis/handbook/set-free-last.webp  its last (reduced motion)
 *   public/content/clients/tata-iis/handbook/set-free-wrap.json
 *     { w, h, band, fps, frames: [ "a,b,a,b;;a,b;…" ] } — per frame, bands
 *     top to bottom, each band's runs as start,end pairs in analysis px.
 *
 *   node scripts/prepare-tata-set-free.mjs "<path to the .mp4>"
 *
 * Needs Chrome, and puppeteer-core from .perf-tools/node_modules.
 */

import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { createRequire } from "node:module";
import sharp from "sharp";

// Chrome is driven with the local test tools' puppeteer (.perf-tools, not a
// project dependency).
const puppeteer = createRequire(path.resolve(".perf-tools/package.json"))("puppeteer-core");

const SRC = process.argv[2];
if (!SRC || !fs.existsSync(SRC)) throw new Error("usage: node scripts/prepare-tata-set-free.mjs <film.mp4>");
const OUT = path.resolve("public/content/clients/tata-iis/handbook");
/** Analysis size: the film drawn this wide (16:9). */
const AW = 480;
const AH = 270;
const BAND = 3;
const GAP = 5;
/** Luminance under this is ink (the film is black on white). */
const INK = 140;
const FPS = 24;

fs.copyFileSync(SRC, path.join(OUT, "set-free.mp4"));

// Serve the film to Chrome (range requests, so it can seek).
const film = path.join(OUT, "set-free.mp4");
const server = http
  .createServer((req, res) => {
    if (req.url.startsWith("/f.mp4")) {
      const size = fs.statSync(film).size;
      const m = /bytes=(\d+)-(\d*)/.exec(req.headers.range ?? "");
      const a = m ? +m[1] : 0;
      const b = m && m[2] ? +m[2] : size - 1;
      res.writeHead(m ? 206 : 200, { "Content-Type": "video/mp4", "Accept-Ranges": "bytes", "Content-Length": b - a + 1, ...(m ? { "Content-Range": `bytes ${a}-${b}/${size}` } : {}) });
      fs.createReadStream(film, { start: a, end: b }).pipe(res);
    } else {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(`<video id=v src="/f.mp4" muted playsinline preload=auto></video><canvas id=c></canvas>`);
    }
  })
  .listen(4192);

const browser = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: "new", userDataDir: path.resolve(".perf-tools/profiles", `set-free-${Date.now()}`) });
const page = await browser.newPage();
await page.goto("http://localhost:4192/");
const duration = await page.evaluate(() => new Promise((ok) => { const v = document.getElementById("v"); const go = () => ok(v.duration); if (v.readyState >= 1) go(); else v.onloadedmetadata = go; }));
const n = Math.floor(duration * FPS);

/** One frame at time t: its pixels at AW × AH, or the full frame as PNG. */
const grab = (t, full) =>
  page.evaluate(
    (t, full, AW, AH) =>
      new Promise((ok) => {
        const v = document.getElementById("v");
        v.onseeked = () => {
          const c = document.getElementById("c");
          c.width = full ? v.videoWidth : AW;
          c.height = full ? v.videoHeight : AH;
          const x = c.getContext("2d", { willReadFrequently: true });
          x.drawImage(v, 0, 0, c.width, c.height);
          if (full) return ok(c.toDataURL("image/png"));
          const d = x.getImageData(0, 0, AW, AH).data;
          const lum = new Array(AW * AH);
          for (let i = 0; i < AW * AH; i++) lum[i] = Math.round(0.3 * d[i * 4] + 0.59 * d[i * 4 + 1] + 0.11 * d[i * 4 + 2]);
          ok(lum);
        };
        v.currentTime = t;
      }),
    t,
    full,
    AW,
    AH,
  );

const frames = [];
for (let k = 0; k < n; k++) {
  const lum = await grab(Math.min(duration - 0.001, (k + 0.5) / FPS), false);
  const bands = [];
  for (let b = 0; b * BAND < AH; b++) {
    const ink = new Uint8Array(AW);
    for (let y = b * BAND; y < Math.min(AH, (b + 1) * BAND); y++) for (let x = 0; x < AW; x++) if (lum[y * AW + x] < INK) ink[x] = 1;
    const runs = [];
    for (let x = 0; x < AW; x++) {
      if (!ink[x]) continue;
      let e = x;
      while (e + 1 < AW && ink[e + 1]) e++;
      const last = runs[runs.length - 1];
      if (last && x - last[1] <= GAP) last[1] = e + 1;
      else runs.push([x, e + 1]);
      x = e;
    }
    // A speck of compression noise is not ink.
    bands.push(runs.filter(([a, c]) => c - a >= 2).map(([a, c]) => `${a},${c}`).join(","));
  }
  frames.push(bands.join(";").replace(/;+$/, ""));
}

for (const [t, name] of [[0.001, "set-free-first.webp"], [duration - 0.001, "set-free-last.webp"]]) {
  const url = await grab(t, true);
  await sharp(Buffer.from(url.split(",")[1], "base64")).resize({ width: 1280 }).webp({ quality: 82 }).toFile(path.join(OUT, name));
}
await browser.close();
server.close();

fs.writeFileSync(path.join(OUT, "set-free-wrap.json"), JSON.stringify({ w: AW, h: AH, band: BAND, fps: FPS, frames }));
console.log(n, "frames,", Math.round(fs.statSync(path.join(OUT, "set-free-wrap.json")).size / 1024), "KB of wrap;", Math.round(fs.statSync(film).size / 1024), "KB film");
