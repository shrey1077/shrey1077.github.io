/**
 * Publications — the written work, and the one room that can be read rather
 * than looked at.
 *
 * The homepage's Publications pin opened a placeholder until 2026-08-20, when
 * the owner supplied `UID/Shortlisted for Claude/Ebooks/` and asked for this
 * room to be built from it, plus the NewsMobile bylines. Two more titles moved
 * here from the UID page's retired "The Books" project, so every document the
 * degree produced is readable in one place instead of shown as a cover.
 *
 * Two shapes live here:
 *   • `pages`  — a document rendered page by page into
 *                `public/content/publications/<slug>/NN.webp`, read at
 *                `/publications/<slug>`. Page COUNT is read off the filesystem,
 *                never stated here, so a re-run of the pipeline can't lie.
 *   • `body`   — a short piece held as text, set in the reader directly.
 *   • `href`   — an entry that lives somewhere else on the site entirely
 *                (the NewsMobile bylines are a client page, not a document).
 *
 * ⚠ PRIVACY — flagged for the owner's decision, not resolved here.
 * `pethapur` names a living craftsman (Prahalad Bhai Kanulal Prajapati, 70) and
 * states his eyesight condition and his daily wage. The `ethnography` book's
 * pages name their host and guide in Pethapur and the mentor who taught the
 * module; `nirvaan` credits three named collaborators. All were written as
 * academic or blog work for publication, and all are shipping — but deleting
 * any entry here is a one-line change, and `pethapur` can lose the name alone
 * by editing its `body`.
 *
 * ⚠ Nothing PDF ships; see scripts/prepare-uid-shortlist.mjs.
 */

export interface Publication {
  /** URL slug — the `[slug]` of `/publications/<slug>`, and the folder name. */
  slug: string;
  title: string;
  /** The line under the title — what kind of document this is. */
  kind: string;
  /** Optional second line, the document's own subtitle. */
  subtitle?: string;
  year: string;
  /** Where it was written. */
  origin: string;
  /** The card blurb and the reader's standfirst. */
  blurb: string;
  accent: string;
  /** Set when the document has rendered pages under its slug folder. */
  pages?: true;
  /** Set instead of `pages` for a short piece carried as text. */
  body?: readonly string[];
  /** Set instead of both when the entry lives elsewhere on the site. */
  href?: string;
  /** Named credits, where the work was not solely the owner's. */
  credit?: string;
}

export const PUBLICATIONS: readonly Publication[] = [
  {
    slug: "ethnography",
    title: "Ethnography",
    kind: "Field study",
    subtitle: "The block printers of Pethapur",
    year: "2019",
    origin: "UID · M.Des Visual Communication",
    blurb:
      "What a design student is actually doing when they call it research. The method first — emic and etic, the rules of a field visit, the case studies — and then the field itself: Pethapur, a town near Gandhinagar whose carvers cut printing blocks out of teak by hand, and whose craft is running out of people willing to inherit it.",
    accent: "#8a5a2b",
    pages: true,
  },
  {
    slug: "pethapur",
    title: "Are There Any Takers?",
    kind: "Blog entry",
    subtitle: "The challenges facing Pethapur's craftsmen",
    year: "2019",
    origin: "Written alongside the ethnography field visit",
    blurb:
      "The short companion piece to the field study — the same town, argued rather than documented. What a lifetime of precision costs the person doing it, and who is left to do it next.",
    accent: "#a04a2f",
    body: [
      "Pethapur is a small town near Gandhinagar in Gujarat, famous worldwide for its exquisite art of block printing. This diminishing art form is famous because of the complexity and precision of the amazing design patterns that are obtained from the blocks they manufacture themselves.",
      "The real hard work is done by the brilliant skilled craftsmen who create the wooden blocks out of “Sagwan” wood, also known as teakwood, which is used because of its internal structure that allows easy carving through the wooden blocks with great accuracy and detail.",
      "A variety of tools that evolved through generations of precision art making are used, and one can still find examples of ancient machinery still existing in their workshops, such as the motifs passed on from their fathers. Moreover, they maintain files of all their works to pass on to their next generations — but are there any takers?",
      "As this art form requires a lot of skill, and it takes a lot of time and investment to train the younger artist, who also remains severely underpaid for a long time, it is getting harder and harder to find new and creative artists. The next generation of the community is preferring high-paid jobs in the corporate sector instead.",
      "Seventy years old, Prahalad Bhai Kanulal Prajapati is one of the most experienced artists of the block carving and printing art that I had the pleasure to have a conversation with. He has given more than 50 years of his life to carving thousands of motifs, perfecting his skill day after day. The high level of detailing over a small portion of a wooden block requires a lot of concentration from the carvers and it takes a toll on their vision in the long run; likewise Prahalad Bhai, who is suffering from cataract and complained of diminishing light in his eyes while making a perfect cut in the wooden block with his special rope tool. The daily wage for an artist as experienced as Prahalad Bhai is not worthy of his talent and capability — earning less than 500 rupees a day, and that too depending on the work demands. Imagine the plight of a young and inexperienced artist.",
      "The women of the community are restricted from entering the workshops due to a kind of social backwardness that prevails throughout most villages and towns of India, including Pethapur. Men reserve the right to earn for the family and they hardly tolerate women entering their workspace. Times are changing fast, and sooner or later this art form will actually be dependent on its women to survive — the same women who are restricted to taking care of children while finishing the daily chores at home. Slowly but steadily, people are getting more aware of the respect that their female counterparts deserve.",
      "In the end it is justified to assume that this art form needs support from the people and the government to survive, and involving the youth is going to be a huge challenge if an external supporting hand is not provided at the earliest.",
    ],
  },
  {
    slug: "food-distribution",
    title: "Food Distribution during Natural Disasters",
    kind: "Colloquium paper",
    subtitle: "Takeaways for the pandemic preparations",
    year: "2020",
    origin: "UID · Elective colloquium",
    blurb:
      "Written as the pandemic arrived, and asking the obvious question early: disaster relief has spent decades learning how to feed people when the supply chain breaks, so what does that literature already know that a pandemic response is about to need? Nutrition, procurement, storage, and the resumption of normalcy.",
    accent: "#2f6f8f",
    pages: true,
  },
  {
    slug: "design-for-print",
    title: "Design for Print",
    kind: "Process book",
    subtitle: "Making “The Extincts: Countdown to Apocalypse”",
    year: "2020",
    origin: "UID · M.Des Visual Communication",
    blurb:
      "The book about making the book. Research into the story, plots and characters, the typography, the cover and jacket, and then the physical business of printing and binding the first copies — the whole route from an idea about extinction to an object you can hold.",
    accent: "#3f5f3f",
    pages: true,
  },
  {
    slug: "packaging-zine",
    title: "Packaging",
    kind: "Documentation zine",
    subtitle: "Farm Stacks Hydroponics · The Griffin Muffin Co.",
    year: "2019",
    origin: "UID · M.Des Visual Communication",
    blurb:
      "Two packaging briefs documented end to end: a stacking net for hydroponic produce, worked out in card before it was ever drawn, and a muffin box that doubles as a comic strip. The excerpt on the UID page is pages 13–16 of this.",
    accent: "#3f8f3f",
    pages: true,
  },
  {
    slug: "mycoveda-app",
    title: "Mycoveda",
    kind: "App documentation",
    subtitle: "The mushroom app",
    year: "2020",
    origin: "UID · M.Des Visual Communication",
    blurb:
      "An app for mushroom foraging and identification, documented as a design system rather than a set of screens: theme, colour, the mark, the typeface, then the process and the prototype.",
    accent: "#5c7c3a",
    pages: true,
  },
  {
    slug: "nirvaan",
    title: "Nirvaan — Body and Space",
    kind: "Performance record",
    year: "2019",
    origin: "UID · M.Des Visual Communication",
    credit: "With Akash Chaugule, Neelam Walia and Shreya Rungta",
    blurb:
      "The written record of the Nirvaan performance — the songs, their classical sources and the contemporary reading given to them. The identity and campaign that came out of it are on the UID page.",
    accent: "#d1642a",
    pages: true,
  },
  {
    // Not a document — a body of writing that lives on its own client page.
    slug: "newsmobile",
    title: "NewsMobile",
    kind: "Weekly bylines",
    year: "2021–2022",
    origin: "NewsMobile · Digital news",
    blurb:
      "A weekly byline on the desk at NewsMobile — many articles across environment, sport and politics, written to the rhythm of a newsroom rather than a studio.",
    accent: "#c0392b",
    href: "/clients/newsmobile",
  },
] as const;

export function publicationBySlug(slug: string): Publication | undefined {
  return PUBLICATIONS.find((p) => p.slug === slug);
}

/** The entries that are documents on this site, i.e. have their own reader. */
export const READABLE_PUBLICATIONS = PUBLICATIONS.filter((p) => !p.href);
