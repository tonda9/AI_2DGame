import { Input } from './core/input.js';
import { renderScene } from './render/renderer.js';
import { LEVELS, createLevelState } from './levels/levels.js';
import { playJump, playDash, playLand, playCollect, playDeath, playLevelComplete } from './core/sound.js';

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
const maxRunSpeed = 2.7;
const runAccelGround = 0.42;
const runAccelAir = 0.24;
const runDecelGround = 0.5;
const runDecelAir = 0.16;
const gravityRise = 0.4;
const gravityFall = 0.52;
const jumpCutGravity = 0.6;
const maxFallSpeed = 10;
const jumpVelocity = -8.5;
const coyoteFrames = 6;
const jumpBufferFrames = 6;
const wallSlideFallSpeed = 1.7;
const wallJumpVelocity = -8;
const wallJumpPush = 3.8;
const walkCycleVelocityThreshold = 0.2;
const dashSpeed = 7;
const dashFrames = 8;
const WALK_CYCLE_FRAMES = 24;
const IDLE_CYCLE_FRAMES = 120;
const FALL_RESPAWN_THRESHOLD = 120;
const BOOST_PAD_TRIGGER_OFFSET_PX = 2;
const DEFAULT_BOOST_FORCE_Y = -10;
const DEFAULT_BOOST_FORCE_X = 0;
const SPIKE_HITBOX_INSET_X = 2;
const SPIKE_HITBOX_INSET_TOP = 1;
const SPIKE_HITBOX_INSET_BOTTOM = 1;
const MIN_HITBOX_SIZE = 1;
let dashTimer = 0;
let dashDirection = 1;
let canDash = true;
let grounded = false;
let wasGrounded = false;
let screenShake = 0;
let coyoteTimer = 0;
let jumpBufferTimer = 0;
let walkCycle = 0;
let idleCycle = 0;
let frameCount = 0;
let meatCollected = 0;
const collectedMeatKeys = new Set();

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

function approach(current, target, delta) {
  if (current < target) return Math.min(current + delta, target);
  if (current > target) return Math.max(current - delta, target);
  return target;
}

function getGravityStrength(wallSliding, velocityY) {
  if (wallSliding) return 0;
  return velocityY > 0 ? gravityFall : gravityRise;
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

/**
 * Returns the collision hitbox for an obstacle.
 * Spike hitboxes are inset slightly to avoid unfair edge-contact deaths.
 */
function resolveObstacleHitbox(obstacle) {
  const rect = resolveEntityRect(obstacle);
  if (obstacle.type === 'spike' || obstacle.type === 'movingSpike') {
    const availableInsetXPerSide = Math.max(0, Math.floor((rect.width - MIN_HITBOX_SIZE) / 2));
    const appliedInsetX = Math.min(SPIKE_HITBOX_INSET_X, availableInsetXPerSide);
    const availableInsetYTotal = Math.max(0, rect.height - MIN_HITBOX_SIZE);
    const appliedInsetTop = Math.min(SPIKE_HITBOX_INSET_TOP, Math.floor(availableInsetYTotal / 2));
    const appliedInsetBottom = Math.min(SPIKE_HITBOX_INSET_BOTTOM, availableInsetYTotal - appliedInsetTop);
    return {
      x: rect.x + appliedInsetX,
      y: rect.y + appliedInsetTop,
      width: Math.max(MIN_HITBOX_SIZE, rect.width - appliedInsetX * 2),
      height: Math.max(MIN_HITBOX_SIZE, rect.height - appliedInsetTop - appliedInsetBottom),
    };
  }
  return rect;
}

function getSolidPlatforms() {
  const movingPlatforms = (level.mapElements || [])
    .filter((mapElement) => mapElement.type === 'movingPlatform')
    .map(resolveEntityRect);
  return [...level.platforms, ...movingPlatforms];
}

function resetPlayerToStart(wasKilled = false) {
  player.x = level.start.x;
  player.y = level.start.y;
  player.vx = 0;
  player.vy = 0;
  dashTimer = 0;
  canDash = true;
  walkCycle = 0;
  idleCycle = 0;
  if (wasKilled) {
    screenShake = 14;
    playDeath();
  }
}

function setLevel(index, fromGoal = false) {
  if (fromGoal) playLevelComplete();
  levelIndex = (index + LEVELS.length) % LEVELS.length;
  level = createLevelState(LEVELS[levelIndex]);
  level.collectibles.forEach((collectible, collectibleIndex) => {
    const meatKey = `${level.id}:${collectibleIndex}`;
    collectible.collected = collectedMeatKeys.has(meatKey);
  });
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
  const solidPlatforms = getSolidPlatforms();
  while (remaining > 0) {
    const step = Math.min(1, remaining);
    player.x += step * direction;
    const hitSolid = solidPlatforms.some((platform) => intersects(player, platform) && overlapsY(player, platform));
    if (hitSolid) {
      player.x -= step * direction;
      player.vx = 0;
      dashTimer = 0;
      break;
    }
    remaining -= step;
  }
}

function isTouchingWall(direction) {
  const probe = { ...player, x: player.x + direction };
  if (probe.x <= 0 || probe.x + probe.width >= WORLD_WIDTH) return true;
  return getSolidPlatforms().some((platform) => intersects(probe, platform) && overlapsY(probe, platform));
}

function update() {
  frameCount += 1;
  if (screenShake > 0) screenShake = Math.max(0, screenShake - 1);
  updateDynamicEntities();
  const holdLeft = input.isDown('left');
  const holdRight = input.isDown('right');
  const holdJump = input.isDown('jump');
  const pressJump = input.isPressed('jump');
  const pressDash = input.isPressed('dash');
  const pressSwitchLevel = input.isPressed('switchLevel');
  const pressFullscreen = input.isPressed('fullscreen');
  const inputX = (holdRight ? 1 : 0) - (holdLeft ? 1 : 0);

  if (pressSwitchLevel) setLevel(levelIndex + 1);

  if (pressFullscreen) {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => console.warn('Fullscreen request failed:', err));
    } else {
      document.exitFullscreen().catch((err) => console.warn('Fullscreen exit failed:', err));
    }
  }

  if (inputX !== 0) player.facing = inputX;
  if (pressJump) jumpBufferTimer = jumpBufferFrames;
  else jumpBufferTimer = Math.max(0, jumpBufferTimer - 1);
  coyoteTimer = grounded ? coyoteFrames : Math.max(0, coyoteTimer - 1);

  const touchingLeftWall = isTouchingWall(-1);
  const touchingRightWall = isTouchingWall(1);
  const wallDirection = touchingLeftWall ? -1 : touchingRightWall ? 1 : 0;
  const wallSliding = !grounded && player.vy > 0 && wallDirection !== 0
    && ((wallDirection === -1 && holdLeft) || (wallDirection === 1 && holdRight));

  if (pressDash && canDash) {
    dashDirection = inputX || player.facing;
    dashTimer = dashFrames;
    canDash = false;
    playDash();
  }

  if (dashTimer > 0) {
    dashTimer -= 1;
    player.vx = dashDirection * dashSpeed;
  } else {
    const acceleration = grounded ? runAccelGround : runAccelAir;
    const deceleration = grounded ? runDecelGround : runDecelAir;
    const targetSpeed = inputX * maxRunSpeed;
    player.vx = inputX !== 0
      ? approach(player.vx, targetSpeed, acceleration)
      : approach(player.vx, 0, deceleration);
  }

  if (jumpBufferTimer > 0) {
    if (wallSliding) {
      player.vy = wallJumpVelocity;
      player.vx = -wallDirection * wallJumpPush;
      player.facing = -wallDirection;
      jumpBufferTimer = 0;
      coyoteTimer = 0;
      playJump();
    } else if (coyoteTimer > 0) {
      player.vy = jumpVelocity;
      jumpBufferTimer = 0;
      coyoteTimer = 0;
      grounded = false;
      playJump();
    }
  }

  const jumpCutting = !holdJump && player.vy < 0;
  const gravity = getGravityStrength(wallSliding, player.vy) + (jumpCutting ? jumpCutGravity : 0);
  player.vy = Math.min(maxFallSpeed, player.vy + gravity);
  if (wallSliding) player.vy = Math.min(player.vy, wallSlideFallSpeed);

  const previousY = player.y;
  movePlayerHorizontally(player.vx);
  player.y += player.vy;

  wasGrounded = grounded;
  const landed = resolveVerticalCollisions(previousY);
  if (landed) dashTimer = 0;
  applyMapElementInteractions(previousY);
  grounded = landed || isOnGround();
  if (grounded) canDash = true;
  if (grounded && !wasGrounded) playLand();
  if (grounded && Math.abs(player.vx) > walkCycleVelocityThreshold) {
    walkCycle = (walkCycle + 1) % WALK_CYCLE_FRAMES;
    idleCycle = 0;
  } else if (grounded) {
    // Keep the dinosaur alive when idle with a subtle breathing/blink cycle.
    idleCycle = (idleCycle + 1) % IDLE_CYCLE_FRAMES;
  }

  player.x = Math.max(0, Math.min(WORLD_WIDTH - player.width, player.x));

  if (player.y > WORLD_HEIGHT + FALL_RESPAWN_THRESHOLD) resetPlayerToStart(true);

  for (const obstacle of level.obstacles) {
    if (intersects(player, resolveObstacleHitbox(obstacle))) {
      resetPlayerToStart(true);
      break;
    }
  }

  for (const [collectibleIndex, collectible] of level.collectibles.entries()) {
    if (!collectible.collected && intersects(player, collectible)) {
      collectible.collected = true;
      const meatKey = `${level.id}:${collectibleIndex}`;
      if (!collectedMeatKeys.has(meatKey)) {
        collectedMeatKeys.add(meatKey);
        meatCollected += 1;
        playCollect();
      }
    }
  }

  if (intersects(player, level.end)) setLevel(levelIndex + 1, true);
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
    grounded,
    walkCycle,
    idleCycle,
    facing: player.facing,
    dashDirection,
    meatCollected,
    frameCount,
    velocityY: player.vy,
    worldWidth: WORLD_WIDTH,
    worldHeight: WORLD_HEIGHT,
    screenShake,
  });
}

function frame() {
  update();
  draw();
  input.endFrame();
  requestAnimationFrame(frame);
}

/**
 * Requests fullscreen after the first pointer interaction.
 * The listener is removed on success or failure to avoid repeated prompts.
 */
function requestFullscreenIfNeeded() {
  if (document.fullscreenElement) {
    window.removeEventListener('pointerdown', requestFullscreenIfNeeded);
    return;
  }
  document.documentElement.requestFullscreen()
    .then(() => window.removeEventListener('pointerdown', requestFullscreenIfNeeded))
    .catch((err) => {
      console.warn('Fullscreen request failed (usually blocked without a user gesture):', err);
      window.removeEventListener('pointerdown', requestFullscreenIfNeeded);
    });
}

window.addEventListener('resize', resizeCanvas);
document.addEventListener('fullscreenchange', resizeCanvas);
window.addEventListener('pointerdown', requestFullscreenIfNeeded);
resizeCanvas();
setLevel(0);
requestAnimationFrame(frame);
