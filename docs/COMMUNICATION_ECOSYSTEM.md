# COMMUNICATION ECOSYSTEM — Tata IIS

Folders are storage. **Systems are stories.** The archive reorganizes into six
communication systems — each one answers a question a brand must answer, and
each expands into curated collections (never raw folders).

The brief's suggested six systems fit this archive well; the adjustments below
(what moved where, and why) are the curation decisions.

## 1 · Brand Identity — *"Who are we?"*

The system of self: how the institution writes its own name.

| Collection | Source folders | Presentation |
|---|---|---|
| **Logo System** ★★★★★ | logo guidelines (+ Short Logo) | Interactive Construction Experience (guideline pages, real math, intro render) |
| **Stationery Suite** | Letterhead · Visiting card · ID cards · Notepad · Stickers | One composed "designer's desk" still-life — the system photographed together, not four thin grids |

*Decision:* the thin collateral folders merge into a single Stationery Suite —
five folders → one artifact wall. Individually they're ★★; together they're
the credible everyday proof of a working identity.

## 2 · Marketing & Communication — *"How do we speak?"*

The outbound voice, from a hand flyer to a building-sized board.

| Collection | Source folders | Presentation |
|---|---|---|
| **Publications** ★★★★★ | Brochures · Handbook | Publication viewer; the 2024→2025 evolution told explicitly |
| **Campaign Graphics** | Flyers (curated 6–8) · Banners | Curated grid — flagship courses, ARAI EV partnership |
| **Campus Voice** ★★★★ | Campus Posters (Safety/POSH/Retail series) | Series-grouped grid |
| **Environmental Scale** | Big Boards (Exterior/Lab/Installations) · Standee · Signages | Wide-format strip + the DSC in-situ photos |
| **NST — a sub-brand case** | NST | Featured case: its own logo, its own audience-path system |

*Decision:* NST stays visible as a *case study* rather than merging into
Flyers — it demonstrates the rarest skill in the archive: building a second
identity inside the first.

## 3 · Photography & Media — *"What does it look like alive?"*

| Collection | Source folders | Presentation |
|---|---|---|
| **Films** ★★★★★ | Videos (logo renders + campus/course films) | Video wall — posters first, player on demand |
| **Event Campaigns** | Events (Amtech · Skills Conclave · Skill Connect) | One case row per event |
| **In Situ** | Standee's DSC photos | Small honest set: the work installed |

*Decision (honest gap):* `Pictures` is empty — the system leads with FILM and
says so. No stock photography, ever. When real campus photography arrives it
drops into the existing collection folder and the section grows.

## 4 · Digital Presence — *"How do we live on screens?"*

| Collection | Source folders | Presentation |
|---|---|---|
| **Brand Literacy Series** ★★★★ | Socials (Alfa Romeo/Citibank "solutions") | Story-frame carousel — design thinking as content |
| **Social System** | Socials (templates, stories, spotlights) | Phone-frame grid |
| **Screen Presence** | Graphics → Teams Call BGs | Small supporting row |

*Decision:* the "solutions" series is separated from the template system — one
is thought leadership, the other is production infrastructure. They read
differently and deserve different framing.

## 5 · Student Experience — *"What does a student hold?"*

| Collection | Source folders | Presentation |
|---|---|---|
| **The Credential** ★★★★ | Certificates | Interactive showcase: front/back flip, campus/course/partner variants as one system |
| **The Handbook** | Handbook (cross-listed from Publications) | Publication entry |

*Decision:* CV and New Joinee are excluded (privacy — named individuals). The
credential IS the student-experience story: what four weeks of skilling
becomes in the hand.

## 6 · Special Projects — *"What else does the mind make?"*

| Collection | Source folders | Presentation |
|---|---|---|
| **The Brand in the World** ★★★★ | Mockups (curated ~8 of 41) | Immersive full-bleed gallery |
| **Legacy Boards** ★★★★★ | Big Boards → Tata Quotes | These POWER the Legacy sequence (see STORYBOARD) rather than sitting in a grid |

*Decision:* "Birding" (named in the brief's example) doesn't exist in the
archive — omitted rather than faked. Tata Quotes is deliberately pulled OUT of
Environmental Scale: those three boards are narrative, not signage.

## Structural notes

- Every system = `{ id, question, collections[] }`; every collection =
  `{ id, title, rating, presentation, sources, curated assets }` — data-driven
  (see TATA_IIS_CONTENT_MAP.md for the machine shape).
- Presentation styles are chosen PER COLLECTION (construction experience,
  publication viewer, video wall, showcase, carousel, composite, strip, grid) —
  the framework supplies the components; the data decides which renders.
- Raw archive folders are never exposed; only curated, web-optimized copies
  enter `public/content/clients/tata-iis/` (CONTENT_GUIDE.md conventions).
