"use client";

/**
 * MyStack — the third logic room: the tools behind the work (owner,
 * 2026-10-10: "My Stack — move the tools portion from main page to here").
 *
 * The marks are the ones the landing's first slide carried under the portrait
 * orb until then (TOOLS, constants/tools.ts — dark grey on transparency, so
 * they sit straight on the room's light ground). Here each gets its name and
 * what the tool IS, grouped by what it is for. The lines describe the tools,
 * not claims about the work made with them.
 */

import Image from "next/image";
import { TOOLS, type Tool } from "@/constants/tools";

/** What each tool is, in a line. */
const ROLE: Record<string, string> = {
  "adobe-cc": "The design suite",
  "google-flow": "Film generation, on Veo",
  leonardo: "Images and motion",
  lemonpeel: "Video generation",
  claude: "Thinking, writing, code",
  chatgpt: "Thinking and writing",
  gemini: "Research and reasoning",
  github: "Code and hosting",
  postshot: "3D capture — Gaussian splats",
};

/** The stack by what it is for, in reading order. */
const GROUPS: { label: string; ids: string[] }[] = [
  { label: "Design", ids: ["adobe-cc"] },
  { label: "Generate", ids: ["google-flow", "leonardo", "lemonpeel"] },
  { label: "Think & build", ids: ["claude", "chatgpt", "gemini", "github"] },
  { label: "Capture", ids: ["postshot"] },
];

export const STACK_COUNT = TOOLS.length;

export function MyStack() {
  const byId = new Map(TOOLS.map((t) => [t.id, t] as const));
  const groups = GROUPS.map((g) => ({
    ...g,
    tools: g.ids.map((id) => byId.get(id)).filter((t): t is Tool => !!t),
  })).filter((g) => g.tools.length > 0);

  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 xl:grid-cols-4">
      {groups.map((g, gi) => (
        <section key={g.label} aria-label={g.label}>
          <p className="flex items-baseline gap-2 border-b border-neutral-900/15 pb-2 text-[0.62rem] uppercase tracking-[0.28em] text-neutral-500">
            <span className="tabular-nums text-neutral-900">{String(gi + 1).padStart(2, "0")}</span>
            {g.label}
          </p>
          <ul className="mt-3 grid gap-2">
            {g.tools.map((t) => {
              const h = Math.round(30 * (t.scale ?? 1));
              return (
                <li
                  key={t.id}
                  className="flex items-center gap-4 rounded-2xl border border-neutral-900/12 bg-white/55 px-4 py-3 backdrop-blur-[2px]"
                >
                  <span className="grid h-10 w-14 shrink-0 place-items-center">
                    <Image
                      src={t.src}
                      alt=""
                      width={Math.round(h * t.aspect)}
                      height={h}
                      className="block"
                      style={{ height: h, width: "auto" }}
                    />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[0.95rem] leading-tight text-neutral-900">{t.name}</span>
                    <span className="mt-0.5 block text-[0.72rem] leading-snug text-neutral-500">{ROLE[t.id]}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
