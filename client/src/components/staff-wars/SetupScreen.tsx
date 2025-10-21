import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Clef, GameConfig } from '../StaffWarsGame';

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

  const handleStart = () => {
    const preset = RANGE_PRESETS[selectedRange];
    onStartGame({
      clef: selectedClef,
      minNote: preset.minNote,
      maxNote: preset.maxNote,
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold text-white mb-2">
            🎵 Staff Wars
          </CardTitle>
          <CardDescription className="text-lg text-slate-300">
            Learn to read music notation with speed and accuracy!
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Clef Selection */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">Select Clef</h3>
            <RadioGroup value={selectedClef} onValueChange={(v) => setSelectedClef(v as Clef)}>
              <div className="space-y-3">
                {CLEF_OPTIONS.map((option) => (
                  <div key={option.value} className="flex items-center space-x-3">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value} className="text-white cursor-pointer text-lg">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Range Selection */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">Select Difficulty</h3>
            <RadioGroup value={String(selectedRange)} onValueChange={(v) => setSelectedRange(parseInt(v))}>
              <div className="space-y-3">
                {RANGE_PRESETS.map((preset, idx) => (
                  <div key={idx} className="flex items-center space-x-3">
                    <RadioGroupItem value={String(idx)} id={`range-${idx}`} />
                    <Label htmlFor={`range-${idx}`} className="text-white cursor-pointer text-lg">
                      {preset.label}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* High Scores */}
          {highScores.length > 0 && (
            <div className="space-y-3 bg-slate-700 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white">🏆 High Scores</h3>
              <div className="space-y-2">
                {highScores.map((score, idx) => (
                  <div key={idx} className="flex justify-between text-white">
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
            className="w-full h-14 text-xl font-bold bg-green-600 hover:bg-green-700 text-white"
          >
            Start Game
          </Button>

          {/* Instructions */}
          <div className="bg-slate-700 p-4 rounded-lg text-sm text-slate-200">
            <p className="font-semibold mb-2">How to Play:</p>
            <ul className="list-disc list-inside space-y-1">
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

