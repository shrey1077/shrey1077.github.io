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

export function SplineScene({
  url = SCENE_URL,
  className = "",
  /** Montek blends the robot against its heading with `mix-blend-mode:
   *  exclusion`, which is what makes it read as part of the type rather than a
   *  render pasted over it. Kept as the default, overridable per room. */
  blend = "exclusion" as const,
  opacity = 1,
}: {
  url?: string;
  className?: string;
  blend?: React.CSSProperties["mixBlendMode"];
  opacity?: number;
}) {
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

    return () => {
      // Drop the element on the way out so its WebGL context and render loop go
      // with it — the script tag stays, since re-parsing the module is wasted
      // work and custom elements can only be defined once anyway.
      host.replaceChildren();
    };
  }, [url, inView, reduceMotion]);

  if (reduceMotion) return null;

  return (
    <div
      ref={ref}
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={{ mixBlendMode: blend, opacity }}
    >
      <div ref={hostRef} className="h-full w-full" />
    </div>
  );
}
