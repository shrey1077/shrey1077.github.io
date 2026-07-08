# src/hooks

Reserved for **cross-cutting** React hooks that are not owned by a single visual
system — e.g. a shared scroll-progress hook or a media-query hook used by
multiple future phases.

Hooks that belong to one system live next to that system instead (for example
the brain's hooks live in `src/components/brain/`). Phase 1 has no cross-cutting
hooks yet, so this directory is currently empty by design.
