/**
 * Content readers — the data-driven catalogue & photography system.
 *
 * ⚠ SERVER-ONLY. Uses `node:fs`; import it only from Server Components /
 * route-level code. (If it ever leaks into a client bundle the build fails
 * loudly on the `node:fs` import — by design.)
 *
 * THE CONTRACT (docs/CONTENT_GUIDE.md):
 * Content lives on the filesystem, not in code. Under
 * `public/content/clients/<slug>/`:
 *
 *   catalogue/<Category Name>/     → one catalogue category per folder
 *   photography/<Collection Name>/ → one photo collection per folder
 *   brand/                         → logo & guideline assets
 *
 * Folder name = display name. Dropping in a NEW FOLDER creates a new catalogue
 * card / collection with no code changes (live in dev; picked up at the next
 * build in production, since pages are statically generated). Files inside a
 * folder are its assets. Optional `_meta.json` per folder refines order &
 * description. Dotfiles, `.gitkeep`, and `_`-prefixed entries are ignored.
 *
 * These readers are the stable interface future presentation layers (the
 * immersive gallery) build on: swap the component, keep the data contract.
 */

import fs from "node:fs";
import path from "node:path";

const CONTENT_ROOT = path.join(process.cwd(), "public", "content", "clients");

/* ── Types (the stable data contract) ─────────────────────────────────── */

export interface CatalogueCategory {
  /** URL-safe id derived from the folder name (used in the route). */
  id: string;
  /** Display name = the folder name, verbatim. */
  name: string;
  /** Optional blurb from `_meta.json`. */
  description?: string;
  /** Number of asset files inside (recursive). */
  assetCount: number;
  /** Public URL of the first image found, if any (future card covers). */
  coverUrl?: string;
}

export type AssetKind = "image" | "video" | "document" | "other";

export interface ContentAsset {
  name: string;
  /** Public URL (served from /public). */
  url: string;
  kind: AssetKind;
}

export interface PhotoCollection {
  id: string;
  name: string;
  description?: string;
  assetCount: number;
  /** Image assets, ready for a gallery component. */
  images: ContentAsset[];
}

interface FolderMeta {
  order?: number;
  description?: string;
}

/* ── Filesystem helpers ───────────────────────────────────────────────── */

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".svg"]);
const VIDEO_EXT = new Set([".mp4", ".webm", ".mov"]);
const DOCUMENT_EXT = new Set([".pdf", ".pptx", ".ppt", ".doc", ".docx", ".key"]);

function assetKind(fileName: string): AssetKind {
  const ext = path.extname(fileName).toLowerCase();
  if (IMAGE_EXT.has(ext)) return "image";
  if (VIDEO_EXT.has(ext)) return "video";
  if (DOCUMENT_EXT.has(ext)) return "document";
  return "other";
}

/** Hidden/system entries never count as content. */
function isContentEntry(name: string): boolean {
  return !name.startsWith(".") && !name.startsWith("_");
}

function listDirs(dir: string): string[] {
  try {
    return fs
      .readdirSync(dir, { withFileTypes: true })
      .filter((e) => e.isDirectory() && isContentEntry(e.name))
      .map((e) => e.name);
  } catch {
    return []; // missing directory = simply no content yet
  }
}

function listFiles(dir: string): string[] {
  try {
    return fs
      .readdirSync(dir, { withFileTypes: true })
      .filter((e) => e.isFile() && isContentEntry(e.name))
      .map((e) => e.name);
  } catch {
    return [];
  }
}

/** Recursive asset count (categories may organize assets into subfolders). */
function countFilesDeep(dir: string): number {
  let count = listFiles(dir).length;
  for (const sub of listDirs(dir)) count += countFilesDeep(path.join(dir, sub));
  return count;
}

function readMeta(dir: string): FolderMeta {
  try {
    const raw = fs.readFileSync(path.join(dir, "_meta.json"), "utf8");
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed as FolderMeta;
  } catch {
    // no meta / malformed meta → defaults; folders must never break the page
  }
  return {};
}

/** Folder name → URL-safe route id ("Brand Guidelines" → "brand-guidelines"). */
export function folderToId(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Public URL for a file under /public, with each segment encoded. */
function publicUrl(...segments: string[]): string {
  return "/" + segments.map(encodeURIComponent).join("/");
}

function clientDir(slug: string, ...rest: string[]): string {
  return path.join(CONTENT_ROOT, slug, ...rest);
}

/* ── Readers ──────────────────────────────────────────────────────────── */

/** All catalogue categories for a client, ordered by meta then name. */
export function readCatalogue(slug: string): CatalogueCategory[] {
  const root = clientDir(slug, "catalogue");
  return listDirs(root)
    .map((folder) => {
      const dir = path.join(root, folder);
      const meta = readMeta(dir);
      const firstImage = listFiles(dir).find((f) => assetKind(f) === "image");
      return {
        id: folderToId(folder),
        name: folder,
        description: meta.description,
        assetCount: countFilesDeep(dir),
        coverUrl: firstImage
          ? publicUrl("content", "clients", slug, "catalogue", folder, firstImage)
          : undefined,
        order: meta.order ?? Number.MAX_SAFE_INTEGER,
      };
    })
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
    .map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      assetCount: c.assetCount,
      coverUrl: c.coverUrl,
    }));
}

/** One category (by route id) with its direct assets. Null if unknown. */
export function readCatalogueCategory(
  slug: string,
  categoryId: string,
): { category: CatalogueCategory; assets: ContentAsset[] } | null {
  const root = clientDir(slug, "catalogue");
  const folder = listDirs(root).find((f) => folderToId(f) === categoryId);
  if (!folder) return null;

  const dir = path.join(root, folder);
  const meta = readMeta(dir);
  const assets = listFiles(dir).map((file) => ({
    name: file,
    url: publicUrl("content", "clients", slug, "catalogue", folder, file),
    kind: assetKind(file),
  }));

  return {
    category: {
      id: categoryId,
      name: folder,
      description: meta.description,
      assetCount: countFilesDeep(dir),
      coverUrl: assets.find((a) => a.kind === "image")?.url,
    },
    assets,
  };
}

/** All photography collections for a client, with their images. */
export function readPhotography(slug: string): PhotoCollection[] {
  const root = clientDir(slug, "photography");
  return listDirs(root)
    .map((folder) => {
      const dir = path.join(root, folder);
      const meta = readMeta(dir);
      const images = listFiles(dir)
        .filter((f) => assetKind(f) === "image")
        .map((file) => ({
          name: file,
          url: publicUrl("content", "clients", slug, "photography", folder, file),
          kind: "image" as const,
        }));
      return {
        id: folderToId(folder),
        name: folder,
        description: meta.description,
        assetCount: countFilesDeep(dir),
        images,
        order: meta.order ?? Number.MAX_SAFE_INTEGER,
      };
    })
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
    .map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      assetCount: c.assetCount,
      images: c.images,
    }));
}
