/**
 * Homepage.
 *
 * Phase 2 layout — a scrollable document, roughly one viewport tall when idle:
 *
 *   HeroStage    (~90vh)  the interactive brain + navigation
 *   PreviewPane  (0 → auto) hidden until a nav item is clicked, then expands
 *   SiteFooter   (~10vh)  minimal contact footer
 *
 * Stays a Server Component; each child carries its own `"use client"` boundary
 * where needed (HeroStage, PreviewPane). The shared Zustand store connects the
 * navigation (in HeroStage) to the preview pane without prop drilling.
 */

import { HeroStage } from "@/components/home/HeroStage";
import { PreviewPane } from "@/components/preview/PreviewPane";
import { SiteFooter } from "@/components/footer/SiteFooter";

export default function Home() {
  return (
    <main className="w-full bg-white">
      <HeroStage />
      <PreviewPane />
      <SiteFooter />
    </main>
  );
}
