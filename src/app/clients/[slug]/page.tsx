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

  const experience = clientExperienceBySlug(slug);
  if (experience) {
    return <ClientExperience client={client} config={experience} />;
  }
  return <ClientWip client={client} />;
}
