# Tata IIS — plan for one mockup per artwork

Written 2026-08-09, in answer to: *"create me a plan if I want to have at least
1 mockup for all the artworks I don't have them yet."*

This is a plan, not work done. Nothing below has been executed.

---

## 1. Where the coverage actually stands

The `Mockups` folder holds **68 pieces**, but they are not spread evenly across
the work — they cluster almost entirely on **environmental and signage** items:

> billboards · exterior gates · glass-door logos · drop-off points · garage
> doors · train bridges · delivery vans · flag and drop-down banners ·
> exhibition booths · caps and t-shirts · metal campus boards

That means the *large-format* work is well covered and the *held-in-the-hand*
work is not covered at all.

| Status | Subsections |
|---|---|
| **Has mockups** | Billboards & Signages · Boards · Banners |
| **Has real installation photos** (better than a mockup) | Boards — 14 shots now converted from NEF |
| **No mockup at all** | Visiting Cards · ID Cards · Certificates · Brochures · Trifolds · Flyers · Handbook · Letterheads & Stationery · Stickers & Notepads · Campus Posters · Presentations · Website Banners · Backgrounds · Socials |

So the gap is **14 subsections**, and they are overwhelmingly paper goods and
screen goods — the two categories that photograph badly flat and gain the most
from being staged.

## 2. The order I would fill them

Not all gaps are worth the same effort. Three tiers:

**Tier 1 — the handshake pieces (do first, 5 mockups)**
Visiting Cards, ID Cards (on a lanyard), Letterheads & Stationery, Certificates
(framed or held), Stickers & Notepads. These are what a viewer imagines
touching; a flat scan of a visiting card reads as an artboard, a staged one
reads as a product.

**Tier 2 — the paper system (4 mockups)**
Brochures, Trifolds, Flyers, Handbook. One good open-spread scene each. The
handbook especially — it is currently the only subsection with *no* imagery at
all, since the four ~200pp PDFs were deliberately not converted.

**Tier 3 — screen goods (5 mockups)**
Campus Posters (wall-mounted), Presentations (laptop), Website Banners
(browser frame), Backgrounds (video-call frame), Socials (phone).
These are the cheapest to fake convincingly and the least urgent, because the
artwork already reads as a screen.

## 3. Three ways to actually produce them, and what each costs

**(a) Real photography — best result, already partly done.**
You moved the finished-product shots into their section folders, and the 16
NEF raws in there are now converted (`scripts/prepare-tata-raws.mjs`). Fourteen
went into Boards as `installed-*.webp`. If any Tier-1 items still physically
exist — a visiting card, a lanyard, a printed certificate — photographing them
on a plain surface beats every synthetic option and costs an afternoon.

**(b) PSD mockup templates — best value for paper goods.**
There are already templates sitting unused at
`D:\Brain Website portfolio\Tata\portfolio shrey\` (an A4 cover book mockup and
a realistic book-cover mockup, 6 files). Those cover Brochures and Handbook
directly. More free/cheap templates exist for cards, lanyards and letterheads.
Requires Photoshop and a smart-object paste per item — roughly 10 minutes each,
so **Tier 1 + Tier 2 is about 90 minutes of manual work**.

**(c) Generated mockups — fastest, weakest.**
The route used at CP13: an image model produces a contact sheet, and
`scripts/slice-tata-mockups.mjs` cuts it into transparent PNGs. Cheap and fast,
but generated mockups have a recognisable sameness and can mangle small type —
which matters most on exactly the Tier-1 pieces where type is the design.
⚠ The OpenART account was down to ~0 credits after CP13; this needs a refill.

**My recommendation:** (a) for anything that physically exists, (b) for the
paper system, (c) only for Tier 3 where the artwork is a screenshot anyway.

## 4. Naming, so they wire themselves up

Nothing in code needs editing if the files are named to the existing rules:

- Drop into the artwork's own catalogue folder, not into `Mockups`.
- Prefix with the theme so it lands in the right column —
  `tata-`, `iisa-`, `iism-` (see `brandOf()` in `src/constants/tataSections.ts`).
- Prefix installed photography with `installed-`, staged mockups with `mockup-`.
- Example: `iisa-mockup-visiting-card-held.webp`.

Curation order and captions belong in the folder's `_meta.json`, whose key
order is the display order. Remember the **7-artwork ceiling** per slider — a
mockup added to a full folder will push the seventh item out of view unless the
meta promotes it.

## 5. The full-screen mockup view

Requested: *"a full screen view of a mockup on full width white bg after
clicking on any section's preview and then on the subsection of theme."*

Reading that as a third click-depth: **tile → panel (slider) → full-screen.**

The first two exist. The third is close to existing too — `MediaViewer` already
opens a piece full-screen with scroll-lock and focus handling, and its backdrop
is already `bg-white/97`. What it does **not** do is prefer a mockup, and it
frames the asset rather than letting it bleed.

The change is small and self-contained:

1. Give `MediaViewer` a `variant="plate"` that drops the chrome, goes to solid
   `#fff` full-bleed, and lets the image run to the viewport edges.
2. When a slider card is opened, look for a sibling asset in the same folder
   whose name matches `mockup-*` or `installed-*` and shares the theme prefix;
   if one exists, open **that** instead, with a small "view flat artwork"
   toggle back to the original.
3. Keep arrow-key paging across the subsection so the full-screen view is
   browsable rather than a dead end.

Estimated: one component prop, one lookup helper, no data migration.
**Worth doing after the mockups exist** — right now it would fall back to the
flat artwork for 14 of the 22 subsections, which is exactly the current view.

## 6. What this costs in total

| | Mockups | Effort |
|---|---|---|
| Tier 1 | 5 | ~1 hr (templates) or one photo session |
| Tier 2 | 4 | ~40 min (two templates already on disk) |
| Tier 3 | 5 | ~30 min (generated or browser frames) |
| Full-screen view | — | small, one component change |

Fourteen mockups closes every gap.
