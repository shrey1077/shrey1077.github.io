/**
 * make-extincts-characters — the Extincts Project's character art, for the
 * slide's "Characters" pop-up (owner, 2026-10-15: "For Characters, a pop up
 * on click, and take all character images from the same folder from where i
 * uploaded the snow leopard image. use whole images not cutout").
 *
 * The originals are 2–4 MB PNGs in D:\Projects\Extincts Project; each gets a
 * webp copy up to 1600 px on its long side in
 * public/content/extincts/characters/, and a small one (the pop-up's row of
 * picks) in its _thumbs/, and one list, characters.json, with each one's
 * name and size, in the order the pop-up shows them.
 *
 *   node scripts/make-extincts-characters.mjs
 */

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const FROM = "D:/Projects/Extincts Project";
const OUT = path.resolve("public/content/extincts/characters");
const SHEETS = [
  ["5545dd83-163f-4dd5-8e8f-21dfba0f60fa.png", "himchhaya", "Himchhaya"],
  ["f74b7af2-c043-4130-935e-b7f859a102c4.png", "shaitra", "Shaitra"],
  ["c873c423-5129-4831-8243-a60a1ee655c0.png", "living-shield", "The Living Shield"],
  ["f9c89b17-1425-414d-ac6b-8dee9b3b4359.png", "southwind", "Southwind"],
  ["b4053134-e42f-48f1-abe5-b17c5b62fc5e.png", "nomad", "NoMad"],
  ["NoMad_EXMANGA_Seven_Frames/01_NoMad_Main_Character.png", "nomad-01", "NoMad — Main Character"],
  ["NoMad_EXMANGA_Seven_Frames/02_Age_95_Anatomy_Gear.png", "nomad-02", "NoMad — Age 95, Anatomy & Gear"],
  ["NoMad_EXMANGA_Seven_Frames/03_Norway_Semi_Cyborg_Cat.png", "nomad-03", "NoMad — Norway Semi-Cyborg Cat"],
  ["NoMad_EXMANGA_Seven_Frames/04_Snow_Leopard_Family.png", "nomad-04", "NoMad — Snow Leopard Family"],
  ["NoMad_EXMANGA_Seven_Frames/05_Species_Specific_Cybernetics.png", "nomad-05", "NoMad — Species-Specific Cybernetics"],
  ["NoMad_EXMANGA_Seven_Frames/06_Seven_Year_Pandemic.png", "nomad-06", "NoMad — Seven-Year Pandemic"],
  ["NoMad_EXMANGA_Seven_Frames/07_Supersized_Piloted_Robot.png", "nomad-07", "NoMad — Supersized Piloted Robot"],
];

fs.mkdirSync(path.join(OUT, "_thumbs"), { recursive: true });
const list = [];
let kb = 0;
for (const [file, slug, name] of SHEETS) {
  const info = await sharp(path.join(FROM, file))
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(path.join(OUT, `${slug}.webp`));
  const thumb = await sharp(path.join(FROM, file))
    .resize({ width: 240, height: 240, fit: "inside" })
    .webp({ quality: 70 })
    .toFile(path.join(OUT, "_thumbs", `${slug}.webp`));
  kb += (info.size + thumb.size) / 1024;
  list.push({ name, src: `/content/extincts/characters/${slug}.webp`, thumb: `/content/extincts/characters/_thumbs/${slug}.webp`, w: info.width, h: info.height });
}
fs.writeFileSync(path.join(OUT, "characters.json"), JSON.stringify(list, null, 1));
console.log(list.length, "characters,", Math.round(kb), "KB in all");
