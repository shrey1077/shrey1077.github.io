import type { Metadata, Viewport } from "next";
import {
  Anton,
  Barlow,
  Caveat,
  Caveat_Brush,
  Cinzel,
  Fraunces,
  IBM_Plex_Mono,
  Michroma,
  Orbitron,
  Playfair_Display,
  Syne,
} from "next/font/google";
import { MemoryTransitionHost } from "@/components/transition/MemoryTransitionHost";
import { RotateGate } from "@/components/home/RotateGate";
import "./globals.css";

/**
 * Root layout. Minimal chrome — a pure-white document surface plus the three
 * brand font families that carry the Typography Constitution's voices
 * (docs/TYPOGRAPHY.md):
 *
 *   • Caveat (script)       → the "thought" voice — the handwritten first stage
 *                             of every idea (nav scripts, margin notes).
 *   • IBM Plex Mono (mono)  → the "logic" voice — the final, set type.
 *   • Fraunces (serif)      → the "creative" voice — expressive display text.
 *
 * All are exposed as CSS variables and mapped to Tailwind tokens in globals.css
 * (`font-hand-brand` / `font-mono-brand` / `font-serif-brand`). Base body text
 * stays on the neutral system sans — the voices are accents, not wallpaper.
 */

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
});

/** The painted voice — a brush face with true lowercase, for the creative
 *  half of the landing headline. */
const caveatBrush = Caveat_Brush({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-brush",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

/* Client brand voices (docs/TATA_IIS_BUILD_PROMPT.md — CP7 refinement).
 * Each client experience may declare a `brandTheme` whose display moments
 * (hero name, category titles) speak in a face evoking that brand's own
 * typography. Fonts are only fetched on pages whose text actually uses them.
 *
 *   • Cinzel    → Tata IIS (engraved inscriptional caps — set UPPERCASE with
 *                 wide tracking to evoke the Copperplate Gothic wordmark)
 *   • Michroma  → Azoth Biotech (wide technical geometric sans)
 *   • Anton     → NewsMobile (condensed news headline — display sizes only)
 *   • Orbitron  → Zabraku Media (techno display; large, tracked-out use only)
 *   • Syne      → UID (an expressive, characterful display grotesque — a design
 *                 school deserves its own voice, not the site default serif)
 */

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-cinzel",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const michroma = Michroma({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-michroma",
  display: "swap",
});

const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
  display: "swap",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-orbitron",
  display: "swap",
});

/** Azoth's hero voice — the italic display face the client's own hero comp
 *  was built around ("Inspired by Nature"). Italic only; nothing else on the
 *  site uses it. */
const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["italic"],
  weight: ["400", "500"],
  variable: "--font-playfair",
  display: "swap",
});

/** ABS Wholesale's page voice. The owner asked for Barlow across that room,
 *  with weight — not family — carrying the hierarchy, so the full ramp ships:
 *  300 for the intro body, 500/600 for sub-heads, 700/800 for headlines. */
const barlow = Barlow({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-barlow",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mind — Interactive Brain",
  description:
    "An interactive experience exploring the two sides of the mind: logic and creativity.",
};

/**
 * ⚠ `maximumScale: 1` was here until 2026-08-16 — "lock the visual scale; the
 * experience is a fixed, full-viewport canvas". It blocked pinch-zoom, which is
 * a WCAG 2.1 AA failure (1.4.4 Resize Text) and a real barrier for anyone who
 * enlarges to read. Do not put it back.
 *
 * The canvas argument does not hold, for two reasons. Pinch-zoom moves the
 * VISUAL viewport, not the layout viewport — so `100svh`, the media queries
 * behind `useIsPhone`/`useIsCompact`, `BrainPins`' ResizeObserver anchors and
 * `HeroName`'s fixed viewport fractions are all measured off the layout
 * viewport and do not move when the visitor zooms. And since `SectionNav`
 * landed, the page below `lg` is an ordinary scrolling document anyway.
 *
 * `userScalable` is left unset on purpose: the default is already "yes", and
 * spelling it out invites the next reader to treat it as a dial worth turning.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f9f9f9",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${caveat.variable} ${caveatBrush.variable} ${fraunces.variable} ${plexMono.variable} ${cinzel.variable} ${michroma.variable} ${anton.variable} ${orbitron.variable} ${playfair.variable} ${syne.variable} ${barlow.variable}`}
    >
      <body className="bg-gallery text-neutral-900 antialiased">
        {children}
        {/* The memory-dive orchestrator — global so any page's client cards
            can begin a retrieval (thread → response → veil → dive). */}
        <MemoryTransitionHost />
        {/* Asks a phone to turn sideways, then widens the layout viewport so
            landscape actually gets the desktop composition rather than the
            same narrow one on its side. Renders nothing anywhere else. */}
        <RotateGate />
      </body>
    </html>
  );
}
