/**
 * NewsMobile — bespoke page configuration.
 *
 * Two years on a digital newsroom's masthead, designing the graphics that carry
 * a story in a single frame. Told by editorial kind rather than by date, since
 * the constraint — a reader moving fast — was always the same. Plates come from
 * scripts/prepare-newsmobile-experience.mjs (source: D:/Assets/Clients/Newsmobile+).
 *
 * The two "DC_" scans are academic type posters (one credited to Shrey Dagar,
 * PG-1 VC) and stay out of this client room.
 */

import type { CaseStudyConfig } from "@/types/caseStudy";

export const NEWSMOBILE_EXPERIENCE: CaseStudyConfig = {
  slug: "newsmobile",
  eyebrow: "Client — Digital news",
  title: "NewsMobile",
  tagline: "Graphics built to survive the scroll.",
  intro:
    "Designing for a newsroom means designing for a thumb already lifting. Every card had to land its point before it left the screen — and still look like NewsMobile while doing it. Two years of that discipline: the numbers made shareable, the moment framed, the read that earns the follow.",
  metaLines: ["newsmobile.in · newsmobile.asia", "Gurugram, Haryana", "2016 — 2018"],
  logo: "/content/career/newsmobile.png",
  // The newsroom's own colour-bars ident, run as a muted wash behind the room.
  backdrop: {
    src: "/content/clients/newsmobile/brand/backdrop.mp4",
    poster: "/content/clients/newsmobile/brand/backdrop-poster.jpg",
  },
  footerNote: "NewsMobile — digital news graphics, 2016–2018",
  categories: [
    {
      id: "data",
      folder: "data",
      name: "Data journalism",
      kind: "Data infographics",
      headline: "Numbers you actually read.",
      challenge:
        "Government releases and safety reports arrive as tables nobody shares. The job was to turn a spreadsheet into a single image that stops the scroll and makes one statistic impossible to ignore.",
      description:
        "Stat-forward infographics — road-safety casualties, fuel-price movements — on a strict red/black/white system so the number leads and the source still reads. Designed for the share, not the archive.",
      accent: "#D0342C",
    },
    {
      id: "quotes",
      folder: "quotes",
      name: "The news card",
      kind: "News & quote cards",
      headline: "A soundbite, framed.",
      challenge:
        "Breaking moments needed a repeatable frame — a leader's line, a policy, an event — produced under deadline and instantly recognisable as NewsMobile in a feed full of lookalikes.",
      description:
        "Event and quote cards on a fixed grid, so they could be made fast and still feel composed: a cut-out portrait, the pulled line, the story's objects massed below. The GST-launch card is the template at work.",
      accent: "#B8862B",
    },
    {
      id: "explainers",
      folder: "explainers",
      name: "Explainers & lists",
      kind: "Explainers & listicles",
      headline: "The scroll-stopping explainer.",
      challenge:
        "Not every post is breaking news — some are the reads that earn the follow. These had to be genuinely useful or genuinely fun, and pack a whole profile or list into one shareable strip.",
      description:
        "Profiles and listicles — who the world's richest man is, how to hold a drink like Bond — built as tall, scannable frames with a clear top-to-bottom read. A lighter register, the same discipline.",
      accent: "#2B6CB0",
    },
  ],
};
