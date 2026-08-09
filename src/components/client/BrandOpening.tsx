/**
 * BrandOpening — section 01 of a client experience: the brand's opening moment.
 *
 * ⚑ ARCHITECTURAL PLACEHOLDER. The final experience animates the logo's
 * construction from the official guidelines (grid, proportions, spacing,
 * typography, rationale) — that lands when the Logo Guidelines PDF arrives,
 * INSIDE this component, without touching the page around it.
 *
 * Until then: the client's mark sits typographically inside a quiet
 * construction frame — real thirds/center guides drawn as hairlines — hinting
 * at the future system without faking an animation. Drop real logo/guideline
 * assets into `public/content/clients/<slug>/brand/` (docs/CONTENT_GUIDE.md).
 */

import { typeVoiceClass } from "@/constants/typography";

interface BrandOpeningProps {
  /** The text mark shown until real logo assets land. */
  markText: string;
  /** One quiet line about the brand/logo work. */
  note: string;
}

/** Hairline guide inside the construction frame. */
function Guide({ className }: { className: string }) {
  return <span aria-hidden className={`absolute bg-neutral-100 ${className}`} />;
}

export function BrandOpening({ markText, note }: BrandOpeningProps) {
  return (
    <div className="flex flex-col items-center">
      {/* The construction frame — thirds + center guides, like a guidelines page. */}
      <div className="relative flex aspect-[16/9] w-full max-w-3xl items-center justify-center border border-neutral-200">
        <Guide className="left-1/3 top-0 h-full w-px" />
        <Guide className="left-2/3 top-0 h-full w-px" />
        <Guide className="left-0 top-1/3 h-px w-full" />
        <Guide className="left-0 top-2/3 h-px w-full" />
        {/* Center crosshair. */}
        <Guide className="left-1/2 top-1/2 h-6 w-px -translate-x-1/2 -translate-y-1/2 bg-neutral-300" />
        <Guide className="left-1/2 top-1/2 h-px w-6 -translate-x-1/2 -translate-y-1/2 bg-neutral-300" />

        <span
          className={`${typeVoiceClass("creative", "display")} relative text-5xl text-neutral-900 sm:text-6xl`}
        >
          {markText}
        </span>
      </div>

      <p className="mt-8 max-w-md text-center text-sm leading-relaxed text-neutral-500">
        {note}
      </p>

      <span
        className={`${typeVoiceClass("logic", "meta")} mt-4 text-[0.6rem] text-neutral-400`}
      >
        Construction experience — guidelines pending
      </span>
    </div>
  );
}
