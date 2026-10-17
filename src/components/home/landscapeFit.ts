/**
 * landscapeFit — the viewport rule behind LandscapeLaptop, kept out of the
 * client module so the (server) home page can inline it as FIT_SCRIPT and run
 * it before the first paint. See LandscapeLaptop for the why.
 */

/** The device's own viewport (layout.tsx's). */
export const DEVICE_VIEWPORT = "width=device-width, initial-scale=1";

/** A phone held sideways gets a laptop's width (laid-out height ≥ 640 px,
 *  its own proportions kept); anything else, the device's own. Refers to
 *  globals only, so it can also run as a string. */
export function fitViewport() {
  // EVERY viewport tag: as the page starts, the framework adds its own after
  // the one in the HTML, and the last one is the one that counts.
  const tags = document.querySelectorAll('meta[name="viewport"]');
  if (!tags.length) return;
  const short = Math.min(screen.width, screen.height);
  const long = Math.max(screen.width, screen.height);
  const phone = short <= 520 && window.matchMedia("(pointer: coarse)").matches;
  const o = screen.orientation && screen.orientation.type;
  const landscape = o ? o.indexOf("landscape") === 0 : typeof window.orientation === "number" ? Math.abs(window.orientation) === 90 : innerWidth > innerHeight;
  const want = phone && landscape ? "width=" + Math.max(1280, Math.round((640 * long) / short)) : "width=device-width, initial-scale=1";
  for (let i = 0; i < tags.length; i++) if (tags[i].getAttribute("content") !== want) tags[i].setAttribute("content", want);
}

export const FIT_SCRIPT = `(${fitViewport.toString()})();`;
