import React from 'react';
import { TileType, VISIBILITY_RADIUS } from '@/lib/gameLogic/dungeonTypes';
import type { DungeonFloor, Position } from '@/lib/gameLogic/dungeonTypes';

interface DungeonGridProps {
  floor: DungeonFloor;
  playerPosition: Position;
}

type Visibility = 'lit' | 'dim' | 'dark';

function getTileVisibility(
  tileX: number,
  tileY: number,
  playerX: number,
  playerY: number,
  visited: boolean
): Visibility {
  const dist = Math.max(Math.abs(tileX - playerX), Math.abs(tileY - playerY));
  if (dist <= VISIBILITY_RADIUS) return 'lit';
  if (visited) return 'dim';
  return 'dark';
}

function getFogOverlayOpacity(vis: Visibility, dist: number): number {
  if (vis === 'lit') {
    // Smooth darkening toward edge of visible radius
    const t = dist / VISIBILITY_RADIUS;
    return t * 0.35; // 0 at center, 0.35 at edge
  }
  if (vis === 'dim') return 0.7;
  return 0.92;
}

const TILE_EMOJI: Record<string, string> = {
  [TileType.Wall]: '',
  [TileType.Floor]: '',
  [TileType.Door]: '\uD83D\uDEAA',
  [TileType.Enemy]: '\uD83D\uDC7E',
  [TileType.Treasure]: '\uD83C\uDF81',
  [TileType.Chest]: '\uD83D\uDD12',
  [TileType.Stairs]: '\u2B07\uFE0F',
  [TileType.PlayerStart]: '',
  [TileType.Boss]: '\uD83D\uDC32',
};

const TILE_BG: Record<string, string> = {
  [TileType.Wall]: 'bg-gray-800',
  [TileType.Floor]: 'bg-stone-700',
  [TileType.Door]: 'bg-amber-900',
  [TileType.Enemy]: 'bg-red-900/70',
  [TileType.Treasure]: 'bg-yellow-900/70',
  [TileType.Chest]: 'bg-amber-800/70',
  [TileType.Stairs]: 'bg-emerald-900/70',
  [TileType.PlayerStart]: 'bg-stone-700',
  [TileType.Boss]: 'bg-purple-900/70',
};

const DungeonGrid: React.FC<DungeonGridProps> = ({ floor, playerPosition }) => {
  return (
    <div
      className="grid gap-0 mx-auto select-none bg-gray-950 rounded-lg overflow-hidden border border-gray-800"
      style={{
        gridTemplateColumns: `repeat(${floor.width}, 1fr)`,
        width: '100%',
        maxWidth: 'min(90vw, 70vh, 720px)',
        aspectRatio: '1 / 1',
      }}
    >
      {floor.tiles.map((row, y) =>
        row.map((tile, x) => {
          const isPlayer = playerPosition.x === x && playerPosition.y === y;
          const dist = Math.max(Math.abs(x - playerPosition.x), Math.abs(y - playerPosition.y));
          const vis = getTileVisibility(x, y, playerPosition.x, playerPosition.y, tile.visited);
          const fogOpacity = getFogOverlayOpacity(vis, dist);
          const showContent = vis === 'lit';
          const cleared = tile.cleared;

          const bgClass =
            vis === 'dark'
              ? 'bg-gray-950'
              : tile.type === TileType.Wall
                ? TILE_BG[TileType.Wall]
                : cleared
                  ? 'bg-stone-700'
                  : TILE_BG[tile.type] || TILE_BG[TileType.Floor];

          const showEmoji =
            showContent &&
            !isPlayer &&
            !cleared &&
            tile.type !== TileType.Wall &&
            tile.type !== TileType.Floor &&
            tile.type !== TileType.PlayerStart;

          return (
            <div
              key={`${x}-${y}`}
              className={`relative flex items-center justify-center ${bgClass}`}
              style={{ aspectRatio: '1 / 1' }}
            >
              {/* Tile content */}
              {isPlayer && showContent && (
                <div className="absolute inset-0 flex items-center justify-center z-10 overflow-hidden">
                  <img
                    src="/images/melody-dungeon-character.png"
                    alt="Player"
                    className="w-[160%] h-[160%] object-contain drop-shadow-[0_0_8px_rgba(168,85,247,0.9)]"
                    draggable={false}
                  />
                </div>
              )}
              {showEmoji && (
                <span className="text-xs sm:text-base z-10">{TILE_EMOJI[tile.type]}</span>
              )}
              {tile.type === TileType.Wall && showContent && (
                <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.15)_2px,rgba(0,0,0,0.15)_4px)]" />
              )}

              {/* Fog overlay -- always present, varies in darkness */}
              <div
                className="absolute inset-0 bg-gray-950 pointer-events-none transition-opacity duration-200 z-20"
                style={{ opacity: fogOpacity }}
              />

              {/* Grid lines for visible/dim tiles */}
              {vis !== 'dark' && (
                <div className="absolute inset-0 border border-gray-700/20 pointer-events-none z-20" />
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default DungeonGrid;
