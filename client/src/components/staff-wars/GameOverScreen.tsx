import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useResponsiveLayout } from '@/hooks/useViewport';

interface GameOverScreenProps {
  score: number;
  highScores: number[];
  onRestart: () => void;
}

export default function GameOverScreen({ score, highScores, onRestart }: GameOverScreenProps) {
  const isNewHighScore = highScores.length > 0 && score === highScores[0];
  const rank = highScores.indexOf(score) + 1;
  const layout = useResponsiveLayout();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" style={{ padding: `${layout.padding}px` }}>
      <Card
        className="bg-slate-800 border-slate-700 w-full"
        style={{
          maxWidth: `${Math.min(layout.maxContentWidth, 448)}px`,
          padding: `${layout.padding}px`
        }}
      >
        <CardHeader className="text-center" style={{ padding: `${layout.padding}px` }}>
          <CardTitle
            className="font-bold text-white"
            style={{
              fontSize: `${layout.getFontSize('4xl')}px`,
              marginBottom: `${layout.padding}px`
            }}
          >
            {isNewHighScore ? '🎉 New High Score!' : '🎮 Game Over'}
          </CardTitle>
        </CardHeader>

        <CardContent
          style={{
            padding: `${layout.padding}px`,
            display: 'flex',
            flexDirection: 'column',
            gap: `${layout.gridGap * 1.5}px`
          }}
        >
          {/* Final Score */}
          <div className="text-center">
            <p
              className="text-slate-300"
              style={{
                fontSize: `${layout.getFontSize('lg')}px`,
                marginBottom: `${layout.padding / 2}px`
              }}
            >
              Final Score
            </p>
            <p
              className="font-bold text-green-400"
              style={{ fontSize: `${layout.getFontSize('4xl') * 1.5}px` }}
            >
              {score}
            </p>
          </div>

          {/* Rank */}
          {rank <= 5 && (
            <div
              className="text-center bg-slate-700 rounded-lg"
              style={{ padding: `${layout.padding}px` }}
            >
              <p className="text-slate-300" style={{ fontSize: `${layout.getFontSize('base')}px` }}>
                You ranked
              </p>
              <p
                className="font-bold text-yellow-400"
                style={{ fontSize: `${layout.getFontSize('3xl')}px` }}
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
                padding: `${layout.padding}px`,
                display: 'flex',
                flexDirection: 'column',
                gap: `${layout.gridGap}px`
              }}
            >
              <h3
                className="font-semibold text-white"
                style={{ fontSize: `${layout.getFontSize('lg')}px` }}
              >
                🏆 Top Scores
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: `${layout.gridGap / 2}px` }}>
                {highScores.slice(0, 5).map((s, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between text-white"
                    style={{ fontSize: `${layout.getFontSize('base')}px` }}
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

          {/* Restart Button */}
          <Button
            onClick={onRestart}
            className="w-full font-bold bg-blue-600 hover:bg-blue-700 text-white touch-target"
            style={{
              height: `${Math.max(layout.padding * 2, 48)}px`,
              fontSize: `${layout.getFontSize('lg')}px`
            }}
          >
            Play Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

