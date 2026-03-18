const HUD_FONT = '14px monospace';

function drawPixelRect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawBackground(ctx, canvas) {
  drawPixelRect(ctx, 0, 0, canvas.width, canvas.height, '#87c7ff');
  drawPixelRect(ctx, 0, canvas.height - 64, canvas.width, 64, '#5aa05a');

  drawPixelRect(ctx, 70, 220, 120, 40, '#72b27a');
  drawPixelRect(ctx, 420, 210, 170, 50, '#6ea773');
}

function drawPlatform(ctx, platform) {
  drawPixelRect(ctx, platform.x, platform.y, platform.width, platform.height, '#8b5a3c');
  drawPixelRect(ctx, platform.x, platform.y, platform.width, 4, '#b97a57');
}

function drawPlayer(ctx, player, dashActive) {
  const block = 4;
  const px = player.x;
  const py = player.y;
  const body = dashActive ? '#6ffff4' : '#4aa35f';

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
    drawPixelRect(ctx, px + x * block, py + y * block, w * block, h * block, body);
  }

  drawPixelRect(ctx, px + 5 * block, py + 2 * block, block, block, '#fff');
  drawPixelRect(ctx, px + 5 * block, py + 2 * block, 2, 2, '#111');
  drawPixelRect(ctx, px + 7 * block, py + 4 * block, block, block, '#9f6c3f');
}

export function renderScene(ctx, canvas, state) {
  drawBackground(ctx, canvas);

  for (const platform of state.platforms) drawPlatform(ctx, platform);

  if (state.dashActive) {
    drawPixelRect(ctx, state.player.x - 4, state.player.y + 8, 6, 10, '#b4fff7');
  }
  drawPlayer(ctx, state.player, state.dashActive);

  ctx.fillStyle = '#16302c';
  ctx.font = HUD_FONT;
  ctx.fillText(`hold: L=${state.holdLeft} R=${state.holdRight}`, 12, 22);
  ctx.fillText(`press: J=${state.pressJump} D=${state.pressDash}`, 12, 40);
}
