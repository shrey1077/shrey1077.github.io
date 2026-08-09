/**
 * Typography Constitution — voice tokens.
 *
 * The interface speaks in three voices (docs/TYPOGRAPHY.md), staging the
 * Constitution's pipeline: every idea begins handwritten and ends as set type.
 *
 *   • "thought"  — Caveat script. The handwritten first stage: nav scripts,
 *                  margin notes ("Move to explore"), the SS monogram.
 *   • "logic"    — IBM Plex Mono, uppercase, wide tracking. The FINAL type:
 *                  nav finals, structure, indexes, eyebrows, metadata.
 *   • "creative" — Fraunces serif, italic accents. Expressive display text:
 *                  client names, big headings, creative-section titles.
 *   • "plain"    — the neutral system sans. Body copy, descriptions — the
 *                  reading voice that lets the other three stay accents.
 *
 * In the navigation both stages render side by side (thought → final) — the
 * static representation of the future handwriting-to-type animation.
 *
 * Components never hand-pick font classes; they ask for a voice + variant here,
 * so the constitution can evolve in one place.
 */

export type TypographyVoice = "thought" | "logic" | "creative" | "plain";

export type TypographyVariant = "label" | "display" | "meta";

/** Tailwind class strings per voice/variant. Sizing stays at the call site;
 *  these define family, case, tracking, and style only. */
export const TYPE_VOICES: Record<
  TypographyVoice,
  Record<TypographyVariant, string>
> = {
  thought: {
    /** Handwritten nav scripts and notes. */
    label: "font-hand-brand",
    /** Large script (the SS monogram). */
    display: "font-hand-brand",
    /** Small margin notes ("Move to explore"). */
    meta: "font-hand-brand",
  },
  logic: {
    /** Nav labels, buttons. */
    label: "font-mono-brand uppercase tracking-[0.18em]",
    /** Larger structural headings. */
    display: "font-mono-brand uppercase tracking-[0.12em]",
    /** Small indexes, counts, eyebrows. */
    meta: "font-mono-brand uppercase tracking-[0.22em]",
  },
  creative: {
    /** Nav labels — expressive, italic. */
    label: "font-serif-brand italic",
    /** Big display headings, client names. */
    display: "font-serif-brand",
    /** Small expressive asides. */
    meta: "font-serif-brand italic",
  },
  plain: {
    /** Neutral labels. */
    label: "font-sans",
    /** Neutral headings (rare — the other voices usually carry headings). */
    display: "font-sans",
    /** Neutral small text. */
    meta: "font-sans",
  },
};

/** Resolve a voice/variant to its class string. */
export function typeVoiceClass(
  voice: TypographyVoice,
  variant: TypographyVariant = "label",
): string {
  return TYPE_VOICES[voice][variant];
}
