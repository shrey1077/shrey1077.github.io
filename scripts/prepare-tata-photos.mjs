/**
 * prepare-tata-photos.mjs — the photographs behind two Tata IIS bands
 * (owner, 2026-10-04):
 *
 *   06 Mockups to reality — the work installed on campus, photographed: lab
 *      standees, lab boards, posters, the quotation frames. Shot RAW; the
 *      full-size JPEG every Nikon NEF carries is used, turned by the file's
 *      own orientation tag.
 *   07 Photo / Videography, Editing — the camera work itself, grouped by the
 *      THREE aspects of the job (owner, 2026-10-11: "Industry Visits,
 *      Students/professionals Testimonials, and Events and Campus
 *      photography"). Until then it was five — events, interviews, visits,
 *      campus life, and birds, which were the owner's own and not the job.
 *
 *   _source/Assets/Clients/Tata IIS/Mockups to finished product/mock to real/New folder/*.NEF
 *   _source/Assets/Clients/Tata IIS/Photography/*.jpg        (a chosen 28 of 35)
 *     (gitignored; copied 2026-10-04 from D:/Assets_107, and DSC_8867, 8884,
 *     8927 and 8952 on 2026-10-11)
 *   → public/content/clients/tata-iis/reality/<slug>.webp
 *   → public/content/clients/tata-iis/photo-story/<aspect>-<n>.webp
 *   → src/constants/tataPhotos.ts                             (generated)
 *
 * ⚠ THE ASPECT A PHOTOGRAPH IS FILED UNDER IS A JUDGEMENT made from the
 * picture (a backdrop of Tata IIS marks reads as a testimonial shoot, a bus of
 * trainees as an outing), not something the files record. Move a file
 * between aspects here if it is wrong; the band follows.
 *
 *   node scripts/prepare-tata-photos.mjs
 */

import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { ASSETS, CONTENT, ROOT } from "./sources.mjs";

const TATA = path.join(ASSETS, "Clients/Tata IIS");
const REALITY_SRC = path.join(TATA, "Mockups to finished product/mock to real/New folder");
const PHOTO_SRC = path.join(TATA, "Photography");
const OUT = path.join(CONTENT, "clients/tata-iis");
const TS = path.join(ROOT, "src/constants/tataPhotos.ts");
const URL = "/content/clients/tata-iis";

const LONG_EDGE = 1600;
const QUALITY = 80;

/** 06 — each installed photograph, and the design it is.
 *  `design` is a catalogue path under tata-iis/catalogue; `designFile` an
 *  archive file (under ASSETS) for a design the catalogue does not carry.
 *  ⚠ A PAIR ONLY WHERE IT IS THE SAME PIECE. The archive's CNC Machining,
 *  Welding and EV Lab standees are the purple-and-teal versions; the ones
 *  installed and photographed are orange. Setting one beside the other would
 *  claim the photograph shows that design, so those three are shown as
 *  installed, with no design beside them. The CNC Simulation standee that
 *  WAS installed is "CNC SIm LS-04", not the catalogue's cnc-simulation-lab. */
const REALITY = [
  { file: "DSC_2608.NEF", slug: "cnc-simulation-lab", caption: "CNC Control Simulation Lab", kind: "Lab standee", designFile: "Clients/Tata IIS/Print/Standee/CNC SIm LS-04.png" },
  { file: "DSC_2655.NEF", slug: "ev-industry", caption: "EV Industry: in-demand jobs", kind: "Campus poster", design: "Campus Posters/iisa-campus-artworks-august-2025-v5-08.webp" },
  { file: "DSC_2659.NEF", slug: "boundaries", caption: "Boundaries matter for all", kind: "POSH poster", design: "Campus Posters/posh-act-v.webp" },
  { file: "DSC_2689.NEF", slug: "jrd-tata", caption: "J.R.D. Tata", kind: "Quotation frame", design: "Boards/jrd-tata-quote.webp" },
  { file: "DSC_2692.NEF", slug: "jamsetji-tata", caption: "Jamsetji Tata", kind: "Quotation frame", design: "Boards/jamsetji.webp" },
  { file: "DSC_2616.NEF", slug: "cnc-machining-lab", caption: "CNC Machining Lab", kind: "Lab standee" },
  { file: "DSC_2630.NEF", slug: "welding-lab", caption: "Welding Lab", kind: "Lab standee" },
  { file: "DSC_2652.NEF", slug: "ev-lab", caption: "Electric Vehicle Lab", kind: "Lab standee" },
  { file: "DSC_2614.NEF", slug: "lab-boards-i", caption: "Lab boards", kind: "Installed" },
  { file: "DSC_2632.NEF", slug: "lab-boards-ii", caption: "Lab boards", kind: "Installed" },
  { file: "DSC_2640.NEF", slug: "lab-boards-iii", caption: "Lab boards", kind: "Installed" },
  { file: "DSC_2644.NEF", slug: "lab-boards-iv", caption: "Lab boards", kind: "Installed" },
];

/** 07 — the photographs, by the job's three aspects (owner, 2026-10-11). The
 *  first of each leads the band's mosaic, large; the first five are shown. */
const ASPECTS = {
  // The bus out, the shop floors — and (DSC_8867, DSC_8884, added
  // 2026-10-11) groups out of uniform being taken through the labs.
  visits: ["DSC_9276.jpg", "DSC_3299.jpg", "4O5A0755.JPG", "DSC_8867.jpg", "DSC_8884.jpg"],
  // ⚠ The owner's own portrait leads, in the big box (owner, 2026-10-05: the
  // other three portraits — DSC_0603, DSC_0629, DSC_0632 — taken out). Then
  // a trainee on camera, and a professional on the lit set (DSC_5531, filed
  // under events until 2026-10-11 — the light stands beside him).
  testimonials: ["DSC_0613.jpg", "DSC_3466.jpg", "DSC_5531.jpg"],
  // Events and the campus as one: the leadership dialogue leads, then the
  // two alternate. DSC_8927 and DSC_8952 (the IIS Mumbai building) added
  // 2026-10-11.
  "events-campus": [
    "DSC_7145.JPG", "DSC_9189.jpg", "cvxvzv.jpg", "DSC_7299.jpg", "DSC_5486.jpg",
    "DSC_8952.jpg", "DSC_3474.jpg", "4O5A0849.JPG", "DSC_6924.jpg", "DSC_8939.jpg",
    "DSC_9219.jpg", "DSC_8927.jpg", "DSC_3634.jpg", "DSC_9500.jpg", "4O5A0817.JPG",
    "DSC_9296.jpg",
  ],
};

/** The full-size JPEG inside a Nikon NEF, found through the file's own index
 *  (IFD0 and its SubIFDs: JPEGInterchangeFormat / …Length), and the rotation
 *  its orientation tag asks for. Scanning for JPEG markers does not work —
 *  the raw data is full of false ones. */
function nefPreview(buf) {
  const le = buf[0] === 0x49;
  const u16 = (o) => (le ? buf.readUInt16LE(o) : buf.readUInt16BE(o));
  const u32 = (o) => (le ? buf.readUInt32LE(o) : buf.readUInt32BE(o));
  const found = [];
  let orientation = 1;
  const readIfd = (off, depth) => {
    if (depth > 3 || off <= 0 || off >= buf.length) return;
    const n = u16(off);
    let jo = 0;
    let jl = 0;
    for (let i = 0; i < n; i++) {
      const e = off + 2 + i * 12;
      const tag = u16(e);
      const count = u32(e + 4);
      if (tag === 0x0112 && depth === 0) orientation = u16(e + 8);
      if (tag === 0x0201) jo = u32(e + 8);
      if (tag === 0x0202) jl = u32(e + 8);
      if (tag === 0x014a) {
        const offs = count === 1 ? [u32(e + 8)] : Array.from({ length: count }, (_, k) => u32(u32(e + 8) + k * 4));
        for (const o of offs) readIfd(o, depth + 1);
      }
    }
    if (jo && jl) found.push({ jo, jl });
  };
  readIfd(u32(4), 0);
  found.sort((a, b) => b.jl - a.jl);
  const rotate = { 1: 0, 3: 180, 6: 90, 8: 270 }[orientation] ?? 0;
  return { jpeg: buf.subarray(found[0].jo, found[0].jo + found[0].jl), rotate };
}

async function write(srcFile, outFile) {
  let pipeline;
  if (/\.nef$/i.test(srcFile)) {
    const { jpeg, rotate } = nefPreview(fs.readFileSync(srcFile));
    pipeline = sharp(jpeg).rotate(rotate);
  } else {
    pipeline = sharp(srcFile).rotate(); // EXIF orientation
  }
  const info = await pipeline
    .resize({ width: LONG_EDGE, height: LONG_EDGE, fit: "inside", withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(outFile);
  return { w: info.width, h: info.height, kb: Math.round(info.size / 1024) };
}

const realityDir = path.join(OUT, "reality");
const storyDir = path.join(OUT, "photo-story");
for (const d of [realityDir, storyDir]) {
  fs.rmSync(d, { recursive: true, force: true });
  fs.mkdirSync(d, { recursive: true });
}

const reality = [];
for (const r of REALITY) {
  const size = await write(path.join(REALITY_SRC, r.file), path.join(realityDir, `${r.slug}.webp`));
  let design;
  if (r.designFile) {
    const out = path.join(realityDir, `${r.slug}-design.webp`);
    const info = await sharp(path.join(ASSETS, r.designFile))
      .resize({ width: LONG_EDGE, height: LONG_EDGE, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(out);
    design = { src: `${URL}/reality/${r.slug}-design.webp`, w: info.width, h: info.height };
  } else if (r.design) {
    const file = path.join(OUT, "catalogue", r.design);
    if (!fs.existsSync(file)) throw new Error(`design missing: ${r.design}`);
    const m = await sharp(file).metadata();
    design = { src: `${URL}/catalogue/${r.design}`, w: m.width, h: m.height };
  }
  reality.push({ slug: r.slug, caption: r.caption, kind: r.kind, photo: { src: `${URL}/reality/${r.slug}.webp`, w: size.w, h: size.h }, design });
  console.log("reality", r.slug, size.w, size.h, size.kb + "KB");
}

const story = {};
for (const [aspect, files] of Object.entries(ASPECTS)) {
  story[aspect] = [];
  for (const [i, f] of files.entries()) {
    const src = path.join(PHOTO_SRC, f);
    const name = `${aspect}-${String(i + 1).padStart(2, "0")}.webp`;
    const size = await write(src, path.join(storyDir, name));
    story[aspect].push({ src: `${URL}/photo-story/${name}`, w: size.w, h: size.h });
    console.log("story", name, size.w, size.h, size.kb + "KB");
  }
}

const ts = `/**
 * GENERATED by scripts/prepare-tata-photos.mjs — do not edit by hand.
 *
 * TATA_REALITY: band 06's installed work — each photograph, and the design it
 * is where the catalogue holds one. TATA_PHOTO_STORY: band 07's photographs,
 * by aspect.
 */

export interface TataImage {
  src: string;
  w: number;
  h: number;
}

export interface TataRealityPiece {
  slug: string;
  caption: string;
  kind: string;
  photo: TataImage;
  design?: TataImage;
}

export const TATA_REALITY: TataRealityPiece[] = ${JSON.stringify(reality, null, 2)};

export const TATA_PHOTO_STORY: Record<string, TataImage[]> = ${JSON.stringify(story, null, 2)};
`;
fs.writeFileSync(TS, ts);
console.log("wrote", path.relative(ROOT, TS));
