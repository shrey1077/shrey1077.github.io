/**
 * The kit — the things the right side's work is made with, by hand: the
 * counterpart of My Stack (constants/tools.ts) on the left (owner,
 * 2026-10-15: "Its counterpart on right side corner … will be my tools,
 * (Camera Nikon z50, calligraphy set, paint brushes etc.)").
 *
 * ⚠ The first three are the owner's; the rest are filled in from what the Arts
 * & Crafts collections show being made (Painting, Ink and Pattern, Drawing
 * Studies, Sketchbooks, Model Making) — check them, and edit here.
 */

export type KitIcon = "camera" | "nib" | "brush" | "palette" | "pencil" | "cutter";

export interface KitItem {
  name: string;
  /** What it is for, in a line. */
  note: string;
  icon: KitIcon;
}

export const KIT: { label: string; items: KitItem[] }[] = [
  {
    label: "Capture",
    items: [{ name: "Nikon Z50", note: "Mirrorless camera — field photographs and reference", icon: "camera" }],
  },
  {
    label: "Letter",
    items: [{ name: "Calligraphy set", note: "Nibs, holders and ink", icon: "nib" }],
  },
  {
    label: "Paint",
    items: [
      { name: "Paint brushes", note: "Rounds and flats, for paint and ink", icon: "brush" },
      { name: "Paints", note: "Acrylic and watercolour", icon: "palette" },
    ],
  },
  {
    label: "Draw & make",
    items: [
      { name: "Sketchbooks & pencils", note: "Graphite and fine liners", icon: "pencil" },
      { name: "Craft kit", note: "Cutter, steel rule and mat — for models", icon: "cutter" },
    ],
  },
];
