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
];

export function createLevelState(template) {
  return {
    ...template,
    platforms: template.platforms.map((platform) => ({ ...platform })),
    obstacles: template.obstacles.map((obstacle) => ({ ...obstacle })),
    collectibles: template.collectibles.map((collectible) => ({ ...collectible, collected: false })),
  };
}
