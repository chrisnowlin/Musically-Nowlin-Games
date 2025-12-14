import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useResponsiveLayout } from '@/hooks/useViewport';
import { X, RotateCcw, Trophy, Medal } from 'lucide-react';

interface GameOverScreenProps {
  score: number;
  highScores: number[];
  difficultyLabel?: string;
  onRestart: () => void;
  onQuit: () => void;
}

export default function GameOverScreen({ score, highScores, difficultyLabel, onRestart, onQuit }: GameOverScreenProps) {
  const isNewHighScore = highScores.length > 0 && score === highScores[0];
  const rank = highScores.indexOf(score) + 1;
  const layout = useResponsiveLayout();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm">
      <div className="flex min-h-full items-center justify-center p-4">
          <Card
            className="relative w-full overflow-hidden bg-slate-900/90 shadow-2xl border-slate-700"
            style={{
              maxWidth: `${Math.min(layout.maxContentWidth, 448)}px`,
              padding: 0
            }}
          >
            {/* Decoration */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
            
            <CardHeader className="text-center pb-2 pt-8">
              <div className="mx-auto w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4 ring-4 ring-slate-800 border-2 border-slate-700 shadow-lg relative">
                {isNewHighScore ? (
                  <>
                    <Trophy className="w-10 h-10 text-yellow-400 animate-pulse" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center border-2 border-slate-800">
                      <span className="text-[10px] font-bold text-white">NEW</span>
                    </div>
                  </>
                ) : (
                  <Medal className="w-10 h-10 text-slate-400" />
                )}
              </div>
              <CardTitle
                className="font-bold text-3xl text-white mb-1"
              >
                {isNewHighScore ? 'New High Score!' : 'Game Over'}
              </CardTitle>
              <p className="text-slate-400 text-sm">
                {isNewHighScore ? 'Outstanding performance, cadet!' : 'Good effort! Try again to improve.'}
              </p>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
            {/* Final Score */}
            <div className="text-center py-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
              <p className="text-slate-400 text-xs uppercase tracking-widest font-bold mb-1">
                Final Score
              </p>
              <p className="font-mono font-bold text-5xl text-white tracking-tighter">
                {score}
              </p>
              {difficultyLabel && (
                <p className="text-slate-400 text-sm mt-2">
                  Difficulty: <span className="text-white font-semibold">{difficultyLabel}</span>
                </p>
              )}
            </div>

            {/* Rank */}
            {rank <= 5 && rank > 0 && (
               <div className="flex items-center justify-center gap-2 text-yellow-400 bg-yellow-500/10 py-2 rounded-lg border border-yellow-500/20">
                 <Trophy className="w-4 h-4" />
                 <span className="font-bold">Ranked #{rank} on Leaderboard</span>
               </div>
            )}

            {/* High Scores */}
            {highScores.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs uppercase text-slate-500 font-bold tracking-wider px-2">
                  <span>Rank</span>
                  <span>Score</span>
                </div>
                <div className="space-y-1">
                  {highScores.slice(0, 5).map((s, idx) => (
                    <div
                      key={idx}
                      className={`
                        flex justify-between items-center p-2 rounded-lg text-sm font-mono
                        ${s === score ? 'bg-blue-500/20 text-blue-200 border border-blue-500/30' : 'text-slate-400 hover:bg-slate-800/50'}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`
                          w-5 h-5 flex items-center justify-center rounded text-[10px] font-bold
                          ${idx === 0 ? 'bg-yellow-500 text-black' : 
                            idx === 1 ? 'bg-slate-400 text-black' :
                            idx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-700 text-slate-400'}
                        `}>
                          {idx + 1}
                        </span>
                      </div>
                      <span className={s === score ? 'font-bold' : ''}>
                        {s.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
               <Button
                 onClick={onQuit}
                 variant="outline"
                 className="h-12 border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
               >
                  <X className="w-4 h-4 mr-2" />
                  Quit
               </Button>
               <Button
                 onClick={onRestart}
                 className="h-12 bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/20"
               >
                 <RotateCcw className="w-4 h-4 mr-2" />
                 Play Again
               </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

