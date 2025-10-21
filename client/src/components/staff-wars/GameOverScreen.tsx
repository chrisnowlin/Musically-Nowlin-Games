import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GameOverScreenProps {
  score: number;
  highScores: number[];
  onRestart: () => void;
}

export default function GameOverScreen({ score, highScores, onRestart }: GameOverScreenProps) {
  const isNewHighScore = highScores.length > 0 && score === highScores[0];
  const rank = highScores.indexOf(score) + 1;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="bg-slate-800 border-slate-700 w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold text-white mb-4">
            {isNewHighScore ? '🎉 New High Score!' : '🎮 Game Over'}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Final Score */}
          <div className="text-center">
            <p className="text-slate-300 text-lg mb-2">Final Score</p>
            <p className="text-6xl font-bold text-green-400">{score}</p>
          </div>

          {/* Rank */}
          {rank <= 5 && (
            <div className="text-center bg-slate-700 p-3 rounded-lg">
              <p className="text-slate-300">You ranked</p>
              <p className="text-3xl font-bold text-yellow-400">#{rank}</p>
            </div>
          )}

          {/* High Scores */}
          {highScores.length > 0 && (
            <div className="bg-slate-700 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-3">🏆 Top Scores</h3>
              <div className="space-y-2">
                {highScores.slice(0, 5).map((s, idx) => (
                  <div key={idx} className="flex justify-between text-white">
                    <span>#{idx + 1}</span>
                    <span className={s === score ? 'font-bold text-green-400' : ''}>
                      {s}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Restart Button */}
          <Button
            onClick={onRestart}
            className="w-full h-12 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white"
          >
            Play Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

