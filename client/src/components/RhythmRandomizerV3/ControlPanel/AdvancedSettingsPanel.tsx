/**
 * Advanced Settings Panel Component
 * Slide-in panel with detailed rhythm settings (time, tempo, note values, sound)
 */

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { TimeSignatureSelector } from './TimeSignatureSelector';
import { TempoControl } from './TempoControl';
import { NoteValueSelector } from './NoteValueSelector';
import { SoundSelector } from './SoundSelector';
import { NoteValue, RestValue, SoundOption } from '@/lib/rhythmRandomizerV3/types';

interface AdvancedSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;

  // Time & Tempo settings
  timeSignature: string;
  onTimeSignatureChange: (value: string) => void;
  tempo: number;
  onTempoChange: (value: number) => void;

  // Note value settings
  allowedNoteValues: NoteValue[];
  onNoteValuesChange: (values: NoteValue[]) => void;
  allowedRestValues: RestValue[];
  onRestValuesChange: (values: RestValue[]) => void;
  restProbability: number;
  onRestProbabilityChange: (value: number) => void;

  // Sound settings
  sound: SoundOption;
  onSoundChange: (value: SoundOption) => void;
}

export function AdvancedSettingsPanel({
  isOpen,
  onClose,

  timeSignature,
  onTimeSignatureChange,
  tempo,
  onTempoChange,

  allowedNoteValues,
  onNoteValuesChange,
  allowedRestValues,
  onRestValuesChange,
  restProbability,
  onRestProbabilityChange,

  sound,
  onSoundChange,
}: AdvancedSettingsPanelProps) {
  // Handle Escape key to close panel
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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
        <div className="flex-1 overflow-y-auto px-6 py-4 h-[calc(100%-140px)]">
          <Tabs defaultValue="time" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-auto">
              <TabsTrigger value="time" className="text-xs py-1.5">Time & Tempo</TabsTrigger>
              <TabsTrigger value="note-values" className="text-xs py-1.5">Note Values</TabsTrigger>
              <TabsTrigger value="sound" className="text-xs py-1.5">Sound</TabsTrigger>
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

            <TabsContent value="sound" className="space-y-4 mt-4">
              <SoundSelector
                value={sound}
                onChange={onSoundChange}
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
