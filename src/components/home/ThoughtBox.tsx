"use client";

/**
 * ThoughtBox — the right brain, thinking out loud.
 *
 * The creative mirror of CodeStream, top-right against its top-left: the same
 * type-on cadence, the same faint decorative treatment, right-aligned instead
 * of left. Where the left types the site's own source in mono, this writes
 * stray thoughts in a hand — films, the bands, the painters, the sport.
 *
 * Five thoughts at a time, ONE LINE EACH. Both constraints are load-bearing:
 *
 * ⚠ Every entry in THOUGHTS is kept short (≤ ~38 characters) AND the lines are
 * `whitespace-nowrap`. The copy limit is what actually keeps them on one line;
 * the nowrap is the guarantee, so a longer thought added later fails loudly by
 * overflowing rather than quietly wrapping to two. Sunset Script runs about
 * 0.4em per character, so at 0.8rem a 38-character thought is ~195px inside a
 * 272px box — a real margin, not a squeak.
 *
 * ⚠ Only the TOP TWO are struck through, not every finished line. The strike
 * is therefore not a "line finished" tell — it is an "ageing out" one: a
 * thought is written plain, and crosses itself out as it rises to the top of
 * the stack and is about to fall off it.
 *
 * Because of that, the strike must animate on a line that is ALREADY MOUNTED
 * (it moves from index 2 to index 1 without remounting), so it is driven by
 * `animate={{ scaleX }}` with `initial={false}` rather than by a mount
 * animation. `done` is still keyed by a monotonic id, not by array index —
 * index keys are reused as the window scrolls and would hand a line the
 * previous occupant's strike state.
 *
 * This file previously held a different ThoughtBox — one thought at a time on
 * a 15s window, fading out. It was unreferenced (see the handoff's parked
 * list) and is replaced rather than sitting alongside a near-twin.
 */

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { EASE_OUT } from "@/constants/motion";

/** Films, classic rock, the painters, sport — shuffled together rather than
 *  grouped, so the box never reads as four themed blocks in rotation.
 *  ⚠ Keep every line ≤ ~38 characters. See the header. */
const THOUGHTS = [
  "Blade Runner, on a rainy night",
  "Zeppelin IV, side one, loud",
  "Van Gogh's cypresses, still moving",
  "Federer's backhand down the line",
  "Kurosawa framed rain best",
  "Wish You Were Here, all the way",
  "Caravaggio's one light source",
  "Jordan hanging a beat too long",
  "the Dollars trilogy, in order",
  "Hendrix bending a note too far",
  "Monet, the same haystack again",
  "Senna in the wet at Donington",
  "Kubrick, square to the millimetre",
  "Sabbath inventing a genre by accident",
  "Rembrandt's browns — how?",
  "Messi walking, then not walking",
  "the Coens' idea of a happy ending",
  "Riders on the Storm, at 2am",
  "Hokusai, still a student at 70",
  "Bolt looking sideways at 9.6",
  "Tarkovsky asks for patience",
  "Dire Straits, and that tone",
  "Turner lashed to the mast",
  "a draw that earns the five days",
  "Seven Samurai, and its copies",
  "Cream, and what a trio can do",
  "Klimt's gold, and its source",
  "Ali choosing the ropes",
  "Fellini filming a dream",
  "Queen stacking harmonies",
  "Basquiat, crown and all",
  "the third-shot drop, landing",
];

/** Thoughts held on screen at once. */
const VISIBLE = 5;
/** How many of them, counting from the top, are struck through. */
const STRUCK = 2;

interface Line {
  id: number;
  text: string;
}

export function ThoughtBox() {
  const reduceMotion = useReducedMotion();
  const [done, setDone] = useState<Line[]>([]);
  const [cur, setCur] = useState("");
  const pos = useRef({ line: 0, col: 0, id: 0 });

  useEffect(() => {
    if (reduceMotion) return;
    let t: number;
    const step = () => {
      const p = pos.current;
      const line = THOUGHTS[p.line % THOUGHTS.length];
      if (p.col < line.length) {
        p.col += 1;
        setCur(line.slice(0, p.col));
        // A shade slower than CodeStream's keystrokes — this is a hand, not a
        // terminal, and the script face needs the extra beat to be read.
        t = window.setTimeout(step, 28 + Math.random() * 55);
      } else {
        p.id += 1;
        const id = p.id;
        setDone((prev) => [...prev, { id, text: line }].slice(-VISIBLE));
        setCur("");
        p.line += 1;
        p.col = 0;
        t = window.setTimeout(step, 520);
      }
    };
    t = window.setTimeout(step, 600);
    return () => window.clearTimeout(t);
  }, [reduceMotion]);

  const resting: Line[] = reduceMotion
    ? THOUGHTS.slice(0, VISIBLE).map((text, id) => ({ id, text }))
    : done;

  return (
    <div
      aria-hidden
      className="font-sunset w-[min(23vw,17rem)] select-none text-right text-[0.8rem] leading-[1.6] text-neutral-400"
    >
      <div className="font-graff mb-1.5 flex items-center justify-end gap-1.5 text-[0.6rem] tracking-[0.15em] text-neutral-400">
        <span>right brain — thinking</span>
        <span className="size-1.5 rounded-full bg-neutral-300" />
      </div>

      {resting.map((l, i) => {
        // Counting from the top of the stack, which is the oldest end. While
        // the stack is still filling, fewer than STRUCK lines exist and that is
        // correct — the first thought is struck as soon as it has company.
        const struck = i < STRUCK;
        return (
          // ⚠ Two elements, and both are needed. The outer BLOCK gives the
          // thought its own line and carries the right-alignment; the inner
          // INLINE-BLOCK shrinks to the text so the strike's `w-full` measures
          // the words rather than the 272px column. As a single block span the
          // rule ran the whole width of the box and trailed far out to the
          // left of the text it was meant to cross out.
          <span key={l.id} className="block">
            <span className="relative inline-block whitespace-nowrap text-neutral-400/70">
              {l.text}
              {/* Driven by `animate`, not a mount animation: the line is
                  already on screen when it becomes top-two. */}
              <motion.span
                aria-hidden
                className="absolute left-0 top-1/2 block h-px w-full origin-right bg-current"
                initial={false}
                animate={{ scaleX: struck ? 1 : 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.45, ease: EASE_OUT }}
              />
            </span>
          </span>
        );
      })}

      {/* The line being written, with CodeStream's caret. */}
      {!reduceMotion && (
        <span className="block whitespace-nowrap text-neutral-600">
          {cur}
          <span className="ml-px inline-block h-[0.9em] w-[0.08em] translate-y-[0.12em] animate-pulse bg-neutral-500 align-baseline" />
        </span>
      )}
    </div>
  );
}
