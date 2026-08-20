/**
 * sources.mjs — the one place every pipeline learns where things live.
 *
 * Before 2026-08-21 each of the twenty prepare-* scripts opened with its own
 * hardcoded `D:/Assets/...` or `D:/Brain Website portfolio/...`, so the raw
 * material sat in two roots outside the repo and moving any of it meant
 * editing twenty files. The curated source material now lives under
 * `_source/` inside the repo (gitignored — it is ~10 GB and none of it is
 * tracked), mirroring the two original roots so the relative layout every
 * pipeline already expects survives unchanged:
 *
 *   _source/Assets/...   was  D:/Assets/...
 *   _source/BWP/...      was  D:/Brain Website portfolio/...
 *
 * ⚠ Only the material the pipelines actually READ was copied, not the whole
 * archives. Three references were single files inside very large folders and
 * were narrowed accordingly — `UID/the trip` (7 PNGs, not 9.2 GB), `Extincts`
 * (one logo, not 1.1 GB) and `Tata/portfolio shrey` (8 files, not 3.4 GB).
 * `Tata IIS` is copied whole because its scripts walk its directories and
 * between them reference every top-level folder it has.
 *
 * ⚠ Nothing here points outside the repo any more, so paths are derived from
 * this file's own location rather than named absolutely. A checkout that moves
 * to another drive or machine keeps working.
 *
 * ⚠ This does NOT cover the five Tata films, which are going to Cloudflare R2
 * by a separate decision. Their url map lives in the content reader.
 */

import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));

/** The repo root — `D:/Brain Folio` in the owner's checkout. */
export const ROOT = path.resolve(HERE, "..");

/** Raw source material. Gitignored; see the note above. */
export const SOURCE = path.join(ROOT, "_source");

/** Was `D:/Assets` — the raw client archive. */
export const ASSETS = path.join(SOURCE, "Assets");

/** Was `D:/Brain Website portfolio` — the folio archive. */
export const BWP = path.join(SOURCE, "BWP");

/** Everything the pipelines write into. */
export const PUBLIC = path.join(ROOT, "public");

/** `public/content`, the destination most pipelines share. */
export const CONTENT = path.join(PUBLIC, "content");
