/**
 * copy-chess-site.mjs — ship the 2022 chess site verbatim at /chess/.
 *
 * "Three Steps Ahead" is a complete four-page site (Bootstrap 3 + jQuery)
 * written at UID. The owner's instruction on 2026-08-20 was to ship it AS-IS at
 * its own URL rather than rewrite it as a case study, so it is copied byte for
 * byte into `public/chess/` — Next's static export copies `public/` straight
 * through, and GitHub Pages resolves `/chess/` to `chess/index.html`.
 *
 * ⚠ ONE class of edit is made, and only because "as-is" would otherwise mean
 * "broken". The original loads three things over PLAIN HTTP:
 *
 *     http://fonts.googleapis.com/css?family=Podkova...      (both faces)
 *     http://www.chessstrategyonline.com/js/widgets.min.js   (the Play widget)
 *
 * shrey1077.github.io is HTTPS-only, and a browser blocks active mixed content
 * outright — so left alone the site would ship with no webfonts and no chess
 * engine, which is not the site the owner wrote. Each is upgraded to https and
 * NOTHING else is touched: no markup, no CSS, no restructuring.
 *
 * ⚠ FLAGGED, not resolved — for the owner:
 *   • The Play page executes a THIRD-PARTY script from chessstrategyonline.com
 *     on the portfolio's own origin. If that host has no valid https, the
 *     upgrade above means the widget silently fails instead of loading over
 *     http; either way the owner should decide whether to keep it.
 *   • learn.html embeds two YouTube videos that are other people's tutorials.
 *   • images/content__images/566edda72340f8e0008b554b.jfif has a CDN-style
 *     name and is likely stock of unknown licence.
 *   • contact.html posts to action="" — inert on a static host. It looks live
 *     and collects a name and email that go nowhere.
 *
 * Idempotent: the destination is rebuilt from source on every run.
 */

import fs from "node:fs";
import path from "node:path";
import { BWP, PUBLIC } from "./sources.mjs";

const SRC = path.join(BWP, "UID/Shortlisted for Claude/Chess website");
const DEST = path.join(PUBLIC, "chess");

/** The only rewrite: protocol-upgrade the http assets so HTTPS can load them. */
const UPGRADES = [
  ["http://fonts.googleapis.com", "https://fonts.googleapis.com"],
  ["http://www.chessstrategyonline.com", "https://www.chessstrategyonline.com"],
];

const TEXT = new Set([".html", ".css", ".js"]);

let files = 0, rewritten = 0, bytes = 0;

function walk(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, entry.name);
    const dst = path.join(to, entry.name);
    if (entry.isDirectory()) { walk(src, dst); continue; }

    if (TEXT.has(path.extname(entry.name).toLowerCase())) {
      let text = fs.readFileSync(src, "utf8");
      const before = text;
      for (const [from_, to_] of UPGRADES) text = text.split(from_).join(to_);
      if (text !== before) rewritten++;
      fs.writeFileSync(dst, text);
    } else {
      fs.copyFileSync(src, dst);
    }
    files++;
    bytes += fs.statSync(dst).size;
  }
}

if (!fs.existsSync(SRC)) {
  console.error(`Source missing: ${SRC}`);
  process.exit(1);
}
fs.rmSync(DEST, { recursive: true, force: true });
walk(SRC, DEST);

console.log(
  `chess site → public/chess/  ${files} files, ${(bytes / 1048576).toFixed(2)} MB` +
    `\n${rewritten} file(s) protocol-upgraded to https.`,
);
