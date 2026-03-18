# AI 2D Platformer — Minimal Canvas + ES Modules

## File structure

```text
AI_2DGame/
├─ index.html
├─ style.css
└─ src/
   ├─ main.js
   ├─ core/
   │  └─ input.js
   └─ render/
      └─ renderer.js
```

## Current modules

- `index.html`  
  Hosts the `<canvas>` and loads `src/main.js` as an ES module.

- `style.css`  
  Centers the canvas and keeps a pixel-art-friendly page layout.

- `src/core/input.js`  
  Keyboard input abstraction for `left`, `right`, `jump`, and `dash`, with support for hold (`isDown`) and edge-triggered press (`isPressed`) states.

- `src/main.js`  
  Main game loop (`requestAnimationFrame`), simple movement + jump/dash behavior, and platform collision checks.

- `src/render/renderer.js`  
  Pixel-art drawing layer for background, platforms, dinosaur player sprite, dash effect, and small HUD text.
