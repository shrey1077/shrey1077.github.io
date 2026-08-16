/**
 * PortraitOrb — the owner, twice, in one circle.
 *
 * Two frames of the same sitting, cross-dissolving on a 10s loop: the mono
 * portrait in a black ring for the logic half, the paint-splattered one in a
 * paint ring for the creative half. Same face, same framing, same crop — the
 * head registers between the two, so the dissolve reads as one person changing
 * rather than two photographs swapping.
 *
 * Deliberately NOT a client component. There is no state, no interaction and
 * no measurement here: the whole loop is two CSS animations, one of them half a
 * cycle out of phase (see `portrait-cross` in globals.css). That keeps it off
 * the JS main thread entirely and out of the client bundle.
 *
 * ⚠ The paint ring is `.brain-paint` — the site's animated rainbow gradient,
 * which is what the creative pins wore before the supplied artwork replaced
 * them. It reads as paint but it is NOT literal splatter. Swap it for a real
 * splatter ring if one is ever cut with a transparent centre.
 */

import Image from "next/image";

/** Both frames are cropped to the same 480×480 square, top-aligned, which puts
 *  the face just above the circle's centre — where a face wants to sit. */
const SRC = {
  mono: "/content/portrait/portrait-mono.webp",
  colour: "/content/portrait/portrait-colour.webp",
};

export function PortraitOrb({ className = "" }: { className?: string }) {
  return (
    <div className={`relative aspect-square ${className}`}>
      {/* Logic half — mono, hard black ring. */}
      <div className="portrait-layer absolute inset-0 overflow-hidden rounded-full border-[3px] border-neutral-950">
        <Image
          src={SRC.mono}
          alt="Shrey Singh"
          fill
          sizes="220px"
          className="object-cover"
        />
      </div>

      {/* Creative half — the paint frame. Same black ring as the mono layer
          FOR NOW: the owner is supplying circular border artwork, and this is
          the placeholder until it lands. A `.brain-paint` ring was tried here
          and works (paint wrapper + inner picture, the trick the pins use,
          since a CSS border cannot hold a gradient) — reinstate that shape
          when the real border arrives. */}
      <div className="portrait-layer portrait-layer-b absolute inset-0 overflow-hidden rounded-full border-[3px] border-neutral-950">
        <Image
          src={SRC.colour}
          alt=""
          fill
          sizes="220px"
          className="object-cover"
        />
      </div>
    </div>
  );
}
