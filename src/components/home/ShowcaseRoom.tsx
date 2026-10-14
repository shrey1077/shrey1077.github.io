"use client";

/**
 * ShowcaseRoom — one slide of the rooms: one project (left) or one body of
 * work (right), in four quadrants (owner, 2026-10-15). See constants/
 * showcase.ts for the layout and where every word comes from.
 *
 *   LEFT                                RIGHT — the mirror
 *   brands in hierarchy │ the page      the page   │ what it holds
 *   ────────────────────┼──────────     ───────────┼──────────────
 *   my role, what I did │ the button,   the button,│ my role,
 *                       │ the company   the facts  │ what I did
 *
 * The page quadrant is a still of the page the button opens, in a browser
 * frame with its address; it opens that page too. The hierarchy is drawn as
 * a family tree — marks where there are marks, the name in type where there
 * are none — and scaled down to fit its quadrant whole rather than cropped.
 *
 * The slide keeps clear of the strip along the top (ShowcaseStrip), the band
 * along the foot (FootBand, 7svh) and the Stack / Tools button standing on
 * it in the outer corner (KitButton). Below `md` the quadrants stack and
 * scroll; on a short screen they scroll rather than squash.
 */

import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";
import { RoomImage as Image } from "@/components/home/nearness";
import { PixelButton } from "@/components/home/PixelButton";
import { RAINBOW } from "@/components/home/MoodField";
import { PAPER_PLATE } from "@/constants/design";
import { typeVoiceClass } from "@/constants/typography";
import type { ShowNode, Showcase } from "@/constants/showcase";

const META = `${typeVoiceClass("logic", "meta")} text-[0.58rem] tracking-[0.28em] text-neutral-500`;
const pad = (n: number) => String(n).padStart(2, "0");

/* ── The hierarchy ─────────────────────────────────────────────────────── */

function NodeBox({ node, depth, creative }: { node: ShowNode; depth: number; creative: boolean }) {
  if (node.group) {
    return (
      <span className={`${META} whitespace-nowrap rounded-full bg-white/80 px-2 py-1 !tracking-[0.22em] text-neutral-600`}>
        {node.name}
      </span>
    );
  }
  if (node.thumb) {
    return (
      <span className="flex w-[4.25rem] flex-col items-center gap-1">
        <span className="relative block h-12 w-12 overflow-hidden rounded-md ring-1 ring-neutral-900/15">
          <Image src={node.thumb} alt="" fill sizes="48px" className="object-cover" />
        </span>
        <span className="text-center text-[0.62rem] leading-tight text-neutral-700">{node.name}</span>
      </span>
    );
  }
  if (node.logo) {
    const big = depth === 0;
    const dark = node.tone === "light";
    return (
      <span
        title={node.name}
        className={`relative block rounded-lg ${dark ? "bg-neutral-900" : "bg-white"} ${
          node.focus ? "ring-2 ring-neutral-900" : "ring-1 ring-neutral-900/12"
        } ${big ? "h-[4.6rem] w-[12.5rem]" : "h-14 w-[8.6rem]"}`}
      >
        <span className={`absolute ${big ? "inset-x-3 inset-y-2" : "inset-x-2 inset-y-1.5"}`}>
          <Image src={node.logo} alt={node.name} fill sizes={big ? "300px" : "200px"} className="object-contain" />
        </span>
      </span>
    );
  }
  // A name in type: the root of a creative tree large, everything else a chip.
  if (depth === 0) {
    return (
      <span
        className={`whitespace-nowrap rounded-lg bg-white px-4 py-2.5 text-[1.05rem] leading-none ring-1 ring-neutral-900/12 ${
          creative ? "face-creative font-bold" : "font-graff uppercase tracking-[0.12em]"
        }`}
      >
        {node.name}
      </span>
    );
  }
  return (
    <span
      className={`whitespace-nowrap rounded-md px-2.5 py-1.5 text-[0.72rem] leading-none ${
        node.focus ? "bg-neutral-900 text-white" : "bg-white text-neutral-800 ring-1 ring-neutral-900/15"
      }`}
    >
      {node.name}
    </span>
  );
}

function Tree({ node, depth = 0, creative, hue = 0 }: { node: ShowNode; depth?: number; creative: boolean; hue?: number }) {
  const kids = node.children ?? [];
  // The connecting lines: graphite on the left, each branch its own paint on
  // the right.
  const line = (i: number) => (creative ? { backgroundColor: RAINBOW[(hue + i) % RAINBOW.length] } : undefined);
  const lineCls = creative ? "" : "bg-neutral-900/35";
  return (
    <div className="flex flex-col items-center">
      <NodeBox node={node} depth={depth} creative={creative} />
      {kids.length > 0 && (
        <>
          <span className={`block h-3.5 w-px ${lineCls}`} style={line(0)} />
          <div className="flex items-start justify-center">
            {kids.map((c, i) => (
              <div key={`${c.name}-${i}`} className="relative flex flex-col items-center px-1.5">
                {kids.length > 1 && (
                  <span
                    className={`absolute top-0 h-px ${lineCls} ${
                      i === 0 ? "left-1/2 right-0" : i === kids.length - 1 ? "left-0 right-1/2" : "inset-x-0"
                    }`}
                    style={line(0)}
                  />
                )}
                <span className={`block h-3.5 w-px ${lineCls}`} style={line(i + 1)} />
                <Tree node={c} depth={depth + 1} creative={creative} hue={hue + i + 1} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/** The tree, scaled to fit its quadrant whole — down as far as it must,
 *  up only a little (GROW), so a small family doesn't sit lost in the middle. */
const GROW = 1.3;
function FitTree({ node, creative }: { node: ShowNode; creative: boolean }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const treeRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const box = boxRef.current;
    const tree = treeRef.current;
    if (!box || !tree) return;
    const fit = () => {
      const s = Math.min(GROW, (box.clientWidth - 8) / Math.max(1, tree.offsetWidth), (box.clientHeight - 8) / Math.max(1, tree.offsetHeight));
      setScale((o) => (Math.abs(o - s) < 0.01 ? o : s));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    ro.observe(tree);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={boxRef} className="relative min-h-[9rem] flex-1 overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <div ref={treeRef} className="w-max" style={{ transform: `scale(${scale})`, transformOrigin: "center" }}>
          <Tree node={node} creative={creative} />
        </div>
      </div>
    </div>
  );
}

/* ── The quadrants ─────────────────────────────────────────────────────── */

function Quad({
  label,
  creative,
  className = "",
  children,
}: {
  label: React.ReactNode;
  creative: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`${PAPER_PLATE} relative flex min-h-[14rem] min-w-0 flex-col overflow-hidden p-4 lg:p-5 ${className}`}>
      <p className={`${META} mb-3 ${creative ? "text-right" : ""}`}>{label}</p>
      {children}
    </div>
  );
}

function PreviewQuad({ item, creative }: { item: Showcase; creative: boolean }) {
  const { preview, report } = item;
  const frame = (
    <span className="relative flex h-full min-h-[10rem] flex-col overflow-hidden rounded-xl bg-neutral-100 ring-1 ring-neutral-900/12">
      {/* The browser's own bar: three dots and the address. */}
      <span className="flex h-7 shrink-0 items-center gap-1.5 border-b border-neutral-900/10 bg-white px-3">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="block h-2 w-2 rounded-full"
            style={{ backgroundColor: creative ? RAINBOW[i * 2] : `rgba(23,23,23,${0.18 + i * 0.12})` }}
          />
        ))}
        <span className="ml-2 truncate rounded bg-neutral-100 px-2 py-0.5 font-mono text-[0.6rem] text-neutral-500">
          {preview?.url ?? "shrey107.com"}
        </span>
      </span>
      <span className="relative block flex-1 overflow-hidden">
        {preview ? (
          <Image
            src={preview.src}
            alt={`The first screen of the ${item.name} page`}
            fill
            sizes="(min-width: 768px) 45vw, 92vw"
            className="object-cover object-top transition-transform duration-700 ease-out group-hover/preview:scale-[1.03]"
          />
        ) : (
          <span className="absolute inset-0 grid place-items-center bg-white">
            <span className="flex flex-col items-center gap-2">
              <span className="face-creative text-[clamp(1.6rem,3vw,2.6rem)] font-bold leading-none">Coming soon.</span>
              <span className="text-xs text-neutral-500">Films and motion made with AI. The reel is on its way.</span>
            </span>
          </span>
        )}
      </span>
    </span>
  );
  return (
    <Quad label={preview ? "The page" : "The reel"} creative={creative}>
      {preview && report.href ? (
        <Link
          href={report.href}
          prefetch={false}
          className="group/preview block min-h-0 flex-1 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/40"
          aria-label={`Open the ${item.name} page`}
        >
          {frame}
        </Link>
      ) : (
        <div className="min-h-0 flex-1">{frame}</div>
      )}
    </Quad>
  );
}

function RoleQuad({ item, creative }: { item: Showcase; creative: boolean }) {
  return (
    <Quad label="My role" creative={creative}>
      <div className={`flex min-h-0 flex-1 flex-col ${creative ? "items-end text-right" : ""}`}>
        <h3
          className={`text-[clamp(1.05rem,1.6vw,1.5rem)] leading-tight text-neutral-900 ${
            creative ? "face-creative font-bold" : "font-graff uppercase tracking-[0.08em]"
          }`}
        >
          {item.role}
        </h3>
        {item.years && <p className={`${META} mt-1.5`}>{item.years}</p>}
        <ul className="mt-3 grid gap-2 overflow-y-auto pr-1 text-[0.84rem] leading-snug text-neutral-700 lg:text-[0.9rem] xl:text-[0.96rem]">
          {item.points.map((pt, i) => (
            <li key={i} className={`flex gap-2.5 ${creative ? "flex-row-reverse" : ""}`}>
              {/* A pixel for a bullet. */}
              <span
                aria-hidden
                className="mt-[0.42em] block h-1.5 w-1.5 shrink-0"
                style={{ backgroundColor: creative ? RAINBOW[(i * 3) % RAINBOW.length] : "#171717" }}
              />
              <span>{pt}</span>
            </li>
          ))}
        </ul>
      </div>
    </Quad>
  );
}

function InfoQuad({ item, creative, extraFacts }: { item: Showcase; creative: boolean; extraFacts: Showcase["facts"] }) {
  const facts = [...extraFacts, ...item.facts];
  return (
    <Quad label={creative ? "The work" : "The company"} creative={creative}>
      <div className={`flex min-h-0 flex-1 flex-col gap-4 ${creative ? "items-end text-right" : ""}`}>
        <PixelButton side={creative ? "creative" : "logic"} href={item.report.href}>
          {item.report.label}
          {item.report.href && <span aria-hidden> {creative ? "↗" : "→"}</span>}
        </PixelButton>
        <div>
          <p
            className={`text-[clamp(1.2rem,2vw,1.9rem)] leading-none text-neutral-900 ${
              creative ? "face-creative font-bold" : "face-logic"
            }`}
          >
            {item.name}
          </p>
          <p className={`${META} mt-2`}>{item.sector}</p>
        </div>
        {facts.length > 0 && (
          <dl className="grid gap-y-2 text-[0.8rem]">
            {facts.map((f) => (
              <div key={f.label} className={`flex items-baseline gap-4 ${creative ? "flex-row-reverse" : ""}`}>
                <dt className={`${META} w-[5.5rem] shrink-0 ${creative ? "text-right" : ""}`}>{f.label}</dt>
                <dd className="min-w-0 text-neutral-800">
                  {f.href ? (
                    <a
                      href={f.href}
                      target={f.href.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="break-all underline decoration-neutral-900/25 underline-offset-4 transition-colors hover:decoration-neutral-900"
                    >
                      {f.value}
                    </a>
                  ) : (
                    f.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </Quad>
  );
}

export function ShowcaseRoom({
  item,
  position,
  total,
  extraFacts = [],
}: {
  item: Showcase;
  /** 1-based, of `total` on its side. */
  position: number;
  total: number;
  /** Facts counted at build time (Arts & Crafts' collections and pieces). */
  extraFacts?: Showcase["facts"];
}) {
  const creative = item.side === "creative";
  const tree = (
    <Quad
      label={
        <>
          <span className="text-neutral-900">{pad(position)}</span> / {pad(total)} · {item.treeLabel}
        </>
      }
      creative={creative}
    >
      <FitTree node={item.tree} creative={creative} />
    </Quad>
  );
  const preview = <PreviewQuad item={item} creative={creative} />;
  const role = <RoleQuad item={item} creative={creative} />;
  const info = <InfoQuad item={item} creative={creative} extraFacts={extraFacts} />;

  return (
    // Clear of the strip along the top, and of the band and the corner
    // button along the foot (FootBand 7svh + KitButton's 2.75rem and air).
    <section
      aria-label={item.name}
      data-side={item.side}
      className="showcase-pad flex h-full px-4 pb-[calc(7svh+0.75rem+2.75rem+0.75rem)] pt-[calc(max(2vh,0.75rem)+3.75rem+1vh)] text-neutral-900 sm:px-8 lg:px-[5vw]"
    >
      <h2 className="sr-only">{item.name}</h2>
      {/* ⚠ No overscroll-contain: on touch a swipe that runs off the end must
          carry on into the page, or a phone could never leave the room. */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="showcase-grid grid min-h-full grid-cols-1 gap-3 md:grid-cols-2 md:grid-rows-[minmax(14rem,1fr)_minmax(14rem,1fr)] lg:gap-4">
          {creative ? (
            <>
              {preview}
              {tree}
              {info}
              {role}
            </>
          ) : (
            <>
              {tree}
              {preview}
              {role}
              {info}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
