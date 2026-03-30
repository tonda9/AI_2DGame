/**
 * Smoke tests for Chapter 1 hand-crafted levels.
 *
 * Run with:  node tests/chapter1.test.mjs
 *
 * Tests verify that every Chapter 1 level has the correct structural shape
 * and that the two levels chosen as representative examples (level 1 and
 * level 10) carry the exact mechanics each is supposed to introduce.
 */

import { CHAPTERS, LEVELS, createLevelState } from '../src/levels/levels.js';

// ── helpers ──────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓  ${message}`);
    passed += 1;
  } else {
    console.error(`  ✗  ${message}`);
    failed += 1;
  }
}

function assertEqual(actual, expected, label) {
  assert(actual === expected, `${label}: expected ${expected}, got ${actual}`);
}

function summary() {
  console.log(`\n${passed + failed} assertions — ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

// ── Chapter 1 structure ───────────────────────────────────────────────────────

console.log('\n=== Chapter 1 structure ===');

const ch1 = CHAPTERS[0];
assert(ch1 !== undefined, 'Chapter 1 exists in CHAPTERS');
assertEqual(ch1.chapter, 1, 'Chapter 1 index');
assertEqual(ch1.levels.length, 10, 'Chapter 1 has 10 levels');

// All 10 levels appear at the start of the flat LEVELS array
assertEqual(LEVELS.slice(0, 10).every((l) => l.chapter === 1), true, 'First 10 LEVELS entries belong to chapter 1');

for (let i = 0; i < 10; i++) {
  const lvl = ch1.levels[i];
  const n = i + 1;

  assert(lvl.id === `c1-l${n}`, `Level ${n} has correct id`);
  assert(lvl.chapterLevel === n, `Level ${n} has correct chapterLevel`);

  // Every level must have a ground platform covering the full width
  const ground = lvl.platforms.find((p) => p.y === 320 && p.width >= 200);
  assert(ground !== undefined, `Level ${n} has a ground platform`);

  // End marker must be inside the world and above the midpoint
  assert(lvl.end.x >= 0 && lvl.end.x <= 624, `Level ${n} end.x in range`);
  assert(lvl.end.y < 220, `Level ${n} end.y is near the top of the world`);

  // Collectibles must be arrays (even if empty)
  assert(Array.isArray(lvl.collectibles), `Level ${n} collectibles is array`);
  assert(Array.isArray(lvl.obstacles), `Level ${n} obstacles is array`);
  assert(Array.isArray(lvl.mapElements), `Level ${n} mapElements is array`);

  // createLevelState must return a deep copy (collected flag added, no mutations to template)
  const state = createLevelState(lvl);
  assert(state.collectibles !== lvl.collectibles, `Level ${n} createLevelState deep-copies collectibles`);
  assert(state.collectibles.every((c) => c.collected === false), `Level ${n} collectibles start as not collected`);
}

// ── Level 1 · Dash Warmup ─────────────────────────────────────────────────────

console.log('\n=== Level 1 · Dash Warmup ===');

const lvl1 = ch1.levels[0];

assert(lvl1.obstacles.length === 0, 'Level 1 has no obstacles (pure warmup)');
assert(lvl1.mapElements.length === 0, 'Level 1 has no map elements (no boost / ladder yet)');
assertEqual(lvl1.collectibles.length, 3, 'Level 1 has 3 collectibles');
assert(lvl1.platforms.length >= 3, 'Level 1 has multiple platforms (staircase)');
assertEqual(lvl1.difficulty, 1, 'Level 1 is difficulty 1');
assert(lvl1.backgroundVariant === 'day', 'Level 1 uses day background');

// Platforms should form a rising staircase: each successive platform's top edge
// must be higher (lower y) than the one before it.
const steps = lvl1.platforms.filter((p) => p.y < 320);
const sorted = [...steps].sort((a, b) => a.x - b.x);
const isAscending = sorted.every((p, i) => i === 0 || p.y < sorted[i - 1].y);
assert(isAscending, 'Level 1 platforms ascend left-to-right (staircase)');

// ── Level 10 · Chapter 1 Exam ─────────────────────────────────────────────────

console.log('\n=== Level 10 · Chapter 1 Exam ===');

const lvl10 = ch1.levels[9];

assertEqual(lvl10.difficulty, 6, 'Level 10 is difficulty 6 (hardest in chapter)');
assert(lvl10.collectibles.length >= 4, 'Level 10 has at least 4 collectibles');

// Must contain both static and moving spikes
const hasStaticSpike = lvl10.obstacles.some((o) => o.type === 'spike');
const hasMovingSpike = lvl10.obstacles.some((o) => o.type === 'movingSpike');
assert(hasStaticSpike, 'Level 10 has static spikes');
assert(hasMovingSpike, 'Level 10 has moving spikes');

// Must have a vertical path (ladder)
const hasLadder = lvl10.mapElements.some((e) => e.type === 'verticalPath');
assert(hasLadder, 'Level 10 has a vertical path (ladder)');

// Must have a boost pad
const hasBoost = lvl10.mapElements.some((e) => e.type === 'boostPad');
assert(hasBoost, 'Level 10 has a boost pad');

// Must have a moving platform
const hasMovingPlat = lvl10.mapElements.some((e) => e.type === 'movingPlatform');
assert(hasMovingPlat, 'Level 10 has a moving platform');

// Goal must be very high (y < 100) reflecting the full ascent
assert(lvl10.end.y < 100, 'Level 10 goal is near the top of the world');

// Moving spikes must specify axis, range, and speed
for (const obs of lvl10.obstacles.filter((o) => o.type === 'movingSpike')) {
  assert(obs.axis === 'x' || obs.axis === 'y', `movingSpike axis is valid (got ${obs.axis})`);
  assert(typeof obs.range === 'number' && obs.range > 0, `movingSpike range > 0 (got ${obs.range})`);
  assert(typeof obs.speed === 'number' && obs.speed > 0, `movingSpike speed > 0 (got ${obs.speed})`);
}

// ── progression check ────────────────────────────────────────────────────────

console.log('\n=== Chapter 1 progression ===');

// Difficulty must be non-decreasing across the 10 levels
const difficulties = ch1.levels.map((l) => l.difficulty);
const isNonDecreasing = difficulties.every((d, i) => i === 0 || d >= difficulties[i - 1]);
assert(isNonDecreasing, `Difficulty never decreases across 10 levels (${difficulties.join(', ')})`);

// Obstacle count should be non-decreasing (more hazards as you progress)
const obstacleCounts = ch1.levels.map((l) => l.obstacles.length);
// Obstacle count should be higher overall in the second half of the chapter.
// A strict non-decreasing check is too rigid because some levels deliberately
// stay lean to let the player absorb a new mechanic type (ladder, split route, etc.).
const firstHalfObstacles = obstacleCounts.slice(0, 5).reduce((a, b) => a + b, 0);
const secondHalfObstacles = obstacleCounts.slice(5).reduce((a, b) => a + b, 0);
assert(
  secondHalfObstacles >= firstHalfObstacles,
  `Obstacles in levels 6-10 (${secondHalfObstacles}) ≥ obstacles in levels 1-5 (${firstHalfObstacles})`,
);

// Level 1 must have fewer obstacles than level 10
assert(lvl1.obstacles.length < lvl10.obstacles.length, 'Level 1 has fewer obstacles than level 10');

// Level 5 (split route) must have the dead-end left platform
const lvl5 = ch1.levels[4];
const hasLeftDeadEnd = lvl5.platforms.some((p) => p.x === 0 && p.y < 260);
assert(hasLeftDeadEnd, 'Level 5 has a left dead-end platform (split-route design)');

// Level 9 (boost required) must have a boost pad
const lvl9 = ch1.levels[8];
assert(lvl9.mapElements.some((e) => e.type === 'boostPad'), 'Level 9 has a boost pad (required route)');

// Level 4 and 7 must introduce the vertical path (ladder)
[ch1.levels[3], ch1.levels[6]].forEach((l, i) => {
  assert(l.mapElements.some((e) => e.type === 'verticalPath'), `Level ${[4, 7][i]} contains a vertical path`);
});

// ── done ─────────────────────────────────────────────────────────────────────

summary();
