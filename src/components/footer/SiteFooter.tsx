/**
 * SiteFooter — the closing band: name and contact.
 *
 * Two columns on a wide screen — the owner's name on the left, contact and
 * the rest of the details on the right — collapsing to a single centred stack
 * below `lg`. The portrait orb and the tool stack that sat between them moved
 * UP to the landing's first slide on 2026-10-03 (owner; HeroStage).
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
 * A Server Component.
 */

import Image from "next/image";
import { AboutFacts } from "@/components/home/AboutFacts";
import { SITE } from "@/constants/site";

/** Contact rows. Gmail, phone and website joined on 2026-10-02; a row whose
 *  value is empty (the phone, until it is supplied) is left out. */
const LINKS: { label: string; value: string; href: string; external: boolean; icon?: string }[] = [
  {
    label: "Gmail",
    value: SITE.email,
    href: `mailto:${SITE.email}`,
    external: false,
    icon: "/content/tools/gmail.svg",
  },
  { label: "Phone", value: SITE.phone, href: `tel:${SITE.phone.replace(/[^\d+]/g, "")}`, external: false },
  { label: "Website", value: SITE.website.replace(/^https?:\/\//, ""), href: SITE.website, external: true },
  { label: "LinkedIn", value: "/shrey-singh", href: SITE.linkedin, external: true },
  { label: "Behance", value: "/shrey-singh", href: SITE.behance, external: true },
  { label: "Resume", value: "Download PDF", href: SITE.resume, external: true },
].filter((l) => l.value);

/** The name is split so each half can take its own weight. */
const [FIRST, ...REST] = SITE.name.split(" ");

export function SiteFooter() {
  const year = new Date().getFullYear();
  const copyrightYears =
    year > SITE.inceptionYear ? `${SITE.inceptionYear}–${year}` : `${year}`;

  return (
    <footer className="w-full border-t border-neutral-200 bg-gallery px-6 py-12 sm:px-10">
      <div className="mx-auto grid w-full max-w-7xl items-center justify-items-center gap-10 lg:grid-cols-2 lg:gap-8">
        {/* Name — logic face, left. */}
        <div className="font-digibra text-center lg:justify-self-start lg:text-left">
          <p className="text-[clamp(1.7rem,3.4vw,2.9rem)] leading-[1.05] text-neutral-900">
            <span className="font-extrabold">{FIRST}</span>{" "}
            <span className="font-normal">{REST.join(" ")}</span>
          </p>
          <p className="mt-2 text-[0.72rem] font-normal uppercase tracking-[0.2em] text-neutral-400">
            {SITE.role}
          </p>
        </div>

        {/* Contact — creative face, right. */}
        <div className="font-graff w-full max-w-xs text-center lg:justify-self-end lg:text-right">
          <p className="text-[0.72rem] font-extrabold uppercase tracking-[0.2em] text-neutral-900">
            Get in touch
          </p>
          <ul className="mt-3 space-y-1.5">
            {LINKS.map((link) => (
              <li key={link.label} className="text-[0.95rem] leading-snug">
                {link.icon && (
                  <Image
                    src={link.icon}
                    alt=""
                    width={14}
                    height={14}
                    className="mr-1.5 inline-block size-3.5 -translate-y-px align-middle"
                  />
                )}
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

      {/* The facts — Chess, Education, Part-time, Hobbies, one section.
          From `lg` they live under the landing's brain (HeroStage); below
          `lg` that band is the brain's lines and the scroll cue, so they are
          carried here instead. */}
      <div className="mx-auto mt-12 flex w-full max-w-md justify-center border-t border-neutral-200 pt-10 lg:hidden">
        <AboutFacts />
      </div>

      <p className="font-graff mx-auto mt-10 w-full max-w-7xl text-center text-[0.7rem] font-normal text-neutral-400">
        © {copyrightYears} {SITE.name}. All rights reserved.
      </p>
    </footer>
  );
}
