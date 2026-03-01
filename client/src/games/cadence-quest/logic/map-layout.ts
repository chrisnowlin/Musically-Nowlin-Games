/** Map viewBox dimensions - used for responsive scaling */
export const MAP_VIEWBOX = { width: 500, height: 400 };

/** Position and display config for each region on the explorable map */
export interface MapNodeConfig {
  regionId: string;
  /** x position 0-100 (percent of map width) */
  x: number;
  /** y position 0-100 (percent of map height) */
  y: number;
  /** Icon/emoji for the region (fallback) */
  icon: string;
  /** 8-bit sprite path (transparent SVG) */
  spritePath: string;
  /** Accent color for the node glow/border */
  color: string;
}

/** Path between nodes as bezier control points or polyline */
export interface MapPath {
  from: string;
  to: string;
  /** SVG path d string (curved or straight) */
  pathD: string;
}

export const MAP_NODES: MapNodeConfig[] = [
  {
    regionId: 'rhythm-realm',
    x: 12,
    y: 80,
    icon: '🥁',
    spritePath: '/images/cadence-quest/map-drum.svg',
    color: '#a855f7',
  },
  {
    regionId: 'melody-mountains',
    x: 28,
    y: 50,
    icon: '⛰️',
    spritePath: '/images/cadence-quest/map-mountain.svg',
    color: '#3b82f6',
  },
  {
    regionId: 'harmony-harbor',
    x: 52,
    y: 35,
    icon: '⚓',
    spritePath: '/images/cadence-quest/map-anchor.svg',
    color: '#06b6d4',
  },
  {
    regionId: 'dynamics-desert',
    x: 76,
    y: 55,
    icon: '☀️',
    spritePath: '/images/cadence-quest/map-sun.svg',
    color: '#f59e0b',
  },
  {
    regionId: 'theory-tower',
    x: 90,
    y: 18,
    icon: '🏰',
    spritePath: '/images/cadence-quest/map-tower.svg',
    color: '#8b5cf6',
  },
  {
    regionId: 'pvp-arena',
    x: 12,
    y: 18,
    icon: '⚔️',
    spritePath: '/images/cadence-quest/map-swords.svg',
    color: '#ef4444',
  },
];

/** SVG paths connecting regions in progression order (coordinates in viewBox space) */
export const MAP_PATHS: MapPath[] = [
  { from: 'rhythm-realm', to: 'melody-mountains', pathD: 'M 60 320 Q 100 260, 140 200' },
  { from: 'melody-mountains', to: 'harmony-harbor', pathD: 'M 140 200 Q 200 170, 260 140' },
  { from: 'harmony-harbor', to: 'dynamics-desert', pathD: 'M 260 140 Q 320 180, 380 220' },
  { from: 'dynamics-desert', to: 'theory-tower', pathD: 'M 380 220 Q 415 145, 450 72' },
];

export function getMapNode(regionId: string): MapNodeConfig | undefined {
  return MAP_NODES.find((n) => n.regionId === regionId);
}

export function getNodePosition(node: MapNodeConfig): { x: number; y: number } {
  const { width, height } = MAP_VIEWBOX;
  return {
    x: (node.x / 100) * width,
    y: (node.y / 100) * height,
  };
}
