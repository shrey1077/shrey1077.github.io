/**
 * PublicationPages — a document, page after page.
 *
 * Deliberately a Server Component with no interactivity. A reader for a 30-page
 * study wants to be a column you scroll and nothing else: no page-turn
 * animation to wait through, no viewer to open, no state to lose when you come
 * back. Each page is numbered beneath itself, so the position is always legible
 * without a counter that has to track scroll.
 *
 * ⚠ Sizes are `unoptimized` project-wide (next.config: output "export"), so the
 * only real lever on weight is lazy loading. The first two pages load eagerly —
 * a cover that fades in after the scroll has already started reads as broken —
 * and everything after is lazy.
 *
 * ⚠ Page aspect varies BETWEEN documents (A5 portrait, landscape zine) and
 * occasionally within one. Nothing here fixes an aspect ratio: `h-auto` with a
 * declared intrinsic size lets each page arrive at its own shape, which is why
 * the width cap is on the column rather than on the image.
 */

import Image from "next/image";

export function PublicationPages({
  pages,
  title,
  accent,
}: {
  pages: string[];
  /** Used for the page alt text, so a screen reader hears which document. */
  title: string;
  accent: string;
}) {
  return (
    <div className="py-12">
      <ol className="mx-auto flex w-full max-w-3xl flex-col gap-10">
        {pages.map((src, i) => (
          <li key={src} className="flex flex-col gap-2">
            <div className="overflow-hidden rounded-sm bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06),0_12px_32px_-12px_rgba(0,0,0,0.18)]">
              <Image
                src={src}
                alt={`${title}, page ${i + 1} of ${pages.length}`}
                width={1400}
                height={1980}
                sizes="(min-width: 768px) 48rem, 100vw"
                loading={i < 2 ? "eager" : "lazy"}
                priority={i === 0}
                className="h-auto w-full"
              />
            </div>
            <span
              className="text-[0.62rem] uppercase tracking-[0.16em] text-neutral-400"
              style={i === 0 ? { color: accent } : undefined}
            >
              {String(i + 1).padStart(2, "0")} / {String(pages.length).padStart(2, "0")}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
