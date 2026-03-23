# AI 2D Platformer — Pixel-Art Dinosaur

Minimal HTML5 canvas platformer using ES modules.

## Controls

- Move left: `A` or `←`
- Move right: `D` or `→`
- Climb up on vertical paths: `W` or `↑`
- Climb down on vertical paths: `S` or `↓`
- Jump: `Space`
- Dash: `Shift` or `X`
- Pause/Resume: `P` or `Esc`
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
- 3 chapters with 10 levels each (30 total), generated from chapter definitions for easy expansion
- Progressive difficulty from chapter 1 level 1 (easiest) to chapter 3 level 10 (hardest)
- Pixel-art obstacles (spikes + moving spikes), platform gaps, boost pads, moving platforms, and meat collectibles in every level
- Hidden secret side areas in selected levels that reward exploration with extra meat collectibles
- Pixel-art sky with animated clouds
- Passive dinosaur idle animation (breathing, blinking, tail movement) when standing still
- Input remains isolated in `src/core/input.js`
- Looping background music loaded from `assets/audio/background.mp3`

## Level object format

Levels are generated from chapter metadata in `src/levels/levels.js`, and exported as a flat runtime `LEVELS` array.
Each level still uses this shape:

```js
{
  id: 'your-level-id',
  backgroundVariant: 'day', // or 'dusk'
  start: { x: 24, y: 278 },
  end: { x: 604, y: 125, width: 16, height: 40 },
  platforms: [{ x: 0, y: 320, width: 640, height: 40 }],
  obstacles: [{ type: 'spike', x: 300, y: 304, width: 24, height: 16 }],
  collectibles: [{ x: 220, y: 210, width: 12, height: 12 }],
  mapElements: [
    { type: 'boostPad', x: 200, y: 308, width: 24, height: 8, forceY: -10, forceX: 1.2 },
    { type: 'verticalPath', x: 280, y: 100, width: 12, height: 180 },
  ],
}
```

`verticalPath` marks climbable lanes (ladder-like traversal). Gravity and normal jump physics remain active outside these lanes.

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
- Press `L` to cycle across all 30 levels and verify chapter progression, secrets, moving hazards, and interactive elements.
- HUD is intentionally clean: it shows only `meat: <count>` (no debug key-state text).

### Accessibility verification report

Run the level reachability check:

```bash
node src/levels/accessibility-report.js
```

The script simulates movement graph traversal with jump/drop limits, vertical paths, moving platforms, boost pads, and spike hazard zones.  
If any platform, collectible, secret collectible, or goal is unreachable, it prints the level id and inaccessible coordinates and exits with code `1`.

## Background music

- Main soundtrack path is `assets/audio/background.mp3`.
- Playback is managed in `src/main.js`:
  - starts when a level loads
  - pauses when the game is paused (`P`/`Esc`) or tab is hidden
  - resumes when unpaused/visible
  - restarts cleanly on level exit/restart
- Default volume is controlled by `BACKGROUND_MUSIC_VOLUME` in `src/main.js` (currently `0.3`).

### Replace or add tracks

1. Replace `assets/audio/background.mp3` with your own looped file (same path), **or**
2. Add extra files under `assets/audio/` and update `CHAPTER_MUSIC` in `src/main.js` to map chapter ids (`c1`, `c2`, `c3`) to different track paths.

## Integration snippet

Movement and score are passed from `src/main.js` to the renderer as state:

```js
renderScene(ctx, canvas, {
  player,
  collectibles: level.collectibles,
  dashActive: dashTimer > 0,
  meatCollected,
  worldWidth: WORLD_WIDTH,
  worldHeight: WORLD_HEIGHT,
});
```
