import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Clef, GameConfig } from '../StaffWarsGame';
import { useResponsiveLayout } from '@/hooks/useViewport';
import { Music, Trophy, Info, Play, Check, Eye } from 'lucide-react';

interface SetupScreenProps {
  onStartGame: (config: GameConfig) => void;
  highScores: number[];
  showCorrectAnswer: boolean;
  onToggleShowCorrectAnswer: () => void;
}

const CLEF_OPTIONS: { value: Clef; label: string; icon: string }[] = [
  { value: 'treble', label: 'Treble Clef', icon: '🎼' },
  { value: 'bass', label: 'Bass Clef', icon: '𝄢' },
  { value: 'alto', label: 'Alto Clef', icon: '𝄡' },
];

const RANGE_PRESETS: { label: string; subLabel: string; minNote: string; maxNote: string; color: string }[] = [
  { label: 'Beginner', subLabel: 'Staff Notes Only', minNote: 'E4', maxNote: 'F5', color: 'bg-green-500/20 border-green-500/50 hover:bg-green-500/30' },
  { label: 'Intermediate', subLabel: 'Extended Range', minNote: 'C4', maxNote: 'A5', color: 'bg-blue-500/20 border-blue-500/50 hover:bg-blue-500/30' },
  { label: 'Advanced', subLabel: 'Full Range', minNote: 'B3', maxNote: 'B5', color: 'bg-purple-500/20 border-purple-500/50 hover:bg-purple-500/30' },
];

export default function SetupScreen({ onStartGame, highScores, showCorrectAnswer, onToggleShowCorrectAnswer }: SetupScreenProps) {
  const [selectedClef, setSelectedClef] = useState<Clef>('treble');
  const [selectedRange, setSelectedRange] = useState(0); // Default to Beginner
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
      className="w-full mx-auto h-[100dvh] flex items-center justify-center overflow-hidden relative"
      style={{
        maxWidth: `${layout.maxContentWidth}px`,
        padding: `${layout.padding}px`
      }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <Card
        className="relative w-full bg-slate-900/90 border-slate-700 backdrop-blur-xl shadow-2xl max-h-full overflow-y-auto scrollbar-hide"
        style={{
          maxWidth: '500px',
          padding: 0
        }}
      >
        <CardHeader className="text-center border-b border-slate-800" style={{ padding: `${layout.padding}px` }}>
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
            <Music className="w-8 h-8 text-white" />
          </div>
          <CardTitle
            className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400"
            style={{
              fontSize: `${layout.getFontSize('3xl')}px`,
              marginBottom: '0.5rem'
            }}
          >
            Staff Wars
          </CardTitle>
          <CardDescription
            className="text-slate-400"
            style={{ fontSize: `${layout.getFontSize('base')}px` }}
          >
            Master music notation in this space adventure
          </CardDescription>
        </CardHeader>

        <CardContent
          className="space-y-6"
          style={{
            padding: `${layout.padding}px`,
          }}
        >
          {/* Clef Selection */}
          <div className="space-y-3">
            <Label className="text-slate-300 font-semibold uppercase text-xs tracking-wider ml-1">
              Select Clef
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {CLEF_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedClef(option.value)}
                  className={`
                    relative flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200
                    ${selectedClef === option.value
                      ? 'bg-slate-800 border-blue-500 shadow-lg shadow-blue-500/20 scale-[1.02]'
                      : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-slate-600'
                    }
                  `}
                >
                  {selectedClef === option.value && (
                    <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                  )}
                  <span className="text-3xl mb-2 block">{option.icon}</span>
                  <span className={`text-xs font-medium ${selectedClef === option.value ? 'text-blue-400' : 'text-slate-400'}`}>
                    {option.label.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Selection */}
          <div className="space-y-3">
            <Label className="text-slate-300 font-semibold uppercase text-xs tracking-wider ml-1">
              Difficulty Level
            </Label>
            <div className="space-y-2">
              {RANGE_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedRange(idx)}
                  className={`
                    w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all duration-200 text-left
                    ${selectedRange === idx
                      ? `${preset.color} border-opacity-100 shadow-lg`
                      : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-slate-600'
                    }
                  `}
                >
                  <div>
                    <div className={`font-bold ${selectedRange === idx ? 'text-white' : 'text-slate-300'}`}>
                      {preset.label}
                    </div>
                    <div className={`text-xs ${selectedRange === idx ? 'text-white/80' : 'text-slate-500'}`}>
                      {preset.subLabel}
                    </div>
                  </div>
                  {selectedRange === idx && (
                    <Check className="w-5 h-5 text-white" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Learning Options */}
          <div className="space-y-3">
            <Label className="text-slate-300 font-semibold uppercase text-xs tracking-wider ml-1">
              Learning Options
            </Label>
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Eye className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <div className="font-medium text-white text-sm">Show Correct Answer</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Display the correct note when you guess wrong
                    </div>
                  </div>
                </div>
                <Switch
                  checked={showCorrectAnswer}
                  onCheckedChange={onToggleShowCorrectAnswer}
                  className="data-[state=checked]:bg-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* High Scores */}
          {highScores.length > 0 && (
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4 space-y-3">
              <div className="flex items-center gap-2 text-yellow-500 font-bold text-sm uppercase tracking-wider">
                <Trophy className="w-4 h-4" />
                High Scores
              </div>
              <div className="space-y-2">
                {highScores.slice(0, 3).map((score, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="text-slate-400 flex items-center gap-2">
                      <span className={`
                        w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold
                        ${idx === 0 ? 'bg-yellow-500/20 text-yellow-500' : 
                          idx === 1 ? 'bg-slate-400/20 text-slate-400' :
                          'bg-amber-700/20 text-amber-700'}
                      `}>
                        {idx + 1}
                      </span>
                      Rank
                    </span>
                    <span className="font-mono font-bold text-white">{score.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Start Button */}
          <Button
            onClick={handleStart}
            className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-lg rounded-xl shadow-lg shadow-blue-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Play className="w-5 h-5 mr-2 fill-current" />
            Start Mission
          </Button>

          {/* Instructions Hint */}
          <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-200/80 leading-relaxed">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-400" />
            <p>
              Identify notes before they reach the clef. Use the on-screen buttons or your keyboard to play. Good luck, cadet!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
