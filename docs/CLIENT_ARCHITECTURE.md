# CLIENT ARCHITECTURE

How every client page is structured. **Tata IIS is the reference
implementation** — every future client follows this pattern.

## The rule: pages branch on data, not code

`/clients/[slug]` (`app/clients/[slug]/page.tsx`):

```
clientBySlug(slug)            → 404 if unknown (constants/clients.ts)
clientExperienceBySlug(slug)  → config?  → <ClientExperience/>   (the full page)
                                 no?     → <ClientWip/>          (name + WIP + back)
```

A client graduates from WIP to a full experience by adding **one config entry**
(`src/constants/clientExperiences.ts`) and **one content directory**
(`public/content/clients/<slug>/`). No new page code, ever.

All routes are SSG: `generateStaticParams` reads `CLIENTS` for client pages and
walks the content filesystem for catalogue category pages.

## The experience framework (`src/components/experience/`)

Since Phase 2.6 all generic experience machinery is a reusable framework;
`components/client/` keeps only client-specific pieces (BrandOpening,
InstituteStructure, ClientWip). Convention: `*Section` components are section
BODIES; pages compose them inside `ExperienceSection`.

| Framework piece | Role |
|---|---|
| `ExperienceLayout` | page shell: back link, ExperienceTransition wrapper, FooterNavigation |
| `ExperienceHero` | eyebrow · display title · tagline |
| `ExperienceNavigation` | the quiet anchor row ("01 Brand · 02 Structure · …") |
| `ExperienceSection` | the rail+body shell every section sits in (anchor-able) |
| `CatalogueSection` → `CatalogueCard` | the folder-driven asset hub |
| `PhotographySection` | folder-driven collections through AssetGrid |
| `GallerySection` | a flat asset set through AssetGrid |
| `ProcessSection` | numbered how-it-was-made steps (`ProcessStep[]`) |
| `TimelineSection` | chronological entries down a rule-and-dot spine (`TimelineEntry[]`) |
| `AssetGrid` | ⚑ the modular asset grid — swap point for the immersive gallery |
| `MediaViewer` | focused single-asset viewing (lightbox; wired by the future gallery) |
| `FooterNavigation` | previous/next memory links through the client list (wrapping) |

Section data contracts live in `src/types/experience.ts`.

## The Tata IIS composition — four numbered sections

`ClientExperience` (Server Component) reads the filesystem (`readCatalogue`,
`readPhotography`), builds a section plan (which drives BOTH the numbering and
ExperienceNavigation — they can't desynchronize), and composes:

| # | Section | Body | Driven by |
|---|---|---|---|
| 01 | **Brand** | `BrandOpening` (client/) | config `brand` (+ future guidelines assets) |
| 02 | **Structure** | `InstituteStructure` (client/) | config `institute` (optional per client) |
| 03 | **Catalogue** | `CatalogueSection` | content folders (see CONTENT_GUIDE.md) |
| 04 | **Photography** | `PhotographySection` | content folders |

The rail + body grid matches the preview sheet, so client pages and the
homepage read as one system.

### 01 — BrandOpening (⚑ future animation slot)

Today: the client's text mark inside a real construction frame (thirds + center
guides as hairlines) with a quiet note. **The guidelines-driven logo-construction
animation (grid, proportions, spacing, typography, rationale) lands INSIDE this
component** when the official Logo Guidelines PDF arrives — drop assets into
`public/content/clients/<slug>/brand/`, extend this component, touch nothing
else.

### 02 — InstituteStructure

Config-driven org tree: parent card → hairline stem → spanning rule → N branch
cards (any count works; the rule spans between the first and last stems). Branch
`logoSrc` renders a real logo when assets land; until then a typographic
monogram of the city initial.

### 03 — Catalogue (the asset hub)

Fully folder-driven: one card per directory under
`public/content/clients/<slug>/catalogue/`, with counts, optional `_meta.json`
order/description, and an auto-generated route
`/clients/[slug]/catalogue/[category]` per folder. **New folder → new card +
new page, zero code.** Details in [CONTENT_GUIDE.md](./CONTENT_GUIDE.md).

### 04 — Photography

Folder-driven collections rendering through the reusable `AssetGrid` (images)
or a quiet placeholder while empty. `AssetGrid` is the ⚑ swap point for the
future immersive gallery (and where `MediaViewer` gets wired): its internals
change; the `ContentAsset[]` contract and every caller stay.

## Adding a client experience (checklist)

1. Client exists in `constants/clients.ts` (slug, name, sector).
2. Add a `ClientExperienceConfig` to `constants/clientExperiences.ts` — tagline,
   `brand` (markText + note), optional `institute` (parent + branches).
3. Create `public/content/clients/<slug>/` with `catalogue/` and `photography/`
   folders (empty folders are fine — cards show "Coming soon").
4. `npm run build` — the page, its catalogue routes, and its cards all exist.

## Config contract (`src/types/client.ts`)

```ts
ClientExperienceConfig {
  slug: string                     // must match constants/clients.ts
  tagline: string
  brand: { markText: string; note: string }
  institute?: {
    parentName: string
    parentNote: string
    branches: { id; name; city; logoSrc? }[]
  }
}
```

Copy that belongs to code lives here; assets belong to the filesystem. Keep that
split — it's what lets non-developers grow client pages by dropping folders.
