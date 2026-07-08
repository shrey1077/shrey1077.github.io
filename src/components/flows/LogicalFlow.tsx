"use client";

/**
 * LogicalFlow — the left hemisphere's living technical environment (Phase 4).
 *
 * Ambient, continuous, never obviously repeating: circuit traces route out of
 * the cortex, node graphs assemble, and math / code / matrix fragments surface
 * and fade — a mind doing structured work. NOT particles, NOT noise: each item
 * is a legible piece of engineering, seeded per spawn (flowGeometry.ts), drawn
 * in (stroke pathLength) and dissolved by Framer Motion on the GPU.
 *
 * Occupies the left band of the hero, emanating from the brain's left edge.
 * Decorative (aria-hidden). Managed by useFlowStream (capped, gated, reduced-
 * motion aware). See docs/BRAIN_SYSTEM.md.
 */

import { memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EASE_OUT } from "@/constants/motion";
import { FLOW_LIMITS } from "@/constants/systems";
import { randomInRange, type SeededRandom } from "@/utils/random";
import { useFlowStream } from "@/components/flows/useFlowStream";
import {
  circuitTrace,
  nodeGraph,
  pick,
  CODE_FRAGMENTS,
  ITEM_VIEW,
  MATH_GLYPHS,
  MATRIX_BLOCKS,
} from "@/components/flows/flowGeometry";
import { typeVoiceClass } from "@/constants/typography";

type LogicalKind = "circuit" | "node" | "math" | "code" | "matrix";

interface LogicalItem {
  kind: LogicalKind;
  /** Placement within the left band, in %. */
  x: number;
  y: number;
  scale: number;
  seedPayload: ReturnType<typeof circuitTrace> | ReturnType<typeof nodeGraph> | string;
}

/** Node-graph constellations dominate (the reference's pin-and-line network
 *  emerging from the left hemisphere); circuits, math and code punctuate. */
const KINDS: LogicalKind[] = ["node", "circuit", "node", "math", "node", "matrix", "node", "code"];

function createLogicalItem(next: SeededRandom): LogicalItem {
  const kind = pick(next, KINDS);
  // Over the left hemisphere, hugging the fissure — inside the brain zone and
  // clear of the flanking navigation (x is % of the left half; ~40→95 maps to
  // ~20→48% of the viewport, well right of the nav pills).
  const x = randomInRange(next, 40, 95);
  const y = randomInRange(next, 22, 74);
  const scale = randomInRange(next, 0.7, 1.15);
  let seedPayload: LogicalItem["seedPayload"];
  if (kind === "circuit") seedPayload = circuitTrace(next);
  else if (kind === "node") seedPayload = nodeGraph(next);
  else if (kind === "math") seedPayload = pick(next, MATH_GLYPHS);
  else if (kind === "code") seedPayload = pick(next, CODE_FRAGMENTS);
  else seedPayload = pick(next, MATRIX_BLOCKS);
  return { kind, x, y, scale, seedPayload };
}

/** ~ink-on-paper for the technical layer. */
const STROKE = "#3f3f46";

const LogicalItemView = memo(function LogicalItemView({
  item,
  lifeMs,
}: {
  item: LogicalItem;
  lifeMs: number;
}) {
  // Fade in fast, hold, fade out over the last third of life.
  const fade = {
    initial: { opacity: 0, y: 6 },
    animate: {
      opacity: [0, 0.55, 0.55, 0],
      y: [6, 0, 0, -4],
      transition: {
        duration: lifeMs / 1000,
        times: [0, 0.12, 0.7, 1],
        ease: EASE_OUT,
      },
    },
    exit: { opacity: 0, transition: { duration: 0.4 } },
  };

  const body = (() => {
    if (item.kind === "circuit") {
      const trace = item.seedPayload as ReturnType<typeof circuitTrace>;
      return (
        <svg width={ITEM_VIEW.w} height={ITEM_VIEW.h} viewBox={`0 0 ${ITEM_VIEW.w} ${ITEM_VIEW.h}`} fill="none">
          <motion.path
            d={trace.d}
            stroke={STROKE}
            strokeWidth={1}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.1, ease: EASE_OUT }}
          />
          {trace.pads.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={2.2} fill={STROKE} />
          ))}
        </svg>
      );
    }
    if (item.kind === "node") {
      const g = item.seedPayload as ReturnType<typeof nodeGraph>;
      return (
        <svg width={ITEM_VIEW.w} height={ITEM_VIEW.h} viewBox={`0 0 ${ITEM_VIEW.w} ${ITEM_VIEW.h}`} fill="none">
          {g.edges.map(([a, b], i) => (
            <motion.line
              key={i}
              x1={g.nodes[a].x}
              y1={g.nodes[a].y}
              x2={g.nodes[b].x}
              y2={g.nodes[b].y}
              stroke={STROKE}
              strokeWidth={0.6}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.9, delay: i * 0.05, ease: EASE_OUT }}
            />
          ))}
          {g.nodes.map((n, i) => (
            // Alternate solid pin-heads and open nodes, like the reference's
            // constellation detailing.
            <circle
              key={i}
              cx={n.x}
              cy={n.y}
              r={i % 3 === 0 ? 1.6 : 2.1}
              fill={i % 3 === 0 ? STROKE : "#fff"}
              stroke={STROKE}
              strokeWidth={0.6}
            />
          ))}
        </svg>
      );
    }
    if (item.kind === "math") {
      return (
        <span className="font-serif-brand text-lg text-neutral-600" style={{ whiteSpace: "nowrap" }}>
          {item.seedPayload as string}
        </span>
      );
    }
    // code / matrix — mono, pre-wrapped
    return (
      <pre className={`${typeVoiceClass("logic", "meta")} whitespace-pre text-[0.6rem] leading-tight text-neutral-500`}>
        {item.seedPayload as string}
      </pre>
    );
  })();

  return (
    <motion.div
      className="absolute origin-center"
      style={{ left: `${item.x}%`, top: `${item.y}%`, scale: item.scale }}
      variants={fade}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {body}
    </motion.div>
  );
});

export function LogicalFlow({ enabled }: { enabled: boolean }) {
  const items = useFlowStream<LogicalItem>({
    enabled,
    cap: FLOW_LIMITS.logicalItems,
    spawn: [900, 1800],
    life: [7000, 12000],
    create: createLogicalItem,
    initial: 6,
  });

  return (
    <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-1/2 overflow-hidden">
      <AnimatePresence>
        {items.map((it) => (
          <LogicalItemView key={it.id} item={it.data} lifeMs={it.lifeMs} />
        ))}
      </AnimatePresence>
    </div>
  );
}
