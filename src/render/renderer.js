const HUD_FONT = '14px monospace';
const SPRITE_WIDTH_BLOCKS = 8;
const BOOST_PAD_INSET = 2;
const BOOST_PAD_PULSE_INSET_MULTIPLIER = 4;
const BOOST_PAD_MIN_PULSE_WIDTH = 2;
const BOOST_PAD_PULSE_FRAME_DIVISOR = 8;
const IDLE_BLINK_CYCLE_LENGTH = 90;
const IDLE_BLINK_START_FRAME = 82;
const IDLE_VELOCITY_THRESHOLD = 0.1;
const IDLE_BREATH_FREQUENCY = 0.08;
const IDLE_BREATH_AMPLITUDE = 1.2;
const IDLE_TAIL_SWAY_DIVISOR = 18;
const IDLE_TAIL_LIFT_AMOUNT = -1;

function drawPixelRect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function wrapPosition(value, range) {
  return ((value % range) + range) % range;
}

function drawCloud(ctx, x, y) {
  drawPixelRect(ctx, x + 6, y, 14, 4, '#f2fbff');
  drawPixelRect(ctx, x, y + 4, 26, 8, '#f7fdff');
  drawPixelRect(ctx, x + 4, y + 12, 18, 4, '#f2fbff');
}

function drawStars(ctx, worldWidth, worldHeight, frameCount, count, colors, heightRatio) {
  for (let i = 0; i < count; i++) {
    const x = (i * 173 + 31) % worldWidth;
    const y = (i * 97 + 13) % Math.floor(worldHeight * heightRatio);
    const bright = Math.floor((frameCount + i * 13) / 22) % 2;
    const color = bright ? '#ffffff' : colors[i % colors.length];
    drawPixelRect(ctx, x, y, bright ? 2 : 1, bright ? 2 : 1, color);
  }
}

function drawNightBackground(ctx, worldWidth, worldHeight, frameCount) {
  drawPixelRect(ctx, 0, 0, worldWidth, worldHeight, '#0c0e24');
  drawStars(ctx, worldWidth, worldHeight, frameCount, 50, ['#8ab4f8', '#b0c8e8', '#c8d8f0'], 0.75);
  drawPixelRect(ctx, 572, 26, 28, 28, '#f5f3cc');
  drawPixelRect(ctx, 582, 26, 14, 28, '#0c0e24');
  drawPixelRect(ctx, 0, 286, worldWidth, worldHeight - 286, '#131420');
  drawPixelRect(ctx, 40, 278, 160, 8, '#131420');
  drawPixelRect(ctx, 80, 272, 80, 6, '#131420');
  drawPixelRect(ctx, 380, 275, 200, 11, '#131420');
  drawPixelRect(ctx, 420, 269, 100, 6, '#131420');
}

function drawVoidBackground(ctx, worldWidth, worldHeight, frameCount) {
  drawPixelRect(ctx, 0, 0, worldWidth, worldHeight, '#040408');
  const prevAlpha = ctx.globalAlpha;
  ctx.globalAlpha = 0.1;
  drawPixelRect(ctx, 50, 30, 240, 160, '#1a0050');
  drawPixelRect(ctx, 390, 20, 210, 140, '#00104a');
  ctx.globalAlpha = prevAlpha;
  drawStars(ctx, worldWidth, worldHeight, frameCount, 80, ['#8ab4f8', '#f8a8cc', '#a8f8cc', '#f8f8a8'], 0.88);
  const cx = Math.floor(worldWidth * 0.62);
  const cy = Math.floor(worldHeight * 0.32);
  const pulse = Math.floor(Math.sin(frameCount * 0.04) * 6) + 14;
  for (let r = pulse; r > 2; r -= 3) {
    const brightness = Math.max(2, Math.floor((1 - r / pulse) * 28)).toString(16).padStart(2, '0');
    drawPixelRect(ctx, cx - r, cy - r, r * 2, r * 2, `#${brightness}00${brightness}`);
  }
  drawPixelRect(ctx, 0, worldHeight - 56, worldWidth, 56, '#080810');
}

function drawBackground(ctx, worldWidth, worldHeight, frameCount, variant = 'day') {
  if (variant === 'night') {
    drawNightBackground(ctx, worldWidth, worldHeight, frameCount);
    return;
  }
  if (variant === 'void') {
    drawVoidBackground(ctx, worldWidth, worldHeight, frameCount);
    return;
  }
  const scroll = frameCount % (worldWidth + 80);
  const slowCloudRange = worldWidth + 100;
  const slowCloudX = wrapPosition((worldWidth + 120) - scroll * 0.6, slowCloudRange);
  const isDusk = variant === 'dusk';
  const sky = isDusk ? '#6777c9' : '#87c7ff';
  const ground = isDusk ? '#4d8d55' : '#5aa05a';
  const hillA = isDusk ? '#5f8c7d' : '#72b27a';
  const hillB = isDusk ? '#54786b' : '#6ea773';

  drawPixelRect(ctx, 0, 0, worldWidth, worldHeight, sky);
  drawPixelRect(ctx, 0, worldHeight - 64, worldWidth, 64, ground);

  drawPixelRect(ctx, 70, 220, 120, 40, hillA);
  drawPixelRect(ctx, 420, 210, 170, 50, hillB);

  drawCloud(ctx, worldWidth - scroll, 54);
  drawCloud(ctx, slowCloudX, 84);
}

function drawPlatform(ctx, platform) {
  drawPixelRect(ctx, platform.x, platform.y, platform.width, platform.height, '#8b5a3c');
  drawPixelRect(ctx, platform.x, platform.y, platform.width, 4, '#b97a57');
}

function drawSpike(ctx, obstacle) {
  const spikeWidth = 8;
  const count = Math.max(1, Math.floor(obstacle.width / spikeWidth));
  for (let i = 0; i < count; i += 1) {
    const x = obstacle.x + i * spikeWidth;
    drawPixelRect(ctx, x + 3, obstacle.y, 2, obstacle.height, '#d3d6db');
    drawPixelRect(ctx, x + 2, obstacle.y + 4, 4, obstacle.height - 4, '#b8bdc3');
    drawPixelRect(ctx, x, obstacle.y + obstacle.height - 2, spikeWidth, 2, '#6d7277');
  }
}

function drawObstacle(ctx, obstacle) {
  const renderedObstacle = {
    ...obstacle,
    x: obstacle.currentX ?? obstacle.x,
    y: obstacle.currentY ?? obstacle.y,
  };
  if (obstacle.type === 'spike' || obstacle.type === 'movingSpike') drawSpike(ctx, renderedObstacle);
}

function drawCollectible(ctx, collectible, frameCount) {
  const bobOffset = Math.sin((frameCount + collectible.x) * 0.08) * 2;
  const px = collectible.x;
  const py = collectible.y + bobOffset;
  const flash = Math.floor(frameCount / 12) % 2;
  const meatMain = flash ? '#b94d41' : '#c7594b';
  const meatShade = flash ? '#983c33' : '#8e352e';
  drawPixelRect(ctx, px, py + 4, 2, 4, '#f1ece3');
  drawPixelRect(ctx, px + 1, py + 5, 2, 2, '#fff');
  drawPixelRect(ctx, px + 3, py + 2, 8, 8, meatMain);
  drawPixelRect(ctx, px + 4, py + 3, 6, 6, meatShade);
  drawPixelRect(ctx, px + 6, py + 4, 3, 3, '#f3b0a2');
  drawPixelRect(ctx, px + 9, py + 5, 2, 2, '#f7d8cf');
}

function drawMovingPlatform(ctx, mapElement, frameCount) {
  const x = mapElement.currentX ?? mapElement.x;
  const y = mapElement.currentY ?? mapElement.y;
  const pulse = Math.floor(frameCount / BOOST_PAD_PULSE_FRAME_DIVISOR) % 2;
  drawPixelRect(ctx, x, y, mapElement.width, mapElement.height, '#4f5964');
  drawPixelRect(ctx, x, y, mapElement.width, 3, '#90a1b3');
  if (pulse) {
    drawPixelRect(ctx, x + 4, y + mapElement.height - 3, mapElement.width - 8, 2, '#d4ebff');
  }
}

function drawBoostPad(ctx, mapElement, frameCount) {
  const x = mapElement.currentX ?? mapElement.x;
  const y = mapElement.currentY ?? mapElement.y;
  const pulse = Math.floor(frameCount / BOOST_PAD_PULSE_FRAME_DIVISOR) % 2;
  const pulseWidth = Math.max(
    BOOST_PAD_MIN_PULSE_WIDTH,
    mapElement.width - BOOST_PAD_INSET * BOOST_PAD_PULSE_INSET_MULTIPLIER,
  );
  const pulseX = x + Math.floor((mapElement.width - pulseWidth) / 2);
  drawPixelRect(ctx, x, y, mapElement.width, mapElement.height, '#505860');
  drawPixelRect(
    ctx,
    x + BOOST_PAD_INSET,
    y + BOOST_PAD_INSET,
    mapElement.width - BOOST_PAD_INSET * 2,
    mapElement.height - BOOST_PAD_INSET * 2,
    '#7bf6ff',
  );
  if (pulse) {
    drawPixelRect(ctx, pulseX, y - 2, pulseWidth, 2, '#d9ffff');
  }
}

function drawMapElement(ctx, mapElement, frameCount) {
  if (mapElement.type === 'boostPad') {
    drawBoostPad(ctx, mapElement, frameCount);
    return;
  }
  if (mapElement.type === 'movingPlatform') {
    drawMovingPlatform(ctx, mapElement, frameCount);
    return;
  }
  if (mapElement.type === 'verticalPath') {
    const x = mapElement.currentX ?? mapElement.x;
    const y = mapElement.currentY ?? mapElement.y;
    drawPixelRect(ctx, x, y, mapElement.width, mapElement.height, '#3b3430');
    drawPixelRect(ctx, x + 2, y, 2, mapElement.height, '#8a6b4c');
    drawPixelRect(ctx, x + mapElement.width - 4, y, 2, mapElement.height, '#8a6b4c');
    for (let rungY = y + 8; rungY < y + mapElement.height - 4; rungY += 12) {
      drawPixelRect(ctx, x + 2, rungY, mapElement.width - 4, 2, '#bf9a74');
    }
  }
}

function drawStartMarker(ctx, start) {
  drawPixelRect(ctx, start.x - 6, start.y + 20, 12, 12, '#7b4f31');
  drawPixelRect(ctx, start.x - 2, start.y - 14, 4, 34, '#f5f7f9');
  drawPixelRect(ctx, start.x + 2, start.y - 14, 10, 10, '#58c86f');
}

function drawEndMarker(ctx, end) {
  const poleX = end.x + 2;
  drawPixelRect(ctx, poleX, end.y, 4, end.height, '#f5f7f9');
  drawPixelRect(ctx, poleX + 4, end.y + 2, 10, 10, '#f17362');
  drawPixelRect(ctx, poleX + 6, end.y + 4, 6, 2, '#ffd89b');
}

function drawPlayer(ctx, state) {
  const block = 4;
  const px = state.player.x;
  const py = state.player.y;
  const body = state.dashActive ? '#6ffff4' : '#4aa35f';
  const dashTrim = state.dashActive ? '#d4fffb' : '#3a844c';
  const isJumping = !state.grounded && state.velocityY < 0;
  const isFalling = !state.grounded && state.velocityY >= 0;
  const isDashing = state.dashActive;
  // Passive idle animation for the dinosaur: breathing bob + occasional blink + tail sway.
  const isIdle = state.grounded && Math.abs(state.player.vx) <= IDLE_VELOCITY_THRESHOLD && !isDashing;
  const idleBreathOffset = isIdle ? Math.sin((state.idleCycle ?? 0) * IDLE_BREATH_FREQUENCY) * IDLE_BREATH_AMPLITUDE : 0;
  const walkPhase = Math.floor(state.walkCycle / 6) % 2;
  const facing = isDashing ? state.dashDirection : state.facing;

  const mapX = (x, w) => (facing === 1 ? x : SPRITE_WIDTH_BLOCKS - x - w);
  const spriteY = py + idleBreathOffset + (isJumping ? -2 : 0) + (isDashing ? -1 : 0);

  const bodyBlocks = [
    [1, 1, 5, 1],
    [1, 2, 6, 1],
    [1, 3, 6, 1],
    [1, 4, 7, 1],
    [2, 5, 5, 1],
    [2, 6, 4, 1],
    [0, 6, 1, 1],
    [0, 5, 2, 1],
  ];

  for (const [x, y, w, h] of bodyBlocks) {
    drawPixelRect(ctx, px + mapX(x, w) * block, spriteY + y * block, w * block, h * block, body);
  }

  const backLegY = isJumping || isDashing ? 6 : walkPhase ? 6 : 5;
  const frontLegY = isJumping || isDashing ? 6 : walkPhase ? 5 : 6;
  drawPixelRect(ctx, px + mapX(2, 1) * block, spriteY + backLegY * block, block, block, dashTrim);
  drawPixelRect(ctx, px + mapX(5, 1) * block, spriteY + frontLegY * block, block, block, dashTrim);

  const tailY = isFalling ? 4 : 5;
  const idleTailLift = isIdle && Math.floor((state.idleCycle ?? 0) / IDLE_TAIL_SWAY_DIVISOR) % 2 === 0 ? IDLE_TAIL_LIFT_AMOUNT : 0;
  const tailColor = isDashing ? '#9afdf4' : '#3f9152';
  drawPixelRect(ctx, px + mapX(0, 2) * block, spriteY + (tailY + idleTailLift) * block, 2 * block, block, tailColor);
  drawPixelRect(ctx, px + mapX(5, 1) * block, spriteY + 2 * block, block, block, '#fff');
  const blinkFrame = isIdle && (state.idleCycle ?? 0) % IDLE_BLINK_CYCLE_LENGTH > IDLE_BLINK_START_FRAME;
  drawPixelRect(ctx, px + mapX(5, 1) * block, spriteY + 2 * block + (blinkFrame ? 2 : 0), 2, blinkFrame ? 1 : 2, '#111');
  drawPixelRect(ctx, px + mapX(7, 1) * block, spriteY + 4 * block, block, block, '#9f6c3f');
}

function drawDashTrail(ctx, state) {
  if (!state.dashActive) return;
  const facing = state.dashDirection;
  const dir = facing === 1 ? -1 : 1;
  const baseX = state.player.x + (facing === 1 ? -4 : state.player.width - 2);
  const baseY = state.player.y + 8;
  const flash = Math.floor(state.frameCount / 2) % 2;
  drawPixelRect(ctx, baseX - 2, baseY - 3, 10, 16, flash ? '#dffffc' : '#b4fff7');
  drawPixelRect(ctx, baseX + dir * 8, baseY + 1, 7, 9, '#8de9df');
  drawPixelRect(ctx, baseX + dir * 15, baseY + 4, 5, 4, '#6dd3c8');
}

export function renderScene(ctx, canvas, state) {
  const worldWidth = state.worldWidth ?? canvas.width;
  const worldHeight = state.worldHeight ?? canvas.height;
  const scale = Math.min(canvas.width / worldWidth, canvas.height / worldHeight);
  const viewportWidth = worldWidth * scale;
  const viewportHeight = worldHeight * scale;
  const offsetX = (canvas.width - viewportWidth) / 2;
  const offsetY = (canvas.height - viewportHeight) / 2;
  const shake = state.screenShake ?? 0;
  const shakeX = shake > 0 ? (Math.random() - 0.5) * shake * 0.6 : 0;
  const shakeY = shake > 0 ? (Math.random() - 0.5) * shake * 0.6 : 0;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  drawPixelRect(ctx, 0, 0, canvas.width, canvas.height, '#111');
  ctx.save();
  ctx.translate(offsetX + shakeX, offsetY + shakeY);
  ctx.scale(scale, scale);
  drawBackground(ctx, worldWidth, worldHeight, state.frameCount, state.backgroundVariant);

  for (const platform of state.platforms) drawPlatform(ctx, platform);
  drawStartMarker(ctx, state.start);
  drawEndMarker(ctx, state.end);
  for (const obstacle of state.obstacles) drawObstacle(ctx, obstacle);
  for (const collectible of state.collectibles) {
    if (!collectible.collected) drawCollectible(ctx, collectible, state.frameCount);
  }
  for (const mapElement of state.mapElements || []) drawMapElement(ctx, mapElement, state.frameCount);
  drawDashTrail(ctx, state);
  drawPlayer(ctx, state);

  ctx.fillStyle = '#16302c';
  ctx.font = HUD_FONT;
  ctx.fillText(`meat: ${state.meatCollected}`, 12, 22);
  ctx.restore();
}
