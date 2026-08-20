/**
 * prepare-other-clients.mjs — asset pipeline for Azoth Biotech, Newsmobile,
 * Zabraku Media, and UID.
 *
 * Source: _source\BWP\{Azoth,Newsmobile,Zabraku Media,UID}.
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
import { BWP, CONTENT } from "./sources.mjs";

const SRC = BWP;
const DEST_ROOT = path.join(CONTENT, "clients");
const NO_VIDEO = process.argv.includes("--no-video");

/** [source (under SRC), dest (under DEST_ROOT/<slug>), maxWidth, format?] */
const IMAGES = [
  // ── Azoth Biotech ──────────────────────────────────────────────────────
  ["Azoth/Asset 1@4x.png", "azoth-biotech/catalogue/Brand Identity/azoth-master-mark.webp", 1200],
  ["Azoth/lOGOS-01.png", "azoth-biotech/catalogue/Brand Identity/logo-explorations.webp", 2000],
  ["Azoth/dusseraAzoth-02.png", "azoth-biotech/catalogue/Brand Identity/dusshera-campaign-post.webp", 1600],
  // Sub-brands proposed under the Azoth house (user-confirmed as Azoth work).
  ["Azoth/mw_sheet-01-01.png", "azoth-biotech/catalogue/Sub-brands/mushroomworks-system.webp", 2000],
  ["Azoth/LOGOS SHEETSMYCO-01.png", "azoth-biotech/catalogue/Sub-brands/mycoactives-system.webp", 2000],
  ["Azoth/Asset 13@2x.png", "azoth-biotech/catalogue/Sub-brands/mycoactives-lockup.webp", 1600],
  ["Azoth/kavaka 1@2x.png", "azoth-biotech/catalogue/Sub-brands/kavaka-lockup.webp", 1600],
  ["Azoth/lionsmane-01.png", "azoth-biotech/catalogue/Sub-brands/lions-mane-lockup.webp", 1600],
  ["Azoth/Naturalist-01.png", "azoth-biotech/catalogue/Sub-brands/the-naturalist-lockup.webp", 1600],

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
    cover: "azoth-master-mark.webp",
    description:
      "A mycelium tangle bounded by a circle — the master mark, its exploration sheet, and its first festival moment.",
    story:
      "The brief: make biology feel engineered. Twelve directions were drawn — helixes, flasks, monograms — before the answer arrived from the organism itself: a mycelial network, clipped by a perfect circle, precise enough for a pharma label and alive enough for a festival post. The chrome stays neutral so one teal reads as the signal.",
    captions: {
      "azoth-master-mark.webp": "The master mark — a mycelium network held in a circle.",
      "logo-explorations.webp": "Twelve directions on one sheet — the route to the tangle.",
      "dusshera-campaign-post.webp":
        "Dusshera, said in brand language: strike out your daemons.",
    },
  },
  "azoth-biotech/catalogue/Sub-brands": {
    order: 2,
    cover: "mushroomworks-system.webp",
    description:
      "Five product sub-brands proposed under the Azoth house — Mushroomworks, MycoActives, Kavaka, Lion's Mane, The Naturalist.",
    story:
      "One house, many fruiting bodies. Each proposed line gets its own mark — a mushroom that reads as a growth arrow, a bolt-stemmed cap, a leaf-gilled monogram — while staying inside the parent's teal-and-grey grammar. Sheets show the system thinking: lockups, reverses, and typography tested together, not logo-by-logo.",
    captions: {
      "mushroomworks-system.webp": "Mushroomworks — the cap that grows into an arrow.",
      "mycoactives-system.webp": "MycoActives — the exploration sheet.",
      "mycoactives-lockup.webp": "MycoActives — bolt-stemmed, energy-first.",
      "kavaka-lockup.webp": "Kavaka — the Sanskrit name, drawn as a mark.",
      "lions-mane-lockup.webp": "Lion's Mane — the nootropic line.",
      "the-naturalist-lockup.webp": "The Naturalist — the field-notes voice.",
    },
  },

  "newsmobile/catalogue/Editorial Infographics": {
    order: 1,
    cover: "gst-launch.webp",
    description:
      "Daily-news graphics built to read in a feed scroll — the story, in three lines flat.",
    story:
      "News design is deadline design. Each card had hours, not days: a policy launch broken into numbers, road deaths made legible without being lurid, a quote staged like broadcast. The discipline that survived the pace — one condensed headline voice, one red, the masthead always in the same corner — is what made six graphics from five years look like one newsroom.",
    captions: {
      "gst-launch.webp": "GST launch night — the quote, staged like broadcast.",
      "killer-indian-roads.webp": "17 deaths an hour — data made legible, not lurid.",
      "oil-prices-slashed.webp": "Fuel-price cut — one card, three timelines.",
      "bond-drinks.webp": "Entertainment desk — Bond, ranked by glass.",
      "worlds-richest-man.webp": "Bezos at $90.6B — the profile card.",
      "highest-paid-actresses.webp": "Forbes list, in one scroll-stopping frame.",
    },
  },

  "zabraku-media/catalogue/Brand Identity": {
    order: 1,
    cover: "rk-entertainment-case-study.webp",
    description:
      "Zabraku's own mark, and a logo case study built for RK Entertainment — bounding box, typeface rationale, and the champagne-glass monogram explained the way a client deck should.",
    story:
      "Two identities, one desk. Zabraku's own wordmark is cut into a radial line field — a media house that reads like a signal. For RK Entertainment, the case study does the persuading: the monogram's champagne glass is derived on a bounding grid, the typeface argued for in writing, because a nightlife client buys conviction before they buy a logo.",
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
      "A year of parties for one client — lineup boards, day bills and teasers: Ohm 2.Ω, the After After Party, Phantom Halloween, Christmas.",
    story:
      "Event design is scene reportage: Anjuna cliff, 3 AM onwards, no masks no entry. Across a full calendar the system flexed — grunge type over red-orange artwork for the festival, nebulae for the after-hours, a wreath for Christmas — while the sponsor rows, venue line and lineup typography held formation. The posters carry the colour; the identity carries the year.",
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
    story:
      "The postgraduate brief that becomes a thesis statement: invent a studio, then behave like it exists. Puran's mark folds a film strip into a leaf; the guidelines commit to two greens and a film-stock brown; and the applications — billboard, card, vinyl, hardcover — are treated as deliverables, not decorations. Coursework, presented like finished practice.",
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
    story:
      "Structure first: the pentagon carton was cut, folded and rebuilt until it stood on a shelf, then the graphics arrived — a sprouting mark, produce photography, a green that means fresh rather than eco-generic. The family shot is the proof: one system, four SKUs, no exceptions.",
    captions: {
      "packaging-family.webp": "The family — one system, four SKUs.",
      "pack-01.webp": "The pentagon carton, front face.",
      "pack-02.webp": "Side elevation.",
      "pack-03.webp": "The opening mechanism.",
      "pack-04.webp": "Shelf stance.",
      "brand-mark.webp": "Farmstacks — the sprouting mark.",
    },
  },
  "uid/catalogue/Nirvaan — Body and Space": {
    order: 3,
    cover: "nirvaan-poster.webp",
    presentation: "video-wall",
    description:
      "A performance-installation project — \"a quest for self-awakening\" — staged with three collaborators. Poster, trailer, and teaser.",
    story:
      "Body and space, treated as materials. The poster is hand-painted — watercolour ground, Devanagari brushwork — because the performance itself was analog: movement, breath, a basement at 3 PM. The films keep that honesty; nothing is graded into a trailer it wasn't.",
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
    story:
      "Where the hand learned before the system did. Graphite studies of eyes and faces trained the seeing; \"Time Bound\" — a stepped, mosaic-skinned perpetual calendar built by hand — trained the making. Every polished system elsewhere on this site starts in rooms like these.",
    captions: {
      "eye-studies-i.webp": "Graphite — the eye, studied.",
      "eye-studies-ii.webp": "Graphite — second sitting.",
      "time-bound-calendar-model.webp": "\"Time Bound\" — the perpetual calendar, built by hand.",
      "time-bound-calendar-model-ii.webp": "The calendar's dial detail.",
      "study-iii.webp": "Study from life.",
      "study-iv.webp": "Study from life.",
    },
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
