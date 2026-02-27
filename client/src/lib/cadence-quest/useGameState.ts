import { useReducer, useCallback, useEffect } from 'react';
import type { Character, CharacterClass } from '@shared/types/cadence-quest';
import { authGuest, characterCreate, characterUpdate, battleRecord } from './api';

export type GameScreen = 'menu' | 'character-creation' | 'world-map' | 'battle' | 'victory' | 'skill-tree' | 'collection' | 'pvp';

export interface PvPBattleContext {
  battleRoomId: string;
  opponent: { id: string; name: string; class: Character['class']; maxHp: number };
  initialChallenge?: import('@shared/types/cadence-quest').MusicChallenge;
  challengeShownAt?: number;
}

export interface GameState {
  screen: GameScreen;
  character: Character | null;
  battleContext:
    | {
        regionId: string;
        encounterIndex: number;
        isBoss: boolean;
      }
    | PvPBattleContext
    | null;
  lastBattleVictory: boolean | null;
}

type GameAction =
  | { type: 'CREATE_CHARACTER'; name: string; charClass: CharacterClass; character?: Character }
  | { type: 'START_BATTLE'; regionId: string; encounterIndex: number; isBoss: boolean }
  | {
      type: 'START_PVP_BATTLE';
      battleRoomId: string;
      opponent: PvPBattleContext['opponent'];
      initialChallenge?: import('@shared/types/cadence-quest').MusicChallenge;
      challengeShownAt?: number;
    }
  | { type: 'BATTLE_END'; victory: boolean }
  | { type: 'NAVIGATE'; screen: GameScreen }
  | { type: 'UPDATE_REGION_PROGRESS'; regionId: string; encounterIndex: number }
  | { type: 'SET_CHARACTER'; character: Character };

const createDefaultCharacter = (id: string, name: string, charClass: CharacterClass): Character => ({
  id,
  name,
  class: charClass,
  stats: {
    level: 1,
    xp: 0,
    hp: 100,
    maxHp: 100,
    skillPoints: 0,
    skillTree: {
      rhythm: [],
      pitch: [],
      harmony: [],
      dynamics: [],
      theory: [],
    },
  },
  regionProgress: {},
  equippedInstrument: null,
  equippedSpells: [],
  ownedInstruments: [],
  ownedSpells: [],
});

function apiCharToCharacter(api: { id: string; name: string; class: string; stats: { level: number; xp: number; hp: number; maxHp: number; skillPoints: number; skillTree: Record<string, number[]> }; regionProgress: Record<string, number>; equippedInstrument: string | null; equippedSpells: string[]; ownedInstruments: string[]; ownedSpells: string[] }): Character {
  return {
    id: api.id,
    name: api.name,
    class: api.class as CharacterClass,
    stats: {
      level: api.stats.level,
      xp: api.stats.xp,
      hp: api.stats.hp,
      maxHp: api.stats.maxHp,
      skillPoints: api.stats.skillPoints,
      skillTree: api.stats.skillTree as Record<import('@shared/types/cadence-quest').MusicDiscipline, number[]>,
    },
    regionProgress: api.regionProgress,
    equippedInstrument: api.equippedInstrument,
    equippedSpells: api.equippedSpells,
    ownedInstruments: api.ownedInstruments,
    ownedSpells: api.ownedSpells,
  };
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'CREATE_CHARACTER':
      return {
        ...state,
        screen: 'world-map',
        character: action.character ?? createDefaultCharacter(
          `char-${Date.now()}`,
          action.name,
          action.charClass
        ),
      };
    case 'SET_CHARACTER':
      return { ...state, character: action.character };
    case 'START_BATTLE':
      return {
        ...state,
        screen: 'battle',
        battleContext: {
          regionId: action.regionId,
          encounterIndex: action.encounterIndex,
          isBoss: action.isBoss,
        },
      };
    case 'START_PVP_BATTLE':
      return {
        ...state,
        screen: 'battle',
        battleContext: {
          battleRoomId: action.battleRoomId,
          opponent: action.opponent,
          initialChallenge: action.initialChallenge,
          challengeShownAt: action.challengeShownAt,
        },
      };
    case 'BATTLE_END':
      if (!state.character) return state;
      const ctx = state.battleContext;
      const isPvP = ctx && 'battleRoomId' in ctx;
      const newProgress = { ...state.character.regionProgress };
      if (!isPvP && ctx && action.victory) {
        const next = ctx.encounterIndex + 1;
        const current = newProgress[ctx.regionId] ?? 0;
        newProgress[ctx.regionId] = Math.max(current, next);
      }
      return {
        ...state,
        screen: 'victory',
        lastBattleVictory: action.victory,
        character: {
          ...state.character,
          regionProgress: newProgress,
          stats: {
            ...state.character.stats,
            hp: state.character.stats.maxHp,
          },
        },
      };
    case 'NAVIGATE':
      return {
        ...state,
        screen: action.screen,
        ...(action.screen !== 'victory' && action.screen !== 'battle' ? { battleContext: null } : {}),
      };
    case 'UPDATE_REGION_PROGRESS':
      if (!state.character) return state;
      const prog = { ...state.character.regionProgress };
      prog[action.regionId] = Math.max(prog[action.regionId] ?? 0, action.encounterIndex);
      return {
        ...state,
        character: {
          ...state.character,
          regionProgress: prog,
        },
      };
    default:
      return state;
  }
}

const initialState: GameState = {
  screen: 'menu',
  character: null,
  battleContext: null,
  lastBattleVictory: null,
};

function isServerCharacter(id: string): boolean {
  return !isNaN(parseInt(id, 10));
}

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  useEffect(() => {
    authGuest().catch(() => {});
  }, []);

  const createCharacter = useCallback(async (name: string, charClass: CharacterClass) => {
    try {
      const apiChar = await characterCreate(name, charClass);
      dispatch({
        type: 'CREATE_CHARACTER',
        name,
        charClass,
        character: apiCharToCharacter(apiChar),
      });
    } catch {
      dispatch({ type: 'CREATE_CHARACTER', name, charClass });
    }
  }, []);

  const startBattle = useCallback((regionId: string, encounterIndex: number, isBoss: boolean) => {
    dispatch({ type: 'START_BATTLE', regionId, encounterIndex, isBoss });
  }, []);

  const startPvpBattle = useCallback(
    (
      battleRoomId: string,
      opponent: { id: string; name: string; class: Character['class']; maxHp: number },
      initialChallenge?: import('@shared/types/cadence-quest').MusicChallenge,
      challengeShownAt?: number
    ) => {
      dispatch({ type: 'START_PVP_BATTLE', battleRoomId, opponent, initialChallenge, challengeShownAt });
    },
    []
  );

  const endBattle = useCallback((victory: boolean) => {
    dispatch({ type: 'BATTLE_END', victory });
  }, []);

  const persistAfterBattle = useCallback(
    async (
      character: Character,
      battleContext:
        | { regionId: string; encounterIndex: number }
        | { battleRoomId: string; opponent: { id: string } },
      victory: boolean
    ) => {
      if (!isServerCharacter(character.id)) return;
      const isPvP = 'battleRoomId' in battleContext;
      try {
        const player1Id = parseInt(character.id, 10);
        const player2Id = isPvP ? parseInt(battleContext.opponent.id, 10) : undefined;
        const winnerId = victory ? player1Id : isPvP ? player2Id : undefined;
        await battleRecord({
          player1Id,
          player2Id: isPvP ? player2Id : undefined,
          battleType: isPvP ? 'pvp' : 'pve',
          winnerId,
        });
        if (!isPvP) {
          await characterUpdate(character.id, {
            regionProgress: character.regionProgress,
            hp: character.stats.hp,
          });
        }
      } catch {
        // Offline or server error - ignore
      }
    },
    []
  );

  const navigate = useCallback((screen: GameScreen) => {
    dispatch({ type: 'NAVIGATE', screen });
  }, []);

  return { state, createCharacter, startBattle, startPvpBattle, endBattle, navigate, persistAfterBattle };
}
