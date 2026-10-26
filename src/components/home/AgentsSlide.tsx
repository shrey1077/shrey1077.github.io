"use client";

/**
 * AgentsSlide — AI Agents, the right side's second slide (owner, 2026-10-26:
 * "it should show a clickable workflow tree, with connections to each other,
 * and displaying hierarchy. Suggest more required agents to completely finish
 * my personalized AI automation system").
 *
 *   Alfred ─┬─ Donna                 ┌──────────────────────┐
 *           ├─ Andy ──── Ledger·     │ the agent picked:    │
 *           ├─ Dr. House ─ Trainer   │ its role, what it    │
 *           ├─ Hitchcock ┬ Ray       │ does, who it reports │
 *           │      ┊     ├ EditMAX   │ to, who reports to   │
 *           │      ┊     └ Render·   │ it, who it works     │
 *           ├─ Market Guru ┬ Social· │ with                 │
 *           │              └ Merch·  └──────────────────────┘
 *           ├─ Brand Desk·  ├─ Archivist·  └─ Sentinel·
 *
 * The tree reads left to right, the hub first: each agent is a pill in the
 * column of its depth, at the middle of the rows its own agents take, and a
 * line runs to it from the agent it reports to. A dashed pill is a SUGGESTED
 * agent — what the system still lacks (agentSystem.ts says which, and why);
 * a dotted one is a draft. Picking an agent lights its line back to Alfred,
 * the line flowing, and fills the card beside the tree. The one cross-link —
 * Market Guru sells what Hitchcock makes — is a dashed line between them.
 * On a portrait screen the card stands under the tree.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { PixelButton } from "@/components/home/PixelButton";
import { RAINBOW } from "@/components/home/MoodField";
import { AGENT_SYSTEM, type AgentStatus, type SystemAgent } from "@/constants/agentSystem";
import { typeVoiceClass } from "@/constants/typography";

const META = `${typeVoiceClass("logic", "meta")} text-[0.55rem] tracking-[0.26em] text-neutral-500`;
/** A pill's width, and where each depth's column starts, in % of the tree —
 *  wider on a narrow screen, where the names need it. */
const WIDE = { w: 25, cols: [1, 37, 73] };
const NARROW = { w: 31.5, cols: [0, 34.25, 68.5] };
const STATUS: Record<AgentStatus, string> = { active: "Active", draft: "Draft", suggested: "Suggested" };

interface Placed extends SystemAgent {
  depth: number;
  /** The pill's centre, in % of the tree's height. */
  y: number;
  x: number;
  kids: string[];
}

/** Each agent's place: leaves one row each, in order; a parent at the middle
 *  of its own. */
function place(agents: readonly SystemAgent[], COL_X: number[]): { nodes: Map<string, Placed>; rows: number } {
  const kids = new Map<string, string[]>();
  for (const a of agents) if (a.parent) kids.set(a.parent, [...(kids.get(a.parent) ?? []), a.id]);
  const root = agents.find((a) => !a.parent)!;
  const rowOf = new Map<string, number>();
  const depthOf = new Map<string, number>();
  let next = 0;
  const walk = (id: string, d: number): number => {
    depthOf.set(id, d);
    const ks = kids.get(id) ?? [];
    if (d > 0 && ks.length === 0) {
      rowOf.set(id, next++);
      return rowOf.get(id)!;
    }
    const rs = ks.map((k) => walk(k, d + 1));
    const r = rs.length ? (Math.min(...rs) + Math.max(...rs)) / 2 : next++;
    rowOf.set(id, r);
    return r;
  };
  walk(root.id, 0);
  const rows = next;
  const nodes = new Map<string, Placed>();
  for (const a of agents) {
    const d = depthOf.get(a.id) ?? 0;
    nodes.set(a.id, { ...a, depth: d, x: COL_X[Math.min(d, COL_X.length - 1)], y: ((rowOf.get(a.id)! + 0.5) / rows) * 100, kids: kids.get(a.id) ?? [] });
  }
  return { nodes, rows };
}

/** The line from a parent's right edge to a child's left, an S between. */
function link(p: Placed, c: Placed, NODE_W: number) {
  const x1 = p.x + NODE_W;
  const x2 = c.x;
  const mx = (x1 + x2) / 2;
  return `M${x1} ${p.y} C${mx} ${p.y} ${mx} ${c.y} ${x2} ${c.y}`;
}

export function AgentsSlide({ reduceMotion }: { reduceMotion: boolean }) {
  const narrow = useMediaQuery("(max-width: 639px)");
  const { w: NODE_W, cols } = narrow ? NARROW : WIDE;
  const { nodes } = useMemo(() => place(AGENT_SYSTEM, cols), [cols]);
  const [pick, setPick] = useState("alfred");
  const picked = nodes.get(pick)!;
  // The line back to the hub, lit.
  const lit = useMemo(() => {
    const s = new Set<string>();
    for (let n: Placed | undefined = picked; n; n = n.parent ? nodes.get(n.parent) : undefined) s.add(n.id);
    return s;
  }, [picked, nodes]);
  const all = [...nodes.values()];
  const counts = { active: all.filter((a) => a.status !== "suggested").length, suggested: all.filter((a) => a.status === "suggested").length };
  const crossLinks = all.flatMap((a) => (a.links ?? []).map((l) => ({ from: a, to: nodes.get(l.to)!, label: l.label })));

  // The card scrolls by itself where its words outrun it (a small phone).
  const cardRef = useRef<HTMLElement>(null);
  const [scrolls, setScrolls] = useState(false);
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    el.scrollTop = 0;
    const look = () => setScrolls(el.scrollHeight > el.clientHeight + 1);
    look();
    const ro = new ResizeObserver(look);
    ro.observe(el);
    return () => ro.disconnect();
  }, [pick]);

  const parent = picked.parent ? nodes.get(picked.parent) : undefined;
  const works = [
    ...(picked.links ?? []).map((l) => ({ id: l.to, label: l.label })),
    ...crossLinks.filter((c) => c.to.id === picked.id).map((c) => ({ id: c.from.id, label: c.label })),
  ];

  return (
    <section aria-label="AI Agents" data-side="creative" className="absolute inset-0 overflow-hidden">
      <div className="slide-frame absolute inset-0 flex flex-col">
        <div className="mb-3 flex shrink-0 items-end justify-between gap-4 [@media(max-height:31.25rem)]:sr-only">
          <div>
            <p className={META}>AI Design · 02 / 04</p>
            <h2 className="face-creative mt-1.5 text-[clamp(1.6rem,3.6vw,3.4rem)] font-bold leading-none text-neutral-900">AI Agents</h2>
          </div>
          {/* The key. */}
          <ul className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1 max-sm:hidden">
            <li className={`${META} flex items-center gap-1.5`}>
              <span aria-hidden className="block h-2.5 w-5 rounded-full bg-neutral-900" /> {counts.active} built
            </li>
            <li className={`${META} flex items-center gap-1.5`}>
              <span aria-hidden className="block h-2.5 w-5 rounded-full border border-dashed border-neutral-500" /> {counts.suggested} suggested
            </li>
          </ul>
        </div>

        <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,1.25fr)_minmax(0,1fr)] gap-3 overflow-hidden rounded-2xl bg-white p-3 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.35)] ring-1 ring-neutral-900/[0.08] sm:p-5 landscape:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] landscape:grid-rows-1 landscape:gap-6">
          {/* ── The tree. */}
          <div role="group" aria-label="The agent system, as a tree" className="relative min-h-0">
            <svg aria-hidden viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
              {all.filter((n) => n.parent).map((n) => {
                const p = nodes.get(n.parent!)!;
                const on = lit.has(n.id);
                return (
                  <path
                    key={n.id}
                    d={link(p, n, NODE_W)}
                    fill="none"
                    vectorEffect="non-scaling-stroke"
                    className={on && !reduceMotion ? "agent-flow" : undefined}
                    stroke={on ? "#171717" : n.status === "suggested" ? "#c4c4c8" : "#a3a3a8"}
                    strokeWidth={on ? 2 : 1.2}
                    strokeDasharray={on ? "6 5" : n.status === "suggested" ? "3 4" : undefined}
                  />
                );
              })}
              {/* Works-with: a dashed bracket between the two, on their right. */}
              {crossLinks.map(({ from, to }) => {
                const x = from.x + NODE_W + 2;
                return (
                  <path
                    key={`${from.id}-${to.id}`}
                    d={`M${from.x + NODE_W} ${from.y} C${x + 3} ${from.y} ${x + 3} ${to.y} ${to.x + NODE_W} ${to.y}`}
                    fill="none"
                    vectorEffect="non-scaling-stroke"
                    stroke={RAINBOW[2]}
                    strokeWidth={1.4}
                    strokeDasharray="2 3"
                  />
                );
              })}
            </svg>
            {all.map((n) => {
              const on = n.id === pick;
              const path = lit.has(n.id);
              const ring =
                n.status === "suggested" ? "border border-dashed border-neutral-400" : n.status === "draft" ? "border border-dotted border-neutral-500" : "border border-neutral-900/80";
              return (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => setPick(n.id)}
                  aria-pressed={on}
                  aria-label={`${n.name} — ${n.role}${n.status === "suggested" ? " (suggested)" : ""}`}
                  className={`absolute flex -translate-y-1/2 items-center gap-1.5 overflow-hidden rounded-full px-[clamp(0.4rem,0.9vw,0.8rem)] py-[clamp(0.2rem,0.6vh,0.4rem)] text-left max-sm:justify-center max-sm:px-1 outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-neutral-900/40 ${ring} ${
                    on ? "!border-neutral-950 bg-neutral-950 text-white" : path ? "bg-neutral-100 text-neutral-900" : n.status === "suggested" ? "bg-white text-neutral-500 hover:text-neutral-900" : "bg-white text-neutral-900 hover:bg-neutral-100"
                  }`}
                  style={{ left: `${n.x}%`, top: `${n.y}%`, width: `${NODE_W}%` }}
                >
                  <span
                    aria-hidden
                    className={`block size-[0.5em] shrink-0 max-sm:hidden ${n.status === "suggested" ? "rounded-full border border-current" : ""}`}
                    style={n.status === "suggested" ? undefined : { backgroundColor: RAINBOW[(all.indexOf(n) * 2) % RAINBOW.length] }}
                  />
                  <span className={`face-creative truncate font-bold leading-none ${n.depth === 0 ? "text-[clamp(0.8rem,1.35vw,1.1rem)]" : "text-[clamp(0.66rem,1.05vw,0.9rem)] max-sm:text-[0.62rem]"}`}>
                    {n.status === "suggested" && <span aria-hidden className="max-sm:hidden">+ </span>}
                    {n.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── The agent picked. */}
          <article
            ref={cardRef}
            data-own-scroll={scrolls || undefined}
            aria-live="polite"
            className="flex min-h-0 flex-col gap-2 overflow-y-auto overscroll-contain border-t border-neutral-900/10 pt-3 landscape:border-l landscape:border-t-0 landscape:pl-6 landscape:pt-0 [@media(max-height:42rem)]:gap-1"
          >
            <div className="flex flex-wrap items-center gap-2">
              <p className={META}>{picked.role}</p>
              <span
                className={`${META} rounded-full px-2 py-0.5 !tracking-[0.18em] ${
                  picked.status === "suggested" ? "border border-dashed border-neutral-400" : picked.status === "draft" ? "border border-dotted border-neutral-500" : "bg-neutral-900 !text-white"
                }`}
              >
                {STATUS[picked.status]}
              </span>
            </div>
            <h3 className="face-creative text-[clamp(1.4rem,3vw,2.6rem)] font-bold leading-none text-neutral-900 [@media(max-height:42rem)]:text-[1.25rem]">{picked.name}</h3>
            <p className="font-helv text-[clamp(0.74rem,1.1vw,0.92rem)] leading-snug text-neutral-700 landscape:leading-relaxed [@media(max-height:42rem)]:text-[0.7rem] [@media(max-height:42rem)]:leading-[1.35]">
              {picked.text}
            </p>
            <dl className="mt-1 grid grid-cols-[auto_1fr] items-baseline gap-x-3 gap-y-1.5">
              {parent && (
                <>
                  <dt className={META}>Reports to</dt>
                  <dd>
                    <Chip agent={parent} onPick={setPick} />
                  </dd>
                </>
              )}
              {picked.kids.length > 0 && (
                <>
                  <dt className={META}>Runs</dt>
                  <dd className="flex flex-wrap gap-1.5">
                    {picked.kids.map((k) => (
                      <Chip key={k} agent={nodes.get(k)!} onPick={setPick} />
                    ))}
                  </dd>
                </>
              )}
              {works.length > 0 && (
                <>
                  <dt className={META}>Works with</dt>
                  <dd className="flex flex-wrap items-center gap-1.5">
                    {works.map((w) => (
                      <span key={w.id} className="flex items-center gap-2">
                        <Chip agent={nodes.get(w.id)!} onPick={setPick} />
                        <span className="font-helv text-[0.7rem] text-neutral-500">{w.label}</span>
                      </span>
                    ))}
                  </dd>
                </>
              )}
            </dl>
          </article>
        </div>
      </div>
      <div className="slide-corner-left absolute z-10">
        <PixelButton side="creative">The system — in development</PixelButton>
      </div>
    </section>
  );
}

/** An agent named in the card, a way to it. */
function Chip({ agent, onPick }: { agent: SystemAgent; onPick: (id: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onPick(agent.id)}
      className={`face-creative rounded-full px-2.5 py-0.5 text-[0.74rem] font-bold text-neutral-900 outline-none transition-colors hover:bg-neutral-900 hover:text-white focus-visible:ring-2 focus-visible:ring-neutral-900/40 ${
        agent.status === "suggested" ? "border border-dashed border-neutral-400" : "border border-neutral-900/40"
      }`}
    >
      {agent.name}
    </button>
  );
}
