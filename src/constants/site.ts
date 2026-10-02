/**
 * Site-level identity / contact constants.
 *
 * Used by the hero identity header and the footer (and any future component
 * that needs the owner's details). One place to update them.
 *
 * NOTE: replace the placeholder profile URLs below with the real ones, and drop
 * a `resume.pdf` into /public for the Resume link.
 */

export const SITE = {
  name: "Shrey Singh",
  /** Script monogram shown in the hero identity mark. */
  monogram: "SS",
  role: "Visual Communication Designer",
  email: "shrey107@gmail.com",
  /** ⚠ EMPTY until the owner supplies it — the footer hides the row while it
   *  is. Write it as dialled internationally, e.g. "+91 98765 43210"; the
   *  tel: link strips the spaces. */
  phone: "",
  /** The site's own domain (GoDaddy → GitHub Pages, 2026-10-02). */
  website: "https://shrey107.com",
  /** Full URLs so they can be used directly as hrefs. */
  linkedin: "https://www.linkedin.com/in/shrey-singh",
  behance: "https://www.behance.net/shrey-singh",
  /** Served from /public — add the file when ready. */
  resume: "/resume.pdf",
  /** The year the site launched — used for the copyright range. */
  inceptionYear: 2026,
} as const;
