# 14 — WHOLE-SITE HANDOFF

Written 2026-08-20, superseding 13 (and 09–12 before it). **Read this one only.**

---

## 0. Where things are, and how to run them

- **Repo:** `D:\Brain Folio` — Next.js 16, React 19, Tailwind **v4**, framer-motion.
  **NOT** `D:\Assets`, which is the raw client archive and the directory a
  session opens in.
- **A second source root:** `D:\Brain Website portfolio\UID` — the UID archive,
  and inside it `Shortlisted for Claude\`, the owner's curated selection
  (2026-08-20). Two pipelines read from there, not from `D:\Assets`.
- **Branches:** work on `tata-iis-experience`; **`main` is what deploys.**
  Flow: commit on branch → merge to `main` → push → deploy.
- **Live:** https://shrey1077.github.io
  - `main` is at **ddedca5c**, pushed and verified live.
  - `tata-iis-experience` is **7 commits ahead** and **not pushed**: the five
    from handoff 13, plus `8639d25e` and `c13f0b89` (this session).
- **Run:** `npm run dev` → localhost:3000.
- **Verify:** `npx tsc --noEmit` · `npx eslint src` · `npm run build`
  (**52 routes** — was 45; the seven new ones are `/publications/[slug]`).
- `.claude/launch.json` is deliberately uncommitted. It now sets
  `"autoPort": true` so two sessions can run dev servers at once.

### ⚠ The trap that cost the most time

**A hidden Browser pane silently invalidates verification.** With the pane not
displayed, `document.hidden` is true and the page never composites. That stops
requestAnimationFrame, CSS animations, framer springs, IntersectionObserver,
next/image lazy-loading, screenshots, and matchMedia change events.

**Check `document.hidden` FIRST** whenever anything looks wrong. Two more
specific ways it lies, both hit this session:

- ⚠ **`scroll-behavior: smooth` is set on `<html>`.** Smooth scrolling is
  rAF-driven, so `scrollTo()` does **nothing at all** while the pane is hidden —
  four probes at four different targets returned byte-identical rects. Use
  `scrollTo({top, behavior: 'instant'})` for any scripted scroll measurement.
- ⚠ **A framer height-animated wrapper stays at `height: 0px`.** An expanded
  section then contributes nothing to layout: its spacer never enters the
  document, max scroll caps early, and its rows measure as permanently below the
  fold. That reads *exactly* like a broken over-tall `position: sticky`. It is
  not. Check `getAnimations().length` on the wrapper — zero running animations
  plus an inline `height: 0px` is the tell.

### Verifying visually in the pane

- The screenshot surface does **not** always match the CSS viewport. At a
  1280-wide override the page occupied ~26% of the frame and was unreadable; at
  the pane's own ~760 width the capture matched 1:1 and was fine. **Prefer
  resizing to a smaller viewport over zooming.** `document.documentElement.style
  .zoom` distorts `svh`-clamped panels and is not a substitute.
- `computer{action:"zoom"}` region cropping is **not supported** here — it
  silently returns the full screenshot.
- ⚠ **RotateGate fires at 760×1000** and covers the page with "Turn your phone
  sideways". Click **CONTINUE ANYWAY** before measuring anything on a narrow
  viewport, or you will screenshot the gate. (Its portrait path is therefore
  now verified; the landscape path still needs a real handset.)
- ⚠ **SectionPanel switching takes >650ms.** `AnimatePresence` runs a 0.5s exit
  before the new panel enters, so a probe that dispatches `brainpin:open` and
  reads 220ms later measures the OUTGOING panel. Every section reported
  "Clients" that way. Dispatch `null`, wait ~1200ms, dispatch the id, wait
  ~1100ms. Panels do settle to 0 on close — there is no leak.

### Other environment facts

| Need | Use | Not |
|---|---|---|
| PDF → image | pypdfium2 via a Python shim | pdf-to-img/pdfjs |
| PPTX → image | PowerPoint COM | LibreOffice/poppler (absent) |
| NEF raw → image | rawpy | sharp/Pillow |
| font → woff2 | fontTools (set `flavor`) | — |
| Python | `C:\Users\tatai\AppData\Local\Python\pythoncore-3.14-64\python.exe` | plain `python` |

- ⚠ Set `PYTHONIOENCODING=utf-8` before any Python that prints PDF text. The
  default cp1252 console encoding raises `UnicodeEncodeError` on smart quotes
  and kills the script mid-run.
- ⚠ **Truncated searches lie.** A font scan capped at 15 rows produced a
  confident "you do not have Copperplate or Helvetica" — twice.
- ⚠ **Unsigned integer underflow in image work.** PIL gives uint8; cast to
  int16 before subtracting or 251 − 253 wraps to 254.
- Git object writes intermittently fail with "Permission denied" on Windows.
  Re-run. Use `git -c maintenance.auto=false` to quiet the repack noise.
- ⚠ **Merge in a temporary worktree** if another chat may be live. Pass
  `-c safe.directory=PATH` per command rather than editing global config.
- ⚠ Bash heredocs in this harness break on long markdown. Use the Write tool.

---

## 1. The landing page

`src/app/page.tsx` → HeroStage + SectionNav + SectionPanel + SiteFooter, with
RotateGate mounted globally in `layout.tsx`. Unchanged from 13 except that
`page.tsx` now also resolves **publication covers** server-side (see §4).

Everything in handoff 13 §1 still holds: BRAIN_SHIFT_X = 27 is safe to revert,
BrainPins draws one connector run per pin, **the reveal is a CLIP not a dash
offset** (do not go back), ThoughtBox's strike is an inner inline-block,
PortraitOrb lives in the footer, and HomeMarks had three icons redrawn after
being *looked at*.

**SectionPanel** now hands three sections to their own renderers rather than
flattening them into board cells: `career-path`, `art`, and — new —
`publications`. Everything else still draws the 3×3 board.

---

## 2. The Tata IIS page

Unchanged this session. Everything in handoff 13 §2 still holds: no hero film,
the campus band, GuidelineSections' rows-not-columns, GuidelineSlider's
elongated pills, WorkSections' zig-zag grounds, and the tile rules.

### ⚠ ScrollRows still has a dead tail — arithmetic, not appearance

`PER_ROW_VH` was never the only number to turn. In
`src/components/client/tata/ScrollRows.tsx`, the last row finishes at
`start + span*0.6`, which is always short of 1:

| rows | last row completes at | dead scroll after |
|---|---|---|
| 2 | 76% | 24% |
| 3 | 81% | 19% |
| 4 (Print) | 84% | 16% |

For every row count the final 16–24% of the pin holds the section motionless
with nothing left to reveal — which is precisely the "reads stuck" failure.
Turning `PER_ROW_VH` down shortens the tail proportionally but never removes
it. **Not changed**, because it is a visual judgement that wants watching, not
measuring. The pacing and the row reveal remain the one thing on this page
nobody has actually seen.

---

## 3. The UID page — refreshed from the shortlist

`/clients/uid`. Five projects now, in order: **branding, packaging, nirvaan,
posters, trip**.

- **branding — Puran Studios, 15 plates.** ⚠ Read the client correctly: it is a
  **sustainability film studio**, not a recording studio. The mark is a leaf
  whose midrib is a strip of film; the work it sleeves is documentary (the
  *Cowspiracy* record). Its own greens are on the colour page — **#00945E,
  #225D38, #443635** — and #00945E is the project accent.
  Ordered as a brand book reads: mark → lockups → exploration → language, type,
  colour → applications → colophon.
  Two files in `Branding-Puran Studios/` are deliberately NOT used:
  `LOGOS SHEETSpuran-01-01.png` (a rougher near-duplicate of
  `logos_purandocu-01.png`) and `Himalaya_Warli_Poster_sem3-01.png`, which is
  not Puran at all and is already a plate on **posters**.
- **packaging — Farm Stacks, 7 plates.** The owner's note inside the folder:
  *"USe only page number 13-16 in preview, with an option to read full zine."*
  So plates 04–07 are zine pages 13–16 (hydroponics end results, display ×2,
  the Griffin Muffin brief) and `UidProject.link` sends the reader to the whole
  zine in Publications. Plates 01–03 are the dielines and process board, which
  live in `Sketches/` rather than `Packaging/`.
- **"The Books" is gone from this page.** Retired to Publications by the owner's
  instruction, where the documents can be read rather than shown as covers.
  `work/documents/` was deleted.

`prepare-uid-experience.mjs` still owns nirvaan, posters and trip and reads the
unshortlisted archive. **`prepare-uid-shortlist.mjs` supersedes its branding and
packaging halves, and its `documents` step is retired.** Do not re-run the old
script expecting it to win.

---

## 4. Publications — a new room and a new route

The homepage's Publications pin was a placeholder until this session.

- **Data:** `src/constants/publications.ts`. Eight entries, three shapes:
  `pages` (a document rendered page by page), `body` (a short piece set as
  text), `href` (an entry that lives elsewhere — the NewsMobile bylines point at
  `/clients/newsmobile`).
- **Pages on disk:** `public/content/publications/<slug>/NN.webp`. Six
  documents, **120 pages, ~17 MB**. ⚠ **Page count is never stated in code** —
  `readPublicationPages()` counts the folder, so a re-run cannot leave a stale
  number behind.
- **Route:** `/publications/[slug]`, seven static pages. `PublicationPages` is a
  Server Component with no interactivity by choice — a 30-page study wants a
  column you scroll, not a viewer. First two pages eager, the rest lazy; no
  fixed aspect, because page shape varies between documents *and* within one.
- **Homepage body:** `PublicationShelf`. Documents lead with **words**, not
  covers — nine scanned covers on a dark ground tell a reader nothing — with the
  cover cropped narrow beside them as a spine. ⚠ A cover-less entry draws its
  **year** in the spine, not its `kind`: `kind` there reads as a stutter against
  the meta line beside it ("Blog entryBlog entry · 2019").
- ⚠ The shelf is a client component and cannot touch `node:fs`, so covers are
  resolved in `app/page.tsx` and passed down.

**Not carried over:** `Branding/branddocu/Branding_Shrey.pdf`. It is one page of
personal-branding self-description, not a publication.

---

## 5. Art — filled from the Sketches folder

`public/content/art/`, eight collections, **53 pieces**: Painting (11, unchanged)
plus Sketchbooks 9, Drawing Studies 9, Model Making 6, Type Studies 6, Ink and
Pattern 5, Field Photographs 4, Portraits 3.

- ⚠ **`Craft/` was deleted, not refreshed.** It held the first twelve `Sketches/`
  files in alphabetical order — every one of which reappears in the curated
  collections. Leaving it would have shipped twelve pieces twice.
- ⚠ **`Sketches/` is not all sketches.** It is a mixed coursework archive.
  Two groups in it are not art:
  - the **Farm Stacks dielines and process board** → routed to UID packaging,
    where they belong;
  - the **Rockwell type specimen** → left in Art as *Type Studies*, under the
    owner's folder-level mapping. **Flagged**: it is screen work in a room
    described as "away from the screen", and arguably belongs on the UID page.
- Folder names with spaces are fine — `publicUrl` runs `encodeURIComponent` per
  segment. An `&` was still renamed out ("Ink & Pattern" → "Ink and Pattern") as
  cheap insurance for static hosting.

---

## 6. The chess site — shipped verbatim

"Three Steps Ahead", a complete four-page Bootstrap 3 + jQuery site from 2022.
The owner's instruction was to ship it **as-is at its own URL**, not to retell it
as a case study.

- `scripts/copy-chess-site.mjs` copies it to `public/chess/`. Next's static
  export passes `public/` straight through.
- **Linked from Projects** via a new optional `Client.href`. ⚠ Setting `href`
  means **no `/clients/<slug>` page is generated** — `generateStaticParams` now
  reads `routedClients()`, which filters those out, so the card is the only way
  in. The cell renders a real `<a>`, not `next/link`, because the client router
  cannot navigate to a static file.
- ⚠ **The link is `/chess/index.html`, not `/chess/`.** GitHub Pages resolves a
  directory to its index; `next dev` does **not** for a `public/` folder, so
  `/chess/` 404s locally while every file under it serves fine. Naming the file
  makes it correct in both, which is the only way it can be checked before it
  deploys.
- ⚠ **One class of edit was made**, because "as-is" would otherwise have meant
  "broken": three assets loaded over plain **http** (both Google Fonts links and
  the Play widget). shrey1077.github.io is HTTPS-only and browsers block active
  mixed content outright, so each was protocol-upgraded to https. Nothing else
  was touched. Verified: both stylesheets parse, and the widget's
  `csoPlayVsComputer` initialises.

### ⚠ Open questions on the chess site — flagged, not resolved

1. **`play.html` does not exist.** All four pages link to it in their nav, so
   the "Play" item 404s on every page. It is missing from *both* copies of the
   site in the archive, so it never existed — this is an original gap, not
   something the copy lost. Two one-line fixes: drop the nav item, or point it
   at `index.html`, where the Play-against-Cinnamon widget actually lives.
2. **A third-party script executes on the portfolio's origin** —
   `chessstrategyonline.com/js/widgets.min.js`, confirmed loading and running.
3. **learn.html embeds two YouTube tutorials** that are other people's videos.
4. `images/content__images/566edda72340f8e0008b554b.jfif` has a CDN-style name
   and is likely stock of unknown licence.
5. **contact.html posts to `action=""`** — inert on a static host. It looks live
   and asks for a name and email that go nowhere.

---

## 7. Privacy and licensing — standing flags

Unchanged from 13: Tata **ID cards** (`ahmedabad-front` / `mumbai-front`, naming
"Naveen Kumar") ship by a deliberate, informed owner decision of 2026-08-08;
certificates, presentations and handbooks stay excluded. **Helvetica and
Copperplate** are licensed faces embedded in a public static export — confirm a
webfont licence before this is shared widely.

New this session, all shipping, all one-line reversible:

- ⚠ **`/publications/pethapur` names a living craftsman** — Prahalad Bhai Kanulal
  Prajapati, 70 — and states his **eyesight condition** and his **daily wage**.
  It was written as a blog entry for publication. The name can be removed by
  editing `body` in `constants/publications.ts` without touching anything else.
- ⚠ The **ethnography** book's page images name the field visit's host and guide
  in Pethapur, and the mentor who taught the module.
- ⚠ **nirvaan** is co-authored; three collaborators are credited by name.
- Plus the four chess-site items in §6.

---

## 8. Fonts

Unchanged from 13. Self-hosted in `public/fonts/`: digibra, juturu,
sunset-script, copperplate-gothic-bold, helvetica-condensed,
helvetica-black-condensed-oblique.

Tata IIS page only (`.tata-*`): Copperplate Gothic Bold headlines, Helvetica
Black Condensed Oblique body headlines, Helvetica Condensed body.
⚠ Copperplate's file reports OS/2 weight 400 despite being the Bold cut, so the
`@font-face` claims 700. ⚠ The subhead must ask for **both 900 and oblique**.

The chess site carries its own webfonts (Podkova, Open Sans) from Google Fonts
and is independent of this system.

---

## 9. Asset pipelines

All idempotent. Reading `D:\Assets\Clients\…`: pdf-to-images.mjs,
prepare-tata-{sections,themes,mockups,raws,iis,experience}.mjs,
make_studio_mockups.py, prepare-{azoth,uid,newsmobile,freelance,other-clients}-*.mjs,
prepare-{logofolio,career,brain-frames}.mjs, prepare-zabraku-portfolio.mjs.

Reading `D:\Brain Website portfolio\UID`:
- `prepare-uid-experience.mjs` — nirvaan, posters, trip, and the Painting
  collection. Its branding/packaging/documents steps are **superseded**.
- `prepare-uid-shortlist.mjs` — **new.** UID branding + packaging, the seven Art
  collections, and all six Publications documents.
- `copy-chess-site.mjs` — **new.** The verbatim copy plus the https upgrade.

Captions and caps live in the scripts' METAS, never hand-edited into
`_meta.json` — except deliberately curated folders (ID Cards, Certificates).

---

## 10. Open items

1. **7 unpushed commits** on the branch. The owner merges and pushes on request.
2. **Still unverified, all needing a visible pane or a real device:**
   - ScrollRows **pacing** and the **row reveal** on the Tata page (§2). The
     dead-tail arithmetic is known; how it *reads* is not.
   - RotateGate's **landscape** path — the pane drops touch emulation above
     768px, so a landscape phone cannot be emulated. Needs a real handset. Its
     portrait path is now confirmed working, with a CONTINUE ANYWAY escape.
   - SectionNav's **breakpoint crossing** with a section open.
3. **`play.html` on the chess site** (§6) — the most visible of the flagged
   items, since it 404s from every page's nav.
4. **Campus colour hexes are no longer surfaced anywhere** on the Tata page.
5. **Zabraku's three unresolved questions** (see 12): the held-out contact page
   with a real office address, the deck speaking as the agency rather than the
   owner, and the third-party marks.
6. **Dead code:** exactly three modules are unreferenced and every one is
   **parked — do not remove**: IdentityHeader (only importer of ECard),
   SidesShowcase (only importer of SectionBody), SpeechBubbles. ECard and
   SectionBody do NOT appear in an unused-file scan.
7. `scripts/prepare-tata-iis.mjs:354` has a pre-existing eslint parse error,
   outside `eslint src`.
8. Mockups: 14 subsections still have none (docs/TATA_MOCKUP_PLAN.md). 5 ceremony
   backdrops will not rasterise. Still assetless: Media Kit, Cerci, H3LEN,
   Screensaver, Proposed Brand System / Website / Brochure.
9. `out/` is now **426 MB**. Publications added ~17 MB and Art ~15 MB (net of
   the deleted Craft). Worth watching against GitHub Pages' 1 GB soft limit.

---

## 11. Working preferences

- **Verify in the live DOM, not by eye** — but know what the DOM cannot tell
  you. This session, numbers proved the route table, the page counts, the panel
  switching and the plate ordering; only **looking** caught a chess mark that
  was invisible on its own card, and only reading the source PDFs caught that
  Puran is a film studio rather than a recording studio.
- **Check `document.hidden` before debugging anything animated** — and remember
  smooth-scroll and height-animated wrappers are the two subtlest symptoms.
- **After changing anything shared, check what you did NOT change.** SectionPanel
  is shared by all eight sections; all eight were re-opened and counted after it
  was touched.
- **Bypass cache when verifying a deploy, and check something the build ADDS and
  something it REMOVES.**
- Commit at checkpoints; the owner says when to push and when to merge.
- **Flag privacy and licensing exposure rather than resolving it quietly.**
- Reference images arrive as chat attachments and land in `D:\Assets`.
- ⚠ **Context burn is a live concern.** Prefer one session per feature; measure
  instead of screenshotting where numbers suffice; do not re-run `npm run build`
  on every intermediate step.
