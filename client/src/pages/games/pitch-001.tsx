import React, { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Music, Headphones } from 'lucide-react';
import { PitchIntervalMasterGame } from '@/components/PitchIntervalMasterGame';
import { pitch001Modes } from '@/lib/gameLogic/pitch-001Modes';

const Pitch001Page: React.FC = () => {
  const { modeId = 'octave' } = useParams<{ modeId: string }>();
  const [, navigate] = useLocation();
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [gameStarted, setGameStarted] = useState(false);
  const [finalScore, setFinalScore] = useState<{ score: number; totalRounds: number } | null>(null);

  const modeConfig = pitch001Modes.find(mode => mode.id === modeId);

  const handleGameComplete = (score: number, totalRounds: number) => {
    setFinalScore({ score, totalRounds });
    setGameStarted(false);
  };

  const handleBackToMenu = () => {
    setGameStarted(false);
    setFinalScore(null);
  };

  const handleModeSelect = (selectedModeId: string) => {
    navigate(`/games/pitch-001/${selectedModeId}`);
    setGameStarted(false);
    setFinalScore(null);
  };

  if (!modeConfig) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Button onClick={() => navigate('/games')} variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Games
          </Button>
          
          <Card className="text-center">
            <CardContent className="p-8">
              <p className="text-lg text-muted-foreground">Mode not found</p>
              <Button onClick={() => navigate('/games')} className="mt-4">
                Back to Games
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (finalScore) {
    const percentage = Math.round((finalScore.score / (finalScore.totalRounds * 30)) * 100);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                <Music className="h-8 w-8 text-purple-600" />
                Game Complete!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-6xl font-bold text-purple-600">
                {finalScore.score}
              </div>
              
              <div className="space-y-2">
                <p className="text-xl">Final Score</p>
                <p className="text-muted-foreground">
                  {finalScore.score} out of {finalScore.totalRounds * 30} possible points
                </p>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {percentage}% Accuracy
                </Badge>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <p className="font-medium mb-2">Performance:</p>
                <p className="text-sm">
                  {percentage >= 90 ? 'Outstanding! You have excellent pitch perception!' :
                   percentage >= 70 ? 'Great job! You have a good ear for pitch!' :
                   percentage >= 50 ? 'Good effort! Keep practicing to improve!' :
                   'Keep working on your pitch recognition skills!'}
                </p>
              </div>

              <div className="flex gap-4 justify-center">
                <Button onClick={() => setGameStarted(true)} className="flex-1">
                  Play Again
                </Button>
                <Button onClick={handleBackToMenu} variant="outline" className="flex-1">
                  Change Mode
                </Button>
                <Button onClick={() => navigate('/games')} variant="outline">
                  All Games
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
        <div className="max-w-6xl mx-auto">
          <PitchIntervalMasterGame
            modeId={modeId}
            difficulty={difficulty}
            onGameComplete={handleGameComplete}
            onBackToMenu={handleBackToMenu}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        <Button onClick={() => navigate('/games')} variant="ghost" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Games
        </Button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Mode Selection */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Headphones className="h-6 w-6 text-purple-600" />
                  Pitch & Interval Master
                </CardTitle>
                <p className="text-muted-foreground">
                  Master pitch recognition, intervals, and advanced pitch techniques
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {pitch001Modes.map((mode) => (
                    <Card
                      key={mode.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        modeId === mode.id 
                          ? 'ring-2 ring-purple-500 bg-purple-50' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleModeSelect(mode.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{mode.icon}</span>
                          <div className="flex-1">
                            <h3 className="font-semibold">{mode.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {mode.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {mode.ageGroup}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {mode.estimatedDuration}min
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Game Setup */}
          <div className="space-y-6">
            {/* Selected Mode Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">{modeConfig.icon}</span>
                  {modeConfig.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {modeConfig.description}
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Age</Badge>
                    <span className="text-sm">{modeConfig.ageGroup}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Duration</Badge>
                    <span className="text-sm">{modeConfig.estimatedDuration} minutes</span>
                  </div>
                </div>

                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm font-medium mb-1">How to Play (Easy):</p>
                  <p className="text-xs">{modeConfig.instructions.easy}</p>
                </div>
              </CardContent>
            </Card>

            {/* Difficulty Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Difficulty</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(['easy', 'medium', 'hard'] as const).map((level) => (
                  <Button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    variant={difficulty === level ? 'default' : 'outline'}
                    className="w-full justify-start"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="capitalize">{level}</span>
                      <Badge variant="secondary">
                        {level === 'easy' ? '10 pts' : 
                         level === 'medium' ? '20 pts' : '30 pts'}
                      </Badge>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Start Game */}
            <Button 
              onClick={() => setGameStarted(true)} 
              size="lg" 
              className="w-full"
              style={{ backgroundColor: modeConfig.color }}
            >
              <Music className="h-5 w-5 mr-2" />
              Start {modeConfig.name}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pitch001Page;