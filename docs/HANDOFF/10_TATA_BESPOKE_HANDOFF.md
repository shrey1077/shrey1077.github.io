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
     (~half viewport), then IISA / IISM two columns.
   - `PartnerMarquee` — continuous logo band, pauses on hover.
   - `CategoryAccordion` — **4 families** (Brand & Logo Guidelines · Print
     Media · Digital Graphics · Photography) = the 13 catalogue folders
     regrouped via `TATA_GROUPS` in `src/constants/tataExperience.ts`. Click a
     row → expands → sub-category chips → `PortraitSlider` (looped, ≤7 frames,
     auto-advance, pause on hover, click → `MediaViewer`).
   - `TataFooter` — Contact Us, both campus addresses, CIN, studio credit.

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

1. **⭐ Section mockup cutouts (the main pending request).** The user asked:
   *"i want little mockups cutouts for all sections and sub sections that you
   need to create, use connectors if u want to."* → Create small mockup /
   cutout visuals for each of the 4 families AND each sub-category (a little
   representative object/device-frame/cutout per section), to enrich the
   accordion rows and sub-category chips. Connectors are available and
   sanctioned: **Adobe** (`image_remove_background`, crop, etc.) and
   **OpenART** (generate) — both need the `adobe_mandatory_init` /
   ToolSearch-loaded schemas. Decide placement (row thumbnail? chip icon?
   hover preview?) with the user or best-judgment. Keep the two-typeface,
   white-gallery aesthetic.

2. **MSDE logo** — currently a text lockup in `TATA_POWERED_BY`
   (`tataExperience.ts`). Drop a real emblem into `brand/powered/msde.png`
   and add `src` to that entry.

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
- Hero film was encoded ad-hoc via ffmpeg (see CP12 commit); re-encode from
  `Intro/frames/…this_sh-0.mp4` → `public/…/brand/hero.mp4` if swapping.

## Checkpoints (git log)

CP5 catalogue rework · CP6 four other clients · CP7 Awwwards refinement · CP8
5-agent recheck · CP9 bespoke Tata full experience · CP10 homepage panel ·
CP11 two-typeface system · CP12 hero film. Tree clean at handoff.
