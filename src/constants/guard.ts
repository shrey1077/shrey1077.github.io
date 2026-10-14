/**
 * guard — the one switch for ScreenGuard's deterrents (owner, 2026-10-05:
 * "disable screenshotting on my website throughout").
 *
 * OFF since 2026-10-14 (owner: "enable screenshot, i will disable later").
 * Set it back to `true` to bring every deterrent back at once:
 *   · the screenshot keys black the page out, and Print Screen clears the
 *     clipboard (ScreenGuard);
 *   · save and print are refused, and a print comes out blank;
 *   · right-click, dragging an image out, selecting text and a phone's
 *     long-press "save image" are off (ScreenGuard, globals.css).
 * The layout marks <html data-guard> while it is on; globals.css keys every
 * one of its rules to that attribute.
 *
 * ⚠ A plain module, not the component's: a server component (the layout)
 * reading a constant out of a "use client" file gets a client reference, not
 * the value.
 */
export const SCREEN_GUARD_ON = false;
