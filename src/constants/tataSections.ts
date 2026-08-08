/**
 * Tata IIS — the work, restructured into four fixed headlines.
 *
 * The page used to group the catalogue into four "families" that behaved like
 * an accordion. The client's own taxonomy is flatter and wider: four permanent
 * headlines, each holding a set of named subsections. Headlines never collapse;
 * only the subsection tiles under them open and close.
 *
 * `folder` is a catalogue folder id (`folderToId` of the folder name under
 * `public/content/clients/tata-iis/catalogue/`). A subsection with no `folder`
 * — or one whose folder has no assets yet — renders as a pending tile: present
 * in the grid, labelled, but with no preview. Drop the assets in and it fills
 * itself; nothing here needs editing.
 */

export interface TataSubsection {
  /** Tile label. */
  label: string;
  /** Catalogue folder id backing it. Omitted → nothing shot/designed yet. */
  folder?: string;
  /** Asset base names to take from `folder`, when one folder feeds two
   *  subsections. Omitted → the whole folder. */
  pick?: string[];
  /** Shown on a pending tile in place of a preview. */
  note?: string;
}

export interface TataSection {
  id: string;
  title: string;
  blurb: string;
  accent: string;
  items: TataSubsection[];
}

export const TATA_SECTIONS: TataSection[] = [
  {
    id: "print",
    title: "Print",
    blurb:
      "Ink on every surface the institute owns — a calling card in the hand, a fifteen-foot board on the wall, and the whole system in between.",
    accent: "#B5540F",
    items: [
      { label: "Visiting Cards", folder: "visiting-cards" },
      { label: "ID Cards", folder: "id-cards" },
      { label: "Brochures", folder: "brochures" },
      { label: "Flyers", folder: "flyers-and-campaigns" },
      { label: "Trifolds", folder: "trifolds" },
      { label: "Banners", folder: "banners" },
      { label: "Handbook", folder: "handbook" },
      { label: "Stickers & Notepads", folder: "stickers-and-notepads" },
      { label: "Boards", folder: "boards" },
      { label: "Standees", folder: "lab-standees" },
      { label: "Posters", folder: "campus-posters" },
      { label: "Backgrounds", folder: "backgrounds" },
      { label: "Certificates", folder: "certificates" },
      { label: "Billboards & Signages", folder: "billboards-and-signages" },
      { label: "Event Prints", folder: "events" },
      { label: "Letterheads & Stationery", folder: "stationery" },
    ],
  },
  {
    id: "digital",
    title: "Digital",
    blurb: "The brand on screen — staged, posted, published and pitched.",
    accent: "#0E7C66",
    items: [
      { label: "Mockups", folder: "mockups" },
      { label: "Website Banners", note: "No source files supplied yet." },
      { label: "Socials", folder: "socials-and-screens" },
      // The films folder feeds two subsections — the published channel pieces
      // here, the shot-on-campus footage under Photography & Videography.
      {
        label: "YouTube Videos",
        folder: "films",
        pick: ["one-of-one-msde", "jio-hotstar-spot", "tata-iis-logo-render"],
      },
      { label: "Media Kit", note: "No source files supplied yet." },
      { label: "Presentations", folder: "presentations" },
    ],
  },
  {
    id: "photography-videography",
    title: "Photography & Videography",
    blurb: "Real campus, real labs, the work photographed and filmed in place. No stock, ever.",
    accent: "#3F4756",
    items: [
      { label: "Photography", folder: "photography" },
      {
        label: "Videography",
        folder: "films",
        pick: ["additive-manufacturing-timelapse", "skills-conclave-2025"],
      },
    ],
  },
  {
    id: "misc",
    title: "Misc.",
    blurb: "Tools, experiments and proposals — the work that ran ahead of the brief.",
    accent: "#5B3F86",
    items: [
      { label: "Cerci — Certificate Maker", note: "No source files supplied yet." },
      { label: "H3LEN — Hyper 3D Landscape Environment", note: "No source files supplied yet." },
      { label: "Screensaver", note: "No source files supplied yet." },
      { label: "Proposed Brand System", note: "No source files supplied yet." },
      { label: "Proposed Website", note: "No source files supplied yet." },
      { label: "Proposed Brochure — Trifold", note: "No source files supplied yet." },
    ],
  },
];
