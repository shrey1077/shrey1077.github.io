"use client";

/**
 * TouchFollow — a finger dragged across a touch screen moves the home page's
 * pointer effects as a mouse would (owner, 2026-10-17: "in mobile view, we
 * cant get the drag effects (mouse movements) … allow user to drag on the
 * screens"; the brain's sides, the portrait orb, the fields and grids, the
 * Zabraku robot).
 *
 * Those effects listen for pointer moves and, on purpose, pass over a
 * finger's (a finger was scrolling). So each touch, while it moves, is
 * handed on as a MOUSE move at the same place — a pointermove and a
 * mousemove, sent to whatever is under the finger and bubbling to the
 * window, at most once a frame — and every effect follows it unchanged.
 * Swipes still change slides: the Flythrough reads the touches themselves.
 * Only on screens with no hover; renders nothing.
 */

import { useEffect } from "react";

export function TouchFollow() {
  useEffect(() => {
    if (!window.matchMedia("(hover: none)").matches) return;
    let raf = 0;
    let last: { x: number; y: number; sx: number; sy: number } | null = null;
    const send = () => {
      raf = 0;
      if (!last) return;
      const { x, y, sx, sy } = last;
      const at = document.elementFromPoint(x, y) ?? document.body;
      const init = { clientX: x, clientY: y, screenX: sx, screenY: sy, bubbles: true, composed: true, buttons: 0 };
      at.dispatchEvent(new PointerEvent("pointermove", { ...init, pointerType: "mouse", pointerId: 1, isPrimary: true }));
      at.dispatchEvent(new MouseEvent("mousemove", init));
    };
    const onTouch = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      last = { x: t.clientX, y: t.clientY, sx: t.screenX, sy: t.screenY };
      if (!raf) raf = requestAnimationFrame(send);
    };
    window.addEventListener("touchstart", onTouch, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("touchmove", onTouch);
      cancelAnimationFrame(raf);
    };
  }, []);
  return null;
}
