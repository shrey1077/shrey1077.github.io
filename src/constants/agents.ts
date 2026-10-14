/**
 * Agents — the AI identities the owner is building for personal use, shown
 * in the AI Projects room's "Agents" folder (owner, 2026-10-15).
 *
 * ⚠ THE WORDS COME FROM EACH PROJECT'S OWN FILES, condensed to about a hundred
 * words: Alfred from D:/Projects/Alfred (README, persona.md); Donna from
 * D:/Projects/Shrey/.claude/agents/donna.md; Ray from D:/Projects/hitchcock
 * (README — Ray is Hitchcock's brief desk); Andy from
 * D:/Projects/Shrey/.claude/agents/ca-advisor.md (the owner: "Andy is
 * Chartered Accountant ai bot"). Dr. House has no folder on this machine —
 * the owner's word was "a doctor AI bot", so his intro is a DRAFT for the
 * owner to correct.
 * ⚠ Nothing personal: these are public pages. No health, money or calendar
 * details of the owner's own — only what each identity is and does.
 */

export interface Agent {
  id: string;
  name: string;
  /** What it is, in a few words. */
  role: string;
  intro: string;
  /** Set while the words are a placeholder the owner hasn't confirmed. */
  draft?: true;
}

export const AGENTS: readonly Agent[] = [
  {
    id: "alfred",
    name: "Alfred",
    role: "The hub · personal agent for Windows",
    intro:
      "Alfred is the voice-first personal agent at the centre of the system, and the hub every other identity reports to. Calm, precise and quietly competent, with a dry British wit used sparingly: a butler who happens to be an excellent engineer and creative producer. Today he works through a console: opening apps, finding files, reading the weather, always aware of the local time. Every action passes his Protocols first, tier by tier: some run on their own, some wait for a yes, some never run at all. Coming next: a voice, a night shift for long jobs, lasting memory, and a mesh of agents.",
  },
  {
    id: "donna",
    name: "Donna",
    role: "Executive assistant · personal secretary",
    intro:
      "Donna is one step ahead, always. She knows what is on the calendar, who is waiting on a reply and who owes one, which of forty emails actually matters, and what was promised last Tuesday and forgotten since. She plans the day in short, focused sessions, nudges at wake-up and meal times, remembers birthdays and occasions, finds events and cafés nearby, suggests outfits, drafts social posts, and handles travel and documents. Her temper is earned: sarcastic when you are running late, sweet when you are on time, dry and direct the rest of the day. She doesn't ask how she can help; she says what needs doing.",
  },
  {
    id: "ray",
    name: "Ray",
    role: "The brief desk · AI filmmaking",
    intro:
      "Ray is the brief desk of Hitchcock, the AI film director-producer. Hand Ray a brief and it proposes a workflow; change it as often as you like, then approve it. Ray writes the prompts for Leonardo, Google Flow, Lemonpeel, free tools or local models, one shot at a time or as a whole sheet, each in the dialect of the model that runs it. Upload what was generated, star the best, and Ray studies it before writing the next prompt. Every prompt is kept with its versions, the films it researched are on record, and its brain holds the course core alongside everything learned since.",
  },
  {
    id: "andy",
    name: "Andy",
    role: "Chartered accountant · financial advisor",
    intro:
      "Andy is a personal chartered accountant and financial advisor, built for Indian tax and personal finance. Old regime or new, which ITR form, reconciling Form 16 with AIS and 26AS, advance-tax instalments, capital gains, and what an income-tax notice actually means, with the reply drafted. Beyond tax: goals turned into SIPs, retirement corpus, insurance and a financial health scorecard. Andy computes every figure with tools rather than in its head, shows the inputs, searches for anything that may have changed and cites it. It plans taxes and never helps evade them, and says when a practising CA should take over.",
  },
  {
    id: "dr-house",
    name: "Dr. House",
    role: "A doctor AI · diagnostic thinking",
    draft: true,
    intro:
      "Dr. House is a doctor AI, named for television's most stubborn diagnostician and his love of a differential. Describe what is going on and he asks the questions a careful clinician would: when it started, what makes it better or worse, what else is happening alongside it. Then he lays out what could explain it, what would tell those possibilities apart, and what to watch for. He is blunt about one thing above all: when something needs a real doctor, and how soon. A thinking partner for understanding a problem, never a replacement for medical care.",
  },
];
