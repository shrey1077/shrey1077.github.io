/**
 * SiteFooter — the closing band: name, portrait, contact.
 *
 * Three columns on a wide screen — the owner's name on the left, the portrait
 * orb centred, contact and the rest of the details on the right — collapsing
 * to a single centred stack below `md`.
 *
 * The two halves speak in the two hemisphere faces, which is the same split
 * the landing makes and the same one the orb itself draws:
 *   • name    → `font-digibra`, the logic face
 *   • contact → `font-graff` (Juturu), the creative face
 * Each uses its extra-bold for the label and its regular for the value.
 *
 * ⚠ Digibra's @font-face declares `font-weight: 400 700`, so `font-extrabold`
 * (800) CLAMPS to 700 — it renders at the face's own ceiling rather than being
 * synthesised into a fake bold. That is the intended look; do not "fix" it by
 * reaching for a heavier weight that does not exist in the file. Juturu is a
 * 100–900 variable, so its 800 is real.
 *
 * Still a Server Component. `PortraitOrb` is the only client part, and it
 * brings its own boundary.
 */

import { PortraitOrb } from "@/components/home/PortraitOrb";
import { FooterLiquidGrid } from "@/components/footer/FooterLiquidGrid";
import { SITE } from "@/constants/site";

const LINKS: { label: string; value: string; href: string; external: boolean }[] = [
  { label: "Email", value: SITE.email, href: `mailto:${SITE.email}`, external: false },
  { label: "LinkedIn", value: "/shrey-singh", href: SITE.linkedin, external: true },
  { label: "Behance", value: "/shrey-singh", href: SITE.behance, external: true },
  { label: "Resume", value: "Download PDF", href: SITE.resume, external: true },
];

/** The name is split so each half can take its own weight. */
const [FIRST, ...REST] = SITE.name.split(" ");

export function SiteFooter() {
  const year = new Date().getFullYear();
  const copyrightYears =
    year > SITE.inceptionYear ? `${SITE.inceptionYear}–${year}` : `${year}`;

  return (
    <footer className="relative isolate w-full border-t border-neutral-200 bg-gallery px-6 py-12 sm:px-10">
      {/* The rippling dot ground. ⚠ `relative isolate` above exists FOR this:
          `relative` gives the absolutely-positioned canvas something to fill,
          and `isolate` opens a stacking context so its negative z-index cannot
          escape behind the page itself. It adds no height — see the component.
          Everything below stays exactly where it was. */}
      <FooterLiquidGrid />
      <div className="relative mx-auto grid w-full max-w-7xl items-center justify-items-center gap-10 md:grid-cols-[1fr_auto_1fr] md:gap-8">
        {/* Name — logic face, left. */}
        <div className="font-digibra text-center md:justify-self-start md:text-left">
          <p className="text-[clamp(1.7rem,3.4vw,2.9rem)] leading-[1.05] text-neutral-900">
            <span className="font-extrabold">{FIRST}</span>{" "}
            <span className="font-normal">{REST.join(" ")}</span>
          </p>
          <p className="mt-2 text-[0.72rem] font-normal uppercase tracking-[0.2em] text-neutral-400">
            {SITE.role}
          </p>
        </div>

        {/* The portrait, centred. Follows the pointer exactly as it did on the
            landing — it is the same component, only re-homed. */}
        <div className="w-[clamp(15rem,30vw,22rem)]">
          <PortraitOrb />
        </div>

        {/* Contact — creative face, right. */}
        <div className="font-graff w-full max-w-xs text-center md:justify-self-end md:text-right">
          <p className="text-[0.72rem] font-extrabold uppercase tracking-[0.2em] text-neutral-900">
            Get in touch
          </p>
          <ul className="mt-3 space-y-1.5">
            {LINKS.map((link) => (
              <li key={link.label} className="text-[0.95rem] leading-snug">
                <span className="font-extrabold text-neutral-800">{link.label}</span>
                <span aria-hidden className="px-1.5 font-normal text-neutral-300">
                  ·
                </span>
                <a
                  href={link.href}
                  {...(link.external
                    ? { target: "_blank", rel: "noreferrer noopener" }
                    : {})}
                  className="font-normal text-neutral-500 underline-offset-4 transition-colors duration-300 hover:text-neutral-900 hover:underline"
                >
                  {link.value}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="font-graff relative mx-auto mt-10 w-full max-w-7xl text-center text-[0.7rem] font-normal text-neutral-400">
        © {copyrightYears} {SITE.name}. All rights reserved.
      </p>
    </footer>
  );
}
