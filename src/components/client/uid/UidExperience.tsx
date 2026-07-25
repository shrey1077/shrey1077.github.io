/**
 * UidExperience — the bespoke UID page.
 *
 * UID is the Unitedworld Institute of Design, Ahmedabad, where the M.Des in
 * Visual Communication happened (2018–2020). This isn't client work, so the
 * page reads as a portfolio of the degree rather than a case study: a branding
 * system, packaging, a performance identity, posters and illustration, the
 * making underneath, a photo essay, and the books it all got written into.
 *
 * Server Component; the plate grids are the client WorkGallery.
 */

import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import { ExperienceTransition } from "@/components/transition/ExperienceTransition";
import { WorkGallery } from "@/components/client/WorkGallery";
import { UID, UID_PROJECTS } from "@/constants/uidExperience";

function readWork(folder: string): string[] {
  const dir = path.join(process.cwd(), "public", "content", "clients", "uid", "work", folder);
  try {
    return fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".webp"))
      .sort()
      .map((f) => `/content/clients/uid/work/${folder}/${f}`);
  } catch {
    return [];
  }
}

export function UidExperience() {
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
          {/* Identity — the institute's mark wants a dark ground. */}
          <section className="py-14 sm:py-20">
            <div className="flex flex-col items-center gap-8 rounded-3xl bg-neutral-950 px-8 py-14 text-center sm:py-20">
              {/* The archive holds no Unitedworld mark, so the institute is
                  set rather than drawn — better than borrowing a logo. */}
              <p className="text-[clamp(1.1rem,2.4vw,1.9rem)] font-semibold uppercase leading-tight tracking-[0.18em] text-white">
                {UID.institute}
              </p>
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-white/45">
                {UID.degree} · {UID.years}
              </p>
              <h1 className="max-w-2xl text-2xl font-semibold leading-tight text-white sm:text-4xl">
                {UID.tagline}
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-white/55 sm:text-base">{UID.intro}</p>
            </div>
          </section>

          {/* The projects. */}
          {UID_PROJECTS.map((project, i) => {
            const plates = readWork(project.folder);
            if (plates.length === 0) return null;
            return (
              <section key={project.id} className="border-t border-neutral-200 py-14">
                <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
                  <span
                    className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] tabular-nums"
                    style={{ color: project.accent }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h2 className="text-xl font-semibold sm:text-2xl">{project.title}</h2>
                  <span className="text-[0.6rem] uppercase tracking-[0.14em] text-neutral-400">
                    {project.kind}
                  </span>
                </div>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-neutral-500">{project.blurb}</p>
                <div className="mt-8">
                  <WorkGallery
                    posts={plates}
                    accent={project.accent}
                    cols={project.cols}
                    aspect={project.aspect}
                  />
                </div>
              </section>
            );
          })}

          <footer className="border-t border-neutral-200 py-12 text-center">
            <p className="text-[0.6rem] uppercase tracking-[0.16em] text-neutral-400">
              {UID.institute} — {UID.degree}, {UID.years} · Academic work, shown as portfolio record
            </p>
          </footer>
        </ExperienceTransition>
      </div>
    </main>
  );
}
