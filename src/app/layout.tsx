import type { Metadata, Viewport } from "next";
import { Caveat, Fraunces, IBM_Plex_Mono } from "next/font/google";
import { MemoryTransitionHost } from "@/components/transition/MemoryTransitionHost";
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

export const metadata: Metadata = {
  title: "Mind — Interactive Brain",
  description:
    "An interactive experience exploring the two sides of the mind: logic and creativity.",
};

export const viewport: Viewport = {
  // Lock the visual scale; the experience is a fixed, full-viewport canvas.
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
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
      className={`${caveat.variable} ${fraunces.variable} ${plexMono.variable}`}
    >
      <body className="bg-gallery text-neutral-900 antialiased">
        {children}
        {/* The memory-dive orchestrator — global so any page's client cards
            can begin a retrieval (thread → response → veil → dive). */}
        <MemoryTransitionHost />
      </body>
    </html>
  );
}
