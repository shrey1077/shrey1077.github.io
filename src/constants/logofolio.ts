/**
 * Logofolio — the marks the owner DREW, in the order they named them.
 *
 * The wall used to show whatever `prepare-logofolio.mjs` found on disk, which
 * included marks that came off client material rather than off this desk. On
 * 2026-08-20 the owner named the ones that are theirs, and this list is that
 * answer: `readLogofolio` filters the manifest through it and orders by it, so
 * the wall can never drift back to "everything in the folder".
 *
 * ⚠ THREE ENTRIES ARE HERE BY INFERENCE, not by name — flagged so they can be
 * dropped in one line each. `iis-ahmedabad` and `iis-mumbai` are Tata IIS's two
 * campus marks, and `mycoveda-symbol` is Mycoveda's symbol-only lockup. All
 * three are variants of brands the owner DID name, so excluding them would have
 * hidden work of theirs on a technicality.
 *
 * ⚠ FIVE NAMED BRANDS HAVE NO MARK ON DISK: Kartpipe, Himax Distro, Farmstacks
 * and Maler Oswald exist only inside campaign artwork, and would have to be
 * extracted before they could sit on this wall. ABS is the exception — its
 * roundel already ships for the Clients board, so it is pulled in from there by
 * `url` below rather than duplicated into the logofolio folder.
 *
 * An entry whose file is missing is simply skipped, so naming a mark here
 * before its artwork exists is safe.
 */

export interface AuthoredMark {
  /** Manifest slug, or a free id when `url` supplies the art directly. */
  slug: string;
  /** Shown on hover. Falls back to the manifest's name when absent. */
  name?: string;
  /** Art from outside `public/content/logofolio/`, for a mark that already
   *  ships elsewhere and should not be duplicated. */
  url?: string;
}

export const AUTHORED_MARKS: readonly AuthoredMark[] = [
  { slug: "tata-iis" },
  // ⚠ By inference — the two Tata IIS campus marks.
  { slug: "iis-ahmedabad" },
  { slug: "iis-mumbai" },
  // ⚠ Not in the logofolio folder; the Clients board's roundel, reused.
  { slug: "abs", name: "ABS Wholesale", url: "/content/career/abs.png" },
  { slug: "luzid" },
  { slug: "azoth-biotech" },
  { slug: "mycoveda" },
  // ⚠ By inference — Mycoveda's symbol-only lockup.
  { slug: "mycoveda-symbol" },
  { slug: "mycoactive" },
  { slug: "kavaka" },
  { slug: "naturalist" },
  { slug: "mushroomworks" },
  { slug: "puran-studios" },
  { slug: "betright365" },
  { slug: "fabs" },
  { slug: "first-divine" },
  { slug: "komono" },
];
