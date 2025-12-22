/**
 * Rhythm Randomizer Tool
 * Main container component for the rhythm generation tool
 */

import { useEffect, useMemo } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRhythmRandomizer } from '@/hooks/useRhythmRandomizer';
import { addSyllablesToPattern } from '@/lib/rhythmRandomizer/countingSyllables';

// Control Panel Components
import { TimeSignatureSelector } from './ControlPanel/TimeSignatureSelector';
import { TempoControl } from './ControlPanel/TempoControl';
import { NoteValueSelector } from './ControlPanel/NoteValueSelector';
import { PresetSelector } from './ControlPanel/PresetSelector';
import { PlaybackControls } from './ControlPanel/PlaybackControls';
import { SoundSelector } from './ControlPanel/SoundSelector';
import { DensityControls } from './ControlPanel/DensityControls';
import { MeasureCountSelector } from './ControlPanel/MeasureCountSelector';

// Display Components
import { GridNotation } from './Display/GridNotation';
import { StaffNotation } from './Display/StaffNotation';
import { NotationToggle } from './Display/NotationToggle';
import { SyllableSelector } from './Display/SyllableSelector';
import { EnsembleDisplay } from './Display/EnsembleDisplay';
import { EnsembleModeSelector } from './ControlPanel/EnsembleModeSelector';
import { WorksheetBuilder } from './Worksheet/WorksheetBuilder';
import { ShareButton } from './Actions/ShareButton';
import { PrintButton } from './Actions/PrintButton';
import { loadSettingsFromUrl, updateUrlWithSettings } from '@/lib/rhythmRandomizer/shareUtils';

export function RhythmRandomizerTool() {
  const {
    settings,
    pattern,
    ensemblePattern,
    playbackState,
    isReady,
    volume,
    generate,
    play,
    stop,
    pause,
    resume,
    setVolume,
    regenerateEnsemblePart,
    toggleEnsemblePartMute,
    toggleEnsemblePartSolo,
    updateSetting,
    updateSettings,
    applyPreset,
  } = useRhythmRandomizer();

  // Load settings from URL on mount and generate initial pattern
  useEffect(() => {
    const urlSettings = loadSettingsFromUrl();
    if (Object.keys(urlSettings).length > 0) {
      updateSettings(urlSettings);
    }
    generate();
  }, []);

  // Update URL when settings change (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateUrlWithSettings(settings);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [settings]);

  // Add syllables to pattern based on current counting system
  const patternWithSyllables = useMemo(() => {
    if (!pattern) return null;
    return addSyllablesToPattern(pattern, settings.countingSystem);
  }, [pattern, settings.countingSystem]);

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
            <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
              For Educators
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ShareButton settings={settings} />
            <PrintButton />
            <Button onClick={generate} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Regenerate
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Control Panel - Left Column */}
          <div className="lg:col-span-1 space-y-4">
            {/* Presets */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Quick Presets</CardTitle>
              </CardHeader>
              <CardContent>
                <PresetSelector onSelectPreset={applyPreset} />
              </CardContent>
            </Card>

            {/* Settings Tabs */}
            <Card>
              <Tabs defaultValue="basic" className="w-full">
                <CardHeader className="pb-0">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="basic">Basic</TabsTrigger>
                    <TabsTrigger value="advanced">Advanced</TabsTrigger>
                  </TabsList>
                </CardHeader>
                <CardContent className="pt-4">
                  <TabsContent value="basic" className="space-y-4 mt-0">
                    <TimeSignatureSelector
                      value={settings.timeSignature}
                      onChange={(value) => updateSetting('timeSignature', value)}
                    />
                    <TempoControl
                      value={settings.tempo}
                      onChange={(value) => updateSetting('tempo', value)}
                    />
                    <MeasureCountSelector
                      value={settings.measureCount}
                      onChange={(value) => updateSetting('measureCount', value)}
                    />
                    <SoundSelector
                      value={settings.sound}
                      onChange={(value) => updateSetting('sound', value)}
                    />
                  </TabsContent>
                  <TabsContent value="advanced" className="space-y-4 mt-0">
                    <NoteValueSelector
                      selectedValues={settings.allowedNoteValues}
                      onChange={(values) => updateSetting('allowedNoteValues', values)}
                    />
                    <DensityControls
                      syncopation={settings.syncopationProbability}
                      density={settings.noteDensity}
                      restProbability={settings.restProbability}
                      onSyncopationChange={(value) => updateSetting('syncopationProbability', value)}
                      onDensityChange={(value) => updateSetting('noteDensity', value)}
                      onRestProbabilityChange={(value) => updateSetting('restProbability', value)}
                    />
                    <EnsembleModeSelector
                      mode={settings.ensembleMode}
                      partCount={settings.partCount}
                      onModeChange={(mode) => updateSetting('ensembleMode', mode)}
                      onPartCountChange={(count) => updateSetting('partCount', count)}
                    />
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </div>

          {/* Display & Playback - Right Column */}
          <div className="lg:col-span-2 space-y-4">
            {/* Notation Display */}
            <Card className="min-h-[350px]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="text-sm font-medium">
                    {settings.ensembleMode === 'single' ? 'Pattern' : 'Ensemble'}
                  </CardTitle>
                  <div className="flex items-center gap-3">
                    <NotationToggle
                      value={settings.notationMode}
                      onChange={(mode) => updateSetting('notationMode', mode)}
                    />
                    <SyllableSelector
                      value={settings.countingSystem}
                      onChange={(system) => updateSetting('countingSystem', system)}
                      showLabel={false}
                      compact
                    />
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {settings.timeSignature} | {settings.tempo} BPM | {settings.measureCount} measures
                  {settings.ensembleMode !== 'single' && ` | ${settings.partCount} parts`}
                </div>
              </CardHeader>
              <CardContent>
                {settings.ensembleMode !== 'single' && ensemblePattern ? (
                  <EnsembleDisplay
                    ensemble={ensemblePattern}
                    notationMode={settings.notationMode}
                    countingSystem={settings.countingSystem}
                    currentEventIndex={playbackState.currentEventIndex}
                    isPlaying={playbackState.isPlaying}
                    onToggleMute={toggleEnsemblePartMute}
                    onToggleSolo={toggleEnsemblePartSolo}
                    onRegeneratePart={regenerateEnsemblePart}
                  />
                ) : patternWithSyllables ? (
                  settings.notationMode === 'staff' ? (
                    <StaffNotation
                      pattern={patternWithSyllables}
                      currentEventIndex={playbackState.currentEventIndex}
                      isPlaying={playbackState.isPlaying}
                      showSyllables={settings.countingSystem !== 'none'}
                    />
                  ) : (
                    <GridNotation
                      pattern={patternWithSyllables}
                      currentEventIndex={playbackState.currentEventIndex}
                      isPlaying={playbackState.isPlaying}
                    />
                  )
                ) : (
                  <div className="flex items-center justify-center h-48 text-gray-400">
                    Click "Regenerate" to create a pattern
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Playback Controls */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Playback</CardTitle>
              </CardHeader>
              <CardContent>
                <PlaybackControls
                  playbackState={playbackState}
                  isReady={isReady}
                  hasPattern={!!pattern}
                  loopEnabled={settings.loopEnabled}
                  countInMeasures={settings.countInMeasures}
                  metronomeEnabled={settings.metronomeEnabled}
                  volume={volume}
                  onPlay={play}
                  onStop={stop}
                  onPause={pause}
                  onResume={resume}
                  onLoopChange={(enabled) => updateSetting('loopEnabled', enabled)}
                  onCountInChange={(measures) => updateSetting('countInMeasures', measures)}
                  onMetronomeChange={(enabled) => updateSetting('metronomeEnabled', enabled)}
                  onVolumeChange={setVolume}
                />
              </CardContent>
            </Card>

            {/* Worksheet Export */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Worksheet Export</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Generate printable PDFs with exercises and answer keys
                  </div>
                  <WorksheetBuilder rhythmSettings={settings} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
