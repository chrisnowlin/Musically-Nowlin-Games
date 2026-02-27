import React, { useMemo } from 'react';
import { TileType, VISIBILITY_RADIUS } from '@/lib/gameLogic/dungeonTypes';
import type { DungeonFloor, Position } from '@/lib/gameLogic/dungeonTypes';
import { getTheme } from './dungeonThemes';

interface DungeonGridProps {
  floor: DungeonFloor;
  playerPosition: Position;
  facingLeft?: boolean;
}

type Visibility = 'lit' | 'dim' | 'dark';
const VIEWPORT_RADIUS = 3;

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

const TILE_SPRITE: Partial<Record<TileType, string>> = {
  [TileType.Door]: '/images/melody-dungeon-door.png',
  [TileType.Enemy]: '/images/melody-dungeon-enemy.png',
  [TileType.Treasure]: '/images/melody-dungeon-treasure.png',
  [TileType.Chest]: '/images/melody-dungeon-chest.png',
  [TileType.Stairs]: '/images/melody-dungeon-stairs.png',
  [TileType.Dragon]: '/images/melody-dungeon-boss.png',
};

const DungeonGrid: React.FC<DungeonGridProps> = ({ floor, playerPosition, facingLeft }) => {
  const theme = useMemo(() => getTheme(floor.themeIndex), [floor.themeIndex]);
  const viewportSize = VIEWPORT_RADIUS * 2 + 1;
  const startX = Math.max(0, Math.min(playerPosition.x - VIEWPORT_RADIUS, floor.width - viewportSize));
  const startY = Math.max(0, Math.min(playerPosition.y - VIEWPORT_RADIUS, floor.height - viewportSize));
  const endX = Math.min(floor.width, startX + viewportSize);
  const endY = Math.min(floor.height, startY + viewportSize);
  const viewWidth = endX - startX;

  return (
    <div
      className="grid gap-0 mx-auto select-none rounded-lg overflow-hidden"
      style={{
        gridTemplateColumns: `repeat(${viewWidth}, 1fr)`,
        width: '100%',
        maxWidth: 'min(90vw, 70vh, 720px)',
        aspectRatio: '1 / 1',
        backgroundColor: theme.containerBg,
        borderWidth: '1px',
        borderColor: theme.border,
        borderStyle: 'solid',
      }}
    >
      {floor.tiles.slice(startY, endY).map((row, rowIndex) => {
        const y = startY + rowIndex;
        return row.slice(startX, endX).map((tile, colIndex) => {
          const x = startX + colIndex;
          const isPlayer = playerPosition.x === x && playerPosition.y === y;
          const dist = Math.max(Math.abs(x - playerPosition.x), Math.abs(y - playerPosition.y));
          const vis = getTileVisibility(x, y, playerPosition.x, playerPosition.y, tile.visited);
          const fogOpacity = getFogOverlayOpacity(vis, dist);
          const showContent = vis === 'lit';
          const cleared = tile.cleared;

          const isWall = tile.type === TileType.Wall;
          const isFloorLike =
            !isWall &&
            (cleared ||
              tile.type === TileType.Floor ||
              tile.type === TileType.PlayerStart);

          let bgColor: string;
          let bgImage: string | undefined;
          if (vis === 'dark') {
            bgColor = theme.containerBg;
          } else if (isWall) {
            bgColor = theme.wall;
            bgImage = theme.wallImg;
          } else if (isFloorLike) {
            bgColor = theme.floorCleared;
            bgImage = theme.floorImg;
          } else {
            bgColor = theme.floor;
            bgImage = theme.floorImg;
          }

          const spriteSrc =
            showContent &&
            !isPlayer &&
            !cleared &&
            TILE_SPRITE[tile.type];
          const fullTileSprite =
            tile.type === TileType.Door || tile.type === TileType.Stairs;
          const isEnemy =
            tile.type === TileType.Enemy || tile.type === TileType.Dragon;

          return (
            <div
              key={`${x}-${y}`}
              className="relative flex items-center justify-center"
              style={{
                aspectRatio: '1 / 1',
                backgroundColor: bgColor,
                backgroundImage: bgImage && vis !== 'dark' ? `url(${bgImage})` : undefined,
                backgroundSize: 'cover',
              }}
            >
              {isPlayer && showContent && (
                <div className="absolute inset-0 flex items-center justify-center z-10 overflow-hidden p-[4%]">
                  <img
                    src="/images/melody-dungeon-character.png"
                    alt="Player"
                    className="w-full h-full object-contain drop-shadow-[0_0_6px_rgba(168,85,247,0.8)] transition-transform duration-150"
                    style={facingLeft ? { transform: 'scaleX(-1)' } : undefined}
                    draggable={false}
                  />
                </div>
              )}
              {spriteSrc && (
                <div
                  className={`absolute inset-0 flex items-center justify-center z-10 overflow-hidden ${
                    fullTileSprite ? 'p-0' : 'p-[8%]'
                  }`}
                >
                  <img
                    src={spriteSrc}
                    alt={tile.type}
                    className={`w-full h-full object-contain ${isEnemy ? 'animate-sprite-float' : ''}`}
                    style={isEnemy ? { animationDelay: `${((x * 7 + y * 13) % 10) * 0.24}s` } : undefined}
                    draggable={false}
                  />
                </div>
              )}

              {/* Fog overlay */}
              <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-200 z-20"
                style={{ opacity: fogOpacity, backgroundColor: theme.fog }}
              />

              {/* Grid lines for visible/dim tiles */}
              {vis !== 'dark' && (
                <div
                  className="absolute inset-0 pointer-events-none z-20"
                  style={{ border: `1px solid ${theme.gridLine}` }}
                />
              )}
            </div>
          );
        });
      })}
    </div>
  );
};

export default DungeonGrid;
