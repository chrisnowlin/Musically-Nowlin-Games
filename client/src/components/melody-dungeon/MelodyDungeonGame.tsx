import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { ChevronLeft } from 'lucide-react';
import {
  TileType,
  MAX_HEALTH,
  VISIBILITY_RADIUS,
} from '@/lib/gameLogic/dungeonTypes';
import type {
  GamePhase,
  PlayerState,
  DungeonFloor,
  ActiveChallenge,
  Position,
  DifficultyLevel,
  ChallengeType,
} from '@/lib/gameLogic/dungeonTypes';
import { generateDungeon, moveEnemies } from '@/lib/gameLogic/dungeonGenerator';
import {
  createDifficultyState,
  recordResult,
  type DifficultyState,
} from '@/lib/gameLogic/difficultyAdapter';
import DungeonGrid from './DungeonGrid';
import HUD from './HUD';
import MobileDPad from './MobileDPad';
import MiniMap from './MiniMap';
import ChallengeModal from './ChallengeModal';
import MerchantModal from './MerchantModal';
import { playNote, resumeAudioContext } from './dungeonAudio';
import { getTheme } from './dungeonThemes';

function updateVisibility(floor: DungeonFloor, pos: Position): DungeonFloor {
  const tiles = floor.tiles.map((row, y) =>
    row.map((tile, x) => {
      const dist = Math.max(Math.abs(x - pos.x), Math.abs(y - pos.y));
      const visible = dist <= VISIBILITY_RADIUS;
      return {
        ...tile,
        visible,
        visited: tile.visited || visible,
      };
    })
  );
  return { ...floor, tiles };
}

/** Check if an uncleared Dragon occupies the given position. */
function findDragonAtPosition(floor: DungeonFloor, pos: Position): boolean {
  const tile = floor.tiles[pos.y]?.[pos.x];
  return tile?.type === TileType.Dragon && !tile.cleared;
}

function createPlayer(start: Position): PlayerState {
  return {
    position: { ...start },
    health: MAX_HEALTH,
    maxHealth: MAX_HEALTH,
    score: 0,
    keys: 0,
    potions: 0,
    streak: 0,
    shieldCharm: 0,
  };
}

const MAX_FLOOR = 100;

const MelodyDungeonGame: React.FC = () => {
  const [, setLocation] = useLocation();
  const [phase, setPhase] = useState<GamePhase>('menu');
  const [floor, setFloor] = useState<DungeonFloor>(() => {
    const f = generateDungeon(1);
    return updateVisibility(f, f.playerStart);
  });
  const [player, setPlayer] = useState<PlayerState>(() =>
    createPlayer(floor.playerStart)
  );
  const [activeChallenge, setActiveChallenge] = useState<ActiveChallenge | null>(null);
  const [activeTileType, setActiveTileType] = useState<TileType>(TileType.Enemy);
  const [diffState, setDiffState] = useState<DifficultyState>(createDifficultyState);
  const [floorsCleared, setFloorsCleared] = useState(0);
  const [selectedStartFloor, setSelectedStartFloor] = useState(1);
  const [deepestUnlocked, setDeepestUnlocked] = useState<number>(() => {
    try {
      return Math.max(1, Math.min(MAX_FLOOR, Number(localStorage.getItem('melodyDungeonDeepest')) || 1));
    } catch {
      return 1;
    }
  });
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('melodyDungeonHighScore')) || 0;
    } catch {
      return 0;
    }
  });
  const moveLockedRef = useRef(false);
  const dragonCaughtRef = useRef(false);
  const [facingLeft, setFacingLeft] = useState(false);

  const difficulty: DifficultyLevel = diffState.level;
  const floorNumber = floor.floorNumber;
  const themeName = getTheme(floor.themeIndex).name;

  /** Run moveEnemies and flag if a chasing Dragon lands on the player. */
  function moveEnemiesAndDetectCatch(
    f: DungeonFloor,
    pos: Position
  ): DungeonFloor {
    const result = moveEnemies(f, pos);
    if (findDragonAtPosition(result, pos)) {
      dragonCaughtRef.current = true;
    }
    return result;
  }

  // Keyboard input
  useEffect(() => {
    if (phase !== 'playing') return;

    const handleKey = (e: KeyboardEvent) => {
      const keyMap: Record<string, [number, number]> = {
        ArrowUp: [0, -1],
        ArrowDown: [0, 1],
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0],
        w: [0, -1],
        s: [0, 1],
        a: [-1, 0],
        d: [1, 0],
        W: [0, -1],
        S: [0, 1],
        A: [-1, 0],
        D: [1, 0],
      };
      const dir = keyMap[e.key];
      if (dir) {
        e.preventDefault();
        handleMove(dir[0], dir[1]);
      }

      // Use potion with P key
      if (e.key === 'p' || e.key === 'P') {
        usePotion();
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  // Best-effort audio unlock for browsers with autoplay restrictions.
  useEffect(() => {
    const unlock = () => {
      void resumeAudioContext();
    };
    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('keydown', unlock);
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  // Detect Dragon catch after state settles
  useEffect(() => {
    if (!dragonCaughtRef.current || phase !== 'playing') return;
    dragonCaughtRef.current = false;

    // Apply 1 heart penalty
    setPlayer((prev) => {
      const newHealth = Math.max(0, prev.health - 1);
      if (newHealth <= 0) {
        setPhase('gameOver');
        return { ...prev, health: 0 };
      }

      // Find the Dragon at player position to get its challenge type
      const tile = floor.tiles[prev.position.y]?.[prev.position.x];
      if (tile?.type === TileType.Dragon && !tile.cleared) {
        moveLockedRef.current = true;
        const challengeType: ChallengeType = tile.challengeType || 'noteReading';
        setActiveChallenge({ type: challengeType, tilePosition: prev.position });
        setActiveTileType(TileType.Dragon);
        setPhase('challenge');
      }

      return { ...prev, health: newHealth };
    });
  }, [floor, phase]);

  const usePotion = useCallback(() => {
    setPlayer((prev) => {
      if (prev.potions <= 0 || prev.health >= prev.maxHealth) return prev;
      return {
        ...prev,
        potions: prev.potions - 1,
        health: Math.min(prev.maxHealth, prev.health + 1),
      };
    });
  }, []);

  const handleMove = useCallback(
    (dx: number, dy: number) => {
      if (phase !== 'playing' || moveLockedRef.current) return;

      if (dx < 0) setFacingLeft(true);
      if (dx > 0) setFacingLeft(false);

      setPlayer((prev) => {
        const nx = prev.position.x + dx;
        const ny = prev.position.y + dy;

        if (nx < 0 || nx >= floor.width || ny < 0 || ny >= floor.height) return prev;

        const tile = floor.tiles[ny][nx];

        if (tile.type === TileType.Wall) return prev;

        const newPos = { x: nx, y: ny };

        // Locked door: challenge from current tile; only opens on correct answer.
        if (!tile.cleared && tile.type === TileType.Door) {
          moveLockedRef.current = true;
          const challengeType: ChallengeType = tile.challengeType || 'noteReading';
          setActiveChallenge({ type: challengeType, tilePosition: newPos });
          setActiveTileType(TileType.Door);
          setPhase('challenge');
          return prev;
        }

        // Locked chest -- requires a key, no challenge
        if (!tile.cleared && tile.type === TileType.Chest) {
          if (prev.keys <= 0) {
            // No key -- bump without moving
            return prev;
          }
          // Spend a key, open the chest, grant rewards
          setFloor((f) => {
            const tiles = f.tiles.map((row, ry) =>
              row.map((t, rx) =>
                rx === nx && ry === ny ? { ...t, cleared: true, type: TileType.Floor } : t
              )
            );
            return moveEnemiesAndDetectCatch(updateVisibility({ ...f, tiles }, newPos), newPos);
          });
          return {
            ...prev,
            position: newPos,
            keys: prev.keys - 1,
            potions: prev.potions + 1,
            score: prev.score + 200,
            health: Math.min(prev.maxHealth, prev.health + 1),
          };
        }

        // Encounter uncleared interactive tile (enemy, dragon, treasure)
        if (
          !tile.cleared &&
          (tile.type === TileType.Enemy ||
            tile.type === TileType.Dragon ||
            tile.type === TileType.Treasure)
        ) {
          setFloor((f) => updateVisibility(f, newPos));
          moveLockedRef.current = true;
          const challengeType: ChallengeType = tile.challengeType || 'noteReading';
          setActiveChallenge({ type: challengeType, tilePosition: newPos });
          setActiveTileType(tile.type);
          setPhase('challenge');
          return { ...prev, position: newPos };
        }

        // Merchant: open the shop (no challenge, not cleared)
        if (tile.type === TileType.Merchant) {
          setFloor((f) => moveEnemiesAndDetectCatch(updateVisibility(f, newPos), newPos));
          moveLockedRef.current = true;
          setPhase('shopping');
          return { ...prev, position: newPos };
        }

        // Stairs
        if (tile.type === TileType.Stairs) {
          setFloor((f) => moveEnemiesAndDetectCatch(updateVisibility(f, newPos), newPos));
          setPhase('floorComplete');
          return { ...prev, position: newPos };
        }

        setFloor((f) => moveEnemiesAndDetectCatch(updateVisibility(f, newPos), newPos));
        return { ...prev, position: newPos };
      });
    },
    [phase, floor]
  );

  const handleChallengeResult = useCallback(
    (correct: boolean) => {
      const newDiffState = recordResult(diffState, correct);
      setDiffState(newDiffState);

      if (!activeChallenge) return;

      setPlayer((prev) => {
        let updated = { ...prev };

        if (correct) {
          const isDragon = activeTileType === TileType.Dragon;
          const streakBonus = Math.floor(prev.streak / 3) * 25;
          updated.score += (isDragon ? 500 : 100) + streakBonus;
          updated.streak += 1;

          if (activeTileType === TileType.Enemy) {
            updated.keys += 1;
          }
          if (isDragon) {
            updated.keys += 2;
            updated.potions += 1;
          }
          if (activeTileType === TileType.Treasure) {
            updated.potions += 1;
          }
        } else {
          // Doors allow unlimited attempts: wrong answers do not punish health.
          if (activeTileType !== TileType.Door) {
            if (prev.shieldCharm > 0) {
              updated.shieldCharm = 0;
            } else {
              updated.health = Math.max(0, prev.health - 1);
            }
            updated.streak = 0;
          }
        }

        return updated;
      });

      // Mark tile as cleared
      setFloor((prev) => {
        const { x, y } = activeChallenge.tilePosition;
        const tiles = prev.tiles.map((row, ry) =>
          row.map((tile, rx) => {
            if (rx === x && ry === y) {
              if (tile.type === TileType.Door) {
                return {
                  ...tile,
                  cleared: correct,
                  type: correct ? TileType.Floor : TileType.Door,
                };
              }
              return {
                ...tile,
                cleared: true,
                type: correct ? TileType.Floor : tile.type,
              };
            }
            return tile;
          })
        );
        return { ...prev, tiles };
      });

      setActiveChallenge(null);
      moveLockedRef.current = false;

      // Check game over
      setPlayer((prev) => {
        if (prev.health <= 0) {
          setPhase('gameOver');
        } else {
          setPhase('playing');
        }
        return prev;
      });
    },
    [diffState, activeChallenge, activeTileType]
  );

  const handleMerchantBuy = useCallback((updatedPlayer: PlayerState) => {
    setPlayer(updatedPlayer);
  }, []);

  const handleMerchantClose = useCallback(() => {
    moveLockedRef.current = false;
    setPhase('playing');
  }, []);

  const startNewGame = useCallback(() => {
    const newFloor = generateDungeon(selectedStartFloor);
    const visibleFloor = updateVisibility(newFloor, newFloor.playerStart);
    setFloor(visibleFloor);
    setPlayer(createPlayer(newFloor.playerStart));
    setDiffState(createDifficultyState());
    setFloorsCleared(0);
    setActiveChallenge(null);
    moveLockedRef.current = false;
    setPhase('playing');
    playNote('C4', 0.2);
  }, [selectedStartFloor]);

  const descendFloor = useCallback(() => {
    const nextFloorNum = floorNumber + 1;
    setFloorsCleared((c) => c + 1);

    // Unlock the next floor for future runs
    if (nextFloorNum > deepestUnlocked) {
      const newDeepest = Math.min(nextFloorNum, MAX_FLOOR);
      setDeepestUnlocked(newDeepest);
      try { localStorage.setItem('melodyDungeonDeepest', String(newDeepest)); } catch {}
    }

    if (nextFloorNum > MAX_FLOOR) {
      setPhase('victory');
      return;
    }

    const newFloor = generateDungeon(nextFloorNum);
    const visibleFloor = updateVisibility(newFloor, newFloor.playerStart);
    setFloor(visibleFloor);
    setPlayer((prev) => ({
      ...prev,
      position: { ...newFloor.playerStart },
    }));
    moveLockedRef.current = false;
    setPhase('playing');
    playNote('G4', 0.15);
    setTimeout(() => playNote('C5', 0.3), 150);
  }, [floorNumber, deepestUnlocked]);

  // Save high score
  useEffect(() => {
    if ((phase === 'gameOver' || phase === 'victory') && player.score > highScore) {
      setHighScore(player.score);
      try {
        localStorage.setItem('melodyDungeonHighScore', String(player.score));
      } catch {}
    }
  }, [phase, player.score, highScore]);

  // --- MENU ---
  if (phase === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-indigo-950 to-gray-950 flex flex-col items-center justify-center p-4 text-white">
        <button
          onClick={() => setLocation('/games')}
          className="absolute top-4 left-4 flex items-center gap-1 text-gray-400 hover:text-white transition-colors text-sm"
        >
          <ChevronLeft size={18} /> Back
        </button>

        <div className="text-center mb-8">
          <div className="text-6xl mb-3">{'\uD83C\uDFB5'}</div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Melody Dungeon
          </h1>
          <p className="text-gray-400 mt-2">A musical adventure awaits...</p>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-xs">
          <div className="flex flex-col gap-1">
            <label htmlFor="floor-select" className="text-xs text-gray-400 text-center">
              Starting Floor ({deepestUnlocked === 1 ? 'clear floors to unlock more' : `1 – ${deepestUnlocked} unlocked`})
            </label>
            <div className="flex items-center gap-2 justify-center">
              <button
                onClick={() => setSelectedStartFloor((f) => Math.max(1, f - 1))}
                disabled={selectedStartFloor <= 1}
                className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-30 font-bold text-lg transition-colors"
              >
                -
              </button>
              <span className="w-20 text-center text-2xl font-bold text-purple-300 tabular-nums">
                B{selectedStartFloor}F
              </span>
              <button
                onClick={() => setSelectedStartFloor((f) => Math.min(deepestUnlocked, f + 1))}
                disabled={selectedStartFloor >= deepestUnlocked}
                className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-30 font-bold text-lg transition-colors"
              >
                +
              </button>
            </div>
          </div>

          <button
            onClick={startNewGame}
            className="py-3 px-6 bg-purple-700 hover:bg-purple-600 rounded-xl font-bold text-lg transition-colors shadow-lg shadow-purple-900/50"
          >
            Enter the Dungeon
          </button>

          {highScore > 0 && (
            <p className="text-center text-sm text-gray-500">
              Best Score: {highScore}
            </p>
          )}
        </div>

        <div className="mt-8 text-gray-500 text-xs text-center max-w-sm space-y-1">
          <p>Use arrow keys or WASD to move. On mobile, use the D-pad.</p>
          <p>Defeat enemies with music knowledge to earn keys and unlock doors!</p>
          <p>Press P to use a potion. {MAX_FLOOR} floors to conquer!</p>
        </div>
      </div>
    );
  }

  // --- GAME OVER ---
  if (phase === 'gameOver') {
    const isNewHigh = player.score >= highScore && player.score > 0;
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-red-950/30 to-gray-950 flex flex-col items-center justify-center p-4 text-white">
        <button
          onClick={() => setLocation('/games')}
          className="absolute top-4 left-4 flex items-center gap-1 text-gray-400 hover:text-white transition-colors text-sm"
        >
          <ChevronLeft size={18} /> Back
        </button>

        <div className="bg-gray-900/80 rounded-2xl p-6 max-w-sm w-full text-center border border-gray-800">
          <h2 className="text-3xl font-bold mb-2">Game Over</h2>
          {isNewHigh && (
            <p className="text-yellow-400 animate-pulse mb-2">New High Score!</p>
          )}
          <div className="text-5xl font-bold text-purple-400 mb-4">{player.score}</div>

          <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
            <div className="bg-gray-800 rounded-lg p-2">
              <div className="text-lg font-bold text-purple-300">B{floorNumber}F</div>
              <div className="text-gray-500">Deepest Floor</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-2">
              <div className="text-lg font-bold text-green-400">{floorsCleared}</div>
              <div className="text-gray-500">Floors Cleared</div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={startNewGame}
              className="py-3 bg-purple-700 hover:bg-purple-600 rounded-xl font-bold transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => setPhase('menu')}
              className="py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm transition-colors"
            >
              Main Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- VICTORY ---
  if (phase === 'victory') {
    const isNewHigh = player.score >= highScore && player.score > 0;
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-yellow-950/30 to-gray-950 flex flex-col items-center justify-center p-4 text-white">
        <div className="bg-gray-900/80 rounded-2xl p-6 max-w-sm w-full text-center border border-yellow-700">
          <div className="text-5xl mb-2">{'\uD83C\uDFC6'}</div>
          <h2 className="text-3xl font-bold mb-1 bg-gradient-to-r from-yellow-300 to-amber-400 bg-clip-text text-transparent">
            Victory!
          </h2>
          <p className="text-gray-400 text-sm mb-4">
            You conquered all {MAX_FLOOR} floors of the Melody Dungeon!
          </p>
          {isNewHigh && (
            <p className="text-yellow-400 animate-pulse mb-2">New High Score!</p>
          )}
          <div className="text-5xl font-bold text-purple-400 mb-4">{player.score}</div>

          <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
            <div className="bg-gray-800 rounded-lg p-2">
              <div className="text-lg font-bold text-yellow-300">{MAX_FLOOR}</div>
              <div className="text-gray-500">Floors Cleared</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-2">
              <div className="text-lg font-bold text-green-400">{floorsCleared}</div>
              <div className="text-gray-500">This Run</div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={startNewGame}
              className="py-3 bg-purple-700 hover:bg-purple-600 rounded-xl font-bold transition-colors"
            >
              Play Again
            </button>
            <button
              onClick={() => setPhase('menu')}
              className="py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm transition-colors"
            >
              Main Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- FLOOR COMPLETE ---
  if (phase === 'floorComplete') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-emerald-950/30 to-gray-950 flex flex-col items-center justify-center p-4 text-white">
        <div className="bg-gray-900/80 rounded-2xl p-6 max-w-sm w-full text-center border border-emerald-800">
          <div className="text-4xl mb-2">{'\uD83E\uDEDC'}</div>
          <h2 className="text-2xl font-bold mb-1">Floor {floorNumber} Cleared!</h2>
          <p className="text-gray-400 text-sm mb-4">
            You found the stairs to the next level.
          </p>
          <div className="text-3xl font-bold text-purple-400 mb-4">{player.score} pts</div>
          <button
            onClick={descendFloor}
            className="w-full py-3 bg-emerald-700 hover:bg-emerald-600 rounded-xl font-bold transition-colors"
          >
            {floorNumber >= MAX_FLOOR ? 'Claim Victory!' : `Descend to B${floorNumber + 1}F`}
          </button>
          <p className="text-gray-500 text-xs mt-2">
            Floor {floorNumber} / {MAX_FLOOR}
          </p>
        </div>
      </div>
    );
  }

  // --- PLAYING ---
  return (
    <div className="h-screen bg-gray-950 flex flex-col text-white overflow-hidden">
      <div className="flex items-center gap-2 px-2 py-1 shrink-0">
        <button
          onClick={() => setLocation('/games')}
          className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors text-sm shrink-0"
        >
          <ChevronLeft size={18} /> Back
        </button>
        <div className="flex-1">
          <HUD player={player} floorNumber={floorNumber} difficulty={difficulty} themeName={themeName} />
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col md:flex-row items-center justify-center gap-4 px-2 py-2">
        <DungeonGrid floor={floor} playerPosition={player.position} facingLeft={facingLeft} />
        <div className="shrink-0 flex flex-col items-center gap-3">
          <MiniMap floor={floor} playerPosition={player.position} />
          <MobileDPad
            onMove={handleMove}
            onPotion={usePotion}
            disabled={phase !== 'playing'}
            hasPotions={player.potions > 0}
          />
        </div>
      </div>

      {phase === 'challenge' && activeChallenge && (
        <ChallengeModal
          challengeType={activeChallenge.type}
          tileType={activeTileType}
          difficulty={difficulty}
          floorNumber={floorNumber}
          onResult={handleChallengeResult}
        />
      )}

      {phase === 'shopping' && (
        <MerchantModal
          player={player}
          floorNumber={floorNumber}
          onBuy={handleMerchantBuy}
          onClose={handleMerchantClose}
        />
      )}
    </div>
  );
};

export default MelodyDungeonGame;
