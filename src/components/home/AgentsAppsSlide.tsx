"use client";

/**
 * AgentsAppsSlide — AI Agents & Apps, the right side's second slide since
 * 2026-11-17 (owner: "right again to Ai Agents and apps (merge the two,
 * yes)"). The two slides that stood second and third (AgentsSlide, AppsSlide)
 * as one: the agents' slide, its title the pair's, with two tabs beside its
 * key — AI Agents (the system, behind its password, as before) and AI Apps
 * (Cerci and H3LEN, in the apps' window). AppsSlide is kept, unused.
 */

import { useState } from "react";
import { AgentsSlide } from "@/components/home/AgentsSlide";
import { Apps } from "@/components/home/AiSlide";

const TABS = [
  { id: "agents", label: "AI Agents" },
  { id: "apps", label: "AI Apps" },
] as const;
type Tab = (typeof TABS)[number]["id"];

export function AgentsAppsSlide({ reduceMotion, live }: { reduceMotion: boolean; live: boolean }) {
  const [tab, setTab] = useState<Tab>("agents");
  const tabs = (
    <div role="tablist" aria-label="AI Agents & Apps" className="flex items-center gap-1.5">
      {TABS.map((t) => {
        const on = tab === t.id;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => setTab(t.id)}
            className={`face-creative rounded-full px-4 py-1.5 text-[clamp(0.78rem,1.1vw,0.95rem)] font-bold leading-tight ring-1 outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-neutral-900/40 ${
              on ? "bg-neutral-950 text-white ring-neutral-950" : "bg-white/85 text-neutral-900 ring-neutral-900/10 hover:bg-white"
            }`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
  return (
    <AgentsSlide
      reduceMotion={reduceMotion}
      title="AI Agents & Apps"
      tabs={tabs}
      swap={
        tab === "apps" ? (
          <div
            role="tabpanel"
            aria-label="AI Apps"
            className="relative min-h-0 flex-1 overflow-hidden rounded-2xl bg-white p-3 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.35)] ring-1 ring-neutral-900/[0.08] sm:p-5 [@media(max-height:31.25rem)]:p-3"
          >
            <Apps inView turning={live} reduceMotion={reduceMotion} />
          </div>
        ) : undefined
      }
    />
  );
}
