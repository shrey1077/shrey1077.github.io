"use client";

/**
 * MemoryTransitionHost — the memory-dive orchestrator (Phase 3B, v1).
 *
 * Mounted once in the root layout, it waits for a client card to set
 * `pendingMemory` (slug + click point), then performs the retrieval sequence
 * from the storyboard — never a spinner, never a fade-to-black:
 *
 *   1. THREAD  (0ms)   — BrainConnection draws from the card back toward the
 *                        brain (or toward the mind "above" if off-screen).
 *   2. RESPONSE (0ms)  — the brain acknowledges: the existing hover machinery
 *                        (lean + pulse + lighting breath) is pointed at the
 *                        left hemisphere, where client memories live.
 *   3. VEIL   (~450ms) — MemoryOverlay settles like recall washing over vision.
 *   4. DIVE   (~950ms) — the route changes beneath the veil; the experience's
 *                        own settle plays as the veil lifts with the new page.
 *
 * Reduced motion: immediate navigation, no theatrics.
 */

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useReducedMotion } from "framer-motion";
import { useSceneStore } from "@/state/useSceneStore";
import { BrainConnection } from "@/components/transition/BrainConnection";
import { MemoryOverlay } from "@/components/transition/MemoryOverlay";

/** Sequence timing (ms). */
const VEIL_AT = 450;
const NAVIGATE_AT = 950;

/** Where the thread travels: the brain's live position if the hero is present,
 *  otherwise straight up beyond the viewport — the mind is always above. */
function brainTarget(): { x: number; y: number } {
  const hero = document.querySelector(
    'section[aria-label="Interactive brain navigation"]',
  );
  if (hero) {
    const rect = hero.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height * 0.42 };
  }
  return { x: window.innerWidth / 2, y: -80 };
}

export function MemoryTransitionHost() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const pendingMemory = useSceneStore((s) => s.pendingMemory);
  const [veil, setVeil] = useState(false);
  const [target, setTarget] = useState<{ x: number; y: number } | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    if (!pendingMemory) return;
    const { slug } = pendingMemory;
    const store = useSceneStore.getState();

    if (reduceMotion) {
      store.setPendingMemory(null);
      router.push(`/clients/${slug}`);
      return;
    }

    // 1–2) Thread + the brain's acknowledgment (reuses the hover machinery:
    //      lean, pulse, lighting breath — one language for attention). The
    //      target is measured on the next frame (DOM read + setState stay out
    //      of the synchronous effect body).
    const raf = requestAnimationFrame(() => {
      setVeil(false); // clean slate if a previous dive's flag lingered
      setTarget(brainTarget());
    });
    store.setAnimationState("transitioning");
    store.setHoveredNav({ id: "clients", hemisphere: "left" });

    // 3) The veil settles.
    timers.current.push(window.setTimeout(() => setVeil(true), VEIL_AT));

    // 4) The dive. State resets so the next page (and a Back return) start clean;
    //    the veil unmounts with this host's page transition.
    timers.current.push(
      window.setTimeout(() => {
        store.setHoveredNav(null);
        store.setAnimationState("idle");
        store.setPendingMemory(null);
        router.push(`/clients/${slug}`);
      }, NAVIGATE_AT),
    );

    return () => {
      cancelAnimationFrame(raf);
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
    };
  }, [pendingMemory, reduceMotion, router]);

  // Visuals derive from pendingMemory — nothing to reset imperatively: the
  // thread renders only mid-dive, and the veil exits when the dive ends.
  return (
    <>
      {pendingMemory && target && (
        <BrainConnection
          from={{ x: pendingMemory.x, y: pendingMemory.y }}
          to={target}
        />
      )}
      <MemoryOverlay active={veil && pendingMemory !== null} />
    </>
  );
}
