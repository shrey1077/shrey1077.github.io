/**
 * AzothExperience — the bespoke Azoth Biotech client page.
 *
 * Flow (per the brief): identity → design foundations (logo · type · colour) →
 * brand architecture (Azoth → its family; Mycoveda apart) → the work, per
 * brand (Naturalist + its brand artwork, Mushroomworks) → the Azoth parent's
 * own collateral → rejected logos. Server Component; the post grids are the
 * client WorkGallery.
 */

import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import Image from "next/image";
import { ExperienceTransition } from "@/components/transition/ExperienceTransition";
import { WorkGallery } from "@/components/client/WorkGallery";
import {
  AZOTH,
  AZOTH_FOUNDATIONS,
  AZOTH_BRANDS,
  AZOTH_MYCOVEDA,
  AZOTH_PARENT_WORK,
  AZOTH_REJECTED,
  AZOTH_NATURALIST_ARTWORK,
} from "@/constants/azothExperience";

function readWork(folder: string): string[] {
  const dir = path.join(process.cwd(), "public", "content", "clients", "azoth-biotech", "work", folder);
  try {
    return fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".webp"))
      .sort()
      .map((f) => `/content/clients/azoth-biotech/work/${folder}/${f}`);
  } catch {
    return [];
  }
}

const KICKER = "text-[0.62rem] font-semibold uppercase tracking-[0.18em]";

function SectionKicker({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <span className={`${KICKER} block`} style={{ color: color ?? "#9ca3af" }}>
      {children}
    </span>
  );
}

export function AzothExperience() {
  const naturalistPosts = readWork("naturalist");
  const mushroomworksPosts = readWork("mushroomworks");

  return (
    <main className="min-h-dvh w-full bg-white px-6 py-14 text-neutral-900 sm:px-10">
      <div className="mx-auto w-full max-w-6xl">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 rounded text-[0.7rem] text-neutral-500 outline-none transition-colors duration-300 hover:text-neutral-900 focus-visible:text-neutral-900"
        >
          <span aria-hidden className="inline-block transition-transform duration-300 group-hover:-translate-x-1">←</span>
          Back
        </Link>

        <ExperienceTransition>
          {/* 1 — Identity. */}
          <section className="flex flex-col items-center gap-8 py-16 text-center sm:py-24">
            <div className="relative h-24 w-56 sm:h-32 sm:w-72">
              <Image src={AZOTH.logo} alt="Azoth Biotech" fill sizes="288px" className="object-contain" priority />
            </div>
            <h1 className="max-w-2xl text-2xl font-semibold leading-tight sm:text-4xl">{AZOTH.tagline}</h1>
            <p className="max-w-2xl text-sm leading-relaxed text-neutral-500 sm:text-base">{AZOTH.scope}</p>
          </section>

          {/* 2 — Design foundations. */}
          <section className="border-t border-neutral-200 py-16">
            <SectionKicker color={AZOTH.accent}>The brief — design foundations</SectionKicker>
            <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-3">
              {/* Logo. */}
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Logo</h3>
                <div className="relative mt-4 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
                  <div className="relative h-2/3 w-2/3">
                    <Image src={AZOTH.logo} alt="Azoth monogram" fill sizes="240px" className="object-contain" />
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-neutral-500">
                  A circular monogram — the Azoth letters interlocked into a self-contained seal, engineered on a strict
                  geometric grid.
                </p>
              </div>
              {/* Typography. */}
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Typography</h3>
                <div className="mt-4 flex aspect-[4/3] flex-col justify-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-6">
                  <span className="text-4xl font-bold tracking-tight sm:text-5xl">Aa</span>
                  <span className="text-sm font-semibold">{AZOTH_FOUNDATIONS.type.display}</span>
                  <span className="text-sm text-neutral-500">{AZOTH_FOUNDATIONS.type.text}</span>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-neutral-500">{AZOTH_FOUNDATIONS.type.displayNote}</p>
              </div>
              {/* Colour. */}
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Colour</h3>
                <div className="mt-4 grid aspect-[4/3] grid-cols-2 overflow-hidden rounded-xl border border-neutral-200">
                  {AZOTH_FOUNDATIONS.colours.map((c) => (
                    <div key={c.hex} className="flex items-end p-3" style={{ backgroundColor: c.hex }}>
                      <span className="text-[0.6rem] font-medium uppercase tracking-wide" style={{ color: c.hex === "#f2971e" ? "#1c2b28" : "#ffffff" }}>
                        {c.hex}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-neutral-500">
                  A mycelial teal at the core, warmed by a fruiting orange — nature and laboratory in one system.
                </p>
              </div>
            </div>
          </section>

          {/* 3 — Brand architecture. */}
          <section className="border-t border-neutral-200 py-16">
            <SectionKicker color={AZOTH.accent}>Brand architecture</SectionKicker>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-neutral-500">
              One parent, a family of brands grown beneath it — each a distinct identity sharing Azoth&apos;s scientific
              spine.
            </p>

            <div className="mt-10 flex flex-col items-center gap-8">
              {/* Parent. */}
              <div className="flex h-20 w-48 items-center justify-center rounded-xl border-2 bg-white" style={{ borderColor: AZOTH.accent }}>
                <div className="relative h-12 w-32">
                  <Image src={AZOTH.logo} alt="Azoth Biotech" fill sizes="160px" className="object-contain" />
                </div>
              </div>
              <span aria-hidden className="h-8 w-px bg-neutral-300" />
              {/* Children. */}
              <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
                {AZOTH_BRANDS.map((b) => (
                  <div key={b.id} className="flex flex-col items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-5 py-6 text-center">
                    <div className="relative h-20 w-full">
                      <Image src={b.logo} alt={b.name} fill sizes="200px" className="object-contain" />
                    </div>
                    <span className="text-sm font-semibold" style={{ color: b.accent }}>{b.name}</span>
                    <span className="text-[0.6rem] uppercase tracking-wide text-neutral-400">{b.descriptor}</span>
                  </div>
                ))}
              </div>

              {/* Mycoveda — apart. */}
              <div className="mt-6 grid w-full grid-cols-1 items-center gap-6 rounded-xl border border-dashed border-neutral-300 bg-neutral-50/60 px-6 py-6 sm:grid-cols-[auto_1fr]">
                <div className="relative h-14 w-44">
                  <Image src={AZOTH_MYCOVEDA.logo} alt="Mycoveda" fill sizes="176px" className="object-contain object-left" />
                </div>
                <div>
                  <span className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-neutral-400">A separate client — in development</span>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-neutral-500">{AZOTH_MYCOVEDA.note}</p>
                </div>
              </div>
            </div>
          </section>

          {/* 4 — Naturalist. */}
          <section className="border-t border-neutral-200 py-16">
            <div className="flex flex-col gap-3">
              <div className="relative h-10 w-44 self-start">
                <Image src={AZOTH_BRANDS[0].logo} alt={AZOTH_BRANDS[0].name} fill sizes="176px" className="object-contain object-left" />
              </div>
              <span className="text-[0.6rem] uppercase tracking-wide text-neutral-400">{AZOTH_BRANDS[0].descriptor}</span>
              <p className="max-w-2xl text-sm leading-relaxed text-neutral-500">{AZOTH_BRANDS[0].blurb}</p>
            </div>

            {/* The full brand artwork. */}
            <div className="relative mt-10 w-full overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
              <Image
                src={AZOTH_NATURALIST_ARTWORK}
                alt="Naturalist — full brand board"
                width={1600}
                height={2263}
                sizes="(max-width: 1024px) 100vw, 1100px"
                className="h-auto w-full object-contain"
              />
            </div>

            <div className="mt-10">
              <SectionKicker color={AZOTH_BRANDS[0].accent}>The social system</SectionKicker>
              <div className="mt-6">
                <WorkGallery posts={naturalistPosts} accent={AZOTH_BRANDS[0].accent} />
              </div>
            </div>
          </section>

          {/* 5 — Mushroomworks. */}
          <section className="border-t border-neutral-200 py-16">
            <div className="flex flex-col gap-3">
              {/* Stacked mark (symbol over wordmark) — needs a taller box. */}
              <div className="relative h-24 w-32 self-start sm:h-28 sm:w-36">
                <Image src={AZOTH_BRANDS[1].logo} alt={AZOTH_BRANDS[1].name} fill sizes="144px" className="object-contain object-left" />
              </div>
              <span className="text-[0.6rem] uppercase tracking-wide text-neutral-400">{AZOTH_BRANDS[1].descriptor}</span>
              <p className="max-w-2xl text-sm leading-relaxed text-neutral-500">{AZOTH_BRANDS[1].blurb}</p>
            </div>
            <div className="mt-10">
              <SectionKicker color={AZOTH_BRANDS[1].accent}>The social system</SectionKicker>
              <div className="mt-6">
                <WorkGallery posts={mushroomworksPosts} accent={AZOTH_BRANDS[1].accent} />
              </div>
            </div>
          </section>

          {/* 6 — Azoth parent collateral. */}
          <section className="border-t border-neutral-200 py-16">
            <SectionKicker color={AZOTH.accent}>Azoth Biotech — the parent</SectionKicker>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-neutral-500">
              Beyond the family brands, the parent ran its own programme — research, training and certification, held
              together by the same identity.
            </p>
            <div className="mt-8 max-w-sm">
              <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
                <Image src={AZOTH_PARENT_WORK.training} alt="Azoth training programme" fill sizes="384px" className="object-cover" />
              </div>
            </div>
          </section>

          {/* 7 — Rejected logos. */}
          <section className="border-t border-neutral-200 py-16">
            <SectionKicker color={AZOTH.accent}>The road not taken — rejected logos</SectionKicker>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-neutral-500">
              For every mark that shipped, a wall of ones that didn&apos;t. The exploration sheets behind Azoth and its
              brands — dozens of directions pressure-tested before the finals earned their place.
            </p>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
              {AZOTH_REJECTED.map((r) => (
                <figure key={r.name} className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
                  <div className="relative aspect-[2481/3508] w-full">
                    <Image src={r.src} alt={`${r.name} — logo explorations`} fill sizes="(max-width: 640px) 90vw, 30vw" className="object-contain" />
                  </div>
                  <figcaption className="border-t border-neutral-200 px-4 py-3 text-[0.6rem] uppercase tracking-wide text-neutral-400">
                    {r.name} — explorations
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>

          {/* 8 — Footer. */}
          <footer className="border-t border-neutral-200 py-12 text-center">
            <p className="text-[0.6rem] uppercase tracking-[0.16em] text-neutral-400">
              Azoth Biotech — identity, collateral, social & web · Client work, shown as portfolio record
            </p>
          </footer>
        </ExperienceTransition>
      </div>
    </main>
  );
}
