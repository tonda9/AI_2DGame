export const LEVELS = [
  {
    id: 'meadow-1',
    backgroundVariant: 'day',
    start: { x: 120, y: 180 },
    end: { x: 596, y: 155, width: 16, height: 40 },
    platforms: [
      { x: 0, y: 320, width: 640, height: 40 },
      { x: 180, y: 245, width: 170, height: 20 },
      { x: 420, y: 195, width: 160, height: 20 },
    ],
    obstacles: [{ type: 'spike', x: 360, y: 304, width: 28, height: 16 }],
    collectibles: [
      { x: 245, y: 215, width: 12, height: 12 },
      { x: 510, y: 165, width: 12, height: 12 },
    ],
  },
  {
    id: 'canyon-2',
    backgroundVariant: 'dusk',
    start: { x: 24, y: 278 },
    end: { x: 604, y: 125, width: 16, height: 40 },
    platforms: [
      { x: 0, y: 320, width: 160, height: 40 },
      { x: 230, y: 320, width: 150, height: 40 },
      { x: 450, y: 320, width: 190, height: 40 },
      { x: 110, y: 260, width: 90, height: 18 },
      { x: 260, y: 220, width: 110, height: 18 },
      { x: 440, y: 170, width: 130, height: 18 },
    ],
    obstacles: [
      { type: 'spike', x: 282, y: 204, width: 24, height: 16 },
      { type: 'spike', x: 498, y: 154, width: 24, height: 16 },
    ],
    collectibles: [
      { x: 142, y: 230, width: 12, height: 12 },
      { x: 316, y: 190, width: 12, height: 12 },
      { x: 520, y: 140, width: 12, height: 12 },
    ],
  },
  {
    id: 'blackhole-3',
    backgroundVariant: 'dusk',
    start: { x: 20, y: 278 },
    end: { x: 606, y: 86, width: 16, height: 40 },
    platforms: [
      { x: 0, y: 320, width: 120, height: 40 },
      { x: 170, y: 320, width: 110, height: 40 },
      { x: 330, y: 320, width: 130, height: 40 },
      { x: 510, y: 320, width: 130, height: 40 },
      { x: 92, y: 258, width: 88, height: 18 },
      { x: 230, y: 218, width: 96, height: 18 },
      { x: 372, y: 176, width: 94, height: 18 },
      { x: 516, y: 132, width: 100, height: 18 },
    ],
    obstacles: [
      { type: 'spike', x: 132, y: 304, width: 24, height: 16 },
      { type: 'spike', x: 292, y: 304, width: 24, height: 16 },
      { type: 'spike', x: 474, y: 304, width: 24, height: 16 },
      { type: 'spike', x: 404, y: 160, width: 24, height: 16 },
    ],
    collectibles: [
      { x: 116, y: 228, width: 12, height: 12 },
      { x: 258, y: 188, width: 12, height: 12 },
      { x: 404, y: 146, width: 12, height: 12 },
      { x: 548, y: 102, width: 12, height: 12 },
    ],
    mapElements: [
      { type: 'boostPad', x: 108, y: 246, width: 24, height: 8, forceY: -10.5, forceX: 0 },
      { type: 'boostPad', x: 242, y: 206, width: 24, height: 8, forceY: -10, forceX: 1.2 },
      { type: 'boostPad', x: 530, y: 120, width: 24, height: 8, forceY: -9.5, forceX: 1.1 },
    ],
  },
  {
    id: 'rift-4',
    backgroundVariant: 'dusk',
    start: { x: 24, y: 278 },
    end: { x: 600, y: 66, width: 16, height: 40 },
    platforms: [
      { x: 0, y: 320, width: 120, height: 40 },
      { x: 184, y: 320, width: 96, height: 40 },
      { x: 340, y: 320, width: 96, height: 40 },
      { x: 496, y: 320, width: 144, height: 40 },
      { x: 72, y: 264, width: 84, height: 16 },
      { x: 238, y: 226, width: 80, height: 16 },
      { x: 390, y: 188, width: 80, height: 16 },
      { x: 532, y: 146, width: 86, height: 16 },
    ],
    obstacles: [
      { type: 'spike', x: 138, y: 304, width: 24, height: 16 },
      { type: 'spike', x: 296, y: 304, width: 24, height: 16 },
      { type: 'spike', x: 454, y: 304, width: 24, height: 16 },
      { type: 'movingSpike', x: 268, y: 210, width: 24, height: 16, axis: 'x', range: 32, speed: 0.08 },
      { type: 'movingSpike', x: 558, y: 130, width: 24, height: 16, axis: 'y', range: 18, speed: 0.09 },
    ],
    collectibles: [
      { x: 106, y: 236, width: 12, height: 12 },
      { x: 272, y: 198, width: 12, height: 12 },
      { x: 428, y: 160, width: 12, height: 12 },
      { x: 574, y: 118, width: 12, height: 12 },
    ],
    mapElements: [
      { type: 'boostPad', x: 90, y: 252, width: 24, height: 8, forceY: -10.3, forceX: 0.8 },
      { type: 'movingPlatform', x: 156, y: 248, width: 72, height: 12, axis: 'x', range: 50, speed: 0.05 },
      { type: 'movingPlatform', x: 312, y: 206, width: 72, height: 12, axis: 'y', range: 28, speed: 0.045 },
    ],
  },
];

export function createLevelState(template) {
  return {
    ...template,
    platforms: template.platforms.map((platform) => ({ ...platform })),
    obstacles: template.obstacles.map((obstacle) => ({ ...obstacle })),
    collectibles: template.collectibles.map((collectible) => ({ ...collectible, collected: false })),
    mapElements: (template.mapElements || []).map((mapElement) => ({ ...mapElement })),
  };
}
