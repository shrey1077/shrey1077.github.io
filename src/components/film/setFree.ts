/**
 * setFree — the owner's film of the boy setting the birds free, and the text
 * that flows round it, shared by the home page's Tata slide (TataSlide) and
 * the Tata IIS page's band 03 (FilmFlow; owner, 2026-10-16: "replace this
 * with our new animation").
 *
 *   · the film's files, and where its ink is frame by frame (loadWrap;
 *     scripts/prepare-tata-set-free.mjs);
 *   · layout — words laid out line by line, LETTER BY LETTER, round the ink,
 *     a word broken only where a bird cuts it;
 *   · inkOf — the ink across a line, and the ink nearest a point;
 *   · wake — the birds pushing nearby letters up and turning them, a lifted
 *     letter jostling the line above;
 *   · paintLetters — the letters drawn straight to the page, one span each,
 *     kept and reused, touched only when its letter or its place changes.
 */

/** The film, its first and last frames, and where its ink is, frame by
 *  frame (scripts/prepare-tata-set-free.mjs). 16:9, four seconds. */
export const FILM = "/content/clients/tata-iis/handbook/set-free.mp4";
export const FIRST = "/content/clients/tata-iis/handbook/set-free-first.webp";
export const LAST_FRAME = "/content/clients/tata-iis/handbook/set-free-last.webp";
export const WRAP = "/content/clients/tata-iis/handbook/set-free-wrap.json";
export const FILM_RATIO = 9 / 16;
/** How long the last frame holds before the film plays again. */
export const HOLD_MS = 3000;


export interface Wrap {
  w: number;
  h: number;
  band: number;
  fps: number;
  /** Per frame, per band: runs of ink as [start, end, start, end…], film px. */
  frames: number[][][];
}

let wrapLoad: Promise<Wrap> | null = null;
export function loadWrap(): Promise<Wrap> {
  wrapLoad ??= fetch(WRAP)
    .then((r) => r.json())
    .then((j: Omit<Wrap, "frames"> & { frames: string[] }) => ({
      ...j,
      frames: j.frames.map((f) => f.split(";").map((b) => (b ? b.split(",").map(Number) : []))),
    }));
  return wrapLoad;
}

/** One letter, placed in the flow. */
export interface Letter {
  ch: string;
  /** Its box's top-left, block px, and width. */
  x: number;
  y: number;
  w: number;
  /** The column and the line it stands on. */
  col: number;
  line: number;
}

export type Ink = (top: number, bottom: number) => [number, number][];

/** Each column's words, line by line and LETTER BY LETTER, round the film.
 *  A line's rooms are the column less the film's spans across it; words go
 *  in whole while they fit; where a room ends at the film's ink, a word that
 *  will not fit is broken there and carried on past it (owner: "you have
 *  freedom to break up words") — never leaving a single letter behind, or
 *  sending one on. At the column's own edge words wrap whole, as type does.
 *  A "\n" among the words ends a paragraph: the line closes, and `paraGap`
 *  (px) is left before the next. */
export function layout(
  columns: { x0: number; x1: number; words: string[] }[],
  lineH: number,
  charW: (c: string) => number,
  space: number,
  ink: Ink,
  minRoom: number,
  paraGap = 0,
): { letters: Letter[]; heights: number[] } {
  const letters: Letter[] = [];
  const heights: number[] = [];
  const widthOf = (s: string) => {
    let w = 0;
    for (const c of s) w += charW(c);
    return w;
  };
  columns.forEach(({ x0, x1, words }, col) => {
    let y = 0;
    let line = 0;
    let wi = 0; // the word
    let ci = 0; // how much of it is already placed
    const put = (s: string, x: number) => {
      for (const c of s) {
        const w = charW(c);
        letters.push({ ch: c, x, y, w, col, line });
        x += w;
      }
      return x;
    };
    while (wi < words.length && y < 4000) {
      const rooms: [number, number][] = [];
      let at = x0;
      for (const [a, b] of ink(y, y + lineH)) {
        if (b <= x0 || a >= x1) continue;
        if (a - at >= minRoom) rooms.push([at, a]);
        at = Math.max(at, b);
      }
      if (x1 - at >= minRoom) rooms.push([at, x1]);
      let para = false;
      for (const [a, b] of rooms) {
        if (para) break;
        let x = a;
        let fresh = true; // nothing in this room yet
        const atInk = b < x1 - 0.5; // the room ends at a bird, not the column
        while (wi < words.length) {
          if (words[wi] === "\n") {
            wi++;
            para = true;
            break;
          }
          const word = words[wi];
          const rest = word.slice(ci);
          const gap = fresh || ci > 0 ? 0 : space;
          if (x + gap + widthOf(rest) <= b) {
            x = put(rest, x + gap);
            wi++;
            ci = 0;
            fresh = false;
            continue;
          }
          // Not whole: as many letters as the room still holds.
          let k = 0;
          let used = 0;
          while (ci + k < word.length && x + gap + used + charW(word[ci + k]) <= b) {
            used += charW(word[ci + k]);
            k++;
          }
          const left = word.length - (ci + k);
          // Break here only against ink — or a word longer than the room.
          if ((atInk && k >= 2 && left >= 2) || (fresh && k >= 1 && widthOf(rest) > b - a)) {
            put(word.slice(ci, ci + k), x + gap);
            ci += k;
            if (ci >= word.length) {
              wi++;
              ci = 0;
            }
          }
          break; // this room is full
        }
      }
      y += lineH + (para ? paraGap : 0);
      line++;
    }
    heights.push(y);
  });
  return { letters, heights };
}

/** The film's ink for frame `f`, with the film's top-left at (fx, fy) in the
 *  block and `fw` wide: its spans across a line (padded — the rooms the
 *  letters flow in), and the nearest ink to a point (the push). */
export function inkOf(wrap: Wrap, f: number, fx: number, fy: number, fw: number, size: number) {
  const runs = wrap.frames[f] ?? [];
  const s = fw / wrap.w; // film px → block px
  const padX = size * 0.4;
  const padY = size * 0.15;
  const bandH = wrap.band * s;
  const spans: Ink = (top, bottom) => {
    const b0 = Math.max(0, Math.floor((top - fy - padY) / bandH));
    const b1 = Math.min(runs.length - 1, Math.floor((bottom - fy + padY) / bandH));
    if (b1 < 0 || b0 > b1) return [];
    const out: [number, number][] = [];
    for (let b = b0; b <= b1; b++) {
      const r = runs[b];
      for (let k = 0; k < r.length; k += 2) out.push([fx + r[k] * s - padX, fx + r[k + 1] * s + padX]);
    }
    out.sort((p, q) => p[0] - q[0]);
    const merged: [number, number][] = [];
    for (const sp of out) {
      const last = merged[merged.length - 1];
      if (last && sp[0] <= last[1]) last[1] = Math.max(last[1], sp[1]);
      else merged.push([sp[0], sp[1]]);
    }
    return merged;
  };
  /** The nearest ink to (cx, cy) within `reach`: its point and distance. */
  const nearest = (cx: number, cy: number, reach: number) => {
    const b0 = Math.max(0, Math.floor((cy - reach - fy) / bandH));
    const b1 = Math.min(runs.length - 1, Math.floor((cy + reach - fy) / bandH));
    let best = reach * reach;
    let px = 0;
    let py = 0;
    let hit = false;
    for (let b = b0; b <= b1; b++) {
      const r = runs[b];
      if (!r.length) continue;
      const by = fy + (b + 0.5) * bandH;
      const dy2 = (cy - by) * (cy - by);
      if (dy2 >= best) continue;
      for (let k = 0; k < r.length; k += 2) {
        const a = fx + r[k] * s;
        const e = fx + r[k + 1] * s;
        const nx = cx < a ? a : cx > e ? e : cx;
        const d2 = (cx - nx) * (cx - nx) + dy2;
        if (d2 < best) {
          best = d2;
          px = nx;
          py = by;
          hit = true;
        }
      }
    }
    return hit ? { d: Math.sqrt(best), px, py } : null;
  };
  return { spans, nearest };
}

/** How far a bird's wake reaches, in lines; how far it pushes a letter, in
 *  lines; how far it turns one, in degrees. */
const WAKE = 2.2;
const PUSH = 0.85;
const TURN = 42;

/**
 * The birds' wake (owner: "rotate and push letters into above sentences
 * which get further disturbed"): each letter near ink is pushed away from it
 * — and UP, mostly, the way the flock flies — and turned; a letter pushed up
 * into the line above jostles the letters it lands among, and they the line
 * above them, fading as it goes. Returns per letter [dx, dy, degrees].
 */
export function wake(letters: Letter[], lineH: number, size: number, nearest: (cx: number, cy: number, r: number) => { d: number; px: number; py: number } | null) {
  const out = new Float32Array(letters.length * 3);
  const reach = WAKE * lineH;
  // Its own push, from the nearest ink.
  letters.forEach((L, i) => {
    const cx = L.x + L.w / 2;
    const cy = L.y + lineH / 2;
    const n = nearest(cx, cy, reach);
    if (!n) return;
    const t = 1 - n.d / reach;
    const s = t * t * (3 - 2 * t);
    let vx = n.d > 0.5 ? (cx - n.px) / n.d : 0;
    let vy = n.d > 0.5 ? (cy - n.py) / n.d : -1;
    vy -= 0.8; // the way the flock flies
    const len = Math.hypot(vx, vy) || 1;
    vx /= len;
    vy /= len;
    const jitter = 0.65 + 0.35 * Math.abs(Math.sin(i * 12.9898) * 43758.5453 % 1);
    out[i * 3] = vx * s * PUSH * lineH;
    out[i * 3 + 1] = vy * s * PUSH * lineH;
    out[i * 3 + 2] = (vx >= 0 ? 1 : -1) * s * TURN * jitter;
  });
  // The knock-on, line by line upward: a letter lifted into the line above
  // shoulders the letters there, a little less each line.
  const byLine = new Map<string, number[]>();
  letters.forEach((L, i) => {
    const k = `${L.col}:${L.line}`;
    const a = byLine.get(k);
    if (a) a.push(i);
    else byLine.set(k, [i]);
  });
  const lines = [...byLine.keys()].map((k) => k.split(":").map(Number)).sort((p, q) => q[1] - p[1]);
  for (const [col, line] of lines) {
    const above = byLine.get(`${col}:${line - 1}`);
    if (!above) continue;
    for (const i of byLine.get(`${col}:${line}`)!) {
      const lift = -out[i * 3 + 1] - 0.25 * lineH; // how far into the line above
      if (lift <= 0) continue;
      const cx = letters[i].x + letters[i].w / 2 + out[i * 3];
      for (const j of above) {
        const dx = letters[j].x + letters[j].w / 2 - cx;
        if (Math.abs(dx) > size * 1.1) continue;
        const f = (1 - Math.abs(dx) / (size * 1.1)) * 0.6;
        const ny = -lift * f;
        if (ny < out[j * 3 + 1]) out[j * 3 + 1] = ny;
        out[j * 3] += (dx >= 0 ? 1 : -1) * lift * f * 0.35;
        out[j * 3 + 2] += out[i * 3 + 2] * f * 0.5;
      }
    }
  }
  // Where a push would land a letter on another bird, ease it back toward
  // where it stood (which the flow keeps clear of ink).
  letters.forEach((L, i) => {
    if (!out[i * 3] && !out[i * 3 + 1]) return;
    for (const k of [1, 0.6, 0.3, 0]) {
      const n = nearest(L.x + L.w / 2 + out[i * 3] * k, L.y + lineH / 2 + out[i * 3 + 1] * k, size * 0.6);
      if (!n || n.d >= size * 0.55 || k === 0) {
        out[i * 3] *= k;
        out[i * 3 + 1] *= k;
        out[i * 3 + 2] *= k === 0 ? 0 : Math.max(k, 0.5);
        break;
      }
    }
  });
  return out;
}

/** One drawn letter: its span, and what it was last given. */
export interface Painted {
  el: HTMLSpanElement;
  ch: string;
  tf: string;
}

/** Draw `letters` into `host`, moved by `moves` ([dx, dy, degrees] each),
 *  reusing the spans in `pool` and hiding any left over. */
export function paintLetters(host: HTMLElement, pool: Painted[], letters: Letter[], moves: Float32Array) {
  for (let i = 0; i < letters.length; i++) {
    const L = letters[i];
    let p = pool[i];
    if (!p) {
      const el = document.createElement("span");
      el.className = "absolute left-0 top-0 whitespace-pre";
      el.style.transformOrigin = "50% 60%";
      host.appendChild(el);
      p = pool[i] = { el, ch: "", tf: "" };
    }
    if (p.ch !== L.ch) {
      p.el.textContent = L.ch;
      p.ch = L.ch;
    }
    const dx = moves[i * 3];
    const dy = moves[i * 3 + 1];
    const r = moves[i * 3 + 2];
    const tf = `translate(${(L.x + dx).toFixed(1)}px,${(L.y + dy).toFixed(1)}px)${Math.abs(r) > 0.2 ? ` rotate(${r.toFixed(1)}deg)` : ""}`;
    if (p.tf !== tf) {
      p.el.style.transform = tf;
      p.tf = tf;
    }
    if (p.el.hidden) p.el.hidden = false;
  }
  for (let i = letters.length; i < pool.length; i++) if (!pool[i].el.hidden) pool[i].el.hidden = true;
}
