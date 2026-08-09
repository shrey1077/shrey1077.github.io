/**
 * TataFooter — the closing contact block for the Tata IIS experience.
 *
 * Mirrors the client's own footer: Contact Us, the two campus addresses, the
 * CIN, and the studio credit line. Institutional, quiet, legible.
 */

import { SITE } from "@/constants/site";
import { TATA_FOOTER } from "@/constants/tataExperience";
import { FooterRibbons } from "@/components/client/tata/FooterRibbons";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="tata-subhead text-lg text-neutral-900">{label}</h3>
      <div className="tata-body mt-3 space-y-1.5 text-sm leading-relaxed text-neutral-600">{children}</div>
    </div>
  );
}

export function TataFooter() {
  const year = new Date().getFullYear();
  const range = year > SITE.inceptionYear ? `${SITE.inceptionYear}–${year}` : `${SITE.inceptionYear}`;
  const [ahmedabad, mumbai] = TATA_FOOTER.campuses;

  return (
    <footer className="relative overflow-hidden border-t border-neutral-200 pt-16 pb-44 sm:pt-20 sm:pb-52">
      {/* The hero's blue & teal light ribbons, looping along the very bottom. */}
      <FooterRibbons />
      <div className="relative z-10 grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Contact Us">
          <p>
            <a href={`mailto:${TATA_FOOTER.contact.email}`} className="transition-colors hover:text-neutral-900">
              {TATA_FOOTER.contact.email}
            </a>
          </p>
          <p>
            <a href={`tel:${TATA_FOOTER.contact.phone.replace(/[^+\d]/g, "")}`} className="transition-colors hover:text-neutral-900">
              {TATA_FOOTER.contact.phone}
            </a>
          </p>
        </Field>

        <Field label={ahmedabad.name}>
          <p className="max-w-[16rem]">{ahmedabad.address}</p>
        </Field>

        <Field label={mumbai.name}>
          <p className="max-w-[16rem]">{mumbai.address}</p>
          <p className="tata-body pt-2 text-[0.6rem] text-neutral-500">CIN: {TATA_FOOTER.cin}</p>
        </Field>

        <div className="flex flex-col justify-between gap-8">
          <div>
            <p className="tata-subhead text-lg text-neutral-900">{SITE.name}</p>
            <p className="tata-body mt-1 text-sm text-neutral-600">{SITE.role}</p>
            <a href={`mailto:${SITE.email}`} className="tata-body mt-3 inline-block text-[0.62rem] text-neutral-500 transition-colors hover:text-neutral-900">
              {SITE.email}
            </a>
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-14 flex flex-col gap-2 border-t border-neutral-100 pt-6 sm:flex-row sm:items-baseline sm:justify-between">
        <p className="tata-body text-[0.6rem] text-neutral-500">© {range} {SITE.name}</p>
        <p className="tata-body text-[0.6rem] text-neutral-500">
          Client work © Tata Indian Institute of Skills — shown as portfolio record
        </p>
      </div>
    </footer>
  );
}
