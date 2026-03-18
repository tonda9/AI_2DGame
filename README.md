# AI 2D Platformer — Pixel-Art Dinosaur

Minimal HTML5 canvas platformer using ES modules.

## Controls

- Move left: `A` or `←`
- Move right: `D` or `→`
- Jump: `Space`, `W`, or `↑`
- Dash: `Shift`, `X`, or `Z`
- Switch level: `L`

## File structure

```text
AI_2DGame/
├─ index.html
├─ style.css
├─ .github/workflows/deploy-pages.yml
└─ src/
   ├─ main.js
   ├─ core/input.js
   ├─ levels/levels.js
   └─ render/renderer.js
```

## What is implemented

- 32x32 pixel-art dinosaur rendered from colored blocks
- Celeste-style movement tuning (acceleration/deceleration, coyote time, jump buffer, variable jump height)
- Optional wall-slide and wall-jump behavior
- Dash effect with multi-block color trail
- Pixel-art platforms + ground
- Six level definitions (`meadow-1`, `canyon-2`, `blackhole-3`, `rift-4`, `forge-5`, `summit-6`) with start/end points
- Pixel-art obstacles (spikes + moving spikes + falling spikes + swing spikes), platform gaps, boost pads, trampolines, moving platforms, and meat collectibles
- Pixel-art sky with animated clouds
- Input remains isolated in `src/core/input.js`

## Level object format

Add new maps in `src/levels/levels.js` using the same shape:

```js
{
  id: 'your-level-id',
  backgroundVariant: 'day', // or 'dusk'
  start: { x: 24, y: 278 },
  end: { x: 604, y: 125, width: 16, height: 40 },
  platforms: [{ x: 0, y: 320, width: 640, height: 40 }],
  obstacles: [
    { type: 'spike', x: 300, y: 304, width: 24, height: 16 },
    { type: 'movingSpike', x: 300, y: 220, width: 24, height: 16, axis: 'x', range: 28, speed: 0.08 },
    { type: 'fallingSpike', x: 420, y: 60, width: 24, height: 16, range: 96, speed: 0.06 },
    {
      type: 'swingSpike',
      x: 520, y: 90, width: 24, height: 16,
      anchorX: 532, anchorY: 28, ropeLength: 52, swingArc: 0.95, speed: 0.07,
    },
  ],
  collectibles: [{ x: 220, y: 210, width: 12, height: 12 }],
  mapElements: [
    { type: 'boostPad', x: 200, y: 308, width: 24, height: 8, forceY: -10, forceX: 1.2 },
    { type: 'trampoline', x: 280, y: 308, width: 28, height: 8, forceY: -13, forceX: 0.4 },
    { type: 'movingPlatform', x: 340, y: 246, width: 72, height: 12, axis: 'y', range: 32, speed: 0.05 },
  ],
}
```

## GitHub Pages preview

This project is static (no build step). It can be deployed directly to GitHub Pages.

### Option A: Included GitHub Actions workflow (recommended)

1. Push to `main`.
2. In GitHub repo settings, ensure **Pages** source is set to **GitHub Actions**.
3. The workflow `.github/workflows/deploy-pages.yml` deploys `index.html`, `style.css`, and `src/`.
   - Optional `assets/` is also included automatically when present.
   - A `.nojekyll` file is generated in the artifact to avoid Pages processing issues.
4. Preview URL will be:
   `https://<your-username>.github.io/AI_2DGame/`

### Option B: Branch/folder deployment

1. In GitHub **Settings → Pages**, choose **Deploy from a branch**.
2. Select `main` and `/ (root)`.
3. Save and wait for publish.

## Local preview

- Double-click `index.html` to open directly in a browser, or
- serve with any static server (optional), e.g. `python3 -m http.server`.
- Resize the browser window to verify the canvas fills the screen while preserving the 640x360 letterboxed world.
- Press `L` to switch levels up to `summit-6` to test dash trail/flash, dash-state color, meat pickups, dynamic spikes, boost pads, trampolines, and moving platforms.
- HUD is intentionally clean: it shows only `meat: <count>` (no debug key-state text).

## Integration snippet

Movement and score are passed from `src/main.js` to the renderer as state:

```js
renderScene(ctx, canvas, {
  player,
  collectibles: level.collectibles,
  dashActive: dashTimer > 0,
  dashAvailable,
  meatCollected,
  worldWidth: WORLD_WIDTH,
  worldHeight: WORLD_HEIGHT,
});
```
