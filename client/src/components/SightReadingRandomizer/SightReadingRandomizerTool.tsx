/**
 * Sight Reading Randomizer Tool
 * Main container component for the sight reading generation tool - Redesigned UI
 */

import { useEffect, useMemo, useState, useRef } from 'react';
import { Link } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSightReadingRandomizer } from '@/hooks/useSightReadingRandomizer';
import { addSyllablesToPattern } from '@/lib/rhythmRandomizer/countingSyllables';
import { DifficultyPreset } from '@/lib/rhythmRandomizer/types';

// New UI Components
import { TopActionBar } from './ControlPanel/TopActionBar';
import { AdvancedSettingsPanel } from './ControlPanel/AdvancedSettingsPanel';
import { FloatingPlaybackOverlay } from './ControlPanel/FloatingPlaybackOverlay';
import { ActionsMenu } from './Actions/ActionsMenu';

// Display Components
import { StaffNotation } from './Display/StaffNotation';
import { PitchSyllableSelector } from './Display/PitchSyllableSelector';
import { EnsembleDisplay } from './Display/EnsembleDisplay';

// Load settings from URL
import { loadSettingsFromUrl, updateUrlWithSettings } from '@/lib/rhythmRandomizer/shareUtils';
import { SIGHT_READING_PRESETS } from './ControlPanel/presets';

export function SightReadingRandomizerTool() {
  const [advancedPanelOpen, setAdvancedPanelOpen] = useState(false);
  const notationContainerRef = useRef<HTMLDivElement>(null);

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

  // Handle preset selection
  const handlePresetSelect = (preset: DifficultyPreset) => {
    const presetConfig = SIGHT_READING_PRESETS[preset];
    if (presetConfig.rhythm) {
      updateSettings(presetConfig.rhythm);
    }
    if (presetConfig.sightReading) {
      Object.entries(presetConfig.sightReading).forEach(([key, value]) => {
        updateSightReadingSetting(key as any, value);
      });
    }
    generate();
  };

  // Add syllables to pattern based on current counting system
  const patternWithSyllables = useMemo(() => {
    if (!pattern) return null;
    return addSyllablesToPattern(pattern, settings.countingSystem);
  }, [pattern, settings.countingSystem]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-amber-100 sticky top-0 z-20 print:hidden">
        <div className="max-w-[95vw] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/games">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-amber-800">Sight Reading Randomizer</h1>
              <span className="text-xs bg-amber-100 text-amber-600 px-2 py-1 rounded-full inline-block mt-1">
                For Educators
              </span>
            </div>
          </div>
          <ActionsMenu settings={settings} />
        </div>
      </header>

      {/* Top Action Bar */}
      <TopActionBar
        onPresetSelect={handlePresetSelect}
        onRegenerate={generate}
        onToggleAdvanced={() => setAdvancedPanelOpen(true)}
        keySignature={sightReadingSettings.keySignature}
        onKeySignatureChange={(value) => updateSightReadingSetting('keySignature', value as any)}
        clef={settings.clef}
        onClefChange={(clef) => updateSetting('clef', clef)}
        melodicDifficulty={sightReadingSettings.melodicDifficulty}
        onMelodicDifficultyChange={(value) => updateSightReadingSetting('melodicDifficulty', value)}
      />

      {/* Main Content - Hero Notation */}
      <main className="max-w-[95vw] mx-auto px-4 py-4 pb-32">
        <Card className="print-pattern print:border-0 print:shadow-none">
          <CardHeader className="py-3 px-4 print:hidden">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <CardTitle className="text-base font-medium inline-block mr-3">
                  {settings.ensembleMode === 'single' ? 'Sight Reading Exercise' : 'Ensemble'}
                </CardTitle>
                <span className="text-xs text-gray-500">
                  {settings.timeSignature} | {settings.tempo} BPM | {settings.measureCount} measures
                  {settings.ensembleMode !== 'single' && ` | ${settings.partCount} parts`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <PitchSyllableSelector
                  value={sightReadingSettings.pitchSyllableSystem}
                  onChange={(system) => updateSightReadingSetting('pitchSyllableSystem', system)}
                  showLabel={false}
                  compact
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div ref={notationContainerRef} className="w-full">
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
                <div className="flex items-center justify-center h-48 text-gray-400">
                  Click "Regenerate" to create a pattern
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Floating Playback Overlay */}
      <FloatingPlaybackOverlay
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
        staffLineMode={settings.staffLineMode}
        onStaffLineModeChange={(mode) => updateSetting('staffLineMode', mode)}
        pitchSyllableSystem={sightReadingSettings.pitchSyllableSystem}
        onPitchSyllableSystemChange={(system) => updateSightReadingSetting('pitchSyllableSystem', system as any)}
      />

      {/* Advanced Settings Panel */}
      <AdvancedSettingsPanel
        isOpen={advancedPanelOpen}
        onClose={() => setAdvancedPanelOpen(false)}
        timeSignature={settings.timeSignature}
        onTimeSignatureChange={(value) => updateSetting('timeSignature', value)}
        tempo={settings.tempo}
        onTempoChange={(value) => updateSetting('tempo', value)}
        measureCount={settings.measureCount}
        onMeasureCountChange={(value) => updateSetting('measureCount', value)}
        allowedNoteValues={settings.allowedNoteValues}
        onNoteValuesChange={(values) => updateSetting('allowedNoteValues', values)}
        allowedRestValues={settings.allowedRestValues}
        onRestValuesChange={(values) => updateSetting('allowedRestValues', values)}
        restProbability={settings.restProbability}
        onRestProbabilityChange={(value) => updateSetting('restProbability', value)}
        sound={settings.sound}
        onSoundChange={(value) => updateSetting('sound', value)}
        ensembleMode={settings.ensembleMode}
        partCount={settings.partCount}
        onEnsembleModeChange={(mode) => updateSetting('ensembleMode', mode)}
        onPartCountChange={(count) => updateSetting('partCount', count)}
        clef={settings.clef}
        selectedNotes={sightReadingSettings.allowedPitches}
        onNotesChange={(notes) => updateSightReadingSetting('allowedPitches', notes)}
        tonicGravity={sightReadingSettings.tonicGravity}
        onTonicGravityChange={(value) => updateSightReadingSetting('tonicGravity', value)}
      />
    </div>
  );
}
