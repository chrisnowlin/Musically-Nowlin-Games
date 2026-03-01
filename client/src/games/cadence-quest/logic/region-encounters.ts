import type { RegionEncounter } from '@shared/types/cadence-quest';
import type { MusicDiscipline } from '@shared/types/cadence-quest';

const ENEMY_NAMES: Record<MusicDiscipline, string[]> = {
  rhythm: ['Beat Keeper', 'Tempo Terror', 'Rhythm Rascal', 'Metronome Mage', 'Drum Lord'],
  pitch: ['Pitch Pirate', 'Melody Minion', 'Note Nemesis', 'Interval Imp', 'Scale Sovereign'],
  harmony: ['Chord Crab', 'Harmony Harpy', 'Triad Troll', 'Resolution Rogue', 'Chord King'],
  dynamics: ['Piano Phantom', 'Forte Fiend', 'Crescendo Critter', 'Diminuendo Demon', 'Dynamics Dragon'],
  theory: ['Staff Specter', 'Clef Creature', 'Key Signature King', 'Form Fiend', 'Theory Titan'],
};

export function getEncounter(
  regionId: string,
  encounterIndex: number
): RegionEncounter {
  const discipline = getRegionDiscipline(regionId);
  const enemies = ENEMY_NAMES[discipline];
  const isBoss = isBossEncounter(regionId, encounterIndex);
  const nameIndex = isBoss ? enemies.length - 1 : encounterIndex % (enemies.length - 1);
  return {
    index: encounterIndex,
    isBoss,
    enemyName: enemies[nameIndex],
    disciplineFocus: discipline,
    drops: isBoss ? [`${regionId}-boss-drop`] : undefined,
  };
}

function getRegionDiscipline(regionId: string): MusicDiscipline {
  const map: Record<string, MusicDiscipline> = {
    'rhythm-realm': 'rhythm',
    'melody-mountains': 'pitch',
    'harmony-harbor': 'harmony',
    'dynamics-desert': 'dynamics',
    'theory-tower': 'theory',
    'pvp-arena': 'theory',
  };
  return map[regionId] ?? 'theory';
}

function isBossEncounter(regionId: string, index: number): boolean {
  const counts: Record<string, number> = {
    'rhythm-realm': 6,
    'melody-mountains': 6,
    'harmony-harbor': 6,
    'dynamics-desert': 6,
    'theory-tower': 8,
    'pvp-arena': 0,
  };
  const total = counts[regionId] ?? 6;
  return total > 0 && index === total - 1;
}
