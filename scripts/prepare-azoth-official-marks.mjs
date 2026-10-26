// The official Mushroomworks and Mycoveda marks (owner, 2026-10-26: "this is
// the official logo for mushroomworks. Find it, here or online, best
// quality", and "this is official logo for mycoveda").
//
//   · MUSHROOMWORKS — the gear: "MUSHROOM WORKS" round a mushroom, in a
//     cog. No logo file of it exists on this machine; it stands clearest,
//     black on white at ~310 px, at the top of the owner's own "Mycelium
//     packaging" post (D:/Assets_107/Clients/Azoth+). Lifted from there:
//     its ink by darkness, three times the size, the edge kept crisp.
//   · MYCOVEDA — the arched mark over the wordmark, black on transparency,
//     700 × 605, from D:/Shrey/last website attempt/portfolio/assets/logos
//     (the file the owner pointed to, pixel for pixel).
// Each in black, and in white for the dark grounds (the Azoth hero).
//
//   node scripts/prepare-azoth-official-marks.mjs
//
// → public/content/clients/azoth-biotech/brand/brands/{,white/}
//   mushroomworks-gear.png, mycoveda-lockup.png. The older files are kept.

import path from "node:path";
import sharp from "sharp";

const OUT = "public/content/clients/azoth-biotech/brand/brands";
const ramp = (v, a, b) => Math.max(0, Math.min(1, (v - a) / (b - a)));

/** A mark's ink, 0…1 per pixel, in black and in white, trimmed. */
async function write(name, w, h, alphaAt) {
  for (const [dir, ink] of [
    ["", 0],
    ["white", 255],
  ]) {
    const out = Buffer.alloc(w * h * 4);
    for (let i = 0; i < w * h; i++) {
      out[i * 4] = out[i * 4 + 1] = out[i * 4 + 2] = ink;
      out[i * 4 + 3] = Math.round(255 * alphaAt(i));
    }
    const file = path.join(OUT, dir, `${name}.png`);
    await sharp(out, { raw: { width: w, height: h, channels: 4 } })
      .trim({ threshold: 4 })
      .png({ compressionLevel: 9 })
      .toFile(file);
    const m = await sharp(file).metadata();
    console.log(file, `${m.width}x${m.height}`);
  }
}

// Mushroomworks: the gear's square in the post, three times over; its ink
// is how dark a pixel is, and the edge is sharpened back to a line.
{
  const SCALE = 3;
  const { data, info } = await sharp("D:/Assets_107/Clients/Azoth+/Mycelium packaging.png")
    .extract({ left: 92, top: 52, width: 330, height: 330 })
    .resize({ width: 330 * SCALE, height: 330 * SCALE, kernel: "lanczos3" })
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });
  await write("mushroomworks-gear", info.width, info.height, (i) => {
    const a = 1 - ramp(data[i], 70, 185);
    return a * a * (3 - 2 * a);
  });
}

// Mycoveda: the owner's file as it is — its own alpha, in one ink.
{
  const { data, info } = await sharp("D:/Shrey/last website attempt/portfolio/assets/logos/mycoveda.png")
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  await write("mycoveda-lockup", info.width, info.height, (i) => {
    const k = i * 4;
    const dark = 1 - ramp((data[k] + data[k + 1] + data[k + 2]) / 3, 60, 200);
    return (data[k + 3] / 255) * dark;
  });
}
