# 12 — WHOLE-SITE HANDOFF

Written 2026-08-16.

> ⚠ **11 and 12 were written in parallel by two different sessions and BOTH
> describe the current state.** 11 was revised the same night and carries the
> Tata mockup/photography work in depth; 12 carries the homepage connectors,
> the hero words, and the Zabraku portfolio in depth. Neither supersedes the
> other yet. **Read 11 first for Tata, 12 first for the homepage and Zabraku** —
> and fold them into one before the next cycle, because two "current" handoffs
> is exactly the confusion these documents exist to prevent.

---

## 0. Where things are, and how to run them

- **Repo:** `D:\Brain Folio` — Next.js 16, React 19, Tailwind **v4**, framer-motion.
  **NOT** `D:\Assets`, which is the raw client archive and the directory a
  session opens in. You DO have access to `D:\Assets` — the pipelines read from
  it, and loose artwork the owner drops in (`D:\Assets\3x\`) lives there.
- **Branches:** work on `tata-iis-experience`; **`main` is what deploys.**
  Flow: commit on the branch → merge to `main` → push → deploy.
- **Live:** https://shrey1077.github.io. **`main` is still at `910b894`** —
  everything below this line is pushed to the BRANCH and has never deployed.
- **Run:** `npm run dev` → localhost:3000.
- **Verify:** `npx tsc --noEmit` · `npx eslint src` · `npm run build`
  (**45 static routes** as of this handoff).

### Environment facts that cost time to rediscover

| Need | Use | Not |
|---|---|---|
| PDF → image | **pypdfium2** via a Python shim | pdf-to-img/pdfjs — fails on large-format art |
| PPTX → image | **PowerPoint COM** (`$pres.SaveAs($dir, 18)`) | LibreOffice/poppler — not installed |
| NEF raw → image | **rawpy** | sharp and Pillow can't read NEF |
| AVIF → PNG | **sharp** (`heif` input is available) | — |
| Python | `C:\Users\tatai\AppData\Local\Python\pythoncore-3.14-64\python.exe` | plain `python` — a venv with **no pip** |

Traps, in the order they will bite:

- ⚠ **Turbopack serves half-updated chunks.** Twice this session the DOM showed
  old code while the file on disk was correct — once a stale class, once a NEW
  child component wired to its OLD parent, which threw
  `Cannot convert undefined or null to object`. **If the DOM disagrees with the
  source, restart the dev server before debugging anything.**
- ⚠ **Do NOT `rm -rf .next/dev` to fix that.** It deletes Next's cached Google
  font, `fonts.gstatic.com` 404s from this machine, and the dev server will not
  boot at all until a full `npm run build` repopulates the cache. A plain
  server restart is the fix; the cache wipe is what breaks it.
- `next build` takes a lock. If a build is interrupted, the process keeps
  running and the next one fails with "Another next build process is already
  running" — wait for the PID, don't delete `.next`.
- Tailwind v4 `@theme inline` **bakes font values into utilities**, so a CSS-var
  override can't reach them. Tata's `.tata-scope` uses two-class selectors.
- The repo lints `react-hooks/set-state-in-effect` as an **error**, and
  `react-hooks/refs` forbids mutating a ref during render. Use ResizeObserver /
  IntersectionObserver callbacks, or write refs inside an effect.
- Git object writes intermittently fail with "Permission denied" on Windows.
  Re-running the same `git add` succeeds. It is transient, not corruption.
- PowerShell reports git's stderr progress as `NativeCommandError`. **A push
  that prints `a1b2c3..d4e5f6` succeeded** regardless of the red text.

### ⚠ Another session is working in this repo

At the time of writing, a second chat is editing the Tata mockup pipeline. Its
commit `831a19c` ("Lead Mockups with the two signage shots, and anchor the
staged matcher") rode along with the last push. It currently has **staged and
unstaged work in progress**: `docs/HANDOFF/11_SITE_HANDOFF.md` (staged),
`scripts/make_studio_mockups.py`, `Photography/_meta.json`, and a deleted
`Photography/mockup-studio.webp`. **Leave all of that alone.** `.claude/launch.json`
is separately modified and deliberately uncommitted.

---

## 1. The homepage

`src/app/page.tsx` → `HeroStage` + `SectionPanel` + `SiteFooter`.

### The stage (`HeroStage.tsx`)

| Layer | What |
|---|---|
| `CircuitBackdrop` | circuit film, 7% |
| black footing | full-width band, bottom 7%, `z-0` — closes the stage |
| `HeroName` | **Think** (z-30) and **Imagine** (z-20) |
| `BrainSequence` | the brain, scale **0.70875** (phone 1.37025) |
| `BrainPins` (z-20) | the eight sections + the connector lines |
| furniture (z-10) | CodeStream, AboutFacts (both at `left-[8vw]`), HobbiesRotator, Corner3DGrid — `lg:` only |

**PaintBurst is no longer on the landing.** It is the Art section's ground now.

**Type.** `--font-digibra` (logic) and `--font-graff` (creative). ⚠ `--font-graff`
points at **Juturu**, a variable 100–900; the token kept the old name.

**`HeroName`** — the two words are the fiddliest thing on the site. Read the
component header before touching it. In short:
- Size and placement come from a mockup the owner overlaid; `BASE_SIZE` is
  5.2vw, Think's right edge lands at 43% and Imagine's left at 62%.
- Placement is **fixed viewport fractions**, no longer derived from the brain's
  alpha. `measureBrainV` was deleted — recover from git if wanted.
- `IMAGINE_RATIO` (149/140) matches the two words' **ascents**. Re-measure only
  if a face changes.
- ⚠ **CSS centres a face's DECLARED box, not its ink.** Juturu declares a 1.17em
  ascent, so below 1.38 leading the `g` falls outside the box — and with
  `bg-clip-text` that overflow is painted with nothing. Leading is 1.45. Three
  separate "make the box taller" fixes failed before this was understood.
- Think is opaque `#c7c7c7` (its old 20%-black composited over `#f9f9f9`)
  because it now sits ON TOP of everything.
- ZOOM is 0.15 (±15%).

**`BrainPins`** — the left column is the elaborate half:
- Four hairlines drop from the top-left corner, turn right into each icon,
  continue out of the stroked circle, right, then down to the footing.
- Drawn as ONE svg, `viewBox="0 0 100 100"`, `preserveAspectRatio="none"`, every
  path `vector-effect="non-scaling-stroke"` and `pathLength="100"`.
- ⚠ Verticals run **outside-in** (furthest-down line sits furthest left) and the
  outgoing turns mirror it. Reverse either and the brackets become a grid.
- The line ENDS are **measured** (ResizeObserver) — icon centre in, circle
  centre out — because rows are as wide as their labels.
- Reveal clock: each line draws 0.75s back-to-back; a pin lands as its line
  arrives; the fourth at exactly **3s**.
- ⚠ The draw keyframe clears `stroke-dasharray` on its last frame. Leave a dash
  array on a resting line and it reads as **dotted**, because the viewBox
  stretches the two runs at different rates.
- Open: strokes go 1px → 2px on that pin's two runs. **No parallel line —
  the owner rejected that explicitly.** The circle keeps its ring and drops a
  flat black disc inside.
- Icons live in `public/content/icons/` (handshake/briefcase/book/summit).
- The logic column sits at `left-[6vw]`; `CONNECTOR_END` must track it.

**`SectionPanel`** — what a pin opens. 3-col board of rounded squares, capped at
9. **Career Path and Art are no longer orphaned**: the panel hands those two to
`CareerTimeline` / `ArtCollections` inside a fixed-height box (both size to
their parent; the panel animates to `height:auto`, so without that they collapse).
Client marks come from `cardLogo` — NOT `logoSrc`, which is set on nobody — with
per-client `logoScale` and `logoTone`.

**`CareerTimeline`** — a rail that wraps: 5 columns → 3 → 2, each stop a pin on
the line with the employer's disc below it. ⚠ The rail is drawn per-CELL, not
per-row, so the grid can carry **no column gap** — a gap is a break in the line.

⚠ `BrainPins` is `hidden lg:block`, so **below 1024px no section panel can be
opened at all.** The responsive work inside those panels is insurance.

---

## 2. The client pages

`/clients/[slug]` branches by slug: `tata-iis` → `TataExperience`,
`azoth-biotech` → `AzothExperience`, `uid` → `UidExperience`,
`freelance`/`newsmobile` → `CaseStudyExperience`, others → `ClientExperience`
(config) or `ClientWip`.

New config knobs on `ClientExperienceConfig`:
- `catalogueLabel` — renames the "Catalogue" section per client (Zabraku uses
  "Company Portfolio"), used by both the client page rail and the room breadcrumb.
- `relatedLinks` — circular marks closing the page AND every room.

New `_meta.json` knobs, read by `readCatalogueCategory`:
- `maxVisible` — raises the seven-artifact ceiling. Set only for a body of work
  that is a **document**.
- `revealStep` — lifts the ceiling AND paginates on scroll.
- `showCaptions: false` — plain plates, no caption line.

`CatalogueGallery` is 3 columns and its `MediaViewer` is now a **slider**:
arrows, arrow keys, a counter, wrap-around. It walks the WHOLE collection, not
the revealed window. ⚠ The viewer's open/close effect is keyed on
**open/closed**, not on which asset — keying it on the asset tore it down every
step and stole focus between pictures.

`ExperienceFooter` runs **dark** against the body's gallery white. Every colour
in it is inverted; anything added must follow or it vanishes.

### Zabraku (`zabraku-media`)

35 of the 39 pages of the 2021 company portfolio, in ONE room, 3 across, nine
revealed at a time. `scripts/prepare-zabraku-portfolio.mjs` (idempotent).

⚠ **Four pages never ship, and the reasons are not visible from the output:**
- **p35 "Contact Us"** — street address, phone numbers, email for a real office.
  Held out pending the owner's decision. Verified absent from the rendered room.
- **p38** — blank (mean luma 253, stdev 20.6).
- **p37 / p39** — "Fin" and back-cover filler.

⚠ The deck is **the agency's own company profile**, not solely the owner's work:
it speaks as "we", lists Zabraku's roster, and shows third-party marks (adidas,
Google, Star Wars, Colgate, Apollo Tyres, Tecno). p30 is a nicotine product page
with a statutory health warning; p26/p32 are CBD work. **The owner has not yet
given a conscious yes to any of that going public.**

---

## 3. The Tata IIS page

`TataExperience`: hero film → description → `GuidelineSections` →
`PartnerMarquee` → The Work → credit → `TataFooter`. Theme lives in the
filename (`brandOf()`); a tile rests on a mockup and shows flat artwork on
hover; max 7 artworks anywhere.

Three rules about what a tile shows, all easy to break again:

- ⚠ **The staged-image matcher must stay anchored**:
  `/^(?:(?:tata|iisa|iism)-)?(?:mockup|installed)-/`. Unanchored it also matched
  real artwork whose own filename contains the word — e.g.
  `iisa-billboards-and-signages-iisa-exterior-mockup-2` — which pulled a dozen
  genuine pieces out of the fly-throughs and made one of them a resting image.
  There are TWO matchers (`STAGED` and the one inside `stagedInLane`); anchor
  both or the bug half-returns.
- **A `_meta.json` caption order outranks the brand grouping** — on the tile's
  fly-through as well as in the open panel, so a hand-picked lead frame can't be
  filtered back out by its lane. Caption keys must be real filenames; a typo is
  silent.
- ⚠ **Do NOT make the meta's `cover` field outrank the staged image.** It looks
  like the natural way to set a tile's default face, and it is wrong: ten
  folders already name a `cover` for the catalogue card, so the change quietly
  undoes "tiles rest on a mockup" on nine tiles. To change one section's default,
  remove that folder's staged image instead — which is how **Photography** now
  leads on `campus-frame-iv` (the bus run-in) rather than a studio composite of
  a photograph. `make_studio_mockups.py` no longer stages Photography.

### ⚠ Privacy — read before touching Tata content

The original build excluded anything naming or picturing an identifiable
trainee. **The owner reversed that for ID cards on 2026-08-08**, having been
shown the site is public: `ahmedabad-front` / `mumbai-front` name and picture
"Naveen Kumar". Deliberate and informed — leave it.

Everything else stays excluded:
- **Certificates**: converting them produced **278 pages naming ~270 trainees**
  with registration numbers. Only **7 ship**, every one an unfilled template.
- **Presentations**: 5 of 28 slides ship; the rest name individual trainees,
  several with family income and background.
- Handbooks are deliberately not converted (800 of 1342 PDF pages).

---

## 4. Asset pipelines

All idempotent, all reading from `D:\Assets\Clients\…`. `pdf-to-images.mjs`,
`prepare-tata-{sections,themes,mockups,raws,iis}.mjs`,
`make_studio_mockups.py`, `prepare-{azoth,uid,newsmobile,freelance,other-clients}-*.mjs`,
`prepare-{logofolio,career,brain-frames}.mjs`, and now
`prepare-zabraku-portfolio.mjs`.

**Captions and caps live in the scripts' METAS, never hand-edited into
`_meta.json`** — except deliberately curated folders (ID Cards, Certificates).

---

## 5. Open items

1. **Nothing has deployed.** `main` is at `910b894`; the branch is 16 commits
   ahead at `831a19c`. The owner merges and pushes on request.
2. **Zabraku's three unresolved questions** (§2): the contact page, the
   company-profile framing, the third-party marks.
3. **Below `lg` the section panels are unreachable** — the pins are hidden.
4. `scripts/prepare-tata-iis.mjs:354` has a pre-existing **eslint parse error**.
   It is outside `eslint src`, so it has been sitting there unnoticed.
5. **Mockups**: 14 subsections still have none — `docs/TATA_MOCKUP_PLAN.md`.
6. **5 ceremony backdrops** won't rasterise (`Create skia surface failed`).
7. **Still assetless**: Media Kit, Cerci, H3LEN, Screensaver, Proposed Brand
   System / Website / Brochure.
8. **Fonts**: Tata's Copperplate Gothic / Helvetica are licensed and not on the
   drives — `.tata-heading` falls back to Cinzel.
9. **Accessibility**: `layout.tsx` sets `maximumScale: 1`, blocking pinch-zoom.
10. `ECard`/`IdentityHeader`, `SidesShowcase`→`SectionBody`, `SpeechBubbles` are
    **parked, not dead** — do not remove in a dead-code sweep. `ThoughtBox` and
    `CornerText` are genuinely unreferenced.

---

## 6. Working preferences

- **Pause and confirm when the session switches to paid-overage credits.**
- **Verify in the live DOM, not by eye.** Nearly every bug this cycle looked
  fine in a screenshot and only showed up in measurements — a 38px overlap, an
  8px ink overflow, a sub-pixel turn, a line that was 18 tiles instead of 9.
- **Bypass the browser cache when checking a deploy.**
- Commit at checkpoints; the owner says when to push and when to merge. "Push"
  means the branch — it does NOT mean merge to `main`.
- **Flag privacy exposure rather than resolving it quietly.**
- The owner sends reference images as chat attachments, which cannot be written
  to disk. Ask for a path, or look in `D:\Assets` — that is where they land.
