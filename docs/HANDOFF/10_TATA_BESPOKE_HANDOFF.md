# 10 — TATA IIS BESPOKE EXPERIENCE — HANDOFF

Everything a fresh chat needs to continue the Tata IIS work without
re-deriving context. Written 2026-07-24.

## Where things live / how to run

- **Repo:** `D:\Brain Folio` (Next.js 16, framer-motion, Tailwind v4). NOT
  `D:\Assets` (that's the working dir + the raw client asset archive).
- **Branch:** `tata-iis-experience` (off `master`, local only, no remote).
- **Run:** `npm run dev` in `D:\Brain Folio` → http://localhost:3000. The
  in-app Browser pane CANNOT screenshot this session (renderer quirk, all
  session) — use headless Chrome for captures:
  `"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new
  --disable-gpu --hide-scrollbars --force-device-scale-factor=1
  --virtual-time-budget=10000 --window-size=1440,3000 --screenshot=out.png URL`
  Its DOM/JS/console tools DO work for verification.
- **Verify:** `npx tsc --noEmit` · `npx eslint src` · `npm run build`.
- Standing spec + full history: `docs/TATA_IIS_BUILD_PROMPT.md` and the memory
  files under `C:\Users\tatai\.claude\projects\D--Assets\memory\`.

## Current state — CP1…CP12, all committed & building clean

The site has 8 clients. Tata IIS is fully bespoke; the other 7 use the
generic framework (4 have content: azoth-biotech, newsmobile, zabraku-media,
uid — CP6/CP7; abs, mycoveda, early-works are WIP, no source found).

**Two Tata surfaces, both bespoke (branch on `slug === "tata-iis"`):**

1. **Homepage detail panel** — `src/components/home/SectionPanels.tsx`,
   `ClientDetail` has a `if (slug === "tata-iis")` branch: official wordmark +
   Helvetica description + 4 white circular category doorways.

2. **Full experience** — `/clients/[slug]/page.tsx` branches to
   `TataExperience` (`src/components/client/tata/`), NOT the generic
   `ClientExperience`. Composition:
   - `VideoHero` — 16:9 fly-through film, plays once + freezes on last frame.
     **CP12: the real film is now wired** (`brand/hero.mp4`, from the user's
     Seedance fly-through). The 3-Tata legacy overlay is REMOVED for Tata.
   - description (Helvetica) + "Powered by" (Tata Trusts / Skill India / Govt
     Gujarat logos + **MSDE as a text lockup** — no emblem in archive).
   - `GuidelineSections` — Tata wordmark+rulebook+plate strip full-width
     (~half viewport), then IISA / IISM two columns. **CP14: both columns now
     carry a 6-plate guideline strip** (IISA rendered from its PDF via
     `scripts/render-iisa-guidelines.mjs`); the old bespoke campus textures are
     gone — both columns are transparent over the page-wide `gridNEW` wash.
   - **Page body** wears a fixed, faint `gridNEW` circuit-grid wash
     (`brand/gridNEW.webp`, `TATA_GRID`) behind everything (CP14). Tune via the
     `opacity-70` on the fixed layer in `TataExperience`.
   - `PartnerMarquee` — continuous logo band, pauses on hover.
   - `CategoryAccordion` — **4 families** (Brand & Logo Guidelines · Print
     Media · Digital Graphics · Photography) = the 13 catalogue folders
     regrouped via `TATA_GROUPS` in `src/constants/tataExperience.ts`. Click a
     row → expands → sub-category chips → `PortraitSlider` (looped, ≤7 frames,
     auto-advance, pause on hover, click → `MediaViewer`).
     **CP13: every family row + every sub-category chip now carries a little
     device/product mockup cutout** (transparent PNG in `brand/mockups/`,
     `fam-<id>.png` / `sub-<id>.png`). Row cutout floats between the index and
     the title; chip cutout sits in a small white token that reads on active
     (accent-filled) and inactive chips. Wired in `TataExperience` with a
     server-side `fs` existence guard (missing PNG → plain row/chip).
   - `TataFooter` — Contact Us, both campus addresses, CIN, studio credit.
     **CP15: the hero's blue & teal light ribbons loop along the footer bottom**
     (`FooterRibbons`, an animated SVG; blue = 2× teal stroke width; flows
     left→right, seamless via even-period 2-tile translate; clipped to a 150px
     band, footer got extra bottom padding).

**Typography (CP11) — the Tata page uses exactly two typefaces:**
- `.tata-heading` → **Copperplate Gothic Bold** (family titles; the logo font)
- `.tata-subhead` → **Helvetica Bold** (kickers, footer labels, chips)
- `.tata-body` → **Helvetica Roman** (everything else; base on the page root)
- Defined in `src/app/globals.css`. `.tata-scope` on the root collapses any
  shared component's mono/serif/script utilities to Helvetica.
- ⚠ **Gotcha:** Tailwind v4 `@theme inline` BAKES font values into utilities,
  so a CSS-variable override can't reach them — that's why `.tata-scope` uses
  two-class selectors. Also: after editing `globals.css` the dev server can
  serve STALE CSS — `rm -rf .next/dev` and restart the preview to force it.

## OPEN ITEMS (do these in the new chat)

1. **✅ DONE (CP13) — Section mockup cutouts (was the main pending request).**
   User chose (AskUserQuestion) **generated** device mockups (not real-work
   cutouts) placed on **family rows + chip icons**. Built via OpenART (only
   ~30 credits on the account, so 2× Nano-Banana-2-Lite 3×3 contact sheets at
   15 credits each, sliced by `scripts/slice-tata-mockups.mjs`). If ever
   redoing: the two source grids are `brand/mockups/_sheets/sheet{A,B}.jpg`
   (underscore-prefixed → ignored by the catalogue reader); re-run the slice
   script to regenerate the 17 `fam-`/`sub-` PNGs. A spare `_spare-lanyard.png`
   is unused. Merchandise's folded-polo icon is the least legible at 24px
   (mostly navy) — fine, but a lighter re-gen could improve it.

2. **✅ DONE (CP14) — MSDE logo.** Official emblem fetched from Wikimedia
   Commons (`File:Ministry_of_Skill_Development_and_Entrepreneurship.svg`,
   direct upload URL derived from the filename md5), rasterised to
   `brand/powered/msde.png`; `TATA_POWERED_BY`'s MSDE entry now has `src`.

3. **Font files** — Copperplate Gothic Bold + Helvetica are licensed, not on
   the drives. `.tata-heading` falls back to Cinzel, Helvetica→Arial, until
   real web files are supplied. Drop `.woff2` into `public/fonts/` and
   uncomment the `@font-face url()` in `globals.css` (Copperplate) for
   pixel-exact rendering everywhere.

4. **Richer intro? (optional)** — `D:\Assets\Clients\Tata IIS\Intro\` now
   holds a large trove the user assembled: character cutouts
   (`Jamsetji cutout.png`, `JRD cutout.png`, `RNT cutout.png`,
   `IIS M Cutout.png`), banners, heritage campus images (IISc / TIFR / TISS /
   Taj / NCPA), `Assets_Tata_intro.zip`, `Intro.rar`, and a `frames/`
   subfolder with MULTIPLE seedance video variants + "10 frames for json
   prompts". CP12 wired the `...this_sh-0.mp4` variant as the hero; there's
   also an `...every_fr-0.mp4` variant. The user may want a more elaborate
   opening built from these — confirm before rebuilding the hero.

## Asset pipelines (idempotent, re-runnable)

- `scripts/prepare-tata-iis.mjs` — the 13 catalogue folders (images+films).
- `scripts/prepare-tata-experience.mjs` — powered-by logos, IISM guideline
  pages, hero poster.
- `scripts/slice-tata-mockups.mjs` — slices the two `brand/mockups/_sheets/`
  contact-sheet grids into the 17 accordion mockup cutouts (flood-fill white
  keying + trim + square-pad). Re-run after replacing either sheet.
- `scripts/render-iisa-guidelines.mjs` — renders the curated IISA plate strip
  from `IISA Logo Guidelines (1).pdf` via `pdf-to-img` (devDep; no system
  poppler/ghostscript on this box, and sharp has no PDF input). pdfjs sees the
  deck as 10 pages, not the 27 the file claims.
- Hero film was encoded ad-hoc via ffmpeg (see CP12 commit); re-encode from
  `Intro/frames/…this_sh-0.mp4` → `public/…/brand/hero.mp4` if swapping.

## Checkpoints (git log)

CP5 catalogue rework · CP6 four other clients · CP7 Awwwards refinement · CP8
5-agent recheck · CP9 bespoke Tata full experience · CP10 homepage panel ·
CP11 two-typeface system · CP12 hero film · CP13 section mockup cutouts
(`ca10cea`) · CP14 gridNEW body wash + IISA guideline plates + MSDE emblem
(`808fbdb`) · CP15 footer blue/teal ribbon loop (`b69c5c4`). Tree clean.
