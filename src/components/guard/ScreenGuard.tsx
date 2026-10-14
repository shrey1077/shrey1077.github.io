"use client";

/**
 * ScreenGuard — the site's deterrents against capturing its work (owner,
 * 2026-10-05: "disable screenshotting on my website throughout").
 *
 * ⚠ A WEB PAGE CANNOT STOP A SCREENSHOT. The operating system takes it — Print
 * Screen, Win+Shift+S, Cmd+Shift+3/4/5, a phone's buttons, a camera — without
 * asking the page, and most of those never reach it at all. What a page CAN do
 * is make the casual routes come out empty, and that is all this is:
 *
 *   · The screenshot keys the browser does hear black the page out at once
 *     (html[data-shield], styled in globals.css), so the capture is of a dark
 *     screen: Print Screen, and Windows/Command held with Shift — the start of
 *     Win+Shift+S and Cmd+Shift+3/4/5, caught before the last key lands. On a
 *     Mac the capture happens when the selection is released, so the shield
 *     holds until the pointer moves on the page again (the selection crosshair
 *     keeps it away), or SHIELD_MAX_MS.
 *   · Print Screen also overwrites the clipboard, where Windows puts the
 *     capture — where the browser allows a page to write it.
 *   · Saving and printing the page are refused (Ctrl/Cmd+S, Ctrl/Cmd+P; a
 *     print from the menu comes out blank — globals.css).
 *   · Right-click, dragging an image out, and a phone's long-press "save
 *     image" are off; so is selecting text, except in fields and the email
 *     link (globals.css).
 *
 * ⚠ The cost: Cmd/Ctrl+Shift shortcuts (reopen tab, hard reload) blank the
 * page for a moment too.
 *
 * ⚠ ALL OF IT IS BEHIND ONE SWITCH — constants/guard (SCREEN_GUARD_ON) — and
 * it is OFF since 2026-10-14 (owner: "enable screenshot, i will disable
 * later"). Flip it to true and every deterrent here and in globals.css
 * comes back.
 */

import { useEffect } from "react";
import { SCREEN_GUARD_ON } from "@/constants/guard";

/** How long a shield stands: from Print Screen, and at most from Cmd/Win+Shift. */
const SHIELD_MS = 1600;
const SHIELD_MAX_MS = 8000;
/** A pointer move only lowers a Cmd/Win+Shift shield once it has stood this long. */
const SHIELD_MIN_MS = 900;

export function ScreenGuard() {
  useEffect(() => {
    // Switched off (constants/guard): nothing listens, nothing is refused.
    if (!SCREEN_GUARD_ON) return;
    const root = document.documentElement;
    let timer = 0;
    let raisedAt = 0;
    let untilPointer = false;

    const lower = () => {
      delete root.dataset.shield;
      untilPointer = false;
    };
    const raise = (ms: number, holdForPointer = false) => {
      root.dataset.shield = "";
      raisedAt = Date.now();
      untilPointer = holdForPointer;
      window.clearTimeout(timer);
      timer = window.setTimeout(lower, ms);
    };
    const wipeClipboard = () => {
      try {
        void navigator.clipboard?.writeText("").catch(() => {});
      } catch {
        /* not allowed here — the shield is the rest of it */
      }
    };
    const editable = (t: EventTarget | null) =>
      t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));

    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === "printscreen") {
        raise(SHIELD_MS);
        wipeClipboard();
        return;
      }
      // Win+Shift / Cmd+Shift: the opening of the OS's own capture shortcuts.
      if (e.metaKey && e.shiftKey) {
        raise(SHIELD_MAX_MS, true);
        return;
      }
      // Save and print — and Firefox's own screenshot tool (Ctrl+Shift+S).
      if ((e.ctrlKey || e.metaKey) && (key === "s" || key === "p")) {
        e.preventDefault();
        raise(SHIELD_MS);
      }
    };
    // Windows delivers Print Screen to the page only as it is released.
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "printscreen") {
        raise(SHIELD_MS);
        wipeClipboard();
      }
    };
    const onPointerMove = () => {
      if (untilPointer && Date.now() - raisedAt > SHIELD_MIN_MS) {
        window.clearTimeout(timer);
        lower();
      }
    };
    const onContextMenu = (e: MouseEvent) => {
      if (!editable(e.target)) e.preventDefault();
    };
    const onDragStart = (e: DragEvent) => {
      if (!editable(e.target)) e.preventDefault();
    };

    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("keyup", onKeyUp, true);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("dragstart", onDragStart);
    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("keyup", onKeyUp, true);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("dragstart", onDragStart);
      window.clearTimeout(timer);
      lower();
    };
  }, []);

  return null;
}
