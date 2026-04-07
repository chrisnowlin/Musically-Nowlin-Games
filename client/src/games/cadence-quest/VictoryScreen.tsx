import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ArrowRight, Trophy, RotateCcw, Star, Coins, Sword, Heart } from 'lucide-react';
import { BattleAudio } from './audio/battle-audio';
import type { Equipment } from '@shared/types/cadence-quest';
import { cn } from '@/common/utils/utils';

interface VictoryScreenProps {
  victory: boolean;
  onBack: () => void;
  onContinue: () => void;
  xpEarned?: number;
  goldEarned?: number;
  itemsDropped?: Equipment[];
  leveledUp?: boolean;
  newLevel?: number;
  stats?: {
    challengesCorrect: number;
    challengesTotal: number;
    maxCombo: number;
    averageResponseTime: number;
  };
}

const RARITY_COLORS = {
  common: 'border-gray-500 bg-gray-500/20',
  uncommon: 'border-green-500 bg-green-500/20',
  rare: 'border-blue-500 bg-blue-500/20',
  epic: 'border-purple-500 bg-purple-500/20',
  legendary: 'border-amber-500 bg-amber-500/20 animate-pulse',
};

const VictoryScreen: React.FC<VictoryScreenProps> = ({
  victory,
  onBack,
  onContinue,
  xpEarned = 0,
  goldEarned = 0,
  itemsDropped = [],
  leveledUp = false,
  newLevel,
  stats = {
    challengesCorrect: 0,
    challengesTotal: 0,
    maxCombo: 0,
    averageResponseTime: 0,
  },
}) => {
  const battleAudio = new BattleAudio();

  useEffect(() => {
    if (victory) {
      battleAudio.playVictoryFanfare();
    } else {
      battleAudio.playDefeatSound();
    }
  }, [victory]);

  const accuracy = stats.challengesTotal > 0
    ? Math.round((stats.challengesCorrect / stats.challengesTotal) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center gap-6 p-8 max-w-2xl mx-auto"
    >
      <div className="flex items-center gap-4 mb-4 w-full justify-between">
        <button onClick={onBack} className="p-2 rounded-lg text-purple-800 hover:bg-purple-200/60">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-2xl font-bold text-purple-900">
          {victory ? 'Victory!' : 'Defeat'}
        </h2>
        <div className="w-10" />
      </div>

      <div className="flex flex-col items-center gap-2">
        {victory ? (
          <>
            <motion.div
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              <Trophy className="w-20 h-20 text-amber-500" />
            </motion.div>
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-bold text-amber-600"
            >
              Victory!
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-purple-800 text-center"
            >
              Your musical prowess prevails!
            </motion.p>
          </>
        ) : (
          <>
            <RotateCcw className="w-20 h-20 text-slate-600" />
            <h2 className="text-4xl font-bold text-slate-600">Defeat</h2>
            <p className="text-purple-800 text-center">
              Better luck next time. Keep practicing!
            </p>
          </>
        )}
      </div>

      <AnimatePresence>
        {leveledUp && newLevel && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="bg-gradient-to-r from-amber-600 to-amber-500 rounded-xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center gap-3">
              <Star className="w-8 h-8" />
              <div>
                <h3 className="text-2xl font-bold">Level Up!</h3>
                <p className="text-amber-100">You are now level {newLevel}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {victory && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="w-full bg-gray-800/80 rounded-xl p-6 border border-purple-500/30"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Star className="text-amber-500" />
            Rewards
          </h3>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-purple-900/30 rounded-lg p-4 border border-purple-500/20">
              <div className="flex items-center gap-2 text-purple-300 mb-1">
                <Star size={16} />
                <span className="text-sm">XP Earned</span>
              </div>
              <p className="text-2xl font-bold text-purple-200">+{xpEarned}</p>
            </div>

            <div className="bg-amber-900/30 rounded-lg p-4 border border-amber-500/20">
              <div className="flex items-center gap-2 text-amber-300 mb-1">
                <Coins size={16} />
                <span className="text-sm">Gold Earned</span>
              </div>
              <p className="text-2xl font-bold text-amber-200">+{goldEarned}</p>
            </div>
          </div>

          {itemsDropped.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-bold text-gray-300 mb-2 flex items-center gap-2">
                <Sword size={16} />
                Items Dropped
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {itemsDropped.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.7 + i * 0.1 }}
                    className={cn(
                      'p-3 rounded-lg border flex items-center gap-3',
                      RARITY_COLORS[item.rarity]
                    )}
                  >
                    <span className="text-3xl">{item.emoji}</span>
                    <div>
                      <p className="font-bold text-white">{item.name}</p>
                      <p className="text-xs text-gray-300 capitalize">{item.rarity}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="w-full bg-gray-800/60 rounded-xl p-6 border border-gray-600"
      >
        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          <Heart className="text-red-400" />
          Battle Statistics
        </h3>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Accuracy:</span>
            <span className={cn(
              'font-bold',
              accuracy >= 80 ? 'text-green-400' :
              accuracy >= 60 ? 'text-yellow-400' :
              'text-red-400'
            )}>
              {accuracy}%
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Challenges:</span>
            <span className="text-white">
              {stats.challengesCorrect} / {stats.challengesTotal}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Max Combo:</span>
            <span className="text-amber-400">{stats.maxCombo}x</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Avg. Response:</span>
            <span className="text-blue-400">
              {(stats.averageResponseTime / 1000).toFixed(1)}s
            </span>
          </div>
        </div>
      </motion.div>

      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        onClick={onContinue}
        className="px-8 py-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg transition-colors"
      >
        Continue
      </motion.button>
    </motion.div>
  );
};

export default VictoryScreen;
