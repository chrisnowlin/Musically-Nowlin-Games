import React, { useMemo } from 'react';
import { TileType, VISIBILITY_RADIUS } from './logic/dungeonTypes';
import type { DungeonFloor, Position } from './logic/dungeonTypes';
import { getTheme } from './dungeonThemes';

interface DungeonGridProps {
  floor: DungeonFloor;
  playerPosition: Position;
  facingLeft?: boolean;
  characterSprite?: string;
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

function getBigBossSprite(floorNumber: number): string {
  return floorNumber % 2 === 0
    ? '/images/melody-dungeon/bigboss.png'
    : '/images/melody-dungeon/bigboss_2.png';
}

const TILE_SPRITE: Partial<Record<TileType, string>> = {
  [TileType.Door]: '/images/melody-dungeon/door.png',
  [TileType.Treasure]: '/images/melody-dungeon/treasure.png',
  [TileType.Chest]: '/images/melody-dungeon/chest.png',
  [TileType.Stairs]: '/images/melody-dungeon/stairs.png',
  [TileType.MiniBoss]: '/images/melody-dungeon/miniboss.png',
  [TileType.BigBoss]: '/images/melody-dungeon/bigboss.png',
  [TileType.Merchant]: '/images/melody-dungeon/merchant.png',
  [TileType.MerchantStall]: '/images/melody-dungeon/stall.png',
  [TileType.Jukebox]: '/images/melody-dungeon/jukebox.svg',
};

const ENEMY_SPRITE: Record<string, string> = {
  ghost: '/images/melody-dungeon/ghost.png',
  skeleton: '/images/melody-dungeon/skeleton.png',
  dragon: '/images/melody-dungeon/dragon.png',
  goblin: '/images/melody-dungeon/goblin.png',
  slime: '/images/melody-dungeon/slime.png',
  bat: '/images/melody-dungeon/bat.png',
  wraith: '/images/melody-dungeon/wraith.png',
  spider: '/images/melody-dungeon/spider.png',
  shade: '/images/melody-dungeon/shade.png',
  siren: '/images/melody-dungeon/siren.png',
  wizard: '/images/melody-dungeon/wizard.png',
};

const DungeonGrid: React.FC<DungeonGridProps> = ({ floor, playerPosition, facingLeft, characterSprite }) => {
  const theme = useMemo(() => getTheme(floor.themeIndex), [floor.themeIndex]);
  const effectiveTheme = useMemo(() => {
    if (!floor.isLootFloor) return theme;
    return {
      ...theme,
      floor: '#92702a',
      floorCleared: '#7a5f24',
      border: '#d4a017',
      gridLine: 'rgba(212,160,23,0.2)',
    };
  }, [theme, floor.isLootFloor]);
  const viewportSize = VIEWPORT_RADIUS * 2 + 1;
  const startX = Math.max(0, Math.min(playerPosition.x - VIEWPORT_RADIUS, floor.width - viewportSize));
  const startY = Math.max(0, Math.min(playerPosition.y - VIEWPORT_RADIUS, floor.height - viewportSize));
  const endX = Math.min(floor.width, startX + viewportSize);
  const endY = Math.min(floor.height, startY + viewportSize);
  const viewWidth = endX - startX;

  return (
    <div
      className="grid gap-0 mx-auto select-none rounded-lg flex-1 min-h-0"
      style={{
        gridTemplateColumns: `repeat(${viewWidth}, 1fr)`,
        width: '100%',
        maxWidth: 'min(96vw, calc(100vh - 4.5rem))',
        aspectRatio: '1 / 1',
        backgroundColor: effectiveTheme.containerBg,
        borderWidth: '1px',
        borderColor: effectiveTheme.border,
        borderStyle: 'solid',
        position: 'relative',
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
              tile.type === TileType.PlayerStart ||
              tile.type === TileType.BossBody);

          let bgColor: string;
          let bgImage: string | undefined;
          if (vis === 'dark') {
            bgColor = effectiveTheme.containerBg;
          } else if (isWall) {
            bgColor = effectiveTheme.wall;
            bgImage = effectiveTheme.wallImg;
          } else if (isFloorLike) {
            bgColor = effectiveTheme.floorCleared;
            bgImage = effectiveTheme.floorImg;
          } else {
            bgColor = effectiveTheme.floor;
            bgImage = effectiveTheme.floorImg;
          }

          const isBossAnchor =
            tile.type === TileType.MiniBoss || tile.type === TileType.BigBoss;
          const isInvisibleGhost = tile.type === TileType.Enemy &&
            tile.enemySubtype === 'ghost' &&
            tile.ghostVisible === false &&
            !cleared;
          const spriteSrc =
            showContent &&
            !isPlayer &&
            !cleared &&
            !isBossAnchor &&
            !isInvisibleGhost &&
            (tile.type === TileType.Enemy
              ? ENEMY_SPRITE[tile.enemySubtype ?? 'dragon']
              : tile.type === TileType.BigBoss
                ? getBigBossSprite(floor.floorNumber)
                : TILE_SPRITE[tile.type]);
          const fullTileSprite =
            tile.type === TileType.Door || tile.type === TileType.Stairs || tile.type === TileType.MerchantStall;
          const isEnemy =
            tile.type === TileType.Enemy ||
            tile.type === TileType.MiniBoss ||
            tile.type === TileType.BigBoss;
          const isAnimated = isEnemy || tile.type === TileType.Merchant;

          return (
            <div
              key={`${x}-${y}`}
              className="relative flex items-center justify-center overflow-hidden"
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
                    src={characterSprite || '/images/melody-dungeon/character.png'}
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
                    fullTileSprite ? 'p-0' : tile.enemySubtype === 'skeleton' ? 'p-0' : 'p-[8%]'
                  }`}
                >
                  <img
                    src={spriteSrc}
                    alt={tile.type}
                    className={`w-full h-full object-contain ${isAnimated ? 'animate-sprite-float' : ''}`}
                    style={isAnimated ? { animationDelay: `${((x * 7 + y * 13) % 10) * 0.24}s` } : undefined}
                    draggable={false}
                  />
                </div>
              )}
              {showContent && isInvisibleGhost && (
                <div className="absolute inset-0 flex items-center justify-center z-10 overflow-hidden p-[8%]">
                  <img
                    src={ENEMY_SPRITE['ghost']}
                    alt="shimmer"
                    className="w-full h-full object-contain animate-pulse"
                    style={{ opacity: 0.12, filter: 'brightness(2) blur(1px)' }}
                    draggable={false}
                  />
                </div>
              )}
              {/* Fog overlay */}
              <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-200 z-20"
                style={{ opacity: fogOpacity, backgroundColor: effectiveTheme.fog }}
              />

              {/* Grid lines for visible/dim tiles */}
              {vis !== 'dark' && (
                <div
                  className="absolute inset-0 pointer-events-none z-20"
                  style={{ border: `1px solid ${effectiveTheme.gridLine}` }}
                />
              )}
            </div>
          );
        });
      })}

      {/* Multi-tile boss sprite overlays — rendered on top of the tile grid.
          Note: viewWidth is used for both horizontal and vertical sizing of each overlay
          (left, top, width, height). This is correct because the container has
          aspectRatio: 1/1, meaning the container is always square and width === height. */}
      {floor.tiles.slice(startY, endY).flatMap((row, rowIndex) => {
        const y = startY + rowIndex;
        return row.slice(startX, endX).flatMap((tile, colIndex) => {
          const x = startX + colIndex;
          if (tile.type !== TileType.MiniBoss && tile.type !== TileType.BigBoss) return [];
          if (tile.cleared) return [];

          const vis = getTileVisibility(x, y, playerPosition.x, playerPosition.y, tile.visited);
          if (vis === 'dark') return [];

          const vx = x - startX; // viewport-relative x
          const vy = y - startY; // viewport-relative y
          const bossSize = tile.type === TileType.BigBoss ? 3 : 2;
          const spriteSrc = tile.type === TileType.BigBoss
            ? getBigBossSprite(floor.floorNumber)
            : TILE_SPRITE[tile.type];
          if (!spriteSrc) return [];

          const dist = Math.max(Math.abs(x - playerPosition.x), Math.abs(y - playerPosition.y));
          const fogOpacity = getFogOverlayOpacity(vis, dist);

          return [
            <div
              key={`boss-overlay-${x}-${y}`}
              className="absolute pointer-events-none"
              style={{
                left: `${(vx / viewWidth) * 100}%`,
                top: `${(vy / viewWidth) * 100}%`,
                width: `${(bossSize / viewWidth) * 100}%`,
                height: `${(bossSize / viewWidth) * 100}%`,
                zIndex: 15,
              }}
            >
              <img
                src={spriteSrc}
                alt={tile.type}
                className="w-full h-full object-contain animate-sprite-float"
                style={{ animationDelay: `${((x * 7 + y * 13) % 10) * 0.24}s` }}
                draggable={false}
              />
              <div
                className="absolute inset-0"
                style={{ opacity: fogOpacity, backgroundColor: effectiveTheme.fog }}
              />
            </div>,
          ];
        });
      })}
    </div>
  );
};

export default DungeonGrid;
