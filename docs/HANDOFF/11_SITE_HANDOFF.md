# 11 — WHOLE-SITE HANDOFF

Everything a fresh chat needs. Written 2026-08-10, superseding handoffs 09 and
10 (Tata-only, and now out of date on the homepage entirely).

---

## 0. Where things are, and how to run them

- **Repo:** `D:\Brain Folio` — Next.js 16, React 19, Tailwind **v4**,
  framer-motion. **NOT** `D:\Assets`, which is the raw client archive and the
  directory a session opens in.
- **Branches:** work on `tata-iis-experience`; **`main` is what deploys.**
  The Pages workflow used to trigger on the feature branch, which meant merging
  to main did nothing — fixed 2026-08-09. The flow is now: commit on the
  branch → merge to `main` → push → deploy.
- **Live:** https://shrey1077.github.io (repo `shrey1077/shrey1077.github.io`).
- **Run:** `npm run dev` → localhost:3000.
- **Verify:** `npx tsc --noEmit` · `npx eslint src` · `npm run build`
  (44 static routes).
- `public/` is **316MB**, most of it the five Tata films (~92MB).

### Environment facts that cost time to rediscover

| Need | Use | Not |
|---|---|---|
| PDF → image | **pypdfium2** via `scripts/pdf-to-images.mjs` | pdf-to-img/pdfjs — fails on large-format art at every scale |
| PPTX → image | **PowerPoint COM** (`$pres.SaveAs($dir, 18)`) | LibreOffice/poppler — not installed |
| NEF raw → image | **rawpy** via `scripts/prepare-tata-raws.mjs` | sharp and Pillow can't read NEF |
| OTF/TTF → woff2 | **fontTools** | — |
| Python | `C:\Users\tatai\AppData\Local\Python\pythoncore-3.14-64\python.exe` | plain `python` — a venv with **no pip** |

Other traps:
- Tailwind v4 `@theme inline` **bakes font values into utilities**, so a CSS-var
  override can't reach them. Tata's `.tata-scope` uses two-class selectors for
  this reason.
- After editing `globals.css` the dev server can serve **stale CSS** —
  `rm -rf .next/dev` and restart.
- The repo lints `react-hooks/set-state-in-effect` as an **error**. Use refs,
  render-time clamps, ResizeObserver callbacks, or `useSyncExternalStore`.
- Git needs `-c maintenance.auto=false`. Windows mangles `git show ref:path` —
  prefix `MSYS_NO_PATHCONV=1`.

---

## 1. The homepage

`src/app/page.tsx` → `HeroStage` + `SectionPanel` + `SiteFooter`. That is all.

### The stage (`HeroStage.tsx`)

Layered back to front:

| Layer | What | Notes |
|---|---|---|
| `CircuitBackdrop` | circuit film, 7% | left/whole-page texture |
| `PaintBurst` | paint explosion, **right half only**, 60% | gradient-masked toward the midline |
| `HeroName` (z-0) | **Think** | behind the brain, so it laps over the K |
| `BrainSequence` | the brain, scale **0.675** | canvas `[data-brain]`, mouse-scrubbable |
| `HeroName` (z-20) | **Imagine** | on top of the paint |
| `BrainPins` (z-20) | the eight sections | real navigation |
| furniture (z-10) | CodeStream (top-left), AboutFacts, SpeechBubbles, HobbiesRotator, Corner3DGrid | `lg:` only |

**Type.** Two self-hosted faces, declared in `globals.css`:
`--font-digibra` (logic: Think, left pins, code header) and `--font-graff`
(creative: Imagine, right pins). ⚠ **`--font-graff` now points at "Kids Story",
not Graff Burner** — the token kept its old name so nothing downstream had to
change. Body copy is `--font-helv`.

**`HeroName`** — both words sentence case, 20% (Think, flat) and 50% (Imagine,
paint gradient via layer opacity, because `text-black/20` destroys a
`bg-clip-text` fill). Think's right edge and Imagine's left edge both pin to
the midline. They breathe on **Z** (±5%), not sideways. Two sizes measured, not
guessed: `BASE_SIZE` 12vw for Think — a literal 4× ran 1334px into 720px of
room and read as "INK" — and Imagine at `× 149/137` so their **ascents** match
(equal ink height would have shrunk it to pay for the g's descender).

**`BrainPins`** — no leader lines to the brain. Each section is a filled pill →
short stub → stroked circle, plus a rule out to the screen edge, levitating on
its own period. Hover stops the drift and drops a dot in the circle; **open
inverts the pair** — pill goes stroked with dark text, circle fills solid. The
creative side's stroke is a gradient, which CSS borders can't do, so it's a 2px
paint wrapper around an inner pill. Pins own the open state and broadcast it on
`brainpin:open` (`null` = closed).

**`SectionPanel`** — the only thing a pin opens. Full-width band, contents as a
3-col grid of rounded **squares**, capped at 9. Circuit ground for logic, paint
for creative, white type. Carries `data-section-panel`, which the pins'
outside-click handler honours. **Follows the event; never sets it.**

### ⚠ Known gap on the homepage

`SectionPanel` only builds cells for **Clients, Projects, Logofolio, The
Extincts Project**. **Career Path, Art, Publications, AI Generations show
"Nothing to show here yet."** Career Path and Art *have* content — it was drawn
by `CareerTimeline` and `ArtCollections`, reachable only from the retired
`SidesShowcase`. **Nothing was deleted**; those renderers are orphaned but
intact. Either give those sections cell shapes, or fall back to the old
renderer for the two.

**Parked, not dead — do not remove in a dead-code sweep:** `ECard` (+
`IdentityHeader`), and the `SidesShowcase` → `SectionBody` subtree
(`ArtCollections`, `BrandCardSlider`, `CareerTimeline`, `LogofolioGrid`,
`ExtinctsDeck`). `ThoughtBox` and `CornerText` are genuinely unreferenced.

---

## 2. The client pages

`/clients/[slug]` branches by slug:

| Slug | Renders | Notes |
|---|---|---|
| `tata-iis` | `TataExperience` | bespoke, the biggest page — see §3 |
| `azoth-biotech` | `AzothExperience` | client's Bolt hero on top, old page below |
| `uid` | `UidExperience` | circular section index |
| `freelance`, `newsmobile` | `CaseStudyExperience` | shared, config-driven |
| others | `ClientExperience` / `ClientWip` | generic |

**Azoth** — `AzothHero` is the client's Bolt export, rebuilt three ways: the
spotlight is a CSS radial-gradient mask (the original ran
`canvas.toDataURL()` **per mouse move**), the cursor writes CSS custom
properties in rAF instead of React state, and touch devices get a drifting
spotlight since they have no cursor. All six images were hotlinked (Higgs CDN,
Pexels) and are now local.

**NewsMobile** — `CaseStudyConfig.backdrop` is a **generic optional field**, so
any case-study page can take a film. Held at 10% under a paper scrim.

---

## 3. The Tata IIS page

`TataExperience`: hero film → description + "Powered by" → `GuidelineSections`
→ `PartnerMarquee` → **The Work** → credit line → `TataFooter`.

**Guidelines** — one grid stating the hierarchy: Tata IIS owns the whole left
half at full height; the right half splits IISA over IISM. `lg:min-h-[67vh]` is
a **floor, not a clamp** — a hard height clipped the "See more" control.

**The Work** — five fixed headlines (`TATA_SECTIONS` in
`constants/tataSections.ts`): Digital, Print, Photo/Videography, Proposals, AI
Solutions, after a 150-word note. Subsections are 4:3 tiles, three to a row,
and **the three columns are brand lanes: Tata IIS → IISA → IISM**.

- **Theme lives in the filename.** `brandOf()` reads it; `prepare-tata-themes.mjs`
  folds the source theme folder into the output name (`iisa-foo.webp`). Adding
  artwork to a theme folder is the whole job — no code edit.
- A tile **rests on a mockup** and shows flat artwork only on hover.
  `installed-` (a real photograph) beats `mockup-` (a composite). The matcher
  is `/(^|-)(mockup|installed)-/`, so themed names count.
- Clicking opens a panel **above** the tile's row. Sliders auto-advance at 5s,
  **max 7 artworks** anywhere.
- **A folder's `_meta.json` caption order outranks the brand grouping**
  (`curated`), and staged images never appear in the slider.

### ⚠ Privacy — read before touching Tata content

The original build excluded anything naming or picturing an identifiable
trainee. **The owner reversed that for ID cards on 2026-08-08**, having been
shown that the site is public: `ahmedabad-front` / `mumbai-front` name and
picture "Naveen Kumar". That is a deliberate, informed decision — leave it.

Everything else stays excluded, and the reasons are not obvious:
- **Certificates**: converting them produced **278 pages naming ~270 trainees**
  with registration numbers. Only **7 ship**, every one an *unfilled template*
  (blank name lines or "Lorem Ipsum"). If regenerated, re-cut to those 7.
- **Presentations**: 5 of 28 slides ship. The rest name individual trainees —
  several with family income and background — or are lorem templates.
- Handbooks are deliberately not converted (4 × ~200pp = 800 of 1342 PDF pages).

---

## 4. Asset pipelines

All idempotent, all reading from `D:\Assets\Clients\…`.

| Script | Does |
|---|---|
| `pdf-to-images.mjs` | every source PDF → webp (pypdfium2). **No PDF ships.** |
| `prepare-tata-sections.mjs` | the finer-taxonomy catalogue folders |
| `prepare-tata-themes.mjs` | theme-separated Digital folders; **folds theme into the filename** |
| `prepare-tata-mockups.mjs` | the owner's own Photoshop mockups — **always prefer these** |
| `make_studio_mockups.py` | composites the gaps (real projective tilt + shadow on white) |
| `prepare-tata-raws.mjs` | NEF → webp; 14 are boards photographed **installed on campus** |
| `prepare-tata-iis.mjs` | the original 13 catalogue folders |
| `prepare-{azoth,uid,newsmobile,freelance,other-clients}-*.mjs` | per client |
| `prepare-logofolio.mjs` · `prepare-career.mjs` · `prepare-brain-frames.mjs` | homepage data |

Two bugs in `make_studio_mockups.py` worth not repeating: cover-cropping to
nominal product sizes **sliced words off** standees and event boards (it keeps
the artwork's own aspect now, cropping nothing), and `convert("RGB")` composites
transparent artwork onto **black** — flatten onto white first.

**Curation caps and captions live in the scripts' METAS, never hand-edited into
`_meta.json`** — except where a folder is deliberately curated by hand
(ID Cards, Certificates), which the `curated` flag now respects.

---

## 5. Open items

1. **Career Path and Art are unreachable** (§1). Highest priority — real
   content, currently invisible.
2. **Mockups**: 14 subsections still have none. Full plan, tiers and costings
   in `docs/TATA_MOCKUP_PLAN.md`, including the full-screen mockup view (speced,
   not built) and two unused PSD templates already on disk.
3. **5 ceremony backdrops** won't rasterise — `Create skia surface failed` at
   every scale down to 0.01. Needs poppler/Ghostscript/Acrobat.
4. **Still assetless**: Website Banners has art; Media Kit, Cerci, H3LEN,
   Screensaver, Proposed Brand System, Proposed Website, Proposed Brochure.
5. **Fonts**: Tata's Copperplate Gothic / Helvetica are licensed and not on the
   drives — `.tata-heading` falls back to Cinzel.
6. **Accessibility**: `layout.tsx` sets `maximumScale: 1`, which blocks
   pinch-zoom on mobile. Worth reversing.
7. `.claude/launch.json` is modified and deliberately uncommitted.
8. Chess pawn is drawn inline in chess.com green rather than their app icon
   (trademark). Swap if a real asset lands in `public/`.

---

## 6. Working preferences

- **Pause and confirm when the session switches to paid-overage credits.**
- Verify in the live DOM, not by eye — several bugs this cycle (a stage
  collapsing to 0 height, a pill ballooning to a circle, cropped mockups) looked
  fine in a screenshot and only showed up in measurements.
- Commit at checkpoints; the owner pushes and merges on request.
- Flag privacy exposure rather than resolving it quietly.
