/**
 * prepare-other-clients.mjs — asset pipeline for Azoth Biotech, Newsmobile,
 * Zabraku Media, and UID.
 *
 * Source: D:\Brain Website portfolio\{Azoth,Newsmobile,Zabraku Media,UID}.
 * These are the user's OWN raw project folders (not a single-client archive
 * like Tata IIS) — each folder is a grab-bag mixing several small brands,
 * personal work, and (occasionally) other people's coursework. Every asset
 * below was visually screened before being added to this manifest; see the
 * session notes for exclusions and why (unrelated brands mixed into the same
 * folder — Mushroomworks/MycoActives/Puran/wedding photos in Azoth/; a
 * different design studio's watermark and other people's Emmys/DC_ scans in
 * Newsmobile/; "bet right365" and "First Divine" in Zabraku Media/; the
 * `the trip` bird-photography dump and `Sketches/sketching old` DeviantArt
 * reference images in UID/). Nothing excluded for those reasons ships here.
 *
 * `Shrey Dagar` / `Shrey Singh Dagar` on some UID pieces (Nirvaan, Puran
 * Studios) is the user's own full name (see memory) — not third-party work.
 *
 *   node scripts/prepare-other-clients.mjs            # everything
 *   node scripts/prepare-other-clients.mjs --no-video # images + metas only
 */

import sharp from "sharp";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const SRC = "D:/Brain Website portfolio";
const DEST_ROOT = "D:/Brain Folio/public/content/clients";
const NO_VIDEO = process.argv.includes("--no-video");

/** [source (under SRC), dest (under DEST_ROOT/<slug>), maxWidth, format?] */
const IMAGES = [
  // ── Azoth Biotech ──────────────────────────────────────────────────────
  ["Azoth/lOGOS-01.png", "azoth-biotech/catalogue/Brand Identity/logo-explorations.webp", 2000],
  ["Azoth/dusseraAzoth-02.png", "azoth-biotech/catalogue/Brand Identity/dusshera-campaign-post.webp", 1600],

  // ── Newsmobile ──────────────────────────────────────────────────────────
  ["Newsmobile/gst launch.jpg", "newsmobile/catalogue/Editorial Infographics/gst-launch.webp", 1600],
  ["Newsmobile/killer roads.jpg", "newsmobile/catalogue/Editorial Infographics/killer-indian-roads.webp", 1600],
  ["Newsmobile/29249855_10212896458298481_6703955836044448910_n.jpg", "newsmobile/catalogue/Editorial Infographics/oil-prices-slashed.webp", 1600],
  ["Newsmobile/29250177_10212896456378433_1734483741440550116_n.jpg", "newsmobile/catalogue/Editorial Infographics/bond-drinks.webp", 1600],
  ["Newsmobile/29261573_10212896457538462_7967938824991730418_n.jpg", "newsmobile/catalogue/Editorial Infographics/worlds-richest-man.webp", 1600],
  ["Newsmobile/29261939_10212896459218504_5372384996697891528_n.jpg", "newsmobile/catalogue/Editorial Infographics/highest-paid-actresses.webp", 1600],

  // ── Zabraku Media ───────────────────────────────────────────────────────
  ["Zabraku Media/zabraku cover page-01.png", "zabraku-media/catalogue/Brand Identity/zabraku-mark-i.webp", 1600],
  ["Zabraku Media/zabraku cover pagenew-01.png", "zabraku-media/catalogue/Brand Identity/zabraku-mark-ii.webp", 1600],
  ["Zabraku Media/855.png", "zabraku-media/catalogue/Brand Identity/rk-entertainment-case-study.webp", 2000],
  ["Zabraku Media/Poster on textured wall.png", "zabraku-media/catalogue/Brand Identity/trophy-poster-mockup.webp", 1600],
  ["Zabraku Media/a-z.png", "zabraku-media/catalogue/Event Campaigns/ohm-2-lineup-a-to-z.webp", 1600],
  ["Zabraku Media/15 aug.png", "zabraku-media/catalogue/Event Campaigns/ohm-2-lineup-15-aug.webp", 1600],
  ["Zabraku Media/ohm2.png", "zabraku-media/catalogue/Event Campaigns/ohm-2-teaser.webp", 1280],
  ["Zabraku Media/ohm22nov.png", "zabraku-media/catalogue/Event Campaigns/the-after-after-party.webp", 1280],
  ["Zabraku Media/phantom.png", "zabraku-media/catalogue/Event Campaigns/phantom-halloween.webp", 1280],
  ["Zabraku Media/ZAB5455.png", "zabraku-media/catalogue/Event Campaigns/christmas-party.webp", 1280],

  // ── UID — Puran Studios (the user's own studio brand) ───────────────────
  ["UID/Branding/outputs/Adversiment-Billboard-mockup-vol4.png", "uid/catalogue/Puran Studios/billboard-design-nature.webp", 2560],
  ["UID/Branding/branddocu/logos_purandocu-01.png", "uid/catalogue/Puran Studios/logo-explorations.webp", 2000],
  ["UID/Branding/branddocu/colour-01.png", "uid/catalogue/Puran Studios/colour-guidelines.webp", 1600],
  ["UID/Branding/branddocu/TYPO-01-01.png", "uid/catalogue/Puran Studios/typography-guidelines.webp", 1600],
  ["UID/Branding/outputs/cards.png", "uid/catalogue/Puran Studios/business-cards.webp", 1600],
  ["UID/Branding/outputs/Vinyl Record .png", "uid/catalogue/Puran Studios/vinyl-record-application.webp", 1600],
  ["UID/Branding/outputs/HARCOVER MOCKUP.png", "uid/catalogue/Puran Studios/hardcover-book-mockup.webp", 1600],

  // ── UID — Farmstacks packaging ────────────────────────────────────────
  ["UID/Packaginhg/farmstacks/Green FARMSTACK1.png", "uid/catalogue/Farmstacks Packaging/pack-01.webp", 1600],
  ["UID/Packaginhg/farmstacks/Green FARMSTACK2.png", "uid/catalogue/Farmstacks Packaging/pack-02.webp", 1600],
  ["UID/Packaginhg/farmstacks/Green FARMSTACK3.png", "uid/catalogue/Farmstacks Packaging/pack-03.webp", 1600],
  ["UID/Packaginhg/farmstacks/Green FARMSTACK4.png", "uid/catalogue/Farmstacks Packaging/pack-04.webp", 1600],
  ["UID/Packaginhg/farmstacks/farminfinite.png", "uid/catalogue/Farmstacks Packaging/brand-mark.webp", 1200],
  ["UID/Packaginhg/sortoffinalfarmstacks.jpg", "uid/catalogue/Farmstacks Packaging/packaging-family.webp", 1600],

  // ── UID — Nirvaan (performance documentary) ──────────────────────────
  ["UID/NIRVAAN- BODY AND SPACE/nirvaan poster.jpg", "uid/catalogue/Nirvaan — Body and Space/nirvaan-poster.webp", 1600],

  // ── UID — Sketches (observational studies + a model-making project) ──
  ["UID/Sketches/DC_250685610.jpg", "uid/catalogue/Sketches/eye-studies-i.webp", 1400],
  ["UID/Sketches/DC_25068561.jpg", "uid/catalogue/Sketches/eye-studies-ii.webp", 1400],
  ["UID/Sketches/DC_25068565.jpg", "uid/catalogue/Sketches/study-iii.webp", 1400],
  ["UID/Sketches/DC_25068581.jpg", "uid/catalogue/Sketches/study-iv.webp", 1400],
  ["UID/Sketches/20190401_024511.jpg", "uid/catalogue/Sketches/time-bound-calendar-model.webp", 1600],
  ["UID/Sketches/20190401_024654.jpg", "uid/catalogue/Sketches/time-bound-calendar-model-ii.webp", 1600],
];

/** [source, dest video, scale filter, crf, posterSeconds] — skipped if dest exists. */
const VIDEOS = [
  [
    "UID/NIRVAAN- BODY AND SPACE/Trailer.mp4",
    "uid/catalogue/Nirvaan — Body and Space/trailer.mp4",
    "scale=-2:720",
    23,
    3,
  ],
  [
    "UID/NIRVAAN- BODY AND SPACE/GEET MALHAR KE Teaser.mp4",
    "uid/catalogue/Nirvaan — Body and Space/geet-malhar-ke-teaser.mp4",
    "scale=1080:1080",
    23,
    3,
  ],
];

/** _meta.json per catalogue folder (paths under DEST_ROOT). */
const METAS = {
  "azoth-biotech/catalogue/Brand Identity": {
    order: 1,
    cover: "logo-explorations.webp",
    description:
      "An early-stage identity engagement — a DNA-helix mark explored across a dozen directions, landing on the circular tangle, and its first campaign moment. A small, honest set: the relationship is early.",
  },

  "newsmobile/catalogue/Editorial Infographics": {
    order: 1,
    cover: "gst-launch.webp",
    description:
      "Daily-news infographics — a policy launch, a road-safety data card, a broadcast quote, celebrity-list content — each built to read in a feed scroll, branded consistently under deadline.",
  },

  "zabraku-media/catalogue/Brand Identity": {
    order: 1,
    cover: "rk-entertainment-case-study.webp",
    description:
      "Zabraku's own mark, and a logo case study built for RK Entertainment — bounding box, typeface rationale, and the champagne-glass monogram explained the way a client deck should.",
    captions: {
      "zabraku-mark-i.webp": "The Zabraku wordmark, cut into a radial line field.",
      "zabraku-mark-ii.webp": "An alternate cover treatment — prism and gradient.",
      "rk-entertainment-case-study.webp":
        "RK Entertainment — the bounding-box logic behind the champagne-glass monogram.",
      "trophy-poster-mockup.webp": "A typographic poster study, shown on a textured street wall.",
    },
  },
  "zabraku-media/catalogue/Event Campaigns": {
    order: 2,
    cover: "ohm-2-lineup-a-to-z.webp",
    description:
      "Ongoing event marketing for the same client — full lineup boards, day bills, and teasers across a year of parties: Ohm 2.Ω, the After After Party, Phantom Halloween, Christmas.",
    captions: {
      "ohm-2-lineup-a-to-z.webp": "Ohm 2.Ω — the full A–Z lineup board, 12–15 August.",
      "ohm-2-lineup-15-aug.webp": "Ohm 2.Ω — the 15th August day bill.",
      "ohm-2-teaser.webp": "Ohm 2.Ω — the announce teaser.",
      "the-after-after-party.webp": "The After After Party, 20–22 November.",
      "phantom-halloween.webp": "Phantom Halloween, 29–31 October.",
      "christmas-party.webp": "The Christmas wreath party bill.",
    },
  },

  "uid/catalogue/Puran Studios": {
    order: 1,
    cover: "billboard-design-nature.webp",
    description:
      "A studio identity of one's own: a film-strip leaf mark, a colour and type system, and its applications — from a billboard's \"Design. Nature.\" line to a business card and a book jacket.",
    captions: {
      "billboard-design-nature.webp":
        "\"The first zero-waste studio dedicated to environmental protection.\"",
      "logo-explorations.webp": "The mark's route to the film-strip leaf.",
      "colour-guidelines.webp": "Colour law — a two-tone green, a film-stock brown.",
      "typography-guidelines.webp": "Typeface rationale.",
      "business-cards.webp": "Founder's card.",
      "vinyl-record-application.webp": "The mark on a vinyl sleeve.",
      "hardcover-book-mockup.webp": "The mark on a hardcover spine.",
    },
  },
  "uid/catalogue/Farmstacks Packaging": {
    order: 2,
    cover: "packaging-family.webp",
    description:
      "Packaging for a hydroponic urban farming brand — a sprouting-leaf mark on a pentagon pack, sized for a produce family grown, not shipped, from far away.",
  },
  "uid/catalogue/Nirvaan — Body and Space": {
    order: 3,
    cover: "nirvaan-poster.webp",
    presentation: "video-wall",
    description:
      "A performance-installation project — \"a quest for self-awakening\" — staged with three collaborators. Poster, trailer, and teaser.",
    captions: {
      "trailer.mp4": "Trailer.",
      "geet-malhar-ke-teaser.mp4": "Geet Malhar Ke — teaser.",
    },
    portrait: ["geet-malhar-ke-teaser.mp4"],
  },
  "uid/catalogue/Sketches": {
    order: 4,
    cover: "eye-studies-i.webp",
    description:
      "Observational studies and a hand-built object — pencil studies from life, and a physical perpetual-calendar model, \"Time Bound.\"",
  },
};

/* ── run ──────────────────────────────────────────────────────────────── */

const ensure = (p) => fs.mkdirSync(p, { recursive: true });
let ok = 0, fail = 0, skipped = 0;

for (const [src, dest, width, format = "webp"] of IMAGES) {
  const from = path.join(SRC, src);
  const to = path.join(DEST_ROOT, dest);
  try {
    ensure(path.dirname(to));
    const img = sharp(from, { limitInputPixels: false }).resize({
      width,
      withoutEnlargement: true,
    });
    if (format === "png") await img.png().toFile(to);
    else await img.webp({ quality: 82 }).toFile(to);
    ok++;
  } catch (e) {
    fail++;
    console.error(`IMAGE FAIL: ${src} → ${dest}: ${e.message}`);
  }
}

if (!NO_VIDEO) {
  for (const [src, dest, scale, crf, posterAt] of VIDEOS) {
    const from = path.join(SRC, src);
    const to = path.join(DEST_ROOT, dest);
    const poster = to.replace(/\.mp4$/, ".jpg");
    if (fs.existsSync(to) && fs.existsSync(poster)) {
      skipped++;
      continue;
    }
    try {
      ensure(path.dirname(to));
      execFileSync("ffmpeg", [
        "-y", "-i", from, "-vf", scale,
        "-c:v", "libx264", "-crf", String(crf), "-preset", "fast",
        "-pix_fmt", "yuv420p", "-movflags", "+faststart",
        "-c:a", "aac", "-b:a", "128k",
        to,
      ], { stdio: ["ignore", "ignore", "pipe"] });
      execFileSync("ffmpeg", [
        "-y", "-ss", String(posterAt), "-i", to, "-frames:v", "1",
        "-q:v", "3", poster,
      ], { stdio: ["ignore", "ignore", "pipe"] });
      ok++;
      console.log(`video done: ${dest}`);
    } catch (e) {
      fail++;
      console.error(`VIDEO FAIL: ${src}: ${e.message}`);
    }
  }
}

for (const [dir, meta] of Object.entries(METAS)) {
  const to = path.join(DEST_ROOT, dir, "_meta.json");
  ensure(path.dirname(to));
  fs.writeFileSync(to, JSON.stringify(meta, null, 2) + "\n");
}

console.log(`\nDone. ${ok} ok, ${skipped} skipped (existing videos), ${fail} failed.`);
if (fail > 0) process.exit(1);
