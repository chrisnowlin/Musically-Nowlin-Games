import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { ChevronLeft, HelpCircle } from 'lucide-react';
import {
  TileType,
  MAX_HEALTH,
  VISIBILITY_RADIUS,
  DEFAULT_BUFFS,
  DEFAULT_FLOOR_BUFFS,
  DEFAULT_ARMED_BUFFS,
} from './logic/dungeonTypes';
import type {
  GamePhase,
  PlayerState,
  DungeonFloor,
  ActiveChallenge,
  Position,
  ChallengeType,
  EnemySubtype,
  Tile,
} from './logic/dungeonTypes';
import { generateDungeon, moveEnemies } from './logic/dungeonGenerator';
import DungeonGrid from './DungeonGrid';
import HUD from './HUD';
import MobileDPad from './MobileDPad';
import MiniMap from './MiniMap';
import ChallengeModal from './ChallengeModal';
import type { BossBattleMeta } from './ChallengeModal';
import MerchantModal from './MerchantModal';
import DirectionsModal from './DirectionsModal';
import UseItemsModal from './UseItemsModal';
import type { MerchantItem } from './logic/merchantItems';
import { rollChestReward } from './logic/merchantItems';
import type { ChestReward } from './logic/merchantItems';
import ChestRewardModal from './ChestRewardModal';
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

/** Return the tile if any uncleared enemy occupies the player's position (i.e. it bumped into them), otherwise null. */
function findCatchingEnemyAtPosition(floor: DungeonFloor, pos: Position): Tile | null {
  const tile = floor.tiles[pos.y]?.[pos.x];
  if (tile?.type === TileType.Enemy && !tile.cleared) return tile;
  return null;
}

/** Finds the boss anchor tile (MiniBoss or BigBoss) in the floor grid, if one exists. */
function findBossAnchor(
  tiles: Tile[][],
): { pos: Position; type: TileType.MiniBoss | TileType.BigBoss } | null {
  for (let y = 0; y < tiles.length; y++) {
    for (let x = 0; x < tiles[y].length; x++) {
      const t = tiles[y][x];
      if (t.type === TileType.MiniBoss) return { pos: { x, y }, type: TileType.MiniBoss };
      if (t.type === TileType.BigBoss) return { pos: { x, y }, type: TileType.BigBoss };
    }
  }
  return null;
}

function createPlayer(start: Position): PlayerState {
  return {
    position: { ...start },
    health: MAX_HEALTH,
    maxHealth: MAX_HEALTH,
    gold: 0,
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
  const [floorsCleared, setFloorsCleared] = useState(0);
  const [selectedStartFloor, setSelectedStartFloor] = useState(1);
  const [deepestUnlocked, setDeepestUnlocked] = useState<number>(() => {
    try {
      return Math.max(1, Math.min(MAX_FLOOR, Number(localStorage.getItem('melodyDungeonDeepest')) || 1));
    } catch {
      return 1;
    }
  });
  const [highGold, setHighGold] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('melodyDungeonHighGold')) || 0;
    } catch {
      return 0;
    }
  });
  const moveLockedRef = useRef(false);
  const playerRef = useRef(player);
  playerRef.current = player;
  const getVisRadius = () => playerRef.current.buffs.floor.torch ? VISIBILITY_RADIUS + 2 : VISIBILITY_RADIUS;
  const enemyCaughtRef = useRef<{ challengeType: ChallengeType; subtype: EnemySubtype; level: number } | false>(false);
  const [challengeKey, setChallengeKey] = useState(0);
  const activeChallengeBuffsRef = useRef({ metronome: false, tuningFork: false });
  const [facingLeft, setFacingLeft] = useState(false);
  const [pendingChestReward, setPendingChestReward] = useState<ChestReward | null>(null);
  const [showDirections, setShowDirections] = useState(false);
  const [dragonFireActive, setDragonFireActive] = useState(false);
  const [shieldEffectActive, setShieldEffectActive] = useState(false);

  const floorNumber = floor.floorNumber;
  const themeName = getTheme(floor.themeIndex).name;

  /** Run moveEnemies and flag if any enemy lands on the player tile. */
  const moveEnemiesAndDetectCatch = useCallback(
    (f: DungeonFloor, pos: Position): DungeonFloor => {
      const result = moveEnemies(f, pos);
      const caught = findCatchingEnemyAtPosition(result, pos);
      if (caught) {
        enemyCaughtRef.current = {
          challengeType: caught.challengeType || 'noteReading',
          subtype: caught.enemySubtype || 'ghost',
          level: caught.enemyLevel || 1,
        };
      }
      return result;
    },
    []
  );

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

  // Detect enemy catch after state settles
  useEffect(() => {
    if (!enemyCaughtRef.current || phase !== 'playing') return;
    const { challengeType, subtype, level } = enemyCaughtRef.current;
    enemyCaughtRef.current = false;

    if (subtype === 'dragon') {
      // Dragon catch: deal damage, show fire effect, then start challenge after delay
      moveLockedRef.current = true;
      setPlayer((prev) => {
        let updated = { ...prev };
        if (prev.shieldCharm > 0) {
          updated.shieldCharm = 0;
          setShieldEffectActive(true);
          setTimeout(() => setShieldEffectActive(false), 600);
        } else if (prev.buffs.armed.dragonBane > 0) {
          updated = {
            ...updated,
            buffs: {
              ...updated.buffs,
              armed: {
                ...updated.buffs.armed,
                dragonBane: updated.buffs.armed.dragonBane - 1,
              },
            },
          };
        } else {
          updated.health = Math.max(0, prev.health - 1);
        }
        if (updated.health <= 0) {
          setPhase('gameOver');
          return { ...updated, health: 0 };
        }
        return updated;
      });
      setDragonFireActive(true);
      setTimeout(() => {
        setDragonFireActive(false);
        // Start challenge if player survived the catch damage
        setPlayer((prev) => {
          if (prev.health <= 0) return prev;
          setActiveChallenge({ type: challengeType, tilePosition: prev.position });
          setActiveTileType(TileType.Enemy);
          setActiveTileSubtype(subtype);
          setActiveTileLevel(level);
          activeChallengeBuffsRef.current = { metronome: prev.buffs.armed.metronome > 0, tuningFork: prev.buffs.armed.tuningFork > 0 };
          setPhase('challenge');
          return prev;
        });
      }, 800);
    } else {
      // Non-dragon enemies: go straight to challenge
      setPlayer((prev) => {
        moveLockedRef.current = true;
        setActiveChallenge({ type: challengeType, tilePosition: prev.position });
        setActiveTileType(TileType.Enemy);
        setActiveTileSubtype(subtype);
        setActiveTileLevel(level);
        activeChallengeBuffsRef.current = { metronome: prev.buffs.armed.metronome > 0, tuningFork: prev.buffs.armed.tuningFork > 0 };
        setPhase('challenge');
        return prev;
      });
    }
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
          const reward = rollChestReward(floorNumber);
          moveLockedRef.current = true;   // lock movement while chest reward modal is visible
          setPendingChestReward(reward);
          if (reward.kind === 'potion') {
            return {
              ...prev,
              position: newPos,
              keys: prev.keys - 1,
              potions: prev.potions + 1,
              gold: prev.gold + 200,
            };
          }
          // item reward: apply item effect + base bonus (no extra potion)
          const afterItem = reward.item.apply({
            ...prev,
            position: newPos,
            keys: prev.keys - 1,
            gold: prev.gold + 200,
          });
          return afterItem;
        }

        // Boss body: find anchor and trigger encounter; player stays outside footprint.
        // Note: after boss defeat, Task 5 converts all BossBody tiles to Floor.
        // Until then (during boss battle), BossBody tiles without a resolvable anchor return prev.
        if (tile.type === TileType.BossBody) {
          const bossAnchor = findBossAnchor(floor.tiles);
          if (!bossAnchor) return prev;
          const anchorTile = floor.tiles[bossAnchor.pos.y][bossAnchor.pos.x];
          if (anchorTile.cleared) return prev;
          setFloor((f) => updateVisibility(f, newPos, getVisRadius()));
          moveLockedRef.current = true;
          const challengeType: ChallengeType = anchorTile.challengeType || 'noteReading';
          setActiveChallenge({ type: challengeType, tilePosition: bossAnchor.pos });
          setActiveTileType(bossAnchor.type);
          setActiveTileSubtype(anchorTile.enemySubtype);
          setActiveTileLevel(anchorTile.enemyLevel ?? 1);
          activeChallengeBuffsRef.current = { metronome: playerRef.current.buffs.armed.metronome > 0, tuningFork: playerRef.current.buffs.armed.tuningFork > 0 };
          setPhase('challenge');
          return prev; // player stays outside the footprint
        }

        // Boss anchor: trigger encounter; player stays outside footprint
        if (!tile.cleared && (tile.type === TileType.MiniBoss || tile.type === TileType.BigBoss)) {
          setFloor((f) => updateVisibility(f, newPos, getVisRadius()));
          moveLockedRef.current = true;
          const challengeType: ChallengeType = tile.challengeType || 'noteReading';
          // newPos is the anchor tile's position in this branch (player walked into the anchor directly)
          setActiveChallenge({ type: challengeType, tilePosition: newPos });
          setActiveTileType(tile.type);
          setActiveTileSubtype(tile.enemySubtype);
          setActiveTileLevel(tile.enemyLevel ?? 1);
          activeChallengeBuffsRef.current = { metronome: playerRef.current.buffs.armed.metronome > 0, tuningFork: playerRef.current.buffs.armed.tuningFork > 0 };
          setPhase('challenge');
          return prev; // player stays outside the footprint
        }

        // Encounter uncleared interactive tile (enemy, treasure)
        if (
          !tile.cleared &&
          (tile.type === TileType.Enemy || tile.type === TileType.Treasure)
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
              updated.gold += 1500 + streakBonus;
              updated.keys += 3;
              updated.potions += 2; // reward (after battle consumption deducted above)
            } else if (activeTileType === TileType.MiniBoss) {
              updated.health = battleHealth;
              updated.gold += 750 + streakBonus;
              updated.keys += 2;
              updated.potions += 2; // reward (after battle consumption deducted above)
            } else if (activeTileSubtype === 'dragon') {
              // Dragon
              updated.health = battleHealth;
              updated.gold += 500 + streakBonus;
              updated.keys += 2;
              updated.potions += 1; // reward (after battle consumption deducted above)
            } else {
              // Regular level 2–3 enemy (ghost/skeleton/goblin)
              updated.health = battleHealth;
              const levelGold = activeTileLevel === 3 ? 250 : 175;
              updated.gold += levelGold + streakBonus;
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
          const baseGold = (activeTileType === TileType.Enemy && prev.buffs.armed.luckyCoin > 0) ? 200 : 100;
          const streakBonus = Math.floor(prev.streak / 3) * 25;
          updated.gold += baseGold + streakBonus;
          updated.streak += 1;

          if (activeTileType === TileType.Enemy) {
            updated.keys += 1;
            // Lucky Coin: double base gold, consume one charge
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
              setShieldEffectActive(true);
              setTimeout(() => setShieldEffectActive(false), 600);
            } else {
              updated.health = Math.max(0, prev.health - 1);
            }
            // Streak Saver: preserve streak, consume one armed charge
            if (prev.buffs.armed.streakSaver > 0) {
              updated = {
                ...updated,
                buffs: {
                  ...updated.buffs,
                  armed: {
                    ...updated.buffs.armed,
                    streakSaver: updated.buffs.armed.streakSaver - 1,
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
        const isBossVictory =
          correct &&
          (activeTileType === TileType.MiniBoss || activeTileType === TileType.BigBoss);
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
            // On boss victory, clear all BossBody tiles (there is only one boss per floor)
            if (isBossVictory && tile.type === TileType.BossBody) {
              return { ...tile, type: TileType.Floor };
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
            armed: {
              ...prev.buffs.armed,
              metronome: Math.max(0, prev.buffs.armed.metronome - 1),
            },
          },
        }));
      }
      if (activeChallengeBuffsRef.current.tuningFork) {
        setPlayer((prev) => ({
          ...prev,
          buffs: {
            ...prev.buffs,
            armed: {
              ...prev.buffs.armed,
              tuningFork: Math.max(0, prev.buffs.armed.tuningFork - 1),
            },
          },
        }));
      }
      activeChallengeBuffsRef.current = { metronome: false, tuningFork: false };
    },
    [activeChallenge, activeTileType, activeTileSubtype, activeTileLevel]
  );

  const handleMerchantBuy = useCallback((item: MerchantItem) => {
    setPlayer((prev) => {
      const price = item.getPrice(floorNumber);
      if (prev.gold < price || !item.canBuy(prev)) return prev;
      return item.apply({ ...prev, gold: prev.gold - price });
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

  const handleUseItem = useCallback((itemId: string) => {
    setPlayer((prev) => {
      const p = prev.buffs.persistent;
      const a = prev.buffs.armed;
      // Active items: immediate floor effect
      if (itemId === 'torch' && p.torch > 0) {
        return { ...prev, buffs: { ...prev.buffs, floor: { ...prev.buffs.floor, torch: true }, persistent: { ...p, torch: p.torch - 1 } } };
      }
      if (itemId === 'compass' && p.compass > 0) {
        return { ...prev, buffs: { ...prev.buffs, floor: { ...prev.buffs.floor, compass: true }, persistent: { ...p, compass: p.compass - 1 } } };
      }
      if (itemId === 'map-scroll' && p.mapScroll > 0) {
        setFloor((f) => ({ ...f, tiles: f.tiles.map((row) => row.map((tile) => ({ ...tile, visited: true }))) }));
        return { ...prev, buffs: { ...prev.buffs, floor: { ...prev.buffs.floor, mapRevealed: true }, persistent: { ...p, mapScroll: p.mapScroll - 1 } } };
      }
      // Passive items: arm for auto-trigger
      if (itemId === 'shield-charm' && p.shieldCharm > 0) {
        return { ...prev, shieldCharm: prev.shieldCharm + 1, buffs: { ...prev.buffs, persistent: { ...p, shieldCharm: p.shieldCharm - 1 } } };
      }
      if (itemId === 'streak-saver' && p.streakSaver > 0) {
        return { ...prev, buffs: { ...prev.buffs, armed: { ...a, streakSaver: a.streakSaver + 1 }, persistent: { ...p, streakSaver: p.streakSaver - 1 } } };
      }
      if (itemId === 'second-chance' && p.secondChance > 0) {
        return { ...prev, buffs: { ...prev.buffs, armed: { ...a, secondChance: a.secondChance + 1 }, persistent: { ...p, secondChance: p.secondChance - 1 } } };
      }
      if (itemId === 'dragon-bane' && p.dragonBane > 0) {
        return { ...prev, buffs: { ...prev.buffs, armed: { ...a, dragonBane: a.dragonBane + 1 }, persistent: { ...p, dragonBane: p.dragonBane - 1 } } };
      }
      if (itemId === 'lucky-coin' && p.luckyCoin > 0) {
        return { ...prev, buffs: { ...prev.buffs, armed: { ...a, luckyCoin: a.luckyCoin + 1 }, persistent: { ...p, luckyCoin: p.luckyCoin - 1 } } };
      }
      if (itemId === 'treasure-magnet' && p.treasureMagnet > 0) {
        return { ...prev, buffs: { ...prev.buffs, armed: { ...a, treasureMagnet: a.treasureMagnet + 1 }, persistent: { ...p, treasureMagnet: p.treasureMagnet - 1 } } };
      }
      if (itemId === 'metronome' && p.metronome > 0) {
        return { ...prev, buffs: { ...prev.buffs, armed: { ...a, metronome: a.metronome + 1 }, persistent: { ...p, metronome: p.metronome - 1 } } };
      }
      if (itemId === 'tuning-fork' && p.tuningFork > 0) {
        return { ...prev, buffs: { ...prev.buffs, armed: { ...a, tuningFork: a.tuningFork + 1 }, persistent: { ...p, tuningFork: p.tuningFork - 1 } } };
      }
      return prev;
    });
  }, []);

  const startNewGame = useCallback(() => {
    const newFloor = generateDungeon(selectedStartFloor);
    const visibleFloor = updateVisibility(newFloor, newFloor.playerStart);
    setFloor(visibleFloor);
    setPlayer(createPlayer(newFloor.playerStart));
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

  // Save high gold
  useEffect(() => {
    if ((phase === 'gameOver' || phase === 'victory') && player.gold > highGold) {
      setHighGold(player.gold);
      try {
        localStorage.setItem('melodyDungeonHighGold', String(player.gold));
      } catch {}
    }
  }, [phase, player.gold, highGold]);

  // --- MENU ---
  if (phase === 'menu') {
    return (
      <>
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

          <button
            onClick={() => setShowDirections(true)}
            className="py-2 px-4 text-purple-600 dark:text-purple-300 hover:text-purple-700 font-semibold transition-colors flex items-center justify-center gap-2 mx-auto"
            data-testid="button-directions"
          >
            <HelpCircle size={20} />
            How to Play
          </button>

          {highGold > 0 && (
            <p className="text-center text-sm text-gray-500">
              Most Gold: {highGold}
            </p>
          )}
        </div>

        <div className="mt-8 text-gray-500 text-xs text-center max-w-sm space-y-1">
          <p>Use arrow keys or WASD to move. On mobile, use the D-pad.</p>
          <p>Defeat enemies with music knowledge to earn keys and unlock doors!</p>
          <p>Press P to use a potion. {MAX_FLOOR} floors to conquer!</p>
        </div>
      </div>
      <DirectionsModal isOpen={showDirections} onClose={() => setShowDirections(false)} />
    </>
    );
  }

  // --- GAME OVER ---
  if (phase === 'gameOver') {
    const isNewHigh = player.gold >= highGold && player.gold > 0;
    return (
      <>
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
            <p className="text-yellow-400 animate-pulse mb-2">New Gold Record!</p>
          )}
          <div className="text-5xl font-bold text-amber-400 mb-4">{'\uD83E\uDE99'} {player.gold}</div>

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
      <DirectionsModal isOpen={showDirections} onClose={() => setShowDirections(false)} />
    </>
    );
  }

  // --- VICTORY ---
  if (phase === 'victory') {
    const isNewHigh = player.gold >= highGold && player.gold > 0;
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
            <p className="text-yellow-400 animate-pulse mb-2">New Gold Record!</p>
          )}
          <div className="text-5xl font-bold text-amber-400 mb-4">{'\uD83E\uDE99'} {player.gold}</div>

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
          <div className="text-3xl font-bold text-amber-400 mb-4">{'\uD83E\uDE99'} {player.gold} gold</div>
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
          <HUD player={player} floorNumber={floorNumber} themeName={themeName} onOpenBag={openBag} />
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
              return p.shieldCharm > 0 ||
                p.torch > 0 || p.mapScroll > 0 || p.compass > 0 ||
                p.streakSaver > 0 || p.secondChance > 0 || p.dragonBane > 0 ||
                p.luckyCoin > 0 || p.treasureMagnet > 0 || p.metronome > 0 || p.tuningFork > 0;
            })()}
          />
        </div>
      </div>

      {dragonFireActive && (
        <div className="fixed inset-0 z-40 pointer-events-none animate-dragon-fire">
          <div className="absolute inset-0 bg-gradient-to-t from-red-900/80 via-orange-600/50 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex justify-around px-4 text-4xl">
            {Array.from({ length: 7 }, (_, i) => (
              <span key={i} className="animate-fire-rise" style={{ animationDelay: `${i * 0.06}s` }}>
                {'\uD83D\uDD25'}
              </span>
            ))}
          </div>
        </div>
      )}

      {shieldEffectActive && (
        <div className="fixed inset-0 z-[45] pointer-events-none animate-shield-flash">
          <div className="absolute inset-0 shield-radial-bg" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl animate-shield-pop">{'\uD83D\uDEE1\uFE0F'}</span>
          </div>
        </div>
      )}

      {phase === 'challenge' && activeChallenge && (
        <ChallengeModal
          key={challengeKey}
          challengeType={activeChallenge.type}
          tileType={activeTileType}
          floorNumber={floorNumber}
          onResult={handleChallengeResult}
          playerHealth={player.health}
          maxHealth={player.maxHealth}
          shieldCharm={player.shieldCharm}
          potions={player.potions}
          dragonBane={player.buffs.armed.dragonBane > 0}
          slowRhythm={player.buffs.armed.metronome > 0}
          showIntervalHint={player.buffs.armed.tuningFork > 0}
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

      {pendingChestReward && (
        <ChestRewardModal
          reward={pendingChestReward}
          onClose={() => {
            setPendingChestReward(null);
            moveLockedRef.current = false;
          }}
        />
      )}

      <DirectionsModal isOpen={showDirections} onClose={() => setShowDirections(false)} />
    </div>
  );
};

export default MelodyDungeonGame;
