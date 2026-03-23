const ACTION_KEYS = {
  left: ['ArrowLeft', 'KeyA'],
  right: ['ArrowRight', 'KeyD'],
  up: ['ArrowUp', 'KeyW'],
  down: ['ArrowDown', 'KeyS'],
  jump: ['Space'],
  dash: ['ShiftLeft', 'ShiftRight', 'KeyX'],
  pause: ['KeyP', 'Escape'],
  switchLevel: ['KeyL'],
  fullscreen: ['KeyF'],
};

export class Input {
  constructor(target = window) {
    this.target = target;
    this.down = new Set();
    this.pressed = new Set();
    this.keyToAction = new Map();

    for (const [action, keys] of Object.entries(ACTION_KEYS)) {
      for (const key of keys) this.keyToAction.set(key, action);
    }

    this.onKeyDown = (event) => {
      const action = this.keyToAction.get(event.code);
      if (!action) return;
      event.preventDefault();
      if (!this.down.has(action)) this.pressed.add(action);
      this.down.add(action);
    };

    this.onKeyUp = (event) => {
      const action = this.keyToAction.get(event.code);
      if (!action) return;
      event.preventDefault();
      this.down.delete(action);
    };

    this.target.addEventListener('keydown', this.onKeyDown);
    this.target.addEventListener('keyup', this.onKeyUp);
  }

  isDown(action) {
    return this.down.has(action);
  }

  isPressed(action) {
    return this.pressed.has(action);
  }

  endFrame() {
    this.pressed.clear();
  }

  destroy() {
    this.target.removeEventListener('keydown', this.onKeyDown);
    this.target.removeEventListener('keyup', this.onKeyUp);
  }
}
