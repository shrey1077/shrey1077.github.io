"use client";

/**
 * ProfileNav — the black identity header with a picture-triggered menu.
 *
 * A black pill sits top-left: a circular profile picture and the name. The
 * picture is the trigger — hovering it slides a basic nav menu out to the
 * RIGHT, and the menu stays open until the picture is clicked (a click toggles
 * it shut). Hovering anywhere on the pill keeps it open, so the links stay
 * reachable.
 *
 * The photo lives at /public/profile.jpg; until it's added, the circle falls
 * back to the script monogram, so nothing renders broken.
 */

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { SITE } from "@/constants/site";
import { EASE_OUT } from "@/constants/motion";
import { typeVoiceClass } from "@/constants/typography";

const NAV: { label: string; href: string; internal: boolean }[] = [
  { label: "Home", href: "/", internal: true },
  { label: "Work", href: "/clients", internal: true },
  { label: "Résumé", href: SITE.resume, internal: false },
  { label: "Contact", href: `mailto:${SITE.email}`, internal: false },
];

const LABEL = `${typeVoiceClass("logic", "meta")} text-[0.6rem]`;

export function ProfileNav() {
  const [open, setOpen] = useState(false);
  const [imgOk, setImgOk] = useState(true);

  return (
    <div className="pointer-events-auto flex items-center rounded-full bg-neutral-950 p-1.5 text-white ring-1 ring-white/10">
      {/* The picture is the trigger. */}
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        className="relative size-10 shrink-0 overflow-hidden rounded-full outline-none ring-1 ring-white/20 transition focus-visible:ring-2 focus-visible:ring-white/70"
      >
        {imgOk ? (
          <Image
            src="/profile.jpg"
            alt={SITE.name}
            fill
            sizes="40px"
            className="object-cover"
            onError={() => setImgOk(false)}
          />
        ) : (
          <span
            className={`${typeVoiceClass("thought", "display")} flex h-full w-full items-center justify-center bg-neutral-800 text-base leading-none text-white`}
          >
            {SITE.monogram}
          </span>
        )}
      </button>

      {/* Name — always shown, so the header reads as an identity when closed. */}
      <span className={`${LABEL} whitespace-nowrap px-3`}>{SITE.name}</span>

      {/* The menu — slides out to the right; stays until the picture is clicked. */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.nav
            key="nav"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "auto", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE_OUT }}
            className="overflow-hidden"
          >
            <ul className="flex items-center gap-5 whitespace-nowrap border-l border-white/15 pl-4 pr-3">
              {NAV.map((item) => (
                <li key={item.label}>
                  {item.internal ? (
                    <Link
                      href={item.href}
                      className={`${LABEL} text-white/70 transition-colors duration-200 hover:text-white`}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <a
                      href={item.href}
                      className={`${LABEL} text-white/70 transition-colors duration-200 hover:text-white`}
                    >
                      {item.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
}
