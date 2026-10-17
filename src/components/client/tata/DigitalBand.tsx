/**
 * DigitalBand — band 08 of the Tata IIS page: the brand on screen
 * (2026-10-05). The socials, the website's banners and the placement deck,
 * on one wall (ScreenWall); under it the tools built for the institute,
 * Cerci and H3LEN, shown (ToolsWall, 2026-10-05); and in the margin the one
 * room with nothing on the site yet, Proposals, named so the page still
 * accounts for all the work.
 *
 * It took the place of the six rooms behind cards (TataSectionsBoard) and the
 * showcase above them (WorkShowcase); git has both. Everything else the rooms
 * held is laid open in 02 and 04–07.
 *
 * Server Component: it reads the catalogue; ScreenWall brings its own client
 * boundary.
 */

import { ScreenWall, type ScreenSet } from "@/components/client/tata/ScreenWall";
import { ToolsWall } from "@/components/client/tata/ToolsWall";
import { SideBand } from "@/components/client/tata/SideBand";
import { readCatalogueCategory } from "@/content/catalogue";
import { TATA_SECTIONS } from "@/constants/tataSections";
import { pieceName, tataPlate } from "@/constants/tataPlates";
import { TATA_ALSO_NOTE, TATA_DIGITAL_BAND, TATA_TOOLS } from "@/constants/tataStory";
import { onTataPage } from "@/constants/tataCull";

const SLUG = "tata-iis";
const LABEL = "tata-body text-[0.6rem] uppercase tracking-[0.2em] text-neutral-500";

function setOf(folder: string, label: string): ScreenSet {
  // Less the ones the owner took off the page (constants/tataCull.ts).
  const assets = (readCatalogueCategory(SLUG, folder)?.assets ?? []).filter((a) => a.kind === "image" && onTataPage(a.url));
  return {
    label,
    href: assets.length > 0 ? `/clients/${SLUG}/catalogue/${folder}` : undefined,
    plates: assets.map((a) => tataPlate(a.url, `${label} — ${a.caption ?? pieceName(a.name)}`)),
  };
}

export function DigitalBand() {
  const also = ["proposals"]
    .map((id) => TATA_SECTIONS.find((s) => s.id === id))
    .filter((s) => s !== undefined);
  // AI Solutions are SHOWN (ToolsWall, 2026-10-05); what has no shots yet is
  // named under them.
  const ai = TATA_SECTIONS.find((s) => s.id === "ai-solutions");
  const shown = new Set<string>(TATA_TOOLS.map((t) => t.label));
  const aiPending = (ai?.items ?? []).filter((i) => !shown.has(i.label)).map((i) => i.label);

  // The room with no files on the site yet — named, not shown. In the margin
  // column, under the band's words: the wall beside it is the taller of the
  // two, so here it costs no height.
  const aside = (
    <div className="space-y-6 border-t border-neutral-300/80 pt-5">
      {also.map((s) => (
        <div key={s.id}>
          <p className={LABEL}>
            {s.title} <span className="ml-1.5 text-neutral-400">· {TATA_ALSO_NOTE}</span>
          </p>
          <p className="tata-body mt-2 text-[0.8rem] leading-relaxed text-neutral-600">{s.blurb}</p>
          <ul className="mt-2 space-y-0.5">
            {s.items.map((item) => (
              <li key={item.label} className="tata-body text-[0.8rem] text-neutral-900">
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );

  return (
    <SideBand band={TATA_DIGITAL_BAND} id="tata-digital-title" anchor="digital" aside={aside}>
      <ScreenWall
        socials={setOf("socials-and-screens", "Socials")}
        banners={setOf("website-banners", "Website banners")}
        decks={setOf("presentations", "Presentations")}
      />
      <div className="mt-12">
        <ToolsWall blurb={ai?.blurb ?? ""} also={aiPending} />
      </div>
    </SideBand>
  );
}
