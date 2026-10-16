/**
 * TataExperience — the bespoke Tata IIS full-experience page.
 *
 * ⚠ RE-LAID 2026-09-22 FROM THE OWNER'S COMP. It was a centred stack — wordmark,
 * description, the two campuses, then the work. It is now a two-column hero and
 * a run of numbered bands, which is what that comp asks for:
 *
 *   hero          wordmark, the pitch, the campaign artwork, endorsements
 *   01 institute  what Tata IIS is, against a campus photograph
 *   02 system     the mark's change of voice, the rulebook, the three
 *                 identities (SystemBand)
 *   03 handbook   the trainee handbook — its points, its pages in both
 *                 editions (HandbookBand)
 *   04 mockups    every themed mockup, on one moving wall (MockupsBand)
 *   05 print      all sixteen subsections, one tile each (PrintBand)
 *   06 reality    every installed piece, its design inset (RealityBand)
 *   07 camera     photo / videography and editing, by aspect (PhotoStoryBand)
 *   08 digital    socials, website banners, the deck (DigitalBand)
 *   09 the role   the owner's account of the job, and the way to get in touch
 *   marquee + TataFooter
 *
 * ⚠ 04–09 WERE RE-SET ON 2026-10-05 for the owner's "show all my work in the
 * minimal amount of scrolls": each band's words moved into a margin column
 * beside its work (SideBand), and each band shows ALL its work in about a
 * screen. The six rooms behind cards (TataSectionsBoard) and the five-panel
 * showcase over them (WorkShowcase) went with it — every piece they held is
 * laid open in 02 and 04–08 — and Collaborate folded into 09. git has all of
 * it; so does _source/backup-2026-10-05-before-rethink.tar.
 *
 * The copy and the pointers live in `tataStory.ts`; this file is the layout.
 *
 * ⚠ The comp's marks are redrawn approximations and its campus taglines are
 * invented. Everything on the page is the client's own file or the repo's own
 * words; tataStory.ts says so at more length, and it matters.
 *
 * Server Component; the bands read the catalogue themselves, and the
 * interactive pieces are client children.
 */

import Link from "next/link";
import Image from "next/image";
import { clientExperienceBySlug } from "@/constants/clientExperiences";
import {
  CAMPUS_INK_AREA,
  inkBox,
  POWERED_INK_AREA,
  TATA_DESCRIPTION,
  TATA_POWERED_BY,
  TATA_PARTNERS,
  TATA_GRID,
  TATA_GUIDELINES,
} from "@/constants/tataExperience";
import { TATA_WORK_INTRO } from "@/constants/tataSections";
import {
  TATA_COLLABORATE,
  TATA_HERO,
  TATA_CAMPUS_PROFILES,
  TATA_INDEX,
  TATA_WHO,
  TATA_WHO_ART,
  TATA_CLOSING_ART,
  TATA_WORK_BAND,
} from "@/constants/tataStory";
import { CampusTheme } from "@/components/client/tata/CampusTheme";
import { SystemBand } from "@/components/client/tata/SystemBand";
import { HandbookBand } from "@/components/client/tata/HandbookBand";
import { MockupsBand } from "@/components/client/tata/MockupsBand";
import { PrintBand } from "@/components/client/tata/PrintBand";
import { RealityBand } from "@/components/client/tata/RealityBand";
import { PhotoStoryBand } from "@/components/client/tata/PhotoStoryBand";
import { DigitalBand } from "@/components/client/tata/DigitalBand";
import { SideBand } from "@/components/client/tata/SideBand";
import { SITE } from "@/constants/site";
import { ExperienceTransition } from "@/components/transition/ExperienceTransition";
import { PartnerMarquee } from "@/components/client/tata/PartnerMarquee";
import { TataFooter } from "@/components/client/tata/TataFooter";

const SLUG = "tata-iis";
/* ⚠ THESE LIVE AT MODULE SCOPE, and must stay there. Declaring a component
 * inside another one makes React see a brand-new type on every render, which
 * remounts its whole subtree — the lint rule `react-hooks/static-components`
 * fails the build over it. They were defined inside TataExperience first and
 * moved straight back out. */

/** Every band shares one inset, so the numbers line up down the page. */
const SHELL = "mx-auto w-full max-w-7xl px-6 sm:px-10";
/** The small letterspaced caps the comp sets every label in. */
const KICKER = "tata-body text-[0.6rem] uppercase tracking-[0.2em] text-neutral-500";

/** The words set small down the right edge of a band. Desktop only: they are
 *  atmosphere, and on a phone they would be four more lines to scroll past. */
const Rail = ({ words }: { words: readonly string[] }) => (
  <p aria-hidden className={`${KICKER} hidden self-start leading-[2.2] xl:block`}>
    {words.map((w) => (
      <span key={w} className="block">
        {w}
      </span>
    ))}
  </p>
);

export function TataExperience() {
  const theme = clientExperienceBySlug(SLUG)?.brandTheme;
  // The page speaks in exactly two typefaces: Copperplate Gothic Bold for
  // headings (.tata-heading) and Helvetica for everything else. The
  // `tata-scope` class (see globals.css) collapses any shared component's
  // voiced utilities to Helvetica so no third face leaks in.
  const themeVars = {
    "--brand-accent": theme?.accent ?? "#14279B",
  } as React.CSSProperties;

  return (
    <main className="tata-scope tata-body relative min-h-dvh w-full bg-gallery" style={themeVars}>
      {/* Circuit-grid wash — a fixed whisper behind the whole page. */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <Image src={TATA_GRID} alt="" fill priority sizes="100vw" className="object-cover opacity-70" />
      </div>

      {/* ⚠ No z-index here (it was z-10 until 2026-10-16): one would seal
          the page's content off from the grid wash behind it, and the band 03
          film's "multiply" (FilmFlow) would then show its white as a box over
          the grid. Being later in the page keeps it above the wash anyway. */}
      <div className="relative">
        <ExperienceTransition>
          {/* ── Hero ─────────────────────────────────────────────────────────
              ⚠ IT HOLDS THE WHOLE VIEWPORT (owner, 2026-09-23): "the 01, 02…
              columns should appear only after scrolling". `100svh` — the SMALL
              viewport height — so a mobile browser's collapsing toolbar cannot
              push band 01 into view on load and then yank it away.

              The 16:9 hero film opened this page until 2026-08-17. It,
              VideoHero, the old TATA_HERO, hero.mp4, hero-poster.jpg and the
              pipeline step that built the poster are all gone — recover from
              git if it ever returns. What sits here now is the owner's campaign
              artwork, cut out of its white ground by
              scripts/prepare-tata-hero.mjs. */}
          <header className="relative">
            {/* The artwork, BLEEDING to the viewport's right edge — which is why
                it is a child of the header and not of the shell below, whose
                max width would have stopped it short. Desktop only; the phone
                gets it in flow under the copy, further down. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 right-0 hidden w-[54%] lg:block xl:w-[52%]"
            >
              <Image
                src={TATA_HERO.art}
                alt=""
                fill
                priority
                sizes="54vw"
                className="object-contain object-right-bottom"
              />
            </div>

            {/* ⚠ ONE rail, not two. The comp's "THINK / DESIGN / SKILL /
                IMPACT" sat at the top right, which is exactly where the
                artwork's own "PEOPLE SKILLS INDUSTRY INDIA" caption now sits
                once the art bleeds this far left — they overlapped outright.
                The artwork's is the owner's own wording, so the page's rail
                gives way and only the foot one is left. TATA_HERO.rail is kept
                in the constants for whoever wants to place it elsewhere. */}
            <div aria-hidden className="pointer-events-none absolute bottom-28 right-5 hidden text-right xl:block">
              <p className={`${KICKER} leading-[1.9]`}>
                {TATA_HERO.railFoot.map((w) => (
                  <span key={w} className="block">
                    {w}
                  </span>
                ))}
              </p>
            </div>

            <div className={`${SHELL} relative flex min-h-[100svh] flex-col pt-8`}>
              <Link
                href="/"
                className="tata-body group inline-flex items-center gap-2 self-start rounded text-[0.7rem] uppercase tracking-[0.18em] text-neutral-500 outline-none transition-colors duration-300 hover:text-neutral-900 focus-visible:text-neutral-900 focus-visible:ring-2 focus-visible:ring-neutral-900/40 focus-visible:ring-offset-2"
              >
                <span aria-hidden className="inline-block transition-transform duration-300 group-hover:-translate-x-1">
                  ←
                </span>
                Back
              </Link>

              {/* ── The words. `flex-1` + `justify-center` sits them in the
                  middle of whatever height is left, so the hero stays composed
                  on a 700px laptop and on a 1200px display alike. ── */}
              <div className="flex flex-1 flex-col justify-center py-10 lg:w-[46%] lg:py-0">
                <span className={KICKER}>{TATA_HERO.eyebrow.join("   /   ")}</span>

                {/* The real wordmark file — never type set to look like it.
                    ⚠ TWICE THE SIZE it was (owner, 2026-09-26): h-14/h-[4.5rem]
                    became h-28/h-[9rem]. The file is 1020×257, so at 144px tall
                    it wants 571px of width — `max-w-[36rem]` is just past that,
                    which lets the height lead and keeps the mark off the
                    artwork bleeding in from the right. */}
                <span className="relative mt-6 block h-28 w-full max-w-[36rem] sm:h-[9rem]">
                  <Image
                    src={TATA_GUIDELINES.wordmark}
                    alt="TATA IIS — Tata Indian Institute of Skills"
                    fill
                    priority
                    sizes="576px"
                    className="object-contain object-left"
                  />
                </span>

                <span aria-hidden className="mt-8 block h-px w-9 bg-neutral-400" />

                <h1 className="tata-display mt-6 text-[clamp(2rem,4.2vw,3.4rem)] leading-[1.06] text-neutral-900">
                  {TATA_HERO.headline.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </h1>

                <span aria-hidden className="mt-7 block h-px w-9 bg-neutral-400" />
              </div>

              {/* ── The foot: who stands behind the institute, and the scroll
                  cue. Moved down here from beside the artwork on 2026-09-23. ── */}
              {/* ⚠ THE BODY COPY LIVES DOWN HERE (owner, 2026-09-27). It sat in
                  the centred block with the wordmark and the headline, which
                  left a gap of dead air between the room list and the
                  endorsements; the copy now closes that gap from below and the
                  headline keeps the middle of the stage to itself.
                  On a phone this is all one column anyway, so the reading order
                  is unchanged: wordmark, headline, copy, rooms, artwork,
                  endorsements. */}
              <div className="relative mt-auto pt-10 lg:w-[46%]">
                  <p className="tata-body mt-6 max-w-xl text-[0.92rem] leading-relaxed text-neutral-700">
                    {TATA_DESCRIPTION}
                  </p>

                  {/* What the page holds, named up front — and each name a way
                      straight down to its band (2026-10-05; it was the six
                      rooms, as plain words, until the rooms went).
                      ⚠ The separator TRAILS its item rather than leading the next
                      one: leading it puts a stray "/" at the start of any line the
                      list wraps onto. */}
                  <ul className="mt-9 flex flex-wrap items-center gap-x-2 gap-y-2">
                    {TATA_INDEX.map((entry, i) => (
                      <li key={entry.href} className={KICKER}>
                        <a
                          href={entry.href}
                          className="rounded-sm transition-colors hover:text-neutral-900 focus-visible:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/30"
                        >
                          {entry.label}
                        </a>
                        {i < TATA_INDEX.length - 1 && (
                          <span aria-hidden className="ml-2 text-neutral-300">
                            /
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>

                  {/* The phone's copy of the artwork, in flow. Hidden from the
                      moment the bleed layer above takes over. */}
                  <div className="relative mt-10 block aspect-[1071/1469] w-full lg:hidden">
                    <Image
                      src={TATA_HERO.art}
                      alt={TATA_HERO.artAlt}
                      fill
                      sizes="92vw"
                      className="object-contain"
                    />
                  </div>
              </div>

              <div className="relative mt-8 flex flex-wrap items-end justify-between gap-8 pb-10 lg:w-[46%]">
                <div>
                  <span className={KICKER}>Powered by</span>
                  {/* ⚠ EQUAL INK AREA, not equal height or equal box. See
                      TATA_POWERED_BY: each logo's box is derived from its own
                      measured ink so a wordmark and an emblem carry the same
                      visual weight. `items-end` sits them all on one baseline
                      whatever height that works out to. */}
                  <ul className="mt-5 flex flex-wrap items-end gap-x-9 gap-y-6">
                    {TATA_POWERED_BY.map((p) => {
                      if (!p.src) {
                        return (
                          <li key={p.name} className="max-w-[8.5rem] leading-tight">
                            <span className="tata-subhead text-[0.72rem] text-neutral-700">{p.name}</span>
                          </li>
                        );
                      }
                      // ⚠ Equal ink AREA, and the box pulled DOWN by the
                      // padding under the ink — so what lines up along the row
                      // is each mark's own baseline rather than the edge of
                      // four differently padded canvases. See `inkBox`.
                      const box = inkBox(p.ink ?? { aspect: 3, fillH: 1, box: 3 }, POWERED_INK_AREA);
                      return (
                        <li key={p.name}>
                          <span
                            className="relative block"
                            style={{
                              height: `${box.height}px`,
                              width: `${box.width}px`,
                              marginBottom: `${-box.padBottom}px`,
                            }}
                          >
                            <Image
                              src={p.src}
                              alt={p.name}
                              fill
                              sizes="220px"
                              className="object-contain object-left-bottom"
                            />
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <p aria-hidden className={`${KICKER} flex items-center gap-3 pb-1`}>
                  <span className="block h-7 w-px bg-neutral-300" />
                  Scroll
                </p>
              </div>
            </div>
          </header>

          {/* ── 01 — who we are: the two campuses, each with its building ──
              ⚠ NOT a <Band>. Every other band is a head beside one piece of
              evidence; this one is a head ABOVE two equal columns, because the
              owner asked on 2026-09-26 for both campuses to introduce
              themselves side by side and neither is the other's subordinate.
              The photographs are the client's own buildings, supplied by the
              owner — Lab 1 at Ahmedabad, the Chunabhatti frontage at Mumbai. */}
          <section className="border-t border-neutral-200/70 bg-white/55">
            <div
              className={`${SHELL} grid grid-cols-1 items-start gap-y-8 pt-14 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:gap-x-10 lg:pt-20`}
            >
              <p aria-hidden className="tata-display text-[clamp(2.6rem,5.5vw,4.5rem)] leading-[0.85] text-neutral-300">
                {TATA_WHO.number}
              </p>
              <div className="max-w-2xl">
                <span className={KICKER}>{TATA_WHO.kicker}</span>
                <h2 className="tata-display mt-4 text-[clamp(1.55rem,2.7vw,2.25rem)] leading-[1.12] text-neutral-900">
                  {TATA_WHO.headline.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </h2>
                <p className="tata-body mt-5 max-w-xl text-[0.9rem] leading-relaxed text-neutral-700">
                  {TATA_WHO.body}
                </p>
              </div>
              {TATA_WHO.rail ? <Rail words={TATA_WHO.rail} /> : <span aria-hidden />}
            </div>

            <div className={`${SHELL} grid grid-cols-1 gap-10 pb-4 md:grid-cols-2 md:gap-10 lg:pb-6 lg:pt-6`}>
              {TATA_CAMPUS_PROFILES.map((campus) => (
                <article key={campus.label}>
                  {/* Each column runs its own film, then its own photographs.
                      Ahmedabad has three, Mumbai one — see
                      TATA_CAMPUS_PROFILES. CampusTheme handles both, and the
                      box is the same either way. */}
                  <CampusTheme
                    film={campus.film}
                    photos={campus.photos}
                    sizes="(max-width: 768px) 92vw, 45vw"
                  />

                  {/* The campus mark, sized so the two cover the same ink —
                      see `inkBox`. The outer box is a fixed height for both;
                      Mumbai's inner box overflows it with transparent padding,
                      which is what makes the two marks weigh the same without a
                      second copy of the file on disk. */}
                  <span className="mt-6 flex h-14 w-full items-center justify-start">
                    <span
                      className="relative block"
                      style={{
                        height: `${inkBox(campus.ink, CAMPUS_INK_AREA).height}px`,
                        width: `${inkBox(campus.ink, CAMPUS_INK_AREA).width}px`,
                      }}
                    >
                      <Image
                        src={campus.logo}
                        alt={`${campus.label} logo`}
                        fill
                        sizes="180px"
                        className="object-contain object-left"
                      />
                    </span>
                  </span>

                  <p className="tata-body mt-4 text-[0.88rem] leading-relaxed text-neutral-700">
                    {campus.text}
                  </p>
                </article>
              ))}
            </div>

            {/* The band's close: the owner's industrial artwork, edge to
                edge (2026-10-03). Decorative. Its foot fades out, so it
                dissolves into band 02 rather than ending on a hard edge. */}
            <div
              aria-hidden
              className="pointer-events-none relative w-full"
              style={{
                aspectRatio: `${TATA_WHO_ART.w} / ${TATA_WHO_ART.h}`,
                maskImage: "linear-gradient(to bottom, #000 78%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(to bottom, #000 78%, transparent 100%)",
              }}
            >
              <Image src={TATA_WHO_ART.src} alt="" fill sizes="100vw" className="object-cover" />
            </div>
          </section>

          {/* ── 02 — the mark's change of voice: before and after, what the
              rulebook fixes, the three identities. One section, three
              movements; re-set 2026-10-03 — see SystemBand. ── */}
          <SystemBand />

          {/* ── 03 — the trainee handbook: its points, and its pages in both
              editions (owner, 2026-10-04). See HandbookBand. ── */}
          <HandbookBand />

          {/* ── 04–08 — the work, medium by medium (owner, 2026-10-04): the
              mockups in their three themes, Print, the work as installed,
              the camera and the screens — each laid open in about a screen
              since 2026-10-05. ── */}
          <MockupsBand />
          <PrintBand />
          <RealityBand />
          <PhotoStoryBand />
          <DigitalBand />

          {/* ── 09 — the role: the owner's own account of the job, closing the
              page, and the way to get in touch beside it. ── */}
          <SideBand band={TATA_WORK_BAND} id="tata-role-title" anchor="role" ground="bg-white/55">
            <div className="grid grid-cols-1 gap-x-12 gap-y-10 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
              {/* Long, first-person and already written — TATA_WORK_INTRO. */}
              <p className="tata-body max-w-[62ch] text-[0.95rem] leading-[1.75] text-neutral-700">{TATA_WORK_INTRO}</p>

              <div className="border-t border-neutral-300/80 pt-5 xl:border-l xl:border-t-0 xl:pl-10 xl:pt-0">
                <span className={KICKER}>{TATA_COLLABORATE.kicker}</span>
                <h3 className="tata-display mt-3 text-[clamp(1.4rem,2.1vw,1.85rem)] leading-[1.12] text-neutral-900">
                  {TATA_COLLABORATE.headline}
                </h3>
                <p className="tata-body mt-3 text-[0.88rem] leading-relaxed text-neutral-700">{TATA_COLLABORATE.body}</p>
                <div className="mt-6 flex flex-wrap items-start gap-x-12 gap-y-6">
                  <div>
                    <span className={KICKER}>Get in touch</span>
                    <p className="tata-body mt-3 text-[0.95rem] text-neutral-900">
                      <a
                        href={`mailto:${SITE.email}`}
                        className="border-b border-neutral-300 pb-0.5 transition-colors hover:border-neutral-900"
                      >
                        {SITE.email}
                      </a>
                    </p>
                  </div>
                  <div>
                    <span className={KICKER}>Follow</span>
                    {/* ⚠ Only the two profiles the site actually knows. The comp
                        shows four; site.ts has LinkedIn and Behance, flagged there
                        as placeholders to replace, and inventing the other two
                        would put dead links on a client's page. */}
                    <ul className="mt-3 flex items-center gap-6">
                      {[
                        { label: "LinkedIn", href: SITE.linkedin },
                        { label: "Behance", href: SITE.behance },
                      ].map((l) => (
                        <li key={l.label}>
                          <a
                            href={l.href}
                            target="_blank"
                            rel="noreferrer"
                            className="tata-body border-b border-neutral-300 pb-0.5 text-[0.8rem] text-neutral-700 transition-colors hover:border-neutral-900 hover:text-neutral-900"
                          >
                            {l.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </SideBand>

          {/* The partner marquee, LAST — moved down from between the brand
              blocks and the work on the owner's instruction, 2026-08-25. It
              reads as a closing credit here rather than as an interruption
              partway down, and it no longer sits between the reader and the
              rooms. */}
          <section className="border-t border-neutral-200/70 py-8">
            <div className={SHELL}>
              <span className={`${KICKER} block px-1`}>In the company of</span>
            </div>
            <PartnerMarquee logos={TATA_PARTNERS} />
          </section>

          {/* The page's close: the owner's workshop artwork, edge to edge, just
              above the footer (2026-10-03) — the bookend to band 01's. A
              cut-out, so its spray simply comes to rest on the footer's rule.
              Decorative. */}
          <div
            aria-hidden
            className="pointer-events-none relative mt-6 w-full lg:mt-10"
            style={{ aspectRatio: `${TATA_CLOSING_ART.w} / ${TATA_CLOSING_ART.h}` }}
          >
            <Image src={TATA_CLOSING_ART.src} alt="" fill sizes="100vw" className="object-cover" />
          </div>

          {/* ⚠ The client's own contact block stays. The comp ends on a thin
              "TATA IIS — PORTFOLIO / SHREY SINGH" strip and drops the
              institute's addresses, phone and CIN; those are real, they were
              asked for, and 05 above already carries the owner's own details. */}
          <div className={SHELL}>
            <TataFooter />
          </div>
        </ExperienceTransition>
      </div>
    </main>
  );
}
