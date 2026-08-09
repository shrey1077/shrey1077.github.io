# CONTENT GUIDE

Where everything lives: the code folder map, and the content filesystem that
grows without code changes.

## Code layout (`src/`)

```
src/
├── app/                      routes (Server Components)
│   ├── page.tsx              homepage (HeroStage → PreviewPane → SiteFooter)
│   ├── clients/page.tsx      /clients index
│   ├── clients/[slug]/page.tsx               client page (experience|WIP branch)
│   └── clients/[slug]/catalogue/[category]/  auto-generated category pages
├── components/
│   ├── home/                 HeroStage · IdentityHeader · BrainNavigation · NavItem
│   ├── typography/           TypeReveal · Eyebrow (the Constitution in code)
│   ├── preview/              PreviewPane · ClientsPreview · ClientCard · ComingSoonPreview
│   ├── experience/           the reusable framework: ExperienceLayout · Hero ·
│   │                         Navigation · Section · Catalogue* · Photography ·
│   │                         Gallery · Process · Timeline · AssetGrid(⚑) ·
│   │                         MediaViewer · FooterNavigation
│   ├── client/               client-specific: ClientExperience (composition) ·
│   │                         BrandOpening · InstituteStructure · ClientWip
│   ├── transition/           ExperienceTransition · MemoryOverlay · BrainConnection
│   ├── scene/                SceneCanvas · CameraRig · Lighting · SceneEnvironment
│   ├── brain/                Brain + six subsystems: BrainModel(⚑) · BrainMaterials ·
│   │                         useBrainInteraction · BrainAnimation · BrainEffects ·
│   │                         useHemisphereTexture · useBrainScale
│   └── debug/                DebugPanel (Leva — dev-only, sole importer)
├── content/                  ⚠ SERVER-ONLY filesystem readers (node:fs)
│   └── catalogue.ts          readCatalogue · readCatalogueCategory · readPhotography
├── constants/                design · motion · typography (tokens) · scene · brain ·
│                             navigation · clients · clientExperiences · site ·
│                             ideas/ (leftIdeas · rightIdeas — the idea engine seed)
├── state/                    useSceneStore · useDebugStore (Zustand)
├── hooks/                    useInViewport (cross-cutting only)
├── utils/                    math · viewport · random · motion (pure helpers)
├── types/                    scene · brain · navigation · client · experience · ideas
└── styles/                   reserved for future phase stylesheets
```

Placement rules: tunables → `constants/`; system-owned hooks live beside their
system; only genuinely shared hooks in `hooks/`; pure helpers in `utils/`;
anything touching `node:fs` in `src/content/` and imported ONLY from server
code.

## The content filesystem (`public/content/`)

Assets live on disk, not in code. Top-level structure (Phase 2.6):

```
public/content/
├── clients/                  per-client experiences (below)
├── art/                      the Art section's future assets
├── photography/              global photography (non-client)
├── projects/                 project case assets
├── publications/             published work
├── ideas/                    idea-engine visual assets
├── videos/                   motion work
└── logos/                    the logofolio
```

The non-client directories are seeded and awaiting their sections — each will
follow the same folder-as-data conventions below when its section is built.

```
public/content/clients/<slug>/
├── brand/                    logo & guideline assets (BrandOpening, branch logos)
├── catalogue/
│   ├── Brand Guidelines/     ← one folder = one category = one card = one route
│   │   ├── _meta.json        optional { "order": 1, "description": "…" }
│   │   └── …files            the category's assets
│   ├── Certificates/
│   └── …                     add a folder → a card appears. No code.
└── photography/
    ├── Campus/               ← one folder = one collection in the gallery
    └── …
```

### Conventions

- **Folder name = display name**, verbatim ("Brand Guidelines"). Route ids are
  derived (`folderToId`: lowercase, `&`→`and`, non-alphanumerics→`-`).
- **`_meta.json`** (optional, per folder): `order` (sort priority; unordered
  folders follow alphabetically) and `description` (card + page blurb).
  Malformed/missing meta can never break a page.
- **Ignored entries**: dotfiles, `.gitkeep`, anything starting with `_`.
- **Asset kinds** by extension — images (jpg/png/webp/avif/gif/svg) render in
  GalleryGrid; videos/documents/other list as quiet file rows. Counts are
  recursive (subfolders may organize a category).
- URLs are `/content/...` paths (served from /public), segment-encoded — spaces
  in folder names are fine.

### Update semantics

- **Dev**: filesystem reads happen per render — drop a folder, reload, it's
  there (verified: 11 cards → add folder → 12 cards, zero code).
- **Production**: pages are statically generated, so new folders/files appear at
  the **next build**. "No code changes" ≠ "no rebuild" — deploys pick content
  up automatically.

## Other assets

- `public/models/` — reserved for the real anatomical brain GLB (see the swap
  point in BRAIN_SYSTEM.md).
- `public/resume.pdf` — the footer's Resume link target (drop the file in).
- Fonts are NOT assets — they load via `next/font` (see TYPOGRAPHY.md).
