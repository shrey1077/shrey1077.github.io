"use client";

/**
 * TataFader — a picture that changes by cross-fading, and only once the new
 * one has loaded, so a tile never flashes empty between two pieces
 * (2026-10-05). The old picture fades OUT as the new one fades in, because a
 * contained picture leaves margins the old one would show through.
 */

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export function TataFader({ src, sizes, className }: { src: string; sizes: string; className?: string }) {
  const [layers, setLayers] = useState([{ src, id: 0 }]);
  const top = layers[layers.length - 1];

  useEffect(() => {
    if (top.src === src) return;
    let live = true;
    const img = new window.Image();
    img.src = src;
    img
      .decode()
      .catch(() => {})
      .then(() => {
        if (live) setLayers((l) => [l[l.length - 1], { src, id: l[l.length - 1].id + 1 }]);
      });
    return () => {
      live = false;
    };
  }, [src, top.src]);

  return (
    <>
      {layers.map((l, i) => (
        <motion.span
          key={l.id}
          className="absolute inset-0 block"
          initial={l.id === 0 ? false : { opacity: 0 }}
          animate={{ opacity: i === layers.length - 1 ? 1 : 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          <Image src={l.src} alt="" fill sizes={sizes} className={className} />
        </motion.span>
      ))}
    </>
  );
}
