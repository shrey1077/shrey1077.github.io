# START HERE

**Current, whole-site handoff: [`11_SITE_HANDOFF.md`](./11_SITE_HANDOFF.md).**
Read that first. Everything below is earlier-phase history.

---

# 00 — START HERE (new-session SOP)

How to continue this project in a fresh Claude conversation with minimum context.

## Step 1 — Open the new chat with this exact message
> Read `docs/HANDOFF/07_CONTEXT_BOOTSTRAP.md`, then `01_PROJECT_STATE.md` and
> `05_NEXT_SESSION.md`. Follow `06_PROJECT_RULES.md` and treat `04_FREEZE.md` as
> frozen. Don't read any other docs unless a task needs them. Confirm you've read
> them, then wait for my objective.

(Project root: `D:\Brain Folio`. Not a git repo.)

## Step 2 — Reading order (only these first)
1. `07_CONTEXT_BOOTSTRAP.md` — all core facts (≈1 page).
2. `01_PROJECT_STATE.md` — what's done / not done.
3. `05_NEXT_SESSION.md` — the objective + guardrails.
4. `06_PROJECT_RULES.md` + `04_FREEZE.md` — how to work / what not to touch.
- `02_ARCHITECTURE.md` and `03_BRAIN_VISION.md` = on demand only.
- The 13 docs in `docs/*.md` (deep dives) = only when a task needs one.

## Step 3 — Establish a clean baseline BEFORE any new work
Phase 4 (`components/flows/*`, `src/systems/*`) is mid-build, unverified, with 2
ESLint errors. First thing in the new session, get green:
```
npx tsc --noEmit
npx eslint src
npm run build
```
If lint/build fail on the flow systems, either fix the 2 errors
(`flows/NeuronEngine.tsx` setState-in-effect; `flows/useFlowStream.ts`
ref-in-render) or turn those systems off (they're gated by `useSystemsStore`,
mounted only in `HeroStage` lg+). Do this before starting the objective.

## Step 4 — State the ONE objective
Per `05_NEXT_SESSION.md`: improve **only the homepage brain** (visual quality).
No Tata IIS, no client pages, no asset import, no new systems, no doc rewrites.
One artistic objective for the session.

## Step 5 — Verify visually
The preview screenshot tool does NOT reliably capture the WebGL brain. Verify via
`preview_eval` reading the R3F scene, and/or the geometry math verifier at
`…/scratchpad/verify-brain.mjs`. Finish green (tsc + eslint + build).

## If you want to resume Phase 4 instead
Say so explicitly in the new chat. Start point: fix the 2 ESLint errors, then run
the dev server and verify neuron firings + flows behave, then `npm run build`.
Vision reference: `03_BRAIN_VISION.md`.
