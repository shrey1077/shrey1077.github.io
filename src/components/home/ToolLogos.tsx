/**
 * ToolLogos — the tool stack as a row of dark grey marks, all at one height.
 * Shared by the landing's Tools fact and the footer. Each mark carries its
 * name as alt text and a hover title; the row as a whole is a list.
 */

// Waits for its room (speed fix 4, nearness).
import { RoomImage as Image } from "@/components/home/nearness";
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
      {TOOLS.map((t) => {
        const h = Math.round(height * (t.scale ?? 1));
        return (
          <li key={t.id} title={t.name} className="shrink-0">
            <Image
              src={t.src}
              alt={t.name}
              width={Math.round(h * t.aspect)}
              height={h}
              className="block opacity-90 transition-opacity duration-200 hover:opacity-100"
              style={{ height: h, width: "auto" }}
            />
          </li>
        );
      })}
    </ul>
  );
}
