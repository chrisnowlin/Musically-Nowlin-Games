export interface DungeonTheme {
  name: string;
  wallImg: string;
  floorImg: string;
  wall: string;
  floor: string;
  floorCleared: string;
  fog: string;
  border: string;
  containerBg: string;
  gridLine: string;
}

export const THEMES: DungeonTheme[] = [
  {
    name: 'Stone Crypt',
    wallImg: '/images/da-capo-dungeon/theme-stonecrypt-wall.png',
    floorImg: '/images/da-capo-dungeon/theme-stonecrypt-floor.png',
    wall: '#1f2937',
    floor: '#44403c',
    floorCleared: '#44403c',
    fog: '#030712',
    border: '#374151',
    containerBg: '#030712',
    gridLine: 'rgba(107,114,128,0.2)',
  },
  {
    name: 'Emerald Cavern',
    wallImg: '/images/da-capo-dungeon/theme-emerald-wall.png',
    floorImg: '/images/da-capo-dungeon/theme-emerald-floor.png',
    wall: '#064e3b',
    floor: '#365314',
    floorCleared: '#365314',
    fog: '#022c22',
    border: '#065f46',
    containerBg: '#022c22',
    gridLine: 'rgba(52,211,153,0.12)',
  },
  {
    name: 'Crimson Dungeon',
    wallImg: '/images/da-capo-dungeon/theme-crimson-wall.png',
    floorImg: '/images/da-capo-dungeon/theme-crimson-floor.png',
    wall: '#450a0a',
    floor: '#78350f',
    floorCleared: '#78350f',
    fog: '#1c0505',
    border: '#7f1d1d',
    containerBg: '#1c0505',
    gridLine: 'rgba(248,113,113,0.12)',
  },
  {
    name: 'Frozen Depths',
    wallImg: '/images/da-capo-dungeon/theme-frozen-wall.png',
    floorImg: '/images/da-capo-dungeon/theme-frozen-floor.png',
    wall: '#1e3a5f',
    floor: '#1e40af',
    floorCleared: '#1e3a5f',
    fog: '#0a1628',
    border: '#1d4ed8',
    containerBg: '#0a1628',
    gridLine: 'rgba(96,165,250,0.12)',
  },
  {
    name: 'Violet Sanctum',
    wallImg: '/images/da-capo-dungeon/theme-violet-wall.png',
    floorImg: '/images/da-capo-dungeon/theme-violet-floor.png',
    wall: '#3b0764',
    floor: '#581c87',
    floorCleared: '#4c1d95',
    fog: '#1a0533',
    border: '#6b21a8',
    containerBg: '#1a0533',
    gridLine: 'rgba(168,85,247,0.15)',
  },
  {
    name: 'Amber Ruins',
    wallImg: '/images/da-capo-dungeon/theme-amber-wall.png',
    floorImg: '/images/da-capo-dungeon/theme-amber-floor.png',
    wall: '#451a03',
    floor: '#92400e',
    floorCleared: '#78350f',
    fog: '#1c0a00',
    border: '#b45309',
    containerBg: '#1c0a00',
    gridLine: 'rgba(251,191,36,0.12)',
  },
  {
    name: 'Obsidian Halls',
    wallImg: '/images/da-capo-dungeon/theme-obsidian-wall.png',
    floorImg: '/images/da-capo-dungeon/theme-obsidian-floor.png',
    wall: '#18181b',
    floor: '#27272a',
    floorCleared: '#27272a',
    fog: '#09090b',
    border: '#3f3f46',
    containerBg: '#09090b',
    gridLine: 'rgba(161,161,170,0.1)',
  },
  {
    name: 'Teal Abyss',
    wallImg: '/images/da-capo-dungeon/theme-teal-wall.png',
    floorImg: '/images/da-capo-dungeon/theme-teal-floor.png',
    wall: '#134e4a',
    floor: '#115e59',
    floorCleared: '#115e59',
    fog: '#042f2e',
    border: '#0d9488',
    containerBg: '#042f2e',
    gridLine: 'rgba(45,212,191,0.12)',
  },
];

export function getTheme(index: number): DungeonTheme {
  return THEMES[index % THEMES.length];
}
