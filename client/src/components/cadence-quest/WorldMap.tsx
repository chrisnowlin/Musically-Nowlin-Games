import React, { useState } from 'react';
import { REGIONS } from '@/lib/cadence-quest/regions';
import { MAP_NODES, MAP_PATHS, MAP_VIEWBOX, getNodePosition } from '@/lib/cadence-quest/map-layout';
import type { Character } from '@shared/types/cadence-quest';
import { MapPin, Swords, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorldMapProps {
  character: Character;
  onSelectEncounter: (regionId: string, encounterIndex: number, isBoss: boolean) => void;
  onNavigate: (screen: 'skill-tree' | 'collection' | 'pvp') => void;
}

const NODE_RADIUS = 28;

const WorldMap: React.FC<WorldMapProps> = ({ character, onSelectEncounter, onNavigate }) => {
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);

  const getProgress = (regionId: string) => character.regionProgress[regionId] ?? 0;
  const isUnlocked = (region: (typeof REGIONS)[0]) => {
    if (!region.requiresRegionId) return true;
    const requiredProgress = getProgress(region.requiresRegionId);
    const required = REGIONS.find((r) => r.id === region.requiresRegionId);
    const requiredTotal = required?.encounterCount ?? 6;
    return requiredProgress >= requiredTotal;
  };

  const selectedRegion = selectedRegionId ? REGIONS.find((r) => r.id === selectedRegionId) : null;
  const selectedIsArena = selectedRegion?.isArena ?? false;
  const selectedUnlocked = selectedRegion ? isUnlocked(selectedRegion) : false;
  const selectedProgress = selectedRegionId ? getProgress(selectedRegionId) : 0;

  return (
    <div className="flex flex-col h-full gap-3 p-3 max-w-4xl mx-auto overflow-hidden">
      <h2 className="text-xl font-bold text-purple-900 drop-shadow-sm shrink-0">
        World Map
      </h2>

      {/* Explorable map canvas */}
      <div className="flex-1 min-h-0 relative rounded-xl overflow-hidden border-2 border-amber-800/40 bg-gradient-to-b from-amber-50/90 via-amber-100/80 to-yellow-100/90 shadow-inner">
        <svg
          viewBox={`0 0 ${MAP_VIEWBOX.width} ${MAP_VIEWBOX.height}`}
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full min-h-[220px]"
          style={{ maxHeight: 'calc(100vh - 320px)' }}
        >
          {/* Decorative grid / parchment texture overlay */}
          <defs>
            <pattern id="parchment" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="0.5" fill="rgba(139,92,46,0.08)" />
            </pattern>
            <filter id="nodeShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3" />
            </filter>
            <filter id="pathGlow">
              <feGaussianBlur stdDeviation="1" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <rect width="100%" height="100%" fill="url(#parchment)" />

          {/* Paths between regions */}
          <g filter="url(#pathGlow)">
            {MAP_PATHS.map(({ from, to, pathD }) => {
              const fromNode = MAP_NODES.find((n) => n.regionId === from);
              const toNode = MAP_NODES.find((n) => n.regionId === to);
              if (!fromNode || !toNode) return null;
              const fromUnlocked = isUnlocked(REGIONS.find((r) => r.id === from)!);
              const toUnlocked = isUnlocked(REGIONS.find((r) => r.id === to)!);
              const pathUnlocked = fromUnlocked && toUnlocked;
              return (
                <path
                  key={`${from}-${to}`}
                  d={pathD}
                  fill="none"
                  stroke={pathUnlocked ? 'rgba(168,85,247,0.5)' : 'rgba(107,114,128,0.3)'}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              );
            })}
          </g>

          {/* Region nodes */}
          {MAP_NODES.map((node) => {
            const region = REGIONS.find((r) => r.id === node.regionId);
            if (!region) return null;
            const unlocked = isUnlocked(region);
            const progress = getProgress(node.regionId);
            const isSelected = selectedRegionId === node.regionId;
            const { x, y } = getNodePosition(node);

            return (
              <g key={node.regionId}>
                {/* Node background circle */}
                <circle
                  cx={x}
                  cy={y}
                  r={NODE_RADIUS}
                  fill={unlocked ? node.color : 'rgba(107,114,128,0.4)'}
                  fillOpacity={unlocked ? 0.9 : 0.6}
                  stroke={isSelected ? '#fff' : unlocked ? node.color : 'rgba(75,85,99,0.6)'}
                  strokeWidth={isSelected ? 4 : 2}
                  filter="url(#nodeShadow)"
                  className="cursor-pointer"
                  onClick={() => setSelectedRegionId(node.regionId)}
                />
                {/* 8-bit sprite icon */}
                <image
                  href={node.spritePath}
                  x={x - 14}
                  y={y - 14}
                  width={28}
                  height={28}
                  opacity={unlocked ? 1 : 0.6}
                  className="pointer-events-none select-none"
                  style={{ imageRendering: 'pixelated' }}
                />
                {/* Lock indicator for locked regions */}
                {!unlocked && (
                  <text
                    x={x}
                    y={y + NODE_RADIUS - 6}
                    textAnchor="middle"
                    fontSize="12"
                    opacity={0.95}
                  >
                    🔒
                  </text>
                )}
                {/* Progress indicator (encounters completed) */}
                {unlocked && !region.isArena && progress > 0 && (
                  <text
                    x={x}
                    y={y + NODE_RADIUS + 4}
                    textAnchor="middle"
                    fontSize="10"
                    fill="rgba(30,41,59,0.9)"
                    fontWeight="bold"
                  >
                    {progress}/{region.encounterCount}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Region labels - overlay for clarity on small nodes */}
        <div className="absolute inset-0 pointer-events-none">
          {MAP_NODES.map((node) => {
            const region = REGIONS.find((r) => r.id === node.regionId);
            if (!region) return null;
            return (
              <div
                key={node.regionId}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 text-xs font-medium text-slate-700"
                style={{
                  left: `${node.x}%`,
                  top: `${node.y}%`,
                  marginTop: region.isArena ? -42 : 38,
                  textShadow: '0 0 4px white, 0 0 8px white',
                }}
              >
                {region.name}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected region panel / encounter list */}
      <div className="shrink-0 flex flex-col gap-2">
        {selectedRegion && (
          <div
            className={cn(
              'rounded-xl border-2 p-3 transition-all',
              selectedUnlocked
                ? 'bg-gray-800/80 border-purple-500/40'
                : 'bg-gray-800/50 border-gray-600 opacity-80'
            )}
          >
            <div className="flex items-center justify-between gap-3 mb-2">
              <div>
                <h3 className="font-bold text-white flex items-center gap-2">
                  <img
                    src={MAP_NODES.find((n) => n.regionId === selectedRegionId)?.spritePath}
                    alt=""
                    className="w-6 h-6 object-contain"
                    style={{ imageRendering: 'pixelated' }}
                  />
                  {selectedRegion.name}
                </h3>
                <p className="text-sm text-gray-200">{selectedRegion.description}</p>
              </div>
              {selectedUnlocked && !selectedIsArena && (
                <p className="text-xs text-purple-200 font-medium shrink-0">
                  {selectedProgress}/{selectedRegion.encounterCount}
                </p>
              )}
            </div>

            {selectedIsArena ? (
              <button
                onClick={() => onNavigate('pvp')}
                className="w-full px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium flex items-center justify-center gap-2"
              >
                Enter PvP Arena
                <ChevronRight size={18} />
              </button>
            ) : selectedUnlocked ? (
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: selectedRegion.encounterCount }, (_, i) => {
                  const isBoss = i === selectedRegion.encounterCount - 1;
                  const available = i <= selectedProgress;
                  return (
                    <button
                      key={i}
                      onClick={() => available && onSelectEncounter(selectedRegion.id, i, isBoss)}
                      disabled={!available}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                        available
                          ? 'bg-purple-600 hover:bg-purple-500 text-white'
                          : 'bg-gray-700/60 text-gray-400 cursor-not-allowed'
                      )}
                    >
                      {isBoss ? <Swords size={14} /> : <MapPin size={14} />}
                      {isBoss ? 'Boss' : `#${i + 1}`}
                      {!available && <span aria-hidden>🔒</span>}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-400">
                Complete the previous region to unlock {selectedRegion.name}.
              </p>
            )}
          </div>
        )}

        {!selectedRegion && (
          <p className="text-sm text-purple-800 text-center py-2">
            Click a region on the map to view encounters
          </p>
        )}

        {/* Bottom action bar */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-purple-300/50">
          <button
            onClick={() => onNavigate('skill-tree')}
            className="px-4 py-2 rounded-lg bg-amber-700/60 hover:bg-amber-600/60 text-white font-medium"
          >
            Skill Tree
          </button>
          <button
            onClick={() => onNavigate('collection')}
            className="px-4 py-2 rounded-lg bg-teal-700/60 hover:bg-teal-600/60 text-white font-medium"
          >
            Collection
          </button>
          <button
            onClick={() => onNavigate('pvp')}
            className="px-4 py-2 rounded-lg bg-red-700/60 hover:bg-red-600/60 text-white font-medium"
          >
            PvP Arena
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorldMap;
