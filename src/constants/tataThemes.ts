/**
 * The three Tata IIS voices, as the theme slider uses them.
 *
 * One definition shared by the Brand Guidelines switch and by every section
 * slider under The Work, so a colour or a mark is changed in one place. The
 * hexes are lifted from TATA_GUIDELINES rather than retyped.
 *
 * ⚠ IISM's ground is `colours[1]` — the teal. `colours[0]` is the violet.
 */

import { TATA_GUIDELINES } from "@/constants/tataExperience";

/** House cap on any one deck. The mockup folders run to 30+ per campus and a
 *  tray that long is a scrollbar, not a choice. */
export const THEME_SLIDER_MAX = 12;

export const TATA_THEMES = [
  { id: "tata", label: "Tata IIS", logo: TATA_GUIDELINES.wordmark, bg: "#000000" },
  { id: "iisa", label: "IIS Ahmedabad", logo: TATA_GUIDELINES.iisa.logo, bg: TATA_GUIDELINES.iisa.colours[0].hex },
  { id: "iism", label: "IIS Mumbai", logo: TATA_GUIDELINES.iism.logo, bg: TATA_GUIDELINES.iism.colours[1].hex },
] as const;
