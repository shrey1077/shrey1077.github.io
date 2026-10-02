/**
 * ToolLogos — the tool stack as a row of dark grey marks, all at one height.
 * Shared by the landing's Tools fact and the footer. Each mark carries its
 * name as alt text and a hover title; the row as a whole is a list.
 */

import Image from "next/image";
import { TOOLS } from "@/constants/tools";

export function ToolLogos({
  height,
  className = "",
}: {
  /** Mark height in px; widths follow each mark's own aspect. */
  height: number;
  className?: string;
}) {
  return (
    <ul aria-label="Tools" className={`flex flex-wrap items-center ${className}`}>
      {TOOLS.map((t) => (
        <li key={t.id} title={t.name} className="shrink-0">
          <Image
            src={t.src}
            alt={t.name}
            width={Math.round(height * t.aspect)}
            height={height}
            className="block opacity-90 transition-opacity duration-200 hover:opacity-100"
            style={{ height, width: "auto" }}
          />
        </li>
      ))}
    </ul>
  );
}
