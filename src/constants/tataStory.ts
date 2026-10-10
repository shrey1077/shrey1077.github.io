/**
 * The Tata IIS page as numbered bands — copy, artwork and rails.
 *
 * The owner redesigned that page on 2026-09-22 from a comp: a two-column hero,
 * then bands numbered 01…05, each one a kicker, a serif headline, a short
 * paragraph and one piece of evidence. This file is the copy and the pointers;
 * TataExperience is the layout.
 *
 * ⚠ THE COMP'S LOGOS AND SOME OF ITS WORDS ARE NOT THE CLIENT'S. It was made to
 * show composition, and its marks are redrawn approximations, its campus
 * taglines invented, its email a placeholder. Everything here therefore comes
 * from what the repo already holds and can vouch for:
 *   · marks          — TATA_GUIDELINES (the real files the rulebooks ship)
 *   · campus lines   — the dialect sentences already written for each campus
 *   · colours        — the hexes in TATA_GUIDELINES, not sampled from the comp
 *   · photographs    — real campus frames from the catalogue, not stock
 *   · contact        — SITE, not the comp's address
 * ⚠ Nothing in this file should ever state a fact about Tata IIS that is not
 * already established elsewhere in the repo. If a band needs a new claim, get
 * it from the owner rather than writing one that reads well.
 *
 * ⚠ The comp also carried a campaign line over the photograph in 04 ("REAL
 * SKILLS REAL OPPORTUNITIES"). It is not in any file the institute supplied, so
 * it is deliberately absent — an invented campaign line on a real client's page
 * is a claim, not decoration. The hero artwork's own wording is the owner's and
 * is baked into that image.
 */

import { TATA_GUIDELINES } from "@/constants/tataExperience";

/** The two campus photographs the owner supplied on 2026-09-26 —
 *  `scripts/prepare-tata-campus.mjs` re-encodes them and keeps the originals. */
const CAMPUS = "/content/clients/tata-iis/campus";
const BRAND = "/content/clients/tata-iis/brand";

/** The hero: the wordmark, the pitch, and the owner's supplied artwork. */
export const TATA_HERO = {
  eyebrow: ["Client", "Enterprise", "Systems"],
  /** Two lines, set apart so the break never lands on the browser's whim. */
  headline: ["The system", "behind the skills."],
  /** Supplied by the owner 2026-09-22 (1071×1469). Its own wording — "SKILLS
   *  BUILD STRONGER INDIA", "PEOPLE SKILLS INDUSTRY INDIA" — is part of the
   *  image, so the page must not set those words again beside it. */
  art: "/content/clients/tata-iis/hero/skills-build-stronger-india.webp",
  artAlt:
    "Campaign artwork: a trainee in safety glasses in profile, the campus workshops and machining bays composited inside the silhouette.",
  /** The vertical micro-rail down the right edge. */
  rail: ["Think", "Design", "Skill", "Impact"],
  railFoot: ["A more", "skilled", "India"],
} as const;

/** One numbered band. `art` is evidence, never decoration — every one of them
 *  is a real plate, photograph or mark from this client's own files. */
export interface TataBand {
  /** "01" … — fixed rather than derived, because the bands are hand-ordered. */
  number: string;
  kicker: string;
  /** Kept as lines for the same reason as the hero's. */
  headline: string[];
  body: string;
  /** The words set small beside the band, as in the comp. */
  rail?: string[];
}

/** Band 01. It was "The institute" against a single campus photograph until
 *  2026-09-26, when the owner turned it into the institute introducing ITSELF —
 *  both campuses, each with its own building and its own paragraph. */
export const TATA_WHO: TataBand = {
  number: "01",
  kicker: "The institute",
  headline: ["Who we are."],
  body:
    "Tata IIS is a Section 8 company set up by the Tata Group. It runs two campuses — Ahmedabad and Mumbai — each built with the Ministry of Skill Development & Entrepreneurship.",
  rail: ["Skills", "People", "Progress", "Opportunity"],
};

/** The two campuses, side by side under 01.
 *
 * ⚠ THE PARAGRAPHS ARE THE CLIENT'S OWN, supplied verbatim by the owner on
 * 2026-09-26 — the acreage, the villages, the partner ministries and the
 * Section 8 status all come from them. Do not paraphrase them into something
 * that reads better; they are the institute describing itself, and the numbers
 * in them are checkable facts about a real organisation.
 *
 * ⚠ BOTH CAMPUSES HAVE A FILM. Ahmedabad's was easy to find; Mumbai's was
 * filed as `All Logos/Color_1.mp4` — by number, not by campus — and only
 * turned up on 2026-09-26 when the owner said it existed. A column with no
 * `film` still renders as the photograph alone (see CampusTheme), so the pair
 * can lose one without breaking.
 *
 * ⚠ `ink` is measured, and `inkBox` (tataExperience.ts) turns it into a box.
 * iism.png is an 800×800 canvas with its ink in the middle 32%; iisa.png fills
 * its frame. The two marks are also different SHAPES — Ahmedabad stacks its
 * name under the symbol at 1.35:1, Mumbai sets it alongside at 2.98:1 — so
 * matching their heights still leaves them looking unequal. Equal ink area
 * does not. */
export const TATA_CAMPUS_PROFILES = [
  {
    label: "IIS Ahmedabad",
    logo: TATA_GUIDELINES.iisa.logo,
    ink: { aspect: 1.35, fillH: 1, box: 800 / 593 },
    /** ⚠ ORDER IS THE POINT — frontage, lab entrance, workshop floor: outside
     *  in. Band 01 plays them in this order, three seconds each, after the
     *  campus film. */
    photos: [
      {
        src: `${CAMPUS}/iisa-frontage.webp`,
        alt: "The IIS Ahmedabad building, its name lettered across the upper facade.",
      },
      {
        src: `${CAMPUS}/iisa-lab-1.webp`,
        alt: "Lab 1 at the IIS Ahmedabad campus, with the institute's standee at the foot of the steps.",
      },
      {
        src: `${CAMPUS}/iisa-workshop.webp`,
        alt: "The workshop floor at IIS Ahmedabad, seen from the gantry: vehicle bays, benches and trainees at work.",
      },
    ],
    /** ⚠ THE CAMPUS'S OWN LOGO STING, and only Ahmedabad has one. It plays,
     *  the photograph holds for five seconds, and it plays again — the owner's
     *  ask, 2026-09-26. `scripts/prepare-tata-theme.mjs` makes this web copy
     *  from the archive master (6.4MB → 121KB, audio stripped). A campus with
     *  no `film` simply shows its photograph; see CampusTheme. */
    film: `${CAMPUS}/iisa-theme.mp4`,
    text:
      "The Indian Institute of Skills (IIS) Ahmedabad, established by Tata IIS (a Section 8 company set up by the Tata Group) in collaboration with the Ministry of Skill Development & Entrepreneurship (MSDE) and the Government of Gujarat (GoG), aims to empower India’s youth. Located on a 20-acre campus in Nasmed village, it features state-of-the-art infrastructure designed for job-oriented learning. With advanced labs and classrooms, IIS Ahmedabad is dedicated to equipping youth with the essential skills needed for professional success.",
  },
  {
    label: "IIS Mumbai",
    logo: TATA_GUIDELINES.iism.logo,
    ink: { aspect: 2.98, fillH: 0.32, box: 1 },
    /** One, for now: the owner said to wait for Mumbai's set. The column runs
     *  the same cycle with a single stop until they arrive. */
    photos: [
      {
        src: `${CAMPUS}/iism-facade.webp`,
        alt: "The glazed frontage of the IIS Mumbai campus at Chunabhatti.",
      },
    ],
    /** Mumbai's own sting — the teal counterpart to Ahmedabad's orange. Same
     *  length, same structure, each ending on its campus URL. */
    film: `${CAMPUS}/iism-theme.mp4`,
    text:
      "The Indian Institute of Skills Mumbai, established by Tata IIS (a Section 8 company set up by the Tata Group) in collaboration with the Ministry of Skill Development & Entrepreneurship (MSDE), Government of India, aims to empower India’s youth. Located on a 4+ acre campus in Chunabhatti, it features state-of-the-art infrastructure designed for job-oriented learning. With advanced labs and classrooms, IIS Mumbai is dedicated to equipping youth with the essential skills needed for professional success.",
  },
];

/** The artwork that closes band 01 — blue industrial geometry (a CNC spindle
 *  throwing sparks at the left, a production line at the right) rising out of
 *  the page, supplied by the owner on 2026-10-03. A cut-out: transparent above,
 *  so the campuses sit over its empty middle. The empty sky above the ink was
 *  trimmed off the supplied 2000×667 file; size is the trimmed file's. */
export const TATA_WHO_ART = { src: `${CAMPUS}/industry-band.webp`, w: 2000, h: 527 };

/** Its partner at the other end of the page, just above the footer (owner,
 *  2026-10-03): a trainee at work on EV battery packs, in the same blue spray
 *  and circuit geometry. Also a cut-out; the empty sky above the ink was
 *  trimmed off the supplied 2172×724 file, then scaled to 2000 wide. */
export const TATA_CLOSING_ART = { src: `${CAMPUS}/workshop-band.webp`, w: 2000, h: 541 };

export const TATA_SYSTEM: TataBand = {
  number: "02",
  kicker: "The system",
  headline: ["About the brand."],
  /** ⚠ Says nothing of how the institute came into the Tata family (owner,
   *  2026-10-04: the account of the ownership change was too much to disclose
   *  about the company). Keep it to the design decision. */
  body:
    "The wordmark was refined to bring the institute into the wider Tata identity — rebuilt on the group’s own typeface, so it reads as part of the family at every size and on every surface.",
  rail: ["Learn", "Practice", "Build", "Belong"],
};

/** 02's first movement: the wordmark before and after.
 *
 * ⚠ WHAT IS ASSERTED HERE IS WHAT THE FILES SAY. The new mark's own artwork
 * (`logo guidelines/TATA IIS Logo.ai`, `Precaution_logo.pdf`) names Copperplate
 * Gothic Bold and Helvetica LT Std; the Tata Trusts logo file names Copperplate
 * Gothic Bold too, which is what makes "the Tata Trusts font" checkable rather
 * than folklore; and plate 12 of the rulebook states it outright — "Designed in
 * the signature Tata Trusts font". The 4:1 ratio and its fourfold reading are
 * quoted from that same plate.
 *
 * ⚠ THE OLD WORDMARK'S FACE IS DELIBERATELY NOT NAMED. Its artwork is fully
 * outlined — no font data survives in it — and the owner's recollection of
 * Myriad Pro does not hold up against the letterforms: Myriad's cap A has a
 * pointed apex and the old mark's is flat, which rules it out. Rendered against
 * the usual suspects it sits closest to Titillium, but "closest" is not a name,
 * so the page says what can be seen instead. Name it here only when someone can
 * point at a file. */
export const TATA_LOGO_STORY = {
  before: {
    label: "Before",
    mark: `${BRAND}/legacy-wordmark.webp`,
    markAlt: "The institute's earlier wordmark: TATA IIS in blue, over its full name.",
    caption: "A humanist sans, beside the Tata group mark.",
  },
  after: {
    label: "After",
    mark: TATA_GUIDELINES.wordmark,
    markAlt: "The current Tata IIS wordmark, set in Copperplate Gothic Bold.",
    caption: "Copperplate Gothic Bold — the Tata Trusts face.",
  },
  /** The argument, in the order it happened.
   *  ⚠ It ran to four until 2026-09-27, when the owner cut "The handover" and
   *  "The brief". The handover was later taken out of the band's opening
   *  paragraph too (2026-10-04) — the page no longer recounts the ownership
   *  change at all. */
  steps: [
    {
      title: "The proposal",
      text: "Rather than draw a new voice, adopt the parent's. I put Copperplate Gothic Bold — Tata Trusts' own face — to the institute's name.",
    },
    {
      title: "The rulebook",
      text: "It carried: \u201cDesigned in the signature Tata Trusts font\u201d, at a fixed 4:1 ratio the guidelines read as fourfold growth \u2014 academic excellence, industry relevance, skill development, sustainability.",
    },
  ],
} as const;

/** 02's rulebooks — one per identity (owner, 2026-10-03: "keep only three
 * books, one each for Tata, IISA and IISM … they open on clicking"). Each
 * opens into its own plates, full screen.
 *
 * ⚠ SHOWN AS THEIR OWN PLATES SINCE 2026-10-05 (BrandDecks): the owner did not
 * like the book mockups that stood here — the Tata one the owner's, the two
 * campus ones that mockup with a campus mark pasted on (made by a script that
 * is gone with them; git and _source/backup-2026-10-05-before-rethink.tar have
 * both). The deck shows a book's first four plates, so ⚠ ORDER MATTERS: the
 * cover first. The campus decks used to open on their typography plate; it
 * is last now, after the plates the rulebook itself puts first.
 * ⚠ The text that stood beside the Tata book — "What the rulebook fixes", its
 * five rules (TATA_DNA) — went on 2026-10-03; the family tree under the books
 * too (TATA_LOCKUP). git has both. Each deck carries what the tree said of its
 * identity — the campus rationale and palette, the parent's face. */
export const TATA_RULEBOOKS = [
  {
    id: "tata-iis",
    label: "Tata IIS",
    role: "The parent",
    line: TATA_LOGO_STORY.after.caption,
    colours: [],
    plates: TATA_GUIDELINES.tataPlates,
  },
  {
    id: "iisa",
    label: "IIS Ahmedabad",
    role: "Campus",
    line: TATA_GUIDELINES.iisa.line,
    colours: TATA_GUIDELINES.iisa.colours,
    plates: [...TATA_GUIDELINES.iisa.plates, TATA_GUIDELINES.iisa.typography],
  },
  {
    id: "iism",
    label: "IIS Mumbai",
    role: "Campus",
    line: TATA_GUIDELINES.iism.line,
    colours: TATA_GUIDELINES.iism.colours,
    plates: [...TATA_GUIDELINES.iism.plates, TATA_GUIDELINES.iism.typography],
  },
] as const;

/** 02's last movement — the parent mark and its two campuses, as three decks. */
export const TATA_IDENTITIES = {
  kicker: "One vision, three identities",
  body:
    "Two campuses opened under that mark, and each needed a voice of its own without breaking from it. All three rulebooks share the same construction, exclusion zone and behaviour, and part company only on colour and geometry.",
};


/** Band 03 — the trainee handbook (owner, 2026-10-04).
 *
 * ⚠ KEPT GENERAL ON PURPOSE. The owner asked for the page to say no more about
 * the institute than a professional portfolio should: the handbook's
 * contents are NAMED (course details, fee and attendance policies, the
 * pledge, the declaration), never quoted, and the slider shows no policy
 * page and no letter (see scripts/prepare-tata-handbook.mjs).
 * ⚠ The puzzle list is what the books actually hold: a puzzle a week from
 * Week 1 — riddles, a crossword, sudoku, matchsticks, logic grids — and a
 * chess problem on the last page; the answer key is a QR code on one of the
 * back pages. The flipbook runs on the right-hand pages from Week 1 on. */
export const TATA_HANDBOOK: TataBand = {
  number: "03",
  kicker: "The handbook",
  // ⚠ NO TIME PERIOD anywhere in this band (owner, 2026-10-04: the courses
  // run three to six months, so "a year" was wrong — and any length would be
  // wrong for some of them).
  headline: ["Their journey,", "in their hands."],
  body: "From the first batch on, every trainee has started with a handbook: the institute, set out in one place, and room to record the journey ahead.",
};

/** The six points, set round the page: 1–3 down the left, 4–6 down the right
 *  (owner, 2026-10-04). `pages` are the slides (HANDBOOK_SLIDES slugs) each
 *  point describes — shown as thumbnails under it, and the point lights up
 *  while one of them is on display. */
export const TATA_HANDBOOK_POINTS = [
  {
    title: "The institute, in brief",
    text: "Course details, fee and attendance policies, the pledge, and a declaration each trainee signs.",
    pages: ["welcome", "pledge", "declaration"],
  },
  {
    title: "A record of the journey",
    text: "Ruled pages for notes, sketches and drawings, kept alongside the course.",
    pages: ["belongs-to", "notes"],
  },
  {
    title: "A puzzle every week",
    text: "Riddles, a crossword, sudoku, matchstick and logic puzzles — and a chess problem to finish.",
    pages: ["week-1", "crossword", "sudoku"],
  },
  {
    title: "A flipbook in the corner",
    text: "Riffle the right-hand pages and, in the lower corner, a boy sets birds free from a cage.",
    pages: ["notes"],
    flipbook: true,
  },
  {
    title: "The answers, hidden",
    text: "The key to every puzzle is a QR code, tucked onto one of the back pages.",
    pages: ["answer-key"],
  },
  {
    title: "Two themes, two trades",
    text: "Set in IIS Ahmedabad’s and IIS Mumbai’s own colours, with separate editions for Culinary at Ahmedabad and Retail at Mumbai.",
    pages: ["cover"],
  },
] as const;

/** The slider's two editions — each one's switch wears its campus colour
 *  (owner: a dark blue circle for Ahmedabad, a teal one for Mumbai). */
export const TATA_HANDBOOK_EDITIONS = [
  { id: "iisa", label: "IIS Ahmedabad", colour: TATA_GUIDELINES.iisa.colours[0].hex },
  { id: "iism", label: "IIS Mumbai", colour: TATA_GUIDELINES.iism.colours[1].hex },
] as const;

/** The artwork that closes band 03 — a welder and a welding robot at the
 *  same seam, in the page's blue spray and circuit geometry (owner,
 *  2026-10-04). A cut-out; trimmed to its ink and scaled to 2000 wide. */
export const TATA_HANDBOOK_ART = { src: `${CAMPUS}/welding-band.webp`, w: 2000, h: 667 };

/** Band 03's flipbook, told in the middle of two columns (owner, 2026-10-05):
 *  the drawing sits between them and the text gives way as the birds fly out
 *  (FlipbookFlow). What the copy describes is what the frames show — the boy,
 *  then the cage, then the birds, each inking in from a scatter of grey.
 *  ⚠ Keep it to the drawing: no course length (see TATA_HANDBOOK). */
export const TATA_HANDBOOK_FLIPBOOK_COPY = {
  kicker: "A flipbook in the corner",
  columns: [
    [
      "Every right-hand page of the handbook, from the first week on, carries one small drawing in its lower corner. On its own each is easy to miss — a figure in the margin of a page of notes, or beside the week’s puzzle. Riffle the pages under a thumb and they move.",
      "A boy arrives first, as a scatter of dots that thickens, page by page, into a silhouette. He raises his arms. Above his head a birdcage gathers out of the same faint grain until it is drawn in full, held up to the sky.",
      "Each drawing is small enough to sit beneath a page of notes without crowding it, and quiet enough to be passed over — until a trainee, idly turning pages, catches one moving.",
    ],
    [
      "Then a bird leaves it. Another follows, and another, each one a grey ghost before it settles into black — until a line of them climbs away from the cage, up and out across the corner of the page.",
      "By the last pages the boy still holds the cage up high, and the birds have reached the very edge of the corner, as if one more page would see them gone.",
      "Nothing in the handbook points to it. It was drawn to be found, a frame at a time, by anyone in the habit of turning pages — a small reward for that habit, and a picture of what the course is for: an open door, and somewhere to fly.",
    ],
  ],
} as const;

/* ── 04–08: the work, medium by medium (owner, 2026-10-04) ────────────────
 * Mockups, Print, the work installed, the camera and the screens — each its
 * own band. ⚠ Kept professional and general, as the handbook is: what the
 * work was, not what the institute is.
 * ⚠ Since 2026-10-05 every one of them lays ALL its work open in about a
 * screen (the owner: "show all my work in the minimal amount of scrolls"),
 * and the six rooms behind cards that used to follow them are gone — 08 holds
 * the screens, the one thing only the rooms had. */

export const TATA_MOCKUPS_BAND: TataBand = {
  number: "04",
  kicker: "Mockups",
  headline: ["Staged before", "it was made."],
  body: "Before anything went to print or production, it was staged in place — signage and billboards, gates and glass, flags, caps, T-shirts and vehicles — in each of the three themes.",
};

export const TATA_PRINT_BAND: TataBand = {
  number: "05",
  kicker: "Print",
  headline: ["From the hand", "to the wall."],
  body: "Ink on every surface the institute owns — a calling card in the hand, a fifteen-foot board on the wall, and the whole system in between.",
};

export const TATA_REALITY_BAND: TataBand = {
  number: "06",
  kicker: "Mockups to reality",
  headline: ["From screen", "to campus."],
  body: "The same work, photographed where it now stands — standees beside their machines, posters on the corridor walls, quotations in the halls — each with its design inset, where the archive holds one.",
};

export const TATA_PHOTO_BAND: TataBand = {
  number: "07",
  kicker: "Photo / Videography, Editing",
  headline: ["The campus,", "on camera."],
  body: "Alongside the design, the camera: covering what happens at the institute, and cutting it into films in the same three visual themes as everything else.",
};

/** Band 07's aspects, in the owner's order. `photos` names a key of
 *  TATA_PHOTO_STORY (scripts/prepare-tata-photos.mjs); the video aspect shows
 *  the films instead.
 *  ⚠ No festival photographs were in the archive on 2026-10-04 — the aspect
 *  says it, and shows the event work it has. */
export const TATA_PHOTO_ASPECTS = [
  {
    id: "events",
    title: "Events & celebrations",
    text: "Professional events — leadership dialogues, conclaves and guest visits — and the campus’s own festival celebrations.",
    photos: "events",
  },
  {
    id: "interviews",
    title: "Interviews",
    text: "Industry professionals and trainees on camera, for post-skilling testimonials.",
    photos: "interviews",
  },
  {
    id: "visits",
    title: "Industry visits",
    text: "Trainees out in industry, covered on their visits.",
    photos: "visits",
  },
  {
    id: "campus-life",
    title: "Campus life",
    text: "Daily life on campus, and the journeys of trainees and trainers through their courses.",
    photos: "campus-life",
  },
  {
    id: "birds",
    title: "Birds",
    text: "Bird photography — kites, ibis and crows, on the long lens.",
    photos: "birds",
  },
  {
    id: "video",
    title: "Video & editing",
    text: "Films cut from the footage on Envato templates, with high-quality typographic effects — each one customised to the three visual themes: Tata IIS, IIS Ahmedabad and IIS Mumbai.",
  },
] as const;

/** The films the video aspect plays — the catalogue's own files and captions. */
const FILMS = "/content/clients/tata-iis/catalogue/Films";
export const TATA_FILMS = [
  { id: "skills-conclave-2025", title: "Skills Conclave 2025", note: "Event film" },
  { id: "one-of-one-msde", title: "One of One", note: "Campus film" },
  { id: "jio-hotstar-spot", title: "JioHotstar spot", note: "20-second broadcast cut" },
  { id: "additive-manufacturing-timelapse", title: "Additive manufacturing", note: "Lab time-lapse", portrait: true },
  { id: "tata-iis-logo-render", title: "The wordmark, in motion", note: "Logo render" },
].map((f) => ({ ...f, src: `${FILMS}/${f.id}.mp4`, poster: `${FILMS}/${f.id}.jpg` }));

/** Band 08 — the brand on screen. Every claim in the paragraph is the
 *  catalogue's own description of its folder: Socials & Screens ("one
 *  grammar, spoken in three voices"), Website Banners ("masthead artwork for
 *  the institute's own pages"), Presentations ("the placement deck"). */
export const TATA_DIGITAL_BAND: TataBand = {
  number: "08",
  kicker: "Digital",
  headline: ["On every", "screen."],
  body: "The same system online: a social grid in three voices, mastheads for the institute’s own pages, and the placement deck.",
};

/** 08's last line — the two rooms with no files on the site yet, named so the
 *  page still accounts for them. The lists are TATA_SECTIONS'. */
export const TATA_ALSO_NOTE = "Files to follow";

/** 08's AI Solutions, shown (owner, 2026-10-05): the two tools with
 *  screenshots (TATA_TOOL_SHOTS), each in a turning app frame (ToolsWall).
 *  Labels match TATA_SECTIONS' "ai-solutions" items; the one with no shots
 *  (the screensaver) stays named in the margin.
 *  ⚠ H3LEN's site is behind Netlify's private-site sign-in as of 2026-10-05 —
 *  the link works only for invited accounts until that is switched off. */
export const TATA_TOOLS = [
  {
    id: "cerci",
    label: "Cerci — Certificate Maker",
    text: "An offline desktop app that sets each trainee’s details onto the approved certificate artwork, untouched: three institute themes, brand templates, and a whole batch from one spreadsheet.",
  },
  {
    id: "h3len",
    label: "H3LEN — Hyper 3D Landscape Environment",
    text: "The Ahmedabad campus as a photoreal 3D capture, built from drone footage by Gaussian splatting — fly it with the mouse and keys, or take the guided tour.",
    href: "https://h3len.netlify.app/",
  },
] as const;

export const TATA_WORK_BAND: TataBand = {
  // ⚠ 04 until 2026-09-28. Brand DNA folded into 02, so everything after it
  // moved up one; the numbers are hand-set, not derived. Back to 04 on
  // 2026-10-04, when the handbook came in as 03, and 08 the same day, when
  // Mockups, Print, Mockups to reality and the camera took 04–07. 09 since
  // 2026-10-05: the six rooms it opened onto went (their work is laid open
  // in 04–08), the showcase over them with it, and what is left is the
  // owner's account of the job — closing the page, beside the way to get in
  // touch.
  number: "09",
  kicker: "The role",
  headline: ["From identity", "to impact."],
  // The band's paragraph is TATA_WORK_INTRO (tataSections.ts) — the owner's own
  // account of the job, already written and already true. Nothing here.
  body: "",
};

/** The way to get in touch, inside band 09 since 2026-10-05 (it was a band
 *  of its own, 09, until then). */
export const TATA_COLLABORATE = {
  kicker: "Let's build what's next",
  headline: "Collaborate.",
  body:
    "Open to collaborations, commissions and the odd experiment — brand systems, campaigns, and the tools that keep them running.",
};

/** The hero's index of the bands — each one a link down to its band
 *  (2026-10-05). It listed the six rooms until the rooms went. */
export const TATA_INDEX = [
  { href: "#brand", label: "Brand" },
  { href: "#handbook", label: "Handbook" },
  { href: "#mockups", label: "Mockups" },
  { href: "#print", label: "Print" },
  { href: "#reality", label: "Mockups to reality" },
  { href: "#camera", label: "Photo / Videography" },
  { href: "#digital", label: "Digital" },
] as const;
