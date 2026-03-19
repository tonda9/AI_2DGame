let audioCtx = null;

function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function tone({ freq, endFreq = null, type = 'square', vol = 0.15, dur, delay = 0 }) {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = type;
  const t = ctx.currentTime + delay;
  osc.frequency.setValueAtTime(freq, t);
  if (endFreq !== null) osc.frequency.exponentialRampToValueAtTime(endFreq, t + dur);
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.start(t);
  osc.stop(t + dur + 0.01);
}

export function playJump() {
  tone({ freq: 320, endFreq: 500, dur: 0.1 });
}

export function playDash() {
  tone({ freq: 200, endFreq: 80, type: 'sawtooth', vol: 0.17, dur: 0.13 });
}

export function playLand() {
  tone({ freq: 100, dur: 0.07, vol: 0.12 });
}

export function playCollect() {
  tone({ freq: 660, dur: 0.07 });
  tone({ freq: 880, dur: 0.09, delay: 0.07 });
}

export function playDeath() {
  tone({ freq: 380, endFreq: 60, dur: 0.3, vol: 0.18 });
}

export function playLevelComplete() {
  [440, 554, 659, 880].forEach((f, i) => tone({ freq: f, dur: 0.14, delay: i * 0.09 }));
}
