#!/usr/bin/env bash
# Copies the curated source manifest into D:/Brain Folio/_source.
#
# Mirrors the two original roots as Assets/ and BWP/ so the relative layout
# every pipeline expects survives the move. This is the record of WHAT was
# consolidated on 2026-08-21 and why each entry is scoped the way it is.
#
# ⚠ Only material the pipelines actually READ is copied — ~11 GB, against 26.6
# GB of whole folders. Three references were single files inside very large
# folders and are narrowed to just those files:
#   UID/the trip           9.2 GB → 7 PNGs
#   Extincts               1.1 GB → 1 logo
#   Tata/portfolio shrey   3.4 GB → 8 files
# `Tata IIS` is copied WHOLE because its six pipelines walk its directories and
# between them reference every top-level folder it has.
set -u

ASSETS_SRC="D:/Assets"
BWP_SRC="D:/Brain Website portfolio"
DEST="D:/Brain Folio/_source"

ok=0; miss=0

copy_dir() {
  local from="$1" to="$2"
  if [ ! -d "$from" ]; then echo "MISSING DIR : $from"; miss=$((miss+1)); return; fi
  mkdir -p "$(dirname "$to")"
  cp -r "$from" "$to" && { echo "ok  dir  : $from"; ok=$((ok+1)); }
}

copy_file() {
  local from="$1" to="$2"
  if [ ! -f "$from" ]; then echo "MISSING FILE: $from"; miss=$((miss+1)); return; fi
  mkdir -p "$(dirname "$to")"
  cp "$from" "$to" && { echo "ok  file : $from"; ok=$((ok+1)); }
}

# ── D:/Assets/Clients ────────────────────────────────────────────────────
for d in "Newsmobile+" "Freelance" "Azoth+" "Zabrtaku+"; do
  copy_dir "$ASSETS_SRC/Clients/$d" "$DEST/Assets/Clients/$d"
done

# ── D:/Brain Website portfolio ───────────────────────────────────────────
for d in "All Logos" "Zabraku Media" "Azoth" "logos" "_masters" \
         "vapes/ABS branding" "vapes/Brands developed under ABS" \
         "Tata folio/Graphics/Mockups" \
         "UID/Branding" "UID/Packaginhg" "UID/NIRVAAN- BODY AND SPACE" \
         "UID/Shortlisted for Claude"; do
  copy_dir "$BWP_SRC/$d" "$DEST/BWP/$d"
done

# the trip: 7 referenced PNGs out of a 9.2 GB folder.
for n in 111 222 333 444 555 666 777; do
  copy_file "$BWP_SRC/UID/the trip/$n.png" "$DEST/BWP/UID/the trip/$n.png"
done

# Extincts: one referenced logo out of 1.1 GB.
copy_file "$BWP_SRC/Extincts/newsmobile_logo.png" "$DEST/BWP/Extincts/newsmobile_logo.png"

# Loose referenced files.
copy_file "$BWP_SRC/Resume ShreySingh-2024-01.png" "$DEST/BWP/Resume ShreySingh-2024-01.png"
copy_file "$BWP_SRC/UID/whitelogonew-01-01.png"    "$DEST/BWP/UID/whitelogonew-01-01.png"

# ⚠ `UID/BOOK ETHNO.pdf` and `UID/Packaging_Documentation_Shrey_Dagar.pdf` are
# NOT copied here even though prepare-uid-experience.mjs names them at those
# paths — they do not exist there. Both actually live under
# `UID/Shortlisted for Claude/{Ebooks,Packaging}/`, which is copied whole above,
# so the material is present and only the script's references are stale. That
# matches the handoff's note that uid-experience's documents step is superseded
# by prepare-uid-shortlist.mjs. Left as-is rather than quietly repointed.

# ── Tata ─────────────────────────────────────────────────────────────────
# The bulk of the copy, audited separately. See the header note on scoping.
echo "Tata IIS (whole, ~5.6 GB) — this is the long one."
copy_dir "$ASSETS_SRC/Clients/Tata IIS" "$DEST/Assets/Clients/Tata IIS"

# Only these eight of `portfolio shrey`'s 3.4 GB are referenced, all by
# prepare-tata-mockups.mjs.
while IFS= read -r f; do
  copy_file "$BWP_SRC/Tata/portfolio shrey/$f" "$DEST/BWP/Tata/portfolio shrey/$f"
done <<'FILES'
01 - Certificate Mockup.png
existvc.png
Bookmark Mockup.png
Bookmark Mockup3.png
Flyer Mockup.png
19.png
FundingOG.png
4.png
FILES

echo "―――――――――――――――――――――――――――――"
echo "copied: $ok   missing: $miss"
