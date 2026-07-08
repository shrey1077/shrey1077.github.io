"use client";

/**
 * useFlowStream — spawn/lifetime manager for a stream of DOM flow items.
 *
 * The flow systems (LogicalFlow, DetailLayer) are DOM/SVG, so their per-item
 * motion runs on the GPU via Framer Motion; React only re-renders when the item
 * SET changes. This hook owns that set: it spawns items on a jittered interval
 * up to a cap, and removes each after its lifetime — a handful of setStates per
 * second, never per frame (docs/BRAIN_SYSTEM.md → performance).
 *
 * Gating: when `enabled` is false (system off, or hero off-screen) the stream
 * empties and all timers stop. Under `prefers-reduced-motion` it spawns a
 * single static batch and then holds — present, not animated.
 */

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { createSeededRandom, randomInRange, type SeededRandom } from "@/utils/random";

export interface FlowItem<T> {
  id: number;
  data: T;
  /** Lifetime in ms (the component fades out around this). */
  lifeMs: number;
}

interface Options<T> {
  enabled: boolean;
  /** Max simultaneously-alive items. */
  cap: number;
  /** Spawn gap range (ms). */
  spawn: [number, number];
  /** Item lifetime range (ms). */
  life: [number, number];
  /** Build one item's data from a seeded RNG (fresh seed per spawn). */
  create: (next: SeededRandom) => T;
  /** How many to pre-populate immediately so the stream isn't empty on mount. */
  initial?: number;
}

export function useFlowStream<T>(options: Options<T>): FlowItem<T>[] {
  const { enabled, cap, spawn, life, create, initial = 3 } = options;
  const reduceMotion = useReducedMotion();
  const [items, setItems] = useState<FlowItem<T>[]>([]);
  const nextId = useRef(1);
  // Keep `create` current without re-running the effect each render. Assigned in
  // an effect (not during render) and declared first so it runs before the spawn
  // effect's synchronous pre-populate on the same commit.
  const createRef = useRef(create);
  useEffect(() => {
    createRef.current = create;
  });

  useEffect(() => {
    if (!enabled) return;

    const timers = new Set<number>();
    const makeItem = (): FlowItem<T> => {
      const next = createSeededRandom((Math.random() * 0xffffffff) >>> 0);
      const lifeMs = randomInRange(next, life[0], life[1]);
      return { id: nextId.current++, data: createRef.current(next), lifeMs };
    };

    const remove = (id: number) => setItems((prev) => prev.filter((it) => it.id !== id));
    const add = () => {
      setItems((prev) => {
        if (prev.length >= cap) return prev;
        const item = makeItem();
        const t = window.setTimeout(() => remove(item.id), item.lifeMs);
        timers.add(t);
        return [...prev, item];
      });
    };

    // Pre-populate so the homepage is alive on first paint.
    for (let i = 0; i < Math.min(initial, cap); i += 1) add();

    if (reduceMotion) {
      return () => {
        timers.forEach((t) => window.clearTimeout(t));
        setItems([]);
      };
    }

    let loop = 0;
    const schedule = () => {
      const gap = spawn[0] + Math.random() * (spawn[1] - spawn[0]);
      loop = window.setTimeout(() => {
        add();
        schedule();
      }, gap);
      timers.add(loop);
    };
    schedule();

    return () => {
      window.clearTimeout(loop);
      timers.forEach((t) => window.clearTimeout(t));
      setItems([]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, cap, reduceMotion, spawn[0], spawn[1], life[0], life[1], initial]);

  return items;
}
