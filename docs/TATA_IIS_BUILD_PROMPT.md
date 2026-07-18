# TATA IIS EXPERIENCE — BUILD PROMPT

Self-directed brief for building the full Tata IIS client experience. Written
2026-07-17 after analyzing the curated archive at `D:\Assets\Clients\Tata IIS\`
(user-curated, 6 top-level folders). This document is the single source of
truth for the build — any session/model resuming at a checkpoint reads this
plus `09_TATA_IIS_EXPERIENCE_HANDOFF.md` and continues.

**User's instructions (verbatim intent):** use the archive's folder names as
the page sections; curate only the best work; a 7-second Legacy intro
(Jamsetji → JRD → Ratan → Tata IIS logo mask); Logos & Guidelines presented
next "in amazing fashion"; then works across platforms; short crisp
descriptions with challenges/problems solved; top-notch typography and
composition; a footer with company info; compositional liberty granted.

## Checkpoint protocol (model-switching support)

Work is committed on branch `tata-iis-experience` at these checkpoints. Each
commit message starts with the checkpoint tag so any model can locate state:

| CP | Content | Safe to hand off to |
|---|---|---|
| CP1 | Curation manifest + this prompt committed | anything (next phase is mechanical) |
| CP2 | Web derivatives produced into `public/content/clients/tata-iis/` | a capable frontend model (creative build next) |
| CP3 | Page built: intro, all sections, footer | any model (verification next) |
| CP4 | Verified (tsc · eslint · build · browser walkthrough) | done |

## Composition (the section plan)

> **REWORK — CP5 (2026-07-18), supersedes the folder-sections plan below.**
> The user reviewed CP3 and asked for **all works in catalogue format**. The
> works now live as **13 catalogue categories** (hub-and-spoke: covered cards
> under `03 Catalogue` → gallery-grade category routes with lightbox, video
> wall, captions, prev/next). The page composition is now:
> LegacyIntro → Hero → 01 Logos & Guidelines → 02 Structure → 03 Catalogue →
> Footer. Content moved from `sections/` to `catalogue/<Category>/` (13
> folders, ~180 assets, `_meta.json` adds `cover`). The `sections/` reader +
> CollectionsSection remain in the framework for future clients but are no
> longer used by Tata IIS. One new exclusion found during the expansion:
> `Trainee Spotlight` (real student's name + photo).

Original (CP3) plan, kept for history:

```
LegacyIntro (7s overlay, plays once)          ← Intro/
ExperienceHero (existing)
01  Logos & Guidelines    anchor: logos       ← Logos and Guidelines/
02  Structure             anchor: structure   (existing InstituteStructure + real campus logos)
03  Print                 anchor: print       ← Print/
04  Digital               anchor: digital     ← Digital/
05  Socials               anchor: socials     ← Socials/
06  Photography           anchor: photography ← Photography/
ExperienceFooter (new — company info)
```

## The Legacy intro — 7.0s timeline

Client component `LegacyIntro.tsx` (components/client/), fixed overlay
(`Z_INDEX.viewer` tier), pure white ground. Framer Motion sequence:

```
0.00–0.30  white hold (breath)
0.30–2.30  Jamsetji Tata — fade in + settle (scale 1.03→1), hold, fade out
           meta line: JAMSETJI TATA · 1839–1904
2.30–4.30  J. R. D. Tata — same gesture · JRD TATA · 1904–1993
4.30–6.00  Ratan Tata — same gesture · RATAN TATA · 1937–2024
5.80–7.00  the TATA IIS wordmark as a MASK: starts huge (scale ~7, i.e.
           "zoomed out" so letters crop the viewport), zooms INTO place
           (scale→1, EASE_OUT) while resolving to solid black (#000, the
           digital guideline value) on the white ground
7.00       overlay fades (DURATION.medium); page beneath is already rendered
```

Rules: portraits monochrome (they already are), object-fit contain on white —
museum plates, not full-bleed. `Skip` bottom-right (logic meta voice).
`localStorage["tata-iis-legacy-played"]` gates replay; `?intro=1` forces it
(dev/testing). `prefers-reduced-motion`: render final wordmark frame for 1s,
then release. No sound. Mask technique: CSS `mask-image` with
`intro/wordmark-mask.png` (black-glyph PNG) over a black fill layer.

## Section 01 — Logos & Guidelines ("amazing fashion")

Sub-movements, in order:

1. **The wordmark stage** — `wordmark-black.png` large on white inside the
   construction-frame hairlines (BrandOpening's frame language, now with the
   real mark). Beneath, the colour tokens as a quiet mono row:
   `#262222 print · #000000 digital · #FFFFFF reverse`.
2. **The construction plates** — the 12 guideline pages (cover + 2–12) as a
   numbered monograph: horizontal plate strip, click → MediaViewer. Captions
   from the plates themselves (kerning per Tata Trusts; the 8x grid; the
   subtitle that stops "TATA IIS" reading as "TIIS").
3. **Two campus dialects** — IISA (navy/orange dot-tree) and IISM
   (teal/violet planes) side by side, each on a whisper of its own texture
   (`texture-iisa/iism.webp` at low opacity). One line each.
4. **The partner wall** — curated partner logos, small, even, grayscale-at-
   rest → color on hover. The brands this identity must stand beside.

## Sections 03–05 — the works (folder-driven collections)

Generic data engine: `readSections(slug)` scans
`public/content/clients/<slug>/sections/<Section>/<Collection>/`. Each
collection's `_meta.json`: `{ order, description, presentation, captions? }`
where `presentation ∈ strip | grid | publication | showcase | pairs | video-wall | row`
and `captions` maps filename → one-line caption. New framework component
`CollectionsSection` renders a section's collections by presentation style.
Falls back gracefully; other clients unaffected (they keep catalogue/WIP).

### 03 Print — collections & copy (short, crisp; challenge → solution)

| # | Collection | Presentation | Description (draft) |
|---|---|---|---|
| 1 | The Brand at Scale | strip (wide, one per beat) | Hoardings, monoliths and site wraps for two campuses. The brief's real challenge: five mandated co-brands, two languages, one hierarchy that reads at 60 km/h. |
| 2 | Publications | grid 2-col | Funding and admissions brochures — impact numbers, recruiter walls, contribution paths held together by the circuit-grid motif. |
| 3 | Campus Voice | grid 3-col | Safety and POSH Act series for workshop walls. Compliance given the same care as campaigns. |
| 4 | The Lab System | grid 3-col | One standee per lab — Robotics, Welding, EV, CNC — each naming its equipment partners. A template the campus team extends without a designer. |
| 5 | The Credential | showcase (single, large) | What a student leaves holding. One certificate architecture; variants per campus, course and hiring partner. |
| 6 | Events | grid 3-col | Amtech, Skills Conclave, Skill Connect — every event ships as a kit: banners, walls, standees, polos. |

### 04 Digital

| 1 | Films | video-wall | One-of-One, the MSDE campus film; a 20-second spot that ran on JioHotstar; lab time-lapses; the logo in motion. Poster-first, one player at a time. |
| 2 | Screen Presence | row (small) | Teams backdrops — the brand showing up to meetings. |

### 05 Socials

| 1 | Brand Literacy | pairs (Q above A, phone-frame aspect) | "Guess the logo" — design history taught through brands students already love. Question by day, answer by night. |
| 2 | The Social System | grid 3-col portrait | Story and post templates the comms team fills without breaking the grid. |

### 06 Photography

Existing `PhotographySection` — collection `Campus & Labs` (~10 curated
frames). Description: real campus, real labs — no stock, ever.

## Asset manifest (source → derivative)

Root `A = D:\Assets\Clients\Tata IIS`. Dest
`P = public/content/clients/tata-iis`. Images → WebP (quality ~82), max edge
2560 (strip/showcase) or 1280 (grid); logos stay PNG (transparency); videos →
H.264 (already; re-encode only oversized ones) + JPG poster frame.

```
P/intro/01-jamsetji.webp       ← A/Intro/Jamsetji-Nusserwanji-Tata.webp   (1600)
P/intro/02-jrd.webp            ← A/Intro/JRD Tata.jpg                     (1600)
P/intro/03-ratan.webp          ← A/Intro/Ratan Tata.png                   (1600)
P/intro/wordmark-mask.png      ← A/Logos…/Tata Logos (2)/TATA IIS corrrcetd BLK@3x.png (2000w PNG)

P/brand/wordmark-black.png     ← same source                              (2000w)
P/brand/wordmark-white.png     ← …/TATA IIS Corrected White@3x.png        (2000w)
P/brand/guidelines/plate-01…12.webp ← A/Logos…/Tata IIS/…_cover,_2…_12.jpg (1600)
P/brand/iisa.png               ← …/IISA COLOR@3x.png                      (800)
P/brand/iism.png               ← …/IISM COLOR.png                         (800)
P/brand/texture-iisa.webp      ← A/Logos…/Asset 1@3x.png                  (2560)
P/brand/texture-iism.webp      ← A/Logos…/Asset 2@3x.png                  (2560)
P/brand/partners/[12–16].png   ← …/Partner logos/…/PNG/{Siemens,Fanuc,UR,Zeiss,
                                  Mitutoyo,Festo,Makino,Markforged,Formlabs,
                                  TVS,TAta motors,Taj Skyline,Ather,Titan…}@3x (600)

P/sections/Print/01 The Brand at Scale/  ← A/Digital/Mockups/{BOLD AHD 1, City
  Billboard Mockup MUM, Billboard Mockup9, 12x24 Billboard Mockup On Building
  Wall1, Mockup222 MUM, 2 metal amd, Outdoor-City-Banner-Mockup MUM, City
  Light Billboard MockupAMD}.png → webp 2560
P/sections/Print/02 Publications/        ← A/Print/Brochures/First brochures/
  Brcohure v21 AMD-{01,03,05}.png + Funding Brochures/{Artboard 1, Artboard 2,
  FB_2-3}.png → webp 1600
P/sections/Print/03 Campus Voice/        ← A/Print/Campus Posters/{Safety1,
  Safety2,Safety-03}.png + POSH/{POSH ACT -01, POSH ACT -02, POSH ACT NEW-13} → webp 1280
P/sections/Print/04 The Lab System/      ← A/Print/Standee/{Robotics Lab,
  WELDING, ev lab, cnc MACHINING, am LAB, metrology lab}.png → webp 1280
P/sections/Print/05 The Credential/      ← A/Print/Certificates/
  CertificatesParticipation-59.png → webp 1600   (verify no personal names)
P/sections/Print/06 Events/              ← A/Print/Events/Amtech/{Jap AMTECH Big
  Banner v12, Walls Amtech LEFT Case studies-01}.png + Skill connect/{Polo
  Shirt Main File_f, Standees -Mu_SCL v1, Pic_frame_iismSC, T-Shirt Mockup 1}.png → webp 1280–2560

P/sections/Digital/01 Films/   ← A/Digital/Videos/{OneOfOne MSDE→one-of-one-msde
  (720p crf23), jioHS v8→jio-hotstar-spot (1080p crf21), Skills Conclave 2025
  (2)→skills-conclave-2025, Additive Manufacturing_Time Lapse→additive-
  manufacturing-timelapse (720w portrait), - RENDER→tata-iis-logo-render}.mp4
  + poster .jpg per film (ffmpeg frame ~2s)
P/sections/Digital/02 Screen Presence/ ← A/Digital/Teams call BG/{Teams Call BG
  Tata IIS, Video Frame Backdrop v4}.png → webp 1600

P/sections/Socials/01 Brand Literacy/  ← A/Socials/Quiz/{Alfa Romeo→alfa-romeo-
  question, Alfa Romeo soln→alfa-romeo-answer, Citibank→citibank-question,
  Citibank soln→citibank-answer}.png → webp 1080
P/sections/Socials/02 The Social System/ ← A/Socials/{Stories-02,Stories-04,
  Templates Posts-03,Templates Posts-05,Trainee Spotlight story size-02,
  Square Post new,story1,IISA_Portrait_v}.png → webp 1080

P/photography/Campus & Labs/   ← A/Photography/{DSC_8912,DSC_8927,DSC_8952,
  DSC_9276,DSC_9481,DSC_2949,DSC_3466,DSC_5486,4O5A0755,4O5A0817}.jpg → webp 1600
  (visual check in browser at CP3; prune weak frames)

Structure logos: branches gain logoSrc → /content/clients/tata-iis/brand/iisa.png · iism.png
```

**Exclusions (privacy/noise — never ship):** `Digital/New Joinee` (named
individuals), `Digital/Presentations` (business-sensitive), ID-card fronts
(real student photo + name), WhatsApp-named images, `.NEF` raws, working
files. Stock-photo files in Standee (pasta/kitchen UTC names) are texture
sources, not work — excluded.

Pipeline: Node script `scripts/prepare-tata-iis.mjs` using the repo's `sharp`
for images; shell out to `ffmpeg` for video/poster. Idempotent, manifest-driven,
logs each output; safe to re-run.

## Copy voice

Descriptions are `plain` voice, ≤2 sentences, concrete. Where a challenge
existed, name it and the move that solved it (co-branding density, bilingual
hierarchy, two campus identities under one parent, template systems for
non-designers, no-photography gap led with film). No adjectives doing the
work nouns should. Collection titles in logic voice; section intros one line.

## Footer — company info (`ExperienceFooter`, framework)

Rail+body rhythm, top hairline. Left: SITE.name · SITE.role · email link.
Right (meta): "Client — Tata Indian Institute of Skills · An initiative with
MSDE, Govt of India · Campuses: Ahmedabad & Mumbai". Bottom row:
© SITE.inceptionYear–current · "All client work © Tata IIS — shown as
portfolio record." Links: LinkedIn/Behance from SITE.

## Code plan

```
src/components/client/LegacyIntro.tsx        (new, client comp)
src/components/client/LogoSystem.tsx         (new — section 01 body)
src/components/experience/CollectionsSection.tsx (new framework engine)
src/components/experience/VideoWall.tsx      (new, client comp — films)
src/components/experience/ExperienceFooter.tsx (new)
src/content/catalogue.ts                     (+ readSections, extend FolderMeta)
src/components/client/ClientExperience.tsx   (compose new section plan when
                                              sections/ content exists)
src/constants/clientExperiences.ts           (branch logoSrc, hero tagline stays)
src/types/experience.ts                      (+ SectionCollection types)
```

Constraints: no homepage files touched; other clients keep working
(`ClientWip` path untouched); Tailwind classes match design tokens; every
text through voice classes; EASE/DURATION from constants/motion; no bounce.

## Verify (CP4)

`npx tsc --noEmit` · `npx eslint src` · `npm run build` · browser: intro plays
once (7s) then never again, `?intro=1` replays, skip works, all six sections
render with assets, videos play one-at-a-time, footer present, `/clients/azoth-biotech`
still renders WIP page.
