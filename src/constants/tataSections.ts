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

/* ── brand lanes ──────────────────────────────────────────────────────────
 * The grid reads as three vertical lanes: column 1 is the parent Tata IIS
 * mark, column 2 IIS Ahmedabad, column 3 IIS Mumbai. A tile at rest previews
 * only its own lane's artwork; opening it shows the whole subsection ordered
 * Tata IIS → IISA → IISM, so the hierarchy holds inside the panel too.        */

export type TataBrand = "tata" | "iisa" | "iism";

/** Lane order, and the order assets are sorted into inside an open panel. */
export const BRAND_LANES: TataBrand[] = ["tata", "iisa", "iism"];

/** Which campus an asset belongs to, read off its filename. The pipeline
 *  slugifies source names, so campus markers survive as words ("mumbai-back",
 *  "collateral-iisa-notepad-cover"). A file carrying BOTH campuses is shared
 *  artwork and belongs to the parent. */
export function brandOf(assetName: string): TataBrand {
  const s = `-${assetName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-`;
  const iisa = ["iisa", "-ahmedabad-", "-ahm-", "-ahd-", "-amd-"].some((m) => s.includes(m));
  const iism = ["iism", "-mumbai-", "-mum-"].some((m) => s.includes(m));
  if (iisa && !iism) return "iisa";
  if (iism && !iisa) return "iism";
  return "tata";
}

/** The 150-word note that opens the work — what the role actually was. */
export const TATA_WORK_INTRO =
  "I joined Tata IIS as its first designer and left as Lead Manager, having built the institute's visual identity from the wordmark outward. Two campuses opened in that window — Ahmedabad and Mumbai — and each needed a dialect of its own without breaking from the parent mark. So the work ran in three voices at once: Tata IIS, IIS Ahmedabad, IIS Mumbai. I wrote the logo rulebooks, set the colour and typography law, and then applied it across everything the institute touches — visiting cards, trainee IDs, certificates, brochures, campus posters, fifteen-foot ceremony backdrops, lab boards, the social system, website banners and the films. Much of it was made alongside the people who would use it: instructors, admissions staff, the photography I shot on campus myself. What follows is that system in use, grouped by medium and read left to right in the order the brand is built.";

export const TATA_SECTIONS: TataSection[] = [
  {
    id: "digital",
    title: "Digital",
    blurb: "The brand on screen — staged, posted, published and pitched.",
    accent: "#0E7C66",
    items: [
      { label: "Mockups", folder: "mockups" },
      { label: "Website Banners", folder: "website-banners" },
      { label: "Socials", folder: "socials-and-screens" },
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
    id: "photo-videography",
    title: "Photo / Videography",
    blurb: "Real campus, real labs, the work photographed and filmed in place. No stock, ever.",
    accent: "#3F4756",
    items: [
      { label: "Photography", folder: "photography" },
      // The films folder feeds two subsections — the published channel pieces
      // sit under Digital, the shot-on-campus footage here.
      {
        label: "Videography",
        folder: "films",
        pick: ["additive-manufacturing-timelapse", "skills-conclave-2025"],
      },
    ],
  },
  {
    id: "proposals",
    title: "Proposals",
    blurb: "Work that ran ahead of the brief — put forward, not yet commissioned.",
    accent: "#5B3F86",
    items: [
      { label: "Proposed Brand System", note: "No source files supplied yet." },
      { label: "Proposed Website", note: "No source files supplied yet." },
      { label: "Proposed Brochure — Trifold", note: "No source files supplied yet." },
    ],
  },
  {
    id: "ai-solutions",
    title: "AI Solutions",
    blurb: "Tools built to take the repetitive work off the studio's hands.",
    accent: "#1F5FA8",
    items: [
      { label: "Cerci — Certificate Maker", note: "No source files supplied yet." },
      { label: "H3LEN — Hyper 3D Landscape Environment", note: "No source files supplied yet." },
      { label: "Screensaver", note: "No source files supplied yet." },
    ],
  },
];
