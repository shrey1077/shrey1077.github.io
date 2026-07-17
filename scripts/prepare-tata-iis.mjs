/**
 * prepare-tata-iis.mjs — asset pipeline for the Tata IIS experience.
 *
 * Reads the curated archive (D:\Assets\Clients\Tata IIS), produces
 * web derivatives into public/content/clients/tata-iis per
 * docs/TATA_IIS_BUILD_PROMPT.md's manifest, and writes each collection's
 * _meta.json (order, presentation, description, captions).
 *
 * Idempotent: re-running overwrites derivatives and metas. Images via sharp
 * (repo dependency); videos/posters via ffmpeg on PATH.
 *
 *   node scripts/prepare-tata-iis.mjs            # everything
 *   node scripts/prepare-tata-iis.mjs --no-video # images + metas only
 */

import sharp from "sharp";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const SRC = "D:/Assets/Clients/Tata IIS";
const DEST = "D:/Brain Folio/public/content/clients/tata-iis";
const NO_VIDEO = process.argv.includes("--no-video");

/* ── manifest ─────────────────────────────────────────────────────────── */

/** [source (under SRC), dest (under DEST), maxWidth, format?] */
const IMAGES = [
  // Intro (Legacy sequence)
  ["Intro/Jamsetji-Nusserwanji-Tata.webp", "intro/01-jamsetji.webp", 1600],
  ["Intro/JRD Tata.jpg", "intro/02-jrd.webp", 1600],
  ["Intro/Ratan Tata.png", "intro/03-ratan.webp", 1600],
  ["Logos and Guidelines/Tata Logos (2)/TATA IIS corrrcetd BLK@3x.png", "intro/wordmark-mask.png", 2000, "png"],

  // Brand / logo system
  ["Logos and Guidelines/Tata Logos (2)/TATA IIS corrrcetd BLK@3x.png", "brand/wordmark-black.png", 2000, "png"],
  ["Logos and Guidelines/Tata Logos (2)/TATA IIS Corrected White@3x.png", "brand/wordmark-white.png", 2000, "png"],
  ["Logos and Guidelines/Tata Logos (2)/IISA COLOR@3x.png", "brand/iisa.png", 800, "png"],
  ["Logos and Guidelines/Tata Logos (2)/IISM COLOR.png", "brand/iism.png", 800, "png"],
  ["Logos and Guidelines/Asset 1@3x.png", "brand/texture-iisa.webp", 2560],
  ["Logos and Guidelines/Asset 2@3x.png", "brand/texture-iism.webp", 2560],
  // Guideline plates: cover → plate-01, _2.._12 → plate-02..12
  ["Logos and Guidelines/Tata IIS/Tata IIS Copperplate Gothic Logo Guidelines_cover.jpg", "brand/guidelines/plate-01.webp", 1600],
  ...Array.from({ length: 11 }, (_, i) => [
    `Logos and Guidelines/Tata IIS/Tata IIS Copperplate Gothic Logo Guidelines_${i + 2}.jpg`,
    `brand/guidelines/plate-${String(i + 2).padStart(2, "0")}.webp`,
    1600,
  ]),
  // Partner wall
  ...[
    ["Siemens", "siemens"], ["Fanuc", "fanuc"], ["UR", "universal-robots"],
    ["Zeiss", "zeiss"], ["Mitutoyo", "mitutoyo"], ["Festo", "festo"],
    ["Makino", "makino"], ["Markforged", "markforged"], ["Formlabs", "formlabs"],
    ["Fronius", "fronius"], ["Hexagon", "hexagon"], ["TVS", "tvs"],
    ["TAta motors", "tata-motors"], ["Taj Skyline", "taj-skyline"],
  ].map(([src, out]) => [
    `Logos and Guidelines/Partner logos/Partner logos/PNG/${src}@3x.png`,
    `brand/partners/${out}.png`, 600, "png",
  ]),

  // 03 Print — 01 The Brand at Scale
  ["Digital/Mockups/BOLD AHD 1.png", "sections/Print/01 The Brand at Scale/ahmedabad-entrance-monolith.webp", 2560],
  ["Digital/Mockups/City Billboard Mockup MUM.png", "sections/Print/01 The Brand at Scale/mumbai-site-hoarding.webp", 2560],
  ["Digital/Mockups/Billboard Mockup9.png", "sections/Print/01 The Brand at Scale/highway-billboard.webp", 2560],
  ["Digital/Mockups/12x24 Billboard Mockup On Building Wall1.png", "sections/Print/01 The Brand at Scale/building-wall-billboard.webp", 2560],
  ["Digital/Mockups/Mockup222 MUM.png", "sections/Print/01 The Brand at Scale/city-billboard-mumbai.webp", 2560],
  ["Digital/Mockups/2 metal amd.png", "sections/Print/01 The Brand at Scale/brushed-metal-facade.webp", 2560],
  ["Digital/Mockups/Outdoor-City-Banner-Mockup MUM.png", "sections/Print/01 The Brand at Scale/street-banner-mumbai.webp", 2560],
  ["Digital/Mockups/City Light Billboard MockupAMD.png", "sections/Print/01 The Brand at Scale/city-light-panel.webp", 2560],

  // 03 Print — 02 Publications
  ["Print/Brochures/First brochures/Brcohure v21 AMD-01.png", "sections/Print/02 Publications/admissions-brochure-cover.webp", 1600],
  ["Print/Brochures/First brochures/Brcohure v21 AMD-03.png", "sections/Print/02 Publications/admissions-brochure-courses.webp", 1600],
  ["Print/Brochures/First brochures/Brcohure v21 AMD-05.png", "sections/Print/02 Publications/admissions-brochure-campus.webp", 1600],
  ["Print/Brochures/Funding Brochures/Artboard 1.png", "sections/Print/02 Publications/funding-brochure-impact.webp", 2000],
  ["Print/Brochures/Funding Brochures/Artboard 2.png", "sections/Print/02 Publications/funding-brochure-vision.webp", 2000],
  ["Print/Brochures/Funding Brochures/FB_2-3.png", "sections/Print/02 Publications/funding-brochure-spread.webp", 2000],

  // 03 Print — 03 Campus Voice
  ["Print/Campus Posters/Safety1.png", "sections/Print/03 Campus Voice/workplace-safety.webp", 1280],
  ["Print/Campus Posters/Safety2.png", "sections/Print/03 Campus Voice/safety-series-ii.webp", 1280],
  ["Print/Campus Posters/Safety-03.png", "sections/Print/03 Campus Voice/safety-series-iii.webp", 1280],
  ["Print/Campus Posters/POSH/POSH ACT -01.png", "sections/Print/03 Campus Voice/posh-act-i.webp", 1280],
  ["Print/Campus Posters/POSH/POSH ACT -02.png", "sections/Print/03 Campus Voice/posh-act-ii.webp", 1280],
  ["Print/Campus Posters/POSH/POSH ACT NEW-13.png", "sections/Print/03 Campus Voice/posh-act-iii.webp", 1280],

  // 03 Print — 04 The Lab System
  ["Print/Standee/Robotics Lab.png", "sections/Print/04 The Lab System/robotics-lab.webp", 1280],
  ["Print/Standee/WELDING.png", "sections/Print/04 The Lab System/welding-lab.webp", 1280],
  ["Print/Standee/ev lab.png", "sections/Print/04 The Lab System/ev-lab.webp", 1280],
  ["Print/Standee/cnc MACHINING.png", "sections/Print/04 The Lab System/cnc-machining-lab.webp", 1280],
  ["Print/Standee/am LAB.png", "sections/Print/04 The Lab System/additive-manufacturing-lab.webp", 1280],
  ["Print/Standee/metrology lab.png", "sections/Print/04 The Lab System/metrology-lab.webp", 1280],

  // 03 Print — 05 The Credential
  ["Print/Certificates/CertificatesParticipation-59.png", "sections/Print/05 The Credential/participation-certificate.webp", 1600],

  // 03 Print — 06 Events
  ["Print/Events/Amtech/Jap AMTECH Big Banner v12.png", "sections/Print/06 Events/amtech-pavilion-banner.webp", 2560],
  ["Print/Events/Amtech/Walls Amtech LEFT Case studies-01.png", "sections/Print/06 Events/amtech-case-study-wall.webp", 2560],
  ["Print/Events/Skill connect/Polo Shirt Main File_f.png", "sections/Print/06 Events/skill-connect-polo.webp", 1280],
  ["Print/Events/Skill connect/Standees -Mu_SCL v1.png", "sections/Print/06 Events/skill-connect-standee.webp", 1280],
  ["Print/Events/Skill connect/Pic_frame_iismSC.png", "sections/Print/06 Events/skill-connect-frame.webp", 1280],
  ["Print/Events/Skill connect/T-Shirt Mockup 1.png", "sections/Print/06 Events/skill-connect-tshirt.webp", 1280],

  // 04 Digital — 02 Screen Presence
  ["Digital/Teams call BG/Teams Call BG Tata IIS.png", "sections/Digital/02 Screen Presence/teams-call-backdrop.webp", 1600],
  ["Digital/Teams call BG/Video Frame Backdrop v4.png", "sections/Digital/02 Screen Presence/video-frame-backdrop.webp", 1600],

  // 05 Socials — 01 Brand Literacy
  ["Socials/Quiz/Alfa Romeo.png", "sections/Socials/01 Brand Literacy/alfa-romeo-question.webp", 1080],
  ["Socials/Quiz/Alfa Romeo soln.png", "sections/Socials/01 Brand Literacy/alfa-romeo-answer.webp", 1080],
  ["Socials/Quiz/Citibank.png", "sections/Socials/01 Brand Literacy/citibank-question.webp", 1080],
  ["Socials/Quiz/Citibank soln.png", "sections/Socials/01 Brand Literacy/citibank-answer.webp", 1080],

  // 05 Socials — 02 The Social System
  ["Socials/Stories-02.png", "sections/Socials/02 The Social System/story-frame-i.webp", 1080],
  ["Socials/Stories-04.png", "sections/Socials/02 The Social System/story-frame-ii.webp", 1080],
  ["Socials/Templates Posts-03.png", "sections/Socials/02 The Social System/post-template-i.webp", 1080],
  ["Socials/Templates Posts-05.png", "sections/Socials/02 The Social System/post-template-ii.webp", 1080],
  ["Socials/Trainee Spotlight story size-02.png", "sections/Socials/02 The Social System/trainee-spotlight.webp", 1080],
  ["Socials/Square Post new.png", "sections/Socials/02 The Social System/square-post.webp", 1080],

  // 06 Photography
  ["Photography/DSC_8912.jpg", "photography/Campus & Labs/automation-lab-training.webp", 1600],
  ["Photography/DSC_8927.jpg", "photography/Campus & Labs/campus-frame-ii.webp", 1600],
  ["Photography/DSC_8952.jpg", "photography/Campus & Labs/campus-frame-iii.webp", 1600],
  ["Photography/DSC_9276.jpg", "photography/Campus & Labs/campus-frame-iv.webp", 1600],
  ["Photography/DSC_9481.jpg", "photography/Campus & Labs/campus-frame-v.webp", 1600],
  ["Photography/DSC_2949.JPG", "photography/Campus & Labs/campus-frame-vi.webp", 1600],
  ["Photography/DSC_3466.jpg", "photography/Campus & Labs/campus-frame-vii.webp", 1600],
  ["Photography/DSC_5486.jpg", "photography/Campus & Labs/campus-frame-viii.webp", 1600],
  ["Photography/4O5A0755.JPG", "photography/Campus & Labs/campus-frame-ix.webp", 1600],
  ["Photography/4O5A0817.JPG", "photography/Campus & Labs/campus-frame-x.webp", 1600],
];

/** [source, dest video, scale filter, crf, posterSeconds] */
const VIDEOS = [
  ["Digital/Videos/OneOfOne MSDE.mp4", "sections/Digital/01 Films/one-of-one-msde.mp4", "scale=-2:720", 23, 12],
  ["Digital/Videos/jioHS v8.mp4", "sections/Digital/01 Films/jio-hotstar-spot.mp4", "scale=-2:1080", 21, 5],
  ["Digital/Videos/Skills Conclave 2025 (2).mp4", "sections/Digital/01 Films/skills-conclave-2025.mp4", "scale=-2:1080", 21, 5],
  ["Digital/Videos/Additive Manufacturing_Time Lapse.mp4", "sections/Digital/01 Films/additive-manufacturing-timelapse.mp4", "scale=720:-2", 23, 8],
  ["Digital/Videos/- RENDER.mp4", "sections/Digital/01 Films/tata-iis-logo-render.mp4", "scale=-2:1080", 23, 20],
];

/** _meta.json per folder (paths under DEST). */
const METAS = {
  "sections/Print": {
    order: 1,
    description:
      "Ink on every surface the institute owns — from an A5 flyer to a fifteen-metre hoarding.",
  },
  "sections/Digital": {
    order: 2,
    description:
      "The brand in motion — films, a broadcast spot, and the screens between meetings.",
  },
  "sections/Socials": {
    order: 3,
    description:
      "A feed that teaches. Brand literacy as content; templates as infrastructure.",
  },

  "sections/Print/01 The Brand at Scale": {
    order: 1,
    presentation: "strip",
    description:
      "Hoardings, monoliths and site wraps for two campuses. The real challenge: five mandated co-brands, two languages, one hierarchy that reads at 60 km/h.",
    captions: {
      "ahmedabad-entrance-monolith.webp":
        "The Ahmedabad entrance monolith — bilingual naming, government and Tata marks in one hierarchy.",
      "mumbai-site-hoarding.webp":
        "Site hoarding at the Mumbai campus perimeter — the identity at pedestrian scale.",
      "highway-billboard.webp":
        "Launch billboard — the wordmark working at highway distance.",
      "building-wall-billboard.webp": "12×24 ft on a building wall.",
      "city-billboard-mumbai.webp": "City billboard, Mumbai.",
      "brushed-metal-facade.webp": "Brushed-metal facade lettering, Ahmedabad.",
      "street-banner-mumbai.webp": "Street banner series, Mumbai.",
      "city-light-panel.webp": "City-light panel, Ahmedabad.",
    },
  },
  "sections/Print/02 Publications": {
    order: 2,
    presentation: "publication",
    description:
      "Funding and admissions brochures — impact numbers, recruiter walls and contribution paths held together by the circuit-grid motif.",
    captions: {
      "admissions-brochure-cover.webp":
        "Admissions brochure — the real campus on the cover, no renders.",
      "admissions-brochure-courses.webp": "Course spreads, 2024 edition.",
      "admissions-brochure-campus.webp": "Campus and labs spread.",
      "funding-brochure-impact.webp":
        "The funding case: 70 companies, 200+ offers, transparent impact reporting.",
      "funding-brochure-vision.webp": "Vision spread — why skilling, why now.",
      "funding-brochure-spread.webp": "Contribution paths for partners.",
    },
  },
  "sections/Print/03 Campus Voice": {
    order: 3,
    presentation: "grid",
    description:
      "Safety and POSH Act series for workshop walls. Compliance given the same design care as campaigns.",
  },
  "sections/Print/04 The Lab System": {
    order: 4,
    presentation: "grid",
    description:
      "One standee per lab — each naming its equipment partners. A template the campus team extends without a designer.",
    captions: {
      "robotics-lab.webp": "Robotics — FANUC, Universal Robots, MiR.",
      "welding-lab.webp": "Advanced welding.",
      "ev-lab.webp": "Electric vehicles.",
      "cnc-machining-lab.webp": "CNC machining.",
      "additive-manufacturing-lab.webp": "Additive manufacturing.",
      "metrology-lab.webp": "Metrology.",
    },
  },
  "sections/Print/05 The Credential": {
    order: 5,
    presentation: "showcase",
    description:
      "What a student leaves holding. One certificate architecture; variants per campus, course and hiring partner.",
    captions: {
      "participation-certificate.webp":
        "Campus marks above, partner seals below, the name in the middle.",
    },
  },
  "sections/Print/06 Events": {
    order: 6,
    presentation: "grid",
    description:
      "Amtech, Skills Conclave, Skill Connect — every event ships as a kit: banners, walls, standees, polos.",
    captions: {
      "amtech-pavilion-banner.webp": "Amtech pavilion banner.",
      "amtech-case-study-wall.webp": "Amtech case-study wall.",
      "skill-connect-polo.webp": "Skill Connect staff polo.",
      "skill-connect-standee.webp": "Skill Connect standee.",
      "skill-connect-frame.webp": "Photo-op frame, IIS Mumbai.",
      "skill-connect-tshirt.webp": "Event tee.",
    },
  },

  "sections/Digital/01 Films": {
    order: 1,
    presentation: "video-wall",
    description:
      "Poster-first, one player at a time. The photography gap was real — so the brand leads with film.",
    portrait: ["additive-manufacturing-timelapse.mp4"],
    captions: {
      "one-of-one-msde.mp4": "One of One — the flagship campus film for MSDE. 4½ minutes.",
      "jio-hotstar-spot.mp4": "The 20-second spot that ran on JioHotstar.",
      "skills-conclave-2025.mp4": "Skills Conclave 2025 — event film.",
      "additive-manufacturing-timelapse.mp4": "Additive manufacturing, compressed to 46 seconds.",
      "tata-iis-logo-render.mp4": "The wordmark render — the logo learning to move.",
    },
  },
  "sections/Digital/02 Screen Presence": {
    order: 2,
    presentation: "row",
    description: "Teams backdrops — the brand showing up to meetings.",
  },

  "sections/Socials/01 Brand Literacy": {
    order: 1,
    presentation: "pairs",
    description:
      "“Guess the logo” — design history taught through brands students already love. Question by day, answer by night.",
    captions: {
      "alfa-romeo-question.webp": "Q — an iconic Italian marque.",
      "alfa-romeo-answer.webp": "A — Alfa Romeo, and its first two F1 titles.",
      "citibank-question.webp": "Q — a banking identity.",
      "citibank-answer.webp": "A — Citibank.",
    },
  },
  "sections/Socials/02 The Social System": {
    order: 2,
    presentation: "grid",
    description:
      "Story and post templates the comms team fills without breaking the grid.",
  },

  "photography/Campus & Labs": {
    description: "Real campus, real labs. No stock, ever.",
  },
};

/* ── run ──────────────────────────────────────────────────────────────── */

const ensure = (p) => fs.mkdirSync(p, { recursive: true });
let ok = 0, fail = 0;

// Clear stale scaffolding (empty catalogue/photography placeholders).
for (const stale of ["catalogue", "photography"]) {
  fs.rmSync(path.join(DEST, stale), { recursive: true, force: true });
}

for (const [src, dest, width, format = "webp"] of IMAGES) {
  const from = path.join(SRC, src);
  const to = path.join(DEST, dest);
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
    const to = path.join(DEST, dest);
    const poster = to.replace(/\.mp4$/, ".jpg");
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
  const to = path.join(DEST, dir, "_meta.json");
  ensure(path.dirname(to));
  fs.writeFileSync(to, JSON.stringify(meta, null, 2) + "\n");
}

console.log(`\nDone. ${ok} ok, ${fail} failed.`);
if (fail > 0) process.exit(1);
