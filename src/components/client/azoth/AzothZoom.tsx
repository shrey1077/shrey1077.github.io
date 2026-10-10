"use client";

/**
 * AzothZoom — makes anything on the Azoth page open full size: it wraps the
 * picture it is given in a button, and opens the page's MediaViewer on
 * `plates[at]`, walking the rest of `plates` from there (2026-10-06).
 *
 * The picture itself is the caller's (server-rendered children), so every
 * section keeps its own composition and this only adds the way in.
 */

import { useState } from "react";
import { MediaViewer } from "@/components/experience/MediaViewer";

export interface AzothPlate {
  src: string;
  name: string;
}

export function AzothZoom({
  plates,
  at = 0,
  label,
  className = "",
  children,
}: {
  plates: readonly AzothPlate[];
  at?: number;
  /** Said to a screen reader — "Open … full size". */
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const n = plates.length;
  const step = (by: number) => setOpen((i) => (i === null ? i : (i + by + n) % n));

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(at)}
        aria-label={`Open ${label} full size`}
        className={`group block cursor-zoom-in text-left outline-none focus-visible:ring-2 focus-visible:ring-[#28A898] focus-visible:ring-offset-2 ${className}`}
      >
        {children}
      </button>
      <MediaViewer
        asset={open === null ? null : { name: plates[open].name, url: plates[open].src, kind: "image" }}
        onClose={() => setOpen(null)}
        onPrev={n > 1 ? () => step(-1) : undefined}
        onNext={n > 1 ? () => step(1) : undefined}
        position={open !== null && n > 1 ? { at: open + 1, of: n } : undefined}
      />
    </>
  );
}
