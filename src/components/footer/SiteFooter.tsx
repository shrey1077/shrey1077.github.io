/**
 * SiteFooter — the minimal ~10vh footer (per the design mockup).
 *
 * A Server Component (no interactivity): copyright on the left; email,
 * LinkedIn, Behance, and Resume on the right, separated by hairline dividers.
 * Everything from the `SITE` constants. Nothing else.
 */

import { SITE } from "@/constants/site";

const LINKS: { label: string; href: string; external: boolean }[] = [
  { label: SITE.email, href: `mailto:${SITE.email}`, external: false },
  { label: "LinkedIn", href: SITE.linkedin, external: true },
  { label: "Behance", href: SITE.behance, external: true },
  { label: "Resume", href: SITE.resume, external: true },
];

export function SiteFooter() {
  const year = new Date().getFullYear();
  const copyrightYears =
    year > SITE.inceptionYear ? `${SITE.inceptionYear}–${year}` : `${year}`;

  return (
    <footer className="flex min-h-[10vh] w-full items-center border-t border-neutral-200 bg-white px-6 py-6 sm:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-4 text-sm text-neutral-500 sm:flex-row sm:items-center">
        <span className="text-neutral-400">
          © {copyrightYears} {SITE.name}. All rights reserved.
        </span>

        <nav aria-label="Contact" className="flex flex-wrap items-center gap-x-3 gap-y-2">
          {LINKS.map((link, i) => (
            <span key={link.label} className="flex items-center gap-x-3">
              {i > 0 && (
                <span aria-hidden className="text-neutral-300">
                  |
                </span>
              )}
              <a
                href={link.href}
                {...(link.external
                  ? { target: "_blank", rel: "noreferrer noopener" }
                  : {})}
                className="transition-colors duration-300 hover:text-neutral-900"
              >
                {link.label}
              </a>
            </span>
          ))}
        </nav>
      </div>
    </footer>
  );
}
