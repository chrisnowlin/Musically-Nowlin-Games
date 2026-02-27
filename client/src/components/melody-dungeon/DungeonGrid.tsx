import React, { useMemo } from 'react';
import { TileType, VISIBILITY_RADIUS } from '@/lib/gameLogic/dungeonTypes';
import type { DungeonFloor, Position } from '@/lib/gameLogic/dungeonTypes';
import { getTheme } from './dungeonThemes';

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
    const t = dist / VISIBILITY_RADIUS;
    return t * 0.35;
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

const TILE_ACCENT: Partial<Record<TileType, string>> = {
  [TileType.Door]: '#92400e',
  [TileType.Enemy]: '#7f1d1d',
  [TileType.Treasure]: '#854d0e',
  [TileType.Chest]: '#92400e',
  [TileType.Stairs]: '#065f46',
  [TileType.Boss]: '#581c87',
};

const DungeonGrid: React.FC<DungeonGridProps> = ({ floor, playerPosition }) => {
  const theme = useMemo(() => getTheme(floor.themeIndex), [floor.themeIndex]);

  return (
    <div
      className="grid gap-0 mx-auto select-none rounded-lg overflow-hidden"
      style={{
        gridTemplateColumns: `repeat(${floor.width}, 1fr)`,
        width: '100%',
        maxWidth: 'min(90vw, 70vh, 720px)',
        aspectRatio: '1 / 1',
        backgroundColor: theme.containerBg,
        borderWidth: '1px',
        borderColor: theme.border,
        borderStyle: 'solid',
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

          let bgColor: string;
          if (vis === 'dark') {
            bgColor = theme.containerBg;
          } else if (tile.type === TileType.Wall) {
            bgColor = theme.wall;
          } else if (cleared) {
            bgColor = theme.floorCleared;
          } else {
            bgColor = TILE_ACCENT[tile.type] || theme.floor;
          }

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
              className="relative flex items-center justify-center"
              style={{ aspectRatio: '1 / 1', backgroundColor: bgColor }}
            >
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
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `repeating-linear-gradient(0deg,transparent,transparent 2px,${theme.wallPattern} 2px,${theme.wallPattern} 4px)`,
                  }}
                />
              )}

              <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-200 z-20"
                style={{ opacity: fogOpacity, backgroundColor: theme.fog }}
              />

              {vis !== 'dark' && (
                <div
                  className="absolute inset-0 pointer-events-none z-20"
                  style={{ border: `1px solid ${theme.gridLine}` }}
                />
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default DungeonGrid;
