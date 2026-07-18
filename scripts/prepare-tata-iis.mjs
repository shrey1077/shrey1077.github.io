/**
 * prepare-tata-iis.mjs — asset pipeline for the Tata IIS experience.
 *
 * CATALOGUE EDITION (rework): all works live as catalogue categories —
 * one folder per work family under public/content/clients/tata-iis/catalogue/,
 * each with a _meta.json (order, description, cover, captions, portrait).
 * Cards render from folders; category routes render the galleries.
 *
 * Reads the curated archive (D:\Assets\Clients\Tata IIS), produces web
 * derivatives, and writes metas. Idempotent: images are regenerated cheaply;
 * VIDEOS ARE SKIPPED IF PRESENT (re-encode by deleting the file first).
 * Images via sharp (repo dependency); videos/posters via ffmpeg on PATH.
 *
 * Privacy rule (docs/TATA_IIS_CONTENT_MAP.md): nothing naming or picturing an
 * identifiable student/employee ships — New Joinee, Presentations, ID-card
 * fronts, and the Trainee Spotlight story are excluded on purpose.
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

const CAT = "catalogue";

/* ── manifest ─────────────────────────────────────────────────────────── */

/** [source (under SRC), dest (under DEST), maxWidth, format?] */
const IMAGES = [
  // Intro (Legacy sequence) — unchanged
  ["Intro/Jamsetji-Nusserwanji-Tata.webp", "intro/01-jamsetji.webp", 1600],
  ["Intro/JRD Tata.jpg", "intro/02-jrd.webp", 1600],
  ["Intro/Ratan Tata.png", "intro/03-ratan.webp", 1600],
  ["Logos and Guidelines/Tata Logos (2)/TATA IIS corrrcetd BLK@3x.png", "intro/wordmark-mask.png", 2000, "png"],

  // Brand / logo system — unchanged
  ["Logos and Guidelines/Tata Logos (2)/TATA IIS corrrcetd BLK@3x.png", "brand/wordmark-black.png", 2000, "png"],
  ["Logos and Guidelines/Tata Logos (2)/TATA IIS Corrected White@3x.png", "brand/wordmark-white.png", 2000, "png"],
  ["Logos and Guidelines/Tata Logos (2)/IISA COLOR@3x.png", "brand/iisa.png", 800, "png"],
  ["Logos and Guidelines/Tata Logos (2)/IISM COLOR.png", "brand/iism.png", 800, "png"],
  ["Logos and Guidelines/Asset 1@3x.png", "brand/texture-iisa.webp", 2560],
  ["Logos and Guidelines/Asset 2@3x.png", "brand/texture-iism.webp", 2560],
  ["Logos and Guidelines/Tata IIS/Tata IIS Copperplate Gothic Logo Guidelines_cover.jpg", "brand/guidelines/plate-01.webp", 1600],
  ...Array.from({ length: 11 }, (_, i) => [
    `Logos and Guidelines/Tata IIS/Tata IIS Copperplate Gothic Logo Guidelines_${i + 2}.jpg`,
    `brand/guidelines/plate-${String(i + 2).padStart(2, "0")}.webp`,
    1600,
  ]),
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

  // ── Catalogue 01 · Billboards & Signages ─────────────────────────────
  ["Digital/Mockups/BOLD AHD 1.png", `${CAT}/Billboards & Signages/ahmedabad-entrance-monolith.webp`, 2560],
  ["Digital/Mockups/City Billboard Mockup MUM.png", `${CAT}/Billboards & Signages/mumbai-site-hoarding.webp`, 2560],
  ["Digital/Mockups/Billboard Mockup9.png", `${CAT}/Billboards & Signages/highway-billboard.webp`, 2560],
  ["Digital/Mockups/12x24 Billboard Mockup On Building Wall1.png", `${CAT}/Billboards & Signages/building-wall-billboard.webp`, 2560],
  ["Digital/Mockups/Mockup222 MUM.png", `${CAT}/Billboards & Signages/city-billboard-mumbai.webp`, 2560],
  ["Digital/Mockups/2 metal amd.png", `${CAT}/Billboards & Signages/brushed-metal-facade-ahmedabad.webp`, 2560],
  ["Digital/Mockups/2 metal mum.png", `${CAT}/Billboards & Signages/brushed-metal-facade-mumbai.webp`, 2560],
  ["Digital/Mockups/Outdoor-City-Banner-Mockup MUM.png", `${CAT}/Billboards & Signages/street-banner-mumbai.webp`, 2560],
  ["Digital/Mockups/Outdoor-City-Banner-Mockup AMD.png", `${CAT}/Billboards & Signages/street-banner-ahmedabad.webp`, 2560],
  ["Digital/Mockups/City Light Billboard MockupAMD.png", `${CAT}/Billboards & Signages/city-light-panel.webp`, 2560],
  ["Print/Signages/Signages 2400X1047 AMD-01.jpg", `${CAT}/Billboards & Signages/campus-signage-ahmedabad.webp`, 2560],
  ["Print/Signages/Signages 2400X1047 MUM-01.jpg", `${CAT}/Billboards & Signages/campus-signage-mumbai.webp`, 2560],

  // ── Catalogue 02 · Brochures ─────────────────────────────────────────
  ...Array.from({ length: 8 }, (_, i) => [
    `Print/Brochures/First brochures/Brcohure v21 AMD-0${i + 1}.png`,
    `${CAT}/Brochures/admissions-brochure-page-${String(i + 1).padStart(2, "0")}.webp`,
    1600,
  ]),
  ["Print/Brochures/Funding Brochures/Artboard 1.png", `${CAT}/Brochures/funding-brochure-impact.webp`, 2000],
  ["Print/Brochures/Funding Brochures/Artboard 2.png", `${CAT}/Brochures/funding-brochure-vision.webp`, 2000],
  ["Print/Brochures/Funding Brochures/FB_2-3.png", `${CAT}/Brochures/funding-brochure-spread-i.webp`, 2000],
  ["Print/Brochures/Funding Brochures/FB_4-1.png", `${CAT}/Brochures/funding-brochure-spread-ii.webp`, 2000],

  // ── Catalogue 04 · Lab Standees ──────────────────────────────────────
  ["Print/Standee/Robotics Lab.png", `${CAT}/Lab Standees/robotics-lab.webp`, 1280],
  ["Print/Standee/WELDING.png", `${CAT}/Lab Standees/welding-lab.webp`, 1280],
  ["Print/Standee/ev lab.png", `${CAT}/Lab Standees/ev-lab.webp`, 1280],
  ["Print/Standee/cnc MACHINING.png", `${CAT}/Lab Standees/cnc-machining-lab.webp`, 1280],
  ["Print/Standee/cnc SIMULATION.png", `${CAT}/Lab Standees/cnc-simulation-lab.webp`, 1280],
  ["Print/Standee/am LAB.png", `${CAT}/Lab Standees/additive-manufacturing-lab.webp`, 1280],
  ["Print/Standee/metrology lab.png", `${CAT}/Lab Standees/metrology-lab.webp`, 1280],
  ["Print/Standee/PLC HMI Lab.png", `${CAT}/Lab Standees/plc-hmi-lab.webp`, 1280],
  ["Print/Standee/SWITCH GEAR LAB.png", `${CAT}/Lab Standees/switchgear-lab.webp`, 1280],
  ["Print/Standee/MECHmps.png", `${CAT}/Lab Standees/mechanical-mps-lab.webp`, 1280],

  // ── Catalogue 05 · Campus Posters ────────────────────────────────────
  ["Print/Campus Posters/Safety1.png", `${CAT}/Campus Posters/workplace-safety-i.webp`, 1280],
  ["Print/Campus Posters/Safety2.png", `${CAT}/Campus Posters/workplace-safety-ii.webp`, 1280],
  ["Print/Campus Posters/Safety-03.png", `${CAT}/Campus Posters/workplace-safety-iii.webp`, 1280],
  ["Print/Campus Posters/Safety-04.png", `${CAT}/Campus Posters/workplace-safety-iv.webp`, 1280],
  ["Print/Campus Posters/POSH/POSH ACT -01.png", `${CAT}/Campus Posters/posh-act-i.webp`, 1280],
  ["Print/Campus Posters/POSH/POSH ACT -02.png", `${CAT}/Campus Posters/posh-act-ii.webp`, 1280],
  ["Print/Campus Posters/POSH/POSH ACT -03.png", `${CAT}/Campus Posters/posh-act-iii.webp`, 1280],
  ["Print/Campus Posters/POSH/POSH ACT NEW-13.png", `${CAT}/Campus Posters/posh-act-iv.webp`, 1280],
  ["Print/Campus Posters/POSH/POSH ACT NEW-14.png", `${CAT}/Campus Posters/posh-act-v.webp`, 1280],

  // ── Catalogue 06 · Flyers & Campaigns ────────────────────────────────
  ["Print/Flyers/FLagship courses (1).png", `${CAT}/Flyers & Campaigns/flagship-courses.webp`, 1280],
  ["Print/Flyers/Labs And equipments.png", `${CAT}/Flyers & Campaigns/labs-and-equipment.webp`, 1280],
  ["Print/Flyers/Jobfair April25.png", `${CAT}/Flyers & Campaigns/job-fair.webp`, 1280],
  ["Print/Flyers/Leaders Summit 2025.png", `${CAT}/Flyers & Campaigns/leaders-summit.webp`, 1280],
  ["Print/Flyers/ARAI_EV_F.png", `${CAT}/Flyers & Campaigns/arai-ev-partnership-front.webp`, 1280],
  ["Print/Flyers/ARAI_EV_B.png", `${CAT}/Flyers & Campaigns/arai-ev-partnership-back.webp`, 1280],
  ["Print/Flyers/ARAI_ONEPAGER.png", `${CAT}/Flyers & Campaigns/arai-one-pager.webp`, 1280],
  ["Print/Flyers/EVSS3.png", `${CAT}/Flyers & Campaigns/ev-skilling-program.webp`, 1280],
  ["Print/Flyers/Redesign Culinary-01.png", `${CAT}/Flyers & Campaigns/culinary-program.webp`, 1280],
  ["Print/Flyers/Skills Conclave 2025 IISA v012-01.png", `${CAT}/Flyers & Campaigns/skills-conclave-2025.webp`, 1280],
  ["Print/Flyers/TATAIIS-PSE South Gujarat event1.png", `${CAT}/Flyers & Campaigns/pse-south-gujarat.webp`, 1280],
  ["Print/Flyers/Diwali greetings TATA IIS.png", `${CAT}/Flyers & Campaigns/diwali-greetings.webp`, 1280],
  ["Print/Flyers/1x/Welding.png", `${CAT}/Flyers & Campaigns/course-flyer-welding.webp`, 1280],
  ["Print/Flyers/1x/EV2.png", `${CAT}/Flyers & Campaigns/course-flyer-ev.webp`, 1280],
  ["Print/Flyers/1x/CNC APE.png", `${CAT}/Flyers & Campaigns/course-flyer-cnc.webp`, 1280],
  ["Print/Flyers/1x/GEFC.png", `${CAT}/Flyers & Campaigns/course-flyer-gefc.webp`, 1280],

  // ── Catalogue 07 · Banners ───────────────────────────────────────────
  ["Print/Banners/AMD Banner1.png", `${CAT}/Banners/campus-banner-ahmedabad.webp`, 2000],
  ["Print/Banners/MUM banner 1.png", `${CAT}/Banners/campus-banner-mumbai.webp`, 2000],
  ["Print/Banners/August Batch head.png", `${CAT}/Banners/august-batch-header.webp`, 2000],
  ["Print/Banners/iisa WEB BIG BANNER.png", `${CAT}/Banners/web-banner-iisa.webp`, 2000],
  ["Print/Banners/Mumbai March banner.png", `${CAT}/Banners/march-batch-banner-mumbai.webp`, 2000],
  ["Print/Banners/edit_banner IISA.png", `${CAT}/Banners/web-banner-iisa-ii.webp`, 2000],
  ["Print/Banners/4X3 A_ITI_courses.jpg", `${CAT}/Banners/iti-courses-banner.webp`, 2000],

  // ── Catalogue 08 · Events ────────────────────────────────────────────
  ["Print/Events/Amtech/Jap AMTECH Big Banner v12.png", `${CAT}/Events/amtech-pavilion-banner.webp`, 2560],
  ["Print/Events/Amtech/Jap AMTECH Big Banner v8.png", `${CAT}/Events/amtech-pavilion-banner-ii.webp`, 2560],
  ["Print/Events/Amtech/Walls Amtech 7 Center-01.png", `${CAT}/Events/amtech-center-wall.webp`, 2560],
  ["Print/Events/Amtech/Walls Amtech LEFT Case studies-01.png", `${CAT}/Events/amtech-case-study-wall.webp`, 2560],
  ["Print/Events/Skill connect/Standees -Mu_SCL v1.png", `${CAT}/Events/skill-connect-standee.webp`, 1280],
  ["Print/Events/Skill connect/Pic_frame_iismSC.png", `${CAT}/Events/skill-connect-photo-frame.webp`, 1280],
  ["Print/Events/Skill connect/9434-01-folder-bi-fold-mockup.png", `${CAT}/Events/skill-connect-folder.webp`, 1280],

  // ── Catalogue 09 · Merchandise ───────────────────────────────────────
  ["Print/Events/Skill connect/Polo Shirt Main File_f.png", `${CAT}/Merchandise/skill-connect-polo.webp`, 1280],
  ["Print/Events/Skill connect/Polo Shirt Main Fileteal.png", `${CAT}/Merchandise/skill-connect-polo-teal.webp`, 1280],
  ["Print/Events/Skill connect/T-Shirt Mockup 1.png", `${CAT}/Merchandise/event-tee.webp`, 1280],
  ["Digital/Mockups/Placement Front Tshirt1.png", `${CAT}/Merchandise/placement-polo-front.webp`, 1280],
  ["Digital/Mockups/Placement Back Tshirt1.png", `${CAT}/Merchandise/placement-polo-back.webp`, 1280],
  ["Digital/Mockups/Tshirt Jan2025 front.png", `${CAT}/Merchandise/batch-tee-front.webp`, 1280],
  ["Digital/Mockups/Tshirt Jan2025 back.png", `${CAT}/Merchandise/batch-tee-back.webp`, 1280],
  ["Digital/Mockups/PlannerMockupMUM.png", `${CAT}/Merchandise/planner-mumbai.webp`, 1280],
  ["Digital/Mockups/Notebook_mu_SCL v1.png", `${CAT}/Merchandise/notebook-skill-connect.webp`, 1280],
  ["Digital/Mockups/Picture_print_frame_IISA.png", `${CAT}/Merchandise/print-frame-iisa.webp`, 1280],

  // ── Catalogue 10 · Stationery ────────────────────────────────────────
  ["Print/Letterhead/Header.png", `${CAT}/Stationery/letterhead-header.webp`, 1600],
  ["Print/Letterhead/Black.png", `${CAT}/Stationery/letterhead-black.webp`, 1600],
  ["Print/Letterhead/footer2.png", `${CAT}/Stationery/letterhead-footer.webp`, 1600],
  ["Print/Notepad/collateral_IISA Notepad Cover.png", `${CAT}/Stationery/notepad-cover-iisa.webp`, 1280],
  ["Print/Notepad/Notepad Cover MSDE-01.jpg", `${CAT}/Stationery/notepad-cover-msde.webp`, 1280],
  ["Print/Notepad/collateral_IISA Bookmark Front.png", `${CAT}/Stationery/bookmark-front.webp`, 1280],
  ["Print/Notepad/collateral_IISABookmark Back.png", `${CAT}/Stationery/bookmark-back.webp`, 1280],
  ["Print/Notepad/collateral_IISA Visitor namecard.png", `${CAT}/Stationery/visitor-namecard.webp`, 1280],
  ["Print/Stickers/Stickers_Mumbai-05.png", `${CAT}/Stationery/stickers-mumbai.webp`, 1280],
  ["Print/Stickers/Stickers_mum-06.png", `${CAT}/Stationery/stickers-mumbai-ii.webp`, 1280],
  ["Print/Standee/Mirror Sticker@3x.png", `${CAT}/Stationery/mirror-sticker.webp`, 1280],

  // ── Catalogue 11 · Certificates ──────────────────────────────────────
  ["Print/Certificates/CertificatesParticipation-59.png", `${CAT}/Certificates/participation-certificate.webp`, 1600],
  ["Print/Certificates/Participation-59.png", `${CAT}/Certificates/participation-certificate-ii.webp`, 1600],

  // ── Catalogue 12 · Socials & Screens ─────────────────────────────────
  ["Socials/Quiz/Alfa Romeo.png", `${CAT}/Socials & Screens/alfa-romeo-question.webp`, 1080],
  ["Socials/Quiz/Alfa Romeo soln.png", `${CAT}/Socials & Screens/alfa-romeo-answer.webp`, 1080],
  ["Socials/Quiz/Citibank.png", `${CAT}/Socials & Screens/citibank-question.webp`, 1080],
  ["Socials/Quiz/Citibank soln.png", `${CAT}/Socials & Screens/citibank-answer.webp`, 1080],
  ["Socials/Stories-02.png", `${CAT}/Socials & Screens/story-frame-i.webp`, 1080],
  ["Socials/Stories-03.png", `${CAT}/Socials & Screens/story-frame-ii.webp`, 1080],
  ["Socials/Stories-04.png", `${CAT}/Socials & Screens/story-frame-iii.webp`, 1080],
  ["Socials/Templates Posts-03.png", `${CAT}/Socials & Screens/post-template-i.webp`, 1080],
  ["Socials/Templates Posts-05.png", `${CAT}/Socials & Screens/post-template-ii.webp`, 1080],
  ["Socials/Square Post new.png", `${CAT}/Socials & Screens/square-post.webp`, 1080],
  ["Socials/Square Post3.png", `${CAT}/Socials & Screens/square-post-ii.webp`, 1080],
  ["Socials/story1.png", `${CAT}/Socials & Screens/story-launch.webp`, 1080],
  ["Socials/IISA_Portrait_v.png", `${CAT}/Socials & Screens/portrait-post-iisa.webp`, 1080],
  ["Socials/IISM_Portrait_v.png", `${CAT}/Socials & Screens/portrait-post-iism.webp`, 1080],
  ["Socials/Happy Birthday.png", `${CAT}/Socials & Screens/birthday-template.webp`, 1080],
  ["Digital/Teams call BG/Teams Call BG Tata IIS.png", `${CAT}/Socials & Screens/teams-call-backdrop.webp`, 1600],
  ["Digital/Teams call BG/Video Frame Backdrop v4.png", `${CAT}/Socials & Screens/video-frame-backdrop.webp`, 1600],

  // ── Catalogue 13 · Photography ───────────────────────────────────────
  ["Photography/DSC_8912.jpg", `${CAT}/Photography/automation-lab-training.webp`, 1600],
  ["Photography/DSC_8927.jpg", `${CAT}/Photography/campus-frame-ii.webp`, 1600],
  ["Photography/DSC_8952.jpg", `${CAT}/Photography/campus-frame-iii.webp`, 1600],
  ["Photography/DSC_9276.jpg", `${CAT}/Photography/campus-frame-iv.webp`, 1600],
  ["Photography/DSC_9481.jpg", `${CAT}/Photography/campus-frame-v.webp`, 1600],
  ["Photography/DSC_2949.JPG", `${CAT}/Photography/campus-frame-vi.webp`, 1600],
  ["Photography/DSC_3466.jpg", `${CAT}/Photography/campus-frame-vii.webp`, 1600],
  ["Photography/DSC_5486.jpg", `${CAT}/Photography/campus-frame-viii.webp`, 1600],
  ["Photography/4O5A0755.JPG", `${CAT}/Photography/campus-frame-ix.webp`, 1600],
  ["Photography/4O5A0817.JPG", `${CAT}/Photography/campus-frame-x.webp`, 1600],
  ["Print/Standee/DSC_0603.jpg", `${CAT}/Photography/standee-in-situ-i.webp`, 1600],
  ["Print/Standee/DSC_0613.jpg", `${CAT}/Photography/standee-in-situ-ii.webp`, 1600],
  ["Print/Standee/DSC_0629.jpg", `${CAT}/Photography/standee-in-situ-iii.webp`, 1600],
  ["Print/Standee/DSC_7145.JPG", `${CAT}/Photography/standee-in-situ-iv.webp`, 1600],
];

/** [source, dest video, scale filter, crf, posterSeconds] — skipped if dest exists. */
const VIDEOS = [
  ["Digital/Videos/OneOfOne MSDE.mp4", `${CAT}/Films/one-of-one-msde.mp4`, "scale=-2:720", 23, 12],
  ["Digital/Videos/jioHS v8.mp4", `${CAT}/Films/jio-hotstar-spot.mp4`, "scale=-2:1080", 21, 5],
  ["Digital/Videos/Skills Conclave 2025 (2).mp4", `${CAT}/Films/skills-conclave-2025.mp4`, "scale=-2:1080", 21, 5],
  ["Digital/Videos/Additive Manufacturing_Time Lapse.mp4", `${CAT}/Films/additive-manufacturing-timelapse.mp4`, "scale=720:-2", 23, 8],
  ["Digital/Videos/- RENDER.mp4", `${CAT}/Films/tata-iis-logo-render.mp4`, "scale=-2:1080", 23, 20],
];

/** _meta.json per catalogue folder. `cover` picks the card image;
 *  caption key order is the curation order on the category page. */
const METAS = {
  [`${CAT}/Billboards & Signages`]: {
    order: 1,
    cover: "ahmedabad-entrance-monolith.webp",
    description:
      "The identity at architectural scale — hoardings, monoliths, facades. Five mandated co-brands, two languages, one hierarchy that reads at 60 km/h.",
    captions: {
      "ahmedabad-entrance-monolith.webp": "The Ahmedabad entrance monolith — bilingual naming, government and Tata marks in one hierarchy.",
      "mumbai-site-hoarding.webp": "Site hoarding at the Mumbai campus perimeter.",
      "highway-billboard.webp": "Launch billboard — the wordmark at highway distance.",
      "building-wall-billboard.webp": "12×24 ft on a building wall.",
      "city-billboard-mumbai.webp": "City billboard, Mumbai.",
      "brushed-metal-facade-ahmedabad.webp": "Brushed-metal facade lettering, Ahmedabad.",
      "brushed-metal-facade-mumbai.webp": "Brushed-metal facade lettering, Mumbai.",
      "street-banner-mumbai.webp": "Street banner series, Mumbai.",
      "street-banner-ahmedabad.webp": "Street banner series, Ahmedabad.",
      "city-light-panel.webp": "City-light panel, Ahmedabad.",
      "campus-signage-ahmedabad.webp": "Campus signage system, Ahmedabad.",
      "campus-signage-mumbai.webp": "Campus signage system, Mumbai.",
    },
  },
  [`${CAT}/Brochures`]: {
    order: 2,
    cover: "admissions-brochure-page-01.webp",
    description:
      "Admissions and funding publications — impact numbers, recruiter walls and contribution paths on the circuit-grid motif.",
    captions: {
      "admissions-brochure-page-01.webp": "Admissions brochure — cover.",
      "admissions-brochure-page-02.webp": "Admissions brochure — the institute.",
      "admissions-brochure-page-03.webp": "Admissions brochure — courses.",
      "admissions-brochure-page-04.webp": "Admissions brochure — labs.",
      "admissions-brochure-page-05.webp": "Admissions brochure — campus.",
      "admissions-brochure-page-06.webp": "Admissions brochure — partners.",
      "admissions-brochure-page-07.webp": "Admissions brochure — admissions.",
      "admissions-brochure-page-08.webp": "Admissions brochure — back cover.",
      "funding-brochure-impact.webp": "The funding case: 70 companies, 200+ offers, transparent impact reporting.",
      "funding-brochure-vision.webp": "Vision spread — why skilling, why now.",
      "funding-brochure-spread-i.webp": "Contribution paths for partners.",
      "funding-brochure-spread-ii.webp": "Partnership models.",
    },
  },
  [`${CAT}/Films`]: {
    order: 3,
    cover: "one-of-one-msde.jpg",
    description:
      "The brand in motion — the flagship MSDE campus film, a JioHotstar broadcast spot, lab time-lapses, the logo render.",
    portrait: ["additive-manufacturing-timelapse.mp4"],
    captions: {
      "one-of-one-msde.mp4": "One of One — the flagship campus film for MSDE. 4½ minutes.",
      "jio-hotstar-spot.mp4": "The 20-second spot that ran on JioHotstar.",
      "skills-conclave-2025.mp4": "Skills Conclave 2025 — event film.",
      "additive-manufacturing-timelapse.mp4": "Additive manufacturing, compressed to 46 seconds.",
      "tata-iis-logo-render.mp4": "The wordmark render — the logo learning to move.",
    },
  },
  [`${CAT}/Lab Standees`]: {
    order: 4,
    cover: "robotics-lab.webp",
    description:
      "One standee per lab, each naming its equipment partners — FANUC to Fronius. A template the campus team extends without a designer.",
  },
  [`${CAT}/Campus Posters`]: {
    order: 5,
    cover: "workplace-safety-i.webp",
    description:
      "Safety and POSH Act series for workshop walls. Compliance given the same design care as campaigns.",
  },
  [`${CAT}/Flyers & Campaigns`]: {
    order: 6,
    cover: "flagship-courses.webp",
    description:
      "Course launches, partnerships and festivals — the everyday outbound voice, one grid across all of it.",
    captions: {
      "flagship-courses.webp": "Flagship course lineup.",
      "labs-and-equipment.webp": "Labs and equipment overview.",
      "job-fair.webp": "Job fair, April 2025.",
      "leaders-summit.webp": "Leaders Summit 2025.",
      "arai-ev-partnership-front.webp": "ARAI EV partnership — front.",
      "arai-ev-partnership-back.webp": "ARAI EV partnership — back.",
      "arai-one-pager.webp": "ARAI program one-pager.",
      "ev-skilling-program.webp": "EV skilling program.",
      "culinary-program.webp": "Culinary program redesign.",
      "skills-conclave-2025.webp": "Skills Conclave 2025 announcement.",
      "pse-south-gujarat.webp": "PSE outreach, South Gujarat.",
      "diwali-greetings.webp": "Diwali greetings.",
      "course-flyer-welding.webp": "Course flyer system — welding.",
      "course-flyer-ev.webp": "Course flyer system — EV.",
      "course-flyer-cnc.webp": "Course flyer system — CNC.",
      "course-flyer-gefc.webp": "Course flyer system — GEFC.",
    },
  },
  [`${CAT}/Banners`]: {
    order: 7,
    cover: "campus-banner-ahmedabad.webp",
    description: "Wide-format campus and web banners for batches, campaigns and seasons.",
  },
  [`${CAT}/Events`]: {
    order: 8,
    cover: "amtech-pavilion-banner.webp",
    description:
      "Amtech and Skill Connect — every event ships as a kit: pavilion banners, case-study walls, standees, folders.",
  },
  [`${CAT}/Merchandise`]: {
    order: 9,
    cover: "skill-connect-polo.webp",
    description:
      "Polos, tees, planners and notebooks — the identity worn and carried.",
  },
  [`${CAT}/Stationery`]: {
    order: 10,
    cover: "letterhead-header.webp",
    description:
      "Letterheads, notepads, bookmarks, stickers — the credible everyday proof of a working identity.",
  },
  [`${CAT}/Certificates`]: {
    order: 11,
    cover: "participation-certificate.webp",
    description:
      "What a student leaves holding. One certificate architecture; variants per campus, course and hiring partner.",
  },
  [`${CAT}/Socials & Screens`]: {
    order: 12,
    cover: "alfa-romeo-question.webp",
    description:
      "The Guess-the-Logo brand-literacy series, the story/post template system, and the screens between meetings.",
    captions: {
      "alfa-romeo-question.webp": "Brand literacy — question by day…",
      "alfa-romeo-answer.webp": "…answer by night: Alfa Romeo, and its first two F1 titles.",
      "citibank-question.webp": "Brand literacy — a banking identity.",
      "citibank-answer.webp": "Citibank, revealed.",
      "story-frame-i.webp": "Story frame system.",
      "story-frame-ii.webp": "Story frame system.",
      "story-frame-iii.webp": "Story frame system.",
      "post-template-i.webp": "Post template.",
      "post-template-ii.webp": "Post template.",
      "square-post.webp": "Square post.",
      "square-post-ii.webp": "Square post.",
      "story-launch.webp": "Launch story.",
      "portrait-post-iisa.webp": "Portrait post — IISA palette.",
      "portrait-post-iism.webp": "Portrait post — IISM palette.",
      "birthday-template.webp": "Birthday template.",
      "teams-call-backdrop.webp": "Teams call backdrop.",
      "video-frame-backdrop.webp": "Video-call frame backdrop.",
    },
  },
  [`${CAT}/Photography`]: {
    order: 13,
    cover: "automation-lab-training.webp",
    description:
      "Real campus, real labs, and the work photographed in place. No stock, ever.",
  },
};

/* ── run ──────────────────────────────────────────────────────────────── */

const ensure = (p) => fs.mkdirSync(p, { recursive: true });
let ok = 0, fail = 0, skipped = 0;

// The catalogue rework replaces the sections tree and the old photography
// collection — remove them so stale folders can't resurface as content.
// (Films were moved into catalogue/Films before this edition runs.)
for (const stale of ["sections", "photography"]) {
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
  const to = path.join(DEST, dir, "_meta.json");
  ensure(path.dirname(to));
  fs.writeFileSync(to, JSON.stringify(meta, null, 2) + "\n");
}

console.log(`\nDone. ${ok} ok, ${skipped} skipped (existing videos), ${fail} failed.`);
if (fail > 0) process.exit(1);
