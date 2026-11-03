/**
 * Site-level identity / contact constants.
 *
 * Used by the hero identity header and the footer (and any future component
 * that needs the owner's details). One place to update them.
 *
 * The LinkedIn link is the owner's own (2026-11-02); Behance, a placeholder,
 * came off on 2026-11-03 (owner: "remove Behance"). The resume is
 * /public/resume.pdf.
 */

export const SITE = {
  name: "Shrey Singh",
  /** The one word under the name on the landing's first slide (owner,
   *  2026-10-03) — `role` is the long form. */
  title: "Designer",
  /** The line under the name — on the first slide and in About me (owner,
   *  2026-10-26: "title under my name will be Brand Designer & AI
   *  Generalist"; "Designer & AI Filmmaker" from 2026-10-15). */
  tagline: "Brand Designer & AI Generalist",
  /** The edition on the landing's PORTFOLIO mark. */
  edition: "2026",
  /** Script monogram shown in the hero identity mark. */
  monogram: "SS",
  role: "Visual Communication Designer",
  email: "shrey107@gmail.com",
  /** ⚠ EMPTY until the owner supplies it — the footer hides the row while it
   *  is. Write it as dialled internationally, e.g. "+91 98765 43210"; the
   *  tel: link strips the spaces. */
  phone: "",
  /** WhatsApp (owner, 2026-10-13): the chat link, and the number as shown. */
  whatsapp: "https://wa.me/919871546175",
  whatsappNumber: "+91 98715 46175",
  /** Where the owner is based (owner, 2026-11-03: "i have moved to Gurgaon"). */
  city: "Gurgaon",
  region: "Haryana",
  country: "India",
  /** The site's own domain (GoDaddy → GitHub Pages, 2026-10-02). */
  website: "https://shrey107.com",
  /** Full URLs so they can be used directly as hrefs. */
  /** The owner's own (2026-11-02); "/in/shrey-singh", a placeholder, until then. */
  linkedin: "https://www.linkedin.com/in/shrey-singh-0ba03545/",
  /** Served from /public — add the file when ready. */
  resume: "/resume.pdf",
  /** The year the site launched — used for the copyright range. */
  inceptionYear: 2026,
} as const;
