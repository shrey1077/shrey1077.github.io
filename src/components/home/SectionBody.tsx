"use client";

/**
 * SectionBody — what a section shows once it has taken over the panel area.
 *
 * Split out of SectionPanels so the same content can be rendered inside the
 * expanding overlay rather than inside its own row.
 */

import { motion, useReducedMotion } from "framer-motion";
import { clientsInSection } from "@/constants/clients";
import { BrandCardSlider } from "@/components/home/BrandCardSlider";
import { LogofolioGrid } from "@/components/home/LogofolioGrid";
import { CareerTimeline } from "@/components/home/CareerTimeline";
import type { ArtCollection, LogoMark } from "@/content/catalogue";
import { ArtCollections } from "@/components/home/ArtCollections";
import { DURATION, EASE_OUT } from "@/constants/motion";
import { typeVoiceClass } from "@/constants/typography";
import type { NavSectionId } from "@/types/navigation";

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
  artCollections,
  logos,
}: {
  id: NavSectionId;
  artCollections: ArtCollection[];
  logos: LogoMark[];
}) {
  const reduceMotion = useReducedMotion();

  if (id === "clients" || id === "projects") {
    return <BrandCardSlider entries={clientsInSection(id)} />;
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
    return <ArtCollections collections={artCollections} />;
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
