import React from 'react';
import { ChevronLeft } from 'lucide-react';
import type { Character } from '@shared/types/cadence-quest';

interface CollectionScreenProps {
  character: Character;
  onBack: () => void;
}

const CollectionScreen: React.FC<CollectionScreenProps> = ({ character, onBack }) => {
  return (
    <div className="flex flex-col gap-4 p-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 rounded-lg text-purple-800 hover:bg-purple-200/60 hover:text-purple-900">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-2xl font-bold text-purple-900 drop-shadow-sm">Collection</h2>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-gray-800/80 border border-gray-600">
          <h3 className="font-bold text-amber-200">Instruments</h3>
          {character.ownedInstruments.length === 0 ? (
            <p className="text-sm text-gray-200 mt-2">None yet. Defeat enemies to earn instruments!</p>
          ) : (
            <ul className="mt-2 space-y-1">
              {character.ownedInstruments.map((id) => (
                <li key={id} className="text-sm text-gray-200">
                  {id}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="p-4 rounded-xl bg-gray-800/80 border border-gray-600">
          <h3 className="font-bold text-violet-200">Spells</h3>
          {character.ownedSpells.length === 0 ? (
            <p className="text-sm text-gray-200 mt-2">None yet. Unlock from skill tree or boss drops!</p>
          ) : (
            <ul className="mt-2 space-y-1">
              {character.ownedSpells.map((id) => (
                <li key={id} className="text-sm text-gray-200">
                  {id}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollectionScreen;
