/**
 * Client detail route — `/clients/[slug]`.
 *
 * Branches on DATA, not code (docs/CLIENT_ARCHITECTURE.md):
 *   • a config in constants/clientExperiences.ts → the full ClientExperience
 *     (Tata IIS is the reference implementation), else
 *   • the minimal ClientWip page.
 *
 * `generateStaticParams` reads `CLIENTS`, so every client page is statically
 * generated; `notFound()` guards unknown slugs.
 */

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CLIENTS, clientBySlug } from "@/constants/clients";
import { clientExperienceBySlug } from "@/constants/clientExperiences";
import { ClientExperience } from "@/components/client/ClientExperience";
import { TataExperience } from "@/components/client/tata/TataExperience";
import { AzothExperience } from "@/components/client/azoth/AzothExperience";
import { UidExperience } from "@/components/client/uid/UidExperience";
import { CaseStudyExperience } from "@/components/client/case/CaseStudyExperience";
import { FREELANCE_EXPERIENCE } from "@/constants/freelanceExperience";
import { NEWSMOBILE_EXPERIENCE } from "@/constants/newsmobileExperience";
import { ClientWip } from "@/components/client/ClientWip";

interface ClientPageProps {
  params: Promise<{ slug: string }>;
}

/** Pre-render one page per known client. */
export function generateStaticParams() {
  return CLIENTS.map((client) => ({ slug: client.slug }));
}

export async function generateMetadata({
  params,
}: ClientPageProps): Promise<Metadata> {
  const { slug } = await params;
  const client = clientBySlug(slug);
  return { title: client ? `${client.name} — Client` : "Client" };
}

export default async function ClientPage({ params }: ClientPageProps) {
  const { slug } = await params;
  const client = clientBySlug(slug);
  if (!client) notFound();

  // Tata IIS runs a bespoke, directed layout (hero film → guidelines →
  // marquee → four work families → contact footer); every other configured
  // client uses the generic ClientExperience.
  if (slug === "tata-iis") {
    return <TataExperience />;
  }
  if (slug === "azoth-biotech") {
    return <AzothExperience />;
  }
  if (slug === "uid") {
    return <UidExperience />;
  }
  if (slug === "freelance") {
    return <CaseStudyExperience config={FREELANCE_EXPERIENCE} />;
  }
  if (slug === "newsmobile") {
    return <CaseStudyExperience config={NEWSMOBILE_EXPERIENCE} />;
  }

  const experience = clientExperienceBySlug(slug);
  if (experience) {
    return <ClientExperience client={client} config={experience} />;
  }
  return <ClientWip client={client} />;
}
