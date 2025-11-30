import React from "react";
import ScaleBuilderGame from "./ScaleBuilderGame";
import { useLocation } from "wouter";
import { ChevronLeft } from "lucide-react";
import { playfulColors, playfulTypography, playfulShapes, playfulComponents, playfulAnimations, generateDecorativeOrbs } from "@/theme/playful";

export const Theory002Game: React.FC = () => {
  const [, navigate] = useLocation();
  const decorativeOrbs = generateDecorativeOrbs();

  const handleGameComplete = (score: number, totalPossible: number) => {
    navigate('/games');
  };

  const handleBack = () => {
    navigate('/games');
  };

  return (
    <div className={`min-h-screen ${playfulColors.gradients.background} flex flex-col p-4 relative overflow-hidden`}>
      <button
        onClick={handleBack}
        className="absolute top-4 left-4 z-50 flex items-center gap-2 text-purple-700 hover:text-purple-900 font-semibold bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all"
      >
        <ChevronLeft size={24} />
        Back to Games
      </button>

      {decorativeOrbs.map((orb) => (
        <div key={orb.key} className={orb.className} />
      ))}

      <div className="flex-1 flex flex-col items-center justify-center z-10 max-w-6xl mx-auto w-full">
        <ScaleBuilderGame
          onGameComplete={handleGameComplete}
          onBack={handleBack}
        />
      </div>
    </div>
  );
};
