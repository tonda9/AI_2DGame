import { Input } from './core/input.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const input = new Input();

const player = { x: 304, y: 168 };
const speed = 2;

function update() {
  if (input.isDown('left')) player.x -= speed;
  if (input.isDown('right')) player.x += speed;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#4aa3ff';
  ctx.fillRect(player.x, player.y, 32, 32);

  ctx.fillStyle = '#fff';
  ctx.font = '14px monospace';
  ctx.fillText(`hold:  L=${input.isDown('left')} R=${input.isDown('right')}`, 16, 24);
  ctx.fillText(`press: J=${input.isPressed('jump')} D=${input.isPressed('dash')}`, 16, 44);
}

function frame() {
  update();
  draw();
  input.endFrame();
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
