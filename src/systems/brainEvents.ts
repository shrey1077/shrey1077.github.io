/**
 * brainEvents — the shared event system of the Brain Operating System.
 *
 * A deliberately tiny pub/sub OUTSIDE React: animation systems (NeuronEngine,
 * flows, lighting, the 3D core) coordinate through transient events without
 * causing a single React re-render. Anything reactive belongs in the Zustand
 * stores; anything per-frame belongs in `brainMotion`; anything MOMENTARY —
 * "a neuron fired", "a pulse happened" — belongs here.
 *
 * Rules: handlers must be cheap and must never call setState synchronously;
 * subscribe in effects, unsubscribe on cleanup.
 */

import type { Hemisphere } from "@/types/brain";

/** The event vocabulary. Extend deliberately; every event is documented. */
export interface BrainEventMap {
  /** A neuron fired — the start of a thought sequence on one side. */
  "neuron:fire": { side: Hemisphere; at: number };
  /** A thought finished its pipeline and faded. */
  "neuron:done": { side: Hemisphere };
  /** Something asked the sculpture to pulse (neuron events, transitions). */
  "brain:pulse": { side: Hemisphere | null; strength: number };
}

type Handler<E extends keyof BrainEventMap> = (payload: BrainEventMap[E]) => void;
type AnyHandler = (payload: never) => void;

/** Internally untyped (one Set of handlers per event); the public functions
 *  restore full type safety at the boundary. */
const handlers = new Map<keyof BrainEventMap, Set<AnyHandler>>();

export function onBrainEvent<E extends keyof BrainEventMap>(
  event: E,
  handler: Handler<E>,
): () => void {
  let set = handlers.get(event);
  if (!set) {
    set = new Set();
    handlers.set(event, set);
  }
  set.add(handler as AnyHandler);
  return () => set.delete(handler as AnyHandler);
}

export function emitBrainEvent<E extends keyof BrainEventMap>(
  event: E,
  payload: BrainEventMap[E],
): void {
  const set = handlers.get(event);
  if (!set) return;
  for (const handler of set) (handler as Handler<E>)(payload);
}
