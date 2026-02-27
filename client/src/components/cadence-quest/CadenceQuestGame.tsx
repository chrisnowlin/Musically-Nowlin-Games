import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useLocation } from 'wouter';
import { ResponsiveGameLayout } from '@/components/ResponsiveGameLayout';
import { useGameState } from '@/lib/cadence-quest/useGameState';
import CharacterCreation from './CharacterCreation';
import WorldMap from './WorldMap';
import BattleScreen from './BattleScreen';
import VictoryScreen from './VictoryScreen';
import SkillTree from './SkillTree';
import CollectionScreen from './CollectionScreen';
import MatchmakingScreen from './MatchmakingScreen';

export default function CadenceQuestGame() {
  const [, setLocation] = useLocation();
  const { state, createCharacter, startBattle, startPvpBattle, endBattle, navigate, persistAfterBattle } = useGameState();

  const handleBattleEnd = (winner: 'player' | 'opponent') => {
    endBattle(winner === 'player');
  };

  const persistedRef = React.useRef(false);
  React.useEffect(() => {
    if (state.screen === 'victory' && state.character && state.battleContext && state.lastBattleVictory !== null && !persistedRef.current) {
      persistedRef.current = true;
      persistAfterBattle(state.character, state.battleContext, state.lastBattleVictory);
    }
    if (state.screen !== 'victory') persistedRef.current = false;
  }, [state.screen, state.character, state.battleContext, state.lastBattleVictory, persistAfterBattle]);

  if (state.screen === 'menu') {
    return (
      <ResponsiveGameLayout>
        <div className="flex flex-col items-center justify-center gap-8 p-8">
          <h1 className="text-4xl font-bold text-purple-900 drop-shadow-sm">Cadence Quest</h1>
          <p className="text-purple-800 text-center max-w-md">
            A music RPG. Master rhythm, pitch, harmony, dynamics, and theory through turn-based battles!
          </p>
          <button
            onClick={() => navigate('character-creation')}
            className="px-8 py-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg"
          >
            New Game
          </button>
          <button
            onClick={() => setLocation('/games')}
            className="flex items-center gap-2 text-purple-800 hover:text-purple-900 hover:bg-purple-200/60 px-3 py-2 rounded-lg"
          >
            <ChevronLeft size={20} />
            Back to Games
          </button>
        </div>
      </ResponsiveGameLayout>
    );
  }

  if (state.screen === 'character-creation') {
    return (
      <ResponsiveGameLayout>
        <CharacterCreation onCreate={createCharacter} />
        <button
          onClick={() => navigate('menu')}
          className="absolute top-4 left-4 p-2 rounded-lg text-purple-800 hover:bg-purple-200/60 hover:text-purple-900"
        >
          <ChevronLeft size={24} />
        </button>
      </ResponsiveGameLayout>
    );
  }

  if (state.screen === 'world-map' && state.character) {
    return (
      <ResponsiveGameLayout>
        <WorldMap
          character={state.character}
          onSelectEncounter={(regionId, encounterIndex, isBoss) =>
            startBattle(regionId, encounterIndex, isBoss)
          }
          onNavigate={(screen) => navigate(screen)}
        />
      </ResponsiveGameLayout>
    );
  }

  if (state.screen === 'battle' && state.character && state.battleContext) {
    const ctx = state.battleContext;
    const isPvP = 'battleRoomId' in ctx;
    return (
      <ResponsiveGameLayout>
        <BattleScreen
          battleId={isPvP ? ctx.battleRoomId : `battle-${Date.now()}`}
          type={isPvP ? 'pvp' : 'pve'}
          playerCharacter={state.character}
          opponent={
            isPvP
              ? { name: ctx.opponent.name, class: ctx.opponent.class, maxHp: ctx.opponent.maxHp }
              : { name: 'Enemy', class: state.character.class, maxHp: 100 }
          }
          regionId={isPvP ? undefined : ctx.regionId}
          encounterIndex={isPvP ? undefined : ctx.encounterIndex}
          isBoss={isPvP ? false : ctx.isBoss}
          battleRoomId={isPvP ? ctx.battleRoomId : undefined}
          initialChallenge={isPvP ? ctx.initialChallenge : undefined}
          challengeShownAt={isPvP ? ctx.challengeShownAt : undefined}
          onVictory={handleBattleEnd}
        />
      </ResponsiveGameLayout>
    );
  }

  if (state.screen === 'victory') {
    return (
      <ResponsiveGameLayout>
        <VictoryScreen
          victory={state.lastBattleVictory ?? true}
          onContinue={() => navigate('world-map')}
        />
      </ResponsiveGameLayout>
    );
  }

  if (state.screen === 'skill-tree' && state.character) {
    return (
      <ResponsiveGameLayout>
        <SkillTree character={state.character} onBack={() => navigate('world-map')} />
      </ResponsiveGameLayout>
    );
  }

  if (state.screen === 'collection' && state.character) {
    return (
      <ResponsiveGameLayout>
        <CollectionScreen character={state.character} onBack={() => navigate('world-map')} />
      </ResponsiveGameLayout>
    );
  }

  if (state.screen === 'pvp') {
    return (
      <ResponsiveGameLayout>
        <MatchmakingScreen
          character={state.character}
          onMatched={(battleRoomId, opponent, challenge, shownAt) =>
            startPvpBattle(battleRoomId, opponent, challenge, shownAt)
          }
          onBack={() => navigate('world-map')}
        />
      </ResponsiveGameLayout>
    );
  }

  return (
    <ResponsiveGameLayout>
      <div className="p-8">
        <button
          onClick={() => navigate('menu')}
          className="flex items-center gap-2 text-purple-800 hover:text-purple-900 hover:bg-purple-200/60 px-3 py-2 rounded-lg transition-colors"
        >
          <ChevronLeft size={20} />
          Back
        </button>
      </div>
    </ResponsiveGameLayout>
  );
}
