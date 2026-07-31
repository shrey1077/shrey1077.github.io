/**
 * CaseStudyExperience — the reusable page for a categorised client room.
 *
 * Some rooms are a body of work, not a single commission: an independent
 * practice's many brands (Freelance), a newsroom's editorial output
 * (NewsMobile). This renders any such room from a CaseStudyConfig — the room
 * stated, an index of its categories, then each category as a small case study:
 * kind → name → headline → challenge → description, beside its plate gallery.
 *
 * Mirrors the UID page's composition (near-white ground, sticky rail, one
 * accent per strand, no decoration that isn't the work), so these sit
 * consistently beside the site's other bespoke experience pages.
 *
 * Server Component; the plate grids are the client CaseGallery.
 */

import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import Image from "next/image";
import { ExperienceTransition } from "@/components/transition/ExperienceTransition";
import { CaseGallery } from "@/components/client/case/CaseGallery";
import { typeVoiceClass } from "@/constants/typography";
import type { CaseStudyConfig, CasePlate } from "@/types/caseStudy";

const META = `${typeVoiceClass("logic", "meta")} text-[0.55rem] tracking-[0.18em]`;

/** Read a category's plates — curated order + intrinsic dims from the prepare
 *  script's `_plates.json`, falling back to whatever webp is on disk. */
function readPlates(slug: string, folder: string): CasePlate[] {
  const dir = path.join(
    process.cwd(),
    "public",
    "content",
    "clients",
    slug,
    "work",
    folder,
  );
  const base = `/content/clients/${slug}/work/${folder}`;
  try {
    const manifest = JSON.parse(
      fs.readFileSync(path.join(dir, "_plates.json"), "utf8"),
    ) as { src: string; w: number; h: number; name?: string }[];
    return manifest
      .filter((p) => fs.existsSync(path.join(dir, p.src)))
      .map((p) => ({
        url: `${base}/${p.src}`,
        w: p.w,
        h: p.h,
        name: p.name ?? p.src,
      }));
  } catch {
    try {
      return fs
        .readdirSync(dir)
        .filter((f) => f.endsWith(".webp"))
        .sort()
        .map((f) => ({ url: `${base}/${f}`, w: 1400, h: 933, name: f }));
    } catch {
      return [];
    }
  }
}

export function CaseStudyExperience({ config }: { config: CaseStudyConfig }) {
  const categories = config.categories
    .map((c) => ({ ...c, plates: readPlates(config.slug, c.folder) }))
    .filter((c) => c.plates.length > 0);

  return (
    <main className="min-h-dvh w-full bg-[#fafafa] px-6 py-12 text-neutral-900 sm:px-10">
      <div className="mx-auto w-full max-w-6xl">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 rounded text-[0.7rem] text-neutral-500 outline-none transition-colors duration-200 hover:text-neutral-900 focus-visible:text-neutral-900"
        >
          <span
            aria-hidden
            className="inline-block transition-transform duration-200 group-hover:-translate-x-1"
          >
            ←
          </span>
          Back
        </Link>

        <ExperienceTransition>
          {/* The room, stated. */}
          <header className="grid grid-cols-1 gap-8 border-b border-neutral-200 py-16 lg:grid-cols-[1fr_auto] lg:gap-16 lg:py-24">
            <div className="flex flex-col gap-6">
              <span className={`${META} uppercase text-neutral-400`}>
                {config.eyebrow}
              </span>
              <h1 className="text-[clamp(2.4rem,6vw,5rem)] font-semibold leading-[0.98] tracking-[-0.03em]">
                {config.title}
              </h1>
              <p
                className={`${typeVoiceClass("creative", "display")} max-w-[24ch] text-[clamp(1.15rem,2.4vw,1.9rem)] leading-[1.15] text-neutral-500`}
              >
                {config.tagline}
              </p>
              <p className="max-w-[64ch] text-[0.95rem] leading-relaxed text-neutral-600">
                {config.intro}
              </p>
            </div>

            <div className="flex flex-col items-start gap-4 lg:items-end lg:text-right">
              {config.logo ? (
                <Image
                  src={config.logo}
                  alt={config.title}
                  width={120}
                  height={120}
                  className="size-16 rounded-xl object-contain sm:size-20"
                />
              ) : null}
              <div className="flex flex-col gap-1 lg:items-end">
                {config.metaLines.map((line) => (
                  <span key={line} className={`${META} uppercase text-neutral-400`}>
                    {line}
                  </span>
                ))}
              </div>
            </div>
          </header>

          {/* The index — one line per category. */}
          <nav
            aria-label="Index"
            className="flex flex-col gap-px border-b border-neutral-200 py-8"
          >
            {categories.map((c, i) => (
              <a
                key={c.id}
                href={`#${c.id}`}
                className="group flex items-baseline gap-4 py-2 outline-none transition-colors duration-200"
              >
                <span
                  className={`${META} shrink-0 tabular-nums text-neutral-400 transition-colors group-hover:text-neutral-900`}
                  style={{ ["--hover" as string]: c.accent }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-[1.05rem] font-medium tracking-[-0.01em] text-neutral-700 transition-colors duration-200 group-hover:text-neutral-950 group-focus-visible:text-neutral-950">
                  {c.name}
                </span>
                <span
                  aria-hidden
                  className="mx-2 hidden h-px flex-1 self-center bg-neutral-200 sm:block"
                />
                <span className={`${META} hidden shrink-0 text-neutral-400 sm:block`}>
                  {c.kind}
                </span>
              </a>
            ))}
          </nav>

          {/* The categories. */}
          {categories.map((c, i) => (
            <section
              key={c.id}
              id={c.id}
              className="scroll-mt-8 border-b border-neutral-200 py-16 last:border-b-0"
            >
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,22rem)_1fr] lg:gap-14">
                <div className="flex flex-col gap-4 lg:sticky lg:top-8 lg:self-start">
                  <span className={META} style={{ color: c.accent }}>
                    {String(i + 1).padStart(2, "0")} — {c.kind}
                  </span>
                  <h2 className="text-[clamp(1.5rem,3vw,2.4rem)] font-semibold leading-[1.05] tracking-[-0.015em]">
                    {c.name}
                  </h2>
                  <p
                    className={`${typeVoiceClass("creative", "display")} max-w-[30ch] text-[1.15rem] leading-[1.2] text-neutral-800`}
                  >
                    {c.headline}
                  </p>

                  <div className="mt-1 flex flex-col gap-1.5">
                    <span
                      className={`${typeVoiceClass("logic", "meta")} text-[0.5rem] tracking-[0.24em] text-neutral-400`}
                    >
                      The challenge
                    </span>
                    <p className="max-w-[46ch] text-[0.82rem] leading-relaxed text-neutral-500">
                      {c.challenge}
                    </p>
                  </div>

                  <p className="max-w-[46ch] text-[0.86rem] leading-relaxed text-neutral-600">
                    {c.description}
                  </p>

                  {c.site ? (
                    <a
                      href={`https://${c.site}`}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="w-fit text-[0.72rem] text-neutral-600 underline-offset-4 transition-colors duration-200 hover:text-neutral-900 hover:underline"
                    >
                      {c.site} ↗
                    </a>
                  ) : null}

                  <span
                    aria-hidden
                    className="mt-1 h-0.5 w-12 rounded-full"
                    style={{ backgroundColor: c.accent }}
                  />
                </div>

                <CaseGallery plates={c.plates} accent={c.accent} />
              </div>
            </section>
          ))}

          <footer className="py-12 text-center">
            <p className={`${META} uppercase text-neutral-400`}>
              {config.footerNote}
            </p>
          </footer>
        </ExperienceTransition>
      </div>
    </main>
  );
}
