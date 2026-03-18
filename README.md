# AI 2D Platformer — Pixel-Art Dinosaur

Minimal HTML5 canvas platformer using ES modules.

## Controls

- Move left: `A` or `←`
- Move right: `D` or `→`
- Jump: `Space`, `W`, or `↑`
- Dash: `Shift` or `X`
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
- Walk/jump animation states
- Dash effect with multi-block color trail
- Pixel-art platforms + ground
- Three level definitions (`meadow-1`, `canyon-2`, `blackhole-3`) with start/end points
- Pixel-art obstacles (spikes), platform gaps, boost pads, and star collectibles
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
  obstacles: [{ type: 'spike', x: 300, y: 304, width: 24, height: 16 }],
  collectibles: [{ x: 220, y: 210, width: 12, height: 12 }],
  mapElements: [{ type: 'boostPad', x: 200, y: 308, width: 24, height: 8, forceY: -10, forceX: 1.2 }],
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
