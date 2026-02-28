import React, { useMemo } from 'react';
import { TileType } from '@/lib/gameLogic/dungeonTypes';
import type { DungeonFloor, Position, Tile } from '@/lib/gameLogic/dungeonTypes';
import { getTheme } from './dungeonThemes';

interface MiniMapProps {
  floor: DungeonFloor;
  playerPosition: Position;
  showStairs?: boolean;
}

function getMiniMapTileColor(tile: Tile, themeWall: string, themeFloor: string): string {
  if (tile.type === TileType.Wall) return themeWall;
  return themeFloor;
}

const MiniMap: React.FC<MiniMapProps> = ({ floor, playerPosition, showStairs }) => {
  const theme = useMemo(() => getTheme(floor.themeIndex), [floor.themeIndex]);

  return (
    <div className="w-[160px] shrink-0">
      <div className="text-[10px] text-gray-400 mb-1 text-center uppercase tracking-wide">Mini Map</div>
      <div
        className="grid rounded-md overflow-hidden border border-gray-700/60"
        style={{
          gridTemplateColumns: `repeat(${floor.width}, 1fr)`,
          aspectRatio: '1 / 1',
          backgroundColor: '#020617',
        }}
      >
        {floor.tiles.map((row, y) =>
          row.map((tile, x) => {
            const isPlayer = playerPosition.x === x && playerPosition.y === y;
            const discovered = tile.visited || isPlayer;
            const bg = discovered
              ? getMiniMapTileColor(tile, theme.wall, theme.floor)
              : '#020617';

            return (
              <div
                key={`minimap-${x}-${y}`}
                className="relative"
                style={{ backgroundColor: bg }}
              >
                {isPlayer && (
                  <div className="absolute inset-[22%] rounded-full bg-fuchsia-400 shadow-[0_0_4px_rgba(217,70,239,0.9)]" />
                )}
                {showStairs && tile.type === TileType.Stairs && !isPlayer && (
                  <div className="absolute inset-[22%] rounded-full bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.9)]" />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MiniMap;
