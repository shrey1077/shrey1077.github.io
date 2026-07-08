# TATA IIS — Master Content Map

The blueprint every implementation decision serves. Generated from the actual
archive (25 folders inventoried, key assets inspected — see ASSET_REPORT.md),
not copied from the brief's example. Ratings from CURATION_REPORT.md.

```
Tata IIS  (the memory)
│
├── Legacy                          ★★★★★  plays once (local flag)
│   ├── Jamsetji Tata               ← Big Boards/Tata Quotes/Jamsetji.png
│   ├── J. R. D. Tata               ← Big Boards/Tata Quotes/Jrd.png (+ JRD TATA Quote.png)
│   └── Ratan Tata                  ← Big Boards/Tata Quotes/RTN.png
│
├── Identity (Arrival)              ★★★★★  wordmark construction stage
│   └── future: guidelines-driven construction (8x grid · 2x gap · 24x width)
│                                    ← logo guidelines/Logo Guidelines_10_3.png + Tata IIS Logo Guidelines 22.pdf
│
├── Design DNA                      editable content, not hardcoded
│   ├── Industry 4.0
│   ├── Precision                   (zebra motif)
│   ├── Human Potential
│   └── Scalable Brand System       (ring motif)
│
├── Campus Network                  animated connections
│   ├── IIS Ahmedabad               (navy/orange dot-tree logo)
│   └── IIS Mumbai                  (navy/orange dot-tree logo)
│
└── Communication Ecosystem         six systems — the heart
    │
    ├── 01 Brand Identity           "Who are we?"
    │   ├── Logo System             ★★★★★  Interactive Construction Experience
    │   │                            ← logo guidelines/ (pages 2–12, cover, intro MP4s, Short Logo)
    │   └── Stationery Suite        ★★★    composed still-life
    │                                ← Letterhead + Visiting card + ID cards + Notepad + Stickers
    │
    ├── 02 Marketing & Communication "How do we speak?"
    │   ├── Publications            ★★★★★  publication viewer (+ evolution story)
    │   │                            ← Brochures/ (First → FINAL 2024 → Aug 2025 + funding + trifolds)
    │   ├── Campaign Graphics       ★★★    curated grid (6–8 of 57)
    │   │                            ← Flyers/ (flagship courses, ARAI EV) + Banners
    │   ├── Campus Voice            ★★★★   series grid (Safety · POSH · Retail)
    │   │                            ← Campus Posters/
    │   ├── Environmental Scale     ★★★    wide strip + in-situ DSC photos
    │   │                            ← Big Boards (Exterior/Lab/Installations) + Standee + Signages
    │   └── NST — sub-brand case    ★★★    featured case (own logo, path system)
    │                                ← NST/
    │
    ├── 03 Photography & Media      "What does it look like alive?"
    │   ├── Films                   ★★★★★  video wall
    │   │                            ← Videos/ (logo renders + campus films, curated 6–8 of 12)
    │   ├── Event Campaigns         ★★★    one case row per event
    │   │                            ← Events/ (Amtech · Skills Conclave · Skill Connect)
    │   └── In Situ                 ★★★    small honest set (only real photos)
    │                                ← Standee/DSC_0603·0613·0629.jpg
    │
    ├── 04 Digital Presence         "How do we live on screens?"
    │   ├── Brand Literacy Series   ★★★★   story carousel (design thinking as content)
    │   │                            ← Socials/ (Alfa Romeo + Citibank pairs)
    │   ├── Social System           ★★★    phone-frame grid (templates/stories/spotlight)
    │   │                            ← Socials/ (rest, curated)
    │   └── Screen Presence         ★★     supporting row
    │                                ← Graphics/Teams Call BG
    │
    ├── 05 Student Experience       "What does a student hold?"
    │   ├── The Credential          ★★★★   interactive showcase (front/back, variants)
    │   │                            ← Certificates/ (curated 4–6 of 45; no personal names)
    │   └── The Handbook            ★★★    publication entry
    │                                ← Handbook/
    │
    └── 06 Special Projects         "What else does the mind make?"
        └── The Brand in the World  ★★★★   immersive full-bleed gallery
                                     ← Mockups/ (curated ~8 of 41)

EXCLUDED (never rendered)
├── CV/                    ⚠ named personal documents
├── New Joinee/            ⚠ named individuals
├── Presentations/         ⚠ business-sensitive proposal
├── Graphics/ (sources)    working files (PSD/AEP)
└── Pictures/              empty — the admitted photography gap
```

## Machine shape (implementation contract)

The map becomes data, not code:

- `src/constants/clients/tata-iis.ts` — the experience config: legacy moments,
  DNA principles (editable), campus network, the six systems with their
  collections `{ id, title, question, rating, presentation, assets[] }`.
- `public/content/clients/tata-iis/…` — **curated, web-optimized copies only**
  (the raw 5.2GB archive never ships). Collection folders follow
  CONTENT_GUIDE.md conventions; the fs readers keep powering counts/urls.
- Presentation styles map to experience-framework components
  (`presentation: "construction" | "publication" | "video-wall" | "showcase" |
  "carousel" | "composite" | "strip" | "grid" | "case"`), so a collection can
  change its voice by changing one field.

## Asset preparation pipeline (to enter the site)

1. Select per CURATION_REPORT targets (~60–80 artifacts).
2. Export web derivatives: images → WebP/AVIF ≤ 2560px (heroes) / ≤ 1280px
   (grid); PDFs → page rasters for viewing; videos → H.264 720/1080p + poster.
3. Strip any personal data. 4. Name descriptively (names become display data).
5. Drop into the collection folder — the data-driven system does the rest.
```
