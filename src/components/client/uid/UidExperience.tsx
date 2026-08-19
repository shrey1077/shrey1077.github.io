/**
 * UidExperience — the bespoke UID page.
 *
 * UID is the Unitedworld Institute of Design, where the M.Des in Visual
 * Communication happened (2018–2020). This isn't client work, so the page reads
 * as the portfolio of a degree: the institute stated plainly, an index of
 * circles — one per project — and then each project in full.
 *
 * Composition follows the site's gallery logic: near-white ground, generous
 * air, one accent per project and no decoration that isn't the work. The
 * painting and craft made alongside the degree live in the homepage's Art room
 * instead, so this page stays a design argument.
 *
 * Server Component; the plate grids are the client WorkGallery.
 */

import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import Image from "next/image";
import { ExperienceTransition } from "@/components/transition/ExperienceTransition";
import { WorkGallery } from "@/components/client/WorkGallery";
import { UidCircles } from "@/components/client/uid/UidCircles";
import { UID, UID_PROJECTS } from "@/constants/uidExperience";
import { typeVoiceClass } from "@/constants/typography";

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

const META = `${typeVoiceClass("logic", "meta")} text-[0.55rem] uppercase tracking-[0.18em]`;

export function UidExperience() {
  const projects = UID_PROJECTS.filter((p) => readWork(p.folder).length > 0);

  return (
    <main className="min-h-dvh w-full bg-[#fafafa] px-6 py-12 text-neutral-900 sm:px-10">
      <div className="mx-auto w-full max-w-6xl">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 rounded text-[0.7rem] text-neutral-500 outline-none transition-colors duration-200 hover:text-neutral-900 focus-visible:text-neutral-900"
        >
          <span aria-hidden className="inline-block transition-transform duration-200 group-hover:-translate-x-1">←</span>
          Back
        </Link>

        <ExperienceTransition>
          {/* The institute, stated. */}
          <header className="grid grid-cols-1 gap-10 border-b border-neutral-200 py-16 lg:grid-cols-[auto_1fr] lg:gap-16 lg:py-24">
            <div className="flex flex-col items-start gap-5">
              <Image
                src={UID.logo}
                alt={UID.institute}
                width={104}
                height={104}
                className="size-20 rounded-xl sm:size-24"
              />
              <div className="flex flex-col gap-1">
                <span className={`${META} text-neutral-400`}>{UID.campuses}</span>
                <a
                  href={`https://${UID.site}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-[0.72rem] text-neutral-600 underline-offset-4 transition-colors duration-200 hover:text-neutral-900 hover:underline"
                >
                  {UID.site}
                </a>
                <a
                  href={`mailto:${UID.email}`}
                  className="text-[0.72rem] text-neutral-600 underline-offset-4 transition-colors duration-200 hover:text-neutral-900 hover:underline"
                >
                  {UID.email}
                </a>
                <span className="text-[0.72rem] text-neutral-600">{UID.phone}</span>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <span className={`${META} text-neutral-400`}>
                {UID.degree} · {UID.years}
              </span>
              <h1 className="max-w-[18ch] text-[clamp(2rem,5.2vw,4.2rem)] font-semibold leading-[1.02] tracking-[-0.02em]">
                {UID.tagline}
              </h1>
              <p className="max-w-[62ch] text-[0.95rem] leading-relaxed text-neutral-600">{UID.intro}</p>
              <p className="max-w-[62ch] border-l-2 border-neutral-200 pl-4 text-[0.8rem] leading-relaxed text-neutral-500">
                <span className="font-semibold text-neutral-700">{UID.institute}</span> — {UID.about}
              </p>
            </div>
          </header>

          {/* The index — one circle per project. */}
          <section aria-label="Index" className="border-b border-neutral-200 py-14">
            <UidCircles projects={projects} />
          </section>

          {/* The projects. */}
          {projects.map((project, i) => {
            const plates = readWork(project.folder);
            return (
              <section
                key={project.id}
                id={project.id}
                className="scroll-mt-8 border-b border-neutral-200 py-16 last:border-b-0"
              >
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-14">
                  <div className="flex flex-col gap-3 lg:sticky lg:top-8 lg:self-start">
                    <span className={META} style={{ color: project.accent }}>
                      {String(i + 1).padStart(2, "0")} — {project.kind}
                    </span>
                    <h2 className="text-[clamp(1.5rem,3vw,2.4rem)] font-semibold leading-[1.05] tracking-[-0.015em]">
                      {project.title}
                    </h2>
                    <p className="max-w-[46ch] text-[0.86rem] leading-relaxed text-neutral-600">
                      {project.blurb}
                    </p>
                    {/* Only the packaging project sets this: its plates are an
                        excerpt the owner chose (pages 13–16), and the whole zine
                        is readable in the Publications room. */}
                    {project.link && (
                      <Link
                        href={project.link.href}
                        className="group mt-1 inline-flex w-fit items-center gap-2 text-[0.78rem] font-medium transition-opacity duration-200 hover:opacity-70"
                        style={{ color: project.accent }}
                      >
                        {project.link.label}
                        <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">
                          →
                        </span>
                      </Link>
                    )}
                    <span
                      aria-hidden
                      className="mt-1 h-0.5 w-12 rounded-full"
                      style={{ backgroundColor: project.accent }}
                    />
                  </div>

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

          <footer className="py-12 text-center">
            <p className={`${META} text-neutral-400`}>
              {UID.institute} — {UID.degree}, {UID.years} · Academic work, shown as portfolio record
            </p>
          </footer>
        </ExperienceTransition>
      </div>
    </main>
  );
}
