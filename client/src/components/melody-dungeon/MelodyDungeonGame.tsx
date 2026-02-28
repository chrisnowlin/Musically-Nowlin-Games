import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { ChevronLeft } from 'lucide-react';
import {
  TileType,
  MAX_HEALTH,
  VISIBILITY_RADIUS,
  DEFAULT_BUFFS,
  DEFAULT_FLOOR_BUFFS,
  DEFAULT_ARMED_BUFFS,
} from '@/lib/gameLogic/dungeonTypes';
import type {
  GamePhase,
  PlayerState,
  DungeonFloor,
  ActiveChallenge,
  Position,
  DifficultyLevel,
  ChallengeType,
  EnemySubtype,
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
import type { BossBattleMeta } from './ChallengeModal';
import MerchantModal from './MerchantModal';
import UseItemsModal from './UseItemsModal';
import type { MerchantItem } from '@/lib/gameLogic/merchantItems';
import { playNote, resumeAudioContext } from './dungeonAudio';
import { getTheme } from './dungeonThemes';

function updateVisibility(floor: DungeonFloor, pos: Position, radius: number = VISIBILITY_RADIUS): DungeonFloor {
  const tiles = floor.tiles.map((row, y) =>
    row.map((tile, x) => {
      const dist = Math.max(Math.abs(x - pos.x), Math.abs(y - pos.y));
      const visible = dist <= radius;
      return {
        ...tile,
        visible,
        visited: tile.visited || visible,
      };
    })
  );
  return { ...floor, tiles };
}

/** Check if an uncleared Dragon (enemy with subtype 'dragon') occupies the given position. */
function findDragonAtPosition(floor: DungeonFloor, pos: Position): boolean {
  const tile = floor.tiles[pos.y]?.[pos.x];
  return tile?.type === TileType.Enemy && tile.enemySubtype === 'dragon' && !tile.cleared;
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
    buffs: {
      floor: { ...DEFAULT_FLOOR_BUFFS },
      persistent: { ...DEFAULT_BUFFS.persistent },
      armed: { ...DEFAULT_ARMED_BUFFS },
    },
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
  const [activeTileSubtype, setActiveTileSubtype] = useState<EnemySubtype | undefined>(undefined);
  const [activeTileLevel, setActiveTileLevel] = useState<number>(1);
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
  const playerRef = useRef(player);
  playerRef.current = player;
  const getVisRadius = () => playerRef.current.buffs.floor.torch ? VISIBILITY_RADIUS + 2 : VISIBILITY_RADIUS;
  const dragonCaughtRef = useRef<ChallengeType | false>(false);
  const [challengeKey, setChallengeKey] = useState(0);
  const activeChallengeBuffsRef = useRef({ metronome: false, tuningFork: false });
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
      const tile = result.tiles[pos.y][pos.x];
      dragonCaughtRef.current = tile.challengeType || 'noteReading';
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

      if (e.key === 'u' || e.key === 'U') {
        const p = playerRef.current.buffs.persistent;
        const hasItems =
          p.shieldCharm > 0 ||
          p.torch > 0 || p.mapScroll > 0 || p.compass > 0 ||
          p.streakSaver > 0 || p.secondChance > 0 || p.dragonBane > 0 ||
          p.luckyCoin > 0 || p.treasureMagnet > 0 || p.metronome > 0 || p.tuningFork > 0;
        if (hasItems) openBag();
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
    const challengeType = dragonCaughtRef.current;
    dragonCaughtRef.current = false;

    // Apply 1 heart penalty
    setPlayer((prev) => {
      const newHealth = Math.max(0, prev.health - 1);
      if (newHealth <= 0) {
        setPhase('gameOver');
        return { ...prev, health: 0 };
      }

      moveLockedRef.current = true;
      setActiveChallenge({ type: challengeType, tilePosition: prev.position });
      setActiveTileType(TileType.Enemy);
      setActiveTileSubtype('dragon');
      setActiveTileLevel(3);
      activeChallengeBuffsRef.current = { metronome: prev.buffs.armed.metronome > 0, tuningFork: prev.buffs.armed.tuningFork > 0 };
      setPhase('challenge');

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
          activeChallengeBuffsRef.current = { metronome: playerRef.current.buffs.armed.metronome > 0, tuningFork: playerRef.current.buffs.armed.tuningFork > 0 };
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
            return moveEnemiesAndDetectCatch(updateVisibility({ ...f, tiles }, newPos, getVisRadius()), newPos);
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

        // Encounter uncleared interactive tile (enemy, treasure, bosses)
        if (
          !tile.cleared &&
          (tile.type === TileType.Enemy ||
            tile.type === TileType.Treasure ||
            tile.type === TileType.MiniBoss ||
            tile.type === TileType.BigBoss)
        ) {
          setFloor((f) => updateVisibility(f, newPos, getVisRadius()));
          moveLockedRef.current = true;
          const challengeType: ChallengeType = tile.challengeType || 'noteReading';
          setActiveChallenge({ type: challengeType, tilePosition: newPos });
          setActiveTileType(tile.type);
          setActiveTileSubtype(tile.enemySubtype);
          setActiveTileLevel(tile.enemyLevel ?? 1);
          activeChallengeBuffsRef.current = { metronome: playerRef.current.buffs.armed.metronome > 0, tuningFork: playerRef.current.buffs.armed.tuningFork > 0 };
          setPhase('challenge');
          return { ...prev, position: newPos };
        }

        // Merchant: open the shop (no challenge, not cleared)
        if (tile.type === TileType.Merchant) {
          setFloor((f) => moveEnemiesAndDetectCatch(updateVisibility(f, newPos, getVisRadius()), newPos));
          moveLockedRef.current = true;
          setPhase('shopping');
          return { ...prev, position: newPos };
        }

        // Stairs
        if (tile.type === TileType.Stairs) {
          setFloor((f) => moveEnemiesAndDetectCatch(updateVisibility(f, newPos, getVisRadius()), newPos));
          setPhase('floorComplete');
          return { ...prev, position: newPos };
        }

        setFloor((f) => moveEnemiesAndDetectCatch(updateVisibility(f, newPos, getVisRadius()), newPos));
        return { ...prev, position: newPos };
      });
    },
    [phase, floor]
  );

  const handleChallengeResult = useCallback(
    (correct: boolean, meta?: BossBattleMeta) => {
      const newDiffState = recordResult(diffState, correct);
      setDiffState(newDiffState);

      if (!activeChallenge) return;

      // Second Chance: retry on wrong answer (not for doors or dragon battles)
      if (!correct && !meta && activeTileType !== TileType.Door) {
        const hasSecondChance = playerRef.current.buffs.armed.secondChance > 0;
        if (hasSecondChance) {
          setPlayer((prev) => ({
            ...prev,
            buffs: {
              ...prev.buffs,
              armed: {
                ...prev.buffs.armed,
                secondChance: prev.buffs.armed.secondChance - 1,
              },
            },
          }));
          setChallengeKey((k) => k + 1);
          return; // Don't process damage, don't close challenge — just retry
        }
      }

      const isBoss =
        (activeTileType === TileType.Enemy && activeTileLevel > 1) ||
        activeTileType === TileType.MiniBoss ||
        activeTileType === TileType.BigBoss;

      setPlayer((prev) => {
        let updated = { ...prev };

        if (isBoss && meta) {
          // Boss battle: damage and potions tracked inside the battle
          if (meta.shieldUsed) {
            updated.shieldCharm = 0;
          }
          // Deduct potions used during battle
          updated.potions = Math.max(0, prev.potions - (meta.potionsUsed || 0));

          if (correct) {
            const streakBonus = Math.floor(prev.streak / 3) * 25;
            updated.streak += 1;
            // Net health after battle: damage taken minus potions healed (min 1 since player won)
            const battleHealth = Math.max(1, Math.min(prev.maxHealth, prev.health - meta.damageDealt + (meta.potionsUsed || 0)));

            if (activeTileType === TileType.BigBoss) {
              updated.health = prev.maxHealth; // Full health restore
              updated.score += 1500 + streakBonus;
              updated.keys += 3;
              updated.potions += 2; // reward (after battle consumption deducted above)
            } else if (activeTileType === TileType.MiniBoss) {
              updated.health = battleHealth;
              updated.score += 750 + streakBonus;
              updated.keys += 2;
              updated.potions += 2; // reward (after battle consumption deducted above)
            } else if (activeTileSubtype === 'dragon') {
              // Dragon
              updated.health = battleHealth;
              updated.score += 500 + streakBonus;
              updated.keys += 2;
              updated.potions += 1; // reward (after battle consumption deducted above)
            } else {
              // Regular level 2–3 enemy (ghost/skeleton/goblin)
              updated.health = battleHealth;
              const levelScore = activeTileLevel === 3 ? 250 : 175;
              updated.score += levelScore + streakBonus;
              updated.keys += activeTileLevel === 3 ? 2 : 1;
            }
          } else {
            // Boss defeated the player — battle only calls onResult(false) when player HP=0
            updated.health = 0;
            if (prev.buffs.persistent.streakSaver > 0) {
              updated = {
                ...updated,
                buffs: {
                  ...updated.buffs,
                  persistent: {
                    ...updated.buffs.persistent,
                    streakSaver: updated.buffs.persistent.streakSaver - 1,
                  },
                },
              };
            } else {
              updated.streak = 0;
            }
          }

          // Dragon Bane: consume one charge after dragon battle
          if (activeTileType === TileType.Enemy && activeTileSubtype === 'dragon' && prev.buffs.persistent.dragonBane > 0) {
            updated = {
              ...updated,
              buffs: {
                ...updated.buffs,
                persistent: {
                  ...updated.buffs.persistent,
                  dragonBane: updated.buffs.persistent.dragonBane - 1,
                },
              },
            };
          }
        } else if (correct) {
          // Non-boss correct answer
          const baseScore = (activeTileType === TileType.Enemy && prev.buffs.armed.luckyCoin > 0) ? 200 : 100;
          const streakBonus = Math.floor(prev.streak / 3) * 25;
          updated.score += baseScore + streakBonus;
          updated.streak += 1;

          if (activeTileType === TileType.Enemy) {
            updated.keys += 1;
            // Lucky Coin: double base score, consume one charge
            if (prev.buffs.armed.luckyCoin > 0) {
              updated = {
                ...updated,
                buffs: {
                  ...updated.buffs,
                  armed: {
                    ...updated.buffs.armed,
                    luckyCoin: updated.buffs.armed.luckyCoin - 1,
                  },
                },
              };
            }
          }
          if (activeTileType === TileType.Treasure) {
            // Treasure Magnet: double potion reward, consume one charge
            if (prev.buffs.armed.treasureMagnet > 0) {
              updated.potions += 2;
              updated = {
                ...updated,
                buffs: {
                  ...updated.buffs,
                  armed: {
                    ...updated.buffs.armed,
                    treasureMagnet: updated.buffs.armed.treasureMagnet - 1,
                  },
                },
              };
            } else {
              updated.potions += 1;
            }
          }
        } else {
          // Non-boss wrong answer
          if (activeTileType !== TileType.Door) {
            if (prev.shieldCharm > 0) {
              updated.shieldCharm = 0;
            } else {
              updated.health = Math.max(0, prev.health - 1);
            }
            // Streak Saver: preserve streak, consume one charge
            if (prev.buffs.persistent.streakSaver > 0) {
              updated = {
                ...updated,
                buffs: {
                  ...updated.buffs,
                  persistent: {
                    ...updated.buffs.persistent,
                    streakSaver: updated.buffs.persistent.streakSaver - 1,
                  },
                },
              };
            } else {
              updated.streak = 0;
            }
          }
        }

        return updated;
      });

      // Mark tile as cleared — bosses become Stairs on victory
      setFloor((prev) => {
        const { x, y } = activeChallenge.tilePosition;
        const tiles = prev.tiles.map((row, ry) =>
          row.map((tile, rx) => {
            if (rx === x && ry === y) {
              if (tile.type === TileType.Door) {
                return { ...tile, cleared: correct, type: correct ? TileType.Floor : TileType.Door };
              }
              if (tile.type === TileType.MiniBoss || tile.type === TileType.BigBoss) {
                return { ...tile, cleared: true, type: correct ? TileType.Stairs : tile.type };
              }
              return { ...tile, cleared: true, type: correct ? TileType.Floor : tile.type };
            }
            return tile;
          })
        );
        return { ...prev, tiles };
      });

      setActiveChallenge(null);
      moveLockedRef.current = false;

      // Check game over or floor complete
      setPlayer((prev) => {
        if (prev.health <= 0) {
          setPhase('gameOver');
        } else if (correct && (activeTileType === TileType.MiniBoss || activeTileType === TileType.BigBoss)) {
          setPhase('floorComplete');
        } else {
          setPhase('playing');
        }
        return prev;
      });

      // Consume challenge buffs that were active
      if (activeChallengeBuffsRef.current.metronome) {
        setPlayer((prev) => ({
          ...prev,
          buffs: {
            ...prev.buffs,
            persistent: {
              ...prev.buffs.persistent,
              metronome: Math.max(0, prev.buffs.persistent.metronome - 1),
            },
          },
        }));
      }
      if (activeChallengeBuffsRef.current.tuningFork) {
        setPlayer((prev) => ({
          ...prev,
          buffs: {
            ...prev.buffs,
            persistent: {
              ...prev.buffs.persistent,
              tuningFork: Math.max(0, prev.buffs.persistent.tuningFork - 1),
            },
          },
        }));
      }
      activeChallengeBuffsRef.current = { metronome: false, tuningFork: false };
    },
    [diffState, activeChallenge, activeTileType, activeTileSubtype, activeTileLevel]
  );

  const handleMerchantBuy = useCallback((item: MerchantItem) => {
    setPlayer((prev) => {
      const price = item.getPrice(floorNumber);
      if (prev.score < price || !item.canBuy(prev)) return prev;
      return item.apply({ ...prev, score: prev.score - price });
    });
  }, [floorNumber]);

  const handleMerchantClose = useCallback(() => {
    moveLockedRef.current = false;
    setPhase('playing');
  }, []);

  const openBag = useCallback(() => {
    moveLockedRef.current = true;
    setPhase('inventory');
  }, []);

  const handleBagClose = useCallback(() => {
    moveLockedRef.current = false;
    setPhase('playing');
  }, []);

  const handleUseItem = useCallback((itemId: 'torch' | 'map-scroll' | 'compass') => {
    setPlayer((prev) => {
      const p = prev.buffs.persistent;
      if (itemId === 'torch' && p.torch > 0) {
        return {
          ...prev,
          buffs: {
            ...prev.buffs,
            floor: { ...prev.buffs.floor, torch: true },
            persistent: { ...p, torch: p.torch - 1 },
          },
        };
      }
      if (itemId === 'compass' && p.compass > 0) {
        return {
          ...prev,
          buffs: {
            ...prev.buffs,
            floor: { ...prev.buffs.floor, compass: true },
            persistent: { ...p, compass: p.compass - 1 },
          },
        };
      }
      if (itemId === 'map-scroll' && p.mapScroll > 0) {
        setFloor((f) => ({
          ...f,
          tiles: f.tiles.map((row) => row.map((tile) => ({ ...tile, visited: true }))),
        }));
        return {
          ...prev,
          buffs: {
            ...prev.buffs,
            floor: { ...prev.buffs.floor, mapRevealed: true },
            persistent: { ...p, mapScroll: p.mapScroll - 1 },
          },
        };
      }
      return prev;
    });
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
      buffs: {
        ...prev.buffs,
        floor: { ...DEFAULT_FLOOR_BUFFS },
      },
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
          <HUD player={player} floorNumber={floorNumber} difficulty={difficulty} themeName={themeName} onOpenBag={openBag} />
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col md:flex-row items-center justify-center gap-4 px-2 py-2">
        <DungeonGrid floor={floor} playerPosition={player.position} facingLeft={facingLeft} />
        <div className="shrink-0 flex flex-col items-center gap-3">
          <MiniMap floor={floor} playerPosition={player.position} showStairs={player.buffs.floor.compass} />
          <MobileDPad
            onMove={handleMove}
            onPotion={usePotion}
            onOpenBag={openBag}
            disabled={phase !== 'playing'}
            hasPotions={player.potions > 0}
            hasBagItems={(() => {
              const p = player.buffs.persistent;
              return player.shieldCharm > 0 ||
                p.torch > 0 || p.mapScroll > 0 || p.compass > 0 ||
                p.streakSaver > 0 || p.secondChance > 0 || p.dragonBane > 0 ||
                p.luckyCoin > 0 || p.treasureMagnet > 0 || p.metronome > 0 || p.tuningFork > 0;
            })()}
          />
        </div>
      </div>

      {phase === 'challenge' && activeChallenge && (
        <ChallengeModal
          key={challengeKey}
          challengeType={activeChallenge.type}
          tileType={activeTileType}
          difficulty={difficulty}
          floorNumber={floorNumber}
          onResult={handleChallengeResult}
          playerHealth={player.health}
          maxHealth={player.maxHealth}
          shieldCharm={player.shieldCharm}
          potions={player.potions}
          dragonBane={player.buffs.persistent.dragonBane > 0}
          slowRhythm={player.buffs.persistent.metronome > 0}
          showIntervalHint={player.buffs.persistent.tuningFork > 0}
          enemySubtype={activeTileSubtype}
          enemyLevel={activeTileLevel}
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

      {phase === 'inventory' && (
        <UseItemsModal
          player={player}
          onUse={handleUseItem}
          onClose={handleBagClose}
        />
      )}
    </div>
  );
};

export default MelodyDungeonGame;
