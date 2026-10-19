"use client";

/**
 * SplineScene — a hosted Spline 3D scene as a background layer.
 *
 * The owner pointed at the Montek template's cursor-responsive robot on
 * 2026-08-25 and asked for it behind the Zabraku rooms.
 *
 * ⚠⚠ WHAT THAT ROBOT ACTUALLY IS, because it changes what this component can
 * honestly promise. It is NOT an asset. The template ships no model, no
 * texture and no animation for it — only two lines of markup pointing at a
 * scene hosted on the TEMPLATE AUTHOR'S Spline account:
 *
 *     <script src="https://unpkg.com/@splinetool/viewer@1.3.5/…"></script>
 *     <spline-viewer url="https://prod.spline.design/AqtlWJlNbO-ZMkvz/scene.splinecode">
 *
 * The cursor-following is baked into that remote scene, not into any code the
 * owner has. Three consequences, all of which outlive this component:
 *   · LICENSING — pointing a public portfolio at that URL serves someone else's
 *     3D work from their account. A template licence covers using the template;
 *     it does not obviously cover re-hosting the author's Spline project on an
 *     unrelated site. Replace SCENE_URL with the owner's own scene before this
 *     is deployed. It is one constant, deliberately.
 *   · AVAILABILITY — the scene lives on an account nobody here controls. If it
 *     is deleted, moved or edited, this background changes or vanishes with no
 *     warning and no local copy to fall back on.
 *   · THIRD PARTY REQUESTS — every view fetches the viewer bundle from unpkg
 *     and the scene from prod.spline.design. That is two external origins this
 *     site does not otherwise talk to, on a page that is otherwise wholly
 *     self-hosted.
 *
 * ⚠ The viewer is a WEB COMPONENT, not a React one. It is loaded as an ES
 * module by injecting a <script type="module"> once per document — React cannot
 * render that usefully, and `next/script` would fight the custom-element
 * registration. `<spline-viewer>` is then written straight into the DOM, which
 * is why this uses a ref and `createElement` rather than JSX: TypeScript has no
 * intrinsic element for it and adding a global JSX declaration for a
 * third-party tag would leak into every file in the project.
 *
 * ⚠ Reduced motion renders nothing. It is a continuously animating 3D scene
 * that tracks the cursor, with no meaningful still state, and it is decoration.
 *
 * ⚠ It only mounts when scrolled into view, and unmounts when it leaves. A
 * Spline scene holds a WebGL context and runs its own render loop; leaving one
 * live behind a page the visitor has scrolled past is exactly the cost the
 * footer field and the journey were both gated to avoid.
 */

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { useInViewport } from "@/hooks/useInViewport";

/** ⚠ THE TEMPLATE AUTHOR'S SCENE — see the licensing note above. This default
 *  exists so the room can be SEEN working; it is not a shipping value. Swap it
 *  for a scene on the owner's own Spline account before deploying. */
const SCENE_URL = "https://prod.spline.design/AqtlWJlNbO-ZMkvz/scene.splinecode";

/** The viewer bundle. Pinned, because an unpinned `@latest` would let a remote
 *  major version change the background without a commit here. */
const VIEWER_SRC = "https://unpkg.com/@splinetool/viewer@1.3.5/build/spline-viewer.js";
const VIEWER_ID = "spline-viewer-module";

/** Warm the way for a scene before it is shown (2026-10-15, owner: the robot
 *  "takes time to load, can it be made faster"): open the connections to
 *  both hosts, fetch the viewer's module, and ask for the scene file ahead,
 *  so when the scene mounts its downloads are already done or under way.
 *  Once per document and scene. */
const warmed = new Set<string>();
export function preloadSpline(url: string = SCENE_URL) {
  if (typeof document === "undefined" || warmed.has(url)) return;
  warmed.add(url);
  const link = (rel: string, href: string, extra: Record<string, string> = {}) => {
    const l = document.createElement("link");
    l.rel = rel;
    l.href = href;
    for (const [k, v] of Object.entries(extra)) l.setAttribute(k, v);
    document.head.appendChild(l);
  };
  link("preconnect", "https://unpkg.com", { crossorigin: "" });
  link("preconnect", new URL(url).origin, { crossorigin: "" });
  link("modulepreload", VIEWER_SRC, { crossorigin: "" });
  link("prefetch", url, { as: "fetch", crossorigin: "anonymous" });
}

export function SplineScene({
  url = SCENE_URL,
  className = "",
  /** ⚠ NORMAL, not Montek's `exclusion`. Exclusion against Montek's near-black
   *  banner is what gives that template its chrome robot; against THIS page's
   *  white ground the same blend inverts it to a hard silhouette, which is the
   *  "black" the owner rejected on 2026-08-25. */
  blend = "normal" as const,
  /** Desaturate and lift the scene so it reads as pale grey rather than as a
   *  dark render. The brightness is doing the real work: the model's body is
   *  near-black, and grayscale alone would only make it neutral-black. */
  filter = "grayscale(1) brightness(1.85) contrast(0.72)",
  /** See-through, as asked — the page reads through the robot. */
  opacity = 0.42,
  /** Grow the scene past its box. ⚠ Applied to the HOST, not the layer: the
   *  layer carries the filter, and a transform there would be composited with
   *  it in a way that re-rasterises the filtered result every frame. */
  scale = 1.28,
  /** Slide it across, as a percentage of the layer's width. Positive is right.
   *  The scene sits left-of-centre in its own frame, so this is what puts the
   *  robot clear of the wordmark rather than behind it. */
  offsetX = "14%",
  onReady,
}: {
  url?: string;
  className?: string;
  blend?: React.CSSProperties["mixBlendMode"];
  filter?: string;
  opacity?: number;
  scale?: number;
  offsetX?: string;
  /** Called once the scene has loaded and is drawing. */
  onReady?: () => void;
}) {
  const readyRef = useRef(onReady);
  useEffect(() => {
    readyRef.current = onReady;
  });
  const reduceMotion = useReducedMotion();
  const { ref, inView } = useInViewport<HTMLDivElement>({ rootMargin: "300px" });
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduceMotion || !inView) return;
    const host = hostRef.current;
    if (!host) return;

    // One module tag per document, however many scenes are on the page.
    if (!document.getElementById(VIEWER_ID)) {
      const s = document.createElement("script");
      s.id = VIEWER_ID;
      s.type = "module";
      s.src = VIEWER_SRC;
      document.head.appendChild(s);
    }

    const el = document.createElement("spline-viewer");
    el.setAttribute("url", url);
    // The viewer sizes to its host; without this it collapses to its intrinsic
    // zero and nothing paints.
    el.style.width = "100%";
    el.style.height = "100%";
    el.style.display = "block";
    host.appendChild(el);
    // Spline's badge stands 20px in from the corner of ITS canvas — but the
    // canvas is grown past the box (`scale`) and slid (`offsetX`), which
    // carried the badge out past the box's edge, where the layer cut it off
    // (2026-10-19). It is placed 20px in from the corner of what SHOWS
    // instead, at its own size: a point at x in the canvas shows at
    // w/2 + tx + s(x − w/2).
    const placeLogo = () => {
      const logo = el.shadowRoot?.querySelector<HTMLElement>("#logo");
      const w = host.offsetWidth;
      const h = host.offsetHeight;
      if (!logo || !w || !h) return;
      const tx = (parseFloat(offsetX) / 100) * w;
      const m = 20;
      logo.style.right = `${w / 2 - (w / 2 - m - tx) / scale}px`;
      logo.style.bottom = `${h / 2 - (h / 2 - m) / scale}px`;
      logo.style.transformOrigin = "100% 100%";
      logo.style.transform = `scale(${1 / scale})`;
    };
    // The viewer says when its scene is in.
    const ready = () => {
      placeLogo();
      readyRef.current?.();
    };
    el.addEventListener("load-complete", ready);
    const ro = new ResizeObserver(placeLogo);
    ro.observe(host);

    return () => {
      // Drop the element on the way out so its WebGL context and render loop go
      // with it — the script tag stays, since re-parsing the module is wasted
      // work and custom elements can only be defined once anyway.
      el.removeEventListener("load-complete", ready);
      ro.disconnect();
      host.replaceChildren();
    };
  }, [url, inView, reduceMotion, scale, offsetX]);

  if (reduceMotion) return null;

  return (
    <div
      ref={ref}
      aria-hidden
      // ⚠ `pointer-events-auto`, NOT none — the scene's cursor-following is the
      //   whole reason it is here, and it is handled INSIDE the Spline viewer.
      //   With `pointer-events: none` the viewer never receives a move and the
      //   robot simply stands still, which is exactly what happened first time.
      //   Unlike the footer's particle field this cannot be redirected to a
      //   window listener: the tracking lives in the remote scene's own runtime,
      //   not in code here.
      //   It is safe because this layer is rendered BEFORE the hero content and
      //   carries no z-index, so the content paints above it: a pointer over the
      //   type or a link hits the content, and one over empty hero space reaches
      //   the scene. Nothing is blocked; the robot just tracks the open areas.
      className={`pointer-events-auto absolute inset-0 overflow-hidden ${className}`}
      style={{ mixBlendMode: blend, opacity, filter }}
    >
      <div
        ref={hostRef}
        className="h-full w-full"
        style={{ transform: `translateX(${offsetX}) scale(${scale})`, transformOrigin: "center" }}
      />
    </div>
  );
}
