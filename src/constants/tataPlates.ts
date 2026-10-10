/**
 * Turning the Tata IIS page's files into PLATES — the full file for the
 * viewer, its thumbnail for the walls (2026-10-05). Server-side only: it
 * reads the thumbnail manifest, which is large.
 */

import type { TataPlate } from "@/components/client/tata/TataViewer";
import { TATA_THUMBS } from "@/constants/tataThumbs";

/** The manifest's key for a url, however the url was spelled — the
 *  catalogue reader encodes every segment, hand-written urls do not. */
const keyOf = (url: string) =>
  "/" +
  url
    .split("/")
    .filter(Boolean)
    .map((s) => encodeURIComponent(decodeURIComponent(s)))
    .join("/");

/** A file as a plate. A file the manifest does not know (added since
 *  scripts/prepare-tata-thumbs.mjs last ran) shows full size, at 3:2. */
export function tataPlate(url: string, name: string, size?: { w: number; h: number }): TataPlate {
  const t = TATA_THUMBS[keyOf(url)];
  return { url, thumb: t?.src ?? url, name, w: size?.w ?? t?.w ?? 3, h: size?.h ?? t?.h ?? 2 };
}

/** Something to call a piece with no caption, from its file name: the theme
 *  prefix and the folder's own name dropped, the rest in words —
 *  "iism-billboards-and-signages-exterior-mockup-4" → "Exterior mockup 4". */
export function pieceName(file: string): string {
  const words = file
    .replace(/^(tata|iisa|iism)-/, "")
    .replace(/^billboards-and-signages-/, "")
    .replace(/[-_]+/g, " ")
    .trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}
