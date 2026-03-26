const WORLD_WIDTH = 640;
const GROUND_Y = 320;
const GROUND_HEIGHT = 40;

/**
 * Chapter-first level source of truth.
 * Add new chapters here and LEVELS is derived automatically.
 */
const CHAPTER_DEFINITIONS = [
  {
    chapter: 1,
    id: 'chapter-1',
    name: 'Primeval Meadows',
    coreMechanic: 'Basic movement + dash',
    visualTheme: 'Sunlit ruins with clear jump silhouettes',
    backgroundCycle: ['day', 'dusk', 'day', 'dusk', 'night'],
  },
  {
    chapter: 2,
    id: 'chapter-2',
    name: 'Crystal Caves',
    coreMechanic: 'Moving platforms + timing windows',
    visualTheme: 'Bioluminescent caves with rhythmic machinery',
    backgroundCycle: ['dusk', 'night', 'void', 'night', 'dusk'],
  },
  {
    chapter: 3,
    id: 'chapter-3',
    name: 'Void Peaks',
    coreMechanic: 'Advanced hazards + gravity-like route shifts',
    visualTheme: 'Storm-lit peaks with unstable void energy',
    backgroundCycle: ['night', 'void', 'night', 'void', 'night'],
  },
];

const SECRET_LEVEL_KEYS = new Set(['1-3', '1-7', '2-2', '2-6', '2-9', '3-1', '3-5', '3-8', '3-10']);
const CHAPTER_LEVEL_PLANS = {
  1: [
    { levelNumber: 1, conceptName: 'Dash Warmup', coreMechanicUsed: 'Ground jumps + single safe dash', layoutDescription: 'Wide staircase platforms over harmless floor with one short gap.', newIdeaIntroduced: 'Goal sits after a single mid-air dash cue.', difficulty: 1 },
    { levelNumber: 2, conceptName: 'Corner Confidence', coreMechanicUsed: 'Dash from ledge corners', layoutDescription: 'Alternating short and medium ledges that teach committing to jumps.', newIdeaIntroduced: 'First offset landing where a late dash is safer than early dash.', difficulty: 2 },
    { levelNumber: 3, conceptName: 'Low-Risk Spikes', coreMechanicUsed: 'Dash over readable spike strips', layoutDescription: 'Flat runway with sparse spikes and clear recovery platforms.', newIdeaIntroduced: 'Introduces spike spacing that rewards rhythm over precision.', difficulty: 2 },
    { levelNumber: 4, conceptName: 'Vertical Route A', coreMechanicUsed: 'Intro climb lane + jump exits', layoutDescription: 'One vertical lane connects lower and upper shelves.', newIdeaIntroduced: 'Player must hop out of climb lane onto side platform.', difficulty: 3 },
    { levelNumber: 5, conceptName: 'Dash Re-center', coreMechanicUsed: 'Dash direction correction', layoutDescription: 'Split route with left fakeout and right true path.', newIdeaIntroduced: 'Teaches dashing back toward safety after over-committing.', difficulty: 3 },
    { levelNumber: 6, conceptName: 'Moving Threat Intro', coreMechanicUsed: 'Read single moving hazard timing', layoutDescription: 'Mostly static jumps with one slowly drifting spike.', newIdeaIntroduced: 'First moving hazard appears in a non-lethal training spot.', difficulty: 4 },
    { levelNumber: 7, conceptName: 'Secret Detour', coreMechanicUsed: 'Dash + optional hidden side room', layoutDescription: 'Mainline climb with subtle side opening near wall edge.', newIdeaIntroduced: 'First optional hidden pocket requires reverse dash.', difficulty: 4 },
    { levelNumber: 8, conceptName: 'Ledge Weave', coreMechanicUsed: 'Fast alternating horizontal dashes', layoutDescription: 'Dense weave of medium platforms and spike guards.', newIdeaIntroduced: 'Introduces two consecutive dash commitments with no floor reset.', difficulty: 5 },
    { levelNumber: 9, conceptName: 'Launch Bridge', coreMechanicUsed: 'Boost pad chaining with dash', layoutDescription: 'Boost launch to upper shelf then precision route to end.', newIdeaIntroduced: 'Boost pad now acts as required route segment.', difficulty: 6 },
    { levelNumber: 10, conceptName: 'Chapter 1 Exam', coreMechanicUsed: 'Complete movement kit under pressure', layoutDescription: 'Long multi-tier ascent combining spikes, climb lane, and boost.', newIdeaIntroduced: 'Mixes every chapter 1 lesson into one continuous run.', difficulty: 6 },
  ],
  2: [
    { levelNumber: 1, conceptName: 'Platform Rhythm 1', coreMechanicUsed: 'Single moving platform timing', layoutDescription: 'Safe floor with one horizontal shuttle and obvious boarding point.', newIdeaIntroduced: 'Introduces waiting for platform cycle before jumping.', difficulty: 3 },
    { levelNumber: 2, conceptName: 'Passing Windows', coreMechanicUsed: 'Timed jump between crossing movers', layoutDescription: 'Two moving surfaces cross at center over spikes.', newIdeaIntroduced: 'Player learns to use crossing point as temporary safe zone.', difficulty: 4 },
    { levelNumber: 3, conceptName: 'Clockwork Ladder', coreMechanicUsed: 'Vertical timing climb', layoutDescription: 'Layered platforms with moving hazard guarding each rung.', newIdeaIntroduced: 'Alternating up/down movement creates predictable cadence puzzle.', difficulty: 4 },
    { levelNumber: 4, conceptName: 'Delay Then Dash', coreMechanicUsed: 'Hold position then burst movement', layoutDescription: 'Narrow ledges encourage short stutter-steps before dashing.', newIdeaIntroduced: 'Teaches intentional waiting as a core action.', difficulty: 5 },
    { levelNumber: 5, conceptName: 'Conveyor Illusion', coreMechanicUsed: 'Move with platform momentum windows', layoutDescription: 'Staggered moving platforms drift opposite directions.', newIdeaIntroduced: 'Player must choose route by platform phase, not distance.', difficulty: 5 },
    { levelNumber: 6, conceptName: 'Secret Timing Vault', coreMechanicUsed: 'Optional secret behind timed door lane', layoutDescription: 'Main route climbs right; secret path opens during left cycle.', newIdeaIntroduced: 'Hidden reward appears only when platform timing aligns.', difficulty: 6 },
    { levelNumber: 7, conceptName: 'Triple Beat', coreMechanicUsed: 'Three-step timing chain', layoutDescription: 'Three movers with increasing speed and spike separators.', newIdeaIntroduced: 'Requires planning two moves ahead without pixel-perfect spacing.', difficulty: 6 },
    { levelNumber: 8, conceptName: 'Switchback Clock', coreMechanicUsed: 'Horizontal + vertical timing swap', layoutDescription: 'Route zigzags between horizontal ride and vertical pop-up.', newIdeaIntroduced: 'Switches timing style mid-level to stress adaptation.', difficulty: 7 },
    { levelNumber: 9, conceptName: 'False Safe Spot', coreMechanicUsed: 'Punishing idle timing mistakes', layoutDescription: 'Small resting ledges become unsafe as hazards sweep through.', newIdeaIntroduced: 'Teaches that waiting place can expire over time.', difficulty: 7 },
    { levelNumber: 10, conceptName: 'Chapter 2 Exam', coreMechanicUsed: 'Mastery of timing routes and movers', layoutDescription: 'Full-length gauntlet of timed movers, spikes, and one boost escape.', newIdeaIntroduced: 'Combines rhythm reading with quick corrective dashes.', difficulty: 8 },
  ],
  3: [
    { levelNumber: 1, conceptName: 'Gravity Feelers', coreMechanicUsed: 'Route inversion via vertical shafts', layoutDescription: 'Climb lanes reposition player above hazards before drop-ins.', newIdeaIntroduced: 'First gravity-like route flip without changing controls.', difficulty: 5 },
    { levelNumber: 2, conceptName: 'Multi-Burst Intro', coreMechanicUsed: 'Chained boosts simulating multi-dash', layoutDescription: 'Boost-to-boost traversal over deep hazard basin.', newIdeaIntroduced: 'Player links momentum segments as if managing extra dashes.', difficulty: 6 },
    { levelNumber: 3, conceptName: 'Hazard Braids', coreMechanicUsed: 'Threading between layered moving spikes', layoutDescription: 'Two moving hazard lanes braid around safe ledges.', newIdeaIntroduced: 'Introduces alternating high/low threat lanes.', difficulty: 6 },
    { levelNumber: 4, conceptName: 'Reverse Climb', coreMechanicUsed: 'Descend then re-ascend routing', layoutDescription: 'Goal path starts upward, drops through shaft, then climbs back.', newIdeaIntroduced: 'Backtracking route structure changes pacing expectations.', difficulty: 7 },
    { levelNumber: 5, conceptName: 'Secret Storm Pocket', coreMechanicUsed: 'Optional hazard tunnel detour', layoutDescription: 'Mainline route is stable; secret lane sits behind moving hazard sweep.', newIdeaIntroduced: 'Hidden reward gated by advanced timing confidence.', difficulty: 7 },
    { levelNumber: 6, conceptName: 'Pulse Lattice', coreMechanicUsed: 'Sustained timing under dense hazards', layoutDescription: 'Lattice of short ledges with synchronous moving spikes.', newIdeaIntroduced: 'Encourages tempo play where every jump matches hazard pulse.', difficulty: 8 },
    { levelNumber: 7, conceptName: 'Void Relay', coreMechanicUsed: 'Rapid transitions between mechanic types', layoutDescription: 'Alternates boost launch, climb lane, and moving platform catches.', newIdeaIntroduced: 'No repeated segment type appears twice in a row.', difficulty: 8 },
    { levelNumber: 8, conceptName: 'Split-Screen Thinking', coreMechanicUsed: 'Parallel route evaluation', layoutDescription: 'Upper fast route and lower safer route reconnect near goal.', newIdeaIntroduced: 'Player chooses risk profile mid-level without dead-end punishment.', difficulty: 9 },
    { levelNumber: 9, conceptName: 'Final Ascent Setup', coreMechanicUsed: 'Endurance routing with minimal downtime', layoutDescription: 'Extended vertical climb with sparse reset points.', newIdeaIntroduced: 'Demands consistency over a longer uninterrupted sequence.', difficulty: 9 },
    { levelNumber: 10, conceptName: 'Void Peak Finale', coreMechanicUsed: 'Full advanced-system mastery', layoutDescription: 'Capstone level combining chained boosts, moving hazards, and inversion paths.', newIdeaIntroduced: 'Final exam that remixes all chapter 3 ideas in one route.', difficulty: 10 },
  ],
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function createBasePlatforms(globalLevelIndex) {
  const layoutType = globalLevelIndex % 3;
  const steps = 4 + Math.floor(globalLevelIndex / 4);
  const yStepByLayout = [24, 26, 22];
  const yStep = yStepByLayout[layoutType] ?? 24;
  const platforms = [{ x: 0, y: GROUND_Y, width: WORLD_WIDTH, height: GROUND_HEIGHT }];

  for (let i = 0; i < steps; i += 1) {
    let wobble = 0;
    if (layoutType === 1) {
      wobble = i % 2 === 0 ? -12 : 12;
    } else if (layoutType === 2) {
      wobble = ((i % 3) - 1) * 8;
    }
    const x = 78 + i * 86 + wobble;
    const y = clamp(274 - i * yStep + (globalLevelIndex % 4), 72, 286);
    const width = clamp(88 - Math.floor(globalLevelIndex / 5) * 4 + ((i % 2) ? -6 : 6), 52, 98);

    if (x + width < WORLD_WIDTH - 10) {
      platforms.push({ x, y, width, height: 14 });
    }
  }

  return platforms;
}

function createObstacles(chapterIndex, levelInChapter, globalLevelIndex) {
  const obstacleCount = Math.min(9, 1 + Math.floor(globalLevelIndex / 3) + chapterIndex * 2 + (levelInChapter > 7 ? 1 : 0));
  const movingCount = Math.min(obstacleCount - 1, Math.floor(globalLevelIndex / 5) + chapterIndex);
  const staticCount = obstacleCount - movingCount;
  const obstacles = [];

  for (let i = 0; i < staticCount; i += 1) {
    const x = 92 + ((i * 67 + levelInChapter * 23 + chapterIndex * 11) % 500);
    obstacles.push({ type: 'spike', x, y: 304, width: 24, height: 16 });
  }

  for (let i = 0; i < movingCount; i += 1) {
    const axis = (i + globalLevelIndex) % 2 === 0 ? 'x' : 'y';
    const x = 150 + ((i * 96 + levelInChapter * 17) % 420);
    const y = axis === 'x' ? 174 + (i % 3) * 28 : 112 + (i % 4) * 30;
    obstacles.push({
      type: 'movingSpike',
      x,
      y,
      width: 24,
      height: 16,
      axis,
      range: 22 + chapterIndex * 8 + (globalLevelIndex % 3) * 5,
      speed: 0.065 + globalLevelIndex * 0.002 + i * 0.008,
    });
  }

  return obstacles;
}

function createMapElements(chapterIndex, globalLevelIndex) {
  const boostCount = 1 + Math.floor(globalLevelIndex / 10);
  const movingPlatformCount = 1 + Math.floor(globalLevelIndex / 8);
  const verticalPathCount = 3;
  const mapElements = [];

  for (let i = 0; i < boostCount; i += 1) {
    mapElements.push({
      type: 'boostPad',
      x: clamp(72 + i * 178 + (globalLevelIndex % 4) * 10, 24, 590),
      y: clamp(296 - i * 26, 120, 304),
      width: 24,
      height: 8,
      forceY: -10.0 - chapterIndex * 0.35 - i * 0.2,
      forceX: 0.5 + (i % 2) * 0.6,
    });
  }

  for (let i = 0; i < movingPlatformCount; i += 1) {
    mapElements.push({
      type: 'movingPlatform',
      x: clamp(132 + i * 154 + (globalLevelIndex % 3) * 8, 26, 560),
      y: clamp(254 - i * 34, 96, 286),
      width: clamp(74 - i * 8, 46, 74),
      height: 12,
      axis: i % 2 === 0 ? 'x' : 'y',
      range: 26 + chapterIndex * 8 + i * 6,
      speed: 0.042 + globalLevelIndex * 0.001 + i * 0.008,
    });
  }

  for (let i = 0; i < verticalPathCount; i += 1) {
    const baseXByLane = [42, 292, 548];
    const laneDrift = ((globalLevelIndex + i * 3) % 4) * 10 - 12;
    mapElements.push({
      type: 'verticalPath',
      x: clamp(baseXByLane[i] + laneDrift, 16, 612),
      y: clamp(66 + ((globalLevelIndex + i) % 3) * 12, 52, 132),
      width: 12,
      height: clamp(214 + chapterIndex * 10 + ((globalLevelIndex + i) % 3) * 8, 200, 260),
    });
  }

  return mapElements;
}

function createCollectibles(platforms, chapterIndex, globalLevelIndex, hasSecret) {
  const baseCount = Math.min(6, 2 + Math.floor(globalLevelIndex / 6) + chapterIndex);
  const collectibles = [];

  for (let i = 0; i < baseCount; i += 1) {
    const platform = platforms[clamp(i + 1, 1, platforms.length - 1)];
    collectibles.push({
      x: clamp(Math.round(platform.x + platform.width / 2 - 6 + ((i % 2) ? 8 : -8)), 8, 620),
      y: clamp(platform.y - 18 - (i % 3) * 3, 12, 300),
      width: 12,
      height: 12,
    });
  }

  if (hasSecret) {
    const leftSideSecret = globalLevelIndex % 2 === 0;
    const hiddenPlatformX = leftSideSecret ? 12 : 556;
    const hiddenPlatformY = 62 + (globalLevelIndex % 3) * 10;

    platforms.push({ x: hiddenPlatformX, y: hiddenPlatformY, width: 72, height: 12, hidden: true });
    collectibles.push({
      x: hiddenPlatformX + 28,
      y: hiddenPlatformY - 16,
      width: 12,
      height: 12,
      secret: true,
    });
  }

  return collectibles;
}

function findTopmostPlatform(platforms) {
  return platforms.reduce((highestPlatform, currentPlatform) => (currentPlatform.y < highestPlatform.y ? currentPlatform : highestPlatform), platforms[0]);
}

function createLevel(chapter, chapterIndex, levelInChapter) {
  const globalLevelIndex = chapterIndex * 10 + levelInChapter - 1;
  const designPlan = CHAPTER_LEVEL_PLANS[chapter.chapter][levelInChapter - 1];
  const platforms = createBasePlatforms(globalLevelIndex);
  const hasSecret = SECRET_LEVEL_KEYS.has(`${chapter.chapter}-${levelInChapter}`);
  const collectibles = createCollectibles(platforms, chapterIndex, globalLevelIndex, hasSecret);
  const topPlatform = findTopmostPlatform(platforms);

  return {
    id: `c${chapter.chapter}-l${levelInChapter}`,
    chapter: chapter.chapter,
    chapterLevel: levelInChapter,
    backgroundVariant: chapter.backgroundCycle[(levelInChapter - 1) % chapter.backgroundCycle.length],
    conceptName: designPlan.conceptName,
    coreMechanicUsed: designPlan.coreMechanicUsed,
    layoutDescription: designPlan.layoutDescription,
    newIdeaIntroduced: designPlan.newIdeaIntroduced,
    difficulty: designPlan.difficulty,
    chapterCoreMechanic: chapter.coreMechanic,
    chapterVisualTheme: chapter.visualTheme,
    start: { x: 22, y: 276 },
    end: {
      x: clamp(topPlatform.x + topPlatform.width - 16, 560, 612),
      y: clamp(topPlatform.y - 40, 34, 210),
      width: 16,
      height: 40,
    },
    platforms,
    obstacles: createObstacles(chapterIndex, levelInChapter, globalLevelIndex),
    collectibles,
    mapElements: createMapElements(chapterIndex, globalLevelIndex),
  };
}

/**
 * 3 chapters × 10 levels, flattened for runtime compatibility.
 * Difficulty rises by increasing obstacle density, motion complexity and tighter routes per global level index.
 */
export const CHAPTERS = CHAPTER_DEFINITIONS.map((chapter, chapterIndex) => ({
  ...chapter,
  levels: Array.from({ length: 10 }, (_, index) => createLevel(chapter, chapterIndex, index + 1)),
}));

export const LEVELS = CHAPTERS.flatMap((chapter) => chapter.levels);
export const LEVEL_DESIGNS = CHAPTERS.flatMap((chapter) => chapter.levels.map((level) => ({
  chapter: level.chapter,
  levelNumber: level.chapterLevel,
  conceptName: level.conceptName,
  coreMechanicUsed: level.coreMechanicUsed,
  layoutDescription: level.layoutDescription,
  newIdeaIntroduced: level.newIdeaIntroduced,
  difficulty: level.difficulty,
  chapterCoreMechanic: level.chapterCoreMechanic,
  chapterVisualTheme: level.chapterVisualTheme,
})));

export function createLevelState(template) {
  return {
    ...template,
    platforms: template.platforms.map((platform) => ({ ...platform })),
    obstacles: template.obstacles.map((obstacle) => ({ ...obstacle })),
    collectibles: template.collectibles.map((collectible) => ({ ...collectible, collected: false })),
    mapElements: (template.mapElements || []).map((mapElement) => ({ ...mapElement })),
  };
}
