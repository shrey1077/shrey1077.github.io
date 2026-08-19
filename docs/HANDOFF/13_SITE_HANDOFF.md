# 13 — WHOLE-SITE HANDOFF

Written 2026-08-19, superseding 12 (and 09/10/11 before it). **Read this one only.**

---

## 0. Where things are, and how to run them

- **Repo:** `D:\Brain Folio` — Next.js 16, React 19, Tailwind **v4**, framer-motion.
  **NOT** `D:\Assets`, which is the raw client archive and the directory a
  session opens in. Pipelines read from it; loose artwork the owner drops in
  lands there.
- **Branches:** work on `tata-iis-experience`; **`main` is what deploys.**
  Flow: commit on branch → merge to `main` → push → deploy.
- **Live:** https://shrey1077.github.io
  - `main` is at **ddedca5c**, pushed and **verified live** (cache bypassed,
    checking both something the build ADDED and something it REMOVED).
  - `tata-iis-experience` is **4 commits ahead** and **not pushed**:
    a979476f, b53de971, 6b832c92, 62870cb3 — all Tata IIS work.
- **Run:** `npm run dev` → localhost:3000.
- **Verify:** `npx tsc --noEmit` · `npx eslint src` · `npm run build` (**45 routes**).
- `.claude/launch.json` is deliberately uncommitted.

### ⚠ The trap that cost the most time

**A hidden Browser pane silently invalidates verification.** With the pane not
displayed, `document.hidden` is true and the page never composites. That stops
ALL of: requestAnimationFrame, CSS animations (they sit at currentTime 0),
framer springs, IntersectionObserver callbacks, next/image lazy-loading,
screenshots, and matchMedia change events under CDP resizing.

The symptoms look exactly like real bugs — a panel stuck at height 0, a
connector frozen on its first keyframe, tiles that never reveal, `loaded: false`
on images that serve fine over HTTP.

**Check `document.hidden` FIRST** whenever anything animated looks wrong. Six
probes were burned on one reveal before that check was run.

### Other environment facts

| Need | Use | Not |
|---|---|---|
| PDF → image | pypdfium2 via a Python shim | pdf-to-img/pdfjs |
| PPTX → image | PowerPoint COM | LibreOffice/poppler (absent) |
| NEF raw → image | rawpy | sharp/Pillow |
| font → woff2 | fontTools (set `flavor`) | — |
| Python | `C:\Users\tatai\AppData\Local\Python\pythoncore-3.14-64\python.exe` | plain `python` (venv, no pip) |

- ⚠ **Truncated searches lie.** A font scan capped at 15 rows produced a
  confident "you do not have Copperplate or Helvetica" — twice. A full pass over
  all 3045 installed fonts found both. Never cap a search you are about to draw
  a negative conclusion from.
- ⚠ **Unsigned integer underflow in image work.** PIL gives uint8; taking
  `min(axis=2)` before casting leaves it unsigned, so 251 − 253 wraps to 254. A
  background key silently shipped every pixel fully OPAQUE. Cast to int16 first.
- Git object writes intermittently fail with "Permission denied" on Windows.
  Re-running the same `git add` succeeds. Transient, not corruption. Use
  `git -c maintenance.auto=false` to quiet the repack noise.
- ⚠ **Merge in a temporary worktree** if another chat may be live. The temp dir
  is on another filesystem, so pass `-c safe.directory=PATH` per command rather
  than editing global config.
- PowerShell: `$home` is read-only (a silent empty-string bug);
  `Invoke-WebRequest` needs `-UseBasicParsing` non-interactively.
- ⚠ Bash heredocs in this harness break on long markdown. Use the Write tool for
  documents.

---

## 1. The landing page

`src/app/page.tsx` → HeroStage + SectionNav + SectionPanel + SiteFooter, with
RotateGate mounted globally in `layout.tsx`.

| Layer | What |
|---|---|
| CircuitBackdrop | circuit film, 7% |
| black footing | full-width band, bottom 7%, z-0 |
| HeroName | Think (z-30), Imagine (z-20) |
| BrainSequence | brain, scale 0.70875 (phone 1.37025), **x +27, y −34** |
| BrainPins (z-20) | eight sections + connectors |
| furniture (z-10) | CodeStream, ThoughtBox, AboutFacts, HobbiesRotator, Corner3DGrid — lg: only |

- **BRAIN_SHIFT_X = 27** was measured to line the brain's grey/colour division up
  with the portrait orb's seam. The orb has since **moved to the footer**, so
  that reason is gone; kept because it reads fine alone. Safe to revert.
- **BrainPins connectors** — ONE run per pin (the outgoing runs to the footing
  were removed). Both columns drawn: logic from CONNECTOR_X0, creative from a
  base **derived from the measured lead rings** in the artwork, because the four
  illustrations are different widths and right-anchored.
- ⚠ **The reveal is a CLIP, not a dash offset.** stroke-dasharray over a
  pathLength=100 path rendered DASHED: `vector-effect: non-scaling-stroke` dashes
  in a different space from the one pathLength normalises (paths measure
  ~52.6/57.5 units while declaring 100; the viewBox stretches ~14x across, ~9x
  down). An inset clip is two straight edges and cannot distort. Do not go back.
- Pill and stroked circle are **flush** (gap 0, vertically centred).
- The four creative pins are supplied **artwork** (`public/content/pins/`).
  `pillCenterY` differs per image (0.539–0.676), so rows are positioned by the
  **pill's centre**, not the image top.

**SectionNav** — the way in below `lg`, since BrainPins is `hidden lg:block`.
Both navs drive SectionPanel over PIN_OPEN_EVENT and each gates its dispatch on
`useIsCompact()` as a DERIVED value (the repo lints set-state-in-effect as an
error).

**ThoughtBox** — right-brain mirror of CodeStream. Sunset Script, 5 lines, one
line each, top two struck. ⚠ The strike is an outer block + inner INLINE-BLOCK,
so `w-full` measures the words, not the 272px column.

**PortraitOrb** — now in SiteFooter, not the stage. Two pre-composited frames
sharing one canvas; the pointer drives a feathered mask. ⚠ The seam sweeps the
DISC's span, not the frame, and the losing side fades out entirely — each frame
carries artwork beyond the disc that no seam inside it can cover.

**RotateGate** — asks a phone to rotate, then rewrites the viewport meta to
`width=1280` **in landscape only**. ⚠ Detection reads `screen`, never the
viewport, or the override flips its own test.

**HomeMarks** — 10 drawn marks + chess.png. ⚠ Three were redrawn after being
LOOKED at: two read as the same object, one as a bowling ball. Geometry that
measures correctly can still fail to read.

---

## 2. The Tata IIS page

TataExperience → wordmark → description → **campus band** → GuidelineSections →
PartnerMarquee → The Work → credit → TataFooter.

- **No hero film.** VideoHero, TATA_HERO, hero.mp4 (2.9MB), its poster and the
  pipeline step that rebuilt the poster are all deleted. Recover from git.
- **Campus band** — IISA left, IISM right, each mark in one shared 256x80 box.
- **GuidelineSections** — one full-width "Brand Guidelines" section: wordmark,
  copy, colour law, then the slider. ⚠ Copy and slider are ROWS, not columns —
  they shared a grid and the old unbounded plate strip squeezed the text to one
  word per line.
- **GuidelineSlider** — shared by the guidelines AND every Work section.
  Elongated pills on top carrying real logos, a rounded panel in the brand colour
  wrapping stage + tray, 10 thumbs windowed.
  - ⚠ The selected pill is NOT filled with its brand colour — each mark is drawn
    in its own palette and would disappear.
  - ⚠ Pills are elongated because Tata's lockup is 3.97:1 and drew 52x13px inside
    a circle.
  - ⚠ Tray columns are `min(TRAY, n)`, not a hard grid-cols-10.
- **WorkSections** — five headlines, **all collapsed on first load**.
  - Each opens with a theme slider. **Digital is fed from the Mockups folder
    specifically**; others pool their subsections; empty brands are dropped.
  - **Print is four-up** (`xl:` = 1280, not `2xl:`), others three.
    ⚠ `colsFor()` and `gridClass` MUST agree — the opened panel is inserted at
    the START of the opened tile's row using that index.
  - **Grounds zig-zag** from Digital: dark, transparent, dark, … Dark is
    near-black at 93% so the circuit texture still reads, bleeding full width via
    negative margins. Captions invert; **plates stay paper-white**, because much
    of the catalogue is transparent artwork with dark ink.
  - **ScrollRows** pins a section and advances a row per scroll. ⚠ It does NOT
    hijack the wheel (spacer + position: sticky). ⚠ Opening a subsection DROPS
    the pin. ⚠ Reduced motion and fewer than 2 rows skip it.
- Tile rules unchanged from 12: the staged-image matcher must stay **anchored**
  (there are two), a `_meta.json` caption order outranks brand grouping, and do
  NOT make `cover` outrank the staged image.

### ⚠ Privacy — unchanged from 12

ID cards (`ahmedabad-front` / `mumbai-front`, naming "Naveen Kumar") ship by a
deliberate, informed owner decision on 2026-08-08. Everything else stays
excluded: certificates (only 7 unfilled templates of 278 pages naming ~270
trainees), presentations (5 of 28 slides), handbooks unconverted.

---

## 3. Fonts

Self-hosted in `public/fonts/`: digibra, juturu, sunset-script,
copperplate-gothic-bold, helvetica-condensed, helvetica-black-condensed-oblique.

**Tata IIS page only** (`.tata-*`; every caller is under `components/client/tata/`):

| role | face |
|---|---|
| headlines | Copperplate Gothic Bold |
| body headlines | Helvetica Black Condensed Oblique (900 + oblique) |
| body | Helvetica Condensed (400) |

- ⚠ Copperplate's file reports **OS/2 weight 400** despite being the Bold cut.
  The @font-face claims **700** so the request matches exactly and the browser
  does not synthesise a fake bold over an already-bold face.
- ⚠ The subhead must ask for **both 900 and oblique** — the black cut is
  registered only at that pair. Drop either and you get a synthesised slant.
- ⚠ **Licensing:** Helvetica and Copperplate are licensed faces now embedded in a
  public static export. The owner supplied Copperplate deliberately; the
  Helvetica cuts came from their installed library. Confirm a webfont licence
  before this is widely shared.
- The landing keeps Digibra + Juturu and is untouched by this system.

---

## 4. Asset pipelines

All idempotent, reading `D:\Assets\Clients\…`: pdf-to-images.mjs,
prepare-tata-{sections,themes,mockups,raws,iis,experience}.mjs,
make_studio_mockups.py,
prepare-{azoth,uid,newsmobile,freelance,other-clients}-*.mjs,
prepare-{logofolio,career,brain-frames}.mjs, prepare-zabraku-portfolio.mjs.

Captions and caps live in the scripts' METAS, never hand-edited into
`_meta.json` — except deliberately curated folders (ID Cards, Certificates).

---

## 5. Open items

1. **4 unpushed commits** on the branch. The owner merges and pushes on request.
2. **⚠ Unverified, all for the same reason (hidden pane):**
   - ScrollRows **pacing** — `PER_ROW_VH` is the one number to turn. Whether the
     pin reads well or reads stuck has never been seen.
   - The row **reveal** actually holding tiles hidden.
   - RotateGate's **landscape** path — the pane drops touch emulation above
     768px, so a landscape phone cannot be emulated here. Needs a real handset.
   - SectionNav's **breakpoint crossing** with a section open.
3. **Campus colour hexes are no longer surfaced anywhere** — the panels that
   showed them were replaced by the brand switch. Re-add if they matter.
4. **Zabraku's three unresolved questions** (see 12): the held-out contact page
   with a real office address, the deck speaking as the agency rather than the
   owner, and the third-party marks (adidas, Google, Star Wars, Colgate, Tecno).
5. **Dead code:** exactly three modules are unreferenced and every one is
   **parked — do not remove**: IdentityHeader (only importer of ECard),
   SidesShowcase (only importer of SectionBody), SpeechBubbles. ECard and
   SectionBody do NOT appear in an unused-file scan; deleting the parents
   orphans them silently.
6. `scripts/prepare-tata-iis.mjs:354` has a pre-existing eslint parse error,
   outside `eslint src`.
7. Mockups: 14 subsections still have none (docs/TATA_MOCKUP_PLAN.md). 5 ceremony
   backdrops will not rasterise. Still assetless: Media Kit, Cerci, H3LEN,
   Screensaver, Proposed Brand System / Website / Brochure.

---

## 6. Working preferences

- **Verify in the live DOM, not by eye** — but know what the DOM cannot tell you.
  Numbers proved the seam, the fonts and the grids; only LOOKING caught three
  unreadable icons and a strikethrough running past its text.
- **Check `document.hidden` before debugging anything animated.**
- **After changing anything shared, check what you did NOT change.**
- **Bypass cache when verifying a deploy, and check something the build ADDS and
  something it REMOVES.** Checking something already live reports success no
  matter what.
- Commit at checkpoints; the owner says when to push and when to merge.
- **Flag privacy and licensing exposure rather than resolving it quietly.**
- Reference images arrive as chat attachments and land in `D:\Assets` — look
  there, or ask for a path.
- ⚠ **Context burn is a live concern.** Prefer one session per feature; measure
  instead of screenshotting where numbers suffice; do not re-run `npm run build`
  on every intermediate step.
