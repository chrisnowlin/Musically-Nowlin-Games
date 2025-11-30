import React, { useState } from "react";
import { PitchIntervalMasterGame } from "./PitchIntervalMasterGame";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { pitch001Modes } from "@/lib/gameLogic/pitch-001Modes";
import { playfulColors, playfulTypography, playfulShapes, playfulComponents, playfulAnimations, generateDecorativeOrbs } from "@/theme/playful";
import { ChevronLeft, Play, HelpCircle, Volume2, VolumeX } from "lucide-react";

export const Pitch001Game: React.FC = () => {
  const [, navigate] = useLocation();
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  const handleGameComplete = (score: number, totalRounds: number) => {
    setSelectedMode(null);
  };

  const handleBackToMenu = () => {
    setSelectedMode(null);
  };

  const handleBackToGames = () => {
    navigate('/games');
  };

  // Mode selection screen
  if (!selectedMode) {
    const decorativeOrbs = generateDecorativeOrbs();
    
    return (
      <div className={`min-h-screen ${playfulColors.gradients.background} flex flex-col p-4 relative overflow-hidden`}>
        <button
          onClick={handleBackToGames}
          className="absolute top-4 left-4 z-50 flex items-center gap-2 text-purple-700 hover:text-purple-900 font-semibold bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all"
        >
          <ChevronLeft size={24} />
          Back to Games
        </button>

        {decorativeOrbs.map((orb) => (
          <div key={orb.key} className={orb.className} />
        ))}

        <div className="flex-1 flex flex-col items-center justify-center z-10 max-w-6xl mx-auto w-full space-y-8">
          <div className="text-center space-y-4">
            <h1 className={`${playfulTypography.headings.hero} ${playfulColors.gradients.title}`}>
              Pitch Explorer
            </h1>
            <p className={`${playfulTypography.body.large} text-gray-700 dark:text-gray-300`}>
              Master pitch recognition and intervals through fun musical challenges!
            </p>
          </div>

          {/* Difficulty Selection */}
          <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-6 ${playfulShapes.shadows.card} space-y-4`}>
            <div className="flex items-center gap-3 text-lg">
              <HelpCircle className="w-6 h-6 text-orange-600" />
              <span className={playfulTypography.body.medium}>Select Difficulty:</span>
            </div>
            <div className="flex justify-center gap-4">
              {(['easy', 'medium', 'hard'] as const).map(level => (
                <Button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  size="lg"
                  className={`${
                    difficulty === level 
                      ? playfulComponents.button.primary 
                      : `${playfulComponents.button.secondary} opacity-75`
                  } transform ${playfulAnimations.hover.scale}`}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {pitch001Modes.map((mode, index) => (
              <div
                key={mode.id}
                className={`${playfulComponents.card.base} ${playfulComponents.card.available} ${playfulComponents.card.hover} cursor-pointer`}
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => setSelectedMode(mode.id)}
              >
                <CardHeader className="text-center pb-4">
                  <div className={`${playfulComponents.iconContainer.large} ${playfulColors.accents.purple.bg} mb-4`}>
                    <span className="text-4xl">{mode.icon}</span>
                  </div>
                  <CardTitle className={`${playfulTypography.headings.h4} text-gray-800 dark:text-gray-200`}>
                    {mode.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <p className={`${playfulTypography.body.small} text-gray-600 dark:text-gray-400`}>
                    {mode.description}
                  </p>
                  <div className="flex justify-center gap-2 flex-wrap">
                    <span className={playfulComponents.badge.purple}>
                      {mode.ageGroup}
                    </span>
                    <span className={playfulComponents.badge.green}>
                      {difficulty}
                    </span>
                  </div>
                  <Button 
                    className={`${playfulComponents.button.success} w-full transform ${playfulAnimations.hover.scale}`}
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Start {mode.name}
                  </Button>
                </CardContent>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Game screen
  return (
    <PitchIntervalMasterGame
      modeId={selectedMode}
      difficulty={difficulty}
      onGameComplete={handleGameComplete}
      onBackToMenu={handleBackToMenu}
    />
  );
};
