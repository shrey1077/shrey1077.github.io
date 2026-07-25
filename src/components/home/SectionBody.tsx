"use client";

/**
 * SectionBody — what a section shows once it has taken over the panel area.
 *
 * Split out of SectionPanels so the same content can be rendered inside the
 * expanding overlay rather than inside its own row.
 */

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { clientsInSection } from "@/constants/clients";
import { BrandCardSlider } from "@/components/home/BrandCardSlider";
import { LogofolioGrid } from "@/components/home/LogofolioGrid";
import { CareerTimeline } from "@/components/home/CareerTimeline";
import type { LogoMark } from "@/content/catalogue";
import { DURATION, EASE_OUT } from "@/constants/motion";
import { typeVoiceClass } from "@/constants/typography";
import type { NavSectionId } from "@/types/navigation";

/** An art piece for the Art panel's preview strip (from public/content/art). */
export interface ArtPreview {
  name: string;
  url: string;
}

/** Typographic stand-ins shown while public/content/art is empty. */
const ART_PLACEHOLDER_PLATES = [
  { title: "Study 01", medium: "graphite on paper" },
  { title: "Bloom Series", medium: "acrylic & ink" },
  { title: "Night Field", medium: "mixed media" },
] as const;

const riseIn = (reduce: boolean, delay = 0) =>
  reduce
    ? {}
    : {
        initial: { opacity: 0, y: 14 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: DURATION.medium, ease: EASE_OUT, delay },
      };

export function SectionBody({
  id,
  onClientPick,
  artPreviews,
  logos,
}: {
  id: NavSectionId;
  onClientPick: (slug: string) => void;
  artPreviews: ArtPreview[];
  logos: LogoMark[];
}) {
  const reduceMotion = useReducedMotion();

  if (id === "clients" || id === "projects") {
    return <BrandCardSlider entries={clientsInSection(id)} onPick={onClientPick} />;
  }

  if (id === "logofolio") {
    return (
      <div className="h-full min-h-0 overflow-y-auto">
        <LogofolioGrid logos={logos} />
      </div>
    );
  }

  if (id === "career-path") {
    return <CareerTimeline />;
  }

  if (id === "art") {
    return (
      <div className="flex h-full min-h-0 items-stretch gap-3">
        <div className="grid min-h-0 flex-1 grid-cols-3 gap-2">
          {artPreviews.length > 0
            ? artPreviews.slice(0, 3).map((piece, i) => (
                <motion.span
                  key={piece.url}
                  {...riseIn(!!reduceMotion, 0.15 + i * 0.07)}
                  className="relative min-h-0 overflow-hidden border border-white/25 bg-black/10"
                >
                  <Image
                    src={piece.url}
                    alt={piece.name}
                    fill
                    sizes="(min-width: 1024px) 20vw, 30vw"
                    className="object-cover transition-transform duration-700 hover:scale-105"
                  />
                </motion.span>
              ))
            : ART_PLACEHOLDER_PLATES.map((plate, i) => (
                <motion.span
                  key={plate.title}
                  {...riseIn(!!reduceMotion, 0.15 + i * 0.07)}
                  className="flex min-h-0 flex-col justify-end gap-0.5 border border-white/25 bg-black/10 px-3 py-2 backdrop-blur-[2px]"
                >
                  <span className={`${typeVoiceClass("creative", "display")} text-sm leading-tight text-white sm:text-base`}>
                    {plate.title}
                  </span>
                  <span className={`${typeVoiceClass("logic", "meta")} text-[0.5rem] text-white/70`}>
                    {plate.medium}
                  </span>
                </motion.span>
              ))}
        </div>
        <motion.span {...riseIn(!!reduceMotion, 0.4)} className="flex shrink-0 items-center">
          <Link
            href="/clients"
            className={`${typeVoiceClass("creative", "label")} group/gal inline-flex items-center gap-2 rounded-full border border-white/70 px-5 py-2 text-sm text-white outline-none transition-colors duration-500 hover:bg-white hover:text-neutral-900`}
          >
            Enter the gallery
            <span aria-hidden className="inline-block transition-transform duration-500 group-hover/gal:translate-x-1">
              →
            </span>
          </Link>
        </motion.span>
      </div>
    );
  }

  return (
    <motion.p
      {...riseIn(!!reduceMotion, 0.2)}
      className={`${typeVoiceClass("creative", "meta")} max-w-xl text-base text-white/80`}
    >
      Coming soon — this room is still being hung.
    </motion.p>
  );
}
