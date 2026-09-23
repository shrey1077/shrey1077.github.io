"use client";

/**
 * TataRoomLink — a band's "Explore …" link, which really does open the room.
 *
 * The numbered bands are server-rendered and the six rooms live in a client
 * component's state, so a link in 02 cannot reach into the board directly. It
 * announces on the window instead and the board listens; the board is the only
 * thing that knows which room is open, which is how it should stay.
 *
 * ⚠ It is a BUTTON, not an anchor. It does not navigate — there is no separate
 * page for a room, and an <a href="#work"> would put a URL in the status bar
 * that promises one. Scrolling is the board's job once it has opened (see its
 * `onAnimationComplete`), so this only asks.
 */

export const TATA_OPEN_ROOM = "tata:open-room";

export function TataRoomLink({ room, children }: { room: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent(TATA_OPEN_ROOM, { detail: room }))}
      className="tata-body group inline-flex items-center gap-3 border-b border-neutral-400 pb-1 text-[0.62rem] uppercase tracking-[0.18em] text-neutral-700 outline-none transition-colors duration-300 hover:border-neutral-900 hover:text-neutral-900 focus-visible:ring-2 focus-visible:ring-neutral-900/40"
    >
      {children}
      <span aria-hidden className="inline-block transition-transform duration-300 group-hover:translate-x-1">
        →
      </span>
    </button>
  );
}
