// Link-preview images (Open Graph / Twitter, 1200×630) — drawn from the
// site's own artwork in the site's own type, by rendering HTML in Chrome.
//
//   node scripts/make-og-images.mjs options   → three site-wide options, A/B/C,
//                                               into .perf-tools/og-options/ (not shipped)
//   node scripts/make-og-images.mjs site <A|B|C>
//                                             → the chosen one, as
//                                               public/og/og-image.jpg
//   node scripts/make-og-images.mjs icons     → the tab and home-screen icons,
//                                               src/app/{icon.png,apple-icon.png,favicon.ico}
//   node scripts/make-og-images.mjs clients   → one per client page, as
//                                               public/og/clients/<slug>.jpg
//
// Needs puppeteer-core and a local Chrome; puppeteer-core lives in the
// untracked .perf-tools/ folder (npm i puppeteer-core there), so it is not a
// dependency of the site.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const ROOT = path.resolve(import.meta.dirname, "..");
const require = createRequire(path.join(ROOT, ".perf-tools", "package.json"));
const puppeteer = require("puppeteer-core");
const CHROME = process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe";

const pub = (p) => "file:///" + path.join(ROOT, "public", p).replace(/\\/g, "/");
const W = 1200;
const H = 630;
/** The site's fixed band along the foot: 7% of the height (FootBand). */
const BAND = Math.round(H * 0.07);

const BASE_CSS = `
  @font-face { font-family: Digibra; src: url(${pub("fonts/digibra.woff2")}); }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: ${W}px; height: ${H}px; overflow: hidden; }
  body { position: relative; font-family: Helvetica, "Helvetica Neue", "Helvetica LT Std", Arial, sans-serif; -webkit-font-smoothing: antialiased; }
  .digibra { font-family: Digibra; font-synthesis: none; text-transform: uppercase; line-height: 1; }
  .band { position: absolute; left: 0; right: 0; bottom: 0; height: ${BAND}px; background: #0a0a0a; color: #fff;
          display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 17px; letter-spacing: 0.02em; }
  /* The portrait orb at its even split: the line half left of the disc's
     centre (46.74% — PortraitOrb's seam at 0.5), the paint half right. */
  .orb { position: relative; aspect-ratio: 1200 / 606; }
  .orb img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; }
  .orb .line { -webkit-mask-image: linear-gradient(to right, #000 46.69%, transparent 46.79%); }
  .orb .paint { -webkit-mask-image: linear-gradient(to right, transparent 46.69%, #000 46.79%); }
`;

const orb = (w) => `<div class="orb" style="width:${w}px"><img class="line" src="${pub("content/portrait/orb-line.webp")}"><img class="paint" src="${pub("content/portrait/orb-paint.webp")}"></div>`;

/** The three site-wide options. */
const SITE = {
  // A — the first slide: name over the split portrait, on the gallery wall.
  A: `<body style="background:#f9f9f9">
      <img src="${pub("videos/circuit-bg-poster.jpg")}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.08">
      <div style="position:absolute;inset:0 0 ${BAND}px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px">
        <p class="digibra" style="font-size:70px;color:#171717">Shrey Singh</p>
        <p style="font-size:24px;color:#737373;letter-spacing:.02em;margin-bottom:6px">Visual Communication Designer</p>
        ${orb(720)}
      </div>
      <div class="band">shrey107.com</div></body>`,
  // B — the second slide: the brain, grey half and colour half, under the
  // PORTFOLIO mark. (Its foot cropped: every frame carries a grey rule in its
  // last rows, which the site clears too — BrainSequence.)
  B: `<body style="background:#f9f9f9">
      <div style="position:absolute;inset:0 0 ${BAND}px;display:flex;flex-direction:column;align-items:center">
        <p class="digibra" style="margin-top:36px;font-size:58px;letter-spacing:.22em;color:#171717;padding-left:.22em">Portfolio</p>
        <div style="width:860px;height:478px;overflow:hidden;margin-top:-58px"><img src="${pub("brain/frames/024.webp")}" style="width:860px;display:block"></div>
      </div>
      <div style="position:absolute;left:56px;top:250px;color:#525252"><p style="font-size:40px;font-weight:800;letter-spacing:-.01em;color:#262626">Left</p><p style="font-size:20px;color:#737373">brain</p></div>
      <div style="position:absolute;right:56px;top:250px;text-align:right"><p style="font-size:40px;font-weight:800;background:linear-gradient(90deg,#e8318a,#f5a623,#2bb673,#2f80ed,#8e44ad);-webkit-background-clip:text;color:transparent">Right</p><p style="font-size:20px;color:#737373">brain</p></div>
      <div class="band">Shrey Singh — Visual Communication Designer</div></body>`,
  // C — the band, grown to the whole card: the portrait on black, the name in
  // white. Stands out where most previews are white.
  C: `<body style="background:#0a0a0a;color:#fff">
      <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px">
        ${orb(760)}
        <p class="digibra" style="font-size:62px;color:#fff;margin-top:6px">Shrey Singh</p>
        <p style="font-size:22px;color:#a3a3a3;letter-spacing:.04em">Visual Communication Designer · shrey107.com</p>
      </div></body>`,
};

/** A client page's card: the client's mark on the white plate, its line, and
 *  the band with the name. */
const clientCard = (c) => `<body style="background:#f9f9f9">
  <img src="${pub("videos/circuit-bg-poster.jpg")}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.06">
  <div style="position:absolute;inset:0 0 ${BAND}px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:28px;padding:0 120px;text-align:center">
    <div style="width:520px;height:250px;background:#fff;border-radius:28px;box-shadow:0 10px 40px rgba(0,0,0,.08);display:flex;align-items:center;justify-content:center;padding:40px">
      <img src="${pub(c.logo.replace(/^\//, ""))}" style="max-width:100%;max-height:100%;object-fit:contain">
    </div>
    <p style="font-size:30px;color:#262626;line-height:1.25;max-width:900px">${c.line}</p>
  </div>
  <div class="band">Shrey Singh — Visual Communication Designer</div></body>`;

const CLIENT_CARDS = [
  { slug: "tata-iis", logo: "/content/career/tata-iis.png", line: "Tata IIS — An identity system for an institution that teaches systems." },
  { slug: "azoth-biotech", logo: "/content/clients/azoth-biotech/brand/logo-azoth.png", line: "Azoth Biotech — Identity for a lab rewriting its own formula." },
  { slug: "abs", logo: "/content/career/abs.png", line: "ABS Wholesale — A brand built to move at warehouse scale." },
  { slug: "zabraku-media", logo: "/content/clients/zabraku-media/zabraku-logo-dark.png", line: "Zabraku — A media house with a story-first spine." },
  { slug: "uid", logo: "/content/clients/uid/brand/uid-logo.png", line: "UID — Design education, given its own design language." },
  { slug: "newsmobile", logo: "/content/career/newsmobile.png", line: "NewsMobile — A news identity moving at the speed of the feed." },
];

const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--allow-file-access-from-files"] });
const render = async (body, out) => {
  const page = await browser.newPage();
  await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
  // From a file, not setContent: an about:blank page may not read file:// art.
  const tmp = path.join(ROOT, ".perf-tools", "tmp", "og.html");
  fs.mkdirSync(path.dirname(tmp), { recursive: true });
  fs.writeFileSync(tmp, `<!doctype html><html><head><meta charset="utf-8"><style>${BASE_CSS}</style></head>${body}</html>`);
  await page.goto("file:///" + tmp.replace(/\\/g, "/"), { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  // JPEG: WhatsApp drops a preview image over ~300KB, and the PNG was 0.5MB.
  await page.screenshot({ path: out, type: "jpeg", quality: 86 });
  await page.close();
  console.log("wrote", path.relative(ROOT, out));
};

const [mode, pick] = process.argv.slice(2);
if (mode === "options") {
  for (const [k, body] of Object.entries(SITE)) await render(body, path.join(ROOT, ".perf-tools", "og-options", `og-option-${k}.jpg`));
} else if (mode === "site") {
  if (!SITE[pick]) throw new Error("site <A|B|C>");
  await render(SITE[pick], path.join(ROOT, "public", "og", "og-image.jpg"));
} else if (mode === "icons") {
  // The tab and home-screen icons: the brain — its grey half and its colour
  // half — cropped to a circle on white, which still reads as two halves at
  // 16px. → src/app/icon.png, apple-icon.png and favicon.ico.
  const icon = (s, round) => `<body style="width:${s}px;height:${s}px;background:${round ? "transparent" : "#fff"}">
    <div style="width:${s}px;height:${s}px;border-radius:${round ? "50%" : "0"};background:#fff url(${pub("brain/frames/024.webp")}) no-repeat;
      background-size:${Math.round(s * 1280 / 600)}px auto;background-position:${Math.round(-s * 260 / 600)}px ${Math.round(-s * 46 / 600)}px"></div></body>`;
  const shot = async (s, round, out, keep = true) => {
    const page = await browser.newPage();
    await page.setViewport({ width: s, height: s, deviceScaleFactor: 1 });
    const tmp = path.join(ROOT, ".perf-tools", "tmp", "icon.html");
    fs.writeFileSync(tmp, `<!doctype html><html><head><meta charset="utf-8"><style>${BASE_CSS} html,body{width:${s}px;height:${s}px}</style></head>${icon(s, round)}</html>`);
    await page.goto("file:///" + tmp.replace(/\\/g, "/"), { waitUntil: "load" });
    const buf = await page.screenshot({ type: "png", omitBackground: round });
    await page.close();
    if (keep) {
      fs.writeFileSync(out, buf);
      console.log("wrote", path.relative(ROOT, out));
    }
    return buf;
  };
  const app = path.join(ROOT, "src", "app");
  await shot(512, true, path.join(app, "icon.png"));
  await shot(180, false, path.join(app, "apple-icon.png"));
  // favicon.ico: 16, 32 and 48px PNGs packed into one .ico.
  const pngs = [];
  for (const s of [16, 32, 48]) pngs.push([s, await shot(s, true, null, false)]);
  const head = Buffer.alloc(6 + 16 * pngs.length);
  head.writeUInt16LE(0, 0);
  head.writeUInt16LE(1, 2);
  head.writeUInt16LE(pngs.length, 4);
  let offset = head.length;
  pngs.forEach(([s, buf], i) => {
    const e = 6 + 16 * i;
    head.writeUInt8(s, e);
    head.writeUInt8(s, e + 1);
    head.writeUInt16LE(1, e + 4);
    head.writeUInt16LE(32, e + 6);
    head.writeUInt32LE(buf.length, e + 8);
    head.writeUInt32LE(offset, e + 12);
    offset += buf.length;
  });
  fs.writeFileSync(path.join(app, "favicon.ico"), Buffer.concat([head, ...pngs.map(([, b]) => b)]));
  console.log("wrote", path.relative(ROOT, path.join(app, "favicon.ico")));
} else if (mode === "clients") {
  for (const c of CLIENT_CARDS) await render(clientCard(c), path.join(ROOT, "public", "og", "clients", `${c.slug}.jpg`));
} else {
  console.log("usage: options | site <A|B|C> | clients");
}
await browser.close();
