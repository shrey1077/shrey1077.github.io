/**
 * ExperienceFooter — the closing information block of an experience page.
 *
 * Company/attribution info in the rail+body rhythm: the studio identity on
 * the rail, the client record in the body, a hairline copyright row beneath.
 * Owner details come from constants/site.ts (one place to update); the
 * client record arrives as props so every experience states its own facts.
 *
 * It runs DARK against the page's gallery white — the owner's call, 2026-08-10.
 * The block used to be body-white with only a hairline above it, which left a
 * page trailing off rather than closing. Every colour in here is therefore
 * inverted from the body's: white headings, neutral-400 text, white/15 rules.
 * Anything added below has to follow that, or it disappears into the black.
 */

import { SITE } from "@/constants/site";
import { typeVoiceClass } from "@/constants/typography";

interface ExperienceFooterProps {
  /** The client's formal name for the record line. */
  clientName: string;
  /** Short factual lines about the engagement (partners, campuses, scope). */
  clientFacts?: string[];
}

export function ExperienceFooter({ clientName, clientFacts = [] }: ExperienceFooterProps) {
  const year = new Date().getFullYear();
  const range =
    year > SITE.inceptionYear ? `${SITE.inceptionYear}–${year}` : `${SITE.inceptionYear}`;

  return (
    <footer className="mt-6 bg-neutral-950 px-6 py-14 text-neutral-300 sm:px-10 sm:py-16">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,17rem)_1fr] lg:gap-16">
        {/* The studio. */}
        <div>
          <p className={`${typeVoiceClass("creative", "display")} text-xl text-white`}>
            {SITE.name}
          </p>
          <p className="mt-1.5 text-sm text-neutral-400">{SITE.role}</p>
          <a
            href={`mailto:${SITE.email}`}
            className={`${typeVoiceClass("logic", "meta")} mt-4 inline-block text-[0.65rem] text-neutral-400 transition-colors duration-300 hover:text-white`}
          >
            {SITE.email}
          </a>
        </div>

        {/* The client record. */}
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between sm:gap-10">
          <div>
            <p className={`${typeVoiceClass("logic", "meta")} text-[0.6rem] text-neutral-400`}>
              Client
            </p>
            <p className="mt-3 text-sm font-medium text-white">{clientName}</p>
            <ul className="mt-2 space-y-1">
              {clientFacts.map((fact) => (
                <li key={fact} className="text-sm leading-relaxed text-neutral-400">
                  {fact}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className={`${typeVoiceClass("logic", "meta")} text-[0.6rem] text-neutral-400`}>
              Elsewhere
            </p>
            <ul className={`${typeVoiceClass("logic", "meta")} mt-3 space-y-2 text-[0.65rem]`}>
              {[
                { label: "LinkedIn", href: SITE.linkedin },
                { label: "Behance", href: SITE.behance },
                { label: "Resume", href: SITE.resume },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-neutral-400 transition-colors duration-300 hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-12 flex flex-col gap-2 border-t border-white/15 pt-6 sm:flex-row sm:items-baseline sm:justify-between">
        <p className={`${typeVoiceClass("logic", "meta")} text-[0.6rem] text-neutral-400`}>
          © {range} {SITE.name}
        </p>
        <p className={`${typeVoiceClass("logic", "meta")} text-[0.6rem] text-neutral-400`}>
          Client work © {clientName} — shown as portfolio record
        </p>
      </div>
    </footer>
  );
}
