"use client";

/**
 * DetailLayer — the right hemisphere's hidden sketchbook (Phase 4).
 *
 * The most artistic addition: beneath the colour, an invisible world of ink
 * scribbles, loops, doodles and little symbols that fade in and out — so the
 * viewer discovers new marks every time they look. Faint by design (they live
 * UNDER the CreativeFlow colour). Seeded per spawn (flowGeometry.ts), drawn in
 * one stroke, dissolved. Decorative (aria-hidden). See docs/BRAIN_SYSTEM.md.
 */

import { memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EASE_OUT } from "@/constants/motion";
import { FLOW_LIMITS } from "@/constants/systems";
import { randomInRange, type SeededRandom } from "@/utils/random";
import { useFlowStream } from "@/components/flows/useFlowStream";
import {
  inkScribble,
  pick,
  DOODLE_PATHS,
  ITEM_VIEW,
} from "@/components/flows/flowGeometry";

interface DetailItem {
  d: string;
  x: number;
  y: number;
  scale: number;
  rotate: number;
}

function createDetailItem(next: SeededRandom): DetailItem {
  const isDoodle = next() < 0.5;
  const d = isDoodle ? pick(next, DOODLE_PATHS) : inkScribble(next, Math.floor(randomInRange(next, 2, 4)));
  return {
    d,
    // Over the right hemisphere, hugging the fissure — inside the brain zone and
    // clear of the flanking navigation (x is % of the right half; ~5→42 maps to
    // ~52→71% of the viewport, well left of the nav pills).
    x: randomInRange(next, 5, 42),
    y: randomInRange(next, 20, 76),
    scale: randomInRange(next, 0.45, 0.95),
    rotate: randomInRange(next, -18, 18),
  };
}

const DetailItemView = memo(function DetailItemView({
  item,
  lifeMs,
}: {
  item: DetailItem;
  lifeMs: number;
}) {
  return (
    <motion.div
      className="absolute origin-center"
      style={{ left: `${item.x}%`, top: `${item.y}%`, rotate: item.rotate, scale: item.scale }}
      initial={{ opacity: 0 }}
      animate={{
        opacity: [0, 0.32, 0.32, 0],
        transition: { duration: lifeMs / 1000, times: [0, 0.18, 0.72, 1], ease: EASE_OUT },
      }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
    >
      <svg width={ITEM_VIEW.w * 0.7} height={ITEM_VIEW.h * 0.7} viewBox={`0 0 ${ITEM_VIEW.w} ${ITEM_VIEW.h}`} fill="none">
        <motion.path
          d={item.d}
          stroke="#3f3f46"
          strokeWidth={1.1}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.3, ease: EASE_OUT }}
        />
      </svg>
    </motion.div>
  );
});

export function DetailLayer({ enabled }: { enabled: boolean }) {
  const items = useFlowStream<DetailItem>({
    enabled,
    cap: FLOW_LIMITS.detailItems,
    spawn: [800, 1700],
    life: [6000, 11000],
    create: createDetailItem,
    initial: 6,
  });

  return (
    <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-1/2 overflow-hidden">
      <AnimatePresence>
        {items.map((it) => (
          <DetailItemView key={it.id} item={it.data} lifeMs={it.lifeMs} />
        ))}
      </AnimatePresence>
    </div>
  );
}
