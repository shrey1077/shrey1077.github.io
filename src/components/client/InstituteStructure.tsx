/**
 * InstituteStructure — section 02: the organization and its branches.
 *
 * Data-driven from the client's experience config: the parent institute on top,
 * a hairline tree branching to each campus/branch below. The connector language
 * (thin rules + dot terminals) echoes the homepage navigation. Branch logos
 * resolve from config `logoSrc` when real assets land; until then each branch
 * carries a typographic monogram. Supports any number of branches.
 */

import Image from "next/image";
import type { ClientExperienceConfig } from "@/types/client";
import { typeVoiceClass } from "@/constants/typography";

type Institute = NonNullable<ClientExperienceConfig["institute"]>;

function BranchMark({ name, logoSrc }: { name: string; logoSrc?: string }) {
  if (logoSrc) {
    return (
      <span className="relative block size-14">
        <Image src={logoSrc} alt="" fill sizes="56px" className="object-contain" />
      </span>
    );
  }
  return (
    <span
      aria-hidden
      className={`${typeVoiceClass("creative", "display")} flex size-14 items-center justify-center border border-neutral-200 text-xl text-neutral-900`}
    >
      {name.charAt(0)}
    </span>
  );
}

export function InstituteStructure({ institute }: { institute: Institute }) {
  const { parentName, parentNote, branches } = institute;

  return (
    <div className="flex flex-col items-center">
      {/* Parent. */}
      <div className="flex flex-col items-center border border-neutral-200 bg-white px-10 py-6 text-center">
        <span
          className={`${typeVoiceClass("creative", "display")} text-xl text-neutral-900 sm:text-2xl`}
        >
          {parentName}
        </span>
        <span
          className={`${typeVoiceClass("logic", "meta")} mt-2 text-[0.6rem] text-neutral-500`}
        >
          {parentNote}
        </span>
      </div>

      {/* Stem down from the parent. */}
      <span aria-hidden className="h-10 w-px bg-neutral-300" />

      {/* Branch row: a spanning rule connects each branch's stem. */}
      <div className="relative w-full max-w-2xl">
        <span
          aria-hidden
          className="absolute top-0 h-px bg-neutral-300"
          style={{
            left: `${50 / branches.length}%`,
            right: `${50 / branches.length}%`,
          }}
        />
        <ul className="grid" style={{ gridTemplateColumns: `repeat(${branches.length}, 1fr)` }}>
          {branches.map((branch) => (
            <li key={branch.id} className="flex flex-col items-center">
              <span aria-hidden className="h-8 w-px bg-neutral-300" />
              <div className="flex flex-col items-center gap-3 border border-neutral-200 bg-white px-6 py-6 text-center transition-colors duration-500 hover:border-neutral-400">
                <BranchMark name={branch.city} logoSrc={branch.logoSrc} />
                <span className="text-sm font-medium text-neutral-900">
                  {branch.name}
                </span>
                <span
                  className={`${typeVoiceClass("logic", "meta")} text-[0.55rem] text-neutral-500`}
                >
                  {branch.city}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
