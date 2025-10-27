import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useResponsiveLayout } from '@/hooks/useViewport';
import { X } from 'lucide-react';

interface GameOverScreenProps {
  score: number;
  highScores: number[];
  onRestart: () => void;
  onQuit: () => void;
}

export default function GameOverScreen({ score, highScores, onRestart, onQuit }: GameOverScreenProps) {
  const isNewHighScore = highScores.length > 0 && score === highScores[0];
  const rank = highScores.indexOf(score) + 1;
  const layout = useResponsiveLayout();

  return (
    <>
      {/* Overlay Background */}
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <Card
          className="bg-slate-800 border-slate-700 w-full max-h-full overflow-y-auto my-auto"
          style={{
            maxWidth: `${Math.min(layout.maxContentWidth, 448)}px`,
            padding: `${layout.padding * 0.75}px`
          }}
        >
          <CardHeader className="text-center" style={{ padding: `${layout.padding * 0.75}px`, paddingBottom: `${layout.padding * 0.5}px` }}>
            <CardTitle
              className="font-bold text-white"
              style={{
                fontSize: `${layout.getFontSize('3xl')}px`,
                marginBottom: 0
              }}
            >
              {isNewHighScore ? '🎉 New High Score!' : '🎮 Game Over'}
            </CardTitle>
          </CardHeader>

          <CardContent
            style={{
              padding: `${layout.padding * 0.75}px`,
              paddingTop: `${layout.padding * 0.5}px`,
              display: 'flex',
              flexDirection: 'column',
              gap: `${layout.gridGap * 1.25}px`
            }}
          >
            {/* Final Score */}
            <div className="text-center">
              <p
                className="text-slate-300"
                style={{
                  fontSize: `${layout.getFontSize('base')}px`,
                  marginBottom: `${layout.padding * 0.25}px`
                }}
              >
                Final Score
              </p>
              <p
                className="font-bold text-green-400"
                style={{ fontSize: `${layout.getFontSize('4xl')}px` }}
              >
                {score}
              </p>
            </div>

            {/* Rank */}
            {rank <= 5 && (
              <div
                className="text-center bg-slate-700 rounded-lg"
                style={{ padding: `${layout.padding * 0.75}px` }}
              >
                <p className="text-slate-300" style={{ fontSize: `${layout.getFontSize('sm')}px` }}>
                  You ranked
                </p>
                <p
                  className="font-bold text-yellow-400"
                  style={{ fontSize: `${layout.getFontSize('2xl')}px` }}
                >
                  #{rank}
                </p>
              </div>
            )}

            {/* High Scores */}
            {highScores.length > 0 && (
              <div
                className="bg-slate-700 rounded-lg"
                style={{
                  padding: `${layout.padding * 0.75}px`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: `${layout.gridGap * 0.75}px`
                }}
              >
                <h3
                  className="font-semibold text-white"
                  style={{ fontSize: `${layout.getFontSize('base')}px` }}
                >
                  🏆 Top Scores
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: `${layout.gridGap * 0.5}px` }}>
                  {highScores.slice(0, 5).map((s, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between text-white"
                      style={{ fontSize: `${layout.getFontSize('sm')}px` }}
                    >
                      <span>#{idx + 1}</span>
                      <span className={s === score ? 'font-bold text-green-400' : ''}>
                        {s}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: `${layout.gridGap * 0.75}px` }}>
               <Button
                 onClick={onRestart}
                 className="flex-1 font-bold bg-blue-600 hover:bg-blue-700 text-white touch-target"
                 style={{
                   height: `${Math.max(layout.padding * 2, 44)}px`,
                   fontSize: `${layout.getFontSize('base')}px`
                 }}
               >
                 Play Again
               </Button>
               <Button
                 onClick={onQuit}
                 className="flex-1 font-bold bg-slate-600 hover:bg-slate-700 text-white touch-target"
                 style={{
                   height: `${Math.max(layout.padding * 2, 44)}px`,
                   fontSize: `${layout.getFontSize('base')}px`
                 }}
               >
                  <X size={layout.device.isMobile ? 14 : 18} />
                  Quit to Menu
               </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

