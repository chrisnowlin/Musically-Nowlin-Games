# Melody Dungeon Directions Modal Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a "How to Play" button to the Melody Dungeon menu that opens a comprehensive, scrollable modal explaining all game mechanics, controls, items, buffs, enemies, and strategy.

**Architecture:** Create a new `DirectionsModal` component that displays organized sections of help content in a scrollable container. Update `MelodyDungeonGame` to manage modal visibility state and render the button/modal in the menu phase. Modal uses existing dark theme styling patterns from other modals in the codebase.

**Tech Stack:** React (TypeScript), Tailwind CSS, lucide-react icons, existing modal patterns from `ChallengeModal` and `MerchantModal`

---

### Task 1: Create DirectionsModal Component

**Files:**
- Create: `client/src/components/melody-dungeon/DirectionsModal.tsx`
- Reference: `client/src/components/melody-dungeon/ChallengeModal.tsx` (styling patterns)

**Step 1: Write the component with proper TypeScript interface**

Create the file with this structure:

```typescript
import React from 'react';
import { X } from 'lucide-react';

interface DirectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DirectionsModal: React.FC<DirectionsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col border-2 border-purple-700 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700 shrink-0">
          <h2 className="text-2xl font-bold text-purple-300">How to Play</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1"
            aria-label="Close directions"
          >
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 text-gray-200 text-sm leading-relaxed">
          
          {/* Section 1: Controls */}
          <div>
            <h3 className="text-lg font-bold text-purple-400 mb-2 flex items-center gap-2">
              ⌨️ Controls
            </h3>
            <ul className="space-y-2 text-gray-300">
              <li><strong>Desktop:</strong> Arrow keys or WASD to move around the dungeon</li>
              <li><strong>Mobile:</strong> Use the D-pad on the right side of the screen</li>
              <li><strong>Potion:</strong> Press P or tap the potion button to heal 1 HP</li>
              <li><strong>Inventory:</strong> Press U or tap the bag icon to use items</li>
            </ul>
          </div>

          {/* Section 2: Core Mechanics */}
          <div>
            <h3 className="text-lg font-bold text-purple-400 mb-2 flex items-center gap-2">
              🎮 Core Mechanics
            </h3>
            <ul className="space-y-2 text-gray-300">
              <li><strong>Explore:</strong> Move around each dungeon floor to find items and encounters</li>
              <li><strong>Enemies:</strong> Encounter enemies that challenge you with musical questions. Defeat them to earn keys and score</li>
              <li><strong>Doors:</strong> Locked doors block your path. Answer the musical challenge correctly to open them</li>
              <li><strong>Chests:</strong> Use keys to open chests and get potions and rewards</li>
              <li><strong>Merchants:</strong> Trade your score for helpful items and buffs</li>
              <li><strong>Stairs:</strong> Find the stairs to advance to the next floor</li>
              <li><strong>Health:</strong> You start with 3 HP. Lose all health and it's game over!</li>
            </ul>
          </div>

          {/* Section 3: Items & Inventory */}
          <div>
            <h3 className="text-lg font-bold text-purple-400 mb-2 flex items-center gap-2">
              🎁 Items & Inventory
            </h3>
            <ul className="space-y-2 text-gray-300">
              <li><strong>Keys 🔑:</strong> Collected from defeated enemies. Use them to open locked chests</li>
              <li><strong>Potions 🧪:</strong> Restore 1 HP. Use with P key or from your inventory</li>
              <li><strong>Inventory:</strong> Press U to access your persistent items. Some activate immediately, others work automatically</li>
              <li><strong>Persistent Items:</strong> Items you've collected that stay with you across challenges</li>
            </ul>
          </div>

          {/* Section 4: Persistent Buffs */}
          <div>
            <h3 className="text-lg font-bold text-purple-400 mb-2 flex items-center gap-2">
              ✨ Persistent Buffs (Held Items)
            </h3>
            <div className="space-y-3 text-gray-300 text-xs">
              <div>
                <strong className="text-blue-300">🛡️ Shield Charm:</strong> Absorbs 1 hit that would cost health. Single use
              </div>
              <div>
                <strong className="text-yellow-300">🔦 Torch:</strong> Increases your vision range to see further around you
              </div>
              <div>
                <strong className="text-cyan-300">📜 Map Scroll:</strong> Reveals the entire floor layout immediately
              </div>
              <div>
                <strong className="text-green-300">🧭 Compass:</strong> Shows the staircase location on your minimap
              </div>
              <div>
                <strong className="text-pink-300">⚡ Streak Saver:</strong> Preserve your win streak on wrong answers (single use during challenge)
              </div>
              <div>
                <strong className="text-orange-300">🔄 Second Chance:</strong> Retry a challenge you just failed without penalty
              </div>
              <div>
                <strong className="text-red-300">🐉 Dragon Bane:</strong> Negate the penalty from hitting a dragon. Consumed after use
              </div>
              <div>
                <strong className="text-purple-300">💰 Lucky Coin:</strong> Double your score on an enemy defeat. Consumed after use
              </div>
              <div>
                <strong className="text-indigo-300">🧲 Treasure Magnet:</strong> Double potion rewards from chests. Consumed after use
              </div>
              <div>
                <strong className="text-violet-300">🎼 Metronome:</strong> Slows challenge tempo for easier rhythm recognition
              </div>
              <div>
                <strong className="text-rose-300">🍴 Tuning Fork:</strong> Shows interval hints during musical challenges
              </div>
            </div>
          </div>

          {/* Section 5: Enemy Types */}
          <div>
            <h3 className="text-lg font-bold text-purple-400 mb-2 flex items-center gap-2">
              👹 Enemy Types
            </h3>
            <ul className="space-y-2 text-gray-300">
              <li><strong>Regular Enemies 👻🪦🧌:</strong> Ghosts, Skeletons, and Goblins in levels 1-3. Defeat for keys and score</li>
              <li><strong>Dragons 🐉:</strong> Special enemies with unique mechanics. Harder to defeat but worth more rewards</li>
              <li><strong>Mini-Boss 🏆:</strong> Stronger than regular enemies. Defeating them opens locked areas and grants bonus rewards</li>
              <li><strong>Big-Boss 👑:</strong> The floor's main challenge. Defeat to access the stairs and advance to the next floor</li>
            </ul>
          </div>

          {/* Section 6: Tips & Strategy */}
          <div>
            <h3 className="text-lg font-bold text-purple-400 mb-2 flex items-center gap-2">
              💡 Tips & Strategy
            </h3>
            <ul className="space-y-2 text-gray-300">
              <li>💪 <strong>Manage Health:</strong> Use shields and potions wisely. Don't waste them on easy enemies</li>
              <li>🔑 <strong>Key Management:</strong> Prioritize opening chests that give potions and more keys</li>
              <li>⚔️ <strong>Buff Strategy:</strong> Save powerful buffs for tough encounters (bosses, dragons)</li>
              <li>🔥 <strong>Streak Bonuses:</strong> Every 3 correct answers grants +25 bonus score. Build your streak!</li>
              <li>🎯 <strong>Focus on Music:</strong> The better you answer musical questions, the easier the dungeon becomes</li>
              <li>🔍 <strong>Explore Carefully:</strong> Take your time exploring—every key and potion helps</li>
            </ul>
          </div>

        </div>

        {/* Footer Button */}
        <div className="px-6 py-4 border-t border-gray-700 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2 bg-purple-700 hover:bg-purple-600 rounded-lg font-bold text-white transition-colors"
          >
            Got It! Let's Play
          </button>
        </div>
      </div>
    </div>
  );
};

export default DirectionsModal;
```

**Step 2: Verify the component structure is sound**

Review the code above. Check:
- TypeScript interface is correct
- All sections render with proper hierarchy
- Scrollable container is set up
- Close button and footer button work
- Emoji usage for visual interest

---

### Task 2: Update MelodyDungeonGame to Add Button and State

**Files:**
- Modify: `client/src/components/melody-dungeon/MelodyDungeonGame.tsx` (multiple locations)
- Add import at top
- Add state in component
- Add button in menu phase
- Render modal

**Step 1: Add import at the top of MelodyDungeonGame.tsx**

After the existing imports (around line 1-20), add:

```typescript
import DirectionsModal from './DirectionsModal';
```

Make sure `HelpCircle` is imported from lucide-react (it should already be there based on the file content).

**Step 2: Add state for modal visibility**

Find the `useState` calls in the component (around line 70-85 where other state is declared). Add this new state:

```typescript
const [showDirections, setShowDirections] = useState(false);
```

**Step 3: Add the "How to Play" button in the menu phase**

Find the menu JSX section (search for `if (phase === 'menu')` around line 1040). Inside that return statement, find the button that says "Let's Play!". After that closing `</Button>` tag, add this new button:

```typescript
          <button
            onClick={() => setShowDirections(true)}
            className="py-2 px-4 text-purple-600 dark:text-purple-300 hover:text-purple-700 font-semibold transition-colors flex items-center justify-center gap-2 mx-auto"
            data-testid="button-directions"
          >
            <HelpCircle size={20} />
            How to Play
          </button>
```

**Step 4: Render the DirectionsModal**

At the very end of the component JSX (before the final closing `</div>` of the playing phase, or after the final closing tag), add:

```typescript
      <DirectionsModal isOpen={showDirections} onClose={() => setShowDirections(false)} />
```

This should be placed so that it renders whenever the component renders, allowing the modal to overlay from any phase.

---

### Task 3: Verify the Implementation Works

**Files:**
- Test: Visual inspection in browser
- No automated tests needed for this modal (content is static)

**Step 1: Start the dev server**

```bash
cd /Users/cnowlin/Developer/Musically-Nowlin-Games
npm run dev
```

Expected: Dev server starts, no errors in terminal

**Step 2: Navigate to Melody Dungeon**

Open browser to the game (likely `http://localhost:5173`), navigate to Melody Dungeon.

Expected: Menu appears with "Enter the Dungeon" button

**Step 3: Verify "How to Play" button is visible**

Look for the "How to Play" button with a help icon below the "Enter the Dungeon" button.

Expected: Button is visible and has proper styling

**Step 4: Click "How to Play" button**

Click the button on the menu.

Expected: Modal opens, shows all content sections, scrollable, close button works

**Step 5: Test close functionality**

Try closing the modal:
- Click the X button in top right
- Click "Got It! Let's Play" button

Expected: Modal closes both ways, returns to menu

**Step 6: Test on mobile viewport**

Resize browser to mobile size or use DevTools device emulation.

Expected: Modal scrolls properly on mobile, button is accessible

---

### Task 4: Commit the Changes

**Files:**
- `client/src/components/melody-dungeon/DirectionsModal.tsx` (new)
- `client/src/components/melody-dungeon/MelodyDungeonGame.tsx` (modified)

**Step 1: Stage the files**

```bash
git add client/src/components/melody-dungeon/DirectionsModal.tsx client/src/components/melody-dungeon/MelodyDungeonGame.tsx
```

**Step 2: Commit with descriptive message**

```bash
git commit -m "feat: add comprehensive help modal to Melody Dungeon menu

- Create DirectionsModal component with scrollable content
- Add Controls, Mechanics, Items, Buffs, Enemies, Tips sections
- Wire up 'How to Play' button in menu that opens/closes modal
- Dark theme styling matches existing dungeon modals
- Responsive design works on mobile and desktop"
```

Expected: Commit succeeds with clear message

---

## Execution Summary

This plan has 4 tasks:
1. **DirectionsModal.tsx** — New component with all help content
2. **Update MelodyDungeonGame.tsx** — Add state, button, modal rendering
3. **Manual testing** — Verify button, modal, closing work
4. **Commit** — Save with clear commit message
