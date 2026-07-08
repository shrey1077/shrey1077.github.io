"use client";

/**
 * BrainSystems — mounts the homepage DOM/SVG animation systems as one overlay
 * (Phase 4). Sits above the WebGL canvas, below the navigation; each system is
 * gated by BOTH its registry toggle (useSystemsStore) and hero visibility
 * (`active`), so nothing animates off-screen or when disabled.
 *
 * The 3D systems (Brain Core breathing, lighting, interaction) live inside the
 * Canvas; these are the flanking flows and the neuron thoughts. Back-to-front:
 * creative colour → logical + detail linework → neuron thoughts on top.
 *
 * Decorative layer — pointer-events-none throughout so the brain keeps the
 * mouse. See docs/BRAIN_SYSTEM.md.
 */

import { CreativeFlow } from "@/components/flows/CreativeFlow";
import { LogicalFlow } from "@/components/flows/LogicalFlow";
import { DetailLayer } from "@/components/flows/DetailLayer";
import { NeuronEngine } from "@/components/flows/NeuronEngine";
import { useSystemsStore } from "@/state/useSystemsStore";

export function BrainSystems({ active }: { active: boolean }) {
  const flags = useSystemsStore((s) => s.flags);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-[5] overflow-hidden">
      {/* Right colour wash — furthest back. */}
      <CreativeFlow enabled={active && flags.creativeFlow} />
      {/* Right sketchbook detail — under the neuron thoughts. */}
      <DetailLayer enabled={active && flags.detailLayer} />
      {/* Left technical environment. */}
      <LogicalFlow enabled={active && flags.logicalFlow} />
      {/* Neuron firings — foreground. */}
      <NeuronEngine enabled={active && flags.neuronEngine} />
    </div>
  );
}
