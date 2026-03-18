import { Input } from './core/input.js';
import { renderScene } from './render/renderer.js';
import { LEVELS, createLevelState } from './levels/levels.js';

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
const FALL_RESPAWN_THRESHOLD = 120;
let dashTimer = 0;
let grounded = false;
let walkCycle = 0;
let frameCount = 0;

let levelIndex = 0;
let level = createLevelState(LEVELS[0]);

function overlapsX(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x;
}

function intersects(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function resetPlayerToStart() {
  player.x = level.start.x;
  player.y = level.start.y;
  player.vx = 0;
  player.vy = 0;
  dashTimer = 0;
}

function setLevel(index) {
  levelIndex = (index + LEVELS.length) % LEVELS.length;
  level = createLevelState(LEVELS[levelIndex]);
  resetPlayerToStart();
}

function resolveVerticalCollisions(previousY) {
  for (const platform of level.platforms) {
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
  return level.platforms.some((platform) => {
    const touchingTop = probe.y + probe.height >= platform.y;
    const currentlyAboveTop = player.y + player.height <= platform.y + 1;
    return overlapsX(probe, platform) && touchingTop && currentlyAboveTop;
  });
}

function applyMapElementInteractions(previousY) {
  for (const mapElement of level.mapElements) {
    if (mapElement.type !== 'boostPad') continue;
    const wasAbove = previousY + player.height <= mapElement.y + 2;
    const nowTouching = player.y + player.height >= mapElement.y;
    if (wasAbove && nowTouching && overlapsX(player, mapElement)) {
      player.y = mapElement.y - player.height;
      player.vy = mapElement.forceY;
      player.vx += mapElement.forceX || 0;
      break;
    }
  }
}

function update() {
  frameCount += 1;
  const holdLeft = input.isDown('left');
  const holdRight = input.isDown('right');
  const pressJump = input.isPressed('jump');
  const pressDash = input.isPressed('dash');
  const pressSwitchLevel = input.isPressed('switchLevel');

  if (pressSwitchLevel) setLevel(levelIndex + 1);

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
  applyMapElementInteractions(previousY);
  grounded = landed || isOnGround();
  if (grounded && Math.abs(player.vx) > 0) {
    walkCycle = (walkCycle + 1) % WALK_CYCLE_FRAMES;
  }

  player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));

  if (player.y > canvas.height + FALL_RESPAWN_THRESHOLD) resetPlayerToStart();

  for (const obstacle of level.obstacles) {
    if (intersects(player, obstacle)) {
      resetPlayerToStart();
      break;
    }
  }

  for (const collectible of level.collectibles) {
    if (!collectible.collected && intersects(player, collectible)) collectible.collected = true;
  }

  if (intersects(player, level.end)) setLevel(levelIndex + 1);
}

function draw() {
  renderScene(ctx, canvas, {
    player,
    platforms: level.platforms,
    obstacles: level.obstacles,
    collectibles: level.collectibles,
    mapElements: level.mapElements,
    start: level.start,
    end: level.end,
    levelId: level.id,
    backgroundVariant: level.backgroundVariant,
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

setLevel(0);
requestAnimationFrame(frame);
