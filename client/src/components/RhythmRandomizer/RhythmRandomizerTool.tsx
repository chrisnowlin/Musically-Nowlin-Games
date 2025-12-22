/**
 * Rhythm Randomizer Tool
 * Main container component for the rhythm generation tool
 */

import { useEffect } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, RefreshCw, Play, Square, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRhythmRandomizer } from '@/hooks/useRhythmRandomizer';
import { TimeSignatureSelector } from './ControlPanel/TimeSignatureSelector';
import { TempoControl } from './ControlPanel/TempoControl';
import { NoteValueSelector } from './ControlPanel/NoteValueSelector';
import { PresetSelector } from './ControlPanel/PresetSelector';
import { GridNotation } from './Display/GridNotation';

export function RhythmRandomizerTool() {
  const {
    settings,
    pattern,
    playbackState,
    isReady,
    generate,
    play,
    stop,
    updateSetting,
    applyPreset,
  } = useRhythmRandomizer();

  // Generate initial pattern on mount
  useEffect(() => {
    generate();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/games">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-purple-800">Rhythm Randomizer</h1>
          </div>
          <Button onClick={generate} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Regenerate
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Control Panel */}
          <div className="lg:col-span-1 space-y-4">
            {/* Presets */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Difficulty</CardTitle>
              </CardHeader>
              <CardContent>
                <PresetSelector onSelectPreset={applyPreset} />
              </CardContent>
            </Card>

            {/* Time & Tempo */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Time & Tempo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <TimeSignatureSelector
                  value={settings.timeSignature}
                  onChange={(value) => updateSetting('timeSignature', value)}
                />
                <TempoControl
                  value={settings.tempo}
                  onChange={(value) => updateSetting('tempo', value)}
                />
              </CardContent>
            </Card>

            {/* Note Values */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Note Values</CardTitle>
              </CardHeader>
              <CardContent>
                <NoteValueSelector
                  selectedValues={settings.allowedNoteValues}
                  onChange={(values) => updateSetting('allowedNoteValues', values)}
                />
              </CardContent>
            </Card>
          </div>

          {/* Display & Playback */}
          <div className="lg:col-span-2 space-y-4">
            {/* Notation Display */}
            <Card className="min-h-[300px]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Pattern</CardTitle>
              </CardHeader>
              <CardContent>
                {pattern ? (
                  <GridNotation
                    pattern={pattern}
                    currentEventIndex={playbackState.currentEventIndex}
                    isPlaying={playbackState.isPlaying}
                  />
                ) : (
                  <div className="flex items-center justify-center h-48 text-gray-400">
                    Click "Regenerate" to create a pattern
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Playback Controls */}
            <Card>
              <CardContent className="py-4">
                <div className="flex items-center justify-center gap-4">
                  {!playbackState.isPlaying ? (
                    <Button
                      onClick={play}
                      disabled={!pattern || !isReady}
                      size="lg"
                      className="gap-2"
                    >
                      <Play className="w-5 h-5" />
                      Play
                    </Button>
                  ) : (
                    <Button
                      onClick={stop}
                      size="lg"
                      variant="destructive"
                      className="gap-2"
                    >
                      <Square className="w-5 h-5" />
                      Stop
                    </Button>
                  )}
                </div>
                <div className="text-center mt-2 text-sm text-gray-500">
                  {settings.tempo} BPM | {settings.timeSignature} | {settings.measureCount} measures
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
