/**
 * RoomPage — the shell of the pages the home page's rooms open in full
 * (2026-10-15): All Works, Arts & Crafts, Writings & Publications and the
 * Extincts. A way back, the room named in its side's face, a line on what it
 * holds, then the room itself — the same component the home page drew as a
 * room until then, untouched.
 *
 * Set in the home page's faces (HOME_TYPE): the logic side's title in Digibra,
 * the creative side's in Syne.
 */

import Link from "next/link";
import { HOME_TYPE } from "@/constants/faces";
import { typeVoiceClass } from "@/constants/typography";

export function RoomPage({
  side,
  eyebrow,
  title,
  description,
  children,
}: {
  side: "logic" | "creative";
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  const creative = side === "creative";
  return (
    <main className={`min-h-dvh w-full bg-neutral-50 px-5 py-10 text-neutral-900 sm:px-10 sm:py-12 ${HOME_TYPE}`}>
      <div className="mx-auto flex w-full max-w-7xl flex-col">
        <Link
          href="/"
          className={`${typeVoiceClass("logic", "meta")} group inline-flex items-center gap-2 self-start text-[0.65rem] text-neutral-400 outline-none transition-colors duration-300 hover:text-neutral-900 focus-visible:text-neutral-900`}
        >
          <span aria-hidden className="inline-block transition-transform duration-300 group-hover:-translate-x-1">
            ←
          </span>
          Home
        </Link>

        <header className={`mt-10 flex flex-col gap-4 ${creative ? "items-end text-right" : ""}`}>
          <p className={`${typeVoiceClass("logic", "meta")} text-[0.62rem] tracking-[0.32em] text-neutral-500`}>{eyebrow}</p>
          <h1
            className={`text-[clamp(2.4rem,5.4vw,5.2rem)] leading-[0.95] ${
              creative ? "face-creative font-bold tracking-[-0.01em]" : "face-logic"
            }`}
          >
            {title}
          </h1>
          <p className="font-helv max-w-xl text-sm leading-relaxed text-neutral-600">{description}</p>
        </header>

        <div className="mt-10">{children}</div>
      </div>
    </main>
  );
}
