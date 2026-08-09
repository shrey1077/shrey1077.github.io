> ⚠ **SUPERSEDED (2026-08-10).** Read
> [`11_SITE_HANDOFF.md`](./11_SITE_HANDOFF.md) first — it covers the whole
> site and this file's homepage and work-section descriptions are now wrong.
> Kept for the history of how the Tata page got here.

# 09 — TATA IIS EXPERIENCE — HANDOFF PACKAGE

Everything needed to continue the Tata IIS client-experience build in a fresh
chat, without re-deriving context. Written 2026-07-13, on branch
`tata-iis-experience` (off `master`).

## How to start the new chat

Paste this as the opening message:

> Read `docs/HANDOFF/09_TATA_IIS_EXPERIENCE_HANDOFF.md` in full. Confirm
> you've read it, then wait for my instructions — I still need to explain how
> the source assets should be selected and used before any asset work starts.

You're on branch `tata-iis-experience` already (check with `git branch` —
switch to it if the new session opens on `master`: `git checkout
tata-iis-experience`).

## Git state

- Repo was already initialized this project cycle (local only, no remote).
  `master` is the mainline; this work is isolated on `tata-iis-experience` so
  it merges back cleanly whenever it's ready (`git checkout master && git
  merge tata-iis-experience` — nothing else required, see "Reconnecting"
  below).
- As of this doc: `07_CONTEXT_BOOTSTRAP.md` and `04_FREEZE.md` were corrected
  on this branch (they had drifted after the Phase 5 homepage rebuilds — 3D
  brain / PreviewPane / BrainNavigation deleted, pure-white background
  changed). Not yet committed. `CONTENT_GUIDE.md` still has two stale lines
  (references BrainNavigation/PreviewPane in its code-layout tree) — harmless,
  not yet fixed.
- **This doc itself, plus the two doc corrections, are uncommitted right now**
  — the user asked to package first and hasn't asked for a commit yet.

## What already exists — verified by reading the live code (not assumed)

`/clients/[slug]` (`src/app/clients/[slug]/page.tsx`) branches on
`clientExperienceBySlug(slug)`: a config → the full `ClientExperience`; no
config → minimal `ClientWip`. **Tata IIS has a config**
(`src/constants/clientExperiences.ts`):

```ts
{
  slug: "tata-iis",
  tagline: "Brand & communication system for the Indian Institute of Skills",
  brand: { markText: "Tata IIS", note: "…construction grid…" },
  institute: {
    parentName: "Indian Institute of Skills", parentNote: "A Tata initiative",
    branches: [
      { id: "iis-ahmedabad", name: "IIS Ahmedabad", city: "Ahmedabad" },
      { id: "iis-mumbai", name: "IIS Mumbai", city: "Mumbai" },
    ],
  },
}
```

`ClientExperience.tsx` composes exactly **4 numbered sections** today:

| # | Section | Component | Real state |
|---|---|---|---|
| 01 | Brand | `BrandOpening` | **Architectural placeholder** — the text mark sits in a real construction-guide frame (thirds + center hairlines); note explicitly says "guidelines pending". Built to receive the real construction animation the moment logo-guideline assets land, without touching anything around it. |
| 02 | Structure | `InstituteStructure` | **Functional now** — data-driven org tree (parent → stem → spanning rule → branch cards), already renders both campuses correctly from the config above. |
| 03 | Catalogue | `CatalogueSection` | **Empty** — folder-driven from `public/content/clients/tata-iis/catalogue/`, but only `Brand Guidelines/` and `Certificates/` exist as folders, and both contain nothing but a `.gitkeep` + a `_meta.json` (order + one-line description). No actual asset files anywhere yet. Nine other category names appear in the content map but have no folders at all yet. |
| 04 | Photography | `PhotographySection` | **Empty** — 6 collection folders scaffolded (`Campus/Labs/Students/Faculty/Events/Equipment`), all just `.gitkeep`. |

The **reusable experience framework** (`src/components/experience/`) is solid
and already handles, independent of Tata IIS specifically: the hero block, the
in-page nav-anchor row, the rail+body section shell, catalogue cards with
auto-generated routes, a photography grid via `AssetGrid`, a `MediaViewer`
lightbox (built, not yet wired into `AssetGrid` — that wiring is part of the
"future immersive gallery" swap), and wrapping prev/next `FooterNavigation`
through the client list. Full framework table + conventions:
[`docs/CLIENT_ARCHITECTURE.md`](../CLIENT_ARCHITECTURE.md).

**Memory Transition** (click a client → hairline thread → veil → route) is
live and already wired to Tata IIS: `SectionPanels.tsx`'s `ClientDetail`
(homepage) sets `pendingMemory` when its "Enter the full experience" link is
clicked; `MemoryTransitionHost` (mounted globally) handles the rest. This was
NOT touched by the homepage redesigns and needs no changes.

**Conclusion — nothing to "reconnect" later.** `/clients/tata-iis` is already
routed (`generateStaticParams`), already linked from the homepage's
`SectionPanels` and from the standalone `/clients` index. Building out
sections 01–04 (and any new ones) is the *entire* task — the moment content
exists on disk or in config, it appears everywhere it should, automatically.

## The creative blueprint — already written, do not redo

Five docs already carry the full curation/direction work. Read them when the
task at hand needs them; don't duplicate their content into new docs.

- **[`STORYBOARD_TATA_IIS.md`](../STORYBOARD_TATA_IIS.md)** — the experience
  directed as a 9-scene short film (Retrieval → Legacy → Arrival → DNA →
  Campus Network → the Communication Ecosystem → Collections → Artifact →
  Surfacing). This is the north star for pacing and mood.
- **[`TATA_IIS_CONTENT_MAP.md`](../TATA_IIS_CONTENT_MAP.md)** — the full
  content tree with star ratings and the "machine shape" data contract
  (config fields still to add: legacy moments, DNA principles, campus network
  is done, the six systems with `{id, title, question, rating, presentation,
  assets[]}` collections).
- **[`COMMUNICATION_ECOSYSTEM.md`](../COMMUNICATION_ECOSYSTEM.md)** — the six
  systems in full (Brand Identity / Marketing & Communication / Photography &
  Media / Digital Presence / Student Experience / Special Projects), each with
  its collections, source folders, presentation style, and the curation
  *decisions* (why NST is a standalone case, why Tata Quotes was pulled out of
  Environmental Scale to power Legacy instead, etc.).
- **[`CURATION_REPORT.md`](../CURATION_REPORT.md)** /
  **[`ASSET_REPORT.md`](../ASSET_REPORT.md)** — the underlying ratings and
  archive inventory these were built from. Reference depth, not requires-read.

Presentation styles already named in the map: `construction | publication |
video-wall | showcase | carousel | composite | strip | grid | case`. The
framework supplies components per style; data picks which one renders — no
style should be hardcoded to a collection in code.

## Source assets — path correction (verified 2026-07-13)

**The path referenced in older docs/memory —
`D:\Brain Website portfolio\Tata folio` — is STALE.** That folder has been
repurposed for unrelated scratch files (3D brain-model zips, an unrelated
cinematic brain-animation MP4) and no longer holds the Tata IIS archive.

**The real archive, confirmed by direct inspection, is now at:**

```
D:\Brain Website portfolio\Assets\Clients\Tata IIS\
```

446 files, 4.6 GB — closely matches the curation docs' original count (~440
files, 5.2 GB), just reorganized one level deeper under top-level categories
instead of sitting flat:

```
Tata IIS/
├── Logo Guidelines/        (flattened JPGs: …_2.jpg … …_12.jpg, …_cover.jpg)
├── Photography/
├── Print/
│   ├── Big Boards/{Exterior Signages, Lab Boards, Campus installations, Tata Quotes}
│   ├── Brochures/{Funding Brochures, First brochures, Trifolds}
│   ├── Campus Posters/POSH
│   ├── Certificates/Culinary Certs/PDF
│   ├── Flyers/1x
│   ├── Handbook, ID cards, Letterhead, Notepad, Signages, Standee, Stickers,
│   │   Visiting card, Banners
│   └── Events/{Amtech, Skills Conclave, Skill connect}
├── Socials/Quiz
├── Digital/{Teams call BG, Mockups, New Joinee, Presentations, Videos}
├── 3x/SVG
└── Intro/
```

So a source citation in `TATA_IIS_CONTENT_MAP.md` like *"← Big
Boards/Tata Quotes/Jamsetji.png"* now resolves to
`Print/Big Boards/Tata Quotes/Jamsetji.png` under the path above.

**Spot-checked and confirmed present:** the three Legacy-sequence portraits
that Scene 2 of the storyboard depends on —
`Print/Big Boards/Tata Quotes/{Jamsetji,Jrd,RTN}.png` (16–25 MB each). Two
extra files sit alongside them not mentioned in the original inventory —
`JRD TATA Quote.png` and `tata quotes-Recovered.png` — worth a quick look to
see if they're better/alternate scans before picking which to use.

**Not re-confirmed:** `NST` did not appear as its own top-level folder in this
reorganized structure — it may have moved, merged into `Print/`, or been
dropped. Verify before assuming the NST case-study collection is still
sourceable as originally planned.

**Not consolidated, flagged only (do not assume relevance without checking):**
a few other Tata-adjacent folders exist elsewhere on `D:` and were not
inspected — `D:\Campus Artworks\` (has its own Tata-quote PDFs, possibly
higher-res source for Legacy), `D:\Tata IIS Graphic Templates\Campus Posters`,
`D:\Lab boards\Lab Boards AMD\Sizewise\Big Boards`, `D:\About Us\Tata
quote.png`. These may be duplicates, alternates, or genuinely unrelated —
unknown until checked.

### How to select and use these assets

**Deliberately left open — the user will give specific instructions on this in
the next chat.** Do not start pulling/curating assets from the archive above
until then. For reference only (not confirmed as the plan to follow), the
content map already sketches a pipeline: select ~60–80 artifacts per the
curation ratings → export web derivatives (images → WebP/AVIF, ≤2560px hero /
≤1280px grid; PDFs → page rasters; videos → H.264 720p/1080p + poster) → strip
any personal data → name descriptively → drop into the matching
`public/content/clients/tata-iis/…` folder per `CONTENT_GUIDE.md`'s
folder-as-data conventions. Treat this as background, not instruction, until
told otherwise.

## Boundary — what this branch should NOT touch

Everything homepage-related is out of scope here: `HeroStage.tsx`,
`HeroVideo.tsx`, `HeroHeadline.tsx`, `SectionPanels.tsx`, `globals.css`,
`useSceneStore`'s `heroPose`. This work lives in `src/components/client/`,
`src/components/experience/` (extend without breaking the other 7 clients'
`ClientWip` pages, which share the framework), `src/constants/
clientExperiences.ts` (or a new per-client file — the content map suggests
`src/constants/clients/tata-iis.ts` — either is fine, follow whichever the
user picks), `public/content/clients/tata-iis/`, and possibly new fields in
`src/types/client.ts` / `src/types/experience.ts` for the six-system data
contract once that's built.

## Verify

`npx tsc --noEmit` · `npx eslint src` · `npm run build`. This route has none
of the homepage's WebGL/video verification quirks — `MediaViewer`, `AssetGrid`,
and every experience-framework component are plain DOM/SVG and should
screenshot normally in the browser preview tools.

## Reconnecting to `master` later

Nothing structural is needed — see "Conclusion" above. When the work is ready:
`git checkout master && git merge tata-iis-experience` (or review the diff
first if preferred). The route, the homepage links, and the SSG build all
already point at it.
