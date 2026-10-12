# Performance report — shrey107.com

*Step 2 of the improvement plan. Measured 2026-10-12 on the site exactly as it is live (commit `a4a6a28`, tag `checkpoint-2026-10-12`), built for production and served locally. Nothing on the site was changed for this report.*

**How it was measured**
- Google Lighthouse (phone and laptop settings, empty cache) on the home page and the Tata IIS, Azoth and UID pages.
- A scripted Chrome that scrolls through every layer of the home page, recording dropped frames and freezes, on a laptop and on a phone slowed to a quarter of its speed.
- A phone first-load test on a normal 4G-speed connection.
- A walk through the code for every video, every image over 300 KB, every font and every animation loop.

---

## The headline numbers

| Page | Device | Speed score | Downloaded on first visit | Files | Main picture/text appears |
|---|---|---|---|---|---|
| Home | Phone | 61 / 100 | **15.4 MB** | 129 | **28.9 s** (Lighthouse's slow-4G phone) |
| Home | Laptop | 75 / 100 | 14.3 MB | 124 | 4.0 s |
| Tata IIS | Phone | 74 | 3.2 MB | 70 | 12.8 s |
| Azoth | Phone / Laptop | 73 / 90 | 2.2 MB | 60 | 10.3 s / 2.1 s |
| UID | Phone / Laptop | 75 / 87 | 1.8 MB | 64 | 9.3 s / 2.5 s |

On a more ordinary phone connection (9 Mbps, phone-speed processor): your **name appears at 1.1 s, but your photo only at 7.0 s**. Before the photo can arrive, **84 other files** finish downloading.

What the home page downloads before you even scroll:

| What | Size | Needed on the first screen? |
|---|---|---|
| The brain video's 48 frames | ≈ 9.5 MB | No — the brain is on screen 2 |
| The circuit background video | 1.8 MB | Only a faint 8% background |
| Arts & Crafts tiles (8 pictures) | ≈ 2.0 MB | No — they're in a room 3–4 scrolls away |
| Projects board pictures | ≈ 0.7 MB | No |
| Fonts | 0.62 MB in 26 files | About 5 are |
| Code | 0.26 MB | Yes |
| **Your photo (the first screen's picture)** | 0.3 MB | **Yes — but it is queued behind all of the above** |

---

## The problems, and how I'd fix each one without changing what you see

Each fix only changes **when or how something downloads or runs**. Where a fix comes close to how something behaves, it says so and needs your OK.

### 1. Your photo waits behind everything else (the blank phone start) 🚩
- **Problem:** The colour half of the photo is set to "load later" (lazy) while its black-and-white half is set to "load first", so the picture can't show until the colour half arrives. On top of that, 84 other files are downloading at the same time.
- **Impact:** The photo appears at 7 s on a normal phone and 28.9 s in Lighthouse's slow test. This is the "blank for 4+ seconds".
- **Fix:** Mark both halves "load first". Together with fixes 2–5 below, the first screen would then download about 1.5 MB instead of 15 MB.
- **Looks:** Identical.

### 2. The brain video's 48 frames all download at the start 🚩
- **Problem:** All 48 frames (≈ 9.5 MB) load the moment the page opens, even though the brain only appears on screen 2.
- **Fix:** Load the frame the brain starts on as soon as the first screen is up, then the rest in the background in the order the sweep reaches them. By the time anyone scrolls to the brain, they're there.
- **Looks:** Identical. The brain sweeps exactly as now.

### 3. The circuit background video (1.8 MB) 🚩 *(confirmed)*
- **Problem:** It autoplays and is told to download in full straight away, so it competes with your photo from 0.2 s.
  - Two copies of it play at once in the left rooms.
  - The landing's copy keeps playing behind the rooms after you've left the landing.
- **Fix:**
  - Show the existing still frame (`circuit-bg-poster.jpg`) until the page has loaded, then start the video.
  - Pause each copy while it's off screen.
  - Re-compress it to about 400–600 KB.
- **Looks:**
  - Starting it later and pausing it off screen are invisible.
  - Re-compressing changes the file itself. It's shown at 8% strength behind a fade, so I don't expect any visible difference, but I'll show you a side-by-side before swapping it. **Needs your OK.**

### 4. Pictures for later rooms download at the start 🚩 *(confirmed)*
- **Problem:** All six rooms are built when the page opens (hidden), and the browser downloads their pictures straight away:
  - the Arts & Crafts tiles (including a 419 KB painting);
  - the Projects pictures;
  - the client and tool logos.
- **Fix:** Load a room's pictures only when you're one scroll away from it.
- **Looks:** Identical. They'll be ready before the room flies in.

### 5. Too many fonts 🚩 *(confirmed: 25–27 font files, about 620 KB, on every page)*
- **Problem:** Every font the whole site has ever used is told to download on every page.
  - **Never used anywhere:** Caveat Brush and Great Vibes.
  - **Used only on one client page,** but downloaded on the home page too: Playfair and Cinzel (Tata), Michroma and IBM Plex Mono (Azoth), Barlow (ABS, Azoth), Anton and Orbitron (client page settings), Fraunces (catalogue pages).
  - **What the home page actually needs:** Digibra, Juturu, Helvetica Condensed, Syne, Inter Tight and Tinos.
- **Fix:**
  - Stop loading the two unused fonts.
  - Give each page only its own fonts.
- **Looks:** The same fonts, in the same places. On the client pages this is also the main reason their main text appears late on phones (9–13 s).

### 6. The scroll freeze — found 🚩
- **Cause:** One scroll is meant to move exactly one slide, so after a scroll the page ignores further wheel movement until you pause. But the pause timer **restarts with every wheel tick**. If wheel ticks keep coming (a trackpad's long momentum glide, or someone scrolling continuously because nothing seems to happen), the page ignores all of them for as long as they keep coming.
- **Proof:** In the test, 6 seconds of continuous scrolling moved **one** slide. A 30-second freeze is simply 30 seconds of continued scrolling.
- **Fix:** Cap the lock. Once a flight has landed and a short moment has passed, a scroll that's still going moves on to the next slide.
- **Looks:** The flight, its timing and its pixel effect are unchanged; only how soon a continuing scroll gets its next slide changes. **This touches how scrolling responds, so it needs your OK.**

### 7. A stutter on phones near the end of the rooms
- **Problem:** When you reach the last room, the footer's formula stream starts up while still below the screen. It measures all 40 formulas in four sizes at once (0.63 s at 4× slowdown, about 0.16 s on a real phone), then draws every frame though nobody can see it yet.
- **Fix:** Start it only when the footer actually scrolls into view, prepare the formulas in spare moments, and pause it when it scrolls away.
- **Looks:** Identical.

### 8. The brain sweeps on screen 1, where it can't be seen
- **Problem:** On the photo slide the brain keeps sweeping behind the scenes. On phones, each new frame it reaches is unpacked on the main thread, which caused small hitches (8 of them in 1.5 s on the slowed phone).
- **Fix:** Run the sweep only while the brain's screen is showing or arriving, and unpack frames ahead of time, away from the main thread.
- **Looks:** Identical. The sweep looks the same when you arrive.

### 9. Other loops that keep running off screen
- **The code windows on the landing:** they keep typing behind the rooms. Fix: pause them when the landing isn't showing.
- **The Azoth page's moving hero:** it keeps animating after you've scrolled past it. Fix: pause it when it's off screen.
- **Looks:** Identical.

### 10. A stutter between Clients and Projects (laptop) — not confirmed
- **What I saw:** One half-second frame drop during that flight. The page's own code wasn't busy at the time.
- **Why it may not be real:** It came from my test browser drawing without a graphics card, and probably won't happen in a normal browser.
- **Plan:** I'll recheck after the other fixes rather than change anything for it.

---

## The animations ("canvas") you asked about

You mentioned 2. There are 6, plus a video. When the browser tab is hidden, the browser pauses all of them by itself.

| Animation | Where | Stops when not visible? |
|---|---|---|
| Brain sweep | Screen 2 | ❌ Runs on screen 1 too → fix 8 |
| Pixel effect | Between slides | ✅ Only draws during a move |
| Grey dots and lines (mouse-reactive) | Left rooms | ✅ Only exists while a left room is showing |
| Rainbow field (mouse-reactive) | Right rooms | ✅ Only exists while a right room is showing |
| Formula stream | Footer | ❌ Starts and draws early → fix 7 |
| Photo split sweep | Screen 1 | ✅ Pauses when off screen |
| Circuit video | Landing and left rooms | ❌ Keeps playing off screen → fix 3 |
| Chess board | Facts tab | (Out of scope — left as is) |

---

## Every video on the site

| Video | Size | Where | When it loads | Problem? |
|---|---|---|---|---|
| `videos/circuit-bg.mp4` | 1.8 MB | Home background | At once, autoplay | 🚩 Yes → fix 3 |
| `newsmobile/brand/backdrop.mp4` | **2.6 MB** | NewsMobile page background (10% strength) | At once, autoplay | 🚩 Yes: same treatment as fix 3 (still frame first, start after load, compress) |
| Tata `iisa-theme.mp4`, `iism-theme.mp4` | 0.12 MB each | Tata campus band | Only when near the screen | ✅ Fine |
| Tata films — One of One | **34.6 MB** | Tata band 07 / Films catalogue | Only when you press play | ⚠ Slow to start on phones. Optional: compress to about a quarter |
| Tata films — Skills Conclave, JioHotstar spot, logo render, additive manufacturing | 17.7 / 16.5 / 13.1 / 9.8 MB | Same | Only when you press play | ⚠ Same, optional |
| UID `Nirvaan` teaser + trailer | 6.1 / 1.6 MB | UID catalogue | Only when you press play | ✅ Fine |
| Tata `brand/hero.mp4` | 2.9 MB | **Not used anywhere** | Never | Left in place (rule 2) — listed for your information |

---

## Images over 300 KB

**89 images over 300 KB on the whole site, 34.7 MB in total.** Most are stored much bigger than they're ever shown.

Where they are:
- **Tata IIS catalogue:** 45 images (17.3 MB)
- **Tata campus:** 7
- **Arts & Crafts:** about 10
- **Zabraku:** 4
- **UID:** 5
- **ABS:** 2
- **Azoth hero:** 1
- **Chess slider:** 1 (out of scope)

Largest:

| Size | Image |
|---|---|
| 0.77 MB | Tata catalogue — Billboards (two of them) |
| 0.68 MB | Tata catalogue — Socials |
| 0.60 MB | Tata catalogue — Billboards |
| 0.59 MB | ABS — abs-house/05 |
| 0.59 MB | Tata — exterior billboard mockup |
| 0.54 MB | Tata — intro, Jamsetji |
| 0.51 MB | Arts & Crafts — Ink and Pattern |

The ones that download on a **first visit**:

| Page | Images over 300 KB on first visit |
|---|---|
| Home | Arts & Crafts painting 01 (419 KB, fixed by 4) and your photo's colour half (305 KB, needed) |
| Tata | The handbook flipbook sheet and the industry band |
| Azoth | The turkey-tail mushroom hero |

**Fix:** Re-save each one at the largest size it's ever shown on screen (×2 for sharp phone screens). They'd look the same, at roughly half the weight.

Also shipped but unused: 5 original JPGs in `tata-iis/campus/_orig` and `tata-iis/brand/mockups/_sheets` (1.9 MB). They're left in place (rule 2) and only listed here.

---

## What I recommend applying, in order of payoff

| # | Fix | Payoff | Looks change? |
|---|---|---|---|
| 1 | Your photo loads first | First screen 7 s → about 1.5 s on phones | No |
| 2 | Brain frames load after the first screen | −9.5 MB from the first load | No |
| 4 | Room pictures load when near | −2.7 MB from the first load | No |
| 5 | Each page loads only its own fonts | −0.5 MB on every page; client pages' text much sooner | No |
| 3 | Circuit video: still frame first, pause off screen, compress | −1.4 MB, less work while scrolling | Compression: show you first |
| 6 | Fix the scroll lock | No more "frozen" scrolling | **Scrolling responds sooner — needs your OK** |
| 7, 8, 9 | Pause hidden loops; footer stream on demand | Smoother on phones, less battery | No |
| — | NewsMobile backdrop video, same as 3 | −2.6 MB on that page | Compression: show you first |
| — | Re-save oversized images | Lighter client pages | Show you a sample first |
| — | Compress the Tata films | Faster start when you press play | Show you first (optional) |

Expected result for the home page after 1–9: **first screen about 1.5 MB instead of 15 MB, and the photo in about 1.5 s on a normal phone.** Everything else then downloads quietly in the background while you look at the first screen.

*Raw measurements (Lighthouse reports, scroll tests, traces) are kept locally in `.perf-tools/results/`. That folder isn't part of the site or of git.*

---

## Step 3 — results (2026-10-13)

Applied on branch `step-3-speed-fixes`: fixes **1, 2, 4, 5, 7, 8, 9**, and the part of **3** that needs no approval (the films wait for the page and pause off screen; the NewsMobile backdrop waits too). **Not applied:** re-compressing the films (needs your OK after a side-by-side; there is also no video tool on this PC yet) and **6** (the scroll lock; it changes how scrolling responds).

Both versions were built and measured on the same PC, the same day, with the same tests. Lighthouse figures are the **median of 3 runs**; the phone test is the **median of 5**.

| Home page | Before (live) | After |
|---|---|---|
| Photo on screen, normal phone (9 Mbps, slowed CPU) | **7.5 s** | **2.1–3.3 s** |
| Downloaded before the photo appears | 5.3 MB, 85 files | **0.9 MB, 22 files** |
| Downloaded before the page counts as loaded | ~6–15 MB | **0.9 MB** |
| Lighthouse, phone: score | 54 | **72** |
| Lighthouse, phone: main picture (LCP) | 22.7 s | **7.5 s** |
| Lighthouse, phone: page looks complete (Speed Index) | 6.0 s | **2.2 s** |
| Lighthouse, phone: time the page is frozen (TBT) | 475 ms | **182 ms** |
| Lighthouse, laptop: score | 72 | **91** |
| Lighthouse, laptop: main picture (LCP) | 4.2 s | **1.9 s** |
| Font files preloaded on every page | 25 | **1** |

Everything else (the brain's frames, the rooms' pictures, the circuit film) still downloads, but **after** the first screen is up, in the order you'll reach it. Scroll before it's done and the next screen's pictures jump the queue.

**Visual check:** every slide and room on both tracks, plus the footer, at laptop (1440×900), phone (375×812) and phone sideways (812×375), before and after side by side. The only differences are the two you asked for today: the facts in the band's corners (and not in the footer), and the PORTFOLIO mark sitting on the band again on the orb slide. No console errors except the missing favicon, which is the same on the live site and is added in Step 4.

**One loading-only difference:** client pages no longer preload their own fonts (they were preloaded on every page, including home). On a first visit their text can appear in a size-matched stand-in font for a split second before the real one, with no layout jump. The fonts themselves are exactly the same ones as before, checked on every client page at both sizes.

*Kept, not deleted (rule 2):* `FactsTab.tsx` and `AboutFacts.tsx` are no longer rendered (the facts are in the band now); `HobbyWords` is no longer rendered either.
