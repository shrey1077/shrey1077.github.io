/**
 * seo — what the site says about itself to search engines and link previews
 * (Step 4 of the improvement plan, 2026-10-13).
 *
 *   · The title: "Shrey Singh — Visual Communication Designer" on the home
 *     page; every other page "<its own> — Shrey Singh" (the layout's
 *     template).
 *   · The description, in the owner's voice: an archive and an experience —
 *     no services, no pitch.
 *   · The link preview (Open Graph / Twitter): 1200×630 JPEGs, drawn from the
 *     site's own artwork by scripts/make-og-images.mjs — the site's one in
 *     public/og/, each client page's in public/og/clients/.
 *   · A canonical URL on every page, so the trailing-slash and bare forms of
 *     an address count as one.
 */

import type { Metadata } from "next";
import { SITE } from "@/constants/site";

export const SITE_TITLE = `${SITE.name} — ${SITE.role}`;

/** ⚠ A DRAFT for the owner to approve or rewrite (160 characters — about what
 *  a search result shows). */
export const SITE_DESCRIPTION =
  "An archive of my design work — identities, campaigns, publications and art — built as an experience: walk through the logic and the creative halves of my brain.";

export interface PreviewImage {
  url: string;
  width: number;
  height: number;
  alt: string;
}

/** The site's own preview: the portrait, split as on the first screen. */
export const SITE_IMAGE: PreviewImage = {
  url: "/og/og-image.jpg",
  width: 1200,
  height: 630,
  alt: "Shrey Singh — a portrait split into a circuit half and a paint half",
};

/** Client pages that have a preview card of their own (public/og/clients/). */
const CLIENT_CARDS = new Set(["tata-iis", "azoth-biotech", "abs", "zabraku-media", "uid", "newsmobile"]);

export function clientImage(slug: string, name: string): PreviewImage {
  if (!CLIENT_CARDS.has(slug)) return SITE_IMAGE;
  return { url: `/og/clients/${slug}.jpg`, width: 1200, height: 630, alt: `${name} — work by Shrey Singh` };
}

/**
 * A page's metadata: its title (the layout adds " — Shrey Singh"; none keeps
 * the site's own), description, canonical address and link preview.
 * `path` is the page's address with its trailing slash ("/clients/uid/").
 */
export function pageMeta({
  title,
  description = SITE_DESCRIPTION,
  path,
  image = SITE_IMAGE,
}: {
  title?: string;
  description?: string;
  path: string;
  image?: PreviewImage;
}): Metadata {
  const full = title ? `${title} — ${SITE.name}` : SITE_TITLE;
  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SITE.name,
      locale: "en_IN",
      url: path,
      title: full,
      description,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: full,
      description,
      images: [{ url: image.url, alt: image.alt }],
    },
  };
}
