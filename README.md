# AI 2D Platformer (Celeste-like) — Simple Clean Architecture

## File structure

```text
AI_2DGame/
├─ index.html
├─ style.css
└─ src/
   ├─ main.js
   ├─ core/
   │  ├─ game.js
   │  ├─ loop.js
   │  └─ input.js
   ├─ entities/
   │  ├─ player.js
   │  ├─ solid.js
   │  └─ hazard.js
   ├─ physics/
   │  ├─ movement.js
   │  └─ collision.js
   ├─ level/
   │  ├─ levelLoader.js
   │  └─ levels/
   │     └─ level1.json
   ├─ render/
   │  ├─ renderer.js
   │  ├─ camera.js
   │  └─ debugDraw.js
   └─ ui/
      └─ hud.js
```

## Short description of each file

- `index.html`  
  Hosts the `<canvas>` element and loads `src/main.js`.

- `style.css`  
  Keeps page/canvas layout simple (centered canvas, background color, scaling rules).

- `src/main.js`  
  App entry point: creates the `Game` instance, loads the first level, starts the loop.

- `src/core/game.js`  
  High-level coordinator for game state (running, paused, dead, level complete) and module wiring.

- `src/core/loop.js`  
  Fixed-timestep update + render loop (`requestAnimationFrame`) for stable platformer physics.

- `src/core/input.js`  
  Keyboard input abstraction (left/right/jump/dash) with "pressed this frame" support.

- `src/entities/player.js`  
  Player state and behavior (movement state, jump, dash, gravity application hooks).

- `src/entities/solid.js`  
  Static collidable blocks/platforms.

- `src/entities/hazard.js`  
  Deadly objects (spikes, pits) that trigger player death/reset.

- `src/physics/movement.js`  
  Movement rules (acceleration, friction, gravity, jump tuning, coyote time if desired).

- `src/physics/collision.js`  
  Axis-aligned collision checks and resolution between player and world solids.

- `src/level/levelLoader.js`  
  Loads/parses level JSON into entity instances and spawn points.

- `src/level/levels/level1.json`  
  Data-only level definition (tiles/solids, hazards, player spawn, goal).

- `src/render/renderer.js`  
  Draws world/entities to canvas in a single place.

- `src/render/camera.js`  
  Camera follow and bounds clamping.

- `src/render/debugDraw.js`  
  Optional debug overlays (hitboxes, collision normals, state text).

- `src/ui/hud.js`  
  UI overlays: timer, deaths, level name, pause/death prompts.

## How modules interact

1. **Boot**  
   `index.html` loads `main.js` → `main.js` creates `Game`.

2. **Setup**  
   `Game` initializes `Input`, `LevelLoader`, `Renderer`, and starts `Loop`.

3. **Update (each fixed tick)**  
   - `Input` provides current actions.  
   - `player.js` asks `movement.js` for velocity updates (gravity, acceleration, jump/dash rules).  
   - `collision.js` resolves player/world collisions against `solid.js` entities.  
   - Hazard/goal checks run using `hazard.js` and level data.  
   - `Game` updates state (alive/dead/completed).

4. **Render (each frame)**  
   - `camera.js` computes camera position from player/world bounds.  
   - `renderer.js` draws level + entities using camera transform.  
   - `hud.js` draws overlay UI.  
   - `debugDraw.js` can draw optional diagnostics.

### Dependency direction (keep it clean)

- `main` → `core` → (`entities`, `physics`, `level`, `render`, `ui`)
- `physics` should not depend on `render/ui`
- `entities` should not directly draw themselves (rendering stays in `render/*`)
- `level` is data + mapping logic, not gameplay rules

This keeps gameplay logic easy to test mentally and easy to extend with new mechanics.
