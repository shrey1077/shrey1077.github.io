# 06 — PROJECT RULES (permanent)

1. **Architecture is frozen** (`04_FREEZE.md`). Never redesign working systems
   unless the user explicitly asks.
2. **Prioritize pixels over abstractions.** Ship visible improvement, not new
   layers of indirection.
3. **Every task must produce a visible improvement.** If it doesn't change what
   the visitor sees or feels, question it.
4. **Batch edits.** Group related changes; verify once per milestone.
5. **Keep responses concise.** No progress diaries, no narration of every step,
   no restating the plan. Summarize at milestones.
6. **Avoid unnecessary refactors.** Touch the minimum to achieve the goal.
7. **Never redesign working systems.** Extend or tune; don't rebuild.
8. **One artistic objective per conversation.** Finish it well.
9. **Respect the invariants:** pure white background; hot-path contract (no
   per-frame React setState); constants/filesystem as source of truth; Leva
   dev-only; no bounce/spinner/stock-photo; reduced-motion supported.
10. **Verify before claiming done:** `npx tsc --noEmit`, `npx eslint src`,
    `npm run build`. WebGL isn't screenshot-able here — verify via `preview_eval`
    or the Node geometry verifier.
