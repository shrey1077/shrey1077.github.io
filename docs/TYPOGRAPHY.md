# TYPOGRAPHY — the Constitution

Every idea on this site begins as a handwritten thought and ends as set type.
That pipeline is the typographic identity:

```
handwritten thought → pause → letter-by-letter paper flip → final typography
```

Phase 2.5 establishes the **structure** for that pipeline (voices, components,
per-letter DOM). The animation itself is a future phase and will land inside
`TypeReveal` without changing a single call site.

## The four voices

| Voice | Face | Where |
|---|---|---|
| **thought** | Caveat (script) | the handwritten first stage: nav scripts, margin notes ("Move to explore"), the SS monogram |
| **logic** | IBM Plex Mono — UPPERCASE, wide tracking | the FINAL type: nav finals, indexes, eyebrows, counts, metadata, structural titles |
| **creative** | Fraunces (serif, italic accents) | expressive display: client names, big headings, creative-section titles |
| **plain** | the neutral system sans | body copy and descriptions — the reading voice that lets the accents stay accents |

- Fonts load via `next/font` in `app/layout.tsx` (CSS variables) and become
  Tailwind utilities in `globals.css`: `font-hand-brand`, `font-mono-brand`,
  `font-serif-brand` (plain = Tailwind's `font-sans`).
- Voice/variant class strings live in **`src/constants/typography.ts`**
  (`TYPE_VOICES`, `typeVoiceClass(voice, variant)`), with three variants:
  `label` (nav/buttons), `display` (headings), `meta` (small structural text).
  Components never hand-pick font classes.

## The dual representation (navigation)

Each nav item renders the pipeline's two endpoints side by side, statically:

```
Clients   →   CLIENTS
(thought)     (final type)
```

…on a hairline rule with a dot terminal at the outer edge. This *is* the future
animation, paused: when the handwriting-to-type sequence ships, the pair becomes
its start and end states. Below `md`, only the compact thought renders (narrow
screens); the pair appears from `md` up. The hemispheres' voices still split the
interface elsewhere: left/structural surfaces speak logic; right/expressive
surfaces speak creative.

## TypeReveal — the one text component

`src/components/typography/TypeReveal.tsx` renders every piece of voiced text.

```tsx
<TypeReveal
  text="Clients"
  voice="thought" | "logic" | "creative"
  variant="label" | "display" | "meta"   // default label
  as="span" | "div" | "p" | "h1" | "h2" | "h3"
  reveal="settle" | "none"               // default none
  delay={0}                               // seconds, settle only
  ariaHidden                              // when a parent carries the name
/>
```

What it guarantees:

- **Per-letter spans, grouped by word** — words are `inline-block
  whitespace-nowrap` (no mid-word line breaks; real spaces between words keep
  wrap opportunities). This structure is the prerequisite for the letter-by-
  letter paper flip.
- **Accessibility** — the wrapper carries `aria-label={text}` (or `aria-hidden`
  when the parent owns the name, e.g. the nav's doubled label); letter spans are
  presentation-only.
- **Motion discipline** — `reveal="settle"` is a calm per-letter rise/fade;
  `"none"` renders statically (used where a parent orchestrates motion).
  `prefers-reduced-motion` always wins.

**The pipeline is LIVE (Phase 3B):** `reveal="pipeline"` runs the full
Constitution — handwritten writing-in (seeded per-letter cadence, rotation and
blur jitter: a hand, not a printer) → a held pause → letter-by-letter paper
flip (each cell swaps its in-flow glyph to `finalVoice` while Framer `layout`
reflows the line like paper settling) → final typography. Reduced motion renders
the final type immediately. The homepage's first thought — *"Every project
begins as a thought."* (`home/ThoughtLabel.tsx`, lg+) — performs it beneath the
sculpture as a museum wall label.

`Eyebrow` (same folder) is the recurring numbered section label ("01 — Brand")
in the logic voice — plain markup, server-safe.

## Rules

1. New text = pick a voice, render through TypeReveal (or `typeVoiceClass` for
   plain/server text). Never import a font class directly.
2. Sizing and color live at the call site; face/case/tracking live in the voice.
3. UPPERCASE is exclusively the logic voice's property.
4. The thought voice is always an *annotation* — it never sets body copy.
