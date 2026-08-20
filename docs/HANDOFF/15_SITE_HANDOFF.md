# 15 — WHOLE-SITE HANDOFF

Written 2026-08-21, superseding 14 (and 09–13 before it). **Read this one only.**

---

## 0. Where things are, and how to run them

- **Repo:** `D:\Brain Folio` — Next.js 16, React 19, Tailwind **v4**, framer-motion.
  **NOT** `D:\Assets`, which is the raw client archive and the directory a
  session opens in.
- **Other source roots** (pipelines read from these; masters live OUTSIDE the repo):
  - `D:\Brain Website portfolio\UID\` — the UID archive, incl.
    `Shortlisted for Claude\` (the owner's curated selection)
  - `D:\Brain Website portfolio\vapes\ABS branding\` — the ABS creative
  - `D:\Brain Website portfolio\_masters\` — **new**: `brain-alpha.webm`, the
    master for the hero brain frames. ⚠ Do not delete; see §6.
- **Branches:** work on `tata-iis-experience`; **`main` is what deploys.**
  Flow: commit on branch → merge to `main` → push → deploy.
- **Live:** https://shrey1077.github.io
  - `main` is at **de82aff2**, pushed and verified live (2026-08-20).
  - `tata-iis-experience` is **13 commits ahead** and **NOT pushed**.
- **Run:** `npm run dev` → localhost:3000.
- **Verify:** `npx tsc --noEmit` · `npx eslint src` · `npm run build`
  (**49 routes**).
- `.claude/launch.json` is deliberately uncommitted; it sets `"autoPort": true`
  so two sessions can run dev servers at once.

### ⚠ The trap that keeps costing time

**A hidden Browser pane silently invalidates verification.** With the pane not
displayed, `document.hidden` is true and the page never composites: no rAF, no
CSS animations, no framer springs, no IntersectionObserver, no next/image
lazy-loading, no screenshots.

It bit **three times** in the last session and every time it produced a
confident wrong number:

- **FPS readings of 1.7, 2 and 2** for effects that actually run at 200+. rAF is
  throttled to ~1fps while hidden. **Sample `document.hidden` inside every
  measurement loop**, not once at the start — the pane flips mid-run.
- **`scroll-behavior: smooth` is on `<html>`**, and smooth scrolling is
  rAF-driven, so `scrollTo()` does nothing while hidden. Use
  `scrollTo({top, behavior: 'instant'})`.
- **A framer height-animated wrapper stays at `height: 0px`**, so an expanded
  section contributes nothing to layout and its rows measure as below the fold.
  Reads exactly like a broken `position: sticky`. Check
  `getAnimations().length` — zero running animations plus an inline
  `height: 0px` is the tell.

### Verifying visually in the pane

- The screenshot surface does **not** match the CSS viewport above ~800px. At
  1024–1280 the page renders into a corner of the frame and is unreadable.
  **Resize to ~760 for a 1:1 capture.** Zooming via
  `document.documentElement.style.zoom` distorts `svh`-clamped panels — not a
  substitute.
- `computer{action:"zoom"}` region cropping is **not supported**; it silently
  returns the full screenshot.
- ⚠ **RotateGate fires at 760×1000** and covers the page. Click **CONTINUE
  ANYWAY** before measuring, or you screenshot the gate.
- ⚠ **SectionPanel switching takes >650ms** (0.5s AnimatePresence exit before
  the new panel enters). A probe that dispatches `brainpin:open` and reads
  220ms later measures the OUTGOING panel — every section reported "Clients"
  that way. Dispatch `null`, wait ~1200ms, dispatch the id, wait ~1100ms.
- ⚠ **React's `onPointerEnter` is delegated via `pointerover`**, which bubbles;
  `pointerenter` does not. Dispatching a synthetic `pointerenter` never reaches
  the handler and makes a working hover look dead.
- ⚠ **WebGL canvases clear their drawing buffer after compositing** unless
  `preserveDrawingBuffer` is set, so `readPixels` outside the draw call returns
  zeros even while the thing renders perfectly. Screenshot instead.

### Other environment facts

| Need | Use | Not |
|---|---|---|
| PDF → image | pypdfium2 via a Python shim | pdf-to-img/pdfjs |
| PPTX → image | PowerPoint COM | LibreOffice/poppler (absent) |
| NEF raw → image | rawpy | sharp/Pillow |
| SVG → PNG | sharp | cairosvg/svglib (absent) |
| font → woff2 | fontTools (set `flavor`) | — |
| video probe/encode | ffmpeg / ffprobe (on PATH) | — |
| Python | `C:\Users\tatai\AppData\Local\Python\pythoncore-3.14-64\python.exe` | plain `python` |

- ⚠ Set `PYTHONIOENCODING=utf-8` before any Python that prints PDF text; the
  default cp1252 console raises `UnicodeEncodeError` on smart quotes.
- ⚠ **Truncated searches lie.** A font scan capped at 15 rows produced a
  confident "you do not have Copperplate or Helvetica" — twice.
- ⚠ **`grep -F` treats `\[` literally.** A poll for `min-h-\[46svh\]` with `-F`
  could never match and reported a successful deploy as never arriving.
- ⚠ Git object writes intermittently fail with "Permission denied" on Windows.
  Re-run. Use `git -c maintenance.auto=false` to quiet the repack noise.
- ⚠ **Merge in a temporary worktree** if another chat may be live. Pass
  `-c safe.directory=PATH` per command rather than editing global config.
- ⚠ Bash heredocs break on long markdown. Use the Write tool for documents.
- ⚠ Escaped `\n` inside a Python heredoc that writes JS can arrive as a real
  newline and break the JS string. Check the file after generating code.

---

## 1. The landing page

`src/app/page.tsx` → HeroStage + SectionNav + SectionPanel + SiteFooter, with
RotateGate mounted globally in `layout.tsx`.

**The pointer** is a black-stroked ring with a flat rainbow disc, 24px across
(`public/cursors/pointer.png` + `@2x`, from `scripts/make-pointer-cursor.mjs`).
- ⚠ The black ring is load-bearing: the hero is `#f9f9f9` and the section panels
  are near-black, so a bare rainbow disc dissolves into the paint film.
- ⚠ Hotspot is the **centre** (16 16) — a ring reads as a reticle.
- ⚠ `button:not(:disabled)` needs its own `cursor: pointer` rule. The UA sheet
  sets `cursor: default` on `<button>`, which beats the inherited ring, so
  without it every button sprouts an OS arrow.

**Think** is a WebGL mesh the pointer drags through (`ThinkMesh`), in Digibra at
`THINK_GREY` (#c7c7c7 — 20% black composited over #f9f9f9; re-derive if
`bg-gallery` changes). Colour split is deliberately OFF.

**Imagine** is liquid particles (`ImagineParticles`) over the painted gradient
word. ⚠ The word is **no longer hidden** under the liquid — it used to drop to
`opacity-0` and was legible only when particles happened to cover its strokes.
Hover radius is **30** (was 90).

⚠ Both effects read font, colour and box from their real span via
`getComputedStyle` + **`offsetWidth/Height`, never `getBoundingClientRect`** —
the words sit in spring-scaled `motion.div`s, and a client rect bakes the
transform into the texture size. Both wait on `document.fonts.load`; drawing
early bakes the fallback sans in permanently.

⚠ **ThoughtBox was removed 2026-08-21.** The file is kept, unreferenced.
BrainPins still carries the offset added to clear it (`COL.creative.top`,
0.22 → 0.30) — that space is now free.

Everything else from handoff 14 §1 holds: BRAIN_SHIFT_X = 27 is safe to revert,
one connector run per pin, **the reveal is a CLIP not a dash offset**,
PortraitOrb lives in the footer, HomeMarks had three icons redrawn after being
*looked at*.

**SectionPanel** hands four sections to their own renderers — `career-path`,
`art`, `publications`, `logofolio` — and draws the rest as a 4-up board
(`BOARD_CAP` 12).

⚠ **Creative sections are grounded in `paint-burst.mp4` at FULL strength**, no
scrim. Legibility comes from `FILM_PLATE` / `FILM_PLATE_TIGHT` behind each block
of text. Anything added to a creative room needs its own plate.
⚠ Those alphas are **measured**: the brightest 1% of the footage sits at
relative luminance 0.553, where a 0.60 plate gives white-at-75% text only
3.13:1 — a WCAG AA failure that looked fine in a screenshot. 0.78 clears it.

---

## 2. Board marks — trimmed and size-matched

`scripts/prepare_logo_marks.py` → `public/content/marks/` + `_marks.json`,
looked up **by original url** so `clients.ts` and the logofolio manifest keep
pointing at the files they always did.

⚠ Two things break mark sizing, and they must be fixed in this order:
1. **Padding.** Most logofolio files are 16:9 canvases with a small mark adrift;
   some measure 97% empty. `object-contain` fits the emptiness, so no scale can
   rescue them — elf-bar reached 38% of Azoth even at a full-plate box. Trim
   first.
2. **Then** solve per-mark for equal **FOOTPRINT** (not ink). Both were built
   and compared; the owner chose footprint. Matching ink makes a dense roundel
   read as the runt beside an airy wordmark.

⚠ Azoth is pinned: its scale derives from its CURRENT ink so it renders
identically, and that footprint is the target for everything else.
⚠ Zabraku reaches only 85% — a 7.84:1 wordmark is width-bound at the box
ceiling. It is pinned at the smallest scale reaching that ceiling.
⚠ Hand `logoScale` values were removed from `clients.ts` rather than left
contradicting what renders.

**Logo plates are pure white.** `tone: "light"` still buys a dark plate and is
now a SAFETY: exactly one mark needs it, `mycoveda-symbol`, measured at 100%
white ink. Zabraku's white characters were recoloured to #262626
(`scripts/recolor_zabraku_mark.py`) — by **saturation**, not by matching
#FFFFFF, because every glyph edge is anti-aliased through dozens of greys and a
colour match leaves a halo.

**Logofolio** is `LogofolioWall`, an interactive grid — 17 marks, filtered AND
ordered by `AUTHORED_MARKS` (`src/constants/logofolio.ts`) so only the owner's
own marks show.
- ⚠ Three are there by inference and flagged: `iis-ahmedabad`, `iis-mumbai`,
  `mycoveda-symbol` — variants of brands the owner named.
- ⚠ Five named brands have **no mark on disk**: Kartpipe, Himax Distro,
  Farmstacks, Maler Oswald (ABS is pulled in from `/content/career/abs.png`).
  They are already named in the list, so dropping a file in makes them appear.
- ⚠ It is a NEW file, not a rewrite of `LogofolioGrid`, which is still imported
  by `SectionBody` ← `SidesShowcase` — the parked chain (§9).
- ⚠ Its `fitWeight` is aspect-aware and the box declares `aspect-ratio`
  explicitly. `√(long/short)` is the answer for a SQUARE box and was measured
  wrong here (62% spread); the cell's `p-3` padding made its content box 1.416,
  not 4:3, which split footprints into two families 13% apart. Final: 0.1%.

---

## 3. Client rooms

| slug | shape |
|---|---|
| `tata-iis` | bespoke `TataExperience` |
| `azoth-biotech` | bespoke `AzothExperience` |
| `uid` | bespoke `UidExperience` |
| `abs` | `CaseStudyExperience` — **new**, §4 |
| `newsmobile` | `CaseStudyExperience` |
| `zabraku-media` | `ClientExperience` config |
| `chess` | **not a route** — see below |

⚠ `Client.href` sends a card outside the app router. `generateStaticParams`
reads `routedClients()`, which skips those, so no empty page is generated. Only
the chess site uses it, at **`/chess/index.html`** — GitHub Pages resolves a
directory to its index but `next dev` does NOT, so `/chess/` 404s locally.

⚠ **Removed from CLIENTS 2026-08-20**: `mycoveda`, `early-works` (dropped from
Projects), and `freelance` — whose eight brands were promoted to Projects as
individual entries (§5). `FREELANCE_EXPERIENCE` survives as their copy and
`public/content/clients/freelance/work/` still holds their plates: the slug
names a **content folder**, not a client. Do not tidy it away.

### Tata IIS

Unchanged. Everything in handoff 14 §2 holds. ⚠ **ScrollRows still has a dead
tail** — the last row finishes at `start + span*0.6`, so 16–24% of the pin holds
the section motionless. `PER_ROW_VH` shortens the tail proportionally but never
removes it. Still never watched in motion.

### UID

Five projects: branding (15 plates), packaging (7), nirvaan, posters, trip.
⚠ Puran Studios is a **sustainability film studio**, not a recording studio —
leaf with a film-strip midrib; its own greens are #00945E / #225D38 / #443635.
⚠ Packaging shows zine pages 13–16 per the owner's note in the folder, and
links to the whole zine in Publications. "The Books" moved to Publications.

---

## 4. ABS Wholesale — organised by brand

`ABS_EXPERIENCE` + `scripts/prepare-abs-experience.mjs`. 54 plates, 12
categories, ordered: house identity, then the three brands built for them
(Luzid, Kartpipe, Himax Distro), then carried brands, then Misc.

⚠ The source is a **flat folder of 56 files named after Instagram captions**, so
every brand was recovered from the caption AND checked against the artwork.
Four assignments a filename scan gets wrong:
- "CLASSIC MEETS MODERN…" names no brand; it is a Kartpipe.
- Kartpipe pieces carry **Luzid's logo** (Kartpipe ships under Luzid), so
  `kartpipe` must match BEFORE `luzid` — that order is load-bearing.
- `CxvwN9MPOSD.jpg` / `CxvwQrQPhJZ.jpg` are CDN hashes — Diamond Shruumz.
- Orion Bar and Tyson both run under Himax's identity; Tyson gets its own
  category, the Orion Bar pieces stay with Himax.

⚠ **Misc is enforced, not merely followed.** Nine brands have exactly one
artwork. The pipeline **exits non-zero** if a named category drops below two.

⚠ Dropped from the 56: one byte-identical duplicate (caught by hash — the names
differ) and `luzid-white-logo-300x121.webp`, 100% near-white ink against
CaseGallery's `bg-white` plate.

**Luzid uses `presentation: "coverflow"`** (`CoverflowGallery`), opt-in per
category. ⚠ `object-contain`, not `cover`: its plates run 1080×1080, 1349×1687
and one 1500×622 banner. ⚠ Its controls sit OUTSIDE the `preserve-3d` stack —
inside, they are painted by depth and vanish behind the cards.

---

## 5. Projects, Publications, Art

**Projects** — UID, chess, and the eight independent commissions
(`PROJECT_STUDIES`, sourced from `FREELANCE_EXPERIENCE`). The eight do not
navigate: they open `ProjectPreview`, rendered as `<button>` because a link that
opens a dialog lies to anyone middle-clicking.

⚠ `ProjectPreview`'s two columns are **floats, not grid tracks** — a grid item
cannot wrap around another, and the collage has to fill the channel between them
AND run full width beneath. Its images are `inline-block` for the same reason:
block boxes do not flow around floats. Nothing around the collage may create a
block formatting context (`overflow`, `contain`) or the wrap silently ends.
⚠ `max-w-full` on each plate is load-bearing: Leder's 1500×225 banner computes
to 1093px and pushes a horizontal scrollbar onto the dialog.
⚠ Six of the eight have no mark, so their board cell is fronted by the first
plate of the work — otherwise the name printed twice ("Leder WarrenLeder
Warren").

**Publications** — `src/constants/publications.ts`, route `/publications/[slug]`,
120 rendered pages under `public/content/publications/`. Page counts are read
off the filesystem, never stated in code.

**Art** — 8 collections, 53 pieces. ⚠ `Craft/` was deleted rather than
refreshed: it was the first twelve `Sketches/` files alphabetically, so every
one reappears in the curated collections.
⚠ `Sketches/` is NOT all sketches — the Farm Stacks dielines went to UID
packaging; the Rockwell type specimen stayed in Art under the owner's
folder-level mapping and may belong on the UID page instead.

---

## 6. Weight — measured 2026-08-21

**Export: 431 MB. Homepage first load: ~15 MB.** They are different problems.

| load | |
|---|---|
| brain frames | **12.36 MB** — 48 × 1280×720 RGBA WebP, all fetched |
| circuit-bg.mp4 | 1.80 MB |
| JS + CSS | 0.94 MB |
| fonts | ~0.40 MB |

⚠ **The brain frames are ALREADY WebP.** An earlier claim that they were PNG,
and a matching "convert them" recommendation, were **wrong**. The levers are
resolution, quality and frame count — not format.

| size | |
|---|---|
| `content/clients/tata-iis` | **224 MB** (91 MB of it five films) |
| other client rooms | 62 MB |
| brain frames | 17 MB |
| publications / art | 17 / 15 MB |

Film bitrates: skills-conclave **8.6 Mbps** and jio-hotstar **6.9 Mbps** at
1080p are ~3× web norm; `one-of-one-msde` is 34.6 MB only because it runs 4.5
minutes at an already-lean 1.1 Mbps.

⚠ **`brain-alpha.webm` moved out of `public/` on 2026-08-21** to
`D:\Brain Website portfolio\_masters\`. It was never loaded by the site — its
only consumer is `prepare-brain-frames.mjs`. **Do not delete it**: without it
the hero frames cannot be regenerated, which is exactly what shrinking the
12.4 MB sequence requires.

⚠ **Git LFS is not an option** for the films: GitHub Pages does not resolve LFS
pointers and would serve the pointer text.
⚠ Removing files from the working tree does **not** shrink `.git` (already
~4 GB); only a history rewrite would, which is disruptive with parallel chats.

---

## 7. Privacy and licensing — standing flags

- **Tata ID cards** (`ahmedabad-front` / `mumbai-front`, naming "Naveen Kumar")
  ship by a deliberate, informed owner decision of 2026-08-08.
- **Helvetica and Copperplate** are licensed faces embedded in a public static
  export. Confirm a webfont licence before wide sharing.
- **`/publications/pethapur`** names a living craftsman (Prahalad Bhai Kanulal
  Prajapati, 70) and states his eyesight condition and daily wage. Written as a
  blog entry for publication; shipping. Removable by editing one `body` string.
- The **ethnography** pages name the field visit's host and the module mentor;
  **nirvaan** credits three collaborators.
- **ABS** carries heavy third-party trademarks (Puffco, Stiiizy, Tyson 2.0,
  Prime, Elf Bar, MIT45, Al Fakher…) and **Snoop Dogg's likeness**. Normal for
  distributor creative, but it is third-party IP on a public site.
- **Chess site**: a third-party script from `chessstrategyonline.com` executes
  on the portfolio's origin; two embedded YouTube tutorials are other people's;
  one image looks like unlicensed stock; `contact.html` posts to `action=""` and
  collects a name and email that go nowhere.

---

## 8. Pipelines

Reading `D:\Assets\Clients\…`: pdf-to-images.mjs,
prepare-tata-{sections,themes,mockups,raws,iis,experience}.mjs,
make_studio_mockups.py, prepare-{azoth,uid,newsmobile,freelance,other-clients}-*.mjs,
prepare-{logofolio,career,brain-frames}.mjs, prepare-zabraku-portfolio.mjs.

Reading `D:\Brain Website portfolio\`: prepare-uid-shortlist.mjs,
prepare-abs-experience.mjs, copy-chess-site.mjs, prepare-brain-frames.mjs
(now from `_masters/`).

Repo-local: prepare_logo_marks.py, recolor_zabraku_mark.py,
make-pointer-cursor.mjs, measure_logo_ink.py.

⚠ `prepare-uid-experience.mjs` still owns nirvaan/posters/trip, but its
branding, packaging and documents steps are **superseded** by
`prepare-uid-shortlist.mjs`. Do not re-run it expecting it to win.

---

## 9. Open items

1. **13 unpushed commits.** The owner merges and pushes on request.
2. **Never seen by eye** (pane hidden): the new ring pointer, the space
   ThoughtBox left, the reduced Imagine hover radius, and the three WebGL/canvas
   effects running together on the hero.
3. **The films → Cloudflare R2** — the owner chose this. Needs their account and
   bucket. One code change: a url map in the content reader; `VideoWall` uses
   `video.url` straight from `readCatalogueCategory`.
4. **The brain frames** — 12.4 MB, 79% of the homepage. Not yet touched.
5. **ScrollRows pacing** on the Tata page (§3), still unwatched.
6. **RotateGate's landscape path** needs a real handset; the pane drops touch
   emulation above 768px.
7. **`play.html` does not exist** but all four chess pages link to it, so "Play"
   404s from every page. Missing from both archive copies — an original gap.
8. **Campus colour hexes** are no longer surfaced anywhere on the Tata page.
9. **Zabraku's three unresolved questions** (see 12): the held-out contact page,
   the deck's voice, the third-party marks.
10. **Dead code — parked, do not remove**: `IdentityHeader` (only importer of
    `ECard`), `SidesShowcase` (only importer of `SectionBody`, which is the only
    importer of `LogofolioGrid`), `SpeechBubbles`, and now `ThoughtBox`.
    Deleting a parent silently orphans the children.
11. `scripts/prepare-tata-iis.mjs:354` has a pre-existing eslint parse error,
    outside `eslint src`.
12. Mockups: 14 subsections still have none (docs/TATA_MOCKUP_PLAN.md); 5
    ceremony backdrops will not rasterise.

---

## 10. Working preferences

- **Verify in the live DOM, not by eye — but know what the DOM cannot tell you.**
  Numbers proved the route table, the footprints and the panel switching; only
  LOOKING caught a chess mark invisible on its own card, three unreadable icons,
  and a mark plate that was a slab of empty white.
- **Check `document.hidden` before debugging anything animated**, and sample it
  inside measurement loops.
- **After changing anything shared, check what you did NOT change.**
- **Bypass cache when verifying a deploy, and check something the build ADDS and
  something it REMOVES.** Checking something already live reports success either
  way.
- Commit at checkpoints; the owner says when to push and when to merge.
- **Flag privacy and licensing exposure rather than resolving it quietly.**
- Reference images arrive as chat attachments. ⚠ On 2026-08-21 two attached
  mockup sheets could NOT be found on disk — not in `D:\Assets`, Downloads,
  Pictures or any temp cache. If an image matters, ask for a path.
- ⚠ **Context burn is a live concern.** One feature per session; measure instead
  of screenshotting where numbers suffice; do not rebuild on every step.
