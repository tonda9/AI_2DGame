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
    backgroundCycle: ['day', 'dusk', 'day', 'dusk', 'night'],
  },
  {
    chapter: 2,
    id: 'chapter-2',
    name: 'Crystal Caves',
    backgroundCycle: ['dusk', 'night', 'void', 'night', 'dusk'],
  },
  {
    chapter: 3,
    id: 'chapter-3',
    name: 'Void Peaks',
    backgroundCycle: ['night', 'void', 'night', 'void', 'night'],
  },
];

const SECRET_LEVEL_KEYS = new Set(['1-3', '1-7', '2-2', '2-6', '2-9', '3-1', '3-5', '3-8', '3-10']);

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
  const verticalPathCount = 1 + Math.floor(globalLevelIndex / 12);
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
    mapElements.push({
      type: 'verticalPath',
      x: clamp(84 + i * 176 + (globalLevelIndex % 5) * 12, 18, 604),
      y: clamp(86 + (i % 2) * 24, 72, 180),
      width: 12,
      height: clamp(150 + chapterIndex * 16 + (globalLevelIndex % 3) * 12, 140, 228),
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
  const platforms = createBasePlatforms(globalLevelIndex);
  const hasSecret = SECRET_LEVEL_KEYS.has(`${chapter.chapter}-${levelInChapter}`);
  const collectibles = createCollectibles(platforms, chapterIndex, globalLevelIndex, hasSecret);
  const topPlatform = findTopmostPlatform(platforms);

  return {
    id: `c${chapter.chapter}-l${levelInChapter}`,
    chapter: chapter.chapter,
    chapterLevel: levelInChapter,
    backgroundVariant: chapter.backgroundCycle[(levelInChapter - 1) % chapter.backgroundCycle.length],
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

export function createLevelState(template) {
  return {
    ...template,
    platforms: template.platforms.map((platform) => ({ ...platform })),
    obstacles: template.obstacles.map((obstacle) => ({ ...obstacle })),
    collectibles: template.collectibles.map((collectible) => ({ ...collectible, collected: false })),
    mapElements: (template.mapElements || []).map((mapElement) => ({ ...mapElement })),
  };
}
