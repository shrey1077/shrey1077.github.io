/**
 * Experience-framework type definitions.
 *
 * Client experiences are composed from reusable sections
 * (src/components/experience/ — see docs/CLIENT_ARCHITECTURE.md). These are
 * the data contracts those sections render from. Convention: `*Section`
 * components are section BODIES; the page composes them inside
 * `ExperienceSection` (the rail+body shell).
 */

/** One step in a ProcessSection (research → concept → system → delivery…). */
export interface ProcessStep {
  title: string;
  description: string;
}

/** One entry in a TimelineSection. */
export interface TimelineEntry {
  /** Display date — a year ("2024") or range ("2023–24"). */
  when: string;
  title: string;
  note?: string;
}

/** An anchor entry for ExperienceNavigation (built by the composing page). */
export interface ExperienceAnchor {
  /** Two-digit index ("01"). */
  index: string;
  title: string;
  /** The DOM id of the target ExperienceSection. */
  anchor: string;
}
