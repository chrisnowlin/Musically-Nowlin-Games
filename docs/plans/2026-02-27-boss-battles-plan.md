# Boss Battle System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add mini boss (every 5 floors) and big boss (every 10 floors) encounters in dedicated arena rooms that block progression to the next floor.

**Architecture:** Two new TileTypes (MiniBoss, BigBoss) placed on the stairs position during dungeon generation on boss floors. Boss floors skip all enemy/dragon spawning. The existing BossBattle component is extended with configurable HP, item usage between rounds, and a pre-generated question sequence for big bosses that previews the next difficulty tier. On victory, the boss tile becomes Stairs and the floor-complete phase triggers.

**Tech Stack:** React, TypeScript, Tailwind CSS, Vitest

---

### Task 1: Add TileTypes and getBossType helper

**Files:**
- Modify: `client/src/lib/gameLogic/dungeonTypes.ts`
- Modify: `client/src/lib/gameLogic/dungeonGenerator.ts`
- Modify: `client/src/lib/gameLogic/__tests__/dungeonGenerator.test.ts`

**Step 1: Write the failing test**

Add to `client/src/lib/gameLogic/__tests__/dungeonGenerator.test.ts`:

```typescript
import { getBossType } from '../dungeonGenerator';

describe('getBossType', () => {
  it('returns null for non-boss floors', () => {
    expect(getBossType(1)).toBeNull();
    expect(getBossType(3)).toBeNull();
    expect(getBossType(7)).toBeNull();
    expect(getBossType(99)).toBeNull();
  });

  it('returns mini for floors divisible by 5 but not 10', () => {
    expect(getBossType(5)).toBe('mini');
    expect(getBossType(15)).toBe('mini');
    expect(getBossType(25)).toBe('mini');
    expect(getBossType(95)).toBe('mini');
  });

  it('returns big for floors divisible by 10', () => {
    expect(getBossType(10)).toBe('big');
    expect(getBossType(20)).toBe('big');
    expect(getBossType(50)).toBe('big');
    expect(getBossType(100)).toBe('big');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd client && npx vitest run src/lib/gameLogic/__tests__/dungeonGenerator.test.ts`
Expected: FAIL — `getBossType` is not exported from `../dungeonGenerator`

**Step 3: Add TileTypes and implement getBossType**

In `client/src/lib/gameLogic/dungeonTypes.ts`, add to the `TileType` enum:

```typescript
export enum TileType {
  Wall = 'wall',
  Floor = 'floor',
  Door = 'door',
  Enemy = 'enemy',
  Treasure = 'treasure',
  Chest = 'chest',
  Stairs = 'stairs',
  PlayerStart = 'playerStart',
  Dragon = 'dragon',
  Merchant = 'merchant',
  MerchantStall = 'merchantStall',
  MiniBoss = 'miniBoss',
  BigBoss = 'bigBoss',
}
```

In `client/src/lib/gameLogic/dungeonGenerator.ts`, add and export:

```typescript
export function getBossType(floorNumber: number): 'big' | 'mini' | null {
  if (floorNumber % 10 === 0) return 'big';
  if (floorNumber % 5 === 0) return 'mini';
  return null;
}
```

**Step 4: Run test to verify it passes**

Run: `cd client && npx vitest run src/lib/gameLogic/__tests__/dungeonGenerator.test.ts`
Expected: All tests PASS

**Step 5: Commit**

```bash
git add client/src/lib/gameLogic/dungeonTypes.ts client/src/lib/gameLogic/dungeonGenerator.ts client/src/lib/gameLogic/__tests__/dungeonGenerator.test.ts
git commit -m "feat: add MiniBoss/BigBoss TileTypes and getBossType helper"
```

---

### Task 2: Boss challenge configuration helpers

**Files:**
- Modify: `client/src/components/melody-dungeon/ChallengeModal.tsx`
- Modify: `client/src/lib/gameLogic/__tests__/dungeonGenerator.test.ts`

**Context:** `ChallengeModal.tsx` already has a local `getChallengeTypesForFloor()` function (lines 58-62). The boss challenge config helpers go next to it.

**Step 1: Write the failing test**

Add to `client/src/lib/gameLogic/__tests__/dungeonGenerator.test.ts`:

```typescript
import { getBossChallengeConfig } from '../../components/melody-dungeon/challengeHelpers';

describe('getBossChallengeConfig', () => {
  it('previews rhythmTap when only noteReading is available', () => {
    const config = getBossChallengeConfig(10); // Floor 10: noteReading + rhythmTap current
    // Floor 10 already has rhythmTap, so should preview interval
    expect(config.previewTypes).toContain('interval');
  });

  it('previews interval for floor 10 big boss', () => {
    const config = getBossChallengeConfig(10);
    expect(config.standardTypes).toEqual(['noteReading', 'rhythmTap']);
    expect(config.previewTypes).toEqual(['interval']);
    expect(config.previewDifficulty).toBe('easy');
  });

  it('uses hard difficulty when all types are unlocked', () => {
    const config = getBossChallengeConfig(20);
    expect(config.standardTypes).toEqual(['noteReading', 'rhythmTap', 'interval']);
    expect(config.previewTypes).toEqual(['noteReading', 'rhythmTap', 'interval']);
    expect(config.previewDifficulty).toBe('hard');
  });

  it('previews rhythmTap for very early boss', () => {
    // Hypothetical floor 5 type scenario — floor 5 only has noteReading
    // But floor 5 is a mini boss not big boss, so this tests the function directly
    const config = getBossChallengeConfig(5);
    expect(config.standardTypes).toEqual(['noteReading']);
    expect(config.previewTypes).toEqual(['rhythmTap']);
    expect(config.previewDifficulty).toBe('easy');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd client && npx vitest run src/lib/gameLogic/__tests__/dungeonGenerator.test.ts`
Expected: FAIL — module not found

**Step 3: Create challengeHelpers.ts**

Create `client/src/components/melody-dungeon/challengeHelpers.ts`:

```typescript
import type { ChallengeType, DifficultyLevel } from '@/lib/gameLogic/dungeonTypes';

export function getChallengeTypesForFloor(floorNumber: number): ChallengeType[] {
  if (floorNumber <= 5) return ['noteReading'];
  if (floorNumber <= 10) return ['noteReading', 'rhythmTap'];
  return ['noteReading', 'rhythmTap', 'interval'];
}

export function getBossChallengeConfig(floorNumber: number): {
  standardTypes: ChallengeType[];
  previewTypes: ChallengeType[];
  previewDifficulty: DifficultyLevel;
} {
  const currentTypes = getChallengeTypesForFloor(floorNumber);

  if (!currentTypes.includes('rhythmTap')) {
    return {
      standardTypes: currentTypes,
      previewTypes: ['rhythmTap'],
      previewDifficulty: 'easy',
    };
  }
  if (!currentTypes.includes('interval')) {
    return {
      standardTypes: currentTypes,
      previewTypes: ['interval'],
      previewDifficulty: 'easy',
    };
  }

  return {
    standardTypes: currentTypes,
    previewTypes: currentTypes,
    previewDifficulty: 'hard',
  };
}

export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Shuffle array in place using Fisher-Yates. */
export function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export interface BossRoundConfig {
  type: ChallengeType;
  difficulty: DifficultyLevel;
}

/**
 * Generate the question sequence for a big boss battle.
 * 6 standard questions + 2 preview questions, shuffled.
 */
export function generateBigBossSequence(
  floorNumber: number,
  playerDifficulty: DifficultyLevel
): BossRoundConfig[] {
  const config = getBossChallengeConfig(floorNumber);
  const sequence: BossRoundConfig[] = [];

  for (let i = 0; i < 6; i++) {
    sequence.push({
      type: pickRandom(config.standardTypes),
      difficulty: playerDifficulty,
    });
  }

  for (let i = 0; i < 2; i++) {
    sequence.push({
      type: pickRandom(config.previewTypes),
      difficulty: config.previewDifficulty,
    });
  }

  return shuffle(sequence);
}
```

Also update `ChallengeModal.tsx` to import from the new shared file instead of having its own copy of `getChallengeTypesForFloor` and `pickRandom`:

Replace lines 54-62 in ChallengeModal.tsx with:
```typescript
import { getChallengeTypesForFloor, pickRandom } from './challengeHelpers';
```

Remove the local `pickRandom` and `getChallengeTypesForFloor` definitions.

**Step 4: Run test to verify it passes**

Run: `cd client && npx vitest run src/lib/gameLogic/__tests__/dungeonGenerator.test.ts`
Expected: All tests PASS

**Step 5: Commit**

```bash
git add client/src/components/melody-dungeon/challengeHelpers.ts client/src/components/melody-dungeon/ChallengeModal.tsx client/src/lib/gameLogic/__tests__/dungeonGenerator.test.ts
git commit -m "feat: add boss challenge config helpers and shared challengeHelpers module"
```

---

### Task 3: Boss floor dungeon generation

**Files:**
- Modify: `client/src/lib/gameLogic/dungeonGenerator.ts`
- Modify: `client/src/lib/gameLogic/__tests__/dungeonGenerator.test.ts`

**Context:** `generateDungeon()` (line 299 of dungeonGenerator.ts) needs to detect boss floors, skip enemy/dragon placement, ensure the last room is large, and place the boss tile on the stairs position.

**Step 1: Write the failing test**

Add to `client/src/lib/gameLogic/__tests__/dungeonGenerator.test.ts`:

```typescript
describe('boss floor generation', () => {
  it('places a MiniBoss tile on floor 5', () => {
    const floor = generateDungeon(5);
    const miniBosses = findTiles(floor, TileType.MiniBoss);
    expect(miniBosses.length).toBe(1);
    // Boss replaces stairs position
    expect(miniBosses[0].pos).toEqual(floor.stairsPosition);
  });

  it('places a BigBoss tile on floor 10', () => {
    const floor = generateDungeon(10);
    const bigBosses = findTiles(floor, TileType.BigBoss);
    expect(bigBosses.length).toBe(1);
    expect(bigBosses[0].pos).toEqual(floor.stairsPosition);
  });

  it('has no enemies or dragons on boss floors', () => {
    const floor5 = generateDungeon(5);
    const floor10 = generateDungeon(10);
    expect(findTiles(floor5, TileType.Enemy).length).toBe(0);
    expect(findTiles(floor5, TileType.Dragon).length).toBe(0);
    expect(findTiles(floor10, TileType.Enemy).length).toBe(0);
    expect(findTiles(floor10, TileType.Dragon).length).toBe(0);
  });

  it('has no Stairs tile visible on boss floors (boss replaces it)', () => {
    const floor = generateDungeon(5);
    expect(findTiles(floor, TileType.Stairs).length).toBe(0);
  });

  it('does not generate boss tiles on non-boss floors', () => {
    const floor = generateDungeon(3);
    expect(findTiles(floor, TileType.MiniBoss).length).toBe(0);
    expect(findTiles(floor, TileType.BigBoss).length).toBe(0);
    // Should have stairs
    expect(findTiles(floor, TileType.Stairs).length).toBe(1);
  });
});
```

Also add `TileType.MiniBoss` and `TileType.BigBoss` to the import at the top of the test file if not already present.

**Step 2: Run test to verify it fails**

Run: `cd client && npx vitest run src/lib/gameLogic/__tests__/dungeonGenerator.test.ts`
Expected: FAIL — boss tiles not generated

**Step 3: Modify generateDungeon**

In `client/src/lib/gameLogic/dungeonGenerator.ts`, modify `generateDungeon()`:

After the rooms are generated and corridors carved (after line 348 where stairs are placed), add boss floor logic. The key changes:

1. After room generation, if boss floor, enforce last room is at least 5×5 (re-generate it if needed by widening)
2. After placing stairs, if boss floor, replace the stairs tile with the boss tile type
3. Wrap the enemy/dragon placement section in a `if (!bossType)` guard

```typescript
export function generateDungeon(floorNumber: number): DungeonFloor {
  const { width, height } = getDungeonSize(floorNumber);
  const grid = createEmptyGrid(width, height);
  const bossType = getBossType(floorNumber);

  // Scale room count and max room size with dungeon size
  const growth = width - DUNGEON_BASE_SIZE;
  const roomCount = rand(3, 5 + Math.floor(growth / 2));
  const maxRoomDim = Math.min(5 + Math.floor(growth / 3), 7);
  const rooms: Rect[] = [];
  const maxAttempts = 100;

  for (let i = 0; i < roomCount; i++) {
    let placed = false;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const w = rand(3, maxRoomDim);
      const h = rand(3, maxRoomDim);
      const x = rand(1, width - w - 1);
      const y = rand(1, height - h - 1);
      const room: Rect = { x, y, w, h };

      if (!rooms.some((r) => roomsOverlap(r, room))) {
        rooms.push(room);
        carveRoom(grid, room);
        placed = true;
        break;
      }
    }
    if (!placed && rooms.length < 2) {
      const w = 3;
      const h = 3;
      const x = rand(1, width - w - 1);
      const y = rand(1, height - h - 1);
      rooms.push({ x, y, w, h });
      carveRoom(grid, { x, y, w, h });
    }
  }

  // On boss floors, expand the last room to at least 5×5 for the arena.
  if (bossType && rooms.length > 0) {
    const lastRoom = rooms[rooms.length - 1];
    const targetSize = Math.min(7, Math.max(lastRoom.w, 5));
    if (lastRoom.w < targetSize || lastRoom.h < targetSize) {
      const newW = Math.min(targetSize, width - lastRoom.x - 1);
      const newH = Math.min(targetSize, height - lastRoom.y - 1);
      lastRoom.w = Math.max(lastRoom.w, newW);
      lastRoom.h = Math.max(lastRoom.h, newH);
      carveRoom(grid, lastRoom);
    }
  }

  // Connect rooms with corridors
  for (let i = 1; i < rooms.length; i++) {
    carveCorridor(grid, roomCenter(rooms[i - 1]), roomCenter(rooms[i]));
  }

  // Place player start in first room
  const playerStart = roomCenter(rooms[0]);
  grid[playerStart.y][playerStart.x].type = TileType.PlayerStart;

  // Place stairs in last room, far from player
  const stairsPosition = roomCenter(rooms[rooms.length - 1]);

  // On boss floors: place boss on stairs position; on normal floors: place stairs
  if (bossType) {
    const bossTileType = bossType === 'big' ? TileType.BigBoss : TileType.MiniBoss;
    grid[stairsPosition.y][stairsPosition.x].type = bossTileType;
    grid[stairsPosition.y][stairsPosition.x].cleared = false;
  } else {
    grid[stairsPosition.y][stairsPosition.x].type = TileType.Stairs;
  }

  const placedPositions = [playerStart, stairsPosition];
  const challengeTypes = getChallengeTypesForFloor(floorNumber);

  // --- Skip enemies/dragons on boss floors ---
  if (!bossType) {
    // Place locked chests first so dragons can spawn adjacent to them.
    // ... (existing chest, dragon, enemy placement code — unchanged)
  }

  // Place doors, merchants, and treasure on ALL floors (including boss floors)
  // ... (existing door, merchant, treasure placement — unchanged)

  return {
    tiles: grid,
    width,
    height,
    floorNumber,
    themeIndex: rand(0, 7),
    playerStart,
    stairsPosition,
  };
}
```

**Important:** Only the chest, dragon, and enemy placement is wrapped in the `if (!bossType)` guard. Doors, merchants, and treasures still spawn on boss floors for resource gathering.

**Step 4: Run test to verify it passes**

Run: `cd client && npx vitest run src/lib/gameLogic/__tests__/dungeonGenerator.test.ts`
Expected: All tests PASS

**Step 5: Commit**

```bash
git add client/src/lib/gameLogic/dungeonGenerator.ts client/src/lib/gameLogic/__tests__/dungeonGenerator.test.ts
git commit -m "feat: generate boss arena rooms on boss floors with no regular enemies"
```

---

### Task 4: Sprites, themes, and renderer

**Files:**
- Modify: `client/src/components/melody-dungeon/DungeonGrid.tsx`
- Modify: `client/src/components/melody-dungeon/ChallengeModal.tsx`
- Create placeholder sprites (copy existing boss sprite)

**Step 1: Create placeholder boss sprite images**

```bash
cp client/public/images/melody-dungeon-boss.png client/public/images/melody-dungeon-miniboss.png
cp client/public/images/melody-dungeon-boss.png client/public/images/melody-dungeon-bigboss.png
```

These are placeholders. Replace with unique art later.

**Step 2: Update DungeonGrid TILE_SPRITE and rendering**

In `client/src/components/melody-dungeon/DungeonGrid.tsx`:

Add to the `TILE_SPRITE` record (around line 37):
```typescript
const TILE_SPRITE: Partial<Record<TileType, string>> = {
  [TileType.Door]: '/images/melody-dungeon-door.png',
  [TileType.Enemy]: '/images/melody-dungeon-enemy.png',
  [TileType.Treasure]: '/images/melody-dungeon-treasure.png',
  [TileType.Chest]: '/images/melody-dungeon-chest.png',
  [TileType.Stairs]: '/images/melody-dungeon-stairs.png',
  [TileType.Dragon]: '/images/melody-dungeon-boss.png',
  [TileType.Merchant]: '/images/melody-dungeon-merchant.png',
  [TileType.MerchantStall]: '/images/melody-dungeon-stall.png',
  [TileType.MiniBoss]: '/images/melody-dungeon-miniboss.png',
  [TileType.BigBoss]: '/images/melody-dungeon-bigboss.png',
};
```

Update the `isEnemy` check (around line 112) to include bosses:
```typescript
const isEnemy =
  tile.type === TileType.Enemy ||
  tile.type === TileType.Dragon ||
  tile.type === TileType.MiniBoss ||
  tile.type === TileType.BigBoss;
```

**Step 3: Update ChallengeModal TILE_THEME**

In `client/src/components/melody-dungeon/ChallengeModal.tsx`, add to `TILE_THEME` (around line 25):

```typescript
[TileType.MiniBoss]: {
  title: 'Mini Boss!',
  borderColor: 'border-orange-500',
  bgColor: 'from-orange-950/90 to-gray-900/95',
},
[TileType.BigBoss]: {
  title: 'BOSS BATTLE!',
  borderColor: 'border-rose-500',
  bgColor: 'from-rose-950/90 to-gray-900/95',
},
```

**Step 4: Run the app to verify sprites render**

Run: `cd client && npm run dev`
Navigate to floor 5 in the game and verify the mini boss sprite appears. This is a visual check.

**Step 5: Commit**

```bash
git add client/public/images/melody-dungeon-miniboss.png client/public/images/melody-dungeon-bigboss.png client/src/components/melody-dungeon/DungeonGrid.tsx client/src/components/melody-dungeon/ChallengeModal.tsx
git commit -m "feat: add boss sprites, renderer entries, and challenge modal themes"
```

---

### Task 5: BossBattle component with configurable HP and item usage

**Files:**
- Modify: `client/src/components/melody-dungeon/ChallengeModal.tsx`

**Context:** The existing `BossBattle` component (line 80-196) handles Dragon fights with fixed 3 HP. This task extends it for all boss types with configurable HP, item usage between rounds, and big boss preview sequences.

**Step 1: Update BossBattleMeta interface**

```typescript
export interface BossBattleMeta {
  damageDealt: number;
  shieldUsed: boolean;
  potionsUsed: number;
}
```

**Step 2: Update ChallengeModal Props to accept potions**

```typescript
interface Props {
  challengeType: ChallengeType;
  tileType: TileType;
  difficulty: DifficultyLevel;
  floorNumber: number;
  onResult: (correct: boolean, meta?: BossBattleMeta) => void;
  playerHealth?: number;
  shieldCharm?: number;
  potions?: number;
}
```

**Step 3: Update ChallengeModal to detect all boss types**

Replace `isDragon` logic (line 200) with:

```typescript
const isBoss = tileType === TileType.Dragon || tileType === TileType.MiniBoss || tileType === TileType.BigBoss;
```

And update the JSX conditional:

```typescript
{isBoss ? (
  <BossBattle
    tileType={tileType}
    difficulty={difficulty}
    floorNumber={floorNumber}
    onResult={onResult}
    playerHealth={playerHealth}
    shieldCharm={shieldCharm}
    potions={potions}
  />
) : (
  <ChallengeRenderer type={challengeType} difficulty={difficulty} floorNumber={floorNumber} onResult={onResult} />
)}
```

**Step 4: Rewrite BossBattle component**

Replace the entire BossBattle component with this enhanced version:

```typescript
const BOSS_HP = 3;
const MINI_BOSS_HP = 5;
const BIG_BOSS_HP = 8;

function getBossHp(tileType: TileType): number {
  if (tileType === TileType.BigBoss) return BIG_BOSS_HP;
  if (tileType === TileType.MiniBoss) return MINI_BOSS_HP;
  return BOSS_HP;
}

function getBossLabel(tileType: TileType): string {
  if (tileType === TileType.BigBoss) return 'Boss';
  if (tileType === TileType.MiniBoss) return 'Mini Boss';
  return 'Dragon';
}

const BossBattle: React.FC<{
  tileType: TileType;
  difficulty: DifficultyLevel;
  floorNumber: number;
  onResult: (correct: boolean, meta?: BossBattleMeta) => void;
  playerHealth: number;
  shieldCharm: number;
  potions: number;
}> = ({ tileType, difficulty, floorNumber, onResult, playerHealth, shieldCharm, potions }) => {
  const maxBossHp = getBossHp(tileType);
  const bossLabel = getBossLabel(tileType);
  const challengeTypes = useMemo(() => getChallengeTypesForFloor(floorNumber), [floorNumber]);

  // Pre-generate big boss question sequence
  const bigBossSequence = useMemo(() => {
    if (tileType !== TileType.BigBoss) return null;
    return generateBigBossSequence(floorNumber, difficulty);
  }, [tileType, floorNumber, difficulty]);

  const [currentRound, setCurrentRound] = useState(0);
  const [bossHp, setBossHp] = useState(maxBossHp);
  const [effectiveHealth, setEffectiveHealth] = useState(playerHealth);
  const [shieldActive, setShieldActive] = useState(shieldCharm > 0);
  const [damageDealt, setDamageDealt] = useState(0);
  const [shieldUsed, setShieldUsed] = useState(false);
  const [potionsRemaining, setPotionsRemaining] = useState(potions);
  const [potionsUsed, setPotionsUsed] = useState(0);
  const [roundTransition, setRoundTransition] = useState(false);
  const [lastResult, setLastResult] = useState<boolean | null>(null);
  const [showItemPhase, setShowItemPhase] = useState(false);

  // Determine challenge for current round
  const currentChallenge = useMemo(() => {
    if (bigBossSequence) {
      return bigBossSequence[currentRound % bigBossSequence.length];
    }
    return {
      type: pickRandom(challengeTypes),
      difficulty,
    };
  }, [bigBossSequence, challengeTypes, currentRound, difficulty]);

  const handleUsePotion = useCallback(() => {
    if (potionsRemaining <= 0 || effectiveHealth >= playerHealth) return;
    setPotionsRemaining((p) => p - 1);
    setPotionsUsed((u) => u + 1);
    setEffectiveHealth((h) => Math.min(playerHealth, h + 1));
  }, [potionsRemaining, effectiveHealth, playerHealth]);

  const proceedToNextRound = useCallback(() => {
    setShowItemPhase(false);
    setCurrentRound((r) => r + 1);
    setLastResult(null);
    setRoundTransition(false);
  }, []);

  const handleRoundResult = useCallback((correct: boolean) => {
    setLastResult(correct);

    if (correct) {
      const newBossHp = bossHp - 1;
      setBossHp(newBossHp);
      if (newBossHp <= 0) {
        setTimeout(() => onResult(true, { damageDealt, shieldUsed, potionsUsed }), 1200);
      } else {
        setRoundTransition(true);
        setTimeout(() => setShowItemPhase(true), 1200);
      }
    } else {
      let newHealth = effectiveHealth;
      let newShieldUsed = shieldUsed;
      if (shieldActive) {
        setShieldActive(false);
        newShieldUsed = true;
        setShieldUsed(true);
      } else {
        newHealth = effectiveHealth - 1;
        setEffectiveHealth(newHealth);
        setDamageDealt((d) => d + 1);
      }

      if (newHealth <= 0) {
        setTimeout(
          () => onResult(false, { damageDealt: damageDealt + 1, shieldUsed: newShieldUsed, potionsUsed }),
          1200
        );
      } else {
        setRoundTransition(true);
        setTimeout(() => setShowItemPhase(true), 1200);
      }
    }
  }, [bossHp, effectiveHealth, shieldActive, damageDealt, shieldUsed, potionsUsed, onResult]);

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Health bars */}
      <div className="w-full max-w-[200px] space-y-2">
        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>{bossLabel} HP</span>
            <span>{bossHp}/{maxBossHp}</span>
          </div>
          <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-red-500 transition-all duration-500"
              style={{ width: `${(bossHp / maxBossHp) * 100}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Your HP{shieldActive ? ' (shielded)' : ''}</span>
            <span>{effectiveHealth}/{playerHealth}</span>
          </div>
          <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-600 to-emerald-400 transition-all duration-500"
              style={{ width: `${(effectiveHealth / playerHealth) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Challenge or transition */}
      {showItemPhase ? (
        <div className="py-6 text-center space-y-3">
          <p className={`text-2xl font-bold ${lastResult ? 'text-green-400' : 'text-red-400'}`}>
            {lastResult ? 'Hit!' : shieldUsed && shieldActive === false ? 'Blocked!' : 'Miss! -1 HP'}
          </p>
          <div className="flex items-center justify-center gap-2">
            {potionsRemaining > 0 && effectiveHealth < playerHealth && (
              <button
                onClick={handleUsePotion}
                className="px-3 py-1.5 bg-pink-700 hover:bg-pink-600 rounded-lg text-sm font-medium transition-colors"
              >
                Use Potion ({potionsRemaining})
              </button>
            )}
            <button
              onClick={proceedToNextRound}
              className="px-4 py-1.5 bg-indigo-700 hover:bg-indigo-600 rounded-lg text-sm font-medium transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      ) : !roundTransition ? (
        <ChallengeRenderer
          key={currentRound}
          type={currentChallenge.type}
          difficulty={currentChallenge.difficulty}
          floorNumber={floorNumber}
          onResult={handleRoundResult}
        />
      ) : (
        <div className="py-8 text-center">
          <p className={`text-2xl font-bold ${lastResult ? 'text-green-400' : 'text-red-400'}`}>
            {lastResult ? 'Hit!' : 'Miss! -1 HP'}
          </p>
          <p className="text-sm text-gray-400 mt-1">Preparing...</p>
        </div>
      )}
    </div>
  );
};
```

Also add the imports at the top of `ChallengeModal.tsx`:
```typescript
import { getChallengeTypesForFloor, pickRandom, generateBigBossSequence } from './challengeHelpers';
```

And update the `ChallengeRenderer` to accept a per-round `difficulty` prop (it already does — just ensure it's passed through).

**Step 5: Verify the build compiles**

Run: `cd client && npx tsc --noEmit`
Expected: No type errors

**Step 6: Commit**

```bash
git add client/src/components/melody-dungeon/ChallengeModal.tsx
git commit -m "feat: extend BossBattle with configurable HP, item usage, and big boss preview sequences"
```

---

### Task 6: Game state integration

**Files:**
- Modify: `client/src/components/melody-dungeon/MelodyDungeonGame.tsx`

**Context:** `handleMove` (line 203) handles tile interactions. `handleChallengeResult` (line 295) applies rewards. Both need MiniBoss/BigBoss support.

**Step 1: Update encounter detection in handleMove**

In the encounter check (around line 258), add MiniBoss and BigBoss:

```typescript
if (
  !tile.cleared &&
  (tile.type === TileType.Enemy ||
    tile.type === TileType.Dragon ||
    tile.type === TileType.Treasure ||
    tile.type === TileType.MiniBoss ||
    tile.type === TileType.BigBoss)
) {
  setFloor((f) => updateVisibility(f, newPos));
  moveLockedRef.current = true;
  const challengeType: ChallengeType = tile.challengeType || 'noteReading';
  setActiveChallenge({ type: challengeType, tilePosition: newPos });
  setActiveTileType(tile.type);
  setPhase('challenge');
  return { ...prev, position: newPos };
}
```

**Step 2: Update handleChallengeResult for boss rewards**

Replace the current `isDragon` logic with a unified boss handler:

```typescript
const handleChallengeResult = useCallback(
  (correct: boolean, meta?: BossBattleMeta) => {
    const newDiffState = recordResult(diffState, correct);
    setDiffState(newDiffState);

    if (!activeChallenge) return;

    const isBoss =
      activeTileType === TileType.Dragon ||
      activeTileType === TileType.MiniBoss ||
      activeTileType === TileType.BigBoss;

    setPlayer((prev) => {
      let updated = { ...prev };

      if (isBoss && meta) {
        if (meta.shieldUsed) {
          updated.shieldCharm = 0;
        }
        updated.potions = prev.potions - (meta.potionsUsed || 0);

        if (correct) {
          const streakBonus = Math.floor(prev.streak / 3) * 25;
          updated.streak += 1;

          if (activeTileType === TileType.BigBoss) {
            updated.health = prev.maxHealth; // full restore
            updated.score += 1500 + streakBonus;
            updated.keys += 3;
            updated.potions += 2;
          } else if (activeTileType === TileType.MiniBoss) {
            updated.health = Math.max(1, Math.min(prev.maxHealth, prev.health - meta.damageDealt + (meta.potionsUsed || 0)));
            updated.score += 750 + streakBonus;
            updated.keys += 2;
            updated.potions += 2;
          } else {
            // Dragon
            updated.health = Math.max(1, Math.min(prev.maxHealth, prev.health - meta.damageDealt + (meta.potionsUsed || 0)));
            updated.score += 500 + streakBonus;
            updated.keys += 2;
            updated.potions += 1;
          }
        } else {
          updated.health = Math.max(0, prev.health - meta.damageDealt + (meta.potionsUsed || 0));
          updated.streak = 0;
        }
      } else if (correct) {
        // Non-boss correct answer (unchanged)
        const streakBonus = Math.floor(prev.streak / 3) * 25;
        updated.score += 100 + streakBonus;
        updated.streak += 1;
        if (activeTileType === TileType.Enemy) updated.keys += 1;
        if (activeTileType === TileType.Treasure) updated.potions += 1;
      } else {
        // Non-boss wrong answer (unchanged)
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
      } else if (isBoss && correct && (activeTileType === TileType.MiniBoss || activeTileType === TileType.BigBoss)) {
        setPhase('floorComplete');
      } else {
        setPhase('playing');
      }
      return prev;
    });
  },
  [diffState, activeChallenge, activeTileType]
);
```

**Step 3: Pass potions to ChallengeModal**

In the JSX where ChallengeModal is rendered (around line 673), add the `potions` prop:

```typescript
{phase === 'challenge' && activeChallenge && (
  <ChallengeModal
    challengeType={activeChallenge.type}
    tileType={activeTileType}
    difficulty={difficulty}
    floorNumber={floorNumber}
    onResult={handleChallengeResult}
    playerHealth={player.health}
    shieldCharm={player.shieldCharm}
    potions={player.potions}
  />
)}
```

**Step 4: Verify the build compiles**

Run: `cd client && npx tsc --noEmit`
Expected: No type errors

**Step 5: Manual test**

Run: `cd client && npm run dev`
Start a game from floor 4, play to floor 5. Verify:
1. Floor 5 has no enemies/dragons
2. Boss room is visible with mini boss sprite
3. Walking into the mini boss triggers a boss battle with 5 HP
4. Item usage (potions) works between rounds
5. On victory: boss tile becomes stairs, floor-complete triggers
6. Rewards applied correctly

**Step 6: Commit**

```bash
git add client/src/components/melody-dungeon/MelodyDungeonGame.tsx
git commit -m "feat: integrate boss encounters into game state with rewards and floor completion"
```
