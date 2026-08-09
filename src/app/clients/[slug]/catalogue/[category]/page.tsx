/**
 * Catalogue category route — `/clients/[slug]/catalogue/[category]`.
 *
 * Fully data-driven: `generateStaticParams` walks the content filesystem, so
 * every catalogue folder of every client gets a page automatically (new folder
 * → new route at the next build; live immediately in dev). The gallery:
 * images as viewer-wired plates with captions (CatalogueGallery), videos as a
 * poster-first wall (VideoWall), anything else as quiet file rows. Prev/next
 * links walk the catalogue so the categories read as one continuous archive.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CLIENTS, clientBySlug } from "@/constants/clients";
import { clientExperienceBySlug } from "@/constants/clientExperiences";
import { readCatalogue, readCatalogueCategory } from "@/content/catalogue";
import { CatalogueGallery } from "@/components/experience/CatalogueGallery";
import { Reveal } from "@/components/experience/Reveal";
import { VideoWall } from "@/components/experience/VideoWall";
import { typeVoiceClass } from "@/constants/typography";

const META = typeVoiceClass("logic", "meta");

interface CategoryPageProps {
  params: Promise<{ slug: string; category: string }>;
}

/** One page per catalogue folder per client — straight from the filesystem. */
export function generateStaticParams() {
  return CLIENTS.flatMap((client) =>
    readCatalogue(client.slug).map((category) => ({
      slug: client.slug,
      category: category.id,
    })),
  );
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug, category } = await params;
  const client = clientBySlug(slug);
  const data = client ? readCatalogueCategory(slug, category) : null;
  return {
    title:
      client && data
        ? `${data.category.name} — ${client.name}`
        : "Catalogue",
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug, category } = await params;
  const client = clientBySlug(slug);
  if (!client) notFound();

  const data = readCatalogueCategory(slug, category);
  if (!data) notFound();

  const images = data.assets.filter((a) => a.kind === "image");
  const videos = data.assets.filter((a) => a.kind === "video");
  // Video posters live in the gallery data as sibling images; when a wall is
  // present, its posters shouldn't ALSO render as standalone plates.
  const videoNames = new Set(videos.map((v) => v.name));
  const galleryImages = images.filter((i) => !videoNames.has(i.name));
  const files = data.assets.filter(
    (a) => a.kind !== "image" && a.kind !== "video",
  );

  // Prev/next through the catalogue's own order — the archive as one walk.
  const catalogue = readCatalogue(slug);
  const at = catalogue.findIndex((c) => c.id === data.category.id);
  const prev = at > 0 ? catalogue[at - 1] : undefined;
  const next = at >= 0 && at < catalogue.length - 1 ? catalogue[at + 1] : undefined;

  // The client's brand voice carries into its catalogue rooms.
  const theme = clientExperienceBySlug(slug)?.brandTheme;
  const themeVars = theme
    ? ({
        "--brand-font": `var(${theme.fontVar})`,
        "--brand-accent": theme.accent,
        ...(theme.tracking ? { "--brand-tracking": theme.tracking } : {}),
        ...(theme.uppercase ? { "--brand-transform": "uppercase" } : {}),
      } as React.CSSProperties)
    : undefined;

  return (
    <main
      className="min-h-dvh w-full bg-gallery px-6 py-14 sm:px-10"
      style={themeVars}
    >
      <div className="mx-auto w-full max-w-5xl">
        <Link
          href={`/clients/${slug}#catalogue`}
          className={`${META} group inline-flex items-center gap-2 rounded text-[0.65rem] text-neutral-500 outline-none transition-colors duration-300 hover:text-neutral-900 focus-visible:text-neutral-900 focus-visible:ring-2 focus-visible:ring-neutral-900/40 focus-visible:ring-offset-2`}
        >
          <span
            aria-hidden
            className="inline-block transition-transform duration-300 group-hover:-translate-x-1"
          >
            ←
          </span>
          {client.name}
        </Link>

        <header className="mt-10 border-b border-neutral-200 pb-8">
          <span
            className={`${META} text-sm`}
            style={{ color: "var(--brand-accent, #525252)" }}
          >
            Catalogue{at >= 0 ? ` · ${String(at + 1).padStart(2, "0")} / ${String(catalogue.length).padStart(2, "0")}` : ""}
          </span>
          <h1
            className="mt-3 text-4xl text-neutral-900 sm:text-5xl"
            style={{
              fontFamily: "var(--brand-font, var(--font-fraunces))",
              letterSpacing: "var(--brand-tracking, -0.02em)",
              textTransform: "var(--brand-transform, none)" as React.CSSProperties["textTransform"],
            }}
          >
            {data.category.name}
          </h1>
          {data.category.description && (
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-neutral-600">
              {data.category.description}
            </p>
          )}
          {data.category.story && (
            <p className="mt-5 max-w-2xl border-l-2 pl-5 text-[0.95rem] font-light leading-relaxed text-neutral-600"
              style={{ borderColor: "var(--brand-accent, #e5e5e5)" }}
            >
              {data.category.story}
            </p>
          )}
          <span className={`${META} mt-5 block text-[0.6rem] text-neutral-500`}>
            {data.category.assetCount > 0
              ? `${data.category.assetCount} asset${data.category.assetCount === 1 ? "" : "s"} in the archive · showing the selected few`
              : "Awaiting assets"}
          </span>
        </header>

        <div className="py-10">
          {data.assets.length === 0 ? (
            <div className="flex min-h-[30vh] flex-col items-center justify-center gap-3 text-center">
              <span className={`${META} text-xs text-neutral-500`}>
                Assets arriving soon
              </span>
              <p className="max-w-sm text-sm leading-relaxed text-neutral-500">
                Files placed in this category&apos;s content folder appear here
                automatically.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-12">
              {videos.length > 0 && (
                <Reveal>
                  <VideoWall assets={data.assets} />
                </Reveal>
              )}
              {galleryImages.length > 0 && (
                <Reveal delay={0.05}>
                  <CatalogueGallery assets={galleryImages} />
                </Reveal>
              )}
              {files.length > 0 && (
                <ul className="flex flex-col">
                  {files.map((file) => (
                    <li key={file.url}>
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="group flex items-baseline justify-between gap-4 border-t border-neutral-200 py-4 outline-none transition-colors duration-300 hover:bg-neutral-50"
                      >
                        <span className="text-sm text-neutral-900">{file.name}</span>
                        <span className={`${META} text-[0.55rem] text-neutral-500`}>
                          {file.kind}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {(prev || next) && (
          <nav
            aria-label="Catalogue navigation"
            className="flex items-baseline justify-between gap-6 border-t border-neutral-200 pt-8"
          >
            {prev ? (
              <Link
                href={`/clients/${slug}/catalogue/${prev.id}`}
                className="group text-left outline-none"
              >
                <span className={`${META} block text-[0.55rem] text-neutral-500`}>
                  ← Previous
                </span>
                <span className="mt-1.5 block text-sm text-neutral-500 transition-colors duration-300 group-hover:text-neutral-900 group-focus-visible:text-neutral-900">
                  {prev.name}
                </span>
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link
                href={`/clients/${slug}/catalogue/${next.id}`}
                className="group text-right outline-none"
              >
                <span className={`${META} block text-[0.55rem] text-neutral-500`}>
                  Next →
                </span>
                <span className="mt-1.5 block text-sm text-neutral-500 transition-colors duration-300 group-hover:text-neutral-900 group-focus-visible:text-neutral-900">
                  {next.name}
                </span>
              </Link>
            )}
          </nav>
        )}
      </div>
    </main>
  );
}
