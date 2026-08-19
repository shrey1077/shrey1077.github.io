/**
 * Publication reader — `/publications/[slug]`.
 *
 * The written work is the one part of this portfolio meant to be READ, not
 * scanned, so this route is a reading view rather than a gallery: a masthead
 * that states what the document is, then either its pages in sequence or, for
 * the short pieces, the text set directly.
 *
 * Page images come off the filesystem (`readPublicationPages`), so the count is
 * never asserted in code and a re-run of the pipeline cannot leave a stale
 * number behind. `generateStaticParams` walks the same list the homepage's
 * Publications room shows, minus the entries that only point elsewhere.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PUBLICATIONS, publicationBySlug, READABLE_PUBLICATIONS } from "@/constants/publications";
import { readPublicationPages } from "@/content/catalogue";
import { PublicationPages } from "@/components/publications/PublicationPages";
import { ExperienceTransition } from "@/components/transition/ExperienceTransition";
import { typeVoiceClass } from "@/constants/typography";

const META = typeVoiceClass("logic", "meta");

interface PublicationPageProps {
  params: Promise<{ slug: string }>;
}

/** One page per readable publication. The NewsMobile entry is a link out to a
 *  client page, so it deliberately gets no route of its own. */
export function generateStaticParams() {
  return READABLE_PUBLICATIONS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PublicationPageProps): Promise<Metadata> {
  const { slug } = await params;
  const pub = publicationBySlug(slug);
  return { title: pub ? `${pub.title} — Publications` : "Publications" };
}

export default async function PublicationPage({ params }: PublicationPageProps) {
  const { slug } = await params;
  const pub = publicationBySlug(slug);
  if (!pub || pub.href) notFound();

  const pages = pub.pages ? readPublicationPages(pub.slug) : [];
  // Neighbours, so the room reads as a shelf rather than a set of dead ends.
  const order = READABLE_PUBLICATIONS;
  const i = order.findIndex((p) => p.slug === pub.slug);
  const prev = i > 0 ? order[i - 1] : null;
  const next = i >= 0 && i < order.length - 1 ? order[i + 1] : null;

  return (
    <main className="relative min-h-dvh w-full bg-gallery px-6 text-neutral-900 sm:px-10">
      <div className="relative z-10 mx-auto w-full max-w-5xl">
        <ExperienceTransition>
          <nav className="py-8">
            <Link
              href="/#publications"
              className={`${META} group inline-flex items-center gap-2 text-neutral-500 transition-colors duration-200 hover:text-neutral-900`}
            >
              <span aria-hidden className="inline-block transition-transform duration-200 group-hover:-translate-x-1">
                ←
              </span>
              Publications
            </Link>
          </nav>

          <header className="border-b border-neutral-200 pb-12">
            <span className={META} style={{ color: pub.accent }}>
              {pub.kind} · {pub.year}
            </span>
            <h1 className="mt-3 text-[clamp(1.9rem,5vw,3.4rem)] font-semibold leading-[1.03] tracking-[-0.02em]">
              {pub.title}
            </h1>
            {pub.subtitle && (
              <p className="mt-3 text-[clamp(1rem,2vw,1.3rem)] leading-snug text-neutral-500">
                {pub.subtitle}
              </p>
            )}
            <p className="mt-6 max-w-[62ch] text-[0.95rem] leading-relaxed text-neutral-600">
              {pub.blurb}
            </p>
            <p className={`${META} mt-6 text-neutral-400`}>
              {pub.origin}
              {pub.credit && ` · ${pub.credit}`}
              {pages.length > 0 && ` · ${pages.length} pages`}
            </p>
          </header>

          {pages.length > 0 ? (
            <PublicationPages pages={pages} title={pub.title} accent={pub.accent} />
          ) : pub.body ? (
            /* The short pieces are set as text — a scan of a page would be the
               wrong object for something this length, and unreadable on a
               phone. Measure is capped at ~68 characters. */
            <article className="py-14">
              <div className="mx-auto max-w-[68ch] space-y-6">
                {pub.body.map((para, n) => (
                  <p
                    key={n}
                    className={`text-[1.02rem] leading-[1.75] text-neutral-700 ${
                      n === 0 ? "first-letter:float-left first-letter:mr-2 first-letter:mt-1 first-letter:text-[3.2rem] first-letter:font-semibold first-letter:leading-[0.8]" : ""
                    }`}
                    style={n === 0 ? { color: undefined } : undefined}
                  >
                    {para}
                  </p>
                ))}
              </div>
            </article>
          ) : (
            <p className="py-20 text-center text-sm text-neutral-500">
              This one is still being prepared.
            </p>
          )}

          <nav className="flex flex-wrap items-center justify-between gap-6 border-t border-neutral-200 py-12">
            {prev ? (
              <Link href={`/publications/${prev.slug}`} className="group max-w-[20rem]">
                <span className={`${META} block text-neutral-400`}>Previous</span>
                <span className="mt-1 block text-sm font-medium text-neutral-700 transition-colors duration-200 group-hover:text-neutral-950">
                  {prev.title}
                </span>
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link href={`/publications/${next.slug}`} className="group max-w-[20rem] text-right">
                <span className={`${META} block text-neutral-400`}>Next</span>
                <span className="mt-1 block text-sm font-medium text-neutral-700 transition-colors duration-200 group-hover:text-neutral-950">
                  {next.title}
                </span>
              </Link>
            )}
          </nav>

          <footer className="pb-12 text-center">
            <p className={`${META} text-neutral-400`}>
              {PUBLICATIONS.length} entries in Publications
            </p>
          </footer>
        </ExperienceTransition>
      </div>
    </main>
  );
}
