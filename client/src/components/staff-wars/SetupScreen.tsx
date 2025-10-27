import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Clef, GameConfig } from '../StaffWarsGame';
import { useResponsiveLayout } from '@/hooks/useViewport';

interface SetupScreenProps {
  onStartGame: (config: GameConfig) => void;
  highScores: number[];
}

const CLEF_OPTIONS: { value: Clef; label: string }[] = [
  { value: 'treble', label: 'Treble Clef' },
  { value: 'bass', label: 'Bass Clef' },
  { value: 'alto', label: 'Alto Clef' },
];

const RANGE_PRESETS: { label: string; minNote: string; maxNote: string }[] = [
  { label: 'Beginner (Staff Notes)', minNote: 'E4', maxNote: 'F5' }, // EGBDF FACE - notes on the staff (E4-F5)
  { label: 'Intermediate (Extended)', minNote: 'C4', maxNote: 'A5' }, // Adds C4,D4 below and G5,A5 above
  { label: 'Advanced (Full Range)', minNote: 'B3', maxNote: 'B5' }, // Extends one more whole step each direction
];

export default function SetupScreen({ onStartGame, highScores }: SetupScreenProps) {
  const [selectedClef, setSelectedClef] = useState<Clef>('treble');
  const [selectedRange, setSelectedRange] = useState(1); // Index into RANGE_PRESETS
  const layout = useResponsiveLayout();

  const handleStart = () => {
    const preset = RANGE_PRESETS[selectedRange];
    onStartGame({
      clef: selectedClef,
      minNote: preset.minNote,
      maxNote: preset.maxNote,
    });
  };

  return (
    <div
      className="w-full mx-auto h-screen flex items-center justify-center overflow-hidden"
      style={{
        maxWidth: `${layout.maxContentWidth}px`,
        padding: `${layout.padding}px`
      }}
    >
      <Card
        className="bg-slate-800 border-slate-700 max-h-full overflow-y-auto"
        style={{
          padding: `${layout.padding * 0.75}px`
        }}
      >
        <CardHeader className="text-center" style={{ padding: `${layout.padding * 0.75}px`, paddingBottom: `${layout.padding * 0.5}px` }}>
          <CardTitle
            className="font-bold text-white"
            style={{
              fontSize: `${layout.getFontSize('3xl')}px`,
              marginBottom: `${layout.padding * 0.25}px`
            }}
          >
            🎵 Staff Wars
          </CardTitle>
          <CardDescription
            className="text-slate-300"
            style={{ fontSize: `${layout.getFontSize('base')}px` }}
          >
            Learn to read music notation with speed and accuracy!
          </CardDescription>
        </CardHeader>

        <CardContent
          style={{
            padding: `${layout.padding * 0.75}px`,
            paddingTop: `${layout.padding * 0.5}px`,
            display: 'flex',
            flexDirection: 'column',
            gap: `${layout.gridGap * 1.5}px`
          }}
        >
          {/* Clef Selection */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: `${layout.gridGap * 0.75}px` }}>
            <h3
              className="font-semibold text-white"
              style={{ fontSize: `${layout.getFontSize('lg')}px` }}
            >
              Select Clef
            </h3>
            <RadioGroup value={selectedClef} onValueChange={(v) => setSelectedClef(v as Clef)}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: `${layout.gridGap / 2}px` }}>
                {CLEF_OPTIONS.map((option) => (
                  <div key={option.value} className="flex items-center" style={{ gap: `${layout.gridGap / 2}px` }}>
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label
                      htmlFor={option.value}
                      className="text-white cursor-pointer touch-target"
                      style={{ fontSize: `${layout.getFontSize('base')}px` }}
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Range Selection */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: `${layout.gridGap * 0.75}px` }}>
            <h3
              className="font-semibold text-white"
              style={{ fontSize: `${layout.getFontSize('lg')}px` }}
            >
              Select Difficulty
            </h3>
            <RadioGroup value={String(selectedRange)} onValueChange={(v) => setSelectedRange(parseInt(v))}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: `${layout.gridGap / 2}px` }}>
                {RANGE_PRESETS.map((preset, idx) => (
                  <div key={idx} className="flex items-center" style={{ gap: `${layout.gridGap / 2}px` }}>
                    <RadioGroupItem value={String(idx)} id={`range-${idx}`} />
                    <Label
                      htmlFor={`range-${idx}`}
                      className="text-white cursor-pointer touch-target"
                      style={{ fontSize: `${layout.getFontSize('base')}px` }}
                    >
                      {preset.label}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

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
                🏆 High Scores
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: `${layout.gridGap / 2}px` }}>
                {highScores.map((score, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between text-white"
                    style={{ fontSize: `${layout.getFontSize('base')}px` }}
                  >
                    <span>#{idx + 1}</span>
                    <span className="font-bold">{score}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Start Button */}
          <Button
            onClick={handleStart}
            className="w-full font-bold bg-green-600 hover:bg-green-700 text-white touch-target"
            style={{
              height: `${Math.max(layout.padding * 2, 48)}px`,
              fontSize: `${layout.getFontSize('lg')}px`,
              padding: `${layout.padding * 0.75}px`
            }}
          >
            Start Game
          </Button>

          {/* Instructions */}
          <div
            className="bg-slate-700 rounded-lg text-slate-200"
            style={{
              padding: `${layout.padding * 0.75}px`,
              fontSize: `${layout.getFontSize('xs')}px`
            }}
          >
            <p className="font-semibold" style={{ marginBottom: `${layout.padding * 0.25}px` }}>
              How to Play:
            </p>
            <ul className="list-disc list-inside" style={{ display: 'flex', flexDirection: 'column', gap: `${layout.gridGap / 8}px` }}>
              <li>Notes scroll from right to left</li>
              <li>Tap the note name button before it reaches the clef</li>
              <li>You have 3 lives - lose them all and it's game over</li>
              <li>Speed increases as you get more correct answers</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

