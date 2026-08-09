# 03 — BRAIN VISION (artistic source of truth)

The intended final homepage. Describes the goal, not the implementation. Keyword
set: museum · calm · confident · editorial · architectural · premium · precise ·
white space. Avoid: tech-demo, gaming, over-animation, heavy glow, visual noise.

## The idea
The homepage is a living mind. A top-view anatomical brain sits centered on pure
white. It is the operating system of the whole portfolio — every project
originates from it and returns to it. A visitor should be able to watch it for a
full minute without clicking and feel it is *thinking*. Nothing ever feels
paused; every frame is slightly different.

## Initial state (idle)
Both hemispheres already alive. The brain is a premium sculptural object —
museum lighting, soft real contact shadow, subtle rim. It breathes: tiny idle
motion, tiny lighting variation, very restrained. Centered, ~⅓ of viewport
height, never moves vertically.

- **Left hemisphere = logic.** Monochrome. Fine black ink / technical
  crevice linework on a subtle paper surface. Architectural, engineering-drawing
  feel.
- **Right hemisphere = creativity.** The same linework, with soft colour already
  living beneath it. Colour is present in idle — it does not "start".

## Living state (continuous)
**Logical Flow (left).** A quiet technical environment continuously emits
subtle activity out of the folds: circuit traces, blueprint/construction lines,
tiny node graphs, coordinate grids, mathematical notation, small code fragments.
Everything slowly appears and disappears; never an obvious repeat; never random
noise — each mark is legible engineering.

**Creative Flow (right).** Colour continuously escapes the folds — never begins,
never ends, never obviously loops. Think breathing, not fireworks. **Beneath the
colour: a hidden sketchbook** — fine ink scribbles, abstract loops, organic brush
marks, tiny splashes, doodles, creative symbols — partially concealed so the
viewer discovers new details each visit.

## Neuron events (every 5–8 s, one side at a time)
The signature moment. A thought originates from *inside* the brain and surfaces.
- **Logical:** brain pulse → a circuit grows → fast technical scribble →
  handwritten logical thought → pause → letter-by-letter flip into clean sans
  (Helvetica) → fade. E.g. "Everything starts with a system." · "Find the
  pattern." · "Can this be simpler?" · "Every pixel has a purpose."
- **Creative:** tiny colour pulse → looping ink scribble → organic flowing path
  → handwritten creative thought → pause → paper-flip into Helvetica → dissolve
  back into colour. E.g. "What if this felt lighter?" · "Curiosity first." ·
  "Sketch before deciding." · "Design should disappear."
Every scribble is unique, full of loops and personality; thoughts never repeat
obviously.

## Typography behaviour
Thought becoming design: handwritten thought → writing animation → brief pause →
letter-by-letter paper flip → final structured typography → fade. Must feel
handcrafted, never mechanical (uneven per-letter timing, slight rotation).

## Lighting & materials
Soft studio lighting; premium soft contact shadow; very subtle rim; pure white
background; no gradients, no decorative effects. The brain reads as a sculptural
museum object, not a generic 3D asset. Left material = ink-on-paper monochrome;
right material = colour beneath sketch lines (no paint-flow simulation yet — only
the artistic direction).

## Interaction
Mouse → gentle damped follow. Hover left nav → left hemisphere responds (tiny
pulse + tiny lighting shift). Hover right nav → right responds. Scroll begins →
the brain subtly "awakens". Nothing exaggerated. Alive, not animated.

## Composition
Centered brain; generous white space; identity mark top-left ("SS" + name/role);
a quiet "Move to explore" cue; the first thought "EVERY PROJECT BEGINS AS A
THOUGHT" reads as a wall label beneath the sculpture; navigation integrated with
the brain rather than surrounding it. Editorial balance, museum restraint.

## Explicitly deferred (do NOT build unless requested)
GPU fluid paint-flow, procedural circuit *generation as shader*, neuron *particle*
systems, the full procedural idea engine, advanced shader experiments, memory
traces. The homepage must feel complete even without them.
