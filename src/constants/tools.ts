/**
 * The tool stack, as marks — the landing's Tools fact and the footer both read
 * this (owner, 2026-10-02). The files are dark grey on transparency, made by
 * scripts/prepare-tool-logos.mjs from each brand's own artwork.
 *
 * `aspect` is width ÷ height of the file's ink box, so every mark can be set to
 * one HEIGHT and keep its own width — the wordmark (Flow) runs wide, the rest
 * are near-square.
 */

const DIR = "/content/tools";

export interface Tool {
  id: string;
  name: string;
  src: string;
  aspect: number;
  /** Optical size: the mark's height as a share of the row's. A wordmark is
   *  ink from edge to edge where an icon sits inside its own padding, so at
   *  one height the word shouts; this brings it back into line. */
  scale?: number;
}

export const TOOLS: Tool[] = [
  { id: "adobe-cc", name: "Adobe Creative Cloud", src: `${DIR}/adobe-cc.svg`, aspect: 1 },
  { id: "claude", name: "Claude", src: `${DIR}/claude.svg`, aspect: 1 },
  { id: "google-flow", name: "Google Flow", src: `${DIR}/google-flow.svg`, aspect: 448 / 172, scale: 0.65 }, // smaller, owner 2026-10-03
  { id: "gemini", name: "Gemini", src: `${DIR}/gemini.svg`, aspect: 1 },
  { id: "chatgpt", name: "ChatGPT", src: `${DIR}/chatgpt.svg`, aspect: 1 },
  { id: "postshot", name: "Postshot", src: `${DIR}/postshot.png`, aspect: 151 / 128 },
  { id: "leonardo", name: "Leonardo AI", src: `${DIR}/leonardo.png`, aspect: 112 / 128 },
  { id: "lemonpeel", name: "Lemonpeel", src: `${DIR}/lemonpeel.png`, aspect: 122 / 128 },
  { id: "github", name: "GitHub", src: `${DIR}/github.svg`, aspect: 1 },
];
