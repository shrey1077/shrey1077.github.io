/**
 * The agent system — the owner's personal AI automation system as a tree, for
 * the right side's second slide (owner, 2026-10-26: "I need the right side
 * second slide to be AI Agents, and it should show a clickable workflow tree,
 * with connections to each other, and displaying hierarchy. Suggest more
 * required agents to completely finish my personalized AI automation
 * system").
 *
 * ⚠ WHAT IS BUILT is told from each project's own files (as constants/
 * agents.ts already does for five of them): Alfred from D:/Projects/Alfred
 * (README: "the hub every other agent links to"; its Phase 4 registry),
 * Hitchcock and Ray from D:/Projects/hitchcock (README), Market Guru from
 * D:/Projects/Market Guru (CLAUDE.md: "Market Guru sells; Hitchcock makes"),
 * EditMAX from D:/Projects/EditMAX (AGENTS.md), the trainer from
 * D:/Projects/My Trainer app (trainer-agent.md). Donna, Andy and Dr. House
 * keep agents.ts's words.
 * ⚠ WHAT IS SUGGESTED is marked `suggested` and drawn dashed: the agents the
 * system still lacks, each placed under the one it would report to. Render
 * Scout is the example Alfred's own registry README gives; the rest are
 * Claude's suggestions for the owner to keep or strike.
 * ⚠ Nothing personal (public page): no health, money or calendar details of
 * the owner's own — what each agent is and does.
 */

import { AGENTS } from "@/constants/agents";

export type AgentStatus = "active" | "draft" | "suggested";

export interface SystemAgent {
  id: string;
  name: string;
  /** Its post in the system, as the tree names it — the name itself only in
   *  its card, once picked (owner, 2026-10-26: "show names of agents in
   *  description after clicking only, in the tree write their designation or
   *  position, donna will be Personal secretary, so on"). */
  position: string;
  /** Who it reports to; the hub has none. */
  parent?: string;
  role: string;
  text: string;
  status: AgentStatus;
  /** Agents it works with across the tree (drawn as a dashed link). */
  links?: { to: string; label: string }[];
}

const intro = (id: string) => AGENTS.find((a) => a.id === id)?.intro ?? "";

export const AGENT_SYSTEM: readonly SystemAgent[] = [
  {
    id: "alfred",
    position: "Chief of Staff",
    name: "Alfred",
    role: "The hub · personal agent for Windows",
    text: intro("alfred"),
    status: "active",
  },
  // ── Reporting to Alfred.
  { id: "donna", position: "Personal Secretary", name: "Donna", parent: "alfred", role: "Executive assistant · personal secretary", text: intro("donna"), status: "active" },
  { id: "andy", position: "Chartered Accountant", name: "Andy", parent: "alfred", role: "Chartered accountant · financial advisor", text: intro("andy"), status: "active" },
  { id: "dr-house", position: "Doctor", name: "Dr. House", parent: "alfred", role: "A doctor AI · diagnostic thinking", text: intro("dr-house"), status: "draft" },
  {
    id: "hitchcock",
    position: "Director-Producer",
    name: "Hitchcock",
    parent: "alfred",
    role: "AI film director-producer",
    text: "Hitchcock interviews you about the project, plans the film like a director and budgets it like a producer: concept, script, asset bible, production table, budget. It writes every prompt in the dialect of the model that runs it, generates what can run online, checks the quality and hands over a clean edit package. It stops for a yes at every gate that costs money, and its knowledge base, Hitchcock Brain, holds the AI filmmaking course alongside a feed of what has changed since, kept current with updates the owner approves.",
    status: "active",
    links: [{ to: "market-guru", label: "Market Guru sells what Hitchcock makes" }],
  },
  {
    id: "market-guru",
    position: "Sales & Marketing",
    name: "Market Guru",
    parent: "alfred",
    role: "Client acquisition · sales and marketing",
    text: "Market Guru is the sales-and-marketing producer. It finds clients, writes the outreach, preps the calls, closes the deals and keeps the clients, and runs two product lines on the side: merchandise made from the owner's artworks, and a colouring-book series. It works from a sales playbook, shows its plans as tables, and never sounds desperate: three good recurring clients is the whole goal. It drafts everything; nothing leaves the building without the owner's yes. It sells; Hitchcock makes.",
    status: "active",
  },
  // ── Under Hitchcock.
  { id: "ray", position: "Prompt Writer", name: "Ray", parent: "hitchcock", role: "The brief desk · prompts", text: intro("ray"), status: "active" },
  {
    id: "editmax",
    position: "Video Editor",
    name: "EditMAX",
    parent: "hitchcock",
    role: "The edit pipeline",
    text: "EditMAX takes a recorded take to a finished video: the pauses cut out frame-exact, music and sound effects laid in, the intro, lower thirds and outro rendered as motion graphics, and the whole assembled and exported, each video one folder driven by a single edit file.",
    status: "active",
  },
  {
    id: "render-scout",
    position: "Render Tracker",
    name: "Render Scout",
    parent: "hitchcock",
    role: "Suggested · render tracker",
    text: "Watches every generation job across the video and image models, downloads each finished take into the right shot folder, names it, and tells Hitchcock what is ready and what failed, so no take is waited on or lost. (Alfred's own agent registry already gives it as its example.)",
    status: "suggested",
  },
  // ── Under Market Guru.
  {
    id: "social-desk",
    position: "Social Media",
    name: "Social Desk",
    parent: "market-guru",
    role: "Suggested · publishing",
    text: "Cuts every finished film and project into posts for each platform, keeps the content calendar, schedules what Market Guru drafts once the owner approves it, and reports back on what landed and what didn't.",
    status: "suggested",
  },
  {
    id: "merch-ops",
    position: "Merch Manager",
    name: "Merch Ops",
    parent: "market-guru",
    role: "Suggested · shop and print-on-demand",
    text: "Runs the merchandise and colouring-book lines end to end: product listings, mockups from the artworks, print-on-demand orders, stock of the digital products, and the monthly sales sheet.",
    status: "suggested",
  },
  // ── Under Andy.
  {
    id: "ledger",
    position: "Accounts Clerk",
    name: "Ledger",
    parent: "andy",
    role: "Suggested · invoices and payments",
    text: "Turns a closed deal into an invoice, chases the advance and the balance, files every receipt and expense as it arrives, and hands Andy clean books at the end of each month and quarter.",
    status: "suggested",
  },
  // ── Under Dr. House.
  {
    id: "trainer",
    position: "Personal Trainer",
    name: "Trainer",
    parent: "dr-house",
    role: "Personal trainer · habit coach",
    text: "A practical, supportive habit coach: small, achievable steps towards fitness and regular meals and sleep, asked about in a few short questions at a time. It never shames and never promises results, and it hands anything medical to Dr. House.",
    status: "active",
  },
  // ── Reporting straight to Alfred.
  {
    id: "brand-desk",
    position: "Brand Manager",
    name: "Brand Desk",
    parent: "alfred",
    role: "Suggested · brand systems",
    text: "The design studio's own agent: it keeps every client's brand kit, logo files, colours and type in one place, sets out guideline documents, exports every size a campaign needs, and checks new work against the rulebook before it goes out.",
    status: "suggested",
  },
  {
    id: "archivist",
    position: "Archivist",
    name: "Archivist",
    parent: "alfred",
    role: "Suggested · files and portfolio",
    text: "Files every project as it closes, finds any asset on request, and keeps the portfolio current: new work, case studies and the resume, drafted for the owner's yes.",
    status: "suggested",
  },
  {
    id: "sentinel",
    position: "Security & Spend",
    name: "Sentinel",
    parent: "alfred",
    role: "Suggested · backups, keys and spend",
    text: "Backs up the projects nightly, watches what each agent spends on its models and tools against a monthly budget, and keeps the keys and permissions every agent holds to the least it needs.",
    status: "suggested",
  },
];
