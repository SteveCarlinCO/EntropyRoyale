# Entropy Royale: Final Two

A 2D entropy battle-royale simulation. Numbered dots drift inside a
porthole into deep space; any two that touch detonate. The cull continues
until exactly **two dots remain**. Before the carnage starts, you pick the
numbered dot you think will survive.

Open `1000-dot-entropy-royale-final.html` in any modern browser.
No build step, no dependencies (one Google Font is fetched for the UI).

## Rules

- Every dot is numbered from **1 to N** (you choose N, 2–1000).
- When two dots touch, **both explode** into debris and a shockwave ring.
- When 3 dots remain, a collision eliminates **only one**, so the game
  always ends with exactly two survivors — never one, never zero.
- The final two stop detonating and bounce off each other forever.
- When 8 or fewer dots remain, survivors gently home in on each other so
  the endgame always resolves instead of drifting forever.

## How to play

1. Set the **Dots** field (2–1000, default 1000) and press **Reset**.
2. Enter your pick in **Your pick** and press **Lock in guess & start**.
   The arena stays frozen until you commit.
3. You may change your guess until the field thins out (cutoff scales
   with the dot count: 10 for a full 1000).
4. Watch the status line: it tells you if your pick is alive, when it
   gets vaporized, and delivers the verdict when two dots remain.

## What's on screen

- **Arena** — a recessed porthole bezel; the canvas is transparent so you
  look *through* it into the scene.
- **Background** — three layers of twinkling stars (41 stars, desynced
  twinkle rates), a tilted, slowly spinning CSS spiral galaxy at 80%
  opacity, and a small companion galaxy floating upper-right.
- **Dots** — colored, numbered once the field drops to 40; debris and
  expanding rings on every detonation; the two survivors pulse with a glow.
- **Meter** — live dot count draining toward 2.
- **Typography** — Orbitron, for that starship-bridge feel.

## Under the hood

- `requestAnimationFrame` loop; collision detection via a uniform spatial
  grid (cell size 14px), so 1000 dots hold 60fps.
- One collision resolved per frame; debris capped at 500 particles.
- All visuals are canvas 2D + pure CSS (conic-gradient spiral arms,
  radial-gradient starfields, layered box-shadows). No images, no libraries.

## Files

| File | What it is |
| --- | --- |
| `1000-dot-entropy-royale-final-two.html` | The simulation (this readme describes it) |

## Tweaking it

- **Dot speed/size**: `sp` and `r` in `reset()`.
- **Detonation size**: debris count in `detonate()`.
- **Endgame homing**: the `parts.length <= 8` block in `frame()`.
- **Galaxy tilt**: `.arena-galaxy { transform: rotateX(58deg) … }`.
- **Mini galaxy**: `.mini-galaxy` (position, size, `opacity`).
