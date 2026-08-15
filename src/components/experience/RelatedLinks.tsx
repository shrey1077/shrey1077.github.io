/**
 * RelatedLinks — the small circular marks that close a page.
 *
 * A page in one client's room often shows work that has its own room elsewhere:
 * Zabraku's deck contains the ABS Wholesale identity, and the RK Entertainment
 * case study it built. Rather than say so in prose, the end of the page carries
 * the marks themselves as circles, each linking through.
 *
 * The circles sit on a DARK plate on purpose. Both marks here are light or gold
 * artwork on transparency, which is invisible on white, and the block sits
 * directly above the (dark) footer so the page closes on one dark passage
 * rather than flickering white-dark-white.
 */

import Image from "next/image";
import Link from "next/link";
import { typeVoiceClass } from "@/constants/typography";

export interface RelatedLink {
  /** Where it goes — an internal route. */
  href: string;
  /** Read out to screen readers and shown under the circle. */
  label: string;
  /** The mark itself, under /public. */
  logo: string;
  /** Percentage of the circle the mark should occupy, for marks whose ink
   *  sits small inside their own bounding box. Defaults to 58. */
  scale?: number;
  /** The disc behind the mark. "light" for artwork that comes on its own white
   *  ground — it would otherwise show as a white rectangle inside a dark
   *  circle. "dark" (the default) for artwork cut onto transparency. */
  plate?: "light" | "dark";
}

export function RelatedLinks({ links }: { links: RelatedLink[] }) {
  if (links.length === 0) return null;

  return (
    <section
      aria-label="Related links"
      className="mt-16 rounded-none bg-neutral-950 px-6 py-10 sm:px-10"
    >
      <p
        className={`${typeVoiceClass("logic", "meta")} text-[0.6rem] text-neutral-400`}
      >
        Related Links:
      </p>

      <ul className="mt-6 flex flex-wrap items-start gap-8">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              aria-label={link.label}
              className="group flex flex-col items-center gap-3 outline-none"
            >
              <span
                className={`relative grid size-16 place-items-center overflow-hidden rounded-full border border-white/20 transition-colors duration-300 group-hover:border-white/60 group-focus-visible:border-white sm:size-20 ${
                  link.plate === "light" ? "bg-white" : "bg-white/[0.06]"
                }`}
              >
                <span
                  className="relative block"
                  style={{
                    width: `${link.scale ?? 58}%`,
                    height: `${link.scale ?? 58}%`,
                  }}
                >
                  <Image
                    src={link.logo}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-contain"
                  />
                </span>
              </span>
              <span
                className={`${typeVoiceClass("logic", "meta")} text-[0.55rem] text-neutral-400 transition-colors duration-300 group-hover:text-white group-focus-visible:text-white`}
              >
                {link.label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
