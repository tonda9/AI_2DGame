import { LEVELS } from './levels.js';

const PLAYER_WIDTH = 32;
const PLAYER_HEIGHT = 32;
const MAX_JUMP_RISE = 168;
const MAX_JUMP_RUN = 176;
const BOOST_JUMP_RISE = 228;
const BOOST_JUMP_RUN = 240;
const MAX_SAFE_DROP = 240;
const LADDER_LINK_RANGE_X = 68;
const LADDER_LINK_RANGE_Y = 36;
// Floating-point tolerance prevents tiny precision noise from reporting false in/out rectangle misses.
const EPSILON = 0.0001;

function resolveEntityRect(entity) {
  const range = entity.range ?? 0;
  const axis = entity.axis === 'y' ? 'y' : 'x';
  const minX = axis === 'x' ? entity.x - range : entity.x;
  const maxX = axis === 'x' ? entity.x + range : entity.x;
  const minY = axis === 'y' ? entity.y - range : entity.y;
  const maxY = axis === 'y' ? entity.y + range : entity.y;
  return {
    x: minX,
    y: minY,
    width: entity.width + (maxX - minX),
    height: entity.height + (maxY - minY),
  };
}

function pointInRect(point, rect) {
  return (
    point.x >= rect.x - EPSILON
    && point.x <= rect.x + rect.width + EPSILON
    && point.y >= rect.y - EPSILON
    && point.y <= rect.y + rect.height + EPSILON
  );
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function collectNavigablePlatforms(level) {
  const movingPlatforms = (level.mapElements || [])
    .filter((mapElement) => mapElement.type === 'movingPlatform')
    .map((mapElement) => resolveEntityRect({
      x: mapElement.x,
      y: mapElement.y,
      width: mapElement.width,
      height: mapElement.height,
      axis: mapElement.axis,
      range: mapElement.range,
    }));

  return [...level.platforms, ...movingPlatforms];
}

function createPlatformNodes(platforms) {
  return platforms.map((platform, index) => ({
    id: `platform-${index}`,
    kind: platform.hidden ? 'hiddenPlatform' : 'platform',
    x: Math.round(clamp(platform.x + platform.width / 2 - PLAYER_WIDTH / 2, platform.x, platform.x + platform.width - PLAYER_WIDTH)),
    y: platform.y - PLAYER_HEIGHT,
    source: platform,
  }));
}

function createCollectibleNodes(collectibles) {
  return collectibles.map((collectible, index) => ({
    id: `collectible-${index}`,
    kind: collectible.secret ? 'secretCollectible' : 'collectible',
    x: collectible.x,
    y: collectible.y,
    source: collectible,
  }));
}

function createGoalNodes(level) {
  return [
    {
      id: 'start',
      kind: 'start',
      x: level.start.x,
      y: level.start.y,
      source: level.start,
    },
    {
      id: 'goal',
      kind: 'goal',
      x: level.end.x,
      y: level.end.y,
      source: level.end,
    },
  ];
}

function createVerticalPathZones(level) {
  return (level.mapElements || [])
    .filter((mapElement) => mapElement.type === 'verticalPath')
    .map((path) => ({ x: path.x, y: path.y, width: path.width, height: path.height }));
}

function createVerticalPathNodes(verticalPaths) {
  const nodes = [];
  verticalPaths.forEach((path, index) => {
    const centerX = Math.round(path.x + path.width / 2 - PLAYER_WIDTH / 2);
    nodes.push({
      id: `vertical-top-${index}`,
      kind: 'verticalPath',
      x: centerX,
      y: Math.round(path.y - PLAYER_HEIGHT),
      source: path,
    });
    nodes.push({
      id: `vertical-mid-${index}`,
      kind: 'verticalPath',
      x: centerX,
      y: Math.round(path.y + path.height / 2 - PLAYER_HEIGHT / 2),
      source: path,
    });
    nodes.push({
      id: `vertical-bottom-${index}`,
      kind: 'verticalPath',
      x: centerX,
      y: Math.round(path.y + path.height - PLAYER_HEIGHT),
      source: path,
    });
  });
  return nodes;
}

function createHazardZones(level) {
  return (level.obstacles || [])
    .filter((obstacle) => obstacle.type === 'spike' || obstacle.type === 'movingSpike')
    .map(resolveEntityRect);
}

function nearVerticalPath(node, path) {
  const playerCenterX = node.x + PLAYER_WIDTH / 2;
  const playerCenterY = node.y + PLAYER_HEIGHT / 2;
  return (
    playerCenterX >= path.x - 8
    && playerCenterX <= path.x + path.width + 8
    && playerCenterY >= path.y - 12
    && playerCenterY <= path.y + path.height + 12
  );
}

function canAttachToVerticalPath(node, path) {
  const nodeCenterX = node.x + PLAYER_WIDTH / 2;
  const nodeBottomY = node.y + PLAYER_HEIGHT;
  return (
    Math.abs(nodeCenterX - (path.x + path.width / 2)) <= LADDER_LINK_RANGE_X
    && nodeBottomY >= path.y - LADDER_LINK_RANGE_Y
    && nodeBottomY <= path.y + path.height + LADDER_LINK_RANGE_Y
  );
}

function canTraverseWithJump(from, to, boostPads) {
  const dx = Math.abs(to.x - from.x);
  const dy = to.y - from.y;
  if (dy >= 0) return dy <= MAX_SAFE_DROP && dx <= MAX_JUMP_RUN + 36;
  if (Math.abs(dy) <= MAX_JUMP_RISE && dx <= MAX_JUMP_RUN) return true;

  for (const boostPad of boostPads) {
    const nearBoostPad = (
      from.x + PLAYER_WIDTH > boostPad.x - 28
      && from.x < boostPad.x + boostPad.width + 28
      && Math.abs((from.y + PLAYER_HEIGHT) - boostPad.y) <= 20
    );
    if (!nearBoostPad) continue;
    if (Math.abs(dy) <= BOOST_JUMP_RISE && dx <= BOOST_JUMP_RUN) return true;
  }

  return false;
}

function analyzeLevel(level) {
  const platforms = collectNavigablePlatforms(level);
  const platformNodes = createPlatformNodes(platforms);
  const collectibleNodes = createCollectibleNodes(level.collectibles || []);
  const verticalPaths = createVerticalPathZones(level);
  const verticalPathNodes = createVerticalPathNodes(verticalPaths);
  const baseNodes = [...createGoalNodes(level), ...platformNodes, ...collectibleNodes, ...verticalPathNodes];
  const boostPads = (level.mapElements || []).filter((mapElement) => mapElement.type === 'boostPad');
  const hazardZones = createHazardZones(level);

  const hazardTouches = (node) => hazardZones.some((hazard) => pointInRect({
    x: node.x + PLAYER_WIDTH / 2,
    y: node.y + PLAYER_HEIGHT / 2,
  }, hazard));

  const graph = new Map(baseNodes.map((node) => [node.id, new Set()]));
  for (const from of baseNodes) {
    for (const to of baseNodes) {
      if (from.id === to.id) continue;

      const connectedByPath = verticalPaths.some((path) => nearVerticalPath(from, path) && nearVerticalPath(to, path));
      const connectedToPath = verticalPaths.some((path) => canAttachToVerticalPath(from, path) && canAttachToVerticalPath(to, path));
      if (connectedByPath || connectedToPath || canTraverseWithJump(from, to, boostPads)) {
        graph.get(from.id).add(to.id);
      }
    }
  }

  const visited = new Set(['start']);
  const queue = ['start'];
  while (queue.length) {
    const current = queue.shift();
    for (const next of graph.get(current) || []) {
      if (visited.has(next)) continue;
      visited.add(next);
      queue.push(next);
    }
  }

  const requiredNodes = baseNodes.filter((node) => (
    node.kind === 'platform'
    || node.kind === 'hiddenPlatform'
    || node.kind === 'collectible'
    || node.kind === 'secretCollectible'
    || node.kind === 'goal'
  ));

  const unreachable = requiredNodes
    .filter((node) => !visited.has(node.id))
    .map((node) => ({ id: node.id, kind: node.kind, x: node.x, y: node.y }));

  const hazardContacts = requiredNodes
    .filter((node) => hazardTouches(node))
    .map((node) => ({ id: node.id, kind: node.kind, x: node.x, y: node.y }));

  return {
    levelId: level.id,
    unreachable,
    hazardContacts,
    totalChecked: requiredNodes.length,
  };
}

const report = LEVELS.map(analyzeLevel);
const levelsWithIssues = report.filter((entry) => entry.unreachable.length > 0);
const levelsWithHazards = report.filter((entry) => entry.hazardContacts.length > 0);

if (levelsWithIssues.length === 0) {
  console.log(`Accessibility report: all ${LEVELS.length} levels passed reachability checks.`);
  if (levelsWithHazards.length > 0) {
    console.log(`Hazard note: ${levelsWithHazards.length} level(s) contain risky nodes near spike zones (still considered reachable).`);
  }
  process.exit(0);
}

console.log(`Accessibility report: ${levelsWithIssues.length} level(s) contain unreachable areas.`);
for (const issue of levelsWithIssues) {
  console.log(`- ${issue.levelId}`);
  for (const node of issue.unreachable) {
    console.log(`  • ${node.kind} at (${node.x}, ${node.y})`);
  }
}
process.exit(1);
