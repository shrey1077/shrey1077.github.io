/**
 * ExperienceSection — the rail+body shell every experience section sits in.
 *
 * (Generalized from Phase 2.5's ClientSection into the experience framework.)
 * Mirrors the preview sheet's language: a two-digit index and title (logic
 * voice) with an optional description on the left, the section body on the
 * right. The optional `anchor` id makes the section a jump target for
 * ExperienceNavigation. Pure server-renderable markup.
 */

import { typeVoiceClass } from "@/constants/typography";

interface ExperienceSectionProps {
  /** Two-digit section index ("01" … ). */
  index: string;
  title: string;
  description?: string;
  /** DOM id for in-page navigation (ExperienceNavigation anchors). */
  anchor?: string;
  children: React.ReactNode;
}

export function ExperienceSection({
  index,
  title,
  description,
  anchor,
  children,
}: ExperienceSectionProps) {
  return (
    <section
      id={anchor}
      // scroll-mt keeps anchored jumps from landing flush against the viewport top.
      className="scroll-mt-10 border-t border-neutral-200 py-16 sm:py-20"
    >
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,17rem)_1fr] lg:gap-16">
        <div>
          <span
            className={`${typeVoiceClass("logic", "meta")} text-xs text-neutral-400`}
          >
            {index}
          </span>
          <h2
            className={`${typeVoiceClass("logic", "display")} mt-3 text-2xl font-medium text-neutral-900 sm:text-3xl`}
          >
            {title}
          </h2>
          {description && (
            <p className="mt-5 max-w-[16rem] text-sm leading-relaxed text-neutral-500">
              {description}
            </p>
          )}
        </div>

        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}
