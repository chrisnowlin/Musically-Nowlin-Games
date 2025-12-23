/**
 * Sight Reading Randomizer Tool
 * Main container component for the sight reading generation tool
 */

import { useEffect, useMemo } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, RefreshCw, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSightReadingRandomizer } from '@/hooks/useSightReadingRandomizer';
import { addSyllablesToPattern } from '@/lib/rhythmRandomizer/countingSyllables';

// Control Panel Components
import { TimeSignatureSelector } from './ControlPanel/TimeSignatureSelector';
import { TempoControl } from './ControlPanel/TempoControl';
import { NoteValueSelector } from './ControlPanel/NoteValueSelector';
import { PlaybackControls } from './ControlPanel/PlaybackControls';
import { SoundSelector } from './ControlPanel/SoundSelector';
import { MeasureCountSelector } from './ControlPanel/MeasureCountSelector';
import { ClefSelector } from './ControlPanel/ClefSelector';
import { KeySignatureSelector } from './ControlPanel/KeySignatureSelector';
import { MelodicDifficultySelector } from './ControlPanel/MelodicDifficultySelector';
import { NoteRangeSelector } from './ControlPanel/NoteRangeSelector';
import { TonicGravitySlider } from './ControlPanel/TonicGravitySlider';

// Display Components
import { StaffNotation } from './Display/StaffNotation';
import { PitchSyllableSelector } from './Display/PitchSyllableSelector';
import { EnsembleDisplay } from './Display/EnsembleDisplay';
import { EnsembleModeSelector } from './ControlPanel/EnsembleModeSelector';
import { WorksheetBuilder } from './Worksheet/WorksheetBuilder';
import { ShareButton } from './Actions/ShareButton';
import { PrintButton } from './Actions/PrintButton';
import { loadSettingsFromUrl, updateUrlWithSettings } from '@/lib/rhythmRandomizer/shareUtils';

export function SightReadingRandomizerTool() {
  const {
    settings,
    pattern,
    ensemblePattern,
    playbackState,
    isReady,
    volume,
    startMeasure,
    generate,
    play,
    stop,
    pause,
    resume,
    setVolume,
    setStartMeasure,
    playMetronome,
    stopMetronome,
    regenerateEnsemblePart,
    toggleEnsemblePartMute,
    toggleEnsemblePartSolo,
    updateEnsemblePartSound,
    updateSetting,
    updateSettings,
    applyPreset,
    // Sight reading specific
    sightReadingSettings,
    updateSightReadingSetting,
    vexflowKeySignature,
  } = useSightReadingRandomizer();

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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-amber-100 sticky top-0 z-10 print:hidden">
        <div className="max-w-[95vw] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/games">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-amber-800">Sight Reading Randomizer</h1>
            <span className="text-xs bg-amber-100 text-amber-600 px-2 py-1 rounded-full">
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
      <main className="max-w-[95vw] mx-auto px-4 py-3">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Control Panel - Left Column */}
          <div className="lg:col-span-1 space-y-2 print:hidden">
            {/* Settings Tabs */}
            <Card>
              <Tabs defaultValue="pitch" className="w-full">
                <CardHeader className="py-2 px-4 pb-0">
                  <TabsList className="grid w-full grid-cols-3 h-auto">
                    <TabsTrigger value="pitch" className="text-xs py-1.5">Pitch</TabsTrigger>
                    <TabsTrigger value="time-tempo" className="text-xs py-1.5">Time & Tempo</TabsTrigger>
                    <TabsTrigger value="note-values" className="text-xs py-1.5">Note Values</TabsTrigger>
                  </TabsList>
                  <TabsList className="grid w-full grid-cols-2 h-auto mt-1">
                    <TabsTrigger value="ensemble" className="text-xs py-1.5">Ensemble</TabsTrigger>
                    <TabsTrigger value="sound" className="text-xs py-1.5">Sound</TabsTrigger>
                  </TabsList>
                </CardHeader>
                <CardContent className="px-4 pb-3 pt-2">
                  <TabsContent value="pitch" className="space-y-3 mt-0">
                    <KeySignatureSelector
                      value={sightReadingSettings.keySignature}
                      onChange={(value) => updateSightReadingSetting('keySignature', value as any)}
                    />
                    <MelodicDifficultySelector
                      value={sightReadingSettings.melodicDifficulty}
                      onChange={(value) => updateSightReadingSetting('melodicDifficulty', value)}
                    />
                    <TonicGravitySlider
                      value={sightReadingSettings.tonicGravity}
                      onChange={(value) => updateSightReadingSetting('tonicGravity', value)}
                    />
                    <NoteRangeSelector
                      clef={settings.clef}
                      selectedNotes={sightReadingSettings.allowedPitches}
                      onNotesChange={(notes) => updateSightReadingSetting('allowedPitches', notes)}
                    />
                  </TabsContent>
                  <TabsContent value="time-tempo" className="space-y-3 mt-0">
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
                  </TabsContent>
                  <TabsContent value="note-values" className="space-y-3 mt-0">
                    <NoteValueSelector
                      selectedValues={settings.allowedNoteValues}
                      selectedRestValues={settings.allowedRestValues}
                      restProbability={settings.restProbability}
                      onNoteValuesChange={(values) => updateSetting('allowedNoteValues', values)}
                      onRestValuesChange={(values) => updateSetting('allowedRestValues', values)}
                      onRestProbabilityChange={(value) => updateSetting('restProbability', value)}
                    />
                  </TabsContent>
                  <TabsContent value="ensemble" className="space-y-3 mt-0">
                    <EnsembleModeSelector
                      mode={settings.ensembleMode}
                      partCount={settings.partCount}
                      onModeChange={(mode) => updateSetting('ensembleMode', mode)}
                      onPartCountChange={(count) => updateSetting('partCount', count)}
                    />
                  </TabsContent>
                  <TabsContent value="sound" className="space-y-3 mt-0">
                    <SoundSelector
                      value={settings.sound}
                      onChange={(value) => updateSetting('sound', value)}
                    />
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </div>

          {/* Display & Playback - Right Column */}
          <div className="lg:col-span-2 space-y-2 print:col-span-3">
            {/* Notation Display */}
            <Card className="print-pattern print:border-0 print:shadow-none">
              <CardHeader className="py-2 px-4 print:hidden">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <CardTitle className="text-sm font-medium inline-block mr-3">
                      {settings.ensembleMode === 'single' ? 'Pattern' : 'Ensemble'}
                    </CardTitle>
                    <span className="text-xs text-gray-500">
                      {settings.timeSignature} | {settings.tempo} BPM | {settings.measureCount} measures
                      {settings.ensembleMode !== 'single' && ` | ${settings.partCount} parts`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Clef selector - only show when using 5-line staff */}
                    {settings.staffLineMode === 'full' && (
                      <ClefSelector
                        value={settings.clef}
                        onChange={(clef) => updateSetting('clef', clef)}
                      />
                    )}
                    {/* Staff line mode toggle */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateSetting('staffLineMode', settings.staffLineMode === 'single' ? 'full' : 'single')}
                      className="h-7 text-xs gap-1.5"
                      title={settings.staffLineMode === 'single' ? 'Single-line staff' : 'Full 5-line staff'}
                    >
                      <Music className="w-3.5 h-3.5" />
                      {settings.staffLineMode === 'single' ? '1 Line' : '5 Lines'}
                    </Button>
                    {/* Combined syllable selector for both pitch and rhythm syllables */}
                    <PitchSyllableSelector
                      value={sightReadingSettings.pitchSyllableSystem}
                      onChange={(system) => updateSightReadingSetting('pitchSyllableSystem', system)}
                      showLabel={false}
                      compact
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-3 pt-0">
                {settings.ensembleMode !== 'single' && ensemblePattern ? (
                  <EnsembleDisplay
                    ensemble={ensemblePattern}
                    countingSystem={settings.countingSystem}
                    staffLineMode={settings.staffLineMode}
                    clef={settings.clef}
                    currentPartIndex={playbackState.currentPartIndex}
                    currentEventIndex={playbackState.currentEventIndex}
                    isPlaying={playbackState.isPlaying}
                    onToggleMute={toggleEnsemblePartMute}
                    onToggleSolo={toggleEnsemblePartSolo}
                    onRegeneratePart={regenerateEnsemblePart}
                    onChangePartSound={updateEnsemblePartSound}
                  />
                ) : patternWithSyllables ? (
                  <StaffNotation
                    pattern={patternWithSyllables}
                    currentEventIndex={playbackState.currentEventIndex}
                    isPlaying={playbackState.isPlaying}
                    showSyllables={sightReadingSettings.pitchSyllableSystem !== 'none'}
                    countingSystem={settings.countingSystem}
                    staffLineMode={settings.staffLineMode}
                    clef={settings.clef}
                    keySignature={settings.staffLineMode === 'full' ? vexflowKeySignature : undefined}
                    pitchSyllableSystem={sightReadingSettings.pitchSyllableSystem}
                    keySignatureForSolfege={sightReadingSettings.keySignature}
                  />
                ) : (
                  <div className="flex items-center justify-center h-32 text-gray-400">
                    Click "Regenerate" to create a pattern
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Playback Controls */}
            <Card className="print:hidden">
              <CardHeader className="py-2 px-4">
                <CardTitle className="text-sm font-medium">Playback</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-3 pt-0">
                <PlaybackControls
                  playbackState={playbackState}
                  isReady={isReady}
                  hasPattern={!!pattern}
                  loopEnabled={settings.loopEnabled}
                  countInMeasures={settings.countInMeasures}
                  metronomeEnabled={settings.metronomeEnabled}
                  volume={volume}
                  tempo={settings.tempo}
                  measureCount={pattern?.measures.length ?? settings.measureCount}
                  startMeasure={startMeasure}
                  onPlay={play}
                  onStop={stop}
                  onPause={pause}
                  onResume={resume}
                  onLoopChange={(enabled) => updateSetting('loopEnabled', enabled)}
                  onCountInChange={(measures) => updateSetting('countInMeasures', measures)}
                  onMetronomeChange={(enabled) => updateSetting('metronomeEnabled', enabled)}
                  onVolumeChange={setVolume}
                  onStartMeasureChange={setStartMeasure}
                  onPlayMetronome={playMetronome}
                  onStopMetronome={stopMetronome}
                />
              </CardContent>
            </Card>

            {/* Worksheet Export */}
            <Card className="print:hidden">
              <CardHeader className="py-2 px-4">
                <CardTitle className="text-sm font-medium">Worksheet Export</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-3 pt-0">
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
