/**
 * prepare-tata-theme — the IIS Ahmedabad logo sting, for band 01.
 *
 * The owner asked on 2026-09-26 for the Ahmedabad column to play the campus's
 * own theme film before showing its building, hold five seconds, and repeat.
 * This makes the web copy of that film.
 *
 * ⚠ THE SOURCE IS ALREADY IN `_source`, and is byte-identical to the file the
 * owner pointed at (`D:/IIS logos/IISA Theme/Color.mp4`, md5 7cf15ce5…). It was
 * copied in with the rest of the Tata archive, so nothing new had to be staged
 * and there is no second master to keep in step. See sources.mjs.
 *
 * What the encode does, and why:
 *  · 1280 wide — the panel renders at ~580px, so this covers a 2× display and
 *    nothing more. The source is 1920×1080 at 11 Mb/s, which is a broadcast
 *    master, not a web asset.
 *  · NO AUDIO. The source carries an AAC track; a five-second sting that loops
 *    forever must never make a sound, and a muted track is also what lets a
 *    browser autoplay it at all.
 *  · `faststart`, so the moov atom is at the front and the first frame can be
 *    shown before the whole file has arrived.
 *
 * Output: public/content/clients/tata-iis/campus/iisa-theme.mp4
 * Safe to re-run. Needs ffmpeg on PATH.
 */

import { execFileSync } from "node:child_process";
import path from "node:path";
import fs from "node:fs";
import { ASSETS, ROOT } from "./sources.mjs";

const SRC = path.join(ASSETS, "Clients/Tata IIS/Digital/Videos/Color.mp4");
const OUT = path.join(ROOT, "public/content/clients/tata-iis/campus/iisa-theme.mp4");

if (!fs.existsSync(SRC)) {
  console.error(`missing source: ${SRC}`);
  process.exit(1);
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });

execFileSync(
  "ffmpeg",
  [
    "-v", "error",
    "-y",
    "-i", SRC,
    "-an",
    "-vf", "scale=1280:-2",
    "-c:v", "libx264",
    "-profile:v", "high",
    "-crf", "26",
    "-preset", "slow",
    "-pix_fmt", "yuv420p",
    "-movflags", "+faststart",
    OUT,
  ],
  { stdio: "inherit" },
);

const before = fs.statSync(SRC).size;
const after = fs.statSync(OUT).size;
console.log(
  `iisa-theme.mp4  ${(before / 1024 / 1024).toFixed(1)} MB → ${(after / 1024).toFixed(0)} KB`,
);
