import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Trophy, RotateCcw } from 'lucide-react';

interface VictoryScreenProps {
  victory: boolean;
  onContinue: () => void;
}

const VictoryScreen: React.FC<VictoryScreenProps> = ({ victory, onContinue }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center gap-6 p-8 max-w-md mx-auto"
    >
      <div className="flex flex-col items-center gap-2">
        {victory ? (
          <>
            <Trophy className="w-16 h-16 text-amber-600" />
            <h2 className="text-3xl font-bold text-amber-600 drop-shadow-sm">Victory!</h2>
            <p className="text-purple-800 text-center">
              You won the battle. Your musical skills prevail!
            </p>
          </>
        ) : (
          <>
            <RotateCcw className="w-16 h-16 text-slate-600" />
            <h2 className="text-3xl font-bold text-slate-600 drop-shadow-sm">Defeat</h2>
            <p className="text-purple-800 text-center">
              Better luck next time. Keep practicing!
            </p>
          </>
        )}
      </div>
      <Button onClick={onContinue} className="bg-purple-600 hover:bg-purple-700 text-white">
        Continue
      </Button>
    </motion.div>
  );
};

export default VictoryScreen;
