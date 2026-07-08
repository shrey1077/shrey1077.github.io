/**
 * Catalogue category route — `/clients/[slug]/catalogue/[category]`.
 *
 * Fully data-driven: `generateStaticParams` walks the content filesystem, so
 * every catalogue folder of every client gets a page automatically (new folder
 * → new route at the next build; live immediately in dev). Renders the
 * category's assets — images through the reusable AssetGrid, other files as
 * quiet rows — or an elegant empty state while the folder awaits content.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CLIENTS, clientBySlug } from "@/constants/clients";
import { readCatalogue, readCatalogueCategory } from "@/content/catalogue";
import { AssetGrid } from "@/components/experience/AssetGrid";
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
  const files = data.assets.filter((a) => a.kind !== "image");

  return (
    <main className="min-h-dvh w-full bg-white px-6 py-14 sm:px-10">
      <div className="mx-auto w-full max-w-5xl">
        <Link
          href={`/clients/${slug}`}
          className={`${META} group inline-flex items-center gap-2 text-[0.65rem] text-neutral-400 outline-none transition-colors duration-300 hover:text-neutral-900 focus-visible:text-neutral-900`}
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
          <span className={`${META} text-xs text-neutral-400`}>Catalogue</span>
          <h1
            className={`${typeVoiceClass("creative", "display")} mt-3 text-4xl text-neutral-900 sm:text-5xl`}
          >
            {data.category.name}
          </h1>
          {data.category.description && (
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-neutral-500">
              {data.category.description}
            </p>
          )}
          <span className={`${META} mt-4 block text-[0.6rem] text-neutral-400`}>
            {data.category.assetCount > 0
              ? `${data.category.assetCount} asset${data.category.assetCount === 1 ? "" : "s"}`
              : "Awaiting assets"}
          </span>
        </header>

        <div className="py-10">
          {data.assets.length === 0 ? (
            <div className="flex min-h-[30vh] flex-col items-center justify-center gap-3 text-center">
              <span className={`${META} text-xs text-neutral-400`}>
                Assets arriving soon
              </span>
              <p className="max-w-sm text-sm leading-relaxed text-neutral-400">
                Files placed in this category&apos;s content folder appear here
                automatically.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-10">
              {images.length > 0 && <AssetGrid assets={images} />}
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
                        <span className={`${META} text-[0.55rem] text-neutral-400`}>
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
      </div>
    </main>
  );
}
