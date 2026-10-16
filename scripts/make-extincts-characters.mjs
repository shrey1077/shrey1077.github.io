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
/** Every artwork, species by species — the owner's complete collection
 *  (2026-10-17: "adding all generations in a zip, extract them in folder you
 *  picked others from"; the archive's folders, under FROM). [file, slug,
 *  name, species, lead]: the LEAD is the species' sheet the slide shows (its
 *  latest, or revised, design). Slugs that already existed are kept, so the
 *  same picture keeps its address. */
const SHEETS = [
  ["01_Snow_Leopard/08_Revised_Anatomy_Character_Sheet.png", "himchhaya", "Himchhaya", "Snow Leopard", true],
  ["01_Snow_Leopard/01_Shaitra_The_White_Reckoning.png", "shaitra", "Shaitra — The White Reckoning", "Snow Leopard"],
  ["01_Snow_Leopard/02_Kaaldra.png", "kaaldra", "Kaaldra", "Snow Leopard"],
  ["01_Snow_Leopard/03_Veyrak_Assassin.png", "veyrak", "Veyrak — Assassin", "Snow Leopard"],
  ["01_Snow_Leopard/04_Winter_Warlord.png", "winter-warlord", "Winter Warlord", "Snow Leopard"],
  ["01_Snow_Leopard/05_Kaalshard.png", "kaalshard", "Kaalshard", "Snow Leopard"],
  ["01_Snow_Leopard/06_Shailraj_The_White_Throne.png", "shailraj", "Shailraj — The White Throne", "Snow Leopard"],
  ["01_Snow_Leopard/07_Shikhar_Apex_Predator.png", "shikhar", "Shikhar — Apex Predator", "Snow Leopard"],
  ["02_Southwind_Tasmanian_Tiger/03_AWP_Rifle_Revolver_Antenna.png", "southwind", "Southwind", "Tasmanian Tiger", true],
  ["02_Southwind_Tasmanian_Tiger/01_Original_Concept.png", "southwind-01", "Southwind — Original Concept", "Tasmanian Tiger"],
  ["02_Southwind_Tasmanian_Tiger/02_Revised_Pilot_Goggles_and_Tail.png", "southwind-02", "Southwind — Pilot Goggles & Tail", "Tasmanian Tiger"],
  ["03_Ghosthorn_and_Whisper/03_Pigeon_In_Flight_Full_Wingspan.png", "ghosthorn", "Ghosthorn & Whisper", "Rhino & Pigeon", true],
  ["03_Ghosthorn_and_Whisper/01_Original_Stealth_Rhino.png", "ghosthorn-01", "Ghosthorn & Whisper — Stealth Rhino", "Rhino & Pigeon"],
  ["03_Ghosthorn_and_Whisper/02_Heavy_Rhino_Fully_Metallic_Pigeon.png", "ghosthorn-02", "Ghosthorn & Whisper — Heavy Rhino, Metal Pigeon", "Rhino & Pigeon"],
  ["04_Dodohuf_Dodo/02_Character_Sheet.png", "dodohuf", "Dodohuf", "Dodo", true],
  ["04_Dodohuf_Dodo/01_Original_Design.png", "dodohuf-01", "Dodohuf — Original Design", "Dodo"],
  ["05_The_Living_Shield/01_The_Living_Shield.png", "living-shield", "The Living Shield", "Pangolin", true],
  ["06_NoMad_The_Last_Human/01_Original_Character_Sheet.png", "nomad-sheet", "NoMad — The Last Human", "Human", true],
  ["06_NoMad_The_Last_Human/02_Seven_Frame_Overview_A.png", "nomad", "NoMad — Seven Frames, A", "Human"],
  ["06_NoMad_The_Last_Human/03_Seven_Frame_Overview_B.png", "nomad-b", "NoMad — Seven Frames, B", "Human"],
  ["06_NoMad_The_Last_Human/04_Seven_Frame_Overview_C.png", "nomad-c", "NoMad — Seven Frames, C", "Human"],
  ["06_NoMad_The_Last_Human/05_Seven_Separated_Frames/01_NoMad_Main_Character.png", "nomad-01", "NoMad — Main Character", "Human"],
  ["06_NoMad_The_Last_Human/05_Seven_Separated_Frames/02_Age_95_Anatomy_Gear.png", "nomad-02", "NoMad — Age 95, Anatomy & Gear", "Human"],
  ["06_NoMad_The_Last_Human/05_Seven_Separated_Frames/03_Norway_Semi_Cyborg_Cat.png", "nomad-03", "NoMad — Norway Semi-Cyborg Cat", "Human"],
  ["06_NoMad_The_Last_Human/05_Seven_Separated_Frames/04_Snow_Leopard_Family.png", "nomad-04", "NoMad — Snow Leopard Family", "Human"],
  ["06_NoMad_The_Last_Human/05_Seven_Separated_Frames/05_Species_Specific_Cybernetics.png", "nomad-05", "NoMad — Species-Specific Cybernetics", "Human"],
  ["06_NoMad_The_Last_Human/05_Seven_Separated_Frames/06_Seven_Year_Pandemic.png", "nomad-06", "NoMad — Seven-Year Pandemic", "Human"],
  ["06_NoMad_The_Last_Human/05_Seven_Separated_Frames/07_Supersized_Piloted_Robot.png", "nomad-07", "NoMad — Supersized Piloted Robot", "Human"],
];

fs.mkdirSync(path.join(OUT, "_thumbs"), { recursive: true });
const list = [];
let kb = 0;
for (const [file, slug, name, species, lead] of SHEETS) {
  const info = await sharp(path.join(FROM, file))
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(path.join(OUT, `${slug}.webp`));
  const thumb = await sharp(path.join(FROM, file))
    .resize({ width: 240, height: 240, fit: "inside" })
    .webp({ quality: 70 })
    .toFile(path.join(OUT, "_thumbs", `${slug}.webp`));
  kb += (info.size + thumb.size) / 1024;
  list.push({ name, species, ...(lead ? { lead: true } : {}), src: `/content/extincts/characters/${slug}.webp`, thumb: `/content/extincts/characters/_thumbs/${slug}.webp`, w: info.width, h: info.height });
}
fs.writeFileSync(path.join(OUT, "characters.json"), JSON.stringify(list, null, 1));
console.log(list.length, "characters,", Math.round(kb), "KB in all");
