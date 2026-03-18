import { Input } from './core/input.js';
import { renderScene } from './render/renderer.js';
import { LEVELS, createLevelState } from './levels/levels.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const input = new Input();
const WORLD_WIDTH = 640;
const WORLD_HEIGHT = 360;

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
const dashFrames = 8;
const WALK_CYCLE_FRAMES = 24;
const FALL_RESPAWN_THRESHOLD = 120;
const BOOST_PAD_TRIGGER_OFFSET_PX = 2;
const DEFAULT_BOOST_FORCE_Y = -10;
const DEFAULT_BOOST_FORCE_X = 0;
let dashTimer = 0;
let dashDirection = 1;
let grounded = false;
let walkCycle = 0;
let frameCount = 0;

let levelIndex = 0;
let level = createLevelState(LEVELS[0]);

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx.imageSmoothingEnabled = false;
}

function overlapsX(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x;
}

function overlapsY(a, b) {
  return a.y < b.y + b.height && a.y + a.height > b.y;
}

function intersects(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function resolveEntityRect(entity) {
  return {
    x: entity.currentX ?? entity.x,
    y: entity.currentY ?? entity.y,
    width: entity.width,
    height: entity.height,
  };
}

function getSolidPlatforms() {
  const movingPlatforms = (level.mapElements || [])
    .filter((mapElement) => mapElement.type === 'movingPlatform')
    .map(resolveEntityRect);
  return [...level.platforms, ...movingPlatforms];
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
  for (const platform of getSolidPlatforms()) {
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
  return getSolidPlatforms().some((platform) => {
    const touchingTop = probe.y + probe.height >= platform.y;
    const currentlyAboveTop = player.y + player.height <= platform.y + 1;
    return overlapsX(probe, platform) && touchingTop && currentlyAboveTop;
  });
}

function applyMapElementInteractions(playerPreviousY) {
  for (const mapElement of level.mapElements || []) {
    if (mapElement.type !== 'boostPad') continue;
    const mapRect = resolveEntityRect(mapElement);
    const triggerEdgeY = mapRect.y - BOOST_PAD_TRIGGER_OFFSET_PX;
    const wasAbove = playerPreviousY + player.height <= triggerEdgeY;
    const nowTouching = player.y + player.height >= triggerEdgeY;
    if (wasAbove && nowTouching && overlapsX(player, mapRect)) {
      const forceY = mapElement.forceY ?? DEFAULT_BOOST_FORCE_Y;
      const forceX = mapElement.forceX ?? DEFAULT_BOOST_FORCE_X;
      player.y = mapRect.y - player.height;
      player.vy = forceY;
      player.vx += forceX;
      break;
    }
  }
}

function updateDynamicEntities() {
  const applyMotion = (entity) => {
    if (!entity.range || !entity.speed) return;
    if (entity.baseX === undefined) entity.baseX = entity.x;
    if (entity.baseY === undefined) entity.baseY = entity.y;
    const axis = entity.axis === 'y' ? 'y' : 'x';
    const offset = Math.sin(frameCount * entity.speed) * entity.range;
    entity.currentX = axis === 'x' ? entity.baseX + offset : entity.baseX;
    entity.currentY = axis === 'y' ? entity.baseY + offset : entity.baseY;
  };

  for (const obstacle of level.obstacles) {
    if (obstacle.type === 'movingSpike') applyMotion(obstacle);
  }
  for (const mapElement of level.mapElements || []) {
    if (mapElement.type === 'movingPlatform') applyMotion(mapElement);
  }
}

function movePlayerHorizontally(distance) {
  if (distance === 0) return;
  const direction = Math.sign(distance);
  let remaining = Math.abs(distance);
  while (remaining > 0) {
    const step = Math.min(1, remaining);
    player.x += step * direction;
    const hitSolid = getSolidPlatforms().some((platform) => intersects(player, platform) && overlapsY(player, platform));
    if (hitSolid) {
      player.x -= step * direction;
      player.vx = 0;
      dashTimer = 0;
      break;
    }
    remaining -= step;
  }
}

function update() {
  frameCount += 1;
  updateDynamicEntities();
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
    dashDirection = holdLeft ? -1 : holdRight ? 1 : player.facing;
    dashTimer = dashFrames;
  }

  if (dashTimer > 0) {
    dashTimer -= 1;
    if (holdLeft) player.vx = -dashSpeed;
    else if (holdRight) player.vx = dashSpeed;
    else player.vx = dashDirection * dashSpeed;
  }

  if (pressJump && isOnGround()) {
    player.vy = jumpVelocity;
  }

  player.vy += gravity;
  const previousY = player.y;
  movePlayerHorizontally(player.vx);
  player.y += player.vy;

  const landed = resolveVerticalCollisions(previousY);
  if (landed) dashTimer = 0;
  applyMapElementInteractions(previousY);
  grounded = landed || isOnGround();
  if (grounded && Math.abs(player.vx) > 0) {
    walkCycle = (walkCycle + 1) % WALK_CYCLE_FRAMES;
  }

  player.x = Math.max(0, Math.min(WORLD_WIDTH - player.width, player.x));

  if (player.y > WORLD_HEIGHT + FALL_RESPAWN_THRESHOLD) resetPlayerToStart();

  for (const obstacle of level.obstacles) {
    if (intersects(player, resolveEntityRect(obstacle))) {
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
    dashDirection,
    frameCount,
    velocityY: player.vy,
    worldWidth: WORLD_WIDTH,
    worldHeight: WORLD_HEIGHT,
  });
}

function frame() {
  update();
  draw();
  input.endFrame();
  requestAnimationFrame(frame);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
setLevel(0);
requestAnimationFrame(frame);
