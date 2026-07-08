# DESIGN SYSTEM

The visual constitution: what the page is made of, and what it is never made of.

> **Tokens in code:** `src/constants/design.ts` (spacing, radius, shadows,
> z-index hierarchy, breakpoints), `src/constants/motion.ts` (durations,
> easings — see [MOTION.md](./MOTION.md)), `src/constants/typography.ts`
> (voices — see [TYPOGRAPHY.md](./TYPOGRAPHY.md)). Components style with
> Tailwind classes that MATCH these tokens; JS-styled layers (MemoryOverlay,
> MediaViewer) import them directly. No magic numbers.

## Philosophy — the gallery

The site is an art installation on a white wall. The page itself stays quiet so
the brain (and later, its animations) carries all the color and life.

- Background: **pure `#FFFFFF`**. No gradients, no textures, no off-whites on
  the page surface.
- Large negative space; the composition breathes.
- Nothing decorative that doesn't mean something.

## Color

| Role | Value | Notes |
|---|---|---|
| Page | `#FFFFFF` | the gallery wall |
| Ink / primary text | `neutral-900` | near-black, never pure black on white |
| Secondary text | `neutral-500` | descriptions, roles |
| Tertiary / meta | `neutral-400` | indexes, counts, notes |
| Hairlines | `neutral-200` (rest) → `neutral-400` (hover) | rules, borders, connectors |
| The sheet | `neutral-50` | the preview pane / index-page surface |
| Color itself | the right hemisphere's palette (`constants/brain.ts` `CREATIVE_PALETTE`) | color belongs to the artwork, not the UI |

The UI is deliberately achromatic: magenta/coral/amber/lime live **inside the
brain** (and future paint systems), which is what makes them land.

## Surfaces

- **The wall** — white, flat, everything at rest.
- **The sheet** — `bg-neutral-50`, `rounded-t-[2rem]`, hairline top border: the
  preview pane rising over the wall (and the `/clients` index page surface).
  The only non-white surface in the system.
- **Cards** — white on the sheet, `border-neutral-200`, square/near-square,
  hover: border darkens + a breath of lift (`-translate-y-0.5`). Shadows: two
  sanctioned exceptions only — the brain's contact shadow, and (since 3B) the
  sheet's whisper of top shadow (`0 -16px 48px -24px rgba(0,0,0,0.12)`), the
  Apple-sheet lift that makes its rise read as physical.

## Line language

Thin rules are the system's signature: nav underlines with dot terminals,
section top-borders, the connector stems in the institute tree, the
construction-grid hairlines in BrandOpening. Always 1px, always neutral,
darkening on interaction — never thickening.

## Layout grids

- **Hero (lg+)**: 3 columns — `[1fr | minmax(0,42vw) | 1fr]`. The center lane is
  reserved for the brain; navigation lives in the outer lanes. Labels can never
  overlap the artwork by construction.
- **Hero (<lg)**: vertical bands — canvas in the top ~58%, navigation centered
  in the bottom ~42%; the hero keeps `min-h-[600px]` so short viewports scroll
  slightly instead of clipping.
- **Sheet / client pages**: rail + body — `[minmax(0,17rem) | 1fr]`. The rail
  carries index, title, description; the body carries content. Repeated on the
  preview pane and every numbered client section, so the whole site reads as
  one system.
- **Card grids**: clients 2/3/6 columns; catalogue 1/2/3; photography 1/2/3 —
  all `gap-3/4`, breathing at `max-w-7xl`.

## Spacing

Tailwind scale, generous: sections `py-16/20`, sheet `pb-16/20`, card padding
`p-5/6`. Rhythm over density — when in doubt, add space, not elements.
