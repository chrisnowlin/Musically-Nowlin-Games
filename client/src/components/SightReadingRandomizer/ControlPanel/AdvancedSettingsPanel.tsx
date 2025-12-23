/**
 * Advanced Settings Panel Component
 * Slide-in panel with detailed settings (time, tempo, note values, etc.)
 */

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { TimeSignatureSelector } from './TimeSignatureSelector';
import { TempoControl } from './TempoControl';
import { NoteValueSelector } from './NoteValueSelector';
import { MeasureCountSelector } from './MeasureCountSelector';
import { SoundSelector } from './SoundSelector';
import { EnsembleModeSelector } from './EnsembleModeSelector';
import { NoteRangeSelector } from './NoteRangeSelector';
import { TonicGravitySlider } from './TonicGravitySlider';
import { RhythmSettings, NoteValue, RestValue, SoundOption, EnsembleMode } from '@/lib/rhythmRandomizer/types';

interface AdvancedSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;

  // Rhythm settings
  timeSignature: string;
  onTimeSignatureChange: (value: string) => void;
  tempo: number;
  onTempoChange: (value: number) => void;
  measureCount: RhythmSettings['measureCount'];
  onMeasureCountChange: (value: RhythmSettings['measureCount']) => void;
  allowedNoteValues: NoteValue[];
  onNoteValuesChange: (values: NoteValue[]) => void;
  allowedRestValues: RestValue[];
  onRestValuesChange: (values: RestValue[]) => void;
  restProbability: number;
  onRestProbabilityChange: (value: number) => void;
  sound: SoundOption;
  onSoundChange: (value: SoundOption) => void;
  ensembleMode: EnsembleMode;
  partCount: RhythmSettings['partCount'];
  onEnsembleModeChange: (mode: EnsembleMode) => void;
  onPartCountChange: (count: RhythmSettings['partCount']) => void;

  // Sight reading settings
  clef: 'treble' | 'bass';
  selectedNotes: string[];
  onNotesChange: (notes: string[]) => void;
  tonicGravity: number;
  onTonicGravityChange: (value: number) => void;
}

export function AdvancedSettingsPanel({
  isOpen,
  onClose,

  timeSignature,
  onTimeSignatureChange,
  tempo,
  onTempoChange,
  measureCount,
  onMeasureCountChange,
  allowedNoteValues,
  onNoteValuesChange,
  allowedRestValues,
  onRestValuesChange,
  restProbability,
  onRestProbabilityChange,
  sound,
  onSoundChange,
  ensembleMode,
  partCount,
  onEnsembleModeChange,
  onPartCountChange,

  clef,
  selectedNotes,
  onNotesChange,
  tonicGravity,
  onTonicGravityChange,
}: AdvancedSettingsPanelProps) {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      {/* Slide-in Panel */}
      <div
        className={`
          fixed right-0 top-0 h-full w-[35%] min-w-[320px] max-w-[500px]
          bg-white shadow-2xl z-50 transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Advanced Settings</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <Tabs defaultValue="time" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-auto">
              <TabsTrigger value="time" className="text-xs py-1.5">Time & Tempo</TabsTrigger>
              <TabsTrigger value="note-values" className="text-xs py-1.5">Note Values</TabsTrigger>
              <TabsTrigger value="pitch" className="text-xs py-1.5">Pitch & Sound</TabsTrigger>
            </TabsList>

            <TabsContent value="time" className="space-y-4 mt-4">
              <TimeSignatureSelector
                value={timeSignature}
                onChange={onTimeSignatureChange}
              />
              <TempoControl
                value={tempo}
                onChange={onTempoChange}
              />
              <MeasureCountSelector
                value={measureCount}
                onChange={onMeasureCountChange}
              />
            </TabsContent>

            <TabsContent value="note-values" className="space-y-4 mt-4">
              <NoteValueSelector
                selectedValues={allowedNoteValues}
                selectedRestValues={allowedRestValues}
                restProbability={restProbability}
                onNoteValuesChange={onNoteValuesChange}
                onRestValuesChange={onRestValuesChange}
                onRestProbabilityChange={onRestProbabilityChange}
              />
            </TabsContent>

            <TabsContent value="pitch" className="space-y-4 mt-4">
              <SoundSelector
                value={sound}
                onChange={onSoundChange}
              />
              <EnsembleModeSelector
                mode={ensembleMode}
                partCount={partCount}
                onModeChange={onEnsembleModeChange}
                onPartCountChange={onPartCountChange}
              />
              <NoteRangeSelector
                clef={clef}
                selectedNotes={selectedNotes}
                onNotesChange={onNotesChange}
              />
              <TonicGravitySlider
                value={tonicGravity}
                onChange={onTonicGravityChange}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <Button onClick={onClose} className="w-full">
            Done
          </Button>
        </div>
      </div>
    </>
  );
}
