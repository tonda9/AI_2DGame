import { Input } from './core/input.js';
import { renderScene } from './render/renderer.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const input = new Input();

const player = {
  x: 120,
  y: 180,
  width: 32,
  height: 32,
  vx: 0,
  vy: 0,
  facing: 1,
};
const speed = 2;
const gravity = 0.45;
const jumpVelocity = -8.5;
const dashSpeed = 7;
const WALK_CYCLE_FRAMES = 24;
let dashTimer = 0;
let grounded = false;
let walkCycle = 0;
let frameCount = 0;

const platforms = [
  { x: 0, y: 320, width: 640, height: 40 },
  { x: 180, y: 245, width: 170, height: 20 },
  { x: 420, y: 195, width: 160, height: 20 },
];

function overlapsX(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x;
}

function resolveVerticalCollisions(previousY) {
  for (const platform of platforms) {
    const wasAbove = previousY + player.height <= platform.y;
    const nowCrossedTop = player.y + player.height >= platform.y;
    if (wasAbove && nowCrossedTop && overlapsX(player, platform)) {
      player.y = platform.y - player.height;
      player.vy = 0;
      return true;
    }
  }
  return false;
}

function isOnGround() {
  const probe = { ...player, y: player.y + 1 };
  return platforms.some((platform) => {
    const touchingTop = probe.y + probe.height >= platform.y;
    const currentlyAboveTop = player.y + player.height <= platform.y + 1;
    return overlapsX(probe, platform) && touchingTop && currentlyAboveTop;
  });
}

function update() {
  frameCount += 1;
  const holdLeft = input.isDown('left');
  const holdRight = input.isDown('right');
  const pressJump = input.isPressed('jump');
  const pressDash = input.isPressed('dash');

  player.vx = 0;
  if (holdLeft) {
    player.vx -= speed;
    player.facing = -1;
  }
  if (holdRight) {
    player.vx += speed;
    player.facing = 1;
  }

  if (pressDash) {
    dashTimer = 8;
  }

  if (dashTimer > 0) {
    dashTimer -= 1;
    if (holdLeft) player.vx = -dashSpeed;
    else if (holdRight) player.vx = dashSpeed;
    else player.vx = player.facing * dashSpeed;
  }

  if (pressJump && isOnGround()) {
    player.vy = jumpVelocity;
  }

  player.vy += gravity;
  const previousY = player.y;
  player.x += player.vx;
  player.y += player.vy;

  const landed = resolveVerticalCollisions(previousY);
  if (landed) dashTimer = 0;
  grounded = landed || isOnGround();
  if (grounded && Math.abs(player.vx) > 0) {
    walkCycle = (walkCycle + 1) % WALK_CYCLE_FRAMES;
  }

  player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
}

function draw() {
  renderScene(ctx, canvas, {
    player,
    platforms,
    dashActive: dashTimer > 0,
    holdLeft: input.isDown('left'),
    holdRight: input.isDown('right'),
    pressJump: input.isPressed('jump'),
    pressDash: input.isPressed('dash'),
    grounded,
    walkCycle,
    facing: player.facing,
    frameCount,
    velocityY: player.vy,
  });
}

function frame() {
  update();
  draw();
  input.endFrame();
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
