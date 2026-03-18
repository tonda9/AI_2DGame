const HUD_FONT = '14px monospace';
const SPRITE_WIDTH_BLOCKS = 8;

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

function drawBackground(ctx, canvas, frameCount) {
  const scroll = frameCount % (canvas.width + 80);
  const slowCloudRange = canvas.width + 100;
  const slowCloudX = wrapPosition((canvas.width + 120) - scroll * 0.6, slowCloudRange);

  drawPixelRect(ctx, 0, 0, canvas.width, canvas.height, '#87c7ff');
  drawPixelRect(ctx, 0, canvas.height - 64, canvas.width, 64, '#5aa05a');

  drawPixelRect(ctx, 70, 220, 120, 40, '#72b27a');
  drawPixelRect(ctx, 420, 210, 170, 50, '#6ea773');

  drawCloud(ctx, canvas.width - scroll, 54);
  drawCloud(ctx, slowCloudX, 84);
}

function drawPlatform(ctx, platform) {
  drawPixelRect(ctx, platform.x, platform.y, platform.width, platform.height, '#8b5a3c');
  drawPixelRect(ctx, platform.x, platform.y, platform.width, 4, '#b97a57');
}

function drawPlayer(ctx, state) {
  const block = 4;
  const px = state.player.x;
  const py = state.player.y;
  const body = state.dashActive ? '#6ffff4' : '#4aa35f';
  const isJumping = !state.grounded && state.velocityY < 0;
  const isFalling = !state.grounded && state.velocityY >= 0;
  const walkPhase = Math.floor(state.walkCycle / 6) % 2;
  const facing = state.facing;

  const mapX = (x, w) => (facing === 1 ? x : SPRITE_WIDTH_BLOCKS - x - w);
  const spriteY = py + (isJumping ? -2 : 0);

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

  const backLegY = isJumping ? 6 : walkPhase ? 6 : 5;
  const frontLegY = isJumping ? 6 : walkPhase ? 5 : 6;
  drawPixelRect(ctx, px + mapX(2, 1) * block, spriteY + backLegY * block, block, block, '#3a844c');
  drawPixelRect(ctx, px + mapX(5, 1) * block, spriteY + frontLegY * block, block, block, '#3a844c');

  const tailY = isFalling ? 4 : 5;
  drawPixelRect(ctx, px + mapX(0, 2) * block, spriteY + tailY * block, 2 * block, block, '#3f9152');
  drawPixelRect(ctx, px + mapX(5, 1) * block, spriteY + 2 * block, block, block, '#fff');
  drawPixelRect(ctx, px + mapX(5, 1) * block, spriteY + 2 * block, 2, 2, '#111');
  drawPixelRect(ctx, px + mapX(7, 1) * block, spriteY + 4 * block, block, block, '#9f6c3f');
}

function drawDashTrail(ctx, state) {
  if (!state.dashActive) return;
  const dir = state.facing === 1 ? -1 : 1;
  const baseX = state.player.x + (state.facing === 1 ? -4 : state.player.width - 2);
  const baseY = state.player.y + 8;
  drawPixelRect(ctx, baseX, baseY, 6, 10, '#b4fff7');
  drawPixelRect(ctx, baseX + dir * 6, baseY + 2, 5, 7, '#8de9df');
  drawPixelRect(ctx, baseX + dir * 12, baseY + 3, 4, 5, '#6dd3c8');
}

export function renderScene(ctx, canvas, state) {
  drawBackground(ctx, canvas, state.frameCount);

  for (const platform of state.platforms) drawPlatform(ctx, platform);
  drawDashTrail(ctx, state);
  drawPlayer(ctx, state);

  ctx.fillStyle = '#16302c';
  ctx.font = HUD_FONT;
  ctx.fillText(`hold: L=${state.holdLeft} R=${state.holdRight}`, 12, 22);
  ctx.fillText(`press: J=${state.pressJump} D=${state.pressDash}`, 12, 40);
}
