// Vivid Process Technology — three more boards for its study (owner,
// 2026-10-13: "add graphics from here to vivid page", vividprotech.com),
// written as SOURCE files beside the existing ones, for
// prepare-freelance-experience.mjs to turn into plates:
//
//   Vivid tech/vivid-icon-system.png   the identity's icon set: the logo, the
//                                      three application icons, the eight
//                                      product icons on the site's own blue
//                                      and navy tiles
//   Vivid tech/vivid-website-laptop.png  the home page, top, on a laptop
//   Vivid tech/vivid-website-phone.png   three screens of it on a phone
//
// The icons and logo are the owner's own artwork, as published on the site
// (downloaded with the owner's OK into "Vivid tech/vividprotech.com/"); the site
// views are screenshots of the live site. Third-party marks on the site
// (3M, ILC Dover, the client logos) appear only where the screenshots show
// the site as it is.
//
// Needs puppeteer-core (in the untracked .perf-tools/) and a local Chrome.
//   node scripts/make-vivid-boards.mjs
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { SOURCE } from "./sources.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const require = createRequire(path.join(ROOT, ".perf-tools", "package.json"));
const puppeteer = require("puppeteer-core");

const DIR = path.join(SOURCE, "Assets", "Clients", "Freelance", "Vivid tech");
const ART = path.join(DIR, "vividprotech.com");
const TMP = path.join(ROOT, ".perf-tools", "tmp");
fs.mkdirSync(TMP, { recursive: true });
const url = (f) => "file:///" + f.split(path.sep).join("/");
const art = (f) => url(path.join(ART, f));

/** The site's own two grounds for its product cards, and its type. */
const BLUE = "#0b63b9";
const NAVY = "#161b22";
const FONT = `Helvetica, "Helvetica Neue", Arial, sans-serif`;

const APPLICATIONS = [
  ["bio@2x.png", "Bio Processing Industry"],
  ["Asset-3@2x.png", "API"],
  ["Formu@2x.png", "Formulations"],
];
const PRODUCTS = [
  ["membrane@2x.png", "Membrane Filters"],
  ["virus@2x.png", "AEX Chromatography"],
  ["filter-housing@2x.png", "Filter Housing"],
  ["depth@2x.png", "Depth Filters"],
  ["chroma@2x.png", "Chromatographic Clarifier"],
  ["sterile@2x.png", "Sterile Filters"],
  ["pharma@2x.png", "Pharmaceutical Containment"],
  ["biopharma@2x.png", "Biopharmaceutical Containment"],
];

const iconSystem = `<!doctype html><html><head><meta charset="utf-8"><style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { width: 1600px; height: 1200px; font-family: ${FONT}; background: #fff; -webkit-font-smoothing: antialiased; }
  .top { height: 520px; padding: 64px 80px 0; position: relative; }
  .kicker { font-size: 15px; letter-spacing: .28em; color: #8a8f98; text-transform: uppercase; }
  .apps { display: flex; justify-content: space-around; align-items: flex-end; margin-top: 46px; }
  .app { display: flex; flex-direction: column; align-items: center; gap: 22px; width: 380px; }
  .app img { height: 170px; width: 220px; object-fit: contain; }
  .app p { font-size: 26px; color: #111; }
  .grid { display: grid; grid-template-columns: repeat(4, 1fr); height: 680px; }
  .tile { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 26px; color: #fff; padding: 0 24px; text-align: center; }
  .tile img { height: 120px; width: 170px; object-fit: contain; }
  .tile p { font-size: 22px; font-weight: 700; line-height: 1.25; }
</style></head><body>
  <div class="top">
    <img src="${art("vivid-1.png")}" style="height:72px">
    <p class="kicker" style="position:absolute;right:80px;top:84px">Icon system · Applications &amp; products</p>
    <div class="apps">${APPLICATIONS.map(([f, n]) => `<div class="app"><img src="${art(f)}"><p>${n}</p></div>`).join("")}</div>
  </div>
  <div class="grid">${PRODUCTS.map(([f, n], i) => `<div class="tile" style="background:${(i + Math.floor(i / 4)) % 2 ? NAVY : BLUE}"><img src="${art(f)}"><p>${n}</p></div>`).join("")}</div>
</body></html>`;

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: "new",
  args: ["--allow-file-access-from-files", "--hide-scrollbars"],
});
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 1 · The icon system.
{
  const f = path.join(TMP, "vivid-icons.html");
  fs.writeFileSync(f, iconSystem);
  const p = await browser.newPage();
  await p.setViewport({ width: 1600, height: 1200 });
  await p.goto(url(f), { waitUntil: "load" });
  await p.screenshot({ path: path.join(DIR, "vivid-icon-system.png") });
  await p.close();
  console.log("wrote vivid-icon-system.png");
}

/** Open the live site, walk it down so its lazy pictures and entrance
 *  animations have run, and come back to the top. */
async function live(vp) {
  const p = await browser.newPage();
  await p.setViewport(vp);
  await p.goto("https://vividprotech.com/", { waitUntil: "networkidle2", timeout: 90000 }).catch(() => {});
  const h = await p.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < h; y += 400) {
    await p.evaluate((y) => window.scrollTo(0, y), y);
    await sleep(250);
  }
  await p.evaluate(() => window.scrollTo(0, 0));
  await sleep(1500);
  return p;
}

// 2 · The home page on a laptop: its top, in a plain browser frame.
{
  const p = await live({ width: 1440, height: 900 });
  const shot = path.join(TMP, "vivid-laptop.png");
  await p.screenshot({ path: shot, captureBeyondViewport: true, clip: { x: 0, y: 0, width: 1440, height: 1900 } });
  await p.close();
  const f = path.join(TMP, "vivid-laptop.html");
  fs.writeFileSync(f, `<!doctype html><html><head><meta charset="utf-8"><style>*{margin:0;box-sizing:border-box}
    body{width:1600px;height:2180px;background:#e9edf2;display:flex;align-items:center;justify-content:center;font-family:${FONT}}
    .win{width:1480px;border-radius:14px;overflow:hidden;box-shadow:0 30px 70px -25px rgba(10,30,60,.35);background:#fff}
    .bar{height:44px;background:#f3f4f6;display:flex;align-items:center;gap:8px;padding:0 18px;border-bottom:1px solid #e5e7eb}
    .dot{width:12px;height:12px;border-radius:50%;background:#d1d5db}
    .addr{margin-left:18px;flex:1;height:26px;border-radius:7px;background:#fff;border:1px solid #e5e7eb;font-size:13px;color:#6b7280;display:flex;align-items:center;padding:0 12px}
    img{display:block;width:1480px}</style></head><body>
    <div class="win"><div class="bar"><span class="dot"></span><span class="dot"></span><span class="dot"></span><span class="addr">vividprotech.com</span></div><img src="${url(shot)}"></div></body></html>`);
  const q = await browser.newPage();
  await q.setViewport({ width: 1600, height: 2180 });
  await q.goto(url(f), { waitUntil: "load" });
  await q.screenshot({ path: path.join(DIR, "vivid-website-laptop.png") });
  await q.close();
  console.log("wrote vivid-website-laptop.png");
}

// 3 · Three screens on a phone: the top, the applications, the products.
{
  const p = await live({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const at = async (text) =>
    p.evaluate((text) => {
      const el = [...document.querySelectorAll("h1,h2,h3,h4")].find((h) => h.textContent.trim().toUpperCase().startsWith(text));
      return el ? Math.max(0, el.getBoundingClientRect().top + window.scrollY - 90) : 0;
    }, text);
  const shots = [];
  for (const [i, y] of [[0, 0], [1, await at("OUR APPLICATIONS")], [2, await at("FEATURED PRODUCTS")]]) {
    await p.evaluate((y) => window.scrollTo(0, y), y);
    await sleep(1200);
    const f = path.join(TMP, `vivid-phone-${i}.png`);
    await p.screenshot({ path: f });
    shots.push(f);
  }
  await p.close();
  const f = path.join(TMP, "vivid-phone.html");
  fs.writeFileSync(f, `<!doctype html><html><head><meta charset="utf-8"><style>*{margin:0;box-sizing:border-box}
    body{width:1600px;height:1200px;background:${NAVY};display:flex;align-items:center;justify-content:center;gap:70px}
    .ph{width:400px;padding:12px;border-radius:52px;background:#0b0d10;box-shadow:0 40px 80px -30px rgba(0,0,0,.6),0 0 0 2px #2a313b}
    .ph img{display:block;width:376px;border-radius:40px}</style></head><body>
    ${shots.map((s) => `<div class="ph"><img src="${url(s)}"></div>`).join("")}</body></html>`);
  const q = await browser.newPage();
  await q.setViewport({ width: 1600, height: 1200 });
  await q.goto(url(f), { waitUntil: "load" });
  await q.screenshot({ path: path.join(DIR, "vivid-website-phone.png") });
  await q.close();
  console.log("wrote vivid-website-phone.png");
}
await browser.close();
