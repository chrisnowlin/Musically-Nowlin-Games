import React, { useState } from 'react';
import { Button } from '@/common/ui/button';
import { Input } from '@/common/ui/input';
import { cn } from '@/common/utils/utils';
import { CLASS_INFO } from '@/lib/cadence-quest/classes';
import type { CharacterClass } from '@shared/types/cadence-quest';

interface CharacterCreationProps {
  onCreate: (name: string, charClass: CharacterClass) => void | Promise<void>;
}

const CharacterCreation: React.FC<CharacterCreationProps> = ({ onCreate }) => {
  const [selectedClass, setSelectedClass] = useState<CharacterClass | null>(null);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter a name');
      return;
    }
    if (trimmed.length < 2 || trimmed.length > 20) {
      setError('Name must be 2-20 characters');
      return;
    }
    if (!selectedClass) {
      setError('Please select a class');
      return;
    }
    setLoading(true);
    try {
      await onCreate(trimmed, selectedClass);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create character');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 p-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-purple-900 drop-shadow-sm">Create Your Character</h2>

      <div className="w-full">
        <label className="block text-sm font-medium text-purple-800 mb-2">
          Character Name
        </label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your hero's name..."
          className="bg-gray-800/80 border-purple-500/50 text-white placeholder:text-gray-500"
          maxLength={20}
        />
      </div>

      <div className="w-full">
        <label className="block text-sm font-medium text-purple-800 mb-3">
          Choose Your Class
        </label>
        <div className="grid grid-cols-2 gap-3">
          {(Object.keys(CLASS_INFO) as CharacterClass[]).map((id) => {
            const info = CLASS_INFO[id];
            const Icon = info.icon;
            const isSelected = selectedClass === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedClass(id)}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-left',
                  'bg-gray-800/80 hover:bg-gray-700/80',
                  isSelected
                    ? 'border-purple-500 ring-2 ring-purple-500/50'
                    : 'border-gray-600 hover:border-gray-500'
                )}
              >
                <img
                  src={info.spritePath}
                  alt=""
                  className="w-12 h-12 object-contain"
                  style={{ imageRendering: 'pixelated' }}
                />
                <Icon className="w-8 h-8 text-purple-300" />
                <span className="font-bold text-white">{info.name}</span>
                <span className="text-xs text-gray-200 text-center line-clamp-2">
                  {info.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {selectedClass && (
        <div
          className={cn(
            'w-full p-4 rounded-xl border-2 border-white/20 bg-purple-900/50',
            CLASS_INFO[selectedClass].color
          )}
        >
          <h3 className="font-bold text-white mb-1 drop-shadow-sm">
            {CLASS_INFO[selectedClass].name} - {CLASS_INFO[selectedClass].primaryStat}
          </h3>
          <p className="text-sm text-white/95">
            {CLASS_INFO[selectedClass].challengeBonus}
          </p>
          <p className="text-sm text-white/90 mt-2">
            <strong>Special:</strong> {CLASS_INFO[selectedClass].specialAbility.name} —{' '}
            {CLASS_INFO[selectedClass].specialAbility.description}
          </p>
        </div>
      )}

      {error && (
        <p className="text-red-400 text-sm font-medium">{error}</p>
      )}

      <Button
        onClick={handleSubmit}
        disabled={!selectedClass || !name.trim() || loading}
        className="bg-purple-600 hover:bg-purple-700 text-white px-8"
      >
        {loading ? 'Creating...' : 'Begin Adventure'}
      </Button>
    </div>
  );
};

export default CharacterCreation;
