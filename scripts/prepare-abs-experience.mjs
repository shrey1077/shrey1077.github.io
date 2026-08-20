/**
 * prepare-abs-experience.mjs — assets for the bespoke ABS Wholesale page.
 *
 * ABS Wholesale distributes vape, smoke-shop and convenience product across
 * California and five other states. The work is a long run of retail and social
 * creative: some for brands the owner BUILT for them (Luzid, Kartpipe, Himax
 * Distro), most for brands they carry and promote (Tyson 2.0, Deathrow Vapes,
 * Puffco, Stiiizy, and a long tail of others).
 *
 * Source: D:/Brain Website portfolio/vapes/ABS branding — a FLAT folder of 56
 * files whose names are the Instagram captions they shipped with. There is no
 * folder structure to inherit, so the brand of each piece is recovered from the
 * caption, and every assignment below was checked against the ARTWORK, not just
 * the filename. That mattered more than once:
 *
 *   · "CLASSIC MEETS MODERN…" names no brand at all; the artwork is a Kartpipe.
 *   · "Kartpipe that performance…" and "Meet a kartpipe…" carry LUZID's logo,
 *     because Kartpipe ships under Luzid — but they are Kartpipe pieces, so
 *     kartpipe is matched BEFORE luzid and order is load-bearing here.
 *   · "CxvwN9MPOSD.jpg" / "CxvwQrQPhJZ.jpg" are CDN hashes. They are Diamond
 *     Shruumz packs; nothing but looking would have told you.
 *   · Several Orion Bar and Tyson pieces are presented under Himax Distro's
 *     identity. The Tyson ones go to Tyson 2.0 (the owner names it as a brand
 *     they worked with); the Orion Bar ones stay with Himax, whose identity is
 *     the thing being carried.
 *
 * ⚠ MISC IS A RULE, NOT A DUMPING GROUND. The owner's instruction: a brand with
 * a single artwork goes to Misc rather than getting a category of one. Nine do.
 * That is enforced here by ASSERTION at the end — if a named category ever
 * drops to one piece, this script fails rather than quietly shipping a lonely
 * category.
 *
 * ⚠ One exact duplicate ships in the source (the two Polk A Dot gummies files
 * are byte-identical). Deduplicated by hash, not by name — the names differ.
 *
 * Output: public/content/clients/abs/work/<category>/… + _plates.json
 * Idempotent. Node >= 18, sharp.
 */

import sharp from "sharp";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const SRC = "D:/Brain Website portfolio/vapes/ABS branding";
const DEST = "D:/Brain Folio/public/content/clients/abs";

const ensure = (p) => fs.mkdirSync(p, { recursive: true });

/** Raster -> web webp; returns intrinsic size for the manifest. */
async function webp(src, out, width = 1500, q = 82) {
  ensure(path.dirname(out));
  const info = await sharp(src, { limitInputPixels: false })
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: q })
    .toFile(out);
  return { w: info.width, h: info.height };
}

/**
 * Brands, IN PRIORITY ORDER — the first match wins, and that is deliberate.
 * `kartpipe` must precede `luzid`, and the house pieces must precede
 * everything, or ABS's own Thanksgiving flyer would be claimed by a product.
 */
const BRANDS = [
  {
    id: "abs-house",
    name: "ABS Wholesale",
    match: [/^ABS\.png$/i, /^Asset 7@3x/i, /^Booth Layout/i, /^Feasting on gratitude/i, /^Thanksgiving Flyer/i, /^We Are Hiring/i],
  },
  // Before luzid: Kartpipe ships under Luzid and carries its logo.
  { id: "kartpipe", name: "Kartpipe", match: [/kartpipe/i, /^CLASSIC MEETS MODERN/i] },
  { id: "luzid", name: "Luzid", match: [/luzid/i, /sikret/i] },
  { id: "himax", name: "Himax Distro", match: [/himax distro/i, /^Black Friday/i, /^New orion bar/i] },
  { id: "tyson", name: "Tyson 2.0", match: [/tyson/i] },
  { id: "deathrow", name: "Deathrow Vapes", match: [/deathrow/i, /^Snoop dog presents/i] },
  { id: "puffco", name: "Puffco", match: [/puffco/i, /cupsy/i] },
  { id: "stiiizy", name: "Stiiizy", match: [/stiiizy/i] },
  { id: "polk-a-dot", name: "Polk A Dot", match: [/polk a dot/i, /^New chocolates bars/i] },
  { id: "jungo", name: "Jungo Leaf", match: [/^Leaf Loose Tobacco/i] },
  { id: "shruumz", name: "Diamond Shruumz", match: [/^Cxvw/] },
];

const MISC = { id: "misc", name: "Misc", match: [] };

/**
 * Files in the source that are NOT gallery plates.
 *
 * ⚠ `luzid-white-logo-300x121.webp` is measured at 100% near-white ink on
 * transparency, and CaseGallery mounts every plate on `bg-white` — it would
 * render as an empty bordered box. It is also 300x121, a brand asset rather
 * than a campaign piece. Excluded rather than shipped invisible.
 */
const NOT_PLATES = [/^luzid-white-logo/i];

function classify(name) {
  for (const b of BRANDS) if (b.match.some((re) => re.test(name))) return b.id;
  return MISC.id;
}

/* ── Gather, dedupe, classify ─────────────────────────────────────────── */

const files = fs
  .readdirSync(SRC, { withFileTypes: true })
  .filter((e) => e.isFile())
  .map((e) => e.name)
  .sort();

const seen = new Map();
const dupes = [];
const skipped = [];
const buckets = new Map([...BRANDS, MISC].map((b) => [b.id, []]));

for (const name of files) {
  if (NOT_PLATES.some((re) => re.test(name))) {
    skipped.push(name);
    continue;
  }
  const hash = crypto.createHash("md5").update(fs.readFileSync(path.join(SRC, name))).digest("hex");
  if (seen.has(hash)) {
    dupes.push(`${name}  ==  ${seen.get(hash)}`);
    continue;
  }
  seen.set(hash, name);
  buckets.get(classify(name)).push(name);
}

/* ── Write ────────────────────────────────────────────────────────────── */

let wrote = 0;
const failures = [];
const summary = [];

for (const b of [...BRANDS, MISC]) {
  const list = buckets.get(b.id);
  if (list.length === 0) continue;
  const dir = path.join(DEST, "work", b.id);
  // Rebuild from source so a re-classification never leaves orphans behind.
  fs.rmSync(dir, { recursive: true, force: true });
  ensure(dir);

  const manifest = [];
  let n = 0;
  for (const name of list) {
    const out = path.join(dir, `${String(++n).padStart(2, "0")}.webp`);
    try {
      const { w, h } = await webp(path.join(SRC, name), out);
      manifest.push({ src: path.basename(out), w, h, name: b.name });
      wrote++;
    } catch (e) {
      failures.push(`${b.id}/${name} — ${e.message}`);
      n--;
    }
  }
  fs.writeFileSync(path.join(dir, "_plates.json"), JSON.stringify(manifest, null, 2));
  summary.push({ id: b.id, name: b.name, n: manifest.length });
}

/* ── Report, and hold the Misc rule ───────────────────────────────────── */

console.log(`${files.length} source files, ${dupes.length} exact duplicate(s) dropped, ${skipped.length} not a plate`);
for (const d of dupes) console.log(`  dupe: ${d}`);
for (const s of skipped) console.log(`  skip: ${s}`);
console.log();
for (const s of summary) console.log(`  ${String(s.n).padStart(3)}  ${s.name}`);
console.log(`\n${wrote} plates written to ${DEST}/work`);

const lonely = summary.filter((s) => s.id !== "misc" && s.n < 2);
if (lonely.length) {
  console.error(
    `\n⚠ RULE BROKEN — a named category has fewer than 2 pieces, which the ` +
      `owner asked to go to Misc instead:\n` +
      lonely.map((s) => `    ${s.name} (${s.n})`).join("\n"),
  );
  process.exitCode = 1;
}
if (failures.length) {
  console.error(`\n${failures.length} failure(s):`);
  for (const f of failures) console.error("  " + f);
  process.exitCode = 1;
}
