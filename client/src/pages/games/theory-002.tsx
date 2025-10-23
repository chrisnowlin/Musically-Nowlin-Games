import React from 'react';
import { useLocation } from 'wouter';
import ScaleBuilderGame from '@/components/ScaleBuilderGame';

const Theory002Page: React.FC = () => {
  const [, navigate] = useLocation();

  const handleGameComplete = (score: number, totalPossible: number) => {
    // Navigate to results or back to games menu
    console.log(`Game completed! Score: ${score}/${totalPossible}`);
    navigate('/games');
  };

  const handleBack = () => {
    navigate('/games');
  };

  return (
    <ScaleBuilderGame
      onGameComplete={handleGameComplete}
      onBack={handleBack}
    />
  );
};

export default Theory002Page;