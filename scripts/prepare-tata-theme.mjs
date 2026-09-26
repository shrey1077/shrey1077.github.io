/**
 * prepare-tata-theme — the two campus logo stings, for band 01.
 *
 * The owner asked on 2026-09-26 for each campus column to play its own theme
 * film before showing its building, hold five seconds, and repeat. This makes
 * the web copies.
 *
 * ⚠ BOTH SOURCES ARE ALREADY IN `_source`, byte-identical to the files on the
 * owner's drive — Ahmedabad's is the one he pointed at
 * (`D:/IIS logos/IISA Theme/Color.mp4`, md5 7cf15ce5…), Mumbai's turned up
 * under `All Logos/Color_1.mp4` (md5 b0a38631…) when he said there was one,
 * filed by number rather than by campus. Both were copied in with the rest of
 * the Tata archive, so nothing had to be staged and there is no second master
 * to keep in step. See sources.mjs.
 *
 * ⚠ THE TWO ARE A PAIR, and neither name says so: same 4.83s, same 1920×1080,
 * same structure, one on Ahmedabad's orange and one on Mumbai's teal, each
 * ending on its own campus URL. If either is ever replaced, replace both.
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

const FILMS = [
  {
    src: path.join(ASSETS, "Clients/Tata IIS/Digital/Videos/Color.mp4"),
    out: "iisa-theme.mp4",
  },
  {
    src: path.join(ASSETS, "Clients/Tata IIS/Logos and Guidelines/Tata Logos (2)/Color_1.mp4"),
    out: "iism-theme.mp4",
  },
];

const DIR = path.join(ROOT, "public/content/clients/tata-iis/campus");
fs.mkdirSync(DIR, { recursive: true });

for (const film of FILMS) {
  if (!fs.existsSync(film.src)) {
    console.error(`missing source: ${film.src}`);
    process.exit(1);
  }
  const out = path.join(DIR, film.out);
  execFileSync(
    "ffmpeg",
    [
      "-v", "error",
      "-y",
      "-i", film.src,
      "-an",
      "-vf", "scale=1280:-2",
      "-c:v", "libx264",
      "-profile:v", "high",
      "-crf", "26",
      "-preset", "slow",
      "-pix_fmt", "yuv420p",
      "-movflags", "+faststart",
      out,
    ],
    { stdio: "inherit" },
  );
  const before = fs.statSync(film.src).size;
  const after = fs.statSync(out).size;
  console.log(
    `${film.out.padEnd(16)} ${(before / 1024 / 1024).toFixed(1)} MB → ${(after / 1024).toFixed(0)} KB`,
  );
}
