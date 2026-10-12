import type { Metadata, Viewport } from "next";
import {
  Anton,
  Barlow,
  Caveat,
  Caveat_Brush,
  Cinzel,
  Fraunces,
  Great_Vibes,
  IBM_Plex_Mono,
  Inter_Tight,
  Michroma,
  Orbitron,
  Playfair_Display,
  Syne,
  Tinos,
} from "next/font/google";
import { MemoryTransitionHost } from "@/components/transition/MemoryTransitionHost";
import { ScreenGuard } from "@/components/guard/ScreenGuard";
import { SITE } from "@/constants/site";
import { SITE_DESCRIPTION, SITE_IMAGE, SITE_TITLE } from "@/constants/seo";
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
  // Fetched only where a page uses it (speed fix 5).
  preload: false,
});

/** The painted voice — a brush face with true lowercase, for the creative
 *  half of the landing headline. */
const caveatBrush = Caveat_Brush({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-brush",
  display: "swap",
  // Fetched only where a page uses it (speed fix 5).
  preload: false,
});

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
  // Fetched only where a page uses it (speed fix 5).
  preload: false,
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
  // Fetched only where a page uses it (speed fix 5).
  preload: false,
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
  // Fetched only where a page uses it (speed fix 5).
  preload: false,
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
  // Fetched only where a page uses it (speed fix 5).
  preload: false,
});

const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
  display: "swap",
  // Fetched only where a page uses it (speed fix 5).
  preload: false,
});

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-orbitron",
  display: "swap",
  // Fetched only where a page uses it (speed fix 5).
  preload: false,
});

/** Azoth's hero voice — the italic display face the client's own hero comp was
 *  built around ("Inspired by Nature").
 *
 *  ⚠ THE ROMAN CUT IS HERE FOR TATA IIS (2026-09-22). The owner's mockup for
 *  that page sets every band headline in an upright high-contrast serif, and
 *  this family is already loaded — see `.tata-display`. Azoth still asks for
 *  the italic only, and a browser downloads just the cuts a page actually
 *  uses, so neither page pays for the other's. */
const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500"],
  variable: "--font-playfair",
  display: "swap",
  // Fetched only where a page uses it (speed fix 5).
  preload: false,
});

/** ABS Wholesale's page voice. The owner asked for Barlow across that room,
 *  with weight — not family — carrying the hierarchy, so the full ramp ships:
 *  300 for the intro body, 500/600 for sub-heads, 700/800 for headlines. */
const barlow = Barlow({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-barlow",
  display: "swap",
  // Fetched only where a page uses it (speed fix 5).
  preload: false,
});

/** The landing's "Left brain / Right brain" pair (2026-10-02), set after the
 *  owner's reference — a heavy Helvetica-style grotesque for "Left", a
 *  calligraphic script for "Right", a light grotesque for "brain" and a
 *  Times-style serif for the lines under each. Free stand-ins for the
 *  reference's commercial faces; used on the landing only, so no other page
 *  downloads them. Tokens: --font-lr-* in globals.css. */
const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["300", "800"],
  variable: "--font-inter-tight",
  display: "swap",
  // Fetched only where a page uses it (speed fix 5).
  preload: false,
});

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-great-vibes",
  display: "swap",
  // Fetched only where a page uses it (speed fix 5).
  preload: false,
});

const tinos = Tinos({
  subsets: ["latin"],
  // 700 carries the last word of each line, which the copy lands on.
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-tinos",
  display: "swap",
  // Fetched only where a page uses it (speed fix 5).
  preload: false,
});

/** The site's name in every tab and search result (Step 4, 2026-10-13 — it
 *  was "Mind — Interactive Brain"). Every page but home sets its own title,
 *  which the template follows with the name; see constants/seo. The icons
 *  are the files beside this one (icon.png, apple-icon.png, favicon.ico —
 *  scripts/make-og-images.mjs). */
export const metadata: Metadata = {
  metadataBase: new URL(SITE.website),
  title: { default: SITE_TITLE, template: `%s — ${SITE.name}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE.name,
  authors: [{ name: SITE.name, url: SITE.website }],
  creator: SITE.name,
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: "en_IN",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [SITE_IMAGE],
  },
  twitter: { card: "summary_large_image", title: SITE_TITLE, description: SITE_DESCRIPTION, images: [SITE_IMAGE.url] },
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
      className={`${caveat.variable} ${caveatBrush.variable} ${fraunces.variable} ${plexMono.variable} ${cinzel.variable} ${michroma.variable} ${anton.variable} ${orbitron.variable} ${playfair.variable} ${syne.variable} ${barlow.variable} ${interTight.variable} ${greatVibes.variable} ${tinos.variable}`}
    >
      <body className="bg-gallery text-neutral-900 antialiased">
        {children}
        {/* The memory-dive orchestrator — global so any page's client cards
            can begin a retrieval (thread → response → veil → dive). */}
        <MemoryTransitionHost />
        {/* Deterrents against capturing the work, on every page (owner,
            2026-10-05) — see ScreenGuard; a page cannot truly stop a
            screenshot. */}
        <ScreenGuard />
        {/* RotateGate stood here until 2026-10-03: it asked phones to turn
            sideways and then laid the page out at 1280px and scaled it down.
            The owner asked for the site to be fully responsive instead, so
            every width now gets its own layout. Deleted; git has it. */}
      </body>
    </html>
  );
}
