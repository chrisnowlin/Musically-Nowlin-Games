/**
 * Rhythm Randomizer V2 Tool
 * Main container component for the rhythm generation tool - Redesigned UI
 * Based on Sight Reading Randomizer layout patterns
 */

import { useEffect, useMemo, useState, useRef } from 'react';
import { Link } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useRhythmRandomizerV2 } from '@/hooks/useRhythmRandomizerV2';
import { addSyllablesToPattern } from '@/lib/rhythmRandomizerV2/countingSyllables';
import { DifficultyPreset, CountingSystem } from '@/lib/rhythmRandomizerV2/types';

// UI Components
import { AdvancedSettingsPanel } from './ControlPanel/AdvancedSettingsPanel';
import { FloatingPlaybackOverlay } from './ControlPanel/FloatingPlaybackOverlay';
import { ActionsMenu } from './Actions/ActionsMenu';

// Display Components
import { StaffNotation } from './Display/StaffNotation';
import { EnsembleDisplay } from './Display/EnsembleDisplay';

// Utils
import { loadSettingsFromUrl, updateUrlWithSettings } from '@/lib/rhythmRandomizerV2/shareUtils';
import { RHYTHM_PRESETS } from './ControlPanel/presets';

type MeasureCountOption = 1 | 2 | 4 | 8 | 12 | 16;

export function RhythmRandomizerV2Tool() {
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
  } = useRhythmRandomizerV2();

  // Track if initial load is complete
  const initialLoadComplete = useRef(false);

  // Load settings from URL on mount and generate initial pattern
  useEffect(() => {
    const urlSettings = loadSettingsFromUrl();
    if (Object.keys(urlSettings).length > 0) {
      updateSettings(urlSettings);
    }
    generate();
    initialLoadComplete.current = true;
  }, []);

  // Regenerate when measure count changes (after initial load)
  useEffect(() => {
    if (initialLoadComplete.current) {
      generate();
    }
  }, [settings.measureCount]);

  // Update URL when settings change (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateUrlWithSettings(settings);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [settings]);

  // Handle preset selection
  const handlePresetSelect = (preset: DifficultyPreset) => {
    const presetConfig = RHYTHM_PRESETS[preset];
    if (presetConfig.settings) {
      updateSettings(presetConfig.settings);
    }
    generate();
  };

  // Add syllables to pattern based on current counting system
  const patternWithSyllables = useMemo(() => {
    if (!pattern) return null;
    return addSyllablesToPattern(pattern, settings.countingSystem);
  }, [pattern, settings.countingSystem]);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 overflow-hidden">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-purple-100 shrink-0 print:hidden">
        <div className="max-w-[95vw] mx-auto px-4 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/games">
              <Button variant="ghost" size="sm" className="gap-1.5 h-7">
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-base font-bold text-purple-800">Rhythm Randomizer V2</h1>
              <span className="text-[10px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full inline-block">
                For Educators
              </span>
            </div>
          </div>
          <ActionsMenu settings={settings} />
        </div>
      </header>

      {/* Main Content - Hero Notation (fills remaining space, with bottom padding for fixed overlay) */}
      <main className="flex-1 min-h-0 px-4 pt-2 pb-16">
        <Card className="print-pattern print:border-0 print:shadow-none h-full flex flex-col">
          <CardHeader className="py-1.5 px-3 print:hidden shrink-0">
            <span className="text-xs text-gray-500">
              {settings.timeSignature} | {settings.tempo} BPM | {settings.measureCount} measures
              {settings.ensembleMode !== 'single' && ` | ${settings.partCount} parts (${settings.ensembleMode})`}
            </span>
          </CardHeader>
          <CardContent className="px-3 pb-2 pt-0 flex-1 min-h-0 overflow-hidden">
            <div ref={notationContainerRef} className="w-full h-full">
              {settings.ensembleMode !== 'single' && ensemblePattern ? (
                <EnsembleDisplay
                  ensemble={ensemblePattern}
                  countingSystem={settings.countingSystem}
                  staffLineMode={settings.staffLineMode}
                  stemDirection={settings.stemDirection}
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
                  showSyllables={settings.countingSystem !== 'none'}
                  countingSystem={settings.countingSystem}
                  staffLineMode={settings.staffLineMode}
                  stemDirection={settings.stemDirection}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  Click "New" to create a rhythm
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
        selectedMeasureCount={settings.measureCount as MeasureCountOption}
        countingSystem={settings.countingSystem}
        staffLineMode={settings.staffLineMode}
        stemDirection={settings.stemDirection}
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
        onMeasureCountChange={(count) => updateSetting('measureCount', count)}
        onCountingSystemChange={(system) => updateSetting('countingSystem', system)}
        onStaffLineModeChange={(mode) => updateSetting('staffLineMode', mode)}
        onStemDirectionChange={(direction) => updateSetting('stemDirection', direction)}
        onRegenerate={generate}
        onPresetSelect={handlePresetSelect}
        onToggleAdvanced={() => setAdvancedPanelOpen(true)}
      />

      {/* Advanced Settings Panel */}
      <AdvancedSettingsPanel
        isOpen={advancedPanelOpen}
        onClose={() => setAdvancedPanelOpen(false)}
        timeSignature={settings.timeSignature}
        onTimeSignatureChange={(value) => updateSetting('timeSignature', value)}
        tempo={settings.tempo}
        onTempoChange={(value) => updateSetting('tempo', value)}
        allowedNoteValues={settings.allowedNoteValues}
        onNoteValuesChange={(values) => updateSetting('allowedNoteValues', values)}
        allowedRestValues={settings.allowedRestValues}
        onRestValuesChange={(values) => updateSetting('allowedRestValues', values)}
        restProbability={settings.restProbability}
        onRestProbabilityChange={(value) => updateSetting('restProbability', value)}
        sound={settings.sound}
        onSoundChange={(value) => updateSetting('sound', value)}
        ensembleMode={settings.ensembleMode}
        onEnsembleModeChange={(mode) => updateSetting('ensembleMode', mode)}
        partCount={settings.partCount}
        onPartCountChange={(count) => updateSetting('partCount', count)}
      />
    </div>
  );
}
