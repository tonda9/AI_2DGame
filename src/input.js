const ACTION_KEYS = {
  left: ['ArrowLeft', 'KeyA'],
  right: ['ArrowRight', 'KeyD'],
  jump: ['Space', 'KeyW', 'ArrowUp'],
  dash: ['ShiftLeft', 'ShiftRight', 'KeyX'],
};

export class Input {
  constructor(target = window) {
    this.down = new Set();
    this.pressed = new Set();
    this.keyToAction = new Map();

    for (const [action, keys] of Object.entries(ACTION_KEYS)) {
      for (const key of keys) this.keyToAction.set(key, action);
    }

    this.onKeyDown = (event) => {
      const action = this.keyToAction.get(event.code);
      if (!action) return;
      if (!this.down.has(action)) this.pressed.add(action);
      this.down.add(action);
    };

    this.onKeyUp = (event) => {
      const action = this.keyToAction.get(event.code);
      if (!action) return;
      this.down.delete(action);
    };

    target.addEventListener('keydown', this.onKeyDown);
    target.addEventListener('keyup', this.onKeyUp);
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
}
