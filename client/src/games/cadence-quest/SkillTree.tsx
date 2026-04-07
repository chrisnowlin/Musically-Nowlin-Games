import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { SKILL_TREE } from './logic/skill-tree-data';
import type { Character } from '@shared/types/cadence-quest';
import { cn } from '@/common/utils/utils';

interface SkillTreeProps {
  character: Character;
  onBack: () => void;
}

const SkillTree: React.FC<SkillTreeProps> = ({ character, onBack }) => {
  const isUnlocked = (nodeId: string) => {
    const [branch, tierStr] = nodeId.split('-');
    const tier = parseInt(tierStr, 10);
    const branchNodes = character.stats.skillTree[branch as keyof typeof character.stats.skillTree];
    if (!branchNodes) return false;
    return branchNodes.includes(tier);
  };

  const hasParent = (node: (typeof SKILL_TREE)[0]) =>
    node.requires.length === 0 || node.requires.some((r) => {
      const n = SKILL_TREE.find((x) => x.id === r);
      return n && isUnlocked(n.id);
    });

  return (
    <div className="flex flex-col gap-4 p-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 rounded-lg text-purple-800 hover:bg-purple-200/60 hover:text-purple-900"
        >
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-2xl font-bold text-purple-900 drop-shadow-sm">Skill Tree</h2>
      </div>
      <p className="text-purple-800 text-sm">
        Skill Points: {character.stats.skillPoints}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SKILL_TREE.map((node) => {
          const unlocked = isUnlocked(node.id);
          const canUnlock = hasParent(node) && character.stats.skillPoints > 0 && !unlocked;
          return (
            <div
              key={node.id}
              className={cn(
                'p-4 rounded-xl border',
                unlocked
                  ? 'bg-green-900/30 border-green-500/50'
                  : canUnlock
                    ? 'bg-purple-900/30 border-purple-500/30'
                    : 'bg-gray-800/60 border-gray-600'
              )}
            >
              <h3 className="font-bold text-white">{node.name}</h3>
              <p className="text-xs text-gray-200 mt-1">{node.description}</p>
              {unlocked && (
                <span className="inline-block mt-2 text-xs text-green-400">Unlocked</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SkillTree;
