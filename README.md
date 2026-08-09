# Mind — Interactive Brain (Portfolio v2)

An interactive creative installation that doubles as a portfolio: a top-view
anatomical brain, centered on a white gallery page, whose hemispheres represent
**logic** (left, monochrome ink) and **creativity** (right, color). The brain is
the navigation hub — sections surround it, content rises beneath it, and every
idea begins as a handwritten thought before becoming set type.

> **Phases 1–2.5 complete.** Foundation (3D brain, damped interaction, studio
> lighting) → navigation hub (nav, reusable preview sheet, client routes) →
> installation refactor (Typography Constitution, dual-type navigation, identity
> header, Tata IIS client experience, data-driven catalogue). Procedural
> circuits, paint flow, particles, and the handwriting animation are next.
> Start with [`docs/PROJECT.md`](./docs/PROJECT.md).

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production — every route statically generated
npx tsc --noEmit # typecheck
npx eslint src   # lint
```

In development a **Leva** panel (top-right, collapsed) exposes brain scale,
rotation, light intensity, camera distance, and shadow opacity. It is
dynamically imported dev-only and does not exist in production builds.

## Tech stack

Next.js (App Router) · TypeScript · Tailwind CSS v4 · React Three Fiber · drei ·
Zustand · Framer Motion · Leva (dev-only) · GSAP (installed, reserved) ·
Caveat + Fraunces + IBM Plex Mono via `next/font`.

## Documentation

| Doc | What it covers |
|---|---|
| [PROJECT.md](./docs/PROJECT.md) | vision, roadmap, architecture map, engineering principles |
| [DESIGN_SYSTEM.md](./docs/DESIGN_SYSTEM.md) | the gallery: color, surfaces, line language, grids |
| [TYPOGRAPHY.md](./docs/TYPOGRAPHY.md) | the Typography Constitution: voices, TypeReveal, the pipeline |
| [MOTION.md](./docs/MOTION.md) | animation philosophy, tokens, the motion inventory |
| [INTERACTIONS.md](./docs/INTERACTIONS.md) | hover/scroll/preview-sheet behavior, UI state |
| [CLIENT_ARCHITECTURE.md](./docs/CLIENT_ARCHITECTURE.md) | the Tata IIS reference architecture, adding clients |
| [BRAIN_SYSTEM.md](./docs/BRAIN_SYSTEM.md) | the 3D system, hot-path contract, swap points |
| [CONTENT_GUIDE.md](./docs/CONTENT_GUIDE.md) | code layout + the content filesystem conventions |

## Growing the site (no code required)

- **New catalogue category**: add a folder under
  `public/content/clients/<slug>/catalogue/` — a card and route appear.
- **New client experience**: one config entry + one content directory
  (see CLIENT_ARCHITECTURE.md).
- **New nav section / client / copy**: edit the lists in `src/constants/`.
